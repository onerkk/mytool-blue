/**
 * 五行水晶推薦引擎
 * 依八字喜用神或問題類別，推薦對應五行水晶／龍宮舍利／天鐵
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

  var ELEMENT_TO_KEY = { '火': 'FIRE', '木': 'WOOD', '水': 'WATER', '金': 'METAL', '土': 'EARTH' };
  var KEY_TO_ELEMENT = { FIRE: '火', WOOD: '木', WATER: '水', METAL: '金', EARTH: '土' };

  /** 五行相生（互補）：生者 → 被生者 */
  var ELEMENT_GENERATES = { WATER: 'WOOD', WOOD: 'FIRE', FIRE: 'EARTH', EARTH: 'METAL', METAL: 'WATER' };

  /** 問題類別 → 備用五行（無八字時） */
  var CATEGORY_FALLBACK = {
    career: 'WOOD',
    finance: 'WATER',
    relationship: 'FIRE',
    health: 'EARTH',
    general: 'EARTH'
  };

  /**
   * 取得開運水晶推薦（支援多屬性：喜水木可推薦水+木，並附互補說明）
   * @param {Object} baziResult - 八字結果（含 favorableElements.favorable）
   * @param {string} question - 用戶問題文字
   * @returns {{ targetElement: string, suggestedStones: string[], reasonText: string, keywords: string }}
   */
  function getCrystalRecommendation(baziResult, question) {
    var fav = [];

    if (baziResult && baziResult.favorableElements && baziResult.favorableElements.favorable) {
      fav = Array.isArray(baziResult.favorableElements.favorable)
        ? baziResult.favorableElements.favorable
        : [baziResult.favorableElements.favorable];
    }
    if (baziResult && baziResult.fullData && baziResult.fullData.favorableElements) {
      var fe = baziResult.fullData.favorableElements;
      if (fe.favorable) {
        fav = Array.isArray(fe.favorable) ? fe.favorable : [fe.favorable];
      }
    }

    var keys = [];
    for (var i = 0; i < fav.length && i < 3; i++) {
      if (fav[i] && ELEMENT_TO_KEY[fav[i]]) {
        keys.push(ELEMENT_TO_KEY[fav[i]]);
      }
    }

    if (keys.length === 0) {
      var cat = 'general';
      if (typeof getCategory === 'function') {
        cat = getCategory(question || '') || cat;
      } else if (typeof parseQuestion === 'function') {
        var parsed = parseQuestion(question || '');
        cat = (parsed && parsed.category) ? parsed.category : cat;
      }
      keys = [CATEGORY_FALLBACK[cat] || 'EARTH'];
    }

    var elements = [];
    var allStones = [];
    var descs = [];
    var keywordsSet = [];

    for (var j = 0; j < keys.length; j++) {
      var config = CRYSTAL_MAPPING[keys[j]] || CRYSTAL_MAPPING.EARTH;
      elements.push(config.element);
      if (config.stones && config.stones.length) {
        allStones = allStones.concat(config.stones);
      }
      if (config.desc) descs.push(config.desc);
      if (config.keywords) keywordsSet.push(config.keywords);
    }

    var targetElement = elements.join('、');
    var reasonText = descs[0] || '';

    if (keys.length >= 2) {
      var complement = [];
      for (var k = 0; k < keys.length - 1; k++) {
        if (ELEMENT_GENERATES[keys[k]] === keys[k + 1]) {
          complement.push(KEY_TO_ELEMENT[keys[k]] + '生' + KEY_TO_ELEMENT[keys[k + 1]]);
        }
      }
      if (complement.length > 0) {
        reasonText = (reasonText ? reasonText + ' ' : '') + '五行互補：' + complement.join('、') + '，兩種屬性搭配配戴更利氣場。';
      } else if (descs.length > 1) {
        reasonText = (reasonText ? reasonText + ' ' : '') + '多屬性搭配可兼顧不同面向的補強。';
      }
    }

    return {
      targetElement: targetElement,
      suggestedStones: allStones,
      reasonText: reasonText,
      keywords: keywordsSet.join('、')
    };
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CRYSTAL_MAPPING: CRYSTAL_MAPPING, getCrystalRecommendation: getCrystalRecommendation };
  } else {
    global.CRYSTAL_MAPPING = CRYSTAL_MAPPING;
    global.getCrystalRecommendation = getCrystalRecommendation;
  }
})(typeof window !== 'undefined' ? window : this);
