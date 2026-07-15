'use strict';
const assert=require('assert');
const path=require('path');
const E=require(path.resolve(__dirname,'..','JS','tarot-semantic-engine.js'));
let passed=0;
function test(name,fn){try{fn();passed++;console.log('✓',name);}catch(e){console.error('✗',name);throw e;}}
function cards(n,seed='A'){return Array.from({length:n},(_,i)=>({name:`${seed}${i}`,position:`P${i}`,isUp:i%2===0,keywords:`k${i}・x${i}`,baseMeaning:`g${i}`}));}
function ootk(seed='A'){
 const operations={};
 for(let i=1;i<=5;i++) operations['op'+i]={activePile:i===1?'火':'',activeHouse:i===2?'2':'',activeSign:i===3?'雙子':'',activeSephirah:i===5?'Malkuth':'',countingPath:[{cardName:`${seed}路${i}a`,title:'甲'},{cardName:`${seed}路${i}b`,title:'乙'}],pairs:[{left:{name:`${seed}左${i}`,title:'左'},right:{name:`${seed}右${i}`,title:'右'}}],decanDateRange:i===4?'明示日期錨':''};
 return {significator:{name:`${seed}代表牌`},operations};
}
function structure(c){return {
 method:c.method.id,
 topology:c.method.topology.kind,
 roles:c.evidenceGraph.nodes.map(n=>n.authority),
 units:c.evidenceGraph.evidenceUnits.map(u=>({type:u.type,topology:u.topology,nodes:u.nodes.length,depends:u.dependsOn.length,policy:u.claimPolicy}))
};}

test('換牌只改內容，不改方法拓撲與合法證據運算子',()=>{
 for(const [id,spec] of Object.entries(E.METHOD_SPECS)){
  if(id==='ootk')continue;
  const a=E.compileReadingSpec({question:'任意問題',spreadId:id,cards:cards(spec.expectedCardCount,'A')});
  const b=E.compileReadingSpec({question:'任意問題',spreadId:id,cards:cards(spec.expectedCardCount,'B')});
  assert.deepStrictEqual(structure(a),structure(b),id);
 }
});

test('同義改寫保留比較／門檻關係，不依副業題材',()=>{
 const qs=['甲值會超過乙值嗎？','乙值是否會低於甲值？'];
 const a=E.compileQuestion(qs[0]),b=E.compileQuestion(qs[1]);
 assert(a.relations.length===1&&b.relations.length===1);
 assert.strictEqual(a.relations[0].operator,'gt');
 assert.strictEqual(b.relations[0].operator,'lt');
 assert(a.queryGraph.validationRules.roundTrip&&b.queryGraph.validationRules.roundTrip);
});

test('新增限定會新增查詢義務，但不改牌陣拓撲',()=>{
 const base=E.compileReadingSpec({question:'今年有人向我表達立場嗎？',spreadId:'zodiac',cards:cards(13)});
 const constrained=E.compileReadingSpec({question:'今年會有非現任的異性向我表達立場嗎？',spreadId:'zodiac',cards:cards(13)});
 assert.deepStrictEqual(structure(base),structure(constrained));
 assert(constrained.question.queryGraph.requiredAtoms.length>base.question.queryGraph.requiredAtoms.length);
 assert(constrained.question.queryGraph.constraints.some(c=>c.type==='exclusion'));
});

test('未知對象與已知對象只改實體綁定，不改其餘關係拓撲',()=>{
 const a=E.compileReadingSpec({question:'有人和我發展關係嗎？',spreadId:'relationship',cards:cards(6)});
 const b=E.compileReadingSpec({question:'我和這個人的關係如何？',spreadId:'relationship',cards:cards(6)});
 assert.strictEqual(a.evidenceGraph.nodes[1].authority,'person_aggregate');
 assert.strictEqual(b.evidenceGraph.nodes[1].authority,'person_known');
 assert.deepStrictEqual(a.evidenceGraph.evidenceUnits.map(u=>u.type),b.evidenceGraph.evidenceUnits.map(u=>u.type));
});

test('開鑰換牌不改五階段程序與摘要依賴',()=>{
 const a=E.compileReadingSpec({question:'事情如何？',spreadId:'ootk',ootkData:ootk('A')});
 const b=E.compileReadingSpec({question:'事情如何？',spreadId:'ootk',ootkData:ootk('B')});
 const sa=a.evidenceGraph.evidenceUnits.filter(u=>u.type==='operation_stage_summary').map(u=>({stage:u.stage,fn:u.stageFunction,deps:u.dependsOn.length,binding:u.eventBinding}));
 const sb=b.evidenceGraph.evidenceUnits.filter(u=>u.type==='operation_stage_summary').map(u=>({stage:u.stage,fn:u.stageFunction,deps:u.dependsOn.length,binding:u.eventBinding}));
 assert.deepStrictEqual(sa,sb);
});

test('來源切換不能改方法拓撲，且嚴格原法拒絕不相容來源',()=>{
 const a=E.compileReadingSpec({question:'結果？',spreadId:'three_card',cards:cards(3),sourceProfile:'modern_rws'});
 const b=E.compileReadingSpec({question:'結果？',spreadId:'three_card',cards:cards(3),sourceProfile:'waite_1910'});
 assert.deepStrictEqual(structure(a),structure(b));
 const bad=E.compileReadingSpec({question:'結果？',spreadId:'mathers_horseshoe',cards:cards(54),sourceProfile:'modern_rws'});
 assert.strictEqual(bad.validation.ok,false);
 assert(bad.validation.errors.some(x=>x.includes('source')));
});

test('輸出長度規則與牌數解耦，所有方法使用同一深度標準',()=>{
 for(const [id,spec] of Object.entries(E.METHOD_SPECS)){
  const input={question:'請完整回答所有成立與未成立的部分',spreadId:id};
  if(id==='ootk')input.ootkData=ootk();else input.cards=cards(spec.expectedCardCount);
  const c=E.compileReadingSpec(input);
  assert(c.outputContract.length.includes('篇幅不由牌數決定'),id);
  assert(c.adjudication.depthRule.includes('最強替代解讀'),id);
 }
});

console.log(`\n${passed} v92 metamorphic tests passed`);
