'use strict';
// Production functions in a simulated DOM. This does not certify browser rendering.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),acorn=require('acorn');
const {environment}=require('./dom-fixture.cjs');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
let passed=0;
async function test(name,fn){try{await fn();passed++;console.log('✓ '+name);}catch(error){process.exitCode=1;console.error('✗ '+name+'\n'+error.stack);}}
function load(e,f){vm.runInContext(read('JS/'+f+'.js'),e.ctx,{filename:f});}
function actual(file,name,assignment=false){const source=read(file);let result;function walk(n){if(!n||typeof n!=='object')return;if(!assignment&&n.type==='FunctionDeclaration'&&n.id?.name===name)result=source.slice(n.start,n.end);if(assignment&&n.type==='AssignmentExpression'&&n.left.type==='MemberExpression'&&n.left.object.name==='window'&&n.left.property.name===name)result=source.slice(n.start,n.end)+';';for(const v of Object.values(n)){if(Array.isArray(v))v.forEach(walk);else if(v&&typeof v==='object')walk(v);}}walk(acorn.parse(source,{ecmaVersion:'latest'}));assert(result,'Production function '+name);return result;}
function add(e,tag,id){const el=e.doc.body.appendChild(new e.Element(tag));el.id=id;return el;}
function fixture(){
 const e=environment(),{ctx,doc,Element}=e,docEvents=new Element();
 doc.addEventListener=docEvents.addEventListener.bind(docEvents);doc.removeEventListener=docEvents.removeEventListener.bind(docEvents);doc.readyState='loading';e.docEvents=docEvents;
 // Extend only DOM operations needed by these paths, using browser semantics.
 Object.defineProperty(Element.prototype,'textContent',{get(){return this._text??(this._html||'').replace(/<[^>]*>/g,'');},set(v){this.children.forEach(n=>n.parentNode=null);this.children=[];this._html='';this._text=String(v);}});
 Element.prototype.insertBefore=function(el,before){el.remove();el.parentNode=this;const i=this.children.indexOf(before);this.children.splice(i<0?this.children.length:i,0,el);return el;};
 Element.prototype.getBoundingClientRect=function(){return {top:20,left:0,width:62,height:92,right:62,bottom:112};};
 Element.prototype.scrollIntoView=function(){};
 const baseMatches=Element.prototype.matches;
 Element.prototype.matches=function(selector){return selector.split(',').some(raw=>{const parts=raw.trim().split(/\s+/),last=parts.pop();let simple=last;const not=simple.match(/:not\(([^)]+)\)/);if(not){if(this.matches(not[1]))return false;simple=simple.replace(not[0],'');}const classes=simple.match(/^((?:\.[\w-]+)+)$/);const ok=classes?simple.slice(1).split('.').every(c=>this.classList.contains(c)):baseMatches.call(this,simple);if(!ok)return false;let node=this.parentNode;while(parts.length){const part=parts.pop();while(node&&!node.matches(part))node=node.parentNode;if(!node)return false;node=node.parentNode;}return true;});};
 let time=0,seq=0;const timers=new Map();
 ctx.Date=class extends Date{constructor(...args){super(...(args.length?args:[time]));}static now(){return time;}};
 ctx.setTimeout=(fn,ms=0)=>{const id=++seq;timers.set(id,{fn,at:time+ms});return id;};ctx.clearTimeout=id=>timers.delete(id);
 ctx.requestAnimationFrame=fn=>ctx.setTimeout(()=>fn(time),16);ctx.cancelAnimationFrame=ctx.clearTimeout;
 e.clock={timers,setTime:n=>time=n,clear:()=>timers.clear(),advance(ms){const end=time+ms;for(let i=0;i<3000;i++){const next=[...timers].sort((a,b)=>a[1].at-b[1].at)[0];if(!next||next[1].at>end){time=end;return;}timers.delete(next[0]);time=next[1].at;next[1].fn();}throw Error('Runaway timers');}};
 return e;
}
function tarotFixture(){
 const e=fixture();
 for(const id of ['t-spread-sec','t-spread','tarot-spread-display','tarot-spread-title','t-chosen','t-deck','t-remain-picked','t-target-count','pick-hint'])add(e,'div',id);
 add(e,'button','btn-analyze').disabled=true;
 ['picker-core','tarot-foundation','golden-dawn-tarot','tarot','tarot-reading','tarot_upgrade','ritual-ateliers'].forEach(f=>load(e,f));
 const ui=read('JS/ui.js');vm.runInContext(ui.slice(ui.indexOf('const _tarotImageCache ='),ui.indexOf('/* =============================================================',ui.indexOf('function getTarotCardImage'))),e.ctx);
 for(const name of ['drawnCards','deckShuffled','pickAnimating'])Object.defineProperty(e.ctx,name,{configurable:true,get(){return vm.runInContext(name,e.ctx);},set(value){e.ctx.__testValue=value;vm.runInContext(name+'=__testValue',e.ctx);}});
 e.ctx.S.form={question:'這段關係裡，我需要理解自己的哪些模式？',type:'love'};e.clock.clear();return e;
}
function complete(e,id){const c=e.ctx;c.setCurrentSpread(id);const def=c.getCurrentSpreadDef();c.drawnCards=c.JY_buildCanonicalTarotDraw(c.TAROT.slice(),id,def,'test','love',c.S.form.question);c.S.tarot.drawn=c.drawnCards;c.S.tarot.spread=c.drawnCards;c.showSpread();return c.drawnCards;}
(async()=>{
 for(const kind of ['tarot','lenormand','bazi','compat','ziwei','meihua','oracle'])await test(kind+': user-led scenes never time out; completion, focus and cleanup occur once',async()=>{
  const e=fixture(),trigger=add(e,'button','trigger');trigger.focus();e.doc.body.style.overflow='auto';load(e,'ritual-ateliers');let done=0;
  const h=e.ctx.JYRitual.play(kind,{onComplete:()=>done++}),dialog=e.doc.querySelector('dialog');assert(dialog.open);assert.equal(e.doc.body.style.overflow,'hidden');assert.equal(e.ctx.JYRitual.play(kind),h);
  e.clock.advance(12000);assert.equal(dialog.getAttribute('data-phase'),'0');assert.equal(done,0);
  dialog.querySelector('.jr-next').click();assert.equal(dialog.getAttribute('data-phase'),'1');e.clock.advance(6000);assert.equal(done,0);
  const seals=dialog.querySelectorAll('.jr-seal');if(seals.length)seals.forEach(b=>b.click());else dialog.querySelector('.jr-next').click();
  assert.equal(dialog.getAttribute('data-phase'),'2');e.clock.advance(2100);assert.equal(dialog.getAttribute('data-phase'),'3');assert.equal(done,0);
  e.clock.advance(12000);assert.equal(done,0);dialog.querySelector('.jr-next').click();assert.equal(await h.finished,true);assert.equal(done,1);h.skip();assert.equal(done,1);assert.equal(e.clock.timers.size,0);assert(!e.doc.querySelector('dialog'));assert.equal(e.doc.body.style.overflow,'auto');assert.equal(e.doc.activeElement,trigger);assert.equal(e.events.listeners.popstate.size,0);assert.equal(e.docEvents.listeners.visibilitychange.size,0);
 });
 await test('Skip, cancel, Escape, native close and navigation settle only once, including queued stale callbacks',async()=>{
  for(const action of ['skip','cancel','escape','native-close','popstate','pagehide','programmatic']){
   const e=fixture();load(e,'ritual-ateliers');let done=0,cancelled=0;const h=e.ctx.JYRitual.play('tarot',{onComplete:()=>done++,onCancel:()=>cancelled++}),d=e.doc.querySelector('dialog'),stale=[...e.clock.timers.values()];
   if(action==='skip'){d.querySelector('.jr-skip').click();d.querySelector('.jr-skip').click();}
   if(action==='cancel')d.querySelector('.jr-cancel').click();if(action==='escape')d.dispatch('cancel');if(action==='native-close')d.dispatch('close');if(action==='popstate'||action==='pagehide')e.events.dispatch(action);if(action==='programmatic')e.ctx.JYRitual.cancel();
   stale.forEach(t=>t.fn());assert.equal(await h.finished,action==='skip');assert.equal(done,action==='skip'?1:0);assert.equal(cancelled,['cancel','escape','native-close','popstate'].includes(action)?1:0);assert.equal(e.clock.timers.size,0);assert(!e.ctx.JYRitual.isActive());
  }
 });
 await test('Reduced motion preserves user control; hidden tabs cannot complete an untouched ritual',async()=>{
  const e=fixture();e.ctx.matchMedia=()=>({matches:true});load(e,'ritual-ateliers');const h=e.ctx.JYRitual.play('ziwei');e.clock.advance(9000);const d=e.doc.querySelector('dialog');assert.equal(d.getAttribute('data-phase'),'0');d.querySelector('.jr-next').click();d.querySelector('.jr-next').click();e.clock.advance(0);assert.equal(d.getAttribute('data-phase'),'3');d.querySelector('.jr-next').click();assert.equal(await h.finished,true);
  e.ctx.matchMedia=()=>({matches:false});const h2=e.ctx.JYRitual.play('bazi');e.clock.setTime(20000);e.doc.hidden=false;e.docEvents.dispatch('visibilitychange');assert(e.ctx.JYRitual.isActive());assert.equal(e.doc.querySelector('dialog').getAttribute('data-phase'),'0');h2.cancel();assert.equal(await h2.finished,false);assert.equal(e.clock.timers.size,0);
 });
 await test('Partial holds cancel cleanly; release, pointer cancellation and visibility changes never reveal a result',async()=>{
  for(const action of ['pointerup','pointercancel','lostpointercapture','visibilitychange']){
   const e=fixture();load(e,'ritual-ateliers');let done=0;const h=e.ctx.JYRitual.play('tarot',{onComplete:()=>done++}),d=e.doc.querySelector('dialog');d.querySelector('.jr-next').click();const t=d.querySelector('.jr-touch');t.dispatch('pointerdown',{button:0,pointerId:1});e.clock.advance(700);
   if(action==='visibilitychange'){e.doc.hidden=true;e.docEvents.dispatch(action);}else t.dispatch(action);e.clock.advance(10000);assert.equal(d.getAttribute('data-phase'),'1');assert.equal(done,0);assert.equal(e.clock.timers.size,0);
   e.doc.hidden=false;t.dispatch('pointerdown',{button:0,pointerId:2});e.clock.advance(1620);assert.equal(d.getAttribute('data-phase'),'2');h.cancel();assert.equal(await h.finished,false);assert.equal(e.clock.timers.size,0);
  }
 });
 await test('Card faces are absent before touch; real card order, reversal and callbacks survive sequential reveal',async()=>{
  const e=fixture();load(e,'ritual-ateliers');let done=0;const cards=[{id:8,name:'力量',image:'tarot_img/08-strength.jpg',isUp:false},{id:25,name:'聖杯四',image:'tarot_img/25.jpg',isUp:true},{id:9,name:'隱者',image:'tarot_img/09-hermit.jpg',isUp:true},{id:0,name:'愚者'}],original=JSON.stringify(cards);
  const h=e.ctx.JYRitual.play('tarot',{variant:'deal',cards,question:'<img src=x onerror=alert(1)>',onComplete:()=>done++}),d=e.doc.querySelector('dialog');assert.equal(d.getAttribute('data-phase'),'1');assert.equal(d.querySelectorAll('.jr-front img').length,0);assert.equal(d.querySelectorAll('.jr-question img').length,0);
  const buttons=d.querySelectorAll('.jr-reveal');buttons[1].click();assert.equal(d.querySelectorAll('.jr-front img').length,1);assert.equal(done,0);buttons[0].click();assert(buttons[0].querySelector('.is-reversed'));buttons[2].click();e.clock.advance(3000);assert.equal(d.getAttribute('data-phase'),'3');assert.equal(done,0);d.querySelector('.jr-next').click();assert.equal(await h.finished,true);assert.equal(done,1);assert.equal(JSON.stringify(cards),original);
 });
 await test('Sound requires an explicit gesture and closes its AudioContext on every exit',async()=>{
  const e=fixture();let created=0,closed=0,suspended=0,resumed=0;
  const param={setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}};
  e.ctx.AudioContext=class{constructor(){created++;this.currentTime=0;this.destination={};}createGain(){return {gain:{...param},connect(){}};}createOscillator(){return {frequency:{...param},connect(){},start(){},stop(){}};}resume(){resumed++;return Promise.resolve();}suspend(){suspended++;return Promise.resolve();}close(){closed++;return Promise.resolve();}};
  load(e,'ritual-ateliers');let h=e.ctx.JYRitual.play('meihua'),d=e.doc.querySelector('dialog');e.clock.advance(1000);assert.equal(created,0);const sound=d.querySelector('.jr-sound');sound.click();assert.equal(created,1);assert.equal(sound.getAttribute('aria-pressed'),'true');e.doc.hidden=true;e.docEvents.dispatch('visibilitychange');assert.equal(suspended,1);e.doc.hidden=false;e.docEvents.dispatch('visibilitychange');assert.equal(resumed,2);sound.click();assert.equal(closed,1);sound.click();h.cancel();assert.equal(await h.finished,false);assert.equal(created,2);assert.equal(closed,2);
 });
 await test('Native-dialog failure retains keyboard controls and restores existing inert states',async()=>{
  const e=fixture(),normal=add(e,'main','main'),inert=add(e,'aside','aside');normal.inert=false;inert.inert=true;e.Element.prototype.showModal=function(){throw Error('Unavailable');};load(e,'ritual-ateliers');
  const h=e.ctx.JYRitual.play('bazi'),d=e.doc.querySelector('dialog');assert(normal.inert);assert(inert.inert);d.querySelector('.jr-skip').focus();d.dispatch('keydown',{key:'Tab'});assert.equal(e.doc.activeElement,d.querySelector('.jr-cancel'));d.dispatch('keydown',{key:'Escape'});assert.equal(await h.finished,false);assert.equal(normal.inert,false);assert.equal(inert.inert,true);
 });
 await test('Tree of Life → Mathers 21 clears previous cards, derived data, visible meanings and analysis access together',()=>{
  const e=tarotFixture(),c=e.ctx;complete(e,'tree_of_life');assert.equal(c.drawnCards.length,10);assert.equal(e.doc.getElementById('t-spread-sec').hidden,false);assert(e.doc.getElementById('t-spread').innerHTML.length>0);c.S.tarot.oldPayload={card:'old'};
  c.setCurrentSpread('mathers_21');assert.equal(c.getCurrentSpreadDef().count,21);assert.equal(c.drawnCards.length,0);assert.equal(c.S.tarot.drawn.length,0);assert.equal(c.S.tarot.oldPayload,undefined);assert.equal(e.doc.getElementById('t-spread').innerHTML,'');assert(e.doc.getElementById('t-spread-sec').hidden);assert(e.doc.getElementById('btn-analyze').disabled);assert.equal(e.doc.getElementById('t-remain-picked').textContent,'0');
 });
 await test('Reopening a completed spread preserves its cards and count; fresh and minor-only decks stay face down',()=>{
  const e=tarotFixture(),c=e.ctx;complete(e,'three_card');const ids=c.drawnCards.map(x=>x.id).join(',');c.initTarotDeck();assert.equal(e.doc.getElementById('t-remain-picked').textContent,'3');assert.equal(c.drawnCards.map(x=>x.id).join(','),ids);assert.equal(e.doc.getElementById('t-chosen').querySelectorAll('.jy-card-face').length,3);
  for(const id of ['five_card','minor_arcana']){c.JYTarotSession.reset();c.setCurrentSpread(id);c.initTarotDeck();assert.equal(c.drawnCards.length,0);assert(e.doc.getElementById('t-spread-sec').hidden);const faces=e.doc.getElementById('t-deck').querySelectorAll('.tdc-face');assert(faces.length>0);assert(faces.every(el=>el.getAttribute('style')==='display:none'));assert(e.doc.getElementById('t-deck').querySelectorAll('.tdc-back').every(el=>el.getAttribute('style')==='transform:none'));assert.equal(c.deckShuffled.length,id==='minor_arcana'?56:78);c.JYTarotSession.reset();}
 });
 await test('An incomplete draw cannot render stale meanings; return and reselect of the same spread starts empty',()=>{
  const e=tarotFixture(),c=e.ctx;complete(e,'three_card');c.drawnCards=c.drawnCards.slice(0,1);c.showSpread();assert(e.doc.getElementById('t-spread-sec').hidden);assert.equal(e.doc.getElementById('t-spread').innerHTML,'');assert(e.doc.getElementById('btn-analyze').disabled);
  load(e,'atelier-ui');c._atelierReturnToInput();c.setCurrentSpread('three_card');assert.equal(c.drawnCards.length,0);assert.equal(c.S.tarot.drawn.length,0);assert.equal(c.getCurrentSpreadDef().count,3);assert.equal(c.S.form.question,'這段關係裡，我需要理解自己的哪些模式？');
 });
 await test('A pick interrupted before flight or before commit never enters the next reading',()=>{
  for(const delay of [100,500]){
   const e=tarotFixture(),c=e.ctx;c.setCurrentSpread('five_card');c.deckShuffled=c.TAROT.slice();c._deckIsShuffled=true;for(let i=0;i<5;i++)add(e,'div','t-slot-'+i);
   const card=add(e,'div','pick');card.className='tarot-deck-card';c.pickCard(0,card);e.clock.advance(delay);c.setCurrentSpread('three_card');e.clock.advance(2000);assert.equal(c.drawnCards.length,0);assert.equal(c.S.tarot.drawn.length,0);assert(e.doc.getElementById('btn-analyze').disabled);assert.equal(e.doc.querySelectorAll('.tarot-fly-card').length,0);
  }
 });
 await test('Quick completion reveals only after the ceremony, preserves a manual card and cannot commit twice',()=>{
  const e=tarotFixture(),c=e.ctx;c.setCurrentSpread('five_card');c.deckShuffled=c.TAROT.slice();const first=c.JYTarotReading.apply({...c.TAROT[25]},false,'five_card');c.drawnCards=[first];c.S.tarot.drawn=c.drawnCards;
  for(const n of ['jyTarotHardfixCSS','jyTarotShuffleArray','jyTarotGetDef','jyTarotGetSid','jyTarotRenderChosen','jyTarotFillSlots','jyTarotFinishAutodraw','jyTarotBuildDraw','jyTarotForceShuffledState'])vm.runInContext(actual('JS/ui.js',n),c);
  vm.runInContext(actual('JS/ui.js','autoDraw',true),c);c.autoDraw();c.autoDraw();assert.equal(c.drawnCards.length,1);assert(e.doc.getElementById('btn-analyze').disabled);const d=e.doc.querySelector('dialog');assert(d);d.querySelector('.jr-skip').click();d.querySelector('.jr-skip').click();assert.equal(c.drawnCards.length,5);assert.equal(c.drawnCards[0],first);assert.equal(first.isUp,false);assert.equal(new Set(c.drawnCards.map(x=>x.id)).size,5);assert.equal(e.doc.getElementById('btn-analyze').disabled,false);assert.equal(e.doc.getElementById('t-spread-sec').hidden,false);
 });
 await test('All five Lenormand spread ceremonies keep the original draw, delay results and cancel cleanly',()=>{
  for(const [id,count,q] of [['three',3,'今天面試會順利嗎？'],['five',5,'這份工作的發展與原因是什麼？'],['choice',7,'應該留在公司還是轉職？'],['nine',9,'這份工作的阻礙、資源與發展如何？'],['grand',36,'我今年工作、感情、家庭與生活的整體狀況如何？']]){
   const e=fixture();load(e,'ritual-ateliers');vm.runInContext(read('JS/lenormand.js').replace(/\}\)\(\);\s*$/,`window.__lnState=function(){return {phase:_lnPhase,cards:_lnDrawn,prompt:_lastPrompt};};})();`),e.ctx);
   const c=e.ctx;c._lenormandOpen();e.doc.getElementById('ln-q').value=q;c._lnSetSpread(id);e.doc.getElementById('ln-q').value=q;c._lnDoDraw();let state=c.__lnState();assert.equal(state.phase,'input');assert.equal(state.cards.length,count);const ids=state.cards.map(x=>x.id).join(',');c._lnDoDraw();assert.equal(c.__lnState().cards.map(x=>x.id).join(','),ids);e.doc.querySelector('.jr-skip').click();assert.equal(c.__lnState().phase,'result');assert.equal(c.__lnState().cards.map(x=>x.id).join(','),ids);assert.equal(e.doc.querySelectorAll('.ln-card').length,count);
   c._lnReset();e.doc.getElementById('ln-q').value=q;c._lnDoDraw();e.doc.querySelector('.jr-cancel').click();assert.equal(c.__lnState().phase,'input');assert.equal(c.__lnState().cards.length,0);assert.equal(c.__lnState().prompt,'');
  }
 });
 await test('Bazi, Meihua and Ziwei continuations run after completion only; Ziwei cancel restores the form',()=>{
  for(const [file,name,kind] of [['bazi-standalone','_showLoading','bazi'],['meihua-standalone','_showLoading','meihua'],['ziwei-standalone','showLoading','ziwei']]){
   const e=fixture();load(e,'ritual-ateliers');vm.runInContext(actual('JS/'+file+'.js',name),e.ctx);const input=add(e,'div','zw-input');input.style.display='none';let done=0;e.ctx[name](()=>done++);assert(e.ctx.JYRitual.isActive(kind));assert.equal(done,0);e.doc.querySelector('.jr-skip').click();assert.equal(done,1);e.ctx[name](()=>done++);e.doc.querySelector('.jr-cancel').click();assert.equal(done,1);if(kind==='ziwei')assert.equal(input.style.display,'block');
  }
 });
 await test('Compatibility commits its real calculation and history only after completion; cancel leaves both empty',async()=>{
  const e=fixture(),c=e.ctx;e.clock.setTime(Date.UTC(2026,8,11));const stored=new Map();c.localStorage={getItem:k=>stored.get(k)||null,setItem:(k,v)=>stored.set(k,v),removeItem:k=>stored.delete(k)};
  ['vendor/lunar','bazi-calendar-core','bazi','bazi_upgrade','solar-location','bazi-prompt-root','bazi-suite-core','ritual-ateliers'].forEach(f=>load(e,f));
  vm.runInContext(read('JS/bazi-suite.js').replace(/\}\)\(\);\s*$/,'window.__castCompat=castCompat;})();'),c);
  function input(){c.BaziSuiteUI.open('compat');for(const [prefix,date,gender] of [['a','1990-01-02','male'],['b','1992-06-18','female']])for(const [key,value] of Object.entries({date,time:'12:00',gender,boundary:'ZI_HOUR_23',country:'TW',city:'0',name:prefix}))e.doc.getElementById(prefix+'-'+key).value=value;e.doc.getElementById('c-question').value='如何理解彼此的相處差異？';}
  input();let pending=c.__castCompat();await Promise.resolve();assert(c.JYRitual.isActive('compat'));assert.equal(c.BaziSuiteUI.getState().compat,null);assert.equal(stored.size,0);e.doc.querySelector('.jr-cancel').click();await pending;assert.equal(c.BaziSuiteUI.getState().compat,null);assert.equal(stored.size,0);
  pending=c.__castCompat();await Promise.resolve();e.doc.querySelector('.jr-skip').click();await pending;assert(c.BaziSuiteUI.getState().compat.chartA.pillars.year);assert(c.BaziSuiteUI.getState().prompt.length>0);assert.equal(JSON.parse(stored.get('jy_bazi_suite_history_v1')).length,1);
  input();pending=c.__castCompat();await Promise.resolve();c.BaziSuiteUI.close();await pending;assert.equal(c.BaziSuiteUI.getState().compat,null);assert.equal(e.doc.body.style.overflow,'');assert.equal(JSON.parse(stored.get('jy_bazi_suite_history_v1')).length,1);
 });
 await test('Oracle ceremony returns to its guide, advances to throwing only on completion and stops on close',()=>{
  const e=fixture(),c=e.ctx;load(e,'ritual-ateliers');vm.runInContext(read('JS/oracle.js').replace(/\}\)\(\);\s*$/,'window.__oraclePhase=function(){return _phase;};})();'),c);
  c._oracleOpen();c._oracleShowGuide();c._oracleStartPray();assert.equal(c.__oraclePhase(),'praying');e.doc.querySelector('.jr-cancel').click();assert.equal(c.__oraclePhase(),'guide');c._oracleStartPray();e.doc.querySelector('.jr-skip').click();assert.equal(c.__oraclePhase(),'allowAsk');c._oracleShowGuide();c._oracleStartPray();c._oracleClose();e.clock.advance(6000);assert.equal(e.doc.getElementById('oracle-screen').style.display,'none');assert(!c.JYRitual.isActive());assert.equal(e.doc.body.style.overflow,'');
 });
 console.log('ritual-lifecycle: '+passed+' groups passed (simulated DOM; no device-rendering claim).');
})();
