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

// ── 所有牌陣定義 ──
var SPREAD_DEFS = {
  three_card: {
    id: 'three_card', zh: '三牌陣（過去-現在-未來）', count: 3,
    desc: '快速直覺，適合是非題',
    positions: [
      { name: '過去', zh: '影響你走到這裡的因素' },
      { name: '現在', zh: '你正在經歷的核心能量' },
      { name: '未來', zh: '如果保持現狀的走向' }
    ]
  },
  either_or: {
    id: 'either_or', zh: '二選一牌陣', count: 5,
    desc: '面對抉擇時，看清兩條路',
    positions: [
      { name: '你', zh: '你目前的狀態與核心需求' },
      { name: 'A 選項', zh: '選 A 的能量與發展' },
      { name: 'B 選項', zh: '選 B 的能量與發展' },
      { name: 'A 結果', zh: '走 A 路的最終走向' },
      { name: 'B 結果', zh: '走 B 路的最終走向' }
    ]
  },
  relationship: {
    id: 'relationship', zh: '關係牌陣', count: 6,
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
  horseshoe: {
    id: 'horseshoe', zh: '馬蹄形牌陣', count: 7,
    desc: '全面解析，平衡深度與廣度',
    positions: [
      { name: '過去', zh: '過去的影響' },
      { name: '現在', zh: '目前的處境' },
      { name: '隱藏影響', zh: '你可能忽略的因素' },
      { name: '環境', zh: '周圍人的影響' },
      { name: '態度', zh: '你應採取的態度' },
      { name: '行動', zh: '建議的具體行動' },
      { name: '結果', zh: '最可能的結果' }
    ]
  },
  timeline: {
    id: 'timeline', zh: '時間線牌陣', count: 5,
    desc: '回答「什麼時候」「要多久」',
    positions: [
      { name: '過去根源', zh: '事情的源頭在哪裡' },
      { name: '近期狀態', zh: '目前正在發生什麼' },
      { name: '轉折點', zh: '什麼會觸發改變' },
      { name: '發展', zh: '轉折之後的走勢' },
      { name: '最終結果', zh: '事情最終會怎樣' }
    ]
  },
  celtic_cross: {
    id: 'celtic_cross', zh: '凱爾特十字牌陣', count: 10,
    desc: '最完整的深度解析',
    positions: [
      { name: '現況核心', zh: '現在的核心狀態' },
      { name: '阻礙', zh: '正在阻擋你的力量' },
      { name: '根因', zh: '底層動機或根源' },
      { name: '近期過去', zh: '最近發生的相關事件' },
      { name: '顯性目標', zh: '你意識層面的期望' },
      { name: '近期走向', zh: '短期內的發展方向' },
      { name: '你的位置', zh: '你在情境中的角色' },
      { name: '外界環境', zh: '外在人事的影響' },
      { name: '希望與恐懼', zh: '你最深層的期待和擔心' },
      { name: '最終結果', zh: '事情的最終走向' }
    ]
  }
};

// ── 問題性質偵測 → 牌陣匹配 ──
function detectSpreadType(question, type) {
  var q = (question || '').trim();

  // 1. 是非題 → 三牌陣
  if (/^(會不會|有沒有|該不該|可不可以|能不能|是不是|適不適合|好不好|值不值)/.test(q) ||
      /嗎[？?]?\s*$/.test(q) && q.length < 30) {
    return 'three_card';
  }

  // 2. 二選一 → 二選一牌陣
  if (/還是|或者|A.*B|選.*哪|二選一|兩個.*選/.test(q)) {
    return 'either_or';
  }

  // 3. 時機題 → 時間線牌陣
  if (/什麼時候|幾時|多久|何時|哪一年|哪個月|幾月|時間點|來得及/.test(q)) {
    return 'timeline';
  }

  // 4. 關係題（感情類 + 特定關鍵字）→ 關係牌陣
  if (type === 'love' || type === 'relationship' || type === 'family') {
    if (/他|她|對方|另一半|前任|現任|老公|老婆|男友|女友|伴侶|喜歡的人|曖昧|之間|怎麼想|心裡|真心/.test(q)) {
      return 'relationship';
    }
  }

  // 5. 深度開放題（長問句、無明確指向）→ 凱爾特十字
  if (q.length > 40 || /整體|全面|深入|詳細|大方向/.test(q)) {
    return 'celtic_cross';
  }

  // 6. 預設：根據問題類型
  var typeDefault = {
    love: 'relationship',
    career: 'horseshoe',
    wealth: 'horseshoe',
    health: 'horseshoe',
    relationship: 'relationship',
    family: 'relationship',
    general: 'horseshoe'
  };
  return typeDefault[type] || 'horseshoe';
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
function setCurrentSpread(id) { if (SPREAD_DEFS[id]) _currentSpreadId = id; }
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
      var elColor = {'火':'#ef4444','水':'#3b82f6','風':'#22d3ee','土':'#a78b5a','水星':'#8b5cf6','金星':'#f472b6','木星':'#38bdf8','土星':'#475569','月亮':'#a3e635','太陽':'#fbbf24'}[c.el] || 'var(--c-gold)';

      cardsHtml += '<div class="card" style="padding:.8rem;margin-bottom:.5rem;border-left:3px solid ' + elColor + '">';

      // 頂部：位置 + 正逆位
      cardsHtml += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.4rem">';
      cardsHtml += '<span class="tag tag-gold" style="font-size:.75rem">' + (i + 1) + '. ' + posName + '</span>';
      cardsHtml += '<span class="tag ' + (c.isUp ? 'tag-blue' : 'tag-red') + '" style="font-size:.7rem">' + (c.isUp ? '正位' : '逆位') + '</span>';
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
        cardsHtml += '<p style="font-size:.8rem;color:var(--c-gold-light,#e8c968);margin-top:.3rem;line-height:1.6;border-top:1px solid rgba(212,175,55,.1);padding-top:.3rem">📌 ' + typeReading + '</p>';
      }

      // 深度解讀
      if (coreDesc) cardsHtml += '<p style="font-size:.78rem;color:var(--c-gold-light,#d4af37);margin-top:.2rem;line-height:1.5;opacity:.85">' + coreDesc + '</p>';
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
  var spreads = ['three_card','either_or','timeline','relationship','horseshoe','celtic_cross'];
  var labels = {three_card:'3牌',either_or:'二選一',timeline:'時間線',relationship:'關係',horseshoe:'馬蹄形',celtic_cross:'凱爾特'};
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
      btn.style.borderColor = 'rgba(212,175,55,.5)'; btn.style.background = 'rgba(212,175,55,.08)'; btn.style.color = 'var(--c-gold,#d4af37)';
      drawnCards = []; deckShuffled = [];
      if (typeof initTarotDeck === 'function') initTarotDeck();
    };
    var currentId = (typeof getCurrentSpread === 'function') ? getCurrentSpread() : 'celtic_cross';
    if (id === currentId) { btn.style.borderColor = 'rgba(212,175,55,.5)'; btn.style.background = 'rgba(212,175,55,.08)'; btn.style.color = 'var(--c-gold,#d4af37)'; }
    container.appendChild(btn);
  });
  var deckWrap = step2.querySelector('.tarot-deck-wrap');
  if (deckWrap) deckWrap.parentNode.insertBefore(container, deckWrap);
}

// ══════════════════════════════════════════════════════════════════════
// 8. 金色黎明宮廷牌元素對應
// ══════════════════════════════════════════════════════════════════════
var GD_COURT_ELEMENTS = {
  63:{rank:'King',suit:'火',rankEl:'火',combo:'火中之火',zh:'權杖國王：純粹的火焰意志，極致的領導力與創造力，但容易暴烈失控'},
  62:{rank:'Queen',suit:'火',rankEl:'水',combo:'火中之水',zh:'權杖皇后：火焰中的滋養力，熱情但有包容，直覺敏銳的引導者'},
  61:{rank:'Knight',suit:'火',rankEl:'風',combo:'火中之風',zh:'權杖騎士：火焰被風助燃，衝動冒進，行動力爆發但難以持久'},
  60:{rank:'Page',suit:'火',rankEl:'土',combo:'火中之土',zh:'權杖侍從：火焰在土壤中紮根，有想法但還在學習如何落地執行'},
  49:{rank:'King',suit:'水',rankEl:'火',combo:'水中之火',zh:'聖杯國王：情感中的意志力，外表冷靜但內心有強烈的保護慾和決斷力'},
  48:{rank:'Queen',suit:'水',rankEl:'水',combo:'水中之水',zh:'聖杯皇后：純粹的情感直覺，最深層的共感力，但容易被情緒淹沒'},
  47:{rank:'Knight',suit:'水',rankEl:'風',combo:'水中之風',zh:'聖杯騎士：情感的信使，浪漫理想化，帶來邀請但可能不切實際'},
  46:{rank:'Page',suit:'水',rankEl:'土',combo:'水中之土',zh:'聖杯侍從：情感的新芽，剛開始學習感受，純真但脆弱'},
  35:{rank:'King',suit:'風',rankEl:'火',combo:'風中之火',zh:'寶劍國王：思維的最高權威，判斷銳利但可能冷酷'},
  34:{rank:'Queen',suit:'風',rankEl:'水',combo:'風中之水',zh:'寶劍皇后：以直覺輔助理性，看穿表象的洞察力'},
  33:{rank:'Knight',suit:'風',rankEl:'風',combo:'風中之風',zh:'寶劍騎士：純粹的思維風暴，極快但容易過於激進'},
  32:{rank:'Page',suit:'風',rankEl:'土',combo:'風中之土',zh:'寶劍侍從：剛開始學習分析，好奇但缺乏經驗'},
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
      var gdInfo = c.gdCourt ? '<div style="font-size:.7rem;color:#a78bfa;margin-top:.2rem">⚡ ' + c.gdCourt.combo + '</div>' : '';
      h += '<div class="card" style="padding:.8rem;margin-bottom:.5rem;border-left:3px solid '+elC+'">';
      h += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.3rem">';
      h += '<span class="tag tag-gold" style="font-size:.75rem">'+(i+1)+'. '+posName+'</span>';
      h += '<span class="tag '+(c.isUp?'tag-blue':'tag-red')+'" style="font-size:.7rem">'+(c.isUp?'正位':'逆位')+'</span></div>';
      if (posZh) h += '<div style="font-size:.7rem;color:var(--c-text-muted);margin-bottom:.3rem">'+posZh+'</div>';
      h += '<div style="display:flex;gap:.6rem;align-items:flex-start">';
      if (imgSrc) h += '<img src="'+imgSrc+'" alt="'+c.n+'" style="width:65px;height:100px;border-radius:6px;flex-shrink:0;'+(c.isUp?'':'transform:rotate(180deg)')+'">';
      h += '<div style="flex:1"><strong class="text-gold serif" style="font-size:.95rem">'+c.n+'</strong>';
      var kw = c.isUp ? (fc.kwUp||'') : (fc.kwRv||'');
      if (kw) h += '<div style="font-size:.72rem;color:var(--c-text-dim);margin-top:.15rem">🔑 '+kw+'</div>';
      h += gdInfo;
      h += '<p style="font-size:.82rem;color:var(--c-text-dim);margin-top:.25rem;line-height:1.6">'+(c.isUp?fc.up:fc.rv)+'</p>';
      if (typeR) h += '<p style="font-size:.8rem;color:var(--c-gold-light,#e8c968);margin-top:.25rem;line-height:1.6;border-top:1px solid rgba(212,175,55,.1);padding-top:.25rem">📌 '+typeR+'</p>';
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

  // 權杖宮廷
  D(60,{coreUp:'火元素的初學者：有熱情但不穩定',coreRv:'三分鐘熱度',psycheUp:'對新事物充滿好奇',psycheRv:'注意力分散',eventUp:'收到好消息、開始新學習',eventRv:'消息延遲',riskUp:'做太多但完成太少',riskRv:'失去興趣',timeUp:'起步期',timeRv:'等待更好時機',personUp:'熱情的新手',personRv:'三分鐘熱度的人'});
  D(61,{coreUp:'火焰被風助燃，極致行動力',coreRv:'衝動無腦',psycheUp:'想到就做的魄力',psycheRv:'根本沒想過後果',eventUp:'搬家、旅行、突然的冒險',eventRv:'車禍或魯莽行為',riskUp:'燒得太快燒完了',riskRv:'闖禍',timeUp:'非常快',timeRv:'太急反而誤事',personUp:'風火般的行動者',personRv:'魯莽的冒失鬼'});
  D(62,{coreUp:'火中的滋養力，熱情且有包容',coreRv:'控制慾或嫉妒',psycheUp:'溫暖自信的領導力',psycheRv:'佔有慾過強',eventUp:'創業成功、被信任、成為核心人物',eventRv:'情緒失控或嫉妒爆發',riskUp:'把溫暖變成控制',riskRv:'用熱情窒息別人',timeUp:'穩定中帶有熱力',timeRv:'情緒風暴期',personUp:'魅力型領袖',personRv:'佔有慾強的人'});
  D(63,{coreUp:'純粹的火焰意志力',coreRv:'暴君或獨裁',psycheUp:'絕對的自信和決斷',psycheRv:'不聽勸的固執',eventUp:'創業領導、大刀闊斧改革',eventRv:'獨裁引發反抗',riskUp:'太霸道失人心',riskRv:'眾叛親離',timeUp:'快速決斷',timeRv:'需要緩一下',personUp:'有遠見的領袖',personRv:'一言堂的暴君'});

  // 聖杯宮廷
  D(46,{coreUp:'情感的新芽，純真的感受力',coreRv:'情緒不成熟',psycheUp:'對世界充滿好奇和善意',psycheRv:'玻璃心',eventUp:'初戀、第一次被感動',eventRv:'過度敏感受傷',riskUp:'太天真被傷',riskRv:'情緒反應過度',timeUp:'萌芽期',timeRv:'尚未成熟',personUp:'純真的孩子',personRv:'情緒化的小孩'});
  D(47,{coreUp:'帶著愛的邀請',coreRv:'虛假的承諾',psycheUp:'浪漫理想化',psycheRv:'畫大餅',eventUp:'告白、求婚、浪漫驚喜',eventRv:'空頭支票',riskUp:'太浪漫不切實際',riskRv:'被騙感情',timeUp:'邀請期',timeRv:'先觀望',personUp:'浪漫的追求者',personRv:'不可靠的情人'});
  D(48,{coreUp:'純粹的情感直覺力',coreRv:'情緒失控或依賴',psycheUp:'深層的共情和直覺',psycheRv:'被情緒淹沒',eventUp:'藝術創作、心靈連結、直覺準確',eventRv:'情緒化決策',riskUp:'替別人的情緒負責',riskRv:'失去自我邊界',timeUp:'順著感覺走',timeRv:'先穩定情緒',personUp:'有共感力的療癒者',personRv:'情緒勒索的人'});
  D(49,{coreUp:'情感的成熟智慧',coreRv:'冷漠或情感操控',psycheUp:'外冷內熱的深沉',psycheRv:'用冷靜掩蓋冷漠',eventUp:'成為情感上的支柱',eventRv:'情感操控或封閉',riskUp:'太壓抑自己',riskRv:'變得不近人情',timeUp:'沉穩期',timeRv:'需要打開心房',personUp:'沉穩的靈魂伴侶',personRv:'情感操控者'});

  // 寶劍宮廷
  D(32,{coreUp:'思維的新學徒',coreRv:'多疑或散播謠言',psycheUp:'好奇心旺盛',psycheRv:'偷窺或八卦',eventUp:'調查、學習新知、發現真相',eventRv:'散播未經證實的消息',riskUp:'知道太多反而危險',riskRv:'成為是非製造機',timeUp:'調查期',timeRv:'先查證再說',personUp:'機靈的偵探',personRv:'搬弄是非的人'});
  D(33,{coreUp:'思維的極速風暴',coreRv:'口無遮攔或魯莽言行',psycheUp:'思維極快但缺乏同理',psycheRv:'用言語當武器',eventUp:'辯論獲勝、快速解決問題',eventRv:'傷人的話或衝動決定',riskUp:'嘴太快傷感情',riskRv:'變成霸凌者',timeUp:'快到讓人措手不及',timeRv:'急煞車',personUp:'犀利的辯論家',personRv:'嘴巴很毒的人'});
  D(34,{coreUp:'以直覺輔助理性的洞察力',coreRv:'冷漠或疏離',psycheUp:'獨立清醒',psycheRv:'孤獨成為習慣',eventUp:'做出理性但艱難的決定',eventRv:'太冷漠傷害親近的人',riskUp:'高處不勝寒',riskRv:'沒人敢靠近',timeUp:'需要冷靜判斷的時刻',timeRv:'別把自己隔絕太久',personUp:'冷靜的決策者',personRv:'冰山美人'});
  D(35,{coreUp:'最高的理性權威',coreRv:'冷酷無情',psycheUp:'以邏輯和公正為最高原則',psycheRv:'完全沒有感情的機器',eventUp:'法律判決、高層決策',eventRv:'不近人情的裁決',riskUp:'正確但不一定對',riskRv:'用權力壓人',timeUp:'審判時刻',timeRv:'上訴期',personUp:'公正的法官',personRv:'冷血的獨裁者'});

  // 錢幣宮廷
  D(74,{coreUp:'踏實學習物質世界的規則',coreRv:'好高騖遠',psycheUp:'認真且務實',psycheRv:'眼高手低',eventUp:'實習、學徒、開始存錢',eventRv:'不切實際的計畫',riskUp:'學太慢跟不上',riskRv:'根本不想從基層做起',timeUp:'學習期',timeRv:'還沒準備好',personUp:'認真的學徒',personRv:'嫌苦嫌累的人'});
  D(75,{coreUp:'穩扎穩打的行動力',coreRv:'速度太慢錯過機會',psycheUp:'相信穩定就是最好的策略',psycheRv:'固執不知變通',eventUp:'按計畫推進、穩定收入',eventRv:'項目進度落後',riskUp:'太慢被超越',riskRv:'市場變了你還沒動',timeUp:'按部就班',timeRv:'需要加速',personUp:'可靠的執行者',personRv:'慢到讓人急死的人'});
  D(76,{coreUp:'大地的滋養與富足',coreRv:'物質主義或過度操心',psycheUp:'享受生活中的美好',psycheRv:'用物質填補不安',eventUp:'投資回報、環境改善、懷孕',eventRv:'過度消費或擔心錢',riskUp:'太安逸失去上進心',riskRv:'用錢買安全感',timeUp:'豐收享受期',timeRv:'需要節制',personUp:'懂得生活的富人',personRv:'購物成癮的人'});
  D(77,{coreUp:'物質世界的最高掌控者',coreRv:'守財奴或過度物質化',psycheUp:'以穩健的手腕累積財富',psycheRv:'只看錢不看人',eventUp:'事業頂峰、投資成功、財務自由',eventRv:'為了錢失去重要的東西',riskUp:'把錢看得比什麼都重',riskRv:'富裕但孤獨',timeUp:'收成期',timeRv:'該思考錢以外的事了',personUp:'成功的企業家',personRv:'眼裡只有錢的人'});

  console.log('[DEEP] 宮廷牌 16 張深度解讀已載入，78/78 完成');
})();

// ══════════════════════════════════════════════════════════════════════
// 10. 牌陣自適應佈局 — 覆寫 initTarotDeck + pickCard 完成判定
// ══════════════════════════════════════════════════════════════════════
(function() {

  // ── 牌位佈局生成器 ──
  function buildSlotLayout(spreadId, def) {
    if (!def) return null; // fallback 到原版凱爾特
    var count = def.count;
    var positions = def.positions || [];
    var html = '';

    if (spreadId === 'celtic_cross') {
      // 原版凱爾特十字 — 不改
      return null;
    }

    if (spreadId === 'three_card') {
      // 三牌陣：水平排列
      html += '<div style="display:flex;justify-content:center;gap:12px;padding:10px 0">';
      for (var i = 0; i < 3; i++) {
        var pos = positions[i] ? positions[i].name : '第'+(i+1)+'張';
        html += '<div class="tarot-chosen-slot" id="t-slot-'+i+'" style="position:relative;width:68px;height:100px">';
        html += '<span class="slot-num">'+(i+1)+'</span>';
        html += '<span class="slot-label">'+pos+'</span></div>';
      }
      html += '</div>';
      return html;
    }

    if (spreadId === 'either_or') {
      // 二選一：上1中2下2
      html += '<div style="display:flex;flex-direction:column;align-items:center;gap:8px;padding:10px 0">';
      // 你
      html += '<div class="tarot-chosen-slot" id="t-slot-0" style="position:relative;width:68px;height:100px">';
      html += '<span class="slot-num">1</span><span class="slot-label">'+(positions[0]?positions[0].name:'你')+'</span></div>';
      // A vs B
      html += '<div style="display:flex;gap:24px">';
      html += '<div style="display:flex;flex-direction:column;align-items:center;gap:6px">';
      html += '<div style="font-size:.65rem;color:var(--c-gold);font-weight:600">A 選項</div>';
      html += '<div class="tarot-chosen-slot" id="t-slot-1" style="position:relative;width:68px;height:100px"><span class="slot-num">2</span><span class="slot-label">'+(positions[1]?positions[1].name:'A')+'</span></div>';
      html += '<div class="tarot-chosen-slot" id="t-slot-3" style="position:relative;width:68px;height:100px"><span class="slot-num">4</span><span class="slot-label">'+(positions[3]?positions[3].name:'A結果')+'</span></div>';
      html += '</div>';
      html += '<div style="display:flex;flex-direction:column;align-items:center;gap:6px">';
      html += '<div style="font-size:.65rem;color:var(--c-gold);font-weight:600">B 選項</div>';
      html += '<div class="tarot-chosen-slot" id="t-slot-2" style="position:relative;width:68px;height:100px"><span class="slot-num">3</span><span class="slot-label">'+(positions[2]?positions[2].name:'B')+'</span></div>';
      html += '<div class="tarot-chosen-slot" id="t-slot-4" style="position:relative;width:68px;height:100px"><span class="slot-num">5</span><span class="slot-label">'+(positions[4]?positions[4].name:'B結果')+'</span></div>';
      html += '</div></div></div>';
      return html;
    }

    if (spreadId === 'relationship') {
      // 關係牌陣：上排2（你/對方）中排1（關係）下排3
      html += '<div style="display:flex;flex-direction:column;align-items:center;gap:8px;padding:10px 0">';
      html += '<div style="display:flex;gap:20px">';
      html += '<div class="tarot-chosen-slot" id="t-slot-0" style="position:relative;width:68px;height:100px"><span class="slot-num">1</span><span class="slot-label">'+(positions[0]?positions[0].name:'你')+'</span></div>';
      html += '<div class="tarot-chosen-slot" id="t-slot-1" style="position:relative;width:68px;height:100px"><span class="slot-num">2</span><span class="slot-label">'+(positions[1]?positions[1].name:'對方')+'</span></div>';
      html += '</div>';
      html += '<div class="tarot-chosen-slot" id="t-slot-2" style="position:relative;width:68px;height:100px"><span class="slot-num">3</span><span class="slot-label">'+(positions[2]?positions[2].name:'關係')+'</span></div>';
      html += '<div style="display:flex;gap:10px">';
      for (var i = 3; i < 6; i++) {
        html += '<div class="tarot-chosen-slot" id="t-slot-'+i+'" style="position:relative;width:68px;height:100px"><span class="slot-num">'+(i+1)+'</span><span class="slot-label">'+(positions[i]?positions[i].name:'')+'</span></div>';
      }
      html += '</div></div>';
      return html;
    }

    if (spreadId === 'timeline') {
      // 時間線：水平5張
      html += '<div style="display:flex;justify-content:center;gap:8px;padding:10px 0;flex-wrap:wrap">';
      for (var i = 0; i < 5; i++) {
        var pos = positions[i] ? positions[i].name : '第'+(i+1)+'張';
        html += '<div class="tarot-chosen-slot" id="t-slot-'+i+'" style="position:relative;width:60px;height:88px">';
        html += '<span class="slot-num">'+(i+1)+'</span>';
        html += '<span class="slot-label">'+pos+'</span></div>';
      }
      // 箭頭指示
      html += '</div>';
      html += '<div style="text-align:center;font-size:.65rem;color:var(--c-text-dim);margin-top:2px">← 過去 ─── 現在 ─── 未來 →</div>';
      return html;
    }

    if (spreadId === 'horseshoe') {
      // 馬蹄形：弧形7張 (簡化為上3中1下3)
      html += '<div style="display:flex;flex-direction:column;align-items:center;gap:8px;padding:10px 0">';
      html += '<div style="display:flex;gap:8px">';
      for (var i = 0; i < 3; i++) {
        html += '<div class="tarot-chosen-slot" id="t-slot-'+i+'" style="position:relative;width:60px;height:88px"><span class="slot-num">'+(i+1)+'</span><span class="slot-label">'+(positions[i]?positions[i].name:'')+'</span></div>';
      }
      html += '</div>';
      html += '<div class="tarot-chosen-slot" id="t-slot-3" style="position:relative;width:68px;height:100px"><span class="slot-num">4</span><span class="slot-label">'+(positions[3]?positions[3].name:'環境')+'</span></div>';
      html += '<div style="display:flex;gap:8px">';
      for (var i = 4; i < 7; i++) {
        html += '<div class="tarot-chosen-slot" id="t-slot-'+i+'" style="position:relative;width:60px;height:88px"><span class="slot-num">'+(i+1)+'</span><span class="slot-label">'+(positions[i]?positions[i].name:'')+'</span></div>';
      }
      html += '</div></div>';
      return html;
    }

    // Generic fallback: horizontal grid
    html += '<div style="display:flex;justify-content:center;gap:8px;padding:10px 0;flex-wrap:wrap">';
    for (var i = 0; i < count; i++) {
      var pos = positions[i] ? positions[i].name : '第'+(i+1)+'張';
      html += '<div class="tarot-chosen-slot" id="t-slot-'+i+'" style="position:relative;width:60px;height:88px">';
      html += '<span class="slot-num">'+(i+1)+'</span>';
      html += '<span class="slot-label">'+pos+'</span></div>';
    }
    html += '</div>';
    return html;
  }

  // ── 覆寫 initTarotDeck ──
  var _origInitTarotDeck = window.initTarotDeck;
  window.initTarotDeck = function() {
    var def = (typeof getCurrentSpreadDef === 'function') ? getCurrentSpreadDef() : null;
    var spreadId = (typeof getCurrentSpread === 'function') ? getCurrentSpread() : 'celtic_cross';
    var targetCount = def ? def.count : 10;

    // 先呼叫原版（處理洗牌、deck 渲染、drawnCards 重置）
    _origInitTarotDeck();

    // 然後替換牌位佈局（如果不是凱爾特）
    var customLayout = buildSlotLayout(spreadId, def);
    if (customLayout) {
      var chosen = document.getElementById('t-chosen');
      if (chosen) chosen.innerHTML = customLayout;
    }

    // 更新說明文字
    try {
      var descEl = document.querySelector('#step-2 .text-dim.text-sm.mb-sm');
      if (descEl) {
        descEl.innerHTML = '凝神冥想你的問題，然後從 <strong class="text-gold">78</strong> 張塔羅牌中選出 <strong class="text-gold">' + targetCount + '</strong> 張牌';
      }
      var countEl = document.getElementById('t-remain-text');
      if (countEl) {
        countEl.innerHTML = '已選 <strong id="t-remain-picked" class="text-gold">0</strong> / ' + targetCount + ' 張';
      }
    } catch(e) {}
  };

  // ── 覆寫 pickCard — 修正完成判定 + pickAnimating 保護 ──
  var _origPickCard2 = window.pickCard;
  window.pickCard = function(deckIdx, deckEl) {
    var def = (typeof getCurrentSpreadDef === 'function') ? getCurrentSpreadDef() : null;
    var targetCount = def ? def.count : 10;

    // 已到目標數量，不再抽
    if (drawnCards.length >= targetCount) return;

    // 呼叫原版 pickCard（它內部有 pickAnimating 鎖）
    _origPickCard2(deckIdx, deckEl);

    // 原版的完成判定是 >=10，對非凱爾特不會觸發
    // 所以我們在這裡補一個判定
    if (targetCount < 10) {
      // 用 setTimeout 等原版 pickCard 的動畫完成（550ms）
      setTimeout(function() {
        if (drawnCards.length >= targetCount) {
          var btn = document.getElementById('btn-analyze');
          if (btn) btn.disabled = false;
          var hint = document.getElementById('pick-hint');
          if (hint) hint.style.display = 'none';
          S.tarot.drawn = drawnCards;
          S.tarot.spread = drawnCards;
          if (typeof showSpread === 'function') showSpread();
          setTimeout(function() {
            var act = document.querySelector('#step-2 .actions');
            if (act) act.scrollIntoView({behavior:'smooth', block:'center'});
          }, 400);
        }
      }, 600);
    }
  };

  console.log('[牌陣] 自適應佈局 + 完成判定已啟用');
})();
