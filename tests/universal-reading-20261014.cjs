'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),acorn=require('acorn');
const {environment,examples}=require('./native-fixtures-20261003.cjs');
const root=path.resolve(__dirname,'..'),checks=[],exportCases=[];
function test(name,fn){fn();checks.push({name,status:'passed'});console.log('PASS '+name);}
console.log('Loading native calculations for all fifteen methods...');
const {ctx:c,load}=environment();['tarot-foundation','golden-dawn-tarot','tarot-reading','tarot-semantic-engine','prompt-brief','prompt-packet'].forEach(load);
const f=examples(c),W=c.JYReadingWorkflow,P=c.JYPromptPacket,Q=c.JY_READING_QUALITY;
test('one current workflow, depth and authoring policy cover fifteen methods',()=>{
 assert.equal(W.version,'2.5.0');assert.equal(Q.readingVersion,'16.0.0');assert.equal(P.version,'20261015prompt26');assert.equal(c.JYNativeDepthContract.version,'20261015depth26');
 assert.equal(W.methods.length,15);assert.equal(Object.keys(c.JYNativeDepthContract.profiles).length,15);
});
const questions=[
 ['career','我要留在原公司還是接受新工作？各自最需要注意什麼？'],
 ['financial_threshold','今年接案收入能達到一百萬元嗎？該注意哪些成本？'],
 ['relationship_action','公司女性工程師會愛上我並與我交往嗎？'],
 ['family_quantity','今生親生子女會有幾個？'],
 ['relocation','搬到另一個城市生活會比較適合我嗎？'],
 ['study','明年轉讀另一個科系，學習與適應會怎麼發展？'],
 ['family_care','如何安排照顧長輩與自己的生活，才不會顧此失彼？'],
 ['recurring_pattern','為什麼每次做重要決定都猶豫，現在最該調整什麼？'],
 ['unfamiliar_request','兩個小組共用一台低溫試驗設備，排程分歧怎麼協調才有進展？'],
 ['compound_request','今年合作案能落實嗎？搬家與進修各該注意什麼？']
];
test('150 actual exports preserve any original request, native evidence and per-task duties',()=>{
 for(const [domain,question]of questions){
  for(const [method,chart]of Object.entries(f.charts)){
   const before=JSON.stringify(chart),prompt=P.build(method,chart,question),packet=P.get(prompt),data=packet.readingData;
   assert(prompt.includes(JSON.stringify(question)),method+' '+domain+' keeps original question');
   assert(prompt.includes('【任意原題的完整解讀任務】'),method+' '+domain+' has no topic whitelist');
   assert(prompt.includes('所有原題都依同一完整解讀流程'),method+' '+domain+' receives universal policy');
   const coverage=data.requestCoverage[0].coverage;
   assert.equal(coverage.sourceQuestion,question);assert.equal(coverage.requirements.sourceQuestion,question);
   assert(coverage.requirements.tasks.length>0);assert(coverage.requirements.tasks.every(t=>t.source&&t.answerRequired));
   assert.equal(coverage.taskCoverage.length,coverage.requirements.tasks.length);
   assert(coverage.candidateEvidenceUnits.length>0,method+' has valid native units');
   assert(coverage.missingEvidence.every(x=>x.haltsOtherEvidence===false));assert(coverage.limitations.every(x=>x.haltsOtherEvidence===false));
   assert.equal(data.sourceCoverage.readableRecords,1);assert.equal(data.failures.length,0);
   assert.equal(JSON.stringify(chart),before,method+' '+domain+' never recasts');assert(prompt.endsWith(W.footer));
   exportCases.push({domain,method,taskCount:coverage.taskCoverage.length,nativeUnitCount:coverage.candidateEvidenceUnits.length,status:'passed'});
  }
  console.log('  '+domain+': fifteen methods passed');
 }
 assert.equal(exportCases.length,150);
});
test('compound tasks and annual reporting remain distinct from precision limits',()=>{
 const q=questions[9][1],plan=W.plan({method:'bazi',question:q});assert(plan.requestRequirements.tasks.length>=2);
 const count=W.plan({method:'name',question:questions[3][1]}).requestRequirements;
 assert(count.precisionLimits.some(x=>x.dimension==='cardinality'&&!x.haltsWholeReading));
 const full=P.build('bazi',f.b,'完整分析2026至2029年，每年工作與感情都要回答');
 assert(full.includes('【逐年／逐期作答覆蓋】'));assert.deepEqual(Array.from(P.get(full).readingData.verificationFacts.requiredYears),[2026,2027,2028,2029]);
});
test('one failed record does not suppress a valid record or fabricate a joint reading',()=>{
 const invalid={...f.tarot,cards:[f.tarot.cards[0],f.tarot.cards[0]]},q='今年工作和感情會怎麼發展？';
 assert.throws(()=>P.build('tarot',invalid,q));
 const text=P.buildMany([{method:'tarot',chart:invalid},{method:'bazi',chart:f.b}],q),d=P.get(text).readingData;
 assert.equal(d.sourceCoverage.requestedRecords,2);assert.equal(d.sourceCoverage.readableRecords,1);assert.equal(d.sourceCoverage.excludedRecords,1);
 assert.equal(d.failures[0].method,'tarot');assert.equal(d.failures[0].status,'excluded-from-synthesis');assert(d.failures[0].reason);
 assert.equal(d.verificationFacts.charts.length,1);assert.equal(d.verificationFacts.charts[0].method,'bazi');assert(text.includes('excluded-from-synthesis'));
 const missing=P.get(P.buildMany([{method:'oracle',chart:undefined},{method:'bazi',chart:f.b}],q)).readingData;
 assert.equal(missing.sourceCoverage.readableRecords,1);assert.equal(missing.sourceCoverage.excludedRecords,1);
 assert.equal(P.forChart(invalid),null,'a rejected record cannot be associated with a valid joint reading');
});
test('multiple charts have unique labels and their own actual annual data',()=>{
 const text=P.buildMany([{method:'bazi',chart:f.b},{method:'bazi',chart:f.bb},{method:'liuren',chart:f.l}],'2026至2029年各自工作會怎麼發展？'),d=P.get(text).readingData;
 assert.equal(new Set(d.requestCoverage.map(x=>x.label)).size,3);
 const duplicate=P.get(P.buildMany([{method:'bazi',chart:f.b,label:'同名資料'},{method:'bazi',chart:f.bb,label:'同名資料'}],'2026至2029年各自工作會怎麼發展？')).readingData;
 assert.equal(new Set(duplicate.requestCoverage.map(x=>x.label)).size,2);
 const annuals=d.sections.filter(x=>x.label.endsWith(' · 大運與所問年度'));assert.equal(annuals.length,2);
 assert.notEqual(JSON.stringify(annuals[0].data.decades),JSON.stringify(annuals[1].data.decades));
 const mixed=P.get(P.buildMany([{method:'bazi',chart:{...f.b,birthTimeUnknown:true}},{method:'liuren',chart:f.l}],questions[0][1])).readingData;
 assert.equal(mixed.sourceCoverage.readableRecords,2);assert(mixed.sections.every(s=>s.label.startsWith('第1份')||s.label.startsWith('第2份')));
});
test('unknown time, incomplete operations and no operations keep honest separate scopes',()=>{
 const a=c.JYNativeAnalysis.analyze('bazi',{...f.b,birthTimeUnknown:true},{question:questions[0][1]});
 assert(a.depthContract.requestCoverage.usableNativeEvidence);assert(a.depthContract.requestCoverage.missingEvidence.length>0);
 const partial=c.JYNativeAnalysis.analyze('ootk',f.ootk,{question:questions[8][1]}).depthContract.requestCoverage;
 assert.equal(partial.candidateEvidenceUnits.length,1);assert(partial.usableNativeEvidence);
 const empty=c.JYNativeAnalysis.analyze('ootk',{operations:{}},{question:questions[8][1]}).depthContract.requestCoverage;
 assert.equal(empty.usableNativeEvidence,false);assert.equal(empty.candidateEvidenceUnits.length,0);assert(empty.taskCoverage.every(t=>t.state==='requires-concrete-input-gap'));
});
test('semantic exceptions and empty output preserve original requests across all exporters',()=>{
 const real=c.JYTarotFoundation;
 for(const failure of [()=>{throw Error('test_parser_unavailable');},()=>null]){
  c.JYTarotFoundation={...real,compileQuestion:failure};
  const q=questions[8][1],p=W.plan({method:'tarot',question:q});
  assert.equal(p.questionModel.status,'original-question-reading-required');assert.equal(p.questionModel.sourceQuestion,q);assert.equal(p.questionModel.validation,null);
  assert.equal(p.questionModel.events[0].grammaticalSubject,null);
  for(const [method,chart]of Object.entries(f.charts)){
   const text=P.build(method,chart,q),d=P.get(text).readingData;assert.equal(d.requestCoverage[0].coverage.sourceQuestion,q);assert.equal(d.sourceCoverage.readableRecords,1);
  }
 }
 c.JYTarotFoundation=real;
});
test('tarot semantic fallback reads recorded positions and still rejects native corruption',()=>{
 const real=c.JYTarotFoundation;c.JYTarotFoundation={...real,compileQuestion:()=>{throw Error('test_semantics_missing');}};load('tarot-semantic-engine');
 const E=c.JYTarotSemanticEngine,q=questions[8][1],cards=f.tarot.cards.concat({...f.cards[48],isUp:true,position:'原來第三個位置'});
 const before=JSON.stringify(cards),contract=E.compileReadingSpec({question:q,spreadId:'three_card',sourceProfile:'rws_reversals',cards});
 assert(contract.validation.ok,JSON.stringify(contract.validation));assert.equal(contract.readingMode,'native-original-question');assert(contract.validation.warnings.includes('query_graph_not_validated'));
 assert.equal(contract.adjudication.executionPlan.passes[0].name,'OriginalQuestionReader');assert.equal(contract.question.originalQuestion,q);assert.equal(JSON.stringify(cards),before);
 assert.equal(E.compileReadingSpec({question:q,spreadId:'three_card',sourceProfile:'rws_reversals',cards:cards.slice(1)}).validation.ok,false);
 assert.equal(E.compileReadingSpec({question:q,spreadId:'three_card',sourceProfile:'invalid_source',cards}).validation.ok,false);
 assert.throws(()=>E.compileReadingSpec({question:q,cards}),/recorded_tarot_method_required/);
 for(const id of ['mathers_21','mathers_horseshoe','fifteen_card']){
  const native=real.getMethod(id),recorded=Array.from({length:native.count},(_,i)=>({...f.cards[i],readingMode:'gd_book_t',position:'原記錄位置'+(i+1)})),p=E.recordedMethodPlan(id,recorded);
  assert.equal(p.protocol.slotMode,native.protocol.slotMode);assert(p.slots.every(s=>s.independentSemanticPosition===false));
  const graph=E.compileReadingSpec({question:q,spreadId:id,sourceProfile:'gd_book_t',cards:recorded});assert(graph.validation.ok,id+' '+JSON.stringify(graph.validation));
 }
 c.JYTarotFoundation=real;load('tarot-semantic-engine');
});
test('retained live API tarot builder continues valid recorded draws when parsing fails',()=>{
 const real=c.JYTarotFoundation;c.JYTarotFoundation={...real,compileQuestion:()=>{throw Error('test_semantics_missing');}};load('tarot-semantic-engine');
 const source=fs.readFileSync(path.join(root,'JS/ai-analysis.js'),'utf8'),ast=acorn.parse(source,{ecmaVersion:'latest'}),fn=ast.body.find(n=>n.type==='FunctionDeclaration'&&n.id.name==='_buildTarotOnlyPayload');
 assert(fn);vm.runInContext(source.slice(fn.start,fn.end),c);
 const q=questions[8][1],drawn=f.tarot.cards.concat({...f.cards[48],isUp:true,position:'第三個位置'}).map(x=>({...x,readingMode:'rws_reversals'}));
 c._jyTarotQuestionText=()=>q;c.SPREAD_DEFS={three_card:{positions:drawn.map(x=>({name:x.position}))}};c.S.tarot={spreadType:'three_card',drawn};
 const payload=c._buildTarotOnlyPayload();assert.equal(payload.semanticContract.readingMode,'native-original-question');assert(payload.semanticContract.validation.ok);assert.equal(payload.tarotData.cards.length,3);
 c.S.tarot={spreadType:'three_card',drawn:[drawn[0],drawn[0],drawn[2]]};assert.throws(()=>c._buildTarotOnlyPayload(),/Duplicate/);
 c.JYTarotFoundation=real;load('tarot-semantic-engine');
});
test('generic review rejects blanket refusal in multiple domains without forcing claims from no data',()=>{
 for(const method of ['bazi','liuren','tarot','astro','name']){
  const question=questions[0][1],sourcePrompt=P.build(method,f.charts[method],question),audit=W.review({method,question,sourcePrompt,answer:'命理無法回答這個問題，請自己決定。'});
  assert(audit.issues.some(x=>x.code==='AVAILABLE_EVIDENCE_AS_WHOLE_REFUSAL'),method);
 }
 const empty=W.review({method:'tarot',question:questions[0][1],answer:'這份資料無法解讀，請提供實際抽牌資料。'});assert(!empty.issues.some(x=>x.code==='AVAILABLE_EVIDENCE_AS_WHOLE_REFUSAL'));
});
test('standalone exports replace cached older guidance and keep the original request contract',()=>{
 const oldP=c.JYPromptPacket,oldQ=c.JY_READING_QUALITY;c.JYPromptPacket=undefined;c.JY_READING_QUALITY={...oldQ,readingVersion:'14.0.0',methodLines:()=>['STALE_TOPIC_ONLY_GUIDE']};
 const text=c.BaziSuiteCore.buildSinglePrompt('general',f.b,{},questions[8][1]);
 assert(text.includes('【任意原題的完整解讀任務】'));assert(text.includes('所有原題都依同一完整解讀流程'));assert(!text.includes('STALE_TOPIC_ONLY_GUIDE'));
 c.JYPromptPacket=oldP;c.JY_READING_QUALITY=oldQ;
});
test('all generated public paths, API and worker carry the same universal policy',()=>{
 const api=fs.readFileSync(path.join(root,'functions/api/ai.js'),'utf8'),worker=fs.readFileSync(path.join(root,'workers/ai-proxy.js'),'utf8');
 assert(api.includes('所有原題都依同一完整解讀流程'));assert(worker.includes(api.trimEnd()));
 for(const name of ['reading-workflow','prompt-packet','prompt-brief','native-depth-contract','native-chart-analysis','tarot-semantic-engine','ai-analysis'])if(fs.existsSync(path.join(root,name+'.js')))assert.equal(fs.readFileSync(path.join(root,name+'.js'),'utf8'),fs.readFileSync(path.join(root,'JS',name+'.js'),'utf8'),name+' mirror');
 const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');assert(sw.includes("CACHE_NAME = 'jy-main-v133'"));assert.equal(sw,fs.readFileSync(path.join(root,'JS/sw.js'),'utf8'));
 assert(fs.readFileSync(path.join(root,'index.html'),'utf8').includes('JS/reading-workflow.js?v=20261015reader26'));
});
const report={release:'20261015reader26',status:'passed',checks,exports:exportCases,originalQuestionFallbackExports:30,scope:'Actual native exporters and retained API payload builder, source integrity and per-task reading requirements. Does not certify an external AI answer or empirical prediction accuracy.'};
if(process.env.JY_UNIVERSAL_REPORT)fs.writeFileSync(process.env.JY_UNIVERSAL_REPORT,JSON.stringify(report,null,2)+'\n');
console.log('Universal25: '+checks.length+' checks and '+exportCases.length+' multi-domain native exports passed.');
