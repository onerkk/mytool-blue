'use strict';
// Real result rendering and handlers in a simulated DOM, not a phone pixel test.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {fixture,load}=require('./ritual-lifecycle-20260911.cjs');
const root=path.resolve(__dirname,'..'),source=fs.readFileSync(path.join(root,'JS/oracle.js'),'utf8');
const hook=String.raw`
window.__resultTest={poems:P,markup:_oracleResultHTML,share:_oracleShareData,
 show:function(n,question,holy){_poem=P[n-1];_qText=question||'';_holy=holy==null?3:holy;_phase='poem';_getWrap().style.display='block';_render();return _lastOraclePrompt;},
 state:function(){return JSON.stringify({poem:_poem,holy:_holy,phase:_phase,question:_qText,prompt:_lastOraclePrompt});},
 html:function(){return _getWrap().innerHTML;}};
})();`;
function setup(){
 const e=fixture(),p=e.Element.prototype,append=p.appendChild;
 p.appendChild=function(n){n.remove();return append.call(this,n);};
 p.after=function(n){if(!this.parentNode)return;const parent=this.parentNode,i=parent.children.indexOf(this);parent.insertBefore(n,parent.children[i+1]);};
 p.select=function(){e.doc.activeElement=this;};
 load(e,'reading-quality');load(e,'cinematic-ui');
 vm.runInContext(source.replace(/\}\)\(\);\s*$/,hook),e.ctx,{filename:'oracle.js'});
 return e;
}
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let passed=0;
async function test(name,fn){try{await fn();passed++;console.log('✓ '+name);}catch(error){process.exitCode=1;console.error('✗ '+name+'\n'+error.stack);}}
(async()=>{
 await test('All 60 poems keep their four original lines, number, source and actual prompt',()=>{
  const e=setup(),api=e.ctx.__resultTest;assert.equal(api.poems.length,60);
  for(const poem of api.poems){
   const before=JSON.stringify(poem),prompt=api.show(poem.n,'最近換工作，需要留意什麼？'),html=api.html();
   const lines=[...html.matchAll(/<p class="or-poem-line">(.*?)<\/p>/g)].map(m=>m[1]);
   assert.deepEqual(lines,Array.from(poem.p.split('\n'),escape));assert.equal(lines.length,4);
   assert(html.includes(escape(poem.g)));assert(html.includes('href="'+escape(poem.sourceUrl)+'"'));
   assert(prompt.includes(poem.p));assert(prompt.includes('第'+poem.n+'籤（'+poem.g+'）'));assert(prompt.includes(poem.sourceUrl));
   assert.equal(JSON.stringify(poem),before);assert.equal(api.share().poem,poem.p);assert.equal(api.share().number,poem.n);
  }
 });
 await test('Question markup is escaped; an unconfirmed or unavailable prompt never gains a confirmation or AI controls',()=>{
  const e=setup(),api=e.ctx.__resultTest,question='<img src=x onerror="alert(1)"> & "問題"';
  const html=api.markup({poem:api.poems[3],numberLabel:'第四籤',question,confirmed:false,hasPrompt:false,art:'img/oracle/oracle-deity.png'});
  assert(html.includes(escape(question)));assert(!html.includes(question));assert(!html.includes('三聖筊確認'));assert(!html.includes('orc-ai-copy-btn'));
  assert(!html.includes('or-question"><span>你想問的事</span><p></p>'));
 });
 await test('Horizontal and vertical reading retain the result, prompt, DOM nodes and scroll position without drawing again',()=>{
  const e=setup(),api=e.ctx.__resultTest;api.show(4,'下一步怎麼走？');const screen=e.doc.getElementById('oracle-screen');
  const state=api.state(),area=screen.querySelector('.or-poem-lines'),nodes=area.children.slice();screen.scrollTop=480;
  for(const layout of ['vertical','horizontal','invalid']){
   e.ctx._oracleSetPoemLayout(layout);assert.equal(screen.scrollTop,480);assert.equal(api.state(),state);
   assert.equal(screen.querySelector('.or-poem-lines'),area);assert.deepEqual(area.children,nodes);
   assert.equal(area.getAttribute('data-layout'),layout==='vertical'?'vertical':'horizontal');
   const active=screen.querySelectorAll('[data-or-layout]').filter(n=>n.getAttribute('aria-pressed')==='true');
   assert.equal(active.length,1);assert.equal(active[0].getAttribute('data-or-layout'),area.getAttribute('data-layout'));
  }
 });
 await test('Provider folding is repeatable and preserves all 10 handlers without adding duplicate introductions',()=>{
  const e=setup();e.ctx.__resultTest.show(4);const screen=e.doc.getElementById('oracle-screen');
  for(let i=0;i<3;i++)e.ctx.JYCinemaUI.oracle(screen,'poem');
  assert.equal(screen.querySelectorAll('.orc-ai-shortcut').length,10);assert.equal(screen.querySelectorAll('.jf-more-ai').length,1);
  const grids=screen.querySelectorAll('.orc-ai-grid');assert.equal(grids[0].children.length,3);assert.equal(grids[1].children.length,7);
  assert.equal(screen.querySelectorAll('.jd-handoff-steps').length,0);assert.equal(screen.querySelectorAll('.jc-oracle-companion').length,0);
  for(const b of screen.querySelectorAll('.orc-ai-shortcut'))assert.match(b.getAttribute('onclick'),/^_oracleOpenAI\('[a-z]+'\)$/);
 });
 await test('Clipboard success copies the full real prompt; denied APIs and false fallback report manual copying honestly',async()=>{
  for(const mode of ['native','legacy','denied','missing']){
   const e=setup(),prompt=e.ctx.__resultTest.show(4,'如何處理工作壓力？'),screen=e.doc.getElementById('oracle-screen');let copied='';
   e.ctx.navigator.clipboard=mode==='missing'?undefined:{writeText:text=>{if(mode==='native'){copied=text;return Promise.resolve();}return Promise.reject(Error('Denied'));}};
   e.doc.execCommand=()=>{if(mode==='legacy'){copied=e.doc.activeElement.value;return true;}return false;};
   screen.scrollTop=730;const button=screen.querySelector('.orc-ai-copy-btn');button.focus();
   const ok=await e.ctx._oracleCopyPrompt();assert.equal(ok,mode==='native'||mode==='legacy');assert.equal(screen.scrollTop,730);assert.equal(e.doc.activeElement,button);
   const manual=screen.querySelector('.or-manual-copy'),status=screen.querySelector('.or-copy-status').textContent;
   assert.equal(manual.hidden,ok);assert.equal(screen.querySelector('#or-copy-text').value,ok?'':prompt);
   if(ok){assert.equal(copied,prompt);assert.match(status,/已複製/);}else{assert.match(status,/手動複製/);assert(!status.includes('已複製'));}
   assert.equal(e.doc.body.children.filter(x=>x.tagName==='TEXTAREA').length,0);
  }
 });
 await test('AI tab opens during the original tap, before copying settles; invalid destinations and stale feedback are ignored',async()=>{
  const e=setup(),api=e.ctx.__resultTest,prompt=api.show(4,'我應該怎麼開始？'),events=[];let settle;
  e.ctx.navigator.clipboard.writeText=text=>{assert.equal(text,prompt);events.push('copy-start');return new Promise(resolve=>settle=resolve);};
  e.ctx.open=(url,target,features)=>events.push([url,target,features]);
  const task=e.ctx._oracleOpenAI('chatgpt');assert.deepEqual(events,['copy-start',['https://chatgpt.com/','_blank','noopener,noreferrer']]);
  const old=e.doc.querySelector('#oracle-screen .or-reading-panel');api.show(5,'新的問題');settle();assert.equal(await task,true);
  assert.notEqual(e.doc.querySelector('#oracle-screen .or-reading-panel'),old);assert.equal(e.doc.querySelector('.orc-ai-copy-btn')._text,undefined);
  assert.equal(await e.ctx._oracleOpenAI('__proto__'),false);assert.equal(events.length,2);
 });
 await test('Share and image export receive the same poem and question after switching reading direction',async()=>{
  const e=setup(),api=e.ctx.__resultTest;api.show(4,'下一步如何溝通？');const calls=[];
  e.ctx.JYShareCard={open:(type,data)=>calls.push({type,data}),download:(type,data)=>{calls.push({type,data});return Promise.resolve();}};
  e.ctx._oracleSetPoemLayout('vertical');e.ctx._oracleShare();e.ctx._oracleDownload();
  assert.equal(calls.length,2);assert.equal(JSON.stringify(calls[0]),JSON.stringify(calls[1]));assert.equal(calls[0].data.number,4);
  assert.equal(calls[0].data.poem,'風恬浪靜可行舟\n恰是中秋月一輪\n凡事不須多憂慮\n福祿自有慶家門');assert.equal(calls[0].data.question,'下一步如何溝通？');
 });
 console.log('oracle-result: '+passed+' groups passed (simulated DOM; no device-rendering claim).');
})();
