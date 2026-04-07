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
  ootk: {
    id: 'ootk', zh: '開鑰之法', count: 0,
    en: '開鑰之法',
    desc: '金色黎明最高階占卜・五階段・使用全部 78 張牌・從四元素到生命之樹逐層深入',
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

  // 0. 多子問題（3個以上問號）→ 凱爾特十字
  if (qMarks >= 3) return 'celtic_cross';

  // 1. 二選一 → 二選一牌陣
  if (/還是|或者|A.*B|選.*哪|二選一|兩個.*選/.test(q)) {
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
        var sfExist = document.getElementById('jy-shuffle-btn');
        if (!sfExist) {
          var shuffleWrap2 = document.querySelector('#step-2 .text-center');
          if (shuffleWrap2) {
            var sfBtn2 = document.createElement('button');
            sfBtn2.className = 'jy-shuffle-btn';
            sfBtn2.id = 'jy-shuffle-btn';
            sfBtn2.innerHTML = '🌀 洗牌・開始選牌';
            shuffleWrap2.insertBefore(sfBtn2, shuffleWrap2.firstChild);
            var autoDrawBtn2 = document.querySelector('#step-2 .btn-outline');
            if (autoDrawBtn2) autoDrawBtn2.style.display = 'none';
            var pickHint2 = document.getElementById('pick-hint');
            if (pickHint2) pickHint2.innerHTML = '✨ 滑動欣賞牌面 ✨';
            sfBtn2.addEventListener('click', function() {
              if (window._deckIsShuffled) return;
              sfBtn2.style.pointerEvents = 'none';
              sfBtn2.innerHTML = '🌀 洗牌中⋯';
              var allCards2 = deckWrap.querySelectorAll('.tarot-deck-card');
              var delay2 = 0;
              allCards2.forEach(function(card) {
                setTimeout(function() {
                  card.classList.add('shuffling');
                  setTimeout(function() {
                    var face = card.querySelector('.tdc-face');
                    var back = card.querySelector('.tdc-back');
                    if (face) face.style.display = 'none';
                    if (back) back.style.transform = 'none';
                  }, 230);
                }, delay2);
                delay2 += 18;
              });
              setTimeout(function() {
                window._deckIsShuffled = true;
                sfBtn2.remove();
                if (autoDrawBtn2) autoDrawBtn2.style.display = '';
                if (pickHint2) {
                  pickHint2.innerHTML = '觸碰任一張你有感覺的牌，選出 <span id="t-target-count">' + targetCount + '</span> 張';
                }
              }, delay2 + 600);
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
        count: 5,
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

  var ED_MAP = {
    '火+風':'strengthen','風+火':'strengthen',
    '水+土':'strengthen','土+水':'strengthen',
    '火+水':'weaken','水+火':'weaken',
    '風+土':'weaken','土+風':'weaken',
    '火+土':'neutral','土+火':'neutral',
    '水+風':'neutral','風+水':'neutral',
    '火+火':'strengthen','水+水':'strengthen',
    '風+風':'strengthen','土+土':'strengthen'
  };

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
    // ★ v25g：模擬真人手切牌——四堆大小不完全相等但不會極端
    // 真實 OOTK 儀式四堆 ≈ 19-20 張，自然偏差 ±6 張（範圍約 12-27）
    var len = deck.length; // 78
    var MIN_PILE = 12;
    var MAX_PILE = 27;

    // 生成 4 個隨機堆大小，再正規化到總和 = 78
    var sizes = [];
    for (var s = 0; s < 4; s++) {
      sizes.push(Math.round(19.5 + (Math.random() - 0.5) * 14)); // 12.5 ~ 26.5
    }
    // 正規化：調整到總和 = len，每堆在 MIN_PILE ~ MAX_PILE
    var diff = len - sizes.reduce(function(a, b) { return a + b; }, 0);
    var safety = 0;
    while (diff !== 0 && safety < 200) {
      var ri = Math.floor(Math.random() * 4);
      if (diff > 0 && sizes[ri] < MAX_PILE) { sizes[ri]++; diff--; }
      else if (diff < 0 && sizes[ri] > MIN_PILE) { sizes[ri]--; diff++; }
      safety++;
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

  function ootkOp2(activePile, significatorId) {
    // ★ 正統 OOTK Op2：把 Op1 的 active pile 按順序發到 12 宮
    // 第1張→第1宮，第2張→第2宮...第13張→第1宮...循環
    // 因為洗牌順序每次不同，Sig 落在的宮位每次也不同
    var houses = [];
    for (var h = 0; h < 12; h++) houses.push([]);

    activePile.forEach(function(card, idx) {
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

  function ootkOp3(activePile, significatorId) {
    // ★ 正統 OOTK Op3：把 Op1 active pile 按 GD 星座歸屬分到 12 星座
    var signs = [];
    for (var s = 0; s < 12; s++) signs.push([]);

    activePile.forEach(function(card) {
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

  function ootkOp4(activePile, significatorId) {
    // ★ 正統 OOTK Op4：把 Op1 active pile 按 GD 旬歸屬分到 36 旬
    var decans = [];
    for (var d = 0; d < 36; d++) decans.push([]);

    activePile.forEach(function(card) {
      var di = getCardDecan(card);
      decans[di].push(card);
    });

    var activeDecan = -1;
    for (var di = 0; di < 36; di++) {
      if (decans[di].some(function(c) { return c.id === significatorId; })) {
        activeDecan = di;
        break;
      }
    }

    var dm = DECAN_MAP[activeDecan] || {};
    var activeCards = decans[activeDecan] || [];
    var sigIdx = activeCards.findIndex(function(c) { return c.id === significatorId; });
    var counted = ootkCounting(activeCards, sigIdx >= 0 ? sigIdx : 0);
    var paired = ootkPairing(activeCards, sigIdx >= 0 ? sigIdx : 0);

    return {
      activeDecan: activeDecan,
      decanSign: dm.sign || '',
      decanRange: dm.range || '',
      decanPlanet: dm.planet || '',
      activeCards: activeCards,
      keyCards: counted.keyCards,
      countingPath: counted.path,
      pairs: paired,
      dignities: ootkDignities(counted.keyCards)
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

  function ootkOp5(activePile, significatorId) {
    // ★ 正統 OOTK Op5：把 Op1 active pile 按 GD 質點歸屬分到生命之樹 10 質點
    var sephirot = [];
    for (var s = 0; s < 10; s++) sephirot.push([]);

    activePile.forEach(function(card) {
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
    var activeCards = sephirot[activeSeph] || [];
    var sigIdx = activeCards.findIndex(function(c) { return c.id === significatorId; });
    var counted = ootkCounting(activeCards, sigIdx >= 0 ? sigIdx : 0);
    var paired = ootkPairing(activeCards, sigIdx >= 0 ? sigIdx : 0);

    return {
      sephirahDistribution: sephirot.map(function(s) { return s.length; }),
      activeSephirah: sp.name || '',
      sephirahZh: sp.zh || '',
      sephirahMeaning: sp.meaning || '',
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

    for (var step = 0; step < maxSteps; step++) {
      var card = cards[idx];
      if (!card || visited[idx]) break;
      keyCards.push({ card: card, position: idx });
      visited[idx] = true;
      var count = getCountValue(card);
      // 正位向右，逆位向左
      var cardIsUp = (card.isUp === true);
      var direction = cardIsUp ? 1 : -1;
      path.push({
        cardId: card.id,
        cardName: card.n || card.name,
        position: idx,
        countValue: count,
        isUp: cardIsUp,
        direction: direction > 0 ? 'right' : 'left'
      });
      // 移動（環繞）
      for (var c = 0; c < count; c++) {
        idx = (idx + direction + cards.length) % cards.length;
      }
    }
    return { keyCards: keyCards, path: path };
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
    while (left >= 0 && right < cards.length) {
      var ed = elementalDignity(cards[left], cards[right]);
      pairs.push({ left: cards[left], right: cards[right], dignity: ed });
      left--;
      right++;
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

  function runFullOOTK(significatorId) {
    if (typeof TAROT === 'undefined') return null;

    // 一次洗牌，五階段共用
    var deck = TAROT.map(function(c) {
      return Object.assign({}, c, { isUp: Math.random() >= 0.5 });
    });
    // Fisher-Yates shuffle
    for (var i = deck.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = deck[i]; deck[i] = deck[j]; deck[j] = tmp;
    }

    var results = {};
    results.significatorId = significatorId;
    var sigCard = TAROT.find(function(c) { return c.id === significatorId; });
    results.significator = sigCard ? {
      id: sigCard.id,
      name: sigCard.n,
      element: getCardElement(sigCard)
    } : null;

    // ★ 正統 OOTK：Op1 用全副牌，Op2-5 用 Op1 篩選出的 active pile
    results.op1 = ootkOp1(deck, significatorId);
    var activePile = results.op1.activeCards || deck; // fallback 不該觸發
    results.op2 = ootkOp2(activePile, significatorId);
    results.op3 = ootkOp3(activePile, significatorId);
    results.op4 = ootkOp4(activePile, significatorId);
    results.op5 = ootkOp5(activePile, significatorId);
    results.completedOperations = 5;

    // 跨階段分析
    var allKeyCardIds = {};
    ['op1', 'op2', 'op3', 'op4', 'op5'].forEach(function(opKey) {
      var kc = results[opKey].keyCards || [];
      kc.forEach(function(k) {
        var cid = k.card ? k.card.id : -1;
        if (!allKeyCardIds[cid]) allKeyCardIds[cid] = [];
        allKeyCardIds[cid].push(opKey);
      });
    });
    var opZh = { 'op1': '四元素', 'op2': '十二宮', 'op3': '十二星座', 'op4': '三十六旬', 'op5': '生命之樹' };
    var recurring = [];
    var recurringIds = {}; // 追蹤已加入的牌 id，避免重複
    for (var cid in allKeyCardIds) {
      if (allKeyCardIds[cid].length >= 2) {
        var cn = TAROT[parseInt(cid)] ? TAROT[parseInt(cid)].n : cid;
        recurring.push(cn + '（關鍵牌，出現在' + allKeyCardIds[cid].map(function(k) { return opZh[k] || k; }).join('、') + '）');
        recurringIds[cid] = true;
      }
    }

    // ★ activeCards 跨層重複偵測：出現在 3+ 層活躍堆裡的牌也是強信號
    var allActiveCardIds = {};
    ['op1', 'op2', 'op3', 'op4', 'op5'].forEach(function(opKey) {
      var ac = results[opKey].activeCards || [];
      ac.forEach(function(c) {
        var cid = c.id != null ? c.id : -1;
        if (!allActiveCardIds[cid]) allActiveCardIds[cid] = [];
        if (allActiveCardIds[cid].indexOf(opKey) < 0) allActiveCardIds[cid].push(opKey);
      });
    });
    for (var acid in allActiveCardIds) {
      if (allActiveCardIds[acid].length >= 3 && !recurringIds[acid]) {
        var acn = TAROT[parseInt(acid)] ? TAROT[parseInt(acid)].n : acid;
        recurring.push(acn + '（活躍堆，出現在' + allActiveCardIds[acid].map(function(k) { return opZh[k] || k; }).join('、') + '）');
      }
    }

    results.crossAnalysis = {
      elementProgression: [
        results.op1.activePile,
        results.op2.activeHouse + '宮',
        results.op3.activeSign,
        results.op4.decanSign + ' ' + results.op4.decanRange,
        results.op5.activeSephirah + '(' + results.op5.sephirahZh + ')'
      ].join(' → '),
      recurringCards: recurring,
      pileElement: results.op1.activePile,
      // ★ #18 修復：全五層元素分佈——讓 AI 看到從表層到核心的元素轉變
      elementFlow: {
        op1: results.op1.activePile || '',
        op2: results.op2.activeHouse ? '第' + results.op2.activeHouse + '宮' : '',
        op3: results.op3.activeSign || '',
        op4: (results.op4.decanSign || '') + (results.op4.decanPlanet ? '（' + results.op4.decanPlanet + '）' : ''),
        op5: (results.op5.activeSephirah || '') + (results.op5.sephirahZh ? '（' + results.op5.sephirahZh + '）' : '')
      }
    };

    return results;
  }

  // ════════════════════════════════════════════════
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

  console.log('[OOTK v2] Opening of the Key 正統引擎已載入');
})();


// ══════════════════════════════════════════════════════════════════════
// 10. OOTK Phase 2 — 前端 UI、五階段動畫、Significator 選擇
// ══════════════════════════════════════════════════════════════════════

(function() {
  'use strict';

  var OP_LABELS = [
    { id: 'op1', zh: '四元素分堆', en: 'Elemental Piles', icon: '🜂', desc: '問題屬於人生的哪個領域？' },
    { id: 'op2', zh: '十二宮位', en: '12 Houses', icon: '🏠', desc: '問題落在人生的哪個宮位？' },
    { id: 'op3', zh: '十二星座', en: '12 Signs', icon: '♈', desc: '什麼能量主導這個問題？' },
    { id: 'op4', zh: '三十六旬', en: '36 Decans', icon: '🔮', desc: '精確到十度的能量聚焦' },
    { id: 'op5', zh: '生命之樹', en: 'Tree of Life', icon: '🌳', desc: '靈性層面的最終答案' }
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
      '@media(prefers-reduced-motion:reduce){.ootk-kc-flip,.ootk-kc-inner{animation:none!important;opacity:1;transform:none}.ootk-hcell,.ootk-znode,.ootk-seph{transition:none;opacity:1;transform:none}}'
    ].join('\n');
    document.head.appendChild(s);
  }

  // ── Significator 選擇畫面 ──
  function _showSignificatorSelection(onSelect) {
    _injectOOTKStyles();
    var overlay = document.createElement('div');
    overlay.className = 'ootk-overlay';
    overlay.id = 'ootk-sig-overlay';

    // 自動推薦
    var form = S.form || {};
    var bdate = form.bdate || '';
    var parts = bdate.split('-');
    var bMonth = parts[1] ? parseInt(parts[1]) : 1;
    var bDay = parts[2] ? parseInt(parts[2]) : 15;
    var gender = form.gender || '';
    var birthYear = parts[0] ? parseInt(parts[0]) : 1990;
    var age = new Date().getFullYear() - birthYear;

    var auto = window.ootkAutoSignificator ? window.ootkAutoSignificator(bMonth, bDay, gender, age) : null;
    var autoCard = auto ? auto.card : null;
    var autoId = autoCard ? autoCard.id : -1;

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

    // 自動推薦
    if (autoCard) {
      var imgSrc = (typeof getTarotCardImage === 'function') ? getTarotCardImage(autoCard) : '';
      html += '<div style="padding:.8rem;border-radius:12px;border:1px solid rgba(201,168,76,.25);background:rgba(201,168,76,.05);margin-bottom:1rem">';
      html += '<div style="font-size:.75rem;color:var(--c-gold);margin-bottom:.5rem">根據你的星座（' + (auto.sign || '') + '・' + (auto.element || '') + '元素），系統推薦：</div>';
      html += '<div style="display:flex;align-items:center;justify-content:center;gap:.8rem">';
      if (imgSrc) html += '<img id="ootk-selected-img" src="' + imgSrc + '" style="width:64px;height:102px;border-radius:6px;object-fit:cover;border:1px solid rgba(255,255,255,.1)">';
      html += '<div style="text-align:left">';
      html += '<div id="ootk-selected-name" style="font-size:.95rem;font-weight:700;color:var(--c-gold-pale,#f5e6b8)">' + (autoCard.n || '') + '</div>';
      html += '<div style="font-size:.72rem;color:var(--c-text-dim);margin-top:.2rem">' + (auto.element || '') + '元素宮廷牌</div>';
      html += '</div></div>';
      html += '<button id="ootk-use-auto" style="margin-top:.6rem;padding:.5rem 1.5rem;border-radius:20px;background:transparent;border:1px solid rgba(255,255,255,.1);color:var(--c-gold);font-weight:700;font-size:.85rem;cursor:pointer;font-family:inherit">用這張，開始占卜</button>';
      html += '</div>';
    }

    // 手動選擇
    html += '<div style="font-size:.75rem;color:var(--c-text-muted);margin-bottom:.6rem">或直接選擇代表你的宮廷牌：</div>';
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
  function _runOOTKSequence(significatorId) {
    _injectOOTKStyles();

    // 跑五階段計算
    var results = null;
    try {
      results = window.ootkRunFull ? window.ootkRunFull(significatorId) : null;
    } catch(e) { console.error('[OOTK] runFull error:', e); alert('OOTK 計算引擎錯誤：' + e.message); return; }
    if (!results) { alert('OOTK 引擎未載入'); return; }

    // ── 欄位別名（新引擎 → 渲染器）──
    if (results.op3) results.op3.rulingMajor = results.op3.signTrump || '';
    if (results.op4) results.op4.decanRuler = results.op4.decanPlanet || '';

    // 儲存到 S.tarot
    S.tarot = S.tarot || {};
    S.tarot.ootkResults = results;
    S.tarot.spreadType = 'ootk';
    S.tarot.spreadDef = { id: 'ootk', zh: '開鑰之法' };

    // 建立全螢幕展示 overlay
    var overlay = document.createElement('div');
    overlay.className = 'ootk-overlay';
    overlay.id = 'ootk-sequence-overlay';
    overlay.style.justifyContent = 'flex-start';
    overlay.style.paddingTop = '1.2rem';

    var html = '';
    html += '<div style="text-align:center;max-width:480px;width:100%;margin:0 auto">';

    // 頂部標題
    html += '<div style="font-size:.85rem;color:var(--c-gold);font-weight:700;margin-bottom:.2rem">✦ 開鑰之法 ✦</div>';

    // 進度點
    html += '<div class="ootk-progress" id="ootk-dots">';
    for (var d = 0; d < 5; d++) html += '<div class="ootk-dot" data-idx="' + d + '"></div>';
    html += '</div>';

    // 五個階段的內容區
    html += '<div id="ootk-phases"></div>';

    // 底部按鈕
    html += '<div id="ootk-actions" style="margin-top:1rem;display:flex;gap:.5rem;justify-content:center">';
    html += '<button id="ootk-next" style="padding:.55rem 1.5rem;border-radius:20px;background:transparent;border:1px solid rgba(255,255,255,.1);color:var(--c-gold);font-weight:700;font-size:.85rem;cursor:pointer;font-family:inherit">開始第一階段 →</button>';
    html += '</div>';

    html += '</div>';
    overlay.innerHTML = html;
    document.body.appendChild(overlay);

    // 階段展示邏輯
    var currentPhase = -1;
    var phasesEl = document.getElementById('ootk-phases');
    var nextBtn = document.getElementById('ootk-next');
    var _advanceLock = false; // ★ v27：防重複點擊

    function advancePhase() {
      if (_advanceLock) return;
      _advanceLock = true;
      try {
      currentPhase++;
      if (currentPhase >= 5) {
        _advanceLock = false;
        // 所有階段完成 → 顯示 AI 分析按鈕
        nextBtn.textContent = '🌙 靜月為你解讀全部五階段';
        nextBtn.onclick = function() {
          overlay.remove();
          if (typeof goStep === 'function') goStep('step-tarot');
          _triggerOOTKAI(results);
        };
        // 更新所有 dots
        document.querySelectorAll('#ootk-dots .ootk-dot').forEach(function(dot) { dot.className = 'ootk-dot done'; });
        return;
      }

      // 更新 dots
      document.querySelectorAll('#ootk-dots .ootk-dot').forEach(function(dot, idx) {
        if (idx < currentPhase) dot.className = 'ootk-dot done';
        else if (idx === currentPhase) dot.className = 'ootk-dot current';
        else dot.className = 'ootk-dot';
      });

      // ★ P0-3：分堆動畫（第一階段78牌飛入四堆，其餘用升級過渡）
      var _ritualMsgs = [
        '將 78 張牌分入四個元素堆…',
        '按照你的代表牌，展開十二宮位…',
        '牌面落入黃道十二星座…',
        '聚焦到三十六旬的精確位置…',
        '最後一層——生命之樹…'
      ];
      nextBtn.style.opacity = '0.3';
      nextBtn.style.pointerEvents = 'none';

      function _showPhaseContent() {
        _advanceLock = false; // ★ 動畫完成才解鎖
        var opData = results['op' + (currentPhase + 1)];
        var label = OP_LABELS[currentPhase];
        var phaseDiv = document.createElement('div');
        phaseDiv.className = 'ootk-phase';
        phaseDiv.innerHTML = _renderPhase(currentPhase, label, opData, results);
        phasesEl.appendChild(phaseDiv);
        requestAnimationFrame(function() { requestAnimationFrame(function() { phaseDiv.classList.add('visible'); }); });
        setTimeout(function() { phaseDiv.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 300);
        nextBtn.style.opacity = '1';
        nextBtn.style.pointerEvents = 'auto';
        if (currentPhase < 4) { nextBtn.textContent = OP_LABELS[currentPhase + 1].zh + ' →'; }
        else {
          nextBtn.textContent = '🌙 靜月為你解讀全部五階段';
          nextBtn.onclick = function() { overlay.remove(); if (typeof goStep === 'function') goStep('step-tarot'); _triggerOOTKAI(results); };
          document.querySelectorAll('#ootk-dots .ootk-dot').forEach(function(dot) { dot.className = 'ootk-dot done'; });
        }
      }

      if (currentPhase === 0) {
        // ── 第一階段：78牌飛入四堆動畫 ──
        var pileScene = document.createElement('div');
        pileScene.style.cssText = 'opacity:0;transition:opacity .4s';
        var sceneHTML = '<div class="ootk-pile-scene">';
        sceneHTML += '<div class="ootk-pile-deck" id="ootk-deck">';
        for (var dc = 0; dc < 6; dc++) sceneHTML += '<div class="ootk-pile-deck-card" style="top:' + (dc * -1.5) + 'px;left:' + (dc * 0.5) + 'px"></div>';
        sceneHTML += '<div class="ootk-pile-count" id="ootk-deck-count">78</div></div>';
        var elSlots = [{el:'fire',label:'🜂 火'},{el:'water',label:'🜄 水'},{el:'air',label:'🜁 風'},{el:'earth',label:'🜃 土'}];
        elSlots.forEach(function(s) {
          sceneHTML += '<div class="ootk-pile-slot" data-el="' + s.el + '"><div class="ootk-pile-slot-stack" id="pile-stack-' + s.el + '"></div><div class="ootk-pile-slot-label">' + s.label + ' <span id="pile-count-' + s.el + '">0</span></div></div>';
        });
        sceneHTML += '</div><div style="text-align:center;font-size:.82rem;color:var(--c-gold);font-weight:600;margin-top:.6rem">' + _ritualMsgs[0] + '</div>';
        pileScene.innerHTML = sceneHTML;
        phasesEl.appendChild(pileScene);
        requestAnimationFrame(function() { pileScene.style.opacity = '1'; });

        var _pileCounts = {fire:0,water:0,air:0,earth:0}, _totalFlown = 0;
        var _elKeys = ['fire','water','air','earth'];
        var _realDist = [];
        for (var _rd = 0; _rd < 22; _rd++) _realDist.push('fire');
        for (var _rd2 = 0; _rd2 < 14; _rd2++) { _realDist.push('fire'); _realDist.push('water'); _realDist.push('air'); _realDist.push('earth'); }
        for (var _sh = _realDist.length - 1; _sh > 0; _sh--) { var _sj = Math.floor(Math.random() * (_sh + 1)); var _tmp = _realDist[_sh]; _realDist[_sh] = _realDist[_sj]; _realDist[_sj] = _tmp; }
        var _scene = pileScene.querySelector('.ootk-pile-scene');
        var _deck = pileScene.querySelector('#ootk-deck');

        function _flyOne() {
          if (_totalFlown >= 78) {
            setTimeout(function() { pileScene.style.opacity = '0'; setTimeout(function() { pileScene.remove(); _showPhaseContent(); }, 400); }, 600);
            return;
          }
          var targetEl = _realDist[_totalFlown] || _elKeys[_totalFlown % 4];
          _pileCounts[targetEl]++; _totalFlown++;
          var deckCount = pileScene.querySelector('#ootk-deck-count');
          if (deckCount) deckCount.textContent = String(78 - _totalFlown);
          var pileCount = pileScene.querySelector('#pile-count-' + targetEl);
          if (pileCount) pileCount.textContent = String(_pileCounts[targetEl]);
          var flyCard = document.createElement('div');
          flyCard.className = 'ootk-fly-card';
          var deckRect = _deck ? _deck.getBoundingClientRect() : {left:0,top:0};
          var sceneRect = _scene ? _scene.getBoundingClientRect() : {left:0,top:0};
          flyCard.style.left = (deckRect.left - sceneRect.left + 10) + 'px';
          flyCard.style.top = (deckRect.top - sceneRect.top) + 'px';
          _scene.appendChild(flyCard);
          var targetSlot = pileScene.querySelector('.ootk-pile-slot[data-el="' + targetEl + '"]');
          if (targetSlot) {
            var slotRect = targetSlot.getBoundingClientRect();
            var stackH = Math.min(_pileCounts[targetEl] * 1.5, 30);
            requestAnimationFrame(function() {
              flyCard.style.left = (slotRect.left - sceneRect.left + 12) + 'px';
              flyCard.style.top = (slotRect.top - sceneRect.top + 40 - stackH) + 'px';
              flyCard.style.transform = 'rotate(' + (Math.random() * 6 - 3) + 'deg)';
            });
          }
          setTimeout(function() { flyCard.classList.add('landed'); }, 500);
          var delay = _totalFlown < 10 ? 80 : _totalFlown < 30 ? 45 : _totalFlown < 60 ? 25 : 15;
          setTimeout(_flyOne, delay);
        }
        setTimeout(_flyOne, 500);

      } else {
      // ── Op2-5：各自的儀式場景動畫 ──
      if (currentPhase === 1) {
        // ═══ Op2：十二宮位 網格逐一亮起 ═══
        var houseScene = document.createElement('div');
        houseScene.style.cssText = 'opacity:0;transition:opacity .4s;text-align:center;padding:1rem';
        var hDist = results.op2.houseDistribution || [];
        var hActive = (results.op2.activeHouse || 1) - 1;
        var hHtml = '<div style="font-size:.82rem;color:rgba(96,165,250,.8);font-weight:600;margin-bottom:.7rem">' + _ritualMsgs[1] + '</div>';
        hHtml += '<div class="ootk-house-grid">';
        var HOUSE_SHORT = ['一宮','二宮','三宮','四宮','五宮','六宮','七宮','八宮','九宮','十宮','十一','十二'];
        for (var _hi = 0; _hi < 12; _hi++) {
          hHtml += '<div class="ootk-hcell" data-idx="' + _hi + '" style="animation-delay:' + (_hi * 80) + 'ms">';
          hHtml += '<div style="font-size:.65rem;font-weight:600">' + HOUSE_SHORT[_hi] + '</div>';
          hHtml += '<div style="font-size:.55rem;margin-top:2px;opacity:.5">' + (hDist[_hi] || 0) + '牌</div>';
          hHtml += '</div>';
        }
        hHtml += '</div>';
        houseScene.innerHTML = hHtml;
        phasesEl.appendChild(houseScene);
        requestAnimationFrame(function() { houseScene.style.opacity = '1'; });

        // 逐格亮起
        var hCells = houseScene.querySelectorAll('.ootk-hcell');
        var _hIdx = 0;
        function _lightHouse() {
          if (_hIdx >= 12) {
            // 全亮後，活躍宮位脈衝
            setTimeout(function() {
              hCells.forEach(function(c) { if (parseInt(c.dataset.idx) !== hActive) { c.style.opacity = '.35'; c.style.transform = 'scale(.9)'; } });
              hCells[hActive].classList.add('active');
              hCells[hActive].style.animation = 'ootkHousePulse 1.2s ease-in-out 2';
              setTimeout(function() {
                houseScene.style.opacity = '0';
                setTimeout(function() { houseScene.remove(); _showPhaseContent(); }, 400);
              }, 1800);
            }, 300);
            return;
          }
          hCells[_hIdx].classList.add('show');
          _hIdx++;
          setTimeout(_lightHouse, 80);
        }
        setTimeout(_lightHouse, 300);

      } else if (currentPhase === 2) {
        // ═══ Op3：十二星座 環形排列 + 光掃 ═══
        var SIGN_ICONS = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];
        var activeSignIdx = -1;
        var SIGNS_ORD = ['牡羊','金牛','雙子','巨蟹','獅子','處女','天秤','天蠍','射手','摩羯','水瓶','雙魚'];
        for (var _si = 0; _si < 12; _si++) { if (SIGNS_ORD[_si] === results.op3.activeSign) { activeSignIdx = _si; break; } }

        var zodScene = document.createElement('div');
        zodScene.style.cssText = 'opacity:0;transition:opacity .4s;text-align:center;padding:.5rem 1rem';
        var zHtml = '<div style="font-size:.82rem;color:rgba(168,85,247,.8);font-weight:600;margin-bottom:.5rem">' + _ritualMsgs[2] + '</div>';
        zHtml += '<div class="ootk-zodiac-ring">';
        // 12 nodes on a circle
        var _ringR = 90;
        for (var _zi = 0; _zi < 12; _zi++) {
          var _angle = (_zi * 30 - 90) * Math.PI / 180;
          var _cx = 110 + _ringR * Math.cos(_angle) - 18;
          var _cy = 110 + _ringR * Math.sin(_angle) - 18;
          zHtml += '<div class="ootk-znode" data-idx="' + _zi + '" style="left:' + _cx + 'px;top:' + _cy + 'px">' + SIGN_ICONS[_zi] + '</div>';
        }
        // Sweep dot
        zHtml += '<div class="ootk-zsweep" id="ootk-zsweep"></div>';
        zHtml += '</div>';
        zodScene.innerHTML = zHtml;
        phasesEl.appendChild(zodScene);
        requestAnimationFrame(function() { zodScene.style.opacity = '1'; });

        // 逐個出現
        var zNodes = zodScene.querySelectorAll('.ootk-znode');
        var _zIdx = 0;
        function _showSign() {
          if (_zIdx >= 12) {
            // 光點掃過
            var sweep = zodScene.querySelector('#ootk-zsweep');
            if (sweep) sweep.style.opacity = '1';
            var _sweepIdx = 0;
            function _sweep() {
              if (_sweepIdx > activeSignIdx) {
                if (sweep) sweep.style.opacity = '0';
                zNodes[activeSignIdx].classList.add('active');
                // 其他淡出
                zNodes.forEach(function(n, i) { if (i !== activeSignIdx) { n.style.opacity = '.3'; } });
                setTimeout(function() {
                  zodScene.style.opacity = '0';
                  setTimeout(function() { zodScene.remove(); _showPhaseContent(); }, 400);
                }, 1600);
                return;
              }
              var _sAngle = (_sweepIdx * 30 - 90) * Math.PI / 180;
              var _sx = 110 + _ringR * Math.cos(_sAngle) - 4;
              var _sy = 110 + _ringR * Math.sin(_sAngle) - 4;
              sweep.style.left = _sx + 'px';
              sweep.style.top = _sy + 'px';
              zNodes[_sweepIdx].style.borderColor = 'rgba(168,85,247,.4)';
              zNodes[_sweepIdx].style.color = 'rgba(168,85,247,.8)';
              _sweepIdx++;
              setTimeout(_sweep, 120);
            }
            setTimeout(_sweep, 200);
            return;
          }
          zNodes[_zIdx].classList.add('show');
          _zIdx++;
          setTimeout(_showSign, 60);
        }
        setTimeout(_showSign, 300);

      } else if (currentPhase === 3) {
        // ═══ Op4：三十六旬 三層聚焦 ═══
        var focusScene = document.createElement('div');
        focusScene.style.cssText = 'opacity:0;transition:opacity .4s;text-align:center;padding:1rem';
        var fHtml = '<div style="font-size:.82rem;color:rgba(234,179,8,.8);font-weight:600;margin-bottom:.7rem">' + _ritualMsgs[3] + '</div>';
        fHtml += '<div class="ootk-focus-ring" id="ootk-focus">';
        fHtml += '<div class="ootk-focus-text" id="ootk-focus-txt" style="font-size:.75rem">78 張牌</div>';
        fHtml += '</div>';
        focusScene.innerHTML = fHtml;
        phasesEl.appendChild(focusScene);
        requestAnimationFrame(function() { focusScene.style.opacity = '1'; });

        var _focusRing = focusScene.querySelector('#ootk-focus');
        var _focusTxt = focusScene.querySelector('#ootk-focus-txt');
        // Phase 1: narrow → sign
        setTimeout(function() {
          _focusRing.classList.add('narrow');
          _focusTxt.innerHTML = '<div style="font-size:1.1rem;margin-bottom:.2rem">🔮</div>' + (results.op4.decanSign || '?');
          _focusTxt.style.fontSize = '.85rem';
          _focusTxt.style.fontWeight = '600';
        }, 600);
        // Phase 2: tight → decan range
        setTimeout(function() {
          _focusRing.classList.remove('narrow');
          _focusRing.classList.add('tight');
          _focusTxt.innerHTML = '<div style="font-size:.65rem;opacity:.6">' + (results.op4.decanSign || '') + '</div>' +
            '<div style="font-size:.72rem;font-weight:700;color:rgba(234,179,8,1)">' + (results.op4.decanRange || '') + '</div>' +
            (results.op4.decanPlanet ? '<div style="font-size:.6rem;margin-top:2px;opacity:.7">' + results.op4.decanPlanet + '</div>' : '');
        }, 1500);
        // Fade out → content
        setTimeout(function() {
          focusScene.style.opacity = '0';
          setTimeout(function() { focusScene.remove(); _showPhaseContent(); }, 400);
        }, 2800);

      } else if (currentPhase === 4) {
        // ═══ Op5：生命之樹 能量上升 ═══
        var treeScene = document.createElement('div');
        treeScene.style.cssText = 'opacity:0;transition:opacity .4s;text-align:center;padding:.5rem 1rem';
        var tHtml = '<div style="font-size:.82rem;color:rgba(34,197,94,.8);font-weight:600;margin-bottom:.5rem">' + _ritualMsgs[4] + '</div>';
        tHtml += '<div class="ootk-tree">';
        // Sephirot positions (relative to 200×280 container)
        var SEPH_POS = [
          {x:84,y:8},    // 0 Kether
          {x:140,y:52},  // 1 Chokmah
          {x:28,y:52},   // 2 Binah
          {x:140,y:110}, // 3 Chesed
          {x:28,y:110},  // 4 Geburah
          {x:84,y:140},  // 5 Tiphereth
          {x:140,y:180}, // 6 Netzach
          {x:28,y:180},  // 7 Hod
          {x:84,y:218},  // 8 Yesod
          {x:84,y:256}   // 9 Malkuth
        ];
        var SEPH_SHORT = ['K','Ch','Bi','Cs','Gb','Ti','Nz','Hd','Ys','Mk'];
        // Lines (paths between sephirot)
        var TREE_LINES = [[0,1],[0,2],[0,5],[1,2],[1,3],[1,5],[2,4],[2,5],[3,4],[3,5],[3,6],[4,5],[4,7],[5,6],[5,7],[5,8],[6,7],[6,8],[7,8],[8,9]];
        TREE_LINES.forEach(function(ln) {
          var a = SEPH_POS[ln[0]], b = SEPH_POS[ln[1]];
          var dx = b.x - a.x, dy = b.y - a.y;
          var len = Math.sqrt(dx*dx + dy*dy);
          var angle = Math.atan2(dy, dx) * 180 / Math.PI;
          tHtml += '<div class="ootk-tree-line" data-from="' + ln[0] + '" data-to="' + ln[1] + '" style="left:' + (a.x + 16) + 'px;top:' + (a.y + 16) + 'px;width:' + len + 'px;height:1.5px;transform-origin:0 50%;transform:rotate(' + angle + 'deg)"></div>';
        });
        // Sephirot nodes
        for (var _ti = 0; _ti < 10; _ti++) {
          tHtml += '<div class="ootk-seph" data-idx="' + _ti + '" style="left:' + SEPH_POS[_ti].x + 'px;top:' + SEPH_POS[_ti].y + 'px">' + SEPH_SHORT[_ti] + '</div>';
        }
        tHtml += '</div>';
        treeScene.innerHTML = tHtml;
        phasesEl.appendChild(treeScene);
        requestAnimationFrame(function() { treeScene.style.opacity = '1'; });

        // Find active sephirah index
        var SEPH_NAMES = ['Kether','Chokmah','Binah','Chesed','Geburah','Tiphereth','Netzach','Hod','Yesod','Malkuth'];
        var _activeSIdx = SEPH_NAMES.indexOf(results.op5.activeSephirah);
        if (_activeSIdx < 0) _activeSIdx = 9;

        // Light path from Malkuth (9) up to active sephirah
        // Simple: light from bottom to top
        var _lightOrder = [9,8,7,6,5,4,3,2,1,0];
        var tSephs = treeScene.querySelectorAll('.ootk-seph');
        var tLines = treeScene.querySelectorAll('.ootk-tree-line');
        var _lIdx = 0;
        function _lightSeph() {
          if (_lIdx >= _lightOrder.length) {
            // All lit, highlight active
            setTimeout(function() {
              tSephs.forEach(function(s) {
                var si = parseInt(s.dataset.idx);
                if (si !== _activeSIdx) { s.style.opacity = '.3'; s.classList.remove('lit'); }
              });
              tLines.forEach(function(l) { l.style.opacity = '.3'; });
              tSephs[_activeSIdx].classList.add('active');
              setTimeout(function() {
                treeScene.style.opacity = '0';
                setTimeout(function() { treeScene.remove(); _showPhaseContent(); }, 400);
              }, 1600);
            }, 300);
            return;
          }
          var sIdx = _lightOrder[_lIdx];
          tSephs[sIdx].classList.add('lit');
          // Light connected lines
          tLines.forEach(function(l) {
            var f = parseInt(l.dataset.from), t = parseInt(l.dataset.to);
            if (f === sIdx || t === sIdx) l.classList.add('lit');
          });
          _lIdx++;
          // Stop early if we've passed the active
          if (_lightOrder[_lIdx - 1] === _activeSIdx && _lIdx > 1) {
            tSephs[_activeSIdx].classList.remove('lit');
            tSephs[_activeSIdx].classList.add('active');
            tSephs.forEach(function(s) {
              var si = parseInt(s.dataset.idx);
              if (si !== _activeSIdx && !s.classList.contains('lit')) s.style.opacity = '.15';
            });
            setTimeout(function() {
              treeScene.style.opacity = '0';
              setTimeout(function() { treeScene.remove(); _showPhaseContent(); }, 400);
            }, 1600);
            return;
          }
          setTimeout(_lightSeph, 160);
        }
        setTimeout(_lightSeph, 400);

      } else {
        // fallback（不應該到這）
        _showPhaseContent();
      }

      } // end else (non-Op1)

      } catch(err) { _advanceLock = false; console.error('[OOTK advancePhase] Error:', err); alert('階段載入失敗：' + err.message); }
    }

    nextBtn.addEventListener('click', advancePhase);
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

    if (phaseIdx === 0) h += _renderOp1(opData);
    else if (phaseIdx === 1) h += _renderOp2(opData);
    else if (phaseIdx === 2) h += _renderOp3(opData);
    else if (phaseIdx === 3) h += _renderOp4(opData);
    else if (phaseIdx === 4) h += _renderOp5(opData, allResults);

    h += '</div>';
    return h;
  }

  // ── Op1 四元素 ──
  function _renderOp1(op) {
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

    h += _renderKeyCards(op.keyCards);
    return h;
  }

  // ── Op2 十二宮 ──
  function _renderOp2(op) {
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
    h += _renderKeyCards(op.keyCards);
    return h;
  }

  // ── Op3 十二星座 ──
  function _renderOp3(op) {
    var h = '';
    h += '<div style="padding:.6rem;border-radius:10px;background:rgba(168,85,247,.06);border:1px solid rgba(168,85,247,.12)">';
    h += '<div style="font-size:.88rem;color:rgba(168,85,247,.9);font-weight:700">代表牌落在 ' + (op.activeSign || '?') + '</div>';
    if (op.rulingMajor) {
      h += '<div style="font-size:.78rem;color:var(--c-text-dim);margin-top:.25rem;line-height:1.6">主牌：' + (op.rulingMajor || '') + '</div>';
    }
    h += '</div>';
    h += _renderKeyCards(op.keyCards);
    return h;
  }

  // ── Op4 三十六旬 ──
  function _renderOp4(op) {
    var h = '';
    h += '<div style="padding:.6rem;border-radius:10px;background:rgba(234,179,8,.06);border:1px solid rgba(234,179,8,.12)">';
    h += '<div style="font-size:.88rem;color:rgba(234,179,8,.9);font-weight:700">' + (op.decanSign || '') + ' ' + (op.decanRange || '') + '</div>';
    if (op.decanRuler) {
      h += '<div style="font-size:.78rem;color:var(--c-text-dim);margin-top:.25rem;line-height:1.6">旬主：' + op.decanRuler + '</div>';
    }
    h += '</div>';
    h += _renderKeyCards(op.keyCards);
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
    h += _renderKeyCards(op.keyCards);

    // 跨階段分析
    if (allResults && allResults.crossAnalysis) {
      var ca = allResults.crossAnalysis;
      h += '<div style="margin-top:.6rem;padding:.7rem;border-radius:10px;border:1px solid rgba(212,175,55,.15);background:linear-gradient(135deg,rgba(212,175,55,.04),rgba(34,197,94,.03))">';
      h += '<div style="font-size:.82rem;font-weight:700;color:var(--c-gold);margin-bottom:.35rem">🔗 五階段能量流動</div>';
      h += '<div style="font-size:.75rem;color:var(--c-text-dim);line-height:1.75">' + (ca.elementProgression || '') + '</div>';
      if (ca.recurringCards && ca.recurringCards.length) {
        h += '<div style="margin-top:.35rem;font-size:.75rem;color:var(--c-gold-pale,#f5e6b8)">🔄 重複出現的牌：' + ca.recurringCards.join('、') + '</div>';
      }
      h += '</div>';
    }
    return h;
  }

  // ── 關鍵牌列表（帶牌面圖）──
  function _renderKeyCards(keyCards) {
    if (!keyCards || !keyCards.length) return '';
    var h = '<div class="ootk-keycards-strip">';
    keyCards.slice(0, 8).forEach(function(kc, idx) {
      var c = kc.card || {};
      var name = c.n || c.name || '';
      var imgSrc = (typeof getTarotCardImage === 'function' && c.id != null) ? getTarotCardImage(c) : '';
      var dignity = kc.dignity || '';
      var dColor = dignity === 'strengthen' ? 'rgba(34,197,94,.5)' : dignity === 'weaken' ? 'rgba(239,68,68,.5)' : 'rgba(201,168,76,.3)';
      var delay = idx * 200;
      h += '<div class="ootk-kc-flip" style="animation-delay:' + delay + 'ms">';
      h += '<div class="ootk-kc-inner" style="animation-delay:' + (delay + 100) + 'ms">';
      // Front (actual card)
      if (imgSrc) {
        h += '<div class="ootk-kc-front"><img src="' + imgSrc + '" style="width:52px;height:78px;border-radius:5px;object-fit:cover;border:2px solid ' + dColor + ';box-shadow:0 2px 8px rgba(0,0,0,.4)"></div>';
      } else {
        h += '<div class="ootk-kc-front" style="display:flex;align-items:center;justify-content:center;font-size:.65rem;color:var(--c-gold);border-radius:5px;border:2px solid ' + dColor + ';background:rgba(201,168,76,.08)">' + name.charAt(0) + '</div>';
      }
      // Back (card back)
      h += '<div class="ootk-kc-back"></div>';
      h += '</div>';
      h += '<div style="font-size:.52rem;color:var(--c-gold);margin-top:.25rem;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:58px">' + name + '</div>';
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
              '<div style="font-size:.64rem;color:var(--c-text-dim);line-height:1.55">每日免費 1 次<br>五層深潛解讀<br>速度快・適合日常</div>' +
            '</button>' +
            '<button onclick="if(typeof _handleOpusClickForMode===\'function\')_handleOpusClickForMode(\'ootk\')" style="flex:1;max-width:175px;padding:.7rem .55rem;border-radius:12px;background:linear-gradient(135deg,rgba(147,51,234,.08),rgba(212,175,55,.04));border:1.5px solid rgba(147,51,234,.3);color:#c084fc;cursor:pointer;font-family:inherit;text-align:left">' +
              '<div style="font-size:.88rem;font-weight:700;margin-bottom:.25rem">🔮 Opus 深度解析</div>' +
              '<div style="font-size:.64rem;color:var(--c-text-dim);line-height:1.55">最強推理模型<br>五層鑰匙交叉驗證<br>根源挖掘更精準</div>' +
            '</button>' +
          '</div>' +
          '<div style="font-size:.58rem;color:var(--c-text-dim);opacity:.5">' +
            (admin ? '🔧 管理員・無限使用' : '會員每月免費 4 次 ・ 單次 NT$49') +
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
    if (!_ootkSnippets.length) _ootkSnippets = ['正在解讀你的五階段牌象…'];

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

    var phases = ['讀取四元素分堆…','對照十二宮位…','解讀星座能量…','聚焦三十六旬…','攀上生命之樹…','交叉比對五階段…','整理最終答案…'];
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
            if (evtType === 'result' && evtData) { try { var parsed = JSON.parse(evtData); r = parsed.result || parsed; } catch(_){} }
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

      // ★ v27：標記 OOTK 完成 + 刷新導航
      try {
        window._jyResultModes = window._jyResultModes || {};
        window._jyResultModes.ootk = true;
        if (typeof _refreshAllNavs === 'function') _refreshAllNavs('ootk');
      } catch(_ne) {}

      // ★ v27：顯示回饋區
      try { if (typeof showFeedbackSection === 'function') setTimeout(showFeedbackSection, 3000); } catch(_fe) {}

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
      } else if (err.code === 'OOTK_PAYMENT_REQUIRED' || (err.status === 429 && !window._JY_ADMIN_TOKEN)) {
        // 需要付費 → 彈付費牆
        if (typeof _jyStartPayment === 'function') {
          _jyStartPayment('ootk');
        }
        wrap.innerHTML = '<div style="text-align:center;padding:1.5rem">' +
          '<div style="font-size:2rem;margin-bottom:.5rem">🔑</div>' +
          '<div style="font-size:.9rem;color:var(--c-gold);font-weight:700;margin-bottom:.3rem">開鑰之法需付費解鎖</div>' +
          '<div style="font-size:.8rem;color:var(--c-text-dim);margin-bottom:.8rem">NT$15 · 五階段深度占卜</div>' +
          '<button onclick="_jyStartOOTK()" style="padding:.6rem 1.2rem;border-radius:10px;background:transparent;color:var(--c-gold);border:1px solid rgba(255,255,255,.1);font-size:.85rem;font-weight:600;cursor:pointer;font-family:inherit">🔑 付費解鎖</button></div>';
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
