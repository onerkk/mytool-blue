// Canonical semantic question planner.
// Architecture v4: normalize -> discourse units -> speech/context/example classification -> semantic frames -> entity/proposition coreference -> question graph -> topology.
// v4 separates discourse linkage from logical dependency: sharing an actor or appearing later in the paragraph does not make two questions conditionally dependent.
// Inspired by Frame Semantics / AMR-style role graphs: separate who evaluates, what is evaluated, the relation, facets and time.
// Method engines consume typed semantic roles; they do not need sentence-specific keyword patches.
function analyzeReadingQuestion(value) {
  var raw=String(value||'').trim(), q=raw;
  try { q=q.normalize('NFKC'); } catch (_) {}
  var conversions={
    '选择':'選擇','还是':'還是','问题':'問題','关系':'關係','结婚':'結婚','同事们':'同事們','各自':'各自','未来':'未來','建议':'建議','事业':'事業','财运':'財運','机会':'機會','金额':'金額','奖金':'獎金','收入':'收入','概率':'機率','几率':'機率','几岁':'幾歲','时间':'時間','为什么':'為什麼','怎么':'怎麼','如何':'如何','谁':'誰','哪个':'哪個','哪一个':'哪一個','多少钱':'多少錢','几张':'幾張','会不会':'會不會','有没有':'有沒有','能不能':'能不能','可不可以':'可不可以','是否':'是否'
  };
  Object.keys(conversions).forEach(function(k){q=q.split(k).join(conversions[k]);});
  // Metalinguistic correction is not event content:「不是在問X，而是Y」means Y is the active query.
  // Restrict this transform to explicit ask-verbs so ordinary semantic contrasts（不是X而是Y）remain intact.
  q=q.replace(/^(?:不是|並非|不)(?:在)?(?:問|想問|要問|想知道)[^，,。；;！？?\n]*?(?:[，,]\s*)?(?:而是|是想問|我要問|我想問|真正想問的是)\s*/,'').trim();
  function unique(xs){var out=[]; (xs||[]).forEach(function(x){if(x!==undefined&&x!==null&&x!==''&&out.indexOf(x)<0)out.push(x);}); return out;}
  function clean(s){return String(s||'').replace(/^\s*(?:[①②③④⑤⑥⑦⑧⑨⑩]|\d+[.、)）]|(?:另外|還有|以及|也想問|至於|請問))\s*/,'').replace(/[？?。；;]+$/,'').trim();}
  function matchAllWords(s, words){return words.filter(function(w){return s.indexOf(w)>=0;});}
  function hasAny(s, words){return words.some(function(w){return s.indexOf(w)>=0;});}
  function scope(s){return unique((String(s||'').match(/(?:20\d{2}年(?:\d{1,2}月(?:\d{1,2}日)?)?|今年|明年|後年|未來一年|未來十二個月|未來12個月|本月|這個月|下個月|本週|這週|下週|今天|今日|明天|後天|年底前|月底前|週內|月內|年內|近期|最近|(?:未來|接下來)?[一二三四五六七八九十兩\d]+(?:個月|週|天|年)(?:內|後)?)/g)||[])).join('、');}

  // A small ontology is deliberately lexical only at the atomic level. Whole user sentences are never hard-coded.
  var ONTOLOGY={
    privateState:['暗戀','喜歡','愛','在乎','欣賞','心動','好感','討厭','害怕','擔心','懷疑','信任','想法','心裡','內心','真心','感受','態度','意圖','打算','有意思','需要','偏好','渴望','想要'],
    overtAction:['告白','表白','追求','聯絡','回覆','邀約','邀請','約會','交往','分手','復合','結婚','承諾','同意','接受','拒絕','嘗試','參與','參加','取消','調整','改變','開始','繼續','買','賣','租','換','使用','採用','選擇','靠近','示好','說出口','坦白','確認關係','錄取','升遷','付款','入帳','到貨','出貨','成交','簽約','離職','轉職','搬家','出發','回來'],
    money:['錢','金額','獎金','收入','營業額','營收','業績','價格','薪資','薪水','款項','現金','中獎','抽獎','發票','彩券','樂透','威力彩','大樂透','刮刮樂','退款','回饋'],
    countUnits:['張','次','件','份','人','筆','單','顆','條','位','個','組','家','間','封','通','則'],
    timeUnits:['秒','分鐘','分','小時','時','天','日','週','星期','月','個月','年'],
    moneyUnits:['元','塊','千元','萬元','萬','千','百萬','億'],
    moneyMeasureNouns:['錢','金額','獎金','收入','營業額','營收','業績','價格','薪資','薪水','款項','現金','退款','回饋'],
    ageUnits:['歲','年次'],
    probabilityUnits:['%','％','成'],
    profile:['外貌','長相','身高','體型','職業','哪裡人','個性','性格','特徵','類型','年輕','同齡','成熟','年長','年紀','年齡','相處模式'],
    domains:{
      relationship:['感情','愛情','戀愛','婚姻','桃花','曖昧','復合','分手','告白','暗戀','喜歡','愛','交往','約會','伴侶','女友','男友','老婆','老公'],
      work:['工作','事業','職場','公司','主管','同事','升遷','職位','作業員','錄取','轉職','離職','職涯'],
      finance:['財運','財務','錢','收入','薪水','薪資','營業額','營收','業績','獎金','中獎','發票','付款','入帳','生意','訂單'],
      health:['健康','身體','疾病','症狀','懷孕','醫療','醫生','住院'],
      family:['家庭','家人','父母','爸爸','媽媽','孩子','子女'],
      study:['學業','考試','學習','學校','成績','升學'],
      travel:['旅行','旅遊','出國','搬家','移居','出發','行程'],
      commerce:['廠商','供應商','供貨','進貨','採購','批發','合作','配合','交期','品質','品管','成本','報價','售後','貨源','庫存','出貨','訂單','客戶','交易'],
      intimacy:['性愛','愛愛','性行為','親密','性幻想','角色扮演','3p','3P','三人行','兩女一男','兩男一女']
    },
    continuity:['長期','長久','長遠','持續','繼續','往後','後續','長時間','長年','一直維持'],
    evaluation:[
      {id:'worth',terms:['值不值得','值得']},
      {id:'suitability',terms:['適不適合','適合']},
      {id:'reliability',terms:['可不可靠','可靠','值不值得信任','值得信任','可信']},
      {id:'stability',terms:['穩不穩定','穩定']},
      {id:'reasonableness',terms:['合不合理','合理']},
      {id:'feasibility',terms:['可不可行','可行']},
      {id:'value',terms:['划不划算','划算']},
      {id:'safety',terms:['安不安全','安全']},
      {id:'effectiveness',terms:['有沒有效','有效']},
      {id:'quality',terms:['好不好','好','差不差','差']}
    ]
  };
  var SUBJECT_WORDS=['我','我們','你','你們','他','她','他們','她們','對方','這個人','那個人','有人','某人','女生','女性','男生','男性','異性','同事','女同事','男同事','異性同事','女性同事','男性同事','主管','客戶','朋友','好友','閨蜜','女友','男友','伴侶','前任','前男友','前女友','老婆','老公','妻子','丈夫','家人','媽媽','爸爸','父母','孩子'];
  var CONTINUATION=['未來','之後','後來','往後','接下來','再來','下一步','那','那麼','然後','後續','到時','如果','若','假如','所以','並且','以及','還有'];
  var EXAMPLE_CUES=['例如','比如','譬如','舉例','像是','比方說','例如說'];
  var SPEECH_VERBS=['問','詢問','說','表示','提到','告訴','回答','回覆','承認','要求','建議','提議','跟我說','跟你說','跟他說','跟她說'];
  var PROPOSITION_PRONOUN_RE=/^(?:這|那|此)(?:件事|件事情|個情況|個狀況|個行為|個做法|個要求|個想法|樣|件|個)?(?=是|代表|表示|意味|因為|由於|為何|為什麼|會|是否|是不是)/;
  var ADVICE=['怎麼辦','做什麼','方法','策略','建議','下一步','怎麼做','如何做','怎麼改善','如何改善','怎麼處理','如何處理','該怎麼','應該怎麼','該如何','應該如何','要怎麼','要如何','可以怎麼','可以如何'];
  var ACTION_MODIFIERS=['主動','直接','再次','再','先','一起','共同','親自','持續','繼續'];
  var ADVICE_ACTIONS=['做','改善','處理','準備','解決','提升','增加','避免','促成','推進','應對','選擇','決定','開口','溝通','調整','開始','繼續'].concat(ONTOLOGY.overtAction);
  function isAdviceCue(s){
    if(hasAny(s,ADVICE))return true;
    if(/(?:該|應該|要|可以|能)(?:怎麼|如何|怎樣)/.test(s))return true;
    var m=s.match(/(?:怎麼|如何|怎樣)([^，,。？?；;\s]{0,8})/);
    return !!(m&&hasAny(m[1]||'',ADVICE_ACTIONS));
  }
  var REASON=['為什麼','為何','原因','根源','卡在哪','阻礙','障礙','問題出在'];
  var TIME_WH=['什麼時候','何時','幾時','多久','多快','多晚','哪一天','哪天','幾月幾日','幾號','幾點','哪一週','幾週','哪個月','幾個月','幾年','應期'];
  var PERSON_WH=['誰','是誰','有誰','哪一位','哪個人','哪個同事','哪名','具體是誰'];
  var YESNO_PREFIX=['是否','會不會','有沒有','能不能','可不可以','能否','會否','是不是','要不要','該不該','應不應該','適不適合','值不值得','行不行','成不成','愛不愛','喜不喜歡'];
  var FUTURE=['未來','之後','往後','接下來','將來','稍後','待會','明天','後天','下週','下個月','明年','年底前','月底前'];
  var LONG_HORIZON=['長期','長久','長遠','持續','繼續','往後','後續','長時間','長年'];
  var PERSONISH=/^(?:我|我們|你|你們|他|她|他們|她們|對方|這個人|那個人|有人|某人|女生|女性|男生|男性|異性|同事|女同事|男同事|主管|客戶|朋友|好友|閨蜜|女友|男友|伴侶|前任|老婆|老公|妻子|丈夫|家人|媽媽|爸爸|父母|孩子)(?:[甲乙丙丁A-Za-z0-9一二三四五六七八九十]*)$/;
  var FACET_STOP=/^(?:我|我們|你|你們|他|她|他們|她們|對方|這個人|那個人|有人|某人|事情|這件事|結果|未來|現在|目前)$/;

  function stripQuestionLead(text){
    var t=String(text||'').trim();
    t=t.replace(/^(?:請問|想問|我想問|幫我看|看看|麻煩看一下|可以幫我看)\s*/,'').replace(/^[，,：:\s]+/,'');
    t=t.replace(/^(?:今天|今日|明天|後天|最近|目前|現在|這次|本次)\s*/,'');
    return t.trim();
  }
  function normalizeNominalCandidate(text){
    var t=stripQuestionLead(text).replace(/^(?:是否|會不會|有沒有|能不能|可不可以|是不是)\s*/,'').replace(/[嗎呢啊呀吧？?。；;！!]+$/g,'').trim();
    // Resolve Mandarin relative clauses before stripping the evaluator/time prefix. This keeps lexical words like「標的」intact.
    if(t.indexOf('的')>=0){var di=t.lastIndexOf('的'), pre=t.slice(0,di).trim(), tail=t.slice(di+1).trim();if((/^(?:我|我們)/.test(pre)||(pre.length>=2&&tail.length>=2))&&tail&&tail.length<=16&&!/(?:怎麼|如何|多少|幾|誰|哪個)/.test(tail))t=tail;}
    t=t.replace(/^(?:我|我們)(?:目前|現在|正在|一直)?\s*/,'').trim();
    t=t.replace(/^(?:這|那|此|該)(?:個|家|間|份|項|位|台|套|款|種|支|張|部|筆|條)?/,'').trim()||t;
    t=t.replace(/^(?:的|之)|(?:的|之)$/g,'').trim();
    return t;
  }
  function findEvaluationCue(s){
    var best=null;
    (ONTOLOGY.evaluation||[]).forEach(function(group){
      (group.terms||[]).forEach(function(term){var at=s.indexOf(term);if(at<0)return;
        // Single-character evaluators such as「好／差」are predicates only at clause end; do not steal nouns like「好感」.
        if((term==='好'||term==='差')&&!/^(?:嗎|呢|吧|啊|呀)?$/.test(s.slice(at+term.length)))return;
        if(!best||at<best.index||(at===best.index&&term.length>best.term.length))best={id:group.id,term:term,index:at};});
    });
    return best;
  }
  function horizonProfile(s){
    var scopeText=scope(s), continuity=hasAny(s,LONG_HORIZON), future=hasAny(s,FUTURE)||/(?:會|將|可能|有機會)/.test(s)||/(?:長期|長久|長遠|往後|後續|持續|繼續)/.test(s);
    var horizon=null;
    if(/長期|長久|長遠|長時間|長年/.test(s))horizon='long_term';
    else if(/持續|繼續|往後|後續/.test(s))horizon='continuing';
    else if(scopeText)horizon='anchored';
    return {future:future,continuity:continuity,horizon:horizon,anchors:scopeText};
  }
  function evaluationFrame(s, subject){
    var evalText=stripQuestionLead(s), cue=findEvaluationCue(evalText);if(!cue)return null;
    var prefix=evalText.slice(0,cue.index).trim(), suffix=evalText.slice(cue.index+cue.term.length).replace(/[嗎呢啊呀吧？?。；;！!]+$/g,'').trim();
    var evaluator=null,target=null,criterion=suffix||cue.term,relation=null,targetFromSuffix=false;
    var relPair=prefix.match(/^(?:我|我們)(?:跟|和|與)(.+)$/);
    if(relPair){evaluator=/^我們/.test(prefix)?'我們':'我';target=normalizeNominalCandidate(relPair[1]);}
    if(!target){
      var prefixSelf=prefix.match(/^(我|我們)(.*)$/);
      if(prefixSelf && cue.id==='suitability' && suffix && (!prefixSelf[2]||!prefixSelf[2].includes('的'))){
        evaluator=prefixSelf[1];target=normalizeNominalCandidate(suffix);criterion=cue.term;targetFromSuffix=true;
      } else {
        target=normalizeNominalCandidate(prefix);
        if(/^(?:我|我們)/.test(prefix)||/(?:我|我們).+的/.test(prefix))evaluator=/^我們/.test(prefix)?'我們':'我';
      }
    }
    //「這份工作適合我」: target before cue, evaluator after cue.
    if(cue.id==='suitability' && /^(?:我|我們)(?:嗎|呢)?$/.test(suffix)){evaluator=suffix.replace(/[嗎呢]/g,'');criterion=cue.term;}
    var rel=suffix.replace(new RegExp('^(?:'+LONG_HORIZON.join('|')+')'),'').trim();
    if(!targetFromSuffix&&rel&&!/^(?:我|我們)$/.test(rel))relation=rel;
    return {kind:cue.id,cue:cue.term,targetRef:target||null,evaluatorRef:evaluator||null,criterion:criterion||cue.term,relation:relation,continuity:hasAny(s,LONG_HORIZON)};
  }
  function isExplicitEntitySurface(v){
    var t=String(v||'').trim();if(!t)return false;
    return PERSONISH.test(t)||/^(?:這|那|該|此|另一|某|本|目前|現在)/.test(t)||/[A-Za-z0-9甲乙丙丁一二三四五六七八九十]$/.test(t)||/(?:公司|廠商|供應商|客戶|主管|同事|朋友|方案|選項|工作|職位|房子|房屋|店家|平台|產品|服務|合約|計畫|計畫案|專案)$/.test(t);
  }
  function domainIds(s){var ids=[];Object.keys(ONTOLOGY.domains).forEach(function(id){if(hasAny(s,ONTOLOGY.domains[id]))ids.push(id);});return ids;}
  function extractEntities(s){
    var found=[];
    SUBJECT_WORDS.slice().sort(function(a,b){return b.length-a.length;}).forEach(function(w){if(s.indexOf(w)>=0)found.push(w);});
    return unique(found).filter(function(w){return !found.some(function(v){return v!==w && v.length>w.length && v.indexOf(w)>=0;});});
  }
  function extractCoordinatedActors(s){
    var text=String(s||'').replace(/[？?。；;！!]/g,'').trim();
    var m=text.match(/^(.{1,40}?)(?:各自|分別|各別|每位|每個)(?=.+)/);
    if(!m)return [];
    var head=m[1].replace(/^(?:請問|想問|我想問|幫我看|看看)\s*/,'').trim();
    var xs=head.split(/(?:與|和|跟|及|、|以及)/).map(function(x){return x.trim();}).filter(Boolean);
    // Coordination is a branch signal only when every conjunct is a compact nominal phrase.
    if(xs.length<2||xs.some(function(x){return x.length>12||/(?:嗎|呢|為什麼|怎麼|如何|會不會|有沒有)/.test(x);}))return [];
    return unique(xs);
  }
  function extractSubject(s){
    var t=String(s||'').replace(/^\s+/,'');
    // Remove discourse/time anchors that can precede the grammatical subject.
    var lead=[].concat(CONTINUATION,FUTURE,['今天','今日','明天','後天','最近','目前','現在','這次','本次','在公司','公司裡','公司內']);
    lead.sort(function(a,b){return b.length-a.length;});
    var changed=true;
    while(changed){changed=false;for(var i=0;i<lead.length;i++){if(t.indexOf(lead[i])===0){t=t.slice(lead[i].length).replace(/^\s+/,'');changed=true;break;}}}
    t=t.replace(/^(?:請問|想問|我想問|幫我看|看看)/,'').replace(/^(?:是否|會不會|有沒有|能不能|可不可以|是不是)/,'');
    // Sentence-initial modal/aspect material is not an actor.  Strip it only when what follows
    // is recognisably predicate/modifier material, so lexical nouns such as「會計」stay intact.
    var subjectOps=['會','能','可以','可能','想','想要','要','願意','打算'];
    var predicateStarts=[].concat(ACTION_MODIFIERS,ONTOLOGY.privateState,ONTOLOGY.overtAction);
    var opChanged=true;
    while(opChanged){
      opChanged=false;
      for(var oi=0;oi<subjectOps.length;oi++){
        var op=subjectOps[oi];
        if(t.indexOf(op)!==0)continue;
        var rest=t.slice(op.length).trim();
        if(rest&&predicateStarts.some(function(x){return rest.indexOf(x)===0;})){t=rest;opChanged=true;break;}
      }
      if(opChanged)continue;
      for(var mi=0;mi<ACTION_MODIFIERS.length;mi++){
        var mod=ACTION_MODIFIERS[mi];
        if(t.indexOf(mod)!==0)continue;
        var rest2=t.slice(mod.length).trim();
        if(rest2&&ONTOLOGY.overtAction.some(function(x){return rest2.indexOf(x)===0;})){t=rest2;opChanged=true;break;}
      }
    }
    // If stripping exposes the predicate itself, the subject is elided and must be resolved from discourse.
    if([].concat(ONTOLOGY.privateState,ONTOLOGY.overtAction).some(function(x){return t.indexOf(x)===0;}))return null;
    // Existential person phrases bind an unknown actor even if the asker appears later as object.
    var ex=t.match(/^(?:公司)?(?:是否|有沒有)?(?:有人|某人|有)(女生|女性|男生|男性|異性|女同事|男同事|女性同事|男性同事|異性同事|同事)/);
    if(ex)return ex[1]||'unknown_person';
    if(/^(?:有人|某人)/.test(t))return 'unknown_person';
    var sorted=SUBJECT_WORDS.slice().sort(function(a,b){return b.length-a.length;});
    var atomicPronouns=['我','我們','你','你們','他','她','他們','她們','對方','這個人','那個人'];
    for(var j=0;j<sorted.length;j++){
      var w=sorted[j];
      if(t.indexOf(w)===0){
        // Pronouns are closed-class subjects.  Never absorb modal/predicate material into them
        // (e.g.「我應該留下還是離職」must keep subjectRef=我, not「我應該留下還」).
        if(atomicPronouns.indexOf(w)>=0)return w;
        // A discourse/time marker after a nominal subject is not part of the actor name.
        var tail=t.slice(w.length);
        if([].concat(CONTINUATION,FUTURE,['今天','今日','明天','後天','最近','目前','現在','這次','本次']).some(function(a){return tail.indexOf(a)===0;}))return w;
        // Preserve labels/compound relations before the predicate: 同事甲、同事小美、女友閨蜜.
        // Modal/operators are explicit cut points so grammatical material cannot leak into an entity label.
        var anchors=[].concat(ONTOLOGY.privateState,ONTOLOGY.overtAction,['應該','應不應該','該不該','該','要不要','是否','會不會','有沒有','能不能','可不可以','會','能','可以','可能','有機會','想','要','是','有','對','還是','或者','或是']);
        var cut=-1;
        anchors.forEach(function(a){var k=tail.indexOf(a);if(k>=0&&(cut<0||k<cut))cut=k;});
        if(cut>0&&cut<=6){var compound=(w+tail.slice(0,cut)).replace(/[的之]$/,'').trim();if(compound.length>w.length)return compound;}
        return w;
      }
    }
    // Open-class nominal subject/topic: capture the compact prefix before the first predicate/modal.
    // This lets names and unseen entity labels compose without enumerating every possible person/topic.
    var anchors=[].concat(ONTOLOGY.privateState,ONTOLOGY.overtAction,['是否','會不會','有沒有','能不能','可不可以','會','能','可以','可能','有機會','想','要','是','有']);
    var cut=-1;
    anchors.forEach(function(a){var k=t.indexOf(a);if(k>0&&(cut<0||k<cut))cut=k;});
    if(cut>0&&cut<=12){var nominal=t.slice(0,cut).replace(/^(?:在|關於)/,'').replace(/[的之]$/,'').trim();if(nominal&&!/^(?:會|能|可以|可能|想|要|有機會|有)$/.test(nominal)&&!/(?:為什麼|怎麼|如何|多少|幾|誰|哪個)/.test(nominal))return nominal;}
    return null;
  }
  function inferQuestionDimensions(s){
    var dims=[];
    if(findEvaluationCue(s))dims.push('evaluation');
    if(hasAny(s,LONG_HORIZON))dims.push('continuity');
    if(hasAny(s,REASON))dims.push('reason');
    if(isAdviceCue(s))dims.push('advice');
    if(hasAny(s,TIME_WH))dims.push('timing');
    if(hasAny(s,PERSON_WH))dims.push('identity');
    if(/百分之幾|機率多少|成功率多少|勝率多少|幾成(?:機率)?/.test(s))dims.push('probability');
    if(/幾歲|歲數|年齡(?:是多少|多大|多少)?|幾年次|出生年|出生年月|生日/.test(s))dims.push('age');
    var qty=s.match(/(多少|幾)([^，,。？?；;\s]{0,5})/);
    if(qty){
      var unit=qty[2]||'';
      if(hasAny(unit,ONTOLOGY.ageUnits)||/歲|年次/.test(unit))dims.push('age');
      else if(hasAny(unit,ONTOLOGY.timeUnits)||hasAny(s,TIME_WH))dims.push('timing');
      else if(hasAny(unit,ONTOLOGY.probabilityUnits)||/機率|概率|成功率|勝率/.test(s))dims.push('probability');
      // Unit semantics outrank surrounding topic. 多少張發票 is a count even in a money context.
      else if(hasAny(unit,ONTOLOGY.countUnits))dims.push('count');
      else if(hasAny(unit,ONTOLOGY.moneyUnits)||hasAny(unit,ONTOLOGY.moneyMeasureNouns)||hasAny(s,ONTOLOGY.money))dims.push('amount');
      // Unknown measure words are quantities, not automatically discrete counts.
      else if(unit)dims.push('quantity');
      else dims.push(hasAny(s,ONTOLOGY.money)?'amount':'quantity');
    }
    if(/確切金額|金額多少|多少錢|多少元|多少塊|獎金多少|收入多少|營業額多少|營收多少|薪水多少|薪資多少/.test(s))dims.push('amount');
    if(hasAny(s,ONTOLOGY.profile))dims.push('profile');
    return unique(dims);
  }
  function detectYesNo(s){
    var t=s.replace(/\s+/g,'').replace(/[？?。！!]+$/,'');
    if(/[嗎么]$/.test(t))return true;
    if(YESNO_PREFIX.some(function(w){return t.indexOf(w)===0||t.indexOf(w)>0;}))return true;
    if(/還是(?:不|沒有|不能|不會|不可|不要)/.test(t))return true;
    // Modal-event questions in Chinese often omit 嗎, e.g.「明天會下雨？」
    if(/[？?]$/.test(String(s||'')) && /(?:會|能|可以|可能|可望|有機會)/.test(t) && !/(?:多少|幾|何時|什麼時候|為什麼|如何|怎麼|誰|哪個)/.test(t))return true;
    return false;
  }
  function inferPredicateClass(s,dims){
    var stateHits=matchAllWords(s,ONTOLOGY.privateState), actionHits=matchAllWords(s,ONTOLOGY.overtAction);
    if(dims.indexOf('evaluation')>=0 && !stateHits.length)return 'evaluation';
    if(stateHits.length && !actionHits.length)return 'private_state';
    if(actionHits.length)return 'event_action';
    if(dims.indexOf('reason')>=0)return 'reason_query';
    if(dims.indexOf('advice')>=0)return 'advice_query';
    if(dims.indexOf('timing')>=0)return 'timing_query';
    if(dims.indexOf('profile')>=0||dims.indexOf('identity')>=0||dims.indexOf('age')>=0)return 'profile_query';
    return 'event_or_state';
  }
  function stripSurfaceOperators(s){
    var t=String(s||'');
    var words=[].concat(REASON,ADVICE,TIME_WH,PERSON_WH,YESNO_PREFIX,CONTINUATION);
    words.sort(function(a,b){return b.length-a.length;}).forEach(function(w){t=t.split(w).join(' ');});
    t=t.replace(/[？?。；;！!]/g,' ').replace(/\s+/g,' ').trim();
    return t;
  }

  function splitDiscourseUnits(text){
    var src=String(text||'').trim(), out=[];
    var re=/([^？?。；;！!\n]+)([？?。；;！!\n]+|$)/g,m,order=0;
    while((m=re.exec(src))){
      var body=clean(m[1]),punct=String(m[2]||'').trim();
      if(!body)continue;
      out.push({id:'U'+(++order),text:body,punctuation:punct,raw:m[0].trim(),isQuestionPunct:/[？?]/.test(punct)});
    }
    if(!out.length&&src)out.push({id:'U1',text:clean(src),punct:'',raw:src,isQuestionPunct:/[？?]/.test(src)});
    return out;
  }
  function examplePayload(s){
    var t=String(s||'').trim();
    for(var i=0;i<EXAMPLE_CUES.length;i++)if(t.indexOf(EXAMPLE_CUES[i])===0)return t.slice(EXAMPLE_CUES[i].length).replace(/^[：:,，\s]+/,'').trim();
    return null;
  }
  function reportedSpeechInfo(s){
    var t=String(s||'').trim(), best=null;
    SPEECH_VERBS.forEach(function(v){var k=t.indexOf(v);if(k>0&&(!best||k<best.at))best={verb:v,at:k};});
    if(!best)return null;
    var before=t.slice(0,best.at).trim(),after=t.slice(best.at+best.verb.length).trim(),addressee=null,content=after;
    var addr=after.match(/^(我|我們|你|你們|他|她|他們|她們|對方)/);
    if(addr){addressee=addr[1];content=after.slice(addr[1].length).trim();}
    // A speech-labelled verb may itself be the predicate of the user's question
    // (「他會回覆嗎」).  Reported speech requires a real embedded clause after the verb,
    // not only a sentence particle/punctuation.
    if(!content||/^[嗎呢吧啊呀嘛麼么？?！!。\s]+$/.test(content))return null;
    // A top-level wh-question about the speech act itself (e.g. 她問我什麼) is not reported content.
    if(/(?:什麼|誰|哪個|為什麼|何時|怎麼|如何)(?:[嗎呢]?)$/.test(content)&&!/^(?:可以|能不能|可不可以|要不要|會不會|願不願意|想不想|是否|是不是|有沒有)/.test(content))return null;
    var embeddedQuestion=/(?:嗎|呢)$/.test(content)||/^(?:可以|能不能|可不可以|要不要|會不會|願不願意|想不想|喜不喜歡|愛不愛|該不該|應不應該|是否|是不是|有沒有|能否|會否)/.test(content);
    if(!embeddedQuestion)return null;
    var speakerSurface=before.replace(/(?:跟|和|與)(?:我|我們|你|你們|他|她|他們|她們|對方).*(?:時|時候|期間)?$/,'').trim()||before;
    var speaker=extractSubject(speakerSurface)||normalizeNominalCandidate(speakerSurface);
    return {verb:best.verb,speakerRef:speaker||null,addresseeRef:addressee,content:content,embeddedQuestion:true};
  }
  function propositionPronoun(s){
    var t=String(s||'').trim(),m=t.match(PROPOSITION_PRONOUN_RE);return m?m[0]:null;
  }
  function predicateHead(s){
    var t=String(s||''), terms=[].concat(ONTOLOGY.privateState,ONTOLOGY.overtAction,SPEECH_VERBS),candidates=[];
    terms.sort(function(a,b){return b.length-a.length;}).forEach(function(term){
      var from=0,k;
      while((k=t.indexOf(term,from))>=0){candidates.push({term:term,at:k});from=k+Math.max(1,term.length);}
    });
    candidates.sort(function(a,b){return a.at-b.at||b.term.length-a.term.length;});
    return candidates.length?candidates[0]:null;
  }
  function extractObjectRef(s,subject){
    var t=String(s||'').replace(/[？?。；;！!]/g,'').trim();
    var prep=t.match(/對([^，,。？?；;\s]{1,16}?)(?=(?:有|沒|沒有|很|真|感到|覺得|抱持|產生|喜歡|愛|在乎|有意思|好感))/);
    if(prep&&prep[1])return prep[1].trim();
    var h=predicateHead(t);if(!h)return null;
    var tail=t.slice(h.at+h.term.length).trim();
    tail=tail.replace(/^(?:我|我們|你|你們|他|她|他們|她們)(?=(?:可以|能|會|要|想|需要|叫|稱呼))/,'');
    var prefixOps=[].concat(ACTION_MODIFIERS,['去','來','要','想要','可以','能','會','是否','是不是']);
    prefixOps.sort(function(a,b){return b.length-a.length;});
    var changed=true;
    while(changed){changed=false;for(var pi=0;pi<prefixOps.length;pi++){if(tail.indexOf(prefixOps[pi])===0){tail=tail.slice(prefixOps[pi].length).trim();changed=true;break;}}}
    if(/^還是/.test(tail))return null;
    tail=tail.replace(/(?:嗎|呢|吧|啊|呀)$/,'').trim();
    if(!tail||tail.length>40)return null;
    if(subject&&tail===subject)return null;
    return tail;
  }
  function hasPrivateState(s){
    var t=String(s||'').replace(/愛愛/g,'').replace(/做愛/g,'');
    return hasAny(t,ONTOLOGY.privateState);
  }
  function classifyIllocution(unit,s,dims){
    var ex=examplePayload(s);if(ex!==null)return {type:'example',example:ex};
    var rep=reportedSpeechInfo(s);if(rep)return {type:'context',reportedSpeech:rep,observed:true};
    var prop=propositionPronoun(s);
    var causalHypothesis=!!(prop&&/(?:是)?因為|由於/.test(s)&&detectYesNo((unit&&unit.raw)||s));
    var qmark=!!(unit&&unit.isQuestionPunct), interrogative=qmark||detectYesNo((unit&&unit.raw)||s)||dims.some(function(d){return ['reason','advice','timing','identity','amount','count','quantity','probability','age','profile','evaluation'].indexOf(d)>=0;})||causalHypothesis;
    return {type:interrogative?'question':'context',propositionPronoun:prop,causalHypothesis:causalHypothesis,observed:!interrogative};
  }
  function parseClause(input,index){
    var unit=(input&&typeof input==='object')?input:{text:String(input||''),raw:String(input||''),punctuation:'',isQuestionPunct:/[？?]/.test(String(input||''))};
    var s=clean(unit.text), dims=inferQuestionDimensions(s), entities=extractEntities(s), ill=classifyIllocution(unit,s,dims), propPron=ill.propositionPronoun||null;
    if(ill.causalHypothesis&&dims.indexOf('reason')<0)dims.push('reason');
    var subjectSurface=s;
    if(propPron){var cm=s.match(/(?:因為|由於)(.+)$/);if(cm)subjectSurface=cm[1].trim();}
    var subject=extractSubject(subjectSurface), domains=domainIds(s), evalFrame=ill.causalHypothesis?null:evaluationFrame(s,subject), temporal=horizonProfile(s);
    if(ill.reportedSpeech&&ill.reportedSpeech.speakerRef)subject=ill.reportedSpeech.speakerRef;
    if(evalFrame&&subject&&!PERSONISH.test(subject)&&!/^(?:unknown_person)$/.test(subject))subject=null;
    var frame={
      id:'C'+(index+1),unitId:unit.id||('U'+(index+1)),index:index,text:s,raw:unit.raw||s,punctuation:unit.punctuation||'',
      illocution:ill.type,observed:!!ill.observed,isQuestion:ill.type==='question',isExample:ill.type==='example',exampleRef:null,exampleText:ill.example||null,
      reportedSpeech:ill.reportedSpeech||null,propositionPronoun:propPron,propositionRef:null,causalHypothesis:!!ill.causalHypothesis,
      scope:scope(s),domains:domains,dimensions:unique(dims),
      yesNo:ill.type==='question'&&detectYesNo(unit.raw||s),
      temporal:temporal,
      discourse:{continuation:CONTINUATION.some(function(w){return s.indexOf(w)===0;}),conditional:/^(?:如果|若|假如)|(?:如果|若|假如).*(?:就|才|再)/.test(s)},
      entities:entities,explicitSubjects:subject?[subject]:[],subjectRef:subject,subjectSource:subject?'explicit':'none',coreferenceCandidates:[],
      evaluatorRef:evalFrame&&evalFrame.evaluatorRef||null,targetRef:evalFrame&&evalFrame.targetRef||null,targetSource:evalFrame&&evalFrame.targetRef?'surface':'none',facetRef:null,relationRef:evalFrame&&evalFrame.relation||null,evaluation:evalFrame,
      semanticFrame:evalFrame?'evaluation':null,
      predicateClass:inferPredicateClass(s,dims),predicate:stripSurfaceOperators(s),predicateHead:(predicateHead(s)||{}).term||null,objectRef:null,
      privateState:!evalFrame&&hasPrivateState(s),overtAction:hasAny(s,ONTOLOGY.overtAction),actorBoundFutureEvent:false,
      hidden:/暗|秘密|隱|沒說|未公開|真心|內心|心裡/.test(s)||(!evalFrame&&hasPrivateState(s)),
      confirmedOccurrence:ill.type!=='question'||/(?:已經|已|確定|顯示|確認)(?:[^，,。？?；;]{0,10})(?:中獎|錄取|成交|付款|入帳|到貨|出貨|簽約|發生|成立)|(?:我|他|她|對方)?(?:中了|錄取了|成交了|付款了|入帳了|到了|出貨了|簽約了)/.test(s),
      futureAction:false,
      occurrenceQuery:false,measurement:null,role:ill.type==='question'?'outcome':'context'
    };
    frame.objectRef=extractObjectRef(s,subject);
    if(frame.reportedSpeech){
      frame.predicateClass='reported_speech';frame.predicateHead=frame.reportedSpeech.verb;frame.objectRef=frame.reportedSpeech.content||null;
      frame.privateState=false;frame.overtAction=false;frame.hidden=false;frame.role='context';
    }
    if(frame.isQuestion){
      if(frame.causalHypothesis)frame.role='causal_hypothesis';
      else if(dims.indexOf('reason')>=0)frame.role='reason';
      else if(dims.indexOf('advice')>=0)frame.role='action_advice';
      else if(dims.indexOf('timing')>=0)frame.role='timing';
      else if(dims.indexOf('identity')>=0||dims.indexOf('profile')>=0||dims.indexOf('age')>=0)frame.role='profile';
      else if(evalFrame)frame.role='evaluation';
      else if(frame.privateState)frame.role='hidden_state';
      else if(frame.overtAction||frame.temporal.future)frame.role='future_or_event_action';
    }
    if(dims.indexOf('amount')>=0)frame.measurement='amount';
    else if(dims.indexOf('count')>=0)frame.measurement='count';
    else if(dims.indexOf('quantity')>=0)frame.measurement='quantity';
    else if(dims.indexOf('probability')>=0)frame.measurement='probability';
    else if(dims.indexOf('age')>=0)frame.measurement='age';
    else if(dims.indexOf('timing')>=0)frame.measurement='timing';
    frame.requestedPrecision=frame.measurement?'exact_or_value':((dims.indexOf('identity')>=0)?'exact_identity':((dims.indexOf('profile')>=0)?'qualitative_profile':'symbolic'));
    frame.epistemicScope=frame.privateState?'private_unobserved':(frame.temporal.future?'future_unobserved':'observable_or_present');
    var eventModal=/(?:會|能|可以|可能|可望|有機會|可不可以|能不能|會不會)/.test(s);
    frame.occurrenceQuery=frame.isQuestion&&(frame.yesNo||(eventModal && frame.predicateClass!=='private_state'));
    // futureAction is actor-bound behaviour, not every future event/measurement.
    frame.futureAction=frame.isQuestion&&frame.temporal.future && (frame.overtAction||frame.predicateClass==='event_action');
    return frame;
  }

  function pronounAtStart(text){var m=String(text||'').match(/^(他|她|對方|這個人|那個人)/);return m?m[1]:null;}
  function isPluralCollective(ref){return /(?:[兩二三四五六七八九十幾多][位個名]|多位|數位|一群|們|雙方|兩人|二人)/.test(String(ref||''));}
  function actorCandidatesFromFrame(frame){
    if(!frame)return [];
    var pool=[];
    var ref=String(frame.subjectRef||'').trim();
    if(ref){
      var parts=ref.split(/(?:與|和|跟|及|、)/).map(function(x){return x.trim();}).filter(Boolean);
      if(parts.length>1)pool=pool.concat(parts); else if(!/^(?:我|我們|你|你們)$/.test(ref))pool.push(ref);
    }
    (frame.entities||[]).forEach(function(e){if(!/^(?:我|我們|你|你們|他|她|他們|她們)$/.test(e))pool.push(e);});
    return unique(pool);
  }
  function resolvePronounFromContext(pron, priorFrames){
    for(var k=priorFrames.length-1;k>=0;k--){
      var pf=priorFrames[k], base=actorCandidatesFromFrame(pf);
      if(!base.length)continue;
      // A singular pronoun cannot uniquely resolve a quantified/plural collective whose members were not individually named.
      if(base.length===1 && isPluralCollective(base[0]))return {status:'ambiguous',candidates:[base[0]],sourceIndex:k,reason:'plural_collective'};
      var gendered=base;
      if(pron==='她'){
        var knownFemale=base.filter(function(e){return /(?:女|妻|老婆|媽媽|母|姊|姐|妹|閨蜜|阿姨|姑|婆)/.test(e);});
        var knownMale=base.filter(function(e){return /(?:男|夫|老公|爸爸|父|哥|弟|叔|伯|舅)/.test(e);});
        var unknown=base.filter(function(e){return knownFemale.indexOf(e)<0&&knownMale.indexOf(e)<0;});
        gendered=knownFemale.length?knownFemale:unknown;
      } else if(pron==='他'){
        var km=base.filter(function(e){return /(?:男|夫|老公|爸爸|父|哥|弟|叔|伯|舅)/.test(e);});
        var kf=base.filter(function(e){return /(?:女|妻|老婆|媽媽|母|姊|姐|妹|閨蜜|阿姨|姑|婆)/.test(e);});
        var un=base.filter(function(e){return km.indexOf(e)<0&&kf.indexOf(e)<0;});
        gendered=km.length?km:un;
      }
      gendered=unique(gendered);
      if(gendered.length===1)return {status:'resolved',value:gendered[0],candidates:gendered,sourceIndex:k};
      if(gendered.length>1)return {status:'ambiguous',candidates:gendered,sourceIndex:k,reason:'multiple_candidates'};
      if(base.length===1)return {status:'resolved',value:base[0],candidates:base,sourceIndex:k};
      return {status:'ambiguous',candidates:base,sourceIndex:k,reason:'multiple_candidates'};
    }
    return {status:'unresolved',candidates:[],sourceIndex:null,reason:'no_antecedent'};
  }

  var decision=classifyDecisionQuestion(q), options=[];
  var labels=Array.from(q.matchAll(/(?:^|[\s，,；;、])([A-Z])\s*[:：]\s*([^\n，,；;]+?)(?=[\n，,；;]|(?:\s+[A-Z]\s*[:：])|$)/gi));
  if(labels.length>=2)options=labels.map(function(m){return clean(m[2].replace(/[？?].*$/,'').replace(/(?:哪個|哪一個|何者|要選哪|該選哪).*$/,''));});
  if(!options.length){var bare=q.match(/(?:^|[^A-Za-z])((?:[A-Z]\s*、\s*){2,}[A-Z])(?:$|[^A-Za-z])/i);if(bare)options=bare[1].split(/\s*、\s*/).map(function(x){return x.toUpperCase();});}
  if(decision.kind==='binary')options=[decision.left,decision.right];
  if(decision.kind==='multiple'&&options.length<3){
    var surface=q.replace(/^(?:我)?(?:該|應該|應不應該|要)(?:選擇|選)?/,'').replace(/^.*?(?:選項(?:是|有)?|方案(?:是|有)?)\s*[:：]/,'').replace(/^(?:我)?(?:有|的)?(?:選項|方案)(?:是|有|為)?\s*/,'').replace(/(?:我)?(?:應該|應|該)?(?:選擇|選|要選|要)(?=[^，,；;]*還是)/,'').replace(/(?:哪個|哪一個|何者|三選一|四選一|五選一|六選一|比較適合|比較好|較適合).*$/,'');
    options=surface.split(/、|還是|或是|或者|[，,；;\n]/).map(clean).filter(Boolean);
    if(options.some(function(s){return s.length>60;})||options.length<3)options=[];
  }
  options=unique(options);

  // Discourse segmentation keeps punctuation metadata so an embedded/reported question can be distinguished from a top-level user question.
  var units=splitDiscourseUnits(q), parts=units.map(function(u){return u.text;});
  var frames=units.map(parseClause), links=[], dependencies=[];

  // Attach example fragments to the nearest preceding content unit. Examples enrich a proposition; they never become question branches on their own.
  for(var exi=0;exi<frames.length;exi++)if(frames[exi].isExample){
    for(var exj=exi-1;exj>=0;exj--)if(!frames[exj].isExample){frames[exi].exampleRef=frames[exj].id;links.push({from:exj,to:exi,type:'example_of',dependency:false});break;}
  }

  // Entity–relation–facet resolution. This is deliberately domain-independent: a later compact property
  // such as「交期穩定嗎」「租金合理嗎」「薪資好嗎」is attached as a facet of the previously evaluated target.
  for(var fi=0;fi<frames.length;fi++){
    var ff=frames[fi];
    if(ff.evaluation&&ff.evaluation.evaluatorRef&&!ff.evaluatorRef)ff.evaluatorRef=ff.evaluation.evaluatorRef;
    if(fi===0)continue;
    var fp=frames[fi-1];
    if(ff.semanticFrame==='evaluation'){
      if(!ff.targetRef && fp.targetRef){ff.targetRef=fp.targetRef;ff.targetSource='inherited_target';}
      else if(ff.targetRef && fp.targetRef && ff.targetRef!==fp.targetRef && !isExplicitEntitySurface(ff.targetRef) && !PERSONISH.test(ff.targetRef) && ff.targetRef.length<=10 && !FACET_STOP.test(ff.targetRef)){
        ff.facetRef=ff.targetRef;ff.targetRef=fp.targetRef;ff.targetSource='facet_inheritance';
        links.push({from:fi-1,to:fi,type:'same_target_facet_bundle',dependency:false,actorBinding:'same_target',targetRef:ff.targetRef,facetRef:ff.facetRef,fromRole:fp.role,toRole:ff.role});
      } else if(ff.targetRef===fp.targetRef && ff.evaluation && fp.evaluation){
        links.push({from:fi-1,to:fi,type:'same_target_evaluation_bundle',dependency:false,actorBinding:'same_target',targetRef:ff.targetRef,fromRole:fp.role,toRole:ff.role});
      }
    }
  }

  // Discourse/entity/proposition coreference. Entity anaphora and proposition anaphora are different graphs.
  function latestContentFrame(before){for(var k=before.length-1;k>=0;k--)if(!before[k].isExample)return before[k];return null;}
  function latestActorFrame(before){for(var k=before.length-1;k>=0;k--){var f=before[k];if(f.subjectRef&&!/^(?:我|我們|你|你們)$/.test(f.subjectRef))return f;}return null;}
  for(var i=0;i<frames.length;i++){
    var cur=frames[i], prior=frames.slice(0,i), prev=latestContentFrame(prior);
    if(cur.isExample)continue;
    if(cur.propositionPronoun){
      var ant=latestContentFrame(prior);
      if(ant){cur.propositionRef=ant.id;links.push({from:ant.index,to:i,type:'proposition_coreference',dependency:false,fromRole:ant.role,toRole:cur.role});}
    }
    var pron=pronounAtStart(cur.text);
    if(!pron&&cur.propositionPronoun){var causal=cur.text.match(/(?:因為|由於)(他|她|對方|這個人|那個人)/);pron=causal?causal[1]:null;}
    if(pron&&prior.length){
      var coref=resolvePronounFromContext(pron,prior);
      if(coref.status==='resolved'){
        cur.subjectRef=coref.value;cur.subjectSource='coreference';cur.coreferenceCandidates=coref.candidates.slice();
      } else if(coref.status==='ambiguous'){
        cur.subjectRef=pron;cur.subjectSource='surface_pronoun_ambiguous_context';cur.coreferenceCandidates=coref.candidates.slice();
      } else {
        // A pronoun may be deictic to a person known to the user but not named in the current text.
        cur.subjectRef=pron;cur.subjectSource='surface_pronoun_external';cur.coreferenceCandidates=[];
      }
    }
    // Subjectless continuation inherits the most recent salient actor, but this is discourse continuity, not logical dependency.
    if(cur.isQuestion&&!cur.subjectRef&&cur.subjectSource!=='ambiguous_coreference'&&cur.subjectSource!=='unresolved_coreference'&&(cur.discourse.continuation||cur.temporal.future||cur.propositionRef)){
      var af=latestActorFrame(prior);
      if(af){cur.subjectRef=af.subjectRef;cur.subjectSource='inherited_discourse_actor';links.push({from:af.index,to:i,type:'actor_coreference',dependency:false,actorBinding:'inherit_previous'});}
    }
    if(!cur.targetRef&&prev&&prev.targetRef&&(cur.discourse.continuation||cur.discourse.conditional||cur.role==='reason'||cur.role==='action_advice'||cur.role==='timing'||cur.role==='evaluation')){
      cur.targetRef=prev.targetRef;cur.targetSource='inherited_target';
    }
    cur.actorBoundFutureEvent=!!(cur.isQuestion&&cur.temporal&&cur.temporal.future&&cur.subjectRef&&!cur.privateState&&!cur.measurement&&['reason','action_advice','timing','profile','causal_hypothesis'].indexOf(cur.role)<0);
    if(cur.actorBoundFutureEvent&&cur.role==='outcome')cur.role='future_or_event_action';
    if(!prev)continue;
    var disjointDomains=cur.domains.length&&prev.domains.length&&cur.domains.every(function(d){return prev.domains.indexOf(d)<0;});
    var sameActor=!!cur.subjectRef&&!!prev.subjectRef&&cur.subjectRef===prev.subjectRef;
    var sameTarget=!!cur.targetRef&&!!prev.targetRef&&cur.targetRef===prev.targetRef;

    // Same-target facet/evaluation bundles are one evaluative question, not a conditional dependency.
    if(cur.isQuestion&&prev.isQuestion&&cur.semanticFrame==='evaluation'&&prev.semanticFrame==='evaluation'&&sameTarget){
      if(!links.some(function(e){return e.from===prev.index&&e.to===i&&/^same_target_/.test(e.type);}))links.push({from:prev.index,to:i,type:'same_target_evaluation_bundle',dependency:false,actorBinding:'same_target',targetRef:cur.targetRef,fromRole:prev.role,toRole:cur.role});
      continue;
    }
    // Open why/how/timing follow-ups attach to the prior event. A yes/no causal hypothesis is its own proposition and is not merged with the next unrelated question.
    if(cur.isQuestion&&!cur.causalHypothesis&&['reason','action_advice','timing'].indexOf(cur.role)>=0&&!disjointDomains){
      links.push({from:prev.index,to:i,type:'event_to_'+cur.role,dependency:false,actorBinding:sameActor?'same_actor':'event_context',fromRole:prev.role,toRole:cur.role});
      continue;
    }
    // Explicit conditionals are genuine logical dependencies.
    if(cur.isQuestion&&cur.discourse.conditional&&prev.isQuestion){
      dependencies.push({from:prev.index,to:i,type:'explicit_condition',dependency:true,actorBinding:sameActor?'same_actor':'event_context',fromRole:prev.role,toRole:cur.role});
      continue;
    }
    // Hidden-state -> later action is a dependency only when the later clause inherits a missing participant/object
    // from the first proposition. If the later action supplies its own explicit object (e.g. fantasy -> agree to 3P), they are separate questions.
    if(cur.isQuestion&&prev.isQuestion&&prev.privateState&&(cur.futureAction||cur.actorBoundFutureEvent)&&sameActor&&!disjointDomains){
      if(!cur.objectRef&&prev.objectRef){cur.objectRef=prev.objectRef;cur.objectSource='inherited_discourse_object';}
      var sameObject=!!cur.objectRef&&!!prev.objectRef&&cur.objectRef===prev.objectRef;
      var existentialActor=/^(?:unknown_person|女生|女性|男生|男性|異性|女同事|男同事|女性同事|男性同事|異性同事)$/.test(String(prev.subjectRef||''));
      if((sameObject||existentialActor)&&!cur.causalHypothesis){
        dependencies.push({from:prev.index,to:i,type:'hidden_state_to_future_action_same_actor',dependency:true,actorBinding:'same_actor',objectRef:cur.objectRef||prev.objectRef||null,fromRole:prev.role,toRole:cur.role});
      } else {
        links.push({from:prev.index,to:i,type:'same_actor_followup',dependency:false,actorBinding:'same_actor',fromRole:prev.role,toRole:cur.role});
      }
    } else if(cur.isQuestion&&prev.isQuestion&&(cur.discourse.continuation||sameActor)&&!disjointDomains){
      links.push({from:prev.index,to:i,type:'discourse_continuation',dependency:false,actorBinding:sameActor?'same_actor':'inherit_previous',fromRole:prev.role,toRole:cur.role});
    }
  }

  // Operator follow-ups (reason/advice/timing) attach to the nearest compatible prior event, not merely the immediately previous clause.
  // This keeps chains such as「會成功嗎？何時？有什麼阻礙？」as one event graph while still respecting explicit domain switches.
  frames.forEach(function(cur,i){
    if(i===0||['reason','action_advice','timing'].indexOf(cur.role)<0)return;
    if(links.some(function(e){return e.to===i&&/^event_to_/.test(e.type);}))return;
    for(var j=i-1;j>=0;j--){
      var prev=frames[j];
      var anchor=!!(prev.occurrenceQuery||prev.futureAction||prev.privateState||prev.role==='outcome'||prev.role==='future_or_event_action'||prev.role==='hidden_state');
      if(!anchor)continue;
      var incompatible=cur.domains.length&&prev.domains.length&&cur.domains.every(function(d){return prev.domains.indexOf(d)<0;});
      if(incompatible)continue;
      links.push({from:j,to:i,type:'event_to_'+cur.role,dependency:false,actorBinding:cur.subjectRef&&prev.subjectRef&&cur.subjectRef===prev.subjectRef?'same_actor':'event_context',fromRole:prev.role,toRole:cur.role});
      break;
    }
  });

  // A single clause can contain occurrence + measure, e.g.「會中多少」. Represent the dependency explicitly.
  frames.forEach(function(f,i){
    if(f.measurement && !f.confirmedOccurrence && /(會|能|可以|可能|有機會|中|拿|領|得|收|賺|入帳|獲得)/.test(f.text)){
      dependencies.push({from:i,to:i,type:'occurrence_to_measurement_same_clause',dependency:true,actorBinding:f.subjectRef?'same_actor':'event',fromRole:'outcome',toRole:f.measurement});
    }
  });

  var queryIndices=frames.map(function(f,i){return f.isQuestion?i:null;}).filter(function(i){return i!==null;});
  // Question grouping uses only semantic-unifying links/dependencies. Mere actor continuity does not merge independent predicates.
  var parent=frames.map(function(_,i){return i;});
  function find(x){while(parent[x]!==x){parent[x]=parent[parent[x]];x=parent[x];}return x;}
  function union(a,b){a=find(a);b=find(b);if(a!==b)parent[b]=a;}
  links.concat(dependencies).forEach(function(e){
    if(e.from===e.to)return;
    var merge=!!e.dependency||/^(?:same_target_facet_bundle|same_target_evaluation_bundle|event_to_reason|event_to_action_advice|event_to_timing|diagnostic_bundle)$/.test(e.type);
    if(merge&&frames[e.from]&&frames[e.to]&&frames[e.from].isQuestion&&frames[e.to].isQuestion)union(e.from,e.to);
  });
  var components=unique(queryIndices.map(function(i){return find(i);}));

  var globalScope=scope(parts[0]||q), groups=[];
  function contextFor(indices){
    var first=Math.min.apply(Math,indices), refs=[];
    frames.forEach(function(f){if(f.index<first&&(f.illocution==='context'||f.isExample))refs.push(f.id);});
    indices.forEach(function(i){var f=frames[i];if(f.propositionRef&&refs.indexOf(f.propositionRef)<0)refs.push(f.propositionRef);});
    return unique(refs);
  }
  function groupFromFrames(indices){
    var texts=indices.map(function(i){return frames[i].text;}), entities=unique(indices.map(function(i){return frames[i].targetRef||frames[i].subjectRef;}).filter(Boolean));
    return {id:'SUBJECT_'+(groups.length+1),question:texts.join('；'),entity:entities.join('、'),scope:unique(indices.map(function(i){return frames[i].scope;}).filter(Boolean)).join('、')||globalScope,scopeInherited:!indices.some(function(i){return !!frames[i].scope;})&&!!globalScope,clauseIndices:indices,contextRefs:contextFor(indices)};
  }
  if(!options.length&&queryIndices.length){
    components.forEach(function(root){var idxs=queryIndices.filter(function(i){return find(i)===root;});if(idxs.length)groups.push(groupFromFrames(idxs));});
  }
  // If no explicit interrogative unit exists, treat the final non-example proposition as the user's open question rather than inventing branches.
  if(!options.length&&!groups.length&&frames.length){var fallback=frames.map(function(f,i){return !f.isExample?i:null;}).filter(function(i){return i!==null;});if(fallback.length)groups.push(groupFromFrames([fallback[fallback.length-1]]));}
  var coordinatedActors=extractCoordinatedActors(q);
  // Actor identity comes from grammatical/topic subjects, not every entity mention (objects such as「我」must not become branches).
  var namedActors=unique(coordinatedActors.concat(frames.filter(function(f){return f.isQuestion;}).map(function(f){return f.subjectRef;}).filter(Boolean)));
  if(groups.length===1&&coordinatedActors.length>=2){
    groups=coordinatedActors.map(function(actor,i){return {id:'SUBJECT_'+(i+1),question:actor+'：'+q,entity:actor,scope:globalScope,scopeInherited:false,clauseIndices:frames.map(function(_,k){return k;})};});
  }

  var ambiguities=[];
  frames.forEach(function(f){if(f.subjectSource==='surface_pronoun_ambiguous_context')ambiguities.push({clause:f.index,type:f.subjectSource,candidates:(f.coreferenceCandidates||[]).slice(),text:f.text});});
  var notes=[],criticalIssues=[];
  if(ambiguities.length)notes.push('有代名詞尚未唯一對應；語義圖保留候選，不把它硬綁成某個人物。');
  if(decision.kind==='multiple'&&!options.length)notes.push('比較題已辨識為多方案決策，但原文沒有提供可綁定的完整方案；保留缺失槽位，不自行造出選項。');
  if(decision.kind==='incomplete')notes.push('比較題只辨識到部分方案；不自行補造缺少的選項。');
  var mode=options.length>2?'multi_option':options.length===2?'binary':groups.length>1?'multi_question':'single';
  var firstOptionAt=options.length?q.indexOf(options[0]):-1,choiceScope=firstOptionAt>=0?scope(q.slice(0,firstOptionAt)):'';
  var branches=options.length?options.map(function(s,i){return {id:'OPTION_'+(i+1),question:s,entity:s,scope:scope(s)||choiceScope,scopeInherited:!scope(s)&&!!choiceScope};}):groups;

  var allDims=unique(frames.reduce(function(acc,f){return acc.concat(f.dimensions);},[]));
  var allDomains=unique(frames.reduce(function(acc,f){return acc.concat(f.domains);},[]));
  var daily=/(?:每日|日常)(?:提醒|指引|訊息|信息|主題|運勢)|(?:今天|今日)(?:的)?(?:整體)?(?:運勢|提醒|指引|訊息|信息|主題|牌訊|牌卡)|(?:今天|今日).*(?:該注意什麼|需要注意什麼|有什麼提醒|有何提醒)/.test(q) && !frames.some(function(f){return f.yesNo||f.measurement||f.privateState||f.overtAction;});
  var monthly=/(?:每個月|每月|各月份|逐月|(?:十二|12)個月).*(?:運勢|趨勢|走向|主題|提醒|工作|感情|財運|牌)/.test(q);
  var hiddenState=frames.some(function(f){return f.isQuestion&&f.privateState&&f.hidden;});
  var futureAction=frames.some(function(f){return f.isQuestion&&f.futureAction;});
  var futureActorEvent=frames.some(function(f){return f.isQuestion&&(f.futureAction||f.actorBoundFutureEvent);});
  var dependent=dependencies.length>0;
  var unresolved=[];
  frames.forEach(function(f){
    if(!f.isQuestion)return;
    if(!f.predicate && !f.dimensions.length)unresolved.push({clause:f.index,reason:'predicate_unresolved'});
    if(f.semanticFrame==='evaluation'&&!f.targetRef)unresolved.push({clause:f.index,reason:'evaluation_target_unresolved'});
  });
  var unresolvedEval=unresolved.filter(function(u){return u.reason==='evaluation_target_unresolved';});
  if(unresolvedEval.length)notes.push('評估題的對象未唯一定位；語義圖保留未解析節點，不自行捏造對象。');
  // Missing required arguments are structural incompleteness, not an arbitrary policy cap.
  // Keep the parsed graph, but do not claim an executable multi-option plan when no options were supplied.
  var missingDecisionOptions=decision.kind==='multiple'&&!options.length;
  if(missingDecisionOptions)criticalIssues.push({reason:'decision_options_missing',required:'three_or_more_explicit_options'});
  var parseReady=queryIndices.length>0||options.length>0||frames.length>0;
  var ready=parseReady&&!missingDecisionOptions;
  var coverageStatus=missingDecisionOptions?'incomplete':(ambiguities.length?'ambiguous':(unresolved.length?'partial':'resolved'));
  var contract={version:'4.0.0',policy:'typed_graph_with_required_slot_validation',parseReady:parseReady,ready:ready,criticalIssues:criticalIssues,warnings:unresolved.slice(),branchCount:groups.length||options.length};
  var entityNodeMap={},entityNodes=[],relationEdges=[];
  function ensureNode(kind,label){if(!label)return null;var key=kind+':'+label;if(entityNodeMap[key])return entityNodeMap[key];var node={id:'N'+(entityNodes.length+1),kind:kind,label:label};entityNodeMap[key]=node;entityNodes.push(node);return node;}
  frames.forEach(function(f){
    var clauseNode=ensureNode('clause',f.id), evaluatorNode=ensureNode('evaluator',f.evaluatorRef), targetNode=ensureNode('entity',f.targetRef), facetNode=ensureNode('facet',f.facetRef);
    if(evaluatorNode)relationEdges.push({from:evaluatorNode.id,to:clauseNode.id,type:'evaluator_of'});
    if(targetNode)relationEdges.push({from:clauseNode.id,to:targetNode.id,type:'targets'});
    if(facetNode&&targetNode)relationEdges.push({from:facetNode.id,to:targetNode.id,type:'facet_of'});
    if(f.relationRef&&targetNode)relationEdges.push({from:clauseNode.id,to:targetNode.id,type:'relation',label:f.relationRef});
  });

  var semantic={
    version:'4.0.0',status:coverageStatus,
    clauses:frames,
    graph:{nodes:frames.map(function(f){return {id:f.id,unitId:f.unitId,illocution:f.illocution,role:f.role,semanticFrame:f.semanticFrame,subjectRef:f.subjectRef,subjectSource:f.subjectSource,objectRef:f.objectRef,propositionRef:f.propositionRef,exampleRef:f.exampleRef,reportedSpeech:f.reportedSpeech,evaluatorRef:f.evaluatorRef,targetRef:f.targetRef,targetSource:f.targetSource,facetRef:f.facetRef,relationRef:f.relationRef,evaluation:f.evaluation,predicateClass:f.predicateClass,predicateHead:f.predicateHead,dimensions:f.dimensions,domains:f.domains,temporal:f.temporal,actorBoundFutureEvent:!!f.actorBoundFutureEvent,measurement:f.measurement,requestedPrecision:f.requestedPrecision,epistemicScope:f.epistemicScope};}),edges:links.concat(dependencies),discourseLinks:links,dependencies:dependencies,entityNodes:entityNodes,relationEdges:relationEdges},
    topology:{clauseCount:frames.length,questionCount:queryIndices.length,contextCount:frames.filter(function(f){return f.illocution==='context';}).length,exampleCount:frames.filter(function(f){return f.isExample;}).length,componentCount:components.length,dependent:dependent,maxDependencyDepth:(function(){var depth=1;for(var k=0;k<frames.length;k++){var d=1,cur=k,seen={};while(true){var e=dependencies.find(function(x){return x.to===cur&&x.from!==x.to&&!seen[x.from+'>'+x.to];});if(!e)break;seen[e.from+'>'+e.to]=1;d++;cur=e.from;}if(d>depth)depth=d;}return depth;})(),dimensions:allDims,domains:allDomains,targets:unique(frames.map(function(f){return f.targetRef;}).filter(Boolean)),facets:unique(frames.map(function(f){return f.facetRef;}).filter(Boolean)),relations:unique(frames.map(function(f){return f.relationRef;}).filter(Boolean)),longTerm:frames.some(function(f){return !!(f.temporal&&f.temporal.horizon==='long_term');}),continuity:frames.some(function(f){return !!(f.temporal&&f.temporal.continuity);}),evaluation:frames.some(function(f){return f.semanticFrame==='evaluation';})},
    claims:{hiddenState:hiddenState,futureAction:futureAction,futureActorEvent:futureActorEvent},
    unresolved:unresolved,ambiguities:ambiguities,contract:contract
  };

  return {
    version:'4.0.0',originalQuestion:raw,normalizedQuestion:q,mode:mode,decisionKind:decision.kind,options:options,
    actors:namedActors,branches:branches,clauses:frames,dependencies:dependencies,discourseLinks:links,ready:ready,notes:notes,contract:contract,
    scope:globalScope,monthly:monthly,daily:daily,semantic:semantic
  };
}

function recommendReadingSystem(question) {
  var q=String(question||'').trim(), plan=analyzeReadingQuestion(q);
  if(!q)return {system:null,label:'',reason:'輸入問題後推薦',plan:plan};
  var rules=[['lenormand','雷諾曼',/雷諾曼|雷诺曼|lenormand/i],['tarot','塔羅',/塔羅|塔罗|tarot|RWS|Book\s*T|Golden\s*Dawn/i],['oracle','靈籤',/靈籤|灵签|求籤|求签|籤詩|签诗/],['meihua','梅花易數',/梅花/],['liuyao','六爻占卜',/六爻|六卦|納甲|纳甲|文王卦/],['yijing','易經占卜',/易經|易经|周易|卦爻辭|卦爻辞|蓍草|揲蓍|大衍筮法/],['ziwei','紫微斗數',/紫微/],['bazi','八字',/八字|四柱|大運|大运/],['vedic','印度占星',/印度占星|吠陀占星|Jyotish|Vedic/i],['astro','西洋占星',/西洋占星|西方占星|Western astrology|星盤|星盘|占星|行星|上升星座/i]];
  var requests=[],exclusions={};
  q.split(/[，,。；;！？?\n]/).forEach(function(clause,order){
    rules.forEach(function(rule){if(rule[0]==='astro'&&/印度占星|吠陀占星|Jyotish|Vedic/i.test(clause)&&!/西洋|西方|Western/i.test(clause))return;var m=clause.match(rule[2]);if(!m)return;var before=clause.slice(0,m.index);
      if(/以前|上次|之前|曾經/.test(before))return;
      if(/(?:不要(?:用|使用)?|不用|不使用|不想用|別用|排除)\s*$/.test(before)){exclusions[rule[0]]=true;return;}
      if(!before.trim()||/(?:用|使用|採用|改用|想用|請)\s*$/.test(before)){delete exclusions[rule[0]];requests.push({rule:rule,order:order,at:m.index});}
    });
  });
  requests.sort(function(a,b){return a.order-b.order||a.at-b.at;});
  requests=requests.filter(function(r){return !exclusions[r.rule[0]];});
  var explicit=requests.length?requests[requests.length-1].rule:null;
  var result;
  if(explicit)result={system:explicit[0],label:explicit[1],reason:'依你明確指定的解讀系統',explicit:true};
  else if(/月建|月破|旬空|世應|世应|用神.*(?:起卦|銅錢|铜钱)|(?:起卦|銅錢|铜钱).*用神/.test(q))result={system:'liuyao',label:'六爻占卜',reason:'你要比較一件事的用神、月日與動變條件，適合六爻納甲'};
  else if(/蓍草|揲蓍|大衍筮法|卦辭|卦辞|爻辭|爻辞|用九|用六|進退.*時義|进退.*时义/.test(q))result={system:'yijing',label:'易經占卜',reason:'問題著重卦爻辭的處境與進退分寸，適合周易變占'};
  else if(/(?:時間|時間數|數字|数字|漢字|汉字).{0,5}起卦/.test(q))result={system:'meihua',label:'梅花易數',reason:'你希望用時間、數字或文字起卦，適合梅花易數'};
  else if(/起卦|擲錢|掷钱|銅錢|铜钱/.test(q))result={system:'liuyao',label:'六爻占卜',reason:'你希望起卦看一件事，先推薦三錢六爻；也可自行選擇易經卦爻辭或梅花易數'};
  else if(/出生|命格|一生|先天|流年|命盤/.test(q))result={system:'bazi',label:'八字／紫微',reason:'問題重點是先天傾向或長期週期，需先提供出生資料'};
  else if(/指引|啟示|提醒|該以什麼心態/.test(q)&&!/(?:感受|內心|心理|原因)/.test(q))result={system:'oracle',label:'靈籤',reason:'你要的是一個主題的提醒與行動方向'};
  else if(/內心|感受|心態|自我|心理|關係|暗戀|愛我|喜歡我|為什麼|抉擇|該不該/.test(q)||plan.options.length)result={system:'tarot',label:'塔羅',reason:'適合分開看處境、互動、阻力與選擇條件'};
  else if(/聯絡|消息|包裹|合約|工作|搬家|會面|何時|進展|事情|尋物|遺失|中獎|開獎|發票|抽獎|獎金|付款|入帳|到貨|出貨|訂單|錄取|升遷/.test(q))result={system:'lenormand',label:'雷諾曼',reason:'問題聚焦具體事件、連續發展與周邊條件'};
  else result={system:'tarot',label:'塔羅',reason:'開放式問題先以具名牌位整理重點'};
  if(exclusions[result.system]){
    var options=/出生|命格|一生|先天|流年|命盤/.test(q)?['bazi','ziwei','astro','vedic']:['tarot','lenormand','oracle','yijing','liuyao','meihua'];
    var alternative=options.find(function(id){return !exclusions[id];});
    var selected=rules.find(function(r){return r[0]===alternative;});
    result=selected?{system:selected[0],label:selected[1],reason:'已排除你不想使用的系統，可用此法整理本題，再依資料決定解讀範圍'}:{system:null,label:'暫無推薦',reason:'適用的系統均被排除，請保留一種方法或自行選擇'};
  }
  result.excludedSystems=Object.keys(exclusions);result.plan=plan;result.readingMode='rws_reversals';
  q.split(/[，,。；;！？?\n]/).forEach(function(clause){
    var m=clause.match(/Book\s*T|Golden\s*Dawn|黃金黎明|元素尊貴|RWS|正逆位/i);if(!m)return;
    var before=clause.slice(0,m.index);if(/以前|上次|之前|曾經/.test(before))return;
    var neg=/(?:不要(?:用|使用)?|不用|不使用|不想用|別用|排除)\s*$/.test(before),rws=/RWS|正逆位/i.test(m[0]);
    if(!neg)result.readingMode=rws?'rws_reversals':'gd_book_t';
  });
  result.birthDataRequired=/^(bazi|ziwei|astro|vedic)$/.test(result.system);
  return result;
}
