(function(root){
  'use strict';
  const doc=root.document,VERSION='20260913vedic1';
  const CITIES=[['台北',25.03,121.56,'Asia/Taipei'],['新北',25.01,121.47,'Asia/Taipei'],['桃園',24.99,121.30,'Asia/Taipei'],['台中',24.15,120.68,'Asia/Taipei'],['台南',22.99,120.23,'Asia/Taipei'],['台南・新營',23.31,120.31,'Asia/Taipei'],['高雄',22.63,120.31,'Asia/Taipei'],['花蓮',23.98,121.60,'Asia/Taipei'],['香港',22.32,114.17,'Asia/Hong_Kong'],['新加坡',1.35,103.82,'Asia/Singapore'],['吉隆坡',3.14,101.69,'Asia/Kuala_Lumpur'],['東京',35.68,139.69,'Asia/Tokyo'],['新德里',28.61,77.21,'Asia/Kolkata'],['紐約',40.71,-74.01,'America/New_York'],['洛杉磯',34.05,-118.24,'America/Los_Angeles'],['倫敦',51.51,-.13,'Europe/London'],['雪梨',-33.87,151.21,'Australia/Sydney']];
  let page=null,chart=null,question='',topic='general',division=1,layout='south',selected=0,selectedMD=0,busy=false,loadPromise=null,ceremony=null,entry=null,overflow='',epoch=0,inertSiblings=[];
  const $=id=>doc.getElementById(id),esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const btn=(action,label,cls='')=>'<button type="button" data-vd-action="'+action+'" class="'+cls+'">'+label+'</button>';
  function load(){
    if(root.JYVedic&&root.JYVedicPrompt)return Promise.resolve();if(loadPromise)return loadPromise;
    const files=['JS/vendor/astronomy-engine-2.1.19.min.js','JS/vedic-ayanamsa.js','JS/vedic-engine.js','JS/vedic-prompt.js'];
    loadPromise=files.reduce((p,url)=>p.then(()=>new Promise((resolve,reject)=>{
      if(root._jyLazyScript)root._jyLazyScript(url+'?v='+VERSION,ok=>ok?resolve():reject(Error('星曆載入失敗，請檢查網路後重試')));
      else{const s=doc.createElement('script');s.src=url+'?v='+VERSION;s.onload=resolve;s.onerror=()=>reject(Error('星曆載入失敗'));doc.head.appendChild(s);}
    })),Promise.resolve()).catch(e=>{loadPromise=null;throw e;});return loadPromise;
  }
  function stamp(ms,withYear=true){const tz=chart&&chart.input.civil&&chart.input.civil.timezone||'Asia/Taipei';return new Intl.DateTimeFormat('zh-TW',{timeZone:tz,year:withYear?'numeric':undefined,month:'2-digit',day:'2-digit'}).format(new Date(ms));}
  function degrees(x){let m=Math.round(x*60);return Math.floor(m/60)+'°'+String(m%60).padStart(2,'0')+'′';}
  function animate(el,cls='vd-reveal'){if(!el)return;el.classList.remove(cls);void el.offsetWidth;el.classList.add(cls);}
  function hero(title,subtitle){return '<div class="vd-hero"><div><span class="vd-eyebrow">JYOTISHA · THE NAVAGRAHA SANCTUM</span><h1>'+title+'</h1><p>'+subtitle+'</p></div><div class="vd-orbit" aria-hidden="true"><img src="assets/ui/vedic-astrolabe.svg" alt="" width="800" height="800"></div></div>';}
  function create(){
    page=doc.createElement('section');page.id='vedic-page';page.className='vd-page';page.hidden=true;page.setAttribute('aria-label','印度占星・九曜星殿');page.setAttribute('role','dialog');page.setAttribute('aria-modal','true');
    page.dataset.motion=root.matchMedia&&root.matchMedia('(prefers-reduced-motion: reduce)').matches?'still':'full';
    page.innerHTML='<div class="vd-backdrop" aria-hidden="true"></div><header class="vd-header">'+btn('close','← 返回')+'<span class="vd-brand">靜月之光<small>JINGYUE</small></span>'+btn('motion','動態：'+(page.dataset.motion==='still'?'靜態':'完整'),'vd-quiet')+'</header><main class="vd-wrap"><div id="vd-form-view">'+
      hero('九曜映照，<br>讀懂你的生命節奏。','從出生的那一刻，展開印度占星的本命、分盤與運期。讓問題有脈絡，也讓下一步更清楚。')+
      '<div class="vd-steps" aria-label="探索步驟"><span data-active="true"><i>01</i>留下座標</span><span><i>02</i>點亮星儀</span><span><i>03</i>展開命盤</span></div>'+
      '<form id="vd-form" class="vd-panel"><h2>把時間，留在星圖裡。</h2><p class="vd-sub">請填出生地當時鐘錶上的時間。城市座標可在下方微調，歷史夏令時間依所選時區換算。</p><div class="vd-fields">'+
      '<div class="vd-field"><label for="vd-date">出生日期</label><input id="vd-date" name="date" type="date" min="1900-01-02" max="2100-12-30" required></div>'+
      '<div class="vd-field"><label for="vd-time">出生時間</label><input id="vd-time" name="time" type="time" step="60" required></div>'+
      '<div class="vd-field"><label for="vd-city">出生地</label><select id="vd-city">'+CITIES.map((c,i)=>'<option value="'+i+'">'+c[0]+'</option>').join('')+'<option value="custom">其他地點／自訂座標</option></select></div>'+
      '<div class="vd-field"><label for="vd-topic">這次想理解</label><select id="vd-topic"><option value="general">完整命盤</option><option value="career">工作與方向</option><option value="relationship">感情與相處</option><option value="wealth">收入與資源</option><option value="learning">學習與長處</option><option value="timing">近三年節奏</option><option value="wellbeing">生活與內在</option><option value="bracelet">配戴與日常提醒</option></select></div>'+
      '<div class="vd-field vd-full"><label for="vd-question">心裡最在意的事</label><textarea id="vd-question" maxlength="6000" placeholder="例如：我現在適合轉職，還是留在原職累積？希望同時了解自己的長處與接下來的時機。"></textarea></div></div>'+
      '<label class="vd-check"><input id="vd-unknown" type="checkbox"> 我不確定出生時間，先看可確認的星位</label>'+
      '<details id="vd-advanced"><summary>出生座標、時間誤差與排盤設定</summary><div class="vd-fields">'+
      '<div class="vd-field"><label for="vd-lat">緯度（北＋／南－）</label><input id="vd-lat" type="number" min="-89" max="89" step="any" value="25.03" required></div>'+
      '<div class="vd-field"><label for="vd-lon">經度（東＋／西－）</label><input id="vd-lon" type="number" min="-180" max="180" step="any" value="121.56" required></div>'+
      '<div class="vd-field vd-full"><label for="vd-timezone">出生地時區（IANA）</label><input id="vd-timezone" value="Asia/Taipei" required spellcheck="false" placeholder="例如 America/New_York"></div>'+
      '<div class="vd-field"><label for="vd-uncertainty">出生時間可能誤差</label><select id="vd-uncertainty"><option value="0">按所填時間</option><option value="5">前後 5 分鐘</option><option value="15">前後 15 分鐘</option><option value="30">前後 30 分鐘</option><option value="60">前後 1 小時</option></select></div>'+
      '<div class="vd-field"><label for="vd-dst">夏令時間重複時段</label><select id="vd-dst"><option value="">遇到重複時請我核對</option><option value="earlier">第一次出現的時間</option><option value="later">第二次出現的時間</option></select></div>'+
      '<div class="vd-field"><label for="vd-ayanamsa">歲差設定</label><select id="vd-ayanamsa"><option value="lahiri">Lahiri／Chitrapaksha</option><option value="raman">Raman</option></select></div>'+
      '<div class="vd-field"><label for="vd-year-days">運期一年長度</label><select id="vd-year-days"><option value="365.2425">太陽年・365.2425 日</option><option value="365.25">365.25 日</option><option value="360">Savana 年・360 日</option></select></div>'+
      '<div class="vd-field"><label for="vd-reference">觀察日期</label><input id="vd-reference" type="date" required min="1900-01-02" max="2100-12-30"></div></div><p class="vd-sub">採恆星黃道、整宮制與平均月交點；與其他排盤比對時，請使用相同設定。城市座標是參考中心點，可依出生地紀錄微調。</p></details>'+
      '<p id="vd-form-status" class="vd-status" aria-live="polite"></p><div class="vd-actions"><button id="vd-submit" class="vd-primary" type="submit">點亮我的九曜星圖 →</button></div></form></div><div id="vd-result-view" hidden></div><p class="vd-foot">靜月之光 · 印度占星<br>讓理解，成為生活裡的光。</p></main>';
    doc.body.appendChild(page);const today={};new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Taipei',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date()).forEach(p=>today[p.type]=p.value);$('vd-reference').value=today.year+'-'+today.month+'-'+today.day;
    $('vd-form').addEventListener('submit',submit);$('vd-city').addEventListener('change',()=>{const c=CITIES[Number($('vd-city').value)];if(c){$('vd-lat').value=c[1];$('vd-lon').value=c[2];$('vd-timezone').value=c[3];}else{$('vd-advanced').open=true;$('vd-lat').focus();}});
    $('vd-unknown').addEventListener('change',()=>{const unknown=$('vd-unknown').checked;$('vd-time').disabled=unknown;$('vd-time').required=!unknown;$('vd-uncertainty').disabled=unknown;});
    page.addEventListener('click',click);page.addEventListener('change',e=>{if(e.target.id==='vd-division'){division=+e.target.value;selected=chart.vargas[division].lagna?chart.vargas[division].lagna.sign:0;renderChart();}});
    page.addEventListener('keydown',e=>{if(e.key==='Escape'&&!(root.JYRitual&&root.JYRitual.isActive()))close();
      if(e.key==='Tab'){const all=[...page.querySelectorAll('button,input,select,textarea,a[href],summary')].filter(x=>!x.disabled&&x.getClientRects().length);const first=all[0],last=all[all.length-1];if(e.shiftKey&&doc.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&doc.activeElement===last){e.preventDefault();first.focus();}}
    });
  }
  function status(text,error=false){const s=$('vd-form-status');s.textContent=text;s.setAttribute('role',error?'alert':'status');}
  async function submit(e){
    e.preventDefault();if(busy)return;if(!$('vd-form').reportValidity())return;
    busy=true;const token=++epoch;$('vd-submit').disabled=true;status('正在準備星曆與出生座標…');
    try{
      await load();if(token!==epoch)return;
      const unknown=$('vd-unknown').checked,zone=$('vd-timezone').value.trim(),civil={date:$('vd-date').value,time:unknown?'12:00':$('vd-time').value,timezone:zone,disambiguation:$('vd-dst').value};
      const utc=root.JYVedic.civilToUTC(civil),ref=root.JYVedic.civilToUTC({date:$('vd-reference').value,time:'12:00',timezone:zone});
      const nextQuestion=$('vd-question').value.trim(),nextTopic=$('vd-topic').value;
      status('正在核對九曜、十六分盤與運期…');await new Promise(resolve=>requestAnimationFrame(()=>setTimeout(resolve,0)));if(token!==epoch)return;
      const c=CITIES[Number($('vd-city').value)],result=root.JYVedic.compute({utc:utc.date,reference:ref.date,latitude:Number($('vd-lat').value),longitude:Number($('vd-lon').value),location:c?c[0]:'自訂座標',civil:{...civil,offsetMinutes:utc.offsetMinutes},ayanamsa:$('vd-ayanamsa').value,yearDays:Number($('vd-year-days').value),uncertaintyMinutes:Number($('vd-uncertainty').value),unknownTime:unknown});
      if(token!==epoch)return;chart=result;question=nextQuestion;topic=nextTopic;division=1;selected=chart.lagna?chart.lagna.sign:0;selectedMD=Math.max(0,chart.dasha.periods.findIndex(p=>chart.dasha.current&&p===chart.dasha.current.maha));
      if(root.JYRitual){ceremony=root.JYRitual.play('vedic',{question:question||'從本命與運期，理解自己的方向。',reduced:page.dataset.motion==='still'});const outcome=await ceremony.finished;ceremony=null;if(token!==epoch)return;if(outcome===false){status('星圖已保留。準備好後可再次展開。');return;}}
      renderResult();$('vd-form-view').hidden=true;$('vd-result-view').hidden=false;page.scrollTo({top:0,behavior:'instant'});animate($('vd-result-view'));$('vd-result-title').focus({preventScroll:true});
    }catch(err){status(err&&err.message||'排盤未完成，請核對資料後重試',true);}
    finally{if(token===epoch){busy=false;$('vd-submit').disabled=false;}}
  }
  function cell(sign,v,north=false,index=0){const ps=root.JYVedic.KEYS.filter(k=>v.planets[k].sign===sign),house=v.lagna?(sign-v.lagna.sign+12)%12+1:null;
    const positions=[[50,27],[26,9],[9,26],[27,50],[9,74],[26,91],[50,73],[74,91],[91,74],[73,50],[91,26],[74,9]];
    return '<button type="button" class="vd-house" data-vd-sign="'+sign+'" data-selected="'+(selected===sign)+'" data-lagna="'+(v.lagna&&v.lagna.sign===sign)+'" '+(north?'style="left:'+positions[index][0]+'%;top:'+positions[index][1]+'%"':'')+' aria-label="'+root.JYVedic.SIGNS[sign]+(house?'，第'+house+'宮':'')+'，'+(ps.map(root.JYVedic.zh).join('、')||'空宮')+'"><small>'+(house?'第 '+house+' 宮':'星座')+'</small><strong>'+root.JYVedic.SIGNS[sign]+'</strong><em>'+ps.slice(0,2).map(k=>root.JYVedic.zh(k).slice(0,1)).join('・')+(ps.length>2?' ＋'+(ps.length-2):'')+'</em></button>';
  }
  function renderChart(){
    const v=chart.vargas[division],host=$('vd-chart'),C=root.JYVedic;if(!v.lagna&&layout==='north')layout='south';
    host.dataset.layout=layout;
    if(layout==='south'){
      const cells=[11,0,1,2,10,null,null,3,9,null,null,4,8,7,6,5];
      host.innerHTML=cells.map((s,i)=>s==null?'':cell(s,v).replace('class="vd-house"','class="vd-house" style="grid-row:'+((i/4|0)+1)+';grid-column:'+(i%4+1)+'"')).join('')+'<div class="vd-chart-center"><strong>D'+division+'</strong><span>'+esc(v.purpose)+'</span><span>'+(v.lagna?'上升 '+v.lagna.signName:'出生時間未知')+'</span></div>';
    }else host.innerHTML='<svg class="vd-north-lines" viewBox="0 0 400 400" aria-hidden="true"><path d="M0 0 400 400M400 0 0 400M200 0 400 200 200 400 0 200Z"/></svg>'+Array.from({length:12},(_,i)=>cell((v.lagna.sign+i)%12,v,true,i)).join('');
    $('vd-chart-caption').textContent='D'+division+' · '+v.purpose+' · '+(layout==='south'?'南印度式：星座位置固定':'北印度式：宮位位置固定');
    page.querySelectorAll('[data-vd-layout]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.vdLayout===layout)));
    $('vd-north').disabled=!v.lagna;renderDetail();animate(host,'vd-tab-reveal');
  }
  function renderDetail(planet){
    const C=root.JYVedic,v=chart.vargas[division],ps=C.KEYS.filter(k=>v.planets[k].sign===selected),house=v.lagna?(selected-v.lagna.sign+12)%12+1:null,lord=C.LORDS[selected],lp=v.planets[lord];
    let html='<span class="vd-eyebrow">D'+division+' · '+(house?'HOUSE '+house:'RASHI')+'</span><h3>'+C.SIGNS[selected]+' · '+(house?'第 '+house+' 宮':'星座')+'</h3><p>'+(house?esc(root.JYVedicPrompt.houseMeanings[house-1]):'未提供出生時間，目前顯示星座位置。')+'</p><p>宮主 '+C.zh(lord)+' → '+lp.signName+(lp.house?'第 '+lp.house+' 宮':'')+'</p><p>此處九曜：'+(ps.map(C.zh).join('、')||'空宮，請循宮主與相位觀察')+'</p>';
    if(division===1){const incoming=chart.aspects.graha.filter(a=>a.toSign===selected).map(a=>C.zh(a.from)+'（第'+a.step+'照）');html+='<p>行星相位：'+(incoming.join('、')||'七曜沒有全照相位落入')+'</p>';}
    html+='<div class="vd-chips">'+ps.map(k=>'<button type="button" data-vd-planet="'+k+'">'+C.zh(k)+' '+chart.planets[k].symbol+'</button>').join('')+'</div>';
    if(planet){const p=chart.planets[planet],d9=chart.vargas[9].planets[planet];html+='<hr><h3>'+p.name+' '+p.symbol+'</h3><p>本命 '+p.signName+' '+degrees(p.degree)+'<br>'+p.dignity.label+' · '+(p.retrograde?'逆行':'順行')+'<br>'+p.nakshatra.name+' 第 '+p.nakshatra.pada+' 足<br>宿主 '+C.zh(p.nakshatra.lord)+' · 定位星 '+C.zh(p.dispositor)+'</p><p>D9：'+d9.signName+(d9.house?'第 '+d9.house+' 宮':'')+(d9.vargottama?' · 與本命同座':'')+'<br>距太陽 '+p.sunSeparation.toFixed(2)+'°</p>';}
    $('vd-detail').innerHTML=html;animate($('vd-detail'));
  }
  function renderDasha(){
    const C=root.JYVedic,d=chart.dasha,m=d.periods[selectedMD],reference=d.reference;if(chart.input.unknownTime){$('vd-dasha').innerHTML='<p class="vd-sub">出生時間尚未確認，先保留月宿可能範圍；補上時間後再展開確定交運表。</p>';return;}
    $('vd-dasha').innerHTML='<p class="vd-sub">出生時 '+C.zh(d.firstLord)+'大運尚餘 '+d.balanceYears.toFixed(3)+' 年。副運承接出生前已開始的大運。以下日期依 '+esc(chart.input.civil&&chart.input.civil.timezone||'Asia/Taipei')+' 顯示。</p><div class="vd-timeline" role="group" aria-label="選擇大運">'+d.periods.slice(0,10).map((p,i)=>'<button type="button" data-vd-md="'+i+'" aria-pressed="'+(i===selectedMD)+'">'+C.zh(p.lord)+'<small>'+new Date(p.visibleStart).getUTCFullYear()+'</small></button>').join('')+'</div><h3>'+C.zh(m.lord)+'大運 · '+stamp(m.visibleStart)+' — '+stamp(m.end)+'</h3><ol class="vd-period-list">'+m.children.filter(a=>a.end>d.birth).map(a=>'<li data-current="'+(reference>=a.start&&reference<a.end)+'"><strong>'+C.zh(m.lord)+'／'+C.zh(a.lord)+(reference>=a.start&&reference<a.end?' · 當期':'')+'</strong><span>'+stamp(Math.max(a.start,d.birth))+' — '+stamp(a.end)+'</span></li>').join('')+'</ol>'+(d.current?'<details><summary>當期次副運 · 更短的時間層次</summary><ol class="vd-period-list">'+d.current.pratyantars.map(p=>'<li data-current="'+(p===d.current.pratyantar)+'"><strong>'+C.zh(p.lord)+(p===d.current.pratyantar?' · 當期':'')+'</strong><span>'+stamp(p.start)+' — '+stamp(p.end)+'</span></li>').join('')+'</ol></details>':'');
  }
  function renderResult(){
    const C=root.JYVedic,n=chart.planets.Moon,cur=chart.dasha.current,topicLabel=root.JYVedicPrompt.topics[topic].name;
    $('vd-result-view').innerHTML=hero('<span id="vd-result-title" tabindex="-1">星圖已展開。<br>沿著脈絡，理解自己。</span>',esc(question||'先從本命、當前運期與你最在意的面向開始。'))+
      '<div class="vd-actions">'+btn('edit','← 修改出生資料','vd-quiet')+btn('download','下載命盤資料','vd-quiet')+'</div><div class="vd-summary"><div class="vd-stat"><small>上升 · LAGNA</small><strong>'+(chart.lagna?chart.lagna.signName:'待確認')+'</strong><span>'+(chart.lagna?degrees(chart.lagna.degree):'需要出生時間')+'</span></div><div class="vd-stat"><small>月亮 · CHANDRA</small><strong>'+n.signName+'</strong><span>'+n.nakshatra.name+' · '+n.nakshatra.pada+' 足</span></div><div class="vd-stat"><small>當期大運 · DASHA</small><strong>'+(cur?C.zh(cur.maha.lord):'未定位')+'</strong><span>'+(cur?'副運 '+C.zh(cur.antar.lord):'核對時間與觀察日')+'</span></div></div>'+
      '<section class="vd-panel"><span class="vd-eyebrow">THE LIVING CHART</span><h2>十六面星圖，一層層看清。</h2><div class="vd-chart-tools"><label for="vd-division">選擇分盤<select id="vd-division">'+Object.entries(C.VARGAS).map(([d,v])=>'<option value="'+d+'">D'+d+' · '+v+'</option>').join('')+'</select></label><div class="vd-toggle" role="group" aria-label="命盤版式"><button type="button" data-vd-layout="south">南印度式</button><button type="button" id="vd-north" data-vd-layout="north">北印度式</button></div></div><div class="vd-chart-layout"><div><div class="vd-chart-stage"><div id="vd-chart" class="vd-chart"></div></div><p id="vd-chart-caption" class="vd-sub"></p></div><div id="vd-detail" class="vd-detail" aria-live="polite"></div></div><p class="vd-sub">輕觸宮格，再點九曜查看度數、月宿與分盤。兩種版式呈現同一份命盤。</p></section>'+
      '<section class="vd-panel"><span class="vd-eyebrow">NINE GRAHAS</span><h2>每顆星，都有它的角色。</h2><div class="vd-planet-grid">'+C.KEYS.map(k=>{const p=chart.planets[k];return '<button type="button" class="vd-planet" data-vd-planet="'+k+'"><span class="vd-glyph">'+p.symbol+'</span><strong>'+p.name+'</strong><span>'+p.signName+' '+degrees(p.degree)+'</span><small>'+p.dignity.label+(p.retrograde?' · 逆':'')+'</small></button>';}).join('')+'</div></section>'+
      '<section class="vd-panel"><span class="vd-eyebrow">VIMSHOTTARI · YOUR TIMELINE</span><h2>把當下，放回時間長廊。</h2><div id="vd-dasha"></div></section>'+
      '<section class="vd-panel"><span class="vd-eyebrow">CONNECTIONS & SUPPORT</span><h2>看見支持，也理解代價。</h2><div id="vd-structures"></div><details><summary>八分點表 · BAV／SAV</summary><div id="vd-av"></div></details><details><summary>觀察日行運 · '+stamp(chart.dasha.reference)+'</summary><div class="vd-table-scroll"><table><thead><tr><th>九曜</th><th>星座</th><th>從上升</th><th>從月亮</th><th>BAV</th></tr></thead><tbody>'+chart.transits.map(p=>'<tr><th>'+C.zh(p.planet)+'</th><td>'+p.signName+'</td><td>'+(p.fromLagna||'—')+'</td><td>'+p.fromMoon+'</td><td>'+(p.bav==null?'—':p.bav)+'</td></tr>').join('')+'</tbody></table></div></details><details><summary>出生時間變動與排盤設定</summary><div id="vd-policy"></div></details></section>'+
      '<section class="vd-panel vd-export"><span class="vd-eyebrow" style="text-align:center">FROM YOUR CHART TO YOUR LIFE</span><h2>讓解讀，回答你真正的問題。</h2><p class="vd-sub">'+topicLabel+' · 提示詞已帶入同一份命盤、分盤、相位與運期，依問題深入分析。</p><div class="vd-actions">'+btn('copy','複製我的深入解讀提示詞 →','vd-primary')+'</div><p id="vd-copy-status" class="vd-status" role="status" aria-live="polite"></p><div class="vd-ai-links"><a href="https://chatgpt.com/" target="_blank" rel="noopener noreferrer">ChatGPT ↗</a><a href="https://claude.ai/new" target="_blank" rel="noopener noreferrer">Claude ↗</a><a href="https://gemini.google.com/app" target="_blank" rel="noopener noreferrer">Gemini ↗</a></div><p class="vd-sub">先複製，再開啟你慣用的 AI，貼上即可開始解讀。</p><details><summary>查看完整提示詞／手動複製</summary><textarea id="vd-prompt-text" class="vd-manual" readonly aria-label="完整印度占星解讀提示詞"></textarea></details></section>';
    const ys=chart.yogas;$('vd-structures').innerHTML=ys.length?ys.map(y=>'<div class="vd-detail" style="margin-bottom:12px"><h3>'+esc(y.name)+'</h3><p>'+esc(y.rule)+'</p><p>'+y.conditions.map(p=>C.zh(p.planet)+(p.house?'・第'+p.house+'宮':'')+'・'+p.dignity).join('；')+'</p></div>').join(''):'<p class="vd-sub">本盤未符合目前列出的組合條件。可繼續循宮主、相位與運期理解主要結構。</p>';
    $('vd-av').innerHTML=chart.ashtakavarga?'<p class="vd-sub">七曜各有八個參照點。總表加總為 '+chart.ashtakavarga.total+'，數值用來比較座位承接背景。</p><div class="vd-table-scroll"><table><thead><tr><th>九曜</th>'+C.SIGNS.map(s=>'<th>'+s+'</th>').join('')+'</tr></thead><tbody>'+Object.entries(chart.ashtakavarga.bav).concat([['SAV',chart.ashtakavarga.sav]]).map(([k,row])=>'<tr><th>'+C.zh(k)+'</th>'+row.map(x=>'<td data-strong="'+(k==='SAV'?x>=30:x>=5)+'">'+x+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>':'<p class="vd-sub">需要出生時間才能確定上升參照點。</p>';
    $('vd-policy').innerHTML='<p class="vd-sub">出生 UTC：'+esc(chart.input.utc)+'<br>'+esc(chart.input.location)+' · '+chart.input.latitude+'°, '+chart.input.longitude+'°<br>'+esc(chart.policy.ayanamsa)+' 歲差 '+chart.policy.ayanamsaDegrees.toFixed(6)+'° · 整宮制 · 平均交點<br>運期年長 '+chart.policy.dashaYearDays+' 日</p><p class="vd-sub">'+esc(chart.sensitivity.note)+'</p>'+(chart.sensitivity.changes.length?'<p class="vd-sub">在所填時間區間，以下項目出現變動：<br>'+chart.sensitivity.changes.map(x=>esc(x.key)).join('、')+'</p>':'')+'<p class="vd-sub"><a href="docs/vedic-engine-20260913.md" target="_blank" rel="noopener">查看計算方法與核對範圍 ↗</a></p>';
    $('vd-prompt-text').value=root.JYVedicPrompt.build(question,chart,topic);renderChart();renderDasha();
  }
  async function copy(){const text=$('vd-prompt-text').value,target=$('vd-copy-status');try{if(navigator.clipboard&&navigator.clipboard.writeText)await navigator.clipboard.writeText(text);else{const ta=$('vd-prompt-text');ta.parentElement.open=true;ta.focus();ta.select();if(!doc.execCommand('copy'))throw Error('manual');}target.textContent='已複製。開啟 AI 後，貼上本次提示詞即可。';}catch(_){$('vd-prompt-text').parentElement.open=true;$('vd-prompt-text').focus();$('vd-prompt-text').select();target.textContent='請長按下方完整文字，選擇全選後複製。';}}
  function click(e){
    const b=e.target.closest('button');if(!b)return;
    if(page.dataset.motion!=='still'){const r=doc.createElement('i'),box=b.getBoundingClientRect();r.className='vd-ripple';r.style.left=(e.clientX?e.clientX-box.left:box.width/2)+'px';r.style.top=(e.clientY?e.clientY-box.top:box.height/2)+'px';b.appendChild(r);setTimeout(()=>r.remove(),650);}
    const a=b.dataset.vdAction;
    if(a==='close')close();else if(a==='motion'){page.dataset.motion=page.dataset.motion==='still'?'full':'still';b.textContent='動態：'+(page.dataset.motion==='still'?'靜態':'完整');}
    else if(a==='edit'){$('vd-result-view').hidden=true;$('vd-form-view').hidden=false;page.scrollTo({top:0,behavior:'instant'});animate($('vd-form-view'));}
    else if(a==='copy')copy();else if(a==='download'&&chart){const data={chart,question,topic},blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),link=doc.createElement('a');link.href=url;link.download='jingyue-vedic-chart.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
    else if(b.dataset.vdLayout){layout=b.dataset.vdLayout;renderChart();}else if(b.dataset.vdSign!=null){selected=+b.dataset.vdSign;renderChart();}
    else if(b.dataset.vdPlanet){const k=b.dataset.vdPlanet;selected=chart.vargas[division].planets[k].sign;renderChart();renderDetail(k);$('vd-detail').scrollIntoView({behavior:page.dataset.motion==='still'?'instant':'smooth',block:'nearest'});}
    else if(b.dataset.vdMd!=null){selectedMD=+b.dataset.vdMd;renderDasha();}
  }
  function open(){if(!page)create();if(!page.hidden)return;entry=doc.activeElement;overflow=doc.body.style.overflow;inertSiblings=[...doc.body.children].filter(x=>x!==page).map(node=>({node,value:node.inert}));inertSiblings.forEach(x=>x.node.inert=true);doc.body.style.overflow='hidden';page.hidden=false;page.scrollTop=0;page.querySelector('button').focus({preventScroll:true});animate($('vd-form-view'));load().catch(()=>{});}
  function close(){if(!page||page.hidden)return;++epoch;if(ceremony){ceremony.cancel();ceremony=null;}busy=false;$('vd-submit').disabled=false;page.hidden=true;doc.body.style.overflow=overflow;inertSiblings.forEach(x=>x.node.inert=x.value);inertSiblings=[];if(entry&&entry.isConnected)entry.focus({preventScroll:true});}
  root._vedicOpen=open;root.JYVedicUI=Object.freeze({open,close,load,getChart:()=>chart,getPrompt:()=>chart?root.JYVedicPrompt.build(question,chart,topic):'',getState:()=>({busy,division,layout,topic})});
})(window);
