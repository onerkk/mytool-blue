/**
 * 題型策略表 (Category Strategy Map)
 * 不同題型：baseRate、權重、Top 因子來源、結論/建議模板、塔羅宮位權重 必須不同，否則輸出會過度相似。
 * fusionEngine 以 category 為主 key 驅動：機率、因子選擇、建議生成。
 */
(function (global) {
  'use strict';

  var CATEGORY_STRATEGY = {
    love: {
      baseRate: 0.50,
      weights: { bazi: 0.40, meihua: 0.25, tarot: 0.35 },
      topFactorKeys: ['八字運勢', '塔羅牌陣', '卦象吉凶'],
      tarotPositionWeights: { 4: 1.2, 5: 1.0, 6: 1.1, 10: 1.3 },
      mandatoryPhrases: ['互動', '界線', '主動性', '桃花', '緣分'],
      conclusionOpeners: ['以感情與姻緣來看', '從桃花與互動來看'],
      suggestionPool: ['主動表達心意但避免過度急切', '創造共同話題與回憶', '觀察對方反應', '先釐清自己的真實需求', '給彼此空間']
    },
    career: {
      baseRate: 0.45,
      weights: { bazi: 0.45, meihua: 0.25, tarot: 0.30 },
      topFactorKeys: ['八字運勢', '卦象吉凶', '塔羅牌陣'],
      tarotPositionWeights: { 7: 1.2, 8: 1.0, 10: 1.3 },
      mandatoryPhrases: ['資源', '合作', '定位', '事業', '職涯'],
      conclusionOpeners: ['以事業與工作發展來看', '從職涯與資源來看'],
      suggestionPool: ['把握近期表現機會', '加強專業技能與人脈', '主動爭取可見度', '沉潛進修等待時機', '檢視現職發展空間', '避免衝動離職']
    },
    wealth: {
      baseRate: 0.40,
      weights: { bazi: 0.50, meihua: 0.25, tarot: 0.25 },
      topFactorKeys: ['八字運勢', '卦象吉凶', '塔羅牌陣'],
      tarotPositionWeights: { 6: 1.0, 8: 1.2, 10: 1.2 },
      mandatoryPhrases: ['現金流', '風險控管', '財運', '收入', '投資'],
      conclusionOpeners: ['以本月收入與財運來看', '從現金流與風險控管來看'],
      suggestionPool: ['開源與節流並行', '分散投資降低風險', '建立緊急預備金', '保守理財避免高槓桿', '檢視固定支出', '延後大額消費決策']
    },
    health: {
      baseRate: 0.55,
      weights: { bazi: 0.55, meihua: 0.20, tarot: 0.25 },
      topFactorKeys: ['八字運勢', '塔羅牌陣', '卦象吉凶'],
      tarotPositionWeights: { 9: 1.2, 10: 1.2 },
      mandatoryPhrases: ['作息', '飲食', '身心', '健康'],
      conclusionOpeners: ['以健康狀況來看', '從身心與作息來看'],
      suggestionPool: ['規律作息與飲食', '依醫囑追蹤治療', '適度運動與放鬆']
    },
    relationship: {
      baseRate: 0.50,
      weights: { bazi: 0.40, meihua: 0.28, tarot: 0.32 },
      topFactorKeys: ['八字運勢', '塔羅牌陣', '卦象吉凶'],
      tarotPositionWeights: { 4: 1.1, 6: 1.1, 10: 1.2 },
      mandatoryPhrases: ['人際', '溝通', '貴人'],
      conclusionOpeners: ['以人際與貴人來看', '從溝通與緣分來看'],
      suggestionPool: ['真誠溝通避免猜測', '尊重界限不強求', '選擇合適時機表達']
    },
    family: {
      baseRate: 0.50,
      weights: { bazi: 0.45, meihua: 0.25, tarot: 0.30 },
      topFactorKeys: ['八字運勢', '卦象吉凶', '塔羅牌陣'],
      tarotPositionWeights: { 4: 1.1, 10: 1.2 },
      mandatoryPhrases: ['家人', '家庭', '共識'],
      conclusionOpeners: ['以家庭與家人來看', '從家人互動來看'],
      suggestionPool: ['傾聽家人需求', '避免在氣頭上做決定', '尋求第三方客觀意見']
    },
    general: {
      baseRate: 0.50,
      weights: { bazi: 0.40, meihua: 0.30, tarot: 0.30 },
      topFactorKeys: ['八字運勢', '卦象吉凶', '塔羅牌陣'],
      tarotPositionWeights: { 10: 1.2 },
      mandatoryPhrases: ['整體', '時機', '準備'],
      conclusionOpeners: ['以整體運勢來看', '從各維度象徵綜合看'],
      suggestionPool: ['依具體問題拆解步驟', '設定短期可達成目標', '定期檢視進度與調整']
    }
  };

  function getStrategy(category) {
    var c = (category || '').toString().toLowerCase();
    if (CATEGORY_STRATEGY[c]) return CATEGORY_STRATEGY[c];
    if (c === 'finance' || c === '財') return CATEGORY_STRATEGY.wealth;
    if (c === 'other') return CATEGORY_STRATEGY.general;
    return CATEGORY_STRATEGY.general;
  }

  function normalizeCategory(type) {
    var t = (type || '').toString().toLowerCase();
    if (['love', 'career', 'wealth', 'health', 'relationship', 'family', 'general'].indexOf(t) >= 0) return t;
    if (t === 'finance') return 'wealth';
    if (t === 'other') return 'general';
    return 'general';
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CATEGORY_STRATEGY, getStrategy, normalizeCategory };
  } else {
    global.CATEGORY_STRATEGY = CATEGORY_STRATEGY;
    global.getCategoryStrategy = getStrategy;
    global.normalizeCategoryForStrategy = normalizeCategory;
  }
})(typeof window !== 'undefined' ? window : this);
