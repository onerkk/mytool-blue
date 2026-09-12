'use strict';
// Actual production controllers with a deterministic DOM/clock. Device gestures
// and rendered pixels remain explicitly separate from these regressions.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),acorn=require('acorn');
const {fixture,tarotFixture,load,add}=require('./ritual-lifecycle-20260911.cjs');
const root=path.resolve(__dirname,'..'),plain=x=>JSON.parse(JSON.stringify(x));
let n=0;async function test(name,fn){try{await fn();console.log('PASS '+name);n++;}catch(e){process.exitCode=1;console.error('FAIL '+name+'\n'+e.stack);}}
function dom(e=fixture()){Object.defineProperty(e.Element.prototype,'parentElement',{get(){return this.parentNode;}});e.Element.prototype.before=function(x){this.parentNode.insertBefore(x,this);};e.Element.prototype.after=function(x){this.parentNode.insertBefore(x,this.parentNode.children[this.parentNode.children.indexOf(this)+1]);};e.Element.prototype.scrollIntoView=()=>{throw Error('Unexpected viewport jump');};e.ctx.scrollTo=()=>{throw Error('Unexpected viewport jump');};return e;}
const cards=Array.from({length:15},(_,i)=>({id:i,name:'牌 '+i,image:'tarot_img/'+i+'.jpg',isUp:i%2===0}));
function ritual(){const e=fixture();load(e,'ritual-ateliers');let done=0,cancelled=0;const original=JSON.stringify(cards);const h=e.ctx.JYRitual.play('tarot',{variant:'deal',cards,onComplete(){done++;},onCancel(){cancelled++;}});return Object.assign(e,{h,d:e.doc.querySelector('dialog'),original,done:()=>done,cancelled:()=>cancelled});}
(async()=>{
 await test('Auto reveal spans 15 cards; order, reversal and one explicit completion stay intact',async()=>{
  const e=ritual();assert.equal(e.d.querySelectorAll('.jr-front img').length,0);e.d.querySelector('.jr-auto-reveal').click();e.clock.advance(22000);
  assert.equal(e.d.querySelectorAll('.jr-front img').length,15);assert.equal(e.d.getAttribute('data-phase'),'3');assert.equal(e.done(),0);
  const buttons=e.d.querySelectorAll('.jr-reveal');buttons.forEach((b,i)=>{assert.equal(b.querySelector('.jr-front img').src,cards[i].image);assert.equal(b.querySelector('.jr-front img').className,cards[i].isUp?'':'is-reversed');});
  e.d.querySelector('.jr-next').click();assert.equal(await e.h.finished,true);assert.equal(e.done(),1);assert.equal(JSON.stringify(cards),e.original);assert.equal(e.clock.timers.size,0);
 });
 await test('Pause at a page boundary leaves a usable Next Group button and resumes without re-reveals',()=>{
  const e=ritual(),auto=e.d.querySelector('.jr-auto-reveal');auto.click();e.clock.advance(1360);assert.equal(e.d.querySelectorAll('.jr-front img').length,3);auto.click();e.clock.advance(6000);
  assert.equal(e.d.querySelectorAll('.jr-front img').length,3);assert(!e.d.querySelector('.jr-next').disabled);e.d.querySelector('.jr-next').click();assert(!e.d.querySelectorAll('.jr-reveal')[3].hidden);
  e.d.querySelectorAll('.jr-reveal')[3].click();auto.click();e.clock.advance(20000);assert.equal(e.d.querySelectorAll('.jr-front img').length,15);assert.equal(e.done(),0);e.h.cancel();assert.equal(e.clock.timers.size,0);
 });
 await test('Backgrounding pauses auto reveal, while Cancel invalidates all scheduled reveals',async()=>{
  const e=ritual();e.d.querySelector('.jr-auto-reveal').click();e.clock.advance(700);const count=e.d.querySelectorAll('.jr-front img').length;
  e.doc.hidden=true;e.docEvents.dispatch('visibilitychange');e.clock.advance(15000);assert.equal(e.d.querySelectorAll('.jr-front img').length,count);assert.equal(e.done(),0);
  e.doc.hidden=false;e.docEvents.dispatch('visibilitychange');e.clock.advance(1500);assert.equal(e.d.querySelectorAll('.jr-front img').length,count);
  e.d.querySelector('.jr-auto-reveal').click();const stale=[...e.clock.timers.values()];e.d.querySelector('.jr-cancel').click();stale.forEach(x=>x.fn());assert.equal(await e.h.finished,false);assert.equal(e.done(),0);assert.equal(e.cancelled(),1);assert.equal(e.clock.timers.size,0);
 });
 await test('Reveal All handles 54 cards and duplicate clicks without a second draw or hidden-card omission',async()=>{
  const e=fixture();load(e,'ritual-ateliers');let done=0;const data=Array.from({length:54},(_,i)=>({...cards[i%15],id:i}));const before=JSON.stringify(data);
  const h=e.ctx.JYRitual.play('tarot',{variant:'deal',cards:data,onComplete(){done++;}}),d=e.doc.querySelector('dialog');d.querySelectorAll('.jr-reveal')[1].click();d.querySelector('.jr-reveal-all').click();d.querySelector('.jr-reveal-all').click();
  assert.equal(d.querySelectorAll('.jr-front img').length,54);e.clock.advance(4000);assert.equal(done,0);d.querySelector('.jr-next').click();assert.equal(await h.finished,true);assert.equal(done,1);assert.equal(JSON.stringify(data),before);assert.equal(e.clock.timers.size,0);
 });
 await test('Every Lenormand spread supports automatic reveal with the same canonical ids',()=>{
  for(const count of [3,5,6,9,36]){const e=fixture();load(e,'ritual-ateliers');const data=Array.from({length:count},(_,i)=>({id:i+1,name:'線索 '+i,image:'ln-cards/'+(i+1)+'.jpg'}));const before=JSON.stringify(data);const h=e.ctx.JYRitual.play('lenormand',{cards:data}),d=e.doc.querySelector('dialog');d.querySelector('.jr-next').click();d.querySelector('.jr-auto-reveal').click();e.clock.advance(50000);assert.equal(d.querySelectorAll('.jr-front img').length,count);assert.equal(JSON.stringify(data),before);h.cancel();assert.equal(e.clock.timers.size,0);}
 });
 await test('Ziwei atlas retains all 12 palaces; each click shows that palace, all stars and real trine/opposition',()=>{
  const e=dom(),c=e.ctx;load(e,'vendor/lunar');load(e,'bazi-calendar-core');load(e,'bazi');c.Lunar.Solar=c.Solar;
  const source=fs.readFileSync(path.join(root,'JS/ai-analysis.js'),'utf8');for(const node of acorn.parse(source,{ecmaVersion:'latest'}).body){if(node.type==='VariableDeclaration'&&node.declarations.some(x=>['SIHUA_TABLE','ZW_PALACES','ZW_MAJOR','ZW_BRIGHTNESS'].includes(x.id.name))||node.type==='FunctionDeclaration'&&node.id.name==='getStarBright')vm.runInContext(source.slice(node.start,node.end),c);}
  load(e,'ziwei');load(e,'immersive-experience');
  const z=c.computeZiwei(2000,1,1,12,'male'),before=JSON.stringify(z),wrap=add(e,'div','chart');wrap.innerHTML='<div class="at-chart-scroll"><div>原始完整命盤</div></div>';
  c.JYExperience.mountZiwei(wrap,z);c.JYExperience.mountZiwei(wrap,z);assert.equal(wrap.querySelectorAll('.jx-atlas').length,1);assert.equal(wrap.querySelectorAll('[data-palace]').length,12);
  const branches='子丑寅卯辰巳午未申酉戌亥';
  for(const b of wrap.querySelectorAll('[data-palace]')){b.click();const branch=b.getAttribute('data-palace'),p=z.palaces.find(x=>x.branch===branch),idx=branches.indexOf(branch);assert.equal(wrap.querySelectorAll('.jx-star').length,p.stars.length);assert.equal(wrap.querySelectorAll('.is-related').length,3);assert.deepEqual(plain(c.JYExperience.relations(z.palaces,branch).map(x=>x.branch)),[branch,branches[(idx+4)%12],branches[(idx+8)%12],branches[(idx+6)%12]]);assert.equal(b.getAttribute('aria-pressed'),'true');}
  wrap.querySelector('[data-view="chart"]').click();assert.equal(wrap.querySelector('.at-chart-scroll').hidden,false);wrap.querySelector('[data-view="orbit"]').click();assert.equal(wrap.querySelector('.at-chart-scroll').hidden,true);assert.equal(JSON.stringify(z),before);
 });
 await test('Bazi point-and-read preserves canonical values and does not expose a placeholder hour',()=>{
  const e=dom();load(e,'immersive-experience');const w=add(e,'div','bazi');w.innerHTML='<div class="bzx-pillars"></div>';const data={pillars:{year:{gan:'己',zhi:'卯'},month:{gan:'丙',zhi:'子'},day:{gan:'戊',zhi:'午'},hour:{gan:'戊',zhi:'午'}},gods:{year:{gan:'劫財'}},cangGan:{day:['丁','己']}};
  const before=JSON.stringify(data);e.ctx.JYExperience.mountBazi(w,data,{unknown:true});const hour=w.querySelector('[data-pillar="hour"]');assert(hour.disabled);assert(!hour.innerHTML.includes('午'));w.querySelector('[data-pillar="year"]').click();assert(w.querySelector('.jx-pillar-detail').innerHTML.includes('劫財'));assert.equal(JSON.stringify(data),before);assert.equal(w.querySelectorAll('.jx-pillar').length,4);
 });
 await test('All 384 Meihua combinations preserve actual 本互變 names, moving line and bottom-up order',()=>{
  const e=dom(tarotFixture());load(e,'meihua_upgrade');load(e,'immersive-experience');const c=e.ctx;
  for(let up=1;up<=8;up++)for(let lo=1;lo<=8;lo++)for(let dong=1;dong<=6;dong++){
   const mh=c.calcMH(up,lo,dong),before=JSON.stringify(mh),f=c.JYExperience.hexagramFrames(mh);assert.equal(f.length,3);assert.equal(f[0].title,mh.ben.n);assert.equal(f[1].title,mh.hu.n);assert.equal(f[2].title,mh.bian.n);
   const ben=plain(mh.lo.li.concat(mh.up.li));assert.deepEqual(plain(f[0].lines),ben);assert.deepEqual(plain(f[1].lines),[ben[1],ben[2],ben[3],ben[2],ben[3],ben[4]]);assert.equal(f[2].lines.filter((x,i)=>x!==ben[i]).length,1);assert.notEqual(f[2].lines[dong-1],ben[dong-1]);assert.equal(JSON.stringify(mh),before);
  }
  const w=add(e,'div','mh');w.innerHTML='<div class="mhx-gua-row"></div>';const mh=c.calcMH(1,8,1);c.JYExperience.mountMeihua(w,mh);w.querySelector('[data-hex="2"]').click();assert.equal(w.querySelectorAll('.jx-yao').length,6);assert.equal(w.querySelectorAll('.is-moving').length,1);assert(w.querySelector('.jx-hex-copy').innerHTML.includes(mh.bian.n));
 });
 await test('Camera choreography is finite at every phase and settles before the next explicit action',async()=>{
  const {cameraPose,CAST}=await import('../JS/cinematic-src/choreography.mjs');for(const kind of Object.keys(CAST))for(const aspect of [.4,1,2])for(const phase of [0,1,2,3])for(const since of [0,1.3,2.65,30]){const p=cameraPose(kind,{phase,since,power:.5},aspect);assert(Object.values(p).every(Number.isFinite));assert(p.z>6&&p.z<9);if(phase===3)assert.equal(p.x,0);}
 });
 console.log('Immersive experience: '+n+' regression groups passed. Physical Android touch and new WebGL pixels require device QA.');
})();
