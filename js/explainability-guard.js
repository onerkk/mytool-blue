/**
 * 命理說理守門（Explainability Guard）
 * 若八字說理未出現身強/身弱/喜忌神 → 視為失敗；若出現抽象總結詞 → 視為無效；禁止「資料缺失假判斷」。
 */
(function (global) {
  'use strict';

  /** 禁止的抽象總結語（出現則視為無效輸出） */
  var FORBIDDEN_PHRASES = [
    '流年與命盤互動',
    '整體偏吉',
    '整體偏凶',
    '整體穩定',
    '紫微顯示有機會',
    '缺完整命理資料',
    '僅供參考'
  ];

  /** 八字說理必須包含的關鍵詞（至少各一） */
  var BAZI_REQUIRED = {
    strength: /身強|身弱|中和|極弱/,
    favor: /喜神|喜用|喜用神|喜\s*[木火土金水]/,
    avoid: /忌神|忌\s*[木火土金水]/
  };

  /**
   * 檢查八字說理是否合格（含身強/身弱、喜神、忌神）
   */
  function checkBaziExplainability(baziText) {
    if (!baziText || typeof baziText !== 'string') return { passed: false, reason: '八字說理為空' };
    var hasStrength = BAZI_REQUIRED.strength.test(baziText);
    var hasFavor = BAZI_REQUIRED.favor.test(baziText);
    var hasAvoid = BAZI_REQUIRED.avoid.test(baziText);
    if (!hasStrength) return { passed: false, reason: '八字說理未出現身強/身弱' };
    if (!hasFavor) return { passed: false, reason: '八字說理未出現喜神/喜用' };
    if (!hasAvoid) return { passed: false, reason: '八字說理未出現忌神' };
    return { passed: true };
  }

  /**
   * 檢查是否出現禁止的抽象總結詞
   */
  function hasForbiddenPhrase(text) {
    if (!text || typeof text !== 'string') return false;
    var t = text.trim();
    for (var i = 0; i < FORBIDDEN_PHRASES.length; i++) {
      if (t.indexOf(FORBIDDEN_PHRASES[i]) >= 0) return FORBIDDEN_PHRASES[i];
    }
    return false;
  }

  /**
   * 檢查「依據」全文：不得出現禁止詞；若含八字說理則八字說理須合格
   */
  function checkEvidenceText(evidenceList, baziTextIncluded) {
    var full = Array.isArray(evidenceList) ? evidenceList.join('\n') : (evidenceList || '');
    var forbidden = hasForbiddenPhrase(full);
    if (forbidden) return { passed: false, reason: '依據中含禁止用語：「' + forbidden + '」' };
    if (baziTextIncluded) {
      var baziCheck = checkBaziExplainability(baziTextIncluded);
      if (!baziCheck.passed) return { passed: false, reason: baziCheck.reason };
    }
    return { passed: true };
  }

  /**
   * 水晶推薦是否綁定命理理由（必須提及喜/忌）
   */
  function crystalHasMingliReason(cardText) {
    if (!cardText || typeof cardText !== 'string') return false;
    var t = cardText;
    return (/喜|忌|補喜神|洩忌神/.test(t));
  }

  /**
   * 直接回答是否為白話因果句（必須有「因為」「所以」）
   */
  function isPlainCauseEffect(directAnswer) {
    if (!directAnswer || typeof directAnswer !== 'string') return false;
    var t = directAnswer.trim();
    return (/因為/.test(t) && /所以/.test(t));
  }

  var api = {
    checkBaziExplainability: checkBaziExplainability,
    hasForbiddenPhrase: hasForbiddenPhrase,
    checkEvidenceText: checkEvidenceText,
    crystalHasMingliReason: crystalHasMingliReason,
    isPlainCauseEffect: isPlainCauseEffect,
    FORBIDDEN_PHRASES: FORBIDDEN_PHRASES
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else global.ExplainabilityGuard = api;
})(typeof window !== 'undefined' ? window : this);
