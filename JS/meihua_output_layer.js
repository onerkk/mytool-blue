// ═══════════════════════════════════════════════════════════════
// 梅花輸出層 v1 — 新增區塊
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
    '用生體': { label: '推進',     dir: 'positive', w: 8 },
    '比和':   { label: '有機會',   dir: 'positive', w: 6 },
    '體克用': { label: '推進',     dir: 'positive', w: 5 },
    '體生用': { label: '停滯',     dir: 'neutral',  w: 4 },
    '用克體': { label: '不宜妄動', dir: 'negative', w: 8 }
  };
  var de = dirMap[rel] || { label: '觀望', dir: 'neutral', w: 3 };
  pt(de.label, de.dir, de.w,
    (judge === '大吉' || judge === '凶') ? '高' : '中', 'tiYong');

  // 變卦走向補充
  var bianDirMap = {
    '好轉':    { label: '好轉',    dir: 'positive', w: 7 },
    '惡化':    { label: '惡化',    dir: 'negative', w: 7 },
    '拖延':    { label: '拖延',    dir: 'negative', w: 5 },
    '反覆':    { label: '反覆',    dir: 'neutral',  w: 4 },
    '平穩':    { label: '停滯',    dir: 'neutral',  w: 3 },
    '另有出口':{ label: '有機會',  dir: 'positive', w: 5 }
  };
  var bdt = bianDirMap[bianTrend.type];
  if (bdt) pt(bdt.label, bdt.dir, bdt.w, '中', 'bian');

  // 先吉後阻 / 先難後易
  if (huHidden.cat === '暗中有助' && (bianTrend.type === '惡化' || bianTrend.type === '拖延'))
    pt('先吉後阻', 'negative', 6, '中', 'hu');
  else if (huHidden.cat === '外部壓制' && (bianTrend.type === '好轉' || bianTrend.type === '另有出口'))
    pt('先難後易', 'positive', 6, '中', 'hu');

  // ── 2. 主客類（source: tiYong + hu）──
  var subjectMap = {
    '體克用': { label: '我方主動',   dir: 'positive', w: 7 },
    '用生體': { label: '對方主導',   dir: 'neutral',  w: 6 },
    '用克體': { label: '外部壓制',   dir: 'negative', w: 8 },
    '體生用': { label: '自耗',       dir: 'negative', w: 5 },
    '比和':   { label: '拉鋸',       dir: 'neutral',  w: 4 }
  };
  var se = subjectMap[rel];
  if (se) pt(se.label, se.dir, se.w, '高', 'tiYong');

  if (huHidden.cat === '外部壓制') pt('外部壓制', 'negative', 5, '中', 'hu');
  if (huHidden.cat === '自耗')     pt('自耗',     'negative', 4, '中', 'hu');
  if (huHidden.cat === '可控')     pt('可控局面', 'positive', 4, '中', 'hu');

  // ── 3. 障礙類（source: hu + ben + season + dong）──
  var obstacleMap = {
    '外部壓制': '外力阻礙',
    '自耗':     '情緒干擾',
    '拉鋸':     '溝通不順',
    '變數':     '隱情未明'
  };
  var obs = obstacleMap[huHidden.cat];
  if (obs) pt(obs, 'negative', 4, '中', 'hu');

  if (tiWS.level === '死' || tiWS.level === '囚') {
    pt('時機未到', 'negative', 5, '高', 'season');
    pt('當下不利', 'negative', 4, '高', 'season');
  }
  if (yoWS.level === '旺' && (tiWS.level === '死' || tiWS.level === '囚'))
    pt('現實壓力', 'negative', 5, '中', 'season');

  var benObstacles = {
    '訟': '溝通不順', '困': '現實壓力', '蹇': '外力阻礙',
    '否': '外力阻礙', '剝': '現實壓力', '蒙': '隱情未明',
    '睽': '溝通不順', '旅': '第三方因素', '遁': '隱情未明'
  };
  var benObs = Object.keys(benObstacles).filter(function(k){ return benName.indexOf(k) !== -1; })[0];
  if (benObs) pt(benObstacles[benObs], 'negative', 4, '中', 'ben');

  if (dong === 3 || dong === 4) pt('溝通不順', 'negative', 3, '低', 'dong');

  // ── 4. 時間類（source: dong + season + bian）──
  var tSpeed = timingObj.score || 0;
  if      (tSpeed >= 2)  pt('短期有動', 'positive', 6, '高', 'dong');
  else if (tSpeed <= -2) pt('短期無動', 'negative', 6, '高', 'dong');
  else                   pt('短期有動', 'neutral',  3, '低', 'dong');

  if (timingObj.label === '拖延型') pt('延後有利', 'neutral',  4, '中', 'bian');
  if (timingObj.label === '反覆型') pt('反覆',     'negative', 5, '中', 'bian');
  if (tiWS.level === '死' || tiWS.level === '囚')
    pt('當下不利', 'negative', 5, '高', 'season');

  // ── 5. 類型專屬標籤（source: tiYong + bian + hu + dong + ben）──
  if (t === 'love') {
    if (rel === '用生體' && dong >= 3 && dong <= 4)
      pt('曖昧升溫', 'positive', 7, '中', 'tiYong');
    if (rel === '比和' || huHidden.cat === '拉鋸')
      pt('對方觀望', 'neutral', 5, '中', 'hu');
    if (rel === '體生用' && bianTrend.type === '好轉')
      pt('有互動但難落實', 'neutral', 5, '中', 'tiYong');
    if (bianTrend.type === '反覆' || timingObj.label === '反覆型')
      pt('關係反覆', 'negative', 6, '中', 'bian');
    if (rel === '用生體' && (bianTrend.type === '惡化' || bianTrend.type === '拖延'))
      pt('有桃花但不穩', 'neutral', 6, '中', 'bian');
    if (benName.indexOf('旅') !== -1 || benName.indexOf('姤') !== -1 || bianName.indexOf('睽') !== -1)
      pt('第三方因素', 'negative', 5, '中', 'ben');

  } else if (t === 'career') {
    if (rel === '用克體')
      pt('上位壓力', 'negative', 7, '高', 'tiYong');
    if (tiWS.level === '死' || tiWS.level === '囚')
      pt('制度卡住', 'negative', 5, '中', 'season');
    if (huHidden.cat === '外部壓制' && bianTrend.type === '好轉')
      pt('先卡後動', 'positive', 6, '中', 'hu');
    if (rel === '用生體' || rel === '體克用')
      pt('適合轉動', 'positive', 5, '中', 'tiYong');
    if (rel === '用克體' || rel === '體生用')
      pt('適合先守', 'neutral', 5, '中', 'tiYong');

  } else if (t === 'wealth') {
    if (rel === '用生體')
      pt('偏財虛', 'neutral', 4, '中', 'tiYong');
    if (rel === '體克用' || rel === '比和')
      pt('正財穩', 'positive', 5, '中', 'tiYong');
    if (rel === '體生用' || rel === '用克體')
      pt('財來財去', 'negative', 6, '中', 'tiYong');
    if (rel === '用克體' || bianTrend.type === '惡化')
      pt('不宜冒進', 'negative', 7, '高', 'bian');

  } else if (t === 'health') {
    if (rel === '用克體' || tiWS.level === '死')
      pt('現實壓力', 'negative', 5, '中', 'tiYong');
    if (tiWS.level === '囚' || tiWS.level === '死')
      pt('當下不利', 'negative', 5, '高', 'season');
    if (huHidden.cat === '自耗')
      pt('情緒干擾', 'negative', 4, '中', 'hu');

  } else if (t === 'relationship') {
    if (rel === '用克體')
      pt('外力阻礙', 'negative', 6, '高', 'tiYong');
    if (rel === '體克用')
      pt('我方主動', 'positive', 5, '中', 'tiYong');
    if (benName.indexOf('訟') !== -1 || bianName.indexOf('訟') !== -1)
      pt('溝通不順', 'negative', 6, '中', 'ben');

  } else if (t === 'family') {
    if (rel === '體生用')
      pt('自耗', 'negative', 5, '中', 'tiYong');
    if (dong === 5)
      pt('第三方因素', 'neutral', 4, '低', 'dong');
    if (bianTrend.type === '好轉')
      pt('延後有利', 'positive', 5, '中', 'bian');
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
  if      (isGood && isQuick && bGood)         shortVerdict = '短期有動，方向正確，可以推進';
  else if (isGood && isQuick && bRepeats)       shortVerdict = '短期有動，但進展不穩，別過度期待';
  else if (isGood && isSlow)                    shortVerdict = '事情有機會，但需等條件成熟';
  else if (isGood && bBad)                      shortVerdict = '現在看起來順，但走向不樂觀，要留後路';
  else if (isBad  && isQuick && bGood)          shortVerdict = '現在有阻力，但後續有轉機';
  else if (isBad  && bBad)                      shortVerdict = '局面受阻，短期難以改變，先退守';
  else if (isBad  && seasonBad)                 shortVerdict = '時機與局面都不利，不宜強推';
  else if (bRepeats)                            shortVerdict = '結果反覆，不穩定，觀察為主';
  else if (seasonBad && isGood)                 shortVerdict = '局面可以，但當下時機偏弱，慢慢來';
  else if (seasonBad)                           shortVerdict = '時機不對，暫時按兵不動';
  else if (isGood)                              shortVerdict = '局面對你有利，可以主動推進';
  else                                          shortVerdict = '局面暫時受阻，宜觀望';

  // ── summary ──
  var relLabel = {
    '用生體': '外力助你', '比和': '勢均力敵',
    '體克用': '你可主導', '體生用': '你在付出', '用克體': '外在壓制'
  }[rel] || '局勢不明';

  var typeFocusMap = {
    love: '感情', career: '工作', wealth: '財運',
    health: '身體', relationship: '人際', family: '家庭', general: '事情'
  };
  var focusWord = typeFocusMap[t] || '事情';
  var tiWsLabel = (tiWS.level === '旺' || tiWS.level === '相') ? '，當下月令有利' :
                  (tiWS.level === '死' || tiWS.level === '囚') ? '，當下月令不利' : '';

  var summary = focusWord + '目前「' + benName + '」，' +
    '體用：' + relLabel + '，動爻第' + dong + '爻（' + (dongStage.stage||'起步') + '階段），' +
    '走向偏「' + (bianTrend.type||'反覆') + '」' + tiWsLabel + '。' + shortVerdict;

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
    return { speed: 'normal', windowLabel: '1-4週', windowDays: [7,28], tendency: 'delayed', note: '資料不足，暫以短期估算' };
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
    '很快':   { label: '1-7天',     days: [1, 7] },
    '短期':   { label: '1-4週',     days: [7, 28] },
    '稍晚':   { label: '1-3個月',   days: [28, 90] },
    '拖延型': { label: '3個月以上', days: [90, 180] },
    '反覆型': { label: '時機未定',  days: null }
  };
  var wd = windowData[timingObj.label] || { label: '1-4週', days: [7, 28] };

  var tendency = 'delayed';
  if      (speed === 'fast')     tendency = 'quick-hit';
  else if (speed === 'normal')   tendency = 'quick-hit';
  else if (speed === 'unstable') tendency = 'repeated';
  else if (bianTrend.type === '惡化') tendency = 'blocked';
  else                           tendency = 'delayed';

  var note = timingObj.note || '';
  if (!note) {
    if      (speed === 'fast')     note = '卦氣活躍，近期很快有動靜，不要錯過';
    else if (speed === 'normal')   note = '有進展，但不是馬上，保持耐心推進';
    else if (speed === 'unstable') note = '時間不定，可能走走停停，準備好長期應對';
    else                           note = '需要等待條件改變，不宜強催';
  }
  if (tiWS.level === '旺' || tiWS.level === '相') note += '（月令有利，時機靠近）';
  else if (tiWS.level === '死' || tiWS.level === '囚') note += '（月令不利，應期可能再延後）';

  return {
    speed:       speed,
    windowLabel: wd.label,
    windowDays:  wd.days,
    tendency:    tendency,
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
    points.push('外在壓力明顯，有被壓制或阻礙的風險');
  if (rel === '體生用')
    points.push('你持續付出，回報不明確，能量有消耗過度的風險');
  if (tiWS.level === '死' || tiWS.level === '囚')
    points.push('月令對你不利，當下動作容易事倍功半');
  if (bianTrend.type === '惡化')
    points.push('若不調整策略，走向會繼續惡化');
  if (bianTrend.type === '反覆')
    points.push('結果容易反覆，需防情緒性決策');
  if (huHidden.cat === '外部壓制')
    points.push('有看不到的外力在壓著這件事，注意隱性阻礙');
  if (huHidden.cat === '自耗')
    points.push('內耗風險高，注意不要因猶豫焦慮消耗自己');

  if (t === 'wealth' && (rel === '用克體' || bianTrend.type === '惡化'))
    points.push('財務有風險，不宜冒進或過度槓桿');
  if (t === 'health' && (tiWS.level === '死' || tiWS.level === '囚'))
    points.push('身體能量偏弱，注意免疫力和慢性消耗');
  if (t === 'love' && (bianTrend.type === '反覆' || rel === '用克體'))
    points.push('感情有反覆或外力阻礙的風險，注意自我保護');

  if (points.length === 0) points.push('整體風險偏低，保持現有方向即可');

  return { level: level, points: points };
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
    push:      '時機對你有利，主動出擊效果最好',
    wait:      '等待比強推效果更好，耐心是關鍵',
    stabilize: '守住現有局面，避免不必要的消耗',
    retreat:   '先退一步，保護好自己再說',
    observe:   '先觀察清楚再決定，不要被情緒帶著走'
  }[mode];
  if (modeHint && advice.indexOf(modeHint) === -1) advice.push(modeHint);

  return { mode: mode, advice: advice };
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
function calcMH(un,ln,dy){
  var up=gByN(un),lo=gByN(ln),dong=((dy-1)%6)+1;
  var ben=g64(up.n, lo.n);
  var benL=lo.li.concat(up.li);
  var huLo=gByL(benL[1],benL[2],benL[3]);
  var huUp=gByL(benL[2],benL[3],benL[4]);
  var hu=g64(huUp.n, huLo.n);
  var biL=benL.slice(); biL[dong-1]=biL[dong-1]?0:1;
  var biLo=gByL(biL[0],biL[1],biL[2]);
  var biUp=gByL(biL[3],biL[4],biL[5]);
  var bian=g64(biUp.n, biLo.n);
  var tiG=dong<=3?up:lo, yoG=dong<=3?lo:up;
  var ty=tiYong(tiG.el,yoG.el);
  var mh={up:up,lo:lo,dong:dong,ben:ben,hu:hu,bian:bian,tiG:tiG,yoG:yoG,ty:ty};
  // 自動掛輸出層（general 先跑，結果頁再用真實 type 覆蓋）
  try{ buildMeihuaOutput(mh,'general'); }catch(e){}
  return mh;
}
