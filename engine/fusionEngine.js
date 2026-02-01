/**
 * 融合引擎 - 機率輸出、直接答案、矛盾處理
 * 依八字、梅花、塔羅彙總，產生單點或區間機率，及 Top3 因子、3 條策略建議
 */
(function (global) {
  'use strict';

  var BASE_RATE_BY_TYPE = {
    love: 45,
    career: 50,
    wealth: 45,
    health: 55,
    general: 50,
    relationship: 50,
    family: 55,
    other: 50
  };

  function clamp(n, min, max) {
    n = Number(n);
    if (!Number.isFinite(n)) return min;
    return Math.max(min, Math.min(max, n));
  }

  function getQuestionType(question, questionType) {
    if (questionType) return String(questionType).toLowerCase();
    var q = String(question || '');
    if (/桃花|感情|戀|告白|結婚|復合|伴侶|正緣|緣份|姻緣/.test(q)) return 'love';
    if (/工作|事業|升遷|轉職|面試|業績/.test(q)) return 'career';
    if (/錢|財|投資|收入|負債|買賣|副業|銷售|破萬|賺錢|業績|賣出|售出|賣掉|手鍊|手練|飾品|自製|作品/.test(q)) return 'wealth';
    if (/健康|病|疼|手術|恢復/.test(q)) return 'health';
    if (/人際|朋友|同事|貴人/.test(q)) return 'relationship';
    if (/家庭|家人|購屋/.test(q)) return 'family';
    return 'general';
  }

  /**
   * 從各系統彙總機率
   * @param {Object} data - { bazi, meihua, tarot, questionType, question }
   * @returns {{ probability: number|string, isRange: boolean, factors: Array, conflictSource: string|null }}
   */
  function computeProbability(data) {
    var type = getQuestionType(data.question, data.questionType);
    var base = BASE_RATE_BY_TYPE[type] || 50;
    var scores = [];
    var factors = [];
    var reasons = [];

    if (data.bazi && data.bazi.fullData) {
      var baziProb = estimateBaziScore(data.bazi, type);
      if (baziProb !== null) {
        scores.push({ sys: '八字', score: baziProb.score, weight: 0.35, reason: baziProb.reason });
        factors.push({ name: '八字運勢', impact: baziProb.score - 50, detail: baziProb.reason });
      }
    }

    if (data.meihua) {
      var meihuaProb = estimateMeihuaScore(data.meihua, type);
      if (meihuaProb !== null) {
        scores.push({ sys: '梅花易數', score: meihuaProb.score, weight: 0.25, reason: meihuaProb.reason });
        factors.push({ name: '卦象吉凶', impact: meihuaProb.score - 50, detail: meihuaProb.reason });
      }
    }

    if (data.tarot && data.tarot.analysis) {
      var tarotProb = data.tarot.analysis.fortuneScore;
      if (Number.isFinite(tarotProb)) {
        scores.push({ sys: '塔羅', score: clamp(tarotProb, 0, 100), weight: 0.35, reason: '凱爾特十字解讀' });
        factors.push({ name: '塔羅牌陣', impact: clamp(tarotProb, 0, 100) - 50, detail: '凱爾特十字 10 張牌綜合' });
      }
    }

    if (data.ziwei && data.ziwei.palaces && data.ziwei.palaces.length && typeof calculateCategoryScore === 'function' && typeof getCategory === 'function') {
      var ziweiCat = getQuestionType(data.question, data.questionType);
      var catMap = { love: 'relationship', wealth: 'finance', career: 'career', health: 'health', relationship: 'relationship', family: 'family', other: 'general' };
      var ziweiRes = calculateCategoryScore('ziwei', data.ziwei, catMap[ziweiCat] || 'general', {});
      if (ziweiRes && Number.isFinite(ziweiRes.score)) {
        scores.push({ sys: '紫微斗數', score: clamp(ziweiRes.score, 0, 100), weight: 0.30, reason: ziweiRes.reason || '星盤宮位與問題類別對應' });
        factors.push({ name: '紫微斗數', impact: ziweiRes.score - 50, detail: ziweiRes.reason || '星盤與本類問題交叉參考' });
      }
    }

    var weightedSum = 0;
    var totalWeight = 0;
    scores.forEach(function (s) {
      weightedSum += s.score * s.weight;
      totalWeight += s.weight;
    });

    var prob = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : base;
    prob = clamp(prob, 0, 100);

    var isRange = false;
    var conflictSource = null;
    if (scores.length >= 2) {
      var minS = Math.min.apply(null, scores.map(function (s) { return s.score; }));
      var maxS = Math.max.apply(null, scores.map(function (s) { return s.score; }));
      if (maxS - minS > 25) {
        isRange = true;
        conflictSource = scores.map(function (s) { return s.sys + '（' + s.score + '%）'; }).join(' 與 ');
      }
    }

    factors.sort(function (a, b) { return Math.abs(b.impact) - Math.abs(a.impact); });
    /* 最多顯示 4 項影響因子，確保八字、梅花、塔羅、紫微有機會都列出 */
    var topFactors = factors.slice(0, 4);

    return {
      probability: isRange ? (Math.min(prob, 85) + '%~' + Math.min(prob + 15, 100) + '%') : prob + '%',
      probabilityValue: prob,
      isRange: isRange,
      factors: topFactors,
      conflictSource: conflictSource,
      baseRate: base
    };
  }

  function estimateBaziScore(bazi, type) {
    try {
      if (typeof calculateCategoryScore === 'function' && typeof getCategory === 'function') {
        var catMap = { love: 'relationship', wealth: 'finance', career: 'career', health: 'health', relationship: 'relationship', family: 'family', other: 'general' };
        var cat = catMap[type] || type;
        if (['general', 'relationship', 'finance', 'career', 'health', 'family'].indexOf(cat) >= 0) {
          var res = calculateCategoryScore('bazi', bazi, cat, { referenceDate: new Date() });
          if (res && (res.score != null || res.reason)) {
            return { score: clamp(res.score != null ? res.score : 50, 0, 100), reason: res.reason || '' };
          }
        }
      }
      var fe = bazi.fullData.favorableElements || {};
      var fav = (fe.favorable && Array.isArray(fe.favorable)) ? fe.favorable : [];
      var unfav = (fe.unfavorable && Array.isArray(fe.unfavorable)) ? fe.unfavorable : [];
      var fireFav = fav.indexOf('火') >= 0;
      var fireUnfav = unfav.indexOf('火') >= 0;
      var score = 50;
      if (fireFav) { score += 12; }
      if (fireUnfav) { score -= 15; }
      var reason = fireFav ? '2026 丙午火年與喜用神相合' : (fireUnfav ? '2026 火年與忌神衝突' : '流年中性');
      return { score: clamp(score, 0, 100), reason: reason };
    } catch (e) { return null; }
  }

  function estimateMeihuaScore(meihua, type) {
    try {
      var benGua = meihua.benGua;
      var luck = meihua.luck || (typeof benGua === 'object' && benGua && benGua.luck) || meihua.jiXiong || '平';
      var luckMap = { '大吉': 85, '吉': 70, '中吉': 65, '小吉': 58, '平': 50, '小凶': 42, '凶': 35, '中凶': 28, '大凶': 15 };
      var score = luckMap[luck] != null ? luckMap[luck] : 50;
      return { score: clamp(score, 0, 100), reason: '本卦吉凶：' + luck };
    } catch (e) { return null; }
  }

  /** 從問題擷取可回扣的關鍵詞，讓答案直接呼應提問（手鍊／賣出／副業／破萬優先於泛用「本月」） */
  function extractEchoPhrase(question) {
    var q = String(question || '');
    if (/賣出|售出|賣掉|賣得掉|能賣|正常賣/.test(q)) {
      if (/手鍊|手練|項鍊|手作|自製|作品|商品|飾品|手環/.test(q)) return '手鍊／自製作品本月能否賣出';
      return '本月能否賣出';
    }
    if (/副業|銷售|業績|破萬|賺錢|收入/.test(q)) {
      if (/破十萬|破百萬/.test(q)) return (/破百萬/.test(q) ? '副業／銷售能否破百萬' : '副業／銷售能否破十萬');
      if (/破萬/.test(q)) return '副業／本月銷售能否破萬';
      if (/副業|銷售|業績/.test(q)) return (/業績/.test(q) ? '本月業績達標' : '副業／本月銷售');
    }
    if (/年終|年底/.test(q) && /破萬|破十萬|破百萬/.test(q)) return (/破十萬/.test(q) ? '今年年終收入破十萬' : /破百萬/.test(q) ? '今年年終收入破百萬' : '今年年終收入破萬');
    if (/破萬|破十萬|破百萬/.test(q)) return (/破萬/.test(q) ? '收入破萬' : /破十萬/.test(q) ? '收入破十萬' : '收入破百萬');
    if (/整體運勢|運勢/.test(q) && !/副業|銷售|破萬|業績|收入|財|賣出|手鍊|手練/.test(q)) return '本月整體運勢';
    if (/這月|這個月|本月/.test(q) && !/副業|銷售|破萬|業績|賣出|手鍊|手練/.test(q)) return '本月整體運勢';
    if (/達標|達標嗎|會達標/.test(q)) return '目標達標';
    if (/會成|成功嗎|能成/.test(q)) return '事情成功';
    if (/加薪|加薪嗎|會加薪/.test(q)) return '加薪';
    if (/錄取|錄取嗎|會錄取/.test(q)) return '錄取';
    if (/復合|復合嗎|會復合/.test(q)) return '復合';
    if (/健康|身體|注意|需要注意/.test(q)) return (/今年|這年/.test(q) ? '今年健康狀況' : '健康狀況');
    if (/為何|如何|怎樣|怎麼樣/.test(q)) {
      if (/運勢|運勢如何/.test(q)) return '本月運勢';
      if (/收入|財運/.test(q)) return '本月收入與財運';
      if (/工作|事業|職涯/.test(q)) return '事業與工作發展';
      if (/感情|姻緣|桃花/.test(q)) return '感情與姻緣';
      if (/健康|身體/.test(q)) return '健康狀況';
    }
    return null;
  }

  /** 依傾向取得詞彙（優先使用 VocabularyDB） */
  function getVocabSubject(type, question, seed) {
    var echo = extractEchoPhrase(question);
    if (echo) return echo;
    var typeKey = type === 'wealth' ? 'finance' : (type === 'love' ? 'love' : type);
    if (typeof VocabularyDB !== 'undefined' && VocabularyDB.getSubject) return VocabularyDB.getSubject(typeKey, seed);
    var wealth = /收入|破萬|賺錢|財運|薪水|加薪|投資|理財/.test(question || '');
    var career = /工作|事業|升遷|轉職|面試|業績|職涯/.test(question || '');
    var love = /感情|姻緣|結婚|復合|對象|桃花/.test(question || '');
    if (wealth) return '本月收入與財運';
    if (career) return '事業與工作發展';
    if (love) return '感情與姻緣';
    return '您問的這件事';
  }

  /** 依問題類型、機率與影響因子產生一致的結論（使用詞彙庫豐富用語） */
  function buildConclusionByType(probVal, type, question, topFactors) {
    var q = String(question || '');
    var seed = (probVal || 0) + (q.length || 0);
    var subject = getVocabSubject(type, q, seed);
    var unfavorableCount = (topFactors || []).filter(function (f) { return f && f.impact < 0; }).length;
    var tendency = probVal >= 60 ? 'favorable' : (probVal >= 48 && unfavorableCount < 2 ? 'neutral' : (probVal >= 35 ? 'unfavorable' : 'strongUnfavorable'));
    var opener = (typeof VocabularyDB !== 'undefined' && VocabularyDB.getConclusionOpener) ? VocabularyDB.getConclusionOpener(tendency, seed) : '';
    var phrase = (typeof VocabularyDB !== 'undefined' && VocabularyDB.getConclusionPhrase) ? VocabularyDB.getConclusionPhrase(tendency, seed) : '';
    var tail = (typeof VocabularyDB !== 'undefined' && VocabularyDB.getConclusionTail) ? VocabularyDB.getConclusionTail(tendency, seed) : '';
    if (!opener) opener = tendency === 'favorable' ? '以八字、梅花、塔羅、紫微等多維象徵交叉來看' : '從各維度象徵綜合看';
    if (!phrase) phrase = tendency === 'favorable' ? '整體偏有利，有機會達標' : (tendency === 'neutral' ? '屬中性' : (tendency === 'unfavorable' ? '偏有阻力' : '阻力較大'));
    if (!tail) tail = tendency === 'favorable' ? '建議把握時機、積極行動。' : (tendency === 'neutral' ? '可先準備、留意時機再行動。' : '建議保守評估、多做準備再決策。');
    if (subject && /手鍊|手練|賣出|自製|作品/.test(subject) && tendency === 'neutral') tail = '可先穩健曝光、留意買氣與上架時機再促單。';
    if (subject && /手鍊|手練|賣出|自製|作品/.test(subject) && tendency === 'favorable') tail = '建議把握曝光與上架時機、積極促單。';
    if (subject && /副業|銷售|破萬|業績/.test(subject) && tendency === 'neutral') tail = '副業／銷售可先穩健鋪陳、留意促銷或旺季時機再衝量。';
    if (subject && /副業|銷售|破萬|業績/.test(subject) && tendency === 'favorable') tail = '建議把握促銷或旺季時機、積極衝量。';
    if (probVal >= 55 && unfavorableCount >= 2) {
      phrase = '中性偏保守';
      tail = '有達標空間但需留意多數維度偏弱，建議穩健準備、把握有利時機。';
    }
    if (probVal >= 48 && probVal < 55 && unfavorableCount >= 2) {
      phrase = '偏有阻力';
      tail = '多數維度評估較弱，建議保守準備、留意時機再行動。';
    }
    return opener + '，「' + subject + '」' + phrase + '，' + tail;
  }

  function isDebug() {
    try {
      var g = (typeof window !== 'undefined' ? window : null);
      return g && g.location && g.location.search && g.location.search.indexOf('debug=1') >= 0;
    } catch (e) {}
    return false;
  }

  /**
   * 產生直接答案：優先走 parseQuestion → EvidenceNormalizer → EvidenceSelector → AnswerSynthesizer → AlignmentGuard
   * UI 答案區塊一律使用本函式回傳的 conclusion（即 finalText）。?debug=1 時印出對齊管線 trace，任一模組未載入或拋錯時印出錯誤與 fallback 原因。
   */
  function generateDirectAnswer(data) {
    var debug = isDebug();
    try {
      if (typeof parseQuestion !== 'function') {
        if (debug) console.group('[對齊管線]'), console.warn('回退原因：parseQuestion 未載入'), console.groupEnd();
        throw new Error('parseQuestion 未載入');
      }
      if (typeof EvidenceNormalizer === 'undefined' || !EvidenceNormalizer.normalizeEvidence) {
        if (debug) console.group('[對齊管線]'), console.warn('回退原因：EvidenceNormalizer 未載入'), console.groupEnd();
        throw new Error('EvidenceNormalizer 未載入');
      }
      if (typeof EvidenceSelector === 'undefined' || !EvidenceSelector.selectEvidence) {
        if (debug) console.group('[對齊管線]'), console.warn('回退原因：EvidenceSelector 未載入'), console.groupEnd();
        throw new Error('EvidenceSelector 未載入');
      }
      if (typeof AnswerSynthesizer === 'undefined' || !AnswerSynthesizer.synthesize) {
        if (debug) console.group('[對齊管線]'), console.warn('回退原因：AnswerSynthesizer 未載入'), console.groupEnd();
        throw new Error('AnswerSynthesizer 未載入');
      }
      if (typeof AlignmentGuard === 'undefined' || !AlignmentGuard.alignmentCheck) {
        if (debug) console.group('[對齊管線]'), console.warn('回退原因：AlignmentGuard 未載入'), console.groupEnd();
        throw new Error('AlignmentGuard 未載入');
      }

      var parsed = parseQuestion(data.question || '');
      var evidenceItems = [];
      var sysList = [
        { key: 'bazi', data: data.bazi },
        { key: 'meihua', data: data.meihua },
        { key: 'tarot', data: data.tarot && data.tarot.analysis ? { analysis: data.tarot.analysis } : null },
        { key: 'nameology', data: data.nameology }
      ];
      sysList.forEach(function (s) {
        if (!s.data) return;
        var payload = s.key === 'bazi' ? { system: s.key, fullData: s.data.fullData || s.data, reason: (s.data.reason || ''), score: s.data.fortuneScore, fortuneScore: s.data.fortuneScore }
          : s.key === 'meihua' ? { system: s.key, benGua: s.data.benGua, luck: s.data.luck, tiYong: (s.data.tiYong && s.data.tiYong.relation) }
          : s.key === 'tarot' ? { system: s.key, analysis: s.data }
          : { system: s.key, analysis: s.data.analysis || s.data };
        var items = EvidenceNormalizer.normalizeEvidence(payload, parsed);
        if (items && items.length) evidenceItems = evidenceItems.concat(items);
      });
      var selectionResult = EvidenceSelector.selectEvidence(parsed, evidenceItems);
      var probResult = computeProbability(data);
      var probVal = typeof probResult.probabilityValue === 'number' ? probResult.probabilityValue : 55;
      var syn = AnswerSynthesizer.synthesize(parsed, selectionResult, { probabilityValue: probVal, probability: probResult.probability }, {});
      var problemRestatement = syn.problemRestatement || '';
      var directAnswer = syn.directAnswer || '';
      var suggestions = syn.suggestions || [];
      var evidenceListForDisplay = syn.evidenceList || [];
      var factorTexts = [];
      var baziExplainText = null;
      var explainResult = null;
      if (typeof ExplainabilityLayer !== 'undefined' && ExplainabilityLayer.buildAll) {
        var fusionData = { bazi: data.bazi, meihua: data.meihua, tarot: data.tarot, ziwei: data.ziwei, nameology: data.nameology };
        parsed.referenceDate = parsed.referenceDate || new Date();
        explainResult = ExplainabilityLayer.buildAll(fusionData, parsed);
        if (explainResult && explainResult.evidenceListForDisplay && explainResult.evidenceListForDisplay.length) {
          evidenceListForDisplay = explainResult.evidenceListForDisplay;
          if (explainResult.texts && explainResult.texts.bazi) {
            baziExplainText = explainResult.texts.bazi.text;
            if (ExplainabilityLayer.buildDirectAnswerPlain) {
              directAnswer = ExplainabilityLayer.buildDirectAnswerPlain(explainResult.texts.bazi, probVal, parsed.intent, data.question);
            }
          }
          if (explainResult.factorSentences && explainResult.factorSentences.length) {
            factorTexts = explainResult.factorSentences;
          }
        }
      }
      if (factorTexts.length === 0) factorTexts = evidenceListForDisplay.map(function (e) { return e; });
      var fullText = problemRestatement + '\n\n' + directAnswer + '\n\n依據：\n' + evidenceListForDisplay.join('\n') + '\n\n建議：\n' + (suggestions.join('\n') || '');
      if (typeof ExplainabilityGuard !== 'undefined' && ExplainabilityGuard.checkEvidenceText) {
        var exGuard = ExplainabilityGuard.checkEvidenceText(evidenceListForDisplay, baziExplainText);
        if (!exGuard.passed) {
          if (typeof console !== 'undefined') console.warn('[ExplainabilityGuard]', exGuard.reason);
          fullText = problemRestatement + '\n\n' + directAnswer + '\n\n依據：\n' + evidenceListForDisplay.join('\n') + '\n\n建議：\n' + (suggestions.join('\n') || '');
        }
      }
      var guard = AlignmentGuard.alignmentCheck(parsed, fullText);
      var conclusion = guard.passed ? fullText : (guard.rewritten || fullText);

      if (debug && typeof console !== 'undefined') {
        console.group('[對齊管線]');
        console.log('直接回答（白話因果）', directAnswer);
        if (explainResult && explainResult.texts && explainResult.texts.bazi) {
          var b = explainResult.texts.bazi;
          console.log('日主／身強弱／喜神／忌神', b.dayMaster, b.bodyStrength, b.favorable, b.unfavorable);
        }
        console.log('parsedQuestion', JSON.stringify({ intent: parsed.intent, askType: parsed.askType, mustAnswer: parsed.mustAnswer, timeHorizon: parsed.timeHorizon }));
        console.log('evidenceItems.length', evidenceItems.length);
        console.log('selectedEvidence.length', (selectionResult.selected && selectionResult.selected.length) || 0);
        console.log('證據充足 / 分數', selectionResult.sufficient, selectionResult.score);
        console.log('finalText mustAnswer 覆蓋率', guard.coverage, 'askType 檢查', guard.missingAskType || '通過', '命中禁止詞', guard.forbiddenHit || false);
        console.log('finalText (前 300 字)', (conclusion || '').substring(0, 300));
        console.groupEnd();
      }

      if (factorTexts.length === 0 && probResult.factors && probResult.factors.length) {
        var methodMap = { '八字運勢': 'bazi', '卦象吉凶': 'meihua', '塔羅牌陣': 'tarot', '紫微斗數': 'ziwei', '姓名學': 'nameology' };
        factorTexts = probResult.factors.slice(0, 4).map(function (f) {
          var label = f.impact > 0 ? '有利' : (f.impact < 0 ? '不利' : '中性');
          return f.name + '：' + label + '（' + (f.detail || '') + '）';
        });
      }
      return {
        conclusion: conclusion,
        factors: factorTexts,
        suggestions: syn.suggestions || [],
        probability: probResult.probability,
        probabilityValue: probResult.probabilityValue,
        isRange: probResult.isRange,
        conflictSource: probResult.conflictSource
      };
    } catch (e) {
      if (typeof console !== 'undefined') {
        if (debug) {
          console.group('[對齊管線]');
          console.error('回退原因：', e && e.message);
          if (e && e.stack) console.error(e.stack);
          console.groupEnd();
        } else {
          console.warn('融合引擎對齊管線失敗，已回退：', e && e.message);
        }
      }
    }

    var probResult = computeProbability(data);
    var probVal = typeof probResult.probabilityValue === 'number' ? probResult.probabilityValue : 55;
    var type = getQuestionType(data.question, data.questionType);
    var topFactors = probResult.factors.slice(0, 4);
    var conclusion = buildConclusionByType(probVal, type, data.question, topFactors);

    var methodMap = { '八字運勢': 'bazi', '卦象吉凶': 'meihua', '塔羅牌陣': 'tarot', '紫微斗數': 'ziwei', '姓名學': 'nameology' };
    var factorTexts = topFactors.map(function (f, i) {
      var tendency = f.impact > 0 ? 'favorable' : (f.impact < 0 ? 'unfavorable' : 'neutral');
      var label = f.impact > 0 ? '有利' : (f.impact < 0 ? '不利' : '中性');
      var methodKey = methodMap[f.name] || '';
      var desc = f.detail || '';
      if (typeof VocabularyDB !== 'undefined' && VocabularyDB.getFactorDescriptor && methodKey) {
        var vocabDesc = VocabularyDB.getFactorDescriptor(methodKey, tendency, (probVal || 0) + i);
        if (vocabDesc) desc = vocabDesc + (desc ? '；' + desc : '');
      }
      return f.name + '：' + label + '（' + desc + '）';
    });

    var suggestions = getSuggestionsByType(type, probVal, data);

    return {
      conclusion: conclusion,
      factors: factorTexts,
      suggestions: suggestions,
      probability: probResult.probability,
      probabilityValue: probResult.probabilityValue,
      isRange: probResult.isRange,
      conflictSource: probResult.conflictSource
    };
  }

  function getSuggestionsByType(type, probVal, data) {
    var list = [];
    if (typeof BaziInterpreter !== 'undefined' && BaziInterpreter.getTypeSuggestions && data.bazi) {
      try {
        var baziList = BaziInterpreter.getTypeSuggestions(data.bazi, type);
        if (baziList && baziList.length) list = list.concat(baziList.slice(0, 2));
      } catch (e) {}
    }
    if (typeof MeihuaRules !== 'undefined' && MeihuaRules.getTypeAdvice && data.meihua) {
      try {
        var mh = MeihuaRules.getTypeAdvice(data.meihua, type);
        if (mh.advice) list.push(mh.advice);
        if (mh.timing && list.length < 3) list.push(mh.timing);
      } catch (e) {}
    }
    if (list.length >= 3) return list.slice(0, 3);
    var fallback = [];
    var tendency = probVal >= 60 ? 'favorable' : (probVal >= 40 ? 'neutral' : 'unfavorable');
    var typeKey = type === 'wealth' ? 'finance' : (type === 'love' ? 'love' : type);
    if (typeof VocabularyDB !== 'undefined' && VocabularyDB.SUGGESTION_PHRASES) {
      var vocab = VocabularyDB.SUGGESTION_PHRASES[typeKey] || VocabularyDB.SUGGESTION_PHRASES[type] || VocabularyDB.SUGGESTION_PHRASES.general;
      if (vocab) {
        var arr = vocab[tendency] || vocab.neutral || vocab.favorable;
        if (arr && arr.length) fallback = arr.slice(0, 3);
      }
    }
    if (fallback.length < 3) {
      var def = type === 'love' ? (probVal >= 60 ? ['主動表達心意，但避免過度急切', '創造共同話題與回憶', '觀察對方反應'] : ['先釐清自己的真實需求', '避免情緒低落時做重大決定', '給彼此空間'])
        : type === 'career' ? (probVal >= 60 ? ['把握近期表現機會', '加強專業技能與人脈', '主動爭取可見度'] : ['沉潛進修，等待時機', '檢視現職發展空間', '避免衝動離職'])
        : type === 'wealth' ? (probVal >= 60 ? ['開源與節流並行', '分散投資降低風險', '建立緊急預備金'] : ['保守理財，避免高槓桿', '檢視固定支出', '延後大額消費決策'])
        : type === 'health' ? ['規律作息與飲食', '依醫囑追蹤治療', '適度運動與放鬆']
        : type === 'relationship' ? ['真誠溝通，避免猜測', '尊重界限，不強求', '選擇合適時機表達']
        : type === 'family' ? ['傾聽家人需求', '避免在氣頭上做決定', '尋求第三方客觀意見']
        : ['依具體問題拆解步驟', '設定短期可達成目標', '定期檢視進度與調整'];
      while (fallback.length < 3 && def.length) fallback.push(def[fallback.length]);
    }
    for (var i = 0; list.length < 3 && i < fallback.length; i++) {
      if (fallback[i] && list.indexOf(fallback[i]) < 0) list.push(fallback[i]);
    }
    return list.slice(0, 3);
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { computeProbability, generateDirectAnswer, getQuestionType };
  } else {
    global.FusionEngine = {
      computeProbability: computeProbability,
      generateDirectAnswer: generateDirectAnswer,
      getQuestionType: getQuestionType
    };
  }
})(typeof window !== 'undefined' ? window : this);
