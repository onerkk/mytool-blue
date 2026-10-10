'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const vm = require('node:vm');
const os = require('node:os');
const { spawnSync } = require('node:child_process');

const html = fs.readFileSync(process.env.JY_UPDATER_TEST_HTML || path.join(__dirname, '..', 'admin', 'update.html'), 'utf8');
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
assert.equal(scripts.length, 2, 'updater inline scripts');
const csp = html.match(/script-src ([^;]+);/);
assert.ok(csp);
for (const source of scripts) {
  const hash = 'sha256-' + crypto.createHash('sha256').update(source).digest('base64');
  assert.ok(csp[1].includes("'" + hash + "'"), 'CSP hash must match inline JavaScript');
}

const sandbox = {
  module: { exports: {} }, TextEncoder, TextDecoder, Uint32Array, Uint8Array,
  AbortController, DOMException, crypto: crypto.webcrypto, setTimeout, clearTimeout,
  ReadableStream, DecompressionStream,
  btoa: value => Buffer.from(value, 'binary').toString('base64')
};
sandbox.globalThis = sandbox;
vm.runInNewContext(scripts[0], sandbox, { filename: 'admin/update.html' });
const updater = sandbox.module.exports;
const sha = source => crypto.createHash('sha1').update('blob ' + source.length + '\0').update(source).digest('hex');
const fakeSHA = letter => letter.repeat(40);
const HEAD = fakeSHA('a'), NEW = fakeSHA('d');
const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
const gitDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'jy-updater-git-'));
assert.equal(spawnSync('git', ['init', '-q', gitDirectory]).status, 0);
function treeOf(files) {
  const root = new Map();
  for (const file of files) {
    const parts = file.path.split('/'), name = parts.pop(); let directory = root;
    for (const part of parts) {
      if (!directory.has(part)) directory.set(part, new Map());
      directory = directory.get(part); assert(directory instanceof Map);
    }
    directory.set(name, file);
  }
  const entries = [];
  function write(directory, prefix = '') {
    const records = [];
    for (const [name, value] of directory) {
      const full = prefix + name;
      const entry = value instanceof Map ? { path: full, mode: '040000', type: 'tree', sha: write(value, full + '/') } : value;
      entries.push(entry); records.push(entry.mode + ' ' + entry.type + ' ' + entry.sha + '\t' + name + '\0');
    }
    // The real Git executable supplies independent sorting and serialization.
    const result = spawnSync('git', ['mktree', '--missing', '-z'], { cwd: gitDirectory, input: Buffer.from(records.join('')), encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr);
    return result.stdout.trim();
  }
  return { sha: write(root), entries };
}
const baseFiles = [
  { path: 'index.html', mode: '100644', type: 'blob', sha: sha(Buffer.from('original home')) },
  { path: 'JS/keep.js', mode: '100755', type: 'blob', sha: sha(Buffer.from('existing executable')) },
  { path: 'assets/old.webp', mode: '100644', type: 'blob', sha: sha(Buffer.from('original image')) },
  { path: 'saved/link', mode: '120000', type: 'blob', sha: sha(Buffer.from('../index.html')) },
  { path: 'vendor/module', mode: '160000', type: 'commit', sha: fakeSHA('f') },
  { path: 'foo.bar', mode: '100644', type: 'blob', sha: fakeSHA('1') },
  { path: 'foo/item', mode: '100644', type: 'blob', sha: fakeSHA('2') },
  { path: '牌面/說明.txt', mode: '100644', type: 'blob', sha: fakeSHA('3') },
  { path: 'emoji/🌕.txt', mode: '100644', type: 'blob', sha: fakeSHA('4') }
];
const baseSnapshot = treeOf(baseFiles), BASE = baseSnapshot.sha;

function storedZip(name, data) {
  const nameBytes = Buffer.from(name);
  const bytes = Buffer.from(data), crc = updater.crc32(bytes);
  const local = Buffer.alloc(30 + nameBytes.length + bytes.length);
  local.writeUInt32LE(0x04034b50, 0);
  local.writeUInt32LE(crc, 14);
  local.writeUInt32LE(bytes.length, 18);
  local.writeUInt32LE(bytes.length, 22);
  local.writeUInt16LE(nameBytes.length, 26);
  nameBytes.copy(local, 30); bytes.copy(local, 30 + nameBytes.length);
  const directory = Buffer.alloc(46 + nameBytes.length);
  directory.writeUInt32LE(0x02014b50, 0);
  directory.writeUInt32LE(crc, 16);
  directory.writeUInt32LE(bytes.length, 20);
  directory.writeUInt32LE(bytes.length, 24);
  directory.writeUInt16LE(nameBytes.length, 28);
  nameBytes.copy(directory, 46);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(1, 8);
  end.writeUInt16LE(1, 10);
  end.writeUInt32LE(directory.length, 12);
  end.writeUInt32LE(local.length, 16);
  return new Blob([local, directory, end]);
}

async function planOf(files) {
  const changes = [];
  for (const [name, bytes] of files) {
    const raw = Uint8Array.from(bytes);
    changes.push({ entry: { path: name, bytes: raw }, sha: await updater.gitSha(raw), mode: '100644' });
  }
  return { repository: 'onerkk/mytool-blue', branch: 'master', head: HEAD, tree: BASE, entries: baseSnapshot.entries,
    zip: { read: async entry => entry.bytes }, changes };
}

async function publishArchive(zip, label) {
  let branch = HEAD, snapshot = baseSnapshot, patches = 0, commitMade = false;
  const stored = new Map(baseFiles.map(file => [file.path, file]));
  const client = new updater.GitHub({ token: 'ok_token', fetcher: async (url, init) => {
    const pathname = new URL(url).pathname.replace('/repos/onerkk/mytool-blue', '');
    const body = init.body ? JSON.parse(init.body) : null;
    if (pathname === '/git/ref/heads/master') return json({ object: { sha: branch } });
    if (pathname === '/git/commits/' + HEAD) return json({ sha: HEAD, tree: { sha: BASE } });
    if (pathname === '/git/trees/' + BASE) return json({ sha: BASE, truncated: false, tree: baseSnapshot.entries });
    if (pathname.startsWith('/git/trees/')) return json({ message: 'Invalid object requested. SHA must identify a commit or a tree.' }, 422);
    if (pathname === '/git/blobs') return json({ sha: sha(Buffer.from(body.content, 'base64')) }, 201);
    if (pathname === '/git/trees') {
      assert.equal(body.base_tree, snapshot.sha); assert(body.tree.length <= 40);
      for (const file of body.tree) stored.set(file.path, { path: file.path, mode: file.mode, type: file.type, sha: file.sha || sha(Buffer.from(file.content)) });
      snapshot = treeOf([...stored.values()]); return json({ sha: snapshot.sha }, 201);
    }
    if (pathname === '/git/commits') {
      assert.equal(body.tree, snapshot.sha); assert.deepEqual(body.parents, [HEAD]); commitMade = true;
      return json({ sha: NEW, tree: { sha: snapshot.sha }, parents: [{ sha: HEAD }] }, 201);
    }
    if (pathname === '/git/refs/heads/master') {
      assert(commitMade); assert.deepEqual(body, { sha: NEW, force: false }); patches++; branch = NEW;
      return json({ object: { sha: NEW } });
    }
    throw Error('Unexpected archive API request: ' + init.method + ' ' + pathname);
  } });
  const plan = await client.prepare(zip), receipt = await client.publish(plan);
  assert.equal(receipt.sha, NEW); assert.equal(patches, 1); assert.equal(receipt.files.length, plan.changes.length);
  const changedPaths = new Set(plan.changes.map(file => file.entry.path));
  for (const file of baseFiles) if (!changedPaths.has(file.path)) assert.deepEqual(stored.get(file.path), file);
  console.log(label + ': verified and published ' + receipt.files.length + ' changed files to mock GitHub; original files retained.');
}

async function run() {
  const zip = await updater.openZip(storedZip('mytool-blue-master/JS/a.js', Buffer.from('hello\n')));
  assert.equal(zip.prefix, 'mytool-blue-master/');
  assert.equal(zip.files.length, 1);
  assert.equal(Buffer.from(await zip.read(zip.files[0])).toString(), 'hello\n');
  assert.equal(zip.files.map(e => e.path).join(','), 'JS/a.js');

  for (const pathname of ['/git/ref/heads/master', '/git/blobs', '/git/trees', '/git/commits', '/git/refs/heads/master']) {
    const method = pathname.includes('/refs/') ? 'PATCH' : pathname.includes('/ref/') ? 'GET' : 'POST';
    const client = new updater.GitHub({ token: 'TOKEN_HIDE_123', fetcher: async () => json({
      message: 'Validation Failed TOKEN_HIDE_123',
      errors: [{ resource: 'Tree', field: 'tree', code: 'invalid', message: 'bad tree' }]
    }, 422) });
    await assert.rejects(client.request(pathname, { method }), error => {
      assert.equal(error.status, 422);
      assert.match(error.message, /GitHub HTTP 422/);
      assert.match(error.message, /Tree · tree · invalid · bad tree/);
      assert.doesNotMatch(error.message, /TOKEN_HIDE_123|分支已有新提交|受保護|重新檢查/);
      assert.ok(error.step && error.message.startsWith(error.step));
      return true;
    });
  }
  const secondToken = 'github_pat_ABCDEFGHIJ01234567890';
  const redacted = new updater.GitHub({ token: 'ok_token', fetcher: async () => json({ message: 'fail ' + secondToken }, 422) });
  await assert.rejects(redacted.request('/git/blobs', { method: 'POST' }), error => {
    assert.doesNotMatch(error.message, /github_pat_ABCDEFGHIJ/);
    return true;
  });

  // 83 text files must use a handful of chained trees, preserving each blob SHA.
  const files = Array.from({ length: 83 }, (_, i) => ['JS/part-' + i + '.js', Buffer.from('const n=' + i + ';\n')]);
  files.push(['assets/audio/chime.ogg', Buffer.from([0, 255, 1, 0, 204])]);
  files.push(['JS/with-bom.js', Buffer.from([0xef, 0xbb, 0xbf, 97])]);
  files.push(['JS/too-big.js', Buffer.from('a'.repeat(300 * 1024))]);
  const plan = await planOf(files);
  let branch = HEAD, treeId = BASE, lastTree = BASE, treeCalls = 0, blobCalls = 0, patchCalls = 0;
  const stored = new Map(baseFiles.map(file => [file.path, file])), treePayloads = [], history = [];
  const client = new updater.GitHub({ token: 'ok_token', fetcher: async (url, init) => {
    const pathname = new URL(url).pathname.replace('/repos/onerkk/mytool-blue', '');
    history.push([init.method, pathname]);
    if (pathname === '/git/ref/heads/master' && init.method === 'GET') return json({ object: { sha: branch } });
    if (pathname === '/git/blobs' && init.method === 'POST') {
      blobCalls++;
      const body = JSON.parse(init.body);
      return json({ sha: sha(Buffer.from(body.content, 'base64')) }, 201);
    }
    if (pathname === '/git/trees' && init.method === 'POST') {
      const body = JSON.parse(init.body);
      assert.equal(body.base_tree, lastTree, 'tree batches must share an exact ancestry');
      assert.ok(Buffer.byteLength(init.body) < 512 * 1024 + 200, 'tree body must remain bounded');
      assert.ok(body.tree.length <= 40);
      for (const entry of body.tree) {
        assert.ok('sha' in entry !== 'content' in entry, 'GitHub accepts content OR sha');
        stored.set(entry.path, { path: entry.path, mode: entry.mode, type: entry.type, sha: 'sha' in entry ? entry.sha : sha(Buffer.from(entry.content)) });
      }
      treePayloads.push(body.tree);
      treeCalls++;
      treeId = treeOf([...stored.values()]).sha;
      lastTree = treeId;
      return json({ sha: treeId }, 201);
    }
    if (pathname === '/git/trees/' + treeId && init.method === 'GET') {
      assert.equal(new URL(url).searchParams.get('recursive'), '1');
      return json({ message: 'Invalid object requested. SHA must identify a commit or a tree.' }, 422);
    }
    if (pathname === '/git/commits' && init.method === 'POST') {
      const body = JSON.parse(init.body);
      assert.equal(body.tree, lastTree);
      assert.deepEqual(body.parents, [HEAD]);
      return json({ sha: NEW, tree: { sha: lastTree }, parents: [{ sha: HEAD }] }, 201);
    }
    if (pathname === '/git/refs/heads/master' && init.method === 'PATCH') {
      patchCalls++;
      const body = JSON.parse(init.body);
      assert.deepEqual(body, { sha: NEW, force: false });
      branch = NEW;
      return json({ object: { sha: branch } });
    }
    throw Error('Unexpected mock API request: ' + init.method + ' ' + pathname);
  } });
  const receipt = await client.publish(plan);
  assert.equal(blobCalls, 3, 'binary, BOM, and oversized text require separate blobs');
  assert.equal(treeCalls, 3, '86 changed files should use three small tree batches');
  assert.equal(patchCalls, 1);
  assert.equal(receipt.sha, NEW);
  assert.equal(receipt.files.length, plan.changes.length);
  assert.equal(treePayloads.flat().filter(e => 'content' in e).length, 83);
  assert.equal(history.filter(([method, pathname]) => method === 'POST' && pathname === '/git/commits').length, 1);
  assert.equal(history.filter(([method, pathname]) => method === 'GET' && pathname.startsWith('/git/trees/')).length, 0, 'uncommitted trees must never be read');
  for (const file of baseFiles) assert.deepEqual(stored.get(file.path), file, 'unchanged files, modes, links and submodules must remain');

  const oneFile = await planOf([['JS/a.js', Buffer.from('const a = 1;\n')]]);
  let lastEndpoint = '';
  const invalidTree = new updater.GitHub({ token: 'ok_token', fetcher: async (url, init) => {
    const pathname = new URL(url).pathname.replace('/repos/onerkk/mytool-blue', '');
    lastEndpoint = init.method + ' ' + pathname;
    if (pathname === '/git/ref/heads/master') return json({ object: { sha: HEAD } });
    if (pathname === '/git/trees' && init.method === 'POST') return json({ sha: NEW }, 201);
    throw Error('A mismatched tree must never be committed or published');
  } });
  await assert.rejects(invalidTree.publish(oneFile), /GitHub 建立的檔案目錄與本機計算不一致/);
  assert.equal(lastEndpoint, 'POST /git/trees');

  const newerHead = new updater.GitHub({ token: 'ok_token', fetcher: async (url, init) => {
    assert.equal(init.method, 'GET', 'stale HEAD must stop before any mutation');
    return json({ object: { sha: fakeSHA('e') } });
  } });
  await assert.rejects(newerHead.publish(oneFile), error => {
    assert.equal(error.branchChanged, true);
    assert.match(error.message, /已有其他人更新/);
    return true;
  });
  assert.ok(!html.includes('提交被拒絕；可能是分支已有新提交或受保護'), 'no misleading old 422 message');
  assert.equal(await updater.gitTreeSha([]), treeOf([]).sha, 'empty tree agrees with Git');
  const state = new updater.GitTreeState(baseSnapshot.entries);
  assert.equal(await state.hash(), BASE, 'complete baseline agrees with real Git');
  const edits = [
    { path: 'JS/keep.js', mode: '100755', type: 'blob', sha: sha(Buffer.from('new executable')) },
    { path: 'foo/new/新牌.webp', mode: '100644', type: 'blob', sha: sha(Buffer.from([0, 255, 3])) }
  ];
  for (const file of edits) state.apply(file.path, file.mode, file.sha);
  const updatedFiles = new Map(baseFiles.map(file => [file.path, file]));
  for (const file of edits) updatedFiles.set(file.path, file);
  assert.equal(await state.hash(), treeOf([...updatedFiles.values()]).sha, 'nested edits and Unicode sorting agree with Git');
  assert.equal(await state.hash(), treeOf([...updatedFiles.values()]).sha, 'repeated tree hash is stable');
  assert.throws(() => state.apply('saved/link', '100644', fakeSHA('5')), /不能用檔案覆蓋/);
  assert.throws(() => state.apply('index.html/sub.js', '100644', fakeSHA('5')), /路徑與現有檔案衝突/);
  assert.throws(() => new updater.GitTreeState([{ path: 'a/b', mode: '100644', type: 'blob', sha: fakeSHA('5') }]), /缺少父目錄/);

  const prepareClient = new updater.GitHub({ token: 'ok_token', fetcher: async url => {
    const pathname = new URL(url).pathname.replace('/repos/onerkk/mytool-blue', '');
    if (pathname === '/git/ref/heads/master') return json({ object: { sha: HEAD } });
    if (pathname === '/git/commits/' + HEAD) return json({ sha: HEAD, tree: { sha: BASE } });
    if (pathname === '/git/trees/' + BASE) return json({ sha: BASE, truncated: false, tree: baseSnapshot.entries });
    throw Error('Unexpected preparation endpoint: ' + pathname);
  } });
  const preparedZip = { files: [{ path: 'index.html', bytes: Buffer.from('original home') }, { path: 'new/a.js', bytes: Buffer.from('new') }], read: async entry => entry.bytes };
  const prepared = await prepareClient.prepare(preparedZip);
  assert.equal(prepared.unchanged, 1); assert.equal(prepared.changes.length, 1); assert.equal(prepared.changes[0].action, '新增');
  assert.equal(prepared.entries.length, baseSnapshot.entries.length);

  for (const field of ['tree', 'parent']) {
    let endpoint = '';
    const badCommit = new updater.GitHub({ token: 'ok_token', fetcher: async (url, init) => {
      const pathname = new URL(url).pathname.replace('/repos/onerkk/mytool-blue', ''); endpoint = init.method + ' ' + pathname;
      if (pathname === '/git/ref/heads/master') return json({ object: { sha: HEAD } });
      const expected = treeOf([...baseFiles, { path: 'JS/a.js', mode: '100644', type: 'blob', sha: oneFile.changes[0].sha }]).sha;
      if (pathname === '/git/trees') return json({ sha: expected }, 201);
      if (pathname === '/git/commits') return json({ sha: NEW, tree: { sha: field === 'tree' ? fakeSHA('6') : expected }, parents: [{ sha: field === 'parent' ? fakeSHA('7') : HEAD }] }, 201);
      throw Error('A mismatched commit must never update a branch');
    } });
    await assert.rejects(badCommit.publish(oneFile), /GitHub 提交內容與已驗證版本不一致/);
    assert.equal(endpoint, 'POST /git/commits');
  }
  for (const scenario of ['missing-original', 'raced-head', 'cancelled']) {
    let reads = 0; const mutations = [], controller = new AbortController();
    const changed = { path: 'JS/a.js', mode: '100644', type: 'blob', sha: oneFile.changes[0].sha };
    const expected = treeOf([...baseFiles, changed]).sha;
    const guarded = new updater.GitHub({ token: 'ok_token', fetcher: async (url, init) => {
      const pathname = new URL(url).pathname.replace('/repos/onerkk/mytool-blue', '');
      if (init.method !== 'GET') mutations.push(pathname);
      if (pathname === '/git/ref/heads/master') return json({ object: { sha: scenario === 'raced-head' && ++reads >= 3 ? fakeSHA('e') : HEAD } });
      if (pathname === '/git/trees') return json({ sha: scenario === 'missing-original' ? treeOf([changed]).sha : expected }, 201);
      if (pathname === '/git/commits') return json({ sha: NEW, tree: { sha: expected }, parents: [{ sha: HEAD }] }, 201);
      throw Error('Invalid, cancelled or raced update must not reach the branch write');
    } });
    await assert.rejects(guarded.publish(oneFile, { signal: controller.signal, progress: event => {
      if (scenario === 'cancelled' && event.phase === 'upload') controller.abort();
    } }), error => {
      if (scenario === 'cancelled') assert.equal(error.name, 'AbortError');
      else if (scenario === 'raced-head') assert.equal(error.branchChanged, true);
      else assert.match(error.message, /檔案目錄與本機計算不一致/);
      return true;
    });
    assert(!mutations.includes('/git/refs/heads/master'));
    if (scenario !== 'raced-head') assert(!mutations.includes('/git/commits'));
  }
  const cardFiles = [];
  for (const [deck, first, count] of [['tarot', 0, 78], ['lenormand', 1, 36]]) for (let id = first; id < first + count; id++) {
    cardFiles.push({ path: 'assets/cards/bright-20261011/' + deck + '/' + String(id).padStart(2, '0') + '.webp', bytes: Uint8Array.from([0, 255, id, count]) });
  }
  await publishArchive({ files: cardFiles, read: async entry => entry.bytes }, '114 binary card files');
  if (process.env.JY_UPDATER_TEST_ZIP) {
    const archive = await updater.openZip(new Blob([fs.readFileSync(process.env.JY_UPDATER_TEST_ZIP)]));
    await publishArchive(archive, 'Actual card update ZIP');
    assert.equal(archive.files.filter(file => /assets\/cards\/bright-20261011\/(tarot|lenormand)\/\d{2}\.webp$/.test(file.path)).length, 114);
  }
  console.log('admin updater: CSP, ZIP, API 422 details, real Git tree hashes, unchanged files, Unicode, inaccessible new trees, commit validation and fast-forward PASS');
}
run().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => fs.rmSync(gitDirectory, { recursive: true, force: true }));
