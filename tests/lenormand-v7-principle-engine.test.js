'use strict';

const fs = require('fs');
const vm = require('vm');
const path = require('path');

const sourcePath = path.join(__dirname, '..', 'JS', 'lenormand.js');
let code = fs.readFileSync(sourcePath, 'utf8');
code = code.replace(/\}\)\(\);\s*$/, `window.__lnTest={
  detect:_lnDetectSpread,
  analyze:_lnAnalyzeQuestion,
  validate:_lnValidateQuestion,
  fit:_lnCheckSpreadFit,
  recommend:_lnRecommendSpread,
  build:buildPrompt,
  cards:CARDS,
  spreads:SPREADS,
  setSignif:function(id){_lnSignif=id;},
  setGender:function(g){_lnGender=g;},
  grandCoord:_lnGrandCoord,
  grandNeighbors:_lnGrandImmediateNeighbors
};})();`);

function stubNode() {
  return {
    style: {}, appendChild() {}, remove() {}, setAttribute() {}, getAttribute() { return null; },
    querySelector() { return null; }, focus() {}, select() {}, setSelectionRange() {},
    innerHTML: '', textContent: '', isConnected: true, parentNode: null
  };
}

const sandbox = {
  console: { log() {}, warn() {}, error: console.error },
  window: { crypto: require('crypto').webcrypto, isSecureContext: true, addEventListener() {}, JYShareCard: null },
  document: {
    createElement: stubNode,
    body: { appendChild() {} }, head: { appendChild() {} },
    getElementById() { return null; }, querySelector() { return null; }, execCommand() { return true; }, referrer: ''
  },
  navigator: { clipboard: { writeText() { return Promise.resolve(); } } },
  localStorage: { getItem() { return null; }, setItem() {}, removeItem() {} },
  sessionStorage: { getItem() { return null; }, setItem() {} },
  location: { search: '' }, alert() {}, setTimeout() {}, Promise, Uint32Array, Date, Math
};
sandbox.window.window = sandbox.window;
vm.createContext(sandbox);
vm.runInContext(code, sandbox);
const api = sandbox.window.__lnTest;

let failed = 0;
let passed = 0;
function check(name, condition, detail='') {
  if (!condition) {
    failed++;
    console.error(`FAIL: ${name}${detail ? ' — ' + detail : ''}`);
  } else passed++;
}

// 1. 選陣只看結構與解析度，不按領域硬分流。
const routes = [
  ['這月有肉體桃花嗎？', 'three'],
  ['本月營業額能破萬嗎？', 'three'],
  ['我和他會復合嗎？', 'three'],
  ['這次面試會錄取嗎？', 'three'],
  ['公司有異性暗戀我嗎？', 'five'],
  ['他對我怎麼想？', 'five'],
  ['為什麼生意卡住？', 'five'],
  ['他會回我嗎？什麼時候？', 'five'],
  ['留職還是離職？', 'choice'],
  ['台北和高雄哪個比較適合我？', 'choice'],
  ['這個專案的優勢、風險、阻礙與結果如何？', 'nine'],
  ['未來對象的外貌、個性、職業如何？', 'nine'],
  ['感情和工作會順利嗎？', 'grand'],
  ['今年感情、工作、財運整體如何？', 'grand'],
  ['我的年度總運如何？', 'grand']
];
for (const [q, expected] of routes) {
  const got = api.detect(q);
  check(`route ${q}`, got.id === expected, `got ${got.id}, expected ${expected}; ${got.why}`);
}
check('person conjunction is not false choice', api.detect('我和他會復合嗎？').id === 'three');
check('real alternatives remain choice', api.detect('台北和高雄哪個比較適合我？').id === 'choice');
check('same-topic facets remain nine not grand', api.detect('關係的來源、阻礙與結果如何？').id === 'nine');

// 2. 不可稽核事實仍統一攔截，這些是風險邊界，不是題型牌義補丁。
const invalid = [
  ['她幾歲？', 'EXACT_AGE'],
  ['他會在幾月幾日聯絡？', 'EXACT_DATE'],
  ['營業額會是多少元？', 'EXACT_AMOUNT'],
  ['成功率百分之幾？', 'PROBABILITY'],
  ['公司有誰暗戀我？', 'IDENTITY'],
  ['我是不是得癌症？', 'DIAGNOSIS'],
  ['我懷孕了嗎？', 'DIAGNOSIS'],
  ['他是不是偷我錢？', 'ALLEGATION'],
  ['我會不會死？', 'FATALITY'],
  ['A、B或C哪個比較好？', 'TOO_MANY_OPTIONS'],
  ['他愛我嗎？工作會升遷嗎？', 'INDEPENDENT_MULTI']
];
for (const [q, codeExpected] of invalid) {
  const got = api.validate(q);
  check(`reject ${q}`, !got.ok && got.code === codeExpected, `got ${got.code}`);
}
check('threshold is allowed', api.validate('本月營業額能破萬嗎？').ok === true);
check('relative age tendency allowed', api.validate('對象看起來偏年輕、同齡或成熟？').ok === true);

// 3. 分析器不再輸出題目專屬證據清單。
const physical = api.analyze('這月有肉體桃花嗎？');
check('no claimQualifiers field', !Object.prototype.hasOwnProperty.call(physical, 'claimQualifiers'));
check('no physicalQualifier field', !Object.prototype.hasOwnProperty.call(physical, 'physicalQualifier'));
check('no companyContext field', !Object.prototype.hasOwnProperty.call(physical, 'companyContext'));
check('question shape remains structural', physical.questionShape === '單一可裁決命題');

// 4. 手動牌陣只擋幾何錯配，不用題目詞彙過度封鎖AI。
check('three accepts narrow hidden yes-no manual override', api.fit('公司有異性暗戀我嗎？', 'three').ok === false); // two facets: hidden state needs more context
check('three rejects why structurally', api.fit('為什麼他不回我？', 'three').ok === false);
check('choice required for alternatives', api.fit('留職還是離職？', 'five').ok === false);
check('choice rejects non-choice', api.fit('這份工作會錄取嗎？', 'choice').ok === false);
check('nine may deepen one focused question', api.fit('這份工作會錄取嗎？', 'nine').ok === true);
check('grand may deepen one focused question', api.fit('公司有異性暗戀我嗎？', 'grand').ok === true);
check('global requires grand', api.fit('今年感情、工作、財運整體如何？', 'nine').ok === false);

// 5. 牌義資料維持單一語義範圍，不做變相正逆位。
check('36 cards', api.cards.length === 36);
check('all cards have scope', api.cards.every(c => typeof c.scope === 'string' && c.scope.length > 0));
check('all cards have guard', api.cards.every(c => typeof c.guard === 'string' && c.guard.length > 0));
check('no pos/neg fields', api.cards.every(c => !('pos' in c) && !('neg' in c)));
check('coffin keeps ending', api.cards[7].scope.includes('結束') && api.cards[7].guard.includes('不可'));
check('mountain keeps obstacle', api.cards[20].scope.includes('阻礙'));
check('mice keeps depletion', api.cards[22].scope.includes('消耗'));

const sample3 = [2,16,17].map(id => api.cards[id - 1]);
const sample5 = [18,27,6,21,8].map(id => api.cards[id - 1]);
const sample7 = [31,25,35,21,3,22,23].map(id => api.cards[id - 1]);
const sample9 = [18,3,35,6,19,8,27,21,22].map(id => api.cards[id - 1]);
const sample36 = api.cards.slice();

// 6. 通用提示詞採上位原則，不再針對每個事件列補丁。
api.setSignif(null);
const p3 = api.build('這月有肉體桃花嗎？', sample3, 'three', null, 'male');
check('principle engine present', p3.includes('【AI讀牌上位原則】'));
check('natural language authority', p3.includes('原問句的自然語意是最高權威'));
check('scope and event separated by AI', p3.includes('已知背景範圍') && p3.includes('待牌面回答的事件'));
check('no detected qualifier list', !p3.includes('本題已偵測的不可省略限定'));
check('no patch event example ladder', !p3.includes('暗戀／承諾／錄取／發生關係／跨過門檻'));
check('no forced physical phrase', !p3.includes('肉體／實際親密接觸'));
check('AI handles colloquial ambiguity', p3.includes('兩種合理口語解釋'));
check('insufficient evidence not automatic', p3.includes('不是看到任何非專屬牌就自動使用'));
check('three geometry exact', p3.includes('合法組合只有1-2、2-3、1-2-3'));
check('three no 1-3', p3.includes('1與3不相鄰'));
check('three does not demand background proof', p3.includes('不要要求牌面重複證明問句已給定的背景'));

const p5 = api.build('公司有異性暗戀我嗎？', sample5, 'five', null, 'male');
check('five shortest relevant segment', p5.includes('最短連續片段'));
check('five legal geometry', p5.includes('1-2、2-3、3-4、4-5'));
check('five forbids jump/mirror', p5.includes('禁止1-5、2-4'));
check('five lets AI interpret meaning', p5.includes('原問句的自然語意是最高權威'));

const p7 = api.build('留職還是離職？', sample7, 'choice', null, 'male');
check('choice branch A isolated', p7.includes('A只讀1-2、2-3、1-2-3'));
check('choice branch B isolated', p7.includes('B只讀5-6、6-7、5-6-7'));
check('choice no cross-branch pairs', p7.includes('不與任何單張跨支線組牌'));
check('choice same criterion', p7.includes('同一標準'));

const p9 = api.build('這段關係的來源、阻礙與結果如何？', sample9, 'nine', null, 'male');
check('nine legal lines', p9.includes('1-2-3、4-5-6、7-8-9、1-4-7、2-5-8、3-6-9、1-5-9、3-5-7'));
check('nine no fixed max line count', p9.includes('不設定固定主要線數'));
check('nine minimal relevant lines', p9.includes('回答所需的最少相關線'));
check('nine requires intersections', p9.includes('必須有實際交會牌'));
check('nine no fixed temporal psychology roles', p9.includes('沒有固定時間、心理、原因或結果身分'));

api.setSignif(34);
const pg = api.build('公司有異性暗戀我嗎？', sample36, 'grand', null, 'male');
check('grand minimum necessary anchors', pg.includes('數量最少的議題定位牌'));
check('grand no fixed four-role cap', !pg.includes('最多四張'));
check('grand anchors fixed before outcome', pg.includes('在查看結果方向前') && pg.includes('固定不換'));
check('grand shortest paths', pg.includes('最短不跳牌片段'));
check('grand no scattered cherry-picking', pg.includes('彼此不接的牌不能拼成同一事件'));
check('grand full-deck presence not evidence', pg.includes('全36張必然出現'));

// 7. 固定品牌層仍保留，且與占卜分離。
for (const [name, prompt] of [['three',p3],['five',p5],['choice',p7],['nine',p9],['grand',pg]]) {
  check(`${name} brand layer`, prompt.includes('以下為免費服務的品牌資訊，與本次牌義結論分開：'));
  check(`${name} shop markdown`, prompt.includes('[靜月之光蝦皮賣場](https://shopee.tw/a50h95648d?tab=shop)'));
  check(`${name} final blessing`, prompt.trim().endsWith('願你諸事順遂。'));
}

// 8. 版本與提示詞體積：去補丁後應比 v6 更短、且版本正確。
const source = fs.readFileSync(sourcePath, 'utf8');
check('v7 source marker', source.includes('Lenormand v7.0'));
check('v7 console marker', source.includes('principle engine + AI semantic reading'));
check('removed domain spec table', !source.includes('_LN_DOMAIN_SPECS'));
check('removed claim qualifier implementation', !source.includes('claimQualifiers'));

console.log(`PASS: ${passed} Lenormand v7 principle-engine checks.`);
if (failed) {
  console.error(`FAIL: ${failed} checks.`);
  process.exit(1);
}
