/**
 * 多維能量校準引擎 (Fusion Crystal Engine)
 * 平衡八字格局（體質）與塔羅／梅花（當下情境），產出橋樑式水晶推薦
 * 非單純五行缺補，而是透過生剋轉化解決情境需求同時兼顧八字喜忌
 */
(function (global) {
  'use strict';

  var ELEMENT_TO_KEY = { '火': 'FIRE', '木': 'WOOD', '水': 'WATER', '金': 'METAL', '土': 'EARTH' };
  var KEY_TO_ELEMENT = { FIRE: '火', WOOD: '木', WATER: '水', METAL: '金', EARTH: '土' };

  /** 五行相生：生者 → 被生者 */
  var ELEMENT_GENERATES = { WATER: 'WOOD', WOOD: 'FIRE', FIRE: 'EARTH', EARTH: 'METAL', METAL: 'WATER' };
  /** 生它的五行：被生者 → 生者 */
  var ELEMENT_GENERATED_BY = { WOOD: 'WATER', FIRE: 'WOOD', EARTH: 'FIRE', METAL: 'EARTH', WATER: 'METAL' };

  /**
   * 塔羅／梅花問題類型 → 所需五行（情境療法）
   * Anxiety/Fear/Confusion (水/月亮型) → Earth 或 Wood
   * Stagnation/Lazy/Overthinking (土型) → Fire 或 Wood
   * Conflict/Stress/Pressure (金/寶劍型) → Water 或 Fire
   * Impulsive/Burnout (火型) → Water 或 Earth
   */
  var PROBLEM_TYPE_TO_NEED = {
    anxiety: { need: ['土', '木'], label: '安定、釐清、信心' },
    stagnation: { need: ['火', '木'], label: '行動、成長、突破' },
    conflict: { need: ['水', '火'], label: '流動、智慧、掌控' },
    impulsive: { need: ['水', '土'], label: '冷靜、紮根、穩定性' }
  };

  /** 行為關鍵字 → 問題類型 */
  var BEHAVIOR_TO_PROBLEM = {
    '內省': 'anxiety', '直覺': 'anxiety', '等待': 'anxiety', '釐清幻象': 'anxiety', '防內耗': 'anxiety', '釐清': 'anxiety',
    '止步': 'stagnation', '沉潛': 'stagnation', '耐心': 'stagnation', '累積': 'stagnation', '低調': 'stagnation', '內斂': 'stagnation',
    '界線': 'conflict', '斷捨離': 'conflict', '斬煞': 'conflict',
    '行動力': 'impulsive', '衝刺': 'impulsive', '熱情': 'impulsive', '冒險': 'impulsive', '正向': 'impulsive', '活力': 'impulsive', '自信': 'impulsive'
  };

  /**
   * 橋樑策略對照表：當塔羅需求在 RiskElements 時，找 Safe 中的橋樑元素
   * 格式：{ tarotNeed: { riskEl: bridgeEl } }
   * 邏輯：橋樑既能滿足八字喜用，又能透過生剋轉化滿足塔羅需求
   */
  var BRIDGE_STRATEGY = {
    '火': { '火': '木', '金': '木' },
    '木': { '木': '水', '金': '水' },
    '水': { '水': '金', '土': '金' },
    '金': { '金': '土', '木': '土' },
    '土': { '土': '水', '木': '水' }
  };

  /** 橋樑轉化說明（象徵解釋用）：橋樑五行-需求五行 -> 說明 */
  var BRIDGE_REASON_MAP = {
    '木-火': '木生火，既能滿足八字喜用，又能透過生剋轉化為行動力，無須直接補火。',
    '水-木': '水生木，滋養根基後自然生發。',
    '水-土': '水能潤土、靜心定神，以智慧與流動達成穩定。',
    '金-水': '金生水，以果斷與界限帶來清明。',
    '土-金': '土生金，以穩定與包容化解壓力。',
    '金-木': '金克木中取平衡，以界限帶來成長空間。',
    '土-水': '土克水中取平衡，以穩定化解混沌。'
  };

  /**
   * Step 1: 識別八字約束（Safe Zone）
   * @param {Object} baziResult - 八字結果
   * @returns {{ safeElements: string[], riskElements: string[], bodyStrength: string }}
   */
  function getBaziConstraints(baziResult) {
    var safe = [];
    var risk = [];
    var bodyStrength = '';
    var raw = baziResult && (baziResult.fullData || baziResult);
    if (raw && raw.favorableElements) {
      var fe = raw.favorableElements;
      safe = Array.isArray(fe.favorable) ? fe.favorable : (fe.favorable ? [fe.favorable] : []);
      risk = Array.isArray(fe.unfavorable) ? fe.unfavorable : (fe.unfavorable ? [fe.unfavorable] : []);
    }
    if (raw && raw.elementStrength && raw.elementStrength.bodyStrength) {
      bodyStrength = raw.elementStrength.bodyStrength;
    }
    return { safeElements: safe, riskElements: risk, bodyStrength: bodyStrength };
  }

  /**
   * Step 2: 識別情境需求（Target）
   * @param {Object} tarotResult - 塔羅結果
   * @param {Object} meihuaResult - 梅花結果
   * @param {string} questionType - 問題類別
   * @returns {{ needElements: string[], problemLabel: string, behaviors: string[] }}
   */
  function getSituationalNeed(tarotResult, meihuaResult, questionType) {
    var behaviors = [];
    if (typeof CrystalBehaviorMap !== 'undefined') {
      if (CrystalBehaviorMap.getBehaviorKeywords) {
        var bh = CrystalBehaviorMap.getBehaviorKeywords(tarotResult, meihuaResult, []);
        behaviors = (bh.all || []).concat(bh.other || []);
      }
    }
    var problemType = 'anxiety';
    for (var i = 0; i < behaviors.length; i++) {
      var pt = BEHAVIOR_TO_PROBLEM[behaviors[i]];
      if (pt) { problemType = pt; break; }
    }
    var config = PROBLEM_TYPE_TO_NEED[problemType] || PROBLEM_TYPE_TO_NEED.anxiety;
    return { needElements: config.need, problemLabel: config.label, behaviors: behaviors };
  }

  /**
   * Step 3: 橋樑演算法（Fusion）
   * @param {string[]} safeElements
   * @param {string[]} riskElements
   * @param {string[]} needElements
   * @returns {{ recommendedKeys: string[], isDirectMatch: boolean, bridgeReason: string }}
   */
  function runBridgeAlgorithm(safeElements, riskElements, needElements) {
    var needKeys = (needElements || []).map(function (e) { return ELEMENT_TO_KEY[e]; }).filter(Boolean);
    var safeKeys = (safeElements || []).map(function (e) { return ELEMENT_TO_KEY[e]; }).filter(Boolean);
    var riskKeys = (riskElements || []).map(function (e) { return ELEMENT_TO_KEY[e]; }).filter(Boolean);
    var recommendedKeys = [];
    var isDirectMatch = false;
    var bridgeReason = '';

    for (var n = 0; n < needKeys.length && recommendedKeys.length === 0; n++) {
      var needEl = needKeys[n];
      var needZh = KEY_TO_ELEMENT[needEl];

      if (safeKeys.indexOf(needEl) >= 0) {
        recommendedKeys = [needEl];
        var sourceKey = ELEMENT_GENERATED_BY[needEl];
        if (sourceKey && safeKeys.indexOf(sourceKey) >= 0 && riskKeys.indexOf(sourceKey) < 0) {
          recommendedKeys = [sourceKey, needEl];
        }
        isDirectMatch = true;
        break;
      }

      if (riskKeys.indexOf(needEl) >= 0) {
        var bridgeZh = (BRIDGE_STRATEGY[needZh] || {})[needZh];
        if (!bridgeZh) bridgeZh = KEY_TO_ELEMENT[ELEMENT_GENERATED_BY[needEl]];
        var bridgeKey = bridgeZh ? ELEMENT_TO_KEY[bridgeZh] : null;
        if (bridgeKey && safeKeys.indexOf(bridgeKey) >= 0 && riskKeys.indexOf(bridgeKey) < 0) {
          recommendedKeys = [bridgeKey];
          var sourceOfBridge = ELEMENT_GENERATED_BY[bridgeKey];
          if (sourceOfBridge && safeKeys.indexOf(sourceOfBridge) >= 0 && riskKeys.indexOf(sourceOfBridge) < 0) {
            recommendedKeys = [ELEMENT_TO_KEY[sourceOfBridge], bridgeKey].filter(Boolean);
          }
          bridgeReason = BRIDGE_REASON_MAP[bridgeZh + '-' + needZh] || '以' + bridgeZh + '生' + needZh + '，既滿足喜用又能轉化情境需求。';
        }
      }
    }

    if (recommendedKeys.length === 0 && safeKeys.length > 0) {
      recommendedKeys = [safeKeys[0]];
      var src = ELEMENT_GENERATED_BY[safeKeys[0]];
      if (src && safeKeys.indexOf(src) >= 0) recommendedKeys = [src, safeKeys[0]];
      isDirectMatch = true;
    }

    return { recommendedKeys: recommendedKeys, isDirectMatch: isDirectMatch, bridgeReason: bridgeReason };
  }

  /**
   * Step 4: 產生象徵解釋文案
   */
  function buildReasoningText(opts) {
    var needLabel = opts.needLabel || '某種能量';
    var riskZh = (opts.riskElements || [])[0] || '—';
    var bridgeZh = (opts.recommendedElements || [])[0] || '—';
    var safeZh = (opts.safeElements || []).join('、') || '—';
    var bridgeReason = opts.bridgeReason || '';

    if (opts.isDirectMatch) {
      return '塔羅與卦象顯示您當下需要【' + needLabel + '】，恰與您的八字喜用（' + safeZh + '）相符，建議直接配戴對應水晶，既能滿足情境需求又能強化體質。';
    }
    return '雖然塔羅顯示您當下需要【' + needLabel + '】，但考量您的八字格局不宜直接補【' + riskZh + '】，系統建議配戴【' + bridgeZh + '】。' + bridgeReason;
  }

  /**
   * 多維能量校準引擎主函數
   * @param {Object} baziResult - 八字結果
   * @param {Object} tarotResult - 塔羅結果
   * @param {Object} meihuaResult - 梅花結果
   * @param {string} questionType - 問題類別
   * @returns {{ recommendedKeys: string[], reasonText: string, isDirectMatch: boolean, safeElements: string[], riskElements: string[], needElements: string[] }}
   */
  function calculateFusionCrystal(baziResult, tarotResult, meihuaResult, questionType) {
    var step1 = getBaziConstraints(baziResult);
    var step2 = getSituationalNeed(tarotResult, meihuaResult, questionType);
    var step3 = runBridgeAlgorithm(step1.safeElements, step1.riskElements, step2.needElements);

    var recommendedZh = step3.recommendedKeys.map(function (k) { return KEY_TO_ELEMENT[k]; }).filter(Boolean);
    var reasonText = buildReasoningText({
      needLabel: step2.problemLabel,
      riskElements: step1.riskElements,
      recommendedElements: recommendedZh,
      safeElements: step1.safeElements,
      bridgeReason: step3.bridgeReason,
      isDirectMatch: step3.isDirectMatch
    });

    return {
      recommendedKeys: step3.recommendedKeys,
      recommendedElements: recommendedZh,
      reasonText: reasonText,
      isDirectMatch: step3.isDirectMatch,
      safeElements: step1.safeElements,
      riskElements: step1.riskElements,
      needElements: step2.needElements,
      problemLabel: step2.problemLabel
    };
  }

  var api = {
    calculateFusionCrystal: calculateFusionCrystal,
    getBaziConstraints: getBaziConstraints,
    getSituationalNeed: getSituationalNeed,
    runBridgeAlgorithm: runBridgeAlgorithm,
    BRIDGE_STRATEGY: BRIDGE_STRATEGY,
    PROBLEM_TYPE_TO_NEED: PROBLEM_TYPE_TO_NEED
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    global.FusionCrystalEngine = api;
  }
})(typeof window !== 'undefined' ? window : this);
