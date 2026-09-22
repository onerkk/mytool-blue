'use strict';
// Default: full local index.html and its actual scripts. Requests are fulfilled
// only from this checkout at its configured origin; no live website is modified.
// GUA_COMPONENTS_ONLY=1 uses the smaller integration page for diagnosis.
// Requires Playwright + Chromium. GUA_CHROMIUM and GUA_SCREENSHOTS are optional.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),acorn=require('acorn');
const {chromium}=require('playwright'),root=path.resolve(__dirname,'..');
const index=fs.readFileSync(path.join(root,'index.html'),'utf8');
const styles=[...index.matchAll(/<link[^>]+rel="stylesheet"[^>]*>/g)].map(m=>m[0]).filter(s=>!s.includes('https:'));
const scripts=['reading-quality','tarot-foundation','method-catalog','reading-recommender','atelier-ui','share-card','vendor/lunar','bazi-calendar-core','liuyao-core','yijing-data','yarrow-core','yijing-core','gua-prompt','gua-scene','gua-audio','gua-room'];
const source=fs.readFileSync(path.join(root,'JS/ui.js'),'utf8');let home;
function walk(node){if(!node||typeof node!=='object')return;if(node.type==='FunctionDeclaration'&&node.id?.name==='_redesignHomepage')home=source.slice(node.start,node.end);for(const v of Object.values(node)){if(Array.isArray(v))v.forEach(walk);else if(v&&typeof v==='object')walk(v);}}
walk(acorn.parse(source,{ecmaVersion:'latest'}));assert(home);
const scaffold='<!doctype html><html lang="zh-TW"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'+styles.join('')+'</head><body class="jy-atelier"><section id="hook-screen"></section>'+scripts.map(s=>'<script src="JS/'+s+'.js"></script>').join('')+'<script>'+home+';_redesignHomepage();</script></body></html>';
const screenshotDir=process.env.GUA_SCREENSHOTS;if(screenshotDir)fs.mkdirSync(screenshotDir,{recursive:true});
const fullSite=process.env.GUA_COMPONENTS_ONLY!=='1',origin=fullSite?'https://jingyue.uk':'http://localhost';
async function shot(p,name){if(screenshotDir)await p.screenshot({path:path.join(screenshotDir,name+'.png')});}
async function fits(p){assert(await p.locator('.gw-room:not([hidden])').evaluate(el=>el.scrollWidth<=el.clientWidth+1),'reader overflows viewport');}
async function manual(p,kind,values,q){
  await p.evaluate(k=>JYGuaRoom.open(k),kind);let room=p.locator('#'+kind+'-screen');
  if(await room.locator('[data-action=reset]').count())await room.locator('[data-action=reset]').click();
  await room.locator('textarea').first().fill(q||'請用'+(kind==='liuyao'?'六爻':'易經')+'看這次轉職是否值得推進？');
  await room.locator('[data-mode=manual]').click();
  for(let i=0;i<6;i++)await room.locator('[data-manual="'+i+'"]').selectOption(String(values[i]));
  await room.locator('[data-action=start]').click();await room.locator('.gw-result').waitFor();return room;
}
(async()=>{
  const browser=await chromium.launch({executablePath:process.env.GUA_CHROMIUM||undefined,args:['--no-sandbox','--disable-dev-shm-usage','--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader']});
  try{
    const context=await browser.newContext({viewport:{width:1440,height:1080},acceptDownloads:true,serviceWorkers:'block'}),p=await context.newPage(),errors=[];
    p.on('pageerror',e=>errors.push(e.message));
    await p.route('**/*',async route=>{
      const u=new URL(route.request().url());if(u.origin!==origin)return route.abort();
      if(!fullSite&&u.pathname==='/__gua-test.html')return route.fulfill({contentType:'text/html; charset=utf-8',body:scaffold});
      const f=path.resolve(root,'.'+decodeURIComponent(u.pathname==='/'?'/index.html':u.pathname));if(!f.startsWith(root+path.sep))return route.fulfill({status:403,body:''});
      try{const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.json':'application/json','.woff2':'font/woff2'}[path.extname(f)]||'application/octet-stream';await route.fulfill({contentType:mime,body:fs.readFileSync(f)});}catch(_){await route.fulfill({status:404,body:''});}
    });
    await p.goto(origin+(fullSite?'/':'/__gua-test.html'),{waitUntil:'load'});
    assert.equal(await p.locator('.at-tool').count(),12);
    await p.locator('[data-tool=liuyao]').click();await fits(p);await shot(p,'liu-desktop-input');
    assert(await p.locator('#hook-screen').evaluate(el=>!!el.closest('[inert]')));
    await p.locator('#liuyao-screen [data-action=start]').click();assert((await p.locator('.gw-error:visible').innerText()).includes('先寫下'));
    await p.keyboard.press('Escape');assert(!(await p.locator('#hook-screen').evaluate(el=>!!el.closest('[inert]'))));assert.equal(await p.evaluate(()=>document.activeElement.dataset.tool),'liuyao');
    let room=await manual(p,'liuyao',[9,7,9,6,7,6]);let cast=await p.evaluate(()=>JYGuaRoom.snapshot('liuyao').result);
    assert.equal(cast.original.name,'需');assert.equal(cast.changed.name,'訟');assert.equal(await room.locator('.gw-hex-card').count(),2);assert.equal(await room.locator('.gw-hex-card').first().locator('.is-moving').count(),4);
    await room.locator('[data-line="2"]').click();assert((await room.locator('.gw-detail').innerText()).includes('二爻'));
    await fits(p);await shot(p,'liu-desktop-result');
    const download=p.waitForEvent('download');await room.locator('[data-action=save]').click();const d=await download,record=JSON.parse(fs.readFileSync(await d.path(),'utf8'));assert.deepEqual(record,cast);
    await room.locator('[data-action=share]').click();await p.locator('#jysc-dl:enabled').waitFor();assert(await room.evaluate(el=>el.inert));await shot(p,'liu-share');await p.locator('#jysc-close').click();assert(!(await room.evaluate(el=>el.inert)));assert.deepEqual(await p.evaluate(()=>JYGuaRoom.snapshot('liuyao').result),cast);
    await p.evaluate(()=>{Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:()=>Promise.reject(new Error('denied'))}});document.execCommand=()=>false;});
    await room.locator('[data-action=copy]').click();await p.waitForFunction(()=>document.querySelector('#liuyao-screen .gw-prompt-fold').open);assert((await room.locator('.gw-prompt-area').inputValue()).includes('需'));
    await p.evaluate(()=>JYGuaRoom.close());
    for(const w of [320,390,768]){
      await p.setViewportSize({width:w,height:844});await p.locator('[data-tool=yijing]').click();await fits(p);await shot(p,'yi-input-'+w);
      room=await manual(p,'yijing',[9,9,9,9,9,9]);assert((await room.locator('.gw-reading-plan').innerText()).includes('用九'));assert.equal(await room.locator('.gw-hex-card').first().locator('.is-moving').count(),6);await fits(p);await shot(p,'yi-result-'+w);
      await room.locator('[data-action=reset]').click();await p.evaluate(()=>JYGuaRoom.close());
    }
    await p.setViewportSize({width:390,height:844});
    room=await manual(p,'yijing',[6,8,6,9,6,9]);cast=await p.evaluate(()=>JYGuaRoom.snapshot('yijing').result);assert.equal(cast.movingPositions.length,5);assert.equal(cast.reading.selections[0].side,'changed');assert.equal(cast.reading.selections[0].position,2);
    await room.locator('[data-action=reset]').click();await room.locator('textarea').first().fill('<img src=x onerror="window.bad=1"> 請用易經看下一步');await room.locator('[data-mode=coins]').click();await room.locator('[data-action=start]').click();await room.locator('[data-action=toss]').click();
    let snapshot=await p.evaluate(()=>JYGuaRoom.snapshot('yijing'));assert.equal(snapshot.values.length,1);assert(snapshot.busy);let first=snapshot.values[0],date=snapshot.date;
    const buttonBox=await room.locator('[data-action=toss]').boundingBox();assert(buttonBox.y>=0&&buttonBox.y+buttonBox.height<=844);await shot(p,'yi-mobile-casting');
    await p.evaluate(()=>document.querySelector('#yijing-screen [data-action=toss]').click());assert.equal((await p.evaluate(()=>JYGuaRoom.snapshot('yijing'))).values.length,1);
    await p.evaluate(()=>JYGuaRoom.close());await p.evaluate(()=>JYGuaRoom.open('yijing'));snapshot=await p.evaluate(()=>JYGuaRoom.snapshot('yijing'));assert.equal(snapshot.values.length,1);assert.equal(snapshot.values[0],first);assert(!snapshot.busy);
    await room.locator('[data-action=toss]').click();await room.locator('[data-action=skip]').click();assert.equal((await p.evaluate(()=>JYGuaRoom.snapshot('yijing'))).values.length,2);
    await room.locator('[data-action=quick]').click();await room.locator('.gw-result').waitFor();snapshot=await p.evaluate(()=>JYGuaRoom.snapshot('yijing'));assert.equal(snapshot.values.length,6);assert.deepEqual(snapshot.date,date);assert.equal(await p.evaluate(()=>window.bad),undefined);
    await room.locator('[data-action=reset]').click();await room.locator('textarea').first().fill('請用六爻看這次合作能否推進');await room.locator('.jy-question-recommendation button').click();
    // A prior completed chart is preserved. The pending question transfers when
    // the user explicitly starts a new reading in that system.
    room=p.locator('#liuyao-screen');await room.locator('[data-action=reset]').click();assert.equal(await room.locator('#ly-q').inputValue(),'請用六爻看這次合作能否推進');
    await p.emulateMedia({reducedMotion:'reduce'});await room.locator('[data-mode=coins]').click();await room.locator('[data-action=start]').click();await room.locator('[data-action=toss]').click();snapshot=await p.evaluate(()=>JYGuaRoom.snapshot('liuyao'));assert.equal(snapshot.values.length,1);assert(!snapshot.busy);await room.locator('[data-action=quick]').click();await fits(p);await shot(p,'liu-mobile-result');
    await room.locator('[data-action=share]').click();await p.locator('#jysc-dl:enabled').waitFor();await shot(p,'liu-mobile-share');await p.locator('#jysc-close').click();await p.evaluate(()=>JYGuaRoom.close());
    assert.deepEqual(errors,[]);console.log('gua-browser ('+(fullSite?'full index.html':'component integration')+'): homepage, desktop / 320 / 390 / 768 px, manual / random / reduced motion, cast preservation, original text, recommendation, clipboard fallback, JSON and share cards passed.');
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
