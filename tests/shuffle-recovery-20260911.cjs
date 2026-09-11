'use strict';
// Reproduce failure paths in the production code, including the visible dock.
// Fault injection checks recovery; it does not identify a particular phone's GPU error.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {fixture,tarotFixture,load,add}=require('./ritual-lifecycle-20260911.cjs');
let passed=0;
async function test(name,fn){try{await fn();console.log('✓ '+name);passed++;}catch(error){process.exitCode=1;console.error('✗ '+name+'\n'+error.stack);}}
function quiet(e){e.messages=[];e.ctx.console={log(){},warn(...args){e.messages.push(args);},error(...args){e.messages.push(args);}};return e;}
function scene(overrides={}){return {setPhase(){},setPower(){},setTurn(){},setLit(){},dispose(){},...overrides};}
function drawing(){
 const e=quiet(tarotFixture()),c=e.ctx;e.doc.body.style.overflow='';c.setCurrentSpread('celtic_cross');c.deckShuffled=c.TAROT.slice();
 const dock=add(e,'div','tarot-draw-dock');dock.innerHTML='<span id="tarot-dock-count"></span><span id="tarot-dock-step"></span><button id="tarot-dock-action"></button>';
 load(e,'atelier-ui');c.JY_ATELIER.syncTarot();e.doc.getElementById('tarot-dock-action').onclick=()=>c._atelierTarotAction();
 e.original={question:c.S.form.question,deck:c.deckShuffled,ids:c.deckShuffled.map(x=>x.id).join(','),epoch:c.JYTarotSession.epoch(),spread:c.getCurrentSpreadDef()};return e;
}
function unchanged(e){const c=e.ctx;assert.equal(c.S.form.question,e.original.question);assert.equal(c.getCurrentSpreadDef(),e.original.spread);assert.equal(c.JYTarotSession.epoch(),e.original.epoch);assert.equal(c.deckShuffled,e.original.deck);assert.equal(c.deckShuffled.map(x=>x.id).join(','),e.original.ids);assert.equal(c.drawnCards.length,0);assert(e.doc.getElementById('btn-analyze').disabled);}
function finish(e){const d=e.doc.querySelector('dialog');assert(d&&d.open);d.querySelector('.jr-next').click();d.querySelector('.jr-next').click();e.clock.advance(2100);d.querySelector('.jr-next').click();}
(async()=>{
 await test('Home animation failure cannot prevent opening or finishing the shuffle',()=>{
  const e=drawing(),c=e.ctx;c.JYCinemaUI={suspendHome(){throw Error('home scene unavailable');}};
  e.doc.getElementById('tarot-dock-action').click();assert(c.JYRitual.isActive('tarot'));unchanged(e);assert(!c._deckIsShuffled);
  finish(e);unchanged(e);assert(c._deckIsShuffled);assert(!c.JYRitual.isActive());assert.equal(e.doc.body.style.overflow,'');assert.equal(e.doc.getElementById('tarot-dock-action').textContent,'快速抽牌');
 });
 await test('Phase initialization failure falls back to the illustrated ritual, never to a completed draw',()=>{
  const e=drawing(),c=e.ctx;let disposed=0;c.JYCinema={mount:()=>scene({setPhase(){throw Error('GPU phase failure');},dispose(){disposed++;throw Error('GPU disposal failure');}})};
  e.doc.getElementById('tarot-dock-action').click();assert.equal(e.doc.querySelector('dialog').getAttribute('data-renderer'),'fallback');unchanged(e);assert(!c._deckIsShuffled);finish(e);assert.equal(disposed,1);assert(c._deckIsShuffled);unchanged(e);assert(!c.JYRitual.isActive());
 });
 await test('Failure after mounting rolls back its lock; the same visible button retries the same question and deck',()=>{
  const e=drawing(),c=e.ctx,listen=e.doc.addEventListener;let fail=true;
  e.doc.addEventListener=function(type,...rest){if(type==='visibilitychange'&&fail){fail=false;throw Error('simulated startup interruption');}return listen(type,...rest);};
  const button=e.doc.getElementById('tarot-dock-action');button.click();assert(!c.JYRitual.isActive());assert(!e.doc.querySelector('dialog'));assert.equal(e.doc.body.style.overflow,'');assert.equal(e.events.listeners.pagehide.size,0);assert.equal(e.events.listeners.popstate.size,0);assert.equal(button.textContent,'重試洗牌');assert.match(e.doc.getElementById('pick-hint').textContent,/原問題與牌陣已保留/);unchanged(e);
  button.click();assert(e.doc.querySelector('dialog'));assert.equal(e.doc.getElementById('pick-hint').getAttribute('role'),'status');finish(e);assert(c._deckIsShuffled);unchanged(e);
 });
 await test('Failure before a dialog attaches releases the lock and leaves body scrolling intact',()=>{
  const e=drawing(),append=e.doc.body.appendChild;let fail=true;e.doc.body.style.overflow='auto';
  e.doc.body.appendChild=function(node){if(node.tagName==='DIALOG'&&fail){fail=false;throw Error('simulated DOM insertion failure');}return append.call(this,node);};
  const button=e.doc.getElementById('tarot-dock-action');button.click();assert(!e.ctx.JYRitual.isActive());assert.equal(e.doc.body.style.overflow,'auto');assert(!e.doc.querySelector('dialog'));unchanged(e);button.click();finish(e);assert(e.ctx._deckIsShuffled);assert.equal(e.doc.body.style.overflow,'auto');unchanged(e);
 });
 await test('A mixed-version caller throwing after play is cancelled without invoking return-to-input',()=>{
  const e=drawing(),c=e.ctx,play=c.JYRitual.play;let fail=true,returned=0;c._atelierReturnToInput=()=>returned++;
  c.JYRitual.play=function(...args){const h=play(...args);if(fail){fail=false;throw Error('caller interrupted after mounting');}return h;};
  const button=e.doc.getElementById('tarot-dock-action');button.click();assert(!c.JYRitual.isActive());assert(!e.doc.querySelector('dialog'));assert.equal(returned,0);unchanged(e);button.click();finish(e);unchanged(e);assert.equal(returned,0);
 });
 await test('Deck preparation failure retries locally without changing question, spread or session epoch',()=>{
  const e=drawing(),c=e.ctx,init=c.initTarotDeck;c.deckShuffled=[];let attempts=0;c.initTarotDeck=function(){if(++attempts===1){c.deckShuffled=c.TAROT.slice();throw Error('temporary failure after preparing cards, before rendering');}return init();};
  const button=e.doc.getElementById('tarot-dock-action');button.click();assert.equal(button.textContent,'重試洗牌');assert.equal(c.S.form.question,e.original.question);assert.equal(c.JYTarotSession.epoch(),e.original.epoch);assert.equal(c.drawnCards.length,0);assert(!c.JYRitual.isActive());
  button.click();assert.equal(attempts,2);assert.equal(c.deckShuffled.length,78);assert.equal(c.getCurrentSpreadDef().count,10);assert.equal(c.S.form.question,e.original.question);finish(e);assert.equal(c.drawnCards.length,0);assert(c._deckIsShuffled);
 });
 await test('All seven rituals complete once despite scene disposal and home-resume failures',async()=>{
  for(const kind of ['tarot','lenormand','bazi','compat','ziwei','meihua','oracle']){
   const e=quiet(fixture()),trigger=add(e,'button','trigger');trigger.focus();e.doc.body.style.overflow='auto';let done=0,disposed=0;
   e.ctx.JYCinema={mount:()=>scene({dispose(){disposed++;throw Error('lost context');}})};e.ctx.JYCinemaUI={suspendHome(value){if(!value)throw Error('resume failed');}};load(e,'ritual-ateliers');
   const h=e.ctx.JYRitual.play(kind,{onComplete:()=>done++});h.skip();assert.equal(await h.finished,true);h.skip();assert.equal(done,1);assert.equal(disposed,1);assert(!e.ctx.JYRitual.isActive());assert.equal(e.doc.body.style.overflow,'auto');assert.equal(e.doc.activeElement,trigger);assert.equal(e.clock.timers.size,0);assert.equal(e.events.listeners.pagehide.size,0);assert.equal(e.docEvents.listeners.visibilitychange.size,0);
   const again=e.ctx.JYRitual.play(kind);again.cancel();assert.equal(await again.finished,false);assert(!e.ctx.JYRitual.isActive());
  }
 });
 await test('Mid-gesture GPU errors leave user-led completion and cancellation available',async()=>{
  for(const method of ['setPower','setTurn','setLit']){
   const e=quiet(fixture());let disposed=0;e.ctx.JYCinema={mount:()=>scene({[method](){throw Error('lost context during '+method);},dispose(){disposed++;}})};load(e,'ritual-ateliers');
   const h=e.ctx.JYRitual.play(method==='setLit'?'bazi':'tarot'),d=e.doc.querySelector('dialog');d.querySelector('.jr-next').click();
   if(method==='setLit')d.querySelector('.jr-seal').click();else{const touch=d.querySelector('.jr-touch');touch.dispatch('pointerdown',{button:0,clientX:5,clientY:5});touch.dispatch('pointermove',{clientX:15,clientY:5});e.clock.advance(32);}
   assert.equal(disposed,1);assert.equal(d.getAttribute('data-phase'),'1');h.cancel();assert.equal(await h.finished,false);assert(!e.ctx.JYRitual.isActive());assert.equal(e.clock.timers.size,0);
  }
 });
 await test('Actual home scene clears a failed renderer before suspension, hover or remount can affect a ritual',()=>{
  const e=quiet(fixture());e.ctx.matchMedia=()=>({matches:false});e.Element.prototype.prepend=function(node){this.insertBefore(node,this.children[0]);};let visible,mounts=0,disposals=0;
  e.ctx.IntersectionObserver=class{constructor(callback){visible=callback;}observe(){}disconnect(){}};
  const hero=add(e,'section','hero');hero.className='at-hero';hero.innerHTML='<h1>靜月</h1><div class="at-hero-art"><img></div>';
  e.ctx.JYCinema={cast:{tarot:{actor:'lunar-guide'}},mount(host){mounts++;if(mounts===2)throw Error('remount failed');host.prepend(new e.Element('canvas'));host.classList.add('jr-gpu-ready','jr-actor-ready');return scene({setPhase(){throw Error('hover failed');},dispose(){disposals++;throw Error('home disposal failed');}});}};
  load(e,'cinematic-ui');e.ctx.JYCinemaUI.home();visible([{isIntersecting:true}]);assert.equal(mounts,1);e.ctx.JYCinemaUI.suspendHome(true);assert.equal(disposals,1);assert.equal(hero.querySelectorAll('canvas').length,0);
  e.ctx.JYCinemaUI.suspendHome(false);assert.equal(mounts,2);assert.equal(hero.querySelectorAll('canvas').length,0);e.ctx.JYCinemaUI.suspendHome(true);e.ctx.JYCinemaUI.suspendHome(false);assert.equal(mounts,3);hero.querySelector('.jc-home-stage').dispatch('pointerenter');assert.equal(disposals,2);assert.equal(hero.querySelectorAll('canvas').length,0);
 });
 await test('Real Three.js resources are still released when renderer.dispose throws',async()=>{
  const T=await import('three'),choreo=await import('../JS/cinematic-src/choreography.mjs'),e=quiet(fixture()),host=add(e,'div','stage');let disposed=0,rendered=0;const resources=new Set(),released=new Set();
  e.Element.prototype.prepend=function(node){this.insertBefore(node,this.children[0]);};
  class Renderer{constructor(){this.domElement=new e.Element('canvas');this.capabilities={getMaxAnisotropy:()=>1};}setPixelRatio(){}setClearColor(){}setSize(){}render(scene){rendered++;scene.traverse(n=>{for(const r of [n.geometry,...(Array.isArray(n.material)?n.material:[n.material])])if(r&&!resources.has(r)){resources.add(r);r.addEventListener('dispose',()=>released.add(r));}});}dispose(){disposed++;throw Error('simulated GPU disposal failure');}}
  e.ctx.__T={...T,WebGLRenderer:Renderer,TextureLoader:class{load(){}}};e.ctx.__choreo=choreo;
  const source=fs.readFileSync(path.join(__dirname,'../JS/cinematic-src/stage.mjs'),'utf8').replace(/^import .*;\n/gm,'').replace('export function mountStage','function mountStage');
  vm.runInContext('const T=__T;const {cardPose,actorPose,CAST,clamp,ease}=__choreo;'+source+';window.__mount=mountStage;',e.ctx);
  const stage=e.ctx.__mount(host,'tarot');assert(rendered>0);stage.dispose();stage.dispose();assert.equal(disposed,1);assert.equal(resources.size,released.size);assert.equal(host.querySelectorAll('canvas').length,0);assert.equal(e.clock.timers.size,0);const before=rendered;e.clock.advance(9000);assert.equal(rendered,before);
 });
 console.log('shuffle-recovery: '+passed+' groups passed (fault injection, not phone-specific error reproduction).');
})();
