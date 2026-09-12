'use strict';
// Run the actual interaction functions in a controlled DOM and clock.
// Physical touch, rendered CSS and WebGL pixels require separate browser QA.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),acorn=require('acorn');
const {fixture,load,add}=require('./ritual-lifecycle-20260911.cjs');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
let passed=0;
async function test(name,fn){try{await fn();passed++;console.log('✓ '+name);}catch(error){process.exitCode=1;console.error('✗ '+name+'\n'+error.stack);}}
function actual(file,name,assignment=false,first=false){const source=read(file);let found;function walk(n){if(!n||typeof n!=='object')return;if(!assignment&&n.type==='FunctionDeclaration'&&n.id?.name===name)found=source.slice(n.start,n.end);if(assignment&&n.type==='AssignmentExpression'&&n.left.object?.name==='window'&&n.left.property?.name===name&&(!found||!first))found=source.slice(n.start,n.end)+';';Object.values(n).forEach(v=>Array.isArray(v)?v.forEach(walk):v&&typeof v==='object'&&walk(v));}walk(acorn.parse(source,{ecmaVersion:'latest'}));assert(found,name);return found;}
function dom(){const e=fixture(),p=e.Element.prototype;Object.defineProperty(p,'parentElement',{get(){return this.parentNode;}});p.before=function(n){this.parentNode.insertBefore(n,this);};p.after=function(n){const parent=this.parentNode;parent.insertBefore(n,parent.children[parent.children.indexOf(this)+1]);};const append=p.appendChild;p.appendChild=function(n){n.remove();return append.call(this,n);};return e;}
function deck(){
 const e=dom(),stage=add(e,'div','t-deck');
 stage.innerHTML='<div id="t-row-top">'+Array.from({length:12},(_,i)=>'<div class="tarot-deck-card" data-idx="'+i%6+'"><div></div></div>').join('')+'</div><div id="t-row-bot">'+Array.from({length:12},(_,i)=>'<div class="tarot-deck-card" data-idx="'+(6+i%6)+'"><div></div></div>').join('')+'</div>';
 stage.setPointerCapture=()=>{};
 stage.getBoundingClientRect=()=>({top:0,left:0,right:360,bottom:290,width:360,height:290});
 vm.runInContext('var _deck3dCleanup=null,_deck3dRAF=null,_deck3dTopOff=0,_deck3dBotOff=0,_deck3dDragging=false;window.JYTarotDeckBrowse={};window._deckIsShuffled=true;'+actual('JS/tarot.js','_startDeck3D')+actual('JS/tarot.js','_update3DCards')+';_startDeck3D(6,6);',e.ctx);
 return Object.assign(e,{stage});
}
function point(el,type,x,y,id=1,extra={}){el.dispatch(type,{clientX:x,clientY:y,pointerId:id,isPrimary:true,button:0,cancelable:true,...extra});}
(async()=>{
 await test('Dragging the table moves both rows with the finger and suppresses the following pointer click',()=>{
  const e=deck(),before=e.ctx._deck3dTopOff;
  point(e.stage,'pointerdown',160,80);point(e.stage,'pointermove',202,81);e.clock.advance(16);
  assert.equal(e.ctx._deck3dTopOff-before,42);assert.equal(e.ctx._deck3dBotOff,e.ctx._deck3dTopOff);
  assert(e.stage.classList.contains('is-dragging'));point(e.stage,'pointerup',202,81);
  let prevented=false,stopped=false;e.stage.dispatch('click',{detail:1,preventDefault:()=>prevented=true,stopImmediatePropagation:()=>stopped=true});
  assert(prevented&&stopped);const resting=e.ctx._deck3dTopOff;e.clock.advance(5000);assert.equal(e.ctx._deck3dTopOff,resting);assert.equal(e.clock.timers.size,0);
 });
 await test('Vertical scrolling and tiny taps do not move the deck or consume a normal card click',()=>{
  const e=deck(),before=e.ctx._deck3dTopOff;
  point(e.stage,'pointerdown',160,80);point(e.stage,'pointermove',161,170);point(e.stage,'pointercancel',161,170);e.clock.advance(100);
  assert.equal(e.ctx._deck3dTopOff,before);point(e.stage,'pointerdown',160,80);point(e.stage,'pointermove',163,82);point(e.stage,'pointerup',163,82);
  e.stage.dispatch('click',{detail:1,preventDefault(){throw Error('tap consumed');},stopImmediatePropagation(){throw Error('tap blocked');}});
 });
 await test('Browse buttons and keyboard arrows work without a drag; reinitialization removes old listeners and frames',()=>{
  const e=deck(),before=e.ctx._deck3dTopOff;
  e.ctx.JYTarotDeckBrowse.move(1);e.clock.advance(16);assert.notEqual(e.ctx._deck3dTopOff,before);
  const at=e.ctx._deck3dTopOff;e.stage.dispatch('keydown',{key:'ArrowRight'});e.clock.advance(16);assert.notEqual(e.ctx._deck3dTopOff,at);
  for(let i=0;i<5;i++)e.ctx._startDeck3D(6,6);
  for(const handlers of Object.values(e.stage.listeners))assert.equal(handlers.size,1);
  point(e.stage,'pointerdown',160,80);point(e.stage,'pointermove',180,81);assert.equal(e.clock.timers.size,1);e.ctx._deck3dCleanup();assert.equal(e.clock.timers.size,0);
  for(const handlers of Object.values(e.stage.listeners))assert.equal(handlers.size,0);
 });
 await test('Gestures and browse controls cannot move an unshuffled deck',()=>{
  const e=deck();e.ctx._deckIsShuffled=false;const before=e.ctx._deck3dTopOff;
  point(e.stage,'pointerdown',100,80);point(e.stage,'pointermove',280,80);e.ctx.JYTarotDeckBrowse.move(1);e.clock.advance(1000);
  assert.equal(e.ctx._deck3dTopOff,before);assert.equal(e.clock.timers.size,0);
 });
 await test('Illustrated ritual follows the finger without WebGL; a second pointer cannot hijack it',()=>{
  const e=dom();load(e,'ritual-ateliers');const h=e.ctx.JYRitual.play('tarot'),d=e.doc.querySelector('dialog');d.querySelector('.jr-next').click();const touch=d.querySelector('.jr-touch');
  point(touch,'pointerdown',100,80);point(touch,'pointermove',145,80);assert.equal(d.style['--gesture-x'],'45px');assert(Number(d.style['--hold'])>0);
  point(touch,'pointermove',300,80,2,{isPrimary:false});assert.equal(d.style['--gesture-x'],'45px');
  point(touch,'pointercancel',145,80);assert.equal(d.style['--gesture-x'],'0px');e.clock.advance(2000);assert.equal(d.getAttribute('data-phase'),'1');h.cancel();
 });
 await test('Every ritual gives instructions before its interactive surface and the primary action after it',()=>{
  for(const kind of ['tarot','lenormand','bazi','compat','ziwei','meihua','oracle']){
   const e=dom();load(e,'ritual-ateliers');const h=e.ctx.JYRitual.play(kind),d=e.doc.querySelector('dialog'),shell=d.querySelector('.jr-shell');
   assert(shell.children.indexOf(d.querySelector('.jr-brief'))<shell.children.indexOf(d.querySelector('.jr-playfield')));
   assert(shell.children.indexOf(d.querySelector('.jr-playfield'))<shell.children.indexOf(d.querySelector('.jr-dialogue')));h.cancel();
  }
 });
 await test('Changing Tarot / Key changes controls in place with no delayed scroll',()=>{
  const e=dom();const input=add(e,'div','input-screen');input.innerHTML='<div class="card"><div class="card-title">出生資料</div></div><button id="tool-tarot"></button><button id="tool-ootk"></button><div id="tool-cta"><button id="btn-tool-go"></button></div>';
  e.ctx.S={};e.ctx._checkToolQuota=()=>{};e.ctx.submitWithTool=()=>{};e.ctx._selectedTool='tarot';e.ctx.scrollTo=()=>{throw Error('unsolicited scroll');};e.Element.prototype.scrollIntoView=()=>{throw Error('unsolicited scroll');};
  vm.runInContext(actual('JS/ui.js','pickTool'),e.ctx);e.ctx.pickTool('tarot');e.ctx.pickTool('ootk');e.clock.advance(1000);assert.equal(e.clock.timers.size,0);
 });
 await test('Entering the question page does not focus the textarea or open the soft keyboard',()=>{
  const e=dom(),home=add(e,'div','hook-screen'),input=add(e,'div','input-screen'),q=add(e,'textarea','f-question');q.value='保留我的原問題';
  e.ctx.S={};e.ctx._selectedTool='tarot';e.ctx.pickType=()=>{};
  vm.runInContext(actual('JS/ui.js','_enterFromHome',true,true),e.ctx);e.ctx._enterFromHome();assert.notEqual(e.doc.activeElement,q);assert.equal(q.value,'保留我的原問題');assert.equal(input.style.display,'block');
 });
 await test('Secondary AI providers keep the original nodes and handlers, with only one expandable group',()=>{
  const e=dom();load(e,'cinematic-ui');const container=add(e,'div','handoff');container.innerHTML='<div class="ln-ai-grid">'+Array.from({length:10},(_,i)=>'<button data-provider="'+i+'">AI</button>').join('')+'</div>';
  const original=container.querySelectorAll('button');let clicked=0;original[8].onclick=()=>clicked++;
  e.ctx.JYCinemaUI.handoff(container);e.ctx.JYCinemaUI.handoff(container);
  assert.equal(container.querySelector('.ln-ai-grid').children.length,3);assert.equal(container.querySelectorAll('.jf-more-ai').length,1);assert.equal(container.querySelector('.jf-more-grid').children.length,7);
  assert.equal(container.querySelectorAll('button').length,10);original[8].click();assert.equal(clicked,1);
 });
 await test('Lenormand and Meihua keep question text and viewport when changing an option',()=>{
  for(const [script,open,screen,q,change] of [['lenormand','_lenormandOpen','ln-screen','ln-q',c=>c._lnSetSpread('five')],['meihua-standalone','_meihuaStandaloneOpen','mhx-screen','mhx-q',c=>c._mhSetMethod('num')]]){
   const e=dom();load(e,'atelier-ui');load(e,script);e.ctx[open]();const w=e.doc.getElementById(screen);w.scrollTop=365;e.doc.getElementById(q).value='想保留的具體問題';change(e.ctx);
   assert.equal(w.scrollTop,365);assert(w.innerHTML.includes('想保留的具體問題'),'the rerender includes the saved textarea contents');
  }
 });
 await test('AI opens inside the click gesture; clipboard rejection offers the actual prompt instead of a dead end',async()=>{
  const e=dom(),events=[],payload='完整的本次資料 <keep> & 不可變更';e.ctx.ensureFx=()=>{};e.ctx.starsHTML=()=>'';e.ctx.TPL={tarot:{label:'塔羅'}};e.ctx.buildPrompt=()=>payload;e.ctx.getPayloadObject=()=>({question:'這次的問題'});e.ctx.ootkStatus=()=>null;
  e.ctx.open=()=>events.push('open');let reject;e.ctx.navigator.clipboard.writeText=()=>new Promise((_,r)=>{reject=r;events.push('copy');});
  vm.runInContext(actual('JS/prompt-export.js','copyText')+actual('JS/prompt-export.js','render'),e.ctx);const container=add(e,'div','export-test');e.ctx.render('tarot',container);
  const provider=container.querySelector('.jy-ai-shortcut');provider.click();assert.deepEqual(events,['open','copy']);reject(Error('permission denied'));await Promise.resolve();
  assert.equal(provider.querySelector('.jy-ai-name').textContent,'請先按複製');
  const button=container.querySelector('.jy-ex-btn');button.focus();e.ctx.navigator.clipboard.writeText=()=>Promise.reject(Error('denied'));e.doc.execCommand=()=>false;e.Element.prototype.select=function(){};
  button.click();await Promise.resolve();const manual=container.querySelector('.jf-manual-copy');assert(manual.open);assert.equal(manual.querySelector('textarea').value,payload);assert.equal(e.doc.activeElement,button);assert.equal(e.doc.querySelectorAll('textarea').length,1);
 });
 await test('Expanding all form fields survives an option rerender',async()=>{
  const e=dom(),{CAST}=await import('../JS/cinematic-src/choreography.mjs');e.ctx.JYCinema={cast:CAST};load(e,'cinematic-ui');
  const container=add(e,'div','all-fields');const markup='<header class="at-tool-header"><span data-art="lenormand"></span></header>'+Array.from({length:4},()=>'<section class="ln-section"></section>').join('')+'<button class="ln-draw-btn"></button>';
  container.innerHTML=markup;e.ctx.JYCinemaUI.enhance(container);container.querySelector('.jc-all').click();container.innerHTML=markup;e.ctx.JYCinemaUI.enhance(container);
  assert(container.querySelectorAll('.ln-section').every(section=>!section.hidden));
 });
 await test('Changing a compatibility scenario retains the scroll position and both birth forms',()=>{
  const e=dom();load(e,'atelier-ui');load(e,'bazi-prompt-root');load(e,'bazi-suite-core');load(e,'bazi-suite');e.ctx.BaziSuiteUI.open('compat');
  const screen=e.doc.getElementById('bzs-screen');screen.scrollTop=410;
  const choice=screen.querySelector('[data-scenario]');assert(choice);screen.dispatch('click',{target:choice});
  assert.equal(screen.scrollTop,410);assert(e.doc.getElementById('a-date'));assert(e.doc.getElementById('b-date'));
 });
 await test('Updated styles parse; the intended gesture surfaces explicitly own touch-action',()=>{
  const css=read('CSS/flow-refinement.css');require('postcss').parse(css);
  assert.match(css,/\.jy-atelier \.jr-dialog button\.jr-touch\{touch-action:none!important/);
  assert.match(css,/\.jy-atelier #step-2 #t-deck\{[^}]*touch-action:pan-y pinch-zoom!important/);
 });
 console.log('flow-interaction: '+passed+' groups passed; rendered layout and physical touch remain separate checks.');
})();
