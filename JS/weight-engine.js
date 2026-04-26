// ══════════════════════════════════════════════════════════════════════
// 🎯 可學習權重引擎 weight-engine.js
//
// 設計目標：
//   1. 七維度權重不再硬編，從 worker /weights 動態載入
//   2. 按 (focusType × timeScale × model) 分桶儲存
//   3. 從 feedback 統計回算權重（簡化版梯度下降）
//   4. 漸進部署：worker 不回傳就用 fallback 硬編值
//
// 載入方式：在 ai-analysis.js 之前載入
// 用法：
//   var w = window._JY_WEIGHTS.get('love', 'short', 'opus');
//   // → { bazi: 0.18, ziwei: 0.12, tarot: 0.25, ... }
//   var conf = window._JY_WEIGHTS.confidence('love', 'short');
//   // → 1.0 (完整資料) | 0.7 (btime unknown) | 0.4 (沒生日)
// ══════════════════════════════════════════════════════════════════════

(function() {
  'use strict';

  var WORKER_URL = (typeof window !== 'undefined' && window._JY_WORKER_URL)
    || 'https://jy-ai-proxy.onerkk.workers.dev';
  var CACHE_KEY = '_jy_weights_cache';
  var CACHE_TTL = 30 * 60 * 1000; // 30 分鐘本地快取（後端通常更慢更新）

  // ── 硬編 fallback（與當前各 analyzer 平均分布相符的 baseline）──
  // 用在 worker 沒回傳時保底。各維度權重和 = 1.0
  // 設計原則：
  //   short timeScale（當下/本週）：塔羅、梅花權重高（即時抽取，符合「現在」訊號）
  //   mid timeScale（本月/半年）：八字、紫微權重高（命盤穩定結構）
  //   long timeScale（人生方向）：八字、姓名、吠陀權重高（先天命局）
  var FALLBACK_WEIGHTS = {
    // focusType -> timeScale -> { dimension: weight }
    love: {
      short: { bazi:0.10, ziwei:0.10, meihua:0.18, tarot:0.30, natal:0.10, jyotish:0.10, name:0.04, dayun:0.08 },
      mid:   { bazi:0.18, ziwei:0.18, meihua:0.10, tarot:0.18, natal:0.12, jyotish:0.10, name:0.04, dayun:0.10 },
      long:  { bazi:0.22, ziwei:0.20, meihua:0.05, tarot:0.10, natal:0.14, jyotish:0.14, name:0.05, dayun:0.10 }
    },
    career: {
      short: { bazi:0.12, ziwei:0.12, meihua:0.18, tarot:0.22, natal:0.10, jyotish:0.10, name:0.04, dayun:0.12 },
      mid:   { bazi:0.20, ziwei:0.20, meihua:0.10, tarot:0.14, natal:0.10, jyotish:0.10, name:0.04, dayun:0.12 },
      long:  { bazi:0.24, ziwei:0.20, meihua:0.05, tarot:0.08, natal:0.12, jyotish:0.13, name:0.06, dayun:0.12 }
    },
    wealth: {
      short: { bazi:0.14, ziwei:0.12, meihua:0.18, tarot:0.20, natal:0.08, jyotish:0.10, name:0.04, dayun:0.14 },
      mid:   { bazi:0.22, ziwei:0.18, meihua:0.10, tarot:0.14, natal:0.08, jyotish:0.10, name:0.04, dayun:0.14 },
      long:  { bazi:0.26, ziwei:0.18, meihua:0.05, tarot:0.08, natal:0.10, jyotish:0.12, name:0.07, dayun:0.14 }
    },
    health: {
      short: { bazi:0.20, ziwei:0.10, meihua:0.15, tarot:0.15, natal:0.08, jyotish:0.15, name:0.02, dayun:0.15 },
      mid:   { bazi:0.25, ziwei:0.12, meihua:0.08, tarot:0.10, natal:0.10, jyotish:0.18, name:0.02, dayun:0.15 },
      long:  { bazi:0.30, ziwei:0.12, meihua:0.05, tarot:0.05, natal:0.12, jyotish:0.20, name:0.04, dayun:0.12 }
    },
    relationship: {
      short: { bazi:0.10, ziwei:0.12, meihua:0.18, tarot:0.28, natal:0.10, jyotish:0.10, name:0.04, dayun:0.08 },
      mid:   { bazi:0.18, ziwei:0.18, meihua:0.10, tarot:0.18, natal:0.12, jyotish:0.10, name:0.04, dayun:0.10 },
      long:  { bazi:0.22, ziwei:0.20, meihua:0.05, tarot:0.10, natal:0.14, jyotish:0.14, name:0.05, dayun:0.10 }
    },
    family: {
      short: { bazi:0.14, ziwei:0.16, meihua:0.14, tarot:0.18, natal:0.10, jyotish:0.10, name:0.06, dayun:0.12 },
      mid:   { bazi:0.20, ziwei:0.20, meihua:0.08, tarot:0.12, natal:0.10, jyotish:0.10, name:0.08, dayun:0.12 },
      long:  { bazi:0.24, ziwei:0.20, meihua:0.05, tarot:0.06, natal:0.10, jyotish:0.12, name:0.10, dayun:0.13 }
    },
    general: {
      short: { bazi:0.14, ziwei:0.14, meihua:0.16, tarot:0.20, natal:0.10, jyotish:0.10, name:0.04, dayun:0.12 },
      mid:   { bazi:0.20, ziwei:0.18, meihua:0.10, tarot:0.14, natal:0.10, jyotish:0.10, name:0.06, dayun:0.12 },
      long:  { bazi:0.24, ziwei:0.18, meihua:0.05, tarot:0.08, natal:0.12, jyotish:0.13, name:0.08, dayun:0.12 }
    }
  };

  // ── 模型對權重的微調（opus 對複雜訊號更敏感，可信度更高）──
  // 乘以 base 權重後再 normalize
  var MODEL_MULTIPLIER = {
    'opus':   { bazi:1.05, ziwei:1.05, meihua:1.0, tarot:1.0, natal:1.05, jyotish:1.05, name:1.0, dayun:1.05 },
    'sonnet': { bazi:1.0,  ziwei:1.0,  meihua:1.0, tarot:1.0, natal:1.0,  jyotish:1.0,  name:1.0, dayun:1.0  },
    'haiku':  { bazi:0.95, ziwei:0.95, meihua:1.05, tarot:1.05, natal:0.95, jyotish:0.95, name:1.0, dayun:0.95 }
  };

  // ── 內部狀態 ──
  var _weights = null;     // worker 回傳的可學習權重（覆寫 FALLBACK）
  var _loaded = false;
  var _loadingPromise = null;

  function _normalize(w) {
    var sum = 0;
    var keys = Object.keys(w);
    keys.forEach(function(k){ sum += (typeof w[k] === 'number' ? w[k] : 0); });
    if (sum <= 0) return w;
    var out = {};
    keys.forEach(function(k){ out[k] = w[k] / sum; });
    return out;
  }

  function _applyModelMul(base, model) {
    var mul = MODEL_MULTIPLIER[model] || MODEL_MULTIPLIER.sonnet;
    var out = {};
    Object.keys(base).forEach(function(k){
      out[k] = base[k] * (mul[k] || 1.0);
    });
    return _normalize(out);
  }

  // ── 從 worker 拉學習過的權重（背景載入，非阻塞）──
  function _fetchWeights() {
    if (_loadingPromise) return _loadingPromise;
    _loadingPromise = fetch(WORKER_URL + '/weights', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    }).then(function(r){
      if (!r.ok) throw new Error('weights HTTP ' + r.status);
      return r.json();
    }).then(function(data){
      if (data && typeof data === 'object' && data.weights) {
        _weights = data.weights;
        // 寫快取
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify({ data: data, _savedAt: Date.now() }));
        } catch(_){}
      }
      _loaded = true;
      try { window.dispatchEvent(new CustomEvent('jy-weights-loaded', { detail: _weights })); } catch(_){}
    }).catch(function(){
      _loaded = true; // 失敗也標記 loaded（用 fallback）
    });
    return _loadingPromise;
  }

  function _loadFromCache() {
    try {
      var raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return false;
      var cache = JSON.parse(raw);
      if (!cache || !cache._savedAt) return false;
      if (Date.now() - cache._savedAt > CACHE_TTL) return false;
      if (cache.data && cache.data.weights) {
        _weights = cache.data.weights;
        return true;
      }
    } catch(_){}
    return false;
  }

  // ── public API ──
  // get(focusType, timeScale, model) → { bazi:0.xx, ziwei:0.xx, ... }
  function get(focusType, timeScale, model) {
    var ft = focusType || 'general';
    var ts = timeScale || 'mid';
    var md = model || 'sonnet';
    // 找學習過的
    var learned = _weights && _weights[ft] && _weights[ft][ts];
    var base = learned || (FALLBACK_WEIGHTS[ft] && FALLBACK_WEIGHTS[ft][ts])
            || FALLBACK_WEIGHTS.general[ts]
            || FALLBACK_WEIGHTS.general.mid;
    return _applyModelMul(base, md);
  }

  // ── 信心折扣（給 Bug #5 出生時間不確定降權使用）──
  // 回傳 0..1 的折扣係數，越接近 0 表示信心越低
  // 不同維度對「精確時辰」的依賴度不同：
  //   - 紫微（依時支起命宮）→ btime 必需，沒時辰信心降到 0.4
  //   - 上升星座（每 2 小時換一個）→ 沒時辰幾乎不可信，0.3
  //   - 宮位（natal/jyotish）→ 同上升，依賴強
  //   - 八字時柱（最後一柱）→ 影響 25% 權重
  //   - 大運起運（依男女陽陰 + 節氣 → 不太依賴時辰精確）→ 0.85
  //   - 塔羅、梅花、姓名 → 不依賴時辰 → 1.0
  var TIME_DEPENDENCY = {
    bazi:    { full: 1.0, btime_unknown: 0.75, no_birth: 0.0 },  // 八字四柱缺時柱 → 25% 信號損失
    ziwei:   { full: 1.0, btime_unknown: 0.40, no_birth: 0.0 },  // 紫微強依賴時支
    natal:   { full: 1.0, btime_unknown: 0.30, no_birth: 0.0 },  // 上升 + 宮位
    jyotish: { full: 1.0, btime_unknown: 0.30, no_birth: 0.0 },  // 同 natal
    dayun:   { full: 1.0, btime_unknown: 0.85, no_birth: 0.0 },  // 大運起運受影響但有限
    meihua:  { full: 1.0, btime_unknown: 1.0,  no_birth: 1.0 },  // 完全不依賴
    tarot:   { full: 1.0, btime_unknown: 1.0,  no_birth: 1.0 },
    name:    { full: 1.0, btime_unknown: 1.0,  no_birth: 0.8 }   // 名字不依賴時辰，但失生肖時略降
  };

  // confidenceMatrix(birthState) → { bazi:0.75, ziwei:0.4, natal:0.3, ... }
  // birthState: 'full' | 'btime_unknown' | 'no_birth'
  function confidenceMatrix(birthState) {
    var st = birthState || 'full';
    var out = {};
    Object.keys(TIME_DEPENDENCY).forEach(function(dim){
      var t = TIME_DEPENDENCY[dim];
      out[dim] = (t && typeof t[st] === 'number') ? t[st] : 1.0;
    });
    return out;
  }

  // ── 套用信心矩陣後重新 normalize 權重 ──
  // 例：btime unknown 時，紫微 weight × 0.4，其他維度按比例補回
  function getAdjusted(focusType, timeScale, model, birthState) {
    var w = get(focusType, timeScale, model);
    var conf = confidenceMatrix(birthState);
    var adjusted = {};
    Object.keys(w).forEach(function(k){
      adjusted[k] = w[k] * (conf[k] != null ? conf[k] : 1.0);
    });
    return _normalize(adjusted);
  }

  // ── 推斷 birthState ──
  function inferBirthState(form) {
    if (!form) return 'no_birth';
    if (!form.bdate || !form.y) return 'no_birth';
    if (form.btimeUnknown || !form.btime || !form.h) return 'btime_unknown';
    return 'full';
  }

  // ── 推斷 timeScale 從 question 文字 ──
  // 短期：今天/本週/最近、馬上、即將、現在
  // 中期：本月、明年、半年內、未來幾個月
  // 長期：人生、命運、天賦、為什麼總是、長期、大方向
  var SHORT_RE = /(今天|這週|本週|最近|現在|馬上|即將|這次|這個月)/;
  var MID_RE = /(本月|明年|半年|今年|未來|幾個月|下半年|下個月)/;
  var LONG_RE = /(人生|命運|天賦|為什麼|總是|長期|大方向|靈魂|使命|前世|業力|一輩子|藍圖)/;
  function inferTimeScale(question) {
    var q = question || '';
    if (LONG_RE.test(q)) return 'long';
    if (SHORT_RE.test(q)) return 'short';
    if (MID_RE.test(q)) return 'mid';
    return 'mid'; // 預設中期
  }

  // ── 啟動：先讀快取 → 背景拉新版 ──
  _loadFromCache();
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', _fetchWeights);
    } else {
      setTimeout(_fetchWeights, 100);
    }
  }

  // ── 暴露 API ──
  window._JY_WEIGHTS = {
    get: get,
    getAdjusted: getAdjusted,
    confidenceMatrix: confidenceMatrix,
    inferBirthState: inferBirthState,
    inferTimeScale: inferTimeScale,
    isLoaded: function(){ return _loaded; },
    reload: _fetchWeights,
    // 給 admin/debug 用
    _getRaw: function(){ return _weights || FALLBACK_WEIGHTS; }
  };

})();
