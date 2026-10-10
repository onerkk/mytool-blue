'use strict';
// Real engine -> payload -> native reader -> copy/export -> retained API.
// Upstream API responses are mocked; this is not an LLM-quality or accuracy test.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),acorn=require('acorn');
const {fixture,load}=require('./ritual-lifecycle-20260911.cjs');
const ROOT=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(ROOT,f),'utf8'),plain=x=>JSON.parse(JSON.stringify(x));
const QUESTIONS=['她到底怎麼看我？','主管現在怎麼評價我？','我的副業接下來會怎麼發展？','我該離職還是留下？','這件事最後會成功嗎？','對方為什麼最近對我變冷？','目前這個專案最大的問題在哪？'];
function functionSource(file,name){const s=read(file);let found;function visit(n){if(!n||typeof n!=='object')return;if(n.type==='FunctionDeclaration'&&n.id?.name===name)found=s.slice(n.start,n.end);for(const x of Object.values(n))if(Array.isArray(x))x.forEach(visit);else if(x&&typeof x==='object')visit(x);}visit(acorn.parse(s,{ecmaVersion:'latest'}));assert(found);return found;}
function environment(){
 const e=fixture(),c=e.ctx;c.console={log(){},warn(){},error(){}};
 ['reading-quality','reading-workflow','native-depth-contract','native-card-analysis','engine-computation-audit','native-rule-sources','native-chart-analysis','picker-core','tarot-foundation','golden-dawn-tarot','tarot-semantic-engine','tarot','tarot-reading','tarot_upgrade','prompt-brief','prompt-packet','prompt-export'].forEach(f=>load(e,f));
 vm.runInContext(functionSource('JS/ai-analysis.js','_buildOOTKPayload'),c);c.__deck=vm.runInContext('TAROT',c);c.S.form={type:'general',question:QUESTIONS[0]};c._jyTarotQuestionText=()=>c.S.form.question;
 e.cast=(seed=10,question=QUESTIONS[0],sig=35)=>{let state=seed>>>0,orientationState=(seed^0xa5a5a5a5)>>>0;c.crypto={getRandomValues(a){for(let i=0;i<a.length;i++){orientationState=(Math.imul(orientationState,1664525)+1013904223)>>>0;a[i]=orientationState;}return a;}};c._secInt=max=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return Math.floor(state/4294967296*max);};c.S.form.question=question;c._ootkResults=c.ootkRunFull(sig,question,{confirmedBeforeDeal:true,countDirection:'right'});return c._buildOOTKPayload();};
 return e;
}
const e=environment(),c=e.ctx,P=c.JYPromptPacket,results=[],cases=[];
function test(name,fn){fn();results.push({name,status:'passed'});console.log('PASS '+name);}
function block(text,label){const marker='【'+label+'】\n',start=text.indexOf(marker);assert(start>=0,label);const value=text.slice(start+marker.length).split('\n')[0];return JSON.parse(value);}
function unpack(text){const p=P.get(text);assert(p);assert.equal(p.parts.map(part=>part.split('【本段內容開始】\n')[1].split('\n【本段內容結束】')[0]).join(''),text);return p;}
function sampleAnswer(generic=false){const answer=[
 '盤面最支持的方向是條件可推進，但仍受外部安排牽制；這是方向性推論。',
 '第一輪\n新增判斷：起步條件待整合。支持依據來自本輪落域及計數，反證是可用資源仍受限制。',
 '第二輪\n新增判斷：推進需調整接觸方式。計數及配對支持逐步交流，但限制來自溝通落差，修正前輪的直接推進假設。',
 '第三輪\n新增判斷：制度條件比速度重要。支持依據是落域及尊貴作用，反證是未完成的規範安排，承接前輪互動並降低短期成事信心。',
 '第四輪\n新增判斷：三十六張環牌的計數主線呈現投入到轉折的故事；配對顯示資源與消耗並存，元素尊貴調節其力度，多數只描述背景。支持鏈與最強反證不能按吉凶張数投票，修正前輪過度樂觀的進度預期。',
 '第五輪\n新增判斷：最終收斂為有條件的可持續結果。支持依據是生命樹落點及完整計數配對，反證是仍未解除的承接阻力，承接前輪需要調整投入的結論。',
 '最可能傾向：條件補齊後逐步推進。次可能傾向：條件不變便維持停滯。最強支持鏈：落域與發展方式能互相承接。最強反證：最後仍有資源阻力。成立條件：完成必要安排。推翻條件：若實際互動顯示拒絕或投入無法承接，應改判。時間：本盤沒有實算時間窗，不能給曆日。可執行行動：先確認一項安排。已知／推論／未知：已知是牌面程序，方向是推論，現實事件未知。信心來自不同作用收斂，角色歸屬不明仍降低確定度。'
 ];if(generic)return answer.join('\n\n');const payload=c._buildOOTKPayload(),d=c.JYNativeCards.ootk(payload);return answer.map(text=>{const i='一二三四五'.indexOf(text[1]),entry=d.operations[i];if(!/^第[一二三四五]輪/.test(text)||!entry)return text;const op=entry.data,names=op.countingPath.map(n=>op.activeCards.find(p=>p.id===n.cardId)?.name).filter(Boolean),pair=op.pairs[0];return text+'\n本輪實際計數節點：'+names.join('→')+'；配對：'+(pair?pair.left.name+'／'+pair.right.name:'本輪未提供')+'。代表牌'+payload.ootkData.significator.name+'的狀態須依本輪位置、面向與尊貴閱讀，倒置不作RWS負面票數。';}).join('\n\n');}
test('A-G actual casts preserve every round, question, role, count, pair, dignity and exact optional chunks',()=>{
 let previous;
 for(const question of QUESTIONS){
  const payload=e.cast(39,question),before=JSON.stringify(payload),castBefore=JSON.stringify(c._ootkResults),text=c.JY_buildExportPrompt('ootk',payload),packet=unpack(text),native=c.JYNativeAnalysis.analyze('ootk',payload);
  assert.equal(native.methodData.integrity.status,'complete');assert.equal(native.depthContract.version,'20261005depth16');assert.equal(native.depthContract.status,'ready-for-scoped-reading');
  assert.equal(JSON.stringify(payload),before);assert.equal(JSON.stringify(c._ootkResults),castBefore);assert(text.includes(JSON.stringify(question)));assert(!/〔同項\d+〕|\$ref|\$table|\[object Object\]|undefined|NaN/.test(text));
  assert(text.includes('【OOTK五輪資料結束與完整性核對】'));assert(text.indexOf('【OOTK五輪資料結束與完整性核對】')<text.lastIndexOf('【資料結束】'));
  const contract=block(text,'OOTK成稿契約');assert.deepEqual(contract.expectedLayers,['op1','op2','op3','op4','op5']);assert.equal(contract.requiredSections.length,11);
  const context=block(text,'本次程序版本、代表牌與發牌前綁定');assert.deepEqual(context.significator,plain(payload.ootkData.significator));assert.deepEqual(context.methodRules,plain(payload.ootkData.methodRules));assert.deepEqual(context.predeclaredBindings,plain(payload.ootkData.predeclaredBindings));assert.equal(context.castTimestamp,payload.ootkData.castTimestamp);
  const snapshot=[];
  for(const key of contract.expectedLayers){
   const op=payload.ootkData.operations[key],path=block(text,key+'完整計數故事（按節點順序，不截取首尾）'),pairs=block(text,key+'完整配對故事（與ringPairing同源，只讀一次）'),dignities=block(text,key+'全部實算元素尊貴（實體鄰牌，非跳點或配對）');
   assert.equal(path.length,op.countingPath.length);assert.deepEqual(path.map(p=>[p.cardId,p.position,p.countValue,p.direction]),plain(op.countingPath.map(p=>[p.cardId,p.position,p.countValue,p.direction])));
   assert(path.every(p=>p.coreMeaning&&p.wellDignified&&p.illDignified));assert.deepEqual(dignities,plain(op.dignities));assert.equal(pairs.length,op.pairs.length);
   assert.deepEqual(plain(pairs.map(p=>[p.left?.id,p.right?.id,p.dignity,p.leftPosition,p.rightPosition])),plain(op.pairs.map(p=>[p.left?.id,p.right?.id,p.dignity,p.leftPosition,p.rightPosition])));
   assert.deepEqual(block(text,key+'Book T多數及同階完整觀察'),plain(op.bookTMajorities));assert(op.readingRole&&op.readingPriority&&op.evidenceStrength&&op.allowedInference&&op.mustAnswer.length);
   snapshot.push({cards:op.activeCards.map(p=>[p.id,p.physicalOrientation]),path:op.countingPath,pairs:op.pairs,dignities:op.dignities});
  }
  if(previous)assert.deepEqual(plain(snapshot),previous,'question wording must not bias a seeded cast');previous=plain(snapshot);
  packet.parts.forEach(part=>{assert(P.chars(part)<=8000);assert(P.utf8(part)<=20000);});
  assert.equal(c.JYReadingWorkflow.reviewOOTK({sourcePrompt:text,answer:sampleAnswer()}).length,0);
  cases.push({question,characters:packet.totalCharacters,utf8Bytes:packet.totalBytes,parts:packet.parts.length,ringNodes:payload.ootkData.operations.op4.countingPath.length,ringPairs:payload.ootkData.operations.op4.pairs.length,integrity:native.methodData.integrity.status});
 }
});
test('fourth-round 15+ count nodes, all 36 cards and 18 pairs survive materialization without clipping',()=>{
 let payload;
 for(let seed=1;seed<=1000;seed++){const p=e.cast(seed);if(p.ootkData.operations.op4.countingPath.length>=15){payload=p;break;}}
 assert(payload,'find a real long ring path');const text=P.build('ootk',payload,payload.question),op=payload.ootkData.operations.op4;
 assert.equal(block(text,'op4全部36張環牌（中央牌另列，位置1至36）').length,36);assert.equal(block(text,'op4完整計數故事（按節點順序，不截取首尾）').length,op.countingPath.length);assert.equal(block(text,'op4完整配對故事（與ringPairing同源，只讀一次）').length,18);assert.equal(block(text,'op4全部實算元素尊貴（實體鄰牌，非跳點或配對）').length,op.dignities.length);
});
test('central inverted significator stays inverted in Op4 without inventing flanks or RWS meanings',()=>{
 let p;for(let seed=1;seed<=100;seed++){const v=e.cast(seed);if(v.ootkData.operations.op4.activeCards[0].ootkInverted){p=v;break;}}assert(p);
 const op=p.ootkData.operations.op4;assert.equal(op.significatorInverted,true);assert.equal(op.countingStart,'first_ring_card');assert.equal(op.countDirection,'deal_order');
 const state=c.JYNativeCards.ootk(p).significatorTrajectory[3];assert.equal(state.physicalOrientation,'inverted');assert.equal(state.surroundingCards.length,0);assert.equal(state.countingPositions.length,0);assert.equal(state.orientationEvidenceId,'op4/card/'+p.ootkData.significator.id+'/physical-orientation');
});
test('mainLineValidation pending is scoped background, confirmed restores priority, other rounds remain eligible',()=>{
 const p=e.cast(22);p.ootkData.operations.op1.mainLineValidation={status:'requires_querent_confirmation'};
 let d=c.JYNativeCards.ootk(p);assert.equal(d.layerEvidence[0].readingStatus,'context-mainline-pending');assert(d.layerEvidence.slice(1).every(p=>p.readingStatus==='eligible'));assert.equal(c.JYNativeAnalysis.analyze('ootk',p).depthContract.status,'ready-for-scoped-reading');
 p.ootkData.operations.op1.mainLineValidation={status:'confirmed'};d=c.JYNativeCards.ootk(p);assert.equal(d.layerEvidence[0].readingStatus,'eligible');
 p.ootkData.operations.op3.mainLineValidation={status:'undetermined'};d=c.JYNativeCards.ootk(p);assert.equal(d.layerEvidence[2].readingPriority,'background-and-corroboration');assert.equal(d.layerEvidence[1].readingStatus,'eligible');
 p.ootkData.operations.op4.ringCountingPath=[];p.ootkData.operations.op4.ringPairing=[];d=c.JYNativeCards.ootk(p);assert.equal(d.layerEvidence[3].counts.countingSteps,p.ootkData.operations.op4.countingPath.length);assert.equal(d.layerEvidence[3].counts.pairs,18);
});
test('Book T High Priestess + Netzach + Devil + Wands remain full result evidence, never a stop instruction',()=>{
 const deck=c.__deck,find=(suit,rank)=>deck.find(p=>p.suit===suit&&p.rank===rank),sig=find('pent','knight'),p=e.cast(25,QUESTIONS[0],sig.id),r=c._ootkResults;
 const targets=[sig,deck.find(p=>p.id===2),deck.find(p=>p.id===15),find('wand','ace'),find('wand','4'),find('sword','king'),find('wand','9'),find('cup','2')];assert(targets.every(Boolean));
 const rest=deck.filter(p=>!targets.some(t=>t.id===p.id)),ordered=Array(78);targets.forEach((card,i)=>{ordered[6+10*i]={...plain(card),ootkInverted:i===0,isUp:i!==0};});for(let i=0;i<78;i++)if(!ordered[i])ordered[i]={...plain(rest.shift()),ootkInverted:false,isUp:true};
 r.op5=c.ootkOp5(ordered,sig.id,'mathers_continuous');r.op5.attempt=1;r.op5.procedurePolicy='mathers_actual_position';const payload=c._buildOOTKPayload(),text=P.build('ootk',payload,payload.question),d=c.JYNativeCards.ootk(payload);
 assert.equal(payload.ootkData.operations.op5.activeSephirah,'Netzach');assert.equal(d.integrity.status,'complete');assert.equal(d.significatorTrajectory[4].physicalOrientation,'inverted');
 const profiles=block(text,'本次Book T完整牌義底稿（僅靜態牌義共用，動態狀態逐輪分列）');for(const t of targets)assert(profiles.some(p=>p.id===t.id));assert.equal(block(text,'op5完整配對故事（與ringPairing同源，只讀一次）').length,4);assert(text.includes(c.JYGoldenDawn.profile(targets[1]).core));
 const bad=plain(payload);bad.ootkData.operations.op5.pairs=[];assert.equal(c.JYNativeAnalysis.analyze('ootk',bad).depthContract.status,'partial-reading');
});
test('invalid/card-loss states cannot masquerade as full casts; aliases and missing rounds are diagnosed',()=>{
 const p=plain(e.cast(51));
 for(const mutate of [x=>x.ootkData.operations.op4.ringSize=0,x=>x.ootkData.operations.op4.ringCards.pop(),x=>x.ootkData.operations.op4.ringPairing.pop(),x=>x.ootkData.operations.op4.ringCountingPath[0].cardId=-1,x=>x.ootkData.operations.op5.activeCards.push(x.ootkData.operations.op5.activeCards[0]),x=>x.ootkData.operations.op1.activeCards[0].physicalOrientation='bad',x=>delete x.ootkData.operations.op3]){const v=plain(p);mutate(v);assert.throws(()=>c.JYNativeCards.ootk(v),/OOTK資料結構不一致/);}
 assert.throws(()=>c.JYNativeCards.ootk({operations:{op6:{valid:true}}}),/未知/);
 const v=plain(p);v.ootkData.operations.op1.valid=false;const d=c.JYNativeCards.ootk(v);assert(!d.completed.includes('op1'));assert.equal(c.JYNativeAnalysis.analyze('ootk',v).depthContract.status,'partial-reading');
 const r=c._ootkResults;r.op2.valid=false;const b=c._buildOOTKPayload();assert.equal(b.ootkData.operations.op2.valid,false); // no implicit validity promotion
});
test('semantic evidence graph shares scoped confirmation, Book T meaning and honest ring/completion states',()=>{
 const p=e.cast(31),g=c.JYTarotSemanticEngine.compileOOTKEvidence(p.ootkData);assert.equal(g.completedValidStageCount,5);assert.equal(g.readingContractVersion,'20261005ootk16');assert(g.nodes.some(n=>n.sourceGloss));
 p.ootkData.operations.op3.mainLineValidation={status:'undetermined'};const pending=c.JYTarotSemanticEngine.compileOOTKEvidence(p.ootkData),gate=pending.evidenceUnits.find(u=>u.type==='operation_human_confirmation');assert(gate);assert.equal(gate.stage,3);assert.equal(gate.joinPolicy.eventJoin,'confirmation_limits_stage_mainline_weight_only');assert.equal(pending.stopped,false);
 p.ootkData.operations.op4.ringSize=0;const bad=c.JYTarotSemanticEngine.compileOOTKEvidence(p.ootkData);assert.equal(bad.stopped,true);assert.equal(bad.completedValidStageCount,3);assert.equal(bad.evidenceUnits.find(u=>u.type==='op4_ring_structure').metadata.ringSize,0);
 const r=c._ootkResults,sig=r.op4.activeCards[0];delete sig.ootkInverted;delete sig.physicalOrientation;const unknown=c._buildOOTKPayload();assert.equal(unknown.ootkData.operations.op4.significatorInverted,null);assert.equal(unknown.ootkData.operations.op4.activeCards[0].physicalOrientation,null);
});
test('all active/fallback entry points share the same materialized OOTK content and scoped partial data',()=>{
 const payload=e.cast(38),native=c.JYNativeCards.ootk(payload),reader=c.JYNativeCards.ootkToPrompt(native),exported=c.JY_buildExportPrompt('ootk',payload);assert(exported.includes(reader));
 const brief=c.JYPromptBrief;c.JYPromptBrief=null;const withoutBrief=P.build('ootk',payload,payload.question);assert(withoutBrief.includes(reader));assert(!/\$ref|〔同項/.test(withoutBrief));c.JYPromptBrief=brief;
 const packet=c.JYPromptPacket;c.JYPromptPacket=null;const withoutPacket=c.JY_buildExportPrompt('ootk',payload);assert(withoutPacket.includes(reader));assert(!/\$ref|〔同項/.test(withoutPacket));c.JYPromptPacket=packet;
 const cards=c.JYNativeCards;c.JYNativeCards=null;assert.throws(()=>c.JY_buildExportPrompt('ootk',payload),/不能降級使用舊提示詞/);c.JYNativeCards=cards;
 const partial=plain(payload);delete partial.ootkData.operations.op5;partial.ootkData.procedureStatus.completedOperations=4;const text=c.JY_buildExportPrompt('ootk',partial),contract=block(text,'OOTK成稿契約');assert.equal(contract.expectedLayers.length,4);assert(text.includes('op4完整計數故事'));assert(!text.includes('op5完整計數故事'));assert.equal(c.JYNativeAnalysis.analyze('ootk',partial).depthContract.status,'partial-reading');
 const composite=P.buildMany([{method:'ootk',chart:payload},{method:'tarot',chart:{tarotData:{sourceProfile:'gd_book_t',cards:payload.ootkData.operations.op5.activeCards.slice(0,3)}}}],payload.question);assert(composite.includes(reader));assert(!/〔同項\d+〕/.test(composite));
});
test('localStorage rejection and >2MB records keep the entire in-memory prompt; no slicing',()=>{
 const original=c.localStorage.setItem;c.localStorage.setItem=()=>{throw Error('quota');};const text=P.build('ootk',e.cast(10),QUESTIONS[0]),p=unpack(text);assert.equal(p.storage.status,'memory-only');assert.equal(p.body,text);c.localStorage.setItem=original;
 const huge='完整資料𠀀'.repeat(170000)+'末尾保留';const saved=P.finish(huge,{method:'test',question:''}),big=unpack(saved);assert(big.totalBytes>2000000);assert.equal(big.storage.status,'memory-only');assert.equal(big.body,huge);assert(big.parts.at(-1).includes('末尾保留'));
});
test('answer review fails safety-only, missing layer, repeated prose, false calendar and Priestess stop',()=>{
 const source=P.build('ootk',e.cast(39),QUESTIONS[0]),F=c.JYReadingWorkflow;
 for(const bad of ['無法知道她的心意，只能透過現實互動判斷。',sampleAnswer(true),sampleAnswer().replace('第三輪','被刪掉的一輪'),sampleAnswer().replace('最可能傾向：','傾向：').replace('次可能傾向：','次項：'),sampleAnswer()+'\n第一輪＝下個月，女祭司所以無法回答。',sampleAnswer()+'\n她一定喜歡你。'])assert(F.reviewOOTK({sourcePrompt:source,answer:bad}).length);
 assert(F.reviewOOTK({sourcePrompt:source,answer:sampleAnswer()+'\n她一定喜歡你。'}).some(p=>p.code==='OOTK_SYMBOL_AS_FACT'));
 assert.equal(F.reviewOOTK({sourcePrompt:source,answer:sampleAnswer()}).length,0);assert(F.repairPrompt({method:'ootk',question:QUESTIONS[0],answer:'未知',sourcePrompt:source}).includes(source));
});
test('browser script versions and mirror copies match the shared reading code',()=>{
 const html=read('index.html');for(const [name,version]of Object.entries({'native-card-analysis':'20261005ootk16','native-depth-contract':'20261005depth16','prompt-brief':'20261010prompt17','prompt-packet':'20261010prompt17','reading-workflow':'20261010prompt17'}))assert(html.includes('JS/'+name+'.js?v='+version));
 for(const name of ['native-card-analysis','native-depth-contract','prompt-brief','prompt-packet','reading-workflow','ai-analysis','prompt-export'])if(fs.existsSync(path.join(ROOT,name+'.js')))assert.equal(read(name+'.js'),read('JS/'+name+'.js'),name+' mirror');assert(read('reading-review.html').includes('20261010prompt17'));assert.equal(read('sw.js'),read('JS/sw.js'));
});
(async()=>{
 const originalFetch=globalThis.fetch;let calls=0,writes=0,sent;
 try{
  const api=(await import('data:text/javascript;base64,'+Buffer.from(read('functions/api/ai.js')).toString('base64'))).onRequest;
  const env={ANTHROPIC_API_KEY:'test-only',RATE_KV:{async get(){return null;},async put(){writes++;}}};
  const request=payload=>new Request('https://jingyue.uk/api/ai',{method:'POST',headers:{Origin:'https://jingyue.uk','Content-Type':'application/json'},body:JSON.stringify({payload})});
  for(const question of QUESTIONS){
   const payload=plain(e.cast(39,question)),before=JSON.stringify(payload);globalThis.fetch=async(url,init)=>{calls++;sent=JSON.parse(init.body);return Response.json({content:[{type:'text',text:JSON.stringify({answer:sampleAnswer(),action:null,timing:null})}]});};
   const resp=await api({request:request(payload),env});assert.equal(resp.status,200,JSON.stringify(await resp.clone().json()));assert.equal(JSON.stringify(payload),before);assert(sent.system.includes('20261005depth16'));assert(sent.messages[0].content.includes(c.JYNativeCards.ootkToPrompt(c.JYNativeCards.ootk(payload))));assert.equal(sent.max_tokens,16384);
  }
  const adapterPayload=plain(e.cast(39)),reader=c.JYNativeCards.ootkToPrompt(c.JYNativeCards.ootk(adapterPayload));
  for(const extra of [{ootkData:JSON.stringify(adapterPayload.ootkData)},{dims:{ootk:JSON.stringify(adapterPayload.ootkData)}},{rawReadings:{ootk:JSON.stringify(adapterPayload.ootkData)}},{ootkData:adapterPayload.ootkData,dims:{ootk:JSON.stringify(adapterPayload.ootkData)},rawReadings:{ootk:JSON.stringify(adapterPayload.ootkData)}}]){
   globalThis.fetch=async(url,init)=>{sent=JSON.parse(init.body);return Response.json({content:[{type:'text',text:JSON.stringify({answer:sampleAnswer()})}]});};const resp=await api({request:request({question:adapterPayload.question,...extra}),env});assert.equal(resp.status,200,JSON.stringify(await resp.clone().json()));assert.equal(sent.messages[0].content.split(reader).length-1,1);
  }
  const conflict=plain(adapterPayload.ootkData);conflict.operations.op1.countDirection='other';globalThis.fetch=async()=>{throw Error('conflicting snapshots must not reach model');};let conflictResp=await api({request:request({...adapterPayload,dims:{ootk:conflict}}),env});assert.equal(conflictResp.status,400);assert.equal((await conflictResp.json()).code,'OOTK_DATA_CONFLICT');
  const payload=plain(e.cast(39)),beforeWrites=writes;globalThis.fetch=async()=>Response.json({content:[{type:'text',text:JSON.stringify({answer:'無法知道她的心意。只能現實驗證。'})}]});let resp=await api({request:request(payload),env});assert.equal(resp.status,502);assert.equal((await resp.json()).code,'OOTK_READING_CONTRACT_FAILED');assert.equal(writes,beforeWrites);
  payload.ootkData.operations.op4.ringSize=0;globalThis.fetch=async()=>{throw Error('invalid chart must not be sent');};resp=await api({request:request(payload),env});assert.equal(resp.status,400);assert.equal((await resp.json()).code,'OOTK_DATA_INVALID');assert.equal(writes,beforeWrites);
  results.push({name:'A-G retained API preserves exact reader, system depth16, 16K output allowance, failed-answer gate and quota',status:'passed',mockedUpstream:true});console.log('PASS retained API A-G adapter and failure gates');
 }finally{globalThis.fetch=originalFetch;}
 fs.writeFileSync(path.join(ROOT,'docs/ootk-reading-validation-20261005.json'),JSON.stringify({scope:'Actual seeded engine and deterministic transport/review regressions; mocked upstream API, no live model quality claim',version:'20261005ootk16',cases,results},null,2));
 console.log('ootk-reading-pipeline-20261005: '+results.length+' groups passed; 7 actual question cases, no live AI calls.');
})().catch(error=>{console.error(error);process.exitCode=1;});
