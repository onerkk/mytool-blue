'use strict';
// State/DOM tests, not a substitute for WebGL pixel or physical-device QA.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const {fixture,load,add}=require('./ritual-lifecycle-20260911.cjs');
const project=path.resolve(__dirname,'..');
let passed=0;
async function test(name,fn){try{await fn();console.log('✓ '+name);passed++;}catch(e){process.exitCode=1;console.error('✗ '+name+'\n'+e.stack);}}
function dom(){
 const e=fixture();
 e.Element.prototype.before=function(node){this.parentNode.insertBefore(node,this);};
 e.Element.prototype.after=function(node){const parent=this.parentNode;node.remove();node.parentNode=parent;parent.children.splice(parent.children.indexOf(this)+1,0,node);};
 e.Element.prototype.prepend=function(node){this.insertBefore(node,this.children[0]);};
 Object.defineProperty(e.Element.prototype,'parentElement',{get(){return this.parentNode;}});
 return e;
}
function form(e,kind,section,button,count){
 const container=add(e,'div','flow-'+kind);
 container.innerHTML='<header class="at-tool-header"><span data-art="'+kind+'"></span><div><h1>'+kind+'</h1></div></header><div class="at-flow-guide"></div>'+Array.from({length:count},(_,i)=>'<section class="'+section+'"><input id="value-'+i+'" value="retained-'+i+'"></section>').join('')+'<button class="'+button+'">開始</button>';
 return container;
}
(async()=>{
 const {cardPose,actorPose,cameraPose,instrumentPose,CAST}=await import('../JS/cinematic-src/choreography.mjs');
 await test('All eight systems have an original actor and complete local transparent atlas',()=>{
  assert.equal(Object.keys(CAST).length,8);
  for(const c of Object.values(CAST)){assert(fs.statSync(path.join(project,'assets/ui',c.actor+'.webp')).size>10000);assert(c.speaker&&c.role&&c.chapter);}
  assert.deepEqual([0,1,2,3].map(actorPose),[0,1,2,3]);
 });
 await test('3D deck moves through stack, split, interleave and fan without calling reading randomness',()=>{
  const random=Math.random;Math.random=()=>{throw Error('Presentation must not draw cards');};
  try{for(let phase=0;phase<4;phase++)for(let i=0;i<15;i++)for(let since=0;since<=3;since+=.05){const p=cardPose(i,15,{phase,since,time:since,power:.7});assert(Object.values(p).every(Number.isFinite));assert(Math.abs(p.x)<3&&Math.abs(p.y)<2);}
   const a=cardPose(0,15,{phase:2,since:.55}),b=cardPose(1,15,{phase:2,since:.55});assert(a.x*b.x<0,'two real halves');
   assert(cardPose(14,15,{phase:3}).x>cardPose(0,15,{phase:3}).x,'stable fan order');
  }finally{Math.random=random;}
 });
 await test('Touch gestures drive the scene; no card draw or completion happens before explicit exit',async()=>{
  for(const kind of ['tarot','ziwei','meihua','oracle']){
   const e=dom(),calls=[],scene={setPhase:n=>calls.push(['phase',n]),setPower:n=>calls.push(['power',n]),setTurn:n=>calls.push(['turn',n]),setLit(){},dispose:()=>calls.push(['dispose'])};
   e.ctx.JYCinema={mount:()=>scene};load(e,'ritual-ateliers');let done=0;const h=e.ctx.JYRitual.play(kind,{onComplete:()=>done++}),d=e.doc.querySelector('dialog');
   d.querySelector('.jr-next').click();const touch=d.querySelector('.jr-touch');
   touch.dispatch('pointerdown',{button:0,clientX:10,clientY:10,pointerId:1});
   touch.dispatch('pointermove',{clientX:kind==='oracle'?10:210,clientY:kind==='oracle'?210:10,pointerId:1});e.clock.advance(16);
   assert.equal(d.getAttribute('data-phase'),'2');assert(calls.some(c=>c[0]==='turn'&&c[1]!==0));assert.equal(done,0);
   e.clock.advance(2800);assert.equal(done,0);d.querySelector('.jr-next').click();assert.equal(await h.finished,true);assert.equal(done,1);assert.equal(calls.filter(c=>c[0]==='dispose').length,1);assert.equal(e.clock.timers.size,0);
  }
 });
 await test('Wrong gesture direction does not instantly complete; pointer cancellation resets progress',()=>{
  const e=dom();load(e,'ritual-ateliers');const h=e.ctx.JYRitual.play('tarot'),d=e.doc.querySelector('dialog');d.querySelector('.jr-next').click();const touch=d.querySelector('.jr-touch');
  touch.dispatch('pointerdown',{button:0,clientX:5,clientY:5});touch.dispatch('pointermove',{clientX:5,clientY:350});e.clock.advance(32);assert.equal(d.getAttribute('data-phase'),'1');touch.dispatch('pointercancel');e.clock.advance(3000);assert.equal(d.getAttribute('data-phase'),'1');h.cancel();assert.equal(e.clock.timers.size,0);
 });
 await test('A renderer failure never blocks any ritual, and cancellation invalidates pending phase callbacks',async()=>{
  for(const kind of ['tarot','lenormand','bazi','compat','ziwei','meihua','oracle']){
   const e=dom();e.ctx.JYCinema={mount(){throw Error('WebGL2 unavailable');}};load(e,'ritual-ateliers');let done=0;const h=e.ctx.JYRitual.play(kind,{onComplete:()=>done++});e.doc.querySelector('.jr-skip').click();assert.equal(await h.finished,true);assert.equal(done,1);
  }
  const e=dom(),phases=[];let disposed=0;e.ctx.JYCinema={mount(){return {setPhase:n=>phases.push(n),setPower(){},setLit(){},setTurn(){},dispose(){disposed++;}};}};load(e,'ritual-ateliers');const h=e.ctx.JYRitual.play('tarot'),d=e.doc.querySelector('dialog');d.querySelector('.jr-next').click();d.querySelector('.jr-next').click();const timers=[...e.clock.timers.values()];h.cancel();timers.forEach(t=>t.fn());assert.equal(await h.finished,false);assert.equal(disposed,1);assert(!phases.includes(3));
 });
 await test('Four-pillar and relationship inputs retain original nodes/values; validation can reveal any earlier field',()=>{
  for(const [kind,section,button,count] of [['bazi','bzx-section','bzx-cast-btn',2],['ziwei','zw-in-sec','zw-in-go',2],['meihua','mhx-section','mhx-cast-btn',2],['compat','bzs-card','bzs-primary',4]]){
   const e=dom();e.ctx.JYCinema={cast:CAST};load(e,'cinematic-ui');const container=form(e,kind,section,button,count),input=container.querySelector('#value-0'),submit=container.querySelector('.'+button);
   if(kind==='compat')submit.setAttribute('data-act','cast-compat');
   e.ctx.JYCinemaUI.enhance(container);assert(submit.hidden);for(let i=1;i<count;i++)container.querySelector('.jc-continue').click();assert(!submit.hidden);assert.equal(container.querySelector('#value-0'),input);assert.equal(input.value,'retained-0');
   for(let i=1;i<count;i++)container.querySelector('.jc-previous').click();assert(!input.parentNode.hidden);container.querySelector('.jc-continue').click();submit.click();assert(container.querySelectorAll('.'+section).every(s=>!s.hidden));
   e.ctx.JYCinemaUI.enhance(container);assert.equal(container.querySelectorAll('.jc-flow').length,1);
  }
 });
 await test('Lenormand four sections become three steps; a rerender resumes spread selection',()=>{
  const e=dom();e.ctx.JYCinema={cast:CAST};load(e,'cinematic-ui');let container=form(e,'lenormand','ln-section','ln-draw-btn',4);e.ctx.JYCinemaUI.enhance(container);
  assert.equal(container.querySelectorAll('[data-jc-step]').length,3);container.querySelector('.jc-continue').click();const before=container.querySelector('#value-0');before.value='我的具體問題';
  e.ctx.JYCinemaUI.enhance(container);assert.equal(before.value,'我的具體問題');container.remove();container=form(e,'lenormand','ln-section','ln-draw-btn',4);e.ctx.JYCinemaUI.enhance(container);
  assert.equal(container.querySelector('[data-jc-step="1"]').getAttribute('aria-current'),'step');assert.equal(container.querySelectorAll('.ln-section')[1].hidden,false);container.querySelector('.jc-continue').click();assert(container.querySelectorAll('.ln-section').slice(2).every(s=>!s.hidden));
 });
 await test('No WebGL context: real Three.js mount returns usable fallback and removes allocated DOM',async()=>{
  const {mountStage}=await import('../JS/cinematic-src/stage.mjs');const e=dom(),host=add(e,'div','gpu-host');e.doc.createElementNS=(ns,tag)=>{const el=new e.Element(tag);el.getContext=()=>null;return el;};
  const old={document:global.document,window:global.window,cancelAnimationFrame:global.cancelAnimationFrame};global.document=e.doc;global.window=e.ctx;global.cancelAnimationFrame=()=>{};const error=console.error;console.error=()=>{};
  try{const scene=mountStage(host,'tarot');assert.equal(host.getAttribute('data-renderer'),'fallback');scene.setPhase(1);scene.setPower(.5);scene.dispose();assert.equal(host.querySelectorAll('canvas').length,0);}
  finally{console.error=error;Object.assign(global,old);}
 });
 await test('All seven scenes release their Three.js geometries, textures, listeners and frame loop; late loads cannot resurrect them',async()=>{
  const Three=await import('three');
  for(const kind of ['tarot','lenormand','bazi','compat','ziwei','meihua','oracle']){
   const e=dom(),pending=[],tracked=new Set(),disposed=new Set(),host=add(e,'div','scene-host');let rendering=0,rendererDisposed=0;
   class Renderer{constructor(){this.domElement=new e.Element('canvas');this.capabilities={getMaxAnisotropy:()=>4};this.ratio=1;}setPixelRatio(n){this.ratio=n;}getPixelRatio(){return this.ratio;}setClearColor(){}setSize(){}dispose(){rendererDisposed++;}render(scene){rendering++;scene.traverse(node=>{assert([node.position.x,node.position.y,node.position.z].every(Number.isFinite));for(const r of [node.geometry,...(Array.isArray(node.material)?node.material:[node.material])])if(r&&!tracked.has(r)){tracked.add(r);r.addEventListener('dispose',()=>disposed.add(r));}});}}
   class Loader{load(url,loaded){pending.push({url,loaded});}}
   e.ctx.__T={...Three,WebGLRenderer:Renderer,TextureLoader:Loader};e.ctx.__craft=await import('../JS/cinematic-src/craft.mjs');e.ctx.__choreo={cardPose,actorPose,cameraPose,instrumentPose,CAST,clamp:(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),ease:v=>{v=Math.max(0,Math.min(1,v));return v*v*(3-2*v);}};
   const src=fs.readFileSync(path.join(project,'JS/cinematic-src/stage.mjs'),'utf8').replace(/^import .*;\n/gm,'').replace('export function mountStage','function mountStage');
   vm.runInContext('const T=__T;const {buildCraft}=__craft;const {cardPose,actorPose,cameraPose,instrumentPose,CAST,clamp,ease}=__choreo;'+src+';window.__mount=mountStage;',e.ctx);
   const stage=e.ctx.__mount(host,kind,{mode:'hold'});assert.equal(host.getAttribute('data-renderer'),'webgl2');
   const first=pending.shift();assert(first);const loaded=new Three.Texture();let textureDisposed=0;loaded.addEventListener('dispose',()=>textureDisposed++);first.loaded(loaded);
   stage.setPhase(1);stage.setPower(.8);stage.setLit(2);stage.setTurn(.5);e.clock.advance(100);assert(rendering>1);
   stage.dispose();const before=rendering;assert.equal(rendererDisposed,1);assert.equal(textureDisposed,1);assert.equal(e.clock.timers.size,0);assert.equal(tracked.size,disposed.size);
   for(const item of pending){const late=new Three.Texture();let released=0;late.addEventListener('dispose',()=>released++);item.loaded(late);assert.equal(released,1);}
   stage.setPhase(3);stage.dispose();e.clock.advance(9000);assert.equal(rendering,before);assert.equal(rendererDisposed,1);assert.equal(host.querySelectorAll('canvas').length,0);assert(!host.classList.contains('jr-actor-ready'));
  }
 });
 await test('Changing Tarot to Opening of the Key updates the guide without touching the question',()=>{
  const e=dom();e.ctx.JYCinema={cast:CAST};load(e,'cinematic-ui');const input=add(e,'div','input-screen');input.innerHTML='<header class="at-input-head"></header><textarea id="f-question"></textarea>';input.querySelector('#f-question').value='我在意的問題';
  e.ctx.JYCinemaUI.input();input.setAttribute('data-atelier-mode','ootk');e.ctx.JYCinemaUI.input();assert.equal(input.querySelector('.at-input-head').getAttribute('data-chapter'),'ootk');assert.equal(input.querySelectorAll('.jc-guide').length,1);assert.equal(input.querySelector('#f-question').value,'我在意的問題');
 });
 console.log('cinematic: '+passed+' groups passed; WebGL pixels and physical-device rendering remain unverified.');
})();
