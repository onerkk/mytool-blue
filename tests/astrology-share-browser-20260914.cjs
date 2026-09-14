'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..'),runtimeOut=process.env.JY_QA_RUNTIME,out=process.env.JY_SHARE_REVIEW||path.join(root,'review/astrology-share-20260914'),sansDir=process.env.JY_QA_SANS;
(async()=>{
 fs.mkdirSync(out,{recursive:true});
 const pw=require(process.env.JY_PLAYWRIGHT_MODULE||(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright':'playwright'));
 let launch={headless:true};if(runtimeOut){const {default:chrome}=await import(runtimeOut+'/runtime-deps/node_modules/@sparticuz/chromium/build/index.js');const base=runtimeOut+'/browser-bin';launch={...launch,executablePath:base+'/chromium',args:chrome.args,env:{...process.env,LD_LIBRARY_PATH:base,FONTCONFIG_PATH:'/etc/fonts'}};}
 const browser=await pw.chromium.launch(launch);
 const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true,serviceWorkers:'block'}),page=await context.newPage();const errors=[],missing=[],calls=[];
 page.on('pageerror',e=>errors.push(String(e)));page.on('dialog',d=>d.dismiss());
 await context.route('**/*',async route=>{
  const url=new URL(route.request().url());calls.push({host:url.hostname,path:url.pathname});
  if(url.pathname.startsWith('/__qa_sans/'))return route.fulfill({path:sansDir+'/files/'+path.basename(url.pathname)});
  if(url.pathname.startsWith('/__qa_font/'))return route.fulfill({path:runtimeOut+'/qa-fonts/package/files/'+path.basename(url.pathname)});
  if(['jingyue.uk','www.jingyue.uk'].includes(url.hostname)&&!url.pathname.startsWith('/api/')){
   const file=path.resolve(root,'.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));
   if(file.startsWith(root+'/')&&fs.existsSync(file)&&fs.statSync(file).isFile())return route.fulfill({path:file,headers:{'Cache-Control':'no-store'}});
   missing.push(url.pathname);return route.fulfill({status:404,body:''});
  }
  if(url.hostname==='fonts.googleapis.com'){if(!runtimeOut||!sansDir)return route.fulfill({contentType:'text/css',body:''});let css=fs.readFileSync(runtimeOut+'/qa-fonts/package/400.css','utf8').replaceAll('./files/','https://jingyue.uk/__qa_font/');return route.fulfill({contentType:'text/css',body:css+'\n'+fs.readFileSync(sansDir+'/400.css','utf8').replaceAll('./files/','https://jingyue.uk/__qa_sans/')});}
  return route.fulfill({contentType:'application/json',body:JSON.stringify({ok:true,success:true,total:124,today:8,remaining:10,used:0,limit:10,isAdmin:false,authenticated:false})});
 });

 await page.addInitScript(()=>{
  const fill=CanvasRenderingContext2D.prototype.fillText;window.__shareInk=[];
  CanvasRenderingContext2D.prototype.fillText=function(text,...args){window.__shareInk.push(String(text));return fill.call(this,text,...args);};
  window.__shared=[];Object.defineProperty(navigator,'canShare',{value:({files})=>files?.length===1});
  Object.defineProperty(navigator,'share',{value:async({files})=>{const f=files[0],bytes=await f.arrayBuffer(),hash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(x=>x.toString(16).padStart(2,'0')).join('');window.__shared.push({name:f.name,size:f.size,type:f.type,hash});}});
 });
 await page.goto('https://jingyue.uk/',{waitUntil:'load'});
 await page.waitForFunction(()=>window.JYShareCard?.version==='3.1.0'&&document.querySelectorAll('[data-tool]').length>=10);
 async function ready(){await page.waitForFunction(()=>{const i=document.querySelector('#jysc-bd img');return i&&!i.hidden&&i.naturalWidth===2160;},null,{timeout:25000});}
 async function saveCard(name){const dl=page.waitForEvent('download');await page.locator('#jysc-dl').tap();const file=await dl;await file.saveAs(out+'/'+name+'.png');assert((await page.locator('#jysc-status').innerText()).includes('2160 × 2700'));}
 async function shareMatchesPreview(){const before=await page.evaluate(()=>__shared.length);await page.locator('#jysc-share').tap();await page.waitForFunction(n=>__shared.length===n+1,before);const result=await page.evaluate(async()=>{const b=await(await fetch(document.querySelector('#jysc-bd img').src)).arrayBuffer(),hash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',b))].map(x=>x.toString(16).padStart(2,'0')).join('');return {preview:hash,shared:__shared.at(-1)};});assert.equal(result.preview,result.shared.hash);assert.equal(result.shared.type,'image/png');return result.shared;}
 await page.evaluate(()=>{__shareInk=[];JYShareCard.open('invite',{});});await ready();
 const catalog=await page.evaluate(()=>({labels:JYMethodCatalog.map(m=>m[3]),ink:__shareInk,tiles:[...document.querySelectorAll('.at-tool strong')].map(x=>x.textContent)}));assert.deepEqual(catalog.labels,catalog.tiles);for(const s of catalog.labels)assert(catalog.ink.includes(s));
 await page.screenshot({path:out+'/01-mobile-invitation.png'});await saveCard('invitation-card');await shareMatchesPreview();await page.locator('#jysc-close').tap();assert.equal(await page.evaluate(()=>document.body.style.overflow),'');
 const checks=['10 invitation labels equal homepage catalogue','2160 × 2700 PNG download','native-share mock receives exact preview PNG'];
 for(const type of ['vedic','western']){
  const prefix=type==='vedic'?'vd':'wx',api=type==='vedic'?'JYVedicUI':'JYWesternUI',resultID=type==='vedic'?'vd-result-view':'wx-result',container=type+'-page';
  await page.locator('[data-tool="'+type+'"]').tap();await page.evaluate(({prefix,container})=>{document.getElementById(prefix+'-date').value='1983-08-25';document.getElementById(prefix+'-time').value='14:55';document.getElementById(prefix+'-reference').value='2026-09-14';document.getElementById(prefix+'-question').value='私密問題測試：我適合什麼工作？';document.getElementById(container).dataset.motion='still';},{prefix,container});
  await page.locator('#'+prefix+'-submit').tap();await page.locator('[data-'+(type==='vedic'?'vdr':'wxr')+'="skip"]').waitFor({state:'visible',timeout:30000});await page.locator('[data-'+(type==='vedic'?'vdr':'wxr')+'="skip"]').tap();await page.locator('#'+resultID).waitFor({state:'visible'});
  const original=await page.evaluate(api=>JSON.stringify(window[api].getChart()),api);
  await page.evaluate(()=>__shareInk=[]);await page.locator('[data-'+prefix+'-action="share"]').tap();await ready();assert.equal(await page.locator('#jysc-personal').isChecked(),false);assert.equal(await page.evaluate(id=>document.getElementById(id).inert,container),true);
  const ink=await page.evaluate(()=>__shareInk.join('\n'));assert(!ink.includes('1983-08-25'));assert(!ink.includes('私密問題測試'));assert(!ink.includes('14:55'));assert(ink.includes(type==='vedic'?'恆星黃道':'回歸黃道'));
  await saveCard(type+'-card');await page.locator('.jysc-box').evaluate(e=>e.scrollTop=0);await page.screenshot({path:out+'/02-mobile-'+type+'-share.png'});await shareMatchesPreview();
  await page.evaluate(()=>__shareInk=[]);await page.locator('#jysc-personal').check();await ready();const personal=await page.evaluate(()=>__shareInk.join('\n'));assert(personal.includes('1983-08-25'));assert(personal.includes('14:55'));assert(personal.includes('私密問題測試'));await saveCard(type+'-personal-card');
  await page.locator('#jysc-personal').uncheck();await ready();await page.keyboard.press('Escape');assert.equal(await page.locator('#jysc-bd').count(),0);assert.equal(await page.evaluate(id=>document.getElementById(id).inert,container),false);assert.equal(await page.evaluate(()=>document.body.style.overflow),'hidden');assert.equal(await page.evaluate(api=>JSON.stringify(window[api].getChart()),api),original);
  // Real touch scrolling still moves the underlying chart after the nested modal closes.
  await page.evaluate(id=>document.getElementById(id).scrollTop=500,container);const scrollBefore=await page.evaluate(id=>document.getElementById(id).scrollTop,container),cdp=await context.newCDPSession(page);
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:320,y:600}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:320,y:300}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.waitForTimeout(250);assert((await page.evaluate(id=>document.getElementById(id).scrollTop,container))>scrollBefore);
  const width=await page.evaluate(id=>{const x=document.getElementById(id);return{x:x.clientWidth,scroll:x.scrollWidth};},container);assert(width.scroll<=width.x+1);
  await page.locator('[data-'+prefix+'-action="edit"]').tap();await page.locator('#'+prefix+'-unknown').locator('..').tap();assert.equal(await page.locator('#'+prefix+'-unknown').isChecked(),true);await page.locator('#'+prefix+'-submit').tap();await page.locator('[data-'+(type==='vedic'?'vdr':'wxr')+'="skip"]').waitFor({timeout:30000});await page.locator('[data-'+(type==='vedic'?'vdr':'wxr')+'="skip"]').tap();await page.locator('#'+resultID).waitFor({state:'visible'});await page.evaluate(()=>__shareInk=[]);await page.locator('[data-'+prefix+'-action="share"]').tap();await ready();const unknown=await page.evaluate(()=>__shareInk.join('\n'));assert(unknown.includes('時間不詳'));assert(unknown.includes('中午'));await saveCard(type+'-unknown-card');await page.locator('#jysc-close').tap();await page.locator('[data-'+prefix+'-action="close"]').tap();assert.equal(await page.evaluate(()=>document.body.style.overflow),'');
  checks.push(type+': actual form, result share, hidden/visible personal data, unknown time, immutable snapshot, touch scroll restoration');
 }
 await page.setViewportSize({width:1440,height:1000});await page.evaluate(()=>JYShareCard.open('invite',{}));await ready();await page.screenshot({path:out+'/03-desktop-invitation.png'});await page.locator('#jysc-close').click();
 assert.deepEqual(errors,[]);const newMissing=missing.filter(p=>/share|catalog|vedic|western/.test(p)&&!p.startsWith('/img/share-bg'));assert.deepEqual(newMissing,[]);
 fs.writeFileSync(out+'/browser-report.json',JSON.stringify({ok:true,checks,errors,missing,shares:await page.evaluate(()=>__shared),viewport:'390 × 844 mobile / 1440 × 1000 desktop',nativeShare:'navigator.share is a recording mock; no external message was sent'},null,2));await browser.close();console.log('PASS Invitation and both native astrology sharing flows');
})().catch(e=>{console.error(e);process.exit(1);});
