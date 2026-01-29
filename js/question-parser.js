/**
 * 問題解析器
 * 流程：問題輸入 → 問題解析（類型、關鍵資訊、分類）
 */
(function (global) {
  'use strict';

  var CATEGORY_FINANCE = 'finance';
  var CATEGORY_CAREER = 'career';
  var CATEGORY_HEALTH = 'health';
  var CATEGORY_RELATIONSHIP = 'relationship';
  var CATEGORY_GENERAL = 'general';

  var TYPE_PROBABILITY = 'probability';
  var TYPE_GENERAL = 'general';

  var KEYWORDS = {
    finance: [
      '收入', '支出', '財', '錢', '投資', '理財', '加薪', '業績', '賺', '賠',
      '貸款', '負債', '利潤', '報酬', '財務', '經濟', '本月', '上月', '今年', '明年'
    ],
    career: [
      '工作', '事業', '職', '升遷', '轉職', '面試', '業績', '合作', '創業',
      '考績', '調動', '離職', '錄取', '合約', '客戶', '專案'
    ],
    health: [
      '健康', '病', '痛', '手術', '恢復', '體檢', '症狀', '治療', '醫生',
      '身心', '睡眠', '飲食', '運動', '懷孕', '生產'
    ],
    relationship: [
      '感情', '桃花', '戀愛', '結婚', '離婚', '復合', '伴侶', '婚姻', '約會',
      '告白', '曖昧', '交往', '分手', '相親', '姻緣', '人際', '貴人', '口角'
    ]
  };

  /**
   * 解析用戶問題
   * @param {string} text - 原始問題 (e.g. "這月收入會比上月高嗎？")
   * @returns {Object} { type, category, timeframe, keywords, raw }
   */
  function parseQuestion(text) {
    var raw = (typeof text === 'string' ? text : '').trim();
    var type = TYPE_GENERAL;
    var category = CATEGORY_GENERAL;
    var timeframe = {};
    var keywords = [];

    if (!raw) {
      return { type: type, category: category, timeframe: timeframe, keywords: keywords, raw: raw };
    }

    var t = raw;

    // 概率型：含「會…嗎」「能…嗎」「是否」「會不會」「能不能」等
    if (/會.*嗎|能.*嗎|是否|會不會|能不能|有沒有|可不可以|可否|機率|可能嗎|有望嗎/.test(t)) {
      type = TYPE_PROBABILITY;
    }

    // 時間範圍
    if (/這月|本月|這個月/.test(t)) timeframe.currentMonth = true;
    if (/上月|上個月/.test(t)) timeframe.lastMonth = true;
    if (/今年|這年/.test(t)) timeframe.currentYear = true;
    if (/明年|來年/.test(t)) timeframe.nextYear = true;
    if (/近期|短期|最近|這陣子/.test(t)) timeframe.nearTerm = true;
    if (/長期|未來|今後/.test(t)) timeframe.longTerm = true;

    // 分類 + 關鍵詞
    for (var cat in KEYWORDS) {
      if (!Object.prototype.hasOwnProperty.call(KEYWORDS, cat)) continue;
      for (var i = 0; i < KEYWORDS[cat].length; i++) {
        var w = KEYWORDS[cat][i];
        if (t.indexOf(w) >= 0) {
          if (keywords.indexOf(w) < 0) keywords.push(w);
          if (category === CATEGORY_GENERAL) category = cat;
        }
      }
    }

    return {
      type: type,
      category: category,
      timeframe: timeframe,
      keywords: keywords,
      raw: raw
    };
  }

  function getCategoryLabel(cat) {
    var m = {
      finance: '財務',
      career: '事業',
      health: '健康',
      relationship: '感情',
      general: '綜合'
    };
    return m[cat] || cat;
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      parseQuestion: parseQuestion,
      getCategoryLabel: getCategoryLabel,
      CATEGORY_FINANCE: CATEGORY_FINANCE,
      CATEGORY_CAREER: CATEGORY_CAREER,
      CATEGORY_HEALTH: CATEGORY_HEALTH,
      CATEGORY_RELATIONSHIP: CATEGORY_RELATIONSHIP,
      CATEGORY_GENERAL: CATEGORY_GENERAL,
      TYPE_PROBABILITY: TYPE_PROBABILITY,
      TYPE_GENERAL: TYPE_GENERAL
    };
  } else {
    global.parseQuestion = parseQuestion;
    global.getCategoryLabel = getCategoryLabel;
    global.QUESTION_CATEGORY = {
      FINANCE: CATEGORY_FINANCE,
      CAREER: CATEGORY_CAREER,
      HEALTH: CATEGORY_HEALTH,
      RELATIONSHIP: CATEGORY_RELATIONSHIP,
      GENERAL: CATEGORY_GENERAL
    };
    global.QUESTION_TYPE = { PROBABILITY: TYPE_PROBABILITY, GENERAL: TYPE_GENERAL };
  }
})(typeof window !== 'undefined' ? window : this);
