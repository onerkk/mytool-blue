// ═══════════════════════════════════════
// 靜月之光 — 雷諾曼牌 Lenormand v2.3
// Petit Lenormand 36 張・傳統組合義讀法・反盤外牌名幻覺
// ═══════════════════════════════════════
(function () {
'use strict';
console.log('[Lenormand] 靜月之光 雷諾曼牌 v2.3 loaded — 重新抽牌清空問題/牌陣狀態修正');

// ════════════════════════════════════
// 一、36 張牌完整數據
// ════════════════════════════════════
var CARDS = [
  {id:1,  name:'騎士',  en:'Rider',   key:'消息・來訪・速度',        pos:'好消息到來、快速發展、訪客',     neg:'壞消息、急躁、不穩定',          topic:'消息',   suit:'♥9',  element:'fire'},
  {id:2,  name:'幸運草', en:'Clover',   key:'小幸運・機會・短暫',      pos:'好運降臨、小機會、輕鬆',        neg:'運氣短暫、錯過機會',            topic:'運氣',   suit:'♦6',  element:'earth'},
  {id:3,  name:'船',    en:'Ship',     key:'旅行・貿易・遠方',        pos:'旅行、商業機會、進展',          neg:'延遲、漂泊、不安定',            topic:'移動',   suit:'♠10', element:'water'},
  {id:4,  name:'房屋',  en:'House',    key:'家庭・穩定・根基',        pos:'家庭和睦、穩定、安全感',        neg:'家庭問題、封閉、固執',           topic:'家庭',   suit:'♥K',  element:'earth'},
  {id:5,  name:'大樹',  en:'Tree',     key:'健康・成長・根深',        pos:'健康良好、穩定成長、生命力',    neg:'健康問題、停滯、依賴',           topic:'健康',   suit:'♥7',  element:'earth'},
  {id:6,  name:'雲',    en:'Clouds',   key:'困惑・不確定・陰暗',      pos:'困惑即將散去、暫時看不清',     neg:'混亂、迷茫、欺騙',              topic:'困惑',   suit:'♣K',  element:'air'},
  {id:7,  name:'蛇',    en:'Snake',    key:'複雜・欺騙・女性',        pos:'智慧、靈活、有經驗的女性',     neg:'背叛、欺騙、曲折、嫉妒',        topic:'欺騙',   suit:'♣Q',  element:'fire'},
  {id:8,  name:'棺材',  en:'Coffin',   key:'結束・轉化・終止',        pos:'舊事結束、轉化、放下',         neg:'生病、失去、悲傷、結束',         topic:'結束',   suit:'♦9',  element:'earth'},
  {id:9,  name:'花束',  en:'Bouquet',  key:'美好・禮物・社交',        pos:'禮物、讚美、美好事物、邀請',   neg:'虛榮、表面功夫',                topic:'美好',   suit:'♠Q',  element:'earth'},
  {id:10, name:'鐮刀',  en:'Scythe',   key:'切斷・突然・危險',        pos:'快速決斷、乾脆切割',           neg:'突然的痛苦、意外、手術',         topic:'切斷',   suit:'♦J',  element:'fire'},
  {id:11, name:'鞭子',  en:'Whip',     key:'衝突・爭論・重複',        pos:'鍛鍊、討論、性吸引',           neg:'爭吵、暴力、痛苦的重複',        topic:'衝突',   suit:'♣J',  element:'fire'},
  {id:12, name:'鳥',    en:'Birds',    key:'溝通・焦慮・一對',        pos:'對話、溝通、一對伴侶',         neg:'焦慮、八卦、緊張',              topic:'溝通',   suit:'♦7',  element:'air'},
  {id:13, name:'孩子',  en:'Child',    key:'新開始・天真・小',        pos:'新開始、天真、新計畫',          neg:'幼稚、不成熟、弱小',            topic:'新事',   suit:'♠J',  element:'water'},
  {id:14, name:'狐狸',  en:'Fox',      key:'工作・狡猾・自保',        pos:'聰明、工作、自我保護',         neg:'欺騙、不誠實、自私',            topic:'工作',   suit:'♣9',  element:'fire'},
  {id:15, name:'熊',    en:'Bear',     key:'力量・權威・財務',        pos:'權力、保護、財務強勢',         neg:'控制、嫉妒、霸道',              topic:'權力',   suit:'♣10', element:'earth'},
  {id:16, name:'星星',  en:'Stars',    key:'希望・指引・科技',        pos:'希望、靈感、方向、網路',       neg:'迷失方向、不切實際',            topic:'希望',   suit:'♥6',  element:'air'},
  {id:17, name:'鸛',    en:'Stork',    key:'改變・搬遷・進步',        pos:'正面改變、搬遷、懷孕',        neg:'變動不安、不穩定',              topic:'改變',   suit:'♥Q',  element:'air'},
  {id:18, name:'狗',    en:'Dog',      key:'忠誠・友誼・信任',        pos:'忠誠的朋友、信任、支持',       neg:'過度依賴、服從、被利用',        topic:'友誼',   suit:'♥10', element:'earth'},
  {id:19, name:'塔',    en:'Tower',    key:'權威・孤立・機構',        pos:'獨立、權威、公司、政府',       neg:'孤立、高傲、被困',              topic:'權威',   suit:'♠6',  element:'earth'},
  {id:20, name:'花園',  en:'Garden',   key:'社交・公開・群眾',        pos:'社交活動、公開場合、名聲',     neg:'缺乏隱私、流言',               topic:'社交',   suit:'♠8',  element:'earth'},
  {id:21, name:'山',    en:'Mountain', key:'阻礙・延遲・挑戰',        pos:'堅毅、大目標、穩固',           neg:'阻礙、延遲、困難',              topic:'阻礙',   suit:'♣8',  element:'earth'},
  {id:22, name:'十字路口',en:'Crossroads',key:'選擇・決定・自由',     pos:'多個選擇、自由、機會',         neg:'猶豫不決、方向混亂',            topic:'選擇',   suit:'♦Q',  element:'air'},
  {id:23, name:'老鼠',  en:'Mice',     key:'損失・侵蝕・壓力',        pos:'減少壓力、放下',               neg:'損失、偷竊、焦慮、侵蝕',       topic:'損失',   suit:'♣7',  element:'earth'},
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
  {id:36, name:'十字架', en:'Cross',    key:'負擔・命運・考驗',        pos:'宗教、精神信仰、命運',         neg:'痛苦、負擔、沉重責任',          topic:'負擔',   suit:'♣6',  element:'earth'}
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
    desc:'3×3 Portrait/Box。中心第5張是核心主題；橫排/直列/對角線與鏡像皆屬常見嚴格實務讀法，不宣稱單一官方原典。',
    positions:['左上(過去+意識)','上中(意識)','右上(未來+意識)','左中(過去)','核心','右中(未來)','左下(過去+潛意識)','下中(潛意識)','右下(未來+潛意識)'],
    layout:'3x3'
  },
  grand: { id:'grand', name:'大牌陣', en:'Grand Tableau', count:36,
    desc:'全部36張排出。本站採 4排8張＋最後一排4張置中；4×9 亦常見。以 Sig（紳士28/淑女29）為中心讀方位、距離、房屋系統與 Knighting。',
    positions:null, // special layout
    layout:'8-8-8-8-4'
  }
};

// ════════════════════════════════════
// 三、洗牌與抽牌
// ════════════════════════════════════
var _lnDeck = [];
var _lnDrawn = [];
var _lnSpread = 'three';
var _lnQuestion = '';
var _lnSigGender = 'male'; // for Grand Tableau

function shuffleDeck() {
  _lnDeck = CARDS.map(function(c){ return JSON.parse(JSON.stringify(c)); });
  // Fisher-Yates
  for (var i = _lnDeck.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
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
// 四、正統提示詞生成
// ════════════════════════════════════
function buildPrompt(question, drawn, spreadId, sigGender) {
  var sp = SPREADS[spreadId];
  var lines = [];

  lines.push('你是精通 Petit Lenormand（小雷諾曼）的正統雷諾曼占卜師。以下是問卜者抽到的牌面與完整資料，請依雷諾曼組合義、線讀、九宮格或大牌陣規則解讀。');
  lines.push('');
  lines.push('【人設——你是雷諾曼占卜師，不是占卜教科書】');
  lines.push('你是面對面跟客人說話的雷諾曼占卜師，不是塔羅師。你已經看完組合、距離、方向與關鍵牌，現在只告訴客人結果。');
  lines.push('・客人只想知道：答案是什麼、什麼時候、怎麼辦。');
  lines.push('・你內心用組合義、相鄰牌、距離、方位、鏡像配對與主題牌分析完了，但嘴上說的是白話結論。');
  lines.push('・像一個有經驗的占卜師在聊天，不是在寫分析報告。');
  lines.push('');
  lines.push('【禁語——以下術語禁止出現在你的回答裡】');
  lines.push('・「橫排」「直列」「對角線」「四角」「鏡像配對」「Portrait」「Grand Tableau」「Knighting」——這些是你分析的工具，不是要說出來的。');
  lines.push('・「位置 X」「左上」「右下」「上中」「下中」——不要報位置，直接說結論。');
  lines.push('・「正面牌」「負面牌」「中性牌」「強正面」「強負面」——不要解釋牌的屬性分類。');
  lines.push('・「主題牌」「核心牌」——直接說「牌面上跟財富直接相關的是魚」而不是「主題牌魚出現在…」');
  lines.push('・出處用自然語氣帶：「鑰匙跟戒指一起出來，所以承諾很明確」；不要把正文寫成公式表。');
  lines.push('');
  lines.push('✗ 錯誤（在教課）：「上排代表意識，老鼠在這裡是損失焦慮；下排潛意識是信…；鏡像配對棺材↔花園代表…」');
  lines.push('✓ 正確（在告訴你）：「你心裡一直擔心錢在流失，但牌面藏著的解法其實是靠公開曝光、貼文、訊息成交來補量。」');
  lines.push('');
  lines.push('【最高原則——一切圍繞問卜者的問題（凌駕所有技法）】');
  lines.push('1. 問什麼答什麼。問「這月有桃花嗎」就只答桃花，不要扯財運、工作、人生，除非他問了。');
  lines.push('2. 線讀、九宮格與大牌陣的結構都是你分析的工具，不是要逐一報告的清單。所有訊息都要拿來回答這個問題，但禁止寫成技術流程。把線索串成一個針對問題的故事。');
  lines.push('   ✗ 錯誤（逐層報告）：「上排星星代表希望，下排鸛代表改變；四角錨與信代表…；對角線淑女到鳥代表…」');
  lines.push('   ✓ 正確（串成答案）：「這月感情的走向是『有方向但還在變動中』——你心裡有期待，外在也有新對象靠近，但成不成要看一次明確的聯絡。」');
  lines.push('3. 同一張牌在不同問題裡意義不同。問感情時，魚可讀成感情流動或慾望流動；問財時才主看錢。務必把牌義扭向問卜者問的那件事。');
  lines.push('4. 哪幾張牌、哪條線對這題最關鍵就深講，其餘融進敘事或不提。深度來自針對問題挖多深，不是把九宮格七層全部報一遍。');
  lines.push('5. 嚴格只引用本盤抽到的牌。若年齡、人物、地點或事件訊號不足，直接說「本盤沒有足夠牌面支撐」，不得在正文說「如果有某某牌才代表…」這類盤外牌名。');
  lines.push('');

  // 問題
  lines.push('【問卜者的問題】');
  if (question && question.trim()) {
    lines.push(question.trim());
  } else {
    lines.push('（問卜者未指定具體問題，請依牌面做通用解讀，涵蓋目前最需要注意的面向。）');
  }
  lines.push('');

  lines.push('【占卜日期】' + new Date().toISOString().slice(0,10));
  lines.push('');

  // ════ 正統讀法規則 ════
  lines.push('══════════════════════════════════════════');
  lines.push('傳統雷諾曼組合義讀法（必須嚴格遵守）');
  lines.push('══════════════════════════════════════════');
  lines.push('');
  lines.push('【正統性邊界——必須誠實】');
  lines.push('雷諾曼不是塔羅：不用逆位、不讀 RWS 圖像心理投射、不用元素尊嚴、不用牌陣位置單張定義答案。判斷只以本盤牌組、相鄰牌、問事相關牌、與代表牌遠近為主。');
  lines.push('小雷諾曼沒有像 Waite/Crowley 那種單一官方技術文件。可查原始邊界是 Das Spiel der Hoffnung / Game of Hope：36 張牌；占卜用法是洗牌、切牌、排成 4 排 8 張加最後 4 張，女問卜者從 29、男問卜者從 28 開始，依其附近牌說故事。');
  lines.push('原始說明沒有列出完整單張牌義、沒有固定月份/日期應期公式、沒有要求房屋系統、角落、騎士跳或能量石。這些若使用，只能當現代實務輔助，不能冒充原典或正統硬規則。');
  lines.push('本工具採用的三張線、五張線、九宮格、房屋、角落、騎士跳、24小時行動、能量石收尾，皆屬現代實務補充；必須從本盤組合義轉譯，不得產生沒有牌面支撐的商業策略、人物、日期或地點。');
  lines.push('');
  lines.push('【核心原則——單張牌是「詞」，不是「句」】');
  lines.push('雷諾曼跟塔羅完全不同。單張牌幾乎沒有獨立意義。兩張牌組合才開始說話，三張牌說一個小故事。');
  lines.push('讀法：相鄰牌彼此修飾，兩張形成短句，三張形成小故事；只能用本次抽到的相鄰牌與線索組句。');
  lines.push('範例只可內部理解組合方式，正文不得引用本盤外的牌名或公式。');
  lines.push('');
  lines.push('【無逆位】');
  lines.push('雷諾曼所有牌都正面朝上讀，沒有逆位概念。牌的正面/負面取決於相鄰牌的修飾和問題脈絡。');
  lines.push('');
  lines.push('【牌義使用層級】');
  lines.push('本盤每張牌下方的關鍵字、順向語境、受阻語境，是現代雷諾曼常用詞庫，不是 Hechtel 原始說明的逐張牌義。');
  lines.push('禁止把單張牌義當答案；必須至少用相鄰兩張，重要結論盡量用三張以上或代表牌遠近互證。');
  lines.push('同一張牌只能依問題脈絡與相鄰牌取義，不能為了迎合提問者而任意改義。');
  lines.push('');
  lines.push('【遠近與方位（5 張以上才用）】');
  lines.push('近牌優先於遠牌；直接相鄰優先於隔很遠的牌。遠近只表示影響強弱與切近程度，不等於固定天數。');
  lines.push('大牌陣以代表牌周圍牌先讀，再由近到遠延伸；若問事相關牌離代表牌很遠，只能說該議題離當下較遠或需要繞路，不得硬讀成立刻發生。');
  lines.push('');
  lines.push('【問事相關牌（只作定位，不作單張裁決）】');
  lines.push('問感情→看心(24)、戒指(25)及其相鄰牌；問工作/副業→看狐狸(14)、錨(35)及其相鄰牌；問財/生意→看魚(34)、熊(15)及其相鄰牌；問健康→看大樹(5)；問溝通→看鳥(12)、信(27)；問旅行/商貿→看船(3)。');
  lines.push('如果問事相關牌在本盤出現，必須讀它旁邊至少兩張與它離代表牌遠近；如果沒有出現，只能說「本盤沒有直接牌面支撐」，不得引用未抽到的牌名作反證。');
  lines.push('');

  // ════ 牌陣專用讀法 ════
  if (spreadId === 'three') {
    lines.push('【三張線讀法】');
    lines.push('三張從左到右連讀。中間牌可作語句焦點，左右牌修飾它；不可套塔羅過去/現在/未來固定位置。');
    lines.push('先讀 1+2 的組合義，再讀 2+3 的組合義，最後讀 1+2+3 整串故事。');
    lines.push('三張全連讀成一個句子，不是三張各自解釋。');
  } else if (spreadId === 'five') {
    lines.push('【五張線讀法】');
    lines.push('五張從左到右連讀。第3張可作語句焦點，2-3-4 是最直接的牌組，1-2 與 4-5 是延伸牌組。');
    lines.push('讀法：先看第3張被左右怎麼修飾，再讀 2+3+4，最後看 1+2 與 4+5 的延伸。');
    lines.push('最後讀第 1 張與第 5 張的對照，作為走向差異，不可硬指定固定日期。');
    lines.push('五個位置每個都要讀到，不能跳過。');
  } else if (spreadId === 'nine') {
    lines.push('【九宮格讀法（3×3）】');
    lines.push('排列：');
    lines.push('  [1] [2] [3]');
    lines.push('  [4] [5] [6]');
    lines.push('  [7] [8] [9]');
    lines.push('');
    lines.push('九宮格屬現代實務小牌陣，不是 Game of Hope 原始占卜說明。使用時只能當 3×3 組合框架。');
    lines.push('第5張可作全盤焦點，周圍牌用來修飾它；三張成句優先於單張位置義。');
    lines.push('橫向、縱向、斜向與對照關係都只能作內部檢查，不得在正文報技術名稱，也不得硬套心理學層次。');
    lines.push('9個位置都要被納入判斷，但最後必須串成針對問題的故事，不逐格報告。');
  } else if (spreadId === 'grand') {
    lines.push('【大牌陣讀法】');
    lines.push('全部 36 張排出：4 排 8 張 ＋ 最後一排 4 張置中。這是 Game of Hope 原始占卜說明中可查的排法。');
    lines.push('');
    lines.push('代表牌：' + (sigGender === 'female' ? '淑女(29)' : '紳士(28)'));
    lines.push('');
    lines.push('原始邊界內必做：');
    lines.push('① 先找代表牌；女問卜者從 29 開始，男問卜者從 28 開始。');
    lines.push('② 先讀代表牌直接相鄰的牌，再由近到遠延伸。近牌優先，遠牌只作背景或較遠影響。');
    lines.push('③ 問事相關牌必須讀其相鄰牌，並看它離代表牌遠近。');
    lines.push('④ 所有判斷要由相鄰兩張/三張組成短句，不可以單張定論。');
    lines.push('');
    lines.push('現代實務輔助（可看但不可冒充原始說明）：');
    lines.push('・房屋系統：每個位置可用牌號主題作背景染色，但只能輔助，不得推翻相鄰牌與遠近。');
    lines.push('・角落、最後四張、騎士跳、整行整列：只可作弱輔助或補充驗證，不可當主要證據。');
    lines.push('・若現代輔助與代表牌近身牌衝突，以代表牌近身牌與問事相關牌優先。');
    lines.push('房屋背景參考：1騎士=消息/到來 2幸運草=小機會 3船=遠行/商貿 4房屋=穩定/根基 5樹=健康/成長 6雲=不明 7蛇=複雜/糾纏 8棺材=結束 9花束=美好/邀約 10鐮刀=切斷 11鞭=反覆/衝突 12鳥=溝通/焦慮 13孩子=新開始/小 14狐狸=工作/自保 15熊=金錢/權重 16星星=網路/方向 17鸛=改變 18狗=信任/熟人 19塔=機構/孤立 20花園=公開/社群 21山=阻礙 22路=選擇 23老鼠=耗損 24心=情感/熱情 25戒指=契約/組合 26書=資料/未知 27信=訊息/文書 28紳士=男問卜者 29淑女=女問卜者 30百合=成熟/冷靜 31太陽=曝光/成功 32月亮=名聲/情緒 33鑰匙=解答/確定 34魚=錢/生意流動 35錨=穩定/長期工作 36十字=負擔/責任。');
  }

  lines.push('');
  lines.push('══════════════════════════════════════════');
  lines.push('回答規則');
  lines.push('══════════════════════════════════════════');
  lines.push('1. 第一句直接回答問卜者的問題。');
  lines.push('2. 讀組合義，不是一張一張單獨解釋。正文只能自然引用本盤實際出現的牌組，不寫公式表，不拿盤外牌舉例。');
  lines.push('3. 像跟朋友講話，不像寫報告。不要粗體標題分類。');
  lines.push('4. 壞消息不包裝：棺材＝結束、鐮刀＝切斷、山＝阻礙。');
  lines.push('5. 每個重要結論用破折號附本盤牌組出處；訊號不足時直接說不足，不得用盤外牌名反證。');
  lines.push('6. 時間規則：原始 Game of Hope 沒有固定應期公式。除非牌面有近身、遠近、速度、訊息或短機會線索，否則只能給「先觀察的驗證窗口」，不可硬說必定幾天、幾週或某月。');
  lines.push('7. 可驗證信號必須來自牌面可觀察事件，例如訊息、詢問、公開曝光、阻礙解除；不要幻想不可驗證的內心劇情。');
  lines.push('8. 24 小時行動建議是現代實務轉譯，不是原典。只能從本盤牌組推導，並且要能實際操作；平台規則不確定時，不可說成確定可做。');
  lines.push('');

  // ════ 只回答問的問題 ════
  lines.push('⚠ 只回答問卜者實際問的問題。不需要的不提：');
  lines.push('・問感情不需要分析財務；問工作不需要分析感情');
  lines.push('・沒有問到的人不需要推年齡畫像');
  lines.push('・有問年齡/對象時，只能根據本盤已出現的牌推；推不到就說推不到，不得搬出未出現牌名');
  lines.push('・若問副業、庫存、降價、銷售：可以用魚/熊/狐狸/錨/船/花園/信/鳥等本盤牌組轉譯成經營建議，但必須明說「牌面支持的是方向，具體平台操作屬現代實務」。不得把 A/B/C 分層、幾折出清、幾天爆單、能直接聯繫收藏者等未由牌面或平台事實支持的內容說成雷諾曼正統。');
  lines.push('');

  // ════ 能量石收尾 ════
  lines.push('【收尾・能量石（品牌實務，非雷諾曼原典）】');
  lines.push('解讀全部完成後，最後只能順口帶一種能量石；必須明確定位為品牌實務輔助，不得說成牌義、原典或必然效果。');
  lines.push('只可根據本盤最需要補的狀態選一種，例如穩定、清晰、行動、財務流動；避免醫療、保證財運或誇大宣稱。');
  lines.push('結尾自然帶入一次：「靜月之光蝦皮有挑過的 → https://tw.shp.ee/9UHEJTp4」');
  lines.push('');

  // ════ 牌面資料 ════
  lines.push('══════════════════════════════════════════');
  lines.push('以下是抽到的牌面');
  lines.push('══════════════════════════════════════════');
  lines.push('');
  lines.push('牌陣：' + sp.name + '（' + sp.count + ' 張）');
  lines.push('');

  for (var i = 0; i < drawn.length; i++) {
    var c = drawn[i];
    var posLabel = sp.positions ? sp.positions[i] : ('位置 ' + (i+1));
    lines.push((i+1) + '. ' + posLabel + '：' + c.id + '.' + c.name + '（' + c.en + '）');
    lines.push('   關鍵字：' + c.key);
    lines.push('   常見順向語境（現代詞庫，不能單張定論）：' + c.pos);
    lines.push('   常見受阻語境（現代詞庫，不能單張定論）：' + c.neg);
    // 組合提示：跟前一張和後一張
    if (i > 0) {
      lines.push('   ← 與前張 ' + drawn[i-1].name + ' 組合讀');
    }
    if (i < drawn.length - 1) {
      lines.push('   → 與後張 ' + drawn[i+1].name + ' 組合讀');
    }
    lines.push('');
  }

  // 九宮格額外提示
  if (spreadId === 'nine' && drawn.length === 9) {
    lines.push('【九宮格位置對照】');
    lines.push('  [' + drawn[0].name + '] [' + drawn[1].name + '] [' + drawn[2].name + ']');
    lines.push('  [' + drawn[3].name + '] [' + drawn[4].name + '] [' + drawn[5].name + ']');
    lines.push('  [' + drawn[6].name + '] [' + drawn[7].name + '] [' + drawn[8].name + ']');
    lines.push('');
    lines.push('3×3 現代輔助資料（只作內部檢查，正文不要報位置術語）：');
    lines.push('中心焦點：' + drawn[4].name);
    lines.push('近身牌：' + drawn[1].name + '、' + drawn[7].name + '、' + drawn[3].name + '、' + drawn[5].name);
    lines.push('三張延伸A：' + drawn[0].name + '→' + drawn[4].name + '→' + drawn[8].name);
    lines.push('三張延伸B：' + drawn[2].name + '→' + drawn[4].name + '→' + drawn[6].name);
    lines.push('對照牌組：' + drawn[0].name + '↔' + drawn[8].name + '、' + drawn[2].name + '↔' + drawn[6].name + '、' + drawn[1].name + '↔' + drawn[7].name + '、' + drawn[3].name + '↔' + drawn[5].name);
  }

  // 合法牌名清單
  lines.push('');
  lines.push('【本次合法牌名清單（只能引用以下牌）】');
  lines.push(drawn.map(function(c){ return c.id + '.' + c.name; }).join('、'));
  lines.push('⚠ 正文只能引用上面清單的牌名。任何盤外牌名，即使只是拿來說明「如果有某牌才代表…」，也禁止出現。');

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
    var sps = [{id:'three',n:'三張線',d:'相鄰組合快讀'},{id:'five',n:'五張線',d:'組合延伸讀法'},{id:'nine',n:'九宮格',d:'3×3 組合分析'},{id:'grand',n:'大牌陣',d:'36張遠近讀法'}];
    for (var i=0;i<sps.length;i++) {
      h += '<button class="ln-spread-btn' + (sps[i].id===_lnSpread?' active':'') + '" onclick="_lnSetSpread(\''+sps[i].id+'\')">' + sps[i].n + '<br><span style="font-size:.6rem;opacity:.6">' + sps[i].d + '</span></button>';
    }
    h += '</div></div>';
    h += '<button class="ln-draw-btn" onclick="_lnDoDraw()">✦ 抽 牌 ✦</button>';
  } else {
    // Results
    var sp = SPREADS[_lnSpread];
    h += '<div class="ln-section"><div class="ln-section-title">✦ ' + sp.name + '（' + sp.count + ' 張）</div>';
    if (_lnSpread === 'nine') {
      h += '<div class="ln-grid-3x3">';
    } else {
      h += '<div class="ln-cards-row">';
    }
    for (var j=0;j<_lnDrawn.length;j++) {
      var c = _lnDrawn[j];
      var imgSrc = IMG_MAP[c.id] || '';
      h += '<div class="ln-card" style="animation-delay:'+j*0.05+'s">';
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
    h += '<div style="text-align:center"><button class="ln-reset-btn" onclick="_lnReset()">↺ 重新抽牌</button></div>';
  }
  h += '<div class="ln-footer">靜月之光 ・ jingyue.uk<br>Petit Lenormand 雷諾曼牌</div></div>';
  w.innerHTML = h;
}

// ════ Public API ════
window._lenormandOpen = function() {
  _lnPhase = 'input';
  _lnQuestion = '';
  _lnSpread = 'three';
  _lnDrawn = [];
  _lastPrompt = '';
  var w = _getWrap();
  w.style.display = 'block';
  _render();
  w.scrollTop = 0;
};

window._lenormandClose = function() {
  var w = _getWrap();
  w.style.display = 'none';
};

window._lnSetSpread = function(id) {
  // ★ 根治：切換牌陣前先存問題文字，否則 _render 會銷毀 textarea
  var qEl = document.getElementById('ln-q');
  if (qEl) _lnQuestion = qEl.value;
  _lnSpread = id;
  _render();
};

window._lnDoDraw = function() {
  var qEl = document.getElementById('ln-q');
  _lnQuestion = qEl ? qEl.value.trim() : '';
  var sp = SPREADS[_lnSpread];
  drawCards(sp.count);
  _lastPrompt = buildPrompt(_lnQuestion, _lnDrawn, _lnSpread, _lnSigGender);
  _lnPhase = 'result';
  _render();
  _getWrap().scrollTop = 0;
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
  // v2.3：重新抽牌＝重新開始一題。
  // 舊版只把畫面切回 input，沒有清空 _lnQuestion / _lnSpread，
  // 所以問題文字與上次選的大牌陣會被 _render() 再塞回畫面。
  _lnPhase = 'input';
  _lnQuestion = '';
  _lnSpread = 'three';
  _lnDrawn = [];
  _lnDeck = [];
  _lastPrompt = '';
  _lnSigGender = 'male';
  _render();
  _getWrap().scrollTop = 0;
};

})();
