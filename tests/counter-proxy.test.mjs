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
  assert.match(indexSource, /JS\/ui\.js\?v=20260904pulsev2/);

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

  globalThis.fetch = async () => new Response('<html>error</html>', { status: 500 });
  const realConsoleError = console.error;
  console.error = () => {};
  const upstreamFailure = await onRequest({
    request: siteRequest('/api/pulse?action=get'),
    env: { COUNTER_GAS_URL: 'https://script.google.com/macros/s/test/exec' },
  });
  console.error = realConsoleError;
  assert.equal(upstreamFailure.status, 502);
  assert.deepEqual(await upstreamFailure.json(), { error: 'counter_upstream_failed' });

  console.log('counter-proxy: all assertions passed');
}

try {
  await run();
} finally {
  globalThis.fetch = realFetch;
}
