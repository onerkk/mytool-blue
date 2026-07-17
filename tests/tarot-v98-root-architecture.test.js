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
const G=global.JYGoldenDawn, I=global.JYShopInventory;
let passed=0;
function test(name,fn){try{fn();passed++;console.log('✓',name);}catch(e){console.error('✗',name,'\n ',e.stack||e);process.exitCode=1;}}
function route(q){return F.routeQuestion(q,{referenceDate:'2026-07-17T12:00:00+08:00'});}
function atomKinds(c){return c.queryGraph.requiredAtoms.map(a=>a.kind);}

// Registry and single source
test('Foundation v98 registry validates',()=>{assert.equal(F.VERSION,'98.0.0');assert.equal(F.SCHEMA,'jy.tarot.foundation/3');assert.deepEqual(F.validateMethodRegistry(),{ok:true,errors:[]});});
test('Every registered automatic method declares observable sets and typed slots',()=>{Object.values(F.METHODS).forEach(m=>{assert(Array.isArray(m.provides));assert(Array.isArray(m.slots));m.slots.forEach(s=>assert(s.authority&&s.role));});});

// Fixed threshold: user-provided number is a query constraint, not an amount prediction
test('Fixed threshold question is atomized without whole-question atom',()=>{
 const r=route('這月我副業營業額能破萬嗎？'), c=r.compiledQuestion;
 ['actor','subject','measured_attribute','comparator','threshold_value','query_operator','modality','scope'].forEach(k=>assert(atomKinds(c).includes(k),k));
 assert.equal(c.relations[0].type,'fixed_numeric_threshold');assert.equal(c.relations[0].thresholdValue,10000);
 assert(!c.unsupportedDimensions.includes('exact_value'));
 assert.equal(c.queryGraph.compilerStatus,'validated_atomized');assert(c.queryGraph.validation.everyDeletionChangesTruthConditions);
 assert(!c.queryGraph.requiredAtoms.some(a=>a.text===c.originalQuestion));
 const actor=c.queryGraph.requiredAtoms.find(a=>a.kind==='actor');assert.equal(actor.implicit,false);assert.equal(actor.source,'我');
});
test('Fixed threshold routes to a bounded threshold-result method, not past-present-future',()=>{
 const r=route('這月我副業營業額能破萬嗎？');assert.equal(r.spreadId,'five_card');assert.equal(r.coverage.complete,true);
 assert.deepEqual(r.coverage.missing,[]);assert.equal(r.methodPlan.slots[4].authority,'bounded_outcome');
 assert(/2026年7月/.test(r.methodPlan.slots[4].label));assert(/門檻結果/.test(r.methodPlan.slots[4].label));
});
test('Exact amount request remains explicitly unmeasured',()=>{const c=route('這月我的副業營業額會是多少錢？').compiledQuestion;assert(c.unsupportedDimensions.includes('exact_value'));});

// Automatic spread classification by required observable sets
test('Annual general overview routes to zodiac domains',()=>{const r=route('今年運勢為何');assert.equal(r.spreadId,'zodiac');assert(r.methodPlan.provides.includes('annual_overview'));assert(r.methodPlan.provides.includes('domain_coverage'));});
test('Single-domain annual question routes to bounded event method',()=>{const r=route('今年工作運勢如何');assert.equal(r.spreadId,'five_card');assert.equal(r.coverage.complete,true);assert.equal(r.methodPlan.slots[4].authority,'bounded_outcome');});
test('Two alternatives route to independent comparison branches',()=>{const r=route('我該留任還是離職');assert.equal(r.spreadId,'either_or');assert.equal(r.compiledQuestion.relations[0].left,'留任');assert.equal(r.compiledQuestion.relations[0].right,'離職');assert.equal(r.methodPlan.slots[1].binding.eventId,'BRANCH_A_EVENT');assert.equal(r.methodPlan.slots[2].binding.eventId,'BRANCH_B_EVENT');});
test('Entity income comparison routes to independent same-scale comparison',()=>{const r=route('我副業蝦皮賣場未來可以超過正職的收入嗎？');assert.equal(r.spreadId,'either_or');assert.equal(r.compiledQuestion.relations[0].scale,'收入');assert.equal(r.coverage.complete,true);});
test('Known dyad routes relationship spread',()=>{assert.equal(route('我和前任的關係未來如何').spreadId,'relationship');});
test('Bounded relationship and bounded choice reuse their real outcome slots',()=>{
 const dyad=route('今年我和前任的關係如何');assert.equal(dyad.spreadId,'relationship');assert.equal(dyad.coverage.complete,true);assert.equal(dyad.methodPlan.slots[5].authority,'bounded_outcome');
 const choice=route('今年我該留任還是離職');assert.equal(choice.spreadId,'either_or');assert.equal(choice.coverage.complete,true);assert.equal(choice.methodPlan.slots[3].authority,'bounded_outcome');assert.equal(choice.methodPlan.slots[4].authority,'bounded_outcome');
});
test('Timing question routes relative timeline',()=>{assert.equal(route('我什麼時候會換工作').spreadId,'timeline');assert.equal(route('今年什麼時候會換工作').spreadId,'timeline');});
test('Lost-object location routes practical location method',()=>{assert.equal(route('我的鑰匙掉在哪裡').spreadId,'minor_arcana');});
test('Cause plus obstacle routes five-card causal mechanism',()=>{const r=route('為什麼今年工作一直卡住');assert.equal(r.spreadId,'five_card');assert(r.coverage.required.includes('cause'));assert(r.coverage.required.includes('obstacle'));});
test('Spiritual repeating pattern routes structural depth',()=>{assert.equal(route('為什麼我總是重複同樣的靈性課題').spreadId,'tree_of_life');});
test('Hidden and external conditions route horseshoe',()=>{assert.equal(route('我忽略了哪些外在環境影響').spreadId,'horseshoe');});
test('Narrative and exhaustive requests route historical deep methods',()=>{assert.equal(route('請看這件事完整的來龍去脈').spreadId,'mathers_21');assert.equal(route('把我的整個人生所有面向最完整攤開').spreadId,'mathers_horseshoe');});

test('Every registered spread family is reachable by a compatible question or explicit method request',()=>{
 const cases={
  three_card:'我今天的工作狀態如何',five_card:'我應如何改善副業經營問題',cross:'目前工作卡住的局勢如何',either_or:'我該留任還是離職',
  relationship:'我和前任的關係未來如何',timeline:'我什麼時候會換工作',horseshoe:'這件事有哪些隱藏與外在影響',celtic_cross:'請完整深入看我目前的整體局勢',
  tree_of_life:'我反覆遇到的靈性課題根源是什麼',zodiac:'今年整體運勢為何',minor_arcana:'我的鑰匙掉在哪裡',fifteen_card:'請全面一起看我的工作、財務與家庭',
  mathers_21:'請看這件事完整的來龍去脈',mathers_horseshoe:'把我的整個人生所有面向最完整攤開',ootk:'請用開鑰之法看我的問題'
 };
 Object.entries(cases).forEach(([id,q])=>{const r=route(q);assert.equal(r.spreadId,id,`${q} -> ${r.spreadId}`);assert.equal(r.coverage.complete,true,id);});
});

test('Explicit incompatible spread reports coverage gap instead of silently changing question',()=>{const r=route('請用三牌陣看這月副業營業額能破萬嗎');assert.equal(r.spreadId,'three_card');assert.equal(r.selectedBy,'explicit');assert.equal(r.coverage.complete,false);assert(r.coverage.missing.includes('threshold_outcome'));});
test('Automatic routing fails closed when no single spread covers a compound question',()=>{const r=route('我和前任的關係有哪些隱藏外在影響以及完整時間線');assert.equal(r.spreadId,null);assert.equal(r.selectedBy,'blocked_no_compatible_method');assert.equal(r.coverage.complete,false);});

// Semantic contract
test('Semantic contract consumes the selected dynamic method plan',()=>{
 const q='這月我副業營業額能破萬嗎？',r=route(q);
 const names=['金幣侍者','戰車','金幣七','皇帝','聖杯七'];
 const cards=names.map((name,i)=>({name,position:r.methodPlan.slots[i].label,semanticCandidates:['candidate'],sourceGloss:'source'}));
 const c=E.compileReadingSpec({question:q,spreadId:r.spreadId,cards,methodPlan:r.methodPlan,referenceDate:'2026-07-17'});
 assert.equal(c.engineVersion,'98.0.0');assert.equal(c.method.coverageComplete,true);assert.deepEqual(c.evidenceGraph.nodes.map(n=>n.authority),['state','enabler','obstacle','advice','bounded_outcome']);
 const threshold=c.capabilityMatrix.find(x=>x.observableId==='threshold_outcome');assert(threshold&&threshold.canAnswer);assert.equal(E.validateContract(c).ok,true);
});
test('Three-card path synthesis depends on every atomic node, including center',()=>{
 const graph=E.compileEvidenceGraph('three_card',[{name:'A'},{name:'B'},{name:'C'}],{});
 const atomic=graph.evidenceUnits.filter(u=>u.type==='atomic_node').map(u=>u.id);
 const whole=graph.evidenceUnits.find(u=>u.type==='whole_ordered_path');atomic.forEach(id=>assert(whole.dependsOn.includes(id),id));
});

// Book T dignity boundary
test('Only middle card receives full flanking dignity; endpoints are one-sided context',()=>{
 const cards=[{n:'金幣侍者',suit:'pent',rank:'page'},{n:'戰車',suit:'major'},{n:'金幣七',suit:'pent',num:7}];
 const left=G.dignityContext(cards,0,'three_card'), middle=G.dignityContext(cards,1,'three_card');
 assert.equal(left.fullDignity,false);assert(/^one_sided_/.test(left.state));assert.equal(middle.fullDignity,true);assert.equal(middle.state,'well_dignified');
});
test('Book T source remains single and fixed-reversal-free',()=>{const c=G.sourceContract();assert.equal(c.id,'gd_book_t');assert(/不使用 Waite 固定正逆字典/.test(c.reversalPolicy));});

// Inventory recommendation
test('Inventory catalog contains only positive-stock exact variants and no URLs',()=>{assert(I.catalog.length>100);I.catalog.forEach(x=>{assert(x.qty>0);assert(x.displayName);});assert(!JSON.stringify(I.catalog).includes('http'));});
test('Recommendation candidates are exact current-stock names',()=>{const list=I.recommendCandidates('這月我副業營業額能破萬嗎？',['career','finance'],6);assert(list.length>0);list.forEach(name=>assert(I.catalog.some(x=>x.displayName===name&&x.qty>0)));});
test('Recommendation shortlist is context-matched and diversified by base item',()=>{const list=I.recommendCandidates('這月我副業營業額能破萬嗎？',['career','finance'],6);const bases=list.map(x=>x.split('／')[0]);assert.equal(new Set(bases).size,bases.length);assert(list.some(x=>/黃水晶|綠幽靈|鈦晶|金太陽|金髮晶|虎眼/.test(x)));});
test('Out-of-stock or absent product names cannot be recommended',()=>{assert(!I.catalog.some(x=>/拉長石/.test(x.name)));assert(!I.recommendCandidates('我該離職嗎',[],20).some(x=>/拉長石/.test(x)));});

test('Tarot prompt source ends with one inventory item and the fixed Shopee link',()=>{
 const src=fs.readFileSync(path.join(ROOT,'JS/prompt-export.js'),'utf8');
 assert(src.includes('FRAG_TAROT_INVENTORY'));assert(src.includes('【庫存推薦附加層——全文最後兩行】'));
 assert(src.includes('第一行：推薦品項：<品項全名>'));
 const frag=src.slice(src.indexOf('var FRAG_TAROT_INVENTORY'),src.indexOf('// ④b 紫微專用'));
 assert(frag.includes('[靜月之光蝦皮賣場](https://shopee.tw/a50h95648d?tab=shop)'));
 assert(frag.includes('第二行之後不得再有任何內容'));assert(!frag.includes('礦物事實錨點'));
});
test('AI tarot payload uses methodPlan and inventory, not crystal catalog',()=>{const src=fs.readFileSync(path.join(ROOT,'JS/ai-analysis.js'),'utf8');const fn=src.slice(src.indexOf('function _buildTarotOnlyPayload'),src.indexOf('async function _triggerTarotAI'));assert(fn.includes('methodPlan'));assert(fn.includes('JYShopInventory'));assert(fn.includes('shopRecommendation'));assert(!fn.includes('_buildCrystalCatalog'));});
test('Index loads foundation, semantics and inventory before AI payload',()=>{const html=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');const a=html.indexOf('tarot-foundation.js?v=20260717v98_0'),b=html.indexOf('tarot-semantic-engine.js?v=20260717v98_0'),c=html.indexOf('tarot-inventory.js?v=20260717v98_0'),d=html.indexOf('ai-analysis.js?v=20260717v98_2');assert(a>=0&&a<b&&b<c&&c<d);assert(html.includes('prompt-export.js?v=20260717v98_2'));});
test('Assembled tarot prompt carries the same method plan and ends with inventory-only instructions',()=>{
 const q='這月我副業營業額能破萬嗎？',r=route(q),names=['金幣侍者','戰車','金幣七','金幣八','金幣九'];
 const cards=names.map((name,i)=>({name,position:r.methodPlan.slots[i].label,positionMeaning:r.methodPlan.slots[i].label,sourceCore:'Book T source',element:i===1?'水':'土'}));
 const contract=E.compileReadingSpec({question:q,spreadId:r.spreadId,methodPlan:r.methodPlan,cards,sourceProfile:'gd_book_t',referenceDate:'2026-07-17'});
 const payload={mode:'tarot',methodPlan:r.methodPlan,semanticContract:contract,tarotData:{spreadType:r.spreadId,spreadZh:r.methodPlan.label,cards,methodPlan:r.methodPlan,semanticContract:contract,readingDate:'2026-07-17'},shopRecommendation:{sourceFile:I.SOURCE_FILE,allowedItems:I.recommendCandidates(q,['career','finance'],3)}};
 const context={console,window:null,self:null,globalThis:null,S:{form:{question:q}},navigator:{clipboard:{writeText:()=>Promise.resolve()}},setTimeout,clearTimeout,Date,JSON,Math,RegExp,String,Number,Array,Object,Error,Promise,document:{getElementById:()=>null,querySelector:()=>null,createElement:()=>({style:{},setAttribute(){},appendChild(){},select(){},querySelectorAll(){return[];}}),body:{appendChild(){},removeChild(){}},execCommand(){return true}},_buildTarotOnlyPayload:()=>payload,JYTarotFoundation:F,JYTarotSemanticEngine:E};
 context.window=context;context.self=context;context.globalThis=context;vm.createContext(context);vm.runInContext(fs.readFileSync(path.join(ROOT,'JS/prompt-export.js'),'utf8'),context);
 const prompt=context.JY_buildExportPrompt('tarot');assert(prompt.includes('ROOT-SPEC v98'));assert(prompt.includes('截至2026年7月的門檻結果'));assert(prompt.includes('【可推薦庫存品項】'));assert(prompt.includes('第一行：推薦品項：<品項全名>'));assert(prompt.includes('[靜月之光蝦皮賣場](https://shopee.tw/a50h95648d?tab=shop)'));assert(prompt.trimEnd().endsWith('第二行之後不得再有任何內容。'));
});

test('Changed JavaScript files pass syntax checks',()=>{['tarot-foundation.js','golden-dawn-tarot.js','tarot-semantic-engine.js','tarot-inventory.js','tarot_upgrade.js','ai-analysis.js','prompt-export.js'].forEach(f=>cp.execFileSync(process.execPath,['--check',path.join(ROOT,'JS',f)],{stdio:'pipe'}));});

if(!process.exitCode)console.log(`\n${passed} tests passed.`);
