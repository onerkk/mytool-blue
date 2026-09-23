'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ui = fs.readFileSync(path.join(__dirname, '../JS/ui.js'), 'utf8');
const start = ui.indexOf('// 自家網域走同源；GitHub Pages 備援站改走正式 Pages Function。');
const end = ui.indexOf('/* ==== ZiWei settings', start);
assert(start >= 0 && end > start, 'traffic counter block is present');
const source = ui.slice(start, end);
assert(!/window\.JY_PROMPT_ONLY\)\s*return null/.test(source), 'prompt-only mode must not disable traffic reads');
assert(!/_visitCounted\s*\|\|\s*window\.JY_PROMPT_ONLY/.test(source), 'prompt-only mode must not disable visitor counts');
assert(!/if\s*\(window\.JY_PROMPT_ONLY\)\s*return false/.test(source), 'prompt-only mode must not disable the hidden tap entry');

const classes = () => {
  const values = new Set();
  return { add: value => values.add(value), remove: value => values.delete(value), contains: value => values.has(value) };
};
const elements = new Map();
let panelCreated = false;
const badge = { id: 'counter-badge', classList: classes() };
elements.set(badge.id, badge);
for (const id of ['counter-num', 'counter-today']) elements.set(id, { id, textContent: '' });

const calls = [];
const context = {
  window: { JY_PROMPT_ONLY: true, location: { hostname: 'jingyue.uk' } },
  document: {
    readyState: 'complete',
    body: { appendChild(el) { elements.set(el.id, el); if (el.id === 'admin-panel') panelCreated = true; } },
    getElementById(id) {
      if (elements.has(id)) return elements.get(id);
      if (panelCreated && ['admin-count', 'admin-today', 'admin-status'].includes(id)) {
        const el = { id, textContent: '' };
        elements.set(id, el);
        return el;
      }
      return null;
    },
    createElement() {
      return { classList: classes(), addEventListener() {}, id: '', className: '', innerHTML: '', textContent: '' };
    },
    addEventListener() {}
  },
  fetch: async (url, options) => {
    calls.push({ url: String(url), method: options.method, body: options.body });
    return { ok: true, status: 200, json: async () => ({ total: 128, today: 7 }) };
  },
  AbortController,
  setTimeout,
  clearTimeout,
  Date,
  Number,
  JSON,
  console
};
context.window.document = context.document;
context.globalThis = context;
vm.createContext(context);
vm.runInContext(source, context, { filename: 'JS/ui.js traffic counter' });

async function run() {
  for (let i = 0; i < 4; i++) assert.equal(vm.runInContext('_moonTap()', context), false);
  assert.equal(vm.runInContext('_moonTap()', context), true, 'the fifth tap opens the stats panel');
  await new Promise(resolve => setTimeout(resolve, 0));

  assert.equal(calls.filter(call => call.method === 'POST').length, 1, 'one page visit increments exactly once');
  assert.equal(calls.filter(call => call.url.includes('action=get')).length, 1, 'opening the panel reads live stats');
  assert.equal(elements.get('admin-count').textContent, '128');
  assert.equal(elements.get('admin-today').textContent, '7');
  assert(elements.get('admin-panel').classList.contains('visible'));
  assert(elements.get('admin-overlay').classList.contains('visible'));
  vm.runInContext('_maybeCountVisit()', context);
  assert.equal(calls.filter(call => call.method === 'POST').length, 1, 'repeated load hook cannot double-count');
  console.log('traffic tap: prompt-only homepage counts visits and opens the live stats panel after five taps');
}

run().catch(error => { console.error(error); process.exitCode = 1; });
