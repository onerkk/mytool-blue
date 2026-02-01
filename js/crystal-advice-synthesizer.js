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
  function synthesizeCrystalCards(selectedTop, selectedAlt, evidenceItems, missing, parsedQuestion, baziExplain) {
    var cards = [];
    var allSelected = (selectedTop || []).concat(selectedAlt || []);
    for (var i = 0; i < (selectedTop || []).length; i++) {
      var item = selectedTop[i];
      var card = buildOneCard(item, evidenceItems, missing, allSelected, parsedQuestion, baziExplain);
      if (card) cards.push(card);
    }
    return cards;
  }

  function buildOneCard(item, evidenceItems, missing, allSelected, parsedQuestion, baziExplain) {
    var crystal = item.crystal;
    var scoreResult = item.scoreResult || {};
    var score = scoreResult.totalScore || 0;
    var matched = scoreResult.matchedEvidence || [];
    var riskFlags = scoreResult.riskFlags || [];

    var conclusionLevel = score >= 70 ? '強推' : (score >= 50 ? '可選' : '不建議');
    var conclusionReason = score >= 70 ? '與您目前命理象徵相符，可優先考慮。' : (score >= 50 ? '與部分維度相符，可視需求選戴。' : '與當前問題關聯較弱，建議作備選。');
    var conclusion = conclusionLevel + '：' + conclusionReason;

    var mingliBackground = '';
    var whyThisCrystal = '';
    var wearReason = '';
    if (baziExplain && baziExplain.text) {
      mingliBackground = '命理背景：日主 ' + (baziExplain.dayMaster || '—') + '；身強／身弱：' + (baziExplain.bodyStrength || '—') + '；喜神：' + (baziExplain.favorable || '—') + '；忌神：' + (baziExplain.unfavorable || '—') + '。';
      var elMax = null;
      var elVal = 0;
      if (crystal.elements) {
        ['木', '火', '土', '金', '水'].forEach(function (el) {
          var v = crystal.elements[el];
          if (v != null && v > elVal) { elVal = v; elMax = el; }
        });
      }
      var favStr = (baziExplain.favorable || '').toString();
      var unfavStr = (baziExplain.unfavorable || '').toString();
      var xieJiMap = { '金': '火', '木': '金', '水': '土', '火': '水', '土': '木' };
      if (elMax && favStr.indexOf(elMax) >= 0) {
        whyThisCrystal = '八字喜' + favStr + '、忌' + unfavStr + '，此顆' + (crystal.name || '') + '屬' + elMax + '性，補喜神，利於命盤喜用，因此適合本階段使用。';
      } else if (elMax && unfavStr) {
        var isXieJi = false;
        for (var ji in xieJiMap) { if (unfavStr.indexOf(ji) >= 0 && xieJiMap[ji] === elMax) { isXieJi = true; break; } }
        if (isXieJi) {
          var jiChar = unfavStr.match(/[木火土金水]/);
          whyThisCrystal = '八字忌' + (jiChar ? jiChar[0] : '') + '、喜' + favStr + '，此顆' + (crystal.name || '') + '屬' + elMax + '性，可洩過旺' + (jiChar ? jiChar[0] : '') + '氣（忌' + (jiChar ? jiChar[0] : '') + '→用' + elMax + '），穩定行動力，因此適合本階段使用。';
        } else {
          whyThisCrystal = '八字喜' + favStr + '、忌' + unfavStr + '，此顆' + (crystal.name || '') + '屬' + elMax + '性，依問題意圖與五行傾向選配。';
        }
      } else if (elMax) {
        whyThisCrystal = '八字喜' + favStr + '、忌' + unfavStr + '，此顆' + (crystal.name || '') + '屬' + elMax + '性，依問題意圖選配。';
      }
      wearReason = (crystal.wear && crystal.wear.defaultHand === 'left') ? '配戴方式為何這樣：左手為補、右手為洩；本水晶建議左手配戴以補益。' : (crystal.wear && crystal.wear.defaultHand === 'right') ? '配戴方式為何這樣：右手為洩、左手為補；本水晶建議右手配戴以洩過旺之氣。' : '配戴方式為何這樣：左手補、右手洩，依個人需求選手；' + (crystal.wear && crystal.wear.dayNight && crystal.wear.dayNight.night === false ? '不建議晚上戴（能量較強）。' : '白天晚上皆可。');
    } else {
      mingliBackground = '命理背景：未參與判斷：八字；其餘系統見跨系統證據。';
      whyThisCrystal = '為什麼選這顆：依問題意圖與五行傾向選配。';
      wearReason = '配戴方式為何這樣：左手補、右手洩；' + (crystal.wear && crystal.wear.dayNight && crystal.wear.dayNight.night === false ? '本水晶能量較強，不建議晚上戴。' : '白天晚上皆可。');
    }

    var systemsShown = {};
    var evidenceParts = [];
    matched.forEach(function (m) {
      if (!systemsShown[m.system]) {
        systemsShown[m.system] = true;
        var sysLabel = { bazi: '八字', ziwei: '紫微斗數', meihua: '梅花易數', tarot: '塔羅', nameology: '姓名學' }[m.system] || m.system;
        evidenceParts.push(sysLabel + '（' + (m.tag || '相符') + '）');
      }
    });
    if (evidenceParts.length < 2 && missing.length > 0) evidenceParts.push('（未參與判斷：' + missing.slice(0, 2).join('、') + '）');
    if (evidenceParts.length < 2) evidenceParts.push('（未參與判斷的項目見上方直接回答依據）');
    var evidenceText = evidenceParts.length >= 1 ? evidenceParts.join('；') : '（未參與判斷的項目見上方直接回答依據）';

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
    var wearText = (wearReason ? wearReason + '；' : '') + wearParts.filter(Boolean).join('；');

    var cautions = crystal.cautions || [];
    var cautionTexts = cautions.slice(0, 3).map(function (c) { return c.text || ''; }).filter(Boolean);
    if (cautionTexts.length < 2 && crystal.contraindications && crystal.contraindications.length) {
      crystal.contraindications.slice(0, 1).forEach(function (cx) { cautionTexts.push(cx.reason || ''); });
    }
    if (cautionTexts.length < 2) {
      if (crystal.intensity >= 4) cautionTexts.push('能量較強，初次配戴建議縮短時段；能量過強時可改左手或僅白天配戴。');
      if (crystal.name === '鈦晶' || crystal.name === '金髮晶') cautionTexts.push('避免戴著睡覺。');
    }
    if (crystal.intensity >= 4 && !/能量過強|過強時/.test(cautionTexts.join(''))) cautionTexts.push('能量過強時可縮短時段或搭配白水晶緩衝。');
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
      riskFlags: riskFlags,
      mingliBackground: mingliBackground,
      whyThisCrystal: whyThisCrystal
    };
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { synthesizeCrystalCards: synthesizeCrystalCards, buildOneCard: buildOneCard };
  } else {
    global.CrystalAdviceSynthesizer = { synthesizeCrystalCards: synthesizeCrystalCards, buildOneCard: buildOneCard };
  }
})(typeof window !== 'undefined' ? window : this);
