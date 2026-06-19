// ═══════════════════════════════════════
// 靜月之光 — 雷諾曼牌 Lenormand v10.0
// v10.0（2026-06-19）四牌陣統一編譯器核心重構：
//   1. 自然語言先保留「主體／行動／目標／判斷」；不再把短期方案題改寫成長期成功題。
//   2. 所有題型共用同一公式：直接牌對D為主要語句，連續三張S為較低權重短句。
//   3. 中牌在S中負責主要修飾；正向與負向結構共同彙整，不再用全有全無 gate 裁決。
//   4. 固定輸出五級傾向：明顯支持／較支持／正反並存／較不支持／明顯不支持。
//   5. 一個物理D／S只登錄一次；重複引用不加權，且避免D被包含於S時重複灌票。
//   6. 人物歸屬、hypothetical、年齡、精確時間與醫療邊界維持嚴格限制。
//   7. LLM只轉寫程式已整合的主張、支持、風險與未知邊界；不自行發明操作細節。
//   8. 三／五／九／36張全部先經同一證據編譯器；牌陣差異只決定幾何、焦點與分析深度，不再出現小牌陣缺 claim_plan。
// Petit Lenormand 36 張・歷史基線＋本站明示的現代判讀規約
// ═══════════════════════════════════════
(function () {
'use strict';
console.log('[Lenormand] 靜月之光 雷諾曼牌 v10.0 loaded — 四牌陣統一編譯器');

// ════════════════════════════════════
// 一、36 張牌完整數據
// ════════════════════════════════════
var CARDS = [
  {id:1,  name:'騎士',  en:'Rider',   key:'消息・來訪・速度',        pos:'好消息到來、快速發展、訪客',     neg:'壞消息、急躁、不穩定',          topic:'消息',   suit:'♥9',  element:'fire'},
  {id:2,  name:'幸運草', en:'Clover',   key:'小幸運・機會・短暫',      pos:'好運降臨、小機會、輕鬆',        neg:'運氣短暫、錯過機會',            topic:'運氣',   suit:'♦6',  element:'earth'},
  {id:3,  name:'船',    en:'Ship',     key:'旅行・貿易・遠方',        pos:'旅行、商業機會、進展',          neg:'延遲、漂泊、不安定',            topic:'移動',   suit:'♠10', element:'water'},
  {id:4,  name:'房屋',  en:'House',    key:'家庭・穩定・根基',        pos:'家庭和睦、穩定、安全感',        neg:'家庭問題、封閉、固執',           topic:'家庭',   suit:'♥K',  element:'earth'},
  {id:5,  name:'大樹',  en:'Tree',     key:'健康・成長・根深',        pos:'健康良好、穩定成長、生命力',    neg:'健康問題、停滯、依賴',           topic:'健康',   suit:'♥7',  element:'earth'},
  {id:6,  name:'雲',    en:'Clouds',   key:'不明・混亂・判斷不清',      pos:'暫時不明、判斷需保留',     neg:'混亂、迷茫、欺騙',              topic:'困惑',   suit:'♣K',  element:'air'},
  {id:7,  name:'蛇',    en:'Snake',    key:'複雜・欺騙・女性',        pos:'智慧、靈活、有經驗的女性',     neg:'背叛、欺騙、曲折、嫉妒',        topic:'欺騙',   suit:'♣Q',  element:'fire'},
  {id:8,  name:'棺材',  en:'Coffin',   key:'結束・終止・封閉',        pos:'舊事結束、終止、放下',         neg:'生病、失去、悲傷、結束',         topic:'結束',   suit:'♦9',  element:'earth'},
  {id:9,  name:'花束',  en:'Bouquet',  key:'美好・禮物・社交',        pos:'禮物、讚美、美好事物、邀請',   neg:'虛榮、表面功夫',                topic:'美好',   suit:'♠Q',  element:'earth'},
  {id:10, name:'鐮刀',  en:'Scythe',   key:'切斷・突然中止・急迫風險',        pos:'快速決斷、乾脆切割',           neg:'突然的痛苦、意外、手術',         topic:'切斷',   suit:'♦J',  element:'fire'},
  {id:11, name:'鞭子',  en:'Whip',     key:'衝突・爭論・反覆循環',        pos:'鍛鍊、討論、反覆處理',           neg:'爭吵、暴力、痛苦的重複',        topic:'衝突',   suit:'♣J',  element:'fire'},
  {id:12, name:'鳥',    en:'Birds',    key:'溝通・焦慮・一對',        pos:'對話、溝通、一對伴侶',         neg:'焦慮、八卦、緊張',              topic:'溝通',   suit:'♦7',  element:'air'},
  {id:13, name:'孩子',  en:'Child',    key:'新開始・天真・小',        pos:'新開始、天真、新計畫',          neg:'幼稚、不成熟、弱小',            topic:'新事',   suit:'♠J',  element:'water'},
  {id:14, name:'狐狸',  en:'Fox',      key:'工作・狡猾・自保',        pos:'聰明、工作、自我保護',         neg:'欺騙、不誠實、自私',            topic:'工作',   suit:'♣9',  element:'fire'},
  {id:15, name:'熊',    en:'Bear',     key:'力量・權威・財務',        pos:'權力、保護、財務強勢',         neg:'控制、嫉妒、霸道',              topic:'權力',   suit:'♣10', element:'earth'},
  {id:16, name:'星星',  en:'Stars',    key:'希望・指引・科技',        pos:'希望、靈感、方向、網路',       neg:'迷失方向、不切實際',            topic:'希望',   suit:'♥6',  element:'air'},
  {id:17, name:'鸛',    en:'Stork',    key:'改變・搬遷・進步',        pos:'正面改變、搬遷、懷孕',        neg:'變動不安、不穩定',              topic:'改變',   suit:'♥Q',  element:'air'},
  {id:18, name:'狗',    en:'Dog',      key:'忠誠・友誼・信任',        pos:'忠誠的朋友、信任、支持',       neg:'過度依賴、服從、被利用',        topic:'友誼',   suit:'♥10', element:'earth'},
  {id:19, name:'塔',    en:'Tower',    key:'權威・孤立・機構',        pos:'獨立、權威、公司、政府',       neg:'孤立、高傲、被困',              topic:'權威',   suit:'♠6',  element:'earth'},
  {id:20, name:'花園',  en:'Garden',   key:'社交・公開・群眾',        pos:'社交活動、公開場合、名聲',     neg:'缺乏隱私、流言',               topic:'社交',   suit:'♠8',  element:'earth'},
  {id:21, name:'山',    en:'Mountain', key:'阻礙・延遲・難以跨越',        pos:'阻礙存在、進展延遲、難以跨越',           neg:'阻礙、延遲、困難',              topic:'阻礙',   suit:'♣8',  element:'earth'},
  {id:22, name:'十字路口',en:'Crossroads',key:'選擇・決定・自由',     pos:'多個選擇、自由、機會',         neg:'猶豫不決、方向混亂',            topic:'選擇',   suit:'♦Q',  element:'air'},
  {id:23, name:'老鼠',  en:'Mice',     key:'侵蝕・損耗・持續消耗',        pos:'持續耗損、逐步減少',               neg:'損失、偷竊、焦慮、侵蝕',       topic:'損失',   suit:'♣7',  element:'earth'},
  {id:24, name:'心',    en:'Heart',    key:'愛・感情・熱情',          pos:'愛情、真心、浪漫、熱情',       neg:'心碎、感情問題',                topic:'愛情',   suit:'♥J',  element:'water'},
  {id:25, name:'戒指',  en:'Ring',     key:'承諾・合約・循環',        pos:'承諾、婚約、合約、合作',       neg:'被束縛、不公平的協議',          topic:'承諾',   suit:'♣A',  element:'earth'},
  {id:26, name:'書',    en:'Book',     key:'秘密・知識・學習',        pos:'學習、秘密揭露、教育',         neg:'隱藏的事、無知',                topic:'秘密',   suit:'♦10', element:'air'},
  {id:27, name:'信',    en:'Letter',   key:'訊息・文件・溝通',        pos:'收到訊息、文件、合約',         neg:'壞消息、拖延的文書',            topic:'文件',   suit:'♠7',  element:'air'},
  {id:28, name:'紳士',  en:'Man',      key:'男性問卜者・男性',        pos:'男性問卜者或重要男性',         neg:'不成熟的男性',                  topic:'男性',   suit:'♥A',  element:'fire'},
  {id:29, name:'淑女',  en:'Woman',    key:'女性問卜者・女性',        pos:'女性問卜者或重要女性',         neg:'不成熟的女性',                  topic:'女性',   suit:'♠A',  element:'water'},
  {id:30, name:'百合',  en:'Lily',     key:'和平・成熟・純潔',        pos:'和平、智慧、成熟、性',         neg:'冷淡、缺乏激情、老化',          topic:'和平',   suit:'♠K',  element:'water'},
  {id:31, name:'太陽',  en:'Sun',      key:'成功・光明・能量',        pos:'成功、喜悅、活力、曝光',       neg:'過度曝光、精力耗盡',            topic:'成功',   suit:'♦A',  element:'fire'},
  {id:32, name:'月亮',  en:'Moon',     key:'情感・直覺・名聲',        pos:'榮譽、情感深度、直覺、名聲',   neg:'情緒波動、幻覺',                topic:'情感',   suit:'♥8',  element:'water'},
  {id:33, name:'鑰匙',  en:'Key',      key:'解答・確定・重要',        pos:'解答出現、確定、成功、重要',   neg:'被鎖住（罕見，此牌幾乎全正）',   topic:'解答',   suit:'♦8',  element:'fire'},
  {id:34, name:'魚',    en:'Fish',     key:'財富・生意・流動',        pos:'財運、商業、豐盛、流動',       neg:'財務損失、貪婪',                topic:'財富',   suit:'♦K',  element:'water'},
  {id:35, name:'錨',    en:'Anchor',   key:'穩定・工作・堅持',        pos:'穩定、安全感、持久、職業',     neg:'停滯、被困、執著',              topic:'穩定',   suit:'♠9',  element:'earth'},
  {id:36, name:'十字架', en:'Cross',    key:'負擔・考驗・難卸壓力',        pos:'負擔、考驗、難卸責任',         neg:'痛苦、負擔、沉重責任',          topic:'負擔',   suit:'♣6',  element:'earth'}
];

var IMG_MAP = {
  1: 'ln-cards/ln-01-rider.png',
  2: 'ln-cards/ln-02-clover.png',
  3: 'ln-cards/ln-03-ship.png',
  4: 'ln-cards/ln-04-house.png',
  5: 'ln-cards/ln-05-tree.png',
  6: 'ln-cards/ln-06-clouds.png',
  7: 'ln-cards/ln-07-snake.png',
  8: 'ln-cards/ln-08-coffin.png',
  9: 'ln-cards/ln-09-bouquet.png',
  10: 'ln-cards/ln-10-scythe.png',
  11: 'ln-cards/ln-11-whip.png',
  12: 'ln-cards/ln-12-birds.png',
  13: 'ln-cards/ln-13-child.png',
  14: 'ln-cards/ln-14-fox.png',
  15: 'ln-cards/ln-15-bear.png',
  16: 'ln-cards/ln-16-stars.png',
  17: 'ln-cards/ln-17-stork.png',
  18: 'ln-cards/ln-18-dog.png',
  19: 'ln-cards/ln-19-tower.png',
  20: 'ln-cards/ln-20-garden.png',
  21: 'ln-cards/ln-21-mountain.png',
  22: 'ln-cards/ln-22-crossroads.png',
  23: 'ln-cards/ln-23-mice.png',
  24: 'ln-cards/ln-24-heart.png',
  25: 'ln-cards/ln-25-ring.png',
  26: 'ln-cards/ln-26-book.png',
  27: 'ln-cards/ln-27-letter.png',
  28: 'ln-cards/ln-28-man.png',
  29: 'ln-cards/ln-29-woman.png',
  30: 'ln-cards/ln-30-lily.png',
  31: 'ln-cards/ln-31-sun.png',
  32: 'ln-cards/ln-32-moon.png',
  33: 'ln-cards/ln-33-key.png',
  34: 'ln-cards/ln-34-fish.png',
  35: 'ln-cards/ln-35-anchor.png',
  36: 'ln-cards/ln-36-cross.png',
};

// ════════════════════════════════════
// 二、牌陣定義
// ════════════════════════════════════
var SPREADS = {
  three: { id:'three', name:'三張線', en:'Three-Card Line', count:3,
    desc:'三張線以中央牌為核心，左右牌共同修飾；兩組相鄰牌對建立局部語句，完整三張形成總結短句。未啟用時間規則時不把左右位置硬解成過去與未來。',
    positions:['左側條件','核心','右側影響']
  },
  five: { id:'five', name:'五張線', en:'Five-Card Line', count:5,
    desc:'五張線以第3張為核心，2-3-4形成近身主句，1-2與4-5補充外圍條件；並讀取三個連續三張短句與兩組對稱位置。',
    positions:['左外背景','左近條件','核心','右近影響','右外背景']
  },
  nine: { id:'nine', name:'九宮格', en:'Nine-Card Box (3×3)', count:9,
    desc:'九宮格以中心第5張為核心，中心十字優先，三橫、三直與兩條對角線形成八個完整短句；角落只在與核心線或命題相關時補充。',
    positions:['左上外圍','上方條件','右上外圍','左側條件','核心','右側影響','左下外圍','下方根基','右下外圍'],
    layout:'3x3'
  },
  grand: { id:'grand', name:'大牌陣', en:'Grand Tableau', count:36,
    desc:'全部36張採4排8張＋末排4張置中。先讀問卜者／主題牌附近，再讀相關相鄰牌對與連續三張短句；房屋、全局框架與完整線只補充脈絡，不單獨提高確定度。',
    positions:null,
    layout:'8-8-8-8-4'
  }
};

// v5.1：二選一比較題使用獨立的對稱九宮格。選項在抽牌前即綁定左右欄，
// 不以選項名稱搜尋同名牌，也不把商品／人物名稱事後硬套成 Lenormand 指示牌。
var COMPARISON_LAYOUT = {
  id:'symmetric_nine_comparison',
  positions:[
    {slot:1, code:'A-strength', side:'A', role:'有利／優勢'},
    {slot:2, code:'X-strength', side:'shared', role:'共同條件／比較基準'},
    {slot:3, code:'B-strength', side:'B', role:'有利／優勢'},
    {slot:4, code:'A-fit', side:'A', role:'與問卜者的適配核心'},
    {slot:5, code:'X-core', side:'shared', role:'本題真正決策核心'},
    {slot:6, code:'B-fit', side:'B', role:'與問卜者的適配核心'},
    {slot:7, code:'A-risk', side:'A', role:'阻礙／代價'},
    {slot:8, code:'X-tradeoff', side:'shared', role:'共同取捨／現實限制'},
    {slot:9, code:'B-risk', side:'B', role:'阻礙／代價'}
  ]
};
var COMPARISON_POSITIVE_IDS = [1,2,4,5,9,16,17,18,24,25,30,31,33,35];
var COMPARISON_NEGATIVE_IDS = [6,8,10,11,21,23,36];

// ════════════════════════════════════
// 三、洗牌與抽牌
// ════════════════════════════════════
var _lnDeck = [];
var _lnDrawn = [];
var _lnSpread = 'auto';      // v2.6：預設自動判斷（使用者仍可手動選）
var _lnResolved = 'three';   // v2.6：實際抽牌用的牌陣（auto 解析後）
var _lnAutoPick = null;      // v2.6：自動判斷結果 {id, why}，供結果區標示
var _lnQuestion = '';
var _lnSigGender = 'male'; // for Grand Tableau（未聲明性別時的暫定定位，會被 _lnGender 覆寫）
var _lnGender = (function(){ try { return localStorage.getItem('jy_ln_gender') || null; } catch(e){ return null; } })(); // v3.1：問卜者性別（男/女/未聲明）——人物牌歸屬與 GT 代表牌的權威來源
var _lnSignif = null;        // 指示牌 card id（1-36）或 null。28／29可作人物牌；非人物牌只作次要焦點。
                             // 九宮格預置中央是本站選用的現代圍繞法；大牌陣仍以問卜者人物牌為主要代表牌。

function _lnSecRand() { // v3.6 密碼學隨機（決定牌序的唯一隨機源；退路 Math.random）
  try { var _u = new Uint32Array(1); (window.crypto || window.msCrypto).getRandomValues(_u); return _u[0] / 4294967296; }
  catch (e) { return Math.random(); }
}
function shuffleDeck() {
  _lnDeck = CARDS.map(function(c){ return JSON.parse(JSON.stringify(c)); });
  // Fisher-Yates
  for (var i = _lnDeck.length - 1; i > 0; i--) {
    var j = Math.floor(_lnSecRand() * (i + 1)); // v3.6 密碼學隨機洗牌
    var t = _lnDeck[i]; _lnDeck[i] = _lnDeck[j]; _lnDeck[j] = t;
  }
  _lnDrawn = [];
}

function drawCards(count) {
  shuffleDeck();
  _lnDrawn = _lnDeck.slice(0, count);
  return _lnDrawn;
}

// ════════════════════════════════════
// 四、文獻分層提示詞生成
// ════════════════════════════════════
// ── v2.6 問題→牌陣 自動判斷（分層交叉，鏡照塔羅 detectSpreadType 的細度，映射到雷諾曼四陣） ──

function _lnNormalizeComparisonText(value) {
  return String(value || '')
    .replace(/[？?]/g, '')
    .replace(/5\s*行/g, '五行')
    .replace(/[：:]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function _lnCanonicalOptionLabel(value) {
  var label = String(value || '').trim();
  if (/^(?:看|依|按照|參考)?\s*八字\s*五行/.test(label)) return '依八字五行搭配';
  if (/自己(?:真正)?喜歡|個人喜好|自己順眼|喜歡的款式/.test(label)) return '自己喜歡的款式';
  return label;
}

function _lnCleanOptionLabel(value) {
  var label = _lnNormalizeComparisonText(value)
    .replace(/^[\s「『【\[\(（]+|[\s」』】\]\)）]+$/g, '')
    .replace(/^(?:請問|想問|比較|二選一)\s*/g, '')
    // 移除「我搭配手鍊是要…」等共同問句骨架，保留真正選項。
    .replace(/^(?:我)?\s*(?:(?:搭配|配戴|佩戴|戴|選擇?|購買)\s*)?(?:手鍊|水晶|飾品)?\s*(?:是)?\s*(?:要|該|應該)?\s*/g, '')
    .replace(/^(?:要選|選擇?|要|該|應該|搭配|配戴|佩戴)\s*/g, '')
    .replace(/\s*(?:哪(?:一)?個|那(?:一)?個|何者|哪款|哪種|誰)\s*.*$/g, '')
    .replace(/\s*(?:比較|更|最)?適合(?:我)?(?:配戴|佩戴|使用|選擇|購買|戴)?\s*.*$/g, '')
    .replace(/\s*(?:我該|應該|要)?選(?:哪(?:一)?個|誰)?\s*.*$/g, '')
    .trim();
  return _lnCanonicalOptionLabel(label);
}

function _lnFindComparisonConnector(raw) {
  // 「還是／或是／或者／vs」本身即表示替代；「跟／和／與／、／或」還需搭配明確選擇語法，避免一般並列句誤判。
  var explicit = /(?:還是|或是|或者|／|\/|\bvs\.?\b)/i;
  var choiceCue = /(?:哪(?:一)?個|那(?:一)?個|何者|哪款|哪種|比較適合|更適合|最適合|該選|應該選|選哪|二選一|要選)/;
  var m = raw.match(explicit);
  if (m) return { index:m.index, text:m[0] };
  if (!choiceCue.test(raw)) return null;
  m = raw.match(/(?:跟|和|與|、|或)/);
  return m ? { index:m.index, text:m[0] } : null;
}

function detectComparisonQuestion(text) {
  var raw = _lnNormalizeComparisonText(text);
  if (!raw) return null;
  var connector = _lnFindComparisonConnector(raw);
  if (!connector) return null;
  var left = _lnCleanOptionLabel(raw.slice(0, connector.index));
  var right = _lnCleanOptionLabel(raw.slice(connector.index + connector.text.length));
  right = right.replace(/\s*(?:那|哪)(?:一)?個.*$/g, '').trim();
  if (!left || !right || left === right || left.length > 40 || right.length > 40) return null;
  var criterion = /手鍊|水晶|五行|搭配/.test(raw) ? '手鍊搭配原則' : /配戴|佩戴|戴/.test(raw) ? '配戴適配' : /購買|買/.test(raw) ? '選購適配' : '整體適配';
  return {
    type:'comparison_suitability',
    options:[left,right],
    criterion:criterion,
    original:raw
  };
}

function comparisonPositionLabels(comparison) {
  if (!comparison) return SPREADS.nine.positions.slice();
  var a=comparison.options[0], b=comparison.options[1];
  return COMPARISON_LAYOUT.positions.map(function(p){
    if(p.side==='A')return a+'・'+p.role;
    if(p.side==='B')return b+'・'+p.role;
    return p.role;
  });
}

function _lnDetectSpread(q) {
  q = (q || '').trim();
  var comparison = detectComparisonQuestion(q);
  if (comparison) return { id:'nine', why:'二選一適配題——固定使用左右對稱九宮格，兩個選項在抽牌前採相同位置規則比較' };
  var qMarks = (q.match(/[？?]/g) || []).length;
  var len = q.replace(/\s/g, '').length;

  // 第0層：使用者明確指定牌陣（最高優先）
  if (/大牌陣|Grand\s*Tableau|36\s*張|全牌陣/i.test(q)) return { id: 'grand', why: '你指定了大牌陣' };
  if (/九宮格|9\s*宮|3\s*[xX×]\s*3/.test(q))           return { id: 'nine',  why: '你指定了九宮格' };
  if (/五張|5\s*張/.test(q))                            return { id: 'five',  why: '你指定了五張線' };
  if (/三張|3\s*張/.test(q))                            return { id: 'three', why: '你指定了三張線' };

  // 第1層：互動類型與領域訊號
  var isYesNo   = /嗎[？?]?\s*$|^(會不會|有沒有|該不該|可不可以|能不能|是不是|適不適合|好不好|值不值得?|行不行|對不對|要不要)|會嗎|能嗎|好嗎|行嗎|夠嗎|對嗎|成嗎|有救/.test(q);
  var isChoose  = /還是|或者|二選一|兩個.*選|哪一個|哪個好|兩者|選.*哪|留.*走|A.*B.*選/.test(q);
  var isWhen    = /什麼時候|幾時|多久|何時|哪一年|哪個月|幾月|時間點|來得及|等多久|還要等|快了嗎|應期|多快|近期.*嗎/.test(q);
  var isWhy     = /為什麼|為何|怎麼會|為啥|什麼原因|原因是|根源|問題出在|到底怎麼了|怎麼回事/.test(q);
  var isHow     = /如何|怎麼做|怎麼辦|怎樣才|方法|建議|策略|怎麼改|怎麼處理|怎麼經營|怎麼提升|要怎麼/.test(q);
  var isBig     = /全面|整年|今年.*運勢|年度|未來一年|人生|大方向|完整.*看|全部.*看|所有面向|通盤/.test(q);
  var isOverview= /整體|運勢|接下來|近況|狀況如何|幫我看看/.test(q);
  var isComplex = /又.*又|一方面.*一方面|同時.*還|好幾件|很多事|牽涉|複雜|糾纏|連環/.test(q);
  var hasPerson = /他|她|對方|那個人|另一半|前任|現任|老公|老婆|男友|女友|伴侶|曖昧|喜歡|愛不愛|想不想|復合|分手|挽回|婚姻|感情|桃花|追|告白/.test(q);
  var isThird   = /第三者|小三|外遇|劈腿|介入|腳踏兩條船/.test(q);
  var isWorkMoney = /工作|職場|上班|離職|換.*工作|跳槽|轉職|面試|升遷|加薪|薪水|老闆|主管|同事|案子|專案|生意|創業|副業|訂單|客戶|財運|錢|收入|投資|股票|貸款|買房|賣房/.test(q);

  // 第2層：交叉裁決（全局型 ＞ 第三者 ＞ 抉擇 ＞ 時間 ＞ 短是非 ＞ 感情對方 ＞ 原因 ＞ 工作財運 ＞ 一般是非 ＞ 方法 ＞ 整體 ＞ 預設）
  if (isBig || qMarks >= 3 || len > 60 || (isComplex && len > 30))
    return { id: 'grand', why: '多面向／全局型問題——36 張大牌陣全景掃描' };
  if (isThird)  return { id: 'nine',  why: '感情第三者議題——九宮格看檯面下的層次' };
  if (isChoose) return { id: 'nine',  why: '抉擇題——九宮格對照兩股力量與隱情' };
  if (isWhen)   return { id: 'five',  why: '時間題——五張線看時間推進與快慢' };
  if (isYesNo && !hasPerson && len <= 14)
    return { id: 'three', why: '單一是非題——三張線快狠準' };
  if (hasPerson) return { id: 'nine', why: '感情／對方心思——九宮格看上中下三層' };
  if (isWhy)     return { id: 'nine', why: '原因題——九宮格挖檯面下的根源' };
  if (isWorkMoney) return { id: 'nine', why: '工作／財運——九宮格看現況、助力與阻力' };
  if (isYesNo)   return { id: 'three', why: '是非題——三張線直接給方向' };
  if (isHow)     return { id: 'five',  why: '方法題——五張線給路徑與故事' };
  if (isOverview) return { id: 'nine', why: '整體狀況——九宮格全層掃描' };
  if (!q) return { id: 'five', why: '未輸入問題——五張線通用故事線' };
  return { id: 'five', why: '一般問題——五張線看因果走向' };
}


function resolveSpreadForQuestion(question, requestedSpread) {
  var comparison=detectComparisonQuestion(question);
  if(comparison) return {id:'nine',forced:true,why:'二選一比較題固定使用左右對稱九宮格；選項A／B在抽牌前採相同位置規則'};
  if(requestedSpread==='auto'){
    var auto=_lnDetectSpread(question);
    return {id:auto.id,forced:false,why:auto.why};
  }
  return {id:requestedSpread||'three',forced:false,why:''};
}

function gtCoordinate(index) {
  if (index < 0 || index > 35) return null;
  if (index < 32) return { row: Math.floor(index / 8) + 1, col: (index % 8) + 1 };
  // 4×8+4 的 cartouche 置中於第3～6欄；這是本站唯一幾何模型。
  return { row: 5, col: (index - 32) + 3 };
}

function gtIndexAt(row, col) {
  if (row >= 1 && row <= 4 && col >= 1 && col <= 8) return (row - 1) * 8 + (col - 1);
  if (row === 5 && col >= 3 && col <= 6) return 32 + (col - 3);
  return -1;
}

function buildGrandGeometry(drawn) {
  var directions = [
    [-1,-1],[-1,0],[-1,1],
    [0,-1],          [0,1],
    [1,-1], [1,0],  [1,1]
  ];
  var positions = [];
  var adjacency = [];
  var i;

  for (i = 0; i < drawn.length; i++) {
    var pos = gtCoordinate(i);
    positions.push({
      index: i,
      slot: i + 1,
      row: pos.row,
      col: pos.col,
      house: CARDS[i],
      card: drawn[i]
    });
  }

  for (i = 0; i < positions.length; i++) {
    var p = positions[i];
    var near = [];
    directions.forEach(function(d) {
      var ni = gtIndexAt(p.row + d[0], p.col + d[1]);
      if (ni >= 0 && ni < drawn.length) near.push(positions[ni]);
    });
    adjacency.push({ position: p, neighbors: near });
  }

  // 只列「最大完整直線」。引用其中任一段時，端點間所有牌仍必須完整列入。
  var vectors = [
    { code:'H', dr:0, dc:1, label:'橫列' },
    { code:'V', dr:1, dc:0, label:'直欄' },
    { code:'D', dr:1, dc:1, label:'左上到右下對角線' },
    { code:'A', dr:1, dc:-1, label:'右上到左下對角線' }
  ];
  var lines = [];
  var counters = { H:0, V:0, D:0, A:0 };

  positions.forEach(function(p) {
    vectors.forEach(function(v) {
      // 有前一格代表不是這條最大線的起點。
      if (gtIndexAt(p.row - v.dr, p.col - v.dc) >= 0) return;
      var seq = [];
      var rr = p.row, cc = p.col;
      while (true) {
        var idx = gtIndexAt(rr, cc);
        if (idx < 0 || idx >= drawn.length) break;
        seq.push(positions[idx]);
        rr += v.dr; cc += v.dc;
      }
      if (seq.length >= 2) {
        counters[v.code] += 1;
        lines.push({ id:v.code + counters[v.code], type:v.label, positions:seq });
      }
    });
  });

  return { spreadId:'grand', positions:positions, adjacency:adjacency, lines:lines, focusSlots:[], slotWeights:{}, readingMode:'grand_tableau' };
}

function _lnGeometryAdjacency(positions, pairSlots) {
  var bySlot={}, map={};
  positions.forEach(function(p){bySlot[p.slot]=p;map[p.slot]=[];});
  (pairSlots||[]).forEach(function(pair){
    var a=bySlot[pair[0]],b=bySlot[pair[1]];if(!a||!b)return;
    map[a.slot].push(b);map[b.slot].push(a);
  });
  return positions.map(function(p){return {position:p,neighbors:map[p.slot]||[]};});
}

function _lnGeometryLines(positions, lineDefs) {
  var bySlot={};positions.forEach(function(p){bySlot[p.slot]=p;});
  return (lineDefs||[]).map(function(def,idx){return {id:def.id||('L'+(idx+1)),type:def.type||'連續線',priority:def.priority||1,positions:def.slots.map(function(slot){return bySlot[slot];}).filter(Boolean)};}).filter(function(line){return line.positions.length>=3;});
}

function buildSpreadGeometry(drawn, spreadId) {
  var id=spreadId||((drawn||[]).length===36?'grand':(drawn||[]).length===9?'nine':(drawn||[]).length===5?'five':'three');
  if(id==='grand')return buildGrandGeometry(drawn||[]);
  var cards=drawn||[],positions=[],weights={},focusSlots=[],pairs=[],lineDefs=[],roles=[];
  if(id==='three'){
    weights={1:0.86,2:1,3:0.86};focusSlots=[2];roles=['左側條件','核心','右側影響'];pairs=[[1,2],[2,3]];
    lineDefs=[{id:'H1',type:'完整三張主句',slots:[1,2,3],priority:1}];
  }else if(id==='five'){
    weights={1:0.68,2:0.88,3:1,4:0.88,5:0.68};focusSlots=[3];roles=['左外背景','左近條件','核心','右近影響','右外背景'];pairs=[[1,2],[2,3],[3,4],[4,5]];
    lineDefs=[{id:'H1',type:'五張主線',slots:[1,2,3,4,5],priority:1}];
  }else{
    id='nine';weights={1:0.66,2:0.84,3:0.66,4:0.84,5:1,6:0.84,7:0.66,8:0.84,9:0.66};focusSlots=[5];
    roles=['左上外圍','上方條件','右上外圍','左側條件','核心','右側影響','左下外圍','下方根基','右下外圍'];
    for(var a=1;a<=9;a++)for(var b=a+1;b<=9;b++){
      var ar=Math.floor((a-1)/3),ac=(a-1)%3,br=Math.floor((b-1)/3),bc=(b-1)%3;
      if(Math.max(Math.abs(ar-br),Math.abs(ac-bc))===1)pairs.push([a,b]);
    }
    lineDefs=[
      {id:'R1',type:'上排',slots:[1,2,3],priority:0.78},{id:'R2',type:'中心橫列',slots:[4,5,6],priority:1},{id:'R3',type:'下排',slots:[7,8,9],priority:0.78},
      {id:'C1',type:'左欄',slots:[1,4,7],priority:0.78},{id:'C2',type:'中心直欄',slots:[2,5,8],priority:1},{id:'C3',type:'右欄',slots:[3,6,9],priority:0.78},
      {id:'D1',type:'左上右下對角線',slots:[1,5,9],priority:0.88},{id:'D2',type:'右上左下對角線',slots:[3,5,7],priority:0.88}
    ];
  }
  cards.forEach(function(card,index){
    var slot=index+1,row=id==='nine'?Math.floor(index/3)+1:1,col=id==='nine'?(index%3)+1:slot;
    positions.push({index:index,slot:slot,row:row,col:col,house:null,card:card,role:roles[index]||('第'+slot+'張'),positionWeight:weights[slot]||0.7});
  });
  return {spreadId:id,positions:positions,adjacency:_lnGeometryAdjacency(positions,pairs),lines:_lnGeometryLines(positions,lineDefs),focusSlots:focusSlots,slotWeights:weights,readingMode:id+'_spread'};
}

function _lnSpreadPairPriority(geometry,a,b){
  var wa=(geometry.slotWeights&&geometry.slotWeights[a.slot])||a.positionWeight||0.7,wb=(geometry.slotWeights&&geometry.slotWeights[b.slot])||b.positionWeight||0.7;
  var focus=(geometry.focusSlots||[]);return Math.min(1.15,(wa+wb)/2+(focus.indexOf(a.slot)>-1||focus.indexOf(b.slot)>-1?0.12:0));
}
function _lnSpreadWindowPriority(geometry,win,line){
  var total=win.reduce(function(sum,p){return sum+((geometry.slotWeights&&geometry.slotWeights[p.slot])||p.positionWeight||0.7);},0)/win.length;
  var focus=(geometry.focusSlots||[]),hits=win.filter(function(p){return focus.indexOf(p.slot)>-1;}).length;
  return Math.min(1.15,total+(hits?0.12:0))*((line&&line.priority)||1);
}

var HARD_NEGATIVE_IDS = [6,8,10,11,21,23,36];
var ANALYSIS_DIMENSIONS = {
  attraction:['桃花機會本身','人物焦點間的吸引結構','有利條件','阻礙與中止因素','可能的現實表現','人物是否已出現的邊界'],
  sexual:['性／感官焦點是否直接成立','一般桃花與肉體成分的區分','支持肉體吸引的核心結構','阻礙與界線','事件是否落實的邊界','未被證明的身分與時間'],
  relationship:['感情強度層級','互動與吸引','承諾與穩定','公開／私人脈絡','阻礙與複雜因素','正反矛盾','未被牌面證明的部分'],
  business:['商業核心動力','曝光與顧客脈絡','收入與持續性','策略與執行','阻礙與耗損','可利用的有利條件','未知邊界'],
  career:['工作連結與適配','制度與權責','穩定與成長','變動或升遷條件','人事與環境阻力','正反矛盾','未被證明的職涯事件'],
  finance:['資源流動','收入／支出結構','穩定性','風險與耗損','外部影響','可利用條件','未知邊界'],
  health:['醫學原因與象徵狀態的界線','反覆或停滯模式','壓力與耗損意象','有利與緩衝因素','生活脈絡的象徵連結','正反矛盾','牌面不能證明的病因／診斷／治療'],
  travel:['移動動力','目的與環境','阻礙與延遲','外部消息','穩定性','矛盾','未知邊界'],
  communication:['溝通意願','訊息品質','公開／私下脈絡','阻礙與誤解','反覆模式','有利條件','未知邊界'],
  guidance:['目前迷茫的核心','干擾判斷的因素','可採用的選擇原則','有利支點','不能由牌面指定的部分'],
  comparison:['選項A的有利與適配','選項A的阻礙與代價','選項B的有利與適配','選項B的阻礙與代價','共同決策核心與取捨','兩者差距與未知邊界'],
  general:['核心動力','有利因素','阻礙風險','重複模式','正反矛盾','可能的實際表現','牌面未證明的部分']
};

var CLAIM_POLICIES = {
  comparison_suitability:{
    meaning:'比較題只能依抽牌前預先指定的左右對稱位置判斷兩個選項；選項名稱只是標籤，不是同名 Lenormand 牌。',
    forbidden:'不得因選項名稱含太陽、魚、心、熊等字而自動套用同名牌義；不得只分析其中一邊後推斷另一邊。'
  },
  attraction_opportunity:{
    meaning:'只判斷桃花、被注意或吸引機會，不等於已出現真人、雙方互有意圖、交往或性事件。',
    forbidden:'不得把方法占位淑女寫成已經存在的女性；不得把單方結構寫成互相注意。'
  },
  sexual_component:{
    meaning:'只判斷同一桃花／人物／關係焦點是否帶有肉體或感官成分。百合是本站可選的現代感官提示；蛇只作誘惑、複雜與第三方風險修飾，不能單獨建立性成分。',
    forbidden:'問卜者＋蛇、淑女＋太陽、一般桃花、心、戒指、魚或鞭子都不能單獨證明該桃花有性吸引。'
  },
  sexual_event:{
    meaning:'判斷是否有獨立證據把感官焦點、同一人物／關係焦點與接觸落實連在一起；吸引與性成分不等於事件。',
    forbidden:'只在不同位置各自看到性提示與關係牌，不得拼接成會上床、會發生關係或已發生。'
  },
  outcome_tendency:{
    meaning:'判斷使用者指定期間或情境的整體順利程度；正向與負向結構必須同時整合，不得把一張好牌或壞牌當成全部。',
    forbidden:'不得自行補出未抽到的人物、事件、日期或保證一切平安。'
  },
  risk_guidance:{
    meaning:'只指出核准證據所呈現的主要注意事項；可轉寫工作、溝通、關係、資源、阻礙、結束等牌義樣貌，但不得發明具體事件。',
    forbidden:'不得把風險寫成必然災難，也不得將沒有牌面證據的事故、疾病、金額或人物硬加進來。'
  },
  action_effectiveness:{
    meaning:'只判斷題目中的具體行動是否有助於帶動使用者指定結果；不得擴大成整個副業長期成敗。',
    forbidden:'不得把行動成效直接等同長期成功，也不得自行提出廣告金額、折扣幅度、庫存、價格、毛利或期限。'
  },
  decision_suitability:{
    meaning:'只判斷題目中的做法整體是否適合照原樣執行；正反並存時必須明說取捨，不能退回一問三不知。',
    forbidden:'不得把單一好牌寫成完全正確，也不得把單一壞牌寫成必然失敗。'
  },
  business_success:{
    meaning:'只判斷副業是否具備可持續成功條件；有生意／收入連結不等於已成功，也不等於足以清償全部負債。',
    forbidden:'不得把魚、狐狸或錨單獨寫成成功；不得自行補入毛利、庫存、廣告、折扣、客單價或特定經營策略。'
  },
  debt_clearance:{
    meaning:'負債完全清償是獨立結果，需要資源改善與債務壓力終止／切減兩類核心支持；收入增加不等於負債歸零。',
    forbidden:'不得把副業成功、魚、熊或單次切割直接等同清償全部負債。'
  },
  positive_net_worth:{
    meaning:'正資產是資產大於負債的獨立結果；清債、收入或成功任一項都不能單獨代替淨資產轉正。',
    forbidden:'不得宣稱具體金額、資產負債比或已轉正，除非 claim_plan 明確批准。'
  },
  finance:{
    meaning:'只描述資源流動、穩定與耗損；不把財務連結直接升級成財務自由、清債或正資產。',
    forbidden:'不得自行提供牌面未支持的金額、期限、還款比例或投資建議。'
  },
  life_guidance:{
    meaning:'只提供牌面核准的象徵性方向、干擾與選擇原則；建議是篩選框架，不是唯一人生使命、職業指派或事件預告。',
    forbidden:'不得自行指定職業、離職、分手、搬家、投資、期限、先後流程或保證某條路成功；不得把 selected_context 單獨當成新主張。'
  },
  timing:{
    meaning:'本站未啟用時間／應期規則，D／S／C、牌號、座標、房屋與左右方向都不能推出日期。',
    forbidden:'不得猜年、月、週、天或先後階段。'
  },
  career_fit:{
    meaning:'判斷此工作與問卜者是否可持續匹配；目前仍在職、穩定或與機構相連不等於最適合。',
    forbidden:'不得只因狐狸、錨、塔或鑰匙出現就斷成適合。'
  },
  career_promotion:{
    meaning:'判斷是否有職位、權責或層級向上變動；被重視與在組織內有位置不等於升遷。',
    forbidden:'只有塔、錨、狐狸或鑰匙，不得直接斷成升遷。'
  },
  unsupported_age:{
    meaning:'沒有 age_rules，數字年齡與區間不可驗證。',
    forbidden:'不得引用任何牌面側推歲數、年齡層或年齡差。'
  },
  health_medical_cause:{
    meaning:'醫學病因、診斷、治療與藥效需要臨床證據，牌面不能判定。',
    forbidden:'不得把壓力、飲食、荷爾蒙、器官或任何牌義寫成已證實病因。'
  }
};


// ════════════════════════════════════
// 共用分層公式 v2：問題語義 → 焦點 → 牌對語法 → 三張短句 → 正反整合 → 五級結論
// 歷史資料只支持36張、4×8+4與由人物牌附近敘事；以下為本站公開、可測試的現代工程公式。
// 重要：不再為每個自然語句建立一個 gate；題目只映射到少數通用語義軸，所有軸共用同一評估器。
// ════════════════════════════════════
var CANONICAL_READING_FORMULA = {
  id:'site_lenormand_multispread_formula_v3',
  evidenceUnits:{direct_pair:{weight:3,role:'primary'},three_card_sentence:{weight:2,role:'secondary'}},
  syntaxRule:'direct_pair_is_local_phrase_three_card_center_modifies_edges',
  aggregationRule:'select_top_unique_support_and_risk_with_overlap_discount',
  conclusionScale:['明顯支持','較支持','正反並存','較不支持','明顯不支持'],
  ledgerRule:'one_physical_structure_one_entry_reuse_never_adds_weight',
  attributionRule:'person_specific_claims_require_the_person_inside_the_same_selected_structure',
  hypotheticalRule:'hypothetical_significators_never_prove_a_real_person_already_exists',
  unsupportedRule:'numeric_timing_age_and_medical_diagnosis_require_external_enabled_rules'
};

var FORMULA_GROUPS = {
  romanceCore:[9,24,32], opportunity:[1,2,9,12,16,17,20,31,33], sensual:[30], temptation:[7],
  relation:[18,24,25,32], contact:[1,12,17,20,27], stability:[4,5,18,25,30,35],
  success:[2,5,9,16,17,20,31,32,33], business:[14,34,35], market:[1,9,12,16,20,27,31,32],
  offer:[2,9,13,25,27], action:[1,10,13,14,17,22,27], career:[14,19,35], authority:[15,19,27,31,32,33],
  change:[1,3,8,10,17,22], resources:[15,34], resourceGrowth:[5,31,33,35], debtPressure:[15,23,34,36],
  endingCut:[8,10], guidance:[16,22,26,33], values:[9,18,24,32], health:[5], travel:[3,17],
  communication:[1,12,27], positive:[1,2,4,5,9,16,17,18,20,24,25,30,31,32,33,35],
  negative:HARD_NEGATIVE_IDS.slice()
};

function _lnGroup(values, roles) {
  var out=[];
  (Array.isArray(values)?values:[values]).forEach(function(v){
    if(v==='$Q'){ if(roles.querent)out.push(roles.querent); else out=out.concat([28,29]); }
    else if(v==='$C'){ if(roles.counterpart)out.push(roles.counterpart); else out=out.concat([28,29]); }
    else if(v==='$P')out=out.concat(uniqueNumbers([roles.querent,roles.counterpart,28,29]));
    else if(typeof v==='string'&&FORMULA_GROUPS[v])out=out.concat(FORMULA_GROUPS[v]);
    else if(typeof v==='number')out.push(v);
  });
  return uniqueNumbers(out);
}

var UNIVERSAL_READING_PROFILES = {
  action_effectiveness:{domain:'action',anchors:['$Q','action','business','market','offer'],support:['success','opportunity','market','offer','resources','stability'],label:'這項方案帶動目標結果'},
  decision_suitability:{domain:'decision',anchors:['$Q','action','guidance'],support:['success','stability','guidance','opportunity'],label:'這項做法的適合度'},
  outcome_tendency:{domain:'general',anchors:['$Q','action','guidance'],support:['positive','stability','success','opportunity'],label:'指定期間的整體順利程度'},
  risk_guidance:{domain:'general',anchors:['$Q','action','guidance'],support:['guidance','stability','opportunity'],label:'需要留意的主要風險'},
  business_success:{domain:'business',anchors:['$Q','business'],support:['success','stability','market','resources'],label:'副業持續成功條件'},
  debt_clearance:{domain:'finance',anchors:['$Q','resources','debtPressure'],support:['resourceGrowth','endingCut','stability'],label:'負債完全清償條件'},
  positive_net_worth:{domain:'finance',anchors:['$Q','resources','debtPressure'],support:['resourceGrowth','stability','success'],label:'正資產形成條件'},
  finance:{domain:'finance',anchors:['$Q','resources'],support:['resourceGrowth','stability','success'],label:'財務改善與穩定'},
  career_fit:{domain:'career',anchors:['$Q','career'],support:['stability','success','guidance'],label:'工作適配性'},
  career_promotion:{domain:'career',anchors:['$Q','career','authority'],support:['change','authority','success'],label:'升遷條件'},
  career_change:{domain:'career',anchors:['$Q','career','change'],support:['change','success','guidance'],label:'工作變動條件'},
  career_general:{domain:'career',anchors:['$Q','career'],support:['stability','success','guidance'],label:'工作整體結構'},
  attraction_opportunity:{domain:'relationship',anchors:['$Q','romanceCore','relation'],support:['romanceCore','opportunity','relation'],label:'桃花或吸引機會'},
  sexual_component:{domain:'relationship',anchors:['$Q','$C','sensual','romanceCore','relation'],support:['sensual','relation','romanceCore'],label:'肉體或感官成分',requiresSensual:true},
  sexual_event:{domain:'relationship',anchors:['$Q','$C','sensual','romanceCore','relation','contact'],support:['sensual','relation','contact'],label:'肉體事件落實條件',requiresSensual:true,requiresCounterpart:true},
  relationship_intent:{domain:'relationship',anchors:['$C','relation','communication'],support:['relation','communication','romanceCore'],label:'特定對象的互動／感情傾向',requiresIdentifiedCounterpart:true,requiresCounterpart:true},
  relationship_future:{domain:'relationship',anchors:['$Q','$C','relation','romanceCore'],support:['relation','contact','stability','success'],label:'形成關係的條件'},
  relationship_longevity:{domain:'relationship',anchors:['$Q','$C','relation','stability'],support:['relation','stability','success'],label:'長期穩定條件'},
  multi_partner_commitment:{domain:'relationship',anchors:['$Q','relation',7,20,22],support:['relation',7,20,22],label:'多人／非排他關係主題'},
  health_symbolic_context:{domain:'health',anchors:['$Q','health'],support:['health','stability','success'],label:'健康議題的象徵性狀態'},
  travel:{domain:'travel',anchors:['$Q','travel'],support:['travel','opportunity','success'],label:'旅行或移動條件'},
  communication:{domain:'communication',anchors:['$Q','$C','communication'],support:['communication','opportunity','success'],label:'溝通或消息條件'},
  life_guidance:{domain:'guidance',anchors:['$Q','guidance','values'],support:['guidance','values','stability','success'],label:'可依循的人生方向'},
  general:{domain:'general',anchors:['$Q','guidance','values','action'],support:['positive','stability','success','opportunity'],label:'本題整體傾向'}
};
// 保留舊公開名稱供外部測試／相容呼叫；內容已不是逐題 gate。
var PROPOSITION_FORMULAS = UNIVERSAL_READING_PROFILES;

var CARD_BASE_TONE = {
  1:0.5,2:1.5,3:0,4:1,5:1,6:-1.5,7:-1,8:-2,9:1.5,10:-2,11:-1.5,12:0,
  13:0.5,14:0,15:0.5,16:1.5,17:1,18:1,19:0,20:1,21:-2,22:0,23:-2,
  24:1.5,25:1,26:0,27:0.5,28:0,29:0,30:0.5,31:2,32:1,33:2,34:0.5,35:1,36:-2
};

function _lnFormulaForType(type){ return UNIVERSAL_READING_PROFILES[type]||UNIVERSAL_READING_PROFILES.general; }
function _lnStructureUid(st){ return st.evidenceUid || physicalStructureKey(st); }
function _lnClusterStructure(cluster){ return cluster&&cluster.structures&&cluster.structures[0]; }
function _lnClamp(n,min,max){return Math.max(min,Math.min(max,n));}
function _lnProfileIds(profile,roles,key){return _lnGroup((profile&&profile[key])||[],roles);}
function _lnCardTone(id,profile,roles,type){
  var base=typeof CARD_BASE_TONE[id]==='number'?CARD_BASE_TONE[id]:0;
  var anchors=_lnProfileIds(profile,roles,'anchors'),supports=_lnProfileIds(profile,roles,'support');
  if(anchors.indexOf(id)>-1)base=0;
  if(supports.indexOf(id)>-1&&anchors.indexOf(id)===-1)base+=0.65;
  if(type==='sexual_component'||type==='sexual_event'){
    if(id===7)base=Math.min(base,0); // 蛇只作誘惑／複雜修飾，不建立正向性成分。
    if(id===30)base=Math.max(base,1.5);
  }
  if(profile.domain==='business'&&[14,34,35,20,31,33].indexOf(id)>-1&&anchors.indexOf(id)===-1)base+=0.35;
  if(profile.domain==='finance'&&[15,34,35,31,33].indexOf(id)>-1&&anchors.indexOf(id)===-1)base+=0.35;
  return _lnClamp(base,-2.5,2.5);
}
function _lnStructureRelevance(st,profile,roles){
  var ids=st.cardIds||uniqueNumbers((st.positions||[]).map(function(p){return p.card.id;}));
  var anchors=_lnProfileIds(profile,roles,'anchors'),supports=_lnProfileIds(profile,roles,'support');
  var relevant=uniqueNumbers(anchors.concat(supports).concat(HARD_NEGATIVE_IDS));
  var anchorHits=ids.filter(function(id){return anchors.indexOf(id)>-1;}).length;
  var relevantHits=ids.filter(function(id){return relevant.indexOf(id)>-1;}).length;
  // 三／五／九張皆是針對同一問題抽出的封閉牌陣，位置本身就是相關性來源；
  // 大牌陣才需要由人物牌／主題牌過濾，避免把36張全部當成同等證據。
  if(st.spreadScoped){
    var positional=typeof st.positionWeight==='number'?st.positionWeight:0.72;
    if(anchorHits)positional=Math.max(positional,1);
    else if(relevantHits)positional=Math.max(positional,0.78);
    return _lnClamp(positional,0.5,1.15);
  }
  if(st.kind==='adjacency')return anchorHits?1:(relevantHits===ids.length&&relevantHits>=2?0.75:0);
  return anchorHits?0.85:(relevantHits>=2?0.6:0);
}
function _lnStructureScore(st,profile,roles,type){
  var rel=_lnStructureRelevance(st,profile,roles);if(!rel)return null;
  var ps=st.positions||[],tones=ps.map(function(p){return _lnCardTone(p.card.id,profile,roles,type);});
  var anchors=_lnProfileIds(profile,roles,'anchors'),score=0;
  if(st.kind==='adjacency'){
    var modifiers=[];ps.forEach(function(p,i){if(anchors.indexOf(p.card.id)===-1)modifiers.push(tones[i]);});
    if(!modifiers.length)modifiers=tones.slice();
    score=(modifiers.reduce(function(a,b){return a+b;},0)/modifiers.length)*3*rel;
  }else{
    // 三張牌採 Lenormand 短句：中牌是主要修飾，左右牌提供主題與結果背景。
    score=(tones[1]*1.5+(tones[0]+tones[2])*0.5)*rel;
  }
  var ids=ps.map(function(p){return p.card.id;});
  if(profile.requiresSensual&&ids.indexOf(30)===-1&&score>0)score=0;
  if(profile.requiresCounterpart&&roles.counterpart&&ids.indexOf(roles.counterpart)===-1&&score>0)score*=0.35;
  return {score:_lnClamp(score,-6,6),relevance:rel,structure:st};
}
function _lnSlots(st){return (st.positions||[]).map(function(p){return p.slot;});}
function _lnSubsumes(a,b){
  var A=_lnSlots(a),B=_lnSlots(b);return B.every(function(x){return A.indexOf(x)>-1;})||A.every(function(x){return B.indexOf(x)>-1;});
}
function _lnSelectLayeredEvidence(packet,profile,roles,type){
  var candidates=(packet.clusters||[]).map(function(c){var st=_lnClusterStructure(c),ev=_lnStructureScore(st,profile,roles,type);if(!ev)return null;ev.cluster=c;ev.uid=_lnStructureUid(st);ev.kind=st.kind;ev.noveltyFactor=1;return ev;}).filter(Boolean);
  candidates.sort(function(a,b){return Math.abs(b.score)-Math.abs(a.score)||(a.kind==='adjacency'?-1:1)||(String(a.uid).localeCompare(String(b.uid),undefined,{numeric:true}));});
  function edgeKeys(st){var slots=_lnSlots(st),out=[];for(var i=0;i<slots.length-1;i++)out.push([slots[i],slots[i+1]].sort(function(a,b){return a-b;}).join('-'));return out;}
  function pick(sign,max){
    var out=[],exact={};
    function eligible(x){
      if(sign>0&&x.score<=0.35)return false;if(sign<0&&x.score>=-0.35)return false;
      if(exact[x.kind+':'+_lnSlots(x.structure).join('-')])return false;
      if(x.kind==='context_window'){
        var edges=edgeKeys(x.structure),covered=0;
        out.filter(function(y){return y.kind==='adjacency';}).forEach(function(y){var k=edgeKeys(y.structure)[0];if(edges.indexOf(k)>-1)covered++;});
        x.noveltyFactor=covered>=2?0.45:covered===1?0.7:1;
      }
      return true;
    }
    candidates.filter(function(x){return x.kind==='adjacency';}).forEach(function(x){if(out.length<Math.min(2,max)&&eligible(x)){out.push(x);exact[x.kind+':'+_lnSlots(x.structure).join('-')]=true;}});
    candidates.filter(function(x){return x.kind==='context_window';}).forEach(function(x){if(out.length<max&&eligible(x)&&!out.some(function(y){return y.kind==='context_window';})){out.push(x);exact[x.kind+':'+_lnSlots(x.structure).join('-')]=true;}});
    candidates.forEach(function(x){if(out.length<max&&eligible(x)){out.push(x);exact[x.kind+':'+_lnSlots(x.structure).join('-')]=true;}});
    return out;
  }
  var support=pick(1,3),risk=pick(-1,3),neutral=candidates.filter(function(x){return Math.abs(x.score)<=0.35;}).slice(0,2);
  function weighted(list){return list.reduce(function(sum,x,idx){return sum+x.score*(x.noveltyFactor||1)*(idx<2?1:0.5);},0);}
  var supportTotal=weighted(support),riskTotal=weighted(risk),net=supportTotal+riskTotal,count=support.length+risk.length;
  var band='mixed';
  if(!count)band=neutral.length?'mixed':'insufficient';
  else if(supportTotal>=6&&Math.abs(riskTotal)<=2.5&&support.length>=2)band='strong_support';
  else if(riskTotal<=-6&&supportTotal<=2.5&&risk.length>=2)band='strong_against';
  else if(net>=2.5)band='lean_support';
  else if(net<=-2.5)band='lean_against';
  else band='mixed';
  if(count===1&&band==='strong_support')band='lean_support';
  if(count===1&&band==='strong_against')band='lean_against';
  return {support:support,risk:risk,neutral:neutral,supportTotal:supportTotal,riskTotal:riskTotal,net:net,band:band,candidates:candidates};
}
function _lnBandCap(band){
  return {strong_support:'明顯支持',lean_support:'較支持',mixed:'正反並存',lean_against:'較不支持',strong_against:'明顯不支持',insufficient:'證據有限'}[band]||'正反並存';
}
function _lnBandText(type,profile,band){
  var label=profile.label||'本題';
  var map={
    strong_support:label+'具備明顯支持條件。',
    lean_support:label+'較有支持，但仍不是保證。',
    mixed:label+'呈現正反並存，不能只看單一好牌或壞牌。',
    lean_against:label+'目前較不受支持，阻力高於助力。',
    strong_against:label+'目前明顯不受支持，不宜把它解讀成順利可成。',
    insufficient:label+'的相關結構有限，只能保留判斷。'
  };
  if(type==='action_effectiveness'){
    map.strong_support='這項方案明顯具備帶動目標結果的條件。';map.lean_support='這項方案較有機會帶動目標結果，但成效仍受限制。';map.mixed='這項方案有帶動條件，也有明顯阻力，較像可測試但不能保證穩定成效。';map.lean_against='目前較不支持照原方案期待明顯成效，風險高於助力。';map.strong_against='目前明顯不支持照原方案期待帶起成效。';
  }
  if(type==='decision_suitability'){
    map.strong_support='這項做法整體上明顯適合執行。';map.lean_support='這項做法較適合執行，但仍需正視牌面限制。';map.mixed='這項做法不是全對或全錯，支持與代價同時存在。';map.lean_against='這項做法目前較不合適照原樣執行。';map.strong_against='這項做法目前明顯不適合照原樣執行。';
  }
  if(type==='outcome_tendency'){
    map.strong_support='指定期間整體上明顯較順利。';map.lean_support='指定期間整體較有順利傾向，但仍有需要留意之處。';map.mixed='指定期間順逆並存，不宜概括成一切順利。';map.lean_against='指定期間整體較不順利，阻力高於助力。';map.strong_against='指定期間整體明顯不順，應以處理阻力與收尾為主。';map.insufficient='本次牌面與順利程度的關聯有限，只能保留判斷。';
  }
  if(type==='risk_guidance'){
    map.strong_support='本次未見強烈風險主導，但仍需依核准牌義保持基本留意。';map.lean_support='需要注意的風險較輕，仍可留意局部干擾。';map.mixed='需要注意的因素與緩衝條件同時存在。';map.lean_against='本次有較明顯需要注意的阻力、負擔或中止因素。';map.strong_against='本次注意事項明顯，負擔、阻礙或結束性因素居主導。';map.insufficient='本次缺少足以列出具體注意事項的相關結構。';
  }
  return map[band]||map.mixed;
}
function _lnClusterIds(evs){return (evs||[]).map(function(x){return x.cluster.id;});}
function compileLayeredClaimPlan(packet,declaredGender){
  var type=primaryDecisionType(packet.question.types||[packet.question.type]),profile=_lnFormulaForType(type),roles=getPersonRoleIds(declaredGender);
  var plan={status:'layered_evaluate',formulaOutcome:'mixed',certaintyCap:'正反並存',requiredConclusion:'依共用分層公式整合牌對、三張短句與正反證據；模型不得自行增加主張。',approvedClaims:[],forbiddenClaims:[],claimEvidence:[],evaluation:null};
  if(profile.requiresIdentifiedCounterpart&&personStatusForScope(packet.question.targetScope)!=='identified'){
    plan.status=type+'_requires_identified_counterpart';plan.formulaOutcome='insufficient';plan.certaintyCap='不足以判定特定人物內心';
    addApprovedClaim(plan,'缺少已識別對象，不能判定特定人物的內心或意圖。',[]);addApprovedClaim(plan,'方法占位人物不等於真人已出現。',[]);return plan;
  }
  var ev=_lnSelectLayeredEvidence(packet,profile,roles,type);plan.evaluation=ev;plan.formulaOutcome=ev.band;plan.status=type+'_'+ev.band;plan.certaintyCap=_lnBandCap(ev.band);
  if(type==='risk_guidance'){
    var riskIds=_lnClusterIds(ev.risk).slice(0,2),supportIds=_lnClusterIds(ev.support).slice(0,2);if(!supportIds.length&&ev.neutral[0])supportIds=[ev.neutral[0].cluster.id];
    if(riskIds.length){
      var riskBand=ev.riskTotal<=-6?'strong_against':'lean_against';plan.formulaOutcome=riskBand;plan.status=type+'_'+riskBand;plan.certaintyCap=riskBand==='strong_against'?'明顯需要注意':'較需要注意';
      addApprovedClaim(plan,_lnBandText(type,profile,riskBand),riskIds);
      if(supportIds.length)addApprovedClaim(plan,'仍有可利用的緩衝或支持條件，但不能抵銷主要注意事項。',supportIds);
    }else{
      plan.formulaOutcome=ev.support.length?'lean_support':'insufficient';plan.status=type+'_'+plan.formulaOutcome;plan.certaintyCap=ev.support.length?'注意風險較低':'注意事項證據有限';
      addApprovedClaim(plan,_lnBandText(type,profile,plan.formulaOutcome),supportIds);
    }
    addApprovedClaim(plan,'注意事項只能依核准牌義描述，不能擴寫成必然事故、疾病、金額、人物或具體事件。',[]);
    plan.forbiddenClaims=CLAIM_POLICIES[type]?[CLAIM_POLICIES[type].forbidden]:[];return plan;
  }
  var main=[];if(ev.support[0])main.push(ev.support[0].cluster.id);if(ev.risk[0])main.push(ev.risk[0].cluster.id);if(!main.length&&ev.neutral[0])main.push(ev.neutral[0].cluster.id);
  addApprovedClaim(plan,_lnBandText(type,profile,ev.band),main);
  var used={};main.forEach(function(id){used[id]=true;});
  var pos=_lnClusterIds(ev.support).filter(function(id){return !used[id];}).slice(0,2);if(pos.length)addApprovedClaim(plan,'有利結構提供推進、可見度、穩定或成果面的支持，但只能在本題範圍內解讀。',pos);
  var neg=_lnClusterIds(ev.risk).filter(function(id){return !used[id];}).slice(0,2);if(neg.length)addApprovedClaim(plan,'阻礙、不明、反覆、切斷、損耗或負擔會削弱結果，不能美化成必經後必成。',neg);
  if(type==='sexual_component')addApprovedClaim(plan,'肉體／感官成分不等於實際事件；蛇、魚與鞭子不能單獨建立性結論。',[]);
  else if(type==='sexual_event')addApprovedClaim(plan,'即使有感官與接觸主題，也不能寫成事件已發生、必然發生、具體次數或日期。',[]);
  else if(type==='business_success'||type==='action_effectiveness'||type==='decision_suitability')addApprovedClaim(plan,'牌面只能提供方向與風險，不能自行生成廣告金額、折扣幅度、庫存、價格、毛利或期限。',[]);
  else if(type==='debt_clearance'||type==='positive_net_worth'||type==='finance')addApprovedClaim(plan,'收入、成功、清債與正資產是不同結果，不能互相代替，也不能推具體金額與期限。',[]);
  else if(type==='life_guidance')addApprovedClaim(plan,'牌面只能提供篩選方向，不能指定唯一人生使命、職業或保證結果。',[]);
  if((packet.question.targetScope==='hypothetical_noncurrent_counterpart'||packet.question.targetScope==='unknown_future_counterpart')&&questionTypeDomain(type)==='relationship')addApprovedClaim(plan,'假設性人物只表示此類互動可能，不證明真人已出現、已有內心或已採取行動。',[]);
  plan.forbiddenClaims=CLAIM_POLICIES[type]?[CLAIM_POLICIES[type].forbidden]:[];
  return plan;
}
// 舊公開函式名保留，實際已改用分層評估器。
function compileFormulaClaimPlan(packet,declaredGender){return compileLayeredClaimPlan(packet,declaredGender);}

function detectAgeQualifier(text) {
  var t = String(text || '');
  var numeral = '(?:\\d{1,2}|[零一二三四五六七八九十兩]{1,3})';
  var range = new RegExp(numeral + '\\s*(?:到|至|～|~|－|-)\\s*' + numeral + '\\s*歲');
  var approx = new RegExp(numeral + '\\s*歲\\s*(?:上下|左右|前後|附近)?');
  var m = t.match(range) || t.match(approx);
  if (m) return { kind:'numeric_age', raw:m[0].replace(/\\s+/g, ''), assessable:false };
  if (/比我(?:大|小)|年長|年輕|同齡|差幾歲|年紀|年齡|歲數|幾歲|多大/.test(t)) return { kind:'relative_or_unknown_age', raw:'年齡條件', assessable:false };
  return null;
}

function detectUserTimeScope(text) {
  var t = String(text || '');
  var m = t.match(/今天|明天|後天|本週|這週|下週|這個月|下個月|今年|明年|後年|本月|端午節|中秋節|春節|過年|雙十節|雙11|活動期間|未來\s*\d+\s*(?:天|週|月|年)內|\d+\s*(?:天|週|月|年)內|近期|接下來|什麼時候|何時|多久|幾時|哪一年|哪個月|幾月|時間點|應期|多快/);
  return m ? { source:'user_question', raw:m[0] } : null;
}

function inferTargetScope(text) {
  var t = String(text || '');
  if (/非現任|現任以外|不是現任|其他(?:女生|女人|男性|男生|對象)|外面(?:的)?桃花|婚外|額外桃花/.test(t)) return 'hypothetical_noncurrent_counterpart';
  if (/現任|另一半|伴侶|男友|女友|老公|老婆/.test(t)) return 'current_partner';
  if (/前任|前男友|前女友|前夫|前妻/.test(t)) return 'former_partner';
  if (/我們|他|她|對方|某人|這個人|那個人|凌/.test(t) || /喜歡我|愛我|對我有感覺|想(?:要)?(?:跟|與)?我/.test(t)) return 'specific_counterpart';
  if (/(?:未來|將來|以後|之後|往後|接下來|會有|會遇到|遇見|出現).{0,18}(?:人|對象|伴侶|男生|女生|男人|女人|交往|在一起|戀愛|桃花)/.test(t)) return 'unknown_future_counterpart';
  return 'unspecified';
}

function hasMedicalCauseIntent(text) {
  return /為什麼|為何|原因|病因|是不是.{0,8}(?:疾病|失調|發炎|感染)|哪個器官|怎麼造成|診斷|吃什麼藥|停藥|治療|手術|痊癒|惡化/.test(String(text || ''));
}

function inferQuestionDimensions(text) {
  var t = String(text || '').trim();
  var comparison = detectComparisonQuestion(t);
  if (comparison) return { types:['comparison_suitability'], targetScope:'option_comparison', qualifiers:[], timeScope:detectUserTimeScope(t), comparison:comparison };
  var types = [];
  var targetScope = inferTargetScope(t);
  var ageQualifier = detectAgeQualifier(t);
  var timeScope = detectUserTimeScope(t);
  var hasAttraction = /桃花|追求|吸引|艷遇|異性緣|有人喜歡|有人靠近/.test(t);
  var hasSexual = /肉體桃花|肉體吸引|性吸引|性愛|性關係|肉體關係|上床|約炮|一夜情|發生關係|睡過|睡了/.test(t);
  var asksSexualEvent = /肉體桃花|性關係|肉體關係|上床|約炮|一夜情|發生關係|睡過|睡了/.test(t);
  var hasRelationshipWords = /感情|戀愛|交往|在一起|伴侶|對象|復合|結婚|婚姻|喜歡|愛我|好感|心動|正緣|告白|一夫多妻|多人伴侶|多重伴侶/.test(t);
  var explicitFutureContext = /未來|將來|以後|之後|往後|接下來|會有|會遇到|遇見|出現|今年|明年|本月/.test(t);
  var formationQuestion = /(?:會不會|是否會|能否|能不能|有沒有機會|會).{0,12}(?:交往|在一起|復合|結婚|成為伴侶)/.test(t) && !/(?:會不會|是否會|會|是否)?想.{0,12}(?:交往|在一起|復合)/.test(t);

  if (/一夫多妻|多妻|多重伴侶|多人伴侶|開放式關係|非排他|同時交往|兩個老婆|多個老婆|多個伴侶/.test(t)) types.push('multi_partner_commitment');
  if (/正緣|命定|適合長久|走到最後|走一輩子|長久|穩定交往|穩定伴侶|結婚對象|婚姻能否長久|(?:這段|我們的|彼此的)?關係.{0,8}(?:穩定|長久)|(?:能否|會不會|是否會|會)?穩定嗎/.test(t)) types.push('relationship_longevity');
  if (hasAttraction) types.push('attraction_opportunity');
  if (hasSexual) types.push('sexual_component');
  if (asksSexualEvent) types.push('sexual_event');
  if (hasRelationshipWords && (explicitFutureContext || targetScope === 'unknown_future_counterpart' || formationQuestion)) types.push('relationship_future');
  if (/喜歡我|愛我|好感|心動|真心|想(?:要)?(?:跟|與)?我(?:交往|在一起|復合)|會告白|對我有感覺|她怎麼想|他怎麼想|對方怎麼想/.test(t) && targetScope !== 'unknown_future_counterpart' && targetScope !== 'hypothetical_noncurrent_counterpart') types.push('relationship_intent');

  var asksOverallSmooth = /一切順利|是否順利|會順利嗎|順不順利|整體順利|平安順遂|會不會順利/.test(t);
  var asksAttention = /需要注意什麼|要注意什麼|該注意什麼|有什麼要注意|注意事項|需要留意|要留意什麼|要小心什麼/.test(t);
  if (asksOverallSmooth) types.push('outcome_tendency');
  if (asksAttention) types.push('risk_guidance');

  var hasActionPlan = /廣告|折價|折扣|促銷|優惠|活動|方案|做法|策略|投入|採取|執行|嘗試|投放|行銷/.test(t);
  var asksActionResult = /帶起買氣|提升買氣|增加訂單|增加成交|提升業績|帶動業績|帶動銷售|有效|成效|有沒有用|能否帶動|是否能帶動|會不會帶動/.test(t);
  var asksSuitability = /是否正確|這樣(?:做)?對嗎|對不對|可不可行|是否可行|適不適合(?:執行|做)|值不值得(?:做|執行)|該不該(?:做|執行)/.test(t);
  if (hasActionPlan && asksActionResult) types.push('action_effectiveness');
  if (asksSuitability) types.push('decision_suitability');
  var asksLongBusinessOutcome = /副業.{0,16}(?:成功|做起來|做得起來|可持續|長期穩定)|(?:成功|做起來|做得起來).{0,16}(?:副業|創業|生意|賣場)|事業能否成功/.test(t);
  if (asksLongBusinessOutcome || (!hasActionPlan && /副業|創業|生意|賣場|訂單|客戶|營收|業績|直播帶貨|商業|能成功|做得起來|賺錢/.test(t))) types.push('business_success');
  var asksDebtClear = /負債.{0,8}(?:完全)?(?:清空|清掉|清償|歸零|還清)|(?:完全)?(?:清空|清掉|清償|還清).{0,8}(?:負債|債務)|債務.{0,8}(?:歸零|清償|還清)/.test(t);
  var asksPositiveNetWorth = /正資產|淨資產.{0,6}(?:轉正|為正|正數)|資產.{0,4}(?:大於|超過).{0,4}負債/.test(t);
  if (asksDebtClear) types.push('debt_clearance');
  if (asksPositiveNetWorth) types.push('positive_net_worth');
  if (!asksDebtClear && !asksPositiveNetWorth && /財運|收入|存款|負債|投資|股票|貸款|金錢|錢|資金|還債|資產/.test(t)) types.push('finance');
  if (/適不適合.{0,8}(?:工作|職場|正職)|適合.{0,8}(?:目前|現在|這份)?(?:的)?(?:工作|職場|正職)|(?:工作|職場|正職|這份工作).{0,8}(?:適合|合適)|天職|適合我做|適合做下去/.test(t)) types.push('career_fit');
  if (/升遷|升職|晉升|被提拔|升主管|職位.{0,5}(?:提升|上升)|加官|被重用/.test(t)) types.push('career_promotion');
  if (/轉職|離職|換工作|跳槽|錄取|面試|新工作|換.{0,4}職場/.test(t)) types.push('career_change');
  if (!types.some(function(x){ return /^career_/.test(x); }) && /工作|職場|正職|主管|同事|職涯|上班/.test(t)) types.push('career_general');

  if (/健康|身體|病|疾病|手術|恢復|康復|症狀|發炎|痘痘|長痘|皮膚|過敏|疼痛|不舒服/.test(t)) {
    if (hasMedicalCauseIntent(t)) { types.push('health_medical_cause'); types.push('health_symbolic_context'); }
    else types.push('health_symbolic_context');
  }
  if (/旅行|旅遊|出國|搬家|遷移|遠方|移居|出差/.test(t)) types.push('travel');
  if (/聯絡|訊息|回覆|聊天|溝通|傳訊|來找我|聯繫/.test(t)) types.push('communication');
  if (/什麼時候|何時|多久|幾時|哪一年|哪個月|幾月|時間點|應期|多快/.test(t)) types.push('timing');
  if (!types.length && /人生.{0,10}(?:迷茫|方向|目標|意義|建議)|迷茫|茫然|沒有方向|找不到方向|未來方向|人生建議|請給我建議|該怎麼走|下一步怎麼走/.test(t)) types.push('life_guidance');

  types = uniqueStrings(types);
  if (!types.length && ageQualifier) types = ['unsupported_age'];
  if (!types.length) types = ['general'];
  return { types:types, targetScope:targetScope, qualifiers:ageQualifier ? [ageQualifier] : [], timeScope:timeScope };
}

function primaryDecisionType(types) {
  var list = Array.isArray(types) ? types : [types];
  for (var i = 0; i < list.length; i++) if (list[i] !== 'timing' && list[i] !== 'unsupported_age' && list[i] !== 'general') return list[i];
  return list[0] || 'general';
}

function questionTypeDomain(type) {
  if (type === 'comparison_suitability') return 'comparison';
  if (type === 'attraction_opportunity' || type === 'sexual_component' || type === 'sexual_event' || /^relationship_|^multi_partner_/.test(type)) return 'relationship';
  if (/^business_|^career_|^finance$|^debt_clearance$|^positive_net_worth$|^action_effectiveness$|^decision_suitability$/.test(type)) return 'work_money';
  if (type === 'outcome_tendency' || type === 'risk_guidance') return 'general';
  if (/^health_/.test(type)) return 'health';
  if (type === 'travel') return 'travel';
  if (type === 'communication') return 'communication';
  if (type === 'life_guidance') return 'guidance';
  if (type === 'timing') return 'timing';
  if (type === 'unsupported_age') return 'age_only';
  return 'general';
}

function shouldSplitCommaClauses(left, right) {
  var a = inferQuestionDimensions(left), b = inferQuestionDimensions(right);
  var da = uniqueStrings(a.types.map(questionTypeDomain).filter(function(x){ return x !== 'timing' && x !== 'general'; }));
  var db = uniqueStrings(b.types.map(questionTypeDomain).filter(function(x){ return x !== 'timing' && x !== 'general'; }));
  if (!da.length || !db.length || da.indexOf('age_only') > -1 || db.indexOf('age_only') > -1) return false;
  return !da.some(function(x){ return db.indexOf(x) > -1; });
}

function propositionText(type, original, comparison) {
  if (type === 'comparison_suitability' && comparison) return '比較「'+comparison.options[0]+'」與「'+comparison.options[1]+'」何者更符合'+comparison.criterion;
  if (type === 'attraction_opportunity') return '是否有非現任桃花或明顯吸引機會';
  if (type === 'sexual_component') return '該桃花是否帶有明顯肉體或性吸引';
  if (type === 'sexual_event') return '是否足以判斷實際發生肉體關係';
  if (type === 'outcome_tendency') return '指定期間或情境的整體順利程度';
  if (type === 'risk_guidance') return '需要注意的主要風險與限制';
  if (type === 'action_effectiveness') return '這項行動是否能有效帶動題目中的目標結果';
  if (type === 'decision_suitability') return '這項做法整體上是否適合執行';
  if (type === 'business_success') return '副業是否具備可持續成功條件';
  if (type === 'debt_clearance') return '負債是否能完全清償歸零';
  if (type === 'positive_net_worth') return '是否能達到資產大於負債的正資產狀態';
  if (type === 'timing') return '上述結果的具體時間是否可判定';
  if (type === 'unsupported_age') return '數字年齡或年齡區間是否可判定';
  if (type === 'health_medical_cause') return '醫學病因是否能由牌面判定';
  if (type === 'health_symbolic_context') return '健康議題在牌面呈現的象徵性狀態';
  if (type === 'life_guidance') return '目前迷茫的核心、可依循的方向與建議邊界';
  return original;
}

function expandSegmentToQuestions(text, baseIndex) {
  var dims = inferQuestionDimensions(text);
  var ordered = dims.types.filter(function(t){ return t !== 'unsupported_age'; });
  var out = [];
  ordered.forEach(function(type, idx) {
    out.push({
      id:'q' + baseIndex + (ordered.length + (dims.qualifiers.length?1:0) > 1 ? String.fromCharCode(97 + idx) : ''),
      parentId:'q' + baseIndex,
      text:propositionText(type, text, dims.comparison), originalText:text, type:type, types:[type],
      targetScope:dims.targetScope, qualifiers:[], timeScope:(type==='timing'||dims.types.indexOf('timing')===-1)?dims.timeScope:null,
      comparison:dims.comparison || null, options:dims.comparison ? dims.comparison.options.slice() : []
    });
  });
  if (dims.qualifiers.length || dims.types.indexOf('unsupported_age') > -1) {
    out.push({
      id:'q' + baseIndex + (out.length ? String.fromCharCode(97 + out.length) : ''), parentId:'q' + baseIndex,
      text:propositionText('unsupported_age', text, dims.comparison), originalText:text,
      type:'unsupported_age', types:['unsupported_age'], targetScope:dims.targetScope,
      qualifiers:dims.qualifiers.length ? dims.qualifiers : [{kind:'relative_or_unknown_age',raw:'年齡條件',assessable:false}], timeScope:null
    });
  }
  if (!out.length) out.push({ id:'q' + baseIndex, parentId:'q' + baseIndex, text:text, originalText:text, type:'general', types:['general'], targetScope:dims.targetScope, qualifiers:[], timeScope:null });
  return out;
}

function splitQuestionSegments(question) {
  var raw = String(question || '').replace(/\r/g, '\n').trim();
  if (!raw) return expandSegmentToQuestions('未指定具體問題', 1);
  var hardParts = raw.split(/[？?；;\n]+/).map(function(x){ return x.trim(); }).filter(Boolean);
  if (!hardParts.length) hardParts = [raw];
  var parts = [];
  hardParts.forEach(function(part) {
    var clauses = part.split(/[，,]+/).map(function(x){ return x.trim(); }).filter(Boolean);
    if (clauses.length < 2) { parts.push(part); return; }
    var current = clauses[0];
    for (var i = 1; i < clauses.length; i++) {
      if (shouldSplitCommaClauses(current, clauses[i])) { parts.push(current); current = clauses[i]; }
      else current += '，' + clauses[i];
    }
    parts.push(current);
  });
  var out = [],globalTime=detectUserTimeScope(raw);
  parts.forEach(function(text, index){ out = out.concat(expandSegmentToQuestions(text, index + 1)); });
  if(globalTime)out.forEach(function(item){if(!item.timeScope&&item.type!=='timing'&&item.type!=='unsupported_age')item.timeScope={source:'user_question_shared_scope',raw:globalTime.raw};});
  return out;
}

function inferQuestionTypes(text) { return inferQuestionDimensions(text).types; }
function inferQuestionType(text) { return primaryDecisionType(inferQuestionTypes(text)); }

function getPersonRoleIds(declaredGender) {
  if (declaredGender === 'male') return { querent:28, counterpart:29 };
  if (declaredGender === 'female') return { querent:29, counterpart:28 };
  return { querent:null, counterpart:null };
}

function uniqueNumbers(values) {
  var seen = {};
  return (values || []).filter(function(v){ if (!v || seen[v]) return false; seen[v] = true; return true; });
}
function uniqueStrings(values) {
  var seen = {};
  return (values || []).filter(function(v){ if (!v || seen[v]) return false; seen[v] = true; return true; });
}
function uniquePositions(values) {
  var seen = {};
  return (values || []).filter(function(p){ if (!p || seen[p.slot]) return false; seen[p.slot] = true; return true; });
}

function adjacencyEntryFor(geometry, slot) {
  for (var i = 0; i < geometry.adjacency.length; i++) if (geometry.adjacency[i].position.slot === slot) return geometry.adjacency[i];
  return null;
}
function neighborhoodFor(geometry, center) {
  var entry = adjacencyEntryFor(geometry, center.slot);
  return { center:center, positions:uniquePositions([center].concat(entry ? entry.neighbors : [])) };
}
function mirrorTargetsFor(geometry, center) {
  var out = [], hIdx = gtIndexAt(center.row, 9 - center.col);
  if (hIdx >= 0 && geometry.positions[hIdx] && geometry.positions[hIdx].slot !== center.slot) out.push({ axis:'horizontal', source:center, target:geometry.positions[hIdx] });
  if (center.row <= 4) {
    var vIdx = gtIndexAt(5 - center.row, center.col);
    if (vIdx >= 0 && geometry.positions[vIdx] && geometry.positions[vIdx].slot !== center.slot) out.push({ axis:'vertical', source:center, target:geometry.positions[vIdx] });
  }
  return out;
}
function knightTargetsFor(geometry, center) {
  var offsets = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]], out = [];
  offsets.forEach(function(d){ var idx = gtIndexAt(center.row + d[0], center.col + d[1]); if (idx >= 0 && geometry.positions[idx]) out.push({source:center,target:geometry.positions[idx]}); });
  return out;
}

function analysisDimensionsFor(questionItem) {
  var type = primaryDecisionType(questionItem.types || [questionItem.type]);
  if (type === 'comparison_suitability') return ANALYSIS_DIMENSIONS.comparison.slice();
  if (type === 'attraction_opportunity') return ANALYSIS_DIMENSIONS.attraction.slice();
  if (type === 'sexual_component' || type === 'sexual_event') return ANALYSIS_DIMENSIONS.sexual.slice();
  if (type === 'timing') return ['時間規則未啟用的必要限制'];
  if (type === 'debt_clearance') return ['清償條件是否成立','債務壓力／損耗','不足邊界'];
  if (type === 'positive_net_worth') return ['資源成長與穩定','耗損／負擔反證','不足邊界'];
  if (type === 'life_guidance') return ANALYSIS_DIMENSIONS.guidance.slice();
  var domain = questionTypeDomain(type);
  var key = domain === 'work_money' ? (/^career_/.test(type) ? 'career' : type === 'finance' ? 'finance' : 'business') : domain;
  return (ANALYSIS_DIMENSIONS[key] || ANALYSIS_DIMENSIONS.general).slice();
}

function personStatusForScope(scope) {
  if (scope === 'current_partner' || scope === 'former_partner' || scope === 'specific_counterpart') return 'identified';
  if (scope === 'unknown_future_counterpart' || scope === 'hypothetical_noncurrent_counterpart') return 'hypothetical';
  return 'method_placeholder';
}

function buildQuestionFocusProfile(questionItem, declaredGender) {
  // 共用來源：題目只映射到少數語義軸；所有軸共用同一分層公式，不再展開逐題 gate。
  var roles=getPersonRoleIds(declaredGender),type=primaryDecisionType(questionItem.types||[questionItem.type]);
  var profile=_lnFormulaForType(type),anchors=_lnProfileIds(profile,roles,'anchors'),supports=_lnProfileIds(profile,roles,'support');
  if(type==='unsupported_age'||type==='health_medical_cause'||type==='timing')return {anchors:[],supports:[],all:[],contextual:[],profile:profile};
  anchors=uniqueNumbers(anchors);supports=uniqueNumbers(supports).filter(function(id){return anchors.indexOf(id)===-1;});
  return {anchors:anchors,supports:supports,all:uniqueNumbers(anchors.concat(supports).concat(HARD_NEGATIVE_IDS)),contextual:[],profile:profile};
}
function buildQuestionFocusIds(types, declaredGender) { return buildQuestionFocusProfile({types:Array.isArray(types)?types:[types],targetScope:'unspecified'},declaredGender).all; }

function pairSlotKey(a,b) { var lo=Math.min(a.slot,b.slot), hi=Math.max(a.slot,b.slot); return lo+'-'+hi; }
function segmentContainsBoth(seg,a,b) { var slots=seg.positions.map(function(p){return p.slot;}); return slots.indexOf(a.slot)>-1 && slots.indexOf(b.slot)>-1; }
function cardSetFromStructures(structures) {
  var out=[]; (structures||[]).forEach(function(st){ st.positions.forEach(function(p){ out.push(p); }); }); return uniquePositions(out);
}

function classifyClusterPolarity(type, cardIds, anchorIds) {
  // 極性只供文字篇幅判斷，不參與 gate 成立與信心計算；採全站一致表，不再依題型維護第二套語義。
  var ignore=uniqueNumbers((anchorIds||[]).concat([28,29]));
  var modifiers=uniqueNumbers(cardIds||[]).filter(function(id){return ignore.indexOf(id)===-1;});
  var universalPositive=uniqueNumbers([].concat(
    FORMULA_GROUPS.opportunity,FORMULA_GROUPS.stability,FORMULA_GROUPS.success,
    FORMULA_GROUPS.resourceGrowth,FORMULA_GROUPS.guidance,FORMULA_GROUPS.values,
    FORMULA_GROUPS.relation,FORMULA_GROUPS.realization
  ));
  var neg=modifiers.some(function(id){return HARD_NEGATIVE_IDS.indexOf(id)>-1;});
  var pos=modifiers.some(function(id){return universalPositive.indexOf(id)>-1;});
  if(neg&&pos)return 'mixed';
  if(neg)return 'negative';
  if(pos)return 'positive';
  return 'neutral';
}

function structureMinIndexDistance(structure, idsA, idsB) {
  var positions=structure.positions||[],best=99;
  positions.forEach(function(a,ia){if(idsA.indexOf(a.card.id)===-1)return;positions.forEach(function(b,ib){if(idsB.indexOf(b.card.id)===-1)return;best=Math.min(best,Math.abs(ia-ib));});});
  return best;
}
function buildClusters(structures, anchorSlots, type, declaredGender) {
  // 每個物理D／S是一個原子證據。D為主要語句，S為較低權重的連續三張短句。
  return (structures||[]).map(function(st,idx){
    var anchorPositions=(st.positions||[]).filter(function(p){return !!anchorSlots[p.slot];});
    var cardIds=uniqueNumbers((st.positions||[]).map(function(p){return p.card.id;}));
    var anchorIds=uniqueNumbers(anchorPositions.map(function(p){return p.card.id;}));
    var isDirect=st.kind==='adjacency';
    return {
      id:'C'+(idx+1), key:'atom:'+physicalStructureKey(st), refs:[st.id], structures:[st],
      cardIds:cardIds, anchorIds:anchorIds, anchorSlots:anchorPositions.map(function(p){return p.slot;}),
      kind:isDirect?'local_phrase':'three_card_sentence', role:'unassigned',
      theme:isDirect?'直接相鄰牌對':'連續三張短句（中牌主修飾）',
      polarity:classifyClusterPolarity(type,cardIds,anchorIds), confidenceEligible:true,
      evidenceWeight:isDirect?3:2
    };
  });
}

function buildModernContext(geometry, profile, anchorPositions, directPairs, relevantSegments, declaredGender, type, clusters) {
  var empty={personNeighborhoods:[],topicNeighborhoods:[],sharedCards:[],mirrors:[],knightMoves:[],intersections:[],corners:[],centers:[],clusterThemes:[],contextPositions:[],spreadContext:null};
  if(!geometry||!geometry.positions)return empty;
  var bySlot={};geometry.positions.forEach(function(p){bySlot[p.slot]=p;});
  var ctx={spreadId:geometry.spreadId||'grand',core:[],nearField:[],balancedPairs:[],lines:[],focalNeighborhoods:[],houses:[]};
  if(ctx.spreadId==='three'){
    ctx.core=[bySlot[2]].filter(Boolean);ctx.nearField=[bySlot[1],bySlot[2],bySlot[3]].filter(Boolean);
    ctx.lines=(geometry.lines||[]).slice(0,1);
  }else if(ctx.spreadId==='five'){
    ctx.core=[bySlot[3]].filter(Boolean);ctx.nearField=[bySlot[2],bySlot[3],bySlot[4]].filter(Boolean);
    ctx.balancedPairs=[[bySlot[1],bySlot[5]],[bySlot[2],bySlot[4]]].map(function(x){return x.filter(Boolean);});
    ctx.lines=(geometry.lines||[]).slice(0,1);
  }else if(ctx.spreadId==='nine'){
    ctx.core=[bySlot[5]].filter(Boolean);ctx.nearField=[bySlot[2],bySlot[4],bySlot[5],bySlot[6],bySlot[8]].filter(Boolean);
    ctx.lines=(geometry.lines||[]).slice();
  }else{
    var focal=(anchorPositions||[]).slice(0,3);
    focal.forEach(function(pos){var nb=neighborhoodFor(geometry,pos);ctx.focalNeighborhoods.push({center:pos,positions:nb.positions});if(pos.house)ctx.houses.push({card:pos.card,house:pos.house});});
  }
  empty.spreadContext=ctx;
  return empty;
}

function structureHasCards(structure, idsA, idsB) {
  var ids=structure.cardIds||uniqueNumbers(structure.positions.map(function(p){return p.card.id;}));
  return idsA.some(function(x){return ids.indexOf(x)>-1;}) && idsB.some(function(x){return ids.indexOf(x)>-1;});
}
function addApprovedClaim(plan, text, clusterIds) {
  plan.approvedClaims.push(text);
  if (!plan.claimEvidence) plan.claimEvidence=[];
  plan.claimEvidence.push({claimIndex:plan.approvedClaims.length,clusters:uniqueStrings(clusterIds||[])});
}

function approvedClusterIds(packet) {
  var ids=[];
  (packet&&packet.claimPlan&&packet.claimPlan.claimEvidence||[]).forEach(function(link){ids=ids.concat(link.clusters||[]);});
  return uniqueStrings(ids);
}
function buildApprovedEvidenceView(packet) {
  var allowedIds=approvedClusterIds(packet), allowed={}, refs={};
  allowedIds.forEach(function(id){allowed[id]=true;});
  var clusters=(packet.clusters||[]).filter(function(c){return !!allowed[c.id];});
  clusters.forEach(function(c){(c.refs||[]).forEach(function(ref){refs[ref]=true;});});
  var structures=(packet.structures||[]).filter(function(st){return !!refs[st.id];});
  var clusterThemes=((packet.modernContext&&packet.modernContext.clusterThemes)||[]).filter(function(t){return !!allowed[t.clusterId];});
  var usedCards={};
  structures.forEach(function(st){(st.positions||[]).forEach(function(pos){usedCards[pos.card.id]=pos.card;});});
  clusterThemes.forEach(function(t){(t.positions||[]).forEach(function(pos){usedCards[pos.card.id]=pos.card;});});
  return {clusterIds:allowedIds,clusters:clusters,structures:structures,clusterThemes:clusterThemes,usedCards:usedCards};
}

function physicalStructureKey(st) {
  var slots=(st.positions||[]).map(function(p){return p.slot;});
  if(st.kind==='adjacency')return 'D:'+slots.slice().sort(function(a,b){return a-b;}).join('-');
  var f=slots.join('-'),r=slots.slice().reverse().join('-');return 'S:'+(f<r?f:r);
}
function assignGlobalEvidenceUids(packetItems) {
  var map={},next=1;
  (packetItems||[]).forEach(function(entry){(entry.packet.structures||[]).forEach(function(st){var key=physicalStructureKey(st);if(!map[key])map[key]='E'+next++;st.evidenceUid=map[key];});});
  return map;
}

function buildGlobalEvidenceLedger(packetItems, declaredGender) {
  // v7.0：全題採單一證據帳本，不再讓命題互相搶牌。
  // 相依命題可引用同一 evidence_uid；該牌對在帳本只登錄一次，重複引用不得提高 certainty cap。
  var ledger={};
  (packetItems||[]).forEach(function(entry){
    var packet=entry.packet;
    packet.claimPlan=buildClaimPlan(packet,declaredGender,{});
    (packet.structures||[]).forEach(function(st){
      var uid=_lnStructureUid(st);
      if(!ledger[uid])ledger[uid]={uid:uid,structure:st,propositions:[],claims:[]};
    });
    (packet.claimPlan.claimEvidence||[]).forEach(function(link){
      (link.clusters||[]).forEach(function(cid){
        var c=(packet.clusters||[]).filter(function(z){return z.id===cid;})[0],st=_lnClusterStructure(c);
        if(!st)return;
        var uid=_lnStructureUid(st);
        if(!ledger[uid])ledger[uid]={uid:uid,structure:st,propositions:[],claims:[]};
        if(ledger[uid].propositions.indexOf(packet.question.id)<0)ledger[uid].propositions.push(packet.question.id);
        ledger[uid].claims.push(packet.question.id+':A'+link.claimIndex);
      });
    });
    packet.globalEvidenceLedger=ledger;
    packet.validation=validateEvidencePacket(packet);
    if(!packet.validation.ok)failClosedPacket(packet,packet.validation);
  });
  return ledger;
}
// 舊測試／外部呼叫相容別名；語義已由「獨占」改為「單一帳本、共享引用不加權」。
function enforceGlobalClaimEvidenceUniqueness(packetItems, declaredGender) {
  return buildGlobalEvidenceLedger(packetItems,declaredGender);
}

function comparisonCardWeight(card, role) {
  if (!card) return 0;
  var positive = COMPARISON_POSITIVE_IDS.indexOf(card.id) > -1;
  var negative = COMPARISON_NEGATIVE_IDS.indexOf(card.id) > -1;
  var base = positive ? 1 : negative ? -1 : 0;
  if (role === 'fit') return base * 2;
  if (role === 'risk') return base; // 正牌表示風險較可控；負牌表示代價較重。
  return base;
}

function optionBand(score) {
  if (score >= 3) return 'supportive';
  if (score <= -3) return 'strained';
  return 'mixed';
}

function buildComparisonNinePacket(questionItem, drawn) {
  var comparison = questionItem.comparison || detectComparisonQuestion(questionItem.originalText || questionItem.text);
  if (!comparison || !comparison.options || comparison.options.length !== 2 || !drawn || drawn.length !== 9) {
    return { validation:{ok:false,errors:['comparison_requires_two_options_and_nine_cards']}, claimPlan:{status:'internal_validation_failed',certaintyCap:'無法比較',requiredConclusion:'比較資料未完成，不能產生結果。',approvedClaims:['本次比較資料不完整，無法可靠比較。'],forbiddenClaims:['任何選項優劣結論']} };
  }
  var cards=drawn.map(function(c){return c;}), byCode={};
  COMPARISON_LAYOUT.positions.forEach(function(p){byCode[p.code]=cards[p.slot-1];});
  var aScore=comparisonCardWeight(byCode['A-strength'],'strength')+comparisonCardWeight(byCode['A-fit'],'fit')+comparisonCardWeight(byCode['A-risk'],'risk');
  var bScore=comparisonCardWeight(byCode['B-strength'],'strength')+comparisonCardWeight(byCode['B-fit'],'fit')+comparisonCardWeight(byCode['B-risk'],'risk');
  var diff=aScore-bScore, winner='tie', cap='差距有限，無明確勝負';
  if(diff>=3){winner='A';cap='較明確偏向選項A';}
  else if(diff>=1){winner='A';cap='較傾向選項A';}
  else if(diff<=-3){winner='B';cap='較明確偏向選項B';}
  else if(diff<=-1){winner='B';cap='較傾向選項B';}
  var a=comparison.options[0],b=comparison.options[1];
  var approved=[];
  if(winner==='A')approved.push('依對稱位置比較，較適合的選項是「'+a+'」，但只屬本次牌面的相對適配傾向。');
  else if(winner==='B')approved.push('依對稱位置比較，較適合的選項是「'+b+'」，但只屬本次牌面的相對適配傾向。');
  else approved.push('兩個選項各有優缺點，本次牌面不足以分出明確勝負。');
  approved.push('「'+a+'」的判斷只使用左側三個預設位置；「'+b+'」只使用右側三個預設位置；中央欄只解釋共同條件與取捨。');
  approved.push('選項名稱只是標籤，不得因名稱含有任何牌名而套用同名牌義。');
  var plan={
    status:winner==='tie'?'comparison_close':'comparison_preference',
    certaintyCap:cap,
    requiredConclusion:'先分別回答兩個選項的適配，再給相對選擇；不得超過 certainty_cap。',
    approvedClaims:approved,
    forbiddenClaims:['把「'+a+'」名稱映射成同名牌','把「'+b+'」名稱映射成同名牌','只分析一邊後推定另一邊','宣稱客觀能量、醫療、財運或生理功效','把相對適配寫成絕對最好']
  };
  return {
    validation:{ok:true,errors:[]}, comparison:comparison, cards:cards,
    optionA:{label:a,score:aScore,band:optionBand(aScore),positions:[byCode['A-strength'],byCode['A-fit'],byCode['A-risk']]},
    optionB:{label:b,score:bScore,band:optionBand(bScore),positions:[byCode['B-strength'],byCode['B-fit'],byCode['B-risk']]},
    shared:{positions:[byCode['X-strength'],byCode['X-core'],byCode['X-tradeoff']]},
    rows:[
      {id:'X1',role:'有利／優勢比較',cards:[byCode['A-strength'],byCode['X-strength'],byCode['B-strength']]},
      {id:'X2',role:'適配核心比較',cards:[byCode['A-fit'],byCode['X-core'],byCode['B-fit']]},
      {id:'X3',role:'阻礙／代價比較',cards:[byCode['A-risk'],byCode['X-tradeoff'],byCode['B-risk']]}
    ],
    claimPlan:plan,
    analysisDimensions:ANALYSIS_DIMENSIONS.comparison.slice()
  };
}

function buildComparisonPromptBlock(lines, item, packet, cardLabel, xmlEscape) {
  var a=packet.optionA.label,b=packet.optionB.label;
  lines.push('<comparison_packet proposition_id="'+item.id+'" type="comparison_suitability" method="site_symmetric_nine_comparison">');
  lines.push('<question>'+xmlEscape(item.text)+'</question>');
  lines.push('<method_contract>兩個選項已在抽牌前固定分配至左右對稱位置；名稱只作標籤，絕不對應同名牌。左右欄使用相同角色與權重，中央欄只作共同條件與取捨。</method_contract>');
  lines.push('<packet_validation status="pass"></packet_validation>');
  lines.push('<claim_plan status="'+packet.claimPlan.status+'" certainty_cap="'+xmlEscape(packet.claimPlan.certaintyCap)+'">');
  lines.push('<required_conclusion>'+xmlEscape(packet.claimPlan.requiredConclusion)+'</required_conclusion>');
  lines.push('<approved_claims>');packet.claimPlan.approvedClaims.forEach(function(x){lines.push('<claim>'+xmlEscape(x)+'</claim>');});lines.push('</approved_claims>');
  lines.push('<forbidden_claims>');packet.claimPlan.forbiddenClaims.forEach(function(x){lines.push('<claim>'+xmlEscape(x)+'</claim>');});lines.push('</forbidden_claims>');
  lines.push('</claim_plan>');
  lines.push('<option id="A" label="'+xmlEscape(a)+'" assessment="'+packet.optionA.band+'">');
  lines.push('O-A1 有利／優勢='+cardLabel(packet.cards[0]));
  lines.push('O-A2 適配核心='+cardLabel(packet.cards[3]));
  lines.push('O-A3 阻礙／代價='+cardLabel(packet.cards[6]));
  lines.push('</option>');
  lines.push('<option id="B" label="'+xmlEscape(b)+'" assessment="'+packet.optionB.band+'">');
  lines.push('O-B1 有利／優勢='+cardLabel(packet.cards[2]));
  lines.push('O-B2 適配核心='+cardLabel(packet.cards[5]));
  lines.push('O-B3 阻礙／代價='+cardLabel(packet.cards[8]));
  lines.push('</option>');
  lines.push('<shared_axis certainty_effect="none">');
  lines.push('X-C1 共同條件／比較基準='+cardLabel(packet.cards[1]));
  lines.push('X-C2 決策核心='+cardLabel(packet.cards[4]));
  lines.push('X-C3 共同取捨／現實限制='+cardLabel(packet.cards[7]));
  lines.push('</shared_axis>');
  lines.push('<paired_rows>');
  packet.rows.forEach(function(r){lines.push(r.id+' '+r.role+'='+r.cards.map(cardLabel).join(' | '));});
  lines.push('</paired_rows>');
  lines.push('<approved_dictionary>'+packet.cards.map(function(c){return cardLabel(c)+'='+c.key;}).join('；')+'</approved_dictionary>');
  lines.push('<analysis_requirements>依序完成：A的有利／適配／代價；B的有利／適配／代價；中央共同條件與取捨；兩側真正差距；未知邊界。只分析O／X實際提供的角色，不額外替選項補牌義；寫3至5段。</analysis_requirements>');
  lines.push('</comparison_packet>');
}

function buildEvidencePacket(geometry, questionItem, declaredGender) {
  var type=primaryDecisionType(questionItem.types||[questionItem.type]);
  if(type==='unsupported_age'||type==='health_medical_cause'||type==='timing'){
    var empty={question:questionItem,focusPositions:[],anchorPositions:[],housePositions:[],directPairs:[],segments:[],clusters:[],structures:[],modernContext:buildModernContext(null,null,[],[],[],declaredGender,type,[]),analysisDimensions:analysisDimensionsFor(questionItem),usedCards:{}};
    empty.claimPlan=buildClaimPlan(empty,declaredGender);empty.validation=validateEvidencePacket(empty);return empty.validation.ok?empty:failClosedPacket(empty,empty.validation);
  }
  var profile=buildQuestionFocusProfile(questionItem,declaredGender),byCardId={};
  geometry.positions.forEach(function(p){byCardId[p.card.id]=p;});
  var focusPositions=profile.all.map(function(id){return byCardId[id];}).filter(Boolean);
  var anchorPositions=profile.anchors.map(function(id){return byCardId[id];}).filter(Boolean);
  var anchorSlots={},relevantIds={};anchorPositions.forEach(function(p){anchorSlots[p.slot]=true;});profile.all.forEach(function(id){relevantIds[id]=true;});

  var isCompact=geometry.spreadId&&geometry.spreadId!=='grand';
  // 第一層：小牌陣的每張牌都因同一問題而抽出，因此保留全部合法相鄰牌對；
  // 大牌陣則只保留接觸人物／主題焦點或雙方皆屬題目相關集合的牌對。
  var pairMap={},directPairs=[];
  geometry.adjacency.forEach(function(entry){
    entry.neighbors.forEach(function(n){
      var a=entry.position,b=n,key=pairSlotKey(a,b);if(pairMap[key])return;
      var touchesAnchor=!!anchorSlots[a.slot]||!!anchorSlots[b.slot];
      var bothRelevant=!!relevantIds[a.card.id]&&!!relevantIds[b.card.id];
      if(!isCompact&&!touchesAnchor&&!bothRelevant)return;
      pairMap[key]=true;directPairs.push({positions:[a,b],score:isCompact?_lnSpreadPairPriority(geometry,a,b):(touchesAnchor?3:2)});
    });
  });
  directPairs.sort(function(a,b){return b.score-a.score||pairSlotKey(a.positions[0],a.positions[1]).localeCompare(pairSlotKey(b.positions[0],b.positions[1]),undefined,{numeric:true});});

  // 第二層：每條合法線滑動產生連續三張短句。小牌陣完整保留；大牌陣仍依焦點過濾。
  var segmentMap={},segments=[];
  geometry.lines.forEach(function(line){
    for(var i=0;i<=line.positions.length-3;i++){
      var win=line.positions.slice(i,i+3),anchorHits=win.filter(function(p){return !!anchorSlots[p.slot];}).length;
      var relevantHits=win.filter(function(p){return !!relevantIds[p.card.id];}).length;
      if(!isCompact&&!anchorHits&&relevantHits<2)continue;
      var f=win.map(function(p){return p.slot;}).join('-'),r=win.slice().reverse().map(function(p){return p.slot;}).join('-'),key=f<r?f:r;
      if(segmentMap[key])continue;segmentMap[key]=true;
      segments.push({positions:win,score:isCompact?_lnSpreadWindowPriority(geometry,win,line):(anchorHits*3+relevantHits),lineType:line.type||'連續線'});
    }
  });
  segments.sort(function(a,b){return b.score-a.score||a.positions[0].slot-b.positions[0].slot;});
  if(!isCompact)segments=segments.slice(0,14);

  var structures=[];
  directPairs.forEach(function(pair,idx){var st={id:'D'+(idx+1),kind:'adjacency',positions:pair.positions,cardIds:uniqueNumbers(pair.positions.map(function(p){return p.card.id;})),weight:3,spreadScoped:isCompact,positionWeight:isCompact?pair.score:1,spreadId:geometry.spreadId||'grand'};st.evidenceUid=physicalStructureKey(st);structures.push(st);});
  segments.forEach(function(seg,idx){var st={id:'S'+(idx+1),kind:'context_window',positions:seg.positions,cardIds:uniqueNumbers(seg.positions.map(function(p){return p.card.id;})),weight:2,spreadScoped:isCompact,positionWeight:isCompact?seg.score:1,spreadId:geometry.spreadId||'grand',lineType:seg.lineType};st.evidenceUid=physicalStructureKey(st);structures.push(st);});
  var clusters=buildClusters(structures,anchorSlots,type,declaredGender),modernContext=buildModernContext(geometry,profile,anchorPositions,directPairs,segments,declaredGender,type,clusters),usedCards={};
  structures.forEach(function(st){st.positions.forEach(function(p){usedCards[p.card.id]=p.card;});});
  var packet={question:questionItem,profile:profile,spreadId:geometry.spreadId||'grand',spreadGeometry:geometry,focusPositions:focusPositions,anchorPositions:anchorPositions,housePositions:[],directPairs:directPairs,segments:segments,clusters:clusters,structures:structures,modernContext:modernContext,analysisDimensions:analysisDimensionsFor(questionItem),usedCards:usedCards,formulaId:CANONICAL_READING_FORMULA.id};
  packet.claimPlan=buildClaimPlan(packet,declaredGender);packet.validation=validateEvidencePacket(packet);return packet.validation.ok?packet:failClosedPacket(packet,packet.validation);
}

function buildClaimPlan(packet, declaredGender) {
  var type=primaryDecisionType(packet.question.types||[packet.question.type]);
  var limitPlan={status:'model_evaluate',certaintyCap:'證據有限',requiredConclusion:'只輸出程式核准的主張。',approvedClaims:[],forbiddenClaims:[],claimEvidence:[]};
  if(type==='comparison_suitability'){limitPlan.status='comparison_requires_symmetric_nine';limitPlan.certaintyCap='無法由大牌陣公平比較';addApprovedClaim(limitPlan,'目前牌陣沒有為兩個選項建立抽牌前對稱位置，不能公平比較。',[]);return limitPlan;}
  if(type==='unsupported_age'){limitPlan.status='unsupported_age';limitPlan.certaintyCap='不足以判定';limitPlan.requiredConclusion='直接回答數字年齡與區間無法驗證。';addApprovedClaim(limitPlan,'無 age_rules，無法判定數字年齡或年齡區間。',[]);return limitPlan;}
  if(type==='timing'){limitPlan.status='timing_rules_not_enabled';limitPlan.certaintyCap='不足以判定具體時間';limitPlan.requiredConclusion='直接回答本站未啟用數字應期規則。';addApprovedClaim(limitPlan,'本次無法由牌面判定年、月、週、日或精確先後階段。',[]);return limitPlan;}
  if(type==='health_medical_cause'){limitPlan.status='medical_limit';limitPlan.certaintyCap='不足以判定';limitPlan.requiredConclusion='直接說明牌面不能判定醫學病因、診斷或治療。';addApprovedClaim(limitPlan,'牌面無法判定醫學病因、診斷、藥效或治療結果。',[]);return limitPlan;}
  return compileLayeredClaimPlan(packet,declaredGender);
}

function validateEvidencePacket(packet) {
  var errors=[],type=primaryDecisionType(packet.question.types||[packet.question.type]),pairSeen={},segmentSeen={};
  (packet.directPairs||[]).forEach(function(pair,idx){
    if(!pair.positions||pair.positions.length!==2)errors.push('D'+(idx+1)+':invalid_pair');
    else{var key=pairSlotKey(pair.positions[0],pair.positions[1]);if(pairSeen[key])errors.push('D'+(idx+1)+':duplicate_pair');pairSeen[key]=true;}
  });
  (packet.segments||[]).forEach(function(seg,idx){
    if(!seg.positions||seg.positions.length!==3)errors.push('S'+(idx+1)+':must_be_three_cards');
    var slots=(seg.positions||[]).map(function(p){return p.slot;}),f=slots.join('-'),r=slots.slice().reverse().join('-'),key=f<r?f:r;
    if(uniqueNumbers(slots).length!==slots.length)errors.push('S'+(idx+1)+':repeated_slot');
    if(segmentSeen[key])errors.push('S'+(idx+1)+':duplicate_window');segmentSeen[key]=true;
  });
  var allRefs={},clusterRefs={},physical={};
  (packet.structures||[]).forEach(function(st){allRefs[st.id]=true;var k=physicalStructureKey(st);if(physical[k])errors.push(st.id+':duplicate_physical');physical[k]=true;});
  (packet.clusters||[]).forEach(function(c){
    if((c.refs||[]).length!==1||(c.structures||[]).length!==1)errors.push(c.id+':non_atomic_cluster');
    (c.refs||[]).forEach(function(ref){if(!allRefs[ref])errors.push(c.id+':unknown_ref:'+ref);clusterRefs[ref]=(clusterRefs[ref]||0)+1;});
    var st=_lnClusterStructure(c);if(st&&st.kind!=='adjacency'&&st.kind!=='context_window')errors.push(c.id+':unknown_structure_kind');
  });
  Object.keys(allRefs).forEach(function(ref){if(clusterRefs[ref]!==1)errors.push(ref+':cluster_count='+(clusterRefs[ref]||0));});
  if(type==='unsupported_age'&&packet.structures.length)errors.push('age_packet_has_evidence');
  if(type==='health_medical_cause'&&packet.structures.length)errors.push('medical_cause_packet_has_evidence');
  if(type==='timing'&&packet.structures.length)errors.push('timing_packet_has_evidence');
  var claimUse={};
  (packet.claimPlan&&packet.claimPlan.claimEvidence||[]).forEach(function(link){
    if((link.clusters||[]).length>2)errors.push('claim_overlinked');
    (link.clusters||[]).forEach(function(cid){
      if(!packet.clusters.some(function(c){return c.id===cid;}))errors.push('claim_unknown_cluster:'+cid);
      claimUse[cid]=(claimUse[cid]||0)+1;
    });
  });
  Object.keys(claimUse).forEach(function(cid){if(claimUse[cid]>1)errors.push('claim_cluster_reused:'+cid);});
  if(!packet.claimPlan||!packet.claimPlan.status||!packet.claimPlan.certaintyCap)errors.push('missing_claim_plan');
  return {ok:errors.length===0,errors:errors};
}

function failClosedPacket(packet, validation) {
  packet.directPairs = [];
  packet.segments = [];
  packet.structures = [];
  packet.clusters = [];
  packet.housePositions = [];
  packet.modernContext = {personNeighborhoods:[],topicNeighborhoods:[],sharedCards:[],mirrors:[],knightMoves:[],intersections:[],corners:[],centers:[],clusterThemes:[],contextPositions:[],spreadContext:null};
  packet.usedCards = {};
  packet.claimPlan = {
    status:'internal_validation_failed',
    certaintyCap:'無法解讀',
    requiredConclusion:'資料驗證未通過，直接說明本次牌陣資料無法可靠解讀。',
    approvedClaims:['本次證據資料驗證失敗，無法可靠解讀。'],
    forbiddenClaims:['任何牌面結論'],
    claimEvidence:[]
  };
  packet.validation = validation;
  return packet;
}

function buildEvidenceAwareAnalysisRequirements(packet) {
  var type=primaryDecisionType(packet.question.types||[packet.question.type]);
  if(type==='timing'||type==='unsupported_age'||type==='health_medical_cause')return {items:['只寫必要限制'],paragraphMin:0,paragraphMax:1,favorable:'omit',risk:'omit',repetition:'omit',contradiction:'omit'};
  var ev=packet.claimPlan&&packet.claimPlan.evaluation;
  var hasPositive=!!(ev&&ev.support&&ev.support.length),hasRisk=!!(ev&&ev.risk&&ev.risk.length);
  var cardIds=uniqueNumbers((buildApprovedEvidenceView(packet).structures||[]).reduce(function(out,st){return out.concat(st.cardIds||[]);},[]));
  var spread=packet.spreadId||'grand',min=1,max=3;
  if(spread==='three'){min=2;max=3;}
  else if(spread==='five'){min=3;max=5;}
  else if(spread==='nine'){min=3;max=6;}
  else if(spread==='grand'){min=4;max=7;}
  if(type==='action_effectiveness'||type==='decision_suitability'||type==='business_success'||type==='life_guidance'||type==='outcome_tendency'||type==='risk_guidance')min=Math.max(min,2);
  if(questionTypeDomain(type)==='relationship'||/^career_/.test(type))min=Math.max(min,2);
  return {items:[],paragraphMin:min,paragraphMax:max,favorable:hasPositive?'required':'insufficient_or_omit',risk:hasRisk?'required':'omit_if_absent',repetition:cardIds.indexOf(11)>-1?'required':'omit',contradiction:hasPositive&&hasRisk?'required':'omit'};
}

var STONE_RECOMMENDATION_CATALOG = [
  {id:'amethyst',name:'紫水晶',direction:'釐清選擇、整理判斷與保持冷靜',fact:'礦物上屬石英，化學成分為 SiO₂，莫氏硬度7。'},
  {id:'rose_quartz',name:'粉晶',direction:'溫和表達情感、改善互動與自我接納',fact:'礦物上屬石英，化學成分為 SiO₂，莫氏硬度7。'},
  {id:'citrine',name:'黃水晶',direction:'聚焦商業目標、資源規劃與可執行步驟',fact:'礦物上屬石英，化學成分為 SiO₂，莫氏硬度7。'},
  {id:'aquamarine',name:'海藍寶',direction:'清楚溝通、降低表達混亂與確認訊息',fact:'礦物上屬綠柱石，化學成分為 Be₃Al₂Si₆O₁₈，莫氏硬度7.5至8。'},
  {id:'tigers_eye',name:'虎眼石',direction:'實際判斷、設定行動界線與承擔取捨',fact:'屬具貓眼效應的石英材料，其光帶與定向纖維狀礦物包裹體有關。'},
  {id:'obsidian',name:'黑曜石',direction:'切斷干擾、守住界線與面對現實限制',fact:'屬天然火山玻璃，通常由富矽熔岩快速冷卻形成。'}
];

function _lnAddStoneScore(scores, reasons, id, points, reason) {
  scores[id] = (scores[id] || 0) + points;
  if (reason) { if (!reasons[id]) reasons[id] = []; if (reasons[id].indexOf(reason) === -1) reasons[id].push(reason); }
}

function buildStoneRecommendationCandidates(question, questions, evidenceSource) {
  var q=String(question||''),scores={},reasons={},types={};
  (questions||[]).forEach(function(item){(item.types||[item.type]).forEach(function(t){types[t]=true;});});
  var ids=[];
  if(Array.isArray(evidenceSource)&&evidenceSource.length&&evidenceSource[0]&&evidenceSource[0].packet){
    evidenceSource.forEach(function(entry){var view=entry.promptView||buildApprovedEvidenceView(entry.packet);(view.structures||[]).forEach(function(st){ids=ids.concat(st.cardIds||[]);});});
  }else ids=(evidenceSource||[]).map(function(c){return c&&c.id;});
  ids=uniqueNumbers(ids);
  function cardHits(group){return ids.filter(function(id){return group.indexOf(id)>-1;}).length;}
  if(/還是|選擇|比較|哪(?:一)?個|五行|搭配|猶豫|判斷|迷茫|茫然|人生方向|請給我建議/.test(q)||types.comparison_suitability||types.life_guidance)_lnAddStoneScore(scores,reasons,'amethyst',5,'選擇、方向與判斷');
  if(/感情|愛情|戀愛|伴侶|桃花|關係|情感互動/.test(q)||types.attraction_opportunity||types.relationship_intent||types.relationship_future||types.relationship_longevity)_lnAddStoneScore(scores,reasons,'rose_quartz',5,'情感與互動');
  if(/副業|生意|賣場|訂單|業績|財運|收入|資金|負債|資產/.test(q)||types.business_success||types.finance||types.debt_clearance||types.positive_net_worth)_lnAddStoneScore(scores,reasons,'citrine',5,'商業與資源');
  if(/溝通|訊息|聯絡|回覆|表達|說清楚/.test(q)||types.communication)_lnAddStoneScore(scores,reasons,'aquamarine',5,'溝通與確認');
  if(/界線|切斷|離開|停止|干擾|消耗|負擔|阻礙|負債/.test(q))_lnAddStoneScore(scores,reasons,'obsidian',4,'界線與減少干擾');
  if(/工作|職場|行動|執行|決定|取捨|還債/.test(q)||types.career_fit||types.career_promotion||types.career_change||types.career_general)_lnAddStoneScore(scores,reasons,'tigers_eye',4,'行動與取捨');
  var n;
  n=cardHits([6,16,22,26,33]);if(n)_lnAddStoneScore(scores,reasons,'amethyst',n,'核心證據含不明／指引／選擇／知識／解答');
  n=cardHits([9,18,24,25,32]);if(n)_lnAddStoneScore(scores,reasons,'rose_quartz',n,'核心證據含情感／信任／承諾');
  n=cardHits([14,15,31,34,35]);if(n)_lnAddStoneScore(scores,reasons,'citrine',n,'核心證據含工作／權力／成功／財務／穩定');
  n=cardHits([1,12,20,27]);if(n)_lnAddStoneScore(scores,reasons,'aquamarine',n,'核心證據含消息／溝通／公開');
  n=cardHits([8,10,21,23,36]);if(n)_lnAddStoneScore(scores,reasons,'obsidian',n,'核心證據含結束／切斷／阻礙／損耗／負擔');
  n=cardHits([10,14,15,21,22,35]);if(n)_lnAddStoneScore(scores,reasons,'tigers_eye',n,'核心證據含決斷／工作／力量／阻礙／行動');
  return STONE_RECOMMENDATION_CATALOG.map(function(item){return {id:item.id,name:item.name,direction:item.direction,fact:item.fact,score:scores[item.id]||0,reasons:reasons[item.id]||[]};}).filter(function(x){return x.score>0;}).sort(function(a,b){return b.score-a.score||a.name.localeCompare(b.name,'zh-Hant');}).slice(0,3).sort(function(a,b){return a.name.localeCompare(b.name,'zh-Hant');});
}

function appendStoneRecommendationPrompt(lines, question, questions, evidenceSource, xmlEscape) {
  var candidates=buildStoneRecommendationCandidates(question,questions,evidenceSource);
  lines.push('<stone_recommendation mode="select_after_interpretation" evidence_basis="question_and_core_evidence">');
  lines.push('<selection_rule>先完成正文，再以正文中最主要的 approved_claim 為唯一選擇基準；所選 symbolic_direction 必須能直接對應該主張，不能只因題目屬商業、感情或財務就選同類候選。若主結論以阻礙、損耗、切斷或負擔為主，先比對限制／界線方向。候選按名稱排列，不是推薦順位；若都不吻合，輸出「本題不強行推薦水晶。」。只可寫象徵方向與礦物事實，不得宣稱醫療、改運或客觀能量效果。</selection_rule>');
  candidates.forEach(function(c){lines.push('<candidate priority="none" name="'+xmlEscape(c.name)+'" matched_by="'+xmlEscape(c.reasons.join('、'))+'"><symbolic_direction>'+xmlEscape(c.direction)+'</symbolic_direction><mineral_fact>'+xmlEscape(c.fact)+'</mineral_fact></candidate>');});
  lines.push('<output_format>推薦水晶：{名稱}——象徵{與正文結論吻合的方向}；{該候選的礦物事實}</output_format>');
  lines.push('</stone_recommendation>');
}


function claimEvidenceUids(packet, link) {
  var out=[];
  (link&&link.clusters||[]).forEach(function(cid){
    var c=(packet.clusters||[]).filter(function(z){return z.id===cid;})[0],st=_lnClusterStructure(c);
    if(st)out.push(_lnStructureUid(st));
  });
  return uniqueStrings(out);
}
function collectApprovedEvidenceLedger(packetItems) {
  var map={};
  (packetItems||[]).forEach(function(entry){
    var packet=entry.packet;
    (packet.claimPlan&&packet.claimPlan.claimEvidence||[]).forEach(function(link){
      claimEvidenceUids(packet,link).forEach(function(uid){
        var c=(packet.clusters||[]).filter(function(z){var st=_lnClusterStructure(z);return st&&_lnStructureUid(st)===uid;})[0];
        var st=_lnClusterStructure(c);if(!st)return;
        if(!map[uid])map[uid]={uid:uid,structure:st,propositions:[],claims:[]};
        if(map[uid].propositions.indexOf(packet.question.id)<0)map[uid].propositions.push(packet.question.id);
        map[uid].claims.push(packet.question.id+':A'+link.claimIndex);
      });
    });
  });
  return Object.keys(map).map(function(k){return map[k];}).sort(function(a,b){
    var na=parseInt(String(a.uid).replace(/\D/g,''),10)||0,nb=parseInt(String(b.uid).replace(/\D/g,''),10)||0;
    return na-nb||String(a.uid).localeCompare(String(b.uid));
  });
}

function buildPrompt(question, drawn, spreadId, sigGender, declaredGender) {
  var sp=SPREADS[spreadId], q=String(question||'').trim(), lines=[], isGT=spreadId==='grand'&&drawn.length===36, stoneEvidence=drawn;
  function cardLabel(c){return c.id+'.'+c.name;}
  function xmlEscape(value){return String(value==null?'':value).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
  var questions=splitQuestionSegments(q), roles=getPersonRoleIds(declaredGender), typeSet={};
  var comparison=detectComparisonQuestion(q), isSymmetricComparison=!!comparison && spreadId==='nine' && drawn.length===9, isInvalidComparison=!!comparison && !isSymmetricComparison;
  questions.forEach(function(item){(item.types||[item.type]).forEach(function(type){typeSet[type]=true;});});

  lines.push('# 最高規則');
  lines.push('你是本站 Petit Lenormand v10.0 四牌陣統一解讀器。第一句依 proposition 順序直接回答。');
  lines.push('只轉寫 claim_plan；certainty_cap 不得提高。claim_evidence 可用D與S；同一物理結構只登錄一次，重複引用不加權。');
  lines.push('D為主要語句，S為次級三張短句且中牌主修飾。兩者須與命題相關；牌號、座標、房屋、鏡像、騎士跳與長線不自行表示時間、因果或事件。');
  if(questions.some(function(item){return !!item.timeScope;}))lines.push('time_scope只保留使用者明示範圍，不換算日期或先後階段。');
  lines.push('無證據項目省略；不得補入未核准的行動、期限、金額、人物或事件。spread_context不新增結論。');
  lines.push('固定負向語義：棺材＝結束；鐮刀＝切斷；山＝阻礙；老鼠＝損耗；十字架＝負擔；雲＝不明；鞭子＝衝突／反覆。');
  lines.push('<method_scope>36張與4頁說明可核實；4×8+4及人物附近敘事採保存傳統。其餘公式為本站規約；approved_dictionary是本站受控的現代工作詞典。</method_scope>');
  var boundaryExamples=[];
  if(typeSet.timing)boundaryExamples.push('不以牌號或座標猜日期。');
  if(typeSet.business_success||typeSet.finance||typeSet.debt_clearance||typeSet.positive_net_worth)boundaryExamples.push('成功不等於清債或正資產。');
  if(typeSet.business_success||typeSet.finance||typeSet.action_effectiveness||typeSet.decision_suitability)boundaryExamples.push('方案題不得生成金額、折扣、庫存、價格、毛利或期限。');
  if(typeSet.life_guidance)boundaryExamples.push('人生建議題只可輸出 approved_claims 已核准的篩選原則；不得自行指定職業、離職、分手、搬家、期限或唯一使命。');
  if(boundaryExamples.length)lines.push('<boundaries>'+boundaryExamples.map(function(x){return '<b>'+x+'</b>';}).join('')+'</boundaries>');
  if(isSymmetricComparison){
    lines.push('比較題最高規則：兩個選項已在抽牌前固定到左右對稱欄；選項名稱只是標籤，禁止把名稱中的「太陽、魚、心、熊」等字套成同名牌。');
    lines.push('A與B必須使用完全相同的位置角色比較；不得將選項名稱映射成同名牌，也不得因名稱較熟悉而偏重。');
  }
  lines.push('');

  if(typeSet.sexual_component||typeSet.sexual_event){
    lines.push('# 性／肉體題專用邊界');
    lines.push('桃花機會、感官／性成分、實際肉體事件是三個不同命題；證據不可互借或從不同位置拼接升級。');
    lines.push('百合只作本站可選的現代感官提示；蛇只修飾誘惑／複雜風險，不能單獨建立性成分。魚不得寫成慾望，鞭子不得當性行為牌。');
    lines.push('');
  }
  if(typeSet.unsupported_age){lines.push('無 age_rules：數字年齡與區間直接回答無法驗證，不得附牌面側證。');lines.push('');}
  if(typeSet.health_medical_cause){lines.push('醫學病因命題不得使用牌面作原因、診斷或治療；若另有 health_symbolic_context，只能作非醫療的象徵性深讀。');lines.push('');}

  lines.push('<reading_request method_profile="site_petit_lenormand_v10_0_multispread_compiler">');
  lines.push('<question_original>'+xmlEscape(q||'未指定具體問題')+'</question_original>');
  lines.push('<formula_contract id="'+CANONICAL_READING_FORMULA.id+'" primary_unit="direct_pair_weight_3" secondary_unit="contiguous_three_card_sentence_weight_2" spread_modes="three_five_nine_grand" aggregation="unique_support_risk_five_level" ledger_rule="one_structure_one_entry_shared_reference_no_boost"></formula_contract>');
  lines.push('<propositions>');
  questions.forEach(function(item){
    if(item.type==='comparison_suitability' && item.options && item.options.length===2) lines.push('<proposition id="'+item.id+'" parent="'+item.parentId+'" type="comparison_suitability" target_scope="option_comparison" option_a="'+xmlEscape(item.options[0])+'" option_b="'+xmlEscape(item.options[1])+'">'+xmlEscape(item.text)+'</proposition>');
    else lines.push('<proposition id="'+item.id+'" parent="'+item.parentId+'" type="'+item.type+'" target_scope="'+item.targetScope+'">'+xmlEscape(item.text)+'</proposition>');
    if(item.timeScope)lines.push('<time_scope proposition_id="'+item.id+'" source="user_question" value="'+xmlEscape(item.timeScope.raw)+'" inference_enabled="false"></time_scope>');
    if(item.qualifiers&&item.qualifiers.length)item.qualifiers.forEach(function(qf){lines.push('<unsupported_constraint proposition_id="'+item.id+'" kind="age" requested="'+xmlEscape(qf.raw)+'" reason="age_rules_not_provided"></unsupported_constraint>');});
  });
  lines.push('</propositions>');
  lines.push('<querent_gender>'+(declaredGender==='male'?'男':declaredGender==='female'?'女':'未聲明')+'</querent_gender>');
  lines.push('<person_roles>');
  if(roles.querent)lines.push('<role name="querent" status="identified">'+cardLabel(CARDS[roles.querent-1])+'</role>');
  else lines.push('<role name="querent" status="unassigned">28.紳士／29.淑女未指定</role>');
  lines.push('</person_roles>');
  lines.push('<direction_rules enabled="false"></direction_rules>');
  lines.push('<distance_rules enabled="false"></distance_rules>');
  lines.push('<age_rules enabled="false"></age_rules>');
  lines.push('<timing_rules enabled="false" precision="none"></timing_rules>');

  if(isSymmetricComparison){
    var comparisonItem=questions.filter(function(x){return x.type==='comparison_suitability';})[0] || questions[0];
    var comparisonPacket=buildComparisonNinePacket(comparisonItem,drawn);
    buildComparisonPromptBlock(lines,comparisonItem,comparisonPacket,cardLabel,xmlEscape);
  }else if(isInvalidComparison){
    var invalidItem=questions.filter(function(x){return x.type==='comparison_suitability';})[0] || questions[0];
    lines.push('<comparison_packet proposition_id="'+invalidItem.id+'" type="comparison_suitability" method="site_symmetric_nine_comparison">');
    lines.push('<packet_validation status="fail" reason="comparison_requires_symmetric_nine"></packet_validation>');
    lines.push('<claim_plan status="invalid_comparison_spread" certainty_cap="無法比較">');
    lines.push('<approved_claims><claim>本次牌陣沒有在抽牌前為兩個選項分配對稱位置，因此無法公平比較。</claim></approved_claims>');
    lines.push('<forbidden_claims><claim>事後挑選同名牌或任意牌代表選項</claim><claim>任何選項優劣結論</claim></forbidden_claims>');
    lines.push('</claim_plan></comparison_packet>');
  }else{
    var geometry=buildSpreadGeometry(drawn,spreadId),globalUsedCards={};
    lines.push('<spread id="'+spreadId+'" name="'+xmlEscape(sp.name)+'" count="'+drawn.length+'" reading_mode="'+xmlEscape(geometry.readingMode||spreadId)+'"></spread>');
    if(spreadId!=='grand'){
      lines.push('<drawn_cards>');
      for(var di=0;di<drawn.length;di++){
        var dpos=geometry.positions[di],dlabel=dpos&&dpos.role?dpos.role:(sp.positions?sp.positions[di]:('第'+(di+1)+'張'));
        lines.push((di+1)+'. '+dlabel+'＝'+cardLabel(drawn[di])+'（'+drawn[di].key+'）'+(drawn[di]._presetSig?'〔預置焦點，非隨機抽中〕':''));
      }
      lines.push('</drawn_cards>');
    }
    var packetItems=questions.map(function(item){var packet=buildEvidencePacket(geometry,item,declaredGender);return{item:item,packet:packet};});
    assignGlobalEvidenceUids(packetItems);
    buildGlobalEvidenceLedger(packetItems,declaredGender);
    packetItems.forEach(function(entry){entry.promptView=buildApprovedEvidenceView(entry.packet);Object.keys(entry.promptView.usedCards).forEach(function(id){globalUsedCards[id]=entry.promptView.usedCards[id];});});
    var evidenceLedger=collectApprovedEvidenceLedger(packetItems);
    lines.push('<evidence_ledger counting="one_physical_structure_one_entry" reuse="shared_reference_no_confidence_boost">');
    evidenceLedger.forEach(function(e){var isD=e.structure.kind==='adjacency',sep=isD?' & ':' > ';lines.push('<evidence id="'+e.uid+'" kind="'+(isD?'D':'S')+'" weight="'+(isD?'3':'2')+'" propositions="'+e.propositions.join(',')+'">'+e.structure.positions.map(function(p){return cardLabel(p.card);}).join(sep)+'</evidence>');});
    lines.push('</evidence_ledger>');
    stoneEvidence=packetItems;
    packetItems.forEach(function(entry){
      var item=entry.item,packet=entry.packet,type=item.type,policy=CLAIM_POLICIES[type];
      lines.push('<evidence_packet proposition_id="'+item.id+'" type="'+type+'" target_scope="'+item.targetScope+'" formula="'+(packet.formulaId||CANONICAL_READING_FORMULA.id)+'" spread="'+spreadId+'">');
      lines.push('<question>'+xmlEscape(item.text)+'</question>');
      lines.push('<packet_validation status="'+(packet.validation&&packet.validation.ok?'pass':'fail')+'"></packet_validation>');
      if(roles.counterpart&&questionTypeDomain(type)==='relationship')lines.push('<role name="counterpart_significator" status="'+personStatusForScope(item.targetScope)+'">'+cardLabel(CARDS[roles.counterpart-1])+'</role>');
      if(policy)lines.push('<decision_boundary>'+xmlEscape(policy.meaning+' '+policy.forbidden)+'</decision_boundary>');
      lines.push('<claim_plan status="'+packet.claimPlan.status+'" certainty_cap="'+xmlEscape(packet.claimPlan.certaintyCap)+'">');
      lines.push('<required_conclusion>'+xmlEscape(packet.claimPlan.requiredConclusion)+'</required_conclusion>');
      lines.push('<approved_claims>');packet.claimPlan.approvedClaims.forEach(function(x,idx){lines.push('<claim id="A'+(idx+1)+'">'+xmlEscape(x)+'</claim>');});lines.push('</approved_claims>');
      if(packet.claimPlan.claimEvidence&&packet.claimPlan.claimEvidence.length){lines.push('<claim_evidence counting="same_structure_never_adds_weight_twice">');packet.claimPlan.claimEvidence.forEach(function(link){var uids=claimEvidenceUids(packet,link);if(uids.length)lines.push('<support claim="A'+link.claimIndex+'" evidence="'+uids.join(',')+'"></support>');else lines.push('<support claim="A'+link.claimIndex+'" basis="rule_limit"></support>');});lines.push('</claim_evidence>');}
      lines.push('<forbidden_claims>');packet.claimPlan.forbiddenClaims.forEach(function(x){lines.push('<claim>'+xmlEscape(x)+'</claim>');});lines.push('</forbidden_claims>');
      lines.push('</claim_plan>');

      var sc=packet.modernContext&&packet.modernContext.spreadContext;
      if(sc){
        lines.push('<spread_context certainty_effect="none" use="describe_approved_claims_only">');
        if(sc.core&&sc.core.length)lines.push('<core>'+sc.core.map(function(p){return cardLabel(p.card);}).join(' | ')+'</core>');
        if(sc.nearField&&sc.nearField.length)lines.push('<near_field>'+sc.nearField.map(function(p){return cardLabel(p.card);}).join(' | ')+'</near_field>');
        if(sc.balancedPairs&&sc.balancedPairs.length){lines.push('<balanced_pairs>');sc.balancedPairs.forEach(function(pair,idx){if(pair.length===2)lines.push('B'+(idx+1)+' '+pair.map(function(p){return cardLabel(p.card);}).join(' ↔ '));});lines.push('</balanced_pairs>');}
        if(sc.lines&&sc.lines.length){lines.push('<layout_lines>');sc.lines.slice(0,8).forEach(function(line){lines.push((line.id||'L')+' '+xmlEscape(line.type||'連續線')+'='+line.positions.map(function(p){return cardLabel(p.card);}).join(' → '));});lines.push('</layout_lines>');}
        if(sc.focalNeighborhoods&&sc.focalNeighborhoods.length){lines.push('<focal_neighborhoods>');sc.focalNeighborhoods.forEach(function(nb,idx){lines.push('N'+(idx+1)+' '+cardLabel(nb.center.card)+'周圍〔'+nb.positions.map(function(p){return cardLabel(p.card);}).join('、')+'〕');});lines.push('</focal_neighborhoods>');}
        if(sc.houses&&sc.houses.length){lines.push('<house_context>');sc.houses.forEach(function(h){lines.push(cardLabel(h.card)+'落'+cardLabel(h.house)+'宮');});lines.push('</house_context>');}
        lines.push('</spread_context>');
      }

      if(type==='unsupported_age'||type==='health_medical_cause'||type==='timing'){
        lines.push('<analysis_requirements mode="necessary_limit_only"></analysis_requirements>');
      }else{
        var analysisContract=buildEvidenceAwareAnalysisRequirements(packet);
        var claimIds=packet.claimPlan.approvedClaims.map(function(_,idx){return 'A'+(idx+1);}).join(',');
        lines.push('<analysis_requirements mode="claim_bound" claims="'+claimIds+'" paragraph_range="'+analysisContract.paragraphMin+'-'+analysisContract.paragraphMax+'" favorable="'+analysisContract.favorable+'" risk="'+analysisContract.risk+'" repetition="'+analysisContract.repetition+'" contradiction="'+analysisContract.contradiction+'" manifestation="conditional_symbolic_only" unknown_boundary="required"></analysis_requirements>');
      }
      lines.push('</evidence_packet>');
    });
    lines.push('<approved_dictionary>');
    lines.push(Object.keys(globalUsedCards).map(function(id){var c=globalUsedCards[id];return cardLabel(c)+'='+c.key;}).join('；'));
    if(typeSet.sexual_component||typeSet.sexual_event)lines.push('；情境限定：30.百合=本站可選的感官／肉體享受提示；7.蛇=誘惑／複雜風險修飾，不能單獨證明性成分；34.魚不得轉義為性慾；11.鞭子不得轉義為性行為');
    lines.push('</approved_dictionary>');
  }
  lines.push('</reading_request>');
  lines.push('');
  lines.push('# 輸出契約');
  lines.push('第一句依 proposition 順序回答全部命題。');
  if(typeSet.business_success||typeSet.debt_clearance||typeSet.positive_net_worth||typeSet.timing)lines.push('成功、清債、正資產與時間彼此獨立，不得互相代證。');
  if(isSymmetricComparison){
    lines.push('比較題第一句直接說A、B哪個較適合，或明說差距不足；正文依序處理A、B、共同決策核心與取捨。');
    lines.push('比較證據引用：O-A／O-B寫選項位置；X-C寫中央共同軸；X1／X2／X3寫完整左右配對列。');
  }
  lines.push('正文逐項轉寫 approved_claims；不得新增主張。每個有證據的主張只能引用 claim_evidence 指向的D／S；D是主要語句，S是較低權重短句。');
  lines.push('每段只處理一項 approved_claim；末尾只列實際使用的證據：D寫「牌A＆牌B」，S寫「牌A→牌B→牌C」。相同 evidence 即使被相依命題引用，也不得重複提高確定度；不得輸出 evidence id。');
  lines.push('正文使用繁體中文與台灣用語，不寫座標、排數、演算法、分數或內部檢查。');
  lines.push('');
  lines.push('<presentation_footer mode="interpretation_aligned">');
  appendStoneRecommendationPrompt(lines,q,questions,stoneEvidence,xmlEscape);
  lines.push('<shop_link>[靜月之光蝦皮賣場](https://shopee.tw/a50h95648d?tab=shop)</shop_link>');
  lines.push('<closing>願你諸事順遂。</closing>');
  lines.push('</presentation_footer>');
  lines.push('');
  lines.push('只輸出最終解讀。正文後依stone_recommendation輸出一行推薦或「本題不強行推薦水晶。」，再逐字附上賣場與祝福兩行。');
  return lines.join('\n');
}


// ════════════════════════════════════
// 五、Overlay UI（整合進 index.html）
// ════════════════════════════════════
var _lnWrap = null;
var _lnPhase = 'input'; // input | result
var _lastPrompt = '';

function _getWrap() {
  if (!_lnWrap) {
    _lnWrap = document.createElement('div');
    _lnWrap.id = 'ln-screen';
    _lnWrap.style.cssText = 'display:none;position:fixed;top:0;left:0;right:0;bottom:0;width:100%;height:100%;z-index:99999;overflow-y:auto;overflow-x:hidden;background:#0a0a0f;-webkit-overflow-scrolling:touch;';
    document.body.appendChild(_lnWrap);
    // Inject CSS
    var css = document.createElement('style');
    css.textContent = [
      '#ln-screen *{box-sizing:border-box}',
      '.ln-container{max-width:480px;margin:0 auto;padding:1rem .8rem 3rem;font-family:"Noto Serif TC",Georgia,serif;color:#e8e0d0}',
      '.ln-header{text-align:center;padding:1.5rem 0 1rem}',
      '.ln-header h1{font-size:1.5rem;color:#c9a84c;letter-spacing:8px;margin-bottom:.3rem}',
      '.ln-header p{font-size:.75rem;color:rgba(232,224,208,.5);letter-spacing:2px}',
      '.ln-back{color:rgba(232,224,208,.5);text-decoration:none;font-size:.82rem;display:inline-block;margin-bottom:.5rem}',
      '.ln-section{background:#13131a;border:1px solid rgba(201,168,76,.15);border-radius:14px;padding:1.1rem;margin-bottom:.8rem}',
      '.ln-section-title{font-size:.82rem;color:#c9a84c;margin-bottom:.7rem}',
      '.ln-q-input{width:100%;padding:.65rem;border-radius:10px;border:1px solid rgba(201,168,76,.3);background:rgba(255,255,255,.03);color:#e8e0d0;font-family:inherit;font-size:.85rem;resize:none;outline:none;line-height:1.6}',
      '.ln-q-input::placeholder{color:rgba(232,224,208,.4)}',
      '.ln-q-input:focus{border-color:rgba(201,168,76,.5);box-shadow:0 0 12px rgba(201,168,76,.1)}',
      '.ln-spread-grid{display:grid;grid-template-columns:1fr 1fr;gap:.45rem}',
      '.ln-spread-btn{padding:.6rem .4rem;border-radius:10px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.03);color:rgba(232,224,208,.5);cursor:pointer;transition:all .2s;text-align:center;font-family:inherit;font-size:.8rem}',
      '.ln-spread-btn.active{border-color:rgba(201,168,76,.5);background:rgba(201,168,76,.08);color:#c9a84c}',
      '.ln-spread-auto{grid-column:1/-1;background:linear-gradient(135deg,rgba(201,168,76,.1),rgba(201,168,76,.03));border-color:rgba(201,168,76,.3);color:rgba(232,224,208,.8)}',
      '.ln-spread-auto.active{border-color:rgba(243,224,160,.6);background:linear-gradient(135deg,rgba(201,168,76,.18),rgba(201,168,76,.06));color:#f3e0a0;box-shadow:0 0 16px rgba(201,168,76,.15)}',
      '.ln-auto-note{font-size:.72rem;color:rgba(201,168,76,.85);background:rgba(201,168,76,.07);border:1px solid rgba(201,168,76,.18);border-radius:10px;padding:.5rem .7rem;margin:-.2rem 0 .7rem;line-height:1.5}',
      '.ln-draw-btn{display:block;width:100%;padding:.85rem;border-radius:12px;border:1.5px solid rgba(201,168,76,.5);background:linear-gradient(135deg,rgba(201,168,76,.12),rgba(201,168,76,.04));color:#c9a84c;font-family:inherit;font-size:.95rem;font-weight:600;letter-spacing:4px;cursor:pointer;transition:all .3s;margin-top:.8rem}',
      '.ln-draw-btn:active{transform:scale(.97)}',
      '.ln-cards-row{display:flex;flex-wrap:wrap;justify-content:center;gap:.35rem;margin:.6rem 0}',
      '.ln-card{width:68px;padding:.25rem;border-radius:10px;border:1px solid rgba(201,168,76,.3);background:linear-gradient(145deg,rgba(30,25,15,.9),rgba(20,15,10,.95));text-align:center;animation:lnIn .4s ease-out both;overflow:hidden}',
      '@keyframes lnIn{from{opacity:0;transform:translateY(12px) scale(.9)}to{opacity:1;transform:none}}',
      '.ln-card-img{width:100%;border-radius:6px;display:block}',
      '.ln-card-name{font-size:.65rem;color:#e8e0d0;font-weight:600;margin-top:.2rem}',
      '.ln-card-en{font-size:.5rem;color:rgba(232,224,208,.4)}',
      '.ln-grid-3x3{display:grid;grid-template-columns:repeat(3,1fr);gap:.35rem;max-width:260px;margin:0 auto}',
      '.ln-ai-card{background:linear-gradient(135deg,rgba(30,25,15,.95),rgba(20,15,8,.98));border:1px solid rgba(201,168,76,.3);border-radius:14px;padding:1rem;margin-top:1rem;text-align:center;animation:lnIn .6s ease-out}',
      '.ln-ai-title{font-size:.95rem;color:#c9a84c;letter-spacing:3px;margin-bottom:.5rem}',
      '.ln-ai-desc{font-size:.72rem;color:rgba(232,224,208,.5);line-height:1.6;margin-bottom:.7rem}',
      '.ln-ai-copy-btn{display:block;width:100%;padding:.75rem;border-radius:12px;border:1.5px solid rgba(201,168,76,.5);background:linear-gradient(135deg,rgba(201,168,76,.12),rgba(201,168,76,.04));color:#c9a84c;font-family:inherit;font-size:.88rem;font-weight:600;letter-spacing:3px;cursor:pointer;transition:all .3s;margin-bottom:.5rem}',
      '.ln-ai-copy-btn:active{transform:scale(.97)}',
      '.ln-ai-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:.3rem;margin:.5rem 0}',
      '.ln-ai-sc{display:flex;flex-direction:column;align-items:center;gap:.2rem;padding:.35rem .1rem;border-radius:10px;border:1px solid rgba(255,255,255,.06);background:rgba(255,255,255,.02);cursor:pointer;transition:all .2s;font-family:inherit}',
      '.ln-ai-sc:active{transform:scale(.91)}',
      '.ln-ai-sc img{width:30px;height:30px;border-radius:8px}',
      '.ln-ai-sc span{font-size:.55rem;color:rgba(232,224,208,.5);font-weight:600}',
      '.ln-ai-foot{font-size:.6rem;color:rgba(232,224,208,.4);margin-top:.3rem;font-style:italic}',
      '.ln-reset-btn{display:inline-block;padding:.45rem 1rem;border-radius:10px;border:1px solid rgba(255,255,255,.1);background:transparent;color:rgba(232,224,208,.5);cursor:pointer;font-family:inherit;font-size:.78rem;margin-top:.8rem}',
      '.ln-footer{text-align:center;font-size:.6rem;color:rgba(232,224,208,.4);margin-top:1.5rem;letter-spacing:1px;line-height:1.8}',
    ].join('\n');
    document.head.appendChild(css);
  // ═══ 鎏金夜祭 v2（2026/6/10）：視圖升級層——第二樣式表 append-only，同表後者勝、整段可刪回退；流光動畫引用 style.css v81.0 全域 keyframes（jyGiltFlow），快取舊版時退化為靜態鎏金，無害 ═══
  try{var _g2=document.createElement('style');_g2.setAttribute('data-jy-gilt2','lenormand');_g2.textContent='.ln-section{background:linear-gradient(180deg,rgba(24,20,14,.78),rgba(14,12,9,.86));border:1px solid rgba(201,168,76,.2);border-radius:18px;box-shadow:0 18px 40px rgba(0,0,0,.45),inset 0 1px 0 rgba(245,231,184,.14);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px)}.ln-section-title{position:relative;padding-left:12px;letter-spacing:.08em;color:#e8d28a}.ln-section-title::before{content:"";position:absolute;left:0;top:50%;transform:translateY(-50%);width:3px;height:1.05em;border-radius:2px;background:rgba(226,232,240,.85);box-shadow:0 0 8px rgba(226,232,240,.85)}.ln-q-input{background:rgba(8,7,5,.62);border:1px solid rgba(201,168,76,.26);border-radius:12px;color:#f2e9d6;transition:border-color .2s,box-shadow .2s}.ln-q-input:focus{border-color:#e8d28a;box-shadow:0 0 0 3px rgba(201,168,76,.16);outline:none}.ln-spread-btn{background:rgba(201,168,76,.06);border:1px solid rgba(201,168,76,.22);color:#d8c79a;border-radius:12px;transition:color .18s,background-color .18s,border-color .18s,box-shadow .18s,transform .18s}.ln-spread-btn.active{background:linear-gradient(135deg,#e8d28a,#c9a84c);color:#171208;border-color:transparent;box-shadow:0 6px 18px rgba(201,168,76,.28);font-weight:700}.ln-spread-auto{border:1px solid rgba(232,210,138,.55);box-shadow:0 0 0 1px rgba(201,168,76,.18),0 8px 22px rgba(201,168,76,.16);border-radius:14px}.ln-draw-btn{background:linear-gradient(135deg,#a98232 0%,#e8d28a 44%,#f5e7b8 58%,#c9a84c 100%);background-position:center;color:#171208;border:none;border-radius:14px;font-weight:800;letter-spacing:.14em;box-shadow:0 10px 26px rgba(201,168,76,.32),inset 0 1px 0 rgba(255,255,255,.35)}.ln-draw-btn:active{transform:translateY(1px)}.ln-reset-btn{background:transparent;border:1px solid rgba(201,168,76,.34);color:#cdb87f;border-radius:12px}.ln-back{color:rgba(232,210,138,.75)}.ln-back:hover{color:#f5e7b8}.ln-card{background:linear-gradient(180deg,rgba(26,24,20,.9),rgba(15,13,10,.94));border:1px solid rgba(226,232,240,.16);border-radius:12px;box-shadow:0 10px 26px rgba(0,0,0,.5),inset 0 1px 0 rgba(245,231,184,.1)}.ln-grid-3x3{gap:10px}.ln-ai-card{background:linear-gradient(180deg,rgba(24,20,14,.78),rgba(14,12,9,.86));border:1px solid rgba(201,168,76,.2);border-radius:18px;box-shadow:0 18px 40px rgba(0,0,0,.45),inset 0 1px 0 rgba(245,231,184,.14);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px)}@supports not (backdrop-filter:blur(1px)){[data-jy-view-lenormand]{}}.ln-draw-btn:focus-visible{outline:2px solid #e8d28a;outline-offset:2px}';document.head.appendChild(_g2);}catch(e){}
  }
  return _lnWrap;
}

var AI_LIST = [
  {id:'chatgpt',name:'ChatGPT',url:'https://chatgpt.com/'},
  {id:'claude',name:'Claude',url:'https://claude.ai/new'},
  {id:'gemini',name:'Gemini',url:'https://gemini.google.com/app'},
  {id:'grok',name:'Grok',url:'https://grok.x.ai/'},
  {id:'deepseek',name:'DeepSeek',url:'https://chat.deepseek.com/'},
  {id:'kimi',name:'Kimi',url:'https://kimi.moonshot.cn/'},
  {id:'doubao',name:'豆包',url:'https://www.doubao.com/'},
  {id:'metaai',name:'Meta AI',url:'https://www.meta.ai/'},
  {id:'copilot',name:'Copilot',url:'https://copilot.microsoft.com/'},
  {id:'perplexity',name:'Perplexity',url:'https://www.perplexity.ai/'}
];

function _render() {
  // v3.2 根治：重繪會銷毀並重建 textarea——任何觸發 _render 的按鈕（牌陣/指示牌/性別/未來新增）
  //   都曾或將把使用者打到一半的問題刷掉。收口在唯一入口：重建前先把現值回存 _lnQuestion，
  //   不再要求每個按鈕各自記得先存（v2.x 只有 _lnSetSpread 有存，_lnSetSig/_lnSetGender 漏了＝實測問題被清空的根因）。
  var _qNow = document.getElementById('ln-q');
  if (_qNow) _lnQuestion = _qNow.value;
  var w = _getWrap();
  var h = '<div class="ln-container">';
  h += '<a href="javascript:void(0)" class="ln-back" onclick="_lenormandClose()">← 返回靜月之光</a>';
  h += '<div class="ln-header"><h1>雷 諾 曼</h1><p>Petit Lenormand ・ 36 張</p></div>';

  if (_lnPhase === 'input') {
    // Question
    h += '<div class="ln-section"><div class="ln-section-title">✦ 你想問什麼？</div>';
    h += '<textarea class="ln-q-input" id="ln-q" rows="2" maxlength="200" placeholder="問越具體越準——例如：這份工作值得繼續嗎？">' + (_lnQuestion||'') + '</textarea></div>';
    // Spread
    h += '<div class="ln-section"><div class="ln-section-title">✦ 選擇牌陣</div><div class="ln-spread-grid">';
    var sps = [{id:'auto',n:'✦ 自動判斷',d:'依你的問題智慧選擇最適合的牌陣（推薦）'},{id:'three',n:'三張線',d:'快速是非題'},{id:'five',n:'五張線',d:'因果時間線'},{id:'nine',n:'九宮格',d:'3×3 深度分析'},{id:'grand',n:'大牌陣',d:'全36張完整牌陣'}];
    for (var i=0;i<sps.length;i++) {
      h += '<button class="ln-spread-btn' + (sps[i].id===_lnSpread?' active':'') + (sps[i].id==='auto'?' ln-spread-auto':'') + '" onclick="_lnSetSpread(\''+sps[i].id+'\')">' + sps[i].n + '<br><span style="font-size:.6rem;opacity:.6">' + sps[i].d + '</span></button>';
    }
    h += '</div></div>';
    // v3.0：指示牌（Significator）
    h += '<div class="ln-section"><div class="ln-section-title">✦ 指示牌（代表你的牌，可選）</div>';
    h += '<div style="display:flex;flex-wrap:wrap;gap:.45rem">';
    h += '<button class="ln-spread-btn' + (_lnSignif===null?' active':'') + '" onclick="_lnSetSig(null)">不使用</button>';
    h += '<button class="ln-spread-btn' + (_lnSignif===28?' active':'') + '" onclick="_lnSetSig(28)">男士(28)</button>';
    h += '<button class="ln-spread-btn' + (_lnSignif===29?' active':'') + '" onclick="_lnSetSig(29)">女士(29)</button>';
    var _sigCustom = (_lnSignif!==null && _lnSignif!==28 && _lnSignif!==29);
    h += '<button class="ln-spread-btn' + (_sigCustom?' active':'') + '" onclick="_lnSigPickOpen()">' + (_sigCustom ? ('自選：' + _lnSignif + '.' + (CARDS[_lnSignif-1]||{}).name) : '自選一張') + '</button>';
    h += '</div>';
    h += '<div class="ln-auto-note" style="margin-top:.5rem">男士／女士代表你本人；自選任一張可作主題定位（如問財選魚34、問感情選心24）。九宮格會把指示牌置於中央（本站圍繞法）；二選一比較題改用左右對稱九宮格，會忽略指示牌以保持兩邊公平；大牌陣的非人物指示牌只作次要焦點，主要人物牌仍依問卜者性別判定；三張／五張線只作主題透鏡。</div></div>';
    // v3.1：性別聲明（人物牌歸屬與 GT 代表牌的權威來源；可不選）
    h += '<div class="ln-section"><div class="ln-section-title">✦ 你的性別（可選——抽到淑女/紳士時歸屬會更準）</div>';
    h += '<div style="display:flex;flex-wrap:wrap;gap:.45rem">';
    h += '<button class="ln-spread-btn' + (_lnGender===null?' active':'') + '" onclick="_lnSetGender(null)">不指定</button>';
    h += '<button class="ln-spread-btn' + (_lnGender==='male'?' active':'') + '" onclick="_lnSetGender(\'male\')">男</button>';
    h += '<button class="ln-spread-btn' + (_lnGender==='female'?' active':'') + '" onclick="_lnSetGender(\'female\')">女</button>';
    h += '</div></div>';
    h += '<button class="ln-draw-btn" onclick="_lnDoDraw()">✦ 抽 牌 ✦</button>';
  } else {
    // Results
    var sp = SPREADS[_lnResolved];
    var _cmpTitle=detectComparisonQuestion(_lnQuestion);
    h += '<div class="ln-section"><div class="ln-section-title">✦ ' + (_cmpTitle&&_lnResolved==='nine'?'對稱比較九宮格':sp.name) + '（' + sp.count + ' 張）</div>';
    if (_lnAutoPick) h += '<div class="ln-auto-note">✦ 自動判斷：' + _lnAutoPick.why + '</div>';
    if (_lnSignif && !detectComparisonQuestion(_lnQuestion)) h += '<div class="ln-auto-note">✦ 指示牌：' + _lnSignif + '.' + ((CARDS[_lnSignif-1]||{}).name||'') + (_lnResolved==='nine' ? '（已置中央・圍繞法）' : _lnResolved==='grand' ? '（於 36 張中定位讀取）' : '（主題透鏡）') + '</div>';
    if (_lnResolved === 'nine') {
      h += '<div class="ln-grid-3x3">';
    } else {
      h += '<div class="ln-cards-row">';
    }
    for (var j=0;j<_lnDrawn.length;j++) {
      var c = _lnDrawn[j];
      var imgSrc = IMG_MAP[c.id] || '';
      h += '<div class="ln-card" style="animation-delay:'+j*0.05+'s">' + (c._presetSig ? '<div style="font-size:.6rem;color:#e8d28a;letter-spacing:.12em;margin-bottom:2px">★ 指示牌</div>' : '');
      if (imgSrc) h += '<img class="ln-card-img" src="'+imgSrc+'" alt="'+c.name+'">';
      h += '<div class="ln-card-name">' + c.id + '. ' + c.name + '</div>';
      h += '<div class="ln-card-en">' + c.en + '</div>';
      var _cmpRender=detectComparisonQuestion(_lnQuestion);if(_lnResolved==='nine'&&_cmpRender){var _pl=comparisonPositionLabels(_cmpRender)[j];h+='<div style="font-size:.52rem;color:#e8d28a;line-height:1.3;margin-top:3px">'+_pl+'</div>';}
      h += '</div>';
    }
    h += '</div></div>';

    // AI card
    h += '<div class="ln-ai-card"><div class="ln-ai-title">🌙 AI 深度解讀</div>';
    h += '<div class="ln-ai-desc">輕觸按鈕複製，貼到 AI 對話送出即可。</div>';
    h += '<button class="ln-ai-copy-btn" onclick="_lnCopy()">✦ 一鍵複製占卜提示詞 ✦</button>';
    h += '<div class="ln-ai-grid">';
    for (var a=0;a<AI_LIST.length;a++) {
      var ai = AI_LIST[a];
      h += '<button class="ln-ai-sc" onclick="_lnOpenAI(\''+ai.id+'\',\''+ai.url+'\',this)">';
      h += '<img src="ai-icons/ai-'+ai.id+'.png" alt="'+ai.name+'">';
      h += '<span>'+ai.name+'</span></button>';
    }
    h += '</div><div class="ln-ai-foot">點擊 AI 按鈕 → 自動複製＋開啟 → 貼上送出</div></div>';
    h += '<div style="text-align:center;margin-top:.2rem"><button onclick="_lenormandShare()" style="padding:.72rem 1.5rem;border-radius:12px;border:1px solid rgba(201,168,76,.5);background:linear-gradient(135deg,rgba(201,168,76,.18),rgba(201,168,76,.05));color:#c9a84c;font-family:inherit;font-size:.92rem;font-weight:600;letter-spacing:1px;cursor:pointer">\uD83D\uDCE4 \u751F\u6210\u5206\u4EAB\u5361</button></div>';
    h += '<div style="text-align:center"><button class="ln-reset-btn" onclick="_lnReset()">↺ 重新抽牌</button></div>';
  }
  h += '<div class="ln-footer">靜月之光 ・ jingyue.uk<br>Petit Lenormand 雷諾曼牌</div></div>';
  w.innerHTML = h;
}

// ════ Public API ════
window._lenormandOpen = function() {
  _lnPhase = 'input';
  _lnQuestion = '';
  _lnSpread = 'auto';
  _lnResolved = 'three';
  _lnAutoPick = null;
  _lnDrawn = [];
  _lastPrompt = '';
  var w = _getWrap();
  w.style.display = 'block';
  _render();
  w.scrollTop = 0;
};

window._lenormandShare = function() {
  if (!window.JYShareCard) { alert('\u5206\u4EAB\u5143\u4EF6\u8F09\u5165\u4E2D\uFF0C\u8ACB\u7A0D\u5019\u518D\u8A66'); return; }
  var sp = SPREADS[_lnResolved] || {};
  var _cmpShare=detectComparisonQuestion(_lnQuestion);
  var pos = (_lnResolved==='nine' && _cmpShare) ? comparisonPositionLabels(_cmpShare) : (sp.positions || []);
  var cards = (_lnDrawn || []).map(function(c, i) {
    var pl = (pos[i] || ('\u7B2C' + (i + 1) + '\u5F35'));
    pl = String(pl).split('/').pop();
    // v3.3：補傳 id/img/sig——share-card v2.0 起依牌陣張數排版並繪真牌面（img 同源資產、畫布無汙染）
    return { id: c.id, name: c.name || '', pos: pl, img: (typeof IMG_MAP !== 'undefined' && IMG_MAP[c.id]) || '', sig: !!c._presetSig };
  });
  JYShareCard.open('lenormand', {
    cardTitle: '\u6211\u7684\u96F7\u8AFE\u66FC',
    spread: ((_cmpShare&&_lnResolved==='nine')?'對稱比較九宮格':(sp.name || '\u96F7\u8AFE\u66FC')) + (sp.count ? '\uFF08' + sp.count + '\u5F35\uFF09' : ''),
    question: _lnQuestion || '',
    cards: cards
  });
};

window._lenormandClose = function() {
  var w = _getWrap();
  w.style.display = 'none';
};

window._lnSetSpread = function(id) {
  // v3.2：問題文字回存已收口至 _render() 入口，這裡不再各自處理
  _lnSpread = id;
  _render();
};

window._lnDoDraw = function() {
  var qEl = document.getElementById('ln-q');
  _lnQuestion = qEl ? qEl.value.trim() : '';
  // v2.6：auto 解析（手動選陣則原樣使用）
  _lnAutoPick = null;
  var _comparison=detectComparisonQuestion(_lnQuestion);
  var _resolved=resolveSpreadForQuestion(_lnQuestion,_lnSpread);
  _lnResolved=_resolved.id;
  if(_lnSpread==='auto'||_resolved.forced)_lnAutoPick={id:_resolved.id,why:_resolved.why};
  var sp = SPREADS[_lnResolved];
  // 九宮格＋自選焦點牌：本站採用的現代圍繞法；預置中央後再抽八張，池先移除焦點牌避免重複
  if (_lnResolved === 'nine' && _lnSignif && !_comparison) {
    shuffleDeck();
    _lnDeck = _lnDeck.filter(function (c) { return c.id !== _lnSignif; });
    var _sigCard = JSON.parse(JSON.stringify(CARDS[_lnSignif - 1]));
    _sigCard._presetSig = true;
    _lnDrawn = _lnDeck.slice(0, 8);
    _lnDrawn.splice(4, 0, _sigCard);
  } else {
    drawCards(sp.count);
  }
  if (_lnGender) _lnSigGender = _lnGender; // v3.1：聲明性別優先
  _lastPrompt = buildPrompt(_lnQuestion, _lnDrawn, _lnResolved, _lnSigGender, _lnGender);
  _lnPhase = 'result';
  _render();
  _getWrap().scrollTop = 0;
};

// v3.0：指示牌選擇
window._lnSetGender = function (g) {
  _lnGender = g;
  try { if (g) localStorage.setItem('jy_ln_gender', g); else localStorage.removeItem('jy_ln_gender'); } catch (e) {}
  if (g) _lnSigGender = g;
  _render();
};
window._lnSetSig = function (id) {
  _lnSignif = id;
  if (id === 28) { _lnSigGender = 'male'; _lnGender = 'male'; try { localStorage.setItem('jy_ln_gender', 'male'); } catch (e) {} }
  if (id === 29) { _lnSigGender = 'female'; _lnGender = 'female'; try { localStorage.setItem('jy_ln_gender', 'female'); } catch (e) {} }
  var ov = document.getElementById('ln-sig-ov'); if (ov) ov.remove();
  _render();
};
window._lnSigPickOpen = function () {
  // v3.0.1：①modal 改掛進視圖容器且 z-index 100000——原掛 body z-index 9999 被 ln-screen(99999) 蓋住，
  //   實測「按了沒反應、退出畫面才跑出來」；②選牌格上真實牌面圖（IMG_MAP），無圖時退回純文字。
  var _old = document.getElementById('ln-sig-ov'); if (_old) _old.remove();
  var ov = document.createElement('div'); ov.id = 'ln-sig-ov';
  ov.style.cssText = 'position:fixed;inset:0;z-index:100000;background:rgba(8,7,5,.86);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;padding:14px';
  var bx = '<div style="max-width:560px;width:100%;max-height:82vh;overflow:auto;background:rgba(20,17,12,.97);border:1px solid rgba(201,168,76,.35);border-radius:18px;padding:14px;box-shadow:0 24px 60px rgba(0,0,0,.6)">';
  bx += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;position:sticky;top:-14px;background:rgba(20,17,12,.97);padding:6px 0;z-index:2"><b style="color:#e8d28a;letter-spacing:.1em">選擇指示牌</b><button onclick="document.getElementById(\'ln-sig-ov\').remove()" style="background:none;border:none;color:#cdb87f;font-size:1.25rem;cursor:pointer;padding:4px 8px">✕</button></div>';
  bx += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:9px">';
  for (var i = 0; i < CARDS.length; i++) {
    var c = CARDS[i];
    var _on = (_lnSignif === c.id);
    var _img = (typeof IMG_MAP !== 'undefined' && IMG_MAP[c.id]) ? IMG_MAP[c.id] : '';
    bx += '<button onclick="_lnSetSig(' + c.id + ')" style="padding:.45rem .3rem .55rem;border-radius:12px;border:1.5px solid rgba(201,168,76,' + (_on ? '.85' : '.25') + ');background:rgba(201,168,76,' + (_on ? '.14' : '.04') + ');color:#e9dec0;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:6px' + (_on ? ';box-shadow:0 0 0 1px rgba(201,168,76,.3),0 6px 16px rgba(201,168,76,.18)' : '') + '">';
    if (_img) bx += '<img src="' + _img + '" alt="' + c.name + '" loading="lazy" style="width:100%;aspect-ratio:2/3;object-fit:cover;border-radius:8px;display:block">';
    bx += '<span style="font-size:.78rem;line-height:1.2">' + c.id + '. ' + c.name + '</span></button>';
  }
  bx += '</div></div>'; ov.innerHTML = bx;
  ov.onclick = function (e) { if (e.target === ov) ov.remove(); };
  (_getWrap() || document.body).appendChild(ov);
};

window._lnCopy = function() {
  if (!_lastPrompt) return;
  try {
    navigator.clipboard.writeText(_lastPrompt).then(function(){
      var btn = document.querySelector('.ln-ai-copy-btn');
      if(btn){var o=btn.innerHTML;btn.innerHTML='✓ 已複製！貼到 AI 送出即可';btn.style.borderColor='rgba(52,211,153,.5)';setTimeout(function(){btn.innerHTML=o;btn.style.borderColor='';},2500);}
    });
  } catch(e) {
    var ta=document.createElement('textarea');ta.value=_lastPrompt;ta.style.cssText='position:fixed;left:-9999px';document.body.appendChild(ta);ta.select();document.execCommand('copy');document.body.removeChild(ta);
  }
};

window._lnOpenAI = function(id, url, btn) {
  if (!_lastPrompt) return;
  try {
    navigator.clipboard.writeText(_lastPrompt).then(function(){
      var s=btn.querySelector('span');if(s)s.textContent='已複製！';
      setTimeout(function(){window.open(url,'_blank');},300);
      var names={chatgpt:'ChatGPT',claude:'Claude',gemini:'Gemini',grok:'Grok',deepseek:'DeepSeek',kimi:'Kimi',doubao:'豆包',metaai:'Meta AI',copilot:'Copilot',perplexity:'Perplexity'};
      setTimeout(function(){if(s)s.textContent=names[id]||id;},2000);
    });
  } catch(e){window.open(url,'_blank');}
};

window._lnReset = function() {
  _lnPhase = 'input';
  _render();
  _getWrap().scrollTop = 0;
};

// 僅供自動測試使用；不參與正式 UI 與讀牌結果。
window.__JY_LN_TEST__ = {
  detectComparisonQuestion: detectComparisonQuestion,
  resolveSpreadForQuestion: resolveSpreadForQuestion,
  comparisonPositionLabels: comparisonPositionLabels,
  buildComparisonNinePacket: buildComparisonNinePacket,
  inferQuestionDimensions: inferQuestionDimensions,
  primaryDecisionType: primaryDecisionType,
  splitQuestionSegments: splitQuestionSegments,
  buildGrandGeometry: buildGrandGeometry,
  buildSpreadGeometry: buildSpreadGeometry,
  buildEvidencePacket: buildEvidencePacket,
  buildApprovedEvidenceView: buildApprovedEvidenceView,
  assignGlobalEvidenceUids: assignGlobalEvidenceUids,
  buildGlobalEvidenceLedger: buildGlobalEvidenceLedger,
  enforceGlobalClaimEvidenceUniqueness: enforceGlobalClaimEvidenceUniqueness,
  buildClaimPlan: buildClaimPlan,
  compileFormulaClaimPlan: compileFormulaClaimPlan,
  compileLayeredClaimPlan: compileLayeredClaimPlan,
  canonicalFormula: CANONICAL_READING_FORMULA,
  propositionFormulas: PROPOSITION_FORMULAS,
  formulaGroups: FORMULA_GROUPS,
  buildQuestionFocusProfile: buildQuestionFocusProfile,
  collectApprovedEvidenceLedger: collectApprovedEvidenceLedger,
  claimEvidenceUids: claimEvidenceUids,
  validateEvidencePacket: validateEvidencePacket,
  buildModernContext: buildModernContext,
  analysisDimensionsFor: analysisDimensionsFor,
  buildEvidenceAwareAnalysisRequirements: buildEvidenceAwareAnalysisRequirements,
  buildStoneRecommendationCandidates: buildStoneRecommendationCandidates,
  buildPrompt: buildPrompt,
  cards: CARDS,
  spreads: SPREADS
};

})();
