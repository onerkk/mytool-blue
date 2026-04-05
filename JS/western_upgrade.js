// ══════════════════════════════════════════════════════════════════════
// 🔮 WESTERN ASTROLOGY DEEP UPGRADE
// Essential Dignity · Sect · Dispositor · Mutual Reception · Aspect Patterns
// Transit-to-Natal · Secondary Progressions · Solar Arc · Annual Profections
// Solar Return · Comprehensive Planet Strength
// ══════════════════════════════════════════════════════════════════════
// 此檔案為 bazi.js 中 computeNatalChart 的延伸，所有函式掛在全域
// 不改動既有函式簽名，只新增新函式 + 在 computeNatalChart 尾部注入新屬性

// ── 1. ESSENTIAL DIGNITY 完整體系 ──
// Ptolemaic essential dignity: domicile, exaltation, triplicity, term (Egyptian), face (decanate)
// Each dignity level has a traditional score: Domicile +5, Exaltation +4, Triplicity +3, Term +2, Face +1
// Detriment -5, Fall -4, Peregrine 0

var W_DIGNITY_RULERS = {
  // signIdx: domicile ruler(s)
  0: ['火星'], 1: ['金星'], 2: ['水星'], 3: ['月亮'], 4: ['太陽'], 5: ['水星'],
  6: ['金星'], 7: ['火星','冥王'], 8: ['木星'], 9: ['土星'], 10: ['土星','天王'], 11: ['木星','海王']
};

var W_EXALTATION = {
  '太陽': {sign:0, deg:19},   // Aries 19°
  '月亮': {sign:1, deg:3},    // Taurus 3°
  '水星': {sign:5, deg:15},   // Virgo 15°
  '金星': {sign:11, deg:27},  // Pisces 27°
  '火星': {sign:9, deg:28},   // Capricorn 28°
  '木星': {sign:3, deg:15},   // Cancer 15°
  '土星': {sign:6, deg:21},   // Libra 21°
  '北交': {sign:2, deg:3}     // Gemini 3° (disputed)
};

var W_DETRIMENT = {
  '太陽': [10], '月亮': [9], '水星': [8,11], '金星': [0,7], '火星': [1,6], '木星': [2,5], '土星': [3,4]
};

var W_FALL = {
  '太陽': {sign:6},  '月亮': {sign:7}, '水星': {sign:11}, '金星': {sign:5},
  '火星': {sign:3},  '木星': {sign:9}, '土星': {sign:0}
};

// Egyptian Terms (Bounds) — each sign divided into 5 unequal segments ruled by classical planets
// Format: [endDeg, ruler] — ruler planet for degrees up to endDeg within each sign
var W_EGYPTIAN_TERMS = [
  /* Aries  0*/ [[6,'木星'],[12,'金星'],[20,'水星'],[25,'火星'],[30,'土星']],
  /* Taurus 1*/ [[8,'金星'],[14,'水星'],[22,'木星'],[27,'土星'],[30,'火星']],
  /* Gemini 2*/ [[6,'水星'],[12,'木星'],[17,'金星'],[24,'火星'],[30,'土星']],
  /* Cancer 3*/ [[7,'火星'],[13,'金星'],[19,'水星'],[26,'木星'],[30,'土星']],
  /* Leo    4*/ [[6,'木星'],[11,'金星'],[18,'土星'],[24,'水星'],[30,'火星']],
  /* Virgo  5*/ [[7,'水星'],[17,'金星'],[21,'木星'],[28,'火星'],[30,'土星']],
  /* Libra  6*/ [[6,'土星'],[14,'水星'],[21,'木星'],[28,'金星'],[30,'火星']],
  /* Scorpio7*/ [[7,'火星'],[11,'金星'],[19,'水星'],[24,'木星'],[30,'土星']],
  /* Sag    8*/ [[12,'木星'],[17,'金星'],[21,'水星'],[26,'土星'],[30,'火星']],
  /* Cap    9*/ [[7,'水星'],[14,'木星'],[22,'金星'],[26,'土星'],[30,'火星']],
  /* Aquar 10*/ [[7,'水星'],[13,'金星'],[20,'木星'],[25,'火星'],[30,'土星']],
  /* Pisces11*/ [[12,'金星'],[16,'木星'],[19,'水星'],[28,'火星'],[30,'土星']]
];

// Decanic Faces (Chaldean order: Saturn, Jupiter, Mars, Sun, Venus, Mercury, Moon repeating)
// Each sign has 3 faces of 10° each
var W_FACE_ORDER = ['火星','太陽','金星','水星','月亮','土星','木星']; // Chaldean descending
// Aries 1st face = Mars, 2nd = Sun, 3rd = Venus, Taurus 1st = Mercury, etc.
// Actually the traditional Chaldean order starting from Aries decan 1:
var W_FACES = [
  ['火星','太陽','金星'], // Aries
  ['水星','月亮','土星'], // Taurus
  ['木星','火星','太陽'], // Gemini
  ['金星','水星','月亮'], // Cancer
  ['土星','木星','火星'], // Leo
  ['太陽','金星','水星'], // Virgo
  ['月亮','土星','木星'], // Libra
  ['火星','太陽','金星'], // Scorpio
  ['水星','月亮','土星'], // Sagittarius
  ['木星','火星','太陽'], // Capricorn
  ['金星','水星','月亮'], // Aquarius
  ['土星','木星','火星']  // Pisces
];

// Triplicity rulers (Dorothean system: day ruler, night ruler, participating ruler)
var W_TRIPLICITY = {
  Fire:  {day:'太陽', night:'木星', part:'土星'},   // 0,4,8
  Earth: {day:'金星', night:'月亮', part:'火星'},   // 1,5,9
  Air:   {day:'土星', night:'水星', part:'木星'},   // 2,6,10
  Water: {day:'金星', night:'火星', part:'月亮'}    // 3,7,11 (Mars by night per Dorotheus)
};

var W_ELEMENT_MAP = ['Fire','Earth','Air','Water','Fire','Earth','Air','Water','Fire','Earth','Air','Water'];

/**
 * Calculate complete essential dignity for a planet
 * @param {string} planetName - Chinese name ('太陽', '月亮', etc.)
 * @param {number} signIdx - 0-11
 * @param {number} degInSign - 0-30
 * @param {boolean} isDaytime - whether chart is diurnal
 * @returns {object} dignity breakdown with total score
 */
function calcEssentialDignity(planetName, signIdx, degInSign, isDaytime) {
  var score = 0;
  var dignities = [];
  var debilities = [];

  // 1. Domicile (+5)
  var rulers = W_DIGNITY_RULERS[signIdx] || [];
  if (rulers.includes(planetName)) {
    score += 5;
    dignities.push({type:'domicile', zh:'入廟', score:5});
  }
  // Detriment (-5)
  var detri = W_DETRIMENT[planetName];
  if (detri && (Array.isArray(detri) ? detri.includes(signIdx) : detri === signIdx)) {
    score -= 5;
    debilities.push({type:'detriment', zh:'陷落', score:-5});
  }

  // 2. Exaltation (+4) / Fall (-4)
  var exalt = W_EXALTATION[planetName];
  if (exalt && exalt.sign === signIdx) {
    score += 4;
    dignities.push({type:'exaltation', zh:'旺', score:4});
  }
  var fall = W_FALL[planetName];
  if (fall && fall.sign === signIdx) {
    score -= 4;
    debilities.push({type:'fall', zh:'落', score:-4});
  }

  // 3. Triplicity (+3) — only classical 7 planets
  if (['太陽','月亮','水星','金星','火星','木星','土星'].includes(planetName)) {
    var el = W_ELEMENT_MAP[signIdx];
    var trip = W_TRIPLICITY[el];
    if (trip) {
      var tripRuler = isDaytime ? trip.day : trip.night;
      if (tripRuler === planetName) {
        score += 3;
        dignities.push({type:'triplicity', zh:'三分主星', score:3});
      } else if (trip.part === planetName) {
        score += 1; // participating ruler gets reduced dignity
        dignities.push({type:'triplicity_part', zh:'三分參與', score:1});
      }
    }
  }

  // 4. Term/Bound (+2)
  if (['太陽','月亮','水星','金星','火星','木星','土星'].includes(planetName)) {
    var terms = W_EGYPTIAN_TERMS[signIdx];
    if (terms) {
      for (var t = 0; t < terms.length; t++) {
        if (degInSign < terms[t][0]) {
          if (terms[t][1] === planetName) {
            score += 2;
            dignities.push({type:'term', zh:'界', score:2});
          }
          break;
        }
      }
    }
  }

  // 5. Face/Decanate (+1)
  if (['太陽','月亮','水星','金星','火星','木星','土星'].includes(planetName)) {
    var faceIdx = Math.min(2, Math.floor(degInSign / 10));
    var faces = W_FACES[signIdx];
    if (faces && faces[faceIdx] === planetName) {
      score += 1;
      dignities.push({type:'face', zh:'面', score:1});
    }
  }

  // Peregrine check: no essential dignity at all
  var isPeregrine = (dignities.length === 0 && debilities.length === 0);
  if (isPeregrine && ['太陽','月亮','水星','金星','火星','木星','土星'].includes(planetName)) {
    debilities.push({type:'peregrine', zh:'游離', score:-5});
    score -= 5;
  }

  return {
    score: score,
    dignities: dignities,
    debilities: debilities,
    isPeregrine: isPeregrine,
    label: score >= 7 ? '極強尊貴' : score >= 4 ? '有力' : score >= 1 ? '略強' :
           score >= 0 ? '平庸' : score >= -3 ? '偏弱' : score >= -5 ? '虛弱' : '極度虛弱',
    labelEn: score >= 7 ? 'very dignified' : score >= 4 ? 'dignified' : score >= 1 ? 'slightly dignified' :
             score >= 0 ? 'neutral' : score >= -3 ? 'slightly debilitated' : 'debilitated'
  };
}


// ── 2. SECT（晝夜派系）──
// Diurnal chart: Sun above horizon → Sun is sect light, Jupiter & Saturn are sect benefic/malefic
// Nocturnal chart: Moon is sect light, Venus & Mars are sect benefic/malefic

function calcSect(planets, asc, houses) {
  // Determine if chart is diurnal: Sun above horizon (between ASC and DSC via MC)
  var sunLon = planets['太陽'] ? planets['太陽'].lon : 0;
  var sunHouse = planets['太陽'] ? planets['太陽'].house : 1;
  var isDaytime = (sunHouse >= 7 && sunHouse <= 12) || sunHouse === 1; // houses 7-12 are above horizon in Placidus

  // More precise: check if Sun is between houses[0] (ASC) going counter-clockwise to houses[6] (DSC)
  // Sun above horizon = between DSC (house 7 cusp) and ASC going through MC
  var ascLon = houses[0];
  var dscLon = houses[6];
  var sunDist = _n360(sunLon - dscLon);
  var ascDist = _n360(ascLon - dscLon);
  isDaytime = sunDist <= ascDist;

  var sectLight = isDaytime ? '太陽' : '月亮';
  var sectBenefic = isDaytime ? '木星' : '金星';
  var sectMalefic = isDaytime ? '土星' : '火星';
  var contraSectBenefic = isDaytime ? '金星' : '木星';
  var contraSectMalefic = isDaytime ? '火星' : '土星';

  // Each planet's sect status
  var planetSect = {};
  var classicalPlanets = ['太陽','月亮','水星','金星','火星','木星','土星'];
  classicalPlanets.forEach(function(p) {
    var pl = planets[p];
    if (!pl) return;
    var isAboveHorizon = false;
    if (pl.house) {
      var hDist = _n360(pl.lon - dscLon);
      isAboveHorizon = hDist <= ascDist;
    }

    var inSect = false;
    var sectRole = 'neutral';
    // Sect light
    if (p === sectLight) { inSect = true; sectRole = 'sect_light'; }
    // Sect benefic/malefic
    else if (p === sectBenefic) { inSect = true; sectRole = 'sect_benefic'; }
    else if (p === sectMalefic) { inSect = true; sectRole = 'sect_malefic'; }
    else if (p === contraSectBenefic) { inSect = false; sectRole = 'contra_benefic'; }
    else if (p === contraSectMalefic) { inSect = false; sectRole = 'contra_malefic'; }
    // Mercury is mutable: diurnal if morning star, nocturnal if evening star
    else if (p === '水星') {
      var mercLon = planets['水星'].lon;
      var sunLon2 = planets['太陽'].lon;
      var mercRises = _n180(mercLon - sunLon2) > 0; // ahead of Sun = evening star
      inSect = isDaytime ? !mercRises : mercRises;
      sectRole = 'mutable';
    }

    // Sect condition scoring:
    // In sect + correct hemisphere = best (+2)
    // In sect + wrong hemisphere = moderate (+1)
    // Out of sect + correct hemisphere = moderate (-1)
    // Out of sect + wrong hemisphere = worst (-2)
    var diurnalPlanet = ['太陽','木星','土星'].includes(p);
    var correctHemisphere = isDaytime ? (diurnalPlanet ? isAboveHorizon : !isAboveHorizon) :
                                        (diurnalPlanet ? !isAboveHorizon : isAboveHorizon);
    var sectScore = 0;
    if (inSect && correctHemisphere) sectScore = 2;
    else if (inSect && !correctHemisphere) sectScore = 1;
    else if (!inSect && correctHemisphere) sectScore = -1;
    else sectScore = -2;

    // Special: a malefic in sect is tempered; out of sect is more problematic
    var isMalefic = ['火星','土星'].includes(p);
    var maleficMod = '';
    if (isMalefic) {
      if (inSect) maleficMod = '凶性受節制';
      else maleficMod = '凶性加劇';
    }

    planetSect[p] = {
      inSect: inSect,
      sectRole: sectRole,
      isAboveHorizon: isAboveHorizon,
      sectScore: sectScore,
      maleficMod: maleficMod,
      label: sectScore >= 2 ? '派系最佳' : sectScore >= 1 ? '派系尚可' : sectScore >= -1 ? '反派系' : '派系最差'
    };
  });

  return {
    isDaytime: isDaytime,
    sectLight: sectLight,
    sectBenefic: sectBenefic,
    sectMalefic: sectMalefic,
    planetSect: planetSect
  };
}


// ── 3. DISPOSITOR CHAIN（定位星鏈）──
// Every planet is "disposed of" by the ruler of the sign it's in
// The chain can form: (a) mutual receptions, (b) final dispositor, (c) closed loops

function calcDispositorChain(planets) {
  var traditionalRulers = {
    0:'火星', 1:'金星', 2:'水星', 3:'月亮', 4:'太陽', 5:'水星',
    6:'金星', 7:'火星', 8:'木星', 9:'土星', 10:'土星', 11:'木星'
  };
  var modernRulers = {
    0:'火星', 1:'金星', 2:'水星', 3:'月亮', 4:'太陽', 5:'水星',
    6:'金星', 7:'冥王', 8:'木星', 9:'土星', 10:'天王', 11:'海王'
  };

  var chain = {};       // planet → its dispositor
  var chainModern = {}; // same with modern rulers
  var classicalPlanets = ['太陽','月亮','水星','金星','火星','木星','土星'];
  var allPlanets = Object.keys(planets);

  allPlanets.forEach(function(p) {
    var pl = planets[p];
    if (!pl || pl.signIdx === undefined) return;
    chain[p] = traditionalRulers[pl.signIdx];
    chainModern[p] = modernRulers[pl.signIdx];
  });

  // Find final dispositor (a planet that disposes of itself = in own sign)
  var finalDispositor = null;
  var finalDispositorModern = null;
  classicalPlanets.forEach(function(p) {
    if (chain[p] === p) finalDispositor = p;
  });
  allPlanets.forEach(function(p) {
    if (chainModern[p] === p) finalDispositorModern = p;
  });

  // Trace chain from each planet to find loops
  var loops = [];
  var visited = {};
  classicalPlanets.forEach(function(start) {
    if (visited[start]) return;
    var path = [];
    var current = start;
    var seen = {};
    while (current && !seen[current]) {
      seen[current] = true;
      visited[current] = true;
      path.push(current);
      current = chain[current];
    }
    // If current is in path, we found a loop
    if (current && path.includes(current)) {
      var loopStart = path.indexOf(current);
      var loop = path.slice(loopStart);
      if (loop.length > 1) {
        loops.push(loop);
      }
    }
  });

  return {
    chain: chain,
    chainModern: chainModern,
    finalDispositor: finalDispositor,
    finalDispositorModern: finalDispositorModern,
    loops: loops,
    hasFinalDispositor: !!finalDispositor,
    // Interpretation hint
    meaning: finalDispositor ?
      finalDispositor + '是你星盤的最終定位星，掌控全盤能量走向' :
      '星盤無單一最終定位星，能量分散於多個循環圈'
  };
}


// ── 4. MUTUAL RECEPTION（互容）──
// Two planets each in each other's sign of rulership (by domicile or exaltation)

function calcMutualReceptions(planets) {
  var receptions = [];

  var domicileMap = {
    '太陽':[4], '月亮':[3], '水星':[2,5], '金星':[1,6],
    '火星':[0,7], '木星':[8,11], '土星':[9,10]
  };
  var exaltMap = {
    '太陽':0, '月亮':1, '水星':5, '金星':11, '火星':9, '木星':3, '土星':6
  };

  var names = ['太陽','月亮','水星','金星','火星','木星','土星'];

  for (var i = 0; i < names.length; i++) {
    for (var j = i + 1; j < names.length; j++) {
      var p1 = names[i], p2 = names[j];
      var pl1 = planets[p1], pl2 = planets[p2];
      if (!pl1 || !pl2) continue;

      // Domicile mutual reception: P1 in P2's sign AND P2 in P1's sign
      var p1InP2Domicile = (domicileMap[p2] || []).includes(pl1.signIdx);
      var p2InP1Domicile = (domicileMap[p1] || []).includes(pl2.signIdx);
      if (p1InP2Domicile && p2InP1Domicile) {
        receptions.push({
          type: 'domicile',
          zh: '入廟互容',
          planets: [p1, p2],
          strength: 'strong',
          meaning: p1 + '與' + p2 + '交換守護，彼此強化，如同雙方都是座上賓'
        });
      }

      // Exaltation mutual reception: P1 in P2's exalt sign AND P2 in P1's exalt sign
      var p1InP2Exalt = (exaltMap[p2] === pl1.signIdx);
      var p2InP1Exalt = (exaltMap[p1] === pl2.signIdx);
      if (p1InP2Exalt && p2InP1Exalt) {
        receptions.push({
          type: 'exaltation',
          zh: '旺宮互容',
          planets: [p1, p2],
          strength: 'moderate',
          meaning: p1 + '與' + p2 + '交換旺宮，互相提升能量'
        });
      }

      // Mixed: domicile-exaltation reception
      if ((p1InP2Domicile && p2InP1Exalt) || (p1InP2Exalt && p2InP1Domicile)) {
        receptions.push({
          type: 'mixed',
          zh: '混合互容',
          planets: [p1, p2],
          strength: 'mild',
          meaning: p1 + '與' + p2 + '一方入廟一方旺宮，仍有互助效果'
        });
      }
    }
  }

  return receptions;
}


// ── 5. ASPECT PATTERN DETECTION（相位圖形辨識）──
// T-Square, Grand Trine, Grand Cross, Yod, Kite, Mystic Rectangle, Stellium

function detectAspectPatterns(planets, aspects) {
  var patterns = [];
  var pKeys = Object.keys(planets);

  // Helper: check if two planets have a specific aspect type
  function hasAspect(p1, p2, typeName) {
    return aspects.some(function(a) {
      return ((a.p1 === p1 && a.p2 === p2) || (a.p1 === p2 && a.p2 === p1)) && a.type === typeName;
    });
  }

  // Helper: get aspect between two planets
  function getAspect(p1, p2) {
    return aspects.find(function(a) {
      return (a.p1 === p1 && a.p2 === p2) || (a.p1 === p2 && a.p2 === p1);
    });
  }

  // ── T-Square: 2 planets in opposition, both square a 3rd ──
  for (var i = 0; i < pKeys.length; i++) {
    for (var j = i + 1; j < pKeys.length; j++) {
      if (!hasAspect(pKeys[i], pKeys[j], '對沖')) continue;
      for (var k = 0; k < pKeys.length; k++) {
        if (k === i || k === j) continue;
        if (hasAspect(pKeys[i], pKeys[k], '刑') && hasAspect(pKeys[j], pKeys[k], '刑')) {
          var apex = pKeys[k];
          var apexSign = planets[apex] ? planets[apex].sign : '';
          patterns.push({
            name: 'T-Square',
            zh: 'T三角',
            planets: [pKeys[i], pKeys[j], apex],
            apex: apex,
            nature: 'tension',
            meaning: apex + '（' + apexSign + '）是壓力頂點，' + pKeys[i] + '與' + pKeys[j] + '的對沖能量都聚焦於此，是你最大的成長動力但也是最大的壓力源'
          });
        }
      }
    }
  }

  // ── Grand Trine: 3 planets each in trine to each other ──
  for (var i = 0; i < pKeys.length; i++) {
    for (var j = i + 1; j < pKeys.length; j++) {
      if (!hasAspect(pKeys[i], pKeys[j], '三合')) continue;
      for (var k = j + 1; k < pKeys.length; k++) {
        if (hasAspect(pKeys[i], pKeys[k], '三合') && hasAspect(pKeys[j], pKeys[k], '三合')) {
          var el = planets[pKeys[i]] ? planets[pKeys[i]].el : '';
          patterns.push({
            name: 'Grand Trine',
            zh: '大三角',
            planets: [pKeys[i], pKeys[j], pKeys[k]],
            element: el,
            nature: 'harmony',
            meaning: el + '元素大三角：' + pKeys[i] + '、' + pKeys[j] + '、' + pKeys[k] + '三方和諧流動，天賦之源但可能造成過度安逸'
          });
        }
      }
    }
  }

  // ── Grand Cross: 4 planets, 2 pairs in opposition, all in square ──
  for (var i = 0; i < pKeys.length; i++) {
    for (var j = i + 1; j < pKeys.length; j++) {
      if (!hasAspect(pKeys[i], pKeys[j], '對沖')) continue;
      for (var k = j + 1; k < pKeys.length; k++) {
        for (var l = k + 1; l < pKeys.length; l++) {
          if (!hasAspect(pKeys[k], pKeys[l], '對沖')) continue;
          if (hasAspect(pKeys[i], pKeys[k], '刑') && hasAspect(pKeys[i], pKeys[l], '刑') &&
              hasAspect(pKeys[j], pKeys[k], '刑') && hasAspect(pKeys[j], pKeys[l], '刑')) {
            patterns.push({
              name: 'Grand Cross',
              zh: '大十字',
              planets: [pKeys[i], pKeys[j], pKeys[k], pKeys[l]],
              nature: 'extreme_tension',
              meaning: '大十字是星盤中最強烈的張力結構，四顆星互相拉扯，像十字路口四個方向都在拉你，壓力極大但也代表極強的行動力'
            });
          }
        }
      }
    }
  }

  // ── Yod (Finger of God): 2 planets in sextile, both quincunx a 3rd ──
  for (var i = 0; i < pKeys.length; i++) {
    for (var j = i + 1; j < pKeys.length; j++) {
      if (!hasAspect(pKeys[i], pKeys[j], '六合')) continue;
      for (var k = 0; k < pKeys.length; k++) {
        if (k === i || k === j) continue;
        if (hasAspect(pKeys[i], pKeys[k], '梅花') && hasAspect(pKeys[j], pKeys[k], '梅花')) {
          patterns.push({
            name: 'Yod',
            zh: '上帝之指',
            planets: [pKeys[i], pKeys[j], pKeys[k]],
            apex: pKeys[k],
            nature: 'fated',
            meaning: pKeys[k] + '是命運之指的焦點：一種宿命般的召喚，要求你在這個領域做出不舒適但必要的調整'
          });
        }
      }
    }
  }

  // ── Kite: Grand Trine + one planet opposite to one corner, sextile to the other two ──
  patterns.forEach(function(pat) {
    if (pat.name !== 'Grand Trine') return;
    var gt = pat.planets;
    for (var k = 0; k < pKeys.length; k++) {
      if (gt.includes(pKeys[k])) continue;
      for (var c = 0; c < 3; c++) {
        if (hasAspect(pKeys[k], gt[c], '對沖') &&
            hasAspect(pKeys[k], gt[(c+1)%3], '六合') &&
            hasAspect(pKeys[k], gt[(c+2)%3], '六合')) {
          patterns.push({
            name: 'Kite',
            zh: '風箏',
            planets: gt.concat([pKeys[k]]),
            tail: pKeys[k],
            nature: 'focused_talent',
            meaning: '風箏圖形：大三角的天賦通過' + pKeys[k] + '獲得具體出口，把和諧能量轉化為實際成就'
          });
        }
      }
    }
  });

  // ── Stellium: 3+ planets in the same sign ──
  var signGroups = {};
  pKeys.forEach(function(p) {
    var pl = planets[p];
    if (!pl) return;
    var s = pl.signIdx;
    if (!signGroups[s]) signGroups[s] = [];
    signGroups[s].push(p);
  });
  Object.keys(signGroups).forEach(function(s) {
    if (signGroups[s].length >= 3) {
      var idx = parseInt(s);
      var signName = ['牡羊','金牛','雙子','巨蟹','獅子','處女','天秤','天蠍','射手','摩羯','水瓶','雙魚'][idx] || '';
      patterns.push({
        name: 'Stellium',
        zh: '群星聚集',
        planets: signGroups[s],
        sign: signName,
        signIdx: idx,
        nature: 'concentrated',
        meaning: signGroups[s].length + '顆星聚集在' + signName + '座：能量高度集中，這個星座的主題對你人生有壓倒性的影響'
      });
    }
  });

  // ── House Stellium: 3+ planets in the same house ──
  var houseGroups = {};
  pKeys.forEach(function(p) {
    var pl = planets[p];
    if (!pl || !pl.house) return;
    var h = pl.house;
    if (!houseGroups[h]) houseGroups[h] = [];
    houseGroups[h].push(p);
  });
  Object.keys(houseGroups).forEach(function(h) {
    if (houseGroups[h].length >= 3) {
      patterns.push({
        name: 'House Stellium',
        zh: '宮位群星',
        planets: houseGroups[h],
        house: parseInt(h),
        nature: 'concentrated',
        meaning: houseGroups[h].length + '顆星聚集在第' + h + '宮：這個生活領域是你的重心'
      });
    }
  });

  // ── Mystic Rectangle: 2 oppositions + 2 trines + 2 sextiles ──
  for (var i = 0; i < pKeys.length; i++) {
    for (var j = i + 1; j < pKeys.length; j++) {
      if (!hasAspect(pKeys[i], pKeys[j], '對沖')) continue;
      for (var k = j + 1; k < pKeys.length; k++) {
        for (var l = k + 1; l < pKeys.length; l++) {
          if (!hasAspect(pKeys[k], pKeys[l], '對沖')) continue;
          // Check if the 4 form 2 trines and 2 sextiles
          var t1 = hasAspect(pKeys[i], pKeys[k], '三合') && hasAspect(pKeys[j], pKeys[l], '三合');
          var s1 = hasAspect(pKeys[i], pKeys[l], '六合') && hasAspect(pKeys[j], pKeys[k], '六合');
          var t2 = hasAspect(pKeys[i], pKeys[l], '三合') && hasAspect(pKeys[j], pKeys[k], '三合');
          var s2 = hasAspect(pKeys[i], pKeys[k], '六合') && hasAspect(pKeys[j], pKeys[l], '六合');
          if ((t1 && s1) || (t2 && s2)) {
            patterns.push({
              name: 'Mystic Rectangle',
              zh: '神祕長方形',
              planets: [pKeys[i], pKeys[j], pKeys[k], pKeys[l]],
              nature: 'structured_harmony',
              meaning: '神祕長方形：對沖的張力被三合與六合疏導，形成穩定但有動力的結構，善於在壓力下保持平衡'
            });
          }
        }
      }
    }
  }

  // Deduplicate patterns (same planets set)
  var seen = {};
  patterns = patterns.filter(function(p) {
    var key = p.name + ':' + p.planets.slice().sort().join(',');
    if (seen[key]) return false;
    seen[key] = true;
    return true;
  });

  return patterns;
}


// ── 6. TRANSIT-TO-NATAL（行運對本命）──
// Calculate current planetary transits and their aspects to natal positions

function calcWesternTransits(natalChart) {
  if (!natalChart || !natalChart.jd) return null;

  var now = new Date();
  var utH = now.getUTCHours() + now.getUTCMinutes() / 60;
  var jdNow = _toJD(now.getUTCFullYear(), now.getUTCMonth() + 1, now.getUTCDate(), utH, 0);
  var Tnow = (jdNow - 2451545.0) / 36525;

  // Calculate current tropical positions
  var transits = {};
  transits['太陽'] = {lon: _sunLon(Tnow), sym: '☉'};
  transits['月亮'] = {lon: _moonLon(Tnow), sym: '☽'};
  [['Mercury','水星','☿'],['Venus','金星','♀'],['Mars','火星','♂'],
   ['Jupiter','木星','♃'],['Saturn','土星','♄'],['Uranus','天王','♅'],
   ['Neptune','海王','♆'],['Pluto','冥王','♇']].forEach(function(arr) {
    transits[arr[1]] = {lon: _planetGeoLon(arr[0], Tnow), sym: arr[2]};
  });
  transits['北交'] = {lon: _northNodeLon(Tnow), sym: '☊'};
  transits['凱龍'] = {lon: _chironLon(Tnow), sym: '⚷'};

  // Add sign info
  Object.keys(transits).forEach(function(p) {
    var s = _getSign(transits[p].lon);
    transits[p].sign = s.name;
    transits[p].signIdx = s.idx;
    transits[p].signDeg = s.deg;
  });

  // Calculate transit-to-natal aspects
  var transitAspects = [];
  var TRANSIT_ASPECTS = [
    {name:'合',angle:0,orb:1,sym:'☌'},
    {name:'六合',angle:60,orb:1.5,sym:'⚹'},
    {name:'刑',angle:90,orb:1.5,sym:'□'},
    {name:'三合',angle:120,orb:1.5,sym:'△'},
    {name:'對沖',angle:180,orb:1.5,sym:'☍'}
  ];

  // Wider orbs for slow planets
  var slowPlanets = ['木星','土星','天王','海王','冥王','凱龍','北交'];
  var fastPlanets = ['太陽','月亮','水星','金星','火星'];

  Object.keys(transits).forEach(function(tp) {
    var tpl = transits[tp];
    Object.keys(natalChart.planets).forEach(function(np) {
      var npl = natalChart.planets[np];
      if (!npl) return;
      var diff = Math.abs(_n180(tpl.lon - npl.lon));

      TRANSIT_ASPECTS.forEach(function(asp) {
        // Slow planets get wider orbs
        var orb = asp.orb;
        if (slowPlanets.includes(tp)) orb = asp.name === '合' ? 3 : 2.5;

        if (Math.abs(diff - asp.angle) <= orb) {
          var isHard = ['刑','對沖'].includes(asp.name);
          var isSoft = ['三合','六合'].includes(asp.name);
          transitAspects.push({
            transitPlanet: tp,
            natalPlanet: np,
            aspect: asp.name,
            sym: asp.sym,
            orb: Math.round(Math.abs(diff - asp.angle) * 100) / 100,
            nature: isHard ? 'challenging' : isSoft ? 'supportive' : 'activating',
            isSlow: slowPlanets.includes(tp),
            importance: slowPlanets.includes(tp) ? 'high' : 'medium'
          });
        }
      });
    });

    // Transit to natal angles (ASC, MC)
    [['ASC', natalChart.asc], ['MC', natalChart.mc]].forEach(function(pair) {
      var diff = Math.abs(_n180(tpl.lon - pair[1]));
      TRANSIT_ASPECTS.forEach(function(asp) {
        var orb = slowPlanets.includes(tp) ? 2 : 1.5;
        if (Math.abs(diff - asp.angle) <= orb) {
          transitAspects.push({
            transitPlanet: tp,
            natalPlanet: pair[0],
            aspect: asp.name,
            sym: asp.sym,
            orb: Math.round(Math.abs(diff - asp.angle) * 100) / 100,
            nature: ['刑','對沖'].includes(asp.name) ? 'challenging' : 'activating',
            isSlow: slowPlanets.includes(tp),
            importance: 'high' // Angles are always important
          });
        }
      });
    });
  });

  // Transit planet through natal houses
  var transitHouses = {};
  Object.keys(transits).forEach(function(tp) {
    var tpl = transits[tp];
    for (var i = 0; i < 12; i++) {
      var s = natalChart.houses[i];
      var e = natalChart.houses[(i + 1) % 12];
      var sp = _n360(e - s);
      var lp = _n360(tpl.lon - s);
      if (lp < sp) {
        transitHouses[tp] = i + 1;
        break;
      }
    }
  });

  // Sort by importance (slow planet aspects first)
  transitAspects.sort(function(a, b) {
    if (a.isSlow && !b.isSlow) return -1;
    if (!a.isSlow && b.isSlow) return 1;
    return a.orb - b.orb;
  });

  return {
    positions: transits,
    aspects: transitAspects,
    houses: transitHouses,
    date: now.toISOString().slice(0, 10)
  };
}


// ── 7. SECONDARY PROGRESSIONS（次限推運）──
// 1 day after birth = 1 year of life (day-for-a-year)

function calcSecondaryProgressions(natalChart, birthYear, birthMonth, birthDay, birthHour) {
  if (!natalChart || !natalChart.T) return null;

  var now = new Date();
  var birthDate = new Date(birthYear, birthMonth - 1, birthDay);
  var ageMs = now.getTime() - birthDate.getTime();
  var ageYears = ageMs / (365.25 * 24 * 3600000);
  var ageDays = ageYears; // 1 year of life = 1 day of ephemeris

  // Progressed T = natal T + ageDays/36525
  var Tprog = natalChart.T + ageDays / 36525;

  var progressed = {};
  progressed['太陽'] = {lon: _sunLon(Tprog)};
  progressed['月亮'] = {lon: _moonLon(Tprog)};
  [['Mercury','水星'],['Venus','金星'],['Mars','火星']].forEach(function(arr) {
    progressed[arr[1]] = {lon: _planetGeoLon(arr[0], Tprog)};
  });
  // Outer planets barely move in progressions, include for completeness
  [['Jupiter','木星'],['Saturn','土星']].forEach(function(arr) {
    progressed[arr[1]] = {lon: _planetGeoLon(arr[0], Tprog)};
  });

  // Add sign info
  Object.keys(progressed).forEach(function(p) {
    var s = _getSign(progressed[p].lon);
    progressed[p].sign = s.name;
    progressed[p].signIdx = s.idx;
    progressed[p].signDeg = s.deg;
  });

  // Progressed-to-natal aspects (focused on Sun, Moon, Mercury, Venus, ASC)
  var progAspects = [];
  var PROG_ASPECTS = [
    {name:'合',angle:0,orb:1},{name:'六合',angle:60,orb:1},
    {name:'刑',angle:90,orb:1},{name:'三合',angle:120,orb:1},{name:'對沖',angle:180,orb:1}
  ];

  Object.keys(progressed).forEach(function(pp) {
    Object.keys(natalChart.planets).forEach(function(np) {
      var npl = natalChart.planets[np];
      if (!npl) return;
      var diff = Math.abs(_n180(progressed[pp].lon - npl.lon));
      PROG_ASPECTS.forEach(function(asp) {
        if (Math.abs(diff - asp.angle) <= asp.orb) {
          progAspects.push({
            progPlanet: pp,
            natalPlanet: np,
            aspect: asp.name,
            orb: Math.round(Math.abs(diff - asp.angle) * 100) / 100
          });
        }
      });
    });

    // Prog to natal angles
    [['ASC', natalChart.asc], ['MC', natalChart.mc]].forEach(function(pair) {
      var diff = Math.abs(_n180(progressed[pp].lon - pair[1]));
      PROG_ASPECTS.forEach(function(asp) {
        if (Math.abs(diff - asp.angle) <= asp.orb) {
          progAspects.push({
            progPlanet: pp,
            natalPlanet: pair[0],
            aspect: asp.name,
            orb: Math.round(Math.abs(diff - asp.angle) * 100) / 100
          });
        }
      });
    });
  });

  // Progressed Moon sign (most important: changes sign every ~2.5 years)
  var progMoonSign = progressed['月亮'] ? progressed['月亮'].sign : '';
  var natalMoonSign = natalChart.planets['月亮'] ? natalChart.planets['月亮'].sign : '';
  var moonSignChanged = progMoonSign !== natalMoonSign;

  // Progressed Sun sign
  var progSunSign = progressed['太陽'] ? progressed['太陽'].sign : '';
  var natalSunSign = natalChart.planets['太陽'] ? natalChart.planets['太陽'].sign : '';

  return {
    positions: progressed,
    aspects: progAspects,
    ageYears: Math.round(ageYears * 10) / 10,
    progMoonSign: progMoonSign,
    progSunSign: progSunSign,
    moonSignChanged: moonSignChanged,
    summary: '推運太陽' + progSunSign + '・推運月亮' + progMoonSign
  };
}


// ── 8. SOLAR ARC DIRECTIONS（太陽弧）──
// All planets advance by the progressed Sun's arc from natal Sun

function calcSolarArc(natalChart, birthYear, birthMonth, birthDay) {
  if (!natalChart || !natalChart.T) return null;

  var now = new Date();
  var birthDate = new Date(birthYear, birthMonth - 1, birthDay);
  var ageYears = (now.getTime() - birthDate.getTime()) / (365.25 * 24 * 3600000);
  var ageDays = ageYears;

  // Solar arc = progressed Sun longitude - natal Sun longitude
  var Tprog = natalChart.T + ageDays / 36525;
  var progSunLon = _sunLon(Tprog);
  var natalSunLon = natalChart.planets['太陽'] ? natalChart.planets['太陽'].lon : 0;
  var solarArc = _n360(progSunLon - natalSunLon);

  // Apply solar arc to all natal planets and MC
  var directed = {};
  Object.keys(natalChart.planets).forEach(function(p) {
    var pl = natalChart.planets[p];
    if (!pl) return;
    var dirLon = _n360(pl.lon + solarArc);
    var s = _getSign(dirLon);
    directed[p] = {lon: dirLon, sign: s.name, signIdx: s.idx, signDeg: s.deg};
  });

  // Directed MC and ASC
  var dirMC = _n360(natalChart.mc + solarArc);
  var dirASC = _n360(natalChart.asc + solarArc);

  // Solar Arc directed-to-natal aspects
  var saAspects = [];
  var SA_ASPECTS = [{name:'合',angle:0,orb:1},{name:'刑',angle:90,orb:1},{name:'對沖',angle:180,orb:1}];

  Object.keys(directed).forEach(function(dp) {
    Object.keys(natalChart.planets).forEach(function(np) {
      if (dp === np) return;
      var npl = natalChart.planets[np];
      if (!npl) return;
      var diff = Math.abs(_n180(directed[dp].lon - npl.lon));
      SA_ASPECTS.forEach(function(asp) {
        if (Math.abs(diff - asp.angle) <= asp.orb) {
          saAspects.push({
            directedPlanet: dp,
            natalPlanet: np,
            aspect: asp.name,
            orb: Math.round(Math.abs(diff - asp.angle) * 100) / 100
          });
        }
      });
    });
    // To natal angles
    [['ASC', natalChart.asc], ['MC', natalChart.mc]].forEach(function(pair) {
      var diff = Math.abs(_n180(directed[dp].lon - pair[1]));
      SA_ASPECTS.forEach(function(asp) {
        if (Math.abs(diff - asp.angle) <= asp.orb) {
          saAspects.push({
            directedPlanet: dp,
            natalPlanet: pair[0],
            aspect: asp.name,
            orb: Math.round(Math.abs(diff - asp.angle) * 100) / 100
          });
        }
      });
    });
  });

  return {
    arc: Math.round(solarArc * 100) / 100,
    directed: directed,
    dirMC: dirMC,
    dirASC: dirASC,
    aspects: saAspects,
    ageYears: Math.round(ageYears * 10) / 10
  };
}


// ── 9. ANNUAL PROFECTIONS（年主星法）──
// Age 0 = 1st house, Age 1 = 2nd house, ..., Age 12 = 1st house again
// The profected house's ruler becomes the "Time Lord" for that year

function calcAnnualProfections(natalChart, birthYear, birthMonth, birthDay) {
  if (!natalChart) return null;

  var now = new Date();
  var birthDate = new Date(birthYear, birthMonth - 1, birthDay);
  var age = Math.floor((now.getTime() - birthDate.getTime()) / (365.25 * 24 * 3600000));

  var profectedHouse = (age % 12) + 1; // 1-indexed

  // Traditional ruler of the profected sign (from house cusp)
  var traditionalRulers = {
    0:'火星', 1:'金星', 2:'水星', 3:'月亮', 4:'太陽', 5:'水星',
    6:'金星', 7:'火星', 8:'木星', 9:'土星', 10:'土星', 11:'木星'
  };

  var profectedCusp = natalChart.houses ? natalChart.houses[profectedHouse - 1] : 0;
  var profectedSign = _getSign(profectedCusp);
  var timeLord = traditionalRulers[profectedSign.idx];

  // Where is the Time Lord in the natal chart?
  var timeLordNatal = natalChart.planets[timeLord];
  var timeLordHouse = timeLordNatal ? timeLordNatal.house : 0;
  var timeLordSign = timeLordNatal ? timeLordNatal.sign : '';

  // House themes
  var houseThemes = [
    '自我、身體、形象',           // 1
    '財務、價值觀、資源',         // 2
    '溝通、學習、手足',           // 3
    '家庭、根基、內在安全感',     // 4
    '創造、戀愛、子女、娛樂',     // 5
    '工作、健康、日常習慣',       // 6
    '伴侶關係、合作、公開互動',   // 7
    '深層轉化、共同資源、危機',   // 8
    '信仰、旅行、高等學習',       // 9
    '事業、公眾形象、成就',       // 10
    '朋友、社群、未來願景',       // 11
    '靈性、獨處、隱藏事務'        // 12
  ];

  return {
    age: age,
    profectedHouse: profectedHouse,
    profectedSign: profectedSign.name,
    timeLord: timeLord,
    timeLordHouse: timeLordHouse,
    timeLordSign: timeLordSign,
    houseTheme: houseThemes[profectedHouse - 1] || '',
    summary: age + '歲：第' + profectedHouse + '宮年（' + profectedSign.name + '），年主星 = ' + timeLord + '（本命在' + timeLordSign + timeLordHouse + '宮）',
    meaning: '今年的生命主題圍繞「' + (houseThemes[profectedHouse - 1] || '') + '」，由' + timeLord + '主導走向'
  };
}


// ── 10. SOLAR RETURN（太陽回歸盤）──
// Chart cast for the exact moment Sun returns to its natal position each year

function calcSolarReturn(natalChart, birthYear, birthMonth, birthDay, birthHour, geoLon, geoLat) {
  if (!natalChart || !natalChart.planets['太陽']) return null;

  geoLon = geoLon || 120.5;
  geoLat = geoLat || 24.0;
  var natalSunLon = natalChart.planets['太陽'].lon;

  // Find the most recent solar return (Sun at natal Sun longitude)
  var now = new Date();
  var currentYear = now.getFullYear();

  // Estimate: solar return happens around the birthday each year
  // Search near birthday for exact return
  var targetYear = currentYear;
  var birthday = new Date(targetYear, birthMonth - 1, birthDay);
  if (birthday > now) targetYear--;

  // Binary search for exact solar return time
  // Start from 2 days before birthday, end 2 days after
  var startJD = _toJD(targetYear, birthMonth, birthDay - 2, 0, 0);
  var endJD = startJD + 4; // 4-day window

  // Iterative refinement
  var jd = startJD;
  for (var iter = 0; iter < 50; iter++) {
    var midJD = (startJD + endJD) / 2;
    var Tmid = (midJD - 2451545.0) / 36525;
    var sunLon = _sunLon(Tmid);
    var diff = _n180(sunLon - natalSunLon);

    if (Math.abs(diff) < 0.001) { // ~3.6 arcseconds precision
      jd = midJD;
      break;
    }
    if (diff > 0) endJD = midJD;
    else startJD = midJD;
    jd = midJD;
  }

  // Now compute full chart for that JD
  var Tsr = (jd - 2451545.0) / 36525;
  var obl = 23.439291 - 0.013004167 * Tsr;

  var srPlanets = {};
  srPlanets['太陽'] = {lon: _sunLon(Tsr)};
  srPlanets['月亮'] = {lon: _moonLon(Tsr)};
  [['Mercury','水星'],['Venus','金星'],['Mars','火星'],['Jupiter','木星'],
   ['Saturn','土星'],['Uranus','天王'],['Neptune','海王'],['Pluto','冥王']].forEach(function(arr) {
    srPlanets[arr[1]] = {lon: _planetGeoLon(arr[0], Tsr)};
  });

  // Sign info
  Object.keys(srPlanets).forEach(function(p) {
    var s = _getSign(srPlanets[p].lon);
    Object.assign(srPlanets[p], {sign: s.name, signIdx: s.idx, signDeg: s.deg});
  });

  // SR ASC/MC
  var gmst = _n360(280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * Tsr * Tsr);
  var ramc = _n360(gmst + geoLon);
  var L = ramc * _AD, E = obl * _AD, phi = geoLat * _AD;
  var srAsc = _n360(Math.atan2(-Math.cos(L), Math.sin(L) * Math.cos(E) + Math.tan(phi) * Math.sin(E)) * _AR + 180);
  var srMc = Math.atan(Math.tan(L) / Math.cos(E)) * _AR;
  var ramcQ = Math.floor(ramc / 90);
  if (ramcQ === 1 || ramcQ === 2) srMc += 180;
  srMc = _n360(srMc);

  var srAscSign = _getSign(srAsc);
  var srMcSign = _getSign(srMc);

  // SR houses (Placidus)
  var srHouses;
  try { srHouses = _placidusHouses(srAsc, srMc, obl, geoLat); }
  catch(e) {
    srHouses = new Array(12);
    srHouses[0] = srAsc; srHouses[3] = _n360(srMc + 180); srHouses[6] = _n360(srAsc + 180); srHouses[9] = srMc;
    for (var q = 0; q < 4; q++) {
      var s = srHouses[q * 3], ee = srHouses[((q + 1) * 3) % 12];
      var span = _n360(ee - s);
      srHouses[q * 3 + 1] = _n360(s + span / 3);
      srHouses[q * 3 + 2] = _n360(s + 2 * span / 3);
    }
  }

  // SR planet in natal houses
  var srPlanetsInNatalHouses = {};
  Object.keys(srPlanets).forEach(function(p) {
    var pl = srPlanets[p];
    for (var i = 0; i < 12; i++) {
      var s = natalChart.houses[i];
      var e = natalChart.houses[(i + 1) % 12];
      var sp = _n360(e - s);
      var lp = _n360(pl.lon - s);
      if (lp < sp) {
        srPlanetsInNatalHouses[p] = i + 1;
        break;
      }
    }
  });

  // Convert JD to date
  var z = Math.floor(jd + 0.5);
  var f = jd + 0.5 - z;
  var a2 = z;
  if (z >= 2299161) { var alpha = Math.floor((z - 1867216.25) / 36524.25); a2 = z + 1 + alpha - Math.floor(alpha / 4); }
  var b = a2 + 1524;
  var c = Math.floor((b - 122.1) / 365.25);
  var dd = Math.floor(365.25 * c);
  var ee = Math.floor((b - dd) / 30.6001);
  var dayOfMonth = b - dd - Math.floor(30.6001 * ee);
  var monthNum = ee < 14 ? ee - 1 : ee - 13;
  var yearNum = monthNum > 2 ? c - 4716 : c - 4715;
  var hourFrac = f * 24 + 8; // convert to UTC+8
  if (hourFrac >= 24) { hourFrac -= 24; dayOfMonth++; }
  var srDate = yearNum + '-' + (monthNum < 10 ? '0' : '') + monthNum + '-' + (dayOfMonth < 10 ? '0' : '') + dayOfMonth;
  var srTime = Math.floor(hourFrac) + ':' + (Math.floor((hourFrac % 1) * 60) < 10 ? '0' : '') + Math.floor((hourFrac % 1) * 60);

  return {
    year: targetYear,
    jd: jd,
    date: srDate,
    time: srTime,
    planets: srPlanets,
    asc: srAsc,
    ascSign: srAscSign,
    mc: srMc,
    mcSign: srMcSign,
    houses: srHouses,
    planetsInNatalHouses: srPlanetsInNatalHouses,
    summary: '太陽回歸盤（' + srDate + '）：上升' + srAscSign.name + '・MC ' + srMcSign.name
  };
}


// ── 11. COMPREHENSIVE PLANET STRENGTH（綜合行星力量）──
// Combines: essential dignity, sect, accidental dignity, aspects received, speed

function calcComprehensivePlanetStrength(natal, essentialDignities, sectData, mutualReceptions) {
  if (!natal || !natal.planets) return {};

  var result = {};
  var classicalPlanets = ['太陽','月亮','水星','金星','火星','木星','土星'];

  classicalPlanets.forEach(function(p) {
    var pl = natal.planets[p];
    if (!pl) return;

    var score = 0;
    var factors = [];

    // 1. Essential dignity (weighted heavily)
    var ed = essentialDignities ? essentialDignities[p] : null;
    var edScore = ed ? ed.score * 3 : 0; // weight ×3
    score += edScore;
    if (ed) factors.push({type:'essential_dignity', score:edScore, label:'本質尊貴(' + (ed.dignities.map(function(d){return d.zh;}).join('+') || (ed.debilities.map(function(d){return d.zh;}).join('+')) || '無') + ')'});

    // 2. Sect condition
    var sect = sectData && sectData.planetSect ? sectData.planetSect[p] : null;
    var sectScore = sect ? sect.sectScore * 3 : 0;
    score += sectScore;
    if (sect) factors.push({type:'sect', score:sectScore, label:'派系(' + sect.label + ')'});

    // 3. Accidental dignity: house placement
    var house = pl.house;
    var houseDignity = 0;
    if ([1, 10].includes(house)) houseDignity = 5;       // Angular (strongest)
    else if ([4, 7].includes(house)) houseDignity = 4;   // Angular
    else if ([2, 5, 8, 11].includes(house)) houseDignity = 2; // Succedent
    else houseDignity = 0;                                 // Cadent (weakest)
    // 12th and 6th house penalty
    if ([6, 12].includes(house)) houseDignity = -2;
    // 8th house minor penalty
    if (house === 8) houseDignity = -1;
    score += houseDignity;
    factors.push({type:'house', score:houseDignity, label:house + '宮'});

    // 4. Retrograde
    if (pl.retrograde) {
      score -= 3;
      factors.push({type:'retrograde', score:-3, label:'逆行'});
    }

    // 5. Combustion (within 8° of Sun, except for Sun itself)
    if (p !== '太陽' && natal.planets['太陽']) {
      var sunDist = Math.abs(_n180(pl.lon - natal.planets['太陽'].lon));
      if (sunDist < 0.3) { // Cazimi: within 17' — extremely powerful
        score += 5;
        factors.push({type:'cazimi', score:5, label:'入心（與太陽合度0.3°內）'});
      } else if (sunDist < 8) {
        var combScore = sunDist < 3 ? -5 : -3;
        score += combScore;
        factors.push({type:'combust', score:combScore, label:'焦傷（距太陽' + Math.round(sunDist) + '°）'});
      }
    }

    // 6. Aspects received
    var aspScore = 0;
    if (natal.aspects) {
      natal.aspects.forEach(function(a) {
        if (a.p1 !== p && a.p2 !== p) return;
        var other = a.p1 === p ? a.p2 : a.p1;
        var isBenefic = ['金星', '木星'].includes(other);
        var isMalefic = ['火星', '土星'].includes(other);
        if (a.type === '三合' || a.type === '六合') {
          aspScore += isBenefic ? 3 : isMalefic ? 0 : 1;
        } else if (a.type === '刑') {
          aspScore += isMalefic ? -3 : isBenefic ? -1 : -2;
        } else if (a.type === '對沖') {
          aspScore += isMalefic ? -4 : isBenefic ? -1 : -2;
        } else if (a.type === '合') {
          aspScore += isBenefic ? 4 : isMalefic ? -2 : 1;
        }
      });
    }
    score += aspScore;
    if (aspScore !== 0) factors.push({type:'aspects', score:aspScore, label:'相位影響'});

    // 7. Mutual reception bonus
    if (mutualReceptions) {
      mutualReceptions.forEach(function(mr) {
        if (mr.planets.includes(p)) {
          var mrScore = mr.strength === 'strong' ? 4 : mr.strength === 'moderate' ? 2 : 1;
          score += mrScore;
          factors.push({type:'mutual_reception', score:mrScore, label:'互容(' + mr.zh + ')'});
        }
      });
    }

    // Normalize to 0-100
    var normalized = Math.max(0, Math.min(100, 50 + score * 2.5));

    result[p] = {
      rawScore: score,
      normalized: Math.round(normalized),
      factors: factors,
      label: normalized >= 80 ? '極強' : normalized >= 65 ? '偏強' : normalized >= 45 ? '中等' :
             normalized >= 30 ? '偏弱' : '虛弱'
    };
  });

  // Also compute for outer planets (simplified)
  ['天王','海王','冥王','凱龍','北交'].forEach(function(p) {
    var pl = natal.planets[p];
    if (!pl) return;
    var score = 50;
    if (pl.retrograde) score -= 5;
    if ([1,4,7,10].includes(pl.house)) score += 10;
    if ([6,8,12].includes(pl.house)) score -= 5;
    result[p] = {
      rawScore: 0,
      normalized: Math.round(score),
      factors: [{type:'house', score:0, label:pl.house + '宮'}],
      label: score >= 60 ? '活躍' : score >= 40 ? '中等' : '低調'
    };
  });

  return result;
}


// ── 12. HOUSE LORD PLACEMENT（宮主飛星）──
// Where each house's ruler is placed — fundamental for prediction

function calcHouseLordPlacement(natal) {
  if (!natal || !natal.houses || !natal.planets) return [];

  var traditionalRulers = {
    0:'火星', 1:'金星', 2:'水星', 3:'月亮', 4:'太陽', 5:'水星',
    6:'金星', 7:'火星', 8:'木星', 9:'土星', 10:'土星', 11:'木星'
  };

  var placements = [];
  for (var h = 0; h < 12; h++) {
    var cuspLon = natal.houses[h];
    var cuspSign = _getSign(cuspLon);
    var ruler = traditionalRulers[cuspSign.idx];
    var rulerPlanet = natal.planets[ruler];

    var rulerHouse = rulerPlanet ? rulerPlanet.house : 0;
    var rulerSign = rulerPlanet ? rulerPlanet.sign : '';

    placements.push({
      house: h + 1,
      cuspSign: cuspSign.name,
      ruler: ruler,
      rulerHouse: rulerHouse,
      rulerSign: rulerSign,
      rulerRetrograde: rulerPlanet ? !!rulerPlanet.retrograde : false,
      // Connection meaning
      connection: (h + 1) + '宮主' + ruler + '飛入' + rulerHouse + '宮'
    });
  }

  return placements;
}


// ══════════════════════════════════════════════════════════════════════
// INTEGRATION: Enhance computeNatalChart return value
// Call this AFTER computeNatalChart to add all new data
// ══════════════════════════════════════════════════════════════════════

// ── Part of Fortune (Lot of Fortune) ──
// Day chart: Asc + Moon - Sun; Night chart: Asc + Sun - Moon
function calcPartOfFortune(natal) {
  if (!natal || !natal.planets || !natal.asc) return null;
  var sun = natal.planets['太陽'], moon = natal.planets['月亮'];
  if (!sun || !moon) return null;
  var ascLon = natal.ascDeg || 0;
  var isDaytime = natal.sect ? natal.sect.isDaytime : (sun.lon > 180 ? false : true);
  var fortLon;
  if (isDaytime) { fortLon = ascLon + moon.lon - sun.lon; }
  else { fortLon = ascLon + sun.lon - moon.lon; }
  fortLon = ((fortLon % 360) + 360) % 360;
  var SIGNS = ['牡羊','金牛','雙子','巨蟹','獅子','處女','天秤','天蠍','射手','摩羯','水瓶','雙魚'];
  var signIdx = Math.floor(fortLon / 30);
  var deg = Math.floor(fortLon % 30);
  var houseIdx = natal.houses ? natal.houses.findIndex(function(h, i) {
    var next = natal.houses[(i + 1) % 12];
    var hStart = h, hEnd = next;
    if (hEnd < hStart) return fortLon >= hStart || fortLon < hEnd;
    return fortLon >= hStart && fortLon < hEnd;
  }) : -1;
  return { lon: fortLon, sign: SIGNS[signIdx], deg: deg, signIdx: signIdx, house: houseIdx >= 0 ? houseIdx + 1 : null, meaning: 'Part of Fortune 在' + SIGNS[signIdx] + deg + '°' + (houseIdx >= 0 ? '（第' + (houseIdx+1) + '宮）' : '') + '——代表此生最自然的富足與幸福來源' };
}

// ── Major Fixed Stars (5 brightest, check conjunction to natal planets within 1°) ──
function calcFixedStarConjunctions(natal) {
  if (!natal || !natal.planets) return [];
  // J2000 positions (precession-corrected to ~2025 approx)
  var FIXED_STARS = [
    { name: 'Regulus（軒轅十四）', lon: 150.0, meaning: '王者之星，主名望、權力、成功——但驕傲會帶來墜落' },
    { name: 'Algol（大陵五）', lon: 56.2, meaning: '魔星，主危機與轉化——遇到它的行星會經歷「死而復生」' },
    { name: 'Spica（角宿一）', lon: 203.8, meaning: '豐收之星，主才華、幸運、被保護——自帶吉祥光環' },
    { name: 'Aldebaran（畢宿五）', lon: 69.9, meaning: '東方守護者，主正直、誠信、領導——但要避免執念' },
    { name: 'Antares（心宿二）', lon: 249.8, meaning: '火星之心，主強烈的慾望與對抗——成功需要紀律' },
    { name: 'Sirius（天狼星）', lon: 104.1, meaning: '最亮之星，主野心、名聲、燃燒——高處不勝寒' },
    { name: 'Fomalhaut（北落師門）', lon: 334.0, meaning: '南方守護者，主理想主義——美好但容易幻滅' },
    { name: 'Vega（織女星）', lon: 285.5, meaning: '天琴之星，主魅力、藝術天分——但感情上容易犧牲' }
  ];
  var ORB = 1.5; // 1.5° orb
  var conjunctions = [];
  Object.keys(natal.planets).forEach(function(pName) {
    var pl = natal.planets[pName];
    if (!pl || !pl.lon) return;
    FIXED_STARS.forEach(function(star) {
      var diff = Math.abs(pl.lon - star.lon);
      if (diff > 180) diff = 360 - diff;
      if (diff <= ORB) {
        conjunctions.push({ planet: pName, star: star.name, orb: Math.round(diff * 10) / 10, meaning: pName + '合' + star.name + '——' + star.meaning });
      }
    });
  });
  return conjunctions;
}

function enhanceNatalChart(natal, birthYear, birthMonth, birthDay, birthHour, geoLon, geoLat) {
  if (!natal) return natal;

  var sect = calcSect(natal.planets, natal.asc, natal.houses);
  var isDaytime = sect.isDaytime;

  var essentialDignities = {};
  Object.keys(natal.planets).forEach(function(p) {
    var pl = natal.planets[p];
    if (!pl) return;
    essentialDignities[p] = calcEssentialDignity(p, pl.signIdx, pl.signDeg, isDaytime);
  });

  natal.sect = sect;
  natal.essentialDignity = essentialDignities;
  natal.dispositorChain = calcDispositorChain(natal.planets);
  natal.mutualReceptions = calcMutualReceptions(natal.planets);
  natal.aspectPatterns = detectAspectPatterns(natal.planets, natal.aspects);
  natal.houseLords = calcHouseLordPlacement(natal);
  natal.planetStrengthV2 = calcComprehensivePlanetStrength(natal, essentialDignities, sect, natal.mutualReceptions);
  try { natal.transits = calcWesternTransits(natal); } catch(e) { natal.transits = null; }
  try { natal.progressions = calcSecondaryProgressions(natal, birthYear, birthMonth, birthDay, birthHour); } catch(e) { natal.progressions = null; }
  try { natal.solarArc = calcSolarArc(natal, birthYear, birthMonth, birthDay); } catch(e) { natal.solarArc = null; }
  try { natal.profections = calcAnnualProfections(natal, birthYear, birthMonth, birthDay); } catch(e) { natal.profections = null; }
  try { natal.solarReturn = calcSolarReturn(natal, birthYear, birthMonth, birthDay, birthHour, geoLon, geoLat); } catch(e) { natal.solarReturn = null; }

  // 14. Part of Fortune
  try { natal.partOfFortune = calcPartOfFortune(natal); } catch(e) { natal.partOfFortune = null; }

  // 15. Fixed Star Conjunctions
  try { natal.fixedStars = calcFixedStarConjunctions(natal); } catch(e) { natal.fixedStars = []; }

  return natal;
}
