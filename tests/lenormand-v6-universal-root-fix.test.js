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

// ─────────────────────────────────────────────────────────────
// 1) 自動選陣：以問題結構與最小充分解析度決定，不以領域名稱硬分流。
// ─────────────────────────────────────────────────────────────
const routeCases = [
  // 三張：可觀察、單一、短答命題
  ['這月有肉體桃花嗎？', 'three'],
  ['我這月的副業能破萬營業額嗎？', 'three'],
  ['他會回我嗎？', 'three'],
  ['這次面試會錄取嗎？', 'three'],
  ['這份合約會簽成嗎？', 'three'],
  ['我能順利搬家嗎？', 'three'],
  ['下週股票會上漲嗎？', 'three'],
  ['這場官司結果偏有利嗎？', 'three'],
  ['我們會復合嗎？', 'three'],
  ['他會聯絡還是不聯絡？', 'three'],

  // 五張：內心／隱藏、原因、方法、時間、單一人物傾向、一般開放單題
  ['公司有異性暗戀我嗎？', 'five'],
  ['他喜不喜歡我？', 'five'],
  ['他愛我還是不愛我？', 'five'],
  ['他對我怎麼想？', 'five'],
  ['為什麼生意卡住？我該怎麼改善？', 'five'],
  ['他會回我嗎？什麼時候？', 'five'],
  ['這份工作會錄取嗎？卡在哪裡？', 'five'],
  ['對象呈現較年輕還是較成熟？', 'five'],
  ['最近工作狀況如何？', 'five'],
  ['如何改善目前的睡眠作息？', 'five'],
  ['這段合作值得信任嗎？', 'five'],

  // 雙路比較：兩個可替代行動／方案
  ['我該不該離職？', 'choice'],
  ['留職還是離職？', 'choice'],
  ['買房或租房哪個比較好？', 'choice'],
  ['台北和高雄哪個比較適合我？', 'choice'],
  ['去台北還是高雄發展？', 'choice'],
  ['接受這份工作還是拒絕？', 'choice'],
  ['A或B哪個比較好？', 'choice'],

  // 九宮格：同一議題三個以上面向／全貌／條件式人物輪廓
  ['未來三個月這段關係的走向、阻礙和結果如何？', 'nine'],
  ['今年整體財運如何？', 'nine'],
  ['未來對象的外貌、個性、職業如何？', 'nine'],
  ['如果這月有桃花，對象是什麼類型？', 'nine'],
  ['這個專案的優勢、風險、阻礙與結果如何？', 'nine'],
  ['這段關係接下來的整體發展如何？', 'nine'],

  // 大牌陣：多個獨立生活領域或人生／年度全景
  ['今年感情和工作整體如何？', 'grand'],
  ['感情和工作會順利嗎？', 'grand'],
  ['今年感情、工作、財運整體如何？', 'grand'],
  ['我的年度總運如何？', 'grand'],
  ['我的人生全貌如何？', 'grand'],
  ['未來一年工作、財務與健康的整體變化？', 'grand']
];
for (const [q, expected] of routeCases) {
  const got = api.detect(q);
  check(`route ${q}`, got.id === expected, `got ${got.id}, expected ${expected}; ${got.why}`);
}

// 領域本身不能直接決定牌陣：同為感情／工作／財務，可依問題形狀落到不同牌陣。
check('relationship can route three', api.detect('這月會復合嗎？').id === 'three');
check('relationship can route five', api.detect('他為什麼對我冷淡？').id === 'five');
check('relationship can route nine', api.detect('這段感情的來源、阻礙與結果？').id === 'nine');
check('work can route three', api.detect('面試會錄取嗎？').id === 'three');
check('work can route choice', api.detect('留職還是離職？').id === 'choice');
check('finance threshold can route three', api.detect('本月營業額能破兩萬嗎？').id === 'three');
check('work + finance coupled remains one target', api.detect('副業營業額能破萬嗎？').id === 'three');

// ─────────────────────────────────────────────────────────────
// 2) 前置驗證：不可稽核或高風險事實不得靠牌面硬判。
// ─────────────────────────────────────────────────────────────
const invalidCases = [
  ['這月有肉體桃花？她幾歲？', 'EXACT_AGE'],
  ['他會在幾月幾日聯絡我？', 'EXACT_DATE'],
  ['我這月營業額會是多少元？', 'EXACT_AMOUNT'],
  ['成功機率百分之幾？', 'PROBABILITY'],
  ['未來對象的電話號碼是什麼？', 'IDENTITY'],
  ['公司有誰暗戀我？', 'IDENTITY'],
  ['他愛我嗎？我的工作會升遷嗎？', 'INDEPENDENT_MULTI'],
  ['他愛我嗎，工作會升遷嗎？', 'INDEPENDENT_MULTI'],
  ['A、B或C哪個比較好？', 'TOO_MANY_OPTIONS'],
  ['留職還是？', 'INCOMPLETE_CHOICE'],
  ['我是不是得癌症？', 'DIAGNOSIS'],
  ['我懷孕了嗎？', 'DIAGNOSIS'],
  ['他是不是偷我錢？', 'ALLEGATION'],
  ['他有沒有違法？', 'ALLEGATION'],
  ['我會不會死？', 'FATALITY']
];
for (const [q, code] of invalidCases) {
  const v = api.validate(q);
  check(`validate rejects ${q}`, v.ok === false && v.code === code, `got ${v.code}: ${v.reason}`);
}
check('empty question rejected', api.validate('').ok === false && api.validate('').code === 'EMPTY');
check('relative age tendency allowed', api.validate('對象呈現較年輕、同齡或較成熟？').ok === true);
check('amount threshold allowed', api.validate('本月營業額能破萬嗎？').ok === true);
check('legal outcome tendency allowed', api.validate('官司結果偏有利嗎？').ok === true);
check('health behavior advice allowed', api.validate('面對目前睡眠問題，我應先注意什麼？').ok === true);

// ─────────────────────────────────────────────────────────────
// 3) 複合題拆分：同事件可合併，不同事件必須拆盤。
// ─────────────────────────────────────────────────────────────
check('same event result + cause linked', api.validate('這份工作會錄取嗎？卡在哪裡？').ok === true);
check('same event cause + method linked', api.validate('為什麼沒訂單？我該怎麼改善？').ok === true);
check('same event result + timing linked', api.validate('他會回覆嗎？什麼時候？').ok === true);
check('conditional profile bundle allowed', api.validate('如果有新對象，他呈現什麼類型？').ok === true);
check('different domains and predicates split', api.validate('會復合嗎？副業會破萬嗎？').ok === false);

// ─────────────────────────────────────────────────────────────
// 4) 手動選陣仍須符合結構；較大牌陣可深化單一題，但不能錯用支線結構。
// ─────────────────────────────────────────────────────────────
check('three rejects hidden mind', api.fit('公司有異性暗戀我嗎？', 'three').ok === false);
check('three rejects why question', api.fit('為什麼他不回我？', 'three').ok === false);
check('three rejects timing question', api.fit('什麼時候收到通知？', 'three').ok === false);
check('choice rejects profile classification', api.fit('他較年輕還是較成熟？', 'choice').ok === false);
check('choice rejects non-choice', api.fit('這份工作會錄取嗎？', 'choice').ok === false);
check('non-choice spread rejects real A/B', api.fit('留職還是離職？', 'five').ok === false);
check('global requires grand', api.fit('今年感情、工作、財運整體如何？', 'nine').ok === false);
check('five allows linked why + how', api.fit('為什麼沒訂單？我該怎麼改善？', 'five').ok === true);
check('five rejects broad multi-facet profile', api.fit('未來對象的外貌、個性、職業如何？', 'five').ok === false);
check('nine can deepen simple single issue', api.fit('這份工作會錄取嗎？', 'nine').ok === true);
check('grand can manually deepen specific issue', api.fit('公司有異性暗戀我嗎？', 'grand').ok === true);
check('explicit wrong spread rejected', api.detect('請用三張線解讀：公司有異性暗戀我嗎？').id === null);
check('explicit nine allowed for single issue', api.detect('請用九宮格解讀：這份工作值得繼續嗎？').id === 'nine');

// ─────────────────────────────────────────────────────────────
// 5) 問句證據契約：原問題不得被縮成較弱子命題。
// ─────────────────────────────────────────────────────────────
const xCrush = api.analyze('公司有異性暗戀我嗎？');
check('crush detects hidden qualifier', xCrush.claimQualifiers.includes('未公開／內心狀態'));
check('crush detects workplace qualifier', xCrush.claimQualifiers.includes('公司／職場場域'));
check('crush detects person/gender qualifier', xCrush.claimQualifiers.includes('指定人物或性別條件'));
const xPhysical = api.analyze('這月有肉體桃花嗎？');
check('physical detects fixed horizon', xPhysical.claimQualifiers.includes('固定期限'));
check('physical detects actual contact', xPhysical.claimQualifiers.includes('肉體／實際親密接觸'));
const xRevenue = api.analyze('本月副業營業額能破萬嗎？');
check('threshold detected', xRevenue.claimQualifiers.includes('問句明示門檻'));
check('same event clauses linked', api.analyze('這份工作會錄取嗎？卡在哪裡？').clausesLinked === true);
check('independent clauses not linked', api.analyze('他愛我嗎？工作會升遷嗎？').independentMulti === true);

// ─────────────────────────────────────────────────────────────
// 6) 牌義資料：無變相正逆位，單張限制仍在。
// ─────────────────────────────────────────────────────────────
check('all 36 cards use scope', api.cards.every(c => typeof c.scope === 'string' && c.scope.length > 0));
check('all 36 cards use guard', api.cards.every(c => typeof c.guard === 'string' && c.guard.length > 0));
check('no pos/neg fields', api.cards.every(c => !Object.prototype.hasOwnProperty.call(c,'pos') && !Object.prototype.hasOwnProperty.call(c,'neg')));
check('cloud direction guarded', api.cards[5].guard.includes('明暗面方向'));
check('coffin ending not beautified', api.cards[7].guard.includes('不可') && api.cards[7].scope.includes('結束'));
check('letter valence depends on neighbors', api.cards[26].guard.includes('相鄰牌'));
check('lily age-number ban', api.cards[29].guard.includes('不以牌號換算年齡'));
check('snake not automatic third party', api.cards[6].guard.includes('不自動等於第三者'));
check('dog not automatic lover', api.cards[17].guard.includes('不自動等於戀愛對象'));

const sample3 = [31, 30, 23].map(id => api.cards[id - 1]);
const sample5 = [18, 27, 6, 21, 8].map(id => api.cards[id - 1]);
const sample7 = [31, 25, 35, 21, 3, 22, 23].map(id => api.cards[id - 1]);
const sample9 = [18,3,35,6,19,8,27,21,22].map(id => api.cards[id - 1]);
const sample36 = api.cards.slice();

// ─────────────────────────────────────────────────────────────
// 7) 五套牌陣各自封閉、並加入通用完整命題裁決。
// ─────────────────────────────────────────────────────────────
api.setSignif(null);
let p3 = api.build('這月有肉體桃花嗎？', sample3, 'three', null, 'male');
check('three exact legal set', p3.includes('合法組合只有：1-2、2-3、1-2-3'));
check('three forbids 1-3', p3.includes('1與3不相鄰，禁止另組1-3'));
check('three no past-present-future', p3.includes('沒有固定過去／現在／未來牌位'));
check('three requires all qualifiers', p3.includes('完整三張句必須同時支持這些必要條件'));
check('three contract lists physical qualifier', p3.includes('肉體／實際親密接觸'));

let p5 = api.build('公司有異性暗戀我嗎？', sample5, 'five', null, 'male');
check('five continuous legal sets', p5.includes('1-2-3、2-3-4、3-4-5'));
check('five shortest related segment', p5.includes('最短相關連續片段'));
check('five forbids mirrors', p5.includes('禁止1-5、2-4等非相鄰鏡像組合'));
check('five splits long-line turns', p5.includes('兩個以上轉折，必須拆成不同句子'));
check('hidden question uses tendency wording', p5.includes('牌面偏有此傾向／牌面偏沒有此傾向／目前無法定論'));
check('hidden question contract complete', p5.includes('未公開／內心狀態、公司／職場場域、指定人物或性別條件'));

let p7 = api.build('留職還是離職？', sample7, 'choice', null, 'male');
check('choice A isolated', p7.includes('A只讀1-2、2-3、1-2-3'));
check('choice B isolated', p7.includes('B只讀5-6、6-7、5-6-7'));
check('choice center not cross-paired', p7.includes('不與任何單張跨支線硬組'));
check('choice same criterion enforced', p7.includes('A與B必須用同一標準比較'));
check('choice no positive-card vote', p7.includes('不得以哪一邊好牌較多直接判勝'));

let p9 = api.build('這段關係的來源、阻礙與結果如何？', sample9, 'nine', null, 'male');
check('nine eight lines listed', p9.includes('1-2-3、4-5-6、7-8-9、1-4-7、2-5-8、3-6-9、1-5-9、3-5-7'));
check('nine limits selected lines', p9.includes('最多三條最直接的主要線') && p9.includes('最多一條核對線'));
check('nine does not force all center lines', p9.includes('不保證所有穿中心線都與問題同等相關'));
check('nine connected intersection required', p9.includes('必須共享中心或另一張實際交會牌'));
check('nine forbids skipped endpoints', p9.includes('1-3、1-7、3-9都不是該線中的相鄰牌組'));
check('nine excludes extra geometry', p9.includes('不使用四角、對稱、鏡像、騎士跳'));
check('nine no fixed psychological/time rows', p9.includes('三列不固定是過去／現在／未來') && p9.includes('三排不固定是意識／現實／潛意識'));

api.setSignif(34);
let pg = api.build('公司有異性暗戀我嗎？', sample36, 'grand', null, 'male');
check('grand person remains man', pg.includes('問卜者本人代表為紳士(28)'));
check('grand custom focus does not replace anchors', pg.includes('不能取代問句仍需要的事件、限定、人物或場域定位牌'));
check('grand maximum four anchor roles', pg.includes('最多四張') && pg.includes('事件核心') && pg.includes('人物牌') && pg.includes('場域牌'));
check('grand anchor cannot be generic positive substitute', pg.includes('不能用泛用成功牌或不利牌代替'));
check('grand anchors fixed', pg.includes('定位牌在解讀開始後不得更換'));
check('grand evidence priority', pg.includes('證據優先序為：A.') && pg.includes('最短不跳牌片段'));
check('grand connected evidence graph', pg.includes('形成一個連通證據圖'));
check('grand shortest related line', pg.includes('最短相關線原則'));
check('grand disconnected clues cannot combine', pg.includes('彼此分散、沒有交會的局部線索不能拼成同一事實'));
check('grand no absent-card evidence', pg.includes('全36張都必然出現'));
check('grand excludes mixed later techniques', pg.includes('不使用房屋、騎士跳、鏡像、四角、命運線'));
check('grand tail geometry explicitly system rule', pg.includes('幾何防錯規格，不宣稱為唯一歷史讀法'));
check('grand coordinate index present', pg.includes('全牌座標索引：'));
check('grand person neighbor map present', pg.includes('本人牌立即鄰牌：'));
check('grand focus neighbor map present', pg.includes('預選議題牌立即鄰牌：'));

// ─────────────────────────────────────────────────────────────
// 8) 通用裁決規則必須存在於每一套提示詞。
// ─────────────────────────────────────────────────────────────
for (const [name, prompt] of [['three',p3],['five',p5],['choice',p7],['nine',p9],['grand',pg]]) {
  check(`${name} original question highest authority`, prompt.includes('原問句的完整語意是最高權威'));
  check(`${name} claim completeness`, prompt.includes('事件核心與所有不可省略限定'));
  check(`${name} disconnected evidence forbidden`, prompt.includes('沒有共同牌或合法連續路徑'));
  check(`${name} calibrated verdict rubric`, prompt.includes('「有」＝所有必要要件') && prompt.includes('「目前無法定論」'));
  check(`${name} weaker event cannot upgrade`, prompt.includes('不得把較弱事件升級成較強事件'));
  check(`${name} mandatory question contract`, prompt.includes('【問句證據契約】'));
  check(`${name} semantic spread second-pass`, prompt.includes('【牌陣適配二次檢查】') && prompt.includes('不得只相信前端的關鍵字分類'));
  check(`${name} mismatch must stop reading`, prompt.includes('停止解讀，不得勉強套牌'));
  check(`${name} semantic ranges only`, prompt.includes('可用語義範圍：') && !prompt.includes('順勢表現：') && !prompt.includes('受阻表現：'));
}

// ─────────────────────────────────────────────────────────────
// 9) 大牌陣幾何 sanity。
// ─────────────────────────────────────────────────────────────
check('grand R1C1 coordinate', api.grandCoord(0).label === 'R1C1');
check('grand R4C8 coordinate', api.grandCoord(31).label === 'R4C8');
check('grand tail coordinate', api.grandCoord(35).label === '末排4');
check('corner has 3 neighbors', api.grandNeighbors(sample36, 0).length === 3);
check('middle main card has 8 neighbors', api.grandNeighbors(sample36, 9).length === 8);
check('tail inner card has 2 neighbors', api.grandNeighbors(sample36, 33).length === 2);
check('tail edge card has 1 neighbor', api.grandNeighbors(sample36, 32).length === 1);

// ─────────────────────────────────────────────────────────────
// 10) 固定品牌附加層無條件保留，且與牌義分層。
// ─────────────────────────────────────────────────────────────
for (const [name, prompt] of [['three',p3],['five',p5],['choice',p7],['nine',p9],['grand',pg]]) {
  check(`${name} mandatory brand layer`, prompt.includes('【品牌附加層・固定營運收尾】'));
  check(`${name} explicit ad separation`, prompt.includes('以下為免費服務的品牌資訊，與本次牌義結論分開：'));
  check(`${name} no cure or guarantee claim`, prompt.includes('不得聲稱是牌面指定、能化解牌面、治療、保證招財／桃花／改運'));
  check(`${name} white crystal fallback`, prompt.includes('若無法合理選石，固定介紹白水晶'));
  check(`${name} exact Shopee tail`, prompt.endsWith('[靜月之光蝦皮賣場](https://shopee.tw/a50h95648d?tab=shop)\n願你諸事順遂。'));
}

if (failed) {
  console.error(`\n${failed} failed, ${passed} passed.`);
  process.exit(1);
}
console.log(`PASS: ${passed} Lenormand v6.0 universal root-fix checks.`);
