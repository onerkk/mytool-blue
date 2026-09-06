'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),acorn=require('acorn');
const {environment}=require('./dom-fixture.cjs');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
let passed=0;
function test(name,fn){fn();passed++;console.log('✓ '+name);}
function load(ctx,f){vm.runInContext(read(f),ctx,{filename:f});}
function functionSource(file,name){const src=read(file),ast=acorn.parse(src,{ecmaVersion:'latest',sourceType:'script'});let found;
 function visit(n){if(!n||typeof n!=='object')return;if(n.type==='FunctionDeclaration'&&n.id.name===name)found=src.slice(n.start,n.end);for(const k of Object.keys(n)){if(Array.isArray(n[k]))n[k].forEach(visit);else if(n[k]&&typeof n[k]==='object')visit(n[k]);}}
 visit(ast);assert(found,'Missing actual function '+name);return found;
}
const {ctx,doc,Element}=environment();let alerts=[];ctx.alert=x=>alerts.push(x);ctx.confirm=()=>true;
['picker-core','tarot-foundation','golden-dawn-tarot','tarot','tarot-reading','tarot_upgrade'].forEach(f=>load(ctx,'JS/'+f+'.js'));
const imageSource=read('JS/ui.js').slice(read('JS/ui.js').indexOf('const _tarotImageCache ='),read('JS/ui.js').indexOf('/* =============================================================',read('JS/ui.js').indexOf('function getTarotCardImage')));
vm.runInContext(imageSource,ctx);
// Browser classic scripts share lexical bindings; window properties alone do not set let declarations.
for(const name of ['drawnCards','deckShuffled','pickAnimating'])Object.defineProperty(ctx,name,{configurable:true,get(){return vm.runInContext(name,ctx);},set(value){ctx.__fixtureValue=value;vm.runInContext(name+'=__fixtureValue',ctx);}});
function field(id,tag='input'){let el=doc.getElementById(id);if(!el){el=doc.body.appendChild(new Element(tag));el.id=id;}return el;}
function click(el){assert(el);el.click();}
function close(){const el=doc.getElementById('ootk-sig-overlay');if(el)click(el.querySelector('#ootk-cancel'));}
const uiFunctions=['submitWithTool','jyTarotShuffleArray','jyTarotBuildDraw','jyTarotFillSlots','renderTarotSpreadDisplay'];
uiFunctions.forEach(n=>vm.runInContext(functionSource('JS/ui.js',n),ctx));
ctx._selectedTool='ootk';ctx._selectedPresetQ='';ctx._checkQuestionQuality=()=>'';ctx._jyStartOOTK=ctx.startOOTK;
field('f-question').value='我的真命天女出現了嗎？她差我幾歲？';
test('Real OOTK entry opens without calling unrelated birth engines',()=>{
 ctx._readBirthForm=()=>{throw Error('Birth fields must not be required');};
 ctx.submitWithTool();const panel=doc.getElementById('ootk-sig-overlay');assert(panel&&panel.open);assert.equal(panel.querySelectorAll('.ootk-manual-sig').length,16);assert.equal(panel.querySelectorAll('select').length,6);assert.equal(alerts.length,0);
 ctx.submitWithTool();assert.equal(doc.querySelectorAll('#ootk-sig-overlay').length,1);close();
});
test('Storage refusal does not break the entry button',()=>{
 ctx._checkQuestionQuality=()=> '可以補充情境';ctx.sessionStorage={getItem(){throw Error('Storage blocked');},setItem(){throw Error('Storage blocked');}};
 ctx.submitWithTool();assert(doc.getElementById('ootk-sig-overlay'));close();ctx._checkQuestionQuality=()=>'';
});
test('OOTK two-step selection validates before dealing and restores scroll on cancel',()=>{
 doc.body.style.overflow='auto';ctx.startOOTK();const panel=doc.getElementById('ootk-sig-overlay'),next=panel.querySelector('#ootk-confirm');
 click(next);assert(panel.querySelector('#ootk-setup-error').textContent.includes('代表牌'));
 click(panel.querySelector('.ootk-manual-sig'));click(next);assert.equal(panel.querySelector('#ootk-setup-step1').style.display,'none');
 click(next);assert(panel.querySelector('#ootk-setup-error').textContent);assert(panel.isConnected);
 click(panel.querySelector('#ootk-back'));assert.equal(panel.querySelector('#ootk-setup-step1').style.display,'');close();assert.equal(doc.body.style.overflow,'auto');
});
test('Shared setup exports accept zero-index sign and sephirah without losing them',()=>{
 const b=ctx.OOTKSetup.normalizeBindings({expectedPile:'water',primaryHouse:'7',cognateHouse:'5',expectedSign:'0',expectedSephirah:'0',countDirection:'right',confirmedBeforeDeal:true});assert.equal(b.expectedSign,0);assert.equal(b.expectedSephirah,0);assert.equal(b.confirmedBeforeDeal,true);assert.equal(ctx.OOTKSetup.signs.length,12);
});
// The production selection UI calls the production engine; only animation continuation is captured.
const env2=environment(),c2=env2.ctx;['picker-core','tarot-foundation','golden-dawn-tarot','tarot','tarot-reading'].forEach(f=>load(c2,'JS/'+f+'.js'));
vm.runInContext(imageSource,c2);
vm.runInContext(read('JS/tarot_upgrade.js').replace('  function _runOOTKSequence(', '  window.__setupContinue=function(sig,bindings){window.__confirmed={sig,bindings};};\n  function _runOOTKSequence(').replace('_runOOTKSequence(sigId, bindings);','window.__setupContinue(sigId, bindings);'),c2);
test('Confirmed OOTK setup forwards all predeal bindings as an immutable snapshot',()=>{
 c2.S.form={question:'工作如何發展？'};c2.startOOTK();const p=c2.document.getElementById('ootk-sig-overlay');click(p.querySelector('.ootk-manual-sig'));click(p.querySelector('#ootk-confirm'));
 for(const [id,value] of Object.entries({direction:'right',pile:'fire','house-primary':'10','house-cognate':'6',sign:'0',seph:'0'}))p.querySelector('#ootk-bind-'+id).value=value;
 click(p.querySelector('#ootk-confirm'));assert(!p.isConnected);assert(c2.__confirmed);assert(Object.isFrozen(c2.__confirmed.bindings));assert.equal(c2.__confirmed.bindings.expectedSign,0);
});
['bazi-prompt-root','ziwei-prompt-root','bazi-standalone','ziwei-standalone'].forEach(f=>load(ctx,'JS/'+f+'.js'));
test('Ziwei uses one non-interactive grid with all 13 valid child buttons',()=>{
 ctx._zwxOpenHH();const p=doc.getElementById('zwx-sheet-bd'),grid=p.querySelector('.zwx-sc-grid');assert.equal(grid.tagName,'DIV');assert.equal(grid.querySelectorAll('button').length,13);for(const b of p.querySelectorAll('button'))assert.equal(b.querySelectorAll('button').length,0);
 ctx._zwxPickHH(23);assert(!p.isConnected);
});
test('Bazi hour and minute fields are complete on open and keep node identity when edited',()=>{
 field('bzx-time');field('bzx-unknown');ctx._bzxOpenTime();const p=doc.getElementById('bzx-sheet-bd'),body=p.querySelector('#bzx-sheet-body'),h=body.querySelector('[data-jy-hour]'),m=body.querySelector('[data-jy-minute]');
 assert.equal(h.querySelectorAll('option').length,24);assert.equal(m.querySelectorAll('option').length,60);h.value='23';m.value='59';h.focus();body.dispatch('change',{target:m});assert.equal(body.querySelector('[data-jy-hour]'),h);assert.equal(doc.activeElement,h);ctx._bzxSheetConfirm();assert.equal(doc.getElementById('bzx-time').value,'23:59');
 ctx._bzxOpenTime();const body2=doc.getElementById('bzx-sheet-body'),unknown=body2.querySelector('[data-jy-unknown]');unknown.checked=true;body2.dispatch('change',{target:unknown});assert(body2.querySelector('[data-jy-hour]').disabled);ctx._bzxSheetConfirm();assert(doc.getElementById('bzx-unknown').checked);
});
vm.runInContext(read('JS/bazi-suite.js').replace('  function openPicker(type,prefix,allowUnknown){','  window.__testOpenPicker=openPicker;\n  function openPicker(type,prefix,allowUnknown){'),ctx);
test('Full Bazi suite commits minutes and cancellation preserves the original time',()=>{
 field('s-time').value='03:07';field('s-unknown');ctx.__testOpenPicker('time','s');let p=doc.getElementById('bzs-picker-bd'),body=p.querySelector('#bzs-picker-body'),h=body.querySelector('[data-jy-hour]'),m=body.querySelector('[data-jy-minute]');h.value='0';m.value='1';body.dispatch('change',{target:h});p.dispatch('click',{target:p.querySelector('[data-picker-act="confirm"]')});assert.equal(doc.getElementById('s-time').value,'00:01');
 ctx.__testOpenPicker('time','s');p=doc.getElementById('bzs-picker-bd');body=p.querySelector('#bzs-picker-body');h=body.querySelector('[data-jy-hour]');h.value='22';body.dispatch('change',{target:h});p.dispatch('click',{target:p.querySelector('[data-picker-act="cancel"]')});assert.equal(doc.getElementById('s-time').value,'00:01');
});
const def=ctx.SPREAD_DEFS.five_card;ctx.getCurrentSpread=()=> 'five_card';ctx.getCurrentSpreadDef=()=>def;ctx.S.form={question:'要繼續目前工作，還是轉職？',type:'work'};ctx.S.tarot={spreadDef:def,spreadType:'five_card'};
let flips=0;ctx._secRand=()=>flips++%2?0.9:0.1;
test('Canonical draws include actual upright/reversed values and normalization preserves them',()=>{
 const cards=ctx.JY_buildCanonicalTarotDraw(ctx.TAROT.slice(),'five_card',def,'fixture','work',ctx.S.form.question);assert.equal(cards.length,5);assert.equal(cards[0].isUp,false);assert.equal(cards[1].isUp,true);assert(cards.every(c=>c.sourceProfile==='rws_reversals'));
 const before=cards.map(c=>c.isUp);ctx.JYGoldenDawn.normalizeDraw(cards);ctx.enhanceTarot({drawn:cards});assert.deepEqual(cards.map(c=>c.isUp),before);assert.equal(ctx.JYTarotReading.stats(cards).rvCount,3);ctx.drawnCards=cards;ctx.S.tarot.drawn=cards;
});
test('Book T procedures stay upright and are explicitly labelled',()=>{
 const cards=ctx.JY_buildCanonicalTarotDraw(ctx.TAROT.slice(),'fifteen_card',ctx.SPREAD_DEFS.fifteen_card,'fixture','general','工作？');assert.equal(cards.length,15);assert(cards.every(c=>c.isUp===true&&c.sourceProfile==='gd_book_t'));assert(ctx.JYTarotReading.label(cards[0]).includes('正向'));
});
test('Quick completion preserves manually chosen card identities and their directions',()=>{
 const card=ctx.JYTarotReading.apply(Object.assign({},ctx.TAROT[27]),false,'five_card');ctx.drawnCards=[card];ctx.deckShuffled=ctx.TAROT.slice();const cards=ctx.jyTarotBuildDraw(def,'five_card');assert.equal(cards.length,5);assert.equal(cards[0],card);assert.equal(cards[0].isUp,false);assert.equal(new Set(cards.map(c=>c.id)).size,5);ctx.drawnCards=cards;ctx.S.tarot.drawn=cards;
});
test('Automatic slot rendering and result display retain inverse image and readable direction',()=>{
 for(let i=0;i<5;i++)field('t-slot-'+i,'div');ctx.jyTarotFillSlots(ctx.drawnCards,'five_card',def);const first=doc.getElementById('t-slot-0');assert(first.innerHTML.includes('rotate(180deg)'));assert(first.innerHTML.includes('逆位 ↓'));assert(first.innerHTML.includes('tarot-reveal-back'));assert(first.innerHTML.includes('data-jy-preview'));
 field('tarot-spread-display','div');field('tarot-spread-title','div');ctx.renderTarotSpreadDisplay();assert(doc.getElementById('tarot-spread-title').textContent.includes('RWS'));assert(doc.getElementById('tarot-spread-display').innerHTML.includes('逆位 ↓'));
});
vm.runInContext(functionSource('JS/ai-analysis.js','_buildTarotOnlyPayload'),ctx);ctx._jyTarotQuestionText=()=>ctx.S.form.question;load(ctx,'JS/prompt-export.js');
test('Real AI payload and final exported prompt agree on every card orientation and method',()=>{
 const payload=ctx._buildTarotOnlyPayload();assert.equal(payload.tarotData.sourceProfile,'rws_reversals');assert.equal(payload.tarotData.cards[0].isUp,false);assert.equal(payload.tarotData.cards[0].direction,'逆位');assert(!JSON.stringify(payload.tarotData.cards).includes('bookTTitle'));
 const p=ctx.JY_buildExportPrompt('tarot');assert(p.includes('Rider–Waite–Smith'));ctx.drawnCards.forEach(c=>assert(p.includes(c.n+'【'+(c.isUp?'正位':'逆位')+'】')));assert(!p.includes('一般牌陣正向展示'));assert(!p.includes('Book T原典核心義'));assert(p.includes('替代解讀'));assert(p.includes('驗證訊號'));
 const original=ctx.drawnCards.slice();ctx.S.tarot.drawn=original.slice(0,3);assert.throws(()=>ctx._buildTarotOnlyPayload(),/Card count mismatch/);ctx.S.tarot.drawn=original;
});
// Test actual manual pick timers, without animation/layout claims.
test('Manual pick commits its original reversal and waits for the entire spread before analysis',()=>{
 let now=0,seq=0,queue=[];ctx.setTimeout=(fn,ms=0)=>{queue.push({fn,at:now+ms,n:seq++});return seq;};ctx.requestAnimationFrame=fn=>{fn();return 1;};ctx.showSpread=()=>{};
 ctx.drawnCards=[];ctx.deckShuffled=ctx.TAROT.slice();ctx.S.tarot={spreadDef:def,spreadType:'five_card'};ctx._deckIsShuffled=true;ctx._secRand=()=>0.1;field('btn-analyze','button').disabled=true;
 const deck=field('test-deck','div');deck.className='tarot-deck-card';ctx.pickCard(0,deck);
 for(let i=0;queue.length&&i<200;i++){queue.sort((a,b)=>a.at-b.at||a.n-b.n);const q=queue.shift();now=q.at;q.fn();}
 assert.equal(ctx.drawnCards.length,1);assert.equal(ctx.drawnCards[0].isUp,false);assert(doc.getElementById('t-slot-0').innerHTML.includes('逆位 ↓'));assert(doc.getElementById('btn-analyze').disabled);assert.equal(alerts.length,0);
});
test('Concurrent engine requests share one script and notify every caller; a failed load can retry',()=>{
 const env=environment(),src=read('JS/ui.js');vm.runInContext(src.slice(src.indexOf('  var jyScriptLoads={};'),src.indexOf('  window._ziweiOpen',src.indexOf('  var jyScriptLoads={};'))),env.ctx);
 const results=[];env.ctx._jyLazyScript('JS/bazi.js?v=one',ok=>results.push(ok));env.ctx._jyLazyScript('JS/bazi.js?v=two',ok=>results.push(ok));
 assert.equal(env.doc.body.children.length,1);env.doc.body.children[0].onload();assert.deepEqual(results,[true,true]);
 env.ctx._jyLazyScript('JS/bazi.js?v=three',ok=>results.push(ok));assert.equal(env.doc.body.children.length,1);assert.equal(results.length,3);
 env.ctx._jyLazyScript('JS/name_upgrade.js',ok=>results.push(ok));env.doc.body.children[1].onerror();assert.equal(results.at(-1),false);env.ctx._jyLazyScript('JS/name_upgrade.js',()=>{});assert.equal(env.doc.body.children.length,3);
});
test('Deferred engines wait for a closed picker and yield between dependent files',()=>{
 const env=environment(),src=read('index.html'),start=src.lastIndexOf('(function(){',src.indexOf('  var DEFERRED = [')),end=src.indexOf('</script>',start);let idle=[],timers=[],loads=[],open=true;
 env.ctx.requestIdleCallback=fn=>idle.push(fn);env.ctx.setTimeout=fn=>timers.push(fn);env.doc.querySelector=()=>open?{}:null;env.ctx._jyLazyScript=(src,done)=>loads.push({src,done});
 vm.runInContext(src.slice(start,end),env.ctx);idle.shift()();assert.equal(loads.length,0);open=false;timers.shift()();idle.shift()();assert.equal(loads.length,1);assert.equal(idle.length,0);loads[0].done(true);assert.equal(loads.length,1);idle.shift()();assert.equal(loads.length,2);assert(loads[0].src.includes('ephemeris'));assert(loads[1].src.includes('solar-location'));
});
test('Real OOTK confirmation runs the engine and exposes immediate skip/cancel controls',()=>{
 ctx.setTimeout=()=>7;const cancelled=[];ctx.clearTimeout=id=>cancelled.push(id);ctx.S.form={question:'工作如何發展？'};ctx.startOOTK();const panel=doc.getElementById('ootk-sig-overlay');click(panel.querySelector('.ootk-manual-sig'));click(panel.querySelector('#ootk-confirm'));
 for(const [id,value] of Object.entries({direction:'right',pile:'fire','house-primary':'10','house-cognate':'6',sign:'9',seph:'9'}))panel.querySelector('#ootk-bind-'+id).value=value;
 click(panel.querySelector('#ootk-confirm'));assert(!panel.isConnected);const seq=doc.getElementById('ootk-sequence-overlay');assert(seq);assert(ctx.S.tarot.ootkResults);assert.equal(ctx.S.tarot.spreadType,'ootk');assert(seq.querySelector('#ootk-fast-result'));assert(seq.querySelector('#ootk-invocation').classList.contains('show-btn'));
 const actualResult=ctx.S.tarot.ootkResults;click(seq.querySelector('#ootk-sequence-cancel'));assert(!seq.isConnected);assert(cancelled.includes(7));assert.equal(ctx.S.tarot.ootkResults,actualResult);assert.equal(alerts.length,0);
});
test('Skipping the ritual hands off the same result and exports only actual OOTK operations',()=>{
 vm.runInContext(functionSource('JS/ai-analysis.js','_buildOOTKPayload'),ctx);
 const originalRenderer=ctx.JY_renderExportPrompt;let handed=null;ctx.JY_renderExportPrompt=(tool)=>{handed={tool,result:ctx._ootkResults};};ctx.goStep=()=>{};
 ctx.startOOTK();const panel=doc.getElementById('ootk-sig-overlay');click(panel.querySelector('.ootk-manual-sig'));click(panel.querySelector('#ootk-confirm'));
 for(const [id,value] of Object.entries({direction:'right',pile:'fire','house-primary':'10','house-cognate':'6',sign:'9',seph:'9'}))panel.querySelector('#ootk-bind-'+id).value=value;
 click(panel.querySelector('#ootk-confirm'));const actual=ctx.S.tarot.ootkResults,seq=doc.getElementById('ootk-sequence-overlay');click(seq.querySelector('#ootk-fast-result'));assert(!seq.isConnected);assert.equal(handed.tool,'ootk');assert.equal(handed.result,actual);
 const payload=ctx._buildOOTKPayload();assert(payload.ootkData);const prompt=ctx.JY_buildExportPrompt('ootk');assert(prompt.includes('Opening of the Key'));assert(prompt.includes('Book T'));assert(!prompt.includes('RWS・正逆位'));ctx.JY_renderExportPrompt=originalRenderer;
});
console.log('interaction-hotfix: '+passed+' groups passed (offline DOM/runtime contracts; no browser layout or live AI assertion)');
