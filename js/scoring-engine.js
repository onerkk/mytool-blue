/**
 * ScoringEngine - 依問題類別（事業/感情/財富/健康）的脈絡評分引擎
 * 輸入：八字、梅花易數、塔羅、姓名學資料 + 問題類別
 * 輸出：各系統 { score, reason }，加權彙總與摘要報告
 */
(function (global) {
  'use strict';

  var CATEGORY_WEALTH = 'finance';
  var CATEGORY_CAREER = 'career';
  var CATEGORY_LOVE = 'relationship';
  var CATEGORY_HEALTH = 'health';
  var CATEGORY_GENERAL = 'general';

  /** 問題類別對應的十神重點（事業=官殺，財富=財，感情=官/財依性別，健康=五行平衡） */
  var BAZI_CATEGORY_TEN_GODS = {
    finance: { primary: ['正財', '偏財'], label: '財運' },
    career: { primary: ['正官', '七殺'], label: '事業' },
    relationship: { primary: ['正官', '七殺', '正財', '偏財'], label: '感情' },
    health: { primary: [], label: '健康' },
    general: { primary: [], label: '綜合' }
  };

  /** 梅花易數：卦象/吉凶依類別的權重（可後續擴充具體卦象） */
  var MEIHUA_LUCK_SCORE = {
    '大吉': 85, '吉': 65, '中吉': 70, '小吉': 60,
    '平': 50,
    '小凶': 40, '凶': 35, '中凶': 30, '大凶': 15
  };

  /** 梅花易數：依問題類別的卦象加分/減分（placeholder，可後續填具體卦名） */
  var MEIHUA_GUA_BY_CATEGORY = {
    finance: { favorable: ['乾', '坤', '大有', '泰'], unfavorable: ['否', '剝'] },
    career: { favorable: ['乾', '晉', '升', '大有'], unfavorable: ['困', '坎'] },
    relationship: { favorable: ['咸', '恆', '家人', '泰'], unfavorable: ['睽', '革'] },
    health: { favorable: ['復', '頤', '無妄'], unfavorable: ['剝', '姤'] },
    general: { favorable: [], unfavorable: [] }
  };

  /** 塔羅：依問題類別的牌義權重（placeholder：牌名/編號可後續填） */
  var TAROT_CARD_BY_CATEGORY = {
    finance: { positive: ['pentacles', 'wheel', 'sun', 'star'], negative: ['tower', 'devil', 'five'] },
    career: { positive: ['chariot', 'emperor', 'sun', 'world'], negative: ['tower', 'hanged', 'five'] },
    relationship: { positive: ['lovers', 'two', 'ten', 'star', 'sun'], negative: ['tower', 'three', 'five', 'swords'] },
    health: { positive: ['strength', 'sun', 'star', 'world'], negative: ['tower', 'death', 'devil'] },
    general: { positive: [], negative: [] }
  };

  /** 姓名學：問題類別對應的五行喜用（與八字喜用對應時加分） */
  var NAME_ELEMENT_BY_CATEGORY = {
    finance: ['土', '金'],
    career: ['火', '土'],
    relationship: ['水', '金'],
    health: ['木', '水'],
    general: []
  };

  function clamp(x, lo, hi) {
    var n = Number(x);
    if (n !== n) return lo;
    return Math.max(lo, Math.min(hi, n));
  }

  function clamp0_100(x) { return Math.round(clamp(x, 0, 100)); }

  /**
   * 從問題文字或 category 取得類別
   * @param {string} questionText
   * @param {string} [category]
   */
  function getCategory(questionText, category) {
    if (category && BAZI_CATEGORY_TEN_GODS[category]) return category;
    if (typeof parseQuestion !== 'undefined') {
      var parsed = parseQuestion(questionText || '');
      return parsed.category || CATEGORY_GENERAL;
    }
    return CATEGORY_GENERAL;
  }

  /**
   * 收集八字四柱+藏干中所有十神名稱
   */
  function collectTenGodsFromBazi(bazi) {
    var list = [];
    var raw = bazi && (bazi.raw || bazi);
    var tg = (raw && raw.tenGods) || (bazi && bazi.tenGods) || {};
    var pillars = ['year', 'month', 'day', 'hour'];
    pillars.forEach(function (p) {
      var stem = tg[p + 'Stem'] || tg[p] && tg[p].stem;
      if (stem && stem !== '日主' && stem !== '未知') list.push(stem);
      var branch = tg[p + 'Branch'] || tg[p] && tg[p].branch;
      if (Array.isArray(branch)) branch.forEach(function (s) { if (s && s !== '未知') list.push(s); });
    });
    return list;
  }

  /**
   * 八字：依問題類別以十神強弱評分
   * @param {Object} baziData - 八字結果（含 tenGods, elementStrength, favorableElements）
   * @param {string} category
   * @returns { { score: number, reason: string } }
   */
  function calculateBaziScore(baziData, category) {
    var out = { score: 50, reason: '八字資料不足，以中性分數呈現。' };
    if (!baziData) return out;

    var cat = BAZI_CATEGORY_TEN_GODS[category] || BAZI_CATEGORY_TEN_GODS.general;
    var allGods = collectTenGodsFromBazi(baziData);
    var raw = baziData.raw || baziData;
    var elementStrength = raw.elementStrength || baziData.elementStrength || {};
    var bodyStrength = (elementStrength.bodyStrength || raw.strength || '').toString();
    var favorable = (raw.favorableElements && raw.favorableElements.favorable) || baziData.favorable || [];
    var unfavorable = (raw.favorableElements && raw.favorableElements.unfavorable) || baziData.unfavorable || [];

    var score = 50;
    var reasonParts = [];

    if (cat.primary && cat.primary.length > 0) {
      var count = 0;
      cat.primary.forEach(function (god) {
        allGods.forEach(function (g) { if (g === god) count++; });
      });
      if (count > 0) {
        score += Math.min(count * 8, 25);
        reasonParts.push('命盤中與' + cat.label + '相關的十神（' + cat.primary.join('、') + '）出現，有利該類問題。');
      } else {
        score -= 5;
        reasonParts.push('命盤中與' + cat.label + '相關的十神較少，該類機率偏中性。');
      }
    } else {
      reasonParts.push('以整體五行與身強弱評估。');
    }

    if (/強|中和/.test(bodyStrength)) {
      score += 5;
      reasonParts.push('日主身強或中和，利於承擔壓力與把握機會。');
    } else if (/弱|極弱/.test(bodyStrength)) {
      score -= 5;
      reasonParts.push('日主偏弱，該類事務需多借助大運流年。');
    }

    if (favorable.length) reasonParts.push('喜用神：' + favorable.join('、') + '。');
    out.score = clamp0_100(score);
    out.reason = '八字評分 ' + out.score + '：' + reasonParts.join(' ');
    return out;
  }

  /**
   * 梅花易數：本卦吉凶 + 體用 + 依類別卦象（placeholder）
   * @param {Object} meihuaData - 梅花結果（benGua, tiYong）
   * @param {string} category
   * @returns { { score: number, reason: string } }
   */
  function calculateMeihuaScore(meihuaData, category) {
    var out = { score: 50, reason: '梅花易數資料不足。' };
    if (!meihuaData) return out;

    var ben = meihuaData.benGua || meihuaData.originalHexagram || {};
    var luck = (ben.luck || '平').toString();
    var guaName = (ben.name || '').toString();
    var score = MEIHUA_LUCK_SCORE[luck] != null ? MEIHUA_LUCK_SCORE[luck] : 50;

    var ty = meihuaData.tiYong || meihuaData.tiYongRelation || {};
    var bodyUse = (ty.relation || ty.bodyUse || '').toString();
    if (/體用比和|比和/.test(bodyUse)) score += 8;
    else if (/用生體|生體/.test(bodyUse)) score += 6;
    else if (/體生用/.test(bodyUse)) score += 2;
    else if (/用剋體|用克體|剋體|克體/.test(bodyUse)) score -= 8;
    else if (/體剋用|體克用/.test(bodyUse)) score -= 2;

    var catMap = MEIHUA_GUA_BY_CATEGORY[category] || MEIHUA_GUA_BY_CATEGORY.general;
    if (catMap.favorable.length && guaName && catMap.favorable.some(function (g) { return guaName.indexOf(g) >= 0; })) score += 5;
    if (catMap.unfavorable.length && guaName && catMap.unfavorable.some(function (g) { return guaName.indexOf(g) >= 0; })) score -= 5;

    out.score = clamp0_100(score);
    out.reason = '梅花易數評分 ' + out.score + '：本卦「' + (guaName || '—') + '」' + luck + '，體用「' + (bodyUse || '—') + '」，對應此問題類別得出上述機率。';
    return out;
  }

  /**
   * 塔羅：牌陣加權 + 依類別牌義（placeholder）
   * @param {Object} tarotData - 塔羅結果（cards, analysis.fortuneScore）
   * @param {string} category
   * @returns { { score: number, reason: string } }
   */
  function calculateTarotScore(tarotData, category) {
    var out = { score: 50, reason: '塔羅資料不足，請先完成凱爾特十字抽牌。' };
    var cards = (tarotData && tarotData.cards) || (tarotData && tarotData.analysis && tarotData.analysis.positions && tarotData.analysis.positions.map(function (p) { return p.card || p; })) || [];
    if (!cards.length) return out;

    var analysis = tarotData.analysis || tarotData;
    if (analysis.fortuneScore != null && Number.isFinite(Number(analysis.fortuneScore))) {
      var fs = clamp0_100(Number(analysis.fortuneScore));
      out.score = fs;
      out.reason = '塔羅評分 ' + out.score + '：依凱爾特十字十張牌解讀量化，對應此問題得出上述機率。';
      return out;
    }

    var weights = [0.15, 0.12, 0.10, 0.08, 0.14, 0.12, 0.09, 0.09, 0.06, 0.15];
    var sum = 0, wSum = 0;
    for (var i = 0; i < Math.min(cards.length, 10); i++) {
      var c = cards[i];
      var meaning = (c.meaning || c.upright || '').toString();
      var rev = !!c.isReversed;
      var s = 50;
      if (/成功|順利|機會|成長|進展|祝福|喜悅|收穫|圓滿|希望|突破|穩定|和諧/.test(meaning)) s += 15;
      if (/阻礙|延遲|失敗|衝突|破裂|焦慮|損失|混亂|背離|欺騙|停滯|消耗|壓力|風險|分離|挫折/.test(meaning)) s -= 15;
      if (rev) s = 100 - s;
      sum += (weights[i] || 0.1) * s;
      wSum += (weights[i] || 0.1);
    }
    var base = wSum > 0 ? sum / wSum : 50;
    out.score = clamp0_100(base);
    out.reason = '塔羅評分 ' + out.score + '：依牌陣加權與牌義解讀，對應此問題類別得出上述機率。';
    return out;
  }

  /**
   * 姓名學：五格/三才與問題類別的五行對應
   * @param {Object} nameData - 姓名學結果（fivePatterns, overallScore）
   * @param {string} category
   * @returns { { score: number, reason: string } }
   */
  function calculateNameScore(nameData, category) {
    var out = { score: 50, reason: '姓名學資料不足。' };
    if (!nameData) return out;

    var fp = nameData.fivePatterns || nameData.fivePattern || {};
    var totalScore = nameData.overallScore != null ? Number(nameData.overallScore) : (fp.total && fp.total.score);
    if (Number.isFinite(totalScore)) {
      var s = clamp0_100(totalScore);
      out.score = s;
    }

    var catElements = NAME_ELEMENT_BY_CATEGORY[category] || NAME_ELEMENT_BY_CATEGORY.general;
    var reasonParts = ['姓名學評分 ' + out.score + '：'];
    if (fp.person != null || fp.total != null) {
      reasonParts.push('人格' + (fp.person != null ? fp.person.number : '—') + '、總格' + (fp.total != null ? fp.total.number : '—'));
    }
    if (catElements.length) reasonParts.push('；此問題類別與五行' + catElements.join('、') + '相關，姓名若補益該類則有利。');
    out.reason = reasonParts.join('') + '。';
    return out;
  }

  /**
   * 依系統與類別計算單一系統分數
   * @param {string} system - 'bazi' | 'meihua' | 'tarot' | 'name'
   * @param {Object} data - 該系統的原始結果
   * @param {string} category
   * @returns { { score: number, reason: string } }
   */
  function calculateCategoryScore(system, data, category) {
    var cat = category || CATEGORY_GENERAL;
    switch (system) {
      case 'bazi':
        return calculateBaziScore(data, cat);
      case 'meihua':
        return calculateMeihuaScore(data, cat);
      case 'tarot':
        return calculateTarotScore(data, cat);
      case 'name':
        return calculateNameScore(data, cat);
      default:
        return { score: 50, reason: '未支援的系統。' };
    }
  }

  /** 各系統權重（與 probability-integration 一致） */
  var DEFAULT_WEIGHTS = { '八字': 0.85, '姓名學': 0.7, '梅花易數': 0.75, '塔羅': 0.75 };

  /**
   * 彙總各系統分數為加權平均與摘要
   * @param {Array<{ method: string, score: number, reason: string }>} breakdown
   * @param {Object} [weights]
   * @returns { { overall: number, overallPercent: number, breakdown: Array, summary: string } }
   */
  function aggregateScores(breakdown, weights) {
    var wMap = weights || DEFAULT_WEIGHTS;
    var totalWeight = 0;
    var weightedSum = 0;
    var list = [];

    breakdown.forEach(function (b) {
      var w = wMap[b.method] != null ? wMap[b.method] : 0.75;
      totalWeight += w;
      weightedSum += (b.score / 100) * w;
      list.push({
        method: b.method,
        score: b.score,
        reason: b.reason || '',
        weight: w,
        contribution: 0
      });
    });

    var overall = totalWeight > 0 ? weightedSum / totalWeight : 0.5;
    overall = clamp(overall, 0, 1);
    var overallPercent = Math.round(overall * 100);

    list.forEach(function (it) {
      it.contribution = totalWeight > 0 ? (it.score / 100) * it.weight / totalWeight : 0;
    });

    var summary = '綜合機率 ' + overallPercent + '%：由 ' + breakdown.length + ' 個維度加權彙總。';
    list.forEach(function (b) {
      summary += ' ' + b.method + ' ' + b.score + '%（' + (b.reason ? b.reason.substring(0, 30) + '…' : '') + '）。';
    });

    return {
      overall: overall,
      overallPercent: overallPercent,
      breakdown: list,
      summary: summary
    };
  }

  /**
   * 從頁面現有分析結果與問題，產生完整評分報告（供結果頁使用）
   * @param {Object} analysisResults - { bazi, meihua, tarot, nameology }
   * @param {string} questionText
   * @returns { { category: string, overallPercent: number, breakdown: Array<{ method, score, reason }>, summary: string } }
   */
  function buildSummaryReport(analysisResults, questionText) {
    var category = getCategory(questionText);
    var breakdown = [];
    var r = analysisResults || {};

    if (r.bazi) {
      var b = calculateCategoryScore('bazi', r.bazi, category);
      breakdown.push({ method: '八字', score: b.score, reason: b.reason });
    }
    if (r.nameology) {
      var n = calculateCategoryScore('name', r.nameology, category);
      breakdown.push({ method: '姓名學', score: n.score, reason: n.reason });
    }
    if (r.meihua) {
      var m = calculateCategoryScore('meihua', r.meihua, category);
      breakdown.push({ method: '梅花易數', score: m.score, reason: m.reason });
    }
    if (r.tarot && (r.tarot.cards || (r.tarot.analysis && r.tarot.analysis.positions))) {
      var t = calculateCategoryScore('tarot', r.tarot, category);
      breakdown.push({ method: '塔羅', score: t.score, reason: t.reason });
    }

    var agg = aggregateScores(breakdown);
    return {
      category: category,
      overallPercent: agg.overallPercent,
      breakdown: agg.breakdown,
      summary: agg.summary
    };
  }

  var api = {
    getCategory: getCategory,
    calculateCategoryScore: calculateCategoryScore,
    calculateBaziScore: calculateBaziScore,
    calculateMeihuaScore: calculateMeihuaScore,
    calculateTarotScore: calculateTarotScore,
    calculateNameScore: calculateNameScore,
    aggregateScores: aggregateScores,
    buildSummaryReport: buildSummaryReport,
    CATEGORY_WEALTH: CATEGORY_WEALTH,
    CATEGORY_CAREER: CATEGORY_CAREER,
    CATEGORY_LOVE: CATEGORY_LOVE,
    CATEGORY_HEALTH: CATEGORY_HEALTH,
    CATEGORY_GENERAL: CATEGORY_GENERAL
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    Object.keys(api).forEach(function (k) { global[k] = api[k]; });
    global.ScoringEngine = api;
  }
})(typeof window !== 'undefined' ? window : this);
