/*! share-card.js — 靜月之光 占卜結果分享卡引擎  [v2.2]
 * ⚠ 檔案位置：JS/share-card.js（v86_16 起與其他 JS 同層；repo 根目錄如仍有舊檔請刪除，避免再傳錯位置）
 * v2.2(2026/6/12)：renderMeihua——卦無牌面圖資產，「真實畫面」＝直繪六爻卦象（陽爻實線/陰爻斷線、
 *   由下而上、動爻紅金高亮＋圓點標記）；呼叫端補傳 lines/dong，未傳則退 renderTarot 舊版（零風險後備）。
 * v2.1(2026/6/12)：renderTarot 同款根治——cards 帶 img 繪真牌面（逆位旋轉180°、與結果頁一致）、
 *   >3 張改通用網格自適應（凱爾特10/GD15/M21/馬蹄54 全張數入卡，不再截到3張）；未帶 img 行為不變（梅花等零影響）。
 * v2.0(2026/6/12)：雷諾曼專屬渲染器根治——原 lenormand 借用 renderTarot（寫死最多3格＋✦佔位），
 *   實測五張線只出3張、大牌陣36張只出3張、無真牌面。改：①renderLenormand 照牌陣張數排版
 *   （3/5 單排、9宮 3×3、大牌陣鏡射實際讀法 8×4＋收束4，指示牌金框★標記）②引擎加 loadImgs
 *   非同步預載（2.5s 逾時保險，缺圖退✦佔位，畫布同源資產無汙染）③open() 先載圖再繪卡。
 *   呼叫端契約：cards[] 可帶 {img, sig}；未帶 img 行為與 v1.2 完全相同（其餘五工具零影響）。
 * 共用畫布：暗金月色 + 品牌 + QR + Web Share / 下載。
 * 5 種卡：invite(邀請) / bazi(八字四柱) / ziwei(紫微命盤) / tarot(塔羅牌陣) / lenormand(雷諾曼牌陣)。
 * 用法：JYShareCard.open('bazi', {...資料});  之後在各結果頁加一顆按鈕呼叫即可。
 * 純前端、零外部套件、手機優先；不支援系統分享時自動退成「下載圖片」。
 */
(function () {
  'use strict';
  if (window.JYShareCard) return;

  var W = 1080, H = 1350;                 // 4:5 直式，最適合 IG / Threads
  var GOLD = '#c9a84c', GOLD_D = '#a8863a', CREAM = '#ffeab8';
  var QR_SRC = 'data:image/png;base64,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';
  var _qrImg = null, _qrReady = false;
  (function () { try { var im = new Image(); im.onload = function () { _qrImg = im; _qrReady = true; }; im.src = QR_SRC; } catch (e) {} })();

  // ── helpers ───────────────────────────────────────────
  function rr(ctx, x, y, w, h, r) {
    if (ctx.roundRect) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); return; }
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }
  function sparkle(ctx, cx, cy, r, color) {
    ctx.save(); ctx.fillStyle = color; ctx.beginPath();
    ctx.moveTo(cx, cy - r); ctx.quadraticCurveTo(cx, cy, cx + r, cy);
    ctx.quadraticCurveTo(cx, cy, cx, cy + r); ctx.quadraticCurveTo(cx, cy, cx - r, cy);
    ctx.quadraticCurveTo(cx, cy, cx, cy - r); ctx.closePath(); ctx.fill(); ctx.restore();
  }
  function wrap(ctx, text, maxW) {
    var lines = [], cur = '';
    for (var i = 0; i < text.length; i++) {
      var ch = text[i];
      if (ch === '\n') { lines.push(cur); cur = ''; continue; }
      if (ctx.measureText(cur + ch).width > maxW && cur) { lines.push(cur); cur = ch; }
      else cur += ch;
    }
    if (cur) lines.push(cur);
    return lines;
  }

  // v2.0：非同步圖片預載——載完（或逾時/失敗）才繪卡；成功者掛 c._im，失敗者維持無圖退✦佔位
  function loadImgs(cards, done) {
    var list = (cards || []).filter(function (c) { return c && c.img && !c._im; });
    if (!list.length) { done(); return; }
    var left = list.length, fired = false;
    function fin() { if (!fired) { fired = true; done(); } }
    var t = setTimeout(fin, 2500); // 逾時保險：先出卡，缺圖各自退佔位
    list.forEach(function (c) {
      try {
        var im = new Image();
        im.onload = function () { c._im = im; if (--left <= 0) { clearTimeout(t); fin(); } };
        im.onerror = function () { if (--left <= 0) { clearTimeout(t); fin(); } };
        im.src = c.img;
      } catch (e) { if (--left <= 0) { clearTimeout(t); fin(); } }
    });
  }

  // v2.0：單一牌格——真牌面 cover-fit 圓角裁切；無圖退✦佔位；指示牌金框＋★
  function cardCell(ctx, x, y, w, h, c, nameH) {
    c = c || {}; nameH = nameH || 0;
    ctx.save();
    ctx.fillStyle = 'rgba(20,20,32,0.9)';
    ctx.strokeStyle = c.sig ? 'rgba(232,210,138,0.95)' : 'rgba(201,168,76,0.5)';
    ctx.lineWidth = c.sig ? 3 : 2;
    rr(ctx, x, y, w, h, Math.min(14, w * 0.1)); ctx.fill(); ctx.stroke();
    var pad = Math.max(5, w * 0.045);
    var ih = h - pad * 2 - nameH;
    if (c._im) {
      ctx.save(); rr(ctx, x + pad, y + pad, w - pad * 2, ih, Math.min(9, w * 0.07)); ctx.clip();
      var iw = c._im.width || 1, ihh = c._im.height || 1, bw = w - pad * 2, bh = ih;
      var sc = Math.max(bw / iw, bh / ihh), dw = iw * sc, dh = ihh * sc;
      if (c.rev) { // v2.1：逆位＝牌面旋轉 180°（與結果頁一致）
        ctx.translate(x + pad + bw / 2, y + pad + bh / 2); ctx.rotate(Math.PI);
        ctx.drawImage(c._im, -dw / 2, -dh / 2, dw, dh);
      } else {
        ctx.drawImage(c._im, x + pad + (bw - dw) / 2, y + pad + (bh - dh) / 2, dw, dh);
      }
      ctx.restore();
    } else {
      sparkle(ctx, x + w / 2, y + pad + ih * 0.45, Math.min(30, w * 0.2), 'rgba(201,168,76,0.7)');
    }
    if (c.sig) ctext(ctx, '★', x + Math.max(14, w * 0.12), y + Math.max(20, w * 0.16), '600 ' + Math.max(18, Math.round(w * 0.16)) + 'px serif', 'rgba(232,210,138,0.95)', 0);
    ctx.restore();
  }
  function ctext(ctx, t, x, y, font, color, ls) {
    ctx.save(); ctx.font = font; ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    if (ls) {
      var total = 0, ws = [];
      for (var i = 0; i < t.length; i++) { var w = ctx.measureText(t[i]).width; ws.push(w); total += w + (i < t.length - 1 ? ls : 0); }
      var cx = x - total / 2; ctx.textAlign = 'left';
      for (var j = 0; j < t.length; j++) { ctx.fillText(t[j], cx, y); cx += ws[j] + ls; }
    } else ctx.fillText(t, x, y);
    ctx.restore();
  }

  // ── 共用背景：漸層 + 弦月 + 星點 + 金框 ──
  function bg(ctx) {
    var g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#171722'); g.addColorStop(0.5, '#101019'); g.addColorStop(1, '#0a0a10');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    // 放射星塵（中上發散）
    var cx0 = W * 0.5, cy0 = H * 0.30;
    var rg = ctx.createRadialGradient(cx0, cy0, 0, cx0, cy0, W * 0.7);
    rg.addColorStop(0, 'rgba(201,168,76,0.10)'); rg.addColorStop(1, 'rgba(201,168,76,0)');
    ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H);
    // 星點（固定分布，consistent）
    var seed = 20260607; function rnd() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }
    ctx.save();
    for (var i = 0; i < 90; i++) {
      var x = rnd() * W, y = rnd() * H * 0.92, r = rnd() * 1.8 + 0.4, a = rnd() * 0.5 + 0.15;
      ctx.fillStyle = 'rgba(255,230,170,' + a.toFixed(2) + ')'; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
    }
    ctx.restore();
    // 弦月（右上，小而精緻）
    var mx = W * 0.85, my = H * 0.115, mr = 60;
    ctx.save();
    var mg = ctx.createRadialGradient(mx, my, mr * 0.4, mx, my, mr * 2.6);
    mg.addColorStop(0, 'rgba(255,225,150,0.22)'); mg.addColorStop(1, 'rgba(255,225,150,0)');
    ctx.fillStyle = mg; ctx.beginPath(); ctx.arc(mx, my, mr * 2.4, 0, 7); ctx.fill();
    ctx.fillStyle = '#f0d68a'; ctx.beginPath(); ctx.arc(mx, my, mr, 0, 7); ctx.fill();
    ctx.globalCompositeOperation = 'destination-out'; ctx.beginPath(); ctx.arc(mx + mr * 0.52, my - mr * 0.16, mr * 0.96, 0, 7); ctx.fill();
    ctx.restore();
    // 金框
    ctx.save(); ctx.strokeStyle = 'rgba(201,168,76,0.45)'; ctx.lineWidth = 2; rr(ctx, 28, 28, W - 56, H - 56, 26); ctx.stroke();
    ctx.strokeStyle = 'rgba(201,168,76,0.18)'; ctx.lineWidth = 1; rr(ctx, 40, 40, W - 80, H - 80, 20); ctx.stroke();
    // 角落小飾
    ctx.strokeStyle = 'rgba(201,168,76,0.6)'; ctx.lineWidth = 2;
    var c = [[60, 60, 1, 1], [W - 60, 60, -1, 1], [60, H - 60, 1, -1], [W - 60, H - 60, -1, -1]];
    for (var k = 0; k < 4; k++) { var p = c[k]; ctx.beginPath(); ctx.moveTo(p[0], p[1] + 34 * p[3]); ctx.lineTo(p[0], p[1]); ctx.lineTo(p[0] + 34 * p[2], p[1]); ctx.stroke(); }
    ctx.restore();
  }

  // ── 底部品牌列 + QR ──
  function footer(ctx) {
    var fy = H - 188;
    ctx.save();
    ctx.strokeStyle = 'rgba(201,168,76,0.22)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(70, fy); ctx.lineTo(W - 70, fy); ctx.stroke();
    var qs = 104, qx = W - 78 - qs, qy = fy + 24;
    ctx.fillStyle = '#ffffff'; rr(ctx, qx - 9, qy - 9, qs + 18, qs + 18, 12); ctx.fill();
    if (_qrReady && _qrImg) { try { ctx.drawImage(_qrImg, qx, qy, qs, qs); } catch (e) {} }
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = GOLD; ctx.font = '700 42px "Noto Serif TC", serif'; ctx.fillText('靜月之光', 80, fy + 58);
    ctx.fillStyle = 'rgba(232,224,208,0.7)'; ctx.font = '28px "Noto Serif TC", serif'; ctx.fillText('免費 AI 占卜', 80, fy + 102);
    ctx.fillStyle = 'rgba(201,168,76,0.85)'; ctx.font = '600 30px Georgia, "Noto Serif TC", serif'; ctx.fillText('jingyue.uk　掃碼免費算', 80, fy + 142);
    ctx.restore();
  }

  function title(ctx, big, sub) {
    var tfs = big.length >= 6 ? 72 : 84, tls = big.length >= 6 ? 5 : 6;
    ctx.save();
    ctx.shadowColor = 'rgba(255,210,120,0.5)'; ctx.shadowBlur = 30;
    ctext(ctx, big, W / 2, 175, '700 ' + tfs + 'px "Noto Serif TC", serif', CREAM, tls);
    ctx.restore();
    if (sub) ctext(ctx, sub, W / 2, 248, '30px "Noto Serif TC", serif', 'rgba(201,168,76,0.85)', 8);
    ctx.save(); ctx.strokeStyle = 'rgba(201,168,76,0.4)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(W / 2 - 120, 290); ctx.lineTo(W / 2 + 120, 290); ctx.stroke();
    ctx.fillStyle = GOLD; ctx.beginPath(); ctx.arc(W / 2, 290, 4, 0, 7); ctx.fill(); ctx.restore();
  }

  function qline(ctx, q, y) {
    if (!q) return y;
    ctx.save();
    var lines = (function () { ctx.font = '30px "Noto Serif TC", serif'; return wrap(ctx, '「' + q + '」', W - 240); })();
    for (var i = 0; i < Math.min(lines.length, 2); i++) ctext(ctx, lines[i], W / 2, y + i * 42, '30px "Noto Serif TC", serif', 'rgba(232,224,208,0.78)', 0);
    ctx.restore();
    return y + Math.min(lines.length, 2) * 42 + 20;
  }

  // ── 卡片：邀請 ──
  function renderInvite(ctx, d) {
    title(ctx, '免費 AI 占卜', '靜月之光');
    ctext(ctx, (d && d.tagline) || '卡在心裡那件事，今晚就有答案', W / 2, 360, '36px "Noto Serif TC", serif', CREAM, 2);
    var systems = ['塔羅快讀', '開鑰之法', '雷諾曼', '紫微斗數', '八字', '梅花易數', '靈籤'];
    var cols = 2, bw = 380, bh = 92, gap = 40, x0 = (W - (cols * bw + (cols - 1) * gap)) / 2, y0 = 470;
    for (var i = 0; i < systems.length; i++) {
      var r = Math.floor(i / cols), c = i % cols, x = x0 + c * (bw + gap), y = y0 + r * (bh + 28);
      if (i === systems.length - 1) x = (W - bw) / 2; // 最後一個置中
      ctx.save(); ctx.fillStyle = 'rgba(255,255,255,0.03)'; ctx.strokeStyle = 'rgba(201,168,76,0.35)'; ctx.lineWidth = 1.5;
      rr(ctx, x, y, bw, bh, 16); ctx.fill(); ctx.stroke();
      ctext(ctx, systems[i], x + bw / 2, y + bh / 2, '600 40px "Noto Serif TC", serif', CREAM, 4); ctx.restore();
    }
    ctext(ctx, '七大占卜　一鍵複製提示詞貼到 AI 即出深度解讀', W / 2, y0 + 4 * (bh + 28) + 10, '28px "Noto Serif TC", serif', 'rgba(201,168,76,0.8)', 1);
  }

  // ── 卡片：八字四柱 ── d:{question, pillars:[{label,gan,zhi}]×4, dayMaster, yongShen, dayun}
  function renderBazi(ctx, d) {
    d = d || {};
    title(ctx, '我的八字', '子平 ・ 四柱八字');
    var y = qline(ctx, d.question, 350);
    var pillars = d.pillars || [{ label: '年柱', gan: '癸', zhi: '亥' }, { label: '月柱', gan: '庚', zhi: '申' }, { label: '日柱', gan: '乙', zhi: '酉' }, { label: '時柱', gan: '癸', zhi: '未' }];
    var n = pillars.length, cw = 210, gap = 26, x0 = (W - (n * cw + (n - 1) * gap)) / 2, ty = Math.max(y, 410), ch = 290;
    for (var i = 0; i < n; i++) {
      var x = x0 + i * (cw + gap), p = pillars[i];
      ctx.save();
      ctx.fillStyle = (p.label === '日柱') ? 'rgba(201,168,76,0.12)' : 'rgba(255,255,255,0.03)';
      ctx.strokeStyle = (p.label === '日柱') ? 'rgba(201,168,76,0.6)' : 'rgba(201,168,76,0.28)'; ctx.lineWidth = (p.label === '日柱') ? 2.5 : 1.5;
      rr(ctx, x, ty, cw, ch, 18); ctx.fill(); ctx.stroke();
      ctext(ctx, p.label || '', x + cw / 2, ty + 40, '26px "Noto Serif TC", serif', 'rgba(201,168,76,0.85)', 2);
      ctext(ctx, p.gan || '', x + cw / 2, ty + 130, '700 96px "Noto Serif TC", serif', CREAM, 0);
      ctext(ctx, p.zhi || '', x + cw / 2, ty + 236, '700 96px "Noto Serif TC", serif', 'rgba(232,224,208,0.92)', 0);
      ctx.restore();
    }
    var ry = ty + ch + 50, rows = [];
    if (d.dayMaster) rows.push(['日主', d.dayMaster]);
    if (d.yongShen) rows.push(['用神', d.yongShen]);
    if (d.dayun) rows.push(['現行大運', d.dayun]);
    drawRows(ctx, rows, ry);
  }

  // ── 卡片：紫微命盤（4×4 十二宮環）── d:{question, palaces:[{branch,name,star}]×12(巳起順), ming, info}
  function renderZiwei(ctx, d) {
    d = d || {};
    title(ctx, '我的紫微命盤', '三方四正 ・ 四化飛星');
    var y = qline(ctx, d.question, 345);
    // 12 宮環：巳午未申 / 辰..酉 / 卯..戌 / 寅丑子亥
    var P = d.palaces || [
      { branch: '巳', name: '田宅', star: '太陰' }, { branch: '午', name: '官祿', star: '貪狼' }, { branch: '未', name: '僕役', star: '巨門' }, { branch: '申', name: '遷移', star: '天相' },
      { branch: '辰', name: '福德', star: '廉貞' }, { branch: '酉', name: '疾厄', star: '天梁' },
      { branch: '卯', name: '父母', star: '七殺' }, { branch: '戌', name: '財帛', star: '' },
      { branch: '寅', name: '命宮', star: '天府' }, { branch: '丑', name: '兄弟', star: '' }, { branch: '子', name: '夫妻', star: '破軍' }, { branch: '亥', name: '子女', star: '' }
    ];
    var pos = [[0, 0], [1, 0], [2, 0], [3, 0], [0, 1], [3, 1], [0, 2], [3, 2], [0, 3], [1, 3], [2, 3], [3, 3]];
    var gy = Math.max(y, 380), footTop = H - 206;
    var cell = Math.min(196, (footTop - gy) / 4), gw = cell * 4, gx = (W - gw) / 2;
    for (var i = 0; i < 12; i++) {
      var col = pos[i][0], row = pos[i][1], x = gx + col * cell, yy = gy + row * cell, p = P[i];
      var isMing = (p.name === '命宮');
      ctx.save();
      ctx.fillStyle = isMing ? 'rgba(201,168,76,0.14)' : 'rgba(255,255,255,0.025)';
      ctx.strokeStyle = isMing ? 'rgba(255,236,184,0.7)' : 'rgba(201,168,76,0.22)'; ctx.lineWidth = isMing ? 2.5 : 1;
      rr(ctx, x + 4, yy + 4, cell - 8, cell - 8, 10); ctx.fill(); ctx.stroke();
      ctext(ctx, p.star || '·', x + cell / 2, yy + cell * 0.42, '600 ' + (p.star && p.star.length > 2 ? 34 : 44) + 'px "Noto Serif TC", serif', isMing ? CREAM : 'rgba(232,224,208,0.82)', 1);
      ctext(ctx, p.name || '', x + cell / 2, yy + cell * 0.70, '24px "Noto Serif TC", serif', isMing ? GOLD : 'rgba(201,168,76,0.6)', 1);
      ctext(ctx, p.branch || '', x + cell - 22, yy + cell - 22, '20px "Noto Serif TC", serif', 'rgba(232,224,208,0.4)', 0);
      ctx.restore();
    }
    // 中宮
    var ccx = gx + cell, ccy = gy + cell, csz = cell * 2;
    ctx.save(); ctx.fillStyle = 'rgba(201,168,76,0.05)'; ctx.strokeStyle = 'rgba(201,168,76,0.25)'; ctx.lineWidth = 1;
    rr(ctx, ccx + 6, ccy + 6, csz - 12, csz - 12, 12); ctx.fill(); ctx.stroke();
    ctext(ctx, d.ming || '命宮 ・ 天府', ccx + csz / 2, ccy + csz / 2 - 18, '600 38px "Noto Serif TC", serif', CREAM, 2);
    ctext(ctx, d.info || '紫微斗數', ccx + csz / 2, ccy + csz / 2 + 34, '26px "Noto Serif TC", serif', 'rgba(201,168,76,0.75)', 2);
    ctx.restore();
  }

  // ── 卡片：塔羅牌陣 ── d:{question, spread, cards:[{name,pos,reversed}], conclusion}
  function renderTarot(ctx, d) {
    // v2.1：①cards 帶 img/_im 時繪真牌面（逆位旋轉180°）②>3 張改通用網格自適應（凱爾特10/GD15/M21/馬蹄54 皆可入卡）
    //   未帶 img 時 ≤3 張行為與 v1.2 視覺等價（佔位＋名稱＋位置）。
    d = d || {};
    title(ctx, d.cardTitle || '我的塔羅', d.spread || 'RWS 塔羅');
    var cards = d.cards || [{ name: '月亮', pos: '過去' }, { name: '星星', pos: '現況' }, { name: '太陽', pos: '未來' }];
    var n = cards.length, i, x, c;
    if (n <= 3) {
      var y = qline(ctx, d.question, 345);
      var cw = 230, chh = 380, gap = 36, nameH = 86, x0 = (W - (n * cw + (n - 1) * gap)) / 2, ty = Math.max(y, 400);
      for (i = 0; i < n; i++) {
        x = x0 + i * (cw + gap); c = cards[i] || {};
        c.rev = c.rev || c.reversed;
        cardCell(ctx, x, ty, cw, chh, c, nameH);
        var nm = (c.name || '') + (c.rev ? '（逆）' : '');
        ctext(ctx, nm, x + cw / 2, ty + chh - 56, '600 ' + (nm.length > 4 ? 28 : 38) + 'px "Noto Serif TC", serif', CREAM, 0);
        ctext(ctx, c.pos || '', x + cw / 2, ty + chh - 22, '22px "Noto Serif TC", serif', 'rgba(201,168,76,0.75)', 1);
      }
      if (d.conclusion) {
        ctx.save(); var ly = ty + chh + 50; ctx.font = '32px "Noto Serif TC", serif';
        var ls = wrap(ctx, d.conclusion, W - 200);
        for (var j = 0; j < Math.min(ls.length, 2); j++) ctext(ctx, ls[j], W / 2, ly + j * 44, '32px "Noto Serif TC", serif', 'rgba(232,224,208,0.85)', 0);
        ctx.restore();
      }
      return;
    }
    // >3 張：通用網格——直式 2:3 牌面，逐欄數試算取最大格
    var y0 = Math.max(qline(ctx, d.question, 330), 368);
    var boxW = W - 80, boxH = (H - 210) - y0 - 8, gp = 10;
    var best = null;
    for (var cols = 2; cols <= Math.min(n, 9); cols++) {
      var rows = Math.ceil(n / cols);
      var cwf = Math.min((boxW - (cols - 1) * gp) / cols, ((boxH - (rows - 1) * gp) / rows) / 1.5);
      if (!best || cwf > best.cw) best = { cols: cols, rows: rows, cw: cwf };
    }
    var cwG = Math.floor(best.cw), chG = Math.floor(cwG * 1.5);
    var showName = cwG >= 150; // 格夠大才放名稱列
    if (showName) { chG -= 0; } // 名稱畫在格下方，重新檢核高度
    var nmH = showName ? 28 : 0;
    while (showName && best.rows * (chG + nmH) + (best.rows - 1) * gp > boxH && chG > 60) { chG -= 4; cwG = Math.floor(chG / 1.5); }
    var rowsArr = [];
    for (i = 0; i < n; i += best.cols) rowsArr.push(cards.slice(i, i + best.cols));
    for (var r = 0; r < rowsArr.length; r++) {
      var row = rowsArr[r];
      var rx0 = (W - (row.length * cwG + (row.length - 1) * gp)) / 2;
      var ry = y0 + r * (chG + nmH + gp);
      for (i = 0; i < row.length; i++) {
        c = row[i] || {}; c.rev = c.rev || c.reversed;
        x = rx0 + i * (cwG + gp);
        cardCell(ctx, x, ry, cwG, chG, c, 0);
        if (showName) ctext(ctx, (c.name || '') + (c.rev ? '（逆）' : ''), x + cwG / 2, ry + chG + 20, '600 22px "Noto Serif TC", serif', CREAM, 0);
      }
    }
  }

  // ── 卡片：梅花易數（v2.2）── d:{cardTitle, spread, question, conclusion,
  //   cards:[{name, pos, lines:[6個0/1，由下而上], dong:動爻1-6（本卦/變卦標記用）}]}
  // 卦無牌面圖資產——「真實畫面」＝直接繪六爻卦象：陽爻實線、陰爻斷線、動爻紅金高亮＋圓點
  function renderMeihua(ctx, d) {
    d = d || {};
    var cards = d.cards || [];
    if (!cards.length || !cards[0].lines) { renderTarot(ctx, d); return; } // 無爻線資料→退舊版
    title(ctx, d.cardTitle || '我的卦象', d.spread || '梅花易數');
    var y = qline(ctx, d.question, 345);
    var n = Math.min(cards.length, 3);
    var cw = 230, chh = 380, gap = 36, nameH = 86, x0 = (W - (n * cw + (n - 1) * gap)) / 2, ty = Math.max(y, 400);
    for (var i = 0; i < n; i++) {
      var x = x0 + i * (cw + gap), c = cards[i] || {};
      // 卡框（沿用牌格樣式，無圖模式）
      ctx.save();
      ctx.fillStyle = 'rgba(20,20,32,0.9)';
      ctx.strokeStyle = 'rgba(201,168,76,0.5)';
      ctx.lineWidth = 2;
      rr(ctx, x, ty, cw, chh, 14); ctx.fill(); ctx.stroke();
      // ── 六爻卦象 ──
      var L = c.lines, gx = x + 38, gw = cw - 76;
      var gTop = ty + 34, gBot = ty + chh - nameH - 18;
      var rowH = (gBot - gTop) / 6, barH = Math.min(13, rowH * 0.42);
      for (var li = 0; li < 6; li++) {
        // lines[0]=初爻在最下 → 畫面由下而上
        var yy = gBot - rowH * li - rowH / 2 - barH / 2;
        var isDong = c.dong && (c.dong - 1) === li;
        ctx.fillStyle = isDong ? 'rgba(214,118,86,0.95)' : 'rgba(201,168,76,0.88)';
        if (L[li]) { // 陽爻：實線
          rr(ctx, gx, yy, gw, barH, barH / 2); ctx.fill();
        } else {     // 陰爻：兩段
          var seg = (gw - 18) / 2;
          rr(ctx, gx, yy, seg, barH, barH / 2); ctx.fill();
          rr(ctx, gx + seg + 18, yy, seg, barH, barH / 2); ctx.fill();
        }
        if (isDong) { // 動爻圓點標記
          ctx.beginPath(); ctx.arc(gx + gw + 16, yy + barH / 2, 4.5, 0, 6.2832); ctx.fill();
        }
      }
      ctx.restore();
      var nm = c.name || '';
      ctext(ctx, nm, x + cw / 2, ty + chh - 52, '600 ' + (nm.length > 4 ? 28 : 34) + 'px "Noto Serif TC", serif', CREAM, 0);
      ctext(ctx, c.pos || '', x + cw / 2, ty + chh - 20, '22px "Noto Serif TC", serif', 'rgba(201,168,76,0.75)', 1);
    }
    if (d.conclusion) {
      ctx.save(); var ly = ty + chh + 50; ctx.font = '30px "Noto Serif TC", serif';
      var ls = wrap(ctx, d.conclusion, W - 180);
      for (var j = 0; j < Math.min(ls.length, 2); j++) ctext(ctx, ls[j], W / 2, ly + j * 42, '30px "Noto Serif TC", serif', 'rgba(232,224,208,0.85)', 0);
      ctx.restore();
    }
  }

  // ── 卡片：雷諾曼（v2.0）── d:{cardTitle, spread, question, cards:[{id,name,pos,img,sig}]}
  // 照牌陣張數排版：≤3 單排大格、5 單排、9 宮 3×3、≥30 大牌陣（鏡射實際讀法 8×4＋收束 4）
  function renderLenormand(ctx, d) {
    d = d || {};
    title(ctx, d.cardTitle || '我的雷諾曼', d.spread || 'Petit Lenormand');
    var cards = d.cards || [];
    var n = cards.length, i, x, y;
    if (n >= 30) {
      var y0 = Math.max(qline(ctx, d.question, 330), 368);
      var cw = 92, chh = 138, gx = 10, gy = 10; // v2.0.1：自 96×144 縮一階——樁件量測底緣 1160 超出頁尾安全線(1140)
      var rows = [cards.slice(0, 8), cards.slice(8, 16), cards.slice(16, 24), cards.slice(24, 32), cards.slice(32)];
      for (var r = 0; r < rows.length; r++) {
        var row = rows[r];
        if (!row.length) continue;
        var x0 = (W - (row.length * cw + (row.length - 1) * gx)) / 2;
        var ry = y0 + r * (chh + gy);
        for (i = 0; i < row.length; i++) cardCell(ctx, x0 + i * (cw + gx), ry, cw, chh, row[i], 0);
      }
    } else if (n === 9) {
      var y9 = Math.max(qline(ctx, d.question, 340), 396);
      var cw9 = 172, ch9 = 200, gx9 = 26, gy9 = 12, nm9 = 30;
      var x9 = (W - (3 * cw9 + 2 * gx9)) / 2;
      for (i = 0; i < 9; i++) {
        x = x9 + (i % 3) * (cw9 + gx9);
        y = y9 + Math.floor(i / 3) * (ch9 + nm9 + gy9);
        cardCell(ctx, x, y, cw9, ch9, cards[i], 0);
        ctext(ctx, (cards[i] && cards[i].name) || '', x + cw9 / 2, y + ch9 + 22, '600 25px "Noto Serif TC", serif', CREAM, 0);
      }
    } else {
      var m = Math.max(n, 1);
      var cwL = m <= 3 ? 230 : 180, chL = m <= 3 ? 380 : 312, gapL = m <= 3 ? 36 : 16;
      var nmL = m <= 3 ? 86 : 74;
      var yL = Math.max(qline(ctx, d.question, 345), 400);
      var xL = (W - (m * cwL + (m - 1) * gapL)) / 2;
      for (i = 0; i < m; i++) {
        var c = cards[i] || {};
        x = xL + i * (cwL + gapL);
        cardCell(ctx, x, yL, cwL, chL, c, nmL);
        var nmFont = '600 ' + (m <= 3 ? ((c.name || '').length > 4 ? 28 : 36) : ((c.name || '').length > 3 ? 24 : 28)) + 'px "Noto Serif TC", serif';
        ctext(ctx, c.name || '', x + cwL / 2, yL + chL - (m <= 3 ? 56 : 48), nmFont, CREAM, 0);
        ctext(ctx, (c.sig ? '★' : '') + (c.pos || ''), x + cwL / 2, yL + chL - (m <= 3 ? 22 : 18), (m <= 3 ? 22 : 19) + 'px "Noto Serif TC", serif', 'rgba(201,168,76,0.75)', 1);
      }
    }
  }

  // ── 卡片：開鑰之法（五層深潛）── d:{question, layers:[{label,cards}]}
  function renderOOTK(ctx, d) {
    d = d || {};
    title(ctx, '我的開鑰', '開鑰之法 ・ Book T 五層深潛');
    var y = qline(ctx, d.question, 345);
    var layers = (d.layers && d.layers.length) ? d.layers : [];
    var n = layers.length || 5;
    var top = Math.max(y, 420);
    var footTop = H - 210, gap = 18;
    var rh = Math.min(150, (footTop - top - (n - 1) * gap) / n);
    if (rh < 70) rh = 70;
    for (var i = 0; i < layers.length; i++) {
      var ry = top + i * (rh + gap), L = layers[i] || {};
      ctx.save();
      ctx.fillStyle = 'rgba(255,255,255,0.03)';
      ctx.strokeStyle = 'rgba(201,168,76,0.28)'; ctx.lineWidth = 1.5;
      rr(ctx, 80, ry, W - 160, rh, 14); ctx.fill(); ctx.stroke();
      ctx.textBaseline = 'middle';
      ctx.fillStyle = GOLD; ctx.font = '600 34px "Noto Serif TC", serif'; ctx.textAlign = 'left';
      ctx.fillText(L.label || '', 116, ry + rh / 2);
      ctx.strokeStyle = 'rgba(201,168,76,0.18)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(262, ry + 22); ctx.lineTo(262, ry + rh - 22); ctx.stroke();
      var cards = L.cards || '\u2014';
      var fs = 36, maxW = (W - 80) - 262 - 50;
      ctx.font = fs + 'px "Noto Serif TC", serif';
      while (ctx.measureText(cards).width > maxW && fs > 20) { fs -= 2; ctx.font = fs + 'px "Noto Serif TC", serif'; }
      ctx.fillStyle = CREAM; ctx.textAlign = 'center';
      ctx.fillText(cards, 262 + ((W - 80) - 262) / 2, ry + rh / 2);
      ctx.restore();
    }
  }

  function drawRows(ctx, rows, y) {
    for (var i = 0; i < rows.length; i++) {
      var ry = y + i * 70;
      ctx.save();
      ctx.fillStyle = 'rgba(255,255,255,0.03)'; ctx.strokeStyle = 'rgba(201,168,76,0.2)'; ctx.lineWidth = 1;
      rr(ctx, 120, ry, W - 240, 56, 12); ctx.fill(); ctx.stroke();
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(201,168,76,0.85)'; ctx.font = '28px "Noto Serif TC", serif'; ctx.textAlign = 'left'; ctx.fillText(rows[i][0], 150, ry + 30);
      ctx.fillStyle = CREAM; ctx.font = '600 30px "Noto Serif TC", serif'; ctx.textAlign = 'right'; ctx.fillText(rows[i][1], W - 150, ry + 30);
      ctx.restore();
    }
  }

  var RENDER = { invite: renderInvite, bazi: renderBazi, ziwei: renderZiwei, tarot: renderTarot, lenormand: renderLenormand, meihua: renderMeihua, ootk: renderOOTK }; // v2.0：lenormand 專屬渲染器（原借 renderTarot＝固定3格佔位的根因）

  function draw(type, data, canvas) {
    canvas.width = W; canvas.height = H;
    var ctx = canvas.getContext('2d');
    bg(ctx);
    (RENDER[type] || renderInvite)(ctx, data || {});
    footer(ctx);
    return canvas;
  }

  function fileName(type) { return '靜月之光_' + (type || 'card') + '_' + Date.now() + '.png'; }

  function shareOrDownload(canvas, type) {
    canvas.toBlob(function (blob) {
      if (!blob) return;
      var fn = fileName(type);
      try {
        var file = new File([blob], fn, { type: 'image/png' });
        if (navigator.canShare && navigator.canShare({ files: [file] }) && navigator.share) {
          navigator.share({ files: [file], title: '靜月之光 ・ 免費AI占卜', text: '我在靜月之光算的，免費AI占卜 jingyue.uk' })
            .catch(function () { _dl(blob, fn); });
          return;
        }
      } catch (e) {}
      _dl(blob, fn);
    }, 'image/png');
  }
  function _dl(blob, fn) {
    var url = URL.createObjectURL(blob); var a = document.createElement('a');
    a.href = url; a.download = fn; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
  }

  // ── CSS（一次注入）──
  function ensureCSS() {
    if (document.getElementById('jysc-css')) return;
    var st = document.createElement('style'); st.id = 'jysc-css';
    st.textContent = [
      '.jysc-bd{position:fixed;inset:0;z-index:2147483000;background:rgba(0,0,0,.72);display:flex;align-items:center;justify-content:center;padding:18px;opacity:0;transition:opacity .25s}',
      '.jysc-bd.show{opacity:1}',
      '.jysc-box{width:100%;max-width:420px;max-height:92vh;overflow-y:auto;background:linear-gradient(180deg,#16161e,#0d0d13);border:1px solid rgba(201,168,76,.3);border-radius:18px;padding:16px;text-align:center;-webkit-overflow-scrolling:touch}',
      '.jysc-img{width:100%;border-radius:12px;display:block;box-shadow:0 8px 40px rgba(0,0,0,.5)}',
      '.jysc-tip{color:rgba(232,224,208,.55);font-size:.74rem;margin:.7rem 0 .2rem;font-family:"Noto Serif TC",serif}',
      '.jysc-row{display:grid;grid-template-columns:1fr 1fr;gap:.5rem;margin-top:.7rem}',
      '.jysc-btn{padding:.8rem;border-radius:12px;border:1px solid rgba(201,168,76,.5);background:linear-gradient(135deg,rgba(201,168,76,.18),rgba(201,168,76,.05));color:#c9a84c;font-family:"Noto Serif TC",serif;font-size:.95rem;font-weight:600;letter-spacing:2px;cursor:pointer}',
      '.jysc-btn.sub{border-color:rgba(255,255,255,.12);background:rgba(255,255,255,.03);color:rgba(232,224,208,.65);font-weight:400}',
      '.jysc-btn:active{transform:scale(.97)}',
      '.jysc-x{margin-top:.6rem;color:rgba(232,224,208,.4);font-size:.8rem;cursor:pointer;font-family:"Noto Serif TC",serif}'
    ].join('\n');
    document.head.appendChild(st);
  }

  function close() {
    var bd = document.getElementById('jysc-bd');
    if (!bd) return; bd.classList.remove('show');
    setTimeout(function () { if (bd && bd.parentNode) bd.parentNode.removeChild(bd); }, 260);
  }

  function open(type, data) {
    ensureCSS();
    var canvas = document.createElement('canvas');
    function build() {
      draw(type, data, canvas);
      var url = canvas.toDataURL('image/png');
      var old = document.getElementById('jysc-bd'); if (old) old.remove();
      var bd = document.createElement('div'); bd.id = 'jysc-bd'; bd.className = 'jysc-bd';
      bd.onclick = function (e) { if (e.target === bd) close(); };
      bd.innerHTML = '<div class="jysc-box">' +
        '<img class="jysc-img" src="' + url + '" alt="分享卡">' +
        '<div class="jysc-tip">長按圖片可存圖；或用下方按鈕分享</div>' +
        '<div class="jysc-row"><button class="jysc-btn" id="jysc-share">分享到社群</button><button class="jysc-btn sub" id="jysc-dl">下載圖片</button></div>' +
        '<div class="jysc-x" id="jysc-close">關閉</div></div>';
      document.body.appendChild(bd);
      void bd.offsetWidth; bd.classList.add('show');
      document.getElementById('jysc-share').onclick = function () { shareOrDownload(canvas, type); };
      document.getElementById('jysc-dl').onclick = function () { canvas.toBlob(function (b) { if (b) _dl(b, fileName(type)); }, 'image/png'); };
      document.getElementById('jysc-close').onclick = close;
    }
    function ready() {
      // 等 QR 載入（最多等 ~600ms）再畫，確保 QR 入圖
      if (_qrReady) build();
      else { var n = 0, t = setInterval(function () { if (_qrReady || ++n > 12) { clearInterval(t); build(); } }, 50); }
    }
    // v2.0：cards 帶 img 時先非同步預載真牌面（內含 2.5s 逾時保險）；未帶 img 立即繪卡，行為同 v1.2
    loadImgs(data && data.cards, ready);
  }

  window.JYShareCard = { open: open, close: close, _draw: draw, _W: W, _H: H };
})();
