'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..'),runtimeOut=process.env.JY_QA_RUNTIME,out=process.env.JY_VEDIC_REVIEW||path.join(root,'review/vedic-design-20260914'),sansDir=process.env.JY_QA_SANS;
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
 await page.addInitScript(()=>{window.__copied=[];Object.defineProperty(navigator,'clipboard',{value:{writeText:async text=>{window.__copied.push(text)}}});});
 await page.goto('https://jingyue.uk/',{waitUntil:'load'});
 await page.waitForFunction(()=>typeof _vedicOpen==='function'&&document.querySelector('[data-tool="vedic"]'));
 await page.locator('[data-tool="vedic"]').tap();await page.waitForSelector('#vedic-page',{state:'visible'});

 await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(380);await page.screenshot({path:out+'/01-mobile-form.png'});

 await page.evaluate(()=>{document.getElementById('vd-date').value='1983-08-25';document.getElementById('vd-time').value='14:55';document.getElementById('vd-reference').value='2026-09-14';});
 await page.locator('#vd-city').selectOption('5');await page.locator('#vd-question').fill('我適合什麼工作方向？');
 await page.locator('#vd-submit').tap();await page.waitForSelector('#vd-ceremony',{timeout:30000});
 await page.waitForFunction(()=>document.querySelector('#vd-ceremony').dataset.renderer==='webgl',null,{timeout:45000});
 const native=await page.evaluate(()=>JSON.stringify(JYVedicUI.getChart()));
 const cdp=await context.newCDPSession(page),framesDir=path.join(out,'film-frames');fs.mkdirSync(framesDir,{recursive:true});const film=[];
 cdp.on('Page.screencastFrame',async e=>{const n=film.length,name=String(n).padStart(5,'0')+'.jpg';film.push({name,time:e.metadata.timestamp});fs.writeFileSync(path.join(framesDir,name),Buffer.from(e.data,'base64'));await cdp.send('Page.screencastFrameAck',{sessionId:e.sessionId});});
 await cdp.send('Page.startScreencast',{format:'jpeg',quality:83,maxWidth:390,maxHeight:844,everyNthFrame:1});
 await page.evaluate(()=>{window.__palaceSamples=[];window.__palaceInterval=setInterval(()=>{const d=JYVedicRitual.getSceneState();if(d)__palaceSamples.push({at:Date.now()/1000,...d});},100);});
 await page.waitForFunction(()=>document.querySelector('[data-vdr=open]').disabled===false,null,{timeout:45000});await page.waitForTimeout(450);
 const states=await page.evaluate(()=>window.__palaceSamples);assert.equal(states.at(-1).houseTiles,12);assert.equal(states.at(-1).orbitBands,3);assert(states.at(-1).reflection);assert(states.at(-1).camera[0]>2);
 await page.screenshot({path:out+'/06-ready.png'});
 const dragBefore=states.at(-1).turn;
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:160,y:420}]});
 for(let i=1;i<=15;i++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:160+i*8,y:420}]});await page.waitForTimeout(35);}
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.waitForTimeout(450);
 const dragAfter=await page.evaluate(()=>JYVedicRitual.getSceneState().turn);assert(dragAfter>dragBefore+.1,'real touch rotates the room');
 await page.screenshot({path:out+'/07-drag.png'});await page.waitForTimeout(500);await cdp.send('Page.stopScreencast');
 await page.evaluate(()=>clearInterval(window.__palaceInterval));
 fs.writeFileSync(out+'/film-timing.json',JSON.stringify(film,null,2));
 for(const [p,name]of [[.04,'02-gates'],[.36,'03-lift'],[.60,'04-orbits'],[.88,'05-reveal']]){const state=states.reduce((a,b)=>Math.abs(a.progress-p)<Math.abs(b.progress-p)?a:b);const f=film.reduce((a,b)=>Math.abs(a.time-state.at)<Math.abs(b.time-state.at)?a:b);fs.copyFileSync(path.join(framesDir,f.name),out+'/'+name+'.jpg');}

 await page.locator('[data-vdr=open]').tap();await page.waitForSelector('#vd-result-view',{state:'visible'});await page.waitForTimeout(450);await page.screenshot({path:out+'/08-result.png'});
 assert.equal(await page.evaluate(()=>JSON.stringify(JYVedicUI.getChart())),native);
 await page.locator('#vd-chart').scrollIntoViewIfNeeded();await page.screenshot({path:out+'/09-kundali.png'});
 for(const [tab,file]of [['planets','10-grahas'],['dasha','11-dasha'],['reading','12-reading']]){await page.locator('[data-vd-tab="'+tab+'"]').tap();await page.waitForTimeout(450);await page.screenshot({path:out+'/'+file+'.png'});}
 await page.evaluate(()=>document.getElementById('vedic-page').scrollTop=0);await page.locator('[data-vd-action=replay]').tap();await page.waitForSelector('#vd-ceremony');await page.locator('[data-vdr=cancel]').tap();assert.equal(await page.evaluate(()=>JYVedicUI.getState().busy),false);assert.equal(await page.evaluate(()=>JSON.stringify(JYVedicUI.getChart())),native);
 await page.locator('[data-vd-tab=chart]').tap();await page.setViewportSize({width:1440,height:1000});await page.evaluate(()=>document.getElementById('vedic-page').scrollTop=0);await page.waitForTimeout(450);await page.screenshot({path:out+'/13-desktop.png'});
 const report={renderer:await page.evaluate(()=>!!JYVedicScene),states,dragBefore,dragAfter,filmFrames:film.length,filmSeconds:film.at(-1).time-film[0].time,errors,missing:[...new Set(missing)]};fs.writeFileSync(out+'/palace-browser.json',JSON.stringify(report,null,2));console.log(JSON.stringify({...report,states:states.filter((_,i)=>i%20===0)}));assert.deepEqual(errors,[]);await browser.close();
})().catch(e=>{console.error(e.stack);process.exitCode=1;setTimeout(()=>process.exit(1),200);});
