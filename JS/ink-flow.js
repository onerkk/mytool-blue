// ═══════════════════════════════════════════════════════════════════
// 靜月之光 墨流 ink-flow v1.1 (2026/6/11)
// Suminagashi（墨流し）墨暈層——v1.1 改為「面板內掛載」模式：
//   首頁不畫（首頁背景已豐富）；偵測全版工具面板（八字/紫微/梅花/雷諾曼等
//   position:fixed 高 z-index 容器）打開時，把畫布掛進面板內部當底紋，
//   關閉自動收回。畫布為面板的 z-index:-1 子層＝蓋過面板底色、襯在表單下。
// 技術：canvas 回饋平流（每幀微旋/微縮重繪自身＝墨絲拖曳）＋流場墨點。
// 效能：0.5x 內部解析度、分頁隱藏即停、reduced-motion 靜態墨暈、低階自動降檔。
// API：window.JY_INK = { burst(x,y), setPalette(name), pause(), resume() }
// ═══════════════════════════════════════════════════════════════════
(function () {
  'use strict';
  if (typeof document === 'undefined' || window.JY_INK) return;

  var GOLD = [201, 168, 76], MOON = [233, 226, 207], CRIMSON = [158, 53, 72],
      VIOLET = [126, 95, 174], INDIGO = [74, 93, 168], JADE = [79, 143, 110];
  var PALETTES = {
    'default': [GOLD, MOON, CRIMSON],
    'bazi':    [GOLD, CRIMSON, MOON],   // 八字：金硃
    'ziwei':   [VIOLET, GOLD, MOON],    // 紫微：紫金
    'meihua':  [JADE, GOLD, MOON],      // 梅花：翠金
    'lenormand': [INDIGO, MOON, GOLD],  // 雷諾曼：靛月白
    'oracle':  [MOON, GOLD, CRIMSON],
    'tarot':   [VIOLET, GOLD, MOON],
    'ootk':    [INDIGO, GOLD, MOON]
  };
  var palette = PALETTES['default'], manualPalette = false;

  var reduced = false;
  try { reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  var cv = document.createElement('canvas');
  cv.id = 'jy-ink';
  cv.setAttribute('aria-hidden', 'true');
  cv.setAttribute('data-no-ink', '1');
  // 面板內子層：absolute 鋪滿面板可視高、z-index:-1（面板自身為 stacking context：
  // 負 z 子層畫在面板背景之上、靜態內容之下——正是「表單底紋」要的層位）
  cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;z-index:-1;pointer-events:none;';
  var buf = document.createElement('canvas');
  var ctx = null, btx = null, W = 0, H = 0;
  var SCALE = 0.5, CAPW = 560;
  var wisps = [], WISP_CAP = 14;
  var running = false, rafId = 0, t = 0;
  var lastSpawn = 0, nextAmbient = 900;
  var lastPointer = 0;
  var emaDt = 16, degraded = false, lastTs = 0;
  var host = null; // 目前掛載的面板

  function sizeUp() {
    var w = Math.min(window.innerWidth, 1200), h = Math.min(window.innerHeight, 1600);
    var s = Math.min(SCALE, CAPW / Math.max(1, w));
    W = Math.max(2, Math.round(w * s)); H = Math.max(2, Math.round(h * s));
    cv.width = W; cv.height = H; buf.width = W; buf.height = H;
    ctx = cv.getContext('2d'); btx = buf.getContext('2d');
  }

  function flowAngle(x, y, tt) {
    var nx = x / W * 4.2, ny = y / H * 4.2;
    return Math.sin(nx * 1.7 + tt * 0.00021) * 1.6
         + Math.cos(ny * 1.3 - tt * 0.00017 + nx * 0.8) * 1.4
         + Math.sin((nx + ny) * 0.9 + tt * 0.00009) * 0.9;
  }

  function spawnDrop(px, py, n, small) {
    var k = n || (3 + (Math.random() * 3 | 0));
    for (var i = 0; i < k && wisps.length < WISP_CAP; i++) {
      var c = palette[(Math.random() * palette.length) | 0];
      wisps.push({
        x: px + (Math.random() - 0.5) * W * 0.06,
        y: py + (Math.random() - 0.5) * H * 0.06,
        born: t + i * 260,
        life: (small ? 5200 : 7600) + Math.random() * 2800,
        r0: 3 + Math.random() * 4,
        r1: (small ? 26 : 46) + Math.random() * (small ? 16 : 30),
        sp: 0.16 + Math.random() * 0.22,
        c: c
      });
    }
  }

  function drawWisp(wp) {
    var age = t - wp.born; if (age < 0) return true;
    var u = age / wp.life; if (u >= 1) return false;
    var ang = flowAngle(wp.x, wp.y, t) + Math.sin(wp.born) * 0.6;
    wp.x += Math.cos(ang) * wp.sp; wp.y += Math.sin(ang) * wp.sp;
    var env = Math.sin(Math.min(1, u * 1.15) * Math.PI);
    var r = wp.r0 + (wp.r1 - wp.r0) * (1 - Math.pow(1 - u, 2));
    var a = 0.085 * env;
    var g = ctx.createRadialGradient(wp.x, wp.y, 0, wp.x, wp.y, r);
    var c = wp.c;
    g.addColorStop(0,    'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + (a).toFixed(3) + ')');
    g.addColorStop(0.55, 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + (a * 0.45).toFixed(3) + ')');
    g.addColorStop(1,    'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(wp.x, wp.y, r, 0, 6.2832); ctx.fill();
    return true;
  }

  function frame(ts) {
    if (!running) return;
    rafId = requestAnimationFrame(frame);
    // 面板被關掉（DOM 拔除）→ 自動收回待命
    if (!host || !host.isConnected || !cv.isConnected) { unmount(); return; }
    var dt = lastTs ? ts - lastTs : 16; lastTs = ts; t += Math.min(dt, 50);
    emaDt = emaDt * 0.95 + dt * 0.05;
    if (!degraded && emaDt > 26) { degraded = true; SCALE = 0.38; WISP_CAP = 8; sizeUp(); }

    btx.globalCompositeOperation = 'copy';
    btx.drawImage(cv, 0, 0);
    ctx.globalCompositeOperation = 'copy';
    ctx.save();
    var cx = W * (0.5 + Math.sin(t * 0.00006) * 0.18);
    var cyc = H * (0.46 + Math.cos(t * 0.00005) * 0.18);
    ctx.translate(cx, cyc);
    ctx.rotate(0.0011 + Math.sin(t * 0.00004) * 0.0007);
    ctx.scale(1.0032, 1.0032);
    ctx.translate(-cx, -cyc);
    ctx.drawImage(buf, 0, 0);
    ctx.restore();

    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = 'rgba(0,0,0,0.016)';
    ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'source-over';

    for (var i = wisps.length - 1; i >= 0; i--) { if (!drawWisp(wisps[i])) wisps.splice(i, 1); }

    if (t - lastSpawn > nextAmbient) {
      lastSpawn = t;
      nextAmbient = (degraded ? 11000 : 7000) + Math.random() * 4000;
      spawnDrop(W * (0.15 + Math.random() * 0.7), H * (0.12 + Math.random() * 0.6));
    }
  }

  function start() { if (running || reduced) return; running = true; lastTs = 0; rafId = requestAnimationFrame(frame); }
  function stop() { running = false; if (rafId) cancelAnimationFrame(rafId); }

  function staticWash() {
    var spots = [[0.28, 0.22, 70], [0.72, 0.4, 88], [0.45, 0.72, 76]];
    for (var i = 0; i < spots.length; i++) {
      var c = palette[i % palette.length];
      var x = W * spots[i][0], y = H * spots[i][1], r = spots[i][2] * (W / 560);
      var g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',0.07)');
      g.addColorStop(1, 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.2832); ctx.fill();
    }
  }

  // ── 依面板內容自動配色（bzx=八字 zw=紫微 mhx=梅花 ln=雷諾曼） ──
  function sniffPalette() {
    if (manualPalette || !host) return;
    try {
      var key = host.querySelector('[id^="bzx"]') ? 'bazi'
              : host.querySelector('[id^="zw"]')  ? 'ziwei'
              : host.querySelector('[id^="mhx"], [id^="mh-"]') ? 'meihua'
              : host.querySelector('[id^="ln-"], [id^="ln"]') ? 'lenormand'
              : 'default';
      palette = PALETTES[key];
    } catch (e) {}
  }

  // ── 面板內掛載／收回 ──
  function mount(panel) {
    if (host === panel) return;
    unmount();
    host = panel;
    try { panel.insertBefore(cv, panel.firstChild); } catch (e) { host = null; return; }
    sizeUp();
    ctx.clearRect(0, 0, W, H);
    wisps = []; t = 0; lastSpawn = 0; nextAmbient = 700;
    sniffPalette();
    setTimeout(sniffPalette, 400); // 面板內容晚一步渲染時再嗅一次
    if (reduced) { staticWash(); return; }
    start();
  }
  function unmount() {
    stop();
    if (cv.parentNode) { try { cv.parentNode.removeChild(cv); } catch (e) {} }
    host = null; wisps = []; manualPalette = false; palette = PALETTES['default'];
  }

  // ── 面板偵測：fixed＋高 z-index＋近全螢幕＝工具頁打開 ──
  function isPanel(el) {
    if (!el || el.nodeType !== 1 || el === cv || el.getAttribute && el.getAttribute('data-no-ink')) return false;
    var cs;
    try { cs = window.getComputedStyle(el); } catch (e) { return false; }
    if (cs.position !== 'fixed') return false;
    var z = parseInt(cs.zIndex, 10);
    if (!(z >= 3000)) return false;
    var r = el.getBoundingClientRect();
    if (r.width < window.innerWidth * 0.85 || r.height < window.innerHeight * 0.7) return false;
    // 載入中遮罩（半透明＋短命）不掛：背景帶 rgba 透明度視為遮罩
    if (/rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*0?\./.test(cs.backgroundColor)) return false;
    return true;
  }

  function scan(nodes) {
    if (host && host.isConnected) return; // 已掛載就不搶
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      if (isPanel(n)) { mount(n); return; }
      // 面板可能包在 wrapper 裡：往下找一層
      if (n.nodeType === 1 && n.children) {
        for (var j = 0; j < n.children.length; j++) {
          if (isPanel(n.children[j])) { mount(n.children[j]); return; }
        }
      }
    }
  }

  function boot() {
    if (!document.body) return;
    try {
      var mo = new MutationObserver(function (muts) {
        var added = [];
        for (var i = 0; i < muts.length; i++) {
          for (var j = 0; j < muts[i].addedNodes.length; j++) added.push(muts[i].addedNodes[j]);
        }
        if (added.length) scan(added);
        if (host && !host.isConnected) unmount();
      });
      mo.observe(document.body, { childList: true, subtree: false });
    } catch (e) {}
    // 開頁時面板可能已在（重新整理停在工具頁）
    scan([].slice.call(document.body.children));

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stop(); else if (host && !reduced) start();
    });
    var rsT;
    window.addEventListener('resize', function () {
      clearTimeout(rsT);
      rsT = setTimeout(function () { if (host) { sizeUp(); spawnDrop(W * 0.5, H * 0.4, 3); } }, 320);
    });
    window.addEventListener('pointerdown', function (ev) {
      if (!host || !running) return;
      var now = Date.now();
      if (now - lastPointer < 700) return;
      lastPointer = now;
      var s = W / Math.max(1, window.innerWidth);
      spawnDrop(ev.clientX * s, ev.clientY * s, 2, true);
    }, { passive: true });
  }

  window.JY_INK = {
    version: '1.1',
    burst: function (x, y) {
      if (!host) return;
      var s = W / Math.max(1, window.innerWidth);
      spawnDrop((x == null ? window.innerWidth / 2 : x) * s, (y == null ? window.innerHeight / 2 : y) * s, 4);
    },
    setPalette: function (name) { manualPalette = true; palette = PALETTES[name] || PALETTES['default']; },
    pause: stop,
    resume: function () { if (host) start(); }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
