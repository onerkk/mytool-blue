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
  grandNeighbors:_lnGrandImmediateNeighbors,
  grandLines:_lnGrandStraightLines,
  grandSegmentCount:_lnGrandMainSegmentCount,
  grandLinesThrough:_lnGrandLinesThroughText
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

// 1. 自動選陣仍提供合理建議，但手動選陣不再因題型分類被前端攔截。
const routes = [
  ['我副業能成功嗎？', 'three'],
  ['為什麼生意卡住？', 'five'],
  ['留職還是離職？', 'choice'],
  ['這個專案的優勢、風險與結果如何？', 'nine'],
  ['A、B、C三個方案哪個較適合？', 'nine'],
  ['今年感情、工作、財運整體如何？', 'grand']
];
for (const [q, expected] of routes) {
  const got = api.detect(q);
  check(`auto route ${q}`, got.id === expected, `got ${got.id}; ${got.why}`);
}
for (const spread of ['three','five','choice','nine','grand']) {
  check(`manual spread accepted ${spread}`, api.fit('現任是我這輩子最後一位正緣嗎？', spread).ok === true);
}
check('manual mismatch carries resolution note', api.fit('今年感情、工作、財運整體如何？', 'three').resolutionNote.includes('本次仍依你選的牌陣完整解讀'));

// 2. 只有不能由占卜代替的高風險事實判定被攔截；複合、精確與非典型問句可交給AI分層回答。
for (const q of [
  '她幾歲？',
  '他會在幾月幾日聯絡？',
  '營業額會是多少元？',
  '成功率百分之幾？',
  '公司有誰暗戀我？',
  '工作、感情、家庭三件事都怎麼走？',
  'A、B、C三個方案哪個較適合？'
]) check(`adaptive question allowed ${q}`, api.validate(q).ok === true);
for (const [q, code] of [
  ['我是不是得癌症？', 'DIAGNOSIS'],
  ['他是不是偷我錢？', 'ALLEGATION'],
  ['我會不會死？', 'FATALITY']
]) {
  const got = api.validate(q);
  check(`high risk blocked ${q}`, got.ok === false && got.code === code, `got ${got.code}`);
}

// 3. 牌義資料保持窄域語義，不使用正逆位或固定事件輸出欄位。
check('36 cards', api.cards.length === 36);
check('semantic scopes complete', api.cards.every(c => c.key && c.scope && c.guard));
check('no tarot polarity fields', api.cards.every(c => !('pos' in c) && !('neg' in c) && !('upright' in c) && !('reversed' in c)));

const sample3 = [22,34,27].map(id => api.cards[id - 1]);
const sample5 = [18,27,6,21,8].map(id => api.cards[id - 1]);
const sample7 = [31,25,35,21,3,22,23].map(id => api.cards[id - 1]);
const sample9 = [18,3,35,6,19,8,27,21,22].map(id => api.cards[id - 1]);
const grandIds = [35,20,5,32,19,18,23,13,8,15,27,12,21,28,31,7,29,1,2,30,25,16,34,6,9,17,36,22,26,10,24,14,11,4,3,33];
const sample36 = grandIds.map(id => api.cards[id - 1]);
api.setSignif(null);

const p3 = api.build('現任是我這輩子最後一位正緣嗎？', sample3, 'three', null, 'male');
const p5 = api.build('為什麼生意卡住？', sample5, 'five', null, 'male');
const p7 = api.build('留職還是離職？', sample7, 'choice', null, 'male');
const p9 = api.build('這段關係的來源、阻礙與結果如何？', sample9, 'nine', null, 'male');
const pg = api.build('現任是我這輩子最後一位正緣嗎？', sample36, 'grand', null, 'male');

// 4. 共用核心是正向分析流程：保真、候選牌句、長線折疊、全盤競爭、命題圖、建議與語義飽和。
for (const [name, prompt] of [['three',p3],['five',p5],['choice',p7],['nine',p9],['grand',pg]]) {
  check(`${name} adaptive core`, prompt.includes('<自適應牌句推理核心>'));
  check(`${name} question fidelity`, prompt.includes('第一階段｜問題保真'));
  check(`${name} role frame`, prompt.includes('第二階段｜角色框架'));
  check(`${name} local alternatives`, prompt.includes('第三階段｜局部多假設'));
  check(`${name} recursive folding`, prompt.includes('第四階段｜遞迴折疊'));
  check(`${name} whole-spread competition`, prompt.includes('第五階段｜全盤一致性選擇'));
  check(`${name} proposition graph`, prompt.includes('第六階段｜命題圖整合'));
  check(`${name} global adjudication`, prompt.includes('第七階段｜整體裁決'));
  check(`${name} practical translation`, prompt.includes('第八階段｜生活轉譯與建議'));
  check(`${name} semantic saturation`, prompt.includes('第九階段｜語義飽和'));
  check(`${name} does not stop at first story`, prompt.includes('不要停在第一個想到的解釋'));
  check(`${name} uses global coherence`, prompt.includes('能同時解釋更多實際牌句') && prompt.includes('需要更少盤外假設'));
  check(`${name} counter-evidence stress test`, prompt.includes('反證壓力測試') && prompt.includes('削弱、改寫或限定'));
  check(`${name} preserves conditional branches`, prompt.includes('不同條件、階段或可能分支'));
  check(`${name} no keyword event table`, prompt.includes('不要套題型字典') && prompt.includes('不要套事件關鍵字表'));
  check(`${name} no fixed output length`, prompt.includes('篇幅由有效命題群決定'));
  check(`${name} actionable advice`, prompt.includes('可採取方向') && prompt.includes('1至3項'));
  check(`${name} exact final tail`, prompt.endsWith('[靜月之光蝦皮賣場](https://shopee.tw/a50h95648d?tab=shop)\n願你諸事順遂。'));
}

// 5. 三張線：三個合法片段、橋接與完整句。
check('three module', p3.includes('<牌陣模組 name="三張線">'));
check('three all paths', p3.includes('全部連續片段：1-2、2-3、1-2-3'));
check('three actual line', p3.includes('最大路徑：1.十字路口→2.魚→3.信'));
check('three bridge and alternatives', p3.includes('1-2與2-3各自產生數個合理短語') && p3.includes('第2張的橋接作用'));

// 6. 五張線：全部十個片段由短到長折疊。
check('five module', p5.includes('<牌陣模組 name="五張線">'));
check('five all ten segments', p5.includes('全部連續片段：1-2、2-3、3-4、4-5；1-2-3、2-3-4、3-4-5；1-2-3-4、2-3-4-5；1-2-3-4-5'));
check('five recursive windows', p5.includes('依序折疊三張窗、四張窗與完整五張線'));
check('five no fixed center meaning', p5.includes('第3張只是幾何中心'));

// 7. 雙路：兩路獨立、共同鏡頭、同一標準；即使問句不明示也有自適應處理。
check('choice module', p7.includes('<牌陣模組 name="雙路比較">'));
check('choice independent routes', p7.includes('A路1→2→3與B路5→6→7'));
check('choice common lens', p7.includes('第4張作為兩路共同情境、門檻或校正鏡頭'));
check('choice same standard', p7.includes('最後以同一標準比較'));
check('choice adaptive fallback', p7.includes('若問句未明示兩個選項'));

// 8. 九宮格：八條線、16個相鄰對、共享節點交會。
check('nine module', p9.includes('<牌陣模組 name="九宮格">'));
check('nine exact pairs', p9.includes('合法相鄰對：1-2、2-3,') === false); // 避免半形逗號誤植
check('nine 16 pairs', p9.includes('合法相鄰對：1-2、2-3、4-5、5-6、7-8、8-9、1-4、4-7、2-5、5-8、3-6、6-9、1-5、5-9、3-5、5-7'));
check('nine eight lines', p9.includes('合法最大路徑：1-2-3、4-5-6、7-8-9、1-4-7、2-5-8、3-6-9、1-5-9、3-5-7'));
check('nine shared-node synthesis', p9.includes('共享中心、角牌或邊牌互相改寫'));

// 9. 大牌陣：全部30條主盤線、236個可推導連續片段、本人入口與獨立末排。
const grandLines = api.grandLines();
check('grand 30 legal main lines', grandLines.length === 30, `got ${grandLines.length}`);
check('grand 236 contiguous subpaths', api.grandSegmentCount() === 236, `got ${api.grandSegmentCount()}`);
check('grand module', pg.includes('<牌陣模組 name="36張大牌陣">'));
check('grand four passes', pg.includes('大牌陣採四輪內部閱讀') && pg.includes('逐線深讀') && pg.includes('角色與議題投影') && pg.includes('跨線一致性競爭') && pg.includes('全盤命題圖'));
check('grand registry emitted', pg.includes('主盤30條合法最大路徑：'));
check('grand tail isolated', pg.includes('末排最大路徑：33.鞭子→34.房屋→35.船→36.鑰匙'));
check('grand subject entry', pg.includes('本人牌入口：紳士在R2C6'));
check('grand subject neighborhood', pg.includes('本人牌立即鄰域：'));
check('grand subject crossing paths', pg.includes('本人牌穿越路徑：'));
check('grand subject not boundary', pg.includes('重要入口，但不是閱讀邊界'));
check('grand all relevant lines included', pg.includes('任何其他直線只要能為原問句增加新的有效命題，都必須納入'));
check('grand card presence not evidence', pg.includes('不是某張牌單純出現'));

// 10. 人物角色、證據引用、精確限定與品牌分離。
check('self card must actually appear', p3.includes('該牌實際出現在本盤時才能進入牌句'));
check('no automatic other-person binding', p3.includes('只有身分可可靠對應時才綁定'));
check('roles may be phrase or path', p3.includes('單張牌、一組相鄰牌或整條路徑承載'));
check('exact limits are layered, not rejected', p3.includes('把可判斷的核心與仍需現實資料確認的部分分開說明'));
check('evidence path required', p3.includes('每個重要斷語在句尾標示「〔牌面：A＋B＋C〕」'));
check('brand delayed', p3.includes('等占卜正文完全完成後才執行本段'));
check('brand cannot influence reading', p3.includes('本段不得反向影響牌義判斷'));
check('brand context selection', p3.includes('真實生活情境、自然配戴場合'));
check('brand no efficacy claims', p3.includes('不得宣稱治療、保護、穩定情緒'));

// 11. 版本、快取與變更紀錄同步。
const source = fs.readFileSync(sourcePath, 'utf8');
const indexSource = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
check('v14 source marker', source.includes('Lenormand v14.0（自適應語義推理核心）'));
check('v14 console marker', source.includes('adaptive semantic reasoning core'));
check('v14 spread description', api.spreads.grand.desc.includes('跨線語義網與實際建議'));
check('v14 cache marker', indexSource.includes('JS/lenormand.js?v=20260715v14_0'));
check('v14 changelog marker', indexSource.includes('雷諾曼 v14.0 自適應語義推理核心'));

console.log(`PASS: ${passed} Lenormand v14 adaptive semantic reasoning checks.`);
if (failed) {
  console.error(`FAIL: ${failed} checks.`);
  process.exit(1);
}
