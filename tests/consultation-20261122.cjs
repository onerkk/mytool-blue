'use strict';
const assert = require('node:assert/strict');
const { environment, examples } = require('./native-fixtures-20261003.cjs');
const env = environment(), c = env.ctx;
['tarot-foundation','golden-dawn-tarot','prompt-brief','prompt-packet'].forEach(env.load);
const f = examples(c), api = c.JYPromptPacket;
const plain = x => JSON.parse(JSON.stringify(x));
const question = '我在公司還能有被主管重視的時候嗎？';
const records = { knownFacts:'我已收到下次會議的通知。', priority:'我想釐清能否自己提案。' };
let checked = 0;
function group(name, test) { test(); console.log('PASS',name); checked++; }
function visit(method, chart, q=question, opts={}) {
  const body = api.build(method,chart,q,opts);
  return { body, v:api.get(body).projection.consultation[0] };
}

group('十五種原生結果逐案追問，原盤、原始匯出、本人回應各自保留', () => {
  for (const [kind, chart] of Object.entries(f.charts)) {
    const source = JSON.stringify(chart);
    const {body, v} = visit(kind,chart,question,records);
    assert.equal(v.method,kind);
    assert.ok(v.points.length && v.points.every(p => p.label && p.detail && p.reading),kind);
    const p = v.points[0], observed = '和實際情況不同';
    const selection = { source:v.source||v.title, location:p.label, evidence:p.detail, experience:observed, note:'會議當天有安排我說明。' };
    const follow = api.followUp(body,selection), result = api.get(follow);
    for (const text of [question,records.knownFacts,records.priority,selection.note,selection.location,observed])
      assert.ok(follow.includes(text),kind+' omitted '+text);
    assert.ok(follow.includes('本人希望這次幫忙釐清的事'),kind);
    assert.deepEqual(plain(result.projection.intake),{facts:records.knownFacts,priority:records.priority});
    assert.deepEqual(plain(result.projection.consultation),plain(api.get(body).projection.consultation),kind);
    assert.equal(api.forChart(chart).fullPrompt,body,kind);
    assert.equal(api.get(body).readingData.followUp,null);
    assert.throws(()=>api.followUp(body,{...selection,evidence:'另一份盤的資料'}),/與本次盤面不同/);
    assert.ok(api.chars(follow)<=api.limits.characters && api.utf8(follow)<=api.limits.utf8Bytes,kind);
    assert.equal(JSON.stringify(chart),source,kind);
  }
  assert.equal(Object.keys(f.charts).length,15);
});

group('追問保留已送出的那副牌，並重新辨認當事人明示的安全需要',()=>{
  const chart=plain(f.tarot), first=visit('tarot',chart,question,records), p=first.v.points[0];
  const observation={source:first.v.title,location:p.label,evidence:p.detail,note:'主管有寄來書面通知。'};
  chart.cards[0].isUp=false;
  const next=api.followUp(first.body,observation);
  assert.ok(next.includes(p.detail));
  const tables=text=>text.slice(text.indexOf('【解讀與查證規則】'));
  assert.equal(tables(next),tables(first.body));
  chart.cards[0].isUp=true;
  const urgent=api.followUp(first.body,{...observation,note:'我現在想自殺，已經準備傷害自己。'});
  assert.doesNotMatch(urgent,/shopee\.tw/);
});
group('凱爾特十字保留全部十位、希望與結果、RWS 方向與並列元素',()=>{
  const positions=['核心狀態','交叉力量','理想與可能','事情根基','近期過去','短期走向','本人','環境','希望或恐懼','最終將至'];
  const roles=['state','interaction_force','structural','cause','antecedent','timeline','state','environment','structural','outcome'];
  const cards=[44,41,53,40,24,76,49,42,27,17].map((id,i)=>({...plain(f.cards[id]),id,isUp:[3,6].includes(i),position:positions[i]}));
  const chart={sourceProfile:'rws_reversals',spreadType:'celtic_cross',cards,methodPlan:{id:'celtic_cross',slots:positions.map((label,i)=>({label,authority:roles[i]}))}};
  const {v,body}=visit('tarot',chart);
  assert.equal(v.points.length,10);
  const end=v.points.find(p=>p.label.includes('最終將至')),hope=v.points.find(p=>p.label.includes('希望或恐懼'));
  assert.equal(end.visual.face,17);assert.equal(end.visual.reversed,true);
  assert.match(end.detail,/星星（逆位）/);assert.match(hope.reading,/擔心/);
  assert.match(body,/風、土各1張，同為最少。結果位第10張星星屬風，按本站規則取金/);
  assert.match(body,/逆位8張/);
});

group('三爻變依實際主參兩卦畫線，梅花標出本次動爻，六壬保留三傳順序',()=>{
  const chart=c.JYYijingCore.calculate({values:[7,6,9,6,8,8],question});
  const read=c.JYNativeAnalysis.analyze('yijing',chart).reading.selections;
  const {v}=visit('yijing',chart);
  read.forEach((r,i)=>{
    assert.ok(v.points[i].label.includes(r.hexagram));
    assert.equal(v.points[i].detail,r.text);
    assert.deepEqual(plain(v.points[i].visual.lines),plain((r.side==='changed'?chart.changed:chart.original).lines.map(Boolean)));
  });
  const stages=visit('meihua',f.mh).v.points;assert.equal(stages.length,4);
  assert.equal(stages[0].visual.position,f.mh.dong);assert.equal(stages[3].visual.position,f.mh.dong);
  assert.deepEqual(plain(visit('liuren',f.l).v.points.map(p=>p.visual.mark)),plain(f.l.transmissions.map(t=>t.branch)));
});

group('未知時辰可看的取樣與三柱，保留不可用的宮位',()=>{
  for(const [kind,engine] of [['astro',c.JYWestern],['vedic',c.JYVedic]]){
    const chart=engine.compute({...f.input,unknownTime:true}),{v,body}=visit(kind,chart);
    assert.equal(v.points[0].visual.kind,'limit');
    assert.ok(v.points.some(p=>p.label==='太陽・當日取樣'),kind);
    assert.ok(!v.points.some(p=>Number.isInteger(p.visual.sector)),kind);
    assert.ok(!body.includes('【原題對應的本命依據'),kind);
  }
  const b=visit('bazi',f.b,question,{unknown:true}).v.points;
  assert.ok(b[0].visual.kind==='limit' && !b.some(p=>p.label==='時柱'));
});

group('開鑰的停止程序、雷諾曼牌路與姓名候選依據',()=>{
  const stop=visit('ootk',f.ootk).v;
  assert.ok(stop.points.every(p=>p.visual.kind==='limit'));
  const direct=visit('lenormand',f.ln).v.points, nested=visit('lenormand',{lenormandData:f.ln}).v.points;
  assert.deepEqual(plain(nested),plain(direct));
  assert.ok(direct.some(p=>p.label==='第4、5、6位'));
  const names=visit('name',f.nm).v.points;
  assert.equal(names.length,3);
  assert.ok(names.every(p=>p.detail.includes('各字筆畫') && p.detail.includes('待本人確認')));
});

group('單方未定紫微合盤不借用不存在的八字日主或跨盤投射',()=>{
  const incomplete=c.JYRelationshipCore.createZiweiPair(null,f.z,{scenarioId:'business',question});
  const {body,v}=visit('compat',incomplete);
  assert.match(body,/紫微斗數合盤/);assert.doesNotMatch(body,/【本法正統取法（八字合盤）】/);
  assert.equal(v.points.length,1);assert.match(v.points[0].detail,/甲方未定盤，乙方有盤/);
  const section=api.get(body).readingData.sections.find(s=>s.label==='雙方及雙向原盤作用').data;
  assert.equal(section.personA,null);assert.ok(section.personB);assert.equal(section.scenarioId,'business');
});
group('十五種問法的明示盤面錯引可在本機核對，假設與白話保留給本人',()=>{
  const work=c.JYReadingWorkflow,charts={...f.charts};
  charts.yijing=c.JYYijingCore.calculate({question,values:[8,8,6,8,8,8]});
  charts.liuyao=c.JYLiuyaoCore.calculate({question,values:[8,8,6,8,8,8],calendar:{day:'甲子',monthBranch:'辰'}});
  const wrong={bazi:'日主為甲。',ziwei:'命宮主星為紫微。',astro:'本命太陽落在第一宮。',vedic:'本命太陽落在第一宮。',
    liuren:'初傳為亥。',liuyao:'動爻為第一爻。',yijing:'動爻為第一爻。',meihua:'動爻是第'+(f.mh.dong===1?'二':'一')+'爻。',
    name:'陳政軒的人格為19。',compat:'甲方對乙方是土剋木。',personality:'五軸人格代碼是XXXXX。',tarot:'愚者（逆位）。',
    lenormand:'第2張是牌1。',ootk:'第二輪計數有9步。',oracle:'你抽到的是第2籤。'};
  for(const [k,answer] of Object.entries(wrong)){
    const text=api.build(k,charts[k],question);
    assert.ok(work.checkChartText(text,answer).issues.length,k);
    assert.equal(work.checkChartText(text,'假設'+answer).issues.length,0,k);
    assert.equal(work.checkChartText(text,'你可以詢問下次會議的安排。').checks,0,k);
  }
  const tarot=api.build('tarot',f.tarot,question);
  assert.equal(work.checkChartText(tarot,'愚者（正位）。').checks,1);
  assert.equal(work.checkChartText(tarot,'愚者（正位）。').issues.length,0);
});
console.log('Consultation regression groups:',checked);
