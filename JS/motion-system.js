/* 靜月之光 · 共用動態系統 / 20261021ink42
 * 1) 門卡綻放進房  2) 結果分段浮現  3) 按壓光暈＋Android 輕震  4) 回首頁門卡依序歸位
 * 原則：不攔截、不延遲任何既有點擊（房間照常立即開啟，特效只疊在上面）；只動 transform/opacity；
 * 「減少動態」時全部停用；任何一步失敗都靜默略過，不影響流程。 */
(function (root) {
  'use strict';
  if (!root.document || !root.Element) return;
  var doc = root.document, VERSION = '20261021ink42';
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
    // 整段等速；緩動放在每一段的起始關鍵影格（整段套前傾曲線會把擴展、停留、淡出全擠到前 50ms）。
    var EXPAND = 'cubic-bezier(.16,1,.3,1)', SOFT = 'cubic-bezier(.4,0,.2,1)', SPRING = 'cubic-bezier(.34,1.56,.64,1)';
    var a = veil.animate([
      { transform: from, opacity: 0, borderRadius: '22px', offset: 0, easing: EXPAND },
      { transform: 'translate(0,0) scale(1,1)', borderRadius: '0px', opacity: 1, offset: 0.40, easing: 'linear' },
      { transform: 'translate(0,0) scale(1,1)', borderRadius: '0px', opacity: 1, offset: 0.64, easing: SOFT },
      { transform: 'translate(0,0) scale(1.04,1.04)', borderRadius: '0px', opacity: 0, offset: 1 }
    ], { duration: 1100, easing: 'linear', fill: 'forwards' });
    var moon = veil.querySelector('.jy-veil-moon'), title = veil.querySelector('.jy-veil-title');
    moon.animate([
      { opacity: 0, transform: 'scale(.6) rotate(-18deg)', offset: 0, easing: 'linear' },
      { opacity: 0, transform: 'scale(.6) rotate(-18deg)', offset: 0.24, easing: SPRING },
      { opacity: 1, transform: 'scale(1) rotate(0deg)', offset: 0.52, easing: 'linear' },
      { opacity: 1, transform: 'scale(1) rotate(0deg)', offset: 0.66, easing: SOFT },
      { opacity: 0, transform: 'scale(1.16) rotate(6deg)', offset: 1 }
    ], { duration: 1100, easing: 'linear', fill: 'forwards' });
    title.animate([
      { opacity: 0, letterSpacing: '.62em', offset: 0, easing: 'linear' },
      { opacity: 0, letterSpacing: '.62em', offset: 0.32, easing: EXPAND },
      { opacity: 1, letterSpacing: '.32em', offset: 0.56, easing: 'linear' },
      { opacity: 1, letterSpacing: '.32em', offset: 0.68, easing: SOFT },
      { opacity: 0, letterSpacing: '.3em', offset: 1 }
    ], { duration: 1100, easing: 'linear', fill: 'forwards' });
    var done = function () { if (veil.isConnected) veil.remove(); };
    a.onfinish = done; setTimeout(done, 1700);
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
    '.pair-result', '.at-result-note', '.ootk-record-heading', '.ootk-record-row', '[data-reveal]'].join(',');
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
  // 需要完整播完的書寫動畫（卦卡、籤詩）掛上不會被移除的 jy-draw，由「進入畫面」觸發，避免在畫面外先播完。
  var DRAW = '.gw-hex-card,.or-poem-column';
  function show(el) { if (!el.classList.contains('jy-rv')) return; if (el.matches(DRAW)) el.classList.add('jy-draw'); el.classList.add('jy-in'); if (io) io.unobserve(el); settle(el); }
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
    if (wasHome === false && now) { seen.clear(); dealt.clear(); cascade(); }
    wasHome = now;
  }, 300);
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', function () { setTimeout(cascade, 120); });
  else setTimeout(cascade, 120);

  /* ── 5. 儀式翻牌（手機版原本被 !important 壓平成瞬間換圖；改用不受影響的獨立變形屬性 scale/translate，
   *      單一平面由側邊展開，不回到雙面 3D 結構，避免舊有「圖片未載入時空白牌面」問題） ── */
  function turn(btn) {
    if (reduced() || !canAnimate || btn.__jyTurned) return;
    btn.__jyTurned = true;
    try {
      btn.animate([
        { scale: '0.05 1', translate: '0 10px', offset: 0, easing: 'cubic-bezier(.22,.75,.25,1)' },
        { scale: '1.07 1.07', translate: '0 -14px', offset: 0.58, easing: 'cubic-bezier(.3,0,.2,1)' },
        { scale: '1 1', translate: '0 0', offset: 1 }
      ], { duration: 700, easing: 'linear' });
      // 特效層掛在儀式 dialog（瀏覽器頂層）內、以牌的版面位置定位，避開按鈕內的溢出裁切與堆疊層級。
      var face = btn.querySelector('.jr-flip,.tarot-reveal-inner,.jy-ts-face') || btn.querySelector('.jr-front') || btn;  // 只貼合牌面，不含下方牌名
      var host = btn.closest('dialog') || doc.body, r = face.getBoundingClientRect(), hr = host === doc.body ? { left: 0, top: 0 } : host.getBoundingClientRect();
      var w = face.offsetWidth || r.width, h = face.offsetHeight || r.height, cx = r.left + r.width / 2 - hr.left, cy = r.top + r.height / 2 - hr.top;
      var fx = doc.createElement('div'); fx.className = 'jy-fx'; fx.setAttribute('aria-hidden', 'true');
      fx.style.cssText = 'position:absolute;left:' + (cx - w / 2) + 'px;top:' + (cy - h / 2) + 'px;width:' + w + 'px;height:' + h + 'px;pointer-events:none;z-index:2147483000';
      if (host === doc.body) fx.style.position = 'fixed';
      fx.innerHTML = '<div class="jy-fx-halo"></div><div class="jy-fx-clip"><div class="jy-fx-sweep"></div></div>';
      host.appendChild(fx);
      fx.querySelector('.jy-fx-halo').animate([{ opacity: 0, scale: '0.92' }, { opacity: 1, scale: '1.02', offset: 0.45 }, { opacity: 0, scale: '1.08' }], { duration: 1000, delay: 120, easing: 'ease-out', fill: 'both' });
      fx.querySelector('.jy-fx-sweep').animate([{ translate: '-120% 0' }, { translate: '260% 0' }], { duration: 760, delay: 260, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'both' });
      for (var k = 0; k < 10; k++) {
        var sp = doc.createElement('span'), ang = (Math.PI * 2 * k) / 10 + Math.random() * 0.35, dist = Math.max(w, h) * 0.6 + Math.random() * 34;
        sp.className = 'jy-spark'; fx.appendChild(sp);
        var ex = Math.round(Math.cos(ang) * dist), ey = Math.round(Math.sin(ang) * dist);
        sp.animate([
          { translate: '0 0', scale: '0.3', opacity: 0, offset: 0, easing: 'ease-out' },
          { translate: Math.round(ex * 0.35) + 'px ' + Math.round(ey * 0.35) + 'px', scale: '1.3', opacity: 1, offset: 0.3, easing: 'cubic-bezier(.2,.6,.3,1)' },
          { translate: ex + 'px ' + ey + 'px', scale: '0.5', opacity: 0, offset: 1 }
        ], { duration: 900, delay: 300 + k * 18, easing: 'linear', fill: 'both' });
      }
      setTimeout(function () { if (fx.isConnected) fx.remove(); }, 1500);
      if (root.navigator && typeof root.navigator.vibrate === 'function') root.navigator.vibrate(10);
    } catch (_) {}
  }
  new MutationObserver(function (records) {
    records.forEach(function (r) {
      var t = r.target;
      if (!t.classList) return;
      if (r.attributeName === 'aria-pressed' && t.classList.contains('jr-reveal') && t.getAttribute('aria-pressed') === 'true') turn(t);
      else if (r.attributeName === 'class' && t.classList.contains('tarot-reveal') && t.classList.contains('flipping')) turn(t);  // 塔羅結果頁翻牌
    });
  }).observe(doc.documentElement, { attributes: true, subtree: true, attributeFilter: ['aria-pressed', 'class'] });

  /* ── 6. 發牌：結果牌陣從上方牌堆依序飛落到牌位（同一次占卜只發一次） ── */
  var dealt = new Set();
  function deal(cards) {
    if (reduced() || !canAnimate || !cards.length) return;
    var ox = root.innerWidth / 2, oy = root.innerHeight * 0.1, n = 0;
    cards.forEach(function (c) {
      var b = c.getBoundingClientRect(); if (!b.width || b.top > root.innerHeight * 1.4) { c.style.removeProperty('opacity'); return; }
      var dx = ox - (b.left + b.width / 2), dy = oy - (b.top + b.height / 2), rot = (n % 2 ? 1 : -1) * (8 + (n * 5) % 9), delay = n * 90;
      // 先解碼牌圖再發牌（最多等 450ms），避免飛行途中顯示暗面。牌在等待期間以內聯透明度隱藏。
      var imgs = Array.prototype.slice.call(c.querySelectorAll('img'));
      var ready = Promise.race([Promise.all(imgs.map(function (im) { return im.decode ? im.decode().catch(function () {}) : null; })), new Promise(function (r) { setTimeout(r, 450); })]);
      ready.then(function () {
        try {
          c.animate([
            { translate: dx + 'px ' + dy + 'px', rotate: rot + 'deg', scale: '0.5', opacity: 0, offset: 0 },
            { opacity: 1, offset: 0.18 },
            { translate: '0 -8px', rotate: '0deg', scale: '1.04', opacity: 1, offset: 0.8 },
            { translate: '0 0', rotate: '0deg', scale: '1', opacity: 1, offset: 1 }
          ], { duration: 680, delay: delay, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards' });
        } catch (_) {}
        c.style.removeProperty('opacity');
      });
      n++;
    });
  }
  new MutationObserver(function (records) {
    var batch = [];
    records.forEach(function (r) {
      r.addedNodes.forEach(function (node) {
        if (node.nodeType !== 1 || !node.querySelectorAll) return;
        node.querySelectorAll('.ln-card,.ootk-result-card,.jy-ts-card').forEach(function (c) { batch.push(c); });
        if (node.matches && node.matches('.ln-card,.ootk-result-card,.jy-ts-card')) batch.push(node);
      });
    });
    if (!batch.length) return;
    var fresh = batch.filter(function (c) {
      var ln = c.closest('#ln-screen'); if (ln && ln.getAttribute('data-flow-view') !== 'result') return false;
      var k = (ln ? 'ln' : c.classList.contains('jy-ts-card') ? 'ts' : 'ootk') + '|' + (c.textContent || '').replace(/\s+/g, '').slice(0, 30);
      if (dealt.has(k)) return false; dealt.add(k); return true;
    });
    if (!fresh.length || reduced() || !canAnimate) return;
    fresh.forEach(function (c) { c.style.opacity = '0'; });  // 觀察者在繪製前執行：先藏起，避免先閃現在牌位
    requestAnimationFrame(function () { deal(fresh); });
  }).observe(doc.documentElement, { childList: true, subtree: true });

  /* ── 7. 塔羅抽牌飛行：點下牌堆中的一張，牌背沿弧線飛向抽牌進度區（原本的抬起淡出照舊，這裡只疊特效） ── */
  // 牌堆在「按下」時就完成抽牌（比 click 早），所以在 pointerdown 擷取階段觸發，搶在牌被標為已抽之前讀取位置。
  doc.addEventListener('pointerdown', function (e) {
    var card = e.target && e.target.closest && e.target.closest('.tarot-deck-card');
    if (!card || card.classList.contains('picked') || reduced() || !canAnimate) return;
    try {
      var r = card.getBoundingClientRect(); if (!r.width) return;
      var dock = doc.getElementById('tarot-dock-action'), tr = dock && dock.getBoundingClientRect();
      var tx = tr && tr.width ? tr.left + tr.width / 2 : root.innerWidth / 2, ty = tr && tr.width ? tr.top + tr.height / 2 : root.innerHeight * 0.85;
      // 不複製原牌的 3D 結構（背面靠 rotateY＋背面隱藏才可見，脫離原環境會變透明）：讀出牌背圖另建實心分身。
      var src = null, all = [card].concat(Array.prototype.slice.call(card.querySelectorAll('*')));
      for (var q = 0; q < all.length && !src; q++) {
        var el = all[q];
        if (el.tagName === 'IMG' && (el.currentSrc || el.src)) { src = 'url("' + (el.currentSrc || el.src) + '")'; break; }
        var bg = getComputedStyle(el).backgroundImage; if (bg && bg.indexOf('url(') >= 0) src = bg;
      }
      var ghost = doc.createElement('div'); ghost.className = 'jy-card-ghost'; ghost.setAttribute('aria-hidden', 'true');
      ghost.style.cssText = 'position:fixed;left:' + r.left + 'px;top:' + r.top + 'px;width:' + r.width + 'px;height:' + r.height + 'px;z-index:2147481000;pointer-events:none;background:' + (src ? src + ' center/cover no-repeat,' : '') + 'linear-gradient(150deg,#f3e3bd,#c9a35f);';
      doc.body.appendChild(ghost);
      var dx = tx - (r.left + r.width / 2), dy = ty - (r.top + r.height / 2), lift = Math.min(-70, dy * 0.35 - 90);
      ghost.animate([
        { translate: '0 0', rotate: '0deg', scale: '1', opacity: 1, offset: 0, easing: 'cubic-bezier(.2,.8,.3,1)' },
        { translate: (dx * 0.35) + 'px ' + lift + 'px', rotate: '-14deg', scale: '1.12', opacity: 1, offset: 0.38, easing: 'cubic-bezier(.5,0,.75,0)' },
        { translate: dx + 'px ' + dy + 'px', rotate: '8deg', scale: '0.28', opacity: 0.15, offset: 1 }
      ], { duration: 720, easing: 'linear', fill: 'forwards' }).onfinish = function () { ghost.remove(); };
      setTimeout(function () { if (ghost.isConnected) ghost.remove(); }, 1200);
      if (dock) dock.animate([{ scale: '1' }, { scale: '1.06' }, { scale: '1' }], { duration: 360, delay: 640, easing: 'cubic-bezier(.34,1.56,.64,1)' });
    } catch (_) {}
  }, { capture: true, passive: true });

  root.JYMotion = Object.freeze({ version: VERSION, bloom: bloom, cascade: cascade, reveal: mark, turn: turn, deal: deal });
})(typeof window !== 'undefined' ? window : globalThis);
