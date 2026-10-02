/* Numeric Shadbala from named primary rules, independently implemented.
 * Raman/Sripathi and BPHS/Santanam conventions remain distinct.
 * Classical 1900 mean motions are not advertised as a modern ephemeris. */
(function(root){
  'use strict';
  const VERSION='20261003strength2',DAY=86400000,RAD=Math.PI/180;
  const KEYS=['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn'],DIVISIONS=[1,2,3,7,9,12,30];
  const EXALT={Sun:10,Moon:33,Mars:298,Mercury:165,Jupiter:95,Venus:357,Saturn:200};
  const DECAN={Sun:0,Mars:0,Jupiter:0,Mercury:1,Saturn:1,Moon:2,Venus:2};
  const NATURAL={Sun:60,Moon:360/7,Mars:120/7,Mercury:180/7,Jupiter:240/7,Venus:300/7,Saturn:60/7};
  const SCALES={raman:[1.875,3.75,7.5,15,22.5],bphs:[2,4,10,15,20]};
  const MINIMUM={raman:[300,360,300,420,390,330,300],bphs:[390,360,300,420,390,330,300]};
  const WEEK=['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn'],HORA=['Saturn','Jupiter','Mars','Sun','Venus','Mercury','Moon'];
  const DISCS={Mars:9.4,Mercury:6.6,Jupiter:190.4,Venus:16.6,Saturn:158};
  const mod=(a,b)=>(a%b+b)%b,arc=(a,b)=>Math.abs(mod(a-b+180,360)-180),signed=(a,b)=>mod(a-b+180,360)-180;
  const sum=xs=>xs.reduce((n,v)=>n+v,0),finite=(n,label)=>{if(!Number.isFinite(n))throw Error(label+'資料無效');return n;};
  function uchcha(key,longitude){if(!(key in EXALT))throw Error('擢升力度星曜無效');return arc(finite(longitude,'黃經'),EXALT[key]+180)/3;}
  function oja(key,rasiSign,navamsaSign){const parity=['Moon','Venus'].includes(key)?1:0;return (rasiSign%2===parity?15:0)+(navamsaSign%2===parity?15:0);}
  function kendra(house){if(!Number.isInteger(house)||house<1||house>12)throw Error('宮位無效');return [60,30,15][(house-1)%3];}
  function drekkana(key,degree){if(!(key in DECAN)||!Number.isFinite(degree)||degree<0||degree>=30)throw Error('十度區段無效');return Math.floor(degree/10)===DECAN[key]?15:0;}
  function sapta(chart,key,school){
    const scale=SCALES[school];if(!scale)throw Error('未選用此七分盤力度取法');
    const rows=DIVISIONS.map(division=>{
      const sign=chart.vargas[division].planets[key].sign,owner=root.JYVedic.LORDS[sign],own=owner===key;
      const compound=own?null:chart.relationships.find(r=>r.from===key&&r.to===owner)?.compound;
      if(!own&&(!Number.isInteger(compound)||compound< -2||compound>2))throw Error('合成友敵表缺漏');
      const moola=division===1&&chart.planets[key].dignity.status==='moolatrikona';
      return {division,sign,owner,compound,condition:moola?'natal-moolatrikona':own?'own':'compound-relation',virupas:moola?45:own?30:scale[compound+2]};
    });
    return {school,rows,virupas:sum(rows.map(r=>r.virupas))};
  }
  function directions(chart){
    const A=root.Astronomy,time=A.MakeTime(new Date(chart.input.utc)),eps=A.e_tilt(time).tobl*RAD,ramc=(A.SiderealTime(time)*15+chart.input.longitude)*RAD;
    const mc=mod(Math.atan2(Math.sin(ramc)/Math.cos(eps),Math.cos(ramc))/RAD-chart.policy.ayanamsaDegrees,360),asc=chart.lagna.longitude;
    return {ASC:asc,DSC:mod(asc+180,360),MC:mc,IC:mod(mc+180,360)};
  }
  function sripathi(angles){
    const anchors=[angles.ASC,angles.IC,angles.DSC,angles.MC],centres=[];
    const extents=anchors.map((s,q)=>mod(anchors[(q+1)%4]-s,360));
    if(Math.abs(sum(extents)-360)>1e-7||extents.some(e=>e===0||e>=180))throw Error('高緯度角點次序無法構成此Sripathi宮制');
    for(let q=0;q<4;q++)for(let i=0;i<3;i++)centres.push(mod(anchors[q]+extents[q]*i/3,360));
    // Cardinal angles are centres; halfway sandhis are membership boundaries.
    return centres.map((centre,i)=>({house:i+1,centre,start:mod(centre-mod(centre-centres[mod(i-1,12)],360)/2,360),end:mod(centre+mod(centres[(i+1)%12]-centre,360)/2,360),sign:Math.floor(centre/30)}));
  }
  function locateBhava(longitude,bhavas){const b=bhavas.find(b=>mod(longitude-b.start,360)<mod(b.end-b.start,360));if(!b)throw Error('Sripathi宮界無法定位');return b.house;}
  function nathonnatha(key,apparentHours){
    const diva=arc(mod(finite(apparentHours,'真太陽時間')*15,360),0)/3;
    return key==='Mercury'?60:['Sun','Jupiter','Venus'].includes(key)?diva:60-diva;
  }
  function ayana(key,declination,school='raman',obliquity=23.45){
    finite(declination,'赤緯');const limit=school==='raman'?24:finite(obliquity,'黃赤交角');
    const d=key==='Mercury'?Math.abs(declination):['Moon','Saturn'].includes(key)?-declination:declination;
    const raw=60*(limit+d)/(2*limit);
    // Real lunar/planetary latitude can exceed the classical reference angle.
    // Retain the literal formula and an audit flag, rather than silently clip.
    return {declination,referenceObliquity:limit,virupas:raw*(key==='Sun'?2:1),beyondReference:Math.abs(declination)>limit};
  }
  function aspectValue(key,angle,school='raman'){
    const d=mod(finite(angle,'照射角'),360);let basic=0,special=0;
    if(d>=30&&d<60)basic=(d-30)/2;
    else if(d>=60&&d<90)basic=d-60+15;
    else if(d>=90&&d<120)basic=(120-d)/2+30;
    else if(d>=120&&d<150)basic=150-d;
    else if(d>=150&&d<180)basic=2*(d-150);
    else if(d>=180&&d<300)basic=(300-d)/2;
    if(school==='raman'){
      if(key==='Saturn'&&(d>=60&&d<90||d>=270&&d<300))special=45;
      if(key==='Jupiter'&&(d>=120&&d<150||d>=240&&d<270))special=30;
      if(key==='Mars'&&(d>=90&&d<120||d>=210&&d<240))special=15;
    }else if(school==='bphs'){
      let full=basic;
      if(key==='Saturn'&&d>=30&&d<60)full=2*(d-30);
      else if(key==='Saturn'&&d>=60&&d<90)full=60-(d-60)/2;
      else if(key==='Saturn'&&d>=240&&d<270)full=d-240+30;
      else if(key==='Saturn'&&d>=270&&d<300)full=2*(300-d);
      if(key==='Mars'&&(d>=90&&d<120||d>=210&&d<240))full=60-mod(d,30);
      else if(key==='Mars'&&d>=60&&d<90)full=1.5*(d-60)+15;
      if(key==='Jupiter'&&(d>=90&&d<120||d>=210&&d<240))full=mod(d,30)/2+15;
      else if(key==='Jupiter'&&(d>=120&&d<150||d>=240&&d<270))full=60-mod(d,30);
      special=full-basic;
    }else throw Error('照射力度取法無效');
    return {angle:d,basic,special,virupas:basic+special};
  }
  function nature(chart){
    const phase=mod(chart.planets.Moon.longitude-chart.planets.Sun.longitude,360);
    const drik={Sun:'malefic',Moon:phase>0&&phase<180?'benefic':'malefic',Mars:'malefic',Jupiter:'benefic',Venus:'benefic',Saturn:'malefic'};
    const contacts=KEYS.filter(k=>k!=='Mercury'&&drik[k]==='malefic'&&chart.planets[k].sign===chart.planets.Mercury.sign);
    drik.Mercury=chart.planets.Mercury.solar?.combust||contacts.length?'malefic':'benefic';
    return {phase,drik,mercuryAffliction:{combust:!!chart.planets.Mercury.solar?.combust,sameSignMalefics:contacts},policy:'Drik按Raman117–118節月盈虧；水星燃燒或與七曜凶星同座為凶，其他為吉。同座關聯是本模組具名口徑。'};
  }
  function paksha(key,phase,natures,school){
    const bright=arc(phase,0)/3;
    if(key==='Moon')return bright*(school==='raman'?2:1);
    return natures[key]==='benefic'?bright:60-bright;
  }
  function drik(chart,natures,school){
    return KEYS.map(to=>{
      const incoming=KEYS.filter(from=>from!==to).map(from=>{
        const a=aspectValue(from,chart.planets[to].longitude-chart.planets[from].longitude,school),sign=natures[from]==='benefic'?1:-1;
        const weight=school==='bphs'&&['Jupiter','Mercury'].includes(from)?1.25:.25;
        return {from,to,...a,nature:natures[from],weight,signedVirupas:sign*a.virupas*weight};
      });return {planet:to,complete:true,incoming,virupas:sum(incoming.map(a=>a.signedVirupas))};
    });
  }
  function meanPositions(utc,year,basisShift=0){
    const epoch=Date.UTC(1900,0,1)-76/360*DAY,days=(+new Date(utc)-epoch)/DAY,t=year-1900;
    finite(days,'平均運動日差');
    const solar=mod(257.4568+days*.98560265+basisShift,360);
    const mean={Sun:solar,Mercury:solar,Venus:solar,Mars:mod(270.22+days*.524019+basisShift,360),Jupiter:mod(220.04+days*.083096-3.33-.0067*t+basisShift,360),Saturn:mod(236.74+days*.033439+5+.001*t+basisShift,360)};
    const seeghra={Mars:solar,Jupiter:solar,Saturn:solar,Mercury:mod(164+days*4.09232+6.67-.00133*t+basisShift,360),Venus:mod(328.51+days*1.602146-5-.001*t+basisShift,360)};
    return {model:'Raman/Kedarnath-Dutt1900-linear',epochUTC:new Date(epoch).toISOString(),days,yearOffset:t,basisShift,mean,seeghra,policy:'Raman88–103節及IV–IX表平均運動，以高位表重建日率；金星按正文103節0.001年修正。全體轉到本盤歲差口徑。'};
  }
  function motional(key,actual,mean,seeghra){
    const centre=mod(mean+signed(actual,mean)/2,360),kendra=arc(seeghra,centre);
    return {meanLongitude:mean,trueLongitude:actual,seeghrochcha:seeghra,midpoint:centre,reducedKendra:kendra,virupas:kendra/3};
  }
  function ishtaKashta(uchchaBala,cheshtaBala){
    finite(uchchaBala,'擢升力度');finite(cheshtaBala,'動力');
    if(uchchaBala<0||uchchaBala>60||cheshtaBala<0||cheshtaBala>60)throw Error('Ishta/Kashta所用力度須為0至60');
    return {uchcha:uchchaBala,cheshta:cheshtaBala,ishta:Math.sqrt(uchchaBala*cheshtaBala),kashta:Math.sqrt((60-uchchaBala)*(60-cheshtaBala)),method:'Raman138–139平方根法，與BPHS另一射線法分開'};
  }
  function dayContext(chart){
    const A=root.Astronomy,birth=new Date(chart.input.utc),observer=new A.Observer(chart.input.latitude,chart.input.longitude,0),start=new Date(+birth-2*DAY),rises=[],sets=[];
    for(const [direction,events]of [[1,rises],[-1,sets]]){
      let cursor=start;
      for(let i=0;i<6;i++){
        const event=A.SearchRiseSet(A.Body.Sun,observer,direction,cursor,5);if(!event||+event.date>+birth+2*DAY)break;
        events.push(+event.date);cursor=new Date(+event.date+1000);
      }
    }
    const previousRise=rises.filter(x=>x<=+birth).at(-1),nextRise=rises.find(x=>x>+birth),previousSet=sets.filter(x=>x<=+birth).at(-1),nextSet=sets.find(x=>x>+birth);
    const eps=A.e_tilt(A.MakeTime(birth)).tobl*RAD,p=chart.planets.Sun,lon=p.tropical*RAD,lat=p.latitude*RAD;
    const solarRA=mod(Math.atan2(Math.sin(lon)*Math.cos(eps)-Math.tan(lat)*Math.sin(eps),Math.cos(lon))/RAD,360)/15;
    const apparentHours=mod(A.SiderealTime(birth)+chart.input.longitude/15-solarRA+12,24);
    const local=new Date(+birth+chart.input.longitude/360*DAY),riseLocal=previousRise==null?null:new Date(previousRise+chart.input.longitude/360*DAY),traditionalDate=riseLocal||local;
    const ahargana=714404108573+Math.floor((Date.UTC(traditionalDate.getUTCFullYear(),traditionalDate.getUTCMonth(),traditionalDate.getUTCDate())-Date.UTC(1860,0,1))/DAY);
    const dayLord=riseLocal?WEEK[riseLocal.getUTCDay()]:null,yearLord=WEEK[mod(3*Math.floor(ahargana/360),7)],monthLord=WEEK[mod(2*Math.floor(ahargana/30),7)];
    let segment=null,horaLord=null,horaIndex=null;
    if(previousRise!=null&&nextRise!=null&&nextRise-previousRise<2*DAY){
      if(previousSet==null||previousRise>previousSet){if(nextSet!=null&&nextSet<nextRise)segment={daytime:true,start:previousRise,end:nextSet};}
      else if(previousSet>previousRise)segment={daytime:false,start:previousSet,end:nextRise};
      horaIndex=Math.min(23,Math.floor((+birth-previousRise)/(nextRise-previousRise)*24));horaLord=HORA[mod(HORA.indexOf(dayLord)+horaIndex,7)];
    }
    if(segment){segment.third=Math.min(2,Math.floor((+birth-segment.start)/(segment.end-segment.start)*3));segment.lord=(segment.daytime?['Mercury','Sun','Saturn']:['Moon','Venus','Mars'])[segment.third];}
    const iso=ms=>ms==null?null:new Date(ms).toISOString();
    return {apparentHours,localMeanDate:local.toISOString().slice(0,10),localMeanYear:local.getUTCFullYear(),traditionalDate:traditionalDate.toISOString().slice(0,10),ahargana,yearLord,monthLord,dayLord,horaLord,horaIndex,previousRise:iso(previousRise),nextRise:iso(nextRise),previousSet:iso(previousSet),nextSet:iso(nextSet),segment:segment?{...segment,start:iso(segment.start),end:iso(segment.end)}:null,polarUnavailable:!segment||horaLord==null,policy:'日夜三分依天文日出日落；24 Hora以前後日出等分。星期及360/30日年/月從當地前一次日出日期起算。海平面標準折射，極晝極夜缺區間不造數。'};
  }
  function warAdjustments(chart,rows,school){
    const result=Object.fromEntries(KEYS.map(k=>[k,0])),wars=[],unknown=[],stars=['Mars','Mercury','Jupiter','Venus','Saturn'];
    for(let i=0;i<stars.length;i++)for(let j=i+1;j<stars.length;j++){
      const a=stars[i],b=stars[j],pa=chart.planets[a],pb=chart.planets[b],separation=arc(pa.longitude,pb.longitude);
      if(separation>=1)continue;
      if(Math.abs(signed(pa.longitude,pb.longitude))<1e-10){unknown.push({planets:[a,b],reason:'同黃經不能依较低黃經法定勝'});continue;}
      const winner=pa.longitude<pb.longitude?a:b,loser=winner===a?b:a;
      const subtotal=k=>{const r=rows.find(x=>x.planet===k);return r.sthana.virupas+r.dig.virupas+(school==='raman'?sum(Object.entries(r.kala.components).filter(([n])=>!['ayana','yuddha'].includes(n)).map(([,v])=>v)):r.kala.virupas+r.cheshta.virupas+r.naisargika.virupas+r.drik.virupas);};
      const beforeA=subtotal(a),beforeB=subtotal(b),difference=Math.abs(beforeA-beforeB),divisor=school==='raman'?Math.abs(DISCS[a]-DISCS[b]):1,delta=difference/divisor;
      result[winner]+=delta;result[loser]-=delta;
      wars.push({planets:[a,b],separation,winner,loser,subtotals:{[a]:beforeA,[b]:beforeB},difference,discDifference:school==='raman'?divisor:null,virupas:delta});
    }
    return {adjustments:result,wars,unknown,complete:unknown.length===0,policy:school==='raman'?'Raman76–77：距離<1°、低標準化黃經勝，位置＋方向＋時間至Hora的差／固定盤面直徑差。各對用戰前值。':'BPHS27.20：同勝負口徑，戰前六力總差加勝減敗；不除盤面直徑差。'};
  }
  function compute(chart,options={}){
    const school=options.school||'raman';if(!SCALES[school])throw Error('六力取法無效');
    if(chart.input.unknownTime)return {schema:'jy.vedic-strength/2',version:VERSION,status:'unknown-time',school,complete:false,totalVirupas:null,planets:[],missing:['出生時刻未確認，不能以中午值確定六力']};
    const A=root.Astronomy,angles=directions(chart);let bhavas;
    try{bhavas=sripathi(angles);}catch(e){return {schema:'jy.vedic-strength/2',version:VERSION,status:'undefined-house-geometry',school,complete:false,totalVirupas:null,angles,planets:[],missing:[e.message]};}
    const clock=dayContext(chart),natures=nature(chart),time=A.MakeTime(new Date(chart.input.utc)),obliquity=A.e_tilt(time).tobl;
    const basisShift=root.JYVedic.meanAyanamsa(chart.julianDay,'raman')-chart.policy.meanAyanamsa;
    const mean=meanPositions(chart.input.utc,clock.localMeanYear,basisShift),aspects=drik(chart,natures.drik,school),weak={Sun:'IC',Mars:'IC',Mercury:'DSC',Jupiter:'DSC',Moon:'MC',Venus:'MC',Saturn:'ASC'};
    const planets=KEYS.map((key,i)=>{
      const p=chart.planets[key],seven=sapta(chart,key,school),bhava=locateBhava(p.longitude,bhavas),parts={uchcha:uchcha(key,p.longitude),saptavargaja:seven.virupas,ojayugma:oja(key,p.sign,chart.vargas[9].planets[key].sign),kendradi:kendra(bhava),drekkana:drekkana(key,p.degree)};
      const dec=Math.asin(Math.sin(p.latitude*RAD)*Math.cos(obliquity*RAD)+Math.cos(p.latitude*RAD)*Math.sin(obliquity*RAD)*Math.sin(p.tropical*RAD))/RAD;
      const aya=ayana(key,dec,school,obliquity),pak=paksha(key,natures.phase,natures.drik,school);
      const components={nathonnatha:nathonnatha(key,clock.apparentHours),paksha:pak,tribhaga:key==='Jupiter'||clock.segment?.lord===key?60:clock.segment?0:null,abda:clock.yearLord===key?15:0,masa:clock.monthLord===key?30:0,vara:clock.dayLord==null?null:clock.dayLord===key?45:0,hora:clock.horaLord==null?null:clock.horaLord===key?60:0,ayana:aya.virupas,yuddha:0};
      let cheshta;
      if(['Sun','Moon'].includes(key))cheshta={included:school==='bphs',method:school==='raman'?'Raman79–107六力動力只計五曜，日月不適用為0；另算Ishta所用值':'BPHS27.18：日Ayana、月Paksha',virupas:school==='raman'?0:key==='Sun'?aya.virupas:pak};
      else cheshta={included:true,...motional(key,p.longitude,mean.mean[key],mean.seeghra[key]),method:mean.model};
      const ikCheshta=key==='Sun'?arc(p.tropical+90,0)/3:key==='Moon'?arc(natures.phase,0)/3:cheshta.virupas;
      const kalaComplete=Object.values(components).every(Number.isFinite);
      return {planet:key,sthana:{complete:true,components:parts,saptavargajaDetails:seven,bhava,virupas:sum(Object.values(parts))},dig:{complete:true,weakDirection:weak[key],weakLongitude:angles[weak[key]],virupas:arc(p.longitude,angles[weak[key]])/3},naisargika:{complete:true,virupas:NATURAL[key]},kala:{complete:kalaComplete,components,ayanaDetails:aya,virupas:kalaComplete?sum(Object.values(components)):null},cheshta:{complete:true,...cheshta},drik:aspects.find(x=>x.planet===key),totalVirupas:null,totalRupas:null,minimumVirupas:MINIMUM[school][i],relativeStrength:null,meetsMinimum:null,ishtaKashta:ishtaKashta(parts.uchcha,ikCheshta)};
    });
    const war=clock.polarUnavailable?{complete:false,wars:[],unknown:['缺日出／日落，無完整戰前時間力'],adjustments:{}}:warAdjustments(chart,planets,school);
    planets.forEach(p=>{
      p.kala.components.yuddha=war.complete?war.adjustments[p.planet]:null;p.kala.complete=p.kala.complete&&war.complete;p.kala.virupas=p.kala.complete?sum(Object.values(p.kala.components)):null;
      if(p.kala.complete){p.totalVirupas=sum(['sthana','dig','kala','cheshta','naisargika','drik'].map(k=>p[k].virupas));p.totalRupas=p.totalVirupas/60;p.relativeStrength=p.totalVirupas/p.minimumVirupas;p.meetsMinimum=p.totalVirupas>=p.minimumVirupas;}
    });
    const complete=planets.every(p=>Number.isFinite(p.totalVirupas)),ranking=complete?planets.slice().sort((a,b)=>b.relativeStrength-a.relativeStrength).map((p,i)=>({rank:i+1,planet:p.planet,relativeStrength:p.relativeStrength,totalVirupas:p.totalVirupas})):[];
    return {schema:'jy.vedic-strength/2',version:VERSION,status:complete?'calculated':'insufficient-data',complete,school,unit:'Virupa; 60 Virupa = 1 Rupa',angles,bhavas,clock,nature:natures,meanMotion:mean,war,planets,ranking,totalVirupas:complete?Object.fromEntries(planets.map(p=>[p.planet,p.totalVirupas])):null,completedComponents:['sthana','dig','kala','cheshta','naisargika','drik'].filter(k=>planets.every(p=>p[k].complete)),partialComponents:['sthana','dig','kala','cheshta','naisargika','drik'].filter(k=>planets.some(p=>!p[k].complete)),missing:complete?[]:clock.polarUnavailable?['極晝極夜無本日日出／日落區間，此法時間力與總分無定義']:['同黃經行星戰勝負待取法'],
      policy:{profile:school==='raman'?'Raman/Sripathi six strengths':'BPHS/Santanam translation six strengths with Raman mean-motion model',saptavargaja:'D1/2/3/7/9/12/30，本命合成友敵；本質強位只按D1度數',kendradi:'力度使用Sripathi宮中心與宮界；本命解盤維持整宮盤',dig:'真ASC/DSC/MC/IC恒星黃道',paksha:school==='raman'?'月亮最短相距/3加倍，其他依具名吉凶性取亮月值或補數':'月亮最短相距/3不加倍，其他依具名吉凶性取亮月值或補數',drik:school==='raman'?'普通分段照＋火15／木30／土45特殊照；有方向與吉凶符號，總和/4':'Santanam英譯BPHS26特殊照分段覆寫；有符號/4，水木再加完整照；木星數值與梵文異本不同，未混表',sunMoonCheshta:school==='raman'?'總分日月不另加動力，Ishta/Kashta另計':'日Ayana、月Paksha納入動力',ishtaKashta:'Raman平方根法單獨具名；強度與吉凶傾向分開',scope:'所選六力全部分量及子項；不足輸入不造總分。其他運期與門派仍按實際範圍'},
      sourceAudit:[{issue:'BPHS梵文26.12木星與Santanam英譯第27章特殊區段不一致',selected:'bphs政策採明示Santanam英譯；梵文公式不混入，另列原文來源https://enjoylearningsanskrit.com/scriptures/parashara/chapter-26/'},{issue:'金星年修正正文0.001／表IX0.0001',selected:'正文103節0.001'},{issue:'例題木星均值66.91與高位表連續重建66.84附近不同',selected:'採明列日率不湊例題；動力例題另按印出的給定均值驗算'},{issue:'BPHS英譯年公式60／360不一',selected:'依360日傳統年及Raman60節，非60日一年'},{issue:'Drekkana本篇15／摘要60不一',selected:'Raman36–39節及例題的15Virupa'},{issue:'月吉凶的盈虧與第8日界說不同',selected:'月相力採最短日月弧，Drik依117–118節盈虧'},{issue:'赤緯可超24度或黃赤交角',selected:'保留字面式與beyondReference，不隱藏截斷'}],
      sources:[{title:'B. V. Raman: Graha and Bhava Balas',url:'https://www.scribd.com/document/340918236/Bhava-and-Graha-Balas-B-v-RAMAN-pdf',scope:'III–VIII全部六力分量及138–139；取法與印誤另列'},{title:'BPHS ch.26–28',url:'https://vedic-astro.s3.amazonaws.com/books/bhrihat_parasara_hora_shastra.pdf',scope:'照射與六力；所選英譯口徑、差異明列'},{title:'Don Cross Astronomy Engine',url:'https://github.com/cosinekitty/astronomy',scope:'日出日落、真角點與星曆'}]};
  }
  root.JYVedicStrength=Object.freeze({version:VERSION,compute,uchcha,oja,kendra,drekkana,sapta,arc,directions,sripathi,locateBhava,nathonnatha,ayana,aspectValue,paksha,meanPositions,motional,ishtaKashta,dayContext,warAdjustments});
})(typeof window==='undefined'?globalThis:window);
