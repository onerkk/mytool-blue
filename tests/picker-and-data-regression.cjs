'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
let checks=0;function test(name,fn){fn();checks++;console.log('✓ '+name);}
function environment(){
  let doc;
  class Element {
    constructor(tag='div'){this.tagName=tag.toUpperCase();this.attrs={};this.children=[];this.parentNode=null;this.listeners={};this.style={setProperty(k,v){this[k]=v;}};this.value='';this.checked=false;this.disabled=false;this.inert=false;this.dataset={};this.classList={add:(...xs)=>{this.className=[...new Set((this.className||'').split(' ').concat(xs))].join(' ');},remove:(...xs)=>{this.className=(this.className||'').split(' ').filter(x=>!xs.includes(x)).join(' ');},contains:x=>(this.className||'').split(' ').includes(x),toggle:(x,on)=>on?this.classList.add(x):this.classList.remove(x)};}
    setAttribute(k,v){this.attrs[k]=String(v);if(k==='id')this.id=String(v);if(k==='class')this.className=v;if(k==='disabled')this.disabled=true;if(k==='value')this.value=v;if(k.startsWith('data-'))this.dataset[k.slice(5).replace(/-([a-z])/g,(_,a)=>a.toUpperCase())]=String(v);}
    getAttribute(k){return k==='class'?this.className||null:this.attrs[k]??null;} removeAttribute(k){delete this.attrs[k];}
    appendChild(x){x.parentNode=this;this.children.push(x);return x;}removeChild(x){this.children=this.children.filter(n=>n!==x);x.parentNode=null;}remove(){if(this.parentNode)this.parentNode.removeChild(this);}
    get firstElementChild(){return this.children[0];}get isConnected(){return this===doc.body||this===doc.head||!!(this.parentNode&&this.parentNode.isConnected);}
    addEventListener(k,fn){(this.listeners[k]??=new Set()).add(fn);}removeEventListener(k,fn){this.listeners[k]?.delete(fn);}dispatch(k,e={}){e.target??=this;e.preventDefault??=()=>{};e.stopPropagation??=()=>{};for(const fn of [...this.listeners[k]||[]])fn(e);}
    matches(sel){return sel.split(',').some(raw=>{const s=raw.trim();if(s.startsWith('#'))return this.id===s.slice(1);if(s.startsWith('.'))return this.classList.contains(s.slice(1));let m=s.match(/^\[([^=\]]+)(?:=["']?([^"'\]]+)["']?)?\]$/);if(m)return m[2]===undefined?this.getAttribute(m[1])!==null:this.getAttribute(m[1])===m[2];return this.tagName.toLowerCase()===s;});}
    querySelectorAll(s){return this.children.flatMap(n=>[...(n.matches(s)?[n]:[]),...n.querySelectorAll(s)]);}querySelector(s){return this.querySelectorAll(s)[0]||null;}closest(s){return this.matches(s)?this:this.parentNode?.closest(s)||null;}
    focus(){doc.activeElement=this;}getClientRects(){return this.isConnected?[{}]:[];}
    showModal(){this.open=true;this.setAttribute('open','');}close(){this.open=false;this.removeAttribute('open');}
    set innerHTML(html){this._html=html;this.children.forEach(n=>n.parentNode=null);this.children=[];let stack=[this];for(const token of html.match(/<[^>]+>/g)||[]){if(/^<\//.test(token)){if(stack.length>1)stack.pop();continue;}const match=token.match(/^<([\w-]+)/);if(!match)continue;const el=new Element(match[1]);for(const m of token.slice(match[0].length).matchAll(/([\w-]+)(?:="([^"]*)"|='([^']*)'|=([^\s>]+))?/g))el.setAttribute(m[1],m[2]??m[3]??m[4]??'');stack.at(-1).appendChild(el);if(!/^(input|img|br|hr|meta|link)$/i.test(match[1])&&!token.endsWith('/>'))stack.push(el);}}
    get innerHTML(){return this._html||'';}
  }
  doc={body:new Element('body'),head:new Element('head'),createElement:t=>new Element(t),getElementById(id){return this.body.querySelector('#'+id)||this.head.querySelector('#'+id);},querySelector(s){return this.body.querySelector(s)||this.head.querySelector(s);},querySelectorAll(s){return this.body.querySelectorAll(s);},addEventListener(){}};
  const events=new Element(),vv=new Element();vv.height=600;vv.width=360;vv.offsetTop=0;
  const ctx={window:null,document:doc,console,Date,Math,Intl,TextEncoder,TextDecoder,Blob,URL,innerWidth:360,innerHeight:800,visualViewport:vv,addEventListener:events.addEventListener.bind(events),removeEventListener:events.removeEventListener.bind(events),localStorage:{getItem(){return null;},setItem(){},removeItem(){}},navigator:{clipboard:{writeText:async()=>{}}},location:{hostname:'localhost',href:'http://localhost/'},setTimeout(){return 1;},clearTimeout(){},setInterval(){return 1;},clearInterval(){},requestIdleCallback(){},performance:{now:()=>0},alert(){},scrollTo(){}};ctx.window=ctx;vm.createContext(ctx);return {ctx,doc,Element,events,vv};
}
const env=environment(),{ctx,doc,Element,vv,events}=env;function load(f){vm.runInContext(read(f),ctx,{filename:f});}
load('JS/picker-core.js');const api=ctx.JY_PICKER;
test('Gregorian date validity and clamped month navigation',()=>{
  assert(api.validDate(2000,2,29));assert(!api.validDate(1900,2,29));assert(!api.validDate(2100,2,29));assert(!api.validDate(2025,4,31));assert(!api.validDate(2025,13,1));
  for(const [y,m,d,delta,want] of [[1900,1,31,-1,[1900,1,31]],[2100,12,31,1,[2100,12,31]],[2024,1,31,1,[2024,2,29]],[2025,3,31,-1,[2025,2,28]]]){const n=api.shiftMonth(y,m,d,delta);assert.deepEqual([n.year,n.month,n.day],want);}
  assert.equal(api.dimensions({height:180,width:320,offsetTop:42},{}).height,180);assert.equal(api.dimensions(null,{height:667}).height,667);
});
test('Modal viewport events, scroll lock and focus are fully restored',()=>{
  const trigger=doc.body.appendChild(new Element('button'));trigger.focus();doc.body.style.overflow='auto';const bd=new Element('dialog');bd.innerHTML='<div aria-label="出生日期"><div id="test-body"></div><div><button>確定</button></div></div>';let dispose;dispose=api.mount(bd,'#test-body',()=>dispose());assert(bd.open);assert.equal(doc.body.style.overflow,'hidden');assert.equal(bd.style['--jy-picker-vh'],'600px');vv.height=240;vv.offsetTop=80;vv.dispatch('resize');assert.equal(bd.style['--jy-picker-vh'],'240px');assert.equal(bd.style['--jy-picker-top'],'80px');bd.dispatch('cancel');assert(!bd.isConnected);assert.equal(doc.body.style.overflow,'auto');assert.equal(doc.activeElement,trigger);assert.equal(vv.listeners.resize.size,0);assert.equal(events.listeners.resize.size,0);dispose();
});
test('Legacy dialog fallback restores inert siblings and focus',()=>{
  const bd=new Element('dialog');bd.showModal=undefined;bd.innerHTML='<div><div id="test-body"></div></div>';const sibling=doc.body.firstElementChild;const dispose=api.mount(bd,'#test-body',()=>{});assert(sibling.inert);dispose();assert(!sibling.inert);
});
load('JS/bazi-prompt-root.js');load('JS/ziwei-prompt-root.js');load('JS/bazi-standalone.js');load('JS/ziwei-standalone.js');
test('Actual Ziwei and Bazi picker handlers render all six weeks and confirm leap day',()=>{
  for(const [open,mode,year,month,day,confirm,bdId,bodyId,fieldId] of [['_zwxOpenDate','_zwxDpMode','_zwxDpYear','_zwxDpMonth','_zwxDpDay','_zwxConfirm','zwx-sheet-bd','zwx-sbody','zw-bd'],['_bzxOpenDate','_bzxDpMode','_bzxDpPickYear','_bzxDpPickMonth','_bzxDpPickDay','_bzxSheetConfirm','bzx-sheet-bd','bzx-sheet-body','bzx-date']]){
    const field=doc.createElement('input');field.id=fieldId;doc.body.appendChild(field);ctx[open]();ctx[mode]('year');ctx[year](2024);ctx[month](2);ctx[day](29);
    const body=doc.getElementById(bodyId);const grid=body.querySelector('[role=grid]');assert.equal(grid.querySelectorAll('.jy-picker-week').length,6);assert.equal(grid.querySelectorAll('button').length,29);assert(body.innerHTML.includes('aria-pressed="true"'));ctx[confirm]();assert.equal(field.value,'2024-02-29');assert(!doc.getElementById(bdId));
  }
});
// Exercise the real suite event handler through a test-only exposure of its private opener.
vm.runInContext(read('JS/bazi-suite.js').replace('  function openPicker(type,prefix,allowUnknown){','  window.__testOpenPicker=openPicker;\n  function openPicker(type,prefix,allowUnknown){'),ctx);
test('Full Bazi suite keeps the last month clamped and confirms the selected date',()=>{
  const field=doc.body.appendChild(new Element('input'));field.id='s-date';field.value='2099-12-31';ctx.__testOpenPicker('date','s');
  const bd=doc.getElementById('bzs-picker-bd');bd.dispatch('click',{target:bd.querySelector('[data-date-nav="1"]')});assert.equal(bd.querySelectorAll('.jy-picker-week').length,6);assert.equal(bd.querySelector('[role=grid]').querySelectorAll('button').length,31);bd.dispatch('click',{target:bd.querySelector('[data-picker-act="confirm"]')});assert.equal(field.value,'2099-12-31');assert(!bd.isConnected);
});
load('JS/vendor/lunar.js');load('JS/bazi-calendar-core.js');load('JS/solar-location.js');load('JS/bazi.js');load('JS/bazi_upgrade.js');load('JS/bazi-suite-core.js');
const chart=ctx.computeBazi(1983,8,25,12,0,'male',{referenceDate:'2026-06-26T00:00:00Z'});ctx.enhanceBazi(chart);
test('Unknown Bazi birth time excludes artificial hour and full-chart judgments',()=>{
  const p=ctx.buildBaziPrompt('工作如何？',chart,{unknown:true,solarInfo:{trueSolarDateTime:'FAKE_NOON'},birthLine:'1983/8/25，時辰未知'});assert(p.includes('・日柱：'));assert(!p.includes('・時柱：'));assert(!p.includes('FAKE_NOON'));assert(!p.includes('【B. 前端流派模型'));assert(!p.includes(chart.qiyun.startDate));
  const suite=ctx.BaziSuiteCore.buildSinglePrompt('general',chart,{unknown:true},'工作如何？');assert(!suite.includes('・時柱：'));assert(!suite.includes(chart.qiyun.startDate));
  const comp=ctx.BaziSuiteCore.createCompatibility(chart,chart,{metaA:{unknown:true},metaB:{unknown:true}});assert.equal(comp.personA.pillars.length,3);assert(comp.elementComplement.provisional);assert.equal(comp.luckSynchronization.years.length,0);assert(!ctx.BaziSuiteCore.buildCompatibilityPrompt(comp,'合夥？').includes('・時柱：'));
});
test('Unknown time does not create a fixed personality type from a noon placeholder',()=>{
  const p=ctx.BaziSuiteCore.buildPersonality(chart,{unknown:true});assert(p.provisional);assert.equal(p.code,'未定');assert.equal(p.axes.length,0);const prompt=ctx.BaziSuiteCore.buildPersonalityPrompt(p,'我的壓力反應？');assert(prompt.includes('三柱參考'));assert(!prompt.includes('FAKE_NOON'));assert(!prompt.includes('時柱 '+chart.pillars.hour.gan+chart.pillars.hour.zhi));
});
test('Known Bazi preserves actual hour and full data, reference date stays reproducible',()=>{
  const p=ctx.buildBaziPrompt('工作如何？',chart,{});assert(p.includes('・時柱：'));assert(p.includes('【B. 前端流派模型'));const p2=ctx.BaziSuiteCore.buildSinglePrompt('annual',chart,{},'流年');assert(p2.includes('2026'));assert(p2.includes('・時柱：'));
});
test('Unknown Ziwei time never exports an invented personal chart',()=>{
  const p=ctx._ziweiBuildPrompt({palaces:[{name:'假命宮',stars:[{name:'FAKE_STAR'}]}]}, {bdate:'1983-08-25',btimeUnknown:true,gender:'male',question:'工作？'});assert(p.includes('出生時辰未知'));assert(!p.includes('FAKE_STAR'));assert(!p.includes('假命宮'));assert(p.includes('工作？'));
});
test('All three pickers load after the shared core and body ID rules override legacy overflow',()=>{
  const html=read('index.html'),i=html.indexOf('JS/picker-core.js');for(const f of ['ziwei-standalone','bazi-standalone','bazi-suite'])assert(i>=0&&i<html.indexOf('JS/'+f+'.js'));
  const css=doc.getElementById('jy-picker-style').textContent;for(const id of ['zwx-sbody','bzx-sheet-body','bzs-picker-body'])assert(css.includes('dialog.jy-picker-dialog #'+id));
  for(const file of ['JS/ziwei-standalone.js','JS/bazi-standalone.js','JS/bazi-suite.js']){const s=read(file);assert(s.includes('JY_PICKER.mount'));assert(!/ForcePaint|forcePickerCalendarPaint/.test(s));}
});
console.log('picker-and-data-regression: '+checks+' groups passed (DOM contract tests, not browser layout tests)');
