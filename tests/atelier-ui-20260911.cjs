'use strict';
// Navigation, modal lifecycle and rendered-card geometry. These are DOM contracts,
// not a claim of mobile screenshots or visual end-to-end acceptance.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const acorn = require('acorn');
const { environment } = require('./dom-fixture.cjs');
const path = require('node:path');
const read = f => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
let passed = 0;
function test(name, run) { try { run(); passed++; console.log('✓ ' + name); } catch (error) { process.exitCode=1; console.error('✗ ' + name + '\n' + error.stack); } }
function load(env, name) { vm.runInContext(read('JS/'+name+'.js'), env.ctx, {filename:name}); }
function actualFunction(file, name) { const source=read(file); let found; function walk(node) { if(!node||typeof node!=='object')return; if(node.type==='FunctionDeclaration'&&node.id?.name===name)found=source.slice(node.start,node.end); for(const value of Object.values(node)){if(Array.isArray(value))value.forEach(walk);else if(value&&typeof value==='object')walk(value);} } walk(acorn.parse(source,{ecmaVersion:'latest'})); assert(found,name); return found; }
function expose(env, file, code) { vm.runInContext(read('JS/'+file+'.js').replace(/\}\)\(\);\s*$/,code+'\n})();'),env.ctx); }
function add(e, tag, id) { const el=e.doc.body.appendChild(new e.Element(tag)); el.id=id; return el; }
test('Eight home entrances are native buttons and reach the right flow; direct compatibility remains separate',()=>{
 const e=environment(),calls=[];add(e,'div','hook-screen');const input=add(e,'section','input-screen'),q=add(e,'textarea','f-question');
 e.ctx._enterFromHome=()=>calls.push('input');e.ctx.pickTool=(tool,options)=>calls.push([tool,options.stayAtQuestion]);
 e.ctx.BaziSuiteUI={open:tab=>calls.push(tab)};
 const bridges={lenormand:'_lenormandOpen',bazi:'_baziOpen',ziwei:'_ziweiOpen',meihua:'_meihuaOpen',oracle:'_oracleOpen'};
 for(const [name,key] of Object.entries(bridges))e.ctx[key]=()=>calls.push(name);
 load(e,'atelier-ui');vm.runInContext(actualFunction('JS/ui.js','_redesignHomepage')+';_redesignHomepage();',e.ctx);
 const tiles=e.doc.getElementById('hook-screen').querySelectorAll('.at-tool');assert.equal(tiles.length,8);
 for(const tile of tiles){assert.equal(tile.tagName,'BUTTON');vm.runInContext(tile.getAttribute('onclick'),e.ctx);}
 assert.deepEqual(JSON.parse(JSON.stringify(calls)),['input',['tarot',true],'input',['ootk',true],'lenormand','bazi','compat','ziwei','meihua','oracle']);
 assert.equal(input.getAttribute('data-atelier-mode'),'ootk');assert.equal(e.doc.activeElement,q);
});
test('Spread picker preserves incoming options, traps Tab, closes with Escape and restores prior focus/overflow',()=>{
 const e=environment(),events=new e.Element();e.doc.addEventListener=events.addEventListener.bind(events);e.doc.removeEventListener=events.removeEventListener.bind(events);e.doc.readyState='complete';
 const query=e.doc.querySelectorAll.bind(e.doc);e.doc.querySelectorAll=selector=>selector==='#jy-spread-list .jym-item'?e.doc.getElementById('jy-spread-list').querySelectorAll('.jym-item'):query(selector);
 let forwarded;e.ctx.pickTool=function(){forwarded=[...arguments];return 47;};
 const trigger=add(e,'button','trigger'),modal=add(e,'div','jy-spread-modal');modal.style.display='none';
 modal.innerHTML='<div class="jym-sheet"><button class="jym-close">關閉</button><div id="jy-spread-list"></div></div>';
 load(e,'spread-picker');assert.equal(e.ctx.pickTool('tarot',{stayAtQuestion:true}),47);assert.equal(forwarded[1].stayAtQuestion,true);
 e.doc.body.style.overflow='auto';trigger.focus();e.ctx.openSpreadPicker();const first=modal.querySelector('.jym-close'),last=modal.querySelector('.jym-item');
 assert.equal(e.doc.activeElement,first);assert.equal(e.doc.body.style.overflow,'hidden');assert.equal(last.getAttribute('aria-pressed'),'true');
 first.focus();events.dispatch('keydown',{key:'Tab',shiftKey:true});assert.equal(e.doc.activeElement,last);
 events.dispatch('keydown',{key:'Tab',shiftKey:false});assert.equal(e.doc.activeElement,first);
 events.dispatch('keydown',{key:'Escape'});assert.equal(modal.style.display,'none');assert.equal(e.doc.body.style.overflow,'auto');assert.equal(e.doc.activeElement,trigger);assert.equal(events.listeners.keydown.size,0);
});
test('All five Lenormand results keep complete, ordered cards; the grand tableau tail stays independent',()=>{
 const e=environment();load(e,'atelier-ui');
 expose(e,'lenormand',`window.viewTest={cards:CARDS,render:function(id){_lnPhase='result';_lnResolved=id;_lnDrawn=CARDS.slice(0,SPREADS[id].count);_render();}};`);
 for(const [id,count] of [['three',3],['five',5],['choice',7],['nine',9],['grand',36]]){
  e.ctx.viewTest.render(id);const screen=e.doc.getElementById('ln-screen');assert.equal(screen.querySelectorAll('.ln-card').length,count);assert.equal(screen.querySelectorAll('.at-card-position').length,count);
  assert.deepEqual(screen.querySelectorAll('.ln-card-img').map(x=>x.getAttribute('alt')),Array.from(e.ctx.viewTest.cards.slice(0,count),card=>card.name));
  assert(screen.querySelector('.ln-ai-copy-btn'));assert(screen.querySelector('.at-share-button'));
  if(id==='grand'){assert.equal(screen.querySelector('.ln-grand-layout').querySelectorAll('.ln-card').length,36);assert.equal(screen.querySelector('.at-chart-scroll').getAttribute('tabindex'),'0');}
 }
});
test('Meihua text survives changing method without becoming markup; the three actual input methods remain available',()=>{
 const e=environment();load(e,'atelier-ui');load(e,'meihua-standalone');e.ctx._meihuaStandaloneOpen();
 const unsafe='</textarea><img id="injected-ui" src=x> & 正常問題';e.doc.getElementById('mhx-q').value=unsafe;e.ctx._mhSetMethod('num');
 assert(!e.doc.getElementById('injected-ui'));assert(e.doc.getElementById('mhx-screen').innerHTML.includes('&lt;/textarea&gt;&lt;img'));
 e.doc.getElementById('mhx-up').value='8';e.doc.getElementById('mhx-lo').value='25';e.ctx._mhSetMethod('char');e.doc.getElementById('mhx-text').value='前途';e.ctx._mhSetMethod('num');assert.equal(e.doc.getElementById('mhx-up').value,'8');assert.equal(e.doc.getElementById('mhx-lo').value,'25');
 assert.equal(e.doc.getElementById('mhx-screen').querySelectorAll('.mhx-method-btn').length,3);
 assert.equal(read('JS/meihua-standalone.js'),read('meihua-standalone.js'));
});
test('Compatibility opens directly with two independent forms; single/personality/tools/history still open',()=>{
 const e=environment();load(e,'atelier-ui');load(e,'bazi-prompt-root');load(e,'bazi-suite-core');load(e,'bazi-suite');
 e.ctx.BaziSuiteUI.open('compat');assert.equal(e.ctx.BaziSuiteUI.getState().tab,'compat');assert(e.doc.getElementById('a-date'));assert(e.doc.getElementById('b-date'));assert(e.doc.getElementById('c-question'));
 for(const tab of ['single','personality','tools','history']){e.ctx.BaziSuiteUI.open(tab);assert.equal(e.ctx.BaziSuiteUI.getState().tab,tab);assert(e.doc.getElementById('bzs-main').innerHTML.length>0);}
 e.ctx.BaziSuiteUI.open('unknown');assert.equal(e.ctx.BaziSuiteUI.getState().tab,'single');e.ctx.BaziSuiteUI.close();assert.equal(e.doc.body.style.overflow,'');
});
console.log('atelier-ui: '+passed+' groups passed (simulated DOM; visual/device checks remain separate).');
