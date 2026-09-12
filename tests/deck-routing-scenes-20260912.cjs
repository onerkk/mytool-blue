'use strict';
// Regressions for reported defects. Real engines/controllers, synthetic inputs.
// DOM/CSS contracts and CPU geometry do not substitute for Android/GPU pixel QA.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),acorn=require('acorn');
const {fixture,load,add}=require('./ritual-lifecycle-20260911.cjs');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8'),plain=x=>JSON.parse(JSON.stringify(x));
const parse=require('../JS/shared/decision-parser.js'),F=require('../JS/tarot-foundation.js');
let passed=0;const evidence={environment:'Node VM with actual source; no physical-device/GPU pixel test',routing:[],ootk:[],scenery:[]};
function test(name,fn){try{fn();passed++;console.log('PASS '+name);}catch(e){process.exitCode=1;console.error('FAIL '+name+'\n'+e.stack);}}
function actual(file,name){const src=read(file);let found;function walk(n){if(!n||typeof n!=='object')return;if(n.type==='FunctionDeclaration'&&n.id?.name===name)found=src.slice(n.start,n.end);for(const v of Object.values(n))if(Array.isArray(v))v.forEach(walk);else if(v&&typeof v==='object')walk(v);}walk(acorn.parse(src,{ecmaVersion:'latest'}));assert(found,name);return found;}
function dom(){const e=fixture(),p=e.Element.prototype;Object.defineProperty(p,'parentElement',{get(){return this.parentNode;}});p.prepend=function(n){this.insertBefore(n,this.children[0]);};p.after=function(n){this.parentNode.insertBefore(n,this.parentNode.children[this.parentNode.children.indexOf(this)+1]);};return e;}
const le=dom();vm.runInContext(read('JS/lenormand.js').replace(/\}\)\(\);\s*$/,`window.__ln={analyze:_lnAnalyzeQuestion,route:_lnDetectSpread,prompt:buildPrompt,cards:CARDS,spreads:SPREADS};})();`),le.ctx);const LN=le.ctx.__ln;
const cases=[
 ['她還是喜歡我嗎？','none'],['她還是會跟我告白嗎？','none'],['他明年還是會升職嗎？','none'],
 ['工作會變好還是變糟？','hypotheses'],['明年是機會還是挑戰？','hypotheses'],['她是真心喜歡我還是只是把我當朋友？','hypotheses'],['她是不是很忙還是沒興趣？','hypotheses'],['他比較喜歡我還是她？','hypotheses'],['價格會上漲還是下跌？','hypotheses'],
 ['我該跟她告白還是維持朋友？','binary','跟她告白','維持朋友'],
 ['我該留在原公司，還是搬到高雄工作？','binary','留在原公司','搬到高雄工作'],
 ['A：先接案兩週，還是 B：留在原公司三個月？','binary','先接案兩週','留在原公司三個月'],
 ['A：先接案兩週；B：留在原公司三個月？','binary','先接案兩週','留在原公司三個月'],
 ['A：先接案兩週\nB：留在原公司三個月？','binary','先接案兩週','留在原公司三個月'],
 ['我有兩種做法：A 先與主管討論工作分工，或 B 先整理兩週工作紀錄再談。哪個更適合改善溝通？請分別分析代價與下一步。','binary','先與主管討論工作分工','先整理兩週工作紀錄再談'],
 ['A 先與主管討論分工，還是 B 先整理兩週紀錄再談，哪個更適合改善溝通？','binary','先與主管討論分工','先整理兩週紀錄再談'],
 ['我和女友應該搬到台南還是高雄？','binary','搬到台南','高雄'],
 ['請比較我留在工廠與全職做副業，哪個適合？','binary','留在工廠','全職做副業'],
 ['我可以留下，或者辭職嗎？','binary','留下','辭職'],
 ['我應該接受A公司的offer還是留在B公司？','binary','接受A公司的offer','留在B公司'],
 ['我應該接受一年合約，還是繼續做三個月接案？','binary','接受一年合約','繼續做三個月接案'],
 ['要不要主動聯絡他？','binary','主動聯絡他','暫不採取「主動聯絡他」，維持目前安排'],
 ['我該選台南、台中還是高雄？','multiple'],['我要選 A 或 B 或 C？','multiple'],['A：台北，B：台南，C：高雄？','multiple'],['我該選台南，台中還是高雄？','multiple'],
 ['A 台北 B 台南 C 高雄？','multiple'],['A：先接案；B：','incomplete'],
 ['我應該留下還是？','incomplete'],['還是接受新工作？','incomplete'],['要選哪個？','incomplete'],
 ['我跟她會在一起嗎？','none'],['公司女工程師會跟我交往嗎？','none'],['我和主管的工作關係會好轉嗎？','none'],['我能在明年底前還完120萬嗎？','none'],['他是不是比較喜歡我？','none'],['請不要用凱爾特十字，我該怎麼改善收入？','none'],['今年工作、感情、財務各自怎樣？','none'],['我還是想知道工作何時會有消息？','none'],['雨天或晴天呢？','ambiguous']
];
test('Both independent readers use the identical embedded parser',()=>{
 const canonical=read('JS/shared/decision-parser.js').split('\nif (typeof module')[0];
 for(const f of ['JS/tarot-foundation.js','JS/lenormand.js'])assert.equal(read(f).split('// BEGIN SHARED DECISION PARSER\n')[1].split('\n// END SHARED DECISION PARSER')[0],canonical);
});
test('40 new questions: continuation, hypotheses, choices, missing operands and three options stay distinct',()=>{
 for(const [q,kind,a,b] of cases){
  const d=parse(q),r=F.routeQuestion(q),l=LN.analyze(q);assert.equal(d.kind,kind,q);assert.equal(l.isChoice,kind==='binary',q+' LN');
  const comparison=r.compiledQuestion.relations.find(r=>r.type==='alternative_comparison');
  if(kind==='binary'){
   assert.equal(r.spreadId,'either_or',q);assert.equal(LN.route(q).id,'choice',q);assert.equal(d.left,a,q);assert.equal(d.right,b,q);
   assert.equal(l.choiceA,a,q);assert.equal(l.choiceB,b,q);assert.equal(comparison.left,a,q);assert.equal(comparison.right,b,q);
   assert.equal(r.methodPlan.slots[1].binding.entity,a);assert.equal(r.methodPlan.slots[2].binding.entity,b);assert(r.reason.includes(a)&&r.reason.includes(b));
  }else{assert.equal(r.compiledQuestion.features.choice,false,q+' semantic intent');assert(!comparison,q);assert.notEqual(r.spreadId,'either_or',q);assert.notEqual(LN.route(q).id,'choice',q);}
  if(q==='他明年還是會升職嗎？'){assert.equal(r.compiledQuestion.features.knownDyad,false,'a third-person career event is not a dyad');assert.equal(r.spreadId,'five_card');}
  evidence.routing.push({question:q,kind,tarot:r.spreadId,lenormand:LN.route(q).id,options:kind==='binary'?[a,b]:[]});
 }
});
test('Actual Lenormand prompt preserves options, all seven card ids and branch geometry',()=>{
 for(const [q,kind,a,b] of cases.filter(x=>x[1]==='binary')){
  const cards=LN.cards.slice(0,7),before=JSON.stringify(cards),out=LN.prompt(q,cards,'choice');
  assert(out.includes('A＝'+a+'；B＝'+b),q);assert(out.includes(q));for(const card of cards)assert(out.includes(card.zh||card.name||card.n),q);
  assert.equal(JSON.stringify(cards),before);assert(!/undefined|NaN/.test(out));
 }
});
const bindings={confirmedBeforeDeal:true,countDirection:'right',expectedPile:'water',primaryHouse:12,cognateHouse:7,expectedSign:11,expectedSephirah:5};
function engine(){
 const e=dom();e.ctx.console={log(){},warn:console.warn,error:console.error};['picker-core','tarot-foundation','golden-dawn-tarot','tarot','tarot-reading'].forEach(f=>load(e,f));
 vm.runInContext(read('JS/tarot_upgrade.js').replace('window._ootkTriggerAI = _triggerOOTKAI;', 'window._ootkTriggerAI = _triggerOOTKAI;window.__sequence=_runOOTKSequence;window.__record=_ootkCompletionHTML;'),e.ctx);
 vm.runInContext(actual('JS/ai-analysis.js','_buildOOTKPayload'),e.ctx);e.ctx._jyTarotQuestionText=()=>e.ctx.S.form.question;
 e.ctx.S.form={question:'如何坦白表達需要？'};e.ctx.goStep=()=>{};e.ctx._ootkResults=null;
 e.exports=[];e.ctx.JY_renderExportPrompt=(mode,host)=>{e.exports.push(plain(e.ctx._buildOOTKPayload()));host.innerHTML='<div class="test-export">原提示詞出口</div>';};
 return e;
}
function fixed(e,bind=bindings){const original=e.ctx.Math.random;e.ctx.Math.random=()=>.999999;try{return e.ctx.ootkRunFull(35,e.ctx.S.form.question,bind);}finally{e.ctx.Math.random=original;}}
test('Real Key engine retains five operations and valid stopping states without retrying for a match',()=>{
 const e=engine();
 for(const [label,bind,count] of [['full',bindings,5],['first',{...bindings,expectedPile:'fire'},1],['second',{...bindings,primaryHouse:1,cognateHouse:2},2],['third',{...bindings,expectedSign:4},3],['predeal',{},0]]){
  const r=fixed(e,bind),before=JSON.stringify(r);assert.equal(r.completedOperations,count,label);
  const view=e.ctx.__record(r),html=add(e,'div','record-'+label);html.innerHTML=view;
  assert.equal(html.querySelectorAll('.ootk-record-row').length,5);assert.equal(html.querySelectorAll('[data-record-state="not-run"]').length,5-count);
  if(count===5){assert.equal(r.op4.activeCards.length,37);assert.equal(r.op4.ringPairs.length,18);assert(!view.includes('NaN'));assert(view.includes('中央代表牌'));}
  if(count&&count<5)assert(view.includes(r['op'+count].abandonReason));assert.equal(JSON.stringify(r),before);
  evidence.ootk.push({case:label,completed:count,rows:5,abandonedAt:r.abandonedAt||null});if(process.env.JY_CRAFT_EVIDENCE&&(count===5||count===1)){const f=path.join(path.dirname(process.env.JY_CRAFT_EVIDENCE),'ootk-preview-'+label+'.json');fs.writeFileSync(f,JSON.stringify(r));}
 }
});
test('Skip before entrance and in each of five operations exports the same immutable calculation exactly once',()=>{
 let expected;
 for(const target of [0,1,2,3,4,5,'finish']){
  const e=engine(),r=fixed(e),before=JSON.stringify(r);let computations=0;
  e.ctx.ootkRunFull=()=>{computations++;return r;};
  e.ctx.__sequence(35,bindings);assert.equal(computations,1);const fast=e.doc.getElementById('ootk-fast-result');
  if(target!==0){
   e.doc.getElementById('ootk-invoc-begin').click();e.clock.advance(1600);
   const phaseTarget=target==='finish'?5:target;
   for(let phase=1;phase<phaseTarget;phase++){e.clock.advance(120000);e.doc.getElementById('ootk-next').click();e.clock.advance(1);}
   const active=e.doc.querySelector('.ootk-dot.current');assert(active&&Number(active.dataset.idx)===phaseTarget-1,'reached real operation '+phaseTarget);
  }
  if(target==='finish'){e.clock.advance(120000);e.doc.getElementById('ootk-next').click();}else{fast.click();fast.click();}
  e.clock.advance(240000);assert.equal(computations,1);assert.equal(e.exports.length,1,'one result delivery: '+target);
  assert.equal(JSON.stringify(r),before);assert.equal(e.doc.querySelectorAll('.ootk-record-row').length,5);assert.equal(e.doc.getElementById('ootk-sequence-overlay'),null);
  const payload=e.exports[0];assert.equal(payload.ootkData.procedureStatus.completedOperations,5);
  // Timestamps are fixed within each cast; compare complete operation data, not cast time.
  if(!expected)expected=payload.ootkData.operations;else assert.deepEqual(payload.ootkData.operations,expected);
  assert.equal(e.clock.timers.size,0);evidence.ootk.push({skipAt:target,calculations:computations,exports:e.exports.length,exportedOperations:Object.keys(payload.ootkData.operations)});
 }
});
test('A skipped abandoned reading cannot acquire fabricated later operations',()=>{
 const e=engine(),r=fixed(e,{...bindings,expectedPile:'fire'});e.ctx.ootkRunFull=()=>r;e.ctx.__sequence(35,bindings);e.doc.getElementById('ootk-fast-result').click();e.clock.advance(5000);
 assert.deepEqual(Object.keys(e.exports[0].ootkData.operations),['op1']);assert(e.exports[0].ootkData.procedureStatus.abandoned);assert.equal(e.doc.querySelectorAll('[data-record-state="not-run"]').length,4);
});
test('Native picker paints 78 identical opaque backs while keeping only one image per card after reinitialization',()=>{
 const e=dom(),stage=add(e,'div','t-deck');stage.clientWidth=360;stage.scrollWidth=4000;
 stage.innerHTML=['top','bot'].map((row,j)=>'<div id="t-row-'+row+'">'+Array.from({length:39},(_,i)=>'<div class="tarot-deck-card" data-idx="'+(i+j*39)+'"><div class="tarot-deck-card-inner"><div class="tdc-face" style="display:none"></div><div class="tdc-back"></div></div></div>').join('')+'</div>').join('');
 vm.runInContext('var _deck3dCleanup=null,_deck3dRAF=null,_deck3dTopOff=0,_deck3dBotOff=0,_deck3dDragging=false;window.JYTarotDeckBrowse={};window._deckIsShuffled=true;'+actual('JS/tarot.js','_startDeck3D'),e.ctx);
 for(let i=0;i<3;i++)e.ctx._startDeck3D(39,39);
 assert.equal(stage.querySelectorAll('.tdc-back-art').length,78);assert.equal(stage.querySelectorAll('.tdc-face img').length,0);
 for(const img of stage.querySelectorAll('.tdc-back-art')){assert.equal(img.getAttribute('src'),'assets/ui/tarot-back-moon-gold.jpg');assert.equal(img.getAttribute('draggable'),'false');}
 const css=read('CSS/living-cards.css');assert(css.includes('transform-style:flat!important'));assert(css.includes('backface-visibility:visible!important'));assert(css.includes('background-color:#0d1720!important'));e.ctx._deck3dCleanup();assert.equal(e.clock.timers.size,0);
});
(async()=>{
 try{
  const T=await import('three'),{buildCraft}=await import('../JS/cinematic-src/craft.mjs');
  let textureCalls=0;const gradient={addColorStop(){}},ctx=new Proxy({createLinearGradient(){return gradient;}},{get:(o,k)=>k in o?o[k]:(()=>{}),set(o,k,v){o[k]=v;return true;}});
  const kept=new Set(),craft=buildCraft({keep:x=>(kept.add(x),x),gold:new T.MeshPhysicalMaterial(),accent:new T.Color('#dab98b'),doc:{createElement(){return {getContext(){textureCalls++;return ctx;}};}}});
  for(const [name,node] of [['door',craft.door(1.85,5.6)],['table',craft.table(new T.Group())]]){
   let draws=0,vertices=0;const box=new T.Box3().setFromObject(node);node.traverse(n=>{if(n.isMesh){draws++;vertices+=n.geometry.attributes.position.count;assert(n.geometry.attributes.position.array.every(Number.isFinite));}});
   assert(box.max.z-box.min.z>.1);assert(draws<=8,'batched materials: '+name);assert(vertices>1000,'actual geometry relief');evidence.scenery.push({object:name,drawCalls:draws,vertices,depth:box.max.z-box.min.z});
  }
  assert.equal(textureCalls,3);assert(craft.enamel.map&&craft.stone.map&&craft.wood.map);kept.forEach(x=>x.dispose());passed++;console.log('PASS Batched relief geometry and three local textures build without remote resources');
 }catch(e){process.exitCode=1;console.error('FAIL Craft geometry\n'+e.stack);}
 if(process.env.JY_CRAFT_EVIDENCE)fs.writeFileSync(process.env.JY_CRAFT_EVIDENCE,JSON.stringify({...evidence,passed,success:!process.exitCode},null,2)+'\n');
 console.log('Craft: '+passed+' groups passed; '+cases.length+' new routing cases. No physical-phone or GPU pixel claim.');
})();
