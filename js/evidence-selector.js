/**
 * EvidenceSelector：只選與問句對齊的證據
 * score = mustAnswerHit*6 + keywordHit*3 + timeMatch*4 - offTopicPenalty*10
 * 分數 < 8 → 回傳「證據不足」，AnswerSynthesizer 須輸出「需要補充資訊」
 */
(function (global) {
  'use strict';

  var EVIDENCE_SUFFICIENT_THRESHOLD = 8;

  /**
   * @param {Object} parsedQuestion - parseQuestion 輸出
   * @param {Array<Object>} evidenceItems - EvidenceNormalizer 輸出的 evidence 陣列
   * @returns {{ sufficient: boolean, selected: Array, score: number, message?: string }}
   */
  function selectEvidence(parsedQuestion, evidenceItems) {
    if (!parsedQuestion || !Array.isArray(evidenceItems)) {
      return { sufficient: false, selected: [], score: 0, message: '缺少問題或證據' };
    }

    var mustAnswer = Array.isArray(parsedQuestion.mustAnswer) ? parsedQuestion.mustAnswer : [];
    var keywords = Array.isArray(parsedQuestion.keywords) ? parsedQuestion.keywords : [];
    var timeHorizon = parsedQuestion.timeHorizon || 'unknown';
    var intent = parsedQuestion.intent || 'other';

    var scored = evidenceItems.map(function (item) {
      var mustAnswerHit = 0;
      (item.supports || []).forEach(function (s) {
        if (mustAnswer.indexOf(s) >= 0) mustAnswerHit += 1;
      });
      if (mustAnswer.length > 0 && (item.supports || []).length > 0) {
        mustAnswer.forEach(function (m) {
          if ((item.claim || '').indexOf(m) >= 0) mustAnswerHit += 1;
          (item.slotTags || []).forEach(function (t) {
            if (m.indexOf(t) >= 0 || t.indexOf(m) >= 0) mustAnswerHit += 0.5;
          });
        });
      }

      var keywordHit = 0;
      keywords.forEach(function (k) {
        if ((item.claim || '').indexOf(k) >= 0) keywordHit += 1;
        if ((item.slotTags || []).indexOf(k) >= 0) keywordHit += 0.5;
      });

      var timeMatch = 0;
      var itemTimes = item.timeTags || [];
      if (itemTimes.indexOf(timeHorizon) >= 0) timeMatch = 1;
      else if (timeHorizon !== 'unknown' && (itemTimes.indexOf('this_month') >= 0 || itemTimes.indexOf('this_week') >= 0)) timeMatch = 0.5;

      var offTopicPenalty = 0;
      var claim = (item.claim || '').trim();
      if (intent === 'money' || intent === 'wealth') {
        if (/感情|桃花|復合|姻緣|健康|病|手術/.test(claim)) offTopicPenalty += 1;
      } else if (intent === 'love') {
        if (/破萬|營收|業績|訂單|銷售|投資|財/.test(claim) && !/感情|緣/.test(claim)) offTopicPenalty += 0.5;
      } else if (intent === 'health') {
        if (/破萬|營收|感情|桃花/.test(claim)) offTopicPenalty += 0.5;
      }

      var score = mustAnswerHit * 6 + keywordHit * 3 + timeMatch * 4 - offTopicPenalty * 10;
      return { item: item, score: Math.max(0, score) };
    });

    scored.sort(function (a, b) { return b.score - a.score; });
    var totalScore = scored.reduce(function (sum, s) { return sum + s.score; }, 0);
    var selected = scored.filter(function (s) { return s.score > 0; }).map(function (s) { return s.item; });

    var sufficient = totalScore >= EVIDENCE_SUFFICIENT_THRESHOLD && selected.length > 0;
    var message = sufficient ? undefined : '證據不足，建議補充具體問題或再起卦／抽牌後重新分析。';

    return {
      sufficient: sufficient,
      selected: selected,
      score: totalScore,
      message: message
    };
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { selectEvidence: selectEvidence, EVIDENCE_SUFFICIENT_THRESHOLD: EVIDENCE_SUFFICIENT_THRESHOLD };
  } else {
    global.EvidenceSelector = {
      selectEvidence: selectEvidence,
      EVIDENCE_SUFFICIENT_THRESHOLD: EVIDENCE_SUFFICIENT_THRESHOLD
    };
  }
})(typeof window !== 'undefined' ? window : this);
