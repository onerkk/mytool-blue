'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright');
const acorn=require('acorn');
const root=path.resolve(__dirname,'..');
const out=process.env.JY_BACK_SHOTS||path.join(require('node:os').tmpdir(),'jingyue-bright-backs');
fs.mkdirSync(out,{recursive:true});
const kinds=['tarot','lenormand'];
const back=k=>'assets/cards/bright-20261011/'+k+'/back.webp';
const face=k=>'assets/cards/bright-20261011/'+k+'/'+(k==='tarot'?'00':'01')+'.webp';
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.json':'application/json','.woff2':'font/woff2'};
// Full production index.html is the default. A component document is optional
// for inspecting these same production modules without unrelated app startup.
function componentDocument(){
 const source=fs.readFileSync(path.join(root,'JS/ui.js'),'utf8');let home;
 function walk(node){if(!node||typeof node!=='object')return;if(node.type==='FunctionDeclaration'&&node.id?.name==='_redesignHomepage')home=source.slice(node.start,node.end);for(const value of Object.values(node)){if(Array.isArray(value))value.forEach(walk);else if(value&&typeof value==='object')walk(value);}}
 walk(acorn.parse(source,{ecmaVersion:'latest'}));assert(home);
 return '<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'+['style','atelier-ui','ritual-ateliers','cinematic-stage','living-cards','western','gua-room'].map(name=>'<link rel="stylesheet" href="CSS/'+name+'.css">').join('')+'</head><body class="jy-atelier"><main class="app"><div id="hook-screen"></div><header class="at-input-head"><span class="at-art" data-art="tarot"></span></header></main>'+['method-catalog','cinematic-stage','ritual-ateliers','share-card'].map(name=>'<script src="JS/'+name+'.js"></script>').join('')+'<script>'+home+';_redesignHomepage();</script></body></html>';
}
(async()=>{
 const config=process.env.JY_BROWSER_CONFIG?JSON.parse(fs.readFileSync(process.env.JY_BROWSER_CONFIG,'utf8')):{executablePath:process.env.JY_CHROMIUM||undefined,args:['--no-sandbox','--disable-dev-shm-usage','--enable-unsafe-swiftshader']};
 if(config.env)config.env={...process.env,...config.env};
 const gpu=process.env.JY_BACK_WEBGL==='1';
 const browser=await chromium.launch(config),report={environment:(process.env.JY_BACK_COMPONENTS==='1'?'Actual production component document':'Full production index.html')+' in local Chromium, 390 × 844 viewport; actual canvas PNGs; '+(gpu?'software WebGL':'WebGL unavailable fallback'),checks:[],errors:[]};
 try{
  const context=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block'}),p=await context.newPage(),requests=[];
  p.setDefaultTimeout(15000);p.on('pageerror',e=>report.errors.push(e.message));p.on('dialog',d=>d.dismiss());
  await p.route('**/*',route=>{
   const u=new URL(route.request().url());requests.push(u.pathname);
   if(u.origin!=='https://jingyue.uk')return route.abort();
   if(u.pathname==='/'&&process.env.JY_BACK_COMPONENTS==='1')return route.fulfill({contentType:'text/html',body:componentDocument()});
   if(process.env.JY_QA_FONT_ROOT&&u.pathname.startsWith('/qa-font/')){
    const name=u.pathname.slice('/qa-font/'.length),file=path.resolve(process.env.JY_QA_FONT_ROOT,name);
    try{return route.fulfill({body:fs.readFileSync(file),contentType:types[path.extname(file)]||'application/octet-stream'});}catch(e){return route.fulfill({status:404,body:''});}
   }
   if(u.pathname.startsWith('/api/'))return route.fulfill({contentType:'application/json',body:'{"ok":true,"total":1,"remaining":10}'});
   const file=path.resolve(root,'.'+decodeURIComponent(u.pathname==='/'?'/index.html':u.pathname));
   try{return route.fulfill({body:fs.readFileSync(file),contentType:types[path.extname(file)]||'application/octet-stream'});}catch(e){return route.fulfill({status:404,body:''});}
  });
  await p.addInitScript(()=>{
   const draw=CanvasRenderingContext2D.prototype.drawImage,write=CanvasRenderingContext2D.prototype.fillText;
   CanvasRenderingContext2D.prototype.drawImage=function(im){(window.__backDraws||(window.__backDraws=[])).push(im.src||'canvas');return draw.apply(this,arguments);};
   CanvasRenderingContext2D.prototype.fillText=function(text){(window.__backTexts||(window.__backTexts=[])).push(String(text));return write.apply(this,arguments);};
  });
  if(!gpu)await p.addInitScript(()=>{const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return /webgl/i.test(type)?null:get.call(this,type,...args);};});
  await p.goto('https://jingyue.uk',{waitUntil:'load'});
  if(process.env.JY_QA_FONT_ROOT){for(const name of ['noto-serif-tc','noto-sans-tc'])await p.addStyleTag({url:'https://jingyue.uk/qa-font/'+name+'/400.css'});await p.evaluate(()=>document.fonts.ready);}
  await p.waitForFunction(()=>window.JYShareCard&&window.JYRitual);
  const icons=await p.locator('.at-art[data-art=tarot],.at-art[data-art=ootk],.at-art[data-art=lenormand]').evaluateAll(els=>els.map(el=>({kind:el.dataset.art,image:getComputedStyle(el).backgroundImage,before:getComputedStyle(el,'::before').backgroundImage})));
  for(const item of icons){const kind=item.kind==='lenormand'?'lenormand':'tarot';assert(item.image.includes(back(kind)),item.kind+' entry uses the new artwork');assert(item.before.includes(back(kind)),item.kind+' fan matches its center card');}
  assert(icons.length>=3,'Production homepage/input entrances were enhanced');
  await p.locator('.at-tools').first().screenshot({path:path.join(out,'home-entrances.png')});
  report.checks.push('Homepage and input header fans use the correct real deck backs.');

  for(const kind of kinds){
   const cards=[{id:kind==='tarot'?0:1,name:'實際牌面',image:face(kind),isUp:false}];
   await p.evaluate(({kind,cards})=>{window.__originalCards=cards;window.__originalJSON=JSON.stringify(cards);Object.freeze(cards[0]);Object.freeze(cards);window.__backRitual=JYRitual.play(kind,{variant:kind==='tarot'?'deal':undefined,cards,reduced:true,question:'核對本次牌面與牌背'});},{kind,cards});
   const d=p.locator('.jr-dialog');
   if(kind==='lenormand')await d.locator('.jr-next').click();
   await p.waitForFunction(()=>document.querySelector('.jr-dialog').dataset.phase==='1');
   const backs=await d.locator('.jr-back img').evaluateAll(els=>els.map(el=>({src:el.getAttribute('src'),loaded:el.complete&&el.naturalWidth===1024})));
   assert.equal(backs.length,1);assert.equal(backs[0].src,back(kind));assert(backs[0].loaded);
   assert.equal(await d.locator('.jr-front img').count(),0,'Face must not be inserted before reveal');
   await p.screenshot({path:path.join(out,kind+'-covered.png')});
   await d.locator('.jr-reveal').click();
   await p.waitForFunction(()=>{const im=document.querySelector('.jr-front img');return im&&im.complete&&im.naturalWidth;});
   assert.equal(await d.locator('.jr-front img').getAttribute('src'),face(kind));
   assert(await p.evaluate(()=>JSON.stringify(window.__originalCards)===window.__originalJSON),'Artwork changes preserve the immutable draw');
   await p.screenshot({path:path.join(out,kind+'-revealed.png')});
   await p.evaluate(()=>window.__backRitual.cancel());
   report.checks.push(kind+': correct opaque back, delayed face insertion, unchanged card ID/order/orientation.');
  }

  // Render the production share engine. A covered card has a valid face URL;
  // it must still draw its back and never expose its private name or direction.
  for(const kind of kinds){
   for(const hidden of [false,true]){
    const payload={spread:'牌面與牌背核對',question:'比較本次牌組風格',sourceProfile:'rws_reversals',cards:[{name:hidden?'不應公開的牌名':'本次牌面',pos:'位置一',img:face(kind),faceDown:hidden,reversed:true}]};
    const result=await p.evaluate(async ({kind,payload})=>{window.__backDraws=[];window.__backTexts=[];const c=await JYShareCard.render(kind,payload);return{width:c.width,height:c.height,images:window.__backDraws.slice(),texts:window.__backTexts.slice(),png:c.toDataURL().split(',')[1]};},{kind,payload});
    assert.deepEqual([result.width,result.height],[2160,2700]);
    assert(result.images.some(src=>src.endsWith(back(kind))),'Actual back texture appears on exported PNG');
    assert(!result.images.some(src=>/tarot-back-moon-gold|tarot_img\/back/.test(src)));
    if(hidden){assert(!result.images.some(src=>src.endsWith(face(kind))),'A valid face URL cannot override covered state');assert(!result.texts.some(text=>text.includes('不應公開的牌名')||text.includes('逆位')));}
    else assert(result.images.some(src=>src.endsWith(face(kind))),'Actual new face is kept in the shared analysis');
    fs.writeFileSync(path.join(out,kind+'-analysis-'+(hidden?'covered':'face')+'.png'),Buffer.from(result.png,'base64'));
   }
   report.checks.push(kind+': exported 2160 × 2700 analysis uses new face/back textures and respects covered state.');
  }
  const invite=await p.evaluate(async()=>{window.__backDraws=[];const c=await JYShareCard.render('invite',{});return{images:window.__backDraws.slice(),png:c.toDataURL().split(',')[1]};});
  assert(invite.images.some(src=>src.endsWith('assets/share/moon-atelier-bright-20261011.webp')));
  fs.writeFileSync(path.join(out,'invitation.png'),Buffer.from(invite.png,'base64'));
  report.checks.push('Invitation export uses the regenerated bright floating-card hero.');

  // Exercise the real bundled 3D stage for each deck, including the idle
  // Lenormand fan that previously fell back to a dark painted sprite.
  for(const kind of ['tarot','lenormand','ootk']){
   await p.evaluate(kind=>{window.__stageRitual=JYRitual.play(kind,{reduced:true});},kind);
   await p.waitForFunction(renderer=>document.querySelector('.jr-stage').dataset.renderer===renderer,gpu?'webgl2':'fallback');
   const img=p.locator('.jr-fan img').first();
   assert.equal(await img.getAttribute('src'),back(kind==='lenormand'?'lenormand':'tarot'));
   const target='/'+back(kind==='lenormand'?'lenormand':'tarot');assert(requests.includes(target),'3D texture URL was loaded');
   await p.screenshot({path:path.join(out,kind+'-3d.png')});
   await p.evaluate(()=>window.__stageRitual.cancel());
   assert.equal(await p.locator('.jr-dialog canvas').count(),0,'Scene disposal removes the canvas');
  }
  report.checks.push((gpu?'Three.js stages':'WebGL fallback stages')+' retain matching backs for Tarot, Lenormand and Opening of the Key and dispose cleanly.');
  assert(!requests.some(url=>url.endsWith('/tarot-back-moon-gold.jpg')),'No production UI requests the old back');
  assert.deepEqual(report.errors,[],'No browser script errors');
  fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));
  console.log('PASS '+report.checks.length+' browser groups; screenshots and actual share PNGs: '+out);
 }finally{await browser.close();}
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
