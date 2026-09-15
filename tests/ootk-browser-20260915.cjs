'use strict';
// Local-file website, mobile Chromium, actual controls; unrelated APIs are stubbed.
// JY_QA_RUNTIME may point to a compatible extracted Chromium runtime.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),out=process.env.JY_OOTK_REVIEW,runtime=process.env.JY_QA_RUNTIME,fontDir=process.env.JY_QA_FONT_DIR;
(async()=>{
 assert(out,'Set JY_OOTK_REVIEW');fs.mkdirSync(out,{recursive:true});
 const pw=require(process.env.JY_PLAYWRIGHT_MODULE||process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright');
 let launch={headless:true};
 if(runtime){const {default:chrome}=await import(runtime+'/runtime-deps/node_modules/@sparticuz/chromium/build/index.js');launch={...launch,executablePath:runtime+'/browser-bin/chromium',args:chrome.args,env:{...process.env,LD_LIBRARY_PATH:runtime+'/browser-bin',FONTCONFIG_PATH:'/etc/fonts'}};}
 let browser;const checks=[];
 try{
  for(const [width,kind]of [[390,'skip'],[360,'automatic']]){
   browser=await pw.chromium.launch(launch);
   const context=await browser.newContext({viewport:{width,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true,serviceWorkers:'block',reducedMotion:'reduce'}),page=await context.newPage(),errors=[],missing=[];
   page.on('pageerror',e=>errors.push(String(e)));page.on('dialog',d=>d.dismiss());
   await context.route('**/*',async route=>{
    const url=new URL(route.request().url());
    if(fontDir&&url.pathname.startsWith('/__qa-fonts/'))return route.fulfill({path:path.join(fontDir,url.pathname.slice('/__qa-fonts/'.length))});
    if(url.hostname==='jingyue.uk'&&!url.pathname.startsWith('/api/')){
     const file=path.resolve(root,'.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));
     if(file.startsWith(root+'/')&&fs.existsSync(file)&&fs.statSync(file).isFile())return route.fulfill({path:file,headers:{'Cache-Control':'no-store'}});
     missing.push(url.pathname);return route.fulfill({status:404,body:''});
    }
    if(url.hostname==='fonts.googleapis.com')return route.fulfill({contentType:'text/css',body:''});
    return route.fulfill({contentType:'application/json',body:JSON.stringify({ok:true,success:true,total:124,today:8,remaining:10,used:0,limit:10,isAdmin:false,authenticated:false})});
   });
   await page.addInitScript(()=>{window.__copied=[];Object.defineProperty(navigator,'clipboard',{value:{writeText:async text=>__copied.push(text)}});});
   await page.goto('https://jingyue.uk/',{waitUntil:'load'});
   await page.waitForFunction(()=>window.JY_READING_QUALITY?.version==='4.1.0'&&typeof startOOTK==='function');
   if(fontDir){const css=fs.readFileSync(path.join(fontDir,'400.css'),'utf8').replaceAll('url(./files/','url(https://jingyue.uk/__qa-fonts/files/');await page.addStyleTag({content:css+' body,button,select,p,h1,h2,h3,b,strong,small,span,label{font-family:"Noto Serif TC",serif!important}'});await page.evaluate(()=>document.fonts.ready);}
   const question='公司認識的異性會跟我交往嗎？我該怎麼自然表達自己的需要？';
   // Use the public entry and its real picker; the form is supplied as a fixed test input.
   await page.evaluate(q=>{S.form={question:q,type:'love'};startOOTK();},question);
   await page.locator('.ootk-manual-sig[data-id="35"]').tap();await page.locator('#ootk-confirm').tap();
   assert.equal(await page.locator('#ootk-procedure-profile').inputValue(),'mathers_continuous');
   assert.equal(await page.locator('#ootk-validation-fields').isVisible(),false);
   await page.locator('#ootk-procedure-profile').selectOption('liber78_validation');assert(await page.locator('#ootk-validation-fields').isVisible());
   await page.locator('#ootk-procedure-profile').selectOption('mathers_continuous');
   await page.locator('#ootk-bind-direction').selectOption('left');
   await page.evaluate(()=>document.fonts.ready);await page.screenshot({path:out+'/'+kind+'-setup.png'});
   // Count real computations without changing random selection or result data.
   await page.evaluate(()=>{const run=window.ootkRunFull;window.__runs=0;window.ootkRunFull=function(...args){__runs++;return run(...args);};});
   await page.locator('#ootk-confirm').tap();
   const before=await page.evaluate(()=>JSON.stringify(S.tarot.ootkResults));
   assert.equal(JSON.parse(before).completedOperations,5);
   if(kind==='skip'){
    if(await page.locator('.jr-skip').isVisible())await page.locator('.jr-skip').tap();
    await page.locator('#ootk-fast-result').tap();
   }else{
    // Accelerate only presentation timers; computation was already completed above.
    await page.evaluate(()=>{const timer=window.setTimeout;window.setTimeout=(fn,ms,...args)=>timer(fn,ms>0&&ms<10000?Math.max(1,ms/20):ms,...args);});
    if(await page.locator('.jr-skip').isVisible())await page.locator('.jr-skip').tap();else await page.locator('#ootk-invoc-begin').tap();
   }
   await page.locator('.ootk-record').waitFor({state:'visible',timeout:90000});
   assert.equal(await page.locator('.ootk-record-row').count(),5);assert.equal(await page.locator('[data-record-state="retained"]').count(),5);
   assert.equal(await page.evaluate(()=>__runs),1);assert.equal(await page.evaluate(()=>JSON.stringify(S.tarot.ootkResults)),before);
   const prompt=await page.evaluate(()=>JY_buildExportPrompt('ootk'));assert(prompt.includes(question));assert(prompt.includes('Ace=5'));assert(prompt.includes('推薦須融入原問題最後的行動建議'));assert(!prompt.includes('本輪不能提供'));
   const resultBox=await page.locator('.ootk-record').boundingBox();assert(resultBox.width<=width);assert(resultBox.x>=0);
   await page.evaluate(()=>document.fonts.ready);await page.screenshot({path:out+'/'+kind+'-result.png'});
   assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);
   checks.push({viewport:width+'x844',kind,computations:1,operations:5,unchangedCast:true,promptCharacters:prompt.length,errors,missing});
   await browser.close();browser=null;
  }
  fs.writeFileSync(out+'/browser-results.json',JSON.stringify({ok:true,checks,externalAI:false,automaticTimers:'20x presentation only'},null,2));console.log(JSON.stringify(checks,null,2));
 }finally{if(browser)await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
