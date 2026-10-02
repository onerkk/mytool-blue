'use strict';
// Render/export QA uses charts and analyses calculated by the actual engines.
// This is result-panel coverage, not a claim to exercise all fifteen input UIs.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright':'playwright');
const fixture=require('./native-fixtures-20261003.cjs'),c=fixture.environment().ctx;
const {charts,b}=fixture.examples(c),root=path.resolve(__dirname,'..'),results=[];
const data=Object.entries(charts).map(([kind,chart])=>({kind,chart,a:c.JYNativeAnalysis.analyze(kind,chart)}));
data.push({kind:'bazi',chart:b,a:c.JYNativeAnalysis.analyze('bazi',b,{unknown:true}),partial:true});
(async()=>{
 const launch=()=>chromium.launch({executablePath:process.env.JY_CHROMIUM,args:['--no-sandbox','--disable-dev-shm-usage','--no-zygote','--single-process','--in-process-gpu','--disable-crash-reporter']});let browser=null;
 try{
  for(const width of [390,1280]){
   browser=await launch();
   const context=await browser.newContext({viewport:{width,height:900},acceptDownloads:true}),page=await context.newPage(),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.setContent('<!doctype html><html lang="zh-Hant"><head><meta name="viewport" content="width=device-width, initial-scale=1"><style>body{margin:0;padding:12px;background:#0c1220;color:#eee;font:15px sans-serif;box-sizing:border-box}main{max-width:1160px;margin:auto}*{box-sizing:border-box}'+fs.readFileSync(path.join(root,'CSS/native-analysis.css'),'utf8')+'</style></head><body><main></main></body></html>');
   for(const file of ['JS/vedic-engine.js','JS/western-engine.js','JS/native-analysis-view.js'])await page.addScriptTag({path:path.join(root,file)});
   await page.evaluate(rows=>{document.querySelector('main').innerHTML=rows.map(r=>JYNativeAnalysisView.render(r.kind,r.chart,r.a)).join('');},JSON.parse(JSON.stringify(data)));
   assert.equal(await page.locator('.jy-native-analysis').count(),16);
   // Open all actual content to catch table/pre overflow hidden by summaries.
   await page.evaluate(()=>document.querySelectorAll('.jy-native-analysis details').forEach(d=>d.open=true));
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,'viewport overflow at '+width);
   for(let i=0;i<data.length;i++){
    const section=page.locator('.jy-native-analysis').nth(i),button=section.locator('[data-jna-download]');
    const pending=page.waitForEvent('download');await button.click();const download=await pending;
    const saved=JSON.parse(fs.readFileSync(await download.path(),'utf8'));assert.equal(saved.nativeAnalysis.method,data[i].kind);
    if(data[i].partial){assert.equal(saved.schema,'jy.partial-bazi/1');assert.equal(saved.pillars.hour,undefined);assert.equal(saved.nativeAnalysis.coverage.pillars,3);}
    else if(data[i].kind==='vedic'){assert.equal(saved.strength.complete,false);assert.equal(saved.strength.totalVirupas,null);}
    else if(data[i].kind==='astro')assert.equal(saved.essentialDignities.planets.length,7);
    else if(data[i].kind==='ziwei')assert(saved.nativeAnalysis.layers.daily&&saved.nativeAnalysis.layers.hourly);
   }
   const escaped=await page.evaluate(()=>JYNativeAnalysisView.render('oracle',{}, {items:[{label:'<img id="injected">',summary:'<script>alert(1)</script>',support:[],caution:[],evidence:[]}],coverage:{},sources:[],unavailable:[],methodData:{poem:'<img id="injected">',lines:[]}}));
   assert(!escaped.includes('<img id="injected">'));assert(escaped.includes('&lt;img'));
   await page.evaluate(()=>{document.querySelectorAll('.jy-native-analysis details').forEach(d=>d.open=false);scrollTo(0,0);});
   await page.locator('.jy-native-analysis').first().locator('summary').first().click();
   await page.screenshot({path:path.join(root,'docs/native-result-'+width+'.png')});
   assert.deepEqual(errors,[]);results.push({width,status:'passed',methods:15,partialCharts:1,jsonDownloads:16,pageErrors:0,viewportOverflow:false});
   console.log('PASS '+width+'px: 15 result panels, partial chart, 16 actual JSON downloads, open-content layout and escaped text');
   await context.close();await browser.close();browser=null;
  }
 }finally{if(browser)await browser.close();}
 fs.writeFileSync(path.join(root,'docs/native-browser-validation-20261003.json'),JSON.stringify({testedAt:new Date().toISOString(),scope:'Calculated result panels and JSON export; actual complete Name UI flow is verified separately',results},null,2));
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
