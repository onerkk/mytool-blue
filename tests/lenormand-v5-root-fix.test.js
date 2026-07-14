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

// 1) 自動選陣：依問題形狀，不依領域硬分流。
const routeCases = [
  ['這月有肉體桃花嗎？', 'three'],
  ['我這月的副業能破萬營業額嗎？', 'three'],
  ['他會回我嗎？', 'three'],
  ['他對我怎麼想？', 'five'],
  ['為什麼生意卡住？我該怎麼改善？', 'five'],
  ['他會回我嗎？什麼時候？', 'five'],
  ['我該留職還是離職？', 'choice'],
  ['A或B哪個比較好？', 'choice'],
  ['未來三個月這段關係的走向、阻礙和結果如何？', 'nine'],
  ['今年感情、工作、財運整體如何？', 'grand'],
  ['請用九宮格解讀：這份工作值得繼續嗎？', 'nine'],
  ['我有三張發票要處理，會順利嗎？', 'three']
];
for (const [q, expected] of routeCases) {
  const got = api.detect(q);
  check(`route ${q}`, got.id === expected, `got ${got.id}, expected ${expected}; ${got.why}`);
}

// 2) 問題驗證：不可稽核的精確值、個資與獨立複合題在抽牌前攔截。
const invalidCases = [
  ['這月有肉體桃花？她幾歲？', '精確歲數'],
  ['他會在幾月幾日聯絡我？', '確切日期'],
  ['我這月營業額會是多少元？', '精確金額'],
  ['成功機率百分之幾？', '百分比'],
  ['未來對象的電話號碼是什麼？', '個資'],
  ['他愛我嗎？我的工作會升遷嗎？', '兩個獨立問題']
];
for (const [q, token] of invalidCases) {
  const v = api.validate(q);
  check(`validate rejects ${q}`, v.ok === false && v.reason.includes(token), v.reason);
}
check('empty question rejected', api.validate('').ok === false);

// 3) 手動牌陣也不能繞過適配規則。
check('three rejects why question', api.fit('為什麼他不回我？', 'three').ok === false);
check('three rejects timing question', api.fit('什麼時候收到通知？', 'three').ok === false);
check('choice rejects non-choice question', api.fit('這份工作值得繼續嗎？', 'choice').ok === false);
check('non-choice spread rejects A/B question', api.fit('留職還是離職？', 'five').ok === false);
check('explicit wrong spread rejected', api.detect('請用三張線解讀：為什麼生意卡住？').id === null);
check('nine may deepen a single yes/no issue', api.fit('這份工作值得繼續嗎？', 'nine').ok === true);

// 4) 牌義資料不再使用變相正逆位欄位。
check('all 36 cards use scope', api.cards.every(c => typeof c.scope === 'string' && c.scope.length > 0));
check('all 36 cards use guard', api.cards.every(c => typeof c.guard === 'string' && c.guard.length > 0));
check('no pos/neg fields', api.cards.every(c => !Object.prototype.hasOwnProperty.call(c,'pos') && !Object.prototype.hasOwnProperty.call(c,'neg')));
check('cloud direction guarded', api.cards[5].guard.includes('明暗面方向'));
check('coffin ending not beautified', api.cards[7].guard.includes('不可') && api.cards[7].scope.includes('結束'));
check('letter valence depends on neighbors', api.cards[26].guard.includes('相鄰牌'));
check('lily age-number ban', api.cards[29].guard.includes('不以牌號換算年齡'));

const sample3 = [31, 30, 23].map(id => api.cards[id - 1]);
const sample5 = [18, 27, 6, 21, 8].map(id => api.cards[id - 1]);
const sample7 = [31, 25, 35, 21, 3, 22, 23].map(id => api.cards[id - 1]);
const sample9 = [18,3,35,6,19,8,27,21,22].map(id => api.cards[id - 1]);
const sample36 = api.cards.slice();

// 5) 三張線封閉協定。
api.setSignif(null);
let p3 = api.build('這月有肉體桃花嗎？', sample3, 'three', null, 'male');
check('three exact legal set', p3.includes('合法組合只有：1-2、2-3、1-2-3'));
check('three forbids 1-3', p3.includes('1與3不相鄰，禁止另組1-3'));
check('three no past-present-future', p3.includes('沒有固定過去／現在／未來牌位'));
check('three uses semantic ranges', p3.includes('可用語義範圍：'));
check('three no old pos/neg labels', !p3.includes('順勢表現：') && !p3.includes('受阻表現：'));

// 6) 五張線封閉協定。
let p5 = api.build('為什麼這件事卡住？我該怎麼處理？', sample5, 'five', null, 'male');
check('five continuous triples', p5.includes('1-2-3、2-3-4、3-4-5'));
check('five forbids mirrors', p5.includes('禁止1-5、2-4等非相鄰鏡像組合'));
check('five center not single answer', p5.includes('第3張只作閱讀樞紐，不是單張答案'));

// 7) 雙路比較封閉協定。
let p7 = api.build('留職還是離職？', sample7, 'choice', null, 'male');
check('choice A isolated', p7.includes('A只讀1-2、2-3、1-2-3'));
check('choice B isolated', p7.includes('B只讀5-6、6-7、5-6-7'));
check('choice center not cross-paired', p7.includes('不與任何單張跨支線硬組'));
check('choice not positive-card vote', p7.includes('不得以哪一邊好牌較多直接判勝'));

// 8) 九宮格封閉協定。
let p9 = api.build('這段關係的整體走向、阻礙與結果如何？', sample9, 'nine', null, 'male');
check('nine eight lines listed', p9.includes('1-2-3、4-5-6、7-8-9、1-4-7、2-5-8、3-6-9、1-5-9、3-5-7'));
check('nine forbids skipped endpoints', p9.includes('1-3、1-7、3-9都不是該線中的相鄰牌組'));
check('nine excludes extra geometry', p9.includes('不使用四角、對稱、鏡像、騎士跳'));
check('nine no fixed psychological/time rows', p9.includes('三列不固定是過去／現在／未來') && p9.includes('三排不固定是意識／現實／潛意識'));
check('nine center cannot decide alone', p9.includes('第5張聚焦，但不能單張決定答案'));

// 9) 大牌陣：本人牌與自選議題牌分離，座標與鄰牌機械輸出。
api.setSignif(34); // 自選魚只作議題牌
let pg = api.build('今年整體財務與工作如何？', sample36, 'grand', null, 'male');
check('grand person remains man, not custom fish', pg.includes('問卜者本人代表為紳士(28)'));
check('grand custom focus identified separately', pg.includes('使用者已預選議題定位牌：34.魚') && pg.includes('預選議題定位牌：魚在'));
check('grand coordinate index present', pg.includes('全牌座標索引：'));
check('grand person neighbor map present', pg.includes('本人牌立即鄰牌：'));
check('grand focus neighbor map present', pg.includes('預選議題牌立即鄰牌：'));
check('grand tail has no fake vertical adjacency', pg.includes('末排只在自身左右形成連續線'));
check('grand only contiguous rays', pg.includes('不跳牌連續序列'));
check('grand no absent-card evidence', pg.includes('全36張都必然出現'));
check('grand excludes mixed later techniques', pg.includes('不使用房屋、騎士跳、鏡像、四角、命運線'));

// Geometry sanity.
check('grand R1C1 coordinate', api.grandCoord(0).label === 'R1C1');
check('grand R4C8 coordinate', api.grandCoord(31).label === 'R4C8');
check('grand tail coordinate', api.grandCoord(35).label === '末排4');
check('corner has 3 neighbors', api.grandNeighbors(sample36, 0).length === 3);
check('middle main card has 8 neighbors', api.grandNeighbors(sample36, 9).length === 8);
check('tail inner card has 2 neighbors', api.grandNeighbors(sample36, 33).length === 2);

// 10) 固定品牌附加層不被牌名白名單或短答規則吃掉。
for (const [name, prompt] of [['three',p3],['five',p5],['choice',p7],['nine',p9],['grand',pg]]) {
  check(`${name} mandatory brand layer`, prompt.includes('【品牌附加層・固定營運收尾】'));
  check(`${name} explicit ad separation`, prompt.includes('以下為免費服務的品牌資訊，與本次牌義結論分開：'));
  check(`${name} white crystal fallback`, prompt.includes('若無法合理選石，固定介紹白水晶'));
  check(`${name} exact Shopee tail`, prompt.endsWith('[靜月之光蝦皮賣場](https://shopee.tw/a50h95648d?tab=shop)\n願你諸事順遂。'));
}

if (failed) {
  console.error(`\n${failed} failed, ${passed} passed.`);
  process.exit(1);
}
console.log(`PASS: ${passed} Lenormand v5.0 root-fix checks.`);
