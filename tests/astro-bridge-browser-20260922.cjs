'use strict';
const assert=require('node:assert/strict'),{chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),out=process.env.JY_ASTRO_SHOTS||path.join(require('node:os').tmpdir(),'jy-astro-bridge');fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({executablePath:process.env.JY_CHROMIUM||undefined,args:['--no-sandbox','--disable-dev-shm-usage','--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader']});try{
 const ctx=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block'}),p=await ctx.newPage(),errors=[],dialogs=[],requests=[];
 p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!m.text().startsWith('Failed to load resource'))console.error('Browser:',m.text().slice(0,1600));});p.on('dialog',async d=>{dialogs.push(d.message());await d.dismiss();});
 await p.route('**/*',async r=>{const u=new URL(r.request().url());if(u.origin!=='https://jingyue.uk')return r.abort();requests.push(u.pathname);const f=path.resolve(root,'.'+decodeURIComponent(u.pathname==='/'?'/index.html':u.pathname));try{await r.fulfill({contentType:{'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.json':'application/json','.mp3':'audio/mpeg','.ogg':'audio/ogg','.woff2':'font/woff2','.glb':'model/gltf-binary'}[path.extname(f)]||'application/octet-stream',body:fs.readFileSync(f)});}catch(e){await r.fulfill({status:404,body:''});}});
 await p.goto('https://jingyue.uk',{waitUntil:'load'});
 await p.evaluate(async()=>{await new Promise((resolve,reject)=>_jyLazyScript('JS/solar-location.js?v=20260922bridge1',ok=>ok?resolve():reject(Error('Birth form failed to load'))));});
 await p.evaluate(()=>{document.getElementById('f-question').value='我在轉職時應優先注意什麼？';document.querySelector('input[name="gender"][value="male"]').checked=true;for(const [id,value]of [['f-byear','1983'],['f-bmonth','8'],['f-bday','25'],['f-bhour','14'],['f-bminute','55']]){const el=document.getElementById(id);el.value=value;if(!el.value)throw Error('No option '+id+' '+value);} });
 // The real submit handler must wait for its own dependencies even on a cold load.
 await p.evaluate(async()=>{await submitStep0();if(!S.astroBundle)throw Error(S.astroError||'No native chart');runAnalysisV2();});
 assert.deepEqual(dialogs,[]);
 let state=await p.evaluate(()=>{const a=_buildPayload();return {w:a.dims.natal.engine,v:a.dims.vedic.engine,utc:a.dims.natal.birth.utc,ref:a.astrologyOwnership.sharedReference,solar:S.form.trueSolar,hasFake:a.finalProb!=null,text:[...document.querySelectorAll('[id^="d-natal-"],[id^="d-jyotish-"]')].map(x=>x.innerText).join('\n')};});
 assert.equal(await p.locator('#r-vlabel').textContent(),'命盤已展開');
 assert.equal(state.utc,'1983-08-25T06:55:00.000Z');assert(!state.hasFake);assert(!/undefined|NaN|\[object Object\]/.test(state.text));assert(state.text.includes('處女'));
 assert(!requests.includes('/JS/western_upgrade.js'));assert(!requests.includes('/JS/jyotish_full_upgrade.js'));assert(!requests.includes('/JS/ephemeris-client.js'));
 // Show the actual existing result panels for a mobile rendering check.
 await p.evaluate(()=>{document.querySelectorAll('.screen').forEach(e=>{e.classList.remove('active');e.style.display='none';});const panel=document.getElementById('d-natal-summary');for(let el=panel;el&&el!==document.body;el=el.parentElement){el.style.display='block';el.classList.add('active');}document.getElementById('hook-screen').style.display='none';window.scrollTo(0,0);});
 await p.locator('#d-natal-summary').scrollIntoViewIfNeeded();
 await p.screenshot({path:out+'/western-mobile.png',fullPage:false});
 assert(await p.locator('#d-natal-summary').evaluate(el=>el.scrollWidth<=el.clientWidth+1));
 // Re-enter the same actual handler with the unknown-time radio.
 await p.evaluate(async()=>{document.querySelector('input[name="f-time-precision"][value="unknown"]').checked=true;await submitStep0();runAnalysisV2();});
 state=await p.evaluate(()=>{const q=_buildPayload();return {unknown:q.btimeUnknown,asc:S.natal.ascSign,house:q.dims.natal.houses,lagna:q.dims.vedic.lagna,dasha:q.dims.vedic.dasha,text:[...document.querySelectorAll('[id^="d-natal-"],[id^="d-jyotish-"]')].map(x=>x.innerText).join('\n')};});
 assert(state.unknown);assert.equal(state.asc,null);assert.equal(state.house,null);assert.equal(state.lagna,null);assert(!state.dasha.current);assert(!/undefined|NaN|\[object Object\]/.test(state.text));
 // Exercise the actual animated automatic flow as well as the manual path.
 await p.evaluate(async()=>{document.querySelector('input[name="f-time-precision"][value="precise"]').checked=true;await submitStep0Fast();});
 await p.waitForFunction(()=>S.bazi&&S.ziwei&&document.getElementById('loading-overlay')===null);
 assert.equal(await p.evaluate(()=>_buildPayload().dims.vedic.engine),'jy-vedic-1.2.0');
 // Data edited during an async preload may not resurrect the previous birth snapshot.
 const cancelled=await p.evaluate(async()=>{const a=JYAstroBridge.prepare(S);S.form={...S.form,btimeUnknown:false,timePrecision:'precise',btime:'15:05'};return await a;});assert.equal(cancelled,null);
 assert.deepEqual(dialogs,[]);assert.deepEqual(errors,[]);
 console.log(JSON.stringify({passed:true,coldSubmit:true,automaticFlow:true,unknownResubmit:true,nativePayload:true,staleCancellation:true,oldAstrologyScriptsLoaded:false,pageErrors:errors,screenshots:out},null,2));
 }finally{await browser.close();}})().catch(e=>{console.error(e.stack);process.exitCode=1;});
