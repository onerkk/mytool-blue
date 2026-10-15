'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),F=require('../JS/tarot-foundation.js'),W=require('../JS/reading-workflow.js');
const raw='我經濟壓力還是才會消失，我副業何時才能每月營業額淨賺10萬？';
const checks=[];function test(name,fn){fn();checks.push({name,status:'passed'});console.log('PASS '+name);}
test('raw financial question preserves two original events, monthly net target, ambiguity and unknown currency',()=>{
 const p=W.plan({method:'vedic',question:raw}),t=p.requestRequirements.tasks;
 assert.equal(p.question,raw);assert.equal(t.length,2);assert.deepEqual(t.map(x=>x.goal),['timing','timing']);assert(t.every(x=>x.eventIds.length===1&&x.requiredObservables.length));
 assert.equal(t[0].source,'我經濟壓力還是才會消失');assert.equal(t[1].source,'我副業何時才能每月營業額淨賺10萬');
 for(const x of t)assert.equal(raw.slice(...x.sourceSpan),x.source);
 const m=t[1].measurement[0];assert.equal(m.threshold.value,100000);assert.equal(m.basis,'net_profit');assert.equal(m.cadence,'monthly');assert.equal(m.currency,null);assert.equal(m.recurrence.oneOffIsInsufficient,true);assert.equal(m.recurrence.consecutivePeriods,null);
 assert.equal(m.ambiguity.userConfirmed,false);assert.notEqual(p.questionModel.status,'validated_atomized');
 assert(p.questionModel.unresolved.ambiguities.some(x=>x.type==='suspected_timing_typo'));assert(p.requestRequirements.precisionLimits.some(x=>x.dimension==='threshold_verification'&&!x.haltsWholeReading));assert.equal(p.reportScope.monthlyRequested,false);
});
test('punctuation and fullwidth amounts do not lose event IDs or change original source spans',()=>{
 for(const separator of ['，',',','；',';','？','?','\n']){
  const q='我財務何時改善'+separator+'我副業何時每月淨賺１０萬？',p=W.plan({method:'vedic',question:q});
  assert.equal(p.tasks.length,2,q);assert(p.requestRequirements.tasks.every(t=>t.eventIds.length===1),q);
  const t=p.requestRequirements.tasks[1];assert.equal(t.measurement[0].threshold.value,100000,q);assert.equal(q.slice(...t.sourceSpan),t.source,q);
 }
});
test('genuine comparisons and mixed timing/choice tasks keep their separate operators',()=>{
 const single=W.plan({method:'vedic',question:'我該繼續正職還是離職做副業？'});assert.equal(single.tasks.length,1);assert.equal(single.tasks[0].goal,'compare');assert(!single.questionModel.unresolved.ambiguities.some(x=>x.type==='suspected_timing_typo'));
 const p=W.plan({method:'vedic',question:'副業何時能每月淨賺10萬，該繼續正職還是離職？'});assert.deepEqual(p.tasks.map(x=>x.goal),['timing','compare']);assert.equal(p.requestRequirements.tasks[0].measurement[0].threshold.value,100000);
 const condition=W.plan({method:'vedic',question:'如果副業明年能每月淨賺10萬，我是否該離職？'});assert.equal(condition.tasks.length,1,'conditional premise is not an independent forecast');assert.equal(condition.requestRequirements.tasks[0].measurement.length,0,'premise must not replace the requested decision');assert(condition.questionModel.events[0].conditions.some(x=>x.includes('如果')));
});
test('separate thresholds have unique relations and preserve amount, cadence, currency and target basis',()=>{
 const q='我收入何時超過5萬？我副業何時每月淨賺10萬美元？',c=F.compileQuestion(q),p=W.plan({method:'vedic',question:q});
 assert.equal(new Set(c.relations.map(x=>x.id)).size,2);
 assert.deepEqual(p.requestRequirements.tasks.map(x=>x.measurement[0].threshold.value),[50000,100000]);assert.equal(p.requestRequirements.tasks[1].measurement[0].currency,'美元');
 assert(c.queryGraph.roundTripReconstruction.includes('每月'));assert(c.queryGraph.roundTripReconstruction.includes('美元'));assert.equal(c.queryGraph.validation.semanticTruthVerified,false);assert.equal(c.queryGraph.validation.humanReviewPerformed,false);
 const comparison=W.plan({method:'vedic',question:'每月營收達10萬和每月淨利達10萬，哪個較早？'}),t=comparison.requestRequirements.tasks[0];
 assert.equal(t.goal,'compare');assert.deepEqual(t.measurement.map(x=>x.basis),['revenue','net_profit']);assert(t.requiredObservables.includes('temporal_sequence'));assert(t.requiredObservables.includes('continuity'));
 const unsupported=F.compileQuestion('我每月營收達10萬和淨利達5萬，情況怎麼樣？');assert.equal(unsupported.queryGraph.validation.measuredTargetsPreserved,false);assert.notEqual(unsupported.queryGraph.compilerStatus,'validated_atomized','unrepresented multiple targets must not be certified');
});
test('financial pressure selects money/work layers, health wording selects health layers, unknown topics remain readable',()=>{
 const f=W.nativeFocus({method:'vedic',question:raw});assert.deepEqual(f.divisions,[1,2,9,10]);assert(!f.domains.includes('health'));assert(f.houses.includes(2)&&f.houses.includes(11)&&f.houses.includes(10));
 assert.deepEqual(W.nativeFocus({method:'vedic',question:'經濟壓力何時減輕？'}).divisions,[1,2,9]);
 assert(W.nativeFocus({method:'vedic',question:'身體健康與睡眠狀況如何？'}).divisions.includes(6));
 assert.equal(W.nativeFocus({method:'vedic',question:'兩個小組共用一台低溫設備，排程分歧該如何協調？'}).classificationIsWhitelist,false);
 assert.equal(W.plan({method:'vedic',question:'請逐月分析每月工作運勢'}).reportScope.monthlyRequested,true);
});

const {environment,examples}=require('./native-fixtures-20261003.cjs'),{ctx:c,load}=environment();
load('tarot-foundation');load('reading-workflow');const fixture=examples(c);
['prompt-packet','prompt-brief'].forEach(load);
test('all fifteen actual exporters retain both tasks and provide method-specific source/decision checks without recasting',()=>{
 for(const [method,chart]of Object.entries(fixture.charts)){
  const before=JSON.stringify(chart),prompt=c.JYPromptPacket.build(method,chart,raw),d=c.JYPromptPacket.get(prompt).readingData,coverage=d.requestCoverage[0].coverage,basis=coverage.caseBasis;
  assert.equal(coverage.requirements.tasks.length,2,method);assert.equal(coverage.requirements.tasks[1].measurement[0].threshold.value,100000,method);assert.equal(basis.method,method);assert(basis.paths.length&&basis.comparisonChecks.length,method);
  assert.equal(basis.humanPractitionerPerformed,false);assert.equal(basis.predictionValidated,false);assert.equal(basis.research.runtimeBrowsingPerformed,false);assert(basis.research.sourceLog.length,method);
  assert.equal(JSON.stringify(chart),before,method);assert(!prompt.includes('【原創成稿示範｜只學鋪陳，不是本次資料】'),method+' has no hypothetical scenario pollution');
  assert(prompt.includes('不得捏造查網'),method);assert(prompt.includes('未實作算法需補程式'),method);assert(prompt.includes('每月淨賺'),method);
  assert.equal((prompt.match(/【任意原題的完整解讀任務】/g)||[]).length,1,method+' task contract appears once');
 }
});
test('Vedic focused export includes actual D2/D10 detail and role directions from the source chart',()=>{
 const p=c.JYPromptPacket.build('vedic',fixture.v,raw),d=c.JYPromptPacket.get(p).readingData,b=d.requestCoverage[0].coverage.caseBasis;
 assert.deepEqual(Array.from(b.focus.divisions),[1,2,9,10]);assert(!b.divisionChecks.some(x=>x.division===27));
 assert(b.divisionChecks.find(x=>x.division===2).available);assert(b.divisionChecks.find(x=>x.division===10).available);
 const second=b.topicRoles.find(x=>x.topicHouse===2);assert.equal(second.lord,'Saturn');assert.equal(second.lordOccupies,11);assert(second.incomingAspects.some(x=>x.from==='Mars'));assert.equal(second.sourcePaths[1],'planets.Saturn');
 const eleventh=b.topicRoles.find(x=>x.topicHouse===11);assert.equal(eleventh.lord,'Venus');assert.equal(eleventh.solar.combust,true);
 assert(b.currentPeriodChecks.some(x=>x.lord==='Mercury'&&x.vargaHouses.some(v=>v.division===10)));
 const scope=d.sections.find(s=>s.label==='分盤分析範圍').data;assert.deepEqual(Array.from(scope.detailedDivisions),[1,2,9,10]);
 for(const label of ['八分法所有分盤','行運逐項核算','Jaimini與特殊點']){
  const detail=d.sections.find(s=>s.label===label)?.data?.vargas;assert(detail,label+' detail exists');assert(detail['2']&&detail['10'],label+' includes actual D2 and D10 records');assert(!detail['27'],label+' does not select the unrelated stress layer');
 }
 fs.writeFileSync(path.join(root,'docs/qa-reader26/financial-question-prompt.txt'),p);
 fs.writeFileSync(path.join(root,'docs/qa-reader26/financial-question-contract.json'),JSON.stringify({requirements:d.requestCoverage[0].coverage.requirements,caseBasis:b},null,2));
});
test('source metadata distinguishes this release readings, bibliography-only evidence and unrechecked prior sources',()=>{
 const sources=c.JYNativeRuleSources.all(),name=sources.find(x=>x.id==='namebook');assert.equal(name.reader26VerificationLevel,'bibliography-only');
 assert(sources.some(x=>x.id==='meihuafinance26'&&x.reader26VerificationLevel==='specified-passage-read'));
 assert(sources.some(x=>!x.reader26VerificationLevel),'prior source reviews are not silently relabelled as this round');
 assert.equal(c.JYNativeDepthContract.build('personality',fixture.profile,c.JYNativeAnalysis.analyze('personality',fixture.profile,{question:raw}),{question:raw}).allSchoolsComplete,false);
});
test('an older cached depth module is replaced by the generated standalone export runtime',()=>{
 const old=c.JYNativeDepthContract;c.JYNativeDepthContract={version:'20261014depth25'};
 load('prompt-export');assert.equal(c.JYNativeDepthContract.version,'20261015depth26');assert.equal(typeof c.JYNativeDepthContract.nativeBasis,'function');
 c.JYNativeDepthContract=old;
});
const report={release:'20261015reader26',checks,methodCount:15,status:'passed',limitations:['No external-model answer generated or human practitioner review performed','No claim of complete historical schools or validated forecast accuracy','Published passage checks and book metadata remain distinct']};
fs.writeFileSync(path.join(root,'docs/qa-reader26/reader-contract-validation.json'),JSON.stringify(report,null,2));console.log('Reader26: '+checks.length+' substantive checks passed.');
