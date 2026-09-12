'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),acorn=require('acorn');
const {fixture,load,add}=require('./ritual-lifecycle-20260911.cjs');
const project=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(project,f),'utf8');
let passed=0;
async function test(name,fn){try{await fn();passed++;console.log('✓ '+name);}catch(e){process.exitCode=1;console.error('✗ '+name+'\n'+e.stack);}}
function dom(){const e=fixture();e.Element.prototype.prepend=function(node){this.insertBefore(node,this.children[0]);};Object.defineProperty(e.Element.prototype,'parentElement',{get(){return this.parentNode;}});return e;}
function enter(e,kind,options={}){load(e,'ritual-story');load(e,'ritual-ateliers');return e.ctx.JYRitual.play(kind,options);}
function activate(d){d.querySelector('.jr-next').click();const seals=d.querySelectorAll('.jr-seal');if(seals.length)seals.forEach(b=>b.click());else d.querySelector('.jr-next').click();}
function extract(file,name){const src=read(file);let found;function walk(n){if(!n||typeof n!=='object')return;if(n.type==='FunctionDeclaration'&&n.id?.name===name)found=src.slice(n.start,n.end);for(const v of Object.values(n))if(Array.isArray(v))v.forEach(walk);else if(v&&typeof v==='object')walk(v);}walk(acorn.parse(src,{ecmaVersion:'latest'}));assert(found);return found;}
(async()=>{
 for(const kind of ['tarot','lenormand','bazi','compat','ziwei','meihua','oracle','ootk'])await test(kind+': director keeps the scene user-led and settles once after visible shots',async()=>{
  const e=dom(),shots=[];let done=0,disposals=0;
  e.ctx.JYCinema={mount:()=>({setPhase(){},setLit(){},setPower(){},setTurn(){},setShot:s=>shots.push(s.name),dispose:()=>disposals++})};
  const h=enter(e,kind,{onComplete:()=>done++}),d=e.doc.querySelector('dialog');assert.equal(d.getAttribute('data-story'),'true');
  assert.equal(d.querySelector('.jr-brief').parentNode,d.querySelector('.jr-dialogue'));
  e.clock.advance(9000);assert.equal(d.getAttribute('data-phase'),'0');assert.equal(done,0);
  activate(d);assert.equal(d.getAttribute('data-phase'),'2');e.clock.advance(2000);assert.equal(d.getAttribute('data-phase'),'2');
  e.doc.hidden=true;e.docEvents.dispatch('visibilitychange');e.clock.advance(30000);assert.equal(d.getAttribute('data-phase'),'2');assert.equal(done,0);
  e.doc.hidden=false;e.docEvents.dispatch('visibilitychange');e.clock.advance(3700);assert.equal(d.getAttribute('data-phase'),'3');
  assert(shots.includes('arrival')&&shots.includes('listen')&&shots.includes('gather')&&shots.includes('orbit')&&shots.includes('settle'));
  e.clock.advance(15000);assert.equal(done,0);d.querySelector('.jr-next').click();assert.equal(await h.finished,true);assert.equal(done,1);assert.equal(disposals,1);
  assert.equal(e.clock.timers.size,0);assert.equal(e.docEvents.listeners.visibilitychange.size,0);assert.equal(e.doc.querySelectorAll('video').length,0);
 });
 await test('Skip and cancellation dispose a live director, including stale callbacks',async()=>{
  for(const cancel of [false,true]){
   const e=dom();let done=0;const h=enter(e,'tarot',{onComplete:()=>done++}),d=e.doc.querySelector('dialog');activate(d);e.clock.advance(800);const stale=[...e.clock.timers.values()];
   if(cancel)h.cancel();else h.skip();stale.forEach(t=>t.fn());e.clock.advance(15000);
   assert.equal(await h.finished,!cancel);assert.equal(done,cancel?0:1);assert.equal(e.clock.timers.size,0);assert(!e.ctx.JYRitual.isActive());
  }
 });
 await test('Reduced motion can be selected during a shot without completing the reading',async()=>{
  const e=dom();let done=0;const h=enter(e,'ziwei',{onComplete:()=>done++}),d=e.doc.querySelector('dialog');activate(d);e.clock.advance(600);d.querySelector('.jr-motion').click();
  assert.equal(d.getAttribute('data-phase'),'3');assert.equal(done,0);e.clock.advance(15000);assert.equal(done,0);d.querySelector('.jr-next').click();assert.equal(await h.finished,true);assert.equal(done,1);assert.equal(e.clock.timers.size,0);
 });
 await test('All-reveal keeps actual faces, reversal and order and never invents a new draw',async()=>{
  const e=dom(),cards=[{id:1,name:'魔術師',image:'tarot_img/01.jpg',isUp:false},{id:9,name:'隱者',image:'tarot_img/09.jpg'},{id:21,name:'世界'}],before=JSON.stringify(cards);let done=0;
  const h=enter(e,'tarot',{variant:'deal',cards,onComplete:()=>done++}),d=e.doc.querySelector('dialog');assert.equal(d.querySelectorAll('.jr-front img').length,0);
  d.querySelector('.jr-reveal-all').click();e.clock.advance(6500);assert.equal(d.getAttribute('data-phase'),'3');assert.equal(JSON.stringify(cards),before);assert(d.querySelector('.is-reversed'));assert.equal(done,0);d.querySelector('.jr-next').click();assert.equal(await h.finished,true);
 });
 await test('Failed film playback remains decorative and cannot block the scene',async()=>{
  const e=dom();e.Element.prototype.pause=function(){};e.Element.prototype.load=function(){};e.Element.prototype.play=function(){return Promise.reject(Error('Autoplay denied'));};
  // Inject a reviewed-path fixture into the otherwise empty media manifest.
  vm.runInContext(read('JS/ritual-story.js').replace('Object.freeze({});','Object.freeze({tarot:{entrance:"assets/cinema/test.mp4"}});'),e.ctx);load(e,'ritual-ateliers');
  const h=e.ctx.JYRitual.play('tarot'),d=e.doc.querySelector('dialog'),video=d.querySelector('video');assert(video);assert(video.muted&&video.playsInline);video.oncanplay();await Promise.resolve();await Promise.resolve();
  assert.equal(d.querySelector('video'),null);assert.equal(d.getAttribute('data-film'),null);activate(d);e.clock.advance(5500);assert.equal(d.getAttribute('data-phase'),'3');h.skip();assert.equal(await h.finished,true);
 });
 await test('Late media success after cancellation cannot attach a stale film',async()=>{
  const e=dom();let accept;e.Element.prototype.pause=function(){};e.Element.prototype.load=function(){};e.Element.prototype.play=function(){return new Promise(r=>accept=r);};
  vm.runInContext(read('JS/ritual-story.js').replace('Object.freeze({});','Object.freeze({tarot:{entrance:"assets/cinema/test.mp4"}});'),e.ctx);load(e,'ritual-ateliers');const h=e.ctx.JYRitual.play('tarot'),d=e.doc.querySelector('dialog');d.querySelector('video').oncanplay();h.cancel();accept();await Promise.resolve();assert.equal(d.getAttribute('data-film'),null);assert.equal(await h.finished,false);assert.equal(e.docEvents.listeners.visibilitychange.size,0);
 });
 await test('Eight new 3D sets have finite transforms and release every geometry, material and timer',async()=>{
  const Three=await import('three'),choreo=await import('../JS/cinematic-src/choreography.mjs');
  for(const kind of Object.keys(choreo.CAST)){
   const e=dom(),tracked=new Set(),disposed=new Set(),pending=[];let rendererDisposed=0,renderCount=0;const host=add(e,'div','stage');
   class Renderer{constructor(){this.domElement=new e.Element('canvas');this.capabilities={getMaxAnisotropy:()=>4};this.ratio=1;}setPixelRatio(n){this.ratio=n;}getPixelRatio(){return this.ratio;}setClearColor(){}setSize(){}dispose(){rendererDisposed++;}render(scene,camera){renderCount++;assert([camera.position.x,camera.position.y,camera.position.z].every(Number.isFinite));scene.traverse(n=>{assert([...n.position.toArray(),...n.scale.toArray()].every(Number.isFinite));for(const r of [n.geometry,...(Array.isArray(n.material)?n.material:[n.material])])if(r&&!tracked.has(r)){tracked.add(r);r.addEventListener('dispose',()=>disposed.add(r));}});}}
   class Loader{load(url,done){pending.push(done);}}
   e.ctx.__T={...Three,WebGLRenderer:Renderer,TextureLoader:Loader};e.ctx.__choreo=choreo;e.ctx.__presence=await import('../JS/cinematic-src/presence.mjs');
   const scenery=read('JS/cinematic-src/scenery.mjs').replace(/^import .*;\n/gm,'').replace('export function buildScenery','function buildScenery');
   const stage=read('JS/cinematic-src/stage.mjs').replace(/^import .*;\n/gm,'').replace('export function mountStage','function mountStage');
   vm.runInContext('const T=__T;const {buildPresence}=__presence;const {cardPose,actorPose,cameraPose,instrumentPose,CAST,clamp,ease}=__choreo;'+scenery+stage+';window.__mount=mountStage;',e.ctx);
   const instance=e.ctx.__mount(host,kind,{story:true});assert.equal(host.getAttribute('data-renderer'),'webgl2');
   for(const phase of [0,1,2,3]){instance.setPhase(phase);instance.setShot({name:['arrival','listen','orbit','settle'][phase]});instance.setPower(.8);instance.setLit(3);instance.setTurn(.7);e.clock.advance(350);}
   instance.setCovered(true);const beforeCover=renderCount;e.clock.advance(1000);assert.equal(renderCount,beforeCover);instance.setCovered(false);e.clock.advance(50);assert(renderCount>beforeCover);
   instance.dispose();assert.equal(rendererDisposed,1);assert.equal(tracked.size,disposed.size);assert.equal(e.clock.timers.size,0);
   for(const done of pending){const texture=new Three.Texture();let count=0;texture.addEventListener('dispose',()=>count++);done(texture);assert.equal(count,1);}
  }
 });
 await test('Opening of the Key starts in manual chapter mode and cancellation releases the scene',async()=>{
  const e=dom();let computed=0,disposed=0;load(e,'ritual-story');load(e,'ritual-ateliers');
  Object.assign(e.ctx,{S:{form:{question:'具體的問題'},tarot:{}},_injectOOTKStyles(){},ootkRunFull(){computed++;return {completedOperations:1,op1:{piles:{},significatorId:1}};},_triggerOOTKAI(){},goStep(){},OP_LABELS:[{zh:'四元素',en:'Elements'}],JYCinema:{mount:()=>({setPhase(){},setShot(){},setPower(){},setLit(){},setTurn(){},dispose:()=>disposed++})}});
  vm.runInContext(extract('JS/tarot_upgrade.js','_runOOTKSequence')+';_runOOTKSequence(1,{});',e.ctx);
  assert.equal(computed,1);assert.equal(e.doc.getElementById('ootk-auto-story').getAttribute('aria-pressed'),'false');
  e.ctx.JYRitual.cancel('ootk');e.doc.getElementById('ootk-invoc-begin').click();e.clock.advance(1501);assert(e.doc.querySelector('.ootk-story-stage'));
  const overlay=e.doc.getElementById('ootk-sequence-overlay');overlay.scrollTop=70;e.clock.advance(1000);assert.equal(overlay.scrollTop,70);
  e.doc.getElementById('ootk-sequence-cancel').click();assert.equal(e.clock.timers.size,0);assert(disposed>=2);assert.equal(computed,1);
 });
 console.log('story-immersion: '+passed+' groups passed; simulated DOM and scene structure, not physical-device or generated-film validation.');
})();
