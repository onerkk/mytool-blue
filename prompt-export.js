// BEGIN GENERATED OOTK EXPORT RUNTIME
(function(root){
if(!root.JYNativeCards?.ootkReadingVersion || String(root.JYNativeCards.ootkReadingVersion).localeCompare("20261005ootk16",undefined,{numeric:true})<0){
(function(root){
  'use strict';
  const arr=x=>Array.isArray(x)?x:[],copy=x=>x==null?null:JSON.parse(JSON.stringify(x));
  function tarot(raw){
    const d=raw.tarotData||raw,cards=arr(d.cards),rws=d.sourceProfile==='rws_reversals'||d.readingMode==='rws_reversals';
    if(!cards.length||new Set(cards.map(c=>c.id)).size!==cards.length||cards.some(c=>!Number.isInteger(c.id)||c.id<0||c.id>77))throw Error('塔羅發牌紀錄缺漏、重複或牌號無效。');
    const register=arr(typeof TAROT==='undefined'?root.TAROT:TAROT);
    // Topic of the site's curated RWS meaning: the room's declared focus first, then explicit question words.
    const q=String(raw.question||d.question||''),ft=String(raw.focusType||d.focusType||'');
    const topic=/love|感情/.test(ft)||/感情|戀愛|恋爱|喜歡|喜欢|曖昧|暧昧|復合|复合|交往|分手|前任|對象|对象|伴侶|伴侣|婚|桃花|心意|愛|爱/.test(q)?'love':/career|事業|工作/.test(ft)||/工作|事業|事业|職|职|面試|面试|升遷|升迁|老闆|老板|同事|創業|创业|考試|考试|錄取|录取/.test(q)?'career':/wealth|財/.test(ft)||/財|财|錢|钱|投資|投资|收入|薪|生意|賺|赚|負債|负债/.test(q)?'wealth':/health|健康/.test(ft)||/健康|身體|身体|病|手術|手术|懷孕|怀孕/.test(q)?'health':/spirit|靈性/.test(ft)||/靈性|灵性|修行|冥想/.test(q)?'spiritual':'general';
    const topicLabel={love:'感情',career:'事業',wealth:'財務',health:'健康',spiritual:'靈性',general:'一般'}[topic];
    const records=cards.map((c,i)=>{const p=register.find(x=>x.id===c.id),slot=arr(d.methodPlan?.slots)[i]||{};if(rws&&!p)throw Error('RWS牌義表沒有此牌。');const up=c.isUp===true,dir=typeof c.isUp==='boolean',pos=c.position||c.pos||slot.label||'位置'+(i+1),advice=/建議|建议|行動|行动|該怎麼|怎麼做/.test(pos);
      const meaning=rws&&dir&&p?(advice&&p[up?'adviceUp':'adviceRv'])||(topic!=='general'&&p[topic+(up?'Up':'Rv')])||p[up?'up':'rv']||null:null;
      return {index:i+1,id:c.id,name:c.name||c.n,position:pos,direction:rws?(c.isUp===true?'正位':c.isUp===false?'逆位':'方向未記錄'):'Book T，不套RWS逆位',keywords:rws&&dir?String(up?p.kwUp:p.kwRv).split('·'):[],meaning,meaningTopic:meaning?(advice&&p[up?'adviceUp':'adviceRv']?'建議':topicLabel):null,element:p?.el||null,binding:copy(c.binding||c.slotBinding||slot.binding),suit:c.suit||p?.suit,rank:c.rank||p?.rank,number:p?.num};});
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
    // Grand Tableau reading aids (houses, significators' square of nine, corners). Position
    // geometry only; meanings stay with the reader. Row/column facts are computed so the
    // AI does not have to re-derive the grid.
    let tableau=null;
    if(spread==='grand'||spread==='grand_nines'){
      const w=spread==='grand'?8:9,main=spread==='grand'?32:36,byId=id=>records.find(r=>r.id===id),cell=pos=>pos<=main?{row:Math.floor((pos-1)/w)+1,col:(pos-1)%w+1}:{row:'尾排',col:pos-main};
      const dirs=[['左上',-1,-1],['上',-1,0],['右上',-1,1],['左',0,-1],['右',0,1],['左下',1,-1],['下',1,0],['右下',1,1]];
      const at=(r,c)=>r>=1&&r<=main/w&&c>=1&&c<=w?(r-1)*w+c:null;
      const view=id=>{const r=byId(id);if(!r)return null;const pos=r.index,g=cell(pos),around={};if(pos<=main)for(const [k,dr,dc]of dirs){const q=at(g.row+dr,g.col+dc);if(q)around[k]=records[q-1].name;}return {id,name:r.name,position:pos,row:g.row,col:g.col,around};};
      tableau={width:w,mainCount:main,houses:records.map(r=>({house:r.index,houseName:byId(r.index)?.name||null,card:r.name,cardId:r.id})),ownHouses:records.filter(r=>r.id===r.index).map(r=>r.name),
        significators:[28,29].map(view).filter(Boolean),corners:(spread==='grand'?[1,8,25,32]:[1,9,28,36]).map(p=>records[p-1].name),
        cells:records.map(r=>({id:r.id,name:r.name,position:r.index,...cell(r.index)})),policy:'格號即宮號（第N格是第N號牌的宮）；指示牌九宮格：左為已發生、右為將來、上為想法意識、下為潛在或根基；距離以同盤格數計，1為貼身。'};
    }
    return {records,paths,adjacent,segments,mirror,knights,neighbors,tableau,commonContext:spread==='choice'?4:null,methodData:copy(d.methodData||d.nativeMethodData),geometry:copy(d.geometry),policy:'本布局實算全部合法連續片段、鏡像、鄰接與騎士步；8×4主盤與尾排分開，不跨接選項分線。'};
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

}
if(!root.JYNativeDepthContract?.version || String(root.JYNativeDepthContract.version).localeCompare("20261016depth28",undefined,{numeric:true})<0){
(function(root){
  'use strict';
  const VERSION='20261016depth28';
  const A=x=>Array.isArray(x)?x:[];
  const valueAt=(o,path)=>{try{return path.split('.').reduce((v,k)=>v==null?undefined:v[k],o);}catch(_){return undefined;}};
  const present=v=>Array.isArray(v)?v.length>0:(v&&typeof v==='object')?Object.keys(v).length>0:(v!==undefined&&v!==null);
  const has=(o,path)=>present(valueAt(o,path));
  const common={
    synthesis:['先回答原題','再交代最強支持鏈','再交代最強反證／牽制','說明成立條件與會推翻結論的條件','時間題只使用已實算運期／候選時窗','最後才給行動建議'],
    forbidden:['不得把同源規則重複計票','不得把缺資料補成事實','不得把象徵直接當已發生事件','不得以單一吉凶指標蓋過完整作用網','不得把不同流派互相矛盾的表硬平均成唯一答案'],
    confidence:'本題內部解讀把握度只能描述有效證據的收斂與限制；有關鍵缺項或流派衝突時降低確定度。它不是現實事件機率，也不是經驗證的預測準確率。',
    truthBoundary:{calculationValidation:'reproducible-within-selected-profile',predictionValidation:'not-performed',claimLevels:['排盤或抽取的可重算事實','具名傳統規則及本站模型','待現實核對的個案推論'],rule:'計算核對不等於事件預測已驗證；模型強弱或凶吉不構成終身判決，沒有已算救應不得捏造轉機。'}
  };
  const P={
    bazi:{profile:'子平月令／根氣／成敗救應＋窮通條件分層',required:[['四柱與藏干','pillars'],['月令人元司事','seasonalCommander'],['根氣與旺衰','strength'],['子平功能判讀','functionalAssessment'],['古典條件矩陣','classicalAssessment'],['古法質性裁決','classicalAdjudication'],['大運流年實算','annualSegments']],order:['月令與司令','日主根氣及全局旺衰','透藏十神及生克路徑','格局成敗救應','調候與古典條件','大運→流年→必要時小運'],conflicts:['調候、扶抑、格局不是三套票數；若結論不同要解釋哪一層在本題優先','合局只在成化條件成立時視為轉化，否則保留合絆／牽制'],forbidden:['不得以五行缺什麼直接判喜用','不得把古訣字面命中直接斷成事件']},
    ziwei:{profile:'三合骨架＋生年／宮干飛化＋具名北派作用分層',required:[['十二宮及星曜','items'],['運限層','layers'],['北派飛化圖','northern'],['格局候選','patternAssessment'],['流派配置稽核','schoolCompletion']],order:['命身與主題宮','主題宮三方四正及空宮借對','生年四化','宮干飛入飛出與自化','大限→流年→流月／日／時（有資料才用）'],conflicts:['四化表必須綁定來源 profile；不同派表不互相加票','河洛／欽天若缺專屬數理或圖路資料，不冒稱完成該派'],forbidden:['不得只數吉星煞星','不得把同一四化在不同運限層視為多個獨立驗證']},
    vedic:{profile:'Parashari 主判＋PVR 分盤／多運法，Jaimini 類技巧具名分層',required:[['D1宮主與落宮','items'],['20分盤','vargas'],['Vimshottari當期','activation'],['六力','strength'],['宮力','bhavaStrength'],['Ashtakavarga','ashtakavarga'],['多運法適用性','applicability']],order:['D1主題宮與宮主','自然吉凶、尊貴、燃燒、定位星與相位','議題對應分盤＋D9條件核對','六力／宮力只判可發揮度不直接判吉凶','主運→副運→次副運','其他Dasha先核 applicability 再作旁證','行運最後與本命及運主交會'],conflicts:['Vimshottari與其他Dasha不是票數；條件運法未滿足 applicability 時不可拿來反駁主判','不同Bhava／Ayana／分盤算法若有具名 profile，必須保留 profile'],forbidden:['不得把星強直接等同吉','不得只見Yoga就保證事件','不得用單一D9或D10取代D1']},
    astro:{profile:'傳統七曜宮主骨架＋現代外行星補充；卜卦另走Lilly/Houlding具名規則',required:[['行星位置','items'],['尊貴','essentialDignities'],['行運','transits'],['次限','progressions'],['傳統卜卦流派摘要','traditionProfile']],order:['先辨本命／卜卦／事件用途','宮主與定位星','相位是否入相／出相','尊貴與接納','推運或回歸分層','卜卦再看傳光／集光／禁止／VOC'],conflicts:['VOC不同歷史定義分開呈現，不強定唯一','現代外行星不得替代傳統問事宮主'],forbidden:['不得只用太陽星座','卜卦不得把候選相位當成事已成']},
    liuren:{profile:'四課三傳／九宗門為骨架，課體神煞與分類占法後置',required:[['天地盤','plate'],['四課','courses'],['三傳','transmissions'],['生克邊','edges'],['64課體','classes'],['神煞實際命中','shensha'],['分類占法條件','topicRules']],order:['日干與日支兩端','四課取傳理由','初中末三傳承接','天將六親旬空旺衰與內外戰','64課體條件','神煞只作切題補充','問事分類條件與應期候選'],conflicts:['神煞同源別名不可加票','分類占法若要求年命而未提供，只能標不足'],forbidden:['不得由課名直接斷事件','不得將候選應期說成確定發生日']},
    liuyao:{profile:'增刪卜易用神作用網',required:[['六爻納甲','items'],['問題取用','targets'],['組合關係','combinations'],['應期候選','timing'],['月日動變作用平衡','classicalBalance']],order:['原題角色→用神候選','世應定位','月建日辰與旬空月破','用元忌仇的有效生克網','動化回頭生克／進退／反伏吟','伏神飛神','最後才談應期'],conflicts:['用神多現時比較旺衰、位置、動靜與作用網，不憑一條規則硬選','空破有空而不空／破而不破條件時保留條件'],forbidden:['不得見進神必吉、退神必凶','不得把世應直接當對方真實意願']},
    yijing:{profile:'朱子變占主讀＋周易彖象文言結構核讀',required:[['主讀選擇','reading'],['六爻結構','items'],['彖象文言','expositions'],['錯綜互補','complementaryViews']],order:['先按動爻數確定主讀','讀本卦／之卦與指定爻辭','再核彖象與當位中應乘承','錯綜互卦只作補充'],conflicts:['京房納甲等旁系不得覆蓋本次朱子主讀'],forbidden:['不得用卦名直接代替爻辭條件']},
    meihua:{profile:'梅花本互變體用',required:[['本互變四階段','items'],['原體','body'],['用卦','use'],['互卦','nuclear']],order:['固定原體','本卦體用','互卦上下','變卦體用','起卦時令旺衰','有提供才看外應'],conflicts:['不得混入六爻納甲世應神煞'],forbidden:['不得把卦象五行當成終身八字喜忌']},
    name:{profile:'筆畫來源分層＋五格三才＋音形義＋生辰只作有資料時旁證',required:[['姓名實算','items'],['候選比較','comparisons']],order:['先核每字筆畫來源與異表','五格公式','三才 profile','音義與讀音','生肖形義','有生辰才談八字配合','最後比較原名與候選'],conflicts:['不同三才表與81數表保留來源，不以網站多數決','現代筆畫與康熙筆畫分開'],forbidden:['不得把姓名數理當實證命運概率']},
    compat:{profile:'雙方原局先成立，再做有方向的互動作用',required:[['雙方資料','items'],['時間同步','timeline']],order:['A原局','B原局','A→B作用','B→A作用','共同運期窗口','支持與牽制分開'],conflicts:['相生、合、桃花等不能證明心意或關係成立'],forbidden:['不得把B的喜忌當A的喜忌']},
    personality:{profile:'本站五軸命理映射模型',required:[['五軸或部分軸','items']],order:['逐軸看兩端證據','找最穩定模式','列相反條件','轉成可觀察行為'],conflicts:['不是心理計量量表'],forbidden:['不得作臨床診斷']},
    tarot:{profile:'實際牌陣＋指定體系',required:[['全部牌與牌位','methodData']],order:['先按牌陣位置讀','再讀牌間關係與重複牌階／元素','核心牌與反證牌同時保留','最後合成原題各子題'],conflicts:['RWS、Book T、Mathers不可互相覆蓋'],forbidden:['不得單張牌硬定時間、年齡或他人心意']},
    ootk:{profile:'Golden Dawn／Book T 開鑰程序・五輪逐層推論',required:[['實際五輪程序','methodData']],order:['先確認代表牌與程序是否有效','只讀完成且有效輪次','每輪先用落域→合法計數→配對→元素尊貴形成一個直接回答原題的新判斷','逐輪說明本輪如何承接、修正或推翻前一輪','五輪完成後合成最可能方向、次可能方向、最強反證、改判條件與信心來源','最後才給行動與時間邊界'],conflicts:['未完成輪次不能補成完成','第一輪主線未確認時只降低第一輪主判權重，不得抹除後續有效輪次','第三方沒有明確角色綁定時，不能把象徵宣稱為已證實心意；但仍須保留五輪收斂得到的方向性推論，將無法歸屬者標為關係場／互動場訊號'],forbidden:['不得硬把五輪對應五個月份','不得因「無法證實他人心意」就停止解讀或把全部有效訊號寫成未知','不得只說有情感／衝突／吸引議題而不交代較支持的方向、程度與反證','不得用單一輪、單一牌或吉凶張數取代五輪跨層整合']},
    lenormand:{profile:'36牌幾何關係／Grand Tableau',required:[['牌列與幾何','methodData']],order:['主題牌與人物牌','相鄰牌句','鏡像／騎士步（合法時）','宮位與大牌陣鏈','整合問題'],conflicts:['不同布局規則按實際布局使用'],forbidden:['不得由心、戒指等圖像直接證實事件']},
    oracle:{profile:'廟方版本籤詩＋實際求籤程序',required:[['籤文與程序','methodData']],order:['程序有效性','原詩','本廟事項欄','故事只作版本脈絡','對原題給條件式解讀'],conflicts:['不同廟版本不混算'],forbidden:['不得由籤號換算精確日期']}
  };
  function evidenceState(method,chart,analysis,path){
    if(method==='vedic'&&chart?.input?.unknownTime&&['items','activation','strength','bhavaStrength','applicability'].includes(path))
      return {available:false,status:'withheld',reason:'出生時刻未確認，不能確定宮位、六力或現行運期'};
    if(method==='ziwei'&&analysis?.coverage?.provisional&&path==='items')
      return {available:false,status:'withheld',reason:'未知時辰，十二宮尚未定盤'};
    const av=valueAt(analysis,path),cv=valueAt(chart,path),v=present(av)?av:cv;
    if(!present(v)){
      if(method==='astro'&&path==='traditionProfile'&&chart?.input?.chartPurpose!=='horary')return {available:true,status:'not-applicable',reason:'本次不是卜卦盤'};
      return {available:false,status:'missing',reason:'沒有可讀取的實算資料'};
    }
    const status=typeof v==='object'?v.status:null;
    if(status==='not-horary')return {available:true,status:'not-applicable',reason:'本次不是卜卦盤'};
    if(v.complete===false||/^(insufficient|unknown|undefined|unavailable|unverified|not-computed|module-not-loaded|missing)/.test(status||''))
      return {available:false,status:'partial',reason:[status,...A(v.missing)].filter(Boolean).join('；')||'計算尚未完成'};
    if(method==='ziwei'&&path==='schoolCompletion'&&A(v.policyMismatches).length)
      return {available:false,status:'policy-mismatch',reason:'要求的流派配置未套用到本盤，須重排'};
    if(method==='ootk'&&path==='methodData'&&A(v.completed).length!==5&&Object.hasOwn(v,'completed'))
      return {available:false,status:'partial',reason:'只可解讀實際完成且有效的輪次，不能宣稱五輪完成'};
    if(method==='ootk'&&path==='methodData'&&v.integrity?.status!=='complete')
      return {available:false,status:'partial',reason:A(v.integrity?.missing).join('；')||'本次五輪閱讀必要欄位未齊全'};
    return {available:true,status:'calculated',reason:null};
  }
  const CASEWORK={
    bazi:{paths:['pillars','seasonalCommander','roots','functionalAssessment','classicalAdjudication','annualSegments'],checks:['透藏資源能否經有效生剋通路送達，而非數財星','原局承擔、成敗救應與當期增減是否同向'],bounds:'不由五行分數換算收益；調候、扶抑與格局保留各自判斷層級'},
    ziwei:{paths:['items','layers','northern','patternAssessment','schoolCompletion'],checks:['主題宮連同三方四正，逐一追到飛入、飛出與自化的實際兩端','本命、大限、流年分層比較同一事件，不以吉星數量裁決'],bounds:'未套用的流派或未知時辰不能由文字補成定盤'},
    vedic:{paths:['items','vargas','activation','strength','bhavaStrength','ashtakavarga','applicability'],checks:['主題宮主的職責、落處、定位星與實際受照先成判','有效專題分盤與同一運主承接；分清收入增加、成本負擔及留存','逐期比較當期與後期的支持及阻力；交運不自動等於達標'],bounds:'專題分盤、力量與多運法各有用途，不投票也不從強度換算金額'},
    astro:{paths:['items','essentialDignities','transits','progressions','returnAnalysis','horary'],checks:['先辨本命與卜卦用途，沿主題宮主、定位鏈與相位雙端解釋','本命能力、實算行運觸發、次限及返照各自有時間範圍'],bounds:'未算相位或年度不能由當日位置外推，候選入相不代表事件已成'},
    liuren:{paths:['plate','courses','transmissions','ganZhi','edges','targets','topicRules','timing'],checks:['日干、日支、主題角色與三段傳遞的生克方向合讀','逐傳核刑沖與制化；本人承受和環境要求分讀，不能見官鬼就指定事故或缺人','財物是否送達、是否伴隨消耗或受制，不能見財即判得財'],bounds:'缺年命只限制相關規則；未來候選日期不是已發生事件'},
    liuyao:{paths:['items','targets','influences','transformations','classicalBalance','timing'],checks:['取用對應原問句；月、日、動與變的作用能否有效到達該爻','世應、伏飛、空破及可實現的解阻條件與最強反向作用比較'],bounds:'不得只看旺衰、空亡或吉凶爻數；無月日的爻不能假設有時令'},
    meihua:{paths:['body','use','nuclear','originalLines','changedLines','castContext'],checks:['原體固定，本卦、互卦、變卦依既定方法承接','求財與交易按各自原典判，體克用不能因一般生克表一律寫壞'],bounds:'卦氣的傳統取時須交代換算及時令，不把數字直接指定公曆日'},
    yijing:{paths:['reading','originalGeometry','changedGeometry','expositions','complementaryViews'],checks:['先確認實際動爻數及本次擇辭政策，再比較主讀與參讀的情境','把原文中的做法、前提與後果連到同一子題'],bounds:'互錯綜或爻位關係不能越過主讀原文，也不因卦名直接保證事件'},
    tarot:{paths:['methodData'],checks:['實際牌陣的結果、限制、原因及行動各自保留功能','牌間關係形成同一事件的主判；相反牌先辨在講哪一層再取捨'],bounds:'不能把建議位當事件已發生，也不重排成另一種好解的牌陣'},
    ootk:{paths:['methodData'],checks:['逐一確認實際版本、有效輪次、落域、合法計數、配對及尊貴','每輪新增或修正前輪判斷，最後合讀，不任選一輪當結果'],bounds:'明示停止或失敗的程序不能補造；未核實的主線不能冒稱已驗題'},
    lenormand:{paths:['methodData'],checks:['完整牌句、主題牌與合法相鄰先成判','大牌陣再依實際幾何核宮位、鏡像與鏈結，保持讀取方向'],bounds:'九宮不能假用三十六宮資料；心或戒指單牌不是現實成立證據'},
    oracle:{paths:['methodData'],checks:['本廟版本及實際求籤程序有效，才讀完整原詩與本廟事項','前後轉折的勸進、等待或調整前提合讀，不能只選一句好話'],bounds:'另一廟同號籤、未提供的典故版本或籤號數字都不能補成應期'},
    name:{paths:['items','comparisons'],checks:['候選名字用同一筆畫口徑比較音、形、義與各派算式','分開字典原值、人工覆核及異表敏感度，保留改名的實際使用成本'],bounds:'姓名資料不計事件時序或月收益，這些子題須列能力缺口，不能造財運日期'},
    compat:{paths:['items','timeline','projectionGroups'],checks:['先核雙方原局，再分A到B及B到A的實際作用','共同時段與各自承擔分開；不能由匹配替對方宣布意願'],bounds:'不交換雙方喜忌，不由相合保證交往、婚姻或合作收益'},
    personality:{paths:['items','modelInputs','disclaimer'],checks:['逐軸追原輸入及相反條件，落到可觀察的決策與溝通行為'],bounds:'本站命理映射不是心理量表，不計事件日期、疾病或收入'}
  };
  // Reading lenses use each method's existing evidence. They are not new
  // divination formulae and do not measure staffing, consent or actual events.
  const WORK_CONTEXT={
    bazi:['原局承受與外在約束，須連同根氣、資源和救應讀；不把責任一概解成個性','長期方向只核已算大運流年；本命結構不能推出今日同事缺勤'],
    ziwei:['命身、事業與交友相關宮位連同三方和實際飛化讀；自己、工作要求與支援分開','本命及運限分層，不把交友宮直接指認某位同事或人數'],
    vedic:['以D1本人、日常責任、職業及支援的實際宮主作用為主；D10只核職業承接','有效運期與原局一同讀，宮力不等於今日現場人力'],
    astro:['先辨本命或卜卦，再按本盤宮主與雙端相位分讀本人、工作和支援','卜卦如有實算傳光／集光或受阻才用；第三方象徵不是某人已答應代班'],
    liuren:['干支兩端、三傳刑沖生剋連同空破旺衰讀，區分本人承受與環境牽制','是否有救應須看實際作用；官鬼、旬空、天空不直接等於缺人或停工'],
    liuyao:['世爻承受、工作取用及有效生扶制約合讀；保留動變、空破與飛伏的反證','兄弟或應爻須有原題角色依據才作同事或對方，不自動斷缺勤'],
    yijing:['依本次主讀卦爻辭的角色、進退與承擔條件，分辨想休息和仍須承接的矛盾','已上班就解讀當下調整；未選方案作條件比較，不另起一卦'],
    meihua:['固定原體，合本互變及時令，區分本人消耗、外在牽制與得到支援','只有實際提供才讀現場外應；不得把人數或職位補成外應'],
    tarot:['按原牌位區分本人感受、外在處境、限制及可用支援，再合全部正反作用','沒有環境位就讀既有合法關係並標限制，不補抽、不把宮廷牌指定成缺勤同事'],
    lenormand:['依原布局的主題綁定和合法連續牌句讀工作、阻礙及支援，保留順序與反證','不因塔羅式牌義或幾張牌就斷缺勤人數，不另造人物牌'],
    ootk:['只用有效輪次，追問工作責任、承擔與支援如何在各輪承接或受阻','未確認主堆不冒稱驗題；未完成程序不補成已知現場'],
    oracle:['原詩前後條件及本廟作事欄一起讀，區分該承接、暫緩與調整的情況','總吉意不覆蓋作事限制；詩句不能證實同事缺勤'],
    name:['只讀實際姓名算式和音形義能說明的象徵傾向，工作處境另外核實','姓名不能計算今日人力或重新找到方向的日期，不為回答而補生辰'],
    compat:['雙方已有資料才分各自承擔與雙向作用；先確認原題第二人的角色','未提供主管或同事資料就保持未知，不能把任意第二人套成支援者'],
    personality:['用已算五軸的兩端與反向條件談承擔、界線和求助方式','人格傾向不是現場人力資料，也不能預測轉運日']
  };
  function nativeBasis(method,chart,analysis,focus,situation){
    const spec=CASEWORK[method]||{paths:['items'],checks:[],bounds:'未有具名取法不補造'};
    const paths=spec.paths.map(path=>({path,status:has(analysis,path)||has(chart,path)?'present':'missing',scope:'實際資料入口，不等於完成事件裁決'}));
    const sources=root.JYNativeRuleSources?.forMethod?.(method)||[];
    const out={schema:'jy.case-basis/1',method,sourceQuestion:focus?.sourceQuestion||'',focus,paths,comparisonChecks:spec.checks,methodBoundary:spec.bounds,
      research:{status:'source-log-provided-runtime-lookup-not-performed',sourceLog:sources.map(s=>({id:s.id,url:s.reviewURL||s.url,lastCheckedAt:s.checkedAt,reviewScope:s.reviewScope||s.reader26ReviewScope||s.scope,verification:s.verificationLevel||s.reader26VerificationLevel||'prior-scoped-review'})),runtimeBrowsingPerformed:false,
        unimplementedOrUncertain:A(analysis?.unavailable).map(message=>({message,kind:/未實作|算法|流派|傳承|原典|版本|歧義/.test(message)?'technical-rule-or-implementation':/時刻|時辰|出生|未提供|未完成|程序/.test(message)?'input-or-procedure':'method-scope',resolved:false})),
        rule:'先核既有來源的實際適用段落。不確定取法時由具瀏覽能力的解讀端真實查閱一手資料，記實際URL及核到的規則；未能查到保留未決，不冒稱本輪查過。未實作算法需補程式與對照後才算完成，只有文獻不算已實算。個人現況缺項不能靠網路或命理補造。'},
      judgementStatus:'requires-source-based-synthesis',humanPractitionerPerformed:false,predictionValidated:false};
    if(situation?.workDecision)out.contextReading={status:'reading-instructions-not-event-findings',checks:WORK_CONTEXT[method]||[],
      boundary:'只沿本法實有資料找支持與相反作用。現場人力、交接與調度屬待核實背景，不能由提示詞自行變成盤面證據。'};
    if(method==='vedic'&&!chart?.input?.unknownTime){
      const houses=A(chart?.houses),ps=chart?.planets||{},wanted=focus?.houses?.length?focus.houses:houses.map(h=>h.house);
      out.topicRoles=houses.filter(h=>wanted.includes(h.house)).map(h=>{
        const p=ps[h.lord],incoming=A(chart?.aspects?.graha).filter(x=>A(x.toPlanets).includes(h.lord)),chain=A(chart?.dispositors).find(x=>x.planet===h.lord);
        return {topicHouse:h.house,houseSign:h.sign,lord:h.lord,lordOwns:houses.filter(x=>x.lord===h.lord).map(x=>x.house),lordOccupies:p?.house??null,lordSign:p?.sign??null,dignity:p?.dignity||null,solar:p?.solar||null,retrograde:p?.retrograde??null,occupants:h.occupants||[],incomingAspects:incoming,dispositorChain:chain||null,sourcePaths:['houses.'+(h.house-1),'planets.'+h.lord,'aspects.graha','dispositors']};
      });
      const ds=focus?.divisions===null?Object.keys(chart?.vargas||{}).map(Number):(focus?.divisions||[1,9]);
      out.divisionChecks=ds.map(d=>{const v=chart?.vargas?.[d];return {division:d,purpose:v?.purpose||null,available:!!v,lagna:v?.lagna||null,planets:v?.planets||null,sourcePath:'vargas.'+d,scope:'依本次提供的出生精度使用；未給誤差就不宣稱細分位置穩定'};});
      out.currentPeriodChecks=A(analysis?.activation).map(a=>({layer:a.layer,lord:a.lord,start:a.start,endExclusive:a.endExclusive,owns:a.owns,occupies:a.occupies,conditions:a.conditions,dispositor:a.dispositor,vargaHouses:A(a.vargaHouses).filter(v=>ds.includes(v.division)),aspects:a.aspects}));
      out.timingBoundary='當期資料可檢查當期作用；其他已列區間仍須按運主同尺度比較，不由交運日期自動判作收入目標日期。';
    }
    return out;
  }
  function requestCoverage(method,analysis,options,evidence,chart){
    const plan=root.JYReadingWorkflow?.plan?.({method,question:options.question||analysis?.children?.question||'',notes:options.notes,referenceDate:options.referenceDate,timezone:options.timezone});
    const validOperations=method==='ootk'?A(analysis?.methodData?.layerEvidence).filter(x=>x.valid).map(x=>x.operation):null;
    const units=A(analysis?.items).map((x,i)=>({id:method+'-unit-'+i,label:x.label||x.id||String(i),basis:'本方法逐項作用與原生資料',nativePath:'items.'+i,evidenceCount:A(x.evidence).length,eligible:!['not-started','unknown-time','partial'].includes(x.id)&&(method!=='ootk'||validOperations.includes(x.evidence?.[0]?.operation)),role:'candidate-evidence-not-an-event-verdict'})).filter(x=>x.eligible);
    const available=evidence.filter(x=>x.available&&x.status!=='not-applicable'&&(method!=='ootk'||validOperations.length>0)).map(x=>({label:x.label,path:x.path}));
    const missing=evidence.filter(x=>!x.available).map(x=>({label:x.label,path:x.path,status:x.status,reason:x.reason,haltsOtherEvidence:false}));
    const limitations=A(analysis?.unavailable).map(message=>({message,kind:/證實|準確率|保證|未發生事件|人物心意/.test(message)?'event-not-verified':/未實作|未有可靠|師承|異派|其他.*流派/.test(message)?'outside-registered-rules':'missing-or-limited-layer',haltsOtherEvidence:false}));
    const specialization=analysis?.topicRules;
    return {schema:'jy.request-coverage/1',method,sourceQuestion:plan?.question||String(options.question||''),
      requirements:plan?.requestRequirements||null,situation:plan?.situation||null,availableEvidence:available,candidateEvidenceUnits:units,missingEvidence:missing,limitations,
      usableNativeEvidence:available.length>0||units.some(x=>x.evidenceCount>0),
      specializedClassification:{available:!!specialization,topics:A(specialization?.topics),fallback:'專用分類缺少或未命中，只限制該分類；仍用實際原生骨架與本法一般判讀回答原句。'},
      caseBasis:nativeBasis(method,chart,analysis,root.JYReadingWorkflow?.nativeFocus?.({method,question:plan?.question||options.question||'',plan}),plan?.situation),
      taskCoverage:A(plan?.requestRequirements?.tasks).map(t=>({taskId:t.id,source:t.source,goal:t.goal,measurement:t.measurement||[],evidenceCandidates:units.map(x=>x.id),state:available.length||units.some(x=>x.evidenceCount>0)?'must-synthesize-supported-direction':'requires-concrete-input-gap',resolution:'依實際角色、作用方向與時間形成支持及限制；候選清單未替讀者裁決事件。'})),
      interpretationRule:'逐題從有效原生資料選取實際相關作用；讀者可依具名傳統判法推讀，但不能冒稱新的讀法已由引擎實算。分類清單與語義標籤不是可問問題白名單。',
      timeRule:'本次實算時窗只限制可報的時點；不限期或更長的原問句，不能因窗口外未算就判窗口外永不發生。',
      outputRule:'正文先答當事人原問題，再深入講清理由、重要發現與做法；不展示這份技術清單，不用無法確定代替仍可讀的內容。'};
  }
  function build(method,chart,analysis,options={}){
    const p=P[method]||{profile:'具名方法',required:[['原生資料','items']],order:common.synthesis,conflicts:[],forbidden:[]};
    const evidence=p.required.map(([label,path])=>({label,path,...evidenceState(method,chart,analysis,path)}));
    const missing=evidence.filter(x=>!x.available).map(x=>x.label);
    const methodOutputPolicy=method==='ootk'?{
      fiveLayerRequirement:'每一個完成且有效的操作都要對原題新增一個具體判斷，至少交代本輪支持、反證／限制、承接或轉折；不能把五輪只濃縮成「未知」或一句總結。',
      synthesisRequirement:'五輪完成時，成稿必須明確給出最可能方向、次可能方向、最強反證、會推翻主判的條件與信心來源。方向性推論可以成立，但要和已證實事實分開。',
      attributionBoundary:'問第三方內心時，缺少角色綁定只限制「訊號屬於誰」的確定度；仍要說明關係場／互動場最支持什麼方向。不得把吸引、戒備、溝通、行動、承諾等不同層次全部退回成無法回答。',
      pendingValidationBoundary:'某輪 mainLineValidation 未確認時，該輪只作背景與輔證，不單獨支撐最終主判；其他完成且有效輪次照常閱讀，不能將主線未定當成程序無效。',
      requiredSections:A(analysis?.methodData?.outputContract?.requiredSections),
      methodRules:analysis?.methodData?.layerContract?.rules||null
    }:null;
    return {
      version:VERSION,method,profile:p.profile,
      status:missing.length?'partial-reading':'ready-for-scoped-reading',
      allSchoolsComplete:false,
      truthBoundary:{...common.truthBoundary,claimLevels:[...common.truthBoundary.claimLevels]},
      evidence,
      readingOrder:p.order,
      synthesisOrder:common.synthesis,
      contradictionChecks:p.conflicts,
      forbiddenShortcuts:[...common.forbidden,...p.forbidden],
      confidencePolicy:common.confidence,
      methodOutputPolicy,
      requestCoverage:requestCoverage(method,analysis,options,evidence,chart),
      readingScope:root.JYReadingWorkflow?.readingScope?.(options.question||analysis?.children?.question||'',method)||null,
      precisionPolicy:'精確數值或心意未量測只限制該項，仍須完成切題的象徵方向、相反條件與做法。具名數量規則可作已核前提的傳統假定，不當事實；沒有相關資料不能造線索。',
      missingRequiredEvidence:missing,
      unresolved:[...A(analysis?.unavailable),...evidence.filter(x=>!x.available).map(x=>x.label+'：'+x.reason)],
      sourcePolicy:'來源必須綁定具名規則或profile；同源重複不當獨立驗證；原典互相矛盾時並列，不自行創造唯一版本。',
      outputPolicy:'每個重要判斷在內部核對實算依據，正文用日常用語說原因、尚未確認的部分和可能影響，不要求列出術語或盤位。時間依據保持已算範圍；只有原題明示技術需求才另作說明。'+(method==='ootk'?' OOTK 不得把方法邊界誤寫成沒有答案：界線限制的是事實宣稱，不是盤面方向性推論。':'')
    };
  }
  function toPrompt(c){if(!c)return'';const rows=c.evidence.map(x=>`${x.status==='not-applicable'?'不適用':x.available?'✓':'缺'}${x.label}${!x.available&&x.reason?'（'+x.reason+'）':''}`).join('、');return [
    `【深度判讀契約 ${c.version}｜${c.profile}】`,
    `閱讀範圍狀態：${c.status}。`,
    '成稿方式：對完全不懂命理的人先答原句，再用日常用語深入說原因與實際影響，不講專門術語、牌名或星名；只有原題明示技術需求才另解釋。正常問事不逐牌位／逐宮開欄，相反讀法須比較並收斂，建議不當作結果；核對流程不逐項搬成正文。先答原題，另主動提醒完整盤面重要且有據的發現，說清關聯、範圍與應對；不由名字或缺項補造警告。',
    `真實性界線：${(c.truthBoundary||common.truthBoundary).rule}`,
    `精度與可讀內容：${c.precisionPolicy||'缺項只限制受影響部分；有效資料照常閱讀。'}`,
    c.requestCoverage?.caseBasis?'本題實際核對入口（不是成稿欄位）：'+JSON.stringify(promptBasis(c.requestCoverage.caseBasis)):'',
    `必核證據：${rows}。`,
    `判讀順序：${c.readingOrder.join(' → ')}。`,
    `內部合成核對（不作正文欄位）：${c.synthesisOrder.join(' → ')}。`,
    c.contradictionChecks.length?`流派／反證規則：${c.contradictionChecks.join('；')}。`:'',
    `禁止捷徑：${c.forbiddenShortcuts.join('；')}。`,
    `置信規則：${c.confidencePolicy}`,
    c.methodOutputPolicy?`本法輸出契約：${[c.methodOutputPolicy.fiveLayerRequirement,c.methodOutputPolicy.synthesisRequirement,c.methodOutputPolicy.attributionBoundary,c.methodOutputPolicy.pendingValidationBoundary].join('；')}\n必要內容覆蓋（可自然組織，不是固定標題）：${A(c.methodOutputPolicy.requiredSections).join(' → ')}`:'',
    '完整性界線：通過只代表本次具名方法的已實算範圍可讀，不代表全部歷史流派已實作或事件已被證實。',
    c.missingRequiredEvidence.length?`必要缺項：${c.missingRequiredEvidence.join('、')}；不得補造。`:'',
    A(c.unresolved).length?`本引擎明列未決：${c.unresolved.join('；')}。`:''
  ].filter(Boolean).join('\n');}
  function summary(c){return c?{version:c.version,status:c.status,allSchoolsComplete:false,truthBoundary:c.truthBoundary||common.truthBoundary,requestCoverage:c.requestCoverage,missing:c.evidence.filter(x=>!x.available).map(({label,status,reason})=>({label,status,reason})),scope:'只指本次具名方法已實算範圍；判讀主線、支持與反證及禁則合讀前文。'}:null;}
  function promptBasis(b){return {...b,divisionChecks:A(b.divisionChecks).map(({planets,lagna,...rest})=>rest),currentPeriodChecks:A(b.currentPeriodChecks).map(({conditions,vargaHouses,aspects,...rest})=>rest)};}
  root.JYNativeDepthContract=Object.freeze({version:VERSION,profiles:P,build,toPrompt,summary,requestCoverage,nativeBasis});
})(typeof window==='undefined'?globalThis:window);

}
})(typeof window!=="undefined"?window:globalThis);
// END GENERATED OOTK EXPORT RUNTIME
// BEGIN GENERATED WORKFLOW
/* Local answer planning and review. No network, random draws or chart mutation. */
(function installReadingWorkflow(root){
  'use strict';
  var VERSION='2.6.0';
  // Reinstallation is stateless and keeps direct CommonJS imports usable even
  // after an embedded standalone copy has populated the global API.
  var FOOTER='[靜月之光蝦皮賣場](https://shopee.tw/a50h95648d?tab=shop)\n願你諸事順遂。';
  var METHODS={
    tarot:{name:'塔羅',basis:'實際牌位、方向及相互作用',path:'結果與阻礙先定方向，原因和行動位解釋怎樣改變條件；非時間牌位保留原功能。'},
    ootk:{name:'開鑰之法',basis:'五個完成輪次、代表牌落域、實際計數、配對與元素尊貴',path:'每一有效輪次都先對原題新增一個具體判斷，再標出支持、反證與對前輪的修正；五輪完成後收斂最可能方向、次可能方向、最強反證、改判條件與信心。第三方角色歸屬不足時降低確定度，但不把可讀的關係場訊號一併寫成未知。'},
    lenormand:{name:'雷諾曼',basis:'完整主線、實際相鄰、已指定人物與合法幾何',path:'先由完整牌句形成答案，再由相鄰承接找干預點；鏡像只補充尚未解答的部分。'},
    bazi:{name:'八字',basis:'四柱、月令、藏透根氣、生剋通路及實算歲運',path:'分開格局條件與承受力，找切題阻點及救應，再說明運歲增減了哪些條件。'},
    compat:{name:'合盤',basis:'各自原局、雙向作用與共同時間區間',path:'先各自成判，再辨支持與衝突如何互動；將最關鍵卡點轉成雙方各需承擔的一項協議。'},
    ziwei:{name:'紫微斗數',basis:'主宮星組、三方四正、四化來源及限年座標',path:'主宮讀做法，三合讀資源，對宮讀牽動；分開本命與限年，解釋收益、成本及調節通道。'},
    meihua:{name:'梅花易數',basis:'原體、用、節令、本互變與實際動爻',path:'體用定當前承擔，互卦定過程關卡，變卦看調整後條件；據此回答進退和第一步。'},
    liuyao:{name:'六爻',basis:'問題用神、世應、月日、旬空月破與有效動變',path:'追蹤生扶或克制能否送達用神，與世應承擔分開；找成事或解阻必須滿足的條件。'},
    yijing:{name:'易經',basis:'本次主讀與參讀原文、動爻及擇辭政策',path:'從原文處境、行為與結果的因果回答進退，說清轉折條件，將古義落到本題行動。'},
    oracle:{name:'靈籤',basis:'有效籤系、完整原詩及可靠典故',path:'全詩定進退，轉折句定前提，說清在等什麼或改什麼；以可觀察條件落實。'},
    astro:{name:'西洋占星',basis:'本題宮主、落宮、相位兩端與實算行運',path:'從宮主的事件路徑辨資源與代價，再比較相關星體的需求及當期承接。'},
    vedic:{name:'印度占星',basis:'D1宮主、有效分盤、尊貴受照與實算運期',path:'D1先成判，專題分盤查承接，大副運定位當期條件；相反訊號按各自層級取捨。'},
    name:{name:'姓名學',basis:'字形筆畫來源、字義讀音與同體系五格三才',path:'依實際用途比較名字的使用得失，數理象義與字義讀音分開，說清保留或調整哪個字。'},
    liuren:{name:'大六壬',basis:'天地盤、四課三傳、天將六親旬空、64課族與290具名神煞及實際年命',path:'干支兩端先辨人事，沿初中末傳追生克及空破能否承接；由實際命中找支持、阻點和可介入條件，不從課名直接斷事件。'},
    personality:{name:'人格',basis:'原始四柱與十神通路、模型摘要和本人經驗',path:'由有力結構提出行為假設，分長處與負荷代價，給可用實際經驗驗證的小練習。'}
  };
  var GOALS={
    help:{name:'做法／幫助',opening:'第一段直接給最值得先做的具體行動，以及為什麼先做；把開口方式或第一步說出來。',body:'後續各段說明：你可調整哪一環、對方或環境需配合什麼、什麼反應表示有效。'},
    compare:{name:'比較／決策',opening:'第一段依本題重點選出較支持的方案及代價；證據不能分高下時，明說決勝條件。',body:'用同一標準比較各方案，區分短期收益、持續成本與成立條件；保留原選項。'},
    timing:{name:'時機／發展',opening:'第一段先說可判的時間範圍與發展方向，或目前欠缺的必要條件。',body:'分開原局條件、當前觸發和可觀察進展；盤上時間分界與現實事件日期分開。'},
    enumeration:{name:'開放列舉／注意事項',opening:'第一段先回答原句要你列出的類別或注意事項，指出本方法能支持到哪一層。',body:'按盤面整理少數有依據的項目與它們的先後／作用；逐項說明實際含義、最大的限制和核實方式。只有原句另有明確的是非門檻時才附上是非判斷；資料不支持的精確項目直說缺口並給可行的查核步驟。'},
    explain:{name:'原因／結構',opening:'第一段直接點出最有依據的核心卡點及它如何影響原問題。',body:'追出支持如何傳到結果、哪一環被牽制、牽制如何形成或解除；把最強反證放回它實際限制的層次，並指出會改判的條件。'},
    direction:{name:'傾向／是否',opening:'第一段直接回答原句事件較支持成立、不成立、條件尚未接好或具體哪一點未決；能判傾向就不平均羅列所有可能。',body:'先說維持目前條件的走向，再用實際作用解釋理由與牽制。依原句分清感受與實際事件；建議如何改變條件另作條件推演，不把「主動就有機會」當成結果，不機械列五個階段。'},
    general:{name:'整體／開放題',opening:'第一段先整理本題最有影響的主軸與優先順序，讓使用者知道現在重點在哪。',body:'圍繞原問句展開，各子題先回答；完整盤面供判斷，原題之外重要且有據的關係也主動說清。'}
  };
  function kinds(input){
    var a=Array.isArray(input)?input:[input||'tarot'];
    return Array.from(new Set(a.map(function(k){return k==='western'?'astro':k==='chart'?'bazi':k;}))).filter(function(k){return !!METHODS[k];});
  }
  function numeral(value){
    var s=String(value||'').replace(/兩/g,'二');if(/^\d+$/.test(s))return Number(s);
    var digits={零:0,一:1,二:2,三:3,四:4,五:5,六:6,七:7,八:8,九:9};
    if(s==='十')return 10;if(s.indexOf('十')>=0){var a=s.split('十');return (a[0]?digits[a[0]]:1)*10+(a[1]?digits[a[1]]:0);}return digits[s];
  }
  function reportScope(question,method){
    var q=String(question||'').trim().replace(/个/g,'個'),p=q.match(/(?:前|頭|最初)\s*([一二兩三四五六七八九十\d]+)\s*(?:個|段|組)?\s*(?:大限|大運)/),n=p?numeral(p[1]):null;
    var full=!q||/(?:全盤|全命盤|整張命盤|整體命盤|完整(?:的)?(?:命盤|星盤|牌陣|卦例|解籤)|十二宮|所有面向|所有領域|各個方面|各方面|一生運勢|終身運勢|全生涯)/.test(q)||/(?:全面|完整).{0,6}(?:命盤|星盤|牌陣|卦例|籤詩|全盤)/.test(q);
    var annual=/(?:每一?年|逐年|(?:所有|全部).{0,8}流年|各流年|所有年度|各年度|年度分析|年度逐項)/.test(q);
    return {mode:full?'full':annual||p?'timeline':'focused',fullChart:full,annualRequested:annual,monthlyRequested:/(?:流月|逐月|各月|每月(?:的)?(?:運勢|趨勢|分析|都要|分開|逐一))/.test(q),requestedDecades:Number.isInteger(n)&&n>0?n:null,
      allDecades:!n&&/(?:所有|全部|每步|每個|逐一|各個)\s*(?:大限|大運)|(?:分析|解讀|詳解|請看).{0,8}(?:十二|12)\s*(?:個|段)?\s*大限/.test(q),method:method==='western'?'astro':method||null,
      policy:'範圍來自原問句；資料仍須實算，深度字樣不自動擴成全盤或逐年題。'};
  }
  // BEGIN GENERATED WORKFLOW METHOD GUIDES
  var METHOD_GUIDES = {
  "tarot": [
    "【塔羅：牌位與組合】按本次原生牌陣判讀；獨立牌位、三牌組、連續牌列、分支、軸線與配對保留各自功能，不互換成固定時間線。",
    "RWS 使用實際正逆位及牌圖；Book T 使用本次對應與真正有序相鄰的元素尊貴，不混套固定逆位。逆位依位置和全局判受阻、內化、過度或鬆動，並非一律相反。",
    "全盤先形成主線，再找最能回答子題的牌位關係。結果與原因、阻礙、建議合讀；建議說明如何介入，不等於事情已發生。",
    "牌的本義由位置和組合限定；花色、元素與重複圖像只作背景，同一牌在多個關係出現不增加獨立證據。",
    "一般正文以白話說清事情如何發展與原因，牌名、方向和位置留作內部核對；只有明示技術／逐牌解釋才列出。全盤檢視不等於每張都各寫一段。",
    "把阻礙牌如何限制結果、建議牌如何改變條件連起來。若問題問能否發生事件，情緒牌只能支持感受層面，還須找行動與結果位置；不能用『有好感』替代『會主動交往』。有利牌與不利牌先判在說哪個層面，不以張數相抵。",
    "問性關係、成交或錄取等具體事件，先核結果位支持的是實際成立、維持現狀還是只提供資源，再與阻礙及助力合讀。權杖王牌在建議位不證明性關係會發生；未出現惡魔、戀人等特定牌也不能當作不發生的證據。不能從金幣牌補造工作、輪班、收入或人物身分。",
    "【塔羅判讀主線】先把結果／方向位與最直接的阻礙位合成一句答案，再用原因、當事人行動與環境牌追溯成因。若結果有利而行動不足，主判是具備條件但尚待落實；若意願有而承擔位受阻，回答卡在執行或現實門檻。由實際牌位區分是哪一層受阻，讓建議牌成為改變這一層的方法。",
    "對比方案時，各沿自己的投入、代價、發展及結果位完成一條路徑，再用原問題最在意的標準比較。矛盾牌先核先後、內外與人物歸屬：同一件事可能短期吸引、長期昂貴；說清你較支持哪一段選擇，以及哪個現實條件出現時應改判。",
    "【塔羅深入合讀】逐一核對全部實際牌位職責與正逆方向，形成完整牌陣的發展結構；需求、可採行動、環境、結果和阻礙各自成義，再串成結果能否落實的路徑。單張本義不能取代相鄰關係、核心牌與不同支線的共同作用。",
    "主線與子題逐一成判，區分情緒、意願、實際行動與持續；人物牌不自行指認身分。逆位綜合牌面、位置與全局，分辨內化、受阻、過度或鬆動，不能一律翻成相反。",
    "時間與影響程度來自實際時間位及發展順序；只有序列時給相對階段，不自造月份。每個關鍵轉折連同成立條件、支持牌位、最強反證及可採行動說明。",
    "【塔羅術語界線】死神、塔、寶劍等名稱不能直接斷死亡、災難或人生失敗。保留本次牌位、方向、組合和反證，結果牌仍是條件性象徵，不能保證事件。",
    "【議題線索與精度分開】子女題合讀本次原問句綁定的結果、限制及可介入牌位，孕育、照顧、家庭圖像要由全陣限定。可作有根據的事件傾向解釋，不把情緒等同懷孕、不由皇后或牌面人像數孩子。缺數量測量只限制數字，並非整陣不能回答。",
    "【本法重要發現與解惑方式】合讀全陣重要支線與反覆模式；未問但會影響決策、互動、界線或下一步的關鍵牌組也要解釋，牌圖不當成未提供的現實事故。"
  ],
  "ootk": [
    "【開鑰之法：依實際版本與完成紀錄】Mathers 原稿五次操作與 Liber LXXVIII 驗題版分開；Ace 計數、配對、第四輪起點及停止條件依本次版本，不互套。",
    "五次操作不是五個月份，而是五層閱讀。每一個完成且有效的操作都必須對原問題新增一個可辨識的判斷：先讀該輪代表牌落域，再讀合法計數故事、配對與元素尊貴，說明本輪最支持什麼、最強反證限制哪一層，以及它如何承接、修正或推翻上一輪。不得只列牌義或把五輪壓成一句總結。",
    "計數跳轉不當成元素相鄰；元素尊貴只用提供的有序相鄰線。配對、計數與落域若方向不同，先分辨它們是否在回答不同層次，例如注意／吸引、意願、行動、承諾、持續或結果，再判哪一層真正受阻。",
    "第一輪 mainLineValidation 未確認時，第一輪只能降為次級背景，不得拿來當高權重核心；第二至第五輪若已完成且有效仍須正常解讀，不能因此把整盤降成『無法回答』。",
    "問第三方怎麼看、是否喜歡、是否願意等主觀題時，沒有明確第三方代表牌綁定就不能寫成已證實內心；但『不能證實』不等於『不能判方向』。必須把五輪收斂成最可能的方向性模型：可歸屬的訊號寫成較支持的推論，無法歸屬者標成關係場／互動場訊號，並說清哪個現實條件可驗證或推翻。",
    "五輪完成後必須明確輸出：最可能方向、次可能方向、最強反證、會推翻主判的條件與信心來源。不能只說『存在情感／衝突／吸引議題』而不交代方向、程度與作用層次，也不能把未知角色歸屬擴大成整盤未知。",
    "只在紀錄明示中止、無效或資料損壞時停止；未完成操作不補成五輪結論。正文要把五層真正用來回答原題，不逐步重抄每次計數與配對。",
    "【開鑰判讀主線】五輪不是把同一句答案重講五次。第一輪建立當下基底，第二輪讀事情怎麼展開與互動，第三輪讀更深的結構門檻與承接條件，第四輪用三十六牌環抓累積張力與真正轉折，第五輪收束最終傾向與保留條件；仍以各輪實際落域為準，不把這些名稱硬套成固定事件。每輪都要回答「這一層讓原題多知道了什麼」。",
    "每輪先形成一個明確主判，再各找最強支持與最強反證，並寫出它對上一輪是延續、加強、削弱、轉向還是只補充另一層。重現牌只代表持續主題，不重複加票；真正轉折須由落域、計數、配對或元素尊貴的作用改變支持。",
    "五輪收斂時，不以「象徵不能證明事實」作為答案終點。先說盤面最支持哪個方向、程度到哪一層，再給次可能解釋與最強反證；第三方角色歸屬不足時降低歸屬信心，但保留關係場／互動場的方向性資訊。最後指出什麼現實行為或條件出現時應改判。",
    "【開鑰之法深入合參】按本次完成輪次逐輪讀代表牌落域、合法計數故事、配對及元素尊貴；每一輪都必須對原題新增一個不同層次的主判，再追各輪如何承接或改變條件。不能把尚未完成的操作補成結果，也不能把所有計數牌當成相鄰。",
    "逐輪至少交代：本輪最支持的方向、本輪最強反證／限制、它限制的是注意／感受／意願／行動／承諾／持續／結果中的哪一層，以及本輪對上一輪造成何種修正。若某輪只能讀關係場而不能歸屬到特定第三方，照樣保留該層資訊，不用『未知』把整輪刪掉。",
    "跨輪相反時先辨領域、角色、條件是否相同；同一命題仍衝突才保留未決部分。第一輪主線未確認時降權但不封鎖後四輪。全程核對停止紀錄、實際操作與牌組來源，重複牌只保留作用，不重複加權。",
    "完整五輪最後要形成一個資訊密度足夠的收斂：最可能方向、次可能方向、最強反證、成立條件、改判條件、信心來源與現實驗證點。『無法證實他人心意』只能作事實宣稱邊界，不能取代上述方向性判讀。五輪不硬配五個月；人物身分、事件次數及日期仍須有本法真實支持。",
    "【開鑰術語界線】五輪完成只證明程序與資料範圍，不證明客觀事件必然。五輪同源訊號仍是同一盤的多層解讀；保留有效主線與反證，不把跨輪一致寫成命運確證。",
    "【議題線索與精度分開】子女題合讀每一個完成且有效輪次對同一問題的新增判斷，追孕育、照顧、責任及事情是否落實的主線。未完成只限該輪；計數跳步是程序位置，不能當孩子數。仍須整合有效輪次給方向，不能只說無法確定。",
    "【本法重要發現與解惑方式】逐輪深入交代第一至第五輪有效資料新增的理解，重要的跨輪轉折和代價即使未問也提醒；採自然敘述，輪次標示供辨識，不套支持／反證欄位。"
  ],
  "lenormand": [
    "【雷諾曼：完整牌句】依原問題→相鄰牌→完整長線→實際位置選主義；相鄰 A→B 是主題與修飾的關係，加入C後重讀全句。中間牌要有實際功能，末牌與全線共同定落點；這些是判讀方法，正文直接說牌句在本題的意思。",
    "短線先讀相鄰組合再讀完整牌句。九宮格以中心及最切題的穿越線形成主判，外框、外圍線及鏡像只有提供新資訊時才補充。",
    "大牌陣先讀人物／主題近域與落宮，再延伸實際長線、距離、方向、鏡像及騎士步。遠距技巧不憑數量壓過近域主線，重複節點只算同一訊號。",
    "人物須有角色依據；月亮、蛇、狐狸等取義由組合限定，不由單牌認定第三者、職業、欺騙或私密事實。共同九宮格沒有獨立的人物支線時，只回答共同走向及個別未定部分。",
    "牌句最後要落到本題中的事、阻力與條件；同樣的魚、錨等符號在收入題與感情題不可照貼同一套文案。相鄰修飾是可採讀法，不把名詞加形容詞當唯一文法；先核全線語義是否連貫及是否遺漏轉折牌。",
    "【雷諾曼判讀主線】先把主題牌與相鄰牌組成一個具體生活句，再讓後續牌修改事情的方式、阻力和落點。以「誰的什麼事、透過什麼途徑、遇到哪個轉折」完成整條牌句；例如同一阻礙牌在開端可能限制起步，在收尾則可能限制完成，須由實際次序決定。",
    "九宮或大牌陣從本題人物／主題的核心線建立主判，再用落宮、近域與穿越線查原因及可用資源。兩方各有定位時分別說明靠近、投入與距離的條件；多條路線相反時，指出是各自立場不同、不同領域有代價，或主題仍被同一關鍵因素卡住。",
    "【雷諾曼深入牌句】讀完全部切題相鄰牌句和長線，保留中心、起訖與方向，辨人物近域、問題主線及方案分支的共同作用；牌的含義由句法與角色限定，不能挑幾張吉凶牌取代整條牌句。",
    "大牌陣依實際落宮和幾何讀近遠、行列及已採鏡像，分清人物、領域與環境；未指定人物不補指認，合法配對不可冒充相鄰。",
    "全盤逐重要區域及已知人物整理支持、阻力與發展；單題將相關牌組合成主判。時間只依實際牌陣及明列口徑，牌號或距離不自行換成確切天數。",
    "【雷諾曼術語界線】棺材、鐮刀、十字架等圖像由本題牌句與幾何限定，不直接證明死亡、厄運或終身負擔。宮位與騎士步是同一牌面的不同關係，不是獨立事件證據。",
    "【議題線索與精度分開】子女題依實際問題綁定、孩子等主題牌與合法幾何、宮位及牌句合讀；童年、新開始和實際子女不得互換。可判切題的發展與限制，不把兒童、鸛或牌號單獨當生育證明或人數。",
    "【本法重要發現與解惑方式】檢視本次完整牌句與合法幾何，主題以外重要的相鄰牽動、資源或阻力也說清楚；短線限於本次事情，大牌陣才延伸到有角色及位置依據的其他面向。"
  ],
  "bazi": [
    "【八字：原局作用與歲運】核四柱、月令、藏透、根氣及曆法政策；月令取格後審成敗救應，身的承受力與格局成立分開。食神制殺、殺印相生等須有實際力量、位置和通路，不由名稱並存判成立。",
    "格局、扶抑、調候各解不同問題，取用以目前阻斷全局的因素定先後；通關須連接交戰兩端。五行百分比不是缺什麼補什麼，候選用神不是已定處方。",
    "合沖刑害先核成立，再分合絆、牽動、根損與成化；合化查季節、化神透根、爭合及阻隔，從格需核有效根氣和逆勢援助。",
    "十神與柱位依本題角色成義。大運改變階段背景，流年干支觸發原局；正文以切題作用說明主判，另提醒重要且有據的原局模式與歲運轉折，不重抄格局驗算。",
    "十神不是人格好壞分級，旺極等自動標籤與相對分不是原典定論。某行可洩身不等於任何數量都適合；土的燥濕、水火所處季節、透藏根氣及制合會改變效果。以原題相關取用為主線，兼顧重要且有據的連帶作用，不能從『喜土』跳成理財可靠或佩戴土色必有益。",
    "《窮通寶鑑》120入口依本盤日干、節令月及實際透藏證據核對；合述季節保留合述。同一句有強弱、清濁、有效制化等待判條件時，不得把字面透藏符合寫成全條成立，或直接照搬原文富貴斷語。",
    "【八字判讀主線】先判月令格局需要哪些條件才能運作，再核日主是否承受得住，找出目前最先要處理的生剋阻點。官印能接續時，壓力可經由規範、學習或資源承接；食傷能生財時，表達或產出才有變現通路。每條路徑都以本盤透藏、根氣、位置及制合作依據，再落到原題中的能力、責任、資源與代價。",
    "歲運題要說出「新增什麼、牽動原局哪裡、原有制化能否接住」，比較進運前後可承擔的事如何改變。婚戀聚焦日支與關係角色、財務聚焦產出到所得再到保留、職涯聚焦能力到位置與權責。最後選一個最值得調整的環節，說清做何事會有幫助、在哪些條件下反會增加負擔。",
    "【八字深入全局】先核四柱、藏干、月令、節氣及交運政策，將日主承受力、格局需要和調候需求分開。根氣、透藏、生剋通路與合沖刑害共同成判，不以五行數量、單一十神或前端旺衰標籤下結論。",
    "格局須核月令立格、透藏與成敗救應；從格、化氣格審實際成立條件。扶抑、調候、通關與病藥並非同一取用理由，牴觸時交代先後和能改判的條件。",
    "學業、事業、財務、婚戀、家庭與生活負荷各自連回本局功能通路。財星只是資源議題，能否取得與留住須合日主承受、食傷輸出、官印制化及歲運。",
    "大運與流年逐段判新增干支如何引動原局、喜用能否承接及忌勢有無救應。交運年保留前後區間；逐年列運期、主題、偏利／偏阻／混合、象徵影響程度、盤面依據、條件與檢查點，不因相同年干重複套話。",
    "【八字術語界線】身弱、財多身弱只描述此模型中的作用負荷；需合原局有效印比、食傷生財、官印制化、成敗救應及歲運才判本題順阻。不能只憑這個標籤斷不能工作、不能有錢或婚姻必敗；印比扶身也不一律有利，特殊從勢與調候仍須分層。",
    "【議題線索與精度分開】子女題核本次明列性別與採用取法、子女角色實際透藏根氣、時位及真正作用、已算運歲。若有 children 議題資料須合讀各支線與數量規則。古訣初查數可作具名象徵假定，不能自動當今生全部親生子女總數；自行中和、符號個數或一個不利配對都不能硬斷少子、無子。原局未見仍追已算運勢；時位有印也不能單憑它保證晚年受子女供養。",
    "【本法重要發現與解惑方式】讀原局反覆模式、成敗救應及實算當期歲運；重大資源、工作負荷、關係需求或轉折，即使未問也解釋其作用和應對，不將標籤斷成終身命運。"
  ],
  "compat": [
    "【合盤：雙方原局與互動】各自核A、B原局、需要與承受力，再看A對B及B對A的作用；兩盤不合成八柱原局，對方某五行不是本人的補劑。",
    "婚戀、合夥、親子、主管部屬按原問題角色取象；先讀最影響本題的支持、衝突與調節通道。吸引、投入、承諾與長期維持分層判斷。",
    "各自歲運定位後才比較同一時段。正文直接回答關係主判，以具體雙向互動說明卡點與可試行的協議；不強制先輸出兩份完整命盤報告。",
    "日主相生不是付出方向，十神映射不是對方的心理報告；正官、食神不自動代表信任或善意，七殺不自動代表壓迫或不確定。不得由『木生火、受方忌木』直接得出『你越付出她越反感』。先核雙方完整原局、實際作用位置與相反通道，落到相處方式時明示為待核對的假設。",
    "日支彼此的關係與日支對另一方年月時支的關係要分開；同一對支的沖與刑不可當成兩個獨立問題。跨盤湊齊三合三會只列分布參照，不合成新的原局；合不保證有情，沖不保證決裂。雙方所有年干、宮干、限年四化保留來源，重複同干查表不增強結論。",
    "【合盤判讀主線】先從兩人各自原局建立與本題有關的需求假設與調節方式，再看跨盤哪一組作用讓兩人的方法接得上、哪一組讓付出難以被接收。分別回答A面對B要調整什麼、B面對A要承擔什麼；把日支互動、生活安排和外部責任分層，選真正改變關係品質的主因。",
    "結構性挑戰要落成一個可核對的循環：在什麼議題上，一方的做法可能引出另一方何種回應，回應又如何加重原問題。每個角色判讀各附其盤面依據；若只有象徵而無相處紀錄，就把循環當作供本人確認的情境。協議須同時容納兩方需求，寫清決策權、回應方式或時限，以及用什麼行為判斷改善。",
    "【合盤深入雙向判讀】先獨立讀A、B需要、能力與承受力，再核跨盤作用的來源、方向及實際角色。吸引、溝通、金錢分工、承諾與持續各自論證，不以元素相生或投影落夫妻代替對方心意。",
    "找最有力的互補如何被對方承接，以及最強反證限制意願、行動還是持續；同源合沖不重複加權。具體相處循環在沒有紀錄時只作待核對假設，轉成可試行的雙方協議。",
    "時機比較各自實算歲運的共同窗口，辨一方有機會而另一方未能承接的情況。資料單方、未知時辰或沒有互動背景的部分明示限制，不把未知視為必然不合。",
    "【合盤術語界線】雙向支持與衝突是待對照現實的相處假設；盤合不保證同意，盤沖不保證分手。保留各方完整原局與同期窗口，再提出雙方能選擇的調整條件。",
    "【議題線索與精度分開】子女與生育規劃題先看兩人各自具名方法的相關結構，再看共同階段、需求與實際可協調條件；不能合併兩盤子女符號當人數，也不能推定伴侶生育意願。有一方缺時辰只限受影響部分，仍完成其他有效關係分析。",
    "【本法重要發現與解惑方式】雙方重要的互補、消耗、界線及時間不同步即使未問也提醒，說清哪一方的已算結構提供依據；具體相處循環保持待本人核對，不猜對方秘密。"
  ],
  "ziwei": [
    "【紫微：主宮星組與牽動】核命身、宮支、五行局、農曆與運限政策；按本題選主宮及實際三方四正。本命、大限、流年同名宮未必同一格。",
    "本宮主星組合連同廟旺、輔煞、三合資源及對宮牽制成判；空宮借對宮是參照，不改原盤。逐顆吉凶計票不能取代組合作用。",
    "四化保留星性與來源、落宮：生年、宮干、大限、流年各自定位，自化及來因宮依本次流派；祿忌或權忌同會不直接抵銷。",
    "疊宮保留本命與運限宮名，限年需有實算資料。正文以原題相關宮組為主線，另提醒全局重要且有据的宮位／運限牽動；全盤題完整展開十二宮，單題不抄每層飛化過程。",
    "逐筆核四化引用的來源方、層級、宮干、星曜、化象、受方和落宮。相同天干在生年與宮干重現不是兩份獨立證據；不同來源的化祿、化忌必須同時保留。命宮格局不能替代關係題的夫妻、福德與運限結構；化祿不證明本人目前有錢或對特定人願意付出。",
    "十干四化版本依本次選表，壬科左輔與天府不可混表。48宮干飛化及連續路徑是實際圖關係；楚天雲闊两轉象條件以生年為體，運層宮職重標不冒稱重配運干。尚未提供的口訣、案例人物私事不得補造。",
    "【紫微判讀主線】主宮回答事情怎麼運作，三合宮查可調用的資源，對宮查角色與環境的牽動；先讀主星搭配的共同作用，再看輔煞與廟旺如何改變做法的成本。關係題把夫妻的互動方式、福德的內在滿足、田宅的生活安排與官祿的責任牽動串起來，選其中最卡住的一環回答。",
    "四化依星性說清增加的是什麼、主導的是什麼、可疏解的是什麼、代價集中在哪裡；順著來源宮到落宮說明兩個領域怎麼牽連。大限改變焦點與可用資源，流年再指出本年何處被觸發。遇到祿忌同會時，回答取得某種好處需要付出什麼代價，以及現有輔助通道能處理多少。",
    "【紫微深入全盤與限流合參】核十二宮宮干地支、命身、主星同宮組合、主輔煞曜廟旺及空宮借對，再由各主宮實際三方四正與夾宮建立資源、需求、成本及制化通道；單星亮度、格名與吉凶計票不能代替組合作用。",
    "三合讀本命骨架；飛星追發射宮干→化曜→落宮→對宮牽動；欽天來因及向心／離心自化只按已採口徑解釋。河洛視角須有明列宮位數理與起例才具名推演；只有五行局不冒稱完成河洛專盤，不同派同源四化不當成多次驗證。",
    "全盤題完整展開十二宮，再整合健康生活安排、學業、事業、財務、人際家庭和婚姻感情。每宮說主星組合如何承接命身、三方資源、對宮牽動與關鍵四化。財帛空宮、福德對宮、本命三方及運限財官分層連接，不能只說靠人脈或有財庫。",
    "運限以本命、大限、流年三套座標合讀，保留本命與各層宮名，核四化、自化、流曜與同宮／對沖。小限、流月有實算資料才補充；原局資料的限流疊宮無不代表年度無疊宮。",
    "逐年題依每一指定大限與每一流年分別成判，列年度／虛歲／大限、議題、偏利或偏阻及條件、象徵影響程度、具體星組和四化依據、需注意的事與行動。相同年干在不同大限及落宮不能套同一句；關鍵窗口給有據年段、領域、反證，不自造已發生事件或月日。",
    "【紫微術語界線】煞、忌、陷及夫妻宮組合不是終身判決。按所選四化表與實算宮組、來源及運限核對承接與反證；不能由一宮或單顆星保證貧富、離婚、孤獨或疾病。",
    "【議題線索與精度分開】子女題合讀本次子女宮、相關對宮及三方、實際四化與已算運限，區分親子相處、生育議題和數量假定。不得只因沒有已驗證人數便停止；要完成真正支持的方向與關鍵時段。未註冊數量取法時不由星數換人數。",
    "【本法重要發現與解惑方式】完整看本命與已算運限；未問但由重要宮組、四化牽動支持的資源、壓力、關係模式和時間轉折也指出，分清本命及運限，不由煞忌名稱預告災難。"
  ],
  "meihua": [
    "【梅花：體用與本互變】核起卦法、保存時間、上下卦及動爻；動爻所屬經卦為用，另一卦為體。互卦上下與變後用卦都對原體，原體不重新設立。",
    "用生體、體生用、體克用、用克體、比和，配起卦節令旺衰看助力、付出、掌握、約束與協力是否有力，不能只數吉凶。",
    "本卦讀局勢，互卦讀中間牽動，動爻與變卦讀關鍵轉折；爻辭、類象和實際外應依本次起法與情境。正文用改變答案的轉折串成故事，不固定分五段講卦理。",
    "應期須有明示方法與時間尺度；實務檢查日與預測分開。一卦的本互變不是不同方案的各自抽卦，也不是多份獨立證據。",
    "【梅花判讀主線】以體的節令力量看當事人能否承擔，以用對體的實際生克判外在事情如何作用；體克用偏向需要自己掌握，體生用偏向投入耗力，用生體偏向有助力，用克體偏向受約束，比和偏向可協力，成色再由旺衰與全卦修正。先給目前宜推進、調整或等待的主判。",
    "互卦找過程中哪一端增加支持或負擔，變後的用對原體則看關鍵轉折後條件改善還是加重。將本、互、變連成「起初可用條件—中途關卡—調整後方向」，再以切題爻辭或已提供外應定位做法，交代要先解決哪件現實事情。",
    "【梅花深入體用與動變】先核實際起卦、原體用、節令旺衰和動爻，再讀本卦、互卦、動變如何改變原條件；原體用角色不能在每一步任意交換。生剋是象徵作用，不是任何人的情緒或意願。",
    "分清體的承受、用的要求、互卦中間條件及變卦後續成本；生體也需能承接，克體須審旺衰及救應。全部相關卦氣先核完，再選真正改變答案的路徑。",
    "完整卦例按本、互、動、變回答全部子題，給進退與實務檢查點；應期須有明確起例和尺度。本次短期卦不擴成一生年表。",
    "【梅花術語界線】體用生克只指本次起卦事情；用克體不等於命差，變卦生體不保證未來成功。固定原體並合旺衰、本互變和本題範圍，不擴成終身財運或婚姻評等。",
    "【議題線索與精度分開】子女與生育題只沿本次有效體用、時令及本互變讀事件方向與阻點；沒有時辰或外應的項目分開限縮，不整題退回未知。單次卦不決定今生孩子總數，也不把卦數直接當生育數。",
    "【本法重要發現與解惑方式】本互變及體用中重要的連帶成本、過程關卡和可介入轉折也提醒，限於本次問事範圍；說清卦象如何作用，不只列生剋吉凶。"
  ],
  "liuyao": [
    "【六爻：納甲與用神】只依本次已保存的六次爻值、月建、日辰及換日政策判讀。初爻在下、上爻在上，可有零至六個動爻。核本卦八宮、世應、六親、六神、伏神；變爻六親仍以本卦卦宮五行為基準，不重新換宮取六親。",
    "先按原問題確定用神與角色；自動候選只是取用方向，不是已確認的人物。一卦中的世、應不憑空分配多位對象，也不把本卦和變卦當成兩個方案各自起卦。感情須依已知關係，不只按性別決定妻財或官鬼。",
    "明示性行為或多人親密情境時，分開判伴侶的意向、問卜者承擔、額外參與者、安排／行動與事件是否發生。僅有世應只能說已映射的雙方對接；不能自動擴成第三人支線，也不能由單一六親推定任何人的性意願或同意。未提供第三人的角色對應或本法有據的事件用神時，清楚標出尚未解析的那一層，不拿未定義的象徵補洞；現實中須逐人確認明確且可撤回的同意。",
    "月日生扶克洩、旬空、月破與動爻作用合看；月令／日辰關係須按來源方向解讀，『受生／受克』描述的是月日元素，不可倒讀成爻受生／受克。日沖只是一個客觀標記，須辨旺衰才判暗動或日破。六沖、六合、遊魂、歸魂、六神與某一六親不單獨決定成敗，不用吉凶分數冒充機率。",
    "先讀所選事情用神及其 influences.network：逐候選找出最有力的生扶與克制，再核月日、旬空、月破、旺衰和動靜。世應都相關時，說明同一爻如何分別作用於世與應；不可只報『元神／忌神』名目，也不可漏掉會改變主判的反向作用。靜爻仍按月日強弱與角色納入，不因靜止就略過。",
    "動爻才有直接動化作用；變爻只回作用於本位動爻，不能把變出的六親當成另一個已發生的人事或對方心念。之卦靜爻的納甲是背景，不是新增動爻。回頭生克、進退神與飛伏條件需落回用神的實際作用。三合須列出完整支組、動爻數及空破條件，依本法明示規則判為動局、靜背景或待條件，不把『三合』兩字直接當吉象。先說事情目前可不可行、卡在哪裡，再用最有影響的爻組說明，不逐列朗讀排盤表。",
    "應期須有用神、動靜、沖合與時間尺度的明確依據，保留條件；不由空亡或一個支位自造精確日期。六爻不套梅花體用，也不套周易按動爻數擇辭的方法。",
    "增刪第8章取用保留明列人物角色與作者案語；妹夫世、姑姨父母／兄弟的重義不可静默改成單一角色。應期月日以實際交節與00／23日界分段，不把交節當整日、也不把用神未定冒稱有唯一應期。",
    "【六爻判讀主線】先問用神能否得力：月日給它多少支持、元神的生扶能否送達、忌神有無有效克制，動變又把力量帶向哪裡。元神雖動而空破或化受制，援助可能難落實；忌神受制時，原本的阻力也可能鬆動。把這些實際作用連成成事路徑，指出最關鍵的一道門檻。",
    "世爻看自己在事件中的承擔與狀態，應爻按已知角色看對接條件；用神可成而世難承擔、世有力而用神受阻，是不同答案。若問題問時機，沿已算空破、動變、沖合的解決條件縮小時間；若問做法，優先提出能改善主阻點的安排，並列可觀察到的進展。",
    "【六爻深入作用網】核六爻、世應、實際問題用神及候選，再合月日旺衰、空破、靜動、變爻回作用、伏神及飛伏生剋；元忌仇神放回有效作用網，不單憑名稱定吉凶。",
    "分清生克沖合墓絕在本次是否有效，動化生克、進退反伏吟與合處逢沖等須核成立條件。多用神或角色不明時保留不同指向；世應只依問題角色解釋，不證明其他人的想法或同意。",
    "完整卦例涵蓋所有會改變主判的靜動爻、伏神及組合，再按子題總結。應期先說出空、解合、填實或沖開何者，再給已算候選時間；沒有候選日不自造日期，不把象徵當疾病。",
    "【六爻術語界線】空、破、墓、絕與退神都要核實際用神和月日動變；解除候選不是保證事件發生日。不得把單爻凶象或無取用對象誤寫成當事人一生無望。",
    "【議題線索與精度分開】子女題核本題子孫取用、世應與實際月日動變、伏藏及已算候選應期；相關原忌作用是否有效須追完。子孫不現或落空不自動等於終身無子；數量需要本次具名取法，不數爻換孩子人數。",
    "【本法重要發現與解惑方式】用神、世應、有效動變和伏神中的重要連帶條件，即使未問也解釋；角色和作用須實際成立，不能把六親當成已存在的新人物。"
  ],
  "yijing": [
    "【易經：卦辭與爻辭】以已提供的本卦、之卦、動爻及本次擇辭政策為準；正文先用白話回答問題，再引用最能解釋處境、轉折與下一步的原文。原文照提供版本，不用記憶補寫或把白話改寫標成古文。",
    "本次採朱子《易學啟蒙・考變占》，三爻變並讀本、之卦卦辭，依已給定的前十主貞、後十主悔決定主次。四、五爻變所取的是之卦不變爻，不能誤讀成本卦該爻；乾坤六爻皆動用用九／用六，不能當成第七爻。遵守資料中已列明的主讀與參讀。",
    "本卦讀當下處境，動變與所選原文讀需調整的條件；之卦是變化後的參照，不直接保證未來發生。互、錯、綜卦若未提供，不自行補造為已起得的卦；不混入六爻納甲、世應或梅花體用規則。",
    "吉、凶、悔、吝、無咎、利貞要連同原文的前提與行為讀，不能只抽好聽字眼。三年、七日等經文數字先辨古義與象徵，不能直接成為現實日曆日期；疾病、婚姻、征伐等古語不作醫療指示或替他人表達同意。",
    "原朱子主讀不被互綜錯或納甲覆蓋；易傳使用本次64卦逐卦彖、大象、小象、用象與乾坤文言原文。互綜錯各有明列卦形與京房納甲，無月日六神資料不得自行补配。",
    "【易經判讀主線】先將主讀卦爻的處境、所處階段與勸告連成一個決策：現在應進、應守、應改方法，或先完成哪個條件。再看原文的因果次序，分清什麼做法導向吉、悔、吝或無咎，讓結論回答使用者真正要選的行動。",
    "本卦與之卦或主讀、參讀相反時，追問前提是否改變：現在合適的做法，到了另一階段可能需要收斂。把爻位的進程及經文中的人物職責翻成當事人在原題中的位置，說清何時堅持、何時轉向；以一項看得見的條件作為決策檢查點。",
    "【易經深入擇辭】核本卦、之卦、全部動爻及本次擇辭政策，保留主讀、參讀與原文來源；先讀古義、爻位與處境，再連到問題的角色、行動及條件，不只翻譯卦名吉凶。",
    "多爻動時遵循已採擇辭，不把全部爻辭硬拼成同一必然故事；主讀與參讀的張力交代限制。完整解卦逐子題給進退理由及可採取的第一步。",
    "經文的七日、三年等先按古義與情境解釋；時間只給資料支持的階段。具體事件、疾病、收入或年度人生表需要現實／運限資料，短期卦不冒充本命盤。",
    "【易經術語界線】吉凶悔吝對應本次主讀爻時與行為條件；爻辭不是當事人的終身判決。變卦呈現條件變化，不保證事情已發生或必然轉好。",
    "【議題線索與精度分開】子女題由本次主讀卦爻辭、動變與結構解釋選擇、條件和方向；孩子或孕育的文字是須合上下文的象徵。不能憑它證實懷孕或固定一生人數；缺精確數量仍把有效爻辭對本題的啟示讀完。",
    "【本法重要發現與解惑方式】依主讀與參讀完整解釋情境、進退及轉折，未問但會影響當事人行動的重要提醒也指出；古文警語用本次情境說清，不照字面預告人生災禍。"
  ],
  "oracle": [
    "【靈籤：全詩定調，關鍵句解題】核有效籤、籤系、籤號與完整原詩；先理解四句的背景、條件、轉折及收束，以全詩決定宜進、宜守、待條件或調整。",
    "正文先答原問題，再引用最能解釋答案的原句，把詩意直接放回使用者的處境；其餘詩句融入脈絡即可。明確要求逐句詳解時才逐句展開，不能只挑吉語忽略全詩前提。",
    "待、若、莫、且、終等語氣會限定轉機；等待須有對象與可觀察條件。季節詞先辨時令、典故或象徵，不逐句硬配公曆月份。",
    "原詩、廟方附記及可靠典故分清來源；典故比較處境和選擇，不把人物結局移植給求問者，不以籤號、五行、方位造日期或醫療判斷。",
    "【靈籤判讀主線】先用全詩回答「這件事眼前應採什麼態度與行動」，再找最有決定性的轉折句。前段若寫困境、後段寫開展，要把兩者之間的條件講清；勸等待時交代在等什麼，勸改變時交代改哪一環，讓求籤者得到實際方向。",
    "把詩中的人物、旅程、風雨或收成放回原問題的角色與過程。典故可幫助辨識選擇及代價，原詩的條件優先。結尾提出一個當下可做的準備，以及一個值得留意的轉機指標，讓答案有可檢查的落點。",
    "【靈籤深入全詩】按本次完整籤詩逐句讀起承轉合，核籤系、明列典故及處境；籤等不取代詩意，沒有可靠典故來源不編故事。句中角色與勸進、待時、調整條件放回原問句。",
    "支持與警示並存時，說明何種行為使條件轉好、何種選擇使阻力升高；全詩形成主線後回答所有子題，不把單句套所有人生領域。",
    "最後給當下第一步和轉機觀察指標。籤號不是月份，季節取象不保證發生日，不把靈籤當醫療或財務事實證明。",
    "【靈籤術語界線】上上或下下是本版本的傳統分級，不是人生價值或客觀事件機率。按原詩與實際程序作本題條件性解讀；吉籤不保證成功，凶籤不代表人生無望。",
    "【議題線索與精度分開】子女題以本次廟方籤詩版本、有效程序及有提供的六甲或家庭事項欄為準，解釋對本次事情的條件與方向。六甲不自動等於今生總數，籤號不是孩子人數；精度受限仍須完成有效詩意的解惑。",
    "【本法重要發現與解惑方式】完整詩意中重要的待時、助力、代價與行動前提也主動提醒；說清與原題的關聯，典故是理解脈絡，不能改寫成當事人的經歷。"
  ],
  "astro": [
    "【西洋占星：相關宮主與相位】核黃道、宮制、時區、度數及容許度；本題宮位與宮主落座落宮、實際相位成主線。日月、上升與命主提供背景，不逐星背性格。",
    "相位看參與星、掌宮與環境；尊貴及角宮性是資源條件，順相位不等於已落實。未知時辰不定宮位、軸線與敏感時間點。",
    "本命、實際行運、次限、返照分層；時間窗口對應度數與有效資料。正文說清本題需求、衝突及階段變化，也提醒重要且有據的其他星盤牽動。",
    "先核星盤用途；卜卦與事件的日期時間是問事／事件時刻，不能當出生時刻套終身性格和次限。遷居固定同一UTC與行星黃經重排宮位；卜卦用所選七曜光圈、接納、實際成相、換座轉向，結構候選不得直接當事件完成。",
    "【西洋占星判讀主線】先由本題宮位、宮主及其落宮建立事件路徑：事情從哪個領域發生，需依靠哪種資源或角色完成。再用宮主與日月、相關星體的相位辨認需求如何協調、在哪裡拉扯；定位星與接納關係說明可否取得支持。把相位的兩端都譯成可觀察的做法與代價。",
    "判機會時同看承接條件，判困難時同找可調用的資源。已算行運觸及哪顆本命星及其掌宮，便說明當期哪個生活議題被放大；有次限或返照時分清內在階段與年度情境。最後回答現在適合改變哪件事，以及何種現實進展才表示機會開始落實。",
    "【西洋占星深入整盤】核出生時間、時區、宮制、黃道及已算相位容許度；以日月上升和重要宮主建立主軸，合行星落宮尊貴、定位鏈、相位雙端及盤形。不能逐顆行星各寫性格套話。",
    "事業財務、婚戀、家庭、學習及生活負荷各有相關宮位與宮主的作用路徑；宮頭不精確時只保留受影響部分，不拿未知相位或宮位補故事。",
    "本命讀穩定需要，行運讀外部觸發，次限讀內在階段，返照讀觀察年情境；各層只用實算結果，單日時點不冒充全年精確日期。逐年只列有資料年份，未算的年段標缺口。",
    "【西占術語界線】失勢、落陷、刑沖及宮位強弱是技術分類，不是人的缺陷或無法改善。按本次本命或卜卦用途分層核尊貴、接納、成相與受阻，不把一個不利相位擴成全部人生。",
    "【議題線索與精度分開】子女題先辨本命或卜卦用途，依本次第五宮、宮主及實際相位、尊貴或問事成事條件合讀。已算推運只作相應時間參照，不把星座個數當孩子總數；精確人數未量測仍須回答可支持的發展與限制。",
    "【本法重要發現與解惑方式】核本命及實算行運的全局重點；重要的需求衝突、資源、關係模式或時間轉折，即使未問也解釋，卜卦／事件盤只在其問事範圍提醒。"
  ],
  "vedic": [
    "【吠陀占星：D1與實算運期】核 ayanamsa、出生時間、上升、月亮星宿與分盤；本題宮主在D1的職責、落宮、尊貴與受照先成主線，自然吉凶不等於依上升定的功能吉凶。",
    "力量含擢升、本位、落陷、燃燒、逆行及關聯；Parashari 與 Rashi 相位各循明示體系。Yoga 核實際構成、力量和破壞條件，不能以名稱保證事件。",
    "Mahadasha／Antardasha 採月亮實算起訖，運主職責與相互關係讀當期主題；D9、D10等在相應領域檢查D1承接且保留時間敏感性。正文以切題結構為主線，重要且有據的其他需求與運期轉折也要解釋，不另抄格局驗算報告。",
    "17補充運期各有適用條件；只在本次所選方法與適用性下合讀，不以運期個數投票。16盤Arudha／Argala、8Karaka與Neechabhanga均對照實排；同度、等強或未知時計算標記未定時，不能挑一個候選冒稱唯一。若資料用位元遮罩或JSON Pointer，先依明列編碼還原。",
    "【印度占星判讀主線】由D1的主題宮、宮主及定位星建立可成事的通路，再以尊貴、受照、燃燒與關聯辨能力和代價。D9或D10等有效分盤檢查同一主題能否承接：本命有資源而專題條件弱時，重點在落實方式；兩層同向時，說明最適合把力量用在哪裡。",
    "當期大運主開啟它掌管與落入的領域，副運主決定這段事情透過什麼條件展開；兩主的相對位置、受照與定位關係解釋順阻。將本命可承擔的事、有效分盤及實算運期接成一條答案，指出此階段可推進的工作、關係或資源安排及相應成本。",
    "【印度占星深入原局與運期】核恒星黃道、歲差、宮制、月宿及D1；九曜的掌宮、落宮、尊貴、受照及功能吉凶合讀，Yoga須核完整條件與制化，不能逐星或按吉凶名單成判。",
    "分盤只在本次實算且出生精度足夠時使用，D9等依自己的角色合參，不能以分盤好壞覆蓋D1。各人生領域說明宮主如何承接資源及成本。",
    "Vimshottari大運、副運、次副運按實算起訖，讀運主掌宮落宮、兩主關係及分盤承接，再合實際行運。逐期或逐年給議題、象徵順阻程度、條件和行動；沒有行運快照的日期只用運期，不造精確入座時間。",
    "【印度占星術語界線】六力、宮力、AV和Yoga各回答不同問題；強不必吉、弱不等於無能。核功能宮主、定位星、分盤、有效運法與救解條件，不能只因Neecha或某個Yoga保證終身成敗。",
    "【議題線索與精度分開】子女題核本次D1第五宮、宮主與木星，再以有確認時辰的D7及已算運期核對。D7時辰敏感項與仍有效D1分開；沒有D7上升不抹除D1星位。子女傾向、運期啟動、受孕及出生不能互當證據，沒有具名數量規則不自行加總行星。",
    "【本法重要發現與解惑方式】合D1、有效分盤、功能宮主與已算運期；重大的承接條件、機會和負荷即使未問也指出，不由Yoga名字保證事件，也不補未算運期。"
  ],
  "name": [
    "【姓名：字形與多派原生資料】先核明列姓／名、繁簡及異體字、民用生辰、筆畫來源與覆核。康熙部首還原、現代筆畫、數字按字形／數值是不同口徑；字表未知不以碼位、現代數或字形猜數。每字保留原數、來源與實際讀音，未確認的多音候選不當本人讀法。",
    "五格先核公式：單姓天格加1，複姓取姓總和；人格取姓末字與名首字；單名地格加1，多字名取名總和；外格天格＋地格−人格；總格全名總和。保留原數及81循環參照，虛數不當實際字的筆畫。",
    "五格81數理、三才五行與陰陽分開成判；五行按數尾、陰陽按奇偶，不冒稱字義五行或八字喜用。先讀天→人、人→地如何相生相剋及全名組合，再看數理主題，不把吉凶張數加成總分。姓名格位不指定年齡、婚姻次數、健康器官或事件。",
    "生肖形義只在明列完整出生日期與農曆年界實算時使用；八字年柱依立春，兩者不可混年。喜忌字根保留匹配來源、字位與覆蓋限制；同一字根不重複加權，部首參照不冒稱完整拆字。民俗牲畜、食物或栖息取象不移植為本人遭遇。",
    "八字用字只依本次實算四柱、月令根氣與原局取用，分扶抑、調候及成敗條件。沒有完整生時就保留缺口，不假設正午；不以生肖替代用神，不按五行數量補字。字義、字形及音韻五行多表不一，未明列所採字表不自造某字唯一五行。",
    "姓名易卦須保留選定起例、筆畫總數、上下卦、動爻、本卦與之卦及原文來源；本版姓數÷8上卦、名數÷8下卦、全名÷6動爻，餘0依8／6。這是固定姓名數理參照，不是對問題另起事件卦，不混入六爻納甲或冒稱河洛專盤；若本次無資料就不啟用。",
    "音形字義評估完整連讀、已確認音韻、字義聯想、書寫與辨識成本及本人期待；普通話候選不代替台語、客語、粵語。未提供的諧音、典故、家族字輩與他人評價只列待核，不捏造。來源英文釋義改寫成白話時標其參考性，不假裝教育部中文原文。",
    "比較候選以同姓、同生辰、同筆畫與同用途評估。若不同流派取捨衝突，指出它們各自支持什麼、代價在哪裡、哪個實際條件能改判；不平均各派吉凶、不把相同筆畫多次驗證。先按本人用途與實際使用成本定優先，數理不能保證人生結果。",
    "三才按本次CDI或靈昭125表；兩具名現代版本與未核實舊表保留來源差異，不冒稱熊崎原著。分類原詞與歸一等級分開，不把同版多網站當獨立印證；兩網站25共吉不是四來源研究的23共識。",
    "【姓名判讀主線】先回答這個名字在本題用途上是否合適；比較候選時，分別看字義想表達的方向、叫讀是否順口、辨識與書寫成本，再看同一筆畫體系下五格三才的傳統象義。若數理與實際使用感受不一致，說清各自回答哪一層，再按使用者的目的定優先順序。",
    "建議須落到具體字、音或組合：保留什麼、調整什麼、理由及代價各是什麼。可用口頭自我介紹、電話報名或正式署名作試用，觀察辨識度與本人感受，再決定是否採用；改名題同時考慮既有認知與實際更換成本。",
    "【姓名深入取捨與多派合參】讀完所有有效姓名資料，逐字核讀音、字義、原筆畫與覆核，連到姓／名接合、五格角色、三才作用與全名辨識。只用本次算出的資料，不拿單個吉數、名字五行或生肖斷一生。",
    "全姓名題分開交代五格81主題、125三才與陰陽、音形字義、生肖形義、完整八字用字取向、姓名易卦；未啟用的方法標資料缺口，其餘照常深入。每派給最有力支持、牽制、成立條件與實際做法。河洛、奇門或其他姓名派需其專盤與起例，未提供不冒稱都完成。",
    "筆畫敏感度比較原口徑與另一口徑哪些字、格數、三才或卦象改變；人工覆核與來源值同時保留，另一口徑不沿用人工數假裝字典數。不把同源筆畫衍生五格、三才、姓名卦當三次獨立準確驗證。",
    "多名字題逐個用相同標準說適合用途、最強優勢與成本，再橫向比較、給具體保留／調整哪個字及決勝條件；沒有本人偏好時不強造絕對排名。改名、藝名、孩子取名另考慮證件、原有辨識、字輩與日常稱呼成本。",
    "姓名不能推某年事件、婚姻或子女人數、性行為、疾病、收入機率，也不保證改名改運。建議落到自我介紹、電話報名、正式署名與可讀性試用；若設定試用時間，那是實務檢查點，不是姓名應期。",
    "【姓名術語界線】81數、三才吉凶與異表是傳統分類，筆畫可重算不代表命運已驗證。凶數不能定人格、收入、婚姻或壽命；改名也不能保證現實結果。",
    "【議題線索與精度分開】姓名資料可解名字的音形義、家庭命名期待及本次具名數理範圍，不能從筆畫推生殖能力或親生孩子總數。若本次另附生辰或卦盤，依那個方法讀子女題並標明來源；沒有相關資料時明確提出所需資料，不能假稱名字必藏答案。",
    "【本法重要發現與解惑方式】音形義、筆畫來源及已啟用模型中重要的辨識、讀音、誤讀或使用成本即使未問也提醒；傳統數理屬象義，不能預告未提供的年運或疾病。"
  ],
  "liuren": [
    "【大六壬：四課三傳與具名課體】只讀本次實际干支、月將加時、天地盤、四課、九宗門三傳、貴人天將、六親旬空及年命上神。干為人、支為事是本次選用的判讀參照，人物角色須回到原問題，不由將名猜身分。",
    "64課族的成立、不成立與資料不足分開；290條具名神煞先核所選原表與實際課傳年命命中，再讀生克、空破、內外戰和遞生互克。全盤有某支不等於該神煞發用，同源別名不增加独立證據；缺年命不得補算。",
    "十八日土旺／整月土旺依本次政策，日出日落須實際坐標；真太陽時只改本地排盤鐘，不移動原UTC交節。應期表是各日、各交節區間的規則條件，不保證事件發生；遠期窗不能重造首次出原旬。",
    "【六壬判讀主線】先比較干支兩端及彼此上神，辨本題參與者如何承接事情；沿初中末傳追作用能否傳遞到落點。用實際六親、天將、空破與生克制化說明主因、阻點及可介入條件，課名和神煞名不直接當事件。",
    "【大六壬深入課傳】完整課盤保留十二天地盤位置、四課、三傳取傳過程、十二天將、旬空遁干、六親、月令、內外戰與實際傳間作用。逐課核上下生克與人事兩端，再按初中末的同一推演順序完成主判。",
    "64課族與290神煞只按本次明列取法計算；正文、訂訛與其他原表分列，神煞定位保留原干／干支及寄宮。只讀真正落四課三傳或年命上神的命中，結合用神旺衰和支持牽制，不以名稱吉凶投票。",
    "年命、虛歲行年及雙人課依實際輸入。出空填實或解合沖開先談條件；沒有實算候選日不給日曆應期。全盤與各子題分開辨意願、行動、落實及持續，結論給有據的改判條件與可採一步。",
    "【六壬術語界線】課名、天將、空墓絕與神煞只在本次問事角色及四課三傳作用中判讀。核有效生扶、制約、空亡解除及分類占法前提，不把一課凶名延伸成終身災難。",
    "【議題線索與精度分開】子女題先依本題角色與本次已列分類占法選取，合讀干支、四課三傳、旺衰空破及已算應期。子孫位置是象徵線索，不證明已有孩子；不能因無年命就抹除仍有效課傳，也不能把地支序數當人數。",
    "【本法重要發現與解惑方式】從四課三傳的有效作用追同一事情的連帶人事、限制、機會和轉折，重要者即使未問也提醒；分類占法未實作或年命不足應明示，不靠神煞名補造私事。"
  ],
  "personality": [
    "【人格卡：情境中的特質】回到實際四柱與十神作用；卡片名稱與分數是模型摘要，不是心理診斷。挑最影響本題的特質，說明優勢、壓力表現及可練習之處。",
    "矛盾特質可能分屬不同情境，與本人經驗不符時修正應用；正文形成連貫的人格主軸，不照卡片欄位逐項複誦。",
    "【人格判讀主線】從原局最有作用力的兩三條結構提出可觀察的行為假設，分清平常有資源時的長處、負荷升高時同一做法可能付出的代價。把印的吸收、食傷的表達、財的資源管理、官殺的規範要求、比劫的自主協作放回本盤實際制化，說明這些功能如何配合。",
    "同一特質在工作、親密關係或陌生環境可能表現不同；依原題選一個情境，指出觸發點、慣常反應與可練習的新反應。給一個短期可試的行為及核對指標，由實際經驗決定保留或修正哪個假設，讓人格卡幫助選擇而非只提供形容詞。",
    "【人格深入功能與情境】從原局功能通路讀決策、行動、學習、表達、資源管理與協作，分資源充足及壓力升高時同一特質的優勢與代價，不把前端類型標籤當成心理測驗或診斷。",
    "工作、親密關係及陌生環境的表現可不同，說明觸發條件、慣常反應及可練習替代做法，連到本人可核對的行為。",
    "提出可試練習和觀察指標，由本人經驗決定哪些解釋適用，不由人格卡預測職業成敗、他人評價或補造人生年表。",
    "【人格術語界線】本站五軸映射不是經驗證心理量表；分數和類型不能定智力、人格好壞、診斷或終身能力。轉成可觀察而能被反例修正的行為假設。",
    "【議題線索與精度分開】人格模型可解與本題有關的照顧方式、決策與壓力模式，不測生殖能力或孩子人數。若 modelInputs 只有特徵摘要，不反推不存在的完整命盤；另有原盤才依該具名方法讀子女方向。仍交代本模型能幫助理解的部分與下一步，不以空泛無法回答結案。",
    "【本法重要發現與解惑方式】已算功能通路中重要的長處、壓力模式和情境差異，即使未問也指出，提供可核對的行為與練習；模型不能替本人診斷或捏造經歷。"
  ]
};
  // END GENERATED WORKFLOW METHOD GUIDES
  // BEGIN GENERATED WORKFLOW VOICE GUIDE
  var AUTHOR_VOICE = "【白話優先】【像命理師當面解惑】先回答，再解釋。用繁體中文，第一句直接回答當事人問的事與較支持的發展；若原句問了兩件事，兩件都回答。先說照目前條件較可能怎樣，再談改變做法後的推演。不要用安慰、勸努力或資料不足代替仍能完成的判斷。\n【原因要講到事情上】讀完有效原局、角色關係、支持、反向作用及已算時間，選出真正改變答案的理由。把它說成當事人會遇到的選擇、收益、負擔與轉變，讓讀者知道為什麼這樣判、為什麼另一種解釋較弱。只呈現整理後的理由，不展示隱藏思考過程。\n【日常用語優先】正常問事不用牌名、星名、干支或專門術語，也不先講術語再加字典。少用「盤面支持、力量承接、條件窗口、作用網」等報告語，直接說這件事具體怎樣變好或卡住。只有原題要求學原理、核盤、逐牌或逐宮解說，才交代必要技術。\n【解惑的成稿方式】圍繞原題寫連貫段落，每段增加一個新的理解；不要按資料順序念牌義或分宮百科，也不要固定開結論、支持、反證、建議等欄。技術核對表不是成稿目錄。原題指定逐年、逐期、逐輪、逐項或全盤，仍須完整覆蓋。\n【所有原題都依同一完整解讀流程】語義分類只是找資料的線索，不是可問問題白名單。逐一核原句人物、結果、比較標準、條件、期限、數量與反覆要求；疑似錯字及兩種詞義保留原文與暫定理解，不悄悄改題。解析沒命中仍讀有效原生骨架，缺項只限制對應部分。\n【主判必須收斂】正反線索先核是否同一件事、同一人物與同一時段；同源不重複加權，不用吉凶數量投票。比較後說哪種發展較有理由、程度及代價，不能以「有機會，看你主不主動」結案。真的分不出才說具體缺哪一環、什麼實際變化會改判。\n【分清結果層次】吸引、意願、安排、事件發生及持續，各自需要相應依據。原句問性關係就回答實際性關係；親密接觸不自動等於性交，任何親近仍需明確、無壓力且可撤回的同意。排除現任不證明另一個人存在。建議位與可採取的行動也不能當成結果已成。\n【數量題仍要解惑】精確數字、姓名、日期或他人心意未被測量，只限制那一項精度。先分總數或新增、期限及單位。具名傳統取法若有足夠前提，可以提出象徵估計並說清修正；沒有就保留未知，不能固定回答一至兩個，也不能數符號當人數。精確值未測量不抹除質性方向。\n【重要發現與做法】全局中與原題有關、足以改變選擇的重要資源、成本或轉折，主動接著解釋其關聯和範圍；不湊項、不製造恐懼。做法要對準前面找出的問題，配可觀察的變化；自訂追蹤期限明說是實務檢查點。通用建議不冒稱新算出的發現。\n【成稿真實性】這是AI依可查來源與資料作的傳統方法解讀，不能自稱真人命理師親斷、全部流派都算完，或把其他案例搬成本人經歷。資料、方法與文獻足夠的部分深入回答，未完成的部分坦白保留。\n【資料與判斷分清】只用本次原句、補充和實際排算資料。排盤事實、傳統規則的解釋與個案推測不可混成已發生的事；沒有提供的經歷、職業、負債、他人心意與意願保持未知。生活例子須明說是待核對情境。\n【技術查證必須真實】不確定規則、版本、作用方向或換算時，先查作者、原典、官方文件或可靠原圖，確認適用條件再用。查到網站不等於讀到正文，書目不等於公式已驗證。可上網時完成必要查證並留可追溯來源；不能查閱時明列未查項，只停用依賴該項的精細判斷。不得捏造查網、引用、真人資歷或專業覆核。個人未知背景不能靠搜尋或象徵填入。\n【時間、金額與現實】日期只用已算區間，核對時區、日曆與單位；日數除以7換算週數，月份按實際日曆跨度，未給問事日期不擅算剩餘日數。資料未算到的日期不代表永不發生。金額目標與一次或持續達標分開，不從符號換算營業額、淨利、機率或保證收益。醫療、法律及財務做法須結合實際資料與專業意見。計算通過不等於事件預測準確。主觀滿意回饋只代表使用感受，不能單獨驗證預測。\n【口吻與處境】像有經驗的解盤者當面對本人說話，自然稱你、沉穩直接，不先說根據資料或以下分析。不把所有訊號內化成情緒：同時核對責任、他人支援與選擇後果。未知現場情形要核問，不裝成事實；事後補充不倒填成事前命中。已做的事先處理現在，未選方案只作條件比較。";
  // END GENERATED WORKFLOW VOICE GUIDE
  var FULL_AREAS = {
  "liuren": "完整讀十二天地盤、四課、九宗門取傳、三傳的遞生互克、十二天將、六親旬空遁干、月令內外戰。64課族逐條成立／否／缺資料分開，290神煞只採實際課傳年命命中。同源別名不加票，雙人年命依明示輸入，應期沒有候選日實算不造日期；各子題交代最強支持、牽制、改判條件及可採行動。",
  "tarot": "【塔羅深入合讀】逐一核對全部實際牌位職責與正逆方向，形成完整牌陣的發展結構；需求、可採行動、環境、結果和阻礙各自成義，再串成結果能否落實的路徑。單張本義不能取代相鄰關係、核心牌與不同支線的共同作用。；主線與子題逐一成判，區分情緒、意願、實際行動與持續；人物牌不自行指認身分。逆位綜合牌面、位置與全局，分辨內化、受阻、過度或鬆動，不能一律翻成相反。；時間與影響程度來自實際時間位及發展順序；只有序列時給相對階段，不自造月份。每個關鍵轉折連同成立條件、支持牌位、最強反證及可採行動說明。",
  "ootk": "【開鑰之法五層深讀】依實際完成且有效的五次操作逐層回答原題，不把五輪當五個月份。第一輪建立當下基底，第二輪讀互動與發展機制，第三輪讀結構門檻與承接條件，第四輪從三十六牌環讀累積張力與轉折，第五輪收束最終傾向與保留條件；仍以每輪實際落域為準，不硬套固定事件。；每輪都必須新增一個具體判斷，交代最強支持、最強反證、限制的是注意／感受／意願／行動／承諾／持續／結果哪一層，以及本輪如何延續、加強、削弱、轉向或補充上一輪。不能只抄牌義、列程序或用一句『未知』代替整輪。；第一輪主線未確認時只降低第一輪權重，後四輪有效資料照常成判。問第三方看法或心意而缺少明確角色綁定時，不把象徵寫成已證實內心；但仍須輸出五輪最支持的方向性模型，把無法歸屬者標為關係場／互動場訊號。；五輪完成後必須收斂最可能方向、次可能方向、最強反證、成立條件、改判條件與信心來源，再給現實驗證點與行動。『無法證實』是事實宣稱邊界，不是停止回答的理由；人物身分、事件次數及日期仍不得補造。",
  "lenormand": "【雷諾曼深入牌句】讀完全部切題相鄰牌句和長線，保留中心、起訖與方向，辨人物近域、問題主線及方案分支的共同作用；牌的含義由句法與角色限定，不能挑幾張吉凶牌取代整條牌句。；大牌陣依實際落宮和幾何讀近遠、行列及已採鏡像，分清人物、領域與環境；未指定人物不補指認，合法配對不可冒充相鄰。；全盤逐重要區域及已知人物整理支持、阻力與發展；單題將相關牌組合成主判。時間只依實際牌陣及明列口徑，牌號或距離不自行換成確切天數。",
  "bazi": "【八字深入全局】先核四柱、藏干、月令、節氣及交運政策，將日主承受力、格局需要和調候需求分開。根氣、透藏、生剋通路與合沖刑害共同成判，不以五行數量、單一十神或前端旺衰標籤下結論。；格局須核月令立格、透藏與成敗救應；從格、化氣格審實際成立條件。扶抑、調候、通關與病藥並非同一取用理由，牴觸時交代先後和能改判的條件。；學業、事業、財務、婚戀、家庭與生活負荷各自連回本局功能通路。財星只是資源議題，能否取得與留住須合日主承受、食傷輸出、官印制化及歲運。；大運與流年逐段判新增干支如何引動原局、喜用能否承接及忌勢有無救應。交運年保留前後區間；逐年列運期、主題、偏利／偏阻／混合、象徵影響程度、盤面依據、條件與檢查點，不因相同年干重複套話。",
  "compat": "【合盤深入雙向判讀】先獨立讀A、B需要、能力與承受力，再核跨盤作用的來源、方向及實際角色。吸引、溝通、金錢分工、承諾與持續各自論證，不以元素相生或投影落夫妻代替對方心意。；找最有力的互補如何被對方承接，以及最強反證限制意願、行動還是持續；同源合沖不重複加權。具體相處循環在沒有紀錄時只作待核對假設，轉成可試行的雙方協議。；時機比較各自實算歲運的共同窗口，辨一方有機會而另一方未能承接的情況。資料單方、未知時辰或沒有互動背景的部分明示限制，不把未知視為必然不合。",
  "ziwei": "【紫微深入全盤與限流合參】核十二宮宮干地支、命身、主星同宮組合、主輔煞曜廟旺及空宮借對，再由各主宮實際三方四正與夾宮建立資源、需求、成本及制化通道；單星亮度、格名與吉凶計票不能代替組合作用。；三合讀本命骨架；飛星追發射宮干→化曜→落宮→對宮牽動；欽天來因及向心／離心自化只按已採口徑解釋。河洛視角須有明列宮位數理與起例才具名推演；只有五行局不冒稱完成河洛專盤，不同派同源四化不當成多次驗證。；全盤題完整展開十二宮，再整合健康生活安排、學業、事業、財務、人際家庭和婚姻感情。每宮說主星組合如何承接命身、三方資源、對宮牽動與關鍵四化。財帛空宮、福德對宮、本命三方及運限財官分層連接，不能只說靠人脈或有財庫。；運限以本命、大限、流年三套座標合讀，保留本命與各層宮名，核四化、自化、流曜與同宮／對沖。小限、流月有實算資料才補充；原局資料的限流疊宮無不代表年度無疊宮。；逐年題依每一指定大限與每一流年分別成判，列年度／虛歲／大限、議題、偏利或偏阻及條件、象徵影響程度、具體星組和四化依據、需注意的事與行動。相同年干在不同大限及落宮不能套同一句；關鍵窗口給有據年段、領域、反證，不自造已發生事件或月日。",
  "meihua": "【梅花深入體用與動變】先核實際起卦、原體用、節令旺衰和動爻，再讀本卦、互卦、動變如何改變原條件；原體用角色不能在每一步任意交換。生剋是象徵作用，不是任何人的情緒或意願。；分清體的承受、用的要求、互卦中間條件及變卦後續成本；生體也需能承接，克體須審旺衰及救應。全部相關卦氣先核完，再選真正改變答案的路徑。；完整卦例按本、互、動、變回答全部子題，給進退與實務檢查點；應期須有明確起例和尺度。本次短期卦不擴成一生年表。",
  "liuyao": "【六爻深入作用網】核六爻、世應、實際問題用神及候選，再合月日旺衰、空破、靜動、變爻回作用、伏神及飛伏生剋；元忌仇神放回有效作用網，不單憑名稱定吉凶。；分清生克沖合墓絕在本次是否有效，動化生克、進退反伏吟與合處逢沖等須核成立條件。多用神或角色不明時保留不同指向；世應只依問題角色解釋，不證明其他人的想法或同意。；完整卦例涵蓋所有會改變主判的靜動爻、伏神及組合，再按子題總結。應期先說出空、解合、填實或沖開何者，再給已算候選時間；沒有候選日不自造日期，不把象徵當疾病。",
  "yijing": "【易經深入擇辭】核本卦、之卦、全部動爻及本次擇辭政策，保留主讀、參讀與原文來源；先讀古義、爻位與處境，再連到問題的角色、行動及條件，不只翻譯卦名吉凶。；多爻動時遵循已採擇辭，不把全部爻辭硬拼成同一必然故事；主讀與參讀的張力交代限制。完整解卦逐子題給進退理由及可採取的第一步。；經文的七日、三年等先按古義與情境解釋；時間只給資料支持的階段。具體事件、疾病、收入或年度人生表需要現實／運限資料，短期卦不冒充本命盤。",
  "oracle": "【靈籤深入全詩】按本次完整籤詩逐句讀起承轉合，核籤系、明列典故及處境；籤等不取代詩意，沒有可靠典故來源不編故事。句中角色與勸進、待時、調整條件放回原問句。；支持與警示並存時，說明何種行為使條件轉好、何種選擇使阻力升高；全詩形成主線後回答所有子題，不把單句套所有人生領域。；最後給當下第一步和轉機觀察指標。籤號不是月份，季節取象不保證發生日，不把靈籤當醫療或財務事實證明。",
  "astro": "【西洋占星深入整盤】核出生時間、時區、宮制、黃道及已算相位容許度；以日月上升和重要宮主建立主軸，合行星落宮尊貴、定位鏈、相位雙端及盤形。不能逐顆行星各寫性格套話。；事業財務、婚戀、家庭、學習及生活負荷各有相關宮位與宮主的作用路徑；宮頭不精確時只保留受影響部分，不拿未知相位或宮位補故事。；本命讀穩定需要，行運讀外部觸發，次限讀內在階段，返照讀觀察年情境；各層只用實算結果，單日時點不冒充全年精確日期。逐年只列有資料年份，未算的年段標缺口。",
  "vedic": "【印度占星深入原局與運期】核恒星黃道、歲差、宮制、月宿及D1；九曜的掌宮、落宮、尊貴、受照及功能吉凶合讀，Yoga須核完整條件與制化，不能逐星或按吉凶名單成判。；分盤只在本次實算且出生精度足夠時使用，D9等依自己的角色合參，不能以分盤好壞覆蓋D1。各人生領域說明宮主如何承接資源及成本。；Vimshottari大運、副運、次副運按實算起訖，讀運主掌宮落宮、兩主關係及分盤承接，再合實際行運。逐期或逐年給議題、象徵順阻程度、條件和行動；沒有行運快照的日期只用運期，不造精確入座時間。",
  "name": "【姓名深入取捨與多派合參】讀完所有有效姓名資料，逐字核讀音、字義、原筆畫與覆核，連到姓／名接合、五格角色、三才作用與全名辨識。只用本次算出的資料，不拿單個吉數、名字五行或生肖斷一生。；全姓名題分開交代五格81主題、125三才與陰陽、音形字義、生肖形義、完整八字用字取向、姓名易卦；未啟用的方法標資料缺口，其餘照常深入。每派給最有力支持、牽制、成立條件與實際做法。河洛、奇門或其他姓名派需其專盤與起例，未提供不冒稱都完成。；筆畫敏感度比較原口徑與另一口徑哪些字、格數、三才或卦象改變；人工覆核與來源值同時保留，另一口徑不沿用人工數假裝字典數。不把同源筆畫衍生五格、三才、姓名卦當三次獨立準確驗證。；多名字題逐個用相同標準說適合用途、最強優勢與成本，再橫向比較、給具體保留／調整哪個字及決勝條件；沒有本人偏好時不強造絕對排名。改名、藝名、孩子取名另考慮證件、原有辨識、字輩與日常稱呼成本。；姓名不能推某年事件、婚姻或子女人數、性行為、疾病、收入機率，也不保證改名改運。建議落到自我介紹、電話報名、正式署名與可讀性試用；若設定試用時間，那是實務檢查點，不是姓名應期。",
  "personality": "【人格深入功能與情境】從原局功能通路讀決策、行動、學習、表達、資源管理與協作，分資源充足及壓力升高時同一特質的優勢與代價，不把前端類型標籤當成心理測驗或診斷。；工作、親密關係及陌生環境的表現可不同，說明觸發條件、慣常反應及可練習替代做法，連到本人可核對的行為。；提出可試練習和觀察指標，由本人經驗決定哪些解釋適用，不由人格卡預測職業成敗、他人評價或補造人生年表。"
};
  function goal(q,event){
    if(event&&event.queryOperator){if(/relative_timing/.test(event.queryOperator))return 'timing';if(event.queryOperator==='choice'||event.comparison)return 'compare';}
    if((event&&event.queryOperator==='enumeration_guidance')||/(?:有哪些|哪幾(?:項|個|點|種)|哪些(?:項目|地方|方面|問題|原因|事項)|有什麼(?:問題|項目|地方|方面|事項).{0,12}(?:注意|留意|關注)?|有何(?:問題|項目|事項))/.test(q))return 'enumeration';
    if(/比較|哪個|哪一|何者|二選|三選|選擇|該不該|要不要/.test(q)||/還是(?!才(?:會|能|可|有))/.test(q))return 'compare';
    if(/如何|怎麼|怎樣|怎辦|怎么办|該怎|幫助|幫忙|做什麼|做甚麼|改善|修復|處理|應對/.test(q))return 'help';
    if(/何時|什麼時候|甚麼時候|多久|哪年|哪月|時機/.test(q))return 'timing';
    if(/為什麼|為何|原因|結構|卡點|挑戰|問題在哪/.test(q))return 'explain';
    if(/會不會|能不能|可不可以|是否|有沒有|能否|嗎|會否/.test(q))return 'direction';
    return 'general';
  }
  function compiler(){
    if(root.JYTarotFoundation&&typeof root.JYTarotFoundation.compileQuestion==='function')return root.JYTarotFoundation;
    if(typeof module==='object'&&module.exports){try{return require('./tarot-foundation.js');}catch(_e){}}
    return null;
  }
  function sourceKey(value){
    var F=compiler(),s=String(value||'');try{s=s.normalize('NFKC');}catch(_e){}
    return (F&&F.normalizeQuestion?F.normalizeQuestion(s):s).replace(/[？?。；;！!\s]+$/,'').replace(/\s+/g,'').trim();
  }
  function originalSurface(surface,question,fromOffset){
    var raw=String(question||''),chars=Array.from(raw),normalized='',starts=[],ends=[],offset=0;
    chars.forEach(function(ch){var n=sourceKey(ch);for(var k=0;k<n.length;k++){normalized+=n[k];starts.push(offset);ends.push(offset+ch.length);}offset+=ch.length;});
    var wanted=sourceKey(surface),startIndex=starts.findIndex(v=>v>=(fromOffset||0)),at=normalized.indexOf(wanted,Math.max(0,startIndex));
    return at>=0&&wanted?{surface:raw.slice(starts[at],ends[at+wanted.length-1]),span:[starts[at],ends[at+wanted.length-1]]}:{surface:String(surface||''),span:null};
  }
  function directQuestionModel(question,reason){
    return {schema:'jy.question_model/1',status:'original-question-reading-required',sourceQuestion:String(question||''),queryIntent:{shape:'open_original_request',dimensions:[],domains:[],explicitTime:[],operatorFocus:''},events:[{id:'ORIGINAL_REQUEST',source:String(question||''),type:'original_request',predicate:'interpret_original_question',grammaticalSubject:null,eventActor:null,target:null,personBinding:null,requiredObservables:[],participants:[],conditions:[],actionSequence:[]}],unresolved:{language:[String(reason||'語義模型未完整辨識，依原句閱讀有效資料')],ambiguities:[],assumptions:[],unsupportedDimensions:[],decisionKind:'none',notes:[]},validation:null};
  }
  function semanticModel(question,options){
    var F=compiler();if(!F)return directQuestionModel(question,'語義元件未載入；不限制依原句解讀');
    var compiled;
    try{compiled=F.compileQuestion(question,{referenceDate:options&&options.referenceDate,timezone:options&&options.timezone});}
    catch(_e){return directQuestionModel(question,'語義解析失敗；保留原句，不能把它改成另一個題目或停止有效盤面解讀');}
    if(!compiled||typeof compiled!=='object')return directQuestionModel(question,'語義結果缺漏；依原句閱讀');
    var graph=compiled.queryGraph||{},rq=compiled.readingQuestion||{},language=rq.clauses||[],events=graph.events||[];
    var entities=Object.create(null),sourceCursor=0;(graph.entities||[]).forEach(function(e){entities[e.id]=e.surface||e.source||e.id;});
    return {
      schema:'jy.question_model/1',status:graph.compilerStatus||'partial',sourceQuestion:String(question||''),
      queryIntent:{shape:compiled.features&&compiled.features.shape||null,dimensions:(compiled.requestedDimensions||[]).map(function(x){return {id:x.id,label:x.label,source:x.source};}),domains:(compiled.features&&compiled.features.domains||[]).slice(),explicitTime:(compiled.explicitScopes||[]).map(function(x){return {surface:x.surface,kind:x.kind,bounded:x.bounded,resolved:x.resolved&&x.resolved.label||null};}),operatorFocus:compiled.features&&compiled.features.enumeration?'enumeration_guidance':compiled.features&&compiled.features.causal?'cause_explanation':compiled.features&&compiled.features.timing?'relative_timing':compiled.features&&compiled.features.choice?'choice':compiled.features&&compiled.features.advice?'action_guidance':'',
      },
      events:events.map(function(e,i){
        var r=e.roles||{},f=e.languageFrame||language[i]||{},metricEntity=(graph.entities||[]).find(function(x){return x.id===r.subject;}),relation=(compiled.relations||[]).find(function(x){return (e.relationIds||[]).indexOf(x.id)>=0;})||null,original=originalSurface(e.surface,question,sourceCursor);if(original.span)sourceCursor=original.span[1];
        return {id:e.id,source:original.surface,sourceSpan:original.span,normalizedSource:e.surface,type:e.type,predicate:e.predicate,clauseRole:f.role||'',requester:entities[r.actor]||r.actor||'問卜者本人',eventActor:r.eventActor||null,grammaticalSubject:f.subjectRef||null,target:entities[r.target]||entities[r.subject]||f.targetRef||null,actionObject:r.actionObject||null,conditionalEntity:r.conditionalEntity||null,personBinding:r.personBinding||null,entityReference:r.entityReference||f.entityReference||null,attribute:r.attribute||'',attributeComparison:r.attributeComparison||null,dependsOn:(e.dependsOn||[]).slice(),
          actionSequence:(r.actionSequence||f.actionSequence||[]).slice(),willingness:r.willingness===true||f.willingness===true,explicitSexualAct:r.explicitSexualAct===true||f.explicitSexualAct===true,
          timingTarget:r.timingTarget||null,recurrenceCue:r.recurrenceCue||f.recurrenceCue||null,priorOccurrenceVerified:r.priorOccurrenceVerified===true,
          recurrenceContext:f.recurrenceContext||null,lexicalInterpretation:f.lexicalInterpretation||null,enumerationRequest:f.enumerationRequest||null,truthGate:r.truthGate===true||f.truthGate===true,requestedItems:r.requestedItems||f.enumerationRequest&&f.enumerationRequest.requestedItems||'',attentionFocus:r.attentionFocus||f.enumerationRequest&&f.enumerationRequest.attentionFocus||'',
          participants:(r.participants||f.participants||[]).map(function(p){return {surface:p.surface,role:p.role,source:p.source};}),
          metric:r.metric||relation&&relation.metric||'',metricKind:relation&&relation.metricKind||f.measurementGoal&&f.measurementGoal.metricKind||'',metricCadence:r.metricCadence||relation&&relation.metricPeriod||'',financialBasis:relation&&relation.financialBasis||null,currency:relation&&relation.currency||null,recurrence:relation&&relation.recurrence||null,metricAmbiguity:relation&&relation.ambiguity||null,measurementTargets:relation&&relation.targetMeasurements||[],threshold:r.threshold?{surface:relation&&relation.thresholdSurface||'',value:relation&&relation.thresholdValue,operator:r.comparator||''}:null,
          comparison:r.leftOperand||r.rightOperand?{left:entities[r.leftOperand]||r.leftOperand,right:entities[r.rightOperand]||r.rightOperand,operator:r.comparator||'',criterion:r.attribute||''}:null,
          evaluation:r.evaluatedTarget?{evaluator:r.evaluator,target:r.evaluatedTarget,criterion:r.criterion}:f.evaluation?{evaluator:f.evaluation.evaluatorRef,target:f.evaluation.targetRef,criterion:f.evaluation.criterion}:null,
          modality:e.modality||'open',queryOperator:r.queryOperator||'',timeScope:(e.timeScope||[]).slice(),requiredObservables:(e.requiredObservables||[]).slice(),optionSet:{status:r.optionSetState||f.openChoiceSet&&f.openChoiceSet.status||'',object:r.recommendationTarget||f.openChoiceSet&&f.openChoiceSet.object||''},
          conditions:(f.conditions||[]).slice(),negations:(f.negations||[]).slice(),comparisonFrame:!!f.comparisonFrame,semanticDimensions:(f.dimensions||[]).slice(),semanticDomains:(f.domains||[]).slice(),temporal:{future:!!(f.temporal&&f.temporal.future),continuity:!!(f.temporal&&f.temporal.continuity),horizon:f.temporal&&f.temporal.horizon||null,actorBoundFutureEvent:!!f.actorBoundFutureEvent},
          sourceRoles:{grammaticalSubject:f.subjectRef||'',subject:metricEntity&&metricEntity.surface||r.eventActor||f.subjectRef||'',targetSurface:r.target?entities[r.target]||'':'',metric:r.metric||relation&&relation.metric||'',threshold:r.threshold||'',comparator:r.comparator||'',requestedAction:(r.requestedAction||[]).slice(),requestedItems:r.requestedItems||'',attentionFocus:r.attentionFocus||'',truthGate:r.truthGate===true,timingTarget:r.timingTarget||'',recurrenceCue:r.recurrenceCue||f.recurrenceCue||'',requiredDistinctions:(r.requiredDistinctions||[]).slice()},causalSituation:e.causalSituation||f.causalSituation||null};
      }),
      unresolved:{language:(rq.semantic&&rq.semantic.unresolved||[]).slice(),ambiguities:(rq.semantic&&rq.semantic.ambiguities||[]).slice(),assumptions:(graph.assumptions||[]).slice(),unsupportedDimensions:(graph.unsupportedDimensions||[]).slice(),decisionKind:rq.decisionKind||'none',notes:(rq.notes||[]).slice()},
      validation:graph.validation||null
    };
  }
  // Explicit wording is a routing cue, not a diagnosis or an emergency assessment.
  // Quoted examples, negations and hypothetical discussions must not label a reader.
  function careContext(question,notes){
    var raw=[question,notes].filter(v=>v!==undefined&&v!==null).map(String).join('\n');
    var quote=/「[^」]*」|『[^』]*』|“[^”]*”|"(?:\\.|[^"\\])*"|`[^`]*`/g;
    var q=raw.replace(quote,''),clauses=raw.split(/[。！？!?；;\n]+/),danger=false;
    clauses.forEach(function(s){
      if(/如果|假設|假设|假如|若有人|若我|討論|讨论|舉例|举例/.test(s))return;
      var reported=/女友|男友|伴侶|伴侣|朋友|家人/.test(s)&&/(?:說|说|告訴|告诉|表示).{0,12}[「『“"]/.test(s)&&/怎麼辦|怎么办|如何幫|如何帮|該怎麼|该怎么|陪伴|求助/.test(raw);
      s=reported?s.replace(/[「」『』“”"]/g,''):s.replace(quote,'');
      s=s.replace(/(?:我|自己).{0,8}(?:不想|不會|不会|沒有|没有|不打算|並不想).{0,8}(?:自殺|自杀|自傷|自伤|傷害自己|伤害自己|想死|死念頭|死念头)/g,'');
      if(/(?:我|自己).{0,16}(?:想|要|打算|準備|准备|正在).{0,8}(?:自殺|自杀|自傷|自伤|傷害自己|伤害自己|結束生命|结束生命)|(?:我|自己).{0,10}(?:不想活|想死|活不下去)|(?:女友|男友|伴侶|伴侣|朋友|家人).{0,12}(?:想|要|打算|準備|准备|正在).{0,8}(?:自殺|自杀|自傷|自伤|傷害自己|伤害自己)/.test(s))danger=true;
    });
    return {level:danger?'safety-first':/(?:我|自己).{0,25}(?:迷茫|絕望|绝望|撐不住|撑不住|沒救|没救|看不到希望|活著.{0,8}意義|活着.{0,8}意義)/.test(q)?'support-first':'ordinary',basis:'原問句未引用的明示措辭；不是臨床診斷或完整危險評估',commercialRequired:!danger};
  }
  var SAFETY_ENDING='【安全支持優先】先回應眼前安全與可獲得的陪伴；命理不能評估或保證人身安全。本題暫停手鍊推薦、導購及賣場收尾。';
  function prepareDeliveryText(text,options){
    text=String(text||'');options=options||{};
    if(careContext(options.question,options.notes).level!=='safety-first')return text;
    var quality=root.JY_READING_QUALITY,ids=kinds(options.methods||options.method);
    if(quality&&typeof quality.recommendationEnding==='function'){
      [ids,['compat'].concat(ids)].some(function(v){var ending=quality.recommendationEnding(v);if(text.trimEnd().endsWith(ending)){text=text.trimEnd().slice(0,-ending.length).trimEnd();return true;}return false;});
    }
    // Only remove the application's exact final footer. Source facts are retained.
    if(text.trimEnd().endsWith(FOOTER))text=text.trimEnd().slice(0,-FOOTER.length).trimEnd();
    return text.endsWith(SAFETY_ENDING)?text:text+'\n\n'+SAFETY_ENDING;
  }
  function requestRequirements(question,tasks,model,scope){
    var q=String(question||''),events=model&&model.events||[],sourceTasks=tasks&&tasks.length?tasks:[{id:1,question:q,goal:'general'}];
    function measurementsFor(related){return related.flatMap(function(e){if(e.measurementTargets?.length)return e.measurementTargets.map(function(m){return {metric:m.metric,kind:m.metricKind,basis:m.financialBasis,threshold:{surface:m.thresholdSurface,value:m.thresholdValue,operator:m.operator},cadence:m.metricPeriod,recurrence:m.recurrence,currency:m.currency,ambiguity:m.ambiguity||null};});return e.metric?[{metric:e.metric,kind:e.metricKind,basis:e.financialBasis,threshold:e.threshold,cadence:e.metricCadence,recurrence:e.recurrence,currency:e.currency,ambiguity:e.metricAmbiguity}]:[];});}
    return {schema:'jy.request-requirements/1',version:VERSION,sourceQuestion:q,
      routing:'question-first-no-topic-whitelist',questionModelStatus:model&&model.status||'original-question-reading-required',
      tasks:sourceTasks.map(function(t){var related=events.filter(function(e){return t.eventId?e.id===t.eventId:sourceKey(e.source)===sourceKey(t.question);});return {id:'Q'+t.id,source:t.question,sourceSpan:t.sourceSpan||null,goal:t.goal||'general',eventIds:related.map(function(e){return e.id;}),explicitResults:Array.from(new Set(related.flatMap(function(e){return (e.actionSequence||[]).concat(e.requestedItems?[e.requestedItems]:[],e.metric?[e.metric]:[],(e.measurementTargets||[]).map(m=>m.source));}))),requiredObservables:Array.from(new Set(related.flatMap(function(e){return e.requiredObservables||[];}))),measurement:measurementsFor(related),answerRequired:true};}),
      precisionLimits:scope&&scope.precisionLimits||[],
      obligations:['逐一回答原句真正提出的問題，未被分類的部分按原句理解','讀完本法仍有效的骨架、相關角色與實際作用，專用分類未命中不停止一般判讀','有據時收斂較支持的方向、程度與條件，不能只給可能有可能沒有','比較會改變答案的支持與限制，分清現況走向和採取建議後的推演','辨認重要且切題的連帶發現，以白話解釋影響與做法','只有具體受影響的精度、資料或程序受限；其餘回答照常完成'],
      inferenceBoundary:'可依本法可靠的一般判法解釋已列原始資料；這屬具名傳統判讀或讀者推導，不冒稱是引擎已自動裁決。不補生日、人物心意、未抽牌、未排運期或未提供背景。',
      unresolvedTaskRule:'若某子題仍不能成判，指出已檢查的實際資料、真正卡在哪一環，以及補什麼或觀察什麼能改變判斷；不以整題無法作答收尾。沒有切題證據時不編造象徵。',
      outputRule:'這是內部覆蓋契約，不是正文欄位。正文對一般人自然解惑，不照清單交作業。'};
  }
  function readingScope(question,methods,model){
    var q=String(question||''),ids=kinds(methods),limited=(model&&model.unresolved&&model.unresolved.unsupportedDimensions||[]).slice();
    if(/幾個|幾位|多少(?:人|個|位|次)|人數|數量/.test(q)&&!limited.includes('cardinality'))limited.push('cardinality');
    if((model&&model.events||[]).some(function(e){return e.metricKind==='amount'&&e.threshold||(e.measurementTargets||[]).some(m=>m.metricKind==='amount');})&&!limited.includes('threshold_verification'))limited.push('threshold_verification');
    var child=/子女|子嗣|親生|生育|備孕|懷孕|生孩子|生小孩|(?:孩子|小孩).{0,10}(?:幾|多少|生|緣|有|健康|相處)/.test(q);
    return {schema:'jy.reading-scope/1',methods:ids,question:q,topic:child?'children':'original-question',
      precisionLimits:limited.map(function(id){return {dimension:id,status:'not-directly-measured',affects:'only-this-precision',haltsWholeReading:false,traditionalEstimate:'requires-named-rule-premises-and-global-synthesis'};}),
      requiredReading:['原句事件的較支持方向','本次切題證據與相反作用','重要變化與可觀察條件','可採取的下一步'],
      topicEvidenceRequired:child?['本法實際子女議題位置或問事綁定','總數與新增、親生與照顧及時間分開','只按已列資料分析不同取法與運期']:[],
      rule:'unsupportedDimensions 只列尚未直接測量的精度，不是禁止象徵解讀，也不是不成立證據；有具名可推估規則仍需合盤審理。缺切題資料需具體指出，不能造線索。'};
  }
  // Context is a question-routing aid, never an oracle of undisclosed events.
  // Preserve every source and its modality; a question/hypothesis is not a fact.
  function situation(question,notes){
    var q=String(question||''),n=String(notes||''),sources=[['question',q],['notes',n]],text=q+'\n'+n;
    var units=[];sources.forEach(function(pair){var re=/[^。！？!?；;\n]+[。！？!?；;]?/g,m;
      while((m=re.exec(pair[1]))){var s=m[0].trim();if(!s)continue;
        var modality=/[？?]$/.test(s)||/是否|會不會|能不能|有沒有/.test(s)?'question':/假如|假設|如果|假设|若是|例如|譬如/.test(s)?'hypothetical':/聽說|据說|據說|聽同事|他说|他說|她說/.test(s)?'reported-speech':/沒有|並非|不是|不曾|尚未/.test(s)?'negated':'user-reported';
        units.push({source:pair[0],span:[m.index,m.index+m[0].length],text:s,modality:modality});
      }
    });
    var work=/上班|下班|值班|輪班|排班|交接|代班|調班|出勤|現場人員|人手|人力|請假|请假|到班|當班/.test(text);
    // A school leave question alone is not an industrial staffing decision.
    if(/上學|上课|上課|學校|学校/.test(text)&&!/上班|值班|輪班|交接|同事|人力|人手/.test(text))work=false;
    var workDecision=work&&(/請假|请假|休息|休假|交接|代班|調班|缺勤|缺人|人力|人手/.test(text)||/(?:我|本人).{0,12}(?:上班|到班).{0,8}(?:了|累|快樂|開心|壓力|負擔)|(?:今天|明天).{0,6}(?:要不要|該不該|能否).{0,6}上班/.test(text));
    var completed=units.some(function(u){return u.modality==='user-reported'&&/(?:我|本人)(?:已經|已|還是|仍然|今天|現在|現在已經|最後)?(?:來|去|到|來到)?上班了|我(?:已經|已)到班/.test(u.text)&&!/(?:沒有|沒|未|不)(?:來|去|到)?上班/.test(u.text);});
    var emotion=/不快樂|不快乐|不開心|不开心|無力|无力|低落|疲憊|疲惫|失去目標|失去目标|沒目標|沒方向|迷茫/.test(text);
    var direction=/目標|目标|方向|自己的天|人生|命格|出路|天職|使命/.test(text);
    var checks=[],branches=[];
    if(workDecision){
      checks.push({id:'staffing',question:'本班實到人力、必要崗位與替補／交接是否足夠？',state:'requires-real-world-check'},
        {id:'responsibility',question:'誰能核准休息、調度或減量；少一人對同事與現場運作有何影響？',state:'requires-real-world-check'},
        {id:'capacity',question:'自己目前能否安全承擔工作，能否安排短休或調整工作量？',state:'requires-real-world-check'});
      branches=[{condition:'實際人力與交接足夠',consider:'比較休息恢復與正常出勤的得失'},
        {condition:'實際人力或必要崗位不足',consider:'先請主管調度、替補或減量；不把所有責任壓給本人，也不以命理要求硬撐'}];
    }else if(/照顧|照护|照護|接送|看顧/.test(text)){
      checks.push({id:'care-handover',question:'誰需要照顧、誰能接手，替代安排是否已確認？',state:'requires-real-world-check'});
    }else if(/合作|共同|合夥|合伙|退出|解約|辞職|辭職|離職/.test(text)){
      checks.push({id:'shared-obligation',question:'退出或改變安排會影響誰；承諾、交接與代替方案是否落實？',state:'requires-real-world-check'});
    }
    if(emotion&&direction)checks.push({id:'direction',question:'今天的負荷、持續的不快樂與長期想要的生活，哪一項最需要先處理？',state:'requires-real-world-check'});
    var typo=/請教.{0,4}休息/.test(q)&&/上班/.test(q)?{surface:'請教休息',tentative:'可能指請假休息',confirmed:false}:null;
    return {schema:'jy.situation/1',workDecision:workDecision,stage:completed?'already-at-work':'not-established',
      emotionalStrain:emotion,longTermDirection:direction,sources:units,lexicalUncertainty:typo,
      checks:checks,branches:branches,
      distinctions:workDecision?['本人感受與現場條件分開','個人承擔、同事支援、主管安排、運作後果分開',completed?'已到班：解答當下調整與下次安排；未選方案只作反事實比較':'尚未確認是否已行動，不代替本人決定']:[],
      boundary:'問題與現實核對清單不是盤面證據。未提供的人數、缺勤原因、職位與停工結果保持未知；事後補充只作使用者回報，不倒填成原先算中。'};
  }
  function situationPrompt(s){
    if(!s||!s.checks.length)return '';
    return ['【本題處境與決策核對】',JSON.stringify({stage:s.stage,distinctions:s.distinctions,check:s.checks.map(function(x){return x.question;}),branches:s.branches,lexicalUncertainty:s.lexicalUncertainty}),
      '先從本法有效資料判斷較像個人消耗、外在責任還是兩者拉扯，並保留相反依據。有人接手與無人接手的後果須分開；不知道的現場資訊，用一個切題的核對問題或條件句交代，仍完成其餘解讀。'+s.boundary].join('\n');
  }
  function nativeFocus(options){
    options=options||{};var q=String(options.question||''),p=options.plan||plan({method:options.method||'vedic',question:q,notes:options.notes}),domains=Array.from(new Set((p.domains||[]).map(function(d){return d==='work'?'career':d;})));
    var aspects=[],houses=[],divisions=[1,9],allDivisions=/(?:所有|全部|完整十六|16|十六|二十|20).{0,8}分盤/.test(q);
    function add(id,why,hs,ds){aspects.push({id:id,reason:why,houses:hs||[]});houses=houses.concat(hs||[]);divisions=divisions.concat(ds||[]);}
    if(domains.includes('finance'))add('finance','原句問金額、財務、收入或財務負擔',[2,11,6,8,12],[2]);
    if(domains.includes('career')||domains.includes('commerce'))add('career','原句問工作、經營、客戶、合作或副業',[3,7,10,11],[10]);
    if(p.situation?.workDecision)add('work-obligations','出勤取捨須核日常責任與可用支援；宮位不是實到人力資料',[1,6,10,11],[]);
    if(domains.includes('relationship')||domains.includes('intimacy'))add('relationship','原句問關係或互動',[1,5,7],[9]);
    if(/子女|生育|備孕|懷孕|生孩子|生小孩|養育/.test(q))add('children','原句問子女、生育或養育',[2,5,9],[7]);
    if(/父母|原生家庭|爸爸|媽媽|父親|母親/.test(q))add('parents','原句明示父母',[4,9],[12]);
    if(/居住|房屋|買房|住宅|搬家|移居/.test(q))add('home','原句問居所或移居',[4,12],[4]);
    if(domains.includes('study'))add('study','原句問學習、教育或考試',[4,5,9],[24]);
    if(domains.includes('health'))add('health','原句明示健康或醫療，不由財務壓力推定疾病',[1,6,8,12],[6,27]);
    if(/內在|精神實踐|修行|信仰/.test(q))add('spiritual','原句明示內在實踐',[1,9,12],[20]);
    var thresholds=(p.requestRequirements?.tasks||[]).flatMap(function(t){return (t.measurement||[]).filter(function(m){return !!m.threshold;}).map(function(m){return {taskId:t.id,...m};});});
    var semanticMissing=p.questionModel?.status==='original-question-reading-required';
    return {schema:'jy.native-focus/1',sourceQuestion:q,domains:domains,aspects:aspects,houses:Array.from(new Set(houses)),divisions:allDivisions||semanticMissing?null:Array.from(new Set(divisions)).sort(function(a,b){return a-b;}),thresholds:thresholds,
      origin:'original-question-and-typed-events',classificationIsWhitelist:false,
      fallback:aspects.length?'主題資料優先，仍檢視完整有效原局的重要連帶發現':'沒有分類命中仍讀完整有效骨架，不據此拒答',
      distinctions:thresholds.length?['先分一般改善、首次達標與持續達標','金額門檻是使用者的目標，不能從象徵換算現實金額','未給幣別、成本或帳款資料就保留未知，不能捏造']:[]};
  }
  function plan(options){
    options=options||{};
    var q=String(options.question||'').trim(),ids=kinds(options.methods||options.method);
    var lifePurpose=/(?:今生|此生|一生|終身|人生|生命).{0,8}(?:使命|天職|課題|意義|目的)|(?:使命|天職|生命目的|人生目的|生命意義|人生意義|終身課題|一生課題)/.test(q);
    if(!ids.length)throw new Error('沒有有效的命理方法，無法整理本題');
    var model=semanticModel(q,options),report=reportScope(q,ids[0]);
    var disease=/躁鬱|双相|雙相|bipolar|憂鬱症|抑鬱症|精神疾病|思覺失調|糖尿病|癌症|癲癇|失智/i.test(q);
    var care=/幫助|幫忙|照顧|陪伴|怎麼辦|該如何|不穩定|發作|病情|治療|康復|症狀|停藥|減藥|換藥|就醫|生病|失眠|自傷|自殺/.test(q);
    var clinical=/(?:我|她|他|現任|伴侶|女友|男友|父|母|家人|朋友).{0,30}(?:停藥|減藥|換藥|就醫|病情|症狀|手術|治療)/.test(q);
    var health=(model.queryIntent&&model.queryIntent.domains||[]).indexOf('health')>=0||(disease&&care)||clinical||/自傷|自殺/.test(q);
    var caseContext=situation(q,options.notes),domains=(model.queryIntent&&model.queryIntent.domains||[]).slice();
    if(caseContext.workDecision)domains.push('career');
    if(health)domains.push('health');
    if(/投資|借貸|負債|股票|基金|財務|營業額|收入|財運|賺錢|副業|正職|本業/.test(q))domains.push('finance');
    if(/法律|官司|訴訟|離婚協議|提告|判刑|合約糾紛/.test(q))domains.push('legal');
    domains=Array.from(new Set(domains));
    var sentences=q.split(/[？?；;\n]+/).map(function(x){return x.trim();}).filter(Boolean),parsedEvents=(model.events||[]).filter(function(e){return e.type!=='original_request';});
    var tasks=parsedEvents.length?parsedEvents.map(function(event,i){return {id:i+1,eventId:event.id,question:event.source,sourceSpan:event.sourceSpan,goal:goal(event.source,event)};}):(sentences.length?sentences:[q||'依本次有效資料分析主軸與可行方向']).map(function(text,i){return {id:i+1,question:text,goal:goal(text,null)};});
    var broad=report.fullChart||report.annualRequested||report.requestedDecades||lifePurpose||/全盤|整體|完整分析|深入分析|深度分析|所有面向|年度運勢|今年運勢|長期走向|一生|終身/.test(q),
      complex=broad||tasks.length>1||ids.length>1||(model.events||[]).some(function(e){return (e.requiredObservables||[]).length>=3||(e.participants||[]).length>=2||(e.actionSequence||[]).length>=2||(e.conditions||[]).length>0||!!e.comparison||!!e.evaluation||!!e.causalSituation||e.metricCadence&&e.queryOperator==='relative_timing_to_threshold'||e.type==='recommendation_with_unprovided_options'||e.queryOperator==='enumeration_guidance';});
    var healthExam=domains.indexOf('health')>=0&&/(?:體檢|健檢|健康檢查|檢查報告|篩檢)/.test(q);
    var scope=readingScope(q,ids,model);
    return {version:VERSION,question:q,methods:ids,tasks:tasks,domains:domains,situation:caseContext,
      depth:broad?'comprehensive':complex?'deep':'focused',reportScope:report,
      questionModel:model,readingScope:scope,requestRequirements:requestRequirements(q,tasks,model,scope),
      healthSupport:health&&/現任|女友|男友|伴侶|她|他|父|母|家人|朋友/.test(q),healthExam:healthExam,
      bipolarMention:disease&&/躁鬱|双相|雙相|bipolar/i.test(q),lifePurpose:lifePurpose,careContext:careContext(q,options.notes),
      source:'原問句明示詞彙；只用來安排回答任務，不是排盤證據、診斷或對事件的判斷。'};
  }
  function chartReferenceAudit(options,chart){
    var p=plan(options),raw=chart&&(chart.tarotData||chart.lenormandData||chart),cards=raw&&(raw.cards||raw.drawn)||[],slots=raw&&raw.methodPlan&&raw.methodPlan.slots||[],F=compiler();
    if(!cards.length||!F)return null;
    var compiled;try{compiled=F.compileQuestion(p.question);}catch(_e){return {schema:'jy.cast-reference-audit/1',status:'original-question-review-required',issues:[],cardSequencePreserved:true,positionAndOrientationPreserved:true,policy:'語義核對未完成；依原句核人物，不改牌序、方向或原牌位。'};}
    var branches=compiled?.readingQuestion?.branches||[],issues=[];
    cards.forEach(function(card,i){
      var b=card.binding||card.slotBinding||slots[i]&&slots[i].binding;if(!b)return;
      var branch=branches.find(function(x){return x.id===b.eventId;}),event=p.questionModel.events.find(function(x){return x.id===b.eventId;});
      var expected=branch&&branch.entity||event&&event.personBinding&&event.personBinding.surface||event&&event.grammaticalSubject,actual=b.entity||b.subjectRef;
      if(expected&&actual&&expected!==actual&&!/^(?:他|她|對方)$/.test(actual))issues.push({position:i+1,eventId:b.eventId,originalEntity:actual,correctedSameQuestionEntity:expected,question:branch&&branch.question||event&&event.source,status:'stale_reference_annotation'});
    });
    return {schema:'jy.cast-reference-audit/1',status:issues.length?'reference_annotation_needs_correction':'no_recorded_reference_conflict',issues:issues,cardSequencePreserved:true,positionAndOrientationPreserved:true,policy:'舊語義注記與原題衝突時按同一子題的人物共指糾正注記；卡片、方向、原牌位、原子題不改，不增删或重新抽牌。未知绑定保持未知。'};
  }
  function referenceContract(options){
    var p=plan(options),lines=[];
    var attributes=(p.questionModel.events||[]).filter(function(e){return e.type==='person_attribute_query';});
    if(attributes.length){
      lines.push('【人物與屬性綁定】'+JSON.stringify(attributes.map(function(e){return {query:e.source,attribute:e.attribute,person:e.personBinding,comparison:e.attributeComparison,dependsOn:e.dependsOn};})));
      lines.push('逐子題保留原人物及排除限制；非現任對象不得改綁現任。人物共指歧義明列候選；人物存在待判時，屬性回答也保留此前提。原題問幾歲就保留精確年齡需求，不擅改問相對年齡；資料未量測年齡時明說無法推出幾歲，牌號／宮廷牌不能換算年齡。相對年齡題保留比較基準與較年輕／同齡／較年長的原選項；本次證據不足就列不足，不造數字或生日。');
      lines.push('【同盤修正】人物解析、文字澄清及答案修訂只使用已提供的同一次牌／卦／命盤、牌位與方向；不得聲稱重新抽牌，不補造新牌、不改綁其他題的牌位。沒有專屬屬性牌位時只在原牌陣容許範圍交叉參看，標明未直接量測，不把一般牌位改名成年齡位。');
    }
    return lines.join('\n');
  }
  function methodGuide(method){
    var k=kinds(method)[0];if(!k)return '';
    var lines=['【'+METHODS[k].name+'完整判讀方法】','請運用本法完整知識判讀本次實際資料，先建立全局，再追蹤與原題有關的作用。下列方法是推理依據，正文以日常用語深入回答原題並提醒有據的重要發現，不講專門名詞；只有原問句明示技術需求才另解釋；短期資料不擴成終身盤，未算年度不補逐年報告。'];
    var specific=k==='ziwei'?root.JY_ZIWEI_PROMPT_ROOT:k==='bazi'?root.JY_BAZI_PROMPT_ROOT:null;
    if(specific?.roleText)lines.push(specific.roleText());
    if(k==='ziwei'&&specific?.technicalRulesLines)lines.push.apply(lines,specific.technicalRulesLines());
    if(k==='ziwei'&&specific?.domainRouterLines)lines.push.apply(lines,specific.domainRouterLines());
    if(k==='bazi'&&specific?.universalRulesLines)lines.push.apply(lines,specific.universalRulesLines());
    var quality=root.JY_READING_QUALITY,guide=quality?.methodLines&&String(quality.readingVersion||'0').localeCompare('16.1.0',undefined,{numeric:true})>=0?quality.methodLines(k):METHOD_GUIDES[k];
    lines.push.apply(lines,guide?.length?guide:[METHODS[k].path,FULL_AREAS[k]]);
    return lines.join('\n');
  }
  function requestedComponents(question){
    var q=String(question||''),parts=[];
    if(/(?:如果|假如|若是|只要)/.test(q)&&/(?:怎麼|如何|怎辦|應該|該怎)/.test(q))return parts;
    if(/(?:並|而且|同時|以及|還會|也會|又會)/.test(q)){
      var feeling=q.match(/(?:愛上|喜歡|心動|動情|暗戀)/),action=q.match(/(?:親密接觸|肢體接觸|接吻|牽手|性交|做愛|上床|發生關係|交往|結婚|告白|表白)/);
      if(feeling&&action){parts=[{kind:'feeling',surface:feeling[0],sourceSpan:[feeling.index,feeling.index+feeling[0].length]},{kind:'action',surface:action[0],sourceSpan:[action.index,action.index+action[0].length]}];}
    }
    return parts;
  }
  function render(options){
    var p=plan(options),lines=[MEMORY_BOUNDARY,'【共用判讀版本】'+VERSION,'【本題作答任務｜資料讀完後依此成稿】','原問句（原文資料）：'+JSON.stringify(p.question)];
    // Legacy hosts already provide canonical authoring lines. Add only missing
    // instructions; preserve their complete source data and original wording.
    var providedVoice=String(options?.providedGuide||'');
    lines.push(providedVoice?AUTHOR_VOICE.split('\n').filter(function(line){return !providedVoice.includes(line);}).join('\n'):AUTHOR_VOICE);
    var contextText=situationPrompt(p.situation);if(contextText)lines.push(contextText);
    lines.push('【本題可讀內容與精度界線】'+JSON.stringify(p.readingScope)+'\n先把仍有效的議題線索解讀完整，再把未確定部分說清；不得把一個未測量標籤變成整題拒答。');
    lines.push('【任意原題的完整解讀任務】'+JSON.stringify(p.requestRequirements));
    var components=requestedComponents(p.question);
    if(components.length)lines.push('【原句複合結果核對】'+JSON.stringify(components)+'。原句同時問感受與行動，兩個結果須分別直接回答，再解釋是否能承接。不能由愛上推定接觸，也不能由接觸推定愛上；親密接觸不自動等於性交。此核對不改原句、牌序或角色，不建立未提供的現實事實。');
    lines.push('【結論強度】計算核對不等於事件預測已驗證。負向與正向判斷都要保留本題範圍、時間及條件；不可把身弱、煞忌、失勢或凶象變成終身失敗，也不可保證富貴或婚姻。核對實際已算救應與反證，未找到轉機就明說；多個AI同意不是獨立現實證據。');
    if(p.careContext.level==='safety-first')lines.push('【眼前安全優先｜覆蓋後文命理與導購要求】原句明示自傷／自殺或傷害自己的念頭或意圖；這只是措辭路由，不作診斷。先關切當下是否安全、是否已有行動或眼前危險，協助聯絡可信任的人陪伴、遠離可造成傷害的物品及尋求所在地緊急或專業協助。不得用吉凶判語證明絕望，也不得保證沒有危險。不得要求等轉運才求助。本題暫停事件占斷、手鍊推薦、導購及賣場收尾；盤面只保留為資料，不能當危險評估。');
    else if(p.careContext.level==='support-first')lines.push('【迷茫時的解惑】先回應原題與最能採取的現階段做法，保留有依據的困難及支持條件；不診斷、不把人生價值交給命理，也不把改善全部延後到好運來臨。');
    p.tasks.forEach(function(t){var g=GOALS[t.goal];lines.push((p.tasks.length>1?'子題'+t.id+' '+JSON.stringify(t.question)+'：':'')+g.opening+' '+g.body);});
    var measurementTasks=(p.requestRequirements.tasks||[]).filter(function(t){return (t.measurement||[]).length;});
    measurementTasks.forEach(function(t){t.measurement.forEach(function(m){lines.push('【子題'+t.id+'的實際結果】原句問'+(m.cadence==='monthly'?'每月':m.cadence||'')+m.metric+(m.threshold?.surface||'')+'；'+(m.recurrence?.required?'須分首次達標與持續達標，單次收入不能代答。':'')+'目標數字是提問者的門檻，並非本法已量測的收益。'+(m.ambiguity?'原文同時用了營收與淨賺，先依明示淨賺暫答並簡短說明，不將兩個數字口徑混用。':'')+(m.currency?'幣別依原句'+m.currency+'。':'沒有提供幣別，不自行指定。')+'先完成此題能支持的發展與相對時機；實際達標仍需現有收入、成本、回款與持續期間核對，不用這些現實缺項抹除其餘解讀。');});});
    if(p.depth==='deep')lines.push('【本題判讀範圍】此題含多層行動／條件，逐一回答並深入解釋其關聯；以本方法有效證據說明支持、牽制和現實檢查點，另主動提醒全局重要且有據的發現，不以同源訊號重複加權。');
    else if(p.depth==='comprehensive')lines.push('【本題判讀範圍】依本題實際涉及的領域整合主線、交互條件與反證；全盤完整覆蓋本法結構，單題以原問題為主線，同時說清本次盤面重要且有據的其他發現。');
    lines.push('有效方法：'+p.methods.map(function(k){return METHODS[k].name;}).join('、')+'。'+p.methods.map(function(k){return METHODS[k].path;}).join(' '));
    p.methods.forEach(function(k){
      // Legacy hosts already include complete method rules above their facts.
      // Retain those literal lines there and add only rules that are absent.
      var guide=methodGuide(k),provided=String(options?.providedGuide||'');
      lines.push(provided?guide.split('\n').filter(function(line){return !provided.includes(line);}).join('\n'):guide);
    });
    if(p.methods.includes('ootk'))lines.push('【OOTK成稿優先規則】即使原題只有一問，仍須深入解釋第一至第五輪各自新增的理解及跨輪修正，把支持、牽制、成立條件、時間與可採行動融進敘述；輪次可標示，其他段落按原問題命名，不照固定報告欄位寫。只讀實際有效輪次；不因一般精簡篇幅規則略去任何有效輪次。第四輪須整合完整36張環牌故事，第五輪須收斂可持續結果。');
    if(p.reportScope.fullChart){
      lines.push('【全盤作答覆蓋】本次明示全盤或未填單題，須完整處理本法有效結構及人生面向；不能只給幾句總評，也不能把十二宮或全部牌位只當背景略過。');
      p.methods.forEach(function(k){lines.push(METHODS[k].name+'完整報告範圍：'+FULL_AREAS[k]);});
    }
    if(p.reportScope.annualRequested){
      lines.push('【逐年／逐期作答覆蓋】依實際列出的全部指定年度或運期逐項回答，不以十年摘要、重點年份或省略號替代。每列交代年度／年齡／所屬運期、議題、偏利／偏阻／混合及條件、象徵影響程度、具體盤面依據、關注事項和行動；程度是議題牽動集中度，不是事件機率。');
      if(p.reportScope.requestedDecades)lines.push('原問句明示前'+p.reportScope.requestedDecades+'個大限／大運；按本次實算起止順序逐期交代背景，逐年判不同落宮及作用，不能因相同年干套同一句。');
      lines.push('過去年份只給本人可核對的象徵主題，不宣稱已發生；未來依條件說可能表現。關鍵窗口給有據年段、吉凶傾向、影響領域及限制；缺資料只標缺少年度與層級，其餘照常完成。若訊息上限需要分段，明列已完成與待續年份，不能聲稱未寫的年度已分析。');
    }else if(p.reportScope.requestedDecades||p.reportScope.allDecades){
      lines.push('【逐期作答覆蓋】按本次指定'+(p.reportScope.requestedDecades?'前'+p.reportScope.requestedDecades+'個':'全部')+'大限／大運的實算起止逐期比較，交代議題、支持、反證、條件與行動。此題未要求逐年，依原題的比較或階段需求成稿；不要自行增加逐年清單。');
    }
    lines.push('【主動提醒的範圍】原題先答清楚，再深入交代本次完整盤面重要且有據的發現，即使未被問及也須提醒；說清與當事人的關聯、時間／作用範圍、實際依據及可採做法。短期卦牌不能擴成終身災禍；沒有重要發現不湊項。所有核對欄位只供判讀，正文按問題自然成稿。');
    lines.push('【重要結論的落地】判斷在內部核對本次實際證據；正文用生活中的話說哪裡值得期待、哪裡仍有問題、為什麼兩者同時存在及可以怎麼做。不要求讀者看術語或記住牌名；各面向與重要時間仍有各自依據。');
    lines.push('正文完成後，在選品與固定收尾之前簡短提醒：上述分析僅供研究或娛樂用途，屬傳統象徵解釋，不保證事件發生；醫療、法律及財務決策須結合實際資料與專業意見。');
    if(p.lifePurpose)lines.push('【使命／終身課題題型】只能依本次方法與資料提出象徵性的長期主題、反覆面對的選擇、可培養的能力及可採取的現階段行動；不得宣稱唯一使命、命定職業、必然人生遭遇或未提供的年齡階段與過往經歷。若本次只是單次短期牌／卦，只回答它能支持的當前課題，不延伸成完整人生時間線；本命盤或運限資料也只能支持相應尺度的傾向，不能取代本人經驗與現實選擇。');
    lines.push('【語義模型｜由原問句解析，供核對而非取代原句】');
    lines.push(JSON.stringify(p.questionModel));
    var contract=referenceContract(options);if(contract)lines.push(contract);
    var causalEvent=(p.questionModel.events||[]).find(function(e){return !!e.causalSituation;}),incident=causalEvent&&causalEvent.causalSituation;
    if(incident){
      lines.push('【本題已報告的具體事故與因果層次】');
      if(incident.contextSurface)lines.push('使用者報告的情境：'+incident.contextSurface);
      if(incident.mechanismSurface)lines.push('使用者報告的直接機制：'+incident.mechanismSurface);
      if(incident.outcomeSurface)lines.push('使用者報告的實際損失／結果：'+incident.outcomeSurface);
      if(incident.amountSurface)lines.push('使用者報告的金額：'+incident.amountSurface);
      if(incident.userFramingSurface)lines.push('使用者提出的事件解讀：'+incident.userFramingSurface);
      lines.push('請先直接回答已知事件的直接原因，再用本法實際盤面分析使用者追問的象徵意義、助力或可採取行動。區分已陳述的物理機制、牌／卦的傳統象徵解釋與尚未證實的超自然因果；前後發生不自動等於前者造成後者。不得把原題改寫成泛泛的運勢問題。');
    }
    lines.push('語義模型是原句的核對輔助，不取代原句或盤面；若模型列出未核實預設或詞義候選，保留其狀態並按下方說明處理。');
    (p.questionModel.events||[]).filter(function(e){return !!e.lexicalInterpretation;}).forEach(function(e){
      var meaning=e.lexicalInterpretation,selected=meaning.selectedInterpretation&&meaning.selectedLabel;
      lines.push('【原句多義詞】「'+meaning.surface+'」有多種候選：'+meaning.candidates.map(function(c){return c.label+'（'+c.scope+'）';}).join('；')+'。'+(selected?'本次暫採「'+meaning.selectedLabel+'」（'+(meaning.selectionBasis||'上下文線索')+'；使用者尚未確認），正文需標示這是暫定讀法，並說明改採其他候選會改變答案的哪一層。':'上下文未能選定，本次須保留會實質改變答案的候選，逐一指出各自能判到哪裡；不可暗中選義。'));
    });
    (p.questionModel.events||[]).filter(function(e){return !!e.recurrenceContext;}).forEach(function(e){lines.push('【重現／延續措辭】原句「'+(e.recurrenceCue||e.recurrenceContext.surfaceCue)+'」可暗示同類經驗或機會曾存在，但目前未核實（priorOccurrenceVerified=false）。不可稱為已發生；若會改變答案，只能寫成提問者用語或明確標示的待確認前提。');});
    var timedAction=(p.questionModel.events||[]).find(function(e){return e.queryOperator==='relative_timing'&&(e.actionSequence||[]).length>0;});
    if(timedAction){
      var timingFocusLabel={willingness_onset:'意願何時形成',action_onset:'指定行動何時開始',invitation_onset:'邀約何時發出',event_occurrence:'明示事件何時發生'}[timedAction.timingTarget]||'明示行動的時間';
      lines.push('【明確行動的時間題】這題問的是「'+timingFocusLabel+'」：先直接給本方法實際支持的相對階段或時間範圍，再沿盤面說明從準備／意願到邀約安排、實際行動的承接與卡點。只在盤面提供日曆依據時才給日期；否則清楚說可判到哪個階段。');
      if(timedAction.explicitSexualAct)lines.push('【親密行動層次】分開對方意願、邀約／安排與實際性行為發生時間；對方位象徵不能替代當事人的明確、無壓力且可撤回的同意。依本次盤面回答已能支持的層次，沒有證據的層次直接指出缺口。');
    }
    var listed=(p.questionModel.events||[]).filter(function(e){return e.queryOperator==='enumeration_guidance';});
    listed.forEach(function(e){
      lines.push('【開放列舉題】原句要求列出「'+(e.requestedItems||'相關事項')+'」'+(e.attentionFocus?'，重點是「'+e.attentionFocus+'」':'')+'；這是待回答的項目清單，不可因句尾「嗎」改成只答是／否。'+(e.truthGate?'原句另有明示的成立與否門檻，需先逐項回應後再回答該門檻。':'本題沒有額外的是非門檻。')+'只列本次方法與實際資料能支撐的內容；若所問是方法無法識別的具體現實項目，明說界線，再給可直接查核的下一步。');
    });
    if(p.methods.length>1)lines.push('各法先獨立形成切題判斷，再說明一致或矛盾的原因；同源資料不作多數投票。');
    if(p.healthExam){
      lines.push('【健康檢查能力邊界】本題按原句暫解為「公司安排的員工健康檢查」；語義模型仍保留「公司經營／營運檢視」候選，正文須說明這是依「體檢／要我注意」的暫定判讀，不能把它寫成已確認事實。命理不能推斷會查出什麼病、哪個器官有問題、實際檢查項目、數值或報告結果；不得把牌／卦轉寫成健康警訊清單。直接回答能判到的態度或準備方向；實務上先看公司或診所的正式檢查通知與禁食／用藥說明，拿到報告後向醫療人員核對異常項目。若使用者其實問公司營運，請回到原句候選改按工作／商業方法解讀。');
    }else if(p.domains.includes('health')){
      lines.push('本題有明示健康情境：先回答可以採取的照顧或求助行動，再以盤面反思溝通、負荷或選擇；醫療行動來自現實狀況與醫療資料，盤面不能確定病程、藥物或照顧者造成病情。');
      if(p.bipolarMention)lines.push('就使用者提到的躁鬱症提供照顧方向：若近期狀況改變，及早聯絡原精神科團隊；可詢問是否願意一起整理睡眠、服藥與行為變化。陪同回診、傾聽及照顧者休息是可做的事，藥物調整交由醫師。若疑似躁期、嚴重憂鬱或有即時傷害危險，需緊急專業評估，不能等固定聊天時段。這些是醫療指引的實務建議，不是從牌抽出的治療；急促消息或象徵速度不等於臨床快速循環。參考：NIMH https://www.nimh.nih.gov/health/publications/bipolar-disorder 及 NICE CG185 https://www.nice.org.uk/guidance/cg185/ （本地參考於2026-09-24核對；不宣稱接收提示詞的AI本輪已查網）。');
    }
    if(p.domains.includes('finance'))lines.push(incident?'本題提到財物損失，但語境不是賣場經營數據；按已報告的事故作答，不自行轉成收入、營業額或投資判斷。金額是使用者報告值，不是命理推算。':'財務部分先給本題經營／取捨方向，現實成敗再核對收入、成本、現金流和風險；沒有資料的數字不由象徵換算。');
    if(p.domains.includes('legal'))lines.push('法律部分分開盤面象義與實際程序；處理方式須核對文件、所在地規則及專業意見，不能由命理保證裁判結果。');
    return lines.join('\n');
  }
  var MEMORY_BOUNDARY='【本次資料與記憶邊界】本次只使用這份提示詞明列的原問題、排盤／抽取事實、條件與提問者本次提供的背景。不得引用、調用或暗中依賴帳號記憶、個人檔案、其他對話、先前占卜或先前生成的結論；不得用記憶補缺、推定人物身分、關係、事件或偏好。若本題需要舊資料，只有該資料在本提示詞中重列才可使用；未列明者一律視為未知，指出資料缺口，依本次資料回答。';
  var SHARED_JSON='【完整共用JSON字串｜讀取前還原】';
  function compactLegacyReferences(source){
    var text=String(source),counts=new Map(),definitions=[],index=new Map(),spans=[],stack=[],tokens=/"(?:[^"\\]|\\[\s\S])*"|[{}\[\]]/g;
    if(text.length<140000||text.includes(SHARED_JSON))return text;
    function candidate(start,end){var literal=text.slice(start,end);if(literal.length<160)return;try{JSON.parse(literal);}catch(_){return;}counts.set(literal,(counts.get(literal)||0)+1);spans.push({start:start,end:end,literal:literal});}
    for(var match of text.matchAll(tokens)){
      var token=match[0];if(token[0]==='"'){candidate(match.index,match.index+token.length);continue;}
      if(token==='{'||token==='[')stack.push({token:token,start:match.index});
      else{var open=stack.pop();if(open&&(open.token==='{'&&token==='}'||open.token==='['&&token===']'))candidate(open.start,match.index+1);else stack=[];}
    }
    var pieces=[],cursor=0;
    spans.sort(function(a,b){return a.start-b.start||b.end-a.end;}).forEach(function(span){
      if(span.start<cursor||counts.get(span.literal)<2)return;
      if(!index.has(span.literal)){var n=definitions.length+1,ref;do{ref='〔JY共用原文'+n+++'〕';}while(text.includes(ref)||definitions.some(function(d){return d.ref===ref;}));definitions.push({ref:ref,literal:span.literal});index.set(span.literal,JSON.stringify(ref));}
      pieces.push(text.slice(cursor,span.start),index.get(span.literal));cursor=span.end;
    });
    if(!definitions.length)return text;
    var encoded=pieces.join('')+text.slice(cursor)+'\n\n'+SHARED_JSON+'\n'+JSON.stringify(definitions);
    return encoded.length<text.length?encoded:text;
  }
  function expandLegacyReferences(source){
    var text=String(source),at=text.lastIndexOf('\n\n'+SHARED_JSON+'\n');if(at<0)return text;
    var start=at+SHARED_JSON.length+3,end=text.indexOf('\n',start),definitions;try{definitions=JSON.parse(text.slice(start,end<0?undefined:end));}catch(_){return text;}
    if(!Array.isArray(definitions)||!definitions.every(function(d){return d&&typeof d.ref==='string'&&typeof d.literal==='string';}))return text;
    var index=new Map(definitions.map(function(d){return [JSON.stringify(d.ref),d.literal];}));
    return text.slice(0,at).replace(/"(?:[^"\\]|\\[\s\S])*"/g,function(literal){return index.get(literal)||literal;})+(end<0?'':text.slice(end));
  }
  function finish(prompt,options){
    if(root.JYPromptPacket)return root.JYPromptPacket.finish(prompt,options);
    var text=String(prompt||'');
    if(!text.trim())return text;
    var current=plan(options),at=text.lastIndexOf('【共用判讀版本】'+VERSION),existing=at<0?'':text.slice(at);
    if(current.careContext.level==='safety-first'&&existing.includes('原問句（原文資料）：'+JSON.stringify(current.question))&&existing.includes(SAFETY_ENDING))return prepareDeliveryText(text,options);
    if(text.trimEnd().endsWith(FOOTER)&&existing.includes('原問句（原文資料）：'+JSON.stringify(current.question))&&existing.includes('有效方法：'+current.methods.map(function(k){return METHODS[k].name;}).join('、')+'。'))return text.trimEnd();
    // Only the exact application-owned final footer is moved; no source facts
    // or user-entered substrings are stripped or deduplicated.
    var task=render(Object.assign({},options,{providedGuide:text}));
    if(text.trimEnd().endsWith('\n\n'+task+'\n\n'+FOOTER))return text.trimEnd();
    var end=text.lastIndexOf(FOOTER),tail=end>=0&&text.slice(end+FOOTER.length).trim()==='';
    var body=tail?text.slice(0,end).trimEnd():text.trimEnd();
    return prepareDeliveryText(compactLegacyReferences(body)+'\n\n'+(body.length>=140000?'如資料含「'+SHARED_JSON+'」，先以每列literal原樣替換JSON內被引號包住的ref，再解析原盤；這是完整字串編碼，沒有刪除盤面事實。\n':'')+task+'\n\n'+(tail?FOOTER:''),options);
  }
  // This is a small, explicit copy of actual facts for answer verification.
  // It is never a new chart, a verdict, or a replacement for reading data.
  function factSnapshot(method,chart,analysis){
    var c=chart||{},a=analysis||{},copy=function(v){return v==null?null:JSON.parse(JSON.stringify(v));};
    var out={method:method,partial:!!a.coverage?.provisional};
    if(method==='bazi'){
      out.dayMaster=c.dm||c.dayMaster||null;
      out.pillars=Object.fromEntries(['year','month','day','hour'].filter(function(k){return c.pillars?.[k]&&!(k==='hour'&&out.partial);}).map(function(k){var p=c.pillars[k];return [k,typeof p==='string'?p:p.gan+p.zhi];}));
      out.gender=c.gender||null;
      if(a.children?.requested)out.children={inputGender:a.children.inputGender,hourKnown:a.children.hourKnown,actualBranchPairs:copy(a.children.actualBranchPairs),branches:a.children.branches.map(function(b){return {gender:b.gender,status:b.status,evidenceDirection:b.evidenceDirection,placements:b.placements.map(function(x){return {id:x.id,pillar:x.pillar,stem:x.stem,god:x.god,visible:x.visible};}),count:copy(b.count)};})};
    }else if(method==='ziwei'){
      out.palaces=out.partial?[]:(c.palaces||[]).map(function(p){return {name:p.name,branch:p.branch,gan:p.gan,isShen:!!p.isShen,stars:(p.stars||[]).map(function(s){return {name:s.name,type:s.type};})};});
      out.sihua=copy(c.sihua||[]);out.selfHua=copy(c.selfHua||[]);
      out.decades=(c.daXian||[]).map(function(d){return {ageStart:d.ageStart,ageEnd:d.ageEnd,branch:d.branch,hua:copy(d.hua)};});
    }else if(method==='astro'||method==='vedic'){
      out.planets=Object.fromEntries(Object.entries(c.planets||{}).map(function(pair){var p=pair[1];return [pair[0],{sign:p.sign,signName:p.signName,house:p.house??null}];}));
      out.unknownTime=!!c.input?.unknownTime;
    }else if(method==='tarot'||method==='lenormand'){
      var d=c.tarotData||c;out.cards=(a.methodData?.records||d.cards||[]).map(function(p){return {name:p.name,id:p.id,position:p.position,direction:p.direction||null};});
    }else if(method==='liuyao'||method==='yijing'){
      out.movingPositions=(c.lines||[]).filter(function(l){return l.moving;}).map(function(l){return l.position;});
      out.original=copy(c.original);out.changed=copy(c.changed);
    }else if(method==='meihua'){
      out.body=copy(c.tiG);out.use=copy(c.yoG);out.movingPosition=c.dongYao??c.movingLine??null;
    }else if(method==='liuren'){
      out.transmissions=(c.transmissions||[]).map(function(t){return {branch:t.branch,general:t.general,kinship:t.kinship};});
    }else if(method==='name'){
      out.names=(c.names||[c]).filter(function(p){return p.name;}).map(function(p){return {name:p.name,grids:(p.fiveGrids?.grids||[]).map(function(g){return {role:g.role,num:g.num};})};});
    }else if(method==='compat'){
      out.people=['personA','personB'].filter(function(k){return c[k];}).map(function(k){return {label:k==='personA'?'A':'B',name:c[k].name||null,unknownTime:!!c[k].unknownTime};});
    }else if(method==='oracle'){
      out.number=c.n??c.number;out.poem=c.p??c.poem??a.methodData?.poem;
    }else if(method==='ootk'){
      out.completed=copy(a.methodData?.completed||[]);
    }else if(method==='personality'){
      out.code=c.code;out.axes=(c.axes||[]).map(function(p){return {left:p.left,right:p.right,rightSelected:p.rightSelected};});
    }
    return out;
  }
  function verificationFacts(entries,question,sections){
    var scope=reportScope(question,entries[0]?.method),years=[];
    (sections||[]).forEach(function(s){
      if(s.data?.requestedYears)years.push.apply(years,s.data.requestedYears);
      if(s.data?.annualSegments)years.push.apply(years,s.data.annualSegments.map(function(y){return y.year;}));
    });
    return {schema:'jy.reading-facts/1',version:VERSION,fullChart:scope.fullChart,
      annualRequested:scope.annualRequested,
      requiredYears:scope.annualRequested?Array.from(new Set(years)).sort(function(a,b){return a-b;}):[],
      charts:entries.map(function(e){return Object.assign({label:e.label||null},factSnapshot(e.method,e.chart,e.analysis));})};
  }
  function readVerificationFacts(options){
    var source=String(options.sourcePrompt||''),packet=root.JYPromptPacket?.get(source),cachedFacts=packet?.readingFacts||packet?.readingData?.verificationFacts;
    if(cachedFacts)return {facts:cachedFacts,status:'available'};
    var m=source.match(/【原盤事實核對】\s*\n([^\n]+)/);
    if(m){try{
      var parsed=JSON.parse(m[1]),valid=parsed.schema==='jy.reading-facts/1'&&Array.isArray(parsed.charts)&&parsed.charts.every(function(c){
        if(!c||typeof c!=='object'||!METHODS[c.method])return false;
        if(c.method==='bazi'&&(c.dayMaster!=null&&typeof c.dayMaster!=='string'||!c.pillars||typeof c.pillars!=='object'))return false;
        if(c.method==='ziwei'&&(!Array.isArray(c.palaces)||!c.palaces.every(function(p){return p&&typeof p.name==='string'&&/^(?:命|兄弟|夫妻|子女|財帛|疾厄|遷移|交友|官祿|田宅|福德|父母)宮?$/.test(p.name)&&Array.isArray(p.stars)&&p.stars.every(function(s){return s&&typeof s.name==='string';});})||!Array.isArray(c.sihua)||!c.sihua.every(function(h){return h&&typeof h.star==='string'&&typeof h.hua==='string';})))return false;
        return true;
      })&&Array.isArray(parsed.requiredYears)&&parsed.requiredYears.every(Number.isInteger);
      if(valid)return {facts:parsed,status:'available'};
    }catch(_){}return {facts:null,status:'invalid-source'};}
    var e=options.evidence||{};
    if(e.pillars||e.dayMaster)return {facts:{charts:[{method:'bazi',pillars:e.pillars||{},dayMaster:e.dayMaster}],requiredYears:e.requiredYears||[]},status:'available'};
    return {facts:null,status:'source-required'};
  }
  function reviewFacts(options,issue){
    var read=readVerificationFacts(options),facts=read.facts,answer=String(options.answer||''),checked=0;
    if(read.status==='invalid-source')issue('INVALID_FACT_SOURCE','error','原盤事實核對資料不完整或格式無效，請貼回完整原始提示詞。');
    if(!facts)return {status:read.status,checks:0};
    var bazi=facts.charts.filter(function(c){return c.method==='bazi'&&!c.label;}),ziwei=facts.charts.filter(function(c){return c.method==='ziwei'&&!c.label;});
    var sentences=answer.split(/[。！？!?\n]/),nonClaim=/(?:如果|假如|假設|假设|不是|並非|而非|錯寫|誤寫|誤稱|錯誤|錯盤|錯在|不能|不可|不得|不代表|不等於|例如|舉例|未抽到|未出現)/;
    function mismatch(code,actual,expected,s){checked++;if(actual!==expected)issue(code,'error','答案與原盤不一致：'+actual+'；原盤為'+expected+'。',s);}
    sentences.forEach(function(s){
      if(nonClaim.test(s))return;
      var relations=s.matchAll(/([木火土金水])(生|克)([木火土金水])/g);
      for(var r of relations){var table=r[2]==='生'?{木:'火',火:'土',土:'金',金:'水',水:'木'}:{木:'土',火:'金',土:'水',金:'木',水:'火'};mismatch('ELEMENT_RELATION_MISMATCH',r[0],r[1]+r[2]+table[r[1]],s);}
      if(bazi.length===1&&!/(?:大運|流年|流月|流日|流時|對方|另一人)/.test(s)){
        var b=bazi[0],dm=s.match(/(?:日主|日元)\s*(?:是|為|为|[:：=])\s*([甲乙丙丁戊己庚辛壬癸])/);
        if(dm&&b.dayMaster)mismatch('DAY_MASTER_MISMATCH',dm[1],b.dayMaster,s);
        for(var p of s.matchAll(/(年柱|月柱|日柱|時柱|时柱)\s*(?:是|為|为|[:：=])\s*([甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥])/g)){
          var key={年柱:'year',月柱:'month',日柱:'day',時柱:'hour',時柱:'hour'}[p[1]],expected=b.pillars?.[key];
          if(expected)mismatch('PILLAR_MISMATCH_'+key,p[2],typeof expected==='string'?expected:expected.gan+expected.zhi,s);
        }
      }
      if(ziwei.length===1&&!/(?:大限|流年|流月|流日|流時|借星|借對|借入|會照|三方|對宮|飛入)/.test(s)){
        var z=ziwei[0];
        (z.palaces||[]).forEach(function(p){
          var short=p.name.replace(/宮$/,''),re=new RegExp('(?:本命|原局|你的|命主的)?'+short+'宮(?:的)?(?:主星|坐星)\\s*(?:是|為|为|[:：=])\\s*([^，,；;。\\n]+)'),m=s.match(re);
          if(!m)return;var major=(p.stars||[]).filter(function(t){return t.type==='major';}).map(function(t){return t.name;}),known=['紫微','天機','太陽','武曲','天同','廉貞','天府','太陰','貪狼','巨門','天相','天梁','七殺','破軍'];
          known.filter(function(t){return m[1].includes(t);}).forEach(function(t){checked++;if(!major.includes(t))issue('NATAL_STAR_MISMATCH_'+short,'error','本命'+short+'宮主星引用錯誤：'+t+'；原盤為'+(major.join('、')||'主星空宮')+'。',s);});
        });
        (z.sihua||[]).forEach(function(h){var re=new RegExp('(?:生年.{0,4}'+h.star+'|'+h.star+'.{0,4}生年)(?:化)?([祿權科忌])'),m=s.match(re);if(m)mismatch('NATAL_HUA_MISMATCH_'+h.star,m[1],h.hua.replace('化',''),s);});
      }
    });
    if(facts.fullChart&&ziwei.length===1&&!ziwei[0].partial){
      var missing=(ziwei[0].palaces||[]).filter(function(p){return !answer.includes(p.name.replace(/宮$/,'')+'宮');}).map(function(p){return p.name;});
      if(missing.length)issue('PALACE_COVERAGE','revision','全盤報告尚未逐宮涵蓋：'+missing.join('、')+'。');
    }
    if(facts.requiredYears?.length){
      var missingYears=facts.requiredYears.filter(function(y){return !new RegExp('(?:^|\\n)[\\s|#•・*\\-]*(?:[0-9]+[.)]\\s*)?'+y+'(?:年|[\\s|（(])').test(answer);});
      if(missingYears.length)issue('YEAR_COVERAGE','revision','逐年報告缺少獨立年度列：'+missingYears.join('、')+'；原題範圍不得以十年摘要替代。');
    }
    return {status:'explicit-facts-checked',checks:checked,scope:'只核可辨識的明示原盤事實、生克與作答覆蓋；不是完整語義裁決或預測命中驗證。'};
  }
  function reviewOOTK(options){
    var source=String(options.sourcePrompt||''),answer=String(options.answer||''),issues=[];
    function issue(code,message){issues.push({code:code,severity:'revision',message:message,excerpt:''});}
    var marker=source.match(/【OOTK成稿契約】\s*\n([^\n]+)/),contract=options.ootkContract||null;
    if(!contract&&marker)try{contract=JSON.parse(marker[1]);}catch(_){}
    if(!contract){issue('OOTK_SOURCE_REQUIRED','需要本次完整OOTK原始提示詞，才能核對有效輪次及成稿內容。');return issues;}
    var expected=contract.expectedLayers||[],blocks=[];
    if(!expected.length){if(/(?:牌面顯示|盤面最支持|盤面較支持|最終會|必然)/.test(answer))issue('OOTK_STOPPED_CAST_INTERPRETED','本次沒有有效可讀輪次，不能從無效牌面形成方向性占斷。');return issues;}
    var heading=/^[ \t]*(?:#{1,6}\s*)?(?:[-*+]\s+|[一二三四五\d]+[.)、]\s*)?(?:\*\*)?(?:【)?(?:第([一二三四五1-5])(?:輪|層|次操作)|op([1-5]))/gmi,match;
    while((match=heading.exec(answer))){var numeral=match[1]||match[2],index='一二三四五'.indexOf(numeral)+1;if(!index)index=Number(numeral);blocks.push({operation:'op'+index,start:match.index,end:heading.lastIndex});}
    expected.forEach(function(key){
      var at=blocks.findIndex(p=>p.operation===key);
      if(at<0){issue('OOTK_LAYER_MISSING_'+key,'缺少'+key+'的獨立逐層判讀；須交代新增判斷、支持、反證及對前輪的修正。');return;}
      var block=answer.slice(blocks[at].end,at+1<blocks.length?blocks[at+1].start:answer.length);
      var anchor=(contract.evidenceAnchors||[]).find(p=>p.operation===key),normalized=block.replace(/[\s\p{P}]/gu,'');
      function mentioned(name){return name&&name!=='未記錄'&&normalized.includes(String(name).replace(/[\s\p{P}]/gu,''));}
      if(anchor){
        var named=(anchor.cards||[]).filter(mentioned),available=(anchor.cards||[]).filter(n=>n&&n!=='未記錄');
        if(new Set(named).size<Math.min(2,new Set(available).size))issue('OOTK_LAYER_ANCHOR_'+key,key+'只有抽象證據名稱，須引用本輪實際牌與作用關係，不能以「計數支持」替代盤面分析。');
        if(anchor.significator&&anchor.significator!=='未記錄'&&!mentioned(anchor.significator)&&!/(?:代表牌|significator)/i.test(block))issue('OOTK_SIGNIFICATOR_'+key,key+'忽略了代表牌在本輪的狀態及作用。');
        if(key==='op4'){
          var countNames=(anchor.countingCards||[]).filter(n=>n&&n!=='未記錄');
          if(countNames.filter(mentioned).length<Math.min(3,countNames.length))issue('OOTK_RING_COUNT_ANCHORS','第四輪未引用足夠的實際計數節點形成故事；不能只選一兩張關係牌。');
          if((anchor.pairs||[]).length&&!(anchor.pairs||[]).some(p=>p.every(mentioned)))issue('OOTK_RING_PAIR_ANCHOR','第四輪沒有使用任何完整的實際配對，須比較配對故事與計數主線。');
        }
      }
      if(!/(?:依據|支持|計數|配對|尊貴|落宮|落域|牌鏈|牌組|生命樹|環牌)/.test(block))issue('OOTK_LAYER_EVIDENCE_'+key,key+'未交代可核對的本輪結構依據。');
      if(!/(?:反證|限制|牽制|阻力|但|然而|不足)/.test(block))issue('OOTK_LAYER_COUNTER_'+key,key+'未說明本輪最強反證或限制。');
      if(key!=='op1'&&!/(?:前輪|前一|上一|承接|延續|加強|削弱|轉向|推翻|修正|收斂)/.test(block))issue('OOTK_LAYER_CHANGE_'+key,key+'未說明如何承接或修正前輪。');
      if(key==='op4'&&(!/(?:環牌|36|三十六)/.test(block)||!/(?:計數|牌鏈)/.test(block)||!/配對/.test(block)||!/(?:尊貴|元素)/.test(block)||!/(?:多數|同階)/.test(block)))issue('OOTK_RING_STORY','第四輪須交代完整環牌主線、計數、配對、尊貴及多數觀察如何共同形成故事。');
      if(key==='op5'&&!/(?:收斂|最終|結果|持續)/.test(block))issue('OOTK_RESULT_CONVERGENCE','第五輪尚未形成結果收斂或持續條件。');
    });
    var normalizedBlocks=blocks.filter(p=>expected.includes(p.operation)).map(function(p,i){var next=blocks.find(b=>b.start>p.start);return answer.slice(p.end,next?next.start:answer.length).replace(/[\s\p{P}]/gu,'');});
    if(normalizedBlocks.some(function(text,i){return text&&normalizedBlocks.indexOf(text)<i;}))issue('OOTK_REPEATED_LAYER','多輪內容完全重複，須說明不同輪次的實際新增作用或前輪被推翻的理由。');
    var first=answer.split(/\n\s*\n/)[0]||'';
    if(/(?:無法|不能).{0,18}(?:知道|證實|判斷|回答)|心意未知|只能.{0,15}現實/.test(first)&&!/(?:較支持|最支持|最可能|盤面傾向|盤面較|偏向|兩種方向|相持)/.test(first))issue('OOTK_SAFETY_ONLY','主答案只交代未知或不能證實，須先回答盤面最支持的方向性推論。');
    if(expected.length===5){
      for(const [code,re,label]of [
        ['MOST_LIKELY',/最可能|最支持|主判|主要傾向/,'最可能傾向'],['ALTERNATIVE',/次可能|次要傾向|替代解釋|另一種解釋/,'次可能傾向'],
        ['SUPPORT',/最強支持|支持鏈/,'最強支持鏈'],['COUNTER',/最強反證/,'最強反證'],['CONDITION',/成立條件/,'成立條件'],
        ['FALSIFIER',/推翻條件|改判條件|會推翻|應改判/,'推翻條件'],['TIME',/時間|時窗|曆日|應期/,'時間依據或不能給時間的界線'],
        ['ACTION',/行動|下一步|建議先|可執行/,'可執行行動'],['BOUNDARY',/已知.*推論.*未知|盤面事實|事實與推論/,'已知、推論與未知界線'],['CONFIDENCE',/信心|置信|確定度/,'信心來源']
      ])if(!re.test(answer))issue('OOTK_'+code+'_MISSING','缺少'+label+'。');
    }
    if(/(?:第一|第二|第三|第四|第五)(?:輪|層).{0,15}(?:等於|就是|代表|＝).{0,10}(?:下個月|[一二三四五]月)/.test(answer))issue('OOTK_FALSE_CALENDAR','五輪被硬套成固定月份，須改用程序層次。');
    if(/女祭司.{0,20}(?:所以|因此|代表).{0,18}(?:無法回答|停止分析|不再判讀)/.test(answer))issue('OOTK_PRIESTESS_STOP','女祭司被用來終止判讀，須整合第五輪其他有效作用。');
    answer.split(/[。！？\n]/).forEach(function(sentence){if(!/(?:不能|不得|不代表|並非|不是|未必|不一定)/.test(sentence)&&/(?:她|他|對方|主管).{0,12}(?:一定|肯定|必然).{0,12}(?:喜歡|愛你|討厭|想要|想跟|願意|看不起|欣賞)/.test(sentence))issue('OOTK_SYMBOL_AS_FACT','第三方心意被宣稱為確定事實，須改成有五輪依據的方向性推論。');});
    if(/(?:physicalOrientation|ootkInverted|significatorInverted).{0,30}(?:三個|三項|兩個).{0,10}(?:負面|反證)/.test(answer))issue('OOTK_ALIAS_DOUBLE_WEIGHT','同一朝向別名被重複作負面反證。');
    return issues;
  }
  function review(options){
    options=options||{};
    var p=plan(options),answer=String(options.answer||'').trim(),evidence=options.evidence||{},issues=[];
    function issue(code,severity,message,excerpt){if(!issues.some(function(i){return i.code===code;}))issues.push({code:code,severity:severity,message:message,excerpt:excerpt||''});}
    if(!answer){issue('EMPTY_ANSWER','error','請貼上實際答案。');return {version:VERSION,status:'needs_revision',issues:issues,semanticVerification:'not_performed'};}
    var factVerification=reviewFacts(options,issue);
    var nativeFacts=readVerificationFacts(options).facts?.charts||[];
    var readableFacts=nativeFacts.some(function(c){return Object.keys(c.pillars||{}).length>=3||Object.keys(c.planets||{}).length>0||(c.cards||[]).length>0||(c.palaces||[]).length>0||(c.transmissions||[]).length>0||!!c.original||!!c.body||(c.names||[]).length>0||(c.completed||[]).length>0||(c.axes||[]).length>0||!!c.poem;});
    var blanketRefusal=/(?:命理|本法|本方法|這份資料|這個問題|本題|整題|全部).{0,18}(?:不能解讀|無法解讀|無法回答|不能回答|無法作答|沒有辦法判讀)|(?:不能|無法).{0,8}(?:對這個問題|對本題).{0,8}(?:解讀|回答|判讀)/.test(answer);
    var hasReading=/(?:較支持|比較可能|較可能|偏向|傾向|值得期待|有利|阻力|瓶頸|卡在|仍可看|可以觀察)/.test(answer);
    if(readableFacts&&blanketRefusal&&!hasReading)issue('AVAILABLE_EVIDENCE_AS_WHOLE_REFUSAL','revision','本次仍有有效原生資料。先辨原句子題並完成切題的方向、原因和做法；若方法不適合某項，說明那一項的具體缺口，不能因分類未命中、精度未測量或另一盤失敗就整題拒讀。');
    var childFacts=nativeFacts.find(function(c){return c.method==='bazi'&&c.children;})?.children;
    if(childFacts){
      if(answer.length<350&&/(?:不能|無法|算不出).{0,16}(?:人數|數字|幾個|推算)/.test(answer)&&!/(?:子女.{0,8}(?:訊號|緣|條件)|有利|阻力|較支持|偏向|比較可能)/.test(answer))issue('PRECISION_AS_WHOLE_REFUSAL','revision','本次有子女議題資料；不能只以精確人數未定結案，須解釋仍有效的方向、原因與下一步。');
      if(childFacts.inputGender==='unprovided'&&/(?:不論|不论|無論|无论).{0,20}(?:男|女|哪種|哪种).{0,60}(?:一到兩|一至兩|1[–—~-]2)/.test(answer))issue('UNRESOLVED_GENDER_COUNT','review','男女支線不能未比較有效取法就平均成同一個人數；請核對每條支線的實際數量依據。');
      if(childFacts.hourKnown===false&&/(?:時柱|時支|子女位置).{0,25}(?:表示|代表|是|為).{0,25}(?:孩子|子女|人數)/.test(answer))issue('UNCONFIRMED_HOUR_CHILD_CLAIM','review','出生時位未確認，不以暫排時柱斷子女數量或相處。');
    }
    var paragraphs=answer.split(/\n\s*\n/).filter(Boolean),first=paragraphs[0],sentences=answer.match(/[^。！？!?\n]+[。！？!?]?/g)||[];
    if(p.situation.workDecision&&p.careContext.level!=='safety-first'){
      if(!/人力|人手|替補|交接|調度|代班|現場|崗位|同事|主管/.test(answer))issue('WORK_CONTEXT_OMITTED','revision','出勤取捨只談心情或運勢，漏了外在責任：需核對實到人力、交接及誰能調度，再比較休息與出勤的後果；這是現實核對，不能冒稱已知缺人。');
      var reported=p.situation.sources.filter(function(s){return s.modality==='user-reported';}).map(function(s){return s.text;}).join('\n');
      sentences.forEach(function(s){
        if(/若|假如|如果|假設|可能|是否|幾人|多少人|不能|不可|無法|不代表|不等於|沒有證據|未必|[？?]/.test(s))return;
        var re=/(?:請假|休假|缺勤|缺席|人力|人手).{0,12}?([\d一二兩三四五六七八九十]+)\s*(?:個)?人|([\d一二兩三四五六七八九十]+)\s*(?:個)?人.{0,8}(?:請假|休假|缺勤|缺席)/g,m;
        while((m=re.exec(s))){var v=numeral(m[1]||m[2]),reportedCounts=Array.from(reported.matchAll(new RegExp(re.source,'g'))).map(function(x){return numeral(x[1]||x[2]);});if(!reportedCounts.includes(v))issue('UNREPORTED_STAFFING_COUNT','error','回答把未提供的請假／缺勤人數說成事實；符號、課數與牌數不能換成現場人數。',s);}
      });
      if(/(?:早已|早就|原本就|事前已|之前就).{0,15}(?:算出|看出|預見|算中)|(?:回饋|補充).{0,20}(?:證明|證實).{0,20}(?:算中|準確|早就)/.test(answer))issue('HINDSIGHT_AS_PREDICTION','revision','事後補充須明說是使用者新回報；沒有保留事前同一項具體判斷，不能宣稱已經算中。');
    }
    if(/^(?:根據(?:你提供的|本次)|以下(?:是|將)|我(?:會|將)(?:先|從)|作為(?:一個|一名)?AI)/.test(first))issue('REPORT_VOICE_OPENING','revision','開頭改為直接解答當事人的事情，保留必要條件；不先介紹分析流程。',first);
    if(/(?:先看|先核|鏡射|鏡像|\d\s*[↔→]\s*\d|中心.{0,8}(?:位置|牌)|本次牌陣)/.test(first)&&!/(?:你可以先|建議你先|優先.{0,12}(?:做|聯絡|安排|確認))/.test(first))issue('METHOD_FIRST','revision','開頭以技法說明代替答案；先寫本題主判或第一步。',first);
    var methodStarts=paragraphs.filter(function(x){return /^(?:先看|再看|接著看|開頭的|牌面上|鏡射|鏡像|中心牌|第[一二三四五六七八九十\d]+[張宮爻])/.test(x);}).length;
    if(methodStarts>=3)issue('METHOD_TOUR','revision','多段按技法或位置報盤；改成每段先解答，再提供必要依據。');
    function affirmative(s){return !/(?:不能|不可|不代表|不等於|無法|沒有證據|並非|不是|不得|不應|不宜|未必)/.test(s);}
    // This catches explicit claims; it does not certify the semantic quality of an answer.
    var claimText=answer.replace(/^\s*>.*$/gm,'').replace(/```[\s\S]*?```/g,'').replace(/「[^」]*」|『[^』]*』|“[^”]*”|"(?:\\.|[^"\\])*"|`[^`]*`/g,'');
    var clauses=claimText.split(/[。！？!?；;，,\n]+|(?:但是|不過|不过|但)/);
    clauses.forEach(function(s){
      if(/(?:不能|不可|不得|不要|別|别).{0,15}(?:說|说|認定|认定|斷言|断言)|不代表|不等於|並非|并非|不是|未必|沒有證據|没有证据/.test(s))return;
      if(/(?:你|命主|當事人|当事人).{0,36}(?:一生|一輩子|一辈子|終身|终身|注定|命定).{0,36}(?:貧|贫|孤獨|孤独|孤苦|失敗|失败|沒救|没救|不能|無法|无法|無望|无望|不行|不幸)|(?:婚姻|感情|工作|事業|事业|人生).{0,20}(?:永遠|永远).{0,20}(?:不會|不会|不可能|沒救|没救|不幸|無望|无望)/.test(s))issue('LIFETIME_VERDICT','error','把本題象徵或階段困難擴成終身判決；重新界定範圍、時間、條件與實算救應。',s);
      if(/(?:一定|必定|必然|保證|保证|肯定會|肯定会|確定會|确定会|絕對會|绝对会).{0,24}(?:發財|发财|富貴|富贵|結婚|结婚|離婚|离婚|復合|复合|幸福|成功|失敗|失败|死亡|得病|生病)/.test(s))issue('GUARANTEED_EVENT','error','對現實事件作保證式斷言；改為有來源、範圍與條件的推論。',s);
    });
    claimText.split(/[。！？!?；;\n]+/).forEach(function(s){
      if(!affirmative(s))return;
      if(/(?:身弱|財多身弱|财多身弱|化忌|落陷|凶數|凶数).{0,20}(?:所以|因此|代表|表示|證明|证明|導致|导致).{0,35}(?:賺不了|赚不了|不能賺|不能赚|無法賺|无法赚|體弱|体弱|沒能力|没能力|婚姻.{0,8}(?:失敗|失败|沒救|没救))/.test(s))issue('LABEL_AS_REALITY','error','技術標籤被直接當成身體、能力或現實成敗；回到完整作用、反證與待核實条件。',s);
      if(/(?:轉運|转运|大運|大运|好運|好运|運勢|运势).{0,45}(?:現在只能熬|现在只能熬|只能苦等|什麼都不要做|什么都不要做|什麼都不能做|什么都不能做)/.test(s))issue('PASSIVE_FATE_WAIT','error','把目前所有行動延後到轉運；說清當下可核對與可改變的環節，不保證運期自動改善。',s);
      if(/(?:AI|模型|引擎|多個系統|多个系统).{0,35}(?:都|一致|相同).{0,25}(?:證實|证实|證明|证明|確定|确定).{0,25}(?:命運|命运|未來|未来|會|会|就是)/i.test(s))issue('CONSENSUS_AS_PROOF','error','把AI或同源模型的一致回答當現實確證；區分內部一致與獨立事實驗證。',s);
    });
    sentences.forEach(function(s){
      if(affirmative(s)&&/(?:你們的|你們之間的|你的|對話).{0,35}(?:確實|本來就|正是|造成|導致|放大器)/.test(s)&&!/(?:如果|假如|若|可能|你提到|你描述)/.test(s))issue('UNSUPPORTED_CAUSAL_STORY','review','這句把未提供的互動或因果寫成事實；請對照使用者原文核實。',s);
      if(affirmative(s)&&/(?:騎士|鳥|雲|星曜|星盤|牌面|命盤|八字|卦象).{0,65}(?:符合|代表|顯示|證明|就是).{0,60}(?:躁鬱|快速循環|疾病|發病|病情|情緒變化)/.test(s))issue('SYMBOL_AS_CLINICAL_EVIDENCE','error','象徵被當作病情或臨床現象的證據；改以實際症狀與專業評估處理。',s);
      if(affirmative(s)&&/(?:唯一|真正).{0,30}(?:資源|關鍵).{0,20}(?:你|自己)|(?:你|自己).{0,25}唯一.{0,15}(?:資源|關鍵)/.test(s))issue('SOLE_RESPONSIBILITY','review','唯一責任或資源的說法缺少依據；確認是否排除了醫療或其他支持。',s);
      if(affirmative(s)&&/木生火|乙生丁/.test(s)&&/天生|付出|添柴|反感|壓力/.test(s))issue('ELEMENT_AS_RELATIONSHIP_FACT','error','日主相生被直接換成付出或感受；回到兩方原局與現實互動。',s);
      if(affirmative(s)&&/(?:化祿|合局|六合|正官|食神).{0,20}(?:證明|一定|必然).{0,20}(?:愛|願意|忠誠|信任|結婚)/.test(s))issue('SYMBOL_AS_PERSONAL_FACT','error','吉象不能證明特定人的意願或忠誠，須重做相關結論。',s);
      if(affirmative(s)&&/(?:機率|概率|成功率|準確率).{0,12}\d+(?:\.\d+)?\s*[%％]/.test(s))issue('INVENTED_PROBABILITY','review','請核對此機率的資料與算法，不能由吉凶計票產生。',s);
    });
    if(p.domains.includes('health')&&p.bipolarMention){
      if(!/(?:精神科|醫師|醫療團隊|治療團隊|回診)/.test(answer))issue('CLINICAL_SUPPORT_MISSING','revision','明示病情改變的照顧題，需交代如何聯絡原精神科或治療團隊。');
      if(/(?:如果|若|等).{0,100}(?:更明顯|失控|惡化|無效).{0,130}(?:精神科|醫療|治療|專業評估)/s.test(answer)&&!/(?:及早|儘早|盡早|現在|先).{0,22}(?:聯絡|聯繫|回診|就醫)/.test(answer))issue('CARE_DELAY','error','求助被放在失控或日常溝通無效之後；病情改變應及早聯絡治療團隊。');
    }
    if(p.methods.includes('lenormand')&&Array.isArray(evidence.cards)){
      var names=evidence.cards.map(function(c){return typeof c==='string'?c:c.name;});
      var all=['騎士','幸運草','船','房屋','樹','雲','蛇','棺材','花束','鐮刀','鞭子','鳥','小孩','狐狸','熊','星星','鸛','狗','塔','花園','山','道路','老鼠','心','戒指','書','信','紳士','淑女','百合','太陽','月亮','鑰匙','魚','錨','十字架'];
      var missing=all.filter(function(n){return !names.includes(n)&&new RegExp(n+'(?:牌|→|↔)|(?:→|↔)'+n).test(answer);});
      if(missing.length)issue('CARD_NOT_IN_CAST','error','答案引用了未出現在本次牌面的牌：'+missing.join('、'));
      if(evidence.spread==='five'&&!names.every(function(n){return answer.includes(n);}))issue('LINE_MEMBER_OMITTED','review','五張線有牌未被點出；核對全線主判是否仍有處理該牌作用，不要求逐張各寫一段。');
    }
    if(evidence.birthTimeUnknown===true&&/(?:你的|命主)(?:上升|命宮|身宮).{0,8}(?:在|是|為)/.test(answer))issue('UNKNOWN_TIME_ANGLE','error','未知時辰卻使用確定上升／命身宮；須核對來源。');
    if(evidence.status==='stopped'&&/(?:牌面顯示|結果牌|最終會|必然)/.test(answer))issue('STOPPED_CAST_INTERPRETED','error','未完成的程序被當成有效事件占斷。');
    if(p.methods.includes('ootk')&&evidence.status!=='stopped')reviewOOTK(options).forEach(function(i){issue(i.code,i.severity,i.message,i.excerpt);});
    if(p.careContext.level==='safety-first'){
      if(/shopee\.tw|選購|选购|到.{0,8}(?:賣場|卖场)|購買.{0,12}(?:手鍊|水晶)|购买.{0,12}(?:手链|水晶)/.test(answer))issue('SAFETY_COMMERCE','error','明示人身安全需要時應暫停導購，先提供實際安全支持。');
      if(!/安全|陪伴|陪著|陪着|可信任|緊急|紧急|急診|急诊|聯絡|联络|協助|协助/.test(answer))issue('SAFETY_PRIORITY_MISSING','error','明示自傷念頭卻仍只有命理判語；先處理眼前安全與可獲得的支持。');
    }
    else if(!answer.includes(FOOTER))issue('SHOP_FOOTER','revision','補回指定可點擊賣場連結與祝福，保持最後兩行。');
    else if(!answer.endsWith(FOOTER))issue('SHOP_ORDER','revision','將連結與祝福放在整篇最後兩行。');
    if(p.careContext.commercialRequired&&evidence.status!=='stopped'&&evidence.valid!==false){
      var prose=answer.split(FOOTER).join('');
      if(!/(?:白水晶|粉晶|紫水晶|黃水晶|茶晶|綠幽靈|髮晶|黑曜石|月光石|海藍寶|瑪瑙|虎眼石|青金石|天鐵|龍宮舍利|(?:素色|黑色|白色|綠色|藍色|編繩|木珠).{0,35}手鍊)/.test(prose)||!/手鍊/.test(prose))issue('BRACELET_SELECTION_MISSING','revision','補上一款具體手鍊及佩戴者，引用本題有效盤面並連到可行行動；不能只寫一般水晶提醒。');
      if(!/(?:靜月之光|蝦皮|賣場).{0,35}(?:挑|選|找|看看|逛)|(?:挑選|選購|看看|找找).{0,35}(?:靜月之光|蝦皮|賣場)/.test(prose))issue('SHOP_INVITATION_MISSING','revision','選品理由之後補自然邀請到指定賣場挑選相應設計，不捏造庫存或价格。');
    }
    if(p.careContext.commercialRequired&&/(?:黑曜石|茶晶|白水晶|粉晶|紫水晶|黃水晶).{0,6}或.{0,6}(?:黑曜石|茶晶|白水晶|粉晶|紫水晶|黃水晶)/.test(answer))issue('UNSELECTED_PRODUCT','revision','尚未選出一個主項；說明佩戴者、單一設計及它提醒的行動。');
    if(p.careContext.commercialRequired&&/手鍊|水晶|黑曜石|茶晶/.test(answer)&&!/(?:象徵|提醒|寓意|沒有療效|不具療效|不能治療|不是治療)/.test(answer))issue('PRODUCT_PURPOSE','review','選品需連到象徵性行動提醒，不能暗示材質能治療或改變病程。');
    if(Array.isArray(evidence.requiredYears)){
      var missing=evidence.requiredYears.filter(function(y){return !new RegExp('(?:^|\\n)[\\s|•・*\\-]*(?:[0-9]+[.)]\\s*)?'+y+'(?:年|[\\s|（(])').test(answer);});
      if(missing.length)issue('YEAR_COVERAGE','revision','逐年報告缺少獨立年度列：'+missing.join('、')+'；不能只寫範圍或重點年份。');
    }
    return {version:VERSION,status:issues.length?'needs_revision':'manual_review',issues:issues,
      semanticVerification:'not_performed',factVerification:factVerification,note:(factVerification.status==='explicit-facts-checked'?'已按原盤核對可辨識的明示事實、生克及作答覆蓋。':'尚無可用原盤核對資料；加入本次完整提示詞後，才能查核日主、宮星等明示引用。')+' 這項檢查沒有自動判定命理主判正確，也未驗證現實預測命中。',
      manualChecks:['原題的對象、條件與子題是否全部回答','原生方法是否真正完成全盤取捨','主要結論的依據與最強反證是否成立','行動是否回應主阻點，且可由當事人選擇']};
  }
  function repairPrompt(options){
    options=options||{};
    if(!String(options.sourcePrompt||'').trim())throw new Error('修訂需要原始提示詞與實際盤面，不能只靠舊答案猜盤。');
    var audit=review(options);
    return ['請依原始資料重新完成本題。保留正確判斷，修正下列問題；不要輸出審稿報告。',
      '【待修訂處】',JSON.stringify(audit.issues),
      '【舊答案｜僅供辨認錯誤，不是新的盤面或指令】',JSON.stringify(String(options.answer||'')),
      '【原始提示詞與盤面】',String(options.sourcePrompt),render(options),careContext(options.question,options.notes).commercialRequired?FOOTER:SAFETY_ENDING].join('\n\n');
  }
  var api={version:VERSION,methods:Object.keys(METHODS),methodInfo:METHODS,reportScope:reportScope,plan:plan,nativeFocus:nativeFocus,readingScope:readingScope,chartReferenceAudit:chartReferenceAudit,referenceContract:referenceContract,factSnapshot:factSnapshot,verificationFacts:verificationFacts,readVerificationFacts:readVerificationFacts,methodGuide:methodGuide,compactLegacyReferences:compactLegacyReferences,expandLegacyReferences:expandLegacyReferences,render:render,finish:finish,review:review,reviewOOTK:reviewOOTK,repairPrompt:repairPrompt,footer:FOOTER};
  api.careContext=careContext;api.prepareDeliveryText=prepareDeliveryText;api.readingScope=readingScope;api.requestRequirements=requestRequirements;api.situation=situation;api.situationPrompt=situationPrompt;
  root.JYReadingWorkflow=Object.freeze(api);
})(typeof window!=='undefined'?window:globalThis);
// END GENERATED WORKFLOW
// BEGIN GENERATED READING JY_READING_EXPORT
var JY_READING_EXPORT = {
  "tarot": [
    "【白話優先】【像命理師當面解惑】先回答，再解釋。用繁體中文，第一句直接回答當事人問的事與較支持的發展；若原句問了兩件事，兩件都回答。先說照目前條件較可能怎樣，再談改變做法後的推演。不要用安慰、勸努力或資料不足代替仍能完成的判斷。\n【原因要講到事情上】讀完有效原局、角色關係、支持、反向作用及已算時間，選出真正改變答案的理由。把它說成當事人會遇到的選擇、收益、負擔與轉變，讓讀者知道為什麼這樣判、為什麼另一種解釋較弱。只呈現整理後的理由，不展示隱藏思考過程。\n【日常用語優先】正常問事不用牌名、星名、干支或專門術語，也不先講術語再加字典。少用「盤面支持、力量承接、條件窗口、作用網」等報告語，直接說這件事具體怎樣變好或卡住。只有原題要求學原理、核盤、逐牌或逐宮解說，才交代必要技術。\n【解惑的成稿方式】圍繞原題寫連貫段落，每段增加一個新的理解；不要按資料順序念牌義或分宮百科，也不要固定開結論、支持、反證、建議等欄。技術核對表不是成稿目錄。原題指定逐年、逐期、逐輪、逐項或全盤，仍須完整覆蓋。",
    "【資料與判斷分清】只用本次原句、補充和實際排算資料。排盤事實、傳統規則的解釋與個案推測不可混成已發生的事；沒有提供的經歷、職業、負債、他人心意與意願保持未知。生活例子須明說是待核對情境。\n【技術查證必須真實】不確定規則、版本、作用方向或換算時，先查作者、原典、官方文件或可靠原圖，確認適用條件再用。查到網站不等於讀到正文，書目不等於公式已驗證。可上網時完成必要查證並留可追溯來源；不能查閱時明列未查項，只停用依賴該項的精細判斷。不得捏造查網、引用、真人資歷或專業覆核。個人未知背景不能靠搜尋或象徵填入。\n【時間、金額與現實】日期只用已算區間，核對時區、日曆與單位；日數除以7換算週數，月份按實際日曆跨度，未給問事日期不擅算剩餘日數。資料未算到的日期不代表永不發生。金額目標與一次或持續達標分開，不從符號換算營業額、淨利、機率或保證收益。醫療、法律及財務做法須結合實際資料與專業意見。計算通過不等於事件預測準確。主觀滿意回饋只代表使用感受，不能單獨驗證預測。\n【口吻與處境】像有經驗的解盤者當面對本人說話，自然稱你、沉穩直接，不先說根據資料或以下分析。不把所有訊號內化成情緒：同時核對責任、他人支援與選擇後果。未知現場情形要核問，不裝成事實；事後補充不倒填成事前命中。已做的事先處理現在，未選方案只作條件比較。",
    "【所有原題都依同一完整解讀流程】語義分類只是找資料的線索，不是可問問題白名單。逐一核原句人物、結果、比較標準、條件、期限、數量與反覆要求；疑似錯字及兩種詞義保留原文與暫定理解，不悄悄改題。解析沒命中仍讀有效原生骨架，缺項只限制對應部分。\n【主判必須收斂】正反線索先核是否同一件事、同一人物與同一時段；同源不重複加權，不用吉凶數量投票。比較後說哪種發展較有理由、程度及代價，不能以「有機會，看你主不主動」結案。真的分不出才說具體缺哪一環、什麼實際變化會改判。\n【分清結果層次】吸引、意願、安排、事件發生及持續，各自需要相應依據。原句問性關係就回答實際性關係；親密接觸不自動等於性交，任何親近仍需明確、無壓力且可撤回的同意。排除現任不證明另一個人存在。建議位與可採取的行動也不能當成結果已成。\n【數量題仍要解惑】精確數字、姓名、日期或他人心意未被測量，只限制那一項精度。先分總數或新增、期限及單位。具名傳統取法若有足夠前提，可以提出象徵估計並說清修正；沒有就保留未知，不能固定回答一至兩個，也不能數符號當人數。精確值未測量不抹除質性方向。\n【重要發現與做法】全局中與原題有關、足以改變選擇的重要資源、成本或轉折，主動接著解釋其關聯和範圍；不湊項、不製造恐懼。做法要對準前面找出的問題，配可觀察的變化；自訂追蹤期限明說是實務檢查點。通用建議不冒稱新算出的發現。\n【成稿真實性】這是AI依可查來源與資料作的傳統方法解讀，不能自稱真人命理師親斷、全部流派都算完，或把其他案例搬成本人經歷。資料、方法與文獻足夠的部分深入回答，未完成的部分坦白保留。",
    "【方法參考：供判讀，不是正文清單】只啟用本次有資料的方法；輸出依上述規則，方法說明不另設回答格式。",
    "【塔羅：牌位與組合】按本次原生牌陣判讀；獨立牌位、三牌組、連續牌列、分支、軸線與配對保留各自功能，不互換成固定時間線。",
    "RWS 使用實際正逆位及牌圖；Book T 使用本次對應與真正有序相鄰的元素尊貴，不混套固定逆位。逆位依位置和全局判受阻、內化、過度或鬆動，並非一律相反。",
    "全盤先形成主線，再找最能回答子題的牌位關係。結果與原因、阻礙、建議合讀；建議說明如何介入，不等於事情已發生。",
    "牌的本義由位置和組合限定；花色、元素與重複圖像只作背景，同一牌在多個關係出現不增加獨立證據。",
    "一般正文以白話說清事情如何發展與原因，牌名、方向和位置留作內部核對；只有明示技術／逐牌解釋才列出。全盤檢視不等於每張都各寫一段。",
    "把阻礙牌如何限制結果、建議牌如何改變條件連起來。若問題問能否發生事件，情緒牌只能支持感受層面，還須找行動與結果位置；不能用『有好感』替代『會主動交往』。有利牌與不利牌先判在說哪個層面，不以張數相抵。",
    "問性關係、成交或錄取等具體事件，先核結果位支持的是實際成立、維持現狀還是只提供資源，再與阻礙及助力合讀。權杖王牌在建議位不證明性關係會發生；未出現惡魔、戀人等特定牌也不能當作不發生的證據。不能從金幣牌補造工作、輪班、收入或人物身分。",
    "【塔羅判讀主線】先把結果／方向位與最直接的阻礙位合成一句答案，再用原因、當事人行動與環境牌追溯成因。若結果有利而行動不足，主判是具備條件但尚待落實；若意願有而承擔位受阻，回答卡在執行或現實門檻。由實際牌位區分是哪一層受阻，讓建議牌成為改變這一層的方法。",
    "對比方案時，各沿自己的投入、代價、發展及結果位完成一條路徑，再用原問題最在意的標準比較。矛盾牌先核先後、內外與人物歸屬：同一件事可能短期吸引、長期昂貴；說清你較支持哪一段選擇，以及哪個現實條件出現時應改判。",
    "【塔羅深入合讀】逐一核對全部實際牌位職責與正逆方向，形成完整牌陣的發展結構；需求、可採行動、環境、結果和阻礙各自成義，再串成結果能否落實的路徑。單張本義不能取代相鄰關係、核心牌與不同支線的共同作用。",
    "主線與子題逐一成判，區分情緒、意願、實際行動與持續；人物牌不自行指認身分。逆位綜合牌面、位置與全局，分辨內化、受阻、過度或鬆動，不能一律翻成相反。",
    "時間與影響程度來自實際時間位及發展順序；只有序列時給相對階段，不自造月份。每個關鍵轉折連同成立條件、支持牌位、最強反證及可採行動說明。",
    "【塔羅術語界線】死神、塔、寶劍等名稱不能直接斷死亡、災難或人生失敗。保留本次牌位、方向、組合和反證，結果牌仍是條件性象徵，不能保證事件。",
    "【議題線索與精度分開】子女題合讀本次原問句綁定的結果、限制及可介入牌位，孕育、照顧、家庭圖像要由全陣限定。可作有根據的事件傾向解釋，不把情緒等同懷孕、不由皇后或牌面人像數孩子。缺數量測量只限制數字，並非整陣不能回答。",
    "【本法重要發現與解惑方式】合讀全陣重要支線與反覆模式；未問但會影響決策、互動、界線或下一步的關鍵牌組也要解釋，牌圖不當成未提供的現實事故。"
  ],
  "ootk": [
    "【白話優先】【像命理師當面解惑】先回答，再解釋。用繁體中文，第一句直接回答當事人問的事與較支持的發展；若原句問了兩件事，兩件都回答。先說照目前條件較可能怎樣，再談改變做法後的推演。不要用安慰、勸努力或資料不足代替仍能完成的判斷。\n【原因要講到事情上】讀完有效原局、角色關係、支持、反向作用及已算時間，選出真正改變答案的理由。把它說成當事人會遇到的選擇、收益、負擔與轉變，讓讀者知道為什麼這樣判、為什麼另一種解釋較弱。只呈現整理後的理由，不展示隱藏思考過程。\n【日常用語優先】正常問事不用牌名、星名、干支或專門術語，也不先講術語再加字典。少用「盤面支持、力量承接、條件窗口、作用網」等報告語，直接說這件事具體怎樣變好或卡住。只有原題要求學原理、核盤、逐牌或逐宮解說，才交代必要技術。\n【解惑的成稿方式】圍繞原題寫連貫段落，每段增加一個新的理解；不要按資料順序念牌義或分宮百科，也不要固定開結論、支持、反證、建議等欄。技術核對表不是成稿目錄。原題指定逐年、逐期、逐輪、逐項或全盤，仍須完整覆蓋。",
    "【資料與判斷分清】只用本次原句、補充和實際排算資料。排盤事實、傳統規則的解釋與個案推測不可混成已發生的事；沒有提供的經歷、職業、負債、他人心意與意願保持未知。生活例子須明說是待核對情境。\n【技術查證必須真實】不確定規則、版本、作用方向或換算時，先查作者、原典、官方文件或可靠原圖，確認適用條件再用。查到網站不等於讀到正文，書目不等於公式已驗證。可上網時完成必要查證並留可追溯來源；不能查閱時明列未查項，只停用依賴該項的精細判斷。不得捏造查網、引用、真人資歷或專業覆核。個人未知背景不能靠搜尋或象徵填入。\n【時間、金額與現實】日期只用已算區間，核對時區、日曆與單位；日數除以7換算週數，月份按實際日曆跨度，未給問事日期不擅算剩餘日數。資料未算到的日期不代表永不發生。金額目標與一次或持續達標分開，不從符號換算營業額、淨利、機率或保證收益。醫療、法律及財務做法須結合實際資料與專業意見。計算通過不等於事件預測準確。主觀滿意回饋只代表使用感受，不能單獨驗證預測。\n【口吻與處境】像有經驗的解盤者當面對本人說話，自然稱你、沉穩直接，不先說根據資料或以下分析。不把所有訊號內化成情緒：同時核對責任、他人支援與選擇後果。未知現場情形要核問，不裝成事實；事後補充不倒填成事前命中。已做的事先處理現在，未選方案只作條件比較。",
    "【所有原題都依同一完整解讀流程】語義分類只是找資料的線索，不是可問問題白名單。逐一核原句人物、結果、比較標準、條件、期限、數量與反覆要求；疑似錯字及兩種詞義保留原文與暫定理解，不悄悄改題。解析沒命中仍讀有效原生骨架，缺項只限制對應部分。\n【主判必須收斂】正反線索先核是否同一件事、同一人物與同一時段；同源不重複加權，不用吉凶數量投票。比較後說哪種發展較有理由、程度及代價，不能以「有機會，看你主不主動」結案。真的分不出才說具體缺哪一環、什麼實際變化會改判。\n【分清結果層次】吸引、意願、安排、事件發生及持續，各自需要相應依據。原句問性關係就回答實際性關係；親密接觸不自動等於性交，任何親近仍需明確、無壓力且可撤回的同意。排除現任不證明另一個人存在。建議位與可採取的行動也不能當成結果已成。\n【數量題仍要解惑】精確數字、姓名、日期或他人心意未被測量，只限制那一項精度。先分總數或新增、期限及單位。具名傳統取法若有足夠前提，可以提出象徵估計並說清修正；沒有就保留未知，不能固定回答一至兩個，也不能數符號當人數。精確值未測量不抹除質性方向。\n【重要發現與做法】全局中與原題有關、足以改變選擇的重要資源、成本或轉折，主動接著解釋其關聯和範圍；不湊項、不製造恐懼。做法要對準前面找出的問題，配可觀察的變化；自訂追蹤期限明說是實務檢查點。通用建議不冒稱新算出的發現。\n【成稿真實性】這是AI依可查來源與資料作的傳統方法解讀，不能自稱真人命理師親斷、全部流派都算完，或把其他案例搬成本人經歷。資料、方法與文獻足夠的部分深入回答，未完成的部分坦白保留。",
    "【方法參考：供判讀，不是正文清單】只啟用本次有資料的方法；輸出依上述規則，方法說明不另設回答格式。",
    "【開鑰之法：依實際版本與完成紀錄】Mathers 原稿五次操作與 Liber LXXVIII 驗題版分開；Ace 計數、配對、第四輪起點及停止條件依本次版本，不互套。",
    "五次操作不是五個月份，而是五層閱讀。每一個完成且有效的操作都必須對原問題新增一個可辨識的判斷：先讀該輪代表牌落域，再讀合法計數故事、配對與元素尊貴，說明本輪最支持什麼、最強反證限制哪一層，以及它如何承接、修正或推翻上一輪。不得只列牌義或把五輪壓成一句總結。",
    "計數跳轉不當成元素相鄰；元素尊貴只用提供的有序相鄰線。配對、計數與落域若方向不同，先分辨它們是否在回答不同層次，例如注意／吸引、意願、行動、承諾、持續或結果，再判哪一層真正受阻。",
    "第一輪 mainLineValidation 未確認時，第一輪只能降為次級背景，不得拿來當高權重核心；第二至第五輪若已完成且有效仍須正常解讀，不能因此把整盤降成『無法回答』。",
    "問第三方怎麼看、是否喜歡、是否願意等主觀題時，沒有明確第三方代表牌綁定就不能寫成已證實內心；但『不能證實』不等於『不能判方向』。必須把五輪收斂成最可能的方向性模型：可歸屬的訊號寫成較支持的推論，無法歸屬者標成關係場／互動場訊號，並說清哪個現實條件可驗證或推翻。",
    "五輪完成後必須明確輸出：最可能方向、次可能方向、最強反證、會推翻主判的條件與信心來源。不能只說『存在情感／衝突／吸引議題』而不交代方向、程度與作用層次，也不能把未知角色歸屬擴大成整盤未知。",
    "只在紀錄明示中止、無效或資料損壞時停止；未完成操作不補成五輪結論。正文要把五層真正用來回答原題，不逐步重抄每次計數與配對。",
    "【開鑰判讀主線】五輪不是把同一句答案重講五次。第一輪建立當下基底，第二輪讀事情怎麼展開與互動，第三輪讀更深的結構門檻與承接條件，第四輪用三十六牌環抓累積張力與真正轉折，第五輪收束最終傾向與保留條件；仍以各輪實際落域為準，不把這些名稱硬套成固定事件。每輪都要回答「這一層讓原題多知道了什麼」。",
    "每輪先形成一個明確主判，再各找最強支持與最強反證，並寫出它對上一輪是延續、加強、削弱、轉向還是只補充另一層。重現牌只代表持續主題，不重複加票；真正轉折須由落域、計數、配對或元素尊貴的作用改變支持。",
    "五輪收斂時，不以「象徵不能證明事實」作為答案終點。先說盤面最支持哪個方向、程度到哪一層，再給次可能解釋與最強反證；第三方角色歸屬不足時降低歸屬信心，但保留關係場／互動場的方向性資訊。最後指出什麼現實行為或條件出現時應改判。",
    "【開鑰之法深入合參】按本次完成輪次逐輪讀代表牌落域、合法計數故事、配對及元素尊貴；每一輪都必須對原題新增一個不同層次的主判，再追各輪如何承接或改變條件。不能把尚未完成的操作補成結果，也不能把所有計數牌當成相鄰。",
    "逐輪至少交代：本輪最支持的方向、本輪最強反證／限制、它限制的是注意／感受／意願／行動／承諾／持續／結果中的哪一層，以及本輪對上一輪造成何種修正。若某輪只能讀關係場而不能歸屬到特定第三方，照樣保留該層資訊，不用『未知』把整輪刪掉。",
    "跨輪相反時先辨領域、角色、條件是否相同；同一命題仍衝突才保留未決部分。第一輪主線未確認時降權但不封鎖後四輪。全程核對停止紀錄、實際操作與牌組來源，重複牌只保留作用，不重複加權。",
    "完整五輪最後要形成一個資訊密度足夠的收斂：最可能方向、次可能方向、最強反證、成立條件、改判條件、信心來源與現實驗證點。『無法證實他人心意』只能作事實宣稱邊界，不能取代上述方向性判讀。五輪不硬配五個月；人物身分、事件次數及日期仍須有本法真實支持。",
    "【開鑰術語界線】五輪完成只證明程序與資料範圍，不證明客觀事件必然。五輪同源訊號仍是同一盤的多層解讀；保留有效主線與反證，不把跨輪一致寫成命運確證。",
    "【議題線索與精度分開】子女題合讀每一個完成且有效輪次對同一問題的新增判斷，追孕育、照顧、責任及事情是否落實的主線。未完成只限該輪；計數跳步是程序位置，不能當孩子數。仍須整合有效輪次給方向，不能只說無法確定。",
    "【本法重要發現與解惑方式】逐輪深入交代第一至第五輪有效資料新增的理解，重要的跨輪轉折和代價即使未問也提醒；採自然敘述，輪次標示供辨識，不套支持／反證欄位。"
  ],
  "meihua": [
    "【白話優先】【像命理師當面解惑】先回答，再解釋。用繁體中文，第一句直接回答當事人問的事與較支持的發展；若原句問了兩件事，兩件都回答。先說照目前條件較可能怎樣，再談改變做法後的推演。不要用安慰、勸努力或資料不足代替仍能完成的判斷。\n【原因要講到事情上】讀完有效原局、角色關係、支持、反向作用及已算時間，選出真正改變答案的理由。把它說成當事人會遇到的選擇、收益、負擔與轉變，讓讀者知道為什麼這樣判、為什麼另一種解釋較弱。只呈現整理後的理由，不展示隱藏思考過程。\n【日常用語優先】正常問事不用牌名、星名、干支或專門術語，也不先講術語再加字典。少用「盤面支持、力量承接、條件窗口、作用網」等報告語，直接說這件事具體怎樣變好或卡住。只有原題要求學原理、核盤、逐牌或逐宮解說，才交代必要技術。\n【解惑的成稿方式】圍繞原題寫連貫段落，每段增加一個新的理解；不要按資料順序念牌義或分宮百科，也不要固定開結論、支持、反證、建議等欄。技術核對表不是成稿目錄。原題指定逐年、逐期、逐輪、逐項或全盤，仍須完整覆蓋。",
    "【資料與判斷分清】只用本次原句、補充和實際排算資料。排盤事實、傳統規則的解釋與個案推測不可混成已發生的事；沒有提供的經歷、職業、負債、他人心意與意願保持未知。生活例子須明說是待核對情境。\n【技術查證必須真實】不確定規則、版本、作用方向或換算時，先查作者、原典、官方文件或可靠原圖，確認適用條件再用。查到網站不等於讀到正文，書目不等於公式已驗證。可上網時完成必要查證並留可追溯來源；不能查閱時明列未查項，只停用依賴該項的精細判斷。不得捏造查網、引用、真人資歷或專業覆核。個人未知背景不能靠搜尋或象徵填入。\n【時間、金額與現實】日期只用已算區間，核對時區、日曆與單位；日數除以7換算週數，月份按實際日曆跨度，未給問事日期不擅算剩餘日數。資料未算到的日期不代表永不發生。金額目標與一次或持續達標分開，不從符號換算營業額、淨利、機率或保證收益。醫療、法律及財務做法須結合實際資料與專業意見。計算通過不等於事件預測準確。主觀滿意回饋只代表使用感受，不能單獨驗證預測。\n【口吻與處境】像有經驗的解盤者當面對本人說話，自然稱你、沉穩直接，不先說根據資料或以下分析。不把所有訊號內化成情緒：同時核對責任、他人支援與選擇後果。未知現場情形要核問，不裝成事實；事後補充不倒填成事前命中。已做的事先處理現在，未選方案只作條件比較。",
    "【所有原題都依同一完整解讀流程】語義分類只是找資料的線索，不是可問問題白名單。逐一核原句人物、結果、比較標準、條件、期限、數量與反覆要求；疑似錯字及兩種詞義保留原文與暫定理解，不悄悄改題。解析沒命中仍讀有效原生骨架，缺項只限制對應部分。\n【主判必須收斂】正反線索先核是否同一件事、同一人物與同一時段；同源不重複加權，不用吉凶數量投票。比較後說哪種發展較有理由、程度及代價，不能以「有機會，看你主不主動」結案。真的分不出才說具體缺哪一環、什麼實際變化會改判。\n【分清結果層次】吸引、意願、安排、事件發生及持續，各自需要相應依據。原句問性關係就回答實際性關係；親密接觸不自動等於性交，任何親近仍需明確、無壓力且可撤回的同意。排除現任不證明另一個人存在。建議位與可採取的行動也不能當成結果已成。\n【數量題仍要解惑】精確數字、姓名、日期或他人心意未被測量，只限制那一項精度。先分總數或新增、期限及單位。具名傳統取法若有足夠前提，可以提出象徵估計並說清修正；沒有就保留未知，不能固定回答一至兩個，也不能數符號當人數。精確值未測量不抹除質性方向。\n【重要發現與做法】全局中與原題有關、足以改變選擇的重要資源、成本或轉折，主動接著解釋其關聯和範圍；不湊項、不製造恐懼。做法要對準前面找出的問題，配可觀察的變化；自訂追蹤期限明說是實務檢查點。通用建議不冒稱新算出的發現。\n【成稿真實性】這是AI依可查來源與資料作的傳統方法解讀，不能自稱真人命理師親斷、全部流派都算完，或把其他案例搬成本人經歷。資料、方法與文獻足夠的部分深入回答，未完成的部分坦白保留。",
    "【方法參考：供判讀，不是正文清單】只啟用本次有資料的方法；輸出依上述規則，方法說明不另設回答格式。",
    "【梅花：體用與本互變】核起卦法、保存時間、上下卦及動爻；動爻所屬經卦為用，另一卦為體。互卦上下與變後用卦都對原體，原體不重新設立。",
    "用生體、體生用、體克用、用克體、比和，配起卦節令旺衰看助力、付出、掌握、約束與協力是否有力，不能只數吉凶。",
    "本卦讀局勢，互卦讀中間牽動，動爻與變卦讀關鍵轉折；爻辭、類象和實際外應依本次起法與情境。正文用改變答案的轉折串成故事，不固定分五段講卦理。",
    "應期須有明示方法與時間尺度；實務檢查日與預測分開。一卦的本互變不是不同方案的各自抽卦，也不是多份獨立證據。",
    "【梅花判讀主線】以體的節令力量看當事人能否承擔，以用對體的實際生克判外在事情如何作用；體克用偏向需要自己掌握，體生用偏向投入耗力，用生體偏向有助力，用克體偏向受約束，比和偏向可協力，成色再由旺衰與全卦修正。先給目前宜推進、調整或等待的主判。",
    "互卦找過程中哪一端增加支持或負擔，變後的用對原體則看關鍵轉折後條件改善還是加重。將本、互、變連成「起初可用條件—中途關卡—調整後方向」，再以切題爻辭或已提供外應定位做法，交代要先解決哪件現實事情。",
    "【梅花深入體用與動變】先核實際起卦、原體用、節令旺衰和動爻，再讀本卦、互卦、動變如何改變原條件；原體用角色不能在每一步任意交換。生剋是象徵作用，不是任何人的情緒或意願。",
    "分清體的承受、用的要求、互卦中間條件及變卦後續成本；生體也需能承接，克體須審旺衰及救應。全部相關卦氣先核完，再選真正改變答案的路徑。",
    "完整卦例按本、互、動、變回答全部子題，給進退與實務檢查點；應期須有明確起例和尺度。本次短期卦不擴成一生年表。",
    "【梅花術語界線】體用生克只指本次起卦事情；用克體不等於命差，變卦生體不保證未來成功。固定原體並合旺衰、本互變和本題範圍，不擴成終身財運或婚姻評等。",
    "【議題線索與精度分開】子女與生育題只沿本次有效體用、時令及本互變讀事件方向與阻點；沒有時辰或外應的項目分開限縮，不整題退回未知。單次卦不決定今生孩子總數，也不把卦數直接當生育數。",
    "【本法重要發現與解惑方式】本互變及體用中重要的連帶成本、過程關卡和可介入轉折也提醒，限於本次問事範圍；說清卦象如何作用，不只列生剋吉凶。"
  ]
};
// END GENERATED READING JY_READING_EXPORT
// BEGIN GENERATED RECOMMENDATION JY_REC_EXPORT
var JY_REC_EXPORT = {
  "tarot": "【成稿檢查】用完全沒學過命理的人能懂的話，先答問題，再深入說原因、還沒確認的部分、可能的影響及做法。一般正文不出現專門術語、牌名或星名，不要讓使用者聽名詞課；技術只在原題明確要求時另解釋。重要且有據的發現也要白話提醒。明示逐年／逐輪等內容完整保留；不補背景、不照抄示範、不把建議當結果，也不重複同一結論。\n【本題延伸手鍊建議】一般有效解讀完成後須接上本段；原題明示自傷、自殺或眼前人身危險時，本段、導購及賣場收尾要求全部暫停，先提供安全支持，不用命理或商品承諾安全。手鍊建議放在分析與行動之後，用二到四句自然對話推薦本人佩戴的一款手鍊：先點出本次解讀裡最需要照顧的一件事（例如要把話說清楚、要穩住別衝動、要收心專注、要給自己安全感、要重新提起行動），再從靜月之光常備品類挑最貼那件事的材質或設計，說清是提醒自己的象徵，連回解讀裡講到的那個下一步。品類參考（傳統象徵對應，不是療效）：安穩護持—黑曜石、茶晶、黑碧璽、天鐵、龍宮舍利；開口表達—海藍寶、青金石、藍紋瑪瑙；感情柔軟、善待自己—粉晶、草莓晶、摩根石；清明決斷、靜心—白水晶、紫水晶、拉長石；行動力與財務推進—黃水晶、綠幽靈、鈦晶、虎眼石；轉換與放下—煙晶、月光石。只挑一款、只寫一個材質名（不寫「A或B」）；理由須引用本次一項有效盤面發現，用日常用語說明，不對買家講五行、課名或補石術語；選品規則不得影響前面的占卜判斷，不先選商品再反推需求，不承諾療效、改運、復合等結果。不可為導購加重凶象、製造恐懼。命理取象不代表礦物有療效，不把五行／星盤象徵說成身體實際缺少某種礦物。不捏造使用者偏好；不捏造商品庫存、價格、成分、產地或認證。若提問者提到預算吃緊或暫不想購買，先用現有物件承載同一提醒。依上述理由自然邀請到靜月之光蝦皮賣場挑選相應設計，不可只說「挑喜歡的水晶」。全文最後兩行實際輸出指定賣場連結與祝福。無有效盤面或程序停止時說明缺項，不做命理選材。\n【本法選材提醒】\n塔羅：從本次牌位與牌組的實際走向連到行動；不由單張牌、花色或元素直接指定礦物。\n[靜月之光蝦皮賣場](https://shopee.tw/a50h95648d?tab=shop)\n願你諸事順遂。",
  "ootk": "【成稿檢查】用完全沒學過命理的人能懂的話，先答問題，再深入說原因、還沒確認的部分、可能的影響及做法。一般正文不出現專門術語、牌名或星名，不要讓使用者聽名詞課；技術只在原題明確要求時另解釋。重要且有據的發現也要白話提醒。明示逐年／逐輪等內容完整保留；不補背景、不照抄示範、不把建議當結果，也不重複同一結論。\n【本題延伸手鍊建議】一般有效解讀完成後須接上本段；原題明示自傷、自殺或眼前人身危險時，本段、導購及賣場收尾要求全部暫停，先提供安全支持，不用命理或商品承諾安全。手鍊建議放在分析與行動之後，用二到四句自然對話推薦本人佩戴的一款手鍊：先點出本次解讀裡最需要照顧的一件事（例如要把話說清楚、要穩住別衝動、要收心專注、要給自己安全感、要重新提起行動），再從靜月之光常備品類挑最貼那件事的材質或設計，說清是提醒自己的象徵，連回解讀裡講到的那個下一步。品類參考（傳統象徵對應，不是療效）：安穩護持—黑曜石、茶晶、黑碧璽、天鐵、龍宮舍利；開口表達—海藍寶、青金石、藍紋瑪瑙；感情柔軟、善待自己—粉晶、草莓晶、摩根石；清明決斷、靜心—白水晶、紫水晶、拉長石；行動力與財務推進—黃水晶、綠幽靈、鈦晶、虎眼石；轉換與放下—煙晶、月光石。只挑一款、只寫一個材質名（不寫「A或B」）；理由須引用本次一項有效盤面發現，用日常用語說明，不對買家講五行、課名或補石術語；選品規則不得影響前面的占卜判斷，不先選商品再反推需求，不承諾療效、改運、復合等結果。不可為導購加重凶象、製造恐懼。命理取象不代表礦物有療效，不把五行／星盤象徵說成身體實際缺少某種礦物。不捏造使用者偏好；不捏造商品庫存、價格、成分、產地或認證。若提問者提到預算吃緊或暫不想購買，先用現有物件承載同一提醒。依上述理由自然邀請到靜月之光蝦皮賣場挑選相應設計，不可只說「挑喜歡的水晶」。全文最後兩行實際輸出指定賣場連結與祝福。無有效盤面或程序停止時說明缺項，不做命理選材。\n【本法選材提醒】\n開鑰之法：只採完成且有效操作中的主線；停止或驗題未成立時，不把程序失敗當成選材訊號。\n[靜月之光蝦皮賣場](https://shopee.tw/a50h95648d?tab=shop)\n願你諸事順遂。",
  "meihua": "【成稿檢查】用完全沒學過命理的人能懂的話，先答問題，再深入說原因、還沒確認的部分、可能的影響及做法。一般正文不出現專門術語、牌名或星名，不要讓使用者聽名詞課；技術只在原題明確要求時另解釋。重要且有據的發現也要白話提醒。明示逐年／逐輪等內容完整保留；不補背景、不照抄示範、不把建議當結果，也不重複同一結論。\n【本題延伸手鍊建議】一般有效解讀完成後須接上本段；原題明示自傷、自殺或眼前人身危險時，本段、導購及賣場收尾要求全部暫停，先提供安全支持，不用命理或商品承諾安全。手鍊建議放在分析與行動之後，用二到四句自然對話推薦本人佩戴的一款手鍊：先點出本次解讀裡最需要照顧的一件事（例如要把話說清楚、要穩住別衝動、要收心專注、要給自己安全感、要重新提起行動），再從靜月之光常備品類挑最貼那件事的材質或設計，說清是提醒自己的象徵，連回解讀裡講到的那個下一步。品類參考（傳統象徵對應，不是療效）：安穩護持—黑曜石、茶晶、黑碧璽、天鐵、龍宮舍利；開口表達—海藍寶、青金石、藍紋瑪瑙；感情柔軟、善待自己—粉晶、草莓晶、摩根石；清明決斷、靜心—白水晶、紫水晶、拉長石；行動力與財務推進—黃水晶、綠幽靈、鈦晶、虎眼石；轉換與放下—煙晶、月光石。只挑一款、只寫一個材質名（不寫「A或B」）；理由須引用本次一項有效盤面發現，用日常用語說明，不對買家講五行、課名或補石術語；選品規則不得影響前面的占卜判斷，不先選商品再反推需求，不承諾療效、改運、復合等結果。不可為導購加重凶象、製造恐懼。命理取象不代表礦物有療效，不把五行／星盤象徵說成身體實際缺少某種礦物。不捏造使用者偏好；不捏造商品庫存、價格、成分、產地或認證。若提問者提到預算吃緊或暫不想購買，先用現有物件承載同一提醒。依上述理由自然邀請到靜月之光蝦皮賣場挑選相應設計，不可只說「挑喜歡的水晶」。全文最後兩行實際輸出指定賣場連結與祝福。無有效盤面或程序停止時說明缺項，不做命理選材。\n【本法選材提醒】\n梅花：依本互變、體用與旺衰連到本次應對；不把卦象當成終身八字喜忌。\n[靜月之光蝦皮賣場](https://shopee.tw/a50h95648d?tab=shop)\n願你諸事順遂。"
};
// END GENERATED RECOMMENDATION JY_REC_EXPORT
// 20260912accuracy1: refresh stopped-operation and original-question guards in previously open clients.
/*! prompt-export.js — 靜月之光塔羅／開鑰提示詞匯出引擎 [v103.0]
 *  v103.0（知識開放提示詞 2026/9/4）：保留原生牌陣方法與 Book T 資料，開放 AI 自身塔羅知識，移除重複禁令、稽核與微管理。
 *  v98.0（單一 Foundation 根架構 2026/7/17）：
 *    1) 問題編譯、選陣、牌位權限、依賴拓撲與 Book T 有序尊貴線改由同一資料源生成，移除跨檔重複判斷。
 *    2) 「為何」依語法區分定性描述與原因追問；年度總覽、比較、二選一、已知關係、時序、多領域與未知人物事件各有獨立型別。
 *    3) 過去位只具先前影響權限，未來位只具後續趨勢權限；除非位置明示，不得升格為根因或最終結果。
 *    4) 曆年詞由占卜日期解析成明示範圍，並保留原始表面詞與解析錨。
 *  v96.0（Book T 根治版：來源、方法、量測與開鑰程序分層 2026/7/17）：
 *    1) 將 Book T 牌義／宮廷牌功能／元素尊貴，與後世牌陣位置及自訂依賴拓撲徹底分離；不再把凱爾特等布局冒充原典相鄰法。
 *    2) 元素尊貴只有在明示有序牌線且具左右兩側牌時才成立完整裁決；單側僅作局部背景，交叉牌只算互動力。
 *    3) 比較門檻題可由同一 QUERY_EVENT 的結果通道作定性裁決，但金額、比例、機率與日期仍須外部量測錨。
 *    4) 開鑰計數改為起始牌算第一張，線性向外配對；第一操作主線須由問卜者確認契合，未確認前只標示暫定有效。
 *  v95.0（Golden Dawn Book T 單一來源＋型別化證據驗證 2026/7/17）：
 *    1) 原句先建立型別化查詢圖並細分所有會改變答案真值的語義原子；不靠題材詞庫決定問題內容。
 *    2) 每個合法證據單位先產生候選命題，再以 eventId／entityBindings／roleBindings／joinTrace 驗證同一人物與同一事件。
 *    3) 六階段管線：QuestionCompiler→EvidenceInterpreter→GraphBinder→Adjudicator→SaturationReviewer→AnswerVerifier；正文不得新增未驗證推論。
 *    4) 所有牌陣保留各自拓撲；開鑰五次操作只以 QUERY_EVENT 階段摘要承接，禁止跨操作拼牌。
 *  v89.0（塔羅觀測能力＋證據矩陣根治 2026/7/15）：
 *    1) 在解牌前建立「原問句資訊需求 × 牌陣可觀測通道」；牌陣不足以直接量測的維度不再被硬猜，也不妨礙其餘可回答部分深讀。
 *    2) 一般牌陣資料改送Golden Dawn Book T中性結構，不再依感情／工作／財運題材預先改寫牌義；移除會先替模型下結論的故事弧、固定對立牌、組合文案與洞察摘要。
 *    3) 所有牌陣共用「需求建模→觀測映射→牌位命題→結構合成→證據矩陣→反證→答案」；張數只決定觀測幾何，內容量只看有效命題。
 *    4) 開鑰之法固定Book T五次操作、Ace計數與代表牌固有朝向，並將計數值明確限定為路徑導航而非現實數量。
 *  v88.0（塔羅全牌陣語義證明引擎 2026/7/15）：
 *    1) 以「完整問題命題→牌位節點→合法互動圖→候選命題→蘊涵強度→反證競爭→語義飽和」取代題型補丁。
 *    2) 十四種一般牌陣逐一建立正向合成順序；牌數只決定幾何，正文長短只由有效命題量決定。
 *    3) 關係牌陣把牌位當觀察鏡頭，不再由未知的「對方位」反推人物存在；自動選陣同步區分已知對象與未知人物事件。
 *    4) 開鑰之法依 Book T 五次操作原文重建：各次獨立洗牌、落點、完整計數故事、兩側配對、適配與中止、階段整合。
 *  v87.0（塔羅全系統語義引擎根治 2026/7/15）：
 *    1) 拆除題材關鍵字牌義、花色缺席公式、吉凶票數與「每張牌都必須在正文點名」等結果導向規則。
 *    2) 所有牌陣改共用：問題完整命題→牌位鏡頭→候選命題→結構合成→完整命題裁決→反證校準→語義飽和。
 *    3) 牌陣模組只定義位置與合法互動，不預設未知人物／事件存在；篇幅只由有效命題量決定。
 *    4) 開鑰之法重建為 Book T 五次操作的階段性閱讀，恢復適配／中止邏輯；現代隱藏牌觀察降為可選次證。
 *    5) 圖像、花色、元素、數字、占星與宮廷牌只作有來源的校正，不可替代牌位主命題。
 *  v86.26（死碼陷阱拆除 2026/6/12）：TPL.ziwei 整段移除——全站零呼叫者（塔羅走 _jyTarotCopyMode、
 *    開鑰走 JY_renderExportPrompt('ootk')、紫微走 ziwei-standalone），且 formatZiweiData 從未定義、
 *    規則停在舊版無近期根治；留著＝未來接錯線必當機＋輸出退化的雙重陷阱。
 *  v86.20（收束犧牲行全站統一 2026/6/12）：FRAG_CRYSTAL（塔羅/紫微兩處）蝦皮連結自「獨立成行末行」改
 *    「犧牲行」結構——網址倒數第二行、最後固定「願你諸事順遂。」墊後；多輪實測末行版仍被管線黏不可見字元。
 *  v86.12（梅花應期正統化＋體用原文定性 2026/6/12 歐那）：
 *    1) formatMeihuaData 注入正統應期——《梅花易數·占卦訣》：「事應於生體卦氣之日、敗於剋體卦氣之日」，
 *       輔以「用卦近期、互卦中期、變卦遠期」分層；資料由 meihua_output_layer.js v2 buildMeihuaYingQi 計算（mh.yingQi）。
 *       根治原本只有 mh.timing 天數窗、無原典應期依據的問題；明令禁止 AI 自創「用卦五行→季節」法（非原典斷法）。
 *    2) formatMeihuaData 加「體用原典定性」行——對齊《體用總訣》原文：體克用＝諸事吉（非「小吉」）、
 *       用克體＝諸事凶、體生用＝耗失之患、用生體＝進益之喜、比和＝百事順遂；剋/克字形相容。
 *    3) TPL.meihua 讀卦流程④與輸出要求改吃資料區吉應／敗應；FRAG_RECENCY_MEIHUA 檢查表同步加項。
 *    4) 標頭版號自陳舊的 [v80.60] 對齊 index 變更主線（至 v86_11）推進為 v86.12。
 *    配套部署：meihua_output_layer.js v2、meihua_upgrade2.js v2（旺衰表規則生成＋節氣月支＋tiYongDeep 根修）。
 *  v80.60（凱爾特十字三組對照等量 + 收尾連結＝全文末字）：
 *    1) celtic_cross 鐵律補「三組對照分量必須對等」——實測輸出「身後vs身前」常比另兩組薄，明定每組都要點名兩張牌、講出張力。
 *    2) FRAG_CRYSTAL 蝦皮連結改「URL＝整份輸出最後一個字、後不接任何字元」——根治輸出尾端黏句號/雜字導致連結變醜或點不動。
 *       同款收尾規則同步進 lenormand.js / oracle.js / meihua-standalone.js / ziwei-standalone.js / bazi-standalone.js（六檔一致）。
 *  v80.59（總覽／流年題框架・解矛盾指令）：
 *    detectFocus 新增 isOverview（整體運勢／流年／運程／運勢如何…）。塔羅路徑：當是總覽題且無特定領域時，
 *    改推「跨領域通盤、鎖定最強 2-3 領域」框架，取代原本為窄問題設計的「禁止擴寫成通盤論述」——
 *    那句對「今年整體運勢」這種題目字面自相矛盾（題目本來就要通盤）。仍保留時間範圍邊界（限今年、不擴成人生課題）。
 *    與既有 noQ 路徑「以最集中花色鎖定領域」同源；標準年運讀法本就跨 love/career/finance/health（來源：tarot.com、horoscope.com 年運讀法）。
 *  v80.58（財運機率題誠實化・搭配 tarot_upgrade money 詞庫補洞）：
 *    1) DOMAIN_HINT.wealth + DOMAIN_HINT_MATHERS.wealth 加「純機率開獎題」框架：統一發票／樂透／刮刮樂／賭
 *       塔羅只給狀態與傾向、非隨機開獎保證；講 forecast 不斷 prediction，禁「必中／必不中／訊號不成立」；
 *       金額門檻（過萬）牌面對不上就說沒給。明標為現代實務 forecast≠prediction 框架、非古典原典
 *       （來源：truetarottales forecast vs prediction、herorise/EBR「勿期待塔羅預測樂透」共識）。
 *    2) 搭配 tarot_upgrade.js v80.58：money 詞庫補「統一發票／中獎／獎金／對獎／刮刮樂／開獎」——
 *       原本這類題漏判財運、wealth 提示不注入，故 AI 把隨機開獎武斷講成「過萬訊號不成立」。
 *  v80.57（宮廷牌年齡誠實化・根治捏造精確歲數）：
 *    mathers_21 + horseshoe 宮廷牌註修正：補回膚色對照（mathers_21 原缺）；明定「牌階只給成熟度、不給歲數」
 *    （侍者＝年少、騎士＝青年、皇后/國王＝成年/成熟），被問「她幾歲」只能答成熟度層級＋膚色，
 *    禁止硬報「約30～36歲」這類數字年齡帶。依 Mathers 原文（sacred-texts mtar03）court card 只給
 *    youth/girl/man/woman＋complexion、無任何數字；現代慣例亦僅「成熟≈30+且極有彈性」，不支持精確帶。
 *  v80.56（能量石綁花色數據 + mathers_21 補回 Mathers「看鄰牌」規則）：
 *    1) FRAG_CRYSTAL：選石改綁資料區花色實際張數（最多＝過盛、最少＝匱乏）；四花色相差 ≤1（如 5/4/4/4）
 *       一律判「大致均衡」、不准硬扣失衡，改挑呼應「問題＋結論」的石；理由必須對得上數字或結論。
 *       根治「不管實際張數一律推紫水晶」的預設答案（鐵則同步改）。
 *    2) mathers_21 讀法區塊補回「部分牌看鄰牌」規則（權杖騎士＝下一張的離開、聖杯七／聖杯騎士／聖杯四
 *       須與鄰牌合讀）——Mathers/Etteilla 原典明文（sacred-texts mtar03）；horseshoe 區塊本有、第二法漏掉。
 *  v80.55（Mathers 時間誠實化・根治編造月份）：
 *    mathers_21 與 mathers_horseshoe 兩條讀法區塊的「時間」規則改成常駐版——
 *    過去「禁編月份」只寫在 buildFocusLock 的 f.timing 分支，問題不含時間字時不注入，
 *    但通則又一律要求「時間窗口」→ AI 被逼編出「1～2個月」這種無牌面錨點的時間。
 *    現在改為：無明確時序牌就老實說「給不出月份」，禁所有「近期/快了/順其自然/1～2個月」式時間語。
 *    （此區塊每次該牌陣必注入，不再依賴 f.timing；f.timing 分支保留作 recency 強化。）
 *  v80.0（全牌陣文獻邊界重校 + 嚴格讀法修正）：
 *    1) 逐一區分：原典/可查文獻牌陣、傳統系統應用、現代實務牌陣。
 *    2) 凱爾特十字位置改回 Waite 原文骨架：上方/腳下/身後/身前，不再把第5位硬稱顯性目標。
 *    3) Fifteen-Card 改稱 Thoth/GD 風格十五張；標示來源為 Thoth 牌 LWB（自述為開鑰之法簡化版/The English Spread），不冒充 Book T 原始開鑰。
 *    4) Mathers First Method 改按原文完整 A/C/E 三組 horseshoe（26+17+11=54張）解讀。
 *    5) 現代牌陣全部維持可用，但不得稱古典正統或官方原法。
 *  v79.0（原典文獻鎖定 + 反幻覺修正）：
 *    1) 全工具改以「原典/可查文獻」標示，不把現代實務包裝成古典正統。
 *    2) 開鑰 recency 檢查改白話，不再要求硬湊跨層重複牌。
 *    3) 雷諾曼禁止引用本盤外牌名做反證，年齡/人物訊號不足時直接說不足。
 *    4) 所有輸出維持命理師/占卜師對提問者口吻，技法只作內部檢查。
 *  v78.0（正統性總修正）：
 *    1) 塔羅：明確區分古典正統牌陣與現代牌陣；所有後世牌陣只保留布局拓撲，牌義固定Golden Dawn Book T。
 *    2) 開鑰：保留 Golden Dawn Book T 五次操作內部必查，但輸出改為命理師口吻，不再把技術清單當正文。
 *    3) 二選一牌陣修正為實際 5 張，避免提示詞 7 張與前端抽牌 5 張矛盾。
 *    4) 雷諾曼/靈籤：修正人設與輸出規則，區分正統讀法與品牌收尾。
 *  v75.0（塔羅 prompt v2 深度優化 + 開鑰分析深度補強）：
 *    塔羅 head 全面精簡：砍裝飾符號（══ → markdown #）、合併重複指令、移除 800 字限制。
 *    新增「三層因果鏈」（每個結論必須有牌面證據→機制→影響）。
 *    新增「數據層強制覆蓋」8 項清單（正逆比/元素主導/敘事弧/尊嚴互動/宮廷/時間/鑰匙/信號）。
 *    開鑰：精簡鐵律加 Unaspected 每層必做、元素尊嚴至少 2 層展開、禁粗體標題。
 *    跨層重複牌加硬要求至少 2 組。深層拆解必須從落點推不能只換說法。
 *    兩工具 recency 檢查清單全面更新。token 節省約 30%。
 *  v73.1（收尾能量石・賣場自然融入）：新增 FRAG_CRYSTAL，注入 buildPrompt 於 t.tail 與 recency 檢查之間。
 *    指示外部 AI 在解讀全部寫完後，用最後 2-3 句把「牌面主導/匱乏元素」對應一種隨身能量石做輕收尾，
 *    並輕附蝦皮去處（水晶/天鐵/龍宮舍利 https://shopee.tw/a50h95648d?tab=shop）。鐵則：只一種、只一次、貼結論、
 *    禁優惠/限時/下單等推銷字、牌面沉重時定位為「陪你穩住」。元素綁牌面（火水風土）不綁命盤，
 *    故塔羅+開鑰共用且不破壞開鑰「不引命盤」純粹性。塔羅 head/開鑰 head 一字未動。
 *    ⚠ 只需重新部署 prompt-export.js；index.html 把本檔 ?v= 由 v73_0 bump 成 v73_1。
 *  v73.0（提示詞精簡，深度不變——解決 ChatGPT「訊息太長」）：
 *    I. 兩個 head 大幅精簡：塔羅 10885→6911 字、開鑰 10247→5982 字（總 prompt 12000+→約 8300）。
 *       原則：深度條目一條不刪（22大牌/40小牌/16宮廷正逆義、Decan表、鑰匙五模式、五層拆解、
 *       14禁詞、五鐵律、自我檢查全留），只砍三類肥肉：
 *       ①算法教學（計數步驟/count值表/旬主星教學）——前端引擎已算好填進資料區，AI 不需重學；
 *       ②同一規則在「任務/方法/檢查」重複三次→併一次；③冗詞與過度舉例。
 *    （查證確認：塔羅 timeConclusion 未含 Decan 日期，故塔羅保留 36 旬對照表；
 *       開鑰第四次操作為三十六牌環，不產生月份。）
 *  v72.0（對權威來源查證 + 補完 v71 只做一半的開鑰結構化）：
 *  v72.0（對權威來源查證 + 補完 v71 只做一半的開鑰結構化）：
 *    G. 開鑰資料區真正結構化：每層改為 Sig落點／本層活躍牌／Counting 走過（依序+走幾步）／
 *       Pairing 配對（#1最直接）／元素尊嚴 分行，鏡像 head 要求的輸出；op-specific 欄位
 *       （宮/星座/旬/質點）用 safeText 保底不漏。（依 tarot_upgrade.js 實際欄位寫，非臆測）
 *    H. 計數值一致性：依 Golden Dawn《Book T》原文確認——
 *       引擎依本次 Book T 資料設定採 Ace＝11；前端直接提供計數路徑，AI 不另算
 *       count 5（GD）分支對照，解除原 head「5或11」與引擎的矛盾。
 *    （查證結論：head 計數值表、大牌三分類、36 旬 Decan 經核對皆正確，未改。）
 *    ⚠ 待你定奪：GD 原規「逆位宮廷牌→counting 反向 180°」，本引擎採「方向只由 Sig 面向決定、
 *       途中不反向」（modern 簡化；後世資料另有不同做法，本系統不採）——無共識，未動引擎。
 *  v71.0（外科手術接全集，head 與風格一字未動，全走 composition + 資料層）：
 *    A. 資料層治本：塔羅/開鑰資料區由「供參考、自行驗證」改「已精算、直接採用、勿重算」
 *       （尤其開鑰 counting 自算極易出錯，準確度最大槓桿）。
 *    B. 禁幻覺：兩工具資料區加「本次合法牌名清單」（替代複製模式失去的後端機械審計）。
 *    C. 注入 FRAG_SOURCELOCK（學理鎖定）/ FRAG_UNCERTAINTY（嚴格不確定判準）/
 *       FRAG_RECENCY_*（交稿前 recency 檢查，防後半段破功）。
 *    D. DOMAIN_HINT 加「✗ 不要主看」；新增 OOTK_ROUTING（Sig 應落堆/Op2 宮/Op4 旬主星）。
 *    E. buildFocusLock 加 window.JY_QUERENT 年齡/性別鉤子（無資料也不會壞）。
 *    F. 兩 tail 補「可驗證信號＋只引用盤上牌」。
 *  v70.1：新增 detectFocus()+buildFocusLock() 注入「本次問題鎖定」；修 getQuestion() DOM 後備 id。
 *  ⚠ 只需重新部署本檔；index.html 記得 bump ?v= 快取版本。
 *  注意：head（TPL.tarot/ootk）長字串維持你原本內容，未改；要改模板仍請改來源後重新產生。
 */
(function () {
  'use strict';
  // v102：提示詞改為「方法資料包」；移除查詢圖、能力閘門與命題帳本對外輸出，讓 AI 依正確方法自行分析。

  var BAR = "────────────────────────────";

  var TPL = {
    // v86.26 拆除 TPL.ziwei 死碼：全站零呼叫者、formatZiweiData 從未定義（接線即 ReferenceError），
    //   且其規則停在舊版（無⑦年級限制/借星/身宮主軸）＝未來接錯線的陷阱。紫微提示詞唯一真相來源＝ziwei-standalone.js
    meihua: {
      label: '梅花易數',
      head: [
        '【任務】',
        '你是一位資深梅花易數占者。請運用你自身完整的易學、體用、生剋、旺衰、動爻、卦氣、類象與應期知識，綜合本次起卦資料，以白話直接回答問題，讓結論有具體依據。',
        '',
        '【判讀方法】',
        '以本卦與體用定主調、旺衰定力度、動爻定觸發層，將本卦、互卦、動爻與變卦串成現況、過程、變化和結果；錯綜、卦辭與八卦類象可補充另一視角。',
        '先核對起卦法、實際起卦時間與動爻，旺衰以起卦節令為準；沒有日期時不以匯出當日冒充。三數法、字數／筆畫法與時間法各有不同餘數規則，尊重資料聲明，不另起新卦。',
        '體為主、用為事，旺衰與助制決定作用力度；用生體的助力仍可能受制，用克體也須看克方是否有力。互卦兩個經卦各與原體比較，變卦只翻原動爻，原體不變；本互變不是三份獨立吉凶票。',
        '卦辭、爻辭與類象要按位置和整體處境解釋；外應僅使用提問者實際描述的見聞，不編造方位、聲音或預兆。本站純乾／純坤仍依本卦2–4、3–5爻取互，與部分古本採變卦取互的例外分開，勿暗換算法。',
        '訊號衝突時給出主判、牽制與會使結果改變的條件。題目問時間時，用近、互中、變遠只表示相對階段，結合五行卦氣與實際應期資料；沒有日曆錨不換算固定年月日。',
        '方法參考：《梅花易數》卷一 https://www.eee-learning.com/book/4080 及卷二 https://www.eee-learning.com/book/4085 ，依本文聲明的體用與取互變體解讀。',
        '',
        '【輸出】',
        '正文依共用解讀規則；下列起法、卦理與取象是判讀參考。'
      ].join('\n'),
      dataHeader: "九、以下是前端已起好的梅花易數卦盤資料",
      tail: "請依實際卦盤及共用解讀規則回答原問題。"
    },
    tarot: {
      label: '塔羅快讀',
      head: [
        '【任務】',
        '你是一位資深塔羅讀牌者。請運用你自身完整的塔羅知識，綜合本次問題、牌位／序列、牌面、牌組互動、元素尊貴與全盤結構，以白話直接回應問題，提供有依據的解讀。',
        '',
        '【牌義與方法】',
        '本次資料以 Hermetic Order of the Golden Dawn《Book T／Liber T》為主要牌義與占星、卡巴拉對應來源；你可運用自身可靠的塔羅與牌陣知識補充；圖像描述須來自本次實際牌圖。若參照其他體系，請標明差異，不把 Rider-Waite 固定正逆位牌義覆蓋本盤的 Book T 元素尊貴。',
        '',
        '先辨認本次方法屬於獨立牌位、三牌組、連續牌列、宮位／質點、軸線、分支或配對，再依資料區明示的原生順序綜合。位置名稱有語義時按位置讀；序列索引沒有獨立牌位意義時，只在整列前後文與原法配對中成義。',
        '元素尊貴以資料明示的真正有序相鄰線為主；其他配對、因果、對照、軸線與分支依各自語義整合。一般牌陣正向展示，牌的順暢、受阻或扭曲由牌本性、位置、相鄰牌與全盤共同判斷。',
        '',
        '【輸出】',
        '正文依共用解讀規則；以下牌義與方法供判讀，不另設逐張講解格式。'
      ].join('\n'),
      dataHeader: '十、以下是排好的牌陣資料',
      tail: '請直接依上方「本次方法資料」與本盤牌面完成解讀。方法資料是閱讀上下文，不是預先寫好的答案；請自行綜合 Book T 牌義、牌位／序列、真正相鄰元素尊貴與全盤結構，回答原問句。'
    },
    ootk: {
      label: '開鑰之法',
      head: [
        '【任務】',
        '你是一位熟悉 Golden Dawn Opening of the Key 的資深塔羅讀牌者。請運用你自身完整的 Book T、計數、配對與元素尊貴知識，綜合本次已完成的操作資料，以白話直接回答問題，讓結論有具體依據。',
        '',
        '【解讀方法】',
        '先按資料中的操作版本解讀：Mathers 原稿為連續五次操作、Ace=5、首尾配對、第四輪由第一張環牌起算；Liber LXXVIII 驗題版為 Ace=11，另有驗題及本站數位政策。不可將另一版本的停止條件或計數規則套到本次。',
        '開鑰之法是五次相互承接的獨立操作。先讀每次操作的代表牌落點、計數故事、配對故事與元素尊貴，再依第一次至第五次的階段功能整合；若程序中止，依停止紀錄說明程序原因與下一步，保留未完成五輪的狀態。',
        '',
        '【輸出】',
        '正文依共用解讀規則；用有效操作的關鍵轉折回答，不逐輪羅列全部計數與配對。'
      ].join('\n'),
      dataHeader: '六、以下是本次實際操作資料',
      tail: '請依資料區實際完成的 Opening of the Key 操作與你自身的 Golden Dawn 知識完成綜合解讀。'
    }
  };

  // ═══ v74 牌陣讀法動態注入 ═══
  // 原本 12 種全塞 head (~800 tok)，改為依當次牌陣只注入對應的 1 種 (~100 tok)。
  // 省 ~700 tok/call，Opus 4.7 $5/M input 下有意義。
  var SPREAD_METHODS = {
      "_default": "依前端提供的牌位、順序、相鄰、對照、軸線或分支，將每張牌放回整體結構解讀。",
      "three_card": "三牌陣：先依各牌位功能成句，再讀1↔2、2↔3與1→2→3的整體流向；牌位名稱決定它是時間、原因、現況、結果或其他作用。",
      "five_card": "五牌陣：以現況為中心，串聯原因、阻礙、建議與結果，說明前四張如何共同導向收束。",
      "cross": "十字牌陣：先讀核心與阻礙的拉扯，再串聯過去影響、後續發展與可介入建議。",
      "either_or": "二選一牌陣：第1張是需求與共同基準；A路1→2→4、B路1→3→5，使用一致標準比較發展、代價、風險與落點。",
      "timeline": "時間線牌陣：依根源→近期狀態→轉折→轉折後發展→收束串成連續事件鏈；牌位表示相對先後，日期精度另看本盤時間資料。",
      "relationship": "關係牌陣：綜合你、對方／對方作用、關係現況、挑戰、介入點與短期走向，分析雙方如何共同形成目前結構。",
      "celtic_cross": "凱爾特十字：以1現況與2交叉力量為核心，對照3可成形／4根基、5身後／6身前、7本人／8環境、9希望恐懼，最後綜合至10結果。",
      "tree_of_life": "生命之樹：讀每個質點功能、右柱擴張、左柱界定、中柱整合，以及Kether→Tiphareth→Yesod→Malkuth由源頭到落地的主軸與三組橫向配對。",
      "zodiac": "黃道十二宮：每張牌先在所屬宮位成義，再看題目相關宮位、對宮、角續果節奏及第13張全盤主旋律。",
      "minor_arcana": "小阿卡那專題：依現狀→原因→挑戰建立機制，再把周圍人物、本人資源、建議與結果串聯；聚焦日常互動、資源與流程。",
      "fifteen_card": "十五張英式布局：讀五個三牌組——2–1–3核心、4–8–12自然發展、13–9–5替代路徑、6–10–14決策依據、7–11–15外在條件，再比較五組如何互相改寫。",
      "mathers_21": "二十一張Mathers衍生布局：三排從代表牌一側由右往左讀成連續故事，再讀1↔21至10↔12的首尾配對，以第11張作中心校正。",
      "mathers_horseshoe": "Mathers完整馬蹄布局：A組26張、C組17張與E組11張各自依原順序成句、首尾配對並處理中心，再比較後組如何補充或修正前組；F組為未解讀餘牌。",
      "mathers_66": "Mathers 1888 第三法：主盤66張依原書牌號看過去、現在、將來各22張；從未用的11張另抽左右兩張意外牌。結語按右意外→代表牌→左意外；末輪大圓依本次紀錄的具名覆堆重建政策，沿用同66張及正逆位。原文句序歧義明列，不宣稱唯一歷史復刻。",
      "horseshoe": "七張馬蹄形：串聯過去、現在、隱藏影響、建議、他人／環境、阻礙與結果，說明各位置如何共同形成走向。"
  };


  // ═══ v89 問題需求 × 牌陣觀測能力編譯器 ═══
  // 它不指定牌義，只把使用者要求的資訊形式與牌陣能量測的通道交給 AI。
  function _getSpreadId() {
    try {
      var S = (typeof window !== 'undefined' && window.S) ? window.S : null;
      if (!S) try { S = (0, eval)('typeof S !== "undefined" ? S : null'); } catch(e){}
      var t = (S && S.tarot) || {};
      return t.spreadType || (typeof getCurrentSpread === 'function' ? getCurrentSpread() : '') || '_default';
    } catch(e) { return '_default'; }
  }

  function analyzeInformationDemands(q) {
    var x = String(q || '');
    var out = [];
    function add(id, label) { if (!out.some(function(v){ return v.id === id; })) out.push({ id:id, label:label }); }
    if (/幾個|幾位|多少(?:人|個|位|次|張)|人數|數量/.test(x)) add('cardinality','數量／基數');
    if (/多少錢|多少(?:薪水|收入|成本|獲利|營收)|(?:薪水|收入|成本|獲利|營收)(?:是多少|有多少|多少|金額)|具體(?:金額|數字|數值)|金額|價位|百分比|幾成|機率/.test(x)) add('quantity','數值／程度');
    if (/誰|哪(?:一)?個人|哪(?:一)?位|姓名|名字|身分|是什麼人/.test(x)) add('identity','人物身分');
    if (/幾歲|年齡|外貌|長相|身高|體重|職業|星座|生肖/.test(x)) add('attribute','人物屬性');
    if (/什麼時候|何時|幾時|多久|幾天|幾週|幾月|哪一年|時間/.test(x)) add('timing','時間');
    if (/為什麼|為何|原因|根源|怎麼會/.test(x)) add('cause','原因／機制');
    if (/怎麼做|怎麼辦|如何|建議|方法|策略|該怎麼/.test(x)) add('guidance','方法／建議');
    if (/還是|或者|二選一|哪個(?:較|更|好|適合)|比較/.test(x)) add('comparison','比較／選擇');
    if (/未來|走向|結果|會變成|發展|最後|結局|之後/.test(x)) add('trajectory','發展／結果');
    if (/有沒有|是否|會不會|是不是|能不能|可不可以|嗎[？?]?\s*$/.test(x)) add('existence','存在／成立與否');
    if (!out.length) add('state','狀態／趨勢');
    return out;
  }

  var SPREAD_CAPABILITIES = {
    _default: '直接觀測：前端明示的各牌位與其合法互動。可推論：由多個一致位置形成的狀態、機制與結果。未直接量測：沒有專屬通道的精確數量、身分與日期。',
    three_card: '直接觀測：三個明示位置及兩個相鄰關係、完整三張結構。擅長單一命題的狀態、作用與收束。三個位置不是三個人物或三個時間單位；除非位置本身明示，不能拿來計數或換算日期。',
    five_card: '直接觀測：現況、形成原因、阻礙、可介入作用與結果之間的事件機制。可深讀是否成立、如何發生與主要條件；不以五張牌當作五個人物、五次或五個時間單位。',
    cross: '直接觀測：核心狀態與阻礙的拉扯、形成背景、發展與可介入點。適合診斷衝突機制；不直接枚舉未知人群或量測精確數量。',
    either_or: '直接觀測：兩條彼此分離的選項路徑與共同比較基準。可比較相對適配、代價與落點；不能把路徑牌號換算成機率或金額。',
    timeline: '直接觀測：事件的相對先後、轉折、快慢與收束。牌面的占星／十分度對應不等於本次事件的公曆日期；只有前端另行提供明確牌陣時間跨度或外部日曆錨時才可細化。五個階段不是固定五天或五月。',
    relationship: '直接觀測：一組你—對方／對方作用—關係的互動結構、阻礙、介入點與走向。已知對象可做雙方對照；未知對象時「對方」是聚合角色通道，不證明人物存在、不等於一人、也不構成人數上限。此牌陣不直接枚舉未知人群。',
    celtic_cross: '直接觀測：單一情勢的核心、交叉力量、根基、時間轉換、本人、環境、期待與結果。能建立多層因果網；十張不是十個人物或十個月，精確數量仍需獨立實體證據。',
    tree_of_life: '直接觀測：同一問題在十個質點與三柱／中軸中的作用層次。適合結構與內外機制；質點不等於現實人數或固定時間單位。',
    zodiac: '直接觀測：十二個生活領域及全盤主旋律。可區分領域，不自動區分同一領域中的多個未知人物；宮位數也不是事件數量。',
    minor_arcana: '直接觀測：日常互動、流程、資源、阻礙、可介入點與結果。七個位置不等於七個實體；數量與身分須由彼此獨立證據承載。',
    fifteen_card: '直接觀測：五個三牌組的核心、自然發展、替代路徑、決策依據與不可控條件。能比較多層作用；三牌組與牌數不作現實計數。',
    mathers_21: '直接觀測：三排連續故事、首尾配對與中心校正。能深描歷程與相互呼應；二十一張與配對數不是人數、日期或機率。',
    mathers_horseshoe: '直接觀測：A、C、E三個大型證據群的連續故事與配對。能提供廣泛情勢與反證；牌組大小不是現實數量，F組不進入解讀。',
    mathers_66: '直接觀測：66張主盤的原書三時區、左右意外牌、獨立代表牌，以及本次紀錄實際完成的末輪大圓牌序及配對。時間分段不等於精確日期；剩餘未用9張不進入判讀；沒有記錄的圈序不能自行補造。',
    horseshoe: '直接觀測：過去、現在、隱藏作用、建議、他人／環境、阻礙與結果。未知的他人位是作用通道，不直接證明特定人物或數量。',
    ootk: '直接觀測：Book T 五次操作中實際完成的落點、完整計數故事、配對、元素尊貴與階段發展。計數值與步數只用於導航牌序，不量測現實人數、金額、年齡或日期；第四次操作是代表牌後方三十六張的環，不是旬位或公曆應期。程序若依 Book T 中止，未完成操作沒有觀測權限。'
  };

  // v102：查詢編譯只留在程式端做輸入整理，不再輸出給 AI，也不指揮解牌。
  function buildEvidenceCapabilityBlock() { return ''; }


  function getSpreadMethod(q) {
    try {
      var S = (typeof window!=='undefined' && window.S) ? window.S : null;
      if (!S) try { S = (0, eval)('typeof S !== "undefined" ? S : null'); } catch(e){}
      var t = (S && S.tarot) || {};
      var id = t.spreadType || (typeof getCurrentSpread === 'function' ? getCurrentSpread() : '');
      if (id && SPREAD_METHODS[id]) {
        var _m = SPREAD_METHODS[id];
        return _m;
      }
    } catch(e){}
    return SPREAD_METHODS['_default'];
  }


  function buildSpreadReadingGuide(tool, rawPayload) {
    var obj=rawPayload||{};
    var td=obj.tarotData||{};
    var spreadId=tool==='ootk'?'ootk':(td.spreadType||obj.spreadId||_getSpreadId());
    var foundation=(typeof window!=='undefined'&&window.JYTarotFoundation)?window.JYTarotFoundation:null;
    var plan=obj.methodPlan||td.methodPlan||null;
    var protocol=(plan&&plan.protocol)||((foundation&&typeof foundation.getMethodProtocol==='function')?foundation.getMethodProtocol(spreadId):null);
    var cards=td.cards||obj.cards||[];
    var isRWS=td.sourceProfile==='rws_reversals';
    var slots=(plan&&plan.slots)||[];
    var lines=[BAR,'◆ 本次方法資料（提供閱讀上下文，不替 AI 預判答案）',BAR];

    function cardName(index){var c=cards[index]||{};return c.name||c.cardName||('第'+(index+1)+'張');}
    function slotLabel(index){var c=cards[index]||{},slot=slots[index]||{};return slot.label||c.positionMeaning||c.position||('位置'+(index+1));}
    function cardRef(i){return '第'+(i+1)+'張「'+cardName(i)+'」';}
    function seq(indices){return (indices||[]).map(cardRef).join(' → ');}
    function members(indices){return (indices||[]).map(cardRef).join('、');}
    function pairSummary(pairs){
      if(!pairs||!pairs.length)return '';
      if(pairs.length<=5)return pairs.map(function(pair){return cardRef(pair[0])+' ↔ '+cardRef(pair[1]);}).join('；');
      var first=pairs[0],last=pairs[pairs.length-1];
      return cardRef(first[0])+' ↔ '+cardRef(first[1])+'，依序至 '+cardRef(last[0])+' ↔ '+cardRef(last[1]);
    }
    function endpoint(v){
      if(Array.isArray(v))return v.map(cardRef).join('＋');
      return cardRef(v);
    }

    if(!protocol){
      lines.push('前端未提供此方法手冊，請依已明示的牌位、序列與你自身對該牌陣的可靠知識解讀；不確定處請標明。');
      return lines.join('\n');
    }

    lines.push('方法：'+spreadId+'｜類型：'+protocol.kind+'｜單張性質：'+protocol.slotMode+'。');
    if(protocol.sourceNote)lines.push('來源定位：'+protocol.sourceNote+'。');
    lines.push('方法摘要：'+protocol.summary);
    lines.push('閱讀順序：'+(protocol.phases||[]).join(' → ')+'。');
    if(spreadId==='mathers_66'){
      var draw=td.drawProcedure||{};
      lines.push('Mathers 1888《The Tarot》第三法：66張雙拱主盤與保留牌另抽兩張意外牌。後段大圓的原文句序存在歧義；採用本次紀錄具名政策，不宣稱唯一歷史復刻。');
      lines.push('按原書牌號而非陣列索引：過去＝第1–11與34–44張；現在＝第23–33與56–66張；將來＝第12–22與45–55張。每一時段是盤面位置作用，不自行換算公曆日期。');
      lines.push('主盤66張之外，左意外牌為第67張、右意外牌為第68張，兩牌應來自原本未用的11張；' +
        '結語依「右意外牌 → 另置代表牌 → 左意外牌」成句。'+
        (draw.significator?'本次代表牌：'+(draw.significator.name||'未記錄名稱')+'（'+(draw.significator.policy||'實際抽牌紀錄')+'）。':'代表牌未見獨立紀錄時不可自行補造。'));
      if(draw.largeCircleImplemented===false)lines.push('本次紀錄明示未實作後段大圓；只能讀實際完成的主盤與意外牌。');
      if(draw.largeCircleImplemented===true&&draw.largeCircle){const circle=draw.largeCircle;lines.push('本次大圓已實排；'+circle.policy);lines.push('以下均為原抽牌序號，牌名與正逆位查本次主牌，沒有重抽：圈首至末='+circle.circle.map(p=>p.ordinal).join(',')+'；起讀S與'+circle.significatorPair.card.ordinal+'；最末配對='+circle.pairs.map(p=>p.map(z=>z.ordinal).join('↔')).join('；')+'；未配對='+circle.unpaired.ordinal+'。');}
    }
    if(protocol.conclusionRule)lines.push('結果整合：'+protocol.conclusionRule);
    if(protocol.conflictRule)lines.push('矛盾處理：'+protocol.conflictRule);
    if(protocol.timeRule)lines.push('時間邊界：'+protocol.timeRule);
    if(protocol.readingPlan&&protocol.readingPlan.length){
      lines.push('本牌陣逐步解讀：');
      protocol.readingPlan.forEach(function(step,i){lines.push((i+1)+'. '+step);});
    }
    if(plan&&plan.selectionReason)lines.push('選陣理由：'+plan.selectionReason);
    (plan&&plan.routingNotes||[]).forEach(function(note){lines.push('適配說明：'+note);});
    if(protocol.references&&protocol.references.length)lines.push('方法查核書目：'+protocol.references.join('；')+'。引用的是方法脈絡；本站現代變體不冒稱來源的相同布局，亦不表示本次解讀AI曾即時上網。');
    if(isRWS)lines.push('本次採 RWS 正逆位，以下沿用牌陣結構；Book T 元素尊貴不參與本次強弱裁決。');

    if(tool==='tarot'){
      lines.push('');
      if(protocol.slotMode==='semantic_position'||protocol.slotMode==='qabalistic_position'||protocol.slotMode==='domain_position'){
        lines.push('牌位與實際牌：');
        cards.forEach(function(card,i){lines.push('・'+cardRef(i)+'｜'+slotLabel(i));});
      }else if(protocol.slotMode==='triad_member'){
        lines.push('單張性質：本盤牌是三牌組成員，主要在組內互相定義。');
      }else if(protocol.slotMode==='sequence_member'){
        lines.push(spreadId==='mathers_66'
          ?'單張性質：第1–66張是有序主盤的序列成員；第67、68張是保留牌另抽的左右意外結語，不屬於主盤序列。'
          :'單張性質：本盤牌是有序牌列成員，序號表示順序與配對。');
      }

      if(protocol.structures&&protocol.structures.length){
        lines.push('');
        lines.push('原生結構：');
        protocol.structures.forEach(function(st){
          var detail='';
          if(st.type==='semantic_pairing') detail=pairSummary(st.pairs);
          else if(st.type==='dependency_network'||st.type==='semantic_group'||st.type==='dyad'||st.type==='cross'||st.type==='synthesis'||st.type==='house_wheel') detail=members(st.indices);
          else if(st.indices&&st.indices.length) detail=seq(st.indices);
          lines.push('・'+st.label+'〔'+st.type+'〕'+(detail?'：'+detail:'')+'。'+(st.instruction||''));
          (st.links||[]).forEach(function(link){
            lines.push('　關係：'+endpoint(link.from)+(link.bidirectional?' ↔ ':' → ')+endpoint(link.to)+'｜'+link.relation+'。');
          });
        });
      }

      if(!isRWS&&plan&&Array.isArray(plan.dignityLines)&&plan.dignityLines.length){
        lines.push('');
        lines.push('真正有序相鄰線（用於完整元素尊貴）：');
        plan.dignityLines.forEach(function(path,i){lines.push('・相鄰線'+(i+1)+'：'+seq(path));});
      }else if(!isRWS){
        lines.push('真正有序相鄰線：本方法資料未聲明；本次不計算完整元素尊貴，仍依各牌位與語義互動解讀。');
      }
      if(plan&&Array.isArray(plan.compatibilityEdges)&&plan.compatibilityEdges.length){
        lines.push('其他語義互動：');
        plan.compatibilityEdges.forEach(function(edge){lines.push('・'+members(edge));});
      }
    }else{
      lines.push('程序單位：每次操作各自包含落點、計數故事、配對故事與元素尊貴；若程序中止，整合已完成的部分。');
    }

    lines.push('');
    lines.push('綜合提示：依上述原生結構形成主判，遇到矛盾時比較整體支持與替代解讀；時間精度以牌位及本盤實際時間資料為準。');
    return lines.join('\n');
  }


  // 圖像與 Book T 對應可相互補充，資料來源不同時清楚標示視角。
  window.JY_buildSpreadReadingGuide = buildSpreadReadingGuide;
  function getImageryReq() {
    return '可結合本次牌圖中的人物、方向、場景與象徵作補充，並與 Golden Dawn Book T 的牌義、占星對應和元素尊貴交叉分析；兩者不同時請標明視角。';
  }

  // 全站塔羅來源固定為 Golden Dawn Book T；舊版來源切換旗標永久關閉。
  function _isWaitePure() { return false; }

  // ── 取問卜者問題（多來源防呆）──
  function getQuestion() {
    try {
      var S = (typeof window!=='undefined' && window.S) ? window.S : (typeof self!=='undefined' && self.S) ? self.S : null;
      // ★ 修：S 是 bazi.js 的頂層 const，不掛 window。用 Function 取全域裸 S。
      if (!S || !S.form) { try { S = (0, eval)('typeof S !== "undefined" ? S : null'); } catch(e){} }
      S = S || {};
      var f = S.form || {};
      var q = f.q || f.question || f.text || S.q || S.question || '';
      if (q && String(q).trim()) return String(q).trim();
    } catch (e) {}
    // DOM 後備（★ v70.1 修：補上實際存在的 f-question / f2-question，原本那組 id 都不存在於現行 DOM）
    var ids = ['f-question', 'f2-question', 'tarot-question', 'ootk-question', 'question-input', 'q-input', 'userQuestion'];
    for (var i = 0; i < ids.length; i++) {
      var el = document.getElementById(ids[i]);
      if (el && el.value && el.value.trim()) return el.value.trim();
    }
    return '（問卜者未填寫明確問題，請依牌面給通盤解讀）';
  }

  // v95：原句先編譯成型別化查詢圖；不靠題材詞庫決定問題內容。
  function buildRootQuestionLock(question, tool) {
    if (tool !== 'tarot' && tool !== 'ootk') return buildFocusLock(question, tool);
    return [
      BAR,
      '◆ 原問句',
      BAR,
      '原問句：' + question,
      '完整回答原問句中的對象、事件、條件、比較、期限與各子題，開頭先給核心結論。',
      '可運用你自身的塔羅與日常語義知識理解問題；具體程度與時間精度請和牌面、牌位及資料支持相稱。'
    ].join('\n');
  }

  // ── 問題分類引擎（v70.1 治本：補回 v70 改純前端複製後掉的 focusType 分類）──
  //    純前端、零 API、零 worker。只做「這次問的是什麼性質的問題」，
  //    結果用來在提示詞最前面注入「本次問題鎖定」——讓 AI 聚焦，不再把單一問題擴寫成通盤運勢。
  function detectFocus(q) {
    var s = String(q || '');
    var noQ = !s || /未填寫明確問題/.test(s);
    var has = function (re) { return re.test(s); };

    // 領域：★ v70.7 根治——改讀單一權威分類器 window.JY_classifyDomains（與開鑰 detectQuestionType 同源，
    //   不再各自維護詞庫、不再各說各話）。統一 enum → 鎖定區 5 類映射(secret 併入 love，family/study/friend 鎖定區不細分故略)。
    var _map5 = { love: 'love', secret: 'love', money: 'wealth', work: 'career', health: 'health', spiritual: 'spiritual' };
    var _rawHits = (typeof window !== 'undefined' && window.JY_classifyDomains) ? window.JY_classifyDomains(s) : [];
    var domains = [];
    _rawHits.forEach(function (h) { var m = _map5[h]; if (m && domains.indexOf(m) < 0) domains.push(m); });

    // 形態
    var isTiming   = has(/什麼時候|何時|幾月|幾號|幾點|多久|多快|近期|這(週|個禮拜)|這個月|這月|本月|下個月|今年|明年|今晚|今天|明天|後天|這幾天|最近(會|能)|還要多久/);
    var isUrgent   = has(/今晚|今天|等等|待會|這幾(個)?小時|24小時|馬上|立刻|這一兩天|此刻/);
    var isYesNo    = has(/嗎[？?]?\s*$|會不會|是不是|有沒有|能不能|可不可以|是否|對不對|對嗎|好不好|行不行/);
    var isProb     = has(/機率|百分比|幾成|幾%|多少%|多少趴|可能性(有)?多(大|高|少)|機會(有)?多(大|高)/); // v85.4 機率題形態
    var isDecision = has(/該不該|要不要|該(選|留|走|分|放棄|繼續)|選.{0,6}還是|.{1,6}還是.{1,6}[好嗎？?]|哪個(好|對|適合)|哪一個|值不值得|值得嗎|適合嗎|留還是走|分還是不分/);
    var isPortrait = has(/對方是(誰|什麼)|他是(誰|什麼樣)|她是(誰|什麼樣)|(他|她|對方).{0,4}(在想|怎麼想|想我|想念|想不想我|愛不愛我|還想|還愛|過得|好不好)|什麼樣的人|對方(的)?(個性|長相|職業)|他喜(不喜)?歡我|她喜(不喜)?歡我/);
    var isOverview = has(/整體運勢|流年|運程|綜合運勢|全年運|今年運勢|本年運勢|這個月運勢|運勢(如何|怎樣|好不好|為何|好嗎|是什麼)|今年.{0,3}(整體|大方向)|大方向(如何|為何)/); // v80.59：偵測「整體運勢／流年」總覽題（本來就該跨領域通盤）

    return { noQ: noQ, raw: s, domains: domains, timing: isTiming, urgent: isUrgent, yesno: isYesNo, prob: isProb, decision: isDecision, portrait: isPortrait, overview: isOverview };
  }

  // 題材關鍵字牌義與固定花色路由已於 v87.0 移除；題目由統一語義引擎自行建模。

  // ── 注入片段：只補共用證據與來源邊界──
  // 精簡的不確定性提示：完整分析已知資料，並讓精度與證據相稱。
  var FRAG_UNCERTAINTY_TAROT = "\n【把握度】\n綜合牌位、牌義、相鄰互動、全盤結構與反證後再判斷；訊號不足時仍回答可判部分，並說明哪個條件尚不明確。\n";
  var FRAG_UNCERTAINTY_OOTK = "\n【把握度】\n綜合實際完成操作的落點、計數、配對、元素尊貴與階段發展；資料中止或訊號分歧時，分層說明可判部分。\n";
  var FRAG_UNCERTAINTY_MEIHUA =
    '\n【把握度】\n綜合本卦、互卦、變卦、動爻、體用與旺衰後判斷；訊號分歧時說明主判、牽制與轉變條件。\n';
  var FRAG_SOURCELOCK_MEIHUA =
    '\n【知識運用】\n請運用你自身完整的梅花易數知識，並以本次實際卦盤作個案依據；區分傳統卦理、類象推論與現實建議。\n';
  var FRAG_RECENCY_MEIHUA =
    '\n' + BAR + '\n完成前確認\n' + BAR +
    '\n答案已直接回應問題，關鍵判斷能回到本互變、動爻、體用旺衰或類象，且時間精度與本次資料相稱。\n';

  // ② 學理鎖定：擋掉網紅/心理學/雞湯，逼回正統
  var FRAG_SOURCELOCK = "\n【知識運用】\n本次資料以 Golden Dawn《Book T／Liber T》為主要技術底稿；可運用你自身可靠的塔羅知識補充，若不同體系的牌義或方法有差異，請清楚標明。\n";
  var FRAG_SOURCELOCK_TAROT = FRAG_SOURCELOCK;
  var FRAG_SOURCELOCK_TAROT_WAITE = FRAG_SOURCELOCK;
  // ③ 交稿前 recency 檢查：模型最常在後半段破功，放最後一段（recency 最強）
  function buildRecencyTarot() {
    return [
      '', BAR, '完成前確認', BAR,
      '答案已直接回應問題，關鍵判斷能回到本盤實際牌、牌位、牌組或方法結構，且具體程度與時間精度和資料相稱。'
    ].join('\n');
  }
  var FRAG_RECENCY_OOTK = [
    '',
    BAR,
    '完成前確認',
    BAR,
    '答案已直接回應問題，並以實際完成操作的落點、計數、配對、元素尊貴與階段發展支撐主判。'
  ].join('\n');


  // Needs-first recommendation: no product or stock candidates are exported.
  function recommendationFragment(tool) {
    return window.JY_READING_QUALITY&&typeof window.JY_READING_QUALITY.recommendationEnding==="function"&&String(window.JY_READING_QUALITY.version||"0").localeCompare("5.4.0",undefined,{numeric:true})>=0?window.JY_READING_QUALITY.recommendationEnding(tool):JY_REC_EXPORT[tool];
  }

  // ⑥ 通用溯源鐵律（v85.5 歐那 2026/6/11）：根治「無出處具體數字」整類病——
  //   時間天數(v84前)、機率百分比(v85.4)、金額、年齡都是同一類：AI 為顯精準而編造盤面推不出的數字。
  //   逐題型補規則永遠補不完；改立通用原則罩住整個類別，題型專屬規則只保留「怎麼推」的方法細節。
  var FRAG_TRACE =
    '\n【具體性】\n重要結論、數字、時間與人物描述請連回本盤的牌、牌位或資料；若只能判斷趨勢，就用相應的範圍與把握度表達。\n';

  // ⑤ 輸出載體（v85 歐那 2026/6/11）：根治外部 AI 介面把解讀包進文件/畫布容器，
  //    導致第一句在容器外重複出現、結尾網址掉到容器外並黏上不可見字元（U+2060/亂碼）連結失效。
  //    所有工具共用，注入在 recency 檢查之前。
  var FRAG_PLAINTEXT =
    '\n【輸出載體】\n直接輸出一則完整解讀即可，不使用程式碼區塊或額外文件容器。\n';

  // ── 組裝「本次問題鎖定」區塊（放在提示詞最前面，primacy 最強）──
  //    ★ v70.4(歐那 2026/5/29)：分工具。塔羅快讀＝yes/no 直答導向；
  //      開鑰之法＝深度拆解導向（絕不能用塔羅的「給是非、禁止擴寫」框架，那會直接掐死開鑰的五層拆解本質）。
  function buildFocusLock(q, tool) {
    var f = detectFocus(q);
    var L = [BAR, '◆ 本次問題', BAR];
    if (f.noQ) {
      L.push('問卜者未填明確問題，請依本次盤面給出整體主題、發展、提醒與可採取方向。');
      return L.join('\n') + '\n';
    }
    L.push('原問句：' + f.raw);
    L.push('請保留問題中的對象、事件、條件、比較、期限與各子題，開頭先回答核心問題。');
    if (tool === 'meihua') {
      L.push('用本卦、互卦、變卦、動爻、體用旺衰與類象說明判斷。');
      return L.join('\n') + '\n';
    }
    if (tool === 'ootk') {
      L.push('綜合實際完成的操作，依序呈現當下、發展、進一步發展、接近結果與收束。');
    } else {
      if (f.yesno) L.push('是非題請先給明確傾向，再說成立條件與反證。');
      if (f.decision) L.push('比較題請用一致標準分析各選項的助力、代價與走向。');
      if (f.prob) L.push('機率題以相對強弱與把握度表達，除非本盤另有可靠數值依據。');
      if (f.timing) L.push('時間題請說明相對先後、快慢、窗口及觸發條件；日期精度以本盤資料為準。');
      if (f.portrait) L.push('人物題請綜合相關牌位、宮廷牌、牌組與全盤關係，並提示可觀察特徵。');
      if (f.overview) L.push('全景題請呈現本盤真正突出的生活領域與主次脈絡。');
    }
    return L.join('\n') + '\n';
  }

  // ── 梅花：結構化物件 → 正統解卦資料區 ──
  function formatMeihuaData(mh) {
    var L = [];
    function g(path, fb) {
      try {
        var cur = mh;
        path.split('.').forEach(function(k){ cur = cur && cur[k]; });
        return (cur === undefined || cur === null || cur === '') ? (fb || '') : cur;
      } catch(e) { return fb || ''; }
    }
    L.push('問卜資料：');
    if(mh.castContext)L.push('起卦上下文：'+safeText(mh.castContext));
    if(mh.wangShuai)L.push('卦氣旺衰資料：'+safeText(mh.wangShuai));
    if(mh.yingQi)L.push('應期資料及精度：'+safeText(mh.yingQi));
    L.push('本卦：' + g('ben.n','') + (g('ben.u','') ? ' ' + g('ben.u','') : ''));
    L.push('互卦：' + g('hu.n','') + (g('hu.u','') ? ' ' + g('hu.u','') : ''));
    L.push('變卦：' + g('bian.n','') + (g('bian.u','') ? ' ' + g('bian.u','') : ''));
    L.push('動爻：第 ' + (mh.dong || '') + ' 爻');
    L.push('上卦：' + g('up.name','') + '（' + g('up.el','') + '）｜下卦：' + g('lo.name','') + '（' + g('lo.el','') + '）');
    L.push('體卦：' + g('tiG.name','') + '（' + g('tiG.el','') + '）｜用卦：' + g('yoG.name','') + '（' + g('yoG.el','') + '）');
    L.push('體用關係：' + g('ty.r','') + '｜吉凶傾向：' + g('ty.f','') + '｜說明：' + g('ty.d',''));
    // v86.12 正統定性（《梅花易數·體用總訣》原文語彙：吉凶以此為綱、旺衰定輕重；剋/克皆相容）
    var _tyOrth = {
      '用生體': '用生體＝有進益之喜（吉）',
      '體生用': '體生用＝有耗失之患（洩耗）',
      '體克用': '體克用＝諸事吉——成在我方主動，剋出仍須出力',
      '用克體': '用克體＝諸事凶——受制受阻',
      '比和':   '比和＝百事順遂'
    };
    var _tyr = String(g('ty.r','')).replace(/剋/g, '克');
    if (_tyOrth[_tyr]) L.push('體用原典定性（吉凶以此為綱，輕重再依體用旺衰增減）：' + _tyOrth[_tyr]);
    if (g('ben.j','')) L.push('本卦卦辭：' + g('ben.j',''));
    if (g('ben.m','')) L.push('本卦解讀：' + g('ben.m',''));
    if (g('bian.m','')) L.push('變卦解讀：' + g('bian.m',''));
    L.push('');
    L.push('前端衍生摘要（供交叉參考，請以原始卦盤與你自身判讀為主）：');
    if (mh.shortVerdict) L.push('・短判：' + mh.shortVerdict);
    if (mh.summary) L.push('・摘要：' + mh.summary);
    if (mh.decisionHint) L.push('・行動提示：' + mh.decisionHint);
    if (mh.timing) L.push('・時間節奏：' + safeText(mh.timing));
    // v86.12 正統應期（《占卦訣》：事應於生體卦氣之日、敗於剋體卦氣之日）——由 meihua_output_layer.js v2 buildMeihuaYingQi 提供
    if (mh.yingQi && mh.yingQi.jiTxt) {
      L.push('・應期候選（依 precision 判斷可說到相對層次、卦氣候選或日曆時間）：');
      L.push('　吉應之期：' + mh.yingQi.jiTxt);
      L.push('　敗應之期：' + mh.yingQi.baiTxt);
      L.push('　遠近層次：' + (mh.yingQi.layerTxt || '用卦主近期之應、互卦主中期之應、變卦主遠期之應'));
    }
    if (mh.risk) L.push('・風險：' + safeText(mh.risk));
    if (mh.strategy) L.push('・策略：' + safeText(mh.strategy));
    if (mh.tags) L.push('・標籤：' + safeText(mh.tags));
    if (mh.analysis) L.push('・分析物件：' + safeText(mh.analysis));
    return L.join('\n');
  }

  // ── 取排盤資料塊（沿用現有 builder，只匯出 Golden Dawn Book T 核心資料）──
  // ── 防呆字串化：任何型別都轉成乾淨文字，杜絕 [object Object] ──
  function safeText(v) {
    if (v === null || v === undefined) return '';
    var t = typeof v;
    if (t === 'string' || t === 'number' || t === 'boolean') return String(v);
    if (Array.isArray(v)) {
      return v.map(function (item) {
        if (item === null || item === undefined) return '';
        var it = typeof item;
        if (it === 'string' || it === 'number' || it === 'boolean') return String(item);
        if (it === 'object') {
          if (item.meaning && (item.a || item.b)) return (item.a || '') + '↔' + (item.b || '') + '：' + item.meaning;
          if (item.message) return ((item.cards && item.cards.join) ? item.cards.join('×') + '——' : '') + item.message;
          if (item.name && item.meaning) return item.name + '：' + item.meaning;
          if (item.cardName) return item.cardName + (item.sephirotZh ? '→' + item.sephirotZh : '');
          return Object.keys(item).map(function (k) {
            var x = item[k];
            return (typeof x === 'string' || typeof x === 'number') ? String(x) : '';
          }).filter(Boolean).join(' ');
        }
        return '';
      }).filter(Boolean).join('；');
    }
    if (t === 'object') {
      if (v.meaning) return String(v.meaning);
      return Object.keys(v).map(function (k) {
        var s = safeText(v[k]);
        return s ? (k + '：' + s) : '';
      }).filter(Boolean).join('｜');
    }
    return '';
  }

  // ── 塔羅：結構化物件 → 模板要的逐張牌文字 + 預運算數據 ──
  function formatTarotData(result) {
    var td = (result && result.tarotData) || {};
    if(td.sourceProfile==='rws_reversals'&&window.JYTarotReading)return window.JYTarotReading.formatData(td);
    var cards = td.cards || [];
    var L = [];
    L.push('牌陣：' + (td.spreadZh || td.spreadType || '未指定') + '（' + cards.length + '張）');
    L.push('主要資料來源：Golden Dawn《Book T／Liber T》〔gd_book_t〕；可用你自身可靠的塔羅知識交叉補充並標明體系差異。');
    L.push('牌面方向：一般牌陣正向展示；元素尊貴以明示有序連續線為主，其他連線依其牌陣語義解讀。');
    if(td.drawProcedure){
      L.push('抽牌程序：'+td.drawProcedure.description);
      if(td.drawProcedure.significator)L.push('代表牌：'+td.drawProcedure.significator.name+'；'+td.drawProcedure.significator.policy);
    }
    L.push('');
    L.push('抽到的牌：');
    var methodPlan=td.methodPlan||null;
    cards.forEach(function(c,i){
      var slot=(methodPlan&&methodPlan.slots&&methodPlan.slots[i])||{};
      var pos = slot.label || c.positionMeaning || c.position || ('位置'+(i+1));
      var unitNote='';
      if(slot.slotKind==='sequence_member') unitNote='〔序列成員；無獨立牌位權限〕';
      else if(slot.slotKind==='triad_member') unitNote='〔三牌組成員；須在組內成義〕';
      else if(slot.slotKind==='surprise_conclusion') unitNote='〔保留牌另抽的意外結語；非主盤序列〕';
      var line = (i+1)+'. '+pos+unitNote+'：'+(c.name||'?');
      if (c.bookTTitle) line += '〔'+c.bookTTitle+'〕';
      if (c.element) line += '｜元素：'+c.element;
      if (c.sephirah || c.world) line += '｜卡巴拉：'+[c.sephirah,c.world].filter(Boolean).join('／');
      if (c.correspondence) line += '｜對應：'+c.correspondence;
      line += '｜Book T原典核心義：'+(c.sourceCore||c.baseMeaning||c.sourceGloss||'依位置與有序相鄰牌裁決');
      if (c.elementalDignity) {
        var d=c.elementalDignity;
        line += '｜元素尊貴：'+(d.state||'mixed')+(d.reading?'；本位讀法：'+d.reading:'');
      }
      L.push(line);
    });
    var legal=cards.map(function(c){return c.name;}).filter(Boolean);
    if (legal.length){L.push('');L.push('【合法牌名】'+legal.join('、'));}
    if (td.preStats && td.preStats.observations && td.preStats.observations.length) {
      L.push('【Book T多數／同階觀察】'+td.preStats.observations.join('；'));
    }
    if (td.elementalDignityGroups && td.elementalDignityGroups.length) {
      var dgLines=[];
      td.elementalDignityGroups.forEach(function(g){
        (g.links||[]).forEach(function(link){
          var rel=link.relation||{};
          dgLines.push((link.fromName||('位置'+(link.from+1)))+' ↔ '+(link.toName||('位置'+(link.to+1)))+'：'+(rel.label||rel.code||'未定'));
        });
      });
      if(dgLines.length)L.push('【Book T有序相鄰線元素尊貴】'+dgLines.join('；'));
    }
    if (td.treePillars) L.push('【生命之樹牌陣結構】'+safeText(td.treePillars));
    var qTime=/什麼時候|何時|幾時|多久|幾天|幾週|幾月|哪一年|時間/.test(getQuestion());
    if (qTime) {
      if (td.timeConclusion) L.push('【時間參考】'+safeText(td.timeConclusion)+'；請說明相對時序與可支持的精度。');
      else L.push('【時間參考】本次資料主要支持牌位所示的相對階段，精確曆日的把握度較低。');
    }
    return L.join('\n');
  }

  // ── 開鑰之法：結構化物件 → 五次操作完整文字 + 補充觀察 ──
  function formatOOTKData(result) {
    var od=(result&&result.ootkData)||{};
    var ops=od.operations||{};
    var sig=od.significator||{};
    var L=[];
    L.push('方法：'+(od.method||'Golden Dawn《Book T／Liber T》Opening of the Key 五次操作'));
    if(od.procedureProfile)L.push('操作版本：'+od.procedureProfile);
    if(od.methodRules)L.push('本次版本規則：'+safeText(od.methodRules));
    L.push('布局與主要程序來源：Golden Dawn《Book T／Liber T》Opening of the Key；請運用你自身可靠的 Golden Dawn 知識交叉分析。');
    L.push('代表牌：'+(sig.name||sig.n||safeText(sig)||'未提供'));
    if(od.castTimestamp)L.push('本次程序建立時間（UTC）：'+od.castTimestamp+'；只作本次紀錄，不是事件應期。');
    if(od.predeclaredBindings)L.push('發牌前綁定：'+safeText(od.predeclaredBindings));
    if(od.procedureStatus){
      L.push('程序狀態：'+safeText(od.procedureStatus));
      if(od.procedureStatus.abandoned) L.push('程序於'+od.procedureStatus.abandonedAt+'停止；以下是程序紀錄，不得將未通過驗題的牌面當作對原問題的有效占斷。');
    }
    if(od.validityPolicy)L.push('程序規則：'+od.validityPolicy);
    if(od.divinationValidity)L.push('占卜有效性：'+safeText(od.divinationValidity));
    L.push('');
    var labels={op1:'第一次操作・當下情勢',op2:'第二次操作・問題發展',op3:'第三次操作・進一步發展',op4:'第四次操作・倒數階段（三十六牌環）',op5:'第五次操作・最終結果（生命之樹）'};
    function cn(c){return c?(c.name||c.n||'?'):'?';}
    ['op1','op2','op3','op4','op5'].forEach(function(k){
      var o=ops[k];if(!o)return;
      L.push('────────────────────────');
      L.push('【'+labels[k]+'】');
      if(o.abandoned)L.push('狀態：依Book T停止——'+(o.abandonReason||''));
      if(o.openingCards&&o.openingCards.length)L.push('四堆翻面初示牌（由右至左）：'+o.openingCards.map(function(p){return p.pile+'：'+cn(p.card);}).join('；'));
      if(o.pairingPolicy)L.push('本輪配對規則：'+o.pairingPolicy);
      if(o.countingStart)L.push('本輪計數起點：'+o.countingStart);
      if(o.mainLineValidation)L.push('第一次操作主要線索確認：'+safeText(o.mainLineValidation));
      if(o.procedurePolicy)L.push('本次明示程序政策：'+o.procedurePolicy);
      if(o.activePile)L.push('代表牌落堆：'+o.activePile+(o.domainMeaning?'（'+o.domainMeaning+'）':''));
      if(o.activeHouse)L.push('代表牌落宮：第'+o.activeHouse+'宮'+(o.domainMeaning?'（'+o.domainMeaning+'）':''));
      if(o.activeSign)L.push('代表牌落星座堆：'+o.activeSign);
      if(o.activeSephirah)L.push('代表牌落生命樹：'+o.activeSephirah+(o.sephirahZh?'（'+o.sephirahZh+'）':'')+(o.sephirahMeaning?'——'+o.sephirahMeaning:''));
      if(o.ringSize)L.push('三十六牌環：'+o.ringSize+'張。');
      if(o.activeCards&&o.activeCards.length)L.push('活躍牌：'+o.activeCards.map(function(c){return cn(c)+(c.bookTTitle?'〔'+c.bookTTitle+'〕':'');}).join('、'));
      var counting=o.ringCountingPath&&o.ringCountingPath.length?o.ringCountingPath:o.countingPath;
      if(counting&&counting.length)L.push('計數故事（堆內位置自0編號；環牌1–36，center為中央）：'+counting.map(function(s){return (s.cardName||'?')+'〔位置'+s.position+'，計'+s.countValue+(s.direction?'，方向'+s.direction:'')+'〕';}).join(' → '));
      var pairs=(o.ringPairing&&o.ringPairing.length)?o.ringPairing:o.pairs;
      if(pairs&&pairs.length)L.push('配對故事（依本輪配對規則）：'+pairs.map(function(pr,i){return '#'+(i+1)+' '+cn(pr.left)+(pr.right?'↔'+cn(pr.right):'（中央單張）')+(pr.dignity?'〔'+pr.dignity+'〕':'');}).join('；'));
      if(o.dignities&&o.dignities.length)L.push('元素尊貴：'+safeText(o.dignities));
      if(o.bookTMajorities&&o.bookTMajorities.observations&&o.bookTMajorities.observations.length)L.push('Book T多數／同階觀察：'+o.bookTMajorities.observations.join('；'));
      if(o.expectationNote)L.push('位置適配：'+o.expectationNote);
    });
    var seen={};
    Object.keys(ops).forEach(function(k){(ops[k].activeCards||[]).forEach(function(c){if(c&&c.name)seen[c.name]=c;});});
    Object.keys(ops).forEach(function(k){(ops[k].openingCards||[]).forEach(function(p){if(p.card&&p.card.name)seen[p.card.name]=p.card;});});
    L.push('【本次活躍牌與初示牌的牌義底稿（相同牌只列一次，各操作分開解讀）】');
    Object.keys(seen).forEach(function(name){var c=seen[name];L.push('・'+name+'｜元素 '+(c.element||'未提供')+'｜核心 '+(c.coreMeaning||'未提供')+'｜得尊貴 '+(c.wellDignified||'未提供')+'｜失尊貴 '+(c.illDignified||'未提供')+(c.correspondence?'｜對應 '+c.correspondence:''));});
    if(sig.name&&!seen[sig.name])seen[sig.name]=sig;
    var legal=Object.keys(seen);
    if(legal.length){L.push('');L.push('【合法牌名】'+legal.join('、'));}
    L.push('【計數說明】'+(od.countRule||'包含起算牌；宮廷國王／皇后／王子=4、公主=7、Aces=11、小牌依牌號、大牌依元素／行星／黃道=3／9／12。')+'計數值只導航牌序，不量測現實時間或數量。元素尊貴衡量作用力度，力度強不自動等於吉利；配對故事與計數故事先各自成立再比較。');
    return L.join('\n');
  }

  // ── 取排盤資料塊（沿用現有 builder，只匯出 Golden Dawn Book T 核心資料）──
  function getPayloadObject(tool) {
    try {
      var obj = null;
      function _callBuilder(name) {
        var fn=null;
        try { fn = (0, eval)('typeof ' + name + ' === "function" ? ' + name + ' : null'); } catch (e) {}
        if(!fn&&typeof window!=='undefined')fn=window[name];
        // A failed builder is incomplete data, never a second draw/retry through an alias.
        return typeof fn==='function'?fn():null;
      }
      if (tool === 'ootk') obj = _callBuilder('_buildOOTKPayload');
      else if (tool === 'ziwei') obj = (typeof window !== 'undefined' && window.S && window.S.ziwei) ? window.S.ziwei : null;
      else if (tool === 'meihua') obj = (typeof window !== 'undefined' && window.S && window.S.meihua) ? window.S.meihua : null;
      else obj = _callBuilder('_buildTarotOnlyPayload');
      return obj;
    } catch (e) { return null; }
  }

  function formatPayloadObject(tool, obj) {
    if (!obj) {
      if (tool === 'ziwei') return '（找不到紫微命盤資料，請先完成出生資料排盤）';
      if (tool === 'meihua') return '（找不到梅花易數卦盤資料，請先完成起卦）';
      return '（找不到排盤資料，請先完成抽牌／排盤）';
    }
    if (typeof obj === 'string') return obj;
    if (tool === 'meihua') return formatMeihuaData(obj);
    if (obj.mode === 'ootk' || obj.ootkData) return formatOOTKData(obj);
    return formatTarotData(obj);
  }

  function getPayload(tool) {
    try { return formatPayloadObject(tool, getPayloadObject(tool)); }
    catch (e) { return '（排盤資料組裝失敗：' + (e && e.message ? e.message : e) + '）'; }
  }

  // ── 組成完整可複製提示詞 ──
  function ootkStatus(raw) {
    var od=raw&&raw.ootkData;
    if(!od)return null;
    var ps=od.procedureStatus||{},v=od.divinationValidity||{},ops=od.operations||{};
    var keys=['op1','op2','op3','op4','op5'].filter(function(k){return !!ops[k];});
    var stopped=!!ps.abandoned||v.valid===false||keys.some(function(k){return ops[k].valid===false||ops[k].abandoned||ops[k].abandonTriggered;});
    return {stopped:stopped,complete:!stopped&&keys.length===5,recorded:keys.length,
      at:ps.abandonedAt||keys.filter(function(k){return ops[k].abandoned;})[0]||'未完成的操作',
      reason:ps.reason||ps.abandonReason||v.reason||keys.map(function(k){return ops[k].abandonReason||'';}).filter(Boolean).join('；')||'程序尚未完成'};
  }
  function buildPrompt(tool, suppliedPayload) {
    var t = TPL[tool];
    if (!t) return '';
    var rawPayload = arguments.length>1?suppliedPayload:getPayloadObject(tool);
    if(!rawPayload)return '';
    if(tool==='meihua'&&(!rawPayload.ben||!rawPayload.hu||!rawPayload.bian||!rawPayload.tiG||!rawPayload.yoG||!Number.isInteger(rawPayload.dong)||rawPayload.dong<1||rawPayload.dong>6))return '';
    if(rawPayload.mode==='ootk'||rawPayload.ootkData){tool='ootk';t=TPL.ootk;}
    var status=ootkStatus(rawPayload);
    if(tool==='ootk'){
      if(!window.JYNativeCards?.ootkToPrompt||!window.JYNativeDepthContract?.build)throw new Error('OOTK逐輪閱讀元件未載入，請重新載入頁面；不能降級使用舊提示詞。');
      if(window.JYPromptPacket)return window.JYPromptPacket.build(tool,rawPayload,String(rawPayload.question||getQuestion()));
      var native=window.JYNativeCards.ootk(rawPayload),depth=window.JYNativeDepthContract.build('ootk',rawPayload,{methodData:native,unavailable:['由象徵證實人物心意或未發生事件']});
      var audit=window.JYEngineComputationAudit?window.JYEngineComputationAudit.ensure('ootk',rawPayload,{methodData:native}):{status:'unverified',reason:'計算查核模組未載入，不能宣稱已驗證。'};
      var question=String(rawPayload.question||getQuestion()),style=window.JY_READING_QUALITY?.lines?window.JY_READING_QUALITY.lines('ootk'):JY_READING_EXPORT.ootk;
      return ['【原問題】\n'+JSON.stringify(question),style.join('\n'),window.JYReadingWorkflow.render({method:'ootk',question:question}),window.JYNativeCards.ootkToPrompt(native),window.JYNativeDepthContract.toPrompt(depth),'【本次計算查核】\n'+JSON.stringify(audit),'程序參考：Liber LXXVIII https://sacred-texts.com/oto/lib78.htm。五輪是操作層次，非固定月份。','【資料結束】',native.completed.length?recommendationFragment('ootk'):'沒有有效輪次，不生成占斷或命理選材。'].join('\n\n');
    }
    var question = String(rawPayload.question||getQuestion());
    var payload = formatPayloadObject(tool, rawPayload);
    var rws=tool==='tarot'&&rawPayload.tarotData&&rawPayload.tarotData.sourceProfile==='rws_reversals'&&window.JYTarotReading;
    var isRootTarot = (tool === 'tarot' || tool === 'ootk');
    var sourceLock = tool === 'meihua' ? FRAG_SOURCELOCK_MEIHUA : (isRootTarot ? '' : FRAG_SOURCELOCK);
    var uncertainty = tool === 'meihua' ? FRAG_UNCERTAINTY_MEIHUA : (isRootTarot ? '' : FRAG_UNCERTAINTY_TAROT);
    if(window.JYPromptPacket)return window.JYPromptPacket.build(tool,rawPayload,question||'請依本次完整操作分析');
    var recency = tool === 'meihua' ? FRAG_RECENCY_MEIHUA : (tool === 'ootk' ? FRAG_RECENCY_OOTK : buildRecencyTarot());
    return globalThis.JYReadingWorkflow.finish([
      buildRootQuestionLock(question, tool),
      (window.JY_READING_QUALITY&&typeof window.JY_READING_QUALITY.lines==="function"&&String(window.JY_READING_QUALITY.readingVersion||"0").localeCompare("16.1.0",undefined,{numeric:true})>=0?window.JY_READING_QUALITY.lines(tool):JY_READING_EXPORT[tool]).join('\n'),
      rws?rws.promptHead():t.head.replace('{{IMAGERY_REQ}}', (tool === 'tarot' ? getImageryReq() : '')),
      (isRootTarot?buildSpreadReadingGuide(tool, rawPayload):''),
      (tool==='tarot'?'方法參考：Waite 凱爾特十字 https://sacred-texts.com/tarot/pkt/pkt0307.htm；Mathers 1888 https://sacred-texts.com/tarot/mathers/mtar04.htm。現代布局與本次選用的牌義流派分開標示；書目不表示本次 AI 已即時查網。':''),
      (tool==='ootk'?'程序參考：Liber LXXVIII https://sacred-texts.com/oto/lib78.htm。這是可核對的 Golden Dawn 衍生修訂文本，不與 Mathers 1888《The Tarot》混為同一本書。各次操作的現在時點並非固定，不能將五次操作硬配五個月份；尚未確認的第一操作主線不能說成已獲問卜者認可。':''),
      sourceLock,
      '',
      BAR,
      t.dataHeader,
      BAR,
      '',
      '問卜者的問題：',
      question,
      '',
      (tool === 'tarot' && rawPayload.tarotData && rawPayload.tarotData.referenceDate ? '問題時間基準：'+rawPayload.tarotData.referenceDate+'（依建立本輪問題時的本地日期）；今年、下月等相對詞以此為錨。' : ''),
      payload,
      window.JYNativeAnalysis?window.JYNativeAnalysis.prompt(tool,rawPayload,question):'',
      '',
      rws?'請依實際正逆位、牌位關係與前述情境完成分析，回答原問句並說明行動與條件。':t.tail,
      FRAG_PLAINTEXT,
      recommendationFragment(tool)
    ].filter(function(x){ return x !== ''; }).join('\n'),{method:tool,question:question});
  }

  window.JY_buildExportPrompt = buildPrompt;

  // ── 複製到剪貼簿（含 fallback）──
  function copyText(text, btn) {
    function done(ok) {
      if (!btn) return;
      var old = btn.getAttribute('data-old') || btn.textContent;
      btn.setAttribute('data-old', old);
      btn.textContent = ok ? '✓ 已複製到剪貼簿' : '請展開下方文字，手動複製';
      if(!ok){var manual=btn.closest('.jy-ex-card');manual=manual&&manual.querySelector('.jf-manual-copy');if(manual)manual.open=true;}
      btn.disabled = false;
      setTimeout(function () { btn.textContent = old; }, 2200);
    }
    if (window.JYPromptPacket || (navigator.clipboard && navigator.clipboard.writeText)) {
      (window.JYPromptPacket?window.JYPromptPacket.copy(text):navigator.clipboard.writeText(text)).then(function () { done(true); }, function (error) { if(error&&/OVER_BUDGET/.test(error.code||'')){done(false);if(btn)btn.textContent=error.message;return;}fallback(); });
    } else { fallback(); }
    function fallback() {
      var ta=null,previous=document.activeElement;
      try {
        ta=document.createElement('textarea');ta.value=text;ta.readOnly=true;
        ta.style.cssText='position:fixed;left:-9999px;top:0;';
        document.body.appendChild(ta);ta.focus({preventScroll:true});ta.select();
        done(document.execCommand('copy'));
      } catch(e) { done(false); }
      finally {
        if(ta&&ta.isConnected)ta.remove();
        if(previous&&previous.isConnected)previous.focus({preventScroll:true});
      }
    }
  }

  // ── 渲染複製 UI 到指定容器 ──
  //    mount 可為 DOM element 或 id 字串；tool = 'tarot' | 'ootk'
  // ── 一次性注入儀式卡樣式 ──
  function ensureFx() {
    if (document.getElementById('jy-export-fx')) return;
    var st = document.createElement('style');
    st.id = 'jy-export-fx';
    st.textContent = [
      '@keyframes jyExHalo{0%,100%{opacity:.5;transform:scale(1)}50%{opacity:.95;transform:scale(1.08)}}',
      '@keyframes jyExStar{0%{transform:translateY(0) scale(1);opacity:0}15%{opacity:.9}85%{opacity:.7}100%{transform:translateY(-46px) scale(.4);opacity:0}}',
      '@keyframes jyExSheen{0%{transform:translateX(-130%)}60%,100%{transform:translateX(130%)}}',
      '@keyframes jyExRise{0%{opacity:0;transform:translateY(14px)}100%{opacity:1;transform:translateY(0)}}',
      '@keyframes jyExRing{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}',
      '.jy-ex-card{position:relative;overflow:hidden;max-width:560px;margin:1.1rem auto;padding:2.1rem 1.5rem 1.7rem;border-radius:22px;',
        'background:radial-gradient(135% 120% at 50% -10%,rgba(60,42,12,.55),rgba(16,12,8,.96) 62%);',
        'border:1px solid rgba(212,175,55,.32);box-shadow:0 18px 50px rgba(0,0,0,.5),inset 0 1px 0 rgba(255,236,184,.12);',
        'animation:jyExRise .6s ease-out both}',
      '.jy-ex-card::before{content:"";position:absolute;top:-90px;left:50%;width:280px;height:280px;margin-left:-140px;border-radius:50%;',
        'background:radial-gradient(circle,rgba(233,207,110,.28),rgba(233,207,110,0) 70%);animation:jyExHalo 5s ease-in-out infinite;pointer-events:none}',
      '.jy-ex-stars{position:absolute;inset:0;pointer-events:none;overflow:hidden}',
      '.jy-ex-stars i{position:absolute;bottom:18%;width:3px;height:3px;border-radius:50%;background:rgba(255,236,184,.9);box-shadow:0 0 6px rgba(255,236,184,.7);animation:jyExStar linear infinite}',
      '.jy-ex-emblem{position:relative;width:62px;height:62px;margin:0 auto .9rem;display:flex;align-items:center;justify-content:center;font-size:1.7rem;z-index:1}',
      '.jy-ex-emblem::after{content:"";position:absolute;inset:-7px;border-radius:50%;border:1px dashed rgba(212,175,55,.45);animation:jyExRing 18s linear infinite}',
      '.jy-ex-title{position:relative;z-index:1;text-align:center;font-family:var(--f-display,"Noto Serif TC",serif);font-size:1.16rem;font-weight:700;letter-spacing:.04em;color:#f0d98a;margin-bottom:.5rem;text-shadow:0 2px 14px rgba(0,0,0,.6)}',
      '.jy-ex-sub{position:relative;z-index:1;text-align:center;font-size:.82rem;line-height:1.78;color:rgba(232,220,200,.72);max-width:430px;margin:0 auto 1.4rem}',
      '.jy-ex-sub b{color:#e9cf6e;font-weight:600}',
      '.jy-ex-srcwrap{position:relative;z-index:1;display:flex;gap:.4rem;justify-content:center;align-items:center;flex-wrap:wrap;font-size:.74rem;color:rgba(232,220,200,.66);margin:0 auto 1rem}',
      '.jy-src-btn{font-family:inherit;font-size:.74rem;padding:.32rem .72rem;border-radius:999px;border:1px solid rgba(212,175,55,.35);background:rgba(255,255,255,.03);color:rgba(240,230,210,.72);cursor:pointer;transition:all .15s}',
      '.jy-src-btn.on{background:linear-gradient(135deg,#f6e29a,#c9a23f);color:#231406;border-color:transparent;font-weight:700}',
      '.jy-ex-btn{position:relative;z-index:1;display:block;width:100%;max-width:340px;margin:0 auto;padding:1rem 1.2rem;border:none;border-radius:14px;cursor:pointer;',
        'font-family:inherit;font-size:1rem;font-weight:800;letter-spacing:.05em;color:#231406;overflow:hidden;',
        'background:linear-gradient(135deg,#f6e29a 0%,#e3c25e 45%,#c9a23f 100%);',
        'box-shadow:0 10px 30px rgba(201,162,63,.4),inset 0 1px 0 rgba(255,255,255,.5);transition:transform .15s,box-shadow .2s}',
      '.jy-ex-btn:hover{transform:translateY(-2px);box-shadow:0 14px 38px rgba(201,162,63,.55),inset 0 1px 0 rgba(255,255,255,.6)}',
      '.jy-ex-btn:active{transform:translateY(0)}',
      '.jy-ex-btn::after{content:none;display:none}',
      '.jy-ex-foot{position:relative;z-index:1;text-align:center;font-size:.7rem;color:rgba(212,175,55,.5);margin-top:.95rem;letter-spacing:.03em}',
      /* v76: AI shortcut buttons */
      '.jy-ex-ai-grid{position:relative;z-index:1;display:grid;grid-template-columns:repeat(5,1fr);gap:.4rem;max-width:420px;margin:.9rem auto 0}',
      '.jy-ai-shortcut{display:flex;flex-direction:column;align-items:center;gap:.25rem;padding:.45rem .15rem;border-radius:12px;border:1px solid rgba(255,255,255,.06);background:rgba(255,255,255,.02);cursor:pointer;transition:all .2s;font-family:inherit}',
      '.jy-ai-shortcut:active{transform:scale(.91);background:rgba(255,255,255,.07)}',
      '.jy-ai-icon{width:36px;height:36px;border-radius:10px;object-fit:cover}',
      '.jy-ai-name{font-size:.62rem;font-weight:600;color:rgba(240,230,210,.65);letter-spacing:.01em;white-space:nowrap}'
    ].join('\n');
    document.head.appendChild(st);
  }

  function starsHTML() {
    var lefts = [8, 20, 33, 46, 58, 70, 82, 92, 27, 64];
    var s = '';
    for (var i = 0; i < lefts.length; i++) {
      var dur = (3.4 + (i % 5) * 0.6).toFixed(1);
      var delay = ((i * 0.5) % 4).toFixed(1);
      var sz = (i % 3 === 0) ? 4 : 3;
      s += '<i style="left:' + lefts[i] + '%;width:' + sz + 'px;height:' + sz + 'px;animation-duration:' + dur + 's;animation-delay:' + delay + 's"></i>';
    }
    return s;
  }

  // ── 渲染華麗儀式複製卡（不顯示提示詞文字，只留複製按鈕＋說明）──
  function render(tool, mount) {
    var el = (typeof mount === 'string') ? document.getElementById(mount) : mount;
    if (!el) { console.warn('[prompt-export] 找不到掛載容器'); return; }
    ensureFx();
    var t = TPL[tool] || { label: '命理' };
    var rawPayload=getPayloadObject(tool),status=ootkStatus(rawPayload);
    var prompt = buildPrompt(tool,rawPayload);
    if(!prompt){el.textContent='本次資料尚未完整，請先完成抽牌／排盤，再產生解讀提示詞。';return;}
    var incomplete=status&&!status.complete;
    var share=document.getElementById('tarot-share-wrap');
    if(share&&(tool==='tarot'||tool==='ootk')){share.hidden=!!incomplete;share.style.display=incomplete?'none':'';}
    var hero=document.getElementById('tarot-question-hero');
    if(hero&&(tool==='tarot'||tool==='ootk'))hero.textContent='「'+String(rawPayload.question||getQuestion())+'」';
    var heading=document.querySelector('#step-tarot .at-result-heading');
    if(heading){heading.setAttribute('data-reading-state',incomplete?'stopped':'complete');
      var h=heading.querySelector('h1'),p=heading.querySelector('p');
      if(h)h.textContent=incomplete?'這次，先停在這裡。':'讓線索，成為下一步。';
      if(p)p.textContent=incomplete?'本輪開鑰未完成有效驗題。你可以查看停止紀錄，或保留問題返回整理。':'本次牌陣已完成。複製資料與讀法，到 AI 對話中取得完整解讀。';}
    var emblem = (tool === 'ootk') ? '🗝️' : (tool === 'ziwei' ? '🪐' : (tool === 'meihua' ? '☯️' : '🔮'));

    // 本輪讀法由抽牌紀錄決定，結果頁不重新切換牌義來源。
    var toggleHTML = (tool === 'tarot' || tool === 'ootk')
      ? '<div class="jy-ex-srcwrap">讀牌方式：<span class="jy-src-btn on">'+(tool==='tarot'&&prompt.indexOf('Rider–Waite–Smith')>=0?'RWS・正逆位':'Golden Dawn Book T')+'</span></div>'
      : '';

    var card = document.createElement('div');
    card.className = 'jy-ex-card';
    card.innerHTML =
      '<div class="jy-ex-stars">' + starsHTML() + '</div>' +
      '<div class="jy-ex-emblem">' + emblem + '</div>' +
      '<div class="jy-ex-title">' + t.label + (incomplete?' · 程序停止紀錄':' · 準備解讀')+'</div>' +
      '<div class="jy-ex-sub">'+(incomplete?'本輪沒有完整占斷。複製停止紀錄，可請 AI 協助釐清程序與問題。':'本次資料與讀法已整理好。複製提示詞，貼到 AI 對話並送出，即可繼續探索。')+'</div>' +
      toggleHTML +
      '<button type="button" class="jy-ex-btn">'+(incomplete?'複製停止紀錄與整理提示詞 →':'複製本次解讀提示詞 →')+'</button>' +
      '<div class="jy-ex-ai-grid">' +
        '<button type="button" class="jy-ai-shortcut" data-ai="chatgpt"><img class="jy-ai-icon" src="ai-icons/ai-chatgpt.png" alt="ChatGPT"><span class="jy-ai-name">ChatGPT</span></button>' +
        '<button type="button" class="jy-ai-shortcut" data-ai="claude"><img class="jy-ai-icon" src="ai-icons/ai-claude.png" alt="Claude"><span class="jy-ai-name">Claude</span></button>' +
        '<button type="button" class="jy-ai-shortcut" data-ai="gemini"><img class="jy-ai-icon" src="ai-icons/ai-gemini.png" alt="Gemini"><span class="jy-ai-name">Gemini</span></button>' +
        '<button type="button" class="jy-ai-shortcut" data-ai="grok"><img class="jy-ai-icon" src="ai-icons/ai-grok.png" alt="Grok"><span class="jy-ai-name">Grok</span></button>' +
        '<button type="button" class="jy-ai-shortcut" data-ai="deepseek"><img class="jy-ai-icon" src="ai-icons/ai-deepseek.png" alt="DeepSeek"><span class="jy-ai-name">DeepSeek</span></button>' +
        '<button type="button" class="jy-ai-shortcut" data-ai="kimi"><img class="jy-ai-icon" src="ai-icons/ai-kimi.png" alt="Kimi"><span class="jy-ai-name">Kimi</span></button>' +
        '<button type="button" class="jy-ai-shortcut" data-ai="doubao"><img class="jy-ai-icon" src="ai-icons/ai-doubao.png" alt="豆包"><span class="jy-ai-name">豆包</span></button>' +
        '<button type="button" class="jy-ai-shortcut" data-ai="metaai"><img class="jy-ai-icon" src="ai-icons/ai-metaai.png" alt="Meta AI"><span class="jy-ai-name">Meta AI</span></button>' +
        '<button type="button" class="jy-ai-shortcut" data-ai="copilot"><img class="jy-ai-icon" src="ai-icons/ai-copilot.png" alt="Copilot"><span class="jy-ai-name">Copilot</span></button>' +
        '<button type="button" class="jy-ai-shortcut" data-ai="perplexity"><img class="jy-ai-icon" src="ai-icons/ai-perplexity.png" alt="Perplexity"><span class="jy-ai-name">Perplexity</span></button>' +
      '</div>' +
      '<div class="jy-ex-foot">選擇 AI 會開啟新分頁；請在對話框貼上並送出。</div>';

    var manual=document.createElement('details');manual.className='jf-manual-copy';
    var summary=document.createElement('summary');summary.textContent='無法自動複製？顯示完整文字';
    var manualText=document.createElement('textarea');manualText.value=prompt;manualText.readOnly=true;manualText.setAttribute('aria-label','本次完整解讀提示詞');
    manual.appendChild(summary);manual.appendChild(manualText);card.appendChild(manual);

    var btn = card.querySelector('.jy-ex-btn');
    btn.addEventListener('click', function () { copyText(prompt, btn); });

    // 牌義來源固定為 Golden Dawn Book T，無切換入口。

    // ★ v76：AI 快捷鍵 — 複製＋開啟對應 AI
    var aiUrls = {
      chatgpt: 'https://chatgpt.com/',
      claude: 'https://claude.ai/new',
      gemini: 'https://gemini.google.com/app',
      grok: 'https://grok.x.ai/',
      deepseek: 'https://chat.deepseek.com/',
      kimi: 'https://kimi.moonshot.cn/',
      doubao: 'https://www.doubao.com/',
      metaai: 'https://www.meta.ai/',
      copilot: 'https://copilot.microsoft.com/',
      perplexity: 'https://www.perplexity.ai/'
    };
    var aiNames = {chatgpt:'ChatGPT',claude:'Claude',gemini:'Gemini',grok:'Grok',deepseek:'DeepSeek',kimi:'Kimi',doubao:'豆包',metaai:'Meta AI',copilot:'Copilot',perplexity:'Perplexity'};
    var shortcuts = card.querySelectorAll('.jy-ai-shortcut');
    for (var si = 0; si < shortcuts.length; si++) {
      (function(sbtn) {
        sbtn.addEventListener('click', function() {
          var ai = sbtn.getAttribute('data-ai');
          // Open during this user gesture. Waiting for clipboard permission
          // before opening can be blocked as a popup on mobile browsers.
          window.open(aiUrls[ai], '_blank', 'noopener,noreferrer');
          var label=sbtn.querySelector('.jy-ai-name');
          function restore(){setTimeout(function(){label.textContent=aiNames[ai]||ai;},2200);}
          function copied(){label.textContent='已複製，請貼上';restore();}
          function failed(){label.textContent='請先按複製';restore();}
          if(window.JYPromptPacket||(navigator.clipboard&&navigator.clipboard.writeText)){
            try{(window.JYPromptPacket?window.JYPromptPacket.copy(prompt):navigator.clipboard.writeText(prompt)).then(copied,failed);}catch(e){failed();}
          }else{copyText(prompt,btn);}

        });
      })(shortcuts[si]);
    }

    el.innerHTML = '';
    el.appendChild(card);
    if(window.JYNativeAnalysis&&rawPayload){var nativeKind=rawPayload.mode==='ootk'||rawPayload.ootkData?'ootk':tool;el.insertAdjacentHTML('beforeend',window.JYNativeAnalysis.render(nativeKind,rawPayload));}
    if(window.JYCinemaUI)window.JYCinemaUI.handoff(el);
    if(window.JYCinemaUI&&window.JYCinemaUI.results&&(tool==='tarot'||tool==='ootk'))window.JYCinemaUI.results(document.getElementById('step-tarot'),tool+'|'+prompt);
  }
  window.JY_renderExportPrompt = render;

  // ════════════════════════════════════════
  //  複製模式接線（無 worker / 無 API / 無付費）
  //  注意：prompt-export.js 必須在 tarot.js 之後載入，OOTK 覆寫才會生效
  // ════════════════════════════════════════

  // 塔羅複製入口：由 ai-analysis.js 的 _triggerTarotAI 早退呼叫
  window._jyTarotCopyMode = function () {
    var w = document.getElementById('tarot-ai-wrap');
    if (!w) return;
    w.style.display = '';
    try { var ow = document.getElementById('ootk-ai-wrap'); if (ow) ow.style.display = 'none'; } catch (e) {}
    try { window._jyActiveResultMode = 'tarot'; } catch (e) {}
    try { window._jyResultModes = window._jyResultModes || {}; window._jyResultModes.tarot = true; if (typeof _refreshAllNavs === 'function') _refreshAllNavs('tarot'); } catch (e) {}
    render('tarot', w);
  };

  // 紫微斗數複製入口：由首頁紫微流程完成排盤後呼叫
  window._jyZiweiCopyMode = function () {
    var w = document.getElementById('d-ziwei-reading') || document.getElementById('ai-deep-result') || document.getElementById('step-3');
    if (!w) return;
    try { window._jyActiveResultMode = 'ziwei'; } catch (e) {}
    render('ziwei', w);
  };

  // 梅花易數複製入口：由首頁梅花獨立流程呼叫
  window._jyMeihuaCopyMode = function () {
    var w = document.getElementById('mh-export-wrap') || document.getElementById('mh-result') || document.getElementById('step-1');
    if (!w) return;
    try { window._jyActiveResultMode = 'meihua'; } catch (e) {}
    render('meihua', w);
  };

  // 開鑰之法：複製模式由 tarot_upgrade.js 的 _triggerOOTKAI 源頭早退處理
  //   （該函數會在抽完牌後直接呼叫 JY_renderExportPrompt('ootk', wrap)）
  //   此處不再覆寫 window._ootkTriggerAI——因為 startOOTK 每次抽牌會動態重設它，覆寫擋不住。

})();
