'use strict';
const assert = require('assert');
const path = require('path');
const E = require(path.resolve(__dirname,'..','JS','tarot-semantic-engine.js'));
let passed=0;
function test(name,fn){try{fn();passed++;console.log('✓',name);}catch(e){console.error('✗',name);throw e;}}
function mk(n,names){return Array.from({length:n},(_,i)=>({name:(names&&names[i])||`牌${i+1}`,position:`P${i+1}`,isUp:true,keywords:`甲${i+1}・乙${i+1}`,baseMeaning:`釋義${i+1}`}));}
function shape(c){return c.evidenceGraph.evidenceUnits.map(u=>({id:u.id,type:u.type,nodes:u.nodes,dependsOn:u.dependsOn,topology:u.topology,group:u.group}));}

function relationSignature(q){
  return E.compileQuestion(q).relations.map(r=>({type:r.type,operator:r.operator,left:r.left,right:r.right,metric:r.metric}));
}

test('比較題同義改寫保留同一關係運算與比較雙方',()=>{
  assert.deepStrictEqual(
    relationSignature('我副業能成功超過正職收入嗎？'),
    relationSignature('我的副業收入會高於正職收入嗎？')
  );
});

test('不含比較的收入題不會被錯編譯成門檻跨越',()=>{
  const q=E.compileQuestion('我的副業收入會成長嗎？');
  const ids=q.requestedDimensions.map(x=>x.id);
  assert.strictEqual(q.relations.length,0);
  assert(!ids.includes('relative_order'));
  assert(!ids.includes('threshold_crossing'));
  assert(ids.includes('trend'));
});

test('換牌只改語義內容，不改牌陣拓撲與依賴圖',()=>{
  for(const id of ['three_card','five_card','relationship','celtic_cross','tree_of_life','zodiac','fifteen_card']){
    const spec=E.METHOD_SPECS[id];
    const a=E.compileReadingSpec({question:'結果？',spreadId:id,cards:mk(spec.expectedCardCount)});
    const b=E.compileReadingSpec({question:'結果？',spreadId:id,cards:mk(spec.expectedCardCount).reverse().map((c,i)=>({...c,position:`Q${i+1}`}))});
    assert.deepStrictEqual(shape(a),shape(b),id);
  }
});

test('非線性牌陣的綜合節點永遠沒有直接牌序',()=>{
  for(const id of ['celtic_cross','tree_of_life','zodiac']){
    const c=E.compileReadingSpec({question:'結果？',spreadId:id,cards:mk(E.METHOD_SPECS[id].expectedCardCount)});
    const synth=c.evidenceGraph.evidenceUnits.filter(u=>u.claimPolicy==='synthesis_only');
    assert(synth.length>0,id);
    synth.forEach(u=>{
      assert.strictEqual(u.nodes.length,0,`${id}/${u.id}`);
      assert(u.dependsOn.length>0,`${id}/${u.id}`);
    });
  }
});

test('未量測門檻不會因結果牌換成財務吉牌而升級',()=>{
  const q='我副業能成功超過正職收入嗎？';
  const a=E.compileReadingSpec({question:q,spreadId:'celtic_cross',cards:mk(10)});
  const names=['塔','寶劍十','寶劍六','審判','金幣騎士','權杖八','金幣十','聖杯七','聖杯十','金幣王牌'];
  const b=E.compileReadingSpec({question:q,spreadId:'celtic_cross',cards:mk(10,names)});
  const ca=Object.fromEntries(a.capabilityMatrix.map(x=>[x.dimensionId,x.canAnswer]));
  const cb=Object.fromEntries(b.capabilityMatrix.map(x=>[x.dimensionId,x.canAnswer]));
  assert.strictEqual(ca.threshold_crossing,false);
  assert.strictEqual(cb.threshold_crossing,false);
});

test('Mathers來源隔離不因題目改變',()=>{
  for(const id of ['mathers_21','mathers_horseshoe']){
    const spec=E.METHOD_SPECS[id];
    const c=E.compileReadingSpec({question:'會成功嗎？',spreadId:id,sourceProfile:'modern_rws',cards:mk(spec.expectedCardCount)});
    assert.strictEqual(c.validation.ok,false,id);
    assert(c.validation.errors.some(x=>x.includes('source_profile_not_allowed')),id);
  }
});

test('開鑰不同操作的牌不能進入同一直接證據單位',()=>{
  const operations={};
  for(let i=1;i<=5;i++) operations['op'+i]={countingPath:[{cardName:`第${i}次牌`}],pairs:[{left:{name:`左${i}`},right:{name:`右${i}`}}],decanDateRange:i===4?'旬位':''};
  const c=E.compileReadingSpec({question:'何時與結果？',spreadId:'ootk',ootkData:{operations}});
  assert.strictEqual(c.validation.ok,true,c.validation.errors.join(','));
  for(const u of c.evidenceGraph.evidenceUnits.filter(x=>x.nodes.length)){
    const stages=new Set(u.nodes.map(id=>c.evidenceGraph.nodes.find(n=>n.id===id).sourceOperation));
    assert(stages.size<=1,u.id);
  }
  const cross=c.evidenceGraph.evidenceUnits.find(x=>x.type==='cross_operation_stage_network');
  assert.strictEqual(cross.nodes.length,0);
});

test('ROOT-SPEC不含題材固定公式或線性化凱爾特',()=>{
  const c=E.compileReadingSpec({question:'工作會不會升遷？',spreadId:'celtic_cross',cards:mk(10)});
  const p=E.renderPromptContract(c);
  ['缺聖杯','缺權杖','通常已婚','肉體桃花必須','N01 → N02 → N03 → N04'].forEach(x=>assert(!p.includes(x),x));
  assert(p.includes('nonlinear_dependency_network'));
});

console.log(`\n${passed} v91 metamorphic tests passed`);
