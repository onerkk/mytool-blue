// ═══════════════════════════════════════
// 靜月之光 — 雷諾曼牌 Lenormand v14.0（自適應語義推理核心）
// 2026/7/15：重建為「問題保真→角色框架→局部多假設→遞迴折疊→全盤一致性選擇→命題圖→深度解讀→行動建議」。
// 五種牌陣只提供可驗證幾何；AI保留原問句全部層次，自行決定牌句語法、語義角色、結論強度與敘事深度。
// 每條合法路徑先產生候選牌句，再由整個牌陣競爭、校正與交叉佐證；不採事件關鍵字表，也不以第一個合理故事作結。
// 大牌陣完整讀取30條主盤直線與獨立末排，建立跨線命題群；本人場是重要入口，但全盤所有相關線索均可進入答案。
// 最終輸出除裁決與完整分析外，增加由牌面機制推導的具體觀察點與可採取方向，協助迷惘中的使用者做現實判斷。
// Petit Lenormand 36 張・相鄰組合句法・五牌陣共用引擎・品牌層獨立
// ═══════════════════════════════════════
(function () {
'use strict';
console.log('[Lenormand] 靜月之光 雷諾曼牌 v14.0 loaded — adaptive semantic reasoning core');

// ════════════════════════════════════
// 一、36 張牌完整數據
// ════════════════════════════════════
var CARDS = [
  {id:1,  name:'騎士',  en:'Rider',      key:'消息・到來・速度',       scope:'消息、來訪、到來、快速移動、推進',                    guard:'消息好壞由相鄰牌決定；沒有圖像朝向資料時不判斷來向。'},
  {id:2,  name:'幸運草',en:'Clover',     key:'短暫機會・小幸運',       scope:'短暫機會、小幅有利、輕鬆、偶然、時間短',                guard:'機會通常有限或短暫，不等於長期保證。'},
  {id:3,  name:'船',    en:'Ship',       key:'遠方・移動・貿易',       scope:'遠方、旅行、移動、貿易、拓展、距離',                    guard:'是否延遲或順利必須由相鄰牌決定。'},
  {id:4,  name:'房屋',  en:'House',      key:'家庭・住處・根基',       scope:'家庭、住處、私人領域、根基、穩定結構、房產',             guard:'不自動等同婚姻或一定安全。'},
  {id:5,  name:'大樹',  en:'Tree',       key:'健康・生命・長期',       scope:'健康、身體、生命力、根源、成長、長期累積',               guard:'健康題只能談牌面傾向與就醫提醒，不作診斷。'},
  {id:6,  name:'雲',    en:'Clouds',     key:'混亂・不確定・遮蔽',     scope:'混亂、不確定、資訊模糊、看不清、反覆',                  guard:'只有牌組提供明暗面方向資料時，才可判斷哪一側較清晰；本系統未提供時禁止使用。'},
  {id:7,  name:'蛇',    en:'Snake',      key:'複雜・繞路・策略',       scope:'複雜、繞路、策略、誘惑、戒心、欺瞞風險',                 guard:'不自動等於第三者、壞女人或背叛；必須有問題脈絡與連線支持。'},
  {id:8,  name:'棺材',  en:'Coffin',     key:'結束・停擺・封閉',       scope:'結束、終止、停擺、封閉、失去、無法繼續',                guard:'不可為了好聽把結束改寫成必然重生或轉機。'},
  {id:9,  name:'花束',  en:'Bouquet',    key:'邀請・禮物・愉悅',       scope:'邀請、禮物、讚美、愉悅、吸引力、禮貌',                  guard:'不自動等於長期承諾。'},
  {id:10, name:'鐮刀',  en:'Scythe',     key:'突然切斷・決斷・風險',   scope:'突然切斷、快速決定、分離、收割、尖銳風險',               guard:'沒有牌面刀刃朝向資料時，不判斷切向哪一張牌。'},
  {id:11, name:'鞭子',  en:'Whip',       key:'重複・摩擦・衝突',       scope:'重複、摩擦、爭論、壓力、訓練、反覆行為',                 guard:'只有親密或性問題脈絡明確時，才可讀成性行為或性張力。'},
  {id:12, name:'鳥',    en:'Birds',      key:'對話・焦慮・短暫騷動',   scope:'對話、交換、電話、焦慮、八卦、成雙、短暫騷動',           guard:'不自動等於正式承諾或確定消息。'},
  {id:13, name:'孩子',  en:'Child',      key:'小・新・初階',           scope:'小、新開始、初學、孩子、單純、規模小、不成熟',            guard:'不自動推定懷孕或實際兒童，除非問題與連線支持。'},
  {id:14, name:'狐狸',  en:'Fox',        key:'自保・策略・工作風險',   scope:'自保、策略、警覺、自利、欺瞞風險；工作題可指任務或職務', guard:'不論任何題型都不可單張直接判定詐騙或犯罪。'},
  {id:15, name:'熊',    en:'Bear',       key:'力量・權威・資源',       scope:'力量、保護、權威、資源、財力、控制、佔有',               guard:'依問題判斷是資源、主管、保護者或控制，不可全部同時套用。'},
  {id:16, name:'星星',  en:'Stars',      key:'方向・清晰・希望',       scope:'方向、清晰、希望、指引、長程規劃、網絡',                 guard:'只有問題本身涉及數位平台或網路時，才可具體讀成線上管道。'},
  {id:17, name:'鸛',    en:'Stork',      key:'改變・遷移・轉換',       scope:'改變、遷移、轉換、調整、改善或不穩定',                  guard:'是否改善由相鄰牌決定；不自動推定懷孕。'},
  {id:18, name:'狗',    en:'Dog',        key:'朋友・忠誠・支持',       scope:'朋友、忠誠、信任、支持、熟人、依賴',                    guard:'不自動等於戀愛對象。'},
  {id:19, name:'塔',    en:'Tower',      key:'機構・權威・分隔',       scope:'機構、官方、公司、權威、獨立、距離、孤立、界線',          guard:'依問題與相鄰牌判斷是獨立、制度還是隔離。'},
  {id:20, name:'花園',  en:'Garden',     key:'公開・社交・群體',       scope:'公開場合、社交、群體、活動、曝光、觀眾、名聲',            guard:'不自動等於網路；只有問題脈絡支持時才可延伸為公開平台。'},
  {id:21, name:'山',    en:'Mountain',   key:'阻礙・封鎖・延遲',       scope:'阻礙、封鎖、延遲、距離、難以跨越、抗拒',                 guard:'除非問題本身詢問防守或固定不動，否則不可淡化成單純穩固。'},
  {id:22, name:'十字路口',en:'Crossroads',key:'選擇・分岔・猶豫',     scope:'選擇、替代方案、分岔、自由、猶豫、方向不一',              guard:'不自動代表多個對象，除非問題與連線支持。'},
  {id:23, name:'老鼠',  en:'Mice',       key:'消耗・流失・焦慮',       scope:'消耗、流失、侵蝕、減少、焦慮、細小損耗',                 guard:'不單張指控偷竊；犯罪只能描述可觀察風險。'},
  {id:24, name:'心',    en:'Heart',      key:'愛・喜歡・熱情',         scope:'愛、喜歡、熱情、情感投入、愉悅、欲望',                  guard:'不自動等於承諾、婚姻或關係穩定。'},
  {id:25, name:'戒指',  en:'Ring',       key:'承諾・協議・循環',       scope:'承諾、協議、合約、關係、循環、重複',                    guard:'承諾是否公平、持久或會結束由相鄰牌決定。'},
  {id:26, name:'書',    en:'Book',       key:'未知・秘密・知識',       scope:'未知、秘密、尚未揭露、知識、學習、紀錄',                 guard:'不單張推定秘密一定揭露，也不捏造秘密內容。'},
  {id:27, name:'信',    en:'Letter',     key:'文字・文件・通知',       scope:'文字訊息、文件、通知、紀錄、書面往來',                  guard:'消息好壞由相鄰牌決定；不自動等於合約成立。'},
  {id:28, name:'紳士',  en:'Man',        key:'男性人物・男性指示牌',   scope:'男性問卜者、明確指定的男性、或牌面中的重要男性',          guard:'角色須由性別聲明、預先指定與問題脈絡決定；不因單張推定成熟度。'},
  {id:29, name:'淑女',  en:'Woman',      key:'女性人物・女性指示牌',   scope:'女性問卜者、明確指定的女性、或牌面中的重要女性',          guard:'角色須由性別聲明、預先指定與問題脈絡決定；不因單張推定成熟度。'},
  {id:30, name:'百合',  en:'Lily',       key:'成熟・和平・倫理',       scope:'成熟、和平、和諧、長者、倫理、冷靜；親密題可指性',         guard:'只有親密問題脈絡明確時才讀性；不以牌號換算年齡。'},
  {id:31, name:'太陽',  en:'Sun',        key:'成功・活力・可見',       scope:'成功、活力、信心、清楚、曝光、熱度、成果',               guard:'不等於任何具體事件必然成功，仍須服從整條組合。'},
  {id:32, name:'月亮',  en:'Moon',       key:'情緒・認可・名聲',       scope:'情緒、認可、名聲、創意、週期、感受',                    guard:'不讀塔羅式潛意識，也不單張判定幻想或欺騙。'},
  {id:33, name:'鑰匙',  en:'Key',        key:'重要・確定・解法',       scope:'重要、確定、解法、開啟、關鍵條件、可行性',               guard:'確定的是相鄰組合所指內容，不可跳過中間牌。'},
  {id:34, name:'魚',    en:'Fish',       key:'金錢・生意・流動',       scope:'金錢、生意、交易、流動、資源、數量、自由',               guard:'不以牌號或單張推算精確金額。'},
  {id:35, name:'錨',    en:'Anchor',     key:'穩定・持續・工作',       scope:'穩定、持續、工作、長期、固定、停滯、執著',               guard:'是穩定還是卡住，由相鄰牌與問句決定。'},
  {id:36, name:'十字架',en:'Cross',      key:'負擔・痛苦・責任',       scope:'負擔、痛苦、責任、考驗、信仰、不得不承受',               guard:'不自動宣稱命中注定或不可改變。'}
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
    desc:'現代短線讀法。三個合法片段經多假設比較與遞迴折疊，形成聚焦而完整的牌句。',
    positions:['第1張','第2張','第3張']
  },
  five: { id:'five', name:'五張線', en:'Five-Card Line', count:5,
    desc:'現代長線讀法。十個連續片段共同呈現單一事件的形成、轉折與落點。',
    positions:['第1張','第2張','第3張','第4張','第5張']
  },
  choice: { id:'choice', name:'雙路比較', en:'Two-Path Comparison', count:7,
    desc:'現代對稱比較。兩條完整路徑各自深讀，再由共同情境以同一標準比較。',
    positions:['A1','A2','A3','共同背景','B1','B2','B3'],
    layout:'choice'
  },
  nine: { id:'nine', name:'九宮格', en:'Nine-Card Box (3×3)', count:9,
    desc:'現代九張方陣。八條完整線透過共享節點，形成同一議題的多層語義網。',
    positions:['第1格','第2格','第3格','第4格','中心','第6格','第7格','第8格','第9格'],
    layout:'3x3'
  },
  grand: { id:'grand', name:'大牌陣', en:'Grand Tableau', count:36,
    desc:'36張全牌陣。30條主盤直線與獨立末排完整深讀，再整合為跨線語義網與實際建議。',
    positions:null,
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
var _lnSignif = null;        // v3.0：指示牌 card id（1-36）或 null＝不使用。28男士/29女士＝問卜者；任一張可作主題指示牌（signifier）。
                             //   v4.0：九宮格置中屬現代焦點法；大牌陣不預置、在36張中定位；線讀不預置。

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
// 四、正統提示詞生成
// ════════════════════════════════════
// ── v7.0 問題→牌陣：只判斷結構與解析度，語義交由AI ──
function _lnLocalISODate() {
  var d = new Date();
  var p = function(n){ return String(n).padStart(2, '0'); };
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
}

function _lnCleanChoiceOption(s) {
  return String(s || '')
    .replace(/[？?。！!；;]+$/g, '')
    .replace(/^(?:我)?(?:到底)?(?:該|要|應該|選擇|選|考慮)\s*/g, '')
    .replace(/(?:哪一個|哪個)?(?:比較|較)?(?:適合(?:我)?|好|有利|值得)(?:我)?\s*$/g, '')
    .trim();
}

function _lnCountMatches(text, re) {
  var m = String(text || '').match(re);
  return m ? m.length : 0;
}

function _lnAnalyzeQuestion(q) {
  q = String(q || '').trim();
  var compact = q.replace(/\s+/g, '');
  var parts = q.split(/[？?；;\n]+/).map(function(s){ return s.trim(); }).filter(Boolean);

  // 只辨識「問句幾何與安全邊界」。內容詞不直接決定牌義、答案或牌陣大小。
  var asksWhen = /什麼時候|幾時|何時|多久|還要等|等多久|哪一週|幾週|哪個月|幾個月|幾年|應期|多快|多晚|何日/.test(q);
  var asksExactDate = /哪一天|哪天發生|幾月幾日|確切日期|確切時間|幾號|幾點|幾分/.test(q);
  var hasFixedHorizon = /今天|明天|後天|本週|這週|下週|本月|這月|這個月|下個月|今年|明年|年底前|月底前|週內|月內|年內|近期|最近|\d+\s*(?:天|週|個月|月|年)內|\d{4}[\/-]\d{1,2}(?:[\/-]\d{1,2})?/.test(q);
  var asksWhy = /為什麼|為何|什麼原因|原因是|根源|問題出在|怎麼會|怎麼回事|卡在哪|阻礙在哪|障礙在哪/.test(q);
  var asksHow = /怎麼辦|如何做|怎麼做|怎樣做|怎麼改善|如何改善|怎麼準備|如何準備|方法|策略|建議|下一步|該如何|如何處理|怎麼處理/.test(q);
  var asksInner = /怎麼想|想法|心裡|內心|意圖|打算|真心|喜不喜歡|愛不愛|愛我|喜歡我|在不在乎|是否隱瞞|有沒有隱瞞|是否可信|可信嗎|值得信任|誠不誠實|態度|暗戀|秘密喜歡|對我有沒有意思|對我有意思嗎/.test(q);
  var isHiddenClaim = /暗戀|秘密|暗中|隱瞞|沒說|未公開|真心|背著|外遇|出軌|第三者|欺騙/.test(q);

  var asksExactAge = /幾歲|歲數|年齡(?:是多少|多大|大約多少|約多少)?|幾年次|出生年|出生年月|生日|\d+\s*歲(?:以下|以上|以內|左右|內)?/.test(q);
  var asksWho = /是誰|有誰|誰在|哪一位|哪個人|哪個同事|哪名|具體是誰/.test(q);
  var asksExactIdentity = asksWho || /叫什麼名字|姓名是什麼|真實姓名|住哪裡|詳細地址|電話號碼|手機號碼|帳號是什麼|身分證|身份證/.test(q);
  var asksExactAmount = /賺多少(?:錢)?|收入多少|營業額多少|營收多少|業績多少|金額多少|多少元|多少塊|確切金額|價格是多少/.test(q);
  var asksProbability = /百分之幾|幾成機率|機率多少|概率多少|成功率多少/.test(q);

  var asksPersonProfile = /外貌|長相|身高|體型|職業|做什麼工作|哪裡人|個性|性格|特徵|類型|年輕|同齡|成熟|年長|年紀|相處模式/.test(q);
  var profileTraitCount = [
    /外貌|長相|身高|體型/.test(q),
    /職業|做什麼工作/.test(q),
    /個性|性格|相處模式/.test(q),
    /年輕|同齡|成熟|年長|年紀/.test(q),
    /哪裡人|地區|背景/.test(q)
  ].filter(Boolean).length;

  // 「單一議題多面向」只在問句明確要求多個不同面向時成立；單純問發展、走向或整體結果仍是單一開放題。
  var aspectFlags = [
    /來源|起因|根源/.test(q),
    /優勢|助力|有利條件/.test(q),
    /風險|阻礙|障礙|代價/.test(q),
    /結果|結局|後續結果/.test(q),
    /方法|策略|建議|下一步/.test(q),
    /時間|何時|多久/.test(q)
  ];
  var aspectTermCount = aspectFlags.filter(Boolean).length;
  var explicitMultiAspect = /多面向|各面向|全面分析|完整分析|優勢.*(?:風險|阻礙|結果)|風險.*(?:優勢|結果|方法)|來源.*(?:阻礙|結果)|阻礙.*(?:結果|方法)|助力.*阻力|阻力.*結果/.test(q) || aspectTermCount >= 3;

  // 多領域全景：必須是多個彼此可獨立回答的生活主題，或明確要求人生／年度全景。
  var globalCue = /人生全貌|整體人生|所有面向|全部領域|全年整體|年度總運|未來一年整體|通盤|全局|人生各方面/.test(q);
  var listConnectorCount = _lnCountMatches(q, /、|以及|並且|同時|和|跟|與|及/g);
  var looksLikePersonPair = /^(?:我|你|他|她|我們|你們|他們|她們)(?:和|跟|與)/.test(compact);
  var panoramaCue = /整體|各方面|全部|都|年度|全年|運勢|狀況|變化|趨勢|順利/.test(q);
  var likelyDomainList = !looksLikePersonPair && listConnectorCount >= 1 && panoramaCue && !explicitMultiAspect && profileTraitCount < 2;
  var isGlobal = globalCue || likelyDomainList;

  // 雙路只接受兩個可替代方案；「我和他」等人物連接不是選項。
  var explicitAB = /(?:^|\s)A\s*(?:還是|或|或者|或是|跟|與|和|vs\.?|VS\.?)\s*B(?:\s|$|哪|比)/i.test(q) || /選項\s*A.*選項\s*B/i.test(q);
  var binaryDecisionMatch = q.match(/^(?:我|我們)?(?:到底)?(?:該不該|應不應該|要不要|值不值得|適不適合)\s*(.+?)(?:[？?]|$)/);
  var explicitChoiceCue = /二選一|二擇一|兩個選項|比較.*(?:和|跟|與|及|還是|或者|或是)|選哪|哪一個比較|哪個比較|哪條路|何者較/.test(q);
  var actionAlternativeCue = /留職|離職|轉職|去[^？?]*還是|搬|買|賣|接受|拒絕|留下|離開|交往|分手|復合|投資|創業|發展/.test(q);
  var altConnectorCount = _lnCountMatches(q, /還是|或者|或是|或|、/g);
  var moreThanTwoOptions = /A.*B.*C/i.test(q) || /三個選項|三選一|三擇一/.test(q) || (altConnectorCount >= 2 && /哪個|選|比較/.test(q));
  var incompleteChoice = /(?:還是|或者|或是|或|和|跟|與)\s*[？?]?\s*$/.test(q) || /^\s*(?:還是|或者|或是)\s*/.test(q);
  var explicitPairMatch = q.match(/(.+?)(?:還是|或者|或是|或|和|跟|與)(.+?)(?:[？?]|$)/);
  var isChoice = !moreThanTwoOptions && (explicitAB || !!binaryDecisionMatch || (!looksLikePersonPair && explicitPairMatch && (explicitChoiceCue || actionAlternativeCue)));
  var choiceA = null, choiceB = null;
  if (binaryDecisionMatch) {
    var action = _lnCleanChoiceOption(binaryDecisionMatch[1]);
    choiceA = action;
    choiceB = action ? ('不' + action) : null;
  } else if (isChoice && explicitPairMatch) {
    choiceA = _lnCleanChoiceOption(explicitPairMatch[1]);
    choiceB = _lnCleanChoiceOption(explicitPairMatch[2]);
  } else if (isChoice && explicitAB) {
    choiceA = '選項A'; choiceB = '選項B';
  }

  var yesNoPartRe = /嗎\s*$|^(?:會不會|有沒有|能不能|可不可以|是不是|是否|要不要|該不該|應不應該|適不適合|值不值得|行不行|成不成|愛不愛|喜不喜歡)/;
  var partYesNoCount = parts.reduce(function(n, part){ return n + (yesNoPartRe.test(part.replace(/\s+/g,'')) ? 1 : 0); }, 0);
  var isYesNo = partYesNoCount > 0 || /嗎[？?]?\s*$/.test(compact) || /^(?:會不會|有沒有|能不能|可不可以|是不是|是否|愛不愛|喜不喜歡)/.test(compact) || /(?:會|有|能|愛|喜歡).+還是(?:不|沒有|不能)/.test(compact);

  var isConditionalProfileBundle = asksPersonProfile && /(?:若|如果|假如).*(?:有|會|出現|發生)|(?:若有|如果有|若會|如果會)/.test(q);
  var linkedFollowUp = /^(?:那|又|並且|以及|另外)?(?:為什麼|原因|阻礙|障礙|卡在哪|怎麼|如何|何時|什麼時候|多久|結果|走向|後續|若有|如果有|他|她|對方|這件事|這段|該怎麼)/;
  var clausesLinked = true;
  if (parts.length > 1) {
    for (var ci = 1; ci < parts.length; ci++) {
      if (!linkedFollowUp.test(parts[ci])) { clausesLinked = false; break; }
    }
  }
  var independentMulti = parts.length >= 2 && !isChoice && !clausesLinked;
  var linkedDiagnosticBundle = parts.length <= 3 && clausesLinked && (asksWhy || asksHow) && !asksPersonProfile;
  var linkedTimingBundle = parts.length <= 3 && clausesLinked && asksWhen;
  var multiPart = parts.length >= 2 || /(?:以及|另外|還有|同時)/.test(q);
  var asksThreshold = /破\s*(?:\d|[一二三四五六七八九十百千萬兩])|超過\s*(?:\d|[一二三四五六七八九十百千萬兩])|達到\s*(?:\d|[一二三四五六七八九十百千萬兩])|至少\s*(?:\d|[一二三四五六七八九十百千萬兩])|高於\s*(?:\d|[一二三四五六七八九十百千萬兩])|低於\s*(?:\d|[一二三四五六七八九十百千萬兩])|門檻/.test(q);

  var medicalDiagnosis = /(?:我|他|她|對方).*(?:是不是|是否|有沒有|會不會).*(?:癌症|腫瘤|懷孕|流產|精神病|憂鬱症|躁鬱症|傳染病|重病)|(?:我|他|她)?懷孕(?:了)?嗎|是不是懷孕/.test(q);
  var fatalityQuestion = /會不會死|何時死|幾歲死|壽命多久|死期/.test(q);
  var criminalFact = /(?:是不是|是否|有沒有).*(?:偷竊|偷我|詐騙|下毒|犯罪|犯法|性侵|侵占)|(?:他|她|對方).*(?:偷了|騙了|下毒)/.test(q);
  var directLegalLiability = /(?:是不是|是否|有沒有).*(?:違法|有罪|犯罪成立)|會不會被判刑/.test(q);

  // 面向數只計算原問句明示要求的回答工作，不把「暗戀／秘密／內心」當成額外面向。
  var facetCount = 1;
  if (asksWhy) facetCount++;
  if (asksHow) facetCount++;
  if (asksWhen) facetCount++;
  if (asksPersonProfile) facetCount += profileTraitCount >= 2 ? 2 : 1;
  if (explicitMultiAspect) facetCount = Math.max(facetCount, 3);
  if (isConditionalProfileBundle) facetCount = Math.max(facetCount, 3);

  var questionShape = '一般單一議題';
  if (isChoice) questionShape = '雙路決策比較';
  else if (isGlobal) questionShape = '多領域／全景問題';
  else if (explicitMultiAspect || facetCount >= 3) questionShape = '單一議題多面向全貌';
  else if (asksWhy || asksHow || asksWhen || asksPersonProfile || facetCount >= 2) questionShape = '需要脈絡的單一議題';
  else if (isYesNo) questionShape = '單一可裁決命題';

  return {
    q:q, compact:compact, parts:parts, empty:!q,
    isChoice:isChoice, choiceA:choiceA, choiceB:choiceB,
    moreThanTwoOptions:moreThanTwoOptions, incompleteChoice:incompleteChoice,
    asksWhen:asksWhen, asksExactDate:asksExactDate, hasFixedHorizon:hasFixedHorizon,
    asksWhy:asksWhy, asksHow:asksHow, isYesNo:isYesNo, partYesNoCount:partYesNoCount,
    isInner:asksInner, isHiddenClaim:isHiddenClaim,
    asksExactAge:asksExactAge, asksExactIdentity:asksExactIdentity,
    asksExactAmount:asksExactAmount, asksProbability:asksProbability,
    asksPersonProfile:asksPersonProfile, profileTraitCount:profileTraitCount,
    isConditionalProfileBundle:isConditionalProfileBundle,
    isOverview:explicitMultiAspect, isGlobal:isGlobal, multiPart:multiPart,
    independentMulti:independentMulti, linkedDiagnosticBundle:linkedDiagnosticBundle,
    linkedTimingBundle:linkedTimingBundle, clausesLinked:clausesLinked,
    asksThreshold:asksThreshold,
    medicalDiagnosis:medicalDiagnosis, fatalityQuestion:fatalityQuestion,
    criminalFact:criminalFact, directLegalLiability:directLegalLiability,
    facetCount:facetCount, questionShape:questionShape,
    isSensitiveHidden:asksInner || isHiddenClaim
  };
}
function _lnPersonRepId(declaredGender) {
  if (declaredGender === 'male') return 28;
  if (declaredGender === 'female') return 29;
  if (_lnSignif === 28 || _lnSignif === 29) return _lnSignif;
  return null;
}

function _lnCustomFocusId() {
  return (_lnSignif && _lnSignif !== 28 && _lnSignif !== 29) ? _lnSignif : null;
}

function _lnGrandCoord(index) {
  if (index < 0) return null;
  if (index < 32) return { zone:'main', row:Math.floor(index / 8) + 1, col:(index % 8) + 1, label:'R' + (Math.floor(index / 8) + 1) + 'C' + ((index % 8) + 1) };
  if (index < 36) return { zone:'tail', row:5, col:index - 31, label:'末排' + (index - 31) };
  return null;
}

function _lnFindCardIndex(drawn, cardId) {
  for (var i = 0; i < drawn.length; i++) if (drawn[i].id === cardId) return i;
  return -1;
}

function _lnGrandImmediateNeighbors(drawn, index) {
  var out = [];
  if (index < 0 || index >= drawn.length) return out;
  if (index >= 32) {
    if (index > 32) out.push({dir:'左', index:index - 1, card:drawn[index - 1]});
    if (index < 35) out.push({dir:'右', index:index + 1, card:drawn[index + 1]});
    return out;
  }
  var r = Math.floor(index / 8), c = index % 8;
  var dirs = [
    [-1,-1,'左上'],[-1,0,'上'],[-1,1,'右上'],
    [0,-1,'左'],[0,1,'右'],
    [1,-1,'左下'],[1,0,'下'],[1,1,'右下']
  ];
  dirs.forEach(function(d){
    var rr=r+d[0], cc=c+d[1];
    if (rr>=0 && rr<4 && cc>=0 && cc<8) {
      var idx=rr*8+cc;
      out.push({dir:d[2], index:idx, card:drawn[idx]});
    }
  });
  return out;
}

function _lnGrandNeighborText(drawn, index) {
  var ns = _lnGrandImmediateNeighbors(drawn, index);
  if (!ns.length) return '無';
  return ns.map(function(n){ return n.dir + '＝' + (n.index + 1) + '.' + n.card.name; }).join('；');
}


// v10：36張主盤的完整合法直線清單。只產生水平、垂直與兩組斜線；末排另作獨立水平線。
function _lnGrandStraightLines() {
  var out = [], r, c, indices;
  for (r = 0; r < 4; r++) {
    indices = [];
    for (c = 0; c < 8; c++) indices.push(r * 8 + c);
    out.push({ label:'水平R' + (r + 1), indices:indices });
  }
  for (c = 0; c < 8; c++) {
    indices = [];
    for (r = 0; r < 4; r++) indices.push(r * 8 + c);
    out.push({ label:'垂直C' + (c + 1), indices:indices });
  }
  // 左上→右下：由頂列與左列作起點，長度至少2。
  for (c = 0; c < 8; c++) {
    indices = [];
    for (r = 0; r < 4 && c + r < 8; r++) indices.push(r * 8 + (c + r));
    if (indices.length >= 2) out.push({ label:'斜↘起R1C' + (c + 1), indices:indices });
  }
  for (r = 1; r < 4; r++) {
    indices = [];
    for (c = 0; r + c < 4 && c < 8; c++) indices.push((r + c) * 8 + c);
    if (indices.length >= 2) out.push({ label:'斜↘起R' + (r + 1) + 'C1', indices:indices });
  }
  // 右上→左下：由頂列與右列作起點，長度至少2。
  for (c = 0; c < 8; c++) {
    indices = [];
    for (r = 0; r < 4 && c - r >= 0; r++) indices.push(r * 8 + (c - r));
    if (indices.length >= 2) out.push({ label:'斜↙起R1C' + (c + 1), indices:indices });
  }
  for (r = 1; r < 4; r++) {
    indices = [];
    for (c = 7; r + (7 - c) < 4 && c >= 0; c--) indices.push((r + (7 - c)) * 8 + c);
    if (indices.length >= 2) out.push({ label:'斜↙起R' + (r + 1) + 'C8', indices:indices });
  }
  return out;
}

function _lnGrandLineText(drawn, line) {
  return line.indices.map(function(idx){ return (idx + 1) + '.' + drawn[idx].name; }).join('→');
}

function _lnContiguousSegmentCount(indices) {
  var n = (indices || []).length;
  return n > 1 ? (n * (n - 1)) / 2 : 0;
}

function _lnGrandMainSegmentCount() {
  return _lnGrandStraightLines().reduce(function(total, line){
    return total + _lnContiguousSegmentCount(line.indices);
  }, 0);
}

function _lnGrandLinesThroughText(drawn, index) {
  if (index < 0 || index >= 32) return '不在主盤，無主盤穿越線';
  var hits = _lnGrandStraightLines().filter(function(line){ return line.indices.indexOf(index) >= 0; });
  return hits.map(function(line){ return line.label + '＝' + _lnGrandLineText(drawn, line); }).join('；');
}

function _lnValidateQuestion(q) {
  var x = _lnAnalyzeQuestion(q);
  if (x.empty) return { ok:false, code:'EMPTY', reason:'請先輸入一個明確問題。' };
  // 只攔截占卜不能替代的高風險事實判定；其餘複合、精確或非典型問句交由AI分層理解。
  if (x.fatalityQuestion) return {
    ok:false, code:'FATALITY',
    reason:'小雷諾曼不能可靠判定死亡時間、壽命或死期。請改問目前可觀察的健康風險與可採取的照護行動。'
  };
  if (x.medicalDiagnosis) return {
    ok:false, code:'DIAGNOSIS',
    reason:'這是需要檢驗或專業評估的醫療診斷／懷孕確認，不能用牌面代替。可改問目前有哪些可觀察狀況與應優先採取的照護行動。'
  };
  if (x.criminalFact || x.directLegalLiability) return {
    ok:false, code:'ALLEGATION',
    reason:'牌面不能認定他人犯罪、違法或法律責任。可改問這段互動有哪些可觀察風險、應保留哪些證據或尋求何種專業協助。'
  };
  return { ok:true, x:x };
}

// 自動選陣依問句幾何與所需敘事容量選擇牌陣；題材關鍵字不直接決定牌義。
function _lnRecommendSpread(x) {
  if (x.moreThanTwoOptions) return { id:'nine', why:'問題包含三個以上方案，九宮格可把各方案放進同一比較語義網；若涉及多個生活領域則可改用大牌陣' };
  if (x.independentMulti) return { id:'grand', why:'問題包含多個可獨立回答的主題，大牌陣能保留各主題及其交互作用' };
  if (x.isChoice) return { id:'choice', why:'問題包含兩個可替代方案，需要分成A／B兩條獨立支線比較' };
  if (x.isGlobal) return { id:'grand', why:'問題同時涵蓋多個獨立生活領域或要求全景，需使用36張大牌陣' };
  if (x.isOverview || x.isConditionalProfileBundle || x.profileTraitCount >= 2 || x.facetCount >= 3)
    return { id:'nine', why:'同一議題明確要求三個以上面向，需要九宮格以多條合法交會線回答' };
  if (x.asksWhy || x.asksHow || x.asksWhen || x.asksPersonProfile || x.facetCount >= 2)
    return { id:'five', why:'同一事件需要原因、方法、時間、人物輪廓或階段脈絡，五張線較完整' };
  if (x.isYesNo)
    return { id:'three', why:'這是單一可裁決命題，三張線足以給出結論、條件與主要風險' };
  return { id:'five', why:'這是單一開放題，五張線能保留必要脈絡而不過度展開' };
}

function _lnCheckSpreadFit(q, spreadId) {
  var v = _lnValidateQuestion(q);
  if (!v.ok) return v;
  var x = v.x;
  var rec = _lnRecommendSpread(x);
  // 手動選陣尊重使用者選擇。牌陣只改變解析度與可用幾何，不預先否決問句；
  // AI會依實際牌面回答能支持的全部內容，並坦白指出超出該牌陣解析度的部分。
  return {
    ok:true,
    x:x,
    recommended:rec,
    resolutionNote: spreadId === rec.id ? '' : ('你選擇' + SPREADS[spreadId].name + '；系統原先較建議' + SPREADS[rec.id].name + '，本次仍依你選的牌陣完整解讀。')
  };
}

function _lnDetectSpread(q) {
  q = String(q || '').trim();
  var v = _lnValidateQuestion(q);
  if (!v.ok) return { id:null, why:v.reason, code:v.code };
  var x = v.x;

  // 明確指定牌陣時尊重使用者選擇；自動模式才依問句結構提供建議。
  var explicitId = null, explicitWhy = '';
  if (/(?:請用|使用|選擇).*(?:大牌陣|Grand\s*Tableau|36\s*張)|(?:大牌陣|Grand\s*Tableau).*(?:牌陣|解讀)/i.test(q)) { explicitId='grand'; explicitWhy='你明確指定大牌陣'; }
  else if (/(?:請用|使用|選擇).*(?:九宮格|9\s*宮|3\s*[xX×]\s*3)|(?:九宮格|9\s*宮).*(?:牌陣|解讀)/i.test(q)) { explicitId='nine'; explicitWhy='你明確指定九宮格'; }
  else if (/(?:請用|使用|選擇).*(?:雙路比較|七張比較|A\/B)|(?:雙路比較).*(?:牌陣|解讀)/i.test(q)) { explicitId='choice'; explicitWhy='你明確指定雙路比較'; }
  else if (/(?:請用|使用|選擇).*(?:五張線|五張牌陣)|(?:五張線).*(?:牌陣|解讀)/.test(q)) { explicitId='five'; explicitWhy='你明確指定五張線'; }
  else if (/(?:請用|使用|選擇).*(?:三張線|三張牌陣)|(?:三張線).*(?:牌陣|解讀)/.test(q)) { explicitId='three'; explicitWhy='你明確指定三張線'; }
  if (explicitId) {
    var explicitFit = _lnCheckSpreadFit(q, explicitId);
    return explicitFit.ok ? {id:explicitId, why:explicitWhy} : {id:null, why:explicitFit.reason, code:explicitFit.code};
  }

  return _lnRecommendSpread(x);
}

function _lnPushReaderKernel(lines) {
  lines.push('<自適應牌句推理核心>');
  lines.push('你的任務是讓牌面回答原問句，而不是讓原問句配合預先寫好的牌義。問題提供語境，牌義提供語義素材，牌陣提供可連接的路徑；最後答案由三者共同形成。');
  lines.push('第一階段｜問題保真：先在內部用自然語言重述使用者真正想知道什麼，保留所有實質層次、限定與口語含義。辨認主體、對象或場域、核心關係／事件／狀態、成立到什麼程度才算回答，以及使用者需要裁決、理解、比較、預測還是方向。對「正緣、成功、適合、值得、幸福」等口語或命理概念，依上下文理解其日常判準；若概念同時包含數個層次，就分層追蹤，不建立固定對照表。不要把複雜問題縮成容易回答的版本，也不要套題型字典。');
  lines.push('第二階段｜角色框架：在看牌句前，先建立問句中的人物、事物、關係、行動、條件與結果之間的語義關係。牌面可以用單張牌、一組相鄰牌或整條路徑承載其中任何角色；不要強迫一個概念只能對應一張牌，也不要因為某張牌看起來方便就事後指定人物身分。');
  lines.push('第三階段｜局部多假設：對每個合法相鄰對，不要停在第一個想到的解釋。先在內部產生數個符合牌義範圍的自然句法假設，辨認哪張牌是本句語義核心，另一張是在描述、推動、改變、限制、具體化或收束它。再用原問句、牌序、較長路徑與其他交會線淘汰不一致的解釋。');
  lines.push('第四階段｜遞迴折疊：沿每條合法路徑由兩張向三張、四張直到完整線推進。每加入一張牌，都重新閱讀前面的句子，判斷新牌如何延續、放大、緩和、轉向、延遲、侵蝕、切斷、揭露、落實或改變落點。中間牌是語法橋樑與作用機制；完整線可以推翻或改寫短片段的初步意思。');
  lines.push('第五階段｜全盤一致性選擇：每條路徑完成後，將仍合理的候選牌句放入同一個內部語義場，比較它們與原問句、其他路徑及整體牌面是否相容。對每個核心解讀主動做一次反證壓力測試：尋找能削弱、改寫或限定它的合法牌句，確認它是否仍成立。優先保留能同時解釋更多實際牌句、需要更少盤外假設、且具體程度與證據一致的解讀。若兩種解讀都被全盤支持，將它們呈現為不同條件、階段或可能分支，而不是任意選一個。');
  lines.push('第六階段｜命題圖整合：把保留下來的牌句整理成可回溯的命題，標記它回答原問句的哪一層、支持強度、作用條件、可觀察表現與證據路徑。再把命題依同義、支持、限制、原因、結果、轉折、先後或矛盾連成語義圖。共享實際牌的線可以說明交會機制；沒有共享牌的線可以獨立佐證同一主題，但不能被拼成不存在的轉彎句。');
  lines.push('第七階段｜整體裁決：先形成直接回答原問句的核心命題，再完整吸收其他命題提供的形成原因、互動方式、助力、阻礙、轉折、公開程度、穩定度與收束。支持與阻礙不是好壞牌投票；要判斷它們作用在哪個人物、條件、階段與結果層，並據此校準「可能、偏向、正在推進、已落實、穩定、停擺或結束」的強度。');
  lines.push('第八階段｜生活轉譯與建議：把牌面機制翻成使用者能觀察與採取行動的白話。建議必須直接來自已成立的牌句，例如應確認的資訊、可觀察的行為、需要調整的互動、可利用的助力或應避開的風險；不要只給空泛安慰，也不要把占卜寫成不可改變的命運。');
  lines.push('第九階段｜語義飽和：輸出前重新巡覽本牌陣全部合法最大路徑及其連續片段。只要還有牌句能增加新的答案層、原因、方式、條件、矛盾、風險、結果或實際方向，就繼續整合；當剩餘內容只會重複既有命題或確實與原問句無關，才開始作答。');
  lines.push('</自適應牌句推理核心>');
  lines.push('');
  lines.push('<牌句品質準則>');
  lines.push('單張牌只是語義素材；相鄰牌形成最小可用短語；三張以上顯示作用過程；完整線形成主命題。先按路徑方向造句，再反向檢查後牌如何重新限定前段，但反向檢查不另製造一條新路徑。');
  lines.push('具體程度必須等於證據辨識力：可以指出作用類型、關係模式與可觀察跡象，不補姓名、精確數值、未揭露事實或唯一生活劇本。牌面若只支持傾向，就不能寫成必然；若形成明確落實或終止，也不應無理由降格。');
  lines.push('完整解讀不是逐張念牌，也不是篇幅越長越好；它是所有能改變答案的獨立命題都被保留，同義內容被整合，矛盾被分層說清楚。輸出深度由有效命題群決定，小牌陣也可有多層，大牌陣則應充分展現跨線反覆形成的主題。');
  lines.push('</牌句品質準則>');
  lines.push('');
  lines.push('<必要邊界>');
  lines.push('不用逆位、塔羅元素、宮廷人格投射、單張長篇自由聯想或牌號數字占算。沒有圖像方向資料時，不使用人物面向、雲的明暗側或鐮刀刀刃方向。');
  lines.push('人物牌只有在身分能由本次資料可靠對應時才代表特定人物；未實際抽出的牌不能進入牌句。對健康、犯罪、法律責任、他人未公開內心與可識別個資，只描述牌面傾向、可觀察風險與資訊邊界，不寫成已查證事實或替代專業判定。');
  lines.push('三張線、五張線、雙路比較與九宮格是本系統採用的現代實務工具；大牌陣依本系統提供的4×8＋4幾何閱讀，不宣稱任何流程是唯一古法。');
  lines.push('</必要邊界>');
  lines.push('');
}

function _lnPushSpreadModule(lines, spreadId, drawn, personRepId, customFocusId) {
  if (spreadId === 'three') {
    lines.push('<牌陣模組 name="三張線">');
    lines.push('把1→2→3視為一個聚焦命題。先讓1-2與2-3各自產生數個合理短語，再由第2張的橋接作用把兩段折疊成完整三張句；完整句負責裁決，兩個相鄰短語補充不同的原因、條件、方式、轉折或落點。三個合法片段都要進入內部比較，沒有固定過去／現在／未來牌位。');
    lines.push('</牌陣模組>');
  } else if (spreadId === 'five') {
    lines.push('<牌陣模組 name="五張線">');
    lines.push('把1→2→3→4→5視為單一事件的完整發展句。由四個相鄰對開始，依序折疊三張窗、四張窗與完整五張線；每個較長片段都要重新定義較短片段。第3張只是幾何中心，不預設為現在、原因或結果。最後由完整線建立事件主軸，較短片段則保留形成機制、局部轉折、助阻與收束細節。');
    lines.push('</牌陣模組>');
  } else if (spreadId === 'choice') {
    lines.push('<牌陣模組 name="雙路比較">');
    lines.push('先依原問句辨認兩個比較選項與使用者真正重視的共同標準。A路1→2→3與B路5→6→7分別完整讀取相鄰對與三張句，各自形成一個可獨立成立的故事；第4張作為兩路共同情境、門檻或校正鏡頭，分別改寫兩路的可行性、代價、穩定度與落點，但不與支線單張製造假相鄰。最後以同一標準比較，不因偏好某一路而改變判準。若問句未明示兩個選項，則依問題最自然的兩種可行路徑解讀，並在答案開頭說明本次比較的是哪兩路。');
    lines.push('</牌陣模組>');
  } else if (spreadId === 'nine') {
    lines.push('<牌陣模組 name="九宮格">');
    lines.push('將九張牌讀成同一議題的交會網。八條最大路徑（三橫、三直、兩斜）各自先由相鄰對折疊成完整三張命題，再透過共享中心、角牌或邊牌互相改寫。第5格是連線度最高的語義樞紐，但不預設為固定時間、心理或結果；它的功能由八條線如何共同作用於它決定。全部16個相鄰對與8條完整線都要進入候選牌句比較，最後整合成同一議題的核心、不同面向、交叉助阻與收束。');
    if (drawn[4] && drawn[4]._presetSig) lines.push('中心牌是抽牌前置入的閱讀焦點；置中本身不是隨機徵兆，但它與周圍牌形成的實際牌句仍照常解讀。');
    lines.push('</牌陣模組>');
  } else if (spreadId === 'grand') {
    lines.push('<牌陣模組 name="36張大牌陣">');
    lines.push('版式為4排×8張主盤，加上獨立的末排4張。下方30條水平、垂直與斜向直線是主盤全部合法最大路徑；每條路徑的所有連續片段都要進入候選牌句比較。末排33→34→35→36另成獨立語義場，不與主盤建立假想垂直或斜向鄰接。');
    lines.push('大牌陣採四輪內部閱讀。第一輪「逐線深讀」：每條最大路徑先形成整體句，再讀其相鄰對與所有必要長度視窗，找出會改變整體句的機制與轉折。第二輪「角色與議題投影」：把原問句中的主體、對象、關係、事件、條件與結果投影到已形成的牌句，不預設每個概念只能由某一張牌承載。第三輪「跨線一致性競爭」：對同一問題可能存在的不同解讀，利用本人場、事件場、共享牌與獨立佐證線比較哪一種最能解釋全盤；保留真正成立的條件分支。第四輪「全盤命題圖」：整合反覆出現的形成原因、人物或環境作用、互動方式、助力、侵蝕、延遲、轉折、公開程度、穩定度、可見結果與末排收束。');
    lines.push('本人牌的立即鄰域與所有穿越線是理解問卜者處境的重要入口，但不是閱讀邊界。任何其他直線只要能為原問句增加新的有效命題，都必須納入；全36張必然出現，所以證據來自位置、鄰接、路徑、交會與跨線重複主題，而不是某張牌單純出現。距離只表示關聯直接或間接，不直接換算時間。');
    if (customFocusId) lines.push('使用者預選焦點為' + customFocusId + '.' + ((CARDS[customFocusId-1] || {}).name || '') + '；它只增加一個閱讀入口，不取代原問句自然形成的其他角色與語義場，也不代替本人牌。');
    lines.push('</牌陣模組>');
  }
  lines.push('');
}

function _lnPushCardData(lines, drawn, sp) {
  lines.push('<牌面資料>');
  for (var i = 0; i < drawn.length; i++) {
    var c = drawn[i];
    var label = sp.positions ? sp.positions[i] : ('第' + (i + 1) + '格');
    lines.push((i + 1) + '. ' + label + '：' + c.id + '.' + c.name + '（' + c.en + '）' + (c._presetSig ? '〔抽牌前置入焦點〕' : ''));
    lines.push('   核心語彙：' + c.key);
    lines.push('   語義範圍：' + c.scope);
    lines.push('   語義校準：' + c.guard);
  }
  lines.push('</牌面資料>');
  lines.push('');
}

function _lnPushGeometryData(lines, spreadId, drawn, personRepId, customFocusId) {
  lines.push('<合法幾何>');
  if (spreadId === 'three') {
    lines.push('最大路徑：1.' + drawn[0].name + '→2.' + drawn[1].name + '→3.' + drawn[2].name);
    lines.push('全部連續片段：1-2、2-3、1-2-3。');
  } else if (spreadId === 'five') {
    lines.push('最大路徑：1.' + drawn[0].name + '→2.' + drawn[1].name + '→3.' + drawn[2].name + '→4.' + drawn[3].name + '→5.' + drawn[4].name);
    lines.push('全部連續片段：1-2、2-3、3-4、4-5；1-2-3、2-3-4、3-4-5；1-2-3-4、2-3-4-5；1-2-3-4-5。');
  } else if (spreadId === 'choice') {
    lines.push('A路最大路徑：1.' + drawn[0].name + '→2.' + drawn[1].name + '→3.' + drawn[2].name);
    lines.push('共同情境牌：4.' + drawn[3].name);
    lines.push('B路最大路徑：5.' + drawn[4].name + '→6.' + drawn[5].name + '→7.' + drawn[6].name);
    lines.push('支線連續片段：A＝1-2、2-3、1-2-3；B＝5-6、6-7、5-6-7。');
  } else if (spreadId === 'nine') {
    lines.push('九宮格：');
    lines.push('[' + drawn[0].name + '] [' + drawn[1].name + '] [' + drawn[2].name + ']');
    lines.push('[' + drawn[3].name + '] [' + drawn[4].name + '] [' + drawn[5].name + ']');
    lines.push('[' + drawn[6].name + '] [' + drawn[7].name + '] [' + drawn[8].name + ']');
    lines.push('合法相鄰對：1-2、2-3、4-5、5-6、7-8、8-9、1-4、4-7、2-5、5-8、3-6、6-9、1-5、5-9、3-5、5-7。');
    lines.push('合法最大路徑：1-2-3、4-5-6、7-8-9、1-4-7、2-5-8、3-6-9、1-5-9、3-5-7。');
  } else if (spreadId === 'grand') {
    var row = function(a,b){ var out=[]; for (var k=a;k<=b;k++) out.push('['+(k+1)+']'+drawn[k].name); return out.join('  '); };
    lines.push('主盤R1（格1-8）：' + row(0,7));
    lines.push('主盤R2（格9-16）：' + row(8,15));
    lines.push('主盤R3（格17-24）：' + row(16,23));
    lines.push('主盤R4（格25-32）：' + row(24,31));
    lines.push('末排獨立線（格33-36）：' + row(32,35));
    lines.push('全牌座標：' + drawn.map(function(card, idx){ return card.name + '＝' + _lnGrandCoord(idx).label; }).join('；'));
    lines.push('主盤30條合法最大路徑：');
    _lnGrandStraightLines().forEach(function(line){ lines.push(line.label + '：' + _lnGrandLineText(drawn, line)); });
    lines.push('末排最大路徑：33.' + drawn[32].name + '→34.' + drawn[33].name + '→35.' + drawn[34].name + '→36.' + drawn[35].name + '；全部連續片段＝33-34、34-35、35-36、33-34-35、34-35-36、33-34-35-36。');
    if (personRepId) {
      var si = _lnFindCardIndex(drawn, personRepId);
      if (si >= 0) {
        lines.push('本人牌入口：' + drawn[si].name + '在' + _lnGrandCoord(si).label + '（全盤第' + (si + 1) + '格）。');
        lines.push('本人牌立即鄰域：' + _lnGrandNeighborText(drawn, si) + '。');
        lines.push('本人牌穿越路徑：' + _lnGrandLinesThroughText(drawn, si) + '。');
      }
    }
    if (customFocusId) {
      var fi = _lnFindCardIndex(drawn, customFocusId);
      if (fi >= 0) {
        lines.push('額外焦點入口：' + drawn[fi].name + '在' + _lnGrandCoord(fi).label + '（全盤第' + (fi + 1) + '格）。');
        lines.push('焦點牌立即鄰域：' + _lnGrandNeighborText(drawn, fi) + '。');
        lines.push('焦點牌穿越路徑：' + _lnGrandLinesThroughText(drawn, fi) + '。');
      }
    }
  }
  lines.push('</合法幾何>');
  lines.push('');
}

function _lnPushOutputContract(lines, legalNames) {
  lines.push('<最終輸出契約>');
  lines.push('只輸出最後解讀，不展示問題模型、候選假設、命題帳本、路徑掃描、角色綁定或其他內部推理。全程使用繁體中文與台灣用語，像一位有經驗、誠實而不宿命的讀牌者當面說明。');
  lines.push('第一段第一句直接回答原問句。是非題使用「有／沒有／偏有／偏沒有／目前無法定論」；涉及他人未公開內心時使用牌面傾向。若原問句同時含數個實質層次，逐層回答，不把能判斷與不能判斷的部分混成一句模糊結論。');
  lines.push('接著依語義圖自然展開所有不重複的有效命題。說明牌面實際形成的核心走向、原因、互動機制、助力、阻礙、轉折、可觀察表現、穩定度與收束；沒有形成的層次不硬套。篇幅由有效命題群決定，不因牌陣小而敷衍，也不因牌陣大而堆砌重複內容。');
  lines.push('在主要解讀後加入一個自然的「可採取方向」收束，提出1至3項由牌面機制直接推導、可在現實中觀察或執行的建議。建議要具體指出可確認的資訊、可觀察的行為、需要調整的互動或應利用／避開的條件；不要把建議寫成保證，也不要用空泛勵志句代替分析。');
  lines.push('每個重要斷語在句尾標示「〔牌面：A＋B＋C〕」，所列牌必須屬於同一條實際連續路徑。若一項結論由多條相交或獨立路徑共同支持，分別列出多組牌面，不合成假路徑。');
  lines.push('牌面能回答到哪裡就說到哪裡。精確日期、年齡、金額、百分比、姓名、未公開內心或唯一身分若沒有可靠牌句支撐，應把可判斷的核心與仍需現實資料確認的部分分開說明，而不是放棄整題或捏造精確答案。');
  lines.push('占卜正文只能引用本盤實際牌名：' + legalNames.join('、') + '。');
  lines.push('</最終輸出契約>');
  lines.push('');
}

function _lnPushBrandModule(lines) {
  lines.push('<品牌附加層>');
  lines.push('等占卜正文完全完成後才執行本段；本段不得反向影響牌義判斷。另起一段，第一行原樣寫：「以下為免費服務的品牌資訊，與本次牌義結論分開：」');
  lines.push('只介紹一種礦物。依原問句的真實生活情境、自然配戴場合，以及色系、透明度、光澤或材質感選品；可在視覺風格上呼應正文的一個生活主題，但不要把礦物說成牌面指定或問題解法。');
  lines.push('情境選品：工作／生意／金錢可選黃水晶、虎眼石、綠幽靈；關係／社交可選粉晶、草莓晶、月光石；決策／轉換／移動可選茶晶、拉長石、黑曜石；溝通／學習／書面往來可選海藍寶、藍紋瑪瑙、紫水晶；沒有清楚關聯時選白水晶。');
  lines.push('推薦段限2至3句：先說明與生活情境、穿搭或視覺質感的關聯，再加入一項下列核准礦物知識，最後自然引導前往靜月之光蝦皮。不得宣稱治療、保護、穩定情緒、提升能力、保證招財／桃花／改運或提高預測成真率。');
  lines.push('可用事實：白水晶／紫水晶／黃水晶／茶晶／粉晶皆屬石英家族，主要成分為二氧化矽、三方晶系、硬度7；紫水晶含鐵並受天然輻照致色，黃水晶由鐵致色，茶晶含鋁並受天然輻射呈煙色，粉晶多呈霧狀半透明、全透明極少。');
  lines.push('草莓晶為石英內含纖鐵礦或赤鐵礦片狀包體。紅瑪瑙／藍紋瑪瑙／紅碧玉屬隱晶質石英；瑪瑙看天然色帶層次，紅碧玉通常不透明並由鐵氧化物致色。');
  lines.push('月光石由正長石與鈉長石交層形成暈彩。拉長石屬斜長石、三斜晶系，挑選可看變彩面積。太陽石內含赤鐵礦或銅片而出現砂金閃光。');
  lines.push('海藍寶屬綠柱石族、六方晶系，由鐵致色。黑曜石是火山玻璃、非晶質，常見貝殼狀斷口。黑碧璽屬電氣石族、三方晶系，柱面常見縱紋。');
  lines.push('紫龍晶為紫色纖維狀、具絲絹光澤，產於俄羅斯查拉河流域。虎眼石是石英交代石棉假象，呈絲絹貓眼光。綠幽靈是白水晶內含綠泥石包體。葡萄石為斜方晶系，常呈葡萄狀集合體。');
  lines.push('天鐵是鎳鐵隕石，屬鐵鎳金屬、等軸晶系；表面常見氣印，切磨酸蝕後可見魏德曼花紋。它是金屬，不是含氣泡的天然玻璃。');
  lines.push('龍宮舍利是市場名稱，成因與成分說法不一；只能描述珠體圓整、皮殼天然完整、結構緻密等外觀挑選標準，不宣稱地質成因。');
  lines.push('</品牌附加層>');
  lines.push('');
}

function buildPrompt(question, drawn, spreadId, sigGender, declaredGender) {
  var sp = SPREADS[spreadId];
  var lines = [];
  var legalNames = drawn.map(function(c){ return c.name; });
  var personRepId = _lnPersonRepId(declaredGender);
  var customFocusId = _lnCustomFocusId();
  var personRep = personRepId === 28 ? '紳士(28)' : personRepId === 29 ? '淑女(29)' : '未指定';

  lines.push('你是 Petit Lenormand（小雷諾曼）讀牌者。請用下方自適應語義推理方法，保留原問句全部含義，讓本牌陣每一條合法牌句在全盤中互相校正，直到形成能回溯、深入且對使用者有實際幫助的答案。不要套事件關鍵字表，不要把單張牌義當成完整事件，也不要把解讀寫成規則報告。先在內部完成全部推理，只輸出最後解讀。');
  lines.push('');
  lines.push('<本次任務>');
  lines.push('問題：' + String(question || '').trim());
  lines.push('占卜日期：' + _lnLocalISODate());
  lines.push('牌陣：' + sp.name + '（' + sp.count + '張）');
  lines.push('人物歸屬：問卜者本人代表為' + personRep + '。這只建立角色資料；該牌實際出現在本盤時才能進入牌句。其他人物由原問句與牌面關係自行判斷，只有身分可可靠對應時才綁定。');
  if (_lnSignif && spreadId !== 'nine' && spreadId !== 'grand') {
    lines.push('使用者選擇的指示牌' + _lnSignif + '.' + ((CARDS[_lnSignif-1] || {}).name || '') + '未被置入本牌陣，因此不參與本次牌句。');
  }
  lines.push('</本次任務>');
  lines.push('');

  _lnPushReaderKernel(lines);
  _lnPushSpreadModule(lines, spreadId, drawn, personRepId, customFocusId);
  _lnPushCardData(lines, drawn, sp);
  _lnPushGeometryData(lines, spreadId, drawn, personRepId, customFocusId);
  _lnPushOutputContract(lines, legalNames);
  _lnPushBrandModule(lines);

  lines.push('【開始解讀】');
  lines.push('根據以上原問句、牌義資料與合法幾何，現在使用自適應語義推理核心完成解讀。完整回答牌面顯示的所有不同答案方向，並以具體可行的觀察與建議收束。先完成占卜正文，再無條件輸出獨立品牌附加層。最後兩行必須原樣照抄，不能加字、合併或省略，最後一行後不得再有內容：');
  lines.push('[靜月之光蝦皮賣場](https://shopee.tw/a50h95648d?tab=shop)');
  lines.push('願你諸事順遂。');

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
      '.ln-five-layout{display:grid;grid-template-columns:repeat(6,38px);grid-auto-rows:auto;row-gap:.58rem;justify-content:center;align-items:start;width:228px;max-width:100%;margin:.7rem auto .85rem}',
      '.ln-five-layout .ln-card{justify-self:center;margin:0}',
      '.ln-five-layout .ln-card:nth-child(1){grid-column:1/3;grid-row:1}',
      '.ln-five-layout .ln-card:nth-child(2){grid-column:3/5;grid-row:1}',
      '.ln-five-layout .ln-card:nth-child(3){grid-column:5/7;grid-row:1}',
      '.ln-five-layout .ln-card:nth-child(4){grid-column:2/4;grid-row:2}',
      '.ln-five-layout .ln-card:nth-child(5){grid-column:4/6;grid-row:2}',
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
      '.ln-ai-sc{display:flex;flex-direction:column;align-items:center;gap:.2rem;padding:.35rem .1rem;border-radius:10px;border:1px solid rgba(255,255,255,.06);background:rgba(255,255,255,.02);cursor:pointer;transition:all .2s;font-family:inherit;text-decoration:none;-webkit-tap-highlight-color:transparent}',
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
  {id:'gemini',name:'Gemini',url:'https://gemini.google.com/app?hl=zh-TW'},
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
    var sps = [{id:'auto',n:'✦ 自動判斷',d:'依問句幾何選最小充分牌陣（推薦）'},{id:'three',n:'三張線',d:'單一聚焦命題'},{id:'five',n:'五張線',d:'單一議題脈絡'},{id:'choice',n:'雙路比較',d:'兩個可替代方案'},{id:'nine',n:'九宮格',d:'同一議題多面向'},{id:'grand',n:'大牌陣',d:'多領域全景／手動深讀'}];
    for (var i=0;i<sps.length;i++) {
      h += '<button class="ln-spread-btn' + (sps[i].id===_lnSpread?' active':'') + (sps[i].id==='auto'?' ln-spread-auto':'') + '" onclick="_lnSetSpread(\''+sps[i].id+'\')">' + sps[i].n + '<br><span style="font-size:.6rem;opacity:.6">' + sps[i].d + '</span></button>';
    }
    h += '</div></div>';
    // v3.0：指示牌（Significator）
    h += '<div class="ln-section"><div class="ln-section-title">✦ 定位牌（可選）</div>';
    h += '<div style="display:flex;flex-wrap:wrap;gap:.45rem">';
    h += '<button class="ln-spread-btn' + (_lnSignif===null?' active':'') + '" onclick="_lnSetSig(null)">不使用</button>';
    h += '<button class="ln-spread-btn' + (_lnSignif===28?' active':'') + '" onclick="_lnSetSig(28)">男士(28)</button>';
    h += '<button class="ln-spread-btn' + (_lnSignif===29?' active':'') + '" onclick="_lnSetSig(29)">女士(29)</button>';
    var _sigCustom = (_lnSignif!==null && _lnSignif!==28 && _lnSignif!==29);
    h += '<button class="ln-spread-btn' + (_sigCustom?' active':'') + '" onclick="_lnSigPickOpen()">' + (_sigCustom ? ('自選：' + _lnSignif + '.' + (CARDS[_lnSignif-1]||{}).name) : '自選一張') + '</button>';
    h += '</div>';
    h += '<div class="ln-auto-note" style="margin-top:.5rem">男士／女士只用來代表你本人；自選其他牌只作議題定位，不能代替本人牌。九宮格會把定位牌置於中央；大牌陣在36張中定位本人牌與議題牌。三張／五張線不預置。</div></div>';
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
    if (_lnSignif) h += '<div class="ln-auto-note">✦ ' + ((_lnSignif===28||_lnSignif===29)?'本人定位牌':'議題定位牌') + '：' + _lnSignif + '.' + ((CARDS[_lnSignif-1]||{}).name||'') + (_lnResolved==='nine' ? '（已置中央・現代焦點九宮格）' : _lnResolved==='grand' ? '（於36張中定位讀取）' : '（本牌陣不置入）') + '</div>';
    if (_lnResolved === 'nine') {
      h += '<div class="ln-grid-3x3">';
    } else if (_lnResolved === 'choice') {
      h += '<div class="ln-choice-layout" style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;align-items:start">';
    } else if (_lnResolved === 'five') {
      // v3.11：固定 3+2 幾何網格。不可再交給 flex 依螢幕寬度自行換行，否則會出現 4+1 或底排偏斜。
      h += '<div class="ln-five-layout" role="group" aria-label="五張線：上排三張，下排兩張">';
    } else {
      h += '<div class="ln-cards-row">';
    }
    for (var j=0;j<_lnDrawn.length;j++) {
      var c = _lnDrawn[j];
      var imgSrc = IMG_MAP[c.id] || '';
      var _choicePos = ''; if (_lnResolved === 'choice') { if (j === 3) _choicePos='grid-column:2;grid-row:2;'; else if (j >= 4) _choicePos='grid-column:'+(j-3)+';grid-row:3;'; }
      h += '<div class="ln-card" style="'+_choicePos+'animation-delay:'+j*0.05+'s">' + (c._presetSig ? '<div style="font-size:.6rem;color:#e8d28a;letter-spacing:.12em;margin-bottom:2px">★ 指示牌</div>' : '');
      if (imgSrc) h += '<img class="ln-card-img" src="'+imgSrc+'" alt="'+c.name+'">';
      h += '<div class="ln-card-name">' + c.id + '. ' + c.name + '</div>';
      h += '<div class="ln-card-en">' + c.en + '</div></div>';
    }
    h += '</div></div>';

    // AI card
    h += '<div class="ln-ai-card"><div class="ln-ai-title">🌙 AI 深度解讀</div>';
    h += '<div class="ln-ai-desc">點擊 AI 圖示會先複製提示詞，再於新分頁直接開啟該 AI 網頁版。</div>';
    h += '<button class="ln-ai-copy-btn" onclick="_lnCopy()">✦ 一鍵複製占卜提示詞 ✦</button>';
    h += '<div class="ln-ai-grid">';
    for (var a=0;a<AI_LIST.length;a++) {
      var ai = AI_LIST[a];
      // v3.14：Gemini 改回與其它 9 個 AI 一致的 target="_blank"——v3.11/v3.13 兩次的特例（_self、
      // 同頁開啟）都已實機驗證無法解決閃退問題，繼續猜 target 不是根治，先回到唯一沒人回報過問題的寫法。
      h += '<a class="ln-ai-sc" href="'+ai.url+'" target="_blank" rel="external noopener noreferrer" onpointerdown="_lnPrimeAICopy(event,this)" onclick="_lnPrimeAICopy(event,this)" aria-label="複製提示詞並開啟 '+ai.name+' 網頁版">';
      h += '<img src="ai-icons/ai-'+ai.id+'.png" alt="'+ai.name+'">';
      h += '<span>'+ai.name+'</span></a>';
    }
    h += '</div></div>';
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
  if (!_lnQuestion) { alert('請先輸入一個明確問題。時間範圍只有在你需要限定期限時才必填。'); return; }
  // v5.0：自動與手動選陣都走同一套問題驗證與適配檢查。
  _lnAutoPick = null;
  _lnResolved = _lnSpread;
  if (_lnSpread === 'auto') {
    var _det = _lnDetectSpread(_lnQuestion);
    if (!_det.id) { alert(_det.why || '請先輸入明確問題。'); return; }
    _lnResolved = _det.id;
    _lnAutoPick = _det;
  } else {
    var _fit = _lnCheckSpreadFit(_lnQuestion, _lnResolved);
    if (!_fit.ok) { alert(_fit.reason || '這個問題不適合目前選擇的牌陣。'); return; }
  }
  var sp = SPREADS[_lnResolved];
  var _personRepId = _lnPersonRepId(_lnGender);
  if (_lnResolved === 'grand' && !_personRepId) { alert('大牌陣必須先指定本人代表牌為男士(28)或女士(29)；自選其他牌只能作議題定位，不能代替本人牌。'); return; }
  // v4.0：九宮格＋指示牌＝現代焦點九宮格；池先移除指示牌避免重複
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
  _lnSigGender = g || null;
  _render();
};
window._lnSetSig = function (id) {
  _lnSignif = id;
  if (id === null && !_lnGender) _lnSigGender = null;
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

// v3.14：可選診斷——預設完全不啟動，不影響任何正常使用者。網址列加上 ?lndebug=1 才會生效。
// 用途：下次歐那實機重現「點 Gemini 閃一下其他頁面又跳回」時，回到本頁會跳出 alert，
//   標示 (a) pageshow.persisted（true＝瀏覽器真的離開過、靠 bfcache 瞬間還原，屬本頁可診斷範圍）
//   (b) 距離點擊的毫秒數。若 persisted 為 false 或事件根本沒觸發，代表文件其實沒被瀏覽器卸載過，
//   就更指向 Android 對 gemini.google.com 的 App Link/Intent 攔截（非本頁 JS 可控，需在手機
//   設定關閉 Gemini App 的「預設開啟連結」來驗證並繞過）。看到結果後判斷下一步，不在這裡先猜答案。
var _lnDebug = false;
try { _lnDebug = /(^|[?&])lndebug=1(&|$)/.test(location.search || ''); } catch (e) {}
if (_lnDebug) {
  try {
    window.addEventListener('pageshow', function (ev) {
      var lastClick = Number(sessionStorage.getItem('jy_ln_dbg_click') || 0);
      var delta = lastClick ? (Date.now() - lastClick) : null;
      if (delta !== null && delta >= 0 && delta < 20000) {
        alert('[lndebug] 返回本頁\nbfcache 還原(persisted)：' + ev.persisted +
          '\n距上次點 AI 圖示：' + delta + 'ms\ndocument.referrer：' + (document.referrer || '(無)'));
      }
    });
  } catch (e) {}
}

// v3.11：剪貼簿唯一入口。Clipboard API 在安全來源優先；舊瀏覽器才使用同步 textarea 後備。
// 注意：AI 網頁導覽由真實 <a href> 的預設行為負責，這裡絕不 window.open、location.href 或 _render。
function _lnLegacyCopy(text) {
  var ta = null;
  try {
    ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.setAttribute('aria-hidden', 'true');
    ta.style.cssText = 'position:fixed;top:0;left:-9999px;width:1px;height:1px;opacity:0;font-size:16px;pointer-events:none';
    document.body.appendChild(ta);
    try { ta.focus({ preventScroll: true }); } catch (_focusErr) { ta.focus(); }
    ta.select();
    ta.setSelectionRange(0, ta.value.length);
    return !!document.execCommand('copy');
  } catch (e) {
    return false;
  } finally {
    if (ta && ta.parentNode) ta.parentNode.removeChild(ta);
  }
}

function _lnWriteClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      return navigator.clipboard.writeText(text).then(function () { return true; }).catch(function () {
        return _lnLegacyCopy(text);
      });
    } catch (e) {}
  }
  return Promise.resolve(_lnLegacyCopy(text));
}

window._lnCopy = function() {
  if (!_lastPrompt) return false;
  var btn = document.querySelector('.ln-ai-copy-btn');
  var original = btn ? btn.innerHTML : '';
  _lnWriteClipboard(_lastPrompt).then(function(ok){
    if (!btn) return;
    btn.innerHTML = ok ? '✓ 已複製！貼到 AI 送出即可' : '複製失敗，請長按提示詞複製';
    btn.style.borderColor = ok ? 'rgba(52,211,153,.5)' : 'rgba(248,113,113,.65)';
    setTimeout(function(){
      if (!btn.isConnected) return;
      btn.innerHTML = original;
      btn.style.borderColor = '';
    }, 2500);
  });
  return false;
};

window._lnPrimeAICopy = function(ev, link) {
  if (!_lastPrompt || !link) return;

  // v3.14：診斷時間戳，僅 ?lndebug=1 時寫入，供 pageshow 比對「點擊到返回」經過多久。
  if (_lnDebug) { try { sessionStorage.setItem('jy_ln_dbg_click', String(Date.now())); } catch (e) {} }

  // pointerdown 與 click 會連續觸發，短時間只複製一次。
  var now = Date.now();
  var last = Number(link.getAttribute('data-ln-copy-at') || 0);
  if (now - last < 700) return;
  link.setAttribute('data-ln-copy-at', String(now));

  // 僅同步複製。禁止 preventDefault／stopPropagation／return false；
  // 連結導覽完全由真實 <a href> 的瀏覽器預設行為執行。
  var copied = _lnLegacyCopy(_lastPrompt);
  if (!copied && navigator.clipboard && window.isSecureContext) {
    try { navigator.clipboard.writeText(_lastPrompt).catch(function(){}); } catch (e) {}
  }

  var label = link.querySelector('span');
  if (label && copied) {
    var original = link.getAttribute('data-ln-label') || label.textContent;
    link.setAttribute('data-ln-label', original);
    label.textContent = '已複製';
    setTimeout(function(){ if (label.isConnected) label.textContent = original; }, 1800);
  }
};
window._lnReset = function() {
  _lnPhase = 'input';
  _render();
  _getWrap().scrollTop = 0;
};

})();
