'use strict';
// Actual native builders, not hand-built prompt strings. No external AI calls.
const fs=require('node:fs'),path=require('node:path'),Module=require('node:module');
const filename=path.join(__dirname,'divination-audit-20260908.cjs');
const append=String.raw`
const integrationStart=passed,seen=new Set(),outputs={};
const currentQuestion='我現任有躁鬱症，近期不穩定，我該如何幫助？';
function checkWorkflow(text,kind,q=currentQuestion){
 const marker='【本題作答任務｜資料讀完後依此成稿】',i=text.lastIndexOf(marker);
 assert(i>0,kind+' actual export did not finish with its answer task');
 assert.equal(text.split(marker).length-1,1,kind+' duplicated workflow');
 assert(text.includes('原問句（原文資料）：'+JSON.stringify(q)),kind+' changed the question');
 if(q===currentQuestion){assert(text.slice(i).includes('及早聯絡原精神科團隊'));assert(text.slice(i).includes('第一段直接給最值得先做'));}
 assert(text.endsWith(c.JYReadingWorkflow.footer),kind+' lost exact linked footer');
 assert(!/undefined|NaN|\[object Object\]/.test(text),kind+' invalid serialized value');
 seen.add(kind);outputs[kind]=text;
}
test('Real tarot, completed OOTK, Meihua and all sixty oracle exports carry the original answer task',()=>{
 const r=draw('five_card');r.payload.question=currentQuestion;const before=JSON.stringify(r.payload);
 checkWorkflow(c.JY_buildExportPrompt('tarot',r.payload),'tarot');assert.equal(JSON.stringify(r.payload),before);
 const random=c.Math.random;c.Math.random=()=>0.999999;
 try{c._ootkResults=c.ootkRunFull(35,currentQuestion,{confirmedBeforeDeal:true,countDirection:'right',expectedPile:'water',primaryHouse:12,cognateHouse:7,expectedSign:11,expectedSephirah:5});}finally{c.Math.random=random;}
 const key=c._buildOOTKPayload();assert(key.ootkData&&!key.ootkData.procedureStatus.abandoned,'fixture must complete the Key');
 checkWorkflow(c.JY_buildExportPrompt('ootk',key),'ootk');
 const cast=m.calcMH(2,3,1);cast.castContext={timestamp:'2026-09-24T04:00:00Z'};
 checkWorkflow(m.__mhAudit.build(currentQuestion,cast),'meihua');
 for(const lot of o.__oracleAudit.poems){const p=o.__oracleAudit.build(lot,currentQuestion);checkWorkflow(p,'oracle');assert.equal(p,o.__oracleAudit.last());}
});
test('User five-card case retains its entire real line and rejects ID/name/meaning mismatches',()=>{
 const cards=[33,12,1,6,28].map(id=>l.__lnAudit.cards.find(x=>x.id===id));
 const before=JSON.stringify(cards),p=l.__lnAudit.build(currentQuestion,cards,'five');checkWorkflow(p,'lenormand');
 assert(p.includes('1.鑰匙→2.鳥→3.騎士→4.雲→5.紳士'));assert.equal(JSON.stringify(cards),before);
 for(const field of ['name','en','key','scope','guard']){
  const broken=cards.map(x=>({...x}));broken[0][field]='WRONG_CARD_FACT';
  assert.throws(()=>l.__lnAudit.build(currentQuestion,broken,'five'),/牌號、牌名或牌義/);
 }
});
test('All Bazi lenses, compatibility scenarios and personality include facts before answer instructions',()=>{
 for(const lens of Object.keys(b.BaziSuiteCore.lenses))checkWorkflow(b.BaziSuiteCore.buildSinglePrompt(lens,a,{},currentQuestion),'bazi');
 for(const scenario of b.BaziSuiteCore.scenarios){
  const comp=b.BaziSuiteCore.createCompatibility(a,partner,{scenarioId:scenario.id,metaA:{name:'A'},metaB:{name:'B'}}),before=JSON.stringify(comp);
  checkWorkflow(b.BaziSuiteCore.buildCompatibilityPrompt(comp,currentQuestion),'compat');assert.equal(JSON.stringify(comp),before);
 }
 const profile=b.BaziSuiteCore.buildPersonality(a,{}),p=b.BaziSuiteCore.buildPersonalityPrompt(profile,currentQuestion);
 checkWorkflow(p,'personality');assert(p.includes('【人格原局依據】'));assert(p.includes('藏干'));assert(p.includes('月令格局候選'));
 const partial=b.BaziSuiteCore.buildPersonality(a,{unknown:true}),u=b.BaziSuiteCore.buildPersonalityPrompt(partial,currentQuestion);
 assert(partial.provisional);assert(u.includes('年柱')&&u.includes('月柱')&&u.includes('日柱'));
 assert(!/時柱[：\s]+癸未|時柱癸未|時柱：/.test(u));assert(!u.includes('月令格局候選'));
});
test('Native Western, Vedic, six-line and Yijing calculations are unchanged by the workflow',()=>{
 const x={Date,Intl,console};x.globalThis=x;vm.createContext(x);
 for(const f of ['reading-quality','vendor/astronomy-engine-2.1.19.min','vedic-ayanamsa','astro-time','vedic-engine','vedic-prompt','western-engine','western-prompt','vendor/lunar','bazi-calendar-core','liuyao-core','yijing-data','yijing-core','gua-prompt'])vm.runInContext(read('JS/'+f+'.js'),x,{filename:f});
 const data={utc:'1983-08-25T06:55:00Z',reference:'2026-09-24T04:00:00Z',latitude:22.99,longitude:120.23,civil:{date:'1983-08-25',time:'14:55',timezone:'Asia/Taipei'},houseSystem:'P'};
 for(const unknownTime of [false,true]){
  const v=x.JYVedic.compute({...data,unknownTime}),w=x.JYWestern.compute({...data,unknownTime}),before=JSON.stringify([v,w]);
  checkWorkflow(x.JYVedicPrompt.build(currentQuestion,v,'relationship'),'vedic');
  checkWorkflow(x.JYWesternPrompt.build(w,{question:currentQuestion,topic:'relationship'}),'astro');
  assert.equal(JSON.stringify([v,w]),before);
 }
 const calendar=x.JYLiuyaoCore.calendar({year:2026,month:9,day:24,hour:12,timezoneOffset:8});
 for(const [kind,engine]of [['liuyao',x.JYLiuyaoCore],['yijing',x.JYYijingCore]]){
  const cast=engine.calculate({values:[9,7,9,6,7,6],calendar,question:currentQuestion}),before=JSON.stringify(cast);
  checkWorkflow(x.JYGuaPrompt.build(cast),kind);assert.equal(JSON.stringify(cast),before);
 }
});
test('Actual composite name and Ziwei exports retain natal evidence and do not call paid APIs',()=>{
 const env=runtime([]),x=env.ctx;x.Image=function(){return env.doc.createElement('img');};
 for(const f of ['vendor/lunar','bazi-calendar-core','solar-location','bazi','bazi_upgrade','picker-core','tarot-foundation','golden-dawn-tarot','tarot','tarot-reading','tarot_upgrade','meihua_upgrade','meihua_output_layer','meihua_upgrade2','ai-analysis','ziwei','ziwei-prompt-root','ziwei-standalone','bazi-prompt-root','bazi-standalone','bazi-suite-core','prompt-export'])vm.runInContext(read('JS/'+f+'.js'),x,{filename:f});
 let outbound=0;x.fetch=()=>{outbound++;throw Error('Unexpected network');};
 x.S.form={bdate:'1983-08-25',btime:'14:55',gender:'male',name:'王小明',question:currentQuestion,type:'general'};
 const chart=x.computeZiwei(1983,8,25,14,'male',{referenceDate:'2026-09-24T04:50:03.960Z'});
 checkWorkflow(x._ziweiBuildPrompt(chart,x.S.form),'ziwei');
 x.S.nameResult=x.analyzeName('王小明');assert(x.S.nameResult);x.S.bazi=null;x.S.ziwei=null;x.S.tarot={};x.S.meihua=null;
 const q='王小明這個名字如何用於日常自我介紹？';x.S.form.question=q;
 const p=x.JY_buildFullExportPrompt();checkWorkflow(p,'name',q);
 assert(p.includes('【姓名學本次資料】'));assert(p.includes('strokes')||p.includes('每字筆畫'),'Name facts must include actual strokes');
 assert.equal(outbound,0);
});
assert.deepEqual([...seen].sort(),Array.from(c.JYReadingWorkflow.methods).sort(),'Every active method must pass its actual native builder');
if(process.env.JY_WORKFLOW_OUTPUT){fs.mkdirSync(process.env.JY_WORKFLOW_OUTPUT,{recursive:true});for(const [kind,p]of Object.entries(outputs))fs.writeFileSync(path.join(process.env.JY_WORKFLOW_OUTPUT,kind+'.txt'),p);}
console.log('reading-workflow-integration: '+(passed-integrationStart)+'/5 groups; '+seen.size+' native methods; no external-model answers evaluated.');
if(process.exitCode)process.exit(process.exitCode);
`;
const runner=new Module(filename,module);runner.filename=filename;runner.paths=Module._nodeModulePaths(__dirname);
runner._compile(fs.readFileSync(filename,'utf8')+append,filename);
