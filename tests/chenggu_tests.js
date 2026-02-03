/**
 * 稱骨基本測試：避免改動後結果漂移
 * 無需測試框架，執行後看 console 或 window.chengguTestResult
 */
(function (global) {
  'use strict';

  function assert(cond, msg) {
    if (!cond) throw new Error('[稱骨測試] ' + (msg || 'assertion failed'));
  }

  function runChengguTests() {
    var results = { passed: 0, failed: 0, errors: [] };
    function pass() { results.passed++; }
    function fail(e) { results.failed++; results.errors.push(e && e.message ? e.message : String(e)); }

    if (typeof validateChengguTables !== 'function') {
      results.errors.push('validateChengguTables 未載入');
      results.failed++;
      return results;
    }

    var val = validateChengguTables();
    try {
      assert(val.valid === true, '稱骨資料表應完整');
      pass();
    } catch (e) { fail(e); }

    if (typeof calculateChenggu !== 'function') {
      results.errors.push('calculateChenggu 未載入');
      results.failed++;
      if (typeof global !== 'undefined') global.chengguTestResult = results;
      return results;
    }

    var r1 = calculateChenggu('甲子', '寅', 1, '子');
    try {
      assert(!r1.error, '同一輸入不應報錯');
      assert(typeof r1.totalQian === 'number' && r1.totalQian >= 2.1 && r1.totalQian <= 7.2, '總重量應在 2.1～7.2');
      pass();
    } catch (e) { fail(e); }

    var r2 = calculateChenggu('甲子', '卯', 1, '子');
    try {
      assert(!r2.error, '僅月支不同不應報錯');
      assert(r1.totalQian !== r2.totalQian, '測試2：只改農曆月(月支) → 總重量必變');
      pass();
    } catch (e) { fail(e); }

    var r3 = calculateChenggu('甲子', '寅', 1, '丑');
    try {
      assert(!r3.error, '僅時辰不同不應報錯');
      assert(r1.totalQian !== r3.totalQian, '測試3：只改時辰 → 總重量必變');
      pass();
    } catch (e) { fail(e); }

    if (typeof global !== 'undefined') global.chengguTestResult = results;
    return results;
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { runChengguTests: runChengguTests };
  } else {
    global.runChengguTests = runChengguTests;
  }
})(typeof window !== 'undefined' ? window : this);
