'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),report={release:'20261015reader26',cases:[],pageErrors:[],missing:[],lazyRequests:[]};
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.json':'application/json','.mp3':'audio/mpeg','.woff2':'font/woff2'};
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.JY_CHROMIUM,args:['--no-sandbox','--disable-dev-shm-usage','--no-zygote','--single-process','--in-process-gpu','--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader']});
 try{
  const page=await browser.newPage({viewport:{width:393,height:852},deviceScaleFactor:1,isMobile:true,hasTouch:true});
  page.on('pageerror',e=>report.pageErrors.push(e.message));
  await page.route('**/*',async route=>{
   const u=new URL(route.request().url());if(u.origin!=='https://jingyue.uk')return route.abort();
   if(['/JS/vedic-engine.js','/JS/vedic-prompt.js','/JS/western-prompt.js'].includes(u.pathname))report.lazyRequests.push({path:u.pathname,version:u.searchParams.get('v')});
   if(u.pathname.startsWith('/api/'))return route.fulfill({contentType:'application/json',body:JSON.stringify({ok:true,count:1,live:1,total:1})});
   const f=path.resolve(root,'.'+decodeURIComponent(u.pathname==='/'?'/index.html':u.pathname));if(!f.startsWith(root+path.sep))return route.abort();
   if(!fs.existsSync(f)){report.missing.push(u.pathname);return route.fulfill({status:404,body:''});}
   return route.fulfill({body:fs.readFileSync(f),contentType:mime[path.extname(f)]||'application/octet-stream'});
  });
  await page.goto('https://jingyue.uk/',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.JYReadingWorkflow?.version==='2.5.0'&&window.JYTarotFoundation?.VERSION==='104.3.0',{timeout:25000});
  await page.evaluate(()=>JYAstroBridge.load());
  const result=await page.evaluate(()=>{
   const raw='我經濟壓力還是才會消失，我副業何時才能每月營業額淨賺10萬？',w=JYReadingWorkflow.plan({method:'vedic',question:raw});
   const input={utc:'1983-08-25T06:55:00Z',reference:'2026-10-15T04:00:00Z',latitude:22.99,longitude:120.23,civil:{date:'1983-08-25',time:'14:55',timezone:'Asia/Taipei'}};
   const v=JYVedic.compute(input),before=JSON.stringify(v),prompt=JYPromptPacket.build('vedic',v,raw),d=JYPromptPacket.get(prompt).readingData;
   return {version:JYReadingWorkflow.version,tasks:w.requestRequirements.tasks,divisions:d.sections.find(s=>s.label==='分盤分析範圍').data.detailedDivisions,unchanged:JSON.stringify(v)===before,sourceQuestion:w.question,hasResearchBoundary:prompt.includes('不得捏造查網'),noInventedExamples:!prompt.includes('【原創成稿示範'),promptCharacters:prompt.length};
  });
  assert.equal(result.tasks.length,2);assert.deepEqual(result.tasks.map(t=>t.goal),['timing','timing']);assert.equal(result.tasks[1].measurement[0].threshold.value,100000);assert.deepEqual(result.divisions,[1,2,9,10]);assert(result.unchanged&&result.hasResearchBoundary&&result.noInventedExamples);
  report.cases.push({name:'production mobile entry to actual Vedic export',status:'passed',...result});
  await page.emulateMedia({reducedMotion:'reduce'});
  const meta=await page.evaluate(()=>({workflow:JYReadingWorkflow.version,reading:JY_READING_QUALITY.readingVersion,focus:JYReadingWorkflow.nativeFocus({method:'vedic',question:'我經濟壓力何時減輕？'}).divisions,bodyWidth:document.documentElement.scrollWidth,viewport:innerWidth}));
  assert.equal(meta.workflow,'2.5.0');assert.equal(meta.reading,'16.0.0');assert.deepEqual(meta.focus,[1,2,9]);assert(meta.bodyWidth<=meta.viewport+2);
  report.cases.push({name:'reduced-motion runtime retains current contract',status:'passed',...meta});
  assert(report.lazyRequests.length>=2);assert(report.lazyRequests.every(r=>r.version==='20261015reader26'),'old lazy call-site cache strings must resolve to this release');
  assert.deepEqual(report.pageErrors,[]);assert.deepEqual(report.missing,[]);report.status='passed';
 }catch(e){report.status='failed';report.error=e.stack;throw e;}
 finally{await browser.close();fs.writeFileSync(path.join(root,'docs/qa-reader26/reader-browser.json'),JSON.stringify(report,null,2));}
 console.log('Reader26 browser: actual mobile production export and reduced-motion runtime passed.');
})().catch(e=>{console.error(e);process.exitCode=1;});
