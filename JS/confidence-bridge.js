// ══════════════════════════════════════════════════════════════════════
// 🎯 信心降權橋接 confidence-bridge.js
//
// 設計：
//   - 在 ai-analysis.js / _buildPayload 之後插入這層
//   - 從 weight-engine.js 取得當前狀況的權重 + 信心矩陣
//   - 把降權後的權重塞進 prompt 的 metadata 給 AI 參考
//   - 同時調整 dimension scores 的合成方式
//
// 載入順序：
//   weight-engine.js → confidence-bridge.js → ai-analysis.js
//
// 對 _buildPayload 的影響：
//   payload.weights = { bazi: 0.18, ziwei: 0.12, ... }   // 加入動態權重
//   payload.confidence = { bazi: 1.0, ziwei: 0.4, ... }   // 加入信心矩陣
//   payload.timeScale = 'mid'                              // 推斷的時間尺度
//   payload.birthState = 'btime_unknown'                   // 出生資料完整度
// ══════════════════════════════════════════════════════════════════════

(function() {
  'use strict';

  // ── 確保 _JY_WEIGHTS 已載入 ──
  function _ensureWeightsReady() {
    if (window._JY_WEIGHTS) return Promise.resolve();
    return new Promise(function(resolve) {
      // 等 weight-engine.js 載入
      var attempts = 0;
      var t = setInterval(function() {
        attempts++;
        if (window._JY_WEIGHTS || attempts > 100) {
          clearInterval(t);
          resolve();
        }
      }, 50);
    });
  }

  // ── 取得當前狀況的權重與信心矩陣 ──
  function getContextualWeights(form, model) {
    if (!window._JY_WEIGHTS) {
      // weight-engine 還沒載入 → 回傳 null，讓 caller 用 fallback
      return null;
    }
    var W = window._JY_WEIGHTS;
    var birthState = W.inferBirthState(form);
    var question = (form && form.question) || '';
    var timeScale = W.inferTimeScale(question);
    var focusType = (form && form.type) || 'general';
    var modelName = (model && typeof model === 'string') ? model.toLowerCase() : 'sonnet';
    // 提取核心 model 名（去掉版本號）
    var modelKey = 'sonnet';
    if (modelName.indexOf('opus') >= 0) modelKey = 'opus';
    else if (modelName.indexOf('haiku') >= 0) modelKey = 'haiku';
    else if (modelName.indexOf('sonnet') >= 0) modelKey = 'sonnet';

    return {
      birthState: birthState,
      timeScale: timeScale,
      focusType: focusType,
      modelKey: modelKey,
      // 不調整：純權重
      rawWeights: W.get(focusType, timeScale, modelKey),
      // 信心矩陣
      confidence: W.confidenceMatrix(birthState),
      // 調整後：權重 × 信心，再 normalize
      adjustedWeights: W.getAdjusted(focusType, timeScale, modelKey, birthState)
    };
  }

  // ── 公開 API ──
  window._JY_CONFIDENCE = {
    getContextualWeights: getContextualWeights,
    ensureReady: _ensureWeightsReady,

    // 供 _buildPayload 直接呼叫，往 payload 注入信心相關欄位
    enrichPayload: function(payload, form, model) {
      var ctx = getContextualWeights(form, model);
      if (!ctx) return payload;
      payload.weights = ctx.adjustedWeights;
      payload.rawWeights = ctx.rawWeights;
      payload.confidence = ctx.confidence;
      payload.timeScale = ctx.timeScale;
      payload.birthState = ctx.birthState;
      // 對 AI 的暗示：哪幾個維度應該降低引用權重
      var lowConfDims = [];
      Object.keys(ctx.confidence).forEach(function(d){
        if (ctx.confidence[d] < 0.5) lowConfDims.push(d);
      });
      if (lowConfDims.length) {
        payload.lowConfidenceDims = lowConfDims;
      }
      return payload;
    },

    // 給 dimension synthesizer 用：把每個 dim 的 score 乘上其權重 × 信心，再加總
    weightedScore: function(dimResults, form, model) {
      var ctx = getContextualWeights(form, model);
      if (!ctx) return null;
      var w = ctx.adjustedWeights;
      var totalScore = 0;
      var totalWeight = 0;
      Object.keys(dimResults).forEach(function(dim) {
        var d = dimResults[dim];
        if (!d || typeof d.score !== 'number') return;
        var weight = w[dim];
        if (weight == null) return;
        totalScore += d.score * weight;
        totalWeight += weight;
      });
      return {
        weighted: totalWeight > 0 ? (totalScore / totalWeight) : 50,
        coverage: totalWeight,
        usedWeights: w
      };
    }
  };

})();
