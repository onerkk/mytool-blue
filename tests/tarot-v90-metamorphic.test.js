'use strict';
const assert=require('assert');
const path=require('path');
const E=require(path.resolve(__dirname,'..','JS','tarot-semantic-engine.js'));
let passed=0;
function test(name,fn){try{fn();passed++;console.log('✓',name);}catch(e){console.error('✗',name);throw e;}}
function mk(n,names){return Array.from({length:n},(_,i)=>({name:(names&&names[i])||`牌${i+1}`,position:`P${i+1}`,isUp:true,baseMeaning:`義${i+1}`}));}
function ids(q){return E.compileQuestion(q).requestedDimensions.map(x=>x.id).sort();}

test('同義問法不改變核心資訊需求',()=>{
  assert.deepStrictEqual(ids('我今年有肉體桃花嗎？對方可能幾歲？'),ids('今年是否會出現肉體桃花？那個人年齡大概幾歲？'));
  assert.deepStrictEqual(ids('公司有幾個異性喜歡我？'),ids('在公司喜歡我的異性有多少人？'));
});

test('證據幾何只由牌陣位置決定，不由牌義關鍵字決定',()=>{
  const a=E.compileReadingSpec({question:'發展？',spreadId:'five_card',cards:mk(5,['太陽','月亮','世界','死神','戀人'])});
  const b=E.compileReadingSpec({question:'發展？',spreadId:'five_card',cards:mk(5,['惡魔','高塔','愚者','星星','審判'])});
  const shape=c=>c.evidenceGraph.evidenceUnits.map(u=>({id:u.id,type:u.type,nodes:u.nodes}));
  assert.deepStrictEqual(shape(a),shape(b));
});

test('Mathers 換牌只改節點內容，不改 A/C/E 合法關係',()=>{
  const a=E.compileReadingSpec({question:'結果？',spreadId:'mathers_horseshoe',cards:mk(54)});
  const bCards=mk(54).reverse().map((c,i)=>({...c,position:`P${i+1}`}));
  const b=E.compileReadingSpec({question:'結果？',spreadId:'mathers_horseshoe',cards:bCards});
  const sig=c=>c.evidenceGraph.evidenceUnits.map(u=>`${u.id}:${u.type}:${u.group}:${u.nodes.join(',')}`);
  assert.deepStrictEqual(sig(a),sig(b));
  assert.notStrictEqual(a.evidenceGraph.nodes[0].cardName,b.evidenceGraph.nodes[0].cardName);
});

test('移除必要牌位會降低為無效契約，不會讓模型自由補全',()=>{
  const full=E.compileReadingSpec({question:'會成功嗎？',spreadId:'five_card',cards:mk(5)});
  const missing=E.compileReadingSpec({question:'會成功嗎？',spreadId:'five_card',cards:mk(4)});
  assert.strictEqual(full.validation.ok,true);
  assert.strictEqual(missing.validation.ok,false);
});

test('換來源只允許方法規格核准的設定',()=>{
  const modern=E.compileReadingSpec({question:'結果？',spreadId:'three_card',sourceProfile:'waite_1910',cards:mk(3)});
  const mathersBad=E.compileReadingSpec({question:'結果？',spreadId:'mathers_21',sourceProfile:'waite_1910',cards:mk(21)});
  assert.strictEqual(modern.validation.ok,true);
  assert.strictEqual(mathersBad.validation.ok,false);
});

test('未量測屬性不會因牌多、宮廷牌多或大牌多而改變能力判定',()=>{
  const q='有幾個人？可能幾歲？';
  for(const id of ['three_card','relationship','celtic_cross','mathers_21','mathers_horseshoe']){
    const spec=E.METHOD_SPECS[id];
    const c=E.compileReadingSpec({question:q,spreadId:id,cards:mk(spec.expectedCardCount)});
    const m=Object.fromEntries(c.capabilityMatrix.map(x=>[x.dimensionId,x.precheckStatus]));
    assert.strictEqual(m.cardinality,'未直接量測',id);
    assert.strictEqual(m.exact_age,'未直接量測',id);
  }
});

test('開鑰第五次的牌不能被加入第四次直接證據單位',()=>{
  const operations={};
  for(let i=1;i<=5;i++) operations['op'+i]={countingPath:[{cardName:`第${i}次牌`}],pairs:[],decanDateRange:i===4?'旬位':''};
  const c=E.compileReadingSpec({question:'何時與結果？',spreadId:'ootk',ootkData:{operations}});
  assert.strictEqual(c.validation.ok,true,c.validation.errors.join(','));
  for(const u of c.evidenceGraph.evidenceUnits){
    const stages=new Set((u.nodes||[]).map(id=>c.evidenceGraph.nodes.find(n=>n.id===id).sourceOperation));
    assert(stages.size<=1,u.id);
  }
});

test('ROOT-SPEC 產出穩定且不包含題材固定事件表',()=>{
  const c=E.compileReadingSpec({question:'工作會不會升遷？',spreadId:'celtic_cross',cards:mk(10)});
  const p=E.renderPromptContract(c);
  assert(p.includes('合法證據單位：'));
  ['缺聖杯','缺權杖','通常已婚','肉體桃花必須'].forEach(x=>assert(!p.includes(x),x));
});

console.log(`\n${passed} metamorphic tests passed`);
