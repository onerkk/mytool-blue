/**
 * 水晶選品加權：scoreCrystal(crystal, evidence, parsedQuestion)
 * 依問題意圖提升/降權、強度控管、輸出 Top N + 2 備選
 */
(function (global) {
  'use strict';

  var TOP_N = 5;
  var ALTERNATIVE_N = 2;
  var INTENT_BOOST = 1.4;
  var INTENT_PENALTY = 0.5;
  var HIGH_INTENSITY_THRESHOLD = 4;
  var MIN_EVIDENCE_FOR_STRONG = 2;

  /**
   * @param {Object} crystal - CrystalsKB 單顆
   * @param {Array} evidenceItems - CrystalEvidenceNormalizer 的 items
   * @param {Object} parsedQuestion - parseQuestion 輸出
   * @returns {{ totalScore: number, matchedEvidence: Array<{system, tag}>, riskFlags: string[] }}
   */
  function scoreCrystal(crystal, evidenceItems, parsedQuestion) {
    var intent = (parsedQuestion && parsedQuestion.intent) ? parsedQuestion.intent : 'other';
    var matchedEvidence = [];
    var riskFlags = [];
    var score = 50;

    if (!crystal || !crystal.evidenceMap) return { totalScore: 0, matchedEvidence: [], riskFlags: ['無證據對照'] };

    var intentMatch = crystal.intents && crystal.intents.indexOf(intent) >= 0;
    if (intentMatch) score *= INTENT_BOOST;
    else if (crystal.intents && (crystal.intents.indexOf('love') >= 0 || crystal.intents.indexOf('relationship') >= 0) && intent === 'money') score *= INTENT_PENALTY;
    else if (crystal.intents && crystal.intents.indexOf('health') >= 0 && intent === 'money') score *= INTENT_PENALTY;

    var systems = ['bazi', 'ziwei', 'meihua', 'tarot', 'nameology'];
    for (var s = 0; s < systems.length; s++) {
      var sys = systems[s];
      var evList = evidenceItems.filter(function (e) { return e.system === sys; });
      var em = crystal.evidenceMap[sys];
      if (!em) continue;
      for (var i = 0; i < evList.length; i++) {
        var tags = evList[i].tags || [];
        var boost = em.boost || [];
        var avoid = em.avoid || [];
        for (var t = 0; t < tags.length; t++) {
          if (boost.indexOf(tags[t]) >= 0 || boost.some(function (b) { return tags[t].indexOf(b) >= 0 || b.indexOf(tags[t]) >= 0; })) {
            score += 12;
            matchedEvidence.push({ system: sys, tag: tags[t] });
          }
          if (avoid.indexOf(tags[t]) >= 0 || avoid.some(function (a) { return tags[t].indexOf(a) >= 0; })) {
            score -= 15;
            riskFlags.push(sys + '_avoid');
          }
        }
      }
    }

    var intensity = crystal.intensity || 3;
    if (intensity >= HIGH_INTENSITY_THRESHOLD && matchedEvidence.length < MIN_EVIDENCE_FOR_STRONG) {
      score *= 0.7;
      riskFlags.push('high_intensity_low_evidence');
    }
    if (crystal.cautions && crystal.cautions.some(function (c) { return c.tag === 'sleep_sensitive'; })) riskFlags.push('sleep_sensitive');
    if (crystal.cautions && crystal.cautions.some(function (c) { return c.tag === 'anxiety_prone'; })) riskFlags.push('anxiety_prone');

    score = Math.max(0, Math.min(100, Math.round(score)));
    return { totalScore: score, matchedEvidence: matchedEvidence, riskFlags: riskFlags };
  }

  /**
   * @param {Array} crystals - CrystalsKB 全表或子集
   * @param {Array} evidenceItems - normalizeCrystalEvidence 的 items
   * @param {Object} parsedQuestion - parseQuestion 輸出
   * @returns {{ top: Array<{crystal, scoreResult}>, alternatives: Array<{crystal, scoreResult}> }}
   */
  function selectCrystals(crystals, evidenceItems, parsedQuestion) {
    var intent = (parsedQuestion && parsedQuestion.intent) ? parsedQuestion.intent : 'other';
    var byIntent = crystals.filter(function (c) { return c.intents && c.intents.indexOf(intent) >= 0; });
    var pool = byIntent.length >= 3 ? byIntent : crystals;
    var scored = pool.map(function (c) {
      var res = scoreCrystal(c, evidenceItems, parsedQuestion);
      return { crystal: c, scoreResult: res };
    });
    scored.sort(function (a, b) { return (b.scoreResult.totalScore || 0) - (a.scoreResult.totalScore || 0); });
    var top = scored.slice(0, TOP_N);
    var rest = scored.slice(TOP_N);
    var alt = rest.slice(0, ALTERNATIVE_N);
    return { top: top, alternatives: alt };
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { scoreCrystal: scoreCrystal, selectCrystals: selectCrystals, TOP_N: TOP_N, ALTERNATIVE_N: ALTERNATIVE_N };
  } else {
    global.CrystalRecommender = { scoreCrystal: scoreCrystal, selectCrystals: selectCrystals, TOP_N: TOP_N, ALTERNATIVE_N: ALTERNATIVE_N };
  }
})(typeof window !== 'undefined' ? window : this);
