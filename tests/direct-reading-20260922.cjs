'use strict';
// Exercise assembled prompts and absent/stale-script fallbacks, not model prose.
// All API traffic below is mocked; no claim of external-model compliance.
const fs=require('node:fs'),path=require('node:path'),Module=require('node:module');
const filename=path.join(__dirname,'divination-audit-20260908.cjs');
const append=String.raw`
const guide=c.JY_READING_QUALITY,style=guide.plainText();
function checkDirect(prompt){
 assert.equal(prompt.split(style).length-1,1,'exactly one canonical output contract');
 assert(!/STALE_READING|逐句引用本次完整原詩|每條關鍵牌句先說主題|再完整解釋牌義選擇|一般小牌陣逐張用/.test(prompt),'legacy output checklist survived');
 assert(prompt.indexOf('選品規則不得影響')>prompt.indexOf(style),'selection follows the reading contract');
}
function checkFallback(ctx,build){
 const shared=ctx.JY_READING_QUALITY,expected=build();checkDirect(expected);
 try{
  for(const stale of [undefined,{...shared,readingVersion:'5.0.0',lines:()=>['STALE_READING'],methodLines:()=>['STALE_READING'],plainText:()=> 'STALE_READING'}]){
   ctx.JY_READING_QUALITY=stale;
   assert.equal(build(),expected,'absent/stale shared script must use the current snapshot');
  }
 }finally{ctx.JY_READING_QUALITY=shared;}
}
test('All tarot layouts use one output contract without changing cards, positions or reversals',()=>{
 for(const [id,def]of Object.entries(c.__defs)){
  if(!def.count)continue;
  for(const mode of id==='fifteen_card'?['gd_book_t']:['rws_reversals','gd_book_t']){
   const r=draw(id,mode),before=JSON.stringify(r.payload);
   checkFallback(c,()=>c.JY_buildExportPrompt('tarot',r.payload));
   assert.equal(JSON.stringify(r.payload),before);
  }
 }
});
test('Lenormand keeps real geometry and unbound people distinct across all layouts and fallbacks',()=>{
 for(const [id,sp]of Object.entries(l.__lnAudit.spreads)){
  if(!sp.count)continue;
  const cards=l.__lnAudit.cards.slice(0,sp.count),before=JSON.stringify(cards);
  checkFallback(l,()=>l.__lnAudit.build('公司同事與女友閨蜜，分別有交往機會嗎？',cards,id));
  assert.equal(JSON.stringify(cards),before);
 }
 const nine=l.__lnAudit.build('公司同事與女友閨蜜，分別有交往機會嗎？',l.__lnAudit.cards.slice(0,9),'nine');
 assert(nine.includes('不自行把不同線派給不同人物'));
 assert(!nine.includes('題意建議為'),'a routing suggestion must not turn into a reading caveat');
});
test('Every oracle poem preserves its full source while the response selects decisive verses',()=>{
 for(const lot of o.__oracleAudit.poems){
  const before=JSON.stringify(lot);
  checkFallback(o,()=>o.__oracleAudit.build(lot,'最近換工作的機會如何？'));
  assert.equal(JSON.stringify(lot),before);
  assert(o.__oracleAudit.build(lot,'請逐句詳解').includes('明確要求逐句詳解時才逐句展開'));
 }
});
test('Natal, compatibility, personality and hexagram builders share the same direct contract',()=>{
 for(const lens of Object.keys(b.BaziSuiteCore.lenses))if(lens!=='chart')checkFallback(b,()=>b.BaziSuiteCore.buildSinglePrompt(lens,a,{},'工作上真正卡在哪裡？'));
 const comp=b.BaziSuiteCore.createCompatibility(a,partner,{scenarioId:'marriage'});
 checkFallback(b,()=>b.BaziSuiteCore.buildCompatibilityPrompt(comp,'如何改善相處？'));
 const profile=b.BaziSuiteCore.buildPersonality(a,{});
 checkFallback(b,()=>b.BaziSuiteCore.buildPersonalityPrompt(profile,'適合怎樣的工作方式？'));
 checkFallback(z,()=>z.JY_ZIWEI_PROMPT_ROOT.composeHead()+'\n'+z.JY_ZIWEI_PROMPT_ROOT.composeTail());
 const cast=m.calcMH(2,3,1);cast.castContext={timestamp:'2026-09-22T04:00:00Z'};
 checkFallback(m,()=>m.__mhAudit.build('現在宜進還是宜守？',cast));
});
test('Selection has no second answer-style contract and cannot alter a finished reading',()=>{
 const policy=guide.recommendationPolicy('lenormand');
 assert.equal(policy.stage,'after_reading');assert.equal(policy.mayAlterReading,false);
 assert(!('answerStyle' in policy));assert(!policy.outputRule.includes(style));
});
(async()=>{
 const savedFetch=globalThis.fetch,captured=[];
 try{
  globalThis.fetch=async(url,options)=>{
   assert.equal(url,'https://api.anthropic.com/v1/messages');
   captured.push(JSON.parse(options.body));
   return new Response(JSON.stringify({content:[{type:'text',text:JSON.stringify({answer:'transport fixture',action:null,timing:null,honest_word:null})}],stop_reason:'end_turn'}));
  };
  const payload={question:'目前工作機會如何？',tarotData:{cards:[{name:'世界',direction:'正位',position:'現況'}]},readingGuide:{answerStyle:'STALE_READING',methods:{tarot:['STALE_READING']}}};
  for(const file of ['functions/api/ai.js','workers/ai-proxy.js']){
   const api=await import('data:text/javascript;base64,'+Buffer.from(read(file)).toString('base64'));
   const request=new Request('https://jingyue.uk/api/ai',{method:'POST',headers:{Origin:'https://jingyue.uk','Content-Type':'application/json'},body:JSON.stringify({payload,admin_token:'fixture-only'})});
   const env={ANTHROPIC_API_KEY:'fixture-only',ADMIN_TOKEN:'fixture-only'};
   const response=api.default?await api.default.fetch(request,env):await api.onRequest({request,env});
   assert.equal(response.status,200,file);
   const sent=captured.at(-1);
   checkDirect(sent.system);
   assert(!JSON.stringify(sent).includes('STALE_READING'),'old client instructions must not enter server messages');
   assert(sent.messages[0].content.includes('世界'));
   assert(sent.messages[0].content.includes('正位'));
  }
  assert.deepEqual(captured[0],captured[1],'Pages and generated Worker must send identical contracts');
  console.log('✓ Pages and standalone Worker send one contract and retain raw chart facts (mocked transport)');
 }catch(e){process.exitCode=1;console.error('✗ API direct-reading contract\n'+e.stack);}
 finally{globalThis.fetch=savedFetch;}
})();
`;
const m=new Module(filename,module);m.filename=filename;m.paths=Module._nodeModulePaths(__dirname);
m._compile(fs.readFileSync(filename,'utf8')+append,filename);
