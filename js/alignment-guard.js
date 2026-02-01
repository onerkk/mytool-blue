/**
 * AlignmentGuard：最後一道跑題守門
 * finalText 須包含 mustAnswer 的 70%（含同義詞）；askType 必要輸出須存在
 * 覆蓋率計算做 normalize（全形半形、大小寫、數字格式）
 * 不通過或命中禁止詞 → 自動重寫：只保留「直接回答 + 依據」
 */
(function (global) {
  'use strict';

  /** mustAnswer 同義詞映射：破萬=一萬=10000=10k，本月=這個月，營收=業績=收入 */
  var MUST_ANSWER_SYNONYMS = {
    '破萬': ['破萬', '達萬', '上萬', '一萬', '10000', '10k', '10K', '１００００'],
    '一萬': ['破萬', '一萬', '10000', '10k', '10K'],
    '10000': ['破萬', '一萬', '10000', '10k', '10K'],
    '10k': ['破萬', '一萬', '10000', '10k', '10K'],
    '營收': ['營收', '收入', '業績', '銷售額'],
    '業績': ['營收', '收入', '業績', '銷售額'],
    '收入': ['營收', '收入', '業績', '銷售額'],
    '本月': ['本月', '這月', '這個月'],
    '這個月': ['本月', '這月', '這個月'],
    '能否': ['能否', '會不會', '可不可以', '是否'],
    '比上月高': ['比上月高', '比上個月高', '比上月好'],
    '訂單': ['訂單', '單量', '業績']
  };

  /** 依 intent 禁止詞：命中則 rewrite 為只保留直接回答+依據（防跑題） */
  var FORBIDDEN_TERMS_BY_INTENT = {
    money: ['桃花', '復合', '感情', '姻緣', '健康', '病', '手術', '升遷', '告白', '曖昧'],
    love: ['破萬', '營收', '業績', '訂單', '銷售', '投資', '財運'].filter(function (x) { return x; }),
    career: ['破萬', '桃花', '復合', '健康', '病'],
    health: ['破萬', '營收', '感情', '桃花', '復合', '業績'],
    relationship: ['破萬', '營收', '業績'],
    decision: [],
    timing: [],
    other: []
  };

  /** 全形→半形、統一數字格式、去空白、小寫英文 */
  function normalizeForMatch(s) {
    if (s == null) return '';
    var t = String(s).replace(/\s/g, '').trim();
    var out = '';
    for (var i = 0; i < t.length; i++) {
      var c = t.charCodeAt(i);
      if (c >= 0xFF01 && c <= 0xFF5E) out += String.fromCharCode(c - 0xFEE0);
      else if (c === 0x3000) out += ' ';
      else out += t.charAt(i);
    }
    out = out.replace(/\s/g, '').trim();
    return out.toLowerCase ? out.toLowerCase() : out;
  }

  function hasForbiddenTerms(intent, text) {
    var list = FORBIDDEN_TERMS_BY_INTENT[intent] || FORBIDDEN_TERMS_BY_INTENT.other || [];
    var normalized = normalizeForMatch(text);
    for (var i = 0; i < list.length; i++) {
      if (normalized.indexOf(normalizeForMatch(list[i])) >= 0) return true;
    }
    return false;
  }

  /**
   * @param {Object} parsedQuestion - parseQuestion 輸出
   * @param {string} finalText - 合成後的完整答案
   * @returns {{ passed: boolean, coverage: number, missingMustAnswer: string[], missingAskType: string, rewritten?: string, forbiddenHit?: boolean }}
   */
  function alignmentCheck(parsedQuestion, finalText) {
    var mustAnswer = Array.isArray(parsedQuestion.mustAnswer) ? parsedQuestion.mustAnswer : [];
    var askType = parsedQuestion.askType || 'yesno';
    var intent = (parsedQuestion.intent || 'other').toLowerCase();
    var text = normalizeForMatch(finalText);
    var missingMustAnswer = [];
    var covered = 0;

    mustAnswer.forEach(function (m) {
      var key = normalizeForMatch(m);
      if (!key) return;
      var synonyms = MUST_ANSWER_SYNONYMS[key] || MUST_ANSWER_SYNONYMS[m.trim()] || [m.trim(), key];
      if (!Array.isArray(synonyms)) synonyms = [synonyms];
      var hit = synonyms.some(function (syn) {
        var n = normalizeForMatch(syn);
        return n && text.indexOf(n) >= 0;
      });
      if (!hit) missingMustAnswer.push(m.trim());
      else covered += 1;
    });

    var coverage = mustAnswer.length > 0 ? covered / mustAnswer.length : 1;
    var mustAnswerPass = coverage >= 0.7;

    var missingAskType = '';
    if (askType === 'yesno') {
      if (!/偏向能|偏向不能|有機會|阻力較大|不能|機率|%/.test(finalText)) missingAskType = 'yesno 須出現偏向能/不能或明確傾向';
    } else if (askType === 'probability') {
      if (!/\d+%|機率|百分比/.test(finalText)) missingAskType = 'probability 須出現 % 或機率';
    } else if (askType === 'timing') {
      if (!/本週|本月|今日|今年|時機|近期|時間/.test(finalText)) missingAskType = 'timing 須出現時間範圍';
    }

    var forbiddenHit = hasForbiddenTerms(intent, finalText);
    var passed = mustAnswerPass && !missingAskType && !forbiddenHit;

    var result = {
      passed: passed,
      coverage: coverage,
      missingMustAnswer: missingMustAnswer,
      missingAskType: missingAskType,
      forbiddenHit: forbiddenHit || undefined
    };

    if (!passed) {
      result.rewritten = rewriteToDirectAndEvidence(finalText);
    }

    return result;
  }

  function rewriteToDirectAndEvidence(fullText) {
    var lines = (fullText || '').split(/\n+/);
    var direct = '';
    var evidence = [];
    var inEvidence = false;
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i].trim();
      if (/^直接回答：/.test(line)) direct = line;
      if (/^依據：|^依據\s*$/.test(line)) { inEvidence = true; continue; }
      if (inEvidence && line && !/^建議：|^建議\s*$/.test(line)) evidence.push(line);
      if (/^建議：|^建議\s*$/.test(line)) break;
    }
    if (!direct) direct = lines.find(function (l) { return /機率|偏向能|偏向不能|%/.test(l); }) || '直接回答：請見下方依據。';
    return direct + '\n\n依據：\n' + (evidence.length ? evidence.join('\n') : '（無）');
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { alignmentCheck: alignmentCheck, rewriteToDirectAndEvidence: rewriteToDirectAndEvidence, MUST_ANSWER_SYNONYMS: MUST_ANSWER_SYNONYMS, FORBIDDEN_TERMS_BY_INTENT: FORBIDDEN_TERMS_BY_INTENT };
  } else {
    global.AlignmentGuard = { alignmentCheck: alignmentCheck, rewriteToDirectAndEvidence: rewriteToDirectAndEvidence, MUST_ANSWER_SYNONYMS: MUST_ANSWER_SYNONYMS, FORBIDDEN_TERMS_BY_INTENT: FORBIDDEN_TERMS_BY_INTENT };
  }
})(typeof window !== 'undefined' ? window : this);
