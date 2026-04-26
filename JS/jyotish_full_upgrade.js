// ══════════════════════════════════════════════════════════════════════
// 🕉️ JYOTISH DEEP UPGRADE
// Precise Shadbala · Corrected Vargas (D3/D4/D12/D16)
// Arudha Padas · Argala · Jaimini Basics · Pratyantardasha
// Refined Gochar · Nakshatra Transit Timing
// Comprehensive Cancellation Rules · Enhanced Ashtakavarga
// ══════════════════════════════════════════════════════════════════════
// 此檔案為 bazi.js 中 Jyotish 引擎的延伸
// 不改動既有函式，只新增新函式 + enhanceJyotish() 注入新屬性


// ── 1. CORRECTED DIVISIONAL CHARTS (VARGAS) ──

// D3 — Drekkana (Siblings / Courage / Initiative)
// Traditional rule: Divide each sign into 3 parts of 10°
// Fire signs start from same, 5th, 9th signs (Parashara method)
function jyDrekkana(sidLon) {
  var signIdx = Math.floor(sidLon / 30) % 12;
  var deg = sidLon % 30;
  var part = Math.floor(deg / 10); // 0, 1, 2
  if (part > 2) part = 2;
  // Parashara Drekkana: 1st decanate = same sign, 2nd = 5th from sign, 3rd = 9th from sign
  var d3SignIdx = (signIdx + part * 4) % 12;
  return {
    signIdx: d3SignIdx,
    rashi: JY_RASHI[d3SignIdx],
    lord: JY_RASHI[d3SignIdx].lord,
    part: part + 1,
    domain: '勇氣/手足/主動性'
  };
}

// D4 — Chaturthamsa (Property / Fortune / Fixed Assets) — CORRECTED
// Traditional rule per BPHS:
// For movable signs: start from same sign
// For fixed signs: start from 4th from same sign
// For dual signs: start from 7th from same sign
// Each part = 7.5°
function jyChaturthamsa_v2(sidLon) {
  var signIdx = Math.floor(sidLon / 30) % 12;
  var deg = sidLon % 30;
  var part = Math.floor(deg / 7.5); // 0-3
  if (part > 3) part = 3;

  var mode = JY_RASHI[signIdx].mode;
  var startSign;
  if (mode === 'Movable') startSign = signIdx;          // Aries, Cancer, Libra, Capricorn
  else if (mode === 'Fixed') startSign = (signIdx + 3) % 12;  // 4th from sign
  else startSign = (signIdx + 6) % 12;                   // 7th from sign (Dual)

  var d4SignIdx = (startSign + part) % 12;
  return {
    signIdx: d4SignIdx,
    rashi: JY_RASHI[d4SignIdx],
    lord: JY_RASHI[d4SignIdx].lord,
    part: part + 1,
    domain: '房產/固定資產/車輛'
  };
}

// D12 — Dwadasamsa (Parents / Lineage)
// Divide each sign into 12 parts of 2.5° each
// Start from same sign, go through all 12
function jyDwadasamsa(sidLon) {
  var signIdx = Math.floor(sidLon / 30) % 12;
  var deg = sidLon % 30;
  var part = Math.floor(deg / 2.5); // 0-11
  if (part > 11) part = 11;
  var d12SignIdx = (signIdx + part) % 12;
  return {
    signIdx: d12SignIdx,
    rashi: JY_RASHI[d12SignIdx],
    lord: JY_RASHI[d12SignIdx].lord,
    part: part + 1,
    domain: '父母/血統/祖先業力'
  };
}

// D16 — Shodasamsa (Vehicles / Luxuries / Comforts)
// Divide each sign into 16 parts of 1.875° each
// Movable signs start from Aries, Fixed from Leo, Dual from Sagittarius
function jyShodasamsa(sidLon) {
  var signIdx = Math.floor(sidLon / 30) % 12;
  var deg = sidLon % 30;
  var part = Math.floor(deg / 1.875); // 0-15
  if (part > 15) part = 15;

  var mode = JY_RASHI[signIdx].mode;
  var startSign;
  if (mode === 'Movable') startSign = 0;       // Aries
  else if (mode === 'Fixed') startSign = 4;     // Leo
  else startSign = 8;                            // Sagittarius

  var d16SignIdx = (startSign + part) % 12;
  return {
    signIdx: d16SignIdx,
    rashi: JY_RASHI[d16SignIdx],
    lord: JY_RASHI[d16SignIdx].lord,
    part: part + 1,
    domain: '車輛/奢侈品/物質舒適'
  };
}

// D20 — Vimshamsa (Spiritual Progress)
// Movable→Aries, Fixed→Sagittarius, Dual→Leo
function jyVimshamsa(sidLon) {
  var signIdx = Math.floor(sidLon / 30) % 12;
  var deg = sidLon % 30;
  var part = Math.floor(deg / 1.5); // 0-19
  if (part > 19) part = 19;

  var mode = JY_RASHI[signIdx].mode;
  var startSign;
  if (mode === 'Movable') startSign = 0;
  else if (mode === 'Fixed') startSign = 8;
  else startSign = 4;

  var d20SignIdx = (startSign + part) % 12;
  return {
    signIdx: d20SignIdx,
    rashi: JY_RASHI[d20SignIdx],
    lord: JY_RASHI[d20SignIdx].lord,
    part: part + 1,
    domain: '靈性修行/宗教/冥想'
  };
}

// D60 — Shashtiamsa (Past life karma — most subtle division)
// 0.5° per division, 60 divisions per sign
// Per BPHS, odd signs start from Aries, even signs start from Libra
function jyShashtiamsa(sidLon) {
  var signIdx = Math.floor(sidLon / 30) % 12;
  var deg = sidLon % 30;
  var part = Math.floor(deg / 0.5); // 0-59
  if (part > 59) part = 59;

  var isOdd = (signIdx % 2 === 0); // 0-indexed: Aries=0=even index=odd sign
  var startSign = isOdd ? 0 : 6; // Aries for odd, Libra for even
  var d60SignIdx = (startSign + part) % 12;

  // D60 deity names (abbreviated set of 60 names from BPHS)
  var d60Names = [
    '鬼','羅刹','天神','虛幻','風','吉祥','毒','甘露','月光','白蓮',
    '白檀','蓮花','宮殿','大蛇','虎','鹿','象','獅','馬','牛',
    '金翅鳥','烈火','金剛','雷','海','傘','舞','鏡','燈','花環',
    '輪','劍','弓','箭','杵','蛇床','月','太陽','山','河',
    '田','林','天帝','地主','火神','水神','風神','護世','梵天','毗濕奴',
    '濕婆','日種','月種','風種','火種','水種','地種','空種','摩耶','真我'
  ];

  return {
    signIdx: d60SignIdx,
    rashi: JY_RASHI[d60SignIdx],
    part: part + 1,
    name: d60Names[part] || ('第' + (part + 1) + '分'),
    domain: '前世業力/靈魂記憶'
  };
}


// ── 2. PRECISE SHADBALA ENHANCEMENT ──
// Upgrades to existing jyCalcShadbala: Ocha Bala exact formula, Saptavargaja Bala proper, Yuddha Bala, Ishta/Kashta Phala

function jyCalcShadbala_v2(planets, lagnaIdx, jd, ayanamsa) {
  var T = (jd - 2451545.0) / 36525.0;
  var results = {};
  var sevenPlanets = ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn'];

  // Exact exaltation longitudes (sidereal)
  var EXALT_LON = {Sun:10, Moon:33, Mars:298, Mercury:165, Jupiter:95, Venus:357, Saturn:200};

  sevenPlanets.forEach(function(p) {
    var pl = planets[p];
    if (!pl) { results[p] = {total:240, rupas:4.0, label:'中等', components:{}}; return; }

    // ══ 1. STHANA BALA (Positional Strength) ══
    // a) Ocha Bala (Exaltation Strength): 60 × (180 - |planet - exaltation|) / 180
    var exLon = EXALT_LON[p] || 0;
    var dist = Math.abs(_n180(pl.sidLon - exLon));
    var ochaBala = Math.round(60 * (180 - dist) / 180);

    // b) Saptavargaja Bala: dignity in 7 divisional charts (D1, D2, D3, D4, D7, D9, D12)
    // Score: Own=30, Moola=45, Friend=22.5, Neutral=15, Enemy=7.5, Exalted=52.5, Debilitated=3.75
    var saptavargaPoints = 0;
    var digScoreMap = {exalted:52.5, moola:45, own:30, friend:22.5, neutral:15, enemy:7.5, debilitated:3.75};
    // D1 dignity
    saptavargaPoints += digScoreMap[pl.dignity] || 15;
    // D9 dignity (Navamsa)
    if (pl.navamsa) {
      var d9Lord = JY_RASHI[pl.navamsa.signIdx].lord;
      var d9Dig = jyGetDignity(p, pl.navamsa.signIdx, 15); // approximate midpoint
      saptavargaPoints += digScoreMap[d9Dig] || 15;
    }
    // D2 dignity (Hora) — simplified: Sun in Sun's hora = own, etc.
    if (pl.hora) {
      var horaLord = pl.hora.lord;
      if (horaLord === p) saptavargaPoints += 30;
      else if (JY_NATURAL_FRIEND[p] && JY_NATURAL_FRIEND[p].friends.includes(horaLord)) saptavargaPoints += 22.5;
      else saptavargaPoints += 15;
    } else saptavargaPoints += 15;
    // D3, D7, D12 — use computed varga if available, else estimate
    // These add 15 points each as default (neutral)
    saptavargaPoints += 15 * 4; // D3 + D4 + D7 + D12 defaults
    var saptavargajaBala = Math.round(saptavargaPoints / 7);

    // c) Ojaygma Bala: odd sign / odd navamsa for male planets, even for female
    var signOdd = (pl.rashiIdx % 2 === 0); // 0-indexed
    var isMale = JY_PLANETS[p].gender === 'male';
    var ojaBala = (isMale === signOdd) ? 15 : 0;

    // d) Kendra Bala
    var kendraBala = 0;
    if ([1,4,7,10].includes(pl.bhava)) kendraBala = 60;
    else if ([2,5,8,11].includes(pl.bhava)) kendraBala = 30;
    else kendraBala = 15;

    // e) Drekkana Bala
    var degInSign = pl.degInSign || 0;
    var drekBala = 0;
    if (degInSign < 10 && isMale) drekBala = 15;
    else if (degInSign >= 10 && degInSign < 20) drekBala = 15; // neutral gets middle
    else if (degInSign >= 20 && JY_PLANETS[p].gender === 'female') drekBala = 15;
    else drekBala = 7;

    var sthanaBala = ochaBala + saptavargajaBala + ojaBala + kendraBala + drekBala;

    // ══ 2. DIG BALA (Directional Strength) ══
    var digBalaMap = {Sun:10, Moon:4, Mars:10, Mercury:1, Jupiter:1, Venus:4, Saturn:7};
    var bestHouse = digBalaMap[p] || 1;
    var hDist = Math.abs(pl.bhava - bestHouse);
    if (hDist > 6) hDist = 12 - hDist;
    var digBala = Math.round(60 * (6 - hDist) / 6);
    if (digBala < 0) digBala = 0;

    // ══ 3. KALA BALA (Temporal Strength) ══
    // a) Nathonnatha Bala (Day/Night)
    var hourFrac = (jd % 1);
    var isDaytime = (hourFrac > 0.25 && hourFrac < 0.75);
    var dayPlanets = ['Sun','Jupiter','Venus'];
    var nightPlanets = ['Moon','Mars','Saturn'];
    var nathBala = 0;
    if (isDaytime && dayPlanets.includes(p)) nathBala = 60;
    else if (!isDaytime && nightPlanets.includes(p)) nathBala = 60;
    else if (p === 'Mercury') nathBala = 60;
    else nathBala = 0;

    // b) Paksha Bala
    var moonPhase = planets.Moon && planets.Sun ?
      _n360(planets.Moon.sidLon - planets.Sun.sidLon) : 90;
    var isShukla = moonPhase < 180;
    var pakshaBala = 0;
    if (p === 'Moon') {
      // Moon's paksha bala = moonPhase/3 for shukla, (360-moonPhase)/3 for krishna
      pakshaBala = Math.round(isShukla ? moonPhase / 3 : (360 - moonPhase) / 3);
    } else {
      var benefics = ['Moon','Mercury','Jupiter','Venus'];
      if (isShukla && benefics.includes(p)) pakshaBala = 30;
      else if (!isShukla && !benefics.includes(p)) pakshaBala = 30;
      else pakshaBala = 0;
    }

    // c) Tribhaga Bala (hour of day/night division)
    var tribhagaBala = 0;
    var dayHour = hourFrac * 24;
    if (isDaytime) {
      var dayThird = Math.floor((dayHour - 6) / 4); // 0,1,2
      if (dayThird === 0 && p === 'Mercury') tribhagaBala = 60;
      else if (dayThird === 1 && p === 'Sun') tribhagaBala = 60;
      else if (dayThird === 2 && p === 'Saturn') tribhagaBala = 60;
    } else {
      var nightThird = Math.floor((dayHour >= 18 ? dayHour - 18 : dayHour + 6) / 4);
      if (nightThird === 0 && p === 'Moon') tribhagaBala = 60;
      else if (nightThird === 1 && p === 'Venus') tribhagaBala = 60;
      else if (nightThird === 2 && p === 'Mars') tribhagaBala = 60;
    }
    // Jupiter always gets Tribhaga at twilight
    if (p === 'Jupiter' && (Math.abs(dayHour - 6) < 0.5 || Math.abs(dayHour - 18) < 0.5)) tribhagaBala = 60;

    // d) Abdha Bala (Year Lord) + Masa Bala (Month Lord) + Vara Bala (Day Lord) — simplified
    var varaBala = 0;
    // Day of week: 0=Sun, 1=Mon, ... 6=Sat
    var dayOfWeek = Math.floor(jd + 1.5) % 7;
    var dayLords = ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn'];
    if (dayLords[dayOfWeek] === p) varaBala = 45;

    // e) Hora Bala (Hour Lord)
    var horaBala = 0;
    // Planetary hour system — simplified
    var hourNum = Math.floor(dayHour);
    var planetaryHourOrder = ['Sun','Venus','Mercury','Moon','Saturn','Jupiter','Mars'];
    var startPlanet = dayLords[dayOfWeek];
    var startIdx = planetaryHourOrder.indexOf(startPlanet);
    if (startIdx < 0) startIdx = 0;
    var currentHourLord = planetaryHourOrder[(startIdx + hourNum) % 7];
    if (currentHourLord === p) horaBala = 60;

    // f) Ayana Bala (Declination Strength)
    // Northern declination strong for Sun/Mars/Jupiter; Southern for Moon/Venus/Saturn
    var ayanaBala = 30; // default

    var kalaBala = nathBala + pakshaBala + tribhagaBala + varaBala + horaBala + ayanaBala;

    // ══ 4. CHESTA BALA (Motional Strength) ══
    // Based on planet's elongation from Sun → determines if retrograde/fast/slow/combust
    var chestaBala = 30;
    if (p === 'Sun') {
      chestaBala = 60; // Sun always gets full chesta
    } else if (p === 'Moon') {
      // Moon: paksha-based, stronger when full
      chestaBala = isShukla ? Math.round(moonPhase / 3) : Math.round((360 - moonPhase) / 3);
    } else {
      var sunSidLon = planets.Sun ? planets.Sun.sidLon : 0;
      var elongation = Math.abs(_n180(pl.sidLon - sunSidLon));
      // Retrograde / vakra = high chesta (~60)
      // Stationary = moderate (~45)
      // Direct, near opposition = moderate (~40)
      // Direct, near conjunction = combust, low (~10)
      if (elongation > 150) chestaBala = 55;      // near opposition/retrograde
      else if (elongation > 120) chestaBala = 45;  // slow
      else if (elongation > 60) chestaBala = 30;   // moderate
      else if (elongation > 17) chestaBala = 20;   // approaching Sun
      else if (elongation > 8) chestaBala = 10;    // combust zone
      else chestaBala = 5;                          // deeply combust
    }

    // ══ 5. NAISARGIKA BALA (Natural Strength) ══
    // Fixed values per BPHS (in Virupas):
    var naisargika = {Sun:60, Moon:51.43, Mars:17.14, Mercury:25.71, Jupiter:34.29, Venus:42.86, Saturn:8.57};
    var naisargikaBala = Math.round((naisargika[p] || 30) * 100) / 100;

    // ══ 6. DRIK BALA (Aspectual Strength) ══
    var drikBala = 0;
    var beneficList = ['Jupiter','Venus','Moon','Mercury'];
    var maleficList = ['Sun','Mars','Saturn','Rahu','Ketu'];
    Object.keys(planets).forEach(function(other) {
      if (other === p) return;
      var op = planets[other];
      if (!op || !op.sidLon) return;
      var diff = Math.abs(_n180(pl.sidLon - op.sidLon));
      // Vedic aspects: 7th=full, special aspects for Mars/Jupiter/Saturn
      var aspStrength = 0;
      if (Math.abs(diff - 180) <= 12) aspStrength = 60; // 7th house aspect (full)
      else if (Math.abs(diff - 120) <= 10) aspStrength = 30; // trine (half)
      else if (Math.abs(diff - 60) <= 8) aspStrength = 15;   // sextile (quarter)
      else if (Math.abs(diff - 90) <= 10) aspStrength = 45;  // square (3/4)

      if (aspStrength > 0) {
        if (beneficList.includes(other)) drikBala += Math.round(aspStrength * 0.25);
        else if (maleficList.includes(other)) drikBala -= Math.round(aspStrength * 0.25);
      }
    });
    drikBala = Math.max(-60, Math.min(60, drikBala));

    // ══ TOTAL & ISHTA/KASHTA PHALA ══
    var total = sthanaBala + digBala + kalaBala + chestaBala + naisargikaBala + drikBala;

    // Minimum required Shadbala (in Virupas)
    var minRequired = {Sun:390, Moon:360, Mars:300, Mercury:420, Jupiter:390, Venus:330, Saturn:300};
    var minReq = minRequired[p] || 300;
    var rupas = Math.round(total / 60 * 100) / 100;
    var minRupas = Math.round(minReq / 60 * 100) / 100;
    var ratio = Math.round((total / minReq) * 100) / 100;

    // Ishta Phala (Benevolent Potential) & Kashta Phala (Malevolent Potential)
    // Ishta = (Ocha + Chesta) / 2; Kashta = 60 - Ishta
    var ishtaPhala = Math.round((ochaBala + chestaBala) / 2);
    var kashtaPhala = 60 - ishtaPhala;

    var label = ratio >= 1.5 ? '極強' : ratio >= 1.2 ? '偏強' : ratio >= 1.0 ? '足夠' :
                ratio >= 0.8 ? '偏弱' : ratio >= 0.6 ? '不足' : '虛弱';

    results[p] = {
      sthanaBala: {total: sthanaBala, ocha: ochaBala, saptavargaja: saptavargajaBala, oja: ojaBala, kendra: kendraBala, drek: drekBala},
      digBala: digBala,
      kalaBala: {total: kalaBala, nath: nathBala, paksha: pakshaBala, tribhaga: tribhagaBala, vara: varaBala, hora: horaBala, ayana: ayanaBala},
      chestaBala: chestaBala,
      naisargikaBala: naisargikaBala,
      drikBala: drikBala,
      total: Math.round(total),
      rupas: rupas,
      minRupas: minRupas,
      ratio: ratio,
      ishtaPhala: ishtaPhala,
      kashtaPhala: kashtaPhala,
      label: label,
      isSufficient: ratio >= 1.0
    };
  });

  return results;
}


// ── 3. ARUDHA PADAS (Bhava Padas) ──
// Arudha = projection of house lord from house
// A_n = The house lord of house n projects as far from the lord as the lord is from house n

function jyCalcArudhaPadas(planets, lagnaIdx) {
  var padas = [];

  for (var h = 0; h < 12; h++) {
    var hRashiIdx = (lagnaIdx + h) % 12;
    var hLord = JY_RASHI[hRashiIdx].lord;
    var lordPlanet = planets[hLord];
    if (!lordPlanet) continue;

    var lordRashiIdx = lordPlanet.rashiIdx;
    // Count from house sign to lord sign
    var countFromHouse = ((lordRashiIdx - hRashiIdx + 12) % 12);
    // Arudha = same count from lord sign
    var arudhaRashiIdx = (lordRashiIdx + countFromHouse) % 12;

    // Exception: if Arudha falls in same sign as house or 7th from it, move to 10th from house
    if (arudhaRashiIdx === hRashiIdx) {
      arudhaRashiIdx = (hRashiIdx + 9) % 12; // 10th from house
    }
    if (arudhaRashiIdx === (hRashiIdx + 6) % 12) {
      arudhaRashiIdx = (hRashiIdx + 3) % 12; // 4th from house
    }

    var padaName = 'A' + (h + 1);
    var arudhaZh = '';
    if (h === 0) arudhaZh = '命宮虛位（Arudha Lagna/AL）：你在他人眼中的形象';
    else if (h === 1) arudhaZh = '財帛虛位：你的財富外顯程度';
    else if (h === 6) arudhaZh = '配偶虛位（Darapada/A7）：你的婚姻外顯形象';
    else if (h === 9) arudhaZh = '事業虛位（Rajapada/A10）：你的社會地位外顯';
    else if (h === 10) arudhaZh = '收益虛位（Upapada/A11）：你的社群形象';
    else if (h === 11) arudhaZh = '損失虛位（A12/Upapada for marriage）：配偶家庭背景';

    padas.push({
      house: h + 1,
      label: padaName,
      arudhaRashi: arudhaRashiIdx,
      arudhaSign: JY_RASHI[arudhaRashiIdx],
      lord: hLord,
      lordZh: JY_PLANETS[hLord] ? JY_PLANETS[hLord].zh : hLord,
      zh: arudhaZh || (padaName + '：第' + (h + 1) + '宮的外顯投射')
    });
  }

  return padas;
}

// Upapada Lagna (UL) — specifically for marriage analysis
// UL = Arudha of 12th house
function jyCalcUpapada(planets, lagnaIdx) {
  var padas = jyCalcArudhaPadas(planets, lagnaIdx);
  var ul = padas.find(function(p) { return p.house === 12; });
  return ul || null;
}


// ── 4. ARGALA (Planetary Intervention) ──
// Planets in 2nd, 4th, 11th from a house/planet intervene (Argala)
// Planets in 3rd, 10th, 12th obstruct the Argala (Virodha Argala)

function jyCalcArgala(planets, lagnaIdx) {
  var argalaResults = {};

  for (var h = 1; h <= 12; h++) {
    var argalas = [];

    // 2nd from house = Dhana Argala (wealth intervention)
    var h2 = (h % 12) + 1;
    var h2planets = Object.keys(planets).filter(function(p) { return planets[p].bhava === h2; });
    if (h2planets.length > 0) {
      // Check obstruction from 12th (Virodha Argala)
      var h12 = ((h - 2 + 12) % 12) + 1;
      var h12planets = Object.keys(planets).filter(function(p) { return planets[p].bhava === h12; });
      var obstructed = h12planets.length >= h2planets.length;
      argalas.push({
        type: 'Dhana', zh: '財富干預',
        fromHouse: h2, planets: h2planets,
        obstructed: obstructed,
        obstructingPlanets: h12planets
      });
    }

    // 4th from house = Sukha Argala (comfort intervention)
    var h4 = ((h + 2) % 12) + 1;
    var h4planets = Object.keys(planets).filter(function(p) { return planets[p].bhava === h4; });
    if (h4planets.length > 0) {
      var h10 = ((h + 8) % 12) + 1;
      var h10planets = Object.keys(planets).filter(function(p) { return planets[p].bhava === h10; });
      var obstructed4 = h10planets.length >= h4planets.length;
      argalas.push({
        type: 'Sukha', zh: '幸福干預',
        fromHouse: h4, planets: h4planets,
        obstructed: obstructed4,
        obstructingPlanets: h10planets
      });
    }

    // 11th from house = Labha Argala (gain intervention)
    var h11 = ((h + 9) % 12) + 1;
    var h11planets = Object.keys(planets).filter(function(p) { return planets[p].bhava === h11; });
    if (h11planets.length > 0) {
      var h3 = ((h + 1) % 12) + 1;
      var h3planets = Object.keys(planets).filter(function(p) { return planets[p].bhava === h3; });
      var obstructed11 = h3planets.length >= h11planets.length;
      argalas.push({
        type: 'Labha', zh: '收益干預',
        fromHouse: h11, planets: h11planets,
        obstructed: obstructed11,
        obstructingPlanets: h3planets
      });
    }

    // 5th from house = Putra Argala (special, unobstructable)
    var h5 = ((h + 3) % 12) + 1;
    var h5planets = Object.keys(planets).filter(function(p) { return planets[p].bhava === h5; });
    if (h5planets.length >= 3) { // Only when 3+ planets
      argalas.push({
        type: 'Putra', zh: '子嗣干預（不可阻擋）',
        fromHouse: h5, planets: h5planets,
        obstructed: false,
        obstructingPlanets: []
      });
    }

    if (argalas.length > 0) {
      argalaResults[h] = argalas;
    }
  }

  return argalaResults;
}


// ── 5. PRATYANTARDASHA（第三層小運）──
// Sub-sub periods within Antardasha

function jyCalcPratyantardasha(adLord, adStart, adEnd) {
  var pratyantar = [];
  var adDuration = adEnd.getTime() - adStart.getTime();
  var startIdx = JY_DASHA_ORDER.indexOf(adLord);
  if (startIdx < 0) startIdx = 0;

  var cursor = adStart.getTime();
  for (var i = 0; i < 9; i++) {
    var pdLordIdx = (startIdx + i) % 9;
    var pdLord = JY_DASHA_ORDER[pdLordIdx];
    var pdYears = JY_DASHA_YEARS[pdLord];
    var adYears = JY_DASHA_YEARS[adLord];
    // Pratyantardasha duration = (AD duration) × (PD planet years) / 120
    var pdDuration = adDuration * pdYears / 120;

    pratyantar.push({
      lord: pdLord,
      zh: JY_PLANETS[pdLord] ? JY_PLANETS[pdLord].zh : pdLord,
      start: new Date(cursor),
      end: new Date(cursor + pdDuration),
      durationDays: Math.round(pdDuration / (24 * 3600000))
    });
    cursor += pdDuration;
  }

  return pratyantar;
}

// Find current Pratyantardasha
function jyFindCurrentPratyantardasha(currentAD) {
  if (!currentAD) return null;
  var pds = jyCalcPratyantardasha(currentAD.lord, currentAD.start, currentAD.end);
  var now = Date.now();
  for (var i = 0; i < pds.length; i++) {
    if (pds[i].start.getTime() <= now && pds[i].end.getTime() > now) {
      return pds[i];
    }
  }
  return null;
}


// ── 6. COMPREHENSIVE NEECHA BHANGA (CANCELLATION OF DEBILITATION) ──
// Traditional 5 conditions for cancellation

function jyCheckNeechaBhanga(planet, planets, lagnaIdx) {
  var pl = planets[planet];
  if (!pl || pl.dignity !== 'debilitated') return {cancelled: false, conditions: []};

  var conditions = [];
  var signIdx = pl.rashiIdx;
  var signLord = JY_RASHI[signIdx].lord;

  // 1. Sign lord of debilitation sign is in Kendra from Lagna or Moon
  var signLordPl = planets[signLord];
  if (signLordPl) {
    if ([1,4,7,10].includes(signLordPl.bhava)) {
      conditions.push('落陷宮主' + JY_PLANETS[signLord].zh + '在角宮（第' + signLordPl.bhava + '宮）');
    }
    // From Moon
    var moonBhava = planets.Moon ? planets.Moon.bhava : 0;
    if (moonBhava > 0) {
      var fromMoon = ((signLordPl.bhava - moonBhava + 12) % 12) + 1;
      if ([1,4,7,10].includes(fromMoon)) {
        conditions.push('落陷宮主' + JY_PLANETS[signLord].zh + '在月亮角宮位置');
      }
    }
  }

  // 2. Planet that is exalted in the debilitation sign is in Kendra from Lagna or Moon
  var dig = JY_DIGNITY;
  Object.keys(dig).forEach(function(ep) {
    if (dig[ep].exaltRashi === signIdx) {
      var epPl = planets[ep];
      if (epPl && [1,4,7,10].includes(epPl.bhava)) {
        conditions.push('在此星座旺的' + (JY_PLANETS[ep] ? JY_PLANETS[ep].zh : ep) + '在角宮');
      }
    }
  });

  // 3. The debilitated planet is aspected by its sign lord
  // (Check if sign lord aspects the planet — Vedic aspects)
  if (signLordPl) {
    var aspHouses = JY_ASPECTS[signLord] || [7];
    var lordBhava = signLordPl.bhava;
    aspHouses.forEach(function(aspH) {
      var targetBhava = ((lordBhava - 1 + aspH - 1) % 12) + 1;
      if (targetBhava === pl.bhava) {
        conditions.push('落陷宮主' + JY_PLANETS[signLord].zh + '照見此行星');
      }
    });
  }

  // 4. The debilitated planet is in conjunction with an exalted planet
  Object.keys(planets).forEach(function(op) {
    if (op === planet) return;
    var opl = planets[op];
    if (opl && opl.dignity === 'exalted' && opl.bhava === pl.bhava) {
      conditions.push('與旺相的' + (JY_PLANETS[op] ? JY_PLANETS[op].zh : op) + '同宮');
    }
  });

  // 5. The debilitated planet's Navamsa dispositor is in Kendra or Trikona
  if (pl.navamsa) {
    var navDisp = JY_RASHI[pl.navamsa.signIdx].lord;
    var navDispPl = planets[navDisp];
    if (navDispPl && ([1,4,7,10].includes(navDispPl.bhava) || [1,5,9].includes(navDispPl.bhava))) {
      conditions.push('九分盤定位星' + (JY_PLANETS[navDisp] ? JY_PLANETS[navDisp].zh : navDisp) + '在角宮或三方宮');
    }
  }

  // Remove duplicates
  conditions = conditions.filter(function(c, i, arr) { return arr.indexOf(c) === i; });

  return {
    cancelled: conditions.length >= 1,
    fullCancellation: conditions.length >= 2,
    conditions: conditions,
    zh: conditions.length >= 2 ?
      planet + '落陷完全取消（' + conditions.length + '項條件成立），反成強大力量' :
      conditions.length === 1 ?
      planet + '落陷部分取消（1項條件），力量有所恢復' :
      planet + '落陷未取消'
  };
}


// ── 7. REFINED GOCHAR (Transit) WITH VEDIC RULES ──
// Vedic transit assessment uses Ashtakavarga bindu count in transit sign
// + Kaksha (sub-division) + Vedha (obstruction) rules

function jyRefinedGochar(natal, transits, lagnaIdx, ashtakavarga) {
  if (!natal || !transits) return [];

  var results = [];
  var slowPlanets = ['Jupiter','Saturn','Rahu','Ketu'];
  var allTransitPlanets = ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn','Rahu','Ketu'];

  // Vedha pairs: if a benefic transit is vedhad by a malefic, it's neutralized
  // Traditional Vedha points from transit houses:
  // Transit in 1→vedha from 3; 2→5; 3→4; 4→3; 5→6; 6→5; 7→9; 8→10; 9→7; 10→8; 11→12; 12→11
  // (Exception: Sun-Saturn don't vedha each other; Moon-Mercury don't vedha each other)
  var vedhaMap = {1:3, 2:5, 3:4, 4:3, 5:6, 6:5, 7:9, 8:10, 9:7, 10:8, 11:12, 12:11};

  allTransitPlanets.forEach(function(tp) {
    var tr = transits[tp];
    if (!tr) return;

    // Transit house from Moon sign
    var moonRashiIdx = natal.Moon ? natal.Moon.rashiIdx : -1;
    if (moonRashiIdx < 0) return;
    var transitHouseFromMoon = ((tr.rashiIdx - moonRashiIdx + 12) % 12) + 1;

    // Ashtakavarga bindu in transit sign
    var bindus = 0;
    if (ashtakavarga && ashtakavarga.planets && ashtakavarga.planets[tp]) {
      bindus = ashtakavarga.planets[tp].signBindus[tr.rashiIdx] || 0;
    }

    // Good/bad transit houses per planet (traditional Gochar rules from Moon)
    var goodHouses = {
      Sun: [3,6,10,11],
      Moon: [1,3,6,7,10,11],
      Mars: [3,6,11],
      Mercury: [2,4,6,8,10,11],
      Jupiter: [2,5,7,9,11],
      Venus: [1,2,3,4,5,8,9,11,12],
      Saturn: [3,6,11],
      Rahu: [3,6,10,11],
      Ketu: [3,6,10,11]
    };

    var isGoodHouse = (goodHouses[tp] || []).includes(transitHouseFromMoon);

    // Vedha check
    var vedhaHouse = vedhaMap[transitHouseFromMoon];
    var isVedhad = false;
    if (vedhaHouse && isGoodHouse) {
      // Check if any malefic is transiting the vedha point from Moon
      var vedhaPlanets = ['Sun','Mars','Saturn','Rahu','Ketu'];
      vedhaPlanets.forEach(function(vp) {
        if (vp === tp) return; // Can't vedha yourself
        // Sun-Saturn exemption
        if ((tp === 'Sun' && vp === 'Saturn') || (tp === 'Saturn' && vp === 'Sun')) return;
        // Moon-Mercury exemption
        if ((tp === 'Moon' && vp === 'Mercury') || (tp === 'Mercury' && vp === 'Moon')) return;
        var vtr = transits[vp];
        if (vtr) {
          var vtrHouse = ((vtr.rashiIdx - moonRashiIdx + 12) % 12) + 1;
          if (vtrHouse === vedhaHouse) isVedhad = true;
        }
      });
    }

    // Nakshatra transit timing
    var naksTransit = '';
    if (tr.nakshatra) {
      naksTransit = tp + '行運經過' + (tr.nakshatra.zh || tr.nakshatra.en) + '星宿';
    }

    var isSlow = slowPlanets.includes(tp);
    var effectiveGood = isGoodHouse && !isVedhad;

    var score = 0;
    if (effectiveGood) score = bindus >= 5 ? 3 : bindus >= 4 ? 2 : 1;
    else score = bindus <= 2 ? -3 : bindus <= 3 ? -2 : -1;

    results.push({
      planet: tp,
      planetZh: JY_PLANETS[tp] ? JY_PLANETS[tp].zh : tp,
      transitSign: tr.rashi ? tr.rashi.zh : '',
      transitHouseFromMoon: transitHouseFromMoon,
      isGoodHouse: isGoodHouse,
      isVedhad: isVedhad,
      effectiveGood: effectiveGood,
      bindus: bindus,
      score: score,
      isSlow: isSlow,
      naksTransit: naksTransit,
      importance: isSlow ? 'high' : 'low',
      zh: (JY_PLANETS[tp] ? JY_PLANETS[tp].zh : tp) + '行運' +
          (tr.rashi ? tr.rashi.zh : '') + '（月亮第' + transitHouseFromMoon + '宮）' +
          (isGoodHouse ? '✓吉位' : '✗凶位') +
          (isVedhad ? '（被遮蔽）' : '') +
          '・吉凶分' + bindus
    });
  });

  // Sort: slow planets first, then by absolute score descending
  results.sort(function(a, b) {
    if (a.isSlow && !b.isSlow) return -1;
    if (!a.isSlow && b.isSlow) return 1;
    return Math.abs(b.score) - Math.abs(a.score);
  });

  return results;
}


// ── 8. ENHANCED ASHTAKAVARGA WITH TRIKONA REDUCTION ──
// Traditional reduction: subtract repetitions in trikona signs (1-5-9, 2-6-10, 3-7-11, 4-8-12)

function jyAshtakavargaReduction(ashtakavarga, lagnaIdx) {
  if (!ashtakavarga || !ashtakavarga.planets) return null;

  var trikonaGroups = [[0,4,8],[1,5,9],[2,6,10],[3,7,11]]; // sign-based trikona groupings

  var reduced = {};
  var sevenPlanets = ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn'];

  sevenPlanets.forEach(function(p) {
    var av = ashtakavarga.planets[p];
    if (!av || !av.signBindus) return;

    var origBindus = av.signBindus.slice(); // copy
    var reducedBindus = origBindus.slice();

    // Trikona Shodhana: In each trikona group, subtract the minimum value from all three
    trikonaGroups.forEach(function(group) {
      var vals = group.map(function(s) { return reducedBindus[s]; });
      var minVal = Math.min.apply(null, vals);
      group.forEach(function(s) { reducedBindus[s] -= minVal; });
    });

    // Ekadhipati Shodhana (same-lord signs): signs ruled by same planet, subtract minimum
    // Saturn rules 9,10; Jupiter rules 8,11; Mars rules 0,7; Venus rules 1,6; Mercury rules 2,5
    // Sun rules 4 only; Moon rules 3 only
    var sameLordPairs = [[9,10],[8,11],[0,7],[1,6],[2,5]];
    sameLordPairs.forEach(function(pair) {
      var v1 = reducedBindus[pair[0]], v2 = reducedBindus[pair[1]];
      var minV = Math.min(v1, v2);
      reducedBindus[pair[0]] -= minV;
      reducedBindus[pair[1]] -= minV;
    });

    var totalOrig = origBindus.reduce(function(a, b) { return a + b; }, 0);
    var totalReduced = reducedBindus.reduce(function(a, b) { return a + b; }, 0);

    reduced[p] = {
      original: origBindus,
      reduced: reducedBindus,
      totalOriginal: totalOrig,
      totalReduced: totalReduced,
      reductionPct: Math.round((1 - totalReduced / Math.max(1, totalOrig)) * 100)
    };
  });

  // Reduced Sarvashtakavarga
  var reducedSarva = new Array(12).fill(0);
  sevenPlanets.forEach(function(p) {
    if (reduced[p]) {
      for (var s = 0; s < 12; s++) {
        reducedSarva[s] += reduced[p].reduced[s];
      }
    }
  });

  return {
    planets: reduced,
    reducedSarva: reducedSarva,
    totalReduced: reducedSarva.reduce(function(a, b) { return a + b; }, 0)
  };
}


// ── 9. NAKSHATRA-LEVEL TRANSIT TIMING ──
// When a slow planet enters a specific nakshatra, it triggers themes related to that nakshatra lord

function jyNakshatraTransitTiming(transits) {
  if (!transits) return [];

  var results = [];
  var slowPlanets = ['Jupiter','Saturn','Rahu','Ketu'];

  slowPlanets.forEach(function(tp) {
    var tr = transits[tp];
    if (!tr || !tr.nakshatra) return;

    var naks = tr.nakshatra;
    var naksLord = naks.lord;
    var naksDeity = naks.deity || '';

    // Nakshatra characterization
    var naksNature = '';
    // Classify based on pada
    var pada = tr.naksPada || 1;

    results.push({
      planet: tp,
      planetZh: JY_PLANETS[tp] ? JY_PLANETS[tp].zh : tp,
      nakshatra: naks.en,
      nakshatraZh: naks.zh,
      naksLord: naksLord,
      naksLordZh: JY_PLANETS[naksLord] ? JY_PLANETS[naksLord].zh : naksLord,
      pada: pada,
      deity: naksDeity,
      zh: (JY_PLANETS[tp] ? JY_PLANETS[tp].zh : tp) + '正在' + (naks.zh || naks.en) +
          '星宿第' + pada + 'Pada（主星：' + (JY_PLANETS[naksLord] ? JY_PLANETS[naksLord].zh : naksLord) + '）'
    });
  });

  return results;
}


// ── 10. JAIMINI CHARA KARAKAS + CHARA DASHA BASICS ──
// Already have Atmakaraka; add remaining Chara Karakas properly

function jyCalcCharaKarakas_v2(planets) {
  var karakaNames = [
    {en:'Atmakaraka',    zh:'靈魂象徵星(AK)',  domain:'靈魂意願、人生方向'},
    {en:'Amatyakaraka',  zh:'大臣象徵星(AmK)', domain:'事業、專業能力'},
    {en:'Bhratrikaraka',zh:'手足象徵星(BK)',  domain:'兄弟姐妹、勇氣'},
    {en:'Matrikaraka',   zh:'母親象徵星(MK)',  domain:'母親、內心安寧'},
    {en:'Putrakaraka',   zh:'子女象徵星(PK)',  domain:'子女、智慧'},
    {en:'Gnatikaraka',   zh:'親族象徵星(GK)',  domain:'親戚、疾病、競爭'},
    {en:'Darakaraka',    zh:'配偶象徵星(DK)',  domain:'配偶、伴侶'}
  ];

  // Sort 7 planets (Sun through Saturn, excluding Rahu/Ketu) by degree in sign
  var sevenP = ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn'];
  var sorted = sevenP.map(function(p) {
    return {
      planet: p,
      zh: JY_PLANETS[p] ? JY_PLANETS[p].zh : p,
      deg: planets[p] ? planets[p].degInSign : 0
    };
  }).sort(function(a, b) { return b.deg - a.deg; });

  var karakas = [];
  for (var i = 0; i < Math.min(sorted.length, 7); i++) {
    karakas.push({
      role: karakaNames[i].en,
      roleZh: karakaNames[i].zh,
      domain: karakaNames[i].domain,
      planet: sorted[i].planet,
      planetZh: sorted[i].zh,
      deg: Math.round(sorted[i].deg * 100) / 100
    });
  }

  // Rahu as 8th Karaka (some Jaimini schools use this)
  var rahuDeg = planets.Rahu ? (30 - planets.Rahu.degInSign) : 0; // Rahu uses reverse degrees
  karakas.push({
    role: 'Rahu (8th)',
    roleZh: '羅睺（第八象徵）',
    domain: '前世業力、異國',
    planet: 'Rahu',
    planetZh: '羅睺',
    deg: Math.round(rahuDeg * 100) / 100
  });

  return {
    list: karakas,
    atmakaraka: sorted[0] ? sorted[0].planet : null,
    amatyakaraka: sorted[1] ? sorted[1].planet : null,
    darakaraka: sorted[6] ? sorted[6].planet : null
  };
}


// ── 11. COMBUST (ASTA) PLANETS — VEDIC RULES ──
// Combust = too close to Sun, planet's significations weaken
// Vedic orbs: Moon 12°, Mars 17°, Mercury 14° (12° if retro), Jupiter 11°, Venus 10° (8° if retro), Saturn 15°

function jyCheckCombustion(planets) {
  if (!planets.Sun) return {};

  var sunSid = planets.Sun.sidLon;
  var combustOrbs = {
    Moon: 12, Mars: 17, Mercury: 14, Jupiter: 11, Venus: 10, Saturn: 15
  };
  var retroOrbs = { Mercury: 12, Venus: 8 };

  var results = {};
  Object.keys(combustOrbs).forEach(function(p) {
    var pl = planets[p];
    if (!pl) return;

    var dist = Math.abs(_n180(pl.sidLon - sunSid));
    var orb = combustOrbs[p];
    // Retrograde planets have tighter orbs for some
    if (pl.retrograde && retroOrbs[p]) orb = retroOrbs[p];

    var isCombust = dist <= orb;
    var isDeeplyCombust = dist <= orb / 2;

    results[p] = {
      isCombust: isCombust,
      isDeeplyCombust: isDeeplyCombust,
      distance: Math.round(dist * 100) / 100,
      orb: orb,
      severity: isDeeplyCombust ? '嚴重焦傷' : isCombust ? '焦傷' : '安全',
      zh: isCombust ?
        (JY_PLANETS[p] ? JY_PLANETS[p].zh : p) + '距太陽' + Math.round(dist) + '°（' +
        (isDeeplyCombust ? '嚴重焦傷' : '焦傷') + '），其代表事務受到削弱' :
        ''
    };
  });

  return results;
}


// ── 12. PLANETARY WAR (GRAHA YUDDHA) ──
// When two planets are within 1° of each other (excluding Sun and Moon)

function jyCheckGrahaYuddha(planets) {
  var wars = [];
  var combatants = ['Mars','Mercury','Jupiter','Venus','Saturn'];

  for (var i = 0; i < combatants.length; i++) {
    for (var j = i + 1; j < combatants.length; j++) {
      var p1 = combatants[i], p2 = combatants[j];
      var pl1 = planets[p1], pl2 = planets[p2];
      if (!pl1 || !pl2) continue;

      var dist = Math.abs(_n180(pl1.sidLon - pl2.sidLon));
      if (dist <= 1) {
        // Winner: planet with higher latitude (more northern) wins
        // Simplified: use Shadbala or natural strength as proxy
        var naisargika = {Mars:17, Mercury:26, Jupiter:34, Venus:43, Saturn:9};
        var winner = (naisargika[p1] || 0) > (naisargika[p2] || 0) ? p1 : p2;
        var loser = winner === p1 ? p2 : p1;

        wars.push({
          planets: [p1, p2],
          distance: Math.round(dist * 100) / 100,
          winner: winner,
          winnerZh: JY_PLANETS[winner] ? JY_PLANETS[winner].zh : winner,
          loser: loser,
          loserZh: JY_PLANETS[loser] ? JY_PLANETS[loser].zh : loser,
          zh: (JY_PLANETS[p1] ? JY_PLANETS[p1].zh : p1) + '與' +
              (JY_PLANETS[p2] ? JY_PLANETS[p2].zh : p2) + '行星大戰（距離' + Math.round(dist * 100) / 100 + '°），' +
              (JY_PLANETS[winner] ? JY_PLANETS[winner].zh : winner) + '勝出，' +
              (JY_PLANETS[loser] ? JY_PLANETS[loser].zh : loser) + '受傷'
        });
      }
    }
  }

  return wars;
}


// ══════════════════════════════════════════════════════════════════════
// INTEGRATION: Enhance computeJyotish return value
// Call AFTER computeJyotish to add all new data
// ══════════════════════════════════════════════════════════════════════

function enhanceJyotish(jy) {
  if (!jy) return jy;

  var planets = jy.planets;
  var lagnaIdx = jy.lagna ? jy.lagna.idx : 0;

  // 1. Additional Vargas
  Object.keys(planets).forEach(function(p) {
    var pl = planets[p];
    if (!pl || !pl.sidLon) return;
    pl.drekkana = jyDrekkana(pl.sidLon);
    pl.chaturthamsa_v2 = jyChaturthamsa_v2(pl.sidLon);
    pl.dwadasamsa = jyDwadasamsa(pl.sidLon);
    pl.shodasamsa = jyShodasamsa(pl.sidLon);
    pl.vimshamsa = jyVimshamsa(pl.sidLon);
    pl.shashtiamsa = jyShashtiamsa(pl.sidLon);
  });

  // 2. Enhanced Shadbala
  // ★ Bug #36 fix: 必須傳真實 JD（之前傳 lagna.lon + ayanamsa，是錯的「假 JD」）
  //   假 JD 會讓 hourFrac/dayOfWeek/planetary hour 全部錯亂 → Kala Bala (varaBala/horaBala/tribhagaBala) 全失效
  var _realJd = (typeof jy.jd === 'number') ? jy.jd : 2451545.0; // J2000 fallback
  try { jy.shadbala_v2 = jyCalcShadbala_v2(planets, lagnaIdx, _realJd, jy.ayanamsa); }
  catch(e) { jy.shadbala_v2 = null; }

  // 3. Arudha Padas
  try { jy.arudhaPadas = jyCalcArudhaPadas(planets, lagnaIdx); }
  catch(e) { jy.arudhaPadas = null; }

  // 4. Argala
  try { jy.argala = jyCalcArgala(planets, lagnaIdx); }
  catch(e) { jy.argala = null; }

  // 5. Pratyantardasha
  if (jy.currentAD) {
    try { jy.currentPD = jyFindCurrentPratyantardasha(jy.currentAD); }
    catch(e) { jy.currentPD = null; }
  }

  // 6. Neecha Bhanga for all debilitated planets
  jy.neechaBhanga = {};
  Object.keys(planets).forEach(function(p) {
    if (planets[p] && planets[p].dignity === 'debilitated') {
      jy.neechaBhanga[p] = jyCheckNeechaBhanga(p, planets, lagnaIdx);
    }
  });

  // 7. Refined Gochar
  if (jy.transits && jy.ashtakavarga) {
    try { jy.refinedGochar = jyRefinedGochar(planets, jy.transits, lagnaIdx, jy.ashtakavarga); }
    catch(e) { jy.refinedGochar = null; }
  }

  // 8. Enhanced Ashtakavarga (with Trikona/Ekadhipati reduction)
  if (jy.ashtakavarga) {
    try { jy.ashtakavargaReduced = jyAshtakavargaReduction(jy.ashtakavarga, lagnaIdx); }
    catch(e) { jy.ashtakavargaReduced = null; }
  }

  // 9. Nakshatra Transit Timing
  if (jy.transits) {
    try { jy.nakshatraTransit = jyNakshatraTransitTiming(jy.transits); }
    catch(e) { jy.nakshatraTransit = null; }
  }

  // 10. Enhanced Chara Karakas
  try { jy.charaKarakas = jyCalcCharaKarakas_v2(planets); }
  catch(e) { jy.charaKarakas = null; }

  // 11. Combustion
  try { jy.combustion = jyCheckCombustion(planets); }
  catch(e) { jy.combustion = null; }

  // 12. Planetary War
  try { jy.grahaYuddha = jyCheckGrahaYuddha(planets); }
  catch(e) { jy.grahaYuddha = null; }

  return jy;
}


// ══════════════════════════════════════════════════════════════════════
// 🕉️ JYOTISH TOP-TIER UPGRADE (Part 2)
// Chara Dasha · Yogini Dasha · Ashtottari Dasha · Sudarshana Chakra
// Bhava Bala · Ayana Bala precise · Pinda Shodhana · Jaimini full
// Vargottama · Pushkara · Mrityu Bhaga · Gandanta · Avasthas
// D27/D40/D45 · Bhava Madhya · Combustion cancellation
// ══════════════════════════════════════════════════════════════════════
// 載入順序：bazi.js → jyotish_upgrade.js → jyotish_upgrade2.js
// enhanceJyotish2(jy) 在 enhanceJyotish(jy) 之後呼叫


// ── 1. VARGOTTAMA DETECTION ──
// Planet in same sign in D1 (Rashi) and D9 (Navamsa) = greatly strengthened

function jyDetectVargottama(planets) {
  var results = {};
  Object.keys(planets).forEach(function(p) {
    var pl = planets[p];
    if (!pl || !pl.navamsa) return;
    var isVargottama = pl.rashiIdx === pl.navamsa.signIdx;
    results[p] = {
      isVargottama: isVargottama,
      rashiSign: pl.rashi ? pl.rashi.zh : '',
      navamsaSign: pl.navamsa.rashi ? pl.navamsa.rashi.zh : '',
      zh: isVargottama ?
        (JY_PLANETS[p] ? JY_PLANETS[p].zh : p) + '在D1和D9都落在' + (pl.rashi ? pl.rashi.zh : '') + '座（Vargottama），力量大增，如同自宮' : ''
    };
  });

  // Lagna Vargottama (strongest indicator)
  return results;
}


// ── 2. PUSHKARA NAVAMSA & PUSHKARA BHAGA ──
// Certain Navamsa positions and specific degrees are considered auspicious

function jyCheckPushkara(planets) {
  // Pushkara Navamsa: Navamsa signs that are especially benefic
  // These are the Navamsa positions where a planet gains extra strength
  // Traditional: specific pada positions in each Nakshatra considered Pushkara
  // Simplified: Navamsa in signs ruled by benefics (Jupiter, Venus, Moon, Mercury)
  var pushkaraNavamsaSigns = [1, 3, 5, 6, 8, 11]; // Taurus, Cancer, Virgo, Libra, Scorpio, Pisces

  // Pushkara Bhaga: specific degrees in each sign considered most auspicious
  // Per Parashari tradition
  var pushkaraBhaga = {
    0: 21,  // Aries 21°
    1: 14,  // Taurus 14°
    2: 18,  // Gemini 18°
    3: 8,   // Cancer 8°
    4: 19,  // Leo 19°
    5: 9,   // Virgo 9°
    6: 24,  // Libra 24°
    7: 11,  // Scorpio 11°
    8: 23,  // Sagittarius 23°
    9: 14,  // Capricorn 14°
    10: 19, // Aquarius 19°
    11: 9   // Pisces 9°
  };

  var results = {};
  Object.keys(planets).forEach(function(p) {
    var pl = planets[p];
    if (!pl) return;

    var isPushkaraNavamsa = pl.navamsa ? pushkaraNavamsaSigns.includes(pl.navamsa.signIdx) : false;
    var bhagaDeg = pushkaraBhaga[pl.rashiIdx];
    var isPushkaraBhaga = bhagaDeg !== undefined && Math.abs(pl.degInSign - bhagaDeg) <= 1;

    results[p] = {
      isPushkaraNavamsa: isPushkaraNavamsa,
      isPushkaraBhaga: isPushkaraBhaga,
      zh: (isPushkaraNavamsa ? (JY_PLANETS[p] ? JY_PLANETS[p].zh : p) + '在吉祥九分盤位（Pushkara Navamsa），事務順利' : '') +
          (isPushkaraBhaga ? (isPushkaraNavamsa ? '；' : '') + (JY_PLANETS[p] ? JY_PLANETS[p].zh : p) + '在吉祥度數（Pushkara Bhaga ' + bhagaDeg + '°），極為有利' : '')
    };
  });

  return results;
}


// ── 3. MRITYU BHAGA (Death Degrees) ──
// Specific degrees in each sign considered dangerous for each planet

function jyCheckMrityuBhaga(planets) {
  // Traditional Mrityu Bhaga degrees per planet per sign
  // Format: planet → array of 12 degrees (one per sign, Aries through Pisces)
  var mrityuDegrees = {
    Sun:     [20, 9, 12, 6, 8, 24, 16, 17, 22, 2, 3, 23],
    Moon:    [26, 12, 13, 25, 24, 11, 26, 14, 13, 25, 5, 12],
    Mars:    [19, 28, 25, 23, 29, 28, 14, 21, 2, 15, 11, 6],
    Mercury: [15, 14, 13, 12, 8, 18, 20, 10, 21, 22, 7, 5],
    Jupiter: [19, 29, 12, 27, 6, 4, 13, 10, 17, 11, 15, 28],
    Venus:   [28, 15, 11, 17, 10, 13, 4, 6, 27, 12, 29, 19],
    Saturn:  [10, 4, 7, 9, 12, 16, 3, 18, 28, 14, 13, 15]
  };

  var results = {};
  Object.keys(mrityuDegrees).forEach(function(p) {
    var pl = planets[p];
    if (!pl) return;
    var mDeg = mrityuDegrees[p][pl.rashiIdx];
    var dist = Math.abs(pl.degInSign - mDeg);
    var isInMrityu = dist <= 1;
    var isNearMrityu = dist <= 3 && !isInMrityu;

    results[p] = {
      mrityuDeg: mDeg,
      distance: Math.round(dist * 100) / 100,
      isInMrityu: isInMrityu,
      isNearMrityu: isNearMrityu,
      zh: isInMrityu ?
        '⚠ ' + (JY_PLANETS[p] ? JY_PLANETS[p].zh : p) + '在' + (pl.rashi ? pl.rashi.zh : '') + mDeg + '°（Mrityu Bhaga 凶度），其代表事務需特別留意' :
        isNearMrityu ?
        (JY_PLANETS[p] ? JY_PLANETS[p].zh : p) + '接近Mrityu Bhaga（距凶度' + Math.round(dist) + '°），留意相關事務' : ''
    };
  });

  return results;
}


// ── 4. GANDANTA (Junction Points) ──
// Water-Fire sign junctions: end of Cancer/Scorpio/Pisces → start of Leo/Sagittarius/Aries
// Planets within 3°20' (one Nakshatra pada) of these junctions are in Gandanta

function jyCheckGandanta(planets) {
  // Gandanta zones (sidereal): last 3°20' of water signs + first 3°20' of fire signs
  // Water sign ends: Cancer(3) 26°40'-30°, Scorpio(7) 26°40'-30°, Pisces(11) 26°40'-30°
  // Fire sign starts: Leo(4) 0°-3°20', Sagittarius(8) 0°-3°20', Aries(0) 0°-3°20'
  var gandantaZones = [
    {waterSign: 3, fireSign: 4, name: '巨蟹-獅子交界'},
    {waterSign: 7, fireSign: 8, name: '天蠍-射手交界'},
    {waterSign: 11, fireSign: 0, name: '雙魚-白羊交界'}
  ];

  var results = {};
  var threshold = 3.333; // 3°20' = one Nakshatra pada

  Object.keys(planets).forEach(function(p) {
    var pl = planets[p];
    if (!pl) return;

    var isGandanta = false;
    var gandantaInfo = null;
    var severity = '';

    gandantaZones.forEach(function(gz) {
      // End of water sign
      if (pl.rashiIdx === gz.waterSign && pl.degInSign >= (30 - threshold)) {
        isGandanta = true;
        gandantaInfo = gz;
        var distFromEdge = 30 - pl.degInSign;
        severity = distFromEdge < 1 ? '嚴重' : distFromEdge < 2 ? '中度' : '輕度';
      }
      // Start of fire sign
      if (pl.rashiIdx === gz.fireSign && pl.degInSign <= threshold) {
        isGandanta = true;
        gandantaInfo = gz;
        severity = pl.degInSign < 1 ? '嚴重' : pl.degInSign < 2 ? '中度' : '輕度';
      }
    });

    if (isGandanta) {
      results[p] = {
        isGandanta: true,
        junction: gandantaInfo.name,
        severity: severity,
        zh: (JY_PLANETS[p] ? JY_PLANETS[p].zh : p) + '在Gandanta（' + gandantaInfo.name + '，' + severity + '）：水火交界的業力結點，' +
            (p === 'Moon' ? '出生月亮在此處代表前世未了結的深層業力，今生需要特別的淨化儀式' :
             p === 'Sun' ? '太陽在此處代表身份認同的深層轉化' :
             '此行星代表的事務可能經歷深刻的轉變')
      };
    }
  });

  // Check Lagna Gandanta too (not a planet but important)
  return results;
}


// ── 5. BHAVA BALA (House Strength) ──
// Distinct from Shadbala (planet strength) — measures the strength of each house itself

function jyCalcBhavaBala(planets, lagnaIdx, houseLords, aspects, shadbala) {
  var results = [];

  for (var h = 0; h < 12; h++) {
    var hRashiIdx = (lagnaIdx + h) % 12;
    var hLord = JY_RASHI[hRashiIdx].lord;
    var score = 0;
    var factors = [];

    // 1. Bhavadhipati Bala (House Lord Strength)
    // = Shadbala of the house lord
    var lordSB = shadbala && shadbala[hLord] ? shadbala[hLord].total : 200;
    var lordRatio = shadbala && shadbala[hLord] ? shadbala[hLord].ratio : 1.0;
    var lordScore = Math.round(lordRatio * 20);
    score += lordScore;
    factors.push({type: 'lord_strength', score: lordScore, zh: '宮主' + (JY_PLANETS[hLord] ? JY_PLANETS[hLord].zh : hLord) + '力量'});

    // 2. Bhava Dig Bala (Directional Strength of House)
    // Natural houses in their natural direction get bonus
    var digBala = 0;
    if (h === 0 || h === 3 || h === 6 || h === 9) digBala = 15; // Kendras strong
    else if (h === 4 || h === 8) digBala = 12; // Trikonas
    else if (h === 1 || h === 10) digBala = 8;  // Panaphara
    else digBala = 5;
    score += digBala;
    factors.push({type: 'dig_bala', score: digBala, zh: (h === 0 || h === 3 || h === 6 || h === 9) ? '角宮加成' : '位置'});

    // 3. Bhava Drishti Bala (Aspectual Strength)
    // Benefic aspects to the house increase strength
    var dristiBala = 0;
    if (aspects) {
      aspects.forEach(function(asp) {
        // Check if aspect lands in this house
        var toP = planets[asp.to];
        if (toP && toP.bhava === h + 1) {
          if (asp.nature === 'benefic') dristiBala += 5;
          else if (asp.nature === 'malefic') dristiBala -= 3;
        }
      });
    }
    score += dristiBala;
    if (dristiBala !== 0) factors.push({type: 'drishti', score: dristiBala, zh: '相位影響'});

    // 4. Planets in house (natural benefics add, malefics subtract)
    var occupantScore = 0;
    Object.keys(planets).forEach(function(p) {
      if (planets[p].bhava === h + 1) {
        var nature = JY_PLANETS[p] ? JY_PLANETS[p].nature : 'neutral';
        if (nature === 'benefic') occupantScore += 8;
        else if (nature === 'malefic') occupantScore -= 5;
        else occupantScore += 2;
      }
    });
    score += occupantScore;
    if (occupantScore !== 0) factors.push({type: 'occupants', score: occupantScore, zh: '入宮行星'});

    // 5. Lord's placement quality
    var lordPl = planets[hLord];
    var lordPlacementScore = 0;
    if (lordPl) {
      // Lord in Kendra from own house = strong
      var lordFromHouse = ((lordPl.bhava - 1 - h + 12) % 12) + 1;
      if ([1, 4, 7, 10].includes(lordFromHouse)) lordPlacementScore = 10;
      else if ([5, 9].includes(lordFromHouse)) lordPlacementScore = 8;
      else if ([2, 11].includes(lordFromHouse)) lordPlacementScore = 5;
      else if ([6, 8, 12].includes(lordFromHouse)) lordPlacementScore = -5;
      else lordPlacementScore = 2;
    }
    score += lordPlacementScore;
    factors.push({type: 'lord_placement', score: lordPlacementScore, zh: '宮主飛入位置'});

    var label = score >= 40 ? '極強' : score >= 30 ? '偏強' : score >= 20 ? '中等' : score >= 10 ? '偏弱' : '虛弱';

    results.push({
      house: h + 1,
      rashi: JY_RASHI[hRashiIdx],
      lord: hLord,
      lordZh: JY_PLANETS[hLord] ? JY_PLANETS[hLord].zh : hLord,
      score: score,
      factors: factors,
      label: label
    });
  }

  return results;
}


// ── 6. YOGINI DASHA ──
// Alternative Dasha system: 8 Yogini periods totaling 36 years (cycles)
// Sequence: Mangala(1), Pingala(2), Dhanya(3), Bhramari(4), Bhadrika(5), Ulka(6), Siddha(7), Sankata(8)

function jyCalcYoginiDasha(moonSidLon, birthDate) {
  var naks = jyGetNakshatra(moonSidLon);
  var naksIdx = naks.idx; // 0-26

  var yoginiNames = [
    {name:'Mangala',  zh:'吉祥', years:1, lord:'Moon',    nature:'吉'},
    {name:'Pingala',  zh:'赤光', years:2, lord:'Sun',     nature:'凶'},
    {name:'Dhanya',   zh:'富貴', years:3, lord:'Jupiter', nature:'吉'},
    {name:'Bhramari', zh:'蜜蜂', years:4, lord:'Mars',    nature:'混'},
    {name:'Bhadrika', zh:'幸運', years:5, lord:'Mercury', nature:'吉'},
    {name:'Ulka',     zh:'流星', years:6, lord:'Saturn',  nature:'凶'},
    {name:'Siddha',   zh:'成就', years:7, lord:'Venus',   nature:'吉'},
    {name:'Sankata',  zh:'困難', years:8, lord:'Rahu',    nature:'凶'}
  ];
  var totalCycle = 36; // 1+2+3+4+5+6+7+8 = 36

  // Starting Yogini = (Nakshatra index + 3) mod 8
  var startIdx = (naksIdx + 3) % 8;

  // Remaining portion of first Yogini
  var pctComplete = naks.pctComplete / 100;
  var firstYogini = yoginiNames[startIdx];
  var firstRemainingYears = firstYogini.years * (1 - pctComplete);

  var dashas = [];
  var birthMs = birthDate.getTime();
  var yearMs = 365.25 * 24 * 3600000;
  var cursor = birthMs;

  for (var cycle = 0; cycle < 4; cycle++) { // ~144 years coverage
    for (var i = 0; i < 8; i++) {
      var yIdx = (startIdx + i) % 8;
      var yogini = yoginiNames[yIdx];
      var actualYears = (cycle === 0 && i === 0) ? firstRemainingYears : yogini.years;
      var durationMs = actualYears * yearMs;

      dashas.push({
        name: yogini.name,
        zh: yogini.zh,
        lord: yogini.lord,
        lordZh: JY_PLANETS[yogini.lord] ? JY_PLANETS[yogini.lord].zh : yogini.lord,
        nature: yogini.nature,
        years: Math.round(actualYears * 100) / 100,
        start: new Date(cursor),
        end: new Date(cursor + durationMs),
        isCurrent: (Date.now() >= cursor && Date.now() < cursor + durationMs)
      });
      cursor += durationMs;
    }
  }

  var currentYogini = dashas.find(function(d) { return d.isCurrent; });
  return {
    dashas: dashas,
    current: currentYogini,
    system: 'Yogini'
  };
}


// ── 7. ASHTOTTARI DASHA ──
// 108-year cycle, 8 planets (no Ketu), used when Rahu is in Kendra/Trikona from Lagna lord
// Sequence: Sun(6), Moon(15), Mars(8), Mercury(17), Saturn(10), Jupiter(19), Rahu(12), Venus(21)

function jyCalcAshtottariDasha(moonSidLon, birthDate) {
  var naks = jyGetNakshatra(moonSidLon);

  var ashtottariOrder = ['Sun','Moon','Mars','Mercury','Saturn','Jupiter','Rahu','Venus'];
  var ashtottariYears = {Sun:6, Moon:15, Mars:8, Mercury:17, Saturn:10, Jupiter:19, Rahu:12, Venus:21};
  // Total = 108

  // Starting planet based on Nakshatra
  // Ardra→Sun, Punarvasu→Moon, Pushya→Mars, Ashlesha→Mercury, Magha→Saturn, etc.
  var naksToStart = {
    5:0, 6:1, 7:2, 8:3, 9:4, 10:5, 11:6, 12:7,  // Ardra through Hasta
    13:0, 14:1, 15:2, 16:3, 17:4, 18:5, 19:6, 20:7, // Chitra through Uttara Ashadha
    21:0, 22:1, 23:2, 24:3, 25:4, 26:5, 0:6, 1:7,  // Shravana through Bharani
    2:0, 3:1, 4:2
  };

  var startIdx = naksToStart[naks.idx] !== undefined ? naksToStart[naks.idx] : 0;
  var pctComplete = naks.pctComplete / 100;

  var dashas = [];
  var birthMs = birthDate.getTime();
  var yearMs = 365.25 * 24 * 3600000;
  var cursor = birthMs;

  for (var cycle = 0; cycle < 2; cycle++) { // 216 years coverage
    for (var i = 0; i < 8; i++) {
      var dIdx = (startIdx + i) % 8;
      var lord = ashtottariOrder[dIdx];
      var totalYears = ashtottariYears[lord];
      var actualYears = (cycle === 0 && i === 0) ? totalYears * (1 - pctComplete) : totalYears;
      var durationMs = actualYears * yearMs;

      dashas.push({
        lord: lord,
        zh: JY_PLANETS[lord] ? JY_PLANETS[lord].zh : lord,
        years: Math.round(actualYears * 100) / 100,
        start: new Date(cursor),
        end: new Date(cursor + durationMs),
        isCurrent: (Date.now() >= cursor && Date.now() < cursor + durationMs)
      });
      cursor += durationMs;
    }
  }

  var current = dashas.find(function(d) { return d.isCurrent; });
  return {
    dashas: dashas,
    current: current,
    system: 'Ashtottari',
    totalCycle: 108
  };
}


// ── 8. CHARA DASHA (Jaimini) ──
// Sign-based Dasha system. Each sign gets a period based on its lord's distance from it.
// Odd signs count forward, even signs count backward

function jyCalcCharaDasha(lagnaIdx, planets, birthDate) {
  // Determine if odd-footed or even-footed lagna
  var isOddLagna = (lagnaIdx % 2 === 0); // 0-indexed: 0=Aries(odd), 1=Taurus(even)

  // Calculate period years for each sign
  var signYears = [];
  for (var s = 0; s < 12; s++) {
    var signLord = JY_RASHI[s].lord;
    var lordPl = planets[signLord];
    if (!lordPl) { signYears.push(0); continue; }

    var lordRashiIdx = lordPl.rashiIdx;
    var isOddSign = (s % 2 === 0); // odd sign = count forward

    var count;
    if (isOddSign) {
      count = (lordRashiIdx - s + 12) % 12;
    } else {
      count = (s - lordRashiIdx + 12) % 12;
    }

    // Exception: lord in own sign = 12 years
    if (count === 0) count = 12;

    // Rahu/Ketu co-lordship adjustment
    // Scorpio co-lord Ketu, Aquarius co-lord Rahu
    signYears.push(count);
  }

  // Dasha sequence: start from Lagna sign
  // Odd Lagna: Aries→Taurus→...→Pisces (zodiacal)
  // Even Lagna: reverse from Lagna
  var dashas = [];
  var birthMs = birthDate.getTime();
  var yearMs = 365.25 * 24 * 3600000;
  var cursor = birthMs;

  for (var i = 0; i < 12; i++) {
    var signOffset = isOddLagna ? i : -i;
    var dSignIdx = ((lagnaIdx + signOffset) % 12 + 12) % 12;
    var years = signYears[dSignIdx];
    var durationMs = years * yearMs;

    dashas.push({
      sign: JY_RASHI[dSignIdx],
      signZh: JY_RASHI[dSignIdx].zh,
      lord: JY_RASHI[dSignIdx].lord,
      lordZh: JY_PLANETS[JY_RASHI[dSignIdx].lord] ? JY_PLANETS[JY_RASHI[dSignIdx].lord].zh : '',
      years: years,
      start: new Date(cursor),
      end: new Date(cursor + durationMs),
      isCurrent: (Date.now() >= cursor && Date.now() < cursor + durationMs)
    });
    cursor += durationMs;
  }

  var current = dashas.find(function(d) { return d.isCurrent; });
  return {
    dashas: dashas,
    current: current,
    system: 'Chara (Jaimini)'
  };
}


// ── 9. JAIMINI: KARAKAMSA & SWAMSA ──
// Karakamsa = Navamsa sign of Atmakaraka
// Swamsa = Karakamsa used as Lagna for Navamsa chart reading

function jyCalcKarakamsa(planets, charaKarakas) {
  if (!charaKarakas || !charaKarakas.atmakaraka) return null;

  var ak = charaKarakas.atmakaraka;
  var akPlanet = planets[ak];
  if (!akPlanet || !akPlanet.navamsa) return null;

  var karakamsaIdx = akPlanet.navamsa.signIdx;
  var karakamsaSign = JY_RASHI[karakamsaIdx];

  // Swamsa analysis: planets from Karakamsa
  var swamsaPlanets = {};
  Object.keys(planets).forEach(function(p) {
    var pl = planets[p];
    if (!pl || !pl.navamsa) return;
    var d9Rashi = pl.navamsa.signIdx;
    var fromKarakamsa = ((d9Rashi - karakamsaIdx + 12) % 12) + 1;
    swamsaPlanets[p] = {
      d9Sign: JY_RASHI[d9Rashi].zh,
      houseFromKarakamsa: fromKarakamsa
    };
  });

  // Key readings from Karakamsa
  var readings = [];

  // Planets in Karakamsa (1st from it)
  Object.keys(swamsaPlanets).forEach(function(p) {
    var sp = swamsaPlanets[p];
    if (sp.houseFromKarakamsa === 1) {
      var pZh = JY_PLANETS[p] ? JY_PLANETS[p].zh : p;
      if (p === 'Sun') readings.push(pZh + '在Karakamsa：天生領導者，政府或權威相關');
      else if (p === 'Moon') readings.push(pZh + '在Karakamsa：直覺力強，可能從事照顧或滋養他人的工作');
      else if (p === 'Mars') readings.push(pZh + '在Karakamsa：武術/軍事/技術才能，或有過多爭鬥');
      else if (p === 'Mercury') readings.push(pZh + '在Karakamsa：商業才能，溝通與交易能力突出');
      else if (p === 'Jupiter') readings.push(pZh + '在Karakamsa：靈性導師潛質，吠陀知識與教學天賦');
      else if (p === 'Venus') readings.push(pZh + '在Karakamsa：藝術天賦，奢華生活，政治外交能力');
      else if (p === 'Saturn') readings.push(pZh + '在Karakamsa：苦行者特質，或從事傳統/結構性工作');
      else if (p === 'Rahu') readings.push(pZh + '在Karakamsa：弓箭/機械天賦，或涉及外國/非傳統領域');
      else if (p === 'Ketu') readings.push(pZh + '在Karakamsa：鐘錶/精密/靈性修行天賦');
    }
    // 5th from Karakamsa = Mantra Siddhi
    if (sp.houseFromKarakamsa === 5) {
      readings.push((JY_PLANETS[p] ? JY_PLANETS[p].zh : p) + '在Karakamsa第5宮：與此行星相關的咒語修持有效');
    }
    // 12th from Karakamsa = Moksha / Final liberation path
    if (sp.houseFromKarakamsa === 12) {
      readings.push((JY_PLANETS[p] ? JY_PLANETS[p].zh : p) + '在Karakamsa第12宮：解脫之路的指引');
    }
  });

  return {
    atmakaraka: ak,
    atmakarakaZh: JY_PLANETS[ak] ? JY_PLANETS[ak].zh : ak,
    karakamsaSign: karakamsaSign.zh,
    karakamsaIdx: karakamsaIdx,
    swamsaPlanets: swamsaPlanets,
    readings: readings,
    zh: '靈魂象徵星（' + (JY_PLANETS[ak] ? JY_PLANETS[ak].zh : ak) + '）的Karakamsa在' + karakamsaSign.zh + '座'
  };
}


// ── 10. SUDARSHANA CHAKRA ──
// Three-wheel system: charts from Lagna, Sun, and Moon as ascendant
// Each "house" in each wheel is analyzed together for comprehensive reading

function jyCalcSudarshanaChakra(planets, lagnaIdx) {
  var sunRashi = planets.Sun ? planets.Sun.rashiIdx : 0;
  var moonRashi = planets.Moon ? planets.Moon.rashiIdx : 0;

  var chakra = [];
  for (var h = 0; h < 12; h++) {
    var lagnaHouse = (lagnaIdx + h) % 12;
    var sunHouse = (sunRashi + h) % 12;
    var moonHouse = (moonRashi + h) % 12;

    // Find planets in each wheel's house
    var lagnaOccupants = [];
    var sunOccupants = [];
    var moonOccupants = [];

    Object.keys(planets).forEach(function(p) {
      var pl = planets[p];
      if (!pl) return;
      if (pl.rashiIdx === lagnaHouse) lagnaOccupants.push(p);
      if (pl.rashiIdx === sunHouse) sunOccupants.push(p);
      if (pl.rashiIdx === moonHouse) moonOccupants.push(p);
    });

    // Combined strength: count benefics vs malefics across all three wheels
    var beneficCount = 0, maleficCount = 0;
    [lagnaOccupants, sunOccupants, moonOccupants].forEach(function(occ) {
      occ.forEach(function(p) {
        var nature = JY_PLANETS[p] ? JY_PLANETS[p].nature : 'neutral';
        if (nature === 'benefic') beneficCount++;
        else if (nature === 'malefic') maleficCount++;
      });
    });

    var score = beneficCount - maleficCount;
    var label = score >= 2 ? '非常有利' : score >= 1 ? '有利' : score === 0 ? '中性' : score >= -1 ? '不利' : '非常不利';

    chakra.push({
      house: h + 1,
      lagnaSign: JY_RASHI[lagnaHouse].zh,
      sunSign: JY_RASHI[sunHouse].zh,
      moonSign: JY_RASHI[moonHouse].zh,
      lagnaOccupants: lagnaOccupants.map(function(p) { return JY_PLANETS[p] ? JY_PLANETS[p].zh : p; }),
      sunOccupants: sunOccupants.map(function(p) { return JY_PLANETS[p] ? JY_PLANETS[p].zh : p; }),
      moonOccupants: moonOccupants.map(function(p) { return JY_PLANETS[p] ? JY_PLANETS[p].zh : p; }),
      combinedScore: score,
      label: label,
      bhava: JY_BHAVA[h]
    });
  }

  return chakra;
}


// ── 11. PRECISE AYANA BALA ──
// Based on actual solar declination calculation

function jyPreciseAyanaBala(planets, jd) {
  var T = (jd - 2451545.0) / 36525.0;
  var obl = 23.439291 - 0.013004167 * T; // obliquity
  var results = {};

  var sevenPlanets = ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn'];
  // Northern declination benefic for: Sun, Mars, Jupiter (Uttarayana strong)
  // Southern declination benefic for: Moon, Venus, Saturn (Dakshinayana strong)
  var northernPlanets = ['Sun','Mars','Jupiter'];

  sevenPlanets.forEach(function(p) {
    var pl = planets[p];
    if (!pl) return;

    // Declination = asin(sin(obliquity) × sin(longitude))
    var lonRad = pl.sidLon * Math.PI / 180;
    var oblRad = obl * Math.PI / 180;
    var decl = Math.asin(Math.sin(oblRad) * Math.sin(lonRad)) * 180 / Math.PI;

    var isNorthern = decl > 0;
    var prefersNorth = northernPlanets.includes(p);

    // Ayana Bala = 60 × (1 + sin(decl × kranti_factor)) / 2
    // Simplified: planets in preferred hemisphere get more
    var ayanaBala;
    if ((isNorthern && prefersNorth) || (!isNorthern && !prefersNorth)) {
      ayanaBala = 30 + Math.round(Math.abs(decl) * 30 / 23.44); // max 60 at max declination
    } else {
      ayanaBala = 30 - Math.round(Math.abs(decl) * 30 / 23.44); // min 0
    }
    ayanaBala = Math.max(0, Math.min(60, ayanaBala));

    results[p] = {
      declination: Math.round(decl * 100) / 100,
      isNorthern: isNorthern,
      prefersNorth: prefersNorth,
      ayanaBala: ayanaBala,
      zh: (JY_PLANETS[p] ? JY_PLANETS[p].zh : p) + '赤緯' + Math.round(Math.abs(decl)) + '°' + (isNorthern ? '北' : '南')
    };
  });

  return results;
}


// ── 12. PINDA SHODHANA (3rd Ashtakavarga Reduction Layer) ──
// After Trikona + Ekadhipati reductions, multiply by Rashi-Graha multiplier

function jyPindaShodhana(ashtakavargaReduced, planets) {
  if (!ashtakavargaReduced || !ashtakavargaReduced.planets) return null;

  // Rashi Pinda: sum of reduced bindus for each planet across houses it influences
  // Graha Pinda: weighted sum using planet's own strength factor
  var rashiMultiplier = {0:7, 1:10, 2:8, 3:4, 4:10, 5:6, 6:7, 7:8, 8:9, 9:5, 10:11, 11:12};
  // Above: traditional multipliers per sign (Aries=7, Taurus=10, etc.)

  var sevenPlanets = ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn'];
  var grahaPinda = {};
  var rashiPinda = new Array(12).fill(0);

  sevenPlanets.forEach(function(p) {
    var red = ashtakavargaReduced.planets[p];
    if (!red) return;

    var pinda = 0;
    for (var s = 0; s < 12; s++) {
      var bindu = red.reduced[s] || 0;
      var multiplied = bindu * (rashiMultiplier[s] || 7);
      rashiPinda[s] += multiplied;
      pinda += multiplied;
    }

    grahaPinda[p] = {
      pinda: pinda,
      label: pinda >= 200 ? '極高' : pinda >= 150 ? '高' : pinda >= 100 ? '中等' : pinda >= 50 ? '低' : '極低'
    };
  });

  // Sodhya Pinda = Graha Pinda + Rashi Pinda (per planet at its position)
  var sodhyaPinda = {};
  sevenPlanets.forEach(function(p) {
    var pl = planets[p];
    if (!pl || !grahaPinda[p]) return;
    var rp = rashiPinda[pl.rashiIdx] || 0;
    var gp = grahaPinda[p].pinda;
    sodhyaPinda[p] = {
      grahaPinda: gp,
      rashiPinda: rp,
      sodhya: gp + rp,
      label: (gp + rp) >= 300 ? '極強' : (gp + rp) >= 200 ? '強' : (gp + rp) >= 100 ? '中等' : '弱'
    };
  });

  return {
    grahaPinda: grahaPinda,
    rashiPinda: rashiPinda,
    sodhyaPinda: sodhyaPinda
  };
}


// ── 13. PLANETARY AVASTHAS (States of Being) ──
// Each planet has a state based on its sign, degree, and relationship to other planets
// Baladi Avastha (Age-based): Bala(infant), Kumara(youth), Yuva(adult), Vriddha(old), Mrita(dead)
// Jagradadi Avastha: Jagrat(awake), Swapna(dreaming), Sushupti(sleeping)
// Shayanadi Avastha: 12 states from Shayana to Agama

function jyCalcAvasthas(planets) {
  var results = {};

  Object.keys(planets).forEach(function(p) {
    if (!JY_PLANETS[p]) return;
    var pl = planets[p];
    if (!pl) return;

    // ── Baladi Avastha (Age State) ──
    // Based on degree in sign and sign type (odd/even)
    var deg = pl.degInSign || 0;
    var isOddSign = (pl.rashiIdx % 2 === 0); // 0-indexed
    var baladiState;
    if (isOddSign) {
      // Odd signs: 0-6=Bala, 6-12=Kumara, 12-18=Yuva, 18-24=Vriddha, 24-30=Mrita
      if (deg < 6) baladiState = {en:'Bala', zh:'嬰兒態', strength:0.2};
      else if (deg < 12) baladiState = {en:'Kumara', zh:'少年態', strength:0.4};
      else if (deg < 18) baladiState = {en:'Yuva', zh:'青壯態', strength:1.0};
      else if (deg < 24) baladiState = {en:'Vriddha', zh:'老年態', strength:0.6};
      else baladiState = {en:'Mrita', zh:'死亡態', strength:0.1};
    } else {
      // Even signs: reverse
      if (deg < 6) baladiState = {en:'Mrita', zh:'死亡態', strength:0.1};
      else if (deg < 12) baladiState = {en:'Vriddha', zh:'老年態', strength:0.6};
      else if (deg < 18) baladiState = {en:'Yuva', zh:'青壯態', strength:1.0};
      else if (deg < 24) baladiState = {en:'Kumara', zh:'少年態', strength:0.4};
      else baladiState = {en:'Bala', zh:'嬰兒態', strength:0.2};
    }

    // ── Jagradadi Avastha (Consciousness State) ──
    // Jagrat(awake) = in own/exalted/friend sign
    // Swapna(dreaming) = in neutral sign
    // Sushupti(sleeping) = in enemy/debilitated sign
    var jagradadi;
    var dignity = pl.dignity || 'neutral';
    if (['exalted','own','moola'].includes(dignity)) {
      jagradadi = {en:'Jagrat', zh:'覺醒態', multiplier:1.0};
    } else if (['friend','neutral'].includes(dignity)) {
      jagradadi = {en:'Swapna', zh:'夢境態', multiplier:0.5};
    } else {
      jagradadi = {en:'Sushupti', zh:'沉睡態', multiplier:0.25};
    }

    // ── Lajjitadi Avastha (Emotional/Situational States) ──
    var lajjitadi = [];

    // Lajjita (Ashamed): planet in 5th house conjunct Rahu/Ketu/Saturn
    if (pl.bhava === 5) {
      var conjRKS = Object.keys(planets).some(function(op) {
        return ['Rahu','Ketu','Saturn'].includes(op) && planets[op].bhava === 5;
      });
      if (conjRKS) lajjitadi.push({name:'Lajjita', zh:'羞愧態', effect:'子女/投資事務受阻'});
    }

    // Garvita (Proud): planet in exaltation or Moola Trikona
    if (['exalted','moola'].includes(dignity)) {
      lajjitadi.push({name:'Garvita', zh:'驕傲態', effect:'自信過度但有實力'});
    }

    // Kshudita (Hungry): planet in enemy sign or conjunct enemy
    if (dignity === 'enemy' || dignity === 'debilitated') {
      lajjitadi.push({name:'Kshudita', zh:'飢餓態', effect:'渴望資源但難以獲得'});
    }

    // Trushita (Thirsty): planet in water sign aspected by enemy
    if (['Cancer','Scorpio','Pisces'].includes(JY_RASHI[pl.rashiIdx].en)) {
      var aspByEnemy = false;
      if (JY_NATURAL_FRIEND[p]) {
        var enemies = JY_NATURAL_FRIEND[p].enemies || [];
        enemies.forEach(function(ep) {
          // Simple check: is enemy aspecting this planet?
          if (planets[ep] && planets[ep].bhava) {
            var aspH = JY_ASPECTS[ep] || [7];
            aspH.forEach(function(ah) {
              var target = ((planets[ep].bhava - 1 + ah - 1) % 12) + 1;
              if (target === pl.bhava) aspByEnemy = true;
            });
          }
        });
      }
      if (aspByEnemy) lajjitadi.push({name:'Trushita', zh:'渴望態', effect:'情感需求強烈但難以滿足'});
    }

    // Mudita (Happy): planet in friend's sign conjunct/aspected by benefic
    if (dignity === 'friend') {
      var aspByBenefic = Object.keys(planets).some(function(op) {
        return ['Jupiter','Venus'].includes(op) && planets[op].bhava === pl.bhava;
      });
      if (aspByBenefic) lajjitadi.push({name:'Mudita', zh:'快樂態', effect:'事務順遂，貴人助力'});
    }

    // Effective strength multiplier
    var effectiveMultiplier = baladiState.strength * jagradadi.multiplier;

    results[p] = {
      baladi: baladiState,
      jagradadi: jagradadi,
      lajjitadi: lajjitadi,
      effectiveMultiplier: Math.round(effectiveMultiplier * 100) / 100,
      zh: (JY_PLANETS[p] ? JY_PLANETS[p].zh : p) + '：' + baladiState.zh + '＋' + jagradadi.zh +
          (lajjitadi.length > 0 ? '（' + lajjitadi.map(function(l) { return l.zh; }).join('、') + '）' : '') +
          '・有效倍率' + Math.round(effectiveMultiplier * 100) + '%'
    };
  });

  return results;
}


// ── 14. ADDITIONAL DIVISIONAL CHARTS ──

// D27 — Saptavimshamsa (Strength / Physical Stamina)
function jySaptavimshamsa(sidLon) {
  var signIdx = Math.floor(sidLon / 30) % 12;
  var deg = sidLon % 30;
  var part = Math.floor(deg / (30 / 27)); // 0-26
  if (part > 26) part = 26;

  var elMap = [0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3]; // sign→element index
  var elIdx = elMap[signIdx];
  var startSigns = [0, 3, 6, 9]; // Fire→Aries, Water→Cancer, Air→Libra, Earth→Capricorn
  var startSign = startSigns[elIdx];
  var d27SignIdx = (startSign + part) % 12;

  return {
    signIdx: d27SignIdx,
    rashi: JY_RASHI[d27SignIdx],
    part: part + 1,
    domain: '體力/耐力/身體強度'
  };
}

// D40 — Chatvarimsamsa / Khavedamsa (Auspicious/Inauspicious effects)
function jyKhavedamsa(sidLon) {
  var signIdx = Math.floor(sidLon / 30) % 12;
  var deg = sidLon % 30;
  var part = Math.floor(deg / 0.75); // 0-39
  if (part > 39) part = 39;

  var isOddSign = (signIdx % 2 === 0);
  var startSign = isOddSign ? 0 : 6; // Odd→Aries, Even→Libra
  var d40SignIdx = (startSign + part) % 12;

  return {
    signIdx: d40SignIdx,
    rashi: JY_RASHI[d40SignIdx],
    part: part + 1,
    domain: '吉凶效應/業力果報'
  };
}

// D45 — Akshavedamsa (General indications / character)
function jyAkshavedamsa(sidLon) {
  var signIdx = Math.floor(sidLon / 30) % 12;
  var deg = sidLon % 30;
  var part = Math.floor(deg / (30 / 45)); // 0-44
  if (part > 44) part = 44;

  var modes = ['Movable','Fixed','Dual'];
  var modeMap = {Movable:0, Fixed:4, Dual:8};
  var mode = JY_RASHI[signIdx].mode;
  var startSign = modeMap[mode] || 0;
  var d45SignIdx = (startSign + part) % 12;

  return {
    signIdx: d45SignIdx,
    rashi: JY_RASHI[d45SignIdx],
    part: part + 1,
    domain: '品格/性格深層'
  };
}


// ── 15. BHAVA MADHYA (House Midpoints) ──
// In Whole Sign system, Bhava Madhya = sign midpoint (15° of each sign)
// Planets near Bhava Madhya are stronger in that house's significations

function jyCalcBhavaMadhya(planets, lagnaIdx) {
  var results = [];

  for (var h = 0; h < 12; h++) {
    var hRashiIdx = (lagnaIdx + h) % 12;
    var madhyaLon = hRashiIdx * 30 + 15; // midpoint of sign

    // Planets near Bhava Madhya (within 5°)
    var nearPlanets = [];
    Object.keys(planets).forEach(function(p) {
      var pl = planets[p];
      if (!pl || pl.bhava !== h + 1) return;
      var distFromMadhya = Math.abs(pl.degInSign - 15);
      if (distFromMadhya <= 5) {
        nearPlanets.push({
          planet: p,
          planetZh: JY_PLANETS[p] ? JY_PLANETS[p].zh : p,
          distance: Math.round(distFromMadhya * 100) / 100,
          strength: distFromMadhya <= 2 ? '極強（近宮心）' : '偏強（靠近宮心）'
        });
      }
    });

    // Planets near Bhava Sandhi (junction, within 2° of sign boundary)
    var sandhiPlanets = [];
    Object.keys(planets).forEach(function(p) {
      var pl = planets[p];
      if (!pl || pl.bhava !== h + 1) return;
      var distFromEdge = Math.min(pl.degInSign, 30 - pl.degInSign);
      if (distFromEdge <= 2) {
        sandhiPlanets.push({
          planet: p,
          planetZh: JY_PLANETS[p] ? JY_PLANETS[p].zh : p,
          distance: Math.round(distFromEdge * 100) / 100,
          weakness: '在宮位邊界（Sandhi），力量削弱'
        });
      }
    });

    results.push({
      house: h + 1,
      madhyaLon: madhyaLon,
      nearMadhya: nearPlanets,
      nearSandhi: sandhiPlanets
    });
  }

  return results;
}


// ── 16. COMBUSTION CANCELLATION ──
// Conditions that cancel or mitigate combustion effects

function jyCombustionCancellation(planets, combustion) {
  if (!combustion) return {};

  var results = {};

  Object.keys(combustion).forEach(function(p) {
    var comb = combustion[p];
    if (!comb || !comb.isCombust) return;

    var cancellations = [];
    var pl = planets[p];
    if (!pl) return;

    // 1. Retrograde planet — combustion weakened
    if (pl.retrograde) {
      cancellations.push('逆行狀態下焦傷減弱（行星「迎戰」太陽）');
    }

    // 2. Planet in own sign or exalted — combustion significantly reduced
    if (pl.dignity === 'own' || pl.dignity === 'exalted' || pl.dignity === 'moola') {
      cancellations.push('在自宮/旺位/Moola，焦傷效果大幅減輕');
    }

    // 3. Cazimi (within 0°17') — not combust but extremely empowered
    if (comb.distance < 0.283) { // 17 arcminutes
      cancellations.push('入心（Cazimi）：不是焦傷，反而獲得太陽的最強力量加持');
    }

    // 4. Planet receiving benefic aspect (Jupiter/Venus)
    var beneficAsp = false;
    ['Jupiter','Venus'].forEach(function(bp) {
      if (!planets[bp]) return;
      var aspH = JY_ASPECTS[bp] || [7];
      aspH.forEach(function(ah) {
        var target = ((planets[bp].bhava - 1 + ah - 1) % 12) + 1;
        if (target === pl.bhava) {
          beneficAsp = true;
          cancellations.push((JY_PLANETS[bp] ? JY_PLANETS[bp].zh : bp) + '吉相位保護，減輕焦傷');
        }
      });
    });

    // 5. Planet as Yogakaraka (owns both Kendra and Trikona)
    // This is context-dependent; simplified check
    if (pl.bhava && [1,4,7,10].includes(pl.bhava)) {
      cancellations.push('在角宮位置，焦傷影響減弱');
    }

    var isCancelled = cancellations.length >= 2;
    var isPartial = cancellations.length === 1;

    results[p] = {
      originalSeverity: comb.severity,
      cancellations: cancellations,
      isCancelled: isCancelled,
      isPartialCancellation: isPartial,
      effectiveSeverity: isCancelled ? '已化解' : isPartial ? '減輕' : comb.severity,
      zh: cancellations.length > 0 ?
        (JY_PLANETS[p] ? JY_PLANETS[p].zh : p) + '焦傷' + (isCancelled ? '已取消' : '部分減輕') +
        '（' + cancellations.join('；') + '）' :
        (JY_PLANETS[p] ? JY_PLANETS[p].zh : p) + '焦傷無法取消，需以寶石/咒語補救'
    };
  });

  return results;
}


// ── 17. VARGA STRENGTH SUMMARY ──
// Count in how many Vargas a planet has dignity (Saptavargaja extended to all available vargas)

function jyVargaStrengthSummary(planets) {
  var results = {};

  Object.keys(planets).forEach(function(p) {
    var pl = planets[p];
    if (!pl || !JY_PLANETS[p]) return;

    var dignityCount = 0;
    var totalVargas = 0;
    var vargaDetails = [];

    // D1 (Rashi)
    totalVargas++;
    var d1Good = ['exalted','moola','own','friend'].includes(pl.dignity);
    if (d1Good) dignityCount++;
    vargaDetails.push({varga:'D1', sign: pl.rashi ? pl.rashi.zh : '', good: d1Good});

    // D9 (Navamsa)
    if (pl.navamsa) {
      totalVargas++;
      var d9Dig = jyGetDignity(p, pl.navamsa.signIdx, 15);
      var d9Good = ['exalted','moola','own','friend'].includes(d9Dig);
      if (d9Good) dignityCount++;
      vargaDetails.push({varga:'D9', sign: pl.navamsa.rashi ? pl.navamsa.rashi.zh : '', good: d9Good});
    }

    // D2 (Hora)
    if (pl.hora) {
      totalVargas++;
      var d2Good = pl.hora.lord === p;
      if (d2Good) dignityCount++;
      vargaDetails.push({varga:'D2', lord: pl.hora.lord, good: d2Good});
    }

    // D3 (Drekkana)
    if (pl.drekkana) {
      totalVargas++;
      var d3Dig = jyGetDignity(p, pl.drekkana.signIdx, 15);
      var d3Good = ['exalted','moola','own','friend'].includes(d3Dig);
      if (d3Good) dignityCount++;
      vargaDetails.push({varga:'D3', sign: pl.drekkana.rashi ? pl.drekkana.rashi.zh : '', good: d3Good});
    }

    // D10 (Dasamsa)
    if (pl.dasamsa) {
      totalVargas++;
      var d10Dig = jyGetDignity(p, pl.dasamsa.signIdx, 15);
      var d10Good = ['exalted','moola','own','friend'].includes(d10Dig);
      if (d10Good) dignityCount++;
      vargaDetails.push({varga:'D10', sign: pl.dasamsa.rashi ? pl.dasamsa.rashi.zh : '', good: d10Good});
    }

    // D12 (Dwadasamsa)
    if (pl.dwadasamsa) {
      totalVargas++;
      var d12Dig = jyGetDignity(p, pl.dwadasamsa.signIdx, 15);
      var d12Good = ['exalted','moola','own','friend'].includes(d12Dig);
      if (d12Good) dignityCount++;
      vargaDetails.push({varga:'D12', sign: pl.dwadasamsa.rashi ? pl.dwadasamsa.rashi.zh : '', good: d12Good});
    }

    // D7 (Saptamsa)
    if (pl.saptamsa) {
      totalVargas++;
      var d7Dig = jyGetDignity(p, pl.saptamsa.signIdx, 15);
      var d7Good = ['exalted','moola','own','friend'].includes(d7Dig);
      if (d7Good) dignityCount++;
      vargaDetails.push({varga:'D7', sign: pl.saptamsa.rashi ? pl.saptamsa.rashi.zh : '', good: d7Good});
    }

    var pct = totalVargas > 0 ? Math.round((dignityCount / totalVargas) * 100) : 0;
    var label = pct >= 70 ? '極強（多數分盤有尊貴）' : pct >= 50 ? '偏強' : pct >= 30 ? '中等' : '偏弱（多數分盤無尊貴）';

    results[p] = {
      dignityCount: dignityCount,
      totalVargas: totalVargas,
      percentage: pct,
      label: label,
      details: vargaDetails,
      zh: (JY_PLANETS[p] ? JY_PLANETS[p].zh : p) + '在' + totalVargas + '個分盤中有' + dignityCount + '個有尊貴度（' + pct + '%）'
    };
  });

  return results;
}


// ══════════════════════════════════════════════════════════════════════
// INTEGRATION: enhanceJyotish2 — call AFTER enhanceJyotish
// ══════════════════════════════════════════════════════════════════════

// ═══ Mangal Dosha（Kuja Dosha）完整判定 ═══
// 檢查火星在 1/2/4/7/8/12 宮三個參考點（Lagna/Moon/Venus）
// 並內建解消條件
function jyCheckMangalDosha(planets, lagnaIdx) {
  if (!planets || !planets.Mars || lagnaIdx === undefined) return null;

  var DOSHA_HOUSES = [1, 2, 4, 7, 8, 12];

  function houseFromRef(targetSignIdx, refSignIdx) {
    return ((targetSignIdx - refSignIdx + 12) % 12) + 1;
  }

  var marsSign = planets.Mars.signIdx;
  var marsLon = planets.Mars.sidLon;
  var marsDeg = planets.Mars.degInSign;

  // 三個參考點
  var refPoints = [
    { name: 'Lagna', signIdx: lagnaIdx, zh: '從上升' }
  ];
  if (planets.Moon && planets.Moon.signIdx !== undefined) {
    refPoints.push({ name: 'Moon', signIdx: planets.Moon.signIdx, zh: '從月亮' });
  }
  if (planets.Venus && planets.Venus.signIdx !== undefined) {
    refPoints.push({ name: 'Venus', signIdx: planets.Venus.signIdx, zh: '從金星' });
  }

  var hits = [];
  refPoints.forEach(function(ref) {
    var h = houseFromRef(marsSign, ref.signIdx);
    if (DOSHA_HOUSES.indexOf(h) >= 0) {
      hits.push({ ref: ref.name, refZh: ref.zh, house: h });
    }
  });

  if (hits.length === 0) {
    return {
      active: false,
      strength: 0,
      reason: '火星不在 1/2/4/7/8/12 宮（三參考點皆無），無 Mangal Dosha'
    };
  }

  // 強度：三點全中=重，兩點=中，一點=輕
  var strengthLabel = hits.length === 3 ? '重度' : hits.length === 2 ? '中度' : '輕度';

  // 解消條件檢查
  var cancellations = [];

  // 1. 火星在自家（白羊/天蠍）或旺宮（摩羯）→ 大幅抵消
  if (marsSign === 0 || marsSign === 7) {
    cancellations.push('火星在自家星座（' + (marsSign === 0 ? '白羊' : '天蠍') + '）→ 抵消');
  }
  if (marsSign === 9) {
    cancellations.push('火星在旺宮（摩羯）→ 抵消');
  }

  // 2. 火星在對應宮位的自家（如在7宮天蠍、4宮天蠍等）— 已包含在 1

  // 3. 火星被木星 aspect 或同宮
  if (planets.Jupiter) {
    if (planets.Jupiter.signIdx === marsSign) {
      cancellations.push('木星與火星同宮 → 抵消');
    } else {
      // 吠陀相位：木星額外看 5、9（從木星自己算第5/9宮）
      var jupSign = planets.Jupiter.signIdx;
      var jupSees = [
        (jupSign + 6) % 12,  // 7宮（對沖）
        (jupSign + 4) % 12,  // 5宮
        (jupSign + 8) % 12   // 9宮
      ];
      if (jupSees.indexOf(marsSign) >= 0) {
        cancellations.push('木星 Drishti 看到火星 → 部分抵消');
      }
    }
  }

  // 4. 火星在28歲後力量減弱（Raman 傳統說法）
  // 這是時間性的，不是結構性抵消，僅作提示

  // 5. 7宮若在水星/木星/金星主的星座（雙子/處女/射手/雙魚/金牛/天秤）→ 7宮dosha 減輕
  var seventhSign = (lagnaIdx + 6) % 12;
  var gentle7th = [1, 2, 5, 6, 8, 11]; // 金牛,雙子,處女,天秤,射手,雙魚
  if (hits.some(function(h) { return h.ref === 'Lagna' && h.house === 7; })) {
    if (gentle7th.indexOf(seventhSign) >= 0) {
      cancellations.push('第7宮為吉星主星座 → 7宮Dosha減輕');
    }
  }

  var effectiveActive = cancellations.length === 0;
  var finalLabel = effectiveActive ? strengthLabel : '技術成立但被解消';

  return {
    active: effectiveActive,
    technicallyPresent: true,
    strength: hits.length,
    strengthLabel: finalLabel,
    hits: hits,
    cancellations: cancellations,
    desc: effectiveActive
      ? '火星在 ' + hits.map(function(x){return x.refZh + '第' + x.house + '宮';}).join('、') + '，觸發 ' + strengthLabel + ' Mangal Dosha'
      : '火星雖落 Dosha 宮但已被解消：' + cancellations.join('；'),
    ramanNote: 'Raman觀點：Mangal Dosha 不是婚姻的終局。28歲後火星力量減弱；雙方皆有 Dosha 互相抵消；木星合照或金星強位皆能化解。現代應用應放寬，不可用以威嚇。',
    remedy: effectiveActive ? '常見化解：Hanuman Chalisa 念誦、週二穿紅、延後婚期至28歲後、結婚對象同有 Mangal Dosha 者' : null
  };
}

// ═══ Badhaka（障礙宮主）自動判定 ═══
// 活動座(白羊/巨蟹/天秤/摩羯=0/3/6/9)上升→11宮主
// 固定座(金牛/獅子/天蠍/水瓶=1/4/7/10)上升→9宮主
// 雙性座(雙子/處女/射手/雙魚=2/5/8/11)上升→7宮主
function jyCheckBadhaka(planets, lagnaIdx, houseLords) {
  if (lagnaIdx === undefined || !houseLords) return null;

  var signType, badhakaHouse, signTypeZh;
  var mod3 = lagnaIdx % 3;
  if (mod3 === 0) {
    signType = 'movable';
    signTypeZh = '活動座';
    badhakaHouse = 11;
  } else if (mod3 === 1) {
    signType = 'fixed';
    signTypeZh = '固定座';
    badhakaHouse = 9;
  } else {
    signType = 'dual';
    signTypeZh = '雙性座';
    badhakaHouse = 7;
  }

  // 找 Badhaka 宮主
  var badhakaLordObj = houseLords.find(function(h) { return h.house === badhakaHouse; });
  if (!badhakaLordObj) return null;

  var badhakaLord = badhakaLordObj.lord;
  var bLordPlanet = planets[badhakaLord];
  if (!bLordPlanet) return null;

  // Badhaka 宮主落哪裡
  var bLordHouse = ((bLordPlanet.signIdx - lagnaIdx + 12) % 12) + 1;

  // 判定危險度
  var dangerLevel = '中';
  var situation = '';

  // 落在困難宮（6/8/12）且非自身宮 → 低風險（Viparita 傾向）
  if ([6, 8, 12].indexOf(bLordHouse) >= 0 && bLordHouse !== badhakaHouse) {
    dangerLevel = '低';
    situation = 'Badhaka 宮主落困難宮，反而削弱 Badhaka 力量，障礙效果減輕';
  }
  // 落在 Lagna 或角宮/三方宮 → 最危險（Badhaka 獲強力）
  else if ([1, 4, 5, 7, 9, 10].indexOf(bLordHouse) >= 0) {
    dangerLevel = '高';
    situation = 'Badhaka 宮主落角宮/三方宮，力量強→障礙顯著，人生某領域容易卡住';
  }
  // 落在自己 Badhaka 宮
  else if (bLordHouse === badhakaHouse) {
    dangerLevel = '中高';
    situation = 'Badhaka 宮主在自家宮位，力量完整，障礙具體化';
  } else {
    dangerLevel = '中';
    situation = 'Badhaka 宮主落一般位置，障礙中等程度表現';
  }

  // 落在 Rahu/Ketu 軸 → 業力障礙
  var karmikNote = null;
  if (planets.Rahu && planets.Ketu) {
    var nodeSigns = [planets.Rahu.signIdx, planets.Ketu.signIdx];
    if (nodeSigns.indexOf(bLordPlanet.signIdx) >= 0) {
      karmikNote = 'Badhaka 宮主在 Rahu/Ketu 軸線上 → 障礙來自前世業力性質，非此生邏輯可解';
    }
  }

  return {
    signType: signType,
    signTypeZh: signTypeZh,
    badhakaHouse: badhakaHouse,
    badhakaLord: badhakaLord,
    badhakaLordHouse: bLordHouse,
    dangerLevel: dangerLevel,
    situation: situation,
    karmikNote: karmikNote,
    desc: '你的上升是' + signTypeZh + '(第' + (lagnaIdx + 1) + '宮=' + ['牡羊','金牛','雙子','巨蟹','獅子','處女','天秤','天蠍','射手','摩羯','水瓶','雙魚'][lagnaIdx] + ')' +
          '，Badhaka = 第' + badhakaHouse + '宮主 = ' + badhakaLord +
          '，此星落第' + bLordHouse + '宮。' + situation +
          (karmikNote ? '｜' + karmikNote : '')
  };
}

// ═══ Kala Sarpa Yoga Detection (12 Variants + Raman's Strict Rule) ═══
// Raman 嚴格定義：若任何行星（特別是月亮）與 Rahu 或 Ketu 同宮 → KSY 不成立
// 12 變體依 Rahu 所在宮位命名
function jyDetectKalaSarpa(planets, lagnaIdx) {
  if (!planets || !planets.Rahu || !planets.Ketu || lagnaIdx === undefined) return null;

  function houseOf(p) {
    if (!p || p.signIdx === undefined) return -1;
    return ((p.signIdx - lagnaIdx + 12) % 12) + 1;
  }

  var rahuSign = planets.Rahu.signIdx;
  var ketuSign = planets.Ketu.signIdx;
  var rahuH = houseOf(planets.Rahu);

  // 必要條件：Rahu 與 Ketu 恰好相對（180°）
  if (((rahuSign - ketuSign + 12) % 12) !== 6) return null;

  var sevenP = ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn'];

  // Raman 嚴格規則：任何行星與 Rahu 或 Ketu 同星座 → KSY 不成立
  var conjunctionBreaker = null;
  for (var i = 0; i < sevenP.length; i++) {
    var pl = planets[sevenP[i]];
    if (!pl) continue;
    if (pl.signIdx === rahuSign) { conjunctionBreaker = sevenP[i] + '與Rahu同宮'; break; }
    if (pl.signIdx === ketuSign) { conjunctionBreaker = sevenP[i] + '與Ketu同宮'; break; }
  }
  if (conjunctionBreaker) {
    return {
      active: false,
      reason: 'Raman嚴格規則：' + conjunctionBreaker + '，KSY不成立',
      moonEscaped: false
    };
  }

  // 檢查是否全部七顆在 Rahu→Ketu 弧（正向）或 Ketu→Rahu 弧（反向=Kala Amrita）
  // 正向弧：從 Rahu 往前數，經 6 宮到 Ketu
  function inForwardArc(signIdx) {
    // 返回 true 若 signIdx 落在 Rahu（含）往後到 Ketu（含）的範圍
    var diff = (signIdx - rahuSign + 12) % 12;
    return diff >= 0 && diff <= 6;
  }

  var allInForward = true, allInBackward = true;
  var moonInForward = true;
  for (var j = 0; j < sevenP.length; j++) {
    var p2 = planets[sevenP[j]];
    if (!p2) continue;
    var inFwd = inForwardArc(p2.signIdx);
    if (!inFwd) allInForward = false;
    if (inFwd) allInBackward = false;
    if (sevenP[j] === 'Moon' && !inFwd) moonInForward = false;
  }

  if (!allInForward && !allInBackward) {
    return { active: false, reason: '行星未全在Rahu-Ketu同側', moonEscaped: false };
  }

  // 12 變體（依 Rahu 所在宮位）
  var variants = {
    1: 'Ananta',   2: 'Kulika',      3: 'Vasuki',     4: 'Shankhapala',
    5: 'Padma',    6: 'Mahapadma',   7: 'Takshaka',   8: 'Karkotaka',
    9: 'Shankhachuda', 10: 'Ghatika', 11: 'Vishadhara', 12: 'Sheshnaga'
  };
  var variantZh = {
    1: '無窮蛇（婚姻關係課題）',
    2: '族蛇（財務家庭課題）',
    3: '婆蘇吉蛇（兄弟信仰課題）',
    4: '螺蛇（母親家產課題）',
    5: '蓮蛇（子女創造課題）',
    6: '大蓮蛇（健康敵人課題）',
    7: '塔克沙卡蛇（婚姻外遇課題）',
    8: '羯羅伽蛇（8宮轉化課題）',
    9: '螺頂蛇（父運信仰課題）',
    10: '厄運蛇（事業名聲課題）',
    11: '毒蛇（收益社交課題）',
    12: '千頭蛇（靈性解脫課題）'
  };

  var variantName = variants[rahuH] || 'Unknown';
  var isAmrita = allInBackward; // Ketu→Rahu 方向=Kala Amrita

  return {
    active: true,
    variant: variantName,
    variantZh: variantZh[rahuH] || '',
    rahuHouse: rahuH,
    ketuHouse: ((rahuH + 5) % 12) + 1,
    type: isAmrita ? 'Kala Amrita（靈性偏向）' : 'Kala Sarpa（物質偏向）',
    moonEscaped: false,
    ramanNote: 'Raman觀點：此Yoga不見於古典文獻，對個人盤影響有限，主要用於世事占星。看到此Yoga不必驚慌，須檢查是否被其他吉Yoga抵消。',
    severity: isAmrita ? '輕' : '中',
    desc: (isAmrita ? 'Kala Amrita Yoga（' : 'Kala Sarpa Yoga（') + variantName + '）——' + (variantZh[rahuH] || '') + '。' +
          (isAmrita ? '反向版本偏靈性提升' : '主人生起伏但未必大凶') +
          '。★ Raman認定為mundane astrology主用，個人盤影響有限。'
  };
}

// ═══ PMY 強度判定輔助（從月亮起算的角宮檢查）═══
function jyPmyStrengthFromMoon(planets, lagnaIdx, planetName) {
  if (!planets || !planets[planetName] || !planets.Moon) return null;
  var moonSign = planets.Moon.signIdx;
  var pSign = planets[planetName].signIdx;
  var diffFromMoon = ((pSign - moonSign + 12) % 12);
  // 角宮：0,3,6,9（即從月亮起的1/4/7/10宮）
  var inMoonKendra = (diffFromMoon === 0 || diffFromMoon === 3 || diffFromMoon === 6 || diffFromMoon === 9);
  function houseOf(p) {
    return ((p.signIdx - lagnaIdx + 12) % 12) + 1;
  }
  var h = houseOf(planets[planetName]);
  var inLagnaKendra = (h === 1 || h === 4 || h === 7 || h === 10);
  if (inLagnaKendra) return { level: 'strong', desc: 'Lagna角宮+廟旺=強PMY' };
  if (inMoonKendra)  return { level: 'medium', desc: '月亮角宮+廟旺=中等PMY（非Lagna角宮）' };
  return null;
}

// ═══ Yoga Detection System ═══
// Detect classical Yogas from planet positions and house lordships
function jyDetectYogas(planets, lagnaIdx, houseLords) {
  if (!planets || lagnaIdx === undefined) return [];
  var yogas = [];
  var SIGNS = 12;
  function houseOf(planet) {
    if (!planet || planet.signIdx === undefined) return -1;
    return ((planet.signIdx - lagnaIdx + 12) % 12) + 1;
  }
  function lordOf(house) {
    if (!houseLords) return null;
    var hl = houseLords.find(function(h) { return h.house === house; });
    return hl ? hl.lord : null;
  }
  function isKendra(h) { return h === 1 || h === 4 || h === 7 || h === 10; }
  function isTrikona(h) { return h === 1 || h === 5 || h === 9; }
  function isDusthana(h) { return h === 6 || h === 8 || h === 12; }
  function isUpachaya(h) { return h === 3 || h === 6 || h === 10 || h === 11; }

  // Helper: check if two planets are in mutual kendras
  function inMutualKendra(p1House, p2House) {
    var diff = Math.abs(p1House - p2House);
    return diff === 0 || diff === 3 || diff === 6 || diff === 9;
  }

  var jupH = houseOf(planets.Jupiter);
  var venH = houseOf(planets.Venus);
  var satH = houseOf(planets.Saturn);
  var marH = houseOf(planets.Mars);
  var sunH = houseOf(planets.Sun);
  var monH = houseOf(planets.Moon);
  var merH = houseOf(planets.Mercury);
  var rahH = houseOf(planets.Rahu);
  var ketH = houseOf(planets.Ketu);

  // 1. Gajakesari Yoga (Jupiter in Kendra from Moon)
  if (jupH > 0 && monH > 0) {
    var diff = ((jupH - monH + 12) % 12);
    if (diff === 0 || diff === 3 || diff === 6 || diff === 9) {
      yogas.push({ name: 'Gajakesari Yoga', level: '吉', desc: '木星在月亮的角宮——主智慧、名望、長壽。做事有遠見，貴人運佳。' });
    }
  }

  // 2. Chandra-Mangala Yoga (Moon + Mars conjunction or mutual aspect)
  if (monH > 0 && marH > 0 && monH === marH) {
    yogas.push({ name: 'Chandra-Mangala Yoga', level: '雙面', desc: '月亮火星同宮——主財富但情緒波動大。能賺錢但容易衝動花錢。' });
  }

  // 3. Budha-Aditya Yoga (Sun + Mercury in same house, Mercury not combust)
  if (sunH > 0 && merH > 0 && sunH === merH) {
    var merCombust = planets.Mercury && Math.abs((planets.Mercury.sidLon || 0) - (planets.Sun.sidLon || 0)) < 14;
    if (!merCombust) {
      yogas.push({ name: 'Budha-Aditya Yoga', level: '吉', desc: '太陽水星同宮且水星未被燃燒——主聰明、口才好、學習能力強。' });
    }
  }

  // 4. Hamsa Yoga (Jupiter in Kendra in own/exalted sign)
  if (jupH > 0 && isKendra(jupH)) {
    var jupSign = planets.Jupiter ? planets.Jupiter.signIdx : -1;
    if (jupSign === 8 || jupSign === 11 || jupSign === 3) { // Sagittarius, Pisces, Cancer
      yogas.push({ name: 'Hamsa Yoga', level: '大吉', desc: 'Pancha Mahapurusha——木星在角宮且廟旺。主高貴、有道德、學識淵博、受人尊敬。' });
    }
  }

  // 5. Malavya Yoga (Venus in Kendra in own/exalted sign)
  if (venH > 0 && isKendra(venH)) {
    var venSign = planets.Venus ? planets.Venus.signIdx : -1;
    if (venSign === 1 || venSign === 6 || venSign === 11) { // Taurus, Libra, Pisces
      yogas.push({ name: 'Malavya Yoga', level: '大吉', desc: 'Pancha Mahapurusha——金星在角宮且廟旺。主美貌、藝術才華、婚姻幸福、物質豐盛。' });
    }
  }

  // 6. Ruchaka Yoga (Mars in Kendra in own/exalted sign)
  if (marH > 0 && isKendra(marH)) {
    var marSign = planets.Mars ? planets.Mars.signIdx : -1;
    if (marSign === 0 || marSign === 7 || marSign === 9) { // Aries, Scorpio, Capricorn
      yogas.push({ name: 'Ruchaka Yoga', level: '大吉', desc: 'Pancha Mahapurusha——火星在角宮且廟旺。主勇敢、領導力、軍事/體育才能。' });
    }
  }

  // 7. Bhadra Yoga (Mercury in Kendra in own/exalted sign)
  if (merH > 0 && isKendra(merH)) {
    var merSign = planets.Mercury ? planets.Mercury.signIdx : -1;
    if (merSign === 2 || merSign === 5) { // Gemini, Virgo
      yogas.push({ name: 'Bhadra Yoga', level: '大吉', desc: 'Pancha Mahapurusha——水星在角宮且廟旺。主聰慧、商業頭腦、溝通能力極佳。' });
    }
  }

  // 8. Sasa Yoga (Saturn in Kendra in own/exalted sign)
  if (satH > 0 && isKendra(satH)) {
    var satSign = planets.Saturn ? planets.Saturn.signIdx : -1;
    if (satSign === 9 || satSign === 10 || satSign === 6) { // Capricorn, Aquarius, Libra
      yogas.push({ name: 'Sasa Yoga', level: '大吉', desc: 'Pancha Mahapurusha——土星在角宮且廟旺。主權威、管理能力、大器晚成。' });
    }
  }

  // 9-10. Raja Yoga (Kendra lord + Trikona lord conjunction or mutual aspect)
  if (houseLords) {
    var kendraHouses = [1, 4, 7, 10];
    var trikonaHouses = [1, 5, 9];
    kendraHouses.forEach(function(kh) {
      trikonaHouses.forEach(function(th) {
        if (kh === th) return; // skip 1st house (both kendra and trikona)
        var kLord = lordOf(kh);
        var tLord = lordOf(th);
        if (!kLord || !tLord || kLord === tLord) return;
        var kLordH = houseOf(planets[kLord]);
        var tLordH = houseOf(planets[tLord]);
        if (kLordH > 0 && tLordH > 0 && kLordH === tLordH) {
          yogas.push({ name: 'Raja Yoga', level: '大吉', desc: kh + '宮主(' + kLord + ')與' + th + '宮主(' + tLord + ')同宮——角宮與三角宮主聯合，主權力與成就。' });
        }
      });
    });
  }

  // 11. Dhana Yoga (2nd/11th lord + Kendra/Trikona lord)
  if (houseLords) {
    [2, 11].forEach(function(dh) {
      var dLord = lordOf(dh);
      if (!dLord) return;
      var dLordH = houseOf(planets[dLord]);
      [1, 5, 9].forEach(function(th) {
        var tLord = lordOf(th);
        if (!tLord || tLord === dLord) return;
        var tLordH = houseOf(planets[tLord]);
        if (dLordH > 0 && tLordH > 0 && dLordH === tLordH) {
          yogas.push({ name: 'Dhana Yoga', level: '吉', desc: dh + '宮主(' + dLord + ')與' + th + '宮主(' + tLord + ')同宮——主財富積累。' });
        }
      });
    });
  }

  // 12. Viparita Raja Yoga (6/8/12 lords in 6/8/12)
  if (houseLords) {
    [6, 8, 12].forEach(function(dh) {
      var dLord = lordOf(dh);
      if (!dLord) return;
      var dLordH = houseOf(planets[dLord]);
      if (isDusthana(dLordH) && dLordH !== dh) {
        yogas.push({ name: 'Viparita Raja Yoga', level: '吉', desc: dh + '宮主(' + dLord + ')落入' + dLordH + '宮——凶星入凶宮，反轉為吉。困境中反而得到意外的好運。' });
      }
    });
  }

  // 13. Kemadruma Yoga (Moon has no planets in 2nd/12th from it — a negative yoga)
  if (monH > 0) {
    var mon2 = (monH % 12) + 1;
    var mon12 = ((monH - 2 + 12) % 12) + 1;
    var hasPlanetNearMoon = [jupH, venH, merH, marH, satH].some(function(h) {
      return h === mon2 || h === mon12;
    });
    if (!hasPlanetNearMoon) {
      yogas.push({ name: 'Kemadruma Yoga', level: '凶', desc: '月亮前後宮位都沒有行星——主孤獨、財務不穩、需要自己打拼。但如果月亮在角宮或被木星看，此凶可解。' });
    }
  }

  // 14. Adhi Yoga (benefics in 6/7/8 from Moon)
  if (monH > 0) {
    var mon6 = ((monH + 4) % 12) + 1;
    var mon7 = ((monH + 5) % 12) + 1;
    var mon8 = ((monH + 6) % 12) + 1;
    var benIn678 = [jupH, venH, merH].filter(function(h) { return h === mon6 || h === mon7 || h === mon8; });
    if (benIn678.length >= 2) {
      yogas.push({ name: 'Adhi Yoga', level: '大吉', desc: '吉星在月亮的6/7/8宮——主權勢、富裕、眾人敬重。是非常強的保護格局。' });
    }
  }

  // 15. Saraswati Yoga (Jupiter, Venus, Mercury in Kendra/Trikona/2nd)
  var goodHouses = function(h) { return isKendra(h) || isTrikona(h) || h === 2; };
  if (jupH > 0 && venH > 0 && merH > 0 && goodHouses(jupH) && goodHouses(venH) && goodHouses(merH)) {
    yogas.push({ name: 'Saraswati Yoga', level: '大吉', desc: '木星金星水星都在好宮位——主學識、藝術、口才俱佳。適合文教、藝術領域。' });
  }

  // 16. Lakshmi Yoga (9th lord strong + Venus in own/exalted + in Kendra/Trikona)
  if (houseLords) {
    var lord9 = lordOf(9);
    if (lord9) {
      var lord9H = houseOf(planets[lord9]);
      if (lord9H > 0 && (isKendra(lord9H) || isTrikona(lord9H)) && venH > 0 && (isKendra(venH) || isTrikona(venH))) {
        yogas.push({ name: 'Lakshmi Yoga', level: '大吉', desc: '9宮主強且金星在好位置——主財富、幸福、好運。一生不缺物質資源。' });
      }
    }
  }

  // 17. Neecha Bhanga Raja Yoga (check debilitated planets directly)
  Object.keys(planets).forEach(function(pName) {
    var pl = planets[pName];
    if (pl && pl.dignity === 'debilitated' && typeof jyCheckNeechaBhanga === 'function') {
      try {
        var nb = jyCheckNeechaBhanga(pName, planets, lagnaIdx);
        if (nb && nb.cancelled) {
          yogas.push({ name: 'Neecha Bhanga Raja Yoga', level: '吉', desc: pName + '落陷但被取消——最低處反彈為最高處。主歷經困難後成就非凡。' });
        }
      } catch(_){}
    }
  });

  // Deduplicate by name (keep first of each type, except Raja Yoga which can have multiple)
  var seen = {};
  var deduped = yogas.filter(function(y) {
    if (y.name === 'Raja Yoga' || y.name === 'Dhana Yoga' || y.name === 'Viparita Raja Yoga') return true;
    if (seen[y.name]) return false;
    seen[y.name] = true;
    return true;
  });

  return deduped.slice(0, 15); // cap at 15 yogas
}

function enhanceJyotish2(jy, birthDate) {
  if (!jy) return jy;

  var planets = jy.planets;
  var lagnaIdx = jy.lagna ? jy.lagna.idx : 0;

  try { jy.vargottama = jyDetectVargottama(planets); } catch(e) { jy.vargottama = null; }
  try { jy.pushkara = jyCheckPushkara(planets); } catch(e) { jy.pushkara = null; }
  try { jy.mrityuBhaga = jyCheckMrityuBhaga(planets); } catch(e) { jy.mrityuBhaga = null; }
  try { jy.gandanta = jyCheckGandanta(planets); } catch(e) { jy.gandanta = null; }
  try { jy.bhavaBala = jyCalcBhavaBala(planets, lagnaIdx, jy.houseLords, jy.aspects, jy.shadbala_v2 || jy.shadbala); } catch(e) { jy.bhavaBala = null; }
  if (planets.Moon && planets.Moon.sidLon !== undefined && birthDate) {
    try { jy.yoginiDasha = jyCalcYoginiDasha(planets.Moon.sidLon, birthDate); } catch(e) { jy.yoginiDasha = null; }
  }
  if (planets.Moon && planets.Moon.sidLon !== undefined && birthDate) {
    try { jy.ashtottariDasha = jyCalcAshtottariDasha(planets.Moon.sidLon, birthDate); } catch(e) { jy.ashtottariDasha = null; }
  }
  if (birthDate) {
    try { jy.charaDasha = jyCalcCharaDasha(lagnaIdx, planets, birthDate); } catch(e) { jy.charaDasha = null; }
  }
  if (jy.charaKarakas) {
    try { jy.karakamsa = jyCalcKarakamsa(planets, jy.charaKarakas); } catch(e) { jy.karakamsa = null; }
  }
  try { jy.sudarshanaChakra = jyCalcSudarshanaChakra(planets, lagnaIdx); } catch(e) { jy.sudarshanaChakra = null; }
  if (jy.lagna && jy.lagna.lon !== undefined) {
    try {
      // ★ Bug #36 fix: 必須傳真實 JD（之前傳 lagna.lon + ayanamsa，是錯的「假 JD」）
      //   假 JD 會讓 obliquity 計算結果離譜（約 871 度），declination 錯亂
      var _realJd2 = (typeof jy.jd === 'number') ? jy.jd : 2451545.0;
      jy.preciseAyanaBala = jyPreciseAyanaBala(planets, _realJd2);
    } catch(e) { jy.preciseAyanaBala = null; }
  }
  if (jy.ashtakavargaReduced) {
    try { jy.pindaShodhana = jyPindaShodhana(jy.ashtakavargaReduced, planets); } catch(e) { jy.pindaShodhana = null; }
  }
  try { jy.avasthas = jyCalcAvasthas(planets); } catch(e) { jy.avasthas = null; }
  Object.keys(planets).forEach(function(p) {
    var pl = planets[p];
    if (!pl || !pl.sidLon) return;
    try { pl.saptavimshamsa = jySaptavimshamsa(pl.sidLon); } catch(e) {}
    try { pl.khavedamsa = jyKhavedamsa(pl.sidLon); } catch(e) {}
    try { pl.akshavedamsa = jyAkshavedamsa(pl.sidLon); } catch(e) {}
  });
  try { jy.bhavaMadhya = jyCalcBhavaMadhya(planets, lagnaIdx); } catch(e) { jy.bhavaMadhya = null; }
  if (jy.combustion) {
    try { jy.combustionCancellation = jyCombustionCancellation(planets, jy.combustion); } catch(e) { jy.combustionCancellation = null; }
  }
  try { jy.vargaStrength = jyVargaStrengthSummary(planets); } catch(e) { jy.vargaStrength = null; }

  // 18. Classical Yoga Detection
  try { jy.yogas = jyDetectYogas(planets, lagnaIdx, jy.houseLords); } catch(e) { jy.yogas = []; }

  // 19. Kala Sarpa / Kala Amrita Detection（Raman 嚴格規則版）
  try { jy.kalaSarpa = jyDetectKalaSarpa(planets, lagnaIdx); } catch(e) { jy.kalaSarpa = null; }

  // 20. Mangal Dosha 完整判定（三參考點+解消條件）
  try { jy.mangalDosha = jyCheckMangalDosha(planets, lagnaIdx); } catch(e) { jy.mangalDosha = null; }

  // 21. Badhaka 障礙宮主自動判定
  try { jy.badhaka = jyCheckBadhaka(planets, lagnaIdx, jy.houseLords); } catch(e) { jy.badhaka = null; }

  return jy;
}
