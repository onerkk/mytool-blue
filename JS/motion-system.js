/* 靜月之光 · 共用動態系統 / 20261021vedic47
 * 1) 門卡綻放進房  2) 結果分段浮現  3) 按壓光暈＋Android 輕震  4) 回首頁門卡依序歸位
 * 原則：不攔截、不延遲任何既有點擊（房間照常立即開啟，特效只疊在上面）；只動 transform/opacity；
 * 「減少動態」時全部停用；任何一步失敗都靜默略過，不影響流程。 */
(function (root) {
  'use strict';
  if (!root.document || !root.Element) return;
  var doc = root.document, VERSION = '20261021vedic47';
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
    if (wasHome === false && now) { seen.clear(); dealt.clear(); shapes.clear(); recent = Object.create(null); cascade(); }
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

  /* ── 8. 盤面成形：八字四柱、紫微星環、梅花六爻（共用 immersive-experience 舞台；原進場動畫被 animation/transition:none 關閉） ── */
  var STAGE = '[data-living-pillars],.jx-orbit,.jx-hex-lines,.wx-chart-svg', built = new WeakSet();
  function inView(el) { var b = el.getBoundingClientRect(); return b.width > 0 && b.bottom > 0 && b.top < root.innerHeight; }
  function ritualOpen() { return !!doc.querySelector('dialog.jr-dialog[open]'); }
  var NAMEP = '.nm-character,.nm-grid-fact,.lr-transmission';  // 姓名學字卡／五格、六壬三傳：無專屬容器 class，以父層為盤面容器
  function parts(c) {
    var nm = c.querySelectorAll(':scope > .nm-character, :scope > .nm-grid-fact, :scope > .lr-transmission'); if (nm.length) return Array.prototype.slice.call(nm);
    if (c.querySelector && c.querySelector(':scope > .vd-chart-border')) return Array.prototype.slice.call(c.children).filter(function (x) { return !/^(defs|style|title|desc)$/i.test(x.tagName); });
    if (c.matches('.wx-chart-svg')) return Array.prototype.slice.call(c.children).filter(function (x) { return !/^(defs|style|title|desc)$/i.test(x.tagName); });
    if (c.matches('[data-living-pillars]')) return Array.prototype.slice.call(c.querySelectorAll('.jx-pillar'));
    if (c.matches('.jx-orbit')) return Array.prototype.slice.call(c.querySelectorAll('.jx-orbit-aura,.jx-orbit-lines,.jx-palace,.jx-orbit-center'));
    return Array.prototype.slice.call(c.querySelectorAll('.jx-yao'));
  }
  function release(list) { list.forEach(function (el) { el.style.removeProperty('opacity'); }); }
  function assemble(c, force) {
    if ((!force && built.has(c)) || reduced() || !canAnimate) { release(parts(c)); return; }
    built.add(c); c.setAttribute('data-jy-assembled', String(Date.now() % 100000));
    var list = parts(c), EASE = 'cubic-bezier(.16,1,.3,1)';
    try {
      if (c.querySelector(':scope > .vd-chart-border')) {  // 印度星盤：外框沿路徑畫出 → 十二宮依序浮現 → 行星在宮內彈出
        var cells = 0;
        list.forEach(function (el) {
          if (el.matches('.vd-chart-border')) {
            var L = 1000; try { L = el.getTotalLength(); } catch (_) {}
            el.animate([{ strokeDasharray: L + ' ' + L, strokeDashoffset: String(L) }, { strokeDasharray: L + ' ' + L, strokeDashoffset: '0' }], { duration: 900, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'backwards' });
          } else {
            el.style.transformBox = 'fill-box'; el.style.transformOrigin = 'center';
            el.animate([{ opacity: 0, scale: '0.82' }, { opacity: 1, scale: '1' }], { duration: 520, delay: 320 + cells * 70, easing: EASE, fill: 'backwards' }); cells++;
          }
        });
        Array.prototype.slice.call(c.querySelectorAll('.vd-cell-planets')).forEach(function (p, j) {
          p.style.transformBox = 'fill-box'; p.style.transformOrigin = 'center';
          p.animate([{ opacity: 0, scale: '0.4' }, { opacity: 1, scale: '1.18', offset: 0.7 }, { opacity: 1, scale: '1' }], { duration: 520, delay: 320 + cells * 70 + 120 + j * 110, easing: EASE, fill: 'backwards' });
        });
        setTimeout(function () { c.querySelectorAll('[style*=transform-box]').forEach(function (el) { el.style.removeProperty('transform-box'); el.style.removeProperty('transform-origin'); }); }, 3600);
      } else       if (c.matches('.wx-chart-svg')) {  // 西洋星盤（扁平 SVG，無分組）：依幾何分類——圓由中心擴開、分隔線繞圈畫出、外圈符號浮現、行星符號依角度彈出、相位線最後畫出
        var vb = (c.getAttribute('viewBox') || '0 0 600 600').split(/[\s,]+/).map(Number), cx = vb[0] + vb[2] / 2, cy = vb[1] + vb[3] / 2, R = Math.min(vb[2], vb[3]) / 2;
        var turnOf = function (x, y) { return (Math.atan2(y - cy, x - cx) + Math.PI) / (2 * Math.PI); };
        list.forEach(function (el) {
          var tag = el.tagName.toLowerCase();
          if (tag === 'circle' || tag === 'ellipse') {
            el.style.transformBox = 'view-box'; el.style.transformOrigin = cx + 'px ' + cy + 'px';
            el.animate([{ scale: '0.55', opacity: 0 }, { scale: '1', opacity: 1 }], { duration: 760, delay: 60, easing: EASE, fill: 'backwards' });
          } else if (tag === 'line') {
            var x1 = +el.getAttribute('x1') || 0, y1 = +el.getAttribute('y1') || 0, x2 = +el.getAttribute('x2') || 0, y2 = +el.getAttribute('y2') || 0;
            var len = Math.hypot(x2 - x1, y2 - y1) || 1, aspect = Math.max(Math.hypot(x1 - cx, y1 - cy), Math.hypot(x2 - cx, y2 - cy)) < R * 0.6, o = turnOf((x1 + x2) / 2, (y1 + y2) / 2);
            el.animate([{ strokeDasharray: len + ' ' + len, strokeDashoffset: String(len) }, { strokeDasharray: len + ' ' + len, strokeDashoffset: '0' }],
              { duration: aspect ? 640 : 420, delay: aspect ? 1400 + o * 650 : 320 + o * 520, easing: 'cubic-bezier(.3,.6,.2,1)', fill: 'backwards' });
          } else {
            var bx = null; try { bx = el.getBBox(); } catch (_) {}
            var mx = bx ? bx.x + bx.width / 2 : cx, my = bx ? bx.y + bx.height / 2 : cy, outer = Math.hypot(mx - cx, my - cy) > R * 0.72, o2 = turnOf(mx, my);
            if (tag === 'text' || tag === 'use') { el.style.transformBox = 'fill-box'; el.style.transformOrigin = 'center';
              el.animate([{ opacity: 0, scale: '0.4' }, { opacity: 1, scale: '1.18', offset: 0.7 }, { opacity: 1, scale: '1' }], { duration: 520, delay: outer ? 380 + o2 * 480 : 880 + o2 * 520, easing: EASE, fill: 'backwards' }); }
            else el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 500, delay: 300 + o2 * 500, easing: 'ease-out', fill: 'backwards' });
          }
        });
        setTimeout(function () { list.forEach(function (el) { el.style.removeProperty('transform-box'); el.style.removeProperty('transform-origin'); }); }, 3600);
      } else       if (list[0] && list[0].matches('.lr-transmission')) {  // 六壬三傳：初→中→末依序由左滑入，像事情沿三傳推進
        list.forEach(function (el, i) {
          el.animate([
            { translate: '-28px 0', opacity: 0, filter: 'brightness(1.7)', offset: 0 },
            { translate: '4px 0', opacity: 1, filter: 'brightness(1.15)', offset: 0.7 },
            { translate: '0 0', opacity: 1, filter: 'none', offset: 1 }
          ], { duration: 700, delay: 140 + i * 280, easing: EASE, fill: 'backwards' });
        });
      } else if (list[0] && list[0].matches(NAMEP)) {  // 字卡：墨暈中清晰成形；五格：依序升起
        list.forEach(function (el, i) {
          var ink = el.matches('.nm-character');
          el.animate([
            { translate: '0 22px', scale: '0.92', opacity: 0, filter: ink ? 'blur(4px) brightness(1.7)' : 'blur(2px)', offset: 0 },
            { translate: '0 -4px', scale: '1.02', opacity: 1, filter: 'blur(0) brightness(1.05)', offset: 0.7 },
            { translate: '0 0', scale: '1', opacity: 1, filter: 'none', offset: 1 }
          ], { duration: ink ? 760 : 620, delay: 120 + i * (ink ? 200 : 120), easing: EASE, fill: 'backwards' });
        });
      } else if (c.matches('[data-living-pillars]')) {
        list.forEach(function (p, i) {
          p.animate([
            { translate: '0 34px', scale: '0.9', opacity: 0, filter: 'blur(4px)', offset: 0 },
            { translate: '0 -6px', scale: '1.03', opacity: 1, filter: 'blur(0)', offset: 0.7 },
            { translate: '0 0', scale: '1', opacity: 1, filter: 'none', offset: 1 }
          ], { duration: 780, delay: 120 + i * 160, easing: EASE, fill: 'backwards' });
          if (p.getAttribute('data-pillar') === 'day')  // 日主：代表「自己」的那一柱，落定後泛起金光
            p.animate([{ boxShadow: '0 0 0 0 #f3d79a00' }, { boxShadow: '0 0 0 2px #f3d79aaa, 0 0 34px 8px #e9cf9877', offset: 0.45 }, { boxShadow: '0 0 0 0 #f3d79a00' }],
              { duration: 1400, delay: 120 + i * 160 + 700, easing: 'ease-in-out' });
        });
      } else if (c.matches('.jx-orbit')) {
        var k = 0;
        list.forEach(function (el) {
          if (el.matches('.jx-orbit-aura')) el.animate([{ scale: '0.6', opacity: 0 }, { scale: '1', opacity: 1 }], { duration: 900, easing: EASE, fill: 'backwards' });
          else if (el.matches('.jx-orbit-lines')) el.animate([{ rotate: '-24deg', opacity: 0 }, { rotate: '0deg', opacity: 1 }], { duration: 1100, delay: 150, easing: EASE, fill: 'backwards' });
          else if (el.matches('.jx-palace')) { el.animate([{ scale: '0.35', opacity: 0 }, { scale: '1.08', opacity: 1, offset: 0.65 }, { scale: '1', opacity: 1 }], { duration: 620, delay: 280 + k * 65, easing: EASE, fill: 'backwards' }); k++; }
          else el.animate([{ scale: '0.8', opacity: 0, filter: 'blur(3px)' }, { scale: '1', opacity: 1, filter: 'blur(0)' }], { duration: 700, delay: 280 + 12 * 65 + 120, easing: EASE, fill: 'backwards' });
        });
      } else {
        list.slice().reverse().forEach(function (y, i) {  // 由初爻（最下）往上
          y.animate([{ clipPath: 'inset(0 100% 0 0)', filter: 'brightness(1.9)' }, { clipPath: 'inset(0 0 0 0)', filter: 'none' }], { duration: 600, delay: 120 + i * 170, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'backwards' });
        });
      }
    } catch (_) {}
    release(list);
  }
  var waiting = null;
  if ('IntersectionObserver' in root) waiting = new IntersectionObserver(function (es) { es.forEach(function (x) { if (x.isIntersecting) { waiting.unobserve(x.target); assemble(x.target); } }); }, { threshold: 0.15 });
  // 以「內容」去重：有些房間會定時重繪（六壬活時時鐘），每次重繪都是新元素；若以元素判斷會無限從透明重播而永遠看不見。
  var shapes = new Set(), recent = Object.create(null);
  function shape(c) { return parts(c).map(function (el) { return (el.textContent || '').replace(/\s+/g, ''); }).join('|').slice(0, 240); }
  function adopt(c) {
    if (built.has(c) || reduced() || !canAnimate) return;
    var sk = shape(c), first = parts(c)[0], host = c.closest('[id]');
    var tk = (host ? host.id : '') + '|' + (first && first.getAttribute ? String(first.getAttribute('class') || first.tagName).split(' ')[0] : ''), now = Date.now();  // SVG 的 className 是物件，改讀屬性
    // 第二道防護：同房間同類盤面 60 秒內只成形一次（內容含會變動的文字時，內容去重會被繞過）。
    if (!sk) return;  // 內容尚未畫完（例如星盤先畫圓線、文字最後才加）：先不標記，等內容出現再成形
    if (shapes.has(sk) || (recent[tk] && now - recent[tk] < 60000)) { built.add(c); release(parts(c)); return; }
    shapes.add(sk); recent[tk] = now;
    if (inView(c)) {
      var list = parts(c); list.forEach(function (el) { el.style.opacity = '0'; });  // 繪製前先藏，避免先閃完整盤面
      var go = function () { if (ritualOpen()) { setTimeout(go, 200); return; } requestAnimationFrame(function () { assemble(c); }); };
      go();
      setTimeout(function () { release(list); }, 6000);  // 保險：任何情況下 6 秒後一定可見
    } else if (waiting) waiting.observe(c);
  }
  // 舞台可能是「既有容器、內容後塞」（紫微星環），所以新加入的元素只要位於盤面容器內也算；同一批變動收齊後再處理。
  new MutationObserver(function (records) {
    var found = new Set();
    records.forEach(function (r) {
      r.addedNodes.forEach(function (n) {
        if (n.nodeType !== 1) return;
        if (n.matches && n.matches(STAGE)) found.add(n);
        else if (n.closest) { var host = n.closest(STAGE); if (host) found.add(host); }
        if (n.querySelectorAll) n.querySelectorAll(STAGE).forEach(function (x) { found.add(x); });
      });
    });
    records.forEach(function (r) {
      r.addedNodes.forEach(function (n) {
        if (n.nodeType !== 1) return;
        if (n.matches && n.matches(NAMEP) && n.parentElement) found.add(n.parentElement);
        if (n.querySelectorAll) n.querySelectorAll(NAMEP).forEach(function (x) { if (x.parentElement) found.add(x.parentElement); });
        if (n.matches && n.matches('.vd-chart-border') && n.ownerSVGElement) found.add(n.ownerSVGElement);
        if (n.querySelectorAll) n.querySelectorAll('.vd-chart-border').forEach(function (x) { if (x.ownerSVGElement) found.add(x.ownerSVGElement); });
      });
    });
    // 西洋儀式畫面（.wx-ceremony）有自己的星盤演出，不介入；只在結果頁星盤成形，否則結果頁會被內容去重跳過。
    found.forEach(function (c) { if (c.closest && c.closest('.wx-ceremony,[class*=vdr-]')) return; if (parts(c).length) adopt(c); });
  }).observe(doc.documentElement, { childList: true, subtree: true });

  root.JYMotion = Object.freeze({ version: VERSION, bloom: bloom, cascade: cascade, reveal: mark, turn: turn, deal: deal, assemble: assemble });
})(typeof window !== 'undefined' ? window : globalThis);
