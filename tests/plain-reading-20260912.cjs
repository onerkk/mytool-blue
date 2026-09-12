'use strict';
// Real builders, poisoned legacy product data, and method-preservation checks.
// No calls to external AI providers and no claims about predictive accuracy.
const fs=require('node:fs'),path=require('node:path'),Module=require('node:module');
const filename=path.join(__dirname,'divination-audit-20260908.cjs');
const append=String.raw`
let inventoryReads=0;
Object.defineProperty(c,'JYShopInventory',{configurable:true,get(){inventoryReads++;throw Error('Inventory must not be consulted');}});
const forbidden='SHOULD_NOT_EXPORT 白水晶手排／14mm／手圍16cm';
test('RWS and Book T prompts ignore stale inventory, preserve actual cards and prefer everyday language',()=>{
 for(const mode of ['rws_reversals','gd_book_t']){
  const actual=draw('three_card',mode),dataBefore=JSON.stringify(actual.payload.tarotData);
  assert.equal(actual.payload.shopRecommendation.mode,'needs_first');
  assert(!('allowedItems' in actual.payload.shopRecommendation));
  actual.payload.shopRecommendation={allowedItems:[forbidden],sourceFile:'legacy-stock.xlsx'};
  const prompt=c.JY_buildExportPrompt('tarot',actual.payload);
  assert(!prompt.includes(forbidden));assert(!prompt.includes('legacy-stock.xlsx'));assert(!prompt.includes('【可推薦庫存品項】'));
  for(const card of actual.payload.tarotData.cards)assert(prompt.includes(card.name));
  assert.equal(JSON.stringify(actual.payload.tarotData),dataBefore,'presentation must not mutate the cast');
  assert(prompt.includes('【白話優先】'));assert(prompt.includes('不先選商品再反推需求'));
  assert.equal((prompt.match(/https:\/\/shopee.tw\/a50h95648d\?tab=shop/g)||[]).length,1);
 }
 assert.equal(inventoryReads,0);
});
test('Five valid OOTK operations retain their record while recommendations do not read inventory',()=>{
 const old=c.Math.random;c.Math.random=()=>0.999999;
 try{c._ootkResults=c.ootkRunFull(35,'如何坦白表達需要？',{confirmedBeforeDeal:true,countDirection:'right',expectedPile:'water',primaryHouse:12,cognateHouse:7,expectedSign:11,expectedSephirah:5});}finally{c.Math.random=old;}
 const before=JSON.stringify(c._ootkResults),payload=c._buildOOTKPayload();
 assert.equal(payload.shopRecommendation.mode,'needs_first');assert.equal(inventoryReads,0);
 payload.shopRecommendation={allowedItems:[forbidden]};
 const prompt=c.JY_buildExportPrompt('ootk',payload);
 for(const n of ['第一次','第二次','第三次','第四次','第五次'])assert(prompt.includes(n+'操作'));
 assert(!prompt.includes(forbidden));assert(prompt.includes('【白話優先】'));
 assert.equal(JSON.stringify(c._ootkResults),before);
});
test('An invalid OOTK operation stays invalid and does not acquire a sales recommendation',()=>{
 const payload={mode:'ootk',question:'要怎麼溝通？',ootkData:{procedureStatus:{abandoned:true,abandonedAt:'op1'},divinationValidity:{valid:false},operations:{op1:{abandoned:true}}},shopRecommendation:{allowedItems:[forbidden]}};
 const prompt=c.JY_buildExportPrompt('ootk',payload);
 assert(prompt.includes('本輪不能提供'));assert(!prompt.includes(forbidden));assert(!prompt.includes('shopee.tw'));
});
test('Shared and standalone brand policies agree; no fixed gemstone or fabricated measurements are injected',()=>{
 const shared=c.JY_READING_QUALITY,policy=shared.recommendationPolicy();
 assert.equal(policy.mode,'needs_first');assert(!('allowedItems' in policy));assert(!('sourceFile' in policy));
 for(const kind of ['tarot','ootk','lenormand','bazi','compat','ziwei','meihua','oracle'])assert(shared.lines(kind).join('\n').includes('【白話優先】'));
 for(const spec of [b.JY_BAZI_PROMPT_ROOT,z.JY_ZIWEI_PROMPT_ROOT])assert(spec.brandTailLines().join('\n').includes(shared.recommendationText()));
 const fallback=runtime(['bazi-prompt-root','ziwei-prompt-root']).ctx;vm.runInContext('window.JY_READING_QUALITY=undefined;',fallback);
 for(const spec of [fallback.JY_BAZI_PROMPT_ROOT,fallback.JY_ZIWEI_PROMPT_ROOT]){
  assert(spec.brandTailLines().join('\n').includes(shared.recommendationText()));
  assert(spec.answerContractLines('single').join('\n').includes('【白話優先】'));
 }
 // The prompt also must avoid turning symbolic interpretation into a sales diagnosis.
 assert(policy.outputRule.includes('財務困難者先用已有物品'));
 assert(policy.outputRule.includes('不宣稱命盤能證明人體缺某種礦物'));
 assert(!/白水晶|粉晶|手圍16cm|14mm/.test(policy.outputRule));
});
test('Legacy API entry points send needs-first policy and do not attach catalogue candidates',()=>{
 const follow=actualFunction('JS/ai-analysis.js','_triggerTarotFollowUp');
 assert(!/JYShopInventory|allowedItems|payload\.crystalCatalog|_buildCrystalCatalog\(/.test(follow));
 assert(follow.includes('recommendationPolicy()'));assert(follow.includes('mode:"needs_first"'));
 const api=read('functions/api/ai.js');acorn.parse(api,{ecmaVersion:'latest',sourceType:'module'});
 assert(api.includes('【白話優先】'));assert(api.includes(sharedText()));
 assert(!api.includes('只從實際候選資料選品'));
 function sharedText(){return c.JY_READING_QUALITY.recommendationText();}
});
console.log('plain-reading: stock-independent exports and needs-first policy verified; no external-model claim.');
if(process.exitCode)process.exit(process.exitCode);
`;
const m=new Module(filename,module);m.filename=filename;m.paths=Module._nodeModulePaths(__dirname);
m._compile(fs.readFileSync(filename,'utf8')+append,filename);
