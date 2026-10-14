'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'playwright'):'playwright');
const root=path.resolve(__dirname,'..'),origin='https://jingyue.uk';
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.woff2':'font/woff2'};
const fontRoot=process.env.JY_QA_FONT_ROOT,screenshotDir=process.env.JY_UI_SCREENSHOT_DIR,results=[];
if(screenshotDir)fs.mkdirSync(screenshotDir,{recursive:true});
const viewports=[{width:320,height:640},{width:360,height:740},{width:390,height:844},{width:412,height:915},{width:768,height:1024},{width:1280,height:900},{width:390,height:500},{width:844,height:390}];
const spreads=['two','three','five','seven','choice','nine','grand','grand_nines','branches'];
const question=id=>id==='choice'?'應該留在公司還是轉職？':/^grand|branches/.test(id)?'我今年工作、感情、家庭與生活的整體狀況如何？':'這份工作可以怎麼調整？';
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.JY_CHROMIUM,args:['--no-sandbox','--disable-dev-shm-usage','--no-zygote','--single-process','--in-process-gpu','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const errors=[],missing=[];
 try{
 const context=await browser.newContext({viewport:viewports[0],serviceWorkers:'block'}),page=await context.newPage();
 page.setDefaultTimeout(15000);page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.dismiss());
 let failedCard=false,delayedCard=false;
 await page.route('**/*',async route=>{
   const u=new URL(route.request().url());
   if(fontRoot&&u.hostname==='fonts.googleapis.com'){
     let css='';for(const family of ['noto-sans-tc','noto-serif-tc'])css+=fs.readFileSync(path.join(fontRoot,'@fontsource',family,'400.css'),'utf8').replace(/url\(\.\/files\//g,'url('+origin+'/__qa_fonts/'+family+'/');
     return route.fulfill({contentType:'text/css',body:css});
   }
   if(u.origin!==origin)return route.abort();
   if(u.pathname.startsWith('/__qa_fonts/')){const parts=u.pathname.slice('/__qa_fonts/'.length).split('/');return route.fulfill({contentType:'font/woff2',body:fs.readFileSync(path.join(fontRoot,'@fontsource',parts[0],'files',parts[1]))});}
   if(u.pathname.startsWith('/api/'))return route.fulfill({contentType:'application/json',body:'{"ok":true,"total":1,"remaining":10}'});
   // Distinct probe URLs force an actual request even if card 33 is decoded in
   // the browser's image cache from a previous Grand Tableau.
   const probe=u.pathname.match(/\/33-(slow|failed)-(full|still)\.webp$/);
   if(probe){
     if(probe[1]==='failed')return route.fulfill({status:404,body:''});
     await new Promise(resolve=>setTimeout(resolve,400));
     return route.fulfill({contentType:'image/webp',body:fs.readFileSync(path.join(root,'assets/cards/bright-20261011/lenormand/33.webp'))});
   }
   if(u.pathname.endsWith('/lenormand/33.webp')){
     if(failedCard)return route.fulfill({status:404,body:''});
     if(delayedCard)await new Promise(resolve=>setTimeout(resolve,400));
   }
   const file=path.resolve(root,'.'+decodeURIComponent(u.pathname==='/'?'/index.html':u.pathname));
   try{return route.fulfill({body:fs.readFileSync(file),contentType:types[path.extname(file)]||'application/octet-stream'});}catch(e){missing.push(u.pathname);return route.fulfill({status:404,body:''});}
 });
 await page.addInitScript(()=>{Object.defineProperty(navigator,'clipboard',{value:{writeText:async text=>{window.__copiedPrompt=text;}}});});
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto(origin+'/',{waitUntil:'load'});
 await page.evaluate(()=>{const play=JYRitual.play;JYRitual.play=function(kind,options){window.__drawSnapshot=(options.cards||[]).map(c=>({id:c.id,name:c.name,image:c.image}));return play(kind,options);};});
 function record(label,details){results.push({label,status:'passed',...details});}
 async function controls(label){
   const state=await page.locator('.jr-dialog').evaluate(d=>['.jr-next','.jr-skip'].map(key=>{const e=d.querySelector(key),r=e.getBoundingClientRect(),s=getComputedStyle(e),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return {key,rect:r.toJSON(),visible:s.visibility==='visible'&&s.display!=='none'&&+s.opacity>0,hit:!!hit&&(hit===e||e.contains(hit)),viewport:{width:innerWidth,height:innerHeight}};}));
   for(const s of state){assert(s.visible&&s.hit,label+' '+s.key+' visible and hit-tested');assert(s.rect.x>=-1&&s.rect.y>=-1&&s.rect.right<=s.viewport.width+1&&s.rect.bottom<=s.viewport.height+1,label+' '+s.key+' inside viewport');}
 }
 function geometry(cards,id,label){
   const near=(a,b)=>Math.abs(a-b)<2;
   if(id==='seven')assert(cards.every(c=>near(c.rect.y,cards[0].rect.y)),label+' keeps all seven on one line');
   if(id==='five'){assert(cards.slice(0,3).every(c=>near(c.rect.y,cards[0].rect.y)));assert(near(cards[3].rect.y,cards[4].rect.y)&&cards[3].rect.y>cards[0].rect.y,label+' keeps 3 + 2');}
   if(id==='choice'){assert(near(cards[3].rect.x,cards[1].rect.x));assert(cards[3].rect.y>cards[0].rect.y&&cards[4].rect.y>cards[3].rect.y,label+' keeps independent branches');}
   if(id==='nine')assert(cards.slice(0,3).every(c=>near(c.rect.y,cards[0].rect.y))&&cards[3].rect.y>cards[0].rect.y);
   if(id==='grand'){assert(near(cards[32].rect.x,cards[2].rect.x)&&near(cards[35].rect.x,cards[5].rect.x));assert(cards[32].rect.y>cards[31].rect.y,label+' preserves independent tail');}
   if(id==='grand_nines')for(let row=0;row<4;row++)assert(cards.slice(row*9,row*9+9).every(c=>near(c.rect.y,cards[row*9].rect.y)),label+' preserves 4 x 9');
 }
 for(const id of spreads){
     await page.setViewportSize(viewports[0]);
     const entryLabel=id+' initial';
     await page.evaluate(({id,q})=>{_lenormandOpen();_lnSetSpread(id);document.getElementById('ln-q').value=q;_lnDoDraw();},{id,q:question(id)});
     await page.locator('.jr-next').waitFor();await controls(entryLabel);
     assert.equal(await page.locator('.jr-front img').count(),0,'card faces are absent until deliberate reveal');
     const snapshot=await page.evaluate(()=>window.__drawSnapshot);
     await page.locator('.jr-next').click();await controls(id+' reveal');
     await page.locator('.jr-reveal-all').click();
     await page.waitForFunction(()=>[...document.querySelectorAll('.jr-reveal')].every(b=>b.classList.contains('is-face-ready')&&b.querySelector('.jr-front img')?.naturalWidth>0));
     assert.equal(await page.locator('.jr-reveal:not([hidden])').count(),snapshot.length,id+' all-reveal really shows every card');
     for(const viewport of viewports){
     await page.setViewportSize(viewport);const label=id+'-'+viewport.width+'x'+viewport.height;
     const ritual=await page.locator('.jr-reveal').evaluateAll(nodes=>nodes.map(b=>({rect:b.getBoundingClientRect().toJSON(),front:getComputedStyle(b.querySelector('.jr-front')).visibility,transform:getComputedStyle(b.querySelector('.jr-flip')).transform,ready:b.classList.contains('is-face-ready'),image:b.querySelector('img')?.getAttribute('src')})));
     assert(ritual.every(c=>c.front==='visible'&&c.transform==='none'&&c.ready),label+' stable decoded fronts: '+JSON.stringify(ritual.filter(c=>c.front!=='visible'||c.transform!=='none'||!c.ready)));
     assert(ritual.every(c=>c.rect.x>=-1&&c.rect.right<=viewport.width+1),label+' ritual cards fit width');geometry(ritual,id,label+' ritual');
     const tracks=await page.locator('.jr-dialog').evaluate(d=>({field:d.querySelector('.jr-playfield').getBoundingClientRect().toJSON(),row:d.querySelector('.jr-reveal-row').getBoundingClientRect().toJSON(),sheet:d.querySelector('.jr-dialogue').getBoundingClientRect().toJSON(),heading:d.querySelector('.js-story-heading')?.getBoundingClientRect().toJSON()}));
     assert(ritual.every(c=>c.rect.y>=tracks.field.top-1&&c.rect.bottom<=tracks.field.bottom+1),label+' every complete card is contained in its intrinsic-height track');
     assert(Math.max(...ritual.map(c=>c.rect.bottom))<=tracks.sheet.top+1,label+' dialogue never covers the last row');
     if(tracks.heading)assert(tracks.heading.bottom<=tracks.field.top+1,label+' story heading stays above cards');
     await controls(label+' all-reveal');
     if(screenshotDir&&id==='seven'&&viewport.width===390&&viewport.height===844)await page.screenshot({path:path.join(screenshotDir,'seven-ritual.png')});
     }
     await page.waitForFunction(()=>+document.querySelector('.jr-dialog').dataset.phase>=2);
     if(await page.locator('.jr-dialog').getAttribute('data-phase')==='2')await page.locator('.jr-next').click();
     await controls(id+' ready');
     await page.locator('.jr-next').click();await page.locator('.ln-spread-board').waitFor();
     await page.waitForFunction(()=>[...document.querySelectorAll('.ln-card-img')].every(i=>i.complete&&i.naturalWidth>0));
     for(const viewport of viewports){
     await page.setViewportSize(viewport);const label=id+'-'+viewport.width+'x'+viewport.height;
     const result=await page.locator('.ln-spread-board').evaluate(board=>({rect:board.getBoundingClientRect().toJSON(),width:board.clientWidth,scroll:board.scrollWidth,cards:[...board.querySelectorAll('.ln-card')].map(b=>{const i=b.querySelector('img');return {rect:b.getBoundingClientRect().toJSON(),index:+b.dataset.cardIndex,name:i.alt,image:i.getAttribute('src'),ratio:i.getBoundingClientRect().width/i.getBoundingClientRect().height,fit:getComputedStyle(i).objectFit};})}));
     assert.equal(result.cards.length,snapshot.length,label+' retains all result cards');assert(result.scroll<=result.width+1,label+' board does not overflow');
     assert.deepEqual(result.cards.map(c=>c.image),snapshot.map(c=>c.image),label+' preserves actual draw and order');
     assert(result.cards.every((c,i)=>c.index===i&&c.fit==='contain'&&Math.abs(c.ratio-2/3)<.03&&c.rect.x>=-1&&c.rect.right<=viewport.width+1),label+' full artwork fits each slot');geometry(result.cards,id,label+' result');
     // Bring the complete board into view; tall screens show it all without panning.
     await page.locator('.ln-spread-board').evaluate(board=>board.scrollIntoView({block:'center'}));
     if(viewport.height>=640){const bounds=await page.locator('.ln-spread-board').boundingBox();assert(bounds.y>=-1&&bounds.y+bounds.height<=viewport.height+1,label+' whole spread fits on screen');}
     if(screenshotDir&&((id==='seven'&&viewport.width===390&&viewport.height===844)||(id==='grand'&&viewport.width===360)||(id==='grand_nines'&&viewport.width===390&&viewport.height===844)||(id==='choice'&&viewport.width===1280)))await page.screenshot({path:path.join(screenshotDir,label+'.png')});
     const index=Math.min(2,snapshot.length-1);
     await page.locator('.ln-card').nth(index).scrollIntoViewIfNeeded();
     const before=await page.locator('#ln-screen').evaluate(e=>e.scrollTop);
     await page.locator('.ln-card').nth(index).click();await page.locator('#ln-card-view').waitFor();
     const openedScroll=await page.locator('#ln-screen').evaluate(e=>e.scrollTop);
     if(viewport.height>=640)assert.equal(openedScroll,before,label+' opens without shifting the spread');
     await page.waitForFunction(()=>document.querySelector('.ln-card-view-image')?.naturalWidth>0);
     const view=await page.locator('#ln-card-view').evaluate(d=>({rect:d.getBoundingClientRect().toJSON(),image:d.querySelector('img').getAttribute('src'),imageRect:d.querySelector('img').getBoundingClientRect().toJSON()}));
     assert.equal(view.image,snapshot[index].image,label+' opens selected card');assert(view.rect.x>=0&&view.rect.right<=viewport.width&&view.rect.y>=0&&view.rect.bottom<=viewport.height,label+' viewer contained');assert(view.imageRect.x>=view.rect.x&&view.imageRect.right<=view.rect.right+1&&view.imageRect.bottom<=view.rect.bottom+1,label+' full card visible in viewer');
     if(index+1<snapshot.length){await page.locator('[data-ln-card-next]').click();assert.equal(await page.locator('.ln-card-view-image').getAttribute('src'),snapshot[index+1].image);await page.keyboard.press('ArrowLeft');assert.equal(await page.locator('.ln-card-view-image').getAttribute('src'),snapshot[index].image);}
     if(screenshotDir&&id==='seven'&&viewport.width===390&&viewport.height===844)await page.screenshot({path:path.join(screenshotDir,'single-card-view.png')});
     await page.keyboard.press('Escape');await page.locator('#ln-card-view').waitFor({state:'detached'});assert.equal(await page.locator('#ln-screen').evaluate(e=>e.scrollTop),openedScroll,label+' restores spread position');
     assert.equal(await page.evaluate(()=>document.activeElement?.dataset.cardIndex),String(index),label+' restores selected card focus');
     record(label,{count:snapshot.length,boardWidth:result.width,cardWidth:result.cards[0].rect.width});
     }
     await page.evaluate(()=>_lenormandClose());
     console.log('Passed '+id+' at all '+viewports.length+' viewport sizes');
 }
 // Reproduce the user's exact trio; slow and failed key artwork never creates a blank face.
 await page.setViewportSize({width:390,height:620});
 const trio=[{id:33,name:'鑰匙',image:'assets/cards/bright-20261011/lenormand/33.webp'},{id:2,name:'幸運草',image:'assets/cards/bright-20261011/lenormand/02.webp'},{id:25,name:'戒指',image:'assets/cards/bright-20261011/lenormand/25.webp'}];
 for(const reduced of [false,true])for(const failure of [false,true]){
   failedCard=failure;delayedCard=!failure;await page.emulateMedia({reducedMotion:reduced?'reduce':'no-preference'});
   const probeCards=trio.map((c,i)=>i===0?{...c,image:'assets/cards/bright-20261011/lenormand/33-'+(failure?'failed':'slow')+'-'+(reduced?'still':'full')+'.webp'}:{...c});
   await page.evaluate(cards=>JYRitual.play('lenormand',{cards,spreadId:'three',question:'如何安排下一步？'}),probeCards);
   await page.locator('.jr-next').click();await page.locator('.jr-reveal').nth(0).click();
   assert((await page.locator('.jr-front-status').first().innerText()).includes('鑰匙'),'loading face retains card name');
   await page.waitForFunction(()=>['loaded','error'].includes(document.querySelector('.jr-reveal').dataset.imageState));
   const key=await page.locator('.jr-reveal').first().evaluate(b=>({state:b.dataset.imageState,front:getComputedStyle(b.querySelector('.jr-front')).visibility,text:b.querySelector('.jr-front-status').textContent,transform:getComputedStyle(b.querySelector('.jr-flip')).transform}));
   assert.equal(key.state,failure?'error':'loaded');assert.equal(key.front,'visible');assert.equal(key.transform,'none');if(failure)assert(key.text.includes('牌圖暫時無法載入'));
   await page.locator('.jr-reveal-all').click();await controls('slow/failed image');
   await page.evaluate(()=>JYRitual.cancel());record('key-clover-ring-'+(reduced?'still':'full')+'-'+(failure?'failed':'slow'),key);
 }
 // Auto-reveal and manual pages both retain the draw and finish in the same overview.
 failedCard=false;delayedCard=false;await page.emulateMedia({reducedMotion:'reduce'});
 await page.evaluate(()=>{_lenormandOpen();_lnSetSpread('seven');document.getElementById('ln-q').value='這份工作如何調整？';_lnDoDraw();});
 await page.locator('.jr-next').click();await page.locator('.jr-auto-reveal').click();await page.waitForFunction(()=>document.querySelectorAll('.jr-reveal[aria-pressed="true"]').length===7);
 assert.equal(await page.locator('.jr-reveal:not([hidden])').count(),7);await controls('automatic seven');await page.evaluate(()=>JYRitual.cancel());record('automatic-seven',{count:7});
 await page.evaluate(()=>{_lenormandOpen();_lnSetSpread('seven');document.getElementById('ln-q').value='這份工作如何調整？';_lnDoDraw();});
 await page.locator('.jr-next').click();
 for(const count of [3,3,1]){for(let i=0;i<count;i++)await page.locator('.jr-reveal:not([hidden]):not(:disabled)').first().click();if(count===3)await page.locator('.jr-next').click();}
 assert.equal(await page.locator('.jr-reveal:not([hidden])').count(),7);await controls('manual seven');await page.evaluate(()=>JYRitual.cancel());record('manual-seven',{count:7});
 assert.deepEqual(errors,[],'no JavaScript errors');assert.deepEqual(missing,[],'no missing project assets');
 const report={testedAt:new Date().toISOString(),browser:browser.version(),scope:'Real headless Chromium with software GPU, production HTML/CSS/JS and local card assets. One actual draw per spread resized through every viewport; separate full/still motion, slow/failed image and automatic/manual reveal cases. Viewport emulation, not a physical Android or iPhone certification.',cases:results.length,viewports,results,errors,missing};
 if(process.env.JY_UI_REPORT)fs.writeFileSync(process.env.JY_UI_REPORT,JSON.stringify(report,null,2)+'\n');
 console.log('Card display: '+results.length+' real-browser cases passed.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
