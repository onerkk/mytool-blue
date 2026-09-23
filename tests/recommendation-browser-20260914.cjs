'use strict';
// Mobile Chromium: actual entry, native chart, clipboard and JSON download.
// Unrelated network services are mocked; no messages are sent to an AI provider.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),runtime=process.env.JY_QA_RUNTIME,out=process.env.JY_RECOMMEND_REVIEW;
(async()=>{
 assert(out,'Set JY_RECOMMEND_REVIEW');fs.mkdirSync(out,{recursive:true});
 const pw=require(process.env.JY_PLAYWRIGHT_MODULE||process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright');
 let launch={headless:true};
 if(runtime){const {default:chrome}=await import(runtime+'/runtime-deps/node_modules/@sparticuz/chromium/build/index.js');launch={...launch,executablePath:runtime+'/browser-bin/chromium',args:chrome.args,env:{...process.env,LD_LIBRARY_PATH:runtime+'/browser-bin',FONTCONFIG_PATH:'/etc/fonts'}};}
 const browser=await pw.chromium.launch(launch);
 try{
  const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true,serviceWorkers:'block'}),page=await context.newPage(),errors=[],missing=[],checks=[];
  page.on('pageerror',e=>errors.push(String(e)));page.on('dialog',d=>d.dismiss());
  await context.route('**/*',async route=>{
   const url=new URL(route.request().url());
   if(url.hostname==='jingyue.uk'&&!url.pathname.startsWith('/api/')){
    const file=path.resolve(root,'.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));
    if(file.startsWith(root+'/')&&fs.existsSync(file)&&fs.statSync(file).isFile())return route.fulfill({path:file,headers:{'Cache-Control':'no-store'}});
    missing.push(url.pathname);return route.fulfill({status:404,body:''});
   }
   if(url.hostname==='fonts.googleapis.com')return route.fulfill({contentType:'text/css',body:''});
   return route.fulfill({contentType:'application/json',body:JSON.stringify({ok:true,success:true,total:124,today:8,remaining:10,used:0,limit:10,isAdmin:false,authenticated:false})});
  });
  await page.addInitScript(()=>{window.__copied=[];Object.defineProperty(navigator,'clipboard',{value:{writeText:async text=>{window.__copied.push(text);}}});});
  await page.goto('https://jingyue.uk/',{waitUntil:'load'});
  await page.waitForFunction(()=>window.JY_READING_QUALITY?.version==='4.4.0');
  const question='我經營水晶、天鐵與龍宮舍利，應如何安排銷售方向？我偏好綠色、日常常碰撞手腕。';
  for(const type of ['vedic','western']){
   const prefix=type==='vedic'?'vd':'wx',api=type==='vedic'?'JYVedicUI':'JYWesternUI',container=type+'-page';
   await page.locator('[data-tool="'+type+'"]').tap();
   await page.evaluate(({prefix,container,question})=>{
    for(const [id,v]of [['date','1983-08-25'],['time','14:55'],['reference','2026-09-14'],['question',question],['topic','wealth']])document.getElementById(prefix+'-'+id).value=v;
    document.getElementById(container).dataset.motion='still';
   },{prefix,container,question});
   await page.locator('#'+prefix+'-submit').tap();
   const skip=page.locator('[data-'+(type==='vedic'?'vdr':'wxr')+'="skip"]');await skip.waitFor({state:'visible',timeout:30000});await skip.tap();
   await page.locator('#'+(type==='vedic'?'vd-result-view':'wx-result')).waitFor({state:'visible'});
   const before=await page.evaluate(api=>JSON.stringify(window[api].getChart()),api);
   await page.locator('[data-'+prefix+'-tab="reading"]').tap();
   await page.locator('[data-'+prefix+'-action="copy"]').tap();
   const prompt=await page.evaluate(()=>__copied.at(-1));
   assert(prompt.includes(question));assert(prompt.includes('本題延伸手鍊建議'));
   assert(prompt.includes('理由須引用本次一項有效盤面發現'));assert(prompt.includes('印度占星：先核本題宮主職能及有效分盤、運期')||prompt.includes('西洋占星：依本題宮主、相位或已算行運取材'));
   assert(prompt.includes('手鍊建議放在分析與行動之後'));assert(prompt.includes('不捏造商品庫存、價格、成分、產地或認證'));
   assert.equal(prompt.split('https://shopee.tw/a50h95648d?tab=shop').length-1,1);assert(prompt.endsWith('願你諸事順遂。'));
   assert.equal(prompt,await page.evaluate(api=>window[api].getPrompt(),api));
   const event=page.waitForEvent('download');await page.locator('[data-'+prefix+'-action="download"]').tap();
   const download=await event,file=out+'/'+type+'-download.json';await download.saveAs(file);
   const saved=JSON.parse(fs.readFileSync(file,'utf8'));assert.equal(saved.prompt,prompt);assert.equal(saved.question,question);assert.equal(saved.topic,'wealth');assert.equal(JSON.stringify(saved.chart),before);
   assert.equal(await page.evaluate(api=>JSON.stringify(window[api].getChart()),api),before);
   const width=await page.evaluate(id=>{const el=document.getElementById(id);return [el.clientWidth,el.scrollWidth];},container);assert(width[1]<=width[0]+1);
   checks.push({type,clipboardMatches:true,downloadMatches:true,nativeChartUnchanged:true,promptCharacters:prompt.length});
   await page.evaluate(api=>window[api].close(),api);assert.equal(await page.evaluate(()=>document.body.style.overflow),'');
  }
  assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);
  fs.writeFileSync(out+'/browser-results.json',JSON.stringify({ok:true,viewport:'390x844',browser:'Chromium emulated mobile',checks,errors,missing,externalAI:false},null,2));
  console.log(JSON.stringify(checks,null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
