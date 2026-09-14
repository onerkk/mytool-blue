// ══════════════════════════════════════════════════════════════════════
// 🌌 前端星曆升級 ephemeris-client.js
//
// 設計：
//   - 在 computeNatalChart / computeJyotish 算完後,呼叫 worker /ephemeris
//     不再部分覆寫命盤；完整西洋入口由 JYWestern 原子化計算。
//   - 失敗時靜默降級（保持原本 Meeus 結果）
//   - KV 快取讓同分鐘出生的人共用,延遲幾乎為 0
//
// 整合方式：
//   ui.js 在 computeNatalChart 後呼叫 await window._JY_EPHEMERIS.upgradeNatal(natal, ...)
//   也可以呼叫 await window._JY_EPHEMERIS.upgradeJyotish(jyotish, ...)
// ══════════════════════════════════════════════════════════════════════

(function() {
  'use strict';

  var WORKER_URL = (typeof window !== 'undefined' && window._JY_WORKER_URL)
    || 'https://jy-ai-proxy.onerkk.workers.dev';

  // 把 worker 回傳的英文 planets 對應回中文（與 bazi.js 內部命名相容）
  var EN_TO_ZH = {
    Sun: '太陽', Moon: '月亮',
    Mercury: '水星', Venus: '金星', Mars: '火星',
    Jupiter: '木星', Saturn: '土星',
    Uranus: '天王', Neptune: '海王', Pluto: '冥王',
    Rahu: '北交', Ketu: '南交'
  };

  async function _fetchEphemeris(year, month, day, hour, minute, tz, mode) {
    try {
      var resp = await fetch(WORKER_URL + '/ephemeris', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          year: year, month: month, day: day,
          hour: hour, minute: minute,
          tz: (tz != null) ? tz : 8,
          mode: mode || 'tropical'
        })
      });
      if (!resp.ok) return null;
      var data = await resp.json();
      // meeus_fallback 的精度跟客戶端一樣,沒必要覆寫
      if (!data || !data.planets || data.source === 'meeus_fallback') return null;
      return data;
    } catch(_) {
      return null;
    }
  }

  // Keep the legacy chart internally consistent. Replacing only longitudes
  // invalidates its aspects, houses and derived analysis. The new independent
  // Western core computes an immutable snapshot; no mixed-source patch applies.
  async function upgradeNatal(natal, year, month, day, hour, minute, tz) {
    return natal;
  }

  // 升級 jyotish.planets 的 sidLon
  async function upgradeJyotish(jyotish, year, month, day, hour, minute, tz) {
    // A longitude-only patch leaves vargas, dignities, aspects and dashas stale.
    // Preserve the complete snapshot. The standalone Jyotisha core computes all
    // derived fields atomically from its local, independently checked ephemeris.
    return jyotish;
  }

  // 暴露 API
  window._JY_EPHEMERIS = {
    fetch: _fetchEphemeris,
    upgradeNatal: upgradeNatal,
    upgradeJyotish: upgradeJyotish,
    EN_TO_ZH: EN_TO_ZH
  };

})();
