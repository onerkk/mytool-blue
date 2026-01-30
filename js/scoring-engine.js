/**
 * ScoringEngine - 依問題類別（事業/感情/財富/健康）的脈絡評分引擎
 * 輸入：八字、梅花易數、塔羅、姓名學資料 + 問題類別
 * 輸出：各系統 { score, reason }，加權彙總與摘要報告
 *
 * 八字：流年 2026 丙午火年與用戶喜用神／忌神比對（喜用含火或土→高分段；忌神為火→低分段）；感情另檢配偶星／桃花。
 * 姓名學：數理屬性與類別比對（財運 24/29/32→高分段；感情 21/23 領導數→低分段），理由由本引擎動態產生並綁至 UI。
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

  /** 天干→五行（流年/十神用） */
  var STEM_ELEMENT = { '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土', '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水' };
  /** 地支→五行 */
  var BRANCH_ELEMENT = { '子': '水', '丑': '土', '寅': '木', '卯': '木', '辰': '土', '巳': '火', '午': '火', '未': '土', '申': '金', '酉': '金', '戌': '土', '亥': '水' };
  /** 六十甲子（流年用） */
  var JIAZI = [
    '甲子', '乙丑', '丙寅', '丁卯', '戊辰', '己巳', '庚午', '辛未', '壬申', '癸酉',
    '甲戌', '乙亥', '丙子', '丁丑', '戊寅', '己卯', '庚辰', '辛巳', '壬午', '癸未',
    '甲申', '乙酉', '丙戌', '丁亥', '戊子', '己丑', '庚寅', '辛卯', '壬辰', '癸巳',
    '甲午', '乙未', '丙申', '丁酉', '戊戌', '己亥', '庚子', '辛丑', '壬寅', '癸卯',
    '甲辰', '乙巳', '丙午', '丁未', '戊申', '己酉', '庚戌', '辛亥', '壬子', '癸丑',
    '甲寅', '乙卯', '丙辰', '丁巳', '戊午', '己未', '庚申', '辛酉', '壬戌', '癸亥'
  ];
  /** 日主→流年天干 十神（與 data.js tenGodsTable 一致） */
  var TEN_GODS_STEM = {
    '甲': { '甲': '比肩', '乙': '劫財', '丙': '食神', '丁': '傷官', '戊': '偏財', '己': '正財', '庚': '七殺', '辛': '正官', '壬': '偏印', '癸': '正印' },
    '乙': { '甲': '劫財', '乙': '比肩', '丙': '傷官', '丁': '食神', '戊': '正財', '己': '偏財', '庚': '正官', '辛': '七殺', '壬': '正印', '癸': '偏印' },
    '丙': { '甲': '偏印', '乙': '正印', '丙': '比肩', '丁': '劫財', '戊': '食神', '己': '傷官', '庚': '偏財', '辛': '正財', '壬': '七殺', '癸': '正官' },
    '丁': { '甲': '正印', '乙': '偏印', '丙': '劫財', '丁': '比肩', '戊': '傷官', '己': '食神', '庚': '正財', '辛': '偏財', '壬': '正官', '癸': '七殺' },
    '戊': { '甲': '七殺', '乙': '正官', '丙': '偏印', '丁': '正印', '戊': '比肩', '己': '劫財', '庚': '食神', '辛': '傷官', '壬': '偏財', '癸': '正財' },
    '己': { '甲': '正官', '乙': '七殺', '丙': '正印', '丁': '偏印', '戊': '劫財', '己': '比肩', '庚': '傷官', '辛': '食神', '壬': '正財', '癸': '偏財' },
    '庚': { '甲': '偏財', '乙': '正財', '丙': '七殺', '丁': '正官', '戊': '偏印', '己': '正印', '庚': '比肩', '辛': '劫財', '壬': '食神', '癸': '傷官' },
    '辛': { '甲': '正財', '乙': '偏財', '丙': '正官', '丁': '七殺', '戊': '正印', '己': '偏印', '庚': '劫財', '辛': '比肩', '壬': '傷官', '癸': '食神' },
    '壬': { '甲': '食神', '乙': '傷官', '丙': '偏財', '丁': '正財', '戊': '七殺', '己': '正官', '庚': '偏印', '辛': '正印', '壬': '比肩', '癸': '劫財' },
    '癸': { '甲': '傷官', '乙': '食神', '丙': '正財', '丁': '偏財', '戊': '正官', '己': '七殺', '庚': '正印', '辛': '偏印', '壬': '劫財', '癸': '比肩' }
  };
  /** 桃花：年/日支所在三合局 → 桃花支。寅午戌→卯，申子辰→酉，巳酉丑→午，亥卯未→子 */
  var PEACH_BLOSSOM_MAP = { '寅': '卯', '午': '卯', '戌': '卯', '申': '酉', '子': '酉', '辰': '酉', '巳': '午', '酉': '午', '丑': '午', '亥': '子', '卯': '子', '未': '子' };
  /** 天乙貴人：日干→貴人地支 */
  var NOBLEMAN_MAP = { '甲': '丑未', '戊': '丑未', '庚': '丑未', '乙': '子申', '己': '子申', '丙': '亥酉', '丁': '亥酉', '壬': '卯巳', '癸': '卯巳', '辛': '寅午' };
  /** 81 數理依問題類別加分（與 nameology EIGHTY_ONE_NUMEROLOGY 對齊） */
  var NAME_NUMBER_BY_CATEGORY = {
    finance: { bonus: [15, 16, 24, 29, 32, 33, 41, 52], label: '財運吉數' },
    career: { bonus: [21, 23, 29, 33, 39, 41, 45, 47, 48], label: '領導/事業吉數' },
    relationship: { bonus: [6, 15, 16, 24, 32, 35], label: '人緣/感情吉數' },
    health: { bonus: [5, 6, 11, 15, 16, 24], label: '健康吉數' },
    general: { bonus: [], label: '' }
  };
  /** 數理屬性：數字 → 五行／意象（用於與問題類別比對，產出精準理由） */
  var NUMBER_ATTRIBUTES = {
    24: { vibe: '財富', element: '火', label: '財運主星' },
    29: { vibe: '財富', element: '水', label: '財運吉數' },
    32: { vibe: '財富', element: '木', label: '財運吉數' },
    21: { vibe: '領導／孤獨', element: '木', label: '領導數' },
    23: { vibe: '強勢／孤獨', element: '火', label: '強勢領導數' },
    16: { vibe: '領導', element: '土', label: '領導／成就' },
    7: { vibe: '衝突／剛強', element: '金', label: '剛強數' }
  };
  var WEALTH_NUMBERS = [24, 29, 32];
  var SOLITARY_STRONG_NUMBERS = [21, 23];
  /** 五行相生：生→被生 */
  var WUXING_SHENG = { '木': '火', '火': '土', '土': '金', '金': '水', '水': '木' };
  /** 五行相生之反（生我） */
  var WUXING_REVERSE = { '木': '水', '火': '木', '土': '火', '金': '土', '水': '金' };
  /** 五行相克：克我（克日主者） */
  var WUXING_KE = { '木': '金', '火': '水', '土': '木', '金': '火', '水': '土' };
  /** 我克（日主所克） */
  var WUXING_KE_REVERSE = { '木': '土', '火': '金', '土': '水', '金': '木', '水': '火' };
  /** 2026 流年：丙午 / 火馬年（固定用於與喜用神比對） */
  var YEAR_2026 = { ganZhi: '丙午', stem: '丙', branch: '午', element: '火' };
  /** 數字個位→五行（1,2木 3,4火 5,6土 7,8金 9,0水） */
  function numberToElement(n) {
    var x = n % 10;
    if (x <= 2) return '木';
    if (x <= 4) return '火';
    if (x <= 6) return '土';
    if (x <= 8) return '金';
    return '水';
  }

  function clamp(x, lo, hi) {
    var n = Number(x);
    if (n !== n) return lo;
    return Math.max(lo, Math.min(hi, n));
  }

  function clamp0_100(x) { return Math.round(clamp(x, 0, 100)); }

  function mod60(n) { return ((n % 60) + 60) % 60; }

  /** 取得流年干支（當前年）。優先 LiuNianCalculator，否則 (year-4)%60 對應 JIAZI */
  function getCurrentYearGanZhi() {
    var y = new Date().getFullYear();
    if (typeof LiuNianCalculator !== 'undefined') {
      try {
        var calc = new LiuNianCalculator();
        return calc.getYearGanZhi(y) || JIAZI[mod60(y - 4)];
      } catch (e) {}
    }
    if (typeof LIUNIAN_DATA !== 'undefined' && LIUNIAN_DATA.years && LIUNIAN_DATA.years[y]) return LIUNIAN_DATA.years[y];
    return JIAZI[mod60(y - 4)];
  }

  /** 從八字取日柱天干、年支/日支（用於桃花、貴人） */
  function getDayMasterAndBranches(bazi) {
    var raw = bazi && (bazi.raw || bazi);
    var fp = raw && (raw.fourPillars || raw.pillars || raw);
    var dayStem = (fp && (fp.day && (fp.day.stem || fp.day.gan))) || (raw && raw.dayMaster) || '';
    var yearBranch = (fp && fp.year && (fp.year.branch || fp.year.zhi)) || '';
    var dayBranch = (fp && fp.day && (fp.day.branch || fp.day.zhi)) || '';
    return { dayStem: dayStem, yearBranch: yearBranch, dayBranch: dayBranch };
  }

  /**
   * 依身強弱推導喜用神／忌神（當命盤未提供時）
   * 身弱：喜用 = 同我(比劫)、生我(印)；忌 = 我生、克我
   * 身強：喜用 = 我生(食傷)、我克(財)、克我(官)；忌 = 同我、生我
   */
  function deriveFavoredFromStrength(dayStem, bodyStrength) {
    var dayEl = STEM_ELEMENT[dayStem] || '';
    if (!dayEl) return { favorable: [], unfavorable: [] };
    var sameOrResource = [dayEl, WUXING_REVERSE[dayEl]];
    var outputWealthOfficial = [WUXING_SHENG[dayEl], WUXING_KE_REVERSE[dayEl], WUXING_KE[dayEl]];
    var isWeak = /弱|極弱/.test(bodyStrength);
    if (isWeak) {
      return { favorable: sameOrResource, unfavorable: outputWealthOfficial };
    }
    return { favorable: outputWealthOfficial, unfavorable: sameOrResource };
  }

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
   * 八字：依流年（2026 丙午火年）與喜用神／忌神比對，依問題類別產出真實邏輯評分
   * 1. 喜用神：命盤已有則用；否則依身強弱推導（身弱=同我/生我，身強=我生/財/官）
   * 2. 財運/事業：喜用含火或土 → 80–95%；忌神為火 → 30–45%
   * 3. 感情：流年火為配偶星或桃花 → +15%
   */
  function calculateBaziScore(baziData, category) {
    var out = { score: 50, reason: '八字資料不足，以中性分數呈現。' };
    if (!baziData) return out;

    var currentYear = new Date().getFullYear();
    var lnGz = getCurrentYearGanZhi();
    var lnStem = lnGz.charAt(0);
    var lnBranch = lnGz.charAt(1);
    var yearElement = STEM_ELEMENT[lnStem] || BRANCH_ELEMENT[lnBranch] || '';
    var yearLabel = (currentYear === 2026) ? '2026年丙午火年' : (lnGz + (BRANCH_ELEMENT[lnBranch] ? '/' + BRANCH_ELEMENT[lnBranch] + '年' : '年'));

    var raw = baziData.raw || baziData;
    var bodyStrength = ((raw.elementStrength && raw.elementStrength.bodyStrength) || raw.strength || '').toString();
    var pillars = getDayMasterAndBranches(baziData);
    var dayStem = pillars.dayStem;
    var dayBranch = pillars.dayBranch;
    var yearBranchChart = pillars.yearBranch;

    var favorable = (raw.favorableElements && raw.favorableElements.favorable) || baziData.favorable || [];
    var unfavorable = (raw.favorableElements && raw.favorableElements.unfavorable) || baziData.unfavorable || [];
    if (!Array.isArray(favorable)) favorable = favorable ? [favorable] : [];
    if (!Array.isArray(unfavorable)) unfavorable = unfavorable ? [unfavorable] : [];
    if (favorable.length === 0 && unfavorable.length === 0 && dayStem) {
      var derived = deriveFavoredFromStrength(dayStem, bodyStrength);
      favorable = derived.favorable || [];
      unfavorable = derived.unfavorable || [];
    }

    var score = 50;
    var reasonParts = [];
    var yearTenGod = dayStem && TEN_GODS_STEM[dayStem] && TEN_GODS_STEM[dayStem][lnStem];
    var isFireYear = (yearElement === YEAR_2026.element || yearElement === '火');
    var favoredHasFire = favorable.indexOf('火') >= 0;
    var favoredHasEarth = favorable.indexOf('土') >= 0;
    var tabooIsFire = unfavorable.indexOf('火') >= 0;
    var spouseStar = (yearTenGod === '正財' || yearTenGod === '偏財' || yearTenGod === '正官' || yearTenGod === '七殺');
    var peachForDay = PEACH_BLOSSOM_MAP[dayBranch] || PEACH_BLOSSOM_MAP[yearBranchChart];
    var peachYear = (lnBranch === peachForDay);

    if (category === CATEGORY_WEALTH || category === 'finance' || category === CATEGORY_CAREER) {
      if (tabooIsFire && isFireYear) {
        score = 38;
        reasonParts.push(yearLabel + '為火年，與您命盤忌神相沖，財運／事業宜保守，不宜冒進。');
      } else if ((favoredHasFire || favoredHasEarth) && isFireYear) {
        score = 87;
        reasonParts.push(yearLabel + '與您命盤喜用神（火或土）相合，利於財運與事業發展，可把握時機。');
      } else {
        if (yearTenGod === '正財' || yearTenGod === '偏財' || yearTenGod === '食神') {
          score += (category === CATEGORY_WEALTH || category === 'finance') ? 28 : 15;
          reasonParts.push('流年天干帶' + yearTenGod + '，利財運與機會。');
        }
        if (yearTenGod === '正官' || yearTenGod === '七殺') {
          score += (category === CATEGORY_CAREER ? 25 : 15);
          reasonParts.push('流年帶官殺星，利事業與權責。');
        }
        var noblemanBranches = dayStem && NOBLEMAN_MAP[dayStem];
        if (noblemanBranches && noblemanBranches.indexOf(lnBranch) >= 0) {
          score += 15;
          reasonParts.push('流年逢天乙貴人，利職場與合作。');
        }
        if (favorable.length && favorable.indexOf(yearElement) >= 0) {
          score += 15;
          reasonParts.push('流年五行' + yearElement + '為喜用神，整體利求財與事業。');
        }
        if (unfavorable.length && unfavorable.indexOf(yearElement) >= 0) {
          score -= 18;
          reasonParts.push('流年五行' + yearElement + '為忌神，宜穩守。');
        }
        if (reasonParts.length === 0) reasonParts.push('流年與命盤喜用互動中性，以身強弱與大運為輔。');
      }
    } else if (category === CATEGORY_LOVE) {
      if (peachYear) {
        score += 30;
        reasonParts.push(yearLabel + '桃花星入命，感情機緣顯著提升。');
      } else if (peachForDay) {
        reasonParts.push('流年未逢桃花星，感情以命盤十神與身強弱為主。');
      }
      if (spouseStar) {
        score += 25;
        reasonParts.push('流年天干為配偶星（' + yearTenGod + '），利感情與人緣。');
      }
      if (isFireYear && spouseStar) {
        score += 15;
        reasonParts.push('流年為火年，火為您命盤配偶星，對感情有顯著助益。');
      }
      if (favorable.length && favorable.indexOf(yearElement) >= 0) {
        score += 10;
        reasonParts.push('流年五行' + yearElement + '為喜用神，利感情發展。');
      }
      if (unfavorable.length && unfavorable.indexOf(yearElement) >= 0) {
        score -= 20;
        reasonParts.push('流年五行' + yearElement + '為忌神，感情易有波折。');
      }
    } else if (category === CATEGORY_HEALTH) {
      if (favorable.length && favorable.indexOf(yearElement) >= 0) {
        score += 15;
        reasonParts.push('流年五行' + yearElement + '為喜用，利身心平衡。');
      }
      if (unfavorable.length && unfavorable.indexOf(yearElement) >= 0) {
        score -= 15;
        reasonParts.push('流年忌神年，宜注意作息與壓力。');
      }
      reasonParts.push('健康機率以五行平衡與身強弱為參考。');
    } else {
      if (favorable.length && favorable.indexOf(yearElement) >= 0) {
        score += 20;
        reasonParts.push('流年' + yearLabel + '為喜用神年，整體機率偏好。');
      }
      if (unfavorable.length && unfavorable.indexOf(yearElement) >= 0) {
        score -= 15;
        reasonParts.push('流年為忌神年，宜保守。');
      }
      if (reasonParts.length === 0) reasonParts.push('流年與命盤互動中性。');
    }

    if (/強|中和/.test(bodyStrength)) {
      score += 5;
      if (reasonParts.indexOf('日主身強') < 0) reasonParts.push('日主身強或中和，利把握流年機會。');
    } else if (/弱|極弱/.test(bodyStrength)) {
      score -= 5;
      reasonParts.push('日主偏弱，宜借大運流年補益。');
    }

    out.score = clamp0_100(score);
    out.reason = reasonParts.length ? reasonParts.join(' ') : '流年與命盤綜合評估。';
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
    out.reason = '本卦「' + (guaName || '—') + '」' + luck + '，體用「' + (bodyUse || '—') + '」，對應此問題類別得出上述機率。';
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
      out.reason = '依凱爾特十字十張牌解讀量化，對應此問題得出上述機率。';
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
    out.reason = '依牌陣加權與牌義解讀，對應此問題類別得出上述機率。';
    return out;
  }

  /**
   * 姓名學：依人格／總格數理屬性與問題類別比對，產出真實邏輯評分與理由
   * 財運：總格／人格為 24／29／32（財富數）→ 高分段 + 精準理由
   * 感情：總格／人格為 21／23（領導／強勢數）→ 低分段 + 精準理由
   */
  function calculateNameScore(nameData, category) {
    var out = { score: 50, reason: '姓名學資料不足。' };
    if (!nameData) return out;

    var fp = nameData.fivePatterns || nameData.fivePattern || nameData.analysis || {};
    var personNum = (fp.person != null && fp.person.number != null) ? Number(fp.person.number) : (fp.personality != null && typeof fp.personality === 'number' ? fp.personality : (fp.person && typeof fp.person === 'number' ? fp.person : null));
    if (personNum == null && fp.person != null) personNum = typeof fp.person === 'number' ? fp.person : null;
    var totalNum = (fp.total != null && fp.total.number != null) ? Number(fp.total.number) : (fp.total != null && typeof fp.total === 'number' ? fp.total : null);
    if (typeof personNum !== 'number') personNum = null;
    if (typeof totalNum !== 'number') totalNum = null;
    var totalScore = nameData.overallScore != null ? Number(nameData.overallScore) : (fp.total && fp.total.score);
    if (!Number.isFinite(totalScore) && totalNum != null) totalScore = Math.min(81, Math.max(1, totalNum)) * 0.8;
    var score = Number.isFinite(totalScore) ? clamp(totalScore, 0, 100) : 50;
    var reasonParts = [];

    var hasWealthNum = (WEALTH_NUMBERS.indexOf(personNum) >= 0 || WEALTH_NUMBERS.indexOf(totalNum) >= 0);
    var hasSolitaryStrong = (SOLITARY_STRONG_NUMBERS.indexOf(personNum) >= 0 || SOLITARY_STRONG_NUMBERS.indexOf(totalNum) >= 0);
    var whichWealth = totalNum != null && WEALTH_NUMBERS.indexOf(totalNum) >= 0 ? totalNum : (personNum != null && WEALTH_NUMBERS.indexOf(personNum) >= 0 ? personNum : null);
    var whichSolitary = totalNum != null && SOLITARY_STRONG_NUMBERS.indexOf(totalNum) >= 0 ? totalNum : (personNum != null && SOLITARY_STRONG_NUMBERS.indexOf(personNum) >= 0 ? personNum : null);

    if ((category === CATEGORY_WEALTH || category === 'finance') && hasWealthNum) {
      score = 88;
      var attr = NUMBER_ATTRIBUTES[whichWealth];
      var gridName = (totalNum === whichWealth) ? '總格' : '人格';
      reasonParts.push('您的姓名' + gridName + '（' + whichWealth + '）為' + (attr && attr.label ? attr.label : '財運吉數') + '，利於求財與事業，對本類問題高度有利。');
    } else if (category === CATEGORY_LOVE && hasSolitaryStrong) {
      score = 42;
      reasonParts.push('您的姓名具領導／強勢數（' + (whichSolitary === 21 ? '21' : '23') + '），人際上較為強勢，感情需多包容與溝通。');
    } else {
      var catNum = NAME_NUMBER_BY_CATEGORY[category] || NAME_NUMBER_BY_CATEGORY.general;
      if (catNum.bonus && catNum.bonus.length > 0) {
        var bonusCount = 0;
        if (personNum != null && catNum.bonus.indexOf(personNum) >= 0) { score += 15; bonusCount++; }
        if (totalNum != null && catNum.bonus.indexOf(totalNum) >= 0) { score += 15; bonusCount++; }
        if (bonusCount > 0) {
          reasonParts.push('人格/總格中「' + catNum.label + '」吉數出現，對本類問題有加分。');
        } else if (personNum != null || totalNum != null) {
          reasonParts.push('人格' + (personNum != null ? personNum : '—') + '、總格' + (totalNum != null ? totalNum : '—') + '；本類吉數未明顯對應，以整體數理為準。');
        }
      }

      var catElements = NAME_ELEMENT_BY_CATEGORY[category] || NAME_ELEMENT_BY_CATEGORY.general;
      if (catElements.length > 0) {
        var personEl = personNum != null ? numberToElement(personNum) : '';
        var totalEl = totalNum != null ? numberToElement(totalNum) : '';
        var dominantEl = totalEl || personEl;
        var supports = false;
        for (var i = 0; i < catElements.length; i++) {
          var need = catElements[i];
          if (WUXING_SHENG[dominantEl] === need) {
            score += 12;
            supports = true;
            reasonParts.push('姓名五行（' + (dominantEl || '—') + '）生助本類所需五行（' + need + '），利該類發展。');
            break;
          }
        }
        if (!supports && dominantEl) {
          reasonParts.push('姓名五行與本類（' + catElements.join('、') + '）之對應需結合八字喜用綜合看。');
        }
      }
    }

    out.score = clamp0_100(score);
    out.reason = reasonParts.length ? reasonParts.join(' ') : '人格/總格數理與三才五行對本類問題的綜合評估。';
    if (personNum != null || totalNum != null) {
      out.reason += ' （人格' + (personNum != null ? personNum : '—') + '、總格' + (totalNum != null ? totalNum : '—') + '）';
    }
    if (!/。$/.test(out.reason)) out.reason += '。';
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
