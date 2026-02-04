/**
 * C1) domain-to-symbol mapping：不同類別使用不同象徵映射，集中管理。
 * 八字／紫微／塔羅／梅花／姓名學／稱骨 依 domain 取對應語義，健康類不得用桃花詞。
 */
(function (global) {
  'use strict';

  var DOMAIN_SYMBOL = {
    love: {
      bazi: { focus: ['官殺', '財星', '桃花神煞', '合沖'], label: '感情' },
      ziwei: { palaces: ['夫妻'], stars: ['桃花星', '祿存'], label: '感情' },
      tarot: { positions: [4, 5, 6, 10], focus: '感情與關係' },
      meihua: { focus: ['咸', '恆', '家人', '泰'], label: '感情卦' },
      nameology: { focus: ['人格', '地格', '外格'], label: '人緣感情' },
      chenggu: '僅背景，不作主證'
    },
    career: {
      bazi: { focus: ['官殺', '印', '食傷'], label: '事業職位壓力表現' },
      ziwei: { palaces: ['官祿'], stars: ['紫微', '天府'], label: '事業' },
      tarot: { positions: [7, 8, 10], focus: '事業與發展' },
      meihua: { focus: ['乾', '晉', '升', '大有'], label: '事業卦' },
      nameology: { focus: ['人格', '總格'], label: '事業領導' },
      chenggu: '僅背景，不作主證'
    },
    wealth: {
      bazi: { focus: ['財星', '食傷生財'], label: '收入回款偏財' },
      ziwei: { palaces: ['財帛'], stars: ['武曲', '天府'], label: '財運' },
      tarot: { positions: [6, 8, 10], focus: '財富與資源' },
      meihua: { focus: ['乾', '坤', '大有', '泰'], label: '財運卦' },
      nameology: { focus: ['人格', '地格', '總格'], label: '財運數理' },
      chenggu: '僅背景，不作主證'
    },
    health: {
      bazi: { focus: ['五行偏枯', '金木水火土對應部位'], label: '風險提示，避免醫療斷言' },
      ziwei: { palaces: ['疾厄'], stars: ['天梁', '廉貞'], label: '健康' },
      tarot: { positions: [9, 10], focus: '身心狀態' },
      meihua: { focus: ['復', '頤', '無妄'], label: '健康卦' },
      nameology: { focus: ['人格', '地格'], label: '健康為輔' },
      chenggu: '僅背景，不作主證'
    },
    relationship: {
      bazi: { focus: ['官殺', '印', '比劫'], label: '人際貴人' },
      ziwei: { palaces: ['遷移', '交友'], label: '人際' },
      tarot: { positions: [4, 6, 10], focus: '人際與溝通' },
      meihua: { focus: ['同人', '咸', '革'], label: '人際卦' },
      nameology: { focus: ['人格', '外格'], label: '人際' },
      chenggu: '僅背景，不作主證'
    },
    family: {
      bazi: { focus: ['印', '官殺'], label: '家庭' },
      ziwei: { palaces: ['田宅', '父母'], label: '家庭' },
      tarot: { positions: [4, 10], focus: '家庭與根基' },
      meihua: { focus: ['家人', '泰', '同人'], label: '家庭卦' },
      nameology: { focus: ['人格', '地格', '總格'], label: '家庭' },
      chenggu: '僅背景，不作主證'
    },
    general: {
      bazi: { focus: ['流年流月', '用忌'], label: '綜合' },
      ziwei: { palaces: ['命宮', '官祿', '財帛', '夫妻'], label: '綜合' },
      tarot: { positions: [10], focus: '整體' },
      meihua: { focus: [], label: '綜合' },
      nameology: { focus: ['人格', '地格', '外格', '總格'], label: '綜合' },
      chenggu: '可作背景與總體氣質'
    },
    other: {
      bazi: { focus: [], label: '綜合' },
      ziwei: { palaces: ['命宮'], label: '綜合' },
      tarot: { positions: [10], focus: '整體' },
      meihua: { focus: [], label: '綜合' },
      nameology: { focus: ['總格'], label: '綜合' },
      chenggu: '僅背景'
    }
  };

  function getDomainSymbol(domain) {
    var d = (domain || 'general').toString().toLowerCase();
    return DOMAIN_SYMBOL[d] || DOMAIN_SYMBOL.general;
  }

  function getBaziFocus(domain) {
    var sym = getDomainSymbol(domain);
    return (sym && sym.bazi && sym.bazi.focus) ? sym.bazi.focus : [];
  }

  function isChengguOnlyBackground(domain) {
    var sym = getDomainSymbol(domain || 'general');
    return (sym.chenggu === '僅背景，不作主證' || sym.chenggu === '僅背景');
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DOMAIN_SYMBOL: DOMAIN_SYMBOL, getDomainSymbol: getDomainSymbol, getBaziFocus: getBaziFocus, isChengguOnlyBackground: isChengguOnlyBackground };
  } else {
    global.DOMAIN_SYMBOL = DOMAIN_SYMBOL;
    global.getDomainSymbol = getDomainSymbol;
    global.getBaziFocus = getBaziFocus;
    global.isChengguOnlyBackground = isChengguOnlyBackground;
  }
})(typeof window !== 'undefined' ? window : this);
