'use strict';
// Modal integration regression, using the actual ui.js lazy-image observer.
// This models DOM image events and async Blob completion; it is NOT a browser
// engine or a claim that Android/iOS native sharing has been device-tested.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { environment } = require('./dom-fixture.cjs');
const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(process.env.JY_SHARE_CARD_TEST_SOURCE || path.join(root, 'JS/share-card.js'), 'utf8');
const ui = fs.readFileSync(path.join(root, 'JS/ui.js'), 'utf8');
const lazyObserver = ui.slice(ui.indexOf('// ── #21: 動態圖片自動 lazy loading'), ui.indexOf('// ── #22: Inline SVG favicon'));
assert(lazyObserver.includes('new MutationObserver'), 'Use the production lazy-image observer');

function fixture(options = {}) {
  const e = environment(), { ctx, doc, Element } = e;
  const timers = new Map(), urls = new Map(), revoked = [], downloads = [], blobs = [], images = [], observers = [];
  let seq = 0;
  const append = Element.prototype.appendChild;
  const setAttr = Element.prototype.setAttribute;
  const removeAttr = Element.prototype.removeAttribute;
  Element.prototype.hasAttribute = function (name) { return this.getAttribute(name) !== null; };
  Element.prototype.setAttribute = function (name, value) {
    setAttr.call(this, name, value);
    if (name === 'checked') this.checked = true;
  };
  Object.defineProperties(Element.prototype, {
    nodeType: { get() { return 1; } },
    hidden: { get() { return this.hasAttribute('hidden'); }, set(v) { v ? this.setAttribute('hidden', '') : this.removeAttribute('hidden'); } },
    loading: { get() { return this.getAttribute('loading') || ''; } },
    naturalWidth: { get() { return this._naturalWidth || 0; } },
    complete: { get() { return !!this._complete || !this.getAttribute('src'); } },
    src: {
      get() { return this.getAttribute('src') || ''; },
      set(v) {
        this.setAttribute('src', v); this._complete = false; this._naturalWidth = 0;
        const job = { img: this, src: v, onload: this.onload, onerror: this.onerror };
        images.push(job);
        if (options.cached) { this._complete = true; this._naturalWidth = 2160; return; }
        if (!options.holdImages) queueMicrotask(() => {
          // The original production bug: hidden lazy images never start loading.
          if (this.loading === 'lazy' && this.hidden) return;
          finishImage(job, options.imageError ? 'error' : 'load');
        });
      }
    }
  });
  Element.prototype.removeAttribute = function (name) {
    removeAttr.call(this, name);
    if (name === 'src') { this._complete = false; this._naturalWidth = 0; }
  };
  Element.prototype.appendChild = function (node) {
    const out = append.call(this, node);
    if (this.isConnected) queueMicrotask(() => observers.forEach(fn => fn([{ addedNodes: [node] }])));
    return out;
  };
  Element.prototype.replaceChild = function (node, old) {
    const index = this.children.indexOf(old);
    assert(index >= 0); old.remove(); node.parentNode = this; this.children.splice(index, 0, node);
    if (this.isConnected) queueMicrotask(() => observers.forEach(fn => fn([{ addedNodes: [node] }])));
    return old;
  };
  const click = Element.prototype.click;
  Element.prototype.click = function () {
    if (this.tagName === 'A' && this.download) downloads.push({ blob: urls.get(this.href), name: this.download });
    else click.call(this);
  };
  function finishImage(job, event) {
    if (event === 'load') { job.img._complete = true; job.img._naturalWidth = 2160; }
    // Saved callback intentionally exercises a late, already queued old event.
    job['on' + event]?.();
  }
  ctx.MutationObserver = class { constructor(fn) { this.fn = fn; } observe() { observers.push(this.fn); } };
  ctx.URL = class extends URL {
    static createObjectURL(blob) { const id = 'blob:https://preview.invalid/' + (++seq); urls.set(id, blob); return id; }
    static revokeObjectURL(id) { revoked.push(id); urls.delete(id); }
  };
  ctx.Image = class {
    constructor() { this.width = this.naturalWidth = 400; this.height = this.naturalHeight = 600; }
    set src(v) { this._src = v; queueMicrotask(() => this.onload?.()); }
    get src() { return this._src; }
  };
  ctx.File = File;
  ctx.location.origin = 'https://preview.invalid';
  ctx.setTimeout = (fn, ms) => { const id = ++seq; timers.set(id, { fn, ms }); return id; };
  ctx.clearTimeout = id => timers.delete(id);
  doc.baseURI = 'https://preview.invalid/index.html';
  doc.currentScript = { src: 'https://preview.invalid/JS/share-card.js' };
  const events = new Element();
  doc.addEventListener = events.addEventListener.bind(events);
  doc.removeEventListener = events.removeEventListener.bind(events);
  const create = doc.createElement;
  doc.createElement = tag => {
    const el = create(tag);
    if (tag !== 'canvas') return el;
    const text = [];
    el.getContext = () => new Proxy({
      measureText(s) { return { width: String(s).length * 18 }; },
      fillText(s) { text.push(s); },
      createLinearGradient() { return { addColorStop() {} }; },
      createRadialGradient() { return { addColorStop() {} }; }
    }, { get: (o, key) => key in o ? o[key] : () => {} });
    el.toBlob = callback => {
      const blob = new Blob([JSON.stringify(text)], { type: 'image/png' });
      const job = { text, blob, resolve: () => callback(blob), reject: () => callback(null) };
      blobs.push(job);
      if (!options.holdBlobs) queueMicrotask(options.blobError ? job.reject : job.resolve);
    };
    return el;
  };
  vm.runInContext(lazyObserver, ctx);
  vm.runInContext(source, ctx, { filename: 'share-card.js' });
  const api = ctx.JYShareCard;
  function parts(bd) {
    return { img: bd.querySelector('img'), loading: bd.querySelector('.jysc-loading'), status: bd.querySelector('#jysc-status'), share: bd.querySelector('#jysc-share'), dl: bd.querySelector('#jysc-dl'), personal: bd.querySelector('#jysc-personal'), stage: bd.querySelector('#jysc-stage') };
  }
  function fire(ms) {
    for (const [id, timer] of [...timers]) if (timer.ms === ms) { timers.delete(id); timer.fn(); }
  }
  return { ...e, api, parts, timers, urls, revoked, downloads, blobs, images, finishImage, fire, events };
}
async function settle() { for (let i = 0; i < 30; i++) await Promise.resolve(); }
let passed = 0;
async function test(name, fn) { await fn(); passed++; console.log('✓ ' + name); }
(async () => {
  await test('All ten dialogs show their completed image with the production lazy observer active', async () => {
    const e = fixture();
    for (const type of e.api.types) {
      const bd = e.api.open(type, {}); await settle();
      const p = e.parts(bd);
      assert.equal(p.img.hidden, false, type + ': preview must become visible');
      assert.equal(p.img.naturalWidth, 2160);
      assert.equal(p.loading, null, type + ': loading panel must be removed');
      assert.equal(p.stage.getAttribute('aria-busy'), 'false');
      assert.equal(p.dl.disabled, false); assert.equal(p.share.disabled, false);
      assert.match(p.status.textContent, /2160 × 2700/);
      e.api.close(); assert.equal(e.urls.size, 0); assert.equal(e.timers.size, 0);
    }
  });
  await test('Ready Blob and still-loading preview are distinct states; download remains available', async () => {
    const e = fixture({ holdImages: true }), bd = e.api.open('invite', {}); await settle();
    const p = e.parts(bd);
    assert.match(p.status.textContent, /正在載入預覽/); assert.equal(p.img.hidden, true);
    p.dl.click(); assert.equal(e.downloads[0].blob, e.blobs[0].blob);
    e.finishImage(e.images[0], 'load');
    assert.equal(e.parts(bd).loading, null); assert.equal(p.img.hidden, false); e.api.close();
  });
  await test('Already-complete cached previews do not depend on a later load event', async () => {
    const e = fixture({ cached: true }), bd = e.api.open('invite', {}); await settle();
    assert.equal(e.parts(bd).img.hidden, false); assert.equal(e.parts(bd).loading, null); e.api.close();
  });
  await test('Decode error ends loading without discarding a valid downloadable PNG', async () => {
    const e = fixture({ imageError: true }), bd = e.api.open('invite', {}); await settle();
    const p = e.parts(bd);
    assert.match(p.loading.textContent, /預覽暫時無法顯示/);
    assert(!p.status.textContent.includes('正在')); assert.equal(p.stage.getAttribute('aria-busy'), 'false');
    assert.equal(p.dl.disabled, false); p.dl.click(); assert.equal(e.downloads[0].blob, e.blobs[0].blob); e.api.close();
  });
  await test('Missing image events time out; a late successful image can still recover', async () => {
    const e = fixture({ holdImages: true }), bd = e.api.open('invite', {}); await settle();
    e.fire(12000); assert.match(e.parts(bd).loading.textContent, /預覽暫時無法顯示/);
    assert.equal(e.parts(bd).dl.disabled, false);
    e.finishImage(e.images[0], 'load'); assert.equal(e.parts(bd).loading, null);
    assert.equal(e.parts(bd).img.hidden, false); e.api.close();
  });
  await test('PNG encoding failure ends loading and keeps empty downloads disabled', async () => {
    const e = fixture({ blobError: true }), bd = e.api.open('invite', {}); await settle();
    const p = e.parts(bd);
    assert.match(p.loading.textContent, /無法製作/); assert.equal(p.stage.getAttribute('aria-busy'), 'false');
    assert.equal(p.dl.disabled, true); assert.equal(p.share.disabled, true); assert.equal(e.urls.size, 0); e.api.close();
  });
  await test('Privacy redraw immediately removes the old image and rejects its late events', async () => {
    const e = fixture({ holdImages: true }), bd = e.api.open('tarot', { question: '不可外洩的問題' }); await settle();
    const old = e.images[0], oldURL = old.src;
    e.finishImage(old, 'load'); const p = e.parts(bd); assert.equal(p.img.hidden, false);
    p.personal.checked = false; p.personal.onchange();
    assert.equal(old.img.isConnected, false); assert(e.revoked.includes(oldURL));
    assert.equal(e.parts(bd).dl.disabled, true); assert.equal(e.parts(bd).img.hidden, true);
    e.finishImage(old, 'load'); assert.equal(e.parts(bd).img.hidden, true);
    await settle(); assert(!e.blobs.at(-1).text.some(t => String(t).includes('不可外洩的問題')));
    e.finishImage(e.images.at(-1), 'load');
    assert.equal(e.parts(bd).loading, null); assert.equal(e.parts(bd).img.hidden, false); e.api.close();
  });
  await test('Out-of-order privacy renders and stale failures cannot replace the newest card', async () => {
    for (const staleFails of [false, true]) {
      const e = fixture({ holdBlobs: true }), bd = e.api.open('tarot', { question: '原本問題' }); await settle();
      const p = e.parts(bd); p.personal.checked = false; p.personal.onchange(); await settle();
      e.blobs[1].resolve(); await settle(); const currentSrc = e.parts(bd).img.src;
      staleFails ? e.blobs[0].reject() : e.blobs[0].resolve(); await settle();
      assert.equal(e.parts(bd).img.src, currentSrc); assert.equal(e.parts(bd).loading, null);
      p.dl.click(); assert.equal(e.downloads.at(-1).blob, e.blobs[1].blob); e.api.close();
    }
  });
  await test('Closing during rendering or decoding releases resources and ignores late completion', async () => {
    for (const phase of ['render', 'decode']) {
      const e = fixture(phase === 'render' ? { holdBlobs: true } : { holdImages: true });
      e.doc.body.style.overflow = 'auto'; const trigger = e.doc.body.appendChild(new e.Element('button')); trigger.focus();
      const first = e.api.open('invite', {}); await settle();
      e.api.close(); assert.equal(first.isConnected, false); assert.equal(e.doc.body.style.overflow, 'auto');
      assert.equal(e.doc.activeElement, trigger); assert.equal(e.urls.size, 0); assert.equal(e.timers.size, 0);
      const second = e.api.open('tarot', {});
      if (phase === 'render') e.blobs[0].resolve(); else e.finishImage(e.images[0], 'load');
      await settle(); assert.equal(e.parts(second).img.hidden, true);
      assert.equal(e.events.listeners.keydown.size, 1); e.api.close(); assert.equal(e.events.listeners.keydown.size, 0);
    }
  });
  await test('Cancelling native share does not start an unwanted download', async () => {
    const e = fixture(), bd = e.api.open('invite', {}); await settle();
    e.ctx.navigator.canShare = () => true;
    e.ctx.navigator.share = () => Promise.reject(Object.assign(new Error('cancel'), { name: 'AbortError' }));
    e.parts(bd).share.click(); await settle(); assert.equal(e.downloads.length, 0); e.api.close();
  });
  console.log('share-card-preview: ' + passed + ' integration groups passed (simulated DOM/image lifecycle).');
})().catch(error => { console.error(error); process.exitCode = 1; });
