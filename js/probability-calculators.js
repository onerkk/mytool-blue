/**
 * 各方法概率計算器
 * 輸出統一格式：{ probability, confidence, symbols, reasoning, rawResult }
 * 流程：方法選擇 → 平行分析 → 各方法轉換為概率
 */
(function (global) {
  'use strict';

  function clamp(x, lo, hi) {
    var n = Number(x);
    if (n !== n) return lo;
    return Math.max(lo, Math.min(hi, n));
  }

  function clamp01(x) { return clamp(x, 0, 1); }

  // ---------------------------------------------------------------------------
  // 1. 八字概率計算器
  // ---------------------------------------------------------------------------
  var FOCUS = {
    finance: { favorable: ['土'], unfavorable: ['木'] },
    career: { favorable: ['火', '土'], unfavorable: ['水'] },
    health: { favorable: ['木', '水'], unfavorable: ['金', '火'] },
    relationship: { favorable: ['水', '金'], unfavorable: ['土'] },
    general: { favorable: [], unfavorable: [] }
  };

  function BaziProbabilityCalculator() {}
  BaziProbabilityCalculator.prototype.reliability = 0.85;
  BaziProbabilityCalculator.prototype.name = '八字';

  BaziProbabilityCalculator.prototype.analyze = function (question, context) {
    var out = { probability: 0.5, confidence: 0.5, symbols: [], reasoning: '', rawResult: null };
    if (typeof BaziCalculator === 'undefined') return out;

    try {
      var birth = context.birth_datetime || context.birthDate;
      var gender = (context.gender === 'male' || context.gender === 'female') ? context.gender : 'male';
      var calc = new BaziCalculator();
      var raw = calc.calculateBazi(birth, gender, !!context.useSolarTime, context.longitude != null ? context.longitude : 120.2);
      out.rawResult = raw;

      var es = raw.elementStrength || {};
      var strengths = es.strengths || {};
      var favorable = raw.favorableElements && raw.favorableElements.favorable ? raw.favorableElements.favorable : [];
      var unfavorable = raw.favorableElements && raw.favorableElements.unfavorable ? raw.favorableElements.unfavorable : [];
      var cat = (question && question.category) ? question.category : 'general';
      var focus = FOCUS[cat] || FOCUS.general;

      var score = 0.5;
      var total = 0;
      for (var el in strengths) {
        if (!Object.prototype.hasOwnProperty.call(strengths, el)) continue;
        var s = Number(strengths[el]) || 0;
        var n = Math.min(1, s / 10);
        total += n;
        if (focus.favorable && focus.favorable.indexOf(el) >= 0) score += n * 0.1;
        else if (focus.unfavorable && focus.unfavorable.indexOf(el) >= 0) score -= n * 0.1;
        else if (favorable.indexOf(el) >= 0) score += n * 0.08;
        else if (unfavorable.indexOf(el) >= 0) score -= n * 0.08;
      }

      var body = (es.bodyStrength || '').toString();
      if (/強|中和/.test(body)) score += 0.05;
      else if (/弱|極弱/.test(body)) score -= 0.05;

      out.probability = clamp01(score);
      out.confidence = raw.fourPillars && raw.fourPillars.year && raw.fourPillars.month ? 0.8 : 0.5;
      out.symbols = favorable.slice(0, 5);
      out.reasoning = '八字五行與喜用分析：' + (favorable.length ? '喜' + favorable.join('、') : '') + (unfavorable.length ? '；忌' + unfavorable.join('、') : '') + '。日主' + (body || '—') + '。';
    } catch (e) {
      out.reasoning = '八字分析暫不可用：' + (e && e.message ? e.message : '');
    }
    return out;
  };

  // ---------------------------------------------------------------------------
  // 2. 姓名學概率計算器
  // ---------------------------------------------------------------------------
  var NUMBERS = {
    finance: [15, 16, 24, 29, 32, 33, 41, 52],
    career: [13, 16, 21, 23, 31, 37, 41, 48],
    health: [5, 6, 11, 15, 16, 24],
    relationship: [6, 15, 16, 24, 32],
    general: [1, 3, 5, 6, 7, 8, 11, 13, 15, 16, 21, 23, 24, 29, 31, 32, 33, 37, 39, 41, 45, 47, 48, 52, 57, 61, 63, 65, 67, 68, 73, 75, 77, 78, 81]
  };

  function NameologyProbabilityCalculator() {}
  NameologyProbabilityCalculator.prototype.reliability = 0.7;
  NameologyProbabilityCalculator.prototype.name = '姓名學';

  NameologyProbabilityCalculator.prototype.analyze = function (question, context) {
    var out = { probability: 0.5, confidence: 0.7, symbols: [], reasoning: '', rawResult: null };
    var nameStr = (context.name || context.fullName || '').trim();
    if (!nameStr || nameStr.length < 2) {
      out.reasoning = '姓名學需至少二字姓名。';
      return out;
    }

    try {
      var sys = typeof NameAnalysisSystem !== 'undefined' ? new NameAnalysisSystem() : null;
      if (!sys || !sys.analyzeFullName) {
        out.reasoning = '姓名學系統未載入。';
        return out;
      }

      var raw = sys.analyzeFullName(nameStr, context.birthYear || null, context.gender || 'male');
      if (raw && raw.error) {
        out.reasoning = raw.error;
        return out;
      }
      out.rawResult = raw;

      var cat = (question && question.category) ? question.category : 'general';
      var nums = NUMBERS[cat] || NUMBERS.general;
      var fp = raw.fivePatterns || {};
      var person = (fp.person && fp.person.number != null) ? fp.person.number : null;
      var total = (fp.total && fp.total.number != null) ? fp.total.number : null;
      var ev = 0;
      var count = 0;
      if (person != null && nums.indexOf(person) >= 0) { ev += 1; count++; }
      if (total != null && nums.indexOf(total) >= 0) { ev += 1; count++; }
      var score = count > 0 ? ev / 2 : 0.5;
      if (raw.overallScore != null) score = (score + (Number(raw.overallScore) / 100)) / 2;
      out.probability = clamp01(0.4 + score * 0.2);
      out.symbols = [person, total].filter(function (n) { return n != null; });
      out.reasoning = '姓名數理：人格' + (person != null ? person : '—') + '，總格' + (total != null ? total : '—') + '；本類吉數' + (count > 0 ? '有' : '無') + '。';
    } catch (e) {
      out.reasoning = '姓名學分析出錯：' + (e && e.message ? e.message : '');
    }
    return out;
  };

  // ---------------------------------------------------------------------------
  // 3. 梅花易數概率計算器
  // ---------------------------------------------------------------------------
  var LUCK_MAP = {
    '大吉': 0.85, '吉': 0.65, '平': 0.5, '凶': 0.35, '大凶': 0.15,
    '小吉': 0.6, '小凶': 0.4, '中吉': 0.7, '中凶': 0.3
  };

  function PlumBlossomProbabilityCalculator() {}
  PlumBlossomProbabilityCalculator.prototype.reliability = 0.75;
  PlumBlossomProbabilityCalculator.prototype.name = '梅花易數';

  PlumBlossomProbabilityCalculator.prototype.analyze = function (question, context) {
    var out = { probability: 0.5, confidence: 0.75, symbols: [], reasoning: '', rawResult: null };
    if (typeof MeihuaModule === 'undefined' || !MeihuaModule.calculator) {
      out.reasoning = '梅花易數模組未載入。';
      return out;
    }

    try {
      var calc = MeihuaModule.calculator;
      var div = calc.divineByRandom ? calc.divineByRandom() : null;
      if (!div) {
        var now = new Date();
        var y = now.getFullYear(); var m = now.getMonth() + 1; var d = now.getDate();
        var h = now.getHours(); var min = now.getMinutes();
        div = { upperNum: (y + m + d) % 8 || 8, lowerNum: (y + m + d + h) % 8 || 8, movingLine: (y + m + d + h + min) % 6 || 6 };
      }
      var analyzed = calc.analyzeHexagram ? calc.analyzeHexagram(div) : null;
      if (!analyzed) {
        out.reasoning = '梅花起卦或解卦失敗。';
        return out;
      }
      out.rawResult = analyzed;

      var ben = analyzed.benGua || {};
      var luck = (ben.luck || '平').toString();
      var prob = LUCK_MAP[luck] != null ? LUCK_MAP[luck] : 0.5;

      var ty = analyzed.tiYong || {};
      var bodyUse = (ty.relation || ty.bodyUse || '').toString();
      var adj = 0;
      if (/體用比和|比和/.test(bodyUse)) adj = 0.08;
      else if (/用生體|生體/.test(bodyUse)) adj = 0.06;
      else if (/體生用/.test(bodyUse)) adj = 0.02;
      else if (/用剋體|用克體|剋體|克體/.test(bodyUse)) adj = -0.06;
      else if (/體剋用|體克用/.test(bodyUse)) adj = -0.02;
      out.probability = clamp01(prob + adj);
      out.symbols = [ben.name, luck].filter(Boolean);
      out.reasoning = '本卦 ' + (ben.name || '') + '，' + luck + '；體用 ' + (bodyUse || '—') + '。';
    } catch (e) {
      out.reasoning = '梅花易數分析出錯：' + (e && e.message ? e.message : '');
    }
    return out;
  };

  // ---------------------------------------------------------------------------
  // 4. 凱爾特十字（塔羅）概率計算器
  // ---------------------------------------------------------------------------
  var POSITIONS = {
    1: { name: '中心', weight: 0.15 }, 2: { name: '跨越', weight: 0.12 }, 3: { name: '基礎', weight: 0.10 },
    4: { name: '過去', weight: 0.08 }, 5: { name: '皇冠', weight: 0.14 }, 6: { name: '未來', weight: 0.12 },
    7: { name: '自我', weight: 0.09 }, 8: { name: '環境', weight: 0.09 }, 9: { name: '希望', weight: 0.06 },
    10: { name: '結果', weight: 0.15 }
  };

  var POS = ['正', '負'];
  var POS_WORDS = ['成功','順利','機會','成長','進展','祝福','喜悅','收穫','圓滿','希望','突破','穩定','和諧','支持','提升','勝利','勇氣','新開始'];
  var NEG_WORDS = ['阻礙','延遲','失敗','衝突','破裂','焦慮','損失','混亂','背離','欺騙','停滯','消耗','壓力','風險','分離','挫折','不穩','失衡','匱乏'];

  function cardScore(meaning, isReversed) {
    var t = (meaning || '').toString();
    var s = 0.5;
    for (var i = 0; i < POS_WORDS.length; i++) if (t.indexOf(POS_WORDS[i]) >= 0) s += 0.04;
    for (var j = 0; j < NEG_WORDS.length; j++) if (t.indexOf(NEG_WORDS[j]) >= 0) s -= 0.04;
    if (isReversed) s = 1 - s;
    return clamp01(s);
  }

  function CelticCrossProbabilityCalculator() {}
  CelticCrossProbabilityCalculator.prototype.reliability = 0.75;
  CelticCrossProbabilityCalculator.prototype.name = '塔羅';

  CelticCrossProbabilityCalculator.prototype.analyze = function (question, context) {
    var out = { probability: 0.5, confidence: 0.65, symbols: [], reasoning: '', rawResult: null };
    var cards = context.cards || context.tarotCards || [];
    if (!cards.length) {
      out.reasoning = '塔羅需先完成凱爾特十字抽牌。';
      return out;
    }

    try {
      var gd = typeof GoldenDawnCelticCross !== 'undefined' ? new GoldenDawnCelticCross() : null;
      if (gd && gd.analyze) {
        var gdOut = gd.analyze(cards, (question && question.raw) ? question.raw : '', context);
        out.rawResult = gdOut;
        var fs = gdOut.fortuneScore != null ? Number(gdOut.fortuneScore) : 50;
        out.probability = clamp01(fs / 100);
        out.reasoning = (gdOut.summary || '塔羅機率 ' + fs + '%。') + '';
        out.symbols = (gdOut.positions || []).slice(0, 5).map(function (p) { return (p.card || '') + (p.orientation || ''); });
        out.confidence = 0.65 + (gdOut.signals && (gdOut.signals.positive + gdOut.signals.negative) > 0 ? 0.1 : 0);
        return out;
      }

      var cat = (question && question.category) ? question.category : 'general';
      var weighted = 0;
      var totalW = 0;
      for (var i = 0; i < Math.min(10, cards.length); i++) {
        var c = cards[i];
        var pos = i + 1;
        var w = (POSITIONS[pos] && POSITIONS[pos].weight) ? POSITIONS[pos].weight : 0.1;
        var meaning = c.meaning || c.upright || '';
        var rev = !!c.isReversed;
        var sc = cardScore(meaning, rev);
        weighted += sc * w;
        totalW += w;
      }
      var base = totalW > 0 ? weighted / totalW : 0.5;
      var key1 = (cards[0] && cardScore(cards[0].meaning || cards[0].upright || '', !!cards[0].isReversed) - 0.5) * 0.15;
      var key10 = (cards[9] && cardScore(cards[9].meaning || cards[9].upright || '', !!cards[9].isReversed) - 0.5) * 0.12;
      out.probability = clamp01(base + key1 + key10);
      out.rawResult = { positions: cards.slice(0, 10), base: base };
      out.reasoning = '凱爾特十字加權機率；中心、結果位加權。';
    } catch (e) {
      out.reasoning = '塔羅分析出錯：' + (e && e.message ? e.message : '');
    }
    return out;
  };

  // ---------------------------------------------------------------------------
  // 導出
  // ---------------------------------------------------------------------------
  var api = {
    BaziProbabilityCalculator: BaziProbabilityCalculator,
    NameologyProbabilityCalculator: NameologyProbabilityCalculator,
    PlumBlossomProbabilityCalculator: PlumBlossomProbabilityCalculator,
    CelticCrossProbabilityCalculator: CelticCrossProbabilityCalculator
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    Object.keys(api).forEach(function (k) { global[k] = api[k]; });
  }
})(typeof window !== 'undefined' ? window : this);
