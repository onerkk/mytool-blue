'use strict';
const assert=require('node:assert/strict');
const {environment,examples}=require('./native-fixtures-20261003.cjs');
const e=environment(),c=e.ctx,x=examples(c),N=c.JYNativeAnalysis,A=c.JYEngineComputationAudit,W=c.JYReadingWorkflow;
e.load('prompt-brief');e.load('prompt-packet');
const plain=v=>JSON.parse(JSON.stringify(v));let passed=0;
function test(name,run){run();passed++;console.log('PASS '+name);}
const codes=(method,question,answer)=>W.review({method,question,answer}).issues.map(i=>i.code);
test('impossible stem-branch pairs cannot be exported as an audited birth chart',()=>{
  const b=plain(x.b);b.pillars.year.gan='甲';b.pillars.year.zhi='丑';
  assert.throws(()=>N.analyze('bazi',b),/查核失敗/);
});
test('independent audit rejects corrupted exposed, hidden and annual Ten Gods',()=>{
  for(const change of [a=>a.pillars[0].god='不存在',a=>a.pillars[0].hidden[0].god='不存在',a=>a.annualSegments[0].god='不存在']){
    const a=N.analyze('bazi',x.b);change(a);assert.throws(()=>A.ensure('bazi',x.b,a),/查核失敗/);
  }
});
test('upstream printed 2005 case retains its four pillars and Ten God directions',()=>{
  const b=c.computeBazi(2005,12,23,8,37,'male',{referenceDate:x.instant});c.enhanceBazi(b);
  const a=N.analyze('bazi',b);
  assert.deepEqual(plain(a.pillars.map(p=>p.gan+p.zhi)),['乙酉','戊子','辛巳','壬辰']);
  assert.deepEqual(plain(a.pillars.map(p=>p.god)),['偏財','正印','比肩','傷官']);
  assert.deepEqual(plain(Object.fromEntries(a.pillars[2].hidden.map(p=>[p.stem,p.god]))),{丙:'正官',戊:'正印',庚:'劫財'});
});
test('Liuyao rejects corrupted roles and changed-line kinship before export',()=>{
  for(const change of [s=>s.lines.find(l=>l.role!=='世').role='世',s=>s.lines.find(l=>l.moving).changed.relative='不存在']){
    const s=plain(x.six);change(s);assert.throws(()=>N.analyze('liuyao',s),/查核失敗/);
  }
});
test('all fifteen real exports retain facts and distinguish arithmetic from event validation',()=>{
  for(const [method,chart]of Object.entries(x.charts)){
    const before=JSON.stringify(chart),a=N.analyze(method,chart);
    assert.equal(a.depthContract.truthBoundary.predictionValidation,'not-performed',method);
    const text=c.JYPromptPacket.build(method,chart,'未來工作與感情該如何調整？');
    assert(text.includes('計算核對不等於事件預測已驗證'),method);
    assert.equal(c.JYPromptPacket.get(text).contentChunks.join(''),text);
    assert.equal(JSON.stringify(chart),before,method+' mutated chart');
  }
});
test('fatalistic and guaranteed life verdicts are detected for every method',()=>{
  for(const method of W.methods){
    assert(codes(method,'工作與婚姻如何？','你注定一輩子貧窮，婚姻永遠不會幸福。').includes('LIFETIME_VERDICT'),method);
    assert(codes(method,'財運如何？','你必定會發財，保證婚姻幸福。').includes('GUARANTEED_EVENT'),method);
  }
});
test('a negation in another clause cannot hide a deterministic life verdict',()=>{
  assert(codes('bazi','婚姻如何？','你注定孤獨終老，但不能自責。').includes('LIFETIME_VERDICT'));
});
test('negative labels, idle waiting and agreement across AIs are not real-world proof',()=>{
  assert(codes('bazi','收入如何？','你身弱，所以你賺不了錢。').includes('LABEL_AS_REALITY'));
  assert(codes('bazi','如何改善？','2031年才轉運，現在只能熬著，什麼都不要做。').includes('PASSIVE_FATE_WAIT'));
  assert(codes('ziwei','未來如何？','三個AI都這樣說，所以證實你的命運就是這樣。').includes('CONSENSUS_AS_PROOF'));
});
test('rejected quotations, conditional obstacles and plain negative outlooks are not softened into optimism',()=>{
  for(const answer of ['不能說你注定一輩子貧窮。','別人說「你注定孤獨終老」，這不能當作事實。','> 你注定一輩子貧窮。\n\n上面是待批判的舊答案。','若缺乏支持，這段時間的收入可能受阻；先核對實際條件。','這份盤面較支持短期不易成事；並無確定年月或終身結論。']){
    assert(!codes('bazi','工作如何？',answer).some(k=>['LIFETIME_VERDICT','GUARANTEED_EVENT','LABEL_AS_REALITY'].includes(k)),answer);
  }
});
test('explicit personal safety needs suppress sales review without diagnosing the user',()=>{
  const q='我現在想自殺，活著還有什麼意義？';
  assert.equal(W.plan({method:'bazi',question:q}).careContext.level,'safety-first');
  const r=W.review({method:'bazi',question:q,answer:'先把可能傷害自己的物品移開，聯絡一位可以陪著你的人；有眼前危險時立即尋求當地緊急協助。'});
  assert(!r.issues.some(i=>/SHOP_|BRACELET_SELECTION|PRODUCT_PURPOSE/.test(i.code)));
  const text=c.JYPromptPacket.build('bazi',x.b,q);
  assert(!text.endsWith(W.footer));assert(text.includes('眼前安全'));assert(text.includes('四柱'));
});
test('discussion, quotations and negated self-harm do not falsely trigger personal danger',()=>{
  for(const q of ['討論網路文章「我想自殺」的解讀問題','我沒有自殺念頭，只想問工作','如果有人想自殺，命理如何避免傷害？'])assert.notEqual(W.plan({method:'tarot',question:q}).careContext.level,'safety-first',q);
});
test('a real quoted report about a partner and explicit supplemental notes retain safety priority',()=>{
  assert.equal(W.plan({method:'tarot',question:'女友說「我想自殺」，我該怎麼幫她？'}).careContext.level,'safety-first');
  const q='今年工作如何？',notes='我現在想傷害自己';
  assert.equal(W.plan({method:'bazi',question:q,notes}).careContext.level,'safety-first');
  const t=c.JYPromptPacket.build('bazi',x.b,q,{notes});
  assert(!t.endsWith(W.footer));assert(t.includes('眼前安全'));assert(t.includes(notes));
});
test('standalone, JSON and composite routes use the same safety and truth boundary',()=>{
  const brief=c.JYPromptBrief;c.JYPromptBrief=null;
  try{
    const q='我打算傷害自己';
    const t=c.JYPromptPacket.buildMany([{method:'bazi',chart:x.b},{method:'ziwei',chart:x.z}],q);
    assert(!t.endsWith(W.footer));assert(t.includes('眼前安全'));assert(!t.includes('【本題延伸手鍊建議】'));
  }finally{c.JYPromptBrief=brief;}
  const packet=c.JYPromptPacket;c.JYPromptPacket=null;
  try{const t=W.finish('【盤面】日主=乙\n\n'+W.footer,{method:'bazi',question:'我想自殺'});assert(!t.endsWith(W.footer));assert(t.includes('日主=乙'));}finally{c.JYPromptPacket=packet;}
});
test('old exported task instructions receive current rules without losing facts or repeating them',()=>{
  const q='我的工作該怎麼調整？',current=c.JYPromptPacket.build('bazi',x.b,q);
  const old=current.replace('【共用判讀版本】'+W.version,'【共用判讀版本】1.8.0');
  const updated=c.JYPromptPacket.finish(old,{method:'bazi',question:q});
  assert(updated.includes('【共用判讀版本】'+W.version));assert(updated.includes('【本次版本補充作答規則｜覆蓋舊版作答要求】'));
  assert(updated.includes('乙酉'));assert.equal(c.JYPromptPacket.finish(updated,{method:'bazi',question:q}),updated);
  assert.equal(c.JYPromptPacket.get(updated).version,'20261014prompt24');
});
console.log('Reading integrity '+passed+' groups PASS');
