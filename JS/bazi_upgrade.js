// v80.37(2026/6/25)：流月／流年沖合只列觸發，不再以「沖忌反吉、沖喜為凶」自動改分；與核心事實層政策一致。
// v80.36(2026/6/25)：藏干常數只讀 bazi.js 事實層；移除 upgrade 內備援複本，避免兩份表漂移。
// ══════════════════════════════════════════════════════════════════════
// 🏯 八字 TOP-TIER UPGRADE
// 正格十格判定 · 暗合/拱合 · 流月推算 · 格局深化
// v80.30(2026/6/10)：官殺混雜改透干論(三命通會)・刪自創「暗沖」・流月吉凶改 wuxingStance 全表＋沖合依喜忌定向・新增通根明細・十神組合 gods 索引死碼修復・流月移至喜忌表之後
// v80.31(2026/6/10)：流月補 note 欄位（沖合喜忌理由）供站內版 ai-analysis 透傳——它自組字串不讀 zh，理由原本會丟失
// v80.35(2026/6/25)：旺衰病象只列候選證據，不再自動翻轉完整五行立場；移除宿命式敘事。
// v80.34(2026/6/25)：暗合廣義算法停用；歲運並臨依立春與精確大運；天干五合不自動合化；神煞降為輔助象義。
// v80.33(2026/6/25)：統一藏干資料源、移除重複拱合、流年依立春、現行大運依精確日期；前後五年改標示為觀察慣例而非唯一正統。
// v80.32(2026/6/10)：①流年重評（bazi.js 流年 Step1 喜忌用窄表 fav/unfav，土年全漏判——與流月同病；於 stance 之後以全表重評基礎分＋沖類修飾並重定等級，合化/三合修飾經逐項驗算在本架構偏差≈0 不動）②nextDaYun 聚合連續同向喜用大運（連走年數），AI 連兩輪只講一步不講二十年窗口，改資料層直給
// 歲運並臨 · 十神格局完整 · 神煞擴充 · 桃花驛馬
// ══════════════════════════════════════════════════════════════════════
// 載入順序：bazi.js 之後
// enhanceBazi(S.bazi) 在 computeBazi 之後呼叫

var TG10 = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
var DZ12 = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
var WX_MAP = {甲:'木',乙:'木',丙:'火',丁:'火',戊:'土',己:'土',庚:'金',辛:'金',壬:'水',癸:'水',
  子:'水',丑:'土',寅:'木',卯:'木',辰:'土',巳:'火',午:'火',未:'土',申:'金',酉:'金',戌:'土',亥:'水'};
// 藏干唯一資料源：只讀 bazi.js 事實層。載入順序錯誤時以空表安全降級，不另維護第二份常數。
var CG_CORE = (window.BAZI_CORE && window.BAZI_CORE.hiddenStems) || Object.freeze({});

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
  var CG = CG_CORE;

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
  // 「任意兩支的任意藏干只要五合就算暗合」會大量製造噪音，且不是各派一致定義。
  // 為避免把流派術語冒充排盤事實，預設停用；需要特定暗合派別時應另立政策與表格。
  return [];
}


// ── 3. 流月推算 ──
// 以流年干支為基礎，推算12個月的天干地支及吉凶
// 吉凶基礎分只讀扶抑立場；沖合只列觸發資料。
// 不再使用「沖忌反吉、沖喜為凶」的一刀切規則，也不因六合配對自動推定合化／合絆。

function baziCalcLiuYue(bazi, liuNianGan, liuNianZhi, stance) {
  if (!bazi || !liuNianGan) return [];

  // 五虎遁：年干定月干
  var wuHuDun = {甲:2, 己:2, 乙:4, 庚:4, 丙:6, 辛:6, 丁:8, 壬:8, 戊:0, 癸:0};
  var startGanIdx = wuHuDun[liuNianGan];
  if (startGanIdx === undefined) startGanIdx = 0;

  var st = (stance && stance.map) ? stance.map : null;
  var fav = bazi.fav || [], unfav = bazi.unfav || [];
  var judge = function (el) {                    // 喜+1／忌-1／閒0（無全表時退回 fav/unfav）
    if (st) return st[el] === '喜' ? 1 : (st[el] === '忌' ? -1 : 0);
    if (fav.indexOf(el) >= 0) return 1;
    if (unfav.indexOf(el) >= 0) return -1;
    return 0;
  };

  var HE_HUA = {'子丑':'土','寅亥':'木','卯戌':'火','辰酉':'金','巳申':'水','午未':'火'};
  var monthZhi = ['寅','卯','辰','巳','午','未','申','酉','戌','亥','子','丑'];
  var monthNames = ['正月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月'];
  var dayZhi = _pZhi(bazi, 2), dayZhiIdx = DZ12.indexOf(dayZhi), dayJ = judge(WX_MAP[dayZhi]);

  var months = [];
  for (var i = 0; i < 12; i++) {
    var mGan = TG10[(startGanIdx + i) % 10], mZhi = monthZhi[i];
    var mEl = WX_MAP[mGan], mZhiEl = WX_MAP[mZhi];
    var score = judge(mEl) * 2 + judge(mZhiEl);  // 干主氣勢力重、支次之，比例沿用原 2:1

    var mZhiIdx = DZ12.indexOf(mZhi);
    var isChong = Math.abs(dayZhiIdx - mZhiIdx) === 6;
    var isHe = false;
    [[0,1],[2,11],[3,10],[4,9],[5,8],[6,7]].forEach(function (lh) {
      if ((dayZhiIdx === lh[0] && mZhiIdx === lh[1]) || (dayZhiIdx === lh[1] && mZhiIdx === lh[0])) isHe = true;
    });

    var note = '';
    if (isChong) {
      note = '（' + mZhi + '沖日支' + dayZhi + '；先列變動／對立觸發，方向與吉凶須看全局及具體事件，不自動加減分）';
    } else if (isHe) {
      var hk = [dayZhi, mZhi].sort(function (a, c) { return DZ12.indexOf(a) - DZ12.indexOf(c); }).join('');
      var hua = HE_HUA[hk] || '';
      note = '（' + mZhi + '與日支' + dayZhi + '構成六合' + (hua ? '，傳統化神候選' + hua : '') + '；是否合化、合絆及吉凶待審，不因配對自動加減分）';
    }

    var label = score >= 3 ? '大吉' : score >= 1 ? '吉' : score >= 0 ? '平' : score >= -2 ? '凶' : '大凶';
    months.push({
      month: i + 1, monthName: monthNames[i], gan: mGan, zhi: mZhi, gz: mGan + mZhi,
      ganEl: mEl, zhiEl: mZhiEl, score: score, label: label, isChong: isChong, isHe: isHe, note: note,
      zh: monthNames[i] + '（' + mGan + mZhi + '）：' + label + (isChong ? '⚡沖日支' : '') + (isHe ? '💛合日支' : '') + note
    });
  }

  return months;
}


// ── 4. 歲運並臨 ──
// 流年干支與大運干支完全相同，吉凶加倍

function baziCheckSuiYunBingLin(bazi) {
  if (!bazi || !Array.isArray(bazi.dayun)) return null;
  var refMs = isFinite(bazi._referenceTimestamp) ? bazi._referenceTimestamp : Date.now();
  var curDayun = bazi.dayun.find(function(d) { return d && d.isCurrent && d.gz && d.gz !== '小運'; });
  if (!curDayun || !curDayun.gz || curDayun.gz.length < 2) return null;

  var annual = (typeof window !== 'undefined' && window.BAZI_CORE && window.BAZI_CORE.getYearGanZhiAt)
    ? window.BAZI_CORE.getYearGanZhiAt(new Date(refMs)) : null;
  if (!annual) {
    var y = new Date(refMs).getUTCFullYear(), off = ((y - 4) % 60 + 60) % 60;
    annual = {year:y, gan:TG10[off%10], zhi:DZ12[off%12], gz:TG10[off%10]+DZ12[off%12], boundary:'立春近似'};
  }
  var dyGan=curDayun.gz.charAt(0), dyZhi=curDayun.gz.charAt(1);
  var result={active:false,year:annual.year,annualGz:annual.gz,dayunGz:curDayun.gz,boundary:annual.boundary||'立春'};
  if(annual.gan===dyGan && annual.zhi===dyZhi){
    return Object.assign(result,{active:true,type:'歲運並臨',gz:annual.gz,severity:'review',
      zh:'歲運並臨：'+annual.year+'立春年度與當前大運同為'+annual.gz+'。同一干支象義重疊，事件主題可能較集中；不等於「吉則大吉、凶則大凶」，仍須看原局喜忌、刑沖合害與具體月份。'});
  }
  var keMap={木:'土',火:'金',土:'水',金:'木',水:'火'};
  var lnGanEl=WX_MAP[annual.gan],dyGanEl=WX_MAP[dyGan];
  var isGanKe=keMap[lnGanEl]===dyGanEl || keMap[dyGanEl]===lnGanEl;
  var isZhiChong=Math.abs(DZ12.indexOf(annual.zhi)-DZ12.indexOf(dyZhi))===6;
  if(isGanKe&&isZhiChong){
    return Object.assign(result,{active:true,type:'天剋地沖',gz:annual.gz+' vs '+curDayun.gz,severity:'review',
      zh:'流年'+annual.gz+'與大運'+curDayun.gz+'構成天干相剋、地支相沖，傳統上視為變動訊號較強；變動方向與吉凶仍須按被動之五行、宮位及喜忌判斷。'});
  }
  return result;
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
      zh: thPillar + '柱帶桃花（' + thTarget + '）：傳統上作人際吸引、社交表現的輔助象義，不代表必有戀情或婚外情' +
          (thPillar === '時' ? '；落時柱僅表示晚期或成果領域可參考此象' : thPillar === '月' ? '；落月柱可參考職場／社會場域的人際象' : '')
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
      zh: ymPillar + '柱帶驛馬（' + ymTarget + '）：傳統上作移動、轉換、外出象義；是否真的多遷動仍看歲運引發'
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
      zh: hgPillar + '柱帶華蓋（' + hgTarget + '）：傳統上作獨處、技藝、精神性或審美象義，不能直接斷定性格與天賦'
    });
  }

  // 將星
  var jiangXing = {寅:'午',午:'午',戌:'午', 申:'子',子:'子',辰:'子', 巳:'酉',酉:'酉',丑:'酉', 亥:'卯',卯:'卯',未:'卯'};
  var jxTarget = jiangXing[yearZhi];
  if (jxTarget && allZhi.includes(jxTarget)) {
    results.push({name:'將星', zh:'命帶將星：傳統上作主導、組織或承擔象義，僅供輔助'});
  }

  // 天乙貴人（以日干查）
  var tianYi = {甲:['丑','未'],乙:['子','申'],丙:['亥','酉'],丁:['亥','酉'],
    戊:['丑','未'],己:['子','申'],庚:['丑','未'],辛:['寅','午'],壬:['卯','巳'],癸:['卯','巳']};
  var dm = bazi.dm;
  var tyTargets = tianYi[dm] || [];
  tyTargets.forEach(function(t) {
    if (allZhi.includes(t)) {
      var tyPillar = ['年','月','日','時'][allZhi.indexOf(t)];
      results.push({name:'天乙貴人', pillar:tyPillar, zh:tyPillar + '柱帶天乙貴人（' + t + '）：傳統貴人象義，不能保證逢凶化吉或必有他人相助'});
    }
  });

  // 文昌貴人（以日干查）
  var wenChang = {甲:'巳',乙:'午',丙:'申',丁:'酉',戊:'申',己:'酉',庚:'亥',辛:'子',壬:'寅',癸:'卯'};
  var wcTarget = wenChang[dm];
  if (wcTarget && allZhi.includes(wcTarget)) {
    results.push({name:'文昌', zh:'命帶文昌：傳統上作學習、文字、表達象義，不保證學業或考試結果'});
  }

  // 羊刃（以日干查）
  var yangRen = {甲:'卯',丙:'午',戊:'午',庚:'酉',壬:'子'};
  var yrTarget = yangRen[dm];
  if (yrTarget && allZhi.includes(yrTarget)) {
    var yrPillar = ['年','月','日','時'][allZhi.indexOf(yrTarget)];
    results.push({name:'羊刃', pillar:yrPillar, zh:yrPillar + '柱帶羊刃（' + yrTarget + '）：傳統上作剛健、競爭或急切象義，需與全局共同判斷'});
  }

  // 祿神（以日干查，已在建祿格判定）
  var luShen = {甲:'寅',乙:'卯',丙:'巳',丁:'午',戊:'巳',己:'午',庚:'申',辛:'酉',壬:'亥',癸:'子'};
  var lsTarget = luShen[dm];
  if (lsTarget && allZhi.includes(lsTarget)) {
    var lsPillar = ['年','月','日','時'][allZhi.indexOf(lsTarget)];
    results.push({name:'祿神', pillar:lsPillar, zh:lsPillar + '柱帶祿神（' + lsTarget + '）：傳統上作資源、職祿或自我支撐象義，不保證財富或生活條件'});
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
  var _gk = ['year','month','day','hour'];  // v80.30 修死碼：bazi.gods 以柱名為鍵，原 gods[i] 數字索引永遠 undefined → 全部組合從未觸發
  allGan.forEach(function(g, i) {
    if (i === 2) return; // 日干不算
    var god = gods[_gk[i]] || gods[i] || '';
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
  var HE={甲己:'土',己甲:'土',乙庚:'金',庚乙:'金',丙辛:'水',辛丙:'水',丁壬:'木',壬丁:'木',戊癸:'火',癸戊:'火'};
  var dm=bazi.dm, pk=['year','month','day','hour'], pn={year:'年',month:'月',day:'日',hour:'時'};
  var gans=pk.map(function(k){return {k:k,g:bazi.pillars[k]?bazi.pillars[k].gan:''};}),out=[];
  for(var i=0;i<gans.length;i++) for(var j=i+1;j<gans.length;j++){
    var a=gans[i],b=gans[j],he=HE[a.g+b.g]; if(!a.g||!b.g||!he) continue;
    var adjacent=j===i+1,involvesDm=a.k==='day'||b.k==='day';
    var otherGan=involvesDm?(a.k==='day'?b.g:a.g):null,god=otherGan?_tenGodOf(dm,otherGan):'';
    var zh=pn[a.k]+'干'+a.g+'與'+pn[b.k]+'干'+b.g+'構成天干五合（傳統化神候選'+he+'）';
    if(involvesDm) zh+='；涉及日主與'+god+'的合象，可參考牽連／取向，但不可直接推成固定性格或人生事件';
    else zh+='；可能合絆或在嚴格條件下論化，須另審月令、透干、引化、根氣、妒合與沖破';
    zh+=adjacent?'；相鄰，配對較直接。':'；隔位，需更保守。';
    out.push({pair:a.g+b.g,pillars:[pn[a.k],pn[b.k]],el:he,adjacent:adjacent,involvesDayMaster:involvesDm,tenGod:god,transforms:null,transformationStatus:'待審',zh:zh});
  }
  return out;
}

// ── 10. 旺衰病象（母多滅子 / 殺重身輕 / 財多身弱 / 食傷洩秀太過 / 殺印兩旺…）──
// 把「身強弱 → 用神方向」講成具體病象，尤其根治「印重埋身（水多木漂類）」漏判
function baziStrengthPattern(bazi) {
  if (!bazi || !bazi.dmEl) return [];
  var dmEl=bazi.dmEl, ep=bazi.ep||{};
  var YIN={木:'水',火:'木',土:'火',金:'土',水:'金'};
  var SHENG={木:'火',火:'土',土:'金',金:'水',水:'木'};
  var KE={木:'土',火:'金',土:'水',金:'木',水:'火'};
  var KEME={木:'金',火:'水',土:'木',金:'火',水:'土'};
  var yinEl=YIN[dmEl],siEl=SHENG[dmEl],caiEl=KE[dmEl],guanEl=KEME[dmEl],bjEl=dmEl;
  var p=function(e){return Number(ep[e]||0);},R=Math.round,strong=!!bazi.strong,out=[];
  var yinHeavy=p(yinEl)>=28&&p(yinEl)>p(bjEl),shaHeavy=p(guanEl)>=30;
  function add(type,el,evidence,checks){
    out.push({type:type,el:el,status:'待人工覆核',evidence:evidence,requiredChecks:checks,appliesAutomatically:false,
      zh:type+'僅為本相對權重模型的候選標記，不自動改寫喜忌或推導人生事件。'});
  }
  if(!strong&&yinHeavy&&shaHeavy)add('殺印兩旺·身弱',[guanEl,yinEl],['官殺'+guanEl+'相對權重'+R(p(guanEl))+'%','印'+yinEl+'相對權重'+R(p(yinEl))+'%','本模型判身弱'],['印是否真能化殺','日主根氣與透干','食傷是否可制殺','調候是否另有優先']);
  else if(!strong&&yinHeavy)add('印重身弱候選',yinEl,['印'+yinEl+'相對權重'+R(p(yinEl))+'%','印高於比劫'+bjEl,'本模型判身弱'],['印是否得令且有情','日主是否有根可受生','財星制印是否反傷保護','不得只憑百分比斷「母多滅子」']);
  else if(!strong&&shaHeavy)add('殺重身輕候選',guanEl,['官殺'+guanEl+'相對權重'+R(p(guanEl))+'%','本模型判身弱'],['是否有印化殺','是否有食傷制殺','官殺是否混雜或有制化','月令及根氣']);
  if(!strong&&p(caiEl)>=30&&p(caiEl)>=p(bjEl)&&!(yinHeavy&&shaHeavy))add('財多身弱候選',caiEl,['財'+caiEl+'相對權重'+R(p(caiEl))+'%','財不低於比劫','本模型判身弱'],['日主是否有根可任財','比劫印星是否可用','財是否得令有制','不得直接推斷財務結果']);
  if(!strong&&p(siEl)>=28&&p(siEl)>=p(bjEl)&&!yinHeavy&&!shaHeavy)add('食傷偏重身弱候選',siEl,['食傷'+siEl+'相對權重'+R(p(siEl))+'%','食傷不低於比劫','本模型判身弱'],['印星能否制食傷','食傷是否為調候所需','日主根氣','不得直接推斷才華或耗身事件']);
  if(strong&&p(bjEl)>=35)add('比劫偏重身強候選',bjEl,['比劫'+bjEl+'相對權重'+R(p(bjEl))+'%','本模型判身強'],['食傷財官是否可用','比劫是否有制有化','月令與格局','不得直接推斷爭財、婚姻或破財']);
  return out;
}

// ── 11. 官殺混雜（正官＋七殺並見）──
// v80.30 根治：依《三命通會·官煞去留雜論》「明者用之，藏者捨之。明見官則存其官，明見煞則存其煞」——
// 混雜以「天干並透」為準；一透一藏＝官透殺藏／殺透官藏，以透者論、不作混雜（支藏者僅作貼身根氣論）。
function baziGuanShaMix(bazi) {
  if (!bazi || !bazi.dm || !bazi.pillars) return { mixed:false, policy:'TRANSPARENT_STEMS_FIRST_REVIEW' };
  var dm = bazi.dm, dmYin = TG10.indexOf(dm) % 2;
  var guanEl = {木:'金',火:'水',土:'木',金:'火',水:'土'}[WX_MAP[dm]];
  var CG = CG_CORE;
  var pk = ['year','month','day','hour'], pn = {year:'年',month:'月',day:'日',hour:'時'};
  var zhengTou = [], qiTou = [], zhengCang = [], qiCang = [];
  pk.forEach(function (k) {
    var pil = bazi.pillars[k]; if (!pil) return;
    if (k !== 'day' && pil.gan && WX_MAP[pil.gan] === guanEl) {
      (TG10.indexOf(pil.gan) % 2 === dmYin ? qiTou : zhengTou).push(pn[k] + '干' + pil.gan);
    }
    (CG[pil.zhi] || []).forEach(function (cg) {
      if (WX_MAP[cg] === guanEl) (TG10.indexOf(cg) % 2 === dmYin ? qiCang : zhengCang).push(pn[k] + '支藏' + cg);
    });
  });
  var common = {
    policy:'TRANSPARENT_STEMS_FIRST_REVIEW',
    methodNote:'先分辨正官、七殺是否在天干明透；藏干只作根氣與後續制化參考。是否成為「官殺混雜」及如何去留，仍須合看月令、旺衰、制化、合沖與全局清濁。',
    zhengTou:zhengTou, qiTou:qiTou, zhengCang:zhengCang, qiCang:qiCang
  };
  if (zhengTou.length && qiTou.length) {
    return Object.assign(common, { mixed:true, variant:'bothTransparent',
      zh:'正官（' + zhengTou.join('、') + '）與七殺（' + qiTou.join('、') + '）同時明透，可列為官殺同見／混雜候選。這只表示兩類官殺訊號並見；是否需要去留、能否制化，以及最終吉凶，不能只靠「並透」直接下結論。' });
  }
  if (zhengTou.length && qiCang.length) {
    return Object.assign(common, { mixed:false, variant:'guanTouShaCang',
      zh:'正官明透（' + zhengTou.join('、') + '），七殺僅藏支（' + qiCang.join('、') + '）。本模型先以明透正官為主要可見訊號，藏殺只列根氣與待引發條件；不因藏殺存在便斷定混雜、暗中競爭或固定人生事件。' });
  }
  if (qiTou.length && zhengCang.length) {
    return Object.assign(common, { mixed:false, variant:'shaTouGuanCang',
      zh:'七殺明透（' + qiTou.join('、') + '），正官僅藏支（' + zhengCang.join('、') + '）。本模型先以明透七殺為主要可見訊號，藏官只列根氣與待引發條件；制殺、化殺或去留仍須按全局另審。' });
  }
  if (zhengTou.length || qiTou.length || zhengCang.length || qiCang.length) {
    return Object.assign(common, { mixed:false, variant:'singleOrHidden',
      zh:'官殺資料已分成明透與藏支呈現；目前未達「正官與七殺同時明透」條件。藏干是否被歲運引出，須在具體運年另判。' });
  }
  return Object.assign(common, { mixed:false, variant:'none', zh:'原局未見可辨識的官殺明透或藏根。' });
}

// ── 11.4 流年全表重評（v80.32）──
// bazi.js 的流年評分 Step1 用窄表 fav/unfav（本類盤忌僅[金]），土年基礎分漏判，與修正前流月同病。
// 此處於 wuxingStance 之後只重評干支五行基礎分（干支各±2）。
// 刑沖合害與三合三會不參與分數，避免把觸發關係直接當成吉凶方向。
function baziRescoreLiuNian(bazi, stance) {
  if (!bazi || !Array.isArray(bazi.dayun) || !stance || !stance.map) return;
  var st = stance.map;
  var fav = bazi.fav || [], unfav = bazi.unfav || [];
  var nJ = function (el) { return fav.indexOf(el) >= 0 ? 2 : (unfav.indexOf(el) >= 0 ? -2 : 0); };
  var sJ = function (el) { return st[el] === '喜' ? 2 : (st[el] === '忌' ? -2 : 0); };
  var CHONG = {}; for (var ci = 0; ci < 12; ci++) CHONG[DZ12[ci]] = DZ12[(ci + 6) % 12];
  var origZhi = [];
  ['year','month','day','hour'].forEach(function (k) { if (bazi.pillars && bazi.pillars[k]) origZhi.push(bazi.pillars[k].zhi); });
  bazi.dayun.forEach(function (dy) {
    if (!dy || !Array.isArray(dy.liuNian) || !dy.gz || dy.gz.length < 2) return;
    var dyZ = dy.gz.charAt(1), dyZEl = WX_MAP[dyZ];
    dy.liuNian.forEach(function (ln) {
      if (!ln || !ln.gz || ln.gz.length < 2) return;
      var g = ln.gz.charAt(0), z = ln.gz.charAt(1);
      var gEl = WX_MAP[g], zEl = WX_MAP[z];
      var delta = (sJ(gEl) - nJ(gEl)) + (sJ(zEl) - nJ(zEl));
      // 刑沖合害只作觸發資料，不參與分數校正。
      if (delta !== 0) {
        ln.score += delta;
        var s = ln.score;
        ln.level = s >= 5 ? '大吉' : s >= 3 ? '中吉' : s >= 1 ? '小吉' : s >= -1 ? '平穩' : s >= -3 ? '小凶' : s >= -5 ? '凶' : '大凶';
        if (sJ(gEl) < nJ(gEl) && st[gEl] === '忌') (ln.notes = ln.notes || []).push(g + '干' + gEl + '為忌（全表校正）');
        if (sJ(zEl) < nJ(zEl) && st[zEl] === '忌') (ln.notes = ln.notes || []).push(z + '支' + zEl + '為忌（全表校正）');
      }
    });
  });
}

// ── 11.5 日主通根明細（v80.30）──
// 「得地」各派定義不一（坐下通根派／二柱通根派…），引擎旺衰判定取「日支坐根」一派；
// 此處列明全盤比劫根氣供提示詞輸出，避免 AI 把「得地：否」誤讀成全盤無根。
function baziTongGen(bazi) {
  if (!bazi || !bazi.dm || !bazi.pillars) return null;
  var dmEl = WX_MAP[bazi.dm];
  var CG = CG_CORE;
  var pk = ['year','month','day','hour'], pn = {year:'年',month:'月',day:'日',hour:'時'};
  var TAG = ['（本氣強根）','（中氣根）','（餘氣弱根）'];
  var roots = [];
  pk.forEach(function (k) {
    var pil = bazi.pillars[k]; if (!pil) return;
    (CG[pil.zhi] || []).forEach(function (cg, idx) {
      if (WX_MAP[cg] === dmEl) roots.push(pn[k] + '支' + pil.zhi + '藏' + cg + (TAG[idx] || ''));
    });
  });
  if (!roots.length) return { has:false, zh:'四支均無比劫之根（真無根）' };
  return { has:true, list:roots, zh: roots.join('、') };
}

// ── 12. 扶抑基準五行立場（其他格局／調候／病藥鏡頭分開，不自動覆蓋）──
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
  // 3) strengthPattern 只列候選證據，不自動翻轉喜忌；需要採用時必須另立流派政策並說明。
  // 4) 調候保持獨立鏡頭，不在此改寫扶抑喜忌。
  // 5) 引擎 fav/unfav 為本扶抑模型的明示候選；調候、病藥與格局另列，不互相偷換。
  (bazi.fav || []).forEach(function (e) { st[e] = '喜'; });
  (bazi.unfav || []).forEach(function (e) { st[e] = '忌'; });

  var xi = els.filter(function (e) { return st[e] === '喜'; });
  var ji = els.filter(function (e) { return st[e] === '忌'; });
  var ping = els.filter(function (e) { return st[e] === '平'; });
  return { map: st, role: role, xi: xi, ji: ji, ping: ping, conflict: !!bazi.strengthConflict, model:'SUPPORT_DRAIN_BASELINE', candidateOnly:true,
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
  try { bazi.hiddenInteractions = baziHiddenInteractions(bazi); bazi.hiddenInteractionPolicy = {enabled:false,reason:'未採用「任意藏干五合即暗合」的廣義算法；暗合須指定流派後另算。'}; } catch(e) { bazi.hiddenInteractions = []; }

  // 3. 歲運並臨
  try { bazi.suiYunBingLin = baziCheckSuiYunBingLin(bazi); } catch(e) { bazi.suiYunBingLin = null; }

  // 4. 額外神煞
  try { bazi.extraShenSha = baziExtraShenSha(bazi); } catch(e) { bazi.extraShenSha = []; }

  // 5. 十神組合格局
  try { bazi.tenGodCombos = baziTenGodCombinations(bazi); } catch(e) { bazi.tenGodCombos = []; }

  // 6.（流月已移至 12 之後——吉凶須先有 wuxingStance 完整喜忌表，v80.30）

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

  // 12.35 流年全表重評（v80.32：必須在 wuxingStance 之後）
  try { baziRescoreLiuNian(bazi, bazi.wuxingStance); } catch(e) {}

  // 12.4 日主通根明細（v80.30：得地標籤誠實化的資料面）
  try { bazi.tongGen = baziTongGen(bazi); } catch(e) { bazi.tongGen = null; }

  // 12.5 流月（取當前流年；v80.30：移到 wuxingStance 之後，吉凶用完整喜忌表＋沖合依喜忌定向）
  try {
    var _refMs = isFinite(bazi._referenceTimestamp) ? bazi._referenceTimestamp : Date.now();
    var _annual = (window.BAZI_CORE && window.BAZI_CORE.getYearGanZhiAt) ? window.BAZI_CORE.getYearGanZhiAt(new Date(_refMs)) : null;
    if (!_annual) { var _ny = new Date(_refMs).getUTCFullYear(), _yo = ((_ny - 4) % 60 + 60) % 60; _annual = {gan:TG10[_yo % 10],zhi:DZ12[_yo % 12],gz:TG10[_yo % 10]+DZ12[_yo % 12],year:_ny,boundary:'立春近似'}; }
    bazi.liuYue = baziCalcLiuYue(bazi, _annual.gan, _annual.zhi, bazi.wuxingStance);
    bazi.liuNianGZ = _annual.gz;
    bazi.liuNianPeriod = {year:_annual.year,boundary:_annual.boundary||'立春'};
  } catch(e) { bazi.liuYue = []; }

  // 13. 旺衰矛盾說明（得令卻弱…）
  try { bazi.strengthNote = baziStrengthNote(bazi); } catch(e) { bazi.strengthNote = null; }

  // 14. 大運喜忌標記（干支十年共同作用；前後段僅為常用觀察慣例，非唯一正統）
  try {
    var _st = bazi.wuxingStance;
    if (_st && _st.map && Array.isArray(bazi.dayun)) {
      var _lab = function (e) { var v = _st.map[e]; return v === '喜' ? '順' : (v === '忌' ? '背' : '平'); };
      bazi.dayun.forEach(function (d) {
        if (!d || !d.gz || d.gz === '小運' || d.gz.length < 2) return;
        var ganEl = WX_MAP[d.gz.charAt(0)], zhiEl = WX_MAP[d.gz.charAt(1)];
        var g = _lab(ganEl), z = _lab(zhiEl);
        d.luckLabel = (g === z) ? (g === '順' ? '偏順' : (g === '背' ? '偏逆' : '平')) : ('干' + g + '／支' + z);
        d.luckByStance = { gan: g, zhi: z, ganEl: ganEl, zhiEl: zhiEl };
        // 干支整步十年都作用；「前段偏重干、後段偏重支」僅作常用觀察慣例，日期依精確交運點切分。
        if (d.isCurrent && d.startDate && d.midDate && d.endDateExclusive) {
          var _parseUtc = function (x) { return Date.parse(String(x).replace(' ','T')+'Z'); };
          var _nowMs = isFinite(bazi._referenceTimestamp) ? bazi._referenceTimestamp : Date.now();
          var _midMs = _parseUtc(d.midDate), _endMs = _parseUtc(d.endDateExclusive);
          var inSecond = isFinite(_midMs) ? _nowMs >= _midMs : false;
          var _until = inSecond ? d.endDateExclusive : d.midDate;
          d.phaseNow = {
            half: inSecond ? '後段（地支側重）' : '前段（天干側重）',
            gz: inSecond ? d.gz.charAt(1) : d.gz.charAt(0),
            el: inSecond ? zhiEl : ganEl,
            luck: inSecond ? z : g,
            god: inSecond ? (d.zGod || '') : (d.god || ''),
            untilDate: _until,
            untilYear: parseInt(String(_until).slice(0,4),10),
            nextGz: inSecond ? null : d.gz.charAt(1),
            nextEl: inSecond ? null : zhiEl,
            nextLuck: inSecond ? null : z,
            model:'FIVE_YEAR_EMPHASIS_HEURISTIC',
            disclaimer:'大運天干、地支十年全程共同作用；前後五年僅表示側重觀察，不是截然切斷。'
          };
        }
      });
      // v80.30：交脫後「下一步大運」順背直接給資料（鐵律④的資料面）
      for (var _di = 0; _di < bazi.dayun.length; _di++) {
        var _dc = bazi.dayun[_di];
        if (_dc && _dc.isCurrent && _dc.phaseNow) {
          var _dn = bazi.dayun[_di + 1];
          if (_dn && _dn.gz && _dn.gz !== '小運' && _dn.gz.length >= 2) {
            _dc.phaseNow.nextDaYun = { gz: _dn.gz, luckLabel: _dn.luckLabel || '' };
            // v80.32：連續同向喜用大運聚合——下一步若為吉，往後累計連走的吉運步數與年數
            if ((_dn.luckLabel || '') === '偏順') {
              var _runGz = [_dn.gz], _runYears = (_dn.ageEnd - _dn.ageStart + 1) || 10;
              for (var _dj = _di + 2; _dj < bazi.dayun.length; _dj++) {
                var _dx = bazi.dayun[_dj];
                if (_dx && (_dx.luckLabel || '') === '偏順' && _dx.gz && _dx.gz.length >= 2) {
                  _runGz.push(_dx.gz); _runYears += (_dx.ageEnd - _dx.ageStart + 1) || 10;
                } else break;
              }
              if (_runGz.length >= 2) _dc.phaseNow.nextDaYun.run = { gzList: _runGz, years: _runYears };
            }
          }
          break;
        }
      }
    }
  } catch(e) {}

  return bazi;
}
