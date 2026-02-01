/**
 * AnswerSynthesizer：固定四段輸出，強制先回問題
 * 1. 問題重述（mustAnswer 至少 70% 覆蓋）
 * 2. 直接回答（yesno→能/不能；probability→%；timing→時間範圍）
 * 3. 依據（逐條 evidence，對應 mustAnswer/slot）
 * 4. 行動建議（2～4 點，僅用該 intent 詞庫，嚴禁跨域）
 */
(function (global) {
  'use strict';

  /** 依 intent 的建議詞彙（嚴禁跨域） */
  var INTENT_SUGGESTIONS = {
    love: ['主動表達心意', '創造共同話題', '釐清真實需求', '給彼此空間', '觀察互動', '順勢發展', '勿情緒化決策'],
    money: ['評估現況再行動', '勿過度擴張', '保守理財', '建立預備金', '分散風險', '副業可穩健經營', '把握促銷時機衝銷售', '穩健鋪陳再衝量'],
    career: ['把握近期表現', '加強專業', '主動爭取', '沉潛進修', '檢視現職', '留意時機', '穩紮穩打'],
    health: ['規律作息', '適度運動', '依醫囑追蹤', '規律調養', '留意身體訊號', '預防為上'],
    relationship: ['真誠溝通', '尊重界限', '創造話題', '觀察反應', '給彼此空間'],
    decision: ['依具體問題拆解步驟', '設定短期目標', '定期檢視進度'],
    timing: ['留意時機', '把握近期', '觀察後動'],
    other: ['依具體狀況判斷', '順勢而為', '謹慎為上']
  };

  /**
   * @param {Object} parsedQuestion - parseQuestion 輸出
   * @param {Object} selectionResult - EvidenceSelector 輸出 { sufficient, selected, message }
   * @param {Object} probResult - 機率結果 { probabilityValue, probability }
   * @param {Object} [options] - { factors, rawConclusion }
   * @returns {{ problemRestatement: string, directAnswer: string, evidenceList: string[], suggestions: string[], fullText: string, insufficient: boolean }}
   */
  function synthesize(parsedQuestion, selectionResult, probResult, options) {
    options = options || {};
    var insufficient = !selectionResult.sufficient;
    var mustAnswer = Array.isArray(parsedQuestion.mustAnswer) ? parsedQuestion.mustAnswer : [];
    var askType = parsedQuestion.askType || 'yesno';
    var intent = parsedQuestion.intent || 'other';
    var raw = (parsedQuestion.raw || '').trim();

    if (insufficient) {
      var msg = selectionResult.message || '目前證據不足，建議補充具體問題或再起卦／抽牌後重新分析。';
      return {
        problemRestatement: raw ? '您問的是：「' + raw + '」。' : '您問的問題：',
        directAnswer: msg,
        evidenceList: [],
        suggestions: ['請補充更具體的問題描述，或完成梅花易數起卦、塔羅抽牌後再分析。'],
        fullText: (raw ? '您問的是：「' + raw + '」。' : '') + msg,
        insufficient: true
      };
    }

    var probVal = Number(probResult.probabilityValue) != null ? Number(probResult.probabilityValue) : 50;
    var selected = selectionResult.selected || [];

    var problemRestatement = buildProblemRestatement(raw, mustAnswer);
    var directAnswer = buildDirectAnswer(askType, probVal, parsedQuestion);
    var evidenceList = selected.map(function (e) {
      return (e.system || '') + '：' + (e.claim || '').trim();
    });
    var suggestions = buildSuggestions(intent, probVal, 2, 4);

    var fullText = problemRestatement + '\n\n' + directAnswer + '\n\n依據：\n' + evidenceList.join('\n') + '\n\n建議：\n' + suggestions.join('\n');

    return {
      problemRestatement: problemRestatement,
      directAnswer: directAnswer,
      evidenceList: evidenceList,
      suggestions: suggestions,
      fullText: fullText,
      insufficient: false
    };
  }

  function buildProblemRestatement(raw, mustAnswer) {
    if (!raw) return '您問的問題：';
    var cover = mustAnswer.filter(function (m) { return raw.indexOf(m) >= 0; }).length;
    var rate = mustAnswer.length > 0 ? cover / mustAnswer.length : 1;
    var base = '您問的是：「' + raw + '」。';
    if (rate >= 0.7 || mustAnswer.length === 0) return base;
    var append = mustAnswer.slice(0, 2).join('、');
    if (append) return base + ' 焦點包括：' + append + '。';
    return base;
  }

  function buildDirectAnswer(askType, probVal, parsedQuestion) {
    var probPct = Math.round(Number(probVal) || 50);
    if (askType === 'yesno') {
      var tendency = probPct >= 60 ? '偏向能' : (probPct >= 45 ? '有機會，但需條件配合' : '偏向不能或阻力較大');
      return '直接回答：' + tendency + '。（整體機率約 ' + probPct + '%）';
    }
    if (askType === 'probability') {
      return '直接回答：整體機率約 ' + probPct + '%。' + (probPct >= 60 ? '偏有利。' : probPct >= 40 ? '中性偏可行。' : '偏有阻力。');
    }
    if (askType === 'timing') {
      var horizon = parsedQuestion.timeHorizon || 'unknown';
      var timeLabel = { today: '今日', this_week: '本週', this_month: '本月', '3_months': '三個月內', '6_months': '半年內', '1_year': '今年內', unknown: '近期' }[horizon] || '近期';
      return '直接回答：時機約在「' + timeLabel + '」較值得留意；整體機率約 ' + probPct + '%。';
    }
    return '直接回答：整體機率約 ' + probPct + '%。' + (probPct >= 60 ? '偏有利。' : probPct >= 40 ? '中性。' : '偏有阻力。');
  }

  function buildSuggestions(intent, probVal, minCount, maxCount) {
    var key = intent === 'money' ? 'money' : intent;
    var list = INTENT_SUGGESTIONS[key] || INTENT_SUGGESTIONS.other;
    var count = Math.min(maxCount, Math.max(minCount, list.length));
    var start = Math.max(0, Math.floor((probVal || 0) % Math.max(1, list.length)));
    var out = [];
    for (var i = 0; i < count && out.length < count; i++) {
      var idx = (start + i) % list.length;
      if (list[idx] && out.indexOf(list[idx]) < 0) out.push(list[idx]);
    }
    return out.length ? out : list.slice(0, count);
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { synthesize: synthesize, INTENT_SUGGESTIONS: INTENT_SUGGESTIONS };
  } else {
    global.AnswerSynthesizer = { synthesize: synthesize, INTENT_SUGGESTIONS: INTENT_SUGGESTIONS };
  }
})(typeof window !== 'undefined' ? window : this);
