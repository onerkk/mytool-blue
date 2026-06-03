// ═══════════════════════════════════════
// 靜月之光 — 雷諾曼牌 Lenormand v80.9
// Petit Lenormand 36 張・傳統組合義讀法・反盤外牌名幻覺
// ═══════════════════════════════════════
(function () {
'use strict';
console.log('[Lenormand] 靜月之光 雷諾曼牌 v80.9 loaded — 來源等級內部化/正文不輸出技法背景/真實相鄰');

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
    desc:'三張線讀。現代實務牌陣，非 Game of Hope 原始排法；中間牌是焦點，左右相鄰牌修飾，核心仍是組合義。',
    positions:['左側修飾/前因','焦點','右側修飾/發展']
  },
  five: { id:'five', name:'五張線', en:'Five-Card Line', count:5,
    desc:'五張線讀。現代實務牌陣，非 Game of Hope 原始排法；第3張是焦點，2-3-4 是近身故事，不能逐張單獨解。',
    positions:['左外修飾','左近修飾','焦點','右近修飾','右外修飾']
  },
  nine: { id:'nine', name:'九宮格', en:'Nine-Card Box (3×3)', count:9,
    desc:'3×3 現代實務牌陣，非 Game of Hope 原始排法。只按3×3實際相鄰與三張成句輔助解讀。',
    positions:['第1張','第2張','第3張','第4張','第5張','第6張','第7張','第8張','第9張'],
    layout:'3x3'
  },
  grand: { id:'grand', name:'大牌陣', en:'Grand Tableau', count:36,
    desc:'全部36張排出。本站採 Game of Hope 可查核心：4排8張＋最後4張置中；以紳士28/淑女29與其附近牌、遠近為優先。房屋等僅作現代弱輔助。',
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
  var sp = SPREADS[spreadId] || SPREADS.three;
  var lines = [];
  var q = (question || '').trim();
  var isAgeQuestion = /幾歲|年齡|多大|歲數/.test(q);

  function cardName(c){ return c ? (c.id + '.' + c.name) : ''; }
  function simpleName(c){ return c ? c.name : ''; }
  function uniqCards(arr){
    var seen = {}, out = [];
    (arr || []).forEach(function(c){ if(c && !seen[c.id]){ seen[c.id]=1; out.push(c); } });
    return out;
  }
  function joinCards(arr){
    arr = uniqCards(arr);
    return arr.length ? arr.map(cardName).join('、') : '無';
  }
  function getGridCoord(i, sid){
    if (sid === 'nine') return {r: Math.floor(i/3), c: i%3};
    if (sid === 'grand') {
      if (i < 32) return {r: Math.floor(i/8), c: i%8};
      return {r: 4, c: 2 + (i - 32)}; // 4×8＋最後4張置中（欄2-5）
    }
    return {r:0, c:i};
  }
  function findIndexByCoord(coord, sid){
    var i;
    if (sid === 'nine') {
      if (coord.r < 0 || coord.r > 2 || coord.c < 0 || coord.c > 2) return -1;
      return coord.r * 3 + coord.c;
    }
    if (sid === 'grand') {
      if (coord.r >= 0 && coord.r <= 3 && coord.c >= 0 && coord.c <= 7) return coord.r * 8 + coord.c;
      if (coord.r === 4 && coord.c >= 2 && coord.c <= 5) return 32 + (coord.c - 2);
      return -1;
    }
    i = coord.c;
    return (i >= 0 && i < drawn.length) ? i : -1;
  }
  function neighboursOf(i, sid, diagonal){
    var coord = getGridCoord(i, sid);
    var steps = diagonal
      ? [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]]
      : [[-1,0],[0,-1],[0,1],[1,0]];
    var out = [];
    steps.forEach(function(st){
      var idx = findIndexByCoord({r: coord.r + st[0], c: coord.c + st[1]}, sid);
      if (idx >= 0 && idx < drawn.length) out.push(drawn[idx]);
    });
    return uniqCards(out);
  }
  function realAdjacent(i){
    if (spreadId === 'three' || spreadId === 'five') {
      return uniqCards([drawn[i-1], drawn[i+1]]);
    }
    if (spreadId === 'nine' || spreadId === 'grand') return neighboursOf(i, spreadId, false);
    return uniqCards([drawn[i-1], drawn[i+1]]);
  }
  function nearCards(i){
    if (spreadId === 'nine' || spreadId === 'grand') return neighboursOf(i, spreadId, true);
    return realAdjacent(i);
  }
  function topicIdsForQuestion(text){
    var ids = [];
    function add(a){ a.forEach(function(x){ if(ids.indexOf(x)<0) ids.push(x); }); }
    if (/感情|愛|喜歡|暗戀|交往|復合|分手|桃花|肉體|性|曖昧|對象|現任|前任|女友|男友|告白/.test(text)) add([24,25]);
    if (/公司|同事|工程師|工作|上班|職場|副業|蝦皮|賣場|銷售|事業|職涯/.test(text)) add([14,35]);
    if (/財|錢|收入|業績|營業額|庫存|降價|促銷|訂單|生意|破萬|破十萬/.test(text)) add([34,15]);
    if (/健康|身體|病|累|疲勞|精神|睡眠/.test(text)) add([5]);
    if (/訊息|聯絡|聊天|回覆|私訊|聊聊|溝通|說話/.test(text)) add([12,27]);
    if (/遠方|旅行|搬|移動|商貿|物流/.test(text)) add([3]);
    if (/女|女生|女性|她|女工程師|異性/.test(text)) add([29,7]);
    if (/男|男性|他|本人|我/.test(text)) add([28]);
    return ids;
  }
  function cardById(id){
    for (var i=0;i<drawn.length;i++) if (drawn[i].id === id) return {card: drawn[i], index: i};
    return null;
  }
  function distanceBetween(i, j){
    if (i < 0 || j < 0) return null;
    if (spreadId === 'three' || spreadId === 'five') return Math.abs(i-j);
    var a = getGridCoord(i, spreadId), b = getGridCoord(j, spreadId);
    return Math.max(Math.abs(a.r-b.r), Math.abs(a.c-b.c));
  }
  function layoutLine(){
    if (spreadId === 'nine' && drawn.length === 9) {
      return '  [' + drawn[0].name + '] [' + drawn[1].name + '] [' + drawn[2].name + ']\n' +
             '  [' + drawn[3].name + '] [' + drawn[4].name + '] [' + drawn[5].name + ']\n' +
             '  [' + drawn[6].name + '] [' + drawn[7].name + '] [' + drawn[8].name + ']';
    }
    if (spreadId === 'grand' && drawn.length === 36) {
      var out = [];
      for (var r=0;r<4;r++) {
        var row=[];
        for (var c=0;c<8;c++) row.push('[' + drawn[r*8+c].name + ']');
        out.push('  ' + row.join(' '));
      }
      out.push('          [' + drawn[32].name + '] [' + drawn[33].name + '] [' + drawn[34].name + '] [' + drawn[35].name + ']');
      return out.join('\n');
    }
    return drawn.map(function(c){return '['+c.name+']';}).join(' ');
  }

  lines.push('你是精通 Petit Lenormand（小雷諾曼）的雷諾曼占卜師。以下是問卜者抽到的牌面與完整資料。請只把來源等級與正統邊界當作內部校驗，避免把現代實務冒充原典；正文不要向問卜者解釋牌陣來源、原典/現代差異或技法背景。請直接回答問卜者的問題。');
  lines.push('');
  lines.push('【人設——你是雷諾曼占卜師，不是占卜教科書】');
  lines.push('你是面對面跟客人說話的雷諾曼占卜師，不是塔羅師。你已經看完相鄰組合、代表牌附近牌、問事相關牌與遠近，現在只告訴客人結果。');
  lines.push('・客人只想知道：答案是什麼、什麼時候、怎麼辦；不想聽來源分級、技法背景或教學。');
  lines.push('・你內心優先用相鄰牌與三張成句分析；現代牌陣輔助只能作背景，不可壓過附近牌與問事相關牌。');
  lines.push('・像一個有經驗的占卜師在聊天，不是在寫分析報告。');
  lines.push('');
  lines.push('【禁語——以下術語禁止出現在你的回答裡】');
  lines.push('・不要輸出版面技法術語，例如「橫排」「直列」「對角線」「四角」「鏡像配對」「Portrait」「Grand Tableau」「Knighting」「房屋系統」。');
  lines.push('・不要主動說「這次是現代實務三張線／五張線／九宮格」「不是 Game of Hope 原始排法」「不是完全官方原典」；這些只供內部自檢，除非問卜者本題就是在問正統性。');
  lines.push('・不要報「位置 X」「左上」「右下」「上中」「下中」，直接說結論。');
  lines.push('・不要說「正面牌」「負面牌」「中性牌」「強正面」「強負面」，也不要用單張吉凶分類教課。');
  lines.push('・不要說「主題牌」「核心牌」。要說「牌面上跟財富直接相關的是魚，旁邊接到……」。');
  lines.push('・出處用自然語氣帶：「鑰匙跟戒指一起出來，所以承諾很明確」；不要把正文寫成公式表。');
  lines.push('');
  lines.push('【最高原則——一切圍繞問卜者的問題】');
  lines.push('1. 問什麼答什麼；不要擴寫成通盤運勢。');
  lines.push('2. 牌陣結構只是輔助框架，不是逐一報告清單。所有訊息都要拿來回答問題，但禁止寫成技術流程。');
  lines.push('3. 同一張牌在不同問題裡意義不同。問感情時，魚可讀成感情流動或慾望流動；問財時才主看錢。');
  lines.push('4. 哪幾張相鄰牌、哪個問事相關牌對這題最關鍵就深講，其餘融進敘事或不提。');
  lines.push('5. 嚴格只引用本盤抽到的牌；訊號不足就說「本盤沒有足夠牌面支撐」，不得引用盤外牌名反證。');
  lines.push('');
  lines.push('【問卜者的問題】');
  lines.push(q || '（問卜者未填寫明確問題）');
  lines.push('');
  lines.push('【占卜日期】' + new Date().toLocaleDateString('zh-TW', {timeZone:'Asia/Taipei'}));
  lines.push('');
  lines.push('【內部校驗：牌陣來源等級（不得輸出到正文）】');
  if (spreadId === 'grand') {
    lines.push('內部判定：本次使用 36 張大牌陣。這是最接近 Game of Hope 可查占卜核心的排法：4排8張＋最後4張、男28／女29、從代表牌附近牌說故事。此段只供內部校驗，正文不可主動講給問卜者聽。');
  } else {
    lines.push('內部判定：本次使用「' + sp.name + '」。它不是 Game of Hope 原始占卜排法，屬現代雷諾曼實務牌陣；只能用雷諾曼組合義解讀，不得在正文宣稱完全官方原典。此段只供內部校驗，正文不可主動講給問卜者聽。');
  }
  lines.push('');
  lines.push('══════════════════════════════════════════');
  lines.push('雷諾曼組合義與正統邊界（必須嚴格遵守）');
  lines.push('══════════════════════════════════════════');
  lines.push('');
  lines.push('【內部校驗：正統性邊界（不得輸出到正文）】');
  lines.push('雷諾曼不是塔羅：不用逆位、不讀 RWS 圖像心理投射、不用元素尊嚴、不用牌陣位置單張定義答案。判斷優先順序是：①本盤實際相鄰兩張／三張組合 ②代表牌附近牌 ③問事相關牌及其相鄰牌 ④遠近作強弱背景 ⑤現代牌陣輔助。');
  lines.push('目前可查的原始技術不是完整「官方技術文件」，而是 Game of Hope 4頁說明中的簡要 oracle 方法：洗牌、切牌、排成4排8張加最後4張，女問卜者從29、男問卜者從28開始，依附近牌說故事。除此之外，沒有官方逐牌占卜義、九宮格、房屋、騎士跳或固定應期公式。');
  lines.push('British Museum 館藏 1896,0501.495 記錄 Das Spiel der Hofnung 為完整36張牌並附4頁說明；Horniman Museum 1970.18 記錄36張 Lenormand 牌以 Hechtel 約1799年的 Game of Hope 為模型。');
  lines.push('原始說明沒有完整逐張占卜牌義、沒有固定月份/日期應期公式、沒有要求房屋、角落、騎士跳、九宮格或能量石。這些若使用，只能當現代實務輔助，不能冒充原典或正統硬規則。');
  lines.push('');
  lines.push('【核心原則——單張牌是「詞」，不是「句」】');
  lines.push('單張牌不能獨立定論。兩張牌才開始形成短句，三張牌才形成小故事。每個重要結論至少要有實際相鄰兩張支撐，重大結論盡量用三張或代表牌／問事相關牌互證。');
  lines.push('本盤每張牌下方關鍵字、順向語境、受阻語境是現代常用詞庫，不是 Hechtel 原始說明的逐張牌義。');
  lines.push('');
  lines.push('【相鄰資料使用規則——資料層防誤讀】');
  if (spreadId === 'nine') {
    lines.push('本次是九宮格。逐張牌只可讀「3×3版面實際接觸到的牌」。禁止把抽牌序號的第3→第4、第6→第7當作相鄰牌。');
  } else if (spreadId === 'grand') {
    lines.push('本次是大牌陣。逐張牌只可讀「4×8＋最後4張置中」版面實際接觸到的牌。禁止把換行或進入最後4張的抽牌序號當作相鄰牌，例如第8→第9、第16→第17、第24→第25、第32→第33不可自動視為相鄰。');
  } else {
    lines.push('本次是線型牌陣，可以按牌序讀相鄰牌，但仍不能逐張單獨斷事。');
  }
  lines.push('');
  lines.push('【問事相關牌（只作定位，不作單張裁決）】');
  lines.push('問感情→看心(24)、戒指(25)及其相鄰牌；問工作/副業→看狐狸(14)、錨(35)及其相鄰牌；問財/生意→看魚(34)、熊(15)及其相鄰牌；問健康→看大樹(5)；問溝通→看鳥(12)、信(27)；問旅行/商貿→看船(3)。');
  lines.push('如果問事相關牌在本盤出現，必須讀它旁邊至少兩張與它離代表牌遠近；如果沒有出現，只能說「本盤沒有直接牌面支撐」。');
  if (isAgeQuestion) {
    lines.push('');
    lines.push('【年齡問題硬限制】');
    lines.push('雷諾曼可查原始邊界沒有精準歲數公式。除非人物牌、成熟/年輕線索、問事相關牌或代表牌附近牌互相支撐，否則必須說「本盤無法推出精準年齡」。不得報 25、30、35 這類具體歲數；最多只能弱推「偏年輕／偏成熟／有經驗／推不出」。');
  }
  lines.push('');
  lines.push('【時間規則】');
  lines.push('Game of Hope 原始說明沒有固定應期公式。除非牌面有近身、遠近、速度、訊息或短機會線索，否則只能給「先觀察的驗證窗口」；即使給窗口，也要明說不是保證日期。');
  lines.push('');

  if (spreadId === 'three') {
    lines.push('【內部校驗：三張線讀法】');
    lines.push('三張從左到右組成一句話；中間牌是語句焦點，左右實際相鄰牌修飾它。');
  } else if (spreadId === 'five') {
    lines.push('【內部校驗：五張線讀法】');
    lines.push('五張從左到右組成一段話；以中間三張為最近身故事，兩端只作延伸。');
  } else if (spreadId === 'nine') {
    lines.push('【內部校驗：九宮格讀法】');
    lines.push('九宮格不是 Game of Hope 原始說明。使用時只能當 3×3 實際相鄰組合框架，不能把心理層次或版面術語當正統規則。');
    lines.push('中間牌可作語句焦點，周圍實際相鄰牌修飾它；三張成句優先於單張位置義。');
  } else if (spreadId === 'grand') {
    lines.push('【內部校驗：大牌陣讀法】');
    lines.push('全部36張排成4排8張＋最後4張置中。先找代表牌（男問卜者28、女問卜者29），先讀代表牌實際附近牌，再由近到遠延伸。問事相關牌也必須讀其實際相鄰牌。');
    lines.push('房屋、角落、最後4張、騎士跳等只可作現代弱輔助，不可推翻代表牌附近牌與問事相關牌。正文不要輸出技法名。');
  }
  lines.push('');
  lines.push('══════════════════════════════════════════');
  lines.push('回答規則');
  lines.push('══════════════════════════════════════════');
  lines.push('1. 第一句直接回答問卜者問題。');
  lines.push('2. 讀組合義，不是一張一張單獨解釋。正文只能自然引用本盤實際出現的牌組。');
  lines.push('3. 每個重要結論用破折號附本盤實際相鄰牌組出處；若證據較弱，就用保守語氣，不要把輔助線索講成確定事實；訊號不足就直接說不足。');
  lines.push('4. 可驗證信號必須來自牌面可觀察事件，例如訊息、對話、公開互動、阻礙解除；不要幻想不可驗證的內心劇情。');
  lines.push('5. 24小時行動建議只能從本盤牌組推導，且要能實際操作；不要向問卜者解釋這是什麼技法來源。');
  lines.push('6. 收尾能量石只能當最後順口輔助，不得說成牌義、原典或必然效果。');
  lines.push('7. 嚴格自檢：若問卜者沒有問正統性，正文不得主動提來源等級、原典/現代差異、官方文件或牌陣分級；只回答占卜結果。若問卜者另問正統性，才可說明來源等級。');
  lines.push('');

  lines.push('══════════════════════════════════════════');
  lines.push('重要：以下資料中的來源等級、正統邊界、讀法說明全部是內部校驗。正文第一句必須直接回答問題，不得說「這次是某某牌陣／這不是原典／這是現代實務」。');
  lines.push('');
  lines.push('以下是抽到的牌面');
  lines.push('══════════════════════════════════════════');
  lines.push('');
  lines.push('牌陣：' + sp.name + '（' + sp.count + ' 張）');
  lines.push('');
  lines.push('【版面排列】');
  lines.push(layoutLine());
  lines.push('');

  for (var i = 0; i < drawn.length; i++) {
    var c = drawn[i];
    var adj = realAdjacent(i);
    var near = nearCards(i).filter(function(x){ return adj.indexOf(x) < 0; });
    lines.push((i+1) + '. 第' + (i+1) + '張：' + cardName(c) + '（' + c.en + '）');
    lines.push('   關鍵字：' + c.key);
    lines.push('   常見順向語境（現代詞庫，不能單張定論）：' + c.pos);
    lines.push('   常見受阻語境（現代詞庫，不能單張定論）：' + c.neg);
    lines.push('   實際相鄰牌（可優先組合讀）：' + joinCards(adj));
    if ((spreadId === 'nine' || spreadId === 'grand') && near.length) {
      lines.push('   近身輔助牌（低於實際相鄰，僅作補充）：' + joinCards(near));
    }
    lines.push('');
  }

  if (spreadId === 'nine' && drawn.length === 9) {
    lines.push('【九宮格實際相鄰校正】');
    lines.push('中間牌：' + cardName(drawn[4]));
    lines.push('中間牌實際相鄰：' + joinCards(realAdjacent(4))); 
    lines.push('提醒：第3張與第4張、第6張與第7張只是抽牌序號相連，不是3×3版面直接相鄰，不可當主要組合證據。');
    lines.push('');
  }

  if (spreadId === 'grand' && drawn.length === 36) {
    var sigId = (sigGender === 'female') ? 29 : 28;
    var sigObj = cardById(sigId);
    lines.push('【代表牌附近資料】');
    if (sigObj) {
      lines.push('代表牌：' + cardName(sigObj.card));
      lines.push('代表牌實際相鄰：' + joinCards(realAdjacent(sigObj.index)));
      lines.push('代表牌近身輔助：' + joinCards(nearCards(sigObj.index)));
    } else {
      lines.push('代表牌未出現在本次抽牌中（此情況理論上不應出現在36張大牌陣）。');
    }
    lines.push('');
  }

  var topicIds = topicIdsForQuestion(q);
  var topicRows = [];
  topicIds.forEach(function(id){
    var found = cardById(id);
    if (found) {
      var dist = null;
      var sigId = (sigGender === 'female') ? 29 : 28;
      var sigFound = cardById(sigId);
      if (sigFound) dist = distanceBetween(found.index, sigFound.index);
      topicRows.push(cardName(found.card) + '｜實際相鄰：' + joinCards(realAdjacent(found.index)) + (dist !== null ? '｜離代表牌距離：約' + dist : ''));
    }
  });
  if (topicRows.length) {
    lines.push('【問事相關牌定位（現代實務，低於代表牌附近牌與實際相鄰）】');
    topicRows.forEach(function(x){ lines.push('・' + x); });
    lines.push('');
  } else {
    lines.push('【問事相關牌定位（現代實務，低於代表牌附近牌與實際相鄰）】本盤沒有抽到足夠直接對應牌；正文必須說明訊號不足，不得引用盤外牌名反證。');
    lines.push('');
  }

  lines.push('【本次合法牌名清單（只能引用以下牌）】');
  lines.push(drawn.map(function(c){ return c.id + '.' + c.name; }).join('、'));
  lines.push('⚠ 正文只能引用上面清單的牌名。任何盤外牌名，即使只是拿來說明「如果有某牌才代表…」，也禁止出現。');
  lines.push('');
  lines.push('【收尾・能量石（品牌實務，非雷諾曼原典）】');
  lines.push('解讀全部完成後，最後只能順口帶一種能量石；必須明確定位為品牌實務輔助，不得說成牌義、原典或必然效果。避免醫療、保證財運或誇大宣稱。結尾自然帶入一次：「靜月之光蝦皮有挑過的 → https://tw.shp.ee/9UHEJTp4」');

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
  {id:'gemini',name:'Gemini',url:'https://gemini.google.com/'},
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
    var sps = [{id:'three',n:'三張線',d:'現代實務'},{id:'five',n:'五張線',d:'現代實務'},{id:'nine',n:'九宮格',d:'現代實務'},{id:'grand',n:'大牌陣',d:'Game of Hope 核心'}];
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
  var s = btn && btn.querySelector ? btn.querySelector('span') : null;
  var names = {chatgpt:'ChatGPT',claude:'Claude',gemini:'Gemini',grok:'Grok',deepseek:'DeepSeek',kimi:'Kimi',doubao:'豆包',metaai:'Meta AI',copilot:'Copilot',perplexity:'Perplexity'};
  function copySync(text) {
    try {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly','');
      ta.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      return true;
    } catch(e) { return false; }
  }
  copySync(_lastPrompt);
  try { if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(_lastPrompt).catch(function(){}); } catch(_e) {}
  if (s) s.textContent = '已複製！';
  var opened = null;
  try { opened = window.open(url, '_blank', 'noopener'); } catch(e) { opened = null; }
  if (!opened) {
    try { window.location.href = url; } catch(_e2) {}
  }
  setTimeout(function(){ if(s) s.textContent = names[id] || id; }, 2000);
};

window._lnReset = function() {
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
