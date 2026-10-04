'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright':'playwright');
const root=path.resolve(__dirname,'..'),results=[],types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.woff2':'font/woff2','.mp3':'audio/mpeg'};
(async()=>{
 for(const width of [390,1280]){
  const browser=await chromium.launch({executablePath:process.env.JY_CHROMIUM,args:['--no-sandbox','--disable-dev-shm-usage','--no-zygote','--single-process','--in-process-gpu','--disable-crash-reporter','--enable-unsafe-swiftshader']});
  try{
   const context=await browser.newContext({viewport:{width,height:900},serviceWorkers:'block',reducedMotion:'reduce',acceptDownloads:true}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.dismiss());
   await page.route('**/*',async route=>{const url=new URL(route.request().url());if(url.origin!=='https://jingyue.uk')return route.abort();if(url.pathname.startsWith('/api/'))return route.fulfill({contentType:'application/json',body:JSON.stringify({ok:true,total:1,remaining:10,isAdmin:false})});const file=path.resolve(root,'.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));if(!file.startsWith(root+'/'))return route.abort();try{return route.fulfill({body:fs.readFileSync(file),contentType:types[path.extname(file)]||'application/octet-stream'});}catch(e){return route.fulfill({status:404,body:''});}});
   await page.addInitScript(()=>{window.__nativeCopied='';Object.defineProperty(navigator,'clipboard',{value:{writeText:async text=>{window.__nativeCopied=text;}}});});
   await page.goto('https://jingyue.uk/',{waitUntil:'load'});await page.evaluate(()=>{_ziweiStandaloneOpen();_zwSetGender('female');});await page.waitForFunction(()=>typeof computeZiwei==='function');
   await page.evaluate(()=>{document.getElementById('zw-bd').value='2024-02-09';document.getElementById('zw-hh').value='14';document.getElementById('zw-exact-time').value='14:55';document.getElementById('zw-q').value='中州安星，分析目前的運限與逐月分界';});
   await page.locator('#zw-input .jc-continue').click();
   for(const [id,value]of [['algorithm','zhongzhou'],['year-divide','exact'],['horoscope-divide','exact'],['age-divide','birthday']])await page.locator('#zw-'+id).selectOption(value);
   await page.locator('[onclick="_ziweiSubmit()"]').click();await page.locator('.jr-skip').click();const section=page.locator('.jy-native-analysis:visible').last();await section.waitFor();
   const pending=page.waitForEvent('download');await section.locator('[data-jna-download]').click();const download=await pending,saved=JSON.parse(fs.readFileSync(await download.path(),'utf8'));
   assert.equal(saved.engineVersion,'20261004-flow15');assert.equal(saved.yGan+saved.yZhi,'甲辰');assert.equal(saved.calculationPolicy.algorithm,'zhongzhou');assert.equal(saved.calculationPolicy.yearDivide,'exact');assert.equal(saved.calculationPolicy.horoscopeDivide,'exact');assert.equal(saved.calculationPolicy.ageDivide,'birthday');
   assert.equal(saved.nativeAnalysis.schoolCompletion.status,'calculated');assert.equal(saved.nativeAnalysis.currentMinor.age,saved.currentAge);assert(saved.nativeAnalysis.layers.months.some(m=>m.segments.length>1));assert(saved.palaces.some(p=>p.name==='疾厄'&&p.stars.some(s=>s.name==='天傷')));assert(saved.palaces.some(p=>p.name==='交友'&&p.stars.some(s=>s.name==='天使')));
   const prompt=await page.evaluate(()=>{_zwCopy();return window.__nativeCopied;});assert(prompt.includes('中州安星'));assert(prompt.includes('立春交節瞬間'));assert(prompt.includes('農曆生日當日增歲'));assert(!prompt.includes('本地尚未實作中州'));assert(prompt.includes('【流月完整分段】'));assert(!/NaN|undefined|\[object Object\]/.test(prompt));
   const intervals=prompt.split('【流月完整分段】')[1].split('【目前小限】')[0];for(const month of saved.nativeAnalysis.layers.months)for(const segment of month.segments){assert(intervals.includes(segment.startsAt.slice(0,10)));assert(intervals.includes(segment.endsAt.slice(0,10)));assert(intervals.includes(segment.gz));}
   const packet=await page.evaluate(t=>JYPromptPacket.get(t),prompt);assert(packet.parts.every(p=>Array.from(p).length<=8000));assert.equal(prompt,packet.body);
   if(await page.locator('[data-jpp-close]').count())await page.locator('[data-jpp-close]').click();await page.evaluate(()=>_zwReset());
   for(const [id,value]of [['algorithm','zhongzhou'],['year-divide','exact'],['horoscope-divide','exact'],['age-divide','birthday']])assert.equal(await page.locator('#zw-'+id).inputValue(),value,'edit preserves '+id);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);assert.deepEqual(errors,[]);
   results.push({width,status:'passed',realInputControls:true,configAppliedToChart:true,actualJsonDownload:true,completePromptCopy:true,exactMonthSegments:true,editPreservesConfiguration:true,pageErrors:0});console.log('PASS R15 configured Ziwei UI '+width);
  }finally{await browser.close();}
 }
 fs.writeFileSync(path.join(root,'docs/ziwei-config-browser-validation-r15-20261004.json'),JSON.stringify({testedAt:new Date().toISOString(),results},null,2)+'\n');
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
