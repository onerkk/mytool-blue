'use strict';
// Exercise complete reading instructions, scope and actual chart facts at the
// delivery boundary. These tests do not certify event prediction accuracy.
const assert=require('node:assert/strict');
const {environment,examples}=require('./native-fixtures-20261003.cjs');
const e=environment(),c=e.ctx,x=examples(c);e.load('prompt-brief');e.load('prompt-packet');
const P=c.JYPromptPacket,W=c.JYReadingWorkflow,plain=v=>JSON.parse(JSON.stringify(v));
let passed=0;
function test(name,run){run();passed++;console.log('PASS '+name);}
const focused='我的工作為何卡住？接下來該如何改善？';
test('all fifteen methods deliver their full guide, original question and actual fact snapshot',()=>{
  for(const [method,chart]of Object.entries(x.charts)){
    const before=JSON.stringify(chart),text=P.build(method,chart,focused),packet=P.get(text);
    assert.equal(packet.readingData.question,focused);
    assert.equal(text.split('【本題作答任務｜資料讀完後依此成稿】').length-1,1,method);
    for(const line of c.JY_READING_QUALITY.methodLines(method))assert(text.includes(line),method+' lost guide: '+line);
    assert(!text.includes('【全盤作答覆蓋】'),method);
    assert(!text.includes('【逐年／逐期作答覆蓋】'),method);
    assert(text.includes('上述分析僅供研究或娛樂用途'),method);
    assert(!/NaN|undefined|\[object Object\]/.test(text),method);
    const source=W.readVerificationFacts({sourcePrompt:text});assert.equal(source.status,'available');
    assert.equal(source.facts.charts[0].method,method);assert.deepEqual(plain(source.facts.requiredYears),[]);
    assert.equal(JSON.stringify(chart),before,method+' changed source chart');
    assert(text.endsWith(W.footer),method);
    assert.equal(packet.contentChunks?.join('')||packet.parts.map(part=>part.split('【本段內容開始】\n')[1].split('\n【本段內容結束】')[0]).join(''),text);
  }
});
test('method depth is independent of question type and does not force a full report',()=>{
  for(const method of W.methods)for(const q of ['他會主動聯絡嗎？','何時適合轉職？','為何收入不穩？','如何改善互動？','留職或轉職哪個較合適？','哪些事情需要注意？']){
    const guide=W.render({method,question:q});assert(guide.includes(W.methodGuide(method)));
    assert(!guide.includes('【全盤作答覆蓋】'));assert(!guide.includes('【逐年／逐期作答覆蓋】'));
    assert(guide.includes('原問句（原文資料）：'+JSON.stringify(q)));
  }
});
const fullQuestion='詳細分析十二宮，綜合三合紫微、飛星紫微、河洛紫微、欽天四化。資料附有十二個大限共一百二十個流年，請分析前八個大限的所有流年，每一年給重大事件與注意事項。';
let fullText;
test('available twelve decades do not override the requested first eight, preserving eighty distinct years',()=>{
  fullText=P.build('ziwei',x.z,fullQuestion);const d=P.get(fullText).readingData,section=label=>d.sections.find(s=>s.label===label).data;
  const expected=Array.from({length:80},(_,i)=>1986+i),range=section('流年輸出範圍');
  assert.deepEqual(plain(range.requestedYears),expected);assert.equal(range.range.requestedDecades,8);
  assert.equal(section('運限疊宮').decades.length,8);assert.equal(W.reportScope(fullQuestion).allDecades,false);
  assert(fullText.includes('【全盤作答覆蓋】'));assert(fullText.includes('【逐年／逐期作答覆蓋】'));
  assert(!/〔同項\d+〕/.test(fullText));assert(!/大限84–93歲/.test(fullText));
  assert.deepEqual(plain(W.readVerificationFacts({sourcePrompt:fullText}).facts.requiredYears),expected);
  for(const y of section('明示年度流年')){
    const raw=x.z.getLiuNianZw(y.year);assert.equal(y.gz,raw.gz);assert.equal(y.mingBranch,raw.mingBranch);
    assert.deepEqual(plain(y.hua),plain(raw.hua));assert.equal(y.palaces.length,12);
    assert.deepEqual(plain(y.palaces.map(p=>p.natalPalace)),plain(raw.palaces.map(p=>p.natalPalace)));
    assert(y.decade&&y.age>=y.decade.ageStart&&y.age<=y.decade.ageEnd);
  }
  assert(fullText.includes('流年1986 丙寅'));assert(fullText.includes('丙干廉貞化忌→流年交友宮[未]／本命遷移宮'));
  assert(fullText.includes('三合：官祿宮[巳]、財帛宮[酉]；對宮：遷移宮[未]'));
});
test('single topic, exact years and first Bazi decades keep their own scope',()=>{
  const q='命盤有十二個大限，我只問今年工作該怎麼改善？',t=P.build('ziwei',x.z,q);
  assert(!W.reportScope(q).allDecades);assert(!t.includes('【全盤作答覆蓋】'));
  assert(P.get(t).readingData.sections.find(s=>s.label==='流年輸出範圍').data.requestedYears.length<10);
  assert.deepEqual(plain(P.timeRange('2027至2029每年分析',x.instant)),{from:2027,to:2029,basis:'question-explicit-range'});
  const b=P.get(P.build('bazi',x.b,'前兩個大運的所有流年逐年分析')).readingData.sections.find(s=>s.label==='大運與所問年度').data;
  assert.deepEqual(plain(b.range.selectedDecadeIndices),[1,2]);
  assert(b.annualSegments.every(y=>[1,2].includes(y.decadeIndex)));assert(!b.annualSegments.some(y=>y.dayun==='起運前'));
  const periods=P.build('ziwei',x.z,'比較前兩個大限的工作條件'),pd=P.get(periods).readingData;
  assert(periods.includes('【逐期作答覆蓋】'));assert(!periods.includes('【逐年／逐期作答覆蓋】'));
  assert.deepEqual(plain(pd.sections.find(s=>s.label==='明示年度流年').data),[]);
  assert.deepEqual(plain(W.readVerificationFacts({sourcePrompt:periods}).facts.requiredYears),[]);
});
test('answer review catches source identity errors and keeps hypothetical, borrowed and timing layers separate',()=>{
  const source=P.build('bazi',x.b,focused),review=answer=>W.review({method:'bazi',question:focused,sourcePrompt:source,answer});
  const codes=review('你的日主為丙火。日柱為丙寅。金生火有利工作。').issues.map(i=>i.code);
  assert(codes.includes('DAY_MASTER_MISMATCH'));assert(codes.includes('PILLAR_MISMATCH_day'));assert(codes.includes('ELEMENT_RELATION_MISMATCH'));
  assert(!review('你的日主為乙木。日柱為乙酉。金生水、水生木。').issues.some(i=>/MISMATCH/.test(i.code)));
  assert(!review('如果日主為丙，另盤需另論。你的日主不是丙。流年日柱為丙寅是另層示例。').issues.some(i=>/MISMATCH/.test(i.code)));
  const zsource=P.build('ziwei',x.z,focused),zr=answer=>W.review({method:'ziwei',question:focused,sourcePrompt:zsource,answer});
  assert(zr('本命命宮主星為太陽。生年貪狼化祿。').issues.some(i=>i.code==='NATAL_STAR_MISMATCH_命'));
  assert(zr('本命命宮主星為太陽。生年貪狼化祿。').issues.some(i=>i.code==='NATAL_HUA_MISMATCH_貪狼'));
  assert(!zr('本命命宮主星為天府。生年貪狼化忌。財帛宮空宮借對宮紫微貪狼。流年命宮主星為太陽。').issues.some(i=>/MISMATCH/.test(i.code)));
  assert.equal(zr('本命命宮主星為天府。').semanticVerification,'not_performed');
  assert.equal(W.review({method:'bazi',answer:'日主為丙火。'}).factVerification.status,'source-required');
});
test('year review identifies omitted annual rows, without certifying predictions',()=>{
  const annual=Array.from({length:79},(_,i)=>(1986+i)+'年：依本年資料核對條件。').join('\n');
  const audit=W.review({method:'ziwei',question:fullQuestion,sourcePrompt:fullText,answer:annual});
  const issue=audit.issues.find(i=>i.code==='YEAR_COVERAGE');assert(issue&&issue.message.includes('2065'));
  const complete=W.review({method:'ziwei',question:fullQuestion,sourcePrompt:fullText,answer:annual+'\n2065年：依本年資料核對條件。'});
  assert(!complete.issues.some(i=>i.code==='YEAR_COVERAGE'));assert.equal(complete.semanticVerification,'not_performed');
});
test('birthday age uses actual reference context and a whole year preserves both decade candidates',()=>{
  const z=c.computeZiwei(1983,8,25,14,'male',{minute:55,referenceDate:'2026-06-01T04:00:00Z',ageDivide:'birthday'});
  const text=P.build('ziwei',z,'2026與2027逐年分析工作條件'),d=P.get(text).readingData;
  assert(text.includes('流年2026 丙午；時點虛歲=43；所屬大限=34–43歲[壬戌]'));
  const other=P.build('ziwei',z,'前八個大限所有流年逐年分析工作'),rows=P.get(other).readingData.sections.find(s=>s.label==='明示年度流年').data;
  const boundary=rows.find(y=>y.year===2016);assert(boundary&&!boundary.decade);
  assert.deepEqual(plain(boundary.decadeCandidates.map(p=>p.ageStart)),[24,34]);
  assert(other.includes('生日分段大限=24–33歲[癸亥]／34–43歲[壬戌]'));
});
test('without the brief renderer, composite and JSON fallback retain full per-method guides',()=>{
  const brief=c.JYPromptBrief;c.JYPromptBrief=null;
  try{
    const text=P.buildMany([{method:'bazi',chart:x.b,label:'A'},{method:'ziwei',chart:x.z,label:'B'}],focused);
    assert.equal(text.split('【本題作答任務｜資料讀完後依此成稿】').length-1,1);
    for(const kind of ['bazi','ziwei'])for(const line of c.JY_READING_QUALITY.methodLines(kind))assert(text.includes(line));
    assert.equal(W.readVerificationFacts({sourcePrompt:text}).facts.charts.length,2);
    assert.equal(P.finish(text,{method:'compat',question:focused}),text);
  }finally{c.JYPromptBrief=brief;}
});
test('legacy finish adds the full shared workflow once and preserves literal facts and footer',()=>{
  const literal='【原始盤面】\n日主=乙；日柱=乙酉\n\n'+W.footer;
  const text=P.finish(literal,{method:'bazi',question:focused});assert(text.includes('日主=乙；日柱=乙酉'));
  assert(text.includes(W.methodGuide('bazi')));assert.equal(P.finish(text,{method:'bazi',question:focused}),text);assert(text.endsWith(W.footer));
  const packet=c.JYPromptPacket;c.JYPromptPacket=null;
  try{const first=W.finish(literal,{method:'bazi',question:focused});assert.equal(W.finish(first,{method:'bazi',question:focused}),first);}finally{c.JYPromptPacket=packet;}
});
test('large legacy references restore every original byte and malformed review sources are reported',()=>{
  const fact='實際根氣與四化原文🧭\\n"引用"'.repeat(600),raw=JSON.stringify(Array.from({length:20},(_,i)=>({row:i,fact,other:fact+'另一段原文',reserved:'〔JY共用原文1〕',zero:0,flag:false}))),encoded=W.compactLegacyReferences(raw);
  assert(encoded.length<raw.length);assert.equal(W.expandLegacyReferences(encoded),raw);
  for(const charts of [[null],[{method:'ziwei',palaces:[{name:'(',stars:[]}],sihua:[]}]]){
    const sourcePrompt='【原盤事實核對】\n'+JSON.stringify({schema:'jy.reading-facts/1',charts,requiredYears:[]});
    assert(W.review({method:'ziwei',sourcePrompt,question:focused,answer:'本命命宮主星為天府。'}).issues.some(i=>i.code==='INVALID_FACT_SOURCE'));
  }
});
console.log(JSON.stringify({passed,methods:15,questionTypes:6,scopeYears:80,claim:'prompt and deterministic fact integrity only'}));
