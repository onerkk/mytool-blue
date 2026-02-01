/**
 * 水晶建議配置測試：至少 15 題（財運/感情/健康/事業/決策/時機）
 * 每題檢查：跨系統證據>=2 或缺失標註、注意事項至少 2 點且非模板、不得跨 intent 禁止詞
 * 使用方式：index.html?test=crystal 或 Console 執行 runCrystalRecommendationTests()
 */
(function (global) {
  'use strict';

  var TEST_QUESTIONS = [
    '副業營收能否破萬？',
    '本月訂單是否比上月高？',
    '這月銷售能破萬嗎？',
    '感情能否復合？',
    '今年我健康需要注意嗎？',
    '工作升遷有機會嗎？',
    '該不該離職？',
    '何時適合轉職？',
    '投資會不會賺？',
    '面試會不會上？',
    '今年財運如何？',
    '感情發展順利嗎？',
    '健康狀況要注意什麼？',
    '家人關係會改善嗎？',
    '什麼時候有桃花？',
    '副業這月銷售能破萬嗎？',
    '本月業績能達標嗎？'
  ];

  var FORBIDDEN_BY_INTENT = {
    money: ['桃花', '復合', '曖昧', '姻緣', '告白', '戀愛', '正緣'],
    love: ['破萬', '營收', '業績', '訂單', '銷售', '投資', '財運'],
    career: ['桃花', '復合'],
    health: ['破萬', '營收', '桃花', '復合'],
    other: []
  };

  function runCrystalRecommendationTests() {
    var parseQuestion = global.parseQuestion;
    var getCrystalRecommendationCards = global.getCrystalRecommendationCards;
    var CrystalsKB = global.CrystalsKB;
    var CrystalEvidenceNormalizer = global.CrystalEvidenceNormalizer;
    var CrystalRecommender = global.CrystalRecommender;
    var CrystalAdviceSynthesizer = global.CrystalAdviceSynthesizer;

    if (!getCrystalRecommendationCards || !CrystalsKB) {
      if (typeof console !== 'undefined') console.error('crystal_recommendation_tests: getCrystalRecommendationCards 或 CrystalsKB 未載入');
      return { total: TEST_QUESTIONS.length, passed: 0, failed: TEST_QUESTIONS.length, failures: [], error: '模組未載入' };
    }

    var passed = 0;
    var failed = 0;
    var failures = [];

    for (var i = 0; i < TEST_QUESTIONS.length; i++) {
      var q = TEST_QUESTIONS[i];
      var parsed = parseQuestion ? parseQuestion(q) : { intent: 'other' };
      var fusionData = { bazi: {}, meihua: {}, tarot: {}, ziwei: {}, nameology: {} };
      var cardResult = getCrystalRecommendationCards(null, q, fusionData);
      var reasons = [];

      if (!cardResult || !cardResult.cards || cardResult.cards.length === 0) {
        reasons.push('無卡片輸出');
        failed++;
        failures.push({ q: q, reason: reasons.join('; '), output: '' });
        continue;
      }

      var intent = (parsed.intent || 'other').toLowerCase();
      var forbidden = FORBIDDEN_BY_INTENT[intent] || FORBIDDEN_BY_INTENT.other || [];
      var crossHit = false;
      cardResult.cards.forEach(function (card) {
        var text = (card.conclusion || '') + (card.evidenceText || '') + (card.wearText || '') + (card.cautionsText || '');
        forbidden.forEach(function (w) { if (text.indexOf(w) >= 0) crossHit = true; });
      });
      if (crossHit) {
        reasons.push('文案含跨 intent 禁止詞');
        failed++;
        failures.push({ q: q, reason: reasons.join('; '), output: cardResult.cards[0] ? cardResult.cards[0].crystal.name : '' });
        continue;
      }

      var evidenceOk = true;
      var cautionsOk = true;
      var templateOk = true;
      var wearTexts = [];
      var cautionTexts = [];
      var systemNameRe = /八字|紫微|梅花|塔羅|姓名學|梅花易數/g;
      for (var c = 0; c < cardResult.cards.length; c++) {
        var card = cardResult.cards[c];
        var ev = (card.evidenceText || '').trim();
        var systemCount = (ev.match(systemNameRe) || []).length;
        if (!ev || (ev.indexOf('缺') < 0 && systemCount < 2)) evidenceOk = false;
        var cautions = (card.cautionsText || '').trim();
        var cautionPoints = cautions.split(/[。；;]/).filter(function (s) { return s.trim().length > 2; });
        if (!cautions || cautionPoints.length < 2) cautionsOk = false;
        wearTexts.push(card.wearText || '');
        cautionTexts.push(card.cautionsText || '');
      }
      var sameWear = 0, sameCaution = 0;
      for (var a = 0; a < wearTexts.length; a++) {
        for (var b = a + 1; b < wearTexts.length; b++) {
          if (wearTexts[a] === wearTexts[b] && wearTexts[a].length > 10) sameWear++;
          if (cautionTexts[a] === cautionTexts[b] && cautionTexts[a].length > 10) sameCaution++;
        }
      }
      var pairs = (cardResult.cards.length * (cardResult.cards.length - 1)) / 2;
      if (pairs > 0 && (sameWear + sameCaution) / (pairs * 2) >= 0.7) templateOk = false;

      if (!evidenceOk) reasons.push('跨系統證據不足或未標註缺失');
      if (!cautionsOk) reasons.push('注意事項不足 2 點');
      if (!templateOk) reasons.push('配戴/注意事項模板化');

      if (reasons.length > 0) {
        failed++;
        failures.push({ q: q, reason: reasons.join('; '), output: cardResult.cards[0] ? cardResult.cards[0].crystal.name : '' });
      } else {
        passed++;
      }
    }

    var total = TEST_QUESTIONS.length;
    var out = { total: total, passed: passed, failed: failed, failures: failures };

    if (typeof console !== 'undefined') {
      console.log('水晶建議測試 通過 ' + passed + ' / ' + total + (failed ? '　失敗 ' + failed + ' 題' : ''));
      if (failures.length > 0) {
        var show = failures.slice(0, 5);
        console.log('失敗清單（前 ' + show.length + ' 題）:');
        show.forEach(function (f, idx) { console.log('  ' + (idx + 1) + '. ' + f.q + ' => ' + f.reason); });
      }
    }

    return out;
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { runCrystalRecommendationTests: runCrystalRecommendationTests, TEST_QUESTIONS: TEST_QUESTIONS };
  } else {
    global.runCrystalRecommendationTests = runCrystalRecommendationTests;
    global.CRYSTAL_RECOMMENDATION_TEST_QUESTIONS = TEST_QUESTIONS;
  }
})(typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : this);
