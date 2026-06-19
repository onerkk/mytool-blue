// ═══════════════════════════════════════
// 靜月之光 — 雷諾曼牌 Lenormand v5.2
// v5.2（2026-06-19）證據優先提示詞／動態水晶推薦根治：
//   1. 問題不再只掛一個領域標籤；先拆成桃花機會、性／肉體成分、事件落實、年齡等獨立 proposition。
//   2. 人物角色新增 identified／hypothetical／method_placeholder，方法占位牌不得實體化成已出現人物。
//   3. 證據簇改依命題角色集合分組，不再用傳遞式共享核心把整張牌網合成單一 C。
//   4. 現代脈絡先做新訊息去重與數量上限；鏡像、騎士跳、交會不再全量傾倒。
//   5. claim_plan 產生 approved／forbidden claims；吸引、性成分、實際事件不得互相借證升級。
//   6. 年齡與醫學病因命題採 fail-closed 空證據包；健康另保留象徵性深讀 proposition。
//   7. 每個 evidence_packet 通過程式驗證後才輸出；失敗時封閉為「無法可靠解讀」。
//   8. A／B 適配比較題固定使用預先分配的對稱九宮格；選項名稱不得映射成同名牌，兩側使用完全相同的位置規則與權重。
//   9. 比較語意改由「替代連接詞＋選擇語法」解析；「自己喜歡還是看八字五行」不再誤落一般題。
//  10. 提示詞改為優先規則→證據→依證據啟用的分析契約→輸出，移除重複且無證據仍強迫展開的固定清單。
//  11. 水晶結尾由問題、命題與實際抽牌召回候選，AI完成解讀後依主結論選一項；無吻合方向則不強推。
// Petit Lenormand 36 張・歷史基線＋本站明示的現代判讀規約
// ═══════════════════════════════════════
(function () {
'use strict';
console.log('[Lenormand] 靜月之光 雷諾曼牌 v5.2 loaded — 證據優先提示詞／動態水晶推薦根治');

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
    core:[30,7],
    support:[24,25,9,31,32],
    contextual:[30,7]
  },
  sexual_event: {
    label:'實際肉體關係事件',
    core:[30,7,25],
    support:[24,1,12,31,33,4,8,10,21,6,23,19],
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
  finance: {
    label:'財務', core:[34,15], support:[35,23,31,33], contextual:[]
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
  unsupported_age: {
    label:'數字年齡（不可驗證）', core:[], support:[], contextual:[]
  },
  general: {
    label:'一般問題', core:[24,25,34,35,31,33], support:[6,8,10,21,23,36], contextual:[]
  }
};

var HARD_NEGATIVE_IDS = [6,8,10,11,21,23,36];
var ATTRACTION_POSITIVE_IDS = [9,16,17,24,25,31,32,33,1];
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
    meaning:'只判斷桃花是否帶有肉體、感官或性吸引成分。百合與蛇是本站本題專用現代情境牌；心、戒指、太陽或魚不能單獨證明性吸引。',
    forbidden:'魚只按財富／生意／流動，不得寫成慾望；鞭子本站只按衝突／反覆，不得當性行為牌。'
  },
  sexual_event:{
    meaning:'判斷是否足以支持實際肉體關係事件；吸引與性成分不等於事件落實。',
    forbidden:'沒有獨立的性焦點核心結構與關係落實結構，不得寫成會上床、會發生關係或已發生。'
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
  var m = t.match(/今年|明年|後年|本月|下個月|未來\\s*\\d+\\s*(?:天|週|月|年)內|\\d+\\s*(?:天|週|月|年)內|近期|接下來/);
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
  if (/財運|收入|存款|負債|投資|股票|貸款|金錢|錢|資金|還債/.test(t)) types.push('finance');
  if (/適不適合.{0,8}(?:工作|職場|正職)|(?:工作|職場|正職|這份工作).{0,8}(?:適合|合適)|天職|適合我做|適合做下去/.test(t)) types.push('career_fit');
  if (/升遷|升職|晉升|被提拔|升主管|職位.{0,5}(?:提升|上升)|加官|被重用/.test(t)) types.push('career_promotion');
  if (/轉職|離職|換工作|跳槽|錄取|面試|新工作|換.{0,4}職場/.test(t)) types.push('career_change');
  if (!types.some(function(x){ return /^career_/.test(x); }) && /工作|職場|正職|主管|同事|職涯|上班/.test(t)) types.push('career_general');

  if (/健康|身體|病|疾病|手術|恢復|康復|症狀|發炎|痘痘|長痘|皮膚|過敏|疼痛|不舒服/.test(t)) {
    if (hasMedicalCauseIntent(t)) {
      types.push('health_medical_cause');
      types.push('health_symbolic_context');
    } else {
      types.push('health_symbolic_context');
    }
  }
  if (/旅行|旅遊|出國|搬家|遷移|遠方|移居|出差/.test(t)) types.push('travel');
  if (/聯絡|訊息|回覆|聊天|溝通|傳訊|來找我|聯繫/.test(t)) types.push('communication');
  if (/什麼時候|何時|多久|幾時|哪一年|哪個月|幾月|時間點|應期|多快/.test(t)) types.push('timing');

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
  if (/^business_|^career_|^finance$/.test(type)) return 'work_money';
  if (/^health_/.test(type)) return 'health';
  if (type === 'travel') return 'travel';
  if (type === 'communication') return 'communication';
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
  if (type === 'unsupported_age') return '數字年齡或年齡區間是否可判定';
  if (type === 'health_medical_cause') return '醫學病因是否能由牌面判定';
  if (type === 'health_symbolic_context') return '健康議題在牌面呈現的象徵性狀態';
  return original;
}

function expandSegmentToQuestions(text, baseIndex) {
  var dims = inferQuestionDimensions(text);
  var mainTypes = dims.types.filter(function(t){ return t !== 'timing' && t !== 'unsupported_age'; });
  var out = [];
  mainTypes.forEach(function(type, idx) {
    out.push({
      id:'q' + baseIndex + (mainTypes.length > 1 ? String.fromCharCode(97 + idx) : ''),
      parentId:'q' + baseIndex,
      text:propositionText(type, text, dims.comparison),
      originalText:text,
      type:type,
      types:uniqueStrings([type].concat(dims.types.indexOf('timing') > -1 ? ['timing'] : [])),
      targetScope:dims.targetScope,
      qualifiers:[],
      timeScope:dims.timeScope,
      comparison:dims.comparison || null,
      options:dims.comparison ? dims.comparison.options.slice() : []
    });
  });
  if (dims.qualifiers.length || dims.types.indexOf('unsupported_age') > -1) {
    out.push({
      id:'q' + baseIndex + (out.length ? String.fromCharCode(97 + out.length) : ''),
      parentId:'q' + baseIndex,
      text:propositionText('unsupported_age', text, dims.comparison),
      originalText:text,
      type:'unsupported_age', types:['unsupported_age'], targetScope:dims.targetScope,
      qualifiers:dims.qualifiers.length ? dims.qualifiers : [{kind:'relative_or_unknown_age',raw:'年齡條件',assessable:false}],
      timeScope:dims.timeScope
    });
  }
  if (!out.length) out.push({ id:'q' + baseIndex, parentId:'q' + baseIndex, text:text, originalText:text, type:'general', types:['general'], targetScope:dims.targetScope, qualifiers:[], timeScope:dims.timeScope });
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
  if (type === 'unsupported_age' || type === 'health_medical_cause') return {anchors:[],supports:[],all:[],contextual:[]};
  if (roles.querent) anchors.push(roles.querent);
  var relationshipLike = questionTypeDomain(type) === 'relationship' || questionItem.targetScope !== 'unspecified';
  if (relationshipLike && roles.counterpart) anchors.push(roles.counterpart);
  var def = QUESTION_SCHEMAS[type] || QUESTION_SCHEMAS.general;
  anchors = anchors.concat(def.core || []);
  supports = supports.concat(def.support || []);
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

function classifyClusterPolarity(cardIds) {
  var neg = cardIds.filter(function(id){ return HARD_NEGATIVE_IDS.indexOf(id)>-1; }).length;
  var pos = cardIds.filter(function(id){ return ATTRACTION_POSITIVE_IDS.indexOf(id)>-1; }).length;
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
  if (/^career_/.test(type)) return '工作／制度／變動結構';
  if (/^health_/.test(type)) return '健康議題的象徵性結構';
  return '核心牌周圍結構';
}

function buildClusters(structures, anchorSlots, type, declaredGender) {
  var roles = getPersonRoleIds(declaredGender);
  function roleTags(st) {
    var ids = st.cardIds || uniqueNumbers(st.positions.map(function(p){ return p.card.id; }));
    var tags = [];
    if (roles.querent && ids.indexOf(roles.querent) > -1) tags.push('querent');
    if (roles.counterpart && ids.indexOf(roles.counterpart) > -1) tags.push('counterpart');
    if (type === 'attraction_opportunity') {
      if (ids.some(function(id){ return [24,9,31,32].indexOf(id) > -1; })) tags.push('attraction');
      if (ids.indexOf(25) > -1) tags.push('relationship');
    } else if (type === 'sexual_component' || type === 'sexual_event') {
      if (ids.some(function(id){ return [30,7].indexOf(id) > -1; })) tags.push('sexual');
      if (ids.some(function(id){ return [24,25].indexOf(id) > -1; })) tags.push('relationship');
    } else if (/^career_/.test(type)) {
      if (ids.some(function(id){ return [14,35].indexOf(id) > -1; })) tags.push('work');
      if (ids.some(function(id){ return [17,19,15].indexOf(id) > -1; })) tags.push('status_change');
    } else if (type === 'business_success' || type === 'finance') {
      if (ids.some(function(id){ return [34,35,31,15].indexOf(id) > -1; })) tags.push('resource');
    } else if (type === 'health_symbolic_context') {
      if (ids.indexOf(5) > -1) tags.push('health');
    }
    if (!tags.length) {
      var anchorIds = uniqueNumbers(st.positions.filter(function(p){ return !!anchorSlots[p.slot]; }).map(function(p){ return p.card.id; })).sort(function(a,b){ return a-b; });
      tags = anchorIds.map(function(id){ return 'a' + id; });
    }
    return uniqueStrings(tags).sort();
  }
  var map = {};
  structures.forEach(function(st){
    var tags = roleTags(st);
    if (!tags.length) return;
    var key = tags.join('+');
    if (!map[key]) map[key] = { key:key, refs:[], structures:[], cardIds:[], anchorIds:[], tags:tags };
    map[key].refs.push(st.id); map[key].structures.push(st);
    map[key].cardIds = uniqueNumbers(map[key].cardIds.concat(st.positions.map(function(p){ return p.card.id; })));
    map[key].anchorIds = uniqueNumbers(map[key].anchorIds.concat(st.positions.filter(function(p){ return !!anchorSlots[p.slot]; }).map(function(p){ return p.card.id; })));
  });
  return Object.keys(map).map(function(k,idx){
    var c = map[k];
    c.id = 'C' + (idx + 1);
    c.kind = c.tags.length > 1 ? 'bridge' : 'local';
    c.theme = clusterThemeFor(type,c.anchorIds,c.cardIds);
    c.polarity = classifyClusterPolarity(c.cardIds);
    return c;
  });
}

function buildModernContext(geometry, profile, anchorPositions, directPairs, relevantSegments, declaredGender, type, clusters) {
  var roles=getPersonRoleIds(declaredGender), personIds=uniqueNumbers([roles.querent,roles.counterpart]);
  var personCenters=anchorPositions.filter(function(p){return personIds.indexOf(p.card.id)>-1;}).slice(0,2);
  var topicCenters=anchorPositions.filter(function(p){return personIds.indexOf(p.card.id)===-1;}).slice(0,3);
  var personNeighborhoods=personCenters.map(function(p){return neighborhoodFor(geometry,p);});
  var topicNeighborhoods=topicCenters.map(function(p){return neighborhoodFor(geometry,p);});
  var personSlots={}, topicSlots={};
  personNeighborhoods.forEach(function(n){n.positions.forEach(function(p){personSlots[p.slot]=p;});});
  topicNeighborhoods.forEach(function(n){n.positions.forEach(function(p){topicSlots[p.slot]=p;});});
  var sharedCards=Object.keys(personSlots).filter(function(s){return !!topicSlots[s];}).map(function(s){return personSlots[s];});

  var directKeys={}; directPairs.forEach(function(p){directKeys[pairSlotKey(p.positions[0],p.positions[1])]=true;});
  function isRedundantPair(a,b){
    if (directKeys[pairSlotKey(a,b)]) return true;
    return relevantSegments.some(function(seg){return segmentContainsBoth(seg,a,b);});
  }
  var relevantIds=uniqueNumbers(profile.all.concat(HARD_NEGATIVE_IDS).concat(type==='sexual_component'||type==='sexual_event'?SEXUAL_CONTEXT_IDS:[]));
  function contextScore(source,target){
    var score=0;
    if (profile.anchors.indexOf(target.card.id)>-1) score+=5;
    if (profile.supports.indexOf(target.card.id)>-1) score+=3;
    if (HARD_NEGATIVE_IDS.indexOf(target.card.id)>-1) score+=3;
    if ((type==='sexual_component'||type==='sexual_event') && SEXUAL_CONTEXT_IDS.indexOf(target.card.id)>-1) score+=5;
    if (relevantIds.indexOf(target.card.id)>-1) score+=1;
    return score;
  }
  var mirrorCandidates=[];
  anchorPositions.forEach(function(p){mirrorTargetsFor(geometry,p).forEach(function(m){if(!isRedundantPair(m.source,m.target)){m.score=contextScore(m.source,m.target);if(m.score>0)mirrorCandidates.push(m);}});});
  mirrorCandidates.sort(function(a,b){return b.score-a.score;});
  var mirrors=mirrorCandidates.slice(0,3);
  var knightCandidates=[];
  anchorPositions.forEach(function(p){knightTargetsFor(geometry,p).forEach(function(k){if(!isRedundantPair(k.source,k.target)){k.score=contextScore(k.source,k.target);if(k.score>0)knightCandidates.push(k);}});});
  knightCandidates.sort(function(a,b){return b.score-a.score;});
  var knightMoves=knightCandidates.slice(0,3);

  var intersections=[];
  for(var i=0;i<relevantSegments.length;i++)for(var j=i+1;j<relevantSegments.length;j++){
    var slotsA={};relevantSegments[i].positions.forEach(function(p){slotsA[p.slot]=p;});
    var shared=uniquePositions(relevantSegments[j].positions.filter(function(p){return slotsA[p.slot];}));
    if(shared.length && shared.some(function(p){return profile.anchors.indexOf(p.card.id)===-1;})) intersections.push({a:'S'+(i+1),b:'S'+(j+1),positions:shared});
  }
  intersections=intersections.slice(0,2);

  var contextPositions=[];
  personNeighborhoods.concat(topicNeighborhoods).forEach(function(n){contextPositions=contextPositions.concat(n.positions);});
  mirrors.forEach(function(m){contextPositions.push(m.source,m.target);});
  knightMoves.forEach(function(k){contextPositions.push(k.source,k.target);});
  contextPositions=uniquePositions(contextPositions);

  var clusterThemes=[];
  (clusters||[]).forEach(function(cluster){
    var positions=cardSetFromStructures(cluster.structures);
    MODERN_THEME_GROUPS.forEach(function(group){
      var hits=positions.filter(function(p){return group.cards.indexOf(p.card.id)>-1;});
      if(hits.length>=2) clusterThemes.push({clusterId:cluster.id,id:group.id,label:group.label,positions:hits});
    });
  });
  clusterThemes=clusterThemes.slice(0,4);
  var corners=[],centers=[];
  if (type==='general') {
    [[1,1],[1,8],[4,1],[4,8]].forEach(function(rc){var idx=gtIndexAt(rc[0],rc[1]);if(idx>=0)corners.push(geometry.positions[idx]);});
    [[2,4],[2,5],[3,4],[3,5]].forEach(function(rc){var idx=gtIndexAt(rc[0],rc[1]);if(idx>=0)centers.push(geometry.positions[idx]);});
  }
  return {personNeighborhoods:personNeighborhoods,topicNeighborhoods:topicNeighborhoods,sharedCards:sharedCards,mirrors:mirrors,knightMoves:knightMoves,intersections:intersections,corners:corners,centers:centers,clusterThemes:clusterThemes,contextPositions:contextPositions};
}

function structureHasCards(structure, idsA, idsB) {
  var ids=structure.cardIds||uniqueNumbers(structure.positions.map(function(p){return p.card.id;}));
  return idsA.some(function(x){return ids.indexOf(x)>-1;}) && idsB.some(function(x){return ids.indexOf(x)>-1;});
}
function packetHasCoreStructure(packet, idsA, idsB) { return packet.structures.some(function(st){return structureHasCards(st,idsA,idsB);}); }
function packetHasDirectPair(packet, idsA, idsB) { return packet.directPairs.some(function(p){return structureHasCards({positions:p.positions},idsA,idsB);}); }
function packetHasNegativeAround(packet, ids) { return packet.structures.some(function(st){return structureHasCards(st,ids,HARD_NEGATIVE_IDS);}); }


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
  if(type==='unsupported_age'||type==='health_medical_cause'){
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
      var keep=!!focusSlots[n.slot]||!!personSlotMap[a.position.slot]||HARD_NEGATIVE_IDS.indexOf(n.card.id)>-1;
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
  var plan={status:'model_evaluate',certaintyCap:'較有傾向',requiredConclusion:'依 approved_claims 與核心證據呈現正反面；不得超過 certainty_cap。',approvedClaims:[],forbiddenClaims:[]};
  if(type==='comparison_suitability'){
    plan.status='comparison_requires_symmetric_nine';plan.certaintyCap='無法由大牌陣公平比較';plan.requiredConclusion='比較題必須使用抽牌前預先分配的對稱九宮格。';plan.approvedClaims=['目前牌陣沒有為兩個選項建立對稱位置，不能公平比較。'];plan.forbiddenClaims=['將選項名稱套成同名牌','事後挑牌代表選項'];return plan;
  }
  if(type==='unsupported_age'){
    plan.status='unsupported_age';plan.certaintyCap='不足以判定';plan.requiredConclusion='直接回答數字年齡與區間無法驗證，不得引用牌面側證。';plan.approvedClaims=['無 age_rules，無法判定數字年齡或年齡區間。'];plan.forbiddenClaims=['任何歲數、區間、年輕／年長側推'];return plan;
  }
  if(type==='health_medical_cause'){
    plan.status='medical_limit';plan.certaintyCap='不足以判定';plan.requiredConclusion='先明說牌面不能判定醫學病因；不得引用牌面作病因。';plan.approvedClaims=['牌面無法判定醫學病因、診斷或治療。'];plan.forbiddenClaims=['壓力、飲食、荷爾蒙、器官或藥物效果的病因斷言'];return plan;
  }
  if(type==='attraction_opportunity'){
    var bridge=packetHasCoreStructure(packet,q,c), positive=packetHasCoreStructure(packet,q.concat(c),ATTRACTION_POSITIVE_IDS), risk=packetHasNegativeAround(packet,c);
    if(bridge&&positive){plan.status=risk?'attraction_supported_with_risk':'attraction_supported';plan.certaintyCap='較有桃花／吸引傾向';plan.approvedClaims.push('牌面支持非現任桃花或吸引機會。');}
    else if(positive){plan.status='attraction_possible';plan.certaintyCap='有機會';plan.approvedClaims.push('牌面有桃花或被注意的機會，但人物間連結不足。');}
    else{plan.status='attraction_insufficient';plan.certaintyCap='不足以明確判定';plan.approvedClaims.push('牌面不足以明確支持非現任桃花。');}
    if(risk)plan.approvedClaims.push('阻礙、不明或中止因素會削弱桃花落實。');
    plan.approvedClaims.push('假設性人物焦點不證明真人目前已出現。');
    plan.forbiddenClaims=['互相注意','她已經出現','已經曖昧','一定會交往','肉體關係已發生'];return plan;
  }
  if(type==='sexual_component'){
    var sexualCore=packetHasCoreStructure(packet,SEXUAL_CONTEXT_IDS,q.concat(c,[24,25]));
    var contextSex=(packet.modernContext.mirrors||[]).concat(packet.modernContext.knightMoves||[]).some(function(x){return SEXUAL_CONTEXT_IDS.indexOf(x.source.card.id)>-1||SEXUAL_CONTEXT_IDS.indexOf(x.target.card.id)>-1;});
    if(sexualCore){plan.status='sexual_component_supported';plan.certaintyCap='較有肉體／性吸引傾向';plan.approvedClaims=['核心結構支持桃花帶有肉體或感官吸引。'];}
    else if(contextSex){plan.status='sexual_component_context_only';plan.certaintyCap='可能';plan.approvedClaims=['只有現代輔助脈絡支持肉體或感官成分，不能升級為明顯性吸引。'];}
    else{plan.status='sexual_component_insufficient';plan.certaintyCap='不足以明確判定';plan.approvedClaims=['一般桃花證據不能代替肉體／性吸引證據。'];}
    plan.forbiddenClaims=['魚代表慾望','鞭子代表性行為','一般桃花等於肉體桃花','一定有性吸引'];return plan;
  }
  if(type==='sexual_event'){
    var sexLink=packetHasCoreStructure(packet,SEXUAL_CONTEXT_IDS,q.concat(c)), relationLink=packetHasCoreStructure(packet,[25,24],q.concat(c)), eventRisk=packetHasNegativeAround(packet,q.concat(c,[25,30,7]));
    if(sexLink&&relationLink){plan.status=eventRisk?'sexual_event_possible_with_risk':'sexual_event_possible';plan.certaintyCap='有機會但不能確定發生';plan.approvedClaims=['肉體焦點與關係焦點均有核心結構，可說存在落實機會，但不能斷成事件必然發生。'];}
    else{plan.status='sexual_event_insufficient';plan.certaintyCap='不足以判定實際發生';plan.approvedClaims=['吸引或性成分不等於實際肉體關係；目前缺少獨立落實結構。'];}
    if(eventRisk)plan.approvedClaims.push('阻礙、不明、損耗或切斷會降低事件落實。');
    plan.forbiddenClaims=['一定會上床','已發生性關係','具體次數','具體時間'];return plan;
  }
  if(type==='career_fit'){
    var hasWork=packetHasCoreStructure(packet,q,[14,35,19]), hasSupport=packetHasCoreStructure(packet,[14,35],[4,5,30,24,33]), hasStrain=packetHasNegativeAround(packet,q.concat([14,35]));
    if(!hasWork){plan.status='insufficient_fit';plan.certaintyCap='牌面不足以明確判定';plan.approvedClaims=['只能描述工作環境訊號，不能斷定適合。'];}
    else if(hasSupport&&hasStrain){plan.status='mixed_fit';plan.certaintyCap='有適配傾向但反證明顯';plan.approvedClaims=['可在此類工作結構中立足，但舒適度與長期適配存在明顯矛盾。'];}
    else if(hasSupport){plan.status='supported_fit';plan.certaintyCap='較有適合傾向';plan.approvedClaims=['較適合此類工作結構，但不是唯一或絕對最適合。'];}
    else{plan.status='work_link_only';plan.certaintyCap='工作連結明確，適配性未定';plan.approvedClaims=['與工作／機構有連結，不等於整體適合。'];}
    plan.forbiddenClaims=['仍在職等於適合','穩定等於舒服','機構連結等於天職'];return plan;
  }
  if(type==='career_promotion'){
    var change=packetHasCoreStructure(packet,[17],q.concat([14,35,19,15])), authority=packetHasCoreStructure(packet,[19,15],q.concat([14,35,17])), confirm=packetHasCoreStructure(packet,[31,33,27,1,32],q.concat([14,35,17,19,15])), prisk=packetHasNegativeAround(packet,[17,19,15,14,35].concat(q));
    if(!change){plan.status='insufficient_promotion_change';plan.certaintyCap='牌面不足以判定會升遷';plan.approvedClaims=['可描述組織內位置或責任，但缺少職位／權責向上變動。'];}
    else if((authority||confirm)){plan.status=prisk?'promotion_possible_with_risk':'promotion_possible';plan.certaintyCap='有升遷機會';plan.approvedClaims=['有職位變動與權威／確認支持，可說有升遷機會。'];if(prisk)plan.approvedClaims.push('阻礙或壓力會降低落實度。');}
    else{plan.status='change_without_promotion_confirmation';plan.certaintyCap='有職場變動，不能確定是升遷';plan.approvedClaims=['變動不等於向上升遷。'];}
    plan.forbiddenClaims=['被重視等於升遷','塔或鑰匙單獨等於升職'];return plan;
  }
  if(type==='health_symbolic_context'){
    plan.status='symbolic_health_only';plan.certaintyCap='可能';plan.approvedClaims=['可分析反覆、阻礙、耗損、壓力與生活脈絡的象徵狀態。','象徵狀態不得寫成醫學病因。'];plan.forbiddenClaims=['診斷','病因','藥效','治療效果'];return plan;
  }
  plan.approvedClaims=['依核心證據與反證給出不超過 certainty_cap 的結論。'];return plan;
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
    forbiddenClaims:['任何牌面結論']
  };
  packet.validation = validation;
  return packet;
}

function buildEvidenceAwareAnalysisRequirements(packet) {
  var clusters = packet && packet.clusters ? packet.clusters : [];
  var cardIds = uniqueNumbers((packet && packet.structures ? packet.structures : []).reduce(function(out, st){
    return out.concat(st.cardIds || (st.positions || []).map(function(p){ return p.card.id; }));
  }, []));
  var hasPositive = clusters.some(function(c){ return c.polarity === 'positive'; });
  var hasRisk = clusters.some(function(c){ return c.polarity === 'negative' || c.polarity === 'mixed'; });
  var hasContradiction = hasPositive && hasRisk;
  var hasRepetition = cardIds.indexOf(11) > -1 || cardIds.indexOf(25) > -1;
  var items = ['核心判斷與核心動力（必寫）'];
  items.push(hasPositive ? '有利因素（有獨立正向C，必寫）' : '有利因素（若無獨立正向C，直接說證據不足，不得硬補）');
  items.push(hasRisk ? '阻礙與風險（有負向或混合C，必寫）' : '阻礙與風險（若無相應C可省略）');
  items.push(hasRepetition ? '反覆／循環模式（牌面含戒指或鞭子，可分析但不得當時間順序）' : '反覆模式（無戒指／鞭子證據，省略）');
  items.push(hasContradiction ? '正反矛盾（正向與負向／混合C並存，必寫）' : '正反矛盾（未形成對立證據，省略）');
  items.push('可能的實際表現（只寫條件式表現，不把事件寫成已發生）');
  items.push('未知邊界與牌面未證明的部分（必寫）');
  var paragraphMax = Math.min(6, Math.max(2, 2 + (hasPositive?1:0) + (hasRisk?1:0) + (hasContradiction?1:0)));
  return {
    items:items, paragraphMin:2, paragraphMax:paragraphMax,
    favorable:hasPositive?'required':'insufficient_or_omit',
    risk:hasRisk?'required':'omit_if_absent',
    repetition:hasRepetition?'required':'omit',
    contradiction:hasContradiction?'required':'omit'
  };
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

function buildStoneRecommendationCandidates(question, questions, drawn) {
  var q = String(question || ''), scores = {}, reasons = {}, types = {};
  (questions || []).forEach(function(item){ (item.types || [item.type]).forEach(function(t){ types[t] = true; }); });
  var ids = uniqueNumbers((drawn || []).map(function(c){ return c && c.id; }));
  function cardHits(group){ return ids.filter(function(id){ return group.indexOf(id) > -1; }).length; }

  if (/還是|選擇|比較|哪(?:一)?個|五行|搭配|猶豫|判斷/.test(q) || types.comparison_suitability) _lnAddStoneScore(scores,reasons,'amethyst',5,'選擇與判斷');
  if (/感情|愛情|戀愛|伴侶|桃花|關係|情感互動/.test(q) || types.attraction_opportunity || types.relationship_intent || types.relationship_future || types.relationship_longevity) _lnAddStoneScore(scores,reasons,'rose_quartz',5,'情感與互動');
  if (/副業|生意|賣場|訂單|業績|財運|收入|資金|工作目標/.test(q) || types.business_success || types.finance) _lnAddStoneScore(scores,reasons,'citrine',5,'商業與資源');
  if (/溝通|訊息|聯絡|回覆|表達|說清楚/.test(q) || types.communication) _lnAddStoneScore(scores,reasons,'aquamarine',5,'溝通與確認');
  if (/界線|切斷|離開|停止|干擾|消耗|負擔|阻礙/.test(q)) _lnAddStoneScore(scores,reasons,'obsidian',4,'界線與減少干擾');
  if (/工作|職場|行動|執行|決定|取捨/.test(q) || types.career_fit || types.career_promotion || types.career_change || types.career_general) _lnAddStoneScore(scores,reasons,'tigers_eye',4,'行動與取捨');

  var n;
  n=cardHits([6,16,22,26,33]); if(n)_lnAddStoneScore(scores,reasons,'amethyst',n,'牌面含不明／指引／選擇／知識／解答');
  n=cardHits([9,18,24,25,32]); if(n)_lnAddStoneScore(scores,reasons,'rose_quartz',n,'牌面含情感／信任／承諾');
  n=cardHits([14,15,31,34,35]); if(n)_lnAddStoneScore(scores,reasons,'citrine',n,'牌面含工作／權力／成功／財務／穩定');
  n=cardHits([1,12,20,27]); if(n)_lnAddStoneScore(scores,reasons,'aquamarine',n,'牌面含消息／溝通／公開');
  n=cardHits([8,10,21,23,36]); if(n)_lnAddStoneScore(scores,reasons,'obsidian',n+1,'牌面含結束／切斷／阻礙／損耗／負擔');
  n=cardHits([10,14,15,21,31,35]); if(n)_lnAddStoneScore(scores,reasons,'tigers_eye',n,'牌面含決斷／工作／力量／阻礙／行動');

  return STONE_RECOMMENDATION_CATALOG.map(function(item){
    return {id:item.id,name:item.name,direction:item.direction,fact:item.fact,score:scores[item.id]||0,reasons:reasons[item.id]||[]};
  }).filter(function(item){ return item.score > 0; })
    .sort(function(a,b){ return b.score-a.score || a.name.localeCompare(b.name,'zh-Hant'); })
    .slice(0,3);
}

function appendStoneRecommendationPrompt(lines, question, questions, drawn, xmlEscape) {
  var candidates = buildStoneRecommendationCandidates(question, questions, drawn);
  lines.push('<stone_recommendation mode="select_after_interpretation" evidence_basis="question_and_drawn_cards">');
  lines.push('<selection_rule>先完成正文，再找出正文最主要且可執行的方向；只從候選中選一項與該方向最吻合者。候選清單只用於召回，排列順序不是推薦順位。若沒有候選真正吻合，輸出「本題不強行推薦水晶。」；不得固定推薦白水晶，也不得宣稱醫療、改運或客觀能量效果。</selection_rule>');
  if (candidates.length) {
    candidates.forEach(function(c,idx){
      lines.push('<candidate priority="none" name="'+xmlEscape(c.name)+'" matched_by="'+xmlEscape(c.reasons.join('、'))+'"><symbolic_direction>'+xmlEscape(c.direction)+'</symbolic_direction><mineral_fact>'+xmlEscape(c.fact)+'</mineral_fact></candidate>');
    });
  } else lines.push('<candidate status="none"></candidate>');
  lines.push('<output_format>推薦水晶：{名稱}——象徵{與正文結論吻合的方向}；{該候選的礦物事實}</output_format>');
  lines.push('</stone_recommendation>');
}

function buildPrompt(question, drawn, spreadId, sigGender, declaredGender) {
  var sp=SPREADS[spreadId], q=String(question||'').trim(), lines=[], isGT=spreadId==='grand'&&drawn.length===36;
  function cardLabel(c){return c.id+'.'+c.name;}
  function xmlEscape(value){return String(value==null?'':value).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
  var questions=splitQuestionSegments(q), roles=getPersonRoleIds(declaredGender), typeSet={};
  var comparison=detectComparisonQuestion(q), isSymmetricComparison=!!comparison && spreadId==='nine' && drawn.length===9, isInvalidComparison=!!comparison && !isSymmetricComparison;
  questions.forEach(function(item){(item.types||[item.type]).forEach(function(type){typeSet[type]=true;});});

  lines.push('# 執行優先順序（由高至低）');
  lines.push('你是本站 Petit Lenormand v7.2 證據優先解讀器。第一句依 proposition 順序直接回答，先給結論，再給證據整合。');
  lines.push('1. claim_plan 與 certainty_cap 是結論上限：只能維持或降低，不能提高。一般題只用 approved_claims、core_clusters、evidence_catalog、selected_context；比較題只用 comparison_packet 的 O／X。');
  lines.push('2. 先以獨立C建立核心判斷；同一C只算一次信心。selected_context只補充已成立主張的樣貌，不新增主張、不升級確定度。');
  lines.push('3. 依每題 analysis_requirements 寫作；標示可省略的項目沒有證據時就省略，不為湊深度硬造反覆、矛盾或事件。');
  lines.push('4. status=hypothetical／method_placeholder 的人物只可寫成假設角色或方法占位，不寫成真人已出現、已有內心或已採取行動。');
  lines.push('5. D／S／C與脈絡結構不自行表示時間、因果、互相意圖或事件已發生；未啟用相應規則時使用靜態結構語言。');
  lines.push('6. 固定負向語義：棺材＝結束；鐮刀＝切斷；山＝阻礙；老鼠＝損耗；十字架＝負擔；雲＝不明；鞭子＝衝突／反覆。');
  lines.push('史料層級：館藏可核實《Das Spiel der Hofnung》為36張牌並附4頁說明；4×8+4與人物牌附近閱讀採保存至今的說明書傳統；D／S／C、房屋、鏡像、騎士跳、門檻與計分均是本站明示規約，不宣稱為唯一現代正統。');
  lines.push('<boundary_examples>');
  lines.push('<example>comparison_packet驗證失敗時：回答「本次沒有對稱分配，無法公平比較」，不事後挑牌替A／B站隊。</example>');
  lines.push('<example>人物status=hypothetical時：寫「有出現這類互動的可能」，不寫「她已經出現／她正在想你」。</example>');
  lines.push('</boundary_examples>');
  if(isSymmetricComparison){
    lines.push('比較題最高規則：兩個選項已在抽牌前固定到左右對稱欄；選項名稱只是標籤，禁止把名稱中的「太陽、魚、心、熊」等字套成同名牌。');
    lines.push('A與B必須使用完全相同的位置角色比較；不得將選項名稱映射成同名牌，也不得因名稱較熟悉而偏重。');
  }
  lines.push('');

  if(typeSet.sexual_component||typeSet.sexual_event){
    lines.push('# 性／肉體題專用邊界');
    lines.push('桃花機會、性／感官成分、實際肉體事件是三個不同命題；吸引不等於性成分，性成分不等於事件，證據不可互借升級。');
    lines.push('百合與蛇只在本題 contextual_meanings 中可補充感官、性與誘惑；魚不得寫成慾望，鞭子本站不得當性行為牌。');
    lines.push('');
  }
  if(typeSet.unsupported_age){lines.push('無 age_rules：數字年齡與區間直接回答無法驗證，不得附牌面側證。');lines.push('');}
  if(typeSet.health_medical_cause){lines.push('醫學病因命題不得使用牌面作原因、診斷或治療；若另有 health_symbolic_context，只能作非醫療的象徵性深讀。');lines.push('');}

  lines.push('<reading_request method_profile="site_petit_lenormand_v7_2_evidence_first">');
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
    var packetItems=questions.map(function(item){var packet=buildEvidencePacket(geometry,item,declaredGender);Object.keys(packet.usedCards).forEach(function(id){globalUsedCards[id]=packet.usedCards[id];});return{item:item,packet:packet};});
    packetItems.forEach(function(entry){
      var item=entry.item,packet=entry.packet,type=item.type,policy=CLAIM_POLICIES[type];
      lines.push('<evidence_packet proposition_id="'+item.id+'" type="'+type+'" target_scope="'+item.targetScope+'">');
      lines.push('<question>'+xmlEscape(item.text)+'</question>');
      lines.push('<packet_validation status="'+(packet.validation&&packet.validation.ok?'pass':'fail')+'"></packet_validation>');
      if(roles.counterpart&&questionTypeDomain(type)==='relationship')lines.push('<role name="counterpart_significator" status="'+personStatusForScope(item.targetScope)+'">'+cardLabel(CARDS[roles.counterpart-1])+'</role>');
      if(policy)lines.push('<decision_boundary>'+xmlEscape(policy.meaning+' '+policy.forbidden)+'</decision_boundary>');
      lines.push('<claim_plan status="'+packet.claimPlan.status+'" certainty_cap="'+xmlEscape(packet.claimPlan.certaintyCap)+'">');
      lines.push('<required_conclusion>'+xmlEscape(packet.claimPlan.requiredConclusion)+'</required_conclusion>');
      lines.push('<approved_claims>');packet.claimPlan.approvedClaims.forEach(function(x){lines.push('<claim>'+xmlEscape(x)+'</claim>');});lines.push('</approved_claims>');
      lines.push('<forbidden_claims>');packet.claimPlan.forbiddenClaims.forEach(function(x){lines.push('<claim>'+xmlEscape(x)+'</claim>');});lines.push('</forbidden_claims>');
      lines.push('</claim_plan>');

      if(packet.structures.length){
        lines.push('<evidence_catalog>');
        packet.directPairs.forEach(function(pair,idx){lines.push('D'+(idx+1)+' '+pair.positions.map(function(p){return cardLabel(p.card);}).join(' & '));});
        packet.segments.forEach(function(seg,idx){lines.push('S'+(idx+1)+' '+seg.positions.map(function(p){return cardLabel(p.card);}).join(' > '));});
        lines.push('</evidence_catalog>');
        lines.push('<core_clusters confidence_counting="one_per_cluster">');
        packet.clusters.forEach(function(c){lines.push('<cluster id="'+c.id+'" kind="'+c.kind+'" polarity="'+c.polarity+'" refs="'+c.refs.join(',')+'">'+xmlEscape(c.theme)+'</cluster>');});
        lines.push('</core_clusters>');
        lines.push('<relevant_houses context_only="true">');packet.housePositions.forEach(function(p){lines.push(cardLabel(p.card)+'落'+cardLabel(p.house)+'宮');});lines.push('</relevant_houses>');
      }

      if(packet.modernContext.contextPositions.length){
        lines.push('<selected_context certainty_effect="none" novelty_filtered="true">');
        packet.modernContext.personNeighborhoods.forEach(function(n,idx){lines.push('N-P'+(idx+1)+' '+cardLabel(n.center.card)+'周圍〔'+n.positions.map(function(p){return cardLabel(p.card);}).join('、')+'〕');});
        packet.modernContext.topicNeighborhoods.forEach(function(n,idx){lines.push('N-T'+(idx+1)+' '+cardLabel(n.center.card)+'周圍〔'+n.positions.map(function(p){return cardLabel(p.card);}).join('、')+'〕');});
        if(packet.modernContext.sharedCards.length)lines.push('N-shared '+packet.modernContext.sharedCards.map(function(p){return cardLabel(p.card);}).join('、'));
        packet.modernContext.mirrors.forEach(function(m,idx){lines.push('M'+(idx+1)+' '+cardLabel(m.source.card)+' <-> '+cardLabel(m.target.card));});
        packet.modernContext.knightMoves.forEach(function(k,idx){lines.push('K'+(idx+1)+' '+cardLabel(k.source.card)+' ~ '+cardLabel(k.target.card));});
        packet.modernContext.intersections.forEach(function(it,idx){lines.push('I'+(idx+1)+' '+it.a+' x '+it.b+' shared='+it.positions.map(function(p){return cardLabel(p.card);}).join('、'));});
        packet.modernContext.clusterThemes.forEach(function(t,idx){lines.push('T'+(idx+1)+' cluster='+t.clusterId+' '+t.label+'='+t.positions.map(function(p){return cardLabel(p.card);}).join('、'));});
        if(packet.modernContext.corners.length)lines.push('F-corners '+packet.modernContext.corners.map(function(p){return cardLabel(p.card);}).join('、'));
        if(packet.modernContext.centers.length)lines.push('F-center '+packet.modernContext.centers.map(function(p){return cardLabel(p.card);}).join('、'));
        lines.push('</selected_context>');
      }
      if(type==='unsupported_age'||type==='health_medical_cause'){
        lines.push('<analysis_requirements mode="necessary_limit_only"></analysis_requirements>');
      }else{
        var analysisContract=buildEvidenceAwareAnalysisRequirements(packet);
        lines.push('<analysis_requirements paragraph_range="'+analysisContract.paragraphMin+'-'+analysisContract.paragraphMax+'" core="required" favorable="'+analysisContract.favorable+'" risk="'+analysisContract.risk+'" repetition="'+analysisContract.repetition+'" contradiction="'+analysisContract.contradiction+'" manifestation="conditional_only" unknown_boundary="required"></analysis_requirements>');
      }
      lines.push('</evidence_packet>');
    });
    lines.push('<approved_dictionary>');
    lines.push(Object.keys(globalUsedCards).map(function(id){var c=globalUsedCards[id];return cardLabel(c)+'='+c.key;}).join('；'));
    if(typeSet.sexual_component||typeSet.sexual_event)lines.push('；情境限定：30.百合=感官／肉體享受／性；7.蛇=慾望／誘惑／性＋複雜風險；34.魚不得轉義為性慾；11.鞭子不得轉義為性行為');
    lines.push('</approved_dictionary>');
  }else{
    lines.push('<spread>'+sp.name+'（'+sp.count+'張）</spread>');
    lines.push('<drawn_cards>');for(var i=0;i<drawn.length;i++){var pos=sp.positions?sp.positions[i]:('第'+(i+1)+'張');lines.push((i+1)+'. '+pos+'＝'+cardLabel(drawn[i])+'（'+drawn[i].key+'）'+(drawn[i]._presetSig?'〔預置焦點，非隨機抽中〕':''));}lines.push('</drawn_cards>');
  }
  lines.push('</reading_request>');
  lines.push('');
  lines.push('# 輸出契約');
  lines.push('第一句依 proposition 順序回答全部命題；吸引、性成分、事件落實與年齡各自維持 claim_plan 強度。');
  if(isSymmetricComparison){
    lines.push('比較題第一句直接說A、B哪個較適合，或明說差距不足；正文依序處理A、B、共同決策核心與取捨。');
    lines.push('比較證據引用：O-A／O-B寫選項位置；X-C寫中央共同軸；X1／X2／X3寫完整左右配對列。');
  }
  lines.push('正文只展開各題 analysis_requirements 中實際啟用的項目；每個判斷都要能回指批准證據，沒有證據就明說不足或省略。');
  lines.push('每段末尾只列真正使用的證據：D寫「牌A＆牌B」；S寫完整「牌A→…→牌B」；脈絡寫N／M／K／I／T／F。');
  lines.push('正文使用繁體中文與台灣用語，不寫座標、排數、演算法、分數或內部檢查。');
  lines.push('');
  lines.push('<presentation_footer mode="interpretation_aligned">');
  appendStoneRecommendationPrompt(lines,q,questions,drawn,xmlEscape);
  lines.push('<shop_link>[靜月之光蝦皮賣場](https://shopee.tw/a50h95648d?tab=shop)</shop_link>');
  lines.push('<closing>願你諸事順遂。</closing>');
  lines.push('</presentation_footer>');
  lines.push('');
  lines.push('交稿前複核：結論未超過certainty_cap；每項主張有批准證據；hypothetical人物未實體化；同一C未重複計信心；selected_context未升級結論；無時間／因果規則時未寫成發展流程；魚未當性慾；吸引未等同性事件；無age_rules未猜年齡；比較選項名稱未映射同名牌。正文後依stone_recommendation輸出一行推薦或「本題不強行推薦水晶。」，再逐字附上賣場與祝福兩行。只輸出最終解讀。');
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
  buildClaimPlan: buildClaimPlan,
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
