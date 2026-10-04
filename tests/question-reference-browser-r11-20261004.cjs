'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright'),root=path.resolve(__dirname,'..'),width=Number(process.env.JY_ENTRY_WIDTH||390),results=[];
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.webp':'image/webp','.woff2':'font/woff2'};
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.JY_CHROMIUM,args:['--no-sandbox','--disable-dev-shm-usage','--no-zygote','--single-process','--in-process-gpu','--enable-unsafe-swiftshader']});
 try{
  const page=await browser.newPage({viewport:{width,height:844},serviceWorkers:'block',reducedMotion:'reduce'}),errors=[];page.setDefaultTimeout(30000);page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/*',async route=>{const u=new URL(route.request().url());if(u.origin!=='https://jingyue.uk')return route.abort();if(u.pathname.startsWith('/api/'))return route.fulfill({contentType:'application/json',body:'{"ok":true,"total":1,"remaining":10}'});const f=path.resolve(root,'.'+decodeURIComponent(u.pathname==='/'?'/index.html':u.pathname));if(!f.startsWith(root+path.sep))return route.abort();try{return route.fulfill({body:fs.readFileSync(f),contentType:types[path.extname(f)]||'application/octet-stream'});}catch(_){return route.fulfill({status:404,body:''});}});
  await page.addInitScript(()=>{window.__r11copied='';Object.defineProperty(navigator,'clipboard',{value:{writeText:async t=>{window.__r11copied=t;}}});});
  await page.goto('https://jingyue.uk/',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>typeof _lenormandOpen==='function'&&typeof JYPromptPacket!=='undefined');
  const q='年底前會出現非現任的肉體桃花嗎？她幾歲？';
  await page.evaluate(()=>{_lenormandOpen();_lnSetSpread('auto');});await page.locator('#ln-q').fill(q);await page.evaluate(()=>_lnDoDraw());
  await page.locator('.jr-skip').click();await page.evaluate(()=>_lnCopy());await page.waitForFunction(()=>window.__r11copied.includes('同盤修正'));
  const first=await page.evaluate(()=>{const p=JYPromptPacket.get(window.__r11copied);return {body:p.body,parts:p.parts,cards:p.readingData.sections.find(s=>s.label==='本次完整操作與牌籤作用').data.records};});
  assert.equal(first.cards.length,6);assert(first.body.includes('非現任對象'));assert(first.body.includes('不擅改問相對年齡'));assert(first.body.includes('不得聲稱重新抽牌'));assert(first.cards.slice(3).every(c=>c.position.includes('她幾歲')));
  if(first.parts.length>1){await page.locator('[data-jpp-close]').click();}
  await page.evaluate(()=>_lnCopy());const again=await page.evaluate(()=>JYPromptPacket.get(window.__r11copied).readingData.sections.find(s=>s.label==='本次完整操作與牌籤作用').data.records);assert.deepEqual(again,first.cards);
  if(first.parts.length>1){await page.locator('[data-jpp-full-copy]').click();assert.equal(await page.evaluate(()=>window.__r11copied),first.body);await page.locator('[data-jpp-close]').click();}
  const dir=path.join(root,'docs/qa-ui-r11');fs.mkdirSync(dir,{recursive:true});await page.screenshot({path:path.join(dir,'same-cast-reference-'+width+'.png')});
  results.push({method:'lenormand',width,status:'passed',cards:first.cards.map(c=>({id:c.id,position:c.position})),originalQuestion:q,exactAgeQueryPreserved:true,sameDrawOnRepeatCopy:true,completeTextCopy:true,attachmentRequired:false});
  await page.evaluate(()=>_lenormandClose());
  const guard=await page.evaluate(()=>{const F=JYTarotFoundation;return {current:F.compileQuestion('現任女友喜歡我嗎？她幾歲？').queryGraph.events.at(-1).roles.personBinding,ambiguous:F.compileQuestion('女友和女同事會支持我嗎？她幾歲？').queryGraph.events.at(-1).roles.personBinding};});
  assert.equal(guard.current.surface,'現任女友');assert.equal(guard.ambiguous.status,'ambiguous');results.push({method:'shared-question-parser',width,status:'passed',guards:guard});assert.deepEqual(errors,[]);
 }finally{await browser.close();}
 fs.writeFileSync(path.join(root,'docs/question-reference-browser-20261004-r11-'+width+'.json'),JSON.stringify({testedAt:new Date().toISOString(),width,browser:'Chrome for Testing141.0.7390.37',results,scope:'Actual browser UI, production random draw and clipboard text; counter API stub only, no remote AI response or real Android certification.'},null,2));console.log('R11 actual same-cast reference and copy: '+results.length+' cases at '+width);
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
