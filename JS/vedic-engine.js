/* Jingyue Jyotisha 1.0 — readable, deterministic calculation core.
 * Astronomy: Astronomy Engine 2.1.19 (MIT), geocentric true ecliptic of date.
 * Methods and variants: docs/vedic-engine-20260913.md. Dates are UTC instants;
 * never apply Chinese true-solar clock correction to an astronomical instant.
 */
(function(root){
  'use strict';
  const VERSION='jy-vedic-1.2.0', DAY=86400000, RAD=Math.PI/180;
  const KEYS=['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn','Rahu','Ketu'];
  const NAMES=['太陽','月亮','火星','水星','木星','金星','土星','羅睺','計都'];
  const SYMBOLS=['☉','☽','♂','☿','♃','♀','♄','☊','☋'];
  const SIGNS=['牡羊','金牛','雙子','巨蟹','獅子','處女','天秤','天蠍','射手','摩羯','水瓶','雙魚'];
  const LORDS=['Mars','Venus','Mercury','Moon','Sun','Mercury','Venus','Mars','Jupiter','Saturn','Saturn','Jupiter'];
  const NAKS=['Ashwini','Bharani','Krittika','Rohini','Mrigashira','Ardra','Punarvasu','Pushya','Ashlesha','Magha','Purva Phalguni','Uttara Phalguni','Hasta','Chitra','Swati','Vishakha','Anuradha','Jyeshtha','Mula','Purva Ashadha','Uttara Ashadha','Shravana','Dhanishtha','Shatabhisha','Purva Bhadrapada','Uttara Bhadrapada','Revati'];
  const ORDER=['Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury'];
  const YEARS={Ketu:7,Venus:20,Sun:6,Moon:10,Mars:7,Rahu:18,Jupiter:16,Saturn:19,Mercury:17};
  const VARGAS={1:'本命與整體',2:'財富與資源',3:'手足與協作',4:'居所與不動產',7:'子女與養育',9:'關係與成熟',10:'工作與成就',12:'父母與傳承',16:'舒適與生活品質',20:'精神實踐',24:'學習與教育',27:'長處與承受力',30:'困難與修復',40:'細部參照',45:'細部參照',60:'高度時間敏感參照'};
  const FRIENDS={Sun:['Moon','Mars','Jupiter'],Moon:['Sun','Mercury'],Mars:['Sun','Moon','Jupiter'],Mercury:['Sun','Venus'],Jupiter:['Sun','Moon','Mars'],Venus:['Mercury','Saturn'],Saturn:['Mercury','Venus']};
  const ENEMIES={Sun:['Venus','Saturn'],Moon:[],Mars:['Mercury'],Mercury:['Moon'],Jupiter:['Mercury','Venus'],Venus:['Sun','Moon'],Saturn:['Sun','Moon','Mars']};
  const EXALT={Sun:[0,10],Moon:[1,3],Mars:[9,28],Mercury:[5,15],Jupiter:[3,5],Venus:[11,27],Saturn:[6,20]};
  const MOOLA={Sun:[4,0,20],Moon:[1,3,30],Mars:[0,0,12],Mercury:[5,15,20],Jupiter:[8,0,10],Venus:[6,0,15],Saturn:[10,0,20]};
  // Rows = relative houses 1..12; columns = Sun Moon Mars Mercury Jupiter Venus Saturn Lagna.
  // PVR, Tables 19–25. The seven row totals must be 48,49,39,54,56,52,39.
  const AV={
    Sun:['10100010','10100010','01010001','10100011','00011000','01011101','10100110','10100010','10111010','11110011','11111011','00010101'],
    Moon:['01011000','00101000','11110111','00011100','00110110','11100011','11011100','10011000','01000100','11111101','11111111','00000000'],
    Mars:['00100011','00100000','11010001','00100010','10010000','11011101','00100010','00100110','00000010','10101011','11111111','00001100'],
    Mercury:['00110111','01100111','00010100','01100111','10010100','11011001','00100010','01101111','10110110','01110011','11111111','10011000'],
    Jupiter:['10111001','11111101','10001010','10111001','01010111','00010111','11101001','10101000','11010101','10111101','11111101','00000010'],
    Venus:['01000101','01000101','01110111','01100111','01011111','00110000','00000000','11001111','01111111','00001110','11111111','11100000'],
    Saturn:['10000001','10000000','01100011','10000001','00101010','01111111','10000000','10010000','00010000','10110001','11111111','00111100']
  };
  function norm(x){return ((x%360)+360)%360;}
  function diff(a,b){return norm(a-b+180)-180;}
  function mod(x,n){return ((x%n)+n)%n;}
  function finite(x,name){if(typeof x!=='number'||!Number.isFinite(x))throw Error(name+'必須是有效數字');return x;}
  function instant(v){if(v==null)throw Error('缺少日期時刻');if(typeof v==='string'&&!/(?:Z|[+-]\d{2}:\d{2})$/.test(v))throw Error('日期時刻須明示 UTC 或時差');const d=v instanceof Date?v:new Date(v);if(!Number.isFinite(d.getTime()))throw Error('日期無效');return d;}
  function freeze(v){if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;}
  function zh(k){return NAMES[KEYS.indexOf(k)]||k;}
  function partFloor(x){const n=Math.round(x);return Math.abs(x-n)<1e-11?n:Math.floor(x);}
  function placement(lon){lon=norm(finite(lon,'黃經'));let sign=Math.floor(lon/30);return {longitude:lon,sign,signName:SIGNS[sign],degree:lon-sign*30};}
  function nakshatra(lon){finite(lon,'月宿黃經');const x=norm(lon)*27/360,idx=partFloor(x)%27;return {index:idx,name:NAKS[idx],pada:mod(partFloor(norm(lon)*108/360),4)+1,lord:ORDER[idx%9],fraction:Math.max(0,Math.min(1,x-idx))};}
  function varga(lon,d){
    if(!VARGAS[d])throw Error('尚未定義的分盤');
    const p=placement(lon),s=p.sign,odd=s%2===0,k=Math.min(d-1,partFloor(p.degree*d/30));let sign=s;
    switch(+d){
      case 1:break;
      case 2:sign=(odd?(k===0):(k===1))?4:3;break;
      case 3:sign=s+4*k;break;case 4:sign=s+3*k;break;
      case 7:sign=s+(odd?0:6)+k;break;
      case 9:sign=[0,9,6,3][s%4]+k;break;
      case 10:sign=s+(odd?0:8)+k;break;
      case 12:case 60:sign=s+k;break;
      case 16:case 45:sign=[0,4,8][s%3]+k;break;
      case 20:sign=[0,8,4][s%3]+k;break;
      case 24:sign=(odd?4:3)+k;break;
      case 27:sign=[0,3,6,9][s%4]+k;break;
      case 30:{const ends=odd?[5,10,18,25,30]:[5,12,20,25,30];const signs=odd?[0,10,8,2,6]:[1,5,11,9,7];sign=signs[ends.findIndex(end=>p.degree<end)];break;}
      case 40:sign=(odd?0:6)+k;break;
    }
    sign=mod(sign,12);return {division:+d,sign,signName:SIGNS[sign],part:d===30?null:k+1};
  }
  function dignity(key,lon){
    const p=placement(lon),m=MOOLA[key],e=EXALT[key];
    if(!e)return {status:'node',label:'交點：依定位星判讀'};
    const exaltedSign=p.sign===e[0],debilitated=p.sign===(e[0]+6)%12;
    let status=m&&p.sign===m[0]&&p.degree>=m[1]&&p.degree<m[2]?'moolatrikona':
      (key==='Mercury'&&p.sign===5&&p.degree>=20)?'own':exaltedSign?'exalted':debilitated?'debilitated':
      LORDS[p.sign]===key?'own':FRIENDS[key].includes(LORDS[p.sign])?'friend':ENEMIES[key].includes(LORDS[p.sign])?'enemy':'neutral';
    return {status,label:{moolatrikona:'本質強位',exalted:'擢升區',debilitated:'落陷區',own:'本垣',friend:'友星座',enemy:'敵星座',neutral:'中性星座'}[status],
      exaltedSign,debilitated,exaltationDistance:Math.abs(diff(lon,e[0]*30+e[1]))};
  }
  function referenceValue(jd,c){
    const rows=root.JYVedicAyanamsa&&root.JYVedicAyanamsa.rows;if(!rows)throw Error('歲差資料尚未載入');
    if(jd<rows[0][0]||jd>rows[rows.length-1][0])throw Error('超出歲差資料年份');
    let lo=0,hi=rows.length-1;while(hi-lo>1){let mid=(lo+hi)>>1;if(rows[mid][0]>jd)hi=mid;else lo=mid;}
    const t=(jd-rows[lo][0])/(rows[hi][0]-rows[lo][0]);return rows[lo][c]+t*(rows[hi][c]-rows[lo][c]);
  }
  function meanAyanamsa(jd,mode){
    if(!['lahiri','raman'].includes(mode))throw Error('未知歲差模式');
    return referenceValue(jd,mode==='raman'?2:1);
  }
  function astronomy(date,latitude,longitude,mode){
    const A=root.Astronomy;if(!A)throw Error('星曆尚未載入，請重試');
    if(!A._jingyueDeltaT){A.SetDeltaTFunction(ut=>{try{return referenceValue(ut+2451545,3);}catch(_){return A.DeltaT_EspenakMeeus(ut);}});A._jingyueDeltaT=true;}
    const time=A.MakeTime(instant(date)),jd=time.ut+2451545,tilt=A.e_tilt(time),mean=meanAyanamsa(jd,mode||'lahiri'),aya=mean+tilt.dpsi/3600;
    let planets={};
    KEYS.slice(0,7).forEach(key=>{const e=A.Ecliptic(A.GeoVector(key,time,true));planets[key]={tropical:e.elon,latitude:e.elat,sidereal:norm(e.elon-aya)};});
    const T=time.tt/36525;
    // Meeus mean ascending lunar node, mean ecliptic of date. Add nutation only
    // when expressing in the true tropical frame; it cancels in sidereal longitude.
    const node=norm(125.0445479-1934.1362891*T+0.0020754*T*T+T*T*T/467441-T*T*T*T/60616000);
    planets.Rahu={tropical:norm(node+tilt.dpsi/3600),latitude:0,sidereal:norm(node-mean)};
    planets.Ketu={tropical:norm(planets.Rahu.tropical+180),latitude:0,sidereal:norm(planets.Rahu.sidereal+180)};
    const ramc=norm(A.SiderealTime(time)*15+longitude)*RAD,eps=tilt.tobl*RAD,lat=latitude*RAD;
    let tropicalAsc=Math.atan2(-Math.cos(ramc),Math.sin(ramc)*Math.cos(eps)+Math.tan(lat)*Math.sin(eps))/RAD;
    // Choose the eastern intersection, including polar-circle latitudes.
    const east=-Math.sin(ramc)*Math.cos(tropicalAsc*RAD)+Math.cos(ramc)*Math.cos(eps)*Math.sin(tropicalAsc*RAD);
    if(east<0)tropicalAsc+=180;
    const asc=norm(tropicalAsc-aya);
    return {jd,ayanamsa:aya,meanAyanamsa:mean,nutation:tilt.dpsi/3600,ascendant:asc,planets};
  }
  function children(period){
    const base=ORDER.indexOf(period.lord),duration=period.end-period.start;let cursor=period.start;
    return Array.from({length:9},(_,i)=>{const lord=ORDER[(base+i)%9],end=i===8?period.end:Math.round(cursor+duration*YEARS[lord]/120);
      const out={lord,name:zh(lord),start:cursor,end};cursor=end;return out;});
  }
  function dasha(moon,birth,reference,yearDays=365.2425){
    if(![365.2425,365.25,360].includes(yearDays))throw Error('未支援的運期年長');
    const b=instant(birth).getTime(),r=instant(reference).getTime(),n=nakshatra(moon),startIndex=ORDER.indexOf(n.lord),unit=yearDays*DAY;
    let cursor=Math.round(b-n.fraction*YEARS[n.lord]*unit),periods=[];
    // Two complete cycles ensure that the first cycle's pre-birth part does not
    // silently shorten coverage for a person older than ~100 years.
    for(let i=0;i<18;i++){const lord=ORDER[(startIndex+i)%9],end=Math.round(cursor+YEARS[lord]*unit);
      const p={lord,name:zh(lord),start:cursor,end,years:YEARS[lord],visibleStart:Math.max(b,cursor),remainingYearsAtBirth:i===0?(end-b)/unit:null};
      p.children=children(p);periods.push(p);cursor=end;}
    const contains=p=>r>=p.start&&r<p.end;
    const md=r>=b?periods.find(contains):null,ad=md&&md.children.find(contains),pds=ad?children(ad):[],pd=pds.find(contains)||null;
    return {system:'Moon-nakshatra Vimshottari',yearDays,birth:b,reference:r,firstLord:n.lord,balanceYears:(periods[0].end-b)/unit,periods,current:md?{maha:md,antar:ad,pratyantar:pd,pratyantars:pds}:null};
  }
  function civilToUTC(input){
    const {date,time,timezone}=input;
    if(!/^\d{4}-\d{2}-\d{2}$/.test(date||'')||!/^\d{2}:\d{2}(:\d{2})?$/.test(time||''))throw Error('請填完整出生日期與時間');
    const parts=(date+'T'+time).match(/\d+/g).map(Number),[y,m,d,h,min,sec=0]=parts;
    const wall=Date.UTC(y,m-1,d,h,min,sec),check=new Date(wall);
    if(check.getUTCFullYear()!==y||check.getUTCMonth()!==m-1||check.getUTCDate()!==d||h>23||min>59||sec>59)throw Error('出生日期或時間不存在');
    if(input.offsetMinutes!=null){const offset=finite(Number(input.offsetMinutes),'UTC 時差');if(Math.abs(offset)>14*60)throw Error('UTC 時差超出範圍');return {date:new Date(wall-offset*60000),offsetMinutes:offset,policy:'explicit-offset'};}
    if(typeof timezone!=='string'||!timezone.trim())throw Error('請選有效的 IANA 時區，例如 Asia/Taipei');
    let fmt;try{fmt=new Intl.DateTimeFormat('en-GB',{timeZone:timezone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'});}catch(_){throw Error('請選有效的 IANA 時區，例如 Asia/Taipei');}
    function localMs(ms){let q={};fmt.formatToParts(new Date(ms)).forEach(p=>{q[p.type]=p.value;});return Date.UTC(+q.year,+q.month-1,+q.day,+q.hour,+q.minute,+q.second);}
    const offsets=new Set();for(let h=-48;h<=48;h+=6){const t=wall+h*3600000;offsets.add(localMs(t)-t);}
    const candidates=[...offsets].map(offset=>wall-offset).filter(t=>localMs(t)===wall).sort((a,b)=>a-b);
    if(!candidates.length)throw Error('這個當地時間位於夏令時間跳時，實際不存在，請核對出生紀錄');
    if(candidates.length>1&&!['earlier','later'].includes(input.disambiguation))throw Error('這個時間因夏令時間結束而出現兩次，請在進階設定選第一次或第二次');
    const value=input.disambiguation==='later'?candidates[candidates.length-1]:candidates[0];
    return {date:new Date(value),offsetMinutes:(wall-value)/60000,policy:'IANA',timezone,ambiguous:candidates.length>1};
  }
  function aspects(planets,lagna){
    const graha=[],rasi=[],conjunctions=[];
    KEYS.slice(0,7).forEach(key=>{const steps=key==='Mars'?[4,7,8]:key==='Jupiter'?[5,7,9]:key==='Saturn'?[3,7,10]:[7];
      steps.forEach(step=>{const sign=mod(planets[key].sign+step-1,12);graha.push({from:key,step,toSign:sign,toHouse:lagna==null?null:mod(sign-lagna,12)+1,toPlanets:KEYS.filter(k=>planets[k].sign===sign)});});});
    KEYS.forEach((key,i)=>{const s=planets[key].sign;let signs=[];
      for(let j=0;j<12;j++)if(s%3===2?j%3===2&&j!==s:s%3===0?j%3===1&&j!==mod(s+1,12):j%3===0&&j!==mod(s-1,12))signs.push(j);
      rasi.push({from:key,toSigns:signs,toPlanets:KEYS.filter(k=>signs.includes(planets[k].sign))});
      KEYS.slice(i+1).forEach(k=>{if(s===planets[k].sign)conjunctions.push({planets:[key,k],sign:s,separation:Math.abs(diff(planets[key].longitude,planets[k].longitude))});});
    });return {graha,rasi,conjunctions,nodeGrahaPolicy:'交點不另安特殊行星相位；星座相位另列'};
  }
  function ashtakavarga(planets,lagna){
    if(lagna==null)return null;const refs=KEYS.slice(0,7).map(k=>planets[k].sign).concat(lagna),bav={},prastara={};
    Object.keys(AV).forEach(k=>{bav[k]=Array(12).fill(0);prastara[k]=Array.from({length:8},()=>Array(12).fill(0));
      AV[k].forEach((bits,h)=>{[...bits].forEach((bit,c)=>{if(bit==='1'){const sign=mod(refs[c]+h,12);bav[k][sign]++;prastara[k][c][sign]=1;}});});});
    const sav=Array.from({length:12},(_,s)=>Object.values(bav).reduce((sum,row)=>sum+row[s],0));
    return {bav,sav,prastara,total:sav.reduce((a,b)=>a+b,0),policy:'未作 Trikona / Ekadhipatya 消減；SAV 只合七曜 BAV'};
  }
  function relationships(planets){
    let out=[];KEYS.slice(0,7).forEach(a=>KEYS.slice(0,7).filter(b=>b!==a).forEach(b=>{
      const permanent=FRIENDS[a].includes(b)?1:ENEMIES[a].includes(b)?-1:0,house=mod(planets[b].sign-planets[a].sign,12)+1,temporary=[2,3,4,10,11,12].includes(house)?1:-1;
      out.push({from:a,to:b,permanent,temporary,compound:permanent+temporary,label:['強敵','敵','中性','友','強友'][permanent+temporary+2]});}));return out;
  }
  function solarCondition(key,longitude,sunLongitude,retrograde=false){
    const separation=Math.abs(diff(finite(longitude,'黃經'),finite(sunLongitude,'太陽黃經')));
    const limit={Moon:12,Mars:17,Mercury:retrograde?12:14,Jupiter:11,Venus:retrograde?8:10,Saturn:15}[key];
    return {separationDegrees:separation,thresholdDegrees:limit??null,combust:limit==null?null:separation<limit,
      nearBoundary:limit!=null&&Math.abs(separation-limit)<=1/60,
      method:'Surya Siddhanta angular convention (Drik Panchang documentation); longitude separation, not local heliacal visibility'};
  }
  function naturalNatures(planets){
    const phase=norm(planets.Moon.longitude-planets.Sun.longitude),out={Sun:'malefic',Moon:phase>0&&phase<180?'benefic':'malefic',Mars:'malefic',Jupiter:'benefic',Venus:'benefic',Saturn:'malefic',Rahu:'malefic',Ketu:'malefic'};
    const companions=KEYS.filter(k=>k!=='Mercury'&&planets[k].sign===planets.Mercury.sign),good=companions.filter(k=>out[k]==='benefic').length,bad=companions.length-good;
    out.Mercury=!companions.length||good>bad?'benefic':bad>good?'malefic':'mixed';return out;
  }
  function dispositors(planets){return KEYS.map(k=>{let chain=[k],seen=new Set([k]),next=LORDS[planets[k].sign];
    while(!seen.has(next)){chain.push(next);seen.add(next);next=LORDS[planets[next].sign];}
    return {planet:k,chain,closesAt:next,cycle:chain.slice(chain.indexOf(next)),selfDispositor:chain[chain.length-1]===next};});}
  function arudhas(planets,lagna){if(lagna==null)return [];return Array.from({length:12},(_,i)=>{const origin=mod(lagna+i,12),lord=LORDS[origin],lordSign=planets[lord].sign,d=mod(lordSign-origin,12);let sign=mod(origin+2*d,12),exception=[0,6].includes(mod(sign-origin,12));if(exception)sign=mod(sign+9,12);return {house:i+1,name:i===0?'AL':i===11?'UL':'A'+(i+1),sign,signName:SIGNS[sign],lord,exception,policy:'七曜宮主；同宮或對宮落點移至該落點第十座'};});}
  function yogas(planets,asc,asp){
    const list=[],add=(name,keys,rule)=>list.push({name,planets:keys,rule,conditions:keys.map(k=>({planet:k,house:planets[k].house,dignity:planets[k].dignity.label,sunSeparation:planets[k].sunSeparation})),status:'structural'});
    if(asc!=null)for(const [k,name] of [['Mars','Ruchaka'],['Mercury','Bhadra'],['Jupiter','Hamsa'],['Venus','Malavya'],['Saturn','Sasa']]){
      if([1,4,7,10].includes(planets[k].house)&&['own','moolatrikona','exalted'].includes(planets[k].dignity.status))add(name+'（五大行星格局）',[k],'本垣或擢升、位於本命上升角宮；近日狀態與受照另看成色');
    }
    if([0,3,6,9].includes(mod(planets.Jupiter.sign-planets.Moon.sign,12))){
      const nature=naturalNatures(planets),j=planets.Jupiter,dispositor=LORDS[j.sign],rel=relationships(planets).find(r=>r.from==='Jupiter'&&r.to===dispositor);
      const connected=k=>planets[k].sign===j.sign||asp.graha.some(a=>a.from===k&&a.toPlanets.includes('Jupiter'));
      const supporters=KEYS.filter(k=>k!=='Jupiter'&&nature[k]==='benefic'&&connected(k));
      const mixedSupport=KEYS.some(k=>nature[k]==='mixed'&&connected(k));
      const solar=j.solar||solarCondition('Jupiter',j.longitude,planets.Sun.longitude,!!j.retrograde);
      const checks=[{key:'moonQuadrant',label:'木星位於月亮的角宮',passed:true},
        {key:'beneficSupport',label:supporters.length?'自然吉曜支持：'+supporters.map(zh).join('、'):mixedSupport?'支持星水星的同座吉凶數量相等':'木星沒有自然吉曜同座或全照',passed:supporters.length?true:mixedSupport?null:false},
        {key:'notDebilitated',label:j.dignity.debilitated?'木星落陷':'木星未落陷',passed:!j.dignity.debilitated},
        {key:'notCombust',label:'木星距太陽 '+solar.separationDegrees.toFixed(2)+'°；燃燒門檻 11°',passed:!solar.combust},
        {key:'notEnemy',label:'木星與所在座主的合成關係：'+(dispositor==='Jupiter'?'本垣':rel.label),passed:dispositor==='Jupiter'||rel.compound>=0}];
      const formed=checks.every(c=>c.passed===true);add(formed?'Gaja Kesari（象獅格局）':'月木角宮關係',['Moon','Jupiter'],formed?'符合本版採用的 PVR 條件：月木角宮、吉曜支持，木星未落陷、未燃燒且非合成敵座。':'月木角宮關係成立；未滿足本版 Gaja Kesari 的全部條件，按實際關係解讀。');
      Object.assign(list[list.length-1],{status:formed?'structural':'relation',checks,definition:'PVR 11.6 / Gaja-Kesari; compound friendship; angular combustion convention'});
    }
    if(planets.Sun.sign===planets.Mercury.sign)add('Budha Aditya（日水同座）',['Sun','Mercury'],'太陽與水星同座；須同看近日距離與宮主角色');
    KEYS.slice(0,7).forEach((a,i)=>KEYS.slice(i+1,7).forEach(b=>{if(LORDS[planets[a].sign]===b&&LORDS[planets[b].sign]===a)add('Parivartana（互容）',[a,b],'兩曜互入對方本垣；依實際掌宮辨別領域與代價');}));
    if(asc!=null){const l9=LORDS[(asc+8)%12],l10=LORDS[(asc+9)%12];
      const connected=l9===l10||planets[l9].sign===planets[l10].sign||(LORDS[planets[l9].sign]===l10&&LORDS[planets[l10].sign]===l9)||
        (asp.graha.some(a=>a.from===l9&&a.toPlanets.includes(l10))&&asp.graha.some(a=>a.from===l10&&a.toPlanets.includes(l9)));
      if(connected)add('Dharma Karma（九十宮主連結）',[...new Set([l9,l10])],'九、十宮主同曜／同座／互容／互相照見');
    }return list;
  }
  // Rule scope: P.V.R. Narasimha Rao, chapters 11.2–11.7, author-hosted edition.
  // These records describe configurations, never deterministic life events.
  function specialYogas(ps,asc,asp){
    const source='https://www.vedicastrologer.org/articles/vedic_astro_textbook.pdf',seven=KEYS.slice(0,7),five=seven.slice(2),nature=naturalNatures(ps),checks=[];
    const record=(id,name,passed,planets,rule,extra={})=>{const r={id,name,status:passed===null?'insufficient-data':passed?'structural':'not-established',planets:[...new Set(planets)],conditions:[...new Set(planets)].map(k=>({planet:k,house:ps[k].house,dignity:ps[k].dignity.label,sunSeparation:ps[k].sunSeparation})),rule,source,...extra};checks.push(r);return r;};
    const relative=(key,reference)=>mod(ps[key].sign-ps[reference].sign,12)+1;
    const flank=(reference,h)=>five.filter(k=>relative(k,reference)===h);
    for(const [reference,names] of [['Sun',['Vesi','Vosi','Ubhayachara']],['Moon',['Sunaphaa','Anaphaa','Duradhara']]]){
      const next=flank(reference,2),previous=flank(reference,12);
      record(names[0],names[0],next.length>0,[reference,...next],'五行星有一曜在'+zh(reference)+'第二座；不計另一光體及交點',{reference});
      record(names[1],names[1],previous.length>0,[reference,...previous],'五行星有一曜在'+zh(reference)+'第十二座',{reference});
      record(names[2],names[2],!!next.length&&!!previous.length,[reference,...next,...previous],'同時具備第二與第十二座兩側夾持；與前兩項共用證據，不重複加權',{reference});
    }
    const moonCompanions=five.filter(k=>[1,2,12].includes(relative(k,'Moon'))),angular=asc==null?null:seven.filter(k=>k!=='Moon'&&[1,4,7,10].includes(ps[k].house));
    const kem=record('Kemadruma','Kemadruma',moonCompanions.length?false:angular===null?null:angular.length===0,['Moon',...moonCompanions,...angular||[]], '月亮一、二、十二座無日月以外五曜，且上升四角無月亮以外七曜；PVR 11.3.4', {checks:[{label:'月亮近域空缺',passed:moonCompanions.length===0},{label:'上升角宮無其他七曜',passed:angular===null?null:angular.length===0}],cancellations:angular||[]});
    if(!moonCompanions.length&&angular&&angular.length)kem.status='cancelled';
    record('ChandraMangala','Chandra Mangala（月火同座）',ps.Moon.sign===ps.Mars.sign,['Moon','Mars'],'月亮與火星同一星座；不把任意單向相位當作同座');
    // PVR 11.6: Subha / Asubha explicitly permit a planet in the ascendant OR
    // benefic / malefic occupants on both flanks.  Ambivalent Mercury cannot
    // prove either branch.  Kartari for the other houses is the same geometry,
    // exported separately so derived names are never counted as new evidence.
    const occupants=sign=>KEYS.filter(k=>ps[k].sign===sign);
    const scissors=sign=>{
      const left=occupants(mod(sign-1,12)),right=occupants(mod(sign+1,12));
      const state=type=>left.some(k=>nature[k]===type)&&right.some(k=>nature[k]===type)?'structural':
        left.some(k=>nature[k]===type||nature[k]==='mixed')&&right.some(k=>nature[k]===type||nature[k]==='mixed')?'indeterminate':'not-established';
      return {left,right,benefic:state('benefic'),malefic:state('malefic')};
    };
    const kartari=asc==null?[]:Array.from({length:12},(_,i)=>{
      const sign=mod(asc+i,12),s=scissors(sign);
      return {house:i+1,sign,left:s.left,right:s.right,benefic:s.benefic,malefic:s.malefic,
        policy:'本命整宮兩側；自然吉凶依出生月相與水星同座判定；混合水星保留未定；與 Subha/Asubha 同源，不重複計票'};
    });
    for(const [type,id,name] of [['benefic','Subha','Subha（命宮吉曜或吉曜夾命）'],['malefic','Asubha','Asubha（命宮凶曜或凶曜夾命）']]){
      if(asc==null){record(id,name,null,[],'缺出生時間，無法判命宮及左右兩座；PVR 11.6');continue;}
      const direct=occupants(asc),s=kartari[0],present=direct.filter(k=>nature[k]===type),possible=direct.filter(k=>nature[k]==='mixed');
      const status=present.length||s[type]==='structural'?true:possible.length||s[type]==='indeterminate'?null:false;
      record(id,name,status,[...direct,...s.left,...s.right],
        '命宮有自然'+(type==='benefic'?'吉':'凶')+'曜，或命宮前後兩座分別有該類曜；兩條路徑擇一即成立；PVR 11.6',
        {direct:present,flanks:{left:s.left,right:s.right,status:s[type]},uncertain:possible});
    }
    const bhaaskara=relative('Moon','Sun')===12&&relative('Mercury','Sun')===2&&[5,9].includes(relative('Jupiter','Moon'));
    record('Bhaaskara','Bhaaskara（日月水木結構）',bhaaskara,['Sun','Moon','Mercury','Jupiter'],
      '月亮位於太陽第十二座、水星位於太陽第二座、木星位於月亮第五或第九座；三條均成立；PVR 11.6',
      {checks:[{key:'moonFromSun',label:'月亮在太陽第十二座',house:relative('Moon','Sun'),requires:[12],passed:relative('Moon','Sun')===12},
        {key:'mercuryFromSun',label:'水星在太陽第二座',house:relative('Mercury','Sun'),requires:[2],passed:relative('Mercury','Sun')===2},
        {key:'jupiterFromMoon',label:'木星在月亮第五或第九座',house:relative('Jupiter','Moon'),requires:[5,9],passed:[5,9].includes(relative('Jupiter','Moon'))}]});
    const linked=(a,b)=>a!==b&&(ps[a].sign===ps[b].sign||(LORDS[ps[a].sign]===b&&LORDS[ps[b].sign]===a)||(asp.graha.some(x=>x.from===a&&x.toPlanets.includes(b))&&asp.graha.some(x=>x.from===b&&x.toPlanets.includes(a))));
    const raja=[],yogakaraka=[];
    if(asc!=null){
      const lord=h=>LORDS[mod(asc+h-1,12)];
      const l4=lord(4),l10=lord(10),l1=lord(1);
      record('Chapa','Chapa（四十宮互換及命主擢升）',ps[l4].house===10&&ps[l10].house===4&&ps[l1].dignity.exaltedSign,
        [l4,l10,l1],'四宮主入十宮、十宮主入四宮，且命主在擢升星座；不由僅有互容或僅有擢升直接判成；PVR 11.6',
        {checks:[{key:'fourthLordInTenth',label:'四宮主入十宮',passed:ps[l4].house===10},
          {key:'tenthLordInFourth',label:'十宮主入四宮',passed:ps[l10].house===4},
          {key:'lagnaLordExalted',label:'命主落擢升星座',passed:ps[l1].dignity.exaltedSign}]});
      for(const h of [1,4,7,10])for(const t of [1,5,9]){
        const a=lord(h),b=lord(t);if(h===t)continue;
        if(a===b){if(!yogakaraka.some(x=>x.planet===a))yogakaraka.push({planet:a,houses:[h,t]});}
        else if(linked(a,b)){const old=raja.find(x=>x.planets.includes(a)&&x.planets.includes(b));if(old)old.housePairs.push([h,t]);else raja.push({planets:[a,b],housePairs:[[h,t]]});}
      }
      for(const [h,name] of [[6,'Harsha'],[8,'Sarala'],[12,'Vimala']])record(name,name,ps[lord(h)].house===h,[lord(h)],h+'宮主落回'+h+'宮；本版採 PVR 狹義，不混用三凶宮互落的廣義名稱');
      const dusthana=[6,8,12].map(h=>({owns:h,planet:lord(h),occupies:ps[lord(h)].house})).filter(x=>[6,8,12].includes(x.occupies));
      record('Vipareeta','Vipareeta（困難宮主互涉）',dusthana.length>0,dusthana.map(x=>x.planet),'六、八、十二宮主位於這三宮；僅記基本結構，仍查力量、其他宮主牽連及運期',{connections:dusthana});
    }else for(const name of ['Chapa','Harsha','Sarala','Vimala','Vipareeta'])record(name,name,null,[],'缺出生時間，無法確定宮主與宮位');
    record('Raaja','Raaja（角宮與三分宮主連結）',asc==null?null:raja.length>0,raja.flatMap(x=>x.planets),'兩個不同宮主同座、互容或相互行星照見；單向照見不成立',{connections:raja});
    record('Yogakaraka','Yogakaraka（兼掌角宮與三分宮）',asc==null?null:yogakaraka.length>0,yogakaraka.map(x=>x.planet),'同一星兼掌兩個不同的角宮／三分宮；與兩星互相照見分開',{connections:yogakaraka});
    // Naabhasa: all 32 named types, evaluated separately from event yogas.
    const nbStart=checks.length,sevenH=seven.map(k=>ps[k].house),occupied=[...new Set(sevenH)];
    const inShape=houses=>asc==null?null:sevenH.every(h=>houses.includes(h))&&houses.every(h=>occupied.includes(h));
    for(const [m,name] of ['Rajju','Musala','Nala'].entries())record('N-'+name,name,seven.every(k=>ps[k].sign%3===m),seven,'七曜全在同一變動／固定／雙體類；交點不計',{family:'Aasraya'});
    for(const [type,name,opposite] of [['benefic','Maalaa','malefic'],['malefic','Sarpa','benefic']]){
      const members=KEYS.filter(k=>nature[k]===type&&[1,4,7,10].includes(ps[k].house)),opponents=KEYS.filter(k=>nature[k]===opposite&&[1,4,7,10].includes(ps[k].house));
      record('N-'+name,name,asc==null?null:new Set(members.map(k=>ps[k].house)).size>=3,members,'同類自然吉／凶曜佔至少三個角宮；Dala 採作者交點入例；反類曜另記削弱條件',{family:'Dala',modifiers:opponents});
    }
    const shapes=[['Gadaa',[[1,4],[4,7],[7,10],[10,1]]],['Sakata',[[1,7]]],['Vihanga',[[4,10]]],['Sringaataka',[[1,5,9]]],['Hala',[[2,6,10],[3,7,11],[4,8,12]]],['Kamala',[[1,4,7,10]]],['Vaapi',[[2,5,8,11],[3,6,9,12]]],['Yoopa',[[1,2,3,4]]],['Sara',[[4,5,6,7]]],['Sakti',[[7,8,9,10]]],['Danda',[[10,11,12,1]]]];
    for(const [name,starts] of [['Naukaa',[1]],['Koota',[4]],['Chatra',[7]],['Chaapa',[10]],['ArdhaChandra',[2,3,5,6,8,9,11,12]]])shapes.push([name,starts.map(s=>Array.from({length:7},(_,i)=>mod(s-1+i,12)+1))]);
    shapes.push(['Chakra',[[1,3,5,7,9,11]]],['Samudra',[[2,4,6,8,10,12]]]);
    for(const [name,options] of shapes)record('N-'+name,name,asc==null?null:options.some(h=>inShape(h)),seven,'七曜全部限於指定整宮形狀；本版要求所列各宮實際有曜，保留嚴格分布口徑',{family:'Aakriti',houseOptions:options});
    for(const [name,good,bad] of [['Vajra',[1,7],[4,10]],['Yava',[4,10],[1,7]]]){
      const rule=seven.every(k=>(nature[k]==='benefic'?good:nature[k]==='malefic'?bad:[]).includes(ps[k].house))&&[...good,...bad].every(h=>occupied.includes(h));
      record('N-'+name,name,asc==null?null:rule,seven,'七曜限於四角，自然吉凶依所列兩組宮位分置；混合水星不強判',{family:'Aakriti',beneficHouses:good,maleficHouses:bad});
    }
    const preceding=checks.slice(nbStart),other=preceding.filter(x=>x.status==='structural'),unknown=preceding.some(x=>x.status==='insufficient-data'),nSigns=new Set(seven.map(k=>ps[k].sign)).size;
    for(const [n,name] of ['Gola','Yuga','Soola','Kedaara','Paasa','Daama','Veenaa'].entries()){
      const r=record('N-'+name,name,nSigns===n+1&&other.length===0?(unknown?null:true):false,seven,'七曜分佔'+(n+1)+'座；只在其他 Naabhasa 不成立時採用',{family:'Sankhya',occupiedSignCount:nSigns,supersededBy:other.map(x=>x.id)});
      if(nSigns===n+1&&other.length)r.status='superseded';
    }
    return {version:'1.1.0',source,profile:'PVR-CH11-EXPLICIT-20260923',checks,matched:checks.filter(x=>x.status==='structural'),kartari,
      limitation:'本命結構清單；不是全流派 Yoga 或完整強度分數。取消、異說與缺資料必須保留；不引用古籍的貧富、疾病或道德斷言為事實。',
      unavailable:['完整 Shadbala','全派落陷取消 Neechabhanga','Jaimini／其他大運','未實算的 Yoga 不作已驗證格局']};
  }
  function timeSensitivity(input,base,minutes){
    if(minutes===0)return {minutes:0,sampled:false,changes:[],note:'依使用者所填精確時間計算；星曆角度仍有數值誤差'};
    const center=instant(input.utc).getTime(),unknown=!!input.unknownTime,span=minutes*60000,changes=new Map();
    let firstEndMin=Infinity,firstEndMax=-Infinity;const firstLords=new Set(),currentLords=new Set();
    let start=center-span,end=center+span;
    if(unknown&&input.civil&&input.civil.date&&input.civil.timezone){
      const nextDay=new Date(input.civil.date+'T12:00:00Z');nextDay.setUTCDate(nextDay.getUTCDate()+1);
      function dayStart(date){for(let h=0;h<4;h++){try{return +civilToUTC({date,time:String(h).padStart(2,'0')+':00',timezone:input.civil.timezone,disambiguation:'earlier'}).date;}catch(e){if(h===3)throw e;}}}
      start=dayStart(input.civil.date);end=dayStart(nextDay.toISOString().slice(0,10))-1;
    }
    const count=Math.max(2,Math.min(240,Math.ceil((end-start)/30000))),step=(end-start)/count;
    // Samples are explicitly recorded as samples, not presented as an exhaustive
    // mathematical bound. Include center, endpoints and intermediate times.
    for(let i=0;i<=count;i++){const ms=start+i*step,a=astronomy(new Date(ms),input.latitude,input.longitude,input.ayanamsa),keys=unknown?KEYS:KEYS.concat('Lagna');
      keys.forEach(k=>Object.keys(VARGAS).forEach(d=>{const lon=k==='Lagna'?a.ascendant:a.planets[k].sidereal,key=k+'/D'+d,s=varga(lon,+d).sign;let set=changes.get(key);if(!set){set=new Set();changes.set(key,set);}set.add(s);}));
      const n=nakshatra(a.planets.Moon.sidereal);let set=changes.get('Moon/nakshatra');if(!set){set=new Set();changes.set('Moon/nakshatra',set);}set.add(n.name);
      if(!unknown){const ds=dasha(a.planets.Moon.sidereal,new Date(ms),input.reference,input.yearDays);firstEndMin=Math.min(firstEndMin,ds.periods[0].end);firstEndMax=Math.max(firstEndMax,ds.periods[0].end);firstLords.add(ds.firstLord);currentLords.add(ds.current?[ds.current.maha.lord,ds.current.antar.lord,ds.current.pratyantar.lord].join('/'):'before-birth');}
    }
    return {minutes,sampled:true,sampledStart:new Date(start).toISOString(),sampledEnd:new Date(end).toISOString(),sampleStepSeconds:step/1000,changes:[...changes].filter(([,s])=>s.size>1).map(([key,s])=>({key,alternatives:[...s]})),dashaTiming:unknown?null:{firstEndMin,firstEndMax,firstLords:[...firstLords],currentLords:[...currentLords],sampleCount:count+1,note:'出生時間區間的取樣結果；跨月宿時第一運主可能改變，日期範圍須與 firstLords 一起讀'},note:unknown?'時間未知：不排上升、宮位、分盤宮位與確定運期；行星以中午作觀察錨並附當地全日取樣變化':'出生時間區間取樣：變動項請按出生紀錄核對；分盤不固定等同未來事件'};
  }
  function compute(options){
    const input=Object.assign({ayanamsa:'lahiri',yearDays:365.2425,uncertaintyMinutes:0,unknownTime:false},options);
    finite(input.latitude,'緯度');finite(input.longitude,'經度');
    if(Math.abs(input.latitude)>89||Math.abs(input.longitude)>180)throw Error('緯度須介於 -89 與 89，經度須介於 -180 與 180');
    const birth=instant(input.utc),reference=instant(input.reference||new Date());
    const min=Date.UTC(1900,0,1),max=Date.UTC(2101,0,1);if(birth<min||birth>=max||reference<min||reference>=max)throw Error('目前星曆核對範圍為 1900–2100 年');
    const uncertainty=finite(Number(input.uncertaintyMinutes),'時間誤差');if(uncertainty<0||uncertainty>720)throw Error('時間誤差須為 0–720 分鐘');
    const velocityHalfDays=10/1440;
    const raw=astronomy(birth,input.latitude,input.longitude,input.ayanamsa),prev=astronomy(new Date(+birth-DAY*velocityHalfDays),input.latitude,input.longitude,input.ayanamsa),next=astronomy(new Date(+birth+DAY*velocityHalfDays),input.latitude,input.longitude,input.ayanamsa);
    const lagna=input.unknownTime?null:placement(raw.ascendant),planets={};
    KEYS.forEach((k,i)=>{const p=placement(raw.planets[k].sidereal),speed=diff(next.planets[k].sidereal,prev.planets[k].sidereal)/(2*velocityHalfDays);
      planets[k]=Object.assign({key:k,name:NAMES[i],symbol:SYMBOLS[i]},p,{tropical:raw.planets[k].tropical,latitude:raw.planets[k].latitude,speed,retrograde:speed<0,stationary:Math.abs(speed)<0.005,house:lagna?mod(p.sign-lagna.sign,12)+1:null,nakshatra:nakshatra(p.longitude),dignity:dignity(k,p.longitude),dispositor:LORDS[p.sign],sunSeparation:Math.abs(diff(p.longitude,raw.planets.Sun.sidereal))});
      planets[k].solar=solarCondition(k,p.longitude,raw.planets.Sun.sidereal,speed<0);
      planets[k].solar.motionSensitive=['Mercury','Venus'].includes(k)&&planets[k].stationary;
    });
    const vargas={};Object.keys(VARGAS).forEach(d=>{const la=lagna?varga(lagna.longitude,+d):null,ps={};KEYS.forEach(k=>{ps[k]=varga(planets[k].longitude,+d);ps[k].house=la?mod(ps[k].sign-la.sign,12)+1:null;ps[k].vargottama=d==='9'&&ps[k].sign===planets[k].sign;});vargas[d]={division:+d,purpose:VARGAS[d],lagna:la,planets:ps};});
    const asp=aspects(planets,lagna&&lagna.sign),av=ashtakavarga(planets,lagna&&lagna.sign),rel=relationships(planets);
    const houses=lagna?Array.from({length:12},(_,i)=>{const sign=(lagna.sign+i)%12,lord=LORDS[sign];return {house:i+1,sign,signName:SIGNS[sign],lord,lordHouse:planets[lord].house,occupants:KEYS.filter(k=>planets[k].house===i+1),aspectedBy:asp.graha.filter(a=>a.toHouse===i+1).map(a=>a.from),sav:av.sav[sign]};}):[];
    const phase=norm(planets.Moon.longitude-planets.Sun.longitude),half=partFloor(phase/6),karanas=['Bava','Balava','Kaulava','Taitila','Gara','Vanija','Vishti'];
    const panchanga={tithi:partFloor(phase/12)+1,paksha:phase<180?'白半月 Shukla（漸盈）':'黑半月 Krishna（漸虧）',elongation:phase,yoga:partFloor(norm(planets.Sun.longitude+planets.Moon.longitude)*27/360)+1,karana:half===0?'Kimstughna':half>=57?['Shakuni','Chatushpada','Naga'][half-57]:karanas[(half-1)%7],note:'出生瞬間的角度項；未把民用午夜當作傳統日出日界'};
    const ranked=KEYS.slice(0,7).sort((a,b)=>planets[b].degree-planets[a].degree),karakaNames=['AK','AmK','BK','MK','PK','GK','DK'];
    const karakas=ranked.map((k,i)=>({role:karakaNames[i],planet:k,degree:planets[k].degree,tied:ranked.some(x=>x!==k&&Math.abs(planets[x].degree-planets[k].degree)<1e-8)}));
    const now=astronomy(reference,input.latitude,input.longitude,input.ayanamsa),transits=KEYS.map(k=>{const p=placement(now.planets[k].sidereal);return {planet:k,...p,fromLagna:lagna?mod(p.sign-lagna.sign,12)+1:null,fromMoon:mod(p.sign-planets.Moon.sign,12)+1,bav:av&&av.bav[k]?av.bav[k][p.sign]:null,sav:av?av.sav[p.sign]:null};});
    const transitSnapshots=[];
    for(let i=1;i<=36;i++){
      const date=new Date(Date.UTC(reference.getUTCFullYear(),reference.getUTCMonth()+i,1,12));if(date>=max)break;
      const snap=astronomy(date,input.latitude,input.longitude,input.ayanamsa);
      transitSnapshots.push({utc:date.toISOString(),sampling:'月初 UTC 12:00 的快照；不是入座時刻',planets:['Jupiter','Saturn','Rahu','Ketu'].map(k=>{
        const p=placement(snap.planets[k].sidereal);return {planet:k,sign:p.signName,degree:p.degree,fromLagna:lagna?mod(p.sign-lagna.sign,12)+1:null,fromMoon:mod(p.sign-planets.Moon.sign,12)+1};})});
    }
    const dashas=dasha(planets.Moon.longitude,birth,reference,input.yearDays);
    if(input.unknownTime)dashas.current=null;
    const out={schema:VERSION,input:{utc:birth.toISOString(),reference:reference.toISOString(),latitude:input.latitude,longitude:input.longitude,location:input.location||'',civil:input.civil?{...input.civil}:null,unknownTime:input.unknownTime},
      policy:{astronomy:'Astronomy Engine 2.1.19; geocentric apparent ecliptic of date',deltaT:'Swiss 2.10.03 Moshier monthly numeric model; future Delta T is a prediction',ayanamsa:input.ayanamsa,ayanamsaDegrees:raw.ayanamsa,meanAyanamsa:raw.meanAyanamsa,node:'mean',houses:'whole-sign',dashaYearDays:input.yearDays,vargas:'Parashari 16; D2 Sun/Moon Hora; D30 unequal; D60 from natal sign',karakas:'7 grahas, no nodes',dignity:'degree-aware; Venus moolatrikona 0–15 Libra (PVR convention)',scope:'D1–D60, Vimshottari MD/AD/PD, graha/rasi drishti, BAV/SAV, dispositors, arudha, seven karakas, structural yogas; not a full Shadbala or Jaimini-dasha calculator'},
      julianDay:raw.jd,lagna,planets,houses,vargas,aspects:asp,relationships:rel,dispositors:dispositors(planets),ashtakavarga:av,arudhas:arudhas(planets,lagna&&lagna.sign),karakas,yogas:yogas(planets,lagna&&lagna.sign,asp),panchanga,dasha:dashas,transits,transitSnapshots};
    out.policy.combustion='Surya Siddhanta angular thresholds: Moon 12, Mars 17, Mercury direct 14/retrograde 12, Jupiter 11, Venus direct 10/retrograde 8, Saturn 15 degrees; inside threshold, not heliacal visibility';
    out.policy.friendship='dignity friend/enemy labels: natural; relationships: compound; Gaja Kesari uses compound as in PVR';
    out.naturalNatures=naturalNatures(planets);
    out.specialRules=specialYogas(planets,lagna&&lagna.sign,asp);
    out.yogas.push(...out.specialRules.matched);
    out.sensitivity=timeSensitivity({...input,utc:birth,reference},out,input.unknownTime?720:uncertainty);
    out.sensitivity.angularCheckArcminutes=1;
    out.sensitivity.nearAngularBoundaries=[];
    KEYS.concat(lagna?['Lagna']:[]).forEach(k=>{const x=k==='Lagna'?lagna.longitude:planets[k].longitude;
      Object.keys(VARGAS).forEach(d=>{const left=varga(x-1/60,+d),right=varga(x+1/60,+d);if(left.sign!==right.sign)out.sensitivity.nearAngularBoundaries.push({key:k+'/D'+d,alternatives:[left.signName,right.signName]});});});
    return freeze(out);
  }
  root.JYVedic=Object.freeze({version:VERSION,compute,astronomy,civilToUTC,varga,nakshatra,dignity,dasha,children,aspects,ashtakavarga,arudhas,solarCondition,naturalNatures,yogas,specialYogas,meanAyanamsa,placement,norm,diff,zh,KEYS:Object.freeze(KEYS),SIGNS:Object.freeze(SIGNS),LORDS:Object.freeze(LORDS),VARGAS:Object.freeze(VARGAS),NAKS:Object.freeze(NAKS)});
})(typeof globalThis!=='undefined'?globalThis:this);
