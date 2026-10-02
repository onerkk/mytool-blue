/* Independently implemented numeric rules. A partial ledger never reports a
   Shadbala total. BPHS ch. 27 and B. V. Raman, Graha and Bhava Balas ch. III–V.
   Raman and BPHS saptavargaja scales are distinct selectable conventions. */
(function(root){
  'use strict';
  const KEYS=['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn'],DIVISIONS=[1,2,3,7,9,12,30];
  const EXALT={Sun:10,Moon:33,Mars:298,Mercury:165,Jupiter:95,Venus:357,Saturn:200};
  const DECAN={Sun:0,Mars:0,Jupiter:0,Mercury:1,Saturn:1,Moon:2,Venus:2};
  const NATURAL={Sun:60,Moon:360/7,Mars:120/7,Mercury:180/7,Jupiter:240/7,Venus:300/7,Saturn:60/7};
  const SCALES={raman:[1.875,3.75,7.5,15,22.5],bphs:[2,4,10,15,20]};
  const mod=(a,b)=>(a%b+b)%b,arc=(a,b)=>Math.abs(mod(a-b+180,360)-180);
  function uchcha(key,longitude){if(!(key in EXALT)||!Number.isFinite(longitude))throw Error('擢升力度資料無效');return arc(longitude,EXALT[key]+180)/3;}
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
    return {school,rows,virupas:rows.reduce((n,r)=>n+r.virupas,0)};
  }
  function directions(chart){
    const A=root.Astronomy,time=A.MakeTime(new Date(chart.input.utc)),eps=A.e_tilt(time).tobl*Math.PI/180,ramc=(A.SiderealTime(time)*15+chart.input.longitude)*Math.PI/180;
    const mc=mod(Math.atan2(Math.sin(ramc)/Math.cos(eps),Math.cos(ramc))*180/Math.PI-chart.policy.ayanamsaDegrees,360),asc=chart.lagna.longitude;
    return {ASC:asc,DSC:mod(asc+180,360),MC:mc,IC:mod(mc+180,360)};
  }
  function compute(chart,options={}){
    const school=options.school||'raman';if(!SCALES[school])throw Error('六力資料取法無效');
    if(chart.input.unknownTime)return {schema:'jy.vedic-strength/1',status:'unknown-time',complete:false,totalVirupas:null,planets:[],missing:['出生時刻及力度變動區間，不能以中午值確定六力']};
    const angles=directions(chart),unpowered={Sun:'IC',Mars:'IC',Mercury:'DSC',Jupiter:'DSC',Moon:'MC',Venus:'MC',Saturn:'ASC'},phase=arc(chart.planets.Moon.longitude,chart.planets.Sun.longitude)/3;
    const planets=KEYS.map(key=>{
      const p=chart.planets[key],seven=sapta(chart,key,school),parts={uchcha:uchcha(key,p.longitude),saptavargaja:seven.virupas,ojayugma:oja(key,p.sign,chart.vargas[9].planets[key].sign),kendradi:kendra(p.house),drekkana:drekkana(key,p.degree)};
      const benefic=['Moon','Mercury','Jupiter','Venus'].includes(key),paksha=benefic?phase:60-phase;
      return {planet:key,sthana:{complete:true,components:parts,saptavargajaDetails:seven,virupas:Object.values(parts).reduce((n,v)=>n+v,0)},dig:{complete:true,weakDirection:unpowered[key],weakLongitude:angles[unpowered[key]],virupas:arc(p.longitude,angles[unpowered[key]])/3},naisargika:{complete:true,virupas:NATURAL[key]},kala:{complete:false,components:{paksha},virupas:null},cheshta:{complete:false,virupas:null},drik:{complete:false,virupas:null},totalVirupas:null,totalRupas:null};
    });
    return {schema:'jy.vedic-strength/1',status:'partial',complete:false,school,unit:'Virupa; 60 Virupa = 1 Rupa',angles,planets,totalVirupas:null,
      completedComponents:['sthāna','dig','naisargika'],partialComponents:['kāla'],missing:['Kāla：日夜、三分、年／月／日／時主、偏角與行星戰','Cheshta：完整所採平行度數及動力模型','Drik：完整角距力度、吉凶曜權重及特殊照取法','完整六力總分、達標比較與Ishta/Kashta'],
      policy:{saptavargaja:'D1、D2、D3、D7、D9、D12、D30；沿用本命合成友敵。D1度數感知本質強位，其他分盤本垣；D2採日月Hora。',saptavargajaScale:school==='raman'?'45/30/22.5/15/7.5/3.75/1.875':'45/30/20/15/10/4/2',kendradi:'本命整宮相對位置',dig:'真上升／下降及子午圈MC／IC角點，轉恒星黃道；不以整宮宮頭代替角點',drekkana:'Raman第36–39節：陽性曜第一十度、陰陽同體曜第二、陰性曜第三',paksha:'BPHS27.10–11：日月最短黃經弧除3；月水木金取此值，日火土取60減此值；未混用加倍月亮口徑',scope:'三個完整力度分量及一項時間力度子項，不是完整六力；未計算數值為null，不補0、不排總分名次'},
      sources:[{title:'BPHS ch.27',url:'https://vedic-astro.s3.amazonaws.com/books/bhrihat_parasara_hora_shastra.pdf',scope:'擢升、奇偶、角宮、方向、月相、天然力度；版本差異另列'},{title:'B. V. Raman: Graha and Bhava Balas',url:'https://studylib.net/doc/28274582/bhava-and-graha-balas-b.v.raman-1996',scope:'第30、36–39節：七分盤比例與十度分組；文本傳抄錯誤須以原圖覆核'}]};
  }
  root.JYVedicStrength=Object.freeze({version:'20261003strength1',compute,uchcha,oja,kendra,drekkana,sapta,arc});
})(typeof window==='undefined'?globalThis:window);
