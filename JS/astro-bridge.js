/* Shared native astrology for the composite workflow.
 * No astronomical formula or second interpretation classifier lives here.
 * Coordinates, geometry and periods are owned by JYWestern / JYVedic.
 */
(function(root){
  'use strict';
  const VERSION='20260924reading1';
  const WEST_NAMES={Sun:'太陽',Moon:'月亮',Mercury:'水星',Venus:'金星',Mars:'火星',Jupiter:'木星',Saturn:'土星',Uranus:'天王',Neptune:'海王',Pluto:'冥王',NorthNode:'北交',SouthNode:'南交'};
  const esc=x=>String(x==null?'':x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let pending=null;
  function load(){
    if(pending)return pending;
    const files=[
      ['JS/vendor/astronomy-engine-2.1.19.min.js',()=>!!root.Astronomy],
      ['JS/vedic-ayanamsa.js',()=>!!root.JYVedicAyanamsa],
      ['JS/astro-time.js',()=>!!root.JYAstroTime],
      ['JS/western-engine.js',()=>!!root.JYWestern],
      ['JS/vedic-engine.js',()=>!!root.JYVedic],
      ['JS/western-chart.js',()=>!!root.JYWesternChart],
      ['JS/western-prompt.js',()=>!!root.JYWesternPrompt],
      ['JS/vedic-prompt.js',()=>!!root.JYVedicPrompt]
    ];
    pending=files.reduce((p,[file,ready])=>p.then(()=>{
      if(ready())return;
      return new Promise((resolve,reject)=>{
        if(typeof root._jyLazyScript!=='function')return reject(Error('星曆載入元件尚未就緒，請重新整理'));
        root._jyLazyScript(file+'?v='+VERSION,ok=>ok&&ready()?resolve():reject(Error('星曆載入未完成，請重試')));
      });
    }),Promise.resolve()).catch(e=>{pending=null;throw e;});
    return pending;
  }
  function signature(form){
    const f=form||{},l=f.birthLocation||null;
    return JSON.stringify([f.bdate,f.btime,!!f.btimeUnknown,f.timePrecision||'',l,f.astroDisambiguation||'',f.astroOffsetMinutes==null?null:f.astroOffsetMinutes,f.ayanamsa||root.JY_AYANAMSA_MODE||'lahiri',f.houseSystem||'P',f.uncertaintyMinutes==null?null:f.uncertaintyMinutes]);
  }
  function inputFor(form,reference){
    if(!root.JYAstroTime)throw Error('時區換算元件尚未載入');
    const f=form||{},l=f.birthLocation||{latitude:25.03,longitude:121.56,timezoneId:'Asia/Taipei',label:'台北（未指定出生地）'};
    const unknown=!!f.btimeUnknown||f.timePrecision==='unknown';
    const timezone=l.timezoneId||(typeof l.timezone==='string'?l.timezone:null);
    const civil={date:f.bdate,time:unknown?'12:00':f.btime,timezone,disambiguation:f.astroDisambiguation||''};
    // Prefer historical IANA offsets. An explicit offset is only used when
    // deliberately supplied, or when the legacy location has no IANA zone.
    if(f.astroOffsetMinutes!=null)civil.offsetMinutes=Number(f.astroOffsetMinutes);
    else if(!timezone&&Number.isFinite(l.timezone))civil.offsetMinutes=l.timezone*60;
    if(unknown&&!timezone)throw Error('出生時間未知時，請選擇有時區資料的出生城市');
    const resolved=root.JYAstroTime.civilToUTC(civil);
    const ref=new Date(reference||f.astroReference||Date.now());
    if(!Number.isFinite(+ref)||ref<resolved.date)throw Error('請核對觀察日期，不能早於出生日期');
    const uncertainty=f.uncertaintyMinutes==null?(f.timePrecision==='approximate'?60:0):Number(f.uncertaintyMinutes);
    return {utc:resolved.date.toISOString(),reference:ref.toISOString(),latitude:Number(l.latitude),longitude:Number(l.longitude),location:l.label||l.city||'自訂出生地',civil:{...civil,offsetMinutes:resolved.offsetMinutes},unknownTime:unknown,uncertaintyMinutes:uncertainty,ayanamsa:f.ayanamsa||root.JY_AYANAMSA_MODE||'lahiri',yearDays:365.2425,houseSystem:f.houseSystem||'P',minorAspects:false};
  }
  function compute(form,reference){
    if(!root.JYWestern||!root.JYVedic)throw Error('占星引擎尚未載入');
    const input=inputFor(form,reference);
    const western=root.JYWestern.compute(input),vedic=root.JYVedic.compute(input);
    return Object.freeze({version:VERSION,signature:signature(form),input:Object.freeze(input),western,vedic});
  }
  function native(value){return value&&value.nativeAstro||null;}
  function period(p){return p?{lord:p.lord,zh:root.JYVedic.zh(p.lord),startDate:new Date(p.start).toISOString(),endDate:new Date(p.end).toISOString()}:null;}
  function westernView(chart){
    const planets={};Object.values(chart.planets).forEach(p=>{planets[WEST_NAMES[p.key]||p.name]={...p,lon:p.longitude,sign:p.signName,signIdx:p.sign,signDeg:p.degree,sym:p.symbol,el:p.element};});
    const at=key=>chart.houses?{name:root.JYWestern.SIGNS[Math.floor(chart.houses.angles[key]/30)],idx:Math.floor(chart.houses.angles[key]/30),deg:chart.houses.angles[key]%30}:null;
    return Object.freeze({nativeAstro:chart,planets:Object.freeze(planets),ascSign:at('ASC'),mcSign:at('MC'),aspects:chart.aspects,aspectPatterns:chart.patterns,summary:'太陽'+chart.planets.Sun.signName+'・月亮'+chart.planets.Moon.signName+(chart.houses?'・上升'+at('ASC').name:'・出生時間未知'),ephemerisSource:chart.policy.ephemeris});
  }
  function vedicView(chart){
    const planets={};Object.values(chart.planets).forEach(p=>{planets[p.key]={...p,zh:p.name,en:p.key,sidLon:p.longitude,rashiIdx:p.sign,rashi:{zh:p.signName,lord:root.JYVedic.LORDS[p.sign]},degInSign:p.degree};});
    return Object.freeze({nativeAstro:chart,planets:Object.freeze(planets),lagna:chart.lagna?{...chart.lagna,idx:chart.lagna.sign}:null,lagnaSign:chart.lagna?chart.lagna.signName:null,moonSign:chart.planets.Moon.signName,sunSign:chart.planets.Sun.signName,currentMD:period(chart.dasha.current&&chart.dasha.current.maha),currentAD:period(chart.dasha.current&&chart.dasha.current.antar),yogas:chart.yogas,summary:'月亮'+chart.planets.Moon.signName+(chart.lagna?'・上升'+chart.lagna.signName:'・出生時間未知')});
  }
  function clear(state){
    state.natal=null;state.jyotish=null;state.jyotishResult=null;state.astroBundle=null;state.astroError=null;
    ['_natQuestionResult','_jyQuestionResult','_uResult','_dimResults','_sevenSummary','_verdicts','_usedCache'].forEach(k=>{delete state[k];});
    state.natalTags=[];state.jyotishTags=[];
  }
  function commit(state,bundle){
    if(bundle.signature!==signature(state.form))throw Error('出生資料已更改，請重新排盤');
    const n=westernView(bundle.western),v=vedicView(bundle.vedic);
    clear(state);state.astroBundle=bundle;state.natal=n;state.jyotish=v;state.jyotishResult=v;state.astroError=null;
    return bundle;
  }
  const requests=new WeakMap();
  async function prepare(state,reference){
    const form=state.form,stamp=signature(form),token={};requests.set(state,token);clear(state);state.astroError=null;
    try{
      await load();
      if(root.requestAnimationFrame)await new Promise(r=>root.requestAnimationFrame(()=>setTimeout(r,0)));
      if(requests.get(state)!==token||state.form!==form||signature(state.form)!==stamp)return null;
      const bundle=compute(form,reference);
      if(requests.get(state)!==token||state.form!==form||signature(state.form)!==stamp)return null;
      return commit(state,bundle);
    }catch(e){
      if(requests.get(state)===token){clear(state);state.astroError=String(e.message||e);}
      throw e;
    }
  }
  function assertCurrent(state){
    if(!state.astroBundle||state.astroBundle.signature!==signature(state.form))throw Error('占星資料未完成或出生資料已更改，請重新排盤');
    return state.astroBundle;
  }
  function topic(t){return ({love:'relationship',health:'wellbeing',family:'home'})[t]||t||'general';}
  function payload(kind,chart,focus){
    if(kind==='vedic')return root.JYVedicPrompt.data(chart,topic(focus));
    return {engine:chart.version,birth:chart.input,policy:chart.policy,planets:chart.planets,houses:chart.houses,aspects:chart.aspects,patterns:chart.patterns,specialConditions:chart.specialConditions,dispositors:chart.dispositors,sect:chart.sect,chartRuler:chart.chartRuler,distribution:chart.distribution,sensitivity:chart.sensitivity,transits:chart.transits,progressions:chart.progressions,solarReturn:chart.solarReturn};
  }
  function project(p,state){
    if(!state.astroBundle&&!state.astroError)return p;
    if(state.astroBundle)assertCurrent(state);
    p.dims=p.dims||{};p.rawReadings=p.rawReadings||{};
    for(const [kind,value]of [['natal',state.natal],['vedic',state.jyotish]]){
      const chart=native(value),data=chart?payload(kind,chart,p.focusType):{status:'CALCULATION_FAILED',message:state.astroError};
      p.dims[kind]=data;p.rawReadings[kind]=JSON.stringify(data);
      for(const key of ['systems','systemPayloads'])if(p[key])p[key][kind]=data;
      if(p.readings)p.readings[kind]=p.rawReadings[kind];
      if(p.reversibility)delete p.reversibility[kind];
    }
    // Old voting/confidence summaries cannot be traced to the native geometry.
    for(const key of ['crossSummary','conflicts','conflictDescriptions','semanticResonance','confidence','weights','score','finalProb','verdict'])delete p[key];
    if(p.tags)p.tags=p.tags.filter(t=>!['星盤','吠陀','natal','vedic','astro','jyotish'].includes(t.system));
    if(p.timeline)p.timeline=p.timeline.filter(x=>!/^西洋|^星盤|^吠陀|^印度/.test(x));
    p.astrologyOwnership={source:'native-engines',version:VERSION,sharedReference:state.astroBundle&&state.astroBundle.input.reference,clock:'民用時間依歷史時區換算 UTC；不套真太陽時',noLegacyPositionPatch:true};
    return p;
  }
  const degree=x=>Number(x).toFixed(2)+'°';
  function table(head,rows){return '<div class="native-astro-table"><table><thead><tr>'+head.map(x=>'<th scope="col">'+esc(x)+'</th>').join('')+'</tr></thead><tbody>'+rows.map(r=>'<tr>'+r.map(x=>'<td>'+esc(x)+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>';}
  function html(id,value){const e=root.document&&root.document.getElementById(id);if(e)e.innerHTML=value;}
  function statusText(chart){return chart.input.unknownTime||chart.sensitivity.unknownTime?'出生時間未知，以下星位以當地中午作參考；請合看當日變動範圍。':chart.input.civil.date+' '+chart.input.civil.time+' · '+chart.input.location;}
  function render(kind,value){
    const c=native(value);if(!c)return false;
    const isV=kind==='vedic',prefix=isV?'d-jyotish-':'d-natal-';
    root.document.querySelectorAll('[id^="'+prefix+'"]').forEach(e=>{e.innerHTML='';});
    html(prefix+'summary','<div class="native-astro-intro"><span class="tag tag-gold">'+(isV?'印度占星':'西洋占星')+'</span><p>'+esc(statusText(c))+'</p><strong>'+esc(value.summary)+'</strong></div>');
    if(!isV){
      if(root.JYWesternChart)html(prefix+'chart',root.JYWesternChart.wheel(c));
      html(prefix+'planets',table(['行星','星座','度數','宮位'],root.JYWestern.KEYS.map(k=>{const p=c.planets[k];return [p.name,p.signName,degree(p.degree)+(p.retrograde?' R':''),p.house==null?'未定':p.house];})));
      html(prefix+'aspects',table(['星體','相位','容許度'],c.aspects.map(a=>[root.JYWestern.zh(a.a)+'／'+root.JYWestern.zh(a.b),a.name,degree(a.orb)])));
      html(prefix+'reading',c.patterns.length?c.patterns.map(x=>'<p><strong>'+esc(x.name)+'</strong> · '+esc(x.planets.map(root.JYWestern.zh).join('、'))+'</p>').join(''):'<p class="text-dim">本次未命中所檢查的主要相位圖形，仍可從宮主與相位閱讀命盤。</p>');
      if(c.sensitivity.unknownTime)html(prefix+'reading','<p>出生時間未知，不能固定本命宮位及與時間敏感星位相關的格局。</p>'+table(['行星','當日可能星座','取樣跨度'],c.sensitivity.planets.map(x=>[root.JYWestern.zh(x.key),x.signs.map(s=>root.JYWestern.SIGNS[s]).join('／'),degree(x.spanDegrees)])));
      return true;
    }
    html(prefix+'planets',table(['九曜','星座','度數','宮位'],root.JYVedic.KEYS.map(k=>{const p=c.planets[k];return [p.name,p.signName,degree(p.degree)+(p.retrograde?' R':''),p.house==null?'未定':p.house];})));
    html(prefix+'deep',c.houses.length?table(['宮位','星座','宮主','宮主落宮'],c.houses.map(h=>[h.house,h.signName,root.JYVedic.zh(h.lord),h.lordHouse])):'<p>時辰未定，暫不排列上升與十二宮。</p>');
    html(prefix+'yoga',c.yogas.map(y=>'<details class="native-astro-rule"><summary>'+esc(y.name)+'</summary><p>'+esc(y.rule||'')+'</p><p>'+esc((y.conditions||[]).map(x=>typeof x==='string'?x:[root.JYVedic.zh(x.planet),x.house?'第 '+x.house+' 宮':'',x.dignity||''].filter(Boolean).join(' · ')).join('；'))+'</p>'+(y.checks||[]).map(x=>'<p>'+esc((x.passed===true?'✓ ':x.passed===false?'— ':'· ')+x.label)+'</p>').join('')+'</details>').join('')||'<p>本次未命中所列格局，仍需從九曜與宮主關係閱讀。</p>');
    const data=payload('vedic',c,'general');
    html(prefix+'dasha',c.input.unknownTime?'<p>時間未知，暫不固定大運、副運及交運日期。</p>':table(['大運','起點 UTC','終點 UTC（不含）'],(data.dasha.nextThreeYears||[]).map(p=>[root.JYVedic.zh(p.lord),p.start,p.end])));
    html(prefix+'transit',table(['行星','觀察日星座','由上升起算','由月亮起算'],c.transits.map(x=>[root.JYVedic.zh(x.planet),x.signName,x.fromLagna==null?'未定':x.fromLagna,x.fromMoon])));
    html(prefix+'nakshatra','<p>'+esc(c.planets.Moon.nakshatra.name)+' · 第 '+c.planets.Moon.nakshatra.pada+' 足</p><p class="text-dim">'+esc(c.sensitivity.note)+'</p>');
    const divisions=nums=>nums.map(d=>'<h4>D'+d+' · '+esc(c.vargas[d].purpose)+'</h4>'+table(['九曜','分盤星座','分盤宮位'],root.JYVedic.KEYS.map(k=>{const p=c.vargas[d].planets[k];return [root.JYVedic.zh(k),p.signName,p.house==null?'未定':p.house];}))).join('');
    html(prefix+'d9',divisions([9]));html(prefix+'d10d2',divisions([10,2]));html(prefix+'d7d4',divisions([7,4]));
    html(prefix+'shadbala','<p>此盤提供尊貴、燃燒、逆行與相位條件，沒有把它們拼成完整 Shadbala 分數。</p>');
    html(prefix+'ashtaka',c.ashtakavarga?table(['星座','SAV'],c.ashtakavarga.sav.map((x,i)=>[root.JYVedic.SIGNS[i],x])):'<p>上升未定，暫不提供需依賴上升參照的八分法。</p>');
    html(prefix+'karaka',table(['角色','行星','座內度數'],c.karakas.map(k=>[k.role,root.JYVedic.zh(k.planet),degree(k.degree)])));
    html(prefix+'relations',table(['行星','定位星'],root.JYVedic.KEYS.map(k=>[root.JYVedic.zh(k),root.JYVedic.zh(c.planets[k].dispositor)])));
    html(prefix+'remedy','<p>先完成原問題的解讀，再依具體需要討論日常提醒；不依單星強弱直接指定配戴。</p>');
    return true;
  }
  function renderSummary(state){
    ['r-question','r-question-hero'].forEach(id=>html(id,'<strong>問題：</strong>'+esc(state.form.question)));
    html('r-vlabel','命盤已展開');html('r-vprob','');html('r-vnote','讓這次解讀，回應你最在意的事。');
    const bar=root.document.getElementById('r-pfill');if(bar)bar.style.width='0';
    ['r-pbreak','r-answer','r-factors','r-suggest','r-conclusion','r-expert-comment','r-verdict-sources'].forEach(id=>html(id,''));
    if(typeof root._injectAIButton==='function')root._injectAIButton();
  }
  root.JYAstroBridge=Object.freeze({version:VERSION,load,inputFor,compute,prepare,commit,clear,assertCurrent,native,payload,project,render,renderSummary,signature});
})(globalThis);
