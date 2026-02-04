/**
 * 問題解析器
 * 流程：問題輸入 → 問題解析（類型、關鍵資訊、分類）
 * 輸出結構化 schema：raw, clean, intent, askType, timeHorizon, subject, keySlots, keywords, mustAnswer
 * 並保留 type, category, timeframe 以相容下游（getCategory / fusionEngine）。
 * A1) QuestionIntent schema：domain（與 UI 選單一致）、time_scope、time_anchor、focus、question_type、keywords。
 */
(function (global) {
  'use strict';

  var CATEGORY_FINANCE = 'finance';
  var CATEGORY_CAREER = 'career';
  var CATEGORY_HEALTH = 'health';
  var CATEGORY_RELATIONSHIP = 'relationship';
  var CATEGORY_FAMILY = 'family';
  var CATEGORY_GENERAL = 'general';

  /** 與 UI 選單一致的 domain 枚舉（愛情/事業/財運/健康/人際/家庭/運勢(綜合)/其他） */
  var DOMAIN_UI = ['love', 'career', 'wealth', 'health', 'relationship', 'family', 'general', 'other'];
  /** 各 domain 的 focus 子類關鍵詞（用於抽取 focus） */
  var FOCUS_KEYWORDS = {
    love: ['桃花', '曖昧', '復合', '婚姻', '相處', '告白', '交往', '分手', '正緣', '姻緣', '約會', '相親'],
    career: ['升遷', '轉職', '合作', '客戶', '創業', '面試', '考績', '調動', '離職', '專案', '業績'],
    wealth: ['正財', '偏財', '投資', '回款', '支出', '收入', '破萬', '銷售', '理財', '負債'],
    health: ['睡眠', '腸胃', '筋骨', '壓力', '慢性', '體檢', '手術', '恢復', '飲食', '運動'],
    relationship: ['人際', '貴人', '客戶', '溝通', '同事', '朋友', '互動', '客訴'],
    family: ['家庭', '家人', '父母', '子女', '購屋', '買房', '婆媳', '手足'],
    general: ['運勢', '整體', '流年', '大運'],
    other: []
  };
  /** askType → question_type（prediction | advice | risk | explanation） */
  var ASK_TYPE_TO_QUESTION_TYPE = {
    yesno: 'prediction',
    probability: 'prediction',
    timing: 'prediction',
    choice: 'advice',
    howto: 'advice',
    diagnosis: 'explanation'
  };

  var TYPE_PROBABILITY = 'probability';
  var TYPE_GENERAL = 'general';

  /** intent → 下游 category（fusionEngine / getQuestionType 用） */
  var INTENT_TO_CATEGORY = {
    love: CATEGORY_RELATIONSHIP,
    money: CATEGORY_FINANCE,
    career: CATEGORY_CAREER,
    health: CATEGORY_HEALTH,
    relationship: CATEGORY_RELATIONSHIP,
    decision: CATEGORY_GENERAL,
    timing: CATEGORY_GENERAL,
    other: CATEGORY_GENERAL
  };

  var KEYWORDS = {
    finance: [
      '收入', '支出', '財', '財運', '錢', '投資', '理財', '加薪', '業績', '賺', '賠',
      '貸款', '負債', '利潤', '報酬', '財務', '經濟', '本月', '上月', '今年', '明年',
      '副業', '銷售', '破萬', '賣出', '售出', '手鍊', '手練', '飾品', '自製', '作品'
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
      '告白', '曖昧', '交往', '分手', '相親', '姻緣', '正緣', '緣份',
      '人際', '貴人', '口角'
    ],
    family: [
      '家庭', '家人', '父母', '子女', '兄弟', '姊妹', '親子', '購屋', '買房',
      '裝潢', '搬家', '遺產', '婆媳', '手足'
    ]
  };

  function normalizeClean(s) {
    return String(s || '').replace(/\s+/g, ' ').replace(/^\s+|\s+$/g, '').trim();
  }

  function detectIntent(t) {
    if (/桃花|感情|戀|告白|結婚|復合|伴侶|正緣|緣份|姻緣|曖昧|交往|分手/.test(t)) return 'love';
    if (/錢|財|投資|收入|負債|買賣|副業|銷售|破萬|賺錢|業績|賣出|售出|手鍊|手練|飾品|自製|作品/.test(t)) return 'money';
    if (/工作|事業|升遷|轉職|面試|業績|客戶|專案|創業|考績|調動|離職|錄取/.test(t)) return 'career';
    if (/健康|病|疼|手術|恢復|體檢|症狀|治療|身心|睡眠|飲食|運動|懷孕/.test(t)) return 'health';
    if (/人際|朋友|同事|貴人/.test(t)) return 'relationship';
    if (/家庭|家人|父母|子女|購屋|買房|搬家/.test(t)) return 'relationship';
    if (/何時|幾時|什麼時候|時機|時點/.test(t)) return 'timing';
    if (/該不該|要不要|選哪|選擇|A還是B|哪個好/.test(t)) return 'decision';
    return 'other';
  }

  function detectAskType(t) {
    if (/會.*嗎|能.*嗎|是否|會不會|能不能|有沒有|可不可以|可否/.test(t)) return 'yesno';
    if (/機率|可能嗎|有望嗎|機會|多大概率/.test(t)) return 'probability';
    if (/何時|幾時|什麼時候|哪天|哪個月|時機/.test(t)) return 'timing';
    if (/選哪|選擇|A還是B|哪個好|要不要|該不該/.test(t)) return 'choice';
    if (/怎麼|如何|怎樣|怎麼做|如何做/.test(t)) return 'howto';
    if (/什麼問題|為什麼|原因|為何/.test(t)) return 'diagnosis';
    return 'yesno';
  }

  function detectTimeHorizon(t, timeframe) {
    if (/今天|今日/.test(t)) return 'today';
    if (/這週|本週|這星期|近期|最近|這陣子/.test(t) || (timeframe && timeframe.nearTerm)) return 'this_week';
    if (/這月|本月|這個月/.test(t) || (timeframe && timeframe.currentMonth)) return 'this_month';
    if (/三個月|3個月|季/.test(t)) return '3_months';
    if (/半年|六個月|6個月/.test(t)) return '6_months';
    if (/今年|這年|明年|來年/.test(t) || (timeframe && (timeframe.currentYear || timeframe.nextYear))) return '1_year';
    if (/長期|未來|今後/.test(t) || (timeframe && timeframe.longTerm)) return '1_year';
    return 'unknown';
  }

  function detectSubject(t) {
    var out = [];
    if (/他|她|對方|某人|別人|對方/.test(t)) out.push('someone');
    if (/公司|上司|老闆|同事/.test(t)) out.push('company');
    if (/客戶|客人/.test(t)) out.push('customer');
    if (/前任|前男友|前女友|ex/.test(t)) out.push('ex');
    if (out.length === 0) out.push('me');
    return out;
  }

  function extractKeySlots(t) {
    var target = '';
    var metric = '';
    var threshold = '';
    var constraints = [];
    // 目標：收入、業績、感情、健康…
    var targetM = t.match(/(?:收入|業績|營業額|銷售|感情|健康|工作|職位|考試)(?:[的]?[能會不會]?)?/);
    if (targetM) target = targetM[0].replace(/\s/g, '');
    // 門檻／指標：破萬、比上月高、順利、復合…
    if (/破萬|破千|破百/.test(t)) {
      metric = 'threshold';
      var m = t.match(/破[萬千百\d]+/);
      if (m) threshold = m[0];
    }
    if (/比.*高|比.*好|比上月|比去年/.test(t)) {
      metric = 'compare';
      var cm = t.match(/比[上下今明去今]*[月年週]/);
      if (cm) metric = 'compare:' + cm[0];
    }
    return { target: target, metric: metric, threshold: threshold, constraints: constraints };
  }

  function extractMustAnswer(t) {
    var list = [];
    var m = t.match(/會(.+?)嗎|能(.+?)嗎|是否(.+?)(?:\?|？|$)/);
    if (m) list.push((m[1] || m[2] || m[3] || '').trim());
    var th = t.match(/破[萬千百\d]+/);
    if (th) list.push(th[0]);
    return list.filter(Boolean);
  }

  /**
   * 解析用戶問題，輸出結構化 schema
   * @param {string} text - 原始問題 (e.g. "這月收入會比上月高嗎？")
   * @returns {Object} { raw, clean, intent, askType, timeHorizon, subject, keySlots, keywords, mustAnswer, type, category, timeframe }
   */
  function parseQuestion(text) {
    var raw = (typeof text === 'string' ? text : '').trim();
    var clean = normalizeClean(raw);
    var type = TYPE_GENERAL;
    var category = CATEGORY_GENERAL;
    var timeframe = {};
    var keywords = [];

    if (!raw) {
      return buildOutput(raw, clean, 'other', 'yesno', 'unknown', ['me'], { target: '', metric: '', threshold: '', constraints: [] }, [], [], type, category, timeframe, { timeScope: 'UNKNOWN', timeScopeText: '近期' });
    }

    var t = raw;

    // 運勢綜合型
    if (/運勢|整體運|今年運|流年|大運|命盤/.test(t) && category === CATEGORY_GENERAL) {
      type = TYPE_PROBABILITY;
    }
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

    var intent = detectIntent(t);
    if (category === CATEGORY_GENERAL && INTENT_TO_CATEGORY[intent]) {
      category = INTENT_TO_CATEGORY[intent];
    }
    var askType = detectAskType(t);
    var timeHorizon = detectTimeHorizon(t, timeframe);
    var subject = detectSubject(t);
    var keySlots = extractKeySlots(t);
    var mustAnswer = extractMustAnswer(t);

    var timeScopeResult = { timeScope: 'UNKNOWN', timeScopeText: '近期' };
    if (typeof parseTimeScope === 'function') {
      timeScopeResult = parseTimeScope(raw);
      if (typeof TimeScopeParser !== 'undefined' && TimeScopeParser.resolveTimeScopeWithDefault) {
        timeScopeResult = TimeScopeParser.resolveTimeScopeWithDefault(timeScopeResult, category);
      }
    }

    return buildOutput(raw, clean, intent, askType, timeHorizon, subject, keySlots, keywords, mustAnswer, type, category, timeframe, timeScopeResult);
  }

  function buildOutput(raw, clean, intent, askType, timeHorizon, subject, keySlots, keywords, mustAnswer, type, category, timeframe, timeScopeResult) {
    timeScopeResult = timeScopeResult || { timeScope: 'UNKNOWN', timeScopeText: '近期' };
    return {
      raw: raw,
      clean: clean,
      intent: intent,
      askType: askType,
      timeHorizon: timeHorizon,
      subject: subject,
      keySlots: keySlots,
      keywords: keywords,
      mustAnswer: mustAnswer,
      type: type,
      category: category,
      timeframe: timeframe,
      timeScope: timeScopeResult.timeScope,
      timeScopeText: timeScopeResult.timeScopeText
    };
  }

  /**
   * 推論 domain（與 UI 選單一致）：category/intent → love|career|wealth|health|relationship|family|general|other
   */
  function inferDomainFromCategoryAndIntent(category, intent) {
    if (intent === 'love') return 'love';
    if (category === CATEGORY_FINANCE || intent === 'money') return 'wealth';
    if (category === CATEGORY_CAREER || intent === 'career') return 'career';
    if (category === CATEGORY_HEALTH || intent === 'health') return 'health';
    if (category === CATEGORY_FAMILY) return 'family';
    if (category === CATEGORY_RELATIONSHIP) return intent === 'love' ? 'love' : 'relationship';
    if (category === CATEGORY_GENERAL) return intent === 'other' ? 'other' : 'general';
    return 'general';
  }

  /**
   * A1) 解析並輸出 QuestionIntent schema（必存）
   * @param {string} text - 原始問題
   * @param {string} [selectedDomain] - UI 已選的 domain（權重最高，與 #question-type 的 value 一致）
   * @returns {Object} QuestionIntent { domain, time_scope, time_anchor, focus, question_type, keywords, time_scope_unspecified?, ... }
   */
  function parseQuestionIntent(text, selectedDomain) {
    var raw = (typeof text === 'string' ? text : '').trim();
    var base = parseQuestion(raw);
    var timeScopeResult = { timeScope: base.timeScope, timeScopeText: base.timeScopeText };

    if (typeof TimeScopeParser !== 'undefined' && TimeScopeParser.resolveTimeScopeWithDefault) {
      timeScopeResult = TimeScopeParser.resolveTimeScopeWithDefault(timeScopeResult, base.category);
    }
    if (typeof guardTimeScopeMismatch === 'function' && raw) {
      var guard = guardTimeScopeMismatch(raw, timeScopeResult.timeScopeText);
      if (guard) timeScopeResult = guard;
    }
    var canonicalScope = 'unspecified';
    if (typeof TimeScopeParser !== 'undefined' && TimeScopeParser.toCanonicalTimeScope) {
      canonicalScope = TimeScopeParser.toCanonicalTimeScope(timeScopeResult.timeScope);
    }
    var timeAnchor = (typeof TimeScopeParser !== 'undefined' && TimeScopeParser.parseTimeAnchor) ? TimeScopeParser.parseTimeAnchor(raw) : { year: null, month: null };

    var domain = (selectedDomain && DOMAIN_UI.indexOf(selectedDomain) >= 0) ? selectedDomain : inferDomainFromCategoryAndIntent(base.category, base.intent);
    var focusList = [];
    var fk = FOCUS_KEYWORDS[domain] || [];
    for (var i = 0; i < fk.length; i++) {
      if (raw.indexOf(fk[i]) >= 0 && focusList.indexOf(fk[i]) < 0) focusList.push(fk[i]);
    }
    var focus = focusList.length ? focusList.slice(0, 5) : [domain];

    var questionType = ASK_TYPE_TO_QUESTION_TYPE[base.askType] || 'prediction';
    var keywords = (base.keywords || []).slice(0, 15);
    while (keywords.length < 5 && (base.raw || '').length > 0) {
      var tokens = base.raw.replace(/[？?。，、\s]+/g, ' ').trim().split(/\s+/).filter(Boolean);
      for (var j = 0; j < tokens.length && keywords.length < 15; j++) {
        if (tokens[j].length >= 2 && keywords.indexOf(tokens[j]) < 0) keywords.push(tokens[j]);
      }
      break;
    }
    if (keywords.length > 15) keywords = keywords.slice(0, 15);

    var timeScopeUnspecified = (timeScopeResult.timeScope === 'UNKNOWN' || canonicalScope === 'unspecified');

    return {
      domain: domain,
      time_scope: canonicalScope,
      time_scope_raw: timeScopeResult.timeScope,
      time_scope_text: timeScopeResult.timeScopeText,
      time_anchor: timeAnchor,
      focus: focus,
      question_type: questionType,
      keywords: keywords,
      time_scope_unspecified: timeScopeUnspecified,
      raw: base.raw,
      clean: base.clean,
      intent: base.intent,
      askType: base.askType,
      category: base.category,
      timeHorizon: base.timeHorizon,
      mustAnswer: base.mustAnswer,
      keySlots: base.keySlots
    };
  }

  function getCategoryLabel(cat) {
    var m = {
      finance: '財務',
      career: '事業',
      health: '健康',
      relationship: '感情',
      family: '家庭',
      general: '綜合'
    };
    return m[cat] || cat;
  }

  /** 結構化輸出 schema 的 intent 枚舉（供融合引擎／下游對照） */
  var INTENT_VALUES = ['love', 'money', 'career', 'health', 'decision', 'timing', 'relationship', 'other'];
  var ASK_TYPE_VALUES = ['yesno', 'probability', 'timing', 'choice', 'howto', 'diagnosis'];

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      parseQuestion: parseQuestion,
      parseQuestionIntent: parseQuestionIntent,
      getCategoryLabel: getCategoryLabel,
      inferDomainFromCategoryAndIntent: inferDomainFromCategoryAndIntent,
      DOMAIN_UI: DOMAIN_UI,
      FOCUS_KEYWORDS: FOCUS_KEYWORDS,
      CATEGORY_FINANCE: CATEGORY_FINANCE,
      CATEGORY_CAREER: CATEGORY_CAREER,
      CATEGORY_HEALTH: CATEGORY_HEALTH,
      CATEGORY_RELATIONSHIP: CATEGORY_RELATIONSHIP,
      CATEGORY_GENERAL: CATEGORY_GENERAL,
      TYPE_PROBABILITY: TYPE_PROBABILITY,
      TYPE_GENERAL: TYPE_GENERAL,
      INTENT_TO_CATEGORY: INTENT_TO_CATEGORY,
      INTENT_VALUES: INTENT_VALUES,
      ASK_TYPE_VALUES: ASK_TYPE_VALUES
    };
  } else {
    global.parseQuestion = parseQuestion;
    global.parseQuestionIntent = parseQuestionIntent;
    global.getCategoryLabel = getCategoryLabel;
    global.inferDomainFromCategoryAndIntent = inferDomainFromCategoryAndIntent;
    global.DOMAIN_UI = DOMAIN_UI;
    global.QUESTION_CATEGORY = {
      FINANCE: CATEGORY_FINANCE,
      CAREER: CATEGORY_CAREER,
      HEALTH: CATEGORY_HEALTH,
      RELATIONSHIP: CATEGORY_RELATIONSHIP,
      GENERAL: CATEGORY_GENERAL
    };
    global.QUESTION_TYPE = { PROBABILITY: TYPE_PROBABILITY, GENERAL: TYPE_GENERAL };
    global.INTENT_TO_CATEGORY = INTENT_TO_CATEGORY;
    global.QUESTION_INTENT_VALUES = INTENT_VALUES;
    global.QUESTION_ASK_TYPE_VALUES = ASK_TYPE_VALUES;
  }
})(typeof window !== 'undefined' ? window : this);
