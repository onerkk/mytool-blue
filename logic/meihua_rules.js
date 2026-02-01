/**
 * 梅花易數規則：體用、吉凶映射、類型建議模板
 * 供梅花解讀與融合引擎參考
 */
(function (global) {
  'use strict';

  var LUCK_MAP = {
    '大吉': 85, '吉': 70, '中吉': 65, '小吉': 58,
    '平': 50,
    '小凶': 42, '凶': 35, '中凶': 28, '大凶': 15
  };

  /** 體用關係 → 吉凶提示（對應 meihua-system 的 relation.type） */
  var TI_YONG_HINT = {
    shengTi: '用生體，大吉，事可成。',
    tiShengYong: '體生用，小吉，需付出。',
    keTi: '用克體，凶，需謹慎。',
    tiKeYong: '體克用，中吉，可主動。',
    biHe: '體用比和，吉，順遂。',
    '用生體': '用生體，大吉，事可成。',
    '體生用': '體生用，小吉，需付出。',
    '用剋體': '用克體，凶，需謹慎。',
    '體剋用': '體克用，中吉，可主動。',
    '比和': '體用比和，吉，順遂。'
  };

  /** 依問題類型的卦象建議（卦名關鍵字） */
  var GUA_ADVICE_BY_TYPE = {
    love: {
      favorable: ['咸', '恆', '家人', '泰', '同人', '兌'],
      unfavorable: ['睽', '革', '訟', '否'],
      advice: { favorable: '卦象利感情，宜把握時機表達。', unfavorable: '卦象提示阻礙，宜先釐清再行動。' }
    },
    career: {
      favorable: ['乾', '晉', '大有', '升', '革'],
      unfavorable: ['困', '坎', '蹇', '屯'],
      advice: { favorable: '卦象利事業，可積極爭取。', unfavorable: '卦象提示變數，宜穩紮穩打。' }
    },
    wealth: {
      favorable: ['大有', '泰', '乾', '萃'],
      unfavorable: ['否', '困', '剝'],
      advice: { favorable: '卦象利財，可謹慎投資。', unfavorable: '卦象提示保守，勿過度擴張。' }
    },
    health: {
      favorable: ['復', '頤', '無妄'],
      unfavorable: ['剝', '姤', '坎'],
      advice: { favorable: '卦象利康復，宜規律調養。', unfavorable: '卦象提示留意，及早就醫。' }
    },
    relationship: {
      favorable: ['咸', '兌', '中孚', '比'],
      unfavorable: ['訟', '睽', '革'],
      advice: { favorable: '卦象利人際，宜真誠溝通。', unfavorable: '卦象提示謹慎，注意界線。' }
    },
    family: {
      favorable: ['家人', '泰', '大有', '同人'],
      unfavorable: ['訟', '睽', '否'],
      advice: { favorable: '卦象利家庭，宜傾聽包容。', unfavorable: '卦象提示先釐清，勿急躁。' }
    },
    general: {
      favorable: [],
      unfavorable: [],
      advice: { favorable: '卦象尚可，順勢而為。', unfavorable: '卦象有阻，謹慎為上。' }
    }
  };

  function getLuckScore(luckStr) {
    return LUCK_MAP[luckStr] != null ? LUCK_MAP[luckStr] : 50;
  }

  function getTiYongHint(tiYongObjOrKey) {
    var key = typeof tiYongObjOrKey === 'object' && tiYongObjOrKey ? (tiYongObjOrKey.relation || tiYongObjOrKey.type) : tiYongObjOrKey;
    return TI_YONG_HINT[key] || TI_YONG_HINT[String(key)] || '';
  }

  /**
   * @param {Object} meihua - 梅花結果，含 benGua/卦名、luck、tiYong
   * @param {string} type - love|career|wealth|health|general
   * @returns {{ advice: string, timing: string }}
   */
  function getTypeAdvice(meihua, type) {
    var advice = '';
    var timing = '';

    if (!meihua) return { advice: advice, timing: timing };

    var benGuaObj = meihua.benGua;
    var bianGuaObj = meihua.bianGua || meihua.changed;
    var benName = (typeof benGuaObj === 'object' && benGuaObj && benGuaObj.name) ? benGuaObj.name : (meihua.hexagramName || meihua.name || '');
    var bianName = (typeof bianGuaObj === 'object' && bianGuaObj && bianGuaObj.name) ? bianGuaObj.name : '';
    var guaName = String(benName).replace(/為|卦/g, '');
    var guaNameBian = String(bianName).replace(/為|卦/g, '');
    var config = GUA_ADVICE_BY_TYPE[type] || GUA_ADVICE_BY_TYPE.general;
    var fav = config.favorable || [];
    var unfav = config.unfavorable || [];
    var benFav = fav.some(function (g) { return guaName.indexOf(g) >= 0; });
    var benUnfav = unfav.some(function (g) { return guaName.indexOf(g) >= 0; });
    var bianFav = guaNameBian && fav.some(function (g) { return guaNameBian.indexOf(g) >= 0; });
    var bianUnfav = guaNameBian && unfav.some(function (g) { return guaNameBian.indexOf(g) >= 0; });
    var isFav = bianFav || (benFav && !bianUnfav);
    var isUnfav = bianUnfav || (benUnfav && !bianFav);

    if (isUnfav) advice = config.advice.unfavorable || '';
    else if (isFav) advice = config.advice.favorable || '';

    var luck = meihua.luck || (benGuaObj && benGuaObj.luck) || meihua.jiXiong || '平';
    if (/吉/.test(luck)) timing = '時機偏向有利，可把握近期。';
    else if (/凶/.test(luck)) timing = '時機尚不成熟，建議觀望。';
    else timing = '時機中性，可依具體狀況判斷。';

    return { advice: advice, timing: timing };
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { LUCK_MAP, TI_YONG_HINT, getLuckScore, getTiYongHint, getTypeAdvice };
  } else {
    global.MeihuaRules = {
      LUCK_MAP: LUCK_MAP,
      TI_YONG_HINT: TI_YONG_HINT,
      getLuckScore: getLuckScore,
      getTiYongHint: getTiYongHint,
      getTypeAdvice: getTypeAdvice
    };
  }
})(typeof window !== 'undefined' ? window : this);
