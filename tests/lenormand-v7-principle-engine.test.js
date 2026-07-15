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

// 1. 自動選陣仍只依問句幾何與所需解析度。
const routes = [
  ['我副業能成功嗎？', 'three'],
  ['公司有異性暗戀我嗎？', 'three'],
  ['為什麼生意卡住？', 'five'],
  ['我該如何改善副業？', 'five'],
  ['他會回我嗎？什麼時候？', 'five'],
  ['留職還是離職？', 'choice'],
  ['台北和高雄哪個比較適合我？', 'choice'],
  ['這個專案的優勢、風險與結果如何？', 'nine'],
  ['未來對象的外貌、個性、職業如何？', 'nine'],
  ['今年感情、工作、財運整體如何？', 'grand'],
  ['我的年度總運如何？', 'grand']
];
for (const [q, expected] of routes) {
  const got = api.detect(q);
  check(`route ${q}`, got.id === expected, `got ${got.id}, expected ${expected}; ${got.why}`);
}
check('focused question may use grand manually', api.fit('公司會有異性跟我表白嗎？', 'grand').ok === true);
check('choice geometry remains mandatory', api.fit('留職還是離職？', 'five').ok === false);
check('global geometry remains grand', api.fit('今年感情、工作、財運整體如何？', 'nine').ok === false);

// 2. 安全與不可稽核邊界仍在抽牌前處理，不由牌號硬猜。
const invalid = [
  ['她幾歲？', 'EXACT_AGE'],
  ['他會在幾月幾日聯絡？', 'EXACT_DATE'],
  ['營業額會是多少元？', 'EXACT_AMOUNT'],
  ['成功率百分之幾？', 'PROBABILITY'],
  ['公司有誰暗戀我？', 'IDENTITY'],
  ['我是不是得癌症？', 'DIAGNOSIS'],
  ['他是不是偷我錢？', 'ALLEGATION'],
  ['我會不會死？', 'FATALITY']
];
for (const [q, expected] of invalid) {
  const got = api.validate(q);
  check(`reject ${q}`, !got.ok && got.code === expected, `got ${got.code}`);
}
check('age threshold wording can pass but must be layered by prompt', api.validate('公司會有30歲以下異性跟我表白嗎？').ok === true);

// 3. 卡牌資料維持詞彙範圍＋相鄰限制，不變相加入正逆位。
check('36 cards', api.cards.length === 36);
check('all cards have semantic scope', api.cards.every(c => c.scope && c.scope.length));
check('all cards have usage guard', api.cards.every(c => c.guard && c.guard.length));
check('no pos/neg fields', api.cards.every(c => !('pos' in c) && !('neg' in c)));

const sample3 = [25,17,27].map(id => api.cards[id - 1]);
const sample5 = [18,27,6,21,8].map(id => api.cards[id - 1]);
const sample7 = [31,25,35,21,3,22,23].map(id => api.cards[id - 1]);
const sample9 = [18,3,35,6,19,8,27,21,22].map(id => api.cards[id - 1]);
// 使用本次實例牌序，方便檢查本人牌在R1C8及所有合法穿越線。
const userGrandIds = [8,14,2,24,35,18,31,28,10,30,34,17,21,19,15,23,3,1,13,9,27,33,22,29,6,11,20,16,7,36,4,32,12,26,5,25];
const sample36 = userGrandIds.map(id => api.cards[id - 1]);

// 4. 共同引擎必須教模型如何從問句到牌句，而非只列限制。
api.setSignif(null);
const p3 = api.build('我副業能成功嗎？', sample3, 'three', null, 'male');
check('common semantic engine present', p3.includes('【共同判讀流程：從問句到牌句（不要輸出此過程）】'));
check('question modeling present', p3.includes('問句建模') && p3.includes('誰／什麼、要判斷什麼事件或狀態'));
check('answer components present', p3.includes('建立回答部件') && p3.includes('不可缺少的語義部件'));
check('card carriers present', p3.includes('找牌面承載點') && p3.includes('定位牌只是閱讀入口'));
check('adjacent sentence composition present', p3.includes('相鄰造句') && p3.includes('前牌提出人、事、狀態或動作'));
check('long-line synthesis present', p3.includes('長線合成') && p3.includes('滑動片段'));
check('intersection network present', p3.includes('關聯網整合') && p3.includes('共享牌是共同樞紐'));
check('evidence layers present', p3.includes('證據分層') && p3.includes('主證據'));
check('progressive saturation present', p3.includes('漸進擴張') && p3.includes('新增證據不再帶來不同資訊時才停止'));
check('semantic relation grammar section', p3.includes('【牌間關聯語法】'));
check('no old global compression rule', !p3.includes('以最少充分證據回答'));

// 5. 三張線：相鄰短語→中間樞紐→完整句→條件與風險。
check('three analysis title', p3.includes('【本牌陣完整分析法：三張線】'));
check('three pair order', p3.includes('①讀1-2') && p3.includes('②讀2-3'));
check('three middle function', p3.includes('第2張在整句中是延續、轉換、阻礙、條件或落實樞紐'));
check('three full natural sentence', p3.includes('以1→2→3重寫成一個不漏牌的完整自然句'));
check('three legal geometry', p3.includes('合法組合只有1-2、2-3、1-2-3'));
check('three output depth', p3.includes('通常2至3個實質段落'));

// 6. 五張線：核心三張、左右翼、完整五張與轉折。
const p5 = api.build('為什麼生意卡住？', sample5, 'five', null, 'male');
check('five analysis title', p5.includes('【本牌陣完整分析法：五張線】'));
check('five core triad', p5.includes('先讀2-3與3-4') && p5.includes('合成2→3→4核心句'));
check('five left wing', p5.includes('讀1→2→3，說明事件如何進入核心'));
check('five right wing', p5.includes('讀3→4→5，說明核心如何向外發展或落實'));
check('five complete line', p5.includes('再讀1→2→3→4→5完整句'));
check('five output depth', p5.includes('通常3至5個實質段落'));

// 7. 雙路：共同標準、兩路完整分析、共同背景與同尺度比較。
const p7 = api.build('留職還是離職？', sample7, 'choice', null, 'male');
check('choice analysis title', p7.includes('【本牌陣完整分析法：雙路比較】'));
check('choice shared criterion', p7.includes('建立兩路共同評估標準'));
check('choice A complete', p7.includes('1-2、2-3、1→2→3完成A路'));
check('choice B complete', p7.includes('5-6、6-7、5→6→7完成B路'));
check('choice evaluates operation and costs', p7.includes('運作方式、收益、代價、限制與可持續性'));
check('choice card four contextual only', p7.includes('第4張不與任何支線單張另組牌'));
check('choice output depth', p7.includes('通常4至6個實質段落'));

// 8. 九宮格：中心四向→中心線→外圍線→交會整合，並使用所有有新資訊的相關線。
const p9 = api.build('這段關係的來源、阻礙與結果如何？', sample9, 'nine', null, 'male');
check('nine analysis title', p9.includes('【本牌陣完整分析法：九宮格】'));
check('nine center direct effects', p9.includes('先用2-5、4-5、5-6、5-8理解中心受到的四向直接作用'));
check('nine center complete lines', p9.includes('4→5→6、2→5→8、1→5→9、3→5→7'));
check('nine uses all distinct relevant lines', p9.includes('使用所有能帶來不同新資訊的相關中心線'));
check('nine outer context lines', p9.includes('再讀1→2→3、7→8→9、1→4→7、3→6→9等外圍線'));
check('nine intersection synthesis', p9.includes('把實際交會的線透過共享牌整合'));
check('nine balanced depth', p9.includes('不為省字只讀一兩條，也不為湊數朗讀全部八條'));
check('nine output depth', p9.includes('通常4至8個實質段落'));

// 9. 36張幾何引擎：30條主盤直線、本人鄰域、本人所有穿越線與獨立末排。
const grandLines = api.grandLines();
check('grand has 30 legal main-grid lines', grandLines.length === 30, `got ${grandLines.length}`);
check('grand rows count', grandLines.filter(x => x.label.startsWith('水平')).length === 4);
check('grand columns count', grandLines.filter(x => x.label.startsWith('垂直')).length === 8);
check('grand diagonals count', grandLines.filter(x => x.label.startsWith('斜')).length === 18);
check('all grand line indices stay in main grid', grandLines.every(x => x.indices.every(i => i >= 0 && i < 32)));
check('all grand diagonals have at least two cards', grandLines.filter(x => x.label.startsWith('斜')).every(x => x.indices.length >= 2));

const pg = api.build('公司會有30歲以下異性跟我表白嗎？', sample36, 'grand', null, 'male');
check('grand analysis title', pg.includes('【本牌陣完整分析法：36張大牌陣】'));
check('grand relationship-network explanation', pg.includes('36張不是36個單張答案，而是一張關係網'));
check('grand question map', pg.includes('階段一｜建立問題地圖'));
check('grand subject field', pg.includes('階段二｜讀主體場'));
check('grand event fields', pg.includes('階段三｜讀事件場'));
check('grand event components cannot substitute', pg.includes('不得用其中一個部件代替整個事件'));
check('grand direct connector then full-line context', pg.includes('先讀兩者之間的最短完整片段作直接證據') && pg.includes('再讀該整條直線在兩端之外的牌作背景修飾'));
check('grand intersection logic', pg.includes('交會只能作兩句之間的共同機制'));
check('grand progressive evidence layers', pg.includes('階段五｜漸進擴張證據層'));
check('grand support obstacle manifestation coverage', pg.includes('哪些牌促成、穩定或放大') && pg.includes('哪些牌阻礙、消耗、拖延或封閉'));
check('grand tail always read as closure', pg.includes('階段七｜讀末排收束'));
check('grand focused output coverage', pg.includes('聚焦題至少完整呈現主體場、事件場、直接連接或交會機制、主要助力與阻礙、可觀察呈現程度及末排收束'));
check('grand all legal line inventory emitted', pg.includes('主盤全部合法直線索引（只有這些水平、垂直、斜線可作連續句）'));
check('grand subject location emitted', pg.includes('問卜者本人牌：紳士在R1C8'));
check('grand subject all neighbors emitted', pg.includes('本人牌全部立即鄰牌：左＝7.太陽；左下＝15.熊；下＝16.老鼠'));
check('grand subject all crossing lines emitted', pg.includes('本人牌全部穿越線：'));
check('grand subject horizontal line emitted', pg.includes('水平R1＝1.棺材→2.狐狸→3.幸運草→4.心→5.錨→6.狗→7.太陽→8.紳士'));
check('grand subject vertical line emitted', pg.includes('垂直C8＝8.紳士→16.老鼠→24.淑女→32.月亮'));
check('grand subject diagonal line emitted', pg.includes('斜↙起R1C8＝8.紳士→15.熊→22.鑰匙→29.蛇'));
check('grand tail exact line emitted', pg.includes('末排唯一合法線：33.鳥→34.書→35.大樹→36.戒指。'));
check('grand cannot be compressed to three-card length', pg.includes('大牌陣不得縮成三張線長度'));

// 10. 客觀限定須分層，避免因30歲以下未知而把表白核心一起模糊掉。
check('objective qualifier layering', pg.includes('將「可由牌面回答的核心」與「無法確認的限定」分層說明'));

// 11. 段落順序固定為方法→牌陣→牌面資料→輸出→品牌。
const orderedSections = [
  '【本次任務】',
  '【共同判讀流程：從問句到牌句（不要輸出此過程）】',
  '【牌間關聯語法】',
  '【回答契約】',
  '【共同方法邊界】',
  '【本牌陣完整分析法：三張線】',
  '【抽到的牌與可用語彙】',
  '【占卜正文的組織與深度】',
  '【品牌附加層（與占卜正文分離）】',
  '【本盤可在占卜正文使用的牌名】'
];
for (let i = 1; i < orderedSections.length; i++) {
  check(`section order ${orderedSections[i - 1]} -> ${orderedSections[i]}`,
    p3.indexOf(orderedSections[i - 1]) < p3.indexOf(orderedSections[i]));
}

// 12. 品牌層保留問題情境關聯與固定收尾，但不回頭污染占卜。
check('brand real-life context', p3.includes('從原問句辨認實際生活情境'));
check('brand style context', p3.includes('配戴場合與色系／質感'));
check('brand efficacy claims forbidden', p3.includes('禁止宣稱礦物是牌面指定、能化解牌面、治療、保護'));
for (const [name, prompt] of [['three',p3],['five',p5],['choice',p7],['nine',p9],['grand',pg]]) {
  check(`${name} brand separation`, prompt.includes('以下為免費服務的品牌資訊，與本次牌義結論分開：'));
  check(`${name} exact tail`, prompt.endsWith('[靜月之光蝦皮賣場](https://shopee.tw/a50h95648d?tab=shop)\n願你諸事順遂。'));
}

// 13. 版本與index快取同步。
const source = fs.readFileSync(sourcePath, 'utf8');
const indexSource = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
check('v10 source marker', source.includes('Lenormand v10.0（五牌陣語義合成引擎）'));
check('v10 console marker', source.includes('semantic composition + spread-scaled depth engine'));
check('v10 cache marker', indexSource.includes('JS/lenormand.js?v=20260715v10_0'));
check('v10 changelog marker', indexSource.includes('雷諾曼 v10.0 五牌陣語義合成引擎'));

console.log(`PASS: ${passed} Lenormand v10 semantic-reading checks.`);
if (failed) {
  console.error(`FAIL: ${failed} checks.`);
  process.exit(1);
}
