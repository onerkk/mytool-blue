// ═══════════════════════════════════════════════════════════════
// solar-location.js — 出生地點 + 真太陽時計算
// 靜月之光 v17
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

// ═══ 均時差（Equation of Time）計算 ═══
// 返回分鐘數
function equationOfTime(year, month, day) {
  // Day of year
  var d = new Date(year, month - 1, day);
  var start = new Date(year, 0, 1);
  var N = Math.floor((d - start) / 86400000) + 1;
  var B = (360 / 365.242) * (N - 81) * Math.PI / 180; // radians
  return 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B);
}

// ═══ 真太陽時計算 ═══
// 輸入：年月日時分 + 出生地經度 + 時區偏移（小時）
// 輸出：{ year, month, day, hour, minute, offset_minutes, note }
function calcTrueSolarTime(year, month, day, hour, minute, longitude, tzOffset) {
  if (longitude == null || tzOffset == null) return { year: year, month: month, day: day, hour: hour, minute: minute, offset_minutes: 0, note: '未提供出生地點' };
  
  var standardMeridian = tzOffset * 15; // 標準子午線
  var lonCorrection = (longitude - standardMeridian) * 4; // 經度修正（分鐘）
  var eot = equationOfTime(year, month, day); // 均時差（分鐘）
  var totalOffset = lonCorrection + eot; // 總修正量（分鐘）
  
  // 修正時間
  var totalMinutes = hour * 60 + minute + totalOffset;
  
  // 處理跨日
  var newDay = day, newMonth = month, newYear = year;
  if (totalMinutes >= 1440) {
    totalMinutes -= 1440;
    newDay++;
    var maxDay = new Date(newYear, newMonth, 0).getDate();
    if (newDay > maxDay) { newDay = 1; newMonth++; }
    if (newMonth > 12) { newMonth = 1; newYear++; }
  } else if (totalMinutes < 0) {
    totalMinutes += 1440;
    newDay--;
    if (newDay < 1) { newMonth--; if (newMonth < 1) { newMonth = 12; newYear--; } newDay = new Date(newYear, newMonth, 0).getDate(); }
  }
  
  var newHour = Math.floor(totalMinutes / 60);
  var newMinute = Math.round(totalMinutes % 60);
  
  return {
    year: newYear, month: newMonth, day: newDay,
    hour: newHour, minute: newMinute,
    offset_minutes: Math.round(totalOffset),
    note: '修正' + (totalOffset >= 0 ? '+' : '') + Math.round(totalOffset) + '分鐘'
  };
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
    label: CITIES[cc].flag + ' ' + CITIES[cc].name + ' ' + city[0]
  };
};

// ═══ 填充年月日下拉 ═══
window.populateDateSelects = function(yearId, monthId, dayId) {
  var ySel = document.getElementById(yearId);
  var mSel = document.getElementById(monthId);
  var dSel = document.getElementById(dayId);
  if (!ySel || !mSel || !dSel) return;

  // 年：1940-2026
  ySel.innerHTML = '<option value="">年</option>';
  for (var y = 2026; y >= 1940; y--) {
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

  var result = calcTrueSolarTime(y, m, d, h, mi, loc.longitude, loc.timezone);
  var pad = function(n) { return (n < 10 ? '0' : '') + n; };
  var shichen = ['子','丑','丑','寅','寅','卯','卯','辰','辰','巳','巳','午','午','未','未','申','申','酉','酉','戌','戌','亥','亥','子'][result.hour] || '';
  
  preview.style.display = 'block';
  preview.innerHTML = 
    '<span style="color:var(--c-gold);font-weight:600">☀ 真太陽時：' + pad(result.hour) + ':' + pad(result.minute) + '</span>' +
    '<span style="opacity:.7">（' + shichen + '時｜' + result.note + '）</span>';
}

})();
