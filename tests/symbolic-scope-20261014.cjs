'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {environment,examples}=require('./native-fixtures-20261003.cjs');
const C=require('../JS/bazi-child-analysis');
const q='今生親生子女會有幾個？',base={dm:'乙',pillars:{year:{gan:'癸',zhi:'亥'},month:{gan:'庚',zhi:'申'},day:{gan:'乙',zhi:'酉'},hour:{gan:'癸',zhi:'未'}},dayun:[{gz:'丙辰',isCurrent:true,window:{start:'2019-05-17T10:49:08Z',endExclusive:'2029-05-17T10:49:10Z'},liuNian:[{year:2026,gz:'丙午'},{year:2027,gz:'丁未'}]}]};
const reports=[];
function test(name,fn){fn();reports.push({name,status:'passed'});console.log('PASS '+name);}
test('source-only example preserves distinct unknown-gender branches',()=>{
 const before=JSON.stringify(base),a=C.compute(base,{question:q});
 assert.equal(JSON.stringify(base),before);assert.equal(a.inputGender,'unprovided');assert.equal(a.genderSource,'not-inferred-from-luck-direction');assert.equal(a.branches.length,2);
 assert.equal(a.query.lifetime,true);assert.equal(a.query.biologicalOnly,true);assert.equal(a.query.countRequested,true);
 const m=a.branches[0],f=a.branches[1];assert.equal(m.targetElement,'金');assert.equal(m.evidenceDirection,'visible-and-rooted-child-symbols');assert.equal(f.targetElement,'火');assert.equal(f.placements.length,1);
 assert.equal(m.count.stage,'冠帶');assert.equal(m.count.tables[0].rawNumber,3);assert.equal(m.count.finalBiologicalTotal,null);assert.equal(f.count.tables.length,0);
 assert.equal(a.hour.relations.find(x=>x.from==='year').harm,false);assert.equal(a.actualBranchPairs.find(x=>x.from==='year'&&x.to==='month').harm,true);
 assert(m.controlCandidates.every(x=>x.effective===null));assert(f.luck.find(x=>x.isCurrent).targetStem);
});
test('known input selects its rule without averaging male/female',()=>{
 const a=C.compute({...base,gender:'male'},{question:q}),b=C.compute({...base,gender:'female'},{question:q});
 assert.equal(a.branches.length,1);assert.equal(a.branches[0].gender,'male');assert.equal(b.branches.length,1);assert.equal(b.branches[0].gender,'female');
});
test('unknown hour removes count and luck built from provisional hour',()=>{
 const a=C.compute({...base,gender:'male',birthTimeUnknown:true},{question:q});assert.equal(a.hourKnown,false);assert.equal(a.hour,null);assert.equal(a.branches[0].count.stage,null);assert.equal(a.branches[0].count.tables.length,0);assert.equal(a.branches[0].luck.length,0);assert(a.branches[0].placements.every(x=>x.pillar!=='hour'));
});
test('absent natal target still inspects genuine supplied luck',()=>{
 const a=C.compute({dm:'甲',gender:'male',pillars:{year:{gan:'甲',zhi:'寅'},month:{gan:'丙',zhi:'午'},day:{gan:'甲',zhi:'寅'},hour:{gan:'乙',zhi:'卯'}},dayun:[{gz:'庚申',liuNian:[]}]},{question:'以後有子女嗎？'});
 assert.equal(a.branches[0].placements.length,0);assert.equal(a.branches[0].evidenceDirection,'absent-natal-check-luck');assert.equal(a.branches[0].luck[0].targetStem,true);
});
test('historical quantity variants and different units remain separate',()=>{
 assert.equal(C.stage('庚','巳'),'長生');assert.equal(C.stage('庚','未'),'冠帶');assert.equal(C.stage('辛','未'),null);
 assert.equal(C.countEntry('ziping-xu','長生').rawNumber,4);assert.equal(C.countEntry('yuanhai','長生').rawNumber,7);
 assert.equal(C.countEntry('ziping-xu','養').historicalRetainedNumber,1);assert.equal(C.countEntry('yuanhai','養').historicalRetainedNumber,2);
 assert.equal(C.countEntry('ziping-xu','墓').rawNumber,null);
});
console.log('Loading full native runtime and all fifteen methods...');
const {ctx:c,load}=environment();['prompt-brief','prompt-packet'].forEach(load);const f=examples(c),W=c.JYReadingWorkflow,P=c.JYPromptPacket,Q=c.JY_READING_QUALITY;
test('fifteen real exports scope precision while preserving topic and facts',()=>{
 assert.equal(W.version,'2.3.0');assert.equal(Q.readingVersion,'14.0.0');let n=0;
 for(const [method,chart]of Object.entries(f.charts)){
  const before=JSON.stringify(chart),prompt=P.build(method,chart,q),p=P.get(prompt),scope=W.plan({method,question:q}).readingScope;
  assert(prompt.includes('精確數字、姓名、日期或他人心意未被測量，只限制那一項精度'),method);
  assert(prompt.includes('【議題線索與精度分開】'),method);assert(prompt.includes('【本題可讀內容與精度界線】'),method);
  assert.equal(scope.topic,'children');assert(scope.precisionLimits.some(x=>x.dimension==='cardinality'&&x.haltsWholeReading===false));
  assert(p.readingData);assert.equal(JSON.stringify(chart),before);assert(prompt.endsWith(W.footer));n++;
 }
 assert.equal(n,15);
});
test('real Bazi export includes input gender, child evidence, rules and source',()=>{
 const prompt=P.build('bazi',f.b,q),p=P.get(prompt),topic=p.readingData.sections.find(s=>s.label==='子女議題實算與數量假定').data;
 assert.equal(topic.inputGender,'male');assert.equal(topic.branches.length,1);assert.equal(topic.branches[0].count.tables[0].rawNumber,3);
 assert(prompt.includes('【命主輸入設定】')&&prompt.includes('gender=male'));assert(prompt.includes('【子女議題實算與數量假定】'));assert(prompt.includes('children-ziping-xu'));
 assert.equal(p.readingData.verificationFacts.charts[0].children.inputGender,'male');
 assert(topic.branches[0].annuals.every(x=>[2026,2027,2028,2029].includes(x.year)));
 const native=c.JYNativeAnalysis.analyze('bazi',f.b,{question:q});assert(native.depthContract.precisionPolicy);assert(c.JYNativeDepthContract.toPrompt(native.depthContract).includes('精度與可讀內容'));
});
test('missing gender/hour do not erase valid structure in full export',()=>{
 const noGender={...f.b,gender:undefined},a=P.get(P.build('bazi',noGender,q)).readingData.sections.find(s=>s.label==='子女議題實算與數量假定').data;
 assert.equal(a.inputGender,'unprovided');assert.equal(a.branches.length,2);
 const unknown={...f.b,birthTimeUnknown:true},prompt=P.build('bazi',unknown,q),b=P.get(prompt).readingData.sections.find(s=>s.label==='子女議題實算與數量假定').data;
 assert.equal(b.hourKnown,false);assert(b.branches[0].placements.length>0);assert.equal(b.branches[0].count.tables.length,0);
});
test('independent calculation audit rejects altered child roles and stage',()=>{
 const a=c.JYNativeAnalysis.analyze('bazi',f.b,{question:q});assert(a.computationAudit.checks.some(x=>x.id==='children-male-stage'&&x.passed));
 const bad=JSON.parse(JSON.stringify(a));bad.children.branches[0].count.stage='衰';assert.equal(c.JYEngineComputationAudit.inspect('bazi',f.b,bad,{question:q}).status,'invalid');
 bad.children.branches[0].count.stage=a.children.branches[0].count.stage;bad.children.actualBranchPairs.find(x=>x.from==='year'&&x.to==='hour').harm=true;assert.equal(c.JYEngineComputationAudit.inspect('bazi',f.b,bad,{question:q}).status,'invalid');
 const incomplete=JSON.parse(JSON.stringify(a));incomplete.children.branches[0].placements.pop();assert.equal(c.JYEngineComputationAudit.inspect('bazi',f.b,incomplete,{question:q}).status,'invalid');
});
test('standalone prompt and stale shared guide keep the new scope and rule pack',()=>{
 const oldP=c.JYPromptPacket,oldQ=c.JY_READING_QUALITY;c.JYPromptPacket=undefined;c.JY_READING_QUALITY={...oldQ,readingVersion:'13.0.0',methodLines:()=>['STALE_NO_READING']};
 const prompt=c.BaziSuiteCore.buildSinglePrompt('general',f.b,{},q);assert(!prompt.includes('STALE_NO_READING'));assert(prompt.includes('子女')&&prompt.includes('jy.bazi-children/1'));assert(prompt.includes('只限制那一項精度'));
 c.JYPromptPacket=oldP;c.JY_READING_QUALITY=oldQ;
});
test('review catches refusal that omits already available child evidence',()=>{
 const sourcePrompt=P.build('bazi',f.b,q),r=W.review({method:'bazi',question:q,sourcePrompt,answer:'無法算出確切人數，請自行決定。'});
 assert(r.issues.some(x=>x.code==='PRECISION_AS_WHOLE_REFUSAL'));
});
test('API and worker share the same new guidance',()=>{
 const root=path.resolve(__dirname,'..'),api=fs.readFileSync(path.join(root,'functions/api/ai.js'),'utf8'),worker=fs.readFileSync(path.join(root,'workers/ai-proxy.js'),'utf8');
 assert(api.includes('能讀的內容要讀完'));assert(api.includes('數量題仍要解惑'));assert(worker.includes(api.trimEnd()));
});
const report={release:'20261014scope24',status:'passed',checks:reports,limits:'Verifies native calculations, exported evidence and authoring instructions; not external AI compliance, medical fertility or prediction accuracy.'};
if(process.env.JY_SCOPE_REPORT)fs.writeFileSync(process.env.JY_SCOPE_REPORT,JSON.stringify(report,null,2)+'\n');
console.log('Scope24: '+reports.length+' checks passed.');
