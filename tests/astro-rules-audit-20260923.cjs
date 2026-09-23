'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const ctx={Date,Intl,console};ctx.globalThis=ctx;
vm.createContext(ctx);
const js=path.resolve(__dirname,'../JS');
for(const file of ['vendor/astronomy-engine-2.1.19.min.js','vedic-ayanamsa.js','astro-time.js','vedic-engine.js','vedic-prompt.js','western-engine.js','western-prompt.js']){
  vm.runInContext(fs.readFileSync(path.join(js,file),'utf8'),ctx,{filename:file});
}
const V=ctx.JYVedic,W=ctx.JYWestern;
const natal={utc:'1983-08-25T06:55:00Z',reference:'2026-09-23T00:00:00Z',latitude:23.31,longitude:120.31,
  civil:{date:'1983-08-25',time:'14:55',timezone:'Asia/Taipei'}};
function synthetic(placements,asc=0){
  const base={Sun:6,Moon:3,Mars:6,Mercury:5,Jupiter:8,Venus:8,Saturn:6,Rahu:6,Ketu:6};
  const signs={...base,...placements},planets={};
  V.KEYS.forEach(key=>{
    const longitude=signs[key]*30+12,dignity=V.dignity(key,longitude);
    planets[key]={key,sign:signs[key],longitude,house:asc==null?null:(signs[key]-asc+12)%12+1,
      dignity,sunSeparation:Math.abs(V.diff(longitude,signs.Sun*30+12)),solar:V.solarCondition(key,longitude,signs.Sun*30+12)};
  });
  return V.specialYogas(planets,asc,V.aspects(planets,asc));
}
const byId=(result,id)=>result.checks.find(r=>r.id===id);
const bh=synthetic({Sun:0,Moon:11,Mercury:1,Jupiter:3});
assert.equal(byId(bh,'Bhaaskara').status,'structural');
assert.equal(byId(synthetic({Sun:0,Moon:11,Mercury:1,Jupiter:4}),'Bhaaskara').status,'not-established');
assert.equal(byId(synthetic({Sun:0,Moon:10,Mercury:1,Jupiter:3}),'Bhaaskara').status,'not-established');
assert.equal(byId(synthetic({Sun:0,Moon:11,Mercury:2,Jupiter:3}),'Bhaaskara').status,'not-established');
const chapa={Moon:9,Saturn:3,Mars:9};
assert.equal(byId(synthetic(chapa),'Chapa').status,'structural');
assert.equal(byId(synthetic({...chapa,Mars:0}),'Chapa').status,'not-established');
assert.equal(byId(synthetic({...chapa,Moon:8}),'Chapa').status,'not-established');
for(const r of [byId(bh,'Bhaaskara'),byId(synthetic(chapa),'Chapa')])for(const c of r.checks){
  assert.equal(typeof c.label,'string');assert.equal(c.passed,true);
}
const shubha=synthetic({Jupiter:1,Venus:11});
assert.equal(byId(shubha,'Subha').status,'structural');
assert.equal(shubha.kartari.length,12);
assert.equal(shubha.kartari[0].benefic,'structural');
assert.equal(byId(shubha,'Asubha').status,'not-established');
const ash=synthetic({Mars:1,Saturn:11});
assert.equal(byId(ash,'Asubha').status,'structural');
assert.equal(ash.kartari[0].malefic,'structural');
assert.equal(byId(ash,'Subha').status,'not-established');
const absent=synthetic({},null);
assert.equal(absent.kartari.length,0);
for(const id of ['Subha','Asubha','Chapa'])assert.equal(byId(absent,id).status,'insufficient-data');
assert.equal(byId(absent,'Bhaaskara').status,'not-established');
const shapes=x=>W.chartShapes(Object.fromEntries(W.KEYS.map((key,i)=>[key,{longitude:x[i]}])));
assert.equal(shapes([350,0,10,20,30,40,50,60,70,80]).matched[0].name,'集中形 Bundle');
assert.equal(shapes(Array(10).fill(0)).spanDegrees,0);
assert.equal(shapes([0,25,45,65,90,115,150,190,215,230]).matched[0].name,'火車頭形 Locomotive');
assert.equal(shapes([0,36,72,108,144,180,216,252,288,324]).matched.length,0);
assert.throws(()=>W.compute({...natal,utc:'1983-08-25T14:55:00'}),/UTC|時差/);
assert.throws(()=>W.compute({...natal,utc:null}),/UTC|時差/);
const caller={...natal,civil:{...natal.civil}},chart=W.compute(caller);
assert.equal(Object.isFrozen(caller.civil),false);
assert.equal(Object.isFrozen(chart.input.civil),true);
caller.civil.date='2000-01-01';assert.equal(chart.input.civil.date,'1983-08-25');
assert.throws(()=>W.compute({...natal,utc:'1983-08-25T05:55:00Z',unknownTime:true}),/不一致/);
const noClock=W.compute({...natal,utc:'1983-08-25T04:00:00Z',unknownTime:true,civil:{...natal.civil,time:'12:00'}});
assert.equal(noClock.sensitivity.unknownTime,true);
assert.equal(noClock.sensitivity.referenceClock.kind,'local-noon');
// The prompt-only UI uses local noon. A legacy caller may also supply an
// explicit, historically valid reference clock when toggling unknownTime.
const legacyClock=W.compute({...natal,unknownTime:true});
assert.equal(legacyClock.sensitivity.referenceClock.kind,'provided-civil-reference');
assert.equal(legacyClock.sensitivity.referenceClock.localTime,'14:55');
assert.equal(legacyClock.input.utc,'1983-08-25T06:55:00.000Z');
for(const key of ['houses','chartRuler','sect','progressions','solarReturn'])assert.equal(legacyClock[key],null);
assert.equal((Date.parse(legacyClock.sensitivity.utcInterval[1])-Date.parse(legacyClock.sensitivity.utcInterval[0]))/3600000,24);
const legacyPrompt=ctx.JYWesternPrompt.build(legacyClock,{question:'工作？'});
assert(legacyPrompt.includes('當地 14:55 的參考時刻，不是已確認的出生時刻'));
assert(!legacyPrompt.includes('行星表為當地中午參考值'));
assert.throws(()=>W.compute({...natal,utc:'1983-08-25T06:55:00Z',unknownTime:true,civil:{...natal.civil,time:'12:00'}}),/中午/);
assert.throws(()=>W.compute({...natal,utc:'1983-08-25T04:00:00Z',unknownTime:true}),/不一致/);
assert.throws(()=>W.compute({...natal,unknownTime:true,civil:{...natal.civil,date:'1983-08-26'}}),/不一致/);
assert.throws(()=>W.compute({...natal,unknownTime:true,civil:{...natal.civil,timezone:'Asia/Tokyo'}}),/不一致/);
const dstInput={...natal,utc:'2024-11-03T05:30:00Z',unknownTime:true,civil:{date:'2024-11-03',time:'01:30',timezone:'America/New_York',disambiguation:'earlier'}};
const dstChart=W.compute(dstInput);
assert.equal((Date.parse(dstChart.sensitivity.utcInterval[1])-Date.parse(dstChart.sensitivity.utcInterval[0]))/3600000,25);
assert.equal(dstChart.sensitivity.referenceClock.kind,'provided-civil-reference');
assert.throws(()=>W.compute({...dstInput,civil:{...dstInput.civil,disambiguation:''}}),/兩次/);
assert.throws(()=>W.compute({...dstInput,civil:{...dstInput.civil,disambiguation:'later'}}),/不一致/);
assert.throws(()=>W.compute({...dstInput,utc:'2024-03-10T07:30:00Z',civil:{date:'2024-03-10',time:'02:30',timezone:'America/New_York'}}),/不存在/);
assert(ctx.JYWesternPrompt.build(chart,{question:'工作有什麼格局？'}).includes('十星盤形與最小涵蓋弧'));
// Exercise the actual Western page renderer with one chart feeding both the
// native output and its visible HTML. No browser or network is needed here.
const uiSource=fs.readFileSync(path.join(js,'western-standalone.js'),'utf8');
const hook='root.JYWesternUI=Object.freeze(';
assert(uiSource.includes(hook));
const holder={innerHTML:''};
ctx.document={getElementById:id=>id==='wx-panel-planets'?holder:null};
vm.runInContext(uiSource.replace(hook,'root.__auditRenderPlanets=function(c){chart=c;renderPlanets();}; '+hook),ctx);
ctx.__auditRenderPlanets({...chart,chartShapes:shapes([350,0,10,20,30,40,50,60,70,80])});
assert(holder.innerHTML.includes('data-wx-shape-facts'));
assert(holder.innerHTML.includes('目前核定 集中形 Bundle'));
assert(holder.innerHTML.includes('最小涵蓋弧 90°'));
ctx.__auditRenderPlanets({...chart,chartShapes:shapes([0,36,72,108,144,180,216,252,288,324])});
assert(holder.innerHTML.includes('目前未符合已核定'));
assert(!holder.innerHTML.includes('目前核定 集中形'));
ctx.__auditRenderPlanets({...noClock,chartShapes:{...noClock.chartShapes,matched:[{name:'<script>不可信格名</script>'}]}});
assert(holder.innerHTML.includes('出生時間不詳時，月亮位置可能改變盤形邊界'));
assert(!holder.innerHTML.includes('<script>不可信格名</script>'));
const vedicChart=V.compute(natal),vedicPromptData=ctx.JYVedicPrompt.data(vedicChart,'career');
const vedicText=ctx.JYVedicPrompt.build('事業有什麼格局？',vedicChart);
assert(vedicText.includes('Kartari'));
assert.equal(vedicPromptData.specialRules,vedicChart.specialRules);
assert(vedicText.includes('"matchedIds":'));
assert(!vedicText.includes('"matched":'));
assert(vedicPromptData.specialRules.checks.some(x=>x.id==='Bhaaskara'));
console.log('PASS astrology source backed chart patterns, time integrity, and prompt handoff');
