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

// 1. 自動選陣只看問句幾何與敘事容量，不用題材關鍵字代替語意。
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
check('focused question may use grand manually', api.fit('現任是正緣嗎？', 'grand').ok === true);
check('choice geometry remains mandatory', api.fit('留職還是離職？', 'five').ok === false);
check('global geometry remains grand', api.fit('今年感情、工作、財運整體如何？', 'nine').ok === false);

// 2. 可定性回答但不可精確驗證的問題不再整題拒絕；高風險事實認定仍攔截。
const allowedBoundaryQuestions = [
  '她幾歲？',
  '他會在幾月幾日聯絡？',
  '營業額會是多少元？',
  '成功率百分之幾？',
  '公司有誰暗戀我？',
  '公司會有30歲以下異性跟我表白嗎？'
];
for (const q of allowedBoundaryQuestions) {
  check(`qualitative fallback allowed ${q}`, api.validate(q).ok === true);
}
const blocked = [
  ['我是不是得癌症？', 'DIAGNOSIS'],
  ['他是不是偷我錢？', 'ALLEGATION'],
  ['我會不會死？', 'FATALITY']
];
for (const [q, expected] of blocked) {
  const got = api.validate(q);
  check(`block high-risk ${q}`, !got.ok && got.code === expected, `got ${got.code}`);
}

// 3. 卡牌資料仍是語義範圍，不是正逆位或固定事件表。
check('36 cards', api.cards.length === 36);
check('all cards have semantic scope', api.cards.every(c => c.scope && c.scope.length));
check('all cards have usage guard', api.cards.every(c => c.guard && c.guard.length));
check('no pos/neg fields', api.cards.every(c => !('pos' in c) && !('neg' in c)));

const sample3 = [10,33,30].map(id => api.cards[id - 1]);
const sample5 = [18,27,6,21,8].map(id => api.cards[id - 1]);
const sample7 = [31,25,35,21,3,22,23].map(id => api.cards[id - 1]);
const sample9 = [18,3,35,6,19,8,27,21,22].map(id => api.cards[id - 1]);
const grandIds = [1,34,30,36,18,6,10,33,29,2,26,15,22,4,11,28,9,14,8,17,35,21,23,16,12,13,5,32,27,7,20,25,24,3,19,31];
const sample36 = grandIds.map(id => api.cards[id - 1]);

// 4. 共用引擎必須是正向閱讀流程，而不是補丁牆或全組合窮舉。
api.setSignif(null);
const p3 = api.build('現任是正緣嗎？', sample3, 'three', null, 'male');
check('unified engine title', p3.includes('【統一讀牌引擎（內部執行，不輸出步驟）】'));
check('question model', p3.includes('第一步｜建立問題模型'));
check('semantic role binding', p3.includes('第二步｜綁定語義角色'));
check('spread as semantic graph', p3.includes('第三步｜把牌陣轉成語義圖'));
check('pair grammar', p3.includes('第四步｜相鄰牌造句'));
check('progressive folding', p3.includes('第五步｜逐張折疊成長句'));
check('event narrative', p3.includes('第六步｜形成事件敘事'));
check('intersection integration', p3.includes('第七步｜整合交會與獨立證據'));
check('conclusion calibration', p3.includes('第八步｜校準結論'));
check('semantic saturation audit', p3.includes('第九步｜完成度稽核') && p3.includes('直到語義飽和再輸出'));
check('not old coverage-first wall', !p3.includes('【完整覆蓋判讀法') && !p3.includes('完整性分類'));
check('not mechanical exhaustive doctrine', !p3.includes('完整掃描本牌陣全部合法組合') && !p3.includes('未完成清冊覆蓋前'));
check('not fixed event table', p3.includes('不是事件對照表'));
check('no fixed output length', p3.includes('輸出長度由獨立資訊量決定'));

// 5. 角色綁定要能處理「現任」但不擅自把淑女／紳士指定成對方。
check('self role actual-card only', p3.includes('該牌必須實際出現在本盤才能進入牌句'));
check('partner role not auto-assigned', p3.includes('不自行把人物牌指定成現任、前任、主管、第三者'));
check('role may be card or sentence', p3.includes('角色可以由一張定位牌承載，也可以由一條連續句共同承載'));

// 6. 牌句語法是通用語法操作，而非關鍵字映射。
check('generic grammar relations', p3.includes('主體—特徵、行動—內容、原因—結果、條件—落點、狀態—轉變'));
check('reverse contextual check', p3.includes('反向檢查後牌是否重新限定前牌'));
check('new card transforms clause', p3.includes('延續、具體化、放大、緩和、轉向、阻礙、切斷、揭露、落實或收束'));
check('middle card bridge', p3.includes('中間牌是作用機制與語法橋樑'));
check('full line is proposition', p3.includes('完整線形成主命題'));

// 7. 三張線模組：相鄰短語→橋樑→完整句，全部合法路徑都內部判讀。
check('three module title', p3.includes('【本牌陣閱讀模組：三張線】'));
check('three pair reading', p3.includes('先讀1-2與2-3兩個相鄰短語'));
check('three bridge function', p3.includes('第2張如何把前後兩段接成同一作用過程'));
check('three full sentence', p3.includes('最後讀1→2→3完整句'));
check('three paths exact', p3.includes('合法路徑：1-2、2-3、1-2-3'));
check('three actual path emitted', p3.includes('牌面路徑：1.鐮刀→2.鑰匙→3.百合'));

// 8. 五張線模組：中心機制、左右推進、滑動視窗、完整線。
const p5 = api.build('為什麼生意卡住？', sample5, 'five', null, 'male');
check('five module title', p5.includes('【本牌陣閱讀模組：五張線】'));
check('five adjacent pairs first', p5.includes('先讀四個相鄰對'));
check('five center mechanism', p5.includes('中心三張2-3-4找出核心機制'));
check('five left entry right landing', p5.includes('讀1-2如何把事件帶入核心') && p5.includes('讀4-5如何把核心推向落點'));
check('five all nested windows', p5.includes('三個三張窗、兩個四張窗與完整1→2→3→4→5'));
check('five ten paths', p5.includes('合法路徑共10組'));

// 9. 雙路模組：兩路獨立成句、相同判準、共同牌只校正整條支線。
const p7 = api.build('留職還是離職？', sample7, 'choice', null, 'male');
check('choice module title', p7.includes('【本牌陣閱讀模組：雙路比較】'));
check('choice same criteria', p7.includes('兩路共用的比較判準'));
check('choice A and B complete', p7.includes('A路完整讀1-2、2-3、1-2-3') && p7.includes('B路完整讀5-6、6-7、5-6-7'));
check('choice common card lens', p7.includes('共同環境、門檻或校正鏡頭'));
check('choice no false adjacency', p7.includes('第4張不與支線單張另造假相鄰'));
check('choice does not flatten', p7.includes('不為了選出勝方而壓平其中一路'));

// 10. 九宮格模組：中心鄰域、八條直線、再回到相鄰牌與交會整合。
const p9 = api.build('這段關係的來源、阻礙與結果如何？', sample9, 'nine', null, 'male');
check('nine module title', p9.includes('【本牌陣閱讀模組：九宮格】'));
check('nine center neighborhood', p9.includes('中心與八張鄰牌的所有實際相鄰關係'));
check('nine eight full lines', p9.includes('第二輪讀八條完整直線：三橫、三直、兩斜'));
check('nine pairs contextualized after lines', p9.includes('第三輪回到每條線的相鄰對'));
check('nine intersection integration', p9.includes('共享的中心、角牌或邊牌整合各線'));
check('nine exact geometry', p9.includes('合法相鄰對共16組') && p9.includes('合法完整線共8組'));

// 11. 大牌陣：核心深讀＋全盤複核，而非236子片段機械展開。
const grandLines = api.grandLines();
check('grand has 30 legal main-grid lines', grandLines.length === 30, `got ${grandLines.length}`);
check('grand geometry utility still accurate', api.grandSegmentCount() === 236, `got ${api.grandSegmentCount()}`);
const pg = api.build('現任是正緣嗎？', sample36, 'grand', null, 'male');
check('grand module title', pg.includes('【本牌陣閱讀模組：36張大牌陣】'));
check('grand two-pass method', pg.includes('核心深讀＋全盤複核'));
check('grand core fields', pg.includes('本人／主體場、對象或關係場、核心事件場與結果場'));
check('grand direct and intersecting path method', pg.includes('最短連續片段') && pg.includes('真正共享的交會牌'));
check('grand all 30 line audit', pg.includes('逐一瀏覽下方30條主盤最大直線'));
check('grand deepens every relevant line', pg.includes('回到相鄰對與必要的三張／四張／更長視窗做深讀'));
check('grand includes independent evidence without fake path', pg.includes('可以各自對同一主題提供獨立佐證或反證') && pg.includes('不能串成假連線'));
check('grand tail as epilogue', pg.includes('末排33→34→35→36另作獨立尾聲'));
check('grand all cards presence warning', pg.includes('全36張必然出現，因此某張牌「有出現」本身不是證據'));
check('grand emits 30-line registry', pg.includes('主盤30條合法最大直線：'));
check('grand does not instruct 236 expansion', !pg.includes('236個兩張以上連續子段') && !pg.includes('每一個子片段'));
check('grand subject location emitted', pg.includes('問卜者本人牌：紳士在R2C8'));
check('grand subject neighborhood emitted', pg.includes('本人牌立即鄰域：'));
check('grand subject crossing lines emitted', pg.includes('本人牌全部穿越線：'));

// 12. 精確條件提示會分層回答，不會把整題拒絕。
const pBoundary = api.build('公司會有30歲以下異性跟我表白嗎？', sample36, 'grand', null, 'male');
check('exact age scope note', pBoundary.includes('本題包含牌面無法精確驗證的條件：精確年齡'));
check('answer core before boundary', pBoundary.includes('不要因此放棄整題；先完整回答牌面能判斷的核心'));
const pExactBundle = api.build('他會在幾月幾日聯絡，成功率百分之幾？', sample5, 'five', null, 'male');
check('multiple scope notes', pExactBundle.includes('精確日期或鐘點') && pExactBundle.includes('百分比或數值機率'));

// 13. 輸出與品牌層：可稽核、完整、不混寫，固定尾行保持。
for (const [name, prompt] of [['three',p3],['five',p5],['choice',p7],['nine',p9],['grand',pg]]) {
  check(`${name} output section`, prompt.includes('【占卜正文輸出】'));
  check(`${name} direct answer`, prompt.includes('第一段第一句直接回答原問句'));
  check(`${name} evidence markers`, prompt.includes('每一個重要斷語都要能由句尾牌面標記回溯'));
  check(`${name} brand separation`, prompt.includes('以下為免費服務的品牌資訊，與本次牌義結論分開：'));
  check(`${name} brand context`, prompt.includes('真實生活情境與最自然的配戴場合'));
  check(`${name} no efficacy claim`, prompt.includes('不得宣稱治療、保護、穩定情緒'));
  check(`${name} exact tail`, prompt.endsWith('[靜月之光蝦皮賣場](https://shopee.tw/a50h95648d?tab=shop)\n願你諸事順遂。'));
}

// 14. 版本、描述與快取同步。
const source = fs.readFileSync(sourcePath, 'utf8');
const indexSource = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
check('v12 source marker', source.includes('Lenormand v12.0（統一語義網讀牌引擎）'));
check('v12 console marker', source.includes('unified semantic-network reading engine'));
check('v12 no old version header', !source.startsWith('// ═══════════════════════════════════════\n// 靜月之光 — 雷諾曼牌 Lenormand v11.0'));
check('spread descriptions updated', api.spreads.grand.desc.includes('核心語義場深讀後'));
check('v12 cache marker', indexSource.includes('JS/lenormand.js?v=20260715v12_0'));
check('v12 changelog marker', indexSource.includes('雷諾曼 v12.0 統一語義網讀牌引擎'));

console.log(`PASS: ${passed} Lenormand v12 semantic-network checks.`);
if (failed) {
  console.error(`FAIL: ${failed} checks.`);
  process.exit(1);
}
