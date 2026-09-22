'use strict';
// Exercise the actual copy/export builders. No external AI responses are fabricated.
const fs=require('node:fs'),path=require('node:path'),Module=require('node:module');
const filename=path.join(__dirname,'divination-audit-20260908.cjs');
const append=String.raw`
const beforeRecommendation=passed,examples={},selectionGuide=c.JY_READING_QUALITY;
const shop='https://shopee.tw/a50h95648d?tab=shop';
const business='我經營水晶、天鐵與龍宮舍利，應如何安排銷售方向？我偏好綠色、日常常碰撞手腕。';
function checkRecommendation(prompt,kind){
 const marker=prompt.indexOf('【從解讀到適合你的配戴選擇】');
 assert(marker>=0,kind+' missing recommendation workflow');
 assert(prompt.includes(selectionGuide.recommendationText(kind)),kind+' wrong method branch');
 assert(prompt.includes('利於銷售某類商品不等於本人適合佩戴該材質'));
 assert(prompt.includes('二至三句'));assert(prompt.includes('有理由的主推薦'));
 assert.equal(prompt.split(shop).length-1,1,kind+' duplicate shop URL');
 assert(prompt.indexOf(shop)>marker,kind+' invitation must follow selection');
 assert.equal(prompt.trim().split('\n').at(-1),'願你諸事順遂。',kind+' footer order');
 assert(!prompt.includes('[object Object]'));assert(!prompt.includes('需要時依已說清楚的生活需求'));
 assert(prompt.includes('規則版本 '+selectionGuide.version),kind+' missing current version');
 assert(!prompt.includes('STALE_RECOMMENDATION'),kind+' accepted stale instructions');
}
function staleGuide(base,version){return {...base,version,recommendationText:()=> 'STALE_RECOMMENDATION',recommendationEnding:()=> 'STALE_RECOMMENDATION',recommendationPolicy:()=>({version,outputRule:'STALE_RECOMMENDATION'})};}
test('Each reading method receives a different evidence path, with selection before invitation',()=>{
 for(const kind of ['bazi','compat','personality','chart','ziwei','astro','vedic','tarot','ootk','lenormand','meihua','oracle','name']){
  const p=c.JY_READING_QUALITY.recommendationPolicy(kind);
  assert.equal(p.requiredForValidReading,true);assert.equal(p.mode,'needs_first');
  assert(!('allowedItems' in p));assert(!('crystalRec' in p));checkRecommendation(p.outputRule,kind);
 }
 assert(c.JY_READING_QUALITY.recommendationText('vedic').includes('功能吉凶'));
 assert(c.JY_READING_QUALITY.recommendationText('astro').includes('西洋尊貴也不直接套印度行星寶石表'));
 assert(c.JY_READING_QUALITY.recommendationText('ziwei').includes('五行局是排盤參數'));
 assert(c.JY_READING_QUALITY.recommendationText('lenormand').includes('月亮不是必選月光石'));
});
test('All Tarot layouts preserve exact casts while using the method-specific recommendation',()=>{
 const ids=Object.keys(c.__defs).filter(id=>c.__defs[id].count>0);
 for(const id of ids){const r=draw(id,id==='fifteen_card'?'gd_book_t':'rws_reversals'),before=JSON.stringify(r.payload.tarotData);checkRecommendation(c.JY_buildExportPrompt('tarot',r.payload),'tarot');assert.equal(JSON.stringify(r.payload.tarotData),before);}
});
test('Bazi lenses, compatibility roles and both personality APIs use their own selection basis',()=>{
 for(const lens of Object.keys(b.BaziSuiteCore.lenses)){
  const before=JSON.stringify(a),p=b.BaziSuiteCore.buildSinglePrompt(lens,a,{},business);
  checkRecommendation(p,lens==='chart'?'chart':'bazi');assert.equal(JSON.stringify(a),before);if(lens==='general')examples.bazi=p;
 }
 for(const s of b.BaziSuiteCore.scenarios){
  const comp=b.BaziSuiteCore.createCompatibility(a,partner,{scenarioId:s.id,metaA:{name:'A'},metaB:{name:'B'}}),before=JSON.stringify(comp);
  const p=b.BaziSuiteCore.buildCompatibilityPrompt(comp,business);checkRecommendation(p,'compat');assert.equal(JSON.stringify(comp),before);assert(p.includes(s.roleA)&&p.includes(s.roleB));
 }
 const profile=b.BaziSuiteCore.buildPersonality(a,{});
 checkRecommendation(b.BaziSuiteCore.buildPersonalityPrompt(profile,business),'personality');
});
test('All Lenormand layouts and all 60 poems include justified selection, preserving original data',()=>{
 for(const id of Object.keys(l.__lnAudit.spreads)){const sp=l.JYLenormand.instantiate(id,business);if(!sp.count)continue;const cards=l.__lnAudit.cards.slice(0,sp.count),before=JSON.stringify(cards);checkRecommendation(l.__lnAudit.build(business,cards,id),'lenormand');assert.equal(JSON.stringify(cards),before);}
 const cards=[4,33,32].map(id=>l.__lnAudit.cards.find(x=>x.id===id));examples.lenormand=l.__lnAudit.build('公司異性女工程師她單身嗎？',cards,'three');assert(examples.lenormand.includes('1.房屋→2.鑰匙→3.月亮'));
 for(const lot of o.__oracleAudit.poems){const before=JSON.stringify(lot);checkRecommendation(o.__oracleAudit.build(lot,business),'oracle');assert.equal(JSON.stringify(lot),before);}
});
test('Meihua standalone and generic exports keep the same casting facts and selection basis',()=>{
 const cast=m.calcMH(2,3,1);cast.castContext={timestamp:'2026-09-14T04:00:00Z'};const before=JSON.stringify(cast);
 checkRecommendation(m.__mhAudit.build(business,cast),'meihua');assert.equal(JSON.stringify(cast),before);
 c.S.meihua=cast;c.S.form={question:business};checkRecommendation(c.JY_buildExportPrompt('meihua'),'meihua');
});
test('Stopped Key cannot turn a failed validation into an accessory remedy',()=>{
 const payload={mode:'ootk',question:business,ootkData:{procedureStatus:{abandoned:true,abandonedAt:'op1'},divinationValidity:{valid:false},operations:{op1:{abandoned:true}}}};
 const p=c.JY_buildExportPrompt('ootk',payload);assert(!p.includes(shop));assert(!p.includes('【材質參考'));assert(p.includes('本輪不能提供'));
});
test('Crystal/iron/ritual material choices carry actual distinctions, not scored product slots',()=>{
 const p=c.JY_READING_QUALITY.recommendationText('bazi');
 for(const str of ['月光石硬度6–6.5','韌性較差','碧璽硬度7–7.5','鐵鎳金屬','藏式天鐵／托查','本次沒有具體商品鑑別報告','鎳過敏','日後參考','使用者明確拒絕選品','不等於本人適合佩戴'])assert(p.includes(str),str);
 assert(p.includes('未確認的模型候選先比較根據'));
 assert(!p.includes('先完成原問句。需要時'));
 const both=c.JY_READING_QUALITY.recommendationText(['vedic','astro','vedic']);assert.equal(both.split('採P.V.R.').length-1,1);
});
test('Standalone recommendation snapshots survive absent, v3 and earlier v4 shared scripts',()=>{
 for(const [ctx,spec,kind]of [[b,b.JY_BAZI_PROMPT_ROOT,'bazi'],[z,z.JY_ZIWEI_PROMPT_ROOT,'ziwei']]){
  const guide=ctx.JY_READING_QUALITY,expected=spec.brandTailLines().join('\n');
  try{for(const fallback of [undefined,...['3.0.0','4.0.0','4.1.0','4.2.0'].map(v=>staleGuide(guide,v))]){ctx.JY_READING_QUALITY=fallback;assert.equal(spec.brandTailLines().join('\n'),expected);}}finally{ctx.JY_READING_QUALITY=guide;}
 }
});
test('Vedic and Western every topic and unknown-time chart keep native calculations in recommendation exports',()=>{
 const x={Date,Intl,console};x.globalThis=x;vm.createContext(x);
 for(const file of ['reading-quality','vendor/astronomy-engine-2.1.19.min','vedic-ayanamsa','astro-time','vedic-engine','vedic-prompt','western-engine','western-prompt'])vm.runInContext(read('JS/'+file+'.js'),x,{filename:file});
 const input={utc:'1983-08-25T06:55:00Z',reference:'2026-09-14T04:00:00Z',latitude:25.03,longitude:121.56,civil:{date:'1983-08-25',time:'14:55',timezone:'Asia/Taipei'}};
 for(const unknownTime of [false,true]){
  const data={...input,unknownTime,houseSystem:'P'},vc=x.JYVedic.compute(data),wc=x.JYWestern.compute(data);
  for(const [kind,chart,topics,builder]of [['vedic',vc,x.JYVedicPrompt.topics,(t)=>x.JYVedicPrompt.build(business,vc,t)],['astro',wc,x.JYWesternPrompt.TOPICS,(t)=>x.JYWesternPrompt.build(wc,{question:business,topic:t})]]){
   const before=JSON.stringify(chart);
   for(const topic of Object.keys(topics)){const p=builder(topic);checkRecommendation(p,kind);assert(p.includes(business));assert(p.includes(new Date(input.utc).toISOString()));if(!unknownTime&&topic==='wealth')examples[kind]=p;}
   assert.equal(JSON.stringify(chart),before);
   const shared=x.JY_READING_QUALITY,expected=builder('bracelet');
   for(const fallback of [undefined,...['3.0.0','4.0.0','4.1.0','4.2.0'].map(v=>staleGuide(shared,v))]){x.JY_READING_QUALITY=fallback;assert.equal(builder('bracelet'),expected);}
   x.JY_READING_QUALITY=shared;
  }
 }
});
test('Tarot, Key, Lenormand, oracle and Meihua use current snapshots when v4.1 is still loaded',()=>{
 const apiBlock=read('JS/ai-analysis.js').match(/\/\/ BEGIN GENERATED RECOMMENDATION JY_REC_API\n[\s\S]*?\/\/ END GENERATED RECOMMENDATION JY_REC_API/)[0];
 vm.runInContext(apiBlock,c);
 const r=draw('three_card'),before=JSON.stringify(r.cards);
 const md=c.ootkRunFull(35,business,{procedureProfile:'mathers_continuous',confirmedBeforeDeal:true,countDirection:'left'});
 const savedOotk=c._ootkResults;
 c._ootkResults=md;
 const keyPayload=c._buildOOTKPayload();
 assert(keyPayload.ootkData,'Key fixture must have actual data');
 const lmCards=l.__lnAudit.cards.slice(0,3),lot=o.__oracleAudit.poems[0],cast=m.calcMH(2,3,1);
 const checks=[
  [c,()=>c._buildTarotOnlyPayload().shopRecommendation.outputRule,'tarot'],
  [c,()=>c.JY_buildExportPrompt('tarot',r.payload),'tarot'],
  [c,()=>c._buildOOTKPayload().shopRecommendation.outputRule,'ootk'],
  [c,()=>c.JY_buildExportPrompt('ootk',keyPayload),'ootk'],
  [l,()=>l.__lnAudit.build(business,lmCards,'three'),'lenormand'],
  [o,()=>o.__oracleAudit.build(lot,business),'oracle'],
  [m,()=>m.__mhAudit.build(business,cast),'meihua']
 ];
 try{for(const [ctx,build,kind]of checks){const current=ctx.JY_READING_QUALITY;try{for(const v of ['4.0.0','4.1.0','4.2.0']){ctx.JY_READING_QUALITY=staleGuide(current,v);checkRecommendation(build(),kind);}}finally{ctx.JY_READING_QUALITY=current;}}}
 finally{c._ootkResults=savedOotk;}
 assert.equal(JSON.stringify(r.cards),before,'fallback must not redraw');
});
test('Selection guidance has no named default, demands discriminating evidence and preserves explicit choices',()=>{
 for(const kind of selectionGuide.methodKinds()){
  const rules=selectionGuide.recommendationText(kind);
  assert(!rules.includes('紫水晶'),'general guidance must not prime the reported default');
  assert(!rules.includes('amethyst-care-cleaning'));
  assert(rules.includes('正文一處可核對'));
  assert(rules.includes('正文只寫主選理由'));
  assert(rules.includes('欠缺區分條件'));
  assert(rules.includes('相同有效依據可以再次選同一材質'));
 }
 const cases=[
  '我喜歡紫色，手上已有紫水晶。依這個命盤，是否繼續佩戴？',
  '我喜歡金屬外觀，想比較天鐵與水晶，但我有鎳接觸過敏。',
  '我收藏龍宮舍利，喜歡實物的綠色紋理；本次取用適合這個色系嗎？',
  '本次只問如何改善公司溝通，沒有提供顏色、材質偏好。'
 ];
 const before=JSON.stringify(a);
 for(const q of cases){const p=b.BaziSuiteCore.buildSinglePrompt('general',a,{},q);assert(p.includes(q));checkRecommendation(p,'bazi');}
 assert.equal(JSON.stringify(a),before,'question changes must not rewrite natal facts');
 const r=draw('three_card');
 const ownBazi=c.S.bazi;
 try{c.S.bazi={unrelatedOwner:'OTHER_PERSON_NATAL_SENTINEL',fav:['火']};const p=c._buildTarotOnlyPayload();assert(!JSON.stringify(p).includes('OTHER_PERSON_NATAL_SENTINEL'));assert(!('crystalCatalog' in p));assert(!('energyRecommendation' in p));assert(!('crystalRec' in p));}
 finally{c.S.bazi=ownBazi;}
});
if(process.env.JY_RECOMMEND_OUTPUT){fs.mkdirSync(process.env.JY_RECOMMEND_OUTPUT,{recursive:true});for(const [name,prompt]of Object.entries(examples))fs.writeFileSync(path.join(process.env.JY_RECOMMEND_OUTPUT,name+'-prompt.txt'),prompt);}
console.log('recommendation-20260914: '+(passed-beforeRecommendation)+' groups passed; actual exports, no external-model compliance claim.');
if(process.exitCode)process.exit(process.exitCode);
`;
const m=new Module(filename,module);m.filename=filename;m.paths=Module._nodeModulePaths(__dirname);
m._compile(fs.readFileSync(filename,'utf8')+append,filename);
