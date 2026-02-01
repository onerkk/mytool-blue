/**
 * 每顆水晶專屬文案：輸入選中水晶 + 證據 + 風險標記 + 問題，輸出每顆獨立卡片
 * 跨系統證據至少 2 系統、配戴方式依 wear、注意事項依 cautions/contraindications、替代方案同 intent 較低強度
 */
(function (global) {
  'use strict';

  var HAND_LABEL = { left: '左手', right: '右手', both: '左手或右手' };
  var FORM_LABEL = { bracelet: '手鍊', necklace: '項鍊', pendant: '墜子', ring: '戒指' };
  var SCENARIO_LABEL = { work: '工作', sleep: '睡覺', meditation: '靜心', meeting: '會議', sales: '銷售' };

  /**
   * @param {Array<{crystal, scoreResult}>} selectedTop - CrystalRecommender.selectCrystals 的 top
   * @param {Array<{crystal, scoreResult}>} selectedAlt - alternatives
   * @param {Array} evidenceItems - CrystalEvidenceNormalizer 的 items
   * @param {string[]} missing - 缺失系統
   * @param {Object} parsedQuestion - parseQuestion 輸出
   * @returns {Array<{crystal, conclusion, evidenceText, wearText, cautionsText, alternatives}>}
   */
  function synthesizeCrystalCards(selectedTop, selectedAlt, evidenceItems, missing, parsedQuestion) {
    var cards = [];
    var allSelected = (selectedTop || []).concat(selectedAlt || []);
    for (var i = 0; i < (selectedTop || []).length; i++) {
      var item = selectedTop[i];
      var card = buildOneCard(item, evidenceItems, missing, allSelected, parsedQuestion);
      if (card) cards.push(card);
    }
    return cards;
  }

  function buildOneCard(item, evidenceItems, missing, allSelected, parsedQuestion) {
    var crystal = item.crystal;
    var scoreResult = item.scoreResult || {};
    var score = scoreResult.totalScore || 0;
    var matched = scoreResult.matchedEvidence || [];
    var riskFlags = scoreResult.riskFlags || [];

    var conclusionLevel = score >= 70 ? '強推' : (score >= 50 ? '可選' : '不建議');
    var conclusionReason = score >= 70 ? '與您目前命理象徵相符，可優先考慮。' : (score >= 50 ? '與部分維度相符，可視需求選戴。' : '與當前問題關聯較弱，建議作備選。');
    var conclusion = conclusionLevel + '：' + conclusionReason;

    var systemsShown = {};
    var evidenceParts = [];
    matched.forEach(function (m) {
      if (!systemsShown[m.system]) {
        systemsShown[m.system] = true;
        var sysLabel = { bazi: '八字', ziwei: '紫微斗數', meihua: '梅花易數', tarot: '塔羅', nameology: '姓名學' }[m.system] || m.system;
        evidenceParts.push(sysLabel + '（' + (m.tag || '相符') + '）');
      }
    });
    if (evidenceParts.length < 2 && missing.length > 0) evidenceParts.push('（缺' + missing.slice(0, 2).join('、') + '資料，僅供參考）');
    if (evidenceParts.length < 2) evidenceParts.push('（缺完整命理資料，僅供參考）');
    var evidenceText = evidenceParts.length >= 1 ? evidenceParts.join('；') : '（證據不足，僅供參考）';

    var wear = crystal.wear || {};
    var hand = HAND_LABEL[wear.defaultHand] || '左手或右手';
    var forms = (wear.bestForms || []).map(function (f) { return FORM_LABEL[f] || f; }).filter(Boolean);
    var dayNight = wear.dayNight || {};
    var dayOk = dayNight.day !== false;
    var nightOk = dayNight.night !== false;
    var scenarios = (wear.scenarios || []).map(function (s) { return SCENARIO_LABEL[s] || s; }).filter(Boolean);
    var wearParts = [hand + '配戴', forms.length ? forms.join('、') + '為佳' : ''];
    if (dayOk && !nightOk) wearParts.push('適合白天');
    if (nightOk && !dayOk) wearParts.push('適合晚間');
    if (dayOk && nightOk) wearParts.push('白天、晚上皆可');
    if (scenarios.length) wearParts.push(scenarios.join('、') + '時適合');
    if (riskFlags.indexOf('sleep_sensitive') >= 0) wearParts.push('睡前請取下');
    if (riskFlags.indexOf('high_intensity_low_evidence') >= 0) wearParts.push('建議短時段或搭配白水晶');
    var wearText = wearParts.filter(Boolean).join('；');

    var cautions = crystal.cautions || [];
    var cautionTexts = cautions.slice(0, 3).map(function (c) { return c.text || ''; }).filter(Boolean);
    if (cautionTexts.length < 2 && crystal.contraindications && crystal.contraindications.length) {
      crystal.contraindications.slice(0, 1).forEach(function (cx) { cautionTexts.push(cx.reason || ''); });
    }
    if (cautionTexts.length < 2) {
      if (crystal.intensity >= 4) cautionTexts.push('能量較強，初次配戴建議縮短時段。');
      if (crystal.name === '鈦晶' || crystal.name === '金髮晶') cautionTexts.push('避免戴著睡覺。');
    }
    var cautionsText = cautionTexts.slice(0, 4).filter(Boolean).join('。');

    var alternatives = [];
    var intent = (parsedQuestion && parsedQuestion.intent) ? parsedQuestion.intent : 'other';
    var lowerIntensity = allSelected.filter(function (x) {
      return x.crystal.intents && x.crystal.intents.indexOf(intent) >= 0 && (x.crystal.intensity || 3) < (crystal.intensity || 3) && x.crystal.id !== crystal.id;
    }).slice(0, 2);
    lowerIntensity.forEach(function (x) { alternatives.push(x.crystal.name); });

    return {
      crystal: crystal,
      conclusion: conclusion,
      evidenceText: evidenceText,
      wearText: wearText,
      cautionsText: cautionsText,
      alternatives: alternatives,
      conclusionLevel: conclusionLevel,
      riskFlags: riskFlags
    };
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { synthesizeCrystalCards: synthesizeCrystalCards, buildOneCard: buildOneCard };
  } else {
    global.CrystalAdviceSynthesizer = { synthesizeCrystalCards: synthesizeCrystalCards, buildOneCard: buildOneCard };
  }
})(typeof window !== 'undefined' ? window : this);
