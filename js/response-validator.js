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

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { validateResponse: validateResponse, AVOID_BY_DOMAIN: AVOID_BY_DOMAIN };
  } else {
    global.validateResponse = validateResponse;
    global.AVOID_BY_DOMAIN = AVOID_BY_DOMAIN;
  }
})(typeof window !== 'undefined' ? window : this);
