'use strict';
// Real production entry points. Layout and navigation assertions, not screenshots alone.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),out=process.env.JY_UI_REVIEW||path.join(require('node:os').tmpdir(),'jingyue-ui-audit');fs.mkdirSync(out,{recursive:true});
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.json':'application/json','.mp3':'audio/mpeg','.woff2':'font/woff2'};
const entrances={tarot:'#input-screen',ootk:'#input-screen',lenormand:'#ln-screen',bazi:'#bzx-screen',compat:'#bzs-screen',ziwei:'#zw-input',meihua:'#mhx-screen',oracle:'#oracle-screen',vedic:'#vedic-page',western:'#western-page',liuyao:'#liuyao-screen',yijing:'#yijing-screen'};
async function route(page,missing){await page.route('**/*',async r=>{
 const u=new URL(r.request().url());if(u.origin!=='https://jingyue.uk')return r.abort();
 if(u.pathname.startsWith('/api/'))return r.fulfill({contentType:'application/json',body:JSON.stringify({ok:true,count:1,live:1,total:1})});
 const f=path.resolve(root,'.'+decodeURIComponent(u.pathname==='/'?'/index.html':u.pathname));if(!f.startsWith(root+path.sep))return r.abort();
 try{return await r.fulfill({body:fs.readFileSync(f),contentType:mime[path.extname(f)]||'application/octet-stream'});}catch(e){missing.push(u.pathname);return r.fulfill({status:404,body:''});}
});}
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.JY_CHROMIUM||undefined,args:['--no-sandbox','--disable-dev-shm-usage','--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader']}),report=[];
 try{
  for(const [tool,selector] of Object.entries(entrances)){
   const context=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block',reducedMotion:'reduce'}),page=await context.newPage(),errors=[],missing=[],views=[];
   page.on('pageerror',e=>errors.push(e.message));await route(page,missing);await page.goto('https://jingyue.uk',{waitUntil:'load'});await page.evaluate(t=>_atelierChoose(t),tool);await page.locator(selector).waitFor({state:'visible'});
   for(const width of [320,390,768,1440]){
    await page.setViewportSize({width,height:844});await page.waitForTimeout(100);
    const layout=await page.locator(selector).evaluate(el=>({width:el.clientWidth,scroll:el.scrollWidth,inert:!!el.closest('[inert]'),bad:[...el.querySelectorAll('button,input,textarea,select,h1')].filter(x=>x.checkVisibility({checkOpacity:true,checkVisibilityCSS:true})).map(x=>{const r=x.getBoundingClientRect();return {id:x.id,label:(x.textContent||'').slice(0,40),left:r.left,right:r.right,top:r.top};}).filter(r=>r.top>=0&&r.top<innerHeight&&(r.left< -1||r.right>innerWidth+1))}));
    assert(layout.width>0);assert(layout.scroll<=layout.width+1,tool+' horizontal overflow at '+width);assert.equal(layout.inert,false,tool+' cannot receive input');assert.deepEqual(layout.bad,[],tool+' controls outside viewport at '+width);views.push({width,...layout});
    if(width===390)await page.screenshot({path:path.join(out,tool+'-390.png')});
   }
   assert.deepEqual(errors,[],tool+' page errors');assert.deepEqual(missing,[],tool+' missing assets');report.push({tool,views,errors,missing});await context.close();console.log('PASS '+tool+' entry, controls and assets at 320/390/768/1440px');
  }
  const context=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block',reducedMotion:'reduce'}),p=await context.newPage(),missing=[],errors=[];p.on('pageerror',e=>errors.push(e.message));await route(p,missing);await p.goto('https://jingyue.uk',{waitUntil:'load'});await p.evaluate(()=>_atelierChoose('tarot'));
  // Repeated typing must replace the recommendation, then preserve the exact question across rooms.
  await p.locator('#f-question').fill('包裹何時有消息？');assert.equal(await p.locator('#jy-recommend-f-question button').count(),1);
  const indian='請用印度占星看工作';await p.locator('#f-question').fill(indian);await p.locator('#jy-recommend-f-question button').click();await p.locator('#vedic-page').waitFor({state:'visible'});assert.equal(await p.locator('#vd-question').inputValue(),indian);assert.equal(await p.locator('#vedic-page').evaluate(e=>!!e.closest('[inert]')),false);
  const western='請用西洋占星看工作';await p.locator('#vd-question').fill(western);await p.locator('#jy-recommend-vd-question button').click();await p.locator('#western-page').waitFor({state:'visible'});assert.equal(await p.locator('#vedic-page').isVisible(),false);assert.equal(await p.locator('#wx-question').inputValue(),western);
  const tarot='請用塔羅看我的下一步';await p.locator('#wx-question').fill(tarot);await p.locator('#jy-recommend-wx-question button').click();await p.locator('#input-screen').waitFor({state:'visible'});assert.equal(await p.locator('#western-page').isVisible(),false);assert.equal(await p.locator('#f-question').inputValue(),tarot);assert.equal(await p.locator('#f-question').evaluate(e=>!!e.closest('[inert]')),false);
  assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);report.push({flow:'tarot → vedic → western → tarot',questionPreserved:true,errors,missing});await context.close();console.log('PASS edited recommendations, distinct astrology routes, text preservation and modal focus restoration');
  fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({browser:browser.version(),checks:report},null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
