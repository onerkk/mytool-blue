/* js/tarot-golden-dawn-system.js - v7.0 (A4 機率輸出版)
 * 目的：
 * 1) 提供 GoldenDawnCelticCross 分析引擎（供 main.js TarotModule 使用）
 * 2) 不輸出模板句；改提供可計算的「成功率(0-100)」與「10 張位置解讀」
 * 3) 優先讀取 tarot-system.js 的 TAROT_DATA / CELTIC_POSITIONS（若存在），缺資料則降級 fallback
 */
(function () {
  'use strict';

  // ---- 安全取值 ----
  function safeStr(v, fallback) {
    return (typeof v === 'string' && v.trim()) ? v : (fallback || '');
  }
  function clamp(n, min, max) {
    n = Number(n);
    if (!Number.isFinite(n)) return min;
    return Math.max(min, Math.min(max, n));
  }

  // ---- 位置定義（若 tarot-system.js 未載入則使用 fallback） ----
  var FALLBACK_POSITIONS = {
    1: { name: '核心現況', meaning: '當前問題的核心與現狀' },
    2: { name: '橫跨的挑戰', meaning: '阻礙或助力（主要影響）' },
    3: { name: '潛意識根源', meaning: '深層動機、潛藏因素' },
    4: { name: '過去', meaning: '近期過去的關鍵影響' },
    5: { name: '顯意識目標', meaning: '理想、期待、目標' },
    6: { name: '未來', meaning: '短期趨勢與走向' },
    7: { name: '自我', meaning: '你目前的態度與策略' },
    8: { name: '環境/他人', meaning: '外在環境與他人因素' },
    9: { name: '希望/恐懼', meaning: '內在期待與擔憂' },
    10:{ name: '最終結果', meaning: '整體落點與結果傾向' }
  };

  function getPositions() {
    try {
      if (typeof CELTIC_POSITIONS !== 'undefined' && CELTIC_POSITIONS) return CELTIC_POSITIONS;
    } catch (e) {}
    return FALLBACK_POSITIONS;
  }

  // ---- 牌義讀取：優先 TAROT_DATA（tarot-system.js） ----
  function getCardMeaningById(cardId) {
    try {
      if (typeof TAROT_DATA !== 'undefined' && TAROT_DATA && TAROT_DATA[cardId]) return TAROT_DATA[cardId];
    } catch (e) {}
    return null;
  }

  // ---- 文字關鍵詞評分（避免模板，改成可量化）----
  var POSITIVE_WORDS = ['成功','順利','機會','成長','進展','祝福','喜悅','收穫','圓滿','希望','突破','顯化','穩定','和諧','支持','提升','勝利','勇氣','新開始'];
  var NEGATIVE_WORDS = ['阻礙','延遲','失敗','衝突','破裂','焦慮','損失','混亂','背離','欺騙','停滯','消耗','壓力','風險','分離','挫折','不穩','失衡','匱乏'];

  function keywordScore(text) {
    var s = 0;
    var t = safeStr(text,'');
    POSITIVE_WORDS.forEach(function (w) { if (t.indexOf(w) >= 0) s += 2; });
    NEGATIVE_WORDS.forEach(function (w) { if (t.indexOf(w) >= 0) s -= 2; });
    return s;
  }

  function domainHint(question) {
    var q = safeStr(question,'');
    if (!q) return 'general';
    if (/桃花|感情|戀|告白|結婚|復合|伴侶|正緣|緣份|姻緣/.test(q)) return 'love';
    if (/工作|事業|升遷|轉職|面試|業績/.test(q)) return 'career';
    if (/錢|財|投資|收入|負債|買賣/.test(q)) return 'wealth';
    if (/健康|病|疼|手術|恢復/.test(q)) return 'health';
    if (/人際|朋友|同事|貴人/.test(q)) return 'relationship';
    if (/家庭|家人|購屋/.test(q)) return 'family';
    return 'general';
  }

  // ---- GoldenDawnCelticCross ----
  function GoldenDawnCelticCross() {}

  GoldenDawnCelticCross.prototype.analyze = function (cards, question, querentInfo) {
    var q = safeStr(question, '未提供問題');
    var positions = getPositions();
    var qType = (querentInfo && querentInfo.questionType) ? String(querentInfo.questionType).toLowerCase() : null;
    var d = qType || domainHint(q);

    var out = {
      question: q,
      domain: d,
      querent: querentInfo || {},
      fortuneScore: 50,
      positions: [],
      summary: '',
      signals: { positive: 0, negative: 0 }
    };

    if (!cards || !cards.length) {
      out.summary = '尚未抽牌，無法產生塔羅機率評估。';
      out.fortuneScore = 0;
      return out;
    }

    var score = 50;

    for (var i = 0; i < 10; i++) {
      var c = cards[i] || {};
      var cardId = c.id || '';
      // [FIX] 兼容數字 id / 缺省 id：嘗試以 suit+number 或 major/四花色偏移轉為 TAROT_DATA 的 key（避免牌意空白）
      var cardKey = (c.cardId || c.key || c.cardKey || '');
      try {
        if (!cardKey) {
          if (c.suit && (c.number !== undefined && c.number !== null)) {
            cardKey = (c.suit === 'major') ? ('major_' + String(c.number)) : (String(c.suit) + '_' + String(c.number));
          } else if (typeof cardId === 'number') {
            // 0-21 視為大阿爾克那
            if (cardId >= 0 && cardId <= 21) cardKey = 'major_' + String(cardId);
            else {
              // 依常見偏移估算（不保證，但可避免完全空白）
              if (cardId >= 22 && cardId <= 35) cardKey = 'wands_' + String(cardId - 21);
              if (cardId >= 36 && cardId <= 49) cardKey = 'cups_' + String(cardId - 35);
              if (cardId >= 50 && cardId <= 63) cardKey = 'swords_' + String(cardId - 49);
              if (cardId >= 64 && cardId <= 77) cardKey = 'pentacles_' + String(cardId - 63);
            }
          } else if (String(cardId).match(/^\d+$/)) {
            var nid = parseInt(cardId, 10);
            if (!isNaN(nid)) {
              if (nid >= 0 && nid <= 21) cardKey = 'major_' + String(nid);
              else {
                if (nid >= 22 && nid <= 35) cardKey = 'wands_' + String(nid - 21);
                if (nid >= 36 && nid <= 49) cardKey = 'cups_' + String(nid - 35);
                if (nid >= 50 && nid <= 63) cardKey = 'swords_' + String(nid - 49);
                if (nid >= 64 && nid <= 77) cardKey = 'pentacles_' + String(nid - 63);
              }
            }
          }
        }
      } catch (e) {}
      if (cardKey) cardId = cardKey;
      var cardName = c.name || cardId || ('第' + (i+1) + '張');
      var isReversed = !!c.isReversed;

      var meaningObj = getCardMeaningById(cardId);
      var typeMeaning = (typeof getTarotMeaningByType === 'function') ? getTarotMeaningByType(cardId, d, isReversed) : null;
      var upright = meaningObj ? safeStr(meaningObj.upright, safeStr(meaningObj.meaning,'')) : '';
      var reversed = meaningObj ? safeStr(meaningObj.reversed, '') : '';

      // 若沒有 reversed，就用 upright 做弱化版（避免空白）
      if (!reversed) reversed = upright ? ('（逆位偏向）' + upright) : '逆位意義資料不足';

      var chosenMeaning = typeMeaning || (isReversed ? reversed : upright);
      var baseDelta = keywordScore(chosenMeaning);

      // domain 微調（僅加權，不產生模板句）
      var domDelta = 0;
      if (d === 'love' && /戀|愛|關係|伴侶|心/.test(chosenMeaning)) domDelta += 2;
      if (d === 'career' && /工作|事業|目標|權力|計畫/.test(chosenMeaning)) domDelta += 2;
      if ((d === 'wealth' || d === 'money') && /金|錢|資源|收穫|物質/.test(chosenMeaning)) domDelta += 2;
      if (d === 'health' && /恢復|失衡|壓力|精神|身體/.test(chosenMeaning)) domDelta += 2;

      var delta = clamp(baseDelta + domDelta, -8, 8);
      score += delta;

      if (delta >= 2) out.signals.positive++;
      if (delta <= -2) out.signals.negative++;

      var posDef = positions[i+1] || FALLBACK_POSITIONS[i+1];
      var posMeaning = (posDef.focusByType && posDef.focusByType[d]) ? posDef.focusByType[d] : (posDef.meaning || '');
      out.positions.push({
        index: i+1,
        position: safeStr(posDef.name, '位置' + (i+1)),
        positionMeaning: safeStr(posMeaning, safeStr(posDef.meaning, '')),
        cardId: cardId,
        card: cardName,
        orientation: isReversed ? '逆位' : '正位',
        meaning: chosenMeaning,
        delta: delta
      });
    }

    out.fortuneScore = clamp(score, 0, 100);

    // summary 只給機率判讀，不給行動建議（A4）
    out.summary =
      '塔羅機率評估：' + out.fortuneScore + '%（正向訊號 ' + out.signals.positive +
      ' / 負向訊號 ' + out.signals.negative + '）。';

    return out;
  };

  // 暴露全域
  window.GoldenDawnCelticCross = GoldenDawnCelticCross;

})();
