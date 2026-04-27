// ═══════════════════════════════════════════════════════════════
// 💰 靜月之光 — 定價動態載入器 (pricing-loader.js) v60-hotfix7
// 負責從 worker /pricing 拉取最新定價，並同步寫入兩個歷史遺留的全域變數：
//   - window.JY_PRICES    (ai-analysis.js / ui.js / tarot_upgrade.js 讀這個)
//   - window._JY_PRICING  (guide.js / tool-guide.js 讀這個)
// 這兩個名字是前端不同時期作者各自取的，結構相容但名字不同。
// 此 loader 一次餵飽兩邊，未來改價只改 worker.js 常數，所有 UI 文案自動同步。
//
// 載入位置：<head> 或 <body> 最前面，越早越好（要在 ui.js / ai-analysis.js 之前）
// 失敗處理：fetch 失敗時保留各檔案自己的 fallback 值（不會爆）
// ═══════════════════════════════════════════════════════════════

(function() {
  'use strict';

  var WORKER_URL = 'https://jy-ai-proxy.onerkk.workers.dev';
  var PRICING_CACHE_KEY = '_jy_pricing_cache';
  var PRICING_CACHE_TTL = 5 * 60 * 1000; // 5 分鐘本地快取

  // ── 硬編保底值(v64.B 與 worker 同步,worker 掛掉時用)──
  var HARDCODED_FALLBACK = {
    SUB_STANDARD: 999, SUB_PREMIUM: 1999,
    SINGLE_7D: 70, SINGLE_TAROT: 30, SINGLE_OOTK: 60,
    FOLLOWUP: 15,
    OPUS_7D: 140, OPUS_TAROT: 60, OPUS_OOTK: 120,
    OPUS_7D_MEMBER: 140, OPUS_TAROT_MEMBER: 60, OPUS_OOTK_MEMBER: 120,
    TAROT_DAILY_STANDARD: 1, TAROT_DAILY_PREMIUM: 2,
    D7_MONTHLY_STANDARD: 2, D7_MONTHLY_PREMIUM: 5,
    OPUS_MONTHLY_PREMIUM: 1, OPUS_MONTHLY_STANDARD: 0,
    FREE_TRIAL_PER_TOOL: 1,
    payMethods: {
      subscription: ['credit', 'atm', 'cvs'],
      single: ['credit'], opus_single: ['credit'], followup_single: ['credit']
    }
  };

  function _applyPricing(data) {
    if (!data || typeof data !== 'object') return;
    // 同時寫入兩個歷史變數，保持向下相容
    window.JY_PRICES = Object.assign({}, HARDCODED_FALLBACK, data);
    window._JY_PRICING = window.JY_PRICES; // 同一個物件，名字不同
    // 派發事件給已載入的 UI 可重繪（ui.js 的首頁文案、guide 的追問提示...）
    try {
      window.dispatchEvent(new CustomEvent('jy-pricing-updated', { detail: window.JY_PRICES }));
    } catch(_) {}
  }

  // ─── Step 1: 同步使用 localStorage 快取（0ms，保證 ui.js 載入時有值）───
  function _loadFromCache() {
    try {
      var raw = localStorage.getItem(PRICING_CACHE_KEY);
      if (!raw) return false;
      var cache = JSON.parse(raw);
      if (!cache || !cache._savedAt) return false;
      if (Date.now() - cache._savedAt > PRICING_CACHE_TTL * 12) return false; // 超過 1 小時不用
      _applyPricing(cache.data);
      return true;
    } catch(_) { return false; }
  }

  // ─── Step 2: 先填 fallback，確保全域絕對有值（避免 UI 讀到 undefined）───
  if (!window.JY_PRICES)    window.JY_PRICES = Object.assign({}, HARDCODED_FALLBACK);
  if (!window._JY_PRICING)  window._JY_PRICING = window.JY_PRICES;

  // ─── Step 3: 嘗試讀快取補正（仍是同步）───
  _loadFromCache();

  // ─── Step 4: 非同步向 worker 抓最新價（背景更新）───
  function _fetchFresh() {
    fetch(WORKER_URL + '/pricing', { method: 'GET' })
      .then(function(r) {
        if (!r.ok) throw new Error('pricing HTTP ' + r.status);
        return r.json();
      })
      .then(function(data) {
        _applyPricing(data);
        // 寫回本地快取
        try {
          localStorage.setItem(PRICING_CACHE_KEY, JSON.stringify({ data: data, _savedAt: Date.now() }));
        } catch(_) {}
      })
      .catch(function(err) {
        console.warn('[pricing-loader] 抓定價失敗，使用 fallback：', err && err.message);
        // 不做事，JY_PRICES / _JY_PRICING 已經有 fallback 值
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _fetchFresh);
  } else {
    _fetchFresh();
  }

  // 暴露一個手動重抓函式，供 admin 後台改價後即時驗證用
  window._jyReloadPricing = _fetchFresh;

})();
