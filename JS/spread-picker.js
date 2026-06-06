// ══════════════════════════════════════════════════════════════════════
// 🎴 牌陣選擇器（v80.12-20260606-orthodox-complete）— 手動挑選任一站內支援牌陣
//   機制：手動選定後寫入 window._forcedSpread；ui.js / tarot_upgrade.js 直接讀取。
//   正統邊界：選單顯示「古典文獻 / 系統應用 / 現代實務」，避免把現代牌陣說成古典原典。
// ══════════════════════════════════════════════════════════════════════
(function () {
  if (window._jySpreadPickerInit) return;
  window._jySpreadPickerInit = true;
  window._jySpreadPickerVersion = 'v80.12-20260606-orthodox-complete';
  if (typeof window._forcedSpread === 'undefined') window._forcedSpread = null;

  var META = {
    one_card:          { icon:'fa-circle-dot',        accent:'201,168,76',  cn:'一張牌',              tag:'現代實務', suited:'今日指引、單句快速提醒、極短問句' },
    three_card:        { icon:'fa-grip-lines',        accent:'201,168,76',  cn:'三牌陣',              tag:'現代實務', suited:'單一是非、快速看一件事的走向' },
    five_card:         { icon:'fa-border-all',        accent:'223,195,115', cn:'五牌陣',              tag:'現代實務', suited:'一般問題 ・ 現況→原因→阻礙→建議→結果' },
    relationship:      { icon:'fa-heart',             accent:'251,113,133', cn:'關係牌陣',            tag:'現代實務', suited:'兩個人的關係、感情、對方心態' },
    either_or:         { icon:'fa-code-branch',       accent:'96,165,250',  cn:'二選一',              tag:'現代實務', suited:'抉擇、兩條路 ・ 看清各自的發展與結果' },
    cross:             { icon:'fa-plus',              accent:'251,191,36',  cn:'十字牌陣',            tag:'現代實務', suited:'有衝突拉扯、卡關 ・ 核心 vs 阻礙' },
    timeline:          { icon:'fa-clock',             accent:'96,165,250',  cn:'時間線',              tag:'現代實務', suited:'時機「什麼時候、要多久」' },
    horseshoe:         { icon:'fa-route',             accent:'52,211,153',  cn:'七張馬蹄形',          tag:'實務傳承', suited:'中等複雜 ・ 過去、現在、隱藏因素、建議、結果' },
    celtic_cross:      { icon:'fa-cross',             accent:'139,92,246',  cn:'凱爾特十字',          tag:'Waite 原典', suited:'整體開放局勢 ・ 十張牌完整深入' },
    tree_of_life:      { icon:'fa-sitemap',           accent:'52,211,153',  cn:'生命之樹',            tag:'系統應用', suited:'靈性、人生課題、深層自我（卡巴拉）' },
    major_arcana_22:   { icon:'fa-circle-nodes',      accent:'139,92,246',  cn:'大阿卡那二十二路徑',  tag:'系統應用', suited:'只用22張大牌 ・ 靈魂/命運骨架' },
    zodiac:            { icon:'fa-compass',           accent:'223,195,115', cn:'黃道十二宮',          tag:'系統應用', suited:'年度運勢 ・ 十二宮掃描一整年' },
    minor_arcana:      { icon:'fa-list-ul',           accent:'212,168,87',  cn:'小阿卡那',            tag:'現代實務', suited:'具體生活問題 ・ 只用56張小牌' },
    fifteen_card:      { icon:'fa-shapes',            accent:'139,92,246',  cn:'Thoth/GD 十五張',     tag:'可查傳承', suited:'元素互動、不用RWS逆位（進階）' },
    waite_42:          { icon:'fa-table-cells-large', accent:'223,195,115', cn:'Waite 四十二張',      tag:'Waite 原典', suited:'1911替代法 ・ 無明確問題/人生趨勢' },
    waite_35:          { icon:'fa-layer-group',       accent:'223,195,115', cn:'Waite 三十五張',      tag:'Waite 原典', suited:'1911補充法 ・ 先前讀盤仍有疑義時追問' },
    mathers_21:        { icon:'fa-table-cells',       accent:'201,168,76',  cn:'Mathers 二十一張',   tag:'Mathers 原典', suited:'1888第二法 ・ 三排七、由右至左（進階）' },
    mathers_horseshoe: { icon:'fa-route',             accent:'201,168,76',  cn:'Mathers 第一法馬蹄形', tag:'Mathers 原典', suited:'1888第一法 ・ A/C/E 三組 horseshoe（進階）' },
    mathers_66:        { icon:'fa-diagram-project',   accent:'201,168,76',  cn:'Mathers 六十六張',   tag:'Mathers 原典', suited:'1888第三法 ・ 過去/現在/未來大型總盤' }
  };

  var GROUPS = [
    { label:'快問・常用', ids:['one_card','three_card','five_card','relationship','either_or','cross','timeline','horseshoe','celtic_cross'] },
    { label:'靈性・系統', ids:['tree_of_life','major_arcana_22','zodiac','minor_arcana','fifteen_card'] },
    { label:'文獻原法・大型牌陣', ids:['waite_42','waite_35','mathers_21','mathers_horseshoe','mathers_66'] }
  ];

  var FALLBACK_DEFS = {
    one_card:{id:'one_card',zh:'一張牌',count:1}, three_card:{id:'three_card',zh:'三牌陣',count:3}, five_card:{id:'five_card',zh:'五牌陣',count:5},
    relationship:{id:'relationship',zh:'關係牌陣',count:6}, either_or:{id:'either_or',zh:'二選一',count:5}, cross:{id:'cross',zh:'十字牌陣',count:5},
    timeline:{id:'timeline',zh:'時間線',count:5}, horseshoe:{id:'horseshoe',zh:'七張馬蹄形',count:7}, celtic_cross:{id:'celtic_cross',zh:'凱爾特十字',count:10},
    tree_of_life:{id:'tree_of_life',zh:'生命之樹',count:10}, major_arcana_22:{id:'major_arcana_22',zh:'大阿卡那二十二路徑',count:22}, zodiac:{id:'zodiac',zh:'黃道十二宮',count:13},
    minor_arcana:{id:'minor_arcana',zh:'小阿卡那',count:7}, fifteen_card:{id:'fifteen_card',zh:'Thoth/GD 十五張',count:15},
    waite_42:{id:'waite_42',zh:'Waite 四十二張',count:42}, waite_35:{id:'waite_35',zh:'Waite 三十五張',count:35},
    mathers_21:{id:'mathers_21',zh:'Mathers 二十一張',count:21}, mathers_horseshoe:{id:'mathers_horseshoe',zh:'Mathers 第一法馬蹄形',count:54}, mathers_66:{id:'mathers_66',zh:'Mathers 六十六張',count:66}
  };
  function defOf(id){ if (typeof SPREAD_DEFS !== 'undefined' && SPREAD_DEFS && SPREAD_DEFS[id]) return SPREAD_DEFS[id]; return FALLBACK_DEFS[id] || null; }

  function injectCSS(){
    if (document.getElementById('jy-spread-pick-css')) return;
    var st=document.createElement('style'); st.id='jy-spread-pick-css';
    st.textContent=[
      '.jy-spread-trigger{display:flex;align-items:center;gap:12px;width:100%;text-align:left;padding:12px 14px;border-radius:14px;border:1px solid rgba(201,168,76,.22);background:linear-gradient(135deg,rgba(201,168,76,.05),rgba(201,168,76,.012));cursor:pointer;font-family:var(--f-body);transition:all .3s cubic-bezier(.4,0,.2,1)}',
      '.jy-spread-trigger:active{transform:scale(.98)}.jy-spread-trigger:hover{border-color:rgba(201,168,76,.4)}',
      '.jy-spread-trigger-icon{width:42px;height:42px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:1.05rem;flex-shrink:0;background:linear-gradient(135deg,rgba(201,168,76,.18),rgba(201,168,76,.05));border:1.5px solid rgba(201,168,76,.35);color:var(--c-gold);box-shadow:0 2px 12px rgba(0,0,0,.2)}',
      '.jy-spread-trigger-body{flex:1;min-width:0}.jy-spread-trigger-name{display:block;font-size:.9rem;font-weight:700;color:var(--c-text);letter-spacing:.01em}.jy-spread-trigger-sub{display:block;font-size:.7rem;color:var(--c-text-dim);line-height:1.4;margin-top:2px}.jy-spread-trigger-chevron{color:var(--c-text-muted);font-size:.8rem;flex-shrink:0;transition:transform .2s,color .2s}.jy-spread-trigger:hover .jy-spread-trigger-chevron{transform:translateX(2px);color:var(--c-gold)}',
      '.jym-overlay{position:fixed;inset:0;z-index:1200;background:rgba(0,0,0,.62);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);display:flex;align-items:flex-start;justify-content:center}',
      '.jym-sheet{background:var(--c-bg-card,#161618);border:1px solid rgba(201,168,76,.2);border-radius:0 0 20px 20px;width:100%;max-width:520px;max-height:100vh;overflow-y:auto;padding:18px 16px calc(24px + env(safe-area-inset-bottom,0px));box-shadow:0 12px 48px rgba(0,0,0,.5);animation:jymDown .32s cubic-bezier(.16,1,.3,1);-webkit-overflow-scrolling:touch}',
      '@media(min-width:640px){.jym-overlay{align-items:center}.jym-sheet{border-radius:20px;max-height:86vh;animation:jymPop .28s cubic-bezier(.16,1,.3,1)}}@keyframes jymDown{from{transform:translateY(-100%)}to{transform:translateY(0)}}@keyframes jymPop{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:scale(1)}}',
      '.jym-head{display:flex;align-items:center;justify-content:space-between;gap:10px}.jym-title{font-family:var(--f-display,"Noto Serif TC",serif);font-size:1.12rem;font-weight:700;color:var(--c-gold);display:flex;align-items:center;gap:8px}.jym-close{background:none;border:none;color:var(--c-text-dim);font-size:1.7rem;line-height:1;cursor:pointer;padding:0 6px;border-radius:8px}.jym-close:hover{color:var(--c-gold)}',
      '.jym-sub{font-size:.72rem;color:var(--c-text-muted);margin:5px 0 14px;line-height:1.55}.jym-group-label{font-size:.64rem;font-weight:700;letter-spacing:.14em;color:var(--c-text-muted);margin:16px 2px 9px;display:flex;align-items:center;gap:10px}.jym-group-label::after{content:"";flex:1;height:1px;background:rgba(255,255,255,.06)}.jym-list{display:flex;flex-direction:column;gap:8px}',
      '.jym-item{display:flex;align-items:center;gap:12px;width:100%;text-align:left;padding:11px 13px;border-radius:14px;border:1px solid rgba(255,255,255,.06);background:linear-gradient(135deg,rgba(255,255,255,.02),rgba(255,255,255,.004));cursor:pointer;font-family:var(--f-body);transition:all .25s cubic-bezier(.4,0,.2,1)}.jym-item:active{transform:scale(.985)}.jym-item:hover{border-color:rgba(255,255,255,.12)}',
      '.jym-orb{width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:1.05rem;flex-shrink:0;border:1.5px solid;box-shadow:0 2px 12px rgba(0,0,0,.2)}.jym-body{flex:1;min-width:0}.jym-name{display:flex;align-items:center;gap:8px;font-size:.9rem;font-weight:700;color:var(--c-text);line-height:1.25;flex-wrap:wrap}.jym-count,.jym-tag{font-size:.62rem;font-weight:600;color:var(--c-gold);background:rgba(201,168,76,.12);border:1px solid rgba(201,168,76,.22);padding:1px 7px;border-radius:999px;letter-spacing:.02em;white-space:nowrap}.jym-tag{color:var(--c-text-dim);background:rgba(255,255,255,.04);border-color:rgba(255,255,255,.08)}.jym-desc{display:block;font-size:.7rem;color:var(--c-text-dim);line-height:1.45;margin-top:3px}.jym-check{margin-left:auto;color:var(--c-gold);font-size:.85rem;opacity:0;transform:scale(.6);transition:all .2s;flex-shrink:0}.jym-item-on{border-color:rgba(201,168,76,.5);background:linear-gradient(135deg,rgba(201,168,76,.08),rgba(201,168,76,.02));box-shadow:0 0 22px rgba(201,168,76,.06),inset 0 1px 0 rgba(201,168,76,.08)}.jym-item-on .jym-check{opacity:1;transform:scale(1)}'
    ].join('\n');
    document.head.appendChild(st);
  }

  function autoItemHTML(){
    return '<button type="button" class="jym-item" data-id="auto" onclick="selectSpread(\'auto\')"><span class="jym-orb" style="background:linear-gradient(135deg,rgba(201,168,76,.2),rgba(201,168,76,.05));border-color:rgba(201,168,76,.4);color:var(--c-gold)"><i class="fas fa-wand-magic-sparkles"></i></span><span class="jym-body"><span class="jym-name">自動判斷 <span class="jym-count" style="color:var(--c-success,#34d399);background:rgba(52,211,153,.1);border-color:rgba(52,211,153,.25)">推薦</span></span><span class="jym-desc">依問題類型、時間範圍、人物數量、複雜度選牌陣；此分流屬現代實務，不冒充原典。</span></span><i class="fas fa-check jym-check"></i></button>';
  }
  function itemHTML(id){
    var m=META[id], def=defOf(id); if(!m||!def) return '';
    var r=m.accent;
    return '<button type="button" class="jym-item" data-id="'+id+'" onclick="selectSpread(\''+id+'\')"><span class="jym-orb" style="background:linear-gradient(135deg,rgba('+r+',.18),rgba('+r+',.05));border-color:rgba('+r+',.38);color:rgba('+r+',.95)"><i class="fas '+m.icon+'"></i></span><span class="jym-body"><span class="jym-name">'+m.cn+' <span class="jym-count">'+def.count+' 張</span><span class="jym-tag">'+m.tag+'</span></span><span class="jym-desc">適合：'+m.suited+'</span></span><i class="fas fa-check jym-check"></i></button>';
  }
  function renderList(){
    var host=document.getElementById('jy-spread-list'); if(!host) return;
    var html=autoItemHTML();
    GROUPS.forEach(function(g){ html += '<div class="jym-group-label">'+g.label+'</div>'; g.ids.forEach(function(id){ html += itemHTML(id); }); });
    host.innerHTML=html; markSelected();
  }
  function markSelected(){
    var cur=window._forcedSpread||'auto';
    document.querySelectorAll('#jy-spread-list .jym-item').forEach(function(it){ it.classList.toggle('jym-item-on', it.getAttribute('data-id')===cur); });
  }
  function updateTrigger(){
    var nameEl=document.getElementById('jy-spread-cur-name'), subEl=document.getElementById('jy-spread-cur-sub'), iconEl=document.getElementById('jy-spread-cur-icon');
    if(!nameEl) return;
    if(!window._forcedSpread){ nameEl.textContent='自動判斷'; if(subEl) subEl.textContent='依問題智慧選擇最適合的牌陣'; if(iconEl) iconEl.className='fas fa-wand-magic-sparkles'; }
    else { var m=META[window._forcedSpread], def=defOf(window._forcedSpread); if(m&&def){ nameEl.textContent=m.cn+'（'+def.count+' 張）'; if(subEl) subEl.textContent=m.tag+'｜適合：'+m.suited; if(iconEl) iconEl.className='fas '+m.icon; } }
  }
  window._jyUpdateSpreadTrigger=updateTrigger;
  window.openSpreadPicker=function(){ var o=document.getElementById('jy-spread-modal'); if(!o) return; renderList(); o.style.display='flex'; document.body.style.overflow='hidden'; };
  window.closeSpreadPicker=function(){ var o=document.getElementById('jy-spread-modal'); if(o) o.style.display='none'; document.body.style.overflow=''; };
  window.selectSpread=function(id){
    if(id==='auto') window._forcedSpread=null;
    else {
      window._forcedSpread=id;
      try {
        if (typeof SPREAD_DEFS !== 'undefined' && SPREAD_DEFS && !SPREAD_DEFS[id]) console.warn('[SpreadPicker] 選單已有此牌陣，但 SPREAD_DEFS 尚未註冊：', id, '請同步 tarot_upgrade.js');
        if (typeof setCurrentSpread === 'function') setCurrentSpread(id);
      } catch(e){ console.warn('[SpreadPicker] setCurrentSpread 失敗：', id, e); }
    }
    try { if (typeof deckShuffled !== 'undefined') deckShuffled=[]; } catch(e){}
    updateTrigger(); markSelected(); setTimeout(window.closeSpreadPicker,180);
  };
  function init(){
    injectCSS(); updateTrigger();
    if(typeof window.pickTool==='function' && !window._pickToolWrappedForSpread){
      window._pickToolWrappedForSpread=true; var _op=window.pickTool;
      window.pickTool=function(tool){ _op(tool); var c=document.getElementById('jy-spread-card'); if(c) c.style.display=(tool==='tarot')?'':'none'; };
    }
    var card=document.getElementById('jy-spread-card');
    if(card && typeof _selectedTool!=='undefined' && _selectedTool && _selectedTool!=='tarot') card.style.display='none';
  }
  if(document.readyState==='complete') init(); else document.addEventListener('DOMContentLoaded', init);
})();
