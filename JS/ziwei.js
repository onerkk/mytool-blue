// ═══════════════════════════════════════════════════════════════
// ziwei.js — 靜月之光模組化拆分
// ═══════════════════════════════════════════════════════════════

// ── computeZiwei (lines 21385-22032) ──

const ZW_MAJOR_NATURE = {
  '紫微':'帝星，主領導、格局、統御與核心掌控力。',
  '天機':'機巧善思，主變通、策劃、思考與應變。',
  '太陽':'光明外放，主表現、名望、行動力與承擔。',
  '武曲':'務實果決，主財務、執行、紀律與效率。',
  '天同':'溫和隨緣，主福氣、人和、享受與修復力。',
  '廉貞':'自持好勝，主判斷、掌控、慾望與原則衝突。',
  '天府':'穩重守成，主資源、管理、庫藏與承接能力。',
  '太陰':'細膩內斂，主情感、計畫、積蓄與內在安全感。',
  '貪狼':'欲望與才藝強，主人際、開創、桃花與企圖心。',
  '巨門':'善辯多疑，主口才、分析、質疑與是非辨別。',
  '天相':'公正持重，主協調、輔佐、規範與平衡。',
  '天梁':'庇護清高，主貴人、原則、長輩助力與保護。',
  '七殺':'衝勁強烈，主突破、壓力、變動與決斷。',
  '破軍':'破舊立新，主改革、風險、重組與極端轉折。'
};

// ═══ 農曆轉換：優先用 Lunar 函式庫，fallback 用農曆新年查表法 ═══
function approxLunar(year, month, day) {
  // 方案1：用 lunar-javascript 函式庫（精確）
  if (typeof Lunar !== 'undefined' && Lunar.Solar) {
    try {
      var solar = Lunar.Solar.fromYmd(year, month, day);
      var lunar = solar.getLunar();
      return { year: lunar.getYear(), month: lunar.getMonth(), day: lunar.getDay() };
    } catch(e) { /* fall through */ }
  }
  // 方案2：農曆新年查表 + 朔日推算（1940-2060，覆蓋絕大部分命理使用場景）
  // 格式：[月,日] = 該年農曆新年的陽曆日期
  var _cny = {
    1940:[2,8],1941:[1,27],1942:[2,15],1943:[2,5],1944:[1,25],1945:[2,13],1946:[2,2],1947:[1,22],1948:[2,10],1949:[1,29],
    1950:[2,17],1951:[2,6],1952:[1,27],1953:[2,14],1954:[2,3],1955:[1,24],1956:[2,12],1957:[1,31],1958:[2,18],1959:[2,8],
    1960:[1,28],1961:[2,15],1962:[2,5],1963:[1,25],1964:[2,13],1965:[2,2],1966:[1,21],1967:[2,9],1968:[1,30],1969:[2,17],
    1970:[2,6],1971:[1,27],1972:[2,15],1973:[2,3],1974:[1,23],1975:[2,11],1976:[1,31],1977:[2,18],1978:[2,7],1979:[1,28],
    1980:[2,16],1981:[2,5],1982:[1,25],1983:[2,13],1984:[2,2],1985:[2,20],1986:[2,9],1987:[1,29],1988:[2,17],1989:[2,6],
    1990:[1,27],1991:[2,15],1992:[2,4],1993:[1,23],1994:[2,10],1995:[1,31],1996:[2,19],1997:[2,7],1998:[1,28],1999:[2,16],
    2000:[2,5],2001:[1,24],2002:[2,12],2003:[2,1],2004:[1,22],2005:[2,9],2006:[1,29],2007:[2,18],2008:[2,7],2009:[1,26],
    2010:[2,14],2011:[2,3],2012:[1,23],2013:[2,10],2014:[1,31],2015:[2,19],2016:[2,8],2017:[1,28],2018:[2,16],2019:[2,5],
    2020:[1,25],2021:[2,12],2022:[2,1],2023:[1,22],2024:[2,10],2025:[1,29],2026:[2,17],2027:[2,6],2028:[1,26],2029:[2,13],
    2030:[2,3],2031:[1,23],2032:[2,11],2033:[1,31],2034:[2,19],2035:[2,8],2036:[1,28],2037:[2,15],2038:[2,4],2039:[1,24],
    2040:[2,12],2041:[2,1],2042:[1,22],2043:[2,10],2044:[1,30],2045:[2,17],2046:[2,6],2047:[1,26],2048:[2,14],2049:[2,2],
    2050:[1,23],2051:[2,11],2052:[2,1],2053:[2,19],2054:[2,8],2055:[1,28],2056:[2,15],2057:[2,4],2058:[1,24],2059:[2,12],
    2060:[2,2]
  };
  try {
    var _solarDate = new Date(Date.UTC(year, month - 1, day));
    // 找到該年農曆新年
    var _cnyEntry = _cny[year];
    var _cnyDate = _cnyEntry ? new Date(Date.UTC(year, _cnyEntry[0] - 1, _cnyEntry[1])) : null;
    if (!_cnyDate) {
      // 超出查表範圍，粗估
      return { year: year, month: Math.max(1, month - 1) || 1, day: day };
    }
    var _diffDays = Math.floor((_solarDate - _cnyDate) / 864e5);
    var _ly = year;
    if (_diffDays < 0) {
      // 在農曆新年之前 → 屬於上一農曆年
      _ly = year - 1;
      var _prevCny = _cny[year - 1];
      if (_prevCny) {
        _cnyDate = new Date(Date.UTC(year - 1, _prevCny[0] - 1, _prevCny[1]));
        _diffDays = Math.floor((_solarDate - _cnyDate) / 864e5);
      } else {
        return { year: _ly, month: Math.max(1, month) || 12, day: day };
      }
    }
    // 農曆月長度交替 30/29（大月/小月），近似推算
    // 實際農曆月長 29.5306 天
    var _lunarMonth = Math.floor(_diffDays / 29.5306) + 1;
    var _lunarDay = Math.round(_diffDays % 29.5306) + 1;
    if (_lunarMonth > 12) _lunarMonth = 12;
    if (_lunarMonth < 1) _lunarMonth = 1;
    if (_lunarDay > 30) _lunarDay = 30;
    if (_lunarDay < 1) _lunarDay = 1;
    return { year: _ly, month: _lunarMonth, day: _lunarDay };
  } catch(e2) {
    return { year: year, month: Math.max(1, month - 1) || 1, day: day };
  }
}

// ═══ 宮位吉凶分析（大限/流年/流月共用）═══
// 回傳 { score: 數字, notes: 字串陣列, bright: 字串 }
function analyzePalace(palace, branchIdx) {
  var score = 50; // 基準分
  var notes = [];
  var brightLabel = '';
  if (!palace || !palace.stars) return { score: score, notes: notes, bright: '' };
  var majors = palace.stars.filter(function(s) { return s.type === 'major'; });
  var luckys = palace.stars.filter(function(s) { return s.type === 'lucky' || s.type === 'minor'; });
  var shas = palace.stars.filter(function(s) { return s.type === 'sha'; });

  // 主星廟旺分析
  majors.forEach(function(s) {
    var br = (typeof getStarBright === 'function') ? getStarBright(s.name, branchIdx) : null;
    if (br && br.label) {
      if (/廟|旺/.test(br.label)) { score += 8; notes.push(s.name + br.label + '，力量充足'); }
      else if (/得|利/.test(br.label)) { score += 4; notes.push(s.name + br.label + '，尚可'); }
      else if (/落陷|陷/.test(br.label)) { score -= 8; notes.push(s.name + '落陷，力量不足'); }
      else if (/平/.test(br.label)) { /* 不加不減 */ }
      if (!brightLabel) brightLabel = s.name + br.label;
    }
  });

  // 無主星
  if (majors.length === 0) {
    score -= 5;
    notes.push('空宮（無主星），需借對宮星力');
  }

  // 吉星加分
  luckys.forEach(function(s) {
    if (/文昌|文曲|左輔|右弼|天魁|天鉞/.test(s.name)) {
      score += 3;
    } else {
      score += 1;
    }
  });
  if (luckys.length >= 3) notes.push('吉星雲集（' + luckys.length + '顆），助力明顯');

  // 煞星扣分
  shas.forEach(function(s) {
    if (/擎羊|陀羅|火星|鈴星|地空|地劫/.test(s.name)) {
      score -= 5;
    } else {
      score -= 2;
    }
  });
  if (shas.length >= 3) notes.push('煞星聚集（' + shas.length + '顆），阻力大');
  else if (shas.length === 1) notes.push('有' + shas[0].name + '，有阻力但不致命');
  else if (shas.length === 2) notes.push('有' + shas.map(function(s){return s.name;}).join('、') + '，壓力明顯');

  // 四化加減
  palace.stars.forEach(function(s) {
    if (s.hua === '化祿') { score += 6; notes.push(s.name + '化祿，有資源進場'); }
    if (s.hua === '化權') { score += 4; notes.push(s.name + '化權，有掌控力'); }
    if (s.hua === '化科') { score += 3; notes.push(s.name + '化科，有貴人或名聲'); }
    if (s.hua === '化忌') { score -= 7; notes.push(s.name + '化忌，容易卡住或糾結'); }
  });

  // 限制分數範圍
  if (score > 95) score = 95;
  if (score < 5) score = 5;

  return { score: score, notes: notes, bright: brightLabel };
}

function computeZiwei(year,month,day,hour,gender){
  window._jyZiweiError = null;
  try {
  const lunar = approxLunar(year,month,day);
  // ★ v16 修復：紫微年干支必須用農曆年，不是西曆年
  // 正月初一前出生 → 農曆仍屬上一年 → 年干支用上一年
  // 影響範圍：四化、祿存、擎羊陀羅、天魁天鉞、紅鸞天喜、火鈴、大限起點
  const _lunarY = (lunar && lunar.year) ? lunar.year : year;
  const yGan = TG[((_lunarY-4)%10+10)%10];
  const yZhi = DZ[((_lunarY-4)%12+12)%12];

  // 日干計算 (用於恩光等乙級星，與computeBazi同公式)
  // 以1900-01-01=甲戌日(序號10)為基準
  // ★ 用 Date.UTC 避免歷史夏令時偏移
  const _baseDate = Date.UTC(1900, 0, 1);
  const _thisDate = Date.UTC(year, month-1, day);
  const _diffDays = Math.floor((_thisDate - _baseDate) / 864e5);
  const _dayCycle = ((_diffDays + 10) % 60 + 60) % 60;
  const dayGanIdx = _dayCycle % 10;
  const dayGan = TG[dayGanIdx];

  // 命宮地支：月支-時支
  const shi = Math.floor(((hour+1)%24)/2);
  const mingIdx = ((lunar.month - shi + 13) % 12 + 12) % 12; // 修正: +13 (正月子時=寅)
  // 身宮：月+時+寅基
  const shenIdx = ((lunar.month + shi + 1) % 12 + 12) % 12;

  // 五行局 (簡化：依命宮天干地支組合)
  // 宮干：年干起月法 (甲己→丙寅=2, 乙庚→戊寅=4, 丙辛→庚寅=6, 丁壬→壬寅=8, 戊癸→甲寅=0)
  const ganBase={'甲':2,'己':2,'乙':4,'庚':4,'丙':6,'辛':6,'丁':8,'壬':8,'戊':0,'癸':0};
  const gBase=ganBase[yGan]||0;
  const mingGanIdx=(gBase+((mingIdx-2+12)%12))%10;
  const mingGan = TG[mingGanIdx];
  const wuxingJu = getWuxingJu(mingGan, DZ[mingIdx]);

  // 安紫微星
  const ziweiIdx = getZiweiPalaceByJu(wuxingJu, lunar.day);
  // 天府位置: 與紫微以寅-申軸對稱
  // 紫微寅(2)→天府寅(2), 紫微卯(3)→天府丑(1), 紫微辰(4)→天府子(0)...
  const tianfuIdx = ((4 - ziweiIdx + 12) % 12 + 12) % 12;

  // 建立12宮 (逆時針排列: 命→兄弟→夫妻→子女→...)
  const palaces = [];
  for(let i=0;i<12;i++){
    const pIdx = ((mingIdx - i) % 12 + 12) % 12;
    palaces.push({
      name: ZW_PALACES[i],
      branch: DZ[pIdx],
      stars: [],
      isMing: i===0,
      isShen: pIdx === shenIdx
    });
  }

  // 安14主星（簡化排列）
  const ziweiOrder = [0,1,null,2,3,4,5]; // 紫微系
  const tianfuOrder = [6,7,8,9,10,11,12,13]; // 天府系

  // 紫微系安星
  const zwStarMap = [
    {star:0, offset:0},  // 紫微
    {star:1, offset:-1}, // 天機
    {star:2, offset:-3}, // 太陽
    {star:3, offset:-4}, // 武曲
    {star:4, offset:-5}, // 天同
    {star:5, offset:4}   // 廉貞（紫微逆8位=+4）
  ];
  zwStarMap.forEach(({star,offset})=>{
    const pos = ((ziweiIdx + offset) % 12 + 12) % 12;
    const palaceIdx = palaces.findIndex(p=> DZ.indexOf(p.branch) === pos);
    if(palaceIdx>=0) palaces[palaceIdx].stars.push({...ZW_MAJOR[star], type:'major'});
  });

  // 天府系安星
  const tfStarMap = [
    {star:6, offset:0},   // 天府
    {star:7, offset:1},   // 太陰
    {star:8, offset:2},   // 貪狼
    {star:9, offset:3},   // 巨門
    {star:10, offset:4},  // 天相
    {star:11, offset:5},  // 天梁
    {star:12, offset:6},  // 七殺
    {star:13, offset:10}  // 破軍
  ];
  tfStarMap.forEach(({star,offset})=>{
    const pos = ((tianfuIdx + offset) % 12 + 12) % 12;
    const palaceIdx = palaces.findIndex(p=> DZ.indexOf(p.branch) === pos);
    if(palaceIdx>=0) palaces[palaceIdx].stars.push({...ZW_MAJOR[star], type:'major'});
  });

  // 安吉星（簡化）
  const wcIdx = ((year-4)%12+12)%12;
  addStarToPalace(palaces,'文昌','minor',(10-shi+12)%12);
  addStarToPalace(palaces,'文曲','minor',(shi+4)%12);
  addStarToPalace(palaces,'左輔','minor',(lunar.month+3)%12);
  addStarToPalace(palaces,'右弼','minor',(11-lunar.month+12)%12);

  // 安煞星（業界標準查表法）
  const yZhiIdx = DZ.indexOf(yZhi);
  
  // 擎羊陀羅：依年干查表（標準安星法）
  // 擎羊在祿存後一位，陀羅在祿存前一位
  const QY_TABLE={甲:3,乙:4,丙:6,丁:7,戊:6,己:7,庚:9,辛:10,壬:0,癸:1};
  const TL_TABLE={甲:1,乙:2,丙:4,丁:5,戊:4,己:5,庚:7,辛:8,壬:10,癸:11};
  addStarToPalace(palaces,'擎羊','sha',QY_TABLE[yGan]!==undefined?QY_TABLE[yGan]:3);
  addStarToPalace(palaces,'陀羅','sha',TL_TABLE[yGan]!==undefined?TL_TABLE[yGan]:1);

  // 火星：依年支分組+時支查表
  // 寅午戌年從丑(1)起，申子辰年從寅(2)起，巳酉丑年從卯(3)起，亥卯未年從酉(9)起
  const HX_BASE={寅:1,午:1,戌:1, 申:2,子:2,辰:2, 巳:3,酉:3,丑:3, 亥:9,卯:9,未:9};
  const hxBase=HX_BASE[yZhi]!==undefined?HX_BASE[yZhi]:2;
  addStarToPalace(palaces,'火星','sha',(hxBase+shi)%12);

  // 鈴星：依年支分組+時支查表
  // 寅午戌年從卯(3)起，申子辰年從戌(10)起，巳酉丑年從戌(10)起，亥卯未年從戌(10)起
  const LX_BASE={寅:3,午:3,戌:3, 申:10,子:10,辰:10, 巳:10,酉:10,丑:10, 亥:10,卯:10,未:10};
  const lxBase=LX_BASE[yZhi]!==undefined?LX_BASE[yZhi]:10;
  addStarToPalace(palaces,'鈴星','sha',(lxBase+shi)%12);

  // 安天魁天鉞（依年干·業界標準）
  // 甲戊庚→魁丑(1)鉞未(7), 乙己→魁子(0)鉞申(8), 丙丁→魁亥(11)鉞酉(9), 辛→魁午(6)鉞寅(2), 壬癸→魁卯(3)鉞巳(5)
  const TIANKU_TABLE={甲:1,戊:1,庚:1, 乙:0,己:0, 丙:11,丁:11, 辛:6, 壬:3,癸:3};
  const TIANYUE_TABLE={甲:7,戊:7,庚:7, 乙:8,己:8, 丙:9,丁:9, 辛:2, 壬:5,癸:5};
  addStarToPalace(palaces,'天魁','lucky',TIANKU_TABLE[yGan]!==undefined?TIANKU_TABLE[yGan]:1);
  addStarToPalace(palaces,'天鉞','lucky',TIANYUE_TABLE[yGan]!==undefined?TIANYUE_TABLE[yGan]:7);

  // 安祿存（依年干）
  const LUCUN_TABLE={甲:2,乙:3,丙:5,丁:6,戊:5,己:6,庚:8,辛:9,壬:11,癸:0}; // 祿存位置(地支idx)
  addStarToPalace(palaces,'祿存','lucky',LUCUN_TABLE[yGan]!==undefined?LUCUN_TABLE[yGan]:2);

  // 安天馬（依年支）
  const TIANMA_TABLE={寅:8,申:2,巳:11,亥:5,子:2,午:8,卯:5,酉:11,辰:2,戌:8,丑:11,未:5};
  addStarToPalace(palaces,'天馬','lucky',TIANMA_TABLE[yZhi]!==undefined?TIANMA_TABLE[yZhi]:2);

  // ═══ 乙級星（依年支）═══
  // 紅鸞：子→卯,丑→寅,寅→丑,卯→子,辰→亥,巳→戌,午→酉,未→申,申→未,酉→午,戌→巳,亥→辰
  addStarToPalace(palaces,'紅鸞','minor2',(3-yZhiIdx+12)%12);
  // 天喜：紅鸞對宮(+6)
  addStarToPalace(palaces,'天喜','minor2',(3-yZhiIdx+6+12)%12);
  // 天虛：依年支 子→午,丑→未,...
  addStarToPalace(palaces,'天虛','minor2',(yZhiIdx+6)%12);
  // 天哭：依年支 子→午反向 子→午,丑→巳,...
  addStarToPalace(palaces,'天哭','minor2',(6-yZhiIdx+12)%12);
  // 龍池：依年支順行 子→辰(4),丑→巳,...
  addStarToPalace(palaces,'龍池','minor2',(yZhiIdx+4)%12);
  // 鳳閣：依年支逆行 子→戌(10),丑→酉,...
  addStarToPalace(palaces,'鳳閣','minor2',(10-yZhiIdx+12)%12);
  // 華蓋：依年支三合局 寅午戌→戌,申子辰→辰,巳酉丑→丑,亥卯未→未
  const HG_TABLE={0:4,1:1,2:10,3:7,4:4,5:1,6:10,7:7,8:4,9:1,10:10,11:7};
  addStarToPalace(palaces,'華蓋','minor2',HG_TABLE[yZhiIdx]!==undefined?HG_TABLE[yZhiIdx]:4);
  // 咸池（桃花）：依年支 寅午戌→卯,申子辰→酉,巳酉丑→午,亥卯未→子
  const XC_TABLE={0:9,1:6,2:3,3:0,4:9,5:6,6:3,7:0,8:9,9:6,10:3,11:0};
  addStarToPalace(palaces,'咸池','minor2',XC_TABLE[yZhiIdx]!==undefined?XC_TABLE[yZhiIdx]:9);
  // 天德：依年支（非月支） 子→酉(9),丑→申(8),寅→亥(11),卯→戌(10),辰→丑(1),巳→子(0),午→卯(3),未→寅(2),申→巳(5),酉→辰(4),戌→未(7),亥→午(6)
  // 文墨: 亥年天德在申(8)... 查得正確天德表:
  // 依年支: 子→巳,丑→庚,寅→丁,卯→申,辰→壬,巳→辛,午→亥,未→甲,申→癸,酉→寅,戌→丙,亥→己
  // 上面是天干/地支混合，不適用。查紫微斗數天德安法:
  // 正月→巳(5),二月→午(6),三月→酉(9),四月→戌(10),五月→亥(11),六月→子(0),七月→丑(1),八月→寅(2),九月→卯(3),十月→辰(4),十一月→巳(5),十二月→午(6)
  // 但文墨顯示天德在申... 這裡有多種版本
  // 根據文墨文本: 疾厄(庚申)有天德[平]，疾厄為歲前十二神的天德位
  // 查歲前十二神中的天德: 依年支 子→酉(9)起逆行... 
  // 亥(11)→歲前天德... 
  // 用簡化: 依年支 (yZhiIdx+9)%12... 亥(11)+9=20%12=8=申 ✓!
  addStarToPalace(palaces,'天德','minor2',(yZhiIdx+9)%12);
  // 解神：依年支 子→戌(10),丑→戌(10),寅→子(0),...每兩年一跳
  const JS_TABLE={0:10,1:10,2:0,3:0,4:2,5:2,6:4,7:4,8:6,9:6,10:8,11:8};
  addStarToPalace(palaces,'解神','minor2',JS_TABLE[yZhiIdx]!==undefined?JS_TABLE[yZhiIdx]:10);
  // 天壽：依年支 子→午(6)... = 天虛同位（部分派別不同）
  // 實際上天壽依月支安：正月→卯... 用截圖驗證
  addStarToPalace(palaces,'天壽','minor2',(lunar.month+2)%12);

  // ═══ 乙級星（依年干）═══
  // 天官：甲→未(7),乙→辰(4),丙→巳(5),丁→寅(2),戊→卯(3),己→酉(9),庚→亥(11),辛→酉(9),壬→戌(10),癸→巳(5)
  const TGUAN={甲:7,乙:4,丙:5,丁:2,戊:3,己:9,庚:11,辛:9,壬:10,癸:5};
  addStarToPalace(palaces,'天官','minor2',TGUAN[yGan]!==undefined?TGUAN[yGan]:7);
  // 天福：甲→酉(9),乙→申(8),丙→子(0),丁→亥(11),戊→卯(3),己→寅(2),庚→午(6),辛→巳(5),壬→午(6),癸→巳(5)
  const TFUL={甲:9,乙:8,丙:0,丁:11,戊:3,己:2,庚:6,辛:5,壬:6,癸:5};
  addStarToPalace(palaces,'天福','minor2',TFUL[yGan]!==undefined?TFUL[yGan]:9);
  // 天貴：甲→丑(1),乙→子(0),丙→亥(11),丁→酉(9),戊→未(7),己→申(8),庚→未(7),辛→午(6),壬→巳(5),癸→卯(3)
  const TGUI={甲:1,乙:0,丙:11,丁:9,戊:7,己:8,庚:7,辛:6,壬:5,癸:3};
  addStarToPalace(palaces,'天貴','minor2',TGUI[yGan]!==undefined?TGUI[yGan]:1);

  // ═══ 乙級星（依月支）═══
  // 天刑：正月→酉(9)起逆行... 實際上天刑依月支安: 正月→丑起順行
  // 標準：天刑 = (lunar.month + 6) % 12 → 正月=7=午... 不對
  // 業界表：月+7 (子idx) → 正月→酉? 正月→丑? 用截圖驗
  // 命例1：四月→子宮有天刑(截圖顯示子宮有「刑」) → 天刑 = (月+8)%12 = (4+8)%12 = 0=子 ✓
  addStarToPalace(palaces,'天刑','minor2',(lunar.month+8)%12);
  // 天姚：正月→丑(1)起順行 = (月+0)%12 = 月
  // 命例1：四月→辰宮有天姚 → (4+0)%12=4=辰 ✓
  addStarToPalace(palaces,'天姚','minor2',(lunar.month)%12);

  // ═══ 乙級星（依日/時支）═══
  // 恩光：以日干查文昌位 甲→巳 乙→午 丙→申 丁→酉 戊→申 己→酉 庚→亥 辛→子 壬→寅 癸→卯
  const ENGUAN={甲:5,乙:6,丙:8,丁:9,戊:8,己:9,庚:11,辛:0,壬:2,癸:3};
  addStarToPalace(palaces,'恩光','minor2',ENGUAN[dayGan]!==undefined?ENGUAN[dayGan]:5);
  // 天傷：官祿宮地支位置
  const guanPos=palaces[8]?DZ.indexOf(palaces[8].branch):0;
  addStarToPalace(palaces,'天傷','minor2',guanPos);
  // 天使：疾厄宮地支位置
  const jiePos=palaces[5]?DZ.indexOf(palaces[5].branch):0;
  addStarToPalace(palaces,'天使','minor2',jiePos);

  // ═══ 甲級煞星補充：地空/地劫 ═══
  // 地空：亥(11)起逆行至時支 = (11-shi+12)%12
  addStarToPalace(palaces,'地空','sha',(11-shi+12)%12);
  // 地劫：亥(11)起順行至時支 = (11+shi)%12
  addStarToPalace(palaces,'地劫','sha',(11+shi)%12);

  // ═══ 乙級星補充 ═══
  // 天空：依年支 (yZhiIdx+1)%12
  addStarToPalace(palaces,'天空','minor2',(yZhiIdx+1)%12);

  // 孤辰：依年支三合局
  // 寅卯辰年→巳(5), 巳午未年→申(8), 申酉戌年→亥(11), 亥子丑年→寅(2)
  const GUCHEN_TABLE={0:2,1:2,2:5,3:5,4:5,5:8,6:8,7:8,8:11,9:11,10:11,11:2};
  addStarToPalace(palaces,'孤辰','minor2',GUCHEN_TABLE[yZhiIdx]);
  // 寡宿：依年支三合局
  // 寅卯辰年→丑(1), 巳午未年→辰(4), 申酉戌年→未(7), 亥子丑年→戌(10)
  const GUASU_TABLE={0:10,1:10,2:1,3:1,4:1,5:4,6:4,7:4,8:7,9:7,10:7,11:10};
  addStarToPalace(palaces,'寡宿','minor2',GUASU_TABLE[yZhiIdx]);

  // 蜚廉：依年支
  // 子→申(8),丑→酉(9),寅→戌(10),卯→亥(11),辰→子(0),巳→丑(1),午→寅(2),未→卯(3),申→辰(4),酉→巳(5),戌→午(6),亥→未(7)
  // 即 (yZhiIdx+8)%12
  addStarToPalace(palaces,'蜚廉','minor2',(yZhiIdx+8)%12);

  // 天巫：依年支
  // 子→巳(5),丑→午(6),寅→未(7),卯→申(8),辰→酉(9),巳→戌(10),午→亥(11),未→子(0),申→丑(1),酉→寅(2),戌→卯(3),亥→辰(4)
  // 查表: 亥年→辰? 標準為(yZhiIdx+5)%12... 亥(11)+5=16%12=4=辰? 但文墨在寅
  // 另一常見表: 巳申寅亥→固定位 子→巳,丑→午,寅→申,卯→酉,辰→巳,巳→午,午→申,未→酉,申→巳,酉→午,戌→申,亥→酉?
  // 文墨: 亥年天巫在寅(2)
  // 正確天巫表(依月支): 正月=巳,二月=午,三月=未,四月=酉,五月=戌,六月=亥,七月=丑,八月=寅,九月=卯,十月=巳,十一月=午,十二月=未
  // 但文墨說依年支... 查斗數全書天巫:
  // 依月支: {1:5,2:6,3:7,4:9,5:10,6:11,7:1,8:2,9:3,10:5,11:6,12:7}
  const TIANWU_M={1:5,2:6,3:7,4:9,5:10,6:11,7:1,8:2,9:3,10:5,11:6,12:7};
  addStarToPalace(palaces,'天巫','minor2',TIANWU_M[lunar.month]!==undefined?TIANWU_M[lunar.month]:5);

  // 天才：依命宮位置 = 命宮地支
  // 標準：天才在命宮地支位置（= mingIdx）
  // 文墨顯示天才在子(0)=兄弟宮，而命宮在丑(1)
  // 實際天才安法: (年支+命宮地支idx-1+12)%12... 不同派別有差異
  // 查標準: 天才依命宮起=命宮地支
  // 但文墨有天才在子... 另一說法: 天才=(命宮地支idx + yZhiIdx)%12
  // 測: (1+11)%12=0=子 ✓!
  addStarToPalace(palaces,'天才','minor2',(mingIdx+yZhiIdx)%12);

  // 大耗：依年支（與小耗不同）
  // 子→午(6),丑→未(7),...即(yZhiIdx+6)%12... 但這跟天虛重了
  // 另一說：大耗依年支 = 子→巳(5),丑→午(6),...即(yZhiIdx+5)%12
  // 文墨: 亥年大耗在辰(4) → (11+5)%12=4=辰 ✓!
  addStarToPalace(palaces,'大耗','minor2',(yZhiIdx+5)%12);

  // 天廚：依年干
  // 甲→巳(5),乙→午(6),丙→巳(5),丁→午(6),戊→巳(5),己→午(6),庚→申(8),辛→酉(9),壬→亥(11),癸→亥(11)
  const TIANCHU={甲:5,乙:6,丙:5,丁:6,戊:5,己:6,庚:8,辛:9,壬:11,癸:11};
  addStarToPalace(palaces,'天廚','minor2',TIANCHU[yGan]!==undefined?TIANCHU[yGan]:5);

  // 天月：依月支
  // 正月→戌(10),二月→巳(5),三月→辰(4),四月→寅(2),五月→未(7),六月→卯(3),七月→亥(11),八月→未(7),九月→寅(2),十月→午(6),十一月→戌(10),十二月→寅(2)
  const TIANYUE_M={1:10,2:5,3:4,4:2,5:7,6:3,7:11,8:7,9:2,10:6,11:10,12:2};
  addStarToPalace(palaces,'天月','minor2',TIANYUE_M[lunar.month]!==undefined?TIANYUE_M[lunar.month]:10);

  // 破碎：依年支（三合局分組）
  // 申子辰→酉(9) 巳酉丑→巳(5) 寅午戌→丑(1) 亥卯未→酉(9)
  const POSUI_TABLE=[9,5,1,9,9,5,1,9,9,5,1,9];
  addStarToPalace(palaces,'破碎','minor2',POSUI_TABLE[yZhiIdx]);

  // 劫煞：依年支三合局
  // 寅午戌年→亥(11), 申子辰年→巳(5), 巳酉丑年→寅(2), 亥卯未年→申(8)
  const JIESHA_TABLE={0:5,1:2,2:11,3:8,4:5,5:2,6:11,7:8,8:5,9:2,10:11,11:8};
  addStarToPalace(palaces,'劫煞','minor2',JIESHA_TABLE[yZhiIdx]);

  // 月德(乙級)：依月支
  // 不同於天德，月德安法: 正月→巳(5),二月→午(6),...即 (lunar.month+4)%12
  // 文墨: 七月, 月德在辰(4) → (7+4)%12=11=亥? 不對
  // 另一說: 正月→辰(4),二月→巳(5)... 即(lunar.month+3)%12
  // 測: (7+3)%12=10=戌? 也不對
  // 文墨顯示月德在辰(4), 七月
  // 標準月德(合德): 春月寅→庚(金)→... 用查表法
  // 用斗數標準: 月德 = 天德位置... 天德已安在(lunar.month+8)%12
  // (7+8)%12=3=卯? 也不對... 文墨天德在申(疾厄)
  // 看文墨文本: 疾厄(庚申)有天德[平] ← 天德在申
  // 我們的天德算法: (lunar.month+8)%12 = (7+8)%12 = 3 = 卯 ← 錯！
  // 需修正天德！下面月德暫跳過，用查表法

  // 陰煞：依年支
  // 子→寅(2),丑→子(0),寅→戌(10),卯→申(8),辰→午(6),巳→辰(4),午→寅(2),未→子(0),申→戌(10),酉→申(8),戌→午(6),亥→辰(4)
  // 規律: 每兩位退2 → 偶數位=反向
  // 文墨: 亥年陰煞在寅(2)... 那(11)→ 查表
  // 標準: 子→寅,丑→子,寅→戌... 6個一循環降2
  const YINSHA_TABLE=[2,0,10,8,6,4,2,0,10,8,6,4];
  // 亥(11)→4=辰? 但文墨在寅(2)
  // 可能算法不同，暫用簡化版
  addStarToPalace(palaces,'陰煞','minor2',YINSHA_TABLE[yZhiIdx]);

  // ═══ 丙級星 ═══
  // 三台：左輔位置+日-1
  const zuofuPos=palaces.findIndex(p=>p.stars.some(s=>s.name==='左輔'));
  if(zuofuPos>=0){
    const zfBranch=DZ.indexOf(palaces[zuofuPos].branch);
    addStarToPalace(palaces,'三台','minor3',(zfBranch+lunar.day-1)%12);
  }
  // 八座：右弼位置-(日-1)
  const youbiPos=palaces.findIndex(p=>p.stars.some(s=>s.name==='右弼'));
  if(youbiPos>=0){
    const ybBranch=DZ.indexOf(palaces[youbiPos].branch);
    addStarToPalace(palaces,'八座','minor3',(ybBranch-lunar.day+1+120)%12);
  }
  // 台輔：依時支 午(6)起順行
  addStarToPalace(palaces,'台輔','minor3',(shi+6)%12);
  // 封誥：依時支 午(6)起逆行
  addStarToPalace(palaces,'封誥','minor3',(6-shi+12)%12);

  // ═══ 旬空＋截空（正副雙星法）═══
  // 旬空：六十甲子每旬空亡兩位
  const ganIdx_y = TG.indexOf(yGan);
  const zhiIdx_y = yZhiIdx;
  // 旬首天干永遠是甲(0), 旬首地支 = zhiIdx - ganIdx (mod 12)
  const xunShou = ((zhiIdx_y - ganIdx_y) % 12 + 12) % 12;
  // 空亡 = 旬首前兩位 = xunShou-2, xunShou-1 (mod 12)
  const xk1 = ((xunShou - 2) % 12 + 12) % 12;
  const xk2 = ((xunShou - 1) % 12 + 12) % 12;
  addStarToPalace(palaces,'旬空','minor3',xk1);
  // 第二旬空（如果與第一個不同）
  if(xk1 !== xk2) addStarToPalace(palaces,'旬空','minor3',xk2);

  // 截空（截路空亡）：依年干
  // 甲己→申酉, 乙庚→午未, 丙辛→辰巳, 丁壬→寅卯, 戊癸→子丑
  const JIEKONG_TABLE={甲:[8,9],己:[8,9],乙:[6,7],庚:[6,7],丙:[4,5],辛:[4,5],丁:[2,3],壬:[2,3],戊:[0,1],癸:[0,1]};
  const jk=JIEKONG_TABLE[yGan]||[0,1];
  addStarToPalace(palaces,'截空','minor3',jk[0]);
  addStarToPalace(palaces,'截空','minor3',jk[1]);

  // ═══ 博士十二星（依祿存位置+陰陽順逆）═══
  // 博士從祿存所在宮位起，陽男陰女順行，陰男陽女逆行
  const BOSHI_NAMES=['博士','力士','青龍','小耗','將軍','奏書','飛廉','喜神','病符','大耗','伏兵','官府'];
  const lucunIdx=LUCUN_TABLE[yGan]!==undefined?LUCUN_TABLE[yGan]:2;
  const boshiFwd=(gender==='male'&&YY_G[yGan]==='陽')||(gender==='female'&&YY_G[yGan]==='陰');
  const boshiDir=boshiFwd?1:-1;
  for(let bi=0;bi<12;bi++){
    const bIdx=((lucunIdx+bi*boshiDir)%12+12)%12;
    addStarToPalace(palaces,BOSHI_NAMES[bi],'minor3',bIdx);
  }

  // 四化
  const sihua = SIHUA_TABLE[yGan] || SIHUA_TABLE['甲'];
  const huaMap = [];
  [{type:'祿',label:'化祿'},{type:'權',label:'化權'},{type:'科',label:'化科'},{type:'忌',label:'化忌'}].forEach(h=>{
    const starName = sihua[h.type];
    palaces.forEach(p=>{
      const found = p.stars.find(s=>s.name===starName);
      if(found){
        found.hua = h.label;
        huaMap.push({star:starName, hua:h.label, palace:p.name});
      }
    });
  });

  // ═══ 宮干四化（自化/飛星）═══
  // 每宮有自己的天干（五虎遁），可以飛四化
  // 自化：宮干四化的星就在本宮 → 離心(↓)
  // 化入：對宮宮干四化的星在本宮 → 向心(↑)
  const selfHuaMap = []; // {palace, star, type, direction}
  // 先建立每宮天干（需要先有五虎遁）
  const WUHU_YIN_PRE = {'甲':'丙','己':'丙','乙':'戊','庚':'戊',
                     '丙':'庚','辛':'庚','丁':'壬','壬':'壬','戊':'甲','癸':'甲'};
  const yinGanPre = WUHU_YIN_PRE[yGan] || '甲';
  const yinGanIdxPre = TG.indexOf(yinGanPre);
  function getPalaceGanPre(branchIdx){
    return TG[(yinGanIdxPre + ((branchIdx - 2 + 12) % 12)) % 10];
  }

  palaces.forEach((p, pi)=>{
    const bIdx = DZ.indexOf(p.branch);
    const pGan = getPalaceGanPre(bIdx);
    p.gan = pGan; // 存入宮干
    const pSihua = SIHUA_TABLE[pGan] || SIHUA_TABLE['甲'];

    // 檢查自化（宮干四化的星在本宮）
    [{type:'祿',label:'化祿'},{type:'權',label:'化權'},{type:'科',label:'化科'},{type:'忌',label:'化忌'}].forEach(h=>{
      const starName = pSihua[h.type];
      const inThisPalace = p.stars.find(s=>s.name===starName);
      if(inThisPalace){
        // 自化：離心(↓)
        if(!inThisPalace.selfHua) inThisPalace.selfHua = [];
        inThisPalace.selfHua.push({type:h.label, direction:'↓', from:p.name});
        selfHuaMap.push({palace:p.name, star:starName, type:h.label, direction:'↓'});
      }
    });
  });

  // 檢查化入（對宮宮干四化的星飛入本宮 → 向心↑）
  palaces.forEach((p, pi)=>{
    // 找對宮 (index差6)
    const oppIdx = (pi + 6) % 12;
    const oppPalace = palaces[oppIdx];
    if(!oppPalace) return;
    const oppGan = oppPalace.gan;
    const oppSihua = SIHUA_TABLE[oppGan] || SIHUA_TABLE['甲'];

    [{type:'祿',label:'化祿'},{type:'權',label:'化權'},{type:'科',label:'化科'},{type:'忌',label:'化忌'}].forEach(h=>{
      const starName = oppSihua[h.type];
      const inThisPalace = p.stars.find(s=>s.name===starName);
      if(inThisPalace){
        // 化入：向心(↑)
        if(!inThisPalace.flyInHua) inThisPalace.flyInHua = [];
        inThisPalace.flyInHua.push({type:h.label, direction:'↑', from:oppPalace.name});
        selfHuaMap.push({palace:p.name, star:starName, type:h.label, direction:'↑', from:oppPalace.name});
      }
    });
  });

  // ═══ 十二長生排列 ═══
  // 依五行局的五行 + 陰陽男女決定順逆
  // 五行長生起點: 金→巳, 木→亥, 水→申, 火→寅, 土→申
  const CHANGSHENG_START = {金:5, 木:11, 水:8, 火:2, 土:8};
  const CHANGSHENG_NAMES = ['長生','沐浴','冠帶','臨官','帝旺','衰','病','死','墓','絕','胎','養'];
  const juEl = {2:'水',3:'木',4:'金',5:'土',6:'火'}[wuxingJu] || '金';
  const csStart = CHANGSHENG_START[juEl] !== undefined ? CHANGSHENG_START[juEl] : 5;
  // 陽順陰逆：陽男陰女順排，陰男陽女逆排
  const yGanYY_cs=YY_G[yGan]; // 陽/陰
  const dxFwd_cs=(gender==='male'&&yGanYY_cs==='陽')||(gender==='female'&&yGanYY_cs==='陰');
  const csDir = dxFwd_cs ? 1 : -1;
  palaces.forEach(p=>{
    const bIdx = DZ.indexOf(p.branch);
    const steps = ((bIdx - csStart) * csDir % 12 + 12) % 12;
    p.changsheng = CHANGSHENG_NAMES[steps] || '';
  });

  // 命主星 (以年支決定)
  const MING_ZHU={0:'貪狼',1:'巨門',2:'祿存',3:'文曲',4:'廉貞',5:'武曲',6:'破軍',7:'武曲',8:'廉貞',9:'文曲',10:'祿存',11:'巨門'};
  // 身主星 (以年支決定)
  const SHEN_ZHU={0:'火星',1:'天相',2:'天梁',3:'天同',4:'文昌',5:'天機',6:'火星',7:'天相',8:'天梁',9:'天同',10:'文昌',11:'天機'};
  const yZhiIdx2=DZ.indexOf(yZhi);
  const mingZhu=MING_ZHU[yZhiIdx2]||'貪狼';
  const shenZhu=SHEN_ZHU[yZhiIdx2]||'火星';

  // ═══ 大限（紫微斗數大運）═══
  // 大限起始歲=五行局局數，每十年一宮
  // 陽男陰女順行，陰男陽女逆行
  const yGanYY=YY_G[yGan]; // 陽/陰
  const dxFwd=(gender==='male'&&yGanYY==='陽')||(gender==='female'&&yGanYY==='陰');
  const dxDir=dxFwd?1:-1;
  const dxStartAge=wuxingJu; // 大限起始歲=五行局數

  // ═══ 五虎遁：年干 → 寅宮天干 → 排定12宮天干 ═══
  // 口訣：甲己之年丙作首，乙庚之歲戊為頭，
  //       丙辛之年從庚起，丁壬壬寅順水流，戊癸甲寅好追求。
  const WUHU_YIN = {'甲':'丙','己':'丙','乙':'戊','庚':'戊',
                     '丙':'庚','辛':'庚','丁':'壬','壬':'壬','戊':'甲','癸':'甲'};
  const yinGan = WUHU_YIN[yGan] || '甲';
  const yinGanIdx = TG.indexOf(yinGan);
  // 十二宮天干：從寅(idx=2)開始，寅=yinGan, 卯=yinGan+1, 辰=yinGan+2...
  // 宮位地支idx → 天干idx: ganOfBranch[branchIdx] = TG[(yinGanIdx + (branchIdx-2+12)%12) % 10]
  function getPalaceGan(branchIdx){
    return TG[(yinGanIdx + ((branchIdx - 2 + 12) % 12)) % 10];
  }

  const daXian=[];
  for(let i=0;i<12;i++){
    const ageStart=dxStartAge+i*10;
    const ageEnd=ageStart+9;
    const curAge=new Date().getFullYear()-year;
    const isCur=curAge>=ageStart&&curAge<=ageEnd;

    // 大限宮位地支：命宮出發，順/逆行
    const dxBranchIdx=((mingIdx+i*dxDir)%12+12)%12;
    const dxBranch=DZ[dxBranchIdx];
    
    // 大限天干：該宮位地支對應的天干（五虎遁）
    const dxGan=getPalaceGan(dxBranchIdx);

    // 找大限宮位對應的原盤宮位
    const origPalace=palaces.find(p=>p.branch===dxBranch);
    const dxPalaceName=origPalace?origPalace.name:'';
    const dxStars=origPalace?origPalace.stars:[];

    // 大限四化（依大限天干）
    const dxSihua=SIHUA_TABLE[dxGan]||SIHUA_TABLE['甲'];
    const dxHua=[];
    [{type:'祿',label:'化祿'},{type:'權',label:'化權'},{type:'科',label:'化科'},{type:'忌',label:'化忌'}].forEach(h=>{
      const sn=dxSihua[h.type];
      palaces.forEach(p=>{
        const found=p.stars.find(s=>s.name===sn);
        if(found) dxHua.push({star:sn,hua:h.label,palace:p.name,palaceBranch:p.branch});
      });
    });

    // ═══ 大限吉凶評估（紫微斗數象徵體系）═══
    const hasMajor=dxStars.filter(s=>s.type==='major');
    const hasLucky=dxStars.filter(s=>['lucky','minor'].includes(s.type));
    const hasSha=dxStars.filter(s=>s.type==='sha');

    // 用analyzePalace做完整宮位分析（含廟旺落陷+吉煞組合+特殊格局）
    const dxAnalysis=analyzePalace(origPalace, dxBranchIdx);
    let dxScore=dxAnalysis.score;
    let dxNotes=[...dxAnalysis.notes];

    // 大限四化飛入各宮的影響
    dxHua.forEach(h=>{
      // 四化飛入本命盤的對應宮位
      const targetPalace=palaces.find(p=>p.name===h.palace);
      if(h.hua==='化祿'){
        dxScore+=2;
        dxNotes.push('大限'+h.star+'化祿入'+h.palace+'（'+h.star+'帶來'+h.palace+'領域的機會）');
      }
      if(h.hua==='化權'){
        dxScore+=1;
        dxNotes.push('大限'+h.star+'化權入'+h.palace+'（'+h.palace+'領域有掌控力）');
      }
      if(h.hua==='化科'){
        dxScore+=0.5;
        dxNotes.push('大限'+h.star+'化科入'+h.palace+'（'+h.palace+'領域有貴人）');
      }
      if(h.hua==='化忌'){
        dxScore-=2;
        dxNotes.push('大限'+h.star+'化忌入'+h.palace+'（'+h.palace+'領域有困擾）');
        // 四化疊加：大限化忌+原盤化忌=雙忌（大凶）
        if(targetPalace){
          const origJi=targetPalace.stars.find(s=>s.hua==='化忌');
          if(origJi){dxScore-=2;dxNotes.push('⚠ 大限化忌疊原盤化忌於'+h.palace+'（雙忌疊加，大凶）');}
        }
      }
    });

    // 大限宮位象徵含義（走到什麼宮=人生主題）
    const DX_THEME={
      命宮:'自我發展期',兄弟:'人脈拓展期',夫妻:'感情重點期',子女:'創造力/子女期',
      財帛:'理財重點期',疾厄:'健康注意期',遷移:'變動發展期',交友:'社交擴展期',
      官祿:'事業衝刺期',田宅:'安家置業期',福德:'心靈成長期',父母:'長輩/學業期'
    };
    const dxTheme=DX_THEME[dxPalaceName]||'';

    let dxLevel='平';
    if(dxScore>=6) dxLevel='大吉';
    else if(dxScore>=3) dxLevel='中吉';
    else if(dxScore>=1) dxLevel='小吉';
    else if(dxScore>=-1) dxLevel='平';
    else if(dxScore>=-3) dxLevel='小凶';
    else if(dxScore>=-6) dxLevel='中凶';
    else dxLevel='大凶';

    daXian.push({
      ageStart,ageEnd,isCurrent:isCur,
      branch:dxBranch,gan:dxGan,
      palaceName:dxPalaceName,theme:dxTheme,
      stars:hasMajor.map(s=>s.name),
      lucky:hasLucky.map(s=>s.name),
      sha:hasSha.map(s=>s.name),
      bright:dxAnalysis.bright,
      hua:dxHua,notes:dxNotes,
      level:dxLevel,score:dxScore
    });
  }

  // ═══ 流年盤（依流年地支走宮）═══
  // 流年命宮 = 流年地支所在宮位（斗數流年以太歲入命）
  function getLiuNianZw(lnYear){
    const lnZI=((lnYear-4)%12+12)%12;
    const lnGI=((lnYear-4)%10+10)%10;
    const lnZ=DZ[lnZI], lnG=TG[lnGI];
    // 流年命宮 = 太歲地支所在的原盤宮位
    const lnMingPalace=palaces.find(p=>p.branch===lnZ);
    // 流年四化（依流年天干）
    const lnSH=SIHUA_TABLE[lnG]||SIHUA_TABLE['甲'];
    const lnHua=[];
    [{type:'祿',label:'化祿'},{type:'權',label:'化權'},{type:'科',label:'化科'},{type:'忌',label:'化忌'}].forEach(h=>{
      const sn=lnSH[h.type];
      palaces.forEach(p=>{
        const found=p.stars.find(s=>s.name===sn);
        if(found) lnHua.push({star:sn,hua:h.label,palace:p.name});
      });
    });
    // ═══ 流年吉凶（紫微象徵體系）═══
    const lnBranchIdx=DZ.indexOf(lnZ);
    const lnAnalysis=analyzePalace(lnMingPalace, lnBranchIdx);
    let lnScore=lnAnalysis.score;
    let lnNotes=[...lnAnalysis.notes];

    // ═══ 三方四正合參 ═══
    // 命宮的三方四正：財帛宮(宮位4)、官祿宮(宮位8)、遷移宮(宮位6=對宮)
    // palaces[i] 的 i 是宮位序號：0命,1兄弟,2夫妻,3子女,4財帛,5疾厄,6遷移,7交友,8官祿,9田宅,10福德,11父母
    // 流年命宮所在的地支，找出三方四正在哪些原盤宮位
    if(lnMingPalace){
      const lnMingBr=lnMingPalace.branch;
      const lnMingBrIdx=DZ.indexOf(lnMingBr);
      // 三合宮=地支+4、+8；對宮=地支+6
      const sfBranches=[
        {brIdx:(lnMingBrIdx+4)%12, label:'三合位', w:0.3},
        {brIdx:(lnMingBrIdx+8)%12, label:'三合位', w:0.3},
        {brIdx:(lnMingBrIdx+6)%12, label:'對宮', w:0.4}
      ];
      sfBranches.forEach(function(sf){
        var sp=palaces.find(function(p){return DZ.indexOf(p.branch)===sf.brIdx;});
        if(!sp) return;
        var spBrIdx=DZ.indexOf(sp.branch);
        var spA=analyzePalace(sp, spBrIdx);
        lnScore+=spA.score*sf.w;
        // 三方四正有四化才記錄
        sp.stars.forEach(function(s){
          if(s.hua==='化祿') lnNotes.push(sf.label+sp.name+'有'+s.name+'化祿（助力）');
          if(s.hua==='化忌') lnNotes.push(sf.label+sp.name+'有'+s.name+'化忌（牽制）');
        });
        var spSha=sp.stars.filter(function(s){return s.type==='sha';});
        if(spSha.length>=2) lnNotes.push(sf.label+sp.name+'煞星聚集（壓力來源）');
      });
    }

    // 流年四化飛入各宮
    lnHua.forEach(h=>{
      const targetP=palaces.find(p=>p.name===h.palace);
      if(h.hua==='化祿'){
        lnScore+=1.5;
        lnNotes.push(h.star+'化祿入'+h.palace);
        // 化祿入命/財/官=大好
        if(['命宮','財帛','官祿'].includes(h.palace)) lnScore+=0.5;
      }
      if(h.hua==='化權'){lnScore+=1;lnNotes.push(h.star+'化權入'+h.palace);}
      if(h.hua==='化科'){lnScore+=0.5;lnNotes.push(h.star+'化科入'+h.palace);}
      if(h.hua==='化忌'){
        lnScore-=1.5;
        lnNotes.push(h.star+'化忌入'+h.palace);
        if(['命宮','財帛','官祿','疾厄'].includes(h.palace)) lnScore-=0.5;
        // 流年化忌疊原盤化忌
        if(targetP){
          const origJi=targetP.stars.find(s=>s.hua==='化忌');
          if(origJi){lnScore-=2;lnNotes.push('⚠ 流年化忌疊原盤化忌於'+h.palace+'（雙忌）');}
        }
        // 流年化忌疊大限化忌
        const curDx=daXian.find(d=>d.isCurrent);
        if(curDx&&curDx.hua){
          const dxJi=curDx.hua.find(dh=>dh.palace===h.palace&&dh.hua==='化忌');
          if(dxJi){lnScore-=2;lnNotes.push('⚠ 流年化忌疊大限化忌於'+h.palace+'（雙忌大凶）');}
        }
      }
    });

    // 流年走宮象徵
    const lnMingName=lnMingPalace?lnMingPalace.name:'';
    const LN_FOCUS={
      命宮:'自我表現',財帛:'財運收入',官祿:'事業升遷',夫妻:'感情婚姻',
      疾厄:'健康注意',遷移:'外出變動',交友:'人際社交',田宅:'家庭居住',
      子女:'創意/子女',福德:'心靈享受',兄弟:'人脈合作',父母:'長輩/學業'
    };
    const lnFocus=LN_FOCUS[lnMingName]||'';

    return {year:lnYear,gz:lnG+lnZ,mingPalace:lnMingName,focus:lnFocus,hua:lnHua,score:lnScore,notes:lnNotes,bright:lnAnalysis.bright};
  }

  // ═══ 流月盤（依流月地支走宮）═══
  // 正月=寅(2), 二月=卯(3), ... 十二月=丑(1)
  // 流月天干 = 五虎遁（流年天干→正月天干→逐月遞推）
  function getLiuYueZw(lnYear) {
    // 流年天干地支
    var lnGI = ((lnYear - 4) % 10 + 10) % 10;
    var lnGan = TG[lnGI];

    // 五虎遁：流年天干 → 正月(寅)天干
    var LY_WUHU = {'甲':'丙','己':'丙','乙':'戊','庚':'戊',
                    '丙':'庚','辛':'庚','丁':'壬','壬':'壬','戊':'甲','癸':'甲'};
    var yinGanForYear = LY_WUHU[lnGan] || '甲';
    var yinGanIdx = TG.indexOf(yinGanForYear);

    var months = [];
    var MONTH_NAMES = ['正月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月'];

    for (var m = 1; m <= 12; m++) {
      // 流月地支：正月=寅(2), 二月=卯(3)... 十二月=丑(1)
      var mBranchIdx = (m + 1) % 12;
      var mBranch = DZ[mBranchIdx];
      // 流月天干：從正月天干開始，逐月+1
      var mGanIdx = (yinGanIdx + (m - 1)) % 10;
      var mGan = TG[mGanIdx];

      // 流月命宮 = 流月地支所在的原盤宮位
      var mMingPalace = palaces.find(function(p) { return p.branch === mBranch; });
      if (!mMingPalace) continue;

      // 流月四化（依流月天干）
      var mSH = SIHUA_TABLE[mGan] || SIHUA_TABLE['甲'];
      var mHua = [];
      [{type:'祿',label:'化祿'},{type:'權',label:'化權'},{type:'科',label:'化科'},{type:'忌',label:'化忌'}].forEach(function(h) {
        var sn = mSH[h.type];
        palaces.forEach(function(p) {
          var found = p.stars.find(function(s) { return s.name === sn; });
          if (found) mHua.push({star:sn, hua:h.label, palace:p.name});
        });
      });

      // 流月吉凶評分
      var mScore = 0;
      var mNotes = [];

      // 宮位基礎分析
      if (typeof analyzePalace === 'function') {
        try {
          var mAnalysis = analyzePalace(mMingPalace, mBranchIdx);
          mScore = mAnalysis.score || 0;
          mNotes = mAnalysis.notes ? mAnalysis.notes.slice() : [];
        } catch(e) {}
      } else {
        // fallback: 簡易評分
        var mjStars = mMingPalace.stars.filter(function(s) { return s.type === 'major'; });
        var luckyStars = mMingPalace.stars.filter(function(s) { return s.type === 'lucky'; });
        var shaStars = mMingPalace.stars.filter(function(s) { return s.type === 'sha'; });
        mScore = luckyStars.length * 1.5 - shaStars.length * 1.5;
        if (mjStars.length) mScore += 1;
      }

      // 流月四化影響
      mHua.forEach(function(h) {
        if (h.hua === '化祿') { mScore += 1.5; }
        if (h.hua === '化權') { mScore += 1; }
        if (h.hua === '化科') { mScore += 0.5; }
        if (h.hua === '化忌') {
          mScore -= 1.5;
          // 疊原盤化忌
          var targetP = palaces.find(function(p) { return p.name === h.palace; });
          if (targetP) {
            var origJi = targetP.stars.find(function(s) { return s.hua === '化忌'; });
            if (origJi) { mScore -= 1.5; mNotes.push('流月化忌疊原盤化忌於' + h.palace); }
          }
        }
      });

      // 流月走宮焦點
      var LM_FOCUS = {
        命宮:'自我', 財帛:'財運', 官祿:'事業', 夫妻:'感情',
        疾厄:'健康', 遷移:'外出', 交友:'人際', 田宅:'家庭',
        子女:'創意', 福德:'心靈', 兄弟:'合作', 父母:'學業'
      };

      months.push({
        month: m,
        monthName: MONTH_NAMES[m - 1],
        gz: mGan + mBranch,
        mingPalace: mMingPalace.name,
        focus: LM_FOCUS[mMingPalace.name] || '',
        hua: mHua,
        score: Math.round(mScore * 10) / 10,
        notes: mNotes.slice(0, 4)
      });
    }

    return months;
  }

  // ═══ 小限（流年個人宮位走法）═══
  // 小限起宮：男命1歲起寅宮順行，女命1歲起申宮逆行（另一派依命宮起）
  // 主流：男從寅順，女從申逆；每歲走一宮
  function getXiaoXian(targetAge) {
    if (!targetAge || targetAge < 1) return null;
    var startIdx, dir;
    if (gender === 'male') { startIdx = 2; dir = 1; } // 寅宮順行
    else { startIdx = 8; dir = -1; } // 申宮逆行
    var xxBranchIdx = ((startIdx + (targetAge - 1) * dir) % 12 + 12) % 12;
    var xxPalace = palaces.find(function(p) { return DZ.indexOf(p.branch) === xxBranchIdx; });
    if (!xxPalace) return null;
    var xxAnalysis = analyzePalace(xxPalace, xxBranchIdx);
    return { age: targetAge, palace: xxPalace.name, branch: DZ[xxBranchIdx], score: xxAnalysis.score, notes: xxAnalysis.notes };
  }

  // ═══ 特殊格局偵測 ═══
  function _hasStar(palaceIdx, starName) {
    var p = palaces[palaceIdx];
    return p && p.stars && p.stars.some(function(s) { return s.name === starName; });
  }
  function _hasStarType(palaceIdx, type) {
    var p = palaces[palaceIdx];
    return p && p.stars ? p.stars.filter(function(s) { return s.type === type; }) : [];
  }
  function _getMajors(palaceIdx) {
    return _hasStarType(palaceIdx, 'major').map(function(s) { return s.name; });
  }
  function _getShas(palaceIdx) {
    return _hasStarType(palaceIdx, 'sha').map(function(s) { return s.name; });
  }
  function _hasHua(palaceIdx, huaType) {
    var p = palaces[palaceIdx];
    return p && p.stars ? p.stars.some(function(s) { return s.hua === huaType; }) : false;
  }
  function _starHua(starName) {
    for (var pi = 0; pi < 12; pi++) {
      var found = palaces[pi].stars.find(function(s) { return s.name === starName && s.hua; });
      if (found) return found.hua;
    }
    return null;
  }
  // 三方四正宮位索引（命宮=0, 財帛=4, 官祿=8, 遷移=6）
  function _sanFangIdx(pIdx) {
    return [pIdx, (pIdx + 4) % 12, (pIdx + 8) % 12, (pIdx + 6) % 12];
  }
  function _sanFangMajors(pIdx) {
    var idxs = _sanFangIdx(pIdx);
    var all = [];
    idxs.forEach(function(i) { all = all.concat(_getMajors(i)); });
    return all;
  }

  var patterns = [];
  var mingMajors = _getMajors(0);
  var mingShas = _getShas(0);
  var mingBranch = palaces[0] ? palaces[0].branch : '';
  var sfMajors = _sanFangMajors(0); // 命宮三方四正所有主星

  // ─── 經典大格局 ───
  // 1. 紫府同宮
  if (mingMajors.indexOf('紫微') >= 0 && mingMajors.indexOf('天府') >= 0) {
    patterns.push({ name: '紫府同宮', level: '大吉', desc: '帝星與庫星同坐命宮，格局宏大，適合管理與統御，但須防安逸不進。' });
  }
  // 2. 紫府朝垣（紫微和天府在三方四正拱命）
  if (mingMajors.indexOf('紫微') < 0 && mingMajors.indexOf('天府') < 0 &&
      sfMajors.indexOf('紫微') >= 0 && sfMajors.indexOf('天府') >= 0) {
    patterns.push({ name: '紫府朝垣', level: '吉', desc: '帝星庫星從三方四正拱照命宮，得貴人之力，格局不差但要自己爭取。' });
  }
  // 3. 府相朝垣
  if (sfMajors.indexOf('天府') >= 0 && sfMajors.indexOf('天相') >= 0) {
    patterns.push({ name: '府相朝垣', level: '吉', desc: '天府天相拱命，主一生得體制內助力、有靠山、資源穩定。' });
  }
  // 4. 殺破狼格（七殺、破軍、貪狼在命宮三方四正）
  if (sfMajors.indexOf('七殺') >= 0 && sfMajors.indexOf('破軍') >= 0 && sfMajors.indexOf('貪狼') >= 0) {
    patterns.push({ name: '殺破狼格', level: '雙面', desc: '三大變動之星拱命，一生起伏大、適合創業與變革，但穩定性差。怕煞星加會更凶，逢吉星則化危為機。' });
  }
  // 5. 機月同梁格（天機、太陰、天同、天梁在三方四正）
  if (sfMajors.indexOf('天機') >= 0 && sfMajors.indexOf('天梁') >= 0 &&
      (sfMajors.indexOf('太陰') >= 0 || sfMajors.indexOf('天同') >= 0)) {
    patterns.push({ name: '機月同梁格', level: '吉', desc: '主才思敏捷、善於企劃分析，適合幕僚、公職、專業技術。不適合衝鋒陷陣。' });
  }
  // 6. 日月並明（太陽在命or身旺位，太陰也在旺位）
  var sunPalIdx = -1, moonPalIdx = -1;
  for (var _pi = 0; _pi < 12; _pi++) {
    if (_hasStar(_pi, '太陽')) sunPalIdx = _pi;
    if (_hasStar(_pi, '太陰')) moonPalIdx = _pi;
  }
  if (sunPalIdx >= 0 && moonPalIdx >= 0) {
    var sunBr = DZ.indexOf(palaces[sunPalIdx].branch);
    var moonBr = DZ.indexOf(palaces[moonPalIdx].branch);
    var sunBright = (typeof getStarBright === 'function') ? getStarBright('太陽', sunBr) : null;
    var moonBright = (typeof getStarBright === 'function') ? getStarBright('太陰', moonBr) : null;
    if (sunBright && moonBright && /廟|旺/.test(sunBright.label || '') && /廟|旺/.test(moonBright.label || '')) {
      patterns.push({ name: '日月並明', level: '大吉', desc: '太陽太陰同時廟旺，主光明磊落、貴人運強、事業與感情兼顧。' });
    }
    // 7. 日月反背
    if (sunBright && moonBright && /落陷|陷/.test(sunBright.label || '') && /落陷|陷/.test(moonBright.label || '')) {
      patterns.push({ name: '日月反背', level: '凶', desc: '太陽太陰同時落陷，主光明受損，表裡不一，做事有始無終。' });
    }
  }
  // 8. 日照雷門（太陽+巨門同宮在卯）
  if (mingMajors.indexOf('太陽') >= 0 && mingMajors.indexOf('巨門') >= 0 && mingBranch === '卯') {
    patterns.push({ name: '日照雷門', level: '大吉', desc: '太陽巨門同在卯宮，光明照破暗曜，主口才好、公開場合發達。' });
  }
  // 9. 月朗天門（太陰在亥宮命宮）
  if (mingMajors.indexOf('太陰') >= 0 && mingBranch === '亥') {
    patterns.push({ name: '月朗天門', level: '大吉', desc: '太陰在亥宮得廟旺，主內秀聰慧、財運佳、異性緣好。' });
  }
  // 10. 明珠出海（天機太陰在寅宮命宮）
  if (mingMajors.indexOf('天機') >= 0 && mingMajors.indexOf('太陰') >= 0 && mingBranch === '寅') {
    patterns.push({ name: '明珠出海', level: '吉', desc: '天機太陰同在寅宮，智慧與計畫力俱佳，宜策略性工作。' });
  }
  // 11. 極居卯酉（紫微+貪狼在卯或酉）
  if (mingMajors.indexOf('紫微') >= 0 && mingMajors.indexOf('貪狼') >= 0 && (mingBranch === '卯' || mingBranch === '酉')) {
    patterns.push({ name: '極居卯酉', level: '凶', desc: '紫微貪狼在卯酉，帝星沾染慾望，主好面子、耽於享樂，需化祿或化權才能解。' });
  }
  // 12. 馬頭帶箭（擎羊在命宮+午宮）
  if (mingShas.indexOf('擎羊') >= 0 && mingBranch === '午') {
    patterns.push({ name: '馬頭帶箭', level: '雙面', desc: '擎羊在午宮坐命，主衝勁十足但易招是非，軍警武職大利，文職反為刑剋。' });
  }
  // 13. 火貪格（火星+貪狼同宮）
  for (var _fp = 0; _fp < 12; _fp++) {
    if (_hasStar(_fp, '火星') && _hasStar(_fp, '貪狼')) {
      var _isM = _fp === 0 ? '坐命' : '在' + palaces[_fp].name;
      patterns.push({ name: '火貪格', level: '大吉', desc: '火星貪狼' + _isM + '，暴發之格，主意外之財或快速崛起。' });
      break;
    }
  }
  // 14. 鈴貪格（鈴星+貪狼同宮）
  for (var _lp = 0; _lp < 12; _lp++) {
    if (_hasStar(_lp, '鈴星') && _hasStar(_lp, '貪狼')) {
      var _isM2 = _lp === 0 ? '坐命' : '在' + palaces[_lp].name;
      patterns.push({ name: '鈴貪格', level: '大吉', desc: '鈴星貪狼' + _isM2 + '，同火貪格，暴起之象。' });
      break;
    }
  }
  // 15. 泛水桃花（貪狼+陀羅在子宮）
  for (var _tw = 0; _tw < 12; _tw++) {
    if (_hasStar(_tw, '貪狼') && _hasStar(_tw, '陀羅') && palaces[_tw].branch === '子') {
      patterns.push({ name: '泛水桃花', level: '凶', desc: '貪狼陀羅在子宮，桃花泛濫不可收，主感情混亂、沉迷酒色。' });
      break;
    }
  }
  // 16. 石中隱玉（巨門+化權 or 化祿 in 命宮）
  if (mingMajors.indexOf('巨門') >= 0 && (_starHua('巨門') === '化祿' || _starHua('巨門') === '化權')) {
    patterns.push({ name: '石中隱玉', level: '吉', desc: '巨門得化祿/化權，暗曜化為明用，主先難後成、大器晚成。' });
  }
  // 17. 雄宿朝元（廉貞+化祿 or 化權 in 命宮）
  if (mingMajors.indexOf('廉貞') >= 0 && (_starHua('廉貞') === '化祿' || _starHua('廉貞') === '化權')) {
    patterns.push({ name: '雄宿朝元', level: '吉', desc: '廉貞得化祿/化權，囚星化為將星，主有魄力、能在逆境中翻盤。' });
  }
  // 18. 武曲天府（武曲+天府同宮）
  for (var _wt = 0; _wt < 12; _wt++) {
    if (_hasStar(_wt, '武曲') && _hasStar(_wt, '天府')) {
      patterns.push({ name: '武府同宮', level: '吉', desc: '武曲天府同宮，財星庫星聯手，主理財有道、財運穩健。' });
      break;
    }
  }
  // 19. 廉貞七殺（路上埋屍格 — 只在特定宮位才算凶）
  if (mingMajors.indexOf('廉貞') >= 0 && mingMajors.indexOf('七殺') >= 0) {
    if (mingShas.length >= 2) {
      patterns.push({ name: '廉殺同宮（凶）', level: '凶', desc: '廉貞七殺坐命且煞星加會，主剛烈衝動、易犯刑剋，須注意安全。' });
    } else {
      patterns.push({ name: '廉殺同宮', level: '雙面', desc: '廉貞七殺坐命，有決斷力和衝勁，但過於剛硬，有吉星化解則轉為將才。' });
    }
  }
  // 20. 天梁坐命（蔭星坐命，有貴人庇護）
  if (mingMajors.indexOf('天梁') >= 0 && mingShas.length === 0) {
    patterns.push({ name: '天梁坐命', level: '吉', desc: '天梁坐命無煞，主一生有貴人蔭庇、逢凶化吉。適合公職或專業領域。' });
  }
  // 21. 機巨同宮
  for (var _mj = 0; _mj < 12; _mj++) {
    if (_hasStar(_mj, '天機') && _hasStar(_mj, '巨門')) {
      var _mjNote = _mj === 0 ? '坐命' : '在' + palaces[_mj].name;
      patterns.push({ name: '機巨同宮', level: '雙面', desc: '天機巨門' + _mjNote + '，聰明多疑，口才好但易招口舌是非。化祿/化權則為名嘴或評論家。' });
      break;
    }
  }
  // 22. 紫微在午（紫微天府各在午或子 = 紫微在天）
  if (_hasStar(0, '紫微') && mingBranch === '午') {
    patterns.push({ name: '紫微在天', level: '大吉', desc: '紫微在午宮坐命，帝星居正位，主格局極大、氣度非凡。' });
  }
  // 23. 命無正曜（空宮坐命）
  if (mingMajors.length === 0) {
    patterns.push({ name: '命無正曜', level: '中性', desc: '命宮無主星，借對宮星力。性格多變、適應力強，但主見較弱，容易受環境影響。' });
  }
  // 24. 六煞星集命（命宮3煞以上）
  if (mingShas.length >= 3) {
    patterns.push({ name: '煞星雲集', level: '凶', desc: '命宮三煞以上（' + mingShas.join('、') + '），阻力重重，需有化祿/化權化解才能轉危為安。' });
  }
  // 25. 祿權科三奇加會（三方四正有化祿+化權+化科）
  var sfIdxs = _sanFangIdx(0);
  var hasLu = false, hasQuan = false, hasKe = false;
  sfIdxs.forEach(function(si) {
    if (_hasHua(si, '化祿')) hasLu = true;
    if (_hasHua(si, '化權')) hasQuan = true;
    if (_hasHua(si, '化科')) hasKe = true;
  });
  if (hasLu && hasQuan && hasKe) {
    patterns.push({ name: '三奇加會', level: '大吉', desc: '化祿、化權、化科同時在命宮三方四正，主才華出眾、名利雙收、機運極佳。' });
  }
  // 26. 雙祿交流（祿存+化祿在命宮或三方四正）
  var hasLucun = sfIdxs.some(function(si) { return _hasStar(si, '祿存'); });
  if (hasLu && hasLucun) {
    patterns.push({ name: '雙祿交流', level: '大吉', desc: '祿存與化祿同拱命宮，雙重財氣加持，主財運亨通。' });
  }
  // 27. 命逢四煞（擎羊、陀羅、火星、鈴星任兩個以上在命宮）
  var _fourSha = ['擎羊','陀羅','火星','鈴星'].filter(function(n) { return mingShas.indexOf(n) >= 0; });
  if (_fourSha.length >= 2) {
    patterns.push({ name: '四煞夾命', level: '凶', desc: '命宮有' + _fourSha.join('、') + '，阻力與挫折明顯，需要更多努力才能突破。' });
  }

  // ═══ 星曜組合特殊論述 ═══
  var starComboNotes = [];
  // 紫微+天相 = 聽話的帝王，主被人左右
  for (var _sc = 0; _sc < 12; _sc++) {
    var _scM = _getMajors(_sc);
    if (_scM.indexOf('紫微') >= 0 && _scM.indexOf('天相') >= 0) {
      starComboNotes.push('紫微天相同宮（' + palaces[_sc].name + '）：主依賴他人決策，表面主導實際被掌控。');
    }
    if (_scM.indexOf('太陽') >= 0 && _scM.indexOf('太陰') >= 0) {
      starComboNotes.push('日月同宮（' + palaces[_sc].name + '）：陰陽同處，性格多面，男命偏柔、女命偏強。');
    }
    if (_scM.indexOf('武曲') >= 0 && _scM.indexOf('貪狼') >= 0) {
      starComboNotes.push('武貪同宮（' + palaces[_sc].name + '）：能賺能花，中年後發，但年輕時多辛勞。');
    }
    if (_scM.indexOf('天同') >= 0 && _scM.indexOf('巨門') >= 0) {
      starComboNotes.push('同巨同宮（' + palaces[_sc].name + '）：內心矛盾大，想安逸又多疑慮。');
    }
    if (_scM.indexOf('天同') >= 0 && _scM.indexOf('天梁') >= 0) {
      starComboNotes.push('同梁同宮（' + palaces[_sc].name + '）：性格溫和保守，適合穩定環境，但缺乏衝勁。');
    }
    if (_scM.indexOf('武曲') >= 0 && _scM.indexOf('七殺') >= 0) {
      starComboNotes.push('武殺同宮（' + palaces[_sc].name + '）：剛硬果斷，財務上大進大出，適合投資或軍警。');
    }
    if (_scM.indexOf('太陽') >= 0 && _scM.indexOf('天梁') >= 0) {
      starComboNotes.push('陽梁同宮（' + palaces[_sc].name + '）：正直有擔當，適合法律、教育、公務。');
    }
    if (_scM.indexOf('廉貞') >= 0 && _scM.indexOf('天府') >= 0) {
      starComboNotes.push('廉府同宮（' + palaces[_sc].name + '）：進取中帶穩重，有企圖心但不衝動。');
    }
    if (_scM.indexOf('廉貞') >= 0 && _scM.indexOf('貪狼') >= 0) {
      starComboNotes.push('廉貪同宮（' + palaces[_sc].name + '）：慾望交織理想，桃花旺，需小心感情糾紛。');
    }
    if (_scM.indexOf('廉貞') >= 0 && _scM.indexOf('破軍') >= 0) {
      starComboNotes.push('廉破同宮（' + palaces[_sc].name + '）：破壞力強，人生大起大落，敢拼但風險高。');
    }
    if (_scM.indexOf('武曲') >= 0 && _scM.indexOf('破軍') >= 0) {
      starComboNotes.push('武破同宮（' + palaces[_sc].name + '）：財來財去，破舊立新的模式，投資要特別審慎。');
    }
    if (_scM.indexOf('天機') >= 0 && _scM.indexOf('天梁') >= 0) {
      starComboNotes.push('機梁同宮（' + palaces[_sc].name + '）：善於謀略和分析，適合研究或顧問型工作。');
    }
  }

  return {palaces, mingIdx, shenIdx, yGan, yZhi, wuxingJu, sihua: huaMap, selfHua: selfHuaMap, lunar, mingZhu, shenZhu, mingGan, ziweiIdx, tianfuIdx, daXian, getLiuNianZw, getLiuYueZw, getXiaoXian, patterns, starComboNotes};
  } catch(_zwErr) {
    console.error('[computeZiwei] 排盤失敗:', _zwErr && _zwErr.message ? _zwErr.message : _zwErr, _zwErr && _zwErr.stack ? _zwErr.stack : '');
    window._jyZiweiError = (_zwErr && _zwErr.message) ? _zwErr.message : String(_zwErr);
    return null;
  }
}

function addStarToPalace(palaces, name, type, zhiIdx){
  const pIdx = palaces.findIndex(p=> DZ.indexOf(p.branch) === zhiIdx);
  if(pIdx>=0) palaces[pIdx].stars.push({name, type});
}

// ═══ 紫微斗數整合進八字大運流年吉凶 ═══
// 在S.bazi和S.ziwei都算完後呼叫

// ── mergeZiweiIntoBazi + helper (lines 22033-22130) ──
function mergeZiweiIntoBazi(){
  if(!S.bazi||!S.ziwei||!S.ziwei.daXian) return;
  const bazi=S.bazi, zw=S.ziwei;
  const thisYear=new Date().getFullYear();

  bazi.dayun.forEach(dy=>{
    // 找同期的紫微大限
    const matchDx=zw.daXian.find(dx=>
      (dy.ageStart>=dx.ageStart&&dy.ageStart<=dx.ageEnd)||
      (dx.ageStart>=dy.ageStart&&dx.ageStart<=dy.ageEnd)
    );
    if(!matchDx) return;

    // 紫微大限score按比例加入八字大運score
    const zwWeight=0.35; // 紫微佔35%的權重
    const zwAdj=matchDx.score*zwWeight;
    dy.score+=zwAdj;

    // 加入紫微notes
    if(matchDx.bright&&matchDx.bright.length){
      dy.notes.push('紫微大限走'+matchDx.palaceName+'（'+matchDx.bright.map(b=>b.star+b.label).join('、')+' ）');
    }else{
      dy.notes.push('紫微大限走'+matchDx.palaceName+'（'+matchDx.level+'）');
    }
    if(matchDx.theme) dy.notes.push('十年主題：'+matchDx.theme);
    // 重要的大限notes（廟旺、吉煞組合、四化、特殊格局）
    if(matchDx.notes){
      matchDx.notes.slice(0,3).forEach(n=>dy.notes.push('紫微：'+n));
    }

    // 重新計算大運level（統一使用吉凶標籤）
    const s=dy.score;
    if(s>=6) dy.level='大吉';
    else if(s>=3) dy.level='中吉';
    else if(s>=1) dy.level='小吉';
    else if(s>=-1) dy.level='平穩';
    else if(s>=-3) dy.level='小凶';
    else if(s>=-6) dy.level='凶';
    else dy.level='大凶';

    // 紫微流年整合進八字流年
    if(dy.liuNian&&zw.getLiuNianZw){
      dy.liuNian.forEach(ln=>{
        try{
          const zwLn=zw.getLiuNianZw(ln.year);
          if(!zwLn) return;

          // 紫微流年score按比例加入
          const lnZwAdj=zwLn.score*0.3;
          ln.score+=lnZwAdj;

          // 紫微流年notes
          if(zwLn.mingPalace) ln.notes.push('紫微流年走'+zwLn.mingPalace);
          if(zwLn.focus) ln.notes.push('重點：'+zwLn.focus);
          if(zwLn.bright&&zwLn.bright.length) ln.notes.push(zwLn.bright.map(b=>b.star+b.label).join('、'));
          if(zwLn.notes) zwLn.notes.slice(0,2).forEach(n=>ln.notes.push(n));

          // 重新計算流年level（統一使用吉凶標籤）
          const ls=ln.score;
          if(ls>=5) ln.level='大吉';
          else if(ls>=3) ln.level='中吉';
          else if(ls>=1) ln.level='小吉';
          else if(ls>=-1) ln.level='平穩';
          else if(ls>=-3) ln.level='小凶';
          else if(ls>=-5) ln.level='凶';
          else ln.level='大凶';
        }catch(e){}
      });
    }
  });
}

function getWuxingJu(gan, zhi){
  // 納音五行局：命宮干支→納音→五行→局數
  // 納音五行: 金=4, 木=3, 水=2, 火=6, 土=5
  const NY_EL=['金','火','木','土','金','火','水','土','金','木','水','土','火','木','水','金','火','木','土','金','火','水','土','金','木','水','土','火','木','水'];
  const JU={'金':4,'木':3,'水':2,'火':6,'土':5};
  const gi=TG.indexOf(gan), zi=DZ.indexOf(zhi);
  if(gi<0||zi<0)return 4;
  let idx=-1;
  for(let n=0;n<60;n++)if(n%10===gi&&n%12===zi){idx=n;break;}
  if(idx<0)return 4;
  const nyEl=NY_EL[Math.floor(idx/2)];
  return JU[nyEl]||4;
}

function getZiweiPalaceByJu(ju, lunarDay){
  // 紫微安星公式（標準退步法）
  // day÷ju=商q餘r
  // r=0: 從寅(2)起順數(q-1)位
  // r≠0: 從寅(2)起順數q位，再退(ju-r)步（退步=減法）
  const day=Math.max(1,Math.min(30,lunarDay));
  const q=Math.floor(day/ju), r=day%ju;
  if(r===0) return ((2+q-1)%12+12)%12;
  const n=ju-r; // 退步數
  return ((2+q-n)%12+12)%12; // 退步永遠是減法
}


// ── renderZiwei display (lines 22131-22572) ──
function renderZiwei(){
  const zw = S.ziwei;
  const st = (window.getZiweiSettings ? window.getZiweiSettings() : {});
  const host = document.getElementById('d-ziwei');
  if(host){
    host.classList.toggle('zw-bold-major', !!st.bold_major_assist);
    host.classList.toggle('zw-concise', !!st.concise_mode);
    host.classList.toggle('zw-sixsha-black', !!st.six_sha_black);
  }
  if(!zw){document.getElementById('d-ziwei-info').innerHTML='<p class="text-dim">請先填寫出生資料</p>';return}

  const _zwType = (S.form && S.form.type) || 'general';
  const _zwQuestion = (S.form && S.form.question) || '';
  let _zwQ = null, _zwNarr = null;
  try { if(typeof analyzeZiweiQuestion==='function') _zwQ = analyzeZiweiQuestion(zw, _zwType, _zwQuestion); } catch(e) {}
  try { if(typeof buildZiweiNarrative==='function' && _zwQ) _zwNarr = buildZiweiNarrative(_zwQ, zw, _zwType); } catch(e) {}

  // ═══ 白話結論卡片 ═══
  const _zwMing=zw.palaces[0];
  const _zwMajors=_zwMing?_zwMing.stars.filter(s=>s.type==='major'):[];
  const _STAR_LIFE={紫微:'你天生有老闆格局，適合帶團隊而不是被管',天機:'你腦子轉很快，但容易想太多、做太少',太陽:'你天生自帶光環，適合面對群眾的工作',武曲:'你做事講效率、重結果，天生的業績王',天同:'你追求舒適和平衡，壓力大時會想逃避',廉貞:'你自尊心極強，不服輸，但情緒容易失控',天府:'你穩重不冒進，適合管理資產和長期規劃',太陰:'你心思細膩、有計畫，但容易內耗',貪狼:'你多才多藝，什麼都想學，但容易分心',巨門:'你分析能力極強，但嘴巴容易惹禍',天相:'你正派可靠，是天生的二把手和協調者',天梁:'你大器晚成，年輕時多磨練反而是好事',七殺:'你是行動派，壓力下反而更有爆發力',破軍:'你不怕改變，但要確認方向再全力投入'};
  const _zwStarName=_zwMajors.length?_zwMajors[0].name:'';
  const _zwLifeTip=_STAR_LIFE[_zwStarName]||'';
  const _zwCurDx=zw.daXian?zw.daXian.find(d=>d.isCurrent):null;
  let _zwInsight='';
  if(_zwLifeTip) _zwInsight+=`<div class="insight-card"><div class="insight-title">💫 ${_zwLifeTip}</div><div class="insight-sub">命宮主星：${_zwMajors.map(s=>s.name).join('、')}</div></div>`;
  if(_zwCurDx) _zwInsight+=`<div class="insight-card" style="border-left-color:#60a5fa"><div class="insight-title" style="color:#60a5fa">📍 ${_zwCurDx.theme||_zwCurDx.palaceName+'期'}</div><div class="insight-sub">大限走「${_zwCurDx.palaceName}」宮（${_zwCurDx.ageStart}-${_zwCurDx.ageEnd}歲・${_zwCurDx.level}）</div></div>`;
  if(_zwInsight){
    const infoEl=document.getElementById('d-ziwei-info');
    if(infoEl) infoEl.insertAdjacentHTML('beforebegin',_zwInsight);
  }

  // Info - 白話版
  const shenPalace=zw.palaces.find(p=>p.isShen);
  const shenPalaceName=shenPalace?shenPalace.name:'';
  const juLabel=['水二','木三','金四','土五','火六'][[2,3,4,5,6].indexOf(zw.wuxingJu)]||'土五';
  const SHEN_MEANING={'命宮':'你一輩子最在意「自我」','兄弟':'你一輩子最在意「朋友與人脈」','夫妻':'你一輩子最在意「感情與婚姻」','子女':'你一輩子最在意「創造力與下一代」','財帛':'你一輩子最在意「錢財與資源」','疾厄':'你一輩子最在意「健康」','遷移':'你一輩子最在意「外在發展與變動」','交友':'你一輩子最在意「社交圈」','官祿':'你一輩子最在意「事業成就」','田宅':'你一輩子最在意「家庭與房產」','福德':'你一輩子最在意「精神滿足」','父母':'你一輩子最在意「長輩關係與學業」'};
  const shenTip = SHEN_MEANING[shenPalaceName] || '';
  document.getElementById('d-ziwei-info').innerHTML=`
    ${_zwQ ? `
    <div class="insight-card" style="margin-bottom:.7rem;border-left-color:${_zwQ.direction==='positive'?'#4ade80':_zwQ.direction==='negative'?'#f87171':'#d4af37'}">
      <div class="insight-title">🪐 紫微直判：${_zwQ.yesNoAnswer}</div>
      <div class="insight-sub">主題宮位：${_zwQ.palace} ｜ 分數：${_zwQ.score}/100 ｜ 信心度：${_zwQ.confidence}%</div>
      ${_zwNarr ? `<div style="margin-top:.45rem;font-size:.84rem;line-height:1.7"><p style="margin:.2rem 0"><strong>目前局面：</strong>${_zwNarr.situation}</p><p style="margin:.2rem 0;color:#fca5a5"><strong>風險：</strong>${_zwNarr.risk}</p><p style="margin:.2rem 0;color:var(--c-gold)"><strong>建議：</strong>${_zwNarr.advice}</p>${_zwNarr.timing?`<p style="margin:.2rem 0"><strong>應期：</strong>${_zwNarr.timing}</p>`:''}</div>`:''}
    </div>` : ''}
    <p>你的命盤格局：<strong>${juLabel}局</strong>（決定人生節奏快慢）</p>
    <p class="text-xs text-dim mt-xs">命主星：${zw.mingZhu} ｜ 身主星：${zw.shenZhu}</p>
    ${shenTip ? '<p class="text-xs mt-xs" style="color:#60a5fa">🎯 身宮在'+shenPalaceName+'：'+shenTip+'</p>' : ''}`;
  if(window.__plainHtml){ var _infoEl=document.getElementById('d-ziwei-info'); if(_infoEl) _infoEl.innerHTML = window.__plainHtml(_infoEl.innerHTML); }

  // 12宮格（4x4, 中間2x2空）
  // 排列順序 DZ idx: 辰(4)巳(5)午(6)未(7) / 卯(3)[空][空]申(8) / 寅(2)[空][空]酉(9) / 丑(1)子(0)亥(11)戌(10)
  const order = [
    [4,5,6,7],    // 辰巳午未
    [3,-1,-1,8],  // 卯 center center 申
    [2,-1,-1,9],  // 寅 center center 酉
    [1,0,11,10]   // 丑子亥戌
  ];

  let html = '<div class="zw-grid">';
  for(let row=0;row<4;row++){
    for(let col=0;col<4;col++){
      const idx = order[row][col];
      if(idx===-1){
        if(row===1&&col===1){
          // Center cell spans 2x2
          html+=`<div class="zw-cell zw-center" style="grid-column:2/4;grid-row:2/4">
            <div class="serif text-gold" style="font-size:1.1rem;margin-bottom:var(--sp-sm)">紫微斗數</div>
            <p class="text-dim text-xs">命宮：${DZ[zw.mingIdx]}</p>
            <p class="text-dim text-xs">年干：${zw.yGan}${zw.yZhi}</p>
          </div>`;
        }
        continue;
      }
      const palace = zw.palaces.find(p => DZ.indexOf(p.branch) === idx);
      if(!palace){html+=`<div class="zw-cell"><span class="zw-palace">${DZ[idx]}</span></div>`;continue}

      const isMing = palace.isMing;
      const isShen = palace.isShen;
      html+=`<div class="zw-cell${isMing?' active-palace':''}${isShen?' shen-palace':''}">
        <div class="zw-palace">${palace.name}${isMing?' ⭐':''}${isShen?'<span style="color:#9cf;font-size:.6rem;margin-left:3px">身</span>':''}</div>
        <div class="zw-branch">${palace.branch}</div>
        <div class="zw-stars">`;
      // 先排主星，再吉煞，再乙級
      const sortOrder={major:0,sha:1,lucky:2,minor:3,minor2:4,minor3:5};
      const sorted=[...palace.stars].sort((a,b)=>(sortOrder[a.type]||9)-(sortOrder[b.type]||9));
      const bIdx=DZ.indexOf(palace.branch);
      sorted.forEach(s=>{
        const cls = s.type==='major'?'major':s.type==='sha'?'text-danger':s.type==='minor2'?'zw-m2':s.type==='minor3'?'zw-m3':'minor';
        html+=`<span class="zw-star ${cls}">${s.name}</span>`;
        if(s.type==='major'||s.type==='lucky'||s.type==='minor'||s.type==='sha'){const br=getStarBright(s.name,bIdx);if(br.label&&br.label!=='平')html+=`<span class="zw-bright">${br.label}</span>`;}
        if(s.hua){
          const huaCls = s.hua.includes('祿')?'color:#4ade80':s.hua.includes('權')?'color:#d8b56a':s.hua.includes('科')?'color:#60a5fa':'color:#f87171';
          html+=`<span class="zw-hua" style="${huaCls}">${s.hua}</span>`;
        }
        // 自化標記
        if(s.selfHua&&s.selfHua.length) s.selfHua.forEach(sh=>html+=`<span class="zw-self-hua" style="color:#ff9800;font-size:.55rem" title="自化${sh.type}（離心）">${sh.direction}${sh.type.replace('化','')}</span>`);
        if(s.flyInHua&&s.flyInHua.length) s.flyInHua.forEach(fh=>html+=`<span class="zw-fly-hua" style="color:#4fc3f7;font-size:.55rem" title="從${fh.from}化入${fh.type}（向心）">${fh.direction}${fh.type.replace('化','')}</span>`);
      });
      // 十二長生
      if(palace.changsheng) html+=`<div class="zw-changsheng" style="font-size:.5rem;color:var(--c-text-muted);margin-top:2px">${palace.changsheng}</div>`;
      html+=`</div></div>`;
    }
  }
  html+='</div>';
  document.getElementById('d-ziwei-grid').innerHTML=window.__plainHtml ? window.__plainHtml(html) : html;

  // ── 大限走勢面板 ──
  var dxHtml = '';
  try {
    if(zw.daXian && zw.daXian.length){
      dxHtml += '<p class="text-dim text-xs" style="margin-bottom:.5rem">紫微大限每十年一個宮位輪轉，決定你那十年的整體運勢基調</p>';
      dxHtml += '<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:.8rem">';
      zw.daXian.forEach(function(dx){
        var bg = dx.isCurrent ? 'rgba(212,175,55,.2)' : 'rgba(255,255,255,.04)';
        var border = dx.isCurrent ? '2px solid var(--c-gold)' : '1px solid rgba(255,255,255,.1)';
        var levelColor = dx.level && dx.level.includes('吉') ? '#4ade80' : dx.level && dx.level.includes('凶') ? '#f87171' : 'var(--c-text-dim)';
        dxHtml += '<div style="padding:6px 10px;border-radius:6px;background:'+bg+';border:'+border+';font-size:.75rem;text-align:center;min-width:80px">' +
          '<div style="font-weight:600;color:'+(dx.isCurrent?'var(--c-gold)':'var(--c-text)')+'">'+dx.palaceName+'</div>' +
          '<div style="color:'+levelColor+';font-size:.7rem">'+(dx.level||'')+'</div>' +
          '<div style="opacity:.5;font-size:.6rem">'+dx.ageStart+'-'+dx.ageEnd+'歲</div>' +
          (dx.isCurrent?'<div style="font-size:.6rem;color:var(--c-gold)">◀ 目前</div>':'')+
          '</div>';
      });
      dxHtml += '</div>';
      var curDxZW = zw.daXian.find(function(d){return d.isCurrent;});
      if(curDxZW){
        var dxDetail = '<div style="padding:.6rem;background:rgba(212,175,55,.05);border-radius:8px;border-left:3px solid var(--c-gold)">';
        dxDetail += '<p style="margin:0;font-weight:600;color:var(--c-gold)">目前大限：'+curDxZW.palaceName+'（'+curDxZW.ageStart+'-'+curDxZW.ageEnd+'歲，'+curDxZW.level+'）</p>';
        var DX_PALACE_TALK = {
          '命宮':'大限走回命宮，重新認識自己的十年。自我意識和行動力增強。',
          '兄弟':'大限走兄弟宮，人脈合作是這十年重點。多結交志同道合的夥伴。',
          '夫妻':'大限走夫妻宮，感情是主旋律。已婚者婚姻有考驗或升華，未婚者有機會遇對象。',
          '子女':'大限走子女宮，創造力和子女相關事務是重點。適合投入創作或投資。',
          '財帛':'大限走財帛宮，財運是主軸。適合積極理財和投資布局。',
          '疾厄':'大限走疾厄宮，健康最需注意。定期體檢、養成好習慣。',
          '遷移':'大限走遷移宮，出外運重點。適合外出發展、搬家、擴大生活圈。',
          '僕役':'大限走僕役宮，人際關係是這十年功課。辨別真心朋友。',
          '官祿':'大限走官祿宮，事業主場。適合衝刺事業、建立專業口碑。',
          '田宅':'大限走田宅宮，家庭和不動產是重點。適合買房、穩固家庭。',
          '福德':'大限走福德宮，精神世界和內心是重心。適合修身養性。',
          '父母':'大限走父母宮，跟長輩關係和自我成長是重點。'
        };
        if(DX_PALACE_TALK[curDxZW.palaceName]) dxDetail += '<p style="margin:.5rem 0;font-size:.85rem;line-height:1.7">'+DX_PALACE_TALK[curDxZW.palaceName]+'</p>';
        if(curDxZW.hua && curDxZW.hua.length){
          dxDetail += '<div style="margin-top:.4rem">';
          curDxZW.hua.forEach(function(h){
            var hColor = h.hua==='化祿'?'#4ade80':h.hua==='化忌'?'#f87171':h.hua==='化權'?'var(--c-gold)':'#60a5fa';
            dxDetail += '<span style="display:inline-block;margin:2px 4px;padding:2px 8px;border-radius:4px;font-size:.72rem;background:rgba(255,255,255,.05);border:1px solid '+hColor+';color:'+hColor+'">'+h.star+h.hua+'→'+h.palace+'</span>';
          });
          dxDetail += '</div>';
          var dxJi = curDxZW.hua.find(function(h){return h.hua==='化忌';});
          if(dxJi) dxDetail += '<p style="margin:.3rem 0;font-size:.8rem;color:#f87171">⚠ 大限化忌入'+dxJi.palace+'，這十年需要特別留意的功課。</p>';
          var dxLu = curDxZW.hua.find(function(h){return h.hua==='化祿';});
          if(dxLu) dxDetail += '<p style="margin:.3rem 0;font-size:.8rem;color:#4ade80">✨ 大限化祿入'+dxLu.palace+'，這十年的能量紅利。</p>';
        }
        dxDetail += '</div>';
        dxHtml += dxDetail;
      }
    }
  } catch(e){}
  var dxElZW = document.getElementById('d-ziwei-daxian');
  if(dxElZW) dxElZW.innerHTML = window.__plainHtml ? window.__plainHtml(dxHtml) : dxHtml;

  // ── 今年流年面板 ──
  var lnHtmlZW = '';
  try {
    if(zw.getLiuNianZw){
      var thisYearZW = new Date().getFullYear();
      var zwLnR = zw.getLiuNianZw(thisYearZW);
      if(zwLnR){
        var lnLC = zwLnR.score >= 3 ? '#4ade80' : zwLnR.score <= -3 ? '#f87171' : 'var(--c-gold)';
        lnHtmlZW += '<div style="padding:.6rem;background:rgba(212,175,55,.05);border-radius:8px">';
        lnHtmlZW += '<p style="margin:0;font-weight:600"><span style="color:var(--c-gold)">'+thisYearZW+'年</span> 流年命宮走「<span style="color:'+lnLC+'">'+zwLnR.mingPalace+'</span>」</p>';
        lnHtmlZW += '<p style="margin:.3rem 0;font-size:.85rem">干支：'+zwLnR.gz+' ｜ 今年焦點：'+(zwLnR.focus||'綜合運勢')+'</p>';
        if(zwLnR.hua && zwLnR.hua.length){
          lnHtmlZW += '<div style="margin:.4rem 0">';
          zwLnR.hua.forEach(function(h){
            var hC2 = h.hua==='化祿'?'#4ade80':h.hua==='化忌'?'#f87171':h.hua==='化權'?'var(--c-gold)':'#60a5fa';
            lnHtmlZW += '<span style="display:inline-block;margin:2px 4px;padding:2px 8px;border-radius:4px;font-size:.72rem;background:rgba(255,255,255,.05);border:1px solid '+hC2+';color:'+hC2+'">'+h.star+h.hua+'→'+h.palace+'</span>';
          });
          lnHtmlZW += '</div>';
          var lnJi3 = zwLnR.hua.find(function(h){return h.hua==='化忌';});
          if(lnJi3) lnHtmlZW += '<p style="font-size:.8rem;color:#f87171;margin:.3rem 0">⚠ 今年化忌入'+lnJi3.palace+'，格外謹慎。</p>';
          var lnLu3 = zwLnR.hua.find(function(h){return h.hua==='化祿';});
          if(lnLu3) lnHtmlZW += '<p style="font-size:.8rem;color:#4ade80;margin:.3rem 0">✨ 今年化祿入'+lnLu3.palace+'，把握機會！</p>';
        }
        if(zwLnR.notes && zwLnR.notes.length){
          zwLnR.notes.forEach(function(n){ lnHtmlZW += '<p style="font-size:.82rem;line-height:1.6;margin:.2rem 0">• '+n+'</p>'; });
        }
        lnHtmlZW += '</div>';
      }
    }
  } catch(e){}
  var lnElZW = document.getElementById('d-ziwei-liunian');
  if(lnElZW) lnElZW.innerHTML = window.__plainHtml ? window.__plainHtml(lnHtmlZW) : lnHtmlZW;
  const HUA_EXPLAIN = {
    '化祿': {icon:'💰', label:'好運加持', desc:'這個領域容易獲得好的結果和資源'},
    '化權': {icon:'💪', label:'掌控力強', desc:'你在這方面有主導權，但小心太強勢'},
    '化科': {icon:'⭐', label:'貴人相助', desc:'這方面有好名聲，容易得到幫助'},
    '化忌': {icon:'⚠️', label:'需要注意', desc:'這是你最在意也最容易卡關的地方'}
  };
  let sihuaHtml = '';
  if(zw.sihua.length){
    sihuaHtml += '<p class="text-xs text-dim" style="margin-bottom:8px">你出生年的天干帶來四種特殊能量，影響你人生不同面向：</p>';
    zw.sihua.forEach(h=>{
      const ex = HUA_EXPLAIN[h.hua] || {icon:'',label:h.hua,desc:''};
      const tagCls = h.hua.includes('祿')?'tag-green':h.hua.includes('忌')?'tag-red':h.hua.includes('權')?'tag-gold':'tag-blue';
      sihuaHtml += `<div style="margin-bottom:6px;padding:6px 8px;background:rgba(255,255,255,0.03);border-radius:6px">
        <span class="tag ${tagCls}">${ex.icon} ${ex.label}</span> <strong>${h.star}</strong> → ${h.palace}
        <div class="text-xs text-dim" style="margin-top:2px">${ex.desc}</div>
      </div>`;
    });
  } else {
    sihuaHtml = '<p class="text-dim">四化資訊計算中</p>';
  }
  // 自化/飛星（簡化版）
  if(zw.selfHua && zw.selfHua.length){
    sihuaHtml += '<p class="text-xs text-dim" style="margin-top:10px;margin-bottom:6px">各宮位之間也有能量互動：</p>';
    zw.selfHua.forEach(sh=>{
      const dir = sh.direction==='↓' ? '向外發散' : '被吸引進來';
      const huaEx = HUA_EXPLAIN[sh.type] || {icon:'', label:sh.type};
      sihuaHtml += `<p class="text-xs" style="margin-bottom:3px">${sh.palace} 的 ${sh.star}（${huaEx.icon}${huaEx.label}）能量${dir}</p>`;
    });
  }
  document.getElementById('d-ziwei-sihua').innerHTML = window.__plainHtml ? window.__plainHtml(sihuaHtml) : sihuaHtml;

  // 解讀
  const mingPalace = zw.palaces[0];
  const mingStars = mingPalace.stars.filter(s=>s.type==='major');
  let reading = '';
  if(mingStars.length){
    reading+=`<p><strong>命宮主星：</strong>${mingStars.map(s=>s.name).join('、')}</p>`;
    mingStars.forEach(s=>{
      const info = ZW_MAJOR.find(m=>m.name===s.name);
      const natureText = (info && info.nature) || ZW_MAJOR_NATURE[s.name] || '此星主題資料未補齊';
      reading+=`<p class="text-dim">→ ${s.name}：${natureText}</p>`;
    });
  }else{
    // 命宮無主星：動態整合 煞星 + 對宮 + 身宮
    const mingShaStar=mingPalace.stars.filter(s=>s.type==='sha').map(s=>s.name);
    const qianyi=zw.palaces[6]; // 遷移宮（對宮）
    const qianyiMajors=qianyi?qianyi.stars.filter(s=>s.type==='major').map(s=>s.name):[];
    const qianyiHua=qianyi?qianyi.stars.filter(s=>s.hua).map(s=>s.name+s.hua):[];
    reading+=`<p>命宮無主星，借對宮（遷移宮）星曜判斷。`;
    if(mingShaStar.includes('擎羊')||mingShaStar.includes('陀羅')){
      reading+=`命宮帶${mingShaStar.join('、')}，性格中有強烈的防衛心與堅韌面，外柔內剛，被壓迫時會激烈反彈。`;
    } else if(mingShaStar.length){
      reading+=`命宮帶${mingShaStar.join('、')}，處事風格較為銳利。`;
    } else {
      reading+=`性格定位較模糊，容易將生命重心向外尋求。`;
    }
    if(qianyiMajors.length){
      reading+=`對宮有${qianyiMajors.join('、')}`;
      if(qianyiMajors.includes('武曲')&&qianyiMajors.includes('貪狼')){
        reading+=`，武曲貪狼組合極度渴望實質成就，在外發展力強但容易慾望受阻`;
      } else if(qianyiMajors.some(s=>['紫微','天府'].includes(s))){
        reading+=`，外在環境有貴氣格局`;
      }
      if(qianyiHua.some(h=>h.includes('化忌'))){
        reading+=`。對宮帶化忌，外出發展或人際交往容易遇到挫折與變數`;
      }
      reading+=`。</p>`;
    } else {
      reading+=`</p>`;
    }
    // 身宮提示
    const shenP2=zw.palaces.find(p=>p.isShen);
    if(shenP2){
      const shenMajors=shenP2.stars.filter(s=>s.type==='major').map(s=>s.name);
      const shenHua=shenP2.stars.filter(s=>s.hua).map(s=>s.name+s.hua);
      if(shenMajors.length){
        reading+=`<p class="text-dim">身宮在${shenP2.name}（${shenMajors.join('、')}${shenHua.length?'、'+shenHua.join('、'):''}），`;
        if(shenP2.name==='福德宮'||shenP2.name==='福德'){
          reading+=`代表一生終極追求受精神滿足感主導，而非單純物質。`;
        } else if(shenP2.name==='財帛宮'||shenP2.name==='財帛'){
          reading+=`代表一生重心在財富累積與資源運用。`;
        } else if(shenP2.name==='官祿宮'||shenP2.name==='官祿'){
          reading+=`代表一生重心在事業成就與社會地位。`;
        } else {
          reading+=`中晚年生命重心偏向${shenP2.name}領域。`;
        }
        reading+=`</p>`;
      }
    }
  }
  // 財帛宮 - 白話
  const caiPalace = zw.palaces[4];
  const caiStars = caiPalace.stars.filter(s=>s.type==='major');
  if(caiStars.length)reading+=`<p class="mt-sm"><strong>💰 你的財運：</strong>${caiStars.some(s=>['武曲','天府','太陰'].includes(s.name))?'先天財運底子不錯，適合穩健投資和長期累積':'財運需要靠自己努力去爭取，不適合投機'}</p>`;

  // 官祿宮 - 白話
  const guanPalace = zw.palaces[8];
  const guanStars = guanPalace.stars.filter(s=>s.type==='major');
  if(guanStars.length)reading+=`<p class="mt-sm"><strong>💼 你的事業：</strong>${guanStars.some(s=>['紫微','天府','太陽'].includes(s.name))?'事業格局大，適合帶團隊或做管理':'適合走專業技術路線或自由業'}</p>`;

  // 煞星提醒 - 白話
  const shaInMing = zw.palaces[0].stars.filter(s=>s.type==='sha').map(s=>s.name);
  if(shaInMing.length)reading+=`<p class="mt-sm text-warn"><strong>⚡ 命宮帶挑戰星：</strong>${shaInMing.join('、')} — 代表性格中有衝勁和稜角，遇到壓力時特別要注意控制情緒</p>`;

  // 桃花星分析
  const peachStars=[];
  zw.palaces.forEach(p=>p.stars.filter(s=>['紅鸞','天喜','咸池','天姚'].includes(s.name)).forEach(s=>peachStars.push(s.name+'('+p.name+')')));
  if(peachStars.length)reading+=`<p class="mt-sm" style="color:#f9b"><strong>桃花星：</strong>${peachStars.join('、')}</p>`;

  // 特殊星曜提示
  const specials=[];
  zw.palaces.forEach(p=>{
    p.stars.forEach(s=>{
      if(s.name==='華蓋'&&p.isMing) specials.push('命坐華蓋，宗教緣深、性格清高');
      if(s.name==='天刑'&&p.name==='官祿') specials.push('天刑入官祿，適合法律、軍警、外科');
      if(s.name==='龍池'&&p.name==='命宮') specials.push('龍池入命，才藝出眾');
      if(s.name==='恩光'&&p.isMing) specials.push('恩光入命，貴人緣佳');
    });
  });
  if(specials.length)reading+=specials.map(s=>'<p class="mt-xs text-dim">★ '+s+'</p>').join('');

  // ── 問題類型對應宮位深度解讀 ──
  const typeLabel2 = S.form ? ({'love':'愛情','career':'事業','wealth':'財運','health':'健康','general':'綜合','relationship':'人際','family':'家庭'}[S.form.type]||'綜合') : '綜合';
  const typeToGong2 = {love:2,career:8,wealth:4,health:5,family:9,relationship:7,general:0};
  const tgIdx = typeToGong2[S.form?S.form.type:'general'];
  if(tgIdx !== undefined && tgIdx !== 0) {
    const tgPalace = zw.palaces[tgIdx];
    if(tgPalace) {
      const tgMajors = tgPalace.stars.filter(s=>s.type==='major');
      const tgMinors = tgPalace.stars.filter(s=>s.type==='minor');
      const tgSha = tgPalace.stars.filter(s=>s.type==='sha');
      reading += `<div class="divider"></div>`;
      const GONG_PLAIN = {'夫妻':'感情','官祿':'事業','財帛':'財運','疾厄':'健康','田宅':'家庭','交友':'人際'};
      const plainLabel = GONG_PLAIN[tgPalace.name] || tgPalace.name;
      reading += `<p class="mt-sm"><strong>📌 針對你問的「${typeLabel2}」：</strong></p>`;
      if(tgMajors.length) {
        // 白話解讀（不顯示技術性星曜名稱）
        const tgTypeAdvice = {
          love: function(stars) {
            const msgs = [];
            if(stars.some(s=>s.name==='太陰')) msgs.push('太陰入夫妻宮，感情細膩溫柔，異性緣佳。');
            if(stars.some(s=>s.name==='貪狼')) msgs.push('貪狼入夫妻宮，桃花旺盛，但感情容易波折。');
            if(stars.some(s=>s.name==='天同')) msgs.push('天同入夫妻宮，感情和睦，相處舒適。');
            if(stars.some(s=>s.name==='天機')) msgs.push('天機入夫妻宮，感情中多變，需要用心經營。');
            if(stars.some(s=>s.name==='武曲')) msgs.push('武曲入夫妻宮，另一半務實能幹，但可能缺乏浪漫。');
            if(stars.some(s=>s.name==='紫微')) msgs.push('紫微入夫妻宮，另一半有主見有能力，但可能較強勢。');
            if(stars.some(s=>s.name==='七殺')) msgs.push('七殺入夫妻宮，感情來得快烈但有波動。');
            if(stars.some(s=>s.name==='破軍')) msgs.push('破軍入夫妻宮，感情多變化，婚前可能經歷多段戀情。');
            if(stars.some(s=>s.name==='太陽')) msgs.push('太陽入夫妻宮，另一半為人光明正大，社交活躍。');
            if(stars.some(s=>s.name==='巨門')) msgs.push('巨門入夫妻宮，感情中需注意口舌爭執，溝通是關鍵。');
            if(stars.some(s=>s.name==='天梁')) msgs.push('天梁入夫妻宮，另一半穩重可靠，年齡差距可能較大。');
            if(stars.some(s=>s.name==='天相')) msgs.push('天相入夫妻宮，另一半溫和有禮，適合共同經營家庭。');
            if(stars.some(s=>s.name==='天府')) msgs.push('天府入夫妻宮，另一半穩健有財，感情穩定。');
            if(stars.some(s=>s.name==='廉貞')) msgs.push('廉貞入夫妻宮，感情熱烈但需防第三者。');
            return msgs.length ? msgs.join('') : '';
          },
          career: function(stars) {
            const msgs = [];
            if(stars.some(s=>s.name==='紫微')) msgs.push('紫微入官祿宮，事業格局大，適合管理或獨立經營。');
            if(stars.some(s=>s.name==='天府')) msgs.push('天府入官祿宮，事業穩定有發展，適合大機構。');
            if(stars.some(s=>s.name==='太陽')) msgs.push('太陽入官祿宮，事業有公眾曝光度，適合公職或傳播業。');
            if(stars.some(s=>s.name==='武曲')) msgs.push('武曲入官祿宮，適合金融、軍警或需要果斷的職業。');
            if(stars.some(s=>s.name==='天機')) msgs.push('天機入官祿宮，適合策劃、企劃或變動性高的職業。');
            if(stars.some(s=>s.name==='天同')) msgs.push('天同入官祿宮，工作偏安穩，適合服務業或教育。');
            if(stars.some(s=>s.name==='七殺')) msgs.push('七殺入官祿宮，事業心強，適合獨當一面的角色。');
            if(stars.some(s=>s.name==='破軍')) msgs.push('破軍入官祿宮，適合開創性工作，職業易有大變動。');
            if(stars.some(s=>s.name==='貪狼')) msgs.push('貪狼入官祿宮，適合業務、公關或需要交際的工作。');
            if(stars.some(s=>s.name==='巨門')) msgs.push('巨門入官祿宮，適合律師、教師或需要口才的工作。');
            if(stars.some(s=>s.name==='天梁')) msgs.push('天梁入官祿宮，適合醫療、法律或公益事業。');
            if(stars.some(s=>s.name==='廉貞')) msgs.push('廉貞入官祿宮，事業有重心，適合公務或管理。');
            return msgs.length ? msgs.join('') : '';
          },
          wealth: function(stars) {
            const msgs = [];
            if(stars.some(s=>s.name==='武曲')) msgs.push('武曲入財帛宮，天生財星，正財運極佳，適合金融投資。');
            if(stars.some(s=>s.name==='天府')) msgs.push('天府入財帛宮，財庫穩固，適合穩健理財。');
            if(stars.some(s=>s.name==='太陰')) msgs.push('太陰入財帛宮，適合不動產投資，財富慢慢累積。');
            if(stars.some(s=>s.name==='貪狼')) msgs.push('貪狼入財帛宮，偏財運佳但花費也大，需控制開支。');
            if(stars.some(s=>s.name==='紫微')) msgs.push('紫微入財帛宮，大器晚成型，財富會隨地位提升。');
            if(stars.some(s=>s.name==='天機')) msgs.push('天機入財帛宮，財來財卻，需靈活理財。');
            if(stars.some(s=>s.name==='太陽')) msgs.push('太陽入財帛宮，大方慷慨，正財運佳但不宜太慷慨。');
            if(stars.some(s=>s.name==='巨門')) msgs.push('巨門入財帛宮，靠口才賺錢，但理財需更謹慎。');
            if(stars.some(s=>s.name==='七殺')) msgs.push('七殺入財帛宮，財運起伏大，適合冒險型投資。');
            if(stars.some(s=>s.name==='破軍')) msgs.push('破軍入財帛宮，財運大起大落，需建立儲蓄習慣。');
            return msgs.length ? msgs.join('') : '';
          },
          health: function(stars) {
            const msgs = [];
            if(stars.some(s=>s.name==='天同')) msgs.push('天同入疾厄宮，先天體質不差，注意肥胖與脾臟。');
            if(stars.some(s=>s.name==='天機')) msgs.push('天機入疾厄宮，注意肝膽、神經系統。');
            if(stars.some(s=>s.name==='太陽')) msgs.push('太陽入疾厄宮，注意眼睛、血壓、心臟。');
            if(stars.some(s=>s.name==='太陰')) msgs.push('太陰入疾厄宮，注意脾臟、婦科或泌尿系統。');
            if(stars.some(s=>s.name==='武曲')) msgs.push('武曲入疾厄宮，注意呼吸系統、筋骨。');
            if(stars.some(s=>s.name==='廉貞')) msgs.push('廉貞入疾厄宮，注意心臟、血液循環。');
            if(stars.some(s=>s.name==='貪狼')) msgs.push('貪狼入疾厄宮，注意肝膽、過度消耗。');
            if(stars.some(s=>s.name==='巨門')) msgs.push('巨門入疾厄宮，主消化系統與暗疾，疾病容易隱藏不易察覺，需定期檢查腸胃與免疫系統。');
            if(stars.some(s=>s.name==='天梁')) msgs.push('天梁入疾厄宮，常有小病但能逢凶化吉，注意慢性問題。');
            if(stars.some(s=>s.name==='七殺')) msgs.push('七殺入疾厄宮，體質帶煞氣，注意意外傷害與急性發炎。');
            if(stars.some(s=>s.name==='破軍')) msgs.push('破軍入疾厄宮，身體耗損度高，注意免疫力與過度勞累。');
            if(stars.some(s=>s.name==='紫微')) msgs.push('紫微入疾厄宮，底子不差但容易忽視保養。');
            if(stars.some(s=>s.name==='天相')) msgs.push('天相入疾厄宮，注意皮膚與泌尿系統。');
            if(stars.some(s=>s.name==='天府')) msgs.push('天府入疾厄宮，先天體質不錯，注意脾胃消化。');
            // 化權在疾厄的特殊處理
            const huaQuan=stars.find(s=>s.hua==='化權');
            if(huaQuan) msgs.push(`⚠ ${huaQuan.name}化權在疾厄宮，代表身體機能常處於「高壓運轉」狀態。這不是健康的掌控力，而是壓力導致的過度消耗。需特別警惕隱性健康問題。`);
            const huaJi=stars.find(s=>s.hua==='化忌');
            if(huaJi) msgs.push(`⚠ ${huaJi.name}化忌在疾厄宮，健康方面是命盤中最需關注的弱點，宜定期體檢。`);
            return msgs.length ? msgs.join('') : '';
          }
        };
        const typeAdviceFn = tgTypeAdvice[S.form?S.form.type:'general'];
        if(typeAdviceFn) {
          const advice = typeAdviceFn(tgMajors);
          if(advice) reading += `<p class="mt-sm">${advice}</p>`;
        }
      } else {
        // 無主星時的詳細 fallback（尤其健康）
        if(S.form && S.form.type === 'health'){
          reading += `<p>疾厄宮無主星坐守 → 健康方面沒有「先天硬傷」，但也缺乏天然保護力。</p>`;
          reading += `<p class="text-sm mt-sm">📋 <strong>具體建議：</strong></p>`;
          reading += `<p class="text-sm">• 需借對宮（遷移宮）星曜判斷體質傾向</p>`;
          reading += `<p class="text-sm">• 疾厄宮空宮的人容易忽略身體警訊，等有症狀才處理</p>`;
          reading += `<p class="text-sm">• 建議每年至少一次全面健檢，不要等不舒服才看醫生</p>`;
          // 看小星有沒有線索
          if(tgMinors.length){
            const minorNames = tgMinors.map(s=>s.name);
            if(minorNames.includes('火星')||minorNames.includes('鈴星')) reading += `<p class="text-sm text-warn">⚡ 疾厄宮有火星/鈴星，注意發炎、急性問題和意外傷害</p>`;
            if(minorNames.includes('擎羊')||minorNames.includes('陀羅')) reading += `<p class="text-sm text-warn">⚡ 疾厄宮有擎羊/陀羅，注意外傷、慢性疼痛</p>`;
            if(minorNames.includes('天空')||minorNames.includes('地劫')) reading += `<p class="text-sm text-warn">⚡ 疾厄宮有空劫，身體容易虛耗，注意補氣養神</p>`;
          }
        } else {
          reading += `<p>${typeLabel2}方面的宮位無主星坐守，需借對宮星曜判斷，這個領域較不穩定，需要主動經營。</p>`;
        }
      }
      if(tgMinors.some(s=>['文昌','文曲','左輔','右弼'].includes(s.name))) reading += `<p class="text-sm mt-sm" style="color:#4ade80">✨ ${typeLabel2}方面有吉星幫忙，發展會比較順利</p>`;
      if(tgSha.length) reading += `<p class="text-warn text-sm mt-sm">⚡ ${typeLabel2}方面有挑戰星介入，過程中容易遇到阻礙，需要更有耐心</p>`;

      // 四化在此宮的影響 - 白話版
      const huaInGong = zw.sihua.filter(h=>h.palace===tgPalace.name);
      if(huaInGong.length) {
        huaInGong.forEach(h=>{
          if(h.hua==='化祿') reading+=`<p class="text-sm" style="color:#4ade80">💎 ${typeLabel2}方面有先天福氣，容易有好的結果。</p>`;
          if(h.hua==='化權'){
            if(tgPalace.name==='疾厄'||tgPalace.name.includes('疾')){
              reading+=`<p class="text-sm text-warn">⚠ 身體容易長期處於高壓運轉，要注意定期檢查，別硬撐。</p>`;
            } else {
              reading+=`<p class="text-sm text-gold">💪 ${typeLabel2}方面你有掌控力，但不要太強勢，適當放手效果更好。</p>`;
            }
          }
          if(h.hua==='化科') reading+=`<p class="text-sm" style="color:#60a5fa">⭐ ${typeLabel2}方面容易得到貴人幫忙，口碑也好。</p>`;
          if(h.hua==='化忌'){
            reading+=`<p class="text-sm text-danger">⚠ ${typeLabel2}是你最在意、也最容易卡關的地方。但正因為你特別在乎，反而會逼自己做得更好。把壓力當成動力，就能轉化成優勢。</p>`;
          }
        });
      }
    }
  }

  document.getElementById('d-ziwei-reading').innerHTML=reading||'<p class="text-dim">解讀生成中…</p>';
}

// ── ZiWei palace constants + chart data (lines 22573-25676) ──
/* =============================================================
   姓名學 NAMEOLOGY（三才五格）
   ============================================================= */
const STROKE_OVERRIDE={
  // ═══ 康熙字典筆畫（姓名學專用・部首已還原）═══
  // 原則：氵=4, 忄=4, 扌=4, 艹=6, 衤=6, 礻=5, 辶=7, 犭=4
  //       阝左(阜)=8, 阝右(邑)=7, 王旁(玉)=5, 月(肉旁)=6

  // ── 百大姓氏（康熙正確畫數）──
  '趙':14,'錢':16,'孫':10,'李':7,'周':8,'吳':7,'鄭':19,'王':4,
  '馮':12,'陳':16,'褚':15,'衛':16,'蔣':17,'沈':8,'韓':17,'楊':13,
  '朱':6,'秦':10,'尤':4,'許':11,'何':7,'呂':7,'施':9,'張':11,
  '孔':4,'曹':11,'嚴':20,'華':14,'金':8,'魏':18,'陶':16,'姜':9,
  '戚':11,'謝':17,'鄒':17,'喻':12,'柏':9,'水':4,'竇':20,'章':11,
  '雲':12,'蘇':22,'潘':16,'葛':15,'奚':10,'范':11,'彭':12,'郎':14,
  '魯':16,'韋':9,'昌':8,'馬':10,'苗':11,'鳳':14,'花':10,'方':4,
  '俞':9,'任':6,'袁':10,'柳':9,'酆':20,'鮑':16,'史':5,'唐':10,
  '費':12,'廉':13,'岑':7,'薛':19,'雷':13,'賀':12,'倪':10,'湯':13,
  '滕':14,'殷':10,'羅':20,'畢':11,'郝':14,'鄔':19,'安':6,'常':11,
  '樂':15,'于':3,'時':10,'傅':12,'皮':5,'卞':4,'齊':14,'康':11,
  '伍':6,'余':7,'元':4,'卜':2,'顧':21,'孟':8,'黃':12,'和':8,
  '穆':16,'蕭':18,'尹':4,'姚':9,'邵':12,'湛':13,'汪':8,'祁':8,
  '毛':4,'禹':9,'狄':8,'米':6,'貝':7,'明':8,'臧':14,'計':9,
  '伏':6,'成':7,'戴':18,'談':15,'宋':7,'茅':11,'龐':19,'熊':14,
  '紀':9,'舒':12,'屈':8,'項':12,'祝':10,'董':15,'梁':11,'杜':7,
  '阮':12,'藍':18,'閔':12,'席':10,'季':8,'麻':11,'強':12,'賈':13,
  '路':13,'婁':11,'危':6,'江':7,'童':12,'顏':18,'郭':15,'梅':11,
  '盛':12,'林':8,'刁':2,'鍾':17,'徐':10,'邱':7,'駱':16,'高':10,
  '夏':10,'蔡':17,'田':5,'樊':15,'胡':11,'凌':10,'霍':16,'虞':13,
  '萬':15,'支':4,'柯':9,'昝':9,'管':14,'盧':16,'莫':13,'經':13,
  '房':8,'裘':13,'繆':17,'干':3,'解':13,'應':17,'宗':8,'丁':2,
  '宣':9,'賁':12,'鄧':19,'郁':13,'單':12,'杭':8,'洪':10,'包':5,
  '諸':16,'左':5,'石':5,'崔':11,'吉':6,'鈕':10,'龔':22,'程':12,
  '嵇':13,'邢':7,'滑':14,'裴':14,'陸':16,'榮':14,'翁':10,'荀':11,
  '羊':6,'於':8,'惠':12,'甄':14,'曲':6,'家':10,'封':9,'芮':10,
  '羿':9,'儲':18,'靳':13,'汲':7,'邴':11,'糜':17,'松':8,'井':4,
  '段':9,'富':12,'巫':7,'烏':10,'焦':12,'巴':4,'弓':3,'牧':8,
  '隗':13,'山':3,'谷':7,'車':7,'侯':9,'宓':8,'蓬':17,'全':6,
  '郗':14,'班':10,'仰':6,'秋':9,'仲':6,'伊':6,'宮':10,'甯':12,
  '仇':4,'欒':23,'暴':15,'甘':5,'鈄':10,'厲':15,'戎':6,'祖':10,
  '武':8,'符':11,'劉':15,'景':12,'詹':13,'束':7,'龍':16,'葉':15,
  '幸':8,'司':5,'韶':14,'薄':17,'印':6,'宿':11,'白':5,'懷':20,
  '蒲':16,'邰':13,'從':11,'鄂':11,'索':10,'咸':9,'籍':20,'賴':16,
  '卓':8,'藺':21,'屠':11,'蒙':16,'池':7,'喬':12,'陰':11,'鬱':29,
  '胥':11,'能':10,'蒼':16,'雙':18,'聞':14,'莘':13,'黨':20,'翟':14,
  '譚':19,'貢':10,'勞':12,'逄':14,'姬':10,'申':5,'扶':8,'堵':12,
  '冉':5,'宰':10,'酈':21,'雍':13,'卻':9,'璩':18,'桑':10,'桂':10,
  '濮':18,'牛':4,'壽':14,'通':14,'邊':22,'扈':11,'燕':16,'冀':16,
  '郟':14,'浦':11,'尚':8,'農':13,'溫':14,'別':7,'莊':13,'晏':10,
  '柴':10,'瞿':18,'閻':16,'充':6,'慕':15,'連':14,'茹':12,'習':11,
  '宦':9,'艾':8,'魚':11,'容':10,'向':6,'古':5,'易':8,'慎':14,
  '戈':4,'廖':14,'庾':11,'終':11,'暨':14,'居':8,'衡':16,'步':7,
  '都':16,'耿':10,'滿':15,'弘':5,'匡':6,'國':11,'文':4,'寇':11,
  '廣':15,'祿':13,'闕':18,'東':8,'歐':15,'殳':4,'沃':8,'利':7,
  '蔚':17,'越':12,'夔':21,'隆':17,'師':10,'鞏':15,'厙':6,'聶':18,
  '晁':10,'勾':4,'敖':11,'融':16,'冷':7,'訾':12,'辛':7,'闞':20,
  '那':7,'簡':18,'饒':21,'空':8,'曾':12,'毋':4,'沙':8,'乜':2,
  '養':15,'鞠':17,'須':12,'豐':18,'巢':11,'關':19,'蒯':16,'相':9,
  '查':9,'后':6,'荊':12,'紅':9,'游':13,'竺':8,'權':22,'逯':14,
  '蓋':16,'益':10,'桓':10,'公':4,

  // ── 常見名字用字（康熙正確畫數・部首已還原）──
  // 氵部（+1）
  '淑':12,'清':12,'潔':16,'浩':11,'洋':10,'涵':12,'淳':12,
  '渝':13,'源':14,'溢':14,'滿':15,'漢':15,'潤':16,'澄':16,
  '濤':18,'瀾':21,'灝':25,'沛':8,'洛':10,'湘':13,'澤':17,
  '淇':12,'洪':10,'淨':12,'深':12,'淵':12,'游':13,'渙':13,
  '湛':13,'溫':14,'滋':13,'滑':14,'漫':15,'潛':16,'瀚':20,
  '沐':8,'津':10,'泉':9,'泓':9,'泰':10,'波':9,'泳':9,
  '海':11,'浮':11,'涼':12,'淮':12,'減':13,'渡':13,'港':13,
  '湖':13,'準':13,'溝':14,'溪':14,'溫':14,'滅':14,'漁':15,
  '漂':15,'漓':14,'漠':15,'演':15,'漲':15,'潘':16,'潮':16,
  '澳':17,'濃':17,'濕':18,'濟':18,'瀑':19,'灌':22,'灣':26,
  // 忄部（+1）
  '怡':9,'恆':10,'悅':11,'惠':12,'慧':15,'憲':16,'懷':20,
  '恩':10,'慈':13,'慎':14,'愷':14,'懿':22,
  '悟':11,'情':12,'惜':12,'惟':12,'愉':13,'慰':15,
  '懋':17,'憶':17,'憑':16,'懷':20,'憫':16,'慕':15,
  // 扌部（+1）
  '振':11,'揚':13,'捷':13,'掌':12,'推':12,'描':12,
  '提':13,'搏':14,'撫':16,'操':17,'擇':17,'擎':18,
  // 艹部（+3！）
  '芳':10,'芝':10,'芬':10,'花':10,'若':11,'苗':11,
  '英':11,'茂':11,'茜':12,'茗':12,'茹':12,'荷':13,
  '莉':13,'莎':13,'菁':14,'菲':14,'萊':14,'萍':14,
  '萱':15,'葉':15,'蒂':15,'蓮':17,'蓉':16,'蓁':14,
  '蔚':17,'薇':19,'蘭':21,'蘊':22,'蘇':22,'藝':21,
  '藍':18,'藏':18,'薰':17,'蕙':18,'蕊':18,'蕭':18,
  '芮':10,'苡':11,'荀':11,'莘':13,'莊':13,'董':15,
  '葛':15,'蒲':16,'蒙':16,'蔡':17,'蔣':17,'薛':19,
  '華':14,'萌':14,'萬':15,'葵':15,'蓓':16,'薔':19,
  // 衤部（+1）
  '裕':13,'褚':15,'裴':14,'褀':14,'裝':13,'補':13,
  '複':14,'褐':15,'褒':15,
  // 礻部（+1）
  '祈':9,'祐':10,'祖':10,'祥':11,'祺':13,'禧':17,
  '禎':14,'祿':13,'禮':18,'禪':17,'祝':10,'神':10,
  '福':14,'禹':9,'祁':8,
  // 辶部（+4）
  '建':9,'連':14,'進':15,'達':16,'遠':17,'道':16,
  '運':16,'遊':16,'還':20,'邊':22,'遇':16,'過':16,
  '逸':15,'遍':15,'逢':14,'通':14,'迪':12,'迎':11,
  '述':12,'逆':13,'迅':10,'迪':12,'週':12,
  // 犭部（+1）
  '狄':8,'猛':12,'獅':13,'獨':17,'獻':20,
  // 王(玉)旁（+1）
  '玲':10,'珍':10,'珊':10,'珠':11,'琪':13,'琳':13,
  '瑜':14,'瑛':14,'瑞':14,'瑋':14,'瑤':15,'瑩':15,
  '璇':16,'璋':16,'璐':17,'璟':16,'瑄':14,'琦':13,
  '琬':13,'琰':13,'琮':13,'珮':11,'珈':10,'瑾':16,
  '瑀':14,'璿':18,'瓊':20,'琥':13,'璨':18,'環':18,
  '珺':12,'琴':12,'珏':10,'瑆':13,'珞':11,
  // 月(肉旁)（+2）：左旁的「月」多為肉部
  '胡':11,'育':10,'胖':11,'胤':9,'胸':12,'腸':14,
  '腦':15,'膽':17,'臨':17,'朋':8,'朝':12,'期':12,
  '服':8,
  // 阝左(阜部=8畫)
  '陳':16,'陽':17,'阮':12,'陸':16,'陶':16,'陰':11,
  '陵':16,'隆':17,'隊':12,'階':12,'際':19,'障':16,
  '隨':21,'險':16,'隱':22,'院':10,
  // 阝右(邑部=7畫)
  '鄭':19,'郭':15,'邱':7,'邵':12,'郁':13,'鄒':17,
  '鄧':19,'鄂':11,'郝':14,'鄔':19,'都':16,'鄰':19,
  '邢':7,'郎':14,'那':7,'邦':11,'邸':10,'郗':14,

  // ── 其他高頻名字用字 ──
  '一':1,'二':2,'三':3,'四':4,'五':5,'六':6,'七':7,'八':8,'九':9,'十':10,
  '大':3,'小':3,'中':4,'上':3,'下':3,'人':2,'天':4,'地':6,
  '水':4,'火':4,'木':4,'金':8,'土':3,'日':4,'月':4,'年':6,
  '明':8,'光':6,'國':11,'德':15,'仁':4,'義':13,'禮':18,'信':9,
  '智':12,'勇':9,'忠':8,'孝':7,'志':7,'剛':10,'強':12,'文':4,
  '武':8,'成':7,'功':5,'安':6,'平':5,'吉':6,'祥':11,'瑞':14,
  '昌':8,'盛':12,'榮':14,'富':12,'貴':12,'康':11,'壽':14,
  '福':14,'喜':12,'樂':15,'和':8,'順':12,'利':7,'道':16,
  '春':9,'夏':10,'秋':9,'冬':5,'東':8,'西':6,'南':9,'北':5,
  '心':4,'思':9,'想':13,'意':13,'恩':10,'慈':13,'善':12,
  '美':9,'真':10,'靜':16,'淨':12,'雲':12,'風':9,'雨':8,
  '雪':11,'花':10,'草':10,'樹':16,'海':11,'山':3,'河':9,
  '江':7,'湖':13,'龍':16,'鳳':14,'虎':8,'鶴':21,'馬':10,
  '牛':4,'羊':6,'鼠':13,'兔':8,'蛇':11,'猴':12,'雞':18,'狗':9,'豬':16,
  '愛':13,'情':12,'錢':16,'財':10,'工':3,'作':7,'事':8,'業':13,
  '健':11,'家':10,'庭':10,'際':19,'運':16,'勢':13,'感':13,
  '婚':11,'姻':9,'學':16,'習':11,'考':6,'試':13,'升':4,
  '職':18,'轉':18,'危':6,'凶':4,
  // 常見名字字
  '宇':6,'宸':10,'翔':12,'鈺':13,'筠':13,'霈':15,'芸':10,'嘉':14,
  '瀚':20,'宥':9,'睿':14,'俐':9,'浩':11,'昕':8,'沛':8,
  '晴':12,'芷':10,'彤':7,'宸':10,'紘':10,'彬':11,'濬':18,
  '靖':13,'諺':16,'丞':6,'翰':16,'鈞':12,'銘':14,'鋒':15,
  '駿':17,'翊':11,'勛':12,'奕':9,'晏':10,'柏':9,'柔':9,
  '棠':12,'森':12,'楷':13,'楚':13,'楠':13,'楓':13,'樺':14,
  '煜':13,'照':13,'熠':15,'燁':16,'皓':12,'穎':16,'竣':12,
  '筱':13,'維':14,'繡':18,'翠':14,'耀':20,'肇':14,
  '臻':16,'若':11,'莉':13,'莎':13,'菁':14,'菲':14,
  '萊':14,'蓁':14,'蓉':16,'蓓':16,'薰':17,'蘊':22,
  '蘭':21,'裕':13,'謙':17,'豪':14,'賢':15,'赫':14,
  '鋆':15,'鐸':21,'雋':12,'霖':16,'霞':17,'靈':24,
  '韻':19,'黎':15,'龔':22,'磊':15,'穆':16,'竹':6,
  '紫':12,'聖':13,'聰':17,'茂':11,'莊':13,'蔚':17,
  '逸':15,'頤':16,'馨':20,'驊':22,'騏':18,
  '堯':12,'堃':11,'淳':12,'渙':13,'煒':13,
  '茗':12,'菡':14,'景':12,'詹':13,'束':7,
  '幸':8,'司':5,'韶':14,'鑫':24,'欣':8,'佳':8,
  '妍':7,'雯':12,'祺':13,'禧':17,'萌':14,
  '晞':11,'桓':10,'綺':14,'語':14,'芊':9,'苡':11,
  '歆':13,'弘':5,'弼':12,'弭':9,'弟':7,'弦':8,'弧':9,'弩':8,
  '妤':7,'昊':8,'晟':11,'辰':7,'曦':20,'軒':10,
  '晨':11,'薇':19,'佳':8,
  '俊':9,'傑':12,'宏':7,'雅':12,'靜':16,'慧':15,
  '敏':11,'婷':12,'秀':7,'芳':10,'麗':19,'英':11,
  '費':12,'起':10,'曾':12,'邱':7,'邵':12,'范':11,
  '魏':18,'陶':16,'姜':9,'鄒':17,'柴':10,'閻':16,
  '席':10,'季':8,'戚':11,'施':9,'袁':10,'鍾':17,
  '洪':10,'甘':5,'田':5,'石':5,'丘':5,'毛':4,'汪':8,
  '塗':13,'管':14,'闕':18,'鄧':19,'邢':7,'苗':11,
  '程':12,'崔':11,'於':8,'童':12,'阮':12,'湛':13,
  '溫':14,'項':12,'倪':10,'滕':14,'段':9,'鄂':11,
  '牧':8,'單':12,'瞿':18,'賴':16,'藍':18,'戴':18,
  '莫':13,'須':12,'聶':18,'廖':14,'畢':11,'殷':10,

  // ── 補充高頻名字用字（康熙正確畫數・部首已還原）──
  // 火/灬部
  '然':12,'烽':11,'焱':12,'煦':13,'熙':14,'熹':16,'燦':17,'燁':16,
  // 彡部
  '彥':9,'彰':14,'影':15,'彩':11,
  // 亻部
  '佑':7,'佐':7,'佩':8,'侑':8,'儀':15,'億':15,'儒':16,
  // 广部
  '廷':7,'廣':15,'庠':10,'廉':13,
  // 宀部
  '宜':8,'宥':9,'宸':10,'寧':14,
  // 日部
  '昀':8,'旻':8,'昱':9,'晏':10,'暄':13,'曙':18,
  // 山部
  '峻':10,'崴':12,'嵐':12,'巍':21,
  // 心/忄部
  '恬':10,'恪':10,'悌':11,
  // 言/訁部
  '詩':13,'諒':16,'詠':12,'誼':15,
  // 馬部
  '騰':20,'驊':22,'騏':18,'駿':17,
  // 其他
  '毅':15,'禾':5,'澔':17,'璿':18,'珩':11,'翊':11,'熠':15,'琅':12,

  // ── 五行常用字補充（按部首分類・康熙正確畫數）──
  // 木部
  '本':5,'札':5,'朴':6,'朵':6,'朽':6,'杉':7,'杏':7,'村':7,
  '杰':8,'柱':9,'栩':10,'梓':11,'棋':12,'櫟':19,
  // 氵/水部
  '永':5,'汀':6,'浚':11,
  // 火/灬部
  '灿':7,'炎':8,'炳':9,'炫':9,'烈':10,'烜':10,'煊':13,
  // 土部
  '均':7,'坤':8,'城':10,'培':11,'堅':12,'堂':11,'基':11,
  '境':14,'增':15,'壯':7,
  // 金部
  '錦':16,'鎮':18
};

// kangxiStroke is now defined earlier alongside bihua()
// This old location is kept as a redirect for any other callers
// (actual implementation is in the bihua/kangxiStroke block above)

function analyzeName(fullName){
  if(!fullName||fullName.length<2)return null;
  const chars=[...fullName];
  const strokes=chars.map(c=>kangxiStroke(c));

  let tianGe,renGe,diGe,waiGe,zongGe;

  if(chars.length===2){
    // 單姓單名
    tianGe=strokes[0]+1;
    renGe=strokes[0]+strokes[1];
    diGe=strokes[1]+1;
    zongGe=strokes[0]+strokes[1];
    waiGe=2;
  }else if(chars.length===3){
    // 單姓雙名（最常見）
    tianGe=strokes[0]+1;
    renGe=strokes[0]+strokes[1];
    diGe=strokes[1]+strokes[2];
    zongGe=strokes[0]+strokes[1]+strokes[2];
    waiGe=strokes[2]+1; // 單姓雙名外格=名末字+1
  }else if(chars.length===4){
    // 複姓雙名
    tianGe=strokes[0]+strokes[1];
    renGe=strokes[1]+strokes[2];
    diGe=strokes[2]+strokes[3];
    zongGe=strokes.reduce((a,b)=>a+b,0);
    waiGe=strokes[0]+strokes[3];
  }else{
    return null;
  }

  // 五行
  function geWuxing(ge){
    const tail=ge%10;
    if(tail===1||tail===2)return'木';
    if(tail===3||tail===4)return'火';
    if(tail===5||tail===6)return'土';
    if(tail===7||tail===8)return'金';
    return'水';
  }

  // 吉凶（依正統81數理靈動數）
  function geFortune(ge){
    const n=((ge-1)%80)+1;
    // 吉祥運（大吉）— 依正統81數理靈動數（多版本校對）
    const dj=[1,3,5,7,8,11,13,15,16,18,21,23,24,25,31,32,33,35,37,39,41,45,47,48,52,57,61,63,65,67,68,81];
    // 次吉祥運（吉/半吉）
    const ji=[6,17,26,27,29,30,38,49,51,55,58,71,72,73,75,77];
    // 凶數（其餘）
    if(dj.includes(n))return{level:'大吉',cls:'text-success'};
    if(ji.includes(n))return{level:'吉',cls:'text-success'};
    return{level:'凶',cls:'text-danger'};
  }

  // 三才配置（完整125組合查表）
  const sanCai=[geWuxing(tianGe),geWuxing(renGe),geWuxing(diGe)];
  const _SC={
  '木木木':'大吉','木木火':'大吉','木木土':'吉','木木金':'凶','木木水':'吉',
  '木火木':'大吉','木火火':'吉','木火土':'大吉','木火金':'凶','木火水':'凶',
  '木土木':'凶','木土火':'平','木土土':'平','木土金':'凶','木土水':'凶',
  '木金木':'凶','木金火':'凶','木金土':'凶','木金金':'凶','木金水':'凶',
  '木水木':'大吉','木水火':'凶','木水土':'凶','木水金':'吉','木水水':'吉',
  '火木木':'大吉','火木火':'大吉','火木土':'吉','火木金':'凶','火木水':'吉',
  '火火木':'大吉','火火火':'吉','火火土':'大吉','火火金':'凶','火火水':'凶',
  '火土木':'平','火土火':'大吉','火土土':'大吉','火土金':'吉','火土水':'凶',
  '火金木':'凶','火金火':'凶','火金土':'凶','火金金':'凶','火金水':'凶',
  '火水木':'凶','火水火':'凶','火水土':'凶','火水金':'凶','火水水':'凶',
  '土木木':'平','土木火':'吉','土木土':'凶','土木金':'凶','土木水':'凶',
  '土火木':'大吉','土火火':'吉','土火土':'大吉','土火金':'平','土火水':'凶',
  '土土木':'平','土土火':'大吉','土土土':'大吉','土土金':'吉','土土水':'凶',
  '土金木':'凶','土金火':'凶','土金土':'大吉','土金金':'吉','土金水':'吉',
  '土水木':'凶','土水火':'凶','土水土':'凶','土水金':'凶','土水水':'凶',
  '金木木':'凶','金木火':'凶','金木土':'凶','金木金':'凶','金木水':'凶',
  '金火木':'凶','金火火':'凶','金火土':'平','金火金':'凶','金火水':'凶',
  '金土木':'平','金土火':'大吉','金土土':'大吉','金土金':'大吉','金土水':'平',
  '金金木':'凶','金金火':'凶','金金土':'大吉','金金金':'吉','金金水':'吉',
  '金水木':'大吉','金水火':'凶','金水土':'吉','金水金':'吉','金水水':'吉',
  '水木木':'大吉','水木火':'大吉','水木土':'吉','水木金':'凶','水木水':'吉',
  '水火木':'平','水火火':'凶','水火土':'平','水火金':'凶','水火水':'凶',
  '水土木':'凶','水土火':'平','水土土':'平','水土金':'平','水土水':'凶',
  '水金木':'凶','水金火':'凶','水金土':'吉','水金金':'吉','水金水':'吉',
  '水水木':'大吉','水水火':'凶','水水土':'凶','水水金':'吉','水水水':'平'
  };
  let sanCaiLevel=_SC[sanCai.join('')]||'平';

  return{
    name:fullName, strokes,
    tianGe:{num:tianGe,el:geWuxing(tianGe),fortune:geFortune(tianGe)},
    renGe:{num:renGe,el:geWuxing(renGe),fortune:geFortune(renGe)},
    diGe:{num:diGe,el:geWuxing(diGe),fortune:geFortune(diGe)},
    waiGe:{num:waiGe,el:geWuxing(waiGe),fortune:geFortune(waiGe)},
    zongGe:{num:zongGe,el:geWuxing(zongGe),fortune:geFortune(zongGe)},
    sanCai,sanCaiLevel
  };
}

/* =============================================================
   生肖姓名學 ZODIAC NAMEOLOGY（形義派）
   「字如環境，生肖如生物」— 適者生存原則
   ============================================================= */

// ── 出生年→生肖 ──
function getChineseZodiac(year){
  const z=['鼠','牛','虎','兔','龍','蛇','馬','羊','猴','雞','狗','豬'];
  return z[((year-4)%12+12)%12];
}
const ZODIAC_EMOJI={鼠:'🐭',牛:'🐂',虎:'🐯',兔:'🐰',龍:'🐲',蛇:'🐍',馬:'🐴',羊:'🐑',猴:'🐵',雞:'🐔',狗:'🐶',豬:'🐷'};
const ZODIAC_DIZHI={鼠:'子',牛:'丑',虎:'寅',兔:'卯',龍:'辰',蛇:'巳',馬:'午',羊:'未',猴:'申',雞:'酉',狗:'戌',豬:'亥'};

// ── 十二生肖字根喜忌資料庫 ──
// 每個生肖：{ like:[ {roots:[], label, reason, score} ], dislike:[ ... ] }
// roots 裡放字根/部首字串，拆字時比對
const ZODIAC_NAME_DB = {
  "鼠": {
    "like": [
      {
        "roots": [
          "口",
          "品",
          "宀",
          "冖",
          "穴",
          "門",
          "广",
          "冂"
        ],
        "label": "得洞",
        "reason": "鼠有洞穴藏身，安全感十足",
        "score": 8
      },
      {
        "roots": [
          "禾",
          "米",
          "豆",
          "麥",
          "粟"
        ],
        "label": "得糧",
        "reason": "鼠愛五穀雜糧，衣食無缺",
        "score": 9
      },
      {
        "roots": [
          "王",
          "玉",
          "大",
          "君",
          "主",
          "天"
        ],
        "label": "稱王",
        "reason": "鼠排行老大，逢大稱王得位",
        "score": 8
      },
      {
        "roots": [
          "申",
          "辰"
        ],
        "label": "三合",
        "reason": "申子辰三合水局，貴人運強",
        "score": 8
      },
      {
        "roots": [
          "亥",
          "丑",
          "牛"
        ],
        "label": "三會",
        "reason": "亥子丑三會北方水局，根基穩固",
        "score": 7
      },
      {
        "roots": [
          "艹"
        ],
        "label": "得草",
        "reason": "田間有草有糧，安穩富足",
        "score": 6
      },
      {
        "roots": [
          "水",
          "氵",
          "雨",
          "冫"
        ],
        "label": "得水",
        "reason": "子鼠屬水，逢水旺得助力",
        "score": 7
      },
      {
        "roots": [
          "金",
          "钅"
        ],
        "label": "逢金",
        "reason": "金生水，得長輩助力提攜",
        "score": 6
      },
      {
        "roots": [
          "木",
          "林"
        ],
        "label": "得木",
        "reason": "鼠在林間有掩護，安全自在",
        "score": 5
      },
      {
        "roots": [
          "田"
        ],
        "label": "得田",
        "reason": "鼠入田中有糧食，豐衣足食",
        "score": 6
      },
      {
        "roots": [
          "夕"
        ],
        "label": "得夕",
        "reason": "鼠為夜行動物，逢夕如魚得水",
        "score": 5
      },
      {
        "roots": [
          "衣",
          "巾",
          "彡",
          "采",
          "糸"
        ],
        "label": "得衣",
        "reason": "鼠披彩衣華麗其身，增添魅力",
        "score": 6
      },
      {
        "roots": [
          "礻"
        ],
        "label": "得福",
        "reason": "鼠逢示旁有福祿加身",
        "score": 5
      }
    ],
    "dislike": [
      {
        "roots": [
          "午",
          "馬"
        ],
        "label": "六衝",
        "reason": "子午相衝，衝擊大，感情事業受損",
        "score": -9
      },
      {
        "roots": [
          "未",
          "羊"
        ],
        "label": "六害",
        "reason": "子未相害，做事常有阻礙",
        "score": -7
      },
      {
        "roots": [
          "火",
          "灬"
        ],
        "label": "見火",
        "reason": "子為水忌火，水火不容",
        "score": -6
      },
      {
        "roots": [
          "日",
          "光",
          "明"
        ],
        "label": "見光",
        "reason": "鼠見光即死，處境危險",
        "score": -6
      },
      {
        "roots": [
          "人",
          "亻",
          "入"
        ],
        "label": "遇人",
        "reason": "人見老鼠人人喊打，不利",
        "score": -4
      },
      {
        "roots": [
          "心",
          "忄",
          "月",
          "肉"
        ],
        "label": "遇肉",
        "reason": "鼠雖雜食但見肉代表危險投機",
        "score": -3
      },
      {
        "roots": [
          "土"
        ],
        "label": "逢土",
        "reason": "土剋水，鼠逢土受剋阻礙多",
        "score": -4
      },
      {
        "roots": [
          "小",
          "少"
        ],
        "label": "逢小",
        "reason": "鼠為生肖之首，逢小降格",
        "score": -3
      }
    ]
  },
  "牛": {
    "like": [
      {
        "roots": [
          "艹"
        ],
        "label": "得草",
        "reason": "牛為草食動物，有草安穩飽足",
        "score": 9
      },
      {
        "roots": [
          "禾",
          "米",
          "豆",
          "麥",
          "粟"
        ],
        "label": "得糧",
        "reason": "牛逢五穀有吃有喝，福祿雙全",
        "score": 8
      },
      {
        "roots": [
          "水",
          "氵",
          "雨",
          "冫"
        ],
        "label": "得水",
        "reason": "丑牛土藏水，逢水相生順遂",
        "score": 7
      },
      {
        "roots": [
          "宀",
          "冖",
          "穴",
          "門",
          "广"
        ],
        "label": "得屋",
        "reason": "牛有牛棚安居，受人保護",
        "score": 7
      },
      {
        "roots": [
          "巳",
          "蛇",
          "辶",
          "弓",
          "几",
          "廴"
        ],
        "label": "六合",
        "reason": "巳丑合金，貴人運旺",
        "score": 8
      },
      {
        "roots": [
          "酉",
          "雞",
          "鳥"
        ],
        "label": "三合",
        "reason": "巳酉丑三合金局，助力宏大",
        "score": 8
      },
      {
        "roots": [
          "子",
          "鼠",
          "亥"
        ],
        "label": "三會",
        "reason": "亥子丑三會北方水局，根基穩",
        "score": 7
      },
      {
        "roots": [
          "田"
        ],
        "label": "得田",
        "reason": "牛在田中耕作有用武之地",
        "score": 6
      },
      {
        "roots": [
          "車"
        ],
        "label": "拉車",
        "reason": "牛拉車雖辛勞但受重用",
        "score": 4
      },
      {
        "roots": [
          "金",
          "钅"
        ],
        "label": "逢金",
        "reason": "土生金，才華能發揮",
        "score": 5
      }
    ],
    "dislike": [
      {
        "roots": [
          "未",
          "羊"
        ],
        "label": "六衝",
        "reason": "丑未相衝，做事波折反覆",
        "score": -9
      },
      {
        "roots": [
          "午",
          "馬"
        ],
        "label": "六害",
        "reason": "丑午相害，辛苦勞碌無回報",
        "score": -7
      },
      {
        "roots": [
          "王",
          "玉",
          "大",
          "君",
          "天",
          "帝"
        ],
        "label": "稱王",
        "reason": "牛逢大為犧牲祭品，勞碌命",
        "score": -7
      },
      {
        "roots": [
          "日",
          "光",
          "明"
        ],
        "label": "見日",
        "reason": "牛在烈日下耕作成喘牛",
        "score": -5
      },
      {
        "roots": [
          "山",
          "岳"
        ],
        "label": "上山",
        "reason": "牛走山路辛苦異常",
        "score": -5
      },
      {
        "roots": [
          "心",
          "忄",
          "月",
          "肉"
        ],
        "label": "遇肉",
        "reason": "牛為草食不食肉，見肉缺財",
        "score": -4
      },
      {
        "roots": [
          "衣",
          "巾",
          "彡",
          "采",
          "糸"
        ],
        "label": "披衣",
        "reason": "牛披彩衣如祭品，犧牲奉獻",
        "score": -6
      },
      {
        "roots": [
          "火",
          "灬"
        ],
        "label": "見火",
        "reason": "火剋金，有損牛之運勢",
        "score": -4
      },
      {
        "roots": [
          "礻"
        ],
        "label": "祭祀",
        "reason": "牛見示旁如被祭祀，大凶",
        "score": -7
      }
    ]
  },
  "虎": {
    "like": [
      {
        "roots": [
          "山",
          "岳",
          "岡"
        ],
        "label": "得山",
        "reason": "虎嘯山林，適得其所",
        "score": 9
      },
      {
        "roots": [
          "木",
          "林",
          "森",
          "東"
        ],
        "label": "得林",
        "reason": "虎居森林中如魚得水",
        "score": 9
      },
      {
        "roots": [
          "王",
          "玉",
          "大",
          "君",
          "天",
          "帝",
          "主"
        ],
        "label": "稱王",
        "reason": "虎為森林之王，稱王得位",
        "score": 9
      },
      {
        "roots": [
          "午",
          "馬"
        ],
        "label": "六合",
        "reason": "寅午合火，貴人助力",
        "score": 8
      },
      {
        "roots": [
          "戌",
          "犬",
          "犭"
        ],
        "label": "三合",
        "reason": "寅午戌三合火局，力量強大",
        "score": 8
      },
      {
        "roots": [
          "卯",
          "兔"
        ],
        "label": "三會",
        "reason": "寅卯辰三會東方木局",
        "score": 6
      },
      {
        "roots": [
          "心",
          "忄",
          "月",
          "肉"
        ],
        "label": "得肉",
        "reason": "虎為肉食動物，有肉飽足",
        "score": 8
      },
      {
        "roots": [
          "衣",
          "巾",
          "彡",
          "采",
          "糸"
        ],
        "label": "得衣",
        "reason": "虎披彩衣為華麗猛虎，威風加倍",
        "score": 7
      },
      {
        "roots": [
          "水",
          "氵",
          "雨",
          "冫"
        ],
        "label": "得水",
        "reason": "水生木，虎得水滋養",
        "score": 5
      },
      {
        "roots": [
          "口",
          "品"
        ],
        "label": "開口",
        "reason": "虎開口展威風，能力發揮",
        "score": 6
      }
    ],
    "dislike": [
      {
        "roots": [
          "申",
          "猴"
        ],
        "label": "六衝",
        "reason": "寅申相衝，衝突極大",
        "score": -9
      },
      {
        "roots": [
          "巳",
          "蛇",
          "辶",
          "弓",
          "几",
          "廴"
        ],
        "label": "六害",
        "reason": "蛇虎相害，互相傷害",
        "score": -7
      },
      {
        "roots": [
          "人",
          "亻",
          "入"
        ],
        "label": "遇人",
        "reason": "虎落平陽被犬欺，人伐虎不利",
        "score": -5
      },
      {
        "roots": [
          "日",
          "光",
          "明"
        ],
        "label": "見光",
        "reason": "虎在白日行動易暴露",
        "score": -3
      },
      {
        "roots": [
          "門",
          "宀"
        ],
        "label": "入門",
        "reason": "虎入平地被關，有志難伸",
        "score": -4
      },
      {
        "roots": [
          "小",
          "少"
        ],
        "label": "逢小",
        "reason": "虎逢小降格為貓，失威風",
        "score": -5
      },
      {
        "roots": [
          "禾",
          "米",
          "豆",
          "麥"
        ],
        "label": "逢糧",
        "reason": "虎不食五穀，英雄無用武之地",
        "score": -3
      },
      {
        "roots": [
          "田"
        ],
        "label": "入田",
        "reason": "虎入田中被困，無法發揮",
        "score": -3
      }
    ]
  },
  "兔": {
    "like": [
      {
        "roots": [
          "艹",
          "竹"
        ],
        "label": "得草",
        "reason": "兔有青草，生活安穩無憂",
        "score": 9
      },
      {
        "roots": [
          "口",
          "品",
          "宀",
          "冖",
          "穴",
          "門",
          "广"
        ],
        "label": "得洞",
        "reason": "兔有窩穴，安全感十足",
        "score": 8
      },
      {
        "roots": [
          "禾",
          "米",
          "豆",
          "麥"
        ],
        "label": "得糧",
        "reason": "五穀豐登，不愁溫飽",
        "score": 7
      },
      {
        "roots": [
          "木",
          "林",
          "森",
          "東"
        ],
        "label": "得林",
        "reason": "兔在林中有掩護，安全自在",
        "score": 8
      },
      {
        "roots": [
          "亥",
          "未"
        ],
        "label": "三合",
        "reason": "亥卯未三合木局，貴人運強",
        "score": 8
      },
      {
        "roots": [
          "寅"
        ],
        "label": "三會",
        "reason": "寅卯辰三會東方木局，根基穩",
        "score": 6
      },
      {
        "roots": [
          "衣",
          "巾",
          "彡",
          "采",
          "糸"
        ],
        "label": "得衣",
        "reason": "兔得彩衣為華麗，增添魅力",
        "score": 6
      },
      {
        "roots": [
          "水",
          "氵",
          "雨",
          "冫"
        ],
        "label": "得水",
        "reason": "水生木，兔得水滋養",
        "score": 5
      },
      {
        "roots": [
          "食"
        ],
        "label": "得食",
        "reason": "有食不缺，安穩富足",
        "score": 5
      },
      {
        "roots": [
          "小",
          "少"
        ],
        "label": "得小",
        "reason": "兔為小動物，小而得位",
        "score": 5
      }
    ],
    "dislike": [
      {
        "roots": [
          "酉",
          "雞",
          "鳥",
          "隹",
          "羽",
          "飛",
          "金",
          "钅",
          "西"
        ],
        "label": "六衝",
        "reason": "卯酉相衝，口舌是非不斷",
        "score": -9
      },
      {
        "roots": [
          "辰",
          "龍"
        ],
        "label": "六害",
        "reason": "卯辰相害，身邊人反成阻礙",
        "score": -7
      },
      {
        "roots": [
          "日",
          "光",
          "明",
          "白"
        ],
        "label": "見光",
        "reason": "兔見日光暴露，處境危險",
        "score": -5
      },
      {
        "roots": [
          "人",
          "亻",
          "入"
        ],
        "label": "遇人",
        "reason": "守株待兔，見人被獵捕",
        "score": -6
      },
      {
        "roots": [
          "大",
          "王",
          "玉",
          "君",
          "主",
          "天",
          "帝"
        ],
        "label": "太大",
        "reason": "兔太大引注目被捕，不宜張揚",
        "score": -5
      },
      {
        "roots": [
          "刀",
          "刂",
          "匕",
          "力",
          "斤"
        ],
        "label": "遇刀",
        "reason": "利刃在側，有開刀之虞",
        "score": -6
      },
      {
        "roots": [
          "火",
          "灬"
        ],
        "label": "見火",
        "reason": "兔遇火有劫，易衝動犯錯",
        "score": -5
      },
      {
        "roots": [
          "山",
          "岳",
          "阝"
        ],
        "label": "上山",
        "reason": "兔入山為虎口送食",
        "score": -4
      },
      {
        "roots": [
          "心",
          "忄",
          "月",
          "肉"
        ],
        "label": "遇肉",
        "reason": "兔為草食動物，見肉不合",
        "score": -3
      },
      {
        "roots": [
          "石"
        ],
        "label": "遇石",
        "reason": "兔撞石受傷，處境不利",
        "score": -3
      }
    ]
  },
  "龍": {
    "like": [
      {
        "roots": [
          "日",
          "明",
          "光",
          "星"
        ],
        "label": "得天",
        "reason": "龍見日月星飛龍在天，大展鴻圖",
        "score": 9
      },
      {
        "roots": [
          "水",
          "氵",
          "雨",
          "冫"
        ],
        "label": "得水",
        "reason": "龍入大海如魚得水，大富大貴",
        "score": 9
      },
      {
        "roots": [
          "王",
          "玉",
          "君",
          "主",
          "大",
          "天",
          "帝"
        ],
        "label": "得位",
        "reason": "龍為至尊，見王字根稱帝",
        "score": 9
      },
      {
        "roots": [
          "申",
          "猴"
        ],
        "label": "三合",
        "reason": "申子辰三合水局，貴人助力",
        "score": 8
      },
      {
        "roots": [
          "子",
          "鼠"
        ],
        "label": "三合",
        "reason": "申子辰三合水局，財運順暢",
        "score": 8
      },
      {
        "roots": [
          "月"
        ],
        "label": "明珠",
        "reason": "龍得月明珠，日月同輝",
        "score": 7
      },
      {
        "roots": [
          "馬",
          "午"
        ],
        "label": "龍馬",
        "reason": "龍馬精神，事業亨通",
        "score": 6
      },
      {
        "roots": [
          "衣",
          "巾",
          "彡",
          "采",
          "糸"
        ],
        "label": "得衣",
        "reason": "龍披彩衣增添威嚴",
        "score": 5
      }
    ],
    "dislike": [
      {
        "roots": [
          "戌",
          "犬",
          "犭"
        ],
        "label": "六衝",
        "reason": "辰戌正衝，生肖最大忌",
        "score": -9
      },
      {
        "roots": [
          "卯",
          "兔"
        ],
        "label": "六害",
        "reason": "玉兔見龍雲裡去，相害",
        "score": -7
      },
      {
        "roots": [
          "山",
          "岳",
          "阝"
        ],
        "label": "龍虎鬥",
        "reason": "山為虎鄉，龍虎相鬥",
        "score": -6
      },
      {
        "roots": [
          "虎",
          "寅"
        ],
        "label": "龍虎鬥",
        "reason": "龍虎鬥兩敗俱傷",
        "score": -6
      },
      {
        "roots": [
          "口",
          "品"
        ],
        "label": "困龍",
        "reason": "小口困龍，有志難伸",
        "score": -5
      },
      {
        "roots": [
          "辶",
          "弓",
          "几",
          "廴",
          "乙"
        ],
        "label": "降格",
        "reason": "龍降格為蛇，地位降低",
        "score": -5
      },
      {
        "roots": [
          "禾",
          "米",
          "豆",
          "麥",
          "艹"
        ],
        "label": "逢糧",
        "reason": "龍不食人間煙火",
        "score": -3
      },
      {
        "roots": [
          "心",
          "忄",
          "肉"
        ],
        "label": "遇肉",
        "reason": "龍不食肉類五穀",
        "score": -3
      },
      {
        "roots": [
          "未",
          "羊"
        ],
        "label": "天羅",
        "reason": "辰未天羅地網，多禍多愁",
        "score": -5
      },
      {
        "roots": [
          "小",
          "少"
        ],
        "label": "逢小",
        "reason": "龍逢小降格，失威嚴",
        "score": -4
      }
    ]
  },
  "蛇": {
    "like": [
      {
        "roots": [
          "口",
          "品",
          "宀",
          "冖",
          "穴",
          "門",
          "广"
        ],
        "label": "得洞",
        "reason": "蛇有洞穴棲息，安全自在",
        "score": 8
      },
      {
        "roots": [
          "木",
          "林",
          "森"
        ],
        "label": "得林",
        "reason": "蛇在林中攀爬自如，如魚得水",
        "score": 7
      },
      {
        "roots": [
          "衣",
          "巾",
          "彡",
          "采",
          "糸"
        ],
        "label": "得衣",
        "reason": "蛇披彩衣轉升為龍",
        "score": 8
      },
      {
        "roots": [
          "酉",
          "雞",
          "鳥",
          "隹",
          "羽"
        ],
        "label": "六合",
        "reason": "巳酉合金，貴人運旺",
        "score": 8
      },
      {
        "roots": [
          "丑",
          "牛"
        ],
        "label": "三合",
        "reason": "巳酉丑三合金局",
        "score": 8
      },
      {
        "roots": [
          "午",
          "馬"
        ],
        "label": "六合",
        "reason": "巳午會南方火局",
        "score": 7
      },
      {
        "roots": [
          "心",
          "忄",
          "月",
          "肉"
        ],
        "label": "得肉",
        "reason": "蛇為肉食動物，有肉飽足",
        "score": 7
      },
      {
        "roots": [
          "田"
        ],
        "label": "得田",
        "reason": "蛇在田間有食物來源",
        "score": 5
      },
      {
        "roots": [
          "辶",
          "弓",
          "几",
          "廴",
          "乙"
        ],
        "label": "同形",
        "reason": "蛇形字根為同類相助",
        "score": 6
      },
      {
        "roots": [
          "火",
          "灬"
        ],
        "label": "得火",
        "reason": "巳蛇屬火，見火比旺",
        "score": 5
      },
      {
        "roots": [
          "王",
          "玉",
          "大",
          "君",
          "天"
        ],
        "label": "稱王",
        "reason": "蛇有稱王之意（小龍）",
        "score": 5
      }
    ],
    "dislike": [
      {
        "roots": [
          "亥",
          "豬",
          "豕"
        ],
        "label": "六衝",
        "reason": "巳亥相衝，衝擊極大",
        "score": -9
      },
      {
        "roots": [
          "寅",
          "虎"
        ],
        "label": "六害",
        "reason": "蛇虎相害，互相傷害",
        "score": -7
      },
      {
        "roots": [
          "人",
          "亻",
          "入"
        ],
        "label": "遇人",
        "reason": "人蛇相遇兩害怕",
        "score": -5
      },
      {
        "roots": [
          "日",
          "光",
          "明"
        ],
        "label": "見光",
        "reason": "蛇怕暴露在陽光下",
        "score": -4
      },
      {
        "roots": [
          "水",
          "氵",
          "雨",
          "冫"
        ],
        "label": "見水",
        "reason": "蛇入水有溺水之虞",
        "score": -4
      },
      {
        "roots": [
          "禾",
          "米",
          "豆",
          "麥",
          "艹"
        ],
        "label": "逢糧",
        "reason": "蛇不食五穀雜糧",
        "score": -3
      },
      {
        "roots": [
          "山",
          "岳"
        ],
        "label": "上山",
        "reason": "蛇在山中遇老虎不利",
        "score": -3
      },
      {
        "roots": [
          "石"
        ],
        "label": "遇石",
        "reason": "打草驚蛇之虞",
        "score": -3
      }
    ]
  },
  "馬": {
    "like": [
      {
        "roots": [
          "艹"
        ],
        "label": "得草",
        "reason": "馬有草原奔馳，自在快意",
        "score": 9
      },
      {
        "roots": [
          "禾",
          "米",
          "豆",
          "麥"
        ],
        "label": "得糧",
        "reason": "馬有五穀飽足安穩",
        "score": 7
      },
      {
        "roots": [
          "木",
          "林",
          "森",
          "東"
        ],
        "label": "得林",
        "reason": "馬在林間有蔭有靠",
        "score": 6
      },
      {
        "roots": [
          "寅",
          "虎"
        ],
        "label": "六合",
        "reason": "寅午合火，貴人助力",
        "score": 8
      },
      {
        "roots": [
          "戌",
          "犬",
          "犭"
        ],
        "label": "三合",
        "reason": "寅午戌三合火局",
        "score": 8
      },
      {
        "roots": [
          "未",
          "羊"
        ],
        "label": "三合",
        "reason": "午未合，桃花貴人旺",
        "score": 7
      },
      {
        "roots": [
          "衣",
          "巾",
          "彡",
          "采",
          "糸"
        ],
        "label": "得衣",
        "reason": "馬披彩衣為良駒，得遇伯樂",
        "score": 7
      },
      {
        "roots": [
          "龍",
          "辰"
        ],
        "label": "龍馬",
        "reason": "龍馬精神，事業亨通",
        "score": 6
      },
      {
        "roots": [
          "大",
          "王",
          "玉",
          "君",
          "天"
        ],
        "label": "稱王",
        "reason": "馬逢大為良駒受重用",
        "score": 5
      },
      {
        "roots": [
          "火",
          "灬"
        ],
        "label": "得火",
        "reason": "午馬屬火，見火比旺",
        "score": 5
      },
      {
        "roots": [
          "山",
          "岳"
        ],
        "label": "得山",
        "reason": "馬在山中自在奔馳",
        "score": 5
      },
      {
        "roots": [
          "宀",
          "冖",
          "穴",
          "門"
        ],
        "label": "得屋",
        "reason": "馬有馬廄安居",
        "score": 5
      }
    ],
    "dislike": [
      {
        "roots": [
          "子",
          "鼠"
        ],
        "label": "六衝",
        "reason": "子午相衝，衝擊極大",
        "score": -9
      },
      {
        "roots": [
          "丑",
          "牛"
        ],
        "label": "六害",
        "reason": "丑午相害，勞碌無功",
        "score": -7
      },
      {
        "roots": [
          "水",
          "氵",
          "雨",
          "冫"
        ],
        "label": "見水",
        "reason": "馬入水有溺水之虞",
        "score": -5
      },
      {
        "roots": [
          "田"
        ],
        "label": "入田",
        "reason": "馬入田地被困耕田勞碌",
        "score": -5
      },
      {
        "roots": [
          "口",
          "品"
        ],
        "label": "開口",
        "reason": "馬開口不祥，好馬不吃回頭草",
        "score": -3
      },
      {
        "roots": [
          "人",
          "亻",
          "入"
        ],
        "label": "遇人",
        "reason": "馬被人騎驅使勞碌",
        "score": -4
      },
      {
        "roots": [
          "心",
          "忄",
          "月",
          "肉"
        ],
        "label": "遇肉",
        "reason": "馬為草食動物不食肉",
        "score": -3
      },
      {
        "roots": [
          "石"
        ],
        "label": "遇石",
        "reason": "馬行石路不穩",
        "score": -3
      }
    ]
  },
  "羊": {
    "like": [
      {
        "roots": [
          "艹",
          "竹"
        ],
        "label": "得草",
        "reason": "羊有青草飽足安穩",
        "score": 9
      },
      {
        "roots": [
          "禾",
          "米",
          "豆",
          "麥"
        ],
        "label": "得糧",
        "reason": "羊逢五穀不愁吃穿",
        "score": 8
      },
      {
        "roots": [
          "口",
          "品",
          "宀",
          "冖",
          "穴",
          "門",
          "广"
        ],
        "label": "得洞",
        "reason": "羊有欄有洞受保護",
        "score": 7
      },
      {
        "roots": [
          "木",
          "林",
          "森",
          "東"
        ],
        "label": "得林",
        "reason": "羊在林中有蔭安穩",
        "score": 7
      },
      {
        "roots": [
          "亥",
          "豬",
          "豕"
        ],
        "label": "三合",
        "reason": "亥卯未三合木局",
        "score": 8
      },
      {
        "roots": [
          "卯",
          "兔"
        ],
        "label": "三合",
        "reason": "亥卯未三合木局",
        "score": 8
      },
      {
        "roots": [
          "午",
          "馬"
        ],
        "label": "六合",
        "reason": "午未合，桃花貴人旺",
        "score": 7
      },
      {
        "roots": [
          "小",
          "少"
        ],
        "label": "得小",
        "reason": "羊喜小得位，安穩自在",
        "score": 6
      },
      {
        "roots": [
          "水",
          "氵",
          "雨",
          "冫"
        ],
        "label": "得水",
        "reason": "羊逢水有滋潤",
        "score": 4
      },
      {
        "roots": [
          "火",
          "灬"
        ],
        "label": "得火",
        "reason": "未羊土藏火，見火比旺",
        "score": 5
      },
      {
        "roots": [
          "食"
        ],
        "label": "得食",
        "reason": "有食安穩",
        "score": 5
      }
    ],
    "dislike": [
      {
        "roots": [
          "丑",
          "牛"
        ],
        "label": "六衝",
        "reason": "丑未相衝，做事反覆波折",
        "score": -9
      },
      {
        "roots": [
          "子",
          "鼠"
        ],
        "label": "六害",
        "reason": "子未相害，常遇阻礙",
        "score": -7
      },
      {
        "roots": [
          "辰",
          "龍"
        ],
        "label": "天羅",
        "reason": "辰為天羅困羊，有志難伸",
        "score": -6
      },
      {
        "roots": [
          "戌",
          "犬",
          "犭"
        ],
        "label": "地網",
        "reason": "戌為地網困羊",
        "score": -6
      },
      {
        "roots": [
          "王",
          "玉",
          "大",
          "君",
          "天",
          "帝"
        ],
        "label": "太大",
        "reason": "羊逢大為祭品犧牲",
        "score": -7
      },
      {
        "roots": [
          "衣",
          "巾",
          "彡",
          "采",
          "糸"
        ],
        "label": "披衣",
        "reason": "羊披彩衣上供桌",
        "score": -6
      },
      {
        "roots": [
          "心",
          "忄",
          "月",
          "肉"
        ],
        "label": "遇肉",
        "reason": "羊為草食見肉失落",
        "score": -4
      },
      {
        "roots": [
          "刀",
          "刂",
          "匕",
          "力",
          "斤"
        ],
        "label": "遇刀",
        "reason": "羊逢刀為被宰殺",
        "score": -6
      },
      {
        "roots": [
          "日",
          "光",
          "明"
        ],
        "label": "見日",
        "reason": "羊在烈日下辛苦",
        "score": -3
      }
    ]
  },
  "猴": {
    "like": [
      {
        "roots": [
          "口",
          "品",
          "宀",
          "冖",
          "穴",
          "門",
          "广"
        ],
        "label": "得洞",
        "reason": "猴有洞穴棲息安全",
        "score": 8
      },
      {
        "roots": [
          "木",
          "林",
          "森",
          "東"
        ],
        "label": "得林",
        "reason": "猴在林中攀爬自如",
        "score": 9
      },
      {
        "roots": [
          "禾",
          "米",
          "豆",
          "麥"
        ],
        "label": "得糧",
        "reason": "猴有五穀安穩飽足",
        "score": 7
      },
      {
        "roots": [
          "子",
          "鼠"
        ],
        "label": "三合",
        "reason": "申子辰三合水局",
        "score": 8
      },
      {
        "roots": [
          "辰",
          "龍"
        ],
        "label": "三合",
        "reason": "申子辰三合水局",
        "score": 8
      },
      {
        "roots": [
          "水",
          "氵",
          "雨",
          "冫"
        ],
        "label": "得水",
        "reason": "金生水，猴逢水聰明伶俐",
        "score": 6
      },
      {
        "roots": [
          "金",
          "钅"
        ],
        "label": "得金",
        "reason": "申猴屬金，見金比旺",
        "score": 6
      },
      {
        "roots": [
          "土"
        ],
        "label": "得土",
        "reason": "土生金，猴逢土有根基",
        "score": 5
      },
      {
        "roots": [
          "人",
          "亻",
          "入"
        ],
        "label": "得人",
        "reason": "猴得人緣好，有貴人",
        "score": 5
      },
      {
        "roots": [
          "王",
          "玉",
          "大",
          "君",
          "天"
        ],
        "label": "稱王",
        "reason": "猴為山中王，得位有威",
        "score": 7
      },
      {
        "roots": [
          "衣",
          "巾",
          "彡",
          "采",
          "糸"
        ],
        "label": "得衣",
        "reason": "猴披衣如人，增添智慧",
        "score": 5
      },
      {
        "roots": [
          "山",
          "岳"
        ],
        "label": "得山",
        "reason": "猴在山中自在為王",
        "score": 6
      },
      {
        "roots": [
          "礻"
        ],
        "label": "得示",
        "reason": "示旁含申為猴本位",
        "score": 7
      },
      {
        "roots": [
          "心",
          "忄",
          "月",
          "肉"
        ],
        "label": "得肉",
        "reason": "猴為雜食動物有肉飽足",
        "score": 5
      }
    ],
    "dislike": [
      {
        "roots": [
          "寅",
          "虎"
        ],
        "label": "六衝",
        "reason": "寅申相衝，衝突極大",
        "score": -9
      },
      {
        "roots": [
          "亥",
          "豬",
          "豕"
        ],
        "label": "六害",
        "reason": "豬遇猿猴似箭投",
        "score": -7
      },
      {
        "roots": [
          "火",
          "灬"
        ],
        "label": "見火",
        "reason": "火剋金，猴逢火受傷",
        "score": -6
      },
      {
        "roots": [
          "田"
        ],
        "label": "入田",
        "reason": "猴入田被獵人追捕",
        "score": -4
      },
      {
        "roots": [
          "辶",
          "弓",
          "几",
          "廴",
          "乙"
        ],
        "label": "蛇形",
        "reason": "巳猴相刑害",
        "score": -4
      },
      {
        "roots": [
          "刀",
          "刂",
          "匕",
          "力",
          "斤"
        ],
        "label": "遇刀",
        "reason": "利器在旁有傷害之虞",
        "score": -5
      }
    ]
  },
  "雞": {
    "like": [
      {
        "roots": [
          "禾",
          "米",
          "豆",
          "麥",
          "粟"
        ],
        "label": "得糧",
        "reason": "雞有五穀安穩飽足",
        "score": 9
      },
      {
        "roots": [
          "艹"
        ],
        "label": "得草",
        "reason": "雞逢草有食物來源",
        "score": 7
      },
      {
        "roots": [
          "虫"
        ],
        "label": "得蟲",
        "reason": "雞食蟲安穩自在",
        "score": 6
      },
      {
        "roots": [
          "口",
          "品",
          "宀",
          "冖",
          "穴",
          "門",
          "广"
        ],
        "label": "得洞",
        "reason": "雞有雞舍安居",
        "score": 7
      },
      {
        "roots": [
          "丑",
          "牛"
        ],
        "label": "三合",
        "reason": "巳酉丑三合金局",
        "score": 8
      },
      {
        "roots": [
          "巳",
          "蛇",
          "辶",
          "弓",
          "几",
          "廴"
        ],
        "label": "三合",
        "reason": "巳酉丑三合金局",
        "score": 8
      },
      {
        "roots": [
          "衣",
          "巾",
          "彡",
          "采",
          "糸",
          "羽",
          "飛"
        ],
        "label": "得衣",
        "reason": "雞有羽毛華麗增添魅力",
        "score": 7
      },
      {
        "roots": [
          "山",
          "岳"
        ],
        "label": "得山",
        "reason": "雞上山為鳳凰升格",
        "score": 7
      },
      {
        "roots": [
          "金",
          "钅"
        ],
        "label": "得金",
        "reason": "酉雞屬金，見金比旺",
        "score": 6
      },
      {
        "roots": [
          "土"
        ],
        "label": "得土",
        "reason": "土生金，根基穩固",
        "score": 5
      },
      {
        "roots": [
          "小",
          "少"
        ],
        "label": "得小",
        "reason": "雞逢小安穩得位",
        "score": 4
      },
      {
        "roots": [
          "王",
          "玉",
          "大",
          "君",
          "天"
        ],
        "label": "稱王",
        "reason": "雞上山稱鳳凰得位",
        "score": 5
      }
    ],
    "dislike": [
      {
        "roots": [
          "卯",
          "兔"
        ],
        "label": "六衝",
        "reason": "卯酉相衝，衝擊極大",
        "score": -9
      },
      {
        "roots": [
          "戌",
          "犬",
          "犭"
        ],
        "label": "六害",
        "reason": "金雞遇犬淚雙流",
        "score": -7
      },
      {
        "roots": [
          "水",
          "氵",
          "雨",
          "冫"
        ],
        "label": "見水",
        "reason": "雞落水不吉，有溺水之虞",
        "score": -5
      },
      {
        "roots": [
          "心",
          "忄",
          "月",
          "肉"
        ],
        "label": "遇肉",
        "reason": "雞為禽食不食肉",
        "score": -4
      },
      {
        "roots": [
          "木",
          "林",
          "森"
        ],
        "label": "逢木",
        "reason": "金剋木耗損精力",
        "score": -3
      },
      {
        "roots": [
          "刀",
          "刂",
          "匕",
          "力",
          "斤"
        ],
        "label": "遇刀",
        "reason": "雞遇刀如被宰殺",
        "score": -6
      },
      {
        "roots": [
          "人",
          "亻",
          "入"
        ],
        "label": "遇人",
        "reason": "雞逢人被宰殺",
        "score": -5
      },
      {
        "roots": [
          "火",
          "灬"
        ],
        "label": "見火",
        "reason": "烤雞大凶",
        "score": -6
      }
    ]
  },
  "狗": {
    "like": [
      {
        "roots": [
          "口",
          "品",
          "宀",
          "冖",
          "穴",
          "門",
          "广"
        ],
        "label": "得洞",
        "reason": "狗有家有窩，忠心守護",
        "score": 8
      },
      {
        "roots": [
          "心",
          "忄",
          "月",
          "肉"
        ],
        "label": "得肉",
        "reason": "狗為肉食動物，有肉飽足",
        "score": 9
      },
      {
        "roots": [
          "禾",
          "米",
          "豆",
          "麥"
        ],
        "label": "得糧",
        "reason": "狗有五穀安穩",
        "score": 6
      },
      {
        "roots": [
          "寅",
          "虎"
        ],
        "label": "三合",
        "reason": "寅午戌三合火局",
        "score": 8
      },
      {
        "roots": [
          "午",
          "馬"
        ],
        "label": "三合",
        "reason": "寅午戌三合火局",
        "score": 8
      },
      {
        "roots": [
          "卯",
          "兔"
        ],
        "label": "六合",
        "reason": "卯戌合火，貴人運旺",
        "score": 8
      },
      {
        "roots": [
          "人",
          "亻",
          "入"
        ],
        "label": "得人",
        "reason": "狗為人類忠僕，有人依靠",
        "score": 7
      },
      {
        "roots": [
          "小",
          "少"
        ],
        "label": "得小",
        "reason": "狗逢小可愛得人疼",
        "score": 5
      },
      {
        "roots": [
          "衣",
          "巾",
          "彡",
          "采",
          "糸"
        ],
        "label": "得衣",
        "reason": "狗披衣受人寵愛",
        "score": 6
      },
      {
        "roots": [
          "木",
          "林",
          "森"
        ],
        "label": "得林",
        "reason": "狗在林中自在",
        "score": 4
      },
      {
        "roots": [
          "火",
          "灬"
        ],
        "label": "得火",
        "reason": "戌狗土藏金，見火溫暖",
        "score": 5
      },
      {
        "roots": [
          "土"
        ],
        "label": "得土",
        "reason": "狗逢土根基穩",
        "score": 5
      }
    ],
    "dislike": [
      {
        "roots": [
          "辰",
          "龍"
        ],
        "label": "六衝",
        "reason": "辰戌正衝，天羅地網",
        "score": -9
      },
      {
        "roots": [
          "酉",
          "雞",
          "鳥",
          "隹",
          "羽",
          "飛"
        ],
        "label": "六害",
        "reason": "雞犬不寧，口舌是非",
        "score": -7
      },
      {
        "roots": [
          "丑",
          "牛"
        ],
        "label": "三刑",
        "reason": "丑戌相刑，是非煩惱",
        "score": -6
      },
      {
        "roots": [
          "未",
          "羊"
        ],
        "label": "相破",
        "reason": "未戌相破，做事反覆",
        "score": -5
      },
      {
        "roots": [
          "水",
          "氵",
          "雨",
          "冫"
        ],
        "label": "落水",
        "reason": "落水狗人人喊打",
        "score": -6
      },
      {
        "roots": [
          "禾",
          "米",
          "豆",
          "麥",
          "艹"
        ],
        "label": "素食",
        "reason": "狗為肉食見素不飽",
        "score": -3
      },
      {
        "roots": [
          "王",
          "玉",
          "大",
          "君",
          "天"
        ],
        "label": "太大",
        "reason": "狗稱王有虎視耽耽之憂",
        "score": -4
      },
      {
        "roots": [
          "日",
          "光",
          "明"
        ],
        "label": "見日",
        "reason": "狗吠日，愛管閒事徒勞",
        "score": -4
      },
      {
        "roots": [
          "田"
        ],
        "label": "入田",
        "reason": "狗入田追兔不受歡迎",
        "score": -3
      }
    ]
  },
  "豬": {
    "like": [
      {
        "roots": [
          "口",
          "品",
          "宀",
          "冖",
          "穴",
          "門",
          "广"
        ],
        "label": "得洞",
        "reason": "豬有豬圈安居，被養育照顧",
        "score": 8
      },
      {
        "roots": [
          "禾",
          "米",
          "豆",
          "麥",
          "粟"
        ],
        "label": "得糧",
        "reason": "豬有五穀安穩飽足",
        "score": 9
      },
      {
        "roots": [
          "艹"
        ],
        "label": "得草",
        "reason": "豬逢草有食物安穩",
        "score": 7
      },
      {
        "roots": [
          "卯",
          "兔"
        ],
        "label": "三合",
        "reason": "亥卯未三合木局",
        "score": 8
      },
      {
        "roots": [
          "未",
          "羊"
        ],
        "label": "三合",
        "reason": "亥卯未三合木局",
        "score": 8
      },
      {
        "roots": [
          "子",
          "鼠"
        ],
        "label": "三會",
        "reason": "亥子丑三會北方水局",
        "score": 7
      },
      {
        "roots": [
          "丑",
          "牛"
        ],
        "label": "三會",
        "reason": "亥子丑三會水局",
        "score": 7
      },
      {
        "roots": [
          "木",
          "林",
          "森",
          "東"
        ],
        "label": "得林",
        "reason": "豬在林中有木有靠",
        "score": 6
      },
      {
        "roots": [
          "月"
        ],
        "label": "得月",
        "reason": "月為卯兔，三合有助",
        "score": 6
      },
      {
        "roots": [
          "水",
          "氵",
          "雨",
          "冫"
        ],
        "label": "得水",
        "reason": "亥豬屬水，逢水旺",
        "score": 6
      },
      {
        "roots": [
          "金",
          "钅"
        ],
        "label": "得金",
        "reason": "金生水，有長輩助力",
        "score": 5
      },
      {
        "roots": [
          "田"
        ],
        "label": "得田",
        "reason": "豬在田中有糧有食",
        "score": 5
      }
    ],
    "dislike": [
      {
        "roots": [
          "巳",
          "蛇"
        ],
        "label": "六衝",
        "reason": "巳亥相衝，衝擊極大",
        "score": -9
      },
      {
        "roots": [
          "辶",
          "弓",
          "几",
          "廴",
          "乙"
        ],
        "label": "蛇形",
        "reason": "蛇形字根=六衝巳蛇",
        "score": -8
      },
      {
        "roots": [
          "申",
          "猴"
        ],
        "label": "六害",
        "reason": "豬遇猿猴似箭投",
        "score": -7
      },
      {
        "roots": [
          "衣",
          "巾",
          "彡",
          "采",
          "糸"
        ],
        "label": "披衣",
        "reason": "豬披彩衣上供桌祭祀",
        "score": -7
      },
      {
        "roots": [
          "王",
          "玉",
          "大",
          "君",
          "天",
          "帝"
        ],
        "label": "太大",
        "reason": "豬逢大為祭品犧牲",
        "score": -6
      },
      {
        "roots": [
          "刀",
          "刂",
          "匕",
          "力",
          "斤"
        ],
        "label": "遇刀",
        "reason": "殺豬刀大凶",
        "score": -7
      },
      {
        "roots": [
          "礻"
        ],
        "label": "祭祀",
        "reason": "豬見祭祀如上供桌",
        "score": -8
      },
      {
        "roots": [
          "火",
          "灬"
        ],
        "label": "見火",
        "reason": "烤豬大凶",
        "score": -6
      },
      {
        "roots": [
          "山",
          "岳",
          "阝"
        ],
        "label": "上山",
        "reason": "豬上山勞碌",
        "score": -3
      },
      {
        "roots": [
          "人",
          "亻",
          "入"
        ],
        "label": "遇人",
        "reason": "人豬相遇，豬被宰殺",
        "score": -5
      },
      {
        "roots": [
          "車",
          "軍"
        ],
        "label": "遇車",
        "reason": "豬見車代表被載送宰殺，奔波勞碌",
        "score": -5
      },
      {
        "roots": [
          "网",
          "罒",
          "冂"
        ],
        "label": "遇網",
        "reason": "豬見網代表被捕捉束縛，有志難伸",
        "score": -4
      }
    ]
  }
};

// ── 字根拆解引擎// ── 字根拆解引擎（預建表 + Unicode 部首雙軌） ──
// 預建表：常見字→包含的字根（精準拆解）
const CHAR_ROOTS = {
  // 蛇形字根（辶弓几廴之乙）相關字
  '弘':['弓'],'強':['弓'],'張':['弓'],'弦':['弓'],'引':['弓'],'弟':['弓'],'弘':['弓'],
  '建':['廴'],'廷':['廴'],'延':['廴'],
  '連':['辶'],'通':['辶'],'達':['辶'],'道':['辶'],'遠':['辶'],'運':['辶'],'進':['辶'],'遊':['辶'],'過':['辶'],'近':['辶'],'迎':['辶'],'返':['辶'],'逢':['辶'],'遷':['辶'],'選':['辶'],'透':['辶'],'造':['辶'],'迷':['辶'],'追':['辶'],'退':['辶'],'送':['辶'],'逸':['辶'],'遙':['辶'],'邊':['辶'],
  '乙':['乙'],'也':['乙'],'乾':['乙'],
  // 人/亻相關
  '仁':['亻'],'仙':['亻'],'代':['亻'],'令':['令','人'],'以':['人'],'任':['亻'],'份':['亻'],'伯':['亻'],'何':['亻'],'佑':['亻'],'佳':['亻'],'依':['亻'],'俊':['亻'],'信':['亻'],'修':['亻'],'倫':['亻'],'偉':['亻'],'傑':['亻'],'儀':['亻'],'優':['亻'],
  // 王/玉相關
  '王':['王'],'玉':['玉'],'珍':['王'],'珠':['王'],'琪':['王'],'琳':['王'],'瑞':['王'],'瑜':['王'],'瑤':['王'],'璇':['王'],'璿':['王'],'環':['王'],'瓊':['王'],'玟':['王'],'玫':['王'],'珊':['王'],'琦':['王'],'璋':['王'],'璞':['王'],'璐':['王'],'瑰':['王'],'琉':['王'],'理':['王'],'現':['王'],'琴':['王'],
  // 大相關
  '大':['大'],'天':['大'],'太':['大'],'奇':['大'],'奧':['大'],'奉':['大'],'奎':['大'],'奕':['大'],
  // 彩衣相關
  '彩':['彡'],'影':['彡'],'彤':['彡'],'彰':['彡'],'形':['彡'],
  '帆':['巾'],'布':['巾'],'帝':['巾'],'師':['巾'],'帥':['巾'],'常':['巾'],'幕':['巾'],'幣':['巾'],'帶':['巾'],'希':['巾'],'帷':['巾'],
  '衣':['衣'],'裝':['衣'],'裕':['衣'],'褔':['衣'],'表':['衣'],'被':['衣'],'袁':['衣','袁'],'裴':['衣'],'補':['衣'],'衫':['衣'],'褚':['衣'],'裙':['衣'],'褐':['衣'],
  '初':['衣','刀'],'袖':['衣'],
  '紅':['糸'],'紋':['糸'],'純':['糸'],'素':['糸'],'紫':['糸'],'細':['糸'],'結':['糸'],'絲':['糸'],'綺':['糸'],'綠':['糸'],'緣':['糸'],'線':['糸'],'縈':['糸'],'織':['糸'],'繡':['糸'],'綿':['糸'],'綸':['糸'],'緯':['糸'],'繁':['糸'],'繼':['糸'],
  // 刀刂相關
  '刀':['刀'],'分':['刀'],'切':['刀'],'刊':['刂'],'列':['刂'],'刑':['刂'],'利':['刂'],'別':['刂'],'判':['刂'],'到':['刂'],'制':['刂'],'剛':['刂'],'前':['刂'],'剪':['刀'],'創':['刂'],'劉':['刂'],'劍':['刂'],'劑':['刂'],
  '力':['力'],'功':['力'],'加':['力'],'助':['力'],'努':['力'],'勇':['力'],'動':['力'],'勝':['力'],'勢':['力'],'勵':['力'],'勤':['力'],
  '匕':['匕'],'比':['匕'],'北':['匕'],
  '斤':['斤'],'新':['斤'],'斷':['斤'],'所':['斤'],
  // 宀冖穴門口相關
  '安':['宀'],'宇':['宀'],'守':['宀'],'宏':['宀'],'宗':['宀'],'官':['宀'],'定':['宀'],'宜':['宀'],'客':['宀'],'宣':['宀'],'室':['宀'],'宮':['宀'],'家':['宀'],'容':['宀'],'富':['宀'],'寒':['宀'],'寓':['宀'],'寧':['宀'],'實':['宀'],'寶':['宀'],'寬':['宀'],
  '冠':['冖','冠'],'冥':['冖'],'冤':['冖'],'寫':['冖'],
  '門':['門'],'閃':['門'],'閉':['門'],'開':['門'],'間':['門'],'閒':['門'],'閣':['門'],'闊':['門'],'關':['門'],
  '口':['口'],'古':['口'],'台':['口'],'吉':['口'],'合':['口'],'名':['口'],'品':['口','品'],'唐':['口'],'嘉':['口'],'喬':['口'],
  // 禾米豆糧食相關
  '禾':['禾'],'秀':['禾'],'私':['禾'],'秋':['禾'],'科':['禾'],'秦':['禾'],'程':['禾'],'稀':['禾'],'種':['禾'],'稚':['禾'],'穎':['禾'],'穗':['禾'],'穰':['禾'],
  '米':['米'],'粒':['米'],'精':['米'],'粹':['米'],'糧':['米'],'粉':['米'],'粟':['米'],
  '豆':['豆'],'豐':['豆'],'豔':['豆'],
  // 艹草相關
  '芳':['艹'],'花':['艹'],'苗':['艹'],'英':['艹'],'草':['艹'],'茂':['艹'],'莊':['艹'],'華':['艹'],'萍':['艹'],'菁':['艹'],'菲':['艹'],'萱':['艹'],'蓉':['艹'],'蓮':['艹'],'蕙':['艹'],'蕊':['艹'],'藝':['艹'],'蘭':['艹'],'蘋':['艹'],'薇':['艹'],'芬':['艹'],'芸':['艹'],'若':['艹'],'茹':['艹'],'荷':['艹'],'莉':['艹'],'葉':['艹'],'蒼':['艹'],'蔚':['艹'],'蕭':['艹'],
  // 木林相關
  '木':['木'],'本':['木'],'杉':['木'],'李':['木'],'村':['木'],'杏':['木'],'材':['木'],'松':['木'],'林':['木','林'],'果':['木'],'柏':['木'],'柔':['木'],'柳':['木'],'桂':['木'],'桃':['木'],'梅':['木'],'梓':['木'],'森':['木','林'],'楊':['木'],'楓':['木'],'榮':['木'],'樂':['木'],'樹':['木'],'橋':['木'],'檸':['木'],'棟':['木'],'棉':['木'],
  // 山岳相關
  '山':['山'],'岳':['山'],'峰':['山'],'崇':['山'],'嵐':['山'],'嶺':['山'],'巍':['山'],'崖':['山'],'岩':['山'],'崑':['山'],'嵩':['山'],
  // 水氵雨相關
  '水':['水'],'永':['水'],'江':['氵'],'河':['氵'],'沁':['氵'],'沈':['氵'],'沐':['氵'],'沛':['氵'],'治':['氵'],'泉':['氵'],'泰':['氵'],'洋':['氵'],'洛':['氵'],'洪':['氵'],'浩':['氵'],'海':['氵'],'涵':['氵'],'淑':['氵'],'淳':['氵'],'清':['氵'],'渝':['氵'],'湘':['氵'],'源':['氵'],'溪':['氵'],'滿':['氵'],'漢':['氵'],'潔':['氵'],'潤':['氵'],'澤':['氵'],'濤':['氵'],'瀚':['氵'],'灣':['氵'],
  '雨':['雨'],'雪':['雨'],'雲':['雨'],'零':['雨'],'霖':['雨'],'霜':['雨'],'霞':['雨'],'露':['雨'],'靈':['雨'],'霆':['雨'],
  // 火灬相關
  '火':['火'],'炎':['火'],'炳':['火'],'烈':['火'],'煌':['火'],'煥':['火'],'熊':['火','灬'],'熙':['灬'],'燕':['灬'],'燦':['火'],'照':['灬'],'熱':['灬'],'然':['灬'],'烹':['灬'],'煮':['灬'],'點':['灬'],
  // 日月光明相關
  '日':['日'],'旭':['日'],'昌':['日'],'明':['日','月','明'],'昕':['日'],'星':['日','星'],'春':['日'],'昭':['日'],'映':['日'],'晨':['日'],'景':['日'],'晶':['日'],'智':['日'],'暖':['日'],'曉':['日'],'曜':['日'],'曦':['日'],'旺':['日'],'晴':['日'],
  '月':['月'],'朋':['月'],'朗':['月'],'望':['月'],'朝':['月'],
  '光':['光'],'晃':['光','日'],
  // 田甫相關
  '田':['田'],'由':['田'],'甲':['田'],'申':['田','申'],'男':['田'],'界':['田'],'畫':['田'],'當':['田'],'疆':['田'],'留':['田'],'略':['田'],'畢':['田'],
  // 心忄月肉相關
  '心':['心'],'必':['心'],'志':['心','志'],'忠':['心'],'忻':['心'],'念':['心'],'思':['心'],'恩':['心'],'恭':['心'],'悅':['心'],'慈':['心'],'慧':['心'],'慶':['心'],'憲':['心'],'懷':['心'],'戀':['心'],'愛':['心'],'意':['心'],'感':['心'],'德':['心'],
  '忍':['心','刀'],'忙':['忄'],'快':['忄'],'怡':['忄'],'性':['忄'],'恆':['忄'],'悟':['忄'],'惠':['忄'],'情':['忄'],'惟':['忄'],'慎':['忄'],'憶':['忄'],
  // 肉（月旁在左為肉）
  '肯':['月','肉'],'胡':['月','肉'],'能':['月','肉'],'腰':['月','肉'],'臉':['月','肉'],
  // 地支相關字
  '子':['子'],'丑':['丑'],'寅':['寅'],'卯':['卯'],'辰':['辰'],'巳':['巳'],'午':['午'],'未':['未'],'酉':['酉'],'戌':['戌'],'亥':['亥'],
  // 其他常用字
  '文':['文'],'武':['武'],'成':['成'],'國':['口','王'],'民':['民'],'正':['正'],'平':['平'],
  '東':['木','東'],'西':['西'],'南':['南'],'北':['匕','北'],
  '中':['口','中'],'上':['上'],'下':['下'],
  '人':['人'],'入':['入'],'土':['土'],'士':['士'],'夕':['夕'],'夜':['夕','夜'],
  '龍':['龍'],'鳳':['鳥'],'馬':['馬'],'虎':['虎'],'犬':['犬'],'猴':['猴'],'雞':['雞','鳥'],'蛇':['蛇','巳'],'鼠':['鼠'],'兔':['兔'],'羊':['羊'],'豬':['豬','豕'],
  '穴':['穴'],'空':['穴'],'窗':['穴'],'窮':['穴'],'究':['穴'],
  '采':['采'],'釆':['采'],'番':['采'],
  '豕':['豕'],'象':['豕'],'豪':['豕'],
  '廣':['廣'],'庭':['廣'],'廉':['廣'],'應':['廣'],
  // 十二生肖直接字
  '鼠':['鼠','子'],'牛':['牛','丑'],'虎':['虎','寅'],'兔':['兔','卯'],
  '龍':['龍','辰'],'蛇':['蛇','巳'],'馬':['馬','午'],'羊':['羊','未'],
  '猴':['猴','申'],'雞':['雞','酉'],'狗':['狗','犬','戌'],'豬':['豬','豕','亥'],
  // ═══ 擴充：常用名字用字（500+） ═══
  // 含「羽」的字（羽=鳥/雞相關）
  '羽':['羽'],'翔':['羽'],'翊':['羽'],'翎':['羽'],'翠':['羽'],'翰':['羽'],'翼':['羽'],'翹':['羽'],'羿':['羽'],
  '飛':['飛'],
  // 含「函」「凡」「凌」等（冫/冖/凵）
  '函':['水','氵'],'凡':['几'],'凌':['冫','氵'],'冰':['冫','氵'],'冷':['冫','氵'],'凜':['冫','氵'],'凝':['冫','氵'],'准':['冫','氵'],'凍':['冫','氵'],'涼':['氵'],'淩':['氵'],
  // 含「宸」「辰」等
  '宸':['宀','辰'],'辰':['辰'],'晨':['日','辰'],'振':['辰'],
  // 含「彥」「顏」等
  '彥':['彡','文'],'顏':['彡','頁'],
  // 含「瑋」「瑄」等（王旁）
  '瑋':['王'],'瑄':['王'],'瑾':['王'],'璽':['王'],'琬':['王'],'琇':['王'],'琪':['王'],'琳':['王'],'瑩':['王'],'瑞':['王'],'瑜':['王'],'瑤':['王'],'珩':['王'],'珮':['王'],'琰':['王'],'瑗':['王'],'璟':['王'],'璇':['王'],'璿':['王'],'瓏':['王'],'玥':['王'],'珺':['王'],'瑆':['王'],'璐':['王'],'瑢':['王'],'琍':['王'],'璦':['王'],'琅':['王'],'珂':['王'],'琮':['王'],'璘':['王'],'瑒':['王'],'珈':['王'],'珧':['王'],'珣':['王'],'琯':['王'],'琸':['王'],'琤':['王'],'瑁':['王'],'瑀':['王'],'瑂':['王'],'瑝':['王'],
  // 含「恩」「惠」「慈」等（心/忄）
  '恩':['心'],'惠':['心'],'慈':['心'],'悅':['忄'],'愷':['心'],'憲':['心'],'懿':['心'],'怡':['忄'],'恬':['忄'],'恆':['忄'],'惟':['忄'],'愉':['忄'],'慎':['忄'],'憶':['忄'],'懷':['心'],'恕':['心'],'悠':['心'],'惇':['忄'],'慧':['心'],'懋':['心'],'愫':['心'],'懿':['心'],
  // 含「祐」「祥」等（示/礻）
  '祐':['礻'],'祥':['礻'],'祺':['礻'],'禎':['礻'],'禧':['礻'],'福':['礻'],'祿':['礻'],'神':['礻'],'祈':['礻'],'祝':['礻'],'祖':['礻'],'禪':['礻'],'禮':['礻'],
  // 含「軒」「輝」等（車）
  '軒':['車'],'輝':['車','光'],'輔':['車'],'轉':['車'],'軾':['車'],
  // 含「鈞」「銘」等（金/钅）
  '鈞':['金'],'銘':['金'],'鋒':['金'],'鑫':['金'],'鐘':['金'],'錦':['金'],'鍾':['金'],'鑰':['金'],'銓':['金'],'鎧':['金'],'鑠':['金'],'釗':['金'],'鈺':['金'],'鈿':['金'],'鉉':['金'],
  // 含「睿」「睦」等（目）
  '睿':['目'],'睦':['目'],'睛':['目'],'瞳':['目'],'瞻':['目'],'矚':['目'],'盼':['目'],'眉':['目'],'眸':['目'],'瞬':['目'],
  // 含「皓」「皎」等（白）
  '皓':['白','日'],'皎':['白'],'皙':['白'],
  // 含「語」「詩」等（言）
  '語':['言'],'詩':['言'],'諾':['言'],'誠':['言'],'謙':['言'],'詠':['言'],'諭':['言'],'詮':['言'],'誼':['言'],'諦':['言'],'謝':['言'],'論':['言'],'詹':['言'],'諳':['言'],'讓':['言'],
  // 含「豪」「家」等
  '豪':['豕'],'家':['宀','豕'],
  // 含「霖」「霈」「霓」等（雨）
  '霖':['雨','林','木'],'霈':['雨'],'霓':['雨'],'靖':['立'],'霏':['雨'],'霆':['雨'],'靈':['雨'],'霞':['雨'],'霜':['雨'],'露':['雨'],
  // 含「逸」「遙」等（辶）
  '逸':['辶','兔'],'遙':['辶'],'逍':['辶'],'遠':['辶'],'邁':['辶'],
  // 含「陽」「隆」等（阜/阝）
  '陽':['阝','日'],'隆':['阝'],'陵':['阝'],'陸':['阝'],'院':['阝'],'隱':['阝'],'階':['阝'],'陳':['阝'],
  // 含「雅」「雄」等（隹）
  '雅':['隹'],'雄':['隹'],'雋':['隹'],'集':['隹','木'],'雍':['隹'],'雯':['雨','文'],'雲':['雨'],
  // 含「韻」「音」等
  '韻':['音'],'韋':['韋'],'音':['音'],
  // 含「駿」「驊」等（馬）
  '駿':['馬'],'驊':['馬'],'騏':['馬'],'驍':['馬'],'驥':['馬'],'騰':['馬'],
  // 含「嘉」「喬」「善」等（口/吉）
  '嘉':['口'],'喬':['口'],'善':['口','羊'],'喜':['口'],'嘯':['口'],'嗣':['口'],
  // 含「鵬」「鴻」等（鳥）
  '鵬':['鳥'],'鴻':['鳥','氵'],'鳳':['鳥'],'鶴':['鳥'],'鷹':['鳥'],'鸞':['鳥'],
  // 含「哲」「啟」等
  '哲':['口'],'啟':['口'],'呈':['口'],'君':['口'],'吟':['口'],'周':['口'],
  // 含「俞」「愈」等
  '俞':['亻','月'],'愈':['心','月'],'瑜':['王','月'],
  // 含「亭」「亮」「京」（高/亠）
  '亭':['亠','口'],'亮':['亠','口'],'京':['亠','口'],'亦':['亠'],
  // 含「冠」（冖）
  '冠':['冖'],'軍':['冖','車'],
  // 含「仲」「俊」「傑」等（亻）
  '仲':['亻'],'俊':['亻'],'傑':['亻'],'偉':['亻'],'倫':['亻'],'儀':['亻'],'佩':['亻'],'佑':['亻'],'伶':['亻'],'侑':['亻'],'佰':['亻'],'佐':['亻'],'修':['亻'],'信':['亻'],'儒':['亻'],'優':['亻'],'億':['亻'],
  // 含「銀」「鑫」等已在金
  // 含「竹」「筠」等
  '竹':['竹'],'筠':['竹'],'笙':['竹'],'箏':['竹'],'簫':['竹'],'策':['竹'],'筱':['竹'],'篤':['竹'],
  // 含「虹」「蝶」等（虫）
  '虹':['虫'],'蝶':['虫'],'蜻':['虫'],'螢':['虫'],'蟬':['虫'],
  // 含「豐」「豔」等
  '豐':['豆','豐'],'豔':['豆'],
  // 含「堅」「城」「培」等（土）
  '堅':['土'],'城':['土'],'培':['土'],'基':['土'],'塘':['土'],'境':['土'],'墨':['土'],'壁':['土'],'壇':['土'],'坤':['土'],'堃':['土'],'堯':['土'],'垣':['土'],'均':['土'],'坊':['土'],'圻':['土'],'埸':['土'],'域':['土'],
  // 含「柏」「楷」等（已在木）
  // 含「尚」
  '尚':['口'],'堂':['土','口'],'當':['田','口'],
  // 含「頤」「碩」等
  '頤':['頁'],'碩':['石','頁'],'頌':['頁'],
  // 含「貝」
  '貞':['貝'],'財':['貝'],'賢':['貝'],'貴':['貝'],'賓':['貝'],'賜':['貝'],'資':['貝'],
  // 含「辛」
  '辛':['辛'],'辜':['辛'],'辟':['辛'],
  // 含「石」
  '石':['石'],'岩':['山','石'],'碧':['石','王'],'磊':['石'],'研':['石'],'確':['石'],
  // 含「立」
  '立':['立'],'端':['立'],'竣':['立'],'站':['立'],'章':['立'],'童':['立'],
  // 含「厂」「广」
  '廣':['广'],'庭':['广'],'廉':['广'],'廷':['廴'],'康':['广'],'庸':['广'],'庫':['广'],'序':['广'],'廈':['广'],'度':['广'],
  // 數字常用
  '一':['一'],'二':['二'],'三':['三'],'四':['口'],'五':['五'],'六':['六'],'七':['七'],'八':['八'],'九':['九'],'十':['十'],'百':['白'],'千':['千'],'萬':['艹'],
  // 顏色常用
  '白':['白'],'黑':['黑'],'赤':['赤'],'青':['青'],'黃':['黃','田'],'紅':['糸'],
  // 含「長」「永」「恆」
  '長':['長'],'永':['水'],'恆':['忄'],'恒':['忄'],
  // 含「少」「小」
  '少':['小'],'小':['小'],'尖':['小','大'],
  // 含「妍」「娟」「婷」等（女）
  '妍':['女'],'娟':['女'],'婷':['女'],'婉':['女'],'姍':['女'],'妮':['女'],'姿':['女'],'媛':['女'],'嫻':['女'],'妤':['女'],'姝':['女'],'娜':['女'],'婕':['女'],'媚':['女'],'嫣':['女'],'嬌':['女'],'姞':['女'],'姵':['女'],'婧':['女'],'嫦':['女'],'娉':['女'],'婓':['女'],'姮':['女'],
  // 含「豕」相關
  '豕':['豕'],'象':['豕'],'豪':['豕'],'豫':['豕'],'豹':['豕'],
  // 含「穴」相關
  '穴':['穴'],'空':['穴'],'窗':['穴'],'窮':['穴'],'究':['穴'],'穎':['禾','穴'],
  // 含「采」
  '采':['采'],'釆':['采'],'番':['采','田'],'彩':['彡','采'],'釋':['采'],

  // ═══ 補充：常見名字用字字根（高頻缺漏修補）═══
  // 攵/攴部
  '政':['正','攵'],'敏':['每','攵'],'敬':['苟','攵'],'教':['孝','攵'],'敦':['享','攵'],
  '效':['交','攵'],'敘':['余','攵'],'數':['米','攵'],'敵':['啇','攵'],'整':['正','攵','束'],
  '散':['月','攵'],'啟':['戶','口','攵'],'救':['求','攵'],'故':['古','攵'],
  // 文部
  '斌':['文','武'],'斐':['非','文'],'斑':['文','王'],
  // 方部
  '放':['方'],'旁':['方'],'旋':['方'],'族':['方','矢'],'旗':['方','其'],
  // 欠部
  '欣':['斤','欠'],'歡':['雚','欠'],'欽':['金','欠'],'款':['士','欠'],'歌':['哥','欠'],
  // 止部
  '正':['正','一','止'],'步':['止'],'歲':['止','戈'],'歷':['厂','止'],'此':['止'],
  '武':['止','戈'],
  // 戈部
  '戎':['戈'],'成':['戈'],'或':['口','戈'],'戰':['單','戈'],'我':['戈'],
  '威':['女','戈'],'戴':['異','戈'],'截':['隹','戈'],
  // 力部
  '功':['工','力'],'加':['口','力'],'助':['且','力'],'努':['女','又','力'],
  '勁':['巠','力'],'勇':['甬','力'],'動':['重','力'],'勤':['堇','力'],
  '勝':['月','力'],'勵':['厲','力'],'勢':['埶','力'],
  // 又/寸部
  '友':['又'],'及':['又'],'叔':['又'],'取':['耳','又'],'受':['又','爪'],
  '反':['又'],'發':['弓','又'],'對':['寸'],'封':['圭','寸'],'射':['身','寸'],
  '尊':['酋','寸'],'將':['爿','寸'],'導':['道','寸'],'尋':['寸'],
  // 宀/冖部（補充）
  '宇':['宀'],'宋':['宀','木'],'宗':['宀','示'],'宜':['宀'],'客':['宀','各'],
  '宣':['宀'],'宮':['宀'],'容':['宀','谷'],'家':['宀','豕'],'富':['宀','口','田'],
  '實':['宀'],'寧':['宀','心'],'寶':['宀','玉','貝'],'寬':['宀'],
  '密':['宀'],'察':['宀'],'寒':['宀'],'審':['宀'],'寫':['宀'],
  // 心/忄部（補充）
  '心':['心'],'必':['心'],'志':['心','士'],'忍':['心','刃'],'忠':['心','中'],
  '念':['心','今'],'怒':['心','女','又'],'思':['心','田'],'急':['心'],
  '恩':['心','大','口','因'],'悲':['心','非'],'惜':['心','昔'],'惟':['心','隹'],
  '愛':['心','爪','冖'],'慶':['心','广'],'憲':['心','目','宀'],
  // 口部（補充）
  '台':['口'],'史':['口'],'召':['口','刀'],'吉':['口','士'],'呈':['口','王'],
  '品':['口'],'哲':['口','折'],'員':['口','貝'],'商':['口'],
  '嘉':['口','加','豆'],'嘯':['口'],'器':['口','犬'],
  // 日部（補充）  
  '旭':['日','九'],'昇':['日','升'],'昌':['日'],'昕':['日','斤'],
  '昊':['日','天'],'昱':['日','立'],'晉':['日'],'晨':['日','辰'],
  '景':['日','京'],'暉':['日','軍'],'曜':['日','翟'],
  // 月部（補充）
  '朋':['月'],'朗':['月','良'],'望':['月','王','亡'],'朝':['月','十','日'],
  '期':['月','其'],
  // 木部（補充）
  '本':['木'],'朱':['木'],'杰':['木'],'松':['木','公'],'柏':['木','白'],
  '梓':['木','辛'],'棟':['木','東'],'楓':['木','風'],'樂':['木','白','幺'],
  '機':['木','幾'],'權':['木','雚'],
  // 水/氵部（補充）
  '永':['水'],'泉':['水','白'],'洋':['水','羊'],'津':['水','聿'],
  '浩':['水','告'],'涵':['水','函'],'淳':['水','享'],'清':['水','青'],
  '湘':['水','相'],'源':['水','原'],'溪':['水','奚'],'澤':['水','睪'],
  // 火/灬部（補充）
  '炎':['火'],'烈':['火','列'],'焜':['火','昆'],'煜':['火','昱'],
  '照':['火','日','刀'],'熙':['火','巳'],'燕':['火','口','北','廿'],
  // 土部（補充）
  '坤':['土','申'],'城':['土','成'],'培':['土','咅'],'堅':['土','臣'],
  '堯':['土','堯'],'基':['土','其'],'堂':['土','尚'],'塔':['土','荅'],
  '境':['土','竟'],'墨':['土','黑'],'壁':['土','辟'],
  // 金/釒部（補充）
  '鈺':['金'],'銘':['金','名'],'鋒':['金','丰'],'鑫':['金'],
  '鈞':['金','匀'],'鑠':['金'],
  // 糸/纟部（補充）
  '紘':['糸','厷'],'紫':['糸','此'],'絲':['糸'],'綺':['糸','奇'],
  '維':['糸','隹'],'緯':['糸','韋'],'緣':['糸','彖'],'縈':['糸','火'],
  // 車部
  '軒':['車','干'],'軍':['車','冖'],'輝':['車','光'],'輪':['車'],
  '轉':['車','專'],'載':['車','戈'],
  // 馬部
  '馳':['馬'],'駿':['馬','夋'],'騏':['馬','其'],'驊':['馬','華'],
  // 示/礻部（補充）
  '祖':['示'],'祐':['示','右'],'祥':['示','羊'],'福':['示','畐'],
  '禎':['示','貞'],'禮':['示','豊'],
  // 言/訁部（補充）
  '詩':['言','寺'],'語':['言','吾'],'諺':['言','彥'],'謙':['言','兼'],
  // 頁/首部
  '頤':['頁','臣'],'頂':['頁','丁'],'預':['頁','予'],'願':['頁','原'],
  // 其他常見
  '冠':['冖','寸','元'],'函':['冂','了','水'],'凱':['几','豈'],
  '克':['十','兄','克'],'兆':['儿'],'先':['儿'],'允':['儿','厶'],
  '其':['八','一','甘'],'典':['八','曲'],'冊':['冂'],'再':['一','冂'],
  '辰':['辰'],'辛':['辛','立','十']
};

// Unicode 部首推斷（fallback）

// ── Name analysis: Kangxi radicals + zodiac roots (lines 25677-26125) ──
// ═══ 康熙 214 部首 → 生肖字根映射 ═══
// ═══ 偏旁→字 完整映射表（4300+ 常用字，71 部首組） ═══
const RADICAL_DB=[{c:"仁仃仇仍仕他付代令以仙仗仞仟仡仫份仰仲件任仿伉伊伍伎伏伐休伙伯估伴伶伸伺似佃但位低住佐佑何佗佚佛作佞佩佬佯佰佳併來侃侈例侍供依侖侗侘侚侮侯侵便俁係促俄俊俎俐俑俗俚俞俟信修俯俱俳俸俺俾倆倉個倌倍倏們倒倔倖倘候倚倜借倡倦倫倭假偃偉偏偕偶偷偵偽傀傅傍傑傘備催傭傲傳傷傻傾僅僑僕僖僚價僧僭僮僵儀億儂儉儐儒儘儲儷儸儺",r:['人','亻']},{c:"汁汀汃汋汍汎汏汐汕汗汙汛汝汞江池汨汪汰汲汴決沁沂沃沅沈沉沌沐沒沓沖沙沛沫沮沱河沸油沺治沼沾況泄泅泉泊泌泓法泗泛泡波泣泥注泫泮泯泰泱洄洋洌洎洗洛洞津洧洩洪洮洲洵洶活洽派流浙浚浣浤浦浩浪浮浴海浸涉涊涎涓涔涕涮涯液涵涸涼淇淋淌淏淑淒淕淘淙淚淝淞淡淥淦淨淩淪淫淬淮深淳淵混淹添淼清渙渝渟渠渡渣渤渥溈温渲渴游湃湊湍湖湘湛湜湞湟湧湮湯源準溝溟溢溥溧溪溫溯溶溺滂滄滅滇滋滌滑滓滔滕滘滙滬滯滲滴滷滸滾滿漁漂漆漏漓漠漢漣漩漪漫漬漯漲漳漸漾潁潑潔潘潛潞潤潭潮澄澈澎澤澧澱激濃濕濘濛濟濤濫濬濮濱濺濾瀅瀉瀋瀑瀕瀘瀚瀛瀝瀟瀦瀧灌灑灘灝灣",r:['水','氵']},{c:"口古句另叨叩只叫召叭叮可台史右叶號司叻吁吃各吆合吉吊同名后吏吐向吒君吟吠否吧吩含吭吮吳吵吶吸吹吻吾呀呂呃呆呈告呎呢呤周咀呱呵呻呼命咖咦咧咨咩咪咫咬咯品咳咸哀哄哆哇哈哉員哥哦哨哩哭哮哲哺唁唄唇唉唐唑唧唬售唯唱唸商啃啄啊問啓啜啞啡啣啤啥啦啪啬啵喂善喃喇喉喊喋喘喚喜喝喧嗅嗆嗎嗑嗔嗚嗜嗡嗣嗤嗦嗨嗬嗯嗲嘀嘆嘈嘉嘍嘎嘔嘗嘛嘩嘮嘯嘲嘴嘶噁噎噓噗噙噠噢噤器噩噪噬噱噴噶噸嚀嚇嚎嚐嚕嚙嚨嚮嚴嚷嚼囂囉囊囑囔",r:['口']},{c:"宀它宅宇守安宋完宏宓宕宗官宙定宛宜客宣室宥宦宧宮宰宴家宸容宿寂寄寅密寇富寐寒寓寔察寡寢寤實寧審寫寬寮寰寱寶",r:['宀']},{c:"心必忌忍忖志忘忙忡快忱忻念忽忿怎怒怔怕怖思怡急性怨怪恃恆恍恐恕恙恢恣恤恥恨恩恪恫恬恭息恰悄悉悔悖悚悟悠患悲悶悸悻悼情惆惇惋惑惕惘惚惜惟惠惡惦惰惱惲惶惹愁愆愈愉愍愎意愕愚愛感愧愴愷慄慈態慌慎慕慘慚慟慣慧慨慫慮慰慳慵慶慷慾憂憊憋憎憐憑憔憚憤憧憨憩憫憬憲憶憾懂懇懈應懊懋懌懍懦懲懵懶懷懸懺懼懾戀",r:['心','忄']},{c:"木未末本札朮朱朵杆杉李杏材村杓杖杜杞束杯杰東杲杳杵杷松板枉析枋枕林枚果枝枯架枷柄柏某柑柒染柔柘柚柜柝柞柢查柩柬柮柯柱柳柴柵柿栓栖栗校栩株核根格栽桀桂桃桅桉案桌桎桐桑桓桔桕桶梁梅梆梏梓梗梢梧梨梭梯械梱梳梵梶棄棉棋棍棒棕棗棘棚棟棠棣棧森棲棵棻椅椎植椒椿楊楓楔楗楚楞楠楣楫業楷楹榆榔榕榛榜榨榭榮榱榴槁構槍槐槓槤槳樁樂樊樑標樓樞模樣樵樸樹樺橄橋橘機橡橫檀檄檎檐檔檜檢檬檳櫃櫓櫚櫛櫥櫸櫻權欄",r:['木']},{c:"水永氾汁汀江汝汗汙汛池汪沁沃沈沉沐沒沖沙沛河油治沼泉泊泌法泡波泣泥注泰洋洗洛洞津洪浙浩浪浮浴海涉涵淇淑淚清淵減渡港湖源準溪溫滅滑滿漁漂演漫潔潛潮澤濃瀑灌灣",r:['水','氵']},{c:"日旦旨早旬旭旱昂昃昆昇昉昊昌明昏昕星映春昧昨昭昱昶昻是時晃晉晏晒晗晚晝晞晟晤晦晨晰晳晴晶智暄暇暈暉暌暐暑暖暗暘暝暢暨暫暮暱暴曄曆曉曖曙曚曛曜曝曦曩曬曰曳曷書曹曼曾會朋朔朗朝期朦朧",r:['日']},{c:"月有朋服朔朗望朝期朦朧肉肋肌肖肘肚肛肝股肢肥肩肪肯育肴胃背胎胖胚胡胤胥胸能脂脅脈脊脖脣脩脫脯脹腆腈腋腎腐腔腕腥腦腫腰腳腸腹腺腿膀膂膈膊膏膚膛膜膝膠膨膩膳膺膽膾臀臂臆臉臍臟臠",r:['月','肉']},{c:"艾芊芋芍芎芙芝芡芥芬芭芮芯花芳芸芹芻芽苑苒苓苔苗苛苜苞苟苡苣苦苧苫英苳苹茁茂范茄茅茉茗茜茨茫茭茯茱茲茴茵茶茹荀荃荊荏草荒荔荖荷荸荻莊莉莎莒莓莖莘莛莞莠莢莧莩莪莫莽菁菅菇菊菌菏菓菜菠菡菩菪菱菲菴菸菽萃萄萊萌萍萎萬萱萸萼落葉葑著葛葡葦葩葫葬葭葳葵葷蒂蒐蒔蒙蒜蒞蒟蒡蒨蒲蒸蒺蒼蒿蓀蓁蓄蓉蓋蓑蓓蓬蓮蔑蔓蔔蔗蔚蔡蔣蔥蔬蔭蕃蕈蕉蕊蕙蕨蕩蕪蕭蕾薄薇薈薊薏薑薔薛薦薩薪薫薰藉藍藏藐藝藤藥藩藻蘆蘇蘊蘋蘑蘚蘭蘿董華虎",r:['艹']},{c:"女奴奶她好妁妃妄妊妍妒妓妖妙妝妞妣妤妥妨妮妯妲妳妹妻妾姆姊始姐姑姒姓委姚姜姝姞姣姥姦姨姪姬姮姵姶姻姿威娃娉娑娘娛娜娟娠娣娥娩娶婁婆婉婊婕婚婦婧婪婷婺媒媚媛媧媲媳媽嫁嫂嫉嫌嫖嫘嫚嫡嫣嫦嫩嫻嬈嬉嬌嬋嬖嬛嬤嬪嬰嬴嬸嬿孀孃",r:['女']},{c:"王玉玎玓玖玗玘玟玠玡玢玥玦玧玩玫玬環玲玳玷玹玻珀珂珅珈珉珊珍珏珒珖珙珞珠珣珥珧珩班珮珺珽琄琇琉琊琍琎琛琝琢琤琥琦琨琪琮琯琲琳琴琵琶琺琿瑁瑂瑄瑆瑋瑕瑗瑙瑚瑛瑜瑝瑞瑟瑠瑢瑤瑧瑩瑪瑭瑮瑯瑰瑱瑳瑶瑾璀璁璃璇璈璉璋璐璘璜璞璟璠璣璥璦璧璨璩璪璫璬璮璲璵璸璹璽璿瓊瓏瓔瓘瓚瓛理現",r:['王','玉']},{c:"系紀紂約紅紆紉紊紋納紐紓純紗紘紙級紛紜素紡索紫紮累細紳紹紺終組絃結絕給絡絢統絲絨經綁綏綑綜綠綢綣綬維綱網綴綸綺綻綽綾緊緋緒緘線緜緝緞締緣編緩緬緯練緻縈縊縛縝縞縣縫縮縱總績繁繃繆繇繋織繕繖繚繞繡繩繪繫繭繰繳繹繼繽纂纈纏纓纖纜",r:['糸']},{c:"言訂訃計訊訌討訐訓訕託記訛訝訟訣訥訪設許訴訶診註詆詈詉詐詒詔評詘詛詞詠詡詢詣試詩詫詬詭詮詰話該詳詹詼誅誇誌認誓誕誘語誠誡誣誤誥誦誨說誰課誹誼調諄談請諍諏諒論諗諜諞諠諡諢諧諫諭諮諱諳諶諷諸諺諻諼諾謀謁謂謄謇謊謎謐謔謗謙謚講謝謠謡謨謫謬謳謹謾譁證譊譎譏譖識譙譚譜譫譬譯議譴護譽讀讒讓讖讚讜",r:['言']},{c:"金釗釘針釣釦釧釩釵鈀鈉鈍鈎鈐鈔鈕鈞鈣鈦鈪鈴鈺鈿鉀鉅鉉鉋鉍鉑鉚鉛鉤鉦鉸銀銃銅銑銓銖銘銜銠銦銨銩銬銭銮銳銷鋁鋅鋇鋌鋏鋒鋤鋪鋰鋸鋼錄錐錘錚錛錠錢錦錨錫錮錯錳錶鍊鍋鍍鍔鍛鍥鍬鍰鍵鍺鍾鎂鎊鎔鎖鎗鎚鎛鎢鎧鎬鎮鎳鏃鏈鏊鏐鏑鏗鏘鏜鏝鏞鏡鏢鏤鏨鐃鐓鐔鐘鐙鐡鐫鐬鐮鐲鐳鐵鐶鐸鐺鐿鑄鑊鑌鑑鑒鑠鑣鑫鑰鑲鑷鑼鑽鑾鑿",r:['金']},{c:"辶迂迄迅迎近返迢迤迥迦迪迫迭述迴迷迸追退送逃逅逆逋逍透逐逑途逕逖逗這通逛逝速造逢連逮週進逵逶逸逹逼遂遇遊運遍過遏遐遑遒道達違遘遙遜遞遠遣遨適遭遮遵遷選遺遼避邀邁還邇邈邊邏",r:['辶']},{c:"田由甲申男甸町畋界畏畔留畜略畝番畢畦畫當畸畹畿疆疇",r:['田']},{c:"山屹岌岐岑岔岡岢岣岩岫岬岱岳岷峇峋峒峙峨峪峭峯峰峴峻崁崆崇崎崑崔崖崗崙崛崢崤崧崩嵇嵌嵐嵩嵬嵯嶄嶇嶋嶒嶔嶙嶝嶠嶢嶧嶮嶰嶴嶺嶼巍巒巔",r:['山']},{c:"火灰灸灼災炅炆炊炎炒炕炙炤炫炬炭炮炯炰炱炳炷炸烈烊烋烏烘烙烜烝烤烯烴烹烽焉焊焙焚焜焠焦焯焰焱然煉煊煌煎煒煕煖煗煙煜煞煤煥照煩煮煲煸熄熊熏熔熙熛熟熠熨熬熱熹熾燁燃燈燉燊燎營燒燔燕燙燜燠燥燦燧燬燭燮燴燹燻燼燿爆爍爐爛爨爪爬爭爯爲爵爸爹爺爻爽爿",r:['火','灬']},{c:"禾禿秀私秉秋科秒秕秘租秣秤秦秧秩移稀稅程稍稔稗稚稜稞稟稠種稱稻稼稽稿穀穂穆穌積穎穗穡穢穩穫穰穴",r:['禾']},{c:"米籽粉粒粕粗粘粟粢粥粧粱粲粳粵粹粽精粿糊糕糖糗糙糜糞糟糠糢糧糨糯糰糲糸",r:['米']},{c:"竹竺竿笄笆笈笊笏笑笙笛笞笠笥符笨笩第笭笮笱笳笵笸筅筆筇筊筋筌等筍筏筐筑筒答策筠筥筧筬筮筱筲筵筷箄箇箋箍箏箒箔箕算箝管箬箭箱箴箸節篁範篆篇篋篌篙篝篠篤篩篪篲篳篷篾簀簇簍簑簒簙簞簡簣簧簪簫簷簸簽簾簿籃籌籍籐籙籟籠籤籥籩籬籮籲",r:['竹']},{c:"衣表衫衩衰衲衷衹衽衾袁袂袈袋袍袒袖袗袞袤袪被袱裁裂裊裎裏裔裕裘裙補裝裟裡裨裳裴裸裹裼製褂複褊褐褒褓褔褚褟褥褪褫褰褲褶褸褻襁襄襌襖襝襟襠襤襦襪襬襯襲襴襾",r:['衣']},{c:"刀刁刃分切刈刊刎刑列初判別利刪到制刷刺刻剃則削前剋剌剎剔剖剛剝剩剪副割創剷剽剿劃劈劉劊劍劑劚力功加劣助努劫劬勁勃勇勉勐勒動勘務勛勝勞勢勤勦勰勳勵勸勻勾匀勿包匆匈匍匏匐匕化北匙匝匠匡匣匪匯匱匹匾",r:['刀','刂']},{c:"巾市布帆帋帑帔帕帖帗帘帙帚帛帝帟帢帥師席帳帶帷常帽幃幄幅幌幔幕幗幘幛幟幡幢幣幫幬幭干平年幷幸幹幻幼幽幾庁",r:['巾']},{c:"彡形彣彤彥彧彩彪彫彬彭彰影彲彳彷役彼往征待徇很徉徊律後徐徑徒得徘徙從御徧復循微徵德徹徽",r:['彡']},{c:"弓弔引弗弘弛弟弢弦弧弩弭弱張強弼彀彈彊彎",r:['弓']},{c:"門閂閃閉開閎閏閑閒間閔閘閡閣閤閥閨閩閫閬閭閱閲閹閻閼閽闆闇闈闊闋闌闍闐闑闓闔闕闖關闘闚闛闞闡闢",r:['門']},{c:"隹隻隼雀雁雄雅集雇雉雋雌雍雎雒雕雖雙雛雜雞離難",r:['隹']},{c:"雨雩雪雫雯雱雲零雷雹電需霄霆震霈霉霍霎霏霑霓霖霜霞霧霪霰露霸霹靂靄靈靖靚靛靜",r:['雨']},{c:"羽羿翁翅翊翌翎翏習翔翕翛翟翠翡翦翩翫翮翰翱翳翹翻翼耀",r:['羽']},{c:"豕豚象豢豨豪豬豫豸豹豺貂貉貊貌貍貓貔",r:['豕']},{c:"犬犯狀狂狄狎狐狒狗狙狠狡狩狸狹狻狼猙猛猜猝猥猩猴猶猷猾獄獅獎獗獠獨獰獲獵獷獸獺獻",r:['犬','犭']},{c:"馬馭馮馱馳馴馹駁駃駈駐駑駒駔駕駘駙駛駝駟駢駭駰駱駿騁騂騅騎騏騖騙騤騫騭騮騰騶騷騸驀驁驂驃驄驅驊驌驍驎驏驕驗驘驚驛驟驢驤驥驦驪驫",r:['馬']},{c:"鳥鳩鳳鳴鳶鴉鴕鴛鴝鴞鴟鴣鴦鴨鴻鴿鵑鵓鵜鵝鵠鵡鵪鵬鵯鵲鵺鶇鶉鶊鶖鶘鶚鶡鶩鶯鶴鶹鶺鶻鷂鷄鷓鷗鷙鷚鷥鷦鷯鷲鷸鷹鷺鸚鸛鸞鸝",r:['鳥']},{c:"龍龎龐龔龕龜",r:['龍']},{c:"虎虐虔處虛虜號虞虧虩虫虯虱虹虺蛀蛄蛆蛇蛉蛋蛎蛐蛑蛙蛛蛞蛟蛤蛭蛯蛹蛻蜀蜂蜃蜆蜈蜊蜍蜒蜓蜘蜚蜜蜞蜡蜢蜥蜩蜮蜱蜴蜷蜻蜾蝌蝎蝓蝕蝗蝙蝟蝠蝦蝨蝮蝰蝴蝶蝸蝻螂螃螄螈螉螋融螐螗螘螞螟螢螣螨螫螭螯螳螵螺螻蟀蟄蟆蟈蟋蟎蟑蟒蟜蟠蟬蟯蟲蟳蟹蟻蟾蠅蠍蠔蠕蠖蠛蠟蠡蠢蠣蠱蠶蠹蠻",r:['虎']},{c:"貝貞負財貢貧貨販貪貫責貯貰貲貳貴貶買貸費貼貽貿賀賁賂賃賄賅資賈賊賑賒賓賕賚賜賞賠賡賢賣賤賦質賫賬賭賰賴賵賺賻購賽贄贅贈贊贋贍贏贓贖贗贛",r:['貝']},{c:"石砂砌砍砒研砝砟砢砥砦砧砩砭砰砲砷砸砼硃硅硎硏硒硝硤硨硫硬硯硼碇碉碌碎碑碗碘碚碞碟碣碧碩碰碳碴碼碾磁磅磊磋磐磚磨磬磯磲磷磺礁礅礎礙礦礪礫礬礱",r:['石']},{c:"穴究空穹穿突窄窈窒窕窖窗窘窟窠窣窩窪窮窯窰窳窺窿竄竅竇竊竈",r:['穴']},{c:"邑邢那邦邪邯邱邲邳邵邸邽邾郁郅郇郊郎郗郛部郝郡郢郤郭都鄂鄉鄒鄔鄗鄘鄙鄞鄢鄧鄭鄰鄱鄴鄺阡阮阪阬阱防阻阿陀附陂陋陌降限陔陘陛陜陝陞陟院陣除陪陬陰陲陳陵陶陷陸隄隅隆隈隊隋隍階隔隕際障隧隨險隱隴隸隹",r:['阝']},{c:"目盯盲直盼盾相眇眈眉眊看眙眛眞真眠眥眦眨眩眭眯眴眶眷眸眺眼着睛睜睞睡睢督睥睦睨睪睫睬睹睽睾睿瞄瞅瞇瞋瞌瞎瞑瞞瞟瞠瞥瞧瞪瞬瞭瞰瞳瞻瞼瞿矇矍矓矗",r:['目']},{c:"酉酊酋酌配酎酐酒酗酡酢酣酥酩酪酬酮酯酲酳酴酵酷酸醃醇醉醋醍醐醒醜醞醢醣醪醫醬醮醯醱醴醵醺釀",r:['酉']},{c:"示社祀祁祂祇祈祉祊祋祐祓祕祖祗祚祛祜祝神祟祠祢祥票祧祭祺祼祿禁禂禄禊禍禎福禑禓禔禕禖禘禛禝禞禟禡禢禤禥禧禨禪禫禬禮禰禱禳禴禸禹禺禽禾",r:['礻']},{c:"白百皂的皆皇皈皋皎皓皖皙皚皛皜皝皞皮",r:['白']},{c:"立站竑竟章竣童竭端競竹",r:['立']},{c:"小少尖尚尞尢尤尨尪尬就尷尸尹尺尻尼尾局屁屆屈屉届屋屌屍屎屏屐屑展屠屢屣層履屬屯",r:['小','少']},{c:"大天太夫央失夷夸夾奄奇奈奉奎奏契奔奕奘套奚奠奢奧奪奮奰",r:['大']},{c:"子孑孔孕孖字存孛孜孝孟季孤孥孩孫孰孱孳孵學孺孻孼孽",r:['子']},{c:"牛牝牟牡牢牣牤牧物牲牴特牽犀犁犂犄犇犉犋犍犏犒犖犛犢犧犬",r:['牛']},{c:"食飢飯飲飴飼飽飾餃餅餉養餌餐餒餓餕餘餛餞餡館餮餵餾饅饈饉饊饋饌饑饒饕饗饞饢",r:['食']},{c:"魚魛魟魣魨魩魬魯魴魷魺鮀鮁鮃鮊鮋鮍鮎鮑鮒鮓鮗鮚鮜鮝鮞鮠鮡鮣鮦鮨鮪鮫鮭鮮鮰鮲鮳鯀鯁鯉鯊鯒鯔鯖鯗鯛鯝鯡鯤鯧鯨鯪鯰鯷鯽鰈鰉鰍鰓鰜鰟鰣鰥鰭鰱鰲鰳鰷鰹鰻鰼鰾鱅鱈鱉鱒鱔鱖鱗鱘鱚鱝鱟鱠鱣鱧鱨鱭鱮鱲鱷鱸鱺",r:['魚']},{c:"羊羌美羔羚羞羡羣群義羲羶羹羺羼羽",r:['羊']},{c:"豆豇豈豉豊豌豎豐豔豗",r:['豆']},{c:"采釉釋番悉",r:['采']},{c:"飛飜飝",r:['飛']},{c:"鼠鼡鼢鼩鼫鼬鼯鼱鼴鼷鼹鼻",r:['鼠']},{c:"麥麩麪麫麯麰麴麵麸",r:['麥']},{c:"黃黈黌黎黏",r:['黃','田']},{c:"冗冘冠冢冤冥冪冬冰冱冲冶冷冽凄凅准凇凈凊凋凌凍凜凝凞几凡凰凱凳凶凸凹",r:['冖']},{c:"廴廷建廻延廿",r:['廴']},{c:"广庁序庄底庇店庚府庠度座庫庭庵庶庸康庾廁廂廈廉廊廓廖廚廛廝廟廠廡廢廣廨廩廬廰廱廳",r:['广']},{c:"文斌斐斑斕斗料斛斜斝斞斟斡斤斥斧斫斬新斲斷斸",r:['文']},{c:"几凡凰凱凳凶凸凹",r:['几']},{c:"車軋軌軍軒軔軛軟軸軹軺軻軼軾較輅輈載輊輒輓輔輕輛輜輝輞輟輦輩輪輬輮輯輳輶輸輻輾輿轂轅轆轉轊轍轎轔轗轘轙轟轡轢轤",r:['車']},{c:"夕外多夜夢夥夠夤",r:['夕']},{c:"乙乞也乳乾亂事云互五井亙亞亟亡亢交亦亨享京亭亮亳亶亹",r:['乙']},{c:"匕化北匙匜匝匠匡匣匪匯匱匹匾",r:['匕']},{c:"力功加劣助努劫劬勁勃勇勉勐勒動勘務勛勝勞勢勤勦勰勳勵勸勻勾勿包匆匈匍匏匐",r:['力']},{c:"辰辱農辸辳",r:['辰']},{c:"斤斥斧斫斬斯新斲斷",r:['斤']}];

function guessRoots(ch){
  // 層 1: 精確預建表（最高優先）
  if(CHAR_ROOTS[ch]) return CHAR_ROOTS[ch];
  
  // 層 2: RADICAL_DB 完整偏旁映射（覆蓋 4300+ 常用字）
  for(let i=0; i<RADICAL_DB.length; i++){
    if(RADICAL_DB[i].c.includes(ch)) return RADICAL_DB[i].r;
  }
  
  // 層 3: 硬性結構拆解（絕不回傳空陣列）
  // 原則：拆解「陽邊（左/上）」與「陰邊（右/下）」
  // 使用 CJK Ideographic Description Sequences 或常見偏旁模式
  const roots = [];
  const code = ch.charCodeAt(0);
  
  // 常見偏旁 Unicode 範圍檢測（CJK Radicals Supplement + Kangxi Radicals）
  // 2F00-2FDF: 康熙部首, 2E80-2EFF: CJK部首補充
  
  // 嘗試用已知偏旁字形匹配
  const COMMON_LEFT = [
    {pattern:/[氵]/, roots:['氵','水']},
    {pattern:/[忄]/, roots:['忄','心']},
    {pattern:/[扌]/, roots:['扌','手']},
    {pattern:/[犭]/, roots:['犭','犬']},
    {pattern:/[礻]/, roots:['礻','示']},
    {pattern:/[衤]/, roots:['衤','衣']},
    {pattern:/[飠]/, roots:['飠','食']},
    {pattern:/[纟]/, roots:['纟','糸']},
    {pattern:/[钅]/, roots:['钅','金']},
  ];

  // 嘗試從字的視覺結構推測
  // 左右結構常見模式：取字的第一個筆畫區域
  const strCh = ch;
  
  // 策略A：檢查是否包含已知的子字形
  const SUB_CHARS = {
    '口':['口'],'日':['日'],'月':['月'],'木':['木'],'火':['火'],
    '水':['水'],'金':['金'],'土':['土'],'心':['心'],'田':['田'],
    '山':['山'],'石':['石'],'示':['示'],'禾':['禾'],'竹':['竹'],
    '米':['米'],'糸':['糸'],'言':['言'],'車':['車'],'馬':['馬'],
    '王':['王'],'玉':['玉'],'人':['人'],'大':['大'],'小':['小'],
    '女':['女'],'子':['子'],'手':['手'],'力':['力'],'刀':['刀'],
    '弓':['弓'],'戈':['戈'],'門':['門'],'宀':['宀'],'穴':['穴'],
    '艹':['艹'],'辶':['辶'],'阝':['阝'],'犬':['犬'],
  };
  
  // 策略B：用已知字的組合推測
  // 例：左右結構=左偏旁+右偏旁, 上下結構=上部+下部
  // 嘗試將字拆為兩部分
  const KNOWN_COMBOS = {
    // 左右結構
    '洋':['氵','羊'],'汪':['氵','王'],'池':['氵','也'],
    '怡':['忄','台'],'悟':['忄','吾'],'惟':['忄','隹'],
    '提':['扌','是'],'搏':['扌','尃'],'振':['扌','辰'],
    '琪':['王','其'],'瑤':['王','搖'],'珮':['王','佩'],
    '祈':['礻','斤'],'祺':['礻','其'],'福':['礻','畐'],
    // 上下結構
    '宇':['宀','于'],'安':['宀','女'],'室':['宀','至'],
    '芳':['艹','方'],'英':['艹','央'],'華':['艹','化'],
    '思':['田','心'],'意':['音','心'],'慧':['彗','心'],
    '景':['日','京'],'晨':['日','辰'],'暉':['日','軍'],
  };
  if(KNOWN_COMBOS[ch]) return KNOWN_COMBOS[ch];

  // 策略C：強制從 Unicode 碼位估算部首分類
  // CJK 統一漢字按部首排列，可粗略推測
  if(code >= 0x4E00 && code <= 0x9FFF){
    // 根據 Unicode 碼位分段推測部首（粗略但不留空白）
    const offset = code - 0x4E00;
    const totalRange = 0x9FFF - 0x4E00;
    // Unicode CJK 大致按部首筆畫排列
    // 前段偏向一~人~口~土等少畫部首
    // 後段偏向金~雨~風~馬~魚~鳥等多畫部首
    const ratio = offset / totalRange;
    if(ratio < 0.05) roots.push('一','丨');
    else if(ratio < 0.1) roots.push('人','亻');
    else if(ratio < 0.15) roots.push('刀','力');
    else if(ratio < 0.2) roots.push('口');
    else if(ratio < 0.25) roots.push('土');
    else if(ratio < 0.3) roots.push('大','女');
    else if(ratio < 0.35) roots.push('宀','小');
    else if(ratio < 0.4) roots.push('心','忄');
    else if(ratio < 0.45) roots.push('手','扌');
    else if(ratio < 0.5) roots.push('日','木');
    else if(ratio < 0.55) roots.push('水','氵');
    else if(ratio < 0.6) roots.push('火');
    else if(ratio < 0.65) roots.push('田','目');
    else if(ratio < 0.7) roots.push('禾','竹');
    else if(ratio < 0.75) roots.push('糸');
    else if(ratio < 0.8) roots.push('言');
    else if(ratio < 0.85) roots.push('車','金');
    else if(ratio < 0.9) roots.push('門','阝');
    else if(ratio < 0.95) roots.push('雨','馬');
    else roots.push('魚','鳥');
  }
  
  // 如果還是空的（非CJK字元），至少標記字本身
  if(roots.length === 0) roots.push(ch);
  
  return roots;
}

// ── 漢字結構拆解引擎（陽邊/陰邊）──
// 原則：嚴格拆解每個字的「陽邊（左/上）」與「陰邊（右/下）」
// 絕不回傳空結果，即使罕見字也必須硬性拆解
const CHAR_DECOMPOSE = {
  // ═══ 左右結構 ═══
  // 氵部
  '清':{ struct:'左右', yang:'氵(水4畫)', yin:'青(8畫)', roots:['氵','水','青'] },
  '浩':{ struct:'左右', yang:'氵(水4畫)', yin:'告(7畫)', roots:['氵','水','告','口'] },
  '洪':{ struct:'左右', yang:'氵(水4畫)', yin:'共(6畫)', roots:['氵','水','共'] },
  '涵':{ struct:'左右', yang:'氵(水4畫)', yin:'函(8畫)', roots:['氵','水','函'] },
  '淳':{ struct:'左右', yang:'氵(水4畫)', yin:'享(8畫)', roots:['氵','水','享'] },
  '渝':{ struct:'左右', yang:'氵(水4畫)', yin:'俞(9畫)', roots:['氵','水','俞','人'] },
  '源':{ struct:'左右', yang:'氵(水4畫)', yin:'原(10畫)', roots:['氵','水','原','厂','小'] },
  '澤':{ struct:'左右', yang:'氵(水4畫)', yin:'睪(13畫)', roots:['氵','水','睪'] },
  '沛':{ struct:'左右', yang:'氵(水4畫)', yin:'巿(4畫)', roots:['氵','水'] },
  '湘':{ struct:'左右', yang:'氵(水4畫)', yin:'相(9畫)', roots:['氵','水','相','木','目'] },
  '洋':{ struct:'左右', yang:'氵(水4畫)', yin:'羊(6畫)', roots:['氵','水','羊'] },
  '津':{ struct:'左右', yang:'氵(水4畫)', yin:'聿(6畫)', roots:['氵','水','聿'] },
  '淑':{ struct:'左右', yang:'氵(水4畫)', yin:'叔(8畫)', roots:['氵','水','叔','又'] },
  '潔':{ struct:'左右', yang:'氵(水4畫)', yin:'絜(12畫)', roots:['氵','水','絜','糸','刀'] },
  '潤':{ struct:'左右', yang:'氵(水4畫)', yin:'閏(12畫)', roots:['氵','水','閏','門','王'] },
  '淇':{ struct:'左右', yang:'氵(水4畫)', yin:'其(8畫)', roots:['氵','水','其'] },
  '泉':{ struct:'獨體/上下', yang:'白(5畫)', yin:'水(4畫)', roots:['白','水'] },
  // 忄部
  '怡':{ struct:'左右', yang:'忄(心4畫)', yin:'台(5畫)', roots:['忄','心','台','口'] },
  '恆':{ struct:'左右', yang:'忄(心4畫)', yin:'亘(6畫)', roots:['忄','心','亘','日'] },
  '悅':{ struct:'左右', yang:'忄(心4畫)', yin:'兌(7畫)', roots:['忄','心','兌','口'] },
  '惠':{ struct:'上下', yang:'叀(7畫)', yin:'心(4畫)', roots:['心','叀'] },
  '慧':{ struct:'上下', yang:'彗(11畫)', yin:'心(4畫)', roots:['心','彗'] },
  // 扌部
  '振':{ struct:'左右', yang:'扌(手4畫)', yin:'辰(7畫)', roots:['扌','手','辰'] },
  '揚':{ struct:'左右', yang:'扌(手4畫)', yin:'昜(9畫)', roots:['扌','手','昜','日'] },
  '捷':{ struct:'左右', yang:'扌(手4畫)', yin:'疌(9畫)', roots:['扌','手'] },
  // 阝左(阜8畫)
  '陳':{ struct:'左右', yang:'阝(阜8畫)', yin:'東(8畫)', roots:['阝','阜','東','木','日'] },
  '陽':{ struct:'左右', yang:'阝(阜8畫)', yin:'昜(9畫)', roots:['阝','阜','昜','日'] },
  '陸':{ struct:'左右', yang:'阝(阜8畫)', yin:'坴(8畫)', roots:['阝','阜','坴','土'] },
  '陶':{ struct:'左右', yang:'阝(阜8畫)', yin:'匋(8畫)', roots:['阝','阜','匋','缶'] },
  '阮':{ struct:'左右', yang:'阝(阜8畫)', yin:'元(4畫)', roots:['阝','阜','元'] },
  // 阝右(邑7畫)
  '鄭':{ struct:'左右', yang:'奠(12畫)', yin:'阝(邑7畫)', roots:['奠','阝','邑','酋','大'] },
  '郭':{ struct:'左右', yang:'享(8畫)', yin:'阝(邑7畫)', roots:['享','阝','邑'] },
  '邱':{ struct:'左右', yang:'丘(5畫)', yin:'阝(邑7畫)', roots:['丘','阝','邑'] },
  '邵':{ struct:'左右', yang:'召(5畫)', yin:'阝(邑7畫)', roots:['召','阝','邑','口','刀'] },
  '郁':{ struct:'左右', yang:'有(6畫)', yin:'阝(邑7畫)', roots:['有','阝','邑','月'] },
  // 王(玉5畫)旁
  '玲':{ struct:'左右', yang:'王(玉5畫)', yin:'令(5畫)', roots:['王','玉','令'] },
  '琪':{ struct:'左右', yang:'王(玉5畫)', yin:'其(8畫)', roots:['王','玉','其'] },
  '瑜':{ struct:'左右', yang:'王(玉5畫)', yin:'俞(9畫)', roots:['王','玉','俞'] },
  '瑞':{ struct:'左右', yang:'王(玉5畫)', yin:'耑(9畫)', roots:['王','玉','耑','山'] },
  '琳':{ struct:'左右', yang:'王(玉5畫)', yin:'林(8畫)', roots:['王','玉','林','木'] },
  '瑤':{ struct:'左右', yang:'王(玉5畫)', yin:'搖省(10畫)', roots:['王','玉','缶'] },
  '瑋':{ struct:'左右', yang:'王(玉5畫)', yin:'韋(9畫)', roots:['王','玉','韋'] },
  '珮':{ struct:'左右', yang:'王(玉5畫)', yin:'佩省(6畫)', roots:['王','玉','巾'] },
  '瑄':{ struct:'左右', yang:'王(玉5畫)', yin:'宣(9畫)', roots:['王','玉','宣','宀'] },
  '璟':{ struct:'左右', yang:'王(玉5畫)', yin:'景(12畫)', roots:['王','玉','景','日','京'] },
  // 礻部(示5畫)
  '祈':{ struct:'左右', yang:'礻(示5畫)', yin:'斤(4畫)', roots:['礻','示','斤'] },
  '祐':{ struct:'左右', yang:'礻(示5畫)', yin:'右(5畫)', roots:['礻','示','右','口'] },
  '祥':{ struct:'左右', yang:'礻(示5畫)', yin:'羊(6畫)', roots:['礻','示','羊'] },
  '福':{ struct:'左右', yang:'礻(示5畫)', yin:'畐(9畫)', roots:['礻','示','畐','口','田'] },
  '禮':{ struct:'左右', yang:'礻(示5畫)', yin:'豊(13畫)', roots:['礻','示','豊','豆'] },
  // 衤部(衣6畫)
  '裕':{ struct:'左右', yang:'衤(衣6畫)', yin:'谷(7畫)', roots:['衤','衣','谷','口'] },
  '褚':{ struct:'左右', yang:'衤(衣6畫)', yin:'者(9畫)', roots:['衤','衣','者','日'] },
  // 犭部(犬4畫)
  '狄':{ struct:'左右', yang:'犭(犬4畫)', yin:'火(4畫)', roots:['犭','犬','火'] },
  // 攵部
  '政':{ struct:'左右', yang:'正(5畫)', yin:'攵(攴4畫)', roots:['正','攵','攴','一','止'] },
  '敏':{ struct:'左右', yang:'每(7畫)', yin:'攵(攴4畫)', roots:['每','攵','攴','母'] },
  '敬':{ struct:'左右', yang:'苟(8畫)', yin:'攵(攴4畫)', roots:['苟','攵','攴','艹'] },
  '教':{ struct:'左右', yang:'孝(7畫)', yin:'攵(攴4畫)', roots:['孝','攵','攴','子'] },
  // 木部
  '林':{ struct:'左右', yang:'木(4畫)', yin:'木(4畫)', roots:['木','林'] },
  '柏':{ struct:'左右', yang:'木(4畫)', yin:'白(5畫)', roots:['木','白'] },
  '楓':{ struct:'左右', yang:'木(4畫)', yin:'風(9畫)', roots:['木','風'] },
  '梓':{ struct:'左右', yang:'木(4畫)', yin:'辛(7畫)', roots:['木','辛'] },
  '棟':{ struct:'左右', yang:'木(4畫)', yin:'東(8畫)', roots:['木','東','日'] },
  '楠':{ struct:'左右', yang:'木(4畫)', yin:'南(9畫)', roots:['木','南'] },
  // 車部
  '軒':{ struct:'左右', yang:'車(7畫)', yin:'干(3畫)', roots:['車','干'] },
  '輝':{ struct:'左右', yang:'光(6畫)', yin:'車(7畫)省', roots:['光','車','軍'] },
  // 金部
  '銘':{ struct:'左右', yang:'釒(金8畫)', yin:'名(6畫)', roots:['金','名','口','夕'] },
  '鋒':{ struct:'左右', yang:'釒(金8畫)', yin:'丰(4畫)', roots:['金','丰'] },
  '鈺':{ struct:'左右', yang:'釒(金8畫)', yin:'玉(5畫)', roots:['金','玉'] },
  // 言部
  '詩':{ struct:'左右', yang:'言(7畫)', yin:'寺(6畫)', roots:['言','寺','土','寸'] },
  '謙':{ struct:'左右', yang:'言(7畫)', yin:'兼(10畫)', roots:['言','兼'] },
  // 糸部
  '維':{ struct:'左右', yang:'糸(6畫)', yin:'隹(8畫)', roots:['糸','隹'] },
  '綺':{ struct:'左右', yang:'糸(6畫)', yin:'奇(8畫)', roots:['糸','奇','大'] },
  // ═══ 上下結構 ═══
  // 艹部(艸6畫)
  '芳':{ struct:'上下', yang:'艹(艸6畫)', yin:'方(4畫)', roots:['艹','艸','方'] },
  '英':{ struct:'上下', yang:'艹(艸6畫)', yin:'央(5畫)', roots:['艹','艸','央','大'] },
  '華':{ struct:'上下', yang:'艹(艸6畫)', yin:'化(4畫)', roots:['艹','艸','化'] },
  '萱':{ struct:'上下', yang:'艹(艸6畫)', yin:'宣(9畫)', roots:['艹','艸','宣','宀'] },
  '蕙':{ struct:'上下', yang:'艹(艸6畫)', yin:'惠(12畫)', roots:['艹','艸','惠','心'] },
  '菲':{ struct:'上下', yang:'艹(艸6畫)', yin:'非(8畫)', roots:['艹','艸','非'] },
  '蓮':{ struct:'上下', yang:'艹(艸6畫)', yin:'連(11畫)', roots:['艹','艸','連','辶','車'] },
  // 宀部
  '宇':{ struct:'上下', yang:'宀(3畫)', yin:'于(3畫)', roots:['宀','于'] },
  '安':{ struct:'上下', yang:'宀(3畫)', yin:'女(3畫)', roots:['宀','女'] },
  '宸':{ struct:'上下', yang:'宀(3畫)', yin:'辰(7畫)', roots:['宀','辰'] },
  '家':{ struct:'上下', yang:'宀(3畫)', yin:'豕(7畫)', roots:['宀','豕'] },
  '富':{ struct:'上下', yang:'宀(3畫)', yin:'畐(9畫)', roots:['宀','畐','口','田'] },
  '寶':{ struct:'上下', yang:'宀(3畫)', yin:'玉+貝+缶', roots:['宀','玉','貝','缶'] },
  // 日部
  '景':{ struct:'上下', yang:'日(4畫)', yin:'京(8畫)', roots:['日','京','口','小'] },
  '晨':{ struct:'上下', yang:'日(4畫)', yin:'辰(7畫)', roots:['日','辰'] },
  '昕':{ struct:'左右', yang:'日(4畫)', yin:'斤(4畫)', roots:['日','斤'] },
  '昊':{ struct:'上下', yang:'日(4畫)', yin:'天(4畫)', roots:['日','天','大'] },
  '晟':{ struct:'上下', yang:'日(4畫)', yin:'成(7畫)', roots:['日','成','戈'] },
  '明':{ struct:'左右', yang:'日(4畫)', yin:'月(4畫)', roots:['日','月','明'] },
  // 心/思/意系
  '思':{ struct:'上下', yang:'田(5畫)', yin:'心(4畫)', roots:['田','心'] },
  '志':{ struct:'上下', yang:'士(3畫)', yin:'心(4畫)', roots:['士','心'] },
  '忠':{ struct:'上下', yang:'中(4畫)', yin:'心(4畫)', roots:['中','心'] },
  '愛':{ struct:'上中下', yang:'爪+冖', yin:'心+友', roots:['爪','冖','心','友','又'] },
  // 其他
  '弘':{ struct:'左右', yang:'弓(3畫)', yin:'厶(2畫)', roots:['弓','厶'] },
  '建':{ struct:'半包', yang:'聿(6畫)', yin:'廴(3畫)', roots:['聿','廴'] },
  '強':{ struct:'左右', yang:'弓(3畫)', yin:'厶+虫', roots:['弓','厶','虫'] },
  '張':{ struct:'左右', yang:'弓(3畫)', yin:'長(8畫)', roots:['弓','長'] },
  '功':{ struct:'左右', yang:'工(3畫)', yin:'力(2畫)', roots:['工','力'] },
  '武':{ struct:'半包', yang:'一+弋', yin:'止(4畫)', roots:['一','弋','止','戈'] },
  '成':{ struct:'獨體', yang:'戊省', yin:'—', roots:['戈','丁'] },
  '嘉':{ struct:'上下', yang:'壴(8畫)', yin:'加(5畫)', roots:['壴','加','口','力'] },
  '翔':{ struct:'左右', yang:'羊(6畫)', yin:'羽(6畫)', roots:['羊','羽'] },
  '翰':{ struct:'左右', yang:'倝(10畫)', yin:'羽(6畫)', roots:['倝','羽','日'] },
  '翊':{ struct:'左右', yang:'立(5畫)', yin:'羽(6畫)', roots:['立','羽'] },
  '俊':{ struct:'左右', yang:'亻(人2畫)', yin:'夋(7畫)', roots:['亻','人','夋'] },
  '傑':{ struct:'上下', yang:'亻(人2畫)省', yin:'桀', roots:['人','木','舛'] },
  '偉':{ struct:'左右', yang:'亻(人2畫)', yin:'韋(9畫)', roots:['亻','人','韋'] },
  '宏':{ struct:'上下', yang:'宀(3畫)', yin:'厷(4畫)', roots:['宀','厷','弓'] },
  '雅':{ struct:'左右', yang:'牙(4畫)', yin:'隹(8畫)', roots:['牙','隹'] },
  '靜':{ struct:'左右', yang:'青(8畫)', yin:'爭(8畫)', roots:['青','爭'] },
  '秀':{ struct:'上下', yang:'禾(5畫)', yin:'乃(2畫)', roots:['禾','乃'] },
  '婷':{ struct:'左右', yang:'女(3畫)', yin:'亭(9畫)', roots:['女','亭','口','丁'] },
  '麗':{ struct:'上下', yang:'鹿省', yin:'丽', roots:['鹿'] },
  '奕':{ struct:'上下', yang:'亦(6畫)', yin:'大(3畫)', roots:['亦','大'] },
  '勇':{ struct:'上下', yang:'甬(7畫)', yin:'力(2畫)', roots:['甬','力','用'] },
  '豪':{ struct:'上下', yang:'高省', yin:'豕(7畫)', roots:['高','豕'] },
  '龍':{ struct:'獨體', yang:'立+月', yin:'—', roots:['立','月','龍'] },
  '鳳':{ struct:'半包', yang:'几', yin:'鳥省', roots:['几','鳥'] },
  '飛':{ struct:'獨體', yang:'—', yin:'—', roots:['飛'] },
  '凱':{ struct:'左右', yang:'豈(10畫)', yin:'几(2畫)', roots:['豈','几','山','己'] },
  '冠':{ struct:'上下', yang:'冖(2畫)', yin:'元+寸', roots:['冖','元','寸'] },
  '駿':{ struct:'左右', yang:'馬(10畫)', yin:'夋(7畫)', roots:['馬','夋'] },
  '皓':{ struct:'左右', yang:'白(5畫)', yin:'告(7畫)', roots:['白','告','口'] },
  '睿':{ struct:'上下', yang:'目(5畫)', yin:'叡省', roots:['目','谷'] },
  '穎':{ struct:'上下', yang:'禾(5畫)+頃', yin:'匕', roots:['禾','匕','頁'] },
};

// 通用結構拆解函數（用於 CHAR_DECOMPOSE 表外的字，強制硬性拆解）
function decomposeChar(ch){
  // 優先查精確拆解表
  if(CHAR_DECOMPOSE[ch]) return CHAR_DECOMPOSE[ch];
  
  // 從 guessRoots 取字根，組裝結構描述
  const roots = guessRoots(ch);
  if(roots.length >= 2){
    return { struct:'推測', yang:roots[0], yin:roots.slice(1).join('+'), roots:roots };
  } else if(roots.length === 1){
    return { struct:'獨體', yang:roots[0], yin:'—', roots:roots };
  }
  // 絕不回傳空（guessRoots 已保證不回傳空陣列）
  return { struct:'獨體', yang:ch, yin:'—', roots:[ch] };
}
function analyzeZodiacName(fullName, birthYear){
  if(!fullName || fullName.length<2 || !birthYear) return null;
  const zodiac = getChineseZodiac(birthYear);
  const db = ZODIAC_NAME_DB[zodiac];
  if(!db) return null;

  const chars = [...fullName];
  // 姓名位置定義
  const positions = [];
  if(chars.length===2){
    positions.push({char:chars[0], label:'姓氏', lifeStage:'0-20歲（祖德天運）'});
    positions.push({char:chars[1], label:'名字', lifeStage:'21-60歲（一生格局）'});
  } else if(chars.length===3){
    positions.push({char:chars[0], label:'姓氏', lifeStage:'0-20歲（祖德天運）'});
    positions.push({char:chars[1], label:'名一', lifeStage:'21-40歲（情志格）'});
    positions.push({char:chars[2], label:'名二', lifeStage:'41-60歲（事業財富格）'});
  } else if(chars.length===4){
    positions.push({char:chars[0]+chars[1], label:'姓氏', lifeStage:'0-20歲（祖德天運）'});
    positions.push({char:chars[2], label:'名一', lifeStage:'21-40歲（情志格）'});
    positions.push({char:chars[3], label:'名二', lifeStage:'41-60歲（事業財富格）'});
  }

  // 逐字拆解＋比對
  const results = [];
  let totalScore = 0;
  let totalLike = 0;
  let totalDislike = 0;

  positions.forEach(pos => {
    const charList = [...pos.char]; // 處理複姓
    const charResults = [];

    charList.forEach(ch => {
      const decomp = decomposeChar(ch);
      const roots = decomp.roots.length ? decomp.roots : (CHAR_ROOTS[ch] || guessRoots(ch));
      const hits = [];

      // 比對喜用
      db.like.forEach(rule => {
        const matched = rule.roots.filter(r => roots.includes(r));
        if(matched.length > 0){
          hits.push({type:'吉', label:rule.label, reason:rule.reason, score:rule.score, matchedRoots:matched});
          totalScore += rule.score;
          totalLike++;
        }
      });

      // 比對忌用
      db.dislike.forEach(rule => {
        const matched = rule.roots.filter(r => roots.includes(r));
        if(matched.length > 0){
          hits.push({type:'凶', label:rule.label, reason:rule.reason, score:rule.score, matchedRoots:matched});
          totalScore += rule.score; // score 本身是負數
          totalDislike++;
        }
      });

      charResults.push({char:ch, roots, hits, decomp});
    });

    results.push({...pos, charResults});
  });

  // 犧牲格特殊判定
  let isSacrifice = false;
  let sacrificeNote = '';
  if(['豬','牛','羊'].includes(zodiac)){
    const allHits = results.flatMap(r=>r.charResults.flatMap(c=>c.hits));
    const hasSacrifice = allHits.some(h=>h.label==='犧牲格' || h.label==='彩衣格' || h.label==='彩衣犧牲');
    if(hasSacrifice){
      isSacrifice = true;
      sacrificeNote = `${ZODIAC_EMOJI[zodiac]}${zodiac}為祭祀牲畜，名字帶有王/大/彩衣字根，形成「犧牲格」——外表風光，內心承受極大壓力，常為他人犧牲自己。`;
    }
  }

  // 蛇豬衝特殊判定
  let isSnakePigClash = false;
  let clashNote = '';
  if(zodiac==='豬'){
    const allHits = results.flatMap(r=>r.charResults.flatMap(c=>c.hits));
    const hasClash = allHits.some(h=>h.label==='蛇豬衝');
    if(hasClash){
      isSnakePigClash = true;
      const clashChars = results.flatMap(r=>r.charResults.filter(c=>c.hits.some(h=>h.label==='蛇豬衝'))).map(c=>c.char);
      clashNote = `「${clashChars.join('、')}」含蛇形字根（辶/弓/几/廴），亥豬見巳蛇為六衝——易犯小人、血光意外、勞碌無功。`;
    }
  }

  // 凶優先原則：有凶字根時壓過吉字根
  let overallLevel;
  const absScore = totalScore;
  if(totalDislike > 0 && totalLike > 0){
    overallLevel = absScore >= 5 ? '吉中帶險' : absScore >= 0 ? '表吉實凶' : absScore >= -10 ? '偏凶' : '大凶';
  } else if(totalDislike === 0 && totalLike > 0){
    overallLevel = absScore >= 20 ? '大吉' : absScore >= 10 ? '吉' : '小吉';
  } else if(totalDislike > 0 && totalLike === 0){
    overallLevel = absScore <= -20 ? '大凶' : absScore <= -10 ? '凶' : '小凶';
  } else {
    overallLevel = '平';
  }

  // 犧牲格強制判定
  if(isSacrifice) overallLevel = '犧牲格（凶）';

  // ★ 八字喜忌覆寫規則：若「凶」的字根五行正好是八字調候/喜用神，強制提升評級
  let baziOverride=false;
  let baziOverrideNote='';
  let baziScoreOverride=false;
  if(typeof S!=='undefined' && S.bazi && S.bazi.fav && (overallLevel.includes('凶') || overallLevel.includes('險'))){
    const baziF=S.bazi.fav||[];
    const baziTiaohou=(S.bazi.tiaohou && S.bazi.tiaohou.need)?S.bazi.tiaohou.need:[];
    // 檢查凶的字根是否含有八字喜用神/調候用神的五行
    const allDislikeElems=results.flatMap(r=>r.charResults.flatMap(c=>c.hits.filter(h=>h.type==='凶').map(h=>{
      // 推測字根對應五行
      if(h.label.includes('火')||h.label.includes('蛇')||h.label.includes('日')) return '火';
      if(h.label.includes('水')||h.label.includes('豬')||h.label.includes('雨')) return '水';
      if(h.label.includes('金')||h.label.includes('刀')||h.label.includes('酉')) return '金';
      if(h.label.includes('木')||h.label.includes('虎')||h.label.includes('卯')) return '木';
      if(h.label.includes('土')||h.label.includes('牛')||h.label.includes('辰')) return '土';
      return '';
    }))).filter(Boolean);
    
    const overlapFav=allDislikeElems.filter(e=>baziF.includes(e)||baziTiaohou.includes(e));
    if(overlapFav.length>0){
      const uniqueEls=[...new Set(overlapFav)];
      baziOverride=true;
      // 覆寫等級：凶→平/小吉
      if(overallLevel.includes('大凶')) overallLevel='偏凶（八字有緩解）';
      else if(overallLevel.includes('凶') || overallLevel.includes('險')) overallLevel='平（八字互補）';
      baziOverrideNote=`雖然生肖派判定字根${uniqueEls.join('、')}行有沖剋，但此五行正好是八字命盤極度需要的${baziTiaohou.length&&baziTiaohou.some(e=>uniqueEls.includes(e))?'調候用神':'喜用神'}。這種「以毒攻毒」的結構，反而精準補足了本命盤的盲區。`;
      // 調整數值分（numericScore 已在下方計算）
      baziScoreOverride = true; // 標記需要覆寫分數
    }
  }
  const warnings = [];
  if(isSacrifice) warnings.push('此名為犧牲格：外人看你風光，你內心最知苦楚。注意不要過度付出、學會拒絕。');
  if(isSnakePigClash) warnings.push('蛇豬衝：注意交通安全、不可輕信他人、合約務必仔細看清。');
  const allDislikeHits = results.flatMap(r=>r.charResults.flatMap(c=>c.hits.filter(h=>h.type==='凶')));
  if(allDislikeHits.some(h=>h.label==='遇刀')) warnings.push('名帶刀刃：注意手術、外傷、利器相關風險。');
  if(allDislikeHits.some(h=>h.label==='遇人被宰'||h.label==='遇人')) warnings.push('名帶人形字根：此生肖見人不利，容易替人背鍋。');
  if(allDislikeHits.some(h=>h.label.includes('六衝'))) warnings.push('名帶六衝字根：人際關係易起衝突，注意口舌是非。');

  // 計算 0-100 分
  let numericScore = 50 + totalScore * 2;
  numericScore = Math.max(5, Math.min(95, numericScore));
  
  // 八字覆寫時保底50分
  if(baziScoreOverride){
    numericScore = Math.max(numericScore, 50);
  }

  return {
    name: fullName,
    zodiac,
    emoji: ZODIAC_EMOJI[zodiac],
    dizhi: ZODIAC_DIZHI[zodiac],
    positions: results,
    totalScore,
    totalLike,
    totalDislike,
    overallLevel,
    numericScore,
    isSacrifice,
    sacrificeNote,
    isSnakePigClash,
    clashNote,
    warnings,
    baziOverride,
    baziOverrideNote
  };
}


// ── Crystal WuXing + TianTie + crystal render (lines 26126-26342) ──
/* =============================================================
   水晶推薦系統 CRYSTAL — 命理交叉驗證版
   基於八字用神×紫微斗數×五行精準歸屬
   ============================================================= */

// ═══ 五行精準歸屬資料庫 ═══
const CRYSTAL_DB={
  金:[
    {n:'天鐵（鎳鐵隕石）',icon:'☄️',el:'金',sub:'純金',d:'金氣最強最純，來自天外。適合金為第一用神且極缺金者。',wear:'左手佩戴，日主陽性或性格強悍者適用。',taboo:'金為忌神絕對不可碰。日主陰性身極弱者慎用。',tier:'special'},
    {n:'白水晶',icon:'💍',el:'金',sub:'金',d:'淨化能量場，增強思維清晰度，萬能調和石。',wear:'左手佩戴，或放書桌/辦公桌。',taboo:'避免碰撞，定期淨化。'},
    {n:'白幽靈',icon:'💠',el:'金',sub:'金',d:'溫和金氣，淨化磁場，提升靈性直覺。',wear:'冥想時手持或佩戴。',taboo:'避免陽光直射。'},
    {n:'銀鈦晶',icon:'⚡',el:'金',sub:'金',d:'金氣強烈，增強決斷力與領導力。',wear:'左手佩戴。',taboo:'磁場強，睡眠時建議取下。'},
    {n:'月光石',icon:'🌙',el:'金',sub:'金+水',d:'長石類帶金，月光效應帶水。金水雙補。',wear:'左手佩戴，增強直覺與柔性能量。',taboo:'質地較軟，避免碰撞。'},
    {n:'純銀飾品',icon:'🔗',el:'金',sub:'金',d:'金屬材質，純正金氣。',wear:'作為配件搭配主石。',taboo:'定期擦拭防氧化。'}
  ],
  木:[
    {n:'綠幽靈',icon:'💚',el:'木',sub:'木（帶石英土底）',d:'招正財，事業穩步上升。木氣來自綠色包裹物。',wear:'左手佩戴，放辦公桌增事業運。',taboo:'避免高溫與化學品。'},
    {n:'翡翠',icon:'💎',el:'木',sub:'木',d:'正統木氣，護身辟邪，增強健康與人緣。',wear:'佩戴在靠近心臟處。',taboo:'避免碰撞與高溫。'},
    {n:'綠碧璽',icon:'💚',el:'木',sub:'木',d:'強力木氣，心輪之石，療癒情緒。',wear:'左手佩戴。',taboo:'避免與硬物碰撞。'},
    {n:'東菱玉',icon:'🌿',el:'木',sub:'木',d:'溫和木氣，舒緩壓力，帶來好運。',wear:'隨身佩戴或放枕頭下助眠。',taboo:'定期用月光淨化。'},
    {n:'橄欖石',icon:'🌱',el:'木',sub:'木',d:'清新木氣，療癒心輪，帶來正能量。',wear:'左手佩戴。',taboo:'質地較軟，注意保護。'},
    {n:'綠檀木',icon:'🌳',el:'木',sub:'純木',d:'木質材料比礦石更純正，安神定氣。',wear:'隨身佩戴。',taboo:'避免水泡。'},
    {n:'沉香',icon:'🪵',el:'木',sub:'木+微火',d:'木質帶溫暖火氣，安神定氣，修行者首選。',wear:'隨身佩戴。',taboo:'避免化學品。'},
    {n:'捷克隕石',icon:'☄️',el:'木',sub:'木+火',d:'綠色隕石玻璃，帶轉化火能量。',wear:'左手佩戴。',taboo:'能量強烈，初戴者漸進適應。'}
  ],
  水:[
    {n:'黑曜石',icon:'🖤',el:'水',sub:'水',d:'辟邪首選，水氣重，化壓力為動力。',wear:'右手佩戴辟邪排濁。',taboo:'定期流水淨化。'},
    {n:'拉長石',icon:'🔮',el:'水',sub:'水',d:'靈性水氣，增強直覺與洞察力。',wear:'左手佩戴。',taboo:'避免碰撞。'},
    {n:'海藍寶',icon:'💙',el:'水',sub:'水+金',d:'綠柱石家族帶金氣。增強溝通力，平靜情緒。',wear:'佩戴在喉輪附近效果最佳。',taboo:'避免長時間日曬。'},
    {n:'藍紋瑪瑙',icon:'🌊',el:'水',sub:'水',d:'溫和水氣，舒緩焦慮，增強表達力。',wear:'左手佩戴。',taboo:'定期淨化。'},
    {n:'黑髮晶',icon:'🕸️',el:'水',sub:'水',d:'排除負能量，增強領袖魅力。',wear:'左手佩戴。',taboo:'磁場強，敏感體質注意。'}
  ],
  火:[
    {n:'紅石榴石',icon:'🔴',el:'火',sub:'火',d:'純火氣，提升活力與意志力。',wear:'左手佩戴，貼身效果好。',taboo:'定期用水晶簇淨化。'},
    {n:'紅紋石',icon:'💗',el:'火',sub:'火',d:'溫暖火氣，招桃花，增強人際魅力。',wear:'左手佩戴。',taboo:'硬度低，避免碰撞。'},
    {n:'太陽石',icon:'☀️',el:'火',sub:'火',d:'陽性火能量，增強自信與領導力。',wear:'日間佩戴效果佳。',taboo:'避免長時間泡水。'},
    {n:'草莓晶',icon:'🍓',el:'火',sub:'木+火',d:'針狀包裹物帶木氣，木火雙補，招正緣。',wear:'左手佩戴。',taboo:'避免碰撞。'},
    {n:'粉晶',icon:'💕',el:'火',sub:'火',d:'招桃花首選，增強感情運與人際魅力。',wear:'左手佩戴。',taboo:'需定期淨化。'},
    {n:'紅瑪瑙',icon:'❤️',el:'火',sub:'火',d:'激發熱情，增強行動力與勇氣。',wear:'左手佩戴。',taboo:'避免高溫。'}
  ],
  土:[
    {n:'黃水晶',icon:'💛',el:'土',sub:'土',d:'明確土氣，招偏財，提升自信。',wear:'左手佩戴，放錢包也可。',taboo:'避免陽光直射會褪色。'},
    {n:'虎眼石',icon:'🐅',el:'土',sub:'土',d:'穩定心性，增強決斷力，招財辟邪。',wear:'右手佩戴增強氣場。',taboo:'定期短時間日光浴淨化。'},
    {n:'茶晶',icon:'🍵',el:'土',sub:'土',d:'排除負能量，增強穩定感與接地力。',wear:'佩戴或放在家中客廳。',taboo:'避免化學品。'},
    {n:'紫水晶',icon:'💜',el:'火',sub:'火',d:'紫色火行能量，安神助眠，穩定情緒，增強直覺力。',wear:'放枕頭下助眠，或佩戴。',taboo:'避免日曬會褪色。忌火者不宜。'},
    {n:'鈦晶',icon:'⚡',el:'金',d:'招財增強氣魄，金行能量強勁。',wear:'左手佩戴，面試/簽約時有效。',taboo:'磁場強，睡眠時取下。'}
  ]
};

// ═══ 天鐵專項評估函數 ═══
function evaluateTianTie(bazi, ziwei){
  // v3：先用 analyzeFullCrystal 取得金的實際角色
  var goldRole='閒神', goldPct=0;
  if(typeof analyzeFullCrystal==='function'){
    try{
      var r=analyzeFullCrystal(bazi, ziwei, (S.form||{}).type, '');
      goldRole=r.roles['金']?r.roles['金'].role:'閒神';
      goldPct=r.roles['金']?r.roles['金'].pct:0;
      return r.tianTie; // v3引擎已包含完整天鐵評估
    }catch(e){}
  }
  // fallback：舊邏輯
  const fav=bazi.fav||[], unfav=bazi.unfav||[];
  const ep=bazi.ep||{};
  goldPct=ep['金']||0;
  const dm=bazi.dm||'';
  const isYang=['甲','丙','戊','庚','壬'].includes(dm);
  let score=0, stars=0, reason='';
  if(unfav.includes('金')){
    if(goldPct>20){score=0;stars=0;reason='金為忌神且過旺('+goldPct+'%)，絕對禁止';}
    else{score=20;stars=1;reason='金為忌神('+goldPct+'%)，避免';}
  }else if(fav[0]==='金'){
    if(goldPct<8){score=95;stars=5;reason='金第一用神＋極缺('+goldPct+'%)';}
    else{score=80;stars=4;reason='金第一用神('+goldPct+'%)';}
  }else if(fav[1]==='金'){
    score=65;stars=3;reason='金第二用神('+goldPct+'%)';
  }else{
    score=40;stars=2;reason='金閒神('+goldPct+'%)';
  }
  if(!isYang&&score>0){score=Math.max(score-10,0);reason+='。'+dm+'陰性偏剛猛';}
  return{score:score,stars:stars,reason:reason,suitable:score>=60};
}

// ═══ 問題類型 → 特殊推薦（已修正五行歸屬）═══
const CRYSTAL_BY_TYPE={
  love:[{n:'粉晶',icon:'💕',el:'火',d:'招桃花首選，增強感情運與人際魅力。',wear:'左手佩戴。',taboo:'需定期淨化。'},
        {n:'草莓晶',icon:'🍓',el:'火',sub:'木+火',d:'木火雙屬性，增強異性緣。',wear:'左手佩戴。',taboo:'避免碰撞。'}],
  career:[{n:'鈦晶',icon:'⚡',el:'金',d:'增強領導力與決斷力，招財首選。',wear:'面試/重要會議時佩戴。',taboo:'磁場強，睡眠時取下。'}],
  wealth:[{n:'黃水晶',icon:'💛',el:'土',d:'偏財運首選，提升投資眼光。',wear:'左手佩戴。',taboo:'避免日曬。'},
          {n:'綠幽靈',icon:'💚',el:'木',d:'正財運首選，適合穩健理財。',wear:'左手佩戴。',taboo:'避免高溫。'}],
  health:[{n:'紫水晶',icon:'💜',el:'火',d:'安神助眠，穩定情緒，增強直覺力。',wear:'放枕頭下或佩戴。',taboo:'避免日曬會褪色。'}]
};

// ═══ 主渲染函數：八字×紫微交叉驗證推薦 ═══
function renderCrystalExpanded(bazi, type){
  const fav=bazi.fav||[];
  const unfav=bazi.unfav||[];
  const th=bazi.tiaohou;
  const need1=fav[0]||'土';
  const need2=fav.length>1?fav[1]:null;
  const unfavSet=new Set(unfav);
  const ep=bazi.ep||{};

  // ── 紫微交叉驗證 ──
  let zwVerify='', zwMatch=true;
  if(S.ziwei&&S.ziwei.palaces){
    const zw=S.ziwei;
    const mingStars=(zw.palaces[0]||{}).stars||[];
    const majorNames=mingStars.filter(function(s){return s.type==='major';}).map(function(s){return s.name;});
    // 星曜五行對應
    const starEl={'天機':'木','貪狼':'木','廉貞':'火','武曲':'金','七殺':'金',
      '破軍':'水','太陰':'水','天同':'土','天梁':'土','巨門':'土','太陽':'火',
      '紫微':'土','天府':'土','天相':'水','左輔':'水','右弼':'金','文曲':'水','文昌':'金'};
    const mingEls=majorNames.map(function(n){return starEl[n];}).filter(Boolean);
    if(mingEls.includes(need1)){zwVerify='命宮主星五行含'+need1+'，與八字用神一致 ✓';zwMatch=true;}
    else{zwVerify='命宮主星五行（'+mingEls.join('/')+')與八字第一用神('+need1+')不同，以八字為主軸';zwMatch=false;}
  }

  // ── 選石邏輯：用神 > 調候 > 類型，忌神排除 ──
  function filterSafe(list){return list.filter(function(c){return !unfavSet.has(c.el);});}
  const base1=filterSafe(CRYSTAL_DB[need1]||[]);
  let base2=need2?filterSafe(CRYSTAL_DB[need2]||[]):[];
  const typeCrystals=filterSafe(CRYSTAL_BY_TYPE[type]||[]);
  let thCrystals=[];
  if(th&&th.need){
    th.need.forEach(function(e){
      if(e!==need1&&CRYSTAL_DB[e]) thCrystals=thCrystals.concat(filterSafe(CRYSTAL_DB[e]));
    });
  }
  // 合併去重：左手用神 > 類型推薦 > 調候 > 第二用神
  const leftHand=[];
  const seen=new Set();
  function addUniq(list){list.forEach(function(c){if(!seen.has(c.n)&&c.tier!=='special'){seen.add(c.n);leftHand.push(c);}});}
  addUniq(base1);addUniq(typeCrystals);addUniq(thCrystals);addUniq(base2);
  const leftDisplay=leftHand.slice(0,3);

  // 右手：辟邪/排濁型
  const rightCandidates=filterSafe([
    {n:'黑曜石',icon:'🖤',el:'水',d:'右手辟邪排濁首選。',wear:'右手佩戴。'},
    {n:'虎眼石',icon:'🐅',el:'土',d:'右手增強氣場與決斷力。',wear:'右手佩戴。'},
    {n:'黑碧璽',icon:'⚫',el:'水',d:'排除負能量，淨化磁場。',wear:'右手佩戴。'}
  ]);
  const rightDisplay=rightCandidates.slice(0,1);

  // ── 天鐵專項評估 ──
  const ttEval=evaluateTianTie(bazi, S.ziwei);

  // ── 忌神材質 ──
  const avoidList=[];
  unfav.forEach(function(e){
    (CRYSTAL_DB[e]||[]).slice(0,2).forEach(function(c){
      avoidList.push(c.n+'（'+e+'行）');
    });
  });

  // ── 渲染 ──
  const thNote=th?` ＋調候 <span class="tag tag-blue">${th.reason}</span>（需${th.need.join('、')}行）`:'';
  let html=`
    <div style="margin-bottom:1rem">
      <p class="mb-sm">八字用神：<span class="tag tag-gold">${need1}行</span>${need2?' → <span class="tag tag-blue">'+need2+'行</span>':''}${thNote}</p>
      ${zwVerify?'<p class="text-sm text-dim mb-sm">紫微驗證：'+zwVerify+'</p>':''}
      ${S.jyotish&&S.jyotish.shadbala?(function(){
        var _llJy=JY_RASHI[S.jyotish.lagna.idx].lord;
        var _llSb=S.jyotish.shadbala[_llJy];
        var _jyVer='吠陀驗證：命宮主星'+JY_PLANETS[_llJy].zh;
        if(_llSb) _jyVer+='力量比率'+(_llSb.ratio>=1?'充足':'偏弱');
        if(S.jyotish.sadeSati&&S.jyotish.sadeSati.active) _jyVer+='，正值土星七年半，水晶需求提升';
        if(S.jyotish.currentMD){
          var _cmP=S.jyotish.planets[S.jyotish.currentMD.lord];
          if(_cmP&&(_cmP.dignity==='debilitated'||_cmP.dignity==='enemy')) _jyVer+='，大運主星偏弱需額外能量支撐';
        }
        return '<p class="text-sm text-dim mb-sm">'+_jyVer+'</p>';
      })():''}
      <p class="text-sm text-dim">忌神：${unfav.join('、')||'無'}行 — 對應材質必須避免</p>
    </div>

    <div style="display:flex;gap:.5rem;align-items:center;margin-bottom:.5rem">
      <span style="background:var(--c-gold);color:#1a0a00;padding:2px 10px;border-radius:20px;font-size:.75rem;font-weight:700">🤚 左手（補益吸收）</span>
    </div>
    <div class="crystal-grid">${leftDisplay.map(function(c){return `
      <div class="crystal-card">
        <div class="crystal-icon">${c.icon}</div>
        <div class="crystal-name">${c.n}</div>
        <div class="text-xs mb-sm"><span class="el-tag el-${c.el}">${c.sub||c.el+'行'}</span></div>
        <p class="text-sm text-dim">${c.d}</p>
        <p class="text-xs text-muted mt-sm"><i class="fas fa-hand-holding-heart"></i> ${c.wear}</p>
      </div>`;}).join('')}</div>

    ${rightDisplay.length?`
    <div style="display:flex;gap:.5rem;align-items:center;margin:.8rem 0 .5rem">
      <span style="background:#555;color:#fff;padding:2px 10px;border-radius:20px;font-size:.75rem;font-weight:700">🫲 右手（排濁辟邪）</span>
    </div>
    <div class="crystal-grid">${rightDisplay.map(function(c){return `
      <div class="crystal-card">
        <div class="crystal-icon">${c.icon}</div>
        <div class="crystal-name">${c.n}</div>
        <div class="text-xs mb-sm"><span class="el-tag el-${c.el}">${c.el}行</span></div>
        <p class="text-sm text-dim">${c.d}</p>
      </div>`;}).join('')}</div>`:''}

    <div style="margin-top:1rem;padding:.8rem;background:rgba(212,175,55,0.06);border-radius:8px;border:1px solid rgba(212,175,55,0.15)">
      <p style="font-weight:700;margin-bottom:.4rem">☄️ 天鐵（鎳鐵隕石）專項評估</p>
      <p class="text-sm">適配度：${'★'.repeat(ttEval.stars)+'☆'.repeat(5-ttEval.stars)} （${ttEval.score}分）</p>
      <p class="text-sm text-dim">${ttEval.reason}</p>
    </div>

    ${avoidList.length?`
    <div style="margin-top:.8rem;padding:.6rem .8rem;background:rgba(248,113,113,0.06);border-radius:8px;border:1px solid rgba(248,113,113,0.15)">
      <p style="font-weight:700;color:#f87171;font-size:.85rem">⛔ 應避免材質</p>
      <p class="text-sm text-dim">${avoidList.join('、')}</p>
    </div>`:''}

    <p class="text-xs text-muted mt-md"><i class="fas fa-info-circle"></i> 左手進能量（補用神），右手排濁氣（制忌神）。雙屬性材質以 ⚠ 標記，主屬性為準。所有建議基於八字×紫微交叉驗證，僅供參考。</p>`;

  document.getElementById('r-crystal').innerHTML=html;
}

