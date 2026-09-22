'use strict';
// Production entry page and actual local MP3s, with a probe on the output graph.
// No claim about a particular phone speaker: device media volume remains external.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),out=process.env.FOLEY_SCREENSHOTS||path.join(require('node:os').tmpdir(),'jingyue-foley');fs.mkdirSync(out,{recursive:true});
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.mp3':'audio/mpeg','.png':'image/png','.svg':'image/svg+xml','.webp':'image/webp','.woff2':'font/woff2','.json':'application/json'};
async function routes(p){await p.route('**/*',async r=>{const u=new URL(r.request().url());if(u.origin!=='https://jingyue.uk')return r.abort();const f=path.resolve(root,'.'+decodeURIComponent(u.pathname==='/'?'/index.html':u.pathname));if(!f.startsWith(root+path.sep))return r.abort();try{await r.fulfill({body:fs.readFileSync(f),contentType:mime[path.extname(f)]||'application/octet-stream'});}catch(_){await r.fulfill({status:404,body:''});}});}
async function instrument(p){await p.addInitScript(()=>{
 window.__foleyProbe={decodes:[],starts:[],oscillators:0,output:null};
 const original=BaseAudioContext.prototype.decodeAudioData;
 BaseAudioContext.prototype.decodeAudioData=function(...args){return original.apply(this,args).then(b=>{const v=b.getChannelData(0);let square=0,peak=0;for(const x of v){square+=x*x;peak=Math.max(peak,Math.abs(x));}__foleyProbe.decodes.push({duration:b.duration,rms:Math.sqrt(square/v.length),peak});return b;});};
 const source=BaseAudioContext.prototype.createBufferSource;
 BaseAudioContext.prototype.createBufferSource=function(){const s=source.call(this),start=s.start;s.start=function(...args){__foleyProbe.starts.push({duration:s.buffer?.duration,rate:s.playbackRate.value});return start.apply(s,args);};return s;};
 BaseAudioContext.prototype.createOscillator=function(){__foleyProbe.oscillators++;throw Error('Synthesized sound is forbidden');};
 const connect=AudioNode.prototype.connect;AudioNode.prototype.connect=function(dest,...rest){const result=connect.call(this,dest,...rest);if(dest instanceof AudioDestinationNode&&!__foleyProbe.output){const probe=this.context.createAnalyser();probe.fftSize=2048;connect.call(this,probe);__foleyProbe.output=probe;}return result;};
});}
async function waitForSound(p,key,before=0){await p.waitForFunction(([k,n])=>(JYFoley.status().played[k]||0)>n,[key,before]);}
const played=(p,key)=>p.evaluate(k=>JYFoley.status().played[k]||0,key);
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.GUA_CHROMIUM||process.env.JY_CHROMIUM||undefined,args:['--no-sandbox','--disable-dev-shm-usage','--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader']});
 try{
 const context=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block'}),p=await context.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));await routes(p);await instrument(p);await p.goto('https://jingyue.uk',{waitUntil:'load'});
 assert.equal(await p.evaluate(()=>JYFoley.status().state),'waiting');assert.equal(await p.evaluate(()=>__foleyProbe.starts.length),0);
 await p.evaluate(()=>JYGuaRoom.open('yijing'));let room=p.locator('#yijing-screen');await room.locator('#yj-q').fill('這次工作轉換，我應該如何進退？');await room.locator('[data-action=start]').click();await waitForSound(p,'paper');
 await p.evaluate(()=>JYFoley.unlock(['coins','stems','bamboo','shuffle','card','wood','paper','bowl']));const decoded=await p.evaluate(()=>__foleyProbe.decodes);assert.equal(decoded.length,8);assert(decoded.every(x=>x.rms>.002&&x.peak>.05&&x.duration>.25));
 await p.evaluate(()=>JYFoley.play('bowl',{scope:'probe',volume:.8}));await p.waitForTimeout(220);const output=await p.evaluate(()=>{const a=__foleyProbe.output,v=new Float32Array(a.fftSize);a.getFloatTimeDomainData(v);return Math.sqrt(v.reduce((sum,x)=>sum+x*x,0)/v.length);});assert(output>.001,'Recorded PCM reaches the output graph');await p.evaluate(()=>JYFoley.stop('probe'));
 console.log('PASS 8 real MP3s decode to non-silent PCM and reach the output; no sound before a gesture.');
 for(const width of [320,390,768]){await p.setViewportSize({width,height:844});assert(await room.evaluate(el=>el.scrollWidth<=el.clientWidth+1));const menu=room.locator('.jy-foley-settings');await menu.locator('summary').click();const rect=await menu.locator('div').boundingBox();assert(rect.x>=0&&rect.x+rect.width<=width&&rect.y>=0,'Audio settings remain on screen');await menu.locator('summary').click();}
 await p.setViewportSize({width:390,height:844});await p.screenshot({path:out+'/yarrow-ready.png'});const beforeStems=await played(p,'stems');await room.locator('[data-action=toss]').click();
 assert((await room.locator('.gw-yarrow-progress [aria-current=step]').textContent()).includes('第一變'));assert((await room.locator('.gw-yarrow-progress [aria-current=step]').textContent()).includes('49 策'));
 const stage=await room.locator('.gw-scene').boundingBox(),dock=await room.locator('.gw-actions').boundingBox();assert(stage.y>=0&&stage.y+stage.height<=dock.y,'Casting frames the instruments above the fixed action');
 await p.waitForTimeout(1400);await p.screenshot({path:out+'/yarrow-action.png'});await p.waitForFunction(()=>!JYGuaRoom.snapshot('yijing').busy);assert((await played(p,'stems'))>=beforeStems+2);assert((await played(p,'bamboo'))>=2);assert.equal(await room.locator('.gw-scene').getAttribute('data-render'),'webgl');
 const offscreenStems=await played(p,'stems'),offscreenBamboo=await played(p,'bamboo');await room.locator('[data-action=toss]').click();await room.evaluate(el=>el.scrollTop=el.scrollHeight);assert((await room.locator('.gw-scene').boundingBox()).y<0);await p.waitForFunction(()=>!JYGuaRoom.snapshot('yijing').busy);assert.equal(await played(p,'stems'),offscreenStems+2);assert.equal(await played(p,'bamboo'),offscreenBamboo+2);
 await p.setViewportSize({width:1440,height:960});await p.screenshot({path:out+'/yarrow-desktop.png'});await p.setViewportSize({width:390,height:844});
 await room.locator('[data-foley-toggle]').click();assert.equal(await p.evaluate(()=>JYFoley.enabled()),false);const silent=await p.evaluate(()=>__foleyProbe.starts.length);await p.emulateMedia({reducedMotion:'reduce'});await room.locator('[data-action=toss]').click();await p.waitForTimeout(200);assert.equal(await p.evaluate(()=>__foleyProbe.starts.length),silent);await p.evaluate(()=>JYFoley.setVolume(.43));await p.reload({waitUntil:'load'});assert.equal(await p.evaluate(()=>JYFoley.enabled()),false);assert.equal(await p.evaluate(()=>JYFoley.status().volume),.43);
 await p.evaluate(()=>JYGuaRoom.open('yijing'));room=p.locator('#yijing-screen');await room.locator('[data-foley-toggle]').click();await waitForSound(p,'stems');assert.equal(await p.evaluate(()=>JYFoley.status().state),'running');await p.evaluate(()=>{JYFoley.setVolume(.8);JYGuaRoom.close();});
 console.log('PASS Yarrow split/group/return cues, mobile layout, reduced-motion sound, remembered mute and volume.');
 // All eight shared ceremonies: actual controls call the recorded service.
 for(const kind of ['tarot','ootk','lenormand','bazi','compat','ziwei','meihua','oracle']){
  const key=['tarot','ootk'].includes(kind)?'shuffle':kind==='lenormand'?'card':['bazi','compat'].includes(kind)?'wood':kind==='oracle'?'stems':'paper';let before=await played(p,key);
  await p.evaluate(kind=>JYRitual.play(kind,{reduced:true,cards:kind==='lenormand'?[{id:1,name:'騎士'},{id:2,name:'三葉草'},{id:3,name:'船'}]:[]}),kind);
  const d=p.locator('dialog.jr-dialog');await d.locator('.jr-next').click();
  if(kind==='lenormand')await d.locator('.jr-reveal').first().click();else if(['bazi','compat'].includes(kind))await d.locator('.jr-seal').first().click();else await d.locator('.jr-next').click();
  await waitForSound(p,key,before);assert.equal(await d.locator('[data-foley-toggle]').count(),1);assert(await d.evaluate(el=>[...el.querySelectorAll('button')].filter(b=>b.offsetWidth&&getComputedStyle(b).visibility!=='hidden').every(b=>{const r=b.getBoundingClientRect();return r.left>=-1&&r.right<=innerWidth+1;})),kind+' controls fit');if(['tarot','lenormand','bazi'].includes(kind))await p.screenshot({path:out+'/'+kind+'.png'});
  await d.locator('.jr-cancel').click();await p.waitForTimeout(120);assert.equal(await p.evaluate(()=>JYFoley.status().active),0,kind+' cancels audio');
 }
 console.log('PASS Tarot, OOTK, Lenormand, Bazi, compatibility, Ziwei, Meihua and Oracle use physical recordings and stop on exit.');
 // Real Oracle shaking: cancellation must suppress both recordings and timers.
 await p.evaluate(()=>_oracleOpen());let stems=await played(p,'stems');await p.evaluate(()=>_oracleStartShake());await waitForSound(p,'stems',stems);await p.evaluate(()=>_oracleClose());const starts=await p.evaluate(()=>__foleyProbe.starts.length);await p.waitForTimeout(2300);assert.equal(await p.evaluate(()=>__foleyProbe.starts.length),starts);assert.equal(await p.locator('#oracle-screen').evaluate(e=>e.style.display),'none');
 await p.evaluate(()=>_oracleOpen());const wood=await played(p,'wood');await p.evaluate(()=>_oracleAllowThrow());await waitForSound(p,'wood',wood);await p.evaluate(()=>_oracleClose());assert.equal(await p.evaluate(()=>JYFoley.status().active),0);
 // Three coin impacts, not a generated success chime.
 await p.emulateMedia({reducedMotion:'no-preference'});await p.evaluate(()=>JYGuaRoom.open('liuyao'));room=p.locator('#liuyao-screen');await room.locator('#ly-q').fill('這次工作能順利落實嗎？');await room.locator('[data-action=start]').click();let coins=await played(p,'coins');await room.locator('[data-action=toss]').click();await p.waitForTimeout(150);assert((await played(p,'coins'))>=coins+3);await p.evaluate(()=>JYGuaRoom.close());assert.equal(await p.evaluate(()=>JYFoley.status().active),0);
 // Load the same lazy engine dependencies as the real astrology forms.
 for(const file of ['vendor/astronomy-engine-2.1.19.min','vedic-ayanamsa','vedic-engine','astro-time','western-engine','western-chart'])await p.addScriptTag({url:'https://jingyue.uk/JS/'+file+'.js'});
 // Both independent astrology ceremonies use the same remembered physical sound.
 const sample={utc:'1983-08-25T04:00:00Z',reference:'2026-09-22T04:00:00Z',latitude:25.03,longitude:121.56,location:'台北'};
 for(const type of ['vedic','western']){
  const before=await played(p,'paper');await p.evaluate(([type,sample])=>{const chart=type==='vedic'?JYVedic.compute(sample):JYWestern.compute({...sample,houseSystem:'P'});window.__chartBefore=JSON.stringify(chart);window.__chart=chart;(type==='vedic'?JYVedicRitual:JYWesternRitual).play(chart,{reduced:true});},[type,sample]);
  await waitForSound(p,'paper',before);const d=p.locator(type==='vedic'?'#vd-ceremony':'#wx-ceremony');assert.equal(await d.locator('[data-foley-toggle]').count(),1);assert(await d.evaluate(el=>[...el.querySelectorAll('button')].filter(b=>b.offsetWidth).every(b=>{const r=b.getBoundingClientRect();return r.left>=-1&&r.right<=innerWidth+1;})),type+' controls fit');await p.screenshot({path:out+'/'+type+'.png'});await d.locator(type==='vedic'?'[data-vdr=cancel]':'[data-wxr=cancel]').click();assert.equal(await p.evaluate(()=>JSON.stringify(__chart)),await p.evaluate(()=>__chartBefore));assert.equal(await p.evaluate(()=>JYFoley.status().active),0);
 }
 // A visibility transition stops the tail and every delayed source, without replay.
 await p.evaluate(async()=>{await JYFoley.play('bowl',{scope:'hidden'});await JYFoley.play('wood',{scope:'hidden',delay:3});Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});assert.equal(await p.evaluate(()=>JYFoley.status().active),0);await p.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));});
 const probes=await p.evaluate(()=>({oscillators:__foleyProbe.oscillators,starts:__foleyProbe.starts}));assert.equal(probes.oscillators,0);assert(probes.starts.every(s=>s.rate===1));assert.deepEqual(errors,[]);
 console.log('PASS Oracle stale transitions, three physical coin cues, Vedic and Western controls, visibility cleanup, original playback pitch.');
 // Corrupt and delayed files must retry cleanly and never sound after cancellation.
 const q=await context.newPage();await routes(q);await q.route('https://jingyue.uk/audio-test',r=>r.fulfill({contentType:'text/html',body:'<button id="go" onclick="JYFoley.play(\'paper\',{scope:\'retry\'})">試聽</button><script src="/JS/recorded-audio.js"></script>'}));let attempt=0;
 await q.route('**/paper-recorded.mp3*',async r=>{attempt++;await r.fulfill({contentType:'audio/mpeg',body:attempt===1?Buffer.alloc(512):fs.readFileSync(path.join(root,'assets/audio/paper-recorded.mp3'))});});
 await q.goto('https://jingyue.uk/audio-test');await q.locator('#go').click();await q.waitForFunction(()=>!!JYFoley.status().errors.paper);await q.locator('#go').click();await q.waitForFunction(()=>JYFoley.status().played.paper===1);assert.equal(attempt,2);assert.equal(await q.evaluate(()=>Object.keys(JYFoley.status().errors).length),0);
 await q.route('**/stems-recorded.mp3*',async r=>{await new Promise(resolve=>setTimeout(resolve,300));await r.fulfill({contentType:'audio/mpeg',body:fs.readFileSync(path.join(root,'assets/audio/stems-recorded.mp3'))});});
 await q.evaluate(()=>{JYFoley.play('stems',{scope:'late'});JYFoley.stop('late');});await q.waitForTimeout(550);assert.equal(await q.evaluate(()=>JYFoley.status().played.stems||0),0);
 const broken=await context.newPage();await routes(broken);await broken.addInitScript(()=>{window.AudioContext=undefined;window.webkitAudioContext=undefined;});await broken.goto('https://jingyue.uk',{waitUntil:'load'});assert.equal(await broken.evaluate(()=>JYFoley.play('paper')),false);
 console.log('PASS corrupt-file refetch, decode cancellation and missing-audio fallback.');
 fs.writeFileSync(path.join(out,'audio-check.json'),JSON.stringify({decoded,outputRMS:output,played:await p.evaluate(()=>JYFoley.status().played),oscillators:probes.oscillators,errors},null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
