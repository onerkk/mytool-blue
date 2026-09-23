'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const vm = require('node:vm');

const html = fs.readFileSync(path.join(__dirname, '..', 'admin', 'update.html'), 'utf8');
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
  btoa: value => Buffer.from(value, 'binary').toString('base64')
};
sandbox.globalThis = sandbox;
vm.runInNewContext(scripts[0], sandbox, { filename: 'admin/update.html' });
const updater = sandbox.module.exports;
const sha = source => crypto.createHash('sha1').update('blob ' + source.length + '\0').update(source).digest('hex');
const fakeSHA = letter => letter.repeat(40);
const HEAD = fakeSHA('a'), BASE = fakeSHA('b'), NEW = fakeSHA('d');
const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

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
  return { repository: 'onerkk/mytool-blue', branch: 'master', head: HEAD, tree: BASE,
    zip: { read: async entry => entry.bytes }, changes };
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
  const stored = new Map(), treePayloads = [], history = [];
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
        stored.set(entry.path, 'sha' in entry ? entry.sha : sha(Buffer.from(entry.content)));
      }
      treePayloads.push(body.tree);
      treeCalls++;
      treeId = treeCalls.toString(16).padStart(40, '0');
      lastTree = treeId;
      return json({ sha: treeId }, 201);
    }
    if (pathname === '/git/trees/' + treeId && init.method === 'GET') {
      assert.equal(new URL(url).searchParams.get('recursive'), '1');
      return json({ truncated: false, tree: [...stored].map(([path, sha]) => ({ path, sha })) });
    }
    if (pathname === '/git/commits' && init.method === 'POST') {
      const body = JSON.parse(init.body);
      assert.equal(body.tree, lastTree);
      assert.deepEqual(body.parents, [HEAD]);
      return json({ sha: NEW }, 201);
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

  const oneFile = await planOf([['JS/a.js', Buffer.from('const a = 1;\n')]]);
  let lastEndpoint = '';
  const invalidTree = new updater.GitHub({ token: 'ok_token', fetcher: async (url, init) => {
    const pathname = new URL(url).pathname.replace('/repos/onerkk/mytool-blue', '');
    lastEndpoint = init.method + ' ' + pathname;
    if (pathname === '/git/ref/heads/master') return json({ object: { sha: HEAD } });
    if (pathname === '/git/trees' && init.method === 'POST') return json({ sha: NEW }, 201);
    if (pathname === '/git/trees/' + NEW) return json({ truncated: false, tree: [{ path: 'JS/a.js', sha: fakeSHA('f') }] });
    throw Error('A mismatched blob must never be committed or published');
  } });
  await assert.rejects(invalidTree.publish(oneFile), /GitHub 檔案雜湊不一致/);
  assert.equal(lastEndpoint, 'GET /git/trees/' + NEW);

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
  console.log('admin updater: CSP, ZIP, API 422 details, token redaction, chained UTF-8 trees, SHA and fast-forward PASS');
}
run().catch(error => { console.error(error); process.exitCode = 1; });
