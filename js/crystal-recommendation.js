/**
 * 五行水晶推薦引擎
 * 依據多維度命理象徵（八字／梅花／塔羅／紫微）綜合推薦，非單純「五行缺什麼補什麼」
 * 依各維度象徵交叉驗證，進行最適合的推薦搭配
 */
(function (global) {
  'use strict';

  /** 五行 → 水晶／龍宮／天鐵對照表（繁體中文） */
  var CRYSTAL_MAPPING = {
    FIRE: {
      element: '火',
      keywords: '熱情、動力、桃花、人緣',
      stones: ['紅瑪瑙', '骨幹太陽石', '金太陽', '紅兔毛', '紫水晶(火土)'],
      desc: '您的命盤或流年需要『火』元素的能量來補強，有助於提升行動力與個人魅力。'
    },
    WOOD: {
      element: '木',
      keywords: '成長、事業、創意、穩健',
      stones: ['綠幽靈', '捷克隕石', '綠髮晶', '龍宮舍利(木紋)'],
      desc: '建議配戴『木』行水晶，幫助您的事業根基更加穩固，激發創意思考。'
    },
    WATER: {
      element: '水',
      keywords: '智慧、財運、溝通、流動',
      stones: ['黑曜石', '藍晶石', '天河石', '黑銀鈦'],
      desc: '五行缺水或喜水，適合配戴黑色/藍色系礦石，能增強財運流動與溝通智慧。'
    },
    METAL: {
      element: '金',
      keywords: '果斷、權力、貴人、斬煞',
      stones: ['天鐵(隕石)', '白水晶', '鈦晶', '龍宮舍利(白)'],
      desc: '需要『金』的能量來斬斷阻礙，天鐵與鈦晶能為您帶來強大的氣場與貴人運。'
    },
    EARTH: {
      element: '土',
      keywords: '聚財、穩定、健康、包容',
      stones: ['黃水晶', '龍宮舍利(黃/土)', '黃虎眼'],
      desc: '『土』生金，配戴黃色系水晶或龍宮舍利，能讓您的財庫更加穩固，安定心神。'
    }
  };
  /** 雙元素水晶（Exact Match 優先）— 名稱含雙元素標記 */
  var DUAL_STONE_PATTERNS = { '火土': ['FIRE', 'EARTH'], '土金': ['EARTH', 'METAL'], '金水': ['METAL', 'WATER'], '水木': ['WATER', 'WOOD'], '木火': ['WOOD', 'FIRE'] };

  var ELEMENT_TO_KEY = { '火': 'FIRE', '木': 'WOOD', '水': 'WATER', '金': 'METAL', '土': 'EARTH' };
  var KEY_TO_ELEMENT = { FIRE: '火', WOOD: '木', WATER: '水', METAL: '金', EARTH: '土' };

  /** 五行相生（互補）：生者 → 被生者。用於取得喜用神之源（生它的五行） */
  var ELEMENT_GENERATES = { WATER: 'WOOD', WOOD: 'FIRE', FIRE: 'EARTH', EARTH: 'METAL', METAL: 'WATER' };
  /** 五行相剋：克者 → 被克者。用於衝突排除，不可同時輸出相剋元素 */
  var ELEMENT_CONFLICTS = { WATER: 'FIRE', FIRE: 'METAL', METAL: 'WOOD', WOOD: 'EARTH', EARTH: 'WATER' };
  /** 喜用神之源：被生者 → 生者。e.g. Metal 喜用神 → Earth 生它 */
  var ELEMENT_GENERATED_BY = { WOOD: 'WATER', FIRE: 'WOOD', EARTH: 'FIRE', METAL: 'EARTH', WATER: 'METAL' };

  /** 問題類別 → 備用五行（無八字時） */
  var CATEGORY_FALLBACK = {
    career: 'WOOD',
    finance: 'WATER',
    relationship: 'FIRE',
    love: 'FIRE',
    wealth: 'WATER',
    health: 'EARTH',
    family: 'EARTH',
    general: 'EARTH',
    other: 'EARTH'
  };

  /**
   * 取得開運水晶推薦（多維度：八字流年喜忌、姓名當年加成、紫微整體能量、梅花塔羅當下象徵，結合喜忌神分析）
   * @param {Object} baziResult - 八字結果（含 favorableElements）
   * @param {string} question - 用戶問題文字
   * @param {Object} options - { tarot, meihua, ziwei, nameology, questionType } 多維度命理資料
   * @returns {{ targetElement: string, suggestedStones: string[], reasonText: string, keywords: string }}
   */
  function getCrystalRecommendation(baziResult, question, options) {
    options = options || {};
    var fav = [];
    var risk = [];
    var baziForFav = baziResult && (baziResult.fullData || baziResult);
    if (baziForFav && baziForFav.favorableElements) {
      var fe = baziForFav.favorableElements;
      fav = Array.isArray(fe.favorable) ? fe.favorable : (fe.favorable ? [fe.favorable] : []);
      risk = Array.isArray(fe.unfavorable) ? fe.unfavorable : (fe.unfavorable ? [fe.unfavorable] : []);
    }

    var keys = [];
    var fusionReasonText = '';
    var problemLabel = '';
    var safeElements = [];
    var riskElements = [];

    if (typeof FusionCrystalEngine !== 'undefined' && FusionCrystalEngine.calculateFusionCrystal) {
      try {
        var fusion = FusionCrystalEngine.calculateFusionCrystal(
          baziResult, options.tarot, options.meihua, options.questionType || 'general'
        );
        if (fusion.recommendedKeys && fusion.recommendedKeys.length > 0) {
          keys = fusion.recommendedKeys.slice(0, 2);
          fusionReasonText = fusion.reasonText || '';
          problemLabel = fusion.problemLabel || '';
          safeElements = fusion.safeElements || fav;
          riskElements = fusion.riskElements || risk;
        }
      } catch (e) {}
    }

    if (keys.length === 0) {
      var primaryKey = fav.length > 0 && fav[0] && ELEMENT_TO_KEY[fav[0]] ? ELEMENT_TO_KEY[fav[0]] : '';
      if (!primaryKey && typeof CrystalBehaviorMap !== 'undefined' && CrystalBehaviorMap.getMultiDimensionElements) {
        try {
          var md = CrystalBehaviorMap.getMultiDimensionElements(
            options.tarot, options.meihua, options.ziwei, fav, options.questionType || 'general'
          );
          if (md.combined && md.combined.length > 0) primaryKey = ELEMENT_TO_KEY[md.combined[0]];
        } catch (e) {}
      }
      if (!primaryKey) {
        var cat = options.questionType && CATEGORY_FALLBACK[options.questionType] ? options.questionType : 'general';
        if (cat === 'general' && typeof getCategory === 'function') cat = getCategory(question || '', options.questionType) || cat;
        if (cat === 'general' && typeof parseQuestion === 'function') {
          var parsed = parseQuestion(question || '');
          cat = (parsed && parsed.category) ? parsed.category : cat;
        }
        primaryKey = CATEGORY_FALLBACK[cat] || 'EARTH';
      }
      var sourceKey = ELEMENT_GENERATED_BY[primaryKey] || '';
      keys = [primaryKey];
      if (sourceKey && ELEMENT_CONFLICTS[primaryKey] !== sourceKey && ELEMENT_CONFLICTS[sourceKey] !== primaryKey) keys.push(sourceKey);
    }

    var behaviorNote = '';
    if (!fusionReasonText && typeof CrystalBehaviorMap !== 'undefined' && CrystalBehaviorMap.getBehaviorKeywords) {
      try {
        var bh = CrystalBehaviorMap.getBehaviorKeywords(options.tarot, options.meihua, fav);
        var behaviorWords = (bh.favored && bh.favored.length) ? bh.favored : (bh.all && bh.all.length ? bh.all : []);
        if (behaviorWords.length) behaviorNote = '塔羅與卦象提示行為校準：' + behaviorWords.slice(0, 4).join('、') + '。';
      } catch (e) {}
    }

    var elements = [];
    var allStonesRaw = [];
    var descs = [];
    var keywordsSet = [];

    for (var j = 0; j < keys.length; j++) {
      var config = CRYSTAL_MAPPING[keys[j]] || CRYSTAL_MAPPING.EARTH;
      elements.push(config.element);
      if (config.stones && config.stones.length) allStonesRaw = allStonesRaw.concat(config.stones);
      if (config.desc) descs.push(config.desc);
      if (config.keywords) keywordsSet.push(config.keywords);
    }

    var exactMatch = [];
    var primaryMatch = [];
    var keySet = {};
    keys.forEach(function (k) { keySet[k] = true; });
    for (var s = 0; s < allStonesRaw.length; s++) {
      var stone = allStonesRaw[s];
      var isDual = false;
      if (keys.length >= 2) {
        for (var pat in DUAL_STONE_PATTERNS) {
          if (stone.indexOf(pat) >= 0) {
            var pair = DUAL_STONE_PATTERNS[pat];
            if (keySet[pair[0]] && keySet[pair[1]]) { isDual = true; break; }
          }
        }
      }
      if (isDual) exactMatch.push(stone);
      else primaryMatch.push(stone);
    }
    var seenStone = {};
    var allStones = [];
    exactMatch.concat(primaryMatch).forEach(function (st) {
      if (!seenStone[st] && allStones.length < 3) { seenStone[st] = true; allStones.push(st); }
    });

    var targetElement = elements.join('、');

    /* 多維度摘要：八字流年喜忌、姓名當年針對問題加成、紫微整體能量整補、梅花與塔羅當下象徵，再結合喜忌神分析 */
    var safeForSummary = safeElements.length ? safeElements : fav;
    var riskForSummary = riskElements.length ? riskElements : risk;
    var parts = [];
    if (safeForSummary.length || riskForSummary.length) {
      var baziLine = '八字流年喜忌：喜' + (safeForSummary.length ? safeForSummary.join('、') : '—');
      if (riskForSummary.length) baziLine += '，忌' + riskForSummary.join('、');
      parts.push(baziLine + '。');
    }
    if (options.nameology) {
      var nm = options.nameology.analysis || options.nameology;
      var nameScore = (nm && typeof nm.score === 'number') ? nm.score : 0;
      parts.push('姓名學：當年針對本類問題' + (nameScore >= 60 ? '有加成。' : '無特別加成。'));
    }
    var ziweiEl = [];
    if (typeof CrystalBehaviorMap !== 'undefined' && CrystalBehaviorMap.getMultiDimensionElements && options.ziwei) {
      try {
        var md = CrystalBehaviorMap.getMultiDimensionElements(
          options.tarot, options.meihua, options.ziwei, fav, options.questionType || 'general'
        );
        if (md.ziwei && md.ziwei.length) ziweiEl = md.ziwei.slice(0, 2);
      } catch (e) {}
    }
    if (ziweiEl.length) parts.push('紫微：整體能量偏' + ziweiEl.join('、') + '，可整補對應五行。');
    if (problemLabel) parts.push('梅花與塔羅：當下象徵需【' + problemLabel + '】。');
    var multiSummary = parts.length ? parts.join(' ') : '';

    var reasonText = multiSummary + (multiSummary ? '綜合喜忌神分析，' : '') + (fusionReasonText || (behaviorNote ? behaviorNote + ' ' : '') + (descs[0] || ''));
    if (!fusionReasonText && keys.length >= 2 && ELEMENT_GENERATES[keys[0]] === keys[1]) {
      reasonText = (reasonText ? reasonText + ' ' : '') + '五行互補：' + KEY_TO_ELEMENT[keys[0]] + '生' + KEY_TO_ELEMENT[keys[1]] + '。';
    }
    reasonText = (reasonText ? reasonText + ' ' : '') + '此為校準工具，請理性看待。';

    var wearingMethod = '建議配戴於左手（接收能量）或隨身攜帶，睡前可取下置於枕邊或水晶盒淨化。首次配戴前建議以流水或月光淨化。';
    var taboos = '避免佩戴入睡（部分礦石如黑曜石、鈦晶能量較強）；忌與化學品、汗水長時間接觸；運動、沐浴時建議取下；孕婦、術後請依個人體質斟酌。';
    var disclaimer = '本建議依八字流年喜忌、姓名學當年針對問題之加成、紫微整體能量整補、梅花與塔羅當下象徵，結合喜忌神分析綜合推斷，非單純五行缺補，僅供能量校準參考，不具醫療或命運保證效力。';

    return {
      targetElement: targetElement,
      suggestedStones: allStones,
      reasonText: reasonText,
      keywords: keywordsSet.join('、'),
      wearingMethod: wearingMethod,
      taboos: taboos,
      disclaimer: disclaimer
    };
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CRYSTAL_MAPPING: CRYSTAL_MAPPING, getCrystalRecommendation: getCrystalRecommendation };
  } else {
    global.CRYSTAL_MAPPING = CRYSTAL_MAPPING;
    global.getCrystalRecommendation = getCrystalRecommendation;
  }
})(typeof window !== 'undefined' ? window : this);
