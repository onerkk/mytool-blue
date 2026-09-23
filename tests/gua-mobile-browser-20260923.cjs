const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),{chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),out=process.env.GUA_MOBILE_SHOTS||path.join(require('node:os').tmpdir(),'jingyue-gua-mobile');
fs.mkdirSync(out,{recursive:true});
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.json':'application/json','.mp3':'audio/mpeg','.ogg':'audio/ogg','.woff2':'font/woff2'};
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.JY_CHROMIUM||process.env.GUA_CHROMIUM||undefined,args:['--no-sandbox','--disable-dev-shm-usage','--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader']});
 try{
  const context=await browser.newContext({viewport:{width:320,height:568},serviceWorkers:'block'}),p=await context.newPage(),errors=[];
  p.on('pageerror',e=>errors.push(e.message));
  await p.route('**/*',route=>{const u=new URL(route.request().url());if(u.origin!=='https://jingyue.uk')return route.abort();const file=path.resolve(root,'.'+decodeURIComponent(u.pathname==='/'?'/index.html':u.pathname));try{return route.fulfill({body:fs.readFileSync(file),contentType:types[path.extname(file)]||'application/octet-stream'});}catch(_){return route.fulfill({status:404,body:''});}});
  await p.goto('https://jingyue.uk',{waitUntil:'load'});
  for(const [width,height] of [[320,568],[320,480],[390,844]]){
   await p.setViewportSize({width,height});await p.evaluate(()=>JYGuaRoom.open('yijing'));
   const room=p.locator('#yijing-screen');if((await p.evaluate(()=>JYGuaRoom.snapshot('yijing'))).phase!=='input'){await room.locator('[data-action=quick]').click();await room.locator('[data-action=reset]').click();}await room.locator('#yj-q').fill('這次轉職，我應該如何進退？');await room.locator('[data-action=start]').click();await room.locator('[data-action=toss]').click();
   const bounds=await room.evaluate(el=>{const box=q=>{const r=el.querySelector(q).getBoundingClientRect();return {top:r.top,bottom:r.bottom,left:r.left,right:r.right,height:r.height};};return {scene:box('.gw-scene'),dock:box('.gw-actions'),tools:box('.gw-ceremony-tools'),progress:box('.gw-yarrow-progress'),pageWidth:el.scrollWidth,visibleWidth:el.clientWidth};});
   assert(bounds.pageWidth<=bounds.visibleWidth+1,`${width}x${height}: no horizontal overflow`);
   assert(bounds.scene.bottom>bounds.scene.top+140&&bounds.scene.top>=-30,`${width}x${height}: substantial 3D instrument visible`);
   assert(bounds.tools.top>=0&&bounds.tools.bottom<=bounds.dock.top-5,`${width}x${height}: audio and skip visible above action dock`);
   assert(bounds.progress.bottom<=bounds.tools.top+1,`${width}x${height}: three-change progress visible`);
   assert((await room.locator('.gw-yarrow-progress [aria-current=step]').textContent()).includes('第一變'));
   await room.locator('[data-foley-toggle]').click();assert.equal(await p.evaluate(()=>JYFoley.enabled()),false);
   await room.locator('[data-action=skip]').click();assert.equal((await p.evaluate(()=>JYGuaRoom.snapshot('yijing'))).part.length,1);
   await p.screenshot({path:path.join(out,`yarrow-${width}x${height}.png`)});
   await p.evaluate(()=>{JYGuaRoom.close();JYFoley.setEnabled(true);});
  }
  await p.setViewportSize({width:320,height:480});await p.evaluate(()=>JYGuaRoom.open('liuyao'));
  const room=p.locator('#liuyao-screen');await room.locator('#ly-q').fill('工作能順利落實嗎？');await room.locator('[data-action=start]').click();await room.locator('[data-action=toss]').click();
  const controls=await room.evaluate(el=>{const tools=el.querySelector('.gw-ceremony-tools').getBoundingClientRect(),dock=el.querySelector('.gw-actions').getBoundingClientRect(),scene=el.querySelector('.gw-scene').getBoundingClientRect();return{toolsBottom:tools.bottom,dockTop:dock.top,sceneBottom:scene.bottom,sceneTop:scene.top,overflow:el.scrollWidth-el.clientWidth};});
  assert(controls.toolsBottom<=controls.dockTop-5&&controls.overflow<=1&&controls.sceneBottom>controls.sceneTop+140,'Short phone keeps three-coin controls and tray visible');
  await p.screenshot({path:path.join(out,'liuyao-320x480.png')});await p.evaluate(()=>JYGuaRoom.close());assert.deepEqual(errors,[]);
  console.log('PASS yarrow and three-coin rooms: 320x480, 320x568, 390x844; visible audio and skip controls, preserved cast, no overflow or browser errors.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
