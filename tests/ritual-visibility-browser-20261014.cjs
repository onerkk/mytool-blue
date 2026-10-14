'use strict';
// Real browser checks: height containment, hit testing, decoded pixels and
// renderer identity. This is not physical Android/iOS GPU certification.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'playwright'):'playwright');
const root=path.resolve(__dirname,'..'),origin='https://jingyue.uk',results=[],errors=[];
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.json':'application/json','.woff2':'font/woff2'};
const fontRoot=process.env.JY_QA_FONT_ROOT;
const cards=(count,kind='lenormand')=>Array.from({length:count},(_,i)=>({id:i+1,name:'第 '+(i+1)+' 張',image:'assets/cards/bright-20261011/'+kind+'/'+String(kind==='tarot'?i:i+1).padStart(2,'0')+'.webp',isUp:i%3!==0}));
const sizes=[{width:320,height:640},{width:412,height:804},{width:844,height:390},{width:1280,height:900}];
const spreads={two:2,three:3,five:5,seven:7,choice:7,nine:9,grand:36,grand_nines:36,branches:3};
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.JY_CHROMIUM,args:['--no-sandbox','--disable-dev-shm-usage','--no-zygote','--single-process','--in-process-gpu','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  async function open(extra={}){
   const context=await browser.newContext({viewport:sizes[1],deviceScaleFactor:2.625,isMobile:true,hasTouch:true,serviceWorkers:'block'}),page=await context.newPage();
   page.setDefaultTimeout(20000);page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.dismiss());
   await page.route('**/*',async route=>{
    const u=new URL(route.request().url());
    if(fontRoot&&u.hostname==='fonts.googleapis.com'){
     let css='';for(const family of ['noto-sans-tc','noto-serif-tc'])css+=fs.readFileSync(path.join(fontRoot,'@fontsource',family,'400.css'),'utf8').replace(/url\(\.\/files\//g,'url('+origin+'/__qa_fonts/'+family+'/');
     return route.fulfill({contentType:'text/css',body:css});
    }
    if(u.origin!==origin)return route.abort();
    if(u.pathname.startsWith('/__qa_fonts/')){const parts=u.pathname.slice(12).split('/');return route.fulfill({contentType:'font/woff2',body:fs.readFileSync(path.join(fontRoot,'@fontsource',parts[0],'files',parts[1]))});}
    if(u.pathname.startsWith('/api/'))return route.fulfill({contentType:'application/json',body:'{"ok":true,"total":1,"remaining":10}'});
    if(extra.missingStyle&&u.pathname.endsWith('/mobile-ritual-actions-20260928.css'))return route.fulfill({status:404,body:''});
    if(extra.failedPreview&&u.pathname.endsWith('/preview-20261014/lenormand/01.webp'))return route.fulfill({status:404,body:''});
    if(extra.failedFull&&u.pathname.endsWith('/bright-20261011/lenormand/01.webp'))return route.fulfill({status:404,body:''});
    if(extra.slow&&u.pathname.endsWith('/preview-20261014/lenormand/01.webp'))await new Promise(r=>setTimeout(r,350));
    const file=path.resolve(root,'.'+decodeURIComponent(u.pathname==='/'?'/index.html':u.pathname));
    try{return route.fulfill({body:fs.readFileSync(file),contentType:types[path.extname(file)]||'application/octet-stream'});}catch(e){return route.fulfill({status:404,body:''});}
   });
   await page.goto(origin+'/',{waitUntil:'load'});await page.evaluate(()=>document.fonts.ready);
   return {context,page};
  }
  function record(label,data={}){results.push({label,status:'passed',...data});}
  async function check(page,label){
   const state=await page.locator('.jr-dialog').evaluate(d=>{
    const rect=e=>e.getBoundingClientRect().toJSON(),field=rect(d.querySelector('.jr-playfield')),row=rect(d.querySelector('.jr-reveal-row')),sheet=rect(d.querySelector('.jr-dialogue')),heading=d.querySelector('.js-story-heading');
    return {field,row,sheet,heading:heading&&rect(heading),cards:[...d.querySelectorAll('.jr-reveal:not([hidden])')].map(b=>({rect:rect(b),front:getComputedStyle(b.querySelector('.jr-front')).visibility,transform:getComputedStyle(b).transform,perspective:getComputedStyle(b).perspective,fit:getComputedStyle(b.querySelector('.jr-front img')||b).objectFit,image:b.querySelector('.jr-front img')?.getAttribute('src')})),controls:['.jr-next','.jr-skip'].map(key=>{const e=d.querySelector(key),r=rect(e),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return {key,rect:r,hit:hit===e||e.contains(hit)};}),width:innerWidth,height:innerHeight};
   });
   assert(state.cards.every(c=>c.rect.top>=state.field.top-1&&c.rect.bottom<=state.field.bottom+1),label+' complete faces fit their own height track');
   assert(state.cards.every(c=>c.rect.left>=-1&&c.rect.right<=state.width+1),label+' no horizontal clipping');
   assert(state.cards.every(c=>c.rect.bottom<=state.sheet.top+1),label+' the dialogue does not cover cards');
   assert(state.cards.every(c=>c.transform==='none'&&c.perspective==='none'),label+' stable flat card surfaces');
   if(state.heading)assert(state.heading.bottom<=state.field.top+1,label+' title does not cover cards');
   for(const c of state.controls)assert(c.hit&&c.rect.top>=0&&c.rect.bottom<=state.height+1,label+' '+c.key+' is visible and operable');
   return state;
  }
  const faults={}, {context,page}=await open(faults);
  if(!process.env.JY_VISUAL_FOCUS)for(const reduced of [false,true]){
   await page.emulateMedia({reducedMotion:reduced?'reduce':'no-preference'});
   for(const [spreadId,count] of Object.entries(spreads)){
    await page.setViewportSize(sizes[1]);const data=cards(count);
    await page.evaluate(o=>JYRitual.play('lenormand',o),{cards:data,spreadId,question:'這次相處可以怎麼調整？'});
    await page.locator('.jr-next').click();await check(page,spreadId+' paged');
    await page.locator('.jr-reveal-all').click();await page.waitForFunction(()=>[...document.querySelectorAll('.jr-reveal')].every(b=>b.dataset.imageState==='loaded'));
    assert.equal(await page.locator('.jr-reveal:not([hidden])').count(),count);
    for(const size of sizes){await page.setViewportSize(size);const label=spreadId+' '+(reduced?'still':'full')+' '+size.width+'x'+size.height;const s=await check(page,label);assert.deepEqual(s.cards.map(c=>c.image),data.map(c=>c.image));record(label,{count});}
    await page.evaluate(()=>JYRitual.cancel());
   }
   console.log('Passed '+(reduced?'still':'full')+' motion matrix');
   for(const count of [5,10,21]){
    await page.setViewportSize(sizes[1]);const data=cards(count,'tarot');
    await page.evaluate(o=>JYRitual.play('tarot',o),{cards:data,variant:'deal',question:'這次事情的發展如何？'});
    await page.locator('.jr-reveal-all').click();await page.waitForFunction(()=>[...document.querySelectorAll('.jr-reveal')].every(b=>b.dataset.imageState==='loaded'));
    for(const size of sizes){await page.setViewportSize(size);const label='tarot '+count+' '+(reduced?'still':'full')+' '+size.width+'x'+size.height;await check(page,label);assert.equal(await page.locator('.jr-reveal:not([hidden])').count(),count);record(label,{count});}
    await page.evaluate(()=>JYRitual.cancel());
   }
  }
  // Android-sized viewport, high DPR, full motion: card pixels and their origin
  // remain identical while the scene changes shots and settles behind them.
  await page.emulateMedia({reducedMotion:'no-preference'});await page.setViewportSize(sizes[1]);
  const exact=[1,14,3,2,28].map(n=>({id:n,name:['','騎士'][n]||'牌 '+n,image:'assets/cards/bright-20261011/lenormand/'+String(n).padStart(2,'0')+'.webp'}));
  await page.evaluate(o=>JYRitual.play('lenormand',o),{cards:exact,spreadId:'five',question:'這件事如何發展？'});
  await page.locator('.jr-next').click();await page.locator('.jr-reveal-all').click();await page.waitForFunction(()=>[...document.querySelectorAll('.jr-reveal')].every(b=>b.dataset.imageState==='loaded'));
  const hashes=[],positions=[],states=[],frames=[];
  for(let i=0;i<8;i++){
   const r=await page.locator('.jr-front img').first().boundingBox();positions.push([r.x,r.y,r.width,r.height]);
   const bytes=await page.screenshot({clip:{x:r.x+r.width*.2,y:r.y+r.height*.2,width:r.width*.6,height:r.height*.6}});hashes.push(crypto.createHash('sha256').update(bytes).digest('hex'));
   frames.push(bytes.toString('base64'));
   if(process.env.JY_VISUAL_SCREENSHOT)fs.writeFileSync(process.env.JY_VISUAL_SCREENSHOT+'.frame'+i+'.png',bytes);
   states.push(await page.locator('.jr-front img').first().evaluate(img=>({phase:img.closest('dialog').dataset.phase,ancestors:[img,img.parentElement,img.closest('.jr-reveal'),img.closest('.jr-playfield')].map(n=>{const s=getComputedStyle(n);return {name:n.className,opacity:s.opacity,filter:s.filter,transform:s.transform,scale:s.scale,transition:s.transition,animation:s.animation};})})));
   await page.waitForTimeout(400);
  }
  if(process.env.JY_VISUAL_SCREENSHOT)fs.writeFileSync(process.env.JY_VISUAL_SCREENSHOT+'.frames.json',JSON.stringify({hashes,positions,states},null,2));
  const maxChannelDelta=await page.evaluate(async encoded=>{
   let baseline=null,max=0,width=0,height=0;
   for(const data of encoded){const bytes=Uint8Array.from(atob(data),c=>c.charCodeAt(0)),image=await createImageBitmap(new Blob([bytes],{type:'image/png'}));
    const canvas=new OffscreenCanvas(image.width,image.height),ctx=canvas.getContext('2d');ctx.drawImage(image,0,0);const pixels=ctx.getImageData(0,0,image.width,image.height).data;
    if(!baseline){baseline=pixels;width=image.width;height=image.height;}else{if(width!==image.width||height!==image.height)throw Error('Screenshot dimensions changed');for(let i=0;i<pixels.length;i++)max=Math.max(max,Math.abs(pixels[i]-baseline[i]));}image.close();
   }return max;
  },frames);
  // A one-level rounding difference is normal in GPU color conversion. Large
  // brightness changes, blank/missing artwork, or a shifting face still fail.
  assert(maxChannelDelta<=1,'card pixels stable within one 8-bit color level: '+maxChannelDelta);assert(positions.every(p=>p.every((v,i)=>Math.abs(v-positions[0][i])<.1)),'no moving spread during caption/phase changes');
  assert(await page.evaluate(()=>document.querySelector('.jr-stage canvas') instanceof HTMLCanvasElement),'pixel/toggle checks exercised a live GPU canvas');
  await page.evaluate(()=>window.__originalCanvas=document.querySelector('.jr-stage canvas'));
  for(let i=0;i<4;i++){await page.locator('.jr-motion').click();assert(await page.evaluate(()=>document.querySelector('.jr-stage canvas')===window.__originalCanvas),'motion toggle retains the original renderer/canvas');await check(page,'mode toggle');}
  if(process.env.JY_VISUAL_SCREENSHOT)await page.screenshot({path:process.env.JY_VISUAL_SCREENSHOT});
  record('full-motion-stable-card-pixels',{samples:hashes.length,maxChannelDelta,canvasRetained:true});await page.evaluate(()=>JYRitual.cancel());
  // Reuse the same context: single-process Chromium cannot safely close and
  // create several isolated contexts during one run.
  await page.goto('about:blank');
  const network=await context.newCDPSession(page);
  for(const extra of [{slow:true},{failedPreview:true},{failedPreview:true,failedFull:true},{missingStyle:true}]){
   Object.keys(faults).forEach(key=>delete faults[key]);Object.assign(faults,extra);
   await network.send('Network.clearBrowserCache');
   const p=page;await p.goto(origin+'/',{waitUntil:'load'});await p.evaluate(()=>document.fonts.ready);await p.emulateMedia({reducedMotion:'reduce'});
   await p.evaluate(o=>JYRitual.play('lenormand',o),{cards:cards(5),spreadId:'five',question:'這件事如何發展？'});
   await p.locator('.jr-next').click();await p.locator('.jr-reveal-all').click();await p.waitForFunction(()=>[...document.querySelectorAll('.jr-reveal')].every(b=>['loaded','error'].includes(b.dataset.imageState)));
   const state=await p.locator('.jr-reveal').first().getAttribute('data-image-state');assert.equal(state,extra.failedFull?'error':'loaded');
   if(extra.failedFull)assert((await p.locator('.jr-front-status').first().innerText()).includes('牌圖暫時無法載入'));
   await check(p,JSON.stringify(extra));record('failure/slow/style '+JSON.stringify(extra),{imageState:state});await p.evaluate(()=>JYRitual.cancel());await p.goto('about:blank');
  }
  assert.deepEqual(errors,[],'no JavaScript errors');
  const report={browser:browser.version(),scope:'Production HTML/CSS/JS and real local assets in headless Chromium, including mobile/touch/high-DPR emulation and software GPU. Not physical-device certification.',cases:results.length,results,errors};
  if(process.env.JY_VISUAL_REPORT)fs.writeFileSync(process.env.JY_VISUAL_REPORT,JSON.stringify(report,null,2)+'\n');console.log('Ritual visibility: '+results.length+' browser cases passed.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
