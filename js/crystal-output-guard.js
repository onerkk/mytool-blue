/**
 * 水晶輸出守門：反統一回應 + 跑題檢查
 * 若 N 顆有 70% 以上配戴/注意事項文字重複 → 判定模板化 → 強制換用該水晶的 wear/cautions
 * parsedQuestion.intent=money 時文案不得出現桃花/復合/曖昧等 love 專屬詞
 */
(function (global) {
  'use strict';

  var FORBIDDEN_BY_INTENT = {
    money: ['桃花', '復合', '曖昧', '姻緣', '告白', '戀愛', '正緣'],
    love: ['破萬', '營收', '業績', '訂單', '銷售', '投資', '財運'],
    career: ['桃花', '復合', '破萬'],
    health: ['破萬', '營收', '桃花', '復合'],
    relationship: ['破萬', '營收', '業績'],
    decision: [],
    timing: [],
    other: []
  };

  var DUPLICATE_THRESHOLD = 0.7;

  /**
   * @param {Array<{wearText, cautionsText}>} cards - 每顆卡片的 wearText、cautionsText
   * @returns {{ isGeneric: boolean, duplicateRatio: number }}
   */
  function checkGeneric(cards) {
    if (!cards || cards.length < 2) return { isGeneric: false, duplicateRatio: 0 };
    var wearTexts = cards.map(function (c) { return (c.wearText || '').trim(); });
    var cautionTexts = cards.map(function (c) { return (c.cautionsText || '').trim(); });
    var sameWear = 0;
    var sameCaution = 0;
    for (var i = 0; i < wearTexts.length; i++) {
      for (var j = i + 1; j < wearTexts.length; j++) {
        if (wearTexts[i] === wearTexts[j] && wearTexts[i].length > 5) sameWear++;
        if (cautionTexts[i] === cautionTexts[j] && cautionTexts[i].length > 5) sameCaution++;
      }
    }
    var pairs = (cards.length * (cards.length - 1)) / 2;
    var ratio = pairs > 0 ? (sameWear + sameCaution) / (pairs * 2) : 0;
    return { isGeneric: ratio >= DUPLICATE_THRESHOLD, duplicateRatio: ratio };
  }

  /**
   * @param {Object} parsedQuestion - parseQuestion 輸出
   * @param {string} text - 單段文案
   * @returns {{ offTopic: boolean, hitWords: string[] }}
   */
  function checkOffTopic(parsedQuestion, text) {
    var intent = (parsedQuestion && parsedQuestion.intent) ? parsedQuestion.intent : 'other';
    var forbidden = FORBIDDEN_BY_INTENT[intent] || [];
    var hitWords = forbidden.filter(function (w) { return text.indexOf(w) >= 0; });
    return { offTopic: hitWords.length > 0, hitWords: hitWords };
  }

  /**
   * 對整組卡片檢查跑題，若有則回傳需刪除的段落提示（呼叫方重合成時可刪跑題句）
   * @param {Object} parsedQuestion
   * @param {Array<{conclusion, evidenceText, wearText, cautionsText}>} cards
   * @returns {{ passed: boolean, offendingCards: Array<{idx, hitWords}> }}
   */
  function guardOffTopic(parsedQuestion, cards) {
    var offendingCards = [];
    for (var i = 0; i < (cards || []).length; i++) {
      var full = (cards[i].conclusion || '') + (cards[i].evidenceText || '') + (cards[i].wearText || '') + (cards[i].cautionsText || '');
      var res = checkOffTopic(parsedQuestion, full);
      if (res.offTopic) offendingCards.push({ idx: i, hitWords: res.hitWords });
    }
    return { passed: offendingCards.length === 0, offendingCards: offendingCards };
  }

  /**
   * 移除文案中的跑題詞句（簡易：刪除含禁止詞的整句）
   */
  function stripOffTopicText(parsedQuestion, text) {
    var intent = (parsedQuestion && parsedQuestion.intent) ? parsedQuestion.intent : 'other';
    var forbidden = FORBIDDEN_BY_INTENT[intent] || [];
    var t = text;
    forbidden.forEach(function (w) {
      var re = new RegExp('[^。；]*' + w + '[^。；]*[。；]?', 'g');
      t = t.replace(re, '');
    });
    return t.replace(/\s{2,}/g, ' ').trim();
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { checkGeneric: checkGeneric, checkOffTopic: checkOffTopic, guardOffTopic: guardOffTopic, stripOffTopicText: stripOffTopicText };
  } else {
    global.CrystalOutputGuard = { checkGeneric: checkGeneric, checkOffTopic: checkOffTopic, guardOffTopic: guardOffTopic, stripOffTopicText: stripOffTopicText };
  }
})(typeof window !== 'undefined' ? window : this);
