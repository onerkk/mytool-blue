'use strict';
// Regression assertions concern calculation and data ownership, not predictive accuracy.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),acorn=require('acorn');
const {environment}=require('./dom-fixture.cjs');
const base=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(base,f),'utf8');
const {ctx:c}=environment();c.console={log(){},warn(){},error(){}};
const load=f=>vm.runInContext(read(f),c,{filename:f}),plain=x=>JSON.parse(JSON.stringify(x));
['JS/vendor/lunar.js','JS/bazi-calendar-core.js','JS/solar-location.js','JS/bazi.js','JS/bazi_upgrade.js','JS/bazi-prompt-root.js','JS/bazi-suite-core.js','JS/ziwei-prompt-root.js'].forEach(load);
const constants=read('JS/ai-analysis.js');
for(const n of acorn.parse(constants,{ecmaVersion:'latest'}).body){
 if(n.type==='VariableDeclaration'&&n.declarations.some(d=>['SIHUA_TABLE','ZW_PALACES','ZW_MAJOR','ZW_BRIGHTNESS'].includes(d.id.name))||n.type==='FunctionDeclaration'&&n.id.name==='getStarBright')vm.runInContext(constants.slice(n.start,n.end),c);
}
['JS/ziwei.js','JS/ziwei-standalone.js','JS/relationship-core.js','JS/relationship-ui.js'].forEach(load);
const reference='2026-09-17T02:00:00Z';
const ai={year:1983,month:8,day:25,hour:14,minute:55,gender:'male',location:{longitude:120.23,timezone:8,timezoneId:'Asia/Taipei'}};
const bi={year:1994,month:6,day:20,hour:23,minute:26,gender:'female',location:{longitude:120.54,timezone:8,timezoneId:'Asia/Taipei'}};
const api=c.JYRelationshipCore,A=api.calculatePerson(ai,reference),B=api.calculatePerson(bi,reference);
let groups=0;
function test(name,fn){try{fn();groups++;console.log('PASS '+name);}catch(e){process.exitCode=1;console.error('FAIL '+name+'\n'+e.stack);}}
function cast(y,m,d,h,minute=0,opts={}){return c.computeZiwei(y,m,d,h,'male',{minute,referenceDate:reference,...opts});}
function signature(z){return z.palaces.map(p=>[p.name,p.branch,p.stars.filter(s=>s.type==='major').map(s=>s.name).join('/')]).join('|');}
test('1983 reference: actual minute, natal palaces, transformations and 2026–2029 positions',()=>{
 assert.equal(A.birthInput.civilTime,'14:55');assert.equal(A.birthInput.representativeTime,'14:00');assert.equal(A.birthInput.hourBranch,'未');
 assert.equal(A.palaces.find(p=>p.isMing).branch,'丑');assert.equal(A.palaces.find(p=>p.isShen).name,'福德');
 assert.deepEqual(Array.from(A.palaces.find(p=>p.name==='夫妻').stars.filter(s=>s.type==='major'),s=>s.name),['武曲','破軍']);
 assert.deepEqual(Array.from(A.sihua,h=>h.star),['破軍','巨門','太陰','貪狼']);
 const dx=A.daXian.find(d=>d.isCurrent);assert.equal(dx.ageStart,44);assert.equal(dx.ageEnd,53);assert.equal(dx.branch,'酉');
 assert.deepEqual([2026,2027,2028,2029].map(y=>A.getLiuNianZw(y).mingPalace),['交友','遷移','疾厄','財帛']);
});
test('1994 late Zi: current is June 20, explicit local 23-hour policy advances to June 21',()=>{
 assert.equal(B.birthInput.civilTime,'23:26');assert.equal(B.calculationPolicy.dayDivide,'current');
 assert.equal(B.calculationPolicy.effectiveCivilDate,'1994-06-20');
 const current=c.computeZiwei(1994,6,20,0,'female',{minute:26,referenceDate:reference});
 assert.equal(signature(B),signature(current));
 const forward=c.computeZiwei(1994,6,20,23,'female',{minute:26,dayDivide:'forward',referenceDate:reference});
 const next=c.computeZiwei(1994,6,21,0,'female',{minute:26,referenceDate:reference});
 assert.equal(signature(forward),signature(next));assert.notEqual(signature(B),signature(next));
 assert.equal(forward.birthInput.civilDate,'1994-06-20');assert.equal(forward.calculationPolicy.effectiveCivilDate,'1994-06-21');
});
test('Minute boundaries remain traceable: 14:59 / 15:01, 22:59 / 23:01, midnight',()=>{
 for(const [h,m,branch]of [[14,59,'未'],[15,1,'申'],[22,59,'亥'],[23,1,'子'],[0,0,'子']]){
  const z=cast(1983,8,25,h,m);assert.equal(z.birthInput.hourBranch,branch);assert.equal(z.birthInput.civilTime,String(h).padStart(2,'0')+':'+String(m).padStart(2,'0'));
 }
 assert.notEqual(signature(cast(1983,8,25,14,59)),signature(cast(1983,8,25,15,1)));
 const shichen=c.computeZiwei(1983,8,25,14,'male',{timePrecision:'shichen',btime:'14:00',referenceDate:reference});
 assert.equal(shichen.birthInput.civilTime,null);assert.equal(shichen.birthInput.minute,null);
});
test('Leap month day 15/16 follows explicit fixLeap, lunar New Year follows Taipei midnight',()=>{
 const before=cast(2023,4,5,12),after=cast(2023,4,6,12),split=cast(2023,4,6,12,0,{fixLeap:true});
 assert.equal(before.birthLunar.isLeap,true);assert.equal(before.birthLunar.day,15);assert.equal(after.birthLunar.day,16);
 assert.equal(after.calculationPolicy.effectiveMonth,2);assert.equal(split.calculationPolicy.effectiveMonth,3);
 assert.equal(after.calculationPolicy.fixLeap,false);
 const early=cast(1983,8,25,14,55,{referenceDate:'2026-02-16T15:59:59Z'}),late=cast(1983,8,25,14,55,{referenceDate:'2026-02-16T16:00:00Z'});
 assert.equal(early.calculationPolicy.referenceLunarYear,2025);assert.equal(late.calculationPolicy.referenceLunarYear,2026);assert.equal(late.currentAge,early.currentAge+1);
});
test('Conflicting policies and mismatched birth minutes stop calculation',()=>{
 for(const opts of [{dayDivide:'current',dayBoundaryMode:'ZI_HOUR_23'},{fixLeap:false,leapMonthPolicy:'SPLIT_AT_15'},{minute:60},{civilTime:'15:55'},{civilTime:'14:56'},{dayDivide:'other'},{trueSolarTime:true},{yearDivide:'exact'}])assert.equal(cast(1983,8,25,14,55,opts),null);
});
test('AI facts contain no heuristic scores/levels/themes; geometry and flight origins remain exact',()=>{
 const facts=A.calculatedFacts;
 function visit(x){if(!x||typeof x!=='object')return;for(const [k,v] of Object.entries(x)){assert(!['score','level','theme','notes','starComboNotes'].includes(k),'heuristic leaked: '+k);visit(v);}}
 visit(facts);assert(facts.patternAssessment.patterns.every(p=>['structural','variant-structure'].includes(p.status)&&p.checks.every(c=>c.passed))); 
 const spouse=facts.sanFangSiZheng.find(p=>p.palace==='夫妻');assert.equal(spouse.opposite.branch,'巳');assert.deepEqual(Array.from(spouse.trines,p=>p.branch),['卯','未']);
 const self=facts.palaceFlights.find(h=>h.sourcePalace==='夫妻'&&h.hua==='化祿');assert.equal(self.star,'破軍');assert.equal(self.targetPalace,'夫妻');assert.equal(self.selfTransformation,'CENTRIFUGAL');assert.equal(self.sourceType,'NATAL_PALACE_STEM');
 const text=c.JYZiweiData.serialize(A,{bdate:'1983-08-25',btime:'14:55',timePrecision:'minute',gender:'male'});
 assert(text.includes('14:55'));assert(text.includes('14:00'));assert(text.includes('計算政策'));assert(!/〔(?:大吉|中凶|小凶|吉)〕/.test(text));assert(!text.includes('理財重點期'));
 assert(c.JY_ZIWEI_PROMPT_ROOT.composeHead().includes('不只一個'));
});
test('Cross-chart projections follow the receiving chart; natal state is never overwritten',()=>{
 const original=JSON.stringify([A.calculatedFacts,B.calculatedFacts]);
 const pair=api.createZiweiPair(A,B,{scenarioId:'marriage'});
 assert.equal(pair.overlays.length,12);assert.equal(pair.directions.length,2);
 for(const d of pair.directions){
  const target=d.targetPerson==='A'?A:B,source=d.sourcePerson==='A'?A:B;
  assert.equal(d.birthStemProjection.length,4);assert.equal(d.palaceStemProjection.length,16);
  for(const row of [...d.birthStemProjection,...d.palaceStemProjection]){
   const actual=target.palaces.find(p=>p.stars.some(s=>s.name===row.star));assert.equal(actual.name,row.targetPalace);assert.equal(actual.branch,row.targetBranch);
   if(row.sourceType==='PARTNER_YEAR_STEM_PROJECTION')assert.equal(row.stem,source.yGan);
  }
 }
 assert.equal(JSON.stringify([A.calculatedFacts,B.calculatedFacts]),original);
 const swapped=api.createZiweiPair(B,A,{scenarioId:'marriage'});
 assert.deepEqual(Array.from(pair.directions[0].birthStemProjection,h=>[h.star,h.hua,h.targetPalace]),Array.from(swapped.directions[1].birthStemProjection,h=>[h.star,h.hua,h.targetPalace]));
});
test('Both participants use the same annual windows; each decade is selected for the target year',()=>{
 const pair=api.createZiweiPair(A,B,{});assert.deepEqual(Array.from(pair.timeline,t=>t.year),[2026,2027,2028,2029]);
 assert.equal(pair.timeline[0].window.start,'2026-02-17T00:00:00+08:00');
 for(const t of pair.timeline)for(const [id,chart]of [['a',A],['b',B]]){
  const x=t[id];assert.equal(x.nominalAge,t.year-chart.lunar.year+1);assert(x.nominalAge>=x.decade.ageStart&&x.nominalAge<=x.decade.ageEnd);assert.equal(x.annual.year,t.year);
 }
 const laterA=api.calculatePerson(ai,'2034-09-17T00:00:00Z'),laterB=api.calculatePerson(bi,'2034-09-17T00:00:00Z');
 const future=api.createZiweiPair(laterA,laterB,{});assert.equal(future.timeline.find(t=>t.year===2035).a.decade.ageStart,44);assert.equal(future.timeline.find(t=>t.year===2036).a.decade.ageStart,54);
 assert.throws(()=>api.createZiweiPair(A,laterB,{}),/參考時刻不一致/);
});
test('Unknown time never creates a noon Ziwei chart, false overlays, or projected transformations',()=>{
 assert.equal(api.calculatePerson({...bi,unknown:true},reference),null);
 const partial=api.createZiweiPair(A,null,{});assert.equal(partial.status,'partial');assert.equal(partial.personB,null);assert.equal(partial.directions.length,0);assert.equal(partial.overlays.length,0);assert(partial.timeline.every(t=>t.b===null));
 const empty=api.createZiweiPair(null,null,{});assert.equal(empty.timeline.length,0);assert.equal(empty.personA,null);
});
test('All eight scenarios retain role focus, complete prompts and one material recommendation ending',()=>{
 const ba=c.computeBazi(1983,8,25,14,55,'male',{referenceDate:reference}),bb=c.computeBazi(1994,6,20,23,26,'female',{referenceDate:reference});c.enhanceBazi(ba);c.enhanceBazi(bb);
 for(const scenario of c.BaziSuiteCore.scenarios){
  const comp=c.BaziSuiteCore.createCompatibility(ba,bb,{scenarioId:scenario.id});const pair=api.createZiweiPair(A,B,{scenarioId:scenario.id});
  const prompt=api.buildPrompt(comp,pair,'子題一？\n子題二？');
  assert(prompt.includes('子題一？\\n子題二？'));assert(prompt.includes(scenario.roleA));assert(prompt.includes(scenario.roleB));
  for(const marker of ['A方八字','B方八字','A方紫微','B方紫微','雙向跨盤引動','紫微同期大限與流年','午夜','婚姻次數','不只一個'])assert(prompt.includes(marker),marker);
  assert.equal(prompt.split('[靜月之光蝦皮賣場]').length-1,1);
  assert(prompt.length<65000,'Avoid redundant period JSON overwhelming the combined prompt');
  const complete=api.dataBlock(pair);
  for(const facts of [pair.personA,pair.personB]){
   for(const rule of facts.patternAssessment.catalog){assert(complete.includes(rule.id),rule.id);for(const check of rule.checks)assert(complete.includes((check.passed?'✓':'×')+check.label),rule.id+' check');}
   for(const rule of facts.patternAssessment.patterns){assert(prompt.includes(rule.status));if(rule.variant)assert(prompt.includes(rule.variant));for(const list of [rule.evidence,rule.support,rule.modifiers])for(const w of list)assert(prompt.includes(w.palace+'('+w.branch+') '+w.star));}
  }
  for(const chart of [ba,bb])for(const rule of chart.specialRuleAssessment.rules){const exported=rule.status==='not-established'?c.BaziSuiteCore.buildChartDataBlock(chart,{}):prompt;assert(exported.includes(rule.id));assert(exported.includes(rule.status));for(const evidence of rule.evidence||[])assert(exported.includes(typeof evidence==='string'?evidence:JSON.stringify(evidence)));}
  for(const facts of [pair.personA,pair.personB])for(const flight of facts.palaceFlights)assert(prompt.includes(flight.star+flight.hua+'→'+flight.targetPalace+'('+flight.targetBranch+')'));
  assert(!/undefined|NaN|\[object Object\]/.test(prompt));
  if(scenario.id==='business')assert(!pair.focusPalaces.includes('夫妻'));
 }
});
console.log('Relationship policy / integration: '+groups+' groups passed.');
