/**
 * 命理說理輸出層（Explainability Layer）
 * 直接回答依據、影響因子、水晶處方 必須由此層產出結構化說理，禁止抽象總結語。
 * 八字：日主/身強弱/喜忌神/流年作用/白話結論；紫微：宮位/主星/四化/加分扣分；
 * 梅花：本卦/體用/動爻/結論；塔羅：牌名/牌組/含義/阻礙。
 */
(function (global) {
  'use strict';

  var STEM_ELEMENT = { '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土', '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水' };
  var BRANCH_ELEMENT = { '子': '水', '丑': '土', '寅': '木', '卯': '木', '辰': '土', '巳': '火', '午': '火', '未': '土', '申': '金', '酉': '金', '戌': '土', '亥': '水' };
  var WUXING_SHENG = { '木': '火', '火': '土', '土': '金', '金': '水', '水': '木' };
  var WUXING_KE = { '木': '金', '火': '水', '土': '木', '金': '火', '水': '土' };
  var JIAZI = ['甲子', '乙丑', '丙寅', '丁卯', '戊辰', '己巳', '庚午', '辛未', '壬申', '癸酉', '甲戌', '乙亥', '丙子', '丁丑', '戊寅', '己卯', '庚辰', '辛巳', '壬午', '癸未', '甲申', '乙酉', '丙戌', '丁亥', '戊子', '己丑', '庚寅', '辛卯', '壬辰', '癸巳', '甲午', '乙未', '丙申', '丁酉', '戊戌', '己亥', '庚子', '辛丑', '壬寅', '癸卯', '甲辰', '乙巳', '丙午', '丁未', '戊申', '己酉', '庚戌', '辛亥', '壬子', '癸丑', '甲寅', '乙卯', '丙辰', '丁巳', '戊午', '己未', '庚申', '辛酉', '壬戌', '癸亥'];
  function mod60(n) { return ((n % 60) + 60) % 60; }
  function getYearGanZhi(date) {
    var d = date && date instanceof Date ? date : new Date();
    var y = d.getFullYear();
    if (typeof LiuNianCalculator !== 'undefined') {
      try { return (new LiuNianCalculator()).getYearGanZhi(y) || JIAZI[mod60(y - 4)]; } catch (e) {}
    }
    return JIAZI[mod60(y - 4)];
  }
  /** 流年五行對日主五行：生(流年生我)、剋(流年克我)、洩(我生流年)、耗(我克流年) */
  function liuNianRelation(yearEl, dayEl) {
    if (!yearEl || !dayEl) return '未定';
    if (WUXING_SHENG[yearEl] === dayEl) return '生';
    if (WUXING_KE[yearEl] === dayEl) return '剋';
    if (WUXING_SHENG[dayEl] === yearEl) return '洩';
    if (WUXING_KE[dayEl] === yearEl) return '耗';
    return '同我';
  }

  /**
   * 八字說理：必須包含 日主五行、身強/身弱、喜神、忌神、本流年五行、流年對日主作用、白話結論
   */
  function buildBaziExplainability(baziData, referenceDate) {
    if (!baziData) return null;
    var raw = baziData.fullData || baziData.raw || baziData;
    var fp = raw.fourPillars || raw.pillars || raw;
    if (!fp || !fp.day) return null;
    var dayStem = fp.day.gan || fp.day.stem || '';
    var dayEl = STEM_ELEMENT[dayStem] || '';
    var dayMasterLabel = dayStem && dayEl ? dayStem + dayEl + '（日主）' : '日主未定';
    var bodyStrength = (raw.elementStrength && raw.elementStrength.bodyStrength) || raw.strength || '';
    if (!bodyStrength && (raw.elementStrength && raw.elementStrength.composite != null)) {
      var c = raw.elementStrength.composite;
      bodyStrength = c >= 55 ? '身強' : (c >= 45 ? '中和' : (c >= 25 ? '身弱' : '極弱'));
    }
    if (!bodyStrength) bodyStrength = '未定';
    var fav = (raw.favorableElements && raw.favorableElements.favorable) || [];
    var unfav = (raw.favorableElements && raw.favorableElements.unfavorable) || [];
    if (!Array.isArray(fav)) fav = fav ? [fav] : [];
    if (!Array.isArray(unfav)) unfav = unfav ? [unfav] : [];
    var lnGz = getYearGanZhi(referenceDate);
    var lnStem = lnGz.charAt(0);
    var lnBranch = lnGz.charAt(1);
    var yearEl = STEM_ELEMENT[lnStem] || BRANCH_ELEMENT[lnBranch] || '';
    var relation = liuNianRelation(yearEl, dayEl);
    var relationText = relation === '生' ? '流年生扶日主，利補益' : relation === '剋' ? '流年剋日主，壓力較大' : relation === '洩' ? '日主洩於流年，宜保守' : relation === '耗' ? '日主耗於流年，宜節制' : relation === '同我' ? '流年與日主同類，看喜忌' : '流年與日主關係需看喜忌';
    var favStr = fav.length ? fav.join('、') : '（未取）';
    var unfavStr = unfav.length ? unfav.join('、') : '（未取）';
    var plain = bodyStrength === '身強' ? '身強可任財官，流年' + lnGz + '（' + yearEl + '）' + relationText + '；喜用' + favStr + '、忌' + unfavStr + '，問財事業看流年是否為喜用。' :
      (bodyStrength === '身弱' || bodyStrength === '極弱') ? '身弱宜借大運流年補益；流年' + lnGz + '（' + yearEl + '）' + relationText + '，喜用' + favStr + '、忌' + unfavStr + '，流年為喜用則利、為忌則宜穩守。' :
      '身強弱為' + bodyStrength + '；流年' + lnGz + '（' + yearEl + '）' + relationText + '，喜用' + favStr + '、忌' + unfavStr + '。';
    return {
      dayMaster: dayMasterLabel,
      bodyStrength: bodyStrength,
      favorable: favStr,
      unfavorable: unfavStr,
      yearGanZhi: lnGz,
      yearElement: yearEl,
      relation: relation,
      relationText: relationText,
      plainConclusion: plain,
      text: '日主：' + dayMasterLabel + '。身強／身弱：' + bodyStrength + '。喜神：' + favStr + '。忌神：' + unfavStr + '。本流年：' + lnGz + '（' + yearEl + '）。流年對日主：' + relationText + '。白話：' + plain
    };
  }

  /** 紫微說理：宮位、主星、四化祿權忌、對本問題加分/扣分 */
  function buildZiweiExplainability(ziweiData, intent) {
    if (!ziweiData || !ziweiData.palaces || !ziweiData.palaces.length) return null;
    var palaceMap = { money: '財帛', wealth: '財帛', career: '官祿', love: '夫妻', relationship: '夫妻', health: '疾厄', family: '田宅', general: '命宮' };
    var focusName = palaceMap[intent] || '命宮';
    var palace = ziweiData.palaces.filter(function (p) { return p && (p.name === focusName || p.palaceName === focusName); })[0];
    if (!palace) palace = ziweiData.palaces[0];
    var name = (palace.name || palace.palaceName || '命宮').toString();
    var majors = palace.majorStars || [];
    var starNames = majors.map(function (s) { return (s.name || s).toString(); }).filter(Boolean);
    var starDesc = starNames.length ? starNames.join('、') : '無主星';
    var fourHua = [];
    try {
      majors.forEach(function (s) {
        var h = (s.transform || s.fourTransform || s.purpleStar || {}).name || (s.purpleStar && s.purpleStar.name);
        if (h && /祿|權|科|忌/.test(h)) fourHua.push(h);
      });
    } catch (e) {}
    var fourHuaStr = fourHua.length ? fourHua.join('、') : '未取四化';
    var scoreHint = starNames.length >= 2 ? '星曜多，對本問題多為加分' : (starNames.length === 1 ? '單主星，對本問題有參考' : '無主星，對本問題中性偏保守');
    var text = '宮位：' + name + '。主星：' + starDesc + '。四化：' + fourHuaStr + '。對本問題：' + scoreHint + '。';
    return { palace: name, mainStars: starDesc, fourTransformations: fourHuaStr, impactOnQuestion: scoreHint, text: text };
  }

  /** 梅花說理：本卦卦名、體卦/用卦、體用關係、動爻是否存在、對應問題結論 */
  function buildMeihuaExplainability(meihuaData) {
    if (!meihuaData) return null;
    var ben = meihuaData.benGua || meihuaData.originalHexagram || {};
    var guaName = (ben.name || meihuaData.hexagramName || '').toString().replace(/為|卦/g, '').trim() || '—';
    var ty = meihuaData.tiYong || meihuaData.bodyUse || {};
    var relation = (ty.relation || ty.bodyUse || ty.elementAnalysis || '').toString();
    var tiPos = (ty.relationship && ty.relationship.split('為體')[0]) || (ty.tiPos || '體卦');
    var yongPos = (ty.yongPos || '用卦');
    var tiYongStr = (ty.relationship || (tiPos + '為體，' + yongPos + '為用') || '體用：' + relation).toString();
    var movingLine = meihuaData.movingLine != null ? meihuaData.movingLine : (meihuaData.benGua && meihuaData.benGua.movingLine);
    var hasMoving = movingLine != null && movingLine >= 1 && movingLine <= 6;
    var luck = (ben.luck || meihuaData.luck || '平').toString();
    var conclusion = /吉/.test(luck) ? '卦象偏吉，短期／本月有機會，宜把握' : (/凶/.test(luck) ? '卦象偏凶，短期有阻礙或條件，宜謹慎' : '卦象平，本月中性，依體用與執行力而定');
    var text = '本卦：' + guaName + '。體用：' + tiYongStr + (relation ? '（' + relation + '）' : '') + '。動爻：' + (hasMoving ? '有（第' + movingLine + '爻）' : '未取') + '。對應問題：' + conclusion + '。';
    return { hexagramName: guaName, tiYong: tiYongStr, relation: relation, hasMovingLine: hasMoving, conclusion: conclusion, text: text };
  }

  /** 塔羅說理：抽到哪張、牌組、對本問題含義、阻礙或條件 */
  function buildTarotExplainability(tarotData) {
    if (!tarotData) return null;
    var analysis = tarotData.analysis || tarotData;
    var positions = analysis.positions || [];
    if (!positions.length) {
      var cards = (tarotData.cards || []).slice(0, 10);
      if (cards.length) positions = cards.map(function (c, i) {
        var name = (c && (c.name || c.card)) || (typeof c === 'string' ? c : '') || ('第' + (i + 1) + '張');
        return { card: name, orientation: (c && c.isReversed) ? '逆位' : '正位', meaning: (c && c.meaning) || '', suit: (c && c.suit) || 'major' };
      });
    }
    if (!positions.length) return null;
    var suitName = { cups: '聖杯', pentacles: '金幣', wands: '權杖', swords: '寶劍', major: '大牌' };
    var parts = [];
    var obstacles = [];
    positions.slice(0, 5).forEach(function (p, idx) {
      var card = (p.card && (typeof p.card === 'string' ? p.card : p.card.name || p.card.cardId)) || p.cardName || ('第' + (idx + 1) + '張');
      var orient = (p.orientation || (p.isReversed ? '逆位' : '正位')).toString();
      var suit = suitName[p.suit] || (p.suit && p.suit !== 'major' ? p.suit : '大牌');
      var meaning = (p.meaning || '').toString();
      parts.push(card + orient + '（' + suit + '）');
      if (meaning && (/阻|礙|難|慎|不宜|注意/.test(meaning) || (idx <= 2 && meaning.length > 4))) obstacles.push(meaning.slice(0, 30));
    });
    var cardSummary = parts.length ? parts.join('；') : '未列出牌張';
    var firstMeaning = positions.length && (positions[0].meaning || '').toString();
    var meaningSummary = firstMeaning ? '核心位：' + firstMeaning.slice(0, 50) + (obstacles.length ? '；阻礙或條件：' + obstacles.slice(0, 2).join('、') : '') : '依凱爾特十字十張牌綜合解讀，對本問題有吉有凶，需看具體牌義與位置';
    var text = '抽到：' + cardSummary + '。牌組已標於括號。對本問題：' + meaningSummary + '。';
    return { cardsSummary: cardSummary, meaningSummary: meaningSummary, obstacles: obstacles, text: text };
  }

  /** 姓名學說理：只要 nameology 存在即視為已參與，不得顯示「未加入」；影響較輕時用「姓名學影響較輕，作為輔助參考」 */
  function buildNameologyExplainability(nameologyData) {
    if (nameologyData == null || nameologyData === undefined) return null;
    var a = nameologyData.analysis || nameologyData;
    var person = (a && (a.personalityStrokes != null ? a.personalityStrokes : a.person)) || '';
    var total = (a && (a.totalStrokes != null ? a.totalStrokes : a.total)) || '';
    var reason = (a && (a.reason || a.summary || '')).toString();
    if (reason && reason.length > 2) {
      return { text: reason };
    }
    if (person || total) return { text: '人格與總格有助行動力，對本問題屬加分。' };
    return { text: '姓名學影響較輕，作為輔助參考。' };
  }

  /**
   * 直接回答：結論一句（能/不能、偏高/偏低、有機會但條件）+ 原因一句（白話，不堆術語）。
   * 命理術語（身強身弱、喜忌神、體用、四化）僅放「展開詳解」，不得塞進直接回答。
   */
  function buildDirectAnswerPlain(baziExplain, probVal, intent, questionSummary) {
    if (!baziExplain || !baziExplain.bodyStrength) {
      return '直接回答：整體機率約 ' + Math.round(Number(probVal) || 50) + '%，建議綜合各維度後行動。';
    }
    var probPct = Math.round(Number(probVal) || 50);
    var bodyStrength = (baziExplain.bodyStrength || '').toString();
    var relationText = (baziExplain.relationText || '').toString();
    var reason = '';
    var conclusion = '';
    if (bodyStrength === '身弱' || bodyStrength === '極弱') {
      if (relationText.indexOf('剋') >= 0 || relationText.indexOf('壓力') >= 0) {
        reason = '今年運勢對你壓力較大、助力有限';
        conclusion = probPct >= 50 ? '有機會但不穩定，宜小步試、勿大舉投入。' : '不適合高強度衝刺，宜保守。';
      } else if (relationText.indexOf('生') >= 0) {
        reason = '今年運勢對你有助益';
        conclusion = '有機會，可把握時機、穩健進行。';
      } else {
        reason = '今年運勢對你尚可，但有利條件不算多';
        conclusion = probPct >= 50 ? '有機會但需條件配合。' : '宜穩守、勿過度擴張。';
      }
    } else if (bodyStrength === '身強') {
      reason = '今年運勢可承擔較多、有發揮空間';
      conclusion = probPct >= 50 ? '有機會達標，可積極布局。' : '宜評估風險再行動。';
    } else {
      reason = '今年運勢整體' + (relationText.indexOf('生') >= 0 ? '對你有助益' : relationText.indexOf('剋') >= 0 ? '壓力較大' : '尚可');
      conclusion = probPct >= 55 ? '有機會，宜把握。' : (probPct >= 45 ? '中性偏可行，需條件配合。' : '偏有阻力，宜保守。');
    }
    return '直接回答：' + conclusion + ' 原因：' + reason + '。（整體機率約 ' + probPct + '%）';
  }

  /**
   * 影響因子：每術數 1 句「說人話」，說清楚對本問題的作用。禁止只寫「有參考價值」「顯示機會」。
   */
  function buildFactorSentences(texts) {
    var out = [];
    if (texts.bazi) {
      var b = texts.bazi;
      var fav = (b.favorable || '').replace(/[（未取）\s]/g, '') || '—';
      var unfav = (b.unfavorable || '').replace(/[（未取）\s]/g, '') || '—';
      out.push('八字：日主' + (b.bodyStrength === '身弱' || b.bodyStrength === '極弱' ? '偏弱' : b.bodyStrength === '身強' ? '身強' : b.bodyStrength) + '，喜' + fav + '、忌' + unfav + '，今年流年' + (b.yearElement || '') + '，' + (b.relationText || '') + '。');
    }
    if (texts.ziwei) {
      var z = texts.ziwei;
      out.push('紫微：' + (z.palace || '') + '宮' + (z.mainStars || '') + '，' + (z.impactOnQuestion || '對本問題有參考') + '。');
    }
    if (texts.meihua) {
      var m = texts.meihua;
      out.push('梅花：本卦' + (m.hexagramName || '') + '，' + (m.relation || '') + '，' + (m.conclusion || '') + '。');
    }
    if (texts.tarot) {
      var t = texts.tarot;
      out.push('塔羅：' + (t.meaningSummary || t.cardsSummary || '') + '。');
    }
    if (texts.nameology) {
      out.push('姓名學：' + (texts.nameology.text || '影響較輕，作為輔助參考') + '。');
    }
    return out;
  }

  /**
   * 彙總各系統說理，產出「直接回答依據」用 evidenceList 與 missing
   * 姓名學：只要 fusionData.nameology 存在即視為已參與，不得顯示未加入。
   */
  function buildAll(fusionData, parsedQuestion) {
    var refDate = (parsedQuestion && parsedQuestion.referenceDate) || new Date();
    var intent = (parsedQuestion && parsedQuestion.intent) || 'other';
    var missing = [];
    var texts = {};
    var evidenceListForDisplay = [];

    if (fusionData.bazi && (fusionData.bazi.fullData || fusionData.bazi.raw || fusionData.bazi.fourPillars)) {
      var baziEx = buildBaziExplainability(fusionData.bazi, refDate);
      if (baziEx && baziEx.text) { texts.bazi = baziEx; evidenceListForDisplay.push('八字：' + baziEx.text); }
    } else missing.push('八字');
    if (fusionData.ziwei && fusionData.ziwei.palaces && fusionData.ziwei.palaces.length) {
      var ziweiEx = buildZiweiExplainability(fusionData.ziwei, intent);
      if (ziweiEx && ziweiEx.text) { texts.ziwei = ziweiEx; evidenceListForDisplay.push('紫微斗數：' + ziweiEx.text); }
    } else missing.push('紫微斗數');
    if (fusionData.meihua && (fusionData.meihua.benGua || fusionData.meihua.originalHexagram)) {
      var meihuaEx = buildMeihuaExplainability(fusionData.meihua);
      if (meihuaEx && meihuaEx.text) { texts.meihua = meihuaEx; evidenceListForDisplay.push('梅花易數：' + meihuaEx.text); }
    } else missing.push('梅花易數');
    /* 塔羅：只要抽牌已完成且結果物件存在即視為已參與；缺資料時才顯示缺哪一段 */
    var tarotParticipated = false;
    if (fusionData.tarot && typeof fusionData.tarot === 'object') {
      var cards = fusionData.tarot.cards;
      var analysis = fusionData.tarot.analysis || fusionData.tarot;
      var hasCards = Array.isArray(cards) && cards.length > 0;
      var hasAnalysis = analysis && (Array.isArray(analysis.positions) && analysis.positions.length > 0 || analysis.overall != null || analysis.overallProbability != null || analysis.fortuneScore != null);
      tarotParticipated = hasCards || hasAnalysis;
    }
    if (tarotParticipated) {
      var tarotEx = buildTarotExplainability(fusionData.tarot);
      if (tarotEx && tarotEx.text) {
        texts.tarot = tarotEx;
        evidenceListForDisplay.push('塔羅：' + tarotEx.text);
      } else {
        evidenceListForDisplay.push('塔羅：抽牌已完成，詳解載入中。');
      }
    } else {
      missing.push('塔羅');
    }
    if (fusionData.nameology != null && fusionData.nameology !== undefined) {
      var nameEx = buildNameologyExplainability(fusionData.nameology);
      var nameText = (nameEx && nameEx.text) ? nameEx.text : '姓名學影響較輕，作為輔助參考。';
      texts.nameology = { text: nameText };
      evidenceListForDisplay.push('姓名學：' + nameText);
    } else missing.push('姓名學');

    if (missing.length > 0) {
      evidenceListForDisplay.push('未參與判斷的項目：' + missing.join('、') + '（若已輸入請重新執行該步驟）');
    }
    var factorSentences = buildFactorSentences(texts);
    return { texts: texts, missing: missing, evidenceListForDisplay: evidenceListForDisplay, factorSentences: factorSentences };
  }

  var api = {
    buildBaziExplainability: buildBaziExplainability,
    buildZiweiExplainability: buildZiweiExplainability,
    buildMeihuaExplainability: buildMeihuaExplainability,
    buildTarotExplainability: buildTarotExplainability,
    buildNameologyExplainability: buildNameologyExplainability,
    buildDirectAnswerPlain: buildDirectAnswerPlain,
    buildFactorSentences: buildFactorSentences,
    buildAll: buildAll
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else global.ExplainabilityLayer = api;
})(typeof window !== 'undefined' ? window : this);
