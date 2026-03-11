// ═══════════════════════════════════════════════════════════════
// ui.js — 靜月之光模組化拆分
// ═══════════════════════════════════════════════════════════════

// ── Admin Token：從 URL #admin=xxx 或 ?token=xxx 或 localStorage 讀取 ──
// 用 hash fragment 最可靠（伺服器重導向不會吃掉 # 後面的內容）
(function(){
  var token = '';
  
  // 優先：hash fragment（#admin=xxx）— 不會被伺服器重導向吃掉
  var hash = window.location.hash || '';
  var hashMatch = hash.match(/[#&]admin=([^&]+)/);
  if (hashMatch) {
    token = decodeURIComponent(hashMatch[1]);
    // 清掉 hash 裡的 admin 參數（不留痕跡）
    var cleanHash = hash.replace(/[#&]admin=[^&]+/, '').replace(/^#&/, '#').replace(/^#$/, '');
    window.history.replaceState({}, '', window.location.pathname + window.location.search + cleanHash);
  }
  
  // 備用：query string（?token=xxx）
  if (!token) {
    var params = new URLSearchParams(window.location.search);
    var t = params.get('token');
    if (t) {
      token = t;
      params.delete('token');
      var newUrl = window.location.pathname + (params.toString() ? '?' + params.toString() : '') + window.location.hash;
      window.history.replaceState({}, '', newUrl);
    }
  }
  
  // 存入 localStorage（持久化）
  if (token) {
    try { localStorage.setItem('_jy_at', token); } catch(e){}
  }
  
  // 最終：從 localStorage 讀取
  if (!token) {
    try { token = localStorage.getItem('_jy_at') || ''; } catch(e){}
  }
  
  window._JY_ADMIN_TOKEN = token;
  if (token) console.log('[Admin] Token loaded');
})();

// ── toggleCollapse + renderRemedy + goStep + resetAll (lines 26-418) ──
/* Collapsible toggle */
function toggleCollapse(el){
  const card=el.closest('.collapsible-card');
  if(card) card.classList.toggle('open');
}

/* ═══ REMEDY: 五行能量分析 + 優化建議 ═══ */
function renderRemedy(bazi,type){
  const ep=bazi.ep||{}, dm=bazi.dm, el=bazi.dmEl, strong=bazi.strong;
  const fav=bazi.fav||[], unfav=bazi.unfav||[];
  const tot=Object.values(ep).reduce((a,b)=>a+b,0)||60;

  // ── 五行狀態診斷 ──
  const EL_NAMES={金:'金',木:'木',水:'水',火:'火',土:'土'};
  const EL_COLORS={金:'#c0c0c0',木:'#4caf50',水:'#42a5f5',火:'#ff5722',土:'#ff9800'};
  const states=bazi.wxStates||{};

  let diagHTML='';
  ['木','火','土','金','水'].forEach(e=>{
    const v=ep[e]||0;
    const pct=Math.round(v/tot*100);
    const ideal=20; // 平衡=20%
    const diff=pct-ideal;
    let tag,tagClass;
    if(pct<=3){tag='幾乎沒有';tagClass='diag-tag-critical';}
    else if(pct<=5){tag='嚴重不足';tagClass='diag-tag-critical';}
    else if(pct<=10){tag='不足';tagClass='diag-tag-critical';}
    else if(pct<=14){tag='偏弱';tagClass='diag-tag-lack';}
    else if(pct<=18){tag='稍弱';tagClass='diag-tag-lack';}
    else if(pct<=22){tag='正常偏低';tagClass='diag-tag-ok';}
    else if(pct<=26){tag='正常';tagClass='diag-tag-ok';}
    else if(pct<=30){tag='正常偏高';tagClass='diag-tag-ok';}
    else if(pct<=35){tag='偏旺';tagClass='diag-tag-excess';}
    else if(pct<=45){tag='過旺';tagClass='diag-tag-excess';}
    else{tag='極旺';tagClass='diag-tag-excess';}

    const state=states[e]||'';
    diagHTML+=`<div class="diag-row">
      <span class="diag-label" style="color:${EL_COLORS[e]}">${e} ${state}</span>
      <div class="diag-bar-wrap"><div class="diag-bar" style="width:${Math.min(pct*2,100)}%;background:${EL_COLORS[e]}"></div></div>
      <span class="diag-value" style="color:${EL_COLORS[e]}">${Math.round(v)}分</span>
      <span class="diag-tag ${tagClass}">${tag}</span>
    </div>`;
  });

  // ── 能量分析標題 ──
  const weakEls=Object.entries(ep).filter(([e,v])=>(v/tot)<0.12).map(([e])=>e);
  const strongEls=Object.entries(ep).filter(([e,v])=>(v/tot)>0.33).map(([e])=>e);
  const alertEl=document.getElementById('remedy-alert');

  let icon='🔮', title='', subtitle='';
  if(weakEls.length>=2){
    icon='⚠️';title=`檢測結果：你的能量磁場嚴重「缺${weakEls.join('、')}」！`;
    subtitle=`這導致你最近做事提不起勁、容易遇阻。你需要補充「${weakEls.map(e=>e+'行').join('＋')}」能量來平衡。`;
    alertEl.classList.add('alert-danger');
  }else if(weakEls.length===1){
    const weakDesc={金:'決斷力不足、容易猶豫、呼吸系統弱',木:'缺乏衝勁、肝火鬱結、做事拖延',水:'智慧受阻、腎氣不足、容易招小人',火:'做事提不起勁、心氣不足、貴人運弱',土:'根基不穩、腸胃虛弱、存不住錢'};
    icon='⚠️';title=`檢測結果：你的能量磁場嚴重「缺${weakEls[0]}」！`;
    subtitle=`這導致你${weakDesc[weakEls[0]]||'最近運勢受阻'}。你需要補充「${weakEls[0]+'行'}」能量來平衡。`;
    alertEl.classList.add('alert-danger');
  }else if(strongEls.length){
    icon='💡';title=`你的${strongEls.join('、')}行能量充沛`;
    subtitle='適度引導分散，讓整體能量更均衡';
    alertEl.classList.remove('alert-danger');
  }else{
    icon='✨';title='你的五行能量分佈均衡';
    subtitle='體質很好，小幅優化就能更上一層樓';
    alertEl.classList.remove('alert-danger');
  }

  document.getElementById('remedy-icon')&&(document.getElementById('remedy-icon').textContent=icon);
  document.getElementById('remedy-title')&&(document.getElementById('remedy-title').textContent=title);
  if(document.getElementById('remedy-title'))document.getElementById('remedy-title').style.color=weakEls.length>0?'#f87171':'var(--c-gold)';
  document.getElementById('remedy-subtitle')&&(document.getElementById('remedy-subtitle').textContent=subtitle);
  if(document.getElementById('remedy-subtitle'))document.getElementById('remedy-subtitle').style.color=weakEls.length>0?'#fca5a5':'var(--c-text-dim)';
  document.getElementById('remedy-diagnosis').innerHTML=diagHTML;

  // ── 改運處方 ──
  const actions=[];
  const TYPE_LABELS={love:'感情',career:'事業',wealth:'財運',health:'健康',general:'整體運勢',relationship:'人際',family:'家庭'};
  const typeLabel=TYPE_LABELS[type]||'運勢';

  // 處方1: 五行補強（依喜用神，含命理解釋）
  const mainFav=fav[0]||'土';
  const mainUnfav=unfav[0]||'';
  const dmEl=bazi.dmEl;
  const isStrong=bazi.strong;
  
  /* 生成命理原因說明（優先調候，次用通用） */
  function explainWhy(dm, fav1, unfav1, strong){
    /* 如果有調候結果，優先使用 */
    if(bazi.tiaohou){
      const th=bazi.tiaohou;
      return `<strong>【${th.reason}】</strong>${th.detail}<br><br>${th.needReason}`;
    }
    /* 通用解釋 */
    if(strong){
      return `你是「${dm}」日主，身強，自身能量充沛。需要 <strong>${fav1}行</strong> 來洩掉多餘的力量，讓能量流動起來，才不會鬱積。`;
    }else{
      const keEl = BE_KE[dm];
      const shengEl = BE_SHENG[dm];
      if(fav1 === shengEl){
        return `你是「${dm}」日主，身弱，命盤中「${keEl}行」（壓力/管束）偏旺。需要 <strong>${fav1}行</strong> 作為救星 —— ${fav1}能洩掉${keEl}的銳氣，再轉而生${dm}（${keEl}→${fav1}→${dm}，這叫「殺印相生」）。`;
      }else{
        return `你是「${dm}」日主，身弱，需要 <strong>${fav1}行</strong> 來幫扶自身力量，讓你站穩腳步。`;
      }
    }
  }
  
  const favCrystals={
    金:{stone:'白水晶 / 天鐵',color:'白色、金色、銀色',dir:'正西方',food:'白色食物（白蘿蔔、豆腐、百合）'},
    木:{stone:'綠幽靈 / 東陵玉',color:'綠色、青色',dir:'正東方',food:'綠色蔬果（花椰菜、奇異果、菠菜）'},
    水:{stone:'黑曜石 / 海藍寶 / 黑髮晶',color:'藍色、黑色',dir:'正北方',food:'黑色食物（黑芝麻、海帶、藍莓）'},
    火:{stone:'紅瑪瑙 / 石榴石',color:'紅色、紫色',dir:'正南方',food:'紅色食物（紅棗、枸杞、番茄）'},
    土:{stone:'黃水晶 / 虎眼石',color:'黃色、棕色',dir:'中央/東北',food:'黃色食物（南瓜、玉米、薑黃）'}
  };
  const fc=favCrystals[mainFav]||favCrystals['土'];
  const whyText=explainWhy(dmEl, mainFav, mainUnfav, isStrong);
  
  actions.push({
    title:`你的命格需要「${mainFav}行」能量`,
    desc:`${whyText}<br><br>日常多穿 <strong>${fc.color}</strong> 系服飾，居家或辦公 <strong>${fc.dir}</strong> 方位擺放水晶，飲食多攝取${fc.food}。`,
    crystal:`💎 推薦：${fc.stone}`
  });

  // 處方2: 針對問題類型（動態過濾忌神）
  const avoidSet=new Set(unfav);
  function safeStone(stones, el){
    /* 如果推薦的水晶五行是忌神，改推喜用神水晶 */
    if(avoidSet.has(el)) return `<strong>${fc.stone.split('/')[0].trim()}</strong>（${mainFav}行）`;
    return `<strong>${stones}</strong>`;
  }
  const typeRemedy={
    love:{title:'增強桃花 / 感情磁場',desc:`建議佩戴${safeStone('粉晶','火')}於左手增強異性緣，臥室西南方（坤位）可擺放水晶球，週五（金星日）是約會好日子。`},
    career:{title:'提升事業貴人運',desc:`辦公桌左上角放${safeStone('綠幽靈','木')}招貴人，重要會議佩戴${avoidSet.has('金')?`${mainFav}行系`:'金色系'}飾品增強氣場。`},
    wealth:{title:'開啟正偏財運通道',desc:`錢包內放小片${safeStone('黃水晶','土')}碎石招偏財，每月農曆初二、十六「做牙」，家中財位（大門斜對角）保持明亮。`},
    health:{title:'五行養生調理方案',desc:`根據你的命盤，${mainFav}行不足可能影響相關臟腑。建議從飲食（${fc.food}）、作息（${mainFav==='水'?'早睡養腎':mainFav==='木'?'舒肝勿怒':mainFav==='火'?'午休養心':mainFav==='金'?'深呼吸養肺':'飲食規律養脾'}）著手。`},
    general:{title:'全方位運勢提升',desc:`今年最重要的是穩住${mainFav}行能量。選一條符合喜用神的水晶手鏈隨身佩戴，等於時刻在補運。`},
    relationship:{title:'改善人際磁場',desc:`佩戴${safeStone('粉晶','火')}增加親和力，${safeStone('海藍寶','水')}幫助溝通表達。`},
    family:{title:'穩固家庭和諧能量',desc:`家中客廳放${avoidSet.has('火')?`${mainFav}行水晶`:'<strong>紫水晶洞</strong>'}淨化磁場，臥室避免放太多電子產品。`}
  };
  const tr=typeRemedy[type]||typeRemedy.general;
  actions.push({title:tr.title,desc:tr.desc,crystal:null});

  // 處方2.5: 忌神警告 — 告訴用戶不要碰什麼
  if(unfav.length){
    const avoidCrystals={
      金:'白水晶、天鐵、金髮晶、純銀飾品',
      木:'綠幽靈、翡翠、橄欖石',
      水:'海藍寶、月光石、藍紋瑪瑙',
      火:'紅瑪瑙、石榴石、紫水晶',
      土:'黃水晶、虎眼石（黃）、茶晶'
    };
    const avoidColors={金:'白色/金色/銀色',木:'綠色',水:'黑色/藍色',火:'紅色/紫色',土:'黃色/棕色'};
    let avoidList=unfav.map(u=>`<strong>${u}行</strong>（${avoidColors[u]||''}）`).join('、');
    let avoidStones=unfav.map(u=>avoidCrystals[u]||'').filter(Boolean).join('、');
    
    /* 如果有調候，使用調候的避開原因 */
    let avoidExplain='';
    if(bazi.tiaohou && bazi.tiaohou.avoidReason){
      avoidExplain=bazi.tiaohou.avoidReason;
    }else{
      avoidExplain='配戴這些五行的水晶<strong>反而會讓運勢卡住</strong>。';
    }
    
    actions.push({
      title:'⛔ 避開這些（忌神提醒）',
      desc:`${avoidExplain}<br><br>你的命盤中 ${avoidList} 需要避開。<br>具體避開：${avoidStones}。<br>如果之前有在戴這些，建議先暫時取下觀察看看。`,
      crystal:null
    });
  }

  // 處方3: 大運建議
  const curDy=bazi.dayun?bazi.dayun.find(d=>d.isCurrent):null;
  if(curDy){
    const dyFav=(curDy.level.includes('吉')&&!curDy.level.includes('凶'));
    actions.push({
      title:dyFav?'把握當前大運能量':'穩定大運低谷期',
      desc:dyFav
        ?`你目前走「${curDy.gz}」大運（${curDy.level}），這段時期能量充足，是${typeLabel}的好時機。<strong>配合水晶能量，效果加乘</strong>。`
        :`當前大運「${curDy.gz}」（${curDy.level}），能量壓力較大。<strong>更需要水晶能量護身</strong>，幫你穩住磁場、化解阻力。`
    });
  }

  // 渲染
  let actHTML='';
  actions.forEach((a,i)=>{
    actHTML+=`<div class="action-item">
      <div class="action-num">${i+1}</div>
      <div class="action-content">
        <div class="action-title">${a.title}</div>
        <div class="action-desc">${a.desc}</div>
        ${a.crystal?`<div class="action-crystal" onclick="document.getElementById('r-crystal').scrollIntoView({behavior:'smooth'})">${a.crystal} <i class="fas fa-arrow-right" style="font-size:.7rem"></i></div>`:''}
      </div>
    </div>`;
  });
  document.getElementById('remedy-actions').innerHTML=actHTML;
}

/* Lazy init for extra features (only when user opens the panel) */
// initExtraFeatures 定義在下方 DOMContentLoaded 中
function goStep(n){
  // ── 支持 ID 字串或數字 ──
  var targetId;
  if (typeof n === 'string') {
    targetId = n; // 直接傳 'step-tarot' 等
  } else {
    // 數字 → 映射到原有 step ID（向下相容）
    var stepMap = {0:'step-0', 1:'step-1', 2:'step-2', 3:'step-3'};
    targetId = stepMap[n];
    if (!targetId) return;
  }

  if(targetId==='step-3' && !S.bazi){alert('請先填寫基本資料');return}
  
  // ── 步驟轉場動畫 ──
  var currentId = 'step-' + S.step;
  if (typeof S.step === 'string') currentId = S.step;
  var needsTransition = (currentId==='step-1'&&targetId==='step-2') || (currentId==='step-2'&&targetId==='step-3');
  
  function doSwitch(){
    document.querySelectorAll('.step').forEach(function(s){
      s.classList.toggle('active', s.id === targetId);
    });
    // nav-link 和 stepper 只對數字步驟有效
    var stepNum = {0:'step-0',1:'step-1',2:'step-2',3:'step-3'};
    var numIdx = -1;
    Object.keys(stepNum).forEach(function(k){ if(stepNum[k]===targetId) numIdx=parseInt(k); });
    if (numIdx >= 0) {
      document.querySelectorAll('.nav-link').forEach(function(l,i){l.classList.toggle('active',i===numIdx)});
      document.querySelectorAll('.stepper-item').forEach(function(s,i){s.classList.remove('active','done');if(i<numIdx)s.classList.add('done');if(i===numIdx)s.classList.add('active')});
    }
    S.step = (numIdx >= 0) ? numIdx : targetId;
    window.scrollTo({top:0,behavior:'smooth'});
    if(targetId==='step-2'){
      if(drawnCards.length>=10 && !S._isAdmin) showTarotLocked(); // 已有快取牌，顯示鎖定（管理員不受限）
      else if(drawnCards.length>=10 && S._isAdmin){ drawnCards=[]; deckShuffled=[]; initTarotDeck(); } // 管理員重置
      else if(!deckShuffled.length) initTarotDeck(); // 首次初始化牌堆
    }
    if(targetId==='step-3'){
      runAnalysis();
      setTimeout(function(){
        var cta=document.getElementById('sticky-cta');
        if(cta){
          if(S.bazi&&S.bazi.fav){
            var favAll=S.bazi.fav;
            var fav=favAll[0]||'土';
            var favLabel=favAll.length>1?favAll.slice(0,2).join('＋'):fav;
            var th=S.bazi.tiaohou;
            var label=document.getElementById('sticky-cta-label');
            var desc=document.getElementById('sticky-cta-desc');
            if(label) label.innerHTML='💎 現在更適合你的：'+favLabel+'行能量配戴';
            if(desc) desc.textContent=th?(th.reason+' — 先看命盤，再挑更貼近你現在狀態的款式'):('先看命盤，再挑更貼近你現在狀態的 '+favLabel+' 行款式');
          }
          cta.classList.add('visible');
        }
      }, 3000);
      setTimeout(function(){ showFeedbackSection(); }, 4000);
      // 如果從塔羅進來的，顯示 tab
      if (S._fromTarot) {
        var tabs = document.getElementById('result-mode-tabs');
        if (tabs) tabs.style.display = 'block';
      }
    }else{
      const cta=document.getElementById('sticky-cta');
      if(cta) cta.classList.remove('visible');
    }
  }
  
  if(needsTransition){
    // ═══ 五角星陣轉場（與自動模式同款）═══
    const isFinalStep=(n===3);
    const overlay=document.createElement('div');
    overlay.className='loading-overlay';
    overlay.id='loading-overlay-manual';
    const dims=[
      {id:'mld-bazi',  sym:'☰', label:'八字',   angle:-90},
      {id:'mld-ziwei', sym:'☆', label:'紫微',   angle:-90+60},
      {id:'mld-meihua',sym:'☯', label:'梅花',   angle:-90+120},
      {id:'mld-tarot', sym:'✦', label:'塔羅',   angle:-90+180},
      {id:'mld-natal', sym:'♈', label:'星盤',   angle:-90+240},
      {id:'mld-name',  sym:'文', label:'融合',   angle:-90+300}
    ];
    const R=85;
    const nodeHTML=dims.map(d=>{
      const rad=d.angle*Math.PI/180;
      const x=110+R*Math.cos(rad)-22, y=110+R*Math.sin(rad)-22;
      return `<div class="ld-node" id="${d.id}" style="left:${x}px;top:${y}px"><span class="ld-sym">${d.sym}</span><div class="ld-node-label">${d.label}</div></div>`;
    }).join('');
    const pts=dims.map(d=>{const rad=d.angle*Math.PI/180;return[110+R*Math.cos(rad),110+R*Math.sin(rad)];});
    const lineHTML=[];
    for(let i=0;i<6;i++) for(let j=i+1;j<6;j++){
      lineHTML.push(`<line class="ld-line" id="mld-ln-${i}-${j}" x1="${pts[i][0]}" y1="${pts[i][1]}" x2="${pts[j][0]}" y2="${pts[j][1]}"/>`);
    }
    let particleHTML='';
    for(let k=0;k<20;k++){
      const x=Math.random()*100, dur=2.5+Math.random()*3, delay=Math.random()*3;
      particleHTML+=`<div class="ld-particle" style="left:${x}%;bottom:-5%;--dur:${dur}s;--delay:${delay}s"></div>`;
    }
    
    // 梅花→塔羅：只跑前3維 + 準備塔羅；塔羅→結果：跑全部6維
    const activeDims=isFinalStep?[0,1,2,3,4,5]:[0,1,2]; // 八字/紫微/梅花 已完成，或全部
    const statusTexts=isFinalStep
      ?['校驗八字命盤…','校驗紫微斗數…','鎖定梅花卦象…','鎖定塔羅牌陣…','計算星盤…','整理這次問題的重點…']
      :['八字命盤已就緒','紫微斗數已就緒','梅花卦象已鎖定'];
    const subTexts=isFinalStep
      ?['天干地支 × 十神 × 神煞','命宮十二宮 × 四化飛星','本卦 → 變卦 × 體用關係','十張牌 × 凱爾特十字展開','行星 × 宮位 × 相位','把多方訊號收斂成你看得懂的答案']
      :['四柱排盤完成','十二宮排盤完成','體用關係已確定'];
    const TOTAL_MS=isFinalStep?3200:1800;
    
    overlay.innerHTML=`
      <div class="ld-particles">${particleHTML}</div>
      <div class="ld-pentagram">
        <div class="ld-ring"></div><div class="ld-ring"></div><div class="ld-ring"></div>
        <svg class="ld-lines" viewBox="0 0 220 220">${lineHTML.join('')}</svg>
        ${nodeHTML}
        <div class="ld-center" id="mld-center">☽</div>
        <div class="ld-burst" id="mld-burst"></div>
      </div>
      <div class="ld-status" id="mld-status">${isFinalStep?'正在整理你的問題重點…':'準備塔羅牌陣…'}</div>
      <div class="ld-sub" id="mld-sub"></div>`;
    document.body.appendChild(overlay);
    
    const dimIds=dims.map(d=>d.id);
    const stagger=TOTAL_MS/(activeDims.length+1.5);
    
    activeDims.forEach((dimIdx,i)=>{
      setTimeout(()=>{
        const el=document.getElementById(dimIds[dimIdx]);
        if(el) el.classList.add('computing');
        const st=document.getElementById('mld-status');
        const sb=document.getElementById('mld-sub');
        if(st){st.style.opacity='0';setTimeout(()=>{st.textContent=statusTexts[i]||'';st.style.opacity='1';},150);}
        if(sb){sb.style.opacity='0';setTimeout(()=>{sb.textContent=subTexts[i]||'';sb.style.opacity='1';},150);}
      }, i*stagger);
      
      setTimeout(()=>{
        const el=document.getElementById(dimIds[dimIdx]);
        if(el){el.classList.remove('computing');el.classList.add('done');}
        for(let j=0;j<5;j++){
          if(j===dimIdx) continue;
          const a=Math.min(dimIdx,j),b=Math.max(dimIdx,j);
          const ln=document.getElementById('mld-ln-'+a+'-'+b);
          const otherNode=document.getElementById(dimIds[j]);
          if(ln&&otherNode&&otherNode.classList.contains('done')) ln.classList.add('lit');
        }
      }, i*stagger+stagger*0.65);
    });
    
    // 完成
    setTimeout(()=>{
      document.getElementById('mld-center').classList.add('active');
      const st=document.getElementById('mld-status');
      if(st){st.style.opacity='0';setTimeout(()=>{st.textContent=isFinalStep?'解讀完成':'塔羅牌陣就緒';st.style.opacity='1';},150);}
      document.querySelectorAll('#loading-overlay-manual .ld-line').forEach(l=>l.classList.add('lit'));
    }, TOTAL_MS-350);
    
    setTimeout(()=>{
      const burst=document.getElementById('mld-burst');
      if(burst){burst.classList.add('go');setTimeout(()=>burst.classList.add('fade'),350);}
    }, TOTAL_MS-100);
    
    setTimeout(()=>{
      overlay.style.transition='opacity .45s';
      overlay.style.opacity='0';
      setTimeout(()=>overlay.remove(),450);
      doSwitch();
    }, TOTAL_MS+200);
    
  } else {
    doSwitch();
  }
}
function resetAll(){
  // 保存管理員狀態（避免 reset 後丟失）
  var wasAdmin = S._isAdmin || false;
  // 清空核心資料
  S.bazi=null;S.meihua=null;S.tarot={drawn:[],spread:[]};S.ziwei=null;
  S.natal=null;S.jyotish=null;S.nameResult=null;S.zodiacNameResult=null;
  // 清空 unified engine 資料
  S._uResult=null;S._verdicts=null;S._verdictDir=null;S._arbitration=null;S._lastMeta=null;
  // 清空 tags
  S.baziTags=null;S.ziweiTags=null;S.natalTags=null;S.meihuaTags=null;S.tarotTags=null;S.jyotishTags=null;S.nameTags=null;
  // 清空表單資料中的問題和類型（保留個人資訊供下次使用）
  S.form={};
  // 清空快取
  S._usedCache=false;
  // 恢復管理員狀態（或重新偵測）
  var _nameEl=document.getElementById('f-name');
  var _bdateEl=document.getElementById('f-bdate');
  S._isAdmin = wasAdmin || !!(window._JY_ADMIN_TOKEN);
  // 重置問題和類型欄位（但保留姓名、生日、時辰、性別）
  try{
    var fType=document.getElementById('f-type'); if(fType) fType.value='';
    var fQ=document.getElementById('f-question'); if(fQ){ fQ.value=''; }
    var fChar=document.getElementById('f-char'); if(fChar) fChar.textContent='0';
  }catch(e){}
  // UI 重置
  goStep(0);
  document.getElementById('mh-result').classList.add('hidden');
  document.getElementById('btn-analyze').disabled=true;
  document.getElementById('t-spread-sec').classList.add('hidden');
  drawnCards=[];deckShuffled=[];pickAnimating=false;
  // 清空結果區 DOM（防止殘留）
  try{
    var clearIds=['r-verdict-risk','r-answer','r-answer-full','r-conclusion','r-hook','r-factors','r-suggest','r-question','r-question-hero'];
    clearIds.forEach(function(id){var el=document.getElementById(id);if(el)el.innerHTML='';});
    document.getElementById('r-vprob').textContent='';
    document.getElementById('r-vlabel').textContent='';
  }catch(e){}
  // 重置 hook screen
  try{document.getElementById('hook-screen').style.display='block';document.getElementById('input-screen').style.display='none';}catch(e){}
}
function skipToResult(){goStep(3)}

/* — Char counter — */
document.getElementById('f-question').addEventListener('input',function(){document.getElementById('f-char').textContent=this.value.length});
// 動態 placeholder：根據問題類型切換範例
const PLACEHOLDER_MAP={love:'例：我跟他還有機會復合嗎？/今年會遇到正緣嗎？',career:'例：我今年適合轉職嗎？/該選 A 公司還是 B 公司？',wealth:'例：最近適合投資嗎？/今年有偏財運嗎？',health:'例：我最近身體不太好，要注意什麼？',relationship:'例：跟同事相處不好，該怎麼改善？',family:'例：跟爸媽意見不合，怎麼溝通比較好？'};
document.getElementById('f-type').addEventListener('change',function(){const ph=PLACEHOLDER_MAP[this.value]||'例：我今年適合轉職嗎？';document.getElementById('f-question').placeholder=ph;});


// ── UI constants + form events + submit + cache + loading (lines 714-1049) ──
const Q_PRESETS = {
  love: ['今年有桃花嗎？','他/她喜歡我嗎？','適合復合嗎？','什麼時候能脫單？','我的感情會順利嗎？'],
  career: ['今年適合轉職嗎？','該不該跳槽？','我適合創業嗎？','工作會有升遷機會嗎？','怎麼找到適合的方向？'],
  wealth: ['今年財運如何？','適合投資嗎？','什麼時候財運會好轉？','偏財運好不好？','怎麼改善財務狀況？'],
  health: ['今年健康要注意什麼？','我的體質適合什麼養生？','壓力大怎麼調適？','家人健康會好嗎？','我需要做什麼健康檢查？'],
  relationship: ['人際關係會改善嗎？','適合跟對方合作嗎？','怎麼改善職場人際？','朋友靠得住嗎？','該怎麼拓展人脈？'],
  family: ['跟家人關係會好轉嗎？','親子溝通怎麼改善？','家庭運勢如何？','搬家或換環境適合嗎？','家裡的問題會解決嗎？']
};
const TYPE_LABELS_SHORT = {love:'💕 感情桃花',career:'💼 事業方向',wealth:'💰 財運投資',health:'🏥 健康身心',relationship:'🤝 人際合作',family:'🏠 家庭親子'};
const TYPE_LABEL_TO_TYPE = (function(){const o={};for(const[k,v]of Object.entries(TYPE_LABELS_SHORT))o[v]=k;return o;})();
let selectedPresetQ = '';

function pickType(type){
  document.getElementById('f-type').value = type;
  document.getElementById('hook-screen').style.display = 'none';
  document.getElementById('input-screen').style.display = 'none';
  
  // ── 信任預覽：先給免費價值 ──
  const trustEl = document.getElementById('trust-preview');
  if(trustEl){
    trustEl.style.display = 'block';
    document.getElementById('trust-type-tag').textContent = TYPE_LABELS_SHORT[type] || type;
    
    // 2026丙午年共相 × 問題類型
    const yearInsight = {
      love:'2026 是丙午年，火氣旺盛，感情上容易「一見鍾情」也容易「一觸即發」。如果你最近覺得感情忽冷忽熱、容易吵架、或者遇到讓你心動但拿不準的人——這都是丙午火旺的典型表現。你不是運不好，是能量太躁需要導引。',
      career:'2026 丙午年，火土並旺。很多人會在今年感覺「做很多但看不到成果」、「想跳槽但又不敢」。如果你最近覺得工作壓力大、方向不明、或者有個機會但猶豫不決——這些都是今年的共同考題，不是只有你這樣。',
      wealth:'2026 丙午年，火旺剋金。今年財運的特徵是「進得快、出得也快」——容易有收入但也容易衝動消費或投資失利。如果你最近覺得錢怎麼存都存不住，或者有個投資想出手但不確定——這是年運造成的，不是你能力問題。',
      health:'2026 丙午年，火旺傷金水。今年很多人會出現呼吸系統、皮膚、睡眠方面的問題。如果你最近覺得容易累、睡不好、情緒起伏大——這跟流年火氣太旺有直接關係，需要有意識地補水、補金行能量。',
      relationship:'2026 丙午年，火旺帶煞。今年人際關係的考題是「分辨真心與場面」——火旺容易讓人際互動表面熱絡但缺乏深度。如果你最近覺得朋友多但知心少、或者跟某個人關係突然變僵——不用太擔心，這是流年氣場造成的。',
      family:'2026 丙午年，午火沖子水。今年家庭關係容易出現「表面和平、暗流湧動」的狀況。如果你最近跟家人溝通有障礙、或者為了某件事意見不合——這是年運帶來的考驗，處理得好反而能讓關係更進一步。'
    };
    document.getElementById('trust-text').innerHTML = `
      <p style="color:var(--c-gold);font-weight:600;margin-bottom:.5rem">🔮 今年大環境給你的訊號：</p>
      <p>${yearInsight[type]||yearInsight.career}</p>
      <p style="margin-top:.5rem;color:var(--c-text-dim);font-size:.9rem">以上是所有人的「共相」。但每個人的八字不同，受的影響也不同——有人是吉、有人是凶。<strong style="color:var(--c-gold)">只有結合你的出生時間，才能算出你的「個相」。</strong></p>
    `;
  } else {
    // fallback: 沒有trust-preview就直接進input
    showInputAfterTrust();
  }

  // 預渲染問題選擇
  const presets = Q_PRESETS[type] || [];
  const grid = document.getElementById('q-presets');
  selectedPresetQ = '';
  grid.innerHTML = presets.map(q => `<button class="q-preset-btn" onclick="selectPreset(this,'${q.replace(/'/g,"\\'")}')">${q}</button>`).join('') +
    `<button class="q-preset-btn" onclick="showCustomQ(this)" style="color:var(--c-text-muted)"><i class="fas fa-pen" style="margin-right:4px"></i> 我想自己寫問題</button>`;
  document.getElementById('q-custom-wrap').style.display = 'none';
  window.scrollTo({top:0,behavior:'smooth'});
}

function showInputAfterTrust(){
  var tp=document.getElementById('trust-preview');
  if(tp) tp.style.display='none';
  document.getElementById('input-screen').style.display = 'block';
  window.scrollTo({top:0,behavior:'smooth'});
}

function backToHook(){
  document.getElementById('input-screen').style.display = 'none';
  var tp=document.getElementById('trust-preview');
  if(tp) tp.style.display='none';
  document.getElementById('hook-screen').style.display = 'block';
  document.getElementById('f-type').value = '';
}

function selectPreset(btn, q){
  document.querySelectorAll('.q-preset-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  selectedPresetQ = q;
  document.getElementById('f-question').value = q;
  document.getElementById('q-custom-wrap').style.display = 'none';
}

function showCustomQ(btn){
  document.querySelectorAll('.q-preset-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  selectedPresetQ = '';
  document.getElementById('q-custom-wrap').style.display = 'block';
  document.getElementById('f-question').value = '';
  document.getElementById('f-question').focus();
}

function submitStep0(){
  let type = (document.getElementById('f-type') && document.getElementById('f-type').value) || '';
  if (!type) {
    var tagEl = document.getElementById('chosen-type-tag');
    if (tagEl && tagEl.textContent && TYPE_LABEL_TO_TYPE[tagEl.textContent.trim()]) {
      type = TYPE_LABEL_TO_TYPE[tagEl.textContent.trim()];
      if (document.getElementById('f-type')) document.getElementById('f-type').value = type;
    }
  }
  var question = (document.getElementById('f-question') && document.getElementById('f-question').value) ? document.getElementById('f-question').value.trim() : '';
  if (!question && typeof selectedPresetQ === 'string') question = selectedPresetQ.trim();
  const gender=document.querySelector('input[name="gender"]:checked');
  const bdate=document.getElementById('f-bdate') ? document.getElementById('f-bdate').value : '';
  if(!type||!question||!gender||!bdate){ alert('請填寫所有必要欄位（方向、問題、性別、出生日期）'); return; }
  const btime=(document.getElementById('f-btime')&&document.getElementById('f-btime').value)||'12:00';
  const name=document.getElementById('f-name')?document.getElementById('f-name').value.trim():'';
  S.form={type,question,gender:gender.value,bdate,btime,name};
  S._autoMode = false; // 手動模式：使用者自己操作梅花/塔羅
  // 管理員判定（僅透過 URL token 認證，不在前端暴露判斷條件）
  S._isAdmin = !!(window._JY_ADMIN_TOKEN);
  try {
    const[y,m,d]=bdate.split('-').map(Number);
    const[hh,mm]=btime.split(':').map(Number);
    S.bazi=computeBazi(y,m,d,hh,mm,gender.value);
    try { if(S.bazi && typeof enhanceBazi==='function') enhanceBazi(S.bazi); } catch(e) { console.error('enhanceBazi:', e); }
    S.ziwei=computeZiwei(y,m,d,hh,gender.value);
    mergeZiweiIntoBazi(); // 紫微整合進八字大運流年
    try { S.natal = computeNatalChart(y, m, d, hh, mm); } catch(e) { console.error('Natal(manual):', e); S.natal=null; }
    try { if(S.natal && typeof enhanceNatalChart==='function') enhanceNatalChart(S.natal, y, m, d, hh, mm); } catch(e) { console.error('enhanceNatal:', e); }
    try { S.jyotish = S.natal ? computeJyotish(S.natal, y, m, d, hh, mm) : null; } catch(e) { console.error('Jyotish:', e); S.jyotish=null; }
    try { if(S.jyotish && typeof enhanceJyotish==='function') enhanceJyotish(S.jyotish); } catch(e) { console.error('enhanceJy1:', e); }
    try { if(S.jyotish && typeof enhanceJyotish2==='function') enhanceJyotish2(S.jyotish, new Date(y, m-1, d)); } catch(e) { console.error('enhanceJy2:', e); }
    if (typeof renderDailyFortune==='function') renderDailyFortune();
    if (typeof generateLuckyInfo==='function') generateLuckyInfo();
    if (typeof renderJyotishFunZone==='function') try{renderJyotishFunZone();}catch(e){}
    if (typeof renderNameFunZone==='function') try{renderNameFunZone();}catch(e){}
    goStep(1);
  } catch(e) {
    console.error('submitStep0', e);
    alert('資料處理時發生錯誤，請確認出生日期與時間格式正確。');
  }
}

/* ══ 占卜結果快取：同人+同類型 24 小時內鎖定梅花/塔羅結果 ══ */
const DIVINE_CACHE_KEY = 'jy_divine_cache';
// 改為以日期為單位：取今日結束時間（午夜）作為過期判斷
function isCacheSameDay(ts){
  const cached = new Date(ts);
  const now = new Date();
  return cached.getFullYear()===now.getFullYear() && cached.getMonth()===now.getMonth() && cached.getDate()===now.getDate();
}

/* ═══ Seeded PRNG (mulberry32) — 同人同天同問=同結果 ═══ */
function hashStr(s){let h=0;for(let i=0;i<s.length;i++){h=((h<<5)-h)+s.charCodeAt(i);h|=0;}return h>>>0;}
function mulberry32(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function makeSeededRng(bdate,gender,type,question){
  const today=new Date();const dayKey=today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
  const qNorm=(question||'').replace(/[\s?？！!。，,.]/g,'').substring(0,20);
  const seed=hashStr(bdate+'|'+gender+'|'+type+'|'+qNorm+'|'+dayKey);
  return mulberry32(seed);
}
function seededShuffle(arr,rng){
  const a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;
}

function getDivineCacheKey(bdate, gender, type, question) {
  // 同人+同類型+同問題文字 才鎖定
  const qNorm = (question||'').replace(/[\s?？！!。，,.]/g,'').substring(0,20);
  return bdate + '|' + gender + '|' + type + '|' + qNorm;
}

function loadDivineCache(bdate, gender, type, question) {
  try {
    const raw = localStorage.getItem(DIVINE_CACHE_KEY);
    if (!raw) { console.log('[Cache] 無快取資料'); return null; }
    const cache = JSON.parse(raw);
    const key = getDivineCacheKey(bdate, gender, type, question);
    const entry = cache[key];
    if (!entry) { console.log('[Cache] Key不符:',key,'現有keys:',Object.keys(cache).join(',')); return null; }
    if (!isCacheSameDay(entry.ts)) {
      console.log('[Cache] 非同日，清除（日期過期）');
      delete cache[key];
      localStorage.setItem(DIVINE_CACHE_KEY, JSON.stringify(cache));
      return null;
    }
    console.log('[Cache] ✅ 命中快取:',key);
    return entry;
  } catch(e) { console.error('[Cache] 讀取錯誤:',e); return null; }
}

function saveDivineCache(bdate, gender, type, meihua, tarotDrawn, question) {
  try {
    let cache = {};
    try { cache = JSON.parse(localStorage.getItem(DIVINE_CACHE_KEY)) || {}; } catch(e){}
    const key = getDivineCacheKey(bdate, gender, type, question);
    cache[key] = { ts: Date.now(), meihua, tarotDrawn };
    const now = Date.now();
    for (const k of Object.keys(cache)) {
      if (!isCacheSameDay(cache[k].ts)) delete cache[k];
    }
    localStorage.setItem(DIVINE_CACHE_KEY, JSON.stringify(cache));
    console.log('[Cache] ✅ 已儲存:',key);
  } catch(e) { console.error('[Cache] 儲存錯誤:',e); }
}

function submitStep0Fast(){
  drawnCards=[];
  S.meihua=null;S.tarot={drawn:[],spread:[]};
  const type=document.getElementById('f-type').value;
  const question=document.getElementById('f-question').value.trim();
  const gender=document.querySelector('input[name="gender"]:checked');
  const bdate=document.getElementById('f-bdate').value;
  if(!type||!question||!gender||!bdate){alert('請填寫：問題、性別、出生日期');return}
  const btime=document.getElementById('f-btime').value||'12:00';
  const name=document.getElementById('f-name').value.trim();
  S.form={type,question,gender:gender.value,bdate,btime,name};
  S._autoMode = true; // ★ 自動模式標記：梅花時間起卦 + 塔羅種子抽牌
  const overlay = document.createElement('div');
  overlay.className = 'loading-overlay';
  overlay.id = 'loading-overlay';
  // 六維度節點位置（六芒星分佈）
  const dims = [
    {id:'ld-bazi',  sym:'☰', label:'八字',   angle:-90},
    {id:'ld-ziwei', sym:'☆', label:'紫微',   angle:-90+60},
    {id:'ld-meihua',sym:'☯', label:'梅花',   angle:-90+120},
    {id:'ld-tarot', sym:'✦', label:'塔羅',   angle:-90+180},
    {id:'ld-natal', sym:'♈', label:'星盤',   angle:-90+240},
    {id:'ld-name',  sym:'文', label:'融合',   angle:-90+300}
  ];
  const R=85; // 節點距中心距離
  const nodeHTML=dims.map(d=>{
    const rad=d.angle*Math.PI/180;
    const x=110+R*Math.cos(rad)-22, y=110+R*Math.sin(rad)-22;
    return `<div class="ld-node" id="${d.id}" style="left:${x}px;top:${y}px"><span class="ld-sym">${d.sym}</span><div class="ld-node-label">${d.label}</div></div>`;
  }).join('');
  // SVG 連線（六芒星）
  const pts=dims.map(d=>{const rad=d.angle*Math.PI/180;return[110+R*Math.cos(rad),110+R*Math.sin(rad)];});
  const lineHTML=[];
  for(let i=0;i<6;i++) for(let j=i+1;j<6;j++){
    lineHTML.push(`<line class="ld-line" id="ld-ln-${i}-${j}" x1="${pts[i][0]}" y1="${pts[i][1]}" x2="${pts[j][0]}" y2="${pts[j][1]}"/>`);
  }
  // 粒子
  let particleHTML='';
  for(let i=0;i<25;i++){
    const x=Math.random()*100, dur=3+Math.random()*4, delay=Math.random()*5;
    particleHTML+=`<div class="ld-particle" style="left:${x}%;bottom:-5%;--dur:${dur}s;--delay:${delay}s"></div>`;
  }
  overlay.innerHTML=`
    <div class="ld-particles">${particleHTML}</div>
    <div class="ld-pentagram">
      <div class="ld-ring"></div><div class="ld-ring"></div><div class="ld-ring"></div>
      <svg class="ld-lines" viewBox="0 0 220 220">${lineHTML.join('')}</svg>
      ${nodeHTML}
      <div class="ld-center" id="ld-center">☽</div>
      <div class="ld-burst" id="ld-burst"></div>
    </div>
    <div class="ld-status" id="ld-status">正在為你深度解讀命盤…</div>
    <div class="ld-sub" id="ld-sub"></div>`;
  document.body.appendChild(overlay);

  const [y,m,d]=bdate.split('-').map(Number);
  const [hh,mm]=btime.split(':').map(Number);

  const cached = loadDivineCache(bdate, gender.value, type, question);
  // 管理員帳號不受能量鎖定限制（可重複測試）
  // 管理員判定（僅透過 URL token 認證）
  const _isAdmin = !!(window._JY_ADMIN_TOKEN);
  S._isAdmin = _isAdmin;  // 全域存取（跳過回饋寄信等）
  S._usedCache = _isAdmin ? false : !!cached;

  // 計算函數
  const fns = [
    ()=>{ S.bazi=computeBazi(y,m,d,hh,mm,gender.value); try{if(S.bazi&&typeof enhanceBazi==='function')enhanceBazi(S.bazi);}catch(e){} },
    ()=>{ S.ziwei=computeZiwei(y,m,d,hh,gender.value); mergeZiweiIntoBazi(); renderDailyFortune(); generateLuckyInfo(); if(typeof renderZiweiFunZone==='function') try{renderZiweiFunZone();}catch(e){} if(typeof renderJyotishFunZone==='function') try{renderJyotishFunZone();}catch(e){} if(typeof renderNameFunZone==='function') try{renderNameFunZone();}catch(e){} if(typeof renderNatalFunZone==='function') try{renderNatalFunZone();}catch(e){} },
    ()=>{
      // ★ 自動模式：時間起卦（正統梅花時間法）
      try {
        const now = new Date();
        const ny=now.getFullYear(), nmo=now.getMonth()+1, nd=now.getDate();
        const nh=now.getHours(), nmi=now.getMinutes();
        let lunarY=ny, lunarM=nmo, lunarD=nd;
        try {
          if(typeof Lunar!=='undefined' && Lunar.Solar){
            const solar=Lunar.Solar.fromYmd(ny,nmo,nd);
            const lunar=solar.getLunar();
            lunarY=lunar.getYear(); lunarM=lunar.getMonth(); lunarD=lunar.getDay();
          }
        } catch(e){ console.warn('[AutoMH] 農曆轉換失敗，使用西曆:', e); }
        const yzhi=((lunarY-4)%12+12)%12+1;
        const shichen=Math.floor(((nh+1)%24)/2)+1;
        const upNum=(yzhi+lunarM+lunarD)%8||8;
        const loNum=(yzhi+lunarM+lunarD+shichen)%8||8;
        const dongNum=(yzhi+lunarM+lunarD+shichen)%6||6;
        const mhResult = calcMH(upNum, loNum, dongNum);
        S.meihua = mhResult;
        // calcMH 內部用 'general'，這裡用實際問題類型重跑 output layer
        try { if(typeof buildMeihuaOutput==='function') buildMeihuaOutput(S.meihua, S.form.type||'general'); } catch(e){}
        try { if(typeof enhanceMeihua==='function') enhanceMeihua(S.meihua); } catch(e){ console.warn('[AutoMH] enhanceMeihua:', e); }
        console.log('[AutoMode] 梅花時間起卦完成:', S.meihua.ben.m);
      } catch(e) {
        console.error('[AutoMode] 梅花起卦失敗:', e);
        S.meihua = null;
      }
    },
    ()=>{
      // ★ 自動模式：種子洗牌 + 根據牌陣張數抽牌
      try {
        // 偵測牌陣
        var _spreadId = 'celtic_cross';
        if (typeof detectSpreadType === 'function' && typeof setCurrentSpread === 'function') {
          _spreadId = detectSpreadType(S.form.question || '', S.form.type || 'general');
          setCurrentSpread(_spreadId);
        }
        var _spreadDef = (typeof getCurrentSpreadDef === 'function') ? getCurrentSpreadDef() : null;
        var _count = _spreadDef ? _spreadDef.count : 10;

        const _rng = makeSeededRng(S.form.bdate, S.form.gender, S.form.type, S.form.question);
        const shuffled = seededShuffle(TAROT, _rng);
        const autoDrawn = [];
        for(let i=0; i<_count; i++){
          const card = shuffled[i];
          // 用同一 seed 決定正逆位（金色黎明傳統：接近 50%）
          const _r2 = makeSeededRng(S.form.bdate, S.form.gender, S.form.type, S.form.question);
          for(let _k=0; _k<=card.id; _k++) _r2();
          const isUp = _r2() > 0.48; // #6 修正：逆位約48%，接近金色黎明傳統
          var _posName = '';
          if (_spreadDef && _spreadDef.positions && _spreadDef.positions[i]) {
            _posName = _spreadDef.positions[i].name;
          } else if (typeof CELTIC_POS !== 'undefined') {
            _posName = CELTIC_POS[i] || '';
          }
          autoDrawn.push({...card, isUp, pos: _posName});
        }
        drawnCards = autoDrawn;
        S.tarot = {drawn: autoDrawn, spread: autoDrawn, spreadType: _spreadId, spreadDef: _spreadDef};
        try { if(typeof enhanceTarot==='function') enhanceTarot(S.tarot); } catch(e){ console.warn('[AutoTarot] enhanceTarot:', e); }
        console.log('[AutoMode] 牌陣:'+_spreadId+'('+_count+'張) 抽牌:', autoDrawn.map(c=>c.n+(c.isUp?'正':'逆')).join(', '));
      } catch(e) {
        console.error('[AutoMode] 塔羅抽牌失敗:', e);
        drawnCards = [];
        S.tarot = {drawn:[], spread:[]};
      }
    },
    ()=>{
      // 西洋星盤計算
      try { S.natal = computeNatalChart(y, m, d, hh, mm); } catch(e) { 
        console.error('Natal chart error:', e); 
        S.natal = null;
        setTimeout(()=>{
          const el=document.getElementById('d-natal-summary');
          if(el) el.innerHTML='<p style="color:#f87171">星盤計算錯誤：'+e.message+'</p>';
        },500);
      }
      try { if(S.natal && typeof enhanceNatalChart==='function') enhanceNatalChart(S.natal, y, m, d, hh, mm); } catch(e) { console.error('enhanceNatal:', e); }
      try { S.jyotish = S.natal ? computeJyotish(S.natal, y, m, d, hh, mm) : null; } catch(e) { console.error('Jyotish:', e); S.jyotish=null; }
      try { if(S.jyotish && typeof enhanceJyotish==='function') enhanceJyotish(S.jyotish); } catch(e) { console.error('enhanceJy1:', e); }
      try { if(S.jyotish && typeof enhanceJyotish2==='function') enhanceJyotish2(S.jyotish, new Date(y, m-1, d)); } catch(e) { console.error('enhanceJy2:', e); }
    },
    ()=>{
      // 姓名學（此步驟用於觸發最終融合，實際渲染在 runAnalysisV2）
    }
  ];

  const statusTexts=['排八字四柱命盤…','排紫微斗數命盤…','梅花易數時間起卦…','塔羅牌自動抽牌…','西洋占星星盤…','吠陀占星計算…','七維融合分析…'];
  const subTexts=['出生資料 × 個性與事件力量','人生12個領域 × 4種關鍵能量','當下時間 × 卦象捕捉問題本質','種子洗牌 × 凱爾特十字牌陣','行星 × 生活領域 × 彼此互動','八字 × 紫微 × 梅花 × 塔羅 × 星盤 × 吠陀 × 姓名'];
  const dimIds=['ld-bazi','ld-ziwei','ld-meihua','ld-tarot','ld-natal','ld-name'];
  const TOTAL_MS=3600;

  // 依序啟動每個維度
  const stagger=TOTAL_MS/6.5;
  dimIds.forEach((id,i)=>{
    // 開始運算
    setTimeout(()=>{
      const el=document.getElementById(id);
      if(el) el.classList.add('computing');
      const st=document.getElementById('ld-status');
      const sb=document.getElementById('ld-sub');
      if(st){st.style.opacity='0';setTimeout(()=>{st.textContent=statusTexts[i];st.style.opacity='1';},200);}
      if(sb){sb.style.opacity='0';setTimeout(()=>{sb.textContent=subTexts[i];sb.style.opacity='1';},200);}
    }, i*stagger);
    // 完成運算
    setTimeout(()=>{
      try { fns[i](); } catch(e) { console.error('fn['+i+'] error:', e); }
      const el=document.getElementById(id);
      if(el){el.classList.remove('computing');el.classList.add('done');}
      // 點亮連到此節點的線
      for(let j=0;j<5;j++){
        if(j===i) continue;
        const a=Math.min(i,j),b=Math.max(i,j);
        const ln=document.getElementById('ld-ln-'+a+'-'+b);
        const otherNode=document.getElementById(dimIds[j]);
        if(ln&&otherNode&&otherNode.classList.contains('done')) ln.classList.add('lit');
      }
    }, i*stagger+stagger*0.7);
  });

  // 全部完成 → 爆發 → 跳轉
  setTimeout(()=>{
    document.getElementById('ld-center').classList.add('active');
    const st=document.getElementById('ld-status');
    if(st){st.style.opacity='0';setTimeout(()=>{st.textContent='解讀完成';st.style.opacity='1';},200);}
    const sb=document.getElementById('ld-sub');
    if(sb) sb.textContent='';
    // 所有線全亮
    document.querySelectorAll('.ld-line').forEach(l=>l.classList.add('lit'));
  }, TOTAL_MS-400);

  setTimeout(()=>{
    const burst=document.getElementById('ld-burst');
    if(burst){burst.classList.add('go');setTimeout(()=>burst.classList.add('fade'),400);}
  }, TOTAL_MS-100);

  setTimeout(()=>{
    const ol=document.getElementById('loading-overlay');
    if(ol){ol.style.transition='opacity .5s';ol.style.opacity='0';setTimeout(()=>ol.remove(),500);}
    goStep(3);
  }, TOTAL_MS+300);
}



// ── Diagnostic + feedback + notification (lines 35271-35577) ──
function generateDiagnosticPack(){
  const b=S.bazi, mh=S.meihua, tr=S.tarot, zw=S.ziwei;
  const V=S._verdicts||[];
  const q=S.form?S.form.question:'';
  const type=S.form?S.form.type:'';
  let pack=[];

  pack.push('═══ 靜月之光 診斷包 ═══');
  pack.push('時間：'+new Date().toLocaleString('zh-TW'));
  pack.push('問題：'+q);
  pack.push('類型：'+({'love':'感情','career':'事業','wealth':'財運','health':'健康','general':'綜合','relationship':'人際','family':'家庭'}[type]||type));
  pack.push('');

  // 八字
  if(b){
    const dy=b.dayun?b.dayun.find(d=>d.isCurrent):null;
    const ln=dy&&dy.liuNian?dy.liuNian.find(l=>l.year===new Date().getFullYear()):null;
    pack.push('─── 八字 ───');
    pack.push('日主：'+b.dm+' / '+b.dmEl+'行 / 身'+(b.strong?'強':'弱'));
    pack.push('喜用：'+(b.fav||[]).join('、')+' / 忌：'+(b.unfav||[]).join('、'));
    if(dy) pack.push('大運：'+dy.gz+'（'+dy.level+'）');
    if(ln) pack.push('流年：'+ln.gz+'（'+ln.level+'）'+(ln.events&&ln.events.length?' '+ln.events[0]:''));
    if(b.shensha) pack.push('神煞：'+b.shensha.join('、'));
  }

  // 紫微
  if(zw){
    pack.push('');
    pack.push('─── 紫微 ───');
    const ming=zw.palaces&&zw.palaces[0]?zw.palaces[0].stars.filter(s=>s.type==='major'):[];
    if(ming.length) pack.push('命宮：'+ming.map(s=>s.name+(s.bright?'('+s.bright+')':'')+(s.hua?' '+s.hua:'')).join('、'));
    const gI={love:2,career:8,wealth:4,health:5,family:9,relationship:7}[type];
    if(gI!==undefined&&zw.palaces&&zw.palaces[gI]){
      const gN=['命宮','兄弟','夫妻','子女','財帛','疾厄','遷移','交友','官祿','田宅','福德','父母'][gI]||'';
      const gs=zw.palaces[gI].stars||[];
      pack.push(gN+'：'+gs.slice(0,6).map(s=>s.name+(s.bright?'('+s.bright+')':'')+(s.hua?' '+s.hua:'')).join('、'));
    }
    const dx=zw.daXian?zw.daXian.find(d=>d.isCurrent):null;
    if(dx) pack.push('大限：'+dx.palaceName+'（'+dx.level+'）'+(dx.theme?' 主題:'+dx.theme:''));
    if(zw.getLiuNianZw){
      try{
        const lnzw=zw.getLiuNianZw(new Date().getFullYear());
        if(lnzw) pack.push('流年：命宮走'+lnzw.mingPalace+(lnzw.focus?' 重點:'+lnzw.focus:''));
      }catch(e){}
    }
  }

  // 梅花
  if(mh){
    pack.push('');
    pack.push('─── 梅花 ───');
    pack.push('本卦：'+mh.ben.n+' → 變卦：'+mh.bian.n);
    pack.push('體用：'+mh.ty.r+'（'+mh.ty.f+'）');
    if(mh.hu) pack.push('互卦：'+mh.hu.n);
    pack.push('動爻：第'+mh.dong+'爻');
  }

  // 塔羅
  if(tr&&tr.drawn&&tr.drawn.length>=10){
    pack.push('');
    pack.push('─── 塔羅（凱爾特十字）───');
    const pos=['核心','阻礙','過去','未來','結果','近期','自身','環境','希望恐懼','最終'];
    tr.drawn.slice(0,10).forEach((c,i)=>{
      pack.push(pos[i]+'：'+c.n+(c.isUp?' 正':' 逆'));
    });
  }

  // 星盤
  if(S.natal){
    pack.push('');
    pack.push('─── 西洋星盤 ───');
    pack.push(S.natal.summary);
    pack.push('ASC '+S.natal.ascSign.name+Math.floor(S.natal.ascSign.deg)+'° MC '+S.natal.mcSign.name+Math.floor(S.natal.mcSign.deg)+'°');
    const np=S.natal.planets;
    ['太陽','月亮','水星','金星','火星','木星','土星'].forEach(function(n){
      if(np[n]) pack.push(n+'：'+np[n].sign+Math.floor(np[n].signDeg)+'° '+np[n].house+'宮');
    });
    const gA=S.natal.aspects.filter(function(a){return a.good}).length;
    const bA=S.natal.aspects.filter(function(a){return !a.good}).length;
    pack.push('相位：吉'+gA+' 凶'+bA);
  }

  // 維度判斷（unified engine）
  if(S._uResult && S._uResult.comb){
    pack.push('');
    pack.push('─── Unified Engine ───');
    pack.push('finalDir：'+S._uResult.comb.finalDir);
    pack.push('rawStrength：'+Math.round(S._uResult.comb.rawStrength*100)/100);
    pack.push('finalProb：'+Math.round(S._uResult.finalProb*100)/100+'%');
    if(S._uResult.comb.topTags && S._uResult.comb.topTags.length){
      pack.push('topTags：'+S._uResult.comb.topTags.map(function(t){return t.label+'('+t.direction+',w'+t.weight+',sys:'+t.systems.join('+')+')';}).join(' | '));
    }
    if(S._uResult.comb.conflicts && S._uResult.comb.conflicts.length){
      pack.push('衝突：'+S._uResult.comb.conflicts.map(function(c){return c.posTag+' vs '+c.negTag+' → '+c.resolved;}).join(' | '));
    }
  }
  if(V.length){
    pack.push('');
    pack.push('─── 維度判斷（legacy）───');
    V.forEach(v=>{
      pack.push(v.dim+'：'+v.dir+' → '+v.verdict);
    });
  }
  pack.push('整體：'+(S._verdictDir||'mid'));

  // 系統輸出
  pack.push('');
  pack.push('─── 系統輸出 ───');
  const hookEl=document.getElementById('r-hook');
  if(hookEl) pack.push('Hook：'+hookEl.textContent.substring(0,200));
  const narrEl=document.querySelector('#r-conclusion')?.closest('.card')?.querySelector('p:nth-child(2)');
  // Try to get narrative text
  const allP=document.querySelectorAll('#step-3 p');
  let narrativeText='';
  allP.forEach(p=>{
    const t=p.textContent;
    if(t.length>50&&!t.includes('八字')&&!t.includes('紫微')&&!t.includes('梅花')&&!narrativeText){
      narrativeText=t.substring(0,200);
    }
  });
  if(narrativeText) pack.push('Narrative：'+narrativeText);

  // 水晶
  const crystalEl=document.querySelector('[id*="crystal"]')||document.querySelector('.crystal-name');
  if(crystalEl) pack.push('水晶推薦：'+crystalEl.textContent);

  return pack.join('\n');
}

// ── 複製診斷包 ──
function copyDiagnosticPack(){
  const pack=generateDiagnosticPack();
  if(navigator.clipboard){
    navigator.clipboard.writeText(pack).then(()=>{
      const btn=event.target;
      btn.textContent='✅ 已複製！';
      setTimeout(()=>{btn.textContent='📋 複製診斷包（開發用）';},2000);
    });
  } else {
    // fallback
    const ta=document.createElement('textarea');
    ta.value=pack;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    alert('已複製到剪貼簿！');
  }
}

// ── 評分按鈕 ──
let _fbRating='';
function submitFeedback(rating){
  _fbRating=rating;
  const goodBtn=document.getElementById('fb-good');
  const badBtn=document.getElementById('fb-bad');
  if(rating==='good'){
    goodBtn.style.border='2px solid #22c55e';
    goodBtn.style.background='rgba(34,197,94,0.15)';
    badBtn.style.opacity='0.3';
    badBtn.style.pointerEvents='none';
    _sendFeedbackToForms(rating,[],'');
    document.getElementById('fb-reason-box').style.display='none';
    document.getElementById('fb-thanks').style.display='block';
  } else {
    badBtn.style.border='2px solid #ef4444';
    badBtn.style.background='rgba(239,68,68,0.15)';
    goodBtn.style.opacity='0.3';
    goodBtn.style.pointerEvents='none';
    document.getElementById('fb-reason-box').style.display='block';
  }
}

// ── 送出不準原因 ──
function submitFeedbackDetail(){
  const checks=document.querySelectorAll('#fb-reasons input:checked');
  const reasons=Array.from(checks).map(c=>c.value);
  const comment=document.getElementById('fb-comment').value||'';
  _sendFeedbackToForms('bad',reasons,comment);
  document.getElementById('fb-reason-box').style.display='none';
  document.getElementById('fb-thanks').style.display='block';
}

// ═══ 結果頁到達通知（非管理員 → 寄信給站長）═══
// 內容：問題類型、問題內容、離線解答、基本資料
function _reportAnalysisResult(question, type, prob){
  if(S._isAdmin) { console.log('[管理員] 跳過結果頁通知'); return; }
  
  var FORM_URL='https://docs.google.com/forms/d/e/1FAIpQLScy7dai3NRsoEcHnQbbPmu_tdO7-M1o47BQYhFRnrcOKgQkEw/formResponse';
  
  try {
    var name = S.form ? (S.form.name||'匿名') : '匿名';
    var bdate = S.form ? (S.form.bdate||'') : '';
    var btime = S.form ? (S.form.btime||'') : '';
    var gender = S.form ? (S.form.gender==='male'?'男':'女') : '';
    var typeLabel = {'love':'感情','career':'事業','wealth':'財運','health':'健康','relationship':'人際','family':'家庭','general':'整體'}[type] || type;
    
    // 取離線解答文字（r-answer 的純文字內容）
    var answerEl = document.getElementById('r-answer');
    var answerText = answerEl ? answerEl.innerText.substring(0, 800) : '(無)';
    
    // 組裝通知內容
    var summary = '';
    summary += '📊 結果頁到達通知\n';
    summary += '時間：' + new Date().toLocaleString('zh-TW') + '\n';
    summary += '─────────────\n';
    summary += '👤 ' + name + ' | ' + bdate + ' ' + btime + ' | ' + gender + '\n';
    summary += '📌 類型：' + typeLabel + '\n';
    summary += '❓ 問題：' + (question||'(空)') + '\n';
    summary += '📊 綜合分數：' + (prob||0) + '%\n';
    summary += '─────────────\n';
    summary += '💬 離線解答：\n' + answerText + '\n';
    
    var fd = new FormData();
    fd.append('entry.58291651', '📊 結果頁[' + typeLabel + ']');
    fd.append('entry.594815381', question||'(空)');
    fd.append('entry.992906923', typeLabel);
    fd.append('entry.1912010772', name + ' | ' + bdate + ' ' + btime + ' | ' + gender);
    fd.append('entry.954354158', '分數:'+prob+'% | 解答:'+answerText.substring(0,200));
    fd.append('entry.619318702', summary);
    fetch(FORM_URL, {method:'POST', mode:'no-cors', body:fd})
      .then(function(){ console.log('[通知] 結果頁已回報'); })
      .catch(function(e){ console.warn('[通知] 回報失敗:', e); });
  } catch(e) {
    console.warn('[通知] error:', e);
  }
}

// ── Google Forms 靜默提交 ──
function _sendFeedbackToForms(rating,reasons,comment){
  // 管理員不送出 Google Forms（不寄信）
  if(S._isAdmin){
    console.log('[管理員] 跳過回饋寄信，rating='+rating);
    return;
  }
  const FORM_URL='https://docs.google.com/forms/d/e/1FAIpQLScy7dai3NRsoEcHnQbbPmu_tdO7-M1o47BQYhFRnrcOKgQkEw/formResponse';
  
  const q=S.form?S.form.question:'';
  const type=S.form?S.form.type:'';
  const pack=generateDiagnosticPack();
  const reasonStr=Array.isArray(reasons)?reasons.join('、'):(reasons||'');

  // 永遠存一份到 localStorage（備份）
  try{
    const stored=JSON.parse(localStorage.getItem('jy_feedback')||'[]');
    stored.push({ts:new Date().toISOString(),rating,question:q,type,reasons:reasonStr,comment,pack});
    if(stored.length>100) stored.splice(0,stored.length-100);
    localStorage.setItem('jy_feedback',JSON.stringify(stored));
  }catch(e){}

  // Google Forms 提交
  try{
    const fd=new FormData();
    fd.append('entry.58291651', rating||'unknown');
    fd.append('entry.594815381', q||'(空)');
    fd.append('entry.992906923', type||'(空)');
    fd.append('entry.1912010772', reasonStr||'(無)');
    fd.append('entry.954354158', comment||'(無)');
    fd.append('entry.619318702', pack||'(無資料)');
    fetch(FORM_URL,{method:'POST',mode:'no-cors',body:fd})
      .then(()=>console.log('[回饋] 已送出到 Google Forms'))
      .catch(e=>console.error('[回饋] 送出失敗:',e));
  }catch(e){
    console.error('Feedback submit error:',e);
  }
}

// ── 結果頁顯示時自動顯示回饋區 ──
function showFeedbackSection(){
  // 回饋區已移除
  return;
  const fb=document.getElementById('feedback-section');
  if(fb) fb.style.display='block';
  // 重置狀態
  document.getElementById('fb-good').style.opacity='1';
  document.getElementById('fb-good').style.pointerEvents='auto';
  document.getElementById('fb-good').style.border='2px solid rgba(255,255,255,0.1)';
  document.getElementById('fb-good').style.background='none';
  document.getElementById('fb-bad').style.opacity='1';
  document.getElementById('fb-bad').style.pointerEvents='auto';
  document.getElementById('fb-bad').style.border='2px solid rgba(255,255,255,0.1)';
  document.getElementById('fb-bad').style.background='none';
  document.getElementById('fb-reason-box').style.display='none';
  document.getElementById('fb-thanks').style.display='none';
  document.getElementById('fb-diag-wrap').style.display='none';
}

// 連點感謝文字3次 → 顯示診斷包按鈕（開發者用）
(function(){
  let tapCount=0,tapTimer=null;
  document.addEventListener('click',function(e){
    if(e.target.closest('#fb-thanks')){
      tapCount++;
      clearTimeout(tapTimer);
      tapTimer=setTimeout(()=>{tapCount=0;},1000);
      if(tapCount>=3){
        tapCount=0;
        const wrap=document.getElementById('fb-diag-wrap');
        if(wrap) wrap.style.display='block';
      }
    }
  });
})();

/* =============================================================
   Patch renderProductCrystal to include urgency + social proof
   ============================================================= */

// ── Daily fortune + calendar + chakra + aura + achievements + quiz + reviews + admin (lines 35578-38748) ──
const _origRPC2 = renderProductCrystal;
renderProductCrystal = function(bazi, type){
  _origRPC2(bazi, type);
};

/* =============================================================
   Patch conclusion to use AI style
   ============================================================= */
const _origGenConclusion = generateConclusion;
generateConclusion = function(type, prob, bazi, mh, tarot){
  return generateAIConclusion(type, prob, bazi, mh, tarot);
};

/* =============================================================
   Init on DOMContentLoaded
   ============================================================= */
document.addEventListener('DOMContentLoaded', function(){
  // Show PWA banner after 5 seconds for iOS
  setTimeout(function(){
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if(!isStandalone) showPWABanner();
  }, 5000);
});
/* =============================================================
   FEATURE 1: 每日運勢籤（依命主八字 × 當日天干地支）
   ============================================================= */

/* 計算當日天干地支 */
function getTodayGanZhi(){
  const today = new Date();
  const y = today.getFullYear(), m = today.getMonth()+1, d = today.getDate();
  const base = Date.UTC(1900, 0, 1);
  const tgt = Date.UTC(y, m-1, d);
  const diff = Math.floor((tgt - base) / 864e5);
  const dayCycle = ((diff + 10) % 60 + 60) % 60;
  const dGi = dayCycle % 10, dZi = dayCycle % 12;
  // 年干支
  let ly = y;
  if(m < 2 || (m === 2 && d < 4)) ly--;
  const yGi = ((ly-4)%10+10)%10, yZi = ((ly-4)%12+12)%12;
  return {
    dayGan: TG[dGi], dayZhi: DZ[dZi], dayEl: WX_G[TG[dGi]],
    yearGan: TG[yGi], yearZhi: DZ[yZi],
    dGi, dZi, yGi, yZi
  };
}

/* 依命主八字×當日干支計算真實運勢 */
function computeRealFortune(bazi){
  // ── 新邏輯：以 analyzeBaziTags + analyzeZiweiTags + analyzeJyotishTags + analyzeNatalTags + analyzeNameTags 為核心 ──
  // 今日運勢是「general」類型的短線判斷，用全系統 tag 加權
  var today = new Date();
  var todayGZ = getTodayGanZhi ? getTodayGanZhi() : null;
  var dm = bazi.dm, dmEl = bazi.dmEl;
  var tEl = todayGZ ? todayGZ.dayEl : dmEl;
  var tG  = todayGZ ? todayGZ.dayGan : dm;
  var tZ  = todayGZ ? todayGZ.dayZhi : bazi.pillars.day.zhi;
  var dZ  = bazi.pillars.day.zhi;

  // ── A. 八字核心（不變，這是日運的骨幹）──
  var score = 50;
  var god = tenGod(dm, tG);
  var godScores = {'比肩':8,'劫財':3,'食神':10,'傷官':2,'偏財':7,'正財':12,'七殺':-8,'正官':5,'偏印':6,'正印':10};
  score += (godScores[god] || 0);
  if(bazi.fav.includes(tEl)) score += 15;
  if(bazi.unfav.includes(tEl)) score -= 15;
  var todayCG = CG[tZ] || [];
  todayCG.forEach(function(g){
    if(bazi.fav.includes(WX_G[g])) score += 4;
    if(bazi.unfav.includes(WX_G[g])) score -= 4;
  });
  if(LIU_CHONG && LIU_CHONG[tZ] === dZ) score -= 12;
  if(LIU_HE && LIU_HE[tZ] === dZ) score += 10;
  var csState = changSheng(dm, tZ);
  var csScores = {'長生':10,'沐浴':2,'冠帶':6,'臨官':8,'帝旺':12,'衰':-2,'病':-5,'死':-8,'墓':-6,'絕':-10,'胎':1,'養':3};
  score += (csScores[csState] || 0);
  var curDayun = bazi.dayun ? bazi.dayun.find(function(d){return d.isCurrent;}) : null;
  if(curDayun){
    if(bazi.fav.includes(curDayun.el)) score += 5;
    if(bazi.unfav.includes(curDayun.el)) score -= 5;
  }
  score = Math.max(10, Math.min(95, score));

  // ── B. 新多維度 tag 引擎加成（取代舊的各系統獨立加法）──
  // 優先從 S._uResult 取（問答已跑過），否則即時計算
  var tagBonus = 0;
  var tagSources = [];
  if(typeof S !== 'undefined' && S._uResult && S._uResult.comb){
    // 已有問答結果：直接用 finalDir 和 rawStrength 推算加成
    var rs = S._uResult.comb.rawStrength || 0.5;
    var fd = S._uResult.comb.finalDir || 'mid';
    var baseAdj = (rs - 0.5) * 20; // ±10
    tagBonus += fd === 'pos' ? Math.abs(baseAdj) : fd === 'neg' ? -Math.abs(baseAdj) : 0;
  } else {
    // 即時計算七系統 tags（'general' 類型）
    try { tagSources.push(analyzeBaziTags(bazi, 'general')); } catch(e){}
    try { if(S.ziwei) tagSources.push(analyzeZiweiTags(S.ziwei, 'general')); } catch(e){}
    try { if(S.natal) tagSources.push(analyzeNatalTags(S.natal, 'general')); } catch(e){}
    try { if(S.jyotish) tagSources.push(analyzeJyotishTags(S.jyotish, 'general')); } catch(e){}
    var nr = (typeof S !== 'undefined' && S.nameResult) ? S.nameResult : null;
    var znr = (typeof S !== 'undefined' && S.zodiacNameResult) ? S.zodiacNameResult : null;
    try { if(nr || znr) tagSources.push(analyzeNameTags(nr, znr, 'general')); } catch(e){}
    tagSources.forEach(function(tags){
      if(!tags || !tags.length) return;
      tags.forEach(function(t){
        var w = t.weight || 1;
        if(t.direction === 'pos') tagBonus += w * 0.8;
        else if(t.direction === 'neg') tagBonus -= w * 0.8;
      });
    });
  }
  tagBonus = Math.max(-15, Math.min(15, tagBonus));
  score += tagBonus;

  // ── C. 吠陀月亮行運（日運最重要的即時指標）──
  var jyDailyNote = '';
  if(typeof S !== 'undefined' && S.jyotish){
    try{
      var tr = jyCurrentTransits();
      var lagnaIdx = S.jyotish.lagna.idx;
      var moonBhava = ((tr.Moon.rashiIdx - lagnaIdx + 12) % 12) + 1;
      if([1,2,5,7,9,10,11].includes(moonBhava)){ score += 5; jyDailyNote = '月亮行運第'+moonBhava+'宮（吉）'; }
      else if([6,8,12].includes(moonBhava)){ score -= 5; jyDailyNote = '月亮行運第'+moonBhava+'宮（需留意）'; }
      if(tr.Moon.nakshatra) jyDailyNote += '・'+tr.Moon.nakshatra.zh;
      var jupBhava = ((tr.Jupiter.rashiIdx - lagnaIdx + 12) % 12) + 1;
      if([1,5,9,11].includes(jupBhava)) score += 3;
      var satBhava = ((tr.Saturn.rashiIdx - lagnaIdx + 12) % 12) + 1;
      if([1,4,7,8,10].includes(satBhava)) score -= 2;
      if(S.jyotish.currentMD){
        var mdDig = S.jyotish.planets[S.jyotish.currentMD.lord] ? S.jyotish.planets[S.jyotish.currentMD.lord].dignity : 'neutral';
        if(mdDig==='exalted'||mdDig==='own') score += 3;
        else if(mdDig==='debilitated') score -= 3;
      }
    }catch(e){}
  }

  // ── D. 紫微流日宮位 ──
  if(typeof S !== 'undefined' && S.ziwei){
    try{
      var zwBr = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
      var zwI = zwBr.indexOf(tZ);
      if(zwI >= 0 && S.ziwei.palaces && S.ziwei.palaces[zwI]){
        var tP = S.ziwei.palaces[zwI];
        if(tP.stars.some(function(s){return s.hua==='化祿';})) score += 5;
        if(tP.stars.some(function(s){return s.hua==='化忌';})) score -= 5;
        if(tP.stars.filter(function(s){return s.type==='major';}).length >= 2) score += 3;
      }
    }catch(e){}
  }

  score = Math.max(10, Math.min(95, score));

  // ── 籤等 ──
  var sign, icon, msg;
  if(score>=85){sign='上上籤';icon='🌟';msg='諸事皆宜，今日天時與命盤高度契合，把握機會！';}
  else if(score>=75){sign='大吉籤';icon='🍊';msg='天時地利人和，今日運勢旺盛，適合重要決定。';}
  else if(score>=65){sign='上吉籤';icon='✨';msg='貴人星動，行動力強，積極推進事務有佳績。';}
  else if(score>=55){sign='中吉籤';icon='🌙';msg='穩中求進，內在能量充沛，適合規劃與學習。';}
  else if(score>=45){sign='小吉籤';icon='🌤️';msg='小有進展，耐心等待時機，勿急躁冒進。';}
  else if(score>=35){sign='中平籤';icon='☁️';msg='順其自然，今日宜守不宜攻，韜光養晦。';}
  else if(score>=25){sign='小凶籤';icon='🌊';msg='運勢低迷，注意人際摩擦，凡事多留退路。';}
  else{sign='凶籤';icon='⚡';msg='沖煞之日，宜靜不宜動，避免重大決策與衝突。';}

  var favEl = bazi.fav[0] || dmEl;
  var crystalMap = {
    '金':[{n:'鈦晶',reason:'補金行能量'},{n:'白水晶',reason:'淨化氣場'}],
    '木':[{n:'綠幽靈',reason:'招引貴人正財'},{n:'東陵玉',reason:'生長希望'}],
    '水':[{n:'海藍寶',reason:'增強溝通力'},{n:'月光石',reason:'照亮方向'}],
    '火':[{n:'紅瑪瑙',reason:'激發行動力'},{n:'紫水晶',reason:'提升直覺'}],
    '土':[{n:'黃水晶',reason:'招偏財穩心性'},{n:'茶晶',reason:'排除浮躁'}]
  };
  var crystalList = crystalMap[favEl] || crystalMap['土'];
  var crystal = crystalList[Math.abs(score) % crystalList.length];

  // 宜忌
  var godYJ = {
    '比肩':{yi:'合作・社交',ji:'借貸・獨斷'},'劫財':{yi:'競爭・突破',ji:'投資・賭博'},
    '食神':{yi:'約會・創作・美食',ji:'爭論'},'傷官':{yi:'創新・改革',ji:'面試・簽約'},
    '偏財':{yi:'投資・業務',ji:'保守理財'},'正財':{yi:'收帳・談判・簽約',ji:'冒險投機'},
    '七殺':{yi:'健身・挑戰',ji:'衝動消費'},'正官':{yi:'面試・正式場合',ji:'遲到・隨便'},
    '偏印':{yi:'學習・靜心',ji:'衝動行動'},'正印':{yi:'求教・讀書・養生',ji:'激進改變'}
  };
  var yj = godYJ[god] || {yi:'順其自然',ji:'急躁'};

  // 二十八宿
  var _28XS = ['角','亢','氐','房','心','尾','箕','斗','牛','女','虛','危','室','壁','奎','婁','胃','昴','畢','觜','參','井','鬼','柳','星','張','翼','軫'];
  var _28L  = ['吉','凶','凶','吉','凶','吉','吉','吉','凶','凶','凶','凶','吉','吉','凶','吉','吉','凶','吉','凶','吉','吉','凶','凶','凶','吉','凶','吉'];
  var _bd28 = Date.UTC(1900,0,7);
  var _dd28 = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  var _xi = ((Math.floor((_dd28-_bd28)/864e5)%28)+28)%28;

  // 十神提示
  var godTip = {
    '比肩':'同儕互動多，適合團隊合作','劫財':'競爭壓力大，守財為上',
    '食神':'靈感充沛，適合創作學習','傷官':'表達慾強但易得罪人，說話前三思',
    '偏財':'偏財運動，可小試投資','正財':'正財穩定，適合處理帳務簽約',
    '七殺':'壓力較大，注意與上司互動','正官':'貴人運佳，適合拜訪長輩處理公事',
    '偏印':'思緒活躍但不安定，適合研究','正印':'學習運強，適合進修考試'
  };
  var isChong = !!(LIU_CHONG && LIU_CHONG[tZ] === dZ);
  var isHe    = !!(LIU_HE && LIU_HE[tZ] === dZ);
  var tipParts = [];
  if(godTip[god]) tipParts.push(god+'日：'+godTip[god]);
  if(isChong) tipParts.push('⚠ 日支逢沖，情緒波動大');
  if(isHe)    tipParts.push('✓ 日支逢合，人際和諧');
  var csTip = {'長生':'精神飽滿，開始新事物的好時機','帝旺':'能量巔峰但勿過度冒險','死':'能量低谷，宜靜不宜動','絕':'低潮期，保守行事'};
  if(csTip[csState]) tipParts.push(csTip[csState]);
  var tip = tipParts.slice(0,3).join('。')+'。';

  // ── 構建 detail 物件（showFortuneResult 需要）──
  var detail = {
    godDesc: god+'：日主'+dm+'遇流日天干'+tG,
    favHit: bazi.fav.includes(tEl) ? '✓ 今日五行'+tEl+'為喜用神，加分' : bazi.unfav.includes(tEl) ? '✗ 今日五行'+tEl+'為忌神，減分' : '今日五行'+tEl+'為閒神',
    csDesc: '十二長生：'+csState+'（'+dm+'遇'+tZ+'）',
    chong: isChong ? '⚠ 日支沖（'+dZ+'沖'+tZ+'），今日磁場動盪' : '',
    he: isHe ? '✓ 日支合（'+dZ+'合'+tZ+'），今日人際和諧' : ''
  };

  // ── 動態提示 ──
  var dynNote = '';
  if(isChong && score<=40) dynNote = '今天日支逢沖且運勢偏低，建議重要事情延後處理';
  else if(score>=75) dynNote = '今日多維度訊號一致偏正面，適合積極行動';

  // ── 月令提示 ──
  var monthNote = '';
  try{
    var mzhi = bazi.pillars.month.zhi;
    if(mzhi) monthNote = '命主月令'+mzhi+'，流日'+tZ+'交互影響已納入計算';
  }catch(e){}

  // ── 星宿提示 ──
  var xingxiuNote = _28XS[_xi]+'宿（'+(_28L[_xi]==='吉'?'吉宿，宜進取':'凶宿，宜保守')+' ）';

  // ── 宜忌整理 ──
  var yiJiObj = {yi:yj.yi.split('・'), ji:yj.ji.split('・')};

  return {
    score:score, sign:sign, icon:icon, msg:msg, tip:tip,
    crystal:crystal.n||crystal, crystalReason:crystal.reason||'補充喜用神能量',
    god:god, cs:csState, csState:csState, gz:tG+tZ, todayGZ:tG+tZ,
    tEl:tEl, el:favEl, favEl:favEl,
    isChong:isChong, isHe:isHe,
    yi:yj.yi, ji:yj.ji,
    xingxiu:_28XS[_xi]+'宿', xingxiuLuck:_28L[_xi],
    jyDailyNote:jyDailyNote,
    tagBonus:Math.round(tagBonus),
    detail:detail,
    dynNote:dynNote,
    xingxiuNote:xingxiuNote,
    monthNote:monthNote,
    yiJi:yiJiObj
  };
}


function renderDailyFortune(){
  const container = document.getElementById('daily-fortune-content');
  if(!container) return;

  // 必須先填寫基本資料
  if(!S.bazi){
    container.innerHTML = `
      <div class="fortune-draw-area">
        <div class="fortune-urn" style="opacity:0.5">🔒</div>
        <p class="text-dim" style="margin-bottom:var(--sp-md)">需要先完成基本資料（生日時辰），才能依你的八字計算今日運勢</p>
        <button class="btn btn-primary" onclick="goStep(0);window.scrollTo({top:0,behavior:'smooth'})">
          <i class="fas fa-pen"></i> 前往填寫資料
        </button>
      </div>`;
    return;
  }

  const today = new Date().toISOString().slice(0,10);
  const key = 'jy_real_fortune_' + today;
  let cached = null;
  try{ cached = JSON.parse(localStorage.getItem(key)); }catch(e){}

  if(cached && cached.drawn){
    showFortuneResult(cached);
  } else {
    container.innerHTML = `
      <div class="fortune-draw-area">
        <div class="fortune-urn">🏮</div>
        <p class="text-dim">依你的命盤 × 今日天時，算出專屬運勢</p>
        <button class="btn btn-gold" onclick="drawDailyFortune()" id="btn-draw-fortune">
          <i class="fas fa-hand-sparkles"></i> 抽今日運勢籤
        </button>
      </div>`;
  }
}

function drawDailyFortune(){
  if(!S.bazi){ alert('請先填寫基本資料（生日時辰）'); return; }
  const btn = document.getElementById('btn-draw-fortune');
  if(btn){ btn.disabled=true; btn.innerHTML='<i class="fas fa-spinner fa-spin"></i> 推算中...'; }

  incrementAchievement('daily_streak');

  setTimeout(()=>{
    const fortune = computeRealFortune(S.bazi);
    fortune.drawn = true;
    const today = new Date().toISOString().slice(0,10);
    try{
      // 清理舊資料
      for(let i=localStorage.length-1;i>=0;i--){
        const k=localStorage.key(i);
        if(k&&k.startsWith('jy_real_fortune_')&&!k.endsWith(today)) localStorage.removeItem(k);
      }
      localStorage.setItem('jy_real_fortune_'+today, JSON.stringify(fortune));
    }catch(e){}
    showFortuneResult(fortune);
  }, 1500);
}

function showFortuneResult(f){
  const container = document.getElementById('daily-fortune-content');
  if(!container) return;

  const prod = findProductByName(f.crystal);
  const scoreColor = f.score>=60?'var(--c-success)':f.score>=40?'var(--c-warn)':'var(--c-danger)';

  // ── 十神白話翻譯 ──
  const godWhite = {
    '比肩':'人際互助日 — 適合團隊合作、找朋友商量事情',
    '劫財':'競爭激烈日 — 守住自己的立場，小心被人搶先',
    '食神':'靈感爆發日 — 適合創作、學習、嘗試新東西',
    '傷官':'敢言敢衝日 — 表達力強但容易得罪人，說話三思',
    '偏財':'意外之財日 — 偏財運活躍，小額投機可試但別貪',
    '正財':'穩定收入日 — 正財能量強，適合談薪資、簽約',
    '七殺':'壓力挑戰日 — 外部壓力大，但也是突破自我的機會',
    '正官':'貴人相助日 — 長輩或上司可能給你好消息',
    '偏印':'思考沉澱日 — 適合獨處充電、閱讀、靜心冥想',
    '正印':'學習成長日 — 腦袋特別清楚，讀書考試效率高'
  };

  // ── 十二長生白話翻譯 ──
  const csWhite = {
    '長生':'精力充沛，做什麼都有勁',
    '沐浴':'情緒起伏大，避免衝動決定',
    '冠帶':'自信心強，適合展現自己',
    '臨官':'執行力旺盛，果斷推進計畫',
    '帝旺':'能量巔峰，今天是你的主場',
    '衰':'避免過度消耗體力，量力而為',
    '病':'身體比較敏感，注意休息和飲食',
    '死':'舊事結束，反而適合斷捨離',
    '墓':'沉澱收藏日，不宜高調張揚',
    '絕':'能量最低點，韜光養晦最聰明',
    '胎':'新的開始正在醞釀中',
    '養':'慢慢累積能量，急不來'
  };

  // ── 今日焦點與行動建議 ──
  const godTip = godWhite[f.god] || '順其自然，保持平常心';
  const csTip = csWhite[f.csState||f.cs] || '保持穩定節奏';
  
  let focusItems = [];
  focusItems.push(godTip.split('—')[0].trim());
  if(f.detail && f.detail.chong) focusItems.push('⚡ 沖日：今天磁場較動盪，大事緩一緩');
  if(f.detail && f.detail.he) focusItems.push('💫 合日：今天磁場和諧，推進事務順利');
  if(f.score >= 70) focusItems.push('🔥 高能日：把最重要的事排在今天');
  else if(f.score <= 35) focusItems.push('🛡️ 低能日：避免重大決策，保存能量');

  // ── build7D 各維度洞察注入 ──
  var _7dDaily=null, _7dDailyParts=[], _7dDailyScore=0;
  try{
    if(typeof build7D==='function' && S.bazi){
      // 用 'general' type 取整體維度
      _7dDaily=build7D(S.bazi, S.meihua||null, S.tarot||null, 'general');
      // Phase 2: score 不再由 build7D 計算，改用流日分數 f.score 做判定
      _7dDailyScore = f.score >= 65 ? 3 : f.score >= 55 ? 1 : f.score <= 35 ? -2 : f.score <= 45 ? -1 : 0;
      _7dDailyParts=_7dDaily.parts.filter(function(p){return p&&p.length>5;});
      // 從七維度提取焦點
      if(_7dDailyScore>=3) focusItems.push('📊 七維度綜合：多數命盤維度正面，今日整體能量強');
      else if(_7dDailyScore>=1) focusItems.push('📊 七維度綜合：命盤訊號偏正面，穩步推進');
      else if(_7dDailyScore<=-1) focusItems.push('📊 七維度綜合：命盤有壓力信號，今日宜守不宜攻');
    }
  }catch(e){}

  let actionTips = [];
  actionTips.push(godTip.split('—')[1]?godTip.split('—')[1].trim():'保持開放心態');
  actionTips.push(csTip);
  if(S.bazi && S.bazi.tiaohou){
    const th = S.bazi.tiaohou;
    if(th.need && th.need.includes('火')) actionTips.push('今天多曬太陽、穿暖色系，補充火行能量');
    if(th.need && th.need.includes('水')) actionTips.push('今天多喝水、去有水的地方走走，調節命盤溫度');
    if(th.need && th.need.includes('木')) actionTips.push('接觸綠色植物、戶外散步，補充木行生機');
  }

  // build7D 維度建議注入 actionTips
  try{
    if(_7dDaily && S.meihua && S.meihua.ty){
      var _buRel=S.meihua.ty.r;
      if(_buRel==='用克體') actionTips.push('梅花卦象顯示外在有壓力源，今天避免正面衝突');
      else if(_buRel==='用生體') actionTips.push('梅花卦象顯示外力支持你，主動出擊有利');
      else if(_buRel==='體克用') actionTips.push('梅花卦象顯示你能掌控局面，但會比較費力');
    }
    if(_7dDaily && S.tarot && S.tarot.drawn && S.tarot.drawn.length>=10){
      var _todayTarot=S.tarot.drawn[0]; // 核心現狀牌
      if(_todayTarot && !_todayTarot.isUp) actionTips.push('塔羅核心牌逆位（'+_todayTarot.n+'），今天心態需要調整');
    }
  }catch(e){}

  // 吠陀占星即時行運提示
  if(f.jyDailyNote) focusItems.push('🕉️ ' + f.jyDailyNote);

  container.innerHTML = `
    <div class="fortune-result" style="animation:scaleIn 0.5s ease">
      <div class="fortune-sign-icon">${f.icon}</div>
      <div class="fortune-sign-text">${f.sign}</div>
      <p class="fortune-msg">${f.msg}</p>
      <div style="margin:var(--sp-sm) 0;font-size:0.85rem;color:var(--c-text-dim)">
        今日干支：<span class="tag tag-gold">${f.todayGZ||f.gz||''}</span>
        <span style="color:${scoreColor};font-weight:700;margin-left:var(--sp-sm)">運勢分數 ${f.score}</span>
      </div>

      <!-- 今日運勢焦點（白話文）-->
      <div style="background:linear-gradient(135deg,rgba(212,175,55,0.06),rgba(212,175,55,0.02));border-radius:var(--r-md);padding:var(--sp-md);margin:var(--sp-sm) 0;border-left:3px solid rgba(212,175,55,0.3)">
        <p style="font-weight:700;color:var(--c-gold);font-size:0.9rem;margin-bottom:0.4rem">🔮 今日運勢焦點</p>
        ${focusItems.map(t=>'<p style="font-size:0.88rem;line-height:1.7;margin:0.2rem 0">'+t+'</p>').join('')}
      </div>

      <!-- 今日行動建議（白話文）-->
      <div style="background:rgba(0,0,0,0.15);border-radius:var(--r-md);padding:var(--sp-md);margin:var(--sp-sm) 0">
        <p style="font-weight:700;color:var(--c-gold);font-size:0.9rem;margin-bottom:0.4rem">📋 今日行動建議</p>
        ${actionTips.map((t,i)=>'<p style="font-size:0.88rem;line-height:1.7;margin:0.2rem 0">'+(i+1)+'. '+t+'</p>').join('')}
      </div>

      <!-- 七維度命盤分析（build7D）-->
      ${_7dDailyParts.length?`
      <details style="margin:var(--sp-sm) 0">
        <summary style="cursor:pointer;font-size:0.85rem;color:var(--c-gold);padding:0.4rem 0;user-select:none;font-weight:600">
          📊 七維度命盤分析
        </summary>
        <div style="background:rgba(212,175,55,0.04);border-radius:var(--r-md);padding:var(--sp-sm) var(--sp-md);margin-top:0.3rem;font-size:0.82rem;color:var(--c-text-dim);line-height:1.8;border-left:2px solid rgba(212,175,55,.2)">
          ${_7dDailyParts.map(function(p){return '<p style="margin:.2rem 0">'+p+'</p>';}).join('')}
        </div>
      </details>
      `:''}

      <!-- 命理數據（折疊）-->
      <details style="margin:var(--sp-sm) 0">
        <summary style="cursor:pointer;font-size:0.8rem;color:var(--c-text-dim);padding:0.4rem 0;user-select:none">
          <i class="fas fa-chart-bar"></i> 展開查看命理數據
        </summary>
        <div style="background:rgba(0,0,0,0.2);border-radius:var(--r-md);padding:var(--sp-sm) var(--sp-md);margin-top:0.3rem;font-size:0.78rem;color:var(--c-text-dim);line-height:1.8">
          <p>${f.detail?f.detail.godDesc:'—'}</p>
          <p>${f.detail?f.detail.favHit:'—'}</p>
          <p>${f.detail?f.detail.csDesc:'—'}</p>
          ${f.detail&&f.detail.chong?'<p style="color:var(--c-danger)">'+f.detail.chong+'</p>':''}
          ${f.detail&&f.detail.he?'<p style="color:var(--c-success)">'+f.detail.he+'</p>':''}
        </div>
      </details>

      <div class="fortune-divider"></div>
      <div class="fortune-crystal-rec">
        <p class="text-sm"><strong>今日推薦水晶（依喜用神${f.el||f.favEl||''}行）：</strong></p>
        <div class="fortune-crystal-card">
          <span class="fortune-crystal-name">${typeof f.crystal==='object'?(f.crystal.n||f.crystal):f.crystal}</span>
          <span class="el-tag el-${f.el||f.favEl||''} text-xs">${f.el||f.favEl||''}行</span>
        </div>
        <p class="text-xs text-dim">${f.crystalReason||(typeof f.crystal==='object'?f.crystal.reason:'')||'補充喜用神能量'}</p>
        <div class="fortune-buy-btns mt-sm">
          <a href="${prod?prod.shopee:'https://tw.shp.ee/2n5Mo2w'}" target="_blank" rel="noopener" class="product-btn shopee"><i class="fas fa-shopping-cart"></i> 蝦皮入手</a>
          <a href="${prod?prod.seven:'https://myship.7-11.com.tw/seller/profile?id=GM2601091690232'}" target="_blank" rel="noopener" class="product-btn seven"><i class="fas fa-box"></i> 7-11</a>
        </div>
      </div>
      <p class="text-xs text-muted mt-md">明天可以再抽一次 ✨ 每日 00:00 重置</p>
    </div>`;

  // ── 【升級F】在結果後追加新維度資訊 ──
  try{
    var _extraHtml = '';
    if(f.dynNote) _extraHtml += '<div style="background:rgba(212,175,55,.08);border-radius:8px;padding:8px 12px;margin:8px 0;font-size:.85rem">'+f.dynNote+'</div>';
    if(f.xingxiuNote) _extraHtml += '<p style="font-size:.8rem;opacity:.8;margin:4px 0">🌟 '+f.xingxiuNote+'</p>';
    if(f.monthNote) _extraHtml += '<p style="font-size:.8rem;opacity:.8;margin:4px 0">📅 '+f.monthNote+'</p>';
    if(f.yiJi && (f.yiJi.yi.length || f.yiJi.ji.length)){
      _extraHtml += '<div style="display:flex;gap:12px;margin:8px 0;font-size:.82rem">';
      if(f.yiJi.yi.length) _extraHtml += '<div style="flex:1"><span style="color:#4ade80;font-weight:600">✅ 宜：</span>'+f.yiJi.yi.join('、')+'</div>';
      if(f.yiJi.ji.length) _extraHtml += '<div style="flex:1"><span style="color:#f87171;font-weight:600">❌ 忌：</span>'+f.yiJi.ji.join('、')+'</div>';
      _extraHtml += '</div>';
    }
    if(_extraHtml) container.innerHTML += _extraHtml;
  }catch(e){}
}

function findProductByName(name){
  for(const el of Object.values(REAL_PRODUCTS)){
    if(!Array.isArray(el)) continue;
    const found = el.find(p=>p.n.includes(name));
    if(found) return found;
  }
  return null;
}

/* =============================================================
   FEATURE 2: 成就徽章系統
   ============================================================= */
const ACHIEVEMENTS = [
  {id:'first',name:'初次問卦',icon:'🌱',desc:'完成第一次占卜',need:1},
  {id:'curious',name:'好奇寶寶',icon:'🔍',desc:'累計占卜 3 次',need:3},
  {id:'seeker',name:'命理换索者',icon:'🧭',desc:'累計占卜 5 次',need:5},
  {id:'devoted',name:'虔誠信徒',icon:'🙏',desc:'累計占卜 10 次',need:10},
  {id:'master',name:'占卜大師',icon:'🧙',desc:'累計占卜 20 次',need:20},
  {id:'crystal',name:'水晶達人',icon:'💍',desc:'查看水晶百科 5 種以上',need:5,type:'crystal_views'},
  {id:'sharer',name:'分享王',icon:'📣',desc:'分享結果給朋友',need:1,type:'shares'},
  {id:'daily',name:'每日報到',icon:'📅',desc:'連續 3 天抽運勢籤',need:3,type:'daily_streak'},
  {id:'alltype',name:'全能問卦師',icon:'🍭',desc:'問遍 5 種不同類型的問題',need:5,type:'types_asked'}
];

function getAchievementData(){
  try{
    return JSON.parse(localStorage.getItem('jy_achievements')||'{}');
  }catch(e){ return {}; }
}

function saveAchievementData(data){
  try{ localStorage.setItem('jy_achievements', JSON.stringify(data)); }catch(e){}
}

function incrementAchievement(type, value){
  const data = getAchievementData();
  if(!data.counts) data.counts={};
  if(type === 'divination'){
    data.counts.divination = (data.counts.divination||0) + 1;
  } else if(type === 'crystal_views'){
    if(!data.counts.crystal_views) data.counts.crystal_views = new Set();
    // Sets don't serialize well, use array
    if(!Array.isArray(data.counts.crystal_views)) data.counts.crystal_views = [];
    if(!data.counts.crystal_views.includes(value)){
      data.counts.crystal_views.push(value);
    }
  } else if(type === 'shares'){
    data.counts.shares = (data.counts.shares||0) + 1;
  } else if(type === 'types_asked'){
    if(!Array.isArray(data.counts.types_asked)) data.counts.types_asked = [];
    if(value && !data.counts.types_asked.includes(value)){
      data.counts.types_asked.push(value);
    }
  } else if(type === 'daily_streak'){
    const today = new Date().toISOString().slice(0,10);
    if(!data.counts.daily_dates) data.counts.daily_dates = [];
    if(!data.counts.daily_dates.includes(today)){
      data.counts.daily_dates.push(today);
    }
    // Calculate streak
    data.counts.daily_streak = calcStreak(data.counts.daily_dates);
  }
  saveAchievementData(data);
  checkNewAchievements(data);
}

function calcStreak(dates){
  if(!dates||!dates.length) return 0;
  const sorted = [...dates].sort().reverse();
  let streak = 1;
  for(let i=1;i<sorted.length;i++){
    const prev = new Date(sorted[i-1]);
    const curr = new Date(sorted[i]);
    const diff = (prev - curr) / (1000*60*60*24);
    if(diff === 1) streak++;
    else break;
  }
  return streak;
}

function checkNewAchievements(data){
  if(!data.counts) return;
  if(!data.unlocked) data.unlocked = [];
  
  ACHIEVEMENTS.forEach(a=>{
    if(data.unlocked.includes(a.id)) return;
    let count = 0;
    if(!a.type || a.type === 'divination') count = data.counts.divination || 0;
    else if(a.type === 'crystal_views') count = (data.counts.crystal_views||[]).length;
    else if(a.type === 'shares') count = data.counts.shares || 0;
    else if(a.type === 'daily_streak') count = data.counts.daily_streak || 0;
    else if(a.type === 'types_asked') count = (data.counts.types_asked||[]).length;
    
    if(count >= a.need){
      data.unlocked.push(a.id);
      showAchievementToast(a);
    }
  });
  saveAchievementData(data);
}

function showAchievementToast(a){
  const toast = document.createElement('div');
  toast.className = 'achievement-toast';
  toast.innerHTML = `<span class="at-icon">${a.icon}</span><div><strong>成就解鎖！</strong><br>${a.name}</div>`;
  document.body.appendChild(toast);
  setTimeout(()=>toast.classList.add('show'), 50);
  setTimeout(()=>{toast.classList.remove('show');setTimeout(()=>toast.remove(),500)}, 3500);
}

function renderAchievements(){
  const container = document.getElementById('achievements-grid');
  if(!container) return;
  const data = getAchievementData();
  const unlocked = data.unlocked || [];
  
  container.innerHTML = ACHIEVEMENTS.map(a=>{
    const isUnlocked = unlocked.includes(a.id);
    return `<div class="achievement-badge ${isUnlocked?'unlocked':'locked'}">
      <div class="badge-icon">${isUnlocked?a.icon:'🔒'}</div>
      <div class="badge-name">${a.name}</div>
      <div class="badge-desc text-xs text-muted">${a.desc}</div>
    </div>`;
  }).join('');
  
  const total = ACHIEVEMENTS.length;
  const done = unlocked.length;
  document.getElementById('achievement-progress').textContent = `${done}/${total} 已解鎖`;
}

/* =============================================================
   FEATURE 3: 水晶百科圖鑑
   ============================================================= */
function renderCrystalEncyclopedia(){
  const container = document.getElementById('crystal-encyclopedia-grid');
  if(!container) return;
  
  const allCrystals = [];
  const seen = new Set();
  for(const [category, items] of Object.entries(REAL_PRODUCTS)){
    if(!Array.isArray(items)) continue;
    items.forEach(p=>{
      if(seen.has(p.n)) return;
      seen.add(p.n);
      allCrystals.push({...p, _cat: category});
    });
  }
  
  container.innerHTML = allCrystals.map(c=>`
    <div class="ency-card" onclick="showCrystalDetail('${c.n.replace(/'/g,"\\'")}')">
      <div class="ency-icon">${c.icon||catIcon[c.cat]||'💎'}</div>
      <div class="ency-name">${c.n}</div>
      <div class="ency-meta">
        ${c.el!=='全'?`<span class="el-tag el-${c.el} text-xs">${c.el}行</span>`:'<span class="tag text-xs" style="color:var(--c-gold)">五行全</span>'}
        <span class="text-xs text-muted">${c.cat}</span>
      </div>
      <p class="ency-desc">${c.d}</p>
      <p class="ency-price">${c.price}</p>
    </div>`).join('');
}

function showCrystalDetail(name){
  incrementAchievement('crystal_views', name);
  
  let crystal = null;
  for(const items of Object.values(REAL_PRODUCTS)){
    if(!Array.isArray(items)) continue;
    crystal = items.find(p=>p.n === name);
    if(crystal) break;
  }
  if(!crystal) return;
  
  const modal = document.getElementById('crystal-detail-modal');
  if(!modal) return;
  
  modal.innerHTML = `
    <div class="cdm-overlay" onclick="closeCrystalDetail()"></div>
    <div class="cdm-content">
      <button class="cdm-close" onclick="closeCrystalDetail()"><i class="fas fa-times"></i></button>
      <div class="cdm-icon">${crystal.icon||catIcon[crystal.cat]||'💎'}</div>
      <h3 class="cdm-name">${crystal.n}</h3>
      <div class="cdm-tags">
        ${crystal.el!=='全'?`<span class="el-tag el-${crystal.el}">${crystal.el}行</span>`:'<span class="tag" style="color:var(--c-gold)">五行全</span>'}
        <span class="tag tag-gold">${crystal.cat}</span>
      </div>
      <p class="cdm-desc">${crystal.d}</p>
      <div class="cdm-info">
        <div class="cdm-row"><i class="fas fa-tag"></i> 價格：<strong>${crystal.price}</strong></div>
        <div class="cdm-row"><i class="fas fa-hand-holding-heart"></i> 佩戴方式：${crystal.wear}</div>
      </div>
      <div class="cdm-actions">
        <a href="${crystal.shopee}" target="_blank" rel="noopener" class="btn btn-gold"><i class="fas fa-shopping-cart"></i> 蝦皮購買</a>
        <a href="${crystal.seven}" target="_blank" rel="noopener" class="btn btn-outline"><i class="fas fa-box"></i> 7-11</a>
      </div>
    </div>`;
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeCrystalDetail(){
  const modal = document.getElementById('crystal-detail-modal');
  if(modal) modal.classList.add('hidden');
  document.body.style.overflow = '';
}

/* =============================================================
   FEATURE 4: 水晶配對測驗
   ============================================================= */
/* === 題庫：15題隨機抽3題，每次不同組合 === */
const QUIZ_BANK = [
  {q:'面對壓力時，你通常會？',opts:[
    {t:'深呼吸，冷靜分析',el:'水',trait:'理性'},
    {t:'找朋友聊聊傾訴',el:'木',trait:'社交'},
    {t:'立刻行動解決問題',el:'火',trait:'行動'},
    {t:'獨處靜心等靈感',el:'金',trait:'直覺'}
  ]},
  {q:'你最嚮往的生活方式？',opts:[
    {t:'穩定有規律的日常',el:'土',trait:'穩定'},
    {t:'充滿冒險與新鮮感',el:'火',trait:'冒險'},
    {t:'自由自在不受拘束',el:'水',trait:'自由'},
    {t:'和諧溫馨的家庭',el:'木',trait:'溫暖'}
  ]},
  {q:'如果水晶有顏色，最吸引你的是？',opts:[
    {t:'透明 / 白色 — 純淨',el:'金',trait:'純淨'},
    {t:'粉紅 / 紫色 — 浪漫',el:'火',trait:'浪漫'},
    {t:'綠色 / 藍色 — 寧靜',el:'木',trait:'寧靜'},
    {t:'金色 / 棕色 — 大地',el:'土',trait:'踏實'}
  ]},
  {q:'朋友眼中的你是？',opts:[
    {t:'值得信賴的靠山',el:'土',trait:'可靠'},
    {t:'點子王、創意多',el:'火',trait:'創意'},
    {t:'溫柔體貼的傾聽者',el:'水',trait:'溫柔'},
    {t:'行動派的領袖',el:'金',trait:'果斷'}
  ]},
  {q:'週末最想做的事？',opts:[
    {t:'宅在家追劇充電',el:'水',trait:'內斂'},
    {t:'出門走走接觸大自然',el:'木',trait:'自然'},
    {t:'約朋友聚餐聊天',el:'火',trait:'熱情'},
    {t:'整理房間或做計畫',el:'金',trait:'條理'}
  ]},
  {q:'你覺得自己最需要補足的是？',opts:[
    {t:'自信心和行動力',el:'火',trait:'勇氣'},
    {t:'耐心和穩定感',el:'土',trait:'沉穩'},
    {t:'人際關係和桃花',el:'木',trait:'人緣'},
    {t:'財運和事業動力',el:'金',trait:'進取'}
  ]},
  {q:'選一個最能代表你心情的天氣？',opts:[
    {t:'晴空萬里',el:'火',trait:'開朗'},
    {t:'微風徐徐的陰天',el:'金',trait:'沉靜'},
    {t:'綿綿細雨',el:'水',trait:'敏感'},
    {t:'雨後彩虹',el:'木',trait:'希望'}
  ]},
  {q:'挑一個數字？',opts:[
    {t:'1 — 開始',el:'木',trait:'起點'},
    {t:'3 — 變化',el:'火',trait:'變化'},
    {t:'6 — 順利',el:'金',trait:'圓滿'},
    {t:'8 — 豐收',el:'土',trait:'豐盛'}
  ]},
  {q:'你最害怕失卻的是？',opts:[
    {t:'健康',el:'土',trait:'務實'},
    {t:'自由',el:'水',trait:'獨立'},
    {t:'愛情 / 家人',el:'木',trait:'重情'},
    {t:'事業成就',el:'金',trait:'重心'}
  ]},
  {q:'買東西時你最看重？',opts:[
    {t:'CP值高不高',el:'金',trait:'精明'},
    {t:'外型好不好看',el:'火',trait:'美感'},
    {t:'品質耐不耐用',el:'土',trait:'品質'},
    {t:'有沒有特殊意義',el:'水',trait:'寓意'}
  ]},
  {q:'如果有一種超能力，你選？',opts:[
    {t:'讀心術',el:'水',trait:'洞察'},
    {t:'時間暫停',el:'金',trait:'掌控'},
    {t:'瞬間移動',el:'火',trait:'自由'},
    {t:'治癒能力',el:'木',trait:'慈悲'}
  ]},
  {q:'你的睡眠品質如何？',opts:[
    {t:'秒睡到天亮',el:'土',trait:'安穩'},
    {t:'偶爾失眠想太多',el:'水',trait:'多慮'},
    {t:'容易被吵醒',el:'金',trait:'敏銳'},
    {t:'夢很多很精彩',el:'火',trait:'想像力'}
  ]},
  {q:'選一種你喜歡的味道？',opts:[
    {t:'檀香 / 木質',el:'木',trait:'沉穩'},
    {t:'花香 / 獫瑰',el:'火',trait:'浪漫'},
    {t:'海洋 / 清新',el:'水',trait:'清爽'},
    {t:'茶香 / 大地',el:'土',trait:'內斂'}
  ]},
  {q:'你對「命運」的看法？',opts:[
    {t:'三分天注定，七分靠努力',el:'火',trait:'積極'},
    {t:'順其自然就好',el:'水',trait:'隨和'},
    {t:'做好準備，等待時機',el:'金',trait:'謀略'},
    {t:'相信因果，種善因得善果',el:'木',trait:'善良'}
  ]},
  {q:'工作中最讓你有成就感的事？',opts:[
    {t:'完成挑戰性的專案',el:'火',trait:'挑戰'},
    {t:'得到主管或客戶認可',el:'金',trait:'榮譽'},
    {t:'幫助同事解決問題',el:'木',trait:'助人'},
    {t:'存到目標數字的錢',el:'土',trait:'累積'}
  ]}
];

let quizState = {step:0, answers:[], questions:[]};

function startCrystalQuiz(){
  // Shuffle and pick 3 random questions
  const shuffled = [...QUIZ_BANK].sort(()=>Math.random()-0.5);
  quizState = {step:0, answers:[], questions: shuffled.slice(0,3)};
  renderQuizStep();
}

function renderQuizStep(){
  const container = document.getElementById('crystal-quiz-content');
  if(!container) return;
  
  if(quizState.step >= quizState.questions.length){
    showQuizResult();
    return;
  }
  
  const q = quizState.questions[quizState.step];
  const total = quizState.questions.length;
  container.innerHTML = `
    <div class="quiz-progress">第 ${quizState.step+1}/${total} 題</div>
    <div class="quiz-progress-bar"><div class="quiz-fill" style="width:${(quizState.step/total)*100}%"></div></div>
    <h4 class="quiz-question">${q.q}</h4>
    <div class="quiz-options">${q.opts.map((o,i)=>`
      <button class="quiz-option" onclick="answerQuiz(${i})">
        <span>${o.t}</span>
      </button>`).join('')}
    </div>`;
}

function answerQuiz(idx){
  const q = quizState.questions[quizState.step];
  quizState.answers.push(q.opts[idx]);
  quizState.step++;
  renderQuizStep();
}

function showQuizResult(){
  const container = document.getElementById('crystal-quiz-content');
  if(!container) return;
  
  // Count quiz elements
  const elCount = {};
  quizState.answers.forEach(a=>{
    elCount[a.el] = (elCount[a.el]||0) + 1;
  });
  const quizTopEl = Object.entries(elCount).sort((a,b)=>b[1]-a[1])[0][0];
  const traits = quizState.answers.map(a=>a.trait);
  
  // ** 核心修改：以八字喜用神為主，測驗結果為輔 **
  let targetEl = quizTopEl;
  let hasBazi = false;
  let baziNote = '';
  
  if(typeof S !== 'undefined' && S.bazi && S.bazi.fav && S.bazi.fav.length){
    hasBazi = true;
    const favEl = S.bazi.fav[0]; // 第一喜用神
    targetEl = favEl; // 以八字為準
    if(favEl !== quizTopEl){
      baziNote = `<div class="quiz-bazi-note"><i class="fas fa-info-circle"></i> 測驗顯示你偏好「${quizTopEl}行」，但你的八字喜用神是「<strong>${favEl}行</strong>」。依命理卟則，我們以喜用神為你推薦最適合的水晶。</div>`;
    } else {
      baziNote = `<div class="quiz-bazi-match"><i class="fas fa-check-circle"></i> 你的直覺與八字完全吻合！喜用神「<strong>${favEl}行</strong>」正是你最需要的能量。</div>`;
    }
    // ── 多維度補充分析 ──
    let multiDimNote = '';
    // 紫微分析
    if(typeof readPalace === 'function'){
      const _cp = readPalace('命宮');
      if(_cp && _cp.huaJi) multiDimNote += `<p style="font-size:.8rem;opacity:.8;margin:.2rem 0">🔮 紫微命宮化忌，水晶能幫助化解內在焦慮和壓力。</p>`;
      if(_cp && _cp.huaLu) multiDimNote += `<p style="font-size:.8rem;opacity:.8;margin:.2rem 0">🔮 紫微命宮化祿，水晶能放大你的好運能量。</p>`;
    }
    // 大運分析
    const _qzDy = S.bazi.dayun ? S.bazi.dayun.find(d=>d.isCurrent) : null;
    if(_qzDy){
      if(_qzDy.level && _qzDy.level.includes('凶')) multiDimNote += `<p style="font-size:.8rem;opacity:.8;margin:.2rem 0">📅 目前大運偏弱，特別建議佩戴${favEl}行水晶穩定磁場。</p>`;
    }
    // 調候分析
    if(S.bazi.tiaohou){
      const _th = S.bazi.tiaohou.reason || '';
      if(_th.includes('寒')) multiDimNote += `<p style="font-size:.8rem;opacity:.8;margin:.2rem 0">🌡 體質偏寒，建議搭配暖色系（火行）水晶如紅瑪瑙、紫水晶。</p>`;
      else if(_th.includes('燥')||_th.includes('火旺')) multiDimNote += `<p style="font-size:.8rem;opacity:.8;margin:.2rem 0">🌡 體質偏燥，建議搭配冷色系（水行）水晶如海藍寶、月光石。</p>`;
    }
    // 身強弱
    if(S.bazi.strong) multiDimNote += `<p style="font-size:.8rem;opacity:.8;margin:.2rem 0">💪 身強格局，適合佩戴能引導能量外放的水晶，助你把握機會。</p>`;
    else multiDimNote += `<p style="font-size:.8rem;opacity:.8;margin:.2rem 0">🛡 身弱格局，特別適合佩戴守護型水晶，穩定氣場、補充能量。</p>`;
    if(multiDimNote) baziNote += `<div style="margin-top:.5rem;padding:.5rem;background:rgba(212,175,55,.05);border-radius:6px">${multiDimNote}</div>`;
  }
  
  // Find crystal from target element
  const candidates = REAL_PRODUCTS[targetEl] || REAL_PRODUCTS['土'];
  const pick = candidates[Math.floor(Math.random()*Math.min(3,candidates.length))];
  
  container.innerHTML = `
    <div class="quiz-result" style="animation:scaleIn 0.5s">
      <div class="quiz-result-icon">${{金:'🪙',木:'🌿',水:'💎',火:'🔥',土:'🏔️'}[pick.el]||'💎'}</div>
      <h3 class="quiz-result-title">你的命定水晶是</h3>
      <div class="quiz-result-crystal">${pick.n}</div>
      <div class="quiz-result-el">
        <span class="el-tag el-${pick.el}">${pick.el}行</span>
        <span class="tag tag-gold">${pick.cat}</span>
      </div>
      ${baziNote}
      <p class="quiz-result-desc">${pick.d}</p>
      <p class="quiz-result-traits text-sm text-dim">你的特質：${traits.join(' · ')}</p>
      ${!hasBazi ? '<p class="text-xs text-muted mt-sm"><i class="fas fa-lightbulb"></i> 提示：先完成「八字占卜」再做測驗，結果會更精準！</p>' : ''}
      <div class="quiz-result-actions mt-md">
        <a href="${pick.shopee}" target="_blank" rel="noopener" class="btn btn-gold"><i class="fas fa-shopping-cart"></i> 去蝦皮擁有它</a>
        <button class="btn btn-outline" onclick="startCrystalQuiz()"><i class="fas fa-redo"></i> 再測一次</button>
      </div>
      <button class="btn btn-outline btn-sm mt-md" onclick="shareQuizResult('${pick.n}','${traits.join('·')}')">
        <i class="fas fa-share-alt"></i> 分享我的命定水晶
      </button>
    </div>`;
}

function shareQuizResult(crystal, traits){
  const text = `我的命定水晶是「${crystal}」！特質：${traits}。你的呢？快來測 👉 `;
  const url = SITE_URL;
  if(navigator.share){
    navigator.share({title:'我的命定水晶',text:text,url:url}).catch(()=>{});
  } else {
    navigator.clipboard.writeText(text+url).then(()=>alert('已複製！貼到 LINE/IG 分享給朋友'));
  }
  incrementAchievement('shares',1);
}

/* =============================================================
   FEATURE 5: 好評輪播
   ============================================================= */
const REVIEWS = [
  // ═══ 2026 ═══
  {name:'bfv5210',city:'',crystal:'鈦晶手排17mm',stars:5,text:'強勢招財穩定氣場 提升自信',time:'2026/02/26'},
  {name:'pammy123.tw',city:'',crystal:'綠幽靈 鈦晶 月光石 拉長石 能量設計手鍊',stars:5,text:'每一顆都很美，設計搭配得很好！',time:'2026/02/26'},
  {name:'booker00aa',city:'',crystal:'天然紫牙烏 石榴石 12mm 頂級濃紫',stars:5,text:'顏色超美，品質很好',time:'2026/02/05'},
  {name:'hq7hpz18fx',city:'',crystal:'天然 紅龍宮舍利 13mm 手珠 63g',stars:5,text:'紅運當頭！質感很好',time:'2026/01/31'},
  {name:'jesscia985',city:'',crystal:'天然 頂級 白水晶 鑽切手排 14mm',stars:5,text:'適合搭配：百搭，CP值：高，賣家很 nice，鈦晶手排與白水晶手排都超美的',time:'2026/01/29'},
  {name:'jesscia985',city:'',crystal:'頂級咖啡鈦晶 太陽花手排 14mm',stars:5,text:'賣家很 nice，鈦晶手排與白水晶手排都超美的，包裝超特別，防護力超強，物流也超神速，總之一整個就是超讚',time:'2026/01/29'},
  {name:'yenrensu',city:'',crystal:'天然 咖啡鈦晶 手排 13mm',stars:5,text:'滿絲 貓眼 鋼鈦晶 招財旺事業 避邪擋煞 微調奢華復古金氣質',time:'2026/01/19'},
  {name:'shiunle',city:'',crystal:'頂級咖啡鈦晶 銅鈦 手排 16mm 滿絲板鈦',stars:5,text:'品質很棒，滿絲超美',time:'2026/01/02'},
  {name:'eicheuq8h7',city:'',crystal:'客製款 頂級銀曜石 貔貅手鍊 足銀999',stars:5,text:'會配合你的五行及預算去給你全方位建議，配好的手鍊也非常好看，推薦各位',time:'2025/12/29'},
  // ═══ 2025 下半 ═══
  {name:'l5v3e74kf8',city:'',crystal:'鋼鐵防禦 頂級天然鐵膽石 10mm',stars:5,text:'CP值：讚',time:'2025/12/17'},
  {name:'yeh552798',city:'',crystal:'天然 華青石 手鍊 10mm 二色性 維京石',stars:5,text:'維京人的羅盤 指引方向',time:'2025/12/11'},
  {name:'jfc16888',city:'',crystal:'天然龍宮舍利桶珠手鍊 13mm',stars:5,text:'收到商品包裝良好，送貨快速，這款桶珠手鍊還蠻喜歡的，有需要會再回購看看其他商品',time:'2025/12/07'},
  {name:'tasiong109',city:'',crystal:'天然龍宮舍利桶珠手鍊',stars:5,text:'完美品項 如商品照片 實物更加美 閃閃 更是服務超好 回應超快 寄件也快速 很完美的一次購物體驗！CP值：超值',time:'2025/12/01'},
  {name:'mandytseng0511',city:'',crystal:'天鐵設計款 五行手鍊 藍虎眼 海藍寶',stars:5,text:'感謝賣家，針對個人的五行缺乏的部分做設計款補足，溝通也很順暢，推薦給大家！',time:'2025/11/28'},
  {name:'fayefang20',city:'',crystal:'頂級 黑碧璽三圈 6mm+',stars:5,text:'電氣石 擋煞辟邪防小人 能量手鍊 穩定情緒接地',time:'2025/11/20'},
  {name:'c9301115',city:'',crystal:'頂級 佛眼 龍宮舍利 10mm+',stars:5,text:'CP值很高，很好看起來很好很有品質我很喜歡，下次有機會會再回購',time:'2025/11/20'},
  {name:'f09176058979',city:'',crystal:'頂級 黑閃靈 10mm 手鍊 閃靈鑽 淨水體',stars:5,text:'品質好，閃靈鑽超美',time:'2025/11/18'},
  {name:'yct585',city:'',crystal:'巨無霸 大地瑪瑙手排 22mm',stars:5,text:'看到老闆貼心的問候給予肯定，雙11活動所有東西都可以免運就瘋狂地買，沒想到大地瑪瑙這麼美，美到覺得自己好幸運！值得推薦的好賣家！',time:'2025/11/16'},
  {name:'lovebl927',city:'',crystal:'天然 薔薇輝石 手鍊 12mm+ 玫瑰石',stars:5,text:'出貨超快，很美的薔薇🌹 開箱比想像中更滿意！實體很讚，賣家經營用心~會推薦朋友購買！',time:'2025/11/13'},
  {name:'szcejosqa8',city:'',crystal:'甘肅黑又亮隕石原石15mm 左右中強磁',stars:5,text:'隕石原石手感很好，磁性很強',time:'2025/11/07'},
  {name:'liudfu',city:'',crystal:'泰國 黃龍宮舍利手鍊 11mm',stars:5,text:'用心包裝溝通良好的賣家😍快速出貨高cp值的好賣家，值得推薦大家一起來逛逛購買',time:'2025/10/21'},
  {name:'liudfu',city:'',crystal:'泰國 黃龍宮舍利手鍊 13mm',stars:5,text:'好用心的包裝超愛的😍快速出貨高cp值的好賣家，值得推薦大家一起來逛逛購買，給5星好評喔',time:'2025/10/21'},
  {name:'eric7987200111',city:'',crystal:'館藏級 綠髮晶手排 24mm 巨無霸',stars:5,text:'滿絲超美，館藏級品質',time:'2025/10/16'},
  {name:'mka789',city:'',crystal:'頂級 西北非隕石手鍊 18mm NWA 石隕',stars:5,text:'實物與照片吻合，CP值高，造型好',time:'2025/10/13'},
  {name:'hitomi0330',city:'',crystal:'頂級 彼得石手排 15mm 暴風雨石',stars:5,text:'鷹之石 暴風雨石 超美！',time:'2025/10/07'},
  {name:'showhsiang',city:'',crystal:'天然黃水晶手鍊 10mm 黃水晶 Citrine',stars:4,text:'黃水晶品質不錯',time:'2025/09/30'},
  {name:'chunyeh0419',city:'',crystal:'溫柔療癒系 藍方解石 7mm 手鍊 方解石',stars:5,text:'非常漂亮又有意境的美麗藍方解🥰😍🤩 感謝您的用心噢',time:'2025/09/22'},
  {name:'ruru590922',city:'',crystal:'太陽花鈦晶手排 天然水晶 鈦晶花 金髮晶',stars:5,text:'收到產品了！賣家包裝很完整齊全、賣家產品品質很好喔！有需要會再次回購支持賣家的',time:'2025/09/15'},
  {name:'ruru590922',city:'',crystal:'典藏級 太陽花鈦晶手排 22mm 鈦晶手鍊',stars:5,text:'收到產品了！賣家包裝很完整齊全、賣家產品品質很好喔、太陽花鈦晶手排很漂亮很喜歡',time:'2025/09/15'},
  {name:'mter03',city:'',crystal:'館藏級 西北非隕石手串 15mm+ NWA',stars:5,text:'隕石能量超強，品質好',time:'2025/09/05'},
  {name:'a19642020',city:'',crystal:'現貨 西北非隕石手鍊 14mm NWA',stars:5,text:'賣家很專業、很親切，仔細解說該如何配戴！很喜歡這串手珠，愛不釋手！',time:'2025/08/27'},
  {name:'qwer2077',city:'',crystal:'黃水晶聚財能量手鍊 9.9mm',stars:5,text:'棒棒的賣家。問題可以得到滿意的答覆。感謝你',time:'2025/07/18'},
  {name:'darkchocolatelucky',city:'',crystal:'靜月之光｜紫金砂手鍊9mm',stars:5,text:'貨運快速 質感很讚',time:'2025/07/16'}
];

let reviewIdx = 0;
function initReviewCarousel(){
  const el = document.getElementById('reviews-carousel');
  if(!el) return;
  function show(){
    const r = REVIEWS[reviewIdx % REVIEWS.length];
    el.style.opacity = '0';
    setTimeout(()=>{
      el.innerHTML = `
        <div class="review-card">
          <div class="review-header">
            <span class="review-stars">${'⭐'.repeat(r.stars)}</span>
            <span class="review-meta">${r.name}${r.city?' · '+r.city:''} · ${r.time}</span>
          </div>
          <p class="review-text">「${r.text}」</p>
          <div class="review-product">
            <span class="tag tag-gold text-xs">購買：${r.crystal}</span>
          </div>
        </div>`;
      el.style.opacity = '1';
      reviewIdx++;
    }, 300);
  }
  show();
  setInterval(show, 6000);
}

/* =============================================================
   FEATURE 6: 商品實拍輪播（框架，等替換照片）
   ============================================================= */

/* =============================================================
   Track divination for achievements
   ============================================================= */
const _origRunAnalysis = typeof runAnalysis === 'function' ? runAnalysis : null;
if(_origRunAnalysis){
  const __origRA = runAnalysis;
  runAnalysis = function(){
    // ── 頂規升級：各系統 enhance 注入 ──
    try { if(S.meihua && typeof enhanceMeihua==='function') enhanceMeihua(S.meihua); } catch(e){}
    try { if(S.tarot && S.tarot.drawn && S.tarot.drawn.length && typeof enhanceTarot==='function') enhanceTarot(S.tarot); } catch(e){}
    try { if(S.nameResult && typeof enhanceName==='function') enhanceName(S.nameResult, S.bazi); } catch(e){}
    __origRA.apply(this, arguments);
    incrementAchievement('divination');
    try{
      const typeEl = document.getElementById('question-type');
      if(typeEl && typeEl.value) incrementAchievement('types_asked', typeEl.value);
    }catch(e){}
    // Refresh badge display
    setTimeout(renderAchievements, 500);
  };
}

/* =============================================================
   Init all engagement features
   ============================================================= */
document.addEventListener('DOMContentLoaded', function(){
  // 延遲初始化：結果頁出現時才渲染重 DOM 功能
  let extraInited = false;
  function initExtraFeatures(){
    if(extraInited) return;
    extraInited = true;
    renderDailyFortune();
    renderAchievements();
    renderCrystalEncyclopedia();
    initReviewCarousel();
    generateLuckyInfo();
    if(typeof renderZiweiFunZone==='function') try{renderZiweiFunZone();}catch(e){}
    if(typeof renderJyotishFunZone==='function') try{renderJyotishFunZone();}catch(e){}
    if(typeof renderNameFunZone==='function') try{renderNameFunZone();}catch(e){}
    if(typeof renderNatalFunZone==='function') try{renderNatalFunZone();}catch(e){}
  }
  // 監聽結果頁出現
  const obs = new IntersectionObserver((entries)=>{
    if(entries[0].isIntersecting){ initExtraFeatures(); obs.disconnect(); }
  },{threshold:0.1});
  const step3 = document.getElementById('step-3');
  if(step3) obs.observe(step3);
  // fallback: 5秒後如果已在結果頁才觸發
  setTimeout(function(){ if(S.bazi) initExtraFeatures(); }, 5000);
  
  // Nav tab switching for new sections
  document.querySelectorAll('.nav-extra-tab').forEach(tab=>{
    tab.addEventListener('click', function(){
      initExtraFeatures(); // 確保點 tab 時已初始化
      const target = this.dataset.target;
      document.querySelectorAll('.extra-section').forEach(s=>s.classList.add('hidden'));
      const section = document.getElementById(target);
      if(section) section.classList.remove('hidden');
      document.querySelectorAll('.nav-extra-tab').forEach(t=>t.classList.remove('active'));
      this.classList.add('active');
      // 特定 tab 需要重新渲染（可能 S.bazi 在 initExtraFeatures 後才就緒）
      if(target==='sec-daily-fortune' && S.bazi && typeof renderDailyFortune==='function') try{renderDailyFortune();}catch(e){}
      if(target==='sec-lucky' && S.bazi) generateLuckyInfo();
      if(target==='sec-jyotish-fun' && S.jyotish && typeof renderJyotishFunZone==='function') try{renderJyotishFunZone();}catch(e){}
      if(target==='sec-name-fun' && S.nameResult && typeof renderNameFunZone==='function') try{renderNameFunZone();}catch(e){}
      if(target==='sec-calendar30' && S.bazi && typeof renderCal30==='function') try{renderCal30();}catch(e){}
      if(target==='sec-aura-filter' && typeof renderAuraFilter==='function') try{renderAuraFilter();}catch(e){}
      if(target==='sec-reviews' && typeof initReviewCarousel==='function') try{initReviewCarousel();}catch(e){}
      section.scrollIntoView({behavior:'smooth',block:'start'});
    });
  });
});
/* =============================================================
   塔羅牌面生成器 — Canvas 繪製 78 張牌面
   ============================================================= */
const TAROT_CARD_SYMBOLS = {
  // 大阿爾卡納 0-21
  0:  {sym:'🃏', color:'#FFD700', bg:'#1a0a30', sub:'0'},
  1:  {sym:'∞',  color:'#FFD700', bg:'#2D0A0A', sub:'I'},
  2:  {sym:'☽',  color:'#C0C0FF', bg:'#0a0a2d', sub:'II'},
  3:  {sym:'♀',  color:'#FFB6C1', bg:'#2D0A1A', sub:'III'},
  4:  {sym:'♂',  color:'#DC143C', bg:'#2D0A0A', sub:'IV'},
  5:  {sym:'✝',  color:'#FFD700', bg:'#1a1a0a', sub:'V'},
  6:  {sym:'♡',  color:'#FF69B4', bg:'#2D0A1A', sub:'VI'},
  7:  {sym:'⚔',  color:'#C0C0C0', bg:'#0a1a2d', sub:'VII'},
  8:  {sym:'∞',  color:'#FFD700', bg:'#2D1A0A', sub:'VIII'},
  9:  {sym:'☆',  color:'#C0C0FF', bg:'#0a0a2d', sub:'IX'},
  10: {sym:'☸',  color:'#FFD700', bg:'#1a0a2d', sub:'X'},
  11: {sym:'⚖',  color:'#FFD700', bg:'#2D0A0A', sub:'XI'},
  12: {sym:'⚓',  color:'#4169E1', bg:'#0a1a2d', sub:'XII'},
  13: {sym:'☠',  color:'#F5F5F5', bg:'#0a0a0a', sub:'XIII'},
  14: {sym:'⚗',  color:'#87CEEB', bg:'#0a2d2d', sub:'XIV'},
  15: {sym:'⛧',  color:'#8B0000', bg:'#0a0a0a', sub:'XV'},
  16: {sym:'⚡',  color:'#FF4500', bg:'#1a0a0a', sub:'XVI'},
  17: {sym:'★',  color:'#FFD700', bg:'#0a0a2d', sub:'XVII'},
  18: {sym:'☾',  color:'#C0C0FF', bg:'#0a0a2d', sub:'XVIII'},
  19: {sym:'☀',  color:'#FFD700', bg:'#2D1A0A', sub:'XIX'},
  20: {sym:'♱',  color:'#FFD700', bg:'#1a0a2d', sub:'XX'},
  21: {sym:'⊕',  color:'#FFD700', bg:'#0a2d0a', sub:'XXI'}
};

// 小阿爾卡納花色
const SUIT_STYLES = {
  '權杖': {sym:'🔥', color:'#FF6347', bg:'#2D0A0A', accent:'#FF4500'},
  '聖杯': {sym:'💧', color:'#4169E1', bg:'#0a0a2d', accent:'#1E90FF'},
  '寶劍': {sym:'⚔',  color:'#C0C0C0', bg:'#1a1a1a', accent:'#A9A9A9'},
  '金幣': {sym:'⬟',  color:'#FFD700', bg:'#1a1a0a', accent:'#DAA520'}
};

const COURT_SYMBOLS = {
  '王牌':'✦','二':'II','三':'III','四':'IV','五':'V',
  '六':'VI','七':'VII','八':'VIII','九':'IX','十':'X',
  '侍者':'👤','騎士':'🐍','皇后':'♛','國王':'♚'
};

function generateTarotCardImage(card){
  const canvas = document.createElement('canvas');
  canvas.width = 180;
  canvas.height = 280;
  const ctx = canvas.getContext('2d');
  
  let style;
  if(card.id <= 21){
    // Major Arcana
    style = TAROT_CARD_SYMBOLS[card.id];
    drawMajorCard(ctx, card, style);
  } else {
    // Minor Arcana
    let suit='', rank='';
    for(const s of ['權杖','聖杯','寶劍','金幣']){
      if(card.n.includes(s)){ suit=s; rank=card.n.replace(s,''); break; }
    }
    style = SUIT_STYLES[suit] || SUIT_STYLES['金幣'];
    drawMinorCard(ctx, card, style, suit, rank);
  }
  
  return canvas.toDataURL('image/png');
}

function drawMajorCard(ctx, card, s){
  const W=180, H=280;
  
  // Background gradient
  const grad = ctx.createLinearGradient(0,0,0,H);
  grad.addColorStop(0, s.bg);
  grad.addColorStop(0.5, lighten(s.bg, 15));
  grad.addColorStop(1, s.bg);
  ctx.fillStyle = grad;
  roundRect(ctx, 0, 0, W, H, 12);
  ctx.fill();
  
  // Border
  ctx.strokeStyle = s.color;
  ctx.lineWidth = 2;
  roundRect(ctx, 3, 3, W-6, H-6, 10);
  ctx.stroke();
  
  // Inner border
  ctx.strokeStyle = 'rgba('+hexToRgb(s.color)+',0.3)';
  ctx.lineWidth = 1;
  roundRect(ctx, 8, 8, W-16, H-16, 8);
  ctx.stroke();
  
  // Decorative corners
  drawCornerDeco(ctx, s.color, W, H);
  
  // Number at top
  ctx.fillStyle = s.color;
  ctx.font = 'bold 16px serif';
  ctx.textAlign = 'center';
  ctx.fillText(s.sub, W/2, 30);
  
  // Main symbol (large)
  ctx.font = '60px serif';
  ctx.fillStyle = s.color;
  ctx.fillText(s.sym, W/2, H/2 - 10);
  
  // Glow effect behind symbol
  ctx.shadowColor = s.color;
  ctx.shadowBlur = 20;
  ctx.fillText(s.sym, W/2, H/2 - 10);
  ctx.shadowBlur = 0;
  
  // Card name at bottom
  ctx.fillStyle = s.color;
  ctx.font = 'bold 18px "Noto Sans TC", sans-serif';
  ctx.fillText(card.n, W/2, H - 40);
  
  // Element
  ctx.font = '12px sans-serif';
  ctx.fillStyle = 'rgba('+hexToRgb(s.color)+',0.6)';
  ctx.fillText(card.el, W/2, H - 20);
}

function drawMinorCard(ctx, card, s, suit, rank){
  const W=180, H=280;
  
  // Background
  const grad = ctx.createLinearGradient(0,0,0,H);
  grad.addColorStop(0, s.bg);
  grad.addColorStop(0.5, lighten(s.bg, 10));
  grad.addColorStop(1, s.bg);
  ctx.fillStyle = grad;
  roundRect(ctx, 0, 0, W, H, 12);
  ctx.fill();
  
  // Border
  ctx.strokeStyle = s.accent;
  ctx.lineWidth = 2;
  roundRect(ctx, 3, 3, W-6, H-6, 10);
  ctx.stroke();
  
  // Inner frame
  ctx.strokeStyle = 'rgba('+hexToRgb(s.accent)+',0.2)';
  ctx.lineWidth = 1;
  roundRect(ctx, 10, 10, W-20, H-20, 6);
  ctx.stroke();
  
  // Corners
  drawCornerDeco(ctx, s.accent, W, H);
  
  // Suit symbol at top
  ctx.font = '24px serif';
  ctx.fillStyle = s.color;
  ctx.textAlign = 'center';
  ctx.fillText(s.sym, W/2, 35);
  
  // Rank in center
  const courtSym = COURT_SYMBOLS[rank] || rank;
  if(['侍者','騎士','皇后','國王'].includes(rank)){
    // Court card: larger symbol
    ctx.font = '48px serif';
    ctx.fillStyle = s.color;
    ctx.fillText(courtSym, W/2, H/2);
    ctx.font = '14px sans-serif';
    ctx.fillStyle = 'rgba('+hexToRgb(s.color)+',0.7)';
    ctx.fillText(rank, W/2, H/2 + 25);
  } else if(rank === '王牌'){
    // Ace: big symbol
    ctx.font = '64px serif';
    ctx.shadowColor = s.color;
    ctx.shadowBlur = 15;
    ctx.fillStyle = s.color;
    ctx.fillText(s.sym, W/2, H/2 + 5);
    ctx.shadowBlur = 0;
  } else {
    // Number cards: draw pip pattern
    const num = ['二','三','四','五','六','七','八','九','十'].indexOf(rank) + 2;
    drawPips(ctx, s.sym, s.color, W, H, num || 1);
  }
  
  // Card name at bottom
  ctx.fillStyle = s.color;
  ctx.font = 'bold 16px "Noto Sans TC", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(card.n, W/2, H - 38);
  
  // Suit name
  ctx.font = '11px sans-serif';
  ctx.fillStyle = 'rgba('+hexToRgb(s.color)+',0.5)';
  ctx.fillText(suit+'牌組', W/2, H - 20);
}

function drawPips(ctx, sym, color, W, H, count){
  ctx.font = '22px serif';
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  
  // Pip positions for 2-10
  const cx = W/2, cy = H/2;
  const positions = {
    2: [[cx,cy-30],[cx,cy+30]],
    3: [[cx,cy-35],[cx,cy],[cx,cy+35]],
    4: [[cx-25,cy-25],[cx+25,cy-25],[cx-25,cy+25],[cx+25,cy+25]],
    5: [[cx-25,cy-25],[cx+25,cy-25],[cx,cy],[cx-25,cy+25],[cx+25,cy+25]],
    6: [[cx-25,cy-30],[cx+25,cy-30],[cx-25,cy],[cx+25,cy],[cx-25,cy+30],[cx+25,cy+30]],
    7: [[cx-25,cy-35],[cx+25,cy-35],[cx-25,cy],[cx,cy],[cx+25,cy],[cx-25,cy+35],[cx+25,cy+35]],
    8: [[cx-25,cy-40],[cx+25,cy-40],[cx-25,cy-13],[cx+25,cy-13],[cx-25,cy+13],[cx+25,cy+13],[cx-25,cy+40],[cx+25,cy+40]],
    9: [[cx-25,cy-40],[cx+25,cy-40],[cx-25,cy-13],[cx+25,cy-13],[cx,cy],[cx-25,cy+13],[cx+25,cy+13],[cx-25,cy+40],[cx+25,cy+40]],
    10:[[cx-25,cy-45],[cx+25,cy-45],[cx-25,cy-18],[cx+25,cy-18],[cx,cy-8],[cx,cy+12],[cx-25,cy+22],[cx+25,cy+22],[cx-25,cy+48],[cx+25,cy+48]]
  };
  
  const pts = positions[count] || positions[2];
  pts.forEach(([x,y]) => ctx.fillText(sym, x, y+6));
}

function drawCornerDeco(ctx, color, W, H){
  ctx.strokeStyle = 'rgba('+hexToRgb(color)+',0.4)';
  ctx.lineWidth = 1;
  const d = 18;
  // Top-left
  ctx.beginPath(); ctx.moveTo(14,14+d); ctx.lineTo(14,14); ctx.lineTo(14+d,14); ctx.stroke();
  // Top-right
  ctx.beginPath(); ctx.moveTo(W-14-d,14); ctx.lineTo(W-14,14); ctx.lineTo(W-14,14+d); ctx.stroke();
  // Bottom-left
  ctx.beginPath(); ctx.moveTo(14,H-14-d); ctx.lineTo(14,H-14); ctx.lineTo(14+d,H-14); ctx.stroke();
  // Bottom-right
  ctx.beginPath(); ctx.moveTo(W-14-d,H-14); ctx.lineTo(W-14,H-14); ctx.lineTo(W-14,H-14-d); ctx.stroke();
}

// roundRect 定義在上方（水晶推薦卡片區塊）

function hexToRgb(hex){
  hex = hex.replace('#','');
  if(hex.length===3) hex=hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
  const r=parseInt(hex.substring(0,2),16);
  const g=parseInt(hex.substring(2,4),16);
  const b=parseInt(hex.substring(4,6),16);
  return r+','+g+','+b;
}

function lighten(hex, amt){
  hex = hex.replace('#','');
  if(hex.length===3) hex=hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
  let r=parseInt(hex.substring(0,2),16);
  let g=parseInt(hex.substring(2,4),16);
  let b=parseInt(hex.substring(4,6),16);
  r=Math.min(255,r+amt); g=Math.min(255,g+amt); b=Math.min(255,b+amt);
  return '#'+r.toString(16).padStart(2,'0')+g.toString(16).padStart(2,'0')+b.toString(16).padStart(2,'0');
}

// Cache generated card images
const _tarotImageCache = {};
function getTarotCardImage(card){
  if(!_tarotImageCache[card.id]){
    _tarotImageCache[card.id] = generateTarotCardImage(card);
  }
  return _tarotImageCache[card.id];
}

/* =============================================================
   命理小遊戲 1: 五行猜猜看
   ============================================================= */
const WUXING_QUIZ_BANK = [
  {q:'「甲」屬於哪個五行？',a:'木',opts:['金','木','水','火','土']},
  {q:'「丙」屬於哪個五行？',a:'火',opts:['金','木','水','火','土']},
  {q:'「庚」屬於哪個五行？',a:'金',opts:['金','木','水','火','土']},
  {q:'「壬」屬於哪個五行？',a:'水',opts:['金','木','水','火','土']},
  {q:'「己」屬於哪個五行？',a:'土',opts:['金','木','水','火','土']},
  {q:'木生什麼？',a:'火',opts:['金','木','水','火','土']},
  {q:'火生什麼？',a:'土',opts:['金','木','水','火','土']},
  {q:'金生什麼？',a:'水',opts:['金','木','水','火','土']},
  {q:'水生什麼？',a:'木',opts:['金','木','水','火','土']},
  {q:'土生什麼？',a:'金',opts:['金','木','水','火','土']},
  {q:'水克什麼？',a:'火',opts:['金','木','水','火','土']},
  {q:'木克什麼？',a:'土',opts:['金','木','水','火','土']},
  {q:'火克什麼？',a:'金',opts:['金','木','水','火','土']},
  {q:'金克什麼？',a:'木',opts:['金','木','水','火','土']},
  {q:'土克什麼？',a:'水',opts:['金','木','水','火','土']},
  {q:'子時是幾點到幾點？',a:'23-01',opts:['23-01','01-03','05-07','11-13']},
  {q:'午時是幾點到幾點？',a:'11-13',opts:['09-11','11-13','13-15','07-09']},
  {q:'寅時是幾點到幾點？',a:'03-05',opts:['01-03','03-05','05-07','07-09']},
  {q:'紫水晶屬於哪個五行？',a:'火',opts:['金','木','水','火','土']},
  {q:'黃水晶屬於哪個五行？',a:'土',opts:['金','木','水','火','土']},
  {q:'綠幽靈屬於哪個五行？',a:'木',opts:['金','木','水','火','土']},
  {q:'海藍寶屬於哪個五行？',a:'水',opts:['金','木','水','火','土']},
  {q:'鈦晶屬於哪個五行？',a:'金',opts:['金','木','水','火','土']},
  {q:'「比肩」的十神關係是？',a:'同我',opts:['生我','同我','我生','我克','克我']},
  {q:'「正財」的十神關係是？',a:'我克',opts:['生我','同我','我生','我克','克我']},
  {q:'塔羅牌「愚者」的編號是？',a:'0',opts:['0','1','21','22']},
  {q:'塔羅大牌共有幾張？',a:'22',opts:['20','21','22','78']},
  {q:'八字的「日主」指的是？',a:'日柱天干',opts:['年柱天干','月柱天干','日柱天干','時柱天干']},
  {q:'「坤」卦代表什麼？',a:'地',opts:['天','地','水','火']},
  {q:'「乾」卦代表什麼？',a:'天',opts:['天','地','山','澤']}
];

let wxGame = {score:0, total:0, current:null, answered:false};

function startWuxingGame(){
  wxGame = {score:0, total:0, current:null, answered:false, questions:[]};
  // Pick 5 random questions
  const shuffled = [...WUXING_QUIZ_BANK].sort(()=>Math.random()-0.5);
  wxGame.questions = shuffled.slice(0, 5);
  nextWuxingQ();
}

function nextWuxingQ(){
  const container = document.getElementById('wuxing-game-content');
  if(!container) return;
  
  if(wxGame.total >= wxGame.questions.length){
    showWuxingResult();
    return;
  }
  
  wxGame.answered = false;
  wxGame.current = wxGame.questions[wxGame.total];
  const q = wxGame.current;
  
  container.innerHTML = `
    <div class="game-progress">第 ${wxGame.total+1}/${wxGame.questions.length} 題　得分：${wxGame.score}</div>
    <h4 class="game-question">${q.q}</h4>
    <div class="game-options">${q.opts.map(o=>`
      <button class="game-opt" onclick="answerWuxing('${o}',this)">${o}</button>`).join('')}
    </div>
    <div id="game-feedback" class="game-feedback"></div>`;
}

function answerWuxing(ans, btn){
  if(wxGame.answered) return;
  wxGame.answered = true;
  
  const correct = ans === wxGame.current.a;
  if(correct) wxGame.score++;
  wxGame.total++;
  
  // Highlight
  btn.classList.add(correct ? 'correct' : 'wrong');
  document.querySelectorAll('.game-opt').forEach(b=>{
    b.disabled = true;
    if(b.textContent === wxGame.current.a) b.classList.add('correct');
  });
  
  const fb = document.getElementById('game-feedback');
  fb.innerHTML = correct 
    ? '<span class="fb-correct">✅ 正確！</span>'
    : `<span class="fb-wrong">❌ 答案是「${wxGame.current.a}」</span>`;
  
  setTimeout(nextWuxingQ, 1200);
}

function showWuxingResult(){
  const container = document.getElementById('wuxing-game-content');
  if(!container) return;
  const pct = Math.round(wxGame.score / wxGame.questions.length * 100);
  let title, msg;
  if(pct >= 80){ title='🏆 命理達人'; msg='你對五行的掌握非常厲害！'; }
  else if(pct >= 60){ title='📚 用功學生'; msg='基礎不錯，再練練就更強了！'; }
  else if(pct >= 40){ title='🌱 命理新手'; msg='繼續學習，五行世界很有趣！'; }
  else{ title='🔰 初來乍到'; msg='多獩幾次就會進步啦！'; }
  
  container.innerHTML = `
    <div class="game-result">
      <div class="game-result-icon">${pct>=60?'🍉':'💪'}</div>
      <h3>${title}</h3>
      <div class="game-score-big">${wxGame.score} / ${wxGame.questions.length}</div>
      <p class="text-dim">${msg}</p>
      <div class="game-actions mt-md">
        <button class="btn btn-gold" onclick="startWuxingGame()"><i class="fas fa-redo"></i> 再獩一次</button>
      </div>
    </div>`;
}

/* =============================================================
   命理小遊戲 2: 每日生肖配對
   ============================================================= */
const ZODIAC_DATA = [
  {name:'鼠',icon:'🐭',el:'水',best:['龍','猴','牛'],avoid:['馬','羊','兔']},
  {name:'牛',icon:'🐂',el:'土',best:['鼠','蛇','雞'],avoid:['馬','羊','狗']},
  {name:'虍',icon:'🐯',el:'木',best:['馬','狗','豬'],avoid:['蛇','猴']},
  {name:'兔',icon:'🐰',el:'木',best:['羊','狗','豬'],avoid:['鼠','龍','雞']},
  {name:'龍',icon:'🐲',el:'土',best:['鼠','猴','雞'],avoid:['狗','兔']},
  {name:'蛇',icon:'🐍',el:'火',best:['牛','雞'],avoid:['虍','豬']},
  {name:'馬',icon:'🐴',el:'火',best:['虍','羊','狗'],avoid:['鼠','牛']},
  {name:'羊',icon:'🐑',el:'土',best:['兔','馬','豬'],avoid:['鼠','牛','狗']},
  {name:'猴',icon:'🐵',el:'金',best:['鼠','龍'],avoid:['虍','豬']},
  {name:'雞',icon:'🐔',el:'金',best:['牛','龍','蛇'],avoid:['兔','狗']},
  {name:'狗',icon:'🐶',el:'土',best:['虍','兔','馬'],avoid:['龍','牛','羊','雞']},
  {name:'豬',icon:'🐷',el:'水',best:['虍','兔','羊'],avoid:['蛇','猴']}
];

function renderZodiacMatch(){
  const container = document.getElementById('zodiac-match-content');
  if(!container) return;
  container.innerHTML = `
    <p class="text-sm text-dim mb-md">選擇兩個生肖，看看配對結果！</p>
    <div class="zodiac-grid">${ZODIAC_DATA.map(z=>`
      <button class="zodiac-btn" onclick="selectZodiac('${z.name}')" data-zodiac="${z.name}">
        <span class="zodiac-icon">${z.icon}</span>
        <span class="zodiac-name">${z.name}</span>
      </button>`).join('')}
    </div>
    <div id="zodiac-selected" class="zodiac-selected mt-md"></div>
    <div id="zodiac-result-area" class="mt-md"></div>`;
}

let zodiacPair = [];
function selectZodiac(name){
  if(zodiacPair.length >= 2) zodiacPair = [];
  zodiacPair.push(name);
  
  // Highlight
  document.querySelectorAll('.zodiac-btn').forEach(b=>{
    b.classList.toggle('selected', zodiacPair.includes(b.dataset.zodiac));
  });
  
  const selEl = document.getElementById('zodiac-selected');
  selEl.textContent = zodiacPair.join(' ❤️ ');
  
  if(zodiacPair.length === 2){
    showZodiacResult(zodiacPair[0], zodiacPair[1]);
  }
}

function showZodiacResult(a, b){
  const zA = ZODIAC_DATA.find(z=>z.name===a);
  const zB = ZODIAC_DATA.find(z=>z.name===b);
  if(!zA || !zB) return;
  
  let score, level, desc;
  if(zA.best.includes(b) && zB.best.includes(a)){
    score = 95; level = '天生一對 💕'; desc = `${a}與${b}是命理上的絕佳配對！彼此互補，感情和諧。`;
  } else if(zA.best.includes(b) || zB.best.includes(a)){
    score = 80; level = '相合有緣 ✨'; desc = `${a}與${b}有不錯的緣分，相處愉快，值得珍惜。`;
  } else if(zA.avoid.includes(b) || zB.avoid.includes(a)){
    score = 35; level = '需要磨合 ⚡'; desc = `${a}與${b}在傳統命理上有些沖突，但真愛可以跨越一切，多包容多理解就好。`;
  } else {
    score = 65; level = '平穩中性 ☁️'; desc = `${a}與${b}不特別沖也不特別合，關鍵看兩人的經營。`;
  }

  // ── 【升級H】加入五行生剋深層分析 ──
  var deepAnalysis = '';
  try{
    var _SHENG = {'木':'火','火':'土','土':'金','金':'水','水':'木'};
    var _KE = {'木':'土','土':'水','水':'火','火':'金','金':'木'};
    var elA = zA.el, elB = zB.el;
    if(elA === elB){
      deepAnalysis += '<p style="font-size:.82rem;margin:.3rem 0">🤝 <strong>五行比和</strong>：同屬'+elA+'行，個性相近容易理解彼此，但也容易缺乏互補。</p>';
    } else if(_SHENG[elA] === elB){
      deepAnalysis += '<p style="font-size:.82rem;margin:.3rem 0">💚 <strong>'+elA+'生'+elB+'</strong>：'+a+'天生願意付出給'+b+'，是滋養型的關係。注意不要變成單方面消耗。</p>';
      score += 5;
    } else if(_SHENG[elB] === elA){
      deepAnalysis += '<p style="font-size:.82rem;margin:.3rem 0">💚 <strong>'+elB+'生'+elA+'</strong>：'+b+'天生願意照顧'+a+'，是被滋養的關係。記得回饋感恩。</p>';
      score += 5;
    } else if(_KE[elA] === elB){
      deepAnalysis += '<p style="font-size:.82rem;margin:.3rem 0">⚡ <strong>'+elA+'剋'+elB+'</strong>：'+a+'對'+b+'有壓制的能量，可能不自覺地控制對方。需要學會尊重。</p>';
      score -= 5;
    } else if(_KE[elB] === elA){
      deepAnalysis += '<p style="font-size:.82rem;margin:.3rem 0">⚡ <strong>'+elB+'剋'+elA+'</strong>：'+b+'對'+a+'有壓制的能量。'+a+'容易感到被限制。溝通是解方。</p>';
      score -= 5;
    }

    // 如果使用者有八字，加入日柱合婚分析
    if(S.bazi){
      var _myZhi = S.bazi.pillars.day.zhi;
      var _myGan = S.bazi.dm;
      // 六合：子丑、寅亥、卯戌、辰酉、巳申、午未
      var _LH2 = {'子':'丑','丑':'子','寅':'亥','卯':'戌','辰':'酉','巳':'申','午':'未','未':'午','申':'巳','酉':'辰','戌':'卯','亥':'寅'};
      // 生肖→地支
      var _zodiacZhi = {'鼠':'子','牛':'丑','虎':'寅','兔':'卯','龍':'辰','蛇':'巳','馬':'午','羊':'未','猴':'申','雞':'酉','狗':'戌','豬':'亥'};
      var _partnerZhi = _zodiacZhi[b];
      if(_partnerZhi){
        if(_LH2[_myZhi] === _partnerZhi){
          deepAnalysis += '<p style="font-size:.82rem;margin:.3rem 0;color:#4ade80">✨ <strong>日支六合</strong>：你的日柱地支跟'+b+'年生人六合，代表日常相處默契好、互相吸引。這是合婚中的大加分！</p>';
          score += 10;
        }
        var _LC2 = {'子':'午','午':'子','丑':'未','未':'丑','寅':'申','申':'寅','卯':'酉','酉':'卯','辰':'戌','戌':'辰','巳':'亥','亥':'巳'};
        if(_LC2[_myZhi] === _partnerZhi){
          deepAnalysis += '<p style="font-size:.82rem;margin:.3rem 0;color:#f87171">⚠ <strong>日支相沖</strong>：你的日柱地支跟'+b+'年生人沖，代表觀念差異大、容易爭執。需要更多包容。</p>';
          score -= 8;
        }
      }

      // 命盤夫妻宮分析
      var _fqP = typeof readPalace==='function' ? readPalace('夫妻') : null;
      if(_fqP){
        if(_fqP.huaLu) deepAnalysis += '<p style="font-size:.82rem;margin:.3rem 0">💕 你的夫妻宮化祿，感情運底子好，配對的磨合會比較順利。</p>';
        if(_fqP.huaJi) deepAnalysis += '<p style="font-size:.82rem;margin:.3rem 0">⚡ 你的夫妻宮化忌，不管跟誰配對，感情上都有需要面對的功課。</p>';
        if(_fqP.hasSha) deepAnalysis += '<p style="font-size:.82rem;margin:.3rem 0">⚡ 夫妻宮有煞星，感情路上容易有突發狀況，配對需更謹慎。</p>';
      }

      // 西洋星盤：金星+第七宮
      if(S.natal && S.natal.planets){
        var _venus = S.natal.planets['金星'];
        if(_venus){
          var _venusHouseLabel = {1:'自我',2:'財富',3:'溝通',4:'家庭',5:'戀愛',6:'服務',7:'伴侶',8:'轉化',9:'遠方',10:'事業',11:'社群',12:'靈性'}[_venus.house]||'';
          deepAnalysis += '<p style="font-size:.82rem;margin:.3rem 0">💎 星盤金星在'+_venus.sign+'（第'+_venus.house+'宮・'+_venusHouseLabel+'），';
          if([5,7].includes(_venus.house)) deepAnalysis += '金星落在桃花宮位，你天生有吸引力，配對成功率較高。</p>';
          else if([1,11].includes(_venus.house)) deepAnalysis += '你的魅力容易被注意到，社交場合容易遇到對象。</p>';
          else if([12,8].includes(_venus.house)) deepAnalysis += '你的感情偏隱密或深層，配對需要更多時間建立信任。</p>';
          else deepAnalysis += '感情觀穩定踏實。</p>';
        }
      }

      // 吠陀占星：七宮主星+金星狀態
      if(S.jyotish){
        var _jy7 = S.jyotish;
        if(_jy7.planets && _jy7.planets['Venus']){
          var _jyVenus = _jy7.planets['Venus'];
          var _jyVDig = {'exalted':'入廟（感情福報深厚）','own':'自宮（感情觀成熟）','friend':'友善（感情順暢）','debilitated':'落陷（感情需修練）','enemy':'敵對（感情易有挑戰）'}[_jyVenus.dignity]||'';
          if(_jyVDig) deepAnalysis += '<p style="font-size:.82rem;margin:.3rem 0">🕉️ 吠陀金星'+_jyVDig+'，這是你感情底盤的先天力量。</p>';
        }
      }
    }
    score = Math.max(10, Math.min(99, score));
  }catch(e){}
  
  const resultEl = document.getElementById('zodiac-result-area');
  resultEl.innerHTML = `
    <div class="zodiac-result card" style="animation:scaleIn 0.4s">
      <div class="zodiac-pair-icons">${zA.icon} ❤️ ${zB.icon}</div>
      <div class="zodiac-match-score">${score}%</div>
      <div class="zodiac-match-level">${level}</div>
      <p class="text-sm">${desc}</p>
      ${deepAnalysis}
      <p class="text-xs text-muted mt-sm">五行：${a}(${zA.el}) × ${b}(${zB.el})</p>
      ${S.bazi ? '<p class="text-xs text-dim mt-xs">💡 以上分析已結合你的個人八字命盤</p>' : ''}
      <button class="btn btn-outline btn-sm mt-md" onclick="shareZodiacMatch('${a}','${b}','${score}')">
        <i class="fas fa-share-alt"></i> 分享配對結果
      </button>
    </div>`;
}

function shareZodiacMatch(a, b, score){
  const text = `${a} ❤️ ${b} 配對指數 ${score}%！你跟誰配？快來測 👉 `;
  const url = SITE_URL;
  if(navigator.share) navigator.share({title:'生肖配對',text,url}).catch(()=>{});
  else { navigator.clipboard.writeText(text+url).then(()=>alert('已複製！')); }
}

/* =============================================================
   命理小遊戲 3: 今日幸運指南（依命主五行喜用神）
   ============================================================= */
function generateLuckyInfo(){
  const container = document.getElementById('lucky-gen-content');
  if(!container) return;

  // 必須先填寫基本資料
  if(!S.bazi){
    container.innerHTML = `
      <div class="fortune-draw-area">
        <div style="font-size:2.5rem;margin-bottom:var(--sp-sm);opacity:0.5">🔒</div>
        <p class="text-dim" style="margin-bottom:var(--sp-md)">需要先完成基本資料（生日時辰），才能依你的五行喜用神算出今日幸運指南</p>
        <button class="btn btn-primary" onclick="goStep(0);window.scrollTo({top:0,behavior:'smooth'})">
          <i class="fas fa-pen"></i> 前往填寫資料
        </button>
      </div>`;
    return;
  }

  const b = S.bazi;
  const today = new Date();
  const dayOfWeek = ['日','一','二','三','四','五','六'][today.getDay()];
  const todayGZ = getTodayGanZhi();

  // 依喜用神五行推薦顏色
  const favEl = b.fav[0] || b.dmEl;
  const favEl2 = b.fav[1] || b.dmEl;

  const colorsByEl = {
    '金': [{name:'白色',hex:'#f5f5f5',meaning:'金行正色，淨化氣場'},{name:'金色',hex:'#d4af37',meaning:'強化權威與成就'},{name:'銀色',hex:'#94a3b8',meaning:'冷靜理性，金行守護'}],
    '木': [{name:'綠色',hex:'#16a34a',meaning:'木行正色，健康成長'},{name:'青色',hex:'#06b6d4',meaning:'生發之力，貴人能量'},{name:'翠綠',hex:'#059669',meaning:'木行生機盎然'}],
    '水': [{name:'黑色',hex:'#1a1a1a',meaning:'水行正色，保護穩重'},{name:'藍色',hex:'#2563eb',meaning:'智慧溝通，水行流通'},{name:'深藍',hex:'#1e3a5f',meaning:'深沉內斂，水行蓄能'}],
    '火': [{name:'紅色',hex:'#dc2626',meaning:'火行正色，熱情行動力'},{name:'紫色',hex:'#9333ea',meaning:'靈性直覺，火行昇華'},{name:'橙色',hex:'#ea580c',meaning:'活力創造，火行擴展'}],
    '土': [{name:'黃色',hex:'#eab308',meaning:'土行正色，財運自信'},{name:'棕色',hex:'#92400e',meaning:'踏實安定，土行厚德'},{name:'米色',hex:'#d2b48c',meaning:'溫和穩重，土行包容'}]
  };

  const dayHash = today.getDate() + today.getMonth()*31;
  const favColors = colorsByEl[favEl] || colorsByEl['土'];
  const luckyColor = favColors[dayHash % favColors.length];

  // 幸運數字：依五行生數
  const elNums = {'木':[3,8],'火':[2,7],'土':[5,10],'金':[4,9],'水':[1,6]};
  const nums = elNums[favEl] || [5,10];
  const luckyNum = nums[dayHash % nums.length];

  // 幸運方位：依喜用神五行
  const elDirs = {'木':'東方','火':'南方','土':'中宮','金':'西方','水':'北方'};
  const elDirs2 = {'木':'東南','火':'西南','土':'東北','金':'西北','水':'正北'};
  const luckyDir = dayHash % 2 === 0 ? elDirs[favEl] : (elDirs2[favEl] || elDirs[favEl]);

  // 最佳時辰：依喜用神五行旺的時辰
  const elTimes = {
    '木': ['寅時(03-05)','卯時(05-07)'],
    '火': ['巳時(09-11)','午時(11-13)'],
    '土': ['辰時(07-09)','未時(13-15)','戌時(19-21)','丑時(01-03)'],
    '金': ['申時(15-17)','酉時(17-19)'],
    '水': ['亥時(21-23)','子時(23-01)']
  };
  const times = elTimes[favEl] || ['辰時(07-09)'];
  const luckyTime = times[dayHash % times.length];

  // 幸運水晶（依喜用神五行）
  const elCrystals = {
    '金': ['白水晶','鈦晶','銀髮晶'],
    '木': ['綠幽靈','東陵玉','橄欖石'],
    '水': ['海藍寶','月光石','藍玉髓'],
    '火': ['紅瑪瑙','紫水晶','石榴石'],
    '土': ['黃水晶','茶晶','虎眼石']
  };
  const crystals = elCrystals[favEl] || ['黃水晶'];
  const luckyCrystal = crystals[dayHash % crystals.length];

  // ═══ 每日靈氣脈輪動態處方（流日五行 vs 喜用神）═══
  const _elChakra={
    '木':{chakra:'心輪',color:'綠色/粉色',domain:'情感、包容、人際關係',symptom:'人際疏離、冷漠感',icon:'💚'},
    '火':{chakra:'海底輪/臍輪',color:'紅色/橘色',domain:'行動力、熱情、創造力',symptom:'動力枯竭、焦慮不安',icon:'❤️‍🔥'},
    '土':{chakra:'太陽神經叢',color:'黃色/棕色',domain:'自信、意志力、財富轉化',symptom:'自我懷疑、腸胃不適',icon:'💛'},
    '金':{chakra:'頂輪',color:'白色/金色',domain:'邏輯、秩序、靈性連結',symptom:'思維混亂、無法專注',icon:'🤍'},
    '水':{chakra:'喉輪/眉心輪',color:'藍色/靛色',domain:'溝通、表達、直覺',symptom:'表達困難、判斷模糊',icon:'💙'}
  };
  const _dayEl=todayGZ.dayEl||'土';
  const _favChakra=_elChakra[favEl]||_elChakra['土'];
  const _dayChakra=_elChakra[_dayEl]||_elChakra['土'];
  const _keCheck={'木':'土','土':'水','水':'火','火':'金','金':'木'};
  const _isDayFav=_dayEl===favEl;
  const _isDayClash=_keCheck[_dayEl]===favEl; // 流日剋喜用
  const _shengCheck={'木':'火','火':'土','土':'金','金':'水','水':'木'};
  const _isPassEl=_shengCheck[_dayEl]===favEl?_dayEl:''; // 通關五行

  let chakraText='';
  let chakraRx='';
  if(_isDayFav){
    chakraText=`今日宇宙能量為<strong>${_dayEl}行</strong>，精準啟動你的<strong>${_favChakra.chakra}</strong>（${_favChakra.domain}）。能量平穩順暢。`;
    chakraRx=`配戴 ${luckyCrystal} 來放大今日${_dayEl}行優勢。`;
  } else if(_isDayClash){
    chakraText=`今日大環境的<strong style="color:#f87171">${_dayEl}行</strong>能量極強，壓迫你的<strong>${_favChakra.chakra}</strong>。你可能感到${_favChakra.symptom}。`;
    const passEl=_isPassEl||favEl;
    const passCrystals=elCrystals[passEl]||crystals;
    chakraRx=`<strong style="color:#fbbf24">強烈建議</strong>配戴 ${passCrystals[dayHash%passCrystals.length]} 建立能量護盾。`;
  } else {
    chakraText=`今日${_dayEl}行能量主導<strong>${_dayChakra.chakra}</strong>（${_dayChakra.domain}），與你的${favEl}行互不衝突。`;
    chakraRx=`日常配戴 ${luckyCrystal} 維持平衡即可。`;
  }

  container.innerHTML = `
    <div class="lucky-card" style="animation:scaleIn 0.4s">
      <h4 class="text-gold mb-sm">📅 星期${dayOfWeek}的專屬幸運指南</h4>
      <p class="text-xs text-dim mb-md">依據你的八字喜用神【${b.fav.join('、')}行】× 今日流日干支【${todayGZ.dayGan}${todayGZ.dayZhi}・${_dayEl}行】計算</p>
      ${(function(){
        var extras=[];
        try{
          if(S.ziwei&&S.ziwei.daXian){
            var _dx=S.ziwei.daXian.find(function(d){return d.isCurrent;});
            if(_dx) extras.push('紫微大限走「'+_dx.palaceName+'」宮（'+_dx.level+'）');
          }
          if(S.jyotish&&S.jyotish.currentMD){
            var _md=S.jyotish.currentMD;
            var _mdPl=S.jyotish.planets[_md.lord];
            var _mdDig=_mdPl?({'exalted':'入廟','own':'自宮','debilitated':'落陷'}[_mdPl.dignity]||''):'';
            extras.push('吠陀走'+_md.zh+'大運'+ (_mdDig?'（'+_mdDig+'）':''));
          }
          if(S.natal&&S.natal.planets){
            var _moon=S.natal.planets['月亮'];
            if(_moon) extras.push('月亮'+_moon.sign+'座');
          }
        }catch(e){}
        return extras.length?'<p class="text-xs text-dim" style="margin-top:-.3rem;margin-bottom:.5rem">'+extras.join(' · ')+'</p>':'';
      })()}
      <div class="lucky-grid">
        <div class="lucky-item">
          <div class="lucky-label">幸運色</div>
          <div class="lucky-value">
            <span class="lucky-color-dot" style="background:${luckyColor.hex}"></span>
            ${luckyColor.name}
          </div>
          <div class="lucky-sub">${favEl}行 · ${luckyColor.meaning}</div>
        </div>
        <div class="lucky-item">
          <div class="lucky-label">幸運數字</div>
          <div class="lucky-value lucky-num">${luckyNum}</div>
          <div class="lucky-sub">${favEl}行生數</div>
        </div>
        <div class="lucky-item">
          <div class="lucky-label">幸運方位</div>
          <div class="lucky-value">🧭 ${luckyDir}</div>
          <div class="lucky-sub">${favEl}行方位</div>
        </div>
        <div class="lucky-item">
          <div class="lucky-label">最佳時辰</div>
          <div class="lucky-value">⏰ ${luckyTime}</div>
          <div class="lucky-sub">${favEl}行旺時</div>
        </div>
        <div class="lucky-item">
          <div class="lucky-label">幸運水晶</div>
          <div class="lucky-value">💎 ${luckyCrystal}</div>
          <div class="lucky-sub">${favEl}行水晶</div>
        </div>
        <div class="lucky-item">
          <div class="lucky-label">今日干支</div>
          <div class="lucky-value">${todayGZ.dayGan}${todayGZ.dayZhi}</div>
          <div class="lucky-sub">${_dayEl}行日${_isDayFav?' ✅ 順風':_isDayClash?' ⚠ 逆風':''}</div>
        </div>
      </div>
      <div style="margin-top:.6rem;padding:.5rem .8rem;background:${_isDayClash?'rgba(248,113,113,.08)':'rgba(212,175,55,.06)'};border-left:3px solid ${_isDayClash?'#f87171':'var(--c-gold)'};border-radius:0 6px 6px 0;font-size:.78rem;line-height:1.6">
        <p>${_favChakra.icon} <strong>今日脈輪處方</strong></p>
        <p style="margin:3px 0">${chakraText}</p>
        <p style="margin:3px 0">${chakraRx}</p>
      </div>
      ${(function(){
        try{
          // 新邏輯：優先用 unified engine 的 topTags 跨系統訊號，fallback 才用 build7D 白話
          if(typeof S!=='undefined'&&S._uResult&&S._uResult.comb&&S._uResult.comb.topTags&&S._uResult.comb.topTags.length>0){
            var _tags=S._uResult.comb.topTags.slice(0,4);
            var _tagHtml=_tags.map(function(t){
              var dir=t.direction==='pos'?'color:#4ade80':t.direction==='neg'?'color:#f87171':'color:#94a3b8';
              var sys=t.supportSystems&&t.supportSystems.length>1?'['+t.supportSystems.join('+')+'共振]':'['+t.supportSystems.join('')+']';
              return '<span style="'+dir+';margin-right:.4rem">'+t.tag+'</span><span style="font-size:.72rem;color:#64748b">'+sys+'</span>';
            }).join('<br>');
            return '<details style="margin-top:.5rem"><summary style="cursor:pointer;font-size:.8rem;color:var(--c-gold);padding:.3rem 0;font-weight:600">🔗 多系統象徵交集</summary><div style="font-size:.78rem;line-height:1.9;padding:.4rem .6rem;border-left:2px solid rgba(212,175,55,.2);margin-top:.2rem">'+_tagHtml+'</div></details>';
          }
          if(typeof build7D!=='function'||!S.bazi) return '';
          var _7L=build7D(S.bazi, S.meihua||null, S.tarot||null, 'general');
          var _pL=_7L.parts.filter(function(p){return p&&p.length>5;});
          if(!_pL.length) return '';
          return '<details style="margin-top:.5rem"><summary style="cursor:pointer;font-size:.8rem;color:var(--c-gold);padding:.3rem 0;font-weight:600">📊 命盤解讀</summary><div style="font-size:.78rem;color:var(--c-text-dim);line-height:1.7;padding:.4rem .6rem;border-left:2px solid rgba(212,175,55,.2);margin-top:.2rem">'+_pL.map(function(p){return '<p style="margin:.15rem 0">'+p+'</p>';}).join('')+'</div></details>';
        }catch(e){return '';}
      })()}
      <p class="text-xs text-muted mt-md">每日 00:00 更新 · 依你命盤喜用神 × 流日五行動態推算</p>
    </div>`;
}

/* Init games */
document.addEventListener('DOMContentLoaded', function(){
  renderZodiacMatch();
  generateLuckyInfo();
});

/* =============================================================
   FEATURE: 能量行事曆 + 靈氣濾鏡 v2
   八字×姓名學交叉驗證
   ============================================================= */

/* ── 任意日期干支計算 ── */
function getDateGZ(y,m,d){
  var base=Date.UTC(1900,0,1),tgt=Date.UTC(y,m-1,d);
  var diff=Math.floor((tgt-base)/864e5);
  var dc=((diff+10)%60+60)%60;
  var gi=dc%10,zi=dc%12;
  return{gan:TG[gi],zhi:DZ[zi],el:WX_G[TG[gi]],gi:gi,zi:zi};
}

/* ── 每日運勢計算（八字×姓名學交叉驗證）── */
function computeDateFortune(bazi, dateObj){
  var y=dateObj.getFullYear(), m=dateObj.getMonth()+1, d=dateObj.getDate();
  var gz=getDateGZ(y,m,d);
  var dm=bazi.dm, dmEl=bazi.dmEl;
  var tEl=gz.el, tG=gz.gan, tZ=gz.zhi;
  var dZ=bazi.pillars.day.zhi;
  var score=50;

  var god=tenGod(dm,tG);
  var gs={'比肩':8,'劫財':3,'食神':10,'傷官':2,'偏財':7,'正財':12,'七殺':-8,'正官':5,'偏印':6,'正印':10};
  score+=(gs[god]||0);
  if(bazi.fav.indexOf(tEl)>=0) score+=15;
  if(bazi.unfav.indexOf(tEl)>=0) score-=15;
  var cg=CG[tZ]||[];
  cg.forEach(function(g){
    if(bazi.fav.indexOf(WX_G[g])>=0) score+=4;
    if(bazi.unfav.indexOf(WX_G[g])>=0) score-=4;
  });
  var isChong=!!(LIU_CHONG&&LIU_CHONG[tZ]===dZ);
  var isHe=!!(LIU_HE&&LIU_HE[tZ]===dZ);
  if(isChong) score-=12;
  if(isHe) score+=10;
  var cs=changSheng(dm,tZ);
  var csS={'長生':10,'沐浴':2,'冠帶':6,'臨官':8,'帝旺':12,'衰':-2,'病':-5,'死':-8,'墓':-6,'絕':-10,'胎':1,'養':3};
  score+=(csS[cs]||0);
  var cd=bazi.dayun?bazi.dayun.find(function(x){return x.isCurrent;}):null;
  if(cd){
    if(bazi.fav.indexOf(cd.el)>=0) score+=5;
    if(bazi.unfav.indexOf(cd.el)>=0) score-=5;
  }

  // 紫微流日
  if(typeof S!=='undefined'&&S.ziwei){try{
    var zwBr=['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
    var zwI=zwBr.indexOf(tZ);
    if(zwI>=0&&S.ziwei.palaces&&S.ziwei.palaces[zwI]){
      var tP=S.ziwei.palaces[zwI];
      if(tP.stars.some(function(s){return s.hua==='化祿';})) score+=4;
      if(tP.stars.some(function(s){return s.hua==='化忌';})) score-=4;
      if(tP.stars.filter(function(s){return s.type==='major';}).length>=2) score+=2;
    }
  }catch(e){}}

  // 吠陀月亮行運
  if(typeof S!=='undefined'&&S.jyotish){try{
    var tr=jyCurrentTransits();
    var moonBhava=((tr.Moon.rashiIdx-S.jyotish.lagna.idx+12)%12)+1;
    if([1,2,5,7,9,10,11].indexOf(moonBhava)>=0) score+=4;
    else if([6,8,12].indexOf(moonBhava)>=0) score-=4;
  }catch(e){}}

  // 西洋星盤太陽宮位
  if(typeof S!=='undefined'&&S.natal){try{
    var sunH=S.natal.planets&&S.natal.planets['太陽']?S.natal.planets['太陽'].house:0;
    if([1,5,9,10].indexOf(sunH)>=0) score+=2;
    if([6,8,12].indexOf(sunH)>=0) score-=2;
  }catch(e){}}

  // 姓名學
  if(typeof S!=='undefined'&&S.zodiacNameResult){
    var zn=S.zodiacNameResult;
    if(zn.overallLevel==='大吉') score+=3;
    else if(zn.overallLevel==='吉') score+=1;
    else if(zn.overallLevel&&zn.overallLevel.indexOf('凶')>=0) score-=3;
    if(zn.isSacrifice) score-=2;
  }

  // 新 tag 引擎（修正 direction 'pos'/'neg'，移除舊 'positive'/'negative' 死碼）
  var tagBonus=0;
  var tagSrcs=[];
  try{ tagSrcs.push(analyzeBaziTags(bazi,'general')); }catch(e){}
  try{ if(typeof S!=='undefined'&&S.ziwei) tagSrcs.push(analyzeZiweiTags(S.ziwei,'general')); }catch(e){}
  try{ if(typeof S!=='undefined'&&S.natal) tagSrcs.push(analyzeNatalTags(S.natal,'general')); }catch(e){}
  try{ if(typeof S!=='undefined'&&S.jyotish) tagSrcs.push(analyzeJyotishTags(S.jyotish,'general')); }catch(e){}
  try{
    var _nr=typeof S!=='undefined'?S.nameResult:null;
    var _znr=typeof S!=='undefined'?S.zodiacNameResult:null;
    if(_nr||_znr) tagSrcs.push(analyzeNameTags(_nr,_znr,'general'));
  }catch(e){}
  tagSrcs.forEach(function(tags){
    if(!tags||!tags.length) return;
    tags.forEach(function(t){
      var w=t.weight||1;
      if(t.direction==='pos') tagBonus+=w*0.6;
      else if(t.direction==='neg') tagBonus-=w*0.6;
    });
  });
  score+=Math.max(-12,Math.min(12,tagBonus));
  score=Math.max(10,Math.min(95,score));

  var sign,icon,cls;
  if(score>=85){sign='上上籤';icon='\u{1F31F}';cls='lv5';}
  else if(score>=75){sign='大吉';icon='\u{1F34A}';cls='lv4';}
  else if(score>=65){sign='上吉';icon='\u2728';cls='lv3';}
  else if(score>=55){sign='中吉';icon='\u{1F319}';cls='lv2';}
  else if(score>=45){sign='小吉';icon='\u26C5';cls='lv2';}
  else if(score>=35){sign='中平';icon='\u2601';cls='lv1';}
  else if(score>=25){sign='小凶';icon='\u{1F30A}';cls='lv0';}
  else{sign='凶';icon='\u26A1';cls='lvN';}

  var godTip={'比肩':'適合團隊合作','劫財':'守財為上','食神':'靈感充沛適合創作','傷官':'說話前三思',
    '偏財':'可小試投資','正財':'適合處理帳務','七殺':'注意與上司互動','正官':'貴人運佳',
    '偏印':'適合研究靜心','正印':'學習運強'};
  var csTip={'長生':'精神飽滿適合開新局','帝旺':'能量巔峰勿過度冒險','死':'能量低谷宜靜','絕':'低潮保守行事'};
  var tipParts=[];
  if(godTip[god]) tipParts.push(god+'日：'+godTip[god]);
  if(isChong) tipParts.push('\u26a0 日支逢沖，情緒波動大');
  if(isHe) tipParts.push('\u2713 日支逢合，人際和諧');
  if(csTip[cs]) tipParts.push(csTip[cs]);
  var tip=tipParts.slice(0,3).join('。')+'。';

  var godYJ={'比肩':{yi:'合作・社交',ji:'借貸'},'劫財':{yi:'競爭・突破',ji:'投資'},
    '食神':{yi:'約會・創作',ji:'爭論'},'傷官':{yi:'創新改革',ji:'簽約'},
    '偏財':{yi:'投資・業務',ji:'保守理財'},'正財':{yi:'收帳・談判',ji:'冒險投機'},
    '七殺':{yi:'健身・挑戰',ji:'衝動消費'},'正官':{yi:'面試・正式場合',ji:'遲到'},
    '偏印':{yi:'學習・靜心',ji:'衝動行動'},'正印':{yi:'讀書・養生',ji:'激進改變'}};
  var yj=godYJ[god]||{yi:'順其自然',ji:'急躁'};

  var _28XS=['角','亢','氐','房','心','尾','箕','斗','牛','女','虛','危','室','壁','奎','婁','胃','昴','畢','觜','參','井','鬼','柳','星','張','翼','軫'];
  var _28L=['吉','凶','凶','吉','凶','吉','吉','吉','凶','凶','凶','凶','吉','吉','凶','吉','吉','凶','吉','凶','吉','吉','凶','凶','凶','吉','凶','吉'];
  var _xi=(((Math.floor((Date.UTC(y,m-1,d)-Date.UTC(1900,0,7))/864e5))%28)+28)%28;
  var favEl=bazi.fav[0]||dmEl;
  var cMap={'金':['鈦晶','白水晶','銀髮晶'],'木':['綠幽靈','東陵玉','綠碧璽'],'水':['海藍寶','月光石','拉長石'],'火':['紅瑪瑙','紫水晶','太陽石'],'土':['黃水晶','虎眼石','茶晶']};
  var crystal=(cMap[favEl]||cMap['土'])[0];

  return{date:dateObj,ds:dateObj.toISOString().slice(0,10),score:score,sign:sign,icon:icon,cls:cls,
    tip:tip,crystal:crystal,god:god,cs:cs,gz:tG+tZ,tEl:tEl,favEl:favEl,
    isChong:isChong,isHe:isHe,yi:yj.yi,ji:yj.ji,
    xingxiu:_28XS[_xi]+'宿',xingxiuLuck:_28L[_xi]};
}

/* ── 行事曆渲染 ── */
var cal30Data=[];
var cal30VM=0;

function renderCal30(){
  var box=document.getElementById('cal30-box');
  if(!box)return;
  if(!S.bazi){
    box.innerHTML='<div class="text-center" style="padding:var(--sp-lg)"><p class="text-dim text-sm mb-md">\u9700\u8981\u5148\u5B8C\u6210\u57FA\u672C\u8CC7\u6599\uFF08\u751F\u65E5\u6642\u8FB0\uFF09</p><button class="btn btn-gold btn-sm" onclick="goStep(0)"><i class="fas fa-pen"></i> \u524D\u5F80\u586B\u5BEB</button></div>';
    return;
  }
  cal30Data=[];
  var today=new Date();today.setHours(0,0,0,0);
  for(var i=0;i<60;i++){
    var dd=new Date(today);dd.setDate(dd.getDate()+i);
    cal30Data.push(computeDateFortune(S.bazi,dd));
  }
  var f30=cal30Data.slice(0,30);
  var ji=0,ping=0,xiong=0;
  f30.forEach(function(x){if(x.score>=65)ji++;else if(x.score>=35)ping++;else xiong++;});

  var znTag='';
  if(S.zodiacNameResult){
    var zn=S.zodiacNameResult;
    znTag='<p class="text-xs text-muted mt-xs">\u59D3\u540D\u5B78\u4EA4\u53C9\uFF1A'+zn.emoji+zn.zodiac+'\u5E74\u751F\u4EBA\u300C'+zn.name+'\u300D\u5224\u5B9A\u3010'+zn.overallLevel+'\u3011\uFF0C\u5DF2\u7D0D\u5165\u6BCF\u65E5\u8A08\u7B97</p>';
  }
  // build7D 整體洞察注入行事曆
  var b7dCalTag='';
  try{
    if(typeof build7D==='function'&&S.bazi){
      var _7Cal=build7D(S.bazi, S.meihua||null, S.tarot||null, 'general');
      var _7CalP=_7Cal.parts.filter(function(p){return p&&p.length>5;});
      if(_7CalP.length){
        b7dCalTag='<details style="margin-top:.4rem"><summary style="cursor:pointer;font-size:.8rem;color:var(--c-gold);font-weight:600">📊 七維度命盤背景</summary><div style="font-size:.75rem;color:var(--c-text-dim);line-height:1.6;padding:.3rem .5rem;border-left:2px solid rgba(212,175,55,.2);margin-top:.2rem">'+_7CalP.map(function(p){return '<p style="margin:.1rem 0">'+p+'</p>';}).join('')+'</div></details>';
      }
    }
  }catch(e){}

  box.innerHTML='<div class="cal30-sts"><div class="cal30-st"><div class="cal30-sn" style="color:#4ade80">'+ji+'</div><div class="cal30-sl">\u5409\u65E5\uFF08\u9069\u5408\u884C\u52D5\uFF09</div></div><div class="cal30-st"><div class="cal30-sn" style="color:var(--c-text-dim)">'+ping+'</div><div class="cal30-sl">\u5E73\u7A69\u65E5</div></div><div class="cal30-st"><div class="cal30-sn" style="color:#f87171">'+xiong+'</div><div class="cal30-sl">\u4F4E\u8C37\u4F11\u990A\u65E5</div></div></div>'+znTag+b7dCalTag+'<div class="cal30-mnav"><button onclick="cal30CM(-1)" id="cal30p" style="visibility:hidden"><i class="fas fa-chevron-left"></i></button><div class="cal30-mt" id="cal30t"></div><button onclick="cal30CM(1)" id="cal30n"><i class="fas fa-chevron-right"></i></button></div><div class="cal30-grid" id="cal30g"></div><div class="cal30-legend"><span><i style="background:rgba(74,222,128,.5)"></i>\u5927\u5409</span><span><i style="background:rgba(96,165,250,.4)"></i>\u4E0A\u5409</span><span><i style="background:rgba(212,175,55,.3)"></i>\u4E2D\u5409</span><span><i style="background:rgba(255,255,255,.1)"></i>\u5C0F\u5409/\u4E2D\u5E73</span><span><i style="background:rgba(248,113,113,.3)"></i>\u5C0F\u51F6</span><span><i style="background:rgba(220,50,50,.4)"></i>\u51F6</span></div><div style="margin-top:var(--sp-md)"><div class="card-title" style="font-size:.9rem"><i class="fas fa-list"></i> \u6BCF\u65E5\u8A73\u60C5</div><div class="cal30-det" id="cal30d"></div></div><div style="display:flex;flex-direction:column;gap:var(--sp-xs);margin-top:var(--sp-md)"><button class="btn btn-gold btn-sm" onclick="dlCal30(\'all\')"><i class="fas fa-calendar-plus"></i> \u4E0B\u8F09\u5B8C\u6574\u884C\u4E8B\u66C6\uFF08.ics\uFF09</button><button class="btn btn-outline btn-sm" onclick="dlCal30(\'hl\')"><i class="fas fa-star"></i> \u53EA\u4E0B\u8F09\u5409\u65E5\uFF0B\u51F6\u65E5\u63D0\u9192</button></div><p class="text-xs text-muted mt-sm text-center">\u4E0B\u8F09 .ics \u6A94\u5373\u53EF\u532F\u5165 iPhone / Google / Outlook</p>';

  cal30VM=0;
  renderCal30G();
  renderCal30D();
}

function renderCal30G(){
  var today=new Date();today.setHours(0,0,0,0);
  var bm=new Date(today.getFullYear(),today.getMonth()+cal30VM,1);
  var yr=bm.getFullYear(),mo=bm.getMonth();
  var te=document.getElementById('cal30t');
  if(te)te.textContent=yr+'\u5E74 '+(mo+1)+'\u6708';
  var g=document.getElementById('cal30g');
  if(!g)return;
  g.innerHTML='';
  ['\u65E5','\u4E00','\u4E8C','\u4E09','\u56DB','\u4E94','\u516D'].forEach(function(n){
    var e=document.createElement('div');e.className='cal30-hdr';e.textContent=n;g.appendChild(e);
  });
  var fd=bm.getDay();
  for(var i=0;i<fd;i++){var e=document.createElement('div');e.className='cal30-day empty';g.appendChild(e);}
  var dim=new Date(yr,mo+1,0).getDate();
  var ts=today.toISOString().slice(0,10);
  for(var d=1;d<=dim;d++){
    var dObj=new Date(yr,mo,d);
    var ds=dObj.toISOString().slice(0,10);
    var data=null;
    for(var j=0;j<cal30Data.length;j++){if(cal30Data[j].ds===ds){data=cal30Data[j];break;}}
    var e=document.createElement('div');
    e.className='cal30-day';
    if(data){
      e.classList.add(data.cls);
      e.innerHTML='<span class="cd-num">'+d+'</span><span class="cd-icon">'+data.icon+'</span>';
      e.title=data.sign+' '+data.tip+' \uFF5C\u{1F48E} '+data.crystal;
    }else{
      e.innerHTML='<span class="cd-num" style="color:var(--c-text-muted)">'+d+'</span>';
    }
    if(ds===ts)e.classList.add('is-today');
    if(data){
      e.setAttribute('data-ds',ds);
      e.addEventListener('click',function(){cal30Select(this.getAttribute('data-ds'));});
    }
    g.appendChild(e);
  }
  var pb=document.getElementById('cal30p'),nb=document.getElementById('cal30n');
  if(pb)pb.style.visibility=cal30VM>0?'visible':'hidden';
  if(nb)nb.style.visibility=cal30VM<1?'visible':'hidden';
}

function cal30CM(dir){cal30VM=Math.max(0,Math.min(1,cal30VM+dir));renderCal30G();}

function renderCal30D(){
  var list=document.getElementById('cal30d');
  if(!list)return;
  var f30=cal30Data.slice(0,30);
  var html='';
  var wds=['\u65E5','\u4E00','\u4E8C','\u4E09','\u56DB','\u4E94','\u516D'];
  f30.forEach(function(day){
    var d=day.date;
    var wd=wds[d.getDay()];
    var ct=day.isChong?' <span style="color:#f87171;font-size:.7rem">\u26A0\u6C96</span>':'';
    var ht=day.isHe?' <span style="color:#4ade80;font-size:.7rem">\u2713\u5408</span>':'';
    var _yijiHtml = '';
    if(day.yi||day.ji) _yijiHtml = '<br><span style="font-size:.7rem"><span style="color:#4ade80">宜</span>'+day.yi+' <span style="color:#f87171">忌</span>'+day.ji+'</span>';
    var _xsHtml = day.xingxiu ? ' <span style="font-size:.65rem;opacity:.6">'+day.xingxiu+'('+day.xingxiuLuck+')</span>' : '';
    html+='<div class="cal30-di" id="cal30di-'+day.ds+'"><div style="min-width:48px;font-weight:700;color:var(--c-text-dim);font-size:.78rem">'+(d.getMonth()+1)+'/'+d.getDate()+'<br><span style="font-size:.65rem;color:var(--c-text-muted)">\u9031'+wd+'</span></div><div style="min-width:16px;text-align:center">'+day.icon+'</div><div style="flex:1;line-height:1.5"><strong style="font-size:.78rem">'+day.sign+'</strong> <span class="text-xs text-muted">'+day.gz+'('+day.tEl+')\u00B7'+day.god+_xsHtml+'</span>'+ct+ht+_yijiHtml+'<br><span style="color:var(--c-text-dim);font-size:.75rem">'+day.tip+'</span></div></div>';
  });
  list.innerHTML=html;
}

function fmtICS(d){return d.getFullYear()+String(d.getMonth()+1).padStart(2,'0')+String(d.getDate()).padStart(2,'0');}

/* ── 日曆日期點擊 → 高亮+捲動到每日詳情 ── */
function cal30Select(ds){
  // 1. 高亮選中日期格
  var g=document.getElementById('cal30g');
  if(g){
    var all=g.querySelectorAll('.cal30-day.selected');
    for(var i=0;i<all.length;i++) all[i].classList.remove('selected');
    var sel=g.querySelector('[data-ds="'+ds+'"]');
    if(sel) sel.classList.add('selected');
  }
  // 2. 捲動到對應的每日詳情
  var target=document.getElementById('cal30di-'+ds);
  if(target){
    // 高亮目標行
    var list=document.getElementById('cal30d');
    if(list){
      var allDi=list.querySelectorAll('.cal30-di');
      for(var i=0;i<allDi.length;i++) allDi[i].style.background='';
      target.style.background='rgba(167,139,250,.15)';
      setTimeout(function(){target.style.background='';},2500);
    }
    // 捲動（detail list 內部捲動 + 頁面捲動）
    target.scrollIntoView({behavior:'smooth',block:'center'});
  }
}

function dlCal30(mode){
  if(!cal30Data.length)return;
  var days=cal30Data.slice(0,30);
  if(mode==='hl')days=days.filter(function(x){return x.score>=65||x.score<35;});
  var dm=S.bazi?S.bazi.dm:'';
  var lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//JingYue//Cal30//ZH','CALSCALE:GREGORIAN','METHOD:PUBLISH','X-WR-CALNAME:\u975C\u6708\u4E4B\u5149 \u80FD\u91CF\u884C\u4E8B\u66C6','X-WR-TIMEZONE:Asia/Taipei'];
  days.forEach(function(day){
    var ds=fmtICS(day.date);
    lines.push('BEGIN:VEVENT','UID:jy-'+ds+'-'+dm+'@jingyue.com','DTSTART;VALUE=DATE:'+ds,'DTEND;VALUE=DATE:'+ds,'SUMMARY:'+day.icon+' '+day.sign+'\uFF08'+day.gz+'\uFF09','DESCRIPTION:'+day.tip+'\\n\u{1F48E} \u5EFA\u8B70\u914D\u6234\uFF1A'+day.crystal+'\\n\u5341\u795E\uFF1A'+day.god+'\\n\\n\u2726 \u975C\u6708\u4E4B\u5149\u80FD\u91CF\u884C\u4E8B\u66C6 \u2726','TRANSP:TRANSPARENT','BEGIN:VALARM','TRIGGER:-PT0M','ACTION:DISPLAY','DESCRIPTION:'+day.icon+' '+day.sign+' \u5EFA\u8B70\u914D\u6234\uFF1A'+day.crystal,'END:VALARM','END:VEVENT');
  });
  lines.push('END:VCALENDAR');
  var blob=new Blob([lines.join('\r\n')],{type:'text/calendar;charset=utf-8'});
  var url=URL.createObjectURL(blob);
  var a=document.createElement('a');a.href=url;a.download='\u975C\u6708\u4E4B\u5149_\u884C\u4E8B\u66C6_'+dm+'.ics';
  document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(url);
}

/* ── 靈氣濾鏡 ── */
/* ═══════════════════════════════════════════════════════
   靈氣濾鏡 v4 — 七脈輪×八字×姓名學 當日能量分析
   ═══════════════════════════════════════════════════════ */

/*
  核心邏輯：
  1. 算出當日干支的五行
  2. 結合八字日主、喜忌神、十神、沖合、姓名學
  3. 計算五行能量分佈（金木水火土各多少%）
  4. 最強五行 → 對應脈輪（五行→脈輪映射）
  5. 水晶推薦依「喜用神」，絕不推忌神的水晶
*/

/* 七脈輪資料（真實脈輪體系） */
var CHAKRA_DATA={
  root:{name:'\u6D77\u5E95\u8F2A',en:'Root Chakra',color:'#dc2626',glow:'rgba(220,38,38,',
    body:'\u9AA8\u76C6\u5E95\u90E8\u3001\u96D9\u817F\u3001\u8170\u690E',
    theme:'\u5B89\u5168\u611F\u3001\u751F\u5B58\u672C\u80FD\u3001\u8173\u8E0F\u5BE6\u5730',
    balanced:'\u5145\u6EFF\u6D3B\u529B\u3001\u611F\u5230\u5B89\u7A69\u8E0F\u5BE6\uFF0C\u751F\u547D\u529B\u65FA\u76DB',
    imbalanced:'\u7126\u616E\u4E0D\u5B89\u3001\u7F3A\u4E4F\u5B89\u5168\u611F\uFF0C\u5BB9\u6613\u75B2\u52DE'},
  sacral:{name:'\u81CD\u9AA8\u8F2A',en:'Sacral Chakra',color:'#ea580c',glow:'rgba(234,88,12,',
    body:'\u4E0B\u8179\u90E8\u3001\u751F\u6B96\u7CFB\u7D71\u3001\u814E\u81DF',
    theme:'\u60C5\u611F\u3001\u6109\u6085\u3001\u5275\u9020\u529B\u3001\u611F\u5B98\u4EAB\u53D7',
    balanced:'\u60C5\u611F\u8C50\u6CBB\u3001\u5275\u9020\u529B\u6D3B\u8E8D\uFF0C\u4EBA\u969B\u95DC\u4FC2\u5713\u6ED1',
    imbalanced:'\u60C5\u7DD2\u58D3\u6291\u3001\u7F6A\u60E1\u611F\uFF0C\u5275\u9020\u529B\u53D7\u963B'},
  solar:{name:'\u592A\u967D\u795E\u7D93\u53E2\u8F2A',en:'Solar Plexus',color:'#eab308',glow:'rgba(234,179,8,',
    body:'\u4E0A\u8179\u90E8\u3001\u80C3\u3001\u809D\u81BD',
    theme:'\u81EA\u4FE1\u3001\u610F\u5FD7\u529B\u3001\u500B\u4EBA\u529B\u91CF\u3001\u81EA\u5C0A',
    balanced:'\u81EA\u4FE1\u5145\u6EFF\u3001\u610F\u5FD7\u5805\u5B9A\uFF0C\u4E8B\u696D\u904B\u52E2\u5F37\u52C1',
    imbalanced:'\u81EA\u5351\u6216\u63A7\u5236\u6B32\u5F37\u3001\u6D88\u5316\u554F\u984C\u3001\u512A\u67D4\u5BE1\u65B7'},
  heart:{name:'\u5FC3\u8F2A',en:'Heart Chakra',color:'#22c55e',glow:'rgba(34,197,94,',
    body:'\u80F8\u53E3\u3001\u5FC3\u81DF\u3001\u80BA\u90E8\u3001\u624B\u81C2',
    theme:'\u611B\u3001\u540C\u7406\u5FC3\u3001\u7642\u7652\u3001\u5305\u5BB9\u63A5\u7D0D',
    balanced:'\u5145\u6EFF\u611B\u8207\u6148\u60B2\u3001\u8207\u4ED6\u4EBA\u548C\u8AE7\u5171\u8655\uFF0C\u5FC3\u9748\u5E73\u9759',
    imbalanced:'\u5C01\u9589\u81EA\u6211\u3001\u904E\u5EA6\u4ED8\u51FA\u3001\u60B2\u50B7\u96E3\u4EE5\u91CB\u61F7'},
  throat:{name:'\u5589\u8F2A',en:'Throat Chakra',color:'#3b82f6',glow:'rgba(59,130,246,',
    body:'\u5589\u5634\u3001\u9838\u90E8\u3001\u7532\u72C0\u817A',
    theme:'\u8868\u9054\u3001\u6E9D\u901A\u3001\u771F\u5BE6\u3001\u81E3\u670D',
    balanced:'\u8868\u9054\u6E05\u6670\u3001\u5BE6\u8A71\u5BE6\u8AAA\uFF0C\u6E9D\u901A\u9806\u66A2\u6709\u529B',
    imbalanced:'\u58D3\u6291\u4E0D\u8A00\u6216\u53E3\u7121\u906E\u6514\u3001\u5014\u5F37\u9867\u56FA'},
  third_eye:{name:'\u7709\u5FC3\u8F2A',en:'Third Eye',color:'#6d28d9',glow:'rgba(109,40,217,',
    body:'\u7709\u5FC3\u3001\u984D\u982D\u3001\u677E\u679C\u9AD4\u3001\u795E\u7D93\u7CFB\u7D71',
    theme:'\u76F4\u89BA\u3001\u6D1E\u5BDF\u529B\u3001\u5167\u5728\u667A\u6167\u3001\u89BA\u5BDF',
    balanced:'\u76F4\u89BA\u654F\u92B3\u3001\u6D1E\u5BDF\u529B\u5F37\uFF0C\u80FD\u770B\u900F\u4E8B\u7269\u672C\u8CEA',
    imbalanced:'\u6DF7\u4E82\u3001\u8FF7\u5931\u65B9\u5411\u3001\u6D3B\u5728\u5E7B\u8C61\u4E2D'},
  crown:{name:'\u9802\u8F2A',en:'Crown Chakra',color:'#a855f7',glow:'rgba(168,85,247,',
    body:'\u982D\u9802\u3001\u5927\u8166\u76AE\u5C64',
    theme:'\u9748\u6027\u3001\u5B87\u5B99\u9023\u7D50\u3001\u958B\u609F\u3001\u8D85\u8D8A',
    balanced:'\u9748\u6027\u89BA\u9192\u3001\u8207\u5B87\u5B99\u5408\u4E00\uFF0C\u5167\u5FC3\u5E73\u548C\u5145\u5BE6',
    imbalanced:'\u7591\u96E2\u3001\u8FF7\u4FE1\u3001\u8207\u5167\u5728\u65B7\u9023'}
};

/* 五行→脈輪映射（核心邏輯）
   火→海底輪(生命力)+臍骨輪(熱情)
   土→太陽神經叢(穩定+意志)
   木→心輪(生長+療癒)
   水→喉輪(溝通)+眉心輪(智慧)
   金→頂輪(純淨+超越)
*/
var EL_CHAKRA={
  '\u706B':['root','sacral'],
  '\u571F':['solar'],
  '\u6728':['heart'],
  '\u6C34':['throat','third_eye'],
  '\u91D1':['crown']
};

/* 水晶推薦（按喜用神五行，絕不推忌神五行的水晶）*/
var CRYSTAL_BY_FAV={
  '\u91D1':['\u9226\u6676','\u767D\u6C34\u6676','\u9280\u9AEE\u6676','\u767D\u5E7B\u5F71\u6C34\u6676'],
  '\u6728':['\u7DA0\u5E7D\u9748','\u6771\u9675\u7389','\u7DA0\u78A7\u74BD','\u7FE0\u9285\u7926'],
  '\u6C34':['\u6D77\u85CD\u5BF6','\u6708\u5149\u77F3','\u62C9\u9577\u77F3','\u85CD\u7D0B\u77F3'],
  '\u706B':['\u7D05\u746A\u7459','\u77F3\u69B4\u77F3','\u592A\u967D\u77F3','\u8840\u73C0'],
  '\u571F':['\u9EC3\u6C34\u6676','\u864E\u773C\u77F3','\u8336\u6676','\u5357\u7D05\u746A\u7459']
};

var auraImg=null;

function hexToRGBA(hex,a){
  var r=0,g=0,b=0;
  if(hex.length===7){r=parseInt(hex.slice(1,3),16);g=parseInt(hex.slice(3,5),16);b=parseInt(hex.slice(5,7),16);}
  else if(hex.length===4){r=parseInt(hex[1]+hex[1],16);g=parseInt(hex[2]+hex[2],16);b=parseInt(hex[3]+hex[3],16);}
  return 'rgba('+r+','+g+','+b+','+a+')';
}

/* ── 當日脈輪能量分析 ── */
function analyzeTodayChakra(bazi){
  // ── 新邏輯：整合七系統 tag 引擎，取代舊加法拼湊 ──
  var today=new Date();
  var y=today.getFullYear(),m=today.getMonth()+1,d=today.getDate();
  var gz=getDateGZ(y,m,d);
  var dm=bazi.dm, dmEl=bazi.dmEl;
  var tG=gz.gan, tZ=gz.zhi, tEl=gz.el;
  var dZ=bazi.pillars.day.zhi;

  // ── Step 1：五行能量分佈 ──
  var elScore={'金':0,'木':0,'水':0,'火':0,'土':0};
  elScore[dmEl]+=8;
  elScore[tEl]+=25;
  var cg=CG[tZ]||[];
  cg.forEach(function(g,i){elScore[WX_G[g]]+=(i===0?12:6);});
  var god=tenGod(dm,tG);
  var godElBonus={'食神':{'火':6,'木':4},'傷官':{'火':6,'木':4},'正印':{'水':6,'金':4},'偏印':{'水':6,'金':4},
    '正財':{'土':6,'火':4},'偏財':{'土':6,'火':4},'正官':{'火':6},'七殺':{'火':6},'比肩':{},'劫財':{}};
  var bonus=godElBonus[god]||{};
  Object.keys(bonus).forEach(function(k){elScore[k]+=bonus[k];});
  bazi.fav.forEach(function(el){elScore[el]+=3;});
  bazi.unfav.forEach(function(el){elScore[el]-=3;});
  if(LIU_CHONG&&LIU_CHONG[tZ]===dZ) elScore['火']+=6;
  if(LIU_HE&&LIU_HE[tZ]===dZ) elScore['木']+=6;

  // 紫微命宮主星五行貢獻
  if(typeof S!=='undefined'&&S.ziwei&&S.ziwei.palaces){try{
    var mingGong=S.ziwei.palaces.find(function(p){return p.name==='命宮';});
    if(mingGong&&mingGong.stars&&mingGong.stars.length){
      var mainStar=mingGong.stars.find(function(s){return s.type==='major';});
      if(mainStar&&mainStar.element&&elScore[mainStar.element]!==undefined) elScore[mainStar.element]+=8;
    }
  }catch(e){}}

  // 吠陀月亮星宿五行貢獻
  if(typeof S!=='undefined'&&S.jyotish){try{
    var tr=jyCurrentTransits();
    var moonRashi=tr.Moon.rashiIdx;
    // 月亮所在星座五行：火象(0牡羊,4獅子,8射手)木象(2雙子,6天秤,10水瓶)土象(1金牛,5處女,9摩羯)水象(3巨蟹,7天蠍,11雙魚)
    var rashiEl=['火','土','木','水','火','土','木','水','火','土','木','水'][moonRashi%12]||'水';
    elScore[rashiEl]+=6;
  }catch(e){}}

  // 西洋月亮星座五行
  if(typeof S!=='undefined'&&S.natal&&S.natal.planets&&S.natal.planets['月亮']){try{
    var moonSign=S.natal.planets['月亮'].sign||'';
    var signEl={'牡羊':'火','金牛':'土','雙子':'木','巨蟹':'水','獅子':'火','處女':'土',
      '天秤':'木','天蠍':'水','射手':'火','摩羯':'土','水瓶':'木','雙魚':'水'}[moonSign];
    if(signEl) elScore[signEl]+=4;
  }catch(e){}}

  // 確保無負值
  for(var k in elScore){if(elScore[k]<0)elScore[k]=0;}
  var maxEl='',maxVal=0,total=0;
  for(var k in elScore){total+=elScore[k];if(elScore[k]>maxVal){maxVal=elScore[k];maxEl=k;}}
  var elPct={};
  for(var k in elScore){elPct[k]=total>0?Math.round(elScore[k]/total*100):20;}

  var chakraKeys=EL_CHAKRA[maxEl]||['heart'];
  var primaryKey=chakraKeys[0];
  var secondaryKey=chakraKeys.length>1?chakraKeys[1]:null;
  var ch=CHAKRA_DATA[primaryKey];

  // ── Step 2：吉凶分數（新 tag 引擎主導）──
  var score=50;
  var godS={'比肩':5,'劫財':2,'食神':8,'傷官':1,'偏財':6,'正財':10,'七殺':-8,'正官':4,'偏印':5,'正印':8};
  score+=(godS[god]||0);
  if(bazi.fav.indexOf(tEl)>=0) score+=12;
  if(bazi.unfav.indexOf(tEl)>=0) score-=12;
  cg.forEach(function(g){
    if(bazi.fav.indexOf(WX_G[g])>=0) score+=3;
    if(bazi.unfav.indexOf(WX_G[g])>=0) score-=3;
  });
  if(LIU_CHONG&&LIU_CHONG[tZ]===dZ) score-=10;
  if(LIU_HE&&LIU_HE[tZ]===dZ) score+=8;
  var cs=changSheng(dm,tZ);
  var csS={'長生':8,'沐浴':1,'冠帶':5,'臨官':7,'帝旺':10,'衰':-2,'病':-5,'死':-8,'墓':-6,'絕':-10,'胎':1,'養':3};
  score+=(csS[cs]||0);

  // 七系統 tag 引擎加成（新邏輯，direction='pos'/'neg'）
  var tagBonus=0;
  var tagSrcs=[];
  try{ tagSrcs.push(analyzeBaziTags(bazi,'general')); }catch(e){}
  try{ if(typeof S!=='undefined'&&S.ziwei) tagSrcs.push(analyzeZiweiTags(S.ziwei,'general')); }catch(e){}
  try{ if(typeof S!=='undefined'&&S.natal) tagSrcs.push(analyzeNatalTags(S.natal,'general')); }catch(e){}
  try{ if(typeof S!=='undefined'&&S.jyotish) tagSrcs.push(analyzeJyotishTags(S.jyotish,'general')); }catch(e){}
  try{
    var _nr=typeof S!=='undefined'?S.nameResult:null;
    var _znr=typeof S!=='undefined'?S.zodiacNameResult:null;
    if(_nr||_znr) tagSrcs.push(analyzeNameTags(_nr,_znr,'general'));
  }catch(e){}
  tagSrcs.forEach(function(tags){
    if(!tags||!tags.length) return;
    tags.forEach(function(t){
      var w=t.weight||1;
      if(t.direction==='pos') tagBonus+=w*0.7;
      else if(t.direction==='neg') tagBonus-=w*0.7;
    });
  });
  score+=Math.max(-12,Math.min(12,tagBonus));
  score=Math.max(10,Math.min(95,score));

  var fortune,fIcon;
  if(score>=80){fortune='大吉';fIcon='\u{1F31F}';}
  else if(score>=65){fortune='上吉';fIcon='\u2728';}
  else if(score>=50){fortune='中吉';fIcon='\u{1F319}';}
  else if(score>=35){fortune='中平';fIcon='\u26C5';}
  else{fortune='偏凶';fIcon='\u26A1';}

  // 水晶推薦（只用喜用神）
  var favEl=bazi.fav[0]||dmEl;
  var cList=CRYSTAL_BY_FAV[favEl]||CRYSTAL_BY_FAV['\u6c34'];
  var safeCrystals=[];
  for(var el in CRYSTAL_BY_FAV){
    if(bazi.unfav.indexOf(el)<0) CRYSTAL_BY_FAV[el].forEach(function(cr){safeCrystals.push({name:cr,el:el});});
  }
  var crystal=cList[(d+m)%cList.length];
  if(bazi.unfav.indexOf(favEl)>=0&&safeCrystals.length>0) crystal=safeCrystals[(d+m)%safeCrystals.length].name;

  return{
    chakra:ch,chakraKey:primaryKey,secondaryKey:secondaryKey,
    elScore:elScore,elPct:elPct,maxEl:maxEl,
    score:score,fortune:fortune,fIcon:fIcon,
    god:god,cs:cs,gz:tG+tZ,tEl:tEl,crystal:crystal,favEl:favEl
  };
}

function renderAuraFilter(){
  var box=document.getElementById('aura-box');
  if(!box)return;
  if(!S.bazi){
    box.innerHTML='<div class="text-center" style="padding:var(--sp-lg)"><p class="text-dim text-sm mb-md">\u9700\u8981\u5148\u5B8C\u6210\u57FA\u672C\u8CC7\u6599\uFF08\u751F\u65E5\u6642\u8FB0\uFF09</p><button class="btn btn-gold btn-sm" onclick="goStep(0)"><i class="fas fa-pen"></i> \u524D\u5F80\u586B\u5BEB</button></div>';
    return;
  }
  box.innerHTML='<div class="aura-up" id="aura-uz" onclick="document.getElementById(\'aura-fi\').click()"><div style="font-size:2.5rem;color:var(--c-gold);opacity:.6;margin-bottom:var(--sp-sm)"><i class="fas fa-cloud-arrow-up"></i></div><p class="text-sm text-dim">\u9EDE\u64CA\u4E0A\u50B3\u6216\u62D6\u66F3\u81EA\u62CD\u7167</p><p style="color:var(--c-gold);font-weight:700;margin-top:4px">\u5206\u6790\u7576\u65E5\u4E03\u8108\u8F2A\u80FD\u91CF\u8272</p><p class="text-xs text-muted mt-xs">\u652F\u63F4 JPG / PNG\uFF0C\u4E0A\u50B3\u5F8C\u81EA\u52D5\u5206\u6790</p></div><input type="file" id="aura-fi" accept="image/jpeg,image/png,image/webp" style="display:none" onchange="handleAF(this.files[0])"><div id="aura-progress" style="display:none"></div><div id="aura-result" style="display:none"></div>';
  setTimeout(function(){
    var uz=document.getElementById('aura-uz');if(!uz)return;
    uz.addEventListener('dragover',function(e){e.preventDefault();uz.style.borderColor='var(--c-gold)';});
    uz.addEventListener('dragleave',function(){uz.style.borderColor='';});
    uz.addEventListener('drop',function(e){e.preventDefault();uz.style.borderColor='';if(e.dataTransfer.files.length)handleAF(e.dataTransfer.files[0]);});
  },100);
}

/* ── 上傳處理 ── */
function handleAF(file){
  if(!file||!file.type.startsWith('image/')||!S.bazi)return;
  var tc=analyzeTodayChakra(S.bazi);
  var ch=tc.chakra;
  document.getElementById('aura-uz').style.display='none';
  var prog=document.getElementById('aura-progress');
  prog.style.display='block';
  prog.innerHTML='<div style="text-align:center;padding:var(--sp-xl) var(--sp-md)"><div class="aura-orb" style="width:48px;height:48px;background:radial-gradient(circle,'+ch.color+','+ch.glow+'0.15));box-shadow:0 0 30px '+ch.glow+'0.4);margin:0 auto var(--sp-md)"></div><p class="text-sm" style="color:'+ch.color+'">\u6B63\u5728\u5206\u6790\u80FD\u91CF\u5834\u2026</p><div style="width:80%;max-width:300px;margin:var(--sp-sm) auto 0;height:6px;background:rgba(255,255,255,.08);border-radius:3px;overflow:hidden"><div id="aura-bar" style="width:0%;height:100%;background:linear-gradient(90deg,'+ch.color+','+ch.glow+'0.5));border-radius:3px;transition:width 0.3s"></div></div><p id="aura-pct" class="text-xs text-muted mt-xs">0%</p></div>';
  [{t:200,p:15,s:'\u8B80\u53D6\u7576\u65E5\u5E72\u652F\u2026'},{t:600,p:35,s:'\u5206\u6790\u4E94\u884C\u80FD\u91CF\u5206\u4F48\u2026'},{t:1000,p:55,s:'\u4EA4\u53C9\u59D3\u540D\u5B78\u9A57\u8B49\u2026'},{t:1400,p:75,s:'\u5C0D\u61C9\u4E03\u8108\u8F2A\u2026'},{t:1800,p:90,s:'\u5408\u6210\u6C23\u5834\u7167\u7247\u2026'}].forEach(function(x){
    setTimeout(function(){
      var b=document.getElementById('aura-bar'),p=document.getElementById('aura-pct');
      if(b)b.style.width=x.p+'%';if(p)p.textContent=x.p+'% '+x.s;
    },x.t);
  });
  var reader=new FileReader();
  reader.onload=function(e){
    var img=new Image();
    img.onload=function(){
      auraImg=img;
      setTimeout(function(){
        var b=document.getElementById('aura-bar'),p=document.getElementById('aura-pct');
        if(b)b.style.width='100%';if(p)p.textContent='100% \u5B8C\u6210\uFF01';
        setTimeout(showAuraResult,400);
      },2000);
    };
    img.src=e.target.result;
  };
  reader.readAsDataURL(file);
}

/* ── 顯示結果 ── */
function showAuraResult(){
  if(!auraImg||!S.bazi)return;
  var tc=analyzeTodayChakra(S.bazi);
  var ch=tc.chakra;
  var dm=S.bazi.dm,dmEl=S.bazi.dmEl;
  var prog=document.getElementById('aura-progress');if(prog)prog.style.display='none';
  var res=document.getElementById('aura-result');if(!res)return;
  var today=new Date();var ds=(today.getMonth()+1)+'/'+today.getDate();

  var znLine='';
  if(S.zodiacNameResult){
    var zn=S.zodiacNameResult;
    znLine='<div style="font-size:.75rem;color:var(--c-text-muted);margin-top:4px">\u59D3\u540D\u5B78\uFF1A'+zn.emoji+zn.zodiac+'\u5E74\u751F\u4EBA\u3010'+zn.overallLevel+'\u3011\u5DF2\u7D0D\u5165\u8A08\u7B97</div>';
  }

  /* 五行能量條 */
  var elNames={'\u91D1':'\u91D1','\u6728':'\u6728','\u6C34':'\u6C34','\u706B':'\u706B','\u571F':'\u571F'};
  var elColors={'\u91D1':'#d4af37','\u6728':'#22c55e','\u6C34':'#3b82f6','\u706B':'#ef4444','\u571F':'#eab308'};
  var barsHtml='<div style="display:grid;grid-template-columns:32px 1fr 32px;gap:4px;align-items:center;margin:var(--sp-sm) 0;font-size:.72rem">';
  ['\u6728','\u706B','\u571F','\u91D1','\u6C34'].forEach(function(el){
    var pct=tc.elPct[el]||0;
    var isFav=S.bazi.fav.indexOf(el)>=0;
    var isUnfav=S.bazi.unfav.indexOf(el)>=0;
    var tag=isFav?' \u559C':isUnfav?' \u5FCC':'';
    barsHtml+='<span style="color:'+elColors[el]+';font-weight:700">'+elNames[el]+tag+'</span>';
    barsHtml+='<div style="height:8px;background:rgba(255,255,255,.06);border-radius:4px;overflow:hidden"><div style="width:'+pct+'%;height:100%;background:'+elColors[el]+';border-radius:4px;transition:width .6s"></div></div>';
    barsHtml+='<span style="color:var(--c-text-muted)">'+pct+'%</span>';
  });
  barsHtml+='</div>';

  res.style.display='block';

  // ── 行動導向的一句話 ──
  var actionLine='';
  if(tc.score>=65) actionLine='\u4ECA\u5929\u80FD\u91CF\u72C0\u614B\u4E0D\u932F\uFF0C\u9069\u5408\u53BB\u884C\u52D5\u3001\u505A\u6C7A\u5B9A\u3001\u898B\u91CD\u8981\u7684\u4EBA\u3002';
  else if(tc.score>=45) actionLine='\u4ECA\u5929\u80FD\u91CF\u5E73\u7A69\uFF0C\u8655\u7406\u65E5\u5E38\u4E8B\u52D9\u6C92\u554F\u984C\uFF0C\u4F46\u91CD\u5927\u6C7A\u5B9A\u5EFA\u8B70\u7DE9\u7DE9\u3002';
  else actionLine='\u4ECA\u5929\u80FD\u91CF\u504F\u4F4E\uFF0C\u5EFA\u8B70\u653E\u6162\u8173\u6B65\uFF0C\u907F\u514D\u885D\u52D5\u6D88\u8CBB\u6216\u91CD\u8981\u8AC7\u5224\u3002';

  res.innerHTML='<div class="aura-cw"><canvas id="aura-cv" style="display:block;margin:0 auto"></canvas></div>'
    +'<div class="aura-nfo" style="margin-top:var(--sp-md)">'
    +'<div class="aura-orb" style="background:radial-gradient(circle,#fff,'+ch.color+');box-shadow:0 0 40px '+ch.glow+'0.5),0 0 80px '+ch.glow+'0.25)"></div>'
    +'<div class="aura-cn" style="color:'+ch.color+'">'+ds+' \u7576\u65E5\u80FD\u91CF\uFF1A'+ch.name+'</div>'
    +'<div style="font-size:.9rem;font-weight:600;color:'+ch.color+';margin-top:2px">'+ch.en+' \u2502 '+tc.fIcon+' '+tc.fortune+'</div>'
    +'<div style="font-size:.95rem;color:var(--c-text);margin-top:var(--sp-sm);line-height:1.7;font-weight:600">'+actionLine+'</div>'
    +'<div style="font-size:.85rem;color:var(--c-text-dim);margin-top:var(--sp-xs);line-height:1.6">\u4F60\u7684\u559C\u7528\u795E\u662F<strong style="color:var(--c-gold)">'+tc.favEl+'\u884C</strong>\uFF0C\u4ECA\u5929\u5EFA\u8B70\u914D\u6234\uFF1A<strong style="color:var(--c-gold)">'+tc.crystal+'</strong></div>'
    +barsHtml
    +'<div style="font-size:.72rem;color:var(--c-text-muted);margin-top:var(--sp-xs)">'
    +'\u65E5\u4E3B\u300C'+dm+'\u300D('+dmEl+') \u2502 \u7576\u65E5\uFF1A'+tc.gz+'('+tc.tEl+') \u2502 \u5341\u795E\uFF1A'+tc.god+' \u2502 '+tc.score+'/100'
    +znLine
    +(function(){
      var _extras=[];
      try{
        if(S.ziwei&&S.ziwei.palaces&&S.ziwei.palaces[0]){
          var _ms=S.ziwei.palaces[0].stars.filter(function(s){return s.type==='major';});
          if(_ms.length) _extras.push('命宮'+_ms.map(function(s){return s.name;}).join('+'));
        }
        if(S.natal&&S.natal.planets){
          var _sun=S.natal.planets['太陽'];var _moon=S.natal.planets['月亮'];
          if(_sun&&_moon) _extras.push('太陽'+_sun.sign+'/月亮'+_moon.sign);
        }
        if(S.jyotish&&S.jyotish.currentMD) _extras.push('Dasha:'+S.jyotish.currentMD.zh);
      }catch(e){}
      return _extras.length?'<div style="font-size:.7rem;color:var(--c-text-muted);margin-top:2px">'+_extras.join(' · ')+'</div>':'';
    })()
    +'</div></div>'
    +'<div style="display:flex;gap:var(--sp-xs);margin-top:var(--sp-md);justify-content:center;flex-wrap:wrap">'
    +'<button class="btn btn-gold btn-sm" onclick="dlAura()"><i class="fas fa-download"></i> \u4E0B\u8F09\u80FD\u91CF\u7167\u7247</button>'
    +'<button class="btn btn-outline btn-sm" onclick="resetAF()"><i class="fas fa-redo"></i> \u91CD\u65B0\u4E0A\u50B3</button>'
    +'</div>'
    +'<div class="aura-sh" style="margin-top:var(--sp-sm)"><strong>#\u975C\u6708\u4E4B\u5149 #\u80FD\u91CF\u5149\u74B0 #'+ch.name+' #\u6C34\u6676\u7642\u7652</strong></div>';

  setTimeout(genAura,120);
}

/* ── Canvas 氣場合成（專業美感版）── */
function genAura(){
  if(!auraImg||!S.bazi)return;
  var tc=analyzeTodayChakra(S.bazi);
  var ch=tc.chakra;
  var cv=document.getElementById('aura-cv');
  if(!cv)return;
  var ctx=cv.getContext('2d');
  var img=auraImg;
  var mx=720,sc=Math.min(mx/img.width,mx/img.height,1);
  var iw=Math.round(img.width*sc),ih=Math.round(img.height*sc);
  var pad=Math.round(Math.max(iw,ih)*0.14);
  var cardW=iw+pad*2;

  /* ── 底部資訊卡高度計算 ── */
  var infoH=Math.round(cardW*0.58); /* 精簡版：今日提醒+建議配戴+五行條 */
  cv.width=cardW;cv.height=ih+pad*2+infoH;
  var cx=pad+iw/2,cy=pad+ih*0.42;
  var cw=cv.width,cvH=cv.height;

  var secKeys=EL_CHAKRA[tc.maxEl];
  var secCh=secKeys&&secKeys.length>1?CHAKRA_DATA[secKeys[1]]:null;
  var sec=secCh?secCh.color:'#ff8c00';

  /* ══ 1. 深色漸層背景 ══ */
  var bgG=ctx.createLinearGradient(0,0,0,cvH);
  bgG.addColorStop(0,'#05010d');
  bgG.addColorStop(0.4,'#0a0218');
  bgG.addColorStop(0.7,'#080112');
  bgG.addColorStop(1,'#030108');
  ctx.fillStyle=bgG;ctx.fillRect(0,0,cw,cvH);

  /* ══ 2. 大範圍氣場光暈（副脈輪色）══ */
  var r1=Math.max(iw,ih)*0.95;
  var g1=ctx.createRadialGradient(cx,cy,r1*0.05,cx,cy,r1);
  g1.addColorStop(0,hexToRGBA(sec,0.25));
  g1.addColorStop(0.3,hexToRGBA(sec,0.08));
  g1.addColorStop(0.6,hexToRGBA(sec,0.02));
  g1.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=g1;ctx.fillRect(0,0,cw,cvH);

  /* ══ 3. 主脈輪橢圓光環 ══ */
  ctx.save();ctx.translate(cx,cy);ctx.scale(1,1.35);
  var r2=Math.max(iw,ih)*0.52;
  var g2=ctx.createRadialGradient(0,0,r2*0.04,0,0,r2);
  g2.addColorStop(0,hexToRGBA(ch.color,0.65));
  g2.addColorStop(0.2,hexToRGBA(ch.color,0.35));
  g2.addColorStop(0.5,hexToRGBA(ch.color,0.08));
  g2.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=g2;ctx.fillRect(-cw,-cvH,cw*2,cvH*2);ctx.restore();

  /* ══ 4. 頭部亮點光暈 ══ */
  var hy=cy-ih*0.2,r3=Math.max(iw,ih)*0.26;
  var g3=ctx.createRadialGradient(cx,hy,0,cx,hy,r3);
  g3.addColorStop(0,hexToRGBA('#ffffff',0.3));
  g3.addColorStop(0.12,hexToRGBA(ch.color,0.5));
  g3.addColorStop(0.45,hexToRGBA(ch.color,0.1));
  g3.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=g3;ctx.fillRect(0,0,cw,cvH);

  /* ══ 5. 照片（帶圓角遮罩）══ */
  var rr=Math.round(Math.min(iw,ih)*0.03); /* 圓角 */
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(pad+rr,pad);ctx.lineTo(pad+iw-rr,pad);ctx.quadraticCurveTo(pad+iw,pad,pad+iw,pad+rr);
  ctx.lineTo(pad+iw,pad+ih-rr);ctx.quadraticCurveTo(pad+iw,pad+ih,pad+iw-rr,pad+ih);
  ctx.lineTo(pad+rr,pad+ih);ctx.quadraticCurveTo(pad,pad+ih,pad,pad+ih-rr);
  ctx.lineTo(pad,pad+rr);ctx.quadraticCurveTo(pad,pad,pad+rr,pad);
  ctx.closePath();ctx.clip();
  ctx.drawImage(img,pad,pad,iw,ih);

  /* 照片四邊脈輪色疊加 */
  var et=ctx.createLinearGradient(pad,pad,pad,pad+ih*0.25);
  et.addColorStop(0,hexToRGBA(ch.color,0.4));et.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=et;ctx.fillRect(pad,pad,iw,ih*0.25);
  var eb=ctx.createLinearGradient(pad,pad+ih,pad,pad+ih*0.8);
  eb.addColorStop(0,hexToRGBA(ch.color,0.3));eb.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=eb;ctx.fillRect(pad,pad+ih*0.8,iw,ih*0.2);
  var elg=ctx.createLinearGradient(pad,pad,pad+iw*0.2,pad);
  elg.addColorStop(0,hexToRGBA(ch.color,0.3));elg.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=elg;ctx.fillRect(pad,pad,iw*0.2,ih);
  var erg=ctx.createLinearGradient(pad+iw,pad,pad+iw*0.8,pad);
  erg.addColorStop(0,hexToRGBA(ch.color,0.3));erg.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=erg;ctx.fillRect(pad+iw*0.8,pad,iw*0.2,ih);
  ctx.restore();

  /* ══ 6. 照片外框發光 ══ */
  ctx.save();
  ctx.strokeStyle=hexToRGBA(ch.color,0.4);ctx.lineWidth=1.5;
  ctx.shadowColor=ch.color;ctx.shadowBlur=18;
  ctx.beginPath();
  ctx.moveTo(pad+rr,pad);ctx.lineTo(pad+iw-rr,pad);ctx.quadraticCurveTo(pad+iw,pad,pad+iw,pad+rr);
  ctx.lineTo(pad+iw,pad+ih-rr);ctx.quadraticCurveTo(pad+iw,pad+ih,pad+iw-rr,pad+ih);
  ctx.lineTo(pad+rr,pad+ih);ctx.quadraticCurveTo(pad,pad+ih,pad,pad+ih-rr);
  ctx.lineTo(pad,pad+rr);ctx.quadraticCurveTo(pad,pad,pad+rr,pad);
  ctx.closePath();ctx.stroke();
  ctx.restore();

  /* ══ 7. 星塵粒子 ══ */
  for(var i=0;i<30;i++){
    var ang=(Math.PI*2*i)/30+Math.random()*0.2;
    var dist=Math.min(iw,ih)*0.38+Math.random()*pad*1.5;
    var sx=cx+Math.cos(ang)*dist,sy=cy+Math.sin(ang)*dist*1.1;
    ctx.save();ctx.globalAlpha=0.3+Math.random()*0.55;
    ctx.fillStyle='#fff';ctx.shadowColor=ch.color;ctx.shadowBlur=8;
    ctx.beginPath();ctx.arc(sx,sy,0.8+Math.random()*2,0,Math.PI*2);ctx.fill();
    if(Math.random()>0.6){
      ctx.strokeStyle=hexToRGBA(ch.color,0.5);ctx.lineWidth=0.5;
      ctx.beginPath();ctx.moveTo(sx-4,sy);ctx.lineTo(sx+4,sy);ctx.moveTo(sx,sy-4);ctx.lineTo(sx,sy+5);ctx.stroke();
    }
    ctx.restore();
  }

  /* ══════════════════════════════════════════════
     8. 底部資訊卡（專業排版）
     ══════════════════════════════════════════════ */
  var cardTop=pad*2+ih;
  var cardPad=Math.round(cw*0.06);
  var today=new Date();
  var ds=(today.getMonth()+1)+'/'+today.getDate();

  /* 分隔線（漸層金線）*/
  var dlg=ctx.createLinearGradient(cardPad,cardTop+8,cw-cardPad,cardTop+8);
  dlg.addColorStop(0,'rgba(0,0,0,0)');
  dlg.addColorStop(0.15,hexToRGBA(ch.color,0.6));
  dlg.addColorStop(0.5,hexToRGBA(ch.color,0.8));
  dlg.addColorStop(0.85,hexToRGBA(ch.color,0.6));
  dlg.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=dlg;ctx.fillRect(cardPad,cardTop+6,cw-cardPad*2,1.5);

  /* 底部背景微光 */
  var bgLow=ctx.createRadialGradient(cw/2,cardTop+infoH*0.4,0,cw/2,cardTop+infoH*0.4,cw*0.5);
  bgLow.addColorStop(0,hexToRGBA(ch.color,0.04));
  bgLow.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=bgLow;ctx.fillRect(0,cardTop,cw,infoH);

  /* ── 脈輪光球 ── */
  var orbR=Math.round(cw*0.035);
  var orbY=cardTop+Math.round(infoH*0.12);
  var orbG=ctx.createRadialGradient(cw/2,orbY,0,cw/2,orbY,orbR*2.5);
  orbG.addColorStop(0,'rgba(255,255,255,0.7)');
  orbG.addColorStop(0.2,hexToRGBA(ch.color,0.8));
  orbG.addColorStop(0.6,hexToRGBA(ch.color,0.15));
  orbG.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=orbG;ctx.fillRect(cw/2-orbR*3,orbY-orbR*3,orbR*6,orbR*6);

  /* ── 脈輪名稱（大字）── */
  var fs=Math.max(14,Math.round(cw*0.028));
  var titleY=orbY+orbR*2.5+fs*0.5;
  ctx.textAlign='center';
  ctx.font='bold '+Math.round(fs*1.6)+'px "Noto Serif TC",serif';
  ctx.fillStyle=ch.color;
  ctx.shadowColor=ch.color;ctx.shadowBlur=12;
  ctx.fillText(ds+' 當日能量：'+ch.name,cw/2,titleY);
  ctx.shadowBlur=0;

  /* ── 英文名 + 吉凶 ── */
  var subY=titleY+Math.round(fs*1.3);
  ctx.font='600 '+fs+'px "Noto Sans TC",sans-serif';
  ctx.fillStyle='rgba(245,230,211,0.85)';
  ctx.fillText(ch.en+'  │  '+tc.fIcon+' '+tc.fortune,cw/2,subY);

  /* ── 分隔裝飾線 ── */
  var lineY=subY+Math.round(fs*0.7);
  var lineW=Math.round(cw*0.25);
  var sg=ctx.createLinearGradient(cw/2-lineW,lineY,cw/2+lineW,lineY);
  sg.addColorStop(0,'rgba(0,0,0,0)');sg.addColorStop(0.3,hexToRGBA(ch.color,0.4));
  sg.addColorStop(0.5,hexToRGBA(ch.color,0.6));sg.addColorStop(0.7,hexToRGBA(ch.color,0.4));
  sg.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=sg;ctx.fillRect(cw/2-lineW,lineY,lineW*2,1);

  /* ── 四項資訊（單列，自動換行）── */
  var infoY=lineY+Math.round(fs*1.0);
  var smFs=Math.round(fs*0.82);
  var lblFs=Math.round(fs*0.72);
  var infoMaxW=cw-cardPad*4;

  function drawInfoBlock(y,label,value,col){
    ctx.textAlign='center';
    ctx.font='600 '+lblFs+'px "Noto Sans TC",sans-serif';
    ctx.fillStyle=hexToRGBA(col||ch.color,0.65);
    ctx.fillText(label,cw/2,y);
    ctx.font=smFs+'px "Noto Sans TC",sans-serif';
    ctx.fillStyle='rgba(245,230,211,0.78)';
    /* 自動換行 */
    var chars=[...value],line='',ly=y+Math.round(smFs*1.25),lh2=Math.round(smFs*1.3);
    for(var i=0;i<chars.length;i++){
      var test=line+chars[i];
      if(ctx.measureText(test).width>infoMaxW&&line.length>0){
        ctx.fillText(line,cw/2,ly);ly+=lh2;line=chars[i];
      }else{line=test;}
    }
    if(line) ctx.fillText(line,cw/2,ly);
    return ly+lh2; /* return next Y */
  }

  // 行動導向一句話
  var canvasAction='';
  if(tc.score>=65) canvasAction='\u4ECA\u5929\u80FD\u91CF\u72C0\u614B\u4E0D\u932F\uFF0C\u9069\u5408\u884C\u52D5\u3001\u505A\u6C7A\u5B9A';
  else if(tc.score>=45) canvasAction='\u4ECA\u5929\u80FD\u91CF\u5E73\u7A69\uFF0C\u91CD\u5927\u6C7A\u5B9A\u5EFA\u8B70\u7DE9\u7DE9';
  else canvasAction='\u4ECA\u5929\u80FD\u91CF\u504F\u4F4E\uFF0C\u5EFA\u8B70\u653E\u6162\u8173\u6B65';

  var ny=drawInfoBlock(infoY,'─── \u4ECA\u65E5\u63D0\u9192 ───',canvasAction);
  ny=drawInfoBlock(ny+Math.round(fs*0.2),'─── \u5EFA\u8B70\u914D\u6234 ───',tc.crystal+'\uFF08'+tc.favEl+'\u884C\u559C\u7528\u795E\u6C34\u6676\uFF09');

  /* ── 五行能量條 ── */
  var barY=ny+Math.round(fs*0.5);
  var barW=Math.round(cw*0.55);
  var barH=Math.round(fs*0.5);
  var barX=Math.round((cw-barW)/2+fs*2);
  var barGap=Math.round(fs*1.15);
  var elNames=['木','火','土','金','水'];
  var elColors={'木':'#22c55e','火':'#ef4444','土':'#eab308','金':'#a78bfa','水':'#3b82f6'};
  ctx.textAlign='left';

  elNames.forEach(function(el,i){
    var pct=tc.elPct[el]||0;
    var isFav=S.bazi.fav.indexOf(el)>=0;
    var isUnfav=S.bazi.unfav.indexOf(el)>=0;
    var by=barY+i*barGap;
    var label=el+(isFav?' 喜':isUnfav?' 忌':'');

    /* 標籤 */
    ctx.font='600 '+lblFs+'px "Noto Sans TC",sans-serif';
    ctx.fillStyle=isFav?'#4ade80':isUnfav?'#f87171':'rgba(245,230,211,0.55)';
    ctx.fillText(label,barX-Math.round(fs*2.2),by+barH*0.8);

    /* 背景條 */
    ctx.fillStyle='rgba(255,255,255,0.06)';
    roundRect(ctx,barX,by,barW,barH,barH/2);ctx.fill();

    /* 數值條 */
    if(pct>0){
      var fillW=Math.max(barH,Math.round(barW*pct/100));
      var bGrad=ctx.createLinearGradient(barX,by,barX+fillW,by);
      bGrad.addColorStop(0,hexToRGBA(elColors[el],0.8));
      bGrad.addColorStop(1,hexToRGBA(elColors[el],0.5));
      ctx.fillStyle=bGrad;
      roundRect(ctx,barX,by,fillW,barH,barH/2);ctx.fill();
    }

    /* 百分比 */
    ctx.textAlign='right';
    ctx.font=lblFs+'px "Noto Sans TC",sans-serif';
    ctx.fillStyle='rgba(245,230,211,0.6)';
    ctx.fillText(pct+'%',barX+barW+Math.round(fs*1.5),by+barH*0.8);
    ctx.textAlign='left';
  });

  /* ── 底部命理摘要 + 品牌 ── */
  var footY=barY+5*barGap+Math.round(fs*0.8);
  ctx.textAlign='center';
  ctx.font=Math.round(fs*0.7)+'px "Noto Sans TC",sans-serif';
  ctx.fillStyle='rgba(245,230,211,0.35)';
  var dm=S.bazi.dm,dmEl=S.bazi.dmEl;
  ctx.fillText('日主「'+dm+'」('+dmEl+')  喜用：'+S.bazi.fav.join('、')+'  │  當日：'+tc.gz+'('+tc.tEl+')  十神：'+tc.god,cw/2,footY);
  ctx.fillText('建議配戴：'+tc.crystal+'（'+tc.favEl+'行喜用神水晶）',cw/2,footY+Math.round(fs*0.9));

  /* 品牌浮水印 */
  var brandY=footY+Math.round(fs*2.2);
  var brandG=ctx.createLinearGradient(cw/2-80,brandY,cw/2+80,brandY);
  brandG.addColorStop(0,hexToRGBA(ch.color,0.3));brandG.addColorStop(0.5,hexToRGBA(ch.color,0.6));brandG.addColorStop(1,hexToRGBA(ch.color,0.3));
  ctx.fillStyle=brandG;
  ctx.font='bold '+Math.round(fs*0.85)+'px "Noto Serif TC",serif';
  ctx.fillText('☽ 靜月之光',cw/2,brandY);
  ctx.font=Math.round(fs*0.55)+'px "Noto Sans TC",sans-serif';
  ctx.fillStyle='rgba(245,230,211,0.25)';
  ctx.fillText('quietmoonlight.com',cw/2,brandY+Math.round(fs*0.75));
}

function dlAura(){
  var cv=document.getElementById('aura-cv');if(!cv)return;
  var tc=analyzeTodayChakra(S.bazi);
  var a=document.createElement('a');a.download='\u975C\u6708\u4E4B\u5149_'+tc.chakra.name+'.png';a.href=cv.toDataURL('image/png',0.95);a.click();
}

function resetAF(){
  auraImg=null;
  var fi=document.getElementById('aura-fi');if(fi)fi.value='';
  var uz=document.getElementById('aura-uz');if(uz)uz.style.display='';
  var prog=document.getElementById('aura-progress');if(prog){prog.style.display='none';prog.innerHTML='';}
  var res=document.getElementById('aura-result');if(res){res.style.display='none';res.innerHTML='';}
}


/* ── Hook into existing system ── */
(function(){
  var _s0=window.submitStep0;
  if(_s0)window.submitStep0=function(){_s0.apply(this,arguments);setTimeout(function(){try{renderCal30();renderAuraFilter();}catch(e){}},500);};
  var _sf=window.submitStep0Fast;
  if(_sf)window.submitStep0Fast=function(){_sf.apply(this,arguments);setTimeout(function(){try{renderCal30();renderAuraFilter();}catch(e){}},4000);};
  var _ei=window.initExtraFeatures;
  if(_ei)window.initExtraFeatures=function(){_ei.apply(this,arguments);try{renderCal30();renderAuraFilter();}catch(e){}};
  if(typeof S!=='undefined'&&S.bazi)setTimeout(function(){try{renderCal30();renderAuraFilter();}catch(e){}},300);
})();



/* ═══════════════════════════════════════════════════════════
   UI OVERHAUL — JavaScript 互動系統
   ═══════════════════════════════════════════════════════════ */

// ── 浮動粒子 ──
(function initParticles(){
  const box=document.getElementById('particles');
  if(!box)return;
  for(let i=0;i<18;i++){
    const p=document.createElement('div');
    p.className='particle';
    const size=Math.random()*4+2;
    p.style.cssText=`width:${size}px;height:${size}px;left:${Math.random()*100}%;animation-duration:${Math.random()*8+6}s;animation-delay:${Math.random()*6}s;`;
    box.appendChild(p);
  }
})();

// ── 社會認同計數動畫 ──
(function initVisitorCount(){
  const el=document.getElementById('visitor-count');
  if(!el)return;
  const base=1200+Math.floor(Math.random()*800);
  const today=new Date();
  const seed=today.getFullYear()*10000+today.getMonth()*100+today.getDate();
  const target=base+(seed%500);
  let current=0;
  const step=Math.ceil(target/40);
  const timer=setInterval(()=>{
    current+=step;
    if(current>=target){current=target;clearInterval(timer)}
    el.textContent=current.toLocaleString();
  },30);
})();

// ── 按鈕漣漪效果 ──
document.addEventListener('click',function(e){
  const btn=e.target.closest('.btn,.hook-card-v2');
  if(!btn)return;
  const rect=btn.getBoundingClientRect();
  const wave=document.createElement('span');
  wave.className='ripple-wave';
  const size=Math.max(rect.width,rect.height)*2;
  wave.style.cssText=`width:${size}px;height:${size}px;left:${e.clientX-rect.left-size/2}px;top:${e.clientY-rect.top-size/2}px;`;
  btn.style.position=btn.style.position||'relative';
  btn.style.overflow='hidden';
  btn.appendChild(wave);
  setTimeout(()=>wave.remove(),600);
});

// ── 卡片進場動畫（Intersection Observer）──
(function initCardReveal(){
  // 只對結果頁(step-3)的卡片做進場動畫，不影響其他步驟
  const step3=document.getElementById('step-3');
  if(!step3)return;
  const cards=step3.querySelectorAll('.card,.collapsible-card,.action-card,.quick-shop-card');
  cards.forEach(c=>{
    // 排除趣味功能區內的card，避免被opacity:0隱藏
    if(c.closest('#extra-features-gate')) return;
    c.classList.add('card-reveal');
  });
  const obs=new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){e.target.classList.add('visible');obs.unobserve(e.target)}
    });
  },{threshold:0.1,rootMargin:'0px 0px -30px 0px'});
  cards.forEach(c=>obs.observe(c));
})();

// ── 塔羅翻牌動畫（非侵入式 — 用 CSS 增強原始動畫）──
// 不覆蓋 pickCard，而是透過 MutationObserver 偵測牌被選中後加動畫
(function upgradeTarotPick(){
  const deck=document.getElementById('t-deck');
  if(!deck)return;
  const obs=new MutationObserver((muts)=>{
    muts.forEach(m=>{
      if(m.type==='attributes'&&m.attributeName==='class'){
        const el=m.target;
        if(el.classList.contains('picked')&&!el.dataset.animated){
          el.dataset.animated='1';
          // 牌陣接牌彈跳
          const slotIdx=document.querySelectorAll('.tarot-deck-card.picked').length-1;
          const slot=document.getElementById('t-slot-'+slotIdx);
          if(slot){
            slot.classList.add('receiving');
            setTimeout(()=>slot.classList.remove('receiving'),400);
          }
        }
      }
    });
  });
  // 延遲觀察，等牌堆初始化
  setTimeout(()=>{
    const cards=deck.querySelectorAll('.tarot-deck-card');
    cards.forEach(c=>obs.observe(c,{attributes:true}));
  },1000);
})();

// ── 梅花起卦動畫（非侵入式 — 偵測 mh-result 出現後播放動畫）──
(function upgradeMeihua(){
  const mhResult=document.getElementById('mh-result');
  if(!mhResult)return;
  const obs=new MutationObserver(()=>{
    if(!mhResult.classList.contains('hidden')&&!mhResult.dataset.animated){
      mhResult.dataset.animated='1';
      // 播放起卦動畫
      if(!S.meihua||!S.meihua.ben)return;
      const overlay=document.createElement('div');
      overlay.className='mh-casting-overlay';
      const guaName=S.meihua.ben.n||'卦';
      overlay.innerHTML=`<div class="mh-yao-anim" id="mh-anim-yaos"></div><div class="mh-gua-name" id="mh-anim-name">${guaName}</div>`;
      document.body.appendChild(overlay);
      const yaosEl=overlay.querySelector('#mh-anim-yaos');
      const nameEl=overlay.querySelector('#mh-anim-name');
      const yaos=S.meihua.ben.yaos||[1,1,1,0,0,0];
      const dong=S.meihua.dong||1;
      yaos.forEach((y,i)=>{
        const line=document.createElement('div');
        line.className='mh-yao-line '+(y?'yang':'yin');
        if(i+1===dong) line.classList.add('dong');
        yaosEl.appendChild(line);
        setTimeout(()=>line.classList.add('show'),300+i*350);
      });
      setTimeout(()=>nameEl.classList.add('show'),300+yaos.length*350+200);
      setTimeout(()=>{
        overlay.style.opacity='0';overlay.style.transition='opacity .5s';
        setTimeout(()=>overlay.remove(),500);
      },300+yaos.length*350+1500);
    }
    // Reset for next time
    if(mhResult.classList.contains('hidden')) mhResult.dataset.animated='';
  });
  obs.observe(mhResult,{attributes:true,attributeFilter:['class']});
})();

// ── 環形進度條動畫 ──
(function upgradeVerdict(){
  const origSetVerdict=window._setVerdictDisplay;
  
  // Hook into the verdict display
  const observer=new MutationObserver(()=>{
    const probEl=document.getElementById('r-vprob');
    const ringFill=document.getElementById('verdict-ring-fill');
    if(!probEl||!ringFill)return;
    
    const text=probEl.textContent;
    const match=text.match(/(\d+)/);
    if(!match)return;
    
    const pct=parseInt(match[1]);
    const circumference=2*Math.PI*70; // r=70
    const offset=circumference*(1-pct/100);
    
    // Set color based on score
    let color;
    if(pct>=70) color='#4ade80';
    else if(pct>=55) color='#d4af37';
    else if(pct>=40) color='#fbbf24';
    else color='#f87171';
    
    ringFill.style.stroke=color;
    ringFill.style.strokeDashoffset=offset;
    
    // Animate number count up
    const start=0;
    const duration=1500;
    const startTime=performance.now();
    function animate(time){
      const elapsed=time-startTime;
      const progress=Math.min(elapsed/duration,1);
      const eased=1-Math.pow(1-progress,3);
      const current=Math.round(start+(pct-start)*eased);
      probEl.textContent=current+'%';
      if(progress<1) requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
    
    observer.disconnect();
  });
  
  const target=document.getElementById('r-vprob');
  if(target) observer.observe(target,{childList:true,characterData:true,subtree:true});
})();

// ── 載入動畫升級 ──
(function upgradeLoading(){
  const overlay=document.querySelector('.loading-overlay');
  if(!overlay)return;
  
  // Add bagua spinner if not exists
  if(!overlay.querySelector('.loading-bagua')){
    const bagua=document.createElement('div');
    bagua.className='loading-bagua';
    bagua.innerHTML='<svg viewBox="0 0 80 80" width="80" height="80"><circle cx="40" cy="40" r="38" fill="none" stroke="rgba(212,175,55,0.3)" stroke-width="1.5"/><path d="M40 2a38 38 0 0 1 0 76" fill="rgba(212,175,55,0.15)" stroke="rgba(212,175,55,0.5)" stroke-width="1.5"/><path d="M40 2a38 38 0 0 0 0 76" fill="rgba(139,0,0,0.15)" stroke="rgba(139,0,0,0.5)" stroke-width="1.5"/><circle cx="40" cy="21" r="6" fill="rgba(212,175,55,0.4)"/><circle cx="40" cy="59" r="6" fill="rgba(139,0,0,0.4)"/><circle cx="40" cy="21" r="2.5" fill="rgba(139,0,0,0.6)"/><circle cx="40" cy="59" r="2.5" fill="rgba(212,175,55,0.6)"/></svg>';
    overlay.insertBefore(bagua,overlay.firstChild);
  }
})();

// ── 回答區視覺升級 ──
(function upgradeAnswerDisplay(){
  const obs=new MutationObserver(()=>{
    const answerEl=document.getElementById('r-answer');
    if(answerEl&&answerEl.innerHTML.length>10&&!answerEl.classList.contains('answer-block')){
      answerEl.classList.add('answer-block');
    }
  });
  const target=document.getElementById('r-answer');
  if(target) obs.observe(target,{childList:true,subtree:true});
})();



/* ═══════════════════════════════════════════════════════
   SECURITY PROTECTION LAYER
   ═══════════════════════════════════════════════════════ */
(function(){
  // Anti-right-click
  document.addEventListener('contextmenu',function(e){e.preventDefault();return false;});
  
  // Anti-select (prevent copy-paste of source)
  document.addEventListener('selectstart',function(e){
    if(e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA')return true;
    e.preventDefault();return false;
  });
  
  // Anti-keyboard shortcuts (F12, Ctrl+Shift+I, Ctrl+U, Ctrl+S)
  document.addEventListener('keydown',function(e){
    if(e.key==='F12')e.preventDefault();
    if(e.ctrlKey&&e.shiftKey&&(e.key==='I'||e.key==='i'||e.key==='J'||e.key==='j'))e.preventDefault();
    if(e.ctrlKey&&(e.key==='U'||e.key==='u'||e.key==='S'||e.key==='s'))e.preventDefault();
  });
  
  // DevTools detection (size-based)
  var _dtOpen=false;
  var _dtCheck=function(){
    var w=window.outerWidth-window.innerWidth>160;
    var h=window.outerHeight-window.innerHeight>160;
    if(w||h){
      if(!_dtOpen){
        _dtOpen=true;
        console.clear();
        console.log('%c⚠️ 開發者工具已偵測到','font-size:20px;color:red;font-weight:bold');
        console.log('%c此應用的原始碼受到保護，禁止複製或修改。','font-size:14px;color:orange');
      }
    }else{_dtOpen=false;}
  };
  setInterval(_dtCheck,1000);
  
  // Anti-debugger (periodic)
  var _adCnt=0;
  setInterval(function(){
    var s=Date.now();
    (function(){}).constructor('debugger')();
    if(Date.now()-s>100&&_adCnt<3){
      _adCnt++;
      console.clear();
    }
  },3000);
  
  // Integrity check - detect if script content has been modified
  var _origLen=document.querySelector('script:not([src])')?.textContent?.length||0;
  setTimeout(function(){
    var _curLen=document.querySelector('script:not([src])')?.textContent?.length||0;
    if(_origLen>0&&Math.abs(_curLen-_origLen)>500){
      console.warn('Script integrity check failed');
    }
  },5000);
  
  // Console warning
  console.log('%c⛔ 停止！','font-size:40px;color:red;font-weight:bold;text-shadow:1px 1px black');
  console.log('%c這是為你的安全而設計的瀏覽器功能。如果有人告訴你在這裡貼上什麼東西來取得功能，那是詐騙。','font-size:16px;color:#333');
  console.log('%c靜月之光 v5.0 — 版權所有 © 2024-2026','font-size:12px;color:#888');
})();

/* ═══ 真實人次計數器（Google Sheets 雲端版）═══ */
/*
 * 【設定步驟】
 * 1. 開 Google Sheets → 建新試算表
 * 2. 在 A1 輸入 total，B1 輸入 0
 * 3. 在 A2 輸入今天日期如 2026-02-19，B2 輸入 0
 * 4. 點「擴充功能」→「Apps Script」
 * 5. 貼上以下程式碼（取代原有的）：
 *
 *   function doGet(e) {
 *     var lock = LockService.getScriptLock();
 *     lock.waitLock(5000);
 *     var ss = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
 *     var action = e.parameter.action;
 *     if (action === 'get') {
 *       var total = ss.getRange('B1').getValue() || 0;
 *       var today = Utilities.formatDate(new Date(), 'Asia/Taipei', 'yyyy-MM-dd');
 *       var dailyRow = findDailyRow(ss, today);
 *       var todayCount = dailyRow ? ss.getRange('B' + dailyRow).getValue() : 0;
 *       lock.releaseLock();
 *       return ContentService.createTextOutput(JSON.stringify({total: total, today: todayCount}))
 *         .setMimeType(ContentService.MimeType.JSON);
 *     }
 *     if (action === 'increment') {
 *       var total = (ss.getRange('B1').getValue() || 0) + 1;
 *       ss.getRange('B1').setValue(total);
 *       var today = Utilities.formatDate(new Date(), 'Asia/Taipei', 'yyyy-MM-dd');
 *       var dailyRow = findDailyRow(ss, today);
 *       if (dailyRow) {
 *         var c = (ss.getRange('B' + dailyRow).getValue() || 0) + 1;
 *         ss.getRange('B' + dailyRow).setValue(c);
 *       } else {
 *         var lastRow = ss.getLastRow() + 1;
 *         ss.getRange('A' + lastRow).setValue(today);
 *         ss.getRange('B' + lastRow).setValue(1);
 *       }
 *       lock.releaseLock();
 *       return ContentService.createTextOutput(JSON.stringify({total: total}))
 *         .setMimeType(ContentService.MimeType.JSON);
 *     }
 *     lock.releaseLock();
 *     return ContentService.createTextOutput('{}').setMimeType(ContentService.MimeType.JSON);
 *   }
 *   function findDailyRow(ss, date) {
 *     var data = ss.getRange('A2:A' + ss.getLastRow()).getValues();
 *     for (var i = 0; i < data.length; i++) {
 *       var cellVal = data[i][0];
 *       if (cellVal instanceof Date) cellVal = Utilities.formatDate(cellVal, 'Asia/Taipei', 'yyyy-MM-dd');
 *       if (cellVal === date) return i + 2;
 *     }
 *     return null;
 *   }
 *
 * 6. 點「部署」→「新增部署作業」→ 類型選「網頁應用程式」
 *    - 執行身分：你自己
 *    - 誰可以存取：「所有人」
 * 7. 複製部署的網址，貼到下面 CTR_ENDPOINT
 */

// ★★★ 把這裡換成你的 Apps Script 部署網址 ★★★
const CTR_ENDPOINT = 'https://script.google.com/macros/s/AKfycbxCvM09XbFUyl0BC2im-H6DU_t2Ipjq9p-dZDGAuiildcxmBGC-CGngvvqWmaiPxW8wNQ/exec';

// ── 呼叫 Apps Script（用 script 注入，最可靠的跨域方式）──
function _gasCall(action){
  return new Promise((resolve)=>{
    const cbName = '_gasCb_' + Date.now();
    const timeout = setTimeout(()=>{
      delete window[cbName];
      resolve(null);
    }, 8000);
    
    window[cbName] = function(data){
      clearTimeout(timeout);
      delete window[cbName];
      resolve(data);
    };
    
    // Apps Script 不支援 JSONP，改用 fetch
    fetch(CTR_ENDPOINT + '?action=' + action, {redirect:'follow'})
      .then(r => r.json())
      .then(data => {
        clearTimeout(timeout);
        delete window[cbName];
        resolve(data);
      })
      .catch(()=>{
        // fetch 失敗時用 Image beacon（只能送不能收）
        if(action === 'increment'){
          new Image().src = CTR_ENDPOINT + '?action=increment&_t=' + Date.now();
        }
        clearTimeout(timeout);
        delete window[cbName];
        resolve(null);
      });
  });
}

// ── 計數 +1（每次到結果頁觸發）──
async function _countVisitor(){
  if(!CTR_ENDPOINT) return;
  const data = await _gasCall('increment');
  if(data){
    const badge=document.getElementById('counter-badge');
    if(badge && badge.classList.contains('visible')){
      document.getElementById('counter-num').textContent=(data.total||0).toLocaleString();
      if(data.today!==undefined) document.getElementById('counter-today').textContent=(data.today||0).toLocaleString();
    }
  }
}

// ── 月亮連點 5 下 ──
let _moonTapCount=0, _moonTapTimer=null;
function _moonTap(){
  _moonTapCount++;
  clearTimeout(_moonTapTimer);
  _moonTapTimer=setTimeout(()=>{_moonTapCount=0;},2000);
  if(_moonTapCount>=5){
    _moonTapCount=0;
    document.getElementById('counter-badge').classList.add('visible');
    // 立即從雲端拉數字顯示在徽章
    _gasCall('get').then(data=>{
      if(data){
        document.getElementById('counter-num').textContent=(data.total||0).toLocaleString();
        document.getElementById('counter-today').textContent=(data.today||0).toLocaleString();
      }
    });
    openAdmin();
  }
}

async function openAdmin(){
  document.getElementById('admin-count').textContent='…';
  document.getElementById('admin-today').textContent='…';
  document.getElementById('admin-overlay').classList.add('visible');
  document.getElementById('admin-panel').classList.add('visible');

  if(!CTR_ENDPOINT){
    document.getElementById('admin-count').textContent='未設定';
    document.getElementById('admin-today').textContent='未設定';
    return;
  }
  const data = await _gasCall('get');
  if(data){
    document.getElementById('admin-count').textContent=(data.total||0).toLocaleString();
    document.getElementById('admin-today').textContent=(data.today||0).toLocaleString();
    document.getElementById('counter-num').textContent=(data.total||0).toLocaleString();
    document.getElementById('counter-today').textContent=(data.today||0).toLocaleString();
  }else{
    document.getElementById('admin-count').textContent='連線失敗';
    document.getElementById('admin-today').textContent='-';
  }
}

function closeAdmin(){
  document.getElementById('admin-overlay').classList.remove('visible');
  document.getElementById('admin-panel').classList.remove('visible');
}


/* ==== ZiWei settings (simplified — modal removed) ==== */
(function(){
  const KEY = "zw_settings_v1";
  const DEFAULTS = {
    six_sha_black: true,
    bold_major_assist: true,
    concise_mode: false
  };
  function safeParse(v){ try{ return JSON.parse(v||""); }catch(e){ return null; } }
  window.getZiweiSettings = function(){
    const saved = safeParse(localStorage.getItem(KEY)) || {};
    return Object.assign({}, DEFAULTS, saved);
  };
  window.setZiweiSettings = function(next){
    const cur = window.getZiweiSettings();
    const merged = Object.assign({}, cur, next||{});
    localStorage.setItem(KEY, JSON.stringify(merged));
    return merged;
  };
})();



/* =============================================================
   [UPGRADE v7] 趣味區改吃七維邏輯 / 移除紫微主調與星盤主調依賴
   ============================================================= */
function _jd7Dims(type){
  try{
    if(typeof buildUnifiedDimensionResults!=='function' || typeof synthesizeSevenDimensions!=='function') return null;
    var dims = buildUnifiedDimensionResults(type||'general');
    if(!dims || !dims.length) return null;
    var syn = synthesizeSevenDimensions(dims, type||'general');
    syn.dimResults = dims;
    return syn;
  }catch(e){ return null; }
}
function _jd7BriefHTML(type, title){
  var syn = _jd7Dims(type||'general');
  if(!syn) return '';
  var c = syn.finalDir==='pos'?'#4caf50':syn.finalDir==='neg'?'#e05c2f':'#d4af37';
  return '<div style="margin-top:10px;padding:10px 12px;background:rgba(212,175,55,.05);border-left:3px solid '+c+';border-radius:0 8px 8px 0">'
    +'<div style="font-size:.86rem;font-weight:700;color:'+c+'">'+(title||'七維綜合提醒')+'｜'+(syn.shortConclusion||'')+'</div>'
    +'<div style="font-size:.8rem;line-height:1.7;color:var(--c-text-dim);margin-top:4px">'
    +(syn.coreSupports&&syn.coreSupports.length?('支持：'+syn.coreSupports.slice(0,2).join('；')+'。 '):'')
    +(syn.coreRisks&&syn.coreRisks.length?('風險：'+syn.coreRisks.slice(0,2).join('；')+'。 '):'')
    +(syn.actionAdvice&&syn.actionAdvice.length?('建議：'+syn.actionAdvice.slice(0,2).join('；')+'。'):'')
    +'</div></div>';
}

var _showFortuneResult_base = showFortuneResult;
showFortuneResult = function(f){
  _showFortuneResult_base(f);
  try{
    var container = document.getElementById('daily-fortune-content');
    if(!container) return;
    container.innerHTML += _jd7BriefHTML('general','七維今日總覽');
  }catch(e){}
};

var _generateLuckyInfo_base = generateLuckyInfo;
generateLuckyInfo = function(){
  _generateLuckyInfo_base();
  try{
    var container=document.getElementById('lucky-gen-content');
    if(!container||!S.bazi) return;
    var syn=_jd7Dims('general');
    if(!syn) return;
    var dims=(syn.dimResults||[]).slice().sort(function(a,b){return (b.score||0)-(a.score||0);});
    var top=dims.slice(0,3).map(function(d){return d.dim+' '+(d.verdict||'');});
    var low=dims.slice().sort(function(a,b){return (a.score||0)-(b.score||0);}).slice(0,2).map(function(d){return d.dim+' '+(d.reason||'');});
    container.innerHTML += '<div style="margin-top:12px;padding:12px;border-radius:10px;background:rgba(212,175,55,.05);border-left:3px solid rgba(212,175,55,.45)">'
      +'<div style="font-size:.9rem;font-weight:700;color:var(--c-gold)">📡 七維幸運校正</div>'
      +'<div style="font-size:.82rem;line-height:1.8;color:var(--c-text-dim);margin-top:6px">'
      +(top.length?'今天最能借力的維度：'+top.join('｜')+'。 ':'')
      +(low.length?'今天最該避雷的維度：'+low.join('｜')+'。 ':'')
      +(syn.actionAdvice&&syn.actionAdvice.length?'建議先做：'+syn.actionAdvice[0]+'。':'')
      +'</div></div>';
  }catch(e){}
};

var _renderCal30_base = renderCal30;
renderCal30 = function(){
  _renderCal30_base();
  try{
    var box=document.getElementById('cal30-box');
    if(!box||!S.bazi) return;
    box.innerHTML = box.innerHTML.replace('依你的八字，計算未來 30 天每日天干地支吉凶','依七維命理交叉校正未來 30 天節奏，基底仍以八字日運為主');
    var syn=_jd7Dims('general');
    if(!syn) return;
    box.innerHTML = _jd7BriefHTML('general','行事曆使用說明') + box.innerHTML;
  }catch(e){}
};

var _showAuraResult_base = showAuraResult;
showAuraResult = function(){
  _showAuraResult_base();
  try{
    var res=document.getElementById('aura-result');
    if(!res||!S.bazi) return;
    res.innerHTML += _jd7BriefHTML('general','七維靈氣校正');
  }catch(e){}
};


/* =============================================================
   [PATCH v9 disabled] 恢復舊版八字喜用神改運 UI
   ============================================================= */
(function(){
  if(typeof renderRemedy!=='function') return;
  /* 保留原始 renderRemedy，不再額外插入七維交叉卡片，
     讓結果頁維持舊版『八字喜用神』改運區樣式。 */
})();;

// ═══════════════════════════════════════════════════════════════
// 首頁重設計 + 每日免費額度管控
// 拿掉六宮格，改為神秘感單一入口
// ═══════════════════════════════════════════════════════════════
(function() {
  'use strict';

  // ══ 計算當前表單的 person signature（跟 Worker 端 buildPersonSignature 對齊）══
  function _getFormPersonKey() {
    try {
      var nameEl = document.getElementById('f-name');
      var bdateEl = document.getElementById('f-bdate');
      var btimeEl = document.getElementById('f-btime');
      var genderEl = document.querySelector('input[name="gender"]:checked');
      var name = nameEl ? nameEl.value.trim() : '';
      var bdate = bdateEl ? bdateEl.value.trim() : '';
      var btime = btimeEl ? btimeEl.value.trim() : '';
      var gender = genderEl ? genderEl.value : '';
      var birth = bdate + (btime ? ' ' + btime : '');
      var parts = [name, birth, gender].filter(Boolean);
      if (!parts.length) return 'anon';
      var raw = parts.join('|');
      var hash = 0;
      for (var i = 0; i < raw.length; i++) {
        hash = ((hash << 5) - hash) + raw.charCodeAt(i);
        hash |= 0;
      }
      return 'sig_' + Math.abs(hash);
    } catch(e) { return 'anon'; }
  }

  // ══ 本地快檢（帶 person signature，同裝置不同人不互鎖）══
  function _checkUsedToday() {
    if (window._JY_ADMIN_TOKEN) return false;
    try {
      var d = JSON.parse(localStorage.getItem('jy_ai_used') || '{}');
      var today = new Date();
      var todayStr = today.getFullYear() + '-' + String(today.getMonth()+1).padStart(2,'0') + '-' + String(today.getDate()).padStart(2,'0');
      if (d.date !== todayStr) return false;
      var personKey = _getFormPersonKey();
      if (d.people && d.people[personKey] && d.people[personKey].used) return true;
      return false;
    } catch(e) { return false; }
  }

  // ══ Worker 預檢（查 KV，不跑 AI，不花錢）══
  async function _preCheckRateLimit() {
    if (window._JY_ADMIN_TOKEN) return { allowed: true };
    try {
      var nameEl = document.getElementById('f-name');
      var bdateEl = document.getElementById('f-bdate');
      var btimeEl = document.getElementById('f-btime');
      var genderEl = document.querySelector('input[name="gender"]:checked');
      var payload = {
        name: nameEl ? nameEl.value.trim() : '',
        birth: (bdateEl ? bdateEl.value.trim() : '') + (btimeEl && btimeEl.value ? ' ' + btimeEl.value.trim() : ''),
        gender: genderEl ? genderEl.value : ''
      };
      var body = { action: 'check', payload: payload };
      if (window._JY_ADMIN_TOKEN) body.admin_token = window._JY_ADMIN_TOKEN;
      var resp = await fetch('https://jy-ai-proxy.onerkk.workers.dev', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      var data = await resp.json();
      return data;
    } catch(e) {
      console.warn('[PreCheck] failed, allowing:', e);
      return { allowed: true };
    }
  }

  // ══ 已用完彈窗 ══
  function _showUsedModal() {
    if (document.getElementById('jy-used-modal')) return;
    var modal = document.createElement('div');
    modal.id = 'jy-used-modal';
    modal.style.cssText = 'position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.75);backdrop-filter:blur(6px);animation:fadeIn .3s';
    modal.innerHTML =
      '<div style="max-width:320px;width:88%;background:linear-gradient(145deg,#1a0a0a,#2a1515);border:1.5px solid rgba(212,175,55,.35);border-radius:18px;padding:2.2rem 1.5rem;text-align:center;box-shadow:0 24px 80px rgba(0,0,0,.6)">' +
        '<div style="font-size:2.8rem;margin-bottom:1rem;filter:drop-shadow(0 0 12px rgba(212,175,55,.3))">🌙</div>' +
        '<h3 style="color:var(--c-gold,#d4af37);font-size:1.05rem;margin-bottom:.6rem;font-family:var(--f-display,serif)">今日的緣分已用盡</h3>' +
        '<p style="font-size:.85rem;color:var(--c-text-dim,#a09880);line-height:1.7;margin-bottom:.3rem">命盤每天只能翻閱一次</p>' +
        '<p style="font-size:.78rem;color:var(--c-text-muted,#6b6355);margin-bottom:1.5rem">子時（00:00）重置，明天再來問</p>' +
        '<div style="display:flex;flex-direction:column;gap:.5rem;align-items:center">' +
          '<a href="https://tw.shp.ee/2n5Mo2w" target="_blank" rel="noopener" style="display:flex;align-items:center;justify-content:center;gap:6px;width:200px;padding:11px;border-radius:10px;background:linear-gradient(135deg,rgba(212,175,55,.15),rgba(212,175,55,.06));color:var(--c-gold,#d4af37);text-decoration:none;font-size:.85rem;font-weight:600;border:1px solid rgba(212,175,55,.3)"><i class="fas fa-gem"></i> 逛逛能量水晶</a>' +
          '<button onclick="document.getElementById(\'jy-used-modal\').remove()" style="width:200px;padding:11px;border-radius:10px;background:transparent;color:var(--c-text-dim,#a09880);font-size:.82rem;border:1px solid rgba(255,255,255,.08);cursor:pointer;font-family:inherit">知道了</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(modal);
  }

  // ══ 重設計首頁 hook-screen ══
  function _redesignHomepage() {
    var hookScreen = document.getElementById('hook-screen');
    if (!hookScreen) return;

    var isAdmin = !!(window._JY_ADMIN_TOKEN);
    var used = _checkUsedToday();

    // 保留粒子背景
    var particles = hookScreen.querySelector('.particles');
    var particlesHtml = particles ? particles.outerHTML : '';

    hookScreen.innerHTML = particlesHtml +
    '<div style="position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;min-height:75vh;justify-content:center;padding:2rem 1rem">' +

      // 月亮（保留 admin 彩蛋）
      '<div class="hero-moon" id="hero-moon" onclick="_moonTap()" style="margin-bottom:1.5rem">' +
        '<div class="hero-moon-crescent"></div>' +
      '</div>' +

      // 計數器（保留但低調）
      '<div class="counter-badge" id="counter-badge" style="margin-bottom:1.2rem"><i class="fas fa-user-clock"></i> 今日 <span id="counter-today">0</span> 人 ｜ <i class="fas fa-users"></i> 累計 <span id="counter-num">0</span> 人</div>' +

      // 主標語
      '<h1 style="font-size:clamp(1.5rem,5vw,2rem);letter-spacing:.06em;text-align:center;margin-bottom:.6rem;font-family:var(--f-display,serif);color:var(--c-text,#e8e0d0)">' +
        '靜月之光' +
      '</h1>' +

      '<p style="font-size:.95rem;color:var(--c-text-dim,#a09880);text-align:center;max-width:300px;line-height:1.9;margin-bottom:.4rem;font-family:var(--f-display,serif)">' +
        '你心裡的事，牌都知道' +
      '</p>' +
      '<p style="font-size:.76rem;color:var(--c-text-muted,#6b6355);text-align:center;max-width:320px;line-height:1.7;margin-bottom:2rem">' +
        '金色黎明塔羅牌 · AI 深度解讀<br>不用填生日，抽牌就有答案' +
      '</p>' +

      // CTA 按鈕（塔羅快讀永遠可用）
      '<button id="home-cta-btn" onclick="_enterFromHome()" style="' +
          'display:flex;align-items:center;justify-content:center;gap:.6rem;' +
          'width:100%;max-width:300px;' +
          'padding:1.1rem 2rem;border-radius:14px;' +
          'background:transparent;' +
          'color:var(--c-gold,#d4af37);' +
          'font-size:1.05rem;font-weight:700;font-family:var(--f-display,serif);' +
          'border:1.5px solid rgba(212,175,55,.4);' +
          'cursor:pointer;transition:all .3s;' +
          'box-shadow:0 0 30px rgba(212,175,55,.08),inset 0 0 20px rgba(212,175,55,.03);' +
          'letter-spacing:.08em;' +
          'animation:home-cta-breathe 3s ease-in-out infinite">' +
          '🌙 開始解讀' +
        '</button>' +

      // 底部提示
      '<div style="margin-top:1.5rem;text-align:center">' +
        (isAdmin ?
          '<span style="font-size:.7rem;color:#a78bfa;opacity:.5">👑 管理員・無限次</span>' :
          '<span style="font-size:.73rem;color:var(--c-text-muted,#6b6355)">✦ 免費塔羅解讀 · 不限次數</span>'
        ) +
      '</div>' +

    '</div>' +

    // 呼吸動畫
    '<style>@keyframes home-cta-breathe{0%,100%{box-shadow:0 0 30px rgba(212,175,55,.08),inset 0 0 20px rgba(212,175,55,.03);border-color:rgba(212,175,55,.4)}50%{box-shadow:0 0 45px rgba(212,175,55,.15),inset 0 0 30px rgba(212,175,55,.06);border-color:rgba(212,175,55,.6)}}</style>';
  }

  // ══ 從首頁進入 — 顯示 input-screen 帶類型選擇 ══
  window._enterFromHome = function() {
    // 塔羅快讀不需要檢查額度
    document.getElementById('hook-screen').style.display = 'none';
    var tp = document.getElementById('trust-preview');
    if (tp) tp.style.display = 'none';

    // 在 input-screen 最頂部注入類型選擇（如果還沒注入的話）
    var inputScreen = document.getElementById('input-screen');
    if (inputScreen && !document.getElementById('jy-type-picker')) {
      var picker = document.createElement('div');
      picker.id = 'jy-type-picker';
      picker.className = 'card';
      picker.style.cssText = 'margin-bottom:var(--sp-md)';
      picker.innerHTML =
        '<div class="card-title" style="margin-bottom:.6rem"><i class="fas fa-compass"></i> 你想問哪方面？</div>' +
        '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:.5rem">' +
          '<button class="jy-tp-btn" onclick="_pickTypeNew(\'love\')" style="padding:.7rem .4rem;border-radius:10px;background:rgba(255,255,255,.03);border:1.5px solid rgba(255,255,255,.08);color:var(--c-text-dim);font-size:.82rem;cursor:pointer;transition:all .2s;font-family:inherit;display:flex;flex-direction:column;align-items:center;gap:.25rem"><span style="font-size:1.2rem">💕</span>感情</button>' +
          '<button class="jy-tp-btn" onclick="_pickTypeNew(\'career\')" style="padding:.7rem .4rem;border-radius:10px;background:rgba(255,255,255,.03);border:1.5px solid rgba(255,255,255,.08);color:var(--c-text-dim);font-size:.82rem;cursor:pointer;transition:all .2s;font-family:inherit;display:flex;flex-direction:column;align-items:center;gap:.25rem"><span style="font-size:1.2rem">💼</span>事業</button>' +
          '<button class="jy-tp-btn" onclick="_pickTypeNew(\'wealth\')" style="padding:.7rem .4rem;border-radius:10px;background:rgba(255,255,255,.03);border:1.5px solid rgba(255,255,255,.08);color:var(--c-text-dim);font-size:.82rem;cursor:pointer;transition:all .2s;font-family:inherit;display:flex;flex-direction:column;align-items:center;gap:.25rem"><span style="font-size:1.2rem">💰</span>財運</button>' +
          '<button class="jy-tp-btn" onclick="_pickTypeNew(\'health\')" style="padding:.7rem .4rem;border-radius:10px;background:rgba(255,255,255,.03);border:1.5px solid rgba(255,255,255,.08);color:var(--c-text-dim);font-size:.82rem;cursor:pointer;transition:all .2s;font-family:inherit;display:flex;flex-direction:column;align-items:center;gap:.25rem"><span style="font-size:1.2rem">🏥</span>健康</button>' +
          '<button class="jy-tp-btn" onclick="_pickTypeNew(\'relationship\')" style="padding:.7rem .4rem;border-radius:10px;background:rgba(255,255,255,.03);border:1.5px solid rgba(255,255,255,.08);color:var(--c-text-dim);font-size:.82rem;cursor:pointer;transition:all .2s;font-family:inherit;display:flex;flex-direction:column;align-items:center;gap:.25rem"><span style="font-size:1.2rem">🤝</span>人際</button>' +
          '<button class="jy-tp-btn" onclick="_pickTypeNew(\'family\')" style="padding:.7rem .4rem;border-radius:10px;background:rgba(255,255,255,.03);border:1.5px solid rgba(255,255,255,.08);color:var(--c-text-dim);font-size:.82rem;cursor:pointer;transition:all .2s;font-family:inherit;display:flex;flex-direction:column;align-items:center;gap:.25rem"><span style="font-size:1.2rem">🏠</span>家庭</button>' +
        '</div>';
      inputScreen.insertBefore(picker, inputScreen.firstChild);

      // 隱藏 breadcrumb（已選類型 tag + 返回按鈕 — 改用新 picker）
      var breadcrumb = inputScreen.querySelector('.tag.tag-gold');
      if (breadcrumb && breadcrumb.parentNode) breadcrumb.parentNode.style.display = 'none';
    }

    inputScreen.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  window._pickTypeNew = function(type) {
    document.getElementById('f-type').value = type;
    // 高亮選中
    document.querySelectorAll('.jy-tp-btn').forEach(function(b) {
      b.style.borderColor = 'rgba(255,255,255,.08)';
      b.style.background = 'rgba(255,255,255,.03)';
      b.style.color = 'var(--c-text-dim)';
    });
    event.currentTarget.style.borderColor = 'rgba(212,175,55,.5)';
    event.currentTarget.style.background = 'rgba(212,175,55,.08)';
    event.currentTarget.style.color = 'var(--c-gold,#d4af37)';

    // 載入問題預設
    if (typeof Q_PRESETS !== 'undefined' && typeof selectedPresetQ !== 'undefined') {
      var presets = Q_PRESETS[type] || [];
      var grid = document.getElementById('q-presets');
      if (grid) {
        selectedPresetQ = '';
        grid.innerHTML = presets.map(function(q) {
          return '<button class="q-preset-btn" onclick="selectPreset(this,\'' + q.replace(/'/g, "\\'") + '\')">' + q + '</button>';
        }).join('') +
        '<button class="q-preset-btn" onclick="showCustomQ(this)" style="color:var(--c-text-muted)"><i class="fas fa-pen" style="margin-right:4px"></i> 自己寫問題</button>';
      }
    }
  };

  // ══ 攔截 submitStep0 / submitStep0Fast ══
  // ★ 先本地快檢 → 再 Worker KV 預檢 → 都通過才放行
  var _origSubmit0 = window.submitStep0;
  var _origSubmit0Fast = window.submitStep0Fast;

  window.submitStep0 = async function() {
    if (_checkUsedToday()) { _showUsedModal(); return; }
    var check = await _preCheckRateLimit();
    if (!check.allowed) { _showUsedModal(); return; }
    if (_origSubmit0) _origSubmit0.apply(this, arguments);
  };

  window.submitStep0Fast = async function() {
    if (_checkUsedToday()) { _showUsedModal(); return; }
    var check = await _preCheckRateLimit();
    if (!check.allowed) { _showUsedModal(); return; }
    if (_origSubmit0Fast) _origSubmit0Fast.apply(this, arguments);
  };

  // ══ 執行 ══
  function _init() {
    _redesignHomepage();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _init);
  } else {
    _init();
  }

  // ══ 覆寫塔羅 — 根據問題自動選牌陣 ══
  var _origInitDeck = window.initTarotDeck;
  window.initTarotDeck = function() {
    // 偵測問題類型 → 選牌陣
    var q = (S.form && S.form.question) ? S.form.question : '';
    var t = (S.form && S.form.type) ? S.form.type : 'general';
    if (typeof detectSpreadType === 'function') {
      var spreadId = detectSpreadType(q, t);
      if (typeof setCurrentSpread === 'function') setCurrentSpread(spreadId);
      console.log('[Tarot] 問題偵測 → 牌陣:', spreadId);
    }

    // 取當前牌陣定義
    var def = (typeof getCurrentSpreadDef === 'function') ? getCurrentSpreadDef() : null;
    var count = def ? def.count : 10;

    // 更新 step-2 標題和說明
    try {
      var hint = document.getElementById('pick-hint');
      if (hint) hint.textContent = '← 滑動瀏覽，選出 ' + count + ' 張牌 →';
      var remainText = document.getElementById('t-remain-text');
      if (remainText) remainText.innerHTML = '已選 <strong id="t-remain-picked" class="text-gold">0</strong> / ' + count + ' 張';

      // 顯示牌陣名稱
      var titleEl = document.querySelector('#step-2 .card-title');
      if (titleEl && def) {
        titleEl.innerHTML = '<i class="fas fa-star"></i> ' + def.zh;
      }

      // 在牌陣標題下方加一行說明
      var descEl = document.getElementById('jy-spread-desc');
      if (!descEl && def) {
        descEl = document.createElement('p');
        descEl.id = 'jy-spread-desc';
        descEl.style.cssText = 'text-align:center;font-size:.78rem;color:var(--c-text-muted);margin-top:-.3rem;margin-bottom:.5rem';
        var cardTitleParent = document.querySelector('#step-2 .card-title');
        if (cardTitleParent && cardTitleParent.parentNode) {
          cardTitleParent.parentNode.insertBefore(descEl, cardTitleParent.nextSibling);
        }
      }
      if (descEl && def) descEl.textContent = def.desc;
    } catch(e) { console.warn('[Tarot UI]', e); }

    // 呼叫原始 initTarotDeck（它會渲染牌堆）
    if (_origInitDeck) _origInitDeck();

    // ── 牌位 layout 已由 tarot_upgrade.js 的 initTarotDeck override 處理 ──
    // 只在 buildSlotLayout 不可用時做 fallback
    try {
      if (def && def.id !== 'celtic_cross') {
        var chosen = document.getElementById('t-chosen');
        if (chosen && !chosen.querySelector('.jy-wrap')) {
          // tarot_upgrade 的佈局沒生效，做 fallback
          var customHtml = (typeof buildSlotLayout === 'function') ? buildSlotLayout(def.id, def) : null;
          if (customHtml) {
            chosen.innerHTML = customHtml;
          }
        }
        // 更新 t-spread-sec 的標題
        var titleText = document.getElementById('t-spread-title-text');
        if (titleText && def) titleText.textContent = def.zh;
      }
    } catch(e) { console.warn('[Tarot Layout]', e); }
  };

  // ══ 覆寫 autoDraw — 根據牌陣張數抽牌 ══
  var _origAutoDraw = window.autoDraw;
  window.autoDraw = function() {
    var def = (typeof getCurrentSpreadDef === 'function') ? getCurrentSpreadDef() : null;
    var targetCount = def ? def.count : 10;

    // 調整 btn-analyze 的啟用條件
    if (!deckShuffled.length) initTarotDeck();
    if (drawnCards.length >= targetCount) return;

    var deckEl = document.getElementById('t-deck');
    if (!deckEl) return;
    var cards = deckEl.querySelectorAll('.tarot-deck-card:not(.picked)');
    if (!cards.length) return;

    var remaining = targetCount - drawnCards.length;
    var toPick = Array.from(cards).slice(0, remaining);

    var delay = 0;
    toPick.forEach(function(cardEl, i) {
      setTimeout(function() {
        cardEl.click();
      }, delay);
      delay += 700;
    });
  };

  // ══ 覆寫 pickCard 的完成判定 — 根據牌陣張數 ══
  // 監聽 drawnCards 長度，到達目標數量時啟用分析按鈕
  var _origPickCard = window.pickCard;
  if (_origPickCard) {
    window.pickCard = function(deckIdx, deckEl) {
      _origPickCard(deckIdx, deckEl);
      // 檢查是否到達目標數量
      var def = (typeof getCurrentSpreadDef === 'function') ? getCurrentSpreadDef() : null;
      var targetCount = def ? def.count : 10;
      var btn = document.getElementById('btn-analyze');
      if (btn && drawnCards.length >= targetCount) {
        btn.disabled = false;
      }
    };
  }

  // ══ 覆寫自動模式抽牌（submitStep0Fast 裡的塔羅區段）══
  // 在 submitStep0Fast 的覆寫鏈裡，塔羅抽牌部分需要知道牌陣張數
  // 由於 submitStep0Fast 已被覆寫（rate limit check），在這裡再包一層
  var _prevSubmitFast = window.submitStep0Fast;
  window.submitStep0Fast = function() {
    // 先偵測牌陣（在 form 資料填入後）
    var qEl = document.getElementById('f-question');
    var tEl = document.getElementById('f-type');
    var q = qEl ? qEl.value.trim() : '';
    var t = tEl ? tEl.value : 'general';
    if (typeof detectSpreadType === 'function' && typeof setCurrentSpread === 'function') {
      setCurrentSpread(detectSpreadType(q, t));
      console.log('[AutoMode] 牌陣偵測:', getCurrentSpread());
    }
    // 繼續原始流程
    if (_prevSubmitFast) _prevSubmitFast.apply(this, arguments);
  };

  console.log('[Home] 首頁重設計 + 額度管控 + 塔羅牌陣已啟用');
})();


// ═══════════════════════════════════════════════════════════════
// 塔羅快速入口：新流程函數
// ═══════════════════════════════════════════════════════════════

// ── submitTarotQuick：只跑塔羅，不填生辰 ──
function submitTarotQuick() {
  var type = document.getElementById('f-type').value;
  var question = document.getElementById('f-question').value.trim();
  if (!type || !question) { alert('請選擇方向並輸入問題'); return; }

  S.form = { type: type, question: question, gender: '', bdate: '', btime: '', name: '' };
  S._tarotOnlyMode = true;
  drawnCards = [];
  S.meihua = null;
  S.tarot = { drawn: [], spread: [] };

  // ── 塔羅抽牌動畫 overlay ──
  var overlay = document.createElement('div');
  overlay.className = 'loading-overlay';
  overlay.id = 'loading-overlay-tarot';

  // 粒子
  var particleHTML = '';
  for (var i = 0; i < 20; i++) {
    var x = Math.random() * 100, dur = 3 + Math.random() * 4, delay = Math.random() * 5;
    particleHTML += '<div class="ld-particle" style="left:' + x + '%;bottom:-5%;--dur:' + dur + 's;--delay:' + delay + 's"></div>';
  }

  overlay.innerHTML =
    '<div class="ld-particles">' + particleHTML + '</div>' +
    '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;gap:1.5rem">' +
      '<div style="font-size:3rem;animation:home-cta-breathe 2s ease-in-out infinite">🃏</div>' +
      '<div class="ld-status" id="ld-tarot-status" style="font-size:1rem;color:var(--c-gold)">正在為你翻牌…</div>' +
      '<div class="ld-sub" id="ld-tarot-sub" style="font-size:.78rem;color:var(--c-text-dim)">凝神感應你的問題</div>' +
    '</div>';
  document.body.appendChild(overlay);

  // ── 偵測牌陣 ──
  var spreadId = 'celtic_cross';
  if (typeof detectSpreadType === 'function' && typeof setCurrentSpread === 'function') {
    spreadId = detectSpreadType(question, type);
    setCurrentSpread(spreadId);
  }
  var spreadDef = (typeof getCurrentSpreadDef === 'function') ? getCurrentSpreadDef() : null;
  var targetCount = spreadDef ? spreadDef.count : 10;

  // ── 種子抽牌（用時間+問題+類型作為種子，不依賴生辰） ──
  setTimeout(function() {
    try {
      var st = document.getElementById('ld-tarot-status');
      var sb = document.getElementById('ld-tarot-sub');
      if (st) { st.style.opacity = '0'; setTimeout(function(){ st.textContent = '感應牌面能量…'; st.style.opacity = '1'; }, 200); }
      if (sb) { sb.style.opacity = '0'; setTimeout(function(){ sb.textContent = spreadDef ? spreadDef.zh + '（' + targetCount + '張）' : targetCount + '張牌'; sb.style.opacity = '1'; }, 200); }

      // 用時間戳作為種子（每次都不同 = 當下能量）
      var now = new Date();
      var seed = now.getTime().toString() + question + type;
      var _rng = (typeof makeSeededRng === 'function') ? makeSeededRng(seed, type, question, now.toISOString()) : Math.random;
      var shuffled = (typeof seededShuffle === 'function' && typeof TAROT !== 'undefined') ? seededShuffle(TAROT, _rng) : [];
      var autoDrawn = [];

      for (var i = 0; i < targetCount && i < shuffled.length; i++) {
        var card = shuffled[i];
        var _r2 = (typeof makeSeededRng === 'function') ? makeSeededRng(seed, type, question, String(card.id)) : Math.random;
        if (typeof _r2 === 'function') { for (var _k = 0; _k <= card.id; _k++) _r2(); }
        var isUp = (typeof _r2 === 'function') ? (_r2() > 0.48) : (Math.random() > 0.48);
        var posName = (spreadDef && spreadDef.positions && spreadDef.positions[i]) ? spreadDef.positions[i].name : '';
        autoDrawn.push(Object.assign({}, card, { isUp: isUp, pos: posName }));
      }

      drawnCards = autoDrawn;
      S.tarot = { drawn: autoDrawn, spread: autoDrawn, spreadType: spreadId, spreadDef: spreadDef };
      try { if (typeof enhanceTarot === 'function') enhanceTarot(S.tarot); } catch(e) { console.warn('[TarotQuick] enhanceTarot:', e); }

      console.log('[TarotQuick] 牌陣:' + spreadId + '(' + targetCount + '張) 抽牌完成');
    } catch(e) {
      console.error('[TarotQuick] 抽牌失敗:', e);
      drawnCards = [];
      S.tarot = { drawn: [], spread: [] };
    }
  }, 800);

  // ── 完成 → 跳轉塔羅結果頁 ──
  setTimeout(function() {
    var st = document.getElementById('ld-tarot-status');
    if (st) { st.style.opacity = '0'; setTimeout(function(){ st.textContent = '翻牌完成'; st.style.opacity = '1'; }, 200); }
  }, 1800);

  setTimeout(function() {
    var ol = document.getElementById('loading-overlay-tarot');
    if (ol) { ol.style.transition = 'opacity .5s'; ol.style.opacity = '0'; setTimeout(function(){ ol.remove(); }, 500); }
    showTarotResult();
  }, 2200);
}

// ── showTarotResult：顯示塔羅結果頁 ──
function showTarotResult() {
  goStep('step-tarot');

  // 顯示問題
  var hero = document.getElementById('tarot-question-hero');
  if (hero) hero.innerHTML = '「' + (S.form.question || '') + '」';

  // 沿用問題到七維度表單
  var f2q = document.getElementById('f2-question');
  if (f2q) f2q.value = S.form.question || '';

  // 渲染牌面
  renderTarotSpreadDisplay();

  // 觸發 AI 塔羅解讀
  if (typeof _triggerTarotAI === 'function') {
    _triggerTarotAI();
  }
}

// ── renderTarotSpreadDisplay：在塔羅結果頁渲染牌面 ──
function renderTarotSpreadDisplay() {
  var el = document.getElementById('tarot-spread-display');
  if (!el) return;

  var title = document.getElementById('tarot-spread-title');
  var def = S.tarot.spreadDef || null;
  if (title && def) title.textContent = def.zh || '你的牌陣';

  var h = '';
  var ftKey = { love:'love', career:'career', wealth:'wealth', health:'health', relationship:'love', family:'love' }[(S.form && S.form.type) || ''] || '';

  (drawnCards || []).forEach(function(c, i) {
    if (!c) return;
    var posName = (def && def.positions && def.positions[i]) ? def.positions[i].name : ('第' + (i + 1) + '張');
    var posZh = (def && def.positions && def.positions[i]) ? def.positions[i].zh : '';
    var dp = (typeof getTarotDeep === 'function') ? getTarotDeep(c) : {};
    var coreDesc = c.isUp ? (dp.coreUp || '') : (dp.coreRv || '');
    var fc = (typeof TAROT !== 'undefined' && TAROT[c.id]) ? TAROT[c.id] : c;
    var typeR = ftKey ? (c.isUp ? (fc[ftKey + 'Up'] || '') : (fc[ftKey + 'Rv'] || '')) : '';
    var elC = { '火': '#ef4444', '水': '#3b82f6', '風': '#22d3ee', '土': '#a78b5a' }[c.el] || 'var(--c-gold)';
    var kw = c.isUp ? (fc.kwUp || '') : (fc.kwRv || '');
    var imgSrc = (typeof getTarotCardImage === 'function') ? getTarotCardImage(c) : '';
    var gdInfo = c.gdCourt ? '<div style="font-size:.7rem;color:#a78bfa;margin-top:.2rem">⚡ ' + c.gdCourt.combo + '</div>' : '';

    h += '<div class="card" style="padding:.7rem;margin-bottom:.4rem;border-left:3px solid ' + elC + '">';
    h += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.3rem">';
    h += '<span class="tag tag-gold" style="font-size:.75rem">' + (i + 1) + '. ' + posName + '</span>';
    h += '<span class="tag ' + (c.isUp ? 'tag-blue' : 'tag-red') + '" style="font-size:.7rem">' + (c.isUp ? '正位' : '逆位') + '</span></div>';
    if (posZh) h += '<div style="font-size:.7rem;color:var(--c-text-muted);margin-bottom:.3rem">' + posZh + '</div>';
    h += '<div style="display:flex;gap:.6rem;align-items:flex-start">';
    if (imgSrc) h += '<img src="' + imgSrc + '" alt="' + c.n + '" style="width:55px;height:85px;border-radius:5px;flex-shrink:0;object-fit:cover;' + (c.isUp ? '' : 'transform:rotate(180deg)') + '">';
    h += '<div style="flex:1"><strong class="text-gold serif" style="font-size:.9rem">' + (c.n || c.name) + '</strong>';
    if (kw) h += '<div style="font-size:.7rem;color:var(--c-text-dim);margin-top:.15rem">🔑 ' + kw + '</div>';
    h += gdInfo;
    h += '<p style="font-size:.78rem;color:var(--c-text-dim);margin-top:.2rem;line-height:1.5">' + (c.isUp ? fc.up : fc.rv) + '</p>';
    if (typeR) h += '<p style="font-size:.76rem;color:var(--c-gold-light,#e8c968);margin-top:.2rem;line-height:1.5;border-top:1px solid rgba(212,175,55,.1);padding-top:.2rem">📌 ' + typeR + '</p>';
    if (coreDesc) h += '<p style="font-size:.74rem;color:var(--c-gold-light);margin-top:.15rem;line-height:1.4;opacity:.85">' + coreDesc + '</p>';
    h += '</div></div></div>';
  });

  el.innerHTML = h;
}

// ── enterFullAnalysis：從塔羅結果進七維度 ──
function enterFullAnalysis() {
  var question = document.getElementById('f2-question').value.trim();
  var gender = document.querySelector('input[name="gender2"]:checked');
  var bdate = document.getElementById('f2-bdate').value;
  if (!question || !gender || !bdate) { alert('請填寫：問題、性別、出生日期'); return; }

  var btime = document.getElementById('f2-btime').value || '12:00';
  var name = document.getElementById('f2-name').value.trim();

  // 把資料寫入原始表單（讓 submitStep0Fast 讀得到）
  var fType = document.getElementById('f-type');
  var fQuestion = document.getElementById('f-question');
  var fBdate = document.getElementById('f-bdate');
  var fBtime = document.getElementById('f-btime');
  var fName = document.getElementById('f-name');

  if (fType) fType.value = S.form.type || 'general';
  if (fQuestion) fQuestion.value = question;
  if (fBdate) fBdate.value = bdate;
  if (fBtime) fBtime.value = btime;
  if (fName) fName.value = name;

  // 設置性別 radio
  var genderRadios = document.querySelectorAll('input[name="gender"]');
  genderRadios.forEach(function(r) { r.checked = (r.value === gender.value); });

  // 保存塔羅快讀結果（tab 切回用）
  S._tarotQuickResult = {
    question: S.form.question,
    aiHtml: document.getElementById('tarot-ai-wrap') ? document.getElementById('tarot-ai-wrap').innerHTML : '',
    spreadHtml: document.getElementById('tarot-spread-display') ? document.getElementById('tarot-spread-display').innerHTML : '',
    crystalHtml: document.getElementById('tarot-crystal-rec') ? document.getElementById('tarot-crystal-rec').innerHTML : ''
  };
  S._fromTarot = true;
  S._tarotOnlyMode = false;

  // 重置塔羅（當下能量，重新抽）
  drawnCards = [];
  S.tarot = { drawn: [], spread: [] };

  // 觸發原始的完整流程
  if (typeof submitStep0Fast === 'function') {
    submitStep0Fast();
  }
}

// ── switchResultTab：七維度/塔羅快讀 tab 切換 ──
function switchResultTab(mode) {
  var fullContent = document.getElementById('full-result-content');
  var tarotContent = document.getElementById('tarot-back-content');
  var tabFull = document.getElementById('tab-full');
  var tabTarot = document.getElementById('tab-tarot-back');

  if (mode === 'tarot' && S._tarotQuickResult) {
    if (fullContent) fullContent.style.display = 'none';
    if (tarotContent) {
      tarotContent.style.display = 'block';
      // 填入之前保存的塔羅結果
      var tq = document.getElementById('tarot-back-question');
      var tai = document.getElementById('tarot-back-ai');
      var tsp = document.getElementById('tarot-back-spread');
      var tcr = document.getElementById('tarot-back-crystal');
      if (tq) tq.innerHTML = '「' + (S._tarotQuickResult.question || '') + '」';
      if (tai) tai.innerHTML = S._tarotQuickResult.aiHtml || '';
      if (tsp) tsp.innerHTML = S._tarotQuickResult.spreadHtml || '';
      if (tcr) tcr.innerHTML = S._tarotQuickResult.crystalHtml || '';
    }
    if (tabFull) { tabFull.classList.remove('active'); tabFull.style.background = 'transparent'; tabFull.style.color = 'var(--c-text-dim)'; }
    if (tabTarot) { tabTarot.classList.add('active'); tabTarot.style.background = 'rgba(212,175,55,.12)'; tabTarot.style.color = 'var(--c-gold)'; }
  } else {
    if (fullContent) fullContent.style.display = 'block';
    if (tarotContent) tarotContent.style.display = 'none';
    if (tabFull) { tabFull.classList.add('active'); tabFull.style.background = 'rgba(212,175,55,.12)'; tabFull.style.color = 'var(--c-gold)'; }
    if (tabTarot) { tabTarot.classList.remove('active'); tabTarot.style.background = 'transparent'; tabTarot.style.color = 'var(--c-text-dim)'; }
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── resetToHome：重新開始 ──
function resetToHome() {
  S._tarotOnlyMode = false;
  S._fromTarot = false;
  S._tarotQuickResult = null;
  drawnCards = [];
  S.tarot = { drawn: [], spread: [] };
  S.form = null;
  goStep(0);
  // 重新顯示首頁
  var hookScreen = document.getElementById('hook-screen');
  var inputScreen = document.getElementById('input-screen');
  if (hookScreen) hookScreen.style.display = '';
  if (inputScreen) inputScreen.style.display = 'none';
}

// ── 覆寫 _enterFromHome：塔羅模式下隱藏生辰表單 ──
(function() {
  var _prevEnterFromHome = window._enterFromHome;
  window._enterFromHome = function() {
    // 先標記為塔羅快速模式
    S._tarotOnlyMode = true;
    // 執行原始進入邏輯
    if (_prevEnterFromHome) _prevEnterFromHome();
    // 隱藏生辰相關的卡片
    var inputScreen = document.getElementById('input-screen');
    if (inputScreen) {
      // 找到出生資料那張 card（第二張 .card）
      var cards = inputScreen.querySelectorAll('.card');
      cards.forEach(function(card) {
        var title = card.querySelector('.card-title');
        if (title && title.textContent.indexOf('出生資料') >= 0) {
          card.style.display = 'none';
          card.id = 'birth-data-card';
        }
      });
      // 修改 CTA 按鈕文字
      var btnGo = document.getElementById('btn-go');
      if (btnGo) {
        btnGo.innerHTML = '<i class="fas fa-star"></i> 開始塔羅解讀';
        btnGo.onclick = function() { submitTarotQuick(); };
      }
      // 隱藏手動模式按鈕
      var manualBtn = inputScreen.querySelector('.btn-outline.btn-sm');
      if (manualBtn && manualBtn.textContent.indexOf('手動') >= 0) {
        manualBtn.parentElement.style.display = 'none';
      }
      // 修改底部說明
      var subtitle = inputScreen.querySelector('.actions-center p');
      if (subtitle) subtitle.textContent = '金色黎明塔羅牌 · AI 深度解讀';
    }
  };
})();
