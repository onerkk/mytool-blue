(function(){
  'use strict';

  function _safe(v,d){ return v==null ? (d||'') : v; }
  function _arr(v){ return Array.isArray(v)?v:[]; }
  function _top(arr,n){ return _arr(arr).slice(0,n||3); }
  function _uniq(arr){ return Array.from(new Set(_arr(arr).filter(Boolean))); }
  function _dirFromScore(score){ return score>=60?'positive':score<=40?'negative':'neutral'; }
  function _cap(v,min,max){ return Math.max(min, Math.min(max, v)); }
  function _shortText(s,max){ s=String(s||''); return s.length>max?s.slice(0,max)+'…':s; }
  function _weightOf(tag){ return Number(tag&&tag.weight||tag&&tag.w||1)||1; }
  function _timingByType(type){ return ({love:'mid',career:'mid',wealth:'mid',health:'mid',relationship:'mid',family:'mid',general:'mixed'})[type||'general']||'mixed'; }
  function _mkEvidence(system, category, label, dir, weight, detail, source){
    return { system:system, category:category, label:label, direction:dir||'neutral', weight:weight||1, detail:detail||label, source:source||category };
  }
  function _scoreFromEvidence(base, evidence){
    var s = base||50;
    _arr(evidence).forEach(function(e){
      var w = _weightOf(e);
      if(e.direction==='positive') s += w*2.4;
      else if(e.direction==='negative') s -= w*2.4;
      else s += w*0.15;
    });
    return Math.round(_cap(s, 8, 92));
  }
  function _confidenceFromEvidence(evidence, extra){
    var n = _arr(evidence).length;
    var score = 26 + n * 7 + (extra||0);
    return Math.round(_cap(score, 18, 90));
  }
  function _reasonsFromEvidence(evidence, dir){
    var pos = _arr(evidence).filter(function(e){ return e.direction==='positive'; }).sort(function(a,b){ return _weightOf(b)-_weightOf(a); });
    var neg = _arr(evidence).filter(function(e){ return e.direction==='negative'; }).sort(function(a,b){ return _weightOf(b)-_weightOf(a); });
    var neu = _arr(evidence).filter(function(e){ return e.direction==='neutral'; }).sort(function(a,b){ return _weightOf(b)-_weightOf(a); });
    var why1 = (dir==='negative' ? (neg[0]&&neg[0].detail) : (pos[0]&&pos[0].detail)) || ((neu[0]&&neu[0].detail) || '資料訊號偏中性');
    var why2 = (dir==='negative' ? (pos[0]&&('雖有助力，但同時存在 '+pos[0].label)) : (neg[0]&&('但同時也有 '+neg[0].label+' 的牽制'))) || ((neu[1]&&neu[1].detail) || '需要和其他系統交叉看');
    var why3 = ((dir==='negative'?neg[1]:pos[1])&&((dir==='negative'?neg[1]:pos[1]).detail)) || ((neu[0]&&('補充訊號：'+neu[0].label)) || '目前不是單一訊號能定案的題型');
    var risk = (neg[0]&&neg[0].detail) || '';
    var opp = (pos[0]&&pos[0].detail) || '';
    return {why1:why1, why2:why2, why3:why3, risk:risk, opportunity:opp};
  }
  function _finalAnswer(prefix, why1, why2, why3, risk, action1, action2){
    var out = '【'+prefix+'】';
    if(why1) out += '\n原因一：'+why1;
    if(why2) out += '\n原因二：'+why2;
    if(why3) out += '\n原因三：'+why3;
    if(risk) out += '\n風險：'+risk;
    if(action1) out += '\n建議：'+action1;
    if(action2) out += '\n補充：'+action2;
    return out;
  }

  function _currentYear(){ return new Date().getFullYear(); }



  function _normEvidence(arr){
    return _arr(arr).slice(0,12).map(function(e){
      if(typeof e === 'string') return { category:'judgement', label:_shortText(e, 30), direction:'neutral', weight:1, detail:e, source:'legacy' };
      return {
        category:e.category||e.layer||'judgement',
        label:e.label||e.text||'訊號',
        direction:e.direction||e.dir||'neutral',
        weight:e.weight||1,
        detail:e.detail||e.text||e.label||'',
        source:e.source||e.layer||'legacy'
      };
    });
  }
  function _splitSupportRisk(evidence){
    evidence = _normEvidence(evidence);
    var pos = evidence.filter(function(e){ return e.direction==='positive' || e.direction==='pos'; }).sort(function(a,b){ return _weightOf(b)-_weightOf(a); });
    var neg = evidence.filter(function(e){ return e.direction==='negative' || e.direction==='neg'; }).sort(function(a,b){ return _weightOf(b)-_weightOf(a); });
    var neu = evidence.filter(function(e){ return !/^(positive|pos|negative|neg)$/.test(e.direction); }).sort(function(a,b){ return _weightOf(b)-_weightOf(a); });
    return { supports:pos.slice(0,5), risks:neg.slice(0,5), neutral:neu.slice(0,3), evidence:evidence };
  }
  function _summaryFromResult(system, res){
    var parts = [];
    if(res.yesNoAnswer) parts.push(res.yesNoAnswer);
    if(res.why1) parts.push(res.why1);
    if(res.why2) parts.push(res.why2);
    return _shortText(parts.join(' '), 220);
  }
  function _featurePack(system, res, extra){
    var base = {
      score: res.score||50,
      confidence: res.confidence||40,
      direction: res.direction||'neutral',
      verdict: res.yesNoAnswer||'',
      summary: _summaryFromResult(system, res),
      timingText: res.timingText||'',
      action1: res.action1||'',
      action2: res.action2||''
    };
    if(extra) for (var k in extra) base[k]=extra[k];
    return base;
  }
  function _questionFocus(type){
    var map = {
      love:['關係','互動','桃花','情感'],
      relationship:['關係','互動','合作','伴侶'],
      career:['事業','職涯','工作','位置'],
      wealth:['財務','現金流','資源','收入'],
      health:['身心','壓力','恢復','耗損'],
      family:['家庭','內在','責任','安定'],
      general:['整體','主線','綜合','趨勢']
    };
    return map[type||'general'] || map.general;
  }
  function _timingPayload(mode, text, good, risk){
    return { mode:mode||'mixed', text:text||'', goodWindows:_arr(good), riskWindows:_arr(risk) };
  }

  function _normalizeCaseTag(tag){
    return String(tag||'').replace(/\s+/g,' ').trim();
  }
  function _uniqCaseTags(arr, limit){
    var seen = Object.create(null);
    var out = [];
    _arr(arr).forEach(function(item){
      var tag = _normalizeCaseTag(item && item.tag || item && item.label || item);
      if(!tag || seen[tag]) return;
      seen[tag] = 1;
      out.push(typeof item === 'string' ? { tag: tag, weight: 1 } : Object.assign({}, item, { tag: tag }));
    });
    return typeof limit === 'number' ? out.slice(0, limit) : out;
  }
  function _pushCaseTag(bucket, tag, weight, reason, system){
    tag = _normalizeCaseTag(tag);
    if(!tag) return;
    bucket.push({ tag: tag, weight: Number(weight)||1, reason: reason||tag, system: system||'' });
  }
  function _scanCaseKeywords(text, system, bucketMap){
    text = String(text||'');
    if(!text) return;
    var rules = {
      essence:[
        [/職場|主管|同事|上司|制度|權責/,'職場權力局',2.6],
        [/曖昧|桃花|感情|喜歡|交往|對象|戀愛/,'情感拉扯局',2.4],
        [/合作|客戶|合夥|資源交換|互利/,'條件交換局',2.2],
        [/觀望|試探|保留|進退|模糊/,'試探觀望局',2.2],
        [/壓力|責任|負擔|現實|承擔/,'現實壓力局',2.2],
        [/重啟|回頭|復合|再來一次/,'回頭重啟局',2.1]
      ],
      motive:[
        [/真心|長期|認真|穩定|經營/,'想穩定發展',2.8],
        [/試探|觀望|不敢|拿捏|保留/,'先觀望試探',2.7],
        [/寂寞|空虛|情緒出口|陪伴/,'情緒補位需求',2.5],
        [/方便|順手|有人陪|現實需要|依賴/,'現實便利需求',2.4],
        [/控制|主導|拿捏|權力|位置/,'權力位置考量',2.6],
        [/逃避|轉移|避開|暫時/,'過渡逃避傾向',2.3]
      ],
      obstacle:[
        [/壓力|負擔|沉重|責任|扛不住/,'承擔壓力',2.8],
        [/距離|時間差|節奏|進度|時機/,'節奏時機不合',2.6],
        [/第三者|他人眼光|規範|制度|現實/,'外部限制',2.6],
        [/不穩|搖擺|反覆|矛盾|卡住/,'態度反覆',2.5],
        [/不清楚|模糊|曖昧|未表態/,'關係界線不清',2.5],
        [/資源|金錢|成本|現金流/,'資源成本壓力',2.4]
      ],
      opportunity:[
        [/明確|推進|主動|靠近|開展/,'有推進窗口',2.5],
        [/下半年|之後|漸漸|慢慢|後續/,'後段轉強',2.3],
        [/穩定|成熟|務實|可談/,'可往穩定發展',2.6],
        [/合作|互補|支援|照顧/,'彼此可互補',2.2],
        [/突破|轉機|鬆動|打開/,'關係有突破點',2.5]
      ],
      path:[
        [/先難後易|先卡後順|前阻後開/,'先卡後開',2.8],
        [/慢慢|漸進|循序|一步一步/,'慢熱漸進',2.5],
        [/很快|突然|快速|短期/,'短期快速變化',2.2],
        [/反覆|拉扯|一下近一下遠/,'反覆拉扯',2.7],
        [/穩住|定下來|落地|成局/,'可落地成形',2.5]
      ],
      validation:[
        [/主動|聯絡|靠近|明講/,'看對方是否主動表態',2.4],
        [/安排|時間|見面|行動/,'看是否有實際安排',2.4],
        [/穩定|持續|反覆|消失/,'看互動是否穩定持續',2.3],
        [/公開|承認|負責|承擔/,'看是否願意承擔與公開',2.4],
        [/阻力|壓力|他人|制度/,'看外部阻力是否鬆動',2.2]
      ]
    };
    Object.keys(rules).forEach(function(kind){
      rules[kind].forEach(function(rule){
        if(rule[0].test(text)) _pushCaseTag(bucketMap[kind], rule[1], rule[2], text.slice(0, 90), system);
      });
    });
  }
  function _aggregateCaseTags(list, limit){
    var map = Object.create(null);
    _arr(list).forEach(function(item){
      var tag = _normalizeCaseTag(item && item.tag);
      if(!tag) return;
      if(!map[tag]) map[tag] = { tag: tag, weight: 0, systems: [], reasons: [] };
      map[tag].weight += Number(item.weight)||1;
      if(item.system && map[tag].systems.indexOf(item.system)===-1) map[tag].systems.push(item.system);
      if(item.reason && map[tag].reasons.length < 4) map[tag].reasons.push(item.reason);
    });
    return Object.keys(map).map(function(tag){ return map[tag]; }).sort(function(a,b){
      var ds = (b.systems.length - a.systems.length);
      if(ds) return ds;
      return (b.weight - a.weight);
    }).slice(0, limit || 6);
  }
  function _buildCaseVector(system, payload, type, question){
    var supports = _arr(payload && payload.supports);
    var risks = _arr(payload && payload.risks);
    var neutral = _arr(payload && payload.neutralSignals);
    var evidence = _arr(payload && payload.evidence);
    var timingText = _safe(payload && payload.timingText, '');
    var summary = _safe(payload && payload.summary, '');
    var verdict = _safe(payload && payload.verdict, '');
    var fullText = [question, summary, verdict, timingText].concat(supports.map(function(x){return (x.detail||x.label||'');})).concat(risks.map(function(x){return (x.detail||x.label||'');})).concat(neutral.map(function(x){return (x.detail||x.label||'');})).join(' | ');
    var bucketMap = { essence:[], motive:[], obstacle:[], opportunity:[], path:[], validation:[] };
    _scanCaseKeywords(fullText, system, bucketMap);
    evidence.slice(0, 12).forEach(function(e){
      var txt = [e.label, e.detail, e.category, e.source].filter(Boolean).join(' | ');
      _scanCaseKeywords(txt, system, bucketMap);
      if(e.direction==='negative'){
        _pushCaseTag(bucketMap.obstacle, e.label || '風險訊號', (e.weight||1)+0.6, txt, system);
      } else if(e.direction==='positive'){
        _pushCaseTag(bucketMap.opportunity, e.label || '助力訊號', (e.weight||1)+0.5, txt, system);
      } else {
        _pushCaseTag(bucketMap.path, e.label || '中性訊號', Math.max(1, e.weight||1), txt, system);
      }
    });
    var questionText = String(question||'');
    if(/他|她|對方|主管|同事|家人|前任|合作|客戶|另一半/.test(questionText)){
      _pushCaseTag(bucketMap.motive, '涉及他方心態', 2.6, '題目直接涉及他人', system);
    }
    if(/何時|多久|幾月|什麼時候|今年|明年|下半年|上半年/.test(questionText)){
      _pushCaseTag(bucketMap.path, '需要時間節奏判讀', 2.4, '題目直接問時間', system);
      _pushCaseTag(bucketMap.validation, '時間點是否如期推進', 2.0, '題目直接問時間', system);
    }
    if(type==='love' || /感情|桃花|曖昧|同居|交往|婚姻|復合/.test(questionText)){
      _pushCaseTag(bucketMap.essence, '關係型態判定', 2.5, '感情題核心', system);
      _pushCaseTag(bucketMap.validation, '看靠近是否伴隨承擔', 2.3, '感情題關鍵驗證', system);
    }
    return {
      essenceTags: _aggregateCaseTags(bucketMap.essence, 5),
      motiveTags: _aggregateCaseTags(bucketMap.motive, 5),
      obstacleTags: _aggregateCaseTags(bucketMap.obstacle, 6),
      opportunityTags: _aggregateCaseTags(bucketMap.opportunity, 6),
      pathTags: _aggregateCaseTags(bucketMap.path, 5),
      validationHints: _aggregateCaseTags(bucketMap.validation, 5),
      ambiguityScore: _cap(Math.round((_arr(neutral).length * 8) + (_arr(risks).length && _arr(supports).length ? 10 : 0) + (/可能|保留|觀察|條件/.test(summary+verdict) ? 10 : 0)), 0, 100),
      directnessScore: _cap(Math.round((_arr(supports).length + _arr(risks).length) * 8 + (payload && payload.confidence || 0) * 0.35), 0, 100),
      evidenceDepth: _arr(evidence).length + _arr(supports).length + _arr(risks).length,
      digest: _uniqCaseTags([].concat(
        _aggregateCaseTags(bucketMap.essence, 3),
        _aggregateCaseTags(bucketMap.motive, 3),
        _aggregateCaseTags(bucketMap.obstacle, 3),
        _aggregateCaseTags(bucketMap.path, 3)
      ), 8)
    };
  }
  function _buildCrossCaseMatrix(activePayloads){
    var essence = [], motive = [], obstacle = [], opportunity = [], path = [], validation = [];
    var ambiguity = 0, directness = 0, depth = 0, systems = 0;
    _arr(activePayloads).forEach(function(item){
      var cv = item && item.caseVector;
      if(!cv) return;
      systems += 1;
      ambiguity += Number(cv.ambiguityScore)||0;
      directness += Number(cv.directnessScore)||0;
      depth += Number(cv.evidenceDepth)||0;
      essence = essence.concat(_arr(cv.essenceTags));
      motive = motive.concat(_arr(cv.motiveTags));
      obstacle = obstacle.concat(_arr(cv.obstacleTags));
      opportunity = opportunity.concat(_arr(cv.opportunityTags));
      path = path.concat(_arr(cv.pathTags));
      validation = validation.concat(_arr(cv.validationHints));
    });
    var topEssence = _aggregateCaseTags(essence, 6);
    var topMotives = _aggregateCaseTags(motive, 6);
    var topObstacles = _aggregateCaseTags(obstacle, 8);
    var topOpportunities = _aggregateCaseTags(opportunity, 8);
    var topPaths = _aggregateCaseTags(path, 6);
    var topValidation = _aggregateCaseTags(validation, 6);
    var contradictions = [];
    topOpportunities.slice(0,4).forEach(function(pos){
      topObstacles.slice(0,6).forEach(function(neg){
        if(pos.systems.some(function(s){ return neg.systems.indexOf(s) === -1; })) return;
        if(/有推進窗口|可往穩定發展|關係有突破點/.test(pos.tag) && /承擔壓力|關係界線不清|態度反覆/.test(neg.tag)){
          contradictions.push({ positive: pos.tag, negative: neg.tag, systems: pos.systems.filter(function(s){ return neg.systems.indexOf(s) !== -1; }) });
        }
      });
    });
    return {
      topEssence: topEssence,
      topMotives: topMotives,
      topObstacles: topObstacles,
      topOpportunities: topOpportunities,
      topPaths: topPaths,
      topValidation: topValidation,
      contradictions: contradictions.slice(0, 6),
      avgAmbiguity: systems ? Math.round(ambiguity / systems) : 0,
      avgDirectness: systems ? Math.round(directness / systems) : 0,
      evidenceDepthScore: depth,
      systemsWithCaseVector: systems
    };
  }

  window.analyzeBaziQuestion = function(bazi, type, question){
    if(!bazi){
      return { yesNoAnswer:'八字資料不足，無法判斷。', direction:'neutral', score:50, confidence:20,
        why1:'缺少八字資料', why2:'', why3:'', riskPoint:'', action1:'', action2:'', strategies:[], timingText:'', evidence:[], apiPayload:null, finalAnswer:'八字資料不足' };
    }
    type = type || 'general';
    var evidence = [];
    var tags = (typeof analyzeBaziTags==='function') ? analyzeBaziTags(bazi, type) : [];
    _top(tags, 12).forEach(function(t){
      evidence.push(_mkEvidence('bazi','tag',t.label||t.key||'命理訊號', t.direction||t.dir||'neutral', _weightOf(t), t.detail||t.label||'', t.source||'tag'));
    });

    if(typeof bazi.strong==='boolean'){
      evidence.push(_mkEvidence('bazi','strength', bazi.strong?'日主偏強':'日主偏弱', 'neutral', 2,
        bazi.strong ? '日主偏強，做法重點在導流與洩化，不宜再把壓力硬往自己身上堆。' : '日主偏弱，做法重點在借力、結盟、循序增援，硬碰硬的成本會更高。', 'self_ratio'));
    }
    if(_arr(bazi.fav).length){
      evidence.push(_mkEvidence('bazi','yongshen','喜用神：'+bazi.fav.join('、'),'positive',4,
        '命局目前真正能借力的是「'+bazi.fav.join('、')+'」這組能量，做法要往這邊靠。','fav'));
    }
    if(_arr(bazi.unfav).length){
      evidence.push(_mkEvidence('bazi','jishen','忌神：'+bazi.unfav.join('、'),'negative',4,
        '命局真正容易拖累結果的是「'+bazi.unfav.join('、')+'」這組能量，問題常不是不能做，而是踩到這個方向就會失速。','unfav'));
    }
    if(bazi.zhengGe && bazi.zhengGe.geName){
      evidence.push(_mkEvidence('bazi','structure','格局：'+bazi.zhengGe.geName,'neutral',3, bazi.zhengGe.zh||('格局為'+bazi.zhengGe.geName), 'zhengGe'));
    } else if(bazi.structType){
      evidence.push(_mkEvidence('bazi','structure','結構：'+bazi.structType,'neutral',2, '八字主結構偏向「'+bazi.structType+'」', 'structType'));
    }
    if(_arr(bazi.branchInteractions).length){
      _top(bazi.branchInteractions,4).forEach(function(x){
        evidence.push(_mkEvidence('bazi','interaction', x.label||x.type||'四柱互動', x.score>0?'positive':x.score<0?'negative':'neutral', Math.max(1,Math.min(4,Math.abs(x.score||1))), x.desc||x.label||x.type||'四柱互動', 'branchInteractions'));
      });
    }
    if(_arr(bazi.hiddenInteractions).length){
      _top(bazi.hiddenInteractions,4).forEach(function(x){
        evidence.push(_mkEvidence('bazi','hidden', x.type||'暗互動', /合|拱/.test(x.type||'')?'positive':/沖|刑|害/.test(x.type||'')?'negative':'neutral', 2, x.zh||x.type, 'hiddenInteractions'));
      });
    }
    if(_arr(bazi.shensha).length){
      var goodSS = bazi.shensha.filter(function(s){ return /貴人|文昌|天喜|紅鸞|祿|德/.test(String(s)); }).slice(0,3);
      var badSS = bazi.shensha.filter(function(s){ return /劫|煞|亡|刃|孤|寡|沖/.test(String(s)); }).slice(0,3);
      if(goodSS.length) evidence.push(_mkEvidence('bazi','shensha','吉神：'+goodSS.join('、'),'positive',2,'命盤附帶的助力訊號是 '+goodSS.join('、')+'。','shensha'));
      if(badSS.length) evidence.push(_mkEvidence('bazi','shensha','煞忌：'+badSS.join('、'),'negative',2,'命盤附帶的風險訊號是 '+badSS.join('、')+'。','shensha'));
    }
    var dy = _arr(bazi.dayun).find(function(d){ return d && d.isCurrent; }) || null;
    if(dy){
      var dyDir = /旺|吉|升|順/.test(String(dy.level||'')) ? 'positive' : /凶|弱|壓|低迷/.test(String(dy.level||'')) ? 'negative' : 'neutral';
      evidence.push(_mkEvidence('bazi','dayun','目前大運：'+(dy.gz||''),''+dyDir,4,'你目前走在「'+(dy.gz||'')+'」大運，這十年的背景是「'+(dy.level||'中性')+'」。','dayun'));
      var ln = _arr(dy.liuNian).find(function(l){ return l && Number(l.year)===_currentYear(); }) || null;
      if(ln){
        var lnDir = /旺|吉|升|順/.test(String(ln.level||ln.label||'')) ? 'positive' : /凶|弱|壓|低迷|沖/.test(String(ln.level||ln.label||'')) ? 'negative' : 'neutral';
        evidence.push(_mkEvidence('bazi','liunian','今年流年：'+(ln.gz||ln.year||''),lnDir,3,'今年流年落在「'+(ln.gz||ln.year||'')+'」，體感是「'+(ln.level||ln.label||'中性')+'」。','liunian'));
      }
    }
    if(_arr(bazi.liuYue).length){
      var months = bazi.liuYue.slice(0,12);
      var good = months.filter(function(m){ return /大吉|吉/.test(String(m.label||'')); }).slice(0,2);
      var bad = months.filter(function(m){ return /凶|大凶/.test(String(m.label||'')); }).slice(0,2);
      if(good.length) evidence.push(_mkEvidence('bazi','timing','較順月份：'+good.map(function(m){return m.monthName||m.gz;}).join('、'),'positive',2,'相對能推進的月份在 '+good.map(function(m){return m.monthName||m.gz;}).join('、')+'。','liuyue'));
      if(bad.length) evidence.push(_mkEvidence('bazi','timing','較卡月份：'+bad.map(function(m){return m.monthName||m.gz;}).join('、'),'negative',2,'相對容易卡住的月份在 '+bad.map(function(m){return m.monthName||m.gz;}).join('、')+'。','liuyue'));
    }

    var score = _scoreFromEvidence(50, evidence);
    var direction = _dirFromScore(score);
    var rs = _reasonsFromEvidence(evidence, direction);
    var yesNoAnswer = ({positive:'八字結構偏支持這題', negative:'八字結構對這題有壓力', neutral:'八字結構對這題屬中性混合'})[direction];
    var action1 = direction==='positive' ? '順著喜用神方向做，勝率會比硬衝高。' : direction==='negative' ? '先避開忌神型做法，再談推進。' : '先縮小戰線，用最穩的一步試水溫。';
    var action2 = dy ? ('這題不能脫離你目前「'+(dy.gz||'')+'」大運的背景來看。') : '這題需要再和其他系統比對時機。';
    var timingText = '八字偏長中期：先看大運背景，再看流年，最後微調到流月。';
    var confidence = _confidenceFromEvidence(evidence, _arr(tags).length>6?8:0);
    var _splitBZ = _splitSupportRisk(evidence);
    var apiPayload = {
      system:'bazi',
      question: question||'',
      type:type,
      direction:direction,
      score:score,
      confidence:confidence,
      summary:_summaryFromResult('bazi', { yesNoAnswer:yesNoAnswer, why1:rs.why1, why2:rs.why2 }),
      supports:_splitBZ.supports,
      risks:_splitBZ.risks,
      neutralSignals:_splitBZ.neutral,
      dayMaster:_safe(bazi.dm),
      dayMasterElement:_safe(bazi.dmEl),
      strong:!!bazi.strong,
      fav:_arr(bazi.fav),
      unfav:_arr(bazi.unfav),
      structure:_safe((bazi.zhengGe&&bazi.zhengGe.geName) || bazi.structType),
      currentDayun: dy ? { gz:dy.gz||'', level:dy.level||'', ageStart:dy.ageStart||'', ageEnd:dy.ageEnd||'' } : null,
      evidence: _splitBZ.evidence,
      rawFeatures:{ deLing:bazi.deLing, deDi:bazi.deDi, deShi:bazi.deShi, kongwang:_arr(bazi.kongwang), shensha:_arr(bazi.shensha).slice(0,8) },
      timing:_timingPayload('long_mid', timingText, _arr(bazi.liuYue).filter(function(m){ return /大吉|吉/.test(String(m.label||'')); }).slice(0,3).map(function(m){ return m.monthName||m.gz; }), _arr(bazi.liuYue).filter(function(m){ return /凶|大凶/.test(String(m.label||'')); }).slice(0,3).map(function(m){ return m.monthName||m.gz; })),
      timings: {
        mode:'long_mid',
        text: timingText,
        goodMonths: _arr(bazi.liuYue).filter(function(m){ return /大吉|吉/.test(String(m.label||'')); }).slice(0,3).map(function(m){ return m.monthName||m.gz; }),
        riskMonths: _arr(bazi.liuYue).filter(function(m){ return /凶|大凶/.test(String(m.label||'')); }).slice(0,3).map(function(m){ return m.monthName||m.gz; })
      }
    };
    return {
      yesNoAnswer: yesNoAnswer,
      direction: direction,
      score: score,
      confidence: confidence,
      why1: rs.why1,
      why2: rs.why2,
      why3: rs.why3,
      riskPoint: rs.risk,
      action1: action1,
      action2: action2,
      strategies: [
        '八字先看命局結構，再看你目前所走的大運與流年。',
        '真正的做法不是把所有機會都抓住，而是先避開忌神型操作。',
        '當其他系統出現矛盾時，八字比較適合做長線底盤裁決。'
      ],
      timingText: timingText,
      evidence: evidence,
      apiPayload: apiPayload,
      finalAnswer: _finalAnswer(yesNoAnswer, rs.why1, rs.why2, rs.why3, rs.risk, action1, action2)
    };
  };

  var _oldAnalyzeZiweiQuestion = window.analyzeZiweiQuestion;
  if(typeof _oldAnalyzeZiweiQuestion === 'function'){
    window.analyzeZiweiQuestion = function(zw, type, userQuestion){
      var res = _oldAnalyzeZiweiQuestion(zw, type, userQuestion) || {};
      try{
        var focus = res.palace || '';
        var ev = [];
        _arr(res.mainStars).slice(0,4).forEach(function(s){ ev.push(_mkEvidence('ziwei','major','主星：'+s, 'neutral', 3, '主題宮位主星包含 '+s, 'mainStars')); });
        _arr(res.goodStars).slice(0,4).forEach(function(s){ ev.push(_mkEvidence('ziwei','good','吉曜：'+s, 'positive', 2, '紫微可用助力是 '+s, 'goodStars')); });
        _arr(res.riskStars).slice(0,4).forEach(function(s){ ev.push(_mkEvidence('ziwei','risk','煞忌：'+s, 'negative', 2, '紫微主要阻力是 '+s, 'riskStars')); });
        if(res.why1) ev.push(_mkEvidence('ziwei','judgement','主題宮：'+focus, 'neutral', 3, res.why1, 'why1'));
        if(res.why2) ev.push(_mkEvidence('ziwei','judgement','助力判讀', 'positive', 2, res.why2, 'why2'));
        if(res.why3) ev.push(_mkEvidence('ziwei','judgement','阻力判讀', /卡|阻|壓|忌/.test(res.why3)?'negative':'neutral', 2, res.why3, 'why3'));
        res.evidence = ev;
        var _splitZW = _splitSupportRisk(ev);
        res.apiPayload = {
          system:'ziwei', type:type||'general', question:userQuestion||'', score:res.score||50, confidence:res.confidence||50,
          direction:res.direction||'neutral', summary:_summaryFromResult('ziwei', res), palace:focus, mainStars:_arr(res.mainStars), goodStars:_arr(res.goodStars), riskStars:_arr(res.riskStars),
          supports:_splitZW.supports, risks:_splitZW.risks, neutralSignals:_splitZW.neutral,
          evidence: _splitZW.evidence,
          rawFeatures:{ palaceScore:res.palaceScore||null, palace:focus, mainStars:_arr(res.mainStars), goodStars:_arr(res.goodStars), riskStars:_arr(res.riskStars) },
          timing:_timingPayload('long_mid', res.timingText||'', [], []),
          timingLegacy:{ mode:'long_mid', text:res.timingText||'' }
        };
      }catch(e){}
      return res;
    };
  }



  var _oldAnalyzeNatalQuestion = window.analyzeNatalQuestion;
  if(typeof _oldAnalyzeNatalQuestion === 'function'){
    window.analyzeNatalQuestion = function(natal, type, userQuestion){
      var res = _oldAnalyzeNatalQuestion(natal, type, userQuestion) || {};
      try{
        var ev = [];
        _arr(res.houseSupport).slice(0,6).forEach(function(h){
          var dir = h.dir==='pos'?'positive':h.dir==='neg'?'negative':'neutral';
          var label = '議題宮位：第'+(h.house||'?')+'宮';
          var detail = h.planet ? (h.planet+'落第'+h.house+'宮，直接參與此題') : ('第'+(h.house||'?')+'宮為本題焦點');
          ev.push(_mkEvidence('natal','house',label,dir,3,detail,'houseSupport'));
        });
        _arr(res.planetSupport).slice(0,6).forEach(function(x){
          var dir = x.dir==='pos'?'positive':x.dir==='neg'?'negative':'neutral';
          ev.push(_mkEvidence('natal','planet', (x.planet||'行星')+'落第'+(x.house||'?')+'宮', dir, 3, (x.planet||'行星')+'在'+(x.sign||'')+'第'+(x.house||'?')+'宮，屬於本題的基礎推動力', 'planetSupport'));
        });
        _arr(res.rulerSupport).slice(0,6).forEach(function(x){
          var dir = x.dir==='pos'?'positive':x.dir==='neg'?'negative':'neutral';
          ev.push(_mkEvidence('natal','ruler', '宮主鏈：'+(x.ruler||x.planet||'主星'), dir, 4, x.detail||((x.ruler||x.planet||'主星')+'作為主題宮主，參與了問題的因果鏈'), 'rulerSupport'));
        });
        if(res.aspectSupport){
          var adir = res.aspectSupport.dir==='pos'?'positive':res.aspectSupport.dir==='neg'?'negative':'neutral';
          ev.push(_mkEvidence('natal','aspect','主題相位：吉'+(res.aspectSupport.good||0)+' / 凶'+(res.aspectSupport.bad||0), adir, 4, '相位是此題的互動關係層，會決定事情推進是否順手。', 'aspectSupport'));
        }
        if(res.tensionSummary){
          var tdir = res.tensionSummary.type==='harmonious'?'positive':res.tensionSummary.type==='tense'?'negative':'neutral';
          ev.push(_mkEvidence('natal','tension','整體張力：'+(res.tensionSummary.type||'balanced'), tdir, 3, '全盤和諧/緊張比為 '+(res.tensionSummary.soft||0)+' / '+(res.tensionSummary.hard||0)+'。', 'tensionSummary'));
        }
        _arr(res.angleSupport).slice(0,4).forEach(function(x){
          var dir = x.dir==='pos'?'positive':x.dir==='neg'?'negative':'neutral';
          ev.push(_mkEvidence('natal','angle', (x.point||'軸點')+'參與本題', dir, 2, (x.point||'軸點')+(x.house?('落第'+x.house+'宮'):(x.sign?('在'+x.sign):''))+'，代表此題與核心身份/目標有關。', 'angleSupport'));
        });

        if(natal && natal.dispositorChain){
          if(natal.dispositorChain.hasFinalDispositor && natal.dispositorChain.finalDispositor){
            ev.push(_mkEvidence('natal','dispositor','最終定位星：'+natal.dispositorChain.finalDispositor,'positive',4,natal.dispositorChain.meaning||('全盤能量最後收束到'+natal.dispositorChain.finalDispositor+'，這會讓判斷主軸更清楚。'),'dispositorChain'));
          }else if(natal.dispositorChain.meaning){
            ev.push(_mkEvidence('natal','dispositor','定位星鏈', 'neutral', 2, natal.dispositorChain.meaning, 'dispositorChain'));
          }
        }
        if(natal && _arr(natal.mutualReceptions).length){
          ev.push(_mkEvidence('natal','reception','互容：'+_arr(natal.mutualReceptions).slice(0,3).map(function(m){ return (m.p1||'')+'↔'+(m.p2||''); }).join('、'),'positive',3,'互容代表兩股能量彼此借力，遇到阻力時較能轉彎處理。','mutualReceptions'));
        }
        if(natal && natal.profections){
          var pd = natal.profections;
          var pdDir = ([5,9,10,11,1].indexOf(pd.profectedHouse)!==-1)?'positive':([6,8,12].indexOf(pd.profectedHouse)!==-1)?'negative':'neutral';
          ev.push(_mkEvidence('natal','profection','年主題：第'+(pd.profectedHouse||'?')+'宮／年主星'+(pd.timeLord||''),pdDir,4,pd.meaning||pd.summary||'年主題會告訴你今年到底在忙什麼。','profections'));
        }
        if(natal && natal.progressions && natal.progressions.summary){
          ev.push(_mkEvidence('natal','progression','次限推運', 'neutral', 3, natal.progressions.summary, 'progressions'));
        }
        if(natal && natal.solarArc && natal.solarArc.summary){
          ev.push(_mkEvidence('natal','solar_arc','太陽弧推運', 'neutral', 2, natal.solarArc.summary, 'solarArc'));
        }
        if(natal && natal.solarReturn){
          var sr = natal.solarReturn;
          var srDir = ([1,5,9,10,11].indexOf(sr.planetsInNatalHouses&&sr.planetsInNatalHouses['太陽'])!==-1)?'positive':'neutral';
          ev.push(_mkEvidence('natal','solar_return','太陽回歸：'+(sr.summary||sr.date||''), srDir, 3, '年度主題盤顯示今年的外在事件焦點與舞台。', 'solarReturn'));
        }
        if(typeof S!=='undefined' && S.transit){
          if(S.transit.jupiter && S.transit.jupiter.house){
            ev.push(_mkEvidence('natal','transit','木星行運第'+S.transit.jupiter.house+'宮','positive',3,'木星是放大與增援，行經關鍵宮位時通常會帶來機會與資源。','S.transit'));
          }
          if(S.transit.saturn && S.transit.saturn.house){
            ev.push(_mkEvidence('natal','transit','土星行運第'+S.transit.saturn.house+'宮','negative',3,'土星是壓力與責任，行經關鍵宮位時要用時間換成果。','S.transit'));
          }
        }

        res.evidence = _normEvidence((res.evidence||[]).concat(ev));
        var _splitNA = _splitSupportRisk(res.evidence);
        res.apiPayload = Object.assign({}, res.apiPayload||{}, {
          system:'natal', type:type||'general', question:userQuestion||'', score:res.score||50, confidence:res.confidence||40,
          direction:res.direction||'neutral', summary:_summaryFromResult('natal', res),
          supports:_splitNA.supports, risks:_splitNA.risks, neutralSignals:_splitNA.neutral, evidence:_splitNA.evidence,
          rawFeatures:{
            houseSupport:_arr(res.houseSupport).slice(0,8),
            rulerSupport:_arr(res.rulerSupport).slice(0,8),
            planetSupport:_arr(res.planetSupport).slice(0,8),
            aspectSupport:res.aspectSupport||null,
            tensionSummary:res.tensionSummary||null,
            angleSupport:_arr(res.angleSupport).slice(0,6),
            profections:natal&&natal.profections?natal.profections:null,
            solarReturn:natal&&natal.solarReturn?{date:natal.solarReturn.date, summary:natal.solarReturn.summary, solarHouse:natal.solarReturn.planetsInNatalHouses?natal.solarReturn.planetsInNatalHouses['太陽']:null}:null,
            progressions:natal&&natal.progressions?_shortText(JSON.stringify(natal.progressions),220):null,
            solarArc:natal&&natal.solarArc?_shortText(JSON.stringify(natal.solarArc),220):null,
            dispositors:natal&&natal.dispositorChain?{finalDispositor:natal.dispositorChain.finalDispositor, meaning:natal.dispositorChain.meaning}:null,
            mutualReceptions:natal&&_arr(natal.mutualReceptions).length?_arr(natal.mutualReceptions).slice(0,4):[]
          },
          timing:_timingPayload('mid_long', res.timingText||'星盤先看本命底盤，再用年主題、推運、太陽回歸與行運定位今年事件。',
            _uniq(_arr([natal&&natal.profections&&('第'+natal.profections.profectedHouse+'宮年'), natal&&natal.solarReturn&&natal.solarReturn.date]).filter(Boolean)),
            _uniq(_arr([typeof S!=='undefined'&&S.transit&&S.transit.saturn&&('土星第'+S.transit.saturn.house+'宮'), res.tensionSummary&&res.tensionSummary.type==='tense'?'全盤緊張相位偏高':null]).filter(Boolean))),
          confidenceBasis:{ evidenceCount:_splitNA.evidence.length, hasDispositor:!!(natal&&natal.dispositorChain), hasProfections:!!(natal&&natal.profections), hasSolarReturn:!!(natal&&natal.solarReturn), hasProgressions:!!(natal&&natal.progressions), hasTransit:!!(typeof S!=='undefined' && S.transit) }
        });
      }catch(e){}
      return res;
    };
  }

  var _oldAnalyzeJyotishQuestion = window.analyzeJyotishQuestion;
  if(typeof _oldAnalyzeJyotishQuestion === 'function'){
    window.analyzeJyotishQuestion = function(jy, type, userQuestion){
      var res = _oldAnalyzeJyotishQuestion(jy, type, userQuestion) || {};
      try{
        var ev = [];
        _arr(res.houseLordSupport).slice(0,6).forEach(function(x){
          var dir = x.dir==='pos'?'positive':x.dir==='neg'?'negative':'neutral';
          ev.push(_mkEvidence('jyotish','house_lord','第'+(x.house||'?')+'宮主：'+(x.lord||''),dir,4,'第'+(x.house||'?')+'宮主'+(x.lord||'')+'為'+(x.dignity||'')+'，落第'+(x.bhava||'?')+'宮。','houseLordSupport'));
        });
        _arr(res.karakaSupport).slice(0,6).forEach(function(x){
          var dir = x.dir==='pos'?'positive':x.dir==='neg'?'negative':'neutral';
          ev.push(_mkEvidence('jyotish','karaka',(x.planet||'代表星')+'力量',dir,3,(x.planet||'代表星')+'作為此題 karaka，為'+(x.dignity||'')+'，落第'+(x.bhava||'?')+'宮。','karakaSupport'));
        });
        if(res.dashaSupport && res.dashaSupport.md){
          var md = res.dashaSupport.md;
          var ddir = md.dir==='pos'?'positive':md.dir==='neg'?'negative':'neutral';
          ev.push(_mkEvidence('jyotish','dasha','主運：'+(md.lord||''),ddir,5,'目前主運由'+(md.lord||'')+'主導，區間 '+(md.start||'?')+'-'+(md.end||'?')+'，是此題最重要的時間背景。','dashaSupport'));
        }
        if(res.dashaSupport && res.dashaSupport.ad){
          var ad = res.dashaSupport.ad;
          var adir = ad.dir==='pos'?'positive':ad.dir==='neg'?'negative':'neutral';
          ev.push(_mkEvidence('jyotish','antardasha','副運：'+(ad.lord||''),adir,3,'副運由'+(ad.lord||'')+'主導，會把主運的主題具體化。','dashaSupport'));
        }
        _arr(res.transitSupport).slice(0,6).forEach(function(x){
          var dir = x.dir==='pos'?'positive':x.dir==='neg'?'negative':'neutral';
          ev.push(_mkEvidence('jyotish','transit',(x.planet||'行運')+'行經第'+(x.bhava||'?')+'宮',dir,3,(x.planet||'行運星')+'目前行經第'+(x.bhava||'?')+'宮，屬於這題的即時觸發層。','transitSupport'));
        });
        _arr(res.divisionalSupport||res.divisionSupport).slice(0,6).forEach(function(x){
          var dir = x.dir==='pos'?'positive':x.dir==='neg'?'negative':'neutral';
          ev.push(_mkEvidence('jyotish','division',(x.division||'分盤')+'：'+(x.lord||x.planet||''),dir,3,(x.division||'分盤')+'裡 '+(x.lord||x.planet||'')+' 為'+(x.dignity||'')+'，代表分盤對此題的支撐/拖累。','divisionalSupport'));
        });
        _arr(res.afflictionSummary).slice(0,5).forEach(function(x){
          var dir = x.dir==='pos'?'positive':x.dir==='neg'?'negative':'neutral';
          ev.push(_mkEvidence('jyotish','affliction',x.label||x.text||'受剋/受難',dir||'negative',3,x.text||x.label||'盤中存在受剋或課題。','afflictionSummary'));
        });

        if(jy && jy.vargottama){
          var vg = Object.keys(jy.vargottama).filter(function(k){ return jy.vargottama[k] && jy.vargottama[k].isVargottama; }).slice(0,4);
          if(vg.length) ev.push(_mkEvidence('jyotish','vargottama','Vargottama：'+vg.join('、'),'positive',4,'這些行星在 D1/D9 同宮，力量加倍，屬於盤中硬支撐。','vargottama'));
        }
        if(jy && jy.pushkara){
          var pk = Object.keys(jy.pushkara).filter(function(k){ var v=jy.pushkara[k]; return v && (v.isPushkaraNavamsa || v.isPushkaraBhaga); }).slice(0,4);
          if(pk.length) ev.push(_mkEvidence('jyotish','pushkara','Pushkara：'+pk.join('、'),'positive',3,'吉祥盤位/度數會放大順勢與貴助。','pushkara'));
        }
        if(jy && jy.mrityuBhaga){
          var mb = Object.keys(jy.mrityuBhaga).filter(function(k){ var v=jy.mrityuBhaga[k]; return v && (v.isInMrityu || v.isNearMrityu); }).slice(0,4);
          if(mb.length) ev.push(_mkEvidence('jyotish','mrityu_bhaga','Mrityu Bhaga：'+mb.join('、'),'negative',4,'相關行星接近凶度，代表其掌管事務需要更高警戒。','mrityuBhaga'));
        }
        if(jy && jy.gandanta){
          var gd = Object.keys(jy.gandanta).filter(function(k){ return jy.gandanta[k] && jy.gandanta[k].isGandanta; }).slice(0,4);
          if(gd.length) ev.push(_mkEvidence('jyotish','gandanta','Gandanta：'+gd.join('、'),'negative',4,'水火結點代表深層業力或轉化壓力，會讓事件更極端。','gandanta'));
        }
        if(jy && _arr(jy.bhavaBala).length){
          var strongH = _arr(jy.bhavaBala).slice().sort(function(a,b){ return (b.score||0)-(a.score||0); }).slice(0,3).map(function(x){ return '第'+((x.house||0)+1)+'宮'; });
          var weakH = _arr(jy.bhavaBala).slice().sort(function(a,b){ return (a.score||0)-(b.score||0); }).slice(0,2).map(function(x){ return '第'+((x.house||0)+1)+'宮'; });
          if(strongH.length) ev.push(_mkEvidence('jyotish','bhava_bala','強宮位：'+strongH.join('、'),'positive',3,'Bhava Bala 顯示這些宮位是盤中真正有力的場域。','bhavaBala'));
          if(weakH.length) ev.push(_mkEvidence('jyotish','bhava_bala','弱宮位：'+weakH.join('、'),'negative',3,'Bhava Bala 顯示這些宮位較虛，遇事容易先卡。','bhavaBala'));
        }
        if(jy && jy.yoginiDasha && jy.yoginiDasha.current){
          ev.push(_mkEvidence('jyotish','yogini','Yogini：'+(jy.yoginiDasha.current.zh||jy.yoginiDasha.current.name||''),'neutral',2,'Yogini Dasha 補充了另一條時間線，能檢查 Vimshottari 是否同步。','yoginiDasha'));
        }
        if(jy && jy.charaDasha && jy.charaDasha.current){
          ev.push(_mkEvidence('jyotish','chara','Chara Dasha：'+(jy.charaDasha.current.signZh||jy.charaDasha.current.sign||''),'neutral',2,'Jaimini 的 Chara Dasha 用來看事件舞台與角色轉換。','charaDasha'));
        }
        if(jy && jy.sadeSati && jy.sadeSati.active){
          ev.push(_mkEvidence('jyotish','sade_sati','土星七年半：'+(jy.sadeSati.phase||''),'negative',4,jy.sadeSati.zh||'土星七年半啟動時，壓力、責任、延遲都會被放大。','sadeSati'));
        }

        res.evidence = _normEvidence((res.evidence||[]).concat(ev));
        var _splitJY = _splitSupportRisk(res.evidence);
        res.apiPayload = Object.assign({}, res.apiPayload||{}, {
          system:'jyotish', type:type||'general', question:userQuestion||'', score:res.score||50, confidence:res.confidence||40,
          direction:res.direction||'neutral', summary:_summaryFromResult('jyotish', res),
          supports:_splitJY.supports, risks:_splitJY.risks, neutralSignals:_splitJY.neutral, evidence:_splitJY.evidence,
          rawFeatures:{
            houseSupport:_arr(res.houseSupport).slice(0,8),
            houseLordSupport:_arr(res.houseLordSupport).slice(0,8),
            karakaSupport:_arr(res.karakaSupport).slice(0,8),
            dashaSupport:res.dashaSupport||null,
            transitSupport:_arr(res.transitSupport).slice(0,8),
            divisionalSupport:_arr(res.divisionalSupport||res.divisionSupport).slice(0,8),
            afflictionSummary:_arr(res.afflictionSummary).slice(0,6),
            vargottama:jy&&jy.vargottama?Object.keys(jy.vargottama).filter(function(k){return jy.vargottama[k]&&jy.vargottama[k].isVargottama;}).slice(0,6):[],
            pushkara:jy&&jy.pushkara?Object.keys(jy.pushkara).filter(function(k){var v=jy.pushkara[k];return v&&(v.isPushkaraNavamsa||v.isPushkaraBhaga);}).slice(0,6):[],
            mrityuBhaga:jy&&jy.mrityuBhaga?Object.keys(jy.mrityuBhaga).filter(function(k){var v=jy.mrityuBhaga[k];return v&&(v.isInMrityu||v.isNearMrityu);}).slice(0,6):[],
            gandanta:jy&&jy.gandanta?Object.keys(jy.gandanta).filter(function(k){return jy.gandanta[k]&&jy.gandanta[k].isGandanta;}).slice(0,6):[],
            bhavaBala:jy&&_arr(jy.bhavaBala).length?_arr(jy.bhavaBala).slice(0,12):[],
            yoginiCurrent:jy&&jy.yoginiDasha&&jy.yoginiDasha.current?jy.yoginiDasha.current:null,
            charaCurrent:jy&&jy.charaDasha&&jy.charaDasha.current?jy.charaDasha.current:null,
            sadeSati:jy&&jy.sadeSati?jy.sadeSati:null
          },
          timing:_timingPayload('mid_long', res.timingText||'吠陀先看 Dasha 時間主線，再用 transit、分盤與特殊條件確認事件如何落地。',
            _uniq(_arr([
              res.dashaSupport&&res.dashaSupport.md&&('主運'+res.dashaSupport.md.lord),
              jy&&jy.yoginiDasha&&jy.yoginiDasha.current&&('Yogini '+(jy.yoginiDasha.current.zh||jy.yoginiDasha.current.name||'')),
              jy&&jy.charaDasha&&jy.charaDasha.current&&('Chara '+(jy.charaDasha.current.signZh||jy.charaDasha.current.sign||''))
            ]).filter(Boolean)),
            _uniq(_arr([
              jy&&jy.sadeSati&&jy.sadeSati.active&&('土星七年半 '+(jy.sadeSati.phase||'')),
              jy&&jy.mrityuBhaga&&Object.keys(jy.mrityuBhaga).some(function(k){var v=jy.mrityuBhaga[k]; return v && v.isInMrityu;})?'Mrityu Bhaga 啟動':null,
              jy&&jy.gandanta&&Object.keys(jy.gandanta).length?'Gandanta 業力結點':null
            ]).filter(Boolean))),
          confidenceBasis:{ evidenceCount:_splitJY.evidence.length, hasDasha:!!(res.dashaSupport&&res.dashaSupport.md), hasDivisional:_arr(res.divisionalSupport||res.divisionSupport).length>0, hasBhavaBala:!!(jy&&_arr(jy.bhavaBala).length), hasSpecialConditions:!!(jy&&(jy.vargottama||jy.pushkara||jy.mrityuBhaga||jy.gandanta)), hasAlternateDasha:!!(jy&&(jy.yoginiDasha||jy.charaDasha)) }
        });
      }catch(e){}
      return res;
    };
  }


  var _oldAnalyzeNameQuestion = window.analyzeNameQuestion;
  window.analyzeNameQuestion = function(nameResult, zodiacNameResult, context){
    context = context || {};
    var type = context.type || 'general';
    if(!nameResult && !zodiacNameResult){
      return { score:50, direction:'neutral', confidence:20, yesNoAnswer:'姓名資料不足', why1:'未輸入姓名或姓名資料不足', why2:'', why3:'', riskPoint:'', action1:'', action2:'', strategies:[], evidence:[], apiPayload:null, timingText:'姓名學偏長線底色' };
    }
    var evidence = [];
    if(nameResult){
      if(nameResult.tianGe||nameResult.renGe||nameResult.diGe||nameResult.zongGe){
        evidence.push(_mkEvidence('name','grid','三才五格成形','neutral',2,'姓名已形成完整的三才五格骨架，可視為長線人格與互動底色。','wuge'));
      }
      if(nameResult.sancai && nameResult.sancai.ji){
        var d = /吉/.test(nameResult.sancai.ji) ? 'positive' : /凶/.test(nameResult.sancai.ji) ? 'negative' : 'neutral';
        evidence.push(_mkEvidence('name','sancai','三才：'+nameResult.sancai.ji,d,3, nameResult.sancai.zh||('三才配置為 '+nameResult.sancai.ji), 'sancai'));
      }
      if(nameResult.zongGeShuli){
        var sh = nameResult.zongGeShuli;
        var dd = /大吉|吉/.test(String(sh.ji||'')) ? 'positive' : /凶/.test(String(sh.ji||'')) ? 'negative' : 'neutral';
        evidence.push(_mkEvidence('name','shuli','總格數理：'+(sh.num||''),dd,3, sh.zh||('總格數理 '+(sh.num||'')), 'shuli'));
      }
      if(_arr(nameResult.phonetic).length){
        evidence.push(_mkEvidence('name','phonetic','音韻五行','neutral',2,'姓名音韻五行已納入，能補充名字的外放感與被感知方式。','phonetic'));
      }
    }
    if(zodiacNameResult){
      var zd = /吉|合/.test(String(zodiacNameResult.summary||zodiacNameResult.verdict||'')) ? 'positive' : /沖|忌|凶/.test(String(zodiacNameResult.summary||zodiacNameResult.verdict||'')) ? 'negative' : 'neutral';
      evidence.push(_mkEvidence('name','zodiac','生肖姓名配合',zd,2, zodiacNameResult.summary || zodiacNameResult.verdict || '生肖與姓名搭配訊號已納入。', 'zodiac'));
    }
    if(context.bazi && _arr(context.bazi.fav).length && nameResult){
      var fav = context.bazi.fav;
      var hit = false;
      var hitText = '';
      ['phoneticSummary','wuxingSummary','summary','zh'].forEach(function(k){
        var txt = String(nameResult[k]||'');
        if(!hit && fav.some(function(f){ return txt.indexOf(f)!==-1; })){ hit = true; hitText = txt; }
      });
      evidence.push(_mkEvidence('name','bazi_link', hit?'姓名和八字喜用有連動':'姓名和八字喜用未見強連動', hit?'positive':'neutral', 3, hit ? ('名字的五行傾向與八字喜用神有呼應：'+_shortText(hitText, 80)) : '姓名本身可作為輔助訊號，但目前與八字喜用沒有非常強的同步。', 'bazi_link'));
    }
    var baseRes = typeof _oldAnalyzeNameQuestion === 'function' ? _oldAnalyzeNameQuestion(nameResult, zodiacNameResult, context) : null;
    var score = baseRes && baseRes.score ? baseRes.score : _scoreFromEvidence(50, evidence);
    var direction = (baseRes && baseRes.direction) || _dirFromScore(score);
    var conf = Math.max(baseRes&&baseRes.confidence||0, _confidenceFromEvidence(evidence, 0));
    var rs = _reasonsFromEvidence(evidence, direction);
    var yesNoAnswer = direction==='positive' ? '姓名結構對這題有加分' : direction==='negative' ? '姓名結構對這題有牽制' : '姓名結構屬輔助中性';
    var out = Object.assign({}, baseRes||{}, {
      score: score,
      direction: direction,
      confidence: conf,
      yesNoAnswer: baseRes&&baseRes.yesNoAnswer || yesNoAnswer,
      why1: baseRes&&baseRes.why1 || rs.why1,
      why2: baseRes&&baseRes.why2 || rs.why2,
      why3: baseRes&&baseRes.why3 || rs.why3,
      riskPoint: baseRes&&baseRes.riskPoint || rs.risk,
      action1: baseRes&&baseRes.action1 || '姓名學適合當長線人格與互動風格的補充，不適合單獨定案。',
      action2: baseRes&&baseRes.action2 || '真正裁決仍要和八字、紫微、星盤一起看。',
      timingText: baseRes&&baseRes.timingText || '姓名學偏長線底色，不主短期應期。',
      evidence: evidence,
      apiPayload: {
        system:'name', type:type, question:context.question||'', score:score, confidence:conf, direction:direction,
        evidence: evidence.map(function(e){ return {category:e.category,label:e.label,direction:e.direction,weight:e.weight,detail:e.detail,source:e.source}; }),
        timing:{ mode:'long', text:'姓名學偏長線底色，不主短期應期。' }
      }
    });
    out.finalAnswer = _finalAnswer(out.yesNoAnswer, out.why1, out.why2, out.why3, out.riskPoint, out.action1, out.action2);
    return out;
  };


  function _buildRichPayloadFromResult(system, res, type, question){
    var split = _splitSupportRisk(res.evidence);
    var mode = (system==='meihua'||system==='tarot') ? 'short' : (system==='natal'||system==='jyotish' ? 'mid_long' : 'mid');
    var extra = { focus:_questionFocus(type), finalAnswer:res.finalAnswer||'', strategies:_arr(res.strategies).slice(0,4) };
    if(system==='natal'){
      extra.core = {
        houseSupport: _arr(res.houseSupport).slice(0,4),
        planetSupport: _arr(res.planetSupport).slice(0,4),
        aspectSupport: res.aspectSupport||null,
        tensionSummary: res.tensionSummary||null,
        angleSupport: _arr(res.angleSupport).slice(0,4)
      };
    } else if(system==='jyotish'){
      extra.core = {
        houseSupport:_arr(res.houseSupport).slice(0,5),
        houseLordSupport:_arr(res.houseLordSupport).slice(0,4),
        karakaSupport:_arr(res.karakaSupport).slice(0,4),
        dashaSupport:res.dashaSupport||null,
        transitSupport:_arr(res.transitSupport).slice(0,4),
        yogaSupport:_arr(res.yogaSupport).slice(0,4),
        afflictionSupport:_arr(res.afflictionSupport).slice(0,4),
        divisionSupport:_arr(res.divisionSupport).slice(0,4)
      };
    } else if(system==='tarot'){
      extra.core = {
        spread:_arr(res.cards||res.draws).map(function(c){ return { pos:c.pos||c.position||'', name:c.name||c.card||'', orientation:c.orientation||c.reversed||'', suit:c.suit||'', number:c.number||'' }; }).slice(0,12),
        combos:_arr(res.combos).slice(0,5),
        numericThemes:_arr(res.numericThemes).slice(0,4)
      };
    } else if(system==='meihua'){
      extra.core = {
        gua: { ben:res.benGua||res.ben||'', hu:res.huGua||res.hu||'', bian:res.bianGua||res.bian||'', dongYao:res.dongYao||res.moveLine||'' },
        bodyUse:res.bodyUse||res.tiYong||'',
        timingHints:_arr(res.timingHints||res.timings).slice(0,4)
      };
    }
    return Object.assign({
      system:system,
      type:type||'general',
      question:question||'',
      evidence:split.evidence,
      supports:split.supports,
      risks:split.risks,
      neutralSignals:split.neutral,
      timing:_timingPayload(mode, res.timingText||'', (_arr(res.apiPayload&&res.apiPayload.timings&&res.apiPayload.timings.goodMonths) || _arr(res.apiPayload&&res.apiPayload.timing&&res.apiPayload.timing.goodWindows)), (_arr(res.apiPayload&&res.apiPayload.timings&&res.apiPayload.timings.riskMonths) || _arr(res.apiPayload&&res.apiPayload.timing&&res.apiPayload.timing.riskWindows))),
      confidenceBasis:{ evidenceCount:split.evidence.length, supportCount:split.supports.length, riskCount:split.risks.length }
    }, _featurePack(system, res, extra));
  }

  ['analyzeMeihuaQuestion','analyzeTarotQuestion','analyzeNatalQuestion','analyzeJyotishQuestion'].forEach(function(fnName){
    var old = window[fnName];
    if(typeof old !== 'function') return;
    window[fnName] = function(){
      var res = old.apply(this, arguments) || {};
      try{
        var system = fnName.replace('analyze','').replace('Question','').toLowerCase();
        if(!res.apiPayload || !res.apiPayload.supports || !res.apiPayload.summary){
          res.apiPayload = _buildRichPayloadFromResult(system, res, arguments[1] || 'general', arguments[2] || '');
        }
      }catch(e){}
      return res;
    };
  });

  window.buildAPISystemPayloads = function(){
    var payload = { meta:{ type:(S.form&&S.form.type)||'general', question:(S.form&&S.form.question)||'', generatedAt:new Date().toISOString(), focus:_questionFocus((S.form&&S.form.type)||'general') } };
    try{ payload.bazi = window.analyzeBaziQuestion ? analyzeBaziQuestion(S.bazi, payload.meta.type, payload.meta.question).apiPayload : null; }catch(e){ payload.bazi=null; }
    try{ payload.ziwei = window.analyzeZiweiQuestion ? analyzeZiweiQuestion(S.ziwei, payload.meta.type, payload.meta.question).apiPayload : null; }catch(e){ payload.ziwei=null; }
    try{ payload.meihua = window.analyzeMeihuaQuestion ? analyzeMeihuaQuestion(S.meihua, payload.meta.type, payload.meta.question).apiPayload : null; }catch(e){ payload.meihua=null; }
    try{ payload.tarot = window.analyzeTarotQuestion ? analyzeTarotQuestion(S.tarot, payload.meta.type, payload.meta.question).apiPayload : null; }catch(e){ payload.tarot=null; }
    try{ payload.natal = window.analyzeNatalQuestion ? analyzeNatalQuestion(S.natal, payload.meta.type, payload.meta.question).apiPayload : null; }catch(e){ payload.natal=null; }
    try{ payload.jyotish = window.analyzeJyotishQuestion ? analyzeJyotishQuestion(S.jyotish, payload.meta.type, payload.meta.question).apiPayload : null; }catch(e){ payload.jyotish=null; }
    try{
      var nr=null,zr=null;
      if(S.form && S.form.name && S.form.name.length>=2){
        nr = typeof analyzeName==='function' ? analyzeName(S.form.name) : null;
        var birthY = S.form.bdate ? Number(String(S.form.bdate).split('-')[0]) : null;
        zr = (birthY && typeof analyzeZodiacName==='function') ? analyzeZodiacName(S.form.name, birthY) : null;
      }
      payload.name = window.analyzeNameQuestion ? analyzeNameQuestion(nr, zr, { type:payload.meta.type, question:payload.meta.question, bazi:S.bazi }).apiPayload : null;
    }catch(e){ payload.name=null; }

    try{
      var keys = ['bazi','ziwei','meihua','tarot','natal','jyotish','name'];
      var active = keys.filter(function(k){ return payload[k] && typeof payload[k].score === 'number'; });
      var scores = active.map(function(k){ return payload[k].score; });
      var confs = active.map(function(k){ return payload[k].confidence || 0; });
      var dirs = { positive:0, neutral:0, negative:0 };
      var allSupports = [], allRisks = [];
      active.forEach(function(k){
        var p = payload[k];
        try{
          p.caseVector = _buildCaseVector(k, p, payload.meta.type, payload.meta.question);
        }catch(e){ p.caseVector = null; }
        dirs[p.direction||'neutral'] = (dirs[p.direction||'neutral']||0) + 1;
        allSupports = allSupports.concat(_arr(p.supports).map(function(x){ x.system = x.system || k; return x; }));
        allRisks = allRisks.concat(_arr(p.risks).map(function(x){ x.system = x.system || k; return x; }));
      });
      allSupports.sort(function(a,b){ return _weightOf(b)-_weightOf(a); });
      allRisks.sort(function(a,b){ return _weightOf(b)-_weightOf(a); });
      var avg = scores.length ? Math.round(scores.reduce(function(a,b){ return a+b; },0)/scores.length) : 50;
      var avgConf = confs.length ? Math.round(confs.reduce(function(a,b){ return a+b; },0)/confs.length) : 0;
      var activePayloads = active.map(function(k){ return payload[k]; }).filter(Boolean);
      var caseMatrix = _buildCrossCaseMatrix(activePayloads);
      payload.crossSystem = {
        activeSystems: active,
        averageScore: avg,
        averageConfidence: avgConf,
        consensus: dirs.positive>dirs.negative ? 'positive_bias' : dirs.negative>dirs.positive ? 'negative_bias' : 'mixed',
        directionCount: dirs,
        topSupports: allSupports.slice(0,8),
        topRisks: allRisks.slice(0,8),
        caseMatrix: caseMatrix,
        summary: '七維有效系統 '+active.length+' 套，整體平均分 '+avg+'，共識偏向 '+(dirs.positive>dirs.negative?'正向':dirs.negative>dirs.positive?'逆風':'混合')+'。' + (caseMatrix.topEssence[0] ? ' 主線更像「'+caseMatrix.topEssence[0].tag+'」。' : '')
      };
    }catch(e){ payload.crossSystem = null; }
    return payload;
  };

  if(typeof window._buildPayload === 'function'){
    var _oldBuildPayload = window._buildPayload;
    window._buildPayload = function(){
      var p = _oldBuildPayload();
      try{
        var structured = buildAPISystemPayloads();
        p.structured = structured;
        p.readings = p.readings || {};
        ['bazi','ziwei','meihua','tarot','natal','jyotish','name'].forEach(function(k){
          if(structured[k]){
            var compact = JSON.stringify(structured[k]);
            p.readings[k] = (p.readings[k]||'') + '\n【結構化證據】\n' + compact;
          }
        });
      }catch(e){}
      return p;
    };
  }

})();


// ═══════════════════════════════════════════════════════════════════════
// [PHASE 5] 紫微第四階段＋塔羅第四階段
// 目標：把紫微 / 塔羅提升到主裁決級 API 證據層
// ═══════════════════════════════════════════════════════════════════════
(function(){
  'use strict';

  function _zwSafeArr(v){ return Array.isArray(v) ? v : []; }
  function _zwPalaceNameToIndex(name){
    var map = {'命宮':0,'兄弟宮':1,'夫妻宮':2,'子女宮':3,'財帛宮':4,'疾厄宮':5,'遷移宮':6,'交友宮':7,'官祿宮':8,'田宅宮':9,'福德宮':10,'父母宮':11};
    return Object.prototype.hasOwnProperty.call(map, name) ? map[name] : -1;
  }
  function _zwMainIndexByType(type){
    var map = {love:2, relationship:7, career:8, wealth:4, health:5, family:9, general:0};
    return Object.prototype.hasOwnProperty.call(map, type||'general') ? map[type||'general'] : 0;
  }
  function _zwTriadIndexes(type){
    var map = {love:[2,6,10,8], relationship:[7,1,5,9], career:[8,0,4,2], wealth:[4,8,0,10], health:[5,11,3,1], family:[9,3,7,5], general:[0,4,8,6]};
    return map[type||'general'] || map.general;
  }
  function _zwStarWeight(s){
    if(!s) return 0;
    var n = s.name || '';
    var score = 0;
    if(s.type === 'major') score += 3;
    if(/紫微|天府|天相|天梁|太陽|太陰|武曲/.test(n)) score += 3;
    else if(/天機|天同|廉貞|貪狼/.test(n)) score += 2;
    else if(/巨門|七殺|破軍/.test(n)) score += 1;
    if(/左輔|右弼|文昌|文曲|天魁|天鉞|祿存|紅鸞|天喜/.test(n)) score += 2;
    if(/擎羊|陀羅|火星|鈴星|地空|地劫|天刑|天虛|天哭/.test(n)) score -= 3;
    if(s.hua === '化祿') score += 4;
    else if(s.hua === '化權') score += 2;
    else if(s.hua === '化科') score += 2;
    else if(s.hua === '化忌') score -= 5;
    if(s.bright === '廟') score += 2;
    else if(s.bright === '旺') score += 1;
    else if(/陷|落陷|不得/.test(s.bright||'')) score -= 2;
    return score;
  }
  function _zwStarsOfPalace(p){ return _zwSafeArr(p && p.stars); }
  function _zwPalaceInfo(zw, idx){
    var p = zw && zw.palaces && zw.palaces[idx] ? zw.palaces[idx] : null;
    var stars = _zwStarsOfPalace(p);
    var majors = stars.filter(function(s){ return s && s.type === 'major'; });
    var goods = stars.filter(function(s){ return s && (/左輔|右弼|文昌|文曲|天魁|天鉞|祿存|紅鸞|天喜|紫微|天府|天相|天梁|太陽|太陰/.test(s.name||'') || /化祿|化權|化科/.test(s.hua||'')); });
    var risks = stars.filter(function(s){ return s && (/擎羊|陀羅|火星|鈴星|地空|地劫|天刑|天虛|天哭/.test(s.name||'') || s.hua === '化忌'); });
    var score = stars.reduce(function(sum,s){ return sum + _zwStarWeight(s); }, 0);
    return { palace:p, stars:stars, majors:majors, goods:goods, risks:risks, score:score };
  }
  function _zwHuaList(obj){
    var out = [];
    if(!obj) return out;
    _zwSafeArr(obj.hua || obj.siHua || obj.sihua).forEach(function(h){ if(h && h.hua) out.push(h); });
    return out;
  }
  function _zwCurrentDx(zw){ return _zwSafeArr(zw && zw.daXian).find(function(d){ return d && d.isCurrent; }) || null; }
  function _zwCurrentLn(zw, dx){
    var y = new Date().getFullYear();
    dx = dx || _zwCurrentDx(zw);
    return _zwSafeArr(dx && dx.liuNian).find(function(n){ return n && Number(n.year) === y; }) || null;
  }
  function _zwBuildDetailedEvidence(zw, type){
    type = type || 'general';
    var evidence = [];
    var triadIdxs = _zwTriadIndexes(type);
    var triadInfos = triadIdxs.map(function(idx){ return _zwPalaceInfo(zw, idx); });
    var focus = triadInfos[0] || { palace:null, stars:[], majors:[], goods:[], risks:[], score:0 };
    var focusName = focus.palace && focus.palace.name ? focus.palace.name : '';

    if(focusName){
      evidence.push(_mkEvidence('ziwei','focus_palace','主題宮：'+focusName,'neutral',4,'本題第一判斷核心落在「'+focusName+'」，必須先看這一宮的主星、四化與煞忌。','focus_palace'));
    }
    _zwSafeArr(focus.majors).slice(0,4).forEach(function(s){
      var dir = _zwStarWeight(s) >= 2 ? 'positive' : _zwStarWeight(s) <= -2 ? 'negative' : 'neutral';
      evidence.push(_mkEvidence('ziwei','major_star','主星：'+(s.name||'主星'),dir,4,(s.name||'主星')+(s.hua?(' '+s.hua):'')+' 直接定義這題的主線。','major_star'));
    });
    _zwSafeArr(focus.goods).slice(0,4).forEach(function(s){
      evidence.push(_mkEvidence('ziwei','good_star','吉曜：'+((s.name||'') + (s.hua?(' '+s.hua):'')),'positive',3,((s.name||'吉曜')+(s.hua?(' '+s.hua):''))+' 代表可借力的資源、貴助或轉圜空間。','good_star'));
    });
    _zwSafeArr(focus.risks).slice(0,4).forEach(function(s){
      evidence.push(_mkEvidence('ziwei','risk_star','煞忌：'+((s.name||'') + (s.hua?(' '+s.hua):'')),'negative',3,((s.name||'煞忌')+(s.hua?(' '+s.hua):''))+' 是這題最容易卡住、拖延或失控的點。','risk_star'));
    });

    triadInfos.slice(1).forEach(function(info){
      if(!info || !info.palace || !info.palace.name) return;
      var dir = info.score >= 4 ? 'positive' : info.score <= -2 ? 'negative' : 'neutral';
      evidence.push(_mkEvidence('ziwei','sanfang','三方四正：'+info.palace.name,dir,3,'三方四正中的「'+info.palace.name+'」'+(dir==='positive'?'能接住主題宮。':dir==='negative'?'會對主題宮形成拖累。':'影響中性，需要和其他宮位一起看。'),'sanfang'));
    });

    var dx = _zwCurrentDx(zw);
    if(dx){
      var dxDir = /大吉|中吉|小吉|順/.test(String(dx.level||'')) ? 'positive' : /凶|低迷|偏弱|壓/.test(String(dx.level||'')) ? 'negative' : 'neutral';
      evidence.push(_mkEvidence('ziwei','dayun','大限：'+(dx.palaceName||''),dxDir,4,'目前十年主軸走到「'+(dx.palaceName||'')+'」大限，這會決定你這題到底是順風還是逆風。','dayun'));
      _zwHuaList(dx).slice(0,6).forEach(function(h){
        var palaceIdx = _zwPalaceNameToIndex(h.palace||'');
        var inTriad = triadIdxs.indexOf(palaceIdx) !== -1;
        var dir = h.hua === '化祿' ? 'positive' : h.hua === '化忌' ? 'negative' : 'neutral';
        var wt = inTriad ? 4 : 2;
        evidence.push(_mkEvidence('ziwei','dayun_hua','大限'+(h.star||'')+h.hua+'入'+(h.palace||''),dir,wt,'大限四化顯示這十年在「'+(h.palace||'')+'」上有'+(h.hua==='化忌'?'壓力與代價':h.hua==='化祿'?'助力與資源':'推動與放大')+'。','dayun_hua'));
      });
    }

    var ln = _zwCurrentLn(zw, dx);
    if(ln){
      evidence.push(_mkEvidence('ziwei','liunian','流年：'+(ln.mingPalace||ln.year||''),'neutral',3,'今年流年命宮落在「'+(ln.mingPalace||'未知宮位')+'」，代表今年體感與事件重心的舞台。','liunian'));
      _zwHuaList(ln).slice(0,6).forEach(function(h){
        var palaceIdx = _zwPalaceNameToIndex(h.palace||'');
        var inTriad = triadIdxs.indexOf(palaceIdx) !== -1;
        var dir = h.hua === '化祿' ? 'positive' : h.hua === '化忌' ? 'negative' : 'neutral';
        var wt = inTriad ? 3 : 2;
        evidence.push(_mkEvidence('ziwei','liunian_hua','流年'+(h.star||'')+h.hua+'入'+(h.palace||''),dir,wt,'流年四化表示今年在「'+(h.palace||'')+'」這塊特別容易出事、出機會，或被放大。','liunian_hua'));
      });
    }

    return { evidence:evidence, focus:focus, triadInfos:triadInfos, dx:dx, ln:ln };
  }

  var _phase4Ziwei = window.analyzeZiweiQuestion;
  if(typeof _phase4Ziwei === 'function'){
    window.analyzeZiweiQuestion = function(zw, type, userQuestion){
      var res = _phase4Ziwei(zw, type, userQuestion) || {};
      try{
        var pack = _zwBuildDetailedEvidence(zw, type || 'general');
        var merged = _normEvidence((res.evidence||[]).concat(pack.evidence||[]));
        var split = _splitSupportRisk(merged);
        var triadPalaces = _zwSafeArr(pack.triadInfos).map(function(info){ return info && info.palace && info.palace.name ? { name:info.palace.name, score:info.score, majorStars:_zwSafeArr(info.majors).map(function(s){return s.name;}).slice(0,4), goodStars:_zwSafeArr(info.goods).map(function(s){return (s.name||'')+(s.hua?(' '+s.hua):'');}).slice(0,4), riskStars:_zwSafeArr(info.risks).map(function(s){return (s.name||'')+(s.hua?(' '+s.hua):'');}).slice(0,4) } : null; }).filter(Boolean);
        res.evidence = merged;
        res.apiPayload = Object.assign({}, res.apiPayload||{}, {
          system:'ziwei',
          type:type||'general',
          question:userQuestion||'',
          score:res.score||50,
          confidence:Math.max(res.confidence||0, _confidenceFromEvidence(merged, 8)),
          direction:res.direction||'neutral',
          summary:_summaryFromResult('ziwei', res),
          palace:res.palace || (pack.focus && pack.focus.palace && pack.focus.palace.name) || '',
          mainStars:_zwSafeArr(res.mainStars).length?_zwSafeArr(res.mainStars):_zwSafeArr(pack.focus && pack.focus.majors).map(function(s){return s.name;}).slice(0,6),
          goodStars:_zwSafeArr(res.goodStars).length?_zwSafeArr(res.goodStars):_zwSafeArr(pack.focus && pack.focus.goods).map(function(s){return (s.name||'')+(s.hua?(' '+s.hua):'');}).slice(0,6),
          riskStars:_zwSafeArr(res.riskStars).length?_zwSafeArr(res.riskStars):_zwSafeArr(pack.focus && pack.focus.risks).map(function(s){return (s.name||'')+(s.hua?(' '+s.hua):'');}).slice(0,6),
          supports:split.supports,
          risks:split.risks,
          neutralSignals:split.neutral,
          evidence:split.evidence,
          rawFeatures:{
            palaceScore:res.palaceScore||null,
            focusPalace:res.palace || '',
            triadPalaces:triadPalaces,
            dayun:pack.dx ? { palaceName:pack.dx.palaceName||'', level:pack.dx.level||'', hua:_zwHuaList(pack.dx).slice(0,8) } : null,
            liunian:pack.ln ? { year:pack.ln.year||'', mingPalace:pack.ln.mingPalace||'', hua:_zwHuaList(pack.ln).slice(0,8) } : null
          },
          timing:_timingPayload('mid_long', res.timingText||'紫微先看主題宮，再看三方四正，最後用大限與流年四化定位時機。',
            _uniq(_zwSafeArr([
              pack.dx && pack.dx.level && /大吉|中吉|小吉|順/.test(String(pack.dx.level)) ? ('大限 '+pack.dx.palaceName) : null,
              pack.ln && pack.ln.mingPalace ? ('流年命宮 '+pack.ln.mingPalace) : null,
              _zwHuaList(pack.ln).find(function(h){ return h.hua==='化祿'; }) ? ('流年化祿入'+_zwHuaList(pack.ln).find(function(h){ return h.hua==='化祿'; }).palace) : null
            ]).filter(Boolean)),
            _uniq(_zwSafeArr([
              pack.dx && pack.dx.level && /凶|低迷|偏弱|壓/.test(String(pack.dx.level)) ? ('大限 '+pack.dx.palaceName+' 壓力') : null,
              _zwHuaList(pack.dx).find(function(h){ return h.hua==='化忌'; }) ? ('大限化忌入'+_zwHuaList(pack.dx).find(function(h){ return h.hua==='化忌'; }).palace) : null,
              _zwHuaList(pack.ln).find(function(h){ return h.hua==='化忌'; }) ? ('流年化忌入'+_zwHuaList(pack.ln).find(function(h){ return h.hua==='化忌'; }).palace) : null
            ]).filter(Boolean))
          ),
          confidenceBasis:{
            evidenceCount:split.evidence.length,
            hasTriad:triadPalaces.length>1,
            hasDayun:!!pack.dx,
            hasLiunian:!!pack.ln,
            hasDayunHua:_zwHuaList(pack.dx).length>0,
            hasLiunianHua:_zwHuaList(pack.ln).length>0
          }
        });
      }catch(e){}
      return res;
    };
  }

  function _tarotCardsFromInput(tarot){
    if(Array.isArray(tarot)) return tarot;
    if(tarot && Array.isArray(tarot.drawn)) return tarot.drawn;
    return [];
  }
  function _tarotPosLabel(i){
    return ['現況','阻礙','根因','過去基礎','顯意識','近未來','自己','外在環境','希望/恐懼','結果'][i] || ('位置'+(i+1));
  }
  function _tarotSuit(card){
    var n = String(card && (card.nameZh||card.name||card.zh||''));
    if(/權杖|棒|Wands/i.test(n)) return 'fire';
    if(/聖杯|Cup/i.test(n)) return 'water';
    if(/寶劍|Sword/i.test(n)) return 'air';
    if(/金幣|錢幣|Pentacle|Coin/i.test(n)) return 'earth';
    return 'major';
  }
  function _tarotIsMajor(card){
    var n = String(card && (card.nameZh||card.name||card.zh||''));
    return /愚者|魔術師|女祭司|皇后|皇帝|教皇|戀人|戰車|力量|隱者|命運之輪|正義|倒吊人|死神|節制|惡魔|高塔|星星|月亮|太陽|審判|世界|The /.test(n) && !/權杖|聖杯|寶劍|金幣|Wands|Cups|Swords|Pentacles/i.test(n);
  }
  function _tarotCardName(card){ return String(card && (card.nameZh||card.name||card.zh||'牌')).trim(); }
  function _tarotIsReversed(card){ return !!(card && (card.reversed || card.isReversed || card.rev)); }
  function _tarotBuildEvidence(tarot, qr){
    var cards = _tarotCardsFromInput(tarot);
    var evidence = [];
    if(!cards.length) return { evidence:evidence, cards:cards };
    var obstacle = cards[1], root = cards[2], near = cards[5], selfc = cards[6], env = cards[7], hope = cards[8], result = cards[9];
    [['阻礙位',obstacle,'negative',4,'阻礙位代表真正卡關點，不是表面情緒。'],['根因位',root,'neutral',4,'根因位告訴你事情為什麼會走到現在。'],['近未來',near,'neutral',3,'近未來位代表短期1-4週內最先浮出的走向。'],['自己',selfc,'neutral',3,'自己位顯示你目前的主觀立場與操作方式。'],['外在環境',env,'neutral',3,'外在位顯示別人、環境、規則或局勢怎麼回應你。'],['希望/恐懼',hope,'neutral',2,'這張牌常是盲點或內在拉扯。'],['結果位',result,'positive',5,'結果位不是保證，而是照目前路線走下去最可能的落點。']].forEach(function(row){
      var label = row[0], card = row[1], baseDir = row[2], wt = row[3], detail = row[4];
      if(!card) return;
      var dir = baseDir;
      if(label === '結果位') dir = _tarotIsReversed(card) ? 'negative' : (_tarotIsMajor(card) ? 'positive' : 'neutral');
      if(label === '阻礙位') dir = 'negative';
      evidence.push(_mkEvidence('tarot','position',label+'：'+_tarotCardName(card)+(_tarotIsReversed(card)?'（逆位）':''),dir,wt,detail,'position'));
    });

    var reversedCount = cards.filter(_tarotIsReversed).length;
    if(reversedCount >= 4){
      evidence.push(_mkEvidence('tarot','reversal','逆位偏多：'+reversedCount+'張','negative',4,'逆位偏多表示阻力、延遲、內耗或事情走法不直線。','reversal'));
    }
    var majorCount = cards.filter(_tarotIsMajor).length;
    if(majorCount >= 4){
      evidence.push(_mkEvidence('tarot','major_arcana','大牌主導：'+majorCount+'張','positive',3,'大牌偏多代表這不是小事件，而是帶有結構性轉折或必修課。','major_arcana'));
    }
    var suitCounts = {fire:0,water:0,air:0,earth:0,major:0};
    cards.forEach(function(c){ suitCounts[_tarotSuit(c)] = (suitCounts[_tarotSuit(c)]||0)+1; });
    var dominantSuit = Object.keys(suitCounts).sort(function(a,b){ return suitCounts[b]-suitCounts[a]; })[0];
    if(dominantSuit && dominantSuit !== 'major' && suitCounts[dominantSuit] >= 3){
      var suitLabel = {fire:'火元素/權杖',water:'水元素/聖杯',air:'風元素/寶劍',earth:'土元素/金幣'}[dominantSuit] || dominantSuit;
      var suitDir = dominantSuit === 'air' ? 'negative' : dominantSuit === 'earth' ? 'neutral' : 'positive';
      evidence.push(_mkEvidence('tarot','element','元素主導：'+suitLabel,suitDir,3,'元素主導告訴你這題主要靠行動、情緒、思考還是現實資源來推。','element'));
    }
    if(obstacle && result){
      var sameSuit = _tarotSuit(obstacle) === _tarotSuit(result);
      if(sameSuit && _tarotSuit(result) !== 'major'){
        evidence.push(_mkEvidence('tarot','chain','阻礙位與結果位同元素','negative',3,'現在的阻礙若不處理，後面的結果很容易沿著同一條路徑放大。','chain'));
      } else if(_tarotIsMajor(result) && !_tarotIsReversed(result)) {
        evidence.push(_mkEvidence('tarot','chain','結果位為大牌正位','positive',4,'雖然中間有拉扯，但結果位的大牌正位表示後段仍有翻盤或定局能力。','chain'));
      }
    }
    if(selfc && env){
      var selfSuit = _tarotSuit(selfc), envSuit = _tarotSuit(env);
      if(selfSuit === envSuit && selfSuit !== 'major') evidence.push(_mkEvidence('tarot','sync','自己位與外在位同元素','positive',3,'代表你自己的操作方式與外部環境較同步，推進時阻力較少。','sync'));
      else evidence.push(_mkEvidence('tarot','sync','自己位與外在位不同元素','negative',2,'代表你心裡想做的與外在節奏未必一致，容易出現誤判。','sync'));
    }
    if(qr && qr.summary){
      _zwSafeArr(qr.summary.supportFlags).slice(0,3).forEach(function(t){ evidence.push(_mkEvidence('tarot','support_flag','支持點','positive',2,t,'summary')); });
      _zwSafeArr(qr.summary.conflictFlags).slice(0,3).forEach(function(t){ evidence.push(_mkEvidence('tarot','conflict_flag','衝突點','negative',2,t,'summary')); });
      if(qr.summary.selfExternalSync) evidence.push(_mkEvidence('tarot','sync_summary','內外一致度：'+qr.summary.selfExternalSync, qr.summary.selfExternalSync==='一致'?'positive':'negative',2,'塔羅摘要已偵測到自己與外在環境是否同步。','summary'));
      if(qr.summary.timing) evidence.push(_mkEvidence('tarot','timing','牌陣節奏：'+qr.summary.timing,'neutral',2,'這是牌陣對近期節奏的摘要。','summary'));
    }
    if(qr && qr.spread && qr.spread.insights){
      _zwSafeArr(qr.spread.insights).slice(0,4).forEach(function(it){ evidence.push(_mkEvidence('tarot','insight',(it.pos||'牌位')+'：'+(it.card||''),/阻|卡|怕|慢/.test(it.meaning||'')?'negative':'neutral',2,it.meaning||it.card||'牌陣觀察。','spread')); });
    }
    return { evidence:evidence, cards:cards, reversedCount:reversedCount, majorCount:majorCount, dominantSuit:dominantSuit };
  }

  var _phase4Tarot = window.analyzeTarotQuestion;
  if(typeof _phase4Tarot === 'function'){
    window.analyzeTarotQuestion = function(tarot, type, question){
      var res = _phase4Tarot(tarot, type, question) || {};
      try{
        var pack = _tarotBuildEvidence(tarot, res);
        var merged = _normEvidence((res.evidence||[]).concat(pack.evidence||[]));
        var split = _splitSupportRisk(merged);
        var cards = pack.cards || [];
        res.evidence = merged;
        res.apiPayload = Object.assign({}, res.apiPayload||{}, {
          system:'tarot',
          type:type||'general',
          question:question||'',
          score:res.score||50,
          confidence:Math.max(res.confidence||0, _confidenceFromEvidence(merged, 8)),
          direction:res.direction||'neutral',
          summary:_summaryFromResult('tarot', res),
          supports:split.supports,
          risks:split.risks,
          neutralSignals:split.neutral,
          evidence:split.evidence,
          rawFeatures:{
            spreadType:'celtic_cross',
            cards:cards.map(function(c, idx){ return { position:idx+1, label:_tarotPosLabel(idx), name:_tarotCardName(c), reversed:_tarotIsReversed(c), suit:_tarotSuit(c), major:_tarotIsMajor(c) }; }),
            reversedCount:pack.reversedCount||0,
            majorCount:pack.majorCount||0,
            dominantSuit:pack.dominantSuit||'',
            summary:res.summary||null
          },
          timing:_timingPayload('short_mid', res.timingText||'塔羅屬短中期判讀，先看阻礙位、根因位、近未來，再看結果位是否能接住。',
            _uniq(_zwSafeArr([
              res.summary && res.summary.timing ? res.summary.timing : null,
              cards[5] ? ('近未來：'+_tarotCardName(cards[5])) : null,
              cards[9] && !_tarotIsReversed(cards[9]) ? ('結果位：'+_tarotCardName(cards[9])) : null
            ]).filter(Boolean)),
            _uniq(_zwSafeArr([
              cards[1] ? ('阻礙位：'+_tarotCardName(cards[1])+(_tarotIsReversed(cards[1])?'（逆位）':'')) : null,
              (pack.reversedCount||0) >= 4 ? ('逆位偏多：'+pack.reversedCount+'張') : null,
              cards[9] && _tarotIsReversed(cards[9]) ? ('結果位逆位：'+_tarotCardName(cards[9])) : null
            ]).filter(Boolean))
          ),
          confidenceBasis:{
            evidenceCount:split.evidence.length,
            hasSpread:!!res.spread,
            hasSummary:!!res.summary,
            hasObstacleResultChain:!!(cards[1] && cards[9]),
            reversedCount:pack.reversedCount||0,
            majorCount:pack.majorCount||0
          }
        });
      }catch(e){}
      return res;
    };
  }
})();
