'use strict';
// Real Chromium, public Tarot entrance, actual shuffle and local prompt. No paid API is stubbed as a result.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.json':'application/json','.mp3':'audio/mpeg','.woff2':'font/woff2'};

(async()=>{
  const browser=await chromium.launch({executablePath:process.env.JY_CHROMIUM||undefined,args:['--no-sandbox','--disable-dev-shm-usage','--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader']});
  try{
    const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,serviceWorkers:'block',reducedMotion:'reduce'});
    const page=await context.newPage(),errors=[],requests=[];
    page.on('pageerror',error=>errors.push(error.stack||error.message));
    page.on('console',message=>{if(message.type()==='error'&&!/Failed to load resource: net::ERR_FAILED/.test(message.text()))errors.push('console: '+message.text());});
    page.on('dialog',dialog=>dialog.accept());
    page.on('request',req=>{if(/\/api\/|jy-ai-proxy|mytool-blue\.pages\.dev/.test(req.url()))requests.push(req.url());});
    await page.route('**/*',route=>{
      const url=new URL(route.request().url());
      if(url.origin!=='https://jingyue.uk')return route.abort();
      const file=path.resolve(root,'.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));
      if(!file.startsWith(root+path.sep)||!fs.existsSync(file))return route.fulfill({status:404,body:''});
      return route.fulfill({body:fs.readFileSync(file),contentType:mime[path.extname(file)]||'application/octet-stream'});
    });
    await page.goto('https://jingyue.uk/',{waitUntil:'load'});
    await page.evaluate(()=>{window.__testErrors=[];window.addEventListener('error',e=>__testErrors.push({message:e.message,file:e.filename,line:e.lineno,column:e.colno}));});
    await page.evaluate(()=>_atelierChoose('tarot'));
    const question='請用 Mathers 第三法看看我目前工作如何推進？';
    await page.locator('#f-question').fill(question);
    await page.locator('#btn-tool-go').click();
    await page.locator('#step-2').waitFor({state:'visible'});
    assert.equal(await page.evaluate(()=>getCurrentSpread()),'mathers_66');
    assert.equal(await page.evaluate(()=>getCurrentSpreadDef().count),68);
    await page.locator('.at-reading-settings summary').click();
    await page.locator('#jy-mathers-significator').waitFor({state:'visible'});
    const validKing=await page.locator('#jy-mathers-significator option').evaluateAll(options=>options.find(item=>item.value!=='auto')?.value);
    assert(validKing,'A user-selectable King or Queen must be available');
    await page.locator('#jy-mathers-significator').selectOption(validKing);
    const shuffle=page.locator('#tarot-dock-action');
    await shuffle.waitFor({state:'visible'});
    assert.match(await shuffle.innerText(),/洗牌/);
    await shuffle.click();
    await page.locator('.jr-skip').waitFor({state:'visible'});
    await page.locator('.jr-skip').click();
    await page.waitForFunction(()=>window._deckIsShuffled===true,null,{timeout:20000});
    // Touching a real deck card launches canonical 66+2. Repeated taps cannot recast or consume a second card.
    await page.locator('#t-deck .tarot-deck-card[data-idx="0"]').first().click();
    await page.locator('.jr-skip').waitFor({state:'visible'});
    await page.locator('.jr-skip').click();
    try{await page.waitForFunction(()=>typeof drawnCards!=='undefined'&&drawnCards.length===68,null,{timeout:6000});}
    catch(error){console.error('Draw debug',await page.evaluate(()=>({count:drawnCards.length,current:getCurrentSpread(),shuffled:_deckIsShuffled,deck:deckShuffled.length,slot:document.querySelectorAll('#t-chosen [id^="t-slot-"]').length,hint:document.getElementById('pick-hint')?.textContent,dock:document.getElementById('tarot-dock-action')?.textContent,errors:window.__testErrors||[]})),errors);throw error;}
    const actual=await page.evaluate(()=>({
      spread:getCurrentSpread(),count:drawnCards.length,
      sig:drawnCards[0].drawProcedure.significator,
      metadata:drawnCards[0].drawProcedure,
      idList:drawnCards.map(card=>card.id),
      grid:document.querySelectorAll('#t-chosen .jy-m66-grid').length,
      slots:document.querySelectorAll('#t-chosen [id^="t-slot-"]').length,
      canAnalyze:!document.getElementById('btn-analyze').disabled,
      mobile:document.querySelector('#t-chosen .jy-m66-shell')?.scrollWidth>document.querySelector('#t-chosen .jy-m66-shell')?.clientWidth
    }));
    assert.equal(actual.spread,'mathers_66');
    assert.equal(actual.count,68);
    assert.equal(actual.sig.id,Number(validKing));
    assert.equal(new Set(actual.idList).size,68);
    assert(!actual.idList.includes(Number(validKing)));
    assert.equal(actual.metadata.initialDealtCount,66);
    assert.equal(actual.metadata.initialUnusedCount,11);
    assert.equal(actual.metadata.remainingUnusedCount,9);
    assert.equal(actual.metadata.surprises.left.id,actual.idList[66]);
    assert.equal(actual.metadata.surprises.right.id,actual.idList[67]);
    assert.equal(actual.grid,1);
    assert.equal(actual.slots,68);
    assert.equal(actual.mobile,true,'The full 25-column arch should scroll inside its own region on mobile');
    assert.equal(actual.canAnalyze,true);
    await page.locator('#tarot-layout-details summary').click();
    await page.waitForFunction(()=>{
      const shell=document.querySelector('#tarot-layout-details .jy-m66-shell');
      return shell&&shell.scrollWidth>shell.clientWidth&&shell.dataset.jyM66Centered==='1';
    });
    const center=await page.locator('#tarot-layout-details .jy-m66-shell').evaluate(shell=>({left:shell.scrollLeft,max:shell.scrollWidth-shell.clientWidth}));
    assert(center.max>0&&Math.abs(center.left-center.max/2)<2,'Opening the arch must center the significator on mobile');
    if(process.env.JY_MATHERS_REVIEW){
      await page.locator('#t-chosen .jy-m66-shell').scrollIntoViewIfNeeded();
      await page.screenshot({path:process.env.JY_MATHERS_REVIEW});
    }
    assert.match(await page.locator('#tarot-dock-action').innerText(),/解讀提示詞/);
    await page.locator('#tarot-dock-action').click();
    await page.locator('#step-tarot').waitFor({state:'visible',timeout:15000});
    const prompt=await page.evaluate(()=>JY_buildExportPrompt('tarot'));
    assert(prompt.includes(question));
    assert(prompt.includes('mathers_66'));
    assert(prompt.includes('右意外')&&prompt.includes('左意外'));
    assert(prompt.includes('過去')&&prompt.includes('現在')&&prompt.includes('未來'));
    assert(prompt.includes(actual.metadata.significator.name));
    assert(prompt.includes('未模擬')||prompt.includes('沒有模擬'));
    assert.equal(await page.evaluate(()=>drawnCards.length),68,'Viewing and exporting must preserve the same draw');
    // Exercise the live result-page share action, then inspect its real payload.
    await page.evaluate(()=>{
      const open=JYShareCard.open.bind(JYShareCard);
      JYShareCard.open=function(type,data){window.__jyLiveShare={type,data};return open(type,data);};
      _tarotShare();
    });
    await page.locator('#jysc-bd').waitFor({state:'visible'});
    const liveShare=await page.evaluate(()=>({
      type:window.__jyLiveShare?.type,
      methodId:window.__jyLiveShare?.data?.methodId,
      significator:window.__jyLiveShare?.data?.significator?.name,
      cardNames:window.__jyLiveShare?.data?.cards?.map(card=>card.name),
      surprisePositions:window.__jyLiveShare?.data?.cards?.slice(66).map(card=>card.pos),
      drawnNames:drawnCards.map(card=>card.n)
    }));
    assert.equal(liveShare.type,'tarot');
    assert.equal(liveShare.methodId,'mathers_66');
    assert.equal(liveShare.significator,actual.metadata.significator.name);
    assert.equal(liveShare.cardNames.length,68);
    assert.deepEqual(liveShare.cardNames,liveShare.drawnNames,'Share data must preserve all real cards and their order');
    assert.match(liveShare.surprisePositions[0],/左.*意外/);
    assert.match(liveShare.surprisePositions[1],/右.*意外/);
    assert.equal(liveShare.cardNames[66],actual.metadata.surprises.left.name);
    assert.equal(liveShare.cardNames[67],actual.metadata.surprises.right.name);
    assert.deepEqual(requests,[],'No paid API or Worker should be invoked');
    if(errors.length)console.error('Browser diagnostics',errors,await page.evaluate(()=>window.__testErrors||[]));
    assert.deepEqual(errors,[],'No browser runtime error in the complete tarot flow');
    console.log(JSON.stringify({status:'pass',viewport:'390x844',spread:'mathers_66',selectedSignificator:actual.sig.name,drawn:68,remainingUnused:9,visibleSlots:68,promptChars:prompt.length,paidRequests:0}));
    await context.close();
  }finally{await browser.close();}
})().catch(error=>{console.error(error.stack);process.exitCode=1;});
