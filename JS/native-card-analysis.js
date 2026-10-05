(function(root){
  'use strict';
  const arr=x=>Array.isArray(x)?x:[],copy=x=>x==null?null:JSON.parse(JSON.stringify(x));
  function tarot(raw){
    const d=raw.tarotData||raw,cards=arr(d.cards),rws=d.sourceProfile==='rws_reversals'||d.readingMode==='rws_reversals';
    if(!cards.length||new Set(cards.map(c=>c.id)).size!==cards.length||cards.some(c=>!Number.isInteger(c.id)||c.id<0||c.id>77))throw Error('塔羅發牌紀錄缺漏、重複或牌號無效。');
    const register=arr(typeof TAROT==='undefined'?root.TAROT:TAROT);
    const records=cards.map((c,i)=>{const p=register.find(x=>x.id===c.id),slot=arr(d.methodPlan?.slots)[i]||{};if(rws&&!p)throw Error('RWS牌義表沒有此牌。');return {index:i+1,id:c.id,name:c.name||c.n,position:c.position||c.pos||slot.label||'位置'+(i+1),direction:rws?(c.isUp===true?'正位':c.isUp===false?'逆位':'方向未記錄'):'Book T，不套RWS逆位',keywords:rws&&typeof c.isUp==='boolean'?String(c.isUp?p.kwUp:p.kwRv).split('·'):[],binding:copy(c.binding||c.slotBinding||slot.binding),suit:c.suit||p?.suit,rank:c.rank||p?.rank,number:p?.num};});
    const groups={},ranks={};for(const r of records){const k=r.binding?.eventId||'QUERY_EVENT';(groups[k]||(groups[k]=[])).push(r.index);if(r.suit!=='major')(ranks[r.rank]||(ranks[r.rank]=[])).push(r.index);}
    return {records,eventGroups:Object.entries(groups).map(([eventId,positions])=>({eventId,positions})),rankEchoes:Object.entries(ranks).filter(([,p])=>p.length>1).map(([rank,positions])=>({rank,positions})),majorPositions:records.filter(r=>r.suit==='major').map(r=>r.index),courtPositions:records.filter(r=>['page','knight','queen','king'].includes(r.rank)).map(r=>r.index),methodData:copy(d.methodData),drawProcedure:copy(d.drawProcedure),policy:'逐張實際牌位、方向與議題綁定；關鍵詞不是成功率或他人心意的證明。'};
  }
  function lenormand(raw){
    const d=raw.lenormandData||raw,cards=arr(d.cards||d.drawn),ids=cards.map(c=>c.id??c.n);
    if(!cards.length||new Set(ids).size!==cards.length||ids.some(x=>!Number.isInteger(x)||x<1||x>36))throw Error('雷諾曼牌面缺漏、重複或牌號無效。');
    if(d.expectedCount!=null&&d.expectedCount!==cards.length)throw Error('實際牌數與牌陣不一致。');
    const records=cards.map((c,i)=>({index:i+1,id:ids[i],name:c.name||c.zh||c.n,position:copy(c.position||c.pos),meaning:copy(c.meaning||c.keywords||c.kw||c.k),guard:c.guard||null}));
    const spread=d.spreadType||d.spread,paths=[],mirror=[],knights=[],neighbors=[];
    const layoutCounts={two:2,three:3,five:5,seven:7,choice:7,nine:9,grand:36,grand_nines:36};
    if(spread!=='branches'&&(!Object.hasOwn(layoutCounts,spread)||cards.length!==layoutCounts[spread]))throw Error('實際牌數與具名雷諾曼牌陣不一致。');
    if(['two','three','five','seven'].includes(spread)){paths.push(records.map(r=>r.index));for(let i=0;i<Math.floor(records.length/2);i++)mirror.push({a:i+1,b:records.length-i,axis:'line'});}
    else if(spread==='choice')paths.push([1,2,3],[5,6,7]);
    else if(spread==='branches'){if(records.length%3)throw Error('分線牌陣沒有完整的三張分線。');for(let i=0;i<records.length;i+=3)paths.push([i+1,i+2,i+3]);}
    else if(['nine','grand','grand_nines'].includes(spread)){
      const w=spread==='nine'?3:spread==='grand'?8:9,h=spread==='nine'?3:4,n=w*h;
      if(records.length!==(spread==='grand'?36:n))throw Error('格狀牌陣未完整發牌。');
      const at=(r,c)=>r>=0&&r<h&&c>=0&&c<w?r*w+c+1:null;
      for(let i=0;i<n;i++){
        const r=Math.floor(i/w),c=i%w,p=i+1;
        for(const [dr,dc]of [[0,1],[1,0],[1,1],[1,-1]]){if(at(r-dr,c-dc))continue;const line=[];for(let y=r,x=c,q;(q=at(y,x));y+=dr,x+=dc)line.push(q);if(line.length>1)paths.push(line);}
        for(const [y,x,axis]of [[r,w-1-c,'horizontal'],[h-1-r,c,'vertical']]){const q=at(y,x);if(p<q)mirror.push({a:p,b:q,axis});}
        for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){const q=at(r+dr,c+dc);if((dr||dc)&&q&&p<q)neighbors.push({a:p,b:q});}
        for(const [dr,dc]of [[1,2],[1,-2],[-1,2],[-1,-2],[2,1],[2,-1],[-2,1],[-2,-1]]){const q=at(r+dr,c+dc);if(q&&p<q)knights.push({a:p,b:q});}
      }
      if(spread==='grand'){paths.push([33,34,35,36]);mirror.push({a:33,b:36,axis:'tail'},{a:34,b:35,axis:'tail'});neighbors.push({a:33,b:34},{a:34,b:35},{a:35,b:36});}
    }else throw Error('沒有明列合法雷諾曼布局。');
    const adjacent=[],segments=[];paths.forEach((p,branch)=>{for(let i=0;i<p.length-1;i++){const key=p[i]+'/'+p[i+1];if(!adjacent.some(x=>x.key===key))adjacent.push({key,from:p[i],to:p[i+1]});for(let j=i+2;j<=p.length;j++)segments.push({path:branch+1,positions:p.slice(i,j),cards:p.slice(i,j).map(k=>records[k-1].name)});}});
    return {records,paths,adjacent,segments,mirror,knights,neighbors,commonContext:spread==='choice'?4:null,methodData:copy(d.methodData||d.nativeMethodData),geometry:copy(d.geometry),policy:'本布局實算全部合法連續片段、鏡像、鄰接與騎士步；8×4主盤與尾排分開，不跨接選項分線。'};
  }
  const OOTK_LAYER_SPEC={
    op1:{index:1,stage:'當下基底',questionRole:'以代表牌落域、第一次合法計數、配對與尊貴建立原題當下最先成立的基底；回答現在最主要的狀態、印象或條件，不把待確認主線冒充已確認。'},
    op2:{index:2,stage:'互動與發展機制',questionRole:'讀問題如何在第二次操作的實際宮位／領域中展開，交代互動、訊息、行動或環境力量如何推進、加速、受阻或轉向。'},
    op3:{index:3,stage:'結構條件與進一步發展',questionRole:'讀第三次操作揭出的更深層結構、規範、角色條件或持續門檻；說清前一輪的力量能否被承接，以及哪個條件會改變走向。'},
    op4:{index:4,stage:'累積張力與倒數整合',questionRole:'用三十六牌環的合法計數、配對與元素尊貴讀多股力量如何互相強化、消耗、牽制或形成轉折；指出真正的核心張力與可介入處。'},
    op5:{index:5,stage:'最終落點與態度',questionRole:'讀第五次操作的生命樹落點、合法計數、配對與尊貴，形成五輪收束後最支持的方向、態度或結果條件；它是傾向而不是事件保證。'}
  };
  const OOTK_READING_VERSION='20261005ootk16';
  const OOTK_KEYS=['op1','op2','op3','op4','op5'];
  const firstNonempty=(...values)=>values.find(v=>Array.isArray(v)&&v.length)||[];
  const cardName=c=>c&&(c.name||c.n||c.cardName)||'未記錄';
  const orientation=c=>c&&typeof c.ootkInverted==='boolean'?(c.ootkInverted?'inverted':'upright'):c?.physicalOrientation||null;
  const OOTK_RULES={
    inference:'不能證實不等於不能判讀。每一有效輪次須提出原題的方向性推論、最強支持與反證，再說明如何延續、加強、削弱或改寫前輪；未知只標示具體限制，不是停止分析的理由。',
    attribution:'無明確第三方代表牌綁定時，Queen或其他宮廷牌只能先讀為互動場域、態度模式、關係品質或外部人物力量，不能直接指認為題中某人；仍可由多輪不同作用收斂對方態度的方向性模型，明標推論與歸屬信心，不宣稱已知其內心。',
    dignity:'strengthen、friendly、weaken衡量本義作用增強、協調或削弱，不是吉凶票數；Devil增強先讀物質力量、誘惑或依附，歸屬須有上下文，不能直接判某人性慾或吸引。neutralizedByContraryFlanks=true時兩側影響抵銷，不再把左右增削各計一票。',
    orientation:'physicalOrientation、ootkInverted、significatorInverted是同一實體朝向的別名，每輪每張只記一份。Book T倒置不改牌義、不套RWS逆位、不當負面證據；追蹤它對面向與合法計數方向的實際影響，第四輪原稿從首張環牌依發牌方向計數，不受中央代表牌倒置改向。',
    source:'本次coreMeaning、wellDignified、illDignified、correspondence優先於一般RWS聯想。戀人先讀靈感及由此推動的動機行動，惡魔先讀物質力量與誘惑，死神先讀時間及非自願轉變。女祭司先讀變化、交替、增減與波動，未知變數須與同輪計數、配對、尊貴及生命樹落點整合，不能用女祭司＝不知道停止第五輪。',
    independence:'計數跳轉不當成元素相鄰；計數鏈、keyCards與同一鏈的ringCountingPath是同一觀測；pairs與ringPairing也是同源別名。代表牌追蹤、計數故事中的尊貴及完整尊貴表是同一資料的不同閱讀視圖，不額外加權。多數、元素統計及同牌重現可描述主題，不能當額外獨立支持。不得跨輪把牌直接拼成新牌句；先各輪成判，再合成各輪作用變化。',
    timing:'五輪是程序功能及發展層次，不是五個月份或固定日數。castTimestamp只是起局紀錄；計數值、步數、36環牌及十分度對應不是實算時間窗，沒有明示計算時窗就說本盤不能給曆日。',
    ring:'第四輪是倒數階段的完整故事鏈：核對全部36張外圈順序、所有合法計數節點、18對配對、每個實算尊貴及Book T多數。主線從計數故事及配對故事各自建立，再比較一致與衝突；配對與計數若相反，先辨領域、角色與作用層次，再交代哪個條件較能決定本題。說出起因、推進、轉折、代價與未解張力，不能只挑戀人、聖杯二、皇后或惡魔。節點數依本次實算，不補造15個節點。',
    convergence:'第五輪須用落點、代表牌狀態、完整計數與配對及尊貴收斂結果條件、剩餘阻力、可持續性。第一輪主線未定只作背景或輔證，不單獨支撐最終主判；其他有效輪次照常閱讀。'
  };
  function ootkLayerEvidence(key,op,context={}){
    const spec=OOTK_LAYER_SPEC[key]||{index:null,stage:key,questionRole:'依本次原生操作回答原題。'};
    const valid=op&&op.valid===true&&!op.abandoned;
    let domain=null;
    if(key==='op1')domain={kind:'pile',value:op.activePile||null,meaning:op.domainMeaning||null,mainLineValidation:op.mainLineValidation||null};
    else if(key==='op2')domain={kind:'house',value:op.activeHouse||null,meaning:op.domainMeaning||null};
    else if(key==='op3')domain={kind:'sign',value:op.activeSign||null,signTrump:op.signTrump||null,expectationNote:op.expectationNote||null};
    else if(key==='op4')domain={kind:'ring',ringSize:op.ringSize||null,methodNote:op.methodNote||null};
    else if(key==='op5')domain={kind:'sephirah',value:op.activeSephirah||null,label:op.sephirahZh||null,meaning:op.sephirahMeaning||null,methodNote:op.methodNote||null};
    const counts={
      activeCards:arr(op&&op.activeCards).length,
      keyCards:arr(op&&op.keyCards).length,
      countingSteps:firstNonempty(op?.ringCountingPath,op?.countingPath).length,
      pairs:firstNonempty(op?.ringPairing,op?.pairs,op?.ringPairs).length,
      dignities:arr(op&&op.dignities).length,
      structuralObservations:arr(op&&op.bookTMajorities&&op.bookTMajorities.observations).length
    };
    const mainValidation=op&&op.mainLineValidation,mainValidationStatus=mainValidation&&typeof mainValidation==='object'?mainValidation.status:mainValidation;
    const pendingMain=(mainValidation!=null||(key==='op1'&&context.procedureProfile==='liber78_validation'))&&![true,'confirmed','accepted','verified','not_required','not-applicable'].includes(mainValidationStatus);
    return {operation:key,index:spec.index,stage:spec.stage,questionRole:spec.questionRole,valid:!!valid,readingStatus:!valid?'not-readable':pendingMain?'context-mainline-pending':'eligible',domain,counts,
      readingRole:spec.questionRole,readingPriority:!valid?'withheld':pendingMain?'background-and-corroboration':key==='op4'?'full-story-integration':key==='op5'?'result-convergence':'development',
      evidenceStrength:!valid?'withheld':pendingMain?'procedurally-valid-mainline-unconfirmed':'eligible-symbolic-evidence-not-empirical-certainty',
      allowedInference:valid?'方向性推論；人物歸屬未定時標示為關係場或事件場，不冒稱客觀事實':'只述程序狀態，不補造該輪結論',
      mustAnswer:['本輪對原題新增什麼信息','最強支持鏈與最強反證','代表牌位置、面向、計數及尊貴如何改變','對前輪主判的影響與成立條件'],
      requiredContribution:['本輪針對原題新增的一個具體判斷','本輪最強支持鏈','本輪最強反證或限制','本輪如何承接、修正或推翻前一輪','本輪可判到哪一層及不能越界的部分']};
  }
  function ootkSignificatorState(key,op,sig){
    const cards=arr(op.activeCards),at=cards.findIndex(c=>sig&&c.id===sig.id),card=at>=0?cards[at]:null;
    const path=firstNonempty(op.ringCountingPath,op.countingPath),pairs=firstNonempty(op.ringPairing,op.pairs,op.ringPairs);
    return {operation:key,id:sig?.id??null,name:cardName(card||sig),present:!!card,
      activePosition:at<0?null:at,positionScope:key==='op4'?'center; outer-ring positions 1..36':'active stack positions 0-based',
      physicalOrientation:orientation(card),physicalFacing:card?.physicalFacing||null,countDirection:op.countDirection||null,
      countingPositions:path.filter(p=>card&&p.cardId===card.id).map(p=>p.position),
      dignities:arr(op.dignities).filter(p=>card&&(p.cardId===card.id||p.card===cardName(card))),
      surroundingCards:key==='op4'?[]:card&&cards.length>1?[cards[(at+cards.length-1)%cards.length],cards[(at+1)%cards.length]].map(c=>({id:c.id,name:cardName(c),physicalOrientation:orientation(c)})):[],
      pairing:pairs.filter(p=>card&&[p.left,p.right,p.card1,p.card2].some(c=>c?.id===card.id)),
      orientationEvidenceId:key+'/card/'+(sig?.id??'unknown')+'/physical-orientation',
      orientationPolicy:OOTK_RULES.orientation,
      scope:key==='op4'?'中央代表牌沒有外圈實體鄰牌；不虛構元素尊貴。':'只追蹤本輪實際代表牌，不以重現次數增加證據權重。'};
  }
  function ootkIntegrity(context,operations){
    const errors=[],missing=[],stop=context.procedureStatus?.abandonedAt||context.abandonedAt;
    let previous=true;
    for(const key of OOTK_KEYS){
      const entry=operations.find(p=>p.operation===key),op=entry?.data;
      if(!entry){previous=false;missing.push(key+'：操作未記錄');continue;}
      if(!previous)errors.push(key+'：操作順序不連續');
      if(stop&&Number(key.slice(2))>Number(String(stop).replace('op','')))errors.push(key+'：停止後出現後續資料');
      if(!entry.valid||entry.abandoned)continue;
      const cards=arr(op.activeCards),path=firstNonempty(op.ringCountingPath,op.countingPath),pairs=firstNonempty(op.ringPairing,op.pairs,op.ringPairs);
      for(const [label,rows]of [['activeCards',cards],['countingPath',path],['keyCards',arr(op.keyCards)],['pairs',pairs],['dignities',arr(op.dignities)]])if(!rows.length)missing.push(key+'：'+label+'缺漏');
      if(!op.bookTMajorities)missing.push(key+'：Book T多數資料缺漏');
      if(!Number.isInteger(context.significator?.id))missing.push(key+'：代表牌身分未記錄');
      else if(cards.length&&!cards.some(c=>c.id===context.significator.id))errors.push(key+'：活躍牌沒有代表牌');
      if(cards.length&&cards.every(c=>Number.isInteger(c.id))){
        const ids=cards.map(c=>c.id);
        if(new Set(ids).size!==ids.length||ids.some(id=>id<0||id>77))errors.push(key+'：牌號重複或超界');
        if(path.some(p=>!ids.includes(p.cardId)))errors.push(key+'：計數節點引用未發出的牌');
        if(arr(op.keyCards).some(p=>!ids.includes((p.card||p).id)))errors.push(key+'：keyCards引用未發出的牌');
        if(pairs.some(p=>[p.left,p.right,p.card1,p.card2].filter(Boolean).some(c=>!ids.includes(c.id))))errors.push(key+'：配對引用未發出的牌');
      }else if(cards.length)errors.push(key+'：牌號必須是0至77的整數');
      for(const c of cards){
        if(typeof c.ootkInverted==='boolean'&&c.physicalOrientation&&orientation(c)!==c.physicalOrientation)errors.push(key+'：朝向別名矛盾 '+c.id);
        if(!c.coreMeaning||!c.wellDignified||!c.illDignified)missing.push(key+'：Book T牌義缺漏 '+(c.id??cardName(c)));
      }
      const actualSig=cards.find(c=>c.id===context.significator?.id);
      if(actualSig&&typeof op.significatorInverted==='boolean'&&orientation(actualSig)&&op.significatorInverted!==(orientation(actualSig)==='inverted'))errors.push(key+'：代表牌倒置別名矛盾');
      if(key==='op4'&&cards.length){
        if(op.ringSize!==36||cards.length!==37||pairs.length!==18)errors.push('op4：必須為中央代表牌加36張環牌及18對配對');
        if(Array.isArray(op.ringCards)&&(op.ringCards.length!==36||JSON.stringify(op.ringCards.map(c=>c.id))!==JSON.stringify(cards.filter(c=>c.id!==context.significator?.id).map(c=>c.id))))errors.push('op4：外圈牌記錄不符');
        if(arr(op.ringCountingPath).length&&arr(op.countingPath).length&&JSON.stringify(op.ringCountingPath)!==JSON.stringify(op.countingPath))errors.push('op4：計數別名資料不一致');
        if(arr(op.ringPairing).length&&arr(op.pairs).length&&JSON.stringify(op.ringPairing)!==JSON.stringify(op.pairs))errors.push('op4：配對別名資料不一致');
      }
    }
    return {version:OOTK_READING_VERSION,status:errors.length?'invalid':missing.length?'partial':'complete',errors,missing,scope:'只驗證傳輸結構及資料範圍，不量測占卜準確率。'};
  }
  function ootkOutputContract(d){
    return {version:OOTK_READING_VERSION,expectedLayers:d.layerEvidence.filter(p=>p.valid).map(p=>p.operation),
      incompleteLayers:d.notCompleted,integrity:d.integrity.status,
      compositionMode:d.completed.length===5?'full-five-layer':d.completed.length?'partial-layered':'procedure-only',
      evidenceAnchors:d.operations.filter(p=>p.valid===true&&!p.abandoned).map(p=>{const op=p.data,card=id=>arr(op.activeCards).find(c=>c.id===id);return {operation:p.operation,significator:cardName(d.significator),cards:arr(op.activeCards).map(cardName),countingCards:Array.from(new Set(firstNonempty(op.ringCountingPath,op.countingPath).map(n=>cardName(card(n.cardId))))),pairs:firstNonempty(op.ringPairing,op.pairs,op.ringPairs).map(z=>[cardName(z.left||z.card1),cardName(z.right||z.card2)])};}),
      requiredSections:d.completed.length?['直接回答原題','五輪逐層判讀（各輪新增信息、依據、反證及改判）','五輪合成最可能傾向','次可能傾向','最強支持鏈','最強反證','成立條件','推翻條件','時間（有實算窗才給，否則明說本盤不能給）','可執行行動','已知／推論／未知界線及信心來源']:['程序停止或缺項說明','現實釐清與可逆行動（非本輪占斷）'],
      answerRule:d.completed.length?'前段先給有效盤面最支持的方向性推論；「不能證實」「只能現實驗證」「未知」可以交代限制，但不能充當主答案。若證據相持，指出相持的兩個具體方向及分歧來源，不強造優勢。未完成五輪時明說範圍，不冒稱已得最終結果。':'本次沒有有效可讀輪次，只能說明停止程序、缺项與現實釐清；不得從無效牌面推論結果。這個例外不能套用到有有效盤面的情況。',
      layerRule:'每輪以具體判斷開頭，引用本次實際中文牌名及本輪落域、計數故事與配對／尊貴作用，不能只泛稱「計數支持」「尊貴受限」。至少連結兩張實際牌或一個實算結構；第四輪交代至少三個實際計數節點（鏈較短則全部）及一對實際配對的故事關係，毋須逐項抄36牌。每輪交代代表牌狀態如何影響讀法。新增信息可以是推翻前輪或辨認同一阻力，不能為追求差異補造事件。',
      ringRule:OOTK_RULES.ring,convergenceRule:OOTK_RULES.convergence,confidenceRule:'以不同作用的收斂、反證強弱及角色歸屬描述信心；資料多、五輪完成或同牌重現不代表高置信或可換算百分比。'};
  }
  function ootk(raw){
    const d=raw.ootkData||raw,ops=d.operations||{},keys=OOTK_KEYS;
    if(Object.keys(ops).some(k=>!keys.includes(k)))throw Error('未知的OOTK操作編號');
    const operations=keys.filter(k=>ops[k]).map(operation=>({operation,valid:ops[operation].valid,abandoned:!!ops[operation].abandoned,data:copy(ops[operation])}));
    const completed=operations.filter(x=>x.valid===true&&!x.abandoned).map(x=>x.operation),notCompleted=operations.filter(x=>x.valid!==true||x.abandoned).map(x=>x.operation);
    const context=Object.fromEntries(['sourceProfile','sourceContract','method','procedureProfile','methodRules','countRule','significator','questionType','castTimestamp','predeclaredBindings','procedureStatus','validityPolicy','interpretationPolicy','numericPolicy','divinationValidity','timingWindows'].filter(k=>d[k]!==undefined).map(k=>[k,copy(d[k])]));
    const layerEvidence=keys.filter(k=>ops[k]).map(k=>ootkLayerEvidence(k,ops[k],context));
    const integrity=ootkIntegrity(context,operations);
    if(integrity.errors.length){const err=Error('OOTK資料結構不一致：'+integrity.errors.join('；'));err.code='OOTK_DATA_INVALID';err.integrity=integrity;throw err;}
    for(const entry of operations){const layer=layerEvidence.find(p=>p.operation===entry.operation);for(const k of ['readingRole','readingPriority','evidenceStrength','allowedInference','mustAnswer'])entry.data[k]=copy(layer[k]);}
    const result={version:OOTK_READING_VERSION,status:operations.length?'recorded':'not-started',context,operations,completed,notCompleted,layerEvidence,integrity,
      significator:copy(context.significator),significatorTrajectory:operations.map(p=>p.valid===true&&!p.abandoned?ootkSignificatorState(p.operation,p.data,context.significator):{operation:p.operation,readingStatus:'not-readable',reason:'本輪未形成有效占斷，不解讀其代表牌狀態。'}),
      layerContract:{
        version:OOTK_READING_VERSION,
        perLayerRule:'每一個完成且有效的操作都必須對原問題新增可辨識的判斷；不得只列牌義、程序或把五輪壓成一句總結。',
        synthesisRule:'五輪完成時，先逐輪成判，再合成最可能方向、次可能方向、最強反證、會推翻主判的條件與信心來源；不得以吉凶張數或單一輪次投票。',
        unresolvedRule:'未知只限制其所屬層次的角色歸屬或確定度，不得把其他已可判斷的層次一起寫成未知；「無法證實」不能成為停止解讀的理由。',
        thirdPartyMindRule:'若原題問第三方看法、好感、意願或心意而沒有明確第三方代表牌綁定，不能宣稱已證實其內心；仍須依五輪收斂提出方向性模型，將可歸屬者標為「較支持的推論」，無法歸屬者標為關係場／互動場訊號，並交代反證與信心。',
        firstOperationRule:'mainLineValidation未確認時只降低所屬輪次作為主判核心的權重；第一輪未定不抹除後續有效輪次，不可因此把整盤降成無答案。',
        noCalendarMapping:'五輪是操作層次，不是五個月份，也不是固定五個現實事件。',
        rules:OOTK_RULES
      },
      policy:'未完成、無效與放棄的輪次不冒稱已完成；不代做使用者尚未操作的輪次。完成輪次必須逐層產生資訊，再跨層整合；未知只降低對應層次的歸屬與信心，不抹除其餘有效訊號。'};
    result.outputContract=ootkOutputContract(result);return result;
  }
  // Deterministic reading materialization: no nested prose references, no
  // generic metadata filter, no clipping, and no algorithm or chart mutation.
  function ootkToPrompt(d){
    const lines=[],add=(title,value)=>lines.push('【'+title+'】\n'+(typeof value==='string'?value:JSON.stringify(value)));
    add('OOTK成稿契約',d.outputContract);add('OOTK讀法與推論界線',Object.values(OOTK_RULES).join('\n'));
    add('本次程序完成範圍','已記錄 '+d.operations.length+'／5 次操作；有效可讀 '+d.completed.length+' 輪。'+(d.completed.length===5?'五輪已完成，須逐層判讀後合成。':'本輪不能提供完成五次操作的結論；只讀已通過的有效輪次，無效牌面不解讀。'));
    add('本次程序版本、代表牌與發牌前綁定',d.context);add('五轮逐層閱讀資料完整性',d.integrity);
    add('代表牌五輪狀態追蹤',d.significatorTrajectory);
    const profiles=new Map();
    for(const entry of d.operations.filter(p=>p.valid===true&&!p.abandoned)){for(const card of arr(entry.data.activeCards).concat(arr(entry.data.openingCards).map(p=>p.card))){if(card?.id!=null&&!profiles.has(card.id))profiles.set(card.id,Object.fromEntries(['id','name','sourceProfile','kind','suit','element','rank','number','bookTTitle','coreMeaning','wellDignified','illDignified','sephirah','world','decan','correspondence','countValue'].filter(k=>card[k]!==undefined).map(k=>[k,card[k]])));}}
    add('本次Book T完整牌義底稿（僅靜態牌義共用，動態狀態逐輪分列）',Array.from(profiles.values()));
    const manifests=[];
    for(const entry of d.operations){
      const op=entry.data,layer=d.layerEvidence.find(p=>p.operation===entry.operation),path=firstNonempty(op.ringCountingPath,op.countingPath),pairs=firstNonempty(op.ringPairing,op.pairs,op.ringPairs);
      add(entry.operation+'・'+layer.stage+'・閱讀任務',layer);
      if(!layer.valid){
        add(entry.operation+'程序停止紀錄（不解讀無效牌面）',Object.fromEntries(Object.entries(op).filter(([k])=>!['cards','drawn','selectedCards','activeCards','ringCards','keyCards','countingPath','ringCountingPath','pairs','ringPairing','ringPairs','dignities','bookTMajorities','openingCards','openingDignities'].includes(k))));
        const manifest={operation:entry.operation,...layer.counts,readingEligible:false};manifests.push(manifest);add(entry.operation+'本輪資料結束與數量核對',manifest);continue;
      }
      const scalar=Object.fromEntries(Object.entries(op).filter(([k])=>!['activeCards','ringCards','keyCards','countingPath','ringCountingPath','pairs','ringPairing','ringPairs','dignities','bookTMajorities','openingCards','readingRole','readingPriority','evidenceStrength','allowedInference','mustAnswer'].includes(k)));
      add(entry.operation+'落域、方向與程序紀錄',scalar);
      const row=c=>({id:c.id,name:cardName(c),element:c.element,physicalOrientation:orientation(c),physicalFacing:c.physicalFacing});
      add(entry.operation+'全部活躍牌（依實體排列順序）',arr(op.activeCards).map((c,i)=>({position:i,...row(c)})));
      if(entry.operation==='op4')add('op4全部36張環牌（中央牌另列，位置1至36）',arr(op.ringCards).length?op.ringCards.map((c,i)=>({position:i+1,...row(c)})):arr(op.activeCards).filter(c=>c.id!==d.significator?.id).map((c,i)=>({position:i+1,...row(c)})));
      if(arr(op.openingCards).length)add('四堆翻面初示牌及YHVH堆尊貴',op.openingCards);
      // Resolve card meanings onto every count node. The AI never has to chase
      // an indirect shared-fragment ID to obtain the main-line semantics.
      add(entry.operation+'完整計數故事（按節點順序，不截取首尾）',path.map((p,i)=>{const c=arr(op.activeCards).find(c=>c.id===p.cardId);return {node:i+1,...p,coreMeaning:c?.coreMeaning||null,wellDignified:c?.wellDignified||null,illDignified:c?.illDignified||null,dignity:arr(op.dignities).filter(z=>z.cardId===p.cardId||z.card===cardName(c))};}));
      add(entry.operation+'全部keyCards與計數位置（與計數故事同源）',arr(op.keyCards).map(p=>({position:p.position,...row(p.card||p)})));
      add(entry.operation+'完整配對故事（與ringPairing同源，只讀一次）',pairs.map((p,i)=>({...p,pair:i+1,left:p.left?row(p.left):null,right:p.right?row(p.right):null})));
      add(entry.operation+'全部實算元素尊貴（實體鄰牌，非跳點或配對）',op.dignities||[]);
      add(entry.operation+'Book T多數及同階完整觀察',op.bookTMajorities||null);
      const manifest={operation:entry.operation,...layer.counts,ringSize:op.ringSize??null};manifests.push(manifest);add(entry.operation+'本輪資料結束與數量核對',manifest);
    }
    add('OOTK五輪資料結束與完整性核對',manifests);
    return lines.join('\n\n');
  }
  function oracle(p){
    if(!p||!Number.isInteger(p.n)||!p.g||typeof p.p!=='string'||!p.sourceUrl)throw Error('籤詩原文、版本或出處缺漏。');
    const r=root.JYOracleRegister&&root.JYOracleRegister.get(p.n),normalize=s=>s.replace(/[\s，。；]/g,'');
    if(!r)throw Error('本籤的逐首覆核資料未載入。');
    if(p.g!==r.ganzhi||normalize(p.p)!==normalize(r.canonicalPoem)||p.sourceUrl!==r.poemSource)throw Error('籤號、干支、原詩或來源與本版不符，不套用同號解說。');
    return {number:p.n,ganzhi:p.g,poem:p.p,source:p.sourceUrl,sourceNote:p.sourceNote,version:root.JYOracleRegister.version,profile:root.JYOracleRegister.profile,lines:p.p.split(/[\n，。；]/).map(x=>x.trim()).filter(Boolean).map((text,i)=>({index:i+1,text,conditionWords:Array.from(text.matchAll(/若|如|待|須|莫|勿|免|且|但|方|到|逢/g)).map(x=>({word:x[0],offset:x.index}))})),reading:{direction:r.direction,summary:r.summary,premises:r.premises,domainNotes:r.domainNotes},categories:r.categories,storyTitles:r.storyTitles,storyStatus:r.storyStatus,supplementSource:r.supplementSource,sourceAudit:r.sourceAudit,sourceSHA256:r.sourceSHA256,policy:root.JYOracleRegister.policy};
  }
  root.JYNativeCards=Object.freeze({tarot,lenormand,ootk,oracle,ootkToPrompt,ootkLayerEvidence,ootkReadingVersion:OOTK_READING_VERSION,ootkRules:OOTK_RULES});
})(typeof window==='undefined'?globalThis:window);
