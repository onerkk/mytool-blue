'use strict';
// Source examples/rules: docs/ootk-repair-20260915.md. No external AI calls.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),acorn=require('acorn');
const {fixture,load,add}=require('./ritual-lifecycle-20260911.cjs');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8'),plain=x=>JSON.parse(JSON.stringify(x));
function extract(file,name){let found;const s=read(file);function visit(n){if(!n||typeof n!=='object')return;if(n.type==='FunctionDeclaration'&&n.id?.name===name)found=s.slice(n.start,n.end);for(const v of Object.values(n))if(Array.isArray(v))v.forEach(visit);else if(v&&typeof v==='object')visit(v);}visit(acorn.parse(s,{ecmaVersion:'latest'}));assert(found,name);return found;}
const builder=extract('JS/ai-analysis.js','_buildOOTKPayload');
function environment(){
 const e=fixture();e.ctx.console={log(){},warn(){},error(){}};
 e.Element.prototype.after=function(n){this.parentNode.insertBefore(n,this.parentNode.children[this.parentNode.children.indexOf(this)+1]);};
 ['reading-quality','picker-core','tarot-foundation','golden-dawn-tarot','tarot-semantic-engine','tarot','tarot-reading'].forEach(f=>load(e,f));
 vm.runInContext(read('JS/tarot_upgrade.js').replace('window._ootkTriggerAI = _triggerOOTKAI;','window._ootkTriggerAI = _triggerOOTKAI;window.__sequence=_runOOTKSequence;window.__record=_ootkCompletionHTML;'),e.ctx);
 vm.runInContext(builder,e.ctx);load(e,'prompt-export');
 e.ctx.__deck=vm.runInContext('TAROT',e.ctx);e.ctx.S.form={question:'公司認識的異性未來會跟我交往嗎？'};
 e.ctx._jyTarotQuestionText=()=>e.ctx.S.form.question;e.ctx.goStep=()=>{};e.exports=[];
 e.ctx.JY_renderExportPrompt=(mode,host)=>{e.exports.push(plain(e.ctx._buildOOTKPayload()));host.innerHTML='<p>本次結果</p>';};
 e.clock.clear();return e;
}
function seed(e,n){let s=n>>>0;e.ctx._secInt=max=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return Math.floor(s/4294967296*max);};}
const bindings={confirmedBeforeDeal:true,countDirection:'right'};
function cast(e,extra={},n=123){seed(e,n);return e.ctx.ootkRunFull(35,e.ctx.S.form.question,{...bindings,...extra});}
let passed=0;
function test(name,fn){fn();passed++;console.log('PASS '+name);}
test('Default original-manuscript profile completes 512 casts across every court and conflicting expectations',()=>{
 const e=environment(),courts=e.ctx.__deck.filter(c=>['king','queen','knight','page'].includes(c.rank));assert.equal(courts.length,16);
 const piles=new Set();
 for(let n=1;n<=32;n++)for(const card of courts){
  seed(e,n*79+card.id);const r=e.ctx.ootkRunFull(card.id,'我能改善收入嗎？',{...bindings,countDirection:n%2?'left':'right',expectedPile:'water',primaryHouse:7,expectedSign:6,expectedSephirah:6});
  assert.equal(r.procedureProfile,'mathers_continuous');assert.equal(r.completedOperations,5);assert(!r.abandonedAt);assert.equal(r.divinationValidity.interpretable,true);assert.notEqual(r.divinationValidity.valid,true);
  piles.add(r.op1.activePile);
  for(let i=1;i<=5;i++){const o=r['op'+i];assert.equal(o.attempt,1);assert.equal(new Set(o.activeCards.map(c=>c.id)).size,o.activeCards.length);assert(o.activeCards.some(c=>c.id===card.id));assert(o.countingPath.length>0);assert(o.countingPath.every(p=>o.activeCards.some(c=>c.id===p.cardId)));}
  assert.equal(r.op4.ringCards.length,36);assert.equal(r.op4.ringPairs.length,18);assert(!r.op4.ringCards.some(c=>c.id===card.id));assert.equal(r.op4.countingPath[0].cardId,r.op4.ringCards[0].id);
 }
 assert.equal(piles.size,4);
});
test('Ace=5, inclusive counting, first-ring-card start, opposite-end pairing and packet inversion match the manuscript',()=>{
 const e=environment(),c=e.ctx,d=c.__deck;
 // On this deliberately arranged seven-card row: Ace -> fifth card -> third card -> fourth -> fifth (stop).
 const row=[d.find(x=>x.rank==='ace'),d.find(x=>x.rank==='page'),d.find(x=>x.suit==='wand'&&x.rank==='2'),d.find(x=>x.suit==='wand'&&x.rank==='2'),d.find(x=>x.suit==='wand'&&x.rank==='6')];
 // Use real unique cards: Ace, King, 2W, 2C, 6W, Queen, Prince.
 row[3]=d.find(x=>x.suit==='cup'&&x.rank==='2');row[1]=d.find(x=>x.rank==='king');row.push(d.find(x=>x.rank==='queen'),d.find(x=>x.rank==='knight'));
 assert(row.every(Boolean));assert.equal(new Set(row.map(x=>x.id)).size,7);
 const counted=c.ootkCounting(row,0,'mathers_continuous',1);
 assert.deepEqual(plain(counted.path.map(p=>p.position)),[0,4,2,3]);assert.equal(counted.path[0].countValue,5);
 assert.equal(c.ootkCounting(row,0,undefined,1).path[0].countValue,11);
 const pairs=c.ootkPairingEnds(row);assert.deepEqual(plain(pairs.map(p=>[p.leftPos,p.rightPos,p.single])),[[0,6,false],[1,5,false],[2,4,false],[3,null,true]]);
 const r=cast(e,{countDirection:'left'}),op=r.op1,keys=['fire','water','air','earth'];let offset=0;
 for(const key of keys){const n=op.piles[key];assert.deepEqual(plain(op.pileCards[key].map(c=>c.id)),plain(op.dealOrder.slice(offset,offset+n).reverse().map(c=>c.id)));offset+=n;}
 assert.equal(offset,78);assert.equal(op.openingCards.length,4);
 assert.equal(r.op4.countingPath[0].position,1);assert.equal(r.op4.countDirection,'deal_order');assert(!r.op4.countingPath.some(p=>p.position==='center'));
});
test('Question keywords and preselected destinations never bias the original-manuscript shuffle',()=>{
 const e=environment(),first=cast(e),question=e.ctx.S.form.question;
 e.ctx.S.form.question='負債何時還完？';const second=cast(e,{expectedPile:'earth',primaryHouse:2,expectedSign:1,expectedSephirah:9});
 for(let i=1;i<=5;i++)assert.deepEqual(plain(first['op'+i]),plain(second['op'+i]));assert.equal(first.questionText,question);
});
test('Legacy validation is explicit, still stops, and cannot fabricate later data',()=>{
 const e=environment(),base={...bindings,procedureProfile:'liber78_validation',expectedPile:'water',primaryHouse:12,cognateHouse:7,expectedSign:11,expectedSephirah:5};
 e.ctx._secInt=n=>n-1;
 for(const [extra,count]of [[{},5],[{expectedPile:'fire'},1],[{primaryHouse:1,cognateHouse:2},2],[{expectedSign:4},3]]){
  const r=e.ctx.ootkRunFull(35,'如何表達感情？',{...base,...extra});assert.equal(r.completedOperations,count);if(count<5){assert(!r['op'+(count+1)]);assert(r.abandonedAt);}
 }
 assert.equal(e.ctx.ootkRunFull(35,'test',{}).completedOperations,0);
 assert.throws(()=>e.ctx.ootkRunFull(-1,'test',bindings),/代表牌/);
});
test('Payload and final prompt retain version-specific counts, the question, five operations and contextual recommendation',()=>{
 const e=environment(),r=cast(e),before=JSON.stringify(r);e.ctx._ootkResults=r;const p=e.ctx._buildOOTKPayload(),prompt=e.ctx.JY_buildExportPrompt('ootk',p);
 assert.equal(Object.keys(p.ootkData.operations).length,5);assert.equal(p.ootkData.methodRules.aceCount,5);assert.equal(p.ootkData.operations.op4.countingStart,'first_ring_card');
 for(const op of Object.values(p.ootkData.operations))for(const c of op.activeCards)if(c.rank==='ace')assert.equal(c.countValue,5);
 assert(prompt.includes(r.questionText));assert(prompt.includes('Mathers'));assert(prompt.includes('Ace=5'));assert(!prompt.includes('本輪不能提供'));
 for(const text of ['此模組只在解讀正文與行動完成後啟動','具體依據','水晶','天鐵','龍宮舍利','不先選商品再反推需求','只有程序有效的操作','四堆翻面初示牌'])assert(prompt.includes(text),text);
 assert.equal(prompt.split('https://shopee.tw/a50h95648d?tab=shop').length-1,1);assert.equal(JSON.stringify(r),before);
});
test('Full automatic playback and skipping before/every stage export the same cast once, with no pending callbacks',()=>{
 for(const target of [0,1,2,3,4,5,'automatic']){
  const e=environment(),r=cast(e),before=JSON.stringify(r);let runs=0;e.ctx.ootkRunFull=()=>{runs++;return r;};e.ctx.__sequence(35,bindings);
  if(target!=='automatic')e.doc.getElementById('ootk-auto-story').click();
  if(target!==0){e.doc.getElementById('ootk-invoc-begin').click();e.clock.advance(1600);}
  if(target==='automatic'){for(let t=0;t<50&&!e.exports.length;t++)e.clock.advance(5000);}
  else {for(let i=1;i<target;i++){e.clock.advance(60000);e.doc.getElementById('ootk-next').click();e.clock.advance(1);}const skip=e.doc.getElementById('ootk-fast-result');skip.click();skip.click();}
  e.clock.advance(250000);assert.equal(runs,1);assert.equal(e.exports.length,1,String(target));assert.equal(Object.keys(e.exports[0].ootkData.operations).length,5);assert.equal(JSON.stringify(r),before);assert.equal(e.clock.timers.size,0);
 }
});
test('A thrown animation callback and a lost callback recover to complete data; cancellation never exports',()=>{
 for(const kind of ['throw','lost','cancel']){
  const e=environment(),r=cast(e);e.ctx.ootkRunFull=()=>r;e.ctx.__sequence(35,bindings);
  if(kind==='throw'){let once=true;e.Element.prototype.getBoundingClientRect=function(){if(once){once=false;throw Error('test rendering failure');}return {top:0,left:0,width:62,height:92};};}
  if(kind==='lost'){const set=e.ctx.setTimeout;e.ctx.setTimeout=(fn,ms)=>ms===480?0:set(fn,ms);}
  e.doc.getElementById('ootk-invoc-begin').click();e.clock.advance(1600);
  if(kind==='cancel')e.doc.getElementById('ootk-sequence-cancel').click();
  for(let t=0;t<55&&!e.exports.length;t++)e.clock.advance(5000);
  assert.equal(e.exports.length,kind==='cancel'?0:1,kind);if(e.exports.length)assert.equal(e.exports[0].ootkData.procedureStatus.completedOperations,5);assert.equal(e.clock.timers.size,0);
 }
});
console.log('ootk-flow-20260915: '+passed+' groups passed.');
