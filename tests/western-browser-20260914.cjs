'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..'),runtimeOut=process.env.JY_QA_RUNTIME,out=process.env.JY_WESTERN_REVIEW||path.join(root,'review/western-20260914'),sansDir=process.env.JY_QA_SANS;
(async()=>{
 fs.mkdirSync(out,{recursive:true});
 const pw=require(process.env.JY_PLAYWRIGHT_MODULE||(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright':'playwright'));
 let launch={headless:true};if(runtimeOut){const {default:chrome}=await import(runtimeOut+'/runtime-deps/node_modules/@sparticuz/chromium/build/index.js');const base=runtimeOut+'/browser-bin';launch={...launch,executablePath:base+'/chromium',args:chrome.args,env:{...process.env,LD_LIBRARY_PATH:base,FONTCONFIG_PATH:'/etc/fonts'}};}
 if(process.env.JY_CHROMIUM)launch={headless:true,executablePath:process.env.JY_CHROMIUM,args:['--no-sandbox','--disable-dev-shm-usage','--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader']};
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
 await page.addInitScript(()=>{window.__copied=[];Object.defineProperty(navigator,'clipboard',{value:{writeText:async text=>{window.__copied.push(text)}}});});
 await page.goto('https://jingyue.uk/',{waitUntil:'load'});
 await page.waitForFunction(()=>typeof _westernOpen==='function'&&document.querySelector('[data-tool="western"]'));
 await page.locator('[data-tool="western"]').tap();await page.waitForSelector('#western-page',{state:'visible'});await page.evaluate(()=>document.fonts.ready);await page.screenshot({path:out+'/01-mobile-entry.png'});
 await page.locator('[data-wx-pick="wx-date"]').tap();await page.locator('[data-year-input]').fill('1983');await page.locator('[data-pick="months"]').tap();await page.locator('[data-month="8"]').tap();await page.locator('[data-day="25"]').tap();await page.locator('[data-pick="save"]').tap();
 await page.locator('[data-wx-pick="wx-time"]').tap();await page.locator('[data-hour-input]').fill('14');await page.locator('[data-minute-input]').fill('55');await page.screenshot({path:out+'/02-mobile-time-picker.png'});await page.locator('[data-pick="save"]').tap();
 await page.locator('[data-wx-action="city"]').tap();await page.locator('#wx-city-search').fill('台南');assert.equal(await page.locator('[data-city]').count(),2);await page.screenshot({path:out+'/03-mobile-city.png'});await page.locator('[data-city="4"]').tap();assert.equal(await page.locator('#wx-city-name').innerText(),'台南');
 await page.locator('#wx-question').fill('我適合什麼工作方式？今年如何安排轉職？');await page.evaluate(()=>document.getElementById('wx-reference').value='2026-09-14');await page.locator('#wx-submit').tap();
 await page.waitForSelector('#wx-ceremony',{timeout:30000});await page.waitForFunction(()=>document.querySelector('#wx-ceremony').dataset.renderer!=='loading',null,{timeout:45000});
 const filmDir=path.join(out,'frames');fs.mkdirSync(filmDir,{recursive:true});const filmCDP=await context.newCDPSession(page),frames=[];
 filmCDP.on('Page.screencastFrame',async e=>{const name=String(frames.length).padStart(5,'0')+'.jpg';frames.push({name,time:e.metadata.timestamp});fs.writeFileSync(path.join(filmDir,name),Buffer.from(e.data,'base64'));await filmCDP.send('Page.screencastFrameAck',{sessionId:e.sessionId});});
 await filmCDP.send('Page.startScreencast',{format:'jpeg',quality:82,maxWidth:390,maxHeight:844,everyNthFrame:1});
 const renderer=await page.locator('#wx-ceremony').getAttribute('data-renderer');assert.equal(renderer,'webgl');const original=await page.evaluate(()=>JSON.stringify(JYWesternUI.getChart()));
 await page.waitForFunction(()=>JYWesternRitual.getSceneState()?.progress>.48,null,{timeout:30000});await page.screenshot({path:out+'/04-mobile-iris.png'});
 await page.waitForFunction(()=>!document.querySelector('[data-wxr="open"]').disabled,null,{timeout:35000});await page.screenshot({path:out+'/05-mobile-instrument.png'});const scene=await page.evaluate(()=>JYWesternRitual.getSceneState());assert.equal(scene.irisLeaves,8);assert.equal(scene.planetJewels,10);assert.equal(scene.zodiacPlaques,12);
 await filmCDP.send('Page.stopScreencast');fs.writeFileSync(out+'/film.json',JSON.stringify(frames));
 const cdp=await context.newCDPSession(page);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:155,y:400}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:240,y:405}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.waitForTimeout(500);assert(Math.abs((await page.evaluate(()=>JYWesternRitual.getSceneState())).turn)>.01);
 await page.locator('[data-wxr="open"]').tap();await page.waitForSelector('#wx-result',{state:'visible'});assert.equal(await page.evaluate(()=>JSON.stringify(JYWesternUI.getChart())),original);await page.screenshot({path:out+'/06-mobile-chart.png'});
 for(const k of ['planets','timing','reading']){await page.locator('[data-wx-tab="'+k+'"]').tap();await page.waitForTimeout(370);assert.equal(await page.locator('#wx-panel-'+k).isVisible(),true);await page.screenshot({path:out+'/07-mobile-'+k+'.png'});}
 await page.locator('[data-wx-action="copy"]').tap();assert((await page.evaluate(()=>__copied.at(-1))).includes('我適合什麼工作方式'));assert.equal(await page.evaluate(()=>__copied.at(-1)),await page.evaluate(()=>JYWesternUI.getPrompt()));
 await page.locator('[data-wx-tab="chart"]').tap();await page.locator('#wx-panel-chart svg [data-wx-planet="Venus"]').tap();assert.equal(await page.evaluate(()=>JYWesternUI.getState().planet),'Venus');await page.locator('[data-wx-house="7"]').tap();assert.equal(await page.evaluate(()=>JYWesternUI.getState().house),7);
 await page.evaluate(()=>{const x=document.getElementById('western-page');x.scrollTop=x.scrollHeight;});const scroll=await page.evaluate(()=>document.getElementById('western-page').scrollTop);assert(scroll>300);
 await page.locator('[data-wx-action="replay"]').tap();await page.waitForSelector('#wx-ceremony');await page.locator('[data-wxr="skip"]').tap();assert.equal(await page.locator('#wx-result').isVisible(),true);assert.equal(await page.evaluate(()=>JSON.stringify(JYWesternUI.getChart())),original);
 await page.locator('[data-wx-action="replay"]').tap();await page.waitForSelector('#wx-ceremony');await page.keyboard.press('Escape');assert.equal(await page.locator('#wx-ceremony').count(),0);assert.equal(await page.evaluate(()=>JSON.stringify(JYWesternUI.getChart())),original);
 await page.locator('[data-wx-action="replay"]').tap();await page.waitForFunction(()=>document.querySelector('#wx-ceremony')?.dataset.renderer==='webgl');await page.evaluate(()=>{const c=document.querySelector('#wx-ceremony canvas');c.dispatchEvent(new Event('webglcontextlost',{cancelable:true}));});await page.waitForSelector('#wx-ceremony[data-renderer="fallback"]');await page.waitForFunction(()=>!document.querySelector('[data-wxr="open"]').disabled);await page.locator('[data-wxr="open"]').tap();
 await page.locator('[data-wx-action="edit"]').tap();await page.locator('#wx-unknown').check();await page.locator('[data-wx-action="motion"]').tap();await page.locator('#wx-submit').tap();await page.waitForSelector('#wx-ceremony[data-renderer="fallback"]');await page.waitForFunction(()=>!document.querySelector('[data-wxr="open"]').disabled);await page.locator('[data-wxr="open"]').tap();assert.equal(await page.evaluate(()=>JYWesternUI.getChart().houses),null);assert.equal(await page.locator('#wx-panel-chart [data-wx-house]').count(),0);
 const overflow=await page.evaluate(()=>{const p=document.getElementById('western-page');return {client:p.clientWidth,scroll:p.scrollWidth};});assert(overflow.scroll<=overflow.client+1);
 await page.locator('[data-wx-action="close"]').tap();assert.equal(await page.evaluate(()=>document.body.style.overflow),'');assert.equal(await page.locator('#western-page').isVisible(),false);
 await page.locator('[data-tool="vedic"]').tap();const cities=await page.locator('#vd-city').innerText();assert(cities.includes('台南'));assert(!cities.includes('新營'));await page.locator('[data-vd-action="close"]').tap();
 await page.setViewportSize({width:1440,height:1000});await page.evaluate(()=>JYWesternUI.open());await page.locator('[data-wx-action="edit"]').tap();await page.locator('#wx-unknown').uncheck();await page.locator('#wx-submit').click();await page.waitForSelector('#wx-ceremony');await page.locator('[data-wxr="skip"]').click();await page.waitForSelector('#wx-result',{state:'visible'});await page.screenshot({path:out+'/08-desktop-chart.png'});
 const newMissing=missing.filter(x=>/western|astro-time/.test(x));assert.deepEqual(newMissing,[]);assert.deepEqual(errors,[]);
 fs.writeFileSync(out+'/browser-report.json',JSON.stringify({ok:true,renderer,scene,overflow,errors,missing,checks:['custom date/time picker','searchable city','WebGL iris chronology','touch rotate','same snapshot through animation and export','four tabs','copy prompt','SVG interaction','scroll recovery','skip/cancel lifecycle','reduced motion','WebGL context-loss fallback','unknown clock','Vedic cities','desktop']},null,2));
 await browser.close();console.log('PASS Western desktop and mobile browser flows');
})().catch(e=>{console.error(e);process.exit(1);});
