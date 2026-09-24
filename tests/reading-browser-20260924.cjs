'use strict';
// Public-page Chromium smoke test: real form, engines, clipboard and download.
// Only the clipboard and visit counter are mocked; no external model is called.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.JY_CHROMIUM||undefined,args:['--no-sandbox','--disable-dev-shm-usage','--enable-unsafe-swiftshader']});
 try{
  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,serviceWorkers:'block',reducedMotion:'reduce'});
  const page=await context.newPage(),errors=[],missing=[],paid=[];
  await page.clock.setFixedTime(new Date('2026-09-24T04:50:03.960Z'));
  page.on('pageerror',e=>errors.push(e.message));
  page.on('request',r=>{if(/jy-ai-proxy|\/api\/(?:ai|classify|pricing)/.test(r.url()))paid.push(r.url());});
  await context.route('**/*',async route=>{
   const u=new URL(route.request().url());
   if(u.origin==='https://jingyue.uk'&&u.pathname==='/api/pulse')return route.fulfill({contentType:'application/json',body:JSON.stringify({ok:true,total:124,today:8})});
   if(u.origin!=='https://jingyue.uk')return route.abort();
   const file=path.resolve(root,'.'+decodeURIComponent(u.pathname==='/'?'/index.html':u.pathname));
   if(!file.startsWith(root+path.sep)||!fs.existsSync(file)){missing.push(u.pathname);return route.fulfill({status:404,body:''});}
   return route.fulfill({path:file,headers:{'Cache-Control':'no-store'}});
  });
  await page.addInitScript(()=>{window.__copied=[];Object.defineProperty(navigator,'clipboard',{value:{writeText:async text=>window.__copied.push(text)}});});
  await page.goto('https://jingyue.uk/',{waitUntil:'load'});
  await page.waitForFunction(()=>window.BaziSuiteUI&&window.JY_READING_QUALITY?.readingVersion==='7.0.0');
  await page.evaluate(()=>BaziSuiteUI.open('compat'));
  await page.waitForFunction(()=>document.getElementById('a-city')?.options.length>2);
  await page.locator('#bzs-screen .jc-all').tap();
  await page.evaluate(()=>{
   for(const [prefix,date,time,gender,city]of [['a','1983-08-25','14:55','male','台南'],['b','1994-06-20','12:00','female','彰化']]){
    for(const [key,value]of [['date',date],['time',time],['gender',gender],['boundary','MIDNIGHT_00']])document.getElementById(prefix+'-'+key).value=value;
    const country=document.getElementById(prefix+'-country');country.value='TW';country.dispatchEvent(new Event('change',{bubbles:true}));
    const location=document.getElementById(prefix+'-city'),option=Array.from(location.options).find(o=>o.textContent.includes(city));
    if(!option)throw Error('Missing city '+city);location.value=option.value;location.dispatchEvent(new Event('change',{bubbles:true}));
   }
   document.getElementById('c-question').value='我與現任這段關係目前的結構性挑戰是什麼';
  });
  await page.locator('[data-act="cast-compat"]').tap();
  await page.locator('.jr-skip').waitFor({state:'visible',timeout:60000});await page.locator('.jr-skip').tap();
  await page.waitForFunction(()=>BaziSuiteUI.getState().exportData?.kind==='bazi-ziwei-compatibility');
  const original=await page.evaluate(()=>JSON.stringify(BaziSuiteUI.getState().exportData));
  await page.locator('#bzs-screen [data-act="copy"]').tap();
  const prompt=await page.evaluate(()=>__copied.at(-1)),data=JSON.parse(original);
  assert.equal(prompt,data.prompt);assert.equal(data.ziwei.timeline.length,1);
  assert(prompt.includes('日柱丁丑、時柱丙午'));assert(prompt.includes('日支作用：酉丑半合金'));
  assert(prompt.includes('B 甲干 廉貞化祿→A 遷移(未)'));assert(prompt.includes('B 丙干 廉貞化忌→A 遷移(未)'));
  assert(prompt.includes('每段先說'));assert(!prompt.includes('114–123歲'));
  assert.equal(prompt.split('https://shopee.tw/a50h95648d?tab=shop').length-1,1);assert(prompt.endsWith('願你諸事順遂。'));
  const wait=page.waitForEvent('download');await page.locator('#bzs-screen [data-act="download-json"]').tap();const download=await wait;
  const stream=await download.createReadStream(),chunks=[];for await(const chunk of stream)chunks.push(chunk);
  const downloaded=JSON.parse(Buffer.concat(chunks).toString('utf8'));assert.deepEqual(downloaded,data);
  assert.equal(await page.evaluate(()=>JSON.stringify(BaziSuiteUI.getState().exportData)),original);
  assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);assert.deepEqual(paid,[]);
  console.log(JSON.stringify({passed:true,viewport:'390x844',case:'1983-08-25 14:55 / 1994-06-20 12:00',promptCharacters:prompt.length,clipboardMatches:true,downloadMatches:true,natalUnchanged:true,paidAIRequests:0}));
  await context.close();
 }finally{await browser.close();}
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
