// ══════════════════════════════════════════════════════════════════════
// 🃏 塔羅 TOP-TIER UPGRADE
// 牌號數字學 · 多牌陣支持 · 卡巴拉生命之樹 · 元素尊貴交叉
// ══════════════════════════════════════════════════════════════════════
// 載入順序：tarot.js 之後
// enhanceTarot(S.tarot) 在塔羅抽牌後呼叫

// ── 1. 牌號數字學 (Numerology) ──
// 大阿爾克那 0-21 每張的數字意義
// 小阿爾克那 Ace-10 + 宮廷牌的數字意義

var TAROT_NUMEROLOGY = {
  0: {zh:'零/愚者數', meaning:'無限可能、新的循環起點、純粹的潛能'},
  1: {zh:'一/魔術師數', meaning:'開始、意志力、個體化、主動創造'},
  2: {zh:'二/女祭司數', meaning:'二元、平衡、直覺、等待、合作'},
  3: {zh:'三/女皇數', meaning:'創造、豐盛、表達、成長、三位一體'},
  4: {zh:'四/皇帝數', meaning:'穩定、結構、秩序、基礎、務實'},
  5: {zh:'五/教皇數', meaning:'變動、衝突、挑戰、自由、學習'},
  6: {zh:'六/戀人數', meaning:'和諧、責任、選擇、愛、美'},
  7: {zh:'七/戰車數', meaning:'反思、神秘、內在探索、信仰、勝利'},
  8: {zh:'八/力量數', meaning:'力量、掌控、業力、無限、物質'},
  9: {zh:'九/隱者數', meaning:'完成、智慧、獨處、人道、轉化'},
  10: {zh:'十/命運數', meaning:'循環結束、回歸、重新開始、命運'}
};

function tarotNumerologyAnalysis(drawn) {
  if (!drawn || !drawn.length) return null;

  // 統計每個數字出現次數
  var numCounts = {};
  var totalReduction = 0;

  drawn.forEach(function(card) {
    var num;
    if (card.id < 22) {
      // 大阿爾克那
      num = card.id;
    } else {
      // 小阿爾克那
      num = ((card.id - 22) % 14) + 1;
      if (num > 10) num = num - 10; // 宮廷牌映射為11-14→1-4
    }

    // 數字學化約
    var reduced = num;
    while (reduced > 10) reduced = Math.floor(reduced / 10) + (reduced % 10);
    if (!numCounts[reduced]) numCounts[reduced] = 0;
    numCounts[reduced]++;
    totalReduction += reduced;
  });

  // 化約總和
  var finalNum = totalReduction;
  while (finalNum > 22) finalNum = Math.floor(finalNum / 10) + (finalNum % 10);

  // 找重複數字（主題）
  var dominantNums = [];
  Object.keys(numCounts).forEach(function(n) {
    if (numCounts[n] >= 2) {
      var info = TAROT_NUMEROLOGY[parseInt(n)] || {};
      dominantNums.push({
        number: parseInt(n),
        count: numCounts[n],
        meaning: info.meaning || '',
        zh: '數字' + n + '出現' + numCounts[n] + '次：' + (info.meaning || '此數字的能量被強調')
      });
    }
  });

  var finalInfo = TAROT_NUMEROLOGY[finalNum] || {};

  return {
    numCounts: numCounts,
    totalReduction: totalReduction,
    finalNum: finalNum,
    finalMeaning: finalInfo.meaning || '',
    dominantNums: dominantNums,
    zh: '牌陣數字學總和化約為' + finalNum + '：' + (finalInfo.meaning || '')
  };
}


// ── 2. 多牌陣支持 ──

// 三牌陣（過去-現在-未來）
function tarotThreeCardSpread(drawn, type) {
  if (!drawn || drawn.length < 3) return null;

  var positions = [
    {name: '過去', zh: '過去（影響你走到這裡的因素）', card: drawn[0]},
    {name: '現在', zh: '現在（你正在經歷的核心能量）', card: drawn[1]},
    {name: '未來', zh: '未來（如果保持現狀的走向）', card: drawn[2]}
  ];

  // 時間軸元素分析
  var els = positions.map(function(p) { return p.card ? (p.card.el || '') : ''; });
  var allSame = els[0] === els[1] && els[1] === els[2] && els[0] !== '';
  var narrative = '';
  if (allSame) narrative = '三張牌同為' + els[0] + '元素，整個時間軸由同一股能量貫穿';

  return {
    type: 'three_card',
    zh: '三牌陣（過去-現在-未來）',
    positions: positions,
    elementNarrative: narrative
  };
}

// 五牌十字陣
function tarotCrossSpread(drawn, type) {
  if (!drawn || drawn.length < 5) return null;

  return {
    type: 'cross',
    zh: '十字牌陣',
    positions: [
      {name: '現狀', zh: '現在的處境', card: drawn[0]},
      {name: '挑戰', zh: '面臨的挑戰或阻礙', card: drawn[1]},
      {name: '過去', zh: '過去的影響', card: drawn[2]},
      {name: '未來', zh: '未來的發展趨勢', card: drawn[3]},
      {name: '建議', zh: '最佳行動建議', card: drawn[4]}
    ]
  };
}

// 馬蹄形牌陣（7張）
function tarotHorseshoeSpread(drawn, type) {
  if (!drawn || drawn.length < 7) return null;

  return {
    type: 'horseshoe',
    zh: '馬蹄形牌陣',
    positions: [
      {name: '過去', zh: '過去的影響', card: drawn[0]},
      {name: '現在', zh: '目前的處境', card: drawn[1]},
      {name: '隱藏影響', zh: '你可能忽略的因素', card: drawn[2]},
      {name: '環境', zh: '周圍人的影響', card: drawn[3]},
      {name: '態度', zh: '你應採取的態度', card: drawn[4]},
      {name: '行動', zh: '建議的具體行動', card: drawn[5]},
      {name: '結果', zh: '最可能的結果', card: drawn[6]}
    ]
  };
}


// ── 3. 卡巴拉生命之樹對應 ──
// 大阿爾克那與生命之樹 22 條路徑的對應

var TAROT_KABBALAH = {
  0:  {path:'11', sephirot:'Kether→Chokmah',     zh:'王冠→智慧',   letter:'Aleph',  meaning:'神聖的愚者，純粹意識的飛躍'},
  1:  {path:'12', sephirot:'Kether→Binah',        zh:'王冠→理解',   letter:'Beth',   meaning:'創造的意志，將神性轉化為形式'},
  2:  {path:'13', sephirot:'Kether→Tiphereth',    zh:'王冠→美',     letter:'Gimel',  meaning:'跨越深淵的橋樑，直覺的通道'},
  3:  {path:'14', sephirot:'Chokmah→Binah',       zh:'智慧→理解',   letter:'Daleth', meaning:'豐盛之門，創造與接收的結合'},
  4:  {path:'15', sephirot:'Chokmah→Tiphereth',   zh:'智慧→美',     letter:'He',     meaning:'靈性的窗口，內在教導'},
  5:  {path:'16', sephirot:'Chokmah→Chesed',      zh:'智慧→慈悲',   letter:'Vav',    meaning:'靈魂的選擇，上下的連結'},
  6:  {path:'17', sephirot:'Binah→Tiphereth',     zh:'理解→美',     letter:'Zain',   meaning:'對立的結合，關係的考驗'},
  7:  {path:'18', sephirot:'Binah→Geburah',       zh:'理解→力量',   letter:'Cheth',  meaning:'意志的戰車，突破限制'},
  8:  {path:'19', sephirot:'Chesed→Geburah',      zh:'慈悲→力量',   letter:'Teth',   meaning:'愛的力量，馴服內在野獸'},
  9:  {path:'20', sephirot:'Chesed→Tiphereth',    zh:'慈悲→美',     letter:'Yod',    meaning:'孤獨的智者，內在之光'},
  10: {path:'21', sephirot:'Chesed→Netzach',      zh:'慈悲→勝利',   letter:'Kaph',   meaning:'命運之輪，業力的循環'},
  11: {path:'22', sephirot:'Geburah→Tiphereth',   zh:'力量→美',     letter:'Lamed',  meaning:'因果的天平，宇宙的正義'},
  12: {path:'23', sephirot:'Geburah→Hod',         zh:'力量→榮耀',   letter:'Mem',    meaning:'犧牲與臣服，水的洗禮'},
  13: {path:'24', sephirot:'Tiphereth→Netzach',   zh:'美→勝利',     letter:'Nun',    meaning:'死亡與重生，根本的轉化'},
  14: {path:'25', sephirot:'Tiphereth→Yesod',     zh:'美→基礎',     letter:'Samekh', meaning:'節制與調和，天使的道路'},
  15: {path:'26', sephirot:'Tiphereth→Hod',       zh:'美→榮耀',     letter:'Ayin',   meaning:'物質的誘惑，陰影的面對'},
  16: {path:'27', sephirot:'Netzach→Hod',         zh:'勝利→榮耀',   letter:'Peh',    meaning:'雷擊塔，舊結構的摧毀'},
  17: {path:'28', sephirot:'Netzach→Yesod',       zh:'勝利→基礎',   letter:'Tzaddi', meaning:'星星的希望，靈性的引導'},
  18: {path:'29', sephirot:'Netzach→Malkuth',     zh:'勝利→王國',   letter:'Qoph',   meaning:'月亮的幻象，潛意識的旅程'},
  19: {path:'30', sephirot:'Hod→Yesod',           zh:'榮耀→基礎',   letter:'Resh',   meaning:'太陽的光輝，意識的覺醒'},
  20: {path:'31', sephirot:'Hod→Malkuth',         zh:'榮耀→王國',   letter:'Shin',   meaning:'最後的審判，靈魂的覺醒'},
  21: {path:'32', sephirot:'Yesod→Malkuth',       zh:'基礎→王國',   letter:'Tav',    meaning:'世界的完成，宇宙之舞'}
};

function tarotKabbalahAnalysis(drawn) {
  if (!drawn || !drawn.length) return [];

  var results = [];
  drawn.forEach(function(card) {
    if (card.id < 22) {
      var kb = TAROT_KABBALAH[card.id];
      if (kb) {
        results.push({
          cardId: card.id,
          cardName: card.name || '',
          path: kb.path,
          sephirot: kb.sephirot,
          sephirotZh: kb.zh,
          letter: kb.letter,
          meaning: kb.meaning
        });
      }
    }
  });

  return results;
}


// ── 4. 牌組數量統計深化 ──

function tarotSuitAnalysis(drawn) {
  if (!drawn || !drawn.length) return null;

  var counts = {major: 0, wands: 0, cups: 0, swords: 0, pentacles: 0, court: 0, pip: 0};
  var reversedCount = 0;

  drawn.forEach(function(card) {
    if (card.id < 22) { counts.major++; return; }
    var suitIdx = Math.floor((card.id - 22) / 14);
    var cardNum = ((card.id - 22) % 14) + 1;
    if (suitIdx === 0) counts.wands++;
    else if (suitIdx === 1) counts.cups++;
    else if (suitIdx === 2) counts.swords++;
    else counts.pentacles++;
    if (cardNum > 10) counts.court++;
    else counts.pip++;
    if (card.reversed) reversedCount++;
  });

  // 主導元素
  var suitMap = {wands: '火', cups: '水', swords: '風', pentacles: '土'};
  var dominant = '';
  var maxCount = 0;
  ['wands','cups','swords','pentacles'].forEach(function(s) {
    if (counts[s] > maxCount) { maxCount = counts[s]; dominant = s; }
  });

  // 缺失元素
  var missing = [];
  ['wands','cups','swords','pentacles'].forEach(function(s) {
    if (counts[s] === 0 && drawn.length >= 3) missing.push(suitMap[s]);
  });

  return {
    counts: counts,
    reversedCount: reversedCount,
    reversedRatio: drawn.length > 0 ? Math.round(reversedCount / drawn.length * 100) : 0,
    dominantSuit: dominant,
    dominantElement: suitMap[dominant] || '',
    missingElements: missing,
    majorRatio: drawn.length > 0 ? Math.round(counts.major / drawn.length * 100) : 0,
    courtRatio: drawn.length > 0 ? Math.round(counts.court / drawn.length * 100) : 0,
    zh: (dominant ? '主導元素：' + suitMap[dominant] + '（' + dominant + ' ' + maxCount + '張）' : '無主導元素') +
        (missing.length > 0 ? '・缺失：' + missing.join('、') : '') +
        (counts.major >= 3 ? '・大阿爾克那偏多（命運主題強烈）' : '') +
        (reversedCount > drawn.length / 2 ? '・逆位過半（內在阻塞需要釋放）' : '')
  };
}


// ══════════════════════════════════════════════════════════════════════
// 5. 牌陣自動選擇系統 — 根據問題性質匹配最適牌陣
// ══════════════════════════════════════════════════════════════════════

// ── 所有牌陣定義（金色黎明系統 + 現代實務常搭配牌陣）──
var SPREAD_DEFS = {
  three_card: {
    id: 'three_card', zh: 'Three-Card Spread（三牌陣）', count: 3,
    en: 'Three-Card Spread',
    desc: '單一短問・快速判斷主線',
    positions: [
      { name: '過去', zh: '影響你走到這裡的因素' },
      { name: '現在', zh: '你正在經歷的核心能量' },
      { name: '未來', zh: '如果保持現狀的走向' }
    ]
  },
  five_card: {
    id: 'five_card', zh: 'Five-Card Spread（五牌陣）', count: 5,
    en: 'Five-Card Spread',
    desc: '中等複雜問題・看現況＋原因＋阻礙＋建議＋結果',
    positions: [
      { name: '現況', zh: '目前正在發生什麼' },
      { name: '原因', zh: '事情走到這步的根源' },
      { name: '阻礙', zh: '正在擋住你的力量' },
      { name: '建議', zh: '最適合的應對方式' },
      { name: '結果', zh: '最可能的走向' }
    ]
  },
  either_or: {
    id: 'either_or', zh: '二選一牌陣', count: 5,
    en: 'Either-Or Spread',
    desc: '面對抉擇時，看清兩條路',
    positions: [
      { name: '你', zh: '你目前的狀態與核心需求' },
      { name: 'A 選項', zh: '選 A 的能量與發展' },
      { name: 'B 選項', zh: '選 B 的能量與發展' },
      { name: 'A 結果', zh: '走 A 路的最終走向' },
      { name: 'B 結果', zh: '走 B 路的最終走向' }
    ]
  },
  cross: {
    id: 'cross', zh: 'Cross Spread（十字牌陣）', count: 5,
    en: 'Cross Spread',
    desc: '問題有衝突拉扯・看核心 vs 阻礙',
    positions: [
      { name: '核心', zh: '問題的核心本質' },
      { name: '阻礙', zh: '正在阻擋你的力量' },
      { name: '過去', zh: '過去的影響' },
      { name: '未來', zh: '未來的發展趨勢' },
      { name: '建議', zh: '最佳行動方向' }
    ]
  },
  relationship: {
    id: 'relationship', zh: '關係牌陣', count: 6,
    en: 'Relationship Spread',
    desc: '看透兩個人之間的真實狀態',
    positions: [
      { name: '你', zh: '你在這段關係中的狀態' },
      { name: '對方', zh: '對方在這段關係中的狀態' },
      { name: '關係現狀', zh: '你們之間目前的能量' },
      { name: '挑戰', zh: '這段關係面臨的考驗' },
      { name: '建議', zh: '最適合的應對方式' },
      { name: '走向', zh: '關係未來的發展方向' }
    ]
  },
  celtic_cross: {
    id: 'celtic_cross', zh: 'Celtic Cross（凱爾特十字）', count: 10,
    en: 'Celtic Cross',
    desc: '完整局勢解析・看現況、阻礙、過去、未來、內在、外在、結果',
    positions: [
      { name: '現況核心', zh: '現在的核心狀態' },
      { name: '交叉牌', zh: '橫跨現況的力量——正位為助力，逆位為阻力' },
      { name: '根因', zh: '底層動機或根源' },
      { name: '近期過去', zh: '最近發生的相關事件' },
      { name: '顯性目標', zh: '你意識層面的期望' },
      { name: '近期走向', zh: '短期內的發展方向' },
      { name: '你的位置', zh: '你在情境中的角色' },
      { name: '外界環境', zh: '外在人事的影響' },
      { name: '希望與恐懼', zh: '你最深層的期待和擔心' },
      { name: '最終結果', zh: '事情的最終走向' }
    ]
  },
  tree_of_life: {
    id: 'tree_of_life', zh: '生命之樹', count: 10,
    en: '生命之樹',
    desc: '金色黎明核心牌陣・人生架構、靈性課題、深層自我',
    positions: [
      { name: 'Kether 王冠', zh: '靈性最高指引・你的終極方向' },
      { name: 'Chokmah 智慧', zh: '創造的力量・你的原始動力' },
      { name: 'Binah 理解', zh: '限制與形式・你必須面對的現實' },
      { name: 'Chesed 慈悲', zh: '擴展的力量・機會與恩典' },
      { name: 'Geburah 力量', zh: '收縮的力量・必須割捨或面對的' },
      { name: 'Tiphereth 美', zh: '核心自我・你真正的狀態' },
      { name: 'Netzach 勝利', zh: '情感與慾望・你想要什麼' },
      { name: 'Hod 榮耀', zh: '思維與溝通・你怎麼想的' },
      { name: 'Yesod 基礎', zh: '潛意識・你沒察覺的影響' },
      { name: 'Malkuth 王國', zh: '物質現實・最終落地的結果' }
    ]
  },
  timeline: {
    id: 'timeline', zh: '時間線牌陣', count: 5,
    en: 'Timeline Spread',
    desc: '回答「什麼時候」「要多久」',
    positions: [
      { name: '過去根源', zh: '事情的源頭在哪裡' },
      { name: '近期狀態', zh: '目前正在發生什麼' },
      { name: '轉折點', zh: '什麼會觸發改變' },
      { name: '發展', zh: '轉折之後的走勢' },
      { name: '最終結果', zh: '事情最終會怎樣' }
    ]
  },
  zodiac: {
    id: 'zodiac', zh: 'Zodiac Spread（黃道十二宮）', count: 13,
    en: 'Zodiac Spread',
    desc: '金色黎明核心牌陣・12 宮位逐一掃描未來一年或特定事件的 12 個面向',
    positions: [
      { name: '第一宮・自我', zh: '你目前的狀態與身體能量' },
      { name: '第二宮・財務', zh: '金錢、資源、你重視的東西' },
      { name: '第三宮・溝通', zh: '學習、短途旅行、兄弟姐妹、日常交流' },
      { name: '第四宮・家庭', zh: '家庭根基、內在安全感、父親/家族' },
      { name: '第五宮・創造', zh: '戀愛、子女、創作、快樂、冒險' },
      { name: '第六宮・健康', zh: '日常工作、健康狀態、服務、習慣' },
      { name: '第七宮・伴侶', zh: '婚姻、合夥、公開的敵人、重要他人' },
      { name: '第八宮・轉化', zh: '共同資產、死亡與重生、親密關係深層' },
      { name: '第九宮・遠方', zh: '信仰、高等教育、遠行、法律、人生哲學' },
      { name: '第十宮・事業', zh: '事業頂點、社會地位、公眾形象、母親' },
      { name: '第十一宮・社群', zh: '朋友圈、理想抱負、團體、人脈網絡' },
      { name: '第十二宮・隱藏', zh: '潛意識、業力、秘密敵人、靈性修煉' },
      { name: '總結・年度主旋律', zh: '整體能量的核心訊息與最終指引' }
    ]
  },
  minor_arcana: {
    id: 'minor_arcana', zh: 'Minor Arcana（小阿卡那占卜）', count: 7,
    en: 'Minor Arcana Divination',
    desc: '金色黎明核心牌陣・只用 56 張小阿卡那解決具體生活問題',
    deckFilter: 'minor_only',
    positions: [
      { name: '現狀', zh: '你現在面對的具體處境' },
      { name: '原因', zh: '造成這個處境的實際因素' },
      { name: '挑戰', zh: '你必須克服的障礙' },
      { name: '周圍的人', zh: '影響你的人物和他們的態度' },
      { name: '你的資源', zh: '你手上可以運用的東西' },
      { name: '建議行動', zh: '最適合的下一步' },
      { name: '結果', zh: '如果照建議走的最可能結果' }
    ]
  },

  // ★ GD-6 (G1) 補:Fifteen-Card Method (英式牌陣 / GD 標準塔羅 spread)
  //   依據:Wang《Introduction to GD Tarot》Appendix III + Crowley Thoth LWB
  //   特性:GD/Crowley 標準塔羅 spread,完全不用反位,純靠 elemental dignity
  //   版面:
  //     13  9  5     (上排:13/9/5 = 替代行動  4/8/12 = 自然趨勢)
  //      2  1  3     (中排:1=querent  2/3=核心狀態)
  //     14 10  6     (中下:6/10/14 = 心理層面與決策依據)
  //      4  8 12
  //      7 11 15     (下排:7/11/15 = 命運/業力 不可控)
  fifteen_card: {
    id: 'fifteen_card', zh: 'Fifteen-Card Method（金色黎明 15 張牌陣）', count: 15,
    en: 'Fifteen-Card Method (English Spread)',
    desc: 'GD/Crowley 標準塔羅 spread・不用反位・純靠 elemental dignity・5 個 triad 分析',
    positions: [
      // Card 1 = querent / 問題本質
      { name: '1.Querent 核心', zh: '提問者 + 問題本質 + 主要影響(中心)' },
      // Card 2, 3 = 與 1 合讀,描述局面性質與 querent 性格
      { name: '2.核心左', zh: '與 1 合讀的左翼:描述局面性質與 querent 性格(細節 1)' },
      { name: '3.核心右', zh: '與 1 合讀的右翼:描述局面性質與 querent 性格(細節 2)' },
      // Card 4, 8, 12 = 自然會走的路 (右上 triad)
      { name: '4.自然路徑近', zh: '若不採取行動,自然會走的路(近期)' },
      { name: '5.替代路徑遠', zh: '若採取替代行動,可能達到的方向(遠景)' },
      { name: '6.決策層上', zh: '心理層面與決策依據(意識層上方)' },
      { name: '7.命運上', zh: '命運/業力,不可控、需適應的力量(上)' },
      { name: '8.自然路徑中', zh: '若不採取行動,自然會走的路(中段)' },
      { name: '9.替代路徑中', zh: '若採取替代行動,可能達到的方向(中段)' },
      { name: '10.決策層中', zh: '心理層面與決策依據(中)' },
      { name: '11.命運中', zh: '命運/業力,不可控、需適應的力量(中)' },
      { name: '12.自然路徑遠', zh: '若不採取行動,自然會走的路(遠期)' },
      { name: '13.替代路徑近', zh: '若採取替代行動,可能達到的方向(近期)' },
      { name: '14.決策層下', zh: '心理層面與決策依據(深層)' },
      { name: '15.命運下', zh: '命運/業力,不可控、需適應的力量(下)' }
    ]
  },

  // ★ GD-7 補:Mathers 1888《The Tarot》Second Method of Divination (21 張)
  //   全名:Mathers Second Method (Three rows of seven, Significator centred)
  //   依據:Mathers 1888 原書 METHODS OF DIVINATION 章節
  //   特性:Significator 抽出後,從 78 張中每隔 7 張抽 1,共 21 張,3 列 7 行
  //   讀法:每列從右到左讀,然後配對 1↔21、2↔20...讀
  mathers_21: {
    id: 'mathers_21', zh: 'Mathers Second Method (1888 三排七)', count: 21,
    en: 'Mathers Second Method',
    desc: 'Mathers 1888 原書古法・Significator 三排七・每排七張(過去/現在/未來)',
    positions: [
      // 第一排(過去)— 從右到左
      { name: '1.過去-1', zh: '過去・離 querent 最近的影響' },
      { name: '2.過去-2', zh: '過去・第二層影響' },
      { name: '3.過去-3', zh: '過去・第三層影響' },
      { name: '4.過去-4', zh: '過去・第四層影響' },
      { name: '5.過去-5', zh: '過去・第五層影響' },
      { name: '6.過去-6', zh: '過去・第六層影響' },
      { name: '7.過去-7', zh: '過去・最遠源頭' },
      // 第二排(現在)
      { name: '8.現在-1', zh: '現在・離 querent 最近的狀態' },
      { name: '9.現在-2', zh: '現在・第二層狀態' },
      { name: '10.現在-3', zh: '現在・第三層狀態' },
      { name: '11.現在-4', zh: '現在・第四層狀態' },
      { name: '12.現在-5', zh: '現在・第五層狀態' },
      { name: '13.現在-6', zh: '現在・第六層狀態' },
      { name: '14.現在-7', zh: '現在・整體場景的最外圍' },
      // 第三排(未來)
      { name: '15.未來-1', zh: '未來・最近的下一步' },
      { name: '16.未來-2', zh: '未來・第二層發展' },
      { name: '17.未來-3', zh: '未來・第三層發展' },
      { name: '18.未來-4', zh: '未來・第四層發展' },
      { name: '19.未來-5', zh: '未來・第五層發展' },
      { name: '20.未來-6', zh: '未來・第六層發展' },
      { name: '21.未來-7', zh: '未來・最終遠景' }
    ]
  },

  // ★ GD-11 補:Mathers First Method (26 張古法 horseshoe)
  //   依據:Mathers《The Tarot》1888 原書 FIRST METHOD
  //   特性:全 78 張分發為 A=26 / C=17 / E=11(F=24 棄掉)三組
  //   每組擺成 horseshoe(右下→左下),從右到左讀,再首尾配對讀
  //   GD 命名為「very ancient mode of reading the Tarot」
  //   為簡化使用,我們只用最大組 A=26 張的 horseshoe 作為核心牌陣
  mathers_horseshoe: {
    id: 'mathers_horseshoe', zh: 'Mathers First Method (1888 古法 horseshoe)', count: 26,
    en: 'Mathers First Method (Ancient Horseshoe)',
    desc: 'Mathers 1888 最古老牌陣・26 張排成 horseshoe・從右到左 + 首尾配對 13 對讀法',
    positions: [
      // 從右下開始,沿著 horseshoe 弧形到左下
      { name: '1.右下起點', zh: '事件起點(右下)・第一層訊號' },
      { name: '2.', zh: '右側上升・第二層' },
      { name: '3.', zh: '右側上升・第三層' },
      { name: '4.', zh: '右側上升・第四層' },
      { name: '5.', zh: '右側上升・第五層' },
      { name: '6.', zh: '右側上升・第六層' },
      { name: '7.', zh: '右側上升・第七層' },
      { name: '8.', zh: '右側上升・第八層' },
      { name: '9.', zh: '右側上升・第九層' },
      { name: '10.', zh: '右側上升・第十層' },
      { name: '11.', zh: '右側上升・第十一層' },
      { name: '12.', zh: '右側上升・第十二層' },
      { name: '13.弧頂中央', zh: '弧頂・轉折點(關鍵)' },
      { name: '14.弧頂中央', zh: '弧頂・轉折點(配對 13)' },
      { name: '15.', zh: '左側下降・第十二層' },
      { name: '16.', zh: '左側下降・第十一層' },
      { name: '17.', zh: '左側下降・第十層' },
      { name: '18.', zh: '左側下降・第九層' },
      { name: '19.', zh: '左側下降・第八層' },
      { name: '20.', zh: '左側下降・第七層' },
      { name: '21.', zh: '左側下降・第六層' },
      { name: '22.', zh: '左側下降・第五層' },
      { name: '23.', zh: '左側下降・第四層' },
      { name: '24.', zh: '左側下降・第三層' },
      { name: '25.', zh: '左側下降・第二層' },
      { name: '26.左下終點', zh: '事件終點(左下)・最終結局' }
    ]
  },

  // ★ GD-11 補:7-card Horseshoe (現代簡化版)
  //   依據:Cicero《Golden Dawn Magical Tarot》提到的常見 GD 衍生牌陣
  //   特性:7 張弧形・past / present / hidden / advice / external / obstacle / outcome
  //   是 Celtic Cross 之外最普及的 GD 風格牌陣
  horseshoe: {
    id: 'horseshoe', zh: 'Horseshoe Spread（七張馬蹄形）', count: 7,
    en: 'Seven-Card Horseshoe',
    desc: '中等複雜・看過去現在未來+建議+他人態度+阻礙+結果',
    positions: [
      { name: '1.過去', zh: '過去影響' },
      { name: '2.現在', zh: '現在處境' },
      { name: '3.隱藏影響', zh: '隱藏的影響或未來短期將發生' },
      { name: '4.建議', zh: '弧頂中央・採取的最佳行動' },
      { name: '5.他人態度', zh: '其他人對此事的態度與影響' },
      { name: '6.阻礙', zh: '面臨的障礙或挑戰' },
      { name: '7.最終結果', zh: '最終走向' }
    ]
  },

  ootk: {
    id: 'ootk', zh: '開鑰之法', count: 0,
    en: '開鑰之法',
    desc: '金色黎明最高階占卜・五次獨立讀盤・使用全部 78 張牌・依 Mathers Book T 正統流程',
    special: 'ootk',
    positions: []
  }
};

// ── 問題性質偵測 → 牌陣匹配（金色黎明系統）──
// Three-Card: 單一短問、快速判斷
// Five-Card: 中等複雜、要看原因和建議
// Cross: 問題有衝突拉扯、有阻礙
// Celtic Cross: 複雜完整局勢
// Tree of Life: 人生結構、靈性課題、深層內在
// Timeline: 時機題
// Relationship: 兩人關係
// Either-Or: 二選一
function detectSpreadType(question, type) {
  var q = (question || '').trim();
  var qMarks = (q.match(/[？?]/g) || []).length;

  // ★ GD-6,7 修復:加 fifteen_card 與 mathers_21 觸發詞
  //   前端用戶用關鍵字觸發 GD/Crowley 標準塔羅 spread 與 Mathers 1888 古法
  // 0.1 GD/Crowley Fifteen-Card Method (15 張英式牌陣)
  if (/金色黎明.*牌陣|GD.*牌陣|英式.*牌陣|fifteen.?card|十五.?張|Crowley.*牌陣/i.test(q)) {
    return 'fifteen_card';
  }
  // 0.2 Mathers 1888 三排七古法
  if (/Mathers.*牌陣|1888.*牌陣|三排七|三排.*七|二十一.?張|21.?張.*牌陣|過去現在未來.*牌陣/i.test(q)) {
    return 'mathers_21';
  }

  // 0. 多子問題（3個以上問號）→ 凱爾特十字
  if (qMarks >= 3) return 'celtic_cross';

  // 1. 二選一 → 二選一牌陣
  // ★ Bug #20 fix: 之前用 /A.*B/ 對英文誤觸發（含「Apple Banana」字樣的問題會被當二選一）
  //   實際二選一中文表達都用「還是/或者/二選一/兩個...選/A 還是 B」這類連接詞
  //   移除過於寬鬆的 A.*B（中文場景幾乎用不到，移除無損準確度）
  if (/還是|或者|二選一|兩個.*選|哪一個|兩者.*選|選.*哪/.test(q)) {
    return 'either_or';
  }

  // 2. 時機題 → 時間線牌陣
  if (/什麼時候|幾時|多久|何時|哪一年|哪個月|幾月|時間點|來得及/.test(q)) {
    return 'timeline';
  }

  // 3. 靈性 / 人生方向 / 深層自我 → 生命之樹
  if (/人生方向|靈性|修行|為什麼一直|總是重複|模式|藍圖|命運|使命|課題|業力|前世|靈魂/.test(q)) {
    return 'tree_of_life';
  }

  // 3.5. 年度/全面/12宮 → 黃道十二宮
  if (/年度|明年|今年|一年|12個月|12宮|十二宮|黃道|全面掃描|每個面向|各方面/.test(q)) {
    return 'zodiac';
  }

  // 3.6. 明確要求小阿卡那 or 非常具體的生活問題
  if (/小阿卡那|小牌|minor|具體.*問題|實際.*怎麼做|執行.*步驟/.test(q)) {
    return 'minor_arcana';
  }

  // 3.7. 開鑰之法 — 付費功能，不由問題文字觸發，只能從按鈕或選擇器進入

  // 4. 衝突拉扯類 → Cross Spread（十字牌陣）
  if (/拉扯|糾結|矛盾|卡住|進退兩難|壓力|衝突|阻礙|為什麼不順|為什麼卡|怎麼解|到底是好是壞|目的/.test(q)) {
    return 'cross';
  }

  // 5. 關係題（感情類 + 涉及對方）→ 關係牌陣
  if (type === 'love' || type === 'relationship' || type === 'family') {
    if (/他|她|對方|另一半|前任|現任|老公|老婆|男友|女友|伴侶|喜歡的人|曖昧|之間|怎麼想|心裡|真心|復合|分手/.test(q)) {
      // 多問號的關係題 → 升級到凱爾特十字
      if (qMarks >= 2) return 'celtic_cross';
      return 'relationship';
    }
  }

  // 6. 短的是非題（單一問號、<25字）→ 三牌陣
  if (qMarks <= 1 && q.length < 25) {
    if (/^(會不會|有沒有|該不該|可不可以|能不能|是不是|適不適合|好不好|值不值)/.test(q)) {
      return 'three_card';
    }
    if (/嗎[？?]?\s*$/.test(q)) {
      return 'three_card';
    }
  }

  // 7. 中等複雜（2個問號，或問句25-40字）→ 五牌陣
  if (qMarks === 2 || (q.length >= 25 && q.length <= 40)) {
    return 'five_card';
  }

  // 8. 長問句（>40字）→ 凱爾特十字
  if (q.length > 40 || /整體|全面|深入|詳細|大方向/.test(q)) {
    return 'celtic_cross';
  }

  // 9. 預設：根據問題類型
  var typeDefault = {
    love: 'five_card',
    career: 'five_card',
    wealth: 'five_card',
    health: 'five_card',
    relationship: 'relationship',
    family: 'relationship',
    general: 'five_card'
  };
  return typeDefault[type] || 'five_card';
}

// ── 建構牌陣結果物件（通用）──
function buildSpreadResult(drawn, spreadId) {
  var def = SPREAD_DEFS[spreadId];
  if (!def) return null;
  if (!drawn || drawn.length < def.count) return null;

  var positions = def.positions.map(function(pos, i) {
    var card = drawn[i];
    return {
      name: pos.name,
      zh: pos.zh,
      card: card,
      cardName: card ? (card.name || card.n) : '',
      isUp: card ? card.isUp : true
    };
  });

  return {
    type: spreadId,
    zh: def.zh,
    count: def.count,
    desc: def.desc,
    positions: positions
  };
}

// ── 全域存取：當前選擇的牌陣 ──
var _currentSpreadId = 'celtic_cross'; // 預設
function getCurrentSpread() { return _currentSpreadId; }
function setCurrentSpread(id) { if (SPREAD_DEFS[id]) { _currentSpreadId = id; S.tarot = S.tarot || {}; S.tarot.spreadDef = SPREAD_DEFS[id]; } }
function getCurrentSpreadDef() { return SPREAD_DEFS[_currentSpreadId] || SPREAD_DEFS.celtic_cross; }

// ══════════════════════════════════════════════════════════════════════
// 6. showSpread 覆寫 — 適配所有牌陣類型
// ══════════════════════════════════════════════════════════════════════
(function() {
  var _origShowSpread = (typeof showSpread === 'function') ? showSpread : null;

  showSpread = function() {
    S.tarot.drawn = drawnCards;
    S.tarot.spread = drawnCards;
    document.getElementById('t-spread-sec').classList.remove('hidden');

    var el = document.getElementById('t-spread');
    if (!el) return;

    var def = (typeof getCurrentSpreadDef === 'function') ? getCurrentSpreadDef() : null;
    var spreadId = (typeof getCurrentSpread === 'function') ? getCurrentSpread() : 'celtic_cross';

    // 牌陣標題
    var titleHtml = '<div style="text-align:center;margin-bottom:.8rem">';
    titleHtml += '<span style="font-size:.85rem;color:var(--c-gold);font-weight:700">' + (def ? def.zh : '凱爾特十字牌陣') + '</span>';
    if (def && def.desc) titleHtml += '<br><span style="font-size:.72rem;color:var(--c-text-muted)">' + def.desc + '</span>';
    titleHtml += '</div>';

    // 每張牌的卡片
    var cardsHtml = '';
    var count = def ? Math.min(def.count, drawnCards.length) : drawnCards.length;

    for (var i = 0; i < count; i++) {
      var c = drawnCards[i];
      if (!c) continue;
      var posName = '';
      var posZh = '';
      if (def && def.positions && def.positions[i]) {
        posName = def.positions[i].name;
        posZh = def.positions[i].zh;
      } else {
        posName = (c.pos || '第' + (i + 1) + '張');
        posZh = '';
      }

      // 取 deep 解讀
      var dp = (typeof getTarotDeep === 'function') ? getTarotDeep(c) : {};
      var coreDesc = c.isUp ? (dp.coreUp || '') : (dp.coreRv || '');
      var adviceDesc = c.isUp ? (dp.adviceUp || '') : (dp.adviceRv || '');
      var imgSrc = (typeof getTarotCardImage === 'function') ? getTarotCardImage(c) : '';

      // 問題類型專屬解讀
      var ftKey = {love:'love',career:'career',wealth:'wealth',health:'health',relationship:'love',family:'love'}[(S.form && S.form.type) || ''] || '';
      var typeReading = '';
      if (ftKey) {
        var fullCard = (typeof TAROT !== 'undefined' && TAROT[c.id]) ? TAROT[c.id] : c;
        typeReading = c.isUp ? (fullCard[ftKey + 'Up'] || '') : (fullCard[ftKey + 'Rv'] || '');
      }

      // 元素對應色
      var elColor = {'火':'#ef4444','水':'#3b82f6','風':'#22d3ee','土':'#a78b5a','水星':'#c9a84c','金星':'#f472b6','木星':'#38bdf8','土星':'#475569','月亮':'#a3e635','太陽':'#fbbf24'}[c.el] || 'var(--c-gold)';

      cardsHtml += '<div class="card" style="padding:.8rem;margin-bottom:.5rem;border-left:3px solid ' + elColor + '">';

      // 頂部：位置 + 正逆位
      cardsHtml += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.4rem">';
      cardsHtml += '<span class="tag tag-gold" style="font-size:.75rem">' + (i + 1) + '. ' + posName + '</span>';
      cardsHtml += '<span class="tag ' + (c.isUp ? 'tag-blue' : 'tag-red') + '" style="font-size:.7rem">' + (c.isUp ? '順位' : '逆位') + '</span>';
      cardsHtml += '</div>';

      // 位置含義（如果有）
      if (posZh) {
        cardsHtml += '<div style="font-size:.7rem;color:var(--c-text-muted);margin-bottom:.4rem">' + posZh + '</div>';
      }

      // 牌名 + 圖片
      cardsHtml += '<div style="display:flex;gap:.6rem;align-items:flex-start">';
      if (imgSrc) {
        cardsHtml += '<img src="' + imgSrc + '" alt="' + c.n + '" style="width:65px;height:100px;border-radius:6px;flex-shrink:0;object-fit:cover;' + (c.isUp ? '' : 'transform:rotate(180deg)') + '">';
      }
      cardsHtml += '<div style="flex:1">';
      cardsHtml += '<strong class="text-gold serif" style="font-size:.95rem">' + c.n + '</strong>';
      if (c.el) cardsHtml += '<span style="font-size:.68rem;color:' + elColor + ';margin-left:.4rem">' + c.el + '</span>';

      // 關鍵字
      var kw = c.isUp ? (c.kwUp || '') : (c.kwRv || '');
      if (!kw) { var fc = (typeof TAROT !== 'undefined' && TAROT[c.id]) ? TAROT[c.id] : c; kw = c.isUp ? (fc.kwUp || '') : (fc.kwRv || ''); }
      if (kw) cardsHtml += '<div style="font-size:.72rem;color:var(--c-text-dim);margin-top:.2rem">🔑 ' + kw + '</div>';

      // 基本解讀
      cardsHtml += '<p style="font-size:.82rem;color:var(--c-text-dim);margin-top:.3rem;line-height:1.6">' + (c.isUp ? c.up : c.rv) + '</p>';

      // 專屬解讀
      if (typeReading) {
        cardsHtml += '<p style="font-size:.8rem;color:var(--c-gold-light,#e8c968);margin-top:.3rem;line-height:1.6;border-top:1px solid rgba(201,168,76,.1);padding-top:.3rem">📌 ' + typeReading + '</p>';
      }

      // 深度解讀
      if (coreDesc) cardsHtml += '<p style="font-size:.78rem;color:var(--c-gold-light,#c9a84c);margin-top:.2rem;line-height:1.5;opacity:.85">' + coreDesc + '</p>';
      if (adviceDesc) cardsHtml += '<p style="font-size:.72rem;opacity:.6;margin-top:.15rem">💡 ' + adviceDesc + '</p>';

      cardsHtml += '</div></div></div>';
    }

    el.innerHTML = titleHtml + cardsHtml;
  };
})();

function enhanceTarot(tarot) {
  if (!tarot || !tarot.drawn || !tarot.drawn.length) return tarot;

  var drawn = tarot.drawn;

  // 1. 數字學分析
  try { tarot.numerology = tarotNumerologyAnalysis(drawn); } catch(e) { tarot.numerology = null; }

  // 2. 根據當前牌陣建構結果
  try {
    var spreadId = _currentSpreadId || 'celtic_cross';
    tarot.spreadAnalysis = buildSpreadResult(drawn, spreadId);
    tarot.spreadType = spreadId;
    tarot.spreadDef = SPREAD_DEFS[spreadId] || null;
  } catch(e) { console.warn('[Tarot] spread build error:', e); }

  // 3. 卡巴拉
  try { tarot.kabbalah = tarotKabbalahAnalysis(drawn); } catch(e) { tarot.kabbalah = []; }

  // 4. 牌組深度統計
  try { tarot.suitAnalysis = tarotSuitAnalysis(drawn); } catch(e) { tarot.suitAnalysis = null; }

  return tarot;
}

// ══════════════════════════════════════════════════════════════════════
// 7. 手動牌陣切換 UI
// ══════════════════════════════════════════════════════════════════════
function injectSpreadSelector() {
  var step2 = document.getElementById('step-2');
  if (!step2 || document.getElementById('jy-spread-selector')) return;
  var container = document.createElement('div');
  container.id = 'jy-spread-selector';
  container.style.cssText = 'display:flex;flex-wrap:wrap;justify-content:center;gap:.35rem;margin:.5rem 0 .8rem;padding:0 .5rem';
  var spreads = ['three_card','five_card','cross','either_or','timeline','relationship','celtic_cross','tree_of_life','zodiac','minor_arcana','ootk'];
  var labels = {three_card:'3牌',five_card:'5牌',cross:'十字',either_or:'二選一',timeline:'時間線',relationship:'關係',celtic_cross:'凱爾特',tree_of_life:'生命之樹',zodiac:'12宮',minor_arcana:'小牌',ootk:'開鑰之法'};
  spreads.forEach(function(id) {
    var btn = document.createElement('button');
    btn.className = 'jy-spread-btn'; btn.dataset.spread = id;
    btn.textContent = labels[id] || id;
    btn.style.cssText = 'padding:.3rem .6rem;border-radius:8px;font-size:.7rem;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.03);color:var(--c-text-dim);cursor:pointer;font-family:inherit;transition:all .2s';
    btn.onclick = function() {
      if (typeof setCurrentSpread === 'function') setCurrentSpread(id);
      container.querySelectorAll('.jy-spread-btn').forEach(function(b) {
        b.style.borderColor = 'rgba(255,255,255,.1)'; b.style.background = 'rgba(255,255,255,.03)'; b.style.color = 'var(--c-text-dim)';
      });
      btn.style.borderColor = 'rgba(201,168,76,.5)'; btn.style.background = 'rgba(201,168,76,.08)'; btn.style.color = 'var(--c-gold,#c9a84c)';
      drawnCards = []; deckShuffled = [];
      if (typeof initTarotDeck === 'function') initTarotDeck();
    };
    var currentId = (typeof getCurrentSpread === 'function') ? getCurrentSpread() : 'celtic_cross';
    if (id === currentId) { btn.style.borderColor = 'rgba(201,168,76,.5)'; btn.style.background = 'rgba(201,168,76,.08)'; btn.style.color = 'var(--c-gold,#c9a84c)'; }
    container.appendChild(btn);
  });
  var deckWrap = step2.querySelector('.tarot-deck-wrap');
  if (deckWrap) deckWrap.parentNode.insertBefore(container, deckWrap);
}

// ══════════════════════════════════════════════════════════════════════
// 8. 金色黎明宮廷牌元素對應
// ══════════════════════════════════════════════════════════════════════
var GD_COURT_ELEMENTS = {
  35:{rank:'King',suit:'火',rankEl:'火',combo:'火中之火',zh:'權杖國王：純粹的火焰意志，極致的領導力與創造力，但容易暴烈失控'},
  34:{rank:'Queen',suit:'火',rankEl:'水',combo:'火中之水',zh:'權杖皇后：火焰中的滋養力，熱情但有包容，直覺敏銳的引導者'},
  33:{rank:'Knight',suit:'火',rankEl:'風',combo:'火中之風',zh:'權杖騎士：火焰被風助燃，衝動冒進，行動力爆發但難以持久'},
  32:{rank:'Page',suit:'火',rankEl:'土',combo:'火中之土',zh:'權杖侍從：火焰在土壤中紮根，有想法但還在學習如何落地執行'},
  49:{rank:'King',suit:'水',rankEl:'火',combo:'水中之火',zh:'聖杯國王：情感中的意志力，外表冷靜但內心有強烈的保護慾和決斷力'},
  48:{rank:'Queen',suit:'水',rankEl:'水',combo:'水中之水',zh:'聖杯皇后：純粹的情感直覺，最深層的共感力，但容易被情緒淹沒'},
  47:{rank:'Knight',suit:'水',rankEl:'風',combo:'水中之風',zh:'聖杯騎士：情感的信使，浪漫理想化，帶來邀請但可能不切實際'},
  46:{rank:'Page',suit:'水',rankEl:'土',combo:'水中之土',zh:'聖杯侍從：情感的新芽，剛開始學習感受，純真但脆弱'},
  63:{rank:'King',suit:'風',rankEl:'火',combo:'風中之火',zh:'寶劍國王：思維的最高權威，判斷銳利但可能冷酷'},
  62:{rank:'Queen',suit:'風',rankEl:'水',combo:'風中之水',zh:'寶劍皇后：以直覺輔助理性，看穿表象的洞察力'},
  61:{rank:'Knight',suit:'風',rankEl:'風',combo:'風中之風',zh:'寶劍騎士：純粹的思維風暴，極快但容易過於激進'},
  60:{rank:'Page',suit:'風',rankEl:'土',combo:'風中之土',zh:'寶劍侍從：剛開始學習分析，好奇但缺乏經驗'},
  77:{rank:'King',suit:'土',rankEl:'火',combo:'土中之火',zh:'錢幣國王：物質世界的掌控者，穩健但可能過於物質化'},
  76:{rank:'Queen',suit:'土',rankEl:'水',combo:'土中之水',zh:'錢幣皇后：大地中的滋養泉源，實際但懂得享受'},
  75:{rank:'Knight',suit:'土',rankEl:'風',combo:'土中之風',zh:'錢幣騎士：穩扎穩打的行動者，專注效率和可靠性'},
  74:{rank:'Page',suit:'土',rankEl:'土',combo:'土中之土',zh:'錢幣侍從：純粹的物質學徒，踏實但尚未成熟'}
};

function getGDCourtElement(card) { return card ? (GD_COURT_ELEMENTS[card.id] || null) : null; }

// 覆寫 enhanceTarot — 注入宮廷牌元素
var _etBase = enhanceTarot;
enhanceTarot = function(tarot) {
  tarot = _etBase(tarot);
  if (!tarot || !tarot.drawn) return tarot;
  tarot.drawn.forEach(function(c) { var gd = getGDCourtElement(c); if (gd) c.gdCourt = gd; });
  var courts = tarot.drawn.filter(function(c) { return !!c.gdCourt; });
  if (courts.length) {
    tarot.courtElementAnalysis = { count: courts.length, cards: courts.map(function(c) { return {name:c.n||c.name, combo:c.gdCourt.combo, zh:c.gdCourt.zh}; }) };
  }
  return tarot;
};

// ══════════════════════════════════════════════════════════════════════
// 9. showSpread 覆寫 — 適配所有牌陣
// ══════════════════════════════════════════════════════════════════════
(function() {
  showSpread = function() {
    S.tarot.drawn = drawnCards; S.tarot.spread = drawnCards;
    document.getElementById('t-spread-sec').classList.remove('hidden');
    var el = document.getElementById('t-spread'); if (!el) return;
    var def = (typeof getCurrentSpreadDef === 'function') ? getCurrentSpreadDef() : null;
    var h = '<div style="text-align:center;margin-bottom:.8rem"><span style="font-size:.85rem;color:var(--c-gold);font-weight:700">' + (def ? def.zh : '牌陣') + '</span>';
    if (def && def.desc) h += '<br><span style="font-size:.72rem;color:var(--c-text-muted)">' + def.desc + '</span>';
    h += '</div>';
    var count = def ? Math.min(def.count, drawnCards.length) : drawnCards.length;
    var ftKey = {love:'love',career:'career',wealth:'wealth',health:'health',relationship:'love',family:'love'}[(S.form&&S.form.type)||''] || '';
    for (var i = 0; i < count; i++) {
      var c = drawnCards[i]; if (!c) continue;
      var posName = (def&&def.positions&&def.positions[i]) ? def.positions[i].name : (c.pos||'第'+(i+1)+'張');
      var posZh = (def&&def.positions&&def.positions[i]) ? def.positions[i].zh : '';
      var dp = (typeof getTarotDeep === 'function') ? getTarotDeep(c) : {};
      var coreDesc = c.isUp ? (dp.coreUp||'') : (dp.coreRv||'');
      var adviceDesc = c.isUp ? (dp.adviceUp||'') : (dp.adviceRv||'');
      var imgSrc = (typeof getTarotCardImage === 'function') ? getTarotCardImage(c) : '';
      var fc = (typeof TAROT !== 'undefined' && TAROT[c.id]) ? TAROT[c.id] : c;
      var typeR = ftKey ? (c.isUp ? (fc[ftKey+'Up']||'') : (fc[ftKey+'Rv']||'')) : '';
      var elC = {'火':'#ef4444','水':'#3b82f6','風':'#22d3ee','土':'#a78b5a'}[c.el] || 'var(--c-gold)';
      var gdInfo = c.gdCourt ? '<div style="font-size:.7rem;color:#c9a84c;margin-top:.2rem">⚡ ' + c.gdCourt.combo + '</div>' : '';
      h += '<div class="card" style="padding:.8rem;margin-bottom:.5rem;border-left:3px solid '+elC+'">';
      h += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.3rem">';
      h += '<span class="tag tag-gold" style="font-size:.75rem">'+(i+1)+'. '+posName+'</span>';
      h += '<span class="tag '+(c.isUp?'tag-blue':'tag-red')+'" style="font-size:.7rem">'+(c.isUp?'順位':'逆位')+'</span></div>';
      if (posZh) h += '<div style="font-size:.7rem;color:var(--c-text-muted);margin-bottom:.3rem">'+posZh+'</div>';
      h += '<div style="display:flex;gap:.6rem;align-items:flex-start">';
      if (imgSrc) h += '<img src="'+imgSrc+'" alt="'+c.n+'" style="width:65px;height:100px;border-radius:6px;flex-shrink:0;'+(c.isUp?'':'transform:rotate(180deg)')+'">';
      h += '<div style="flex:1"><strong class="text-gold serif" style="font-size:.95rem">'+c.n+'</strong>';
      var kw = c.isUp ? (fc.kwUp||'') : (fc.kwRv||'');
      if (kw) h += '<div style="font-size:.72rem;color:var(--c-text-dim);margin-top:.15rem">🔑 '+kw+'</div>';
      h += gdInfo;
      h += '<p style="font-size:.82rem;color:var(--c-text-dim);margin-top:.25rem;line-height:1.6">'+(c.isUp?fc.up:fc.rv)+'</p>';
      if (typeR) h += '<p style="font-size:.8rem;color:var(--c-gold-light,#e8c968);margin-top:.25rem;line-height:1.6;border-top:1px solid rgba(201,168,76,.1);padding-top:.25rem">📌 '+typeR+'</p>';
      if (coreDesc) h += '<p style="font-size:.78rem;color:var(--c-gold-light);margin-top:.15rem;line-height:1.5;opacity:.85">'+coreDesc+'</p>';
      if (adviceDesc) h += '<p style="font-size:.72rem;opacity:.6;margin-top:.1rem">💡 '+adviceDesc+'</p>';
      h += '</div></div></div>';
    }
    el.innerHTML = h;
    // 注入牌陣選擇器（手動模式）
    try { injectSpreadSelector(); } catch(e) {}
  };
})();

// ══════════════════════════════════════════════════════════════════════
// 10. TAROT_DEEP 擴充：56 張小阿爾克那深度解讀
// 金色黎明體系：每張牌的心理/事件/風險/時間/人物
// ══════════════════════════════════════════════════════════════════════
(function(){
  if (typeof TAROT_DEEP === 'undefined') return;

  // 輔助：批量定義
  function D(id, o) { TAROT_DEEP[id] = o; }

  // ═══ 權杖 WANDS (火) id:22-35 ═══
  D(22,{coreUp:'純粹的創造力火種，新計畫的起始能量',coreRv:'有想法但遲遲不動手',psycheUp:'充滿熱情和信心',psycheRv:'對開始感到焦慮',eventUp:'新專案啟動、靈感爆發',eventRv:'計畫延宕、缺乏動力',riskUp:'只有開頭沒有後續',riskRv:'錯過最佳時機',timeUp:'立即、當下',timeRv:'延遲',personUp:'充滿幹勁的開創者',personRv:'光說不練的空想家'});
  D(23,{coreUp:'掌握資源後的規劃階段',coreRv:'計畫停滯，猶豫不決',psycheUp:'胸有成竹，運籌帷幄',psycheRv:'失去方向，不知道下一步',eventUp:'談合作、做決策、制定策略',eventRv:'合作談不攏，計畫受阻',riskUp:'想太多而不動手',riskRv:'錯失良機',timeUp:'近期需做決定',timeRv:'時機尚未成熟',personUp:'有遠見的策略家',personRv:'優柔寡斷的人'});
  D(24,{coreUp:'等待開花結果的耐心期',coreRv:'等不到結果的焦躁',psycheUp:'知道方向對，願意等',psycheRv:'不確定等待是否值得',eventUp:'海外機會、擴張、等待回音',eventRv:'計畫延遲、期望落空',riskUp:'等太久失去耐心',riskRv:'放棄在黎明前',timeUp:'需要再等一段時間',timeRv:'遙遙無期',personUp:'有耐心的遠見者',personRv:'望穿秋水的等待者'});
  D(25,{coreUp:'穩定的慶祝與收穫',coreRv:'表面和諧下的不安',psycheUp:'滿足感，感恩',psycheRv:'總覺得少了什麼',eventUp:'搬家、結婚、完成里程碑',eventRv:'聚會不歡而散',riskUp:'安逸太久失去動力',riskRv:'根基不穩',timeUp:'穩定期，可以享受',timeRv:'過渡期',personUp:'好客溫暖的主人',personRv:'表面開心實際焦慮的人'});
  D(26,{coreUp:'競爭中的成長',coreRv:'惡性競爭或內鬥',psycheUp:'鬥志昂揚，享受挑戰',psycheRv:'被衝突消耗',eventUp:'比稿、競標、辯論',eventRv:'團隊內鬥、意見分歧',riskUp:'爭贏了但傷了關係',riskRv:'變成人身攻擊',timeUp:'衝突期但會快速解決',timeRv:'僵持不下',personUp:'有競爭力的選手',personRv:'只顧吵架的人'});
  D(27,{coreUp:'勝利與公開肯定',coreRv:'私下成功但缺乏認可',psycheUp:'自信心高漲',psycheRv:'渴望認同但得不到',eventUp:'獲獎、升遷、好評如潮',eventRv:'成果被忽視或搶功',riskUp:'自滿招損',riskRv:'默默努力但無人看見',timeUp:'高光時刻',timeRv:'需要更多時間證明',personUp:'站在台上的勝利者',personRv:'幕後英雄'});
  D(28,{coreUp:'面對眾多挑戰但堅持立場',coreRv:'防線快被攻破',psycheUp:'頑強不屈',psycheRv:'疲憊不堪',eventUp:'同時處理多個問題、堅守底線',eventRv:'四面楚歌',riskUp:'過度防禦變得封閉',riskRv:'真的守不住了',timeUp:'短期壓力大但撐得過',timeRv:'長期消耗戰',personUp:'堅守陣地的戰士',personRv:'筋疲力盡的防守者'});
  D(29,{coreUp:'快速推進、消息傳來',coreRv:'延遲、誤解、資訊混亂',psycheUp:'期待好消息的興奮',psycheRv:'等待中的焦慮',eventUp:'收到offer、航班、重要訊息',eventRv:'延誤、溝通不良',riskUp:'太急躁犯錯',riskRv:'重要訊息被忽略',timeUp:'快，幾天內',timeRv:'延遲但會到',personUp:'帶來好消息的信使',personRv:'遲到的快遞員'});
  D(30,{coreUp:'扛著重擔前進的責任感',coreRv:'終於放下重擔',psycheUp:'使命感強但壓力大',psycheRv:'突然輕鬆但可能逃避',eventUp:'承擔重要職責、獨撐大局',eventRv:'辭職、卸任、把責任交出去',riskUp:'身體撐不住',riskRv:'卸責可能有後果',timeUp:'高負荷但有終點',timeRv:'快結束了',personUp:'負重前行的領導者',personRv:'學會放下的人'});
  D(31,{coreUp:'目標明確的最後衝刺',coreRv:'半途而廢、精力耗盡',psycheUp:'堅定完成的決心',psycheRv:'懷疑是否值得繼續',eventUp:'專案收尾、搬家、長途旅行',eventRv:'拖延症發作',riskUp:'為了完成犧牲健康',riskRv:'功虧一簣',timeUp:'接近終點',timeRv:'還有最後一關',personUp:'咬牙衝線的馬拉松跑者',personRv:'中途棄賽的人'});

  // ═══ 聖杯 CUPS (水) id:36-49 ═══
  D(36,{coreUp:'情感的新開始，愛的種子',coreRv:'情感封閉或自欺',psycheUp:'心打開了，願意感受',psycheRv:'害怕再受傷',eventUp:'表白、心動、新關係',eventRv:'感情機會錯過',riskUp:'理想化對方',riskRv:'太保護自己反而錯過',timeUp:'感情萌芽期',timeRv:'尚未準備好',personUp:'純真的戀人',personRv:'把心關起來的人'});
  D(37,{coreUp:'兩人之間的真實連結',coreRv:'表面和諧但缺乏深度',psycheUp:'感受到被理解',psycheRv:'貌合神離',eventUp:'約會、合作、和好',eventRv:'溝通不良、假裝沒事',riskUp:'只看到對方好的一面',riskRv:'冷處理傷害更深',timeUp:'關係升溫期',timeRv:'需要修復期',personUp:'心意相通的伴侶',personRv:'同床異夢的人'});
  D(38,{coreUp:'值得慶祝的情感豐收',coreRv:'放縱或虛假的歡樂',psycheUp:'真心的快樂',psycheRv:'用派對掩蓋空虛',eventUp:'婚禮、生日、朋友聚會',eventRv:'酒後失態、虛假社交',riskUp:'只顧享樂忘了正事',riskRv:'孤獨被掩蓋',timeUp:'慶祝時刻',timeRv:'狂歡後的空虛',personUp:'快樂的分享者',personRv:'派對結束後最寂寞的人'});
  D(39,{coreUp:'對已有的感到不滿足',coreRv:'重新感恩珍惜',psycheUp:'倦怠感，覺得無聊',psycheRv:'開始懂得知足',eventUp:'拒絕好機會、對工作或感情失去熱情',eventRv:'回頭珍惜、重新評估',riskUp:'錯過眼前的好事',riskRv:'已經錯過了才後悔',timeUp:'停滯期',timeRv:'覺醒期',personUp:'挑剔的完美主義者',personRv:'學會珍惜的人'});
  D(40,{coreUp:'失去後的哀傷',coreRv:'開始走出傷痛',psycheUp:'沉浸在遺憾中',psycheRv:'願意向前看了',eventUp:'分手、失去、告別',eventRv:'重新連結、放下過去',riskUp:'被悲傷困住太久',riskRv:'還沒真正處理就急著走',timeUp:'低潮期',timeRv:'轉角處',personUp:'哀悼中的人',personRv:'擦乾眼淚站起來的人'});
  D(41,{coreUp:'回憶中的溫暖',coreRv:'沉溺過去無法前進',psycheUp:'懷舊的溫柔',psycheRv:'用回憶逃避現實',eventUp:'重逢、回到故鄉、老照片',eventRv:'過度沉溺舊情',riskUp:'活在過去錯過現在',riskRv:'把過去美化了',timeUp:'短暫的回顧',timeRv:'被過去卡住',personUp:'重感情的懷舊者',personRv:'走不出來的人'});
  D(42,{coreUp:'太多選擇讓人迷幻',coreRv:'回到現實做取捨',psycheUp:'什麼都想要的貪心',psycheRv:'開始務實',eventUp:'面對多個機會或誘惑',eventRv:'認清幻覺、做出選擇',riskUp:'追逐彩虹忘了路',riskRv:'打破幻想的痛',timeUp:'迷茫期',timeRv:'清醒時刻',personUp:'做白日夢的幻想家',personRv:'腳踏實地的人'});
  D(43,{coreUp:'主動離開不對的地方',coreRv:'離不開或不知道要去哪',psycheUp:'雖然難過但知道該走了',psycheRv:'猶豫不決',eventUp:'主動分手、辭職、離開舒適圈',eventRv:'走不了、困在原地',riskUp:'離開後更孤單',riskRv:'留下來更痛苦',timeUp:'離開的時機到了',timeRv:'還沒準備好',personUp:'有勇氣放手的人',personRv:'捨不得但留不住的人'});
  D(44,{coreUp:'願望成真，情感圓滿',coreRv:'接近但還差一步',psycheUp:'深層的滿足和感恩',psycheRv:'差一點到手的遺憾',eventUp:'結婚、夢想成真、心靈滿足',eventRv:'目標八成達成但不完美',riskUp:'滿足後失去動力',riskRv:'對結果不夠滿意',timeUp:'圓滿時刻',timeRv:'再等一下',personUp:'心想事成的幸運兒',personRv:'差一步的追夢人'});
  D(45,{coreUp:'情感的完整循環和圓滿',coreRv:'家庭或關係出現裂痕',psycheUp:'被愛包圍的幸福感',psycheRv:'對家庭/關係感到失望',eventUp:'家庭團聚、長久關係確認',eventRv:'家庭衝突、關係破裂',riskUp:'太依賴這個圓',riskRv:'冷漠或疏離',timeUp:'長期穩定',timeRv:'需要修復期',personUp:'被幸福圍繞的人',personRv:'家庭有傷的人'});

  // ═══ 寶劍 SWORDS (風) id:50-63 ═══
  D(50,{coreUp:'清晰的洞見，斬斷迷惑',coreRv:'用真相傷人',psycheUp:'頭腦清醒，看穿本質',psycheRv:'過於偏激或武斷',eventUp:'做出重要決定、得到關鍵資訊',eventRv:'資訊被曲解或武器化',riskUp:'真相可能讓人受傷',riskRv:'偏見當作真理',timeUp:'果斷行動的時刻',timeRv:'衝動判斷',personUp:'手持真理之劍的人',personRv:'用言語傷人的人'});
  D(51,{coreUp:'暫時的僵局需要平衡',coreRv:'做出選擇打破僵局',psycheUp:'在矛盾中求平衡',psycheRv:'選擇了但不確定對不對',eventUp:'調解、等待、需要更多資訊',eventRv:'終於做了決定',riskUp:'逃避選擇太久',riskRv:'倉促決定',timeUp:'等待期',timeRv:'行動期',personUp:'需要時間思考的人',personRv:'終於下決心的人'});
  D(52,{coreUp:'心碎但必要的痛',coreRv:'開始癒合',psycheUp:'感受到被背叛或失去',psycheRv:'慢慢接受事實',eventUp:'分手、背叛被揭露、令人心痛的真相',eventRv:'傷口開始復原',riskUp:'傷痛轉為怨恨',riskRv:'太快假裝沒事',timeUp:'急性傷痛期',timeRv:'療傷期',personUp:'心碎的人',personRv:'在療傷中的人'});
  D(53,{coreUp:'必要的休息和恢復',coreRv:'被迫停下或拒絕休息',psycheUp:'需要獨處充電',psycheRv:'躺平太久或過勞',eventUp:'住院、休假、退一步思考',eventRv:'被迫停工、過勞倒下',riskUp:'休息太久失去節奏',riskRv:'身體發出警告了',timeUp:'恢復期',timeRv:'還沒真正休息夠',personUp:'正在充電的人',personRv:'不肯休息的工作狂'});
  D(54,{coreUp:'以智取勝，策略性的撤退',coreRv:'偷雞不成蝕把米',psycheUp:'精明但有點狡猾',psycheRv:'被自己的聰明反噬',eventUp:'成功的策略、挖到對手的弱點',eventRv:'陰謀被識破',riskUp:'手段太髒毀名聲',riskRv:'被反將一軍',timeUp:'需要智取的時機',timeRv:'詭計被拆穿',personUp:'足智多謀的策略家',personRv:'搬石頭砸自己的人'});
  D(55,{coreUp:'走過困境後的平靜',coreRv:'還在風暴中',psycheUp:'鬆了一口氣',psycheRv:'看不到盡頭',eventUp:'搬到安全的地方、渡過危機',eventRv:'還在掙扎中',riskUp:'傷痕還在，別急著忘',riskRv:'可能需要求助',timeUp:'最壞的已過去',timeRv:'還需要撐一下',personUp:'渡過難關的倖存者',personRv:'還在風雨中的人'});
  D(56,{coreUp:'被自己的思想困住',coreRv:'找到出路',psycheUp:'焦慮、過度思考',psycheRv:'突然想開了',eventUp:'失眠、心理壓力大、自我設限',eventRv:'心結解開、走出思維陷阱',riskUp:'在腦子裡打轉出不來',riskRv:'還有一些殘留的擔憂',timeUp:'困擾期',timeRv:'突破期',personUp:'困在自己思維裡的人',personRv:'打開牢籠的人'});
  D(57,{coreUp:'需要面對不想面對的事',coreRv:'逃避真相',psycheUp:'知道該面對但害怕',psycheRv:'假裝看不見',eventUp:'被監控、資訊洩露、需要透明',eventRv:'隱瞞或自欺',riskUp:'遲早要面對',riskRv:'拖越久越嚴重',timeUp:'真相浮現的時刻',timeRv:'繼續逃避',personUp:'被迫面對真相的人',personRv:'把頭埋進沙裡的人'});
  D(58,{coreUp:'多慮但沒有行動',coreRv:'開始減少不必要的擔心',psycheUp:'焦慮到失眠',psycheRv:'學會放下焦慮',eventUp:'半夜想太多、壓力夢、精神內耗',eventRv:'情況比想像的好',riskUp:'焦慮影響健康',riskRv:'還有殘留的不安',timeUp:'深夜或凌晨（最焦慮的時段）',timeRv:'天亮了',personUp:'半夜睡不著的焦慮者',personRv:'學會跟焦慮共處的人'});
  D(59,{coreUp:'痛苦的結束，被迫接受',coreRv:'最壞的已經過去了',psycheUp:'絕望感，覺得沒有出路',psycheRv:'觸底反彈的希望',eventUp:'被開除、被甩、跌到谷底',eventRv:'從谷底爬起來',riskUp:'放棄希望',riskRv:'還有後遺症',timeUp:'最低點',timeRv:'開始回升',personUp:'被命運重擊的人',personRv:'浴火重生的人'});

  // ═══ 錢幣 PENTACLES (土) id:64-77 ═══
  D(64,{coreUp:'實質的新機會，財富的種子',coreRv:'機會來了但抓不住',psycheUp:'務實且有企圖心',psycheRv:'錯過或不重視眼前的機會',eventUp:'新工作offer、投資機會、實質收入',eventRv:'財務機會流失',riskUp:'只播種不耕耘',riskRv:'太保守錯過',timeUp:'播種期',timeRv:'還沒準備好接住',personUp:'腳踏實地的創業者',personRv:'眼高手低的人'});
  D(65,{coreUp:'在多個事務間取得平衡',coreRv:'失去平衡、疲於奔命',psycheUp:'靈活變通',psycheRv:'什麼都做但什麼都做不好',eventUp:'兼差、多工、時間管理',eventRv:'優先順序混亂',riskUp:'太多球在空中',riskRv:'哪個球都接不住',timeUp:'忙碌但可控',timeRv:'需要斷捨離',personUp:'多才多藝的斜槓族',personRv:'被瑣事淹沒的人'});
  D(66,{coreUp:'團隊合作帶來成果',coreRv:'團隊合作出問題',psycheUp:'認為合作比單打獨鬥好',psycheRv:'對團隊失去信心',eventUp:'接到合作案、師徒關係、技能提升',eventRv:'合作不愉快、被排擠',riskUp:'過度依賴團隊',riskRv:'獨來獨往錯過資源',timeUp:'學習期',timeRv:'磨合期',personUp:'優秀的團隊成員',personRv:'無法融入團隊的人'});
  D(67,{coreUp:'守住已有的資源',coreRv:'過度執著或吝嗇',psycheUp:'安全感來自物質',psycheRv:'缺乏安全感',eventUp:'存錢、保守投資、守住底線',eventRv:'過度囤積或捨不得花',riskUp:'太保守錯過增長',riskRv:'因小失大',timeUp:'守成期',timeRv:'需要放手',personUp:'穩健的理財者',personRv:'守財奴'});
  D(68,{coreUp:'經歷困難後的相互扶持',coreRv:'走出困境、有人伸出援手',psycheUp:'感到孤立和排斥',psycheRv:'開始接受幫助',eventUp:'失業、經濟困難、被排擠',eventRv:'找到支持系統',riskUp:'一直困在匱乏心態',riskRv:'不好意思求助',timeUp:'低谷期',timeRv:'有人會來幫你',personUp:'困難中互相取暖的人',personRv:'學會開口求助的人'});
  D(69,{coreUp:'慷慨分享帶來富足',coreRv:'施與受的失衡',psycheUp:'給予讓我快樂',psycheRv:'被佔便宜或不懂感恩',eventUp:'捐款、加薪、獎學金、貴人給予資源',eventRv:'借出去的錢收不回來',riskUp:'給太多消耗自己',riskRv:'封閉不願分享',timeUp:'豐收期',timeRv:'需要重新平衡',personUp:'慷慨的給予者',personRv:'施恩圖報或被佔便宜的人'});
  D(70,{coreUp:'長期努力終於看到成果',coreRv:'付出但回報不成比例',psycheUp:'踏實的成就感',psycheRv:'付出得不到認可的委屈',eventUp:'收成、回本、事業穩定',eventRv:'報酬不符期望',riskUp:'把自我價值綁在報酬上',riskRv:'被低估了不敢爭取',timeUp:'收穫期',timeRv:'需要重新議價',personUp:'埋頭苦幹終於出頭的人',personRv:'勞多獲少的人'});
  D(71,{coreUp:'耐心等待的投資期',coreRv:'不耐煩或放棄',psycheUp:'相信時間會給答案',psycheRv:'對回報失去信心',eventUp:'長線投資、等待升值、進修中',eventRv:'投資失利、半途而廢',riskUp:'等太久機會成本高',riskRv:'太早放棄',timeUp:'中長期',timeRv:'需要重新評估期限',personUp:'有耐心的投資者',personRv:'急功近利的人'});
  D(72,{coreUp:'物質與精神的完美平衡',coreRv:'物質豐富但精神空虛',psycheUp:'富足且自在',psycheRv:'有錢但不快樂',eventUp:'財務自由、傳承、優質生活',eventRv:'用錢填補空虛',riskUp:'炫富或驕傲',riskRv:'失去生活重心',timeUp:'穩定的富足期',timeRv:'需要找回意義',personUp:'既富且貴的人',personRv:'金玉其外的人'});
  D(73,{coreUp:'家族財富與世代傳承',coreRv:'家族問題或遺產糾紛',psycheUp:'歸屬感和傳承使命',psycheRv:'家族壓力',eventUp:'繼承、家族事業、買房置產',eventRv:'遺產爭議、家族企業問題',riskUp:'被家族期望綁住',riskRv:'家產散掉',timeUp:'長期傳承',timeRv:'需要處理家族事務',personUp:'家族的守護者',personRv:'被家族紛爭困擾的人'});

  console.log('[DEEP] 小阿爾克那 56 張深度解讀已載入');
})();

// ══ 16 張宮廷牌 DEEP（補齊 78/78）══
(function(){
  if (typeof TAROT_DEEP === 'undefined') return;
  function D(id, o) { TAROT_DEEP[id] = o; }

  // 權杖宮廷（id 32-35）
  D(32,{coreUp:'火元素的初學者：有熱情但不穩定',coreRv:'三分鐘熱度',psycheUp:'對新事物充滿好奇',psycheRv:'注意力分散',eventUp:'收到好消息、開始新學習',eventRv:'消息延遲',riskUp:'做太多但完成太少',riskRv:'失去興趣',timeUp:'起步期',timeRv:'等待更好時機',personUp:'熱情的新手',personRv:'三分鐘熱度的人'});
  D(33,{coreUp:'火焰被風助燃，極致行動力',coreRv:'衝動無腦',psycheUp:'想到就做的魄力',psycheRv:'根本沒想過後果',eventUp:'搬家、旅行、突然的冒險',eventRv:'車禍或魯莽行為',riskUp:'燒得太快燒完了',riskRv:'闖禍',timeUp:'非常快',timeRv:'太急反而誤事',personUp:'風火般的行動者',personRv:'魯莽的冒失鬼'});
  D(34,{coreUp:'火中的滋養力，熱情且有包容',coreRv:'控制慾或嫉妒',psycheUp:'溫暖自信的領導力',psycheRv:'佔有慾過強',eventUp:'創業成功、被信任、成為核心人物',eventRv:'情緒失控或嫉妒爆發',riskUp:'把溫暖變成控制',riskRv:'用熱情窒息別人',timeUp:'穩定中帶有熱力',timeRv:'情緒風暴期',personUp:'魅力型領袖',personRv:'佔有慾強的人'});
  D(35,{coreUp:'純粹的火焰意志力',coreRv:'暴君或獨裁',psycheUp:'絕對的自信和決斷',psycheRv:'不聽勸的固執',eventUp:'創業領導、大刀闊斧改革',eventRv:'獨裁引發反抗',riskUp:'太霸道失人心',riskRv:'眾叛親離',timeUp:'快速決斷',timeRv:'需要緩一下',personUp:'有遠見的領袖',personRv:'一言堂的暴君'});

  // 聖杯宮廷
  D(46,{coreUp:'情感的新芽，純真的感受力',coreRv:'情緒不成熟',psycheUp:'對世界充滿好奇和善意',psycheRv:'玻璃心',eventUp:'初戀、第一次被感動',eventRv:'過度敏感受傷',riskUp:'太天真被傷',riskRv:'情緒反應過度',timeUp:'萌芽期',timeRv:'尚未成熟',personUp:'純真的孩子',personRv:'情緒化的小孩'});
  D(47,{coreUp:'帶著愛的邀請',coreRv:'虛假的承諾',psycheUp:'浪漫理想化',psycheRv:'畫大餅',eventUp:'告白、求婚、浪漫驚喜',eventRv:'空頭支票',riskUp:'太浪漫不切實際',riskRv:'被騙感情',timeUp:'邀請期',timeRv:'先觀望',personUp:'浪漫的追求者',personRv:'不可靠的情人'});
  D(48,{coreUp:'純粹的情感直覺力',coreRv:'情緒失控或依賴',psycheUp:'深層的共情和直覺',psycheRv:'被情緒淹沒',eventUp:'藝術創作、心靈連結、直覺準確',eventRv:'情緒化決策',riskUp:'替別人的情緒負責',riskRv:'失去自我邊界',timeUp:'順著感覺走',timeRv:'先穩定情緒',personUp:'有共感力的療癒者',personRv:'情緒勒索的人'});
  D(49,{coreUp:'情感的成熟智慧',coreRv:'冷漠或情感操控',psycheUp:'外冷內熱的深沉',psycheRv:'用冷靜掩蓋冷漠',eventUp:'成為情感上的支柱',eventRv:'情感操控或封閉',riskUp:'太壓抑自己',riskRv:'變得不近人情',timeUp:'沉穩期',timeRv:'需要打開心房',personUp:'沉穩的靈魂伴侶',personRv:'情感操控者'});

  // 寶劍宮廷（id 60-63）
  D(60,{coreUp:'思維的新學徒',coreRv:'多疑或散播謠言',psycheUp:'好奇心旺盛',psycheRv:'偷窺或八卦',eventUp:'調查、學習新知、發現真相',eventRv:'散播未經證實的消息',riskUp:'知道太多反而危險',riskRv:'成為是非製造機',timeUp:'調查期',timeRv:'先查證再說',personUp:'機靈的偵探',personRv:'搬弄是非的人'});
  D(61,{coreUp:'思維的極速風暴',coreRv:'口無遮攔或魯莽言行',psycheUp:'思維極快但缺乏同理',psycheRv:'用言語當武器',eventUp:'辯論獲勝、快速解決問題',eventRv:'傷人的話或衝動決定',riskUp:'嘴太快傷感情',riskRv:'變成霸凌者',timeUp:'快到讓人措手不及',timeRv:'急煞車',personUp:'犀利的辯論家',personRv:'嘴巴很毒的人'});
  D(62,{coreUp:'以直覺輔助理性的洞察力',coreRv:'冷漠或疏離',psycheUp:'獨立清醒',psycheRv:'孤獨成為習慣',eventUp:'做出理性但艱難的決定',eventRv:'太冷漠傷害親近的人',riskUp:'高處不勝寒',riskRv:'沒人敢靠近',timeUp:'需要冷靜判斷的時刻',timeRv:'別把自己隔絕太久',personUp:'冷靜的決策者',personRv:'冰山美人'});
  D(63,{coreUp:'最高的理性權威',coreRv:'冷酷無情',psycheUp:'以邏輯和公正為最高原則',psycheRv:'完全沒有感情的機器',eventUp:'法律判決、高層決策',eventRv:'不近人情的裁決',riskUp:'正確但不一定對',riskRv:'用權力壓人',timeUp:'審判時刻',timeRv:'上訴期',personUp:'公正的法官',personRv:'冷血的獨裁者'});

  // 錢幣宮廷
  D(74,{coreUp:'踏實學習物質世界的規則',coreRv:'好高騖遠',psycheUp:'認真且務實',psycheRv:'眼高手低',eventUp:'實習、學徒、開始存錢',eventRv:'不切實際的計畫',riskUp:'學太慢跟不上',riskRv:'根本不想從基層做起',timeUp:'學習期',timeRv:'還沒準備好',personUp:'認真的學徒',personRv:'嫌苦嫌累的人'});
  D(75,{coreUp:'穩扎穩打的行動力',coreRv:'速度太慢錯過機會',psycheUp:'相信穩定就是最好的策略',psycheRv:'固執不知變通',eventUp:'按計畫推進、穩定收入',eventRv:'項目進度落後',riskUp:'太慢被超越',riskRv:'市場變了你還沒動',timeUp:'按部就班',timeRv:'需要加速',personUp:'可靠的執行者',personRv:'慢到讓人急死的人'});
  D(76,{coreUp:'大地的滋養與富足',coreRv:'物質主義或過度操心',psycheUp:'享受生活中的美好',psycheRv:'用物質填補不安',eventUp:'投資回報、環境改善、懷孕',eventRv:'過度消費或擔心錢',riskUp:'太安逸失去上進心',riskRv:'用錢買安全感',timeUp:'豐收享受期',timeRv:'需要節制',personUp:'懂得生活的富人',personRv:'購物成癮的人'});
  D(77,{coreUp:'物質世界的最高掌控者',coreRv:'守財奴或過度物質化',psycheUp:'以穩健的手腕累積財富',psycheRv:'只看錢不看人',eventUp:'事業頂峰、投資成功、財務自由',eventRv:'為了錢失去重要的東西',riskUp:'把錢看得比什麼都重',riskRv:'富裕但孤獨',timeUp:'收成期',timeRv:'該思考錢以外的事了',personUp:'成功的企業家',personRv:'眼裡只有錢的人'});

  console.log('[DEEP] 宮廷牌 16 張深度解讀已載入，78/78 完成');
})();


// ══════════════════════════════════════════════════════════════════════
// 10. 牌陣自適應佈局 — 覆寫 initTarotDeck + pickCard + showSpread
// ══════════════════════════════════════════════════════════════════════
(function() {

  // ── 注入 CSS（一次性）──
  if (!document.getElementById('jy-spread-css')) {
    var st = document.createElement('style');
    st.id = 'jy-spread-css';
    st.textContent = [
      '#t-chosen .jy-wrap{display:flex;flex-direction:column;align-items:center;gap:10px;padding:12px 0;width:100%}',
      '#t-chosen .jy-row{display:flex;justify-content:center;gap:10px;flex-wrap:wrap}',
      '#t-chosen .jy-col{display:flex;flex-direction:column;align-items:center;gap:8px}',
      '#t-chosen .jy-lbl{font-size:.65rem;color:var(--c-gold,#c9a84c);font-weight:600}',
      '#t-chosen .jy-arrow{font-size:.6rem;color:var(--c-text-dim,#888);text-align:center;opacity:.5}',
      // 覆蓋 .tarot-chosen-slot 的 position:absolute
      '#t-chosen .jy-wrap .tarot-chosen-slot{position:relative!important;width:62px!important;height:92px!important;border:1px solid rgba(212,175,55,.15)!important;border-radius:8px!important;display:flex!important;align-items:center!important;justify-content:center!important;flex-direction:column!important;flex-shrink:0!important;background:rgba(212,175,55,.03)!important;box-shadow:0 0 8px rgba(212,175,55,.04)!important}',
      '#t-chosen .jy-wrap .tarot-chosen-slot .slot-label{position:absolute;bottom:-14px;font-size:.48rem;color:rgba(212,175,55,.4);white-space:nowrap;text-align:center;width:80px;left:50%;transform:translateX(-50%);opacity:.7}',
      '#t-chosen .jy-wrap .tarot-chosen-slot .slot-num{font-size:.55rem;opacity:.3;color:rgba(212,175,55,.3)}'
    ].join('\n');
    document.head.appendChild(st);
  }

  function S(id, num, label) {
    return '<div class="tarot-chosen-slot" id="t-slot-'+id+'"><span class="slot-num">'+num+'</span><span class="slot-label">'+label+'</span></div>';
  }

  function buildSlotLayout(spreadId, def) {
    if (!def) return null;
    var P = def.positions || [];
    function pn(i) { return P[i] ? P[i].name : ''; }
    var h = '<div class="jy-wrap">';

    if (spreadId === 'celtic_cross') {
      // ── 凱爾特十字：經典排列 ──
      // 上：5(顯性目標)
      // 中：4(近期過去) - 1+2(核心+阻礙疊放) - 6(近期走向)
      // 下：3(根因)
      // 右柱（Staff）從下到上：7 8 9 10
      h += '<style>#t-chosen .jy-celtic{display:grid;grid-template-columns:70px 70px 70px 16px 70px;grid-template-rows:auto auto auto;gap:8px 6px;align-items:center;justify-content:center}';
      h += '#t-chosen .jy-celtic .gc-top{grid-column:2;grid-row:1;justify-self:center}';
      h += '#t-chosen .jy-celtic .gc-left{grid-column:1;grid-row:2;justify-self:center}';
      h += '#t-chosen .jy-celtic .gc-center{grid-column:2;grid-row:2;justify-self:center;position:relative}';
      h += '#t-chosen .jy-celtic .gc-right{grid-column:3;grid-row:2;justify-self:center}';
      h += '#t-chosen .jy-celtic .gc-bottom{grid-column:2;grid-row:3;justify-self:center}';
      h += '#t-chosen .jy-celtic .gc-staff{grid-column:5;grid-row:1/4;display:flex;flex-direction:column-reverse;align-items:center;gap:6px}</style>';
      h += '<div class="jy-celtic">';
      h += '<div class="gc-top">' + S(4,5,pn(4)) + '</div>';
      h += '<div class="gc-left">' + S(3,4,pn(3)) + '</div>';
      h += '<div class="gc-center">' + S(0,1,pn(0)) + '<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%) rotate(90deg);opacity:.5;pointer-events:none;z-index:1">' + S(1,2,'') + '</div></div>';
      h += '<div class="gc-right">' + S(5,6,pn(5)) + '</div>';
      h += '<div class="gc-bottom">' + S(2,3,pn(2)) + '</div>';
      h += '<div class="gc-staff">' + S(6,7,pn(6)) + S(7,8,pn(7)) + S(8,9,pn(8)) + S(9,10,pn(9)) + '</div>';
      h += '</div>';
    }
    else if (spreadId === 'tree_of_life') {
      // ── 生命之樹：卡巴拉 Sephiroth 排列 ──
      //        1(Kether)
      //    2(Chokmah)  3(Binah)
      //    4(Chesed)   5(Geburah)
      //        6(Tiphereth)
      //    7(Netzach)  8(Hod)
      //        9(Yesod)
      //       10(Malkuth)
      h += '<style>#t-chosen .jy-tol{display:flex;flex-direction:column;align-items:center;gap:8px}';
      h += '#t-chosen .jy-tol .tol-pair{display:flex;gap:24px;justify-content:center}</style>';
      h += '<div class="jy-tol">';
      h += S(0,1,pn(0));
      h += '<div class="tol-pair">' + S(1,2,pn(1)) + S(2,3,pn(2)) + '</div>';
      h += '<div class="tol-pair">' + S(3,4,pn(3)) + S(4,5,pn(4)) + '</div>';
      h += S(5,6,pn(5));
      h += '<div class="tol-pair">' + S(6,7,pn(6)) + S(7,8,pn(7)) + '</div>';
      h += S(8,9,pn(8));
      h += S(9,10,pn(9));
      h += '</div>';
    }
    else if (spreadId === 'zodiac') {
      // ── 黃道十二宮：圓形 12 宮 + 中心總結牌 ──
      h += '<style>#t-chosen .jy-zodiac{position:relative;width:320px;height:320px;margin:0 auto}';
      h += '#t-chosen .jy-zodiac .zod-slot{position:absolute;transform:translate(-50%,-50%)}';
      h += '#t-chosen .jy-zodiac .zod-slot .tarot-chosen-slot{width:46px!important;height:68px!important}';
      h += '#t-chosen .jy-zodiac .zod-center{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%)}</style>';
      h += '<div class="jy-zodiac">';
      // 12 宮按圓形排列（從 270° 即頂部開始，逆時針對應占星宮位）
      for (var zi = 0; zi < 12; zi++) {
        var angle = (270 + zi * 30) * Math.PI / 180;
        var cx = 50 + 42 * Math.cos(angle);
        var cy = 50 + 42 * Math.sin(angle);
        h += '<div class="zod-slot" style="left:' + cx.toFixed(1) + '%;top:' + cy.toFixed(1) + '%">' + S(zi, zi+1, (zi+1)+'宮') + '</div>';
      }
      // 第 13 張：中心總結
      h += '<div class="zod-center">' + S(12, 13, '總結') + '</div>';
      h += '</div>';
    }
    else if (spreadId === 'minor_arcana') {
      // ── 小阿卡那 7 牌：兩排 ──
      h += '<div class="jy-row">' + S(0,1,pn(0)) + S(1,2,pn(1)) + S(2,3,pn(2)) + S(3,4,pn(3)) + '</div>';
      h += '<div class="jy-row">' + S(4,5,pn(4)) + S(5,6,pn(5)) + S(6,7,pn(6)) + '</div>';
    }
    else if (spreadId === 'three_card') {
      h += '<div class="jy-row">' + S(0,1,pn(0)) + S(1,2,pn(1)) + S(2,3,pn(2)) + '</div>';
      h += '<div class="jy-arrow">← 過去 ─ 現在 ─ 未來 →</div>';
    }
    else if (spreadId === 'five_card') {
      h += '<div class="jy-row">' + S(0,1,pn(0)) + S(1,2,pn(1)) + S(2,3,pn(2)) + '</div>';
      h += '<div class="jy-row">' + S(3,4,pn(3)) + S(4,5,pn(4)) + '</div>';
    }
    else if (spreadId === 'cross') {
      h += '<div class="jy-row">' + S(2,3,pn(2)) + S(0,1,pn(0)) + S(3,4,pn(3)) + '</div>';
      h += S(1,2,pn(1));
      h += S(4,5,pn(4));
    }
    else if (spreadId === 'either_or') {
      h += S(0,1,pn(0));
      h += '<div class="jy-row" style="gap:24px">';
      h += '<div class="jy-col"><div class="jy-lbl">A 選項</div>' + S(1,2,pn(1)) + S(3,4,pn(3)) + '</div>';
      h += '<div class="jy-col"><div class="jy-lbl">B 選項</div>' + S(2,3,pn(2)) + S(4,5,pn(4)) + '</div>';
      h += '</div>';
    }
    else if (spreadId === 'relationship') {
      h += '<div class="jy-row" style="gap:20px">';
      h += '<div class="jy-col"><div class="jy-lbl">你</div>' + S(0,1,pn(0)) + '</div>';
      h += '<div class="jy-col"><div class="jy-lbl">對方</div>' + S(1,2,pn(1)) + '</div>';
      h += '</div>';
      h += S(2,3,pn(2));
      h += '<div class="jy-row">' + S(3,4,pn(3)) + S(4,5,pn(4)) + S(5,6,pn(5)) + '</div>';
    }
    else if (spreadId === 'timeline') {
      h += '<div class="jy-row">';
      for (var i = 0; i < 5; i++) h += S(i,i+1,pn(i));
      h += '</div>';
      h += '<div class="jy-arrow">← 過去 ─── 轉折 ─── 結果 →</div>';
    }
    else {
      h += '<div class="jy-row">';
      for (var i = 0; i < def.count; i++) h += S(i,i+1,pn(i));
      h += '</div>';
    }
    h += '</div>';
    return h;
  }
  window.buildSlotLayout = buildSlotLayout;

  // ── 覆寫 initTarotDeck ──
  var _origInitTarotDeck = window.initTarotDeck;
  window.initTarotDeck = function() {
    var def = (typeof getCurrentSpreadDef === 'function') ? getCurrentSpreadDef() : null;
    var spreadId = (typeof getCurrentSpread === 'function') ? getCurrentSpread() : 'celtic_cross';
    var targetCount = def ? def.count : 10;

    _origInitTarotDeck();

    // ── 小阿卡那專用：過濾掉大阿爾克那 ──
    if (def && def.deckFilter === 'minor_only' && typeof deckShuffled !== 'undefined') {
      deckShuffled = deckShuffled.filter(function(c) { return c.suit !== 'major'; });
      // 重新渲染牌組 UI（3D 雙排結構）
      var deckWrap = document.getElementById('t-deck');
      if (deckWrap) {
        // 觸發重新初始化牌堆渲染
        var half = Math.ceil(deckShuffled.length / 2);
        var topHtml = '', botHtml = '';
        for (var fi = 0; fi < half; fi++) {
          var d = (fi * 0.13).toFixed(2);
          var imgUrl = (typeof getTarotCardImage === 'function') ? getTarotCardImage(deckShuffled[fi]) : '';
          var faceCss = imgUrl ? 'background-image:url(' + imgUrl + ')' : 'background:#1a1a2e';
          topHtml += '<div class="tarot-deck-card" data-idx="' + fi + '" style="--float-delay:' + d + 's"><div class="tarot-deck-card-inner"><div class="tdc-face" style="' + faceCss + '"></div><div class="tdc-back"></div></div></div>';
        }
        for (var fi = half; fi < deckShuffled.length; fi++) {
          var d = ((fi - half) * 0.13).toFixed(2);
          var imgUrl = (typeof getTarotCardImage === 'function') ? getTarotCardImage(deckShuffled[fi]) : '';
          var faceCss = imgUrl ? 'background-image:url(' + imgUrl + ')' : 'background:#1a1a2e';
          botHtml += '<div class="tarot-deck-card" data-idx="' + fi + '" style="--float-delay:' + d + 's"><div class="tarot-deck-card-inner"><div class="tdc-face" style="' + faceCss + '"></div><div class="tdc-back"></div></div></div>';
        }
        deckWrap.className = 'tarot-3d-stage';
        var bgHtml = '<div class="tarot-stage-bg">';
        for (var bi = 1; bi <= 6; bi++) bgHtml += '<div class="tarot-stage-bg-img" style="background-image:url(\'img/tarot-bg-' + bi + '.jpg\')"></div>';
        bgHtml += '</div>';
        deckWrap.innerHTML = bgHtml +
          '<div class="tarot-3d-row tarot-3d-top" id="t-row-top">' + topHtml + topHtml + '</div>' +
          '<div class="tarot-3d-row tarot-3d-bot" id="t-row-bot">' + botHtml + botHtml + '</div>';
        deckWrap.querySelectorAll('.tarot-deck-card').forEach(function(el) {
          el.addEventListener('click', function() { pickCard(parseInt(el.dataset.idx), el); });
        });
        // ★ v28：3D 觸控修復——stage 層級捕獲 touch
        (function(dw){
          var _tm2 = false;
          dw.addEventListener('touchstart', function(){ _tm2 = false; }, {passive:true});
          dw.addEventListener('touchmove', function(){ _tm2 = true; }, {passive:true});
          dw.addEventListener('touchend', function(e){
            if (_tm2) return;
            var touch = e.changedTouches && e.changedTouches[0];
            if (!touch) return;
            var tx = touch.clientX, ty = touch.clientY;
            var best = null, bestDist = 999999;
            dw.querySelectorAll('.tarot-deck-card:not(.picked)').forEach(function(card){
              var r = card.getBoundingClientRect();
              var cx = r.left + r.width/2, cy = r.top + r.height/2;
              var dist = Math.sqrt((tx-cx)*(tx-cx)+(ty-cy)*(ty-cy));
              if (tx >= r.left-20 && tx <= r.right+20 && ty >= r.top-20 && ty <= r.bottom+20) {
                if (dist < bestDist) { bestDist = dist; best = card; }
              }
            });
            if (best) { e.preventDefault(); pickCard(parseInt(best.dataset.idx), best); }
          });
        })(deckWrap);
        if (typeof _startDeck3D === 'function') _startDeck3D(half, deckShuffled.length - half);

        // ★ v28：重新渲染後重置洗牌狀態
        window._deckIsShuffled = false;
        // v64.B:tarot.js 已建立按鈕並綁定 v64.B 動畫
        //   這裡只在 tarot.js 沒建按鈕時做 fallback(極少觸發)
        var sfExist = document.getElementById('jy-shuffle-btn');
        if (!sfExist) {
          var shuffleWrap2 = document.querySelector('#step-2 .text-center');
          if (shuffleWrap2) {
            var sfBtn2 = document.createElement('button');
            sfBtn2.className = 'jy-shuffle-btn';
            sfBtn2.id = 'jy-shuffle-btn';
            sfBtn2.innerHTML = '🌙 靜月為你洗牌';
            shuffleWrap2.insertBefore(sfBtn2, shuffleWrap2.firstChild);
            var autoDrawBtn2 = document.querySelector('#step-2 .btn-outline');
            if (autoDrawBtn2) autoDrawBtn2.style.display = 'none';
            var pickHint2 = document.getElementById('pick-hint');
            if (pickHint2) pickHint2.innerHTML = '✨ 滑動欣賞牌面 ✨';
            sfBtn2.addEventListener('click', function() {
              if (window._deckIsShuffled) return;
              sfBtn2.style.pointerEvents = 'none';
              sfBtn2.style.opacity = '0';
              // ═══════════════════════════════════════════════════════════
              // v64.B 華麗三幕式洗牌動畫(對齊七維儀式設計)
              //   第 1-2 次:完整 2.8 秒(收攏 0.8 + 洗牌 1.2 + 散開 0.8)
              //   第 3 次起:compact 模式 0.8 秒(只播散開)
              //   全程「跳過 →」按鈕可隨時略過
              // ═══════════════════════════════════════════════════════════
              _v64bTarotShuffleRitual(deckWrap, function() {
                window._deckIsShuffled = true;
                sfBtn2.remove();
                if (autoDrawBtn2) autoDrawBtn2.style.display = '';
                if (pickHint2) {
                  pickHint2.innerHTML = '觸碰任一張你有感覺的牌,選出 <span id="t-target-count">' + targetCount + '</span> 張';
                }
              });
            });
          }
        }
      }
    }

    var customLayout = buildSlotLayout(spreadId, def);
    if (customLayout) {
      var chosen = document.getElementById('t-chosen');
      if (chosen) chosen.innerHTML = customLayout;
    }

    // 更新說明文字
    try {
      var descEl = document.querySelector('#step-2 .text-dim.text-sm.mb-sm');
      var deckTotal = (def && def.deckFilter === 'minor_only') ? '56' : '78';
      if (descEl) descEl.innerHTML = '凝神冥想你的問題，然後從 <strong class="text-gold">' + deckTotal + '</strong> 張塔羅牌中選出 <strong class="text-gold">' + targetCount + '</strong> 張牌';
      var countEl = document.getElementById('t-remain-text');
      if (countEl) countEl.innerHTML = '已選 <strong id="t-remain-picked" class="text-gold">0</strong> / ' + targetCount + ' 張';
      var pickHint = document.getElementById('pick-hint');
      if (pickHint) pickHint.textContent = '觸碰任一張你有感覺的牌，選出 ' + targetCount + ' 張';
    } catch(e) {}
  };

  // ── 覆寫 pickCard — 非凱爾特牌陣的完成判定 ──
  var _origPickCard2 = window.pickCard;
  window.pickCard = function(deckIdx, deckEl) {
    var def = (typeof getCurrentSpreadDef === 'function') ? getCurrentSpreadDef() : null;
    var targetCount = def ? def.count : 10;
    if (drawnCards.length >= targetCount) return;

    _origPickCard2(deckIdx, deckEl);

    if (targetCount < 10) {
      setTimeout(function() {
        if (drawnCards.length >= targetCount) {
          var btn = document.getElementById('btn-analyze');
          if (btn) btn.disabled = false;
          var hint = document.getElementById('pick-hint');
          if (hint) hint.style.display = 'none';
          S.tarot = S.tarot || {};
          S.tarot.drawn = drawnCards;
          S.tarot.spread = drawnCards;
          // 更新 t-spread-sec 的標題
          var titleText = document.getElementById('t-spread-title-text');
          if (titleText && def) titleText.textContent = def.zh;
          if (typeof showSpread === 'function') showSpread();
          setTimeout(function() {
            var act = document.querySelector('#step-2 .actions');
            if (act) act.scrollIntoView({behavior:'smooth', block:'center'});
          }, 400);
        }
      }, 600);
    }
  };

  // ── 覆寫 showSpread 的標題更新 ──
  var _origShowSpread2 = showSpread;
  showSpread = function() {
    // 更新 t-spread-sec 的硬編碼標題
    var def = (typeof getCurrentSpreadDef === 'function') ? getCurrentSpreadDef() : null;
    var titleText = document.getElementById('t-spread-title-text');
    if (titleText && def) titleText.textContent = def.zh;
    // 呼叫原版
    if (_origShowSpread2) _origShowSpread2();
  };

  console.log('[牌陣] 自適應佈局 v2 + 完成判定已啟用');
})();


// ══════════════════════════════════════════════════════════════════════
// 9. 開鑰之法 (Opening of the Key) — 正統金色黎明核心計算引擎
// ══════════════════════════════════════════════════════════════════════
// 修正版 v2.0：
// - 單一副牌跑全五階段（不重新洗牌）
// - Op1：模擬切四堆（YHVH），堆大小不均等
// - Op2/Op3：按牌的 GD 星座歸屬分配到 12 宮/12 星座
// - Op4：按牌的 GD 旬(decan)歸屬分配到 36 旬
// - Op5：按牌的 GD 生命之樹歸屬分配到 10 Sephiroth
// - 計數值修正：宮廷牌 Knight=4,Queen=4,King=4,Page/Princess=7
// - Ace 計數值 = 5（GD 標準，與 Crowley 一致）
// - 花色名稱修正：匹配 tarot.js 的 'wand'/'cup'/'sword'/'pent'
// ══════════════════════════════════════════════════════════════════════

(function() {
  'use strict';

  // ════════════════════════════════════════════════
  // GD 大阿爾克那歸屬表（完整 22 張）
  // ════════════════════════════════════════════════
  // type: 'element'|'planet'|'zodiac'
  // sign: 對應的星座（zodiac 類型）
  // planet: 對應的行星（planet 類型）
  // element: 對應的元素（element 類型）
  // sephirah: 生命之樹路徑（22 paths 連接的 Sephiroth）
  // decan: 不適用（大阿爾克那不分配到旬）
  var TRUMP_GD = {
    0:  {type:'element', element:'風',     count:3,  sign:null,   path:'Kether-Chokmah'},     // 愚者=風
    1:  {type:'planet',  planet:'水星',    count:9,  sign:null,   path:'Kether-Binah'},       // 魔術師=水星
    2:  {type:'planet',  planet:'月亮',    count:9,  sign:null,   path:'Kether-Tiphereth'},   // 女祭司=月亮
    3:  {type:'planet',  planet:'金星',    count:9,  sign:null,   path:'Chokmah-Binah'},      // 皇后=金星
    4:  {type:'zodiac',  sign:'牡羊',      count:12, planet:null, path:'Chokmah-Tiphereth'},  // 皇帝=牡羊
    5:  {type:'zodiac',  sign:'金牛',      count:12, planet:null, path:'Chokmah-Chesed'},     // 教皇=金牛
    6:  {type:'zodiac',  sign:'雙子',      count:12, planet:null, path:'Binah-Tiphereth'},    // 戀人=雙子
    7:  {type:'zodiac',  sign:'巨蟹',      count:12, planet:null, path:'Binah-Geburah'},      // 戰車=巨蟹
    8:  {type:'zodiac',  sign:'獅子',      count:12, planet:null, path:'Chesed-Geburah'},     // 力量=獅子 (GD: VIII=Strength=Leo)
    9:  {type:'zodiac',  sign:'處女',      count:12, planet:null, path:'Chesed-Tiphereth'},   // 隱者=處女
    10: {type:'planet',  planet:'木星',    count:9,  sign:null,   path:'Chesed-Netzach'},     // 命運之輪=木星
    11: {type:'zodiac',  sign:'天秤',      count:12, planet:null, path:'Geburah-Tiphereth'},  // 正義=天秤 (GD: XI=Justice=Libra)
    12: {type:'element', element:'水',     count:3,  sign:null,   path:'Geburah-Hod'},        // 吊人=水
    13: {type:'zodiac',  sign:'天蠍',      count:12, planet:null, path:'Tiphereth-Netzach'},  // 死神=天蠍
    14: {type:'zodiac',  sign:'射手',      count:12, planet:null, path:'Tiphereth-Yesod'},    // 節制=射手
    15: {type:'zodiac',  sign:'摩羯',      count:12, planet:null, path:'Tiphereth-Hod'},      // 惡魔=摩羯
    16: {type:'planet',  planet:'火星',    count:9,  sign:null,   path:'Netzach-Hod'},        // 塔=火星
    17: {type:'zodiac',  sign:'水瓶',      count:12, planet:null, path:'Netzach-Yesod'},      // 星星=水瓶
    18: {type:'zodiac',  sign:'雙魚',      count:12, planet:null, path:'Netzach-Malkuth'},    // 月亮=雙魚
    19: {type:'planet',  planet:'太陽',    count:9,  sign:null,   path:'Hod-Yesod'},          // 太陽=太陽
    20: {type:'element', element:'火',     count:3,  sign:null,   path:'Hod-Malkuth'},        // 審判=火
    21: {type:'planet',  planet:'土星',    count:9,  sign:null,   path:'Yesod-Malkuth'}       // 世界=土星
  };

  // ════════════════════════════════════════════════
  // ★ GD-3 (J1) 補:16 Court Cards 的 well-dignified / ill-dignified 變體含義
  // 依據:Mathers《Book T》1888 原始手稿
  // 用法:GD 系統用「鄰牌元素」決定 well/ill,而非正逆位
  //   - 雙鄰同元素或友好元素 = well-dignified → 顯示 well_meaning
  //   - 雙鄰對立元素 = ill-dignified → 顯示 ill_meaning
  //   - 一鄰友好一鄰對立 = neutral → 兩者皆需考慮
  // ════════════════════════════════════════════════
  var COURT_DIGNITY_MEANINGS = {
    // 權杖宮廷
    'wand-king':   { // Knight of Wands (Lord of Flame and Lightning)
      well: '活躍、慷慨、驕傲、迅速、衝動 — 火之火,意志最純粹的表達',
      ill:  '邪惡、殘忍、偏見、暴戾 — 衝動失控變成霸凌、蠻橫'
    },
    'wand-queen':  { // Queen of Thrones of Flame
      well: '適應力強、持續能量、平靜權威、有吸引力、慷慨但不容忍 — 穩定的火',
      ill:  '頑固、復仇心、支配慾、暴政、會無故反目'
    },
    'wand-knight': { // Prince of Chariot of Fire
      well: '快速強壯、衝動但正義、慷慨幽默 — 行動派貴族',
      ill:  '驕傲、不容忍、殘忍、懦弱、偏見 — 表面強硬內心脆弱'
    },
    'wand-page':   { // Princess of Shining Flame
      well: '個人主義、聰穎大膽、表達力強、熱情 — 火的種子',
      ill:  '膚淺、戲劇化、殘忍、不穩定、不可靠 — 火花一閃即逝'
    },
    // 聖杯宮廷
    'cup-king':    { // Knight of Waves (Lord of Waters)
      well: '優雅、詩意、金星特質、慵懶但被激發後熱情 — 水中的火',
      ill:  '感官沉溺、懶惰、不誠實 — 情感被慾望腐蝕'
    },
    'cup-queen':   { // Queen of Thrones of Waters
      well: '富想像力、詩意、善良、深愛但不願為他人勞累 — 水的精華',
      ill:  '善變、易受影響、懶散、想像強過真實感受 — 沉溺幻夢'
    },
    'cup-knight':  { // Prince of Chariot of Water
      well: '微妙、暴力但隱藏、強烈但秘密的力量 — 水中的風',
      ill:  '極端邪惡、無情、隱藏的危險 — 水底暗流變成毒'
    },
    'cup-page':    { // Princess of Waters
      well: '甜美、詩意、溫柔、富想像、夢幻、善良 — 水的本質',
      ill:  '自私、奢華、沉溺感官 — 溫柔變成黏膩控制'
    },
    // 寶劍宮廷
    'sword-king':  { // Knight of Wind and Breezes
      well: '主動、機敏、靈巧、勇敢、熟練 — 風之火,思維的劍',
      ill:  '欺騙、暴政、狡詐、不謹慎、分裂 — 機敏變陰險'
    },
    'sword-queen': { // Queen of Thrones of Air
      well: '極度敏銳、憎恨虛偽、敏感、機智、自信 — 風中的水',
      ill:  '殘忍、欺騙、不可靠、頑固、狹隘 — 銳利變成刻薄'
    },
    'sword-knight':{ // Prince of Chariot of Winds
      well: '充滿想法、思想細膩、敏捷、富表現力 — 風的純粹',
      ill:  '無能、完全沒有想法、缺乏判斷 — 思想變成空轉'
    },
    'sword-page':  { // Princess of Rushing Winds
      well: '智慧、力量、機智、熟練 — 風的種子',
      ill:  '欺騙、低能、無情 — 機智變成刻薄與小聰明'
    },
    // 金幣宮廷
    'pent-king':   { // Knight of Wide and Fertile Land
      well: '勤勞、耐心、有條不紊、值得信賴、緩慢但確實 — 土之火',
      ill:  '愚鈍、唯物、嫉妒、遲緩 — 穩定變成停滯'
    },
    'pent-queen':  { // Queen of Thrones of Earth
      well: '慷慨、聰明、富有、寬厚、慈悲、誠實 — 土的精華',
      ill:  '懶惰、奴性、無聊、漠不關心 — 富足變成怠惰'
    },
    'pent-knight': { // Prince of Chariot of Earth
      well: '可信賴、能勞動、有實際技能、很少野心過度 — 土中的風',
      ill:  '愚鈍、唯物主義、緩慢、怨恨 — 實際變成短視'
    },
    'pent-page':   { // Princess of Echoing Hills
      well: '慷慨、善良、勤勉、慈悲、有耐心、深思 — 土的種子',
      ill:  '浪費、揮霍、揮霍 — 慷慨變成不負責'
    }
  };

  // ════════════════════════════════════════════════
  // ★ GD-4 (I1+I2) 補:Court Cards 三層讀法 (Mathers Book T 明文)
  // 原文:「the Knights and Queens almost invariably represent actual men and women
  //       connected with the subject in hand. But the Kings sometimes represent
  //       either the coming on or going off of a matter, arrival, or departure,
  //       according to the way in which they face. While the Knaves show opinions,
  //       thoughts, or ideas, either in harmony with or opposed to the subject.」
  // 用法:依花色 + 階級給 AI 三種讀法選項
  // ════════════════════════════════════════════════
  var COURT_PERSON_ROLE = {
    'queen': '近乎一定是實際相關的女性人物 (成熟、有影響力、年齡 30+)',
    'knight':'(RWS King) 近乎一定是實際相關的男性人物,有時也代表「事情的接近或離開」(看面向方向)',
    'king':  '(RWS King) 近乎一定是實際相關的男性人物,有時也代表「事情的接近或離開」(看面向方向)',
    'page':  '(GD Knave/Princess) 通常代表「想法、意見、訊息」而非具體人物;若代表人物則為年輕女性或孩童'
  };

  // ════════════════════════════════════════════════
  // ★ GD-8 補:Mathers《The Tarot》1888 原書 56 張小牌完整原始牌義 + Major
  // 依據:Mathers, S.L. MacGregor (1888) "The Tarot, Its Occult Signification..."
  // 用法:作為 Book T(Mathers/Felkin 1888 後期版)的「另一條傳統解讀」參考
  //   - Mathers 1888 = 早期義大利傳統 + Etteilla 修飾
  //   - Book T = 後期 GD 內部 Adeptus Minor 用的進階版
  //   - 兩者牌義有時不同(如 Six of Cups, Three of Pentacles),提供 AI 多角度判讀
  // 透過 ai-analysis.js 注入 cards[i].mathersUp / mathersRv
  // ════════════════════════════════════════════════
  var MATHERS_1888_MEANINGS = {
    // ── 22 大牌 (Mathers 1888 簡明牌義) ──
    '愚者':       { up:'愚行、贖罪、搖擺',                    rv:'猶豫、不穩、由此產生的麻煩' },
    '魔術師':     { up:'意志、意志力、靈巧',                  rv:'意志用於邪惡、意志薄弱、狡詐、欺騙' },
    '女祭司':     { up:'科學、智慧、知識、教育',              rv:'自負、無知、笨拙、淺薄知識' },
    '皇后':       { up:'行動、計畫、行動力、主動',            rv:'惰性、力量浪費、缺乏專注、猶豫' },
    '皇帝':       { up:'實現、結果、發展',                    rv:'停滯、阻礙、不成熟、未成熟' },
    '教皇':       { up:'仁慈、恩澤、善良',                    rv:'過度仁慈、軟弱、愚蠢的慷慨' },
    '戀人':       { up:'明智的安排、考驗、克服試煉',          rv:'不智的計畫、考驗中失敗' },
    '戰車':       { up:'勝利、戰勝障礙',                      rv:'被推翻、最後關頭被障礙征服' },
    '正義':       { up:'平衡、公正、公道',                    rv:'偏執、失衡、濫用正義、過度嚴苛、偏見' },
    '隱者':       { up:'謹慎、小心、深思熟慮',                rv:'過度謹慎、膽怯、恐懼' },
    '命運之輪':   { up:'好運、成功、意外的幸運',              rv:'厄運、失敗、意外的不幸' },
    '力量':       { up:'力量、強壯、能力、堅毅',              rv:'濫用權力、傲慢、缺乏勇氣' },
    '吊人':       { up:'自我犧牲、奉獻、被束縛',              rv:'自私、解開束縛、不完全的犧牲' },
    '死神':       { up:'死亡、改變、轉化、惡化',              rv:'死亡僥倖逃過、部分改變、向好的轉變' },
    '節制':       { up:'結合、整合、聯合',                    rv:'不智的結合、分裂、利益衝突' },
    '惡魔':       { up:'好的命定',                            rv:'壞的命定' },
    '塔':         { up:'毀滅、崩潰、破產、損失',              rv:'以上各點程度較輕' },
    '星星':       { up:'希望、期待、光明的承諾',              rv:'希望未實現、期待落空或僅小幅實現' },
    '月亮':       { up:'黃昏、欺騙、錯誤',                    rv:'波動、輕微的欺騙、小錯誤' },
    '太陽':       { up:'幸福、滿足、喜悅',                    rv:'以上各點程度較輕' },
    '審判':       { up:'更新、結果、事情的決定',              rv:'結果延遲、拖延、事情之後重啟' },
    '世界':       { up:'完成、好的回報',                      rv:'壞的回報、報應' },
    // ── 權杖 Wands (王牌→十) ──
    '權杖王牌':   { up:'誕生、開始、起源、源頭',              rv:'迫害、追擊、暴力、煩惱、殘酷、暴政' },
    '權杖二':     { up:'財富、運氣、富足、宏偉、輝煌',        rv:'驚訝、震驚、突發事件、不尋常事件' },
    '權杖三':     { up:'進取、事業、商業、貿易、談判',        rv:'希望、慾望、嘗試、願望' },
    '權杖四':     { up:'社會、結合、結社、和諧',              rv:'繁榮、成功、幸福、優勢' },
    '權杖五':     { up:'金、財富、利益、繼承、財運、金錢',    rv:'法律訴訟、判決、官司、律師、法庭' },
    '權杖六':     { up:'嘗試、希望、慾望、心願、期待',        rv:'不忠、背叛、不忠誠、欺騙' },
    '權杖七':     { up:'成功、收益、優勢、利潤、勝利',        rv:'猶豫、懷疑、躊躇、困窘、焦慮' },
    '權杖八':     { up:'理解、觀察、方向',                    rv:'爭吵、內部紛爭、不和' },
    '權杖九':     { up:'秩序、紀律、好的安排、布局',          rv:'障礙、麻煩、延遲、不悅' },
    '權杖十':     { up:'信任、安全、榮譽、誠信',              rv:'背叛、藉口、欺騙、阻礙' },
    // ── 權杖宮廷 ──
    '權杖侍者':   { up:'好的陌生人、好消息、樂趣、滿足',      rv:'壞消息、不悅、煩躁、憂慮' },
    '權杖騎士':   { up:'離別、分離、不和',                    rv:'破裂、不和、爭吵' },
    '權杖皇后':   { up:'鄉間婦人、莊園女主人、愛財、貪婪、放高利',rv:'好且貞潔的婦人,但嚴格節儉、障礙、阻力、反對' },
    '權杖國王':   { up:'住在鄉間的男人、鄉紳、知識、教養',    rv:'天性善良但嚴厲的男人、忠告、建議、深思熟慮' },
    // ── 聖杯 Cups (王牌→十) ──
    '聖杯王牌':   { up:'宴飲、宴會、好心情',                  rv:'改變、新奇、變化、無常' },
    '聖杯二':     { up:'愛、依戀、友誼、真誠、感情',          rv:'慾望受阻、障礙、反對、阻撓' },
    '聖杯三':     { up:'成功、勝利、勝出、有利結果',          rv:'業務迅速進展、敏捷、機警' },
    '聖杯四':     { up:'倦怠、不悅、不滿、不滿意',            rv:'新交、推測、徵兆、預感' },
    '聖杯五':     { up:'結合、聯姻、繼承',                    rv:'到來、回歸、消息、驚訝、虛偽計畫' },
    '聖杯六':     { up:'過去、已過去、消逝、消失',            rv:'未來、即將到來、不久、很快' },
    '聖杯七':     { up:'想法、感觸、反思、計畫',              rv:'設計、決議、決定' },
    '聖杯八':     { up:'金髮少女、友誼、依附、溫柔',          rv:'歡樂、宴飲、喜悅、樂趣' },
    '聖杯九':     { up:'勝利、優勢、成功、凱旋、克服困難',    rv:'過錯、錯誤、失誤、缺陷' },
    '聖杯十':     { up:'居住的城鎮、榮譽、尊重、聲望、美德',  rv:'戰鬥、衝突、反對、分歧、爭執' },
    // ── 聖杯宮廷 ──
    '聖杯侍者':   { up:'金髮青年、信心、誠實、謹慎、正直',    rv:'阿諛奉承者、欺騙、詭計' },
    '聖杯騎士':   { up:'到來、接近、推進',                    rv:'雙重性、濫用信任、欺詐、狡猾' },
    '聖杯皇后':   { up:'金髮女子、成功、幸福、優勢、樂趣',    rv:'地位好但好管閒事、不可信任的女人' },
    '聖杯國王':   { up:'金髮男子、善良、慷慨、寬厚',          rv:'地位好但行為不一的男人、不信任、懷疑、疑慮' },
    // ── 寶劍 Swords (王牌→十) ──
    '寶劍王牌':   { up:'凱旋、豐饒、富裕、繁榮',              rv:'困窘、愚蠢無望的愛、障礙、阻撓' },
    '寶劍二':     { up:'友誼、勇敢、堅定、勇氣',              rv:'虛偽朋友、背叛、謊言' },
    '寶劍三':     { up:'修女、分離、移除、決裂、爭吵',        rv:'(可能僅意味某物丟失或暫時錯位)' },
    '寶劍四':     { up:'孤獨、隱退、被遺棄、隱士',            rv:'節省、預防、開支管理' },
    '寶劍五':     { up:'哀悼、悲傷、苦難',                    rv:'損失、麻煩(正逆位含義相同)' },
    '寶劍六':     { up:'特使、信使、航行、旅行',              rv:'宣告、求愛、揭示、驚訝' },
    '寶劍七':     { up:'希望、信心、慾望、嘗試、心願',        rv:'明智的建議、好的勸告、智慧、謹慎' },
    '寶劍八':     { up:'疾病、誹謗、批評、責備',              rv:'過去的背叛、事件、意外、值得注意的事件' },
    '寶劍九':     { up:'神職人員、牧師、良知、誠實、誠信',    rv:'明智的不信任、懷疑、恐懼、可疑人物' },
    '寶劍十':     { up:'眼淚、苦難、悲傷、憂愁',              rv:'短暫的成功、暫時的優勢' },
    // ── 寶劍宮廷 ──
    '寶劍侍者':   { up:'間諜、監視、權威',                    rv:'未預見的事、警覺、支援(也可能=意外的禮物或意外的悲傷)' },
    '寶劍騎士':   { up:'軍人、職業武人、技巧、能力、敏捷',    rv:'自負的傻瓜、天真、簡單' },
    '寶劍皇后':   { up:'寡婦、損失、剝奪、缺席、分離',        rv:'壞女人、易怒偏執、富裕但有不和、富足卻憂慮' },
    '寶劍國王':   { up:'律師、法律人、權力、命令、優越、權威',rv:'惡人、煩惱、憂慮、悲傷、恐懼、不安' },
    // ── 金幣 Pentacles (王牌→十) ──
    '金幣王牌':   { up:'完美的滿足、福樂、繁榮、凱旋',        rv:'金幣袋、金錢、收益、幫助、利潤、財富' },
    '金幣二':     { up:'尷尬、煩惱、困難',                    rv:'信件、訊息、書信、消息' },
    '金幣三':     { up:'高貴、提升、尊嚴、地位、權力',        rv:'子女、兒女、年輕人、開始' },
    '金幣四':     { up:'樂趣、歡愉、享受、滿足',              rv:'障礙、阻礙' },
    '金幣五':     { up:'戀人或情人、愛、甜蜜、感情、純潔的愛',rv:'丟臉的愛、輕率、放縱、放蕩' },
    '金幣六':     { up:'禮物、贈與、喜悅',                    rv:'野心、慾望、激情、目標、渴望' },
    '金幣七':     { up:'金錢、財務、寶藏、收益、利潤',        rv:'紛擾、煩惱、焦慮、憂鬱' },
    '金幣八':     { up:'深色頭髮少女、美麗、坦白、貞潔、純真',rv:'阿諛、放高利、虛偽、不可靠' },
    '金幣九':     { up:'謹慎、慎重、明智、辨別力',            rv:'欺騙、不誠信、詭計、欺瞞' },
    '金幣十':     { up:'家、住所、居處、家庭',                rv:'賭博、揮霍、搶劫、損失' },
    // ── 金幣宮廷 ──
    '金幣侍者':   { up:'深色頭髮青年、節省、有條理、規則、管理',rv:'揮霍、浪費、糟蹋、放縱(下一張牌會說明在哪方面揮霍)' },
    '金幣騎士':   { up:'有用的人、可信任、智慧、節省、秩序',  rv:'勇敢但失業、懶散、不工作、疏忽' },
    '金幣皇后':   { up:'深色頭髮婦人、慷慨女性、寬厚、靈魂偉大、慷慨大方',rv:'必然的邪惡、可疑的女人、應被懷疑的女人' },
    '金幣國王':   { up:'深色頭髮男人、勝利、勇敢、勇氣、成功',rv:'年老有惡習的男人、危險的人、懷疑、恐懼、危險' }
  };

  // ════════════════════════════════════════════════
  // GD 小阿爾克那歸屬表
  // ════════════════════════════════════════════════

  // 花色→元素（匹配 tarot.js 的 suit 名稱）
  var SUIT_ELEMENT = { 'wand':'火', 'cup':'水', 'sword':'風', 'pent':'土' };

  // Ace 歸屬：各元素的精華，分配到對應的 Kether
  // 數字牌 2-10：按旬(decan)分配到星座
  // 宮廷牌：按 GD 體系分配到星座跨度

  // ── 數字牌 2-10 的旬歸屬（GD 標準）──
  // 格式：{suit, rank} → {sign, decanIdx(0-35), sephirah}
  // 牌對應 Sephirah: Ace=Kether, 2=Chokmah, 3=Binah, 4=Chesed, 5=Geburah,
  //                  6=Tiphereth, 7=Netzach, 8=Hod, 9=Yesod, 10=Malkuth
  var RANK_SEPHIRAH = {
    'ace':0, '2':1, '3':2, '4':3, '5':4, '6':5, '7':6, '8':7, '9':8, '10':9
  };

  // GD 36 旬對照表（按黃道順序，每星座 3 旬）
  // index 0-35, 與 DECAN_MAP 一致
  // 每個旬對應一張數字牌(2-10)
  var DECAN_CARDS = {
    // 火-權杖: 牡羊=2,3,4; 獅子=5,6,7; 射手=8,9,10
    'wand-2': {sign:'牡羊',decan:0},  'wand-3': {sign:'牡羊',decan:1},  'wand-4': {sign:'牡羊',decan:2},
    'wand-5': {sign:'獅子',decan:12}, 'wand-6': {sign:'獅子',decan:13}, 'wand-7': {sign:'獅子',decan:14},
    'wand-8': {sign:'射手',decan:24}, 'wand-9': {sign:'射手',decan:25}, 'wand-10':{sign:'射手',decan:26},
    // 水-聖杯: 巨蟹=2,3,4; 天蠍=5,6,7; 雙魚=8,9,10
    'cup-2':  {sign:'巨蟹',decan:9},  'cup-3':  {sign:'巨蟹',decan:10}, 'cup-4':  {sign:'巨蟹',decan:11},
    'cup-5':  {sign:'天蠍',decan:21}, 'cup-6':  {sign:'天蠍',decan:22}, 'cup-7':  {sign:'天蠍',decan:23},
    'cup-8':  {sign:'雙魚',decan:33}, 'cup-9':  {sign:'雙魚',decan:34}, 'cup-10': {sign:'雙魚',decan:35},
    // 風-寶劍: 天秤=2,3,4; 水瓶=5,6,7; 雙子=8,9,10
    'sword-2':{sign:'天秤',decan:18}, 'sword-3':{sign:'天秤',decan:19}, 'sword-4':{sign:'天秤',decan:20},
    'sword-5':{sign:'水瓶',decan:30}, 'sword-6':{sign:'水瓶',decan:31}, 'sword-7':{sign:'水瓶',decan:32},
    'sword-8':{sign:'雙子',decan:6},  'sword-9':{sign:'雙子',decan:7},  'sword-10':{sign:'雙子',decan:8},
    // 土-錢幣: 摩羯=2,3,4; 金牛=5,6,7; 處女=8,9,10
    'pent-2': {sign:'摩羯',decan:27}, 'pent-3': {sign:'摩羯',decan:28}, 'pent-4': {sign:'摩羯',decan:29},
    'pent-5': {sign:'金牛',decan:3},  'pent-6': {sign:'金牛',decan:4},  'pent-7': {sign:'金牛',decan:5},
    'pent-8': {sign:'處女',decan:15}, 'pent-9': {sign:'處女',decan:16}, 'pent-10':{sign:'處女',decan:17}
  };

  // ── 宮廷牌的星座跨度（GD 標準）──
  // GD 宮廷牌跨越兩個星座的最後一旬和下一個星座的前兩旬
  // King(GD Knight)=火的火, Queen=水的火, Knight(GD Prince)=風的火, Page(GD Princess)=土的火
  var COURT_SIGN = {
    // 權杖宮廷
    'wand-king':   {signs:['射手','牡羊'], primary:'射手'},  // 火之火：射手21°-牡羊20°
    'wand-queen':  {signs:['雙魚','牡羊'], primary:'牡羊'},  // 火之水：雙魚21°-牡羊20°→修正
    'wand-knight': {signs:['巨蟹','獅子'], primary:'獅子'},  // 火之風
    'wand-page':   {signs:['火'],          primary:'火'},    // 火之土（公主=整個元素象限）
    // 聖杯宮廷
    'cup-king':    {signs:['雙魚','巨蟹'], primary:'雙魚'},
    'cup-queen':   {signs:['雙子','巨蟹'], primary:'巨蟹'},
    'cup-knight':  {signs:['天秤','天蠍'], primary:'天蠍'},
    'cup-page':    {signs:['水'],          primary:'水'},
    // 寶劍宮廷
    'sword-king':  {signs:['金牛','雙子'], primary:'雙子'},
    'sword-queen': {signs:['處女','天秤'], primary:'天秤'},
    'sword-knight':{signs:['摩羯','水瓶'], primary:'水瓶'},
    'sword-page':  {signs:['風'],          primary:'風'},
    // 錢幣宮廷
    'pent-king':   {signs:['獅子','處女'], primary:'處女'},
    'pent-queen':  {signs:['射手','摩羯'], primary:'摩羯'},
    'pent-knight': {signs:['牡羊','金牛'], primary:'金牛'},
    'pent-page':   {signs:['土'],          primary:'土'}
  };

  // ═══ v55：宮廷牌面向表（Directional Dignity）═══
  // 依 RWS 圖像實測分類（Parsifal's Wheel Tarot 2018 實測 + TarotPugs 三分法）
  // 'left'=圖像主要方向面左；'right'=面右；'forward'=正面/中性
  // ★ 重要規則：正位=原本面向；逆位=面向反轉（Golden Dawn Book T 原文：inverted court = 180度轉向）
  var COURT_FACING = {
    'wand-king':   'left',     'wand-queen':  'right',
    'wand-knight': 'left',     'wand-page':   'right',
    'cup-king':    'forward',  'cup-queen':   'left',
    'cup-knight':  'right',    'cup-page':    'left',
    'sword-king':  'forward',  'sword-queen': 'right',
    'sword-knight':'left',     'sword-page':  'right',
    'pent-king':   'forward',  'pent-queen':  'left',
    'pent-knight': 'right',    'pent-page':   'forward'
  };

  // 取得宮廷牌實際面向（考慮正逆位反轉）
  function getCourtFacing(card) {
    if (!card) return null;
    var s = card.suit || '';
    var r = String(card.rank || '');
    if (s === 'major') return null; // 大牌不適用
    if (!(r === 'king' || r === 'queen' || r === 'knight' || r === 'page')) return null; // 只看宮廷牌
    var key = s + '-' + r;
    var baseFacing = COURT_FACING[key] || 'forward';
    // 正逆位反轉
    var isUp = (card.isUp === true);
    if (!isUp) {
      if (baseFacing === 'left') return 'right';
      if (baseFacing === 'right') return 'left';
      // forward 逆位 = 扭頭/回頭看——標記為 'averted'（避開視線）
      return 'averted';
    }
    return baseFacing;
  }

  // Directional Dignity 分析（v55）
  // 輸入：一串牌 + 特定位置（通常是 Significator 或某宮廷牌）
  // 輸出：該位置宮廷牌跟左右鄰的互動關係
  function computeDirectionalDignity(cards, idx) {
    if (!cards || !cards.length || idx < 0 || idx >= cards.length) return null;
    var self = cards[idx];
    var selfFacing = getCourtFacing(self);
    if (!selfFacing) return null; // 不是宮廷牌
    var leftN = (idx > 0) ? cards[idx - 1] : null;
    var rightN = (idx < cards.length - 1) ? cards[idx + 1] : null;
    var leftFacing = leftN ? getCourtFacing(leftN) : null;
    var rightFacing = rightN ? getCourtFacing(rightN) : null;
    var result = {
      card: self.n || self.name,
      facing: selfFacing,
      leftNeighbor: leftN ? (leftN.n || leftN.name) : null,
      leftFacing: leftFacing,
      rightNeighbor: rightN ? (rightN.n || rightN.name) : null,
      rightFacing: rightFacing,
      interactions: []
    };
    // 左鄰是宮廷牌：判斷對望關係
    if (leftN && leftFacing) {
      if (selfFacing === 'left' && leftFacing === 'right') {
        result.interactions.push({
          with: 'left',
          type: 'mutual_gaze',
          label: '互相對望',
          meaning: '與左側人物（' + (leftN.n || leftN.name) + '）有直接互動——對話、合作、或衝突都可能，是這段關係的活躍雙方'
        });
      } else if (selfFacing === 'right' && leftFacing === 'right') {
        result.interactions.push({
          with: 'left',
          type: 'same_direction',
          label: '同向前進',
          meaning: '與左側人物（' + (leftN.n || leftN.name) + '）朝同方向——並肩前進，但沒有互相注意'
        });
      } else if (selfFacing === 'left' && leftFacing === 'left') {
        result.interactions.push({
          with: 'left',
          type: 'back_turned',
          label: '背對對方',
          meaning: '與左側人物（' + (leftN.n || leftN.name) + '）互相背對——疏離、無溝通、或各自抽身'
        });
      } else if (selfFacing === 'right' && leftFacing === 'left') {
        result.interactions.push({
          with: 'left',
          type: 'diverging',
          label: '分道揚鑣',
          meaning: '與左側人物（' + (leftN.n || leftN.name) + '）背道而馳——關係正在走散'
        });
      } else if (selfFacing === 'averted' || leftFacing === 'averted') {
        result.interactions.push({
          with: 'left',
          type: 'averted',
          label: '避開視線',
          meaning: '跟左側人物有張力但不直面——話沒說開的狀態'
        });
      }
    }
    // 右鄰是宮廷牌：判斷對望關係
    if (rightN && rightFacing) {
      if (selfFacing === 'right' && rightFacing === 'left') {
        result.interactions.push({
          with: 'right',
          type: 'mutual_gaze',
          label: '互相對望',
          meaning: '與右側人物（' + (rightN.n || rightN.name) + '）有直接互動——對話、合作、或衝突，活躍雙方'
        });
      } else if (selfFacing === 'right' && rightFacing === 'right') {
        result.interactions.push({
          with: 'right',
          type: 'same_direction',
          label: '同向前進',
          meaning: '與右側人物（' + (rightN.n || rightN.name) + '）朝同方向——並肩但沒有互相注意'
        });
      } else if (selfFacing === 'left' && rightFacing === 'right') {
        result.interactions.push({
          with: 'right',
          type: 'diverging',
          label: '分道揚鑣',
          meaning: '與右側人物（' + (rightN.n || rightN.name) + '）背道而馳——關係正在走散'
        });
      } else if (selfFacing === 'left' && rightFacing === 'left') {
        result.interactions.push({
          with: 'right',
          type: 'back_turned',
          label: '背對對方',
          meaning: '與右側人物（' + (rightN.n || rightN.name) + '）互相背對——疏離、無溝通'
        });
      } else if (selfFacing === 'averted' || rightFacing === 'averted') {
        result.interactions.push({
          with: 'right',
          type: 'averted',
          label: '避開視線',
          meaning: '跟右側人物有張力但不直面——話沒說開'
        });
      }
    }
    // Significator 的面向含義（本身）
    var selfMeaning;
    if (selfFacing === 'left') selfMeaning = '朝向過去——還在處理之前的事件/關係';
    else if (selfFacing === 'right') selfMeaning = '朝向未來——準備邁步/期待新階段';
    else if (selfFacing === 'averted') selfMeaning = '正面逆位——閃避現狀、不想直面這件事';
    else selfMeaning = '正面面對——站在當下、直面當前局面';
    result.selfMeaning = selfMeaning;
    return result;
  }

  // 星座→宮位映射（自然宮位）
  var SIGN_HOUSE = {
    '牡羊':1,'金牛':2,'雙子':3,'巨蟹':4,'獅子':5,'處女':6,
    '天秤':7,'天蠍':8,'射手':9,'摩羯':10,'水瓶':11,'雙魚':12
  };
  var SIGNS_ORDER = ['牡羊','金牛','雙子','巨蟹','獅子','處女','天秤','天蠍','射手','摩羯','水瓶','雙魚'];

  // ════════════════════════════════════════════════
  // 取得牌的 GD 歸屬
  // ════════════════════════════════════════════════

  function getCardGD(card) {
    if (!card) return {};
    var s = card.suit || '';
    var r = String(card.rank || '');

    // 大阿爾克那
    if (s === 'major') {
      var gd = TRUMP_GD[card.id] || {};
      return {
        type: gd.type || 'unknown',
        sign: gd.sign || null,
        element: gd.element || null,
        planet: gd.planet || null,
        path: gd.path || null,
        count: gd.count || 3,
        decan: null,
        sephirah: null // 大阿爾克那走路徑，不直接對應 Sephirah
      };
    }

    // Ace
    if (r === 'ace') {
      var aceEl = SUIT_ELEMENT[s] || '';
      return {
        type: 'ace',
        sign: null,
        element: aceEl,
        // ★ v68.21.8 修正:Mathers Book T 1888 + Crowley Liber 78 官方明文 Aces=11
        //   舊版預設 5 是錯的(可能是早期誤把 Ace 當小牌按 pip),官方兩個源頭都是 11
        //   For Aces, count 11. — Book T pg.50 / Liber 78 First Operation step 6
        count: 11,
        decan: null,
        sephirah: 'Kether' // Ace = Kether
      };
    }

    // 數字牌 2-10
    var numRank = parseInt(r);
    if (numRank >= 2 && numRank <= 10) {
      var dk = s + '-' + r;
      var decanInfo = DECAN_CARDS[dk] || {};
      var sephIdx = RANK_SEPHIRAH[r];
      var SEPH_NAMES = ['Kether','Chokmah','Binah','Chesed','Geburah','Tiphereth','Netzach','Hod','Yesod','Malkuth'];
      return {
        type: 'number',
        sign: decanInfo.sign || null,
        element: SUIT_ELEMENT[s] || '',
        count: numRank,
        decan: decanInfo.decan != null ? decanInfo.decan : null,
        sephirah: SEPH_NAMES[sephIdx] || null
      };
    }

    // 宮廷牌
    var courtKey = s + '-' + r;
    var courtInfo = COURT_SIGN[courtKey] || {};
    var courtCount = (r === 'page') ? 7 : 4; // Page/Princess=7, 其他=4
    return {
      type: 'court',
      sign: courtInfo.primary || null,
      signs: courtInfo.signs || [],
      element: SUIT_ELEMENT[s] || '',
      count: courtCount,
      decan: null,
      sephirah: null // 宮廷牌不直接對應 Sephirah
    };
  }

  // ════════════════════════════════════════════════
  // 計數值
  // ════════════════════════════════════════════════

  function getCountValue(card) {
    var gd = getCardGD(card);
    return gd.count || 1;
  }

  // ════════════════════════════════════════════════
  // 元素尊嚴（Elemental Dignities）
  // ════════════════════════════════════════════════

  // ED_MAP v55：按 Book T 原文修正
  // Book T 原文：「Cards of opposite natures on either side weaken it greatly.」
  //              「Swords are inimical to Pentacles. Wands are inimical to Cups.」
  //              「Swords are friendly with Cups and Wands. Wands are friendly with Swords and Pentacles.」
  // 只有三類：同元素強化 / 友好 / 敵對（沒有 neutral——這是 Book T 明確的）
  var ED_MAP = {
    // 同元素：強化（strengthen）
    '火+火':'strengthen','水+水':'strengthen',
    '風+風':'strengthen','土+土':'strengthen',
    // 對立元素（火水、風土）：敵對削弱（weaken）
    '火+水':'weaken','水+火':'weaken',
    '風+土':'weaken','土+風':'weaken',
    // 其他組合全部為友好（friendly）——按 Book T 原文
    '火+風':'friendly','風+火':'friendly',
    '水+土':'friendly','土+水':'friendly',
    '火+土':'friendly','土+火':'friendly',
    '水+風':'friendly','風+水':'friendly'
  };

  // Triad 強度打分（v55）：-3 最弱 到 +3 最強
  // 規則：
  //   兩側同元素 = +3（大幅強化，好壞都放大）
  //   兩側跟中間同元素 = +3
  //   兩側全部友好 = +1
  //   一側友好一側敵對 = 0（抵消）
  //   兩側跟中間敵對 = -3（大幅削弱，可忽略）
  //   兩側互相敵對（火+水 或 風+土）但跟中間不敵對 = -1（兩側內耗，中間牌反而獨立）
  function computeTriadStrength(card, leftN, rightN) {
    if (!card) return 0;
    var cEl = getCardElement(card);
    var leftEl = leftN ? getCardElement(leftN) : '';
    var rightEl = rightN ? getCardElement(rightN) : '';
    var lEd = (leftN && leftEl && cEl) ? (ED_MAP[cEl + '+' + leftEl] || 'friendly') : 'none';
    var rEd = (rightN && rightEl && cEl) ? (ED_MAP[cEl + '+' + rightEl] || 'friendly') : 'none';
    // 兩側都沒有（邊緣牌）返回 0
    if (lEd === 'none' && rEd === 'none') return 0;
    // 只有單側（邊緣牌）
    if (lEd === 'none') {
      if (rEd === 'strengthen') return 2;
      if (rEd === 'weaken') return -2;
      return 0;
    }
    if (rEd === 'none') {
      if (lEd === 'strengthen') return 2;
      if (lEd === 'weaken') return -2;
      return 0;
    }
    // 雙側都有
    if (lEd === 'strengthen' && rEd === 'strengthen') return 3;
    if (lEd === 'weaken' && rEd === 'weaken') return -3;
    if ((lEd === 'strengthen' && rEd === 'weaken') || (lEd === 'weaken' && rEd === 'strengthen')) return 0;
    if (lEd === 'strengthen' && rEd === 'friendly') return 2;
    if (lEd === 'friendly' && rEd === 'strengthen') return 2;
    if (lEd === 'weaken' && rEd === 'friendly') return -2;
    if (lEd === 'friendly' && rEd === 'weaken') return -2;
    if (lEd === 'friendly' && rEd === 'friendly') {
      // 再看左右兩側互為敵對與否
      if (leftEl && rightEl) {
        var lrEd = ED_MAP[leftEl + '+' + rightEl];
        if (lrEd === 'weaken') return -1; // 兩側互相敵對→整體內耗
      }
      return 1;
    }
    return 0;
  }

  function getCardElement(card) {
    if (!card) return '';
    // 先看 GD 歸屬
    var gd = getCardGD(card);
    if (gd.element) return gd.element;
    // 大阿爾克那有些是行星/星座，取其元素
    if (gd.sign) {
      var SE = {'牡羊':'火','金牛':'土','雙子':'風','巨蟹':'水','獅子':'火','處女':'土',
                '天秤':'風','天蠍':'水','射手':'火','摩羯':'土','水瓶':'風','雙魚':'水'};
      return SE[gd.sign] || '';
    }
    // fallback: 花色
    var s = card.suit || '';
    return SUIT_ELEMENT[s] || card.el || '';
  }

  function elementalDignity(card, neighbor) {
    var e1 = getCardElement(card), e2 = getCardElement(neighbor);
    if (!e1 || !e2) return 'neutral';
    return ED_MAP[e1 + '+' + e2] || 'neutral';
  }

  // ════════════════════════════════════════════════
  // Significator 自動選擇（GD 正統）
  // ════════════════════════════════════════════════
  // GD 標準：根據太陽星座的元素 + 性別/年齡選宮廷牌
  // 成年男性=國王(King)，成年女性=皇后(Queen)
  // 年輕男性=騎士(Knight)，年輕女性=侍者(Page)

  var SIGN_ELEMENT_MAP = {
    '牡羊':'火','金牛':'土','雙子':'風','巨蟹':'水',
    '獅子':'火','處女':'土','天秤':'風','天蠍':'水',
    '射手':'火','摩羯':'土','水瓶':'風','雙魚':'水'
  };

  function monthToSign(m, d) {
    d = d || 15;
    if ((m===3&&d>=21)||(m===4&&d<=19)) return '牡羊';
    if ((m===4&&d>=20)||(m===5&&d<=20)) return '金牛';
    if ((m===5&&d>=21)||(m===6&&d<=21)) return '雙子';
    if ((m===6&&d>=22)||(m===7&&d<=22)) return '巨蟹';
    if ((m===7&&d>=23)||(m===8&&d<=22)) return '獅子';
    if ((m===8&&d>=23)||(m===9&&d<=22)) return '處女';
    if ((m===9&&d>=23)||(m===10&&d<=23)) return '天秤';
    if ((m===10&&d>=24)||(m===11&&d<=21)) return '天蠍';
    if ((m===11&&d>=22)||(m===12&&d<=21)) return '射手';
    if ((m===12&&d>=22)||(m===1&&d<=19)) return '摩羯';
    if ((m===1&&d>=20)||(m===2&&d<=18)) return '水瓶';
    return '雙魚';
  }

  var EL_SUIT_MAP = {'火':'wand','水':'cup','風':'sword','土':'pent'};

  function findCourtCard(element, gender, age) {
    if (typeof TAROT === 'undefined') return null;
    var suitTarget = EL_SUIT_MAP[element] || 'cup';
    var rankTarget;
    if (gender === '女' || gender === 'female' || gender === 'F') {
      rankTarget = (age && age < 25) ? 'page' : 'queen';
    } else {
      rankTarget = (age && age < 25) ? 'knight' : 'king';
    }
    for (var i = 0; i < TAROT.length; i++) {
      var c = TAROT[i];
      if (c.suit === suitTarget && c.rank === rankTarget) return c;
    }
    return null;
  }

  function autoSelectSignificator(birthMonth, birthDay, gender, age) {
    var sign = monthToSign(birthMonth, birthDay);
    var el = SIGN_ELEMENT_MAP[sign] || '水';
    var card = findCourtCard(el, gender, age);
    return { card: card, sign: sign, element: el };
  }

  // ════════════════════════════════════════════════
  // Operation 1：四元素分堆（YHVH）
  // ════════════════════════════════════════════════
  // 正統做法：問卜者切成四堆，大小不均等
  // 數位模擬：以隨機切點模擬「直覺切牌」

  function ootkOp1(deck, significatorId) {
    // ★ v64.1 正統 Mathers Book T:「cut each of the packets as nearly in the centre
    //   as possible, putting each uppermost half to the right of and beside the lower
    //   half, thus yielding four packets of nearly equal dimensions.」
    // 正統做法:兩刀切,每刀盡量對半 → 四堆「nearly equal」
    // 78 / 4 = 19.5,正統範圍應該在 19-20 ±3 內(16-22),不是隨意 12-27
    var len = deck.length; // 78
    var MIN_PILE = 16;
    var MAX_PILE = 22;

    // 模擬人手「對半切」的自然偏差:每堆 19.5 ± 2.5,符合 Mathers「nearly equal」
    var sizes = [];
    for (var s = 0; s < 4; s++) {
      sizes.push(Math.round(19.5 + (Math.random() - 0.5) * 5)); // 17 ~ 22
    }
    // 正規化:調整到總和 = len,每堆在 MIN_PILE ~ MAX_PILE
    var diff = len - sizes.reduce(function(a, b) { return a + b; }, 0);
    var safety = 0;
    while (diff !== 0 && safety < 200) {
      var ri = Math.floor(Math.random() * 4);
      if (diff > 0 && sizes[ri] < MAX_PILE) { sizes[ri]++; diff--; }
      else if (diff < 0 && sizes[ri] > MIN_PILE) { sizes[ri]--; diff++; }
      safety++;
    }
    // ★ Bug #33 fix: safety 退出時 sizes 加總可能仍 ≠ 78（極端情況都頂到 MAX/MIN 邊界）
    //   後面 deck[idx++] 會讀到 undefined 造成 piles[pk][pi].id throw
    //   修法：強制把 sizes 校正成加總 = 78（直接從第一堆吸收差額）
    var finalSum = sizes.reduce(function(a, b) { return a + b; }, 0);
    if (finalSum !== len) {
      sizes[0] += (len - finalSum); // 把差額塞給第一堆
      // 萬一第一堆變成負數或太大，做夾擠保險
      if (sizes[0] < 1) {
        // 把 sizes 直接 reset 成 [20, 20, 19, 19] 的合理基準
        sizes = [20, 20, 19, 19];
      }
    }

    // YHVH 四堆：Yod=火, Heh=水, Vav=風, Heh(final)=土
    var pileKeys = ['fire', 'water', 'air', 'earth'];
    var piles = { fire: [], water: [], air: [], earth: [] };
    var idx = 0;
    for (var p = 0; p < 4; p++) {
      for (var i = 0; i < sizes[p]; i++) {
        piles[pileKeys[p]].push(deck[idx++]);
      }
    }

    // 找 Significator 在哪堆
    var activePile = '';
    for (var pk in piles) {
      for (var pi = 0; pi < piles[pk].length; pi++) {
        if (piles[pk][pi].id === significatorId) {
          activePile = pk;
          break;
        }
      }
      if (activePile) break;
    }

    var pileMeaning = {
      fire: '工作、事業、行動、意志',
      water: '愛情、婚姻、快樂、情感',
      air: '煩惱、損失、衝突、思維',
      earth: '金錢、物質、實際事務'
    };

    var activeCards = piles[activePile] || [];
    var sigIdx = activeCards.findIndex(function(c) { return c.id === significatorId; });
    var counted = ootkCounting(activeCards, sigIdx);
    var paired = ootkPairing(activeCards, sigIdx);
    var dignities = ootkDignities(counted.keyCards);

    return {
      piles: { fire: piles.fire.length, water: piles.water.length, air: piles.air.length, earth: piles.earth.length },
      activePile: activePile,
      meaning: pileMeaning[activePile] || '',
      activeCards: activeCards,
      sigIndex: sigIdx,
      keyCards: counted.keyCards,
      countingPath: counted.path,
      pairs: paired,
      dignities: dignities
    };
  }

  // ════════════════════════════════════════════════
  // Operation 2：十二宮位
  // ════════════════════════════════════════════════
  // 正統做法：按牌的 GD 星座歸屬分配到對應宮位
  // 沒有星座歸屬的牌（Ace、元素大牌、行星大牌、Page）→ 按元素分配

  var ELEMENT_HOUSE = { '火':1, '土':2, '風':3, '水':4 }; // 元素牌的預設宮位

  function getCardHouse(card) {
    var gd = getCardGD(card);
    // 有明確星座的 → 對應宮位
    if (gd.sign && SIGN_HOUSE[gd.sign]) return SIGN_HOUSE[gd.sign];
    // 宮廷牌有多個星座 → 取 primary
    if (gd.signs && gd.signs.length > 0 && gd.signs[0] !== '火' && gd.signs[0] !== '水' && gd.signs[0] !== '風' && gd.signs[0] !== '土') {
      var ps = gd.sign || gd.signs[0];
      if (SIGN_HOUSE[ps]) return SIGN_HOUSE[ps];
    }
    // 元素牌/Ace → 按元素分配到對應的基本宮位
    var el = gd.element || getCardElement(card);
    if (ELEMENT_HOUSE[el]) return ELEMENT_HOUSE[el];
    // fallback
    return 1;
  }

  function ootkOp2(deck, significatorId) {
    // ════════════════════════════════════════════════════════════
    // ★ v63 正統 Book T Op2：「Deal cards into twelve stacks, for
    //   the twelve astrological houses of heaven.」 — Mathers Book T
    // 全副 78 張獨立洗牌後依序發到 12 宮，第1張→第1宮、第2張→第2宮...
    // 第13張→第1宮...循環。找 Sig 在哪宮 = 該宮為 active stack
    // ════════════════════════════════════════════════════════════
    var houses = [];
    for (var h = 0; h < 12; h++) houses.push([]);

    deck.forEach(function(card, idx) {
      houses[idx % 12].push(card);
    });

    var activeHouse = -1;
    for (var hi = 0; hi < 12; hi++) {
      if (houses[hi].some(function(c) { return c.id === significatorId; })) {
        activeHouse = hi;
        break;
      }
    }
    // fallback：如果 Sig 不在 active pile（不應該發生）
    if (activeHouse < 0) activeHouse = 0;

    var houseMeanings = [
      '自我、身體、外貌',
      '財務、價值觀、資源',
      '溝通、學習、兄弟',
      '家庭、根基、父親',
      '創造、戀愛、子女、快樂',
      '健康、工作、日常',
      '伴侶、合夥、公開敵人',
      '轉化、共同資產、深層親密',
      '遠方、信仰、高等教育',
      '事業、地位、社會形象',
      '社群、理想、朋友',
      '隱藏、業力、潛意識'
    ];

    var activeCards = houses[activeHouse] || [];
    var sigIdx = activeCards.findIndex(function(c) { return c.id === significatorId; });
    var counted = ootkCounting(activeCards, sigIdx);
    var paired = ootkPairing(activeCards, sigIdx);

    return {
      houseDistribution: houses.map(function(h) { return h.length; }),
      activeHouse: activeHouse + 1,
      meaning: houseMeanings[activeHouse] || '',
      activeCards: activeCards,
      keyCards: counted.keyCards,
      countingPath: counted.path,
      pairs: paired,
      dignities: ootkDignities(counted.keyCards)
    };
  }

  // ════════════════════════════════════════════════
  // Operation 3：十二星座
  // ════════════════════════════════════════════════
  // 正統做法：跟 Op2 類似但重點是星座能量而非人生領域

  function getCardSignIdx(card) {
    var gd = getCardGD(card);
    if (gd.sign) {
      var idx = SIGNS_ORDER.indexOf(gd.sign);
      if (idx >= 0) return idx;
    }
    // 元素牌→對應的 cardinal sign
    var el = gd.element || getCardElement(card);
    var elSign = { '火':'牡羊', '土':'摩羯', '風':'天秤', '水':'巨蟹' };
    if (elSign[el]) return SIGNS_ORDER.indexOf(elSign[el]);
    return 0;
  }

  var SIGN_TRUMPS = [
    {sign:'牡羊',trump:4},{sign:'金牛',trump:5},{sign:'雙子',trump:6},
    {sign:'巨蟹',trump:7},{sign:'獅子',trump:8},{sign:'處女',trump:9},
    {sign:'天秤',trump:11},{sign:'天蠍',trump:13},{sign:'射手',trump:14},
    {sign:'摩羯',trump:15},{sign:'水瓶',trump:17},{sign:'雙魚',trump:18}
  ];

  function ootkOp3(deck, significatorId) {
    // ════════════════════════════════════════════════════════════
    // ★ v63 正統 Book T Op3：「Deal cards into twelve stacks for
    //   the twelve signs of the Zodiac.」 — Mathers Book T
    // 依 GD 對應表把全副 78 張各自落入十二星座、找 Sig 在哪星座
    // ════════════════════════════════════════════════════════════
    var signs = [];
    for (var s = 0; s < 12; s++) signs.push([]);

    deck.forEach(function(card) {
      var si = getCardSignIdx(card);
      signs[si].push(card);
    });

    var activeSign = -1;
    for (var si = 0; si < 12; si++) {
      if (signs[si].some(function(c) { return c.id === significatorId; })) {
        activeSign = si;
        break;
      }
    }

    var activeCards = signs[activeSign] || [];
    var sigIdx = activeCards.findIndex(function(c) { return c.id === significatorId; });
    var counted = ootkCounting(activeCards, sigIdx);
    var paired = ootkPairing(activeCards, sigIdx);

    var st = SIGN_TRUMPS[activeSign] || {};
    var trumpName = '';
    if (typeof TAROT !== 'undefined' && st.trump != null) {
      var t = TAROT.find(function(c) { return c.id === st.trump; });
      if (t) trumpName = t.n;
    }

    return {
      signDistribution: signs.map(function(s) { return s.length; }),
      activeSign: st.sign || SIGNS_ORDER[activeSign] || '',
      signTrump: trumpName,
      signTrumpId: st.trump,
      activeCards: activeCards,
      keyCards: counted.keyCards,
      countingPath: counted.path,
      pairs: paired,
      dignities: ootkDignities(counted.keyCards)
    };
  }

  // ════════════════════════════════════════════════
  // Operation 4：三十六旬（Decan）
  // ════════════════════════════════════════════════
  // 正統做法：按牌的 GD 旬歸屬分配
  // 只有數字牌 2-10 有明確的旬歸屬（36 張 → 36 旬，一對一）
  // 其他牌（大牌、Ace、宮廷牌）→ 按最接近的星座旬分配

  var DECAN_MAP = [
    {sign:'牡羊',range:'0°-10°', planet:'火星'},  {sign:'牡羊',range:'10°-20°',planet:'太陽'},  {sign:'牡羊',range:'20°-30°',planet:'金星'},
    {sign:'金牛',range:'0°-10°', planet:'水星'},  {sign:'金牛',range:'10°-20°',planet:'月亮'},  {sign:'金牛',range:'20°-30°',planet:'土星'},
    {sign:'雙子',range:'0°-10°', planet:'木星'},  {sign:'雙子',range:'10°-20°',planet:'火星'},  {sign:'雙子',range:'20°-30°',planet:'太陽'},
    {sign:'巨蟹',range:'0°-10°', planet:'金星'},  {sign:'巨蟹',range:'10°-20°',planet:'水星'},  {sign:'巨蟹',range:'20°-30°',planet:'月亮'},
    {sign:'獅子',range:'0°-10°', planet:'土星'},  {sign:'獅子',range:'10°-20°',planet:'木星'},  {sign:'獅子',range:'20°-30°',planet:'火星'},
    {sign:'處女',range:'0°-10°', planet:'太陽'},  {sign:'處女',range:'10°-20°',planet:'金星'},  {sign:'處女',range:'20°-30°',planet:'水星'},
    {sign:'天秤',range:'0°-10°', planet:'月亮'},  {sign:'天秤',range:'10°-20°',planet:'土星'},  {sign:'天秤',range:'20°-30°',planet:'木星'},
    {sign:'天蠍',range:'0°-10°', planet:'火星'},  {sign:'天蠍',range:'10°-20°',planet:'太陽'},  {sign:'天蠍',range:'20°-30°',planet:'金星'},
    {sign:'射手',range:'0°-10°', planet:'水星'},  {sign:'射手',range:'10°-20°',planet:'月亮'},  {sign:'射手',range:'20°-30°',planet:'土星'},
    {sign:'摩羯',range:'0°-10°', planet:'木星'},  {sign:'摩羯',range:'10°-20°',planet:'火星'},  {sign:'摩羯',range:'20°-30°',planet:'太陽'},
    {sign:'水瓶',range:'0°-10°', planet:'金星'},  {sign:'水瓶',range:'10°-20°',planet:'水星'},  {sign:'水瓶',range:'20°-30°',planet:'月亮'},
    {sign:'雙魚',range:'0°-10°', planet:'土星'},  {sign:'雙魚',range:'10°-20°',planet:'木星'},  {sign:'雙魚',range:'20°-30°',planet:'火星'}
  ];

  function getCardDecan(card) {
    var gd = getCardGD(card);
    // 數字牌有精確旬
    if (gd.decan != null) return gd.decan;
    // 其他牌 → 按星座的第一旬
    if (gd.sign) {
      var signIdx = SIGNS_ORDER.indexOf(gd.sign);
      if (signIdx >= 0) return signIdx * 3; // 第一旬
    }
    // 元素 → 對應 cardinal sign 的第一旬
    var el = gd.element || getCardElement(card);
    var elSign = { '火':0, '土':27, '風':18, '水':9 }; // 牡羊/摩羯/天秤/巨蟹 的第一旬
    if (elSign[el] != null) return elSign[el];
    return 0;
  }

  function ootkOp4(deck, significatorId) {
    // ════════════════════════════════════════════════════════════
    // ★ v63 正統 Book T Op4：「Find the Significator: set him upon the
    //   table; let the thirty-six cards following form a ring round him.」
    //   — Mathers Book T (Liber T)
    // 不是按 GD decan 分配（那是現代簡化版）
    // 正統做法：洗牌 → 找 Sig 在牌堆裡的位置 → Sig 取出居中 →
    //   緊接其後的 36 張按順序圍成環
    // ════════════════════════════════════════════════════════════
    var sigDeckIdx = deck.findIndex(function(c) { return c.id === significatorId; });
    if (sigDeckIdx < 0) {
      // fallback: Sig 不在牌堆（理論上不該發生）
      return {
        activeDecan: 0,
        decanSign: '',
        decanRange: '',
        decanPlanet: '',
        activeCards: [],
        keyCards: [],
        countingPath: [],
        pairs: [],
        dignities: []
      };
    }

    // 取 Sig 並居中
    var sigCard = deck[sigDeckIdx];
    // 取緊接其後的 36 張（環形：超過末端折回開頭，跳過 Sig 自己）
    var ring = [];
    var idx = sigDeckIdx;
    while (ring.length < 36) {
      idx = (idx + 1) % deck.length;
      if (idx === sigDeckIdx) break; // 安全：避免無限迴圈
      ring.push(deck[idx]);
    }

    // 正統 Book T：Sig 居中後，活躍牌組 = [Sig, ring...]
    // counting/pairing 都從 Sig（位置 0）開始
    var activeCards = [sigCard].concat(ring);
    var sigIdx = 0; // Sig 永遠在第 0 位（居中）

    // ════════════════════════════════════════════════════════════
    // ★ v63 雙版本支援（Crowley vs Manuscript Q）
    //
    // Crowley 版本（Book of Thoth, 1944）：「Count and pair as before」
    //   → 跟 Op1-3 一樣，從 Sig 開始 counting，Sig 兩側往外 pairing
    //
    // Manuscript Q 版本（Mathers 原始手稿，最正統）：
    //   → Counting 從第一張環繞牌起、按 dealing 方向(Manuscript Q「against direction of the Sun」=逆太陽方向)固定
    //   → Pairing 是環形對應：1↔36, 2↔35, 3↔34, ...
    //
    // 我們同時提供兩個版本給 AI，由 AI 決定如何讀（兩者都正統）
    // ════════════════════════════════════════════════════════════
    var counted = ootkCounting(activeCards, sigIdx);     // Crowley 版本
    var paired = ootkPairing(activeCards, sigIdx);       // Crowley 版本

    // Manuscript Q 版本：環形 counting 從第一張起、固定方向
    var countedMQ = ootkCountingRing(ring);              // 從 ring[0] 起、依 dealing 方向(against the Sun)
    var pairedMQ = ootkPairingRing(ring);                // 1↔36, 2↔35...

    // 仍保留 GD decan 對應做為「時機線索」參考（不是分配依據）
    // — Sig 自身的 GD decan 屬性可作為時機本質的線索
    var sigDecan = getCardDecan(sigCard);
    var dm = DECAN_MAP[sigDecan] || {};

    // ★ GD-1 補:Mathers Manuscript Q 明文規定的 Op4 統計觀察點
    //   原文:"The suit which is in the majority and the circumstances of either
    //         3 or 4 cards of a sort being found in the 36 Decanates are also noted."
    //   ① suit majority — 哪個花色多數=主要關注領域
    //   ② 3-of-a-sort / 4-of-a-sort — 同數字 3 或 4 張的特殊意義(Waite Pictorial Key 1910 對照表)
    var suitTally = { wand: 0, cup: 0, sword: 0, pent: 0, major: 0 };
    var rankTally = {}; // {ace:[..], '2':[..], ..., '10':[..], page:[..], knight:[..], queen:[..], king:[..]}
    activeCards.forEach(function(c) {
      if (!c) return;
      var s = c.suit || '';
      if (suitTally.hasOwnProperty(s)) suitTally[s]++;
      var r = String(c.rank || '');
      if (!rankTally[r]) rankTally[r] = [];
      rankTally[r].push(c.n || c.name || ('id-' + c.id));
    });
    // 找出 suit 多數
    var suitNames = { wand: '權杖(火/行動)', cup: '聖杯(水/情感)', sword: '寶劍(風/思維)', pent: '金幣(土/物質)', major: '大牌(命運)' };
    var dominantSuit = null, dominantCount = 0;
    Object.keys(suitTally).forEach(function(k) {
      if (k === 'major') return; // 大牌不算花色
      if (suitTally[k] > dominantCount) { dominantSuit = k; dominantCount = suitTally[k]; }
    });
    // 找出同數字 3 張或 4 張(GD/Waite/Crowley 雙版本對照)
    var rankOfASort = []; // [{rank, count, cards, meaning_waite, meaning_crowley}]
    var WAITE_SORT_MEANINGS = {
      // Waite《Pictorial Key to the Tarot》1910 Section 5 The Recurrence of Cards
      'king':   { 4: '極大榮譽 / 重要會議', 3: '會商 / 商議重要事項', 2: '微會議' },
      'queen':  { 4: '激烈爭辯 / 社交聚會', 3: '友善訪視 / 女性間誤會', 2: '真心朋友' },
      'knight': { 4: '嚴重事項 / 結盟', 3: '激烈辯論 / 決鬥', 2: '親密' },
      'page':   { 4: '危險疾病 / 匱乏', 3: '爭吵 / 怠惰', 2: '不安 / 社交' },
      '10':     { 4: '譴責 / 事件發生', 3: '新處境 / 失望', 2: '改變 / 期待實現' },
      '9':      { 4: '好友 / 高利貸', 3: '成功 / 不謹慎', 2: '收受 / 小盈利' },
      '8':      { 4: '反轉 / 錯誤', 3: '婚姻 / 場面', 2: '新知識 / 不幸' },
      '7':      { 4: '陰謀 / 爭吵者', 3: '虛弱 / 喜悅', 2: '消息 / 名譽不佳' },
      '6':      { 4: '豐盛 / 憂慮', 3: '成功 / 滿足', 2: '易怒 / 沒落' },
      '5':      { 4: '規律 / 秩序', 3: '決心 / 猶豫', 2: '守夜 / 反轉' },
      '4':      { 4: '近距離旅行 / 外出', 3: '反思主題 / 不安', 2: '失眠 / 爭執' },
      '3':      { 4: '進展 / 大成功', 3: '團結 / 平靜', 2: '平靜 / 安全' },
      '2':      { 4: '爭執 / 和解', 3: '安全 / 憂慮', 2: '一致 / 不信任' },
      'ace':    { 4: '有利契機 / 失榮譽', 3: '小成功 / 放縱', 2: '欺騙 / 敵人' }
    };
    // ★ v68.21.7 補:Crowley Liber 78 官方 28 條 n-of-a-sort 對照表
    //   來源:bibliotecapleyades.net/crowley/liber/lib78.htm 原文
    //   跟 Waite 1910 完全是兩條不同的傳統,提供雙版本給 AI 選擇
    var CROWLEY_SORT_MEANINGS = {
      'king':   { 4: 'Swiftness, rapidity 迅捷',                3: 'Unexpected meetings 意外的相遇 / Knights 通常代表消息' },
      'queen':  { 4: 'Authority, influence 權威、影響力',         3: 'Powerful friends 有力的朋友' },
      'knight': { 4: 'Meetings with the great 與大人物的會面',   3: 'Rank and honour 地位與榮耀' },
      'page':   { 4: 'New ideas or plans 新想法或計畫',           3: 'Society of the young 年輕人的社交圈' },
      '10':     { 4: 'Anxiety, responsibility 焦慮、責任',       3: 'Buying and selling, commerce 買賣、商業交易' },
      '9':      { 4: 'Added responsibilities 增添的責任',         3: 'Much correspondence 大量通訊' },
      '8':      { 4: 'Much news 大量消息',                       3: 'Much journeying 大量旅行' },
      '7':      { 4: 'Disappointments 失望',                     3: 'Treaties and compacts 協定與盟約' },
      '6':      { 4: 'Pleasure 愉悅',                            3: 'Gain, success 收獲、成功' },
      '5':      { 4: 'Order, regularity 秩序、規律',             3: 'Quarrels, fights 爭吵、衝突' },
      '4':      { 4: 'Rest, peace 休息、平靜',                   3: 'Industry 勤奮工作' },
      '3':      { 4: 'Resolution, determination 決心、決斷',     3: 'Deceit 欺騙' },
      '2':      { 4: 'Conferences, conversations 會議、對話',    3: 'Reorganization, recommendation 重組、推薦' },
      'ace':    { 4: 'Great power and force 強大力量',           3: 'Riches, success 財富、成功' }
    };
    Object.keys(rankTally).forEach(function(rk) {
      var n = rankTally[rk].length;
      if (n >= 3) {
        var meaningWaite = (WAITE_SORT_MEANINGS[rk] && WAITE_SORT_MEANINGS[rk][n]) || '';
        var meaningCrowley = (CROWLEY_SORT_MEANINGS[rk] && CROWLEY_SORT_MEANINGS[rk][n]) || '';
        rankOfASort.push({
          rank: rk, count: n, cards: rankTally[rk],
          meaning: meaningWaite, // 保留舊欄位向下相容
          meaning_waite: meaningWaite,
          meaning_crowley: meaningCrowley
        });
      }
    });

    // ★ v68.21.7 補:Crowley Liber 78 三條 Majority 規則(Keys/Court Cards/Aces)
    //   原文:bibliotecapleyades.net/crowley/liber/lib78.htm
    //   - Majority of Keys = Strong forces beyond the Querent's control
    //   - Majority of Court Cards = Society, meetings of many persons
    //   - Majority of Aces = Strength generally
    var keysCount = 0, courtCount = 0, acesCount = 0;
    activeCards.forEach(function(c) {
      if (!c) return;
      if (c.suit === 'major') keysCount++;
      var r = String(c.rank || '');
      if (r === 'king' || r === 'queen' || r === 'knight' || r === 'page') courtCount++;
      if (r === 'ace') acesCount++;
    });
    var totalCards = activeCards.length || 1;
    var crowleyMajorities = {
      keysMajority: (keysCount / totalCards >= 0.4 && keysCount >= 3) ? {
        count: keysCount, ratio: (keysCount / totalCards).toFixed(2),
        meaning: 'Crowley Liber 78:大牌(Keys)多數 = Strong forces beyond the Querent\'s control(命主無法掌控的強大力量在運作)'
      } : null,
      courtMajority: (courtCount / totalCards >= 0.35 && courtCount >= 3) ? {
        count: courtCount, ratio: (courtCount / totalCards).toFixed(2),
        meaning: 'Crowley Liber 78:宮廷牌多數 = Society, meetings of many persons(社群、多人聚會、人際密集場合)'
      } : null,
      acesMajority: (acesCount >= 2) ? {
        count: acesCount,
        meaning: 'Crowley Liber 78:Aces 多數 = Strength generally(整體強力,Aces are always strong cards). 4 Aces 特別強 / 3 Aces 富足成功'
      } : null
    };

    return {
      // 正統 Book T 的 Op4 結構
      ringSize: ring.length,
      sigPosition: sigDeckIdx,
      // 仍保留 decan 資訊作為「Sig 自身對應的時機線索」
      activeDecan: sigDecan,
      decanSign: dm.sign || '',
      decanRange: dm.range || '',
      decanPlanet: dm.planet || '',
      activeCards: activeCards,
      keyCards: counted.keyCards,
      countingPath: counted.path,
      pairs: paired,
      dignities: ootkDignities(counted.keyCards),
      // ★ v63 額外提供 Manuscript Q 正統版本（最原始 Mathers 手稿做法）
      mq_keyCards: countedMQ.keyCards,
      mq_countingPath: countedMQ.path,
      mq_pairs: pairedMQ,
      mq_startCard: ring[0] ? (ring[0].n || ring[0].name) : '',
      // ★ GD-1 補:Mathers Manuscript Q 明文規定的「suit majority」與「3/4-of-a-sort」
      suitTally: suitTally,
      dominantSuit: dominantSuit ? { suit: dominantSuit, name: suitNames[dominantSuit], count: dominantCount } : null,
      rankOfASort: rankOfASort, // 同數字 3 張或 4 張的特殊組合(Waite + Crowley 雙版本對照)
      // ★ v68.21.7 補:Crowley Liber 78 三條 Majority(Keys/Court/Aces)
      crowleyMajorities: crowleyMajorities
    };
  }

  // ════════════════════════════════════════════════
  // Operation 5：生命之樹（Tree of Life）
  // ════════════════════════════════════════════════
  // 正統做法：
  // - 數字牌 Ace-10 → 直接對應 Sephiroth 1-10
  // - 大阿爾克那 → 按路徑分配到路徑連接的較低 Sephirah
  // - 宮廷牌 → King=Chokmah, Queen=Binah, Knight=Tiphereth, Page=Malkuth

  var SEPHIROTH = [
    {name:'Kether',   zh:'王冠', meaning:'精神目標、最高指引、神聖意志'},
    {name:'Chokmah',  zh:'智慧', meaning:'創造衝動、原始動力、父性原則'},
    {name:'Binah',    zh:'理解', meaning:'結構限制、必須面對的現實、母性原則'},
    {name:'Chesed',   zh:'慈悲', meaning:'擴展、機會、恩典、秩序'},
    {name:'Geburah',  zh:'力量', meaning:'收縮、割捨、紀律、勇氣'},
    {name:'Tiphereth',zh:'美',   meaning:'核心自我、和諧、平衡、犧牲'},
    {name:'Netzach',  zh:'勝利', meaning:'情感、慾望、愛、藝術'},
    {name:'Hod',      zh:'榮耀', meaning:'思維、溝通、理性、魔法'},
    {name:'Yesod',    zh:'基礎', meaning:'潛意識、想像、基礎、月亮'},
    {name:'Malkuth',  zh:'王國', meaning:'物質現實、具體結果、身體'}
  ];

  // ★ GD-11 補:Op5 Mathers Manuscript Q 明文規定的「SIG 落在 X Sephirah → Y 預兆」
  //   依據:Mathers Manuscript Q「The packet containing the Significator falls under
  //        [X]. This is an argument of [Y]」+ Cicero《Magical Tarot》
  //   每個 Sephirah 在 OOTK Op5 都有特定的「占卜性意涵」(不只是基本屬性)
  var SEPHIRAH_OMEN = [
    // 0 Kether 王冠
    { mood:'極其有利',
      omen:'這事關乎「源頭與啟示」— Significator 落在 Kether 是 OOTK 中最高層的指示,代表事情正在最純粹的能量源頭被啟動。神性指引、創造力的源頭、與更高自我的連結。重大時刻,人生新階段的開始,可能是命定性的轉折。',
      action:'相信當下的直覺與靈感,這是難得的「神性接收」狀態。靜下心,聽見內在更高層的聲音。' },
    // 1 Chokmah 智慧
    { mood:'有利',
      omen:'這事關乎「智慧的應用與動能的啟動」— Chokmah 是純粹的陽性力量、智慧的初始爆發。事情處於「動能正在啟動」的階段,有遠見、有方向。智慧、洞察、原始驅動力。',
      action:'用你已經擁有的智慧與經驗,以慈悲與和諧的方式應用於當下情境。' },
    // 2 Binah 理解
    { mood:'凶兆/試煉',
      omen:'⚠ 這事關乎「悲傷與試煉」— Mathers Q 原文:Binah 對 OOTK 是「sadness and trial 的主張」。Binah 是限制與形式的力量,意味事情正面臨架構性的挑戰、人生的形變期、母性原型的考驗。可能涉及失去、嚴肅的責任、深層的理解過程。',
      action:'這不是失敗,而是被迫成熟。把這次試煉當作獲得真正智慧的代價,接受限制、學習耐心。' },
    // 3 Chesed 慈悲
    { mood:'非常有利',
      omen:'這事關乎「擴展與恩典」— Chesed 是仁慈、繁榮、好運的力量。事情正進入豐盛、機會、寬厚的階段,有貴人相助、財富累積、人脈擴展的機會。木星能量,是 OOTK 中最吉利的位置之一。',
      action:'大方接受機會與好運,但勿揮霍。慷慨會帶來更多繁榮。' },
    // 4 Geburah 力量
    { mood:'凶兆/衝突',
      omen:'⚠ 這事關乎「割捨與必要的破壞」— Geburah 是收縮、嚴厲、火星的力量。事情正面臨衝突、競爭、必須切除什麼東西的時刻。可能涉及訴訟、爭執、強烈的情感反彈、必要的結束。',
      action:'這是「該斷的時刻」。果斷處理,該結束的就結束,不要拖延。痛苦但必要。' },
    // 5 Tiphereth 美
    { mood:'有利/平衡',
      omen:'這事關乎「核心自我與平衡」— Tiphereth 是 Tree of Life 的中心,代表和諧、覺醒、太陽能量、犧牲帶來的整合。事情處於「真實的自我與外在世界協調」的位置,可能是覺醒時刻、藝術靈感、領導力的展現。',
      action:'回到中心,做真實的自己。整合內外的衝突,你的核心已具備所有需要的東西。' },
    // 6 Netzach 勝利
    { mood:'有利(感情/藝術)',
      omen:'這事關乎「情感、慾望、藝術、愛情」— Netzach 是金星的力量,代表情感的勝利、創作的衝動、愛戀、自然之美。事情有感性面、人際吸引力、藝術或情感創作的元素。',
      action:'用你的情感與創造力推進。但勿被情緒淹沒,平衡感性與理性。' },
    // 7 Hod 榮耀
    { mood:'有利(思維/溝通)',
      omen:'這事關乎「思維、溝通、學術、儀式」— Hod 是水星的力量,代表理性、智慧的具體應用、書寫、教學、商業談判。事情需要清晰的思維與精準的表達。',
      action:'用語言、文字、邏輯處理。寫下計畫,清楚溝通,精準表達。' },
    // 8 Yesod 基礎
    { mood:'中性/隱藏',
      omen:'這事關乎「潛意識、夢境、隱藏的影響」— Yesod 是月亮的力量,代表潛意識、星光體、未顯化的能量、想像的世界。事情可能涉及夢境訊息、潛意識的牽引、尚未浮上檯面的影響。',
      action:'重視夢境與直覺。事情背後有你還沒看見的力量在作用,先觀察再行動。' },
    // 9 Malkuth 王國
    { mood:'中性/實際',
      omen:'這事關乎「物質現實、具體結果、身體層面」— Malkuth 是物質世界的最終呈現。事情已經落地到日常實際層面,涉及金錢、健康、實際工作、家庭、身體狀況。',
      action:'用實際行動處理。這不是抽象的事,是具體的、需要動手做的。回歸基本面,腳踏實地。' }
  ];

  var SEPH_INDEX = {};
  SEPHIROTH.forEach(function(s, i) { SEPH_INDEX[s.name] = i; });

  // 大阿爾克那路徑→分配到較低的 Sephirah
  function getTrumpSephirah(card) {
    var gd = TRUMP_GD[card.id];
    if (!gd || !gd.path) return 5; // default Tiphereth
    var parts = gd.path.split('-');
    if (parts.length === 2) {
      var a = SEPH_INDEX[parts[0]], b = SEPH_INDEX[parts[1]];
      if (a != null && b != null) return Math.max(a, b); // 取較低（數字較大）的
    }
    return 5;
  }

  // 宮廷牌→ Sephirah（GD 標準）
  var COURT_SEPH = { 'king':1, 'queen':2, 'knight':5, 'page':9 };
  // King=Chokmah(1), Queen=Binah(2), Knight/Prince=Tiphereth(5), Page/Princess=Malkuth(9)

  function getCardSephirah(card) {
    var gd = getCardGD(card);

    // 大阿爾克那 → 路徑的較低端
    if (card.suit === 'major') return getTrumpSephirah(card);

    // Ace → Kether (0)
    if (String(card.rank) === 'ace') return 0;

    // 數字牌 2-10 → 直接對應
    var numRank = parseInt(card.rank);
    if (numRank >= 2 && numRank <= 10) return numRank - 1; // 2=Chokmah(1), 3=Binah(2), ...10=Malkuth(9)

    // 宮廷牌
    var r = String(card.rank);
    if (COURT_SEPH[r] != null) return COURT_SEPH[r];

    return 9; // fallback Malkuth
  }

  function ootkOp5(deck, significatorId) {
    // ════════════════════════════════════════════════════════════
    // ★ v63 正統 Book T Op5：「Deal into ten packs in the form of
    //   the Tree of Life.」 — Mathers Book T
    // 依 GD 對應表把全副 78 張各自落入生命之樹十質點、找 Sig 在哪質點
    // ════════════════════════════════════════════════════════════
    var sephirot = [];
    for (var s = 0; s < 10; s++) sephirot.push([]);

    deck.forEach(function(card) {
      var si = getCardSephirah(card);
      sephirot[si].push(card);
    });

    var activeSeph = -1;
    for (var si = 0; si < 10; si++) {
      if (sephirot[si].some(function(c) { return c.id === significatorId; })) {
        activeSeph = si;
        break;
      }
    }

    var sp = SEPHIROTH[activeSeph] || {};
    var omen = SEPHIRAH_OMEN[activeSeph] || {};
    var activeCards = sephirot[activeSeph] || [];
    var sigIdx = activeCards.findIndex(function(c) { return c.id === significatorId; });
    var counted = ootkCounting(activeCards, sigIdx >= 0 ? sigIdx : 0);
    var paired = ootkPairing(activeCards, sigIdx >= 0 ? sigIdx : 0);

    return {
      sephirahDistribution: sephirot.map(function(s) { return s.length; }),
      activeSephirah: sp.name || '',
      sephirahZh: sp.zh || '',
      sephirahMeaning: sp.meaning || '',
      // ★ GD-11 新增:Mathers Q 明文規定的占卜性預兆
      sephirahOmen: {
        mood: omen.mood || '',     // 整體吉凶判斷
        omen: omen.omen || '',     // 詳細預兆 (Mathers Q 原始規則)
        action: omen.action || ''  // 對應的行動建議
      },
      activeCards: activeCards,
      keyCards: counted.keyCards,
      countingPath: counted.path,
      pairs: paired,
      dignities: ootkDignities(counted.keyCards)
    };
  }

  // ════════════════════════════════════════════════
  // 計數程序（Counting）— 通用
  // ════════════════════════════════════════════════
  // 正統：從 Significator 出發，按計數值跳到下一張，
  // 正位向右數，逆位向左數，直到重複或到盡頭

  function ootkCounting(cards, startIdx) {
    if (!cards.length || startIdx < 0) return { keyCards: [], path: [] };
    var keyCards = [];
    var path = [];
    var visited = {};
    var idx = startIdx;
    var maxSteps = 12; // 最多 12 步防止無限迴圈

    // ════════════════════════════════════════════════════════════
    // ★ v63 正統 Book T 修正（最重要的引擎修正）
    //
    // Mathers Book T 原文：
    //   "Count the cards from him, in the direction in which he faces.
    //    The counting should include the card from which you count."
    //
    // 正統規則：方向只由起點（代表牌 Significator）的「面向」決定。
    //   - 代表牌正位 → 整串 Counting 一律向右走
    //   - 代表牌逆位 → 整串 Counting 一律向左走
    //
    // 走進其他牌時，那張牌的正/逆位「不會」改變方向——
    // 這是 Jack Chanek 的個人發想（"a thought for you"），不是 Book T 正統。
    //
    // 此修正確保 Counting 走的牌串符合 Mathers Book T 原始手稿規範。
    // ════════════════════════════════════════════════════════════
    var startCard = cards[startIdx];
    var startIsUp = (startCard && startCard.isUp === true);
    var direction = startIsUp ? 1 : -1; // 整串永遠用這個方向

    // ★ v68.21.8 對齊 Book T 1888 + Liber 78:Aces 已預設 count=11
    //   舊邏輯(useCrowleyAce 死循環時切換)在預設 5 時用,現在不需要

    for (var step = 0; step < maxSteps; step++) {
      var card = cards[idx];
      if (!card || visited[idx]) break;
      keyCards.push({ card: card, position: idx });
      visited[idx] = true;
      var count = getCountValue(card);
      var cardIsUp = (card.isUp === true);
      path.push({
        cardId: card.id,
        cardName: card.n || card.name,
        position: idx,
        countValue: count,
        isUp: cardIsUp,
        // ★ v63:每張牌記錄它自己的 isUp 給 dignity 用,但 direction 整串都是起點方向
        direction: direction > 0 ? 'right' : 'left',
        startDirection: direction > 0 ? 'right' : 'left'
      });
      for (var c = 0; c < count; c++) {
        idx = (idx + direction + cards.length) % cards.length;
      }
    }
    return { keyCards: keyCards, path: path, startDirection: direction > 0 ? 'right' : 'left' };
  }

  // ════════════════════════════════════════════════
  // 配對程序（Pairing）— 通用
  // ════════════════════════════════════════════════
  // 正統：從 Significator 兩側同時向外配對

  function ootkPairing(cards, sigIdx) {
    if (!cards.length || sigIdx < 0) return [];
    var pairs = [];
    var left = sigIdx - 1;
    var right = sigIdx + 1;
    // ★ Bug #35 fix: 若 sigIdx 在最左/右邊（如 0 或 length-1），舊版迴圈一次都不跑，整堆無配對
    //   修法：若一邊已耗盡，繼續用另一邊與「對側已耗盡的延伸」配對（環狀繞回）
    while (left >= 0 && right < cards.length) {
      var ed = elementalDignity(cards[left], cards[right]);
      pairs.push({ left: cards[left], right: cards[right], dignity: ed });
      left--;
      right++;
    }
    // 補配對：若一邊還有剩，跟剩下的「自己」（單張）也記錄成單牌
    while (left >= 0) {
      pairs.push({ left: cards[left], right: null, dignity: null, single: true });
      left--;
    }
    while (right < cards.length) {
      pairs.push({ left: null, right: cards[right], dignity: null, single: true });
      right++;
    }
    return pairs;
  }

  // ════════════════════════════════════════════════════════════
  // ★ v63 Op4 Manuscript Q 版本（Mathers 原始手稿最正統做法）
  //
  // Mathers 原文（Manuscript Q）：
  //   "instead of counting from the Significator itself, it begins from
  //    the first card of the 36, and always goes in the direction of dealing"
  //   "the cards are paired together; 1st and 36th; 2nd and 35th; 3rd and 34th"
  //
  // 與 Crowley Book of Thoth「count and pair as before」並列存在。
  // 兩個版本都送給 AI，由 AI 視情況採用。
  // ════════════════════════════════════════════════════════════

  // Op4 環形 counting:從第一張環繞牌起、按 dealing 方向(Manuscript Q「against direction of the Sun」)固定
  function ootkCountingRing(ring) {
    if (!ring || !ring.length) return { keyCards: [], path: [] };
    var keyCards = [];
    var path = [];
    var visited = {};
    var idx = 0; // ★ Manuscript Q：從第 1 張環繞牌起，不是從 Sig
    var maxSteps = 12;
    var direction = 1; // ★ Manuscript Q:永遠按 dealing 方向(against direction of the Sun = 逆太陽方向)固定

    // ★ v68.21.8:Aces 已修正預設 count=11(對齊 Book T 官方),不再需要 useCrowleyAce 切換
    //   舊邏輯保留為註解:當 Aces=5 預設時遇到死循環自動切 11,現在預設就是 11 不會死循環

    for (var step = 0; step < maxSteps; step++) {
      var card = ring[idx];
      if (!card || visited[idx]) break;
      keyCards.push({ card: card, position: idx });
      visited[idx] = true;
      var count = getCountValue(card);
      var cardIsUp = (card.isUp === true);
      path.push({
        cardId: card.id,
        cardName: card.n || card.name,
        position: idx,
        countValue: count,
        isUp: cardIsUp,
        direction: 'dealing', // 永遠按 dealing 方向(against the Sun)
        startDirection: 'dealing'
      });
      for (var c = 0; c < count; c++) {
        idx = (idx + direction + ring.length) % ring.length;
      }
    }
    return { keyCards: keyCards, path: path, startDirection: 'dealing' };
  }

  // Op4 環形 pairing：1↔36, 2↔35, 3↔34, ...
  function ootkPairingRing(ring) {
    if (!ring || !ring.length) return [];
    var pairs = [];
    var n = ring.length;
    var half = Math.floor(n / 2);
    for (var i = 0; i < half; i++) {
      var left = ring[i];
      var right = ring[n - 1 - i];
      var ed = elementalDignity(left, right);
      pairs.push({
        left: left,
        right: right,
        dignity: ed,
        leftPos: i + 1,    // 1-indexed
        rightPos: n - i    // 1-indexed
      });
    }
    return pairs;
  }

  // ════════════════════════════════════════════════
  // 元素尊嚴分析（Elemental Dignities）
  // ════════════════════════════════════════════════

  function ootkDignities(keyCards) {
    var result = [];
    for (var i = 0; i < keyCards.length; i++) {
      var card = keyCards[i].card;
      var leftN = (i > 0) ? keyCards[i - 1].card : null;
      var rightN = (i < keyCards.length - 1) ? keyCards[i + 1].card : null;
      var leftEd = leftN ? elementalDignity(card, leftN) : 'none';
      var rightEd = rightN ? elementalDignity(card, rightN) : 'none';
      result.push({
        card: card.n || card.name,
        cardElement: getCardElement(card),
        leftDignity: leftEd,
        rightDignity: rightEd
      });
    }
    return result;
  }

  // ════════════════════════════════════════════════
  // 完整 OOTK 執行（五階段・單一副牌）
  // ════════════════════════════════════════════════

  // ════════════════════════════════════════════════════════════
  // v63 helper：洗一副新牌（含正逆位隨機）
  // 每階段都重新洗一副 78 張，符合 Book T「Shuffle, etc., as before」
  // ════════════════════════════════════════════════════════════
  function shuffleNewDeck() {
    if (typeof TAROT === 'undefined') return [];
    var deck = TAROT.map(function(c) {
      return Object.assign({}, c, { isUp: Math.random() >= 0.5 });
    });
    // Fisher-Yates shuffle
    for (var i = deck.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = deck[i]; deck[i] = deck[j]; deck[j] = tmp;
    }
    return deck;
  }

  // ════════════════════════════════════════════════════════════
  // ★ v64.1 正統 Mathers Book T:Op2/Op3 二次重洗 abandon 機制
  //
  // Mathers 原文(Manuscript Q):
  //   "If the Significator be not found in the right packet referring to
  //    the matter under consideration, the Diviner can shuffle and deal
  //    once more, but if it again fails, the divination should be abandoned."
  //
  // 「合適宮位/星座」對應表(問題類型 → 期望的宮位 / cognate house):
  //
  // 問題類型對應宮位(Op2):
  //   感情/婚姻 → 主 7 宮(夫妻),cognate 5 宮(戀愛)、8 宮(性/共有)
  //   財務/金錢 → 主 2 宮(財帛),cognate 8 宮(共有資源)、10 宮(事業收入)
  //   工作/事業 → 主 10 宮(官祿),cognate 6 宮(工作)、2 宮(收入)
  //   家庭/居住 → 主 4 宮(田宅),cognate 3 宮(家人)、10 宮(母親)
  //   健康/身體 → 主 6 宮(健康),cognate 1 宮(體格)、12 宮(慢性)
  //   友情/社交 → 主 11 宮(朋友),cognate 3 宮(熟人)、7 宮(合夥)
  //   學習/旅行 → 主 9 宮(遷移/學問),cognate 3 宮(短途)
  //   隱私/秘密 → 主 12 宮(玄秘),cognate 8 宮(深層)
  //
  // 問題類型對應星座(Op3,依該題的能量本質):
  //   感情 → 巨蟹(情感家庭)、天蠍(深度結合)、雙魚(浪漫)、金牛(穩定)
  //   財務 → 金牛、摩羯、處女(土象,物質穩定)
  //   工作 → 摩羯、處女、白羊(行動)、獅子(領導)
  //   家庭 → 巨蟹、金牛
  //   健康 → 處女、摩羯
  //   學習 → 雙子、射手、水瓶
  //   靈性 → 雙魚、天蠍、射手
  // ════════════════════════════════════════════════════════════

  // 問題類型 → 合適 Op1 元素堆
  // Mathers Book T:Yod 火堆=work、Heh 水堆=love、Vav 風堆=quarrels/loss、Heh-final 土堆=money
  var QUESTION_PILES = {
    'love':    ['water'],            // 感情 → 水堆
    'money':   ['earth'],            // 財務 → 土堆
    'work':    ['fire'],             // 工作 → 火堆
    'family':  ['earth', 'water'],   // 家庭 → 土/水(物質基礎+情感)
    'health':  ['earth', 'fire'],    // 健康 → 土/火(體質+生命力)
    'friend':  ['water', 'air'],     // 友情 → 水/風(情感+溝通)
    'travel':  ['fire', 'air'],      // 學習旅行 → 火/風(行動+思維)
    'secret':  ['water', 'air'],     // 秘密 → 水/風(深層+心思)
    'general': null                  // 不限
  };

  // 問題類型 → 合適宮位陣列
  var QUESTION_HOUSES = {
    'love':    [7, 5, 8],   // 感情/婚姻
    'money':   [2, 8, 10],  // 財務
    'work':    [10, 6, 2],  // 工作/事業
    'family':  [4, 3, 10],  // 家庭/居住
    'health':  [6, 1, 12],  // 健康
    'friend':  [11, 3, 7],  // 友情/社交
    'travel':  [9, 3],      // 學習/旅行
    'secret':  [12, 8],     // 隱私/秘密
    'general': null         // 不限(不做 abandon 檢查)
  };

  // 問題類型 → 合適星座陣列(0-indexed: 牡羊=0, 雙魚=11)
  var QUESTION_SIGNS = {
    'love':    [3, 7, 11, 1],   // 巨蟹/天蠍/雙魚/金牛
    'money':   [1, 9, 5],       // 金牛/摩羯/處女
    'work':    [9, 5, 0, 4],    // 摩羯/處女/牡羊/獅子
    'family':  [3, 1],          // 巨蟹/金牛
    'health':  [5, 9],          // 處女/摩羯
    'friend':  [10, 6],         // 水瓶/天秤
    'travel':  [2, 8, 10],      // 雙子/射手/水瓶
    'secret':  [7, 11],         // 天蠍/雙魚
    'general': null
  };

  // ★ v64.2 正統 Crowley Op5:「Make up your mind where the Significator should be」
  // 問題類型 → 合適 Sephirah 陣列(0-indexed: Kether=0, Malkuth=9)
  // 但 Crowley 原文明說「failure does not necessarily imply abandon」——
  //   Op5 只做「觀察是否符合預期」,不觸發 abandon、不重洗
  // Sephirah 對應(基於 Kabbalistic 傳統 + PHB 補充):
  //   Kether(王冠/源頭)、Chokmah(智慧/動力)、Binah(理解/形成)
  //   Chesed(慈悲/擴張)、Geburah(嚴厲/收縮)、Tiphereth(美/平衡)
  //   Netzach(勝利/情感)、Hod(榮耀/思維)、Yesod(基礎/直覺)、Malkuth(王國/物質)
  var QUESTION_SEPHIROTH = {
    'love':    [6, 3, 8],       // Tiphereth(平衡的愛)、Chesed(無條件愛)、Yesod(直覺連結)
    'money':   [9, 3],          // Malkuth(物質)、Chesed(豐盛擴張)
    'work':    [4, 6, 9],       // Geburah(行動力)、Tiphereth(志業)、Malkuth(物質成就)
    'family':  [9, 3],          // Malkuth(根基)、Chesed(慈愛)
    'health':  [9, 5],          // Malkuth(身體)、Geburah(平衡能量)
    'friend':  [7, 6],          // Netzach(情感網路)、Tiphereth(連結中心)
    'travel':  [1, 8],          // Chokmah(動力)、Yesod(夢想/想像)
    'secret':  [2, 8],          // Binah(深層理解)、Yesod(潛意識)
    'general': null
  };

  // 問題類型中文對照
  function getQTypeZh(qType) {
    var map = {
      'love':    '感情/婚姻',
      'money':   '財務',
      'work':    '工作/事業',
      'family':  '家庭/居住',
      'health':  '健康',
      'friend':  '友情/社交',
      'travel':  '學習/旅行',
      'secret':  '隱私/秘密',
      'general': '一般'
    };
    return map[qType] || qType;
  }

  // 自動偵測問題類型(從用戶問題文字)
  function detectQuestionType(question) {
    var q = String(question || '').toLowerCase();
    if (/愛情|戀愛|感情|交往|曖昧|男友|女友|喜歡|愛情|桃花|對象|分手|復合|婚姻|結婚|配偶|另一半|老公|老婆|love|relationship|marriage/.test(q)) return 'love';
    if (/錢|財|錢財|收入|薪水|財務|存錢|理財|投資|money|finance|income|salary/.test(q)) return 'money';
    if (/工作|事業|職場|升遷|轉職|跳槽|老闆|主管|同事|公司|career|job|work|business/.test(q)) return 'work';
    if (/家庭|家人|父母|爸媽|搬家|住|家裡|住處|居住|home|family|house/.test(q)) return 'family';
    if (/健康|身體|生病|病|看醫生|醫療|health|illness|disease/.test(q)) return 'health';
    if (/朋友|社交|同學|聚會|友情|friend|social/.test(q)) return 'friend';
    if (/讀書|考試|留學|出國|遊學|搬到|study|exam|travel/.test(q)) return 'travel';
    if (/秘密|隱情|背叛|出軌|外遇|secret|affair/.test(q)) return 'secret';
    return 'general';
  }

  // 檢查 Sig 是否落在合適宮位/星座
  function isSigInExpectedPosition(activePosition, expectedPositions) {
    if (!expectedPositions) return true; // general 類不檢查
    return expectedPositions.indexOf(activePosition) >= 0;
  }

  function runFullOOTK(significatorId, questionText) {
    if (typeof TAROT === 'undefined') return null;

    // ════════════════════════════════════════════════════════════
    // ★ v63 最正統 Book T:每階段獨立重新洗牌
    // Mathers Book T 原文五階段都明寫「Shuffle, etc., as before」
    // 每階段 78 張全副牌、全新洗牌、全新隨機正逆位
    // 五個 Operation 是五次獨立的儀式,不是「同一次抽牌的五個切片」
    // ════════════════════════════════════════════════════════════

    var results = {};
    results.significatorId = significatorId;
    var sigCard = TAROT.find(function(c) { return c.id === significatorId; });
    results.significator = sigCard ? {
      id: sigCard.id,
      name: sigCard.n,
      element: getCardElement(sigCard)
    } : null;

    // 偵測問題類型(用於 Op2/Op3 abandon 檢查)
    var qType = detectQuestionType(questionText);
    results.questionType = qType;
    results.questionText = questionText || '';

    // ── Op1:四元素分堆 — 正統 Mathers 二次重洗 abandon 機制 ──
    // Mathers 原文 Op1:「告訴問者他要問什麼,如果說錯 → abandon」
    // 程式碼層級實作:檢查 Sig 落堆是否符合問題類型
    var expectedPiles = QUESTION_PILES[qType] || null;
    var deck1 = shuffleNewDeck();
    results.op1 = ootkOp1(deck1, significatorId);
    results.op1.attempt = 1;
    results.op1.expectedPiles = expectedPiles;

    if (expectedPiles && expectedPiles.indexOf(results.op1.activePile) < 0) {
      // 二次重洗
      var deck1b = shuffleNewDeck();
      var op1Retry = ootkOp1(deck1b, significatorId);
      op1Retry.attempt = 2;
      op1Retry.expectedPiles = expectedPiles;

      if (expectedPiles.indexOf(op1Retry.activePile) < 0) {
        // 二次仍錯堆 → abandon 警示(Mathers 原則)
        op1Retry.abandonTriggered = true;
        var pileZh = { fire: 'Yod 火堆', water: 'Heh 水堆', air: 'Vau 風堆', earth: 'Heh-final 土堆' };
        var expectedZh = expectedPiles.map(function(p) { return pileZh[p] || p; }).join(' / ');
        op1Retry.abandonReason =
          '依 Mathers Book T,Op1 二次重洗後 Sig(' + (sigCard ? sigCard.n : '代表牌') +
          ')仍落於 ' + (pileZh[op1Retry.activePile] || op1Retry.activePile) +
          '(非問題「' + getQTypeZh(qType) + '」的合適元素堆 ' + expectedZh + ')→ 此次盤面在告訴你:你心裡真正關心的議題,可能不是你問的這件事。應 abandon 或重新檢視問題。';
        op1Retry.firstAttemptPile = results.op1.activePile;
      } else {
        op1Retry.abandonTriggered = false;
        op1Retry.firstAttemptPile = results.op1.activePile;
        var pileZh2 = { fire: 'Yod 火堆', water: 'Heh 水堆', air: 'Vau 風堆', earth: 'Heh-final 土堆' };
        op1Retry.retryNote =
          '第一次 Sig 落 ' + (pileZh2[results.op1.activePile] || results.op1.activePile) +
          '(非合適),依 Mathers 重洗一次,第二次落 ' +
          (pileZh2[op1Retry.activePile] || op1Retry.activePile) + '(合適),採用第二次。';
      }
      results.op1 = op1Retry;
    }

    // ── Op2:十二宮位 — 正統 Mathers 二次重洗 abandon 機制 ──
    var expectedHouses = QUESTION_HOUSES[qType] || null;
    var deck2 = shuffleNewDeck();
    results.op2 = ootkOp2(deck2, significatorId);
    results.op2.attempt = 1;
    results.op2.expectedHouses = expectedHouses;

    if (expectedHouses && !isSigInExpectedPosition(results.op2.activeHouse, expectedHouses)) {
      // Mathers 原文:「shuffle and deal once more」── 重洗一次
      var deck2b = shuffleNewDeck();
      var op2Retry = ootkOp2(deck2b, significatorId);
      op2Retry.attempt = 2;
      op2Retry.expectedHouses = expectedHouses;

      if (!isSigInExpectedPosition(op2Retry.activeHouse, expectedHouses)) {
        // Mathers 原文:「if it again fails, the divination should be abandoned」
        op2Retry.abandonTriggered = true;
        op2Retry.abandonReason =
          '依 Mathers Book T 原文,Op2 二次重洗後 Sig(' + (sigCard ? sigCard.n : '代表牌') +
          ')仍落於第 ' + op2Retry.activeHouse + ' 宮(非問題「' +
          getQTypeZh(qType) + '」的合適宮位 ' + expectedHouses.join('/') + ' 宮)→ 此次 Op2 應 abandon。';
        op2Retry.firstAttemptHouse = results.op2.activeHouse;
      } else {
        op2Retry.abandonTriggered = false;
        op2Retry.firstAttemptHouse = results.op2.activeHouse;
        op2Retry.retryNote =
          '第一次 Sig 落第 ' + results.op2.activeHouse +
          ' 宮(非合適),依 Mathers 重洗一次,第二次落第 ' +
          op2Retry.activeHouse + ' 宮(合適),採用第二次。';
      }
      results.op2 = op2Retry;
    }

    // ── Op3:十二星座 — 正統 Mathers 二次重洗 abandon 機制 ──
    // Mathers 原文沒明確要求 Op3 重洗,但既然「合適宮位邏輯」也適用於星座
    // (PHB 補充規則),Op3 也採同樣機制保持正統一致性
    var expectedSigns = QUESTION_SIGNS[qType] || null;
    var deck3 = shuffleNewDeck();
    results.op3 = ootkOp3(deck3, significatorId);
    results.op3.attempt = 1;
    results.op3.expectedSigns = expectedSigns;

    if (expectedSigns) {
      var op3SignIdx = SIGNS_ORDER.indexOf(results.op3.activeSign);
      if (!isSigInExpectedPosition(op3SignIdx, expectedSigns)) {
        var deck3b = shuffleNewDeck();
        var op3Retry = ootkOp3(deck3b, significatorId);
        op3Retry.attempt = 2;
        op3Retry.expectedSigns = expectedSigns;
        var op3RetrySignIdx = SIGNS_ORDER.indexOf(op3Retry.activeSign);

        if (!isSigInExpectedPosition(op3RetrySignIdx, expectedSigns)) {
          // Op3 二次仍錯位 → 不像 Op2 那樣硬性 abandon,而是給「弱訊號警示」
          // (因為 Mathers 原文 Op3 沒明文 abandon)
          op3Retry.weakSignalWarning = true;
          op3Retry.weakSignalReason =
            '依正統 Mathers/PHB,Op3 二次重洗後 Sig 仍落於 ' + op3Retry.activeSign +
            '(非問題「' + getQTypeZh(qType) + '」的合適星座)→ 此 Op3 訊號偏弱,解讀時應降權。';
          op3Retry.firstAttemptSign = results.op3.activeSign;
        } else {
          op3Retry.weakSignalWarning = false;
          op3Retry.firstAttemptSign = results.op3.activeSign;
          op3Retry.retryNote =
            '第一次 Sig 落 ' + results.op3.activeSign +
            ',重洗後落 ' + op3Retry.activeSign + ',採用第二次。';
        }
        results.op3 = op3Retry;
      }
    }

    // ── Op4:三十六旬(Mathers 原文無 abandon 條件) ──
    var deck4 = shuffleNewDeck();
    results.op4 = ootkOp4(deck4, significatorId);

    // ── Op5:生命之樹(Crowley「Make up your mind where Significator should be」) ──
    // Crowley 原文:「failure does not here necessarily imply that the divination has gone astray.」
    // → Op5 只做「預期 vs 實際」觀察,不觸發 abandon、不重洗
    var expectedSephiroth = QUESTION_SEPHIROTH[qType] || null;
    var deck5 = shuffleNewDeck();
    results.op5 = ootkOp5(deck5, significatorId);
    results.op5.expectedSephiroth = expectedSephiroth;

    // 找 Sig 落的 Sephirah index(0-indexed)
    var SEPH_NAMES_5 = ['Kether','Chokmah','Binah','Chesed','Geburah','Tiphereth','Netzach','Hod','Yesod','Malkuth'];
    var actualSephIdx = SEPH_NAMES_5.indexOf(results.op5.activeSephirah);

    if (expectedSephiroth && actualSephIdx >= 0) {
      var sephZh = ['王冠','智慧','理解','慈悲','嚴厲','美','勝利','榮耀','基礎','王國'];
      if (expectedSephiroth.indexOf(actualSephIdx) >= 0) {
        // Sig 落合適 Sephirah
        results.op5.sephExpectationMet = true;
        results.op5.sephExpectationNote =
          'Op5 Sig 落於 ' + SEPH_NAMES_5[actualSephIdx] + '(' + sephZh[actualSephIdx] +
          ')—— 與問題「' + getQTypeZh(qType) + '」的合適 Sephirah 一致,靈魂層級對應問題本質。';
      } else {
        // Sig 不在預期 Sephirah,但依 Crowley 原文「failure does not imply abandon」
        // → 只做觀察附註,標明此次 Op5 揭示的是「靈魂功課跟你問的議題不同層」
        results.op5.sephExpectationMet = false;
        var expectedZh = expectedSephiroth.map(function(idx) {
          return SEPH_NAMES_5[idx] + '(' + sephZh[idx] + ')';
        }).join(' / ');
        results.op5.sephExpectationNote =
          'Op5 Sig 落於 ' + SEPH_NAMES_5[actualSephIdx] + '(' + sephZh[actualSephIdx] + '),' +
          '非問題「' + getQTypeZh(qType) + '」預期的 ' + expectedZh + '。' +
          '依 Crowley Book of Thoth 原文「failure does not necessarily imply abandon」—— ' +
          'Op5 找錯位不必然意味讀盤失敗,而是揭示「你靈魂深處真正在處理的功課,跟你表面問的議題不在同一層」。';
      }
    }

    results.completedOperations = 5;

    // ════════════════════════════════════════════════════════════
    // ★ v63E 正統 Book T 重寫(2026-04-26)── 嚴格依 OOTK_ORTHODOXY.md
    //
    // 核心原則(Mathers Book T / Crowley Book of Thoth Appendix A / PHB):
    //   ① 五個 Operations 是「五次獨立讀盤」,不是「同一答案的五層穿透」
    //   ② Mathers/Crowley 原文沒有「跨層綜合」「重複牌偵測」「結論牌」
    //      「五層元素進程」「五層方向預判」「五層仲裁」這些概念
    //   ③ Abandon 是逐 Op 內的判斷,沒有跨五層綜合分數
    //   ④ Counting 走過的整串牌都是「故事」(the story of the affair),
    //      不是某張單牌作結論——終點只是「故事自然結束於此」
    //   ⑤ PHB 的 Source of the Nile / Unaspected Cards 是單層內判斷
    //   ⑥ 代表牌每層必在是演算法機制必然,不是訊號
    //
    // 已從前版砍掉的非正統概念(全部不在文獻中):
    //   ✗ recurringCards(跨層重複牌)
    //   ✗ crossPairCards(跨層配對統計)
    //   ✗ elementEnvironment / elementShift(五層元素進程/環境變化)
    //   ✗ keyCardNames(結論牌)
    //   ✗ strongUnaspected(跨層彙整 unaspected)
    //   ✗ triadStrengths / strongCards / weakCards(全盤 Triad scoring)
    //   ✗ abandonScore / abandonSuggested(跨五層綜合 abandon)
    //   ✗ keyDirectionalInteractions(跨層彙整 directional)
    //   ✗ layerAlignment(五層方向預判)
    //   ✗ dominantCards(多層核心牌)
    //   ✗ progression(舊「進程」綜合)
    //   ✗ keyCardThemeConsistency(五層結論牌主題)
    //
    // 保留(有 Book T / PHB 正統根據,且皆為單層內或純記錄):
    //   ✓ 五層 Sig 落點記錄(pileElement / elementFlow / elementProgression)
    //     —— 純「Sig 在每層落到哪」客觀紀錄,不下綜合判斷
    //   ✓ 每層 unaspectedCards(PHB Source of the Nile)
    //   ✓ 每層 narrativePairs(Mathers 原文 pairing 補細節故事)
    //   ✓ 每層 directionalFindings(PHB 單層內 directional dignity)
    //   ✓ significatorDirectional(代表牌面向決定 counting 方向)
    //   ✓ abandonObservations(改為 Mathers 原文的逐 Op 條件)
    // ════════════════════════════════════════════════════════════

    var opZh = { 'op1': '四元素', 'op2': '十二宮', 'op3': '十二星座', 'op4': '三十六旬', 'op5': '生命之樹' };

    // ── ① Unaspected Cards(PHB Source of the Nile,單層內) ──
    // 該層活躍堆中沒被 counting/pairing 觸及的牌 = 該層的隱藏推力
    // ★ 排除代表牌(counting 起點 = Sig,理論一定 touched,加防禦)
    // ── ① Unaspected Cards(PHB Source of the Nile,單層內) ──
    // 該層活躍堆中沒被 counting/pairing 觸及的牌 = 該層的隱藏推力
    // ★ 排除代表牌(counting 起點 = Sig,理論一定 touched,加防禦)
    //
    // ★ v69.21.5 治本(2026-05-13):Op4 走 mq_pairs(同 narrativePairs 治本)
    //   根因:Op4 sigIdx=0,ootkPairing 產出全 single 對(left=null,right=ring 牌)
    //         touched 只能標 right 那 36 張,結構不完整
    //   治本:Op4 用 mq_pairs(環形 1↔36),left/right 都有牌,touched 完整
    var _unaspectedCards = {};
    ['op1','op2','op3','op4','op5'].forEach(function(k) {
      var op = results[k];
      if (!op || !op.activeCards || !op.activeCards.length) return;
      var touched = {};
      (op.countingPath || []).forEach(function(p) {
        if (p && p.cardId != null) touched[p.cardId] = true;
      });
      // ★ v69.21.5:Op4 用 mq_pairs(環形),其他 Op 用 pairs(Sig 兩側)
      var pairsForTouched = (k === 'op4' && op.mq_pairs && op.mq_pairs.length) ? op.mq_pairs : op.pairs;
      (pairsForTouched || []).forEach(function(pr) {
        var l = pr.left || pr.card1;
        var r = pr.right || pr.card2;
        if (l && l.id != null) touched[l.id] = true;
        if (r && r.id != null) touched[r.id] = true;
      });
      var ua = [];
      op.activeCards.forEach(function(c) {
        if (c && c.id != null && c.id !== significatorId && !touched[c.id]) {
          ua.push({ id: c.id, name: c.n || c.name, element: getCardElement(c) });
        }
      });
      if (ua.length) _unaspectedCards[k] = ua;
    });

    // ── ② Narrative Pairs(Mathers 原文 pairing 補細節故事,單層內) ──
    // Mathers 原文:「Pair the cards on either side of the Significator,
    //   then those outside them, and so on. Make another story...
    //   which should fill in the details omitted in the first.」
    //
    // ★ v69.21.5 治本(2026-05-13):Op4 narrativePairs 走 mq_pairs(Manuscript Q 環形)
    //   根因:Op4 結構特殊 — Sig 居中(sigIdx=0),activeCards = [Sig, ring[0], ..., ring[35]]
    //         ootkPairing(cards, sigIdx=0) 因為 left=-1<0 直接跳出,所有 pairs 變 single
    //         → narrativePairs 計算邏輯 if(!l || !r) return 全 skip → op4 = []
    //   治本:Op4 改讀 mq_pairs(Manuscript Q 環形配對 1↔36, 2↔35, ...)
    //         mq_pairs 結構完整(left + right + dignity)且永遠 18 對
    //         Mathers Manuscript Q 原文正統做法,符合 Op4「36 圓圈」結構
    var _narrativePairs = {};
    ['op1','op2','op3','op4','op5'].forEach(function(k) {
      var op = results[k];
      if (!op) return;
      // ★ v69.21.5:Op4 用 mq_pairs(Manuscript Q),其他 Op 用 pairs(Crowley)
      var pairsToUse = (k === 'op4' && op.mq_pairs && op.mq_pairs.length) ? op.mq_pairs : op.pairs;
      if (!pairsToUse || !pairsToUse.length) return;
      var seq = [];
      pairsToUse.forEach(function(pr, idx) {
        var l = pr.left, r = pr.right;
        if (!l || !r) return;
        var dig = pr.dignity || elementalDignity(l, r);
        // 單層內近到遠:idx=0 最接近 Sig(最即時),越外越遠
        // ★ v69.21.5:Op4 走 mq_pairs 時,idx=0 是 1↔36(最外環),不是最即時
        //   但 Manuscript Q 原文沒指定 phase 概念,沿用「外側=即時、內側=遠期」會誤導
        //   實務:Op4 18 對全標「環形對位」,phase 用 idx 分段給時序提示
        var phase;
        if (idx === 0) phase = '即時(最近)';
        else if (idx < 3) phase = '近期';
        else if (idx < 6) phase = '中期';
        else phase = '遠期';
        var impact;
        if (dig === 'strengthen') impact = '同頻強化';
        else if (dig === 'friendly') impact = '順勢推進';
        else if (dig === 'weaken') impact = '對立阻礙';
        else impact = '中性';
        seq.push({
          order: idx + 1,
          phase: phase,
          left: l.n || l.name,
          right: r.n || r.name,
          dignity: dig,
          impact: impact
        });
      });
      _narrativePairs[k] = seq;
    });

    // ── ③ Directional Dignity(PHB 單層內,已排除代表牌) ──
    // 代表牌面向已單獨在 _sigDirectional 處理,跨層掃會放大成 5 倍偽訊號
    var _directionalFindings = {};
    ['op1','op2','op3','op4','op5'].forEach(function(k) {
      var op = results[k];
      if (!op || !op.activeCards || !op.activeCards.length) return;
      var layerFindings = [];
      for (var di = 0; di < op.activeCards.length; di++) {
        var curCard = op.activeCards[di];
        if (!curCard) continue;
        if (curCard.id === significatorId) continue;
        var curFacing = getCourtFacing(curCard);
        if (!curFacing) continue;
        var dd = computeDirectionalDignity(op.activeCards, di);
        if (dd && dd.interactions && dd.interactions.length) {
          layerFindings.push(dd);
        }
      }
      if (layerFindings.length) _directionalFindings[k] = layerFindings;
    });

    // ── ④ Significator Directional(代表牌自身面向——Book T 核心) ──
    // Book T 原文:「Count the cards from him, in the direction in which he faces.」
    // 代表牌面向決定 counting 方向,是 Book T 機制核心
    var _sigDirectional = null;
    var sigC = TAROT.find(function(c) { return c.id === significatorId; });
    if (sigC) {
      for (var sdk in results) {
        var _op = results[sdk];
        if (_op && _op.activeCards) {
          for (var sdi = 0; sdi < _op.activeCards.length; sdi++) {
            if (_op.activeCards[sdi].id === significatorId) {
              var _sigCopy = _op.activeCards[sdi];
              var _sigFacing = getCourtFacing(_sigCopy);
              if (_sigFacing) {
                var _sigMeaning;
                if (_sigFacing === 'left') _sigMeaning = '代表牌面左——counting 向左走,注意力傾向過去';
                else if (_sigFacing === 'right') _sigMeaning = '代表牌面右——counting 向右走,重心傾向未來';
                else if (_sigFacing === 'averted') _sigMeaning = '代表牌正面逆位——閃避狀態';
                else _sigMeaning = '代表牌正面';
                _sigDirectional = {
                  facing: _sigFacing,
                  meaning: _sigMeaning
                };
              }
              break;
            }
          }
          if (_sigDirectional) break;
        }
      }
    }

    // ── ⑤ Abandon 觀察(Mathers 逐層原文,非綜合分數) ──
    // Book T 原文 abandon 條件僅有三處:
    //   Op1: 說錯問者要問什麼 → abandon
    //   Op1: counting story 主軸不準 → abandon
    //   Op2: Sig 不在預期宮位且 cognate house 也不在 → abandon
    // Op3/Op4 沒有 abandon 條件;Op5「找錯位不必然」意味失敗
    //
    // 演算法只能列出客觀觀察事實,abandon 由解讀者(AI/人)依 Mathers 原則判斷
    var _abandonObservations = [];
    if (results.op1 && results.op1.activePile) {
      var pileTypeZh = {
        fire: 'Yod 火堆 → 工作/事業',
        water: 'Heh 水堆 → 愛情/喜悅',
        air: 'Vau 風堆 → 衝突/損失/scandal',
        earth: 'Heh-final 土堆 → 金錢/物質'
      };
      _abandonObservations.push(
        'Op1 Sig 落於 ' + (pileTypeZh[results.op1.activePile] || results.op1.activePile) +
        ' —— 若與用戶問題大類完全不符,依 Mathers 原則應 abandon'
      );
    }
    if (results.op2 && results.op2.activeHouse) {
      _abandonObservations.push(
        'Op2 Sig 落於第 ' + results.op2.activeHouse + ' 宮 —— ' +
        '解讀者依問題性質判斷是否合理;不合理且二度錯位才 abandon(Mathers Book T)'
      );
    }

    // ── 純資料記錄:五個 Op 的 Sig 落點(不下綜合判斷) ──
    // ⚠ 這些只是「Sig 在每層落到哪」的客觀紀錄,AI 須各層獨立讀,不可拼成單一進程故事
    results.crossAnalysis = {
      // 落點記錄(純資料)
      pileElement: results.op1.activePile,
      elementFlow: {
        op1: results.op1.activePile || '',
        op2: results.op2.activeHouse ? '第' + results.op2.activeHouse + '宮' : '',
        op3: results.op3.activeSign || '',
        op4: (results.op4.decanSign || '') + (results.op4.decanPlanet ? '(' + results.op4.decanPlanet + ')' : ''),
        op5: (results.op5.activeSephirah || '') + (results.op5.sephirahZh ? '(' + results.op5.sephirahZh + ')' : '')
      },
      // ⚠ 用 ' / ' 分隔而非 ' → ',避免暗示「進程」
      elementProgression: [
        results.op1.activePile,
        (results.op2.activeHouse || '') + '宮',
        results.op3.activeSign,
        (results.op4.decanSign || '') + ' ' + (results.op4.decanRange || ''),
        (results.op5.activeSephirah || '') + '(' + (results.op5.sephirahZh || '') + ')'
      ].join(' / '),

      // 三個 PHB / Book T 正統技術觀察(每個都是單層內判斷)
      unaspectedCards: _unaspectedCards,           // PHB Source of the Nile,各層獨立
      narrativePairs: _narrativePairs,             // Mathers 補細節故事,各層獨立
      directionalFindings: _directionalFindings,   // PHB Directional Dignity,各層獨立

      // Book T 核心:代表牌自身面向(決定 counting 方向)
      significatorDirectional: _sigDirectional,

      // Mathers 逐 Op abandon 觀察(不是綜合分數)
      abandonObservations: _abandonObservations,

      // 正統性標記
      _orthodoxy: 'v63E_book_t_orthodox',
      _doctrine: '五個 Operations 是獨立讀盤,本物件不含跨層綜合判斷',
      _removed_concepts: [
        'recurringCards', 'crossPairCards', 'elementEnvironment', 'elementShift',
        'keyCardNames', 'strongUnaspected', 'triadStrengths', 'strongCards',
        'weakCards', 'abandonScore', 'abandonSuggested', 'keyDirectionalInteractions',
        'layerAlignment', 'dominantCards', 'progression', 'keyCardThemeConsistency'
      ]
    };

    return results;
  }

  // ════════════════════════════════════════════════
  // ════════════════════════════════════════════════
  // ★ GD-3,4 (J1+I1+I2) 補:Court Card 完整 GD 讀法計算
  //   1. 依鄰牌元素決定 well-dignified / ill-dignified / neutral
  //   2. 給出對應的 Book T 含義
  //   3. 給出三層讀法 (人物/想法/事件接近離開)
  // ════════════════════════════════════════════════
  function analyzeCourtCard(card, leftNeighbor, rightNeighbor) {
    if (!card || card.suit === 'major') return null;
    var rank = String(card.rank || '');
    if (rank !== 'king' && rank !== 'queen' && rank !== 'knight' && rank !== 'page') return null;

    var courtKey = card.suit + '-' + rank;
    var meanings = COURT_DIGNITY_MEANINGS[courtKey] || null;
    var personRole = COURT_PERSON_ROLE[rank] || '';

    // 計算 well/ill dignified
    var leftEd = leftNeighbor ? elementalDignity(card, leftNeighbor) : null;
    var rightEd = rightNeighbor ? elementalDignity(card, rightNeighbor) : null;
    var dignityState; // 'well' | 'ill' | 'neutral'
    if (leftEd === 'strengthen' || rightEd === 'strengthen') {
      // 至少一鄰同元素 = 強化(極端化)
      dignityState = (leftEd === 'weaken' || rightEd === 'weaken') ? 'neutral' : 'well';
    } else if (leftEd === 'weaken' && rightEd === 'weaken') {
      // 雙鄰皆對立元素 = 極弱(背景化)
      dignityState = 'ill';
    } else if (leftEd === 'weaken' || rightEd === 'weaken') {
      dignityState = 'neutral'; // 一鄰對立一鄰友好 = 抵消
    } else if (leftEd === 'friendly' && rightEd === 'friendly') {
      dignityState = 'well'; // 雙鄰友好 = well-dignified
    } else {
      dignityState = 'neutral';
    }

    return {
      courtKey: courtKey,
      dignityState: dignityState, // 'well' | 'ill' | 'neutral'
      meaning: meanings ? (dignityState === 'ill' ? meanings.ill : meanings.well) : '',
      wellMeaning: meanings ? meanings.well : '',
      illMeaning: meanings ? meanings.ill : '',
      personRole: personRole, // 三層讀法:人物/想法/事件接近離開
      leftDignity: leftEd,
      rightDignity: rightEd
    };
  }

  // 全域輸出
  // ════════════════════════════════════════════════

  window.ootkAutoSignificator = autoSelectSignificator;
  window.ootkRunFull = runFullOOTK;
  window.ootkOp1 = ootkOp1;
  window.ootkOp2 = ootkOp2;
  window.ootkOp3 = ootkOp3;
  window.ootkOp4 = ootkOp4;
  window.ootkOp5 = ootkOp5;
  window.ootkGetCountValue = getCountValue;
  window.ootkGetCardGD = getCardGD;
  window.ootkElementalDignity = elementalDignity;
  // GD-3,4 新增 export
  window.ootkAnalyzeCourtCard = analyzeCourtCard;
  window.ootkCourtDignityMeanings = COURT_DIGNITY_MEANINGS;
  window.ootkCourtPersonRole = COURT_PERSON_ROLE;
  // GD-8 新增 export
  window.ootkMathers1888Meanings = MATHERS_1888_MEANINGS;

  console.log('[OOTK v2] Opening of the Key 正統引擎已載入');
})();


// ══════════════════════════════════════════════════════════════════════
// 10. OOTK Phase 2 — 前端 UI、五階段動畫、Significator 選擇
// ══════════════════════════════════════════════════════════════════════

(function() {
  'use strict';

  // ★ v63E 正統 Book T:五個 Operation 是「五次獨立讀盤」(Mathers 原文)
  //    每次重洗、發牌、找 Sig、Counting、Pairing,各自完整、各自結論
  //    desc 文案強調「獨立」,避免暗示「五層遞進深入同一個答案」
  var OP_LABELS = [
    { id: 'op1', zh: '四元素分堆', en: 'Elemental Piles', icon: '🜂', desc: '第一次讀盤・當下處境(Mathers Book T)' },
    { id: 'op2', zh: '十二宮位', en: '12 Houses', icon: '🏠', desc: '第二次讀盤・問題的展開(獨立於 Op1)' },
    { id: 'op3', zh: '十二星座', en: '12 Signs', icon: '♈', desc: '第三次讀盤・進一步展開(獨立於前兩 Op)' },
    { id: 'op4', zh: '三十六旬', en: '36 Decans', icon: '🔮', desc: '第四次讀盤・倒數階段(時機節奏,獨立)' },
    { id: 'op5', zh: '生命之樹', en: 'Tree of Life', icon: '🌳', desc: '第五次讀盤・最終結果(靈魂本質,獨立)' }
  ];

  var PILE_ZH = { fire: '火堆・意志', water: '水堆・情感', air: '風堆・思維', earth: '土堆・物質' };
  var PILE_COLOR = { fire: '#ef4444', water: '#3b82f6', air: '#c9a84c', earth: '#22c55e' };

  // ── CSS 注入 ──
  function _injectOOTKStyles() {
    if (document.getElementById('ootk-styles')) return;
    var s = document.createElement('style');
    s.id = 'ootk-styles';
    s.textContent = [
      '.ootk-overlay{position:fixed;inset:0;z-index:9998;background:rgba(0,0,0,.88);backdrop-filter:blur(12px);display:flex;flex-direction:column;align-items:center;justify-content:flex-start;overflow-y:auto;padding:1.5rem 1rem}',
      '.ootk-sig-card{width:80px;height:128px;border-radius:8px;object-fit:cover;border:2px solid rgba(201,168,76,.5);transition:all .3s;cursor:pointer}',
      '.ootk-sig-card:hover,.ootk-sig-card.active{border-color:var(--c-gold);box-shadow:0 0 20px rgba(201,168,76,.4);transform:scale(1.06)}',
      '.ootk-phase{opacity:0;transform:translateY(24px) scale(.97);transition:opacity .7s ease,transform .7s ease}',
      '.ootk-phase.visible{opacity:1;transform:translateY(0) scale(1)}',
      '.ootk-progress{display:flex;gap:.3rem;justify-content:center;margin:1rem 0}',
      '.ootk-dot{width:32px;height:4px;border-radius:99px;background:rgba(255,255,255,.12);transition:background .4s}',
      '.ootk-dot.done{background:rgba(201,168,76,.7)}',
      '.ootk-dot.current{background:var(--c-gold);box-shadow:0 0 8px rgba(201,168,76,.5)}',
      '.ootk-result-card{background:rgba(255,255,255,.04);border:1px solid rgba(201,168,76,.12);border-radius:12px;padding:.8rem;margin:.4rem 0}',
      '.ootk-pile-bar{height:6px;border-radius:99px;transition:width .8s ease-out}',
      '.ootk-key-card{display:inline-flex;align-items:center;gap:.3rem;padding:.2rem .5rem;border-radius:6px;background:rgba(201,168,76,.08);border:1px solid rgba(201,168,76,.15);font-size:.72rem;color:var(--c-gold);margin:.15rem}',
      '@keyframes ootkReveal{from{opacity:0;transform:scale(.92) translateY(12px)}to{opacity:1;transform:scale(1) translateY(0)}}',
      '.ootk-reveal{animation:ootkReveal .5s ease-out forwards}',
      '@keyframes ootkGlow{0%,100%{box-shadow:0 0 15px rgba(201,168,76,.1)}50%{box-shadow:0 0 30px rgba(201,168,76,.25)}}',
      '.ootk-glow{animation:ootkGlow 2.5s ease-in-out infinite}',
      '@keyframes ootkBtnPulse{0%,100%{box-shadow:0 0 0 0 rgba(201,168,76,.3)}50%{box-shadow:0 0 0 8px rgba(201,168,76,0)}}',
      '#ootk-next{animation:ootkBtnPulse 2s ease-in-out infinite}',
      '#ootk-next:active{transform:scale(.95);animation:none}',
      '.ootk-dot{transition:all .5s cubic-bezier(.4,0,.2,1)}',
      '.ootk-dot.current{width:48px}',

      /* ── Key Card Flip Reveal ── */
      '.ootk-keycards-strip{margin-top:.5rem;display:flex;flex-wrap:wrap;gap:.5rem;justify-content:center;perspective:800px}',
      '.ootk-kc-flip{width:58px;text-align:center;opacity:0;transform:translateY(12px);animation:ootkKcAppear .5s ease-out forwards}',
      '.ootk-kc-inner{position:relative;width:52px;height:78px;margin:0 auto;transform-style:preserve-3d;animation:ootkKcSpin .6s ease-out forwards}',
      '.ootk-kc-front{position:absolute;inset:0;backface-visibility:hidden}',
      '.ootk-kc-back{position:absolute;inset:0;backface-visibility:hidden;transform:rotateY(180deg);border-radius:5px;background:url(\"/tarot_img/card-back.jpg\") center/cover;border:2px solid rgba(201,168,76,.3);box-shadow:0 2px 8px rgba(0,0,0,.4)}',
      '@keyframes ootkKcAppear{0%{opacity:0;transform:translateY(12px) scale(.85)}40%{opacity:1}100%{opacity:1;transform:translateY(0) scale(1)}}',
      '@keyframes ootkKcSpin{0%{transform:rotateY(180deg)}60%{transform:rotateY(-8deg)}100%{transform:rotateY(0deg)}}',
      '@keyframes ootkKcGlow{0%,100%{box-shadow:0 2px 8px rgba(0,0,0,.4)}50%{box-shadow:0 0 16px rgba(201,168,76,.35),0 2px 8px rgba(0,0,0,.4)}}',

      /* ── Op2 House Grid ── */
      '.ootk-house-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;max-width:280px;margin:0 auto}',
      '.ootk-hcell{padding:10px 4px;border-radius:8px;border:1px solid rgba(96,165,250,.08);background:rgba(96,165,250,.02);text-align:center;opacity:0;transform:scale(.7) translateY(8px);transition:all .35s cubic-bezier(.34,1.56,.64,1)}',
      '.ootk-hcell.show{opacity:1;transform:scale(1) translateY(0)}',
      '.ootk-hcell.active{border-color:rgba(96,165,250,.6)!important;background:rgba(96,165,250,.12)!important;box-shadow:0 0 24px rgba(96,165,250,.25);transform:scale(1.12)!important}',
      '@keyframes ootkHousePulse{0%,100%{box-shadow:0 0 16px rgba(96,165,250,.2)}50%{box-shadow:0 0 32px rgba(96,165,250,.45)}}',

      /* ── Op3 Zodiac Ring ── */
      '.ootk-zodiac-ring{position:relative;width:220px;height:220px;margin:0 auto}',
      '.ootk-znode{position:absolute;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.75rem;border:1px solid rgba(168,85,247,.12);background:rgba(168,85,247,.04);color:rgba(168,85,247,.4);opacity:0;transform:scale(.5);transition:all .4s cubic-bezier(.34,1.56,.64,1)}',
      '.ootk-znode.show{opacity:1;transform:scale(1)}',
      '.ootk-znode.active{border-color:rgba(168,85,247,.7);background:rgba(168,85,247,.15);color:rgba(168,85,247,1);box-shadow:0 0 24px rgba(168,85,247,.35);transform:scale(1.25);font-weight:700;z-index:2}',
      '.ootk-zsweep{position:absolute;width:8px;height:8px;border-radius:50%;background:rgba(168,85,247,.6);box-shadow:0 0 12px rgba(168,85,247,.5);opacity:0;transition:opacity .2s}',

      /* ── Op4 Decan Focus ── */
      '.ootk-focus-ring{width:160px;height:160px;border-radius:50%;border:2px solid rgba(234,179,8,.15);display:flex;align-items:center;justify-content:center;margin:0 auto;position:relative;transition:all .6s ease}',
      '.ootk-focus-ring.narrow{width:100px;height:100px;border-color:rgba(234,179,8,.4);box-shadow:0 0 30px rgba(234,179,8,.15)}',
      '.ootk-focus-ring.tight{width:72px;height:72px;border-color:rgba(234,179,8,.7);box-shadow:0 0 40px rgba(234,179,8,.25)}',
      '.ootk-focus-text{text-align:center;transition:all .4s ease;color:rgba(234,179,8,.7)}',

      /* ── Op5 Tree of Life ── */
      '.ootk-tree{position:relative;width:200px;height:280px;margin:0 auto}',
      '.ootk-seph{position:absolute;width:32px;height:32px;border-radius:50%;border:1.5px solid rgba(34,197,94,.12);background:rgba(34,197,94,.03);display:flex;align-items:center;justify-content:center;font-size:.5rem;color:rgba(34,197,94,.3);transition:all .4s ease}',
      '.ootk-seph.lit{border-color:rgba(34,197,94,.4);background:rgba(34,197,94,.08);color:rgba(34,197,94,.7);box-shadow:0 0 12px rgba(34,197,94,.15)}',
      '.ootk-seph.active{border-color:rgba(34,197,94,.8);background:rgba(34,197,94,.2);color:rgba(34,197,94,1);box-shadow:0 0 28px rgba(34,197,94,.4);transform:scale(1.3);font-weight:700;z-index:2}',
      '.ootk-tree-line{position:absolute;background:rgba(34,197,94,.06);transition:background .4s}',
      '.ootk-tree-line.lit{background:rgba(34,197,94,.2)}',
      // ════════════════════════════════════════════════════════════
      // ★ v63 六儀式 CSS（注入式）— 最正統 Book T 動畫
      // ════════════════════════════════════════════════════════════
      // v63 CSS marker: ═══ v63 ① 召喚祝禱層 ═══
      '.ootk-invocation-layer{position:fixed;inset:0;z-index:9999;background:#000;display:flex;align-items:center;justify-content:center;overflow:hidden;transition:opacity .9s ease}',
      '.ootk-invocation-layer.fade-out{opacity:0;pointer-events:none}',
      '.ootk-invoc-bg{position:absolute;inset:0;background:url(\'/img/ootk/invocation-bg.jpg\') center/cover no-repeat;opacity:0;transition:opacity 1.6s ease;filter:brightness(.9)}',
      '.ootk-invocation-layer.show-bg .ootk-invoc-bg{opacity:.85}',
      '.ootk-invoc-bg::after{content:\'\';position:absolute;inset:0;background:radial-gradient(ellipse at center,transparent 30%,rgba(0,0,0,.7) 100%)}',
      '.ootk-invoc-angel{position:absolute;top:50%;left:50%;width:280px;height:420px;margin-left:-140px;margin-top:-260px;background:url(\'/img/ootk/hru-angel.png\') center/contain no-repeat;opacity:0;transform:translateY(20px) scale(.92);transition:all 1.8s cubic-bezier(.2,.7,.3,1);z-index:1;pointer-events:none;filter:drop-shadow(0 0 30px rgba(201,168,76,.4))}',
      '.ootk-invocation-layer.show-angel .ootk-invoc-angel{opacity:.92;transform:translateY(0) scale(1)}',
      '.ootk-invoc-scroll{position:relative;z-index:2;width:90%;max-width:520px;padding:60px 40px 50px;background:url(\'/img/ootk/scroll-bg.png\') center/100% 100% no-repeat;opacity:0;transform:translateY(40px) scale(.95);transition:all 1.4s cubic-bezier(.2,.7,.3,1);text-align:center;color:#3a2a14;font-family:\'Cormorant Garamond\',\'Noto Serif TC\',serif;min-height:520px;display:flex;flex-direction:column;justify-content:center}',
      '.ootk-invocation-layer.show-scroll .ootk-invoc-scroll{opacity:.96;transform:translateY(0) scale(1)}',
      // v68.11(2026-05-02):色階加深 + 文字陰影,解決羊皮紙底圖標題隱形問題
      // 原本 #7a5a20 / #8a6a30 / #9a7a3a 跟 scroll-bg.png 同色階,完全融入背景
      // 改深棕 + 雙層陰影(白光暈 + 黑邊),既保留古風又能讀清楚
      '.ootk-invoc-title{font-size:1.6rem;font-weight:800;color:#3a1f08;letter-spacing:6px;margin-bottom:.3rem;text-shadow:0 0 8px rgba(255,235,180,.7),1px 1px 2px rgba(0,0,0,.4)}',
      '.ootk-invoc-subtitle{font-size:.95rem;font-style:italic;color:#5a3614;letter-spacing:3px;margin-bottom:.6rem;text-shadow:0 0 6px rgba(255,235,180,.6),1px 1px 1px rgba(0,0,0,.3)}',
      '.ootk-invoc-divider{font-size:.7rem;color:#6a4220;letter-spacing:2px;margin-bottom:1.4rem;font-style:italic;font-weight:600;text-shadow:0 0 4px rgba(255,235,180,.5)}',
      '.ootk-invoc-prayer{opacity:0;transition:opacity 2s ease;line-height:1.85}',
      '.ootk-invocation-layer.show-prayer .ootk-invoc-prayer{opacity:1}',
      '.ootk-invoc-en{font-size:.78rem;font-style:italic;color:#3a2410;margin-bottom:1.2rem;line-height:1.7;letter-spacing:.5px;text-shadow:0 0 3px rgba(255,235,180,.4)}',
      '.ootk-invoc-zh{font-size:.88rem;color:#1f1408;line-height:1.9;letter-spacing:1px;font-weight:500;text-shadow:0 0 3px rgba(255,235,180,.4)}',
      '.ootk-invoc-btn{margin-top:1.4rem;padding:.7rem 1.8rem;background:linear-gradient(135deg,#7a5a20,#a07530);color:#f5e6c0;border:1px solid #5a3a10;border-radius:4px;font-family:inherit;font-size:.85rem;font-weight:600;letter-spacing:3px;cursor:pointer;opacity:0;transform:translateY(8px);transition:all .8s ease,box-shadow .25s ease;box-shadow:0 2px 12px rgba(0,0,0,.3)}',
      '.ootk-invocation-layer.show-btn .ootk-invoc-btn{opacity:1;transform:translateY(0)}',
      '.ootk-invoc-btn:hover{box-shadow:0 4px 24px rgba(201,168,76,.5);transform:translateY(-1px)}',
      '.ootk-invoc-btn:active{transform:scale(.97)}',
      // v63 CSS marker: ═══ v63 階段標題與場景容器 ═══
      '.ootk-ritual-scene{padding:.5rem 0;text-align:center}',
      '.ootk-stage-title{margin-bottom:1rem;padding-bottom:.6rem;border-bottom:1px solid rgba(201,168,76,.15)}',
      '.ootk-stage-num{font-size:.7rem;color:var(--c-gold);letter-spacing:3px;margin-bottom:.2rem}',
      '.ootk-stage-name{font-size:1.2rem;font-weight:700;color:var(--c-gold);letter-spacing:2px;margin-bottom:.15rem}',
      '.ootk-stage-en{font-size:.62rem;color:var(--c-text-dim);letter-spacing:3px;font-style:italic}',
      '.ootk-stage-area{position:relative;min-height:280px;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;padding:.5rem}',
      '.ootk-stage-caption{font-size:.78rem;color:var(--c-text-dim);min-height:1.2rem;margin-bottom:.8rem;line-height:1.6;text-align:center;max-width:420px;padding:0 .5rem}',
      // v63 CSS marker: ═══ v63 ② 洗牌儀式 ═══
      '.ootk-shuffle-box{position:relative;width:200px;height:200px;margin:0 auto}',
      '.ootk-shuffle-box.done .ootk-shuffle-card{opacity:0;transition:opacity .5s}',
      '.ootk-shuffle-card{position:absolute;top:50%;left:50%;width:36px;height:54px;margin-left:-18px;margin-top:-27px;background:url(\"/tarot_img/card-back.jpg\") center/cover #2a1d08;border:1px solid rgba(201,168,76,.4);border-radius:3px;animation:ootkShuffleSpin 1.6s ease-in-out;animation-fill-mode:both;box-shadow:0 2px 6px rgba(0,0,0,.5)}',
      '@keyframes ootkShuffleSpin{0%{transform:translate(0,0) rotate(0deg);opacity:0}10%{opacity:1}50%{transform:translate(calc(cos(calc(var(--i)*15deg))*60px),calc(sin(calc(var(--i)*15deg))*60px)) rotate(calc(var(--i)*15deg))}100%{transform:translate(0,0) rotate(0deg);opacity:.6}}',
      // v63 CSS marker: ═══ v63 飛卡 ═══
      '.ootk-fly-card-v63{position:absolute;width:20px;height:30px;background:url(\"/tarot_img/card-back.jpg\") center/cover #2a1d08;border:1px solid rgba(201,168,76,.5);border-radius:2px;transition:all .45s cubic-bezier(.4,.1,.3,1);opacity:.95;z-index:5;pointer-events:none;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.5)}',
      '.ootk-fly-card-v63.with-img{box-shadow:0 2px 8px rgba(0,0,0,.6),0 0 8px rgba(201,168,76,.3)}',
      '.ootk-fly-card-v63.landed{opacity:.7;border-color:rgba(201,168,76,.3)}',
      // v63 CSS marker: ═══ v63 ③ Op1 YHVH 四元素堆 ═══
      '.ootk-op1-scene{position:relative;width:100%;max-width:380px;min-height:260px;margin:0 auto}',
      '.ootk-op1-deck{position:absolute;top:8px;left:50%;width:32px;height:50px;margin-left:-16px;background:url(\"/tarot_img/card-back.jpg\") center/cover #2a1d08;border:1px solid rgba(201,168,76,.5);border-radius:3px;display:flex;align-items:center;justify-content:center;color:var(--c-gold);font-size:.62rem;font-weight:700;box-shadow:0 4px 12px rgba(0,0,0,.5);text-shadow:0 1px 2px #000}',
      '.ootk-op1-deck-count{font-size:.68rem;font-weight:700}',
      '.ootk-op1-piles{position:absolute;top:80px;left:0;right:0;display:grid;grid-template-columns:repeat(2,1fr);gap:.7rem;padding:0 .5rem}',
      '.ootk-op1-pile{position:relative;padding:.7rem .5rem;border:1px solid rgba(201,168,76,.12);border-radius:8px;background:rgba(255,255,255,.02);min-height:90px;transition:all .5s ease;text-align:center}',
      '.ootk-op1-pile-letter{position:absolute;top:.3rem;right:.4rem;font-size:1.1rem;color:var(--c-gold);opacity:.4;font-family:serif;font-weight:600}',
      '.ootk-op1-pile-stack{height:50px;width:36px;margin:0 auto .35rem;position:relative;background:url("/tarot_img/card-back.jpg") center/cover #2a1d08;border:1px solid rgba(201,168,76,.4);border-radius:3px;box-shadow:0 2px 4px rgba(0,0,0,.5),inset 0 -2px 0 rgba(0,0,0,.3),2px 1px 0 -1px rgba(50,30,10,.6),4px 2px 0 -2px rgba(50,30,10,.4)}',
      '.ootk-op1-pile-meta{font-size:.7rem}',
      '.ootk-op1-pile-label{font-weight:700;color:var(--c-text);font-size:.78rem}',
      '.ootk-op1-pile-meaning{color:var(--c-text-dim);font-size:.62rem;margin-top:.1rem}',
      '.ootk-op1-pile-count{color:var(--c-gold);font-size:.68rem;margin-top:.2rem;font-weight:600}',
      '.ootk-op1-pile.spotlight{box-shadow:0 0 24px rgba(201,168,76,.45);border-color:rgba(201,168,76,.6);background:rgba(201,168,76,.08)}',
      '.ootk-op1-pile.found{box-shadow:0 0 36px rgba(201,168,76,.7);border-color:var(--c-gold);background:rgba(201,168,76,.16);transform:scale(1.06);animation:ootkV63Pulse 1.4s ease-in-out 2}',
      '.ootk-op1-pile.dimmed{opacity:.3;transform:scale(.95)}',
      '@keyframes ootkV63Pulse{0%,100%{box-shadow:0 0 24px rgba(201,168,76,.4)}50%{box-shadow:0 0 48px rgba(201,168,76,.8)}}',
      // v63 CSS marker: ═══ v63 ③ Op2 12 宮位 ═══
      '.ootk-op2-scene{padding:1rem 0;display:flex;justify-content:center}',
      '.ootk-op2-wheel{position:relative;width:280px;height:280px;border-radius:50%;background:radial-gradient(circle at center,rgba(96,165,250,.06) 0%,rgba(96,165,250,.02) 50%,transparent 80%);box-shadow:0 0 40px rgba(96,165,250,.08),inset 0 0 30px rgba(0,0,0,.4)}',
      '.ootk-op2-svg{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}',
      '.ootk-op2-ring-outer{fill:none;stroke:rgba(96,165,250,.25);stroke-width:1.5}',
      '.ootk-op2-ring-inner{fill:rgba(0,0,0,.3);stroke:rgba(201,168,76,.3);stroke-width:1}',
      '.ootk-op2-spoke{stroke:rgba(96,165,250,.18);stroke-width:1;transition:stroke .6s ease}',
      '.ootk-op2-spoke.lit{stroke:rgba(201,168,76,.7);stroke-width:1.5}',
      '.ootk-op2-axis-lbl{fill:rgba(201,168,76,.6);font-size:9px;font-weight:600;letter-spacing:1px;font-family:serif}',
      '.ootk-op2-center{position:absolute;width:60px;height:60px;border-radius:50%;background:radial-gradient(circle at 30% 30%,rgba(201,168,76,.4),rgba(201,168,76,.1));border:1.5px solid var(--c-gold);display:flex;align-items:center;justify-content:center;box-shadow:0 0 24px rgba(201,168,76,.4),inset 0 0 12px rgba(0,0,0,.4);z-index:5}',
      '.ootk-op2-center-inner{font-size:.66rem;font-weight:700;color:var(--c-gold);letter-spacing:2px;text-shadow:0 1px 2px rgba(0,0,0,.6)}',
      '.ootk-op2-house{position:absolute;border-radius:50%;background:rgba(96,165,250,.05);border:1px solid rgba(96,165,250,.2);display:flex;flex-direction:column;align-items:center;justify-content:center;color:rgba(96,165,250,.6);transition:all .4s ease;z-index:3}',
      '.ootk-op2-house-num{font-size:.7rem;font-weight:700;color:rgba(96,165,250,.95);line-height:1}',
      '.ootk-op2-house-desc{font-size:.48rem;opacity:.7;margin-top:1px;letter-spacing:.3px}',
      '.ootk-op2-house-count{font-size:.5rem;color:rgba(255,255,255,.55);margin-top:1px;font-weight:700}',
      '.ootk-op2-house.flash{background:rgba(96,165,250,.22);border-color:rgba(96,165,250,.7);box-shadow:0 0 14px rgba(96,165,250,.4)}',
      '.ootk-op2-house.spotlight{box-shadow:0 0 22px rgba(96,165,250,.55);border-color:rgba(96,165,250,.8);background:rgba(96,165,250,.18);transform:scale(1.15);z-index:4}',
      '.ootk-op2-house.found{box-shadow:0 0 36px rgba(201,168,76,.85),0 0 12px rgba(201,168,76,.6);border:2px solid var(--c-gold);background:radial-gradient(circle at center,rgba(201,168,76,.25),rgba(201,168,76,.1));transform:scale(1.3);z-index:6;animation:ootkV63Pulse 1.4s ease-in-out 2}',
      '.ootk-op2-house.found .ootk-op2-house-num,.ootk-op2-house.found .ootk-op2-house-desc,.ootk-op2-house.found .ootk-op2-house-count{color:var(--c-gold)}',
      '.ootk-op2-house.dimmed{opacity:.25;transform:scale(.88)}',
      '.ootk-op2-fly{position:absolute;width:22px;height:34px;border:1px solid rgba(201,168,76,.6);border-radius:3px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.6),0 0 12px rgba(201,168,76,.3);z-index:8;transition:all .65s cubic-bezier(.34,1.56,.64,1);pointer-events:none;background:url(\"/tarot_img/card-back.jpg\") center/cover #1a1208}',
      '.ootk-op2-fly img{width:100%;height:100%;object-fit:cover;display:block}',
      // v63 CSS marker: ═══ v63 ③ Op3 12 星座 ═══
      '.ootk-op3-scene{padding:1rem 0;display:flex;justify-content:center}',
      '.ootk-op3-zodiac{position:relative;width:280px;height:280px;border-radius:50%;background:radial-gradient(circle at center,rgba(168,85,247,.06) 0%,rgba(168,85,247,.02) 50%,transparent 80%);box-shadow:0 0 40px rgba(168,85,247,.08),inset 0 0 30px rgba(0,0,0,.4)}',
      '.ootk-op3-svg{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}',
      '.ootk-op3-ring-outer{fill:none;stroke:rgba(168,85,247,.25);stroke-width:1.5}',
      '.ootk-op3-ring-inner{fill:none;stroke:rgba(168,85,247,.18);stroke-width:1}',
      '.ootk-op3-spoke{stroke:rgba(168,85,247,.15);stroke-width:1;transition:stroke .6s ease}',
      '.ootk-op3-spoke.lit{stroke:rgba(201,168,76,.7);stroke-width:1.5}',
      '.ootk-op3-trump{position:absolute;top:50%;left:50%;width:140px;margin-left:-70px;margin-top:-30px;text-align:center;opacity:0;transform:scale(.8);transition:all .8s ease;z-index:5}',
      '.ootk-op3-trump.show{opacity:1;transform:scale(1)}',
      '.ootk-op3-trump-label{font-size:.6rem;color:var(--c-text-dim);letter-spacing:2px;margin-bottom:.3rem}',
      '.ootk-op3-trump-name{font-size:1rem;font-weight:700;color:var(--c-gold);letter-spacing:1px;text-shadow:0 0 12px rgba(201,168,76,.5)}',
      '.ootk-op3-sign{position:absolute;border-radius:50%;border:1px solid rgba(168,85,247,.25);background:rgba(168,85,247,.05);display:flex;flex-direction:column;align-items:center;justify-content:center;color:rgba(168,85,247,.6);opacity:0;transform:scale(.5);transition:all .4s cubic-bezier(.34,1.56,.64,1);z-index:3}',
      '.ootk-op3-sign.show{opacity:1;transform:scale(1)}',
      '.ootk-op3-sign-icon{font-size:.95rem;font-weight:700;line-height:1}',
      '.ootk-op3-sign-name{font-size:.46rem;margin-top:1px;opacity:.85;letter-spacing:.3px}',
      '.ootk-op3-sign.flash{background:rgba(168,85,247,.22);border-color:rgba(168,85,247,.7);box-shadow:0 0 14px rgba(168,85,247,.4)}',
      '.ootk-op3-sign.spotlight{box-shadow:0 0 22px rgba(168,85,247,.55);border-color:rgba(168,85,247,.85);background:rgba(168,85,247,.18);transform:scale(1.18);color:rgba(168,85,247,1);z-index:4}',
      '.ootk-op3-sign.found{box-shadow:0 0 36px rgba(201,168,76,.85),0 0 12px rgba(201,168,76,.6);border:2px solid var(--c-gold);background:radial-gradient(circle at center,rgba(201,168,76,.25),rgba(201,168,76,.1));color:var(--c-gold);transform:scale(1.35);z-index:6;animation:ootkV63Pulse 1.4s ease-in-out 2}',
      '.ootk-op3-sign.dimmed{opacity:.25;transform:scale(.88)}',
      '.ootk-op3-fly{position:absolute;width:22px;height:34px;border:1px solid rgba(201,168,76,.6);border-radius:3px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.6),0 0 12px rgba(201,168,76,.3);z-index:8;transition:all .65s cubic-bezier(.34,1.56,.64,1);pointer-events:none;background:url(\"/tarot_img/card-back.jpg\") center/cover #1a1208}',
      '.ootk-op3-fly img{width:100%;height:100%;object-fit:cover;display:block}',
      // v63 CSS marker: ═══ v63 ③ Op4 Sig 居中 + 36 環繞（最正統 Book T）═══
      '.ootk-op4-scene{display:flex;flex-direction:column;align-items:center;padding:.5rem 0}',
      '.ootk-op4-table{position:relative;width:320px;height:320px;border-radius:50%;background:url(\'/img/ootk/decan-ring-bg.png\') center/cover no-repeat;box-shadow:0 8px 32px rgba(0,0,0,.6),inset 0 0 60px rgba(0,0,0,.4)}',
      '.ootk-op4-bg{position:absolute;inset:0;border-radius:50%;background:radial-gradient(circle at center,transparent 35%,rgba(0,0,0,.5) 100%);pointer-events:none}',
      // ─── Op4 Sig 居中（顯示真實牌照）───
      '.ootk-op4-sig{position:absolute;top:50%;left:50%;width:78px;height:118px;margin-left:-39px;margin-top:-59px;border-radius:6px;border:2px solid var(--c-gold);overflow:hidden;box-shadow:0 0 32px rgba(201,168,76,.6),0 4px 16px rgba(0,0,0,.6);opacity:0;transform:scale(.5);transition:opacity 1s ease,transform 1s cubic-bezier(.34,1.56,.64,1),box-shadow 1s ease;z-index:5}',
      '.ootk-op4-sig.show{opacity:1;transform:scale(1);box-shadow:0 0 48px rgba(201,168,76,.85),0 0 16px rgba(201,168,76,.6)}',
      '.ootk-op4-sig-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border-radius:4px;display:block}',
      '.ootk-op4-sig-overlay{position:absolute;inset:0;background:linear-gradient(180deg,transparent 50%,rgba(0,0,0,.85) 100%);display:flex;flex-direction:column;justify-content:flex-end;align-items:center;padding:.4rem .2rem;border-radius:4px}',
      '.ootk-op4-sig-name{font-size:.62rem;color:var(--c-gold);font-weight:700;text-align:center;line-height:1.15;letter-spacing:.3px;text-shadow:0 1px 2px rgba(0,0,0,.9)}',
      '.ootk-op4-sig-label{font-size:.42rem;color:rgba(255,255,255,.6);letter-spacing:2px;margin-top:.15rem;text-shadow:0 1px 2px rgba(0,0,0,.9)}',
      // ─── Op4 環繞 36 張牌（顯示真實牌照）───
      '.ootk-op4-ring-card{position:absolute;width:22px;height:34px;border:1px solid rgba(201,168,76,.3);border-radius:2px;overflow:hidden;opacity:0;transition:opacity .5s ease;transform-origin:center;box-shadow:0 1px 3px rgba(0,0,0,.5);z-index:2;background:url(\"/tarot_img/card-back.jpg\") center/cover #2a1d08}',
      '.ootk-op4-ring-card.show{opacity:.95}',
      '.ootk-op4-ring-card img{width:100%;height:100%;object-fit:cover;display:block}',
      '.ootk-op4-decan-info{margin-top:1rem;padding:.6rem 1rem;border-radius:8px;background:rgba(234,179,8,.05);border:1px solid rgba(234,179,8,.2);text-align:center;opacity:0;transform:translateY(8px);transition:all .6s ease;max-width:280px}',
      '.ootk-op4-decan-info.show{opacity:1;transform:translateY(0)}',
      '.ootk-op4-decan-label{font-size:.62rem;color:var(--c-text-dim);letter-spacing:2px;margin-bottom:.2rem}',
      '.ootk-op4-decan-sign{font-size:.85rem;color:rgba(234,179,8,.95);font-weight:700;letter-spacing:.5px}',
      '.ootk-op4-decan-planet{font-size:.68rem;color:var(--c-text-muted);margin-top:.15rem}',
      // v63 CSS marker: ═══ v63 ③ Op5 生命之樹 ═══
      '.ootk-op5-scene{padding:.5rem 0;display:flex;justify-content:center}',
      '.ootk-op5-tree{position:relative;width:232px;height:336px}',
      '.ootk-op5-tree-bg{position:absolute;inset:0;background:url(\'/img/ootk/tree-of-life.png\') center/contain no-repeat;opacity:.18;pointer-events:none}',
      '.ootk-op5-svg{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}',
      '.ootk-op5-path{stroke:rgba(34,197,94,.12);stroke-width:1.2;fill:none;transition:stroke 1s ease}',
      '.ootk-op5-path.lit{stroke:rgba(201,168,76,.4);stroke-width:1.4}',
      '.ootk-op5-path.gold-lit{stroke:rgba(201,168,76,.95);stroke-width:2;filter:drop-shadow(0 0 4px rgba(201,168,76,.6))}',
      '.ootk-op5-node{position:absolute;width:32px;height:32px;border-radius:50%;background:radial-gradient(circle at center,rgba(34,197,94,.15) 0%,rgba(34,197,94,.04) 60%,transparent 100%);border:1.5px solid rgba(34,197,94,.25);display:flex;flex-direction:column;align-items:center;justify-content:center;color:rgba(34,197,94,.5);opacity:0;transform:scale(.5);transition:all .5s cubic-bezier(.34,1.56,.64,1);z-index:2}',
      '.ootk-op5-node.show{opacity:1;transform:scale(1)}',
      '.ootk-op5-node-num{font-size:.62rem;font-weight:700}',
      '.ootk-op5-node-name{font-size:.45rem;opacity:.7;margin-top:-1px}',
      '.ootk-op5-node.flash{background:radial-gradient(circle at center,rgba(34,197,94,.35),rgba(34,197,94,.1));box-shadow:0 0 14px rgba(34,197,94,.5);border-color:rgba(34,197,94,.7)}',
      '.ootk-op5-node.spotlight{box-shadow:0 0 18px rgba(34,197,94,.5);border-color:rgba(34,197,94,.7);transform:scale(1.18)}',
      '.ootk-op5-node.found{box-shadow:0 0 32px rgba(201,168,76,.85),0 0 12px rgba(201,168,76,.6);border:2px solid var(--c-gold);background:radial-gradient(circle at center,rgba(201,168,76,.3) 0%,rgba(201,168,76,.1) 60%,transparent 100%);color:var(--c-gold);transform:scale(1.4);z-index:6;animation:ootkV63Pulse 1.4s ease-in-out 2}',
      '.ootk-op5-node.dimmed{opacity:.25;transform:scale(.85)}',
      '.ootk-op5-fly{position:absolute;width:18px;height:28px;border:1px solid rgba(201,168,76,.6);border-radius:2px;overflow:hidden;box-shadow:0 1px 5px rgba(0,0,0,.5),0 0 8px rgba(201,168,76,.3);z-index:7;transition:all .65s cubic-bezier(.34,1.56,.64,1);pointer-events:none;background:url(\"/tarot_img/card-back.jpg\") center/cover #1a1208}',
      '.ootk-op5-fly img{width:100%;height:100%;object-fit:cover;display:block}',
      '.ootk-op5-sig-card{position:absolute;top:50%;left:50%;width:52px;height:78px;margin-left:-26px;margin-top:-39px;border-radius:5px;border:2px solid var(--c-gold);overflow:hidden;opacity:0;transform:scale(.4);transition:opacity .8s ease,transform .8s cubic-bezier(.34,1.56,.64,1);box-shadow:0 0 24px rgba(201,168,76,.6),0 4px 12px rgba(0,0,0,.7);z-index:8;background:#1a1208}',
      '.ootk-op5-sig-card.show{opacity:1;transform:scale(1)}',
      '.ootk-op5-sig-card img{width:100%;height:100%;object-fit:cover;display:block}',
      '.ootk-op5-sig-overlay{position:absolute;left:0;right:0;bottom:0;background:linear-gradient(180deg,transparent 0%,rgba(0,0,0,.85) 100%);padding:.25rem .15rem;text-align:center}',
      '.ootk-op5-sig-name{font-size:.5rem;color:var(--c-gold);font-weight:700;letter-spacing:.3px;text-shadow:0 1px 2px #000}',
      // v63 CSS marker: ═══ v63 ⑤ Counting Story 路徑 ═══
      '.ootk-counting-scene{padding:1rem 0;display:flex;flex-direction:column;align-items:center}',
      '.ootk-counting-track{display:flex;flex-wrap:wrap;justify-content:center;align-items:center;gap:.3rem;max-width:420px;margin-bottom:1rem}',
      '.ootk-counting-card{display:inline-flex;align-items:center;gap:.3rem;opacity:0;transform:translateY(8px) scale(.9);transition:all .5s cubic-bezier(.34,1.56,.64,1)}',
      '.ootk-counting-card.show{opacity:1;transform:translateY(0) scale(1)}',
      '.ootk-counting-card-inner{padding:.4rem .55rem;border-radius:6px;border:1px solid rgba(201,168,76,.3);background:linear-gradient(135deg,rgba(201,168,76,.1),rgba(201,168,76,.03));box-shadow:0 2px 8px rgba(0,0,0,.3);min-width:62px;text-align:center}',
      '.ootk-counting-card-inner.reversed{border-color:rgba(180,80,80,.5);background:linear-gradient(135deg,rgba(180,80,80,.12),rgba(180,80,80,.04))}',
      '.ootk-counting-card-inner.reversed .ootk-counting-card-name{transform:rotate(180deg);display:inline-block}',
      '.ootk-counting-card-name{font-size:.7rem;font-weight:700;color:var(--c-gold);line-height:1.2}',
      '.ootk-counting-card-inner.reversed .ootk-counting-card-name{color:rgba(220,140,140,.95)}',
      '.ootk-counting-card-val{font-size:.55rem;color:var(--c-text-dim);margin-top:.1rem;letter-spacing:.5px}',
      '.ootk-counting-arrow{font-size:1rem;color:var(--c-gold);opacity:0;transition:opacity .5s ease;font-weight:700}',
      '.ootk-counting-arrow.show{opacity:.7}',
      '.ootk-counting-summary{opacity:0;transform:translateY(6px);transition:all .6s ease;max-width:380px;padding:.6rem .8rem;border-radius:8px;background:rgba(201,168,76,.05);border:1px solid rgba(201,168,76,.15);text-align:center}',
      '.ootk-counting-summary.show{opacity:1;transform:translateY(0)}',
      '.ootk-counting-meta{font-size:.72rem;color:var(--c-text);margin-bottom:.3rem}',
      '.ootk-counting-end{font-size:.68rem;color:var(--c-text-dim);margin-bottom:.3rem;line-height:1.5}',
      '.ootk-counting-note{font-size:.62rem;color:var(--c-gold);opacity:.85;line-height:1.6;font-style:italic}',
      // v63 CSS marker: ═══ v63 ⑥ Pairing Story ═══
      '.ootk-pairing-scene{padding:1rem 0;display:flex;flex-direction:column;align-items:center}',
      '.ootk-pairing-grid{display:flex;flex-direction:column;gap:.4rem;max-width:380px;width:100%;padding:0 .5rem}',
      '.ootk-pairing-center{display:flex;justify-content:center;margin-bottom:.4rem}',
      '.ootk-pairing-sig{padding:.4rem .8rem;border-radius:6px;background:linear-gradient(135deg,rgba(201,168,76,.3),rgba(201,168,76,.12));border:1px solid var(--c-gold);font-size:.72rem;font-weight:700;color:var(--c-gold);letter-spacing:1px;box-shadow:0 0 16px rgba(201,168,76,.3)}',
      '.ootk-pairing-row{display:grid;grid-template-columns:1fr auto 1fr;gap:.4rem;align-items:center;opacity:0;transform:translateX(-12px);transition:all .5s ease}',
      '.ootk-pairing-row.show{opacity:1;transform:translateX(0)}',
      '.ootk-pairing-side{display:flex;justify-content:center}',
      '.ootk-pairing-side.left{justify-content:flex-end}',
      '.ootk-pairing-side.right{justify-content:flex-start}',
      '.ootk-pairing-card{padding:.35rem .5rem;border-radius:5px;background:rgba(201,168,76,.06);border:1px solid rgba(201,168,76,.25);font-size:.66rem;color:var(--c-text);font-weight:600;text-align:center;min-width:72px;line-height:1.2}',
      '.ootk-pairing-card.reversed{background:rgba(180,80,80,.08);border-color:rgba(180,80,80,.35);color:rgba(220,140,140,.95)}',
      '.ootk-pairing-card.reversed{transform:rotate(180deg)}',
      '.ootk-pairing-link{position:relative;display:flex;flex-direction:column;align-items:center;gap:.1rem;min-width:80px}',
      '.ootk-pairing-link-line{width:100%;height:1.5px;background:linear-gradient(90deg,transparent 0%,rgba(201,168,76,.5) 50%,transparent 100%);position:relative}',
      '.ootk-pairing-link-num{font-size:.52rem;color:var(--c-gold);font-weight:700;letter-spacing:.5px;margin-top:.1rem}',
      '.ootk-pairing-link-dig{font-size:.5rem;color:var(--c-text-dim);font-weight:600;letter-spacing:.3px}',
      '.ootk-pairing-link.dig-strong .ootk-pairing-link-line{background:linear-gradient(90deg,transparent,rgba(201,168,76,.9),transparent);box-shadow:0 0 6px rgba(201,168,76,.6)}',
      '.ootk-pairing-link.dig-strong .ootk-pairing-link-dig{color:rgba(201,168,76,.9)}',
      '.ootk-pairing-link.dig-friendly .ootk-pairing-link-line{background:linear-gradient(90deg,transparent,rgba(96,165,250,.7),transparent)}',
      '.ootk-pairing-link.dig-friendly .ootk-pairing-link-dig{color:rgba(96,165,250,.85)}',
      '.ootk-pairing-link.dig-neutral .ootk-pairing-link-line{background:linear-gradient(90deg,transparent,rgba(150,150,150,.4),transparent)}',
      '.ootk-pairing-link.dig-neutral .ootk-pairing-link-dig{color:rgba(180,180,180,.7)}',
      '.ootk-pairing-link.dig-contrary .ootk-pairing-link-line{background:linear-gradient(90deg,transparent,rgba(180,80,80,.6),transparent);height:1px;opacity:.6}',
      '.ootk-pairing-link.dig-contrary .ootk-pairing-link-dig{color:rgba(220,140,140,.85)}',
      '.ootk-pairing-note{margin-top:.8rem;font-size:.62rem;color:var(--c-gold);opacity:0;transform:translateY(4px);transition:all .6s ease;font-style:italic;letter-spacing:.5px}',
      '.ootk-pairing-note.show{opacity:.85;transform:translateY(0)}',
      // v63 CSS marker: ═══ v63 響應式 ═══
      '@media (max-width:480px){.ootk-invoc-scroll{padding:50px 30px 40px;max-width:90%}.ootk-invoc-en{font-size:.7rem}.ootk-invoc-zh{font-size:.78rem}.ootk-op4-table{width:280px;height:280px}.ootk-op2-wheel,.ootk-op3-zodiac{width:240px;height:240px}}',
      // ═══ v63 ★ 共用：金光擴散圈 + 洗牌真實牌閃現 ═══
      '.ootk-burst{position:absolute;width:160px;height:160px;border-radius:50%;border:2px solid rgba(201,168,76,.7);background:radial-gradient(circle,rgba(201,168,76,.2) 0%,transparent 70%);opacity:0;transform:scale(.3);animation:ootkBurstExpand 1.4s ease-out forwards;pointer-events:none;z-index:10}',
      '.ootk-burst.inner{width:100px;height:100px;border-color:rgba(255,230,180,.9);background:radial-gradient(circle,rgba(255,230,180,.35) 0%,transparent 60%);animation-duration:1.1s}',
      '@keyframes ootkBurstExpand{0%{opacity:0;transform:scale(.3)}20%{opacity:1}100%{opacity:0;transform:scale(2.4)}}',
      '.ootk-shuffle-flash{position:absolute;top:50%;left:50%;width:60px;height:90px;margin-left:-30px;margin-top:-45px;border-radius:5px;border:1.5px solid rgba(201,168,76,.7);overflow:hidden;opacity:0;transform:scale(.4);transition:opacity .4s ease,transform .4s cubic-bezier(.34,1.56,.64,1);z-index:7;box-shadow:0 0 20px rgba(201,168,76,.5),0 4px 10px rgba(0,0,0,.6);background:#1a1208}',
      '.ootk-shuffle-flash img{width:100%;height:100%;object-fit:cover;display:block}',
      '.ootk-shuffle-flash.show{opacity:1;transform:scale(1)}',
      '.ootk-shuffle-flash.out{opacity:0;transform:scale(1.4)}',
      '@media(prefers-reduced-motion:reduce){.ootk-kc-flip,.ootk-kc-inner{animation:none!important;opacity:1;transform:none}.ootk-hcell,.ootk-znode,.ootk-seph{transition:none;opacity:1;transform:none}.ootk-burst{display:none}}'
    ].join('\n');
    document.head.appendChild(s);
  }

  // ── Significator 選擇畫面 ──
  function _showSignificatorSelection(onSelect) {
    _injectOOTKStyles();
    var overlay = document.createElement('div');
    overlay.className = 'ootk-overlay';
    overlay.id = 'ootk-sig-overlay';

    // ─────────────────────────────────────────────────────────
    // v69.9.4 修正:沒填生辰時不該顯示假的「系統推薦」
    // 舊邏輯:沒填 bdate 時 fallback 用「1990-01-15」(誤判為摩羯) → 假推薦
    // 正統做法(Mathers Manuscript Q 1888):
    //   ① 看外貌(髮色 + 性別) — 風 wand 火紅髮 / 杯 cup 中等 / 劍 sword 深 / 幣 pent 極深
    //   ② Crowley 派:看性格直覺
    //   ③ PHB 簡化派(2004):用 sun sign 對應 court card(只有有生日才能用)
    // 修法:沒填生辰 → 不顯示自動推薦,改顯「依直覺/外貌挑一張」+ 16 張宮廷牌
    //       有填生辰 → 維持 PHB 派自動推薦,但加註「PHB 簡化派,亦可憑直覺改選」
    // ─────────────────────────────────────────────────────────
    var form = S.form || {};
    var bdate = form.bdate || '';
    var hasBirth = !!(bdate && bdate.length >= 8);  // YYYY-MM-DD 至少 8 字元

    var auto = null;
    var autoCard = null;
    var autoId = -1;

    if (hasBirth) {
      // 只在真的有填生辰時才算自動推薦
      var parts = bdate.split('-');
      var bMonth = parts[1] ? parseInt(parts[1]) : 1;
      var bDay = parts[2] ? parseInt(parts[2]) : 15;
      var gender = form.gender || '';
      var birthYear = parts[0] ? parseInt(parts[0]) : 1990;
      var age = new Date().getFullYear() - birthYear;
      auto = window.ootkAutoSignificator ? window.ootkAutoSignificator(bMonth, bDay, gender, age) : null;
      autoCard = auto ? auto.card : null;
      autoId = autoCard ? autoCard.id : -1;
    }

    // 取所有宮廷牌
    var courtCards = [];
    if (typeof TAROT !== 'undefined') {
      for (var i = 0; i < TAROT.length; i++) {
        var c = TAROT[i];
        if (c.suit === 'major') continue;
        var n = (c.n || '').toLowerCase();
        if (/國王|皇后|騎士|侍者|侍從/.test(c.n)) courtCards.push(c);
      }
    }

    var html = '';
    html += '<div style="text-align:center;max-width:420px;width:100%;margin:0 auto">';
    html += '<div style="font-size:1.1rem;font-weight:700;color:var(--c-gold);margin-bottom:.3rem">✦ 開鑰之法 ✦</div>';
    html += '<div style="font-size:.78rem;color:var(--c-text-dim);margin-bottom:.6rem">金色黎明最高階占卜・五個階段</div>';
    html += '<div style="font-size:.82rem;color:var(--c-text,#e0d8c8);line-height:1.7;margin-bottom:1rem;padding:0 .5rem">從四元素到生命之樹，逐層深入你的問題核心。<br>首先，選擇代表你的「代表牌」。</div>';

    // 自動推薦(只在有生辰時才顯示)
    if (hasBirth && autoCard) {
      var imgSrc = (typeof getTarotCardImage === 'function') ? getTarotCardImage(autoCard) : '';
      html += '<div style="padding:.8rem;border-radius:12px;border:1px solid rgba(201,168,76,.25);background:rgba(201,168,76,.05);margin-bottom:1rem">';
      html += '<div style="font-size:.75rem;color:var(--c-gold);margin-bottom:.5rem">PHB 派依太陽星座推薦(' + (auto.sign || '') + '・' + (auto.element || '') + '元素):</div>';
      html += '<div style="display:flex;align-items:center;justify-content:center;gap:.8rem">';
      if (imgSrc) html += '<img id="ootk-selected-img" src="' + imgSrc + '" style="width:64px;height:102px;border-radius:6px;object-fit:cover;border:1px solid rgba(255,255,255,.1)">';
      html += '<div style="text-align:left">';
      html += '<div id="ootk-selected-name" style="font-size:.95rem;font-weight:700;color:var(--c-gold-pale,#f5e6b8)">' + (autoCard.n || '') + '</div>';
      html += '<div style="font-size:.72rem;color:var(--c-text-dim);margin-top:.2rem">' + (auto.element || '') + '元素宮廷牌</div>';
      html += '</div></div>';
      html += '<button id="ootk-use-auto" style="margin-top:.6rem;padding:.5rem 1.5rem;border-radius:20px;background:transparent;border:1px solid rgba(255,255,255,.1);color:var(--c-gold);font-weight:700;font-size:.85rem;cursor:pointer;font-family:inherit">用這張，開始占卜</button>';
      html += '<div style="font-size:.65rem;color:var(--c-text-muted);margin-top:.4rem;line-height:1.5;font-style:italic">※ Mathers/Crowley 正統建議憑直覺或外貌選,可改選下方</div>';
      html += '</div>';
    } else {
      // 沒填生辰 → 顯示 Mathers 原典指引(取代假推薦)
      html += '<div style="padding:.9rem 1rem;border-radius:12px;border:1px solid rgba(201,168,76,.2);background:rgba(201,168,76,.04);margin-bottom:1rem;text-align:left">';
      html += '<div style="font-size:.78rem;color:var(--c-gold);font-weight:600;margin-bottom:.5rem;text-align:center">✦ Mathers 正統選法 ✦</div>';
      html += '<div style="font-size:.72rem;color:var(--c-text,#e0d8c8);line-height:1.85">';
      html += '<div style="margin-bottom:.4rem"><b style="color:var(--c-gold-pale,#f5e6b8)">花色 — 看外貌或直覺</b></div>';
      html += '<div style="padding-left:.5rem;color:var(--c-text-dim)">';
      html += '・<b>權杖</b>:金髮/紅髮、膚色白皙<br>';
      html += '・<b>聖杯</b>:中等膚色、溫和氣質<br>';
      html += '・<b>寶劍</b>:深色頭髮、銳利氣質<br>';
      html += '・<b>錢幣</b>:極深色髮、沉穩務實<br>';
      html += '</div>';
      html += '<div style="margin-top:.5rem;margin-bottom:.4rem"><b style="color:var(--c-gold-pale,#f5e6b8)">階級 — 看性別與成熟度</b></div>';
      html += '<div style="padding-left:.5rem;color:var(--c-text-dim)">';
      html += '・<b>國王</b>:成年男性／<b>皇后</b>:成年女性<br>';
      html += '・<b>騎士</b>:年輕男性／<b>侍者</b>:年輕女性<br>';
      html += '</div>';
      html += '<div style="margin-top:.6rem;color:var(--c-text-muted);font-size:.66rem;font-style:italic;text-align:center">憑直覺挑一張你最有感覺的</div>';
      html += '</div>';
      html += '</div>';
    }

    // 手動選擇
    html += '<div style="font-size:.75rem;color:var(--c-text-muted);margin-bottom:.6rem">' + (hasBirth ? '或直接選擇代表你的宮廷牌:' : '從 16 張宮廷牌挑一張:') + '</div>';
    html += '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:.5rem;max-height:320px;overflow-y:auto;padding:.4rem;-webkit-overflow-scrolling:touch">';
    courtCards.forEach(function(cc) {
      var img = (typeof getTarotCardImage === 'function') ? getTarotCardImage(cc) : '';
      var isAuto = (cc.id === autoId);
      html += '<div class="ootk-manual-sig" data-id="' + cc.id + '" style="text-align:center;cursor:pointer;padding:.4rem .3rem;border-radius:10px;border:1.5px solid ' + (isAuto ? 'rgba(201,168,76,.5)' : 'rgba(255,255,255,.08)') + ';background:' + (isAuto ? 'rgba(201,168,76,.06)' : 'rgba(255,255,255,.02)') + ';transition:all .2s;-webkit-tap-highlight-color:transparent">';
      if (img) html += '<img src="' + img + '" style="width:54px;height:86px;border-radius:5px;object-fit:cover;pointer-events:none">';
      html += '<div style="font-size:.62rem;color:var(--c-text-dim);margin-top:.2rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;pointer-events:none">' + (cc.n || '') + '</div>';
      html += '</div>';
    });
    html += '</div>';

    // 注入 hover/active 樣式
    html += '<style>';
    html += '.ootk-manual-sig:hover{border-color:rgba(201,168,76,.5)!important;background:rgba(201,168,76,.08)!important;box-shadow:none}';
    html += '.ootk-manual-sig:active{transform:scale(.94);box-shadow:0 0 20px rgba(201,168,76,.25) inset}';
    html += '</style>';

    // 關閉按鈕
    html += '<div style="margin-top:.8rem"><button id="ootk-cancel" style="padding:.5rem 1.2rem;border-radius:16px;background:transparent;border:1px solid rgba(255,255,255,.15);color:var(--c-text-dim);font-size:.78rem;cursor:pointer;font-family:inherit">取消</button></div>';
    html += '</div>';

    overlay.innerHTML = html;
    document.body.appendChild(overlay);

    // 事件綁定 — 阻止 overlay 背景點擊穿透
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) return; // 點背景不做事
    });
    document.getElementById('ootk-cancel').addEventListener('click', function(e) { e.stopPropagation(); overlay.remove(); });
    var _selectedSigId = autoId; // 預設為自動推薦
    overlay.querySelectorAll('.ootk-manual-sig').forEach(function(el) {
      el.addEventListener('click', function(e) {
        e.stopPropagation();
        var clickedId = parseInt(el.dataset.id);
        _selectedSigId = clickedId;
        // 取消所有其他的選中狀態
        overlay.querySelectorAll('.ootk-manual-sig').forEach(function(other) {
          other.style.borderColor = 'rgba(255,255,255,.08)';
          other.style.background = 'rgba(255,255,255,.02)';
          other.style.boxShadow = 'none';
          other.style.transform = 'scale(1)';
        });
        // 選中當前
        el.style.borderColor = 'rgba(201,168,76,.8)';
        el.style.background = 'rgba(201,168,76,.08)';
        el.style.boxShadow = '0 0 16px rgba(201,168,76,.25)';
        el.style.transform = 'scale(1.05)';
        // 更新頂部顯示
        var topName = overlay.querySelector('#ootk-selected-name');
        var topImg = overlay.querySelector('#ootk-selected-img');
        var clickedCard = typeof TAROT !== 'undefined' ? TAROT.find(function(c){ return c.id === clickedId; }) : null;
        if (topName && clickedCard) topName.textContent = clickedCard.n || '';
        if (topImg && clickedCard && typeof getTarotCardImage === 'function') topImg.src = getTarotCardImage(clickedCard);
      });
    });
    // 確認按鈕（統一）
    var confirmBtn = overlay.querySelector('#ootk-use-auto');
    if (confirmBtn) {
      confirmBtn.textContent = '用這張，開始占卜';
      confirmBtn.onclick = function(e) {
        e.stopPropagation();
        overlay.remove();
        onSelect(_selectedSigId);
      };
    } else {
      // 沒有自動推薦卡（沒填生日）→ 在底部加確認按鈕
      var fallbackBtn = document.createElement('button');
      fallbackBtn.textContent = '用這張，開始占卜';
      fallbackBtn.style.cssText = 'margin-top:.8rem;padding:.5rem 1.5rem;border-radius:20px;background:transparent;border:1px solid rgba(255,255,255,.1);color:var(--c-gold);font-weight:700;font-size:.85rem;cursor:pointer;font-family:inherit';
      fallbackBtn.onclick = function(e) {
        e.stopPropagation();
        if (_selectedSigId < 0) { alert('請先選擇一張代表牌'); return; }
        overlay.remove();
        onSelect(_selectedSigId);
      };
      overlay.querySelector('div').appendChild(fallbackBtn);
    }
  }

  // ── 五階段動畫主控台 ──
  // ════════════════════════════════════════════════════════════════════
  // ★ v63 五階段動畫主控台 — 最正統 Book T 儀式版
  //
  // 六大儀式 (per stage):
  //   ① Invocation — Mathers IAO/HRU 召喚祝禱（首次）
  //   ② Shuffle — 78 張螺旋洗牌動畫
  //   ③ Deal — 各階段獨有的發牌儀式
  //          Op1: YHVH 切四元素堆
  //          Op2: 發到 12 宮位
  //          Op3: 發到 12 星座
  //          Op4: Sig 取出居中 + 36 張環繞
  //          Op5: 發到生命之樹 10 質點
  //   ④ Find Significator — 聚光燈逐堆掃過、Sig 那刻金光乍現
  //   ⑤ Counting Path — 從 Sig 出發、走過的牌依序高亮 + 連線
  //   ⑥ Pairing — 兩側對稱往內配對的光線連結
  //
  // 依據：Mathers Book T 原始手稿、Regardie《Golden Dawn》、
  //        Cicero《Magical Tarot》、Mary K. Greer 對 elemental dignities
  //        的權威解析
  // ════════════════════════════════════════════════════════════════════
  function _runOOTKSequence(significatorId) {
    _injectOOTKStyles();

    // ★ v64.1 正統 Mathers Book T:傳入問題文字以啟動 Op2/Op3 abandon 機制
    var questionText = '';
    try {
      questionText = (S && S.form && S.form.question) ? String(S.form.question) : '';
    } catch(_qe) { questionText = ''; }

    // 跑五階段計算(引擎已改為每階段獨立洗牌 + Mathers 二次重洗 abandon 邏輯)
    var results = null;
    try {
      results = window.ootkRunFull ? window.ootkRunFull(significatorId, questionText) : null;
    } catch(e) { console.error('[OOTK] runFull error:', e); alert('OOTK 計算引擎錯誤:' + e.message); return; }
    if (!results) { alert('OOTK 引擎未載入'); return; }

    // 欄位別名（新引擎 → 渲染器）
    if (results.op3) results.op3.rulingMajor = results.op3.signTrump || '';
    if (results.op4) results.op4.decanRuler = results.op4.decanPlanet || '';

    // 儲存到 S.tarot
    S.tarot = S.tarot || {};
    S.tarot.ootkResults = results;
    S.tarot.spreadType = 'ootk';
    S.tarot.spreadDef = { id: 'ootk', zh: '開鑰之法' };

    // ──────────────────────────────────────────────────────────────
    // 建立全螢幕展示 overlay（含召喚背景）
    // ──────────────────────────────────────────────────────────────
    var overlay = document.createElement('div');
    overlay.className = 'ootk-overlay';
    overlay.id = 'ootk-sequence-overlay';
    overlay.style.justifyContent = 'flex-start';
    overlay.style.paddingTop = '0';

    var html = '';

    // ① 召喚祝禱層（首次顯示，使用者點擊後消失進入主流程）
    html += '<div id="ootk-invocation" class="ootk-invocation-layer">';
    html += '  <div class="ootk-invoc-bg"></div>';
    html += '  <div class="ootk-invoc-angel"></div>';
    html += '  <div class="ootk-invoc-scroll">';
    html += '    <div class="ootk-invoc-title">✦ 開鑰之法 ✦</div>';
    html += '    <div class="ootk-invoc-subtitle">Opening of the Key</div>';
    html += '    <div class="ootk-invoc-divider">— Hermetic Order of the Golden Dawn —</div>';
    html += '    <div class="ootk-invoc-prayer">';
    html += '      <div class="ootk-invoc-en">';
    html += '        I invoke thee, I A O,<br>';
    html += '        that thou wilt send H R U,<br>';
    html += '        the great Angel that is set over<br>';
    html += '        the operations of this Secret Wisdom,<br>';
    html += '        to lay his hand invisibly upon<br>';
    html += '        these consecrated cards of art,<br>';
    html += '        that thereby we may obtain<br>';
    html += '        true knowledge of hidden things,<br>';
    html += '        to the glory of thine ineffable Name.<br>';
    html += '        Amen.';
    html += '      </div>';
    html += '      <div class="ootk-invoc-zh">';
    html += '        我以 IAO 之名召喚你，<br>';
    html += '        HRU——主掌此祕智運作的偉大天使，<br>';
    html += '        請你以無形之手按於此聖牌之上，<br>';
    html += '        使我們得見隱秘之真相，<br>';
    html += '        以彰汝不可名之榮光。<br>';
    html += '        Amen.';
    html += '      </div>';
    html += '    </div>';
    html += '    <button id="ootk-invoc-begin" class="ootk-invoc-btn">承接 · 開始儀式</button>';
    html += '  </div>';
    html += '</div>';

    // ② 主流程容器（召喚後出現）
    html += '<div id="ootk-main-flow" style="display:none;text-align:center;max-width:520px;width:100%;margin:0 auto">';

    // 頂部標題
    html += '  <div style="font-size:.85rem;color:var(--c-gold);font-weight:700;margin-bottom:.2rem;letter-spacing:2px">✦ 開鑰之法 ✦</div>';
    html += '  <div style="font-size:.62rem;color:var(--c-text-dim);margin-bottom:.6rem;letter-spacing:3px">OPENING · OF · THE · KEY</div>';

    // 進度點
    html += '  <div class="ootk-progress" id="ootk-dots">';
    for (var d = 0; d < 5; d++) html += '<div class="ootk-dot" data-idx="' + d + '"></div>';
    html += '  </div>';

    // 五個階段的內容區
    html += '  <div id="ootk-phases"></div>';

    // 底部按鈕
    html += '  <div id="ootk-actions" style="margin-top:1rem;display:flex;gap:.5rem;justify-content:center">';
    html += '    <button id="ootk-next" style="padding:.55rem 1.5rem;border-radius:20px;background:transparent;border:1px solid rgba(255,255,255,.1);color:var(--c-gold);font-weight:700;font-size:.85rem;cursor:pointer;font-family:inherit">開始第一階段 →</button>';
    html += '  </div>';
    html += '</div>';

    overlay.innerHTML = html;
    document.body.appendChild(overlay);

    // ──────────────────────────────────────────────────────────────
    // ① 召喚祝禱動畫節奏控制
    // ──────────────────────────────────────────────────────────────
    var invocLayer = document.getElementById('ootk-invocation');
    var mainFlow = document.getElementById('ootk-main-flow');
    var beginBtn = document.getElementById('ootk-invoc-begin');

    // 漸進式顯現：背景 → 天使 → 卷軸 → 祝禱詞 → 按鈕
    setTimeout(function() { invocLayer.classList.add('show-bg'); }, 200);
    setTimeout(function() { invocLayer.classList.add('show-angel'); }, 1200);
    setTimeout(function() { invocLayer.classList.add('show-scroll'); }, 2400);
    setTimeout(function() { invocLayer.classList.add('show-prayer'); }, 3600);
    setTimeout(function() { invocLayer.classList.add('show-btn'); }, 8500);

    beginBtn.onclick = function() {
      invocLayer.classList.add('fade-out');
      setTimeout(function() {
        invocLayer.style.display = 'none';
        mainFlow.style.display = 'block';
        // 進入第一階段
        startStageFlow();
      }, 900);
    };

    // ──────────────────────────────────────────────────────────────
    // 階段展示主控
    // ──────────────────────────────────────────────────────────────
    var currentPhase = -1;
    var phasesEl;
    var nextBtn;
    var _advanceLock = false;

    function startStageFlow() {
      phasesEl = document.getElementById('ootk-phases');
      nextBtn = document.getElementById('ootk-next');
      nextBtn.addEventListener('click', advancePhase);
    }

    function advancePhase() {
      if (_advanceLock) return;
      _advanceLock = true;
      try {
        currentPhase++;
        if (currentPhase >= 5) {
          _advanceLock = false;
          nextBtn.textContent = '🌙 靜月為你解讀(五次獨立讀盤)';
          nextBtn.onclick = function() {
            overlay.remove();
            if (typeof goStep === 'function') goStep('step-tarot');
            _triggerOOTKAI(results);
          };
          document.querySelectorAll('#ootk-dots .ootk-dot').forEach(function(dot) { dot.className = 'ootk-dot done'; });
          return;
        }

        // 更新 dots
        document.querySelectorAll('#ootk-dots .ootk-dot').forEach(function(dot, idx) {
          if (idx < currentPhase) dot.className = 'ootk-dot done';
          else if (idx === currentPhase) dot.className = 'ootk-dot current';
          else dot.className = 'ootk-dot';
        });

        nextBtn.style.opacity = '0.3';
        nextBtn.style.pointerEvents = 'none';

        // ════════════════════════════════════════════════
        // 每階段六儀式流程：洗牌 → 發牌 → 找Sig → Counting → Pairing → 顯示結果
        // ════════════════════════════════════════════════
        runStageRitual(currentPhase, function() {
          // 儀式跑完，顯示文字結果
          showPhaseContent();
        });
      } catch(err) {
        _advanceLock = false;
        console.error('[OOTK advancePhase] Error:', err);
        alert('階段載入失敗：' + err.message);
      }
    }

    function showPhaseContent() {
      _advanceLock = false;
      // ★ v64.1 inline HTML escape (避免 abandon 訊息中的 < > & 破壞 HTML)
      function _esc(s) {
        return String(s == null ? '' : s)
          .replace(/&/g, '&amp;').replace(/</g, '&lt;')
          .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
      }
      var opData = results['op' + (currentPhase + 1)];
      var label = OP_LABELS[currentPhase];
      var phaseDiv = document.createElement('div');
      phaseDiv.className = 'ootk-phase';

      // ★ v64.1 正統 Mathers Book T:abandon 警示 UI 渲染 + 用戶選擇
      // 資料層觸發的 abandon/弱訊號警示必須讓用戶看見並做選擇
      var abandonBanner = '';
      if (opData) {
        if (opData.abandonTriggered && opData.abandonReason) {
          // Op1 / Op2 abandon — 醒目紅色警示卡
          // v68.12:加「重抽整盤」按鈕,不再只顯示文字叫用戶手動關頁
          abandonBanner =
            '<div style="margin:1rem 0;padding:1.2rem;border-radius:12px;' +
            'border:2px solid #ef4444;background:linear-gradient(135deg,rgba(239,68,68,.18),rgba(239,68,68,.06));' +
            'box-shadow:0 0 24px rgba(239,68,68,.3),inset 0 0 12px rgba(239,68,68,.1);">' +
            '<div style="font-size:.95rem;font-weight:700;color:#fca5a5;margin-bottom:.6rem;letter-spacing:.05em">' +
              '🚨 Mathers Book T ABANDON 警示' +
            '</div>' +
            '<div style="font-size:.78rem;color:#fecaca;line-height:1.7;margin-bottom:.8rem">' +
              _esc(opData.abandonReason) +
            '</div>' +
            '<div style="font-size:.7rem;color:rgba(254,202,202,.8);line-height:1.7;margin-bottom:.9rem;font-style:italic">' +
              '依 Mathers Book T 原文,此 Op 經二次重洗 Sig 仍非合適位置——盤面在告訴你:' +
              '你心裡真正關心的議題,可能不是你問的這件事。<br>' +
              'Counting/Pairing 解讀仍可繼續(作為弱訊號參考),但 AI 會在解讀中標明此警示。' +
            '</div>' +
            '<div style="font-size:.7rem;color:rgba(255,200,150,.85);line-height:1.6;padding:.5rem .7rem;border-radius:6px;background:rgba(0,0,0,.25);border-left:2px solid #fbbf24;margin-bottom:.8rem">' +
              '★ Mathers 規範:你可以選擇「繼續讀(承認盤面更深訊息)」或「重抽整盤」。本次解讀預設為「繼續讀」。' +
            '</div>' +
            // ─── v68.12:重抽整盤實作按鈕 ───
            '<div style="display:flex;gap:.5rem;flex-wrap:wrap;justify-content:center">' +
              '<button onclick="if(confirm(\'確定要重抽整盤嗎?\\n\\n會回到首頁重新開始開鑰之法儀式,當前的盤面將不保留。\\n\\n(若你想保留當前解讀,請選 [取消],閉視此警示繼續讀。)\')){window.scrollTo(0,0);location.href=\'/\';}" ' +
                'style="padding:.55rem 1.1rem;border-radius:8px;border:1px solid rgba(239,68,68,.6);' +
                'background:linear-gradient(135deg,#dc2626,#991b1b);color:#fff;' +
                'font-size:.78rem;font-weight:700;cursor:pointer;letter-spacing:.05em;' +
                'box-shadow:0 2px 8px rgba(239,68,68,.4)">' +
                '🔄 重抽整盤' +
              '</button>' +
              '<button onclick="this.closest(\'div[style*=ef4444]\').style.opacity=\'0.4\';this.closest(\'div[style*=ef4444]\').style.pointerEvents=\'none\';" ' +
                'style="padding:.55rem 1.1rem;border-radius:8px;border:1px solid rgba(251,191,36,.5);' +
                'background:rgba(0,0,0,.3);color:#fbbf24;' +
                'font-size:.78rem;font-weight:600;cursor:pointer">' +
                '✓ 繼續讀(承認盤面更深訊息)' +
              '</button>' +
            '</div>' +
            '</div>';
        } else if (opData.weakSignalWarning && opData.weakSignalReason) {
          // Op3 弱訊號 — 黃色警示卡(較柔和)
          abandonBanner =
            '<div style="margin:1rem 0;padding:1rem;border-radius:10px;' +
            'border:1px solid rgba(251,191,36,.5);background:rgba(251,191,36,.08);">' +
            '<div style="font-size:.85rem;font-weight:700;color:#fbbf24;margin-bottom:.5rem">' +
              '⚠️ Op3 弱訊號警示(PHB 補充規則)' +
            '</div>' +
            '<div style="font-size:.74rem;color:rgba(254,243,199,.92);line-height:1.65">' +
              _esc(opData.weakSignalReason) +
            '</div>' +
            '</div>';
        } else if (opData.attempt === 2 && opData.retryNote) {
          // 二次重洗成功(第二次落合適位置)— 灰色資訊卡
          abandonBanner =
            '<div style="margin:.8rem 0;padding:.7rem .9rem;border-radius:8px;' +
            'border:1px dashed rgba(201,168,76,.35);background:rgba(201,168,76,.04);">' +
            '<div style="font-size:.7rem;color:rgba(212,175,55,.85);line-height:1.6">' +
              '⚙️ Mathers 二次重洗:' + _esc(opData.retryNote) +
            '</div>' +
            '</div>';
        } else if (opData.sephExpectationNote && opData.sephExpectationMet === false) {
          // Op5「找錯位不必然意味失敗」(Crowley)— 紫色觀察卡
          abandonBanner =
            '<div style="margin:1rem 0;padding:1rem 1.1rem;border-radius:10px;' +
            'border:1px solid rgba(168,85,247,.4);background:rgba(168,85,247,.06);">' +
            '<div style="font-size:.85rem;font-weight:700;color:#c4b5fd;margin-bottom:.5rem">' +
              '📍 Op5 預期觀察(Crowley「找錯位不必然意味失敗」)' +
            '</div>' +
            '<div style="font-size:.74rem;color:rgba(233,213,255,.92);line-height:1.65">' +
              _esc(opData.sephExpectationNote) +
            '</div>' +
            '</div>';
        } else if (opData.sephExpectationMet === true) {
          // Op5 預期符合 — 簡短綠色提示
          abandonBanner =
            '<div style="margin:.8rem 0;padding:.6rem .85rem;border-radius:8px;' +
            'border:1px dashed rgba(74,222,128,.3);background:rgba(74,222,128,.04);">' +
            '<div style="font-size:.7rem;color:rgba(134,239,172,.85);line-height:1.6">' +
              '✓ Op5 Sig 落合適 Sephirah:' + _esc(opData.sephExpectationNote) +
            '</div>' +
            '</div>';
        }
      }

      phaseDiv.innerHTML = abandonBanner + _renderPhase(currentPhase, label, opData, results);
      phasesEl.appendChild(phaseDiv);
      requestAnimationFrame(function() { requestAnimationFrame(function() { phaseDiv.classList.add('visible'); }); });
      setTimeout(function() { phaseDiv.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 300);
      nextBtn.style.opacity = '1';
      nextBtn.style.pointerEvents = 'auto';
      if (currentPhase < 4) {
        nextBtn.textContent = OP_LABELS[currentPhase + 1].zh + ' →';
      } else {
        nextBtn.textContent = '🌙 靜月為你解讀(五次獨立讀盤)';
        nextBtn.onclick = function() { overlay.remove(); if (typeof goStep === 'function') goStep('step-tarot'); _triggerOOTKAI(results); };
        document.querySelectorAll('#ootk-dots .ootk-dot').forEach(function(dot) { dot.className = 'ootk-dot done'; });
      }
    }

    // ════════════════════════════════════════════════════════════════
    // ★ 階段儀式總控：洗牌 → 發牌 → 找 Sig → Counting → Pairing
    // ════════════════════════════════════════════════════════════════
    function runStageRitual(phaseIdx, onComplete) {
      var ritualScene = document.createElement('div');
      ritualScene.className = 'ootk-ritual-scene';
      ritualScene.style.cssText = 'opacity:0;transition:opacity .5s;min-height:340px';
      phasesEl.appendChild(ritualScene);
      requestAnimationFrame(function() { ritualScene.style.opacity = '1'; });

      // 階段標題
      // ★ v63E 正統 Book T:加上「第 N 次獨立讀盤」副標,讓動畫上清楚顯示
      //    每個 Op 是 Mathers 原文「Shuffle, etc., as before」設計的獨立讀盤
      var stageTitle = document.createElement('div');
      stageTitle.className = 'ootk-stage-title';
      stageTitle.innerHTML =
        '<div class="ootk-stage-num">第 ' + ['一','二','三','四','五'][phaseIdx] + ' 階段 · Operation ' + (phaseIdx + 1) + '</div>' +
        '<div class="ootk-stage-name">' + OP_LABELS[phaseIdx].zh + '</div>' +
        '<div class="ootk-stage-en">' + OP_LABELS[phaseIdx].en + '</div>' +
        '<div style="font-size:.62rem;color:rgba(212,175,55,.65);margin-top:.4rem;letter-spacing:.05em;font-style:italic">' +
          '※ 第 ' + (phaseIdx + 1) + ' 次獨立讀盤(重洗、重新切牌)・Book T 原文「Shuffle, etc., as before」' +
        '</div>';
      ritualScene.appendChild(stageTitle);

      // 儀式場
      var stage = document.createElement('div');
      stage.className = 'ootk-stage-area';
      ritualScene.appendChild(stage);

      // 階段提示文字
      var caption = document.createElement('div');
      caption.className = 'ootk-stage-caption';
      stage.appendChild(caption);

      // 流程：② 洗牌 → ③ 發牌（含找 Sig） → ⑤ Counting → ⑥ Pairing
      ritualShuffle(stage, caption, function() {
        ritualDeal(phaseIdx, stage, caption, function() {
          ritualCounting(phaseIdx, stage, caption, function() {
            ritualPairing(phaseIdx, stage, caption, function() {
              // 全部跑完，淡出 ritualScene
              setTimeout(function() {
                ritualScene.style.opacity = '0';
                setTimeout(function() {
                  ritualScene.remove();
                  onComplete();
                }, 500);
              }, 800);
            });
          });
        });
      });
    }

    // ════════════════════════════════════════════════════════════════
    // ★ 共用：找到 Sig 那刻的金光擴散特效
    // ════════════════════════════════════════════════════════════════
    function _emitGoldBurst(parentEl, targetEl) {
      if (!parentEl || !targetEl) return;
      var pBox = parentEl.getBoundingClientRect();
      var tBox = targetEl.getBoundingClientRect();
      var burst = document.createElement('div');
      burst.className = 'ootk-burst';
      burst.style.left = (tBox.left - pBox.left + tBox.width / 2 - 80) + 'px';
      burst.style.top = (tBox.top - pBox.top + tBox.height / 2 - 80) + 'px';
      parentEl.appendChild(burst);
      setTimeout(function() { burst.remove(); }, 1400);
      // 多一道內圈光暈
      var burst2 = document.createElement('div');
      burst2.className = 'ootk-burst inner';
      burst2.style.left = (tBox.left - pBox.left + tBox.width / 2 - 50) + 'px';
      burst2.style.top = (tBox.top - pBox.top + tBox.height / 2 - 50) + 'px';
      parentEl.appendChild(burst2);
      setTimeout(function() { burst2.remove(); }, 1100);
    }

    // ════════════════════════════════════════════════════════════════
    // ② 洗牌儀式 — 78 張螺旋洗牌 + 真實牌照閃現
    // ════════════════════════════════════════════════════════════════
    function ritualShuffle(stage, caption, onDone) {
      // ★ v63E 正統 Book T:每階段都重新洗整副 78 張牌
      //   Mathers Book T 原文五階段都明寫「Shuffle, etc., as before」
      //   這不是「續上一階段」,是新的一次完整讀盤
      caption.textContent = '🃏 重新洗牌(全部 78 張)——這是新的一次獨立讀盤,請靜心默念你的問題';
      var box = document.createElement('div');
      box.className = 'ootk-shuffle-box';
      stage.appendChild(box);

      // 生成 24 張卡背螺旋（純粹視覺）
      for (var i = 0; i < 24; i++) {
        var c = document.createElement('div');
        c.className = 'ootk-shuffle-card';
        c.style.animationDelay = (i * 80) + 'ms';
        c.style.setProperty('--i', i);
        box.appendChild(c);
      }

      // 隨機抽 6 張真實牌從中央閃過、依序放大消失（強化「78 張真實在洗」感）
      var visualDeck = (typeof TAROT !== 'undefined') ? TAROT.slice() : [];
      function getImg(card) {
        if (!card) return '';
        if (typeof window.getTarotCardImage === 'function') return window.getTarotCardImage(card);
        return '';
      }
      if (visualDeck.length) {
        var FLASH_COUNT = 6;
        var picked = [];
        for (var p = 0; p < FLASH_COUNT; p++) {
          var idx = Math.floor(Math.random() * visualDeck.length);
          picked.push(visualDeck[idx]);
        }
        picked.forEach(function(card, fi) {
          setTimeout(function() {
            var imgUrl = getImg(card);
            if (!imgUrl) return;
            var flash = document.createElement('div');
            flash.className = 'ootk-shuffle-flash';
            flash.innerHTML = '<img src="' + imgUrl + '" />';
            box.appendChild(flash);
            requestAnimationFrame(function() { flash.classList.add('show'); });
            setTimeout(function() { flash.classList.add('out'); }, 380);
            setTimeout(function() { flash.remove(); }, 750);
          }, 200 + fi * 280);
        });
      }

      // 2.4 秒後淡出（延長以容納 6 張閃現）
      setTimeout(function() {
        box.classList.add('done');
        setTimeout(function() {
          box.remove();
          onDone();
        }, 600);
      }, 2400);
    }

    // ════════════════════════════════════════════════════════════════
    // ③ 發牌儀式 + ④ 找 Significator — 各階段獨有
    // ════════════════════════════════════════════════════════════════
    function ritualDeal(phaseIdx, stage, caption, onDone) {
      if (phaseIdx === 0) ritualDealOp1(stage, caption, onDone);
      else if (phaseIdx === 1) ritualDealOp2(stage, caption, onDone);
      else if (phaseIdx === 2) ritualDealOp3(stage, caption, onDone);
      else if (phaseIdx === 3) ritualDealOp4(stage, caption, onDone);
      else if (phaseIdx === 4) ritualDealOp5(stage, caption, onDone);
      else onDone();
    }

    // ─── Op1 發牌：YHVH 切四元素堆 ───
    function ritualDealOp1(stage, caption, onDone) {
      caption.innerHTML = '🜂 切牌——按 <b>YHVH</b> 四聖名分為四元素堆';

      var op = results.op1;
      var piles = op.piles || {};
      var activeKey = op.activePile || 'fire';

      var scene = document.createElement('div');
      scene.className = 'ootk-op1-scene';
      var sceneHTML = '<div class="ootk-op1-deck" id="ootk-op1-deck"><div class="ootk-op1-deck-count" id="ootk-op1-count">78</div></div>';
      var elSlots = [
        { el: 'fire',  letter: 'י', letterEn: 'Yod', label: '🜂 火', meaning: '工作・事業' },
        { el: 'water', letter: 'ה', letterEn: 'Heh', label: '🜄 水', meaning: '愛情・愉悅' },
        { el: 'air',   letter: 'ו', letterEn: 'Vav', label: '🜁 風', meaning: '衝突・損失' },
        { el: 'earth', letter: 'ה', letterEn: 'Heh', label: '🜃 土', meaning: '金錢・物質' }
      ];
      sceneHTML += '<div class="ootk-op1-piles">';
      elSlots.forEach(function(s) {
        sceneHTML +=
          '<div class="ootk-op1-pile" data-el="' + s.el + '">' +
          '  <div class="ootk-op1-pile-letter">' + s.letter + '</div>' +
          '  <div class="ootk-op1-pile-stack" id="op1-stack-' + s.el + '"></div>' +
          '  <div class="ootk-op1-pile-meta">' +
          '    <div class="ootk-op1-pile-label">' + s.label + '</div>' +
          '    <div class="ootk-op1-pile-meaning">' + s.meaning + '</div>' +
          '    <div class="ootk-op1-pile-count"><span id="op1-count-' + s.el + '">0</span> 張</div>' +
          '  </div>' +
          '</div>';
      });
      sceneHTML += '</div>';
      scene.innerHTML = sceneHTML;
      stage.appendChild(scene);

      var elKeys = ['fire','water','air','earth'];
      var totalPerPile = { fire: piles.fire || 19, water: piles.water || 19, air: piles.air || 20, earth: piles.earth || 20 };
      var dist = [];
      elKeys.forEach(function(k) {
        for (var i = 0; i < totalPerPile[k]; i++) dist.push(k);
      });
      // shuffle
      for (var sh = dist.length - 1; sh > 0; sh--) { var sj = Math.floor(Math.random() * (sh + 1)); var tmp = dist[sh]; dist[sh] = dist[sj]; dist[sj] = tmp; }

      var counts = { fire: 0, water: 0, air: 0, earth: 0 };
      var flown = 0;
      var deckEl = scene.querySelector('#ootk-op1-deck');
      var countEl = scene.querySelector('#ootk-op1-count');
      var visualDeck = (typeof TAROT !== 'undefined') ? TAROT.slice() : [];
      function getImg(card) {
        if (!card) return '';
        if (typeof window.getTarotCardImage === 'function') return window.getTarotCardImage(card);
        return '';
      }

      function flyOne() {
        if (flown >= dist.length) {
          setTimeout(highlightActive, 300);
          return;
        }
        var k = dist[flown];
        counts[k]++;
        flown++;
        countEl.textContent = String(78 - flown);
        scene.querySelector('#op1-count-' + k).textContent = String(counts[k]);

        // 視覺：飛卡
        var fly = document.createElement('div');
        fly.className = 'ootk-fly-card-v63';
        // 前 12 張顯示真實牌照（增加儀式感），其後用卡背省效能
        if (flown <= 12 && visualDeck.length) {
          var card = visualDeck[(flown * 13) % visualDeck.length];
          var imgUrl = getImg(card);
          if (imgUrl) {
            fly.innerHTML = '<img src="' + imgUrl + '" style="width:100%;height:100%;object-fit:cover;border-radius:1px" />';
            fly.classList.add('with-img');
          }
        }
        var dRect = deckEl.getBoundingClientRect();
        var sRect = scene.getBoundingClientRect();
        fly.style.left = (dRect.left - sRect.left + 12) + 'px';
        fly.style.top = (dRect.top - sRect.top + 8) + 'px';
        scene.appendChild(fly);

        var stackEl = scene.querySelector('#op1-stack-' + k);
        var stRect = stackEl.getBoundingClientRect();
        requestAnimationFrame(function() {
          fly.style.left = (stRect.left - sRect.left + 8) + 'px';
          fly.style.top = (stRect.top - sRect.top - counts[k] * 1.2) + 'px';
          fly.style.transform = 'rotate(' + (Math.random() * 4 - 2) + 'deg)';
          fly.style.opacity = '.9';
        });
        setTimeout(function() { fly.classList.add('landed'); }, 380);

        var delay = flown < 8 ? 110 : flown < 30 ? 55 : flown < 60 ? 30 : 18;
        setTimeout(flyOne, delay);
      }

      // ④ 找 Significator
      function highlightActive() {
        caption.innerHTML = '🔍 尋找代表牌——<b style="color:var(--c-gold)">' + (results.significator ? results.significator.name : '') + '</b>';

        var pileEls = scene.querySelectorAll('.ootk-op1-pile');
        var idx = 0;
        function spotlight() {
          // 移除所有 spotlight
          pileEls.forEach(function(p) { p.classList.remove('spotlight'); });
          if (idx >= 4) {
            // 結束掃描，亮起 active
            setTimeout(function() {
              pileEls.forEach(function(p) {
                if (p.dataset.el === activeKey) p.classList.add('found');
                else p.classList.add('dimmed');
              });
              // 金光擴散
              setTimeout(function() {
                var foundEl = scene.querySelector('.ootk-op1-pile.found');
                if (foundEl) _emitGoldBurst(scene, foundEl);
              }, 100);
              caption.innerHTML = '✦ 代表牌落在 <b style="color:var(--c-gold)">' + (PILE_ZH[activeKey] || activeKey) + '</b>';
              setTimeout(onDone, 1400);
            }, 200);
            return;
          }
          // 高亮這堆
          var key = elKeys[idx];
          var p = scene.querySelector('.ootk-op1-pile[data-el="' + key + '"]');
          if (p) p.classList.add('spotlight');
          // 如果這堆是 active，提早停留更久
          var stayTime = (key === activeKey) ? 800 : 350;
          idx++;
          setTimeout(spotlight, stayTime);
        }
        // 從第一堆開始掃
        setTimeout(spotlight, 400);
      }

      setTimeout(flyOne, 400);
    }

    // ─── Op2 發牌：12 宮位 ───
    function ritualDealOp2(stage, caption, onDone) {
      caption.innerHTML = '🏠 發牌——依序發到 <b>十二宮位</b>（占星天宮圖）';

      var op = results.op2;
      var activeH = (op.activeHouse || 1) - 1;

      var HOUSE_LBL = ['一','二','三','四','五','六','七','八','九','十','十一','十二'];
      var HOUSE_DESC = ['自我','財帛','兄弟','田宅','子女','奴僕','夫妻','疾厄','遷移','官祿','福德','玄秘'];

      // ── 占星天宮圖 12 宮位排列(最正統) ──
      // 第 1 宮 ASC 在左方下緣(195°),逆時針 +30° 一格
      // 第 4 宮 IC = 285° = 正下方
      // 第 7 宮 DSC = 15° = 右方略下
      // 第 10 宮 MC = 105° = 正上方
      // CSS 座標 y 軸向下,所以 cy = center - r * sin
      var WHEEL_SIZE = 280;
      var CENTER = WHEEL_SIZE / 2;
      var HOUSE_R = 110;
      var HOUSE_BOX = 48;
      var INNER_R = 70;
      var OUTER_R = 130;

      function angOfHouse(hi) {
        return 195 + hi * 30;
      }

      var scene = document.createElement('div');
      scene.className = 'ootk-op2-scene';

      var html = '<div class="ootk-op2-wheel" id="ootk-op2-wheel" style="width:' + WHEEL_SIZE + 'px;height:' + WHEEL_SIZE + 'px">';

      html += '<svg class="ootk-op2-svg" viewBox="0 0 ' + WHEEL_SIZE + ' ' + WHEEL_SIZE + '">';
      html += '<circle cx="' + CENTER + '" cy="' + CENTER + '" r="' + OUTER_R + '" class="ootk-op2-ring-outer" />';
      html += '<circle cx="' + CENTER + '" cy="' + CENTER + '" r="' + INNER_R + '" class="ootk-op2-ring-inner" />';
      for (var li = 0; li < 12; li++) {
        var aDeg = 180 + li * 30;
        var aRad = aDeg * Math.PI / 180;
        var x1 = CENTER + INNER_R * Math.cos(aRad);
        var y1 = CENTER - INNER_R * Math.sin(aRad);
        var x2 = CENTER + OUTER_R * Math.cos(aRad);
        var y2 = CENTER - OUTER_R * Math.sin(aRad);
        html += '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" class="ootk-op2-spoke" data-i="' + li + '" />';
      }
      html += '<text x="' + (CENTER - OUTER_R - 6) + '" y="' + (CENTER + 4) + '" class="ootk-op2-axis-lbl" text-anchor="end">ASC</text>';
      html += '<text x="' + (CENTER + OUTER_R + 6) + '" y="' + (CENTER + 4) + '" class="ootk-op2-axis-lbl">DSC</text>';
      html += '<text x="' + CENTER + '" y="' + (CENTER - OUTER_R - 4) + '" class="ootk-op2-axis-lbl" text-anchor="middle">MC</text>';
      html += '<text x="' + CENTER + '" y="' + (CENTER + OUTER_R + 14) + '" class="ootk-op2-axis-lbl" text-anchor="middle">IC</text>';
      html += '</svg>';

      html += '<div class="ootk-op2-center" id="ootk-op2-center" style="left:' + (CENTER - 30) + 'px;top:' + (CENTER - 30) + 'px">';
      html += '  <div class="ootk-op2-center-inner">SIG</div>';
      html += '</div>';

      for (var hi = 0; hi < 12; hi++) {
        var deg = angOfHouse(hi);
        var rad = deg * Math.PI / 180;
        var cx = CENTER + HOUSE_R * Math.cos(rad) - HOUSE_BOX / 2;
        var cy = CENTER - HOUSE_R * Math.sin(rad) - HOUSE_BOX / 2;
        html += '<div class="ootk-op2-house" data-idx="' + hi + '" style="left:' + cx + 'px;top:' + cy + 'px;width:' + HOUSE_BOX + 'px;height:' + HOUSE_BOX + 'px">';
        html += '  <div class="ootk-op2-house-num">' + HOUSE_LBL[hi] + '</div>';
        html += '  <div class="ootk-op2-house-desc">' + HOUSE_DESC[hi] + '</div>';
        html += '  <div class="ootk-op2-house-count" id="op2-cnt-' + hi + '">0</div>';
        html += '</div>';
      }
      html += '</div>';
      scene.innerHTML = html;
      stage.appendChild(scene);

      var counts = new Array(12).fill(0);
      var dealt = 0;
      var visualDeck = (typeof TAROT !== 'undefined') ? TAROT.slice() : [];

      function getImg(card) {
        if (!card) return '';
        if (typeof window.getTarotCardImage === 'function') return window.getTarotCardImage(card);
        return '';
      }

      function dealNext() {
        if (dealt >= 78) {
          setTimeout(highlightActive, 400);
          return;
        }
        var targetIdx = dealt % 12;
        counts[targetIdx]++;
        dealt++;
        scene.querySelector('#op2-cnt-' + targetIdx).textContent = String(counts[targetIdx]);

        var house = scene.querySelector('.ootk-op2-house[data-idx="' + targetIdx + '"]');
        if (house) {
          house.classList.add('flash');
          setTimeout(function() { house.classList.remove('flash'); }, 220);
        }

        // 持續飛卡(前段密集、後段降頻)
        // ★ 飛卡顯示的就是「正在發到該宮位的這張牌」（visualDeck[dealt-1]）
        var flyTrigger = (dealt < 24 && dealt % 3 === 1) || (dealt >= 24 && dealt < 48 && dealt % 6 === 1) || (dealt >= 48 && dealt % 12 === 1);
        if (flyTrigger && visualDeck.length) {
          var card = visualDeck[(dealt - 1) % visualDeck.length];
          var imgUrl = getImg(card);
          if (imgUrl && house) {
            var fly = document.createElement('div');
            fly.className = 'ootk-op2-fly';
            fly.innerHTML = '<img src="' + imgUrl + '" />';
            var wheel = scene.querySelector('.ootk-op2-wheel');
            var sceneRect = wheel.getBoundingClientRect();
            fly.style.left = (CENTER - 11) + 'px';
            fly.style.top = (CENTER - 17) + 'px';
            wheel.appendChild(fly);
            var hRect = house.getBoundingClientRect();
            var targetX = hRect.left - sceneRect.left + (hRect.width / 2) - 11;
            var targetY = hRect.top - sceneRect.top + (hRect.height / 2) - 17;
            requestAnimationFrame(function() {
              fly.style.left = targetX + 'px';
              fly.style.top = targetY + 'px';
              fly.style.opacity = '0';
              fly.style.transform = 'scale(.35)';
            });
            setTimeout(function() { fly.remove(); }, 750);
          }
        }

        var delay = dealt < 12 ? 140 : dealt < 36 ? 70 : 30;
        setTimeout(dealNext, delay);
      }

      function highlightActive() {
        caption.innerHTML = '🔍 尋找代表牌的宮位——<b style="color:var(--c-gold)">' + (results.significator ? results.significator.name : '') + '</b>';

        var houses = scene.querySelectorAll('.ootk-op2-house');
        var spokes = scene.querySelectorAll('.ootk-op2-spoke');
        var idx = 0;
        function spotlight() {
          houses.forEach(function(h) { h.classList.remove('spotlight'); });
          if (idx >= 12) {
            houses.forEach(function(h) {
              var i = parseInt(h.dataset.idx);
              if (i === activeH) h.classList.add('found');
              else h.classList.add('dimmed');
            });
            spokes.forEach(function(sp) {
              var i = parseInt(sp.dataset.i);
              if (i === activeH || i === (activeH + 1) % 12) sp.classList.add('lit');
            });
            // 金光擴散
            setTimeout(function() {
              var foundEl = scene.querySelector('.ootk-op2-house.found');
              var wheel = scene.querySelector('.ootk-op2-wheel');
              if (foundEl && wheel) _emitGoldBurst(wheel, foundEl);
            }, 100);
            caption.innerHTML = '✦ 代表牌落在 <b style="color:var(--c-gold)">第 ' + HOUSE_LBL[activeH] + ' 宮 · ' + HOUSE_DESC[activeH] + '</b>';
            setTimeout(onDone, 1600);
            return;
          }
          var h = scene.querySelector('.ootk-op2-house[data-idx="' + idx + '"]');
          if (h) h.classList.add('spotlight');
          var stay = (idx === activeH) ? 800 : 220;
          idx++;
          setTimeout(spotlight, stay);
        }
        setTimeout(spotlight, 350);
      }

      setTimeout(dealNext, 500);
    }

    // ─── Op3 發牌：12 星座 ───
    function ritualDealOp3(stage, caption, onDone) {
      caption.innerHTML = '♈ 發牌——依 GD 對應分入 <b>黃道十二星座</b>';

      var op = results.op3;
      var SIGN_NAMES = ['牡羊','金牛','雙子','巨蟹','獅子','處女','天秤','天蠍','射手','摩羯','水瓶','雙魚'];
      var SIGN_ICONS = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];
      var SIGN_ELEMENTS = ['火','土','風','水','火','土','風','水','火','土','風','水'];
      var activeIdx = -1;
      for (var si = 0; si < 12; si++) {
        if (SIGN_NAMES[si] === op.activeSign) { activeIdx = si; break; }
      }
      if (activeIdx < 0) activeIdx = 0;

      var WHEEL_SIZE = 280;
      var CENTER = WHEEL_SIZE / 2;
      var SIGN_R = 110;
      var SIGN_BOX = 44;

      var scene = document.createElement('div');
      scene.className = 'ootk-op3-scene';
      var html = '<div class="ootk-op3-zodiac" id="ootk-op3-zodiac" style="width:' + WHEEL_SIZE + 'px;height:' + WHEEL_SIZE + 'px">';

      // SVG 黃道環
      html += '<svg class="ootk-op3-svg" viewBox="0 0 ' + WHEEL_SIZE + ' ' + WHEEL_SIZE + '">';
      html += '<circle cx="' + CENTER + '" cy="' + CENTER + '" r="130" class="ootk-op3-ring-outer" />';
      html += '<circle cx="' + CENTER + '" cy="' + CENTER + '" r="86" class="ootk-op3-ring-inner" />';
      // 12 條輻射線
      for (var li = 0; li < 12; li++) {
        var aDeg = -90 + li * 30 - 15; // 線在星座之間
        var aRad = aDeg * Math.PI / 180;
        var x1 = CENTER + 86 * Math.cos(aRad);
        var y1 = CENTER + 86 * Math.sin(aRad);
        var x2 = CENTER + 130 * Math.cos(aRad);
        var y2 = CENTER + 130 * Math.sin(aRad);
        html += '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" class="ootk-op3-spoke" data-i="' + li + '" />';
      }
      html += '</svg>';

      // 中央星座主牌區（會在最後浮現）
      html += '<div class="ootk-op3-trump" id="ootk-op3-trump"></div>';

      // 12 星座圈（牡羊在頂、順時針排列符合占星傳統）
      for (var zi = 0; zi < 12; zi++) {
        var ang = (-90 + zi * 30) * Math.PI / 180;
        var cx = CENTER + SIGN_R * Math.cos(ang) - SIGN_BOX / 2;
        var cy = CENTER + SIGN_R * Math.sin(ang) - SIGN_BOX / 2;
        html += '<div class="ootk-op3-sign" data-idx="' + zi + '" data-el="' + SIGN_ELEMENTS[zi] + '" style="left:' + cx + 'px;top:' + cy + 'px;width:' + SIGN_BOX + 'px;height:' + SIGN_BOX + 'px">';
        html += '  <div class="ootk-op3-sign-icon">' + SIGN_ICONS[zi] + '</div>';
        html += '  <div class="ootk-op3-sign-name">' + SIGN_NAMES[zi] + '</div>';
        html += '</div>';
      }
      html += '</div>';
      scene.innerHTML = html;
      stage.appendChild(scene);

      var visualDeck = (typeof TAROT !== 'undefined') ? TAROT.slice() : [];
      function getImg(card) {
        if (!card) return '';
        if (typeof window.getTarotCardImage === 'function') return window.getTarotCardImage(card);
        return '';
      }

      // 第一階段：星座圈逐一浮現
      var signs = scene.querySelectorAll('.ootk-op3-sign');
      var idx = 0;
      function lightSign() {
        if (idx >= 12) {
          setTimeout(dealCardsToSigns, 200);
          return;
        }
        signs[idx].classList.add('show');
        idx++;
        setTimeout(lightSign, 95);
      }

      // 第二階段：發牌（飛卡到各星座）
      // ★ Book T 正統：每張按 GD 星座屬性分到對應星座
      // 動畫採真正 78 張依序發牌（不再「平均循環」誤導）
      function dealCardsToSigns() {
        caption.innerHTML = '♈ 發牌——按 Golden Dawn 對應，將 <b>78 張</b>分入十二星座';
        var dealCount = 0;
        var maxDeals = 78; // 真正發 78 張
        function flyCard() {
          if (dealCount >= maxDeals) {
            setTimeout(highlightActive, 400);
            return;
          }
          // 取 visualDeck 真實牌的 GD 對應星座
          var card = visualDeck[dealCount % visualDeck.length];
          var targetSignIdx;
          // 直接呼叫同檔閉包內的 getCardSignIdx 算 GD 屬性
          if (card && typeof getCardSignIdx === 'function') {
            try { targetSignIdx = getCardSignIdx(card); } catch(_e) {}
          }
          if (typeof targetSignIdx !== 'number' || targetSignIdx < 0 || targetSignIdx > 11) {
            targetSignIdx = dealCount % 12;
          }
          var targetSign = scene.querySelector('.ootk-op3-sign[data-idx="' + targetSignIdx + '"]');
          if (targetSign && card) {
            var imgUrl = getImg(card);
            // 視覺優化：78 張全發但只在前 36 張產生飛卡實體（避免 DOM 過多）
            if (imgUrl && dealCount < 36) {
              var fly = document.createElement('div');
              fly.className = 'ootk-op3-fly';
              fly.innerHTML = '<img src="' + imgUrl + '" />';
              var zodiac = scene.querySelector('.ootk-op3-zodiac');
              fly.style.left = (CENTER - 11) + 'px';
              fly.style.top = (CENTER - 17) + 'px';
              zodiac.appendChild(fly);
              var sRect = targetSign.getBoundingClientRect();
              var zRect = zodiac.getBoundingClientRect();
              var tx = sRect.left - zRect.left + sRect.width / 2 - 11;
              var ty = sRect.top - zRect.top + sRect.height / 2 - 17;
              requestAnimationFrame(function() {
                fly.style.left = tx + 'px';
                fly.style.top = ty + 'px';
                fly.style.opacity = '0';
                fly.style.transform = 'scale(.4)';
              });
              setTimeout(function() { fly.remove(); }, 700);
            }
            targetSign.classList.add('flash');
            setTimeout(function() { targetSign.classList.remove('flash'); }, 250);
          }
          dealCount++;
          // 節奏：前 12 張稍慢、12-36 中速、36+ 快速跑完 78 張
          var delay = dealCount < 12 ? 130 : dealCount < 36 ? 70 : 30;
          setTimeout(flyCard, delay);
        }
        flyCard();
      }

      function highlightActive() {
        caption.innerHTML = '🔍 尋找代表牌的星座——<b style="color:var(--c-gold)">' + (results.significator ? results.significator.name : '') + '</b>';

        var spokes = scene.querySelectorAll('.ootk-op3-spoke');
        var pos = 0;
        function sweep() {
          signs.forEach(function(s) { s.classList.remove('spotlight'); });
          if (pos > activeIdx) {
            signs.forEach(function(s, i) {
              if (i === activeIdx) s.classList.add('found');
              else s.classList.add('dimmed');
            });
            spokes.forEach(function(sp) {
              var i = parseInt(sp.dataset.i);
              if (i === activeIdx || i === (activeIdx + 1) % 12) sp.classList.add('lit');
            });
            // 金光擴散
            setTimeout(function() {
              var foundEl = scene.querySelector('.ootk-op3-sign.found');
              var zodiac = scene.querySelector('.ootk-op3-zodiac');
              if (foundEl && zodiac) _emitGoldBurst(zodiac, foundEl);
            }, 100);
            // 對應大牌（中央浮現）
            if (op.signTrump) {
              setTimeout(function() {
                var trumpDiv = scene.querySelector('#ootk-op3-trump');
                trumpDiv.innerHTML =
                  '<div class="ootk-op3-trump-label">星座主牌</div>' +
                  '<div class="ootk-op3-trump-name">' + op.signTrump + '</div>';
                trumpDiv.classList.add('show');
              }, 600);
            }
            setTimeout(onDone, 2000);
            return;
          }
          if (signs[pos]) signs[pos].classList.add('spotlight');
          var stay = (pos === activeIdx) ? 700 : 150;
          pos++;
          setTimeout(sweep, stay);
        }
        setTimeout(sweep, 300);
      }

      setTimeout(lightSign, 250);
    }

    // ─── Op4 發牌：正統 Book T「Sig 居中、36 張環繞」 ───
    function ritualDealOp4(stage, caption, onDone) {
      caption.innerHTML = '🔮 將代表牌取出居中——<b>三十六張緊隨其後形成環</b>（最正統 Book T）';

      var op = results.op4;
      var activeCards = op.activeCards || [];
      // activeCards[0] = Sig 居中，activeCards[1..36] = 環繞 36 張
      var ringCards = activeCards.slice(1);
      var ringCount = ringCards.length || 36;

      // 取得牌照路徑的 helper
      function getImg(card) {
        if (!card) return '';
        if (typeof window.getTarotCardImage === 'function') {
          return window.getTarotCardImage(card);
        }
        return '';
      }

      // Sig 牌照
      var sigCard = activeCards[0] || (results.significator ? { id: results.significator.id, n: results.significator.name } : null);
      var sigImg = getImg(sigCard);
      var sigName = (sigCard && (sigCard.n || sigCard.name)) || (results.significator ? results.significator.name : '代表牌');

      var scene = document.createElement('div');
      scene.className = 'ootk-op4-scene';
      var html = '<div class="ootk-op4-table" id="ootk-op4-table">';
      html += '  <div class="ootk-op4-bg"></div>';
      // 中心 Significator（顯示真實牌照）
      html += '  <div class="ootk-op4-sig" id="ootk-op4-sig">';
      if (sigImg) {
        html += '    <img class="ootk-op4-sig-img" src="' + sigImg + '" alt="' + sigName + '" />';
      }
      html += '    <div class="ootk-op4-sig-overlay">';
      html += '      <div class="ootk-op4-sig-name">' + sigName + '</div>';
      html += '      <div class="ootk-op4-sig-label">SIGNIFICATOR</div>';
      html += '    </div>';
      html += '  </div>';
      // 36 張環繞牌（顯示真實牌照）
      var R = 132;
      for (var ri = 0; ri < ringCount; ri++) {
        var ang = (ri * 360 / ringCount - 90) * Math.PI / 180;
        var cx = 160 + R * Math.cos(ang) - 11;  // 卡寬 22 → 半 11
        var cy = 160 + R * Math.sin(ang) - 17;  // 卡高 34 → 半 17
        var rotateDeg = ang * 180 / Math.PI + 90;
        var card = ringCards[ri];
        var cardImg = getImg(card);
        var isUp = card && card.isUp !== false;
        var imgRotate = isUp ? 0 : 180;
        html += '<div class="ootk-op4-ring-card" data-idx="' + ri + '" style="left:' + cx + 'px;top:' + cy + 'px;transform:rotate(' + rotateDeg + 'deg)">';
        if (cardImg) {
          html += '<img src="' + cardImg + '" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:2px;transform:rotate(' + imgRotate + 'deg)" />';
        }
        html += '</div>';
      }
      html += '</div>';

      // 旬資訊
      if (op.decanSign || op.decanRange) {
        html += '<div class="ootk-op4-decan-info">';
        html += '  <div class="ootk-op4-decan-label">代表牌對應的旬</div>';
        if (op.decanSign) html += '  <div class="ootk-op4-decan-sign">' + op.decanSign + ' · ' + (op.decanRange || '') + '</div>';
        if (op.decanPlanet) html += '  <div class="ootk-op4-decan-planet">主星：' + op.decanPlanet + '</div>';
        html += '</div>';
      }
      scene.innerHTML = html;
      stage.appendChild(scene);

      // 中心 Sig 放大
      var sigEl = scene.querySelector('#ootk-op4-sig');
      setTimeout(function() { sigEl.classList.add('show'); }, 300);

      // 環繞牌依序浮現
      var ringEls = scene.querySelectorAll('.ootk-op4-ring-card');
      setTimeout(function() {
        ringEls.forEach(function(c, i) {
          setTimeout(function() { c.classList.add('show'); }, i * 50);
        });
      }, 1100);

      // 旬資訊浮現
      setTimeout(function() {
        var info = scene.querySelector('.ootk-op4-decan-info');
        if (info) info.classList.add('show');
      }, 1100 + ringCount * 50 + 300);

      setTimeout(onDone, 1400 + ringCount * 50 + 800);
    }

    // ─── Op5 發牌：生命之樹十質點 ───
    function ritualDealOp5(stage, caption, onDone) {
      caption.innerHTML = '🌳 發牌——依 GD 對應分入 <b>生命之樹十質點</b>（Sephirot）';

      var op = results.op5;
      var SEPH_NAMES = ['Kether','Chokmah','Binah','Chesed','Geburah','Tiphareth','Netzach','Hod','Yesod','Malkuth'];
      var SEPH_ZH = ['王冠','智慧','理解','慈悲','嚴厲','美','勝利','榮耀','基礎','王國'];
      var activeIdx = SEPH_NAMES.indexOf(op.activeSephirah || '');
      if (activeIdx < 0) activeIdx = 9;

      // 統一座標系:容器 240×360, 內部繪圖區 200×320 + 20px padding 四週
      // 節點中心點(以容器左上為原點),NODE_R=18 半徑
      var TREE_W = 240, TREE_H = 360;
      var PAD = 20;        // 邊距
      var NODE_R = 18;     // 節點半徑(直徑 36)
      // 質點中心位置(統一座標系)
      var SEPH_POS = [
        {x: 120, y: PAD + 16},          // 0 Kether (top center)
        {x: 178, y: PAD + 64},          // 1 Chokmah (right upper)
        {x: 62,  y: PAD + 64},          // 2 Binah (left upper)
        {x: 178, y: PAD + 132},         // 3 Chesed (right mid)
        {x: 62,  y: PAD + 132},         // 4 Geburah (left mid)
        {x: 120, y: PAD + 178},         // 5 Tiphareth (center)
        {x: 178, y: PAD + 224},         // 6 Netzach (right lower)
        {x: 62,  y: PAD + 224},         // 7 Hod (left lower)
        {x: 120, y: PAD + 268},         // 8 Yesod (center lower)
        {x: 120, y: PAD + 318}          // 9 Malkuth (bottom)
      ];
      // 22 條 paths(對應 Tarot 大牌 22 張)
      var TREE_LINES = [
        [0,1],[0,2],[0,5],[1,2],[1,3],[1,5],[2,4],[2,5],
        [3,4],[3,5],[3,6],[4,5],[4,7],[5,6],[5,7],[5,8],
        [6,7],[6,8],[7,8],[8,9]
      ];
      function pathsOfNode(nodeIdx) {
        var arr = [];
        TREE_LINES.forEach(function(ln, i) {
          if (ln[0] === nodeIdx || ln[1] === nodeIdx) arr.push(i);
        });
        return arr;
      }

      var visualDeck = (typeof TAROT !== 'undefined') ? TAROT.slice() : [];
      function getImg(card) {
        if (!card) return '';
        if (typeof window.getTarotCardImage === 'function') return window.getTarotCardImage(card);
        return '';
      }
      var sigCard = (op.activeCards && op.activeCards.length) ? op.activeCards[0] : null;
      if (!sigCard && results.significator) {
        sigCard = (typeof TAROT !== 'undefined') ? TAROT.find(function(c) { return c.id === results.significator.id; }) : null;
      }
      var sigName = (sigCard && (sigCard.n || sigCard.name)) || (results.significator ? results.significator.name : '代表牌');
      var sigImg = getImg(sigCard);

      var scene = document.createElement('div');
      scene.className = 'ootk-op5-scene';
      var html = '<div class="ootk-op5-tree" id="ootk-op5-tree" style="width:' + TREE_W + 'px;height:' + TREE_H + 'px">';
      html += '<div class="ootk-op5-tree-bg"></div>';
      // SVG paths(同一座標系)
      html += '<svg class="ootk-op5-svg" viewBox="0 0 ' + TREE_W + ' ' + TREE_H + '">';
      TREE_LINES.forEach(function(ln, i) {
        var a = SEPH_POS[ln[0]], b = SEPH_POS[ln[1]];
        html += '<line class="ootk-op5-path" data-i="' + i + '" x1="' + a.x + '" y1="' + a.y + '" x2="' + b.x + '" y2="' + b.y + '" />';
      });
      html += '</svg>';
      // Sephirot 節點(中心 = SEPH_POS, 用 left/top 等於 x-NODE_R, y-NODE_R)
      for (var ti = 0; ti < 10; ti++) {
        var nx = SEPH_POS[ti].x - NODE_R;
        var ny = SEPH_POS[ti].y - NODE_R;
        html += '<div class="ootk-op5-node" data-idx="' + ti + '" style="left:' + nx + 'px;top:' + ny + 'px">';
        html += '<div class="ootk-op5-node-num">' + (ti + 1) + '</div>';
        html += '<div class="ootk-op5-node-name">' + SEPH_NAMES[ti].substring(0, 4) + '</div>';
        html += '</div>';
      }
      // 中央代表牌(Sig)──最後浮現,放在 Tiphareth (5 號)位置
      var sigCx = SEPH_POS[5].x;
      var sigCy = SEPH_POS[5].y;
      html += '<div class="ootk-op5-sig-card" id="ootk-op5-sig" style="left:' + (sigCx - 26) + 'px;top:' + (sigCy - 39) + 'px">';
      if (sigImg) html += '<img src="' + sigImg + '" alt="' + sigName + '" />';
      html += '<div class="ootk-op5-sig-overlay"><div class="ootk-op5-sig-name">' + sigName + '</div></div>';
      html += '</div>';
      html += '</div>';
      scene.innerHTML = html;
      stage.appendChild(scene);

      // 第一階段:節點從上往下逐一浮現
      var nodes = scene.querySelectorAll('.ootk-op5-node');
      var paths = scene.querySelectorAll('.ootk-op5-path');
      var idx = 0;
      function lightNode() {
        if (idx >= 10) {
          setTimeout(function() {
            paths.forEach(function(p) { p.classList.add('lit'); });
            setTimeout(dealCardsToSephirot, 500);
          }, 200);
          return;
        }
        nodes[idx].classList.add('show');
        idx++;
        setTimeout(lightNode, 130);
      }

      // 第二階段：從畫面上方外部牌堆飛真實牌到各質點
      // ★ Book T 原文：「Deal into ten packs in the form of the Tree of Life」
      // 發牌來源是「外部牌堆」，不是 Tiphareth 中央。
      // 每張按 GD 屬性（getCardSephirah）分到對應質點，不是平均循環。
      function dealCardsToSephirot() {
        caption.innerHTML = '🌳 發牌——將 78 張依 Golden Dawn 對應分入十質點';
        var dealCount = 0;
        var maxDeals = 78; // 真正發 78 張
        var tree = scene.querySelector('.ootk-op5-tree');
        // 牌堆來源點：畫面上方（容器頂端中央，Kether 之上）
        var DECK_X = TREE_W / 2 - 9;
        var DECK_Y = -30;
        function flyCard() {
          if (dealCount >= maxDeals) {
            setTimeout(highlightActive, 400);
            return;
          }
          // 取真實牌的 GD Sephirah 屬性
          var card = visualDeck[dealCount % visualDeck.length];
          var nodeIdx;
          if (card && typeof getCardSephirah === 'function') {
            try { nodeIdx = getCardSephirah(card); } catch(_e) {}
          }
          if (typeof nodeIdx !== 'number' || nodeIdx < 0 || nodeIdx > 9) {
            nodeIdx = dealCount % 10;
          }
          var node = scene.querySelector('.ootk-op5-node[data-idx="' + nodeIdx + '"]');
          if (node && card) {
            var imgUrl = getImg(card);
            // 視覺優化：78 張全發但只在前 30 張產生飛卡實體
            if (imgUrl && dealCount < 30) {
              var fly = document.createElement('div');
              fly.className = 'ootk-op5-fly';
              fly.innerHTML = '<img src="' + imgUrl + '" />';
              fly.style.left = DECK_X + 'px';
              fly.style.top = DECK_Y + 'px';
              tree.appendChild(fly);
              var targetX = SEPH_POS[nodeIdx].x - 9;
              var targetY = SEPH_POS[nodeIdx].y - 14;
              requestAnimationFrame(function() {
                fly.style.left = targetX + 'px';
                fly.style.top = targetY + 'px';
                fly.style.opacity = '0';
                fly.style.transform = 'scale(.4)';
              });
              setTimeout(function() { fly.remove(); }, 700);
            }
            node.classList.add('flash');
            setTimeout(function() { node.classList.remove('flash'); }, 280);
          }
          dealCount++;
          var delay = dealCount < 10 ? 150 : dealCount < 30 ? 80 : 30;
          setTimeout(flyCard, delay);
        }
        flyCard();
      }

      function highlightActive() {
        caption.innerHTML = '🔍 尋找代表牌的質點——<b style="color:var(--c-gold)">' + sigName + '</b>';

        var pos = 0;
        function sweep() {
          nodes.forEach(function(n) { n.classList.remove('spotlight'); });
          if (pos >= 10) {
            nodes.forEach(function(n, i) {
              if (i === activeIdx) n.classList.add('found');
              else n.classList.add('dimmed');
            });
            // active 質點對應的 paths 變金色
            var activePaths = pathsOfNode(activeIdx);
            paths.forEach(function(p) {
              var i = parseInt(p.dataset.i);
              if (activePaths.indexOf(i) >= 0) p.classList.add('gold-lit');
            });
            // 中央 Sig 牌照浮現
            setTimeout(function() {
              var sigEl = scene.querySelector('#ootk-op5-sig');
              if (sigEl) sigEl.classList.add('show');
            }, 400);
            // 金光擴散
            setTimeout(function() {
              var tree = scene.querySelector('.ootk-op5-tree');
              if (tree) _emitGoldBurst(tree, nodes[activeIdx]);
            }, 200);
            caption.innerHTML = '✦ 代表牌落在 <b style="color:var(--c-gold)">' + SEPH_NAMES[activeIdx] + '（' + SEPH_ZH[activeIdx] + '）</b>';
            setTimeout(onDone, 2400);
            return;
          }
          nodes[pos].classList.add('spotlight');
          var stay = (pos === activeIdx) ? 800 : 150;
          pos++;
          setTimeout(sweep, stay);
        }
        setTimeout(sweep, 200);
      }

      setTimeout(lightNode, 280);
    }

    // ════════════════════════════════════════════════════════════════
    // ⑤ Counting 路徑視覺化 — 從 Sig 出發、走過的牌依序高亮 + 連線
    // ════════════════════════════════════════════════════════════════
    function ritualCounting(phaseIdx, stage, caption, onDone) {
      var op = results['op' + (phaseIdx + 1)];
      var path = op.countingPath || [];

      // ★ v63E UI 修正(2026-04-26):清空 stage 內的前一階段(ritualDeal)視覺化
      //   原本沒清→四堆/十二宮/十二星座/十堆等發牌 DOM 會跟 Counting 牌塊疊加,造成版面偏移
      //   只保留 caption(由 runStageRitual 的 stage 子元素管理)
      Array.from(stage.children).forEach(function(child) {
        if (child !== caption) child.remove();
      });

      caption.innerHTML = '📖 <b style="color:var(--c-gold)">Counting Story</b>——從代表牌出發,按計數值跳數,每張走過的牌都是事件的時序';

      var scene = document.createElement('div');
      scene.className = 'ootk-counting-scene';
      var html = '<div class="ootk-counting-track" id="ootk-counting-track">';
      // 顯示走過的牌（最多 8 張，多了截掉）
      var displayPath = path.slice(0, 8);
      displayPath.forEach(function(step, i) {
        var dirArrow = step.direction === 'left' ? '←' : '→';
        var rev = (step.isUp === false);
        html += '<div class="ootk-counting-card" data-i="' + i + '">';
        html += '  <div class="ootk-counting-card-inner' + (rev ? ' reversed' : '') + '">';
        html += '    <div class="ootk-counting-card-name">' + (step.cardName || '?') + '</div>';
        html += '    <div class="ootk-counting-card-val">值 ' + (step.countValue || 0) + ' ' + dirArrow + '</div>';
        html += '  </div>';
        if (i < displayPath.length - 1) html += '<div class="ootk-counting-arrow">' + dirArrow + '</div>';
        html += '</div>';
      });
      html += '</div>';

      // 路徑摘要
      html += '<div class="ootk-counting-summary">';
      html += '  <div class="ootk-counting-meta">共走過 <b>' + path.length + '</b> 張牌（包含起點代表牌）</div>';
      var lastStep = path[path.length - 1];
      if (lastStep) {
        html += '  <div class="ootk-counting-end">自然終點：' + (lastStep.cardName || '?') + '（落到已訪過的牌，計數結束）</div>';
        html += '  <div class="ootk-counting-note">★ 正統 Book T：終點不是「結論牌」，整串走過的牌構成一個故事</div>';
      }
      html += '</div>';

      scene.innerHTML = html;
      stage.appendChild(scene);

      // 牌依序浮現
      var cards = scene.querySelectorAll('.ootk-counting-card');
      var arrows = scene.querySelectorAll('.ootk-counting-arrow');
      var i = 0;
      function showNext() {
        if (i >= cards.length) {
          setTimeout(function() {
            scene.querySelector('.ootk-counting-summary').classList.add('show');
          }, 200);
          setTimeout(onDone, 2000);
          return;
        }
        cards[i].classList.add('show');
        if (i < arrows.length) {
          setTimeout(function() {
            if (arrows[i]) arrows[i].classList.add('show');
          }, 200);
        }
        i++;
        setTimeout(showNext, 480);
      }

      setTimeout(showNext, 300);
    }

    // ════════════════════════════════════════════════════════════════
    // ⑥ Pairing 視覺化 — 兩側對稱往內配對的光線連結
    // ════════════════════════════════════════════════════════════════
    function ritualPairing(phaseIdx, stage, caption, onDone) {
      var op = results['op' + (phaseIdx + 1)];
      var pairs = op.pairs || [];

      // ★ v63E UI 修正:清空前一階段(Counting)視覺化,避免 Pairing 牌塊跟 Counting 牌塊疊加
      Array.from(stage.children).forEach(function(child) {
        if (child !== caption) child.remove();
      });

      if (!pairs.length) {
        caption.innerHTML = '🔗 此層沒有 Pairing 配對(活躍堆過小)';
        setTimeout(onDone, 1000);
        return;
      }

      caption.innerHTML = '🔗 <b style="color:var(--c-gold)">Pairing Story</b>——從代表牌兩側對稱配對,補充 Counting 的細節';

      var scene = document.createElement('div');
      scene.className = 'ootk-pairing-scene';
      var html = '<div class="ootk-pairing-grid" id="ootk-pairing-grid">';

      // 中心 Sig
      html += '<div class="ootk-pairing-center">';
      html += '  <div class="ootk-pairing-sig">' + (results.significator ? results.significator.name : 'SIG') + '</div>';
      html += '</div>';

      var displayPairs = pairs.slice(0, 5);
      displayPairs.forEach(function(pr, pi) {
        var l = pr.left || pr.card1 || {};
        var r = pr.right || pr.card2 || {};
        var lName = l.n || l.name || (l.cardName || '?');
        var rName = r.n || r.name || (r.cardName || '?');
        var lUp = (l.isUp === true);
        var rUp = (r.isUp === true);
        var dignityLabel = '';
        var dignityClass = '';
        var dig = pr.dignity || '';
        var DIG_MAP = {
          'strengthen':  { label: '同元素・強化', cls: 'dig-strong' },
          'weaken':      { label: 'Contrary・抵消', cls: 'dig-contrary' },
          'friendly':    { label: 'Friendly・友善', cls: 'dig-friendly' },
          'neutral':     { label: 'Neutral・中性', cls: 'dig-neutral' },
          'hostile':     { label: '對立・衝突', cls: 'dig-contrary' }
        };
        if (DIG_MAP[dig]) {
          dignityLabel = DIG_MAP[dig].label;
          dignityClass = DIG_MAP[dig].cls;
        }

        html += '<div class="ootk-pairing-row" data-i="' + pi + '">';
        html += '  <div class="ootk-pairing-side left">';
        html += '    <div class="ootk-pairing-card' + (lUp ? '' : ' reversed') + '">' + lName + '</div>';
        html += '  </div>';
        html += '  <div class="ootk-pairing-link ' + dignityClass + '">';
        html += '    <div class="ootk-pairing-link-line"></div>';
        html += '    <div class="ootk-pairing-link-num">#' + (pi + 1) + '</div>';
        if (dignityLabel) html += '    <div class="ootk-pairing-link-dig">' + dignityLabel + '</div>';
        html += '  </div>';
        html += '  <div class="ootk-pairing-side right">';
        html += '    <div class="ootk-pairing-card' + (rUp ? '' : ' reversed') + '">' + rName + '</div>';
        html += '  </div>';
        html += '</div>';
      });

      html += '</div>';
      html += '<div class="ootk-pairing-note">★ 從代表牌兩側對稱往外配對：左側 ↔ 右側 = 一體兩面的細節</div>';

      scene.innerHTML = html;
      stage.appendChild(scene);

      // 對依序浮現
      var rows = scene.querySelectorAll('.ootk-pairing-row');
      var i = 0;
      function showNext() {
        if (i >= rows.length) {
          setTimeout(function() {
            scene.querySelector('.ootk-pairing-note').classList.add('show');
          }, 200);
          setTimeout(onDone, 1600);
          return;
        }
        rows[i].classList.add('show');
        i++;
        setTimeout(showNext, 480);
      }
      setTimeout(showNext, 300);
    }
  }

  // ── 渲染單個階段 ──
  var PHASE_ACCENTS = [
    { bg: 'rgba(239,68,68,.03)', border: 'rgba(239,68,68,.15)', accent: '#ef4444' },    // 火
    { bg: 'rgba(96,165,250,.03)', border: 'rgba(96,165,250,.15)', accent: '#60a5fa' },   // 宮
    { bg: 'rgba(168,85,247,.03)', border: 'rgba(168,85,247,.15)', accent: '#a855f7' },   // 星座
    { bg: 'rgba(234,179,8,.03)', border: 'rgba(234,179,8,.15)', accent: '#eab308' },     // 旬
    { bg: 'rgba(34,197,94,.03)', border: 'rgba(34,197,94,.15)', accent: '#22c55e' }      // 樹
  ];

  function _renderPhase(phaseIdx, label, opData, allResults) {
    var pa = PHASE_ACCENTS[phaseIdx] || PHASE_ACCENTS[0];
    var h = '';
    h += '<div class="ootk-result-card" style="border:1px solid ' + pa.border + ';background:linear-gradient(145deg,' + pa.bg + ',transparent)">';

    // 階段頭：大圖標 + 標題
    h += '<div style="display:flex;align-items:center;gap:.7rem;margin-bottom:.6rem;padding-bottom:.5rem;border-bottom:1px solid ' + pa.border + '">';
    h += '<div style="width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:1.3rem;background:' + pa.bg + ';border:1px solid ' + pa.border + ';flex-shrink:0">' + label.icon + '</div>';
    h += '<div><div style="font-size:.92rem;font-weight:700;color:' + pa.accent + '">' + label.zh + '</div>';
    h += '<div style="font-size:.68rem;color:var(--c-text-dim);margin-top:.1rem">' + label.desc + '</div></div>';
    h += '</div>';

    if (phaseIdx === 0) h += _renderOp1(opData, allResults);
    else if (phaseIdx === 1) h += _renderOp2(opData, allResults);
    else if (phaseIdx === 2) h += _renderOp3(opData, allResults);
    else if (phaseIdx === 3) h += _renderOp4(opData, allResults);
    else if (phaseIdx === 4) h += _renderOp5(opData, allResults);

    h += '</div>';
    return h;
  }

  // ── Op1 四元素 ──
  function _renderOp1(op, allResults) {
    var h = '';
    // 四堆比例
    var piles = op.piles || {};
    var total = (piles.fire || 0) + (piles.water || 0) + (piles.air || 0) + (piles.earth || 0);
    h += '<div style="margin:.4rem 0">';
    var pileIcons = {fire:'🔥',water:'💧',air:'💨',earth:'🌱'};
    ['fire','water','air','earth'].forEach(function(k) {
      var n = piles[k] || 0;
      var pct = total > 0 ? Math.round(n / total * 100) : 25;
      var isActive = (k === op.activePile);
      h += '<div style="display:flex;align-items:center;gap:.4rem;margin:.35rem 0;' + (isActive ? 'padding:.3rem;border-radius:8px;background:rgba(255,255,255,.02);border:1px solid ' + PILE_COLOR[k] + '30' : '') + '">';
      h += '<span style="font-size:.85rem;width:24px;text-align:center">' + pileIcons[k] + '</span>';
      h += '<span style="font-size:.72rem;width:65px;color:' + (isActive ? PILE_COLOR[k] : 'var(--c-text-dim)') + ';font-weight:' + (isActive ? '700' : '400') + '">' + PILE_ZH[k] + '</span>';
      h += '<div style="flex:1;height:8px;border-radius:99px;background:rgba(255,255,255,.06);overflow:hidden">';
      h += '<div class="ootk-pile-bar" style="width:' + pct + '%;background:' + PILE_COLOR[k] + ';opacity:' + (isActive ? '1' : '.3') + ';height:100%;border-radius:99px"></div>';
      h += '</div>';
      h += '<span style="font-size:.68rem;color:' + (isActive ? PILE_COLOR[k] : 'var(--c-text-muted)') + ';width:32px;text-align:right;font-weight:' + (isActive ? '700' : '400') + '">' + n + '張</span>';
      h += '</div>';
    });
    h += '</div>';

    // 結果
    h += '<div style="padding:.6rem;border-radius:10px;background:rgba(201,168,76,.06);border:1px solid rgba(201,168,76,.12);margin-top:.4rem">';
    h += '<div style="font-size:.88rem;color:var(--c-gold);font-weight:700">你的代表牌落入 ' + (PILE_ZH[op.activePile] || op.activePile) + '</div>';
    h += '<div style="font-size:.78rem;color:var(--c-text-dim);margin-top:.25rem;line-height:1.6">問題核心：' + (op.meaning || '') + '</div>';
    h += '</div>';

    h += _renderKeyCards(op.keyCards, allResults && allResults.significatorId);
    return h;
  }

  // ── Op2 十二宮 ──
  function _renderOp2(op, allResults) {
    var HOUSE_ZH = ['一宮・自我','二宮・財帛','三宮・兄弟','四宮・田宅','五宮・子女','六宮・奴僕','七宮・夫妻','八宮・疾厄','九宮・遷移','十宮・官祿','十一宮・福德','十二宮・玄秘'];
    var activeH = op.activeHouse || 1;
    var h = '';

    // 結果卡
    h += '<div style="padding:.6rem;border-radius:10px;background:rgba(96,165,250,.06);border:1px solid rgba(96,165,250,.12)">';
    h += '<div style="font-size:.88rem;color:rgba(96,165,250,.9);font-weight:700">代表牌落在 第' + activeH + '宮</div>';
    h += '<div style="font-size:.78rem;color:var(--c-text-dim);margin-top:.2rem">' + (HOUSE_ZH[activeH - 1] || '') + '</div>';
    if (op.meaning) h += '<div style="font-size:.75rem;color:var(--c-text-muted);margin-top:.2rem;line-height:1.6">' + op.meaning + '</div>';
    h += '</div>';

    // 宮位分佈 3×4 網格
    h += '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:.3rem;margin-top:.5rem">';
    var houseCounts = op.houseDistribution || op.houseCounts || [];
    for (var i = 0; i < 12; i++) {
      var cnt = houseCounts[i] || 0;
      var isActive = (activeH === i + 1);
      h += '<div style="text-align:center;padding:.35rem .2rem;border-radius:8px;font-size:.62rem;line-height:1.4;' +
        (isActive ? 'background:rgba(96,165,250,.1);color:rgba(96,165,250,.9);font-weight:700;border:1px solid rgba(96,165,250,.25);box-shadow:0 0 8px rgba(96,165,250,.1)' : 'color:var(--c-text-muted);background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.04)') + '">';
      h += '<div style="font-weight:600">' + (i+1) + '宮' + (cnt > 0 ? '<span style="opacity:.6">(' + cnt + ')</span>' : '') + '</div>';
      h += '</div>';
    }
    h += '</div>';
    h += _renderKeyCards(op.keyCards, allResults && allResults.significatorId);
    return h;
  }

  // ── Op3 十二星座 ──
  function _renderOp3(op, allResults) {
    var h = '';
    h += '<div style="padding:.6rem;border-radius:10px;background:rgba(168,85,247,.06);border:1px solid rgba(168,85,247,.12)">';
    h += '<div style="font-size:.88rem;color:rgba(168,85,247,.9);font-weight:700">代表牌落在 ' + (op.activeSign || '?') + '</div>';
    if (op.rulingMajor) {
      h += '<div style="font-size:.78rem;color:var(--c-text-dim);margin-top:.25rem;line-height:1.6">主牌：' + (op.rulingMajor || '') + '</div>';
    }
    h += '</div>';
    h += _renderKeyCards(op.keyCards, allResults && allResults.significatorId);
    return h;
  }

  // ── Op4 三十六旬 ──
  function _renderOp4(op, allResults) {
    var h = '';
    h += '<div style="padding:.6rem;border-radius:10px;background:rgba(234,179,8,.06);border:1px solid rgba(234,179,8,.12)">';
    h += '<div style="font-size:.88rem;color:rgba(234,179,8,.9);font-weight:700">' + (op.decanSign || '') + ' ' + (op.decanRange || '') + '</div>';
    if (op.decanRuler) {
      h += '<div style="font-size:.78rem;color:var(--c-text-dim);margin-top:.25rem;line-height:1.6">旬主：' + op.decanRuler + '</div>';
    }
    h += '</div>';
    h += _renderKeyCards(op.keyCards, allResults && allResults.significatorId);
    return h;
  }

  // ── Op5 生命之樹 ──
  function _renderOp5(op, allResults) {
    var SEPH_MAP = {Kether:'Kether 王冠',Chokmah:'Chokmah 智慧',Binah:'Binah 理解',Chesed:'Chesed 慈悲',Geburah:'Geburah 嚴厲',Tiphareth:'Tiphareth 美',Netzach:'Netzach 勝利',Hod:'Hod 榮耀',Yesod:'Yesod 基礎',Malkuth:'Malkuth 王國'};
    var sephLabel = SEPH_MAP[op.activeSephirah] || (op.sephirahZh ? (op.activeSephirah + ' ' + op.sephirahZh) : op.activeSephirah || '未知');
    var h = '';
    h += '<div style="padding:.6rem;border-radius:10px;background:rgba(34,197,94,.06);border:1px solid rgba(34,197,94,.12)">';
    h += '<div style="font-size:.88rem;color:rgba(34,197,94,.9);font-weight:700">代表牌落在 ' + sephLabel + '</div>';
    if (op.sephirahMeaning) h += '<div style="font-size:.78rem;color:var(--c-text-dim);margin-top:.25rem;line-height:1.6">' + op.sephirahMeaning + '</div>';
    h += '</div>';
    h += _renderKeyCards(op.keyCards, allResults && allResults.significatorId);

    // ── v63E 正統 Book T:五次操作 Sig 落點記錄(純資料,各 Op 獨立讀盤) ──
    if (allResults && allResults.crossAnalysis) {
      var ca = allResults.crossAnalysis;
      h += '<div style="margin-top:.6rem;padding:.7rem;border-radius:10px;border:1px solid rgba(212,175,55,.15);background:linear-gradient(135deg,rgba(212,175,55,.04),rgba(34,197,94,.03))">';
      h += '<div style="font-size:.82rem;font-weight:700;color:var(--c-gold);margin-bottom:.35rem">📍 五次操作 Sig 落點</div>';
      h += '<div style="font-size:.68rem;color:var(--c-text-muted);margin-bottom:.3rem;font-style:italic;line-height:1.5">Book T 正統:五個 Operations 各自獨立讀盤,下方僅為「Sig 在每層落到哪」的客觀位置記錄,不可串成單一進程故事</div>';
      h += '<div style="font-size:.75rem;color:var(--c-text-dim);line-height:1.75">' + (ca.elementProgression || '') + '</div>';
      // ✗ 已移除「重複出現的牌」(recurringCards)——不符 Book T 正統,
      //   代表牌每層必在是機制必然,非真訊號
      h += '</div>';
    }
    return h;
  }

  // ── Counting 路徑牌列表(帶牌面圖)──
  // ★ v63E 正統 Book T:
  //   ① 標出代表牌(counting 起點 = Sig),避免使用者誤把代表牌當訊號牌
  //   ② 用 PHB elemental dignity 真實判斷上色——不再用死碼 kc.dignity
  //   ③ 名稱不再叫「關鍵牌」(誤導);改為「Counting 路徑」(Mathers 原文 the story)
  function _renderKeyCards(keyCards, sigId) {
    if (!keyCards || !keyCards.length) return '';
    var h = '<div class="ootk-keycards-strip">';
    keyCards.slice(0, 8).forEach(function(kc, idx) {
      var c = kc.card || {};
      var name = c.n || c.name || '';
      var imgSrc = (typeof getTarotCardImage === 'function' && c.id != null) ? getTarotCardImage(c) : '';
      var isSig = (sigId != null && c.id === sigId);
      // 代表牌:金色強調;其他牌依與左右鄰的 elemental dignity 上色
      var dColor = 'rgba(201,168,76,.3)';
      if (isSig) {
        dColor = 'rgba(212,175,55,.85)';
      } else if (typeof elementalDignity === 'function') {
        var leftN = (idx > 0) ? (keyCards[idx - 1].card) : null;
        var rightN = (idx < keyCards.length - 1) ? (keyCards[idx + 1].card) : null;
        var leftEd = leftN ? elementalDignity(c, leftN) : 'none';
        var rightEd = rightN ? elementalDignity(c, rightN) : 'none';
        var goodCount = (leftEd === 'strengthen' || leftEd === 'friendly' ? 1 : 0) +
                        (rightEd === 'strengthen' || rightEd === 'friendly' ? 1 : 0);
        var badCount = (leftEd === 'weaken' ? 1 : 0) + (rightEd === 'weaken' ? 1 : 0);
        if (goodCount > badCount) dColor = 'rgba(34,197,94,.5)';
        else if (badCount > goodCount) dColor = 'rgba(239,68,68,.5)';
      }
      var delay = idx * 200;
      h += '<div class="ootk-kc-flip" style="animation-delay:' + delay + 'ms">';
      h += '<div class="ootk-kc-inner" style="animation-delay:' + (delay + 100) + 'ms">';
      if (imgSrc) {
        h += '<div class="ootk-kc-front" style="position:relative"><img src="' + imgSrc + '" style="width:52px;height:78px;border-radius:5px;object-fit:cover;border:2px solid ' + dColor + ';box-shadow:0 2px 8px rgba(0,0,0,.4)">';
        if (isSig) h += '<div style="position:absolute;top:-6px;right:-6px;background:rgba(212,175,55,.95);color:#1a1a1a;font-size:.5rem;font-weight:800;padding:1px 4px;border-radius:8px;letter-spacing:.05em">SIG</div>';
        h += '</div>';
      } else {
        h += '<div class="ootk-kc-front" style="display:flex;align-items:center;justify-content:center;font-size:.65rem;color:var(--c-gold);border-radius:5px;border:2px solid ' + dColor + ';background:rgba(201,168,76,.08);position:relative">' + name.charAt(0);
        if (isSig) h += '<div style="position:absolute;top:-6px;right:-6px;background:rgba(212,175,55,.95);color:#1a1a1a;font-size:.5rem;font-weight:800;padding:1px 4px;border-radius:8px">SIG</div>';
        h += '</div>';
      }
      h += '<div class="ootk-kc-back"></div>';
      h += '</div>';
      var nameStyle = 'font-size:.52rem;color:var(--c-gold);margin-top:.25rem;font-weight:' + (isSig ? '700' : '600') + ';white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:58px';
      h += '<div style="' + nameStyle + '">' + name + (isSig ? ' (起點)' : '') + '</div>';
      if (kc.step) h += '<div style="font-size:.45rem;color:var(--c-text-muted)">(' + kc.step + '步)</div>';
      h += '</div>';
    });
    h += '</div>';
    return h;
  }

  // ── 觸發 OOTK AI 分析（獨立 API 呼叫，不借用 _triggerTarotAI）──
  async function _triggerOOTKAI(results) {
    window._ootkResults = results;
    S.tarot = S.tarot || {};
    S.tarot.ootkResults = results;
    S.tarot.spreadType = 'ootk';

    // 確保結果頁可見
    if (typeof goStep === 'function') goStep('step-tarot');

    var wrap = document.getElementById('tarot-ai-wrap');
    if (!wrap) {
      wrap = document.createElement('div');
      wrap.id = 'tarot-ai-wrap';
      var spreadSec = document.getElementById('t-spread-sec');
      if (spreadSec) { spreadSec.classList.remove('hidden'); spreadSec.after(wrap); }
      else document.body.appendChild(wrap);
    }

    // 隱藏塔羅牌陣展示區（OOTK 不需要顯示原本的塔羅牌面）
    try {
      var _tsCard = document.getElementById('tarot-spread-card'); if (_tsCard) _tsCard.style.display = 'none';
      var _tsCrystal = document.getElementById('tarot-crystal-rec'); if (_tsCrystal) _tsCrystal.style.display = 'none';
      var _tsSpread = document.getElementById('t-spread-sec'); if (_tsSpread) _tsSpread.style.display = 'none';
      var _tsToFull = document.getElementById('tarot-to-full'); if (_tsToFull) _tsToFull.style.display = 'none';
    } catch(_e) {}

    // ★ Opus 深度選擇器（首次觸發時顯示）
    if (!window._jyOotkDepthChosen) {
      window._jyOotkDepthChosen = true;
      var admin = !!(window._JY_ADMIN_TOKEN);
      wrap.style.display = '';
      wrap.innerHTML =
        '<div style="text-align:center;padding:1.2rem .8rem .8rem">' +
          '<div style="font-size:.72rem;color:var(--c-text-dim);margin-bottom:.6rem;letter-spacing:.05em">選擇解讀深度</div>' +
          '<div style="display:flex;gap:.5rem;justify-content:center;flex-wrap:wrap;margin-bottom:.6rem">' +
            '<button onclick="window._jyOpusDepth=false;if(window._ootkTriggerAI&&window._ootkResults)window._ootkTriggerAI(window._ootkResults)" style="flex:1;max-width:175px;padding:.7rem .55rem;border-radius:12px;background:rgba(212,175,55,.06);border:1.5px solid rgba(212,175,55,.25);color:var(--c-gold);cursor:pointer;font-family:inherit;text-align:left">' +
              '<div style="font-size:.88rem;font-weight:700;margin-bottom:.25rem">⚡ 標準解讀</div>' +
              // v68.21 Bug #2 修:OOTK 沒免費,文案改「需付費解鎖」(後端 FREE_OOTK_LIMIT=0)
              '<div style="font-size:.64rem;color:var(--c-text-dim);line-height:1.55">需付費解鎖<br>五層深潛解讀<br>速度快・適合日常</div>' +
            '</button>' +
            '<button onclick="if(typeof _handleOpusClickForMode===\'function\')_handleOpusClickForMode(\'ootk\')" style="flex:1;max-width:175px;padding:.7rem .55rem;border-radius:12px;background:linear-gradient(135deg,rgba(147,51,234,.08),rgba(212,175,55,.04));border:1.5px solid rgba(147,51,234,.3);color:#c084fc;cursor:pointer;font-family:inherit;text-align:left">' +
              '<div style="font-size:.88rem;font-weight:700;margin-bottom:.25rem">🔮 深度解析</div>' +
              '<div style="font-size:.64rem;color:var(--c-text-dim);line-height:1.55">最強推理模型<br>五層鑰匙交叉驗證<br>根源挖掘更精準</div>' +
            '</button>' +
          '</div>' +
          '<div style="font-size:.58rem;color:var(--c-text-dim);opacity:.5">' +
            (admin ? '🔧 管理員・無限使用' : (function(){
              // v64.C:會員制下架,只顯示單次價
              // v68.21 Bug #8 修:會員下架後不再顯示「高級會員每月免費」分支(此資訊不該對前台一般用戶顯示)
              var _P = window.JY_PRICES || {};
              // v68.20 Bug #19/#31 修:fallback 對齊 worker.js PRICE_OPUS_OOTK = 140
              var _single = _P.OPUS_OOTK || 140;
              return '單次 NT$' + _single;
            })()) +
          '</div>' +
        '</div>';
      return;
    }

    try { if (typeof _ensureAiLoadingFx === 'function') _ensureAiLoadingFx(); } catch(_e) {}

    // ★ v27：隱藏回饋區（loading 期間不該出現）
    try { var _fb = document.getElementById('jy-feedback') || document.getElementById('feedback-section'); if (_fb) _fb.style.display = 'none'; } catch(_) {}

    // ── 從 OOTK 結果抓牌象等待訊息（不用命盤語言）──
    var _ootkSnippets = [];
    try {
      var _or = window._ootkResults;
      if (_or) {
        if (_or.op1 && _or.op1.activePile) { var _pzh = {fire:'火堆・意志',water:'水堆・情感',air:'風堆・思維',earth:'土堆・物質'}; _ootkSnippets.push('你的牌落入「' + (_pzh[_or.op1.activePile] || _or.op1.activePile) + '」，' + (_or.op1.activeCards ? _or.op1.activeCards.length + ' 張牌在述說你的故事' : '')); }
        if (_or.op2 && _or.op2.activeHouse) {
          var _hzh = ['自我','財帛','兄弟','田宅','子女','奴僕','夫妻','疾厄','遷移','官祿','福德','玄秘'];
          _ootkSnippets.push('這件事打到第' + _or.op2.activeHouse + '宮（' + (_hzh[(_or.op2.activeHouse||1)-1]||'') + '）');
        }
        if (_or.op3 && _or.op3.activeSign) _ootkSnippets.push('主導能量來自' + _or.op3.activeSign);
        if (_or.significator && _or.significator.name) _ootkSnippets.push('代表牌：' + _or.significator.name);
      }
      // 命盤補充（有的話加，但不當主角）
      var _lb = S.bazi;
      if (_lb && _lb.dm) _ootkSnippets.push('命盤背景：日主' + _lb.dm + '，' + (_lb.strength > 50 ? '能量偏強' : '善於借力使力'));
    } catch(_e) {}
    if (!_ootkSnippets.length) _ootkSnippets = ['正在依 Mathers Book T 解讀五次獨立讀盤…'];

    // 🔑 OOTK 專屬 loading（v21：牌象風格 + tag 初始亮燈 + 進度條）
    wrap.innerHTML = '<div style="text-align:center;padding:2rem 1.2rem 2.3rem">' +
      '<div style="position:relative;width:min(300px,80vw);aspect-ratio:5/7;margin:0 auto .6rem;border-radius:18px;overflow:hidden;box-shadow:0 0 40px rgba(212,175,55,.12)">' +
        '<img src="/img/loading-ootk.png" alt="" style="width:100%;height:100%;object-fit:cover;animation:jyImgPulse 4s ease-in-out infinite">' +
        '<div style="position:absolute;inset:0;background:linear-gradient(to bottom,transparent 30%,rgba(10,8,4,.6) 70%,rgba(10,8,4,.92))"></div>' +
        '<div class="jy-particles"><span style="left:10%;animation-duration:3.2s;animation-delay:0s;width:3px;height:3px"></span><span style="left:20%;animation-duration:4.1s;animation-delay:.5s"></span><span style="left:35%;animation-duration:3.5s;animation-delay:1.2s;width:5px;height:5px"></span><span style="left:48%;animation-duration:3.8s;animation-delay:.3s;width:3px;height:3px"></span><span style="left:55%;animation-duration:4.5s;animation-delay:1.8s"></span><span style="left:65%;animation-duration:3.3s;animation-delay:.8s;width:5px;height:5px"></span><span style="left:75%;animation-duration:4.2s;animation-delay:1.5s;width:3px;height:3px"></span><span style="left:85%;animation-duration:3.6s;animation-delay:.2s"></span><span style="left:42%;animation-duration:5s;animation-delay:2.1s;width:6px;height:6px;background:rgba(255,236,184,.8)"></span><span style="left:28%;animation-duration:4.8s;animation-delay:1s;width:2px;height:2px"></span><span style="left:58%;animation-duration:3.9s;animation-delay:2.5s;width:3px;height:3px"></span><span style="left:15%;animation-duration:4.4s;animation-delay:1.7s;width:2px;height:2px;background:rgba(255,220,150,.7)"></span></div><div class="jy-glow-center"></div><div style="position:absolute;inset:0;border-radius:18px;border:1px solid rgba(212,175,55,.2)"></div>' +
        '<div style="position:absolute;bottom:1rem;left:0;right:0;text-align:center">' +
          '<div style="font-size:1.05rem;color:var(--c-gold);font-weight:700;letter-spacing:.03em;text-shadow:0 2px 12px rgba(0,0,0,.7)">靜月正在為你開鑰…</div>' +
        '</div>' +
      '</div>' +
      '<div id="ootk-ai-phase" style="font-size:.8rem;color:var(--c-text-dim);transition:opacity .35s;min-height:1.25rem">讀取四元素分堆…</div>' +
      // 牌象 snippet
      '<div id="ootk-loading-snippet" style="max-width:320px;margin:.6rem auto 0;padding:.6rem .85rem;border-radius:12px;border:1px solid rgba(201,168,76,.12);background:rgba(201,168,76,.04);min-height:2.5rem">' +
        '<div style="font-size:.72rem;color:rgba(201,168,76,.6);margin-bottom:.2rem">你的占卜</div>' +
        '<div id="ootk-loading-snippet-text" style="font-size:.82rem;color:var(--c-text);line-height:1.6;transition:opacity .4s">' + (_ootkSnippets[0] || '') + '</div>' +
      '</div>' +
      '<div style="width:min(280px,82%);height:3px;border-radius:999px;background:rgba(201,168,76,.08);overflow:hidden;margin:.95rem auto .4rem">' +
        '<div id="ootk-loading-bar" style="width:6%;height:100%;border-radius:999px;background:linear-gradient(90deg,rgba(201,168,76,.6),rgba(201,168,76,.95),rgba(255,236,184,.9));transition:width .8s ease-out"></div>' +
      '</div>' +
      '<div id="ootk-loading-tags" style="display:flex;justify-content:center;gap:.4rem;flex-wrap:wrap;margin-top:.55rem">' +
        '<span data-sys="0" style="padding:.22rem .5rem;border-radius:999px;font-size:.66rem;color:rgba(201,168,76,.88);border:1px solid rgba(201,168,76,.3);background:rgba(201,168,76,.08);transition:all .5s">四元素</span>' +
        '<span data-sys="1" style="padding:.22rem .5rem;border-radius:999px;font-size:.66rem;color:rgba(201,168,76,.35);border:1px solid rgba(201,168,76,.08);background:transparent;transition:all .5s">宮位</span>' +
        '<span data-sys="2" style="padding:.22rem .5rem;border-radius:999px;font-size:.66rem;color:rgba(201,168,76,.35);border:1px solid rgba(201,168,76,.08);background:transparent;transition:all .5s">星座</span>' +
        '<span data-sys="3" style="padding:.22rem .5rem;border-radius:999px;font-size:.66rem;color:rgba(201,168,76,.35);border:1px solid rgba(201,168,76,.08);background:transparent;transition:all .5s">旬</span>' +
        '<span data-sys="4" style="padding:.22rem .5rem;border-radius:999px;font-size:.66rem;color:rgba(201,168,76,.35);border:1px solid rgba(201,168,76,.08);background:transparent;transition:all .5s">生命之樹</span>' +
      '</div>' +
    '</div>';

    wrap.scrollIntoView({ behavior: 'smooth', block: 'center' });

    var phases = ['讀取四元素分堆…','對照十二宮位…','解讀星座能量…','聚焦三十六旬…','攀上生命之樹…','觀察各 Op 獨立結論…','整理最終答案…'];
    var phaseIdx = 0;
    var _ootkSnippetIdx = 0;
    var phaseTimer = setInterval(function() {
      try {
      phaseIdx++;
      if (phaseIdx >= phases.length) phaseIdx = phases.length - 1;
      var el = document.getElementById('ootk-ai-phase');
      if (el) { el.style.opacity = '0'; setTimeout(function(){ if(el){ el.textContent = phases[phaseIdx]; el.style.opacity = '1'; }}, 200); }
      // ★ v29c：tag 逐一亮燈（timer 現在跑到 SSE 結束，所有 tag 都會亮）
      var tagWrap = document.getElementById('ootk-loading-tags');
      if (tagWrap) {
        var tags = tagWrap.querySelectorAll('span');
        var lightIdx = Math.min(phaseIdx, tags.length - 1);
        for (var ti = 0; ti < tags.length; ti++) {
          if (ti <= lightIdx) {
            tags[ti].style.color = 'rgba(201,168,76,.88)';
            tags[ti].style.borderColor = 'rgba(201,168,76,.3)';
            tags[ti].style.background = 'rgba(201,168,76,.08)';
          }
        }
      }
      // snippet 輪播
      if (_ootkSnippets.length > 1) {
        _ootkSnippetIdx = (_ootkSnippetIdx + 1) % _ootkSnippets.length;
        var snipEl = document.getElementById('ootk-loading-snippet-text');
        if (snipEl) { snipEl.style.opacity = '0'; setTimeout(function(){ if(snipEl){ snipEl.textContent = _ootkSnippets[_ootkSnippetIdx]; snipEl.style.opacity = '1'; }}, 350); }
      }
      // ★ v30b：bar 跟 phase 同步
      try { var _obar = document.getElementById('ootk-loading-bar'); if (_obar) _obar.style.width = Math.min(88, 6 + Math.round(phaseIdx / phases.length * 82)) + '%'; } catch(_) {}
      } catch(_te) { console.warn('[OOTK phase]', _te); }
    }, 1000);

    try {
      var payload = (typeof _buildOOTKPayload === 'function') ? _buildOOTKPayload() : null;
      if (!payload) throw new Error('OOTK payload 建構失敗');

      var body = { payload: payload };
      if (window._jyOpusDepth) payload.depth = 'opus';
      if (window._JY_ADMIN_TOKEN) body.admin_token = window._JY_ADMIN_TOKEN;
      if (window._JY_SESSION_TOKEN) body.session_token = window._JY_SESSION_TOKEN;
      var _pt = localStorage.getItem('_jy_paid_token');
      if (_pt) body.paid_token = _pt;

      var resp = await fetch(window.AI_WORKER_URL || 'https://jy-ai-proxy.onerkk.workers.dev', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      // ★ v29c：不在這裡 clearInterval——SSE streaming 時 timer 要繼續跑
      if (resp.status === 429) {
        clearInterval(phaseTimer);
        var errBody = {}; try { errBody = await resp.json(); } catch(_){}
        var e = new Error(errBody.error || 'rate limit');
        e.status = 429;
        e.code = errBody.code || '';
        throw e;
      }
      if (!resp.ok) {
        clearInterval(phaseTimer);
        var _errBody2 = {}; try { _errBody2 = await resp.json(); } catch(_){}
        var e2 = new Error(_errBody2.error || 'HTTP ' + resp.status);
        e2.status = resp.status;
        e2.code = _errBody2.code || '';
        throw e2;
      }

      var r = null;
      var ct = resp.headers.get('content-type') || '';
      if (ct.indexOf('text/event-stream') >= 0) {
        var reader = resp.body.getReader(), decoder = new TextDecoder(), buf = '';
        while (true) {
          var chunk = await reader.read(); if (chunk.done) break;
          buf += decoder.decode(chunk.value, { stream: true });
          var parts = buf.split('\n\n'); buf = parts.pop();
          for (var pi = 0; pi < parts.length; pi++) {
            var block = parts[pi].trim(); if (!block) continue;
            var lines = block.split('\n'), evtType = '', evtData = '';
            for (var li = 0; li < lines.length; li++) {
              if (lines[li].indexOf('event: ') === 0) evtType = lines[li].slice(7).trim();
              else if (lines[li].indexOf('data: ') === 0) evtData += lines[li].slice(6);
            }
            if (evtType === 'result' && evtData) { try { var parsed = JSON.parse(evtData); r = parsed.result || parsed; if (parsed.usage) window._jyLastUsage = parsed.usage; if (parsed.crystalProducts) window._jyCrystalProducts = parsed.crystalProducts; if (parsed.freeUsesLeft != null) window._jyFreeUsesLeft = parsed.freeUsesLeft; if (parsed.freeStatus) window._jyFreeStatus = parsed.freeStatus; if (parsed.freeLimits) window._jyFreeLimits = parsed.freeLimits; if (parsed.v62Config) window._jyV62ConfigSnapshot = parsed.v62Config; } catch(_){} }
            // ★ v68.21.19 Bug #15:OOTK SSE 處理之前只有 result+error,缺 audit/thinking/progress
            //   觸發場景:isOpusDepth(OOTK 用 Opus 4.7) + admin opus47_bestofn_config.enabled = true
            //   原本沒處理 → audit badge 完全不顯示給用戶
            else if (evtType === 'audit_start' && evtData) {
              try {
                var _ootkAuStart = JSON.parse(evtData);
                window._jyAuditStart = _ootkAuStart && _ootkAuStart.message;
                if (typeof window._jyRenderAuditBadge === 'function') {
                  window._jyRenderAuditBadge({ loading: true, message: _ootkAuStart.message });
                }
              } catch(_){}
            }
            else if (evtType === 'audit' && evtData) {
              try {
                var _ootkAud = JSON.parse(evtData);
                if (_ootkAud && _ootkAud.audit) window._jyAuditResultSnapshot = _ootkAud.audit;
                window._jyAuditResult = _ootkAud;
                if (typeof window._jyRenderAuditBadge === 'function') {
                  window._jyRenderAuditBadge(_ootkAud);
                }
              } catch(_){}
            }
            else if (evtType === 'progress' && evtData) {
              // 不覆蓋 ootk-ai-phase——client-side phase timer 負責輪播
              try { var _ootkProg = JSON.parse(evtData); } catch(_){}
            }
            else if (evtType === 'thinking' && evtData) {
              // v51 一致決策:不覆寫 UI(thinking_delta 切片不穩,輪播 phase timer 視覺更穩)
              try { if (window._JY_DEBUG) console.log('[OOTK thinking]', evtData); } catch(_){}
            }
            else if (evtType === 'error' && evtData) { try { var err = JSON.parse(evtData); throw new Error(err.error || '伺服器錯誤'); } catch(e){ throw e; } }
          }
        }
      } else {
        var data = await resp.json();
        r = data.result || data;
      }

      if (!r) throw new Error('回傳為空');

      // ★ v29c：SSE 讀完才停 timer + bar 跳 100% + tags 全亮
      clearInterval(phaseTimer);
      try { var _ob = document.getElementById('ootk-loading-bar'); if (_ob) { _ob.style.animation='none'; _ob.style.width='100%'; _ob.style.transition='width .4s'; } } catch(_) {}
      try { var _otw = document.getElementById('ootk-loading-tags'); if (_otw) { var _ots = _otw.querySelectorAll('span'); for (var _oti=0;_oti<_ots.length;_oti++) { _ots[_oti].style.color='rgba(201,168,76,.88)'; _ots[_oti].style.borderColor='rgba(201,168,76,.3)'; _ots[_oti].style.background='rgba(201,168,76,.08)'; } } } catch(_) {}

      if (typeof _renderOOTKResult === 'function') {
        _renderOOTKResult(wrap, r, !!(window._JY_ADMIN_TOKEN));
      } else {
        wrap.innerHTML = '<div style="padding:1rem;color:var(--c-text)">' + JSON.stringify(r).substring(0, 500) + '</div>';
      }
      var _tabT2 = document.getElementById('tab-tarot-back');
      if (_tabT2) _tabT2.innerHTML = '<i class="fas fa-key"></i> 開鑰深讀';

      // ★ v38：Admin 費用顯示（OOTK 獨立路徑）
      if (window._JY_ADMIN_TOKEN && window._jyLastUsage && typeof _adminCostHTML === 'function') {
        try {
          wrap.innerHTML += _adminCostHTML(window._jyLastUsage);
          // payload debug
          var _op = window._jyLastTarotPayload;
          if (_op) {
            var _opSize = JSON.stringify(_op).length;
            var _opOps = (_op.ootkData && _op.ootkData.operations) ? Object.keys(_op.ootkData.operations).length : 0;
            var _opPhotos = _op.photos ? ['face','palmLeft','palmRight','crystal'].filter(function(k){ return _op.photos[k]; }).join(',') : '';
            var _rSize = 0; try { _rSize = JSON.stringify(r).length; } catch(_) {}
            var _stLen = (r.story || '').length;
            wrap.innerHTML += '<div style="font-size:.55rem;color:#a78bfa;margin-top:.3rem;opacity:.5;word-break:break-all">[payload] ' + Math.round(_opSize/1024) + 'KB | ootk | ' + _opOps + '層' + (_opPhotos ? ' | 📷' + _opPhotos : '') + ' | output:' + Math.round(_rSize/1024) + 'KB | story:' + _stLen + '字</div>';
          }
          delete window._jyLastUsage;
        } catch(_ce) {}
      }

      // ★ v27：標記 OOTK 完成 + 刷新導航
      try {
        window._jyResultModes = window._jyResultModes || {};
        window._jyResultModes.ootk = true;
        if (typeof _refreshAllNavs === 'function') _refreshAllNavs('ootk');
      } catch(_ne) {}

      // ★ v27：顯示回饋區
      try { if (typeof showFeedbackSection === 'function') setTimeout(showFeedbackSection, 3000); } catch(_fe) {}
      // ★ v38：試用期倒數提示
      try { if (typeof _showTrialBanner === 'function') setTimeout(_showTrialBanner, 1500); } catch(_tb) {}

      // 存完整解讀摘要供追問用
      window._jyTarotFollowUps = 0;
      var _ootkSummaryParts = [r.directAnswer || ''];
      if (r.operations) {
        ['op1','op2','op3','op4','op5'].forEach(function(k) {
          if (r.operations[k] && r.operations[k].conclusion) _ootkSummaryParts.push(r.operations[k].conclusion);
        });
      }
      if (r.crossAnalysis) _ootkSummaryParts.push(r.crossAnalysis);
      if (r.summary) _ootkSummaryParts.push(r.summary);
      window._jyTarotPrevReading = _ootkSummaryParts.filter(Boolean).join(' ');

      var _closing = (r.closing || r.oneliner || r.directAnswer || '').trim();
      if (_closing) window._jyClosingText = _closing;
      try { if (typeof _storeShareData === 'function') _storeShareData('ootk', r); } catch(_sd) {}
      try { if (typeof _notifyComplete === 'function') _notifyComplete('ootk', r); } catch(_ne) {}

    } catch(err) {
      clearInterval(phaseTimer);
      console.error('[OOTK-AI]', err);
      if (err.code === 'LOGIN_REQUIRED') {
        // 未登入 → 彈登入視窗
        wrap.innerHTML = '';
        if (typeof _jyGoogleLogin === 'function') _jyGoogleLogin();
      } else if (err.status === 403 && err.code === 'OPUS_PAYMENT_REQUIRED' && !window._JY_ADMIN_TOKEN) {
        // v68.21.1 Bug #86 修:OOTK 深度需付費,顯示明確付費牆
        //   原本只查 'OOTK_PAYMENT_REQUIRED',但 worker 從沒回過這個 code(實際是 OPUS_PAYMENT_REQUIRED)
        //   結果:用戶配額用完點深度 → 看到「連線不順」誤導訊息,完全找不到付費按鈕
        // ★ Bug A 修:fallback 從 120 改 140(對齊 worker.js PRICE_OPUS_OOTK=140)
        //   過去寫死 120 是 v68.13 升價前的舊值,升價後沒同步改 → 用戶看 NT$120 但點付款是 140
        //   雖然 pricing-loader 載入後 window.JY_PRICES.OPUS_OOTK 會是 140 蓋過 fallback,
        //   但若 pricing-loader 抓 /pricing 失敗 + 沒有快取 → fallback 顯示 120 → 投訴
        var _ootkOpusPrice = (window.JY_PRICES && window.JY_PRICES.OPUS_OOTK) || 140;
        wrap.innerHTML = '<div style="text-align:center;padding:1.5rem">' +
          '<div style="font-size:2rem;margin-bottom:.5rem">🔮</div>' +
          '<div style="font-size:.9rem;color:var(--c-gold);font-weight:700;margin-bottom:.3rem">開鑰深度解析需單次購買</div>' +
          '<div style="font-size:.8rem;color:var(--c-text-dim);margin-bottom:.8rem;line-height:1.6">深度解析使用最高階模型<br>單次 NT$' + _ootkOpusPrice + '</div>' +
          '<button onclick="if(typeof _jyStartPayment===\'function\')_jyStartPayment(\'ootk\',\'opus_single\')" style="padding:.7rem 1.4rem;border-radius:10px;background:linear-gradient(135deg,rgba(212,175,55,.2),rgba(212,175,55,.08));color:var(--c-gold);font-size:.85rem;font-weight:700;border:1.5px solid rgba(212,175,55,.45);cursor:pointer;font-family:inherit;margin-right:.5rem">🔮 開鑰深度 NT$' + _ootkOpusPrice + '</button>' +
          '<button onclick="window._jyOpusDepth=false;if(window._ootkTriggerAI && window._ootkResults) window._ootkTriggerAI(window._ootkResults)" style="padding:.7rem 1rem;border-radius:10px;background:transparent;color:var(--c-text-dim);font-size:.78rem;border:1px solid rgba(255,255,255,.15);cursor:pointer;font-family:inherit">改用標準</button>' +
          '</div>';
      } else if (err.code === 'OOTK_PAYMENT_REQUIRED' || (err.status === 429 && !window._JY_ADMIN_TOKEN)) {
        // 需要付費 → 彈付費牆
        // ★ Bug B 修:過去同時做兩件事(_jyStartPayment + wrap.innerHTML 付費按鈕),
        //   結果用戶關掉 modal 後仍看到一個重複的「需付費解鎖」按鈕,UI 凌亂。
        //   修法:只渲染 wrap 內的「需付費解鎖」+「重試」按鈕(不主動彈 modal)
        //         讓用戶自主點按鈕觸發 _jyStartOOTK(該函式內會走付費攔截器)
        //   注意:err.code === 'OOTK_PAYMENT_REQUIRED' worker 從未回過,實際只有 status===429,
        //         (worker 對 OOTK FREE_USED_UP 回 status=429 走進這裡)
        //         保留 err.code 比對是 backward compat
        var _ootkSinglePrice = (window.JY_PRICES && window.JY_PRICES.SINGLE_OOTK) || 70;
        wrap.innerHTML = '<div style="text-align:center;padding:1.5rem">' +
          '<div style="font-size:2rem;margin-bottom:.5rem">🔑</div>' +
          '<div style="font-size:.9rem;color:var(--c-gold);font-weight:700;margin-bottom:.3rem">開鑰之法需付費解鎖</div>' +
          '<div style="font-size:.8rem;color:var(--c-text-dim);margin-bottom:.8rem">NT$' + _ootkSinglePrice + ' · 五次獨立讀盤(Book T 正統)</div>' +
          '<button onclick="if(typeof _jyStartPayment===\'function\')_jyStartPayment(\'ootk\',\'single\')" style="padding:.6rem 1.2rem;border-radius:10px;background:transparent;color:var(--c-gold);border:1px solid rgba(255,255,255,.1);font-size:.85rem;font-weight:600;cursor:pointer;font-family:inherit">🔑 付費解鎖</button></div>';
      } else {
        wrap.innerHTML = '<div style="text-align:center;padding:1rem"><div style="color:#f87171;font-size:.82rem;margin-bottom:.6rem">連線不順，請再試一次</div>' +
          '<button onclick="if(window._ootkTriggerAI && window._ootkResults) window._ootkTriggerAI(window._ootkResults)" style="padding:.6rem 1.2rem;border-radius:10px;background:transparent;color:var(--c-gold);border:1px solid rgba(255,255,255,.1);font-size:.85rem;font-weight:600;cursor:pointer;font-family:inherit">🔑 重試</button></div>';
      }
    }
  }

  // ── 主入口：啟動 OOTK 流程 ──
  function startOOTK() {
    _showSignificatorSelection(function(sigId) {
      _runOOTKSequence(sigId);
    });
  }

  // ── 全域輸出 ──
  window.startOOTK = startOOTK;
  window._ootkTriggerAI = _triggerOOTKAI;

  console.log('[OOTK-UI] Opening of the Key 前端 UI 已載入');
})();

// ═══════════════════════════════════════════════════════════════
// v64.B 塔羅華麗洗牌動畫 — 三幕式儀式(對齊七維儀式設計)
// 設計:
//   第 1-2 次:完整 2.8 秒(收攏 0.8 + 洗牌 1.2 + 散開 0.8)
//   第 3 次起:compact 模式 0.8 秒(只播散開)
//   全程「跳過 →」按鈕可隨時略過
//   localStorage key:_jy_tarot_shuffle_count
// ═══════════════════════════════════════════════════════════════
(function(){
'use strict';

function _ensureV64bShuffleStyles() {
  if (document.getElementById('jy-v64b-shuffle-fx')) return;
  var s = document.createElement('style');
  s.id = 'jy-v64b-shuffle-fx';
  s.textContent =
    // 全屏儀式 overlay
    '.jy-tshuffle-overlay{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;overflow:hidden;background:#000;opacity:0;transition:opacity .5s ease;font-family:inherit}' +
    '.jy-tshuffle-overlay.show{opacity:1}' +
    '.jy-tshuffle-overlay.fade-out{opacity:0;pointer-events:none}' +
    // 背景圖
    '.jy-tshuffle-bg{position:absolute;inset:0;background:url("/img/tarot-shuffle-bg.jpg") center/cover no-repeat,radial-gradient(ellipse at center,#0a0d18 0%,#000 70%);opacity:0;transition:opacity 1.2s ease}' +
    '.jy-tshuffle-overlay.show-bg .jy-tshuffle-bg{opacity:.92}' +
    // 月光符號(focal point)
    '.jy-tshuffle-glyph{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%) scale(.5);width:min(280px,72vw);height:auto;opacity:0;transition:opacity 1s ease,transform 1s cubic-bezier(.4,.1,.3,1);pointer-events:none;filter:drop-shadow(0 0 32px rgba(253,230,138,.5))}' +
    '.jy-tshuffle-overlay.show-glyph .jy-tshuffle-glyph{opacity:.95;transform:translate(-50%,-50%) scale(1)}' +
    '.jy-tshuffle-overlay.show-glyph .jy-tshuffle-glyph img{width:100%;height:auto;animation:jyTshuffleGlyphPulse 2.4s ease-in-out infinite}' +
    '@keyframes jyTshuffleGlyphPulse{0%,100%{filter:brightness(1) drop-shadow(0 0 16px rgba(253,230,138,.5));transform:scale(1) rotate(0deg)}50%{filter:brightness(1.2) drop-shadow(0 0 32px rgba(253,230,138,.85));transform:scale(1.05) rotate(180deg)}}' +
    // 牌堆中央(模擬 78 張疊起來)
    '.jy-tshuffle-deck{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:120px;height:180px;opacity:0;transition:opacity .5s ease;pointer-events:none}' +
    '.jy-tshuffle-overlay.show-deck .jy-tshuffle-deck{opacity:1}' +
    '.jy-tshuffle-deck-card{position:absolute;inset:0;background:url("/tarot_img/card-back.jpg") center/cover #0a0d18;border:1px solid rgba(212,175,55,.5);border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,.7),0 0 16px rgba(212,175,55,.3);will-change:transform;backface-visibility:hidden}' +
    // 收攏階段:牌從散開飛回中央(stagger 入場)
    '@keyframes jyTshuffleConverge{0%{transform:translate(var(--start-x),var(--start-y)) rotate(var(--start-rot)) scale(.8);opacity:0}50%{opacity:.9}100%{transform:translate(0,0) rotate(0deg) scale(1);opacity:1}}' +
    '.jy-tshuffle-deck-card.converging{animation:jyTshuffleConverge .8s cubic-bezier(.6,0,.4,1) forwards}' +
    // 洗牌階段:切牌 → 交錯 → 旋轉
    '@keyframes jyTshuffleSplit{0%{transform:translate(0,0) rotate(0deg)}30%{transform:translate(var(--split-x),var(--split-y)) rotate(var(--split-rot))}70%{transform:translate(calc(var(--split-x)*.3),calc(var(--split-y)*.3)) rotate(calc(var(--split-rot)*.4))}100%{transform:translate(0,0) rotate(0deg)}}' +
    '.jy-tshuffle-deck-card.shuffling{animation:jyTshuffleSplit 1.2s cubic-bezier(.4,.1,.3,1) forwards}' +
    // 旋轉光環(洗牌期間出現)
    '.jy-tshuffle-aura{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:280px;height:280px;border-radius:50%;border:1px solid rgba(212,175,55,.3);opacity:0;transition:opacity .5s ease;pointer-events:none}' +
    '.jy-tshuffle-overlay.show-aura .jy-tshuffle-aura{opacity:1;animation:jyTshuffleAuraSpin 4s linear infinite}' +
    '@keyframes jyTshuffleAuraSpin{0%{transform:translate(-50%,-50%) rotate(0deg);box-shadow:0 0 24px rgba(212,175,55,.3),inset 0 0 24px rgba(212,175,55,.15)}50%{box-shadow:0 0 48px rgba(212,175,55,.5),inset 0 0 36px rgba(212,175,55,.25)}100%{transform:translate(-50%,-50%) rotate(360deg);box-shadow:0 0 24px rgba(212,175,55,.3),inset 0 0 24px rgba(212,175,55,.15)}}' +
    // 文字提示
    '.jy-tshuffle-text{position:absolute;bottom:18%;left:50%;transform:translateX(-50%);color:#fde68a;font-size:1.05rem;letter-spacing:.18em;font-weight:600;text-shadow:0 0 16px rgba(253,230,138,.6);opacity:0;transition:opacity .5s ease;text-align:center;white-space:nowrap}' +
    '.jy-tshuffle-text.show{opacity:1}' +
    // 跳過按鈕(對齊七維設計)
    '.jy-tshuffle-skip{position:absolute;bottom:1.5rem;right:1.5rem;padding:.5rem 1rem;background:rgba(0,0,0,.5);color:rgba(212,175,55,.7);border:1px solid rgba(212,175,55,.3);border-radius:8px;font-size:.78rem;font-weight:600;cursor:pointer;font-family:inherit;letter-spacing:.05em;backdrop-filter:blur(4px);transition:all .3s ease;z-index:10}' +
    '.jy-tshuffle-skip:hover,.jy-tshuffle-skip:active{background:rgba(212,175,55,.15);color:#fde68a;border-color:rgba(212,175,55,.6)}' +
    // 散開階段:從中央爆炸式回到扇形位置
    '@keyframes jyTshuffleDisperse{0%{transform:translate(0,0) rotate(0deg) scale(1);opacity:1}30%{transform:translate(calc(var(--end-x)*.3),calc(var(--end-y)*.3)) rotate(calc(var(--end-rot)*.5)) scale(1.1);opacity:1}100%{transform:translate(var(--end-x),var(--end-y)) rotate(var(--end-rot)) scale(0);opacity:0}}' +
    '.jy-tshuffle-deck-card.dispersing{animation:jyTshuffleDisperse .8s cubic-bezier(.5,-.2,.5,1) forwards}' +
    // reduced motion 支援(無障礙)
    '@media (prefers-reduced-motion: reduce){.jy-tshuffle-overlay{transition:opacity .2s ease}.jy-tshuffle-deck-card.converging,.jy-tshuffle-deck-card.shuffling,.jy-tshuffle-deck-card.dispersing{animation-duration:.3s !important}}' +
    // 行動裝置最佳化
    '@media (max-width:480px){.jy-tshuffle-glyph{width:min(220px,68vw)}.jy-tshuffle-text{font-size:.92rem;bottom:14%}.jy-tshuffle-aura{width:220px;height:220px}}';
  document.head.appendChild(s);
}

// 主洗牌儀式函式
window._v64bTarotShuffleRitual = function(deckWrap, onComplete) {
  _ensureV64bShuffleStyles();

  // 累計觀看次數,第 3 次起 compact 模式
  var seenCount = 0;
  try { seenCount = parseInt(localStorage.getItem('_jy_tarot_shuffle_count') || '0') || 0; } catch(_) {}
  var compact = seenCount >= 2;

  // 偵測 reduced motion(無障礙)
  var reducedMotion = false;
  try {
    reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch(_) {}

  // 建立 overlay
  var overlay = document.createElement('div');
  overlay.className = 'jy-tshuffle-overlay';
  overlay.innerHTML =
    '<div class="jy-tshuffle-bg"></div>' +
    '<div class="jy-tshuffle-aura"></div>' +
    '<div class="jy-tshuffle-glyph"><img src="/img/tarot-moon-glyph.png" alt="" onerror="this.style.display=\'none\'"></div>' +
    '<div class="jy-tshuffle-deck" id="jy-tshuffle-deck"></div>' +
    '<div class="jy-tshuffle-text" id="jy-tshuffle-text"></div>' +
    '<button class="jy-tshuffle-skip" id="jy-tshuffle-skip">跳過洗牌 →</button>';
  document.body.appendChild(overlay);

  // 建立 12 張視覺牌堆(視覺效果用,不是真的 78 張)
  var deckEl = overlay.querySelector('#jy-tshuffle-deck');
  var visualCards = [];
  var CARD_COUNT = compact ? 8 : 12;
  for (var i = 0; i < CARD_COUNT; i++) {
    var card = document.createElement('div');
    card.className = 'jy-tshuffle-deck-card';
    // 給每張隨機起始位置(模擬從散開飛回)
    var angle = (i / CARD_COUNT) * Math.PI * 2;
    var radius = 200 + Math.random() * 80;
    var startX = Math.cos(angle) * radius;
    var startY = Math.sin(angle) * radius;
    var startRot = (Math.random() - 0.5) * 60;
    card.style.setProperty('--start-x', startX + 'px');
    card.style.setProperty('--start-y', startY + 'px');
    card.style.setProperty('--start-rot', startRot + 'deg');
    // 切牌時的偏移
    var splitDir = i % 2 === 0 ? 1 : -1;
    card.style.setProperty('--split-x', (splitDir * 30 + (Math.random() - 0.5) * 20) + 'px');
    card.style.setProperty('--split-y', ((Math.random() - 0.5) * 40) + 'px');
    card.style.setProperty('--split-rot', (splitDir * (8 + Math.random() * 8)) + 'deg');
    // 散開時的目標位置
    card.style.setProperty('--end-x', (Math.cos(angle + Math.PI / 4) * 220) + 'px');
    card.style.setProperty('--end-y', (Math.sin(angle + Math.PI / 4) * 220) + 'px');
    card.style.setProperty('--end-rot', ((Math.random() - 0.5) * 90) + 'deg');
    deckEl.appendChild(card);
    visualCards.push(card);
  }

  // ═══ 動畫節奏 ═══
  var timers = [];
  function _t(fn, ms) { timers.push(setTimeout(fn, ms)); }
  function _abortTimers() { timers.forEach(function(t){ clearTimeout(t); }); timers = []; }

  function _setText(text) {
    var txtEl = overlay.querySelector('#jy-tshuffle-text');
    if (!txtEl) return;
    txtEl.classList.remove('show');
    setTimeout(function() {
      txtEl.textContent = text;
      txtEl.classList.add('show');
    }, 200);
  }

  function _finish() {
    _abortTimers();
    overlay.classList.add('fade-out');
    setTimeout(function() {
      try { overlay.remove(); } catch(_e){}
      try { localStorage.setItem('_jy_tarot_shuffle_count', String(seenCount + 1)); } catch(_e){}
      if (typeof onComplete === 'function') onComplete();
    }, 500);
  }

  // 跳過按鈕(立即執行)
  _t(function() {
    var skipBtn = overlay.querySelector('#jy-tshuffle-skip');
    if (skipBtn) skipBtn.addEventListener('click', _finish);
  }, 50);

  // reduced motion → 直接秒結束
  if (reducedMotion) {
    _t(_finish, 300);
    overlay.classList.add('show');
    return;
  }

  // ═══ COMPACT 模式(第 3 次起):0.8 秒精簡版 ═══
  if (compact) {
    overlay.classList.add('show');
    _t(function() { overlay.classList.add('show-bg', 'show-deck'); }, 100);
    _t(function() {
      _setText('🌙 洗牌完成');
      visualCards.forEach(function(c, i) {
        _t(function() { c.classList.add('dispersing'); }, i * 30);
      });
    }, 300);
    _t(_finish, 1100);
    return;
  }

  // ═══ 完整三幕式動畫(2.8 秒) ═══
  overlay.classList.add('show');

  // 幕 1:背景淡入 + 牌堆收攏(0-0.8s)
  _t(function() {
    overlay.classList.add('show-bg', 'show-deck');
    _setText('凝神冥想 ⋯');
    visualCards.forEach(function(c, i) {
      _t(function() { c.classList.add('converging'); }, i * 30);
    });
  }, 100);

  // 幕 2:洗牌(0.8-2.0s)
  _t(function() {
    overlay.classList.add('show-glyph', 'show-aura');
    _setText('靜月為你洗牌 ⋯');
    visualCards.forEach(function(c, i) {
      _t(function() {
        c.classList.remove('converging');
        c.classList.add('shuffling');
      }, i * 25);
    });
  }, 900);

  // 幕 3:散開 + 完成提示(2.0-2.8s)
  _t(function() {
    _setText('🌙 牌已就緒 · 觸碰你有感覺的牌');
    overlay.classList.remove('show-glyph');
    visualCards.forEach(function(c, i) {
      _t(function() {
        c.classList.remove('shuffling');
        c.classList.add('dispersing');
      }, i * 20);
    });
  }, 2100);

  // 結束
  _t(_finish, 2900);
};

})();
