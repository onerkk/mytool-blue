/* Jingyue Western 1.0. Tropical / apparent geocentric ecliptic of date.
 * Astronomy Engine 2.1.19 (MIT). Independently tested against Swiss Moshier.
 * Algorithms, school choices and tolerances: docs/western-engine-20260914.md.
 */
(function(root){
  'use strict';
  const DAY=86400000,RAD=Math.PI/180,YEAR=365.24219,VERSION='jy-western-1.1.0';
  const KEYS=['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto'];
  const NAMES=['太陽','月亮','水星','金星','火星','木星','土星','天王星','海王星','冥王星'];
  const SYMBOLS=['☉','☽','☿','♀','♂','♃','♄','♅','♆','♇'];
  const SIGNS=['牡羊','金牛','雙子','巨蟹','獅子','處女','天秤','天蠍','射手','摩羯','水瓶','雙魚'];
  const GLYPHS=['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];
  const LORDS=['Mars','Venus','Mercury','Moon','Sun','Mercury','Venus','Mars','Jupiter','Saturn','Saturn','Jupiter'];
  const EXALT={Sun:0,Moon:1,Mercury:5,Venus:11,Mars:9,Jupiter:3,Saturn:6};
  const HOUSE_NAMES=['自我與行動','收入與資源','學習與交流','家庭與根基','戀愛與創作','工作日常與照顧','伴侶與合作','共享資源與信任','遠行與觀點','職涯與社會角色','朋友與願景','獨處與內在整理'];
  const SYSTEMS={P:'Placidus',W:'整宮制',E:'等宮制',O:'Porphyry'};
  const ASPECTS=[{angle:0,name:'合相',symbol:'☌',orb:8},{angle:60,name:'六分相',symbol:'⚹',orb:4},{angle:90,name:'四分相',symbol:'□',orb:8},{angle:120,name:'三分相',symbol:'△',orb:8},{angle:180,name:'對分相',symbol:'☍',orb:8}];
  const MINOR=[{angle:30,name:'十二分相',symbol:'⚺',orb:2},{angle:45,name:'八分相',symbol:'∠',orb:2},{angle:135,name:'補八分相',symbol:'⚼',orb:2},{angle:150,name:'梅花相',symbol:'⚻',orb:2}];
  const norm=x=>((x%360)+360)%360,diff=(a,b)=>norm(a-b+180)-180,clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
  const zh=k=>NAMES[KEYS.indexOf(k)]||({NorthNode:'北交點',SouthNode:'南交點',ASC:'上升',MC:'天頂',DSC:'下降',IC:'天底'}[k])||k;
  const freeze=o=>{if(o&&typeof o==='object'&&!Object.isFrozen(o)){Object.values(o).forEach(freeze);Object.freeze(o);}return o;};
  function instant(x){const d=new Date(x);if(!Number.isFinite(+d))throw Error('日期時間無效');return d;}
  function checkDate(x){const d=instant(x);if(d.getUTCFullYear()<1900||d.getUTCFullYear()>2100)throw Error('目前已驗證的排盤範圍為 1900–2100 年');return d;}
  function setup(){
    const A=root.Astronomy;if(!A)throw Error('星曆尚未載入');
    if(!A._jingyueDeltaT){const rows=root.JYVedicAyanamsa?.rows;if(!rows)throw Error('時間尺度資料尚未載入');
      A.SetDeltaTFunction(ut=>{const jd=ut+2451545;let lo=0,hi=rows.length-1;if(jd<rows[lo][0]||jd>rows[hi][0])throw Error('超出時間尺度資料範圍');while(hi-lo>1){const m=(lo+hi)>>1;if(rows[m][0]>jd)hi=m;else lo=m;}const f=(jd-rows[lo][0])/(rows[hi][0]-rows[lo][0]);return rows[lo][3]+f*(rows[hi][3]-rows[lo][3]);});A._jingyueDeltaT=true;
    }return A;
  }
  function position(key,ms){const A=setup(),t=A.MakeTime(instant(ms)),v=A.Ecliptic(A.GeoVector(key,t,true));return {longitude:norm(v.elon),latitude:v.elat,distanceAU:Math.hypot(v.vec.x,v.vec.y,v.vec.z)};}
  function angles(ms,latitude,longitude){
    const A=setup(),t=A.MakeTime(instant(ms)),eps=A.e_tilt(t).tobl*RAD,theta=norm(A.SiderealTime(t)*15+longitude)*RAD;
    let asc=norm(Math.atan2(-Math.cos(theta),Math.sin(theta)*Math.cos(eps)+Math.tan(latitude*RAD)*Math.sin(eps))/RAD);
    const east=-Math.sin(theta)*Math.cos(asc*RAD)+Math.cos(theta)*Math.cos(eps)*Math.sin(asc*RAD);
    if(east<0)asc=norm(asc+180);
    const mc=norm(Math.atan2(Math.sin(theta),Math.cos(theta)*Math.cos(eps))/RAD);
    return {ASC:asc,MC:mc,DSC:norm(asc+180),IC:norm(mc+180),ramc:norm(theta/RAD),obliquity:eps/RAD};
  }
  function houses(ms,latitude,longitude,system='P'){
    if(!Object.hasOwn(SYSTEMS,system))throw Error('宮制無效');
    if(!Number.isFinite(latitude)||Math.abs(latitude)>=90||!Number.isFinite(longitude)||Math.abs(longitude)>180)throw Error('請填有效的出生地經緯度');
    const a=angles(ms,latitude,longitude),c=new Array(12),eps=a.obliquity*RAD,phi=latitude*RAD;
    if(system==='P'&&Math.abs(latitude)>=90-a.obliquity)throw Error('這個緯度的 Placidus 宮位無法完整定義，請改選整宮制或等宮制');
    if(system==='E'||system==='W'){const start=system==='W'?Math.floor(a.ASC/30)*30:a.ASC;for(let i=0;i<12;i++)c[i]=norm(start+i*30);}
    else{
      // Porphyry at polar latitudes follows the eastern-ASC quadrant convention.
      let mc=a.MC;if(norm(a.ASC-mc)>180)mc=norm(mc+180);
      c[0]=a.ASC;c[3]=norm(mc+180);c[6]=a.DSC;c[9]=mc;
      if(system==='O'){for(const q of [0,3,6,9])for(let k=1;k<3;k++)c[q+k]=norm(c[q]+norm(c[(q+3)%12]-c[q])*k/3);}
      else{
        const ra=lambda=>norm(Math.atan2(Math.sin(lambda*RAD)*Math.cos(eps),Math.cos(lambda*RAD))/RAD);
        const sda=lambda=>Math.acos(clamp(-Math.tan(phi)*Math.tan(Math.asin(Math.sin(eps)*Math.sin(lambda*RAD))),-1,1))/RAD;
        function solve(start,end,f){let low=start,high=start+norm(end-start);for(let i=0;i<60;i++){const x=(low+high)/2;if(f(x)>0)high=x;else low=x;}return norm((low+high)/2);}
        for(const [index,fraction]of [[10,1/3],[11,2/3]])c[index]=solve(a.MC,a.ASC,x=>norm(ra(x)-a.ramc)-fraction*sda(x));
        for(const [index,fraction]of [[1,2/3],[2,1/3]])c[index]=solve(a.ASC,a.IC,x=>norm(ra(x)-a.ramc)-180+fraction*(180-sda(x)));
        for(const i of [1,2,10,11])c[(i+6)%12]=norm(c[i]+180);
      }
    }
    return {system,name:SYSTEMS[system],angles:a,cusps:c,positionPolicy:'黃經投影入宮；宮頭起算，未套用提前五度入下一宮'};
  }
  function houseOf(lon,cusps){if(!cusps)return null;for(let i=0;i<12;i++)if(norm(lon-cusps[i])<norm(cusps[(i+1)%12]-cusps[i])-1e-10||Math.abs(diff(lon,cusps[i]))<1e-10)return i+1;throw Error('宮位幾何無法定位');}
  function dignity(key,sign){
    if(!Object.hasOwn(EXALT,key))return {states:[],name:'現代行星／交點',ruler:LORDS[sign]};
    const states=[];if(LORDS[sign]===key)states.push('入廟');if(EXALT[key]===sign)states.push('擢升');if(LORDS[(sign+6)%12]===key)states.push('失勢');if((EXALT[key]+6)%12===sign)states.push('落陷');
    return {states,name:states.join('・')||'無廟旺弱陷',ruler:LORDS[sign]};
  }
  function placement(key,longitude,latitude,speed,cusps){const sign=Math.floor(norm(longitude)/30);return {key,name:zh(key),symbol:SYMBOLS[KEYS.indexOf(key)]||({NorthNode:'☊',SouthNode:'☋'}[key]),longitude:norm(longitude),latitude,speed,retrograde:speed<0,nearStation:KEYS.indexOf(key)>1&&Math.abs(speed)<.01,sign,signName:SIGNS[sign],degree:norm(longitude)%30,house:houseOf(longitude,cusps),element:['火','土','風','水'][sign%4],modality:['基本','固定','變動'][sign%3],dignity:dignity(key,sign)};}
  function planets(ms,cusps){const out={};for(const key of KEYS){const p=position(key,ms),speed=diff(position(key,+instant(ms)+DAY/48).longitude,position(key,+instant(ms)-DAY/48).longitude)/(2/48);out[key]={...placement(key,p.longitude,p.latitude,speed,cusps),distanceAU:p.distanceAU};}
    const A=setup(),t=A.MakeTime(instant(ms)),T=t.tt/36525;
    const node=norm(125.0445479-1934.1362891*T+.0020754*T*T+T*T*T/467441-T*T*T*T/60616000+A.e_tilt(t).dpsi/3600);
    out.NorthNode=placement('NorthNode',node,0,-1934.1362891/36525,cusps);out.SouthNode=placement('SouthNode',node+180,0,-1934.1362891/36525,cusps);return out;
  }
  function pairAspect(a,b,definitions=ASPECTS,maxOrb=null){
    const delta=diff(b.longitude,a.longitude),sep=Math.abs(delta);let matches=[];
    for(const d of definitions){const orb=Math.abs(sep-d.angle),allowed=maxOrb??d.orb;if(orb>allowed+1e-9)continue;const target=delta<0?-d.angle:d.angle,error=diff(delta,target),velocity=(b.speed??0)-(a.speed??0),change=error*velocity;
      matches.push({a:a.key,b:b.key,angle:d.angle,name:d.name,symbol:d.symbol,separation:sep,orb,allowedOrb:allowed,phase:orb<1/60?'精確':Math.abs(velocity)<.00001?'相對速度接近零':change<0?'入相':'出相',outOfSign:Math.round(norm(b.sign-a.sign)*30)%360!==norm(target)});
    }return matches.sort((x,y)=>x.orb-y.orb)[0]||null;
  }
  function aspects(ps,hs,{minor=false}={}){const keys=Object.keys(ps),out=[],defs=minor?[...ASPECTS,...MINOR]:ASPECTS;for(let i=0;i<keys.length;i++)for(let j=i+1;j<keys.length;j++){const a=ps[keys[i]],b=ps[keys[j]];if(a.key.endsWith('Node')&&b.key.endsWith('Node'))continue;const p=pairAspect(a,b,defs,a.key.endsWith('Node')||b.key.endsWith('Node')?3:null);if(p)out.push({...p,kind:'本命行星'});}
    if(hs)for(const k of ['ASC','MC'])for(const p of Object.values(ps)){const q=pairAspect(p,{key:k,longitude:hs.angles[k],speed:0,sign:Math.floor(hs.angles[k]/30)},ASPECTS,3);if(q)out.push({...q,phase:null,kind:'角點',note:'角點相位不以零速度判斷入出相'});}
    return out.sort((a,b)=>a.orb-b.orb);
  }
  function patterns(list){const out=[],pairs=new Map(list.filter(a=>KEYS.includes(a.a)&&KEYS.includes(a.b)).map(a=>[[a.a,a.b].sort().join('/'),a]));const find=(a,b,angle)=>pairs.get([a,b].sort().join('/'))?.angle===angle;
    for(let i=0;i<10;i++)for(let j=i+1;j<10;j++)for(let k=j+1;k<10;k++){const trio=[KEYS[i],KEYS[j],KEYS[k]];if(find(trio[0],trio[1],120)&&find(trio[0],trio[2],120)&&find(trio[1],trio[2],120))out.push({name:'大三角',planets:trio});for(let apex=0;apex<3;apex++){const a=trio[apex],b=trio[(apex+1)%3],c=trio[(apex+2)%3];if(find(b,c,180)&&find(a,b,90)&&find(a,c,90))out.push({name:'T 三角',planets:trio,apex:a});if(find(b,c,60)&&find(a,b,150)&&find(a,c,150))out.push({name:'Yod',planets:trio,apex:a,source:'https://cafeastrology.com/articles/aspectpatterns.html'});}}
    for(let i=0;i<10;i++)for(let j=i+1;j<10;j++)for(let k=j+1;k<10;k++)for(let l=k+1;l<10;l++){
      const group=[KEYS[i],KEYS[j],KEYS[k],KEYS[l]],counts={60:0,90:0,120:0,180:0};
      for(let x=0;x<4;x++)for(let y=x+1;y<4;y++)for(const angle of [60,90,120,180])counts[angle]+=find(group[x],group[y],angle)?1:0;
      if(counts[90]===4&&counts[180]===2)out.push({name:'大十字',planets:group});
      if(counts[60]===3&&counts[120]===2&&counts[180]===1)out.push({name:'搖籃',planets:group,source:'https://cafeastrology.com/articles/aspectpatterns.html'});
      if(counts[60]===2&&counts[120]===2&&counts[180]===2)out.push({name:'神秘矩形',planets:group});
      for(const tip of group){const triangle=group.filter(p=>p!==tip);if(!find(triangle[0],triangle[1],120)||!find(triangle[0],triangle[2],120)||!find(triangle[1],triangle[2],120))continue;
        const tail=triangle.find(p=>find(p,tip,180));if(tail&&triangle.filter(p=>p!==tail).every(p=>find(p,tip,60)))out.push({name:'風箏',planets:group,apex:tip,tail});
      }
    }
    // The hexagon needs all 15 internal relationships, not just two triangles.
    for(let i=0;i<10;i++)for(let j=i+1;j<10;j++)for(let k=j+1;k<10;k++)for(let l=k+1;l<10;l++)for(let m=l+1;m<10;m++)for(let n=m+1;n<10;n++){
      const group=[KEYS[i],KEYS[j],KEYS[k],KEYS[l],KEYS[m],KEYS[n]],counts={60:0,120:0,180:0};
      for(let a=0;a<6;a++)for(let b=a+1;b<6;b++)for(const angle of [60,120,180])counts[angle]+=find(group[a],group[b],angle)?1:0;
      if(counts[60]===6&&counts[120]===6&&counts[180]===3)out.push({name:'大六分相',planets:group,source:'https://cafeastrology.com/articles/aspectpatterns.html'});
    }
    for(const y of out.filter(p=>p.name==='Yod'))for(const tip of KEYS.filter(k=>!y.planets.includes(k))){
      const base=y.planets.filter(k=>k!==y.apex);if(find(tip,y.apex,180)&&base.every(k=>find(tip,k,30)))out.push({name:'迴力鏢 Yod',planets:y.planets.concat(tip),apex:y.apex,response:tip,source:'https://cafeastrology.com/articles/aspectpatterns.html'});
    }
    return out.map(p=>({...p,status:'structural',source:p.source||'https://www.skyscript.co.uk/aspects2.html',edges:list.filter(a=>p.planets.includes(a.a)&&p.planets.includes(a.b)),interpretation:'依參與行星、宮位及實際容許度合看；不是事件保證'}));
  }
  function solarConditions(ps){
    return ['Mercury','Venus','Mars','Jupiter','Saturn'].map(key=>{
      const separation=Math.abs(diff(ps[key].longitude,ps.Sun.longitude));
      const state=separation<=17/60?'cazimi':separation<8.5?'combust':separation<17?'under-beams':'clear';
      return {planet:key,separationDegrees:separation,state,label:{cazimi:'日心',combust:'燃燒','under-beams':'日光下',clear:'日光外'}[state],sameSign:ps[key].sign===ps.Sun.sign,
        nearBoundary:[17/60,8.5,17].some(v=>Math.abs(separation-v)<=1/60),
        policy:'Lilly 常用角距口徑：日心 ≤17′，燃燒 <8°30′，日光下 <17°；跨星座仍依角距，另保留同座欄位。非偕日可見性。',source:'https://www.skyscript.co.uk/glossary/combust/'};
    });
  }
  function aspectExceptions(ps,list){
    const major=list.filter(a=>a.kind==='本命行星'&&KEYS.includes(a.a)&&KEYS.includes(a.b)&&ASPECTS.some(d=>d.angle===a.angle));
    return {unaspected:KEYS.filter(k=>!major.some(a=>a.a===k||a.b===k)),outOfSign:major.filter(a=>a.outOfSign),
      nearStations:KEYS.filter(k=>ps[k].nearStation),solar:solarConditions(ps),
      policy:'無主要相位只按本版五種主要相位及容許度，不等於孤立、沒有作用或沒有任何小相位；停滯採既有速度閾值。'};
  }
  function dispositors(ps){return KEYS.map(key=>{const path=[],seen=new Map();let at=key;while(!seen.has(at)){seen.set(at,path.length);path.push(at);at=LORDS[ps[at].sign];}const cycle=path.slice(seen.get(at));return {planet:key,path,cycle,kind:cycle.length===1?'終端定位星':cycle.length===2?'廟位互容':'循環定位'};});}
  function sect(ms,lat,lon){const A=setup(),t=A.MakeTime(instant(ms)),sun=A.Ecliptic(A.GeoVector('Sun',t,true)),a=angles(ms,lat,lon),eps=a.obliquity*RAD,l=sun.elon*RAD,b=sun.elat*RAD,dec=Math.asin(Math.sin(b)*Math.cos(eps)+Math.cos(b)*Math.sin(eps)*Math.sin(l)),ra=Math.atan2(Math.sin(l)*Math.cos(eps)-Math.tan(b)*Math.sin(eps),Math.cos(l)),ha=a.ramc*RAD-ra,alt=Math.asin(Math.sin(lat*RAD)*Math.sin(dec)+Math.cos(lat*RAD)*Math.cos(dec)*Math.cos(ha))/RAD;return {name:alt>=0?'日間盤':'夜間盤',solarAltitude:alt,nearHorizon:Math.abs(alt)<.25,policy:'幾何太陽中心高度，未加大氣折射'};}
  function crossAspects(moving,natal,maxOrb=2){const out=[];for(const a of Object.values(moving).filter(p=>KEYS.includes(p.key)))for(const b of Object.values(natal).filter(p=>KEYS.includes(p.key)||['ASC','MC'].includes(p.key))){const x=pairAspect({ ...b,speed:0},{...a},ASPECTS,maxOrb);if(x)out.push({...x,a:a.key,b:b.key,kind:'行運對本命'});}return out.sort((a,b)=>a.orb-b.orb);}
  function solarReturn(birth,year,latitude,longitude,system){const b=instant(birth),target=position('Sun',b).longitude;let lo=Date.UTC(year,b.getUTCMonth(),b.getUTCDate())-4*DAY,hi=lo+8*DAY;const f=t=>diff(position('Sun',t).longitude,target);if(f(lo)>0||f(hi)<0)throw Error('太陽回歸未能建立求根區間');for(let i=0;i<32;i++){const mid=(lo+hi)/2;if(f(mid)>0)hi=mid;else lo=mid;}const utc=(lo+hi)/2,hs=houses(utc,latitude,longitude,system);return {year,utc:new Date(utc).toISOString(),residualDegrees:Math.abs(f(utc)),houses:hs,planets:planets(utc,hs.cusps),locationPolicy:'出生地回歸盤；未使用現居地搬遷盤'};}
  function compute(input){
    const birth=checkDate(input.utc),reference=checkDate(input.reference||new Date());if(reference<birth)throw Error('觀察日不能早於出生日期');
    const latitude=Number(input.latitude),longitude=Number(input.longitude),system=input.houseSystem||'P',unknown=!!input.unknownTime,uncertainty=Number(input.uncertaintyMinutes||0);
    if(!Number.isFinite(latitude)||Math.abs(latitude)>=90||!Number.isFinite(longitude)||Math.abs(longitude)>180)throw Error('請核對出生座標');if(!Number.isFinite(uncertainty)||uncertainty<0||uncertainty>120)throw Error('時間誤差須為 0–120 分鐘');
    const hs=unknown?null:houses(birth,latitude,longitude,system),ps=planets(birth,hs?.cusps),asp=aspects(ps,hs,{minor:!!input.minorAspects}),sensitivity={unknownTime:unknown,minutes:unknown?null:uncertainty,planets:[],angles:[]};
    // Unknown clock: bound the actual local civil day, including 23/25-hour DST days.
    let samples=[];if(unknown){const civil=input.civil;if(!civil?.date||!civil?.timezone)throw Error('時間不詳時仍須出生日期與 IANA 時區');const [start,end]=root.JYAstroTime.civilDayBounds(civil.date,civil.timezone);sensitivity.utcInterval=[start.toISOString(),end.toISOString()];for(let t=+start;t<+end;t+=3*3600000)samples.push(t);samples.push(+end-1);}
    else if(uncertainty)samples=[+birth-uncertainty*60000,+birth+uncertainty*60000];
    if(samples.length){for(const key of KEYS){const values=samples.map(t=>position(key,t).longitude),offsets=values.map(x=>diff(x,ps[key].longitude));sensitivity.planets.push({key,minimum:norm(ps[key].longitude+Math.min(...offsets)),maximum:norm(ps[key].longitude+Math.max(...offsets)),signs:[...new Set(values.concat(ps[key].longitude).map(x=>Math.floor(x/30)))],spanDegrees:Math.max(...offsets)-Math.min(...offsets)});}if(!unknown){for(const key of ['ASC','MC'])sensitivity.angles.push({key,alternatives:samples.map(t=>angles(t,latitude,longitude)[key])});sensitivity.houseAlternatives=Object.fromEntries(KEYS.map(k=>[k,[...new Set(samples.map(t=>houseOf(position(k,t).longitude,houses(t,latitude,longitude,system).cusps)).concat(ps[k].house))]]));}}
    const natalTargets={...ps};if(hs)for(const key of ['ASC','MC'])natalTargets[key]={key,longitude:hs.angles[key],sign:Math.floor(hs.angles[key]/30),speed:0};
    const transiting=planets(reference),transits={utc:reference.toISOString(),planets:transiting,aspects:crossAspects(transiting,natalTargets),orb:2};
    const progressMs=+birth+(+reference-birth)/YEAR,progressed=unknown?null:planets(progressMs),progressions=progressed?{utc:new Date(progressMs).toISOString(),yearDays:YEAR,policy:'次限推運：出生後一日象徵一年，只推行星；未推進角點與宮位',planets:progressed,aspects:crossAspects(progressed,natalTargets,1).map(a=>({...a,kind:'次限對本命',phase:null}))}:null;
    const returns=unknown?null:solarReturn(birth,reference.getUTCFullYear(),latitude,longitude,system);
    const distribution={elements:{火:0,土:0,風:0,水:0},modalities:{基本:0,固定:0,變動:0},policy:'十顆行星各計一次，交點與角點不計入；是分布而非能力分數'};for(const k of KEYS){distribution.elements[ps[k].element]++;distribution.modalities[ps[k].modality]++;}
    return freeze({version:VERSION,input:{utc:birth.toISOString(),reference:reference.toISOString(),latitude,longitude,location:input.location||'自訂出生地',civil:input.civil||null},policy:{zodiac:'回歸黃道',origin:'地心視位置／當日真黃道與真春分點',ephemeris:'Astronomy Engine 2.1.19',precision:'設計目標約 1 角分；回歸時間約分鐘級，非秒級事件預測',node:'平均月交點',houseSystem:system,houseName:SYSTEMS[system],orbs:ASPECTS,minorOrbs:input.minorAspects?MINOR:[],patternAspects:'格局總是檢查五大相位及 150°（2°容許度）；小相位顯示開關不改格局計算',chartType:'本命盤；不是卜卦、合盤或印度分盤'},planets:ps,houses:hs,aspects:asp,patterns:patterns(aspects(ps,null,{minor:true})),specialConditions:aspectExceptions(ps,asp),dispositors:dispositors(ps),sect:unknown?null:sect(birth,latitude,longitude),chartRuler:hs?LORDS[Math.floor(hs.angles.ASC/30)]:null,distribution,sensitivity,transits,progressions,solarReturn:returns});
  }
  root.JYWestern=freeze({version:VERSION,compute,position,planets,angles,houses,houseOf,dignity,pairAspect,aspects,patterns,solarConditions,aspectExceptions,dispositors,solarReturn,crossAspects,sect,norm,diff,zh,KEYS,NAMES,SYMBOLS,SIGNS,GLYPHS,LORDS,HOUSE_NAMES,SYSTEMS,ASPECTS,MINOR});
})(globalThis);
