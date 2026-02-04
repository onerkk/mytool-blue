/**
 * EvidenceNormalizer：統一八字／梅花／塔羅／姓名學的輸出為 evidence items
 * 輸出格式：{ system, claim, direction, confidence, timeTags, supports, slotTags }
 * supports 需能命中 parsedQuestion.mustAnswer；timeTags 可對應 parsedQuestion.timeHorizon
 */
(function (global) {
  'use strict';

  function clamp01(n) {
    n = Number(n);
    return Number.isFinite(n) ? Math.max(0, Math.min(1, n)) : 0.5;
  }

  function normalizeEvidence(systemResult, parsedQuestion) {
    if (!parsedQuestion || typeof parsedQuestion !== 'object') parsedQuestion = {};
    var intent = parsedQuestion.intent || 'other';
    var timeHorizon = parsedQuestion.timeHorizon || 'unknown';
    var mustAnswer = Array.isArray(parsedQuestion.mustAnswer) ? parsedQuestion.mustAnswer : [];
    var keywords = Array.isArray(parsedQuestion.keywords) ? parsedQuestion.keywords : [];
    var keySlots = parsedQuestion.keySlots || { target: '', metric: '', threshold: '', constraints: [] };

    var system = systemResult.system || 'unknown';
    var items = [];

    var domain = (parsedQuestion.domain != null) ? parsedQuestion.domain : (intent === 'money' ? 'wealth' : intent);
    var timeScope = (parsedQuestion.time_scope != null) ? parsedQuestion.time_scope : (timeHorizon === '1_year' ? 'year' : timeHorizon === 'this_month' ? 'month' : 'unspecified');

    if (system === 'bazi') {
      items = normalizeBazi(systemResult, intent, timeHorizon, mustAnswer, keywords, keySlots);
    } else if (system === 'meihua') {
      items = normalizeMeihua(systemResult, intent, timeHorizon, mustAnswer, keywords, keySlots);
    } else if (system === 'tarot') {
      items = normalizeTarot(systemResult, intent, timeHorizon, mustAnswer, keywords, keySlots);
    } else if (system === 'nameology') {
      items = normalizeNameology(systemResult, intent, timeHorizon, mustAnswer, keywords, keySlots);
    }

    items.forEach(function (it) {
      it.domain = it.domain || domain;
      it.time_scope = it.time_scope || timeScope;
      it.signal = it.signal || (it.direction === 'favorable' ? 'positive' : (it.direction === 'unfavorable' ? 'negative' : 'neutral'));
      if (!it.tags && (it.slotTags || []).length) it.tags = it.slotTags.slice(0, 10);
      if (!it.tags) it.tags = [domain].concat((keywords || []).slice(0, 5));
    });
    return items;
  }

  function inferSupports(claim, mustAnswer, slotTags) {
    var supports = [];
    var text = (claim || '').toLowerCase();
    mustAnswer.forEach(function (m) {
      var s = String(m).trim();
      if (!s) return;
      if (text.indexOf(s) >= 0 || (s.length <= 4 && text.indexOf(s) >= 0)) supports.push(s);
    });
    (slotTags || []).forEach(function (tag) {
      if (mustAnswer.indexOf(tag) >= 0 && supports.indexOf(tag) < 0) supports.push(tag);
      if (text.indexOf(tag) >= 0 && supports.indexOf(tag) < 0) supports.push(tag);
    });
    return supports;
  }

  function inferTimeTagsFromHorizon(timeHorizon) {
    if (timeHorizon === 'today') return ['today'];
    if (timeHorizon === 'this_week') return ['this_week'];
    if (timeHorizon === 'this_month') return ['this_month'];
    if (timeHorizon === '3_months') return ['3_months'];
    if (timeHorizon === '6_months') return ['6_months'];
    if (timeHorizon === '1_year') return ['1_year'];
    return ['unknown'];
  }

  function normalizeBazi(data, intent, timeHorizon, mustAnswer, keywords, keySlots) {
    var items = [];
    var raw = data.fullData || data.raw || data;
    var reason = data.reason || (raw && raw.reason) || '八字流年與命盤互動';
    var score = Number(data.score) || Number(data.fortuneScore) || 50;
    var direction = score >= 60 ? 'favorable' : (score >= 40 ? 'neutral' : 'unfavorable');
    var claim = reason;
    var timeTags = inferTimeTagsFromHorizon(timeHorizon);
    var slotTags = keySlots.target ? [keySlots.target] : [];
    if (keySlots.threshold) slotTags.push(keySlots.threshold);
    var supports = inferSupports(claim, mustAnswer, slotTags);
    items.push({
      system: 'bazi',
      claim: claim,
      direction: direction,
      confidence: clamp01(score / 100),
      timeTags: timeTags,
      supports: supports,
      slotTags: slotTags
    });
    return items;
  }

  function normalizeMeihua(data, intent, timeHorizon, mustAnswer, keywords, keySlots) {
    var items = [];
    var benGua = data.benGua || {};
    var guaName = (benGua.name || data.hexagramName || data.name || '水地比').replace(/為|卦/g, '').trim();
    var intentKey = intent === 'money' ? 'wealth' : intent;
    var intentTexts = [];
    if (typeof MeihuaEvidenceData !== 'undefined' && MeihuaEvidenceData.getMeihuaIntentTexts) {
      intentTexts = MeihuaEvidenceData.getMeihuaIntentTexts(guaName, intentKey) || [];
    }
    var luck = data.luck || (benGua.luck) || data.jiXiong || '平';
    var tiYong = data.tiYong || data.tiYongRelation || '';
    var direction = /吉/.test(luck) ? 'favorable' : (/凶/.test(luck) ? 'unfavorable' : 'neutral');
    var confidenceMap = { '大吉': 0.9, '吉': 0.75, '中吉': 0.65, '小吉': 0.58, '平': 0.5, '小凶': 0.42, '凶': 0.35, '大凶': 0.2 };
    var confidence = confidenceMap[luck] != null ? confidenceMap[luck] : 0.5;

    if (intentTexts.length > 0) {
      intentTexts.forEach(function (seg) {
        var timeTags = (seg.timeTags && seg.timeTags.length) ? seg.timeTags : inferTimeTagsFromHorizon(timeHorizon);
        var slotTags = seg.slotTags || [];
        var supports = inferSupports(seg.text, mustAnswer, slotTags);
        items.push({
          system: 'meihua',
          claim: seg.text,
          direction: direction,
          confidence: confidence,
          timeTags: timeTags,
          supports: supports,
          slotTags: slotTags
        });
      });
    } else {
      var claim = '本卦' + (benGua.name || guaName) + '，' + (tiYong ? '體用：' + tiYong + '。' : '') + '吉凶：' + luck + '。';
      var timeTags = inferTimeTagsFromHorizon(timeHorizon);
      var slotTags = keySlots.target ? [keySlots.target] : [];
      if (keySlots.threshold) slotTags.push(keySlots.threshold);
      var supports = inferSupports(claim, mustAnswer, slotTags);
      items.push({
        system: 'meihua',
        claim: claim,
        direction: direction,
        confidence: confidence,
        timeTags: timeTags,
        supports: supports,
        slotTags: slotTags
      });
    }
    return items;
  }

  function normalizeTarot(data, intent, timeHorizon, mustAnswer, keywords, keySlots) {
    var items = [];
    var analysis = data.analysis || data;
    var score = Number(analysis.fortuneScore) != null ? Number(analysis.fortuneScore) : 50;
    var direction = score >= 60 ? 'favorable' : (score >= 40 ? 'neutral' : 'unfavorable');
    var summary = analysis.summary || '凱爾特十字十張牌綜合';
    var claim = summary;
    var timeTags = inferTimeTagsFromHorizon(timeHorizon);
    var slotTags = keySlots.target ? [keySlots.target] : [];
    if (keySlots.threshold) slotTags.push(keySlots.threshold);
    var supports = inferSupports(claim, mustAnswer, slotTags);
    items.push({
      system: 'tarot',
      claim: claim,
      direction: direction,
      confidence: clamp01(score / 100),
      timeTags: timeTags,
      supports: supports,
      slotTags: slotTags
    });
    return items;
  }

  function normalizeNameology(data, intent, timeHorizon, mustAnswer, keywords, keySlots) {
    var items = [];
    var analysis = data.analysis || data;
    var score = Number(analysis.score) != null ? Number(analysis.score) : 50;
    var direction = score >= 60 ? 'favorable' : (score >= 40 ? 'neutral' : 'unfavorable');
    var reason = analysis.reason || analysis.summary || '人格／總格數理與三才五行';
    var claim = reason;
    var timeTags = inferTimeTagsFromHorizon(timeHorizon);
    var slotTags = keySlots.target ? [keySlots.target] : [];
    var supports = inferSupports(claim, mustAnswer, slotTags);
    items.push({
      system: 'nameology',
      claim: claim,
      direction: direction,
      confidence: clamp01(score / 100),
      timeTags: timeTags,
      supports: supports,
      slotTags: slotTags
    });
    return items;
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { normalizeEvidence: normalizeEvidence };
  } else {
    global.EvidenceNormalizer = { normalizeEvidence: normalizeEvidence };
  }
})(typeof window !== 'undefined' ? window : this);
