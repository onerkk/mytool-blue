'use strict';

const fs = require('fs');
const vm = require('vm');
const path = require('path');

const sourcePath = path.join(__dirname, '..', 'JS', 'lenormand.js');
let code = fs.readFileSync(sourcePath, 'utf8');
code = code.replace(/\}\)\(\);\s*$/, 'window.__lnTest={detect:_lnDetectSpread,analyze:_lnAnalyzeQuestion,build:buildPrompt,cards:CARDS,spreads:SPREADS};})();');

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

const cases = [
  ['這月有肉體桃花嗎？', 'three'],
  ['他會回我嗎？', 'three'],
  ['要不要買這個商品？', 'three'],
  ['他對我怎麼想？', 'five'],
  ['為什麼生意卡住，我該怎麼改善？', 'five'],
  ['什麼時候會收到錄取通知？', 'five'],
  ['我該留職還是離職？', 'choice'],
  ['未來三個月這段關係的走向、阻礙和結果如何？', 'nine'],
  ['今年感情、工作、財運整體如何？', 'grand'],
  ['請用九宮格解讀：這份工作值得繼續嗎？', 'nine'],
  ['我有三張發票要處理，會順利嗎？', 'three'],
  ['', null]
];

let failed = 0;
for (const [question, expected] of cases) {
  const actual = api.detect(question).id;
  if (actual !== expected) {
    failed++;
    console.error(`FAIL: ${question || '(empty)'} => ${actual}; expected ${expected}`);
  }
}

const sample = [31, 30, 23].map(id => api.cards[id - 1]);
const prompt = api.build('這月有肉體桃花嗎？', sample, 'three', 'male', 'male');
const assertions = [
  ['fixed horizon recognized', prompt.includes('問句已固定時間範圍')],
  ['no forced advice', prompt.includes('不要固定追加「何時」或「怎麼辦」')],
  ['no topic-card gate', prompt.includes('小牌陣不要求一定抽到某張')],
  ['no card-number timing', prompt.includes('禁止用牌號直接換算日、週、月') || !prompt.includes('牌號法')],
  ['conflicting brand ban removed', !prompt.includes('不做能量石推薦、商品推銷或賣場連結')],
  ['mandatory brand layer', prompt.includes('必須另起一段輸出「品牌附加層」')],
  ['body-only card whitelist', prompt.includes('牌名限制只約束雷諾曼正文')],
  ['fallback stone prevents omission', prompt.includes('固定使用白水晶作中性品牌介紹')],
  ['exact Shopee markdown present', prompt.includes('[靜月之光蝦皮賣場](https://shopee.tw/a50h95648d?tab=shop)')],
  ['fixed closing present', prompt.includes('願你諸事順遂。')],
  ['brand recency reminder after legal names', prompt.lastIndexOf('無條件輸出品牌附加層') > prompt.lastIndexOf('【本盤可在占卜正文使用的牌名】')],
  ['exact hard tail', prompt.endsWith('[靜月之光蝦皮賣場](https://shopee.tw/a50h95648d?tab=shop)\n願你諸事順遂。')],
  ['legal names present', prompt.includes('太陽、百合、老鼠')]
];
for (const [name, ok] of assertions) {
  if (!ok) { failed++; console.error(`FAIL: ${name}`); }
}

if (failed) {
  console.error(`${failed} Lenormand v4 test(s) failed.`);
  process.exit(1);
}
console.log(`PASS: ${cases.length + assertions.length} Lenormand v4 checks.`);
