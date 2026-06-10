// ═══════════════════════════════════════
// 靜月之光 — 雷諾曼牌 Lenormand v3.0
// v3.0(2026/6/10)：指示牌（Significator）實裝——不使用／男士28／女士29／自選36任一。正統依據：
//   九宮格＝古法預置中央再抽八張圍繞（tarotquest 文獻明載）；大牌陣＝不預置、36張中定位後讀其圍繞/行列/左過去右未來
//   （Labyrinthos/Lenormand Reader）；三張五張線＝不預置、僅主題透鏡（正統線讀無預置法，誠實標示）。
//   自選任一張＝主題指示牌 signifier（Lenormand Reader 教學）。預置時抽牌池先移除該牌；線讀含盤外引用豁免條款。
// v2.9(2026/6/10)：鎏金夜祭 v2 視圖升級層
// v2.8(2026/6/10)：防線統一——回答規則補7（盤外資訊禁令）8（指令回聲禁令）、選石補嚴禁並列（六系統同步）
// v2.7(2026/6/10)：①鏡像配對資料修正——原誤印 1↔9/3↔7（那是四角X技法），改為正統摺鏡 1↔3/4↔6/7↔9（Etteilla 對折法，Stefan's Cards/Cafe Lenormand 可查證），與讀法區定義一致；②對角線B改印 7→5→3 方向（結果線定義）；③回答規則補「全程繁體中文」（實測輸出滲漏「财务」「外间」簡體字）；④應期數字須可溯源（實測「3到5個月」無任何方法可推得）
// v2.6(2026/6/10)：牌陣「自動判斷」（與塔羅同款體驗）——_lnDetectSpread 依問題分層交叉判斷（明確指定＞全局型＞第三者＞抉擇＞時間＞短是非＞感情對方＞原因＞工作財運＞方法），保留手動選陣；結果區標示自動選陣理由；分享卡同步用解析後牌陣
// Petit Lenormand 36 張・傳統組合義讀法・反盤外牌名幻覺
// ═══════════════════════════════════════
(function () {
'use strict';
console.log('[Lenormand] 靜月之光 雷諾曼牌 v2.3 loaded（+應期技法：距離/速度牌/牌號） — 原典邊界/本盤合法牌名/反盤外反證修正');

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
var _lnSpread = 'auto';      // v2.6：預設自動判斷（使用者仍可手動選）
var _lnResolved = 'three';   // v2.6：實際抽牌用的牌陣（auto 解析後）
var _lnAutoPick = null;      // v2.6：自動判斷結果 {id, why}，供結果區標示
var _lnQuestion = '';
var _lnSigGender = 'male'; // for Grand Tableau
var _lnSignif = null;        // v3.0：指示牌 card id（1-36）或 null＝不使用。28男士/29女士＝問卜者；任一張可作主題指示牌（signifier）。
                             //   正統用法（可查文獻）：九宮格＝古法預置中央再抽八張圍繞；大牌陣＝不預置、定位後讀其圍繞與行列；線讀＝僅主題透鏡、不預置。

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

function buildPrompt(question, drawn, spreadId, sigGender) {
  var sp = SPREADS[spreadId];
  var lines = [];

  lines.push('你是精通 Petit Lenormand（小雷諾曼）的正統雷諾曼占卜師。以下是問卜者抽到的牌面與完整資料，請依雷諾曼組合義、線讀、九宮格或大牌陣規則解讀。');
  lines.push('');
  lines.push('【人設・口吻——讀牌多年的雷諾曼占卜師，當面跟客人說話】');
  lines.push('你是雷諾曼占卜師，不是塔羅師、更不是占卜教科書。組合、距離、方向、關鍵牌你心裡都看完了，現在只把牌讀成客人用得上的結論。');
  lines.push('・客人只想知道三件事：答案是什麼、什麼時候、怎麼辦。');
  lines.push('・組合義、相鄰牌、距離、方位、鏡像配對、主題牌——全留在心裡跑，嘴上講白話。');
  lines.push('・像個有經驗的占卜師在跟你聊，不是在念分析報告；難聽的也照講，不嚇人、不灌雞湯、不推銷。');
  lines.push('・（口吻抓這種：「這個月感情有方向、但還在變——你心裡有期待，外面也有人靠近，成不成看一次明確的聯絡。」直接、講人話。）');
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
  lines.push('5. 嚴格只引用本盤抽到的牌。若年齡、人物、地點或事件訊號不足，直接說「本盤沒有足夠牌面支撐」，不得在正文說「如果有某某牌才代表…」這類盤外牌名。問題的主題牌（見下方【主題牌】）若一張都沒抽到，要老實點出，不可把泛用的好牌／壞牌硬讀成該主題的定論。');
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
  lines.push('【正統性邊界】');
  lines.push('雷諾曼不是塔羅：不用逆位、不讀圖像心理投射、不以元素或牌陣位置單張定義答案。線讀、九宮格與大牌陣皆以組合義、距離、方向、問事相關牌與相鄰牌為主。能量石收尾是品牌實務輔助，不屬雷諾曼原典。');
  lines.push('小雷諾曼沒有像 Waite/Crowley 那種單一「官方技術文件」；本站採可查文獻邊界：36 張 Petit Lenormand 牌系源於 Das Spiel der Hoffnung / Game of Hope 傳統。線讀、Portrait/Box、Grand Tableau 採現代公開教學中最嚴格的組合義、遠近、方位、房屋與相鄰牌讀法；凡屬現代實務補充必須誠實標示，不能冒充原典。');
  lines.push('');
  lines.push('【核心原則——單張牌是「詞」，不是「句」】');
  lines.push('雷諾曼跟塔羅完全不同。單張牌幾乎沒有獨立意義。兩張牌組合才開始說話，三張牌說一個小故事。');
  lines.push('讀法：相鄰牌彼此修飾，兩張形成短句，三張形成小故事；只能用本次抽到的相鄰牌與線索組句。');
  lines.push('・把兩張牌當「一組」來讀，前提是：實際相鄰、或落在同一條線（排／列／對角）、或經明確技法（大牌陣的連線追蹤、騎士跳）連起來。不要只因兩張牌牌義相近，就把盤上彼此不相鄰、也沒有線或技法連結的兩張硬湊成一組（例：九宮格裡上中與左下既不相鄰也不同線，不可當組合）。');
  lines.push('範例只可內部理解組合方式，正文不得引用本盤外的牌名或公式。');
  lines.push('');
  lines.push('【無逆位】');
  lines.push('雷諾曼所有牌都正面朝上讀，沒有逆位概念。牌的正面/負面取決於相鄰牌的修飾和問題脈絡。');
  lines.push('');
  lines.push('【正面牌與負面牌】');
  lines.push('強正面：太陽(31)、鑰匙(33)、花束(9)、幸運草(2)、星星(16)');
  lines.push('強負面：棺材(8)、鐮刀(10)、山(21)、老鼠(23)、十字架(36)、雲(6)');
  lines.push('中性（看組合）：其餘牌');
  lines.push('正面/負面分類只作內部判斷，正文不得用分類名教課；最後仍以相鄰組合與問題脈絡為準。');
  lines.push('');
  lines.push('【距離與方位（適用 5 張以上）】');
  lines.push('離核心牌越近＝影響越直接、越近期。離核心越遠＝影響越間接、越遠期。');
  lines.push('');
  lines.push('【主題牌（問什麼就先找對應的牌）】');
  lines.push('問感情→找心(24)、戒指(25)；問工作職務→找狐狸(14·工作/任務本身)、錨(35·穩定長期的職位)；問升遷・主管・職權→找熊(15·主管/老闆/上位者/權威)、塔(19·體制/公司/職階/官方位階)；問財→找魚(34·金錢流動)、熊(15·資產/財力)；問健康→找大樹(5)；問溝通→找鳥(12)、信(27)；問旅行→找船(3)；問運氣・運勢(尤其單日/短期「今天明天運氣好嗎」)→找幸運草(2·短期/當下的好運)、星星(16·正向徵兆與方向)。※熊(15)雙義：問職權時是「主管/上位者」，問財時是「資產/財力」，依問題定。');
  lines.push('主題牌若出現在本盤，必須特別讀它的相鄰牌與距離。主題牌若一張都沒抽到，正文開頭就要明講：「本盤沒有出現○○○等直接代表【這件事】的牌，所以不是直接在講它的核心機制，以下是從整體基調推得的傾向。」——並且不可把溝通牌、情緒牌、結果牌當成該主題的專屬牌來硬下定論（例：問升主管卻沒抽到熊/塔/狐狸，就不能拿太陽硬讀成「會升上主管」；太陽只是「成功/被看見」的泛象，是否為主管職位牌面並未給定論）。不得引用未抽到的牌名作反證。');
  lines.push('');

  // ════ 特殊題型（二選一/多選一・第三方內心）讀法 ════
  lines.push('【特殊題型讀法（按問題形狀調整，仍以組合義為本）】');
  lines.push('・問「A 還是 B」或「多選一」（價格/功效/外觀、工作壓力/睡眠/情緒…）：本盤是隨機抽牌，牌面沒有替這些選項貼標籤，嚴禁硬把某張牌指定成「A」或某個選項。正確做法：①若主軸牌性質明顯吻合某選項（如核心是雲＝心思混亂→偏「情緒」；核心是太陽＝亮眼曝光→偏「外觀」），就說它偏向那個並附牌；②若沒有任何牌對得上給的選項，就老實說「牌面不是落在這幾個選項，而是指向○○」，給方向不硬挑。A/B 題同理：讀整體基調指出「哪一種性質的選擇」較吻合（如主軸是止損就選風險低、能止血的那邊），不替 A、B 編故事。');
  lines.push('・問「對方的想法/意圖/是否隱瞞/是否可信/有沒有人暗中…」這類第三方內心：有抽到人物牌（紳士28/淑女29）就以它代表對方、讀其相鄰牌與距離；沒有人物牌時，用情緒/狀態牌呈現對方在這題上的傾向（心＝有感情、雲＝對方自己也不清楚、蛇＝有算計或不老實、鳥＝在談論/猶豫）。只講牌面顯示的傾向與態度，不可編造對方具體的內心獨白、對話或牌面沒有的細節；訊號不足就說不足。');
  lines.push('');

  // ════ 應期（時間）讀法 ════
  lines.push('【應期（時間）——雷諾曼怎麼推時間】');
  lines.push('雷諾曼的時間判斷不像星盤精準，方法是綜合判斷、給一個「範圍」並說出依據，不要假裝精準到某一天：');
  lines.push('・距離法（最原始、最可靠，5 張以上適用）：離核心牌／主題牌／代表牌越近＝越快、越近期；越遠＝越晚（超過 3 格算遠、超過 4 格算很遠）；緊貼＝最即時。');
  lines.push('・速度牌定節奏：鐮刀(10)＝突然、立刻；騎士(1)、鳥(12)＝快（數日內）；船(3)＝即將、在路上；鸛(17)＝改變將到。山(21)、錨(35)＝慢、延遲、長久；雲(6)＝拖延、不明；熊(15)、大樹(5)＝緩慢成長。');
  lines.push('・牌號法（常見教學、非原典，需當輔助、不可冒充原典）：用相關牌的編號對時間——1騎士～12鳥對應一年 12 個月、1～31 對應一個月的日、1～7 對應星期；月亮(32)＝約一個月／一個週期。');
  lines.push('・季節／時辰：太陽(31)＝夏天／白天；月亮(32)＝夜／週期。只在牌面明顯時用，不硬套。');
  lines.push('結論：用上面方法給一個時間範圍（例如「最快這一兩個月、慢則拖到年底」），並說清楚是哪張牌或哪段距離讓你這樣判，禁止只說「快了」。');
  lines.push('');

  // ════ 牌陣專用讀法 ════
  if (spreadId === 'three') {
    lines.push('【三張線讀法】');
    lines.push('三張從左到右。中間牌是焦點，左牌與右牌修飾它；可輔助看左到右的時間推進，但不能當塔羅三張位置單張解。');
    lines.push('先讀 1+2 的組合義，再讀 2+3 的組合義，最後讀 1+2+3 整串故事。');
    lines.push('鏡像對照：再把第1張↔第3張（兩端外牌）當一組讀，看起點與終點怎麼呼應——這是三張線的核心技法，不可略過。');
    lines.push('三張全連讀成一個句子，不是三張各自解釋。');
  } else if (spreadId === 'five') {
    lines.push('【五張線讀法】');
    lines.push('五張從左到右。第3張是焦點，2-3-4 是最直接的故事，1-2 與 4-5 是延伸。');
    lines.push('讀法：先看第3張被左右怎麼修飾，再讀 2+3+4，最後看 1+2 與 4+5 的延伸。');
    lines.push('鏡像對照（雷諾曼五張線核心技法，兩組都要讀）：卡2↔卡4（內層鏡像——緊貼焦點的兩股力量互相補充/對照）、卡1↔卡5（外層鏡像——最遠的起點 vs 終點/背景對照）。');
    lines.push('五個位置每個都要讀到，不能跳過。');
  } else if (spreadId === 'nine') {
    lines.push('【九宮格讀法（3×3）】');
    lines.push('排列：');
    lines.push('  [1] [2] [3]');
    lines.push('  [4] [5] [6]');
    lines.push('  [7] [8] [9]');
    lines.push('');
    lines.push('第5張是核心。權威讀法（Labyrinthos／lenormandreader 等）把層次分「主線」與「輔助」，主線就能回答多數問題；不要硬把每一層都讀，否則會繞圈、對角與十字常重複講同一件事。');
    lines.push('【主線・必讀】');
    lines.push('① 核心牌（第5張）＝這題的主題/本質/答案核心，周圍的牌都在修飾它，開頭就要讀進去。若核心牌看似與問題不直接相關（如問工作卻是心），那本身就是訊號——代表這題的重心其實在核心牌指的那塊（如你的渴望／情感投入），要點出來，別略過。');
    lines.push('② 三條橫排：上排(1-2-3)＝想法/意識/期待（檯面上、想追求的）；中排(4-5-6)＝現實/當下實況；下排(7-8-9)＝根基/潛意識/底層（事情的根源、藏著的）。');
    lines.push('③ 三條直列：左列(1-4-7)＝過去；中列(2-5-8)＝現在；右列(3-6-9)＝未來。');
    lines.push('④ 兩條對角線：1-5-9（左上→右下）＝原因／影響的來源；7-5-3（左下→右上）＝結果／往哪走。');
    lines.push('【輔助・選用】只在能補出主線沒講到的新訊號時才用，重複了就跳過：四角(1,3,7,9)＝整盤框架/背景定調（可看成 X：1↔9、3↔7）；鏡像配對（中列2-5-8為鏡軸）1↔3、4↔6、7↔9。');
    lines.push('深度來自針對問題把主線挖透，不是把每一層都報一遍；全部串成一個回答問題的故事，不要逐格報告。');
    if (drawn[4] && drawn[4]._presetSig) {
      lines.push('');
      lines.push('【指示牌・圍繞法（本盤適用，最優先）】第5張核心＝問卜者預先選定的指示牌「' + drawn[4].id + '.' + drawn[4].name + '」（古法：置指示牌於中央、再抽八張圍繞成 3×3）。核心即' + ((drawn[4].id === 28 || drawn[4].id === 29) ? '問卜者本人' : '「' + (drawn[4].topic || drawn[4].name) + '」這個主題本身') + '，周圍八張全部讀作對它的修飾與處境；橫排直列對角四角鏡像規則照舊、皆以它為中心。⚠ 指示牌是預置的錨、不是隨機抽出——不可把它當成「抽到了某張牌」的徵兆解讀（例如不可說「人物牌出現代表有對象靠近」），它的意義只在定位。');
    }
  } else if (spreadId === 'grand') {
    lines.push('【大牌陣 Grand Tableau 讀法】');
    lines.push('全部 36 張排出：4 排 8 張 ＋ 最後一排 4 張置中。');
    lines.push('');
    var _sigLb = _lnSignif ? (_lnSignif + '.' + ((CARDS[_lnSignif - 1] || {}).name || '') + '（你指定）') : (sigGender === 'female' ? '淑女(29)' : '紳士(28)');
    lines.push('Significator（代表牌）：' + _sigLb + ((_lnSignif && _lnSignif !== 28 && _lnSignif !== 29) ? '——主題指示牌：以它代表「這件事」而非人；方位、距離、圍繞讀法與人物指示牌相同' : ''));
    lines.push('');
    lines.push('※ GT 技術很多（遠近、房屋、knighting、鏡像、角落、連線…）。權威教學一致：挑核心幾項讀透，不要每項都做、也不要每張牌都報——硬做全部會攤薄、彼此重複。深度來自把核心挖透並回答問題。');
    lines.push('');
    lines.push('【核心・必讀】');
    lines.push('① Sig 位置＝問卜者當前狀態；若 Sig 落最後 4 張 cartouche，先說此題落在收束/命運性區，不硬塞回主盤。');
    lines.push('② 遠近法／方位（Method of Distance，GT 最核心）——以 Sig 為中心：左＝過去、右＝未來（並參考 Sig 牌面朝向＝他關注/走向哪邊）；上＝意識/檯面、下＝潛意識/根基。觸碰 Sig 的牌最即時最重要、先讀；超過 3 格＝遠（次要或時間遠）、超過 4 格＝很遠。');
    lines.push('③ Sig 的水平線讀成故事（左過去→右未來），垂直線讀成深度。');
    lines.push('④ 主題牌（見上方【主題牌】）——找到後讀它落在哪個房屋、緊鄰什麼牌、離 Sig 多遠。');
    lines.push('⑤ 感情/關係題必做「雙代表牌連線」：另一張人物牌＝對象（問卜者是紳士→淑女就是他的對象；反之亦然）。讀兩張代表牌「相距多遠、中間夾什麼牌、是否面向彼此」——這是「遇不遇得到、能不能走成」最直接的牌面依據：近＝靠近/有望、遠＝疏離/難成、夾在中間的牌＝過程會經過什麼。若對象那張離很遠或被負面牌包住，要老實說「牌面上兩人距離還遠」，不可只靠單張好牌喊有緣。');
    lines.push('');
    lines.push('【房屋系統 Houses（精修，願意才用）】每個位置＝該編號牌的「家」，落此位的牌被該房屋主題染色（牌＝發生什麼、房屋＝哪個領域）。重點看 Sig 與主題牌各落在哪個房屋即可，不必逐宮報。36 宮位：');
    lines.push('   1騎士=消息/到來 2幸運草=幸運/機會 3船=遠行/距離/商貿 4房屋=家庭/穩定 5樹=健康/根基 6雲=混亂/不明 7蛇=糾纏/背叛/女性對手 8棺材=結束/失去/病 9花束=禮物/喜悅/邀約 10鐮刀=突發切斷/危險/手術 11鞭=衝突/爭執/重複 12鳥=伴侶/兩人/閒言 13孩子=新開始/小/天真 14狐狸=工作/職涯/狡詐 15熊=上司/權威/金錢/母親 16星星=希望/夢想/指引 17鸛=改變/遷移 18狗=朋友/忠誠/信任 19塔=官方/機構/孤立 20花園=社交/公眾/聚會 21山=阻礙/延遲 22路=選擇/抉擇 23老鼠=損耗/壓力/失竊 24心=愛情/情感 25戒指=關係/承諾/契約 26書=祕密/知識/教育 27信=訊息/文件 28紳士=男方/男問卜者 29淑女=女方/女問卜者 30百合=平靜/成熟/家庭/性 31太陽=成功/活力/喜悅 32月亮=情緒/名聲/直覺/榮譽 33鑰匙=確定/解答/突破 34魚=金錢/生意/豐盛 35錨=穩定/工作/長久 36十字=負擔/業力/命運');
    lines.push('');
    lines.push('【進階・選用】只在能補出核心沒講到的新訊號時用，重複/無訊號就跳過：');
    lines.push('・連線追蹤——把要連的兩張牌各自沿行或列推進，看在哪交會＝隱藏影響（兩張同行或同列時此法不適用）。');
    lines.push('・Knighting——從 Sig 做騎士跳（L形），落點是反覆出現、被推上檯面的主題。');
    lines.push('・角落牌——四角順時針＝整局框架與大致結論。');
    lines.push('・最後一排 cartouche——長期收束/命運性背景；不可當唯一結果，仍須回到 Sig 與主題牌核對。');
  }

  lines.push('');
  lines.push('══════════════════════════════════════════');
  lines.push('回答規則');
  lines.push('══════════════════════════════════════════');
  lines.push('1. 第一句直接回答問卜者的問題。');
  lines.push('2. 讀組合義，不是一張一張單獨解釋。正文只能自然引用本盤實際出現的牌組，不寫公式表，不拿盤外牌舉例。');
  lines.push('3. 像跟朋友講話，不像寫報告。不要粗體標題分類。全程繁體中文（台灣用語），嚴禁混入任何簡體字。');
  lines.push('4. 壞消息不包裝：棺材＝結束、鐮刀＝切斷、山＝阻礙、鞭子＝衝突/重複的摩擦/批評、塔＝孤立、十字架＝負擔、雲＝混亂。中性或負面牌不要為了給正向建議只挑好的一面講——問「怎麼做」時，牌面該警告的（衝突、公開批評、孤立、消耗）一樣要照講，不可包裝成乾淨的行銷或勵志建議。');
  lines.push('5. 每個結論用破折號附出處牌。只引用本盤實際出現的牌；訊號不足時不得引用盤外牌名做反證。');
  lines.push('6. 應期要落地：用距離、速度牌或牌號，給出時間範圍並說出依據（哪張牌定的速度／離核心多遠），禁止只說「快了」，也不要假裝精準到某一天。範圍裡的每個數字都必須能溯源——牌號法就點名是哪張牌的編號（如大樹=5→約5週/5個月），距離法就講離核心幾格；推不出數字就只給快慢方向，嚴禁寫出沒有依據的數字（「3到5個月」這種沒牌可指的不准寫）。');
  lines.push('7. 嚴禁引用牌面之外你自以為知道的問卜者個人資訊（職業、班別、副業、商品、生活細節等）——即使對話上下文或你的記憶裡有，一律不得寫進來；所有具象都必須從本盤的牌與組合推出。');
  lines.push('8. 正文不得出現任何指令字眼（「禁語」「主題牌」「規則」「提示詞」等）——這些指令是給你的，不是讀給客人聽的。');
  lines.push('');

  // ════ 只回答問的問題 ════
  lines.push('⚠ 只回答問卜者實際問的問題。不需要的不提：');
  lines.push('・問感情不需要分析財務；問工作不需要分析感情');
  lines.push('・沒有問到的人不需要推年齡畫像');
  lines.push('・有問年齡/對象時，只能根據本盤已出現的牌推；推不到就說推不到，不得搬出未出現牌名');
  lines.push('');

  // ════ 能量石收尾 ════
  lines.push('【收尾・能量石】');
  lines.push('解讀最後，依牌面判斷最需要的一種能量石，像占卜師順口多講一句。主石只准寫出「一種」——嚴禁「或」「這類」「例如A、B」式並列第二種；只用通用礦石名。');
  lines.push('加一句你為什麼懂這顆石頭的知識句。');
  lines.push('結尾自然帶入一句「靜月之光蝦皮有挑過的」之類的話，然後以連結收尾：https://tw.shp.ee/9UHEJTp4 ——這個 URL 必須是整份輸出的最後一個字，網址後不接任何文字、標點、引號、符號或空白（黏上去連結會點不動）。'); // v2.6 連結＝全文末字，根治尾端黏字
  lines.push('');

  // ════ 牌面資料 ════
  lines.push('══════════════════════════════════════════');
  lines.push('以下是抽到的牌面');
  lines.push('══════════════════════════════════════════');
  lines.push('');
  lines.push('牌陣：' + sp.name + '（' + sp.count + ' 張）');
  lines.push('');

  var isGT = (spreadId === 'grand');
  for (var i = 0; i < drawn.length; i++) {
    var c = drawn[i];
    var posLabel;
    if (sp.positions) {
      posLabel = sp.positions[i];
    } else if (isGT) {
      var _r, _cc;
      if (i < 32) { _r = Math.floor(i/8); _cc = i % 8; } else { _r = 4; _cc = i - 32; }
      posLabel = '第' + (_r+1) + '排第' + (_cc+1) + '格';
    } else {
      posLabel = '位置 ' + (i+1);
    }
    lines.push((i+1) + '. ' + posLabel + '：' + c.id + '.' + c.name + '（' + c.en + '）' + (c._presetSig ? '　★指示牌（問卜者預先選定・置中，非隨機抽出）' : ''));
    lines.push('   關鍵字：' + c.key);
    lines.push('   正面：' + c.pos);
    lines.push('   負面：' + c.neg);
    if (isGT) {
      // 房屋系統：第 (i+1) 格＝第 (i+1) 號牌的「家」，用該牌主題當這格的領域
      var _hc = CARDS[i];
      lines.push('   落在第' + (i+1) + '宮（' + _hc.name + '宮·' + _hc.key + '）');
    } else {
      // 線/格：相鄰牌組合提示（大牌陣改看 2D 版面，不用線性相鄰）
      if (i > 0) {
        lines.push('   ← 與前張 ' + drawn[i-1].name + ' 組合讀');
      }
      if (i < drawn.length - 1) {
        lines.push('   → 與後張 ' + drawn[i+1].name + ' 組合讀');
      }
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
    lines.push('對角線A（原因線，左上→右下）：' + drawn[0].name + '→' + drawn[4].name + '→' + drawn[8].name);
    lines.push('對角線B（結果線，左下→右上）：' + drawn[6].name + '→' + drawn[4].name + '→' + drawn[2].name);
    lines.push('鏡像配對（中列為鏡軸對折）：' + drawn[0].name + '↔' + drawn[2].name + '、' + drawn[3].name + '↔' + drawn[5].name + '、' + drawn[6].name + '↔' + drawn[8].name);
    lines.push('四角X（框架定調）：' + drawn[0].name + '↔' + drawn[8].name + '、' + drawn[2].name + '↔' + drawn[6].name);
  }

  // 大牌陣 2D 版面 + Sig 座標（讓遠近/方位/房屋可被實際計算，而非靠線性編號猜）
  if (isGT && drawn.length === 36) {
    lines.push('【大牌陣實際版面（4排8張＋末排4張置中）——務必照此 2D 位置判斷遠近/方位/相鄰/房屋，不可把上面的編號順序當左右相鄰】');
    var _rowStr = function(s,e){ var a=[]; for (var k=s;k<=e;k++){ a.push('['+(k+1)+']'+drawn[k].name); } return a.join('  '); };
    lines.push('排1：' + _rowStr(0,7));
    lines.push('排2：' + _rowStr(8,15));
    lines.push('排3：' + _rowStr(16,23));
    lines.push('排4：' + _rowStr(24,31));
    lines.push('排5(置中)：' + _rowStr(32,35));
    lines.push('');
    var _sigId = _lnSignif || ((sigGender === 'female') ? 29 : 28);
    var _si = -1; for (var k2=0;k2<drawn.length;k2++){ if (drawn[k2].id===_sigId){ _si=k2; break; } }
    if (_si >= 0) {
      if (_si >= 32) {
        lines.push('Significator ' + _sigLb + ' 落在末排 cartouche（第' + (_si-31) + '張），屬收束/命運性背景區——先說此題落在這區，再回主盤核對，不硬塞回去。');
      } else {
        var _sr = Math.floor(_si/8), _sc = _si % 8;
        lines.push('Significator ' + _sigLb + ' 落在第' + (_sr+1) + '排第' + (_sc+1) + '格。以它為中心讀：');
        var _row=[]; for (var k3=_sr*8;k3<=_sr*8+7;k3++){ _row.push(drawn[k3].name + (k3<_si?'(左·過去)':k3>_si?'(右·未來)':'(Sig)')); }
        lines.push('・Sig 同一排（時間軸，左過去→右未來）：' + _row.join('、'));
        var _col=[]; for (var rr=0;rr<4;rr++){ var _ci=rr*8+_sc; _col.push(drawn[_ci].name + (rr<_sr?'(上·意識/檯面)':rr>_sr?'(下·潛意識/根基)':'(Sig)')); }
        lines.push('・Sig 同一列（上意識↔下潛意識）：' + _col.join('、'));
        var _nb=[];
        if (_sc>0) _nb.push('左=' + drawn[_si-1].name);
        if (_sc<7) _nb.push('右=' + drawn[_si+1].name);
        if (_sr>0) _nb.push('上=' + drawn[_si-8].name);
        if (_sr<3) _nb.push('下=' + drawn[_si+8].name);
        lines.push('・緊貼 Sig 的牌（最即時、先讀）：' + _nb.join('、'));
      }
    }
    lines.push('');
  }

  // v3.0：指示牌・線讀透鏡（正統線讀不預置；豁免條款處理與盤外牌名禁令的衝突）
  if (_lnSignif && (spreadId === 'three' || spreadId === 'five')) {
    var _sgC = CARDS[_lnSignif - 1] || {};
    lines.push('【指示牌・主題透鏡】問卜者指定「' + _lnSignif + '.' + _sgC.name + '」代表' + ((_lnSignif === 28 || _lnSignif === 29) ? '他本人' : '這件事（' + (_sgC.topic || _sgC.name) + '）') + '。正統線讀不預置指示牌，它只作定位：整條線都讀成關於這個主體的故事；若它恰好被抽出，即為全線錨點。⚠ 指示牌名可用來稱呼主體，但若未被抽出，不得引用它的組合義當牌面證據（它不在本盤合法牌名清單內）。');
    lines.push('');
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
  try{var _g2=document.createElement('style');_g2.setAttribute('data-jy-gilt2','lenormand');_g2.textContent='.ln-section{background:linear-gradient(180deg,rgba(24,20,14,.78),rgba(14,12,9,.86));border:1px solid rgba(201,168,76,.2);border-radius:18px;box-shadow:0 18px 40px rgba(0,0,0,.45),inset 0 1px 0 rgba(245,231,184,.14);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px)}.ln-section-title{position:relative;padding-left:12px;letter-spacing:.08em;color:#e8d28a}.ln-section-title::before{content:"";position:absolute;left:0;top:50%;transform:translateY(-50%);width:3px;height:1.05em;border-radius:2px;background:rgba(226,232,240,.85);box-shadow:0 0 8px rgba(226,232,240,.85)}.ln-q-input{background:rgba(8,7,5,.62);border:1px solid rgba(201,168,76,.26);border-radius:12px;color:#f2e9d6;transition:border-color .2s,box-shadow .2s}.ln-q-input:focus{border-color:#e8d28a;box-shadow:0 0 0 3px rgba(201,168,76,.16);outline:none}.ln-spread-btn{background:rgba(201,168,76,.06);border:1px solid rgba(201,168,76,.22);color:#d8c79a;border-radius:12px;transition:all .18s}.ln-spread-btn.active{background:linear-gradient(135deg,#e8d28a,#c9a84c);color:#171208;border-color:transparent;box-shadow:0 6px 18px rgba(201,168,76,.28);font-weight:700}.ln-spread-auto{border:1px solid rgba(232,210,138,.55);box-shadow:0 0 0 1px rgba(201,168,76,.18),0 8px 22px rgba(201,168,76,.16);border-radius:14px}.ln-draw-btn{background:linear-gradient(110deg,#8a6d2f,#e8d28a 28%,#c9a84c 52%,#f5e7b8 74%,#8a6d2f);background-size:220% 100%;animation:jyGiltFlow 5.5s linear infinite;color:#171208;border:none;border-radius:14px;font-weight:800;letter-spacing:.14em;box-shadow:0 10px 26px rgba(201,168,76,.32),inset 0 1px 0 rgba(255,255,255,.35)}.ln-draw-btn:active{transform:translateY(1px)}.ln-reset-btn{background:transparent;border:1px solid rgba(201,168,76,.34);color:#cdb87f;border-radius:12px}.ln-back{color:rgba(232,210,138,.75)}.ln-back:hover{color:#f5e7b8}.ln-card{background:linear-gradient(180deg,rgba(26,24,20,.9),rgba(15,13,10,.94));border:1px solid rgba(226,232,240,.16);border-radius:12px;box-shadow:0 10px 26px rgba(0,0,0,.5),inset 0 1px 0 rgba(245,231,184,.1)}.ln-grid-3x3{gap:10px}.ln-ai-card{background:linear-gradient(180deg,rgba(24,20,14,.78),rgba(14,12,9,.86));border:1px solid rgba(201,168,76,.2);border-radius:18px;box-shadow:0 18px 40px rgba(0,0,0,.45),inset 0 1px 0 rgba(245,231,184,.14);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px)}@media (prefers-reduced-motion:reduce){.ln-draw-btn{animation:none}}@supports not (backdrop-filter:blur(1px)){[data-jy-view-lenormand]{}}.ln-draw-btn:focus-visible{outline:2px solid #e8d28a;outline-offset:2px}';document.head.appendChild(_g2);}catch(e){}
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
    h += '<div class="ln-auto-note" style="margin-top:.5rem">男士／女士代表你本人；自選任一張可作主題定位（如問財選魚34、問感情選心24）。九宮格會把指示牌置於中央（古法圍繞法），大牌陣會在 36 張中定位它來讀，三張／五張線僅作主題透鏡。</div></div>';
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
    return { name: c.name || '', pos: pl };
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
  // ★ 根治：切換牌陣前先存問題文字，否則 _render 會銷毀 textarea
  var qEl = document.getElementById('ln-q');
  if (qEl) _lnQuestion = qEl.value;
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
  // v3.0：九宮格＋指示牌＝古法預置中央（tarotquest 等文獻：置指示牌於中央、再抽八張圍繞成 3×3）；池先移除指示牌避免重複
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
  _lastPrompt = buildPrompt(_lnQuestion, _lnDrawn, _lnResolved, _lnSigGender);
  _lnPhase = 'result';
  _render();
  _getWrap().scrollTop = 0;
};

// v3.0：指示牌選擇
window._lnSetSig = function (id) {
  _lnSignif = id;
  if (id === 28) _lnSigGender = 'male';
  if (id === 29) _lnSigGender = 'female';
  var ov = document.getElementById('ln-sig-ov'); if (ov) ov.remove();
  _render();
};
window._lnSigPickOpen = function () {
  var ov = document.createElement('div'); ov.id = 'ln-sig-ov';
  ov.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(8,7,5,.82);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;padding:18px';
  var bx = '<div style="max-width:520px;width:100%;max-height:78vh;overflow:auto;background:rgba(20,17,12,.97);border:1px solid rgba(201,168,76,.35);border-radius:18px;padding:16px;box-shadow:0 24px 60px rgba(0,0,0,.6)">';
  bx += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px"><b style="color:#e8d28a;letter-spacing:.1em">選擇指示牌</b><button onclick="document.getElementById(\'ln-sig-ov\').remove()" style="background:none;border:none;color:#cdb87f;font-size:1.2rem;cursor:pointer">✕</button></div>';
  bx += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">';
  for (var i = 0; i < CARDS.length; i++) {
    var c = CARDS[i];
    bx += '<button onclick="_lnSetSig(' + c.id + ')" style="padding:.5rem .3rem;border-radius:10px;border:1px solid rgba(201,168,76,' + (_lnSignif === c.id ? '.8' : '.25') + ');background:rgba(201,168,76,' + (_lnSignif === c.id ? '.16' : '.05') + ');color:#e9dec0;font-size:.78rem;cursor:pointer">' + c.id + '. ' + c.name + '</button>';
  }
  bx += '</div></div>'; ov.innerHTML = bx;
  ov.onclick = function (e) { if (e.target === ov) ov.remove(); };
  document.body.appendChild(ov);
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
