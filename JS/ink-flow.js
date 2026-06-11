// ═══════════════════════════════════════════════════════════════════
// 靜月之光 墨流 ink-flow v1.0 (2026/6/11)
// Suminagashi（墨流し）風格背景墨暈層——全站各層 UI 共用的氛圍底。
// 技術：canvas 回饋平流（每幀將畫布自身微旋轉/微縮放重繪＝墨絲拖曳）
//       ＋ sin/cos 流場驅動的墨點暈染。無相依、行動裝置優先。
// 效能守則：內部解析度 0.5x（上限 560px 寬）、分頁隱藏即停、
//           prefers-reduced-motion 改靜態墨暈、幀時監測自動降檔。
// API：window.JY_INK = { burst(x,y), setPalette(name), pause(), resume() }
//       自動掛勾 pickTool() 依工具切換墨色。
// ═══════════════════════════════════════════════════════════════════
(function () {
  'use strict';
  if (typeof document === 'undefined' || window.JY_INK) return;

  // ── 品牌墨色（依工具分色：金=品牌、月白=月光、絳=硃砂） ──
  var GOLD = [201, 168, 76], MOON = [233, 226, 207], CRIMSON = [158, 53, 72],
      VIOLET = [126, 95, 174], INDIGO = [74, 93, 168], JADE = [79, 143, 110];
  var PALETTES = {
    'default': [GOLD, MOON, CRIMSON],
    'tarot':   [VIOLET, GOLD, MOON],
    'ootk':    [INDIGO, GOLD, MOON],
    'full':    [GOLD, CRIMSON, MOON],
    'ziwei':   [GOLD, CRIMSON, MOON],
    'meihua':  [JADE, GOLD, MOON],
    'lenormand': [INDIGO, MOON, GOLD],
    'oracle':  [MOON, GOLD, CRIMSON]
  };
  var palette = PALETTES['default'];

  var reduced = false;
  try { reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  // ── 畫布建置：fixed 滿版、z-index:-1（蓋在 body 底色上、襯在內容下） ──
  var cv = document.createElement('canvas');
  cv.id = 'jy-ink';
  cv.setAttribute('aria-hidden', 'true');
  cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;z-index:-1;pointer-events:none;';
  var buf = document.createElement('canvas');
  var ctx = null, btx = null, W = 0, H = 0;
  var SCALE = 0.5, CAPW = 560;          // 內部解析度（模糊墨暈遮得住低解析）
  var wisps = [], WISP_CAP = 14;
  var running = false, rafId = 0, t = 0;
  var lastSpawn = 0, nextAmbient = 900; // 開頁 0.9 秒先來一滴
  var lastPointer = 0;
  var emaDt = 16, degraded = false, lastTs = 0;

  function sizeUp() {
    var w = Math.min(window.innerWidth, 1200), h = Math.min(window.innerHeight, 1600);
    var s = Math.min(SCALE, CAPW / Math.max(1, w));
    W = Math.max(2, Math.round(w * s)); H = Math.max(2, Math.round(h * s));
    cv.width = W; cv.height = H; buf.width = W; buf.height = H;
    ctx = cv.getContext('2d'); btx = buf.getContext('2d');
  }

  // ── 流場：sin/cos 疊加出近似亂流的角度場（夠像、極便宜） ──
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
    var env = Math.sin(Math.min(1, u * 1.15) * Math.PI);            // 淡入→淡出
    var r = wp.r0 + (wp.r1 - wp.r0) * (1 - Math.pow(1 - u, 2));     // ease-out 擴散
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
    var dt = lastTs ? ts - lastTs : 16; lastTs = ts; t += Math.min(dt, 50);
    emaDt = emaDt * 0.95 + dt * 0.05;
    if (!degraded && emaDt > 26) {            // 低階機自動降檔（一次性）
      degraded = true; SCALE = 0.38; WISP_CAP = 8; sizeUp();
    }

    // ① 平流回饋：整層微旋微縮重繪自身 → 墨絲被「水流」拖出大理石紋
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

    // ② 消散：以 destination-out 緩慢抹除 → 舊墨溶回透明、不蓋站方底色
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = 'rgba(0,0,0,0.016)';
    ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'source-over';

    // ③ 活墨點推進
    for (var i = wisps.length - 1; i >= 0; i--) { if (!drawWisp(wisps[i])) wisps.splice(i, 1); }

    // ④ 環境滴墨
    if (t - lastSpawn > nextAmbient) {
      lastSpawn = t;
      nextAmbient = (degraded ? 11000 : 7000) + Math.random() * 4000;
      spawnDrop(W * (0.15 + Math.random() * 0.7), H * (0.12 + Math.random() * 0.6));
    }
  }

  function start() { if (running || reduced) return; running = true; lastTs = 0; rafId = requestAnimationFrame(frame); }
  function stop() { running = false; if (rafId) cancelAnimationFrame(rafId); }

  // ── reduced-motion：靜態三滴墨暈，一次畫完不動畫 ──
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

  function boot() {
    if (!document.body) return;
    document.body.appendChild(cv);
    sizeUp();
    if (reduced) { staticWash(); return; }
    start();

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stop(); else start();
    });
    var rsT;
    window.addEventListener('resize', function () {
      clearTimeout(rsT);
      rsT = setTimeout(function () { sizeUp(); spawnDrop(W * 0.5, H * 0.4, 3); }, 320);
    });
    // 點按處滴一小滴墨（節流，不干擾操作）
    window.addEventListener('pointerdown', function (ev) {
      var now = Date.now();
      if (now - lastPointer < 700) return;
      lastPointer = now;
      var s = W / Math.max(1, window.innerWidth);
      spawnDrop(ev.clientX * s, ev.clientY * s, 2, true);
    }, { passive: true });

    // 工具切換 → 墨色跟著換（不存在 pickTool 就僅保留 API）
    try {
      if (typeof window.pickTool === 'function') {
        var orig = window.pickTool;
        window.pickTool = function (tool) {
          try { api.setPalette(tool); } catch (e) {}
          return orig.apply(this, arguments);
        };
      }
    } catch (e) {}
  }

  var api = {
    version: '1.0',
    burst: function (x, y) {
      var s = W / Math.max(1, window.innerWidth);
      spawnDrop((x == null ? window.innerWidth / 2 : x) * s, (y == null ? window.innerHeight / 2 : y) * s, 4);
    },
    setPalette: function (name) { palette = PALETTES[name] || PALETTES['default']; },
    pause: stop,
    resume: start
  };
  window.JY_INK = api;

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
