import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const counterModuleUrl = new URL('../functions/api/pulse.js', import.meta.url);
const counterSource = await readFile(counterModuleUrl, 'utf8');
const counterModule = await import(`data:text/javascript;base64,${Buffer.from(counterSource).toString('base64')}`);
const { onRequest } = counterModule;

const realFetch = globalThis.fetch;
let upstreamUrl = '';

function siteRequest(path, init = {}) {
  const headers = new Headers(init.headers || {});
  if (!headers.has('Origin')) headers.set('Origin', 'https://jingyue.uk');
  return new Request(`https://jingyue.uk${path}`, { ...init, headers });
}

async function run() {
  const uiSource = await readFile(new URL('../JS/ui.js', import.meta.url), 'utf8');
  const indexSource = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  assert.match(uiSource, /\/api\/pulse/);
  assert.doesNotMatch(uiSource, /\/api\/counter/);
  assert.doesNotMatch(uiSource, /const CTR_ENDPOINT\s*=\s*['"]https:\/\/script\.google\.com/);
  assert.match(indexSource, /<script src="JS\/ui\.js\?v=[^"\s]+" defer><\/script>/);

  globalThis.fetch = async url => {
    upstreamUrl = String(url);
    return new Response(JSON.stringify({ total: '1234', today: 56 }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  };

  const getResponse = await onRequest({
    request: siteRequest('/api/pulse?action=get'),
    env: { COUNTER_GAS_URL: 'https://script.google.com/macros/s/test/exec' },
  });
  assert.equal(getResponse.status, 200);
  assert.deepEqual(await getResponse.json(), { total: 1234, today: 56 });
  assert.match(upstreamUrl, /action=get/);
  assert.equal(getResponse.headers.get('Access-Control-Allow-Origin'), 'https://jingyue.uk');
  assert.match(getResponse.headers.get('Cache-Control'), /no-store/);

  const incrementResponse = await onRequest({
    request: siteRequest('/api/pulse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'increment' }),
    }),
    env: { COUNTER_GAS_URL: 'https://script.google.com/macros/s/test/exec' },
  });
  assert.equal(incrementResponse.status, 200);
  assert.match(upstreamUrl, /action=increment/);

  const invalidResponse = await onRequest({
    request: siteRequest('/api/pulse?action=erase'),
    env: {},
  });
  assert.equal(invalidResponse.status, 400);

  const blockedResponse = await onRequest({
    request: siteRequest('/api/pulse?action=get', {
      headers: { Origin: 'https://example.com' },
    }),
    env: {},
  });
  assert.equal(blockedResponse.status, 403);

  let transientReadAttempts = 0;
  globalThis.fetch = async () => {
    transientReadAttempts += 1;
    if (transientReadAttempts === 1) return new Response('temporary upstream error', { status: 503 });
    return new Response(JSON.stringify({ total: 1234, today: 56 }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  };
  const recoveredRead = await onRequest({
    request: siteRequest('/api/pulse?action=get'),
    env: { COUNTER_GAS_URL: 'https://script.google.com/macros/s/test/exec' },
  });
  assert.equal(recoveredRead.status, 200);
  assert.deepEqual(await recoveredRead.json(), { total: 1234, today: 56 });
  assert.equal(transientReadAttempts, 2, 'a transient GET failure is retried once');

  let persistentReadAttempts = 0;
  globalThis.fetch = async () => {
    persistentReadAttempts += 1;
    return new Response('<html>error</html>', { status: 500 });
  };
  const realConsoleError = console.error;
  console.error = () => {};
  const upstreamFailure = await onRequest({
    request: siteRequest('/api/pulse?action=get'),
    env: { COUNTER_GAS_URL: 'https://script.google.com/macros/s/test/exec' },
  });
  console.error = realConsoleError;
  assert.equal(upstreamFailure.status, 502);
  assert.deepEqual(await upstreamFailure.json(), { error: 'counter_upstream_failed', reason: 'upstream_http_500' });
  assert.equal(persistentReadAttempts, 2, 'a persistent GET failure stops after one retry');

  let writeAttempts = 0;
  globalThis.fetch = async () => {
    writeAttempts += 1;
    return new Response('<html>error</html>', { status: 500 });
  };
  console.error = () => {};
  const uncertainWrite = await onRequest({
    request: siteRequest('/api/pulse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'increment' }),
    }),
    env: { COUNTER_GAS_URL: 'https://script.google.com/macros/s/test/exec' },
  });
  console.error = realConsoleError;
  assert.equal(uncertainWrite.status, 502);
  assert.equal(writeAttempts, 1, 'an uncertain counter write is never retried');

  console.log('counter-proxy: all assertions passed');
}

try {
  await run();
} finally {
  globalThis.fetch = realFetch;
}
