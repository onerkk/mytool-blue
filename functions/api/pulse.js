// 靜月之光 — Pages Function: visitor tally proxy v1.2.0
// Browser -> same-origin Pages Function -> Google Apps Script.
// This keeps Google redirects/CORS out of the browser and preserves the
// existing spreadsheet + LockService counter implementation.

const DEFAULT_GAS_URL =
  'https://script.google.com/macros/s/AKfycbxCvM09XbFUyl0BC2im-H6DU_t2Ipjq9p-dZDGAuiildcxmBGC-CGngvvqWmaiPxW8wNQ/exec';

const ALLOWED_ORIGINS = new Set([
  'https://jingyue.uk',
  'https://www.jingyue.uk',
  'https://mytool-blue.pages.dev',
  'https://onerkk.github.io',
]);

const VALID_ACTIONS = new Set(['get', 'increment', 'reset']);

function corsHeaders(request) {
  const origin = request.headers.get('Origin') || '';
  return {
    'Access-Control-Allow-Origin': ALLOWED_ORIGINS.has(origin) ? origin : 'https://jingyue.uk',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Cache-Control': 'no-store, no-cache, must-revalidate',
    'Vary': 'Origin',
  };
}

function jsonResponse(request, data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders(request),
      'Content-Type': 'application/json; charset=utf-8',
    },
  });
}

function normalizeCount(value) {
  if (typeof value !== 'number' && !(typeof value === 'string' && /^\d+$/.test(value.trim()))) return null;
  const number = Number(value);
  return Number.isSafeInteger(number) && number >= 0 ? number : null;
}

function normalizePayload(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const result = {};
  if (Object.prototype.hasOwnProperty.call(value, 'total')) result.total = normalizeCount(value.total);
  if (Object.prototype.hasOwnProperty.call(value, 'today')) result.today = normalizeCount(value.today);
  if (result.total === null || result.today === null ||
      (result.total !== undefined && result.today !== undefined && result.today > result.total)) return null;
  return result;
}

async function readAction(request) {
  const url = new URL(request.url);
  const queryAction = url.searchParams.get('action');
  if (queryAction) return queryAction;
  if (request.method !== 'POST') return '';
  try {
    const body = await request.json();
    return body && typeof body.action === 'string' ? body.action : '';
  } catch (_) {
    return '';
  }
}

async function requestGas(baseUrl, action) {
  const url = new URL(baseUrl);
  url.searchParams.set('action', action);
  url.searchParams.set('_t', String(Date.now()));

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 9000);
  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      redirect: 'follow',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`Google Apps Script HTTP ${response.status}`);
    const text = (await response.text()).replace(/^\uFEFF/, '').trim();
    if (!text) return {};
    return JSON.parse(text);
  } finally {
    clearTimeout(timer);
  }
}

export async function onRequest(context) {
  const { request, env = {} } = context;

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders(request) });
  }
  if (request.method !== 'GET' && request.method !== 'POST') {
    return jsonResponse(request, { error: 'method_not_allowed' }, 405);
  }

  const origin = request.headers.get('Origin') || '';
  if (origin && !ALLOWED_ORIGINS.has(origin)) {
    return jsonResponse(request, { error: 'origin_not_allowed' }, 403);
  }

  const action = await readAction(request);
  if (!VALID_ACTIONS.has(action)) {
    return jsonResponse(request, { error: 'invalid_action' }, 400);
  }

  if (request.method === 'GET' && action !== 'get') {
    return jsonResponse(request, { error: 'mutation_requires_post' }, 405);
  }
  if (action === 'reset') {
    const token = env.COUNTER_ADMIN_TOKEN || env.ADMIN_TOKEN;
    if (!token || request.headers.get('Authorization') !== `Bearer ${token}`) {
      return jsonResponse(request, { error: 'admin_required' }, 403);
    }
  }

  const gasUrl = env.COUNTER_GAS_URL || DEFAULT_GAS_URL;
  try {
    const upstream = await requestGas(gasUrl, action);
    let payload = normalizePayload(upstream);
    // 舊 GAS 可能只回 {}；重設後讀回真正數字，不把空回應當歸零成功。
    if (action === 'reset' && payload && !upstream.error &&
        (payload.total === undefined || payload.today === undefined)) {
      const confirmed = await requestGas(gasUrl, 'get');
      payload = confirmed && !confirmed.error ? normalizePayload(confirmed) : null;
    }
    if (!payload || upstream.error ||
        ((action === 'get' || action === 'reset') && (payload.total === undefined || payload.today === undefined)) ||
        (action === 'increment' && payload.total === undefined)) {
      throw new Error('Google Apps Script returned invalid counter data');
    }
    return jsonResponse(request, payload);
  } catch (error) {
    console.error('[counter] upstream failed:', error && error.message ? error.message : error);
    return jsonResponse(request, { error: 'counter_upstream_failed' }, 502);
  }
}
