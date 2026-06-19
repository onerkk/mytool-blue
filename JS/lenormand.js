// ═══════════════════════════════════════
// 靜月之光 — 雷諾曼牌 Lenormand v5.5
// v5.5（2026-06-19）性題證據歸屬／原子分簇／提示詞再收斂根治：
//   1. 桃花機會、感官／性成分、實際事件維持三個獨立門檻；使用者指定的「今年」只作評估範圍，不授權推算日期。
//   2. 百合是本站可選的現代感官提示；蛇只作誘惑／複雜風險修飾，蛇單獨不得建立性成分。
//   3. 性成分必須連到同一桃花／人物／關係焦點；單純「問卜者＋蛇」不得寫成該假設桃花有性吸引。
//   4. attraction／sexual_component／sexual_event 依證據角色原子分簇，正向、風險、關係落實不再塞進同一 C。
//   5. 每項主張最多兩個 C，且同一 C 不得跨主張重用；claim_evidence 真正獨占，避免同證據灌票。
//   6. 長線只有焦點間距足夠接近才可支撐主張；題外中間牌不再把遠端人物硬連成吸引或事件。
//   7. 性／桃花提示詞只輸出最小核准證據，不再重複 selected_context 主題摘要；新增反例與時間範圍輸出測試。
// Petit Lenormand 36 張・歷史基線＋本站明示的現代判讀規約
// ═══════════════════════════════════════
(function () {
'use strict';
console.log('[Lenormand] 靜月之光 雷諾曼牌 v5.5 loaded — 性題證據歸屬／原子分簇／提示詞再收斂根治');

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
    desc:'三張線讀。中間牌是焦點，左右相鄰牌修飾；可輔助看左到右的時間推進，但核心仍是組合義，不是塔羅式單張位置。',
    positions:['左側修飾/前因','焦點','右側修飾/發展']
  },
  five: { id:'five', name:'五張線', en:'Five-Card Line', count:5,
    desc:'五張線讀。第3張是焦點；2-3-4 是近身故事，1-2 與 4-5 看延伸。左到右可看時間流，但不能逐張單獨解。',
    positions:['左外修飾','左近修飾','焦點','右近修飾','右外修飾']
  },
  nine: { id:'nine', name:'九宮格', en:'Nine-Card Box (3×3)', count:9,
    desc:'3×3 Box。中心第5張是焦點；連續行列與對角線屬現代實務，須以相鄰組合與問題為主。',
    positions:['左上(過去+意識)','上中(意識)','右上(未來+意識)','左中(過去)','核心','右中(未來)','左下(過去+潛意識)','下中(潛意識)','右下(未來+潛意識)'],
    layout:'3x3'
  },
  grand: { id:'grand', name:'大牌陣', en:'Grand Tableau', count:36,
    desc:'全部36張排出。本站採4排8張＋末排4張置中於第3～6欄；人物牌及周圍為歷史基線，房屋與完整線段僅作後期／現代輔助。',
    positions:null, // special layout
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

  return { positions: positions, adjacency: adjacency, lines: lines };
}

var QUESTION_SCHEMAS = {
  comparison_suitability: {
    label:'二選一適配比較',
    core:[], support:[], contextual:[]
  },
  attraction_opportunity: {
    label:'桃花／吸引機會',
    core:[24,9,31,32],
    support:[16,17,1,12,20,25,33],
    contextual:[]
  },
  sexual_component: {
    label:'肉體／性吸引成分',
    core:[30],
    support:[7,24,25,9,31,32],
    contextual:[30,7]
  },
  sexual_event: {
    label:'實際肉體關係事件',
    core:[30,25],
    support:[7,24,1,12,31,33,4,8,10,21,6,23,19],
    contextual:[30,7]
  },
  relationship_longevity: {
    label:'關係穩定／正緣',
    core:[24,25], support:[4,35,5,33,31], contextual:[]
  },
  multi_partner_commitment: {
    label:'多人伴侶／一夫多妻',
    core:[24,25], support:[7,22,20], contextual:[]
  },
  relationship_intent: {
    label:'特定對象的感情意圖',
    core:[24,25], support:[18,12,27,20], contextual:[]
  },
  relationship_future: {
    label:'未來形成交往',
    core:[24,25], support:[4,35,5,31,33,1,17], contextual:[]
  },
  business_success: {
    label:'副業／商業成功',
    core:[34,35,31], support:[32,20,14,3,33], contextual:[]
  },
  career_fit: {
    label:'職涯適配／是否適合',
    core:[35,14], support:[4,5,30,24,33,19,21,36,8,7,22,23,11], contextual:[]
  },
  career_promotion: {
    label:'升遷／職位向上變動',
    core:[17,19,15], support:[31,33,27,1,32,35,14,21,36,8,22,7], contextual:[]
  },
  career_change: {
    label:'轉職／離職／錄取',
    core:[17,35,14], support:[1,27,33,31,21,22,8], contextual:[]
  },
  career_general: {
    label:'一般工作／職涯',
    core:[35,14], support:[19,15,31,33,27,17], contextual:[]
  },
  debt_clearance: {
    label:'負債完全清償', core:[15,34,36,23], support:[8,10,31,33,35,5], contextual:[]
  },
  positive_net_worth: {
    label:'淨資產轉正', core:[34,15,35], support:[4,5,31,33,23,36], contextual:[]
  },
  finance: {
    label:'一般財務', core:[34,15], support:[35,23,31,33,5,36], contextual:[]
  },
  timing: {
    label:'具體時間（未啟用）', core:[], support:[], contextual:[]
  },
  health_medical_cause: {
    label:'醫學病因／診斷限制', core:[], support:[], contextual:[]
  },
  health_symbolic_context: {
    label:'健康議題的象徵性狀態', core:[5], support:[8,10,23,36,31,21,11,35], contextual:[]
  },
  travel: {
    label:'旅行／移動', core:[3,17], support:[1,21,4], contextual:[]
  },
  communication: {
    label:'消息／溝通', core:[27,12], support:[1,20,6], contextual:[]
  },
  life_guidance: {
    label:'人生方向／迷茫建議',
    core:[33,22,16,24,35],
    support:[2,3,4,5,6,8,9,10,11,17,18,21,23,25,26,31,32,36],
    contextual:[]
  },
  unsupported_age: {
    label:'數字年齡（不可驗證）', core:[], support:[], contextual:[]
  },
  general: {
    label:'一般問題', core:[24,25,34,35,31,33], support:[6,8,10,21,23,36], contextual:[]
  }
};

var HARD_NEGATIVE_IDS = [6,8,10,11,21,23,36];
var ATTRACTION_POSITIVE_IDS = [9,16,17,24,25,31,32,33,1];
var SEXUAL_PRIMARY_IDS = [30];
var SEXUAL_MODIFIER_IDS = [7];
var SEXUAL_CONTEXT_IDS = [30,7];

var MODERN_THEME_GROUPS = [
  { id:'stability', label:'穩定／持續', cards:[4,5,25,30,35] },
  { id:'success_opening', label:'機會／成功／解答', cards:[1,2,9,16,31,33] },
  { id:'movement_change', label:'移動／改變／選擇', cards:[1,3,17,22] },
  { id:'communication_public', label:'溝通／公開／名聲', cards:[12,20,27,32] },
  { id:'relationship_bond', label:'情感／信任／承諾', cards:[18,24,25] },
  { id:'sexual_sensual', label:'肉體／感官／誘惑', cards:[7,30] },
  { id:'work_money_power', label:'工作／財務／權力', cards:[14,15,19,34,35] },
  { id:'ending_cut', label:'結束／切斷', cards:[8,10] },
  { id:'obstacle_burden', label:'阻礙／負擔', cards:[21,36] },
  { id:'loss_erosion', label:'損耗／侵蝕', cards:[23] },
  { id:'uncertainty_complexity', label:'不明／複雜／抉擇', cards:[6,7,22] },
  { id:'conflict_repetition', label:'衝突／反覆／焦慮', cards:[11,12] }
];

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
  var m = t.match(/今年|明年|後年|本月|下個月|未來\s*\d+\s*(?:天|週|月|年)內|\d+\s*(?:天|週|月|年)內|近期|接下來|什麼時候|何時|多久|幾時|哪一年|哪個月|幾月|時間點|應期|多快/);
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
  if (/正緣|命定|適合長久|走到最後|走一輩子|長久|穩定交往|穩定伴侶|結婚對象|婚姻能否長久/.test(t)) types.push('relationship_longevity');
  if (hasAttraction) types.push('attraction_opportunity');
  if (hasSexual) types.push('sexual_component');
  if (asksSexualEvent) types.push('sexual_event');
  if (hasRelationshipWords && (explicitFutureContext || targetScope === 'unknown_future_counterpart' || formationQuestion)) types.push('relationship_future');
  if (/喜歡我|愛我|好感|心動|真心|想(?:要)?(?:跟|與)?我(?:交往|在一起|復合)|會告白|對我有感覺|她怎麼想|他怎麼想|對方怎麼想/.test(t) && targetScope !== 'unknown_future_counterpart' && targetScope !== 'hypothetical_noncurrent_counterpart') types.push('relationship_intent');

  if (/副業|創業|生意|賣場|訂單|客戶|營收|業績|直播帶貨|商業|能成功|做得起來|賺錢/.test(t)) types.push('business_success');
  var asksDebtClear = /負債.{0,8}(?:完全)?(?:清空|清掉|清償|歸零|還清)|(?:完全)?(?:清空|清掉|清償|還清).{0,8}(?:負債|債務)|債務.{0,8}(?:歸零|清償|還清)/.test(t);
  var asksPositiveNetWorth = /正資產|淨資產.{0,6}(?:轉正|為正|正數)|資產.{0,4}(?:大於|超過).{0,4}負債/.test(t);
  if (asksDebtClear) types.push('debt_clearance');
  if (asksPositiveNetWorth) types.push('positive_net_worth');
  if (!asksDebtClear && !asksPositiveNetWorth && /財運|收入|存款|負債|投資|股票|貸款|金錢|錢|資金|還債|資產/.test(t)) types.push('finance');
  if (/適不適合.{0,8}(?:工作|職場|正職)|(?:工作|職場|正職|這份工作).{0,8}(?:適合|合適)|天職|適合我做|適合做下去/.test(t)) types.push('career_fit');
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
  if (/^business_|^career_|^finance$|^debt_clearance$|^positive_net_worth$/.test(type)) return 'work_money';
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
  var out = [];
  parts.forEach(function(text, index){ out = out.concat(expandSegmentToQuestions(text, index + 1)); });
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
  var roles = getPersonRoleIds(declaredGender), type = primaryDecisionType(questionItem.types || [questionItem.type]);
  var anchors = [], supports = [];
  if (type === 'unsupported_age' || type === 'health_medical_cause' || type === 'timing') return {anchors:[],supports:[],all:[],contextual:[]};
  if (roles.querent) anchors.push(roles.querent);
  var relationshipLike = questionTypeDomain(type) === 'relationship' || questionItem.targetScope !== 'unspecified';
  if (relationshipLike && roles.counterpart) anchors.push(roles.counterpart);
  var def = QUESTION_SCHEMAS[type] || QUESTION_SCHEMAS.general;
  anchors = anchors.concat(def.core || []); supports = supports.concat(def.support || []);
  if (_lnSignif) supports.push(_lnSignif);
  anchors = uniqueNumbers(anchors);
  supports = uniqueNumbers(supports).filter(function(id){ return anchors.indexOf(id) === -1; });
  return { anchors:anchors, supports:supports, all:uniqueNumbers(anchors.concat(supports)), contextual:(def.contextual || []).slice() };
}
function buildQuestionFocusIds(types, declaredGender) { return buildQuestionFocusProfile({types:Array.isArray(types)?types:[types],targetScope:'unspecified'},declaredGender).all; }

function pairSlotKey(a,b) { var lo=Math.min(a.slot,b.slot), hi=Math.max(a.slot,b.slot); return lo+'-'+hi; }
function segmentContainsBoth(seg,a,b) { var slots=seg.positions.map(function(p){return p.slot;}); return slots.indexOf(a.slot)>-1 && slots.indexOf(b.slot)>-1; }
function cardSetFromStructures(structures) {
  var out=[]; (structures||[]).forEach(function(st){ st.positions.forEach(function(p){ out.push(p); }); }); return uniquePositions(out);
}

function classifyClusterPolarity(type, cardIds, anchorIds) {
  var positivesByType = {
    attraction_opportunity:[1,2,9,16,17,24,25,31,32,33],
    sexual_component:[7,9,24,25,30,31,32], sexual_event:[7,24,25,30,31,33],
    business_success:[2,3,5,9,16,17,20,31,32,33,34,35],
    debt_clearance:[5,8,10,31,33,34,35], positive_net_worth:[4,5,15,31,33,34,35],
    finance:[4,5,15,31,33,34,35], career_fit:[4,5,14,19,30,31,33,35],
    career_promotion:[1,17,19,27,31,32,33], health_symbolic_context:[5,31,35],
    life_guidance:[2,4,5,9,16,17,18,24,31,32,33,35]
  };
  var ignore = uniqueNumbers((anchorIds || []).concat([28,29]));
  var modifiers = uniqueNumbers(cardIds || []).filter(function(id){ return ignore.indexOf(id) === -1; });
  var posIds = positivesByType[type] || [1,2,4,5,9,16,17,18,20,24,25,27,30,31,32,33,34,35];
  var neg = modifiers.filter(function(id){ return HARD_NEGATIVE_IDS.indexOf(id)>-1; }).length;
  var pos = modifiers.filter(function(id){ return posIds.indexOf(id)>-1; }).length;
  if (neg && pos) return 'mixed';
  if (neg) return 'negative';
  if (pos) return 'positive';
  return 'neutral';
}

function clusterThemeFor(type, anchorIds, cardIds) {
  if (type === 'attraction_opportunity') {
    if (anchorIds.indexOf(28)>-1 && anchorIds.indexOf(29)>-1) return '人物焦點間的桃花／吸引連結';
    if (cardIds.indexOf(24)>-1 || cardIds.indexOf(9)>-1 || cardIds.indexOf(31)>-1 || cardIds.indexOf(32)>-1) return '吸引與被注意的場域';
  }
  if (type === 'sexual_component' || type === 'sexual_event') {
    if (cardIds.indexOf(30)>-1 || cardIds.indexOf(7)>-1) return '肉體／感官／誘惑脈絡';
    if (cardIds.indexOf(25)>-1 || cardIds.indexOf(24)>-1) return '關係與情感落實脈絡';
  }
  if (type === 'life_guidance') {
    if (cardIds.some(function(id){return [33,22,16].indexOf(id)>-1;})) return '方向／選擇／解答結構';
    if (cardIds.some(function(id){return [6,8,10,11,21,23,36].indexOf(id)>-1;})) return '迷茫／反覆／負擔結構';
    if (cardIds.some(function(id){return [4,5,35].indexOf(id)>-1;})) return '穩定／根基支點';
    if (cardIds.some(function(id){return [9,18,24,32].indexOf(id)>-1;})) return '價值／感受線索';
  }
  if (/^career_/.test(type)) return '工作／制度／變動結構';
  if (/^health_/.test(type)) return '健康議題的象徵性結構';
  return '核心牌周圍結構';
}

function structureMinIndexDistance(structure, idsA, idsB) {
  var positions=structure.positions||[],best=99;
  positions.forEach(function(a,ia){if(idsA.indexOf(a.card.id)===-1)return;positions.forEach(function(b,ib){if(idsB.indexOf(b.card.id)===-1)return;best=Math.min(best,Math.abs(ia-ib));});});
  return best;
}
function structureHasNearCards(structure, idsA, idsB, maxDistance) {
  return structureHasCards(structure,idsA,idsB)&&structureMinIndexDistance(structure,idsA,idsB)<=maxDistance;
}
function structureEvidenceRole(type, structure, declaredGender) {
  var ids=structure.cardIds||uniqueNumbers((structure.positions||[]).map(function(p){return p.card.id;}));
  var roles=getPersonRoleIds(declaredGender),q=roles.querent?[roles.querent]:[28,29],c=roles.counterpart?[roles.counterpart]:[28,29];
  var persons=uniqueNumbers(q.concat(c)),negative=ids.some(function(id){return HARD_NEGATIVE_IDS.indexOf(id)>-1;});
  var nearNegative=structureHasNearCards(structure,persons.concat([24,25,30,7,9,31,32]),HARD_NEGATIVE_IDS,2);
  if(type==='attraction_opportunity'){
    if(nearNegative)return 'risk';
    if(structureHasNearCards(structure,q,c,2))return 'person_bridge';
    if(structureHasNearCards(structure,persons,ATTRACTION_POSITIVE_IDS,2))return 'attraction_support';
    if(ids.some(function(id){return ATTRACTION_POSITIVE_IDS.indexOf(id)>-1;}))return 'attraction_context';
    return negative?'risk':'neutral';
  }
  if(type==='sexual_component'){
    if(nearNegative&&ids.some(function(id){return SEXUAL_CONTEXT_IDS.indexOf(id)>-1;}))return 'risk';
    if(structureHasNearCards(structure,SEXUAL_PRIMARY_IDS,persons.concat([9,24,25,31,32]),2))return 'sexual_support';
    if(structureHasNearCards(structure,SEXUAL_PRIMARY_IDS,SEXUAL_MODIFIER_IDS,2)&&!negative)return 'sexual_support';
    if(structureHasNearCards(structure,SEXUAL_MODIFIER_IDS,persons.concat([9,24,25,31,32]),2))return 'sexual_modifier_only';
    return negative?'risk':'context';
  }
  if(type==='sexual_event'){
    if(nearNegative&&ids.some(function(id){return SEXUAL_CONTEXT_IDS.indexOf(id)>-1;}))return 'risk';
    if(structureHasNearCards(structure,SEXUAL_PRIMARY_IDS,c,2)&&structureHasNearCards(structure,c,[24,25,1,4,12],2))return 'event_support';
    if(structureHasNearCards(structure,q,c,2)||structureHasNearCards(structure,c,[24,25,1,4,12],2))return 'relation_support';
    if(structureHasNearCards(structure,SEXUAL_PRIMARY_IDS,persons.concat([9,24,25,31,32]),2))return 'sexual_support';
    if(structureHasNearCards(structure,SEXUAL_MODIFIER_IDS,persons.concat([9,24,25,31,32]),2))return 'sexual_modifier_only';
    return negative?'risk':'context';
  }
  return '';
}
function clusterIdsByRole(packet, roles) {
  var allowed={};(roles||[]).forEach(function(r){allowed[r]=true;});
  return (packet.clusters||[]).filter(function(c){return !!allowed[c.role];}).map(function(c){return c.id;});
}
function reserveClusterIds(packet, candidates, used, limit) {
  var available=uniqueStrings(candidates||[]).filter(function(id){return !used[id];});
  var picked=rankAndLimitClusterIds(packet,available,limit||1);picked.forEach(function(id){used[id]=true;});return picked;
}

function buildClusters(structures, anchorSlots, type, declaredGender) {
  var map = {},roleSplit=type==='life_guidance'||type==='attraction_opportunity'||type==='sexual_component'||type==='sexual_event';
  structures.forEach(function(st){
    var anchorPositions = st.positions.filter(function(p){ return !!anchorSlots[p.slot]; });
    var anchorSlotIds = uniqueNumbers(anchorPositions.map(function(p){ return p.slot; })).sort(function(a,b){return a-b;});
    var key = (anchorSlotIds.length > 1 ? 'bridge:' : 'local:') + (anchorSlotIds.join('-') || 'none:' + st.id);
    var role='';
    if(type==='life_guidance'){
      var structureIds=uniqueNumbers(st.positions.map(function(p){return p.card.id;}));
      var structureAnchorIds=uniqueNumbers(anchorPositions.map(function(p){return p.card.id;}));
      var structurePolarity=classifyClusterPolarity(type,structureIds,structureAnchorIds);
      role=structurePolarity==='negative'||structurePolarity==='mixed'?'risk':structurePolarity==='positive'?'support':'neutral';
    }else if(roleSplit)role=structureEvidenceRole(type,st,declaredGender);
    if(roleSplit)key += ':'+(role||'neutral');
    if (!map[key]) map[key] = {key:key, refs:[], structures:[], cardIds:[], anchorIds:[], anchorSlots:anchorSlotIds,role:role||'neutral'};
    map[key].refs.push(st.id); map[key].structures.push(st);
    map[key].cardIds = uniqueNumbers(map[key].cardIds.concat(st.positions.map(function(p){return p.card.id;})));
    map[key].anchorIds = uniqueNumbers(map[key].anchorIds.concat(anchorPositions.map(function(p){return p.card.id;})));
  });
  return Object.keys(map).sort().map(function(k,idx){
    var c=map[k]; c.id='C'+(idx+1); c.kind=c.anchorSlots.length>1?'bridge':'local';
    if(c.role==='person_bridge')c.theme='人物焦點連結';
    else if(c.role==='attraction_support')c.theme='桃花／吸引支持';
    else if(c.role==='attraction_context')c.theme='桃花主題背景';
    else if(c.role==='sexual_support')c.theme='感官／性成分支持';
    else if(c.role==='sexual_modifier_only')c.theme='誘惑／複雜修飾，不能單獨證明性成分';
    else if(c.role==='event_support')c.theme='感官焦點與同一人物／接觸落實連結';
    else if(c.role==='relation_support')c.theme='人物／關係落實支持';
    else if(c.role==='risk')c.theme='阻礙／不明／中止風險';
    else c.theme=clusterThemeFor(type,c.anchorIds,c.cardIds);
    c.polarity=classifyClusterPolarity(type,c.cardIds,c.anchorIds);
    return c;
  });
}

function modernThemeAllowedForType(type, groupId) {
  var byType={
    business_success:['stability','success_opening','movement_change','communication_public','work_money_power','ending_cut','obstacle_burden','loss_erosion','uncertainty_complexity','conflict_repetition'],
    debt_clearance:['stability','success_opening','work_money_power','ending_cut','obstacle_burden','loss_erosion','uncertainty_complexity','conflict_repetition'],
    positive_net_worth:['stability','success_opening','work_money_power','ending_cut','obstacle_burden','loss_erosion','uncertainty_complexity','conflict_repetition'],
    finance:['stability','success_opening','work_money_power','ending_cut','obstacle_burden','loss_erosion','uncertainty_complexity','conflict_repetition'],
    attraction_opportunity:['success_opening','communication_public','relationship_bond','obstacle_burden','uncertainty_complexity','conflict_repetition'],
    sexual_component:['relationship_bond','sexual_sensual','obstacle_burden','uncertainty_complexity','conflict_repetition'],
    sexual_event:['relationship_bond','sexual_sensual','ending_cut','obstacle_burden','loss_erosion','uncertainty_complexity','conflict_repetition'],
    career_fit:['stability','success_opening','movement_change','communication_public','work_money_power','ending_cut','obstacle_burden','uncertainty_complexity','conflict_repetition'],
    career_promotion:['stability','success_opening','movement_change','communication_public','work_money_power','ending_cut','obstacle_burden','uncertainty_complexity','conflict_repetition'],
    life_guidance:['stability','success_opening','movement_change','relationship_bond','ending_cut','obstacle_burden','loss_erosion','uncertainty_complexity','conflict_repetition']
  };
  return !byType[type] || byType[type].indexOf(groupId)>-1;
}

function buildModernContext(geometry, profile, anchorPositions, directPairs, relevantSegments, declaredGender, type, clusters) {
  var roles=getPersonRoleIds(declaredGender), personIds=uniqueNumbers([roles.querent,roles.counterpart]);
  var coveredSlots={};
  directPairs.forEach(function(x){x.positions.forEach(function(p){coveredSlots[p.slot]=true;});});
  relevantSegments.forEach(function(x){x.positions.forEach(function(p){coveredSlots[p.slot]=true;});});
  function novelNeighborhood(center){
    var raw=neighborhoodFor(geometry,center), novel=raw.positions.filter(function(p){return p.slot!==center.slot&&!coveredSlots[p.slot];});
    return novel.length?{center:center,positions:novel,novelPositions:novel}:null;
  }
  var personCenters=anchorPositions.filter(function(p){return personIds.indexOf(p.card.id)>-1;}).slice(0,2);
  var topicCenters=anchorPositions.filter(function(p){return personIds.indexOf(p.card.id)===-1;}).slice(0,3);
  var personNeighborhoods=personCenters.map(novelNeighborhood).filter(Boolean);
  var topicNeighborhoods=topicCenters.map(novelNeighborhood).filter(Boolean);
  var personSlots={},topicSlots={};
  personNeighborhoods.forEach(function(n){n.positions.forEach(function(p){personSlots[p.slot]=p;});});
  topicNeighborhoods.forEach(function(n){n.positions.forEach(function(p){topicSlots[p.slot]=p;});});
  var sharedCards=Object.keys(personSlots).filter(function(s){return !!topicSlots[s];}).map(function(s){return personSlots[s];});

  var directKeys={};directPairs.forEach(function(p){directKeys[pairSlotKey(p.positions[0],p.positions[1])]=true;});
  var chosenPairKeys={};
  function isRedundantPair(a,b){var key=pairSlotKey(a,b);if(directKeys[key]||chosenPairKeys[key]||(coveredSlots[a.slot]&&coveredSlots[b.slot]))return true;return relevantSegments.some(function(seg){return segmentContainsBoth(seg,a,b);});}
  var relevantIds=uniqueNumbers(profile.all.concat(HARD_NEGATIVE_IDS).concat(type==='sexual_component'||type==='sexual_event'?SEXUAL_CONTEXT_IDS:[]));
  function contextScore(source,target){var score=0;if(profile.anchors.indexOf(target.card.id)>-1)score+=5;if(profile.supports.indexOf(target.card.id)>-1)score+=3;if(HARD_NEGATIVE_IDS.indexOf(target.card.id)>-1)score+=3;if(relevantIds.indexOf(target.card.id)>-1)score+=1;return score;}
  function selectPairs(candidates,limit){
    candidates.sort(function(a,b){return b.score-a.score||pairSlotKey(a.source,a.target).localeCompare(pairSlotKey(b.source,b.target));});
    var out=[];candidates.forEach(function(x){var key=pairSlotKey(x.source,x.target);if(out.length>=limit||chosenPairKeys[key])return;chosenPairKeys[key]=true;out.push(x);});return out;
  }
  var mirrorCandidates=[];
  anchorPositions.forEach(function(p){mirrorTargetsFor(geometry,p).forEach(function(m){if(!isRedundantPair(m.source,m.target)){m.score=contextScore(m.source,m.target);if(m.score>0)mirrorCandidates.push(m);}});});
  var mirrors=selectPairs(mirrorCandidates,2);
  var knightCandidates=[];
  anchorPositions.forEach(function(p){knightTargetsFor(geometry,p).forEach(function(k){if(!isRedundantPair(k.source,k.target)){k.score=contextScore(k.source,k.target);if(k.score>0)knightCandidates.push(k);}});});
  var knightMoves=selectPairs(knightCandidates,2);

  var intersections=[];
  for(var i=0;i<relevantSegments.length;i++)for(var j=i+1;j<relevantSegments.length;j++){
    var slotsA={};relevantSegments[i].positions.forEach(function(p){slotsA[p.slot]=p;});
    var shared=uniquePositions(relevantSegments[j].positions.filter(function(p){return slotsA[p.slot]&&!coveredSlots[p.slot];}));
    if(shared.length)intersections.push({a:'S'+(i+1),b:'S'+(j+1),positions:shared});
  }
  intersections=intersections.slice(0,1);
  var contextPositions=[];
  personNeighborhoods.concat(topicNeighborhoods).forEach(function(n){contextPositions=contextPositions.concat(n.positions);});
  mirrors.forEach(function(m){contextPositions.push(m.source,m.target);});knightMoves.forEach(function(k){contextPositions.push(k.source,k.target);});
  contextPositions=uniquePositions(contextPositions.filter(function(p){return !coveredSlots[p.slot];}));
  var clusterThemes=[];
  if(['attraction_opportunity','sexual_component','sexual_event'].indexOf(type)===-1){
    (clusters||[]).forEach(function(cluster){
      var positions=cardSetFromStructures(cluster.structures),best=null;
      MODERN_THEME_GROUPS.forEach(function(group){if(!modernThemeAllowedForType(type,group.id))return;var hits=positions.filter(function(p){return group.cards.indexOf(p.card.id)>-1;});if(hits.length>=2&&(!best||hits.length>best.positions.length))best={clusterId:cluster.id,id:group.id,label:group.label,positions:hits};});
      if(best)clusterThemes.push(best);
    });
    clusterThemes=clusterThemes.slice(0,3);
  }
  return {personNeighborhoods:personNeighborhoods,topicNeighborhoods:topicNeighborhoods,sharedCards:sharedCards,mirrors:mirrors,knightMoves:knightMoves,intersections:intersections,corners:[],centers:[],clusterThemes:clusterThemes,contextPositions:contextPositions};
}

function structureHasCards(structure, idsA, idsB) {
  var ids=structure.cardIds||uniqueNumbers(structure.positions.map(function(p){return p.card.id;}));
  return idsA.some(function(x){return ids.indexOf(x)>-1;}) && idsB.some(function(x){return ids.indexOf(x)>-1;});
}
function packetHasCoreStructure(packet, idsA, idsB) { return packet.structures.some(function(st){return structureHasCards(st,idsA,idsB);}); }
function packetHasDirectPair(packet, idsA, idsB) { return packet.directPairs.some(function(p){return structureHasCards({positions:p.positions},idsA,idsB);}); }
function packetHasNegativeAround(packet, ids) { return packet.structures.some(function(st){return structureHasCards(st,ids,HARD_NEGATIVE_IDS);}); }

function clusterIdsForCards(packet, idsA, idsB) {
  return (packet.clusters || []).filter(function(c){
    return (c.structures || []).some(function(st){ return structureHasCards(st,idsA,idsB); });
  }).map(function(c){ return c.id; });
}
function clusterIdsForCardsByPolarity(packet, idsA, idsB, allowedPolarities) {
  var allowed=allowedPolarities||['positive'];
  return (packet.clusters || []).filter(function(c){
    return allowed.indexOf(c.polarity)>-1 && (c.structures || []).some(function(st){ return structureHasCards(st,idsA,idsB); });
  }).map(function(c){ return c.id; });
}
function rankAndLimitClusterIds(packet, clusterIds, limit) {
  var wanted={}; uniqueStrings(clusterIds||[]).forEach(function(id){wanted[id]=true;});
  return (packet.clusters||[]).filter(function(c){return !!wanted[c.id];}).sort(function(a,b){
    function score(c){
      var direct=(c.structures||[]).filter(function(st){return st.kind==='adjacency';}).length;
      var shortest=99;(c.structures||[]).forEach(function(st){shortest=Math.min(shortest,(st.positions||[]).length||99);});
      return direct*100+(99-shortest)*2-(c.structures||[]).length;
    }
    return score(b)-score(a)||String(a.id).localeCompare(String(b.id));
  }).slice(0,limit||1).map(function(c){return c.id;});
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

function cardIdsForClusterIds(packet, clusterIds) {
  var wanted={};uniqueStrings(clusterIds||[]).forEach(function(id){wanted[id]=true;});
  var ids=[];(packet.clusters||[]).forEach(function(c){if(wanted[c.id])ids=ids.concat(c.cardIds||[]);});
  return uniqueNumbers(ids);
}
function guidanceRiskText(cardIds) {
  var labels=[];
  [[6,'不明'],[8,'結束'],[10,'切斷'],[11,'反覆'],[21,'阻礙'],[23,'損耗'],[36,'負擔']].forEach(function(pair){if(cardIds.indexOf(pair[0])>-1)labels.push(pair[1]);});
  return labels.length?labels.join('、'):'負向干擾';
}
function guidancePrincipleText(cardIds) {
  var hasValue=cardIds.some(function(id){return [9,18,24,32].indexOf(id)>-1;});
  var hasStability=cardIds.some(function(id){return [4,5,35].indexOf(id)>-1;});
  var hasDirection=cardIds.some(function(id){return [16,22,33].indexOf(id)>-1;});
  var hasOpening=cardIds.some(function(id){return [2,17,31].indexOf(id)>-1;});
  if(hasValue&&hasStability)return '可把真正重視的內容與可持續、可建立根基的條件一起作為篩選原則；這不是唯一答案或具體職業指令。';
  if(hasValue&&(hasDirection||hasOpening))return '可把真正重視的內容與能讓方向更清楚、形成可選擇空間的條件一起作為篩選原則；這不是成功保證。';
  if(hasStability&&(hasDirection||hasOpening))return '可把方向清晰度與能否持續、建立根基一起作為篩選原則；這不是唯一答案或具體職業指令。';
  if(hasValue)return '可把真正重視、願意投入的內容作為篩選線索，但單憑喜歡不能保證結果。';
  if(hasStability)return '可把能否持續與建立根基作為篩選線索，但牌面沒有指定唯一方向。';
  return '可把能增加方向清晰度或提供正向支點的條件作為篩選原則，但牌面沒有指定唯一答案。';
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

function claimClusterFitScore(type, claimIndex, claimText, cluster) {
  var score=claimIndex===1?100:20,role=cluster.role||'neutral';
  if(type==='sexual_event')score+=30;else if(type==='sexual_component')score+=20;else if(type==='attraction_opportunity')score+=10;
  var roleScore={event_support:80,relation_support:60,sexual_support:70,sexual_modifier_only:35,person_bridge:55,attraction_support:60,attraction_context:25,risk:40};
  score+=roleScore[role]||0;
  if(/阻礙|不明|中止|結束|切斷|負擔|損耗|限制|降低/.test(claimText)&&role==='risk')score+=35;
  if((cluster.structures||[]).some(function(st){return st.kind==='adjacency';}))score+=8;
  return score;
}
function enforceGlobalClaimEvidenceUniqueness(packetItems) {
  var candidates=[],usedUids={},accepted={};
  (packetItems||[]).forEach(function(entry,entryIndex){
    var packet=entry.packet,type=primaryDecisionType(packet.question.types||[packet.question.type]);
    if(['attraction_opportunity','sexual_component','sexual_event'].indexOf(type)===-1)return;
    (packet.claimPlan.claimEvidence||[]).forEach(function(link){
      (link.clusters||[]).forEach(function(cid){
        var cluster=(packet.clusters||[]).filter(function(c){return c.id===cid;})[0];if(!cluster)return;
        var uids=uniqueStrings((cluster.structures||[]).map(function(st){return st.evidenceUid||physicalStructureKey(st);}));
        candidates.push({entryIndex:entryIndex,packet:packet,type:type,claimIndex:link.claimIndex,claimText:packet.claimPlan.approvedClaims[link.claimIndex-1]||'',cluster:cluster,uids:uids,score:claimClusterFitScore(type,link.claimIndex,packet.claimPlan.approvedClaims[link.claimIndex-1]||'',cluster)});
      });
    });
  });
  candidates.sort(function(a,b){return b.score-a.score||a.entryIndex-b.entryIndex||a.claimIndex-b.claimIndex||String(a.cluster.id).localeCompare(String(b.cluster.id));});
  candidates.forEach(function(c){if(c.uids.some(function(uid){return !!usedUids[uid];}))return;var key=c.entryIndex+':'+c.claimIndex;if(!accepted[key])accepted[key]=[];accepted[key].push(c.cluster.id);c.uids.forEach(function(uid){usedUids[uid]=key;});});
  (packetItems||[]).forEach(function(entry,entryIndex){
    var packet=entry.packet,type=primaryDecisionType(packet.question.types||[packet.question.type]);
    if(['attraction_opportunity','sexual_component','sexual_event'].indexOf(type)===-1)return;
    var oldClaims=packet.claimPlan.approvedClaims.slice(),oldLinks=(packet.claimPlan.claimEvidence||[]).slice(),newClaims=[],newLinks=[],mainLost=false;
    oldLinks.forEach(function(link){
      var key=entryIndex+':'+link.claimIndex,kept=accepted[key]||[],had=(link.clusters||[]).length>0;
      if(had&&!kept.length){if(link.claimIndex===1)mainLost=true;return;}
      newClaims.push(oldClaims[link.claimIndex-1]);newLinks.push({claimIndex:newClaims.length,clusters:kept.slice()});
    });
    if(mainLost){
      var fallback=type==='attraction_opportunity'?'在不重複使用同一實體證據的前提下，牌面不足以明確支持非現任桃花。':type==='sexual_component'?'在不重複使用同一實體證據的前提下，無法確認該桃花具有明顯肉體／性吸引。':'在不重複使用同一實體證據的前提下，無法確認實際肉體關係會發生。';
      newClaims.unshift(fallback);newLinks.unshift({claimIndex:1,clusters:[]});
      for(var i=1;i<newLinks.length;i++)newLinks[i].claimIndex=i+1;
      if(type==='attraction_opportunity'){packet.claimPlan.status='attraction_insufficient';packet.claimPlan.certaintyCap='不足以明確判定';}
      else if(type==='sexual_component'){packet.claimPlan.status='sexual_component_insufficient';packet.claimPlan.certaintyCap='不足以明確判定';}
      else{packet.claimPlan.status='sexual_event_insufficient';packet.claimPlan.certaintyCap='不足以判定實際發生';}
    }
    packet.claimPlan.approvedClaims=newClaims;packet.claimPlan.claimEvidence=newLinks;packet.globalEvidenceOwners=usedUids;
    packet.validation=validateEvidencePacket(packet);
    if(!packet.validation.ok)failClosedPacket(packet,packet.validation);
  });
  return usedUids;
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
    var empty={question:questionItem,focusPositions:[],anchorPositions:[],housePositions:[],directPairs:[],segments:[],clusters:[],structures:[],modernContext:{personNeighborhoods:[],topicNeighborhoods:[],sharedCards:[],mirrors:[],knightMoves:[],intersections:[],corners:[],centers:[],clusterThemes:[],contextPositions:[]},analysisDimensions:analysisDimensionsFor(questionItem),usedCards:{}};
    empty.claimPlan=buildClaimPlan(empty,declaredGender); empty.validation=validateEvidencePacket(empty); return empty.validation.ok?empty:failClosedPacket(empty,empty.validation);
  }
  var profile=buildQuestionFocusProfile(questionItem,declaredGender), byCardId={};
  geometry.positions.forEach(function(p){byCardId[p.card.id]=p;});
  var focusPositions=profile.all.map(function(id){return byCardId[id];}).filter(Boolean);
  var anchorPositions=profile.anchors.map(function(id){return byCardId[id];}).filter(Boolean);
  var housePositions=anchorPositions.slice(), anchorSlots={}, focusSlots={};
  anchorPositions.forEach(function(p){anchorSlots[p.slot]=true;});
  focusPositions.forEach(function(p){focusSlots[p.slot]=true;});
  var roles=getPersonRoleIds(declaredGender), personSlotMap={};
  [roles.querent,roles.counterpart].forEach(function(id){var p=byCardId[id];if(p)personSlotMap[p.slot]=true;});

  function structureRelevance(ids) {
    var score = 0;
    var anchorCount = ids.filter(function(id){ return profile.anchors.indexOf(id) > -1; }).length;
    var supportCount = ids.filter(function(id){ return profile.supports.indexOf(id) > -1; }).length;
    var personCount = ids.filter(function(id){ return id === roles.querent || id === roles.counterpart; }).length;
    var negativeCount = ids.filter(function(id){ return HARD_NEGATIVE_IDS.indexOf(id) > -1; }).length;
    score += anchorCount * 5 + supportCount * 2 + personCount * 3 + negativeCount * 2;
    if ((type === 'sexual_component' || type === 'sexual_event') && ids.some(function(id){ return SEXUAL_CONTEXT_IDS.indexOf(id) > -1; })) score += 6;
    if (type === 'attraction_opportunity' && ids.some(function(id){ return ATTRACTION_POSITIVE_IDS.indexOf(id) > -1; })) score += 3;
    return score;
  }

  var pairMap={}, pairCandidates=[];
  geometry.adjacency.forEach(function(a){
    if(!anchorSlots[a.position.slot])return;
    a.neighbors.forEach(function(n){
      var keep=!!focusSlots[n.slot]||(type!=='life_guidance'&&!!personSlotMap[a.position.slot])||HARD_NEGATIVE_IDS.indexOf(n.card.id)>-1;
      if(!keep)return;
      var key=pairSlotKey(a.position,n);if(pairMap[key])return;pairMap[key]=true;
      var pair={positions:[a.position,n]};
      pair.score=structureRelevance(pair.positions.map(function(p){return p.card.id;}));
      pairCandidates.push(pair);
    });
  });
  pairCandidates.sort(function(a,b){ return b.score-a.score; });
  var pairLimit=(type==='attraction_opportunity'||type==='sexual_component'||type==='sexual_event')?14:18;
  var directPairs=pairCandidates.slice(0,pairLimit);

  var segmentMap={}, segmentCandidates=[];
  function addSegment(seq){
    if(!seq||seq.length<3)return;
    var key=seq.map(function(p){return p.slot;}).join('-'),rev=seq.slice().reverse().map(function(p){return p.slot;}).join('-');
    if(segmentMap[key]||segmentMap[rev])return;segmentMap[key]=true;
    var seg={positions:seq.slice()};
    seg.score=structureRelevance(seg.positions.map(function(p){return p.card.id;}))-(seq.length-3)*0.5;
    segmentCandidates.push(seg);
  }
  geometry.lines.forEach(function(line){
    var anchorIndexes=[];line.positions.forEach(function(p,idx){if(anchorSlots[p.slot])anchorIndexes.push(idx);});
    for(var i=0;i<anchorIndexes.length;i++)for(var j=i+1;j<anchorIndexes.length;j++)addSegment(line.positions.slice(anchorIndexes[i],anchorIndexes[j]+1));
  });
  segmentCandidates.sort(function(a,b){return b.score-a.score||a.positions.length-b.positions.length;});
  var segmentLimit=(type==='attraction_opportunity'||type==='sexual_component'||type==='sexual_event')?6:8;
  var relevantSegments=segmentCandidates.slice(0,segmentLimit);

  var structures=[];
  directPairs.forEach(function(pair,idx){structures.push({id:'D'+(idx+1),kind:'adjacency',positions:pair.positions,cardIds:uniqueNumbers(pair.positions.map(function(p){return p.card.id;}))});});
  relevantSegments.forEach(function(seg,idx){structures.push({id:'S'+(idx+1),kind:'segment',positions:seg.positions,cardIds:uniqueNumbers(seg.positions.map(function(p){return p.card.id;}))});});
  var clusters=buildClusters(structures,anchorSlots,type,declaredGender);
  var modernContext=buildModernContext(geometry,profile,anchorPositions,directPairs,relevantSegments,declaredGender,type,clusters);
  var usedCards={};
  anchorPositions.forEach(function(p){usedCards[p.card.id]=p.card;});
  structures.forEach(function(st){st.positions.forEach(function(p){usedCards[p.card.id]=p.card;});});
  modernContext.contextPositions.forEach(function(p){usedCards[p.card.id]=p.card;});
  var packet={question:questionItem,profile:profile,focusPositions:focusPositions,anchorPositions:anchorPositions,housePositions:housePositions,directPairs:directPairs,segments:relevantSegments,clusters:clusters,structures:structures,modernContext:modernContext,analysisDimensions:analysisDimensionsFor(questionItem),usedCards:usedCards};
  packet.claimPlan=buildClaimPlan(packet,declaredGender); packet.validation=validateEvidencePacket(packet); return packet.validation.ok?packet:failClosedPacket(packet,packet.validation);
}

function buildClaimPlan(packet, declaredGender) {
  var type=primaryDecisionType(packet.question.types||[packet.question.type]), roles=getPersonRoleIds(declaredGender), q=roles.querent?[roles.querent]:[28,29], c=roles.counterpart?[roles.counterpart]:[28,29];
  var plan={status:'model_evaluate',certaintyCap:'較有傾向',requiredConclusion:'只輸出 approved_claims；核心主張限於 claim_evidence 指定的C，未列入者不得補寫。',approvedClaims:[],forbiddenClaims:[],claimEvidence:[]};
  if(type==='comparison_suitability'){plan.status='comparison_requires_symmetric_nine';plan.certaintyCap='無法由大牌陣公平比較';addApprovedClaim(plan,'目前牌陣沒有為兩個選項建立對稱位置，不能公平比較。',[]);plan.forbiddenClaims=['將選項名稱套成同名牌','事後挑牌代表選項'];return plan;}
  if(type==='unsupported_age'){plan.status='unsupported_age';plan.certaintyCap='不足以判定';plan.requiredConclusion='直接回答數字年齡與區間無法驗證，不得引用牌面側證。';addApprovedClaim(plan,'無 age_rules，無法判定數字年齡或年齡區間。',[]);plan.forbiddenClaims=['任何歲數、區間、年輕／年長側推'];return plan;}
  if(type==='timing'){plan.status='timing_rules_not_enabled';plan.certaintyCap='不足以判定具體時間';plan.requiredConclusion='直接回答本站未啟用時間規則，因此無法判定年、月、週、日或先後階段。';addApprovedClaim(plan,'本次無法由牌面判定具體時間。',[]);plan.forbiddenClaims=['牌號換算日期','座標或房屋推時間','D／S／C推先後','任何年、月、週、日'];return plan;}
  if(type==='health_medical_cause'){plan.status='medical_limit';plan.certaintyCap='不足以判定';plan.requiredConclusion='先明說牌面不能判定醫學病因；不得引用牌面作病因。';addApprovedClaim(plan,'牌面無法判定醫學病因、診斷或治療。',[]);plan.forbiddenClaims=['壓力、飲食、荷爾蒙、器官或藥物效果的病因斷言'];return plan;}

  if(type==='life_guidance'){
    var usedGuidanceClusters={};
    function takeGuidance(ids,limit){
      var available=uniqueStrings(ids||[]).filter(function(id){return !usedGuidanceClusters[id];});
      var picked=rankAndLimitClusterIds(packet,available,limit||1);
      picked.forEach(function(id){usedGuidanceClusters[id]=true;});
      return picked;
    }
    var orientationCandidates=clusterIdsForCards(packet,q,[33,22,16]);
    var orientation=takeGuidance(orientationCandidates,1);
    var decisionRiskCandidates=clusterIdsForCardsByPolarity(packet,q.concat([33,22,16]),[6,8,10,11,21,23,36],['negative','mixed']);
    var valueRiskCandidates=clusterIdsForCardsByPolarity(packet,[24,35],[6,8,10,11,21,23,36],['negative','mixed']);
    var riskGuidance=takeGuidance(decisionRiskCandidates,1).concat(takeGuidance(valueRiskCandidates,1));
    var constructiveCandidates=clusterIdsForCardsByPolarity(packet,[33,22,16,24,35],[2,4,5,9,17,18,31,32],['positive']);
    var constructive=takeGuidance(constructiveCandidates,2);
    if(orientation.length&&constructive.length){
      plan.status=riskGuidance.length?'guidance_supported_with_interference':'guidance_supported';
      plan.certaintyCap=riskGuidance.length?'較有可釐清方向，但干擾明顯':'較有可釐清方向';
      addApprovedClaim(plan,'目前不是完全沒有方向；牌面支持仍有可被釐清的方向線索。',orientation);
    }else if(orientation.length){
      plan.status='guidance_signal_without_support';plan.certaintyCap='有方向線索，但可行支點不足';
      addApprovedClaim(plan,'牌面有方向或解答線索，但不足以指定可持續的具體方向。',orientation);
    }else{
      plan.status='guidance_direction_insufficient';plan.certaintyCap=riskGuidance.length?'迷茫與干擾明顯，方向證據不足':'不足以明確指定方向';
      addApprovedClaim(plan,'目前核心證據不足以指定明確人生方向。',[]);
    }
    if(riskGuidance.length){var riskText=guidanceRiskText(cardIdsForClusterIds(packet,riskGuidance));addApprovedClaim(plan,riskText+'正在干擾判斷；只能描述干擾類型，不能推成事件或因果。',riskGuidance);}
    if(constructive.length)addApprovedClaim(plan,guidancePrincipleText(cardIdsForClusterIds(packet,constructive)),constructive);
    else addApprovedClaim(plan,'目前沒有足夠正向核心證據提出更具體的選擇原則。',[]);
    addApprovedClaim(plan,'牌面不能指定唯一人生使命、職業、期限，也不能保證某條道路成功。',[]);
    plan.forbiddenClaims=['指定唯一職業或人生使命','要求離職、分手、搬家、投資或其他具體處置','未啟用規則下的先後流程、時間或因果','把 selected_context 單獨升級成建議','保證某條路成功'];return plan;
  }
  if(type==='business_success'){
    var businessLink=clusterIdsForCards(packet,q,[14,34,35]);
    var outcome=clusterIdsForCardsByPolarity(packet,[14,31,34,35],[5,9,16,17,20,32,33],['positive']);
    var risk=clusterIdsForCards(packet,[14,34,35].concat(q),HARD_NEGATIVE_IDS);
    if(outcome.length){plan.status=risk.length?'business_success_conditions_mixed':'business_success_conditions_supported';plan.certaintyCap=risk.length?'較有成功條件，但阻礙明顯':'較有成功傾向';addApprovedClaim(plan,'副業具備可持續成功的支持條件，但只代表本次牌面的傾向。',rankAndLimitClusterIds(packet,outcome,2));}
    else if(businessLink.length){plan.status='business_link_without_outcome';plan.certaintyCap='副業連結明確，成功結果不足';addApprovedClaim(plan,'牌面能確認副業／商業連結，但不足以直接判定成功。',businessLink);}
    else{plan.status='business_success_insufficient';plan.certaintyCap='不足以明確判定';addApprovedClaim(plan,'目前核心證據不足以判定副業成功。',[]);}
    if(risk.length)addApprovedClaim(plan,'阻礙、損耗、不明或反覆會削弱成功條件。',rankAndLimitClusterIds(packet,risk,2));
    plan.forbiddenClaims=['有收入等於成功','副業成功等於清償負債','自行補入毛利、庫存、廣告、折扣、客單價或成交來源策略','具體成功時間'];return plan;
  }
  if(type==='debt_clearance'){
    var improve=clusterIdsForCardsByPolarity(packet,[15,34],[5,31,33,35],['positive']);
    var ending=clusterIdsForCards(packet,[15,34,36,23],[8,10]);
    var debtRisk=clusterIdsForCardsByPolarity(packet,[15,34,36,23].concat(q),[6,11,21,23,36],['negative','mixed']);
    if(improve.length&&ending.length){plan.status=debtRisk.length?'debt_clearance_possible_with_risk':'debt_clearance_possible';plan.certaintyCap='有清償條件，但不能確認必然歸零';addApprovedClaim(plan,'資源改善與債務壓力切減兩類核心支持同時存在，可說有完全清償的條件。',uniqueStrings(rankAndLimitClusterIds(packet,improve,1).concat(rankAndLimitClusterIds(packet,ending,1))));}
    else if(ending.length){plan.status='debt_cut_only';plan.certaintyCap='有切減債務壓力的必要，仍不足以確認清空';addApprovedClaim(plan,'牌面支持切減財務負擔，但沒有足夠資源改善證據證明負債能完全歸零。',rankAndLimitClusterIds(packet,ending,1));}
    else{plan.status='debt_clearance_insufficient';plan.certaintyCap='不足以確認負債完全清空';addApprovedClaim(plan,'收入或財務連結不能代替負債歸零；目前缺少完整清償條件。',rankAndLimitClusterIds(packet,improve,1));}
    if(debtRisk.length)addApprovedClaim(plan,'阻礙、損耗或反覆使清償結果仍受壓。',rankAndLimitClusterIds(packet,debtRisk,2));
    plan.forbiddenClaims=['副業成功等於負債歸零','熊或鐮刀單獨等於還清','具體還款金額、比例或期限'];return plan;
  }
  if(type==='positive_net_worth'){
    var growth=clusterIdsForCardsByPolarity(packet,[34,15,35],[4,5,31,33],['positive']);
    var netRisk=clusterIdsForCards(packet,[34,15,35].concat(q),[11,21,23,36]);
    if(growth.length){plan.status=netRisk.length?'positive_net_worth_conditions_mixed':'positive_net_worth_conditions_supported';plan.certaintyCap=netRisk.length?'有轉為正資產的條件，但反證明顯':'較有轉為正資產的條件';addApprovedClaim(plan,'資源成長與穩定核心支持正資產方向，但不等於已經轉正。',rankAndLimitClusterIds(packet,growth,2));}
    else{plan.status='positive_net_worth_insufficient';plan.certaintyCap='不足以確認正資產';addApprovedClaim(plan,'目前缺少足夠的資源成長與穩定證據，不能確認資產已能大於負債。',[]);}
    if(netRisk.length)addApprovedClaim(plan,'損耗、阻礙、反覆或負擔會抵銷資產累積。',rankAndLimitClusterIds(packet,netRisk,2));
    plan.forbiddenClaims=['清債等於正資產','收入等於正資產','具體淨資產金額或比率','已經轉正'];return plan;
  }
  if(type==='finance'){
    var resource=clusterIdsForCards(packet,q.concat([34,15]),[31,33,35,5]);
    var fr=clusterIdsForCards(packet,q.concat([34,15]),[6,11,21,23,36]);
    if(resource.length){plan.certaintyCap=fr.length?'財務改善條件與反證並存':'較有財務改善條件';addApprovedClaim(plan,'牌面支持資源改善或穩定條件。',resource);}else addApprovedClaim(plan,'目前不足以明確判定財務改善。',[]);
    if(fr.length)addApprovedClaim(plan,'阻礙、損耗、負擔或反覆會削弱財務改善。',fr);
    plan.forbiddenClaims=['財務自由','負債歸零','正資產','具體金額、期限或投資指令'];return plan;
  }

  if(type==='attraction_opportunity'){
    var usedAttraction={},personBridge=clusterIdsByRole(packet,['person_bridge']),directAttraction=clusterIdsByRole(packet,['attraction_support']),attractionContext=clusterIdsByRole(packet,['attraction_context']);
    var personPick=reserveClusterIds(packet,personBridge,usedAttraction,1),attractionPick=reserveClusterIds(packet,directAttraction,usedAttraction,1);
    var aSupport=personPick.concat(attractionPick),aContext=[];
    if(!attractionPick.length)aContext=reserveClusterIds(packet,attractionContext,usedAttraction,1);
    var aRisk=reserveClusterIds(packet,clusterIdsByRole(packet,['risk']),usedAttraction,2);
    if(personPick.length&&attractionPick.length){plan.status=aRisk.length?'attraction_supported_with_risk':'attraction_supported';plan.certaintyCap='較有桃花／吸引傾向';addApprovedClaim(plan,'牌面支持非現任桃花或吸引機會，但不證明具體真人已出現或雙方互有意圖。',aSupport);}
    else if(attractionPick.length||aContext.length){plan.status='attraction_possible';plan.certaintyCap='有機會';addApprovedClaim(plan,'牌面有桃花／吸引主題，但人物間連結不足，只能說存在機會。',attractionPick.concat(aContext));}
    else{plan.status='attraction_insufficient';plan.certaintyCap='不足以明確判定';addApprovedClaim(plan,'牌面不足以明確支持非現任桃花。',[]);}
    if(aRisk.length)addApprovedClaim(plan,'阻礙、不明或中止因素會削弱桃花落實。',aRisk);
    addApprovedClaim(plan,'假設性人物焦點不證明真人目前已出現。',[]);plan.forbiddenClaims=['互相注意','她已經出現','已經曖昧','一定會交往','肉體關係已發生','把淑女＋太陽寫成有人正在注意問卜者'];return plan;
  }
  if(type==='sexual_component'){
    var usedSex={},sexSupport=reserveClusterIds(packet,clusterIdsByRole(packet,['sexual_support']),usedSex,2),modifierOnly=reserveClusterIds(packet,clusterIdsByRole(packet,['sexual_modifier_only']),usedSex,1),sexRisk=reserveClusterIds(packet,clusterIdsByRole(packet,['risk']),usedSex,2);
    if(sexSupport.length){plan.status='sexual_component_supported';plan.certaintyCap='較有肉體／性吸引傾向';addApprovedClaim(plan,'同一桃花／人物／關係焦點有百合等感官提示，可說較有肉體或感官成分。',sexSupport);}
    else if(modifierOnly.length){plan.status='sexual_theme_unassigned';plan.certaintyCap='有誘惑／複雜主題，無法確認屬於該桃花';addApprovedClaim(plan,'牌面只有蛇所代表的誘惑／複雜修飾，缺少百合等獨立感官核心，不能判成該桃花有明顯性吸引。',modifierOnly);}
    else{plan.status='sexual_component_insufficient';plan.certaintyCap='不足以明確判定';addApprovedClaim(plan,'一般桃花證據不能代替肉體／性吸引證據。',[]);}
    if(sexRisk.length)addApprovedClaim(plan,'結束、阻礙、不明或負擔會限制感官／性成分的表現。',sexRisk);
    plan.forbiddenClaims=['蛇單獨代表性吸引','問卜者＋蛇等於該桃花有性吸引','魚代表慾望','鞭子代表性行為','一般桃花等於肉體桃花','一定有性吸引'];return plan;
  }
  if(type==='sexual_event'){
    var usedEvent={},eventSupport=reserveClusterIds(packet,clusterIdsByRole(packet,['event_support']),usedEvent,1),relationSupport=reserveClusterIds(packet,clusterIdsByRole(packet,['relation_support']),usedEvent,1),eventRisk=reserveClusterIds(packet,clusterIdsByRole(packet,['risk']),usedEvent,2);
    if(eventSupport.length&&relationSupport.length){plan.status=eventRisk.length?'sexual_event_possible_with_risk':'sexual_event_possible';plan.certaintyCap='有落實機會但不能確定發生';addApprovedClaim(plan,'感官焦點與同一人物／關係落實各有獨立支持，可說存在事件落實機會，但不能斷成必然發生。',eventSupport.concat(relationSupport));}
    else{plan.status='sexual_event_insufficient';plan.certaintyCap='不足以判定實際發生';addApprovedClaim(plan,'吸引或性成分不等於實際肉體關係；目前缺少把感官焦點與同一人物／關係落實連在一起的獨立證據。',[]);}
    if(eventRisk.length)addApprovedClaim(plan,'阻礙、不明、負擔或切斷會降低事件落實。',eventRisk);
    plan.forbiddenClaims=['把不同位置的性提示與關係牌拼成事件','一定會上床','已發生性關係','具體次數','具體時間'];return plan;
  }
  if(type==='career_fit'){
    var hasWork=packetHasCoreStructure(packet,q,[14,35,19]), hasSupport=packetHasCoreStructure(packet,[14,35],[4,5,30,24,33]), hasStrain=packetHasNegativeAround(packet,q.concat([14,35]));
    if(!hasWork){plan.status='insufficient_fit';plan.certaintyCap='牌面不足以明確判定';addApprovedClaim(plan,'只能描述工作環境訊號，不能斷定適合。',[]);}
    else if(hasSupport&&hasStrain){plan.status='mixed_fit';plan.certaintyCap='有適配傾向但反證明顯';addApprovedClaim(plan,'可在此類工作結構中立足，但舒適度與長期適配存在明顯矛盾。',packet.clusters.map(function(x){return x.id;}));}
    else if(hasSupport){plan.status='supported_fit';plan.certaintyCap='較有適合傾向';addApprovedClaim(plan,'較適合此類工作結構，但不是唯一或絕對最適合。',packet.clusters.map(function(x){return x.id;}));}
    else{plan.status='work_link_only';plan.certaintyCap='工作連結明確，適配性未定';addApprovedClaim(plan,'與工作／機構有連結，不等於整體適合。',packet.clusters.map(function(x){return x.id;}));}
    plan.forbiddenClaims=['仍在職等於適合','穩定等於舒服','機構連結等於天職'];return plan;
  }
  if(type==='career_promotion'){
    var change=packetHasCoreStructure(packet,[17],q.concat([14,35,19,15])), authority=packetHasCoreStructure(packet,[19,15],q.concat([14,35,17])), confirm=packetHasCoreStructure(packet,[31,33,27,1,32],q.concat([14,35,17,19,15])), prisk=packetHasNegativeAround(packet,[17,19,15,14,35].concat(q));
    if(!change){plan.status='insufficient_promotion_change';plan.certaintyCap='牌面不足以判定會升遷';addApprovedClaim(plan,'可描述組織內位置或責任，但缺少職位／權責向上變動。',[]);}
    else if(authority||confirm){plan.status=prisk?'promotion_possible_with_risk':'promotion_possible';plan.certaintyCap='有升遷機會';addApprovedClaim(plan,'有職位變動與權威／確認支持，可說有升遷機會。',packet.clusters.map(function(x){return x.id;}));}
    else{plan.status='change_without_promotion_confirmation';plan.certaintyCap='有職場變動，不能確定是升遷';addApprovedClaim(plan,'變動不等於向上升遷。',packet.clusters.map(function(x){return x.id;}));}
    plan.forbiddenClaims=['被重視等於升遷','塔或鑰匙單獨等於升職'];return plan;
  }
  if(type==='health_symbolic_context'){plan.status='symbolic_health_only';plan.certaintyCap='可能';addApprovedClaim(plan,'可分析反覆、阻礙、耗損、壓力與生活脈絡的象徵狀態。',packet.clusters.map(function(x){return x.id;}));addApprovedClaim(plan,'象徵狀態不得寫成醫學病因。',[]);plan.forbiddenClaims=['診斷','病因','藥效','治療效果'];return plan;}
  addApprovedClaim(plan,'依核心證據與反證給出不超過 certainty_cap 的結論。',packet.clusters.map(function(x){return x.id;}));return plan;
}



function validateEvidencePacket(packet) {
  var errors = [], type = primaryDecisionType(packet.question.types || [packet.question.type]);
  var pairSeen = {};
  packet.directPairs.forEach(function(pair, idx){
    if (!pair.positions || pair.positions.length !== 2) errors.push('D' + (idx + 1) + ':invalid_pair');
    else {
      var key = pairSlotKey(pair.positions[0], pair.positions[1]);
      if (pairSeen[key]) errors.push('D' + (idx + 1) + ':duplicate_pair');
      pairSeen[key] = true;
    }
  });
  packet.segments.forEach(function(seg, idx){
    if (!seg.positions || seg.positions.length < 3) errors.push('S' + (idx + 1) + ':segment_too_short');
    var slots = (seg.positions || []).map(function(p){ return p.slot; });
    if (uniqueNumbers(slots).length !== slots.length) errors.push('S' + (idx + 1) + ':repeated_slot');
  });
  var allRefs = {}, clusterRefs = {};
  packet.structures.forEach(function(st){ allRefs[st.id] = true; });
  packet.clusters.forEach(function(c){
    c.refs.forEach(function(ref){
      if (!allRefs[ref]) errors.push(c.id + ':unknown_ref:' + ref);
      clusterRefs[ref] = (clusterRefs[ref] || 0) + 1;
    });
  });
  Object.keys(allRefs).forEach(function(ref){ if (clusterRefs[ref] !== 1) errors.push(ref + ':cluster_count=' + (clusterRefs[ref] || 0)); });
  if ((packet.modernContext.mirrors || []).length > 3) errors.push('mirrors_over_limit');
  if ((packet.modernContext.knightMoves || []).length > 3) errors.push('knights_over_limit');
  if ((packet.modernContext.intersections || []).length > 2) errors.push('intersections_over_limit');
  if (type === 'unsupported_age' && packet.structures.length) errors.push('age_packet_has_evidence');
  if (type === 'health_medical_cause' && packet.structures.length) errors.push('medical_cause_packet_has_evidence');
  if (type === 'timing' && packet.structures.length) errors.push('timing_packet_has_evidence');
  var claimClusterUse={};
  (packet.claimPlan&&packet.claimPlan.claimEvidence||[]).forEach(function(link){(link.clusters||[]).forEach(function(cid){if(!packet.clusters.some(function(c){return c.id===cid;}))errors.push('claim_unknown_cluster:'+cid);claimClusterUse[cid]=(claimClusterUse[cid]||0)+1;});});
  if(type==='life_guidance'||type==='attraction_opportunity'||type==='sexual_component'||type==='sexual_event'){
    if(type==='life_guidance'&&packet.claimPlan.status==='model_evaluate')errors.push('life_guidance_uses_generic_plan');
    Object.keys(claimClusterUse).forEach(function(cid){if(claimClusterUse[cid]>1)errors.push(type+'_cluster_reused:'+cid);});
    (packet.claimPlan.claimEvidence||[]).forEach(function(link){if((link.clusters||[]).length>2)errors.push(type+'_claim_overlinked');});
  }
  if (!packet.claimPlan || !packet.claimPlan.status || !packet.claimPlan.certaintyCap) errors.push('missing_claim_plan');
  return { ok:errors.length === 0, errors:errors };
}

function failClosedPacket(packet, validation) {
  packet.directPairs = [];
  packet.segments = [];
  packet.structures = [];
  packet.clusters = [];
  packet.housePositions = [];
  packet.modernContext = {personNeighborhoods:[],topicNeighborhoods:[],sharedCards:[],mirrors:[],knightMoves:[],intersections:[],corners:[],centers:[],clusterThemes:[],contextPositions:[]};
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
  var approvedView=buildApprovedEvidenceView(packet);
  var clusters=approvedView.clusters;
  var cardIds=uniqueNumbers((approvedView.structures||[]).reduce(function(out,st){return out.concat(st.cardIds||[]);},[]));
  var claimTexts=(packet.claimPlan&&packet.claimPlan.approvedClaims||[]).join(' ');
  var specialized=['attraction_opportunity','sexual_component','sexual_event'].indexOf(type)>-1;
  var hasPositive=specialized?clusters.some(function(c){return ['person_bridge','attraction_support','attraction_context','sexual_support','event_support','relation_support'].indexOf(c.role)>-1;}):clusters.some(function(c){return c.polarity==='positive';});
  var hasRisk=/阻礙|不明|中止|結束|切斷|負擔|損耗|限制|降低/.test(claimTexts)&&clusters.some(function(c){return c.role==='risk'||(!specialized&&(c.polarity==='negative'||c.polarity==='mixed'));});
  var hasContradiction=hasPositive&&hasRisk,hasRepetition=/反覆/.test(claimTexts)&&cardIds.indexOf(11)>-1;
  var min=1,max=3;
  if(type==='business_success'){min=2;max=4;}
  else if(type==='life_guidance'){min=2;max=3;}
  else if(type==='debt_clearance'||type==='positive_net_worth'){min=1;max=2;}
  else if(questionTypeDomain(type)==='relationship'||/^career_/.test(type)){min=2;max=4;}
  return {items:[],paragraphMin:min,paragraphMax:max,favorable:hasPositive?'required':'insufficient_or_omit',risk:hasRisk?'required':'omit_if_absent',repetition:hasRepetition?'required':'omit',contradiction:hasContradiction?'required':'omit'};
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

function buildPrompt(question, drawn, spreadId, sigGender, declaredGender) {
  var sp=SPREADS[spreadId], q=String(question||'').trim(), lines=[], isGT=spreadId==='grand'&&drawn.length===36, stoneEvidence=drawn;
  function cardLabel(c){return c.id+'.'+c.name;}
  function xmlEscape(value){return String(value==null?'':value).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
  var questions=splitQuestionSegments(q), roles=getPersonRoleIds(declaredGender), typeSet={};
  var comparison=detectComparisonQuestion(q), isSymmetricComparison=!!comparison && spreadId==='nine' && drawn.length===9, isInvalidComparison=!!comparison && !isSymmetricComparison;
  questions.forEach(function(item){(item.types||[item.type]).forEach(function(type){typeSet[type]=true;});});

  lines.push('# 最高規則');
  lines.push('你是本站 Petit Lenormand v7.5 原子證據解讀器。第一句依 proposition 順序直接回答。');
  lines.push('只輸出 claim_plan 核准的主張；certainty_cap 只能維持或降低。每項主張只能使用 claim_evidence 指定且未被其他主張占用的C；同一C與同一evidence_uid全題只計一次。');
  lines.push('selected_context只描述已成立主張的樣貌，不新增結論。D／S／C、脈絡、牌號、座標與房屋均不自行表示時間、因果、互相意圖或事件已發生。');
  if(questions.some(function(item){return !!item.timeScope;}))lines.push('time_scope只固定使用者明示的評估範圍，可在結論中原樣回應「今年／本月」；不得縮小、延伸或換算成日期與先後階段。');
  lines.push('沒有證據的 analysis_requirements 直接省略；不得自行補入 claim_plan 未批准的具體行動、期限、金額、人物或事件。');
  lines.push('固定負向語義：棺材＝結束；鐮刀＝切斷；山＝阻礙；老鼠＝損耗；十字架＝負擔；雲＝不明；鞭子＝衝突／反覆。');
  lines.push('<method_scope>館藏可核實36張牌組與4頁說明；4×8+4及人物牌附近閱讀採保存說明書傳統。approved_dictionary是本站受控的現代工作詞典，不冒充原始說明書逐字牌義或唯一現代標準。D／S／C、房屋、鏡像、騎士跳、門檻與計分皆為本站規約。</method_scope>');
  var boundaryExamples=[];
  if(typeSet.timing)boundaryExamples.push('timing_rules=false：回答無法判定具體時間，不以牌號或座標猜日期。');
  if(typeSet.business_success||typeSet.finance||typeSet.debt_clearance||typeSet.positive_net_worth)boundaryExamples.push('收入或副業成功不等於負債歸零，也不等於正資產。');
  if(typeSet.business_success||typeSet.finance)boundaryExamples.push('狐狸、魚、錨等牌只可描述工作／資源／穩定結構；不得自行延伸成清庫存、投廣告、調價格、追毛利等營運建議。');
  if(typeSet.life_guidance)boundaryExamples.push('人生建議題只可輸出 approved_claims 已核准的篩選原則；不得自行指定職業、離職、分手、搬家、期限或唯一使命。');
  if(boundaryExamples.length)lines.push('<boundary_examples>'+boundaryExamples.map(function(x){return '<example>'+x+'</example>';}).join('')+'</boundary_examples>');
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

  lines.push('<reading_request method_profile="site_petit_lenormand_v7_5_atomic_evidence">');
  lines.push('<question_original>'+xmlEscape(q||'未指定具體問題')+'</question_original>');
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
  }else if(isGT){
    var geometry=buildGrandGeometry(drawn), globalUsedCards={};
    var packetItems=questions.map(function(item){var packet=buildEvidencePacket(geometry,item,declaredGender);return{item:item,packet:packet};});
    assignGlobalEvidenceUids(packetItems);
    enforceGlobalClaimEvidenceUniqueness(packetItems);
    packetItems.forEach(function(entry){entry.promptView=buildApprovedEvidenceView(entry.packet);Object.keys(entry.promptView.usedCards).forEach(function(id){globalUsedCards[id]=entry.promptView.usedCards[id];});});
    stoneEvidence=packetItems;
    packetItems.forEach(function(entry){
      var item=entry.item,packet=entry.packet,type=item.type,policy=CLAIM_POLICIES[type];
      lines.push('<evidence_packet proposition_id="'+item.id+'" type="'+type+'" target_scope="'+item.targetScope+'">');
      lines.push('<question>'+xmlEscape(item.text)+'</question>');
      lines.push('<packet_validation status="'+(packet.validation&&packet.validation.ok?'pass':'fail')+'"></packet_validation>');
      if(roles.counterpart&&questionTypeDomain(type)==='relationship')lines.push('<role name="counterpart_significator" status="'+personStatusForScope(item.targetScope)+'">'+cardLabel(CARDS[roles.counterpart-1])+'</role>');
      if(policy)lines.push('<decision_boundary>'+xmlEscape(policy.meaning+' '+policy.forbidden)+'</decision_boundary>');
      lines.push('<claim_plan status="'+packet.claimPlan.status+'" certainty_cap="'+xmlEscape(packet.claimPlan.certaintyCap)+'">');
      lines.push('<required_conclusion>'+xmlEscape(packet.claimPlan.requiredConclusion)+'</required_conclusion>');
      lines.push('<approved_claims>');packet.claimPlan.approvedClaims.forEach(function(x,idx){lines.push('<claim id="A'+(idx+1)+'">'+xmlEscape(x)+'</claim>');});lines.push('</approved_claims>');
      if(packet.claimPlan.claimEvidence&&packet.claimPlan.claimEvidence.length){lines.push('<claim_evidence>');packet.claimPlan.claimEvidence.forEach(function(link){if(link.clusters&&link.clusters.length)lines.push('<support claim="A'+link.claimIndex+'" clusters="'+link.clusters.join(',')+'"></support>');else lines.push('<support claim="A'+link.claimIndex+'" basis="rule_limit"></support>');});lines.push('</claim_evidence>');}
      lines.push('<forbidden_claims>');packet.claimPlan.forbiddenClaims.forEach(function(x){lines.push('<claim>'+xmlEscape(x)+'</claim>');});lines.push('</forbidden_claims>');
      lines.push('</claim_plan>');

      var promptView=entry.promptView||buildApprovedEvidenceView(packet);
      if(promptView.structures.length){
        lines.push('<approved_evidence_scope rule="only_claim_linked">');
        lines.push('<evidence_catalog>');
        promptView.structures.forEach(function(st){lines.push(st.id+' uid='+(st.evidenceUid||'local')+' '+st.positions.map(function(p){return cardLabel(p.card);}).join(st.kind==='adjacency'?' & ':' > '));});
        lines.push('</evidence_catalog>');
        lines.push('<core_clusters confidence_counting="one_per_cluster">');
        promptView.clusters.forEach(function(c){lines.push('<cluster id="'+c.id+'" kind="'+c.kind+'" evidence_role="'+xmlEscape(c.role||'neutral')+'" polarity="'+c.polarity+'" refs="'+c.refs.filter(function(ref){return promptView.structures.some(function(st){return st.id===ref;});}).join(',')+'">'+xmlEscape(c.theme)+'</cluster>');});
        lines.push('</core_clusters>');
        lines.push('</approved_evidence_scope>');
      }

      if(promptView.clusterThemes.length){
        lines.push('<selected_context certainty_effect="none" scope="approved_clusters_only">');
        promptView.clusterThemes.forEach(function(t,idx){lines.push('T'+(idx+1)+' cluster='+t.clusterId+' '+t.label+'='+t.positions.map(function(p){return cardLabel(p.card);}).join('、'));});
        lines.push('</selected_context>');
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
  }else{
    lines.push('<spread>'+sp.name+'（'+sp.count+'張）</spread>');
    lines.push('<drawn_cards>');for(var i=0;i<drawn.length;i++){var pos=sp.positions?sp.positions[i]:('第'+(i+1)+'張');lines.push((i+1)+'. '+pos+'＝'+cardLabel(drawn[i])+'（'+drawn[i].key+'）'+(drawn[i]._presetSig?'〔預置焦點，非隨機抽中〕':''));}lines.push('</drawn_cards>');
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
  lines.push('正文只展開各題 analysis_requirements 中實際啟用的項目；每個判斷都要能回指批准證據，沒有證據就明說不足或省略。');
  lines.push('每段只處理一項 approved_claim；末尾僅列該 claim_evidence 的證據。D寫牌對、S寫完整線段；同一C內多個D／S只能整合成一組證據，不得拆成多份信心，不得輸出uid。');
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
  buildEvidencePacket: buildEvidencePacket,
  buildApprovedEvidenceView: buildApprovedEvidenceView,
  assignGlobalEvidenceUids: assignGlobalEvidenceUids,
  enforceGlobalClaimEvidenceUniqueness: enforceGlobalClaimEvidenceUniqueness,
  buildClaimPlan: buildClaimPlan,
  structureEvidenceRole: structureEvidenceRole,
  clusterIdsByRole: clusterIdsByRole,
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
