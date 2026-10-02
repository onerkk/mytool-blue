/* Numeric tables independently transcribed from Houlding's published charts.
 * Bounds use [start,end); Ptolemaic and Egyptian tables are separate policies.
 * This module computes traditional dignities, not an event probability. */
(function(root){
  'use strict';
  const KEYS=['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn'];
  const LORDS=['Mars','Venus','Mercury','Moon','Sun','Mercury','Venus','Mars','Jupiter','Saturn','Saturn','Jupiter'];
  const EXALT={Sun:0,Moon:1,Mercury:5,Venus:11,Mars:9,Jupiter:3,Saturn:6};
  const EXALTED_BY_SIGN=['Sun','Moon',null,'Jupiter',null,'Mercury','Saturn',null,null,'Mars',null,'Venus'];
  const TRIPLICITY=[['Sun','Jupiter'],['Venus','Moon'],['Saturn','Mercury'],['Mars','Mars']];
  const CHALDEAN=['Saturn','Jupiter','Mars','Sun','Venus','Mercury','Moon'];
  const PTOLEMY=[
    [['Jupiter',6],['Venus',14],['Mercury',21],['Mars',26],['Saturn',30]],
    [['Venus',8],['Mercury',15],['Jupiter',22],['Saturn',26],['Mars',30]],
    [['Mercury',7],['Jupiter',14],['Venus',21],['Saturn',25],['Mars',30]],
    [['Mars',6],['Jupiter',13],['Venus',20],['Mercury',27],['Saturn',30]],
    [['Saturn',6],['Mercury',13],['Venus',19],['Jupiter',25],['Mars',30]],
    [['Mercury',7],['Venus',13],['Jupiter',18],['Saturn',24],['Mars',30]],
    [['Saturn',6],['Venus',11],['Jupiter',19],['Mercury',24],['Mars',30]],
    [['Mars',6],['Jupiter',14],['Venus',21],['Mercury',27],['Saturn',30]],
    [['Jupiter',8],['Venus',14],['Mercury',19],['Saturn',25],['Mars',30]],
    [['Venus',6],['Mercury',12],['Jupiter',19],['Mars',25],['Saturn',30]],
    [['Saturn',6],['Mercury',12],['Venus',20],['Jupiter',25],['Mars',30]],
    [['Venus',8],['Jupiter',14],['Mercury',20],['Mars',26],['Saturn',30]]
  ];
  const EGYPTIAN=[
    [['Jupiter',6],['Venus',12],['Mercury',20],['Mars',25],['Saturn',30]],
    [['Venus',8],['Mercury',14],['Jupiter',22],['Saturn',27],['Mars',30]],
    [['Mercury',6],['Jupiter',12],['Venus',17],['Mars',24],['Saturn',30]],
    [['Mars',7],['Venus',13],['Mercury',19],['Jupiter',26],['Saturn',30]],
    [['Jupiter',6],['Venus',11],['Saturn',18],['Mercury',24],['Mars',30]],
    [['Mercury',7],['Venus',17],['Jupiter',21],['Mars',28],['Saturn',30]],
    [['Saturn',6],['Mercury',14],['Jupiter',21],['Venus',28],['Mars',30]],
    [['Mars',7],['Venus',11],['Mercury',19],['Jupiter',24],['Saturn',30]],
    [['Jupiter',12],['Venus',17],['Mercury',21],['Saturn',26],['Mars',30]],
    [['Mercury',7],['Jupiter',14],['Venus',22],['Saturn',26],['Mars',30]],
    [['Mercury',7],['Venus',13],['Jupiter',20],['Mars',25],['Saturn',30]],
    [['Venus',12],['Jupiter',16],['Mercury',19],['Mars',28],['Saturn',30]]
  ];
  const TABLES={ptolemy:PTOLEMY,egyptian:EGYPTIAN};
  function rulers(longitude,daytime,bounds='ptolemy'){
    if(!Number.isFinite(longitude)||!TABLES[bounds])throw Error('尊貴度數或界主取法無效');
    if(daytime!==true&&daytime!==false&&daytime!==null)throw Error('日夜盤狀態必須明確或未知');
    const lon=(longitude%360+360)%360,sign=Math.floor(lon/30),degree=lon-sign*30;
    const row=TABLES[bounds][sign],index=row.findIndex(x=>degree<x[1]);
    return {sign,degree,signLord:LORDS[sign],exaltationLord:EXALTED_BY_SIGN[sign],triplicityLord:daytime===null?null:TRIPLICITY[sign%4][daytime?0:1],termLord:row[index][0],termInterval:{start:index?row[index-1][1]:0,endExclusive:row[index][1]},faceLord:CHALDEAN[(2+Math.floor(lon/10))%7],faceInterval:{start:Math.floor(degree/10)*10,endExclusive:(Math.floor(degree/10)+1)*10}};
  }
  function placement(key,longitude,daytime,bounds='ptolemy'){
    if(!KEYS.includes(key))throw Error('傳統五項尊貴只適用七曜');
    const r=rulers(longitude,daytime,bounds),held=['sign','exaltation','triplicity','term','face'].filter(k=>r[k+'Lord']===key),ownSigns=LORDS.flatMap((k,i)=>k===key?[i]:[]);
    return {planet:key,longitude,...r,held,detriment:ownSigns.some(s=>(s+6)%12===r.sign),fall:(EXALT[key]+6)%12===r.sign,peregrine:held.length?false:daytime===null?null:true};
  }
  function compute(chart,options={}){
    const bounds=options.bounds||'ptolemy',sect=chart.sect,daytime=sect&&Number.isFinite(sect.solarAltitude)?sect.solarAltitude>=0:null;
    const planets=KEYS.map(k=>placement(k,chart.planets[k].longitude,daytime,bounds)),hosting=[];
    for(const guest of planets)for(const host of planets)if(guest.planet!==host.planet){const dignities=['sign','exaltation','triplicity','term','face'].filter(d=>guest[d+'Lord']===host.planet);if(dignities.length)hosting.push({host:host.planet,guest:guest.planet,dignities,aspects:(chart.aspects||[]).filter(a=>[a.a,a.b].includes(host.planet)&&[a.a,a.b].includes(guest.planet))});}
    const mutual=[];for(let i=0;i<KEYS.length;i++)for(let j=i+1;j<KEYS.length;j++){const a=hosting.find(x=>x.host===KEYS[i]&&x.guest===KEYS[j]),b=hosting.find(x=>x.host===KEYS[j]&&x.guest===KEYS[i]);if(a&&b)mutual.push({a,b});}
    return {schema:'jy.western-essential/1',bounds,daytime,planets,sourceAudit:[{source:'https://www.skyscript.co.uk/dignity_answers.html',longitude:109.75,reportedTerm:'Mercury',ptolemyTableTerm:'Venus',egyptianTableTerm:'Jupiter',decision:'例題巨蟹19度45分的界主答案與两張原表均不一致；採原表，不用此答案作驗算標準'}],dignityHosting:hosting,mutualHosting:mutual,policy:{triplicity:'Ptolemaic 日夜三分主；水象日夜皆火星，不混用 Dorothean 三主表',bounds:bounds==='ptolemy'?'Houlding 所列 Ptolemaic 界表':'Houlding 所列 Egyptian 界表',boundaries:'起點包含、終點不含；黃經30°自動轉入下一星座',face:'Chaldean 次序，牡羊首十度由火星起',peregrine:'五項均非自身主星；日夜未知且未持其他尊貴則為null',hosting:'記錄客星落入主星各項尊貴的方向與實际相位；不把無相位候選自動判為接納成立，不推定吉凶相消',scope:'傳統七曜；外行星、交點與角點沒有臆造界主或面主'},sources:[{url:'https://www.skyscript.co.uk/essential_dignities.html',title:'Deborah Houlding: Ptolemy and Egyptian tables'},{url:'https://www.skyscript.co.uk/dignity_answers.html',title:'Author-published worked answers'}]};
  }
  root.JYWesternDignities=Object.freeze({version:'20261003dignity1',rulers,placement,compute,KEYS});
})(typeof window==='undefined'?globalThis:window);
