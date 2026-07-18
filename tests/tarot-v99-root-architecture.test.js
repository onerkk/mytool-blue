'use strict';
const assert=require('assert');
const fs=require('fs');
const path=require('path');
const cp=require('child_process');
const vm=require('vm');
const ROOT=path.resolve(__dirname,'..');
const F=require(path.join(ROOT,'JS/tarot-foundation.js'));
const E=require(path.join(ROOT,'JS/tarot-semantic-engine.js'));
require(path.join(ROOT,'JS/golden-dawn-tarot.js'));
require(path.join(ROOT,'JS/tarot-inventory.js'));
const G=global.JYGoldenDawn;
const I=global.JYShopInventory;
let passed=0;
function test(name,fn){try{fn();passed++;console.log('✓',name);}catch(e){console.error('✗',name,'\n ',e.stack||e);process.exitCode=1;}}
function route(q){return F.routeQuestion(q,{referenceDate:'2026-07-18T12:00:00+08:00'});}
function atomKinds(c){return c.queryGraph.requiredAtoms.map(a=>a.kind);}
function dummyCards(plan,names){return names.map((name,i)=>({name,position:plan.slots[i].label,positionMeaning:plan.slots[i].label,semanticCandidates:['Book T candidate'],sourceGloss:'Book T source',sourceCore:'Book T source'}));}
function vmContext(payloadBuilderName,payload,question){
 const context={console,window:null,self:null,globalThis:null,S:{form:{question}},navigator:{clipboard:{writeText:()=>Promise.resolve()}},setTimeout,clearTimeout,Date,JSON,Math,RegExp,String,Number,Array,Object,Error,Promise,document:{getElementById:()=>null,querySelector:()=>null,createElement:()=>({style:{},setAttribute(){},appendChild(){},select(){},querySelectorAll(){return[];}}),body:{appendChild(){},removeChild(){}},execCommand(){return true}},JYTarotFoundation:F,JYTarotSemanticEngine:E};
 context[payloadBuilderName]=()=>payload;context.window=context;context.self=context;context.globalThis=context;vm.createContext(context);vm.runInContext(fs.readFileSync(path.join(ROOT,'JS/prompt-export.js'),'utf8'),context);return context;
}

// Registry and version coherence
test('v99.2 foundation and semantic registry validate',()=>{
 assert.equal(F.VERSION,'99.2.0');assert.equal(F.SCHEMA,'jy.tarot.foundation/4');
 assert.equal(E.VERSION,'99.2.0');assert.equal(E.SCHEMA,'jy.tarot.semantic-contract/7');
 assert.deepEqual(F.validateMethodRegistry(),{ok:true,errors:[]});
});
test('Every registered spread declares typed slots and observable capabilities',()=>{
 Object.values(F.METHODS).forEach(m=>{assert(Array.isArray(m.provides));assert(Array.isArray(m.slots));m.slots.forEach(s=>assert(s.authority&&s.role));});
});

// Compound question, unknown-person coreference and measurement boundaries
test('Compound love question preserves two events and does not misclassify excluded current partner as a known dyad',()=>{
 const q='今年會有非現任的肉體桃花嗎？她幾歲？',r=route(q),c=r.compiledQuestion,g=c.queryGraph;
 assert.equal(r.spreadId,'five_card');assert.equal(c.features.shape,'bounded_yes_no');assert.equal(c.features.knownDyad,false);assert.equal(c.features.unknownPerson,true);
 assert.equal(g.compilerStatus,'validated_atomized');assert.equal(g.validation.roundTripCompatible,true);assert.equal(g.validation.everyDeletionChangesTruthConditions,true);assert.equal(g.validation.noAddedPremise,true);assert.equal(g.validation.subquestionCountPreserved,true);
 assert.equal(g.events.length,2);assert.equal(g.events[0].shape,'bounded_yes_no');assert.equal(g.events[1].type,'person_attribute_query');assert.equal(g.events[1].roles.attribute,'age');
 const corefs=g.relations.filter(x=>x.type==='conditional_coreference');assert.equal(corefs.length,1);assert.equal(corefs[0].fromEventId,'QUERY_EVENT_02');assert.equal(corefs[0].toEventId,'QUERY_EVENT');
 assert(c.unsupportedDimensions.includes('exact_age'));assert(!g.requiredAtoms.some(a=>a.text===c.originalQuestion));
 assert(atomKinds(c).includes('exclusion'));assert(g.requiredAtoms.some(a=>a.kind==='exclusion'&&/非現任/.test(a.text)));
});
test('Known relationship remains a dyad while its age follow-up stays independently unmeasured',()=>{
 const r=route('我和前任的關係如何？他幾歲？'),g=r.compiledQuestion.queryGraph;
 assert.equal(r.spreadId,'relationship');assert.equal(r.compiledQuestion.features.knownDyad,true);assert.equal(g.events.length,2);assert.equal(g.events[1].roles.attribute,'age');assert(r.compiledQuestion.unsupportedDimensions.includes('exact_age'));
});
test('Identity and occupation ellipsis become separate person-attribute events',()=>{
 const r=route('未來會有新對象嗎？他是誰？做什麼工作？'),g=r.compiledQuestion.queryGraph;
 assert.equal(g.events.length,3);assert.deepEqual(g.events.map(e=>e.roles.attribute).filter(Boolean),['identity','occupation']);
 assert.equal(g.relations.filter(x=>x.type==='conditional_coreference').length,2);
 assert(r.compiledQuestion.unsupportedDimensions.includes('identity'));assert(r.compiledQuestion.unsupportedDimensions.includes('person_attribute'));
});
test('Target contract is partial only because exact age is unmeasured',()=>{
 const q='今年會有非現任的肉體桃花嗎？她幾歲？',r=route(q);
 const cards=dummyCards(r.methodPlan,['權杖九','命運之輪','權杖十','寶劍五','金幣皇后']);
 const c=E.compileReadingSpec({question:q,spreadId:r.spreadId,methodPlan:r.methodPlan,cards,referenceDate:'2026-07-18'});
 assert.equal(c.answerabilityGate.status,'partial');assert.deepEqual(c.answerabilityGate.unmeasuredDimensions,['exact_age']);assert.deepEqual(c.answerabilityGate.missingDimensions,[]);assert.equal(c.validation.ok,true);
 const age=c.capabilityMatrix.find(x=>x.dimensionId==='exact_age');assert(age&&!age.canAnswer&&age.precheckStatus==='not_measured');
 const result=c.capabilityMatrix.find(x=>x.observableId==='bounded_outcome');assert(result&&result.canAnswer);
});

// Query typing and spread routing
test('User-provided fixed numeric threshold remains a condition, not a predicted amount',()=>{
 const r=route('今年營業額能超過100萬嗎？'),c=r.compiledQuestion,rel=c.relations[0];
 assert.equal(r.spreadId,'five_card');assert.equal(rel.type,'fixed_numeric_threshold');assert.equal(rel.thresholdValue,1000000);assert.equal(rel.metric,'營業額');assert.equal(rel.subject,'問卜者本人');
 ['actor','subject','measured_attribute','comparator','threshold_value','query_operator','modality','scope'].forEach(k=>assert(atomKinds(c).includes(k),k));
 assert(!c.unsupportedDimensions.includes('exact_value'));assert(/門檻結果/.test(r.methodPlan.slots[4].label));
});
test('Exact amount request is still explicitly unmeasured',()=>{assert(route('今年營業額會是多少錢？').compiledQuestion.unsupportedDimensions.includes('exact_value'));});
test('Entity comparisons and natural alternative phrasings keep both operands',()=>{
 let r=route('副業能成功超過正職嗎？');assert.equal(r.spreadId,'either_or');assert.equal(r.compiledQuestion.relations[0].left,'副業');assert.equal(r.compiledQuestion.relations[0].right,'正職');assert.equal(r.compiledQuestion.relations[0].scale,'成功程度');
 r=route('A或B哪個好？');assert.equal(r.spreadId,'either_or');assert.equal(r.compiledQuestion.relations[0].left,'A');assert.equal(r.compiledQuestion.relations[0].right,'B');
 r=route('留任和離職哪個比較適合？');assert.equal(r.spreadId,'either_or');assert.equal(r.compiledQuestion.relations[0].left,'留任');assert.equal(r.compiledQuestion.relations[0].right,'離職');
 r=route('副業比正職收入高嗎？');assert.equal(r.compiledQuestion.relations[0].scale,'收入');assert.equal(r.compiledQuestion.relations[0].right,'正職');
});
test('Known relationship, health risk and bounded investment questions classify correctly',()=>{
 let r=route('這段關係要不要繼續？');assert.equal(r.spreadId,'relationship');assert.equal(r.compiledQuestion.features.shape,'dyad');
 r=route('我是否罹患癌症？');assert.equal(r.compiledQuestion.features.yesNo,true);assert.equal(r.compiledQuestion.features.highRisk,true);assert(r.compiledQuestion.riskDomains.includes('health'));
 r=route('未來三個月投資會賺錢嗎？');assert.equal(r.spreadId,'five_card');assert.equal(r.compiledQuestion.features.shape,'bounded_yes_no');assert(/未來三個月/.test(r.methodPlan.slots[4].label));
});
test('Explicit spread directive routes the named method but is stripped from event analysis target',()=>{
 const r=route('請用凱爾特十字牌陣看今年工作如何');assert.equal(r.spreadId,'celtic_cross');assert.equal(r.selectedBy,'explicit');
 assert.equal(r.compiledQuestion.queryGraph.events[0].analysisSurface,'今年工作如何');assert(!/凱爾特/.test(r.compiledQuestion.queryGraph.events[0].analysisSurface));
});
test('Bounded yes-no result labels do not masquerade as numeric thresholds',()=>{
 const event=route('未來三個月投資會賺錢嗎？');assert(/事件成立傾向/.test(event.methodPlan.slots[4].label));assert(!/門檻/.test(event.methodPlan.slots[4].label));
 const threshold=route('今年營業額能超過100萬嗎？');assert(/門檻結果/.test(threshold.methodPlan.slots[4].label));
});
test('Every spread family is reachable and compatible with its intended question shape',()=>{
 const cases={
  three_card:'我今天的工作狀態如何',five_card:'我應如何改善副業經營問題',cross:'目前工作卡住的局勢如何',either_or:'我該留任還是離職',
  relationship:'我和前任的關係未來如何',timeline:'我什麼時候會換工作',horseshoe:'這件事有哪些隱藏與外在影響',celtic_cross:'請完整深入看我目前的整體局勢',
  tree_of_life:'我反覆遇到的靈性課題根源是什麼',zodiac:'今年整體運勢為何',minor_arcana:'我的鑰匙掉在哪裡',fifteen_card:'請全面一起看我的工作、財務與家庭',
  mathers_21:'請看這件事完整的來龍去脈',mathers_horseshoe:'把我的整個人生所有面向最完整攤開',ootk:'請用開鑰之法看我的問題'
 };
 Object.entries(cases).forEach(([id,q])=>{const r=route(q);assert.equal(r.spreadId,id,`${q} -> ${r.spreadId}`);assert.equal(r.coverage.complete,true,`${id}: ${r.coverage.missing}`);});
});
test('Incompatible explicit method fails closed instead of pretending to measure a comparison',()=>{
 const r=route('請用開鑰之法看我該留任還是離職');assert.equal(r.spreadId,'ootk');assert.equal(r.coverage.complete,false);assert(r.coverage.missing.includes('comparison_outcome'));
});

// Book T and evidence topology
test('Book T remains the only semantic source and fixed Waite reversals stay disabled',()=>{
 const c=G.sourceContract();assert.equal(c.id,'gd_book_t');assert(/不使用 Waite 固定正逆字典/.test(c.reversalPolicy));
});
test('Only declared ordered lines receive full flanking elemental dignity',()=>{
 const cards=[{n:'權杖二',suit:'wand',num:2},{n:'權杖三',suit:'wand',num:3},{n:'權杖四',suit:'wand',num:4}];
 const left=G.dignityContext(cards,0,'three_card'),middle=G.dignityContext(cards,1,'three_card');assert.equal(left.fullDignity,false);assert(/^one_sided_/.test(left.state));assert.equal(middle.fullDignity,true);
});
test('Three-card synthesis depends on all atomic nodes rather than skipping the center',()=>{
 const graph=E.compileEvidenceGraph('three_card',[{name:'A'},{name:'B'},{name:'C'}],{}),atomic=graph.evidenceUnits.filter(u=>u.type==='atomic_node').map(u=>u.id),whole=graph.evidenceUnits.find(u=>u.type==='whole_ordered_path');atomic.forEach(id=>assert(whole.dependsOn.includes(id)));
});

// Opening of the Key procedural integrity
function op(n){return {operation:n,valid:true,landing:'stage-'+n,countingPath:[{cardName:'權杖一',countValue:11}],pairs:[]};}
function completeOps(){const operations={};for(let i=1;i<=5;i++)operations['op'+i]=op(i);operations.op4.ringSize=36;operations.op4.ringCountingPath=operations.op4.countingPath;return operations;}
test('Complete Opening of the Key creates exactly five stage summaries and validates',()=>{
 const q='請用開鑰之法看今年工作如何',c=E.compileReadingSpec({question:q,spreadId:'ootk',ootkData:{operations:completeOps(),procedureStatus:{completedOperations:5,abandoned:false}},referenceDate:'2026-07-18'});
 assert.equal(c.evidenceGraph.completedStageCount,5);assert.equal(c.evidenceGraph.stopped,false);assert.equal(c.answerabilityGate.procedureComplete,true);assert.equal(c.answerabilityGate.methodCoverageComplete,true);assert.equal(c.validation.ok,true);
});
test('Stopped Opening of the Key does not fabricate later operations',()=>{
 const q='請用開鑰之法看今年工作如何',c=E.compileReadingSpec({question:q,spreadId:'ootk',ootkData:{operations:{op1:{valid:false,abandoned:true,stopReason:'主要線索不符'}},procedureStatus:{completedOperations:1,abandoned:true,abandonedAt:'op1',reason:'主要線索不符'}},referenceDate:'2026-07-18'});
 const summaries=c.evidenceGraph.evidenceUnits.filter(u=>u.type==='operation_stage_summary');assert.equal(summaries.length,1);assert.equal(c.evidenceGraph.stopped,true);assert.equal(c.answerabilityGate.status,'blocked_or_partial');assert(c.evidenceGraph.evidenceUnits.some(u=>u.type==='procedure_stop_gate'));assert.equal(c.validation.ok,true);
 assert(!c.evidenceGraph.evidenceUnits.some(u=>u.stage>1));
});
test('Opening of the Key rejects skipped operation sequences and ignores later orphan stages',()=>{
 const g=E.compileOOTKEvidence({operations:{op1:op(1),op3:op(3)}});assert.equal(g.completedStageCount,1);assert.equal(g.stopped,true);assert.equal(g.stopStage,2);assert.equal(g.procedureStatus.sequenceGap,true);assert(!g.evidenceUnits.some(u=>u.stage===3));
});
test('Fourth operation is locked to the thirty-six-card ring and never becomes a date anchor',()=>{
 const ops=completeOps(),g=E.compileOOTKEvidence({operations:ops}),ring=g.evidenceUnits.find(u=>u.type==='op4_ring_structure');assert(ring);assert.equal(ring.metadata.ringSize,36);assert.equal(ring.metadata.timingPolicy,'not_a_calendar_or_decan_time_anchor');assert.equal(ring.topology,'ring_of_thirty_six');
 const invalid=completeOps();invalid.op4.ringSize=40;const g2=E.compileOOTKEvidence({operations:invalid});assert.equal(g2.stopped,true);assert.equal(g2.stopStage,4);assert.equal(g2.completedStageCount,4);
});

// Inventory and natural recommendation tail
test('Recommendation candidates are exact positive-stock variants without URLs or effects',()=>{
 assert(I.catalog.length>0);assert(!JSON.stringify(I.catalog).includes('http'));I.catalog.forEach(x=>{assert(x.qty>0);assert(x.displayName);});
 const list=I.recommendCandidates('今年會有非現任的肉體桃花嗎？',['relationship'],6);assert(list.length>0);list.forEach(name=>assert(I.catalog.some(x=>x.displayName===name&&x.qty>0)));
});
test('Prompt tail requires a natural question-linked recommendation section with clean spacing',()=>{
 const src=fs.readFileSync(path.join(ROOT,'JS/prompt-export.js'),'utf8'),frag=src.slice(src.indexOf('var FRAG_TAROT_INVENTORY'),src.indexOf('// ④b 紫微專用'));
 assert(frag.includes('延伸選品'));assert(frag.includes('融入使用者原問句'));assert(frag.includes('本盤已成立的核心提醒或行動重點'));assert(frag.includes('段落間各保留一個空行'));
 assert(frag.includes('[前往靜月之光蝦皮賣場](https://shopee.tw/a50h95648d?tab=shop)'));assert(frag.includes('連結之後不得再有任何內容'));
 assert(!frag.includes('全文最後兩行'));assert(!frag.includes('第一行：推薦品項'));
});
test('Tarot and OOTK AI payloads use current inventory candidates, not the legacy crystal catalog',()=>{
 const src=fs.readFileSync(path.join(ROOT,'JS/ai-analysis.js'),'utf8');
 const tarot=src.slice(src.indexOf('function _buildTarotOnlyPayload'),src.indexOf('async function _triggerTarotAI'));assert(tarot.includes('JYShopInventory'));assert(tarot.includes('shopRecommendation'));assert(!tarot.includes('_buildCrystalCatalog'));
 const ootk=src.slice(src.indexOf('function _buildOOTKPayload'),src.indexOf('function _buildMeihuaPayload'));assert(ootk.includes('JYShopInventory'));assert(ootk.includes('shopRecommendation'));assert(!ootk.includes('payload.crystalCatalog'));
});
test('Index loads semantic foundation and inventory before AI with coherent v99.2 cache tags',()=>{
 const html=fs.readFileSync(path.join(ROOT,'index.html'),'utf8'),a=html.indexOf('tarot-foundation.js?v=20260718v99_2'),b=html.indexOf('tarot-semantic-engine.js?v=20260718v99_2'),c=html.indexOf('tarot-inventory.js?v=20260718v99_2'),d=html.indexOf('ai-analysis.js?v=20260718v99_2');assert(a>=0&&a<b&&b<c&&c<d);assert(html.includes('prompt-export.js?v=20260718v99_2'));
});
test('Assembled tarot prompt preserves compound query and ends with the natural recommendation contract',()=>{
 const q='今年會有非現任的肉體桃花嗎？她幾歲？',r=route(q),cards=dummyCards(r.methodPlan,['權杖九','命運之輪','權杖十','寶劍五','金幣皇后']);
 const contract=E.compileReadingSpec({question:q,spreadId:r.spreadId,methodPlan:r.methodPlan,cards,sourceProfile:'gd_book_t',referenceDate:'2026-07-18'});
 const payload={mode:'tarot',methodPlan:r.methodPlan,semanticContract:contract,tarotData:{spreadType:r.spreadId,spreadZh:r.methodPlan.label,cards,methodPlan:r.methodPlan,semanticContract:contract,readingDate:'2026-07-18'},shopRecommendation:{sourceFile:I.SOURCE_FILE,allowedItems:I.recommendCandidates(q,['relationship'],3)}};
 const context=vmContext('_buildTarotOnlyPayload',payload,q),prompt=context.JY_buildExportPrompt('tarot');
 assert(prompt.includes('ROOT-SPEC v99'));assert(prompt.includes('predicate=query_person_attribute'));assert(prompt.includes('conditional_coreference'));assert(prompt.includes('exact_age'));assert(prompt.includes('【可推薦庫存品項】'));
 assert(prompt.includes('延伸選品'));assert(prompt.includes('承接原問句'));assert(prompt.trimEnd().endsWith('連結之後不得再有任何內容。'));
});
test('Assembled stopped OOTK prompt lists only generated operations and carries the same recommendation tail',()=>{
 const q='請用開鑰之法看今年工作如何',ootkData={significator:{name:'權杖國王'},operations:{op1:{valid:false,abandoned:true,abandonReason:'主要線索不符',activePile:'fire',activeCards:[{name:'權杖國王'}],countingPath:[],pairs:[]}},procedureStatus:{completedOperations:1,abandoned:true,abandonedAt:'op1',reason:'主要線索不符'}};
 const contract=E.compileReadingSpec({question:q,spreadId:'ootk',ootkData,referenceDate:'2026-07-18'}),payload={mode:'ootk',ootkData,semanticContract:contract,shopRecommendation:{sourceFile:I.SOURCE_FILE,allowedItems:I.recommendCandidates(q,['career'],3)}};
 const context=vmContext('_buildOOTKPayload',payload,q),prompt=context.JY_buildExportPrompt('ootk');assert(prompt.includes('第一次操作'));assert(!prompt.includes('【第二次操作・問題發展】'));assert(prompt.includes('程序已於op1停止'));assert(prompt.includes('【可推薦庫存品項】'));assert(prompt.trimEnd().endsWith('連結之後不得再有任何內容。'));
});

test('Changed JavaScript files pass syntax checks',()=>{
 ['tarot-foundation.js','golden-dawn-tarot.js','tarot-semantic-engine.js','tarot-inventory.js','tarot_upgrade.js','ai-analysis.js','prompt-export.js'].forEach(f=>cp.execFileSync(process.execPath,['--check',path.join(ROOT,'JS',f)],{stdio:'pipe'}));
});

if(!process.exitCode)console.log(`\n${passed} tests passed.`);
