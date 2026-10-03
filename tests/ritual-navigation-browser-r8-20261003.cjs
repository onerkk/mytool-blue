'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright');
const root=path.resolve(__dirname,'..'),width=Number(process.env.JY_ENTRY_WIDTH||390),results=[],out=path.join(root,'docs/qa-ui-r8');fs.mkdirSync(out,{recursive:true});
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.woff2':'font/woff2'};
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.JY_CHROMIUM,args:['--no-sandbox','--disable-dev-shm-usage','--no-zygote','--single-process','--in-process-gpu','--enable-unsafe-swiftshader']});
 try{
  const context=await browser.newContext({viewport:{width,height:844},serviceWorkers:'block'}),page=await context.newPage(),errors=[];let failedSheet=false;
  page.setDefaultTimeout(15000);page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.dismiss());
  await page.route('**/*',async route=>{const url=new URL(route.request().url());if(url.origin!=='https://jingyue.uk')return route.abort();if(url.pathname.startsWith('/api/'))return route.fulfill({contentType:'application/json',body:'{"ok":true,"total":1,"remaining":10}'});if(failedSheet&&url.pathname.endsWith('/mobile-ritual-actions-20260928.css'))return route.fulfill({contentType:'text/css',body:''});const file=path.resolve(root,'.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));try{return route.fulfill({body:fs.readFileSync(file),contentType:types[path.extname(file)]||'application/octet-stream'});}catch(e){return route.fulfill({status:404,body:''});}});
  await page.addInitScript(()=>{window.__nativeCopied='';Object.defineProperty(navigator,'clipboard',{value:{writeText:async text=>{window.__nativeCopied=text;}}});const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return /webgl/i.test(type)?null:get.call(this,type,...args);};});
  async function visibleControls(label){
   const state=await page.locator('.jr-dialog').evaluate(d=>{const values={};for(const key of ['.jr-next','.jr-skip','.jr-action-dock']){const e=d.querySelector(key),r=e.getBoundingClientRect(),s=getComputedStyle(e),x=r.x+r.width/2,y=r.y+r.height/2,hit=document.elementFromPoint(x,y);values[key]={x:r.x,y:r.y,w:r.width,h:r.height,visible:s.display!=='none'&&s.visibility==='visible'&&Number(s.opacity)>0,hit:!!hit&&(hit===e||e.contains(hit))};}return {phase:d.dataset.phase,viewport:{w:innerWidth,h:innerHeight},values};});
   for(const [key,v]of Object.entries(state.values)){assert(v.visible,label+key);assert(v.x>=-1&&v.y>=-1&&v.x+v.w<=state.viewport.w+1&&v.y+v.h<=state.viewport.h+1,label+key+' within viewport');if(key!=='.jr-action-dock')assert(v.hit,label+key+' hit-tested');}
   results.push({label,status:'passed',...state});return state;
  }
  for(const degraded of [false,true]){
   failedSheet=degraded;await page.goto('https://jingyue.uk/',{waitUntil:'load'});
   await page.evaluate(()=>{_lenormandOpen();_lnSetSpread('three');document.querySelector('#ln-q').value='這份工作應如何調整？';_lnDoDraw();});
   await page.locator('.jr-next').waitFor();await visibleControls('actual-three-initial-sheet-'+degraded);
   await page.locator('.jr-next').click();await page.setViewportSize({width,height:620});await visibleControls('actual-three-short-view-'+degraded);
   for(let i=0;i<3;i++)await page.locator('.jr-reveal').nth(i).click();await page.waitForFunction(()=>document.querySelector('.jr-dialog')?.dataset.phase==='2');
   const names=await page.locator('.jr-reveal').evaluateAll(cards=>cards.map(c=>c.getAttribute('aria-label')));
   await page.evaluate(()=>{window.dispatchEvent(new PageTransitionEvent('pagehide',{persisted:true}));window.dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true}));});await visibleControls('actual-three-restored-sheet-'+degraded);
   assert.deepEqual(await page.locator('.jr-reveal').evaluateAll(cards=>cards.map(c=>c.getAttribute('aria-label'))),names);
   await page.locator('.jr-next').click();await page.waitForFunction(()=>document.querySelector('.jr-dialog')?.dataset.phase==='3');await page.setViewportSize({width,height:844});await visibleControls('actual-three-ready-sheet-'+degraded);
   await page.screenshot({path:path.join(out,'lenormand-ready-'+width+'-'+degraded+'.png')});await page.locator('.jr-next').click();await page.locator('.jy-native-analysis:visible').waitFor();
   const b=await page.evaluate(()=>{_lnCopy();return window.__nativeCopied;});assert(b.includes('本題延伸手鍊建議'));assert(b.includes('月亮不自動配月光石'));assert(b.endsWith('[靜月之光蝦皮賣場](https://shopee.tw/a50h95648d?tab=shop)\n願你諸事順遂。'));
   if(await page.locator('[data-jpp-close]').count())await page.locator('[data-jpp-close]').click();await page.evaluate(()=>_lenormandClose());
  }
  for(const kind of ['tarot','ootk','vedic','bazi','compat','ziwei','meihua','oracle']){
   await page.evaluate(k=>{document.body.classList.remove('jy-atelier');window.__ritualCompleted=0;JYRitual.play(k,{question:'如何安排下一步？',onComplete:()=>window.__ritualCompleted++});},kind);
   await visibleControls(kind+'-without-theme-css');await page.locator('.jr-next').click();
   if(['bazi','compat'].includes(kind)){const seals=page.locator('.jr-seal');for(let i=0;i<await seals.count();i++)await seals.nth(i).click();}else await page.locator('.jr-next').click();
   await visibleControls(kind+'-animation-exit');await page.locator('.jr-next').click();await page.locator('.jr-next').click();assert.equal(await page.evaluate(()=>window.__ritualCompleted),1,kind+' completed once');await page.evaluate(()=>document.body.classList.add('jy-atelier'));
  }
  assert.equal(errors.length,0,errors.join('\n'));fs.writeFileSync(path.join(root,'docs/ritual-browser-validation-20261003-r8-'+width+'.json'),JSON.stringify({testedAt:new Date().toISOString(),width,passed:results.length,results,scope:'Real Chromium, actual Lenormand draw and production ritual buttons; software GPU absence, missing action stylesheet, absent theme, short viewport and cached-return events are deliberately exercised. Cached-return events are simulated, not an Android device certification.',errors},null,2)+'\n');console.log('R8 real-browser navigation '+results.length+' cases passed at '+width);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
