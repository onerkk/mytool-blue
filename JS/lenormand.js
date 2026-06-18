// ═══════════════════════════════════════
// 靜月之光 — 雷諾曼牌 Lenormand v4.2
// v4.2（2026-06-18）證據包與概念定義根治：
//   1. 4×8+4 仍由程式計算完整幾何，但不再把全36張相鄰與31條直線全部塞給模型。
//   2. 複合問題先拆成子問題並標準化類型；每題只輸出相關人物牌、焦點牌、直接相鄰、合法線段與房屋。
//   3. 新增「正緣」與「多人伴侶／一夫多妻」操作性定義，禁止把選擇、社交或蛇牌自行升級成多人婚姻。
//   4. 完整線段預設只表示結構關聯，不代表時間先後；未提供 direction_rules 禁止使用先／之後／最後。
//   5. 明確區分缺乏證據與負面證據；沒有結構只能說不足，不能偷換成確定不會。
//   6. 品牌收尾改為獨立呈現層，放在讀牌請求之後，不再混入證據規則與牌義資料。
// Petit Lenormand 36 張・歷史基線＋本站可驗證判讀規約
// ═══════════════════════════════════════
(function () {
'use strict';
console.log('[Lenormand] 靜月之光 雷諾曼牌 v4.2 loaded — 子題證據包／概念定義／非時序線段');

// ════════════════════════════════════
// 一、36 張牌完整數據
// ════════════════════════════════════
var CARDS = [
  {id:1,  name:'騎士',  en:'Rider',   key:'消息・來訪・速度',        pos:'好消息到來、快速發展、訪客',     neg:'壞消息、急躁、不穩定',          topic:'消息',   suit:'♥9',  element:'fire'},
  {id:2,  name:'幸運草', en:'Clover',   key:'小幸運・機會・短暫',      pos:'好運降臨、小機會、輕鬆',        neg:'運氣短暫、錯過機會',            topic:'運氣',   suit:'♦6',  element:'earth'},
  {id:3,  name:'船',    en:'Ship',     key:'旅行・貿易・遠方',        pos:'旅行、商業機會、進展',          neg:'延遲、漂泊、不安定',            topic:'移動',   suit:'♠10', element:'water'},
  {id:4,  name:'房屋',  en:'House',    key:'家庭・穩定・根基',        pos:'家庭和睦、穩定、安全感',        neg:'家庭問題、封閉、固執',           topic:'家庭',   suit:'♥K',  element:'earth'},
  {id:5,  name:'大樹',  en:'Tree',     key:'健康・成長・根深',        pos:'健康良好、穩定成長、生命力',    neg:'健康問題、停滯、依賴',           topic:'健康',   suit:'♥7',  element:'earth'},
  {id:6,  name:'雲',    en:'Clouds',   key:'不明・混亂・判斷不清',      pos:'困惑即將散去、暫時看不清',     neg:'混亂、迷茫、欺騙',              topic:'困惑',   suit:'♣K',  element:'air'},
  {id:7,  name:'蛇',    en:'Snake',    key:'複雜・欺騙・女性',        pos:'智慧、靈活、有經驗的女性',     neg:'背叛、欺騙、曲折、嫉妒',        topic:'欺騙',   suit:'♣Q',  element:'fire'},
  {id:8,  name:'棺材',  en:'Coffin',   key:'結束・終止・封閉',        pos:'舊事結束、轉化、放下',         neg:'生病、失去、悲傷、結束',         topic:'結束',   suit:'♦9',  element:'earth'},
  {id:9,  name:'花束',  en:'Bouquet',  key:'美好・禮物・社交',        pos:'禮物、讚美、美好事物、邀請',   neg:'虛榮、表面功夫',                topic:'美好',   suit:'♠Q',  element:'earth'},
  {id:10, name:'鐮刀',  en:'Scythe',   key:'切斷・突然中止・急迫風險',        pos:'快速決斷、乾脆切割',           neg:'突然的痛苦、意外、手術',         topic:'切斷',   suit:'♦J',  element:'fire'},
  {id:11, name:'鞭子',  en:'Whip',     key:'衝突・爭論・反覆循環',        pos:'鍛鍊、討論、性吸引',           neg:'爭吵、暴力、痛苦的重複',        topic:'衝突',   suit:'♣J',  element:'fire'},
  {id:12, name:'鳥',    en:'Birds',    key:'溝通・焦慮・一對',        pos:'對話、溝通、一對伴侶',         neg:'焦慮、八卦、緊張',              topic:'溝通',   suit:'♦7',  element:'air'},
  {id:13, name:'孩子',  en:'Child',    key:'新開始・天真・小',        pos:'新開始、天真、新計畫',          neg:'幼稚、不成熟、弱小',            topic:'新事',   suit:'♠J',  element:'water'},
  {id:14, name:'狐狸',  en:'Fox',      key:'工作・狡猾・自保',        pos:'聰明、工作、自我保護',         neg:'欺騙、不誠實、自私',            topic:'工作',   suit:'♣9',  element:'fire'},
  {id:15, name:'熊',    en:'Bear',     key:'力量・權威・財務',        pos:'權力、保護、財務強勢',         neg:'控制、嫉妒、霸道',              topic:'權力',   suit:'♣10', element:'earth'},
  {id:16, name:'星星',  en:'Stars',    key:'希望・指引・科技',        pos:'希望、靈感、方向、網路',       neg:'迷失方向、不切實際',            topic:'希望',   suit:'♥6',  element:'air'},
  {id:17, name:'鸛',    en:'Stork',    key:'改變・搬遷・進步',        pos:'正面改變、搬遷、懷孕',        neg:'變動不安、不穩定',              topic:'改變',   suit:'♥Q',  element:'air'},
  {id:18, name:'狗',    en:'Dog',      key:'忠誠・友誼・信任',        pos:'忠誠的朋友、信任、支持',       neg:'過度依賴、服從、被利用',        topic:'友誼',   suit:'♥10', element:'earth'},
  {id:19, name:'塔',    en:'Tower',    key:'權威・孤立・機構',        pos:'獨立、權威、公司、政府',       neg:'孤立、高傲、被困',              topic:'權威',   suit:'♠6',  element:'earth'},
  {id:20, name:'花園',  en:'Garden',   key:'社交・公開・群眾',        pos:'社交活動、公開場合、名聲',     neg:'缺乏隱私、流言',               topic:'社交',   suit:'♠8',  element:'earth'},
  {id:21, name:'山',    en:'Mountain', key:'阻礙・延遲・難以跨越',        pos:'堅毅、大目標、穩固',           neg:'阻礙、延遲、困難',              topic:'阻礙',   suit:'♣8',  element:'earth'},
  {id:22, name:'十字路口',en:'Crossroads',key:'選擇・決定・自由',     pos:'多個選擇、自由、機會',         neg:'猶豫不決、方向混亂',            topic:'選擇',   suit:'♦Q',  element:'air'},
  {id:23, name:'老鼠',  en:'Mice',     key:'侵蝕・損耗・持續消耗',        pos:'減少壓力、放下',               neg:'損失、偷竊、焦慮、侵蝕',       topic:'損失',   suit:'♣7',  element:'earth'},
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
  {id:36, name:'十字架', en:'Cross',    key:'負擔・考驗・難卸壓力',        pos:'宗教、精神信仰、命運',         neg:'痛苦、負擔、沉重責任',          topic:'負擔',   suit:'♣6',  element:'earth'}
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
function _lnDetectSpread(q) {
  q = (q || '').trim();
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

var QUESTION_TYPES = {
  relationship_longevity: {
    label:'關係穩定／正緣',
    match:/正緣|命定|適合長久|走到最後|走一輩子|長久|穩定交往|穩定伴侶|結婚對象|婚姻能否長久/,
    focus:[24,25,4,35,5,33,31]
  },
  multi_partner_commitment: {
    label:'多人伴侶／一夫多妻',
    match:/一夫多妻|多妻|多重伴侶|多人伴侶|開放式關係|非排他|同時交往|兩個老婆|多個老婆|多個伴侶/,
    focus:[24,25,7,22,20]
  },
  relationship_intent: {
    label:'對方感情意圖',
    match:/喜歡我|愛我|好感|心動|想.*交往|跟我交往|與我交往|想跟我在一起|想復合|會告白|對我有感覺|她怎麼想|他怎麼想|真心/,
    focus:[24,25,18,12,27,20]
  },
  relationship_future: {
    label:'感情未來',
    match:/感情.*未來|未來.*在一起|會在一起|能不能走在一起|關係發展|會不會復合|會不會結婚|成為伴侶/,
    focus:[24,25,4,35,5,31,33]
  },
  business_success: {
    label:'副業／商業成功',
    match:/副業|創業|生意|賣場|訂單|客戶|營收|業績|直播帶貨|商業|能成功|做得起來|賺錢/,
    focus:[34,35,31,32,20,14,3,33]
  },
  career: {
    label:'工作／職涯',
    match:/工作|職場|升遷|加薪|轉職|離職|主管|同事|錄取|面試|天職|職涯/,
    focus:[35,14,19,15,31,33,27]
  },
  finance: {
    label:'財務',
    match:/財運|收入|存款|負債|投資|股票|貸款|金錢|錢|資金|還債/,
    focus:[34,15,35,23,31,33]
  },
  age: {
    label:'年齡感',
    match:/幾歲|年齡|多大|歲數|年紀/,
    focus:[13,30,5]
  },
  timing: {
    label:'時間快慢',
    match:/什麼時候|何時|多久|幾時|哪一年|哪個月|幾月|時間點|應期|多快/,
    focus:[1,2,3,21,35,17]
  },
  health: {
    label:'健康',
    match:/健康|身體|病|疾病|手術|恢復|康復|症狀/,
    focus:[5,8,10,23,36,31]
  },
  travel: {
    label:'旅行／移動',
    match:/旅行|旅遊|出國|搬家|遷移|遠方|移居|出差/,
    focus:[3,17,1,21,4]
  },
  communication: {
    label:'消息／溝通',
    match:/聯絡|訊息|回覆|聊天|溝通|傳訊|來找我|聯繫/,
    focus:[27,12,1,20,6]
  },
  general: {
    label:'一般問題',
    match:null,
    focus:[24,25,34,35,31,33,6,8,10,21,23,36]
  }
};

function splitQuestionSegments(question) {
  var raw = String(question || '').replace(/\r/g, '\n').trim();
  if (!raw) return [{ id:'q1', text:'未指定具體問題', type:'general', types:['general'] }];
  var parts = raw.split(/[？?；;\n]+/).map(function(x){ return x.trim(); }).filter(Boolean);
  if (!parts.length) parts = [raw];
  return parts.map(function(text, index) {
    var types = inferQuestionTypes(text);
    return { id:'q' + (index + 1), text:text, type:types[0], types:types };
  });
}

function inferQuestionTypes(text) {
  var keys = [
    'multi_partner_commitment','relationship_longevity','relationship_intent','relationship_future',
    'business_success','career','finance','age','timing','health','travel','communication'
  ];
  var matched = [];
  for (var i = 0; i < keys.length; i++) {
    var def = QUESTION_TYPES[keys[i]];
    if (def.match && def.match.test(text)) matched.push(keys[i]);
  }
  return matched.length ? matched : ['general'];
}

function inferQuestionType(text) {
  return inferQuestionTypes(text)[0];
}

function getPersonRoleIds(declaredGender) {
  if (declaredGender === 'male') return { querent:28, counterpart:29 };
  if (declaredGender === 'female') return { querent:29, counterpart:28 };
  return { querent:null, counterpart:null };
}

function uniqueNumbers(values) {
  var seen = {};
  return values.filter(function(v) {
    if (!v || seen[v]) return false;
    seen[v] = true;
    return true;
  });
}

function buildQuestionFocusIds(types, declaredGender) {
  var roles = getPersonRoleIds(declaredGender);
  var ids = [];
  var list = Array.isArray(types) ? types : [types];
  if (roles.querent) ids.push(roles.querent);
  if (list.some(function(type){ return /^relationship_|^multi_partner_/.test(type); }) && roles.counterpart) ids.push(roles.counterpart);
  list.forEach(function(type){ ids = ids.concat((QUESTION_TYPES[type] || QUESTION_TYPES.general).focus); });
  if (_lnSignif) ids.push(_lnSignif);
  return uniqueNumbers(ids);
}

function buildEvidencePacket(geometry, questionItem, declaredGender) {
  var focusIds = buildQuestionFocusIds(questionItem.types || [questionItem.type], declaredGender);
  var byCardId = {};
  geometry.positions.forEach(function(p){ byCardId[p.card.id] = p; });
  var focusPositions = focusIds.map(function(id){ return byCardId[id]; }).filter(Boolean);
  var focusSlots = {};
  focusPositions.forEach(function(p){ focusSlots[p.slot] = true; });

  var direct = geometry.adjacency.filter(function(a){ return !!focusSlots[a.position.slot]; });
  var lineMap = {};
  var relevantLines = [];
  geometry.lines.forEach(function(line) {
    var focusCount = line.positions.reduce(function(total, p){ return total + (focusSlots[p.slot] ? 1 : 0); }, 0);
    // 只保留同一條線上至少有兩張本題焦點牌的結構；單焦點線的強訊號已由 direct_adjacency 提供，避免資料牆。
    if (focusCount < 2) return;
    var key = line.positions.map(function(p){ return p.slot; }).join('-');
    if (!lineMap[key]) {
      lineMap[key] = true;
      relevantLines.push(line);
    }
  });

  var usedCards = {};
  focusPositions.forEach(function(p){ usedCards[p.card.id] = p.card; });
  direct.forEach(function(a){
    usedCards[a.position.card.id] = a.position.card;
    a.neighbors.forEach(function(n){ usedCards[n.card.id] = n.card; });
  });
  relevantLines.forEach(function(line){
    line.positions.forEach(function(p){ usedCards[p.card.id] = p.card; });
  });

  return {
    question: questionItem,
    focusPositions: focusPositions,
    direct: direct,
    lines: relevantLines,
    usedCards: usedCards
  };
}

function buildPrompt(question, drawn, spreadId, sigGender, declaredGender) {
  var sp = SPREADS[spreadId];
  var q = String(question || '').trim();
  var lines = [];
  var isGT = spreadId === 'grand' && drawn.length === 36;

  function cardLabel(c) { return c.id + '.' + c.name; }
  function xmlEscape(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function positionLabel(p) {
    return 'p' + String(p.slot).padStart(2, '0') + '@r' + p.row + 'c' + p.col;
  }

  var questions = splitQuestionSegments(q);
  var roles = getPersonRoleIds(declaredGender);

  lines.push('# 最高優先任務');
  lines.push('你是依「本站 Petit Lenormand 判讀規約 v3」工作的讀牌者。第一句依子問題順序直接給結論；只使用本次 evidence_packet 內由程式驗證的證據。');
  lines.push('先在內部分題，每題獨立取證。不同子問題的散牌不得互借；第三方內心只能寫成牌面傾向。沒有證據時說不足，不得為了顯得精準補出年齡、日期、機率、身分或事件。');
  lines.push('棺材＝結束／終止／封閉；鐮刀＝切斷／突然中止；山＝阻礙／延遲；老鼠＝侵蝕／損耗；十字架＝負擔／壓力；雲＝不明／混亂；鞭子＝衝突／反覆。不得美化。');
  lines.push('');

  lines.push('# 方法定位');
  lines.push('歷史原始基線只有36張、4排8張加末排4張、男性28紳士／女性29淑女，以及先看人物牌附近。末排置中、八方相鄰、完整直線與房屋是本站採用的現代規約，不得稱為原始官方全套。');
  lines.push('不用逆位、塔羅原型、元素、牌面朝向、心理投射或靈感補故事。未提供distance_rules時不得使用近遠法；騎士跳、鏡像、交會與房屋鏈停用。');
  lines.push('');

  lines.push('# 證據與結論規則');
  lines.push('1. 只能使用各題 evidence_packet 中的 direct_adjacency、valid_segments、relevant_houses。不得自行重排、補線、轉彎或跳格。');
  lines.push('2. valid_segments列的是最大直線；引用時只取兩個實際端點之間的連續區段，區段內全部牌一張不漏，區段外的牌不要帶入。線段只表示結構關聯，不表示時間先後；direction_rules 未啟用時，禁止使用「先、之後、最後、最終會」。');
  lines.push('3. 房屋只提供脈絡，不能單獨推翻直接相鄰或完整線段。');
  lines.push('4. 一項間接證據只能寫「可能」；一項直接結構加一致旁證可寫「較有此傾向」；兩項以上獨立直接結構一致且無同級反證，才可給明確傾向。');
  lines.push('5. 完全缺少相關結構時，回答「牌面不足以判定」；不得把缺乏證據偷換成確定不會。正反直接證據並存時，說明哪一方主導。');
  lines.push('6. 未問時間不加應期；即使問時間，也只能依另附 time_rules 判相對快慢，禁止把牌號換算成天、週、月。');
  lines.push('');

  var types = {};
  questions.forEach(function(item){ (item.types || [item.type]).forEach(function(type){ types[type] = true; }); });
  if (types.relationship_longevity) {
    lines.push('# 本題概念：正緣');
    lines.push('「正緣」不判唯一命定，只判目前對象是否同時具備相互感情、關係持續性、穩定共同生活與承諾發展。若有感情但結束、切斷、侵蝕、阻礙或負擔的直接結構明顯主導，可回答「有感情牽引，但以穩定長久的定義看，偏不是正緣」。');
    lines.push('');
  }
  if (types.multi_partner_commitment) {
    lines.push('# 本題概念：多人伴侶／一夫多妻');
    lines.push('先區分感情選擇、多個曖昧、非排他關係、多人知情同意的穩定承諾，以及法律制度。十字路口或花園只能支持選擇、公開或社交脈絡，不能單獨證明多名伴侶。');
    lines.push('只有 person_roles 明確提供兩名以上對象，且每名對象各自與心或戒指形成獨立直接結構，才能判斷穩定多人伴侶。蛇牌未被 person_roles 指定為人物時，只讀複雜、迂迴或欺瞞，不得自行當第二位女性。');
    lines.push('');
  }
  if (types.relationship_intent || types.relationship_future || types.relationship_longevity) {
    lines.push('# 感情強度');
    lines.push('必須區分友善／信任、好感／吸引、情緒投入、想交往、穩定承諾。18狗不能直接升級成愛情；公開或直播互動不能直接升級成私人感情。');
    lines.push('');
  }
  if (types.age) {
    lines.push('# 年齡限制');
    lines.push('未提供age_rules時，禁止輸出精確歲數、數字區間或相差幾歲。孩子、百合、大樹只能描述較年輕、成熟或穩重的年齡感。');
    lines.push('');
  }

  lines.push('<reading_request method_profile="site_petit_lenormand_v3">');
  lines.push('<question_original>' + xmlEscape(q || '未指定具體問題') + '</question_original>');
  lines.push('<routing_note>types只用來選取證據，不是答案或預設結論；若同一題有多個types，必須分別處理其實際問法。</routing_note>');
  lines.push('<normalized_questions>');
  questions.forEach(function(item) {
    lines.push('<question id="' + item.id + '" types="' + (item.types || [item.type]).join(',') + '">' + xmlEscape(item.text) + '</question>');
  });
  lines.push('</normalized_questions>');
  lines.push('<querent_gender>' + (declaredGender === 'male' ? '男' : declaredGender === 'female' ? '女' : '未聲明') + '</querent_gender>');
  lines.push('<person_roles>');
  if (roles.querent) lines.push('<role name="querent">' + cardLabel(CARDS[roles.querent - 1]) + '</role>');
  if (roles.counterpart && questions.some(function(item){ return (item.types || [item.type]).some(function(type){ return /^relationship_|^multi_partner_/.test(type); }); })) {
    lines.push('<role name="current_or_primary_counterpart">' + cardLabel(CARDS[roles.counterpart - 1]) + '</role>');
  }
  if (!roles.querent) lines.push('<role name="unassigned">28.紳士與29.淑女皆未指定</role>');
  lines.push('</person_roles>');
  lines.push('<direction_rules enabled="false"></direction_rules>');
  lines.push('<distance_rules enabled="false"></distance_rules>');

  if (isGT) {
    var geometry = buildGrandGeometry(drawn);
    questions.forEach(function(item) {
      var packet = buildEvidencePacket(geometry, item, declaredGender);
      lines.push('<evidence_packet question_id="' + item.id + '" types="' + (item.types || [item.type]).join(',') + '">');
      lines.push('<question>' + xmlEscape(item.text) + '</question>');
      lines.push('<focus_cards>');
      packet.focusPositions.forEach(function(p) {
        lines.push(positionLabel(p) + '|' + cardLabel(p.card) + '|house=' + cardLabel(p.house));
      });
      lines.push('</focus_cards>');
      lines.push('<direct_adjacency>');
      packet.direct.forEach(function(a) {
        lines.push(cardLabel(a.position.card) + ' => ' + (a.neighbors.length ? a.neighbors.map(function(n){ return cardLabel(n.card); }).join(', ') : 'none'));
      });
      lines.push('</direct_adjacency>');
      lines.push('<valid_segments>');
      packet.lines.forEach(function(line) {
        lines.push(line.id + '[' + line.type + '] ' + line.positions.map(function(p){ return cardLabel(p.card); }).join(' > '));
      });
      lines.push('</valid_segments>');
      lines.push('<relevant_houses>');
      packet.focusPositions.forEach(function(p) {
        lines.push(cardLabel(p.card) + '落' + cardLabel(p.house) + '宮');
      });
      lines.push('</relevant_houses>');
      lines.push('<card_dictionary>');
      lines.push(Object.keys(packet.usedCards).map(function(id){ var c = packet.usedCards[id]; return cardLabel(c) + '=' + c.key; }).join('；'));
      lines.push('</card_dictionary>');
      lines.push('</evidence_packet>');
    });
  } else {
    lines.push('<spread>' + sp.name + '（' + sp.count + '張）</spread>');
    lines.push('<drawn_cards>');
    for (var i = 0; i < drawn.length; i++) {
      var pos = sp.positions ? sp.positions[i] : ('第' + (i + 1) + '張');
      lines.push((i + 1) + '. ' + pos + '＝' + cardLabel(drawn[i]) + '（' + drawn[i].key + '）' + (drawn[i]._presetSig ? '〔預置焦點，非隨機抽中〕' : ''));
    }
    lines.push('</drawn_cards>');
  }
  lines.push('</reading_request>');
  lines.push('');

  lines.push('# 輸出契約');
  lines.push('第一句依序回答全部子問題；之後每個子問題獨立成段，每段只推進一項結論。');
  lines.push('使用繁體中文與台灣用語；正文不寫座標、排數、技法名稱或教科書流程。');
  lines.push('每段末尾列真正使用的證據：相鄰寫「牌A＋牌B」；線段寫完整「牌A→中間牌→牌B」；房屋寫「牌A落牌B宮」。不得列入未使用的牌。');
  lines.push('');

  lines.push('<presentation_footer stage="after_reading_locked">');
  lines.push('正文完成並鎖定後，才選一種能量石作象徵性建議；不得反向修改正文，不作醫療宣稱。');
  lines.push('可用礦物事實：白水晶／紫水晶／黃水晶／茶晶／粉晶／草莓晶＝石英家族、SiO₂、三方晶系、硬度7；月光石＝正長石與鈉長石交層產生暈彩；拉長石＝斜長石、三斜晶系；太陽石＝赤鐵礦或銅片包體產生砂金閃光；海藍寶＝綠柱石族、六方晶系、鐵致色；黑曜石＝非晶質火山玻璃、貝殼狀斷口；黑碧璽＝電氣石族、三方晶系、柱面常見縱紋；虎眼石＝石英交代石棉假象、具絲絹貓眼光；綠幽靈＝白水晶含綠泥石包體；葡萄石＝斜方晶系、常呈葡萄狀集合體；天鐵＝鎳鐵隕石，切磨酸蝕後可見魏德曼花紋；龍宮舍利只能稱市場名稱並描述外觀，不宣稱成因。');
  lines.push('最後三段固定為：能量石短句；單獨一行[靜月之光蝦皮賣場](https://shopee.tw/a50h95648d?tab=shop)；最後一行「願你諸事順遂。」');
  lines.push('</presentation_footer>');
  lines.push('');

  lines.push('# 最終驗收');
  lines.push('確認：已分題；只用各題evidence_packet；沒有把選擇或社交判成多人伴侶；沒有把線段讀成時間流程；沒有跳過負面牌；沒有把缺證寫成確定不會；沒有對第三方過度確定。');
  lines.push('只輸出最終解讀，不輸出分析流程或檢查表。');

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
    h += '<div class="ln-auto-note" style="margin-top:.5rem">男士／女士代表你本人；自選任一張可作主題定位（如問財選魚34、問感情選心24）。九宮格會把指示牌置於中央（本站圍繞法）；大牌陣的非人物指示牌只作次要焦點，主要人物牌仍依問卜者性別判定；三張／五張線只作主題透鏡。</div></div>';
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
    h += '<div class="ln-section"><div class="ln-section-title">✦ ' + sp.name + '（' + sp.count + ' 張）</div>';
    if (_lnAutoPick) h += '<div class="ln-auto-note">✦ 自動判斷：' + _lnAutoPick.why + '</div>';
    if (_lnSignif) h += '<div class="ln-auto-note">✦ 指示牌：' + _lnSignif + '.' + ((CARDS[_lnSignif-1]||{}).name||'') + (_lnResolved==='nine' ? '（已置中央・圍繞法）' : _lnResolved==='grand' ? '（於 36 張中定位讀取）' : '（主題透鏡）') + '</div>';
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
      h += '<div class="ln-card-en">' + c.en + '</div></div>';
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
  var pos = sp.positions || [];
  var cards = (_lnDrawn || []).map(function(c, i) {
    var pl = (pos[i] || ('\u7B2C' + (i + 1) + '\u5F35'));
    pl = String(pl).split('/').pop();
    // v3.3：補傳 id/img/sig——share-card v2.0 起依牌陣張數排版並繪真牌面（img 同源資產、畫布無汙染）
    return { id: c.id, name: c.name || '', pos: pl, img: (typeof IMG_MAP !== 'undefined' && IMG_MAP[c.id]) || '', sig: !!c._presetSig };
  });
  JYShareCard.open('lenormand', {
    cardTitle: '\u6211\u7684\u96F7\u8AFE\u66FC',
    spread: (sp.name || '\u96F7\u8AFE\u66FC') + (sp.count ? '\uFF08' + sp.count + '\u5F35\uFF09' : ''),
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
  _lnResolved = _lnSpread;
  if (_lnSpread === 'auto') {
    var _det = _lnDetectSpread(_lnQuestion);
    _lnResolved = _det.id;
    _lnAutoPick = _det;
  }
  var sp = SPREADS[_lnResolved];
  // 九宮格＋自選焦點牌：本站採用的現代圍繞法；預置中央後再抽八張，池先移除焦點牌避免重複
  if (_lnResolved === 'nine' && _lnSignif) {
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

})();
