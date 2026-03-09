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
