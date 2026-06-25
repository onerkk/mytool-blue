// ═══════════════════════════════════════════════════════════════
// solar-location.js — 出生地點 + 真太陽時計算
// 靜月之光 v18.2（2026/6/25：參考時刻保留秒；固定偏移、DST 重疊／缺口均可追溯）
// ═══════════════════════════════════════════════════════════════

(function() {
'use strict';

// ═══ 城市資料庫 ═══
// 格式: [中文名, 經度, 緯度, 時區偏移(小時)]
var CITIES = {
  'TW': {
    name: '台灣', flag: '🇹🇼',
    cities: [
      ['台北', 121.56, 25.04, 8], ['新北', 121.47, 25.01, 8], ['桃園', 121.30, 24.99, 8],
      ['台中', 120.68, 24.15, 8], ['台南', 120.23, 22.99, 8], ['高雄', 120.31, 22.63, 8],
      ['基隆', 121.74, 25.13, 8], ['新竹', 120.97, 24.80, 8], ['嘉義', 120.45, 23.48, 8],
      ['苗栗', 120.82, 24.56, 8], ['彰化', 120.54, 24.08, 8], ['南投', 120.69, 23.91, 8],
      ['雲林', 120.53, 23.71, 8], ['屏東', 120.49, 22.67, 8], ['宜蘭', 121.75, 24.75, 8],
      ['花蓮', 121.60, 23.98, 8], ['台東', 121.14, 22.76, 8], ['澎湖', 119.56, 23.57, 8],
      ['金門', 118.32, 24.43, 8], ['連江(馬祖)', 119.94, 26.16, 8]
    ]
  },
  'CN': {
    name: '中國大陸', flag: '🇨🇳',
    cities: [
      ['北京', 116.41, 39.90, 8], ['上海', 121.47, 31.23, 8], ['廣州', 113.26, 23.13, 8],
      ['深圳', 114.06, 22.54, 8], ['成都', 104.07, 30.57, 8], ['重慶', 106.55, 29.56, 8],
      ['杭州', 120.15, 30.27, 8], ['武漢', 114.30, 30.59, 8], ['南京', 118.80, 32.06, 8],
      ['西安', 108.94, 34.26, 8], ['天津', 117.19, 39.13, 8], ['蘇州', 120.62, 31.30, 8],
      ['長沙', 112.97, 28.23, 8], ['鄭州', 113.65, 34.76, 8], ['瀋陽', 123.43, 41.80, 8],
      ['大連', 121.61, 38.91, 8], ['青島', 120.38, 36.07, 8], ['哈爾濱', 126.63, 45.75, 8],
      ['廈門', 118.09, 24.48, 8], ['福州', 119.30, 26.08, 8], ['昆明', 102.83, 25.02, 8],
      ['濟南', 117.00, 36.67, 8], ['合肥', 117.27, 31.86, 8], ['長春', 125.32, 43.88, 8],
      ['南昌', 115.86, 28.68, 8], ['貴陽', 106.71, 26.65, 8], ['南寧', 108.32, 22.82, 8],
      ['石家莊', 114.51, 38.04, 8], ['烏魯木齊', 87.62, 43.83, 8], ['拉薩', 91.11, 29.65, 8],
      ['呼和浩特', 111.75, 40.84, 8], ['太原', 112.55, 37.87, 8], ['蘭州', 103.83, 36.06, 8]
    ]
  },
  'HK': {
    name: '香港', flag: '🇭🇰',
    cities: [['香港', 114.17, 22.28, 8]]
  },
  'MO': {
    name: '澳門', flag: '🇲🇴',
    cities: [['澳門', 113.54, 22.20, 8]]
  },
  'SG': {
    name: '新加坡', flag: '🇸🇬',
    cities: [['新加坡', 103.85, 1.29, 8]]
  },
  'MY': {
    name: '馬來西亞', flag: '🇲🇾',
    cities: [
      ['吉隆坡', 101.69, 3.14, 8], ['檳城', 100.33, 5.42, 8], ['新山', 103.74, 1.49, 8],
      ['怡保', 101.08, 4.60, 8], ['古晉', 110.35, 1.55, 8], ['亞庇', 116.07, 5.98, 8]
    ]
  },
  'JP': {
    name: '日本', flag: '🇯🇵',
    cities: [
      ['東京', 139.69, 35.69, 9], ['大阪', 135.50, 34.69, 9], ['京都', 135.77, 35.01, 9],
      ['名古屋', 136.91, 35.18, 9], ['福岡', 130.42, 33.59, 9], ['札幌', 141.35, 43.06, 9],
      ['横浜', 139.64, 35.44, 9], ['神戶', 135.19, 34.69, 9], ['沖繩(那霸)', 127.68, 26.34, 9]
    ]
  },
  'KR': {
    name: '韓國', flag: '🇰🇷',
    cities: [
      ['首爾', 126.98, 37.57, 9], ['釜山', 129.08, 35.18, 9], ['仁川', 126.71, 37.46, 9],
      ['大邱', 128.60, 35.87, 9], ['大田', 127.38, 36.35, 9], ['濟州', 126.53, 33.51, 9]
    ]
  },
  'TH': {
    name: '泰國', flag: '🇹🇭',
    cities: [
      ['曼谷', 100.50, 13.76, 7], ['清邁', 98.99, 18.79, 7], ['普吉', 98.39, 7.88, 7]
    ]
  },
  'VN': {
    name: '越南', flag: '🇻🇳',
    cities: [
      ['胡志明市', 106.63, 10.82, 7], ['河內', 105.85, 21.03, 7], ['峴港', 108.22, 16.07, 7]
    ]
  },
  'PH': {
    name: '菲律賓', flag: '🇵🇭',
    cities: [['馬尼拉', 120.98, 14.60, 8], ['宿霧', 123.90, 10.32, 8]]
  },
  'ID': {
    name: '印尼', flag: '🇮🇩',
    cities: [
      ['雅加達', 106.85, -6.21, 7], ['峇里島', 115.19, -8.65, 8], ['泗水', 112.75, -7.25, 7]
    ]
  },
  'IN': {
    name: '印度', flag: '🇮🇳',
    cities: [
      ['新德里', 77.21, 28.61, 5.5], ['孟買', 72.88, 19.08, 5.5], ['班加羅爾', 77.59, 12.97, 5.5],
      ['清奈', 80.27, 13.08, 5.5], ['加爾各答', 88.36, 22.57, 5.5]
    ]
  },
  'US': {
    name: '美國', flag: '🇺🇸',
    cities: [
      ['紐約', -74.01, 40.71, -5], ['洛杉磯', -118.24, 34.05, -8], ['芝加哥', -87.63, 41.88, -6],
      ['休士頓', -95.37, 29.76, -6], ['舊金山', -122.42, 37.77, -8], ['西雅圖', -122.33, 47.61, -8],
      ['波士頓', -71.06, 42.36, -5], ['邁阿密', -80.19, 25.76, -5], ['拉斯維加斯', -115.14, 36.17, -8],
      ['華盛頓DC', -77.04, 38.91, -5], ['夏威夷(檀香山)', -157.86, 21.31, -10]
    ]
  },
  'CA': {
    name: '加拿大', flag: '🇨🇦',
    cities: [
      ['多倫多', -79.38, 43.65, -5], ['溫哥華', -123.12, 49.28, -8], ['蒙特婁', -73.57, 45.50, -5]
    ]
  },
  'GB': {
    name: '英國', flag: '🇬🇧',
    cities: [['倫敦', -0.13, 51.51, 0], ['曼徹斯特', -2.24, 53.48, 0], ['愛丁堡', -3.19, 55.95, 0]]
  },
  'AU': {
    name: '澳洲', flag: '🇦🇺',
    cities: [
      ['雪梨', 151.21, -33.87, 10], ['墨爾本', 144.96, -37.81, 10], ['布里斯本', 153.03, -27.47, 10],
      ['伯斯', 115.86, -31.95, 8]
    ]
  },
  'NZ': {
    name: '紐西蘭', flag: '🇳🇿',
    cities: [['奧克蘭', 174.76, -36.85, 12], ['威靈頓', 174.78, -41.29, 12]]
  },
  'DE': {
    name: '德國', flag: '🇩🇪',
    cities: [['柏林', 13.41, 52.52, 1], ['慕尼黑', 11.58, 48.14, 1]]
  },
  'FR': {
    name: '法國', flag: '🇫🇷',
    cities: [['巴黎', 2.35, 48.86, 1]]
  }
};


// IANA 時區：固定 UTC 偏移無法處理夏令時間與歷史時區變更。
// 城市陣列仍保留第 4 欄固定偏移作舊瀏覽器 fallback，第 5 欄由此表補上。
var CITY_TIMEZONE_IDS = {
  '台北':'Asia/Taipei','新北':'Asia/Taipei','桃園':'Asia/Taipei','台中':'Asia/Taipei','台南':'Asia/Taipei','高雄':'Asia/Taipei',
  '基隆':'Asia/Taipei','新竹':'Asia/Taipei','嘉義':'Asia/Taipei','苗栗':'Asia/Taipei','彰化':'Asia/Taipei','南投':'Asia/Taipei',
  '雲林':'Asia/Taipei','屏東':'Asia/Taipei','宜蘭':'Asia/Taipei','花蓮':'Asia/Taipei','台東':'Asia/Taipei','澎湖':'Asia/Taipei',
  '金門':'Asia/Taipei','連江(馬祖)':'Asia/Taipei',
  '北京':'Asia/Shanghai','上海':'Asia/Shanghai','廣州':'Asia/Shanghai','深圳':'Asia/Shanghai','成都':'Asia/Shanghai','重慶':'Asia/Shanghai',
  '杭州':'Asia/Shanghai','武漢':'Asia/Shanghai','南京':'Asia/Shanghai','西安':'Asia/Shanghai','天津':'Asia/Shanghai','蘇州':'Asia/Shanghai',
  '長沙':'Asia/Shanghai','鄭州':'Asia/Shanghai','瀋陽':'Asia/Shanghai','大連':'Asia/Shanghai','青島':'Asia/Shanghai','哈爾濱':'Asia/Shanghai',
  '廈門':'Asia/Shanghai','福州':'Asia/Shanghai','昆明':'Asia/Shanghai','濟南':'Asia/Shanghai','合肥':'Asia/Shanghai','長春':'Asia/Shanghai',
  '南昌':'Asia/Shanghai','貴陽':'Asia/Shanghai','南寧':'Asia/Shanghai','石家莊':'Asia/Shanghai','烏魯木齊':'Asia/Shanghai','拉薩':'Asia/Shanghai',
  '呼和浩特':'Asia/Shanghai','太原':'Asia/Shanghai','蘭州':'Asia/Shanghai',
  '香港':'Asia/Hong_Kong','澳門':'Asia/Macau','新加坡':'Asia/Singapore','吉隆坡':'Asia/Kuala_Lumpur','檳城':'Asia/Kuala_Lumpur',
  '新山':'Asia/Kuala_Lumpur','怡保':'Asia/Kuala_Lumpur','古晉':'Asia/Kuching','亞庇':'Asia/Kuching',
  '東京':'Asia/Tokyo','大阪':'Asia/Tokyo','京都':'Asia/Tokyo','名古屋':'Asia/Tokyo','福岡':'Asia/Tokyo','札幌':'Asia/Tokyo','横浜':'Asia/Tokyo','神戶':'Asia/Tokyo','沖繩(那霸)':'Asia/Tokyo',
  '首爾':'Asia/Seoul','釜山':'Asia/Seoul','仁川':'Asia/Seoul','大邱':'Asia/Seoul','大田':'Asia/Seoul','濟州':'Asia/Seoul',
  '曼谷':'Asia/Bangkok','清邁':'Asia/Bangkok','普吉':'Asia/Bangkok','胡志明市':'Asia/Ho_Chi_Minh','河內':'Asia/Ho_Chi_Minh','峴港':'Asia/Ho_Chi_Minh',
  '馬尼拉':'Asia/Manila','宿霧':'Asia/Manila','雅加達':'Asia/Jakarta','峇里島':'Asia/Makassar','泗水':'Asia/Jakarta',
  '新德里':'Asia/Kolkata','孟買':'Asia/Kolkata','班加羅爾':'Asia/Kolkata','清奈':'Asia/Kolkata','加爾各答':'Asia/Kolkata',
  '紐約':'America/New_York','洛杉磯':'America/Los_Angeles','芝加哥':'America/Chicago','休士頓':'America/Chicago','舊金山':'America/Los_Angeles',
  '西雅圖':'America/Los_Angeles','波士頓':'America/New_York','邁阿密':'America/New_York','拉斯維加斯':'America/Los_Angeles','華盛頓DC':'America/New_York','夏威夷(檀香山)':'Pacific/Honolulu',
  '多倫多':'America/Toronto','溫哥華':'America/Vancouver','蒙特婁':'America/Toronto',
  '倫敦':'Europe/London','曼徹斯特':'Europe/London','愛丁堡':'Europe/London',
  '雪梨':'Australia/Sydney','墨爾本':'Australia/Melbourne','布里斯本':'Australia/Brisbane','伯斯':'Australia/Perth',
  '奧克蘭':'Pacific/Auckland','威靈頓':'Pacific/Auckland','柏林':'Europe/Berlin','慕尼黑':'Europe/Berlin','巴黎':'Europe/Paris'
};

// ═══ 均時差（Equation of Time）計算 ═══
// Jean Meeus《Astronomical Algorithms》近似式；輸入必須是 UTC 瞬間，回傳分鐘。
function equationOfTimeMeeus(dateUtc) {
  var jd = dateUtc.getTime() / 86400000 + 2440587.5;
  var t = (jd - 2451545.0) / 36525.0;
  var rad = Math.PI / 180;
  var L0 = (280.46646 + t * (36000.76983 + t * 0.0003032)) % 360;
  if (L0 < 0) L0 += 360;
  var M = 357.52911 + t * (35999.05029 - 0.0001537 * t);
  var e = 0.016708634 - t * (0.000042037 + 0.0000001267 * t);
  var C = Math.sin(M * rad) * (1.914602 - t * (0.004817 + 0.000014 * t)) +
          Math.sin(2 * M * rad) * (0.019993 - 0.000101 * t) +
          Math.sin(3 * M * rad) * 0.000289;
  var trueLong = L0 + C; // 保留變數，便於與標準公式逐項核對
  void trueLong;
  var meanOb = 23 + (26 + (21.448 - t * (46.815 + t * (0.00059 - t * 0.001813))) / 60) / 60;
  var omega = 125.04 - 1934.136 * t;
  var ob = meanOb + 0.00256 * Math.cos(omega * rad);
  var y = Math.pow(Math.tan((ob / 2) * rad), 2);
  var eot = y * Math.sin(2 * L0 * rad) - 2 * e * Math.sin(M * rad) +
            4 * e * y * Math.sin(M * rad) * Math.cos(2 * L0 * rad) -
            0.5 * y * y * Math.sin(4 * L0 * rad) - 1.25 * e * e * Math.sin(2 * M * rad);
  return eot * 180 / Math.PI * 4;
}

function _parseOffsetString(str) {
  var m = String(str || '').match(/GMT(?:\s*)?([+-])(\d{1,2})(?::?(\d{2}))?/i);
  if (!m) return null;
  var sign = m[1] === '-' ? -1 : 1;
  return sign * (parseInt(m[2], 10) * 60 + parseInt(m[3] || '0', 10));
}

function _offsetAtInstant(ms, timeZoneId) {
  try {
    var parts = new Intl.DateTimeFormat('en-US', { timeZone: timeZoneId, timeZoneName: 'longOffset' }).formatToParts(new Date(ms));
    var zone = parts.filter(function (p) { return p.type === 'timeZoneName'; })[0];
    var parsed = _parseOffsetString(zone && zone.value);
    if (parsed != null) return parsed;
  } catch (e) {}
  // fallback：以該時區格式化後的牆鐘時間反推總偏移。
  try {
    var p = new Intl.DateTimeFormat('en-CA', { timeZone: timeZoneId, year:'numeric',month:'numeric',day:'numeric',hour:'numeric',minute:'numeric',second:'numeric',hour12:false }).formatToParts(new Date(ms));
    var o = {}; p.forEach(function (x) { if (x.type !== 'literal') o[x.type] = parseInt(x.value, 10); });
    if (o.hour === 24) o.hour = 0;
    return Math.round((Date.UTC(o.year, o.month - 1, o.day, o.hour, o.minute, o.second || 0) - ms) / 60000);
  } catch (e2) { return null; }
}

function _localPartsAt(ms, timeZoneId) {
  var parts = new Intl.DateTimeFormat('en-CA', { timeZone: timeZoneId, year:'numeric',month:'numeric',day:'numeric',hour:'numeric',minute:'numeric',second:'numeric',hour12:false }).formatToParts(new Date(ms));
  var o = {}; parts.forEach(function (x) { if (x.type !== 'literal') o[x.type] = parseInt(x.value, 10); });
  if (o.hour === 24) o.hour = 0;
  return o;
}

// 將 IANA 時區的民用牆鐘時間解析成標準偏移與 DST。遇重疊採較早一次；遇缺口採相容模式。
function resolveCivilTimeOffsets(year, month, day, hour, minute, second, timeZoneId, fallbackOffset) {
  second = Math.max(0, Math.min(59, parseInt(second || 0, 10) || 0));
  if (!timeZoneId || typeof Intl === 'undefined' || !Intl.DateTimeFormat) {
    var fixedMinutes = Number(fallbackOffset || 0) * 60;
    return {
      standardOffsetMinutes: fixedMinutes,
      dstOffsetMinutes: 0,
      totalOffsetMinutes: fixedMinutes,
      utcTimestamp: Date.UTC(year, month-1, day, hour, minute, second) - fixedMinutes * 60000,
      source: 'fixed-offset',
      civilTimeStatus: 'fixed-offset'
    };
  }
  var base = Date.UTC(year, month - 1, day, hour, minute, second);
  var probes = [base, base-86400000, base+86400000, Date.UTC(year,0,1), Date.UTC(year,6,1), base-183*86400000, base+183*86400000];
  var offsets = {};
  probes.forEach(function (ms) { var off = _offsetAtInstant(ms, timeZoneId); if (off != null) offsets[off] = true; });
  var candidates = [];
  Object.keys(offsets).forEach(function (k) {
    var off = parseInt(k,10), instant = base - off * 60000;
    try {
      var lp = _localPartsAt(instant, timeZoneId);
      if (lp.year===year && lp.month===month && lp.day===day && lp.hour===hour && lp.minute===minute && (lp.second||0)===second) candidates.push({instant:instant, offset:off});
    } catch(e) {}
  });
  candidates.sort(function(a,b){return a.instant-b.instant;});
  var selected = candidates[0];
  var civilTimeStatus = candidates.length > 1 ? 'ambiguous-earlier' : 'exact';
  if (!selected) {
    // 不存在的民用時間（例如春季 DST 跳時）採 compatible 慣例解析，並明確回報。
    var nearOff = _offsetAtInstant(base - Number(fallbackOffset || 0) * 3600000, timeZoneId);
    if (nearOff == null) nearOff = Number(fallbackOffset || 0) * 60;
    selected = { instant: base - nearOff * 60000, offset: nearOff };
    civilTimeStatus = 'nonexistent-compatible';
  }
  var jan = _offsetAtInstant(Date.UTC(year,0,1,12), timeZoneId);
  var jul = _offsetAtInstant(Date.UTC(year,6,1,12), timeZoneId);
  var standard = (jan == null || jul == null) ? selected.offset : Math.min(jan, jul);
  var dst = selected.offset - standard;
  return {
    standardOffsetMinutes:standard,
    dstOffsetMinutes:dst,
    totalOffsetMinutes:selected.offset,
    utcTimestamp:selected.instant,
    source:'iana',
    timeZoneId:timeZoneId,
    civilTimeStatus:civilTimeStatus
  };
}

// 輸入可維持舊格式，亦可在第 8 參數傳 IANA timezoneId，或第 7 參數直接傳 options。
function calcTrueSolarTime(year, month, day, hour, minute, longitude, tzOffset, timeZoneId) {
  var opt = (tzOffset && typeof tzOffset === 'object') ? tzOffset : { timezone:tzOffset, timezoneId:timeZoneId };
  var inputSecond = Math.max(0, Math.min(59, parseInt(opt.second || 0, 10) || 0));
  if (longitude == null || (opt.timezone == null && !opt.timezoneId)) {
    return { year:year, month:month, day:day, hour:hour, minute:minute, second:inputSecond, offset_minutes:0, note:'未提供出生地點', algorithm:'none' };
  }
  var resolved = resolveCivilTimeOffsets(year, month, day, hour, minute, inputSecond, opt.timezoneId, opt.timezone);
  var standardMeridian = resolved.standardOffsetMinutes / 60 * 15;
  var rawDiff = longitude - standardMeridian;
  var lonDiff = ((rawDiff + 540) % 360) - 180;
  var lonCorrection = lonDiff * 4;
  var eot = equationOfTimeMeeus(new Date(resolved.utcTimestamp));
  // 真太陽時＝民用時間＋經度差＋均時差－夏令時間。
  var totalOffset = lonCorrection + eot - resolved.dstOffsetMinutes;
  var baseUtc = Date.UTC(year, month - 1, day, hour, minute, inputSecond);
  var corrected = new Date(baseUtc + totalOffset * 60000);
  var pad = function(n){return String(n).padStart(2,'0');};
  var result = {
    year:corrected.getUTCFullYear(), month:corrected.getUTCMonth()+1, day:corrected.getUTCDate(),
    hour:corrected.getUTCHours(), minute:corrected.getUTCMinutes(), second:corrected.getUTCSeconds(),
    offset_minutes:totalOffset, offset_minutes_rounded:Math.round(totalOffset),
    longitudeCorrectionMinutes:lonCorrection, equationOfTimeMinutes:eot,
    standardOffsetMinutes:resolved.standardOffsetMinutes, dstOffsetMinutes:resolved.dstOffsetMinutes,
    standardMeridian:standardMeridian, timezoneId:opt.timezoneId || null, timezoneSource:resolved.source,
    civilTimeStatus:resolved.civilTimeStatus || null,
    algorithm:'meeus',
    trueSolarDateTime:corrected.getUTCFullYear()+'-'+pad(corrected.getUTCMonth()+1)+'-'+pad(corrected.getUTCDate())+' '+pad(corrected.getUTCHours())+':'+pad(corrected.getUTCMinutes())+':'+pad(corrected.getUTCSeconds())
  };
  result.note = '修正' + (totalOffset >= 0 ? '+' : '') + Math.round(totalOffset) + '分鐘' + (resolved.dstOffsetMinutes ? '（已扣夏令時間'+resolved.dstOffsetMinutes+'分）' : '');
  return result;
}

// ═══ 暴露給全域 ═══
window.BIRTH_CITIES = CITIES;
window.calcTrueSolarTime = calcTrueSolarTime;

// ═══ DOM 工具：填充國家和城市下拉 ═══
window.populateCountrySelect = function(selectId) {
  var sel = document.getElementById(selectId);
  if (!sel) return;
  sel.innerHTML = '<option value="">選擇國家/地區</option>';
  var keys = Object.keys(CITIES);
  // 台灣排第一
  var sorted = ['TW'].concat(keys.filter(function(k) { return k !== 'TW'; }));
  sorted.forEach(function(k) {
    var c = CITIES[k];
    var opt = document.createElement('option');
    opt.value = k;
    opt.textContent = c.flag + ' ' + c.name;
    sel.appendChild(opt);
  });
};

window.populateCitySelect = function(citySelectId, countryCode) {
  var sel = document.getElementById(citySelectId);
  if (!sel) return;
  sel.innerHTML = '<option value="">選擇城市</option>';
  if (!countryCode || !CITIES[countryCode]) return;
  CITIES[countryCode].cities.forEach(function(c, i) {
    var opt = document.createElement('option');
    opt.value = i;
    opt.textContent = c[0];
    sel.appendChild(opt);
  });
};

// 取得選中城市的經緯度和時區
window.getSelectedBirthLocation = function(countrySelectId, citySelectId) {
  var countrySel = document.getElementById(countrySelectId);
  var citySel = document.getElementById(citySelectId);
  if (!countrySel || !citySel) return null;
  var cc = countrySel.value;
  var ci = citySel.value;
  if (!cc || ci === '' || !CITIES[cc]) return null;
  var city = CITIES[cc].cities[parseInt(ci)];
  if (!city) return null;
  return {
    country: CITIES[cc].name,
    city: city[0],
    longitude: city[1],
    latitude: city[2],
    timezone: city[3],
    timezoneId: city[4] || CITY_TIMEZONE_IDS[city[0]] || null,
    label: CITIES[cc].flag + ' ' + CITIES[cc].name + ' ' + city[0]
  };
};

// ═══ 填充年月日下拉 ═══
window.populateDateSelects = function(yearId, monthId, dayId) {
  var ySel = document.getElementById(yearId);
  var mSel = document.getElementById(monthId);
  var dSel = document.getElementById(dayId);
  if (!ySel || !mSel || !dSel) return;

  // 年：1940-當前年份
  ySel.innerHTML = '<option value="">年</option>';
  var currentYear = new Date().getFullYear();
  for (var y = currentYear; y >= 1940; y--) {
    var o = document.createElement('option');
    o.value = y; o.textContent = y;
    ySel.appendChild(o);
  }

  // 月：1-12
  mSel.innerHTML = '<option value="">月</option>';
  for (var m = 1; m <= 12; m++) {
    var o = document.createElement('option');
    o.value = m; o.textContent = m + '月';
    mSel.appendChild(o);
  }

  // 日：1-31（根據年月動態更新）
  function updateDays() {
    var curVal = dSel.value;
    var yv = parseInt(ySel.value) || 2000;
    var mv = parseInt(mSel.value) || 1;
    var maxD = new Date(yv, mv, 0).getDate();
    dSel.innerHTML = '<option value="">日</option>';
    for (var d = 1; d <= maxD; d++) {
      var o = document.createElement('option');
      o.value = d; o.textContent = d + '日';
      dSel.appendChild(o);
    }
    if (curVal && parseInt(curVal) <= maxD) dSel.value = curVal;
  }
  ySel.addEventListener('change', updateDays);
  mSel.addEventListener('change', updateDays);
  updateDays();
};

window.populateTimeSelects = function(hourId, minuteId) {
  var hSel = document.getElementById(hourId);
  var miSel = document.getElementById(minuteId);
  if (!hSel || !miSel) return;

  hSel.innerHTML = '<option value="">時</option>';
  for (var h = 0; h <= 23; h++) {
    var o = document.createElement('option');
    o.value = h;
    var shichen = ['子','丑','丑','寅','寅','卯','卯','辰','辰','巳','巳','午','午','未','未','申','申','酉','酉','戌','戌','亥','亥','子'][h];
    o.textContent = (h < 10 ? '0' : '') + h + '時（' + shichen + '時）';
    hSel.appendChild(o);
  }

  miSel.innerHTML = '<option value="">分</option>';
  for (var mi = 0; mi <= 59; mi++) {
    var o = document.createElement('option');
    o.value = mi;
    o.textContent = (mi < 10 ? '0' : '') + mi + '分';
    miSel.appendChild(o);
  }
};

// ═══ 初始化所有下拉 ═══
window.initBirthForm = function() {
  // ── 第一組表單（#input-screen）──
  populateCountrySelect('f-country');
  populateDateSelects('f-byear', 'f-bmonth', 'f-bday');
  populateTimeSelects('f-bhour', 'f-bminute');
  var countrySel = document.getElementById('f-country');
  if (countrySel) {
    countrySel.addEventListener('change', function() {
      populateCitySelect('f-city', this.value);
    });
  }
  ['f-byear','f-bmonth','f-bday','f-bhour','f-bminute','f-country','f-city'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener('change', updateSolarTimePreview);
  });

  // ── 第二組表單（#tarot-to-full）──
  populateCountrySelect('f2-country');
  populateDateSelects('f2-byear', 'f2-bmonth', 'f2-bday');
  populateTimeSelects('f2-bhour', 'f2-bminute');
  var countrySel2 = document.getElementById('f2-country');
  if (countrySel2) {
    countrySel2.addEventListener('change', function() {
      populateCitySelect('f2-city', this.value);
    });
  }
  ['f2-byear','f2-bmonth','f2-bday','f2-bhour','f2-bminute','f2-country','f2-city'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener('change', function() { updateSolarTimePreview2(); });
  });
};

function updateSolarTimePreview() {
  _doSolarPreview('f-byear','f-bmonth','f-bday','f-bhour','f-bminute','f-country','f-city','solar-time-preview');
}
function updateSolarTimePreview2() {
  _doSolarPreview('f2-byear','f2-bmonth','f2-bday','f2-bhour','f2-bminute','f2-country','f2-city','solar-time-preview2');
}
function _doSolarPreview(yId,mId,dId,hId,miId,cId,ciId,previewId) {
  var preview = document.getElementById(previewId);
  if (!preview) return;
  var y = parseInt(document.getElementById(yId)?.value);
  var m = parseInt(document.getElementById(mId)?.value);
  var d = parseInt(document.getElementById(dId)?.value);
  var h = parseInt(document.getElementById(hId)?.value);
  var mi = parseInt(document.getElementById(miId)?.value);
  var loc = getSelectedBirthLocation(cId, ciId);

  if (!y || !m || !d || isNaN(h) || !loc) {
    preview.style.display = 'none';
    return;
  }
  if (isNaN(mi)) mi = 0;

  var result = calcTrueSolarTime(y, m, d, h, mi, loc.longitude, { timezone:loc.timezone, timezoneId:loc.timezoneId });
  var pad = function(n) { return (n < 10 ? '0' : '') + n; };
  var shichen = ['子','丑','丑','寅','寅','卯','卯','辰','辰','巳','巳','午','午','未','未','申','申','酉','酉','戌','戌','亥','亥','子'][result.hour] || '';
  
  preview.style.display = 'block';
  preview.innerHTML = 
    '<span style="color:var(--c-gold);font-weight:600">☀ 真太陽時：' + pad(result.hour) + ':' + pad(result.minute) + ':' + pad(result.second || 0) + '</span>' +
    '<span style="opacity:.7">（' + shichen + '時｜' + result.note + '）</span>';
}

})();

// ★ v30b：自動初始化出生表單下拉（年月日時分國家城市）
document.addEventListener('DOMContentLoaded', function() {
  if (typeof initBirthForm === 'function') initBirthForm();
});
