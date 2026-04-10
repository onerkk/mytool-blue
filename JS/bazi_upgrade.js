// ══════════════════════════════════════════════════════════════════════
// 🏯 八字 TOP-TIER UPGRADE
// 正格十格判定 · 暗合/拱合/暗沖 · 流月推算 · 格局深化
// 歲運並臨 · 十神格局完整 · 神煞擴充 · 桃花驛馬
// ══════════════════════════════════════════════════════════════════════
// 載入順序：bazi.js 之後
// enhanceBazi(S.bazi) 在 computeBazi 之後呼叫

var TG10 = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
var DZ12 = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
var WX_MAP = {甲:'木',乙:'木',丙:'火',丁:'火',戊:'土',己:'土',庚:'金',辛:'金',壬:'水',癸:'水',
  子:'水',丑:'土',寅:'木',卯:'木',辰:'土',巳:'火',午:'火',未:'土',申:'金',酉:'金',戌:'土',亥:'水'};

// pillars 結構：{year:{gan,zhi}, month:{gan,zhi}, day:{gan,zhi}, hour:{gan,zhi}}
var _PK = ['year','month','day','hour'];
function _pGan(bazi, idx) { var k=_PK[idx]; return bazi.pillars[k] ? bazi.pillars[k].gan : ''; }
function _pZhi(bazi, idx) { var k=_PK[idx]; return bazi.pillars[k] ? bazi.pillars[k].zhi : ''; }


// ── 1. 正格十格判定 ──
// 取月令藏干透出者為格，無透出則取月令本氣
function baziDetectZhengGe(bazi) {
  if (!bazi || !bazi.pillars || bazi.specialStructure) return null;

  var dm = bazi.dm; // 日干
  var monthZhi = _pZhi(bazi, 1); // 月支
  var monthGan = _pGan(bazi, 1); // 月干

  // 月令藏干
  var CG = {子:['癸'],丑:['己','癸','辛'],寅:['甲','丙','戊'],卯:['乙'],辰:['戊','乙','癸'],
    巳:['丙','庚','戊'],午:['丁','己'],未:['己','丁','乙'],申:['庚','壬','戊'],酉:['辛'],
    戌:['戊','辛','丁'],亥:['壬','甲']};

  var monthCangGan = CG[monthZhi] || [];

  // 十神計算
  function tenGod(dm, other) {
    var dmIdx = TG10.indexOf(dm);
    var otIdx = TG10.indexOf(other);
    if (dmIdx < 0 || otIdx < 0) return '';
    var dmEl = WX_MAP[dm], otEl = WX_MAP[other];
    var dmYin = dmIdx % 2, otYin = otIdx % 2;
    var same = (dmYin === otYin);
    if (dmEl === otEl) return same ? '比肩' : '劫財';
    // 生剋關係
    var sheng = {木:'火',火:'土',土:'金',金:'水',水:'木'};
    var ke = {木:'土',火:'金',土:'水',金:'木',水:'火'};
    if (sheng[dmEl] === otEl) return same ? '食神' : '傷官';
    if (ke[dmEl] === otEl) return same ? '偏財' : '正財';
    if (sheng[otEl] === dmEl) return same ? '偏印' : '正印';
    if (ke[otEl] === dmEl) return same ? '七殺' : '正官';
    return '';
  }

  // 找月令透出的十神 → 定格局
  // 先看月干是否透出月令藏干
  var yearGan = _pGan(bazi, 0);
  var hourGan = _pGan(bazi, 3);
  var allGan = [yearGan, monthGan, hourGan]; // 不含日干

  // 月令本氣的十神
  var benQi = monthCangGan[0] || '';
  var benQiGod = benQi ? tenGod(dm, benQi) : '';

  // 檢查月令藏干是否有透出天干
  var touChu = null;
  var touChuGod = '';
  for (var i = 0; i < monthCangGan.length; i++) {
    var cg = monthCangGan[i];
    // 透出 = 天干中有同五行同陰陽的干
    for (var j = 0; j < allGan.length; j++) {
      if (allGan[j] === cg) {
        touChu = cg;
        touChuGod = tenGod(dm, cg);
        break;
      }
    }
    if (touChu) break;
  }

  // 定格局：透出者為格，無透出用本氣
  var geGod = touChuGod || benQiGod;
  var geGan = touChu || benQi;

  // 特殊：建祿格（月支為日干之祿）
  var luMap = {甲:'寅',乙:'卯',丙:'巳',丁:'午',戊:'巳',己:'午',庚:'申',辛:'酉',壬:'亥',癸:'子'};
  if (luMap[dm] === monthZhi) {
    return {
      geName: '建祿格',
      geGod: '比肩/劫財',
      geGan: dm,
      zh: '建祿格：月令為日主之祿，根基穩固，自力更生型命格。不喜再見比劫，宜食傷生財或官殺顯貴。',
      isSpecial: true
    };
  }

  // 特殊：月刃格（又稱陽刃格，月支為日干之刃）
  var renMap = {甲:'卯',丙:'午',戊:'午',庚:'酉',壬:'子'};
  if (renMap[dm] === monthZhi) {
    return {
      geName: '月刃格',
      geGod: '劫財',
      geGan: dm,
      zh: '月刃格：月令為日主之刃，性格剛強果斷，必須見官殺制刃方能成格。無官殺則剛愎自用。',
      isSpecial: true
    };
  }

  // 正格命名
  var geNames = {
    '正官': '正官格', '七殺': '七殺格', '正印': '正印格', '偏印': '偏印格',
    '食神': '食神格', '傷官': '傷官格', '正財': '正財格', '偏財': '偏財格'
  };

  var geName = geNames[geGod] || (geGod + '格');
  if (!geGod || geGod === '比肩' || geGod === '劫財') {
    geName = '建祿格（月令無用神透出）';
  }

  // 成格/破格條件
  var geDesc = '';
  if (geGod === '正官') geDesc = '正官格：月令正官透出，喜印來護官，忌傷官破格。最忌七殺混雜。';
  else if (geGod === '七殺') geDesc = '七殺格：月令七殺透出，必須食神制殺或印綬化殺方能成格。無制則凶。';
  else if (geGod === '正印') geDesc = '正印格：月令正印透出，喜官來生印，忌財壞印。學業智慧型命格。';
  else if (geGod === '偏印') geDesc = '偏印格：月令偏印透出，又稱梟神奪食。忌食神被奪，喜偏財制梟。';
  else if (geGod === '食神') geDesc = '食神格：月令食神透出，喜財來洩秀，忌偏印奪食。溫和有福之格。';
  else if (geGod === '傷官') geDesc = '傷官格：月令傷官透出，喜傷官配印或傷官生財。忌見官（傷官見官為禍百端）。';
  else if (geGod === '正財') geDesc = '正財格：月令正財透出，喜官來護財，忌比劫奪財。穩定守成型命格。';
  else if (geGod === '偏財') geDesc = '偏財格：月令偏財透出，喜食傷生財，忌比劫分奪。善於投資理財。';

  return {
    geName: geName,
    geGod: geGod,
    geGan: geGan,
    touChu: touChu,
    benQiGod: benQiGod,
    zh: geDesc,
    isSpecial: false
  };
}


// ── 2. 暗合 · 拱合 · 暗沖 ──

function baziHiddenInteractions(bazi) {
  if (!bazi || !bazi.pillars) return [];

  var interactions = [];
  var allZhi = [_pZhi(bazi,0), _pZhi(bazi,1), _pZhi(bazi,2), _pZhi(bazi,3)];
  var zhiLabels = ['年支', '月支', '日支', '時支'];
  var zhiIdx = allZhi.map(function(z) { return DZ12.indexOf(z); });

  // 暗合：地支藏干之間的天干五合
  // 天干五合：甲己, 乙庚, 丙辛, 丁壬, 戊癸
  var heGan = [['甲','己'],['乙','庚'],['丙','辛'],['丁','壬'],['戊','癸']];
  var CG = {子:['癸'],丑:['己','癸','辛'],寅:['甲','丙','戊'],卯:['乙'],辰:['戊','乙','癸'],
    巳:['丙','庚','戊'],午:['丁','己'],未:['己','丁','乙'],申:['庚','壬','戊'],酉:['辛'],
    戌:['戊','辛','丁'],亥:['壬','甲']};

  for (var i = 0; i < 4; i++) {
    for (var j = i + 1; j < 4; j++) {
      var cg1 = CG[allZhi[i]] || [];
      var cg2 = CG[allZhi[j]] || [];
      // 檢查藏干之間是否有五合
      for (var a = 0; a < cg1.length; a++) {
        for (var b = 0; b < cg2.length; b++) {
          for (var h = 0; h < heGan.length; h++) {
            if ((cg1[a] === heGan[h][0] && cg2[b] === heGan[h][1]) ||
                (cg1[a] === heGan[h][1] && cg2[b] === heGan[h][0])) {
              interactions.push({
                type: '暗合',
                from: zhiLabels[i] + allZhi[i],
                to: zhiLabels[j] + allZhi[j],
                detail: cg1[a] + '合' + cg2[b],
                zh: zhiLabels[i] + allZhi[i] + '藏' + cg1[a] + ' 暗合 ' + zhiLabels[j] + allZhi[j] + '藏' + cg2[b] + '：暗中有情，隱性的聯繫或吸引力'
              });
            }
          }
        }
      }
    }
  }

  // 拱合（半三合的一種）：兩支夾一空支形成三合之象
  // 三合局：申子辰(水), 寅午戌(火), 巳酉丑(金), 亥卯未(木)
  var sanHe = [[8,0,4,'水'],[2,6,10,'火'],[5,9,1,'金'],[11,3,7,'木']];
  for (var i = 0; i < 4; i++) {
    for (var j = i + 1; j < 4; j++) {
      for (var s = 0; s < sanHe.length; s++) {
        var sh = sanHe[s];
        // 拱合 = 有首尾兩支但缺中間那支
        if (zhiIdx[i] === sh[0] && zhiIdx[j] === sh[2] && !zhiIdx.includes(sh[1])) {
          interactions.push({
            type: '拱合',
            from: zhiLabels[i] + allZhi[i],
            to: zhiLabels[j] + allZhi[j],
            detail: '拱' + DZ12[sh[1]] + '（' + sh[3] + '局）',
            zh: zhiLabels[i] + allZhi[i] + ' 與 ' + zhiLabels[j] + allZhi[j] + ' 拱合' + DZ12[sh[1]] + '（' + sh[3] + '局），虛拱之合，有' + sh[3] + '行之象但力量不實'
          });
        }
        if (zhiIdx[i] === sh[0] && zhiIdx[j] === sh[1] && !zhiIdx.includes(sh[2])) {
          // 半三合（帝旺方）
        }
        if (zhiIdx[i] === sh[1] && zhiIdx[j] === sh[2] && !zhiIdx.includes(sh[0])) {
          // 半三合（墓庫方）
        }
      }
    }
  }

  // 暗沖：地支藏干之間的天干相剋
  // 簡化：兩支不在六沖表中但藏干本氣互剋
  var liuChong = [[0,6],[1,7],[2,8],[3,9],[4,10],[5,11]];
  for (var i = 0; i < 4; i++) {
    for (var j = i + 1; j < 4; j++) {
      // 跳過正沖（已在 branchInteractions 裡）
      var isZhengChong = liuChong.some(function(lc) {
        return (zhiIdx[i] === lc[0] && zhiIdx[j] === lc[1]) || (zhiIdx[i] === lc[1] && zhiIdx[j] === lc[0]);
      });
      if (isZhengChong) continue;

      var cg1 = CG[allZhi[i]] || [];
      var cg2 = CG[allZhi[j]] || [];
      if (cg1.length > 0 && cg2.length > 0) {
        var el1 = WX_MAP[cg1[0]], el2 = WX_MAP[cg2[0]];
        var keMap = {木:'土',火:'金',土:'水',金:'木',水:'火'};
        if (keMap[el1] === el2 || keMap[el2] === el1) {
          interactions.push({
            type: '暗沖',
            from: zhiLabels[i] + allZhi[i],
            to: zhiLabels[j] + allZhi[j],
            detail: cg1[0] + '(' + el1 + ')剋' + cg2[0] + '(' + el2 + ')',
            zh: zhiLabels[i] + allZhi[i] + ' 暗沖 ' + zhiLabels[j] + allZhi[j] + '：藏干本氣互剋，表面無事但暗中有衝突'
          });
        }
      }
    }
  }

  return interactions;
}


// ── 3. 流月推算 ──
// 以流年干支為基礎，推算12個月的天干地支及吉凶

function baziCalcLiuYue(bazi, liuNianGan, liuNianZhi) {
  if (!bazi || !liuNianGan) return [];

  // 五虎遁：年干定月干
  // 甲己年→丙寅月起, 乙庚→戊寅, 丙辛→庚寅, 丁壬→壬寅, 戊癸→甲寅
  var wuHuDun = {甲:2, 己:2, 乙:4, 庚:4, 丙:6, 辛:6, 丁:8, 壬:8, 戊:0, 癸:0};
  var startGanIdx = wuHuDun[liuNianGan];
  if (startGanIdx === undefined) startGanIdx = 0;

  var dm = bazi.dm;
  var fav = bazi.fav || [];
  var unfav = bazi.unfav || [];

  var months = [];
  // 正月（寅月）到十二月（丑月）
  var monthZhi = ['寅','卯','辰','巳','午','未','申','酉','戌','亥','子','丑'];

  for (var i = 0; i < 12; i++) {
    var mGanIdx = (startGanIdx + i) % 10;
    var mGan = TG10[mGanIdx];
    var mZhi = monthZhi[i];
    var mEl = WX_MAP[mGan];
    var mZhiEl = WX_MAP[mZhi];

    // 簡易吉凶判定
    var score = 0;
    if (fav.includes(mEl)) score += 2;
    if (fav.includes(mZhiEl)) score += 1;
    if (unfav.includes(mEl)) score -= 2;
    if (unfav.includes(mZhiEl)) score -= 1;

    // 沖合檢查（流月支與日支）
    var dayZhi = _pZhi(bazi, 2);
    var dayZhiIdx = DZ12.indexOf(dayZhi);
    var mZhiIdx = DZ12.indexOf(mZhi);
    var isChong = Math.abs(dayZhiIdx - mZhiIdx) === 6;
    var isHe = false;
    var liuHe = [[0,1],[2,11],[3,10],[4,9],[5,8],[6,7]];
    liuHe.forEach(function(lh) {
      if ((dayZhiIdx === lh[0] && mZhiIdx === lh[1]) || (dayZhiIdx === lh[1] && mZhiIdx === lh[0])) isHe = true;
    });

    if (isChong) score -= 2;
    if (isHe) score += 1;

    var label = score >= 3 ? '大吉' : score >= 1 ? '吉' : score >= 0 ? '平' : score >= -2 ? '凶' : '大凶';
    var monthNum = i + 1;
    // 農曆月名
    var monthNames = ['正月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月'];

    months.push({
      month: monthNum,
      monthName: monthNames[i],
      gan: mGan,
      zhi: mZhi,
      gz: mGan + mZhi,
      ganEl: mEl,
      zhiEl: mZhiEl,
      score: score,
      label: label,
      isChong: isChong,
      isHe: isHe,
      zh: monthNames[i] + '（' + mGan + mZhi + '）：' + label + (isChong ? '⚡沖日支' : '') + (isHe ? '💛合日支' : '')
    });
  }

  return months;
}


// ── 4. 歲運並臨 ──
// 流年干支與大運干支完全相同，吉凶加倍

function baziCheckSuiYunBingLin(bazi) {
  if (!bazi || !bazi.dayun) return null;

  var now = new Date();
  var currentYear = now.getFullYear();

  // 找當前大運
  var curDayun = bazi.dayun.find(function(d) { return d.isCurrent; });
  if (!curDayun) return null;

  // 當前流年干支
  var yearOffset = (currentYear - 4) % 60;
  var lnGanIdx = yearOffset % 10;
  var lnZhiIdx = yearOffset % 12;
  var lnGan = TG10[lnGanIdx];
  var lnZhi = DZ12[lnZhiIdx];

  var dyGan = curDayun.gan || '';
  var dyZhi = curDayun.zhi || '';

  if (lnGan === dyGan && lnZhi === dyZhi) {
    return {
      active: true,
      year: currentYear,
      gz: lnGan + lnZhi,
      zh: '⚡ 歲運並臨：' + currentYear + '年流年' + lnGan + lnZhi + '與大運完全相同，吉則大吉、凶則大凶，是人生重大轉折點',
      severity: 'extreme'
    };
  }

  // 天剋地沖（歲運天剋地沖）
  var keMap = {木:'土',火:'金',土:'水',金:'木',水:'火'};
  var lnGanEl = WX_MAP[lnGan], dyGanEl = WX_MAP[dyGan];
  var isGanKe = keMap[lnGanEl] === dyGanEl || keMap[dyGanEl] === lnGanEl;
  var lnZhiIdx2 = DZ12.indexOf(lnZhi), dyZhiIdx = DZ12.indexOf(dyZhi);
  var isZhiChong = Math.abs(lnZhiIdx2 - dyZhiIdx) === 6;

  if (isGanKe && isZhiChong) {
    return {
      active: true,
      year: currentYear,
      type: '天剋地沖',
      gz: lnGan + lnZhi + ' vs ' + dyGan + dyZhi,
      zh: '⚠ 歲運天剋地沖：流年' + lnGan + lnZhi + '與大運' + dyGan + dyZhi + '天干相剋地支相沖，本年變動劇烈',
      severity: 'high'
    };
  }

  return {active: false};
}


// ── 5. 桃花 · 驛馬 · 華蓋 完整表 ──

function baziExtraShenSha(bazi) {
  if (!bazi || !bazi.pillars) return [];

  var results = [];
  var dayZhi = _pZhi(bazi, 2);
  var yearZhi = _pZhi(bazi, 0);
  var allZhi = [_pZhi(bazi,0), _pZhi(bazi,1), _pZhi(bazi,2), _pZhi(bazi,3)];

  // 桃花（咸池）：以年支或日支查
  var taoHua = {寅:'卯',午:'卯',戌:'卯', 申:'酉',子:'酉',辰:'酉', 巳:'午',酉:'午',丑:'午', 亥:'子',卯:'子',未:'子'};
  var thTarget = taoHua[dayZhi] || taoHua[yearZhi];
  if (thTarget && allZhi.includes(thTarget)) {
    var thPillar = ['年','月','日','時'][allZhi.indexOf(thTarget)];
    results.push({
      name: '桃花',
      pillar: thPillar,
      zh: thPillar + '柱帶桃花（' + thTarget + '）：異性緣佳，魅力出眾' +
          (thPillar === '時' ? '，晚年桃花旺' : thPillar === '月' ? '，工作中容易遇到桃花' : '')
    });
  }

  // 驛馬：以年支或日支查
  var yiMa = {寅:'申',午:'申',戌:'申', 申:'寅',子:'寅',辰:'寅', 巳:'亥',酉:'亥',丑:'亥', 亥:'巳',卯:'巳',未:'巳'};
  var ymTarget = yiMa[dayZhi] || yiMa[yearZhi];
  if (ymTarget && allZhi.includes(ymTarget)) {
    var ymPillar = ['年','月','日','時'][allZhi.indexOf(ymTarget)];
    results.push({
      name: '驛馬',
      pillar: ymPillar,
      zh: ymPillar + '柱帶驛馬（' + ymTarget + '）：一生多動，適合需要移動/出差/外派的工作'
    });
  }

  // 華蓋：以年支或日支查
  var huaGai = {寅:'辰',午:'辰',戌:'辰', 申:'戌',子:'戌',辰:'戌', 巳:'丑',酉:'丑',丑:'丑', 亥:'未',卯:'未',未:'未'};
  var hgTarget = huaGai[dayZhi] || huaGai[yearZhi];
  if (hgTarget && allZhi.includes(hgTarget)) {
    var hgPillar = ['年','月','日','時'][allZhi.indexOf(hgTarget)];
    results.push({
      name: '華蓋',
      pillar: hgPillar,
      zh: hgPillar + '柱帶華蓋（' + hgTarget + '）：聰明孤高，藝術/宗教/哲學天賦，內心世界豐富'
    });
  }

  // 將星
  var jiangXing = {寅:'午',午:'午',戌:'午', 申:'子',子:'子',辰:'子', 巳:'酉',酉:'酉',丑:'酉', 亥:'卯',卯:'卯',未:'卯'};
  var jxTarget = jiangXing[yearZhi];
  if (jxTarget && allZhi.includes(jxTarget)) {
    results.push({name:'將星', zh:'命帶將星：天生領導氣質，適合管理職位'});
  }

  // 天乙貴人（以日干查）
  var tianYi = {甲:['丑','未'],乙:['子','申'],丙:['亥','酉'],丁:['亥','酉'],
    戊:['丑','未'],己:['子','申'],庚:['丑','未'],辛:['寅','午'],壬:['卯','巳'],癸:['卯','巳']};
  var dm = bazi.dm;
  var tyTargets = tianYi[dm] || [];
  tyTargets.forEach(function(t) {
    if (allZhi.includes(t)) {
      var tyPillar = ['年','月','日','時'][allZhi.indexOf(t)];
      results.push({name:'天乙貴人', pillar:tyPillar, zh:tyPillar + '柱帶天乙貴人（' + t + '）：遇難呈祥，常有貴人相助'});
    }
  });

  // 文昌貴人（以日干查）
  var wenChang = {甲:'巳',乙:'午',丙:'申',丁:'酉',戊:'申',己:'酉',庚:'亥',辛:'子',壬:'寅',癸:'卯'};
  var wcTarget = wenChang[dm];
  if (wcTarget && allZhi.includes(wcTarget)) {
    results.push({name:'文昌', zh:'命帶文昌：學業有成，文筆出眾，考試運佳'});
  }

  // 羊刃（以日干查）
  var yangRen = {甲:'卯',丙:'午',戊:'午',庚:'酉',壬:'子'};
  var yrTarget = yangRen[dm];
  if (yrTarget && allZhi.includes(yrTarget)) {
    var yrPillar = ['年','月','日','時'][allZhi.indexOf(yrTarget)];
    results.push({name:'羊刃', pillar:yrPillar, zh:yrPillar + '柱帶羊刃（' + yrTarget + '）：性格剛烈果斷，做事有魄力但需注意衝動'});
  }

  // 祿神（以日干查，已在建祿格判定）
  var luShen = {甲:'寅',乙:'卯',丙:'巳',丁:'午',戊:'巳',己:'午',庚:'申',辛:'酉',壬:'亥',癸:'子'};
  var lsTarget = luShen[dm];
  if (lsTarget && allZhi.includes(lsTarget)) {
    var lsPillar = ['年','月','日','時'][allZhi.indexOf(lsTarget)];
    results.push({name:'祿神', pillar:lsPillar, zh:lsPillar + '柱帶祿神（' + lsTarget + '）：衣食無缺，一生有穩定的資源基礎'});
  }

  return results;
}


// ── 6. 十神組合格局 ──
// 食神制殺、傷官配印、財官雙美 等經典組合

function baziTenGodCombinations(bazi) {
  if (!bazi || !bazi.gods) return [];

  var combos = [];
  var gods = bazi.gods || {};
  var dm = bazi.dm;
  var allGan = [_pGan(bazi,0), _pGan(bazi,1), _pGan(bazi,2), _pGan(bazi,3)];

  // 收集四柱出現的十神
  var godList = [];
  allGan.forEach(function(g, i) {
    if (i === 2) return; // 日干不算
    var god = gods[i] || '';
    if (god) godList.push(god);
  });

  var hasZhengGuan = godList.includes('正官');
  var hasQiSha = godList.includes('七殺');
  var hasShiShen = godList.includes('食神');
  var hasShangGuan = godList.includes('傷官');
  var hasZhengYin = godList.includes('正印');
  var hasPianYin = godList.includes('偏印');
  var hasZhengCai = godList.includes('正財');
  var hasPianCai = godList.includes('偏財');

  // 食神制殺
  if (hasShiShen && hasQiSha) {
    combos.push({
      name: '食神制殺',
      zh: '食神制殺：食神剛好制住七殺的凶性，化壓力為動力，是大富大貴的組合'
    });
  }

  // 傷官配印
  if (hasShangGuan && hasZhengYin) {
    combos.push({
      name: '傷官配印',
      zh: '傷官配印：傷官的才華與反叛被正印的智慧約束，學識淵博、聲名遠播'
    });
  }

  // 殺印相生
  if (hasQiSha && hasZhengYin) {
    combos.push({
      name: '殺印相生',
      zh: '殺印相生：七殺的壓力被正印化解為權力，掌權且有智慧，是高管命格'
    });
  }

  // 財官雙美
  if (hasZhengCai && hasZhengGuan) {
    combos.push({
      name: '財官雙美',
      zh: '財官雙美：正財與正官同現，事業穩定且收入豐厚，社會地位高'
    });
  }

  // 傷官見官
  if (hasShangGuan && hasZhengGuan) {
    combos.push({
      name: '傷官見官',
      zh: '⚠ 傷官見官：傷官與正官對沖，口舌是非多，與上司易衝突。需印來通關或化解。'
    });
  }

  // 梟神奪食
  if (hasPianYin && hasShiShen) {
    combos.push({
      name: '梟神奪食',
      zh: '⚠ 梟神奪食：偏印剋制食神，才華被壓制、好事被攪局。需偏財來制梟。'
    });
  }

  // 官殺混雜
  if (hasZhengGuan && hasQiSha) {
    combos.push({
      name: '官殺混雜',
      zh: '⚠ 官殺混雜：正官與七殺同現，事業方向不明確，壓力來源多頭。需去一留一方為清格。'
    });
  }

  // 比劫奪財
  var hasBiJian = godList.includes('比肩');
  var hasJieCai = godList.includes('劫財');
  if ((hasBiJian || hasJieCai) && (hasZhengCai || hasPianCai) && bazi.strong) {
    combos.push({
      name: '比劫奪財',
      zh: '⚠ 比劫奪財：身強又見比劫與財星同現，財來財去留不住，合夥事業需注意利益分配。'
    });
  }

  return combos;
}


// ══════════════════════════════════════════════════════════════════════
// INTEGRATION
// ══════════════════════════════════════════════════════════════════════

// ── 7. 日主十二運在四柱（看日主在哪裡強、哪裡弱）──
function baziDmChangsheng(bazi) {
  if (!bazi || !bazi.dm || !bazi.pillars) return null;
  var CS_ORDER = ['長生','沐浴','冠帶','臨官','帝旺','衰','病','死','墓','絕','胎','養'];
  // 各日干的長生起點（陽干順行、陰干逆行）
  var CS_START = {甲:11,乙:6,丙:2,丁:9,戊:2,己:9,庚:5,辛:0,壬:8,癸:3}; // 地支idx
  var dm = bazi.dm;
  var startIdx = CS_START[dm];
  if (startIdx === undefined) return null;
  var isYang = '甲丙戊庚壬'.indexOf(dm) >= 0;
  var result = {};
  ['year','month','day','hour'].forEach(function(k) {
    var zhi = bazi.pillars[k] ? bazi.pillars[k].zhi : null;
    if (!zhi) return;
    var zhiIdx = DZ12.indexOf(zhi);
    var steps = isYang ? ((zhiIdx - startIdx + 12) % 12) : ((startIdx - zhiIdx + 12) % 12);
    result[k] = { zhi: zhi, state: CS_ORDER[steps], strong: steps <= 4 }; // 長生~帝旺=強
  });
  return result;
}

// ── 8. 納音五行互動（年命 vs 日柱納音）──
function baziNayinInteraction(bazi) {
  if (!bazi || !bazi.nayinAll) return null;
  var WX_CYCLE = { '金克木':true,'木克土':true,'土克水':true,'水克火':true,'火克金':true };
  var WX_GEN = { '金生水':true,'水生木':true,'木生火':true,'火生土':true,'土生金':true };
  var yearNY = bazi.nayinAll.year;
  var dayNY = bazi.nayinAll.day;
  if (!yearNY || !dayNY) return null;
  function nyEl(ny) { return ny.includes('金')?'金':ny.includes('木')?'木':ny.includes('水')?'水':ny.includes('火')?'火':ny.includes('土')?'土':''; }
  var yEl = nyEl(yearNY), dEl = nyEl(dayNY);
  if (!yEl || !dEl) return null;
  var rel = yEl === dEl ? '比和' : WX_GEN[yEl+'生'+dEl] ? '年生日（祖蔭助命）' : WX_GEN[dEl+'生'+yEl] ? '日生年（洩氣孝順）' : WX_CYCLE[yEl+'克'+dEl] ? '年克日（祖輩壓力）' : WX_CYCLE[dEl+'克'+yEl] ? '日克年（反抗傳統）' : '無明顯互動';
  return { yearNayin: yearNY, dayNayin: dayNY, relation: rel };
}

function enhanceBazi(bazi) {
  if (!bazi) return bazi;

  // 1. 正格判定
  try { bazi.zhengGe = baziDetectZhengGe(bazi); } catch(e) { bazi.zhengGe = null; }

  // 2. 暗合拱合暗沖
  try { bazi.hiddenInteractions = baziHiddenInteractions(bazi); } catch(e) { bazi.hiddenInteractions = []; }

  // 3. 歲運並臨
  try { bazi.suiYunBingLin = baziCheckSuiYunBingLin(bazi); } catch(e) { bazi.suiYunBingLin = null; }

  // 4. 額外神煞
  try { bazi.extraShenSha = baziExtraShenSha(bazi); } catch(e) { bazi.extraShenSha = []; }

  // 5. 十神組合格局
  try { bazi.tenGodCombos = baziTenGodCombinations(bazi); } catch(e) { bazi.tenGodCombos = []; }

  // 6. 流月（取當前流年）
  try {
    var now = new Date();
    var cy = now.getFullYear();
    var yearOffset = ((cy - 4) % 60 + 60) % 60;
    var lnGan = TG10[yearOffset % 10];
    var lnZhi = DZ12[yearOffset % 12];
    bazi.liuYue = baziCalcLiuYue(bazi, lnGan, lnZhi);
    bazi.liuNianGZ = lnGan + lnZhi;
  } catch(e) { bazi.liuYue = []; }

  // 7. 日主十二運
  try { bazi.dmChangsheng = baziDmChangsheng(bazi); } catch(e) { bazi.dmChangsheng = null; }

  // 8. 納音互動
  try { bazi.nayinRelation = baziNayinInteraction(bazi); } catch(e) { bazi.nayinRelation = null; }

  return bazi;
}
