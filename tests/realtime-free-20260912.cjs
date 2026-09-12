'use strict';
const assert=require('node:assert/strict');
const {fixture,load}=require('./ritual-lifecycle-20260911.cjs');
let passed=0;
async function test(name,fn){try{await fn();passed++;console.log('✓ '+name);}catch(e){process.exitCode=1;console.error('✗ '+name+'\n'+e.stack);}}
(async()=>{
 const T=await import('three'),{buildPresence,presencePoint}=await import('../JS/cinematic-src/presence.mjs');
 const kinds=['tarot','lenormand','bazi','compat','ziwei','meihua','oracle','ootk'];
 await test('All eight particle paths stay finite and bounded through hold, turn and scene changes',()=>{
  const signatures=new Set();
  for(const kind of kinds){
   signatures.add(JSON.stringify(Array.from({length:9},(_,i)=>presencePoint(kind,i*17,192,{time:2.3,phase:2,since:1.8,turn:.7}))));
   for(const phase of [0,1,2,3])for(const time of [0,.01,1,5.4,30,3600])for(const turn of [-10,0,10])for(let i=0;i<192;i+=7){
    const p=presencePoint(kind,i,192,{time,phase,since:time,power:1,turn});assert(Object.values(p).every(Number.isFinite));assert(Math.abs(p.x)<3&&Math.abs(p.y)<3&&Math.abs(p.z)<3);
   }
  }
  assert.equal(signatures.size,8);
 });
 await test('Local effects load no textures and add at most five drawable objects per scene',()=>{
  for(const kind of kinds){
   const rig=new T.Group(),resources=new Set(),keep=r=>(resources.add(r),r),p=buildPresence({kind,rig,keep,accent:new T.Color('#ddbd81'),reduced:false});
   p.update({time:0,phase:0,since:0,power:0});let drawables=0;
   rig.traverse(n=>{if(n.isMesh||n.isPoints)drawables++;if(n.material)for(const v of Object.values(n.material.uniforms||{}))assert(!v.value?.isTexture);});
   assert.equal(drawables,5);assert.equal(rig.getObjectByName('ritual-current').geometry.attributes.position.count,192);
   for(const r of resources)r.dispose();rig.clear();
  }
 });
 await test('Touch echoes fade out and reduced motion keeps every particle stationary',()=>{
  for(const reduced of [false,true]){
   const rig=new T.Group(),resources=[],p=buildPresence({kind:'tarot',rig,keep:r=>(resources.push(r),r),accent:new T.Color('gold'),reduced});
   p.update({time:0,phase:1,since:0,power:.6});p.contact(.4,.3,0);p.update({time:.1,phase:1,since:.1,power:.6});
   const echo=rig.getObjectByName('touch-echo'),g=rig.getObjectByName('ritual-current').geometry;
   const first=Array.from(g.attributes.position.array);assert.equal(echo.visible,!reduced);
   p.update({time:8,phase:1,since:8,power:.6});assert.equal(echo.visible,false);
   if(reduced)assert.deepEqual(Array.from(g.attributes.position.array),first);else assert.notDeepEqual(Array.from(g.attributes.position.array),first);
   resources.forEach(r=>r.dispose());rig.clear();
  }
 });
 await test('Touch feedback does not advance the ritual prematurely and cancellation leaves no timer',async()=>{
  const e=fixture(),points=[];let done=0;
  e.ctx.JYCinema={mount:()=>({setPhase(){},setLit(){},setTurn(){},setPower(){},contact:p=>points.push(p),dispose(){}})};
  load(e,'ritual-ateliers');const h=e.ctx.JYRitual.play('tarot',{onComplete:()=>done++}),d=e.doc.querySelector('dialog');
  d.querySelector('.jr-next').click();const touch=d.querySelector('.jr-touch');
  const event=(type,x)=>({type,pointerId:1,isPrimary:true,button:0,clientX:x,clientY:240,cancelable:true,preventDefault(){}});
  touch.onpointerdown(event('pointerdown',110));touch.onpointermove(event('pointermove',155));
  assert.equal(d.getAttribute('data-phase'),'1');assert.equal(points.length,2);assert.equal(done,0);
  touch.onpointercancel(event('pointercancel',155));assert(!d.classList.contains('is-holding'));
  h.cancel();assert.equal(await h.finished,false);assert.equal(done,0);assert.equal(e.clock.timers.size,0);
 });
 console.log('realtime-free: '+passed+' groups passed; geometry and interaction checks, not GPU pixel or phone validation.');
})();
