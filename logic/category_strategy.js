/**
 * 題型策略表 (Category Strategy Map)
 * 不同題型：baseRate、權重、Top 因子來源、結論/建議模板、塔羅宮位權重 必須不同，否則輸出會過度相似。
 * fusionEngine 以 category 為主 key 驅動：機率、因子選擇、建議生成。
 */
(function (global) {
  'use strict';

  /** 題型關鍵詞字典：用於 questionTokens 抽取與 template/evidence 選擇 */
  var CATEGORY_KEYWORDS = {
    love: ['桃花', '告白', '復合', '曖昧', '婚姻', '第三者', '感情', '姻緣', '正緣', '緣份', '交往', '分手', '伴侶', '戀愛', '約會', '相親'],
    career: ['創業', '合作', '轉職', '升遷', '面試', '業績', '職涯', '工作', '考績', '調動', '離職', '錄取', '客戶', '專案'],
    wealth: ['投資', '現金流', '收入', '破萬', '破十萬', '財運', '副業', '銷售', '賣出', '加薪', '理財', '貸款', '負債'],
    health: ['健康', '病', '手術', '恢復', '作息', '飲食', '身心', '運動', '體檢'],
    relationship: ['人際', '貴人', '溝通', '同事', '朋友', '客戶', '互動', '交際', '客訴', '關係維護'],
    family: ['家庭', '家人', '購屋', '買房', '父母', '子女', '婆媳'],
    general: ['整體運勢', '時機', '準備', '達標', '成功']
  };

  var CATEGORY_STRATEGY = {
    love: {
      baseRate: 0.50,
      weights: { bazi: 0.40, ziwei: 0.10, nameology: 0.05, meihua: 0.25, tarot: 0.35 },
      topFactorKeys: ['八字運勢', '塔羅牌陣', '卦象吉凶'],
      tarotPositionWeights: { 4: 1.2, 5: 1.0, 6: 1.1, 10: 1.3 },
      mandatoryPhrases: ['互動', '界線', '主動性', '桃花', '緣分'],
      conclusionOpeners: ['以感情與姻緣來看', '從桃花與互動來看'],
      suggestionPool: ['主動表達心意但避免過度急切', '創造共同話題與回憶', '觀察對方反應', '先釐清自己的真實需求', '給彼此空間'],
      templatePool: ['以感情與姻緣來看', '從桃花與互動來看', '感情方面']
    },
    career: {
      baseRate: 0.45,
      weights: { bazi: 0.45, ziwei: 0.10, nameology: 0.05, meihua: 0.25, tarot: 0.30 },
      topFactorKeys: ['八字運勢', '卦象吉凶', '塔羅牌陣'],
      tarotPositionWeights: { 7: 1.2, 8: 1.0, 10: 1.3 },
      mandatoryPhrases: ['資源', '合作', '定位', '事業', '職涯'],
      conclusionOpeners: ['以事業與工作發展來看', '從職涯與資源來看'],
      suggestionPool: ['把握近期表現機會', '加強專業技能與人脈', '主動爭取可見度', '沉潛進修等待時機', '檢視現職發展空間', '避免衝動離職'],
      templatePool: ['以事業與工作發展來看', '從職涯與資源來看', '事業方面']
    },
    wealth: {
      baseRate: 0.40,
      weights: { bazi: 0.50, ziwei: 0.08, nameology: 0.07, meihua: 0.25, tarot: 0.25 },
      topFactorKeys: ['八字運勢', '卦象吉凶', '塔羅牌陣'],
      tarotPositionWeights: { 6: 1.0, 8: 1.2, 10: 1.2 },
      mandatoryPhrases: ['現金流', '風險控管', '財運', '收入', '投資'],
      conclusionOpeners: ['以本月收入與財運來看', '從現金流與風險控管來看'],
      suggestionPool: ['開源與節流並行', '分散投資降低風險', '建立緊急預備金', '保守理財避免高槓桿', '檢視固定支出', '延後大額消費決策'],
      templatePool: ['以本月收入與財運來看', '從現金流與風險控管來看', '財運方面']
    },
    health: {
      baseRate: 0.55,
      weights: { bazi: 0.55, ziwei: 0.08, nameology: 0.02, meihua: 0.20, tarot: 0.25 },
      topFactorKeys: ['八字運勢', '塔羅牌陣', '卦象吉凶'],
      tarotPositionWeights: { 9: 1.2, 10: 1.2 },
      mandatoryPhrases: ['作息', '飲食', '身心', '健康'],
      conclusionOpeners: ['以健康狀況來看', '從身心與作息來看'],
      suggestionPool: ['規律作息與飲食', '依醫囑追蹤治療', '適度運動與放鬆', '固定就寢時間、避免睡前滑手機', '飲食清淡、定時定量', '適度伸展與運動', '壓力管理與休息', '避開過敏原、留意環境', '必要時尋求專業諮詢'],
      templatePool: ['以健康狀況來看', '從身心與作息來看', '今年健康偏穩', '今年健康有壓力', '今年健康需保守', '今年健康尚可', '今年健康有波動', '今年健康需留意', '今年健康偏穩留意飲食', '今年健康留意健檢與預防']
    },
    relationship: {
      baseRate: 0.50,
      weights: { bazi: 0.40, ziwei: 0.10, nameology: 0.05, meihua: 0.28, tarot: 0.32 },
      topFactorKeys: ['八字運勢', '塔羅牌陣', '卦象吉凶'],
      tarotPositionWeights: { 4: 1.1, 6: 1.1, 10: 1.2 },
      mandatoryPhrases: ['人際', '溝通', '貴人', '客戶', '互動', '合作'],
      conclusionOpeners: ['以客戶互動與人際來看', '從溝通與合作關係來看'],
      suggestionPool: ['主動維繫客戶關係、定期關心需求', '開會前先釐清目標與分工', '遇爭議先傾聽再回應', '真誠溝通避免猜測', '尊重界限不強求', '選擇合適時機表達'],
      templatePool: ['以客戶互動與人際來看', '從溝通與合作關係來看', '今年人際與客戶互動尚可', '今年客戶之間互動偏穩', '今年人際與貴人尚可']
    },
    family: {
      baseRate: 0.50,
      weights: { bazi: 0.45, ziwei: 0.10, nameology: 0.10, meihua: 0.25, tarot: 0.30 },
      topFactorKeys: ['八字運勢', '卦象吉凶', '塔羅牌陣'],
      tarotPositionWeights: { 4: 1.1, 10: 1.2 },
      mandatoryPhrases: ['家人', '家庭', '共識'],
      conclusionOpeners: ['以家庭與家人來看', '從家人互動來看'],
      suggestionPool: ['傾聽家人需求', '避免在氣頭上做決定', '尋求第三方客觀意見'],
      templatePool: ['以家庭與家人來看', '從家人互動來看']
    },
    general: {
      baseRate: 0.50,
      weights: { bazi: 0.40, ziwei: 0.10, nameology: 0.05, meihua: 0.30, tarot: 0.30 },
      topFactorKeys: ['八字運勢', '卦象吉凶', '塔羅牌陣'],
      tarotPositionWeights: { 10: 1.2 },
      mandatoryPhrases: ['整體', '時機', '準備'],
      conclusionOpeners: ['以整體運勢來看', '從各維度象徵綜合看'],
      suggestionPool: ['依具體問題拆解步驟', '設定短期可達成目標', '定期檢視進度與調整'],
      templatePool: ['以整體運勢來看', '從各維度象徵綜合看']
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

  /** 從問題文本依 category 抽取關鍵詞 → questionTokens（供 template/evidence/advice 選擇） */
  function extractQuestionTokens(questionText, category) {
    var q = String(questionText || '');
    var cat = (category || 'general').toString().toLowerCase();
    var keys = CATEGORY_KEYWORDS[cat] || CATEGORY_KEYWORDS.general;
    var tokens = [];
    if (keys && keys.length) {
      for (var i = 0; i < keys.length; i++) {
        if (q.indexOf(keys[i]) >= 0 && tokens.indexOf(keys[i]) < 0) tokens.push(keys[i]);
      }
    }
    var allKeys = [];
    Object.keys(CATEGORY_KEYWORDS).forEach(function (k) {
      var arr = CATEGORY_KEYWORDS[k] || [];
      arr.forEach(function (w) { if (allKeys.indexOf(w) < 0) allKeys.push(w); });
    });
    allKeys.forEach(function (w) {
      if (q.indexOf(w) >= 0 && tokens.indexOf(w) < 0) tokens.push(w);
    });
    return tokens;
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CATEGORY_STRATEGY, CATEGORY_KEYWORDS, getStrategy, normalizeCategory, extractQuestionTokens };
  } else {
    global.CATEGORY_STRATEGY = CATEGORY_STRATEGY;
    global.CATEGORY_KEYWORDS = CATEGORY_KEYWORDS;
    global.getCategoryStrategy = getStrategy;
    global.normalizeCategoryForStrategy = normalizeCategory;
    global.extractQuestionTokens = extractQuestionTokens;
  }
})(typeof window !== 'undefined' ? window : this);
