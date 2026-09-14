'use strict';
// A spatial choreography contract: camera continuity, usable reveal, native-data adapter.
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..');
(async()=>{
 const {motion,DURATION}=await import('../JS/vedic-cinema-motion.mjs');
 const checks=[];function test(name,fn){fn();checks.push(name);console.log('PASS '+name);}
 test('Mobile and desktop camera cross the threshold before the instrument reveal',()=>{
  for(const aspect of [.38,.46,.75,1.44,2]){
   const a=motion(0,aspect),b=motion(.24,aspect),z=motion(1,aspect);
   assert(a.camera[2]>a.gateZ);assert(b.camera[2]<b.gateZ);assert.equal(b.gateOpen,1);
   assert(a.camera[2]-z.camera[2]>5);assert(Math.abs(z.camera[0])>2);
   assert(Math.abs(z.boardEuler[0])>.15&&Math.abs(z.boardEuler[1])>.15);
  }
 });
 test('Camera never jumps at a chapter boundary, and always keeps a finite target',()=>{
  for(const aspect of [.46,1.44]){
   let prev=motion(0,aspect);for(let i=1;i<=1000;i++){
    const m=motion(i/1000,aspect);assert(m.camera.concat(m.target).every(Number.isFinite));
    assert(Math.hypot(...m.camera.map((x,k)=>x-prev.camera[k]))<.08);prev=m;
   }
  }
 });
 test('Twelve physical houses rise after the orbit chapter and settle before the open action',()=>{
  assert(DURATION>=12000&&DURATION<=18000);assert(motion(.7).tileRise.every(x=>x===0));
  assert.equal(motion(.85).tileRise.length,12);assert(motion(.85).tileRise[0]>motion(.85).tileRise[11]);
  assert(motion(1).tileRise.every(x=>x===1));assert.equal(motion(1).reveal,1);
  assert.equal(motion(2).progress,1);assert.equal(motion(-1).progress,0);
 });
 test('Touch inspection is bounded; the final twelve-house board stays visible from both sides',()=>{
  for(const side of [-.65,.65]){const m=motion(1,.46,side);assert(Math.abs(m.boardEuler[1])<Math.PI/2);assert(m.camera[2]>9);}
 });
 test('The browser bundle exposes the native-data model without requiring a WebGL context at load',()=>{
  const ctx={console};ctx.window=ctx;vm.createContext(ctx);vm.runInContext(fs.readFileSync(path.join(root,'JS/vedic-scene.js'),'utf8'),ctx);
  const keys=['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn','Rahu','Ketu'];
  const chart={lagna:{sign:8},planets:Object.fromEntries(keys.map((k,i)=>[k,{longitude:19.123+i*37,sign:i,house:i+1,nakshatra:{index:24}}]))},before=JSON.stringify(chart);
  const model=ctx.JYVedicScene.model(chart);assert.equal(model.planets.length,9);
  for(const p of model.planets){assert.equal(p.longitude,chart.planets[p.key].longitude);assert.equal(p.house,chart.planets[p.key].house);}
  assert.equal(JSON.stringify(chart),before);assert.equal(ctx.JYVedicScene.duration,DURATION);
  chart.lagna=null;for(const p of Object.values(chart.planets))p.house=null;assert.equal(ctx.JYVedicScene.model(chart).lagna,null);
 });
 test('Palace materials and cache are wired into the delivered entry page',()=>{
  const html=fs.readFileSync(path.join(root,'index.html'),'utf8');assert(html.includes('CSS/vedic-palace.css?v=20260914palace1'));
  assert(html.indexOf('CSS/vedic-palace.css')>html.indexOf('CSS/vedic.css'));require('postcss').parse(fs.readFileSync(path.join(root,'CSS/vedic-palace.css'),'utf8'));
  assert(fs.statSync(path.join(root,'assets/ui/vedic-palace-20260914.webp')).size>100000);
  assert.equal(fs.readFileSync(path.join(root,'sw.js'),'utf8'),fs.readFileSync(path.join(root,'JS/sw.js'),'utf8'));
 });
 console.log(JSON.stringify({passed:checks.length,checks}));
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
