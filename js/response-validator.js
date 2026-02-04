/**
 * I) validate_response(domain)：檢查輸出是否含該 domain 禁用詞；若出現則需重生成。
 * 健康類不得出現桃花詞；財運類不得出現病痛詞等。
 */
(function (global) {
  'use strict';

  var AVOID_BY_DOMAIN = {
    health: ['桃花', '曖昧', '桃花運', '感情運', '姻緣', '正緣', '告白', '戀愛', '復合', '對象'],
    wealth: ['病痛', '手術', '症狀', '治療', '醫生', '健康惡化'],
    career: ['桃花運', '姻緣', '正緣', '告白', '復合'],
    relationship: [],
    family: [],
    love: [],
    general: [],
    other: []
  };

  /**
   * @param {string} domain - 當前問題類別（與 UI 一致）
   * @param {string} text - 要輸出的回答全文
   * @returns {{ passed: boolean, hit: string[] }}
   */
  function validateResponse(domain, text) {
    var d = (domain || 'other').toString().toLowerCase();
    var list = AVOID_BY_DOMAIN[d] || AVOID_BY_DOMAIN.other;
    var hit = [];
    var t = String(text || '');
    for (var i = 0; i < list.length; i++) {
      if (t.indexOf(list[i]) >= 0) hit.push(list[i]);
    }
    return { passed: hit.length === 0, hit: hit };
  }

  /**
   * 5) 回覆一致性檢查（投機/樂透）：生成完文字後呼叫，任一 fail → fallback 重生成並記錄 debug id
   * @param {Object} intent - parseQuestionIntent 輸出（含 lottery, time_scope）
   * @param {string} answerText - 要輸出的回答全文
   * @returns {{ passed: boolean, reason?: string, debugId: string }}
   */
  function validateAnswer(intent, answerText) {
    var debugId = 'VAL-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    var t = String(answerText || '').trim();
    if (!intent || !intent.lottery) {
      return { passed: true, debugId: debugId };
    }
    if (!/樂透|彩券|偏財/.test(t)) {
      return { passed: false, reason: 'lottery 回答必須包含：樂透、彩券 或 偏財', debugId: debugId };
    }
    var scope = (intent.time_scope === 'month') ? 'month' : (intent.time_scope === 'year') ? 'year' : null;
    if (scope === 'month' && t.indexOf('本月') < 0) {
      return { passed: false, reason: 'time_scope=month 時回答必須包含「本月」', debugId: debugId };
    }
    if (scope === 'year' && t.indexOf('今年') < 0) {
      return { passed: false, reason: 'time_scope=year 時回答必須包含「今年」', debugId: debugId };
    }
    if (scope === 'month' && /今年整體運勢/.test(t)) {
      return { passed: false, reason: 'time_scope=month 時不得以「今年整體運勢」當主標', debugId: debugId };
    }
    return { passed: true, debugId: debugId };
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { validateResponse: validateResponse, validateAnswer: validateAnswer, AVOID_BY_DOMAIN: AVOID_BY_DOMAIN };
  } else {
    global.validateResponse = validateResponse;
    global.validateAnswer = validateAnswer;
    global.AVOID_BY_DOMAIN = AVOID_BY_DOMAIN;
  }
})(typeof window !== 'undefined' ? window : this);
