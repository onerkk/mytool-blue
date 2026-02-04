/**
 * 4) 投機/樂透專用 evidence mapping：各系統在 lottery=true 時要抓的訊號與輸出 tags
 */
(function (global) {
  'use strict';

  var FINANCE_LOTTERY_MAPPING = {
    bazi: {
      focus: ['偏財', '正財', '食傷生財', '比劫奪財', '流月財星旺衰', '沖合'],
      tags: ['偏財機會', '投機風險', '守財', '破財點'],
      label: '八字（偏財/投機）'
    },
    ziwei: {
      focus: ['財帛宮', '福德宮', '遷移', '交友', '化祿', '化忌'],
      tags: ['外財機會', '偏財', '風險'],
      label: '紫微'
    },
    tarot: {
      focus: ['金錢', '機會', '風險'],
      output: ['winChance', 'riskLevel'],
      label: '塔羅'
    },
    meihua: {
      focus: ['求財', '世應', '生克', '變卦趨勢'],
      tags: ['偏向', '阻力'],
      label: '梅花易數'
    },
    chenggu: {
      useAs: 'background_only',
      label: '稱骨（僅背景，不得作為投機結論主因）'
    }
  };

  function getLotteryMapping(system) {
    return FINANCE_LOTTERY_MAPPING[system] || null;
  }

  function isLotteryBackgroundOnly(system) {
    var m = FINANCE_LOTTERY_MAPPING[system];
    return m && m.useAs === 'background_only';
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { FINANCE_LOTTERY_MAPPING: FINANCE_LOTTERY_MAPPING, getLotteryMapping: getLotteryMapping, isLotteryBackgroundOnly: isLotteryBackgroundOnly };
  } else {
    global.FINANCE_LOTTERY_MAPPING = FINANCE_LOTTERY_MAPPING;
    global.getLotteryMapping = getLotteryMapping;
    global.isLotteryBackgroundOnly = isLotteryBackgroundOnly;
  }
})(typeof window !== 'undefined' ? window : this);
