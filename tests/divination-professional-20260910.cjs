'use strict';
// Real routing/casting/export regressions. Offline: no AI response or prediction-quality claim.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),acorn=require('acorn');
const {environment}=require('./dom-fixture.cjs');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8'),plain=x=>JSON.parse(JSON.stringify(x));
const F=require('../JS/tarot-foundation.js');let passed=0;
function test(name,fn){try{fn();passed++;console.log('✓ '+name);}catch(e){process.exitCode=1;console.error('✗ '+name+'\n'+e.stack);}}
function runtime(files=[]){const e=environment();e.ctx.console={log(){},warn(){},error(){}};files.forEach(f=>vm.runInContext(read('JS/'+f+'.js'),e.ctx,{filename:f}));return e;}
function expose(ctx,file,body){vm.runInContext(read(file).replace(/\}\)\(\);\s*$/,body+'\n})();'),ctx,{filename:file});}
function actualFunction(file,name){const src=read(file);let result;function walk(n){if(!n||typeof n!=='object')return;if(n.type==='FunctionDeclaration'&&n.id?.name===name)result=src.slice(n.start,n.end);for(const v of Object.values(n)){if(Array.isArray(v))v.forEach(walk);else if(v&&typeof v==='object')walk(v);}}walk(acorn.parse(src,{ecmaVersion:'latest'}));assert(result,name);return result;}
const tarotCases=[
 ['他為什麼最近不主動找我了？我該先開口嗎？','relationship'],
 ['我跟她會走在一起嗎？為什麼？','relationship'],
 ['公司女工程師對我有意思嗎？','relationship'],
 ['她喜歡我還是只是禮貌？','relationship'],
 ['我想全面了解感情，不用五十四張牌','celtic_cross'],
 ['請不要用凱爾特十字，我該怎麼改善收入？','five_card'],
 ['我的訂單還有54張沒出貨，該怎麼辦？','five_card'],
 ['我今年21歲，想知道下一步該怎麼做？','five_card'],
 ['他何時會主動聯絡？我該做什麼？','celtic_cross'],
 ['我想知道他何時回覆？','timeline'],
 ['我應該選A公司、B公司還是創業？','celtic_cross'],
 ['我應該接受A公司的offer還是留在B公司？','either_or'],
 ['要不要主動聯絡他？','either_or'],
 ['我要選 A 還是 B？','either_or'],
 ['我想找回錢包，該從哪裡找起？','minor_arcana'],
 ['今年財運如何？','five_card'],
 ['今年工作收入為什麼不穩定？','five_card'],
 ['今年感情、工作、財運如何？','zodiac'],
 ['今年整體運勢如何？','zodiac'],
 ['我想分析我和她關係的完整全局','celtic_cross'],
 ['我想知道這件事我忽略了什麼，外在環境如何？','horseshoe'],
 ['這件事為什麼卡住？','cross'],
 ['為什麼我總是遇到同一種人？','tree_of_life'],
 ['我這個月的營業額能超過十萬元嗎？','five_card'],
 ['上次用凱爾特十字，這次只想問今天會收到訊息嗎？','three_card'],
 ['請用五十四張牌分析工作','mathers_horseshoe'],
 ['請用Mathers 二十一張分析工作','mathers_21'],
 ['不要用五十四張牌，請用三牌陣問這件事成不成？','three_card']
];
test('Tarot: 28 natural-language cases select the intended method without altering the question',()=>{
 for(const [q,id] of tarotCases){const r=F.routeQuestion(q);assert.equal(r.spreadId,id,q);assert(r.ready);assert(r.methodPlan.protocol.readingPlan.length>=3);assert.equal(r.methodPlan.id,id);assert(r.reason);}
 assert.equal(F.routeQuestion('').spreadId,null);
 const excluded=F.routeQuestion('不用五十四張牌，我想全面了解感情');assert(excluded.excludedMethods.includes('mathers_horseshoe'));
 const negative=F.compileQuestion('不是在問何時復合，而是他為什麼不回訊息？');assert(!negative.features.timing);
});
test('Tarot: comparison branches, multiple choices and missing capabilities remain honest',()=>{
 const r=F.routeQuestion('我應該接受A公司的offer還是留在B公司？');
 assert.equal(r.methodPlan.slots[1].binding.entity,'接受A公司的offer');assert.equal(r.methodPlan.slots[2].binding.entity,'留在B公司');
 const binary=F.routeQuestion('要不要主動聯絡他？');assert.equal(binary.methodPlan.slots[1].binding.entity,'主動聯絡他');assert(binary.methodPlan.slots[2].binding.entity.includes('暫不採取'));
 const many=F.routeQuestion('我應該選A公司、B公司還是創業？');assert(many.readingNotes.join('').includes('三個以上選項'));assert(!many.compiledQuestion.relations.some(x=>x.type==='alternative_comparison'));
 const limited=F.routeQuestion('他何時會主動聯絡？我該做什麼？');assert(!limited.coverage.complete);assert(limited.methodPlan.routingNotes.join('').includes('不新增牌位'));
 assert(!F.compileQuestion('她喜歡我還是只是禮貌？').relations.some(x=>x.type==='alternative_comparison'));
});
const t=runtime(['picker-core','tarot-foundation','golden-dawn-tarot','tarot','tarot-reading','tarot_upgrade','tarot-inventory']).ctx;
vm.runInContext('window.__defs=SPREAD_DEFS;window.__deck=TAROT;',t);
t._jyTarotQuestionText=()=>t.S.form.question;
vm.runInContext(actualFunction('JS/ai-analysis.js','_buildTarotOnlyPayload'),t);vm.runInContext(read('JS/prompt-export.js'),t);
test('Tarot: actual resolver → dynamic positions → draw → payload → exported guide agree',()=>{
 for(const [q,id] of tarotCases){
  t._forcedSpread=null;t.S.form={question:q};assert.equal(t.JY_resolveTarotSpread(q,'general'),id);
  const plan=t.S.tarot.methodPlan,def=t.S.tarot.dynamicSpreadDef;
  assert.equal(def.count,plan.count);assert.equal(def.positions.length,plan.count);
  t.S.tarot.drawn=t.JY_buildCanonicalTarotDraw(def.deckFilter==='minor_only'?t.__deck.filter(x=>x.suit!=='major'):t.__deck,id,def,'regression');
  const payload=t._buildTarotOnlyPayload(),prompt=t.JY_buildExportPrompt('tarot');assert.equal(payload.question,q);assert.equal(payload.tarotData.cards.length,plan.count);assert(prompt.includes(q));
  for(const step of plan.protocol.readingPlan)assert(prompt.includes(step),id+' reading step');
  for(const note of plan.routingNotes)assert(prompt.includes(note),id+' routing limit');
  assert(prompt.includes(plan.selectionReason));assert(prompt.includes('https://shopee.tw/a50h95648d?tab=shop'));assert(!prompt.includes('undefined'));
 }
 t._forcedSpread='three_card';t.S.form.question='他何時回覆？我該做什麼？';assert.equal(t.JY_resolveTarotSpread(t.S.form.question),'three_card');assert(t.S.tarot.methodPlan.routingNotes.length);
 t._forcedSpread=null;assert.equal(t.JY_resolveTarotSpread('今年感情、工作、財運如何？'),'zodiac');
});
test('Tarot: each of 14 spread protocols has its own concrete reading sequence',()=>{
 const ids=['three_card','five_card','cross','either_or','relationship','timeline','horseshoe','celtic_cross','tree_of_life','zodiac','minor_arcana','fifteen_card','mathers_21','mathers_horseshoe'];
 const plans=ids.map(id=>F.instantiateMethod(id,F.compileQuestion('如何前進？')).protocol);
 assert.equal(new Set(plans.map(p=>p.readingPlan.join('\n'))).size,14);
 assert(F.instantiateMethod('fifteen_card',F.compileQuestion('方向？')).protocol.readingPlan.join('').includes('五個三牌組'));
 assert(F.instantiateMethod('ootk',F.compileQuestion('方向？')).protocol.readingPlan.join('').includes('實際'));
});
const l=runtime();expose(l.ctx,'JS/lenormand.js',`window.lnTest={analyze:_lnAnalyzeQuestion,route:_lnDetectSpread,build:buildPrompt,cards:CARDS,spreads:SPREADS,links:_lnGrandExtraLinks,neighbors:_lnGrandImmediateNeighbors,lines:_lnGrandStraightLines,preview:_lnUpdateSpreadPreview,state:function(){return {spread:_lnResolved,auto:_lnAutoPick,cards:_lnDrawn,prompt:_lastPrompt};},set:function(id,q,sig){_lnSpread=id;_lnQuestion=q;_lnSignif=sig||null;_lnGender=null;_lnPhase='input';_lnDrawn=[];}};`);
const LN=l.ctx.lnTest;
const lenormandCases=[
 ['這份工作值得繼續嗎？','three'],['他會回覆嗎？','three'],
 ['他為什麼最近不主動找我了？我該先開口嗎？','nine'],
 ['我跟她會走在一起嗎？為什麼？','five'],['他何時會聯絡？我該做什麼？','nine'],
 ['她喜歡我還是只是禮貌？','five'],['她是不是很忙還是沒興趣？','five'],
 ['今年感情、工作、財運如何？','grand'],['今年整體運勢如何？','grand'],
 ['工作和主管的相處會順利嗎？','three'],['我的工作收入不穩，該怎麼辦？','five'],
 ['我應該留下還是離職？','choice'],['要不要主動聯絡他？','choice'],
 ['我應該接受A公司的offer還是留在B公司？','choice'],
 ['我應該選A公司、B公司還是創業？','nine'],
 ['我想分析這段感情的優勢、風險與下一步','nine'],
 ['不用九宮格，他何時會回訊息？','five'],
 ['我的訂單有36張，請用心幫我分析怎麼處理？','five'],
 ['請不要用大牌陣，今年感情、工作、財運如何？','nine'],
 ['不用九宮格，請用五張線分析我的工作','five'],
 ['請用大牌陣分析工作','grand'],['請用九宮格分析工作','nine'],
 ['請用三張線分析工作','three'],['上次用九宮格，這次他會回覆嗎？','three'],
 ['不是在問何時復合，而是他為什麼不回訊息？','five'],
 ['我想知道工作如何？感情運勢呢？','grand'],
 ['我應該留下還是？','five'],['A 還是 B？','choice']
];
test('Lenormand: 28 question cases distinguish focused lines, real branches, facets and panorama',()=>{
 for(const [q,id] of lenormandCases){const r=LN.route(q);assert.equal(r.id,id,q);assert.equal(LN.analyze(q).q,q);assert(r.why);}
 assert.equal(LN.route('').id,null);
 assert(!LN.analyze('她喜歡我還是只是禮貌？').isChoice);
 assert(!LN.analyze('我應該選A公司、B公司還是創業？').isChoice);
 assert(!LN.analyze('不是在問何時復合而是他為什麼不回訊息？').asksWhen);
});
test('Lenormand: actual auto/manual casting exports matching positions and complete cards',()=>{
 for(const [q,id] of lenormandCases){
  LN.set('auto',q);let input=l.doc.getElementById('ln-q');if(!input){input=l.doc.body.appendChild(new l.Element('textarea'));input.id='ln-q';}input.value=q;
  l.ctx._lnDoDraw();const state=LN.state();assert.equal(state.spread,id,q);assert.equal(state.cards.length,LN.spreads[id].count,q);assert.equal(new Set(state.cards.map(x=>x.id)).size,state.cards.length);assert(state.prompt.includes(q));assert(state.prompt.includes(state.auto.why));
  assert(state.prompt.includes('<牌陣模組 name="'+LN.spreads[id].name+'">'));assert(state.prompt.endsWith('願你諸事順遂。'));assert.equal((state.prompt.match(/https:\/\/shopee.tw\/a50h95648d\?tab=shop/g)||[]).length,1);
 }
 const q='今年感情、工作、財運如何？';LN.set('three',q);let input=l.doc.getElementById('ln-q');if(!input){input=l.doc.body.appendChild(new l.Element('textarea'));input.id='ln-q';}input.value=q;l.ctx._lnDoDraw();assert.equal(LN.state().cards.length,3);assert(LN.state().prompt.includes('僅按實際牌位解讀'));
});
test('Lenormand: methods cannot substitute tarot meanings or each other’s geometry',()=>{
 const texts={};for(const [id,sp] of Object.entries(LN.spreads))texts[id]=LN.build('如何推進？',LN.cards.slice(0,sp.count),id);
 assert(texts.three.includes('非相鄰鏡像：1↔3'));assert(!texts.three.includes('主盤鏡像與騎士步（'));
 assert(texts.five.includes('中心：3；非相鄰鏡像：1↔5、2↔4'));
 assert(texts.choice.includes('A路最大路徑：1.'));assert(texts.choice.includes('B路最大路徑：5.'));assert(texts.choice.includes('4不把兩路接成七張時間線'));
 assert(texts.nine.includes('八條線'));assert(texts.nine.includes('短斜鄰接2-4、2-6、4-8、6-8'));assert(texts.nine.includes('不預設過去／現在／未來'));
 assert(texts.grand.includes('固定宮位映射'));assert(texts.grand.includes('末排格33–36沒有主盤鏡像或騎士步'));
 for(const text of Object.values(texts)){assert(text.includes('不使用塔羅')||text.includes('雷諾曼不套用塔羅'));assert(text.includes('下一步'));assert(text.includes('不保證賣場一定有該推薦品類'));}
});
test('Lenormand: all 36 houses, 32 mirror positions and all knight moves are geometrically valid',()=>{
 const drawn=LN.cards.slice().reverse(),prompt=LN.build('全景？',drawn,'grand');
 for(let i=0;i<36;i++){
  assert(prompt.includes((i+1)+'. '+LN.cards[i].name+'宮 ← '+drawn[i].id+'.'+drawn[i].name));
  const extra=LN.links(i);
  if(i>=32){assert.equal(extra.horizontal,null);assert.equal(extra.vertical,null);assert.equal(extra.knights.length,0);assert(LN.neighbors(drawn,i).every(n=>n.index>=32));continue;}
  assert.equal(LN.links(extra.horizontal).horizontal,i);assert.equal(LN.links(extra.vertical).vertical,i);
  const expected=[];for(let j=0;j<32;j++){let dr=Math.abs(Math.floor(i/8)-Math.floor(j/8)),dc=Math.abs(i%8-j%8);if(dr*dc===2&&dr+dc===3)expected.push(j);}
  assert.deepEqual(plain(extra.knights).sort((a,b)=>a-b),expected);assert(LN.neighbors(drawn,i).every(n=>n.index<32));
 }
 assert.equal(LN.lines().length,30);
});
test('Lenormand: preset center is disclosed and optional focus never blocks a panorama',()=>{
 const q='今年感情、工作、財運如何？';LN.set('grand',q);let input=l.doc.getElementById('ln-q');if(!input){input=l.doc.body.appendChild(new l.Element('textarea'));input.id='ln-q';}input.value=q;l.ctx._lnDoDraw();assert.equal(LN.state().cards.length,36);assert(LN.state().prompt.includes('本人代表為未指定'));
 LN.set('nine','如何改善工作？',24);input=l.doc.getElementById('ln-q');if(!input){input=l.doc.body.appendChild(new l.Element('textarea'));input.id='ln-q';}input.value='如何改善工作？';l.ctx._lnDoDraw();const x=LN.state();assert.equal(x.cards[4].id,24);assert(x.cards[4]._presetSig);assert(x.prompt.includes('置中本身不是隨機徵兆'));
 const five=LN.build('如何改善？',LN.cards.slice(20,25),'five');assert(five.includes('若自然抽到'));assert(!five.includes('因此不參與本次牌句'));
});
test('Lenormand: preview updates with current question without changing a completed draw',()=>{
 let input=l.doc.getElementById('ln-q');if(!input){input=l.doc.body.appendChild(new l.Element('textarea'));input.id='ln-q';}
 let host=l.doc.getElementById('ln-spread-preview');if(!host){host=l.doc.body.appendChild(new l.Element('div'));host.id='ln-spread-preview';}
 LN.set('auto','');input.value='我應該留下還是離職？';LN.preview();assert(host.textContent.includes('雙路比較'));
 input.value='今年感情、工作、財運如何？';LN.preview();assert(host.textContent.includes('大牌陣'));assert.equal(LN.state().cards.length,0);
});
const b=runtime(['vendor/lunar','bazi-calendar-core','solar-location','bazi','bazi_upgrade','bazi-prompt-root','bazi-suite-core']).ctx;
test('Bazi: each lens and each role scenario injects its distinct guide into the actual export',()=>{
 const a=b.computeBazi(1983,8,25,14,0,'male'),c=b.computeBazi(1994,6,20,14,0,'female');b.enhanceBazi(a);b.enhanceBazi(c);
 for(const lens of Object.keys(b.BaziSuiteCore.lenses)){const p=b.BaziSuiteCore.buildSinglePrompt(lens,a,{},'如何改善？');for(const s of b.JY_BAZI_PROMPT_ROOT.lensGuideLines(lens))assert(p.includes(s),lens);assert(p.includes('不保證賣場一定有該推薦品類'));}
 for(const s of b.BaziSuiteCore.scenarios){const comp=b.BaziSuiteCore.createCompatibility(a,c,{scenarioId:s.id}),p=b.BaziSuiteCore.buildCompatibilityPrompt(comp,'如何相處？');for(const step of b.JY_BAZI_PROMPT_ROOT.scenarioGuideLines(s.id))assert(p.includes(step),s.id);}
 const pure=b.BaziSuiteCore.buildSinglePrompt('chart',a,{},'');assert(pure.includes('純排盤不輸出人生預言'));assert(!pure.includes('【依問題選用分析面向】'));
});
const m=runtime(['vendor/lunar','tarot','meihua_upgrade','meihua_output_layer','meihua_upgrade2']).ctx;
expose(m,'JS/meihua-standalone.js','window.mhTest=buildMeihuaPrompt;');vm.runInContext(read('JS/prompt-export.js'),m);
test('Meihua: both prompt paths preserve actual hexagrams, method boundaries and one shop ending',()=>{
 const hex=m.calcMH(1,1,1);hex.castContext={timestamp:'2026-02-04T12:00:00Z',method:'two_numbers'};hex.question='何時前進？';m.S={form:{question:hex.question},meihua:hex};
 for(const p of [m.mhTest(hex.question,hex),m.JY_buildExportPrompt('meihua')]){assert(p.includes(hex.ben.n));assert(p.includes(hex.hu.n));assert(p.includes(hex.bian.n));assert(p.includes('原體'));assert(p.includes('純乾／純坤'));assert(p.includes('不保證賣場一定有該推薦品類'));assert(p.includes('https://shopee.tw/a50h95648d?tab=shop'));assert(!p.includes('【分析深度】每個主要結論說明「本盤具體牌位'));assert(!p.includes('牌陣專屬結構'));assert(!p.includes('undefined'));}
 m.S.meihua={ben:hex.ben};assert.equal(m.JY_buildExportPrompt('meihua'),'');assert.equal(read('JS/meihua-standalone.js'),read('meihua-standalone.js'));
});
test('Follow-up: original RWS reversals and branch positions survive alongside separate Book T supplements',()=>{
 const ctx=runtime().ctx;vm.runInContext(actualFunction('JS/ai-analysis.js','_jyFollowupCardData'),ctx);
 const slot={label:'選項A的條件性走向',role:'branch_A_outcome',authority:'outcome',binding:{entity:'留任'}};
 const reversed={id:0,n:'愚者',readingMode:'rws_reversals',isUp:false};const before=JSON.stringify(reversed);
 const a=ctx._jyFollowupCardData(reversed,slot,'fallback');assert.equal(a.direction,'逆位');assert.equal(a.isUp,false);assert.equal(a.sourceProfile,'rws_reversals');assert.equal(a.position,slot.label);assert.equal(a.slotBinding.entity,'留任');assert.equal(JSON.stringify(reversed),before);
 assert.equal(ctx._jyFollowupCardData({id:1,n:'魔術師',readingMode:'rws_reversals'},slot).direction,'方向未記錄');
 const gd=ctx._jyFollowupCardData({id:2,n:'女祭司',sourceProfile:'gd_book_t',isUp:true},{},'補充1');assert.equal(gd.direction,'元素尊貴裁決');assert.equal(gd.isUp,true);
 const actual=actualFunction('JS/ai-analysis.js','_triggerTarotFollowUp');assert(actual.includes('_jyFollowupCardData(c,slot,posName)'));assert(actual.includes('methodGuide='));assert(actual.includes('methodPlan: (S.tarot&&S.tarot.methodPlan)||null'));assert(!actual.includes('var _isUp2 = c.isUp === true; return'));
});
test('The local API preserves its JSON contract with system-specific depth and honest brand constraints',()=>{
 const src=read('functions/api/ai.js');acorn.parse(src,{ecmaVersion:'latest',sourceType:'module'});
 for(const x of ['各方法深入解讀順序','西洋占星先','吠陀占星先','姓名學逐字','protocol.readingPlan','只回傳 JSON 物件','"answer"','"action"','"timing"','"honest_word"','https://shopee.tw/a50h95648d?tab=shop'])assert(src.includes(x),x);
});
console.log('professional-regression: '+passed+' groups passed; 56 routing cases plus real draw/export and geometry checks.');
if(process.exitCode)process.exit(process.exitCode);
