// BEGIN GENERATED WORKFLOW
/* Local answer planning and review. No network, random draws or chart mutation. */
(function installReadingWorkflow(root){
  'use strict';
  var VERSION='1.0.0';
  // Reinstallation is stateless and keeps direct CommonJS imports usable even
  // after an embedded standalone copy has populated the global API.
  var FOOTER='[靜月之光蝦皮賣場](https://shopee.tw/a50h95648d?tab=shop)\n願你諸事順遂。';
  var METHODS={
    tarot:{name:'塔羅',basis:'實際牌位、方向及相互作用',path:'結果與阻礙先定方向，原因和行動位解釋怎樣改變條件；非時間牌位保留原功能。'},
    ootk:{name:'開鑰之法',basis:'完成輪次、代表牌、實際計數與配對',path:'各有效操作先成判，再以真正改變主題的轉折串連；停止紀錄只回答程序與可採取的實務下一步。'},
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
    personality:{name:'人格',basis:'原始四柱與十神通路、模型摘要和本人經驗',path:'由有力結構提出行為假設，分長處與負荷代價，給可用實際經驗驗證的小練習。'}
  };
  var GOALS={
    help:{name:'做法／幫助',opening:'第一段直接給最值得先做的1～2件事，以及為什麼先做；把具體開口方式或第一步說出來。',body:'後續各段說明：你可調整哪一環、對方或環境需配合什麼、什麼反應表示有效。'},
    compare:{name:'比較／決策',opening:'第一段依本題重點選出較支持的方案及代價；證據不能分高下時，明說決勝條件。',body:'用同一標準比較各方案，區分短期收益、持續成本與成立條件；保留原選項。'},
    timing:{name:'時機／發展',opening:'第一段先說可判的時間範圍與發展方向，或目前欠缺的必要條件。',body:'分開原局條件、當前觸發和可觀察進展；盤上時間分界與現實事件日期分開。'},
    explain:{name:'原因／結構',opening:'第一段直接點出最有依據的核心卡點及它如何影響原問題。',body:'用2～4組依據解釋支持、牽制和調節通道，最後給一個可打斷循環的做法。'},
    direction:{name:'傾向／是否',opening:'第一段回答較支持的方向、程度及主要條件；能判傾向就不平均羅列所有可能。',body:'區分注意、意願、行動、承諾和持續的證據；不同層面不能互相代答。'},
    general:{name:'整體／開放題',opening:'第一段先整理本題最有影響的主軸與優先順序，讓使用者知道現在重點在哪。',body:'圍繞原問句展開，各子題先回答；全盤供判斷，只引用改變答案的關係。'}
  };
  function kinds(input){
    var a=Array.isArray(input)?input:[input||'tarot'];
    return Array.from(new Set(a.map(function(k){return k==='western'?'astro':k==='chart'?'bazi':k;}))).filter(function(k){return !!METHODS[k];});
  }
  function goal(q){
    if(/比較|哪個|哪一|何者|還是|二選|三選|選擇|該不該|要不要/.test(q))return 'compare';
    if(/如何|怎麼|怎樣|該怎|幫助|幫忙|做什麼|做甚麼|改善|修復|處理|應對/.test(q))return 'help';
    if(/何時|什麼時候|甚麼時候|多久|哪年|哪月|時機/.test(q))return 'timing';
    if(/為什麼|為何|原因|結構|卡點|挑戰|問題在哪/.test(q))return 'explain';
    if(/會不會|能不能|可不可以|是否|有沒有|能否|嗎|會否/.test(q))return 'direction';
    return 'general';
  }
  function plan(options){
    options=options||{};
    var q=String(options.question||'').trim(),ids=kinds(options.methods||options.method);
    if(!ids.length)throw new Error('沒有有效的命理方法，無法整理本題');
    var disease=/躁鬱|双相|雙相|bipolar|憂鬱症|抑鬱症|精神疾病|思覺失調|糖尿病|癌症|癲癇|失智/i.test(q);
    var care=/幫助|幫忙|照顧|陪伴|怎麼辦|該如何|不穩定|發作|病情|治療|康復|症狀|停藥|減藥|換藥|就醫|生病|失眠|自傷|自殺/.test(q);
    var clinical=/(?:我|她|他|現任|伴侶|女友|男友|父|母|家人|朋友).{0,30}(?:停藥|減藥|換藥|就醫|病情|症狀|手術|治療)/.test(q);
    var health=(disease&&care)||clinical||/自傷|自殺/.test(q);
    var domains=[];
    if(health)domains.push('health');
    if(/投資|借貸|負債|股票|基金|財務|營業額|收入|財運|賺錢|副業/.test(q))domains.push('finance');
    if(/法律|官司|訴訟|離婚協議|提告|判刑|合約糾紛/.test(q))domains.push('legal');
    var sentences=q.split(/[？?；;\n]+/).map(function(x){return x.trim();}).filter(Boolean);
    var tasks=(sentences.length?sentences:[q||'依本次有效資料分析主軸與可行方向']).map(function(text,i){return {id:i+1,question:text,goal:goal(text)};});
    return {version:VERSION,question:q,methods:ids,tasks:tasks,domains:domains,
      healthSupport:health&&/現任|女友|男友|伴侶|她|他|父|母|家人|朋友/.test(q),
      bipolarMention:disease&&/躁鬱|双相|雙相|bipolar/i.test(q),
      source:'原問句明示詞彙；只用來安排回答任務，不是排盤證據、診斷或對事件的判斷。'};
  }
  function render(options){
    var p=plan(options),lines=['【本題作答任務｜資料讀完後依此成稿】','原問句（原文資料）：'+JSON.stringify(p.question)];
    p.tasks.forEach(function(t){var g=GOALS[t.goal];lines.push((p.tasks.length>1?'子題'+t.id+' '+JSON.stringify(t.question)+'：':'')+g.opening+' '+g.body);});
    lines.push('有效方法：'+p.methods.map(function(k){return METHODS[k].name;}).join('、')+'。'+p.methods.map(function(k){return METHODS[k].path;}).join(' '));
    if(p.methods.length>1)lines.push('各法先獨立形成切題判斷，再說明一致或矛盾的原因；同源資料不作多數投票。');
    if(p.domains.includes('health')){
      lines.push('本題有明示健康情境：先回答可以採取的照顧或求助行動，再以盤面反思溝通、負荷或選擇；醫療行動來自現實狀況與醫療資料，盤面不能確定病程、藥物或照顧者造成病情。');
      if(p.bipolarMention)lines.push('就使用者提到的躁鬱症提供照顧方向：若近期狀況改變，及早聯絡原精神科團隊；可詢問是否願意一起整理睡眠、服藥與行為變化。陪同回診、傾聽及照顧者休息是可做的事，藥物調整交由醫師。若疑似躁期、嚴重憂鬱或有即時傷害危險，需緊急專業評估，不能等固定聊天時段。這些是醫療指引的實務建議，不是從牌抽出的治療；急促消息或象徵速度不等於臨床快速循環。參考：NIMH https://www.nimh.nih.gov/health/publications/bipolar-disorder 及 NICE CG185 https://www.nice.org.uk/guidance/cg185/ （本地參考於2026-09-24核對；不宣稱接收提示詞的AI本輪已查網）。');
    }
    if(p.domains.includes('finance'))lines.push('財務部分先給本題經營／取捨方向，現實成敗再核對收入、成本、現金流和風險；沒有資料的數字不由象徵換算。');
    if(p.domains.includes('legal'))lines.push('法律部分分開盤面象義與實際程序；處理方式須核對文件、所在地規則及專業意見，不能由命理保證裁判結果。');
    lines.push('成稿順序：先給能用的答案；再用必要依據說清為什麼、最大的牽制會改變哪部分；最後交代一個具體做法及檢查點。以「你可以先…，因為本盤…」承接，避免把中心、鏡像、格局或飛化逐項講成教學。具體互動未提供時，以「若實際出現…」作核對，不能寫成已發生。');
    lines.push('交稿前實際重讀成稿：首段是否已回答原題？每個主要結論是否有本次有效依據？反向訊號是否改變了判斷？同一依據是否反覆重講？行動能否執行且沒有承擔他人病情或意願？若不符，直接改寫正文後再交稿，不另輸出自評或檢核表。');
    lines.push('手鍊只在解答完成後以2～3句自然承接：一位佩戴者、一個明確設計、一項行動提醒與自選邀請；礦物不作醫療解法。最後原樣保留賣場連結及祝福。');
    return lines.join('\n');
  }
  function finish(prompt,options){
    var text=String(prompt||'');
    if(!text.trim())return text;
    // Only the exact application-owned final footer is moved; no source facts
    // or user-entered substrings are stripped or deduplicated.
    var end=text.lastIndexOf(FOOTER),tail=end>=0&&text.slice(end+FOOTER.length).trim()==='';
    return (tail?text.slice(0,end).trimEnd():text.trimEnd())+'\n\n'+render(options)+'\n\n'+(tail?FOOTER:'');
  }
  function review(options){
    options=options||{};
    var p=plan(options),answer=String(options.answer||'').trim(),evidence=options.evidence||{},issues=[];
    function issue(code,severity,message,excerpt){if(!issues.some(function(i){return i.code===code;}))issues.push({code:code,severity:severity,message:message,excerpt:excerpt||''});}
    if(!answer){issue('EMPTY_ANSWER','error','請貼上實際答案。');return {version:VERSION,status:'needs_revision',issues:issues,semanticVerification:'not_performed'};}
    var paragraphs=answer.split(/\n\s*\n/).filter(Boolean),first=paragraphs[0],sentences=answer.match(/[^。！？!?\n]+[。！？!?]?/g)||[];
    if(/(?:先看|先核|鏡射|鏡像|\d\s*[↔→]\s*\d|中心.{0,8}(?:位置|牌)|本次牌陣)/.test(first)&&!/(?:你可以先|建議你先|優先.{0,12}(?:做|聯絡|安排|確認))/.test(first))issue('METHOD_FIRST','revision','開頭以技法說明代替答案；先寫本題主判或第一步。',first);
    var methodStarts=paragraphs.filter(function(x){return /^(?:先看|再看|接著看|開頭的|牌面上|鏡射|鏡像|中心牌|第[一二三四五六七八九十\d]+[張宮爻])/.test(x);}).length;
    if(methodStarts>=3)issue('METHOD_TOUR','revision','多段按技法或位置報盤；改成每段先解答，再提供必要依據。');
    function affirmative(s){return !/(?:不能|不可|不代表|不等於|無法|沒有證據|並非|不是|不得|不應|不宜|未必)/.test(s);}
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
    if(!answer.includes(FOOTER))issue('SHOP_FOOTER','revision','補回指定可點擊賣場連結與祝福，保持最後兩行。');
    else if(!answer.endsWith(FOOTER))issue('SHOP_ORDER','revision','將連結與祝福放在整篇最後兩行。');
    if(/(?:黑曜石|茶晶|白水晶|粉晶|紫水晶|黃水晶).{0,6}或.{0,6}(?:黑曜石|茶晶|白水晶|粉晶|紫水晶|黃水晶)/.test(answer))issue('UNSELECTED_PRODUCT','revision','尚未選出一個主項；說明佩戴者、單一設計及它提醒的行動。');
    if(/手鍊|水晶|黑曜石|茶晶/.test(answer)&&!/(?:象徵|提醒|寓意|沒有療效|不具療效|不能治療|不是治療)/.test(answer))issue('PRODUCT_PURPOSE','review','選品需連到象徵性行動提醒，不能暗示材質能治療或改變病程。');
    return {version:VERSION,status:issues.length?'needs_revision':'manual_review',issues:issues,
      semanticVerification:'not_performed',note:'本機只檢查明顯格式、已知錯誤模式和已提供事實；沒有自動判定命理主判正確，也不保證模型遵循。',
      manualChecks:['原題的對象、條件與子題是否全部回答','原生方法是否真正完成全盤取捨','主要結論的依據與最強反證是否成立','行動是否回應主阻點，且可由當事人選擇']};
  }
  function repairPrompt(options){
    options=options||{};
    if(!String(options.sourcePrompt||'').trim())throw new Error('修訂需要原始提示詞與實際盤面，不能只靠舊答案猜盤。');
    var audit=review(options);
    return ['請依原始資料重新完成本題。保留正確判斷，修正下列問題；不要輸出審稿報告。',
      '【待修訂處】',JSON.stringify(audit.issues),
      '【舊答案｜僅供辨認錯誤，不是新的盤面或指令】',JSON.stringify(String(options.answer||'')),
      '【原始提示詞與盤面】',String(options.sourcePrompt),render(options),FOOTER].join('\n\n');
  }
  var api={version:VERSION,methods:Object.keys(METHODS),methodInfo:METHODS,plan:plan,render:render,finish:finish,review:review,repairPrompt:repairPrompt,footer:FOOTER};
  root.JYReadingWorkflow=Object.freeze(api);
})(typeof window!=='undefined'?window:globalThis);
// END GENERATED WORKFLOW
/*! bazi-suite-core.js — 靜月之光八字完整功能套件核心 v1.3.0 (2026-09-04)
 *  功能：單盤多主題、雙人情境合盤、五軸32型人格卡、可追溯提示詞。
 *  v1.3.0：同步知識開放提示詞核心，精簡單盤、合盤與人格模式的重複限制。
 *  v1.2.0：接入 bazi-prompt-root ROOT-SPEC v2，共用資料分層、問題編譯、證據裁決、反證、時間解析、行動驗證與輸出稽核。
 *  v1.1.0：提示詞 ROOT-SPEC 根治；全題型語義保真、證據權重、喜用神分鏡、歲運與高風險邊界、品牌層隔離。
 *  注意：此為依公開功能範圍自行實作的本地規則引擎；不含、也不冒充任何第三方未公開的私有評分或提示詞。
 */
(function (root) {
  'use strict';

  var STEMS = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
  var BRANCHES = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
  var STEM_EL = {甲:'木',乙:'木',丙:'火',丁:'火',戊:'土',己:'土',庚:'金',辛:'金',壬:'水',癸:'水'};
  var BRANCH_EL = {子:'水',丑:'土',寅:'木',卯:'木',辰:'土',巳:'火',午:'火',未:'土',申:'金',酉:'金',戌:'土',亥:'水'};
  var YINYANG = {甲:'陽',乙:'陰',丙:'陽',丁:'陰',戊:'陽',己:'陰',庚:'陽',辛:'陰',壬:'陽',癸:'陰'};
  var GENERATES = {木:'火',火:'土',土:'金',金:'水',水:'木'};
  var CONTROLS = {木:'土',土:'水',水:'火',火:'金',金:'木'};
  var STEM_COMBINE = {'甲己':'土','乙庚':'金','丙辛':'水','丁壬':'木','戊癸':'火'};
  var CLASH = {子:'午',午:'子',丑:'未',未:'丑',寅:'申',申:'寅',卯:'酉',酉:'卯',辰:'戌',戌:'辰',巳:'亥',亥:'巳'};
  var SIX_COMBINE = {子:'丑',丑:'子',寅:'亥',亥:'寅',卯:'戌',戌:'卯',辰:'酉',酉:'辰',巳:'申',申:'巳',午:'未',未:'午'};
  var SIX_COMBINE_EL = {'子丑':'土','寅亥':'木','卯戌':'火','辰酉':'金','巳申':'水','午未':'火'};
  var HARM = {子:'未',未:'子',丑:'午',午:'丑',寅:'巳',巳:'寅',卯:'辰',辰:'卯',申:'亥',亥:'申',酉:'戌',戌:'酉'};
  var DESTRUCTION = {子:'酉',酉:'子',丑:'辰',辰:'丑',寅:'亥',亥:'寅',卯:'午',午:'卯',巳:'申',申:'巳',未:'戌',戌:'未'};
  var PUNISH_PAIRS = {'寅巳':'無恩之刑','巳申':'無恩之刑','申寅':'無恩之刑','丑戌':'恃勢之刑','戌未':'恃勢之刑','未丑':'恃勢之刑','子卯':'無禮之刑','卯子':'無禮之刑'};
  var SELF_PUNISH = {辰:true,午:true,酉:true,亥:true};
  var TRINES = [
    {branches:['申','子','辰'], element:'水', name:'申子辰三合水局'},
    {branches:['亥','卯','未'], element:'木', name:'亥卯未三合木局'},
    {branches:['寅','午','戌'], element:'火', name:'寅午戌三合火局'},
    {branches:['巳','酉','丑'], element:'金', name:'巳酉丑三合金局'}
  ];
  var DIRECTIONALS = [
    {branches:['亥','子','丑'], element:'水', name:'亥子丑三會水方'},
    {branches:['寅','卯','辰'], element:'木', name:'寅卯辰三會木方'},
    {branches:['巳','午','未'], element:'火', name:'巳午未三會火方'},
    {branches:['申','酉','戌'], element:'金', name:'申酉戌三會金方'}
  ];
  var PILLAR_LABEL = {year:'年柱',month:'月柱',day:'日柱',hour:'時柱'};
  var PILLAR_ORDER = ['year','month','day','hour'];
  var ELEMENTS = ['木','火','土','金','水'];
  var CHINESE_ZODIAC = {子:'鼠',丑:'牛',寅:'虎',卯:'兔',辰:'龍',巳:'蛇',午:'馬',未:'羊',申:'猴',酉:'雞',戌:'狗',亥:'豬'};

  var SCENARIOS = [
    {id:'marriage', name:'婚戀／婚姻', roleA:'甲方', roleB:'乙方', focus:'親密需求、承諾、夫妻宮、情緒與生活節奏、長期壓力及邊界', cautions:'請以雙方完整原局、跨盤作用和現實互動共同判斷婚戀走向。'},
    {id:'business', name:'事業合夥', roleA:'發起人／夥伴A', roleB:'夥伴B', focus:'決策權、風險偏好、財務責任、執行互補、分工與退出機制', cautions:'合夥判斷請結合盡職調查、契約、股權與財務審查。'},
    {id:'mother_in_law', name:'婆媳關係', roleA:'婆婆', roleB:'媳婦', focus:'家庭角色、權責邊界、照顧方式、生活規則與代際壓力', cautions:'十神與宮位請放回雙方性格、角色和實際互動中理解。'},
    {id:'best_friends', name:'閨蜜／摯友', roleA:'朋友A', roleB:'朋友B', focus:'信任、支持方式、社交節奏、競爭感、情緒承接與長期友誼', cautions:'比劫、刑害等訊號請與全局和現實行為交叉判斷。'},
    {id:'father_son', name:'父子關係', roleA:'父親', roleB:'兒子', focus:'規範、期待、獨立、權威、教養方式與成年後邊界', cautions:'父星、子女宮與官殺請結合雙方完整結構和生活階段判讀。'},
    {id:'mother_son', name:'母子關係', roleA:'母親', roleB:'兒子', focus:'保護、依附、情緒照顧、控制感、獨立與成年後邊界', cautions:'印星請結合全局強弱、角色與實際互動判讀。'},
    {id:'friendship', name:'一般朋友', roleA:'朋友A', roleB:'朋友B', focus:'溝通、互惠、距離感、資源交換、衝突修復與相處成本', cautions:'合沖請與雙方原局和可觀察行為共同判斷。'},
    {id:'boss_employee', name:'主管與部屬', roleA:'主管', roleB:'部屬', focus:'授權、回報、規則、績效壓力、溝通與權責不對稱', cautions:'職場判斷請結合勞動規範、績效資料與實際管理紀錄。'}
  ];

  var LENSES = {
    chart: {name:'純排盤', question:'請校核排盤事實，清楚列出四柱、藏干、十神、十二長生、納音、空亡、起運、大運與原局作用；不延伸具體人生事件。'},
    general: {name:'綜合命盤', question:'請從月令、日主根氣、全局制化、格局候選、扶抑、調候、大運與流年，給出平衡且可驗證的綜合判讀。'},
    career: {name:'事業方向', question:'請聚焦職涯結構、適合的工作模式、權責承擔、組織與自主性的取捨、升遷或轉型節奏，並給出具體方向。'},
    wealth: {name:'財富策略', question:'請聚焦財星、食傷生財、官殺與承擔能力、現金流風險、大運流年節奏，提出可執行的財務策略。'},
    love: {name:'感情婚姻', question:'請聚焦日支、財官十神、親密需求、界線與關係節奏，並結合大運流年分析關係主題與發展條件。'},
    annual: {name:'流年趨勢', question:'請以大運交界和立春流年區間，說明未來四個立春年度的主題、觸發、助力、風險與可驗證窗口。'}
  };

  function own(obj, key) { return Object.prototype.hasOwnProperty.call(obj || {}, key); }
  function uniq(arr) { return Array.from(new Set((arr || []).filter(Boolean))); }
  function pairKey(a, b) { return a + b; }
  function unorderedPairKey(a, b) { return [a,b].sort(function(x,y){return STEMS.indexOf(x)-STEMS.indexOf(y);}).join(''); }
  function hasAll(list, needed) { return needed.every(function(x){ return list.indexOf(x) >= 0; }); }
  function safeArray(x) { return Array.isArray(x) ? x : []; }
  function safeText(x, fallback) { return x == null || x === '' ? (fallback || '') : String(x); }
  function escapeLine(x) { return safeText(x).replace(/[\r\n]+/g, ' ').trim(); }
  function fmtDate(x) { return safeText(x, '未提供'); }
  function promptSpec() {
    var spec=root.JY_BAZI_PROMPT_ROOT;
    if(!spec||typeof spec.rootProtocolLines!=='function')throw new Error('缺少 JS/bazi-prompt-root.js，無法生成八字證據提示詞');
    return spec;
  }

  function tenGod(dayMaster, targetStem) {
    var d = STEM_EL[dayMaster], t = STEM_EL[targetStem];
    if (!d || !t) return '—';
    var samePolarity = YINYANG[dayMaster] === YINYANG[targetStem];
    if (d === t) return samePolarity ? '比肩' : '劫財';
    if (GENERATES[d] === t) return samePolarity ? '食神' : '傷官';
    if (CONTROLS[d] === t) return samePolarity ? '偏財' : '正財';
    if (CONTROLS[t] === d) return samePolarity ? '七殺' : '正官';
    if (GENERATES[t] === d) return samePolarity ? '偏印' : '正印';
    return '—';
  }

  function elementRelation(fromEl, toEl) {
    if (!fromEl || !toEl) return {type:'unknown', label:'未知'};
    if (fromEl === toEl) return {type:'same', label:'同五行'};
    if (GENERATES[fromEl] === toEl) return {type:'generate', label:fromEl + '生' + toEl};
    if (GENERATES[toEl] === fromEl) return {type:'receive', label:fromEl + '受' + toEl + '所生'};
    if (CONTROLS[fromEl] === toEl) return {type:'control', label:fromEl + '剋' + toEl};
    if (CONTROLS[toEl] === fromEl) return {type:'controlled', label:fromEl + '受' + toEl + '所剋'};
    return {type:'neutral', label:'關係待審'};
  }

  function getPillars(chart) {
    var p = chart && chart.pillars || {};
    return PILLAR_ORDER.map(function(k){
      var x = p[k] || {};
      return {key:k, label:PILLAR_LABEL[k], gan:x.gan || '', zhi:x.zhi || ''};
    });
  }

  function chartSummary(chart, meta) {
    var p = getPillars(chart);
    if(meta && meta.unknown) return {name:meta.name||'',gender:chart&&chart.gender||'',birthLine:meta.birthLine||'',pillars:p.filter(function(x){return x.key!=='hour';}),dayMaster:chart&&chart.dm||'',dayMasterElement:chart&&chart.dmEl||'',unknownTime:true,provisional:true};
    var current = safeArray(chart && chart.dayun).find(function(x){return x && x.isCurrent;}) || null;
    return {
      name: meta && meta.name || '',
      gender: chart && chart.gender || meta && meta.gender || '',
      birthLine: meta && meta.birthLine || '',
      trueSolarDateTime: meta && meta.solarInfo && meta.solarInfo.trueSolarDateTime || '',
      pillars: p,
      pillarText: p.map(function(x){return x.gan + x.zhi;}).join('　'),
      dayMaster: chart && chart.dm || (p[2] && p[2].gan) || '',
      dayMasterElement: chart && chart.dmEl || STEM_EL[(p[2] && p[2].gan) || ''] || '',
      strength: chart && chart.strongLevel || '',
      elementWeights: chart && chart.ep || {},
      favorable: safeArray(chart && chart.fav),
      unfavorable: safeArray(chart && chart.unfav),
      stance: chart && chart.wuxingStance || null,
      qiyun: chart && chart.qiyun || null,
      currentLuck: current,
      interactions: safeArray(chart && chart.branchInteractions),
      stemCombinations: safeArray(chart && chart.tianGanHe),
      chineseZodiac: CHINESE_ZODIAC[(p[0] && p[0].zhi) || ''] || '',
      chenggu: chart && chart.chenggu || null,
      auxiliary: {mingGong:chart&&chart.mingGong||null,taiYuan:chart&&chart.taiYuan||null,taiXi:chart&&chart.taiXi||null,shenGong:chart&&chart.shenGong||null,kongwang:safeArray(chart&&chart.kongwang)},
      unknownTime: !!(meta && meta.unknown)
    };
  }

  function stemCrossRelations(chartA, chartB, options) {
    options=options||{};
    var pa = getPillars(chartA), pb = getPillars(chartB), out = [];
    pa.forEach(function(a){
      pb.forEach(function(b){
        if ((options.unknownA&&a.key==='hour')||(options.unknownB&&b.key==='hour')) return;
        if (!a.gan || !b.gan) return;
        var rel = elementRelation(STEM_EL[a.gan], STEM_EL[b.gan]);
        var ck = STEM_COMBINE[pairKey(a.gan,b.gan)] || STEM_COMBINE[pairKey(b.gan,a.gan)] || null;
        var same = a.gan === b.gan;
        if (ck) {
          out.push({type:'天干五合', typeCode:'STEM_COMBINATION', aPillar:a.key, bPillar:b.key, aStem:a.gan, bStem:b.gan, candidateElement:ck, transformationStatus:'待審', description:'A'+a.label+a.gan+'與B'+b.label+b.gan+'構成天干五合，傳統化神候選'+ck+'；只確認配對，不直接判定合化。'});
        } else if (same || rel.type !== 'neutral') {
          out.push({type:same?'同干':'天干生剋', typeCode:same?'SAME_STEM':'STEM_ELEMENT_RELATION', aPillar:a.key, bPillar:b.key, aStem:a.gan, bStem:b.gan, relation:rel.type, description:'A'+a.label+a.gan+'與B'+b.label+b.gan+'：'+rel.label+'。'});
        }
      });
    });
    return out;
  }

  function branchPairRelation(a, b) {
    var rels = [];
    if (BRANCHES.indexOf(a)<0 || BRANCHES.indexOf(b)<0) return rels;
    if (a === b) {
      rels.push({type:'同支重疊', typeCode:'SAME_BRANCH', description:a+a+'同支重疊；表示相同主題容易被彼此放大，吉凶另審。'});
      if (SELF_PUNISH[a]) rels.push({type:'自刑候選', typeCode:'SELF_PUNISHMENT', description:a+a+'符合傳統自刑配對；不得直接推成心理或疾病結論。'});
    }
    if (CLASH[a] === b) rels.push({type:'六沖', typeCode:'CLASH', description:a+b+'六沖；先視為節奏、立場或生活方式的對立／變動訊號。'});
    if (SIX_COMBINE[a] === b) {
      var k = [a,b].sort(function(x,y){return BRANCHES.indexOf(x)-BRANCHES.indexOf(y);}).join('');
      var el = SIX_COMBINE_EL[k] || SIX_COMBINE_EL[a+b] || SIX_COMBINE_EL[b+a] || null;
      rels.push({type:'六合', typeCode:'SIX_COMBINATION', candidateElement:el, transformationStatus:'待審', description:a+b+'六合'+(el?'，傳統化神候選'+el:'')+'；配對存在不等於已合化，也可能呈現牽連或合絆。'});
    }
    if (HARM[a] === b) rels.push({type:'六害', typeCode:'HARM', description:a+b+'六害；先列為隱性牽制或期待落差的查表關係，強弱與吉凶另審。'});
    if (DESTRUCTION[a] === b) rels.push({type:'相破', typeCode:'DESTRUCTION', description:a+b+'相破；作為關係不穩或磨損的參考級訊號，不單獨定論。'});
    // Detect the pair in either display order; retain the traditional directed
    // edge separately. Swapping two people must not lose a relationship.
    var directed=PUNISH_PAIRS[a+b]?a+b:PUNISH_PAIRS[b+a]?b+a:null;
    if (directed) rels.push({type:'相刑', typeCode:'PUNISHMENT', traditionalDirection:directed, strengthClass:/子|卯/.test(directed)?'pair':'partial', description:a+b+'相刑（'+PUNISH_PAIRS[directed]+(/子|卯/.test(directed)?'':'，三刑未全')+'）；配對與傳統方向分列，不因A／B排序漏列，也不當成誰傷害誰。'});
    if(a!==b)TRINES.forEach(function(g){
      if(g.branches.indexOf(a)<0||g.branches.indexOf(b)<0)return;
      var mid=g.branches[1],hasMid=a===mid||b===mid;
      rels.push({type:hasMid?'半合':'拱合',typeCode:hasMid?'HALF_TRINE':'ARCH_TRINE',candidateElement:g.element,
        missingBranches:g.branches.filter(function(z){return z!==a&&z!==b;}),transformationStatus:'待審',interpretationScope:'CROSS_CHART_DISTRIBUTION_ONLY',
        description:a+b+(hasMid?'半合':'拱合')+g.element+'；'+(hasMid?'含中神的兩支配對，仍非完整三合局':'缺中神的虛拱參照')+'。跨盤不視為合化，也不能直接等同感情融洽。'});
    });
    return rels;
  }

  function branchCrossRelations(chartA, chartB, options) {
    options=options||{};
    var pa = getPillars(chartA), pb = getPillars(chartB), out = [];
    pa.forEach(function(a){
      pb.forEach(function(b){
        if ((options.unknownA&&a.key==='hour')||(options.unknownB&&b.key==='hour')) return;
        if (!a.zhi || !b.zhi) return;
        branchPairRelation(a.zhi,b.zhi).forEach(function(r){
          out.push(Object.assign({}, r, {
            aPillar:a.key, bPillar:b.key, aBranch:a.zhi, bBranch:b.zhi,
            description:'A'+a.label+a.zhi+'與B'+b.label+b.zhi+'：'+r.description
          }));
        });
      });
    });
    return out;
  }

  function crossGroupRelations(chartA, chartB, options) {
    options=options||{};
    var pa = getPillars(chartA), pb = getPillars(chartB);
    var all = pa.filter(function(x){return !(options.unknownA&&x.key==='hour');}).map(function(x){return {side:'A',pillar:x.key,branch:x.zhi};}).concat(pb.filter(function(x){return !(options.unknownB&&x.key==='hour');}).map(function(x){return {side:'B',pillar:x.key,branch:x.zhi};}));
    var branches = all.map(function(x){return x.branch;});
    var out = [];
    TRINES.concat(DIRECTIONALS).forEach(function(g, idx){
      if (!hasAll(branches,g.branches)) return;
      var participants = all.filter(function(x){return g.branches.indexOf(x.branch)>=0;});
      if (!participants.some(function(x){return x.side==='A';}) || !participants.some(function(x){return x.side==='B';})) return;
      out.push({
        type:idx<TRINES.length?'跨盤三合':'跨盤三會',
        typeCode:idx<TRINES.length?'CROSS_TRINE':'CROSS_DIRECTIONAL',
        branches:g.branches.slice(), element:g.element,
        participants:participants,
        transformationStatus:'待審',interpretationScope:'CROSS_CHART_DISTRIBUTION_ONLY',
        description:g.name+'所需三支分布於兩盤；這是跨盤分布參照，不是任何一方原局成局，不合併月令或五行力量。各自原局的成化另審。'
      });
    });
    return out;
  }

  function directionalTenGods(observerChart, partnerChart, options) {
    options=options||{};
    var dm = observerChart && observerChart.dm || (observerChart && observerChart.pillars && observerChart.pillars.day && observerChart.pillars.day.gan) || '';
    var hidden = partnerChart && partnerChart.cangGan || {};
    return getPillars(partnerChart).filter(function(p){return !(options.partnerUnknown&&p.key==='hour');}).map(function(p){
      var hs=safeArray(hidden[p.key]).map(function(stem){return {stem:stem,tenGod:tenGod(dm,stem)};});
      return {partnerPillar:p.key, partnerStem:p.gan, tenGod:tenGod(dm,p.gan), hidden:hs, description:'對命主'+dm+'而言，對方'+p.label+p.gan+'映射為'+tenGod(dm,p.gan)+(hs.length?'；該支藏干映射 '+hs.map(function(x){return x.stem+'＝'+x.tenGod;}).join('、'):'')+'。'};
    });
  }

  function elementComplement(chartA, chartB) {
    var epA = chartA && chartA.ep || {}, epB = chartB && chartB.ep || {};
    var favA = (chartA && chartA.wuxingStance && chartA.wuxingStance.xi) || safeArray(chartA && chartA.fav);
    var favB = (chartB && chartB.wuxingStance && chartB.wuxingStance.xi) || safeArray(chartB && chartB.fav);
    var jiA = (chartA && chartA.wuxingStance && chartA.wuxingStance.ji) || safeArray(chartA && chartA.unfav);
    var jiB = (chartB && chartB.wuxingStance && chartB.wuxingStance.ji) || safeArray(chartB && chartB.unfav);
    var dominantA = ELEMENTS.filter(function(e){return Number(epA[e]||0)>=25;});
    var dominantB = ELEMENTS.filter(function(e){return Number(epB[e]||0)>=25;});
    var supportA = dominantB.filter(function(e){return favA.indexOf(e)>=0;});
    var supportB = dominantA.filter(function(e){return favB.indexOf(e)>=0;});
    var loadA = dominantB.filter(function(e){return jiA.indexOf(e)>=0;});
    var loadB = dominantA.filter(function(e){return jiB.indexOf(e)>=0;});
    return {
      dominantA:dominantA, dominantB:dominantB,
      partnerMaySupportA:supportA, partnerMaySupportB:supportB,
      partnerMayLoadA:loadA, partnerMayLoadB:loadB,
      selectionRule:'僅將本系統相對權重達25%以上者列為偏強五行候選。',
      caveat:'此處只比較本系統的相對五行權重與扶抑候選，不代表對方本人等同某五行，也不能單獨定合不合。'
    };
  }

  function currentAndAnnual(chart,scope) {
    var dayun=safeArray(chart && chart.dayun),current = dayun.find(function(x){return x && x.isCurrent;}) || null;
    var ref=Number(chart&&chart._referenceTimestamp);
    var nowYear=referenceBaziYear(chart), byYear={};
    dayun.forEach(function(d){safeArray(d&&d.liuNian).forEach(function(y){
      if(!y)return;
      if(scope ? scope.mode!=='all'&&(y.year<scope.start||y.year>scope.end) : y.year<nowYear-1||y.year>nowYear+4)return;
      if(!byYear[y.year])byYear[y.year]=Object.assign({dayun:d.gz,segments:[]},y);
      var group=byYear[y.year],segment=Object.assign({dayun:d.gz},y);
      if(!group.segments.some(function(s){return s.dayun===segment.dayun&&s.periodStart===segment.periodStart;}))group.segments.push(segment);
    });});
    Object.keys(byYear).forEach(function(y){var g=byYear[y];g.segments.sort(function(a,b){return String(a.periodStart).localeCompare(String(b.periodStart));});if(g.segments.length>1)g.level='交運分段，須分別判讀';});
    var annual=Object.keys(byYear).map(Number).sort().map(function(y){return byYear[y];});
    return {currentLuck:current, annual:annual};
  }

  function luckSynchronization(chartA, chartB,scope) {
    var a = currentAndAnnual(chartA,scope), b = currentAndAnnual(chartB,scope), years = uniq(a.annual.map(function(x){return x.year;}).concat(b.annual.map(function(x){return x.year;}))).sort();
    return {
      aCurrent:a.currentLuck, bCurrent:b.currentLuck,
      years:years.map(function(y){
        var ay=a.annual.find(function(x){return x.year===y;})||null;
        var by=b.annual.find(function(x){return x.year===y;})||null;
        if(ay&&by&&JSON.stringify(ay.annualWindow)!==JSON.stringify(by.annualWindow))throw new Error('雙方立春年度瞬間不一致，請重新排盤。');
        return {year:y,window:(ay||by).annualWindow,a:ay,b:by,note:'以共同 UTC 立春區間比較；交運年各自保留分段。真太陽時的鐘面讀數可不同，不代表節氣發生於不同瞬間。'};
      })
    };
  }

  function spousePalaceRelation(chartA, chartB) {
    var a = chartA && chartA.pillars && chartA.pillars.day || {}, b = chartB && chartB.pillars && chartB.pillars.day || {};
    return {
      aDayPillar:(a.gan||'')+(a.zhi||''), bDayPillar:(b.gan||'')+(b.zhi||''),
      stemRelation:elementRelation(STEM_EL[a.gan],STEM_EL[b.gan]),
      branchRelations:branchPairRelation(a.zhi,b.zhi),
      caveat:'日柱與日支是合盤重點之一，但不能凌駕兩張完整命局、角色情境及現實相處。'
    };
  }

  function getScenario(id) { return SCENARIOS.find(function(x){return x.id===id;}) || SCENARIOS[0]; }

  function buildCompatibility(chartA, chartB, options) {
    options = options || {};
    if (!chartA || !chartB) throw new Error('合盤需要兩張完整命盤');
    verifiedBirthFacts(chartA,options.metaA);verifiedBirthFacts(chartB,options.metaB);
    if(chartA.calculationPolicy.referenceInstant!==chartB.calculationPolicy.referenceInstant)throw new Error('雙方八字參考時刻不一致，請重新排盤。');
    var scenario = getScenario(options.scenarioId || 'marriage');
    var unknownA=!!(options.metaA&&options.metaA.unknown), unknownB=!!(options.metaB&&options.metaB.unknown);
    var relationOptions={unknownA:unknownA,unknownB:unknownB};
    var stems = stemCrossRelations(chartA,chartB,relationOptions);
    var branches = branchCrossRelations(chartA,chartB,relationOptions);
    var groups = crossGroupRelations(chartA,chartB,relationOptions);
    var tensionTypes = {CLASH:true,HARM:true,DESTRUCTION:true,PUNISHMENT:true,SELF_PUNISHMENT:true};
    var supportTypes = {STEM_COMBINATION:true,SIX_COMBINATION:true,CROSS_TRINE:true,CROSS_DIRECTIONAL:true};
    var tension = branches.filter(function(x){return tensionTypes[x.typeCode];});
    var support = stems.concat(branches).concat(groups).filter(function(x){return supportTypes[x.typeCode];});
    var signal = support.length && tension.length ? '支持與張力並存' : support.length ? '支持／牽連訊號較多' : tension.length ? '磨合與邊界議題較多' : '明顯配對訊號較少，需回到十神與現實互動';
    return {
      version:'1.5.0', scenario:scenario,
      personA:chartSummary(chartA,options.metaA||{}),
      personB:chartSummary(chartB,options.metaB||{}),
      dayMasters:{aToB:elementRelation(chartA.dmEl||STEM_EL[chartA.dm],chartB.dmEl||STEM_EL[chartB.dm]), bToA:elementRelation(chartB.dmEl||STEM_EL[chartB.dm],chartA.dmEl||STEM_EL[chartA.dm])},
      spousePalace:spousePalaceRelation(chartA,chartB),
      directionalTenGods:{aViewsB:directionalTenGods(chartA,chartB,{partnerUnknown:unknownB}),bViewsA:directionalTenGods(chartB,chartA,{partnerUnknown:unknownA})},
      stemRelations:stems, branchRelations:branches, groupRelations:groups,
      elementComplement:(unknownA||unknownB)?{partnerMaySupportA:[],partnerMaySupportB:[],partnerMayLoadA:[],partnerMayLoadB:[],caveat:'時辰未知，喜忌與五行互補尚未定；保留三柱的跨盤互動。',provisional:true}:elementComplement(chartA,chartB),
      luckSynchronization:(unknownA||unknownB)?{aCurrent:null,bCurrent:null,years:[],provisional:true}:luckSynchronization(chartA,chartB),
      evidenceSummary:{signal:signal,supportCount:support.length,tensionCount:tension.length,neutralRule:'數量只作資料整理，不是配對分數或成功機率。'},
      uncertainty:{unknownTimeA:unknownA,unknownTimeB:unknownB,hourRelationsExcluded:unknownA||unknownB,luckTimingProvisionalA:unknownA,luckTimingProvisionalB:unknownB,note:(unknownA||unknownB)?'未知時辰一方的時柱跨盤關係已排除；其精確起運、喜忌互補與歲運同步不作定論，已排除相關模型結果。':'雙方時辰已提供，仍須以出生資料準確性為前提。'},
      policy:{scenarioAware:true,roleAware:true,noSingleScore:true,noAutomaticTransformation:true,noDeterministicEvents:true,excludeUnknownHourRelations:true}
    };
  }

  function pillarFactLines(chart, unknown) {
    var P = chart && chart.pillars || {}, gods=chart&&chart.gods||{}, cang=chart&&chart.cangGan||{}, cs=chart&&chart.cs||{}, ny=chart&&chart.nayinAll||{};
    return PILLAR_ORDER.filter(function(k){return !(unknown && k==='hour');}).map(function(k){
      var p=P[k]||{}, g=gods[k]||{};
      return '・'+PILLAR_LABEL[k]+'：'+(p.gan||'')+(p.zhi||'')+'；天干十神 '+safeText(g.gan,'—')+'；藏干 '+safeArray(cang[k]).join('、')+'（'+safeArray(g.zhi).join('、')+'）；十二長生 '+safeText(cs[k],'—')+'；納音 '+safeText(ny[k],'—');
    });
  }

  function verifiedBirthFacts(chart,meta){
    if(!root.BAZI_CORE||typeof root.BAZI_CORE.birthFacts!=='function')throw new Error('時間核對元件版本不足，請重新整理後排盤。');
    return root.BAZI_CORE.birthFacts(chart,meta);
  }
  function birthFactLines(chart,meta){
    var f=verifiedBirthFacts(chart,meta);
    return ['【已核對的八字計算事實】',
      '原始民用：'+f.civilDateTime+'（'+(f.timezoneId||'UTC偏移 '+f.timezoneOffset)+'）；出生瞬間 UTC：'+(f.birthInstant||'時辰未知')+'。',
      '八字排盤時間：'+(f.chartDateTime||'時辰未知')+'；基準 '+f.chartTimeBasis+'；換日 '+f.dayBoundaryMode+'；時支 '+(f.hourBranch||'未定')+'。',
      '已核對四柱：'+f.pillars.map(function(p){return PILLAR_LABEL[p.key]+p.gz;}).join('、')+'。',
      '透干：'+f.exposedStems.map(function(g){return PILLAR_LABEL[g.pillar]+g.stem+'('+g.tenGod+')';}).join('、')+'；僅藏支而未透干：'+(f.hiddenOnlyStems.join('、')||'無')+'。',f.rule].join('\n');
  }
  function referenceBaziYear(chart){
    var instant=chart&&chart.calculationPolicy&&chart.calculationPolicy.referenceInstant;
    if(!instant||!root.BAZI_CORE)throw new Error('流年參考瞬間缺漏，請重新排盤。');
    return root.BAZI_CORE.getYearGanZhiAt(instant).year;
  }
  function periodLabel(period){return root.BAZI_CORE.periodLabel(period);}

  function interactionLines(chart) {
    var out = safeArray(chart && chart.branchInteractions).map(function(x){return '・'+safeText(x.type)+'：'+safeText(x.desc||x.description)+'；'+safeText(x.effect);});
    safeArray(chart && chart.tianGanHe).forEach(function(x){out.push('・天干五合：'+safeText(x.zh||x.pair)+'；合化狀態 '+safeText(x.transformationStatus,'待審'));});
    return out.length ? out : ['・未偵測到需特別列出的原局干支作用。'];
  }

  function luckLines(chart, limit) {
    return safeArray(chart && chart.dayun).filter(function(x){return x.gz && x.gz!=='小運';}).slice(0,limit||10).map(function(x){
      return '・'+x.gz+'：'+periodLabel(x)+'；干十神 '+safeText(x.god,'—')+'；支本氣十神 '+safeText(x.zGod,'—')+(x.isCurrent?' ★現行':'');
    });
  }

  function annualLines(chart, count) {
    var ref=Number(chart&&chart._referenceTimestamp), civilYear=Number.isFinite(ref)?new Date(ref).getUTCFullYear():new Date().getFullYear();
    var nowYear=referenceBaziYear(chart), byYear={};
    safeArray(chart&&chart.dayun).forEach(function(d){safeArray(d&&d.liuNian).forEach(function(y){if(y&&y.year>=nowYear){var group=byYear[y.year]||(byYear[y.year]=[]);if(!group.some(function(x){return x.dayun===d.gz&&x.periodStart===y.periodStart;}))group.push(Object.assign({dayun:d.gz},y));}});});
    return Object.keys(byYear).map(Number).sort().slice(0,count||5).map(function(year){return byYear[year].sort(function(a,b){return String(a.periodStart).localeCompare(String(b.periodStart));}).map(function(x){return '・'+year+' '+safeText(x.gz)+'（大運 '+safeText(x.dayun)+'；模型 '+safeText(x.level,'未標記')+'；區間 '+periodLabel(x)+'）';}).join('\n');});
  }

  function modelLines(chart, compact) {
    var ep=chart&&chart.ep||{}, stance=chart&&chart.wuxingStance||{}, th=chart&&chart.tiaohou||{};
    function modelText(value){return value&&typeof value==='object'?JSON.stringify(value):safeText(value,'未提供');}
    var ge=chart&&chart.zhengGe;
    if(ge){ge={geName:ge.geName,isSpecial:!!ge.isSpecial,patternType:ge.patternType||null,patternTenGod:ge.patternTenGod||null,patternStem:ge.patternStem||null,geGod:ge.geGod,geGan:ge.geGan,touChu:ge.touChu,benQiGod:ge.benQiGod,monthMainQiStem:ge.monthMainQiStem||null,monthMainQiTenGod:ge.monthMainQiTenGod||null};}
    return [
      '日主 '+safeText(chart&&chart.dm)+'（'+safeText(chart&&chart.dmEl)+'），本系統旺衰候選：'+safeText(chart&&chart.strongLevel,'未判定')+'；自黨相對分 '+safeText(chart&&chart.selfPts,'—')+'。',
      '五行相對權重：'+ELEMENTS.map(function(e){return e+safeText(ep[e],0)+'%';}).join('、')+'。此為本模型內比較，不是古籍固定比例或科學測量。',
      '扶抑立場：'+safeText(stance.summary, '喜候選 '+safeArray(chart&&chart.fav).join('、')+'；忌候選 '+safeArray(chart&&chart.unfav).join('、'))+'。',
      '月令格局候選：'+modelText(ge)+'。特殊格局的格局核心與月支本氣十神已分欄；一般格局的格神、相神與成敗救應仍須回到透藏根氣。touChu 為空時不能宣稱月令藏干已透。格局用神與扶抑用神分義。',
      '官殺辨析：'+modelText(chart&&chart.guanShaMix)+'。',
      '核心扶抑與調候：'+(typeof root.baziCoreAnalysisLines==='function'?root.baziCoreAnalysisLines(chart).join('\n'):modelText(chart&&chart.fuyiAssessment))+'。',
      '合化判別：'+(typeof root.baziHuaQiLines==='function'?root.baziHuaQiLines(chart).join('\n'):modelText(chart&&chart.huaQiAssessments))+'。',
      '病藥模型：'+modelText(chart&&chart.medicineGod)+'；通關模型：'+modelText(chart&&chart.relayGod)+'。未提供的模型不可補造。',
      '調候鏡頭：候選五行 '+safeArray(th.need).join('、')+'；'+safeText(th.detail)+(th.sourceUrl?'；校對來源 '+th.sourceUrl:'')+'。調候與扶抑分開，不自動互相覆蓋。',
      '已計算特殊規則：'+specialRuleText(chart&&chart.specialRuleAssessment,compact)+'。',
      '其他特殊格局待判資料：'+(safeArray(chart&&chart.specialStructureCandidates).length?safeArray(chart.specialStructureCandidates).map(function(x){return modelText(x);}).join('、'):'無；以月令一般格局為主')+'。'
    ];
  }

  function specialRuleText(a,compact){
    if(!a)return '未提供';
    var selected=(a.rules||[]).filter(function(r){return !compact||r.status!=='not-established';});
    var sources=[],scopes=[],rows=selected.map(function(r){
      if(r.source&&sources.indexOf(r.source)<0)sources.push(r.source);if(r.scope&&scopes.indexOf(r.scope)<0)scopes.push(r.scope);
      return r.id+' '+r.name+'｜'+r.status+'｜'+(r.checks||[]).map(function(c){return (c.passed===true?'✓':c.passed===false?'×':'?')+c.condition+(c.evidence&&c.evidence.length?'（'+c.evidence.map(function(v){return v&&typeof v==='object'?JSON.stringify(v):String(v);}).join('、')+'）':'');}).join('；')+
        (r.scope?'；範圍'+(scopes.indexOf(r.scope)+1):'')+(r.variant?'；異說：'+r.variant:'');
    });
    // matched repeats whole rule objects; their IDs retain the relationship.
    return [a.version+'；'+a.policy,'命中：'+(a.matched||[]).map(function(r){return r.id;}).join('、'),a.ordinaryUsePolicy,rows.join('\n'),scopes.map(function(v,i){return '範圍'+(i+1)+'：'+v;}).join('\n'),compact?'未成立格局 '+(a.rules.length-selected.length)+' 項不展開；完整檢核保留在原始資料，未列者不可當作成立。':'','合化完整核對見上方「合化判別」，不重複列出同一份資料。','來源：'+sources.join('；')].filter(Boolean).join('\n');
  }

  function promptScope(question,referenceYear){
    var q=root.JY_READING_QUALITY;
    return q&&q.timeScope?q.timeScope(question,referenceYear):{mode:'range',start:referenceYear,end:referenceYear+3};
  }
  function selectedAnnuals(chart,scope){
    var out=[];
    safeArray(chart&&chart.dayun).forEach(function(d){safeArray(d.liuNian).forEach(function(y){
      if(scope.mode!=='all'&&(y.year<scope.start||y.year>scope.end))return;
      if(!out.some(function(x){return x.year===y.year&&x.dayun===d.gz&&x.periodStart===y.periodStart;}))out.push(Object.assign({dayun:d.gz},y));
    });});
    return out.sort(function(a,b){return a.year-b.year||String(a.periodStart).localeCompare(String(b.periodStart));});
  }
  function buildChartDataBlock(chart, meta, options) {
    meta=meta||{};
    options=options||{};
    var verified=birthFactLines(chart,meta);
    if (meta.unknown) return [
      '【A. 三柱資料：時辰未知】',
      verified,
      '命主：'+escapeLine(meta.name||'未具名')+'・'+escapeLine(meta.birthLine||'出生日期未標示'),
      pillarFactLines(chart,true).join('\n'),
      '午時是暫排值，已排除時柱及其衍生模型、命宮、神煞和精確交運時間。請以三柱作有限分析；喜忌格局、合盤五行互補與人格卡若依賴暫排全盤，只列為待校時候選。',
      '日期若接近節氣或換日邊界，年月日柱也可能需要出生時間才能確認。'
    ].join('\n');
    var current=safeArray(chart&&chart.dayun).find(function(x){return x&&x.isCurrent;});
    var scope=options.scope||promptScope(options.question,referenceBaziYear(chart));
    var chosen=options.compact?selectedAnnuals(chart,scope):[];
    var decades=options.compact?safeArray(chart.dayun).filter(function(d){return d.isCurrent||chosen.some(function(y){return y.dayun===d.gz;});}):[];
    return [
      '【A. 排盤與曆法資料】',
      verified,
      '命主：'+escapeLine(meta.name||'未具名')+'・'+escapeLine(meta.genderLabel||chart&&chart.gender||'')+'・'+escapeLine(meta.birthLine||'出生資料未標示'),
      meta.solarInfo&&meta.solarInfo.trueSolarDateTime?'民用出生時間校正為真太陽時：'+meta.solarInfo.trueSolarDateTime+'；經度 '+safeText(meta.longitude)+'°；時區 '+safeText(meta.timezoneId||meta.solarInfo.timezoneId)+'。':'真太陽時資料未提供。',
      '出生瞬間（UTC）：'+safeText(chart&&chart.calculationPolicy&&chart.calculationPolicy.birthInstant,'未提供')+'；年、月柱在 UTC+8 核對節氣，日、時柱依本盤牆鐘；起運採分鐘折算法。',
      '排盤政策：換日 '+safeText(chart&&chart.calculationPolicy&&chart.calculationPolicy.dayBoundaryMode)+'；流年以立春為界；大運採半開區間 [起點,下一起點)。',
      meta.unknown?'時辰未知：目前以暫定時刻排盤，時柱、神煞、子女晚景象義及精確起運的把握度較低。':'',
      pillarFactLines(chart).join('\n'),
      (meta.unknown?'・暫定起運（以12:00暫排，精確交運把握度較低）：':'・起運：')+safeText(chart&&chart.qiyun&&chart.qiyun.startAgeText)+'；交運點 '+safeText(chart&&chart.qiyun&&(chart.qiyun.startUtc8||chart.qiyun.startDate))+'（UTC+8 民用時間）'+'；順逆 '+safeText(chart&&chart.qiyun&&chart.qiyun.direction)+'。',
      '・輔助資料：生肖 '+safeText(CHINESE_ZODIAC[chart&&chart.pillars&&chart.pillars.year&&chart.pillars.year.zhi],'—')+'；空亡 '+(chart&&chart.kongwang&&!Array.isArray(chart.kongwang)?'年柱 '+safeArray(chart.kongwang.year).join('、')+'；日柱 '+safeArray(chart.kongwang.day).join('、'):(safeArray(chart&&chart.kongwang).join('、')||'—'))+'；命宮 '+safeText(chart&&chart.mingGong&&(chart.mingGong.gan+chart.mingGong.zhi),'—')+'；胎元 '+safeText(chart&&chart.taiYuan&&(chart.taiYuan.gan+chart.taiYuan.zhi),'—')+'；八字重量 '+safeText(chart&&chart.chenggu&&chart.chenggu.display,'未計得')+'。稱骨、命宮、胎元、納音與神煞可作輔助視角，主判仍綜合月令與全局生剋。',
      '【原局干支作用——由核心唯一計算】',
      interactionLines(chart).join('\n'),
      '判讀提示：配對存在後仍需審成化條件；沖刑害破的方向結合所動之柱、十神、喜忌與歲運。',
      '【B. 前端流派模型（供交叉核對）】',
      modelLines(chart,options.compact).join('\n'),
      '【大運資料】',
      options.compact?decades.map(function(d){return '・'+d.gz+'：'+periodLabel(d)+'；干十神 '+d.god+'；支本氣十神 '+d.zGod+(d.isCurrent?' ★現行':'');}).join('\n'):luckLines(chart,10).join('\n'),
      current?'現行大運：'+current.gz+'，'+periodLabel(current)+'。':'現行大運未能判定。',
      options.compact?'【本題立春年度】':'【近五個立春年度】',
      options.compact?(chosen.map(function(x){return '・'+x.year+' '+x.gz+'（大運 '+x.dayun+'；區間 '+periodLabel(x)+'）';}).join('\n')||'所問年度超出本次已算資料，不能補造運限。'):annualLines(chart,5).join('\n')||'・近年流年資料未能取得。',
      '流年與大運等級只能當本模型內相對排序；刑沖合害只列觸發，不自動加減分。',
      '神煞只作末位輔助：'+safeArray(chart&&chart.shensha).join('、')+'。'
    ].filter(Boolean).join('\n');
  }

  function universalQuestionRootLines() {
    return promptSpec().rootProtocolLines();
  }

  function universalJudgmentRuleLines(mode) {
    var spec=promptSpec();
    return spec.universalRulesLines().concat(spec.domainRouterLines(mode||'single'));
  }

  function baziBrandTailLines(mode) {
    return promptSpec().brandTailLines(mode);
  }

  function buildSinglePrompt(lensId, chart, meta, userQuestion) {
    var lens=LENSES[lensId]||LENSES.general;
    return globalThis.JYReadingWorkflow.finish([
      '【角色】',
      promptSpec().roleText('single'),
      '【分析模式】'+lens.name,
      lens.question,
      '【使用者問題】',
      escapeLine(userQuestion||lens.question)
    ].concat(
      universalQuestionRootLines(),
      [buildChartDataBlock(chart,meta,{compact:lensId!=='chart',question:userQuestion||lens.question}),'【判讀規範】'],
      universalJudgmentRuleLines(lensId==='chart'?'chart':'single'),
      promptSpec().lensGuideLines(lensId),
      promptSpec().answerContractLines(lensId==='chart'?'chart':'single'),
      [
        '分析模式補充：純排盤模式聚焦資料校核；原局題以長期結構為主；歲運題引用資料中的交界；多選題使用一致標準比較。'
      ],
      baziBrandTailLines(lensId==='chart'?'chart':'single')
    ).join('\n\n'),{method:'bazi',question:userQuestion||lens.question});
  }

  function relationFacts(comp) {
    var s=comp.scenario;
    var lines=[];
    lines.push('情境：'+s.name+'；角色A＝'+s.roleA+'；角色B＝'+s.roleB+'。');
    lines.push('情境焦點：'+s.focus+'。');
    lines.push('日主五行互動：A→B '+comp.dayMasters.aToB.label+'；B→A '+comp.dayMasters.bToA.label+'。這是元素定義，不是誰付出、誰接受或誰更愛；方向不同時須分開解讀。');
    lines.push('日柱／夫妻宮：A '+comp.spousePalace.aDayPillar+'；B '+comp.spousePalace.bDayPillar+'；日干 '+comp.spousePalace.stemRelation.label+'。');
    safeArray(comp.spousePalace.branchRelations).forEach(function(x){lines.push('・日支作用：'+x.description);});
    safeArray(comp.stemRelations).filter(function(x){return x.typeCode==='STEM_COMBINATION'||(x.aPillar==='day'&&x.bPillar==='day');}).forEach(function(x){lines.push('・'+x.description);});
    safeArray(comp.branchRelations).forEach(function(x){lines.push('・'+x.description);});
    safeArray(comp.groupRelations).forEach(function(x){lines.push('・'+x.description);});
    if (!comp.branchRelations.length&&!comp.groupRelations.length) lines.push('・跨盤地支未偵測到需特別列出的合沖刑害破；不代表關係一定平淡或合適。');
    var c=comp.elementComplement;
    if(c.provisional){lines.push(c.caveat);return lines;}
    lines.push('五行互補候選：B較強五行中落入A喜候選＝'+(c.partnerMaySupportA.join('、')||'無明顯項')+'；A較強五行中落入B喜候選＝'+(c.partnerMaySupportB.join('、')||'無明顯項')+'。');
    lines.push('五行負荷候選：B較強五行中落入A忌候選＝'+(c.partnerMayLoadA.join('、')||'無明顯項')+'；A較強五行中落入B忌候選＝'+(c.partnerMayLoadB.join('、')||'無明顯項')+'。');
    lines.push(c.caveat);
    lines.push('跨盤資料不按吉凶筆數成判：先看各自全局、日支及切題作用；同一柱位配對的沖刑合破是同組關係，不能各算一份獨立證據。');
    return lines;
  }

  function buildCompatibilityDataBlock(comp,options) {
    options=options||{};
    var scope=promptScope(options.question,referenceBaziYear(comp._chartA));
    // Select from actual calculated years, not the default six-year UI preview.
    var sync=options.compact&&!comp.luckSynchronization.provisional?luckSynchronization(comp._chartA,comp._chartB,scope):comp.luckSynchronization;
    function window(w){if(!w)return null;return {start:w.startUtc8,endExclusive:w.endExclusiveUtc8,timeBasis:'UTC+08:00',interval:'[start,end)'};}
    function luck(d){if(!d)return null;return {gz:d.gz,ageStart:d.ageStart,ageEnd:d.ageEnd,window:window(d.window)};}
    function annual(d){if(!d)return null;return {gz:d.gz,
      segments:safeArray(d.segments).map(function(s){return {dayun:s.dayun,window:window(s.window)};})};}
    return ['【A方八字】',buildChartDataBlock(comp._chartA||{},comp._metaA||{},options),
      '【B方八字】',buildChartDataBlock(comp._chartB||{},comp._metaB||{},options),
      '【八字跨盤事實與候選模型】',relationFacts(comp).join('\n'),
      '【雙向十神映射】','aViewsB／bViewsA 是以該方日主計算的符號對照，並非任何人的主觀想法。七殺與正官皆須判實際制化，不能按名稱定壓力或信任。',JSON.stringify(comp.directionalTenGods),
      '【八字歲運同步】',JSON.stringify({aCurrent:luck(sync.aCurrent),bCurrent:luck(sync.bCurrent),
        timeRule:'所有區間為共同 UTC+8 民用時間；各方 segments 為與大運相交後的區間，不是不同的立春。',
        years:sync.years.map(function(x){return {year:x.year,annualWindow:window(x.window),a:annual(x.a),b:annual(x.b)};})}),
      '資料界線：'+comp.uncertainty.note].join('\n\n');
  }

  function buildCompatibilityPrompt(comp, userQuestion) {
    var s=comp.scenario;
    return globalThis.JYReadingWorkflow.finish([
      '【角色】',
      promptSpec().roleText('compatibility'),
      '【合盤情境】',
      s.name+'；A為'+s.roleA+'，B為'+s.roleB+'。請依此情境理解雙方角色、權責與互動方式。',
      '【使用者問題】',
      escapeLine(userQuestion||'請分析雙方在此情境下的契合、摩擦、溝通、長期壓力、支持方式、節奏與邊界。')
    ].concat(
      universalQuestionRootLines('compatibility'),
      [
        '【A方命盤】',
        buildChartDataBlock(comp._chartA||{},comp._metaA||{}),
        '【B方命盤】',
        buildChartDataBlock(comp._chartB||{},comp._metaB||{}),
        '【跨盤事實與模型整理】',
        relationFacts(comp).join('\n'),
        '資料可信度：'+safeText(comp.uncertainty&&comp.uncertainty.note,'未標示')+'。',
        '【雙向十神映射】',
        'A看B：'+comp.directionalTenGods.aViewsB.map(function(x){return PILLAR_LABEL[x.partnerPillar]+x.partnerStem+'＝'+x.tenGod+(x.hidden&&x.hidden.length?'（藏干 '+x.hidden.map(function(h){return h.stem+'＝'+h.tenGod;}).join('、')+'）':'');}).join('；')+'。',
        'B看A：'+comp.directionalTenGods.bViewsA.map(function(x){return PILLAR_LABEL[x.partnerPillar]+x.partnerStem+'＝'+x.tenGod+(x.hidden&&x.hidden.length?'（藏干 '+x.hidden.map(function(h){return h.stem+'＝'+h.tenGod;}).join('、')+'）':'');}).join('；')+'。',
        '十神映射有方向性；同一人對A與B可能呈現不同角色感受。',
        '【運勢同步】',
        'A現行大運：'+(comp.luckSynchronization.aCurrent?comp.luckSynchronization.aCurrent.gz+'（'+periodLabel(comp.luckSynchronization.aCurrent)+'）':'未判定')+'。',
        'B現行大運：'+(comp.luckSynchronization.bCurrent?comp.luckSynchronization.bCurrent.gz+'（'+periodLabel(comp.luckSynchronization.bCurrent)+'）':'未判定')+'。',
        comp.luckSynchronization.years.map(function(x){return '・'+x.year+'：A '+(x.a?x.a.gz+'／'+x.a.level:'無資料')+'；B '+(x.b?x.b.gz+'／'+x.b.level:'無資料')+'。';}).join('\n'),
        '【判讀規範】'
      ],
      universalJudgmentRuleLines('compatibility'),
      promptSpec().scenarioGuideLines(s.id),
      promptSpec().answerContractLines('compatibility'),
      [
        '合盤方法：先分析兩人各自原局，再讀A→B與B→A的十神方向、跨盤干支作用和歲運同步。',
        '回答請分清A方、B方與共同關係層，說明吸引、支持、摩擦、權責／界線、溝通修復、長期壓力、時間節奏與可執行協議。',
        '支持與張力的筆數只用來整理線索，不是配對分數。請依雙方全局與現實互動判斷；未知時辰已排除的喜忌、時柱與運勢同步不得補回。'+s.cautions
      ],
      baziBrandTailLines('compatibility')
    ).join('\n\n'),{methods:['compat','bazi'],question:userQuestion});
  }

  var PERSONALITY_CORES = [
    '靜域觀察者','深林規劃者','獨立鍛造者','邊界守望者',
    '明場推進者','群島協作者','破浪實作者','星火領航者'
  ];
  var PERSONALITY_VARIANTS = ['穩態版','流變版','共振版','破局版'];

  function godCounts(chart) {
    var out={比肩:0,劫財:0,食神:0,傷官:0,偏財:0,正財:0,七殺:0,正官:0,偏印:0,正印:0};
    var g=chart&&chart.gods||{};
    PILLAR_ORDER.forEach(function(k){
      var x=g[k]||{};
      if (own(out,x.gan)) out[x.gan]++;
      safeArray(x.zhi).forEach(function(v){if(own(out,v))out[v]++;});
    });
    return out;
  }

  function personalityAxes(chart) {
    var gc=godCounts(chart), p=getPillars(chart), yin=0,yang=0;
    p.forEach(function(x){if(YINYANG[x.gan]==='陽')yang++;else if(YINYANG[x.gan]==='陰')yin++;});
    var outward=(gc.食神+gc.傷官+gc.偏財+gc.正財), inward=(gc.偏印+gc.正印+gc.比肩+gc.劫財);
    var structured=(gc.正官+gc.七殺+gc.正印+gc.偏印), free=(gc.食神+gc.傷官+gc.比肩+gc.劫財);
    var relational=(gc.正財+gc.偏財+gc.正官+gc.正印+gc.比肩), selfLed=(gc.劫財+gc.傷官+gc.七殺+gc.偏印);
    var resilient=!!(chart&&(chart.strong===true||['中和','偏強','身強','太強'].indexOf(chart.strongLevel)>=0));
    var adaptive=yin>yang || safeArray(chart&&chart.branchInteractions).length>=2;
    return [
      {key:'energy',left:'內省',right:'外放',rightSelected:outward>inward,evidence:'輸出／財星訊號 '+outward+'，印比訊號 '+inward},
      {key:'order',left:'自主',right:'秩序',rightSelected:structured>=free,evidence:'官印訊號 '+structured+'，食傷比劫訊號 '+free},
      {key:'relation',left:'獨行',right:'協作',rightSelected:relational>selfLed,evidence:'關係導向訊號 '+relational+'，自我驅動訊號 '+selfLed},
      {key:'pressure',left:'敏感',right:'韌行',rightSelected:resilient,evidence:'旺衰候選 '+safeText(chart&&chart.strongLevel,'未判定')},
      {key:'rhythm',left:'穩態',right:'變通',rightSelected:adaptive,evidence:'陰干數 '+yin+'、陽干數 '+yang+'；原局作用 '+safeArray(chart&&chart.branchInteractions).length+' 項'}
    ];
  }

  function buildPersonality(chart, meta) {
    if(meta && meta.unknown) return {
      system:'靜月五軸人格',version:'1.1.0',independent:true,provisional:true,
      disclaimer:'出生時辰未知，五軸人格類型尚未確定。可先以三柱及實際行為整理問題，確認時辰後再檢視完整模型。這不是心理測驗或科學診斷。',
      index:null,code:'未定',name:'時辰待確認',traits:[],axes:[],strengths:[],
      watch:['暫排時柱可能改變十神比例與旺衰，不能據此貼上固定人格標籤。'],chart:chartSummary(chart,meta),
      natalEvidence:buildChartDataBlock(chart,meta,{compact:true,question:'原局人格與壓力反應'})
    };
    var axes=personalityAxes(chart), bits=axes.map(function(x){return x.rightSelected?1:0;}), idx=bits.reduce(function(a,b){return (a<<1)|b;},0);
    var coreIdx=(bits[0]<<2)|(bits[1]<<1)|bits[2], variantIdx=(bits[3]<<1)|bits[4];
    var code=(bits[0]?'E':'I')+(bits[1]?'S':'F')+(bits[2]?'C':'A')+(bits[3]?'T':'V')+(bits[4]?'M':'P');
    var traits=axes.map(function(x){return x.rightSelected?x.right:x.left;});
    var name=PERSONALITY_CORES[coreIdx]+'・'+PERSONALITY_VARIANTS[variantIdx];
    var strengths=[]; var watch=[];
    if(bits[0]) strengths.push('較容易把想法推到外部世界'); else strengths.push('擅長先觀察、整理再回應');
    if(bits[1]) strengths.push('重視規則、品質與可預期性'); else strengths.push('能自行定義方法並保持彈性');
    if(bits[2]) strengths.push('較會讀取互動與合作需求'); else strengths.push('獨立判斷與自我驅動較鮮明');
    if(bits[3]) strengths.push('承壓時較能維持推進'); else watch.push('高壓下可能需要更多恢復與安全邊界');
    if(bits[4]) strengths.push('面對變動時切換速度較快'); else strengths.push('能透過固定節奏累積成果');
    if(bits[0]&&bits[2]) watch.push('外部承諾過多時，可能分散自己的節奏');
    if(!bits[0]&&!bits[2]) watch.push('過度獨自消化時，需求可能不易被他人看見');
    if(bits[1]&&!bits[4]) watch.push('規則與穩定偏好過強時，可能降低試錯速度');
    if(!bits[1]&&bits[4]) watch.push('彈性很高時，需要額外建立收尾與紀錄機制');
    return {
      system:'靜月五軸人格', version:'1.0.0', independent:true,
      disclaimer:'此為本地自建的生日人格翻譯工具，不是 OpenFate BZTI，也未使用其未公開演算法。結果屬傳統命理語言的輕量自我觀察，不是心理測驗或科學診斷。',
      index:idx, code:code, name:name, traits:traits, axes:axes,
      strengths:uniq(strengths), watch:uniq(watch),
      chart:chartSummary(chart,meta||{}),
      natalEvidence:buildChartDataBlock(chart,meta||{},{compact:true,question:'原局人格與壓力反應'})
    };
  }

  function buildPersonalityPrompt(personality, userQuestion) {
    if(personality.provisional) return globalThis.JYReadingWorkflow.finish([
      '【角色】'+promptSpec().roleText('personality'),
      '【使用者問題】'+escapeLine(userQuestion||'如何理解自己的行為與壓力反應？'),
      personality.disclaimer,
      '【三柱參考】'+safeArray(personality.chart&&personality.chart.pillars).map(function(x){return x.label+' '+x.gan+x.zhi;}).join('；'),
      personality.natalEvidence||'',
      '先依三柱可支持的結構與當事人已提供的具體行為分析；將可觀察的傾向、反例與待確認部分說清楚。節氣或換日附近的三柱仍需核對。'
    ].concat(universalQuestionRootLines('personality'),universalJudgmentRuleLines('personality'),promptSpec().answerContractLines('personality'),baziBrandTailLines('personality')).join('\n\n'),{method:'personality',question:userQuestion});
    return globalThis.JYReadingWorkflow.finish([
      '【角色】'+promptSpec().roleText('personality'),
      '【系統聲明】'+personality.disclaimer,
      '【使用者問題】'+escapeLine(userQuestion||'請用易懂、可驗證、不貼死標籤的方式解讀這張人格卡。')
    ].concat(
      universalQuestionRootLines('personality'),
      [
        '【人格原局依據】',personality.natalEvidence||'舊人格紀錄未保存完整原局；先依已保留資料分析，完整制化需重新排盤。',
        '【人格卡】',
        personality.name+'｜代碼 '+personality.code+'｜五軸：'+personality.traits.join('／'),
        personality.axes.map(function(x){return '・'+x.left+'／'+x.right+'：選擇 '+(x.rightSelected?x.right:x.left)+'；依據 '+x.evidence+'。';}).join('\n'),
        '優勢候選：'+personality.strengths.join('；')+'。',
        '留意點：'+(personality.watch.join('；')||'無單一固定弱點，仍需看情境')+'。',
        '【分析重點】',
        '1. 第一段直接回答問題，再說明人格特質的正向表現、壓力表現與轉化方式。',
        '2. 每個主要特質請附可觀察行為、可能反例，以及會改變表現的情境。',
        '3. 問職涯、關係或壓力時，將人格卡與完整八字及現實資料交叉分析。'
      ],
      universalJudgmentRuleLines('personality'),
      promptSpec().answerContractLines('personality'),
      [
        '人格輸出補充：聚焦最有根據的特質，交代適用情境、優勢、風險、反例與可執行調整。'
      ],
      baziBrandTailLines('personality')
    ).join('\n\n'),{method:'personality',question:userQuestion});
  }

  function normalizeBaziString(input) {
    var chars=String(input||'').replace(/[\s,，、/|｜·・._-]+/g,'');
    if(chars.length!==8) throw new Error('四柱請輸入8個干支字，例如：戊寅己未己卯辛未');
    var pillars=[];
    for(var i=0;i<8;i+=2){
      var gan=chars.charAt(i),zhi=chars.charAt(i+1);
      if(STEMS.indexOf(gan)<0||BRANCHES.indexOf(zhi)<0) throw new Error('第'+(i/2+1)+'柱不是有效干支：'+gan+zhi);
      pillars.push(gan+zhi);
    }
    return {normalized:pillars.join(' '),compact:pillars.join(''),pillars:pillars};
  }

  function chartPillarStrings(fact) {
    if(!fact||!fact.pillars)return [];
    return PILLAR_ORDER.map(function(k){var x=fact.pillars[k]||{};return (x.gan||'')+(x.zhi||'');});
  }

  function samePrefix(got,target,count) {
    for(var i=0;i<count;i++)if(got[i]!==target[i])return false;
    return true;
  }

  function reverseHourRange(hour) {
    if(hour===23)return '23:00–23:59';
    if(hour===0)return '00:00–00:59';
    return String(hour).padStart(2,'0')+':00–'+String(hour+1).padStart(2,'0')+':59';
  }

  function reverseBaziToSolarTimes(options) {
    options=options||{};
    if(!root.BaziCalendarCore||!root.BaziCalendarCore.hasEngine()) throw new Error('缺少 lunar-javascript 曆法引擎');
    var parsed=normalizeBaziString(options.bazi), target=parsed.pillars;
    var startYear=Math.trunc(Number(options.startYear)),endYear=Math.trunc(Number(options.endYear==null?new Date().getFullYear():options.endYear));
    var limit=Math.max(1,Math.min(200,Math.trunc(Number(options.limit)||50)));
    var mode=options.dayBoundaryMode==='MIDNIGHT_00'?'MIDNIGHT_00':'ZI_HOUR_23';
    if(!Number.isFinite(startYear)||!Number.isFinite(endYear)||startYear<1||endYear<startYear)throw new Error('反查年份範圍無效');
    if(endYear-startYear>300)throw new Error('一次反查最多301個公曆年份，請縮小範圍');
    var calculate=root.BaziCalendarCore.calculateChart, candidateYears=[];
    for(var y=startYear;y<=endYear;y++){
      var jan=chartPillarStrings(calculate({year:y,month:1,day:15,hour:12,minute:0,second:0,dayBoundaryMode:mode}));
      var jul=chartPillarStrings(calculate({year:y,month:7,day:1,hour:12,minute:0,second:0,dayBoundaryMode:mode}));
      if((jan[0]===target[0]||jul[0]===target[0])&&candidateYears.indexOf(y)<0)candidateYears.push(y);
    }
    var matches=[],seen={},hours=[0,1,3,5,7,9,11,13,15,17,19,21];
    function exact(y,m,d,h){
      var fact=calculate({year:y,month:m,day:d,hour:h,minute:0,second:0,dayBoundaryMode:mode}),got=chartPillarStrings(fact);
      if(got.join('')!==target.join(''))return;
      var key=y+'-'+m+'-'+d+' '+h;
      if(seen[key])return;seen[key]=true;
      matches.push({year:y,month:m,day:d,hour:h,minute:0,datetime:y+'-'+String(m).padStart(2,'0')+'-'+String(d).padStart(2,'0')+' '+String(h).padStart(2,'0')+':00:00',hourRange:reverseHourRange(h),pillars:got.join(' '),dayBoundaryMode:mode,clockTimeOnly:true});
    }
    outer:for(var yi=0;yi<candidateYears.length;yi++){
      var year=candidateYears[yi],date=new Date(Date.UTC(year,0,1));
      while(date.getUTCFullYear()===year){
        var m=date.getUTCMonth()+1,d=date.getUTCDate();
        var at0=chartPillarStrings(calculate({year:year,month:m,day:d,hour:0,minute:0,second:0,dayBoundaryMode:mode}));
        var at12=chartPillarStrings(calculate({year:year,month:m,day:d,hour:12,minute:0,second:0,dayBoundaryMode:mode}));
        if(samePrefix(at0,target,3)||samePrefix(at12,target,3)){
          for(var hi=0;hi<hours.length;hi++){exact(year,m,d,hours[hi]);if(matches.length>=limit)break outer;}
        }
        exact(year,m,d,23);if(matches.length>=limit)break outer;
        date.setUTCDate(date.getUTCDate()+1);
      }
    }
    return {query:parsed.normalized,startYear:startYear,endYear:endYear,dayBoundaryMode:mode,limit:limit,matches:matches,note:'此反查只用民用鐘錶時間的四柱作候選搜尋；最終必須帶入出生城市經度、IANA時區與真太陽時重新排盤。時辰範圍內若跨節氣，仍需逐分鐘複核。'};
  }

  function reverseBaziToSolarTimesAsync(options,onProgress) {
    // 先以 Promise 讓 UI 有機會更新「運算中」；核心演算法已用年柱週期縮小候選年。
    return new Promise(function(resolve,reject){setTimeout(function(){try{onProgress&&onProgress({stage:'searching'});var r=reverseBaziToSolarTimes(options);onProgress&&onProgress({stage:'done',matches:r.matches.length});resolve(r);}catch(e){reject(e);}},20);});
  }

  function attachCompatibilityPrivate(comp, chartA, chartB, metaA, metaB) {
    Object.defineProperties(comp,{
      _chartA:{value:chartA,enumerable:false}, _chartB:{value:chartB,enumerable:false},
      _metaA:{value:metaA||{},enumerable:false}, _metaB:{value:metaB||{},enumerable:false}
    });
    return comp;
  }

  function createCompatibility(chartA, chartB, options) {
    options=options||{};
    return attachCompatibilityPrivate(buildCompatibility(chartA,chartB,options),chartA,chartB,options.metaA,options.metaB);
  }

  root.BaziSuiteCore = {
    version:'1.5.0',
    scenarios:SCENARIOS.slice(), lenses:Object.assign({},LENSES),
    constants:{stems:STEMS.slice(),branches:BRANCHES.slice(),stemElements:Object.assign({},STEM_EL),branchElements:Object.assign({},BRANCH_EL)},
    tenGod:tenGod, elementRelation:elementRelation, chartSummary:chartSummary,
    stemCrossRelations:stemCrossRelations, branchCrossRelations:branchCrossRelations, crossGroupRelations:crossGroupRelations,
    directionalTenGods:directionalTenGods, elementComplement:elementComplement, luckSynchronization:luckSynchronization,
    createCompatibility:createCompatibility, buildCompatibilityPrompt:buildCompatibilityPrompt,buildCompatibilityDataBlock:buildCompatibilityDataBlock,
    buildChartDataBlock:buildChartDataBlock, buildSinglePrompt:buildSinglePrompt,
    verifiedBirthFacts:verifiedBirthFacts,birthFactLines:birthFactLines,periodLabel:periodLabel,referenceBaziYear:referenceBaziYear,promptScope:promptScope,
    buildPersonality:buildPersonality, buildPersonalityPrompt:buildPersonalityPrompt,
    normalizeBaziString:normalizeBaziString, reverseBaziToSolarTimes:reverseBaziToSolarTimes, reverseBaziToSolarTimesAsync:reverseBaziToSolarTimesAsync,
    policy:{trueSolarTimePreferred:true,defaultDayBoundaryMode:'ZI_HOUR_23',annualBoundary:'LI_CHUN',luckInterval:'[start,end)',reverseLookupClockTimeOnly:true},
    personalityCatalog:(function(){var out=[];for(var i=0;i<32;i++){var c=PERSONALITY_CORES[(i>>2)&7]+'・'+PERSONALITY_VARIANTS[i&3];out.push({index:i,name:c});}return out;})()
  };
})(typeof window !== 'undefined' ? window : globalThis);
