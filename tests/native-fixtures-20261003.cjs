'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),acorn=require('acorn');
const root=path.resolve(__dirname,'..');
function environment(){
  const e=require('./dom-fixture.cjs').environment(),c=e.ctx;
  c.console={log(){},warn(){},error:console.error};c.Uint8Array=Uint8Array;c.crypto=require('node:crypto').webcrypto;
  function load(name){vm.runInContext(fs.readFileSync(path.join(root,'JS',name+'.js'),'utf8'),c,{filename:name});}
  ['reading-quality','reading-workflow','vedic-strength','western-dignities','native-rule-sources','bazi-adjudication','ziwei-school-completion','vedic-applicability','liuren-topic-rules','liuyao-classical-balance','western-tradition-profile','native-depth-contract','oracle-register','engine-computation-audit','native-card-analysis','native-chart-analysis','native-analysis-view','vendor/lunar','bazi-calendar-core','solar-location','bazi-classical','bazi-functional','bazi-xiaoyun','bazi-qiongtong-data','bazi-qiongtong','bazi','bazi_upgrade','bazi-prompt-root','bazi-suite-core','tarot','meihua_upgrade','meihua_output_layer','meihua_upgrade2','ziwei-prompt-root'].forEach(load);
  const src=fs.readFileSync(path.join(root,'JS/ai-analysis.js'),'utf8'),ast=acorn.parse(src,{ecmaVersion:'latest',sourceType:'script'}),needed=new Set(['SIHUA_TABLE','ZW_PALACES','ZW_MAJOR','ZW_BRIGHTNESS','getStarBright']);
  for(const n of ast.body){if(n.type==='VariableDeclaration')for(const d of n.declarations)if(needed.has(d.id.name))vm.runInContext(n.kind+' '+src.slice(d.start,d.end)+';',c);if(n.type==='FunctionDeclaration'&&needed.has(n.id.name))vm.runInContext(src.slice(n.start,n.end),c);}
  ['ziwei-completion','ziwei','ziwei-standalone','relationship-core','vendor/astronomy-engine-2.1.19.min','vedic-ayanamsa','astro-time','vedic-completion','vedic-transit-rules','vedic-tajaka-rules','vedic-tajaka','vedic-sudarsana-bphs','vedic-sudarsana','vedic-engine','vedic-prompt','horary-perfection','horary-light','western-completion','western-engine','western-prompt','liuyao-core','yijing-data','yijing-wings','yijing-core','gua-prompt','liuren-classes','liuren-shensha','liuren-completion','liuren-core','liuren-prompt','name-data','name-sancai','name-engine','name-prompt','lenormand'].forEach(load);
  return {...e,load};
}
function examples(c){
 const plain=x=>JSON.parse(JSON.stringify(x));
const instant='2026-10-02T04:00:00Z',q='完整分析原局與2026至2029年的工作、關係與取捨';
const b=c.computeBazi(1983,8,25,14,55,'male',{timezoneOffset:8,trueSolarTime:false,dayBoundaryMode:'MIDNIGHT_00',referenceDate:instant});c.enhanceBazi(b);
const z=c.computeZiwei(1983,8,25,14,'male',{minute:55,referenceDate:instant});
const input={utc:'1983-08-25T06:55:00Z',reference:instant,latitude:23.31,longitude:120.31,civil:{date:'1983-08-25',time:'14:55',timezone:'Asia/Taipei'}};
const v=c.JYVedic.compute(input),w=c.JYWestern.compute(input),l=c.JYLiurenCore.calculate({date:'2026-10-01',time:'22:06',question:q});
const six=c.JYLiuyaoCore.calculate({values:[6,7,8,9,7,8],calendar:{day:'甲子',monthBranch:'辰'},question:'今年工作能順利嗎？'}),yi=c.JYYijingCore.calculate({values:[6,7,8,9,7,8],question:q});
const mh=c.calcMH(1,1,1,{timestamp:instant}),nm=c.JYNameEngine.compare({surname:'陳',candidates:['弘林','沐洪'],baselineName:'陳政軒',question:'哪個比原名好？'});
const bb=c.computeBazi(1994,6,20,23,26,'female',{referenceDate:instant});c.enhanceBazi(bb);
const comp=c.BaziSuiteCore.createCompatibility(b,bb,{scenarioId:'couple'}),profile=c.BaziSuiteCore.buildPersonality(b,{});
const cards=vm.runInContext('TAROT',c),tarot={sourceProfile:'rws_reversals',cards:[{...plain(cards[0]),isUp:true,position:'目前'},{...plain(cards[22]),isUp:false,position:'阻力'}]};
const ln={spreadType:'nine',expectedCount:9,cards:Array.from({length:9},(_,i)=>({id:i+1,name:'牌'+(i+1)}))},ootk={operations:{op1:{valid:true,sequence:[1,2,3]},op2:{valid:false},op3:{valid:true,abandoned:true}}};
const registered=c.JYOracleRegister.get(1),oracle={n:1,g:registered.ganzhi,p:registered.canonicalPoem,sourceUrl:registered.poemSource,sourceNote:'本次逐首覆核版本'};
const charts={bazi:b,ziwei:z,astro:w,vedic:v,liuren:l,liuyao:six,yijing:yi,meihua:mh,name:nm,compat:comp,personality:profile,tarot,lenormand:ln,ootk,oracle};
 return {instant,q,b,z,input,v,w,l,six,yi,mh,nm,bb,comp,profile,cards,tarot,ln,ootk,oracle,charts};
}
module.exports={environment,examples};
