'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const {environment}=require('./dom-fixture.cjs');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
let passed=0;
function test(name,fn){fn();passed++;console.log('✓ '+name);}
function load(ctx,f){vm.runInContext(read('JS/'+f+'.js'),ctx,{filename:f+'.js',timeout:5000});}
function inkEnv({touch=0,narrow=false,reduced=false}={}){
  const env=environment(),{ctx,doc,Element}=env;
  const stats={canvases:0,contexts:0,draws:0},frames=new Map(),intervals=[],timeouts=[];let next=1;
  const docEvents=new Element();doc.addEventListener=docEvents.addEventListener.bind(docEvents);doc.removeEventListener=docEvents.removeEventListener.bind(docEvents);
  doc.readyState='complete';doc.hidden=false;
  ctx.innerWidth=narrow?360:1000;ctx.innerHeight=700;ctx.navigator.maxTouchPoints=touch;
  ctx.matchMedia=q=>({matches:q.includes('prefers-reduced-motion')?reduced:narrow,addEventListener(){}});
  ctx.requestAnimationFrame=fn=>{const id=next++;frames.set(id,fn);return id;};ctx.cancelAnimationFrame=id=>frames.delete(id);
  ctx.setInterval=fn=>{intervals.push(fn);return next++;};ctx.setTimeout=fn=>{timeouts.push(fn);return next++;};
  ctx.getComputedStyle=el=>({display:el.style.display||'block',visibility:el.hidden?'hidden':'visible',position:'fixed',zIndex:'100000',backgroundColor:'rgb(10,10,18)'});
  Object.defineProperty(Element.prototype,'nodeType',{get(){return 1;}});
  Element.prototype.insertBefore=function(node,before){if(node.parentNode)node.remove();const i=this.children.indexOf(before);node.parentNode=this;this.children.splice(i<0?this.children.length:i,0,node);return node;};
  Element.prototype.replaceChild=function(node,old){this.insertBefore(node,old);old.remove();return old;};
  const create=doc.createElement;
  doc.createElement=tag=>{const el=create(tag);if(tag==='canvas'){
    stats.canvases++;
    el.getContext=kind=>{stats.contexts++;if(kind!=='2d')return null;
      return new Proxy({}, {get(target,key){if(key in target)return target[key];if(key==='createRadialGradient')return ()=>({addColorStop(){}});return ()=>{stats.draws++;};},set(target,key,value){target[key]=value;return true;}});
    };
  }return el;};
  const host=doc.body.appendChild(new Element());host.id='bzx-screen';
  return {...env,stats,frames,intervals,timeouts,host,docEvents};
}
test('Touch, narrow and reduced-motion pages create no canvas, context, polling or input effects',()=>{
  for(const config of [{touch:5},{narrow:true},{reduced:true}]){
    const e=inkEnv(config);load(e.ctx,'ink-flow');const ink=e.ctx.JY_INK;
    assert.equal(ink.mode,'static');ink.burst(20,30);ink.pause();ink.resume();ink.setPickerOpen(true);ink.setPickerOpen(false);
    assert.deepEqual(e.stats,{canvases:0,contexts:0,draws:0});assert.equal(e.frames.size,0);assert.equal(e.intervals.length,0);assert.equal(e.timeouts.length,0);
    assert.equal(e.events.listeners.pointerdown,undefined);
  }
});
test('Desktop 2D fallback initializes without BACK error; picker suspension survives polling and visibility changes',()=>{
  const e=inkEnv();load(e.ctx,'ink-flow');const ink=e.ctx.JY_INK,cv=e.doc.getElementById('jy-ink');
  assert(cv);assert(e.stats.draws>0);assert.equal(e.frames.size,1);
  ink.setPickerOpen(true);assert.equal(e.frames.size,0);assert.equal(cv.hidden,true);
  const draws=e.stats.draws;e.intervals.forEach(fn=>fn());e.docEvents.dispatch('visibilitychange');
  e.events.dispatch('pointerdown',{clientX:10,clientY:20,target:e.host});ink.burst();
  assert.equal(e.stats.draws,draws);assert.equal(e.frames.size,0);
  ink.setPickerOpen(false);assert.equal(e.frames.size,1);assert.equal(cv.hidden,false);
  ink.pause();e.intervals.forEach(fn=>fn());e.docEvents.dispatch('visibilitychange');assert.equal(e.frames.size,0);
  ink.setPickerOpen(true);ink.setPickerOpen(false);assert.equal(e.frames.size,0,'closing a picker must preserve an explicit pause');
  ink.resume();assert.equal(e.frames.size,1);
  e.doc.hidden=true;e.docEvents.dispatch('visibilitychange');e.intervals.forEach(fn=>fn());assert.equal(e.frames.size,0);
  e.doc.hidden=false;e.docEvents.dispatch('visibilitychange');assert.equal(e.frames.size,1);
  const trigger=e.doc.body.appendChild(new e.Element('button'));e.events.dispatch('pointerdown',{clientX:2,clientY:4,target:trigger});
  // Context errors in the fallback must not be deferred until the next frame.
  const [id,frame]=[...e.frames.entries()][0];e.frames.delete(id);frame(16);assert(e.frames.size===1);
});
test('A desktop viewport becoming narrow suspends its existing background renderer',()=>{
  const e=inkEnv();load(e.ctx,'ink-flow');e.ctx.matchMedia=()=>({matches:true});e.intervals.forEach(fn=>fn());
  assert.equal(e.frames.size,0);assert.equal(e.doc.getElementById('jy-ink').hidden,true);
});
test('Picker close, native close, replacement and failed showModal release the backdrop and focus lock',()=>{
  const {ctx,doc,Element,vv,events}=environment(),ink=[];
  ctx.JY_INK={setPickerOpen:open=>ink.push(open)};load(ctx,'picker-core');const api=ctx.JY_PICKER;
  doc.body.style.overflow='auto';const trigger=doc.body.appendChild(new Element('button'));trigger.focus();
  function dialog(){const d=new Element('dialog');d.innerHTML='<section aria-label="測試"><div id="body"><button>既有按鈕</button></div></section>';return d;}
  const a=dialog();let cancels=0;const disposeA=api.mount(a,'#body',()=>{cancels++;});
  assert(!a.querySelector('button').classList.contains('jy-picker-close'));
  assert(doc.body.classList.contains('jy-picker-open'));a.querySelector('.jy-picker-close').click();
  assert.equal(cancels,1);assert(!a.isConnected);assert(!doc.body.classList.contains('jy-picker-open'));assert.equal(doc.activeElement,trigger);disposeA();
  const b=dialog(),c=dialog();api.mount(b,'#body',()=>{});const disposeC=api.mount(c,'#body',()=>{});assert(!b.isConnected);assert(c.open);
  c.close();c.dispatch('close');assert.equal(doc.body.style.overflow,'auto');assert(!c.isConnected);disposeC();
  const failed=dialog();failed.showModal=()=>{throw Error('native open failed');};assert.throws(()=>api.mount(failed,'#body',()=>{}),/native open failed/);
  assert(!failed.isConnected);assert(!doc.body.classList.contains('jy-picker-open'));assert.equal(doc.body.style.overflow,'auto');
  assert.equal(events.listeners.resize.size,0);assert.equal(vv.listeners.resize.size,0);assert.equal(ink.at(-1),false);
});
test('All birth picker content is present at native showModal, before any timer or animation frame',()=>{
  const {ctx,doc,Element}=environment();load(ctx,'picker-core');['bazi-prompt-root','ziwei-prompt-root','bazi-standalone','ziwei-standalone'].forEach(f=>load(ctx,f));
  vm.runInContext(read('JS/bazi-suite.js').replace('  function openPicker(type,prefix,allowUnknown){','  window.__openPicker=openPicker;\n  function openPicker(type,prefix,allowUnknown){'),ctx);
  ctx.BIRTH_CITIES={TW:{flag:'台',name:'台灣',cities:[['台北',121,25],['高雄',120,22]]}};
  for(const [id,value] of [['s-date','1983-08-25'],['s-time','14:55'],['s-country','TW'],['s-city','0']]){const x=doc.body.appendChild(new Element('input'));x.id=id;x.value=value;}
  let expected='',opened=0;const nativeOpen=Element.prototype.showModal;
  Element.prototype.showModal=function(){
    if(expected==='date'){assert.equal(this.querySelectorAll('[role=row]').length,7);assert.equal(this.querySelectorAll('.jy-picker-week').length,6);assert(this.querySelector('[role=grid]').querySelectorAll('button').length>=28);}
    else if(expected==='time'){assert.equal(this.querySelector('[data-jy-hour]').querySelectorAll('option').length,24);assert.equal(this.querySelector('[data-jy-minute]').querySelectorAll('option').length,60);}
    else if(expected==='shichen')assert.equal(this.querySelector('.zwx-sc-grid').querySelectorAll('button').length,13);
    else if(expected==='city')assert(this.querySelectorAll('.bzx-loc-chip').length>30);
    else if(expected==='suite-city')assert.equal(this.querySelectorAll('.bzs-loc-chip').length,2);
    opened++;nativeOpen.call(this);
  };
  ctx.setTimeout=ctx.requestAnimationFrame=()=>{throw Error('Picker must not wait for a timer/frame');};
  const cases=[['date',()=>ctx._bzxOpenDate()],['time',()=>ctx._bzxOpenTime()],['city',()=>ctx._bzxOpenCity()],['date',()=>ctx._zwxOpenDate()],['shichen',()=>ctx._zwxOpenHH()],['date',()=>ctx.__openPicker('date','s')],['time',()=>ctx.__openPicker('time','s')],['suite-city',()=>ctx.__openPicker('location','s')]];
  for(let round=0;round<3;round++)for(const [kind,open] of cases){expected=kind;open();const d=doc.querySelector('dialog');d.querySelector('.jy-picker-close').click();assert(!d.isConnected);assert(!doc.body.classList.contains('jy-picker-open'));}
  assert.equal(opened,24);
});
test('Full analysis module initializes in the real script order without eager optional-engine references',()=>{
  const {ctx,doc,Element}=environment();ctx.console={log(){},warn(){},error(){}};ctx.matchMedia=()=>({matches:false,addEventListener(){},addListener(){}});ctx.Image=Element;doc.readyState='loading';doc.documentElement=new Element('html');
  for(const f of ['tarot-foundation','golden-dawn-tarot','tarot','tarot-reading','tarot_upgrade','tarot-semantic-engine','tarot-inventory','meihua_upgrade','meihua_output_layer','meihua_upgrade2','frontend-classifier','ai-analysis'])load(ctx,f);
  assert.equal(typeof ctx.renderZiwei,'undefined','deferred Ziwei must not be captured or replaced at startup');
  // This value is initialized near the end of ai-analysis.js, after all wrappers.
  assert.equal(vm.runInContext('typeof _buildPayload',ctx),'function');
  assert.equal(vm.runInContext('typeof _origRenderBazi',ctx),'function');
  assert.equal(vm.runInContext('typeof MH_WX_EVENT',ctx),'object');
});
test('Mobile styles make the picker opaque and contain no deferred image-paint rule',()=>{
  const {ctx,doc,Element}=environment();load(ctx,'picker-core');const d=new Element('dialog');d.innerHTML='<div><div id="body"></div></div>';ctx.JY_PICKER.mount(d,'#body',()=>{});
  const css=doc.getElementById('jy-picker-style').textContent;
  assert(css.includes('dialog.jy-picker-dialog{background:#100d0a}'));
  assert(css.includes('max-height:420px'));assert(css.includes('overflow-x:hidden;overflow-y:auto'));
  assert(!read('CSS/style.css').includes('img[loading="lazy"]{content-visibility:auto}'));
  assert(read('CSS/style.css').includes('body{background-attachment:scroll}'));
});
console.log('display-lifecycle: '+passed+' groups passed (source/runtime contracts; device raster output requires browser/device validation)');
