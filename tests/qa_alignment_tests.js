/**
 * QA 對齊測試：至少 20 條問題
 * 每條檢查：alignmentCheck 通過、askType 必要輸出存在、不得出現跨 intent 關鍵詞
 * 使用方式：在瀏覽器載入完整頁面後，於 Console 執行 runQAAlignmentTests()
 * 或於 index.html 加上 ?test=1 並在頁尾載入本腳本
 */
(function (global) {
  'use strict';

  var TEST_QUESTIONS = [
    '副業營收能否破萬？',
    '本月訂單是否比上月高？',
    '這月銷售能破萬嗎？',
    '副業這月營業額可以破萬嗎？',
    '今年我健康需要注意嗎？',
    '本月整體運勢如何？',
    '感情能否復合？',
    '會加薪嗎？',
    '能錄取嗎？',
    '投資會不會賺？',
    '工作升遷有機會嗎？',
    '面試會不會上？',
    '本月業績能達標嗎？',
    '手鍊本月能否賣出？',
    '自製作品這月能賣掉嗎？',
    '今年財運如何？',
    '何時適合轉職？',
    '感情發展順利嗎？',
    '健康狀況要注意什麼？',
    '副業這月銷售能破萬嗎？',
    '本月收入會比上月高嗎？',
    '該不該離職？',
    '什麼時候有桃花？',
    '家人關係會改善嗎？'
  ];

  var CROSS_INTENT_KEYWORDS = {
    money: ['感情', '桃花', '復合', '姻緣', '健康', '病', '手術'],
    love: ['破萬', '營收', '業績', '訂單', '銷售', '投資', '財運'],
    career: ['破萬', '桃花', '復合', '健康', '病'],
    health: ['破萬', '營收', '感情', '桃花', '復合', '業績'],
    relationship: ['破萬', '營收', '業績'],
    decision: [],
    timing: [],
    other: []
  };

  function runQAAlignmentTests() {
    var parseQuestion = (typeof global.parseQuestion === 'function') ? global.parseQuestion : null;
    var AlignmentGuard = global.AlignmentGuard;
    var AnswerSynthesizer = global.AnswerSynthesizer;

    if (!parseQuestion) {
      if (typeof console !== 'undefined') console.warn('qa_alignment_tests: parseQuestion 未載入，跳過解析檢查');
    }
    if (!AlignmentGuard || !AlignmentGuard.alignmentCheck) {
      if (typeof console !== 'undefined') console.error('qa_alignment_tests: AlignmentGuard 未載入');
      var errResult = { total: TEST_QUESTIONS.length, passed: 0, failed: TEST_QUESTIONS.length, failures: [], error: 'AlignmentGuard 未載入' };
      if (typeof console !== 'undefined') console.log('通過 0 / ' + TEST_QUESTIONS.length);
      return errResult;
    }

    var results = [];
    var failures = [];
    var passed = 0;
    var failed = 0;

    TEST_QUESTIONS.forEach(function (question, idx) {
      var parsed = parseQuestion ? parseQuestion(question) : { raw: question, mustAnswer: [], askType: 'yesno', intent: 'other' };
      var selectionResult = { sufficient: true, selected: [{ system: 'meihua', claim: '本卦水地比，體用比和。本月營收有機會達標。', supports: parsed.mustAnswer && parsed.mustAnswer.length ? parsed.mustAnswer : ['本月'], slotTags: ['營收', '破萬'], timeTags: ['this_month'] }] };
      var probResult = { probabilityValue: 55, probability: '55%' };
      var fullText = '';
      if (AnswerSynthesizer && AnswerSynthesizer.synthesize) {
        var syn = AnswerSynthesizer.synthesize(parsed, selectionResult, probResult, {});
        fullText = syn.fullText || '';
      } else {
        fullText = '您問的是：「' + question + '」。直接回答：偏向能。（整體機率約 55%）\n依據：\nmeihua：本卦水地比，體用比和。本月營收有機會達標。';
      }

      var guard = AlignmentGuard.alignmentCheck(parsed, fullText);
      var finalText = guard.passed ? fullText : (guard.rewritten || fullText);
      var checkAgain = AlignmentGuard.alignmentCheck(parsed, finalText);

      var askTypeOk = true;
      var askType = (parsed.askType || 'yesno').toLowerCase();
      if (askType === 'yesno' && !/偏向能|偏向不能|有機會|阻力較大|不能|機率|%/.test(finalText)) askTypeOk = false;
      if (askType === 'probability' && !/\d+%|機率|百分比/.test(finalText)) askTypeOk = false;
      if (askType === 'timing' && !/本週|本月|今日|今年|時機|近期|時間/.test(finalText)) askTypeOk = false;

      var intent = (parsed.intent || 'other').toLowerCase();
      var forbidden = CROSS_INTENT_KEYWORDS[intent] || CROSS_INTENT_KEYWORDS.other || [];
      var crossKeyword = forbidden.filter(function (k) { return finalText.indexOf(k) >= 0; });
      var noCross = crossKeyword.length === 0;

      var itemPassed = checkAgain.passed && askTypeOk && noCross;
      if (itemPassed) passed++; else failed++;

      var reasonParts = [];
      if (!checkAgain.passed) {
        if (checkAgain.missingMustAnswer && checkAgain.missingMustAnswer.length) reasonParts.push('mustAnswer 缺: ' + checkAgain.missingMustAnswer.join(','));
        if (checkAgain.missingAskType) reasonParts.push(checkAgain.missingAskType);
        if (checkAgain.forbiddenHit) reasonParts.push('命中禁止詞');
      }
      if (!askTypeOk) reasonParts.push('askType 必要輸出缺失');
      if (!noCross) reasonParts.push('跨 intent 關鍵詞: ' + crossKeyword.join(','));

      var rec = {
        idx: idx + 1,
        question: question,
        passed: itemPassed,
        alignmentPassed: checkAgain.passed,
        coverage: checkAgain.coverage,
        missingMustAnswer: checkAgain.missingMustAnswer,
        missingAskType: checkAgain.missingAskType,
        askTypeOk: askTypeOk,
        noCrossIntent: noCross,
        crossKeyword: crossKeyword,
        intent: intent
      };
      results.push(rec);

      if (!itemPassed) {
        failures.push({
          q: question,
          reason: reasonParts.length ? reasonParts.join('; ') : '未通過對齊檢查',
          output: (finalText || '').substring(0, 200)
        });
      }
    });

    var total = TEST_QUESTIONS.length;
    var out = { total: total, passed: passed, failed: failed, failures: failures, results: results };

    if (typeof console !== 'undefined') {
      console.log('通過 ' + passed + ' / ' + total + (failed ? '　失敗 ' + failed + ' 題' : ''));
      if (failures.length > 0) {
        var show = failures.slice(0, 5);
        console.log('失敗清單（前 ' + show.length + ' 題）:');
        show.forEach(function (f, i) {
          console.log('  ' + (i + 1) + '. ' + f.q + ' => ' + f.reason);
        });
      }
    }

    return out;
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { runQAAlignmentTests: runQAAlignmentTests, TEST_QUESTIONS: TEST_QUESTIONS };
  } else {
    global.runQAAlignmentTests = runQAAlignmentTests;
    global.QA_ALIGNMENT_TEST_QUESTIONS = TEST_QUESTIONS;
  }
})(typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : this);
