/**
 * 水晶用五術證據正規化：八字／紫微／梅花／塔羅／姓名學 → 標準 evidence items
 * 輸出：{ system, signal, direction, strength(0..1), tags:[], timeHorizon }
 * 資料不完整時可降級，證據欄位標註缺失系統
 */
(function (global) {
  'use strict';

  function clamp01(n) {
    n = Number(n);
    return Number.isFinite(n) ? Math.max(0, Math.min(1, n)) : 0.5;
  }

  /**
   * @param {Object} fusionData - { bazi, meihua, tarot, ziwei, nameology }
   * @param {Object} [parsedQuestion] - parseQuestion 輸出，含 timeHorizon
   * @returns {{ items: Array<{system, signal, direction, strength, tags, timeHorizon}>, missing: string[] }}
   */
  function normalizeCrystalEvidence(fusionData, parsedQuestion) {
    var items = [];
    var missing = [];
    var timeHorizon = (parsedQuestion && parsedQuestion.timeHorizon) || 'unknown';

    if (fusionData.bazi) {
      var baziItem = normalizeBazi(fusionData.bazi);
      if (baziItem) items.push(baziItem);
    } else missing.push('bazi');

    if (fusionData.ziwei) {
      var ziweiItem = normalizeZiwei(fusionData.ziwei, parsedQuestion);
      if (ziweiItem) items.push(ziweiItem);
    } else missing.push('ziwei');

    if (fusionData.meihua) {
      var meihuaItem = normalizeMeihua(fusionData.meihua, parsedQuestion);
      if (meihuaItem) items.push(meihuaItem);
    } else missing.push('meihua');

    if (fusionData.tarot) {
      var tarotItem = normalizeTarot(fusionData.tarot);
      if (tarotItem) items.push(tarotItem);
    } else missing.push('tarot');

    if (fusionData.nameology) {
      var nameItem = normalizeNameology(fusionData.nameology);
      if (nameItem) items.push(nameItem);
    } else missing.push('nameology');

    items.forEach(function (it) { it.timeHorizon = it.timeHorizon || timeHorizon; });
    return { items: items, missing: missing };
  }

  function normalizeBazi(bazi) {
    var raw = bazi.fullData || bazi.raw || bazi;
    var tags = [];
    var fav = (raw.favorableElements && raw.favorableElements.favorable) ? raw.favorableElements.favorable : [];
    var unfav = (raw.favorableElements && raw.favorableElements.unfavorable) ? raw.favorableElements.unfavorable : [];
    var elMap = { 木: 'wood', 火: 'fire', 土: 'earth', 金: 'metal', 水: 'water' };
    fav.forEach(function (e) { if (elMap[e]) tags.push(elMap[e] + '_favorable', 'favorable_' + elMap[e]); });
    unfav.forEach(function (e) { if (elMap[e]) tags.push(elMap[e] + '_avoid', 'avoid_' + elMap[e]); });
    var strength = (raw.elementStrength && raw.elementStrength.bodyStrength) ? (raw.elementStrength.bodyStrength === '強' ? 0.7 : 0.4) : 0.5;
    var score = Number(bazi.fortuneScore) != null ? bazi.fortuneScore / 100 : 0.5;
    var direction = score >= 0.6 ? 'favorable' : (score >= 0.4 ? 'neutral' : 'unfavorable');
    return { system: 'bazi', signal: '八字流年喜忌', direction: direction, strength: clamp01(strength), tags: tags, timeHorizon: '1_year' };
  }

  function normalizeZiwei(ziwei, parsedQuestion) {
    var tags = [];
    var palaces = ziwei.palaces || [];
    var catToPalace = { money: '財帛', wealth: '財帛', career: '官祿', love: '夫妻', health: '疾厄', relationship: '夫妻', family: '田宅', general: '命宮' };
    var intent = parsedQuestion && parsedQuestion.intent ? parsedQuestion.intent : 'general';
    var focus = catToPalace[intent] || '命宮';
    for (var i = 0; i < palaces.length; i++) {
      var p = palaces[i];
      var name = (p.name || '').toString();
      if (name === '財帛') { tags.push('wealth_palace'); if (focus === '財帛') tags.push('wealth_good'); }
      if (name === '官祿') { tags.push('career_palace'); if (focus === '官祿') tags.push('career_good'); }
      if (name === '疾厄') { tags.push('health_sensitive'); if (focus === '疾厄') tags.push('health_care'); }
      if (name === '命宮') tags.push('life_palace');
      var majors = p.majorStars || [];
      if (majors.length > 0) tags.push('has_major_stars');
    }
    if (tags.length === 0) tags.push('ziwei_general');
    return { system: 'ziwei', signal: '紫微宮位與星曜', direction: 'neutral', strength: 0.5, tags: tags, timeHorizon: '1_year' };
  }

  function normalizeMeihua(meihua, parsedQuestion) {
    var tags = [];
    var benGua = meihua.benGua || {};
    var name = (benGua.name || meihua.hexagramName || '').toString().replace(/為|卦/g, '');
    var guaToEl = { 乾: 'metal', 兌: 'metal', 離: 'fire', 震: 'wood', 巽: 'wood', 坎: 'water', 艮: 'earth', 坤: 'earth' };
    for (var k in guaToEl) { if (name.indexOf(k) >= 0) tags.push(guaToEl[k] + '_support', 'meihua_' + k); }
    var luck = (meihua.luck || benGua.luck || '平').toString();
    if (/吉/.test(luck)) tags.push('this_month_good', 'water_support');
    if (/凶/.test(luck)) tags.push('risk_spike');
    var tiYong = (meihua.tiYong && meihua.tiYong.relation) ? meihua.tiYong.relation : '';
    if (/比和|體用比和/.test(tiYong)) tags.push('meihua_balanced');
    return { system: 'meihua', signal: '卦象五行與體用', direction: /吉/.test(luck) ? 'favorable' : 'neutral', strength: /吉/.test(luck) ? 0.65 : 0.5, tags: tags, timeHorizon: 'this_month' };
  }

  function normalizeTarot(tarot) {
    var tags = [];
    var analysis = tarot.analysis || tarot;
    var positions = analysis.positions || [];
    var suitMap = { '權杖': 'Wands', '聖杯': 'Cups', '寶劍': 'Swords', '錢幣': 'Pentacles' };
    for (var i = 0; i < positions.length; i++) {
      var card = (positions[i].cardName || positions[i].card || '').toString();
      for (var s in suitMap) { if (card.indexOf(s) >= 0) tags.push(suitMap[s]); }
      if (/塔|The Tower/.test(card)) tags.push('The Tower');
      if (/死神|Death/.test(card)) tags.push('Death');
      if (/太陽|The Sun/.test(card)) tags.push('The Sun');
      if (/世界|The World/.test(card)) tags.push('The World');
      if (/十把劍|Ten of Swords/.test(card)) tags.push('Ten of Swords');
    }
    if (tags.length === 0) tags.push('tarot_general');
    var score = Number(analysis.fortuneScore) != null ? analysis.fortuneScore / 100 : 0.5;
    return { system: 'tarot', signal: '牌組與大牌', direction: score >= 0.6 ? 'favorable' : (score >= 0.4 ? 'neutral' : 'unfavorable'), strength: clamp01(score), tags: tags, timeHorizon: 'this_month' };
  }

  function normalizeNameology(nameology) {
    var tags = [];
    var analysis = nameology.analysis || nameology;
    var score = Number(analysis.score) != null ? analysis.score / 100 : 0.5;
    tags.push('nameology_score');
    if (analysis.fiveElements) {
      var el = analysis.fiveElements.dominant || '';
      var elMap = { 木: 'wood', 火: 'fire', 土: 'earth', 金: 'metal', 水: 'water' };
      if (elMap[el]) tags.push(elMap[el] + '_number');
    }
    return { system: 'nameology', signal: '人格總格與五行', direction: score >= 0.6 ? 'favorable' : 'neutral', strength: clamp01(score), tags: tags, timeHorizon: '1_year' };
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { normalizeCrystalEvidence: normalizeCrystalEvidence };
  } else {
    global.CrystalEvidenceNormalizer = { normalizeCrystalEvidence: normalizeCrystalEvidence };
  }
})(typeof window !== 'undefined' ? window : this);
