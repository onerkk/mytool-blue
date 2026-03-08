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
// INTEGRATION
// ══════════════════════════════════════════════════════════════════════

function enhanceTarot(tarot) {
  if (!tarot || !tarot.drawn || !tarot.drawn.length) return tarot;

  var drawn = tarot.drawn;

  // 1. 數字學分析
  try { tarot.numerology = tarotNumerologyAnalysis(drawn); } catch(e) { tarot.numerology = null; }

  // 2. 牌陣（根據張數自動選擇）
  if (drawn.length === 3) {
    try { tarot.spreadAnalysis = tarotThreeCardSpread(drawn, tarot.type || 'general'); } catch(e) {}
  } else if (drawn.length === 5) {
    try { tarot.spreadAnalysis = tarotCrossSpread(drawn, tarot.type || 'general'); } catch(e) {}
  } else if (drawn.length === 7) {
    try { tarot.spreadAnalysis = tarotHorseshoeSpread(drawn, tarot.type || 'general'); } catch(e) {}
  }

  // 3. 卡巴拉
  try { tarot.kabbalah = tarotKabbalahAnalysis(drawn); } catch(e) { tarot.kabbalah = []; }

  // 4. 牌組深度統計
  try { tarot.suitAnalysis = tarotSuitAnalysis(drawn); } catch(e) { tarot.suitAnalysis = null; }

  return tarot;
}
