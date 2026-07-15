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

// 4. 共同引擎採完整覆蓋：先掃描全部合法組合，再輸出所有不同且相關的資訊。
api.setSignif(null);
const p3 = api.build('我副業能成功嗎？', sample3, 'three', null, 'male');
check('coverage engine present', p3.includes('【完整覆蓋判讀法：從問句到全部相關牌句（不要輸出此過程）】'));
check('question anchoring present', p3.includes('問句定錨') && p3.includes('主體、核心事件或狀態'));
check('semantic components present', p3.includes('建立語義部件') && p3.includes('問句已給定的背景'));
check('legal inventory present', p3.includes('建立合法組合清冊') && p3.includes('全部合法相鄰對'));
check('pair sentence composition present', p3.includes('逐對造句') && p3.includes('前牌提出主題、人物、狀態或動作'));
check('segment synthesis present', p3.includes('逐段合成') && p3.includes('三張、四張直到完整線'));
check('intersection synthesis present', p3.includes('交會整合') && p3.includes('共享同一張實際牌'));
check('coverage classification present', p3.includes('完整性分類') && p3.includes('提供新的相關資訊'));
check('no early stop present', p3.includes('未完成清冊覆蓋前') && p3.includes('不得因已找到一條看似足夠的答案而停止'));
check('semantic relation grammar section', p3.includes('【牌間關聯與句法】'));
check('no fixed output cap', !p3.includes('通常2至3個實質段落') && p3.includes('不設字數、段落數或牌陣篇幅上限'));

// 5. 三張線：相鄰短語→中間樞紐→完整句→條件與風險。
check('three coverage title', p3.includes('【本牌陣完整覆蓋法：三張線】'));
check('three pair coverage', p3.includes('①讀1-2') && p3.includes('②讀2-3'));
check('three middle function', p3.includes('第2張如何承接、轉換、阻礙、放大、削弱或落實'));
check('three full natural sentence', p3.includes('讀1→2→3完整句'));
check('three exact coverage count', p3.includes('合法清冊共3組：1-2、2-3、1-2-3'));
check('three no fixed length', p3.includes('不設固定篇幅'));

// 6. 五張線：核心三張、左右翼、完整五張與轉折。
const p5 = api.build('為什麼生意卡住？', sample5, 'five', null, 'male');
check('five coverage title', p5.includes('【本牌陣完整覆蓋法：五張線】'));
check('five all adjacent pairs', p5.includes('4組相鄰對：1-2、2-3、3-4、4-5'));
check('five all triads', p5.includes('3組三張窗：1-2-3、2-3-4、3-4-5'));
check('five all four-card windows', p5.includes('2組四張窗：1-2-3-4、2-3-4-5'));
check('five complete line', p5.includes('最後讀1-2-3-4-5完整線'));
check('five exact ten-combo inventory', p5.includes('合法清冊共10組') && p5.includes('1-2-3-4、2-3-4-5'));

// 7. 雙路：共同標準、兩路完整分析、共同背景與同尺度比較。
const p7 = api.build('留職還是離職？', sample7, 'choice', null, 'male');
check('choice coverage title', p7.includes('【本牌陣完整覆蓋法：雙路比較】'));
check('choice shared criterion', p7.includes('建立共同標準'));
check('choice A complete', p7.includes('完整讀A路的1-2、2-3、1-2-3'));
check('choice B complete', p7.includes('完整讀B路的5-6、6-7、5-6-7'));
check('choice evaluates full dimensions', p7.includes('起點、運作方式、助力、代價、風險、可持續性與落點'));
check('choice card four contextual only', p7.includes('第4張不與支線單張另組'));
check('choice full losing-path disclosure', p7.includes('不能只說哪一路好') && p7.includes('省略另一條路的條件與代價'));

// 8. 九宮格：中心四向→中心線→外圍線→交會整合，並使用所有有新資訊的相關線。
const p9 = api.build('這段關係的來源、阻礙與結果如何？', sample9, 'nine', null, 'male');
check('nine coverage title', p9.includes('【本牌陣完整覆蓋法：九宮格】'));
check('nine all sixteen pairs', p9.includes('16組相鄰對全部讀完') && p9.includes('1-2、2-3、4-5、5-6'));
check('nine all eight lines', p9.includes('8條完整線全部讀完') && p9.includes('1-2-3、4-5-6、7-8-9'));
check('nine exact twenty-four inventory', p9.includes('合法清冊共24組：16組相鄰對＋8條完整線'));
check('nine outer lines cannot be skipped', p9.includes('外圍線不是次要而可省略'));
check('nine intersection synthesis', p9.includes('逐一檢查各線共享的中心、角牌與邊牌'));
check('nine no fixed cap', p9.includes('段落數由24組產生的不同資訊決定，不設上限'));
check('nine output non-dictionary', p9.includes('不為湊字逐線抄牌義'));

// 9. 36張幾何引擎：30條主盤直線、本人鄰域、本人所有穿越線與獨立末排。
const grandLines = api.grandLines();
check('grand has 30 legal main-grid lines', grandLines.length === 30, `got ${grandLines.length}`);
check('grand has 236 contiguous main-grid segments', api.grandSegmentCount() === 236, `got ${api.grandSegmentCount()}`);
check('grand rows count', grandLines.filter(x => x.label.startsWith('水平')).length === 4);
check('grand columns count', grandLines.filter(x => x.label.startsWith('垂直')).length === 8);
check('grand diagonals count', grandLines.filter(x => x.label.startsWith('斜')).length === 18);
check('all grand line indices stay in main grid', grandLines.every(x => x.indices.every(i => i >= 0 && i < 32)));
check('all grand diagonals have at least two cards', grandLines.filter(x => x.label.startsWith('斜')).every(x => x.indices.length >= 2));

const pg = api.build('公司會有30歲以下異性跟我表白嗎？', sample36, 'grand', null, 'male');
check('grand coverage title', pg.includes('【本牌陣完整覆蓋法：36張大牌陣】'));
check('grand relationship-network explanation', pg.includes('不是把36張各自講一次') && pg.includes('所有與原問句有關的不同資訊'));
check('grand question map', pg.includes('階段一｜建立問題地圖'));
check('grand all-line scan', pg.includes('階段二｜全盤合法線掃描'));
check('grand subject field', pg.includes('階段三｜主體場完整覆蓋'));
check('grand event field', pg.includes('階段四｜事件場完整覆蓋'));
check('grand direct connector all windows', pg.includes('讀兩者間最短連續片段') && pg.includes('包含兩者的所有較長連續窗'));
check('grand intersection logic', pg.includes('共享牌只連接兩個已成立的句子'));
check('grand all-grid expansion', pg.includes('階段六｜全盤擴張'));
check('grand support obstacle manifestation coverage', pg.includes('助力、阻礙、延遲、轉折、公開程度、穩定度與可觀察結果'));
check('grand tail all segments', pg.includes('階段八｜末排完整收束') && pg.includes('33-34、34-35、35-36'));
check('grand focused output coverage', pg.includes('聚焦題要輸出全盤中所有不同且相關的發現'));
check('grand all legal line inventory emitted', pg.includes('主盤全部合法最大直線索引（共30條；其內共有236個兩張以上連續子段'));
check('grand subject location emitted', pg.includes('問卜者本人牌：紳士在R1C8'));
check('grand subject all neighbors emitted', pg.includes('本人牌全部立即鄰牌：左＝7.太陽；左下＝15.熊；下＝16.老鼠'));
check('grand subject all crossing lines emitted', pg.includes('本人牌全部穿越線：'));
check('grand subject horizontal line emitted', pg.includes('水平R1＝1.棺材→2.狐狸→3.幸運草→4.心→5.錨→6.狗→7.太陽→8.紳士'));
check('grand subject vertical line emitted', pg.includes('垂直C8＝8.紳士→16.老鼠→24.淑女→32.月亮'));
check('grand subject diagonal line emitted', pg.includes('斜↙起R1C8＝8.紳士→15.熊→22.鑰匙→29.蛇'));
check('grand tail exact inventory emitted', pg.includes('末排合法組合：33-34、34-35、35-36、33-34-35、34-35-36、33-34-35-36'));
check('grand cannot stop after core', pg.includes('不能因它不在本人附近就省略') && pg.includes('任何新增條件、機制、矛盾或結果層都不得省略'));

// 10. 客觀限定須分層，避免因30歲以下未知而把表白核心一起模糊掉。
check('objective qualifier layering', pg.includes('將「可由牌面回答的核心」與「無法確認的限定」分層說明'));

// 11. 段落順序固定為方法→牌陣→牌面資料→輸出→品牌。
const orderedSections = [
  '【本次任務】',
  '【完整覆蓋判讀法：從問句到全部相關牌句（不要輸出此過程）】',
  '【牌間關聯與句法】',
  '【回答契約】',
  '【共同方法邊界】',
  '【本牌陣完整覆蓋法：三張線】',
  '【抽到的牌與可用語彙】',
  '【占卜正文的完整呈現方式】',
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
check('v11 source marker', source.includes('Lenormand v11.0（五牌陣完整覆蓋解讀引擎）'));
check('v11 console marker', source.includes('full legal-combination coverage engine'));
check('v11 cache marker', indexSource.includes('JS/lenormand.js?v=20260715v11_0'));
check('v11 changelog marker', indexSource.includes('雷諾曼 v11.0 五牌陣完整覆蓋解讀引擎'));

console.log(`PASS: ${passed} Lenormand v11 full-coverage checks.`);
if (failed) {
  console.error(`FAIL: ${failed} checks.`);
  process.exit(1);
}
