/**
 * 6) 樂透/財運路由與正面回答測試
 * 財運+「這月適合買樂透嗎」→ month + lottery + 正面回答；財運+「今年適合買威力彩嗎」→ year + lottery；
 * 財運+「這月正財收入如何」→ month + 正財（不用 lottery 模板）；健康+「這月適合買樂透嗎」UI 選健康→類別衝突提示
 */
(function (global) {
  'use strict';

  var TEST_CASES = [
    { name: '財運+這月適合買樂透嗎 → month + lottery + 正面回答', question: '這月適合買樂透嗎？', selectedDomain: 'wealth', expect: { domain: 'wealth', time_scope: 'month', lottery: true, focus_subtype: '投機' } },
    { name: '財運+今年適合買威力彩嗎 → year + lottery', question: '今年適合買威力彩嗎？', selectedDomain: 'wealth', expect: { domain: 'wealth', time_scope: 'year', lottery: true, focus_subtype: '投機' } },
    { name: '財運+這月正財收入如何 → month + 正財（非 lottery）', question: '這月正財收入如何？', selectedDomain: 'wealth', expect: { domain: 'wealth', time_scope: 'month', lottery: false, focus_subtype: '正財' } },
    { name: '健康+這月適合買樂透嗎但UI選健康 → 解析器保留 health，lottery=true（引擎會轉財運）', question: '這月適合買樂透嗎？', selectedDomain: 'health', expect: { domain: 'health', lottery: true } },
    { name: '財運+本月彩券運氣 → month + lottery', question: '本月彩券運氣好嗎？', selectedDomain: 'wealth', expect: { domain: 'wealth', time_scope: 'month', lottery: true } },
    { name: '財運+這月投資運勢（非樂透）→ 投資子類', question: '這月投資運勢如何？', selectedDomain: 'wealth', expect: { domain: 'wealth', time_scope: 'month', lottery: false, focus_subtype: '投資' } }
  ];

  function runLotteryIntentTests() {
    var parseQuestionIntent = global.parseQuestionIntent;
    var parseQuestion = global.parseQuestion;
    if (!parseQuestionIntent && parseQuestion) {
      parseQuestionIntent = function (q, d) {
        var p = parseQuestion(q);
        return { domain: d || (p.category === 'finance' ? 'wealth' : 'general'), time_scope: p.timeScope === 'MONTH' ? 'month' : (p.timeScope === 'YEAR' ? 'year' : 'unspecified'), lottery: !!p.lottery, focus_subtype: p.focus_subtype || null };
      };
    }
    if (!parseQuestionIntent) {
      return { total: TEST_CASES.length, passed: 0, failed: TEST_CASES.length, failures: [{ name: 'parseQuestionIntent 未載入', reason: 'skip' }] };
    }

    var failures = [];
    var passed = 0;
    TEST_CASES.forEach(function (tc) {
      var intent = parseQuestionIntent(tc.question, tc.selectedDomain);
      var ok = true;
      if (tc.expect.domain && intent.domain !== tc.expect.domain) {
        ok = false;
        failures.push({ name: tc.name, reason: 'domain 應為 ' + tc.expect.domain + '，得到 ' + intent.domain });
      }
      if (tc.expect.time_scope && intent.time_scope !== tc.expect.time_scope) {
        ok = false;
        failures.push({ name: tc.name, reason: 'time_scope 應為 ' + tc.expect.time_scope + '，得到 ' + intent.time_scope });
      }
      if (tc.expect.lottery !== undefined && intent.lottery !== tc.expect.lottery) {
        ok = false;
        failures.push({ name: tc.name, reason: 'lottery 應為 ' + tc.expect.lottery + '，得到 ' + intent.lottery });
      }
      if (tc.expect.focus_subtype !== undefined && intent.focus_subtype !== tc.expect.focus_subtype) {
        ok = false;
        failures.push({ name: tc.name, reason: 'focus_subtype 應為 ' + tc.expect.focus_subtype + '，得到 ' + (intent.focus_subtype || 'null') });
      }
      if (ok) passed++; else if (failures[failures.length - 1].name !== tc.name) failures.push({ name: tc.name, reason: '未通過' });
    });

    return { total: TEST_CASES.length, passed: passed, failed: failures.length, failures: failures };
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { runLotteryIntentTests: runLotteryIntentTests, TEST_CASES: TEST_CASES };
  } else {
    global.runLotteryIntentTests = runLotteryIntentTests;
    global.LOTTERY_TEST_CASES = TEST_CASES;
  }
})(typeof window !== 'undefined' ? window : this);
