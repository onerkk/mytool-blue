// ═══════════════════════════════════════════════════════════════
// 梅花輸出層 v2 — 新增區塊（v2 2026/6/12：增 buildMeihuaYingQi 正統應期，掛 mh.yingQi）
// ───────────────────────────────────────────────────────────────
// 插入位置：tarot.js 內，在 generateMeihuaStory 函式 } 結束之後、
//           renderYaoLines 函式之前。
// 本區塊全部為新增函式，不替換現有程式碼。
//
// 另外：請將 tarot.js 原本 calcMH 函式（第99-114行）
// 替換為本文末的【calcMH 升級版】。
// ═══════════════════════════════════════════════════════════════


// ─────────────────────────────────────────────────────────────────
// 【新增1】buildMeihuaTags — 標準化 tags 系統
// 每個 tag: { label, dir, weight, confidence, source }
// ─────────────────────────────────────────────────────────────────
function buildMeihuaTags(mh, type, analysis) {
  if (!mh || !analysis) return [];
  var tags = [];
  var rel       = (mh.ty && mh.ty.r) || '—';
  var judge     = (mh.ty && mh.ty.f) || '平';
  var dong      = mh.dong || 1;
  var score     = analysis.score || 40;
  var tiWS      = (analysis.wangShuai && analysis.wangShuai.ti) || { level: '平', score: 0 };
  var yoWS      = (analysis.wangShuai && analysis.wangShuai.yo) || { level: '平', score: 0 };
  var bianTrend = analysis.trend  || { type: '反覆' };
  var huHidden  = (analysis.structure && analysis.structure.huGua && analysis.structure.huGua.hidden)
                  || { cat: '變數', desc: '' };
  var dongStage = analysis.dongYaoFull || { stage: '起步' };
  var timingObj = analysis.timingFull  || { label: '短期', score: 0 };
  var benName   = (mh.ben  && mh.ben.n)  || '';
  var bianName  = (mh.bian && mh.bian.n) || '';
  var tiEl      = (mh.tiG  && mh.tiG.el) || '';
  var yoEl      = (mh.yoG  && mh.yoG.el) || '';
  var dongEl    = (dong <= 3) ? ((mh.lo && mh.lo.el) || '') : ((mh.up && mh.up.el) || '');
  var t         = type || 'general';

  function pt(label, dir, weight, confidence, source) {
    tags.push({ label: label, dir: dir, weight: weight, confidence: confidence, source: source });
  }

  // ── 1. 方向類（source: tiYong + bian）──
  var dirMap = {
    '用生體': { label: '用卦生體', dir: 'positive', w: 8 },
    '比和':   { label: '體用同類', dir: 'positive', w: 6 },
    '體克用': { label: '體克用',   dir: 'positive', w: 5 },
    '體生用': { label: '體生用',   dir: 'neutral',  w: 4 },
    '用克體': { label: '用卦克體', dir: 'negative', w: 8 }
  };
  var de = dirMap[rel] || { label: '觀望', dir: 'neutral', w: 3 };
  pt(de.label, de.dir, de.w,
    (judge === '大吉' || judge === '凶') ? '高' : '中', 'tiYong');

  // 變卦走向補充
  var bianDirMap = {
    '好轉':    { label: '變後生體', dir: 'positive', w: 7 },
    '惡化':    { label: '變後克體', dir: 'negative', w: 7 },
    '拖延':    { label: '變後耗力', dir: 'negative', w: 5 },
    '反覆':    { label: '象義待合參', dir: 'neutral',  w: 4 },
    '平穩':    { label: '變後比和',   dir: 'neutral',  w: 3 },
    '另有出口':{ label: '體克變後用卦', dir: 'positive', w: 5 }
  };
  var bdt = bianDirMap[bianTrend.type];
  if (bdt) pt(bdt.label, bdt.dir, bdt.w, '中', 'bian');

  // 先吉後阻 / 先難後易
  if (huHidden.cat === '暗中有助' && (bianTrend.type === '惡化' || bianTrend.type === '拖延'))
    pt('互助後受制象', 'negative', 6, '中', 'hu');
  else if (huHidden.cat === '外部壓制' && (bianTrend.type === '好轉' || bianTrend.type === '另有出口'))
    pt('互制後生體象', 'positive', 6, '中', 'hu');

  // ── 2. 主客類（source: tiYong + hu）──
  var subjectMap = {
    '體克用': { label: '體方可介入', dir: 'positive', w: 7 },
    '用生體': { label: '用卦生體',   dir: 'neutral',  w: 6 },
    '用克體': { label: '用卦克體',   dir: 'negative', w: 8 },
    '體生用': { label: '自耗',       dir: 'negative', w: 5 },
    '比和':   { label: '拉鋸',       dir: 'neutral',  w: 4 }
  };
  var se = subjectMap[rel];
  if (se) pt(se.label, se.dir, se.w, '高', 'tiYong');

  if (huHidden.cat === '外部壓制') pt('互卦克體', 'negative', 5, '中', 'hu');
  if (huHidden.cat === '自耗')     pt('自耗',     'negative', 4, '中', 'hu');
  if (huHidden.cat === '可控')     pt('體克互卦', 'positive', 4, '中', 'hu');

  // ── 3. 障礙類（source: hu + ben + season + dong）──
  var obstacleMap = {
    '外部壓制': '互卦克體',
    '自耗':     '互卦耗力',
    '拉鋸':     '互卦相持',
    '變數':     '條件待明'
  };
  var obs = obstacleMap[huHidden.cat];
  if (obs) pt(obs, 'negative', 4, '中', 'hu');

  if (tiWS.level === '死' || tiWS.level === '囚') {
    pt('體卦節令偏弱', 'negative', 5, '中', 'season');
  }
  if (yoWS.level === '旺' && (tiWS.level === '死' || tiWS.level === '囚'))
    pt('用卦節令較強', 'negative', 5, '中', 'season');

  var benObstacles = {
    '訟': '溝通不順', '困': '現實壓力', '蹇': '外力阻礙',
    '否': '外力阻礙', '剝': '現實壓力', '蒙': '資訊待明',
    '睽': '立場待合', '旅': '距離與環境待核', '遁': '界線待核'
  };
  var benObs = Object.keys(benObstacles).filter(function(k){ return benName.indexOf(k) !== -1; })[0];
  if (benObs) pt(benObstacles[benObs], 'negative', 4, '中', 'ben');

  if (dong === 3 || dong === 4) pt('溝通不順', 'negative', 3, '低', 'dong');

  // ── 4. 時間類（source: dong + season + bian）──
  var tSpeed = timingObj.score || 0;
  if      (tSpeed >= 2)  pt('象徵節奏偏快', 'neutral', 4, '低', 'dong');
  else if (tSpeed <= -2) pt('象徵節奏偏慢', 'neutral', 4, '低', 'dong');
  else                   pt('時間未定', 'neutral', 3, '低', 'dong');

  if (timingObj.label === '拖延型') pt('節奏取象偏慢', 'neutral',  4, '低', 'dong');
  if (timingObj.label === '反覆型') pt('節奏取象未定', 'neutral', 5, '低', 'dong');
  if (tiWS.level === '死' || tiWS.level === '囚')
    pt('體卦節令偏弱', 'negative', 5, '中', 'season');

  // ── 5. 類型專屬標籤（source: tiYong + bian + hu + dong + ben）──
  if (t === 'love') {
    if (rel === '用生體' && dong >= 3 && dong <= 4)
      pt('互動待核', 'neutral', 5, '低', 'tiYong');
    if (rel === '比和' || huHidden.cat === '拉鋸')
      pt('雙方意願待確認', 'neutral', 5, '低', 'hu');
    if (rel === '體生用' && bianTrend.type === '好轉')
      pt('投入與回應待核', 'neutral', 5, '低', 'tiYong');
    if (bianTrend.type === '反覆' || timingObj.label === '反覆型')
      pt('互動進展待核', 'neutral', 6, '低', 'bian');
    if (rel === '用生體' && (bianTrend.type === '惡化' || bianTrend.type === '拖延'))
      pt('回應與推進未定', 'neutral', 5, '低', 'bian');
    if (benName.indexOf('旅') !== -1 || benName.indexOf('姤') !== -1 || bianName.indexOf('睽') !== -1)
      pt('界線與情境待確認', 'neutral', 3, '低', 'ben');

  } else if (t === 'career') {
    if (rel === '用克體')
      pt('職場阻力待核', 'negative', 7, '中', 'tiYong');
    if (tiWS.level === '死' || tiWS.level === '囚')
      pt('體卦節令偏弱', 'negative', 5, '中', 'season');
    if (huHidden.cat === '外部壓制' && bianTrend.type === '好轉')
      pt('互制後生體象', 'positive', 6, '中', 'hu');
    if (rel === '用生體' || rel === '體克用')
      pt('適合轉動', 'positive', 5, '中', 'tiYong');
    if (rel === '用克體' || rel === '體生用')
      pt('適合先守', 'neutral', 5, '中', 'tiYong');

  } else if (t === 'wealth') {
    if (rel === '用生體')
      pt('用卦生體', 'neutral', 4, '中', 'tiYong');
    if (rel === '體克用' || rel === '比和')
      pt('收入須核帳', 'neutral', 5, '低', 'tiYong');
    if (rel === '體生用' || rel === '用克體')
      pt('支出須核帳', 'neutral', 6, '低', 'tiYong');
    if (rel === '用克體' || bianTrend.type === '惡化')
      pt('不宜冒進', 'negative', 7, '高', 'bian');

  } else if (t === 'health') {
    if (rel === '用克體' || tiWS.level === '死')
      pt('健康不能據卦診斷', 'neutral', 5, '高', 'tiYong');
    if (tiWS.level === '囚' || tiWS.level === '死')
      pt('體卦節令偏弱', 'neutral', 5, '中', 'season');
    if (huHidden.cat === '自耗')
      pt('具體症狀待核', 'neutral', 4, '低', 'hu');

  } else if (t === 'relationship') {
    if (rel === '用克體')
      pt('用卦克體', 'negative', 6, '中', 'tiYong');
    if (rel === '體克用')
      pt('體方可介入', 'positive', 5, '中', 'tiYong');
    if (benName.indexOf('訟') !== -1 || bianName.indexOf('訟') !== -1)
      pt('溝通不順', 'negative', 6, '中', 'ben');

  } else if (t === 'family') {
    if (rel === '體生用')
      pt('自耗', 'negative', 5, '中', 'tiYong');
    if (dong === 5)
      pt('決策層待釐清', 'neutral', 3, '低', 'dong');
    if (bianTrend.type === '好轉')
      pt('變後生體', 'positive', 5, '中', 'bian');
  }

  // ── 去重（同 label 只保留 weight 最高者），按 weight 降冪 ──
  var seen = {};
  return tags.filter(function(tag) {
    if (seen[tag.label] === undefined || seen[tag.label] < tag.weight) {
      seen[tag.label] = tag.weight;
      return true;
    }
    return false;
  }).sort(function(a, b) { return b.weight - a.weight; });
}


// ─────────────────────────────────────────────────────────────────
// 【新增2】buildMeihuaSummary — summary / shortVerdict / decisionHint
// ─────────────────────────────────────────────────────────────────
function buildMeihuaSummary(mh, type, analysis) {
  if (!mh || !analysis) return { summary: '', shortVerdict: '', decisionHint: 'now-wait' };

  var rel       = (mh.ty && mh.ty.r) || '—';
  var dong      = mh.dong || 1;
  var tiWS      = (analysis.wangShuai && analysis.wangShuai.ti) || { level: '平' };
  var bianTrend = analysis.trend  || { type: '反覆' };
  var huHidden  = (analysis.structure && analysis.structure.huGua && analysis.structure.huGua.hidden)
                  || { cat: '變數' };
  var dongStage = analysis.dongYaoFull || { stage: '起步' };
  var timingObj = analysis.timingFull  || { label: '短期', score: 0 };
  var benName   = (mh.ben && mh.ben.n) || '';
  var t         = type || 'general';

  var isGood    = rel === '用生體' || rel === '體克用' || rel === '比和';
  var isBad     = rel === '用克體' || rel === '體生用';
  var isQuick   = timingObj.label === '很快' || timingObj.label === '短期';
  var isSlow    = timingObj.label === '拖延型' || timingObj.label === '反覆型';
  var bGood     = bianTrend.type === '好轉' || bianTrend.type === '另有出口';
  var bBad      = bianTrend.type === '惡化';
  var bRepeats  = bianTrend.type === '反覆';
  var seasonBad = tiWS.level === '死' || tiWS.level === '囚';

  // ── shortVerdict ──
  var shortVerdict = '';
  if      (isGood && bGood)                      shortVerdict = '卦象有承接的方向，可小步驗證現實條件';
  else if (isGood && bBad)                      shortVerdict = '本卦有推進力，變後受制，先核對阻力';
  else if (isGood && isSlow)                    shortVerdict = '卦象有助力，但尚不能換算事件時點';
  else if (isBad && bGood)                      shortVerdict = '本卦有阻力，變後有改善空間，仍待實際落實';
  else if (isBad && bBad)                       shortVerdict = '本變皆有受制象，先處理可核對的阻力';
  else if (isBad && seasonBad)                  shortVerdict = '體卦節令偏弱，分段處理較穩妥';
  else if (bRepeats)                            shortVerdict = '卦象作用未定，先看實際進展';
  else if (seasonBad && isGood)                 shortVerdict = '卦象有助力，體卦節令偏弱，宜保留餘裕';
  else if (seasonBad)                           shortVerdict = '體卦節令偏弱，先核對現實條件';
  else if (isGood)                              shortVerdict = '卦象有推進空間，成事仍需實際條件';
  else                                          shortVerdict = '卦象偏受制，先觀察實際阻力';

  // ── summary ──
  var relLabel = {
    '用生體': '用卦生體', '比和': '體用同類',
    '體克用': '體克用', '體生用': '體生用', '用克體': '用卦克體'
  }[rel] || '局勢不明';

  var typeFocusMap = {
    love: '感情', career: '工作', wealth: '財運',
    health: '身體', relationship: '人際', family: '家庭', general: '事情'
  };
  var focusWord = typeFocusMap[t] || '事情';
  var tiWsLabel = (tiWS.level === '旺' || tiWS.level === '相') ? '，體卦月令較有力' :
                  (tiWS.level === '死' || tiWS.level === '囚') ? '，體卦月令較弱' : '';

  var summary = focusWord + '本卦「' + benName + '」，' +
    '體用：' + relLabel + '，動爻第' + dong + '爻（爻位取象為' + (dongStage.stage||'起步') + '），' +
    '變後用卦取象為「' + (bianTrend.type||'待合參') + '」' + tiWsLabel + '。' + shortVerdict;

  // ── decisionHint ──
  var decisionHint = 'now-wait';
  if      (rel === '用生體' && bGood && isQuick)   decisionHint = 'now-push';
  else if (rel === '比和'   && bGood)               decisionHint = 'now-push';
  else if (rel === '體克用' && bGood)               decisionHint = 'now-push';
  else if (rel === '用生體' && isSlow)              decisionHint = 'delayed-opportunity';
  else if (rel === '體克用' && isSlow)              decisionHint = 'delayed-opportunity';
  else if (isGood && bRepeats)                      decisionHint = 'unstable-progress';
  else if (rel === '體生用' && bGood)               decisionHint = 'now-hold';
  else if (rel === '體生用' && !bGood)              decisionHint = 'now-wait';
  else if (rel === '用克體' && bGood)               decisionHint = 'now-hold';
  else if (rel === '用克體' && !bGood)              decisionHint = 'now-withdraw';
  else if (seasonBad && !isGood)                    decisionHint = 'now-withdraw';
  else if (isSlow || seasonBad)                     decisionHint = 'delayed-opportunity';
  else if (bRepeats)                                decisionHint = 'unstable-progress';

  return { summary: summary, shortVerdict: shortVerdict, decisionHint: decisionHint };
}


// ─────────────────────────────────────────────────────────────────
// 【新增3】buildMeihuaTiming — 標準化 timing 物件
// ─────────────────────────────────────────────────────────────────
function buildMeihuaTiming(mh, type, analysis) {
  if (!mh || !analysis) {
    return { speed: 'unknown', windowLabel: '資料不足，只能判相對遠近', windowDays: null, tendency: 'unknown', precision: 'insufficient', note: '不得自行估算天數、週數或月份' };
  }

  var timingObj = analysis.timingFull  || { label: '短期', score: 0 };
  var tiWS      = (analysis.wangShuai && analysis.wangShuai.ti) || { level: '平' };
  var bianTrend = analysis.trend || { type: '反覆' };

  var speedMap = {
    '很快':   'fast',
    '短期':   'normal',
    '稍晚':   'delayed',
    '拖延型': 'delayed',
    '反覆型': 'unstable'
  };
  var speed = speedMap[timingObj.label] || 'normal';

  var windowData = {
    '很快':   { label: '相對近期' },
    '短期':   { label: '相對近期' },
    '稍晚':   { label: '相對中期' },
    '拖延型': { label: '相對較遠' },
    '反覆型': { label: '時機未定' }
  };
  var wd = windowData[timingObj.label] || { label: '只能判相對遠近' };

  var tendency = 'delayed';
  if      (speed === 'fast')     tendency = 'quick-hit';
  else if (speed === 'normal')   tendency = 'quick-hit';
  else if (speed === 'unstable') tendency = 'repeated';
  else if (bianTrend.type === '惡化') tendency = 'blocked';
  else                           tendency = 'delayed';

  var note = timingObj.note || '';
  if (!note) {
    if      (speed === 'fast')     note = '卦象節奏偏快，但資料不足以換算天數或日期';
    else if (speed === 'normal')   note = '卦象層次偏近期，但資料不足以換算週數或日期';
    else if (speed === 'unstable') note = '時間不定，可能走走停停，準備好長期應對';
    else                           note = '卦象層次偏後，需等待條件改變；不得自行換算月份';
  }
  if (tiWS.level === '旺' || tiWS.level === '相') note += '（體卦在月令較有力，不等於已能換算日期）';
  else if (tiWS.level === '死' || tiWS.level === '囚') note += '（體卦在月令較弱，不等於必然延後）';

  return {
    speed:       speed,
    windowLabel: wd.label,
    windowDays:  null,
    tendency:    tendency,
    precision:   'relative-only',
    note:        note
  };
}


// ─────────────────────────────────────────────────────────────────
// 【新增4】buildMeihuaRisk / buildMeihuaStrategy
// ─────────────────────────────────────────────────────────────────
function buildMeihuaRisk(mh, type, analysis) {
  if (!mh || !analysis) return { level: 'mid', points: [] };

  var rel       = (mh.ty && mh.ty.r) || '—';
  var tiWS      = (analysis.wangShuai && analysis.wangShuai.ti) || { level: '平' };
  var huHidden  = (analysis.structure && analysis.structure.huGua && analysis.structure.huGua.hidden)
                  || { cat: '變數' };
  var bianTrend = analysis.trend || { type: '反覆' };
  var points    = [];
  var t         = type || 'general';

  var riskScore = 0;
  if (rel === '用克體')              riskScore += 3;
  if (rel === '體生用')              riskScore += 1;
  if (tiWS.level === '死')           riskScore += 2;
  if (tiWS.level === '囚')           riskScore += 1;
  if (bianTrend.type === '惡化')     riskScore += 2;
  if (bianTrend.type === '反覆')     riskScore += 1;
  if (huHidden.cat === '外部壓制')   riskScore += 1;
  if (huHidden.cat === '自耗')       riskScore += 1;

  var level = riskScore >= 5 ? 'high' : riskScore >= 2 ? 'mid' : 'low';

  if (rel === '用克體')
    points.push('用克體有受制的卦象，實際壓力來源仍須核對');
  if (rel === '體生用')
    points.push('體生用偏向需要投入，先核對真實成本與回報');
  if (tiWS.level === '死' || tiWS.level === '囚')
    points.push('體卦節令偏弱，對實際成敗仍需另有資料');
  if (bianTrend.type === '惡化')
    points.push('變後用卦克體，若現實阻力持續，可考慮調整策略');
  if (bianTrend.type === '反覆')
    points.push('卦象訊號未明，留意情緒性決策');
  if (huHidden.cat === '外部壓制')
    points.push('互卦有克體意象，可檢查是否有具體阻力');
  if (huHidden.cat === '自耗')
    points.push('互卦有持續投入的象，留意是否付出過多');

  if (t === 'wealth' && (rel === '用克體' || bianTrend.type === '惡化'))
    points.push('卦象偏受制；真實投資風險、資金缺口與槓桿須依帳目和交易條件核對');
  if (t === 'health' && (tiWS.level === '死' || tiWS.level === '囚'))
    points.push('健康題不以體卦旺衰診斷免疫力或疾病；持續不適應依症狀就醫');
  if (t === 'love' && (bianTrend.type === '反覆' || rel === '用克體'))
    points.push('感情題先核對雙方意願與界線，卦象不能證實第三人想法');

  if (points.length === 0) points.push('此層未見明顯克體象；實際風險仍須依情境核對');

  // 體用分數不得變成醫療風險分級。
  if (t === 'health') return {
    level: 'unknown', precision: 'not-clinical',
    points: ['卦象不能診斷疾病或評估醫療風險；持續不適須按具體症狀就醫']
  };

  return { level: level, precision: 'symbolic-only', points: points };
}

function buildMeihuaStrategy(mh, type, analysis, decisionHint) {
  if (!mh || !analysis) return { mode: 'observe', advice: [] };

  var rel          = (mh.ty && mh.ty.r) || '—';
  var actionAdvice = analysis.actionAdvice || [];
  var hint         = decisionHint || 'now-wait';

  var modeMap = {
    'now-push':           'push',
    'now-wait':           'wait',
    'now-hold':           'stabilize',
    'now-withdraw':       'retreat',
    'delayed-opportunity':'wait',
    'unstable-progress':  'observe'
  };
  var mode = modeMap[hint] || 'observe';

  var advice = actionAdvice.length
    ? actionAdvice.slice()
    : ['維持現狀，觀察局勢變化', '不急著做大決定', '等待更明確的訊號'];

  var modeHint = {
    push:      '卦象偏有施力空間，可小步測試並觀察回應',
    wait:      '先觀察有無實際回應，再決定是否推進',
    stabilize: '守住現有局面，避免不必要的消耗',
    retreat:   '先退一步，保護好自己再說',
    observe:   '先觀察清楚再決定，不要被情緒帶著走'
  }[mode];
  if (modeHint && advice.indexOf(modeHint) === -1) advice.push(modeHint);

  return { mode: mode, advice: advice };
}



// ─────────────────────────────────────────────────────────────────
// buildMeihuaYingQi — 依實際卦中生／克體三爻給相對應期候選。
// 《梅花易數》卷三〈占卦訣〉先要求「看卦中有生體之卦」及「有克體之卦」，
// 再討論卦氣；不得只由體五行理論推導一個盤中不存在的生體卦或克體卦。
// ─────────────────────────────────────────────────────────────────
function buildMeihuaYingQi(mh) {
  try {
    var ti = mh && mh.tiG && mh.tiG.el;
    if (!ti) return null;
    var SHENG_ME = {金:'土', 木:'水', 水:'金', 火:'木', 土:'火'}; // 生我者
    var KE_ME    = {金:'火', 木:'金', 水:'土', 火:'水', 土:'木'}; // 剋我者
    var EL_TXT   = {
      木:'寅卯之月氣（未換算實際月界）', 火:'巳午之月氣（未換算實際月界）',
      土:'辰未戌丑之季月氣（未換算實際月界）',
      金:'申酉之月氣（未換算實際月界）', 水:'亥子之月氣（未換算實際月界）'
    };
    var shengEl = SHENG_ME[ti], keEl = KE_ME[ti];
    var up=mh.up, lo=mh.lo, nuclear=mh.nuclear;
    if (!up || !lo || !Array.isArray(up.li) || !Array.isArray(lo.li) ||
        !Number.isInteger(mh.dong) || mh.dong<1 || mh.dong>6 ||
        !nuclear || !nuclear.upper || !nuclear.lower || !mh.yoG) {
      return {tiEl:ti,precision:'insufficient',jiTxt:'卦象資料不全，不能計算生體卦氣候選',
        baiTxt:'卦象資料不全，不能計算克體卦氣候選',layerTxt:'待補齊本卦、互卦與動爻後再談相對層次'};
    }
    var changed=lo.li.concat(up.li);
    changed[mh.dong-1]=changed[mh.dong-1]?0:1;
    var changedUse=mh.dong<=3?gByL(changed[0],changed[1],changed[2]):gByL(changed[3],changed[4],changed[5]);
    if (!changedUse || !changedUse.el) return null;
    var tiInUpper=mh.dong<=3;
    var sources=[
      {layer:'用卦',element:mh.yoG.el,relative:'近期'},
      {layer:'體互',element:tiInUpper?nuclear.upper.el:nuclear.lower.el,relative:'中間'},
      {layer:'用互',element:tiInUpper?nuclear.lower.el:nuclear.upper.el,relative:'中間'},
      {layer:'變後用卦',element:changedUse.el,relative:'後段'}
    ];
    var help=sources.filter(function(s){return s.element===shengEl;});
    var restraint=sources.filter(function(s){return s.element===keEl;});
    function where(list){return list.map(function(s){return s.layer+'（'+s.relative+'）';}).join('、');}
    return {
      tiEl:ti, shengEl:shengEl, keEl:keEl, sources:sources,
      supportSources:help, challengeSources:restraint,
      precision:'traditional-qi-candidate-only',
      jiTxt:help.length?
        '盤中生體卦見於'+where(help)+'，其'+shengEl+'氣可作'+EL_TXT[shengEl]+'的傳統候選；未換算實際日期':
        '盤中用卦、兩互及變後用卦未見生體，暫無生體卦氣候選；不能由理論五行另造吉應日期',
      baiTxt:restraint.length?
        '盤中克體卦見於'+where(restraint)+'，其'+keEl+'氣可作'+EL_TXT[keEl]+'的傳統候選；未換算實際日期':
        '盤中用卦、兩互及變後用卦未見克體，暫無克體卦氣候選；不能由理論五行另造敗應日期',
      layerTxt:'用卦、互卦、變後用卦依此次卦象分別取近期、中間、後段；'+
        (help.length&&restraint.length?'盤中同見生體與克體，須分別看作用，不能挑一個元素硬斷日期；':'')+
        '尚無足以換算最近幾個月或精確日期的資料'
    };
  } catch (e) { return null; }
}

// ─────────────────────────────────────────────────────────────────
// 【新增5】buildMeihuaOutput — 主整合入口
// 呼叫：buildMeihuaOutput(mh, type)
// 自動把所有輸出掛回 mh 本體，確保 S.meihua.tags 等可直接存取。
// ─────────────────────────────────────────────────────────────────
function buildMeihuaOutput(mh, type) {
  if (!mh) return null;

  var t = type || 'general';

  // 1. 核心分析
  var analysis = analyzeMeihua(mh, t);

  // 2. 各輸出層
  var tags       = buildMeihuaTags(mh, t, analysis);
  var summaryObj = buildMeihuaSummary(mh, t, analysis);
  var timing     = buildMeihuaTiming(mh, t, analysis);
  var risk       = buildMeihuaRisk(mh, t, analysis);
  var strategy   = buildMeihuaStrategy(mh, t, analysis, summaryObj.decisionHint);
  var yingQi     = buildMeihuaYingQi(mh); // v2 正統應期

  // 3. 組裝
  var output = {
    analysis:     analysis,
    tags:         tags,
    summary:      summaryObj.summary,
    shortVerdict: summaryObj.shortVerdict,
    decisionHint: summaryObj.decisionHint,
    timing:       timing,
    risk:         risk,
    strategy:     strategy,
    yingQi:       yingQi,
    score:        analysis.score,
    dir:          analysis.dir,
    phase:        analysis.phase,
    narrativeBlocks: analysis.narrativeBlocks
  };

  // 4. 掛回 mh 本體（保持相容性）
  mh.analysis     = analysis;
  mh.tags         = tags;
  mh.summary      = summaryObj.summary;
  mh.shortVerdict = summaryObj.shortVerdict;
  mh.decisionHint = summaryObj.decisionHint;
  mh.timing       = timing;
  mh.risk         = risk;
  mh.strategy     = strategy;
  mh.yingQi       = yingQi;

  return output;
}


// ═══════════════════════════════════════════════════════════════
// 【calcMH 升級版】
// 請將 tarot.js 原本第 99-114 行的 calcMH 函式，替換為以下內容。
// 差異：return 前自動呼叫 buildMeihuaOutput(mh,'general')，
//       讓 mh 物件從起卦瞬間就帶完整輸出層欄位。
//       待結果頁確認 type 後可再呼叫
//       buildMeihuaOutput(S.meihua, realType) 覆蓋。
// ═══════════════════════════════════════════════════════════════
function calcMH(un,ln,dy,castContext){
  if(![un,ln,dy].every(function(n){return Number.isInteger(n)&&n>0;}))throw new Error('卦數與動爻必須是正整數。');
  var up=gByN(un),lo=gByN(ln),dong=((dy-1)%6)+1;
  var ben=g64(up.n, lo.n);
  var benL=lo.li.concat(up.li);
  var nuclear=mhNuclearContext({lo:lo,up:up,dong:dong});
  var hu=nuclear.hexagram;
  var biL=benL.slice(); biL[dong-1]=biL[dong-1]?0:1;
  var biLo=gByL(biL[0],biL[1],biL[2]);
  var biUp=gByL(biL[3],biL[4],biL[5]);
  var bian=g64(biUp.n, biLo.n);
  var tiG=dong<=3?up:lo, yoG=dong<=3?lo:up;
  var ty=tiYong(tiG.el,yoG.el);
  var mh={up:up,lo:lo,dong:dong,ben:ben,hu:hu,nuclear:nuclear,bian:bian,tiG:tiG,yoG:yoG,ty:ty};
  mh.castContext=castContext?Object.assign({},castContext):{timestamp:new Date().toISOString(),method:'provided-trigrams',upperTrigram:up.n,lowerTrigram:lo.n,movingLine:dong};
  if(!Number.isFinite(Date.parse(mh.castContext.timestamp)))throw new Error('起卦時間格式無效。');
  // 自動掛輸出層（general 先跑，結果頁再用真實 type 覆蓋）
  try{ if(typeof buildMeihuaOutput==='function')buildMeihuaOutput(mh,'general'); }catch(e){}
  return mh;
}
