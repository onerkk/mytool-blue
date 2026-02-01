/**
 * 水晶選品加權：scoreCrystal(crystal, evidence, parsedQuestion)
 * 八字喜忌硬規則：忌神五行絕對不推薦補該五行；洩忌神僅限 忌金→火、忌木→金、忌水→土、忌火→水、忌土→木；身弱不推高強度晶。
 */
(function (global) {
  'use strict';

  var TOP_N = 5;
  var ALTERNATIVE_N = 2;
  var INTENT_BOOST = 1.4;
  var INTENT_PENALTY = 0.5;
  var HIGH_INTENSITY_THRESHOLD = 4;
  var MIN_EVIDENCE_FOR_STRONG = 2;
  /** 洩忌神對照：忌X → 僅能推薦「克X」的五行。忌金→火、忌木→金、忌水→土、忌火→水、忌土→木 */
  var XIE_JI_MAP = { '金': '火', '木': '金', '水': '土', '火': '水', '土': '木' };

  /** 取水晶主五行（elements 中權重最高者） */
  function getPrimaryElement(crystal) {
    if (!crystal || !crystal.elements) return null;
    var el, max = 0;
    ['木', '火', '土', '金', '水'].forEach(function (e) {
      var v = crystal.elements[e];
      if (v != null && v > max) { max = v; el = e; }
    });
    return el || null;
  }

  /**
   * 八字喜忌硬規則：忌神五行 = 絕對不可推薦補該五行的水晶。身弱 = 不推 intensity>=4。
   * @returns {{ allow: boolean, reason: string }}
   */
  function checkBaziHardRule(crystal, baziExplain) {
    if (!baziExplain) return { allow: true, reason: '' };
    var primary = getPrimaryElement(crystal);
    if (!primary) return { allow: true, reason: '' };
    var unfavorableStr = (baziExplain.unfavorable || '').toString();
    var unfavorableList = [];
    unfavorableStr.replace(/[木火土金水]/g, function (m) { unfavorableList.push(m); return m; });
    for (var i = 0; i < unfavorableList.length; i++) {
      if (primary === unfavorableList[i]) {
        return { allow: false, reason: '忌' + primary + '，不可推薦補' + primary + '之水晶（' + (crystal.name || '') + '）' };
      }
    }
    var bodyStrength = (baziExplain.bodyStrength || '').toString();
    if ((bodyStrength === '身弱' || bodyStrength === '極弱') && (crystal.intensity || 0) >= HIGH_INTENSITY_THRESHOLD) {
      return { allow: false, reason: '身弱不適合高強度晶（' + (crystal.name || '') + '）' };
    }
    return { allow: true, reason: '' };
  }

  /**
   * @param {Object} crystal - CrystalsKB 單顆
   * @param {Array} evidenceItems - CrystalEvidenceNormalizer 的 items
   * @param {Object} parsedQuestion - parseQuestion 輸出
   * @param {Object} [baziExplain] - ExplainabilityLayer texts.bazi
   * @returns {{ totalScore: number, matchedEvidence: Array<{system, tag}>, riskFlags: string[], excluded: boolean, excludeReason: string }}
   */
  function scoreCrystal(crystal, evidenceItems, parsedQuestion, baziExplain) {
    var intent = (parsedQuestion && parsedQuestion.intent) ? parsedQuestion.intent : 'other';
    var matchedEvidence = [];
    var riskFlags = [];
    var score = 50;

    if (!crystal || !crystal.evidenceMap) return { totalScore: 0, matchedEvidence: [], riskFlags: ['無證據對照'], excluded: false, excludeReason: '' };

    var hardRule = checkBaziHardRule(crystal, baziExplain);
    if (!hardRule.allow) return { totalScore: 0, matchedEvidence: [], riskFlags: [], excluded: true, excludeReason: hardRule.reason };

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
    return { totalScore: score, matchedEvidence: matchedEvidence, riskFlags: riskFlags, excluded: false, excludeReason: '' };
  }

  /**
   * @param {Array} crystals - CrystalsKB 全表或子集
   * @param {Array} evidenceItems - normalizeCrystalEvidence 的 items
   * @param {Object} parsedQuestion - parseQuestion 輸出
   * @param {Object} [baziExplain] - ExplainabilityLayer texts.bazi（八字喜忌硬規則用）
   * @returns {{ top: Array<{crystal, scoreResult}>, alternatives: Array<{crystal, scoreResult}>, excluded: Array<{crystal, reason}> }}
   */
  function selectCrystals(crystals, evidenceItems, parsedQuestion, baziExplain) {
    var intent = (parsedQuestion && parsedQuestion.intent) ? parsedQuestion.intent : 'other';
    var byIntent = crystals.filter(function (c) { return c.intents && c.intents.indexOf(intent) >= 0; });
    var pool = byIntent.length >= 3 ? byIntent : crystals;
    var excluded = [];
    var scored = [];
    for (var i = 0; i < pool.length; i++) {
      var c = pool[i];
      var res = scoreCrystal(c, evidenceItems, parsedQuestion, baziExplain);
      if (res.excluded && res.excludeReason) {
        excluded.push({ crystal: c, reason: res.excludeReason });
        continue;
      }
      scored.push({ crystal: c, scoreResult: res });
    }
    scored.sort(function (a, b) { return (b.scoreResult.totalScore || 0) - (a.scoreResult.totalScore || 0); });
    var top = scored.slice(0, TOP_N);
    var rest = scored.slice(TOP_N);
    var alt = rest.slice(0, ALTERNATIVE_N);
    return { top: top, alternatives: alt, excluded: excluded };
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { scoreCrystal: scoreCrystal, selectCrystals: selectCrystals, checkBaziHardRule: checkBaziHardRule, getPrimaryElement: getPrimaryElement, TOP_N: TOP_N, ALTERNATIVE_N: ALTERNATIVE_N, XIE_JI_MAP: XIE_JI_MAP };
  } else {
    global.CrystalRecommender = { scoreCrystal: scoreCrystal, selectCrystals: selectCrystals, checkBaziHardRule: checkBaziHardRule, getPrimaryElement: getPrimaryElement, TOP_N: TOP_N, ALTERNATIVE_N: ALTERNATIVE_N, XIE_JI_MAP: XIE_JI_MAP };
  }
})(typeof window !== 'undefined' ? window : this);
