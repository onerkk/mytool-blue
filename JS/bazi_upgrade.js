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

// ── 共用十神工具（與 baziDetectZhengGe 內同邏輯，供新函數使用）──
function _tenGodOf(dm, other) {
  var di = TG10.indexOf(dm), oi = TG10.indexOf(other);
  if (di < 0 || oi < 0) return '';
  var de = WX_MAP[dm], oe = WX_MAP[other], same = (di % 2 === oi % 2);
  if (de === oe) return same ? '比肩' : '劫財';
  var sheng = {木:'火',火:'土',土:'金',金:'水',水:'木'}, ke = {木:'土',火:'金',土:'水',金:'木',水:'火'};
  if (sheng[de] === oe) return same ? '食神' : '傷官';
  if (ke[de] === oe) return same ? '偏財' : '正財';
  if (sheng[oe] === de) return same ? '偏印' : '正印';
  if (ke[oe] === de) return same ? '七殺' : '正官';
  return '';
}

// 日主合某十神的含義
function _dmHeMeaning(god) {
  if (god === '正官' || god === '七殺') return '——主你與權貴、體制、規範、上司／法律有天然牽絆或受其約束；男命亦常見對事業責任感重，感情中易受對方主導或早有歸屬';
  if (god === '正財' || god === '偏財') return '——主你對金錢、物質、現實利益（男命兼妻緣）有黏著、放不下，重財顧家或妻緣早';
  if (god === '正印' || god === '偏印') return '——主你戀於依靠、學問、母緣或既有的保護網，難以割捨、不易獨立放手';
  if (god === '食神' || god === '傷官') return '——主你黏著於表現欲、才華、創作、子女或口舌表達之事';
  if (god === '比肩' || god === '劫財') return '——主你與同輩、合夥人、兄弟姊妹的羈絆特別深';
  return '';
}

// ── 9. 原局天干五合（含日主之合）──
// 甲己合土、乙庚合金、丙辛合水、丁壬合木、戊癸合火
// 日主之合「合而不化」（我不變），但要論「合之情」；非日主天干相鄰且化神得月令/旺則論合化
function baziTianGanHe(bazi) {
  if (!bazi || !bazi.pillars) return [];
  var HE = {甲己:'土',己甲:'土',乙庚:'金',庚乙:'金',丙辛:'水',辛丙:'水',丁壬:'木',壬丁:'木',戊癸:'火',癸戊:'火'};
  var dm = bazi.dm;
  var pk = ['year','month','day','hour'], pn = {year:'年',month:'月',day:'日',hour:'時'};
  var ep = bazi.ep || {};
  var mzEl = bazi.pillars.month ? WX_MAP[bazi.pillars.month.zhi] : '';
  var gans = pk.map(function (k) { return { k:k, g: bazi.pillars[k] ? bazi.pillars[k].gan : '' }; });
  var out = [];
  for (var i = 0; i < gans.length; i++) {
    for (var j = i + 1; j < gans.length; j++) {
      var a = gans[i], b = gans[j];
      if (!a.g || !b.g) continue;
      var he = HE[a.g + b.g];
      if (!he) continue;
      var adjacent = (j === i + 1);
      var involvesDm = (a.k === 'day' || b.k === 'day');
      var otherGan = involvesDm ? (a.k === 'day' ? b.g : a.g) : null;
      var god = otherGan ? _tenGodOf(dm, otherGan) : '';
      var heGetLing = (mzEl === he), hePct = ep[he] || 0;
      var canHua = !involvesDm && (heGetLing || hePct >= 30);
      var zh;
      if (involvesDm) {
        var ok2 = (a.k === 'day' ? b.k : a.k);
        zh = '日主' + dm + ' 合 ' + pn[ok2] + '干' + otherGan + '（' + god + '）：合而不化（日主不變），但有「合之情」' + _dmHeMeaning(god) + (adjacent ? '。緊貼相合，牽絆更明顯。' : '。隔位相合，力量稍緩。');
      } else {
        zh = pn[a.k] + '干' + a.g + ' 合 ' + pn[b.k] + '干' + b.g + '：' + (canHua ? '合化' + he + (heGetLing ? '（化神得月令，化成）' : '（化神旺，化成）') + '，該五行力量增強' : '相合牽制（合而不化）——兩干互相羈絆、各自減力，所代表的十神作用打折');
      }
      out.push({ pair:a.g + b.g, pillars:[pn[a.k], pn[b.k]], el:he, adjacent:adjacent, involvesDayMaster:involvesDm, tenGod:god, transforms:canHua, zh:zh });
    }
  }
  return out;
}

// ── 10. 旺衰病象（母多滅子 / 殺重身輕 / 財多身弱 / 食傷洩秀太過 / 殺印兩旺…）──
// 把「身強弱 → 用神方向」講成具體病象，尤其根治「印重埋身（水多木漂類）」漏判
function baziStrengthPattern(bazi) {
  if (!bazi || !bazi.dmEl) return [];
  var dmEl = bazi.dmEl, ep = bazi.ep || {};
  var YIN = {木:'水',火:'木',土:'火',金:'土',水:'金'};      // 生我=印
  var SHENG = {木:'火',火:'土',土:'金',金:'水',水:'木'};     // 我生=食傷
  var KE = {木:'土',火:'金',土:'水',金:'木',水:'火'};        // 我剋=財
  var KEME = {木:'金',火:'水',土:'木',金:'火',水:'土'};      // 剋我=官殺
  var MIE = {木:'水多木漂',火:'土多火晦',土:'金多土虛（洩盡）',金:'土多金埋',水:'金多水濁／木多水縮'}; // 印過旺埋日主之象
  var yinEl = YIN[dmEl], siEl = SHENG[dmEl], caiEl = KE[dmEl], guanEl = KEME[dmEl], bjEl = dmEl;
  var p = function (e) { return ep[e] || 0; };
  var strong = !!bazi.strong;
  var R = Math.round;
  var siNote = (p(siEl) < 8) ? '（本命食傷' + siEl + '僅 ' + R(p(siEl)) + '%，極缺，最該補）' : '';
  var out = [];
  var yinHeavy = (p(yinEl) >= 28 && p(yinEl) > p(bjEl));
  var shaHeavy = (p(guanEl) >= 30);

  if (!strong && yinHeavy && shaHeavy) {
    // 殺印兩旺、身弱：殺印相生但印近飽和（隨時母多滅子）
    out.push({ type:'殺印兩旺·身弱', el:[guanEl, yinEl],
      zh:'官殺（' + guanEl + '）' + R(p(guanEl)) + '%、印（' + yinEl + '）' + R(p(yinEl)) + '% 俱旺而身弱。印正在化殺生身（殺印相生），這是好事——但印已近飽和，再添印（' + yinEl + '）就「' + MIE[dmEl] + '」。所以用神不在加印，而在：食傷（' + siEl + '）制殺、暖局調候、引日主之秀給出路' + siNote + '，配比劫（' + bjEl + '）幫身、納印。忌再行印運（' + yinEl + '）、忌財（' + caiEl + '）生殺壞印。' });
  } else if (!strong && yinHeavy) {
    // 純母多滅子（印旺、殺不旺）
    out.push({ type:'母多滅子（印重）', el:yinEl,
      zh:'母多滅子：印（' + yinEl + '）佔 ' + R(p(yinEl)) + '%，過旺反埋日主——「' + MIE[dmEl] + '」。印多身弱不是用印，而是：比劫（' + bjEl + '）幫身納印、食傷（' + siEl + '）洩印旺氣兼調候' + siNote + '、財（' + caiEl + '）制印（財損印）為解。忌再行印運（' + yinEl + '）。' });
  } else if (!strong && shaHeavy) {
    out.push({ type:'殺重身輕', el:guanEl,
      zh:'官殺重身輕：官殺（' + guanEl + '）' + R(p(guanEl)) + '% 剋身過重。最佳解是印（' + yinEl + '）化殺生身（殺印相生），次用比劫（' + bjEl + '）幫身、或食傷（' + siEl + '）制殺；忌財（' + caiEl + '）黨殺。' });
  }
  if (!strong && p(caiEl) >= 30 && p(caiEl) >= p(bjEl) && !(yinHeavy && shaHeavy)) {
    out.push({ type:'財多身弱', el:caiEl,
      zh:'財多身弱：財（' + caiEl + '）' + R(p(caiEl)) + '%，身弱擔不起財（富屋貧人，見財起爭）。用比劫（' + bjEl + '）幫身奪財、印（' + yinEl + '）生身固本；忌再行財運。' });
  }
  if (!strong && p(siEl) >= 28 && p(siEl) >= p(bjEl) && !yinHeavy && !shaHeavy) {
    out.push({ type:'食傷洩秀太過', el:siEl,
      zh:'食傷過旺洩身：食傷（' + siEl + '）' + R(p(siEl)) + '%，身弱而洩太過（才情外露卻耗身）。用印（' + yinEl + '）制食傷護身、比劫（' + bjEl + '）幫身；身弱忌再洩。' });
  }
  if (strong && p(bjEl) >= 35) {
    out.push({ type:'比劫旺（身強）', el:bjEl,
      zh:'比劫旺（身強）：' + bjEl + ' ' + R(p(bjEl)) + '%，宜食傷（' + siEl + '）洩秀、財（' + caiEl + '）官殺（' + guanEl + '）為用；忌再行比劫運（爭財奪利、損妻破財）。' });
  }
  return out;
}

// ── 11. 官殺混雜（正官＋七殺並見）──
function baziGuanShaMix(bazi) {
  if (!bazi || !bazi.dm || !bazi.pillars) return { mixed:false };
  var dm = bazi.dm, dmYin = TG10.indexOf(dm) % 2;
  var guanEl = {木:'金',火:'水',土:'木',金:'火',水:'土'}[WX_MAP[dm]];
  var CG = {子:['癸'],丑:['己','癸','辛'],寅:['甲','丙','戊'],卯:['乙'],辰:['戊','乙','癸'],巳:['丙','庚','戊'],午:['丁','己'],未:['己','丁','乙'],申:['庚','壬','戊'],酉:['辛'],戌:['戊','辛','丁'],亥:['壬','甲']};
  var pk = ['year','month','day','hour'], pn = {year:'年',month:'月',day:'日',hour:'時'};
  var zheng = [], qi = [];
  pk.forEach(function (k) {
    var pil = bazi.pillars[k]; if (!pil) return;
    if (k !== 'day' && pil.gan && WX_MAP[pil.gan] === guanEl) {
      (TG10.indexOf(pil.gan) % 2 === dmYin ? qi : zheng).push(pn[k] + '干' + pil.gan);
    }
    (CG[pil.zhi] || []).forEach(function (cg) {
      if (WX_MAP[cg] === guanEl) (TG10.indexOf(cg) % 2 === dmYin ? qi : zheng).push(pn[k] + '支藏' + cg);
    });
  });
  if (zheng.length && qi.length) {
    return { mixed:true, zheng:zheng, qi:qi,
      zh:'官殺混雜：正官（' + zheng.join('、') + '）與七殺（' + qi.join('、') + '）並見。主壓力來源雜、是非口舌多、行事易進退失據；正統解法為「去官留殺」或「去殺留官」（以合或制去其一，留清純之氣），或以印化官殺。' };
  }
  return { mixed:false };
}

// ── 12. 完整五行喜忌表（扶抑為底 + 母多/殺印翻轉 + 調候override + 從化 + 引擎 fav/unfav 為最終權威）──
// 解決「unfav 只列最重一個」導致大運判吉凶與喜忌不完整、不一致的問題；全盤共用此表
function baziWuxingStance(bazi) {
  if (!bazi || !bazi.dmEl) return null;
  var dmEl = bazi.dmEl, els = ['木','火','土','金','水'];
  var YIN = {木:'水',火:'木',土:'火',金:'土',水:'金'}, SHENG = {木:'火',火:'土',土:'金',金:'水',水:'木'},
      KE = {木:'土',火:'金',土:'水',金:'木',水:'火'}, KEME = {木:'金',火:'水',土:'木',金:'火',水:'土'};
  var role = {}; role[YIN[dmEl]] = '印'; role[dmEl] = '比劫'; role[SHENG[dmEl]] = '食傷'; role[KE[dmEl]] = '財'; role[KEME[dmEl]] = '官殺';
  var strong = !!bazi.strong, st = {};
  // 1) 扶抑為底
  els.forEach(function (e) {
    if (bazi.specialStructure) { st[e] = '平'; }
    else if (strong) { st[e] = (role[e] === '食傷' || role[e] === '財' || role[e] === '官殺') ? '喜' : '忌'; }
    else { st[e] = (role[e] === '印' || role[e] === '比劫') ? '喜' : '忌'; }
  });
  // 2) 從格/化氣格覆蓋
  if (bazi.specialStructure) {
    (bazi.specialStructure.favEls || []).forEach(function (e) { st[e] = '喜'; });
    (bazi.specialStructure.unfavEls || []).forEach(function (e) { st[e] = '忌'; });
  }
  // 3) 病象翻轉（母多滅子／殺印兩旺：印過旺反忌、食傷洩印為喜、比劫幫身為喜）
  (bazi.strengthPattern || []).forEach(function (s) {
    if (/母多滅子|殺印兩旺/.test(s.type)) {
      st[YIN[dmEl]] = '忌'; st[SHENG[dmEl]] = '喜'; st[dmEl] = '喜';
      if (/殺印兩旺/.test(s.type)) { st[KE[dmEl]] = '忌'; st[KEME[dmEl]] = '忌'; }
      else { st[KE[dmEl]] = '喜'; }
    }
  });
  // 4) 調候微調（調候所需者不可純當忌，降為平／升喜方向；調候所忌者為忌）
  if (bazi.tiaohou) {
    (bazi.tiaohou.need || []).forEach(function (e) { if (st[e] === '忌') st[e] = '平'; });
    (bazi.tiaohou.avoid || []).forEach(function (e) { st[e] = '忌'; });
  }
  // 5) 引擎 fav/unfav 為最終權威（已含調候插隊、特殊格局、病藥的結論）
  (bazi.fav || []).forEach(function (e) { st[e] = '喜'; });
  (bazi.unfav || []).forEach(function (e) { st[e] = '忌'; });

  var xi = els.filter(function (e) { return st[e] === '喜'; });
  var ji = els.filter(function (e) { return st[e] === '忌'; });
  var ping = els.filter(function (e) { return st[e] === '平'; });
  return { map: st, role: role, xi: xi, ji: ji, ping: ping, conflict: !!bazi.strengthConflict,
    summary: '喜：' + (xi.join('、') || '—') + '　忌：' + (ji.join('、') || '—') + (ping.length ? '　平（閒神）：' + ping.join('、') : '') };
}

// ── 13. 旺衰矛盾說明（得令卻弱／失令卻強…講開，避免 AI 卡在「得令=是卻判身弱」）──
function baziStrengthNote(bazi) {
  if (!bazi || !bazi.dm || !bazi.pillars) return null;
  var dm = bazi.dm, strong = !!bazi.strong, deLing = !!bazi.deLing;
  var mZhi = bazi.pillars.month ? bazi.pillars.month.zhi : '';
  var siling = (bazi.renyuan && bazi.renyuan.gan) ? bazi.renyuan.gan : '';
  var silingGod = siling ? _tenGodOf(dm, siling) : '';
  var touBiJie = false, touYin = false;
  ['year','month','hour'].forEach(function (k) {
    var g = bazi.pillars[k] && bazi.pillars[k].gan; if (!g) return;
    var god = _tenGodOf(dm, g);
    if (god === '比肩' || god === '劫財') touBiJie = true;
    if (god === '正印' || god === '偏印') touYin = true;
  });
  var notes = [];
  if (deLing && !strong) {
    var why = [];
    if (silingGod && silingGod !== '比肩' && silingGod !== '劫財') why.push('月令當令之氣是' + siling + '（' + silingGod + '，並非比劫祿刃當令）');
    if (!touBiJie && !touYin) why.push('比劫、印星均未透天干');
    else if (!touBiJie) why.push('比劫未透天干');
    why.push('洩耗之氣（食傷／財／官殺）較重，壓過月令幫身之力');
    notes.push('得令卻偏弱：雖生於' + mZhi + '月看似當令，但' + why.join('、') + '，故日主實際轉弱——判吉凶仍以扶身（印、比劫）為先；惟因落在強弱界線，務必把這點不確定講出來。');
  } else if (!deLing && strong) {
    var by = [];
    if (touBiJie) by.push('比劫透干');
    if (touYin) by.push('印星透干');
    by.push('地支多根、黨眾助身');
    notes.push('失令卻偏旺：雖不當月令，但' + by.join('、') + '，故仍作旺論——用神取剋洩耗（官殺、財、食傷）。此盤亦在界線，留意複核。');
  }
  return notes.length ? notes.join(' ') : null;
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

  // 9. 原局天干五合（含日主之合 → 合官/合財…）
  try { bazi.tianGanHe = baziTianGanHe(bazi); } catch(e) { bazi.tianGanHe = []; }

  // 10. 旺衰病象（母多滅子／殺重身輕／財多身弱…根治印重埋身漏判）
  try { bazi.strengthPattern = baziStrengthPattern(bazi); } catch(e) { bazi.strengthPattern = []; }

  // 11. 官殺混雜
  try { bazi.guanShaMix = baziGuanShaMix(bazi); } catch(e) { bazi.guanShaMix = null; }

  // 12. 完整五行喜忌表（需在 strengthPattern 之後）
  try { bazi.wuxingStance = baziWuxingStance(bazi); } catch(e) { bazi.wuxingStance = null; }

  // 13. 旺衰矛盾說明（得令卻弱…）
  try { bazi.strengthNote = baziStrengthNote(bazi); } catch(e) { bazi.strengthNote = null; }

  // 14. 大運吉凶標記（正統：天干管前五年、地支管後五年，各自比對完整喜忌；取代不可靠的 score）
  try {
    var _st = bazi.wuxingStance;
    if (_st && _st.map && Array.isArray(bazi.dayun)) {
      var _lab = function (e) { var v = _st.map[e]; return v === '喜' ? '順' : (v === '忌' ? '背' : '平'); };
      bazi.dayun.forEach(function (d) {
        if (!d || !d.gz || d.gz === '小運' || d.gz.length < 2) return;
        var ganEl = WX_MAP[d.gz.charAt(0)], zhiEl = WX_MAP[d.gz.charAt(1)];
        var g = _lab(ganEl), z = _lab(zhiEl);
        d.luckLabel = (g === z) ? (g === '順' ? '吉' : (g === '背' ? '逆' : '平')) : ('前' + g + '後' + z);
        d.luckByStance = { gan: g, zhi: z, ganEl: ganEl, zhiEl: zhiEl };
      });
    }
  } catch(e) {}

  return bazi;
}
