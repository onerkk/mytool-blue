/* Jingyue · Living Atlas. Presentation reads the canonical chart; it never casts. */
(function(root){
 'use strict';
 var DZ=['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
 var ORDER=['巳','午','未','申','酉','戌','亥','子','丑','寅','卯','辰'];
 var DESCRIPTIONS={命宮:'認識自己的核心傾向與行事方式',兄弟:'手足、同輩與近身支持的相處',夫妻:'親密關係、承諾與相處模式',子女:'子女緣分與親子互動的傳統觀察',財帛:'收入方式、資源運用與金錢習慣',疾厄:'身心照顧的傳統象意，不能代替醫療判斷',遷移:'外部環境、移動與對外表現',交友:'朋友、協作與人際界線',官祿:'工作方向、投入方式與角色',田宅:'居住環境、家庭根基與資產象意',福德:'內在感受、精神生活與休息方式',父母:'長輩、教養及支持關係'};
 function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
 function baseName(s){return String(s||'').replace(/宮$/,'');}
 function label(p){return p.name==='命宮'?'命宮':baseName(p.name)+'宮';}
 function major(p){return (p.stars||[]).filter(function(s){return s.type==='major';});}
 function palaceRelations(palaces,branch){
  var i=DZ.indexOf(branch);if(i<0)return [];
  return [0,4,8,6].map(function(n){return palaces.find(function(p){return p.branch===DZ[(i+n)%12];});}).filter(Boolean);
 }
 function mountZiwei(container,zw){
  if(!container||!zw||!zw.palaces||container.querySelector('.jx-atlas'))return;
  var scroll=container.querySelector('.at-chart-scroll');if(!scroll)return;
  var palaces=zw.palaces,first=palaces.find(function(p){return p.isMing;})||palaces[0];
  var host=document.createElement('section');host.className='jx-atlas';host.setAttribute('aria-label','紫微十二宮互動星圖');
  var nodes=ORDER.map(function(branch,i){
   var p=palaces.find(function(x){return x.branch===branch;});if(!p)return '';
   var a=(i*30-135)*Math.PI/180,x=50+38*Math.cos(a),y=50+38*Math.sin(a);
   return '<button type="button" class="jx-palace" data-palace="'+branch+'" style="--x:'+x.toFixed(3)+'%;--y:'+y.toFixed(3)+'%;--arrival:'+i*45+'ms" aria-pressed="false"><small>'+branch+(p.isMing?' · 命':'')+(p.isShen?' · 身':'')+'</small><strong>'+esc(label(p))+'</strong><span>'+esc(major(p).map(function(s){return s.name;}).join('・')||'空宮')+'</span></button>';
  }).join('');
  host.innerHTML='<header class="jx-atlas-head"><span class="jx-overline">ZI WEI · LIVING ATLAS</span><h2>十二宮，為你展開。</h2><p>先點一宮，再看它與其他宮位如何相連。</p></header>'+
   '<div class="jx-atlas-tabs" role="group" aria-label="命盤檢視"><button type="button" data-view="orbit" aria-pressed="true">互動星環</button><button type="button" data-view="chart" aria-pressed="false">傳統方盤</button></div>'+
   '<div class="jx-atlas-body"><div class="jx-orbit" role="group" aria-label="選擇一個宮位"><div class="jx-orbit-aura" aria-hidden="true"></div><svg class="jx-orbit-lines" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="38"/><circle cx="50" cy="50" r="28"/><path class="jx-connection" d=""/></svg>'+
   '<div class="jx-orbit-center"><span>本命星圖</span><strong class="jx-center-name"></strong><i class="jx-center-stars"></i><small>點宮位 · 看連結</small></div>'+nodes+'</div>'+
   '<section class="jx-palace-detail" aria-label="選中宮位的完整資料" aria-live="polite"></section></div>'+
   '<p class="jx-atlas-note">星環是宮位關係的互動概覽；方盤保留傳統十二地支位置。光線代表三方四正，不是吉凶分數。</p>';
  scroll.before(host);scroll.hidden=true;
  var oldNote=container.querySelector('.at-result-note');if(oldNote)oldNote.hidden=true;
  function point(branch){var i=ORDER.indexOf(branch),a=(i*30-135)*Math.PI/180;return [(50+38*Math.cos(a)).toFixed(3),(50+38*Math.sin(a)).toFixed(3)].join(' ');}
  function starsHtml(p){
   return (p.stars||[]).map(function(s){
    var brightness='';if(typeof root.getStarBright==='function'){var b=root.getStarBright(s.name,DZ.indexOf(p.branch));brightness=b&&b.label||'';}
    return '<span class="jx-star '+(s.type==='major'?'is-major':s.type==='sha'?'is-sha':'')+'"><b>'+esc(s.name)+'</b>'+(brightness?'<small>'+esc(brightness)+'</small>':'')+(s.hua?'<em class="'+(s.hua==='化忌'?'is-ji':'')+'">'+esc(s.hua)+'</em>':'')+'</span>';
   }).join('')||'<p>本宮無已列星曜；需參看對宮及三方四正。</p>';
  }
  function select(branch){
   var p=palaces.find(function(x){return x.branch===branch;});if(!p)return;
   var related=palaceRelations(palaces,branch),family=related.map(function(x){return x.branch;});
   host.querySelectorAll('[data-palace]').forEach(function(b){var v=b.getAttribute('data-palace');b.setAttribute('aria-pressed',String(v===branch));b.classList.toggle('is-related',family.indexOf(v)>=0&&v!==branch);});
   host.querySelector('.jx-center-name').textContent=label(p);host.querySelector('.jx-center-stars').textContent=major(p).map(function(s){return s.name;}).join('・')||'空宮 · 參看對宮';
   host.querySelector('.jx-connection').setAttribute('d',related.slice(1).map(function(x){return 'M '+point(branch)+' L '+point(x.branch);}).join(' '));
   var description=DESCRIPTIONS[p.name]||DESCRIPTIONS[baseName(p.name)]||'從本宮的實際星曜，連同三方四正一起看。';
   var panel=host.querySelector('.jx-palace-detail');
   panel.innerHTML='<div class="jx-detail-title"><span>'+esc(p.branch)+'位'+(p.isMing?' · 命宮':'')+(p.isShen?' · 身宮':'')+'</span><h3>'+esc(label(p))+'</h3><p>'+esc(description)+'</p></div>'+
    '<div class="jx-star-list">'+starsHtml(p)+'</div><div class="jx-relation-heading">同看三方四正</div><div class="jx-related-list">'+related.slice(1).map(function(x,i){return '<button type="button" data-inspect="'+x.branch+'"><small>'+(i===2?'對宮':'三合')+'</small><b>'+esc(label(x))+' · '+x.branch+'</b><span>'+esc(major(x).map(function(s){return s.name;}).join('、')||'空宮')+'</span></button>';}).join('')+'</div><p class="jx-detail-note">先辨星曜與宮位關係，再結合四化、身宮與運限解讀；單一星曜不能直接決定事件。</p>';
   panel.querySelectorAll('[data-inspect]').forEach(function(b){b.onclick=function(){select(b.getAttribute('data-inspect'));};});
  }
  host.querySelectorAll('[data-palace]').forEach(function(b){b.onclick=function(){select(b.getAttribute('data-palace'));};});
  host.querySelectorAll('[data-view]').forEach(function(b){b.onclick=function(){
   var chart=b.getAttribute('data-view')==='chart';scroll.hidden=!chart;host.querySelector('.jx-atlas-body').hidden=chart;
   host.querySelectorAll('[data-view]').forEach(function(x){x.setAttribute('aria-pressed',String(x===b));});
  };});select(first.branch);
 }
 function mountBazi(container,chart,meta){
  var row=container&&container.querySelector('.bzx-pillars');if(!row||row.getAttribute('data-living-pillars'))return;
  var keys=['year','month','day','hour'],names=['年柱','月柱','日柱','時柱'],P=chart.pillars||{},G=chart.gods||{},CG=chart.cangGan||{};
  row.setAttribute('data-living-pillars','true');row.setAttribute('role','group');row.setAttribute('aria-label','點選四柱查看資料');
  row.innerHTML=keys.map(function(k,i){var p=P[k]||{},unknown=k==='hour'&&meta&&meta.unknown;return '<button type="button" class="bzx-pil jx-pillar" data-pillar="'+k+'" aria-pressed="false" '+(unknown?'disabled':'')+'><small>'+names[i]+'</small><span>'+esc(unknown?'未':p.gan)+'</span><span>'+esc(unknown?'定':p.zhi)+'</span><i>'+(unknown?'時辰未知':k==='day'?'日主':'點選查看')+'</i></button>';}).join('');
  var panel=document.createElement('section');panel.className='jx-pillar-detail';panel.setAttribute('aria-live','polite');row.after(panel);
  function select(k){
   if(k==='hour'&&meta&&meta.unknown)return;var p=P[k]||{},i=keys.indexOf(k),gd=G[k]||{};
   row.querySelectorAll('[data-pillar]').forEach(function(b){b.setAttribute('aria-pressed',String(b.getAttribute('data-pillar')===k));});
   var domains=['先看年柱所列干支，再與月令及全局合看；不單憑年柱判出身。','月柱是核對月令的重要位置；旺衰仍須連同根氣、透干與全局。','日干是十神關係的參照點；日支也是傳統婚姻宮的觀察位置，不能單柱決定關係結果。','時柱須有可靠出生時刻。涉及換日、夏令時間或真太陽時邊界時，先核對資料。'];
   panel.innerHTML='<span class="jx-overline">'+names[i]+' · '+esc((p.gan||'')+(p.zhi||''))+'</span><h3>'+(['由根基，走進時間。','從月令，辨認氣候。','回到日主，看見連結。','讓時刻，有所依據。'][i])+'</h3><dl><div><dt>天干十神</dt><dd>'+esc(k==='day'?'日主（本人參照）':gd.gan||'未列')+'</dd></div><div><dt>地支藏干</dt><dd>'+esc(Array.isArray(CG[k])?CG[k].join('、'):'未列')+'</dd></div></dl><p>'+domains[i]+'</p>';
  }
  row.querySelectorAll('[data-pillar]').forEach(function(b){b.onclick=function(){select(b.getAttribute('data-pillar'));};});select('day');
 }
 // li arrays come from the engine's trigrams and are ordered bottom to top.
 // Rendering the moving line never recasts the user's hexagram.
 function hexagramFrames(mh){
  if(!mh||!mh.lo||!mh.up||!mh.lo.li||!mh.up.li)return [];
  var ben=mh.lo.li.concat(mh.up.li),changed=ben.slice(),dong=Number(mh.dong);
  if(ben.length!==6||dong<1||dong>6||!Number.isInteger(dong))return [];
  changed[dong-1]=changed[dong-1]?0:1;
  return [{key:'ben',name:'本卦',title:mh.ben&&mh.ben.n,lines:ben,note:'先看眼前的體用關係。亮起的是本次動爻，由下往上數第 '+dong+' 爻。'},
   {key:'hu',name:'互卦',title:mh.hu&&mh.hu.n,lines:[ben[1],ben[2],ben[3],ben[2],ben[3],ben[4]],note:'從本卦二、三、四爻取下互，三、四、五爻取上互；作為過程線索合看。'},
   {key:'bian',name:'變卦',title:mh.bian&&mh.bian.n,lines:changed,note:'只有本次動爻陰陽翻轉；這是變化方向的參考，不是保證發生的未來。'}];
 }
 function mountMeihua(container,mh){
  var row=container&&container.querySelector('.mhx-gua-row'),frames=hexagramFrames(mh);if(!row||!frames.length||container.querySelector('.jx-hexagram'))return;
  var host=document.createElement('section');host.className='jx-hexagram';
  host.innerHTML='<div class="jx-overline">THE CHANGING LINES · 觀察變化</div><div class="jx-hex-tabs" role="group" aria-label="查看本互變卦">'+frames.map(function(f,i){return '<button type="button" data-hex="'+i+'" aria-pressed="false">'+f.name+'</button>';}).join('')+'</div><div class="jx-hex-body"><div class="jx-hex-lines" role="img"></div><div class="jx-hex-copy" aria-live="polite"></div></div>';
  row.before(host);row.hidden=true;
  function select(i){var f=frames[i];if(!f)return;
   host.querySelectorAll('[data-hex]').forEach(function(b){b.setAttribute('aria-pressed',String(Number(b.getAttribute('data-hex'))===i));});
   var lines=host.querySelector('.jx-hex-lines');lines.setAttribute('aria-label',f.name+' '+f.title+'；爻序由下往上：'+f.lines.map(function(v){return v?'陽':'陰';}).join('、'));
   lines.innerHTML=f.lines.map(function(v,j){return '<div class="jx-yao '+(v?'is-yang':'is-yin')+(i!==1&&j===mh.dong-1?' is-moving':'')+'" style="--line:'+j+'"><small>'+['初','二','三','四','五','上'][j]+'</small><b></b><b></b><i>'+(i!==1&&j===mh.dong-1?'動':'')+'</i></div>';}).reverse().join('');
   host.querySelector('.jx-hex-copy').innerHTML='<span>'+f.name+'</span><h3>'+esc(f.title||'卦名待核對')+'</h3><p>'+esc(f.note)+'</p>';
  }host.querySelectorAll('[data-hex]').forEach(function(b){b.onclick=function(){select(Number(b.getAttribute('data-hex')));};});select(0);
 }
 function enhance(container,kind){
  if(!container||!container.setAttribute)return;
  var art=container.querySelector('.at-tool-header [data-art]');kind=kind||art&&art.getAttribute('data-art');
  if(kind)container.setAttribute('data-experience',kind);
 }
 root.JYExperience={mountZiwei:mountZiwei,mountBazi:mountBazi,mountMeihua:mountMeihua,hexagramFrames:hexagramFrames,relations:palaceRelations,enhance:enhance};
})(window);
