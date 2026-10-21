/* 靜月之光 · 塔羅結果頁「本次牌陣」 / 20261021spread41
 * 結果頁原本沒有顯示抽到的牌。這裡在「YOUR READING」下方新增牌陣區：牌背發到各牌位 → 依序翻開（逆位倒置）→
 * 輕觸任一張，下方展開該牌位的白話說明。只讀取既有的 drawnCards／SPREAD_DEFS／getTarotCardImage，不改抽牌、
 * 不改提示詞。超過 12 張的大牌陣直接顯示牌面，不跑逐張翻牌。 */
(function (root) {
  'use strict';
  if (!root.document) return;
  var doc = root.document, ID = 'jy-tarot-spread', lastKey = '';
  var mq = root.matchMedia ? root.matchMedia('(prefers-reduced-motion: reduce)') : null;
  function reduced() { return !!(mq && mq.matches); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function drawn() { try { return typeof drawnCards !== 'undefined' && Array.isArray(drawnCards) ? drawnCards : []; } catch (_) { return []; } }
  function spreadDef() {
    try { var id = typeof getCurrentSpread === 'function' ? getCurrentSpread() : null; return id && root.SPREAD_DEFS && root.SPREAD_DEFS[id] || null; } catch (_) { return null; }
  }
  function face(card) { try { return typeof getTarotCardImage === 'function' ? getTarotCardImage(card) : ''; } catch (_) { return ''; } }
  function backImage() {
    var all = doc.querySelectorAll('.tarot-deck-card, .tarot-deck-card *');
    for (var i = 0; i < all.length; i++) {
      var el = all[i];
      if (el.tagName === 'IMG' && (el.currentSrc || el.src)) return 'url("' + (el.currentSrc || el.src) + '")';
      var bg = getComputedStyle(el).backgroundImage; if (bg && bg.indexOf('url(') >= 0) return bg;
    }
    return '';
  }
  function posInfo(def, i, card) {
    var p = def && def.positions && def.positions[i];
    var label = p ? (p.name || '') : '', meaning = p ? (p.zh || '') : '';
    if (!label && card && card.pos) { var m = String(card.pos).replace(/^\d+\.\s*/, ''); label = m.slice(0, 8); meaning = m; }
    return { label: label || ('第' + (i + 1) + '張'), meaning: meaning };
  }
  function visible(el) { return !!el && el.getBoundingClientRect().width > 0 && getComputedStyle(el).display !== 'none'; }

  function build(step, cards) {
    var def = spreadDef(), big = cards.length > 12, back = backImage();
    var old = doc.getElementById(ID); if (old) old.remove();
    var sec = doc.createElement('section'); sec.id = ID; sec.className = 'jy-ts' + (big ? ' is-big' : ''); sec.setAttribute('aria-label', '本次牌陣');
    var title = (def && def.zh ? def.zh : '本次牌陣') + '・' + cards.length + ' 張';
    var h = '<div class="jy-ts-head"><span class="jy-ts-eyebrow">YOUR SPREAD · 本次牌陣</span><h2>' + esc(title) + '</h2>' +
      '<p>' + (big ? '牌面已全部展開。' : '牌會依序翻開。') + '輕觸任一張，看這個位置想告訴你的事。</p></div><div class="jy-ts-grid">';
    cards.forEach(function (c, i) {
      var p = posInfo(def, i, c), up = c.isUp !== false, showFace = big || reduced();
      h += '<button type="button" class="jy-ts-card' + (showFace ? ' is-open' : '') + (up ? '' : ' is-rv') + '" data-i="' + i + '" aria-label="' + esc('第' + (i + 1) + '張・' + p.label + '：' + c.n + (up ? '正位' : '逆位')) + '">' +
        '<span class="jy-ts-pos">' + String(i + 1).padStart(2, '0') + ' · ' + esc(p.label) + '</span>' +
        '<span class="jy-ts-face" style="' + (showFace ? '' : 'background:' + esc(back || 'linear-gradient(150deg,#f3e3bd,#c9a35f)') + ' center/cover no-repeat') + '">' +
        '<img alt="" decoding="async" src="' + esc(showFace ? face(c) : 'data:image/gif;base64,R0lGODlhAQABAAAAACw=') + '" data-face="' + esc(face(c)) + '"></span>' +
        '<span class="jy-ts-name">' + esc(c.n) + '<em>' + (up ? '正位' : '逆位') + '</em></span></button>';
    });
    h += '</div><div class="jy-ts-detail" hidden aria-live="polite"></div>';
    sec.innerHTML = h;
    var anchor = step.querySelector('.at-result-heading');
    if (anchor && anchor.parentNode === step) anchor.after(sec); else step.prepend(sec);
    // 預載正面牌圖，翻牌時不會出現空白。
    cards.slice(0, 12).forEach(function (c) { var im = new Image(); im.decoding = 'async'; im.src = face(c); });
    sec.addEventListener('click', function (e) {
      var b = e.target.closest('.jy-ts-card'); if (!b) return;
      if (!b.classList.contains('is-open')) flip(b, cards);
      detail(sec, def, cards, +b.getAttribute('data-i'));
    });
    if (!big && !reduced()) {
      var n = cards.length, start = n * 90 + 820;
      cards.forEach(function (_, i) { setTimeout(function () { var b = sec.querySelector('.jy-ts-card[data-i="' + i + '"]'); if (b) flip(b, cards); }, start + i * 300); });
    }
  }
  function flip(b, cards) {
    if (b.classList.contains('is-open')) return;
    var im = b.querySelector('img'), f = b.querySelector('.jy-ts-face');
    if (im && im.getAttribute('data-face')) im.src = im.getAttribute('data-face');
    if (f) f.style.background = '';
    b.classList.add('is-open');
    if (root.JYMotion && typeof root.JYMotion.turn === 'function') root.JYMotion.turn(b);
  }
  function detail(sec, def, cards, i) {
    var c = cards[i], box = sec.querySelector('.jy-ts-detail'); if (!c || !box) return;
    var p = posInfo(def, i, c), up = c.isUp !== false;
    sec.querySelectorAll('.jy-ts-card').forEach(function (x) { x.setAttribute('aria-pressed', x.getAttribute('data-i') === String(i) ? 'true' : 'false'); });
    box.innerHTML = '<b>' + String(i + 1).padStart(2, '0') + ' · ' + esc(p.label) + '</b>' + (p.meaning ? '<small>' + esc(p.meaning) + '</small>' : '') +
      '<h3>' + esc(c.n) + '<em>' + (up ? '正位' : '逆位') + '</em></h3>' +
      '<p class="jy-ts-kw">' + esc(up ? c.kwUp : c.kwRv) + '</p><p>' + esc(up ? c.up : c.rv) + '</p>' +
      '<p class="jy-ts-note">這是單張牌的基本意思；整組牌合起來怎麼讀，請把下方提示詞貼給 AI。</p>';
    box.hidden = false;
  }
  function sync() {
    var step = doc.getElementById('step-tarot'), input = doc.getElementById('input-screen');
    if (!visible(step) || (input && input.getAttribute('data-atelier-mode') === 'ootk')) return;
    var cards = drawn();
    var key = cards.map(function (c) { return c.id + (c.isUp === false ? 'r' : 'u'); }).join(',');
    if (!cards.length) { var old = doc.getElementById(ID); if (old) old.remove(); lastKey = ''; return; }
    if (key === lastKey && doc.getElementById(ID)) return;
    lastKey = key; build(step, cards);
  }
  setInterval(function () { if (!doc.hidden) sync(); }, 400);
  root.JYTarotResultSpread = Object.freeze({ version: '20261021spread41', sync: sync });
})(typeof window !== 'undefined' ? window : globalThis);
