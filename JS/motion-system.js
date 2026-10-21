/* 靜月之光 · 共用動態系統 / 20261021motion37
 * 1) 門卡綻放進房  2) 結果分段浮現  3) 按壓光暈＋Android 輕震  4) 回首頁門卡依序歸位
 * 原則：不攔截、不延遲任何既有點擊（房間照常立即開啟，特效只疊在上面）；只動 transform/opacity；
 * 「減少動態」時全部停用；任何一步失敗都靜默略過，不影響流程。 */
(function (root) {
  'use strict';
  if (!root.document || !root.Element) return;
  var doc = root.document, VERSION = '20261021motion37';
  var mq = root.matchMedia ? root.matchMedia('(prefers-reduced-motion: reduce)') : null;
  function reduced() { return !!(mq && mq.matches); }
  var canAnimate = typeof Element.prototype.animate === 'function';

  /* ── 1. 門卡綻放 ── */
  var DOOR = '.at-tool,#home-cta-btn';
  function doorTitle(el) {
    var t = el.querySelector('strong,h3,b');
    var s = (t ? t.textContent : el.getAttribute('aria-label') || el.textContent || '').replace(/\s+/g, '');
    if (/走進月下神殿/.test(s)) return '月下神殿';
    return s.replace(/^\d+/, '').slice(0, 10);
  }
  function bloom(el) {
    if (reduced() || !canAnimate) return;
    var r = el.getBoundingClientRect(), vw = root.innerWidth, vh = root.innerHeight;
    if (!r.width || !r.height) return;
    var veil = doc.createElement('div');
    veil.className = 'jy-veil'; veil.setAttribute('aria-hidden', 'true');
    veil.innerHTML = '<div class="jy-veil-moon"></div><div class="jy-veil-title"></div>';
    veil.querySelector('.jy-veil-title').textContent = doorTitle(el);
    doc.body.appendChild(veil);
    var from = 'translate(' + r.left + 'px,' + r.top + 'px) scale(' + (r.width / vw) + ',' + (r.height / vh) + ')';
    var a = veil.animate([
      { transform: from, opacity: 0, borderRadius: '22px', offset: 0 },
      { opacity: 1, offset: 0.12 },
      { transform: 'translate(0,0) scale(1,1)', borderRadius: '0px', opacity: 1, offset: 0.48 },
      { transform: 'translate(0,0) scale(1,1)', borderRadius: '0px', opacity: 1, offset: 0.66 },
      { transform: 'translate(0,0) scale(1.04,1.04)', borderRadius: '0px', opacity: 0, offset: 1 }
    ], { duration: 1050, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'forwards' });
    var moon = veil.querySelector('.jy-veil-moon'), title = veil.querySelector('.jy-veil-title');
    moon.animate([
      { opacity: 0, transform: 'scale(.6) rotate(-18deg)', offset: 0 },
      { opacity: 0, transform: 'scale(.6) rotate(-18deg)', offset: 0.28 },
      { opacity: 1, transform: 'scale(1) rotate(0deg)', offset: 0.58 },
      { opacity: 0, transform: 'scale(1.18) rotate(6deg)', offset: 1 }
    ], { duration: 1050, easing: 'cubic-bezier(.34,1.56,.64,1)', fill: 'forwards' });
    title.animate([
      { opacity: 0, letterSpacing: '.6em', offset: 0 }, { opacity: 0, offset: 0.34 },
      { opacity: 1, letterSpacing: '.32em', offset: 0.6 }, { opacity: 0, offset: 1 }
    ], { duration: 1050, easing: 'ease-out', fill: 'forwards' });
    var done = function () { if (veil.isConnected) veil.remove(); };
    a.onfinish = done; setTimeout(done, 1600);
  }
  doc.addEventListener('click', function (e) {
    var el = e.target && e.target.closest && e.target.closest(DOOR);
    if (!el || !el.closest('#hook-screen')) return;
    el.classList.add('jy-door-pressed'); setTimeout(function () { el.classList.remove('jy-door-pressed'); }, 140);
    try { bloom(el); } catch (_) {}
  }, true);

  /* ── 2. 結果分段浮現 ── */
  var RESULT = ['.jy-native-analysis', '.ln-ai-card', '.bzx-ai-card', '.mhx-ai-card', '.zw-ai', '.orc-ai-prompt-card', '.jy-ex-card',
    '.gw-hex-card', '.gw-reading-card', '.jy-reading-result', '.lr-result-column', '.nm-result-summary', '.ootk-result-card',
    '.or-result-heading', '.or-result-grid', '.or-poem-column', '.vd-result-heading', '.wx-summary-card', '.wx-reading-card',
    '.pair-result', '.at-result-note', '[data-reveal]'].join(',');
  var seen = new Set(), pending = new Set(), io = null;
  function key(el) {
    var host = el.closest('[id]');
    return (host ? host.id : '') + '|' + el.className + '|' + (el.textContent || '').replace(/\s+/g, '').slice(0, 48);
  }
  function settle(el) {
    pending.delete(el);
    // 動畫結束後移除標記，讓卡片恢復自身的 transform／filter 樣式。
    setTimeout(function () { el.classList.remove('jy-rv', 'jy-in'); el.style.removeProperty('--jy-rv-delay'); }, 1200);
  }
  function show(el) { if (!el.classList.contains('jy-rv')) return; el.classList.add('jy-in'); if (io) io.unobserve(el); settle(el); }
  if ('IntersectionObserver' in root) {
    io = new IntersectionObserver(function (entries) {
      var batch = entries.filter(function (x) { return x.isIntersecting; }).sort(function (a, b) { return a.boundingClientRect.top - b.boundingClientRect.top; });
      batch.forEach(function (x, i) { x.target.style.setProperty('--jy-rv-delay', Math.min(i * 110, 660) + 'ms'); show(x.target); });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });
  }
  function mark(list) {
    if (!io || reduced()) return;
    list.forEach(function (el) {
      if (el.closest('#hook-screen,.jy-veil,[class*=jr-]') || el.classList.contains('jy-rv')) return;
      var k = key(el); if (seen.has(k)) return;  // 同一房間重繪時不重播
      seen.add(k); el.__jyMarked = Date.now(); el.classList.add('jy-rv'); pending.add(el); io.observe(el);
    });
  }
  new MutationObserver(function (records) {
    var found = [];
    records.forEach(function (r) {
      r.addedNodes.forEach(function (n) {
        if (n.nodeType !== 1) return;
        if (n.matches && n.matches(RESULT)) found.push(n);
        if (n.querySelectorAll) n.querySelectorAll(RESULT).forEach(function (x) { found.push(x); });
      });
    });
    if (found.length) mark(found);
  }).observe(doc.documentElement, { childList: true, subtree: true });
  // 保險：任何已在畫面內卻沒收到交會通知的卡片，最多 2.5 秒後直接顯示。
  setInterval(function () {
    pending.forEach(function (el) {
      if (!el.isConnected) { pending.delete(el); return; }
      var b = el.getBoundingClientRect();
      if (b.width && b.bottom > 0 && b.top < root.innerHeight && Date.now() - (el.__jyMarked || 0) > 2500) show(el);
    });
  }, 800);

  /* ── 3. 按壓光暈＋輕震 ── */
  var PRESS = ['.at-primary', '.btn-primary', '.btn-gold', '.ln-ai-copy-btn', '.mhx-ai-copy-btn', '.bzx-ai-copy-btn', '.orc-ai-copy-btn',
    '#tarot-dock-action', '.jc-continue', '.gw-primary', '.orc-btn-primary', '.bzs-primary', '.jy-handoff-ok', '.ln-draw-btn',
    '.bzx-cast-btn', '.mhx-cast-btn', '.zw-in-go', '#wx-submit', '#vd-submit', '#nm-prepare', '#nm-analyze', '.orc-tc-alt'].join(',');
  doc.addEventListener('pointerdown', function (e) {
    var b = e.target && e.target.closest && e.target.closest(PRESS);
    if (!b || b.disabled || reduced()) return;
    try {
      var r = b.getBoundingClientRect(), sp = doc.createElement('span');
      sp.className = 'jy-ripple';
      sp.style.left = (e.clientX - r.left) + 'px'; sp.style.top = (e.clientY - r.top) + 'px';
      sp.style.setProperty('--jy-ripple-scale', String(Math.ceil(Math.max(r.width, r.height) * 2.3 / 12)));
      b.classList.add('jy-press'); b.appendChild(sp);
      setTimeout(function () { sp.remove(); if (!b.querySelector('.jy-ripple')) b.classList.remove('jy-press'); }, 660);
      if (root.navigator && typeof root.navigator.vibrate === 'function' && e.pointerType === 'touch') root.navigator.vibrate(8);
    } catch (_) {}
  }, { capture: true, passive: true });

  /* ── 4. 首頁門卡依序歸位 ── */
  function cascade() {
    if (reduced()) return;
    var doors = Array.prototype.slice.call(doc.querySelectorAll('#hook-screen .at-tool')), vh = root.innerHeight, i = 0;
    doors.forEach(function (d) {
      var b = d.getBoundingClientRect(); if (!b.width || b.bottom < 0 || b.top > vh) return;
      d.classList.remove('jy-door-in'); void d.offsetWidth;
      d.style.setProperty('--jy-door-delay', (i++ * 70) + 'ms'); d.classList.add('jy-door-in');
      // 動畫保持結束值會蓋過門卡自己的 hover／按壓變形，結束即移除。
      d.addEventListener('animationend', function end() { d.classList.remove('jy-door-in'); d.removeEventListener('animationend', end); });
    });
  }
  function homeVisible() {
    var h = doc.getElementById('hook-screen'); if (!h) return false;
    if (getComputedStyle(h).display === 'none') return false;
    return !(root.JYRoomGuard && root.JYRoomGuard.current && root.JYRoomGuard.current());
  }
  var wasHome = null;
  setInterval(function () {
    if (doc.hidden) return;
    var now = homeVisible();
    if (wasHome === false && now) { seen.clear(); cascade(); }
    wasHome = now;
  }, 300);
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', function () { setTimeout(cascade, 120); });
  else setTimeout(cascade, 120);

  root.JYMotion = Object.freeze({ version: VERSION, bloom: bloom, cascade: cascade, reveal: mark });
})(typeof window !== 'undefined' ? window : globalThis);
