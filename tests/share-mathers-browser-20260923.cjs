'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright'),root=path.resolve(__dirname,'..');
const out=process.env.JY_SHARE_SHOTS||path.join(require('node:os').tmpdir(),'jingyue-mathers-share');fs.mkdirSync(out,{recursive:true});
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.json':'application/json','.mp3':'audio/mpeg','.ogg':'audio/ogg','.woff2':'font/woff2'};
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.JY_CHROMIUM||undefined,args:['--no-sandbox','--disable-dev-shm-usage','--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader']});
 try{
  const context=await browser.newContext({viewport:{width:320,height:644},serviceWorkers:'block'}),p=await context.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.route('**/*',route=>{const u=new URL(route.request().url());if(u.origin!=='https://jingyue.uk')return route.abort();const file=path.resolve(root,'.'+decodeURIComponent(u.pathname==='/'?'/index.html':u.pathname));try{return route.fulfill({body:fs.readFileSync(file),contentType:types[path.extname(file)]||'application/octet-stream'});}catch(_){return route.fulfill({status:404,body:''});}});
  await p.addInitScript(()=>{const native=CanvasRenderingContext2D.prototype.fillText;CanvasRenderingContext2D.prototype.fillText=function(label){(window.__shareDrawnText||(window.__shareDrawnText=[])).push(String(label));return native.apply(this,arguments);};});
  await p.goto('https://jingyue.uk',{waitUntil:'load'});
  const payload={methodId:'mathers_66',spread:'Mathers 第三法・拱形六十六加二張',question:'這次轉職，我應該如何進退？',sourceProfile:'rws_reversals',significator:{name:'正義・代表牌',img:'tarot_img/01.webp'},cards:Array.from({length:68},(_,i)=>({name:'示例牌名'+String(i+1).padStart(2,'0'),pos:i===66?'左側意外牌':i===67?'右側意外牌':'拱形主盤',img:'tarot_img/'+String(i%9+1).padStart(2,'0')+'.webp',reversed:i%7===0}))};
  const result=await p.evaluate(async d=>{window.__shareDrawnText=[];const c=await JYShareCard.render('tarot',d);return {width:c.width,height:c.height,lines:window.__shareDrawnText.slice(),png:c.toDataURL().split(',')[1]};},payload);
  fs.writeFileSync(path.join(out,'mathers-full.png'),Buffer.from(result.png,'base64'));
  assert.deepEqual([result.width,result.height],[2160,6100]);
  for(let i=1;i<=68;i++)assert(result.lines.includes('示例牌名'+String(i).padStart(2,'0')),'All 68 distinct card names must be drawn: '+i);
  for(const value of ['過去','現在','未來','外弧','內弧','正義・代表牌','左側意外牌 · 第67張','右側意外牌 · 第68張'])assert(result.lines.some(t=>t.includes(value)),value+' on shared PNG');
  for(const width of [320,390]){
   await p.setViewportSize({width,height:644});await p.evaluate(d=>JYShareCard.open('tarot',d),payload);await p.locator('#jysc-dl:enabled').waitFor({timeout:25000});
   const dimensions=await p.locator('#jysc-status').textContent();assert(dimensions.includes('2160 × 6100'));
   const initial=await p.locator('.jysc-img').boundingBox();await p.screenshot({path:path.join(out,`mathers-${width}-overview.png`)});
   await p.locator('#jysc-zoom').click();const zoomed=await p.locator('.jysc-img').boundingBox();assert(zoomed.width>initial.width*2,'Long card gains a readable zoom');
   const scroll=await p.locator('#jysc-stage').evaluate(el=>{el.scrollLeft=el.scrollWidth;el.scrollTop=el.scrollHeight;return {x:el.scrollLeft,y:el.scrollTop,overflowX:el.scrollWidth-el.clientWidth,overflowY:el.scrollHeight-el.clientHeight};});
   assert(scroll.x>0&&scroll.y>0&&scroll.overflowX>0&&scroll.overflowY>0,'Both axes let a phone inspect every card');
   await p.locator('#jysc-stage').evaluate(el=>{el.scrollTop=470;el.scrollLeft=220;});await p.screenshot({path:path.join(out,`mathers-${width}-zoom.png`)});await p.locator('#jysc-close').click();
  }
  // Use the production casting engines; the Zhouyi card must show both selected
  // readings for two moving lines, while Liuyao shows its own Na Jia fields.
  for(const kind of ['yijing','liuyao']){
   await p.evaluate(k=>JYGuaRoom.open(k),kind);
   const room=p.locator('#'+kind+'-screen');await room.locator('[data-mode=manual]').click();
   await room.locator(kind==='yijing'?'#yj-q':'#ly-q').fill('這次工作能否推進？');
   const values=[6,7,8,7,9,7];for(let i=0;i<6;i++)await room.locator('[data-manual="'+i+'"]').selectOption(String(values[i]));
   await room.locator('[data-action=start]').click();const result=await p.evaluate(k=>JYGuaRoom.snapshot(k).result,kind);
   assert.equal(result.movingPositions.length,2);
   const share=await p.evaluate(async ([kind,r])=>{window.__shareDrawnText=[];const data={question:r.question,gua:r,moving:r.movingPositions,cards:[{name:r.original.fullName,pos:'本卦',lines:r.original.lines,moving:r.movingPositions},{name:r.changed.fullName,pos:'之卦',lines:r.changed.lines,moving:r.movingPositions}]};const c=await JYShareCard.render(kind,data);return {texts:window.__shareDrawnText.slice(),png:c.toDataURL().split(',')[1]};},[kind,result]);
   fs.writeFileSync(path.join(out,kind+'-two-moving.png'),Buffer.from(share.png,'base64'));
   for(const name of [result.original.fullName,result.changed.fullName])assert(share.texts.includes(name),kind+': '+name);
   if(kind==='yijing'){
    assert.equal(result.reading.selections.length,2);
    for(const sel of result.reading.selections)assert(share.texts.some(t=>t.includes(sel.role+' · '+sel.hexagram+'卦 · '+sel.label)),'Both Zhouyi readings shown: '+sel.label);
    assert(share.texts.includes('周易 · 卦爻辭'),'Manual Zhouyi method labeled honestly');
   }else{
    for(const value of [result.calendar.monthBranch,result.calendar.day,result.original.palace.name+'宮'])assert(share.texts.includes(value),'Liuyao Na Jia shares actual calendar/palace: '+value);
    assert(share.texts.some(t=>t.includes('六爻納甲')));
   }
   await p.evaluate(k=>JYGuaRoom.close(k),kind);
  }
  assert.deepEqual(errors,[]);
  console.log('PASS Mathers 68 cards in a zoomable 320/390 long PNG, plus native Zhouyi two readings and Liuyao Na Jia sharing.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
