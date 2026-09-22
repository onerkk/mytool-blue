'use strict';
// Actual index and lazy loader; network requests served exclusively from checkout.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.GUA_CHROMIUM||undefined,args:['--no-sandbox','--disable-dev-shm-usage','--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader']});
 try{
  const p=await browser.newPage({viewport:{width:390,height:844},serviceWorkers:'block',reducedMotion:'reduce'}),errors=[];
  p.setDefaultTimeout(15000);p.on('pageerror',e=>errors.push(e.message));
  await p.route('**/*',async route=>{const u=new URL(route.request().url());if(u.origin!=='https://jingyue.uk')return route.abort();const file=path.resolve(root,'.'+decodeURIComponent(u.pathname==='/'?'/index.html':u.pathname));if(!file.startsWith(root+path.sep))return route.abort();if(!fs.existsSync(file))return route.fulfill({status:404,body:''});await route.fulfill({path:file});});
  await p.goto('https://jingyue.uk/',{waitUntil:'load'});
  await p.evaluate(()=>JYVedicUI.open());await p.locator('#vd-form-view').waitFor({state:'visible'});
  await p.evaluate(()=>{for(const [id,value]of Object.entries({'vd-date':'1983-08-25','vd-time':'14:55','vd-reference':'2026-09-22','vd-uncertainty':'0','vd-question':'工作機會如何？'}))document.getElementById(id).value=value;});
  await p.locator('#vd-submit').click();await p.waitForFunction(()=>JYVedicUI.getChart()?.specialRules?.checks.length>0);
  const open=p.locator('[data-vdr=open]');await open.waitFor({state:'visible'});await open.click();await p.locator('#vd-result-view').waitFor({state:'visible'});
  await p.locator('[data-vd-tab=planets]').click();assert(await p.locator('.vd-yoga').count()>0);
  await p.locator('.vd-yoga').last().locator('summary').click();assert(!(await p.locator('#vd-yogas').innerText()).match(/undefined|NaN|\[object Object\]/));
  assert(await p.evaluate(()=>JYVedicUI.getPrompt().includes('specialRules')));
  assert(await p.locator('#vd-pane-planets').evaluate(e=>e.scrollWidth<=e.clientWidth+2));
  if(process.env.JY_RULE_SCREENSHOT){await p.locator('.vd-yoga').last().scrollIntoViewIfNeeded();await p.screenshot({path:process.env.JY_RULE_SCREENSHOT});}
  await p.evaluate(()=>JYVedicUI.close());await p.evaluate(()=>JYGuaRoom.open('liuyao'));
  const room=p.locator('#liuyao-screen');await room.locator('textarea').first().fill('月底前能找到工作嗎？');await room.locator('[data-mode=manual]').click();
  for(const [i,v] of [9,7,9,6,7,6].entries())await room.locator('[data-manual="'+i+'"]').selectOption(String(v));
  await room.locator('[data-action=start]').click();await room.locator('.gw-result').waitFor();await room.locator('summary').filter({hasText:'取用、特殊條件與時間線索'}).click();
  assert((await room.innerText()).includes('期限內可留意的日期'));assert(await room.evaluate(e=>e.scrollWidth<=e.clientWidth+1));
  const data=await p.evaluate(()=>JYGuaRoom.snapshot('liuyao').result);assert.equal(data.interpretation.timing.status,'bounded');
  assert.deepEqual(errors,[]);console.log('PASS actual lazy-loaded Jyotisha special rules, chart renderer, prompt and mobile Sixyao condition panel');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
