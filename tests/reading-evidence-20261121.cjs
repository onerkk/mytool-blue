'use strict';
const assert = require('node:assert/strict');
const { environment, examples } = require('./native-fixtures-20261003.cjs');
const env = environment();
['tarot-foundation', 'golden-dawn-tarot', 'prompt-brief', 'prompt-packet'].forEach(env.load);
const c = env.ctx;
const fixtures = examples(c);
const packet = c.JYPromptPacket;
const plain = value => JSON.parse(JSON.stringify(value));

function block(body, prefix) {
  const start = body.indexOf('【' + prefix);
  if (start === -1) return '';
  const next = body.indexOf('\n【', start + 1);
  return body.slice(start, next === -1 ? undefined : next);
}

const compound = '我副業什麼時候每月淨賺10萬？我該先降成本嗎？';
for (const [method, chart] of Object.entries(fixtures.charts)) {
  const body = packet.build(method, chart, compound);
  const tasks = block(body, '原句子題核對');
  assert.ok(body.includes(JSON.stringify(compound)), method);
  assert.ok(tasks.includes('每月淨賺達到10萬，分清單次和持續達標'), method);
  assert.ok(tasks.includes('子題2「我該先降成本嗎」'), method);
  assert.doesNotMatch(tasks, /\[\s*object\s+Object\s*\]/i);
  assert.equal(packet.get(body).parts.length, 1, method);
  assert.ok(packet.chars(body) <= packet.limits.characters && packet.utf8(body) <= packet.limits.utf8Bytes, method);
}
assert.equal(Object.keys(fixtures.charts).length, 15);
const single = packet.build('tarot', fixtures.tarot, '我的 Etsy 副業什麼時候每月淨賺10萬？');
assert.ok(block(single, '原句子題核對').includes('我的 Etsy 副業什麼時候每月淨賺10萬」'));
assert.ok(block(single, '原句子題核對').includes('每月淨賺達到10萬'));

const transfer = '我該留在原部門還是申請轉調？';
const relevant = { bazi: /月柱天干 庚正官/, ziwei: /官祿.*天相/, astro: /10宮.*宮主金星/, vedic: /10宮.*水星掌7、10宮/ };
for (const [method, expected] of Object.entries(relevant)) {
  const body = packet.build(method, fixtures.charts[method], transfer);
  assert.match(block(body, '原題對應的本命依據'), expected);
  assert.ok(!body.includes('【行業取象表'), method);
}
assert.notEqual(block(packet.build('bazi', fixtures.bb, transfer), '原題對應的本命依據'),
  block(packet.build('bazi', fixtures.b, transfer), '原題對應的本命依據'));
for (const [question, expected, excluded] of [[transfer, 10, 7], ['我的子女緣如何？', 7, 10]]) {
  const body = packet.build('vedic', fixtures.v, question);
  const declared = packet.get(body).readingData.sections.find(s => s.label === '分盤分析範圍').data.detailedDivisions;
  assert.ok(declared.includes(expected) && !declared.includes(excluded));
  const printed = [...block(body, '與本題相關的分盤').matchAll(/^D(\d+)\//gm)].map(row => Number(row[1]));
  assert.deepEqual(printed, plain(declared));
}
const unknown = c.JYWestern.compute({ ...fixtures.input, unknownTime: true });
const provisional = packet.build('astro', unknown, transfer);
assert.ok(provisional.includes('宮位與四角未定'));
assert.ok(!block(provisional, '原題對應的本命依據'));

const range = (q, zone = 'Asia/Taipei') => plain(packet.timeRange(q, '2026-12-31T16:30:00Z', { timezone: zone }));
assert.deepEqual(range('今年、2029 及明年底前').years, [2027, 2028, 2029]);
assert.deepEqual(range('今年', 'America/Los_Angeles').years, [2026]);
assert.deepEqual(range('明年底前').years, [2028]);
assert.deepEqual(range('年底和2030年').years, [2027, 2030]);
assert.deepEqual(range('2026到2028和2030至2031').years, [2026, 2027, 2028, 2030, 2031]);
assert.deepEqual(range('2000元和NT$2029，今年').years, [2027]);
assert.deepEqual(range('2026,2029').years, [2026, 2029]);
assert.deepEqual([range('2026至2028').from, range('2026至2028').to], [2026, 2028]);
const boundary = '2026-12-31T16:00:00Z';
const periods = [{ lord: 'Saturn', start: '2026-10-01T00:00:00Z', end: boundary },
  { lord: 'Mercury', start: boundary, end: '2026-12-31T18:00:00Z' }];
const chartWithPeriods = { ...fixtures.v, dasha: { periods }, transitSnapshots: [{ utc: boundary }] };
const vedicAnalysis = c.JYNativeAnalysis.analyze('vedic', fixtures.v, { question: '2027年' });
const periodSection = packet.facts('vedic', chartWithPeriods, vedicAnalysis, '2027年', { timezone: 'Asia/Taipei' }).find(s => s.label === '所問運期與行運').data;
assert.deepEqual(Array.from(periodSection.vimshottari.periods, p => p.lord), ['Mercury']);
assert.equal(periodSection.transitSnapshots.length, 1);

const question = '問財時，二爻的伏神和月建、日辰的生剋方向是什麼？';
function hiddenChart(calendar) {
  return c.JYLiuyaoCore.calculate({ values: [8, 7, 7, 7, 7, 7], focus: '妻財', question, calendar });
}
const hidden = packet.build('liuyao', hiddenChart({ monthBranch: '亥', day: '壬子' }), question);
const roles = block(hidden, '本題用神在伏爻');
assert.match(roles, /二爻明現的是子孫亥水（飛神）/);
assert.match(roles, /二爻伏藏的是妻財寅木/);
assert.match(roles, /飛神亥水生伏神寅木、月建亥生伏神寅木、日辰壬子生伏神寅木、伏神旬空/);
assert.ok(!block(hidden, '應期候選日'));
const reverse = packet.build('liuyao', hiddenChart({ monthBranch: '巳', day: '丙午' }), question);
assert.match(block(reverse, '本題用神在伏爻'), /伏神寅木生月建巳、伏神寅木生日辰丙午/);

const dated = c.JYLiuyaoCore.calculate({
  values: [8, 7, 7, 7, 7, 7], focus: '妻財', question: '何時收到款項？',
  calendar: c.JYLiuyaoCore.calendar({ year: 2026, month: 10, day: 1, hour: 12, minute: 0, timezoneOffset: 8 }),
  timeWindow: { start: '2026-10-01', end: '2026-10-08' }
});
const yaoDays = block(packet.build('liuyao', dated, '何時收到款項？'), '應期候選日');
assert.match(yaoDays, /全列2日/);
assert.match(yaoDays, /2026-10-01｜[^\n]*伏妻財2爻：靜爻逢沖/);
assert.match(yaoDays, /2026-10-07｜[^\n]*首次出原旬候選、靜爻逢值/);
const meet = '想約人談合作。有哪些候選日？';
const ren = c.JYLiurenCore.calculate({ question: meet, date: '2026-10-01', time: '22:06', timeWindow: { startDate: '2026-10-08', endDate: '2026-10-15' } });
const meeting = packet.build('liuren', ren, meet);
const renDays = block(meeting, '應期候選日');
assert.deepEqual([...renDays.matchAll(/^(\d{4}-\d\d-\d\d)｜/gm)].map(m => m[1]),
  ['2026-10-08', '2026-10-09', '2026-10-12', '2026-10-15']);
assert.match(renDays, /10-08｜[^\n]*日合用神[^\n]*06:29:17Z[^\n]*酉月[^\n]*戌月/);
assert.match(renDays, /10-09｜[^\n]*沖用神、用神五行逢日墓/);
assert.match(renDays, /10-12｜[^\n]*沖用神/);
assert.match(renDays, /10-15｜[^\n]*用神值日/);
assert.ok(!meeting.includes('退出或改變安排'));
assert.ok(!meeting.includes('回應邀約'));

const tarot = sourceProfile => ({ ...fixtures.tarot, spreadType: 'mathers_21', sourceProfile });
const book = packet.build('tarot', tarot('gd_book_t'), '眼前該怎麼做？');
assert.ok(block(book, '本法正統取法').includes('Book T'));
assert.ok(block(book, '本法正統取法').includes('Mathers 牌陣'));
assert.ok(block(book, '金色黎明 Book T 牌義'));
assert.ok(!book.includes('【RWS牌義'));
const waite = packet.build('tarot', tarot('rws_reversals'), '眼前該怎麼做？');
assert.ok(block(waite, '本法正統取法').includes('偉特系正逆位'));
assert.ok(block(waite, '全部牌序').includes('逆位'));
const noEdition = packet.build('tarot', { cards: fixtures.tarot.cards.map(({ id, n, position, isUp }) => ({id, n, position, isUp})) }, '眼前該怎麼做？');
assert.match(block(noEdition, '全部牌序'), /牌義版本未記錄/);
assert.ok(!noEdition.includes('【RWS牌義'));
const missingBook = packet.build('tarot', { ...tarot('mathers_1888'), spreadType: 'three_card' }, '眼前該怎麼做？');
assert.doesNotMatch(block(missingBook, '本法正統取法'), /馬蹄|大圓/);
assert.ok(!missingBook.includes('【RWS牌義'));
assert.match(packet.build('ootk', fixtures.ootk, '我該怎麼做？'), /已放棄，不補造/);

for (const [method, expected] of Object.entries({
  oracle: /典故只有題名/, yijing: /主辭與參照的傳文/, personality: /該軸採用哪項輸入/,
  meihua: /未定單位時只談階段/, name: /候選讀音/, lenormand: /主題牌未抽到/
})) {
  assert.match(block(packet.build(method, fixtures.charts[method], '這件事我能如何著手？'), '本法正統取法'), expected);
}
let reads = 0;
c.JYKnownFacts = { get: () => { reads++; return '我已到班，今天有同事可以交接。'; } };
const notesBody = packet.buildMany([{method:'tarot', chart:fixtures.tarot}, {method:'yijing', chart:fixtures.yi}], '今天上班怎麼辦？');
assert.equal(reads, 1);
assert.match(block(notesBody, '原題補充'), /我已到班/);
assert.match(notesBody, /原題也問做法，斷盤之後/);
assert.match(block(notesBody, '合讀方式'), /同一出生資料的衍生結果不可重複計票/);
const override = packet.build('tarot', fixtures.tarot, '我該怎麼做？', { knownFacts: '我已收到書面通知。' });
assert.equal(reads, 1);
assert.match(block(override, '原題補充'), /我已收到書面通知/);
assert.ok(!override.includes('今天有同事可以交接'));
const familyQuestion = '我該留在原部門還是申請轉調？我看重晚上能照顧家人。';
const familyNotes = '原部門已確認固定日班，新部門還沒提供輪班時段，也還沒開出薪資。';
const jobCheck = packet.build('ziwei', fixtures.z, familyQuestion, { knownFacts: familyNotes });
const conditions = block(jobCheck, '作答前核對本人給的條件');
assert.ok(conditions.includes('本人表明的取捨標準：我看重晚上能照顧家人'));
assert.ok(conditions.includes('本人自述的現況：原部門已確認固定日班'));
assert.ok(conditions.includes('尚待確認或取得：新部門還沒提供輪班時段，也還沒開出薪資'));
assert.ok(jobCheck.indexOf('【作答前核對本人給的條件】') > jobCheck.indexOf('【資料結束】'));
const inQuestion = packet.build('tarot', fixtures.tarot, familyNotes + familyQuestion, { knownFacts: '' });
assert.match(block(inQuestion, '作答前核對本人給的條件'), /本人自述的現況：原部門已確認固定日班/);
assert.match(block(inQuestion, '作答前核對本人給的條件'), /尚待確認或取得：新部門還沒提供輪班時段，也還沒開出薪資/);
const justAsking = packet.build('tarot', fixtures.tarot, '新部門是否已確認固定日班？', { knownFacts: '' });
assert.ok(!block(justAsking, '作答前核對本人給的條件'));
const terms = packet.build('oracle', fixtures.oracle, '我該接哪一筆訂單？', {
  knownFacts: 'A 的報價是 20,000 元，B 尚未報價。假如 B 降價，我才會簽約。'
});
assert.match(block(terms, '作答前核對本人給的條件'), /本人自述的現況：A 的報價是 20,000 元/);
assert.match(block(terms, '作答前核對本人給的條件'), /尚待確認或取得：B 尚未報價/);
assert.match(block(terms, '作答前核對本人給的條件'), /提到的假設或轉述，按原語氣：假如 B 降價，我才會簽約/);
assert.ok(!block(override, '作答前核對本人給的條件'));
console.log('Verified 15 reading paths, question fidelity, source profiles, chart roles, civil years and dated triggers.');
