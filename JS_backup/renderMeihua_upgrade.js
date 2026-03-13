// ═══════════════════════════════════════════════════════════════
// 梅花結果呈現層升級 — ai-analysis.js 替換區塊
// 替換範圍：第 965 行 function renderMeihua(){ 開頭
//           至第 1022 行 } 結尾（含）
// 全部替換為以下內容。
// ═══════════════════════════════════════════════════════════════

function renderMeihua(){
  var el=document.getElementById('r-meihua');
  if(!el) return;
  if(!S.meihua){
    el.innerHTML='<p class="text-dim">未進行梅花易數起卦</p>';
    return;
  }

  var r=S.meihua;
  var type=(S.form&&S.form.type)||'general';

  // ── 確保輸出層欄位已就位 ──
  // 若起卦時只跑了 general，現在用真實 type 再跑一次
  if(typeof buildMeihuaOutput==='function'){
    try{ buildMeihuaOutput(r, type); }catch(e){}
  }

  // ── 取新版欄位，舊版 fallback ──
  var hasNew = !!(r.analysis && r.narrativeBlocks);
  var nb      = (hasNew && r.analysis.narrativeBlocks) || {};
  var ana     = r.analysis || {};
  var mhTags  = r.tags || [];
  var timing  = r.timing || null;
  var risk    = r.risk   || null;
  var strategy= r.strategy || null;
  var shortV  = r.shortVerdict || '';
  var summary = r.summary || '';

  // ── 六爻圖資料 ──
  var benLines=[].concat(r.lo.li, r.up.li);
  var bianLines=benLines.slice(); bianLines[r.dong-1]=bianLines[r.dong-1]?0:1;
  var huLines=[benLines[1],benLines[2],benLines[3],benLines[2],benLines[3],benLines[4]];

  // ── 吉凶判斷與顏色 ──
  var judge=r.ty.f||'平';
  var isGood=judge.indexOf('吉')!==-1;
  var judgeColor=judge==='大吉'?'#4ade80':
                 judge==='吉'?'#86efac':
                 judge==='小吉'?'#c9a84c':
                 judge==='平'?'#94a3b8':
                 judge==='小凶'?'#fb923c':'#f87171';
  var judgeIcon=isGood?'✨':'⚠️';

  // ── 體用語義 ──
  var relDesc={
    '用生體':'外力助你，環境支持',
    '比和':  '勢均力敵，雙向平衡',
    '體克用':'你能主導，但需費力',
    '體生用':'你在付出，回報待觀察',
    '用克體':'外在壓制，你處被動'
  }[r.ty.r]||r.ty.r;

  // ── tags 篩選（取最高 weight 前5，排除無意義）──
  var topTags = mhTags.filter(function(tg){ return tg.weight>=4; })
                      .sort(function(a,b){ return b.weight-a.weight; })
                      .slice(0,5);

  function tagColor(dir){
    if(dir==='positive') return '#4ade80';
    if(dir==='negative') return '#f87171';
    return '#c9a84c';
  }
  function tagBg(dir){
    if(dir==='positive') return 'rgba(74,222,128,0.1)';
    if(dir==='negative') return 'rgba(248,113,113,0.1)';
    return 'rgba(201,168,76,0.1)';
  }

  // ── timing 轉白話 ──
  var timingLabel='';
  var timingNote='';
  if(timing && timing.windowLabel){
    var speedZh={fast:'很快',normal:'短期',delayed:'稍晚',unstable:'反覆'}[timing.speed]||'';
    timingLabel=timing.windowLabel+(speedZh?'（'+speedZh+'）':'');
    timingNote=timing.note||'';
  }

  // ── strategy.mode 轉白話 ──
  var strategyLabel='';
  if(strategy && strategy.mode){
    strategyLabel={
      push:     '積極推進',
      wait:     '耐心等待',
      stabilize:'穩守現局',
      retreat:  '先行退守',
      observe:  '觀察為主'
    }[strategy.mode]||strategy.mode;
  }

  // ── risk.level 轉白話 ──
  var riskLabel='';
  var riskColor='';
  if(risk && risk.level){
    riskLabel={low:'整體穩定，風險偏低',mid:'有一定變數，注意應對',high:'風險明顯，需謹慎'}[risk.level]||'';
    riskColor={low:'#4ade80',mid:'#fbbf24',high:'#f87171'}[risk.level]||'#94a3b8';
  }

  // ── 準備六段內容（優先新版，fallback 舊版）──

  // 1. 現況
  var situationText = nb.situation ||
    (function(){
      var f=r.ty.f, rel=r.ty.r;
      if(f==='大吉'&&rel==='用生體') return '外力助你，目前局勢對你有利，是主動推進的好時機。';
      if(f.indexOf('吉')!==-1&&rel==='比和') return '內外一致，雙方勢均力敵，穩步推進即可。';
      if(f.indexOf('吉')!==-1) return '整體趨勢正面，可以行動。';
      if(rel==='體生用') return '你付出多、回報慢，能量往外漏，需要停下來評估是否值得繼續。';
      if(rel==='用克體') return '外部有壓力，你處於被動位置，強推不利，觀望是更好的選擇。';
      return '情勢膠著，雙方相持，需要等待新的變數出現。';
    })();

  // 2. 核心矛盾
  var tensionText = nb.coreTension ||
    ('動爻第'+r.dong+'爻，'+
     (r.dong<=2?'變化還在醞釀，尚未浮出水面':
      r.dong<=4?'來到互動關鍵點，近期會有接觸或衝突':
      r.dong===5?'主事者層面有動態，決策即將浮現':
      '走向收尾，結果快要明朗')+
     '。變化來自'+(r.dong<=3?'外在環境或對方（用卦動）':'你自己內在的改變（體卦動）')+'。');

  // 3. 發展走向
  var trendText = nb.trend ||
    (function(){
      var bianN=r.bian&&r.bian.n||'';
      var bianM=r.bian&&r.bian.m||'';
      return '變卦「'+bianN+'」——'+bianM;
    })();

  // 4. 風險提醒
  var riskText = nb.risk || (risk&&risk.points&&risk.points[0]) || '';

  // 5. 行動建議
  var adviceList = (strategy&&strategy.advice&&strategy.advice.length)
    ? strategy.advice
    : (function(){
        var rel=r.ty.r;
        if(rel==='用生體') return ['對方有好感或環境有利，把握時機','順勢推進，不要猶豫太久'];
        if(rel==='體生用') return ['你付出的比收到的多，先評估是否值得','給自己設一個期限再決定下一步'];
        if(rel==='用克體') return ['外在壓力大，不要正面硬衝','先退一步找側面切入點'];
        if(rel==='體克用') return ['你有主導空間，主動推進','但保留餘地，別把對方逼太緊'];
        return ['維持現狀，觀察局勢','等更明確的訊號再行動'];
      })();

  // 6. 應期提示
  var timingText = nb.timing ||
    (timingLabel ? '應期約 '+timingLabel+'。'+timingNote : '時間方面，動爻五行為'+((r.dong<=3)?r.lo.el:r.up.el)+'行，可參考對應時令。');

  // ── 組裝 HTML ──
  var html = '';

  // ── 頂部：卡片 + shortVerdict ──
  html += '<div class="insight-card" style="margin-bottom:.75rem">';
  html += '<div class="insight-title">' + judgeIcon + ' ';
  html += (shortV || relDesc);
  html += '</div>';
  html += '<div class="insight-sub" style="margin-top:.3rem">';
  html += '<span class="tag" style="background:rgba(201,168,76,.12);color:var(--c-gold);border:1px solid rgba(201,168,76,.2);font-size:.72rem;padding:1px 8px;border-radius:20px;margin-right:4px">' + r.ty.r + '</span>';
  html += '<span class="tag" style="background:rgba(255,255,255,.05);color:' + judgeColor + ';border:1px solid ' + judgeColor + '44;font-size:.72rem;padding:1px 8px;border-radius:20px">' + judge + '</span>';
  html += '</div>';
  html += '</div>';

  // ── 三卦橫排 ──
  html += '<div class="hex-grid">';
  html += '<div class="hex-card"><h4>本卦</h4>';
  html += (typeof renderYaoLines==='function') ? renderYaoLines(benLines, r.dong) : r.ben.u;
  html += '<div class="hex-name" style="margin-top:.4rem">' + r.ben.n + '</div>';
  html += '<div class="hex-sym">' + r.ben.u + '</div></div>';

  html += '<div class="hex-card"><h4>互卦</h4>';
  html += (typeof renderYaoLines==='function') ? renderYaoLines(huLines) : r.hu.u;
  html += '<div class="hex-name" style="margin-top:.4rem">' + r.hu.n + '</div>';
  html += '<div class="hex-sym">' + r.hu.u + '</div></div>';

  html += '<div class="hex-card"><h4>變卦</h4>';
  html += (typeof renderYaoLines==='function') ? renderYaoLines(bianLines) : r.bian.u;
  html += '<div class="hex-name" style="margin-top:.4rem">' + r.bian.n + '</div>';
  html += '<div class="hex-sym">' + r.bian.u + '</div></div>';
  html += '</div>'; // hex-grid

  // ── Tags 標籤列 ──
  if(topTags.length){
    html += '<div style="display:flex;flex-wrap:wrap;gap:5px;margin:.6rem 0">';
    topTags.forEach(function(tg){
      html += '<span style="font-size:.72rem;padding:2px 9px;border-radius:20px;' +
        'background:' + tagBg(tg.dir) + ';color:' + tagColor(tg.dir) + ';' +
        'border:1px solid ' + tagColor(tg.dir) + '33">' + tg.label + '</span>';
    });
    html += '</div>';
  }

  // ── 核心六段（預設展開 1-3，4-6 摺疊在 details 內）──
  var S1='background:rgba(255,255,255,.03);border-radius:6px;padding:.6rem .75rem;margin-bottom:.5rem;border-left:3px solid ';
  var titleStyle='font-size:.8rem;font-weight:700;margin-bottom:.25rem;';
  var bodyStyle='font-size:.85rem;line-height:1.7;color:var(--c-text-dim)';

  // 現況
  html += '<div style="' + S1 + 'rgba(201,168,76,.4)">';
  html += '<div style="' + titleStyle + 'color:var(--c-gold)">📌 現況</div>';
  html += '<div style="' + bodyStyle + '">' + situationText + '</div>';
  html += '</div>';

  // 核心矛盾
  html += '<div style="' + S1 + 'rgba(168,139,250,.4)">';
  html += '<div style="' + titleStyle + 'color:#c9a84c">🔍 核心矛盾</div>';
  html += '<div style="' + bodyStyle + '">' + tensionText + '</div>';
  html += '</div>';

  // 發展走向
  html += '<div style="' + S1 + 'rgba(96,165,250,.4)">';
  html += '<div style="' + titleStyle + 'color:#60a5fa">📈 發展走向</div>';
  html += '<div style="' + bodyStyle + '">' + trendText + '</div>';
  html += '</div>';

  // 後三段放進 details
  html += '<details class="pro-detail" style="margin-top:.25rem"><summary style="cursor:pointer;font-size:.82rem;color:var(--c-gold);padding:.4rem 0">🔎 展開：風險 / 行動建議 / 應期</summary>';
  html += '<div style="padding:.4rem 0">';

  // 風險提醒
  if(riskText || (risk&&risk.points&&risk.points.length)){
    html += '<div style="' + S1 + (riskColor||'rgba(248,113,113,.4)') + '">';
    html += '<div style="' + titleStyle + 'color:' + (riskColor||'#f87171') + '">⚠️ 風險提醒';
    if(riskLabel) html += ' <span style="font-size:.7rem;font-weight:400;opacity:.7">— ' + riskLabel + '</span>';
    html += '</div>';
    html += '<div style="' + bodyStyle + '">';
    if(riskText) html += riskText;
    if(risk&&risk.points&&risk.points.length>1){
      html += '<ul style="margin:.4rem 0 0 .8rem;padding:0;font-size:.82rem">';
      risk.points.slice(0,3).forEach(function(p){ html += '<li style="margin-bottom:.2rem">' + p + '</li>'; });
      html += '</ul>';
    }
    html += '</div></div>';
  }

  // 行動建議
  html += '<div style="' + S1 + 'rgba(74,222,128,.4)">';
  html += '<div style="' + titleStyle + 'color:#4ade80">🎯 行動建議';
  if(strategyLabel) html += ' <span style="font-size:.7rem;font-weight:400;opacity:.7">— 目前宜「' + strategyLabel + '」</span>';
  html += '</div>';
  html += '<ul style="margin:.2rem 0 0 .8rem;padding:0;font-size:.85rem;line-height:1.8;color:var(--c-text-dim)">';
  adviceList.forEach(function(a){ html += '<li style="margin-bottom:.2rem">' + a + '</li>'; });
  html += '</ul></div>';

  // 應期提示
  html += '<div style="' + S1 + 'rgba(251,191,36,.4)">';
  html += '<div style="' + titleStyle + 'color:#fbbf24">⏳ 應期';
  if(timingLabel) html += ' <span style="font-size:.7rem;font-weight:400;opacity:.7">— ' + timingLabel + '</span>';
  html += '</div>';
  html += '<div style="' + bodyStyle + '">' + timingText + '</div>';
  html += '</div>';

  html += '</div></details>'; // end pro-detail

  // ── 原始卦辭（最下方摺疊）──
  html += '<details class="pro-detail" style="margin-top:.25rem"><summary style="cursor:pointer;font-size:.78rem;color:var(--c-text-dim);padding:.3rem 0">📜 卦辭 / 原始資料</summary>';
  html += '<div style="padding:.5rem 0;font-size:.8rem;line-height:1.8;color:var(--c-text-dim)">';
  html += '<p><strong style="color:var(--c-gold)">體卦：</strong>' + r.tiG.name + '（' + r.tiG.el + '）｜<strong style="color:var(--c-gold)">用卦：</strong>' + r.yoG.name + '（' + r.yoG.el + '）</p>';
  html += '<p><strong>本卦卦辭：</strong>' + r.ben.j + '</p>';
  html += '<p><strong>本卦解讀：</strong>' + r.ben.m + '</p>';
  html += '<p><strong>動爻：</strong>第 ' + r.dong + ' 爻（' + (benLines[r.dong-1]?'陽→陰':'陰→陽') + '）' +
    (r.dong<=3?'動在用卦，變動源自外部':'動在體卦，變動源自自身') + '</p>';
  html += '<p><strong>變卦解讀：</strong>' + r.bian.m + '</p>';
  html += '</div></details>';

  el.innerHTML = html;
}
