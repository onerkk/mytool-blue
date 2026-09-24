'use strict';
// Public optional feedback page. No paid API, model generation or storage.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('playwright'),fixture=require('./fixtures/reading-cases-20260924.json');
const root=path.resolve(__dirname,'..');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.JY_CHROMIUM||undefined,args:['--no-sandbox','--disable-dev-shm-usage','--enable-unsafe-swiftshader']});
 try{
  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,serviceWorkers:'block'}),page=await context.newPage();
  const errors=[],unexpected=[];page.on('pageerror',e=>errors.push(e.message));
  await context.route('**/*',async route=>{
   const u=new URL(route.request().url());
   if(u.origin!=='https://jingyue.uk'||!['/reading-review.html','/JS/reading-workflow.js','/JS/reading-review-ui.js'].includes(u.pathname)){unexpected.push(u.href);return route.abort();}
   return route.fulfill({path:path.join(root,u.pathname),headers:{'Cache-Control':'no-store'}});
  });
  await page.addInitScript(()=>Object.defineProperty(navigator,'clipboard',{value:{writeText:async text=>{window.__copied=text;}}}));
  await page.goto('https://jingyue.uk/reading-review.html',{waitUntil:'load'});
  await page.waitForFunction(()=>document.querySelectorAll('#method option').length===14);
  await page.selectOption('#method','lenormand');await page.fill('#question',fixture.question);await page.fill('#answer',fixture.bad);
  await page.click('#check');assert((await page.locator('#issues li').count())>=8);assert((await page.locator('#scope').innerText()).includes('沒有自動判定命理主判正確'));
  await page.click('#repair-button');assert((await page.locator('#status').innerText()).includes('原始提示詞'));
  const original='本次五張線：鑰匙→鳥→騎士→雲→紳士。第3張為中心；紳士代表問卜者。\n完整主線優先，鏡像1↔5、2↔4。';
  await page.fill('#source',original);await page.click('#check');await page.click('#repair-button');
  const repaired=await page.locator('#repair').inputValue();assert(repaired.includes(original));assert(repaired.includes('SYMBOL_AS_CLINICAL_EVIDENCE'));assert(repaired.endsWith('願你諸事順遂。'));
  await page.click('#copy');assert.equal(await page.evaluate(()=>window.__copied),repaired);
  await page.fill('#answer',fixture.good);assert(await page.locator('#result').isHidden());assert(await page.locator('#repair-panel').isHidden());
  await page.click('#check');assert.equal(await page.locator('#issues li').count(),0);assert((await page.locator('#scope').innerText()).includes('沒有自動判定命理主判正確'));
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth));
  if(process.env.JY_REVIEW_SCREENSHOT)await page.screenshot({path:process.env.JY_REVIEW_SCREENSHOT,fullPage:true});
  await page.fill('#answer','<img src="https://invalid.example/x" onerror="window.__xss=true">');await page.click('#check');
  assert.equal(await page.evaluate(()=>window.__xss),undefined);await page.click('#clear');
  for(const id of ['question','answer','source'])assert.equal(await page.locator('#'+id).inputValue(),'');
  assert.deepEqual(errors,[]);assert.deepEqual(unexpected,[]);assert.equal(await page.evaluate(()=>localStorage.length+sessionStorage.length),0);
  console.log(JSON.stringify({passed:true,viewport:'390x844',methods:14,badCaseDetected:true,goodCaseNotCertified:true,originalFactsPreserved:true,copyMatches:true,networkRequests:0,persistedInputs:0}));
  await context.close();
 }finally{await browser.close();}
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
