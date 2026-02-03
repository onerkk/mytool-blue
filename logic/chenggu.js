/**
 * 袁天罡稱骨：一律使用農曆年月日 + 時辰
 * 資料表來自 auxiliary-data.js（CHENGGU_YEAR/MONTH/DAY/HOUR/POEMS）
 * 缺表時明確提示，不亂算。
 */
(function (global) {
  'use strict';

  var YEAR_WEIGHT = (typeof CHENGGU_YEAR !== 'undefined' && CHENGGU_YEAR) ? CHENGGU_YEAR : null;
  var MONTH_WEIGHT = (typeof CHENGGU_MONTH !== 'undefined' && CHENGGU_MONTH) ? CHENGGU_MONTH : null;
  var DAY_WEIGHT = (typeof CHENGGU_DAY !== 'undefined' && CHENGGU_DAY) ? CHENGGU_DAY : null;
  var HOUR_WEIGHT = (typeof CHENGGU_HOUR !== 'undefined' && CHENGGU_HOUR) ? CHENGGU_HOUR : null;
  var POEMS = (typeof CHENGGU_POEMS !== 'undefined' && CHENGGU_POEMS) ? CHENGGU_POEMS : null;

  var ZHI_12 = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

  /**
   * 驗證稱骨資料表是否完整；缺則回傳 { valid: false, missing: string[] }
   */
  function validateChengguTables() {
    var missing = [];
    if (!YEAR_WEIGHT || typeof YEAR_WEIGHT !== 'object') missing.push('YEAR');
    else {
      var yearKeys = Object.keys(YEAR_WEIGHT).length;
      if (yearKeys < 60) missing.push('YEAR(不足60干支)');
    }
    if (!MONTH_WEIGHT || typeof MONTH_WEIGHT !== 'object') missing.push('MONTH');
    else {
      for (var i = 0; i < ZHI_12.length; i++) {
        if (MONTH_WEIGHT[ZHI_12[i]] == null) { missing.push('MONTH(缺' + ZHI_12[i] + ')'); break; }
      }
    }
    if (!DAY_WEIGHT || !Array.isArray(DAY_WEIGHT)) missing.push('DAY');
    else if (DAY_WEIGHT.length < 31) missing.push('DAY(不足1-30日)');
    if (!HOUR_WEIGHT || typeof HOUR_WEIGHT !== 'object') missing.push('HOUR');
    else {
      for (var j = 0; j < ZHI_12.length; j++) {
        if (HOUR_WEIGHT[ZHI_12[j]] == null) { missing.push('HOUR(缺' + ZHI_12[j] + ')'); break; }
      }
    }
    if (!POEMS || typeof POEMS !== 'object') missing.push('POEMS');
    return missing.length ? { valid: false, missing: missing } : { valid: true, missing: [] };
  }

  /**
   * 從公曆日期取得農曆日（1-30）
   * 依賴 lunar-javascript：Lunar.fromDate 或 Solar.fromDate().getLunar()
   */
  function getLunarDayFromDate(birthDate) {
    var d = birthDate instanceof Date ? birthDate : (birthDate ? new Date(birthDate) : null);
    if (!d || isNaN(d.getTime())) return null;
    try {
      var LunarObj = (typeof Lunar !== 'undefined' && Lunar) ? Lunar : (typeof window !== 'undefined' && window.Lunar) ? window.Lunar : null;
      if (LunarObj && typeof LunarObj.fromDate === 'function') {
        var lunar = LunarObj.fromDate(d);
        var day = lunar.getDay && lunar.getDay();
        if (typeof day === 'number' && day >= 1 && day <= 30) return day;
      }
      if (typeof Solar !== 'undefined' && Solar && Solar.fromDate) {
        var solar = Solar.fromDate(d);
        if (solar.getLunar) {
          var lun = solar.getLunar();
          var dy = lun.getDay && lun.getDay();
          if (typeof dy === 'number' && dy >= 1 && dy <= 30) return dy;
        }
      }
    } catch (e) {}
    return null;
  }

  /**
   * 稱骨計算：農曆年月日 + 時辰（月、時用干支地支）
   * @param {string} yearGanZhi - 年干支如 "甲子"
   * @param {string} monthZhi - 月支如 "寅"
   * @param {number} lunarDay - 農曆日 1-30
   * @param {string} hourZhi - 時支如 "子"
   * @returns {{ totalQian: number, liang: number, qian: number, poemKey: number, poemText: string } | { error: string }}
   */
  function calculateChenggu(yearGanZhi, monthZhi, lunarDay, hourZhi) {
    var val = validateChengguTables();
    if (!val.valid) {
      return { error: '稱骨資料表缺失：' + (val.missing.join('、')) + '，無法計算。' };
    }
    var yw = YEAR_WEIGHT[yearGanZhi];
    var mw = MONTH_WEIGHT[monthZhi];
    var dw = DAY_WEIGHT[lunarDay - 1];
    var hw = HOUR_WEIGHT[hourZhi];
    if (yw == null) return { error: '稱骨資料表缺失：年干支「' + yearGanZhi + '」無對應重量。' };
    if (mw == null) return { error: '稱骨資料表缺失：月支「' + monthZhi + '」無對應重量。' };
    if (dw == null) return { error: '稱骨資料表缺失：農曆日「' + lunarDay + '」無對應重量。' };
    if (hw == null) return { error: '稱骨資料表缺失：時辰「' + hourZhi + '」無對應重量。' };
    var total = Math.round((yw + mw + dw + hw) * 10) / 10;
    if (total < 2.1) total = 2.1;
    if (total > 7.2) total = 7.2;
    var poemKey = Math.floor(total * 10) / 10;
    var poemText = (typeof getChengguPoem === 'function') ? getChengguPoem(total) : (POEMS[poemKey] || '');
    var liang = Math.floor(total);
    var qian = Math.round((total - liang) * 10);
    return { totalQian: total, liang: liang, qian: qian, poemKey: poemKey, poemText: poemText };
  }

  /**
   * 由公曆出生日 + 四柱（取年干支、月支、時支）計算稱骨；日使用農曆日
   * @param {Date|string} birthDate - 公曆出生日期時間
   * @param {{ year: { gan, zhi }, month: { zhi }, hour: { zhi } }} fourPillars - 四柱（至少年、月、時）
   * @returns {{ display: string, comment: string, total: number } | { error: string }}
   */
  function calculateChengguFromSolar(birthDate, fourPillars) {
    var lunarDay = getLunarDayFromDate(birthDate);
    if (lunarDay == null) return { error: '稱骨需農曆日，無法從出生日轉換農曆。' };
    var yearGanZhi = (fourPillars.year && fourPillars.year.gan && fourPillars.year.zhi) ? (fourPillars.year.gan + fourPillars.year.zhi) : '';
    var monthZhi = (fourPillars.month && fourPillars.month.zhi) ? fourPillars.month.zhi : '';
    var hourZhi = (fourPillars.hour && fourPillars.hour.zhi) ? fourPillars.hour.zhi : '';
    if (!yearGanZhi || !monthZhi || !hourZhi) return { error: '稱骨需年干支、月支、時辰，四柱不完整。' };
    var out = calculateChenggu(yearGanZhi, monthZhi, lunarDay, hourZhi);
    if (out.error) return out;
    return {
      display: out.totalQian.toFixed(1) + '兩',
      comment: out.poemText,
      total: out.totalQian
    };
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      validateChengguTables: validateChengguTables,
      getLunarDayFromDate: getLunarDayFromDate,
      calculateChenggu: calculateChenggu,
      calculateChengguFromSolar: calculateChengguFromSolar
    };
  } else {
    global.validateChengguTables = validateChengguTables;
    global.getLunarDayFromDate = getLunarDayFromDate;
    global.calculateChenggu = calculateChenggu;
    global.calculateChengguFromSolar = calculateChengguFromSolar;
    global.Chenggu = {
      validateChengguTables: validateChengguTables,
      getLunarDayFromDate: getLunarDayFromDate,
      calculateChenggu: calculateChenggu,
      calculateChengguFromSolar: calculateChengguFromSolar
    };
  }
})(typeof window !== 'undefined' ? window : this);
