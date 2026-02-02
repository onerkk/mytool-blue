/**
 * 題型差異驗收測試：同一組八字，三種題型（愛情/事業/財運）輸出必須明顯不同
 * 要求：機率至少差 8%、Top3 因子至少 2/3 不同、3 條建議至少 2/3 不同
 * 執行：在瀏覽器 console 或 ?test=1 時可手動呼叫 runCategoryDifferenceTest()
 */
(function (global) {
  'use strict';

  var mockBazi = {
    fullData: {
      fourPillars: { year: { gan: '丙', zhi: '午' }, month: { gan: '辛', zhi: '卯' }, day: { gan: '甲', zhi: '子' }, hour: { gan: '丙', zhi: '寅' } },
      favorableElements: { favorable: ['水', '木'], unfavorable: ['土', '金'] },
      elementStrength: { bodyStrength: '身弱', composite: 42 }
    }
  };
  var mockMeihua = { benGua: { name: '乾為天', luck: '吉' }, luck: '吉' };
  var mockTarot = { analysis: { fortuneScore: 58 }, cards: [{ name: '愚者' }] };

  function runCategoryDifferenceTest() {
    if (typeof FusionEngine === 'undefined' || !FusionEngine.generateDirectAnswer) {
      console.error('[Category Test] FusionEngine.generateDirectAnswer 未載入');
      return;
    }
    var questions = [
      { question: '這月桃花如何', expectedCategory: 'love' },
      { question: '這月創業合作如何', expectedCategory: 'career' },
      { question: '這月收入投資如何', expectedCategory: 'wealth' }
    ];
    var results = [];
    questions.forEach(function (q) {
      var data = {
        bazi: mockBazi,
        meihua: mockMeihua,
        tarot: mockTarot,
        question: q.question,
        questionType: q.expectedCategory
      };
      var out = FusionEngine.generateDirectAnswer(data);
      results.push({
        question: q.question,
        category: out && out.category,
        probabilityValue: out && out.probabilityValue,
        probability: out && out.probability,
        factors: (out && out.factors) ? out.factors.slice(0, 3) : [],
        suggestions: (out && out.suggestions) ? out.suggestions.slice(0, 3) : [],
        conclusionPreview: out && out.conclusion ? out.conclusion.slice(0, 80) : ''
      });
    });

    console.group('[Category Difference Test]');
    console.log('results', results);
    var probs = results.map(function (r) { return r.probabilityValue; }).filter(function (p) { return typeof p === 'number'; });
    var probDiff = probs.length >= 2 ? Math.max.apply(null, probs) - Math.min.apply(null, probs) : 0;
    var factorNames = results.map(function (r) { return (r.factors || []).map(function (f) { return typeof f === 'string' ? f.slice(0, 20) : (f && f.name); }).join(','); });
    var suggestionTexts = results.map(function (r) { return (r.suggestions || []).join(','); });
    var factorsDifferent = factorNames[0] !== factorNames[1] || factorNames[1] !== factorNames[2] || factorNames[0] !== factorNames[2];
    var suggestionsDifferent = suggestionTexts[0] !== suggestionTexts[1] || suggestionTexts[1] !== suggestionTexts[2] || suggestionTexts[0] !== suggestionTexts[2];
    console.log('機率差異(應>=8):', probDiff, probDiff >= 8 ? '通過' : '未通過');
    console.log('Top3 因子是否不同:', factorsDifferent ? '通過' : '未通過', factorNames);
    console.log('3條建議是否不同:', suggestionsDifferent ? '通過' : '未通過', suggestionTexts);
    console.groupEnd();
    return { results: results, probDiff: probDiff, factorsDifferent: factorsDifferent, suggestionsDifferent: suggestionsDifferent };
  }

  if (typeof window !== 'undefined') {
    window.runCategoryDifferenceTest = runCategoryDifferenceTest;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { runCategoryDifferenceTest: runCategoryDifferenceTest };
  }
})(typeof window !== 'undefined' ? window : this);
