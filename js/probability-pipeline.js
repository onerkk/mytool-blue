/**
 * 概率流程編排
 * 問題輸入 → 問題解析 → 方法選擇 → 平行分析 → 概率整合 → 結果輸出
 */
(function (global) {
  'use strict';

  var parseQuestion = global.parseQuestion || function () { return { type: 'general', category: 'general', raw: '' }; };
  var selectMethods = global.selectMethods || function () { return { bazi: true, nameology: true, meihua: true, tarot: true }; };
  var integrate = global.integrateProbabilities || function (r) { return { overall: 0.5, overallPercent: 50, breakdown: [], explanation: '' }; };

  var Bazi = global.BaziProbabilityCalculator;
  var Name = global.NameologyProbabilityCalculator;
  var Meihua = global.PlumBlossomProbabilityCalculator;
  var Tarot = global.CelticCrossProbabilityCalculator;

  /**
   * 執行完整流程
   * @param {string} questionText - 用戶問題
   * @param {Object} context - { birth_datetime, gender, name, birthYear?, cards?, useSolarTime?, longitude? }
   * @returns {Object} { parsed, selected, results, integrated, output }
   */
  function run(questionText, context) {
    var parsed = parseQuestion(questionText);
    var selected = selectMethods(parsed);
    var question = { type: parsed.type, category: parsed.category, raw: parsed.raw, timeframe: parsed.timeframe, keywords: parsed.keywords };

    var results = [];
    var ctx = context || {};

    if (selected.bazi && Bazi && (ctx.birth_datetime || ctx.birthDate)) {
      try {
        var b = new Bazi();
        var br = b.analyze(question, ctx);
        br.method = '八字';
        results.push(br);
      } catch (e) {
        results.push({ method: '八字', probability: 0.5, confidence: 0, reasoning: '八字分析出錯', rawResult: null });
      }
    }

    if (selected.nameology && Name && (ctx.name || ctx.fullName)) {
      try {
        var n = new Name();
        var nr = n.analyze(question, ctx);
        nr.method = '姓名學';
        results.push(nr);
      } catch (e) {
        results.push({ method: '姓名學', probability: 0.5, confidence: 0, reasoning: '姓名學分析出錯', rawResult: null });
      }
    }

    if (selected.meihua && Meihua) {
      try {
        var m = new Meihua();
        var mr = m.analyze(question, ctx);
        mr.method = '梅花易數';
        results.push(mr);
      } catch (e) {
        results.push({ method: '梅花易數', probability: 0.5, confidence: 0, reasoning: '梅花易數分析出錯', rawResult: null });
      }
    }

    if (selected.tarot && Tarot && ctx.cards && ctx.cards.length >= 10) {
      try {
        var t = new Tarot();
        var tr = t.analyze(question, ctx);
        tr.method = '塔羅';
        results.push(tr);
      } catch (e) {
        results.push({ method: '塔羅', probability: 0.5, confidence: 0, reasoning: '塔羅分析出錯', rawResult: null });
      }
    }

    var integrated = integrate(results, {
      useReliability: true,
      reliabilityMap: { '八字': 0.85, '姓名學': 0.7, '梅花易數': 0.75, '塔羅': 0.75 }
    });

    var output = {
      question: questionText,
      category: parsed.category,
      overallProbability: integrated.overall,
      overallPercent: integrated.overallPercent,
      breakdown: integrated.breakdown,
      explanation: integrated.explanation,
      raw: { parsed: parsed, selected: selected, results: results }
    };

    return {
      parsed: parsed,
      selected: selected,
      results: results,
      integrated: integrated,
      output: output
    };
  }

  /**
   * 從頁面表單與現有分析結果組 context，執行 pipeline
   * @returns {Object} run() 的返回值，或 null
   */
  function runFromPage() {
    if (typeof document === 'undefined') return null;
    var qEl = document.getElementById('question');
    var q = (qEl && qEl.value) ? qEl.value.trim() : '';
    var nameEl = document.getElementById('name');
    var name = (nameEl && nameEl.value) ? nameEl.value.trim() : '';
    var dateEl = document.getElementById('birth-date');
    var timeEl = document.getElementById('birth-time');
    var birth = '';
    if (dateEl && dateEl.value) {
      birth = timeEl && timeEl.value ? dateEl.value + 'T' + timeEl.value + ':00' : dateEl.value + 'T12:00:00';
    }
    var gSel = document.querySelector('input[name="gender"]:checked');
    var gender = (gSel && gSel.value) ? gSel.value : 'male';
    var year = dateEl && dateEl.value ? parseInt(dateEl.value.slice(0, 4), 10) : null;

    var cards = [];
    try {
      if (typeof TarotModule !== 'undefined' && TarotModule.drawnCards && TarotModule.drawnCards.length) {
        cards = TarotModule.drawnCards.map(function (c) {
          return { id: c.id, name: c.name, isReversed: !!c.isReversed, meaning: c.meaning || (c.upright || '') };
        });
      }
    } catch (e) {}

    var ctx = {
      birth_datetime: birth || undefined,
      birthDate: birth || undefined,
      gender: gender,
      name: name,
      fullName: name,
      birthYear: year,
      cards: cards.length ? cards : undefined,
      useSolarTime: true,
      longitude: 120.2
    };
    return run(q, ctx);
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { run: run, runFromPage: runFromPage };
  } else {
    global.runProbabilityPipeline = run;
    global.runProbabilityPipelineFromPage = runFromPage;
  }
})(typeof window !== 'undefined' ? window : this);
