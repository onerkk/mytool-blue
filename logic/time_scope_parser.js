/**
 * 時間範圍解析器：從問題文字解析出 timeScope 枚舉與顯示用 timeScopeText
 * 問題含「今年/今年度/本年度」→ 任何情境都不得顯示「本月」
 * 供直接回答、結論模板、證據選取統一使用。
 */
(function (global) {
  'use strict';

  /** 嚴格枚舉：與模板一致，禁止寫死本月/今年 */
  var TIME_SCOPE = {
    YEAR: 'YEAR',           // 今年 / 今年度 / 本年度
    MONTH: 'MONTH',        // 本月 / 這個月
    QUARTER: 'QUARTER',    // 最近三個月 / 本季
    HALF_YEAR: 'HALF_YEAR', // 半年 / 上半年/下半年
    NEXT_YEAR: 'NEXT_YEAR', // 明年 / 明年度
    UNKNOWN: 'UNKNOWN'
  };

  /** timeScope → 顯示文字（唯一來源，禁止在模板寫死） */
  var TIME_SCOPE_TEXT = {};
  TIME_SCOPE_TEXT[TIME_SCOPE.YEAR] = '今年';
  TIME_SCOPE_TEXT[TIME_SCOPE.MONTH] = '本月';
  TIME_SCOPE_TEXT[TIME_SCOPE.QUARTER] = '近三個月';
  TIME_SCOPE_TEXT[TIME_SCOPE.HALF_YEAR] = '半年內';
  TIME_SCOPE_TEXT[TIME_SCOPE.NEXT_YEAR] = '明年';
  TIME_SCOPE_TEXT[TIME_SCOPE.UNKNOWN] = '近期';

  /**
   * 解析規則：正則 + 權重，先匹配年度再月份
   * 衝突：同時出現「今年」與「本月」時，若句中有「今年度/年度/整體」→ 強制 YEAR；否則 YEAR > MONTH
   */
  function parseTimeScope(questionText) {
    var q = String(questionText || '').trim();
    var scope = TIME_SCOPE.UNKNOWN;
    var hasYear = /今年度|本年度|今年/.test(q);
    var hasMonth = /本月|這個月|當月|本月份/.test(q);
    var hasQuarter = /本季|這一季|最近三個月|三個月/.test(q);
    var hasHalfYear = /半年|六個月|上半年|下半年/.test(q);
    var hasNextYear = /明年|明年度|明年整體/.test(q);
    var hasAnnualHint = /今年度|本年度|年度|整體/.test(q);

    if (hasNextYear) scope = TIME_SCOPE.NEXT_YEAR;
    else if (hasHalfYear) scope = TIME_SCOPE.HALF_YEAR;
    else if (hasQuarter) scope = TIME_SCOPE.QUARTER;
    else if (hasYear && hasMonth) {
      scope = hasAnnualHint ? TIME_SCOPE.YEAR : TIME_SCOPE.YEAR;
    } else if (hasYear) scope = TIME_SCOPE.YEAR;
    else if (hasMonth) scope = TIME_SCOPE.MONTH;

    var timeScopeText = TIME_SCOPE_TEXT[scope] || TIME_SCOPE_TEXT[TIME_SCOPE.UNKNOWN];
    return { timeScope: scope, timeScopeText: timeScopeText };
  }

  /**
   * 依 timeScope 與分類給預設：UNKNOWN 時，運勢（綜合）→ YEAR，其餘可 MONTH
   */
  function resolveTimeScopeWithDefault(parseResult, questionCategory) {
    var scope = (parseResult && parseResult.timeScope) ? parseResult.timeScope : TIME_SCOPE.UNKNOWN;
    var text = (parseResult && parseResult.timeScopeText) ? parseResult.timeScopeText : TIME_SCOPE_TEXT[TIME_SCOPE.UNKNOWN];
    if (scope !== TIME_SCOPE.UNKNOWN) {
      return { timeScope: scope, timeScopeText: text };
    }
    var cat = String(questionCategory || 'general').toLowerCase();
    if (cat === 'general') {
      return { timeScope: TIME_SCOPE.YEAR, timeScopeText: TIME_SCOPE_TEXT[TIME_SCOPE.YEAR] };
    }
    return { timeScope: TIME_SCOPE.MONTH, timeScopeText: TIME_SCOPE_TEXT[TIME_SCOPE.MONTH] };
  }

  /**
   * 防呆：問題含「今年|今年度|本年度」但結果用了「本月」→ 視為 bug，回傳應使用的 scope
   */
  function guardTimeScopeMismatch(questionText, timeScopeText) {
    var q = String(questionText || '');
    var hasAnnual = /今年|今年度|本年度/.test(q);
    var usedMonth = /本月/.test(String(timeScopeText || ''));
    if (hasAnnual && usedMonth && typeof console !== 'undefined') {
      console.warn('[TimeScope] 問題含今年/今年度/本年度，但結果用了「本月」，已 fallback 為今年');
      return { timeScope: TIME_SCOPE.YEAR, timeScopeText: TIME_SCOPE_TEXT[TIME_SCOPE.YEAR] };
    }
    return null;
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      TIME_SCOPE: TIME_SCOPE,
      TIME_SCOPE_TEXT: TIME_SCOPE_TEXT,
      parseTimeScope: parseTimeScope,
      resolveTimeScopeWithDefault: resolveTimeScopeWithDefault,
      guardTimeScopeMismatch: guardTimeScopeMismatch
    };
  } else {
    global.parseTimeScope = parseTimeScope;
    global.guardTimeScopeMismatch = guardTimeScopeMismatch;
    global.TimeScopeParser = {
      TIME_SCOPE: TIME_SCOPE,
      TIME_SCOPE_TEXT: TIME_SCOPE_TEXT,
      parseTimeScope: parseTimeScope,
      resolveTimeScopeWithDefault: resolveTimeScopeWithDefault,
      guardTimeScopeMismatch: guardTimeScopeMismatch
    };
  }
})(typeof window !== 'undefined' ? window : this);
