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
