'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const {chromium} = require('playwright');
const root = path.resolve(__dirname,'..');
const artifacts = process.env.JY_QA_OUTPUT || fs.mkdtempSync(path.join(require('node:os').tmpdir(),'jingyue-consult-'));
fs.mkdirSync(artifacts,{recursive:true});
const officialOrigin = 'https://jingyue.uk';
const publicURL = process.env.JY_CONSULT_PREVIEW || '';
const origin = publicURL ? new URL(publicURL).origin : officialOrigin;
const methodOrder = ['tarot','ootk','lenormand','bazi','compat','ziwei','meihua','oracle','vedic','western','liuyao','yijing','name','liuren','personality'];
const methods = process.argv.slice(2).length ? process.argv.slice(2) : methodOrder;
const mode = process.env.JY_QA_PHASE || 'feature';
const types = {'.html':'text/html','.js':'application/javascript','.mjs':'application/javascript','.css':'text/css','.svg':'image/svg+xml','.json':'application/json','.gltf':'model/gltf+json','.png':'image/png','.jpg':'image/jpeg','.gif':'image/gif','.webp':'image/webp','.woff2':'font/woff2','.mp3':'audio/mpeg','.mp4':'video/mp4'};
const rooms = {tarot:'#step-tarot',ootk:'#step-tarot',bazi:'#bazi-screen',ziwei:'#zw-result',compat:'#bzs-screen',personality:'#bzs-screen',meihua:'#meihua-screen',oracle:'#oracle-screen',vedic:'#vedic-page',western:'#western-page',liuyao:'#liuyao-screen',yijing:'#yijing-screen',name:'#nm-room',liuren:'#lr-room',lenormand:'#lenormand-screen'};
const confirmed = {tarot:'#tarot-ai-wrap .jy-ex-card',ootk:'.ootk-record',bazi:'.bzx-pillars',ziwei:'.zw-ai',compat:'#pair-ziwei-result',personality:'.bzs-type',meihua:'.mhx-ai-card',oracle:'.or-result',vedic:'#vd-result-title',western:'.wx-result-title',liuyao:'.gw-result',yijing:'.gw-result',name:'.nm-result-title',liuren:'.lr-workspace',lenormand:'.ln-spread-board'};
const q = '未來三個月這份工作的合作條件如何，哪些變化需要留意？';
const datedQuestion='我想約合作方試做小量包裝。十月八日至十五日，盤上哪兩個候選日值得聯絡？請各配對原來的觸發條件。';
const nameQuestion='陳弘林和陳沐洪哪個適合自我介紹？我在意第一次聽就能寫對。';
const pause = ms => new Promise(resolve=>setTimeout(resolve,ms));
function visible(page, selector) { return page.locator(selector).filter({visible:true}).first(); }
async function reachable(page,target, timeout=13000){
  const locator = typeof target === 'string'?visible(page,target):target;
  const end = Date.now()+timeout;
  while(Date.now()<end) {
    if(await locator.isVisible().catch(()=>false))return;
    const skip=visible(page,'.jr-skip, .jy-qc, [data-vdr="skip"], [data-wxr="skip"], .pil3d-skip, .wh3d-skip, .tar3d-skip, .ora3d-skip');
    if(await skip.isVisible())await skip.click({timeout:1300}).catch(()=>{});
    await pause(100);
  }
  throw Error('Expected visible '+String(target));
}
async function submitWizard(page,button){
  const target=visible(page,button);
  if(!await target.isVisible()){
    const last=page.locator('[data-jc-step]:visible').last();
    if(await last.isVisible())await last.click();
  }
  await target.click();
}
async function assign(page, fields){
  await page.evaluate(data=>{
    for (const [id,value] of Object.entries(data)){
      const el=document.getElementById(id);if(!el)throw Error('missing field '+id);
      el.value=value;
    }
  }, fields);
}
async function go(page,kind,variant){
  if(kind==='tarot'||kind==='ootk'){
    await page.locator('#f-question').fill(q);
    if(variant==='intake'){
      const original=page.locator('#f-question'), box=page.locator('.jy-facts-wrap').filter({has:page.locator('#f-question-facts')});
      await box.locator('summary').click();
      const facts=box.locator('.jy-facts'),priority=box.locator('.jy-priority');
      await facts.fill('主管只答應試辦一次。');await priority.fill('我想保留週末。');
      await original.fill(q+'（補充）');
      assert.equal(await facts.inputValue(),'','replacing the entire question clears previous facts');
      await original.fill(q);
      assert.equal(await priority.inputValue(),'','returning to a previous question must not resurrect its private context');
      await facts.fill('下次會議已留了五分鐘。');await priority.fill('我想先說明成果。');
      const other=await page.evaluate(q=>JYKnownFacts.get(['ootk'],q),q);
      assert.equal(other,'','another method sharing the form must not receive these facts');
    }
    await page.locator('#btn-tool-go').click();
    if(kind==='tarot'){
      await reachable(page,'#tarot-dock-action');
      const dock=page.locator('#tarot-dock-action');
      await dock.click();
      await reachable(page,'.jr-skip');
      await visible(page,'.jr-skip').click();
      await page.waitForFunction(()=>window._deckIsShuffled===true);
      await dock.click();
      await reachable(page,'.jr-skip');
      await visible(page,'.jr-skip').click();
      await page.waitForFunction(()=>!window.JYTarotSession?.busy()&&typeof drawnCards!=='undefined'&&drawnCards.length===getCurrentSpreadDef().count);
      await dock.click();
    }else{
      await reachable(page,'.ootk-manual-sig[data-id="35"]');
      await page.locator('.ootk-manual-sig[data-id="35"]').click();
      await page.locator('#ootk-confirm').click();
      await page.locator('#ootk-bind-direction').selectOption('left');
      if(variant==='stop'){
        await page.locator('#ootk-procedure-profile').selectOption('liber78_validation');
        for(const [id,value] of Object.entries({'ootk-bind-pile':'fire','ootk-bind-house-primary':'12','ootk-bind-house-cognate':'7','ootk-bind-sign':'11','ootk-bind-seph':'5'}))await page.locator('#'+id).selectOption(value);
        await page.evaluate(()=>{window._secInt=n=>n-1;});
      }
      await page.locator('#ootk-confirm').click();
      await page.waitForFunction(stopped=>stopped?!!window.S?.tarot?.ootkResults?.abandonedAt:window.S?.tarot?.ootkResults?.completedOperations===5,variant==='stop');
      const ritual=visible(page,'.jr-skip');
      if(await ritual.isVisible())await ritual.click();
      await reachable(page,'#ootk-fast-result',24000);
      await page.locator('#ootk-fast-result').click();
    }
  } else if(kind==='liuyao'||kind==='yijing'){
    const room=page.locator(rooms[kind]);
    await room.locator('[data-mode="manual"]').click();
    await room.locator('textarea').first().fill(q);
    for(let i=0;i<6;i++)await room.locator('select[data-manual="'+i+'"]').selectOption(String([6,7,8,9,7,8][i]));
    await room.locator('[data-action="start"]').click();
  } else if(kind==='bazi'){
    await page.waitForFunction(()=>typeof computeBazi==='function'&&typeof enhanceBazi==='function');
    await page.locator('.bzx-gbtn').first().click();
    await assign(page,{'bzx-date':'1983-08-25','bzx-time':'14:55','bzx-city':'0','bzx-q':q});
    await submitWizard(page,'.bzx-cast-btn');
  } else if(kind==='ziwei'){
    await page.waitForFunction(()=>typeof computeZiwei==='function');
    if(!await visible(page,'[onclick*="_zwSetGender"]').isVisible()&&await visible(page,'[data-jc-step="1"]').isVisible())await visible(page,'[data-jc-step="1"]').click();
    await page.locator('[onclick*="_zwSetGender"]').first().click();
    await assign(page,{'zw-bd':'1983-08-25','zw-hh':variant==='partial'?'unknown':'14','zw-exact-time':variant==='partial'?'':'14:55','zw-q':q});
    await submitWizard(page,'.zw-in-go');
  } else if(kind==='compat'||kind==='personality'){
    if(kind==='personality')await page.locator('#bzs-screen [data-tab="personality"]').click();
    await page.waitForFunction(()=>!!window.BIRTH_CITIES);
    const prefixes=kind==='compat'?['a','b']:['p'];
    for(const [i,p] of prefixes.entries()){
      await page.evaluate(({p,i})=>{
        document.getElementById(p+'-date').value=i?'1987-02-18':'1983-08-25';
        document.getElementById(p+'-time').value=i?'08:20':'14:55';
        const c=document.getElementById(p+'-country');
        c.value=Array.from(c.options).find(o=>o.value)?.value;c.dispatchEvent(new Event('change',{bubbles:true}));
        document.getElementById(p+'-city').value='0';
      },{p,i});
    }
    await assign(page,{[kind==='compat'?'c-question':'p-question']:q});
    await submitWizard(page,'[data-act="cast-'+kind+'"]');
  } else if(kind==='meihua'){
    await page.waitForFunction(()=>typeof calcMH==='function');
    await page.locator('#mhx-q').fill(q);
    if(await visible(page,'[data-jc-step="1"]').isVisible())await visible(page,'[data-jc-step="1"]').click();
    await visible(page,'[onclick*="_mhSetMethod"][onclick*="num"]').click();
    await page.locator('#mhx-up').fill('5');await page.locator('#mhx-lo').fill('8');
    await submitWizard(page,'.mhx-cast-btn');
  } else if(kind==='lenormand'){
    await page.locator('#ln-q').fill(q);
    if(variant==='grand'){
      await visible(page,'[data-jc-step="1"]').click();
      await visible(page,'button[onclick*="_lnSetSpread"][onclick*="grand_nines"]').click();
    }
    await submitWizard(page,'[onclick*="_lnDoDraw"]');
  } else if(kind==='vedic'||kind==='western'){
    const p=kind==='vedic'?'vd':'wx';
    await page.locator('#'+p+'-date').waitFor({state:'attached'});
    await assign(page,{[p+'-date']:'1983-08-25',[p+'-time']:'14:55',[p+'-reference']:'2026-10-02',[p+'-question']:q});
    await page.locator('#'+p+'-submit').click();
  } else if(kind==='liuren'){
    await page.locator('#lr-question').fill(variant==='dates'?datedQuestion:q);await page.locator('#lr-date').fill('2026-10-01');await page.locator('#lr-time').fill('22:06');
    await page.locator('#lr-cast').click();
  } else if(kind==='name'){
    if(variant==='compare')await page.locator('[data-nm-mode="compare"]').click();
    await page.locator('#nm-surname').fill('陳');
    if(variant==='compare'){
      await page.locator('#nm-baseline-name').fill('陳政軒');await page.locator('#nm-candidates').fill('弘林\n沐洪');
    }else await page.locator('#nm-given').fill('弘林');
    await page.locator('#nm-question').fill(variant==='compare'?nameQuestion:q);
    await page.locator('#nm-prepare').click();await page.locator('#nm-review-form').waitFor();await page.locator('#nm-analyze').click();
  } else if(kind==='oracle'){
    await page.locator('#orc-q-input').fill(q);await page.locator('[onclick="_oracleShowGuide()"]').click();await page.locator('[onclick="_oracleStartPray()"]').click();
    await page.evaluate(()=>{
      const original=crypto.getRandomValues.bind(crypto),words=[0,1,16,0,1,0,1,0,1];
      Object.defineProperty(crypto,'subtle',{value:undefined,configurable:true});crypto.getRandomValues=function(array){if(new Error().stack.includes('_v63FallbackRandom')){if(!words.length)throw Error('QA entropy exhausted');array[0]=words.shift();return array;}return original(array);};
      const timeout=window.setTimeout.bind(window),interval=window.setInterval.bind(window);
      window.setTimeout=(f,ms,...a)=>timeout(f,ms>0&&ms<10000?Math.max(1,ms/25):ms,...a);
      window.setInterval=(f,ms,...a)=>interval(f,ms>0&&ms<10000?Math.max(1,ms/25):ms,...a);
    });
    await reachable(page,'[onclick="_oracleAllowThrow()"]');
    await page.locator('[onclick="_oracleAllowThrow()"]').click();
    await reachable(page,'[onclick="_oracleStartShake()"]');
    await page.locator('[onclick="_oracleStartShake()"]').click();
    await reachable(page,'[onclick="_oracleThrow()"]');
    await page.locator('[onclick="_oracleThrow()"]').click();
    for(let i=0;i<4;i++){
      const choices=visible(page,'[onclick="_oracleViewPoem()"],[onclick="_oracleContinue()"],[onclick="_oracleRedraw()"]');
      await reachable(page,choices);
      const action=await choices.getAttribute('onclick');await choices.click();
      if(action==='_oracleViewPoem()')break;
    }
  }
  await reachable(page,confirmed[kind],24000);
}
async function swipePiece(page,piece,dx,dy){
  await piece.evaluate(el=>el.scrollIntoView({block:'center',inline:'nearest',behavior:'instant'}));
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  const box=await piece.boundingBox(),x=Math.round(box.x+box.width/2),y=Math.round(box.y+box.height/2);
  assert(await piece.evaluate((el,p)=>el.contains(document.elementFromPoint(p.x,p.y)),{x,y}),'the chart piece must be touchable at its visible center');
  const input=await page.context().newCDPSession(page);
  try{
    await input.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
    await input.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+Math.round(dx/2),y:y+Math.round(dy/2)}]});
    await input.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+dx,y:y+dy}]});
    await input.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  }finally{await input.detach();}
}
async function review(page,kind,row,expectedQuestion=q){
  const region=page.locator('.jy-consult:visible').first();
  await reachable(page,region,6500);
  row.visibleRegions=await page.locator('.jy-consult:visible').count();assert.equal(row.visibleRegions,1,'one visible reading per cast');
  const bounds=await region.evaluate(el=>{const r=el.getBoundingClientRect();return {left:r.left,right:r.right,width:r.width,viewport:innerWidth,inert:!!el.closest('[inert]'),scrollWidth:el.scrollWidth,clientWidth:el.clientWidth};});
  row.bounds=bounds;assert(!bounds.inert&&bounds.left>=-1&&bounds.right<=391&&bounds.viewport===390&&bounds.scrollWidth<=bounds.clientWidth+2,'mobile consult fits view and is interactive');
  const points=region.locator('[data-consult-point]:visible');row.points=await points.count();assert(row.points>0,'chart-specific points');
  const pager=region.locator('.jc-pager'), reading=region.locator('.jc-reading'), piece=reading.locator('.jc-piece');
  if(row.points>1){
    const selected=i=>region.locator('[data-consult-point="'+i+'"][aria-pressed="true"]').waitFor({state:'attached'});
    const back=pager.getByRole('button',{name:'上一處'}),next=pager.getByRole('button',{name:'下一處'});
    await reading.press('Home');assert(await back.isDisabled());
    await next.click();await selected(1);
    await reading.press('End');assert(await next.isDisabled());await reading.press('Home');
    await points.first().press('ArrowRight');assert(await points.nth(1).evaluate(el=>document.activeElement===el));
    await back.click();assert.equal(await pager.locator('span').innerText(),'1 / '+row.points);
    await swipePiece(page,piece,-36,0);await selected(1);
    await swipePiece(page,piece,36,0);await selected(0);
    await swipePiece(page,piece,0,-46);await selected(0);
    row.touchAndKeyboardNavigation=true;
  }else{assert.equal(await pager.count(),0);row.singleEvidence=true;}
  if(!process.env.JY_QA_FULL_MOTION)assert.equal(await piece.locator('*').evaluateAll(nodes=>nodes.some(el=>getComputedStyle(el).animationName!=='none')),false);
  const graphic=await piece.evaluate(el=>{
    const selector='.jc-face,.jc-fan img,.jc-hex i,.jc-ring b,.jc-glyph';
    const first=el.querySelector(selector);
    return first?{name:getComputedStyle(first).animationName,face:!!first.closest('.jc-face'),hex:!!first.closest('.jc-hex'),dial:!!first.closest('.jc-ring'),fan:!!first.closest('.jc-fan'),theme:el.dataset.kind}:null;
  });
  if(graphic && process.env.JY_QA_FULL_MOTION){
    const expected=graphic.hex?'jc-draw-line':graphic.dial?'jc-find-sector':graphic.face?'jc-turn-card':graphic.fan?'jc-lay-card':['slip','pillar'].includes(graphic.theme)?'jc-unroll':'jc-lay-card';
    assert.equal(graphic.name,expected);row.nativeMotion=expected;
  }
  const cardArt=await piece.locator('img').evaluateAll(nodes=>nodes.map(el=>el.getAttribute('src')));
  if(cardArt.length){assert(cardArt.every(src=>/^assets\/cards\/bright-20261011\/(tarot|lenormand)\/\d{2}\.webp$/.test(src)),'match the illustration used at the draw');row.sameDeck=true;}
  const point=points.nth(row.points>1?1:0);row.point=(await point.innerText()).replace(/\s+/g,' ').trim();
  await point.focus();assert(await point.evaluate(e=>document.activeElement===e),'point accepts keyboard focus');await point.press('Enter');
  assert.equal(await point.getAttribute('aria-pressed'),'true');row.keyboardPoint=true;
  const anchor=await region.locator('.jc-interpret h3').innerText();
  const fact=await region.locator('.jc-fact').innerText();
  assert(anchor&&fact,'selected chart location and evidence should be visible');
  const summary=region.locator('details.jc-observe summary');
  if(!(await region.locator('details.jc-observe').evaluate(e=>e.open))){await summary.focus();await summary.press('Enter');}
  const choice=region.locator('[data-consult-choice="1"]');
  await choice.focus();await choice.press('Space');assert.equal(await choice.getAttribute('aria-pressed'),'true');
  await choice.press('Space');assert.equal(await choice.getAttribute('aria-pressed'),'false');row.undo=true;
  await choice.press('Enter');const verdict=await choice.innerText();
  const note=region.locator('[data-consult-note]:visible').first();await note.waitFor({state:'visible'});
  const text='我已和同事約定下週四核對進度（'+kind+'）';await note.fill(text);
  if(row.points>1){
    await points.first().focus();await points.first().press('Space');assert.equal(await note.inputValue(),'','observation must stay with chosen point');
    await point.focus();await point.press('Enter');assert.equal(await note.inputValue(),text);assert.equal(await choice.getAttribute('aria-pressed'),'true');row.notesScoped=true;
  }
  if(kind==='meihua'||kind==='name'||kind==='liuyao'){
    await region.scrollIntoViewIfNeeded();await page.screenshot({path:path.join(artifacts,kind+'-before-copy-390.png')});
  }
  const copy=region.locator('[data-consult-copy]:visible').first();await copy.focus();assert(await copy.evaluate(e=>document.activeElement===e),'copy accepts keyboard focus');await copy.press('Enter');
  let copied;
  if(kind.endsWith('-liveclip')){
    await page.waitForFunction(()=>document.querySelector('.jy-consult .jc-message')?.textContent.includes('已複製'),null,{timeout:8000});
    copied=await page.evaluate(()=>navigator.clipboard.readText());row.nativeClipboardReadBack=true;
  }else{
    await page.waitForFunction(note=>window.__consultClipboard.some(text=>text.includes(note)),text,{timeout:7000});
    copied=await page.evaluate(t=>window.__consultClipboard.findLast(x=>x.includes(t)),text);
  }
  row.personalized=copied.includes(text)&&copied.includes(verdict)&&copied.includes(anchor);row.clipboardCharacters=Array.from(copied).length;row.questionIncluded=copied.includes(expectedQuestion);
  assert(row.personalized&&row.questionIncluded,'follow-up must include original question, selected real chart location, actual feedback and note');
  fs.writeFileSync(path.join(artifacts,kind+'-followup.txt'),copied);
  if(kind==='meihua'||kind==='name'||kind==='liuyao'){
    await region.scrollIntoViewIfNeeded();await page.screenshot({path:path.join(artifacts,kind+'-390.png')});
  }
}
async function run(browser,kind){
  const [tool,variant]=kind.split('-');
  const row={kind,portal:tool==='personality'?'compat → 人格':tool,mode,result:false,status:'failed'};
  const c=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:1,reducedMotion:process.env.JY_QA_FULL_MOTION?'no-preference':'reduce',locale:'zh-TW',timezoneId:'Asia/Taipei',serviceWorkers:'block',acceptDownloads:true});
  const page=await c.newPage(),errors=[];page.setDefaultTimeout(6500);page.on('pageerror',err=>errors.push(err.message));
  page.on('dialog',dialog=>dialog.accept());
  if(variant==='liveclip')await c.grantPermissions(['clipboard-read','clipboard-write'],{origin});
  await c.addInitScript(real=>{try{localStorage.setItem('_jy_first_guide_v1','1');localStorage.setItem('_jy_copy_coach_v1','1');localStorage.setItem('_jy_handoff_dismissed','1');}catch{}window.__consultClipboard=[];if(!real)Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async value=>{window.__consultClipboard.push(String(value));}}});},variant==='liveclip');
  try {
    if(!publicURL)await page.route('**/*',async route=>{const u=new URL(route.request().url());if(u.origin!==officialOrigin)return route.abort();if(u.pathname.startsWith('/api/'))return route.fulfill({contentType:'application/json',body:'{"ok":true,"total":1,"remaining":10,"isAdmin":false}'});const f=path.resolve(root,'.'+decodeURIComponent(u.pathname==='/'?'/index.html':u.pathname));if(!f.startsWith(root+path.sep))return route.abort();try{return await route.fulfill({path:f,contentType:types[path.extname(f)]||'application/octet-stream'});}catch{return route.fulfill({status:404,body:''});}});
    await page.goto(publicURL||officialOrigin,{waitUntil:'domcontentloaded',timeout:35000});
    const home=page.locator('.at-tools button[data-tool]');await home.first().waitFor();row.portals=await home.count();assert.equal(row.portals,14);
    await visible(page,'.at-tools button[data-tool="'+(tool==='personality'?'compat':tool)+'"]').click();row.entered=true;
    await go(page,tool,variant);row.result=true;
    let currentQuestion=variant==='dates'?datedQuestion:variant==='compare'?nameQuestion:q;
    if(variant==='edit'){
      const region=page.locator('.jy-consult:visible').first();
      await region.locator('.jc-observe summary').click();
      const evidence=region.locator('[data-consult-note]');await evidence.fill('第一題的留言只屬於第一題');
      const prefix=tool==='vedic'?'vd':'wx';
      await visible(page,'[role=tab][data-'+prefix+'-tab="reading"]').click();
      const question=page.locator(tool==='vedic'?'#vd-result-question':'#wx-read-question');
      currentQuestion='下次家庭討論應該先處理哪一件事？';await question.fill(currentQuestion);
      await page.waitForFunction(q=>document.querySelector('.jy-consult .jc-question')?.textContent===q,currentQuestion);
      assert.equal(await region.locator('[data-consult-note]').inputValue(),'','edited question must not inherit previous feedback');
      row.editedQuestionClearedDraft=true;
    }
    if(variant==='intake'){
      const r=page.locator('.jy-consult:visible .jc-context');
      await r.locator('summary').click();assert.match(await r.innerText(),/下次會議已留了五分鐘/);
      assert.match(await r.innerText(),/我想先說明成果/);row.intakeScoped=true;
    }
    if(variant==='switch'){
      const table=page.locator('.jy-consult:visible');
      row.pairTitle=await table.locator('h2').textContent();
      row.pairBody=await page.evaluate(()=>JYPromptPacket.get(BaziSuiteUI.getState().prompt).id);
      await go(page,'personality');
      row.personalityTitle=await table.locator('h2').textContent();row.personalityBody=await page.evaluate(()=>JYPromptPacket.get(BaziSuiteUI.getState().prompt).id);
      await page.locator('#bzs-screen [data-tab="compat"]').click();
      await visible(page,'#pair-ziwei-result').waitFor();
      row.restoredTitle=await table.locator('h2').textContent();row.restoredBody=await page.evaluate(()=>JYPromptPacket.get(BaziSuiteUI.getState().prompt)?.id);
      assert.equal(row.restoredTitle,row.pairTitle,'compatibility tab should restore the committed pair consultation');
      assert.equal(row.restoredBody,row.pairBody,'native copy must also restore the pair packet');
    }
    if(variant==='grand'){
      row.layout=await visible(page,'.ln-spread-board').getAttribute('data-spread');row.cards=await page.locator('.ln-card').count();
      assert.equal(row.layout,'grand_nines');assert.equal(row.cards,36);
    }
    if(variant==='compare'){
      const region=page.locator('.jy-consult:visible').first();
      const station=region.locator('[data-consult-point]').nth(1);await station.click();await region.locator('.jc-observe summary').click();
      await region.locator('[data-consult-note]').fill('這個名字在手機輸入法容易辨認');
      await page.locator('[data-nm-result="2"]').click();
      assert.equal(await region.locator('[data-consult-note]').inputValue(),'這個名字在手機輸入法容易辨認','switching the legacy candidate tab should preserve this reading-set draft');
      row.notesSurviveRoomRerender=true;
    }
    if(mode==='feature'){
      await review(page,kind,row,currentQuestion);
      const table=page.locator('.jy-consult:visible').first(), check=table.locator('.jc-check');
      const opening=table.locator('.jc-opening').first();
      assert.ok(await opening.isVisible(),kind);
      if(!(await opening.getAttribute('open')) && !await opening.locator('dl').isVisible())await opening.locator('summary').click();
      assert.ok((await opening.locator('dd').first().innerText()).trim(),kind);
      row.nativeOpeningOnScreen=true;
      const source=table.locator('.jc-source');await source.locator('summary').click();
      const native=source.locator('select'), sourceText=source.locator('.jc-source-text');
      if(variant==='dates'){
        assert.match(await native.locator('option:checked').innerText(),/應期候選日.*全列4日/);
        const raw=await sourceText.innerText();
        const days=raw.split('\n').filter(line=>line.includes('｜')).flatMap(line=>line.split('｜')[0].split('、'));
        assert.deepEqual(days.sort(),['2026-10-08','2026-10-09','2026-10-12','2026-10-15']);
        assert.match(raw,/2026-10-08[^\n]+日合用神/);assert.match(raw,/2026-10-15[^\n]+用神值日/);
        await source.scrollIntoViewIfNeeded();await page.screenshot({path:path.join(artifacts,'liuren-candidate-dates-390.png')});
      }
      if(variant==='compare')assert.match(await native.locator('option:checked').innerText(),/陳弘林字音形義/);
      const count=await native.locator('option').count();
      await native.selectOption(String(count-1));
      const tableLabel=await native.locator('option:checked').innerText(), tableValue=await sourceText.textContent();
      await source.locator('[data-consult-source-copy]').click();
      await source.locator('[role=status]').filter({hasText:'已複製'}).waitFor();
      const cited=await page.evaluate(real=>real?navigator.clipboard.readText():window.__consultClipboard.at(-1),variant==='liveclip');
      assert.ok(tableValue&&cited.includes('【'+tableLabel+'】\n'+tableValue)&&cited.includes(currentQuestion));
      row.nativeSourceReadback=true;
      await check.locator(':scope > summary').click();
      const reread=check.locator('.jc-reread');
      await reread.locator('[data-consult-reread]').click();
      await reread.locator('[role=status]').filter({hasText:'已複製'}).waitFor();
      const sameCast=await page.evaluate(real=>real?navigator.clipboard.readText():window.__consultClipboard.at(-1),variant==='liveclip');
      assert.ok(sameCast.includes(currentQuestion)&&sameCast.includes('本題起斷（')&&sameCast.includes('免禍'),kind);
      row.rereadIncludesOriginalChart=true;
      const answer=check.locator('[data-consult-answer]');
      await answer.fill('你可以先核對下週的會議時間。');
      await check.locator('[data-consult-check]').click();
      assert.match(await check.locator('.jc-check-result').innerText(),/沒有可直接比對/);
      if(tool==='liuren'){
        const branch=(await table.locator('.jc-interpret').innerText()).includes('子')?'丑':'子';
        await answer.fill('初傳為'+branch+'。');
        await check.locator('[data-consult-check]').click();
        assert.match(await check.locator('.jc-check-result').innerText(),/比對了|本盤記錄/);
      }
      assert.equal(await page.locator('#jy-handoff:visible,#jy-memory-tip:visible').count(),0,'follow-up uses a single inline delivery status');
      row.localAnswerCheck=true;
      const claim='你已經知道這件事的結果了。', extra='只有 AI 說過的另一句，不要複製。';
      const actual='我還沒收到結果，週四才能當面確認。';
      const repeated='我覺得你需要耐心等待這件事未來的發展。';
      await answer.fill(['開場：朋友',repeated,repeated,repeated].join('\n'));
      await check.locator('[data-consult-check]').click();
      assert.match(await check.locator('.jc-check-result').innerText(),/同一段文字出現至少三次/);
      await check.locator('[data-consult-repair]').click();
      await check.locator('.jc-repair-status').filter({hasText:'已複製'}).waitFor();
      const repaired=await page.evaluate(real=>real?navigator.clipboard.readText():window.__consultClipboard.at(-1),variant==='liveclip');
      assert.ok(repaired.includes(currentQuestion)&&repaired.includes(repeated)&&repaired.includes('請直接對提問的人說話'));
      row.repairFromReply=true;
      await answer.fill(claim+extra);
      assert.equal(await check.locator('.jc-repair').isVisible(),false);
      const adjust=check.locator('.jc-correct');
      await adjust.locator('summary').click();
      const quote=adjust.locator('[data-consult-quote]'), clarification=adjust.locator('[data-consult-clarify]');
      await quote.fill('沒有出現在這份回答的原句。');await clarification.fill(actual);
      const correct=adjust.locator('[data-consult-correct]');await correct.click();
      assert.match(await adjust.locator('[role=status]').innerText(),/請從上方/);
      await quote.fill(claim);
      if(variant==='stop')await page.evaluate(()=>{navigator.clipboard.writeText=async()=>{throw Error('clipboard unavailable');};});
      await correct.focus();await correct.press('Enter');
      const manual=adjust.locator('[data-consult-manual]');
      let revision;
      if(variant==='stop'){
        await manual.waitFor({state:'visible'});revision=await manual.inputValue();
      }else{
        await adjust.locator('[role=status]').filter({hasText:'已複製'}).waitFor();
        revision=await page.evaluate(real=>real?navigator.clipboard.readText():window.__consultClipboard.at(-1),variant==='liveclip');
      }
      assert.ok(revision.includes(currentQuestion)&&revision.includes(claim)&&revision.includes(actual)&&!revision.includes(extra));
      if(variant==='intake')assert.ok(revision.includes('下次會議已留了五分鐘')&&revision.includes('我想先說明成果'));
      assert.equal(await page.evaluate(claim=>Object.values(localStorage).some(v=>v.includes(claim)),claim),false);
      if(variant==='intake'){
        await page.evaluate(()=>{navigator.clipboard.writeText=()=>new Promise((_,reject)=>{window.__rejectConsultCopy=reject;});});
        await correct.click();await page.waitForFunction(()=>typeof window.__rejectConsultCopy==='function');
      }
      await answer.fill('另一份回答。');
      if(variant==='intake'){
        await page.evaluate(()=>window.__rejectConsultCopy(Error('declined after editing')));
        await page.waitForFunction(()=>document.querySelector('[data-consult-manual]').hidden);
        assert.equal(await adjust.locator('[role=status]').textContent(),'','late clipboard rejection must not restore the older quote');
      }
      assert.equal(await quote.inputValue(),'');assert.equal(await clarification.inputValue(),'');assert.equal(await manual.inputValue(),'');
      row.personalCorrection=true;

      if(variant==='partial'||variant==='stop'){
        const details=await page.locator('.jy-consult:visible .jc-reading').innerText();
        assert(variant==='partial'?/時辰|未定盤/.test(details):/停止|未成立|中止|無效/.test(details),'partial branch exposes its evidence boundary');
        row.partial=true;
      }
    }
    assert.deepEqual(errors,[]);row.status='passed';
  }catch(e){
    row.error=e.message.split('\n').slice(0,7).join(' ');
    row.diagnostic=await page.evaluate(()=>{
      const all=[...document.querySelectorAll('button,input,textarea,select,summary')].filter(e=>e.checkVisibility?.({checkOpacity:true,checkVisibilityCSS:true})&&e.getBoundingClientRect().width>0&&!e.closest('[inert]'));
      return {labels:all.map(e=>(e.id||e.className||'')+':'+(e.innerText||e.getAttribute('aria-label')||'').trim().slice(0,20)).slice(-35),dialogs:[...document.querySelectorAll('[role=alert], [role=status], dialog[open]')].filter(x=>x.checkVisibility?.()&&x.textContent.trim()).map(x=>x.innerText.trim().slice(0,110)).slice(-7)};
    }).catch(()=>null);
  }finally{
    row.pageErrors=errors;fs.writeFileSync(path.join(artifacts,mode+'-'+kind+'.json'),JSON.stringify(row,null,2));console.log(kind,row.status,row.result,row.points||'',row.error||'');
    await c.close().catch(()=>{});
  }
  return row;
}
(async()=>{
  const chrome=process.env.JY_TEST_CHROMIUM;
  console.log('Test evidence:',artifacts);
  let failed=false;
  for(const kind of methods){
    const b=await chromium.launch({executablePath:chrome,args:['--disable-webgl','--no-sandbox','--disable-dev-shm-usage',...(chrome?['--single-process','--no-zygote','--in-process-gpu']:[])]});
    const result=await run(b,kind);if(result.status!=='passed')failed=true;await b.close().catch(()=>{});
  }
  process.exitCode=failed?1:0;
})().catch(e=>{console.error(e);process.exitCode=2;});
