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

// 1. 自動選陣只依問句幾何與回答面向；題材內容不得自行升級。
const routes = [
  ['我副業能成功嗎？', 'three'],
  ['這月有肉體桃花嗎？', 'three'],
  ['公司有異性暗戀我嗎？', 'three'],
  ['他愛我嗎？', 'three'],
  ['這次面試會錄取嗎？', 'three'],
  ['本月營業額能破萬嗎？', 'three'],
  ['他對我怎麼想？', 'five'],
  ['為什麼生意卡住？', 'five'],
  ['我該如何改善副業？', 'five'],
  ['他會回我嗎？什麼時候？', 'five'],
  ['我副業未來發展如何？', 'five'],
  ['未來對象的外貌如何？', 'five'],
  ['留職還是離職？', 'choice'],
  ['台北和高雄哪個比較適合我？', 'choice'],
  ['這個專案的優勢、風險與結果如何？', 'nine'],
  ['未來對象的外貌、個性、職業如何？', 'nine'],
  ['這段關係的來源、阻礙與結果如何？', 'nine'],
  ['感情和工作會順利嗎？', 'grand'],
  ['今年感情、工作、財運整體如何？', 'grand'],
  ['我的年度總運如何？', 'grand']
];
for (const [q, expected] of routes) {
  const got = api.detect(q);
  check(`route ${q}`, got.id === expected, `got ${got.id}, expected ${expected}; ${got.why}`);
}
check('hidden yes-no remains one facet', api.analyze('公司有異性暗戀我嗎？').facetCount === 1);
check('hidden yes-no shape is adjudicable', api.analyze('公司有異性暗戀我嗎？').questionShape === '單一可裁決命題');
check('single future development is not forced nine', api.analyze('我副業未來發展如何？').isOverview === false);
check('person conjunction is not false choice', api.detect('我和他會復合嗎？').id === 'three');
check('real alternatives remain choice', api.detect('台北和高雄哪個比較適合我？').id === 'choice');

// 2. 不可稽核、高風險與錯誤幾何仍在抽牌前攔截。
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

// 3. 手動牌陣只擋真正幾何錯配，不因問句內容詞或單一問法過度封鎖。
const compatibleThree = [
  '我副業能成功嗎？',
  '公司有異性暗戀我嗎？',
  '為什麼生意卡住？',
  '我該如何改善副業？',
  '他什麼時候會聯絡？',
  '他對我的態度如何？'
];
for (const q of compatibleThree) check(`three manual accepts ${q}`, api.fit(q, 'three').ok === true);
check('three rejects explicit multi-aspect', api.fit('這段關係的來源、阻礙與結果如何？', 'three').ok === false);
check('five rejects explicit multi-aspect', api.fit('這段關係的來源、阻礙與結果如何？', 'five').ok === false);
check('choice required for alternatives', api.fit('留職還是離職？', 'five').ok === false);
check('choice rejects non-choice', api.fit('這份工作會錄取嗎？', 'choice').ok === false);
check('nine may deepen focused yes-no', api.fit('這份工作會錄取嗎？', 'nine').ok === true);
check('grand may deepen focused question', api.fit('公司有異性暗戀我嗎？', 'grand').ok === true);
check('global requires grand', api.fit('今年感情、工作、財運整體如何？', 'nine').ok === false);

// 4. 牌義資料維持單一語義範圍，不做變相正逆位。
check('36 cards', api.cards.length === 36);
check('all cards have scope', api.cards.every(c => typeof c.scope === 'string' && c.scope.length > 0));
check('all cards have guard', api.cards.every(c => typeof c.guard === 'string' && c.guard.length > 0));
check('no pos/neg fields', api.cards.every(c => !('pos' in c) && !('neg' in c)));
check('coffin keeps ending', api.cards[7].scope.includes('結束') && api.cards[7].guard.includes('不可'));
check('mountain keeps obstacle', api.cards[20].scope.includes('阻礙'));
check('mice keeps depletion', api.cards[22].scope.includes('消耗'));

const sample3 = [25,17,27].map(id => api.cards[id - 1]);
const sample5 = [18,27,6,21,8].map(id => api.cards[id - 1]);
const sample7 = [31,25,35,21,3,22,23].map(id => api.cards[id - 1]);
const sample9 = [18,3,35,6,19,8,27,21,22].map(id => api.cards[id - 1]);
const sample36 = api.cards.slice();

// 5. 所有牌陣共用回答契約；正文語義由AI讀原問句，不由前端分類注入。
api.setSignif(null);
const p3 = api.build('我副業能成功嗎？', sample3, 'three', null, 'male');
const p3why = api.build('為什麼生意卡住？', sample3, 'three', null, 'male');
check('universal contract present', p3.includes('【通用解題順序（所有牌陣共用；不要輸出此過程）】'));
check('answer contract present', p3.includes('【回答契約】'));
check('AI must derive answer form', p3.includes('使用者真正要求的回答形式'));
check('frontend labels cannot replace question', p3.includes('前端分類、牌陣名稱與題材關鍵字都不得取代原問句'));
check('AI geometry recheck present', p3.includes('複核牌陣幾何') && p3.includes('較大的相容牌陣不是錯誤'));
check('background separated from event', p3.includes('區分背景與待答事件'));
check('minimum sufficient evidence', p3.includes('以最少充分證據回答'));
check('conclusion strength calibrated', p3.includes('校準結論強度'));
check('generic contract handles yes-no', p3.includes('若原問句是是非題'));
check('generic contract handles why/how/when', p3.includes('若原問句問原因、方法、時間、趨勢、人物輪廓或多面向'));
check('no frontend-generated timing sentence', !p3why.includes('這是時間題') && !p3why.includes('問句要求原因'));
check('same rules independent of topic classifier', p3.split('【本牌陣證據程序')[0].replace('我副業能成功嗎？','<Q>') === p3why.split('【本牌陣證據程序')[0].replace('為什麼生意卡住？','<Q>'));

// 6. 五種牌陣各有封閉閱讀順序、合法組合與證據優先級。
check('three closed order', p3.includes('封閉閱讀順序：①讀1-2；②讀2-3；③以1→2→3'));
check('three legal geometry', p3.includes('合法組合只有1-2、2-3、1-2-3'));
check('three forbids 1-3', p3.includes('禁止另組1-3'));
check('three resolution ceiling', p3.includes('解析度上限'));

const p5 = api.build('為什麼生意卡住？', sample5, 'five', null, 'male');
check('five pivot order', p5.includes('①以2-3與3-4確定樞紐'));
check('five overlapping clauses', p5.includes('②讀1-2-3與3-4-5兩個交疊句'));
check('five full sentence adjudicates', p5.includes('③以1→2→3→4→5完整句裁決'));
check('five legal geometry', p5.includes('1-2、2-3、3-4、4-5'));
check('five forbids jumps and mirrors', p5.includes('禁止1-5、2-4、1-3、3-5'));
check('five no fixed temporal positions', p5.includes('不自動等於過去、現在或未來'));

const p7 = api.build('留職還是離職？', sample7, 'choice', null, 'male');
check('choice criterion before branches', p7.includes('先從原問句確定A與B共用的唯一主要評估標準'));
check('choice branch A isolated', p7.includes('A的1-2、2-3、1-2-3'));
check('choice branch B isolated', p7.includes('B的5-6、6-7、5-6-7'));
check('choice card 4 only modifies complete branches', p7.includes('第4張不與1、2、3、5、6、7任何單張另組牌'));
check('choice forbids cross branch', p7.includes('A與B禁止互相修飾或跨支線組合'));
check('choice no forced winner', p7.includes('不強迫選贏家'));

const p9 = api.build('這段關係的來源、阻礙與結果如何？', sample9, 'nine', null, 'male');
check('nine center lines prioritized', p9.includes('優先在穿過中心的4-5-6、2-5-8、1-5-9、3-5-7'));
check('nine outer lines secondary', p9.includes('才使用1-2-3、7-8-9、1-4-7、3-6-9'));
check('nine legal lines complete', p9.includes('合法完整線只有1-2-3、4-5-6、7-8-9、1-4-7、2-5-8、3-6-9、1-5-9、3-5-7'));
check('nine requires intersections', p9.includes('兩線必須有實際交會牌'));
check('nine does not recite all lines', p9.includes('不要把八條線全部念完'));
check('nine no fixed roles', p9.includes('不替任何橫、直、斜線預設時間、心理、原因或結果身分'));

api.setSignif(34);
const pg = api.build('今年感情、工作、財運整體如何？', sample36, 'grand', null, 'male');
check('grand locks subject and theme anchors', pg.includes('先固定再解讀，不因結果好壞換牌'));
check('grand immediate neighbors first', pg.includes('讀主體與議題定位牌的立即鄰牌'));
check('grand straight shortest segment only', pg.includes('同一水平、垂直或斜線上，再讀連接兩者的最短連續片段'));
check('grand forbids invented turning path', pg.includes('不能臨時畫轉彎路徑硬接'));
check('grand disconnected evidence separate', pg.includes('不得拼成同一事件'));
check('grand full-deck presence not evidence', pg.includes('全36張必然出現'));
check('grand tail independent', pg.includes('末排4張只可作自身的水平連續收束句'));

// 7. 段落順序固定為：原問句契約→牌陣證據→牌資料→輸出→品牌。
const orderedSections = [
  '【本次任務】',
  '【通用解題順序（所有牌陣共用；不要輸出此過程）】',
  '【回答契約】',
  '【共同邊界】',
  '【本牌陣證據程序：三張線】',
  '【抽到的牌與可用語彙】',
  '【占卜正文輸出格式】',
  '【品牌附加層（與占卜正文分離）】',
  '【本盤可在占卜正文使用的牌名】'
];
for (let i = 1; i < orderedSections.length; i++) {
  check(`section order ${orderedSections[i - 1]} -> ${orderedSections[i]}`,
    p3.indexOf(orderedSections[i - 1]) < p3.indexOf(orderedSections[i]));
}

// 8. 品牌層與問題相關，但不能反向污染牌義或宣稱功效。
check('brand fixed three-step selection', p3.includes('依固定三步選品'));
check('brand derives from real-life context', p3.includes('從原問句辨認實際生活情境'));
check('brand derives wearing context and style', p3.includes('配戴場合與色系／質感'));
check('business context mapping', p3.includes('工作／生意／金錢場合可選黃水晶、虎眼石、綠幽靈'));
check('relationship context mapping', p3.includes('關係／社交可選粉晶、草莓晶、月光石'));
check('decision context mapping', p3.includes('決策／轉換／移動可選茶晶、拉長石、黑曜石'));
check('communication context mapping', p3.includes('溝通／學習／書面往來可選海藍寶、藍紋瑪瑙、紫水晶'));
check('brand fallback remains', p3.includes('沒有清楚關聯時固定白水晶'));
check('brand efficacy claims forbidden', p3.includes('禁止宣稱礦物是牌面指定、能化解牌面、治療、保護、穩定情緒、提升能力'));
for (const [name, prompt] of [['three',p3],['five',p5],['choice',p7],['nine',p9],['grand',pg]]) {
  check(`${name} brand separation sentence`, prompt.includes('以下為免費服務的品牌資訊，與本次牌義結論分開：'));
  check(`${name} shop markdown`, prompt.includes('[靜月之光蝦皮賣場](https://shopee.tw/a50h95648d?tab=shop)'));
  check(`${name} exact tail`, prompt.endsWith('[靜月之光蝦皮賣場](https://shopee.tw/a50h95648d?tab=shop)\n願你諸事順遂。'));
}

// 9. 版本與UI文字同步。
const source = fs.readFileSync(sourcePath, 'utf8');
check('v9 source marker', source.includes('Lenormand v9.0'));
check('v9 console marker', source.includes('universal question contract + five-spread evidence engine'));
check('auto UI is geometry based', source.includes('依問句幾何選最小充分牌陣（推薦）'));
check('three UI is topic-neutral', source.includes("d:'單一聚焦命題'"));
check('five UI is topic-neutral', source.includes("d:'單一議題脈絡'"));
check('no old hidden forced-five route', !source.includes("if (x.isSensitiveHidden)\n    return { id:'five'"));
check('no dynamic prompt classification block', !source.includes("lines.push('這是時間題"));

console.log(`PASS: ${passed} Lenormand v9 universal-engine checks.`);
if (failed) {
  console.error(`FAIL: ${failed} checks.`);
  process.exit(1);
}
