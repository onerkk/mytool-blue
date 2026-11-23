'use strict';
const assert = require('node:assert/strict');
const { environment, examples } = require('./native-fixtures-20261003.cjs');
const env = environment(), c = env.ctx;
['tarot-foundation','golden-dawn-tarot','tarot_upgrade','prompt-brief','prompt-packet'].forEach(env.load);
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
    const references=api.get(body).projection.referenceSections;
    assert.ok(references.length&&references.every(s=>body.includes('【'+s.label+'】\n'+s.value)),kind);
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
  assert.match(api.rereadByMethod(urgent),/安全/);assert.doesNotMatch(api.rereadByMethod(urgent),/本題起斷|shopee/);
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
  const opening=api.get(body).projection.referenceSections.find(s=>s.label.includes('本題起斷')).value;
  assert.match(opening,/^第10位・最終將至｜星星（逆位）/);assert.match(opening,/第6位・短期走向｜金幣皇后（逆位）/);assert.doesNotMatch(opening,/第9位/);
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

group('大六壬及六爻從原題辨認國曆窗口，逐日排除題外候選',()=>{
  const castDay='2026-10-01', clock={instant:'2026-10-01T14:06:00Z',timezoneOffset:8};
  const questions=[
    ['十月八日至十五日','2026-10-08','2026-10-15'],
    ['10/8～10/15','2026-10-08','2026-10-15'],
    ['10月8到15之間','2026-10-08','2026-10-15'],
    ['2026-10-08 至 2026-10-15','2026-10-08','2026-10-15'],
    ['二〇二六年十月八日到十月十五號','2026-10-08','2026-10-15'],
    ['今年十二月廿八日至一月三日','2026-12-28','2027-01-03'],
    ['明年一月一號至二號','2027-01-01','2027-01-02']
  ];
  for(const [text,start,end] of questions){
    const q='想在'+text+'聯絡，哪幾天可以考慮？', lr=c.JYLiurenCompletion.windowFor(q,castDay), ly=c.JYLiuyaoCore.parseWindow(q,clock);
    assert.equal(lr.startDate,start,text);assert.equal(lr.endDateInclusive,end,text);
    assert.equal(ly.start,start,text);assert.equal(ly.end,end,text);
  }
  for(const q of ['2027年二月三十日至三月二日','十月十五日至八日','農曆十月八日至十五日','農曆正月初八至十五日','十月八日至十二日及十月十四日至十八日']){
    assert.throws(()=>c.JYLiurenCompletion.windowFor(q,castDay),/日期|國曆/);
    assert.throws(()=>c.JYLiuyaoCore.parseWindow(q,clock),/日期|國曆/);
  }
  assert.equal(c.JYLiurenCompletion.windowFor('今年會怎樣',castDay).source,'question-year');
  assert.equal(c.JYLiuyaoCore.parseWindow('我能合作嗎？',clock).status,'unspecified');
  const standalone=require('../JS/liuyao-core.js');
  assert.equal(standalone.parseWindow('10/8 到 10/15',clock).start,'2026-10-08');
  assert.equal(standalone.parseWindow('未來3天',clock).end,'2026-10-03');
  const override=c.JYLiurenCompletion.windowFor('十月八日至十五日',castDay,{startDate:'2026-10-09',endDate:'2026-10-10'});
  assert.equal(override.calendarDays,2);
  const q='我想約合作方試做小量包裝。十月八日至十五日，盤上哪兩個候選日值得聯絡？請各配對原來的觸發條件。';
  const chart=c.JYLiurenCore.calculate({question:q,date:castDay,time:'22:06'});
  assert.equal(chart.timing.window.calendarDays,8);
  assert.deepEqual(plain(chart.timing.candidates.map(d=>d.date)),['2026-10-08','2026-10-09','2026-10-12','2026-10-15']);
  const {body}=visit('liuren',chart,q);
  const table=api.get(body).projection.referenceSections.find(s=>s.label.includes('應期候選日'));
  assert.match(table.label,/全列4日/);assert.match(table.value,/2026-10-15[^\n]+用神值日/);
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
group('同一段只重複兩次、引文與正常寫法不當成機械迴圈',()=>{
  const work=c.JYReadingWorkflow,body=api.build('tarot',f.tarot,question);
  const line='我們應該等到週四的會議，才會知道實際結果。';
  const review=text=>work.checkChartText(body,text);
  const loop=review(['開場：朋友',line,line,line,'愚者（逆位）。','愚者（逆位）。'].join('\n'));
  assert.deepEqual(plain(loop.writing.map(p=>p.code)),['EDITORIAL_LABEL','REPEATED_PASSAGE']);
  assert.equal(loop.issues.length,1);
  assert.equal(review([line,line,'> '+line,'> '+line,'> '+line].join('\n')).writing.length,0);
});
const focusBlocks=body=>api.get(body).projection.referenceSections.filter(s=>/(?:^|／)本題起斷（/.test(s.label));
group('十五法各自帶入本盤的可判範圍，初讀、合讀與重讀共用同一筆資料',()=>{
  const charts={...f.charts,ootk:require('../docs/qa-single-paste27/ootk-fixture.json')};
  const native={tarot:/第[12]位・/,ootk:/第1輪・.*計數/,lenormand:/第[0-9、]+位｜.*→/,bazi:/日柱｜.*日主/,
    ziwei:/官祿/,astro:/10宮.*宮主/,vedic:/10宮.*掌/,liuren:/初傳.*｜/,liuyao:/爻.*｜/,yijing:/主讀.*｜/,
    meihua:/本卦用.*｜[\s\S]+變卦用/,oracle:/第1籤・第1句｜/,name:/各字筆畫/,compat:/雙方日主｜/,personality:/本模型選擇/};
  assert.deepEqual(Object.keys(charts).sort(),Object.keys(native).sort());
  for(const [kind,chart] of Object.entries(charts)){
    const {body}=visit(kind,chart,question,records),[primary]=focusBlocks(body),plan=api.get(body).projection;
    assert.ok(plan.coreBlocks.includes(primary.label),kind);
    assert.match(primary.value,native[kind],kind);
    assert.ok(primary.value.includes(c.JYConsultationEvidence.conclusionScope[kind]),kind);
    assert.match(body,/第一段直接斷原題/);
    assert.doesNotMatch(body,/做決定前可向現實核對|做法分成兩三個短段|命理名詞集中在依據行/);
    const again=api.rereadByMethod(body);
    for(const text of [primary.value,question,records.knownFacts,records.priority])assert.ok(again.includes(text),kind);
  }
  const both=api.buildMany([{method:'tarot',chart:f.tarot,label:'甲的牌陣'},{method:'yijing',chart:f.yi,label:'乙的卦'}],question);
  assert.equal(focusBlocks(both).length,2);
  focusBlocks(both).forEach(s=>assert.ok(api.rereadByMethod(both).includes('【'+s.label+'】\n'+s.value)));
  const halted=visit('ootk',f.ootk);assert.match(focusBlocks(halted.body)[0].value,/程序未成立/);
});

group('同問交往：渙之師主上九參九五，無咎不許成；咸靜卦仍能按取女吉斷利',()=>{
  const q='我和她會走到交往嗎？';
  const huan=c.JYYijingCore.calculate({values:[8,7,8,8,9,9],question:q}),body=visit('yijing',huan,q).body;
  assert.equal(huan.original.name,'渙');assert.equal(huan.changed.name,'師');
  const [focus]=focusBlocks(body);
  for(const text of ['主讀・渙卦上九','參讀・渙卦九五','遠害也','正位也','居中、當位','沒有直接許成的斷辭','之卦師只記卦變'])
    assert.ok(focus.value.includes(text),text);
  assert.doesNotMatch(body,/師出以律|丈人吉|渙其群|做決定前可向現實核對/);
  const unsupported='這卦不是「沒機會」，而是「有機會，但你越急著要答案，越容易把機會推掉」。';
  const check=(prompt,answer)=>c.JYReadingWorkflow.checkChartText(prompt,answer).issues.map(i=>i.code);
  assert.ok(check(body,unsupported).includes('YIJING_CLAIM_EXCEEDS_SELECTED_TEXT'));
  assert.ok(!check(body,'無咎是遠害後免咎，不能由此斷有機會交往。').length);
  const xian=c.JYYijingCore.calculate({values:[8,8,7,7,7,8],question:q}),alternate=visit('yijing',xian,q).body;
  assert.match(focusBlocks(alternate)[0].value,/咸卦卦辭.*取女吉/);
  assert.doesNotMatch(focusBlocks(alternate)[0].value,/沒有直接許成的斷辭/);
  assert.ok(!check(alternate,unsupported).includes('YIJING_CLAIM_EXCEEDS_SELECTED_TEXT'));
  for(const [values,main,extra] of [[[7,7,7,8,8,8],'小往大來','包荒'],[[8,8,8,7,7,7],'大往小來','包承']]){
    const chart=c.JYYijingCore.calculate({values,question}),staticBody=visit('yijing',chart).body;
    assert.ok(focusBlocks(staticBody)[0].value.includes(main));
    assert.ok(!staticBody.includes(extra));
    const study=visit('yijing',chart,'請列出完整爻辭，逐爻解讀。').body;
    assert.ok(study.includes(extra)&&!study.includes('【之卦全文'));
  }
  for(const values of [[7,6,9,6,8,8],Array(6).fill(9),Array(6).fill(6)]){
    const chart=c.JYYijingCore.calculate({values,question});
    const source=focusBlocks(visit('yijing',chart).body)[0].value;
    chart.reading.selections.forEach(s=>assert.ok(source.includes(s.text),s.label));
  }
});

group('只有明問現實做法才附行動，問物件戴法不強換成購物題',()=>{
  const asks=c.JYConsultationEvidence.asksForPractical;
  for(const q of ['她想跟我交往嗎？','這樣如何？','這個分盤怎麼看？','不用現實建議。'])assert.equal(asks(q,''),false,q);
  for(const q of ['我能做什麼？','我該如何開口？','該怎麼答覆？'])assert.equal(asks(q,''),true,q);
  assert.equal(asks('目前如何？','想知道下一步'),true);
  assert.ok(visit('tarot',f.tarot,'左手戴白水晶、右手黑曜石，這樣如何？').body.includes('原題問現有戴法'));
});
console.log('Consultation regression groups:',checked);
