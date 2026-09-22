/*! Jingyue · Liuyao and Zhouyi chambers / 2.0.0.
 * A toss is committed BEFORE its animation. Navigation never draws again.
 */
(function(root){
  'use strict';
  var rooms={},active=null,toastTimer=null;
  var TITLES={liuyao:'六爻占卜',yijing:'易經占卜'},IDS={liuyao:'ly',yijing:'yj'};
  var AI=[['chatgpt','ChatGPT','https://chatgpt.com/'],['claude','Claude','https://claude.ai/new'],['gemini','Gemini','https://gemini.google.com/app']];
  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function core(){if(!root.JYLiuyaoCore)throw new Error('卦象元件尚未載入，請重新整理後再試。');return root.JYLiuyaoCore;}
  function pad(n){return String(n).padStart(2,'0');}
  function wallNow(offset){var p=core().localTimeAt(Date.now(),offset);return p.year+'-'+pad(p.month)+'-'+pad(p.day)+'T'+pad(p.hour)+':'+pad(p.minute)+':'+pad(p.second);}
  function create(kind){return {kind:kind,id:IDS[kind],phase:'input',mode:kind==='yijing'?'yarrow':'coins',question:'',focus:'auto',offset:'8',boundary:'MIDNIGHT_00',custom:false,time:wallNow(8),manual:[null,null,null,null,null,null],values:[],records:[],date:null,result:null,busy:false,selected:1,root:null,timer:null,animations:[],sound:false,error:'',focusBefore:null,inert:[],overflow:'',scene:null,sceneKind:null,part:[],lastChange:null,commit:false};}
  function reduced(){return !!(root.matchMedia&&root.matchMedia('(prefers-reduced-motion: reduce)').matches);}
  function note(message){var el=document.getElementById('gw-toast');if(!el){el=document.createElement('div');el.id='gw-toast';el.className='gw-toast';el.setAttribute('role','status');document.body.appendChild(el);}el.textContent=message;clearTimeout(toastTimer);toastTimer=setTimeout(function(){el.remove();},3800);}
  function error(s,e){s.error=e.message||String(e);var box=s.root&&s.root.querySelector('.gw-error');if(box){box.textContent=s.error;box.hidden=false;box.focus({preventScroll:true});}else note(s.error);}
  function remember(s){
    if(s.phase!=='input'||!s.root)return;
    function val(name){return s.root.querySelector('[data-field="'+name+'"]');}
    var q=document.getElementById(s.id+'-q');if(q)s.question=q.value;
    ['focus','offset','boundary','time'].forEach(function(k){if(val(k))s[k]=val(k).value;});
    if(val('custom'))s.custom=val('custom').checked;
    s.root.querySelectorAll('[data-manual]').forEach(function(el){s.manual[Number(el.dataset.manual)]=el.value===''?null:Number(el.value);});
  }
  function calendar(s){
    if(!String(s.offset).trim())throw new Error('請填寫 UTC 時差。');
    var offset=Number(s.offset),p;
    if(s.custom){var m=String(s.time).match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/);if(!m)throw new Error('請填寫完整起卦日期與時間。');p={year:+m[1],month:+m[2],day:+m[3],hour:+m[4],minute:+m[5],second:+(m[6]||0),timezoneOffset:offset};}
    else p=core().localTimeAt(Date.now(),offset);
    p.dayBoundaryMode=s.boundary;return core().calendar(p);
  }
  function yao(yang,moving,empty){return '<span class="gw-yao'+(yang?' is-yang':'')+(moving?' is-moving':'')+(empty?' is-empty':'')+'" aria-hidden="true"><i></i><i></i></span>';}
  function coinSVG(id,back){
    var path='M70 5a65 65 0 1 1 0 130a65 65 0 1 1 0-130M53 53v34h34V53z';
    var details=back?'<g fill="none" stroke="#6b502b" stroke-width="2"><circle cx="70" cy="70" r="50"/><path d="M40 32h60M43 38h54M40 108h60M43 102h54M26 50v40M33 51v15m0 9v14M114 50v40M107 51v15m0 9v14"/></g><path d="M70 18l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" fill="#67522e"/>':
      '<g fill="#5c4528" stroke="#f8e3a4" stroke-width=".3" font-family="Noto Serif TC,serif" font-size="24" text-anchor="middle"><text x="70" y="42">靜</text><text x="70" y="118">月</text><text x="32" y="79">通</text><text x="109" y="79">寶</text></g>';
    return '<svg viewBox="0 0 140 140" aria-hidden="true"><defs><linearGradient id="'+id+'" x1="0" y1="0" x2=".8" y2="1"><stop stop-color="#fff1bc"/><stop offset=".25" stop-color="#c4a668"/><stop offset=".47" stop-color="#f7dda0"/><stop offset=".7" stop-color="#b59355"/><stop offset="1" stop-color="#72512e"/></linearGradient></defs><path d="'+path+'" fill="url(#'+id+')" fill-rule="evenodd" stroke="#edcf91" stroke-width="1.5"/><circle cx="70" cy="70" r="59" fill="none" stroke="#74603b" stroke-width="2"/><circle cx="70" cy="70" r="56" fill="none" stroke="#f2dba1" stroke-opacity=".6"/><path d="M51 51h38v38H51z" fill="none" stroke="#82613c" stroke-width="2"/>'+details+'</svg>';
  }
  function isYarrow(s){return s.kind==='yijing'&&s.mode!=='coins';}
  function sounds(s){return isYarrow(s)?['stems','bamboo','paper']:['coins'];}
  function cue(s,key,options){if(root.JYFoley)root.JYFoley.play(key,Object.assign({scope:'gua-'+s.kind},options||{}));}
  function yarrowPhase(s,p){
    var box=s.root.querySelector('.gw-yarrow-action');if(!box)return;var ch=s.lastChange;
    var titles=['聚策','分二','掛一','揲四','歸餘'];box.querySelectorAll('span').forEach(function(el,i){el.classList.toggle('is-active',i===p);el.classList.toggle('is-past',i<p);});
    var line=box.querySelector('p');if(line&&ch)line.textContent=[ch.total+' 策，重新聚攏','左 '+ch.left+' 策 · 右 '+ch.right+' 策','自右側取一策，暫置案前','左右各以四策成組','歸餘 '+ch.removed+' 策 · 留下 '+ch.remaining+' 策'][p];
    var summary=s.root.querySelector('.gw-stage-summary');if(summary&&ch&&p===4)summary.textContent='本次 '+ch.total+' 策 · 歸餘 '+ch.removed+' 策 · 留下 '+ch.remaining+' 策';
  }
  function stage(s){
    var grass=isYarrow(s),last=s.records[s.records.length-1],ch=s.part.length?s.lastChange:null;
    var message=grass?(ch?'本次 '+ch.total+' 策 · 歸餘 '+ch.removed+' 策 · 留下 '+ch.remaining+' 策':'五十策虛一，以四十九策候一卦。'):(last?'第 '+s.values.length+' 爻 · '+last.coins.map(function(c){return c==='back'?'背':'字';}).join('　')+' · '+last.value+' '+({6:'老陰',7:'少陽',8:'少陰',9:'老陽'}[last.value]):'三枚銅錢，六次落定一件心事。');
    if(grass&&last&&!ch)message='第 '+s.values.length+' 爻已成 · '+last.value+' '+({6:'老陰',7:'少陽',8:'少陰',9:'老陽'}[last.value]);
    if(s.busy)message=grass?'本次 '+s.lastChange.total+' 策 · 分二掛一，揲四歸餘。':'三錢入盤，靜候落定。';
    var h='<div class="gw-stage-side"><div class="gw-stage-heading">'+(grass?'蓍 草 ・ 靜 心 書 齋':'銅 錢 ・ 靜 觀 六 爻')+'</div><div class="gw-scene" data-render="fallback" role="img" aria-label="'+(grass?'立體蓍草、古卷與漆木書案':'立體方孔銅錢與青銅卦盤')+'"><div class="gw-scene-fallback" aria-hidden="true">';
    if(grass){h+='<div class="gw-fallback-scroll">周 易</div><div class="gw-fallback-stalks">';for(var i=0;i<31;i++)h+='<i style="--i:'+i+'"></i>';h+='</div>';}
    else{h+='<div class="gw-fallback-tray"></div><div class="gw-fallback-coins">';for(var j=0;j<3;j++)h+='<div style="--i:'+j+'">'+coinSVG(s.id+'-fallback-'+j,!!(last&&last.coins[j]==='back'))+'</div>';h+='</div>';}
    h+='</div></div><p class="gw-scene-instruction">輕拖器物，換個角度看見細節</p><p class="gw-stage-summary">'+message+'</p>'+(s.mode==='yarrow'&&s.phase==='casting'?yarrowProgress(s):'')+'<div class="gw-ceremony-tools">';
    if(root.JYFoley)h+=root.JYFoley.controls(grass?'stems':'coins','gua-'+s.kind);
    if(s.busy)h+='<button type="button" data-action="skip">略過動畫</button>';
    h+='</div><div class="gw-method-note"><span>'+ (grass?'大衍蓍法':s.kind==='liuyao'?'三錢納甲':'三錢取象')+'</span><p>'+(grass?'分二、掛一、揲四、歸餘。三變成一爻，以卦爻辭讀懂此刻的進退。':(s.kind==='liuyao'?'銅錢定陰陽，六爻成一卦。以世應、六親與月日，辨一件事的推進與阻力。':'三枚銅錢取六爻；解讀仍依周易卦爻辭，與六爻納甲分開。'))+'</p></div></div>';return h;
  }
  function syncScene(s){
    if(s.phase==='result'){if(s.scene){s.scene.dispose();s.scene=null;}return;}
    var host=s.root.querySelector('.gw-scene'),kind=isYarrow(s)?'yarrow':'coins';
    if(!host||!root.JYGuaScene)return;
    try{
      if(s.scene&&s.sceneKind!==kind){s.scene.dispose();s.scene=null;}
      if(!s.scene){s.scene=root.JYGuaScene.create(host,kind);s.sceneKind=kind;}else s.scene.attach(host);
      s.scene.update({kind:s.kind,values:s.values,part:s.part,record:s.records[s.records.length-1]||null,change:s.part.length?s.lastChange:null,reduced:reduced()});
    }catch(e){if(s.scene)s.scene.dispose();s.scene=null;host.dataset.render='fallback';host.closest('.gw-stage-side').querySelector('.gw-scene-instruction').textContent='目前使用靜態器物畫面，起卦照常進行。';}
  }
  function settings(s){
    var h='<details class="gw-options"><summary>起卦時間'+(s.kind==='liuyao'?'與取用設定':'設定')+'</summary><div class="gw-settings"><label class="gw-check"><input type="checkbox" data-field="custom"'+(s.custom?' checked':'')+'>使用指定起卦時間</label><label>起卦時間（所選 UTC 時差的當地時間）<input type="datetime-local" data-field="time" step="1" min="1900-01-01T00:00" max="2100-12-31T23:59:59" value="'+esc(s.time)+'"'+(!s.custom?' disabled':'')+'></label><div class="gw-time-pair"><label>UTC 時差（台灣 +8）<input type="number" data-field="offset" min="-12" max="14" step="0.25" value="'+esc(s.offset)+'"></label>';
    if(s.kind==='liuyao')h+='<label>日柱換日<select data-field="boundary"><option value="MIDNIGHT_00"'+(s.boundary==='MIDNIGHT_00'?' selected':'')+'>00:00 午夜</option><option value="ZI_HOUR_23"'+(s.boundary==='ZI_HOUR_23'?' selected':'')+'>23:00 子初</option></select></label>';h+='</div>';
    if(s.kind==='liuyao'){h+='<label>取用方向<select data-field="focus">';[['auto','依問題提供候選'],['世應','世應 · 自身與對方'],['妻財','妻財 · 財物與收支'],['官鬼','官鬼 · 功名與職位'],['父母','父母 · 文書與長輩'],['兄弟','兄弟 · 同輩'],['子孫','子孫 · 晚輩與福德']].forEach(function(a){h+='<option value="'+a[0]+'"'+(s.focus===a[0]?' selected':'')+'>'+a[1]+'</option>';});h+='</select></label>';}
    h+='<p class="gw-help">'+(s.kind==='liuyao'?'月建依節氣交節；日柱依所選換日方式。':'日期只記錄這一次起卦；解讀以卦爻辭為主。')+'未指定時間時，在開始起卦的一刻記錄。夏令時間地區請填當時實際 UTC 時差。</p></div></details>';return h;
  }
  function inputPanel(s){
    var h='<section class="gw-panel"><h2>這一刻，你想問什麼？</h2><label class="gw-label" for="'+s.id+'-q">把一件事，說清楚。</label><textarea id="'+s.id+'-q" class="gw-textarea" rows="4" maxlength="1200" placeholder="例如：這次轉職是否值得推進？我最需要留意什麼？">'+esc(s.question)+'</textarea><p class="gw-help">說明對象、目前處境與想了解的時間範圍，讓解讀更貼近你的問題。</p><div class="gw-mode" role="group" aria-label="起卦方式">'+(s.kind==='yijing'?'<button type="button" data-action="mode" data-mode="yarrow" aria-pressed="'+(s.mode==='yarrow')+'">蓍草起卦</button>':'')+'<button type="button" data-action="mode" data-mode="coins" aria-pressed="'+(s.mode==='coins')+'">三錢起卦</button><button type="button" data-action="mode" data-mode="manual" aria-pressed="'+(s.mode==='manual')+'">手動記卦</button></div>';
    if(s.mode==='manual'){h+='<p class="gw-help">由初爻到上爻填入實際起卦結果；6、9 是動爻，7、8 是靜爻。</p><div class="gw-manual">';for(var i=5;i>=0;i--){h+='<label class="gw-manual-row">'+core().labels[i]+'<select data-manual="'+i+'" aria-label="'+core().labels[i]+'爻值"><option value="">請選第 '+(i+1)+' 次結果</option>';[[6,'6 · 老陰 ×'],[7,'7 · 少陽'],[8,'8 · 少陰'],[9,'9 · 老陽 ○']].forEach(function(v){h+='<option value="'+v[0]+'"'+(s.manual[i]===v[0]?' selected':'')+'>'+v[1]+'</option>';});h+='</select></label>';}h+='</div>';}
    h+=settings(s)+'<div class="gw-error" role="alert" tabindex="-1">'+esc(s.error)+'</div><button type="button" class="gw-primary" data-action="start">'+(s.mode==='manual'?'完成記卦，展開卦象':s.mode==='yarrow'?'靜心，展開蓍草':'靜心，開始擲錢')+' <span aria-hidden="true">→</span></button><p class="gw-micro">'+(s.kind==='liuyao'?'六爻納甲 · 世應與動變':'六十四卦 · 卦辭與爻辭')+'</p></section>';return h;
  }
  function castingPanel(s){
    var n=s.values.length-(s.busy&&s.commit?1:0),h='<section class="gw-panel"><span class="gw-label">心中所問</span><p class="gw-cast-question">'+esc(s.question)+'</p><div class="gw-count"><span>由下而上，逐爻成卦</span><strong>'+n+' <em>/ 6</em></strong></div><div class="gw-line-list" aria-label="起卦進度">';
    for(var i=5;i>=0;i--){var v=i<n?s.values[i]:null;h+='<div class="gw-progress-row'+(i===n-1?' is-new':'')+'" data-empty="'+!v+'" data-current="'+(i===n)+'"><span>'+core().labels[i]+'</span>'+yao(v?v%2:1,v===6||v===9,!v)+'<span>'+(v?v+' '+({6:'老陰 ×',7:'少陽',8:'少陰',9:'老陽 ○'}[v]):i===n?'即將落定':'待成爻')+'</span></div>';}
    h+='</div>';
    h+='<div class="gw-error" role="alert" tabindex="-1">'+esc(s.error)+'</div><div class="gw-live" role="status" aria-live="polite">'+(s.busy?(s.mode==='yarrow'?'蓍草正在分策、歸餘…':'銅錢正在落下…'):n===6?'六爻齊備，準備展開。':s.mode==='yarrow'?'三變成一爻；每一步都會留下紀錄。':n?'第 '+n+' 爻已記錄，繼續擲出下一爻。':'慢慢呼吸，讓問題留在心裡。')+'</div><div class="gw-actions"><button type="button" class="gw-primary" data-action="toss"'+(s.busy?' disabled':'')+'>'+(s.busy?'靜候落定…':n===6?'展開本次卦象':s.mode==='yarrow'?'揲蓍 · '+core().labels[n]+'第'+(s.part.length+1)+'變':'擲出'+core().labels[n])+'</button><button type="button" class="gw-quiet" data-action="quick"'+(s.busy?' disabled':'')+'>快速完成剩餘爻</button></div></section>';return h;
  }
  function yarrowProgress(s){
    var count=Math.max(0,s.part.length-(s.busy?1:0)),steps=['第一變','第二變','第三變'],h='<div class="gw-yarrow-action"><div>'+['聚策','分二','掛一','揲四','歸餘'].map(function(t,i){return '<span class="'+(!s.busy&&count&&i===4?'is-active':'')+'">'+t+'</span>';}).join('')+'</div><p>'+(s.busy?'蓍草入案，候一變':count?'這一變已落定，依你的節奏繼續。':'四十九策入案，準備'+core().labels[s.values.length]+'。')+'</p></div><div class="gw-yarrow-progress" aria-label="每爻三變">';
    steps.forEach(function(t,i){h+='<span class="'+(i<count?'is-done':i===count?'is-current':'')+'"'+(i===count?' aria-current="step"':'')+'>'+t+'<b>'+(i<count?s.part[i].remaining+' 策':i===count?(count?s.part[count-1].remaining:49)+' 策'+(s.busy?'揲蓍中':'待分'):'待續')+'</b></span>';});
    return h+'</div>';
  }
  function diagram(s,g,side){
    var r=s.result,base=side==='original',h='<section class="gw-hex-card"><span class="gw-eyebrow">'+(base?'本 卦<span>THE PRESENT</span>':'之 卦<span>THE CHANGE</span>')+'</span><h2>'+esc(g.fullName)+'</h2><p>第 '+g.number+' 卦 · '+g.lower+'下'+g.upper+'上</p><div class="gw-hex-lines">';
    for(var i=5;i>=0;i--){var l=r.lines[i],tag=base?'button':'div';h+='<'+tag+(base?' type="button" data-action="line" data-line="'+(i+1)+'" aria-pressed="'+(s.selected===i+1)+'"':'')+' class="gw-hex-line" aria-label="'+esc(l.label+'，'+(g.lines[i]?'陽爻':'陰爻')+(l.moving?'，'+(base?'動爻':'由動爻變出'):'，靜爻')+(base&&l.role?'，'+l.role:''))+'"><span>'+(base&&l.role?l.role:['初','二','三','四','五','上'][i])+'</span>'+yao(g.lines[i],l.moving,false)+'<span>'+(l.moving?(base?l.marker:'↢'):'')+'</span></'+tag+'>';}
    return h+'</div><p>'+(s.kind==='liuyao'?(base?esc(g.palace.name+'宮'+g.palace.element+' · '+g.palace.generation):'變爻六親沿用本卦卦宮'):(base?'點選爻線，可讀該爻原文':'順著動爻，看變化的方向'))+'</p></section>';
  }
  function detail(s){
    var r=s.result,l=r.lines[s.selected-1],h='<strong>'+esc(l.label+(l.role?' · '+l.role:''))+'</strong><div>';
    if(s.kind==='liuyao'){h+='<p>'+esc(l.spirit+' · '+l.relative+' '+l.stem+l.branch+l.element+' · '+l.valueName+(l.moving?'，此爻發動。':'，此爻未動。'))+'</p><p>'+esc(root.JYGuaPrompt.status(l.states))+'</p>';if(l.moving)h+='<p>'+esc('動化 '+l.changed.relative+' '+l.changed.stem+l.changed.branch+l.changed.element+'，'+l.transition.returnLabel+(l.transition.advance?'、化進神':'')+(l.transition.retreat?'、化退神':'')+'。')+'</p>';if(l.hidden)h+='<p>'+esc('本宮伏神：'+l.hidden.relative+' '+l.hidden.stem+l.hidden.branch+l.hidden.element)+'</p>';h+='<small>此處呈現盤面關係；事情如何發展，仍須連同用神、月日與全卦判讀。</small>';}
    else{h+='<p>'+esc(l.text.label+'：'+l.text.text)+'</p><small>本卦原文參閱。正式解讀依下方「本次主讀」，不因點選而更換主爻。</small>';}
    return h+'</div>';
  }
  function table(s){var r=s.result,h='<details class="gw-fold"><summary>完整納甲排盤 · 六神、伏神、世應與動變</summary><div class="gw-fold-body"><div class="gw-scroll" role="region" aria-label="完整六爻排盤表，可左右捲動" tabindex="0"><table class="gw-table-data"><thead><tr><th>爻位／六神</th><th>伏神</th><th>本卦六親納甲</th><th>世應／動靜</th><th>之卦同位</th><th>本爻標記</th></tr></thead><tbody>';
    r.lines.slice().reverse().forEach(function(l){var tags=[];if(l.states.void)tags.push('旬空');if(l.states.monthBroken)tags.push('月破');if(l.states.dayClash)tags.push('日沖');if(l.states.monthSame)tags.push('臨月');if(l.states.daySame)tags.push('臨日');h+='<tr data-moving="'+l.moving+'"><td>'+l.label+'／'+l.spirit+'</td><td>'+(l.hidden?l.hidden.relative+' '+l.hidden.stem+l.hidden.branch+l.hidden.element:'—')+'</td><td>'+l.relative+' '+l.stem+l.branch+l.element+'</td><td>'+(l.role||'—')+' '+l.valueName+' '+l.marker+'</td><td>'+(r.hasChange?l.changed.relative+' '+l.changed.stem+l.changed.branch+l.changed.element+(l.moving?' ←動化':'（背景）'):'—')+'</td><td>'+(tags.join('、')||'—')+'</td></tr>';});
    return h+'</tbody></table></div><p class="gw-help">靜爻在之卦的同位資料只供對照，不作動化。日沖尚需旺衰才能判暗動或日破；旬空與月破也不單獨決定吉凶。</p></div></details>';}
  function scripture(s){var r=s.result,h='<section class="gw-reading-plan"><h2 class="gw-section-title">本次主讀</h2><p>'+esc(r.reading.rule)+'</p>';r.reading.selections.forEach(function(v){h+='<div class="gw-verse"><small>'+esc(v.role+' · '+v.hexagram+'卦 · '+v.label)+'</small><blockquote>'+esc(v.text)+'</blockquote></div>';});h+='</section><details class="gw-fold"><summary>展開本卦'+(r.hasChange?'與之卦':'')+'完整原文</summary><div class="gw-fold-body gw-scripture">';[r.originalText].concat(r.hasChange?[r.changedText]:[]).forEach(function(t){h+='<h3>'+esc(t.name)+'卦</h3><p>'+esc(t.judgment)+'</p><p>大象：'+esc(t.image)+'</p>';t.lines.forEach(function(l){h+='<p>'+esc(l.label+'：'+l.text)+'</p>';});if(t.use)h+='<p>'+esc(t.use.label+'：'+t.use.text)+'</p>';h+='<a href="'+esc(t.source)+'" target="_blank" rel="noopener noreferrer">原文出處 ↗</a>';});return h+'</div></details>';}
  function resultPanel(s){
    var r=s.result,d=r.calendar,h='<section class="gw-result"><div class="gw-question-banner"><small>這一次，你想釐清的事</small>'+esc(r.question)+'</div><div class="gw-overview'+(!r.hasChange?' is-static':'')+'">'+diagram(s,r.original,'original')+(r.hasChange?'<div class="gw-transform-arrow" aria-hidden="true">→</div>'+diagram(s,r.changed,'changed'):'')+'</div><div class="gw-metrics"><span>動爻<b>'+(r.movingPositions.join('、')||'無 · 靜卦')+'</b></span>';
    if(s.kind==='liuyao')h+='<span>月建<b>'+d.monthBranch+'</b></span><span>日辰<b>'+d.day+'</b></span><span>旬空<b>'+d.voidBranches.join('')+'</b></span><span>世／應<b>'+r.original.palace.shi+'／'+r.original.palace.ying+'</b></span>';
    else h+='<span>讀法<b>卦爻辭</b></span>';
    h+='</div><div class="gw-detail" aria-live="polite">'+detail(s)+'</div>'+(s.kind==='liuyao'?table(s):scripture(s));
    if(s.kind==='liuyao'&&r.interpretation){
      var a=r.interpretation,labels={'hidden-movement':'旺靜逢日沖，暗動','day-break':'弱靜逢日沖，日破','clash-with-support':'日沖而有生扶，須合看','moving-not-dispersed':'動爻逢沖，有生扶','moving-clash-unresolved':'動爻受沖，尚待辨沖散'};
      h+='<details class="gw-fold"><summary>取用、特殊條件與時間線索</summary><div class="gw-fold-body">';
      a.targets.forEach(function(t){h+='<p><b>'+esc(t.relative+' · '+t.role)+'</b><br>'+esc(t.candidates.map(function(u){return u.position+'爻 '+u.branch+(u.hidden?'（伏神）':'');}).join('、')||'原卦及本宮伏神未見')+(t.status==='multiple'?'；多現，需按本題角色辨別。':'')+'</p>';});
      a.lines.forEach(function(l){var notes=[labels[l.dayEffect]||''].concat(l.obstacles).filter(Boolean);if(notes.length)h+='<p>'+esc('第'+l.position+'爻：'+notes.join('；'))+'</p>';});
      var timing=a.timing;
      if(timing.status==='bounded'){h+='<h3>期限內可留意的日期</h3><p>'+esc(timing.window.start+' 至 '+timing.window.end)+'</p>';timing.candidates.slice(0,12).forEach(function(x){h+='<p><b>'+esc(x.date+' · '+x.day)+'</b><br>'+esc(x.triggers.map(function(t){return t.relative+' '+t.position+'爻：'+t.reasons.join('、');}).join('；'))+'</p>';});if(timing.candidates.length>12)h+='<p>其餘候選隨完整起卦資料一併下載。</p>';h+='<p>這些是條件觸發的候選日，需連同卦中阻力及現實進展確認。</p>';}
      else h+='<p>問題未提供可辨識的期限，這次保留相對時機。</p>';
      h+='</div></details>';
    }
    h+='<details class="gw-fold"><summary>查看起卦紀錄與方法</summary><div class="gw-fold-body"><p>'+esc(d.wall+' · UTC '+(d.timezoneOffset>=0?'+':'')+d.timezoneOffset)+'<br>'+esc(s.kind==='liuyao'?'節氣月建 · '+(d.dayBoundaryMode==='ZI_HOUR_23'?'23:00':'00:00')+' 換日':'起卦時間僅供記錄')+'</p><p>初爻至上爻：'+r.values.join(' · ')+'</p>';
    if(r.method==='coins')h+='<ol>'+r.records.map(function(c){return '<li>'+c.coins.map(function(f){return f==='back'?'背（3）':'字（2）';}).join(' + ')+' = '+c.value+'</li>';}).join('')+'</ol>';
    else if(r.method==='yarrow')h+='<ol>'+r.records.map(function(c){return '<li>'+c.changes.map(function(v){return v.total+'策 → '+v.remaining+'策（歸餘'+v.removed+'）';}).join('；')+'；爻值 '+c.value+'</li>';}).join('')+'</ol><p>大衍蓍法：五十策虛一，每變皆掛一；三變後餘策除四成爻。本次為四種餘數等機率的數位取樣。</p>';
    else h+='<p>本次為手動記卦，沒有模擬擲錢紀錄。</p>';
    h+='<p>'+(s.kind==='liuyao'?'納甲、世應與動變規則參考《增刪卜易》，月建使用本地節氣曆法。':'卦爻辭採《周易》校錄原文。擇辭依朱子《易學啟蒙・考變占》；三爻變並讀兩卦，前十主貞、後十主悔。')+'</p><p>占卜提供象徵解讀，現實結果仍需由實際互動與行動確認。</p></div></details><div class="gw-error" role="alert" tabindex="-1">'+esc(s.error)+'</div>';
    h+='<section class="gw-reading-card"><div><span class="gw-eyebrow">LET THE READING BEGIN</span><h2>讓卦象，回到你的問題。</h2><p>複製本次完整卦象與解讀提示詞，貼到你慣用的 AI。先聽核心判斷，再看關鍵轉折與可採取的下一步。</p></div><div><button type="button" class="gw-primary" data-action="copy">複製解讀提示詞 <span aria-hidden="true">↗</span></button><div class="gw-ai-links">';
    AI.forEach(function(a){h+='<button type="button" data-action="ai" data-ai="'+a[0]+'" aria-label="複製提示詞並開啟 '+a[1]+'"><img src="ai-icons/ai-'+a[0]+'.png" alt="">'+a[1]+'</button>';});
    h+='</div></div></section><details class="gw-fold gw-prompt-fold"><summary>查看或手動複製完整提示詞</summary><div class="gw-fold-body"><textarea class="gw-prompt-area" readonly aria-label="本次解讀提示詞">'+esc(root.JYGuaPrompt.build(r))+'</textarea></div></details><div class="gw-export-actions"><button type="button" class="gw-secondary" data-action="share">製作分享卡 ↗</button><button type="button" class="gw-secondary" data-action="save">儲存排卦紀錄 ↓</button><button type="button" class="gw-quiet" data-action="reset">開始新的占問</button></div></section>';return h;
  }
  function render(s){
    var w=s.root,scroll=w.scrollTop;w.dataset.system=s.kind;w.dataset.phase=s.phase;
    var h='<div class="gw-atmosphere" aria-hidden="true"></div><div class="gw-shell"><nav class="gw-topbar" aria-label="占卜導覽"><button type="button" class="gw-back" data-action="close">← 返回首頁</button><span class="gw-brand"><i aria-hidden="true">☾</i>靜月之光</span><a href="https://shopee.tw/a50h95648d?tab=shop" target="_blank" rel="noopener noreferrer">蝦皮選物 ↗</a></nav><header class="gw-head"><div><span class="gw-eyebrow">'+(s.kind==='liuyao'?'LIU YAO · THE CHAMBER OF CHANGE':'I CHING · THE BOOK OF CHANGES')+'</span><h1 id="'+s.id+'-title">'+TITLES[s.kind]+'</h1><p>'+(s.kind==='liuyao'?'三錢入盤，六爻照見事情的進退。':'蓍草三變，一卷周易，讀懂此刻的分寸。')+'</p></div><span class="gw-seal" aria-hidden="true">'+(s.kind==='liuyao'?'靜觀其變':'與時偕行')+'</span></header><ol class="gw-steps" aria-label="占卜流程">';
    ['整理心事',s.kind==='yijing'?'揲蓍成卦':'擲錢成卦','展開解讀'].forEach(function(t,i){h+='<li aria-current="'+(i===['input','casting','result'].indexOf(s.phase)?'step':'false')+'"><b>0'+(i+1)+'</b>'+t+'</li>';});h+='</ol>';
    h+=s.phase==='result'?resultPanel(s):'<div class="gw-main">'+(s.phase==='input'?inputPanel(s):castingPanel(s))+stage(s)+'</div>';
    h+='<footer class="gw-footer">JINGYUE · THE MOON ATELIER<br>把問題留在此刻，把選擇握在自己手裡。</footer></div>';w.innerHTML=h;w.scrollTop=scroll;
    syncScene(s);
    if(root.JYFoley)root.JYFoley.sync();
    if(s.phase==='input'&&root.JYReadingRecommender)root.JYReadingRecommender.enhance(w);
  }
  function clearMotion(s){clearTimeout(s.timer);s.timer=null;(s.cueTimers||[]).forEach(clearTimeout);s.cueTimers=[];if(s.scene)s.scene.finish();if(root.JYFoley)root.JYFoley.stop('gua-'+s.kind);s.animations.forEach(function(a){try{a.cancel();}catch(_){}});s.animations=[];}
  // Keep the actual instruments visible after the user presses the fixed action.
  // Audio follows the ceremony clock, never the GPU frame rate or intersection.
  function frameStage(s){
    var stage=s.root.querySelector('.gw-stage-side'),scene=s.root.querySelector('.gw-scene'),actions=s.root.querySelector('.gw-actions');
    if(!stage||!scene)return;var r=scene.getBoundingClientRect(),room=s.root.getBoundingClientRect(),a=actions&&actions.getBoundingClientRect();
    var bottom=a&&getComputedStyle(actions).position==='fixed'?a.top:room.bottom;
    if(r.top<room.top+8||r.bottom>bottom-8)s.root.scrollTop+=stage.getBoundingClientRect().top-room.top-12;
  }
  function yarrowTimeline(s){
    s.cueTimers=[];
    [0,576,1368,1908,2880].forEach(function(ms,p){
      var tick=function(){if(s.busy&&active===s.kind&&!document.hidden)yarrowPhase(s,p);};
      if(ms)s.cueTimers.push(setTimeout(tick,ms));else tick();
    });
    [[.576,'stems',-.2],[1.368,'bamboo',0],[1.908,'stems',.2],[2.88,'bamboo',0]].forEach(function(c){cue(s,c[1],{delay:c[0],pan:c[2],volume:c[1]==='stems'?.85:.55,throttle:0});});
  }
  function finish(s,paint){
    clearMotion(s);s.busy=false;s.commit=false;if(s.part.length===3)s.part=[];
    if(s.values.length===6){var engine=s.kind==='liuyao'?core():root.JYYijingCore;if(!engine)throw new Error('易經引擎尚未載入');s.result=engine.calculate({values:s.values,records:s.records,method:s.mode,question:s.question,calendar:s.date,focus:s.focus});s.phase='result';s.selected=s.result.movingPositions[0]||(s.kind==='liuyao'?s.result.original.palace.shi:1);}
    if(paint!==false){render(s);if(s.phase==='result'){s.root.scrollTop=0;s.root.querySelector('h1').tabIndex=-1;s.root.querySelector('h1').focus({preventScroll:true});}else{var b=s.root.querySelector('[data-action=toss]');if(b)b.focus({preventScroll:true});}}
  }
  function nextYarrow(s){
    var total=s.part.length?s.part[s.part.length-1].remaining:49,ch=root.JYYarrowCore.change(total);
    s.part.push(ch);s.lastChange=ch;s.commit=s.part.length===3;
    if(s.commit){var record=root.JYYarrowCore.record(s.part);s.records.push(record);s.values.push(record.value);}
  }
  function toss(s){
    if(s.busy||s.phase!=='casting')return;if(s.values.length===6){finish(s);return;}
    if(root.JYFoley)root.JYFoley.unlock(sounds(s));
    s.commit=true;
    if(s.mode==='yarrow')nextYarrow(s);else{var record=core().toss();s.records.push(record);s.values.push(record.value);}
    s.busy=true;s.error='';render(s);
    if(reduced()){finish(s);cue(s,s.mode==='coins'?'coins':'stems',{volume:.75});return;}
    frameStage(s);
    if(s.scene){s.scene.animate();}
    if(s.mode==='coins'){[0,1,2].forEach(function(i){cue(s,'coins',{delay:.99+i*.07,volume:.62,offset:.09,duration:.48,pan:(i-1)*.3,throttle:0});});}
    else yarrowTimeline(s);
    s.timer=setTimeout(function(){try{finish(s);}catch(e){s.busy=false;error(s,e);}},s.mode==='yarrow'?3700:1650);
  }
  function start(s){
    if(s.busy||s.phase!=='input')return;remember(s);s.question=s.question.trim();if(!s.question)throw new Error('先寫下你想釐清的一件事，再開始起卦。');
    if(s.mode==='manual'&&s.manual.some(function(v){return !Number.isInteger(v)||v<6||v>9;}))throw new Error('請完整填入初爻至上爻的六次結果。');
    if(root.JYFoley)root.JYFoley.unlock(sounds(s));
    s.date=calendar(s);s.error='';s.values=s.mode==='manual'?s.manual.slice():[];s.records=[];s.part=[];s.lastChange=null;s.phase='casting';
    if(s.mode==='manual')finish(s);else{render(s);cue(s,s.mode==='yarrow'?'paper':'coins',{volume:.50});s.root.scrollTop=0;var button=s.root.querySelector('[data-action=toss]');if(button)button.focus({preventScroll:true});}
  }
  function quick(s){if(s.busy||s.phase!=='casting')return;while(s.values.length<6){if(s.mode==='yarrow'){nextYarrow(s);if(s.part.length===3)s.part=[];}else{var r=core().toss();s.records.push(r);s.values.push(r.value);}}finish(s);}
  function reset(s){clearMotion(s);s.busy=false;s.commit=false;if(s.part.length===3)s.part=[];s.phase='input';s.values=[];s.records=[];s.part=[];s.lastChange=null;s.result=null;s.date=null;s.error='';s.manual=[null,null,null,null,null,null];s.time=wallNow(Number.isFinite(Number(s.offset))?Number(s.offset):8);render(s);s.root.scrollTop=0;var q=document.getElementById(s.id+'-q');if(q)q.focus({preventScroll:true});}
  async function copyPrompt(s){
    var text=root.JYGuaPrompt.build(s.result),area=s.root.querySelector('.gw-prompt-area'),ok=false;
    try{if(root.navigator.clipboard&&root.navigator.clipboard.writeText){await root.navigator.clipboard.writeText(text);ok=true;}}catch(_){}
    if(!ok){var t=document.createElement('textarea');t.value=text;t.style.cssText='position:fixed;left:0;top:0;width:1px;height:1px;opacity:0';s.root.appendChild(t);t.focus();t.select();try{ok=document.execCommand('copy');}catch(_){}t.remove();}
    if(ok)note('已複製完整卦象與解讀提示詞。');else{var fold=s.root.querySelector('.gw-prompt-fold');fold.open=true;area.focus();area.select();note('無法自動複製，請長按已選取的提示詞複製。');}
    return ok;
  }
  function save(s){var blob=new Blob([JSON.stringify(s.result,null,2)],{type:'application/json;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=s.kind+'-'+s.result.calendar.wall.slice(0,10)+'.json';s.root.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(url);},1000);}
  function share(s){if(!root.JYShareCard)throw new Error('分享卡尚未載入，請稍後再試。');var r=s.result;root.JYShareCard.open(s.kind,{question:r.question,cards:[{name:r.original.fullName,pos:'本卦',lines:r.original.lines,moving:r.movingPositions}].concat(r.hasChange?[{name:r.changed.fullName,pos:'之卦',lines:r.changed.lines,moving:r.movingPositions}]:[]),date:r.calendar.wall,conclusion:s.kind==='liuyao'?'月建 '+r.calendar.monthBranch+' · 日辰 '+r.calendar.day+' · 旬空 '+r.calendar.voidBranches.join(''):(r.reading.selections[0].hexagram+' · '+r.reading.selections[0].label+'：'+r.reading.selections[0].text),moving:r.movingPositions,gua:r,method:r.method});}
  function open(kind){
    if(!TITLES[kind])return;if(active===kind)return;if(active)close(active);
    var s=rooms[kind]||(rooms[kind]=create(kind));s.focusBefore=document.activeElement;s.overflow=document.body.style.overflow;
    if(root.JYFoley)root.JYFoley.prepare(sounds(s));
    if(!s.root){s.root=document.createElement('section');s.root.id=kind+'-screen';s.root.className='gw-room';s.root.hidden=true;s.root.setAttribute('role','dialog');s.root.setAttribute('aria-modal','true');s.root.setAttribute('aria-labelledby',s.id+'-title');document.body.appendChild(s.root);bind(s);}
    s.inert=Array.from(document.body.children).filter(function(el){return el!==s.root&&!['SCRIPT','STYLE','LINK'].includes(el.tagName);}).map(function(el){var old=el.inert;el.inert=true;return [el,old];});
    active=kind;document.body.style.overflow='hidden';s.root.hidden=false;render(s);var title=s.root.querySelector('h1');title.tabIndex=-1;title.focus({preventScroll:true});
  }
  function close(kind){var s=rooms[kind||active];if(!s)return;remember(s);if(s.busy){try{finish(s,false);}catch(e){s.error=e.message;}}clearMotion(s);s.busy=false;s.commit=false;if(s.part.length===3)s.part=[];s.root.hidden=true;if(s.scene){s.scene.dispose();s.scene=null;}s.inert.forEach(function(p){p[0].inert=p[1];});s.inert=[];document.body.style.overflow=s.overflow;if(active===s.kind)active=null;clearTimeout(toastTimer);var toast=document.getElementById('gw-toast');if(toast)toast.remove();if(s.focusBefore&&s.focusBefore.isConnected)s.focusBefore.focus({preventScroll:true});}
  function bind(s){
    s.root.addEventListener('click',function(e){var b=e.target.closest('[data-action]');if(!b||b.disabled)return;var a=b.dataset.action;try{
      if(a==='close')close(s.kind);else if(a==='mode'){remember(s);if(!['coins','manual','yarrow'].includes(b.dataset.mode)||s.kind==='liuyao'&&b.dataset.mode==='yarrow')return;s.mode=b.dataset.mode;render(s);}
      else if(a==='start')start(s);else if(a==='toss')toss(s);else if(a==='skip')finish(s);else if(a==='quick')quick(s);else if(a==='reset')reset(s);else if(a==='line'){s.selected=Number(b.dataset.line);s.root.querySelectorAll('[data-line]').forEach(function(el){el.setAttribute('aria-pressed',String(Number(el.dataset.line)===s.selected));});s.root.querySelector('.gw-detail').innerHTML=detail(s);}
      else if(a==='copy')copyPrompt(s);else if(a==='share')share(s);else if(a==='save')save(s);
      else if(a==='ai'){var ai=AI.find(function(v){return v[0]===b.dataset.ai;});if(!ai)return;var tab=root.open('about:blank','_blank');if(tab)tab.opener=null;copyPrompt(s).then(function(ok){if(ok&&tab)tab.location.href=ai[2];else if(tab)tab.close();else if(ok)note('已複製；瀏覽器阻擋新分頁，請自行開啟 '+ai[1]+' 貼上。');});}
    }catch(err){error(s,err);}});
    s.root.addEventListener('input',function(){remember(s);});
    s.root.addEventListener('change',function(e){remember(s);if(e.target.dataset.field==='custom'){var date=s.root.querySelector('[data-field=time]');date.disabled=!s.custom;}});
    s.root.addEventListener('keydown',function(e){if(e.key==='Escape'){e.preventDefault();close(s.kind);}else if(e.key==='Tab'){var list=Array.from(s.root.querySelectorAll('button:not(:disabled),a,input:not(:disabled),select,textarea,summary')).filter(function(el){return el.offsetParent!==null;});if(!list.length)return;var first=list[0],last=list[list.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}});
  }
  document.addEventListener('visibilitychange',function(){Object.keys(rooms).forEach(function(k){if(rooms[k].root)rooms[k].root.dataset.paused=String(document.hidden);});});
  root._liuyaoOpen=function(){open('liuyao');};root._liuyaoClose=function(){close('liuyao');};
  root._yijingOpen=function(){open('yijing');};root._yijingClose=function(){close('yijing');};
  root.JYGuaRoom=Object.freeze({open:open,close:close,snapshot:function(kind){var s=rooms[kind];return s?JSON.parse(JSON.stringify({kind:s.kind,phase:s.phase,mode:s.mode,part:s.part,lastChange:s.lastChange,question:s.question,values:s.values,records:s.records,date:s.date,result:s.result,busy:s.busy})):null;}});
})(window);
