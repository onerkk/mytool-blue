// ══════════════════════════════════════════════════════════════════════
// 🎴 牌陣選擇器（v80.3-20260606-spread-restore）— 讓使用者手動挑選任一牌陣，並標示適合的問題類型
//   機制：手動選定時，包裝 detectSpreadType 使其直接回傳該牌陣，
//        於是所有自動偵測點（含 initTarotDeck）都會吃到手動選擇，ui.js 不需改動。
//   風格：沿用站上 token（--c-gold / --c-bg-card / Noto Serif TC）與 jy-tool-card orb 質感。
// ══════════════════════════════════════════════════════════════════════
(function () {
  if (window._jySpreadPickerInit) return;
  window._jySpreadPickerInit = true;
  window._jySpreadPickerVersion = 'v80.3-20260606-spread-restore';
  if (typeof window._forcedSpread === 'undefined') window._forcedSpread = null;

  // ── 每個牌陣的圖示 / 點綴色(rgb) / 中文名 / 適合的問題 ──
  var META = {
    three_card:   { icon: 'fa-grip-lines',   accent: '201,168,76',  cn: '三牌陣',        suited: '單一是非、快速看一件事的走向' },
    five_card:    { icon: 'fa-border-all',   accent: '223,195,115', cn: '五牌陣',        suited: '一般問題 ・ 現況→原因→阻礙→建議→結果' },
    relationship: { icon: 'fa-heart',        accent: '251,113,133', cn: '關係牌陣',      suited: '兩個人的關係、感情' },
    either_or:    { icon: 'fa-code-branch',  accent: '96,165,250',  cn: '二選一',        suited: '抉擇、兩條路 ・ 看清各自的發展與結果' },
    cross:        { icon: 'fa-plus',         accent: '251,191,36',  cn: '十字牌陣',      suited: '有衝突拉扯、卡關 ・ 核心 vs 阻礙' },
    timeline:     { icon: 'fa-clock',        accent: '96,165,250',  cn: '時間線',        suited: '時機「什麼時候、要多久」' },
    celtic_cross: { icon: 'fa-cross',        accent: '139,92,246',  cn: '凱爾特十字',    suited: '整體開放局勢 ・ 十張牌完整深入' },
    tree_of_life: { icon: 'fa-sitemap',      accent: '52,211,153',  cn: '生命之樹',      suited: '靈性、人生課題、深層自我（卡巴拉）' },
    zodiac:       { icon: 'fa-compass',      accent: '223,195,115', cn: '黃道十二宮',    suited: '年度運勢 ・ 十二宮掃描一整年' },
    minor_arcana: { icon: 'fa-list-ul',      accent: '212,168,87',  cn: '小阿卡那',      suited: '具體生活問題 ・ 只用 56 張小牌' },
    fifteen_card:      { icon: 'fa-shapes',      accent: '139,92,246',  cn: '金色黎明十五張',        suited: '元素尊貴、不用逆位（進階）' },
    mathers_21:        { icon: 'fa-table-cells', accent: '201,168,76',   cn: 'Mathers 二十一張',     suited: '1888 第二法 ・ 三排七、由右至左（進階）' },
    mathers_horseshoe: { icon: 'fa-route',       accent: '201,168,76',   cn: 'Mathers 第一法馬蹄形', suited: '1888 第一法 ・ A/C/E 三組 horseshoe（進階）' }
  };
  var GROUPS = [
    { label: '常用', ids: ['three_card', 'five_card', 'relationship', 'either_or', 'cross', 'timeline', 'celtic_cross'] },
    { label: '進階・專門', ids: ['tree_of_life', 'zodiac', 'minor_arcana', 'fifteen_card', 'mathers_21', 'mathers_horseshoe'] }
  ];

  // v80.2-restore：選單不能完全依賴 SPREAD_DEFS。
  // 原因：手機端若 spread-picker 先於 tarot_upgrade 完成初始化，或快取吃到不同版本，
  // defOf(id) 回 null 會導致進階牌陣被 itemHTML 靜默隱藏。
  // 這裡提供 UI 顯示用 fallback；真正抽牌仍交給 tarot_upgrade.js 的 SPREAD_DEFS / setCurrentSpread。
  var FALLBACK_DEFS = {
    three_card:        { id: 'three_card',        zh: '三牌陣', count: 3 },
    five_card:         { id: 'five_card',         zh: '五牌陣', count: 5 },
    relationship:      { id: 'relationship',      zh: '關係牌陣', count: 6 },
    either_or:         { id: 'either_or',         zh: '二選一', count: 5 },
    cross:             { id: 'cross',             zh: '十字牌陣', count: 5 },
    timeline:          { id: 'timeline',          zh: '時間線', count: 5 },
    celtic_cross:      { id: 'celtic_cross',      zh: '凱爾特十字', count: 10 },
    tree_of_life:      { id: 'tree_of_life',      zh: '生命之樹', count: 10 },
    zodiac:            { id: 'zodiac',            zh: '黃道十二宮', count: 13 },
    minor_arcana:      { id: 'minor_arcana',      zh: '小阿卡那', count: 7 },
    fifteen_card:      { id: 'fifteen_card',      zh: '金色黎明十五張', count: 15 },
    mathers_21:        { id: 'mathers_21',        zh: 'Mathers 二十一張', count: 21 },
    mathers_horseshoe: { id: 'mathers_horseshoe', zh: 'Mathers First Method (1888 完整 horseshoe)', count: 54 }
  };

  function defOf(id) {
    if (typeof SPREAD_DEFS !== 'undefined' && SPREAD_DEFS && SPREAD_DEFS[id]) return SPREAD_DEFS[id];
    return FALLBACK_DEFS[id] || null;
  }

  // detectSpreadType 不再包裝（跨檔重新指派在實機不可靠）。
  // 手動選定的牌陣改由 ui.js 各偵測點直接讀 window._forcedSpread 強制套用。

  function injectCSS() {
    if (document.getElementById('jy-spread-pick-css')) return;
    var st = document.createElement('style');
    st.id = 'jy-spread-pick-css';
    st.textContent = [
      // 觸發卡片裡的列
      '.jy-spread-trigger{display:flex;align-items:center;gap:12px;width:100%;text-align:left;padding:12px 14px;border-radius:14px;border:1px solid rgba(201,168,76,.22);background:linear-gradient(135deg,rgba(201,168,76,.05),rgba(201,168,76,.012));cursor:pointer;font-family:var(--f-body);transition:all .3s cubic-bezier(.4,0,.2,1)}',
      '.jy-spread-trigger:active{transform:scale(.98)}',
      '.jy-spread-trigger:hover{border-color:rgba(201,168,76,.4)}',
      '.jy-spread-trigger-icon{width:42px;height:42px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:1.05rem;flex-shrink:0;background:linear-gradient(135deg,rgba(201,168,76,.18),rgba(201,168,76,.05));border:1.5px solid rgba(201,168,76,.35);color:var(--c-gold);box-shadow:0 2px 12px rgba(0,0,0,.2)}',
      '.jy-spread-trigger-body{flex:1;min-width:0}',
      '.jy-spread-trigger-name{display:block;font-size:.9rem;font-weight:700;color:var(--c-text);letter-spacing:.01em}',
      '.jy-spread-trigger-sub{display:block;font-size:.7rem;color:var(--c-text-dim);line-height:1.4;margin-top:2px}',
      '.jy-spread-trigger-chevron{color:var(--c-text-muted);font-size:.8rem;flex-shrink:0;transition:transform .2s,color .2s}',
      '.jy-spread-trigger:hover .jy-spread-trigger-chevron{transform:translateX(2px);color:var(--c-gold)}',
      // 彈窗（手機由下滑入、桌機置中）
      '.jym-overlay{position:fixed;inset:0;z-index:1200;background:rgba(0,0,0,.62);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);display:flex;align-items:flex-start;justify-content:center}',
      '.jym-sheet{background:var(--c-bg-card,#161618);border:1px solid rgba(201,168,76,.2);border-radius:0 0 20px 20px;width:100%;max-width:520px;max-height:100vh;overflow-y:auto;padding:18px 16px calc(24px + env(safe-area-inset-bottom,0px));box-shadow:0 12px 48px rgba(0,0,0,.5);animation:jymDown .32s cubic-bezier(.16,1,.3,1);-webkit-overflow-scrolling:touch}',
      '@media(min-width:640px){.jym-overlay{align-items:center}.jym-sheet{border-radius:20px;max-height:86vh;animation:jymPop .28s cubic-bezier(.16,1,.3,1)}}',
      '@keyframes jymDown{from{transform:translateY(-100%)}to{transform:translateY(0)}}',
      '@keyframes jymPop{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:scale(1)}}',
      '.jym-grip{width:38px;height:4px;border-radius:999px;background:rgba(255,255,255,.16);margin:12px auto -4px}',
      '@media(min-width:640px){.jym-grip{display:none}}',
      '.jym-head{display:flex;align-items:center;justify-content:space-between;gap:10px}',
      '.jym-title{font-family:var(--f-display,"Noto Serif TC",serif);font-size:1.12rem;font-weight:700;color:var(--c-gold);display:flex;align-items:center;gap:8px}',
      '.jym-title i{font-size:.95rem;opacity:.8}',
      '.jym-close{background:none;border:none;color:var(--c-text-dim);font-size:1.7rem;line-height:1;cursor:pointer;padding:0 6px;border-radius:8px;transition:color .2s}',
      '.jym-close:hover{color:var(--c-gold)}',
      '.jym-sub{font-size:.72rem;color:var(--c-text-muted);margin:5px 0 14px;line-height:1.55}',
      '.jym-group-label{font-size:.64rem;font-weight:700;letter-spacing:.14em;color:var(--c-text-muted);margin:16px 2px 9px;display:flex;align-items:center;gap:10px}',
      '.jym-group-label::after{content:"";flex:1;height:1px;background:rgba(255,255,255,.06)}',
      '.jym-list{display:flex;flex-direction:column;gap:8px}',
      '.jym-item{display:flex;align-items:center;gap:12px;width:100%;text-align:left;padding:11px 13px;border-radius:14px;border:1px solid rgba(255,255,255,.06);background:linear-gradient(135deg,rgba(255,255,255,.02),rgba(255,255,255,.004));cursor:pointer;font-family:var(--f-body);transition:all .25s cubic-bezier(.4,0,.2,1)}',
      '.jym-item:active{transform:scale(.985)}',
      '.jym-item:hover{border-color:rgba(255,255,255,.12)}',
      '.jym-orb{width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:1.05rem;flex-shrink:0;border:1.5px solid;box-shadow:0 2px 12px rgba(0,0,0,.2)}',
      '.jym-body{flex:1;min-width:0}',
      '.jym-name{display:flex;align-items:center;gap:8px;font-size:.9rem;font-weight:700;color:var(--c-text);line-height:1.25;flex-wrap:wrap}',
      '.jym-count{font-size:.62rem;font-weight:600;color:var(--c-gold);background:rgba(201,168,76,.12);border:1px solid rgba(201,168,76,.22);padding:1px 7px;border-radius:999px;letter-spacing:.02em;white-space:nowrap}',
      '.jym-desc{display:block;font-size:.7rem;color:var(--c-text-dim);line-height:1.45;margin-top:3px}',
      '.jym-check{margin-left:auto;color:var(--c-gold);font-size:.85rem;opacity:0;transform:scale(.6);transition:all .2s;flex-shrink:0}',
      '.jym-item-on{border-color:rgba(201,168,76,.5);background:linear-gradient(135deg,rgba(201,168,76,.08),rgba(201,168,76,.02));box-shadow:0 0 22px rgba(201,168,76,.06),inset 0 1px 0 rgba(201,168,76,.08)}',
      '.jym-item-on .jym-check{opacity:1;transform:scale(1)}'
    ].join('\n');
    document.head.appendChild(st);
  }

  function autoItemHTML() {
    return '<button type="button" class="jym-item" data-id="auto" onclick="selectSpread(\'auto\')">'
      + '<span class="jym-orb" style="background:linear-gradient(135deg,rgba(201,168,76,.2),rgba(201,168,76,.05));border-color:rgba(201,168,76,.4);color:var(--c-gold)"><i class="fas fa-wand-magic-sparkles"></i></span>'
      + '<span class="jym-body"><span class="jym-name">自動判斷 <span class="jym-count" style="color:var(--c-success,#34d399);background:rgba(52,211,153,.1);border-color:rgba(52,211,153,.25)">推薦</span></span>'
      + '<span class="jym-desc">依你輸入的問題，智慧選出最適合的牌陣</span></span>'
      + '<i class="fas fa-check jym-check"></i></button>';
  }

  function itemHTML(id) {
    var m = META[id], def = defOf(id);
    if (!m || !def) return '';
    var r = m.accent;
    return '<button type="button" class="jym-item" data-id="' + id + '" onclick="selectSpread(\'' + id + '\')">'
      + '<span class="jym-orb" style="background:linear-gradient(135deg,rgba(' + r + ',.18),rgba(' + r + ',.05));border-color:rgba(' + r + ',.38);color:rgba(' + r + ',.95)"><i class="fas ' + m.icon + '"></i></span>'
      + '<span class="jym-body"><span class="jym-name">' + m.cn + ' <span class="jym-count">' + def.count + ' 張</span></span>'
      + '<span class="jym-desc">適合：' + m.suited + '</span></span>'
      + '<i class="fas fa-check jym-check"></i></button>';
  }

  function renderList() {
    var host = document.getElementById('jy-spread-list');
    if (!host) return;
    var html = autoItemHTML();
    GROUPS.forEach(function (g) {
      html += '<div class="jym-group-label">' + g.label + '</div>';
      g.ids.forEach(function (id) { html += itemHTML(id); });
    });
    host.innerHTML = html;
    markSelected();
  }

  function markSelected() {
    var cur = window._forcedSpread || 'auto';
    var items = document.querySelectorAll('#jy-spread-list .jym-item');
    for (var i = 0; i < items.length; i++) {
      items[i].classList.toggle('jym-item-on', items[i].getAttribute('data-id') === cur);
    }
  }

  function updateTrigger() {
    var nameEl = document.getElementById('jy-spread-cur-name');
    var subEl = document.getElementById('jy-spread-cur-sub');
    var iconEl = document.getElementById('jy-spread-cur-icon');
    if (!nameEl) return;
    if (!window._forcedSpread) {
      nameEl.textContent = '自動判斷';
      if (subEl) subEl.textContent = '依你的問題智慧選擇最適合的牌陣';
      if (iconEl) iconEl.className = 'fas fa-wand-magic-sparkles';
    } else {
      var m = META[window._forcedSpread], def = defOf(window._forcedSpread);
      if (m && def) {
        nameEl.textContent = m.cn + '（' + def.count + ' 張）';
        if (subEl) subEl.textContent = '適合：' + m.suited;
        if (iconEl) iconEl.className = 'fas ' + m.icon;
      }
    }
  }

  // ★ v75.6：暴露給 resetAll 使用，保證同一函數管同一個按鈕
  window._jyUpdateSpreadTrigger = updateTrigger;

  window.openSpreadPicker = function () {
    var o = document.getElementById('jy-spread-modal');
    if (!o) return;
    renderList();
    o.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  };
  window.closeSpreadPicker = function () {
    var o = document.getElementById('jy-spread-modal');
    if (o) o.style.display = 'none';
    document.body.style.overflow = '';
  };
  window.selectSpread = function (id) {
    if (id === 'auto') {
      window._forcedSpread = null;
    } else {
      window._forcedSpread = id;

      // v80.2-restore：避免 setCurrentSpread 尚未載入或版本不同時直接中斷 UI。
      // 若 SPREAD_DEFS 真的缺該 id，console 會明確提示，不再讓選單「看起來消失」。
      try {
        if (typeof SPREAD_DEFS !== 'undefined' && SPREAD_DEFS && !SPREAD_DEFS[id]) {
          console.warn('[SpreadPicker] 選單已有此牌陣，但 SPREAD_DEFS 尚未註冊：', id, '請同步 tarot_upgrade.js');
        }
        if (typeof setCurrentSpread === 'function') setCurrentSpread(id);
      } catch (e) {
        console.warn('[SpreadPicker] setCurrentSpread 失敗：', id, e);
      }
    }
    // 清牌堆，讓下次抽牌（或返回抽牌頁）依新牌陣重建
    try { if (typeof deckShuffled !== 'undefined') deckShuffled = []; } catch (e) {}
    updateTrigger();
    markSelected();
    setTimeout(window.closeSpreadPicker, 180); // 讓使用者看到勾選動畫
  };

  function init() {
    injectCSS();
    updateTrigger();
    // 只在「塔羅快讀」顯示牌陣選單；開鑰之法用固定的 Opening of the Key，隱藏
    if (typeof window.pickTool === 'function' && !window._pickToolWrappedForSpread) {
      window._pickToolWrappedForSpread = true;
      var _op = window.pickTool;
      window.pickTool = function (tool) {
        _op(tool);
        var c = document.getElementById('jy-spread-card');
        if (c) c.style.display = (tool === 'tarot') ? '' : 'none';
      };
    }
    // 初始可見性：預設工具為塔羅
    var card = document.getElementById('jy-spread-card');
    if (card && typeof _selectedTool !== 'undefined' && _selectedTool && _selectedTool !== 'tarot') {
      card.style.display = 'none';
    }
  }

  if (document.readyState === 'complete') init();
  else document.addEventListener('DOMContentLoaded', init);
})();

