'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {fixture,load}=require('./ritual-lifecycle-20260911.cjs');
(async()=>{
 const results=[];
 for(const kind of ['tarot','lenormand','ootk','vedic','bazi','compat','ziwei','meihua','oracle']){
  const e=fixture();load(e,'ritual-ateliers');let done=0;
  const h=e.ctx.JYRitual.play(kind,{cards:kind==='lenormand'?[{id:36,name:'十字架'},{id:15,name:'熊'},{id:20,name:'花園'}]:[],onComplete:()=>done++}),d=e.doc.querySelector('dialog');
  const html=d.innerHTML;e.events.dispatch('pagehide',{persisted:true});assert(e.ctx.JYRitual.isActive());assert.equal(done,0);assert.equal(e.doc.querySelector('dialog'),d);
  e.events.dispatch('pageshow',{persisted:true});assert.equal(d.innerHTML,html);assert.equal(d.getAttribute('data-phase'),'0');assert.equal(done,0);
  d.querySelector('.jr-next').click();
  if(kind==='lenormand')d.querySelectorAll('.jr-reveal').forEach(b=>b.click());else if(['bazi','compat'].includes(kind))d.querySelectorAll('.jr-seal').forEach(b=>b.click());else d.querySelector('.jr-next').click();
  e.clock.advance(1000);assert.equal(d.getAttribute('data-phase'),'2',kind);assert.equal(d.querySelector('.jr-next').disabled,false,'completed input has an animation-independent route');
  d.querySelector('.jr-next').click();assert.equal(d.getAttribute('data-phase'),'3');d.querySelector('.jr-next').click();assert.equal(await h.finished,true);assert.equal(done,1);
  e.clock.advance(10000);assert.equal(done,1);assert.equal(e.events.listeners.pageshow.size,0);assert.equal(e.events.listeners.pagehide.size,0);assert.equal(e.clock.timers.size,0);
  results.push({method:kind,status:'passed',cachedReturn:true,manualAnimationExit:true,completionExactlyOnce:true});
 }
 fs.writeFileSync(path.join(__dirname,'../docs/ritual-resume-validation-20261003-r8.json'),JSON.stringify({testedAt:new Date().toISOString(),passed:results.length,scope:'Simulated browser lifecycle events against actual ritual module; this is not a device rendering test',results},null,2)+'\n');
 console.log('R8 ritual resume: '+results.length+' methods passed');
})().catch(e=>{console.error(e);process.exitCode=1;});
