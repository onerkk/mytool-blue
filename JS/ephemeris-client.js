// ══════════════════════════════════════════════════════════════════════
// 🌌 前端星曆升級 ephemeris-client.js
//
// 設計：
//   - 在 computeNatalChart / computeJyotish 算完後,呼叫 worker /ephemeris
//     拿到 JPL Horizons 等高精度星曆,覆寫 natal.planets.lon
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

  // 升級 natal.planets 的 lon（保留 lat / sign / sign info 等其他欄位重新計算）
  // 注意：這只覆寫 planet.lon,sign 等需要 caller 重算
  async function upgradeNatal(natal, year, month, day, hour, minute, tz) {
    if (!natal || !natal.planets) return natal;
    var data = await _fetchEphemeris(year, month, day, hour, minute, tz, 'tropical');
    if (!data || !data.planets) return natal;

    Object.keys(data.planets).forEach(function(en) {
      var zh = EN_TO_ZH[en];
      if (!zh || !natal.planets[zh]) return;
      var p = data.planets[en];
      if (typeof p.lon !== 'number') return;
      // 覆寫 lon,並重算 sign 資訊
      natal.planets[zh].lon = p.lon;
      if (typeof p.lat === 'number') natal.planets[zh].lat = p.lat;
      // 重算 sign 資訊（找 12 星座區段）
      if (typeof window._getSign === 'function') {
        var s = window._getSign(p.lon);
        Object.assign(natal.planets[zh], {
          sign: s.name, signIdx: s.idx, signDeg: s.deg,
          signSym: s.sym, el: s.el
        });
      }
    });
    natal._ephemerisSource = data.source;
    return natal;
  }

  // 升級 jyotish.planets 的 sidLon
  async function upgradeJyotish(jyotish, year, month, day, hour, minute, tz) {
    if (!jyotish || !jyotish.planets) return jyotish;
    var data = await _fetchEphemeris(year, month, day, hour, minute, tz, 'tropical');
    if (!data || !data.planets) return jyotish;

    var ayanamsa = jyotish.ayanamsa || 0;
    // 用同一個 ayanamsa 把 tropical 換成 sidereal
    function _toSid(lon) {
      var s = (lon - ayanamsa) % 360;
      return s < 0 ? s + 360 : s;
    }

    Object.keys(data.planets).forEach(function(en) {
      var pl = jyotish.planets[en];
      if (!pl) return;
      var p = data.planets[en];
      if (typeof p.lon !== 'number') return;
      pl.tropLon = p.lon;
      pl.sidLon = _toSid(p.lon);
      // 重算 rashi/nakshatra 等
      if (typeof window.jyGetRashi === 'function') {
        var r = window.jyGetRashi(pl.sidLon);
        pl.rashiIdx = r.idx; pl.rashi = r.rashi; pl.degInSign = r.deg;
      }
      if (typeof window.jyGetNakshatra === 'function') {
        var n = window.jyGetNakshatra(pl.sidLon);
        pl.naksIdx = n.idx; pl.nakshatra = n.nakshatra;
        pl.naksPada = n.pada; pl.naksLord = n.lord;
      }
    });
    jyotish._ephemerisSource = data.source;
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
