'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright':'playwright');
const root=path.resolve(__dirname,'..'),types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.woff2':'font/woff2','.mp3':'audio/mpeg'},results=[];
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.JY_CHROMIUM,args:['--no-sandbox','--disable-dev-shm-usage','--no-zygote','--single-process','--in-process-gpu','--disable-crash-reporter','--enable-unsafe-swiftshader']});
 try{
  const context=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block',reducedMotion:'reduce',acceptDownloads:true}),page=await context.newPage(),errors=[];
  page.setDefaultTimeout(45000);page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.dismiss());
  await page.route('**/*',async route=>{const url=new URL(route.request().url());if(url.origin!=='https://jingyue.uk')return route.abort();if(url.pathname.startsWith('/api/'))return route.fulfill({contentType:'application/json',body:JSON.stringify({ok:true,total:1,remaining:10,isAdmin:false})});const file=path.resolve(root,'.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));if(!file.startsWith(root+'/'))return route.abort();try{return route.fulfill({body:fs.readFileSync(file),contentType:types[path.extname(file)]||'application/octet-stream'});}catch(e){return route.fulfill({status:404,body:''});}});
  await page.addInitScript(()=>{window.__nativeCopied='';Object.defineProperty(navigator,'clipboard',{value:{writeText:async text=>{window.__nativeCopied=text;}}});});
  await page.goto('https://jingyue.uk/',{waitUntil:'load'});
  async function verify(kind,copy,close){
   const section=page.locator('.jy-native-analysis:visible').last();await section.waitFor();
   const pending=page.waitForEvent('download');await section.locator('[data-jna-download]').click();const d=await pending,saved=JSON.parse(fs.readFileSync(await d.path(),'utf8'));assert.equal(saved.nativeAnalysis.method,kind);
   const prompt=await page.evaluate(copy);assert(prompt.includes('jy.native-analysis/1'),kind);assert(prompt.includes('"method":"'+kind+'"'),kind);assert(!/NaN|undefined|\[object Object\]/.test(prompt),kind);
   if(kind==='ziwei'){assert(saved.nativeAnalysis.layers.daily&&saved.nativeAnalysis.layers.hourly);assert(saved.nativeAnalysis.layers.annual.palaces.some(p=>p.flowStars?.some(s=>s.star==='年解')));}
   if(kind==='vedic'){assert.equal(saved.strength.complete,true);assert.equal(saved.strength.planets.length,7);assert(Object.values(saved.strength.totalVirupas).every(Number.isFinite));assert.equal(saved.bhavaStrength.houses.length,12);assert.equal(saved.bhavaStrength.residential.length,9);assert.equal(Object.keys(saved.vargaAshtakavarga).length,16);assert.equal(saved.panchanga.complete,true);assert(prompt.includes('pinda'));assert(prompt.includes('Bhava')||prompt.includes('bhavaStrength'));}
   if(kind==='astro')assert.equal(saved.essentialDignities.planets.length,7);
   if(kind==='liuren'){assert.equal(saved.shensha.counts.rules,290);assert(prompt.includes('shensha'));assert(saved.shensha.checks.some(s=>s.name==='罪至'));}
   await page.evaluate(close);results.push({method:kind,status:'passed',width:390,nativeDownload:true,prompt:true});console.log('PASS actual '+kind+' entry: calculation, native panel, full JSON download and prompt');
  }
  await page.waitForFunction(()=>typeof _baziStandaloneOpen==='function');await page.evaluate(()=>{_baziStandaloneOpen();_baziSetGender('male');});
  await page.waitForFunction(()=>typeof computeBazi==='function'&&typeof enhanceBazi==='function');
  await page.evaluate(()=>{document.getElementById('bzx-date').value='1983-08-25';document.getElementById('bzx-time').value='14:55';document.getElementById('bzx-city').value='0';document.getElementById('bzx-q').value='完整分析2026至2028年的工作條件';_baziDoCast();});
  await page.locator('.jr-skip').click();
  await verify('bazi',()=>{_baziCopy();return window.__nativeCopied;},()=>_baziClose());
  await page.evaluate(()=>{_ziweiStandaloneOpen();_zwSetGender('male');});await page.waitForFunction(()=>typeof computeZiwei==='function');
  await page.evaluate(()=>{document.getElementById('zw-bd').value='1983-08-25';document.getElementById('zw-hh').value='14';document.getElementById('zw-exact-time').value='14:55';document.getElementById('zw-q').value='完整分析2026至2028年';_ziweiSubmit();});
  await page.locator('.jr-skip').click();
  await verify('ziwei',()=>{_zwCopy();return window.__nativeCopied;},()=>_zwClose());
  for(const [kind,prefix,api,ceremony,reading]of [['vedic','vd','JYVedicUI','data-vdr','data-vd-tab'],['astro','wx','JYWesternUI','data-wxr','data-wx-tab']]){
   await page.evaluate(name=>window[name].open(),api);await page.locator('#'+prefix+'-date').waitFor({state:'attached'});
   await page.evaluate(p=>{document.getElementById(p+'-date').value='1983-08-25';document.getElementById(p+'-time').value='14:55';document.getElementById(p+'-reference').value='2026-10-02';document.getElementById(p+'-question').value='完整分析原局與未來三年工作';},prefix);
   await page.locator('#'+prefix+'-submit').click();await page.locator('['+ceremony+'="skip"]').waitFor();await page.locator('['+ceremony+'="skip"]').click();
   await page.locator('['+reading+'="reading"]').click();
   await verify(kind,api==='JYVedicUI'?()=>JYVedicUI.getPrompt():()=>JYWesternUI.getPrompt(),api==='JYVedicUI'?()=>JYVedicUI.close():()=>JYWesternUI.close());
  }
  await page.evaluate(()=>JYLiurenRoom.open());await page.locator('#lr-question').fill('這次合作需要注意哪些條件？');await page.locator('#lr-date').fill('2026-10-01');await page.locator('#lr-time').fill('22:06');await page.locator('#lr-cast').click();
  await verify('liuren',()=>JYLiurenPrompt.build(JYLiurenRoom.getState().result),()=>JYLiurenRoom.close());
  assert.deepEqual(errors,[]);await context.close();
 }finally{await browser.close();}
 fs.writeFileSync(path.join(root,'docs/native-entry-validation-20261003.json'),JSON.stringify({testedAt:new Date().toISOString(),scope:'Actual Bazi, Ziwei, Vedic, Western and Liuren input/submit/result/prompt/export flows; Name flow separately validated at two widths',results},null,2));
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
