// ═══════════════════════════════════════
// 靜月之光 — 雷諾曼牌 Lenormand v1.0
// 正統 Petit Lenormand 36 張・組合義讀法
// ═══════════════════════════════════════
(function () {
'use strict';
console.log('[Lenormand] 靜月之光 雷諾曼牌 v1.0 loaded');

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
    desc:'最基本的讀法。第一張是主題/過去，第二張是核心/現在，第三張是結果/未來。中間牌是重點，兩側修飾。',
    positions:['主題/過去','核心/現在','結果/未來']
  },
  five: { id:'five', name:'五張線', en:'Five-Card Line', count:5,
    desc:'中間牌（第3張）是核心。左邊兩張（1-2）是過去/原因，右邊兩張（4-5）是未來/發展。離核心越遠影響越間接。',
    positions:['遠因','近因','核心','近期發展','遠期結果']
  },
  nine: { id:'nine', name:'九宮格', en:'Nine-Card Box (3×3)', count:9,
    desc:'3×3 方陣。中心（第5張）是核心。上排=意識/表面，下排=潛意識/隱藏，左列=過去，右列=未來。四角是根源影響。十字線（2-5-8、4-5-6）是主軸。對角線是深層動力。',
    positions:['左上(過去+意識)','上中(意識)','右上(未來+意識)','左中(過去)','核心','右中(未來)','左下(過去+潛意識)','下中(潛意識)','右下(未來+潛意識)'],
    layout:'3x3'
  },
  grand: { id:'grand', name:'大牌陣', en:'Grand Tableau', count:36,
    desc:'全部36張排出。4排8張＋最後一排4張置中。以 Sig（紳士28/淑女29）為中心讀方位、距離、房屋系統、Knighting。',
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

  lines.push('你是精通 Petit Lenormand（小雷諾曼）的正統占卜師。以下是問卜者抽到的牌面與完整資料，請依正統雷諾曼讀法解讀。');
  lines.push('');

  // 問題
  if (question && question.trim()) {
    lines.push('【問卜者的問題】');
    lines.push(question.trim());
    lines.push('');
  }

  lines.push('【占卜日期】' + new Date().toISOString().slice(0,10));
  lines.push('');

  // ════ 正統讀法規則 ════
  lines.push('══════════════════════════════════════════');
  lines.push('正統雷諾曼讀法（必須嚴格遵守）');
  lines.push('══════════════════════════════════════════');
  lines.push('');
  lines.push('【核心原則——單張牌是「詞」，不是「句」】');
  lines.push('雷諾曼跟塔羅完全不同。單張牌幾乎沒有獨立意義。兩張牌組合才開始說話，三張牌說一個小故事。');
  lines.push('讀法：第一張是主題（名詞），第二張是修飾（形容詞/動詞）。');
  lines.push('例：鑰匙＋戒指＝確定的承諾；狐狸＋魚＝工作上的財務問題；棺材＋幸運草＝結束後的好運');
  lines.push('');
  lines.push('【無逆位】');
  lines.push('雷諾曼所有牌都正面朝上讀，沒有逆位概念。牌的正面/負面取決於相鄰牌的修飾和問題脈絡。');
  lines.push('');
  lines.push('【正面牌與負面牌】');
  lines.push('強正面：太陽(31)、鑰匙(33)、花束(9)、幸運草(2)、星星(16)');
  lines.push('強負面：棺材(8)、鐮刀(10)、山(21)、老鼠(23)、十字架(36)、雲(6)');
  lines.push('中性（看組合）：其餘牌');
  lines.push('正面牌＋負面牌＝效果被削弱或反轉。兩張正面牌＝效果放大。');
  lines.push('');
  lines.push('【距離與方位（適用 5 張以上）】');
  lines.push('離核心牌越近＝影響越直接、越近期。離核心越遠＝影響越間接、越遠期。');
  lines.push('');
  lines.push('【主題牌（問什麼就先找對應的牌）】');
  lines.push('問感情→找心(24)、戒指(25)在哪裡；問工作→找狐狸(14)、錨(35)；問財→找魚(34)、熊(15)；問健康→找大樹(5)；問溝通→找鳥(12)、信(27)；問旅行→找船(3)');
  lines.push('如果主題牌出現在抽到的牌中，必須特別分析它的位置和相鄰牌。');
  lines.push('');

  // ════ 牌陣專用讀法 ════
  if (spreadId === 'three') {
    lines.push('【三張線讀法】');
    lines.push('三張從左到右。中間牌（第2張）是核心焦點，左牌修飾或代表過去/原因，右牌修飾或代表未來/結果。');
    lines.push('先讀 1+2 的組合義，再讀 2+3 的組合義，最後讀 1+2+3 整串故事。');
    lines.push('三張全連讀成一個句子，不是三張各自解釋。');
  } else if (spreadId === 'five') {
    lines.push('【五張線讀法】');
    lines.push('五張從左到右。第3張是核心。');
    lines.push('讀法：先讀核心牌（第3張），再讀 2+3+4（近因→核心→近期發展），再讀 1+2（遠因），再讀 4+5（遠期發展）。');
    lines.push('最後讀第 1 張 vs 第 5 張的對照（起點 vs 終點方向）。');
    lines.push('五個位置每個都要讀到，不能跳過。');
  } else if (spreadId === 'nine') {
    lines.push('【九宮格讀法（3×3）】');
    lines.push('排列：');
    lines.push('  [1] [2] [3]');
    lines.push('  [4] [5] [6]');
    lines.push('  [7] [8] [9]');
    lines.push('');
    lines.push('第5張是核心。必讀層次：');
    lines.push('① 核心牌（第5張）的本質');
    lines.push('② 十字線：上方(2)＝意識想法、下方(8)＝潛意識/隱藏、左方(4)＝過去/原因、右方(6)＝未來/結果');
    lines.push('③ 四角：1=過去的想法、3=未來的想法、7=過去的隱藏、9=未來的隱藏');
    lines.push('④ 水平線：上排(1-2-3)、中排(4-5-6)、下排(7-8-9)各讀成一個句子');
    lines.push('⑤ 垂直線：左列(1-4-7)、中列(2-5-8)、右列(3-6-9)各讀成一個句子');
    lines.push('⑥ 對角線：1-5-9 和 3-5-7 各讀成一個句子');
    lines.push('⑦ Mirroring 鏡像配對：1↔9、3↔7、2↔8、4↔6 各為一組因果');
    lines.push('9個位置每個都要讀到。');
  } else if (spreadId === 'grand') {
    lines.push('【大牌陣 Grand Tableau 讀法】');
    lines.push('全部 36 張排出：4 排 8 張 ＋ 最後一排 4 張置中。');
    lines.push('');
    lines.push('Significator（代表牌）：' + (sigGender === 'female' ? '淑女(29)' : '紳士(28)'));
    lines.push('');
    lines.push('讀法層次（每層都要做）：');
    lines.push('① 找 Sig 位置——它在第幾排第幾位＝問卜者當前狀態');
    lines.push('② 方位讀法——Sig 左邊＝過去，右邊＝未來，上方＝意識，下方＝潛意識。距離越遠＝時間越遠');
    lines.push('③ 房屋系統——每個位置有預設含義（第1位＝騎士的房屋＝消息，第2位＝幸運草的房屋＝運氣…），牌落在哪個「房屋」就產生交叉義');
    lines.push('④ 主題牌——依問題找對應牌，看它落在哪個位置、周圍是什麼牌');
    lines.push('⑤ 組合串讀——Sig 所在的水平線讀成故事、垂直線讀成深度');
    lines.push('⑥ Knighting——從 Sig 做騎士跳（L形），每個落點是隱藏影響');
    lines.push('⑦ 角落牌——四個角是整個局面的框架');
    lines.push('⑧ 最後一排——最終走向');
  }

  lines.push('');
  lines.push('══════════════════════════════════════════');
  lines.push('回答規則');
  lines.push('══════════════════════════════════════════');
  lines.push('1. 第一句直接回答問卜者的問題。');
  lines.push('2. 讀組合義，不是一張一張單獨解釋。寫成「鑰匙＋戒指＝確定的承諾」這種句子。');
  lines.push('3. 像跟朋友講話，不像寫報告。不要粗體標題分類。');
  lines.push('4. 壞消息不包裝：棺材＝結束、鐮刀＝切斷、山＝阻礙。');
  lines.push('5. 每個結論用破折號附出處牌。只引用本盤實際出現的牌。');
  lines.push('6. 結尾給一個可驗證信號（「X 月若出現 Y 的人/事＝走對了」）。');
  lines.push('7. 結尾給一個 24 小時內可做的具體行動建議。');
  lines.push('');

  // ════ 只回答問的問題 ════
  lines.push('⚠ 只回答問卜者實際問的問題。不需要的不提：');
  lines.push('・問感情不需要分析財務；問工作不需要分析感情');
  lines.push('・沒有問到的人不需要推年齡畫像');
  lines.push('');

  // ════ 能量石收尾 ════
  lines.push('【收尾・能量石】');
  lines.push('解讀最後，依牌面判斷最需要的一種能量石，像占卜師順口多講一句。');
  lines.push('加一句你為什麼懂這顆石頭的知識句。');
  lines.push('結尾自然帶入：「靜月之光蝦皮有挑過的 → https://tw.shp.ee/9UHEJTp4」');
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
    lines.push('   正面：' + c.pos);
    lines.push('   負面：' + c.neg);
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
    lines.push('核心牌：' + drawn[4].name);
    lines.push('十字線：上' + drawn[1].name + '、下' + drawn[7].name + '、左' + drawn[3].name + '、右' + drawn[5].name);
    lines.push('對角線A：' + drawn[0].name + '→' + drawn[4].name + '→' + drawn[8].name);
    lines.push('對角線B：' + drawn[2].name + '→' + drawn[4].name + '→' + drawn[6].name);
    lines.push('鏡像配對：' + drawn[0].name + '↔' + drawn[8].name + '、' + drawn[2].name + '↔' + drawn[6].name + '、' + drawn[1].name + '↔' + drawn[7].name + '、' + drawn[3].name + '↔' + drawn[5].name);
  }

  // 合法牌名清單
  lines.push('');
  lines.push('【本次合法牌名清單（只能引用以下牌）】');
  lines.push(drawn.map(function(c){ return c.id + '.' + c.name; }).join('、'));

  return lines.join('\n');
}

// ════════════════════════════════════
// 五、全域暴露
// ════════════════════════════════════
window._LN = {
  CARDS: CARDS,
  SPREADS: SPREADS,
  IMG_MAP: IMG_MAP,
  shuffleDeck: shuffleDeck,
  drawCards: drawCards,
  buildPrompt: buildPrompt,
  getQuestion: function() { return _lnQuestion; },
  setQuestion: function(q) { _lnQuestion = q; },
  getSpread: function() { return _lnSpread; },
  setSpread: function(s) { _lnSpread = s; },
  getDrawn: function() { return _lnDrawn; },
  getSigGender: function() { return _lnSigGender; },
  setSigGender: function(g) { _lnSigGender = g; }
};

})();
