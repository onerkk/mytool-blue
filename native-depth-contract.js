(function(root){
  'use strict';
  const VERSION='20261005depth16';
  const A=x=>Array.isArray(x)?x:[];
  const valueAt=(o,path)=>{try{return path.split('.').reduce((v,k)=>v==null?undefined:v[k],o);}catch(_){return undefined;}};
  const present=v=>Array.isArray(v)?v.length>0:(v&&typeof v==='object')?Object.keys(v).length>0:(v!==undefined&&v!==null);
  const has=(o,path)=>present(valueAt(o,path));
  const common={
    synthesis:['先回答原題','再交代最強支持鏈','再交代最強反證／牽制','說明成立條件與會推翻結論的條件','時間題只使用已實算運期／候選時窗','最後才給行動建議'],
    forbidden:['不得把同源規則重複計票','不得把缺資料補成事實','不得把象徵直接當已發生事件','不得以單一吉凶指標蓋過完整作用網','不得把不同流派互相矛盾的表硬平均成唯一答案'],
    confidence:'結論強度只能來自本題有效證據的收斂程度；有關鍵缺項或流派衝突時降低確定度並明示。'
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
  function build(method,chart,analysis){
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
      evidence,
      readingOrder:p.order,
      synthesisOrder:common.synthesis,
      contradictionChecks:p.conflicts,
      forbiddenShortcuts:[...common.forbidden,...p.forbidden],
      confidencePolicy:common.confidence,
      methodOutputPolicy,
      missingRequiredEvidence:missing,
      unresolved:[...A(analysis?.unavailable),...evidence.filter(x=>!x.available).map(x=>x.label+'：'+x.reason)],
      sourcePolicy:'來源必須綁定具名規則或profile；同源重複不當獨立驗證；原典互相矛盾時並列，不自行創造唯一版本。',
      outputPolicy:'每個主結論至少指出一條實算支持；若存在可改判的反證，同段交代。時間結論必須引用已算區間或明示只能給象徵時序。'+(method==='ootk'?' OOTK 不得把方法邊界誤寫成沒有答案：界線限制的是事實宣稱，不是盤面方向性推論。':'')
    };
  }
  function toPrompt(c){if(!c)return'';const rows=c.evidence.map(x=>`${x.status==='not-applicable'?'不適用':x.available?'✓':'缺'}${x.label}${!x.available&&x.reason?'（'+x.reason+'）':''}`).join('、');return [
    `【深度判讀契約 ${c.version}｜${c.profile}】`,
    `閱讀範圍狀態：${c.status}。`,
    `必核證據：${rows}。`,
    `判讀順序：${c.readingOrder.join(' → ')}。`,
    `合成順序：${c.synthesisOrder.join(' → ')}。`,
    c.contradictionChecks.length?`流派／反證規則：${c.contradictionChecks.join('；')}。`:'',
    `禁止捷徑：${c.forbiddenShortcuts.join('；')}。`,
    `置信規則：${c.confidencePolicy}`,
    c.methodOutputPolicy?`本法輸出契約：${[c.methodOutputPolicy.fiveLayerRequirement,c.methodOutputPolicy.synthesisRequirement,c.methodOutputPolicy.attributionBoundary,c.methodOutputPolicy.pendingValidationBoundary].join('；')}\n必要成稿段落：${A(c.methodOutputPolicy.requiredSections).join(' → ')}`:'',
    '完整性界線：通過只代表本次具名方法的已實算範圍可讀，不代表全部歷史流派已實作或事件已被證實。',
    c.missingRequiredEvidence.length?`必要缺項：${c.missingRequiredEvidence.join('、')}；不得補造。`:'',
    A(c.unresolved).length?`本引擎明列未決：${c.unresolved.join('；')}。`:''
  ].filter(Boolean).join('\n');}
  function summary(c){return c?{version:c.version,status:c.status,allSchoolsComplete:false,missing:c.evidence.filter(x=>!x.available).map(({label,status,reason})=>({label,status,reason})),scope:'只指本次具名方法已實算範圍；判讀主線、支持與反證及禁則合讀前文。'}:null;}
  root.JYNativeDepthContract=Object.freeze({version:VERSION,profiles:P,build,toPrompt,summary});
})(typeof window==='undefined'?globalThis:window);
