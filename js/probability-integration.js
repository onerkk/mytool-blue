/**
 * 概率整合
 * 依各方法輸出之 probability、confidence，計算綜合概率與解釋。
 */
(function (global) {
  'use strict';

  function clamp01(x) {
    var n = Number(x);
    if (n !== n) return 0.5;
    return Math.max(0, Math.min(1, n));
  }

  /**
   * 整合多個方法的概率
   * @param {Array<{ method: string, probability: number, confidence: number, reasoning?: string }>} results
   * @param {Object} [opts] - { useReliability: bool, reliabilityMap: { bazi: 0.85, ... } }
   * @returns { { overall: number, breakdown: Array<{ method, probability, confidence, weight, contribution }>, explanation: string } }
   */
  function integrate(results, opts) {
    var useReliability = opts && opts.useReliability !== false;
    var reliabilityMap = (opts && opts.reliabilityMap) || {
      '八字': 0.85,
      '姓名學': 0.7,
      '梅花易數': 0.75,
      '塔羅': 0.75
    };

    var breakdown = [];
    var weightedSum = 0;
    var totalWeight = 0;
    var items = [];

    for (var i = 0; i < results.length; i++) {
      var r = results[i];
      var p = clamp01(r.probability);
      var c = clamp01(r.confidence != null ? r.confidence : 0.6);
      var rel = useReliability && reliabilityMap[r.method] != null ? reliabilityMap[r.method] : 1;
      var w = c * rel;
      weightedSum += p * w;
      totalWeight += w;
      items.push({ method: r.method, probability: p, confidence: c, weight: w, reasoning: r.reasoning || '' });
    }

    for (var j = 0; j < items.length; j++) {
      var it = items[j];
      var contrib = totalWeight > 0 ? (it.probability * it.weight) / totalWeight : 0;
      breakdown.push({
        method: it.method,
        probability: it.probability,
        confidence: it.confidence,
        weight: it.weight,
        contribution: contrib,
        reasoning: it.reasoning
      });
    }

    var overall = totalWeight > 0 ? weightedSum / totalWeight : 0.5;
    overall = clamp01(overall);

    var explanation = '綜合概率由 ' + results.length + ' 個方法加權整合（權重=置信度×方法可靠性）。';
    breakdown.forEach(function (b) {
      explanation += ' ' + b.method + '：' + (Math.round(b.probability * 100)) + '%（權重 ' + (Math.round(b.weight * 100) / 100) + '）。';
    });

    return {
      overall: overall,
      overallPercent: Math.round(overall * 100),
      breakdown: breakdown,
      explanation: explanation
    };
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { integrate: integrate };
  } else {
    global.integrateProbabilities = integrate;
  }
})(typeof window !== 'undefined' ? window : this);
