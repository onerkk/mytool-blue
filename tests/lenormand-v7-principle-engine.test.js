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

// 1. 自動牌陣只提供幾何建議；任何手動牌陣都可接受並由牌面決定實際資訊量。
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
check('manual mismatch remains readable', api.fit('今年感情、工作、財運整體如何？', 'three').resolutionNote.includes('本次仍依你選的牌陣完整解讀'));

// 2. 只攔截占卜不能替代的高風險事實判定；其他複雜問題交由AI分層解讀。
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

// 3. 牌義資料是語義素材，不含正逆位或固定事件答案欄位。
check('36 cards', api.cards.length === 36);
check('semantic data complete', api.cards.every(c => c.key && c.scope && c.guard));
check('no tarot polarity fields', api.cards.every(c => !('pos' in c) && !('neg' in c) && !('upright' in c) && !('reversed' in c)));

const sample3 = [22,34,27].map(id => api.cards[id - 1]);
const sample5 = [18,27,6,21,8].map(id => api.cards[id - 1]);
const sample7 = [31,25,35,21,3,22,23].map(id => api.cards[id - 1]);
const sample9 = [18,3,35,6,19,8,27,21,22].map(id => api.cards[id - 1]);
const grandIds = [6,14,4,16,13,1,19,32,30,23,10,12,3,28,26,11,2,31,25,8,18,36,34,15,9,21,35,5,20,17,24,22,7,27,33,29];
const sample36 = grandIds.map(id => api.cards[id - 1]);
api.setSignif(null);

const p3 = api.build('現任是我這輩子最後一位正緣嗎？', sample3, 'three', null, 'male');
const p5 = api.build('為什麼生意卡住？', sample5, 'five', null, 'male');
const p7 = api.build('留職還是離職？', sample7, 'choice', null, 'male');
const p9 = api.build('這段關係的來源、阻礙與結果如何？', sample9, 'nine', null, 'male');
const pg = api.build('我在目前公司會當主管嗎？', sample36, 'grand', null, 'male');
const prompts = [['three',p3],['five',p5],['choice',p7],['nine',p9],['grand',pg]];

// 4. 五種牌陣共用「語義產出驅動」核心，而不是依牌數套固定答案篇幅。
for (const [name, prompt] of prompts) {
  check(`${name} semantic-yield engine`, prompt.includes('<雷諾曼語義產出引擎>'));
  check(`${name} completion by propositions`, prompt.includes('凡能為原問句增加一個可回溯、彼此不重複的有效命題'));
  check(`${name} card count only geometry`, prompt.includes('牌數只決定可用幾何，不決定答案長短、面向數量或分析深度'));
  check(`${name} question-world model`, prompt.includes('第一輪｜問題世界建模'));
  check(`${name} all legal paths and segments`, prompt.includes('每一條最大路徑及其全部連續片段'));
  check(`${name} multiple local hypotheses`, prompt.includes('每個相鄰對先生成數個符合本題的自然句法候選'));
  check(`${name} recursive folding`, prompt.includes('完整長句有權重新定義短句'));
  check(`${name} independent proposition extraction`, prompt.includes('第三輪｜提取獨立命題'));
  check(`${name} keeps qualifiers`, prompt.includes('改變強度、範圍、先後或成立條件'));
  check(`${name} whole-spread competition`, prompt.includes('第四輪｜全盤語義競爭'));
  check(`${name} counterevidence`, prompt.includes('主動尋找反證或限制線'));
  check(`${name} coverage ledger`, prompt.includes('第五輪｜覆蓋帳本與語義飽和'));
  check(`${name} coverage classifications`, prompt.includes('新增命題、佐證既有命題、限定或反證、與本題無關、證據不足'));
  check(`${name} semantic saturation`, prompt.includes('直到沒有任何尚未處理的牌句能改變答案內容'));
  check(`${name} three may be deep`, prompt.includes('三張牌若形成多個獨立命題，就完整展開'));
  check(`${name} grand may be concise`, prompt.includes('三十六張若大量牌句同義，就合併而不灌水'));
  check(`${name} only semantic-yield controls output`, prompt.includes('唯一的取捨標準是該內容是否為原問題增加新的'));
  check(`${name} advice count adaptive`, prompt.includes('建議數量不設上限或下限'));
  check(`${name} no keyword event table`, prompt.includes('不套固定題型、事件表或預設定位牌'));
  check(`${name} exact final tail`, prompt.endsWith('[靜月之光蝦皮賣場](https://shopee.tw/a50h95648d?tab=shop)\n願你諸事順遂。'));
}

// 5. 牌句建模原則給AI發揮語義能力，但要求以幾何與長線校正。
for (const [name, prompt] of prompts) {
  check(`${name} cards are words not events`, prompt.includes('每張牌是具有多種可用語義的詞，不是固定事件'));
  check(`${name} dynamic syntax`, prompt.includes('哪張牌是主題、動作、條件、修飾或落點，由原問句、牌序與更長路徑共同決定'));
  check(`${name} no fake reverse path`, prompt.includes('反向檢查不能創造新的幾何路徑'));
  check(`${name} long path reframes`, prompt.includes('長線採遞迴折疊而非單字相加'));
  check(`${name} strength calibration`, prompt.includes('可能性、傾向、推進、可見、落實、穩定、停擺與結束必須區分'));
  check(`${name} flexible role carrier`, prompt.includes('一個角色可由單張、相鄰組合或整條線表達'));
  check(`${name} no post-hoc person binding`, prompt.includes('不能因結果方便而事後指定'));
}

// 6. 三張線：牌少不縮答，三個合法片段全部完成。
check('three module', p3.includes('<牌陣模組 name="三張線">'));
check('three exact geometry', p3.includes('合法幾何只有1-2、2-3與1-2-3'));
check('three actual line', p3.includes('最大路徑：1.十字路口→2.魚→3.信'));
check('three no short-answer bias', p3.includes('答案內容不因只有三張而被壓縮'));
check('three all distinct meanings output', p3.includes('不同命題、條件、轉折與實際方向，都要完整呈現'));

// 7. 五張線：十個片段全覆蓋，完整線與局部新增資訊並存。
check('five module', p5.includes('<牌陣模組 name="五張線">'));
check('five ten segments', p5.includes('全部十個連續片段'));
check('five geometry registry', p5.includes('全部連續片段：1-2、2-3、3-4、4-5；1-2-3、2-3-4、3-4-5；1-2-3-4、2-3-4-5；1-2-3-4-5'));
check('five local increments retained', p5.includes('每個較短片段只要增加不同機制、條件、轉折或結果，就必須納入答案'));

// 8. 雙路：兩路各自完整，內容量不要求對稱。
check('choice module', p7.includes('<牌陣模組 name="雙路比較">'));
check('choice independent semantic networks', p7.includes('形成兩個獨立語義網'));
check('choice no fake adjacency', p7.includes('不與支線牌製造假相鄰'));
check('choice same natural standard', p7.includes('依原問句自然形成的共同判準比較'));
check('choice unequal information allowed', p7.includes('兩路資訊量可以不同，不為了對稱而增刪內容'));

// 9. 九宮格：八線交會，沒有固定章節或中心牌預設。
check('nine module', p9.includes('<牌陣模組 name="九宮格">'));
check('nine all 16 pairs', p9.includes('合法相鄰對：1-2、2-3、4-5、5-6、7-8、8-9、1-4、4-7、2-5、5-8、3-6、6-9、1-5、5-9、3-5、5-7'));
check('nine all eight paths', p9.includes('合法最大路徑：1-2-3、4-5-6、7-8-9、1-4-7、2-5-8、3-6-9、1-5-9、3-5-7'));
check('nine center no fixed role', p9.includes('中心牌是連線度最高的節點，但沒有固定時間、心理或結果含義'));
check('nine semantic depth not template', p9.includes('內容多寡由牌面語義產出決定，不由九格的固定章節決定'));

// 10. 大牌陣：30條主盤線、236個連續片段、本人入口而非閱讀邊界。
const grandLines = api.grandLines();
check('grand 30 legal main paths', grandLines.length === 30, `got ${grandLines.length}`);
check('grand 236 contiguous segments', api.grandSegmentCount() === 236, `got ${api.grandSegmentCount()}`);
check('grand module', pg.includes('<牌陣模組 name="36張大牌陣">'));
check('grand all segments are candidates', pg.includes('主盤30條水平、垂直與斜向最大直線及其全部連續片段都是候選牌句'));
check('grand no keyword-card cherry pick', pg.includes('不得只挑與題目關鍵字相似的牌'));
check('grand subject not boundary', pg.includes('不得只讀本人牌附近'));
check('grand all effective paths included', pg.includes('全盤其他路徑只要新增有效命題，同樣必須納入'));
check('grand semantic yield controls length', pg.includes('最終篇幅只由有效命題數量決定'));
check('grand geometry emits count', pg.includes('主盤30條合法最大路徑（其內共有236個兩張以上連續片段；均須進入內部覆蓋帳本）：'));
check('grand subject entry', pg.includes('本人牌入口：紳士在R2C6'));
check('grand subject neighborhood', pg.includes('本人牌立即鄰域：'));
check('grand subject crossing paths', pg.includes('本人牌穿越路徑：'));
check('grand tail isolated', pg.includes('末排最大路徑：33.蛇→34.信→35.鑰匙→36.淑女'));

// 11. 輸出契約明確排除固定篇幅與固定建議數，保留全部獨立命題。
for (const [name, prompt] of prompts) {
  check(`${name} output all effective propositions`, prompt.includes('正文必須呈現全部與原問句相關、能增加不同答案內容的有效命題'));
  check(`${name} no spread-size depth rule`, prompt.includes('不要按照牌陣張數、固定章節、預設段落數或字數決定深度'));
  check(`${name} small spread not omitted`, prompt.includes('小牌陣不得因牌少而省略可讀出的內容'));
  check(`${name} grand not padded`, prompt.includes('大牌陣也不得以重複或無關牌句灌水'));
  check(`${name} categories are not template`, prompt.includes('這些只是可能的語義關係，不是必須套用的固定目錄'));
  check(`${name} all actionable directions`, prompt.includes('提出所有由已成立牌句直接推導'));
  check(`${name} no fixed advice count`, prompt.includes('數量不設上限或下限'));
  check(`${name} final coverage audit`, prompt.includes('所有合法路徑與連續片段均已處理'));
  check(`${name} evidence citations`, prompt.includes('每個重要斷語在句尾標示「〔牌面：A＋B＋C〕」'));
}

// 12. 人物與品牌邊界維持獨立，不干擾語義產出。
check('self card must be drawn', p3.includes('該牌實際出現在本盤時才能進入牌句'));
check('other people only reliably bound', p3.includes('只有身分可可靠對應時才綁定'));
check('exact limits layered', p3.includes('把可判斷的核心與仍需現實資料確認的部分分開說明'));
check('brand delayed', p3.includes('等占卜正文完全完成後才執行本段'));
check('brand cannot influence reading', p3.includes('本段不得反向影響牌義判斷'));
check('brand contextual selection', p3.includes('真實生活情境、自然配戴場合'));
check('brand no efficacy claims', p3.includes('不得宣稱治療、保護、穩定情緒'));

// 13. 版本、描述、快取與變更紀錄同步。
const source = fs.readFileSync(sourcePath, 'utf8');
const indexSource = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
check('v15 source marker', source.includes('Lenormand v15.0（語義產出驅動引擎）'));
check('v15 console marker', source.includes('semantic-yield completeness engine'));
check('v15 grand description', api.spreads.grand.desc.includes('完整覆蓋') && api.spreads.grand.desc.includes('不重複'));
check('v15 cache marker', indexSource.includes('JS/lenormand.js?v=20260715v15_0'));
check('v15 changelog marker', indexSource.includes('雷諾曼 v15.0 語義產出驅動引擎'));

console.log(`PASS: ${passed} Lenormand v15 semantic-yield completeness checks.`);
if (failed) {
  console.error(`FAIL: ${failed} checks.`);
  process.exit(1);
}
