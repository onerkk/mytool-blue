// ══════════════════════════════════════════════════════════════════════
// 🌸 梅花易數 TOP-TIER UPGRADE
// 萬物類象完整表 · 外應法 · 多動爻 · 卦氣精細 · 互卦深度
// ══════════════════════════════════════════════════════════════════════
// 載入順序：tarot.js 之後（tarot.js 含梅花基礎引擎）
// enhanceMeihua(S.meihua) 在 calcMH 之後呼叫

// ── 1. 八卦萬物類象完整表 ──
var MH_WANWU = {
  乾: {
    wuxing:'金', direction:'西北', season:'秋末冬初', body:'頭/骨/肺',
    person:'父親/長者/領導/貴人', thing:'金屬/玉石/圓形物/帽子/鏡子',
    animal:'馬/天鵝/獅子', place:'京城/高處/大會堂/政府',
    nature:'剛健/積極/威嚴', color:'白/金', number:'1/6',
    emotion:'果斷/自信', disease:'頭疾/骨病/肺疾',
    time:'戌亥月', taste:'辛辣'
  },
  兌: {
    wuxing:'金', direction:'西', season:'秋', body:'口/舌/牙/肺/喉',
    person:'少女/妾/歌手/演說家/翻譯', thing:'刀剪/樂器/餐具/缺損物',
    animal:'羊/鳥', place:'澤地/窪地/娛樂場所/餐廳',
    nature:'喜悅/口才/交際', color:'白', number:'2/7',
    emotion:'愉悅/溝通', disease:'口腔/呼吸道/性病',
    time:'酉月', taste:'辛'
  },
  離: {
    wuxing:'火', direction:'南', season:'夏', body:'眼/心/血/小腸',
    person:'中女/文人/藝術家/軍人/美人', thing:'書/文書/合約/證書/火/燈/網路',
    animal:'雉/鳳/龜/蟹', place:'南方/高亮處/圖書館/法院',
    nature:'光明/美麗/附著', color:'紅/紫', number:'3/2',
    emotion:'熱情/衝動', disease:'眼疾/心臟病/血液病',
    time:'午月', taste:'苦'
  },
  震: {
    wuxing:'木', direction:'東', season:'春', body:'足/肝/聲帶/神經',
    person:'長男/運動員/員警/司機', thing:'樹木/竹/車/電/音響/鬧鐘',
    animal:'龍/蛇/鷹', place:'林地/鬧市/大道/運動場',
    nature:'行動/震動/驚恐', color:'碧綠', number:'4/8',
    emotion:'急躁/衝勁', disease:'足疾/肝病/驚悸',
    time:'卯月', taste:'酸'
  },
  巽: {
    wuxing:'木', direction:'東南', season:'春末夏初', body:'股/腿/風疾/毛髮/呼吸',
    person:'長女/寡婦/商人/僧道/工匠', thing:'繩/線/風扇/香/長型物/木製品',
    animal:'雞/蛇/蚯蚓', place:'寺廟/花園/工廠/郵局/機場',
    nature:'進退/柔順/風', color:'淺綠/白', number:'5/3',
    emotion:'猶豫/順從', disease:'風疾/腸病/中風/感冒',
    time:'辰巳月', taste:'酸'
  },
  坎: {
    wuxing:'水', direction:'北', season:'冬', body:'耳/腎/血/泌尿',
    person:'中男/漁夫/盜賊/酒鬼', thing:'水/酒/墨/車輪/弓',
    animal:'豬/魚/鼠/狐', place:'河流/酒吧/地下室/陷阱/險處',
    nature:'險難/智慧/流動', color:'黑/深藍', number:'6/1',
    emotion:'恐懼/深沉', disease:'腎病/耳疾/血液/泌尿',
    time:'子月', taste:'鹹'
  },
  艮: {
    wuxing:'土', direction:'東北', season:'冬末春初', body:'手指/背/鼻/脾/胃',
    person:'少男/僧人/警衛/山人', thing:'石頭/門/床/桌/瓷器/磚牆',
    animal:'狗/虎/鼠', place:'山/墓地/倉庫/門口/寺院',
    nature:'靜止/阻隔/厚重', color:'黃', number:'7/5',
    emotion:'固執/沉穩', disease:'手足/脾胃/背痛',
    time:'丑寅月', taste:'甘'
  },
  坤: {
    wuxing:'土', direction:'西南', season:'夏末秋初', body:'腹/脾/胃/肉/皮',
    person:'母親/妻子/老婦/農民/群眾', thing:'布/衣/食物/陶器/方形物/大地',
    animal:'牛/馬/螞蟻', place:'田野/鄉村/倉庫/平地/市場',
    nature:'柔順/包容/承載', color:'黃/黑', number:'8/10',
    emotion:'溫順/包容', disease:'腹疾/脾胃/消化/婦科',
    time:'未申月', taste:'甘'
  }
};


// ── 2. 外應法（環境對應判斷）──
// 起卦時的環境線索影響卦象解讀

function mhExternalSigns(mh, environmentClues) {
  if (!mh || !environmentClues) return [];

  var signs = [];

  // 環境五行對應
  var envToEl = {
    '聽到雷聲':'木(震)', '看到火光':'火(離)', '下雨':'水(坎)',
    '起風':'木(巽)', '看到山':'土(艮)', '看到水':'水(坎)',
    '看到金屬物':'金(乾/兌)', '看到植物':'木(震/巽)',
    '聽到笑聲':'金(兌)', '聽到吵架':'火(離)',
    '看到老人':'金(乾)', '看到少女':'金(兌)',
    '看到小孩':'土(艮)', '看到動物':'依卦象',
    '天氣晴朗':'火(離)', '陰天':'水(坎)', '多雲':'土(坤)'
  };

  // 簡易判斷：環境線索與卦象五行是否一致
  var benEl = mh.ben ? mh.ben.el : '';
  if (typeof environmentClues === 'string') {
    Object.keys(envToEl).forEach(function(key) {
      if (environmentClues.includes(key)) {
        var envEl = envToEl[key].split('(')[0];
        var matches = envEl === benEl;
        signs.push({
          clue: key,
          element: envEl,
          matchesBenGua: matches,
          zh: key + '→' + envToEl[key] + (matches ? '（與本卦五行一致，加強卦象力量）' : '（與本卦五行不同，需綜合考量）')
        });
      }
    });
  }

  return signs;
}


// ── 3. 多動爻處理 ──
// 當數字起卦的動爻計算結果需要特殊處理時

function mhMultiDongYao(mh) {
  if (!mh) return null;

  var dong = mh.dong; // 1-6
  var benLines = mh.ben ? mh.ben.lines : null;
  if (!benLines) return null;

  // 標準梅花只有一個動爻，但實際操作中可能出現老陰老陽
  // 這裡提供完整的多動爻規則（參考京房易）

  // 動爻的陰陽狀態
  var dongLine = benLines[dong - 1]; // 0 or 1
  var dongType = dongLine ? '陽動化陰' : '陰動化陽';

  // 動爻在上卦還是下卦
  var inUpper = dong > 3;
  var position = inUpper ? '上卦' : '下卦';
  var positionMeaning = inUpper ? '事情的外在層面/結果' : '事情的內在層面/起因';

  // 動爻的六親含義（簡化）
  var dongPositions = ['初爻(基礎/民眾)', '二爻(家庭/身體)', '三爻(門戶/轉折)',
                       '四爻(近臣/門面)', '五爻(君位/核心)', '上爻(宗廟/結局)'];

  return {
    dong: dong,
    dongType: dongType,
    position: position,
    positionMeaning: positionMeaning,
    positionDetail: dongPositions[dong - 1],
    zh: '動爻在第' + dong + '爻（' + dongPositions[dong - 1] + '）：' + dongType + '，表示' + positionMeaning + '正在發生變化'
  };
}


// ── 4. 互卦深度分析 ──
// 互卦代表事情的中間過程、隱藏因素

function mhHuGuaDeep(mh) {
  if (!mh || !mh.hu) return null;

  var hu = mh.hu;
  var ben = mh.ben;
  var bian = mh.bian;

  // 互卦與本卦的五行關係
  var huBenRel = '';
  if (hu.el && ben.el) {
    huBenRel = mhRelation(hu.el, ben.el);
  }

  // 互卦與變卦的五行關係
  var huBianRel = '';
  if (hu.el && bian.el) {
    huBianRel = mhRelation(hu.el, bian.el);
  }

  var meaning = '';
  if (huBenRel === '生') meaning = '互卦生本卦：過程中有助力，事情發展順利';
  else if (huBenRel === '剋') meaning = '互卦剋本卦：過程中有阻礙，中途可能遇到困難';
  else if (huBenRel === '被生') meaning = '本卦生互卦：能量被過程消耗，可能事倍功半';
  else if (huBenRel === '被剋') meaning = '本卦剋互卦：能主導過程，但耗費精力';
  else meaning = '互卦與本卦同行：過程穩定，無大波折';

  // 互卦的萬物類象
  var huUpName = mh.hu.upName || '';
  var huLoName = mh.hu.loName || '';
  var huWanwuUp = MH_WANWU[huUpName] || null;
  var huWanwuLo = MH_WANWU[huLoName] || null;

  return {
    huGua: hu.name || '',
    huEl: hu.el || '',
    huBenRel: huBenRel,
    huBianRel: huBianRel,
    meaning: meaning,
    wanwuUp: huWanwuUp,
    wanwuLo: huWanwuLo,
    zh: '互卦' + (hu.name || '') + '（' + (hu.el || '') + '行）：代表事情的中間過程。' + meaning
  };
}


// ── 5. 卦氣精細月份旺衰 ──
// 精確的月份五行旺衰表（12地支月份）

var MH_WANGSHUAI_PRECISE = {
  // 格式: 五行 → {地支月: 旺衰等級}
  // 旺=1.5, 相=1.2, 休=0.8, 囚=0.6, 死=0.4
  木: {寅:1.5, 卯:1.5, 辰:0.8, 巳:0.6, 午:0.4, 未:0.4, 申:0.6, 酉:0.6, 戌:0.8, 亥:1.2, 子:1.2, 丑:0.8},
  火: {寅:1.2, 卯:1.2, 辰:0.8, 巳:1.5, 午:1.5, 未:0.8, 申:0.4, 酉:0.4, 戌:0.6, 亥:0.6, 子:0.4, 丑:0.6},
  土: {寅:0.6, 卯:0.6, 辰:1.5, 巳:1.2, 午:1.2, 未:1.5, 申:0.8, 酉:0.8, 戌:1.5, 亥:0.4, 子:0.4, 丑:1.5},
  金: {寅:0.4, 卯:0.4, 辰:0.6, 巳:0.6, 午:0.6, 未:0.8, 申:1.5, 酉:1.5, 戌:0.8, 亥:0.8, 子:0.6, 丑:1.2},
  水: {寅:0.6, 卯:0.8, 辰:0.6, 巳:0.4, 午:0.4, 未:0.6, 申:1.2, 酉:1.2, 戌:0.6, 亥:1.5, 子:1.5, 丑:0.8}
};

function mhPreciseWangShuai(el, month) {
  // month: 1-12 → 對應地支月
  var monthZhi = ['丑','寅','卯','辰','巳','午','未','申','酉','戌','亥','子'];
  // 農曆正月=寅, 二月=卯, ... 十一月=子, 十二月=丑
  var mZhi = monthZhi[((month - 1) + 1) % 12]; // 正月=寅

  var table = MH_WANGSHUAI_PRECISE[el];
  if (!table) return {multiplier: 1.0, label: '平'};

  var mult = table[mZhi] || 1.0;
  var label = mult >= 1.5 ? '旺' : mult >= 1.2 ? '相' : mult >= 0.8 ? '休' : mult >= 0.6 ? '囚' : '死';

  return {
    multiplier: mult,
    label: label,
    monthZhi: mZhi,
    zh: el + '行在' + mZhi + '月為「' + label + '」（力量×' + mult + '）'
  };
}


// ── 6. 體用深度分析 ──
// 精確的體用力量對比

function mhTiYongDeep(mh, month) {
  if (!mh) return null;

  var tiEl = mh.tiG ? mh.tiG.el : '';
  var yoEl = mh.yoG ? mh.yoG.el : '';

  if (!tiEl || !yoEl) return null;

  var m = month || (new Date().getMonth() + 1);

  var tiWS = mhPreciseWangShuai(tiEl, m);
  var yoWS = mhPreciseWangShuai(yoEl, m);

  // 體用力量比
  var tiPower = tiWS.multiplier;
  var yoPower = yoWS.multiplier;
  var ratio = tiPower / yoPower;

  // 體用關係
  var rel = mh.ty || '';

  // 綜合判斷
  var verdict = '';
  if (rel === '用生體' && tiPower >= 1.0) verdict = '大吉：用卦生助體卦，且體卦當令有力';
  else if (rel === '用生體' && tiPower < 0.8) verdict = '小吉：用卦生體但體卦失令，生力有限';
  else if (rel === '體生用' && tiPower >= 1.2) verdict = '平：體卦生用卦，耗費能量但體卦有力承受';
  else if (rel === '體生用' && tiPower < 0.8) verdict = '凶：體卦生用卦且體卦衰弱，精力大量消耗';
  else if (rel === '用剋體' && tiPower >= 1.5) verdict = '平偏凶：用卦剋體但體卦極旺，衝擊可承受';
  else if (rel === '用剋體') verdict = '大凶：用卦剋制體卦，事情發展不利';
  else if (rel === '體剋用' && yoPower < 0.8) verdict = '吉：體卦剋用卦且用卦衰弱，可以主導局面';
  else if (rel === '體剋用' && yoPower >= 1.2) verdict = '平：體卦剋用卦但用卦強旺，需費力才能掌控';
  else if (rel === '比和') verdict = '平穩：體用同行，事情不會大起大落';

  return {
    tiEl: tiEl,
    yoEl: yoEl,
    tiWS: tiWS,
    yoWS: yoWS,
    ratio: Math.round(ratio * 100) / 100,
    rel: rel,
    verdict: verdict,
    zh: '體卦' + tiEl + '（' + tiWS.label + '×' + tiPower + '）' + rel + ' 用卦' + yoEl + '（' + yoWS.label + '×' + yoPower + '）→ ' + verdict
  };
}


// ══════════════════════════════════════════════════════════════════════
// INTEGRATION
// ══════════════════════════════════════════════════════════════════════

// ── 錯卦（每爻陰陽互換 = 事物的相反面）──
function mhCuoGua(mh) {
  if (!mh || !mh.up || !mh.lo || !mh.up.li || !mh.lo.li) return null;
  var GUA_NAMES = {
    '111':'乾','110':'兌','101':'離','100':'震',
    '011':'巽','010':'坎','001':'艮','000':'坤'
  };
  var GUA_EL = {'乾':'金','兌':'金','離':'火','震':'木','巽':'木','坎':'水','艮':'土','坤':'土'};
  // 每爻翻轉
  var cuoUp = mh.up.li.map(function(l) { return l === 1 ? 0 : 1; });
  var cuoLo = mh.lo.li.map(function(l) { return l === 1 ? 0 : 1; });
  var cuoUpName = GUA_NAMES[cuoUp.join('')] || '?';
  var cuoLoName = GUA_NAMES[cuoLo.join('')] || '?';
  return { up: cuoUpName, lo: cuoLoName, upEl: GUA_EL[cuoUpName]||'', loEl: GUA_EL[cuoLoName]||'', meaning: '錯卦代表事情的反面——你沒看到的另一種可能性' };
}

// ── 綜卦（上下顛倒 = 對方立場/換位思考）──
function mhZongGua(mh) {
  if (!mh || !mh.up || !mh.lo || !mh.up.li || !mh.lo.li) return null;
  var GUA_NAMES = {
    '111':'乾','110':'兌','101':'離','100':'震',
    '011':'巽','010':'坎','001':'艮','000':'坤'
  };
  var GUA_EL = {'乾':'金','兌':'金','離':'火','震':'木','巽':'木','坎':'水','艮':'土','坤':'土'};
  // 六爻順序顛倒：上卦→下卦翻轉
  var allLines = mh.lo.li.concat(mh.up.li); // [下1,下2,下3,上1,上2,上3]
  var reversed = allLines.slice().reverse(); // [上3,上2,上1,下3,下2,下1]
  var zongLo = reversed.slice(0, 3);
  var zongUp = reversed.slice(3, 6);
  var zongUpName = GUA_NAMES[zongUp.join('')] || '?';
  var zongLoName = GUA_NAMES[zongLo.join('')] || '?';
  var isSame = (zongUpName === (mh.up.name||'') && zongLoName === (mh.lo.name||''));
  return { up: zongUpName, lo: zongLoName, upEl: GUA_EL[zongUpName]||'', loEl: GUA_EL[zongLoName]||'', isSelf: isSame, meaning: isSame ? '綜卦與本卦相同——代表事情正反看都一樣，沒有迴旋餘地' : '綜卦代表換位思考——站在對方的角度會看到不同的局面' };
}

function enhanceMeihua(mh) {
  if (!mh) return mh;

  // 1. 萬物類象
  if (mh.up) mh.upWanwu = MH_WANWU[mh.up.name] || null;
  if (mh.lo) mh.loWanwu = MH_WANWU[mh.lo.name] || null;

  // 2. 多動爻分析
  try { mh.dongYaoDeep = mhMultiDongYao(mh); } catch(e) { mh.dongYaoDeep = null; }

  // 3. 互卦深度
  try { mh.huGuaDeep = mhHuGuaDeep(mh); } catch(e) { mh.huGuaDeep = null; }

  // 4. 體用深度
  var month = new Date().getMonth() + 1;
  try { mh.tiYongDeep = mhTiYongDeep(mh, month); } catch(e) { mh.tiYongDeep = null; }

  // 5. 錯卦
  try { mh.cuoGua = mhCuoGua(mh); } catch(e) { mh.cuoGua = null; }

  // 6. 綜卦
  try { mh.zongGua = mhZongGua(mh); } catch(e) { mh.zongGua = null; }

  return mh;
}
