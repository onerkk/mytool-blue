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
// BEGIN GENERATED READING JY_READING_MEIHUA
var JY_READING_MEIHUA = [
  "【白話優先】【像命理師當面解惑】使用繁體中文直接對提問者說話，先回答，再解釋：先答原問題。開頭2～3句給有依據的方向、真正卡點或優先行動；正文只呈現結論及必要依據，讓理由服務解答。\n單一複雜題通常用4～6段自然段落；簡單題簡答，多子題逐題先答。挑2～4組最有解釋力的已提供盤面資料，每段先說對提問者意味什麼，再以具體符號／結構說明如何落到原問題。段落按使用者要解決的事組織，方法資料留作判讀。\n【主判前核對】讀完整有效資料後才成判。交代最重要的牽制或相反訊號，說清它改變哪部分；同一訊號若對不同人物或方向作用相反，要分開說清。本命、當期觸發與條件走向分層，同源訊號不重複加權。依據相持就保留未定部分，完成其餘可判內容。替代讀法只有會實質改變答案時才簡短提出。\n把可核對的排盤／抽取事實、傳統方法的解釋、對個案的推論分清楚。具體情境未由使用者提供時，以「若實際出現…」提出核對，不能寫成已發生。象徵不證明病情、他人心念或事件；限制集中一次。醫療、法律、財務行動另依現實資料與專業依據，不冒稱由盤面證明。\n答案要落到現實：方法題說先做什麼及怎麼開口，結構題說最關鍵的一個循環，決策題比較相同標準，時間題只用已提供資料的精度。以1～3項可執行做法或觀察指標收束，指出什麼具體條件會支持、削弱或改變判斷。親密互動取得每位參與者明確、無壓力且可撤回的同意。\n成稿再讀一次：第一段是否已解答？主要結論是否有本次依據與反證？每段是否增加新答案？刪去重複講同一組訊號的段落；把「多溝通、給空間、步調不同」落實成誰、何事、如何做。先完成解答，最後才用短段落承接單一選品。",
  "【方法參考：供判讀，不是正文清單】只啟用本次有資料的方法；輸出依上述規則，方法說明不另設回答格式。",
  "【梅花：體用與本互變】核起卦法、保存時間、上下卦及動爻；動爻所屬經卦為用，另一卦為體。互卦上下與變後用卦都對原體，原體不重新設立。",
  "用生體、體生用、體克用、用克體、比和，配起卦節令旺衰看助力、付出、掌握、約束與協力是否有力，不能只數吉凶。",
  "本卦讀局勢，互卦讀中間牽動，動爻與變卦讀關鍵轉折；爻辭、類象和實際外應依本次起法與情境。正文用改變答案的轉折串成故事，不固定分五段講卦理。",
  "應期須有明示方法與時間尺度；實務檢查日與預測分開。一卦的本互變不是不同方案的各自抽卦，也不是多份獨立證據。",
  "【梅花判讀主線】以體的節令力量看當事人能否承擔，以用對體的實際生克判外在事情如何作用；體克用偏向需要自己掌握，體生用偏向投入耗力，用生體偏向有助力，用克體偏向受約束，比和偏向可協力，成色再由旺衰與全卦修正。先給目前宜推進、調整或等待的主判。",
  "互卦找過程中哪一端增加支持或負擔，變後的用對原體則看關鍵轉折後條件改善還是加重。將本、互、變連成「起初可用條件—中途關卡—調整後方向」，再以切題爻辭或已提供外應定位做法，交代要先解決哪件現實事情。"
];
// END GENERATED READING JY_READING_MEIHUA
// BEGIN GENERATED RECOMMENDATION JY_REC_MEIHUA
var JY_REC_MEIHUA = "【本題延伸手鍊建議】先完整回答問題，再用一小段自然對話推薦一款具體手鍊；理由須引用本次一項有效盤面發現，連到提問者真正面對的需要與可採取的行動。選品規則不得影響前面的占卜判斷，不先選商品再反推需求。只選一個主項，必要時才補一個替代，不列商品清單、不重講判讀步驟。\n材質或色系要符合本法資料與已知偏好；證據不足以指定礦物時，坦白說是依本題方向挑的象徵性提醒，仍給一個可辨認的設計建議，不編造使用者偏好、喜忌或信仰，也不把五行／星盤象徵說成身體實際缺少某種礦物。命理取象不代表礦物有療效，也不能保證改變事件；不捏造商品庫存、價格、成分、產地或認證。\n手鍊建議放在分析與行動之後，用2～3句自然承接：給誰佩戴、單一可辨認的材質或設計、它提醒的具體行動，再邀請有興趣者到靜月之光挑選喜歡的款式。這是自選的配戴建議，不是付費解法。若提問者提到預算吃緊或暫不想購買，先用現有物件承載同一提醒，不能勸借貸或暗示不買會錯失轉機。不可為導購加重凶象、製造恐懼，亦不宣稱購買就能復合、治病或改運。最後保留指定賣場連結及祝福。\n【本法選材提醒】\n梅花：依本互變、體用與旺衰連到本次應對；不把卦象當成終身八字喜忌。";
// END GENERATED RECOMMENDATION JY_REC_MEIHUA
/*! meihua-standalone.js — 靜月之光 梅花易數獨立流程  [v3.0.0]
 *  v3.0.0(2026/9/4)：提示詞保留本互變、體用旺衰、動爻、類象與應期資料，改由 AI 自身易學知識綜合判讀。
 *  v80.39(2026/6/12)：分享卡補爻線——payload 加 lines（本卦＝下上卦 li 串接、互卦取2-4/3-5爻、
 *    變卦＝動爻翻轉，與 calcMH 同式）與 dong；配合 share-card v2.2 直繪六爻卦象。
 *  v80.38(2026/6/12 歐那)：實測第二輪回饋三項根治——
 *    ①蝦皮連結改「犧牲行」結構：網址倒數第二行、最後固定一句收尾話墊後。兩輪實測輸出末端都黏不可見
 *      Unicode（U+2060 等），文獻證實為 AI 生成/渲染/剪貼簿管線副產物、提示詞原理上攔不住；雜訊永遠黏在
 *      輸出最末端，故網址不可當末行——收尾句當犧牲行吃掉雜訊，網址行保持乾淨可點。
 *    ②生剋力道：體克用/體生用補「用旺衰」雙向分支（鐵律③明言體用都要看，原版這兩支只看體；
 *      本輪實測「體囚剋用旺」只標出體弱、漏了用旺加重費勁）。
 *    ③動爻爻位參考行（《繫辭傳下》：初難知/二多譽/三多凶/四多懼/五多功/上易知）——實測輸出
 *      跳過動爻層位不讀，根因是資料區沒給；資料直給＋鐵律⑧納入主線。
 *  v80.37(2026/6/12 歐那)：應期正統化＋體用原文定性——
 *    ①應期參考《占卦訣》：先核實本卦中是否實見生體或克體三爻，再列相應卦氣候選；不直接換算現實日期。
 *      分開給最近窗，另給「用近／互中／變遠」層次；廢除「用卦五行→季節」應期法（非原典，僅保留為事情節奏參考）。
 *    ②鐵律②吉凶定性對齊《體用總訣》原文：體剋用＝諸事吉（原「小吉」會系統性壓低吉度）、用剋體＝諸事凶、
 *      體生用＝耗失之患、用生體＝進益之喜、比和＝百事順遂；鐵律⑦改吃資料區吉應／敗應、禁自創應期算法。
 *    ③生剋力道行中性化：移除「該收手別再貼」等預下結論句（曾與變卦轉好行互相打架），結論統一由鐵律合成。
 *    ④蝦皮連結改「獨立成行＋末字雙保險」（實測輸出曾在網址後黏不可見字元致連結失效；複製模式無法程式後處理，僅能強化指令）。
 *  v80.34(2026/6/10)：防線統一——⑩補盤外資訊禁令、選石補嚴禁並列（與八字/紫微同步，紫微未設防實測曾全面復發）
 *  v80.33(2026/6/10)：①互卦對體生剋資料行（體用總訣「他卦者，謂用互變也」——原本只給互卦名、要 AI 自己算，這次實測就漏了）②最近應期窗（斷占總訣寅卯木…辰戌丑未土，節氣近似換月）③完整性清單加「正文無指令字眼」④fallback 註解誠實化
 *  歐那 2026/6/6：梅花要跟雷諾曼一樣，自成一頁、乾淨、不出現其他入口、無多餘說明，並有自己的過場動畫。
 *  做法：完全比照 lenormand.js 的「自包覆獨立頁 + 組好提示詞複製去 AI」模式。
 *  引擎：直接呼叫既有全域 calcMH()（meihua_upgrade.js 已載入），不重造起卦邏輯。
 *  起卦法：時間起卦（預設，需 Lunar.Solar）／數字起卦（報上下數，加當下時辰定動爻）。
 *  只需部署本檔 + ui.js（_meihuaOpen 改接本檔）+ index.html（掛 script + 版本號）。
 */
(function () {
  'use strict';

  var GOLD = '#c9a84c';
  // 八卦顯示（先天序 1乾…8坤 對應 calcMH gByN）；符號供過場動畫用
  var BAGUA_SYM = ['☰','☱','☲','☳','☴','☵','☶','☷'];
  var BAGUA_NAME = ['乾','兌','離','震','巽','坎','艮','坤'];

  var AI_LIST = [
    {id:'chatgpt',name:'ChatGPT',url:'https://chatgpt.com/'},
    {id:'claude',name:'Claude',url:'https://claude.ai/new'},
    {id:'gemini',name:'Gemini',url:'https://gemini.google.com/app'},
    {id:'grok',name:'Grok',url:'https://grok.x.ai/'},
    {id:'deepseek',name:'DeepSeek',url:'https://chat.deepseek.com/'},
    {id:'kimi',name:'Kimi',url:'https://kimi.moonshot.cn/'},
    {id:'doubao',name:'豆包',url:'https://www.doubao.com/'},
    {id:'metaai',name:'Meta AI',url:'https://www.meta.ai/'},
    {id:'copilot',name:'Copilot',url:'https://copilot.microsoft.com/'},
    {id:'perplexity',name:'Perplexity',url:'https://www.perplexity.ai/'}
  ];

  // 用神（用卦）五行 → 事情節奏（v80.37 正統化：只定快慢性質、不再給應期月份——
  // 應期月份照《占卦訣》「事應於生體卦氣之日、敗於剋體卦氣之日」另行計算）
  var WX_TIMING = {
    木:'事情走「成長／推進」的節奏，速度中快',
    火:'事情走「曝光／情緒／主動」的節奏，速度快',
    土:'事情走「穩定／拖延／承擔」的節奏，速度慢',
    金:'事情走「決斷／切割／壓力」的節奏，速度中等',
    水:'事情走「流動／變數／等待」的節奏，速度慢'
  };

  var _mhWrap = null;
  var _mhPhase = 'input';   // input | result
  var _mhMethod = 'time';   // time | num | char
  var _mhQuestion = '';
  var _mhUpNum = '';        // 數字起卦：上數
  var _mhLoNum = '';        // 數字起卦：下數
  var _mhText = '';         // 漢字起卦：中文字
  var _mhResult = null;     // calcMH 回傳
  var _lastPrompt = '';
  var _castEpoch = 0;

  // ════════════════════════════════════════════════════════
  //  容器 + CSS（命名空間 mhx-，自帶不依賴 style.css）
  // ════════════════════════════════════════════════════════
  function _getWrap() {
    if (_mhWrap) return _mhWrap;
    _mhWrap = document.createElement('div');
    _mhWrap.id = 'mhx-screen';
    _mhWrap.style.cssText = 'display:none;position:fixed;top:0;left:0;right:0;bottom:0;width:100%;height:100%;z-index:99999;overflow-y:auto;overflow-x:hidden;background:#0a0a0f;-webkit-overflow-scrolling:touch;';
    document.body.appendChild(_mhWrap);
    var css = document.createElement('style');
    css.textContent = [
      '#mhx-screen *{box-sizing:border-box}',
      '.mhx-container{max-width:480px;margin:0 auto;padding:1rem .8rem 3rem;font-family:"Noto Serif TC",Georgia,serif;color:#e8e0d0}',
      '.mhx-header{text-align:center;padding:1.5rem 0 1rem}',
      '.mhx-header h1{font-size:1.5rem;color:'+GOLD+';letter-spacing:8px;margin-bottom:.3rem}',
      '.mhx-header p{font-size:.75rem;color:rgba(232,224,208,.5);letter-spacing:2px}',
      '.mhx-back{color:rgba(232,224,208,.5);text-decoration:none;font-size:.82rem;display:inline-block;margin-bottom:.5rem;cursor:pointer}',
      '.mhx-section{background:#13131a;border:1px solid rgba(201,168,76,.15);border-radius:14px;padding:1.1rem;margin-bottom:.8rem}',
      '.mhx-section-title{font-size:.82rem;color:'+GOLD+';margin-bottom:.7rem}',
      '.mhx-q-input{width:100%;padding:.65rem;border-radius:10px;border:1px solid rgba(201,168,76,.3);background:rgba(255,255,255,.03);color:#e8e0d0;font-family:inherit;font-size:.85rem;resize:none;outline:none;line-height:1.6}',
      '.mhx-q-input::placeholder{color:rgba(232,224,208,.4)}',
      '.mhx-q-input:focus{border-color:rgba(201,168,76,.5);box-shadow:0 0 12px rgba(201,168,76,.1)}',
      '.mhx-method-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:.4rem}',
      '.mhx-method-btn{padding:.6rem .4rem;border-radius:10px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.03);color:rgba(232,224,208,.5);cursor:pointer;transition:all .2s;text-align:center;font-family:inherit;font-size:.82rem}',
      '.mhx-method-btn.active{border-color:rgba(201,168,76,.5);background:rgba(201,168,76,.08);color:'+GOLD+'}',
      '.mhx-num-row{display:grid;grid-template-columns:1fr 1fr;gap:.5rem;margin-top:.7rem}',
      '.mhx-num-row input{width:100%;padding:.6rem;border-radius:10px;border:1px solid rgba(201,168,76,.3);background:rgba(255,255,255,.03);color:#e8e0d0;font-family:inherit;font-size:.95rem;text-align:center;outline:none}',
      '.mhx-num-row input:focus{border-color:rgba(201,168,76,.5)}',
      '.mhx-char-row{margin-top:.7rem}',
      '.mhx-char-row input{width:100%;padding:.6rem;border-radius:10px;border:1px solid rgba(201,168,76,.3);background:rgba(255,255,255,.03);color:#e8e0d0;font-family:inherit;font-size:1rem;text-align:center;outline:none;letter-spacing:2px}',
      '.mhx-char-row input:focus{border-color:rgba(201,168,76,.5)}',
      '.mhx-hint{font-size:.7rem;color:rgba(232,224,208,.45);margin-top:.6rem;line-height:1.6;text-align:center}',
      '.mhx-cast-btn{display:block;width:100%;padding:.85rem;border-radius:12px;border:1.5px solid rgba(201,168,76,.5);background:linear-gradient(135deg,rgba(201,168,76,.12),rgba(201,168,76,.04));color:'+GOLD+';font-family:inherit;font-size:.95rem;font-weight:600;letter-spacing:4px;cursor:pointer;transition:all .3s;margin-top:.8rem}',
      '.mhx-cast-btn:active{transform:scale(.97)}',
      // 卦象顯示
      '.mhx-gua-row{display:grid;grid-template-columns:repeat(3,1fr);gap:.5rem;margin:.4rem 0 .2rem}',
      '.mhx-gua{border:1px solid rgba(201,168,76,.22);border-radius:12px;background:linear-gradient(145deg,rgba(30,25,15,.9),rgba(20,15,10,.95));padding:.6rem .35rem;text-align:center;animation:mhxIn .45s ease-out both}',
      '@keyframes mhxIn{from{opacity:0;transform:translateY(12px) scale(.92)}to{opacity:1;transform:none}}',
      '.mhx-gua .role{font-size:.6rem;color:rgba(232,224,208,.45);letter-spacing:1px}',
      '.mhx-gua .gname{font-size:1.05rem;color:#ffeab8;font-family:"Noto Serif TC",serif;margin:.15rem 0 .05rem;line-height:1.2}',
      '.mhx-gua .gel{font-size:.62rem;color:'+GOLD+'}',
      '.mhx-ty{margin-top:.7rem;padding:.7rem .8rem;border-radius:11px;border:1px solid rgba(201,168,76,.2);background:rgba(201,168,76,.04);text-align:center}',
      '.mhx-ty .rel{font-family:"Noto Serif TC",serif;font-size:1rem;color:'+GOLD+';letter-spacing:2px}',
      '.mhx-ty .luck{display:inline-block;margin-left:.4rem;font-size:.72rem;padding:1px 8px;border-radius:999px;background:rgba(201,168,76,.15);color:#ffeab8}',
      '.mhx-ty .luck.bad{background:rgba(239,138,138,.14);color:#ef9a9a}',
      '.mhx-ty .desc{font-size:.74rem;color:rgba(232,224,208,.6);margin-top:.35rem;line-height:1.55}',
      '.mhx-dong{text-align:center;font-size:.7rem;color:rgba(232,224,208,.5);margin-top:.5rem}',
      // AI 卡（比照雷諾曼）
      '.mhx-ai-card{background:linear-gradient(135deg,rgba(30,25,15,.95),rgba(20,15,8,.98));border:1px solid rgba(201,168,76,.3);border-radius:14px;padding:1rem;margin-top:1rem;text-align:center;animation:mhxIn .6s ease-out}',
      '.mhx-ai-title{font-size:.95rem;color:'+GOLD+';letter-spacing:3px;margin-bottom:.5rem}',
      '.mhx-ai-desc{font-size:.72rem;color:rgba(232,224,208,.5);line-height:1.6;margin-bottom:.7rem}',
      '.mhx-ai-copy-btn{display:block;width:100%;padding:.75rem;border-radius:12px;border:1.5px solid rgba(201,168,76,.5);background:linear-gradient(135deg,rgba(201,168,76,.12),rgba(201,168,76,.04));color:'+GOLD+';font-family:inherit;font-size:.88rem;font-weight:600;letter-spacing:3px;cursor:pointer;transition:all .3s;margin-bottom:.5rem}',
      '.mhx-ai-copy-btn:active{transform:scale(.97)}',
      '.mhx-ai-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:.3rem;margin:.5rem 0}',
      '.mhx-ai-sc{display:flex;flex-direction:column;align-items:center;gap:.2rem;padding:.35rem .1rem;border-radius:10px;border:1px solid rgba(255,255,255,.06);background:rgba(255,255,255,.02);cursor:pointer;transition:all .2s;font-family:inherit}',
      '.mhx-ai-sc:active{transform:scale(.91)}',
      '.mhx-ai-sc img{width:30px;height:30px;border-radius:8px}',
      '.mhx-ai-sc span{font-size:.55rem;color:rgba(232,224,208,.5);font-weight:600}',
      '.mhx-ai-foot{font-size:.6rem;color:rgba(232,224,208,.4);margin-top:.3rem;font-style:italic}',
      '.mhx-reset-btn{display:inline-block;padding:.45rem 1rem;border-radius:10px;border:1px solid rgba(255,255,255,.1);background:transparent;color:rgba(232,224,208,.5);cursor:pointer;font-family:inherit;font-size:.78rem;margin-top:.8rem}',
      '.mhx-footer{text-align:center;font-size:.6rem;color:rgba(232,224,208,.4);margin-top:1.5rem;letter-spacing:1px;line-height:1.8}',
      // ── 起卦過場動畫 ──
      '.mhx-load{position:fixed;inset:0;z-index:100000;display:flex;flex-direction:column;align-items:center;justify-content:center;background:radial-gradient(120% 90% at 50% 30%,rgba(46,36,12,.5),rgba(12,9,5,.97) 62%,#0a0704 100%);overflow:hidden}',
      '.mhx-stars{position:absolute;inset:0;pointer-events:none;overflow:hidden}',
      '.mhx-stars i{position:absolute;bottom:-6%;width:2px;height:2px;border-radius:50%;background:rgba(212,175,55,.7);box-shadow:0 0 6px rgba(212,175,55,.6);animation:mhxRise var(--d,5s) linear var(--dl,0s) infinite;opacity:0}',
      '@keyframes mhxRise{0%{transform:translateY(0) scale(.6);opacity:0}12%{opacity:.9}88%{opacity:.7}100%{transform:translateY(-108vh) scale(1);opacity:0}}',
      '.mhx-ring{position:relative;width:min(300px,80vw);aspect-ratio:1;display:flex;align-items:center;justify-content:center;opacity:0;transform:scale(.9);animation:mhxRingIn .7s cubic-bezier(.16,1,.3,1) forwards}',
      '@keyframes mhxRingIn{to{opacity:1;transform:scale(1)}}',
      // 八卦環的八個符號
      '.mhx-tri{position:absolute;left:50%;top:50%;font-size:1.5rem;color:rgba(212,175,55,.4);font-family:serif;transform:translate(-50%,-50%) rotate(var(--a)) translateY(calc(min(150px,40vw) * -1)) rotate(calc(var(--a) * -1)) scale(.6);opacity:0;animation:mhxTri .5s ease forwards;animation-delay:var(--td,0s);text-shadow:0 0 10px rgba(212,175,55,.4)}',
      '@keyframes mhxTri{to{opacity:1;transform:translate(-50%,-50%) rotate(var(--a)) translateY(calc(min(150px,40vw) * -1)) rotate(calc(var(--a) * -1)) scale(1)}}',
      // 中央太極
      '.mhx-taiji{width:96px;height:96px;border-radius:50%;position:relative;opacity:0;animation:mhxTaijiIn .9s ease .6s forwards,mhxSpin 7s linear 1.1s infinite;background:conic-gradient(from 0deg,#f4ecd6 0deg 180deg,#1a140a 180deg 360deg);box-shadow:0 0 40px rgba(212,175,55,.45),inset 0 0 20px rgba(0,0,0,.4)}',
      '@keyframes mhxTaijiIn{to{opacity:1}}',
      '@keyframes mhxSpin{to{transform:rotate(360deg)}}',
      '.mhx-taiji::before,.mhx-taiji::after{content:"";position:absolute;left:50%;width:48px;height:48px;border-radius:50%;transform:translateX(-50%)}',
      '.mhx-taiji::before{top:0;background:#f4ecd6}',
      '.mhx-taiji::after{bottom:0;background:#1a140a}',
      '.mhx-taiji span{position:absolute;left:50%;width:16px;height:16px;border-radius:50%;transform:translateX(-50%);z-index:2}',
      '.mhx-taiji span.y{top:16px;background:#1a140a}',
      '.mhx-taiji span.n{bottom:16px;background:#f4ecd6}',
      '.mhx-load-status{margin-top:1.6rem;font-family:"Noto Serif TC",serif;font-size:1.05rem;font-weight:700;color:'+GOLD+';letter-spacing:.12em;text-shadow:0 2px 14px rgba(0,0,0,.6);transition:opacity .3s;min-height:1.4rem;text-align:center}',
      '.mhx-load-sub{margin-top:.4rem;font-size:.74rem;color:rgba(212,175,55,.55);letter-spacing:.08em;transition:opacity .3s;min-height:1.1rem;text-align:center}'
    ].join('\n');
    document.head.appendChild(css);
  // ═══ 鎏金夜祭 v2（2026/6/18）：主 CTA 採靜態鎏金底＋transform-only 獨立流光層，避免 Android/Samsung 對 background-position 動畫漏畫按鈕 ═══
  try{var _g2=document.createElement('style');_g2.setAttribute('data-jy-gilt2','meihua');_g2.textContent='.mhx-section{background:linear-gradient(180deg,rgba(24,20,14,.78),rgba(14,12,9,.86));border:1px solid rgba(201,168,76,.2);border-radius:18px;box-shadow:0 18px 40px rgba(0,0,0,.45),inset 0 1px 0 rgba(245,231,184,.14);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px)}.mhx-section-title{position:relative;padding-left:12px;letter-spacing:.08em;color:#e8d28a}.mhx-section-title::before{content:"";position:absolute;left:0;top:50%;transform:translateY(-50%);width:3px;height:1.05em;border-radius:2px;background:rgba(154,184,122,.9);box-shadow:0 0 8px rgba(154,184,122,.9)}.mhx-q-input,.mhx-section input,.mhx-section select,.mhx-section textarea{background:rgba(8,7,5,.62);border:1px solid rgba(201,168,76,.26);border-radius:12px;color:#f2e9d6;transition:border-color .2s,box-shadow .2s}.mhx-q-input:focus,.mhx-section input:focus,.mhx-section select:focus,.mhx-section textarea:focus{border-color:#e8d28a;box-shadow:0 0 0 3px rgba(201,168,76,.16);outline:none}.mhx-method-btn{background:rgba(201,168,76,.06);border:1px solid rgba(201,168,76,.22);color:#d8c79a;border-radius:12px;transition:color .18s,background-color .18s,border-color .18s,box-shadow .18s,transform .18s}.mhx-method-btn.active{background:linear-gradient(135deg,#e8d28a,#c9a84c);color:#171208;border-color:transparent;box-shadow:0 6px 18px rgba(201,168,76,.28);font-weight:700}.mhx-cast-btn{background:linear-gradient(135deg,#a98232 0%,#e8d28a 44%,#f5e7b8 58%,#c9a84c 100%);color:#171208;border:none;border-radius:14px;font-weight:800;letter-spacing:.14em;box-shadow:0 10px 26px rgba(201,168,76,.32),inset 0 1px 0 rgba(255,255,255,.35);position:relative;overflow:hidden;isolation:isolate}.mhx-cast-btn::before{content:none;display:none}.mhx-cast-btn:active{transform:translateY(1px)}.mhx-reset-btn{background:transparent;border:1px solid rgba(201,168,76,.34);color:#cdb87f;border-radius:12px}.mhx-back{color:rgba(232,210,138,.75)}.mhx-back:hover{color:#f5e7b8}.mhx-ai-card{background:linear-gradient(180deg,rgba(24,20,14,.78),rgba(14,12,9,.86));border:1px solid rgba(201,168,76,.2);border-radius:18px;box-shadow:0 18px 40px rgba(0,0,0,.45),inset 0 1px 0 rgba(245,231,184,.14);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px)}@supports not (backdrop-filter:blur(1px)){[data-jy-view-meihua]{}}.mhx-cast-btn:focus-visible{outline:2px solid #e8d28a;outline-offset:2px}';document.head.appendChild(_g2);}catch(e){}
    return _mhWrap;
  }

  // ════════════════════════════════════════════════════════
  //  畫面
  // ════════════════════════════════════════════════════════
  function _render() {
    var w = _getWrap();
    var savedScroll=w.getAttribute('data-flow-view')===_mhPhase?w.scrollTop:0;w.setAttribute('data-flow-view',_mhPhase);
    var h = '<div class="mhx-container">';
    h += '<nav class="at-room-nav" aria-label="頁面導覽"><button type="button" class="at-back mhx-back" onclick="' + (_mhPhase === 'input' ? '_meihuaClose()' : '_mhReset()') + '">← ' + (_mhPhase === 'input' ? '返回首頁' : '返回修改') + '</button>' + (_mhPhase !== 'input' ? '<button type="button" class="at-home-link" onclick="_meihuaClose()">首頁</button>' : '') + '<a class="at-room-shop" href="https://shopee.tw/a50h95648d?tab=shop" target="_blank" rel="noopener noreferrer">蝦皮選物 <span aria-hidden="true">↗</span></a></nav>';
    h += '<div class="mhx-header at-tool-header"><span class="at-art" data-art="meihua" aria-hidden="true"></span><div><span class="at-eyebrow">PLUM BLOSSOM I CHING</span><h1>梅花易數</h1><p>從本、互、變三象，梳理事情的進退。</p></div></div>';

    if (_mhPhase === 'input') {
      h += '<div class="at-flow-guide" aria-label="探索流程"><span><b>01</b> 整理問題</span><span><b>02</b> 選擇方式起卦</span><span><b>03</b> 探索解讀</span></div>';
      h += '<div class="mhx-section"><div class="mhx-section-title">✦ 你想問什麼？</div>';
      h += '<textarea class="mhx-q-input" id="mhx-q" aria-label="梅花易數想釐清的問題" rows="2" maxlength="200" placeholder="例如：這個案子推得動嗎？目前卡在哪一步？">' + _mhEscape(_mhQuestion) + '</textarea></div>';

      h += '<div class="mhx-section"><div class="mhx-section-title">✦ 起卦方式</div><div class="mhx-method-grid">';
      h += '<button class="mhx-method-btn' + (_mhMethod==='time'?' active':'') + '" onclick="_mhSetMethod(\'time\')">時間起卦<br><span style="font-size:.58rem;opacity:.6">以當下時間</span></button>';
      h += '<button class="mhx-method-btn' + (_mhMethod==='num'?' active':'') + '" onclick="_mhSetMethod(\'num\')">數字起卦<br><span style="font-size:.58rem;opacity:.6">報上下兩數</span></button>';
      h += '<button class="mhx-method-btn' + (_mhMethod==='char'?' active':'') + '" onclick="_mhSetMethod(\'char\')">漢字起卦<br><span style="font-size:.58rem;opacity:.6">中文字筆畫</span></button>';
      h += '</div>';
      if (_mhMethod === 'num') {
        h += '<div class="mhx-num-row"><input type="number" inputmode="numeric" id="mhx-up" aria-label="起卦上數" min="1" placeholder="上數" value="'+(_mhUpNum||'')+'"><input type="number" inputmode="numeric" id="mhx-lo" aria-label="起卦下數" min="1" placeholder="下數" value="'+(_mhLoNum||'')+'"></div>';
        h += '<div class="mhx-hint">心中默念所問，隨意各報一數（如 8、25），動爻以當下時辰定。</div>';
      } else if (_mhMethod === 'char') {
        h += '<div class="mhx-char-row"><input type="text" id="mhx-text" aria-label="起卦漢字" maxlength="20" placeholder="輸入中文字（如：問前途）" value="'+_mhEscape(_mhText)+'"></div>';
        h += '<div class="mhx-hint">心中默念所問，輸入中文字，以本站繁體筆畫法起卦：一字以筆畫為上卦、筆畫加時辰為下卦；二字各為上下卦，多字前少後多分上下卦，動爻再加時辰定。本法是現代延伸，非原典一字拆字法。</div>';
      } else {
        h += '<div class="mhx-hint">以此刻年月日時自動起卦（先天卦數＋時辰定動爻）。</div>';
      }
      h += '</div>';
      h += '<button class="mhx-cast-btn" onclick="_mhDoCast()">✦ 起 卦 ✦</button>';
    } else {
      var mh = _mhResult;
      if (_mhQuestion) h += '<div class="at-result-question"><span>你想釐清的事</span><p>' + _mhEscape(_mhQuestion) + '</p></div>';
      h += '<div class="mhx-section"><div class="mhx-section-title">✦ 卦象</div>';
      h += '<div class="mhx-gua-row">';
      h += _guaCell('本卦', mh.ben && mh.ben.n, (mh.up&&mh.up.el)+'／'+(mh.lo&&mh.lo.el));
      h += _guaCell('互卦', mh.hu && mh.hu.n, '過程線索');
      h += _guaCell('變卦', mh.bian && mh.bian.n, '後續趨勢');
      h += '</div>';
      h += '<div class="mhx-ty"><span class="rel">' + (mh.ty?mh.ty.r:'—') + '</span>';
      h += '<span class="luck">體用初判</span>';
      h += '<div class="desc">' + _mhEscape(_mhRelationNote(mh.ty && mh.ty.r)) + '</div></div>';
      h += '<div class="mhx-dong">體卦 ' + (mh.tiG?_mhEscape(mh.tiG.name||mh.tiG.n)+'（'+mh.tiG.el+'）':'') + ' ・ 用卦 ' + (mh.yoG?_mhEscape(mh.yoG.name||mh.yoG.n)+'（'+mh.yoG.el+'）':'') + ' ・ 動爻第 ' + (mh.dong||'?') + ' 爻</div>';
      h += '<div class="at-reading-note"><strong>把卦象放回你的問題</strong><p>體用先看助力與消耗；再合看時令旺衰、互卦的過程與變卦的後續。若訊號不同，先辨認條件如何改變，再決定下一步。</p></div>';
      h += '</div>';

      h += '<div class="mhx-ai-card"><div class="mhx-ai-title">🌙 AI 深度解讀</div>';
      h += '<div class="mhx-ai-desc">複製本次問題與卦象，貼到 AI 對話送出。提示詞會引導逐層解讀，整理你可採取的行動與需要觀察的變化。</div>';
      h += '<button class="mhx-ai-copy-btn" onclick="_mhCopy()">✦ 一鍵複製占卦提示詞 ✦</button>';
      h += '<div class="mhx-ai-grid">';
      for (var a=0;a<AI_LIST.length;a++) {
        var ai = AI_LIST[a];
        h += '<button class="mhx-ai-sc" onclick="_mhOpenAI(\''+ai.id+'\',\''+ai.url+'\',this)">';
        h += '<img src="ai-icons/ai-'+ai.id+'.png" alt="'+ai.name+'"><span>'+ai.name+'</span></button>';
      }
      h += '</div><div class="mhx-ai-foot">點擊 AI 按鈕 → 自動複製＋開啟 → 貼上送出</div></div>';
      h += '<div style="text-align:center;margin-top:.2rem"><button type="button" class="at-share-button" onclick="_meihuaShare()" style="padding:.72rem 1.5rem;border-radius:12px;border:1px solid rgba(201,168,76,.5);background:linear-gradient(135deg,rgba(201,168,76,.18),rgba(201,168,76,.05));color:#c9a84c;font-family:inherit;font-size:.92rem;font-weight:600;letter-spacing:1px;cursor:pointer">\uD83D\uDCE4 \u751F\u6210\u5206\u4EAB\u5361</button></div>';
      h += '<div style="text-align:center"><button class="mhx-reset-btn" onclick="_mhReset()">↺ 重新起卦</button></div>';
    }
    h += '<div class="mhx-footer">靜月之光 ・ jingyue.uk<br>梅花易數 ・ 體用占</div></div>';
    w.innerHTML = h;
    if (window.JY_ATELIER) window.JY_ATELIER.enhance(w);
    if (window.JYExperience && _mhResult && w.querySelector('.mhx-gua-row')) window.JYExperience.mountMeihua(w,_mhResult);
    w.scrollTop=savedScroll;
  }

  function _mhEscape(value) { return String(value||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }

  // Reader-facing paraphrases; raw engine relations remain intact in the prompt.
  // 梅花易數卷二：體用總訣、人事占、卦斷遺論。A single relation is not a final verdict.
  function _mhRelationNote(relation) {
    return {
      '比和': '體與用同五行，可先留意協調與共同基礎；是否能推進，仍看旺衰與互變。',
      '用生體': '用卦生助體卦，可先找出可運用的支持；也要確認助力能否持續、如何落實。',
      '體生用': '體卦向用卦付出，可先檢視投入與消耗；釐清能承擔的範圍及預期回應。',
      '用克體': '用卦對體卦形成制約，可先辨認壓力來源；把可調整的條件與暫時限制分開。',
      '體克用': '體卦對用卦具有制約方向，可先找出能主動調整的環節；實際掌握度仍看體卦強弱。'
    }[relation] || '體用關係尚待確認，請合看完整卦象與當下情境。';
  }

  function _guaCell(role, name, sub) {
    return '<div class="mhx-gua"><div class="role">' + role + '</div><div class="gname">' + (name||'？') + '</div><div class="gel">' + (sub||'') + '</div></div>';
  }

  // ════════════════════════════════════════════════════════
  //  起卦過場動畫（太極 + 八卦環）
  // ════════════════════════════════════════════════════════
  function _showLoading(done) {
    if (window.JYRitual) return window.JYRitual.play('meihua', {
      onComplete: done,
      onCancel: function(){}
    });
    if (typeof done === 'function') done();
  }

  // ════════════════════════════════════════════════════════
  //  起卦計算（呼叫全域 calcMH，不重造）
  // ════════════════════════════════════════════════════════
  function _shichen() {
    var nh = new Date().getHours();
    return Math.floor(((nh + 1) % 24) / 2) + 1; // 1=子…
  }

  function _castNumbers() {
    var now = new Date(), sc = Math.floor((now.getHours()+1)%24/2)+1;
    var context={method:_mhMethod,timestamp:now.toISOString(),localDate:now.getFullYear()+'-'+(now.getMonth()+1)+'-'+now.getDate(),utcOffsetMinutes:-now.getTimezoneOffset(),shichen:sc};
    if (_mhMethod === 'num') {
      var u = Number(_mhUpNum), l = Number(_mhLoNum);
      if (!Number.isSafeInteger(u) || !Number.isSafeInteger(l) || u < 1 || l < 1 || !Number.isSafeInteger(u+l+sc)) { alert('請各報一個可精確計算的正整數（上數、下數），不要輸入小數或文字。'); return null; }
      var up = u % 8 || 8, lo = l % 8 || 8, dong = (u + l + sc) % 6 || 6;
      context.upperNumber=u;context.lowerNumber=l;context.policy='報數加時法：上下數各除8取餘，動爻用上下原數加時辰除6；整除取8或6。';
      return { up: up, lo: lo, dong: dong, context:context };
    }
    // 時間起卦：需農曆換算。lunar-javascript 把 Solar 掛在 window.Solar（非 Lunar.Solar），兩者皆接受。
    var SolarLib = (window.Lunar && window.Lunar.Solar) || window.Solar;
    if (!SolarLib || typeof SolarLib.fromYmd !== 'function') {
      alert('時間起卦需要精準農曆換算尚未就緒，請改用「數字起卦」。');
      return null;
    }
    try {
      var solar = SolarLib.fromYmd(now.getFullYear(), now.getMonth()+1, now.getDate());
      var lunar = solar.getLunar();
      var lY = lunar.getYear(), lM = lunar.getMonth(), lD = lunar.getDay();
      var yzhi = ((lY - 4) % 12 + 12) % 12 + 1;
      var base = yzhi + Math.abs(lM) + lD;
      var up = base % 8 || 8, lo = (base + sc) % 8 || 8, dong = (base + sc) % 6 || 6;
      context.lunar={year:lY,month:lM,day:lD,yearBranchNumber:yzhi};
      context.policy='年月日時法：年支數＋農曆月日取上卦，再加時辰取下卦與動爻；閏月沿用本月數，採本地民用日期，未校正真太陽時。';
      return { up: up, lo: lo, dong: dong, context:context };
    } catch (e) {
      alert('起卦失敗，請改用「數字起卦」。');
      return null;
    }
  }

  // ── 漢字起卦：筆畫資料庫（自架 cnchar，避免外部 CDN 風險；只在用到時載入一次）──
  var _cncharReady = false, _cncharLoading = false, _cncharCbs = [];
  function _loadCnchar(cb) {
    if (_cncharReady) { cb(true); return; }
    _cncharCbs.push(cb);
    if (_cncharLoading) return;
    _cncharLoading = true;
    var V = '?v=20260606v80_20';
    function flush(ok){ _cncharLoading = false; _cncharReady = ok; _cncharCbs.forEach(function(f){ f(ok); }); _cncharCbs = []; }
    function fail(){ flush(false); }
    function register(){
      try { if (window.cnchar && window.cncharTrad && typeof window.cnchar.use === 'function') window.cnchar.use(window.cncharTrad); } catch (e) {}
      flush(!!(window.cnchar && typeof window.cnchar.stroke === 'function'));
    }
    function inject(src, ok, err){ var s = document.createElement('script'); s.src = src; s.async = true; s.onload = ok; s.onerror = err; document.body.appendChild(s); }
    function loadTrad(){ if (window.cncharTrad) { register(); } else { inject('JS/cnchar.trad.min.js' + V, register, fail); } }
    if (window.cnchar && window.cnchar.stroke) { loadTrad(); }
    else { inject('JS/cnchar.min.js' + V, loadTrad, fail); }   // 先載基礎，再載繁體筆畫，全自架可快取
  }

  // 漢字起卦（字占）：依先天卦數，以「繁體筆畫」起卦。async：用到時才載入筆畫庫。
  function _castChar(cb) {
    var raw = (_mhText || '').trim();
    var chars = raw.match(/[\u4e00-\u9fa5\u3400-\u4dbf]/g); // 只取中文字（含擴展A）
    if (!chars || !chars.length) { alert('請先輸入中文字（漢字起卦）。'); cb(null); return; }
    var now = new Date(), sc = Math.floor((now.getHours()+1)%24/2)+1;
    function compute() {
      try {
        if (!window.cnchar || typeof window.cnchar.stroke !== 'function') return null;
        var arr = window.cnchar.stroke(chars.join(''), 'array'); // 每字繁體筆畫（已註冊 cncharTrad）
        if (!arr || arr.length!==chars.length || arr.some(function(n){return !Number.isSafeInteger(n)||n<=0;})) return null;
        var total = 0; for (var i=0;i<arr.length;i++) total += arr[i];
        if (!total) return null;
        var up, lo;
        if (arr.length === 1) {
          // 一字難分：以筆畫為上卦，筆畫＋時辰為下卦（本站一字加時變體）
          up = arr[0] % 8 || 8;
          lo = (arr[0] + sc) % 8 || 8;
        } else {
          // 多字：字數均分，少一字為上卦、多一字為下卦（前半上、後半下）
          var upCount = Math.floor(arr.length / 2);
          var upSum = 0, loSum = 0;
          for (var j=0;j<arr.length;j++){ if (j < upCount) upSum += (arr[j]||0); else loSum += (arr[j]||0); }
          up = upSum % 8 || 8;
          lo = loSum % 8 || 8;
        }
        var dong = (total + sc) % 6 || 6; // 動爻：總筆畫加時辰
        return { up: up, lo: lo, dong: dong, context:{method:'char',timestamp:now.toISOString(),utcOffsetMinutes:-now.getTimezoneOffset(),shichen:sc,characters:chars.join(''),strokes:arr.slice(),totalStrokes:total,policy:arr.length===1?'本站一字加時變體：筆畫取上卦、筆畫加時辰取下卦和動爻；不冒充原書的一字左右拆字法。':'本站多字筆畫法：前少後多分上下卦，總筆畫加時辰取動爻；以本次 cnchar 繁體筆畫為準，不混稱康熙筆畫。'} };
      } catch (e) { return null; }
    }
    _loadCnchar(function(ok){
      if (!ok) { alert('漢字起卦所需的筆畫資料庫載入失敗，請改用「時間起卦」或「數字起卦」。'); cb(null); return; }
      var r = compute();
      if (!r) { alert('漢字筆畫解析失敗，請改用時間或數字起卦。'); cb(null); return; }
      cb(r);
    });
  }

  // ════════════════════════════════════════════════════════
  //  提示詞（組好複製去 AI；遵循 ai-divination 鐵律）
  // ════════════════════════════════════════════════════════
  // 八卦萬物類象（說卦＋梅花斷例常用；推具體人事物）
  var GUA_XIANG = {
    '乾':'天、君、父、長輩官貴、頭、剛健、金玉珠寶、圓、西北',
    '兌':'澤、少女、口舌言談、喜悅、毀折缺損、巫醫、飲食、西',
    '離':'火、日、中女、文書契約、光明美麗、心目、電、分離、南',
    '震':'雷、長男、動、足、驚恐、車馬、急躁、生發、東',
    '巽':'風、長女、入、生意利市、繩直、進退不定、草木、東南',
    '坎':'水、中男、險陷、盜、暗昧、耳、智謀、勞苦、北',
    '艮':'山、少男、停止阻隔、手、徑路、穩重保守、東北',
    '坤':'地、母、眾人、順從、腹、方、柔弱吝嗇、布帛田土、西南'
  };

  function _mhTrig(g){ return g ? ((g.name||'') + (g.nat?('('+g.nat+')'):'') + (g.el?('·'+g.el):'')) : '？'; }

  // v3：只提示問題焦點，讓 AI 依卦象與自身知識自行完成判讀。
  function _mhQuestionContract(question) {
    var q = String(question || '').trim();
    var L = ['【本題焦點】'];
    if (!q) {
      L.push('問卜者未填明確問題，請解讀本卦的一般局勢、發展變化、提醒與可採取方向。');
      return L.join('\n');
    }
    L.push('請完整回答原問句，保留其中的對象、條件、比較與期限。');
    var yesno = /會不會|能不能|可不可以|是否|是不是|有沒有|嗎[？?]?\s*$/.test(q);
    var timing = /何時|什麼時候|多久|幾天|幾週|幾月|哪一年|時間|近期|本月|今年|明年/.test(q);
    var choice = /還是|二選一|比較|該選|選擇|(?:方案|選項)\s*[ABＡＢ]/i.test(q);
    var cause = /為什麼|為何|原因|怎麼會|根源/.test(q);
    var action = /怎麼做|怎麼辦|如何|建議|方法|策略|該不該|要不要/.test(q);
    var mind = /愛不愛|愛上|喜歡|想我|想念|在想|心裡|真心|感情|關係|復合|曖昧|桃花/.test(q);
    var lost = /不見|遺失|掉了|找得到|在哪裡|位置|失物|走失/.test(q);
    var exact = /幾個|幾位|多少|百分比|幾成|機率|金額|價位|幾歲|年齡|姓名|名字|身分|職業|長相|外貌|號碼|彩票|樂透/.test(q);
    var high = /疾病|症狀|癌|懷孕|手術|藥|醫療|官司|法律|犯罪|報警|投資|股票|期貨|加密貨幣|借貸|債務|自殺|傷害/.test(q);
    var allegation = /外遇|偷吃|劈腿|偷竊|下毒|陷害|詐騙|兇手|性侵|跟蹤|犯罪/.test(q);
    var liveFact = /天氣|氣溫|降雨|颱風|地震|航班|班機|股價|匯率|價格|法規|選舉|比賽|比分|開獎/.test(q);
    if (yesno) L.push('這是是非題：開頭先給「偏會／偏不會／有條件」的傾向與把握度，再說明關鍵條件。');
    if (timing) L.push('這題要求時間：結合卦氣、體用旺衰、本互變與資料所列應期，說明較可能的先後與窗口。');
    if (choice) L.push('這是比較題，但本次只起一卦。先從本互變辨認共同條件，再比較各行動是否符合；不能把本卦當 A、變卦當 B，冒充兩次獨立占測。');
    if (cause) L.push('這題要求原因：用本卦看現況、互卦看過程、動爻看觸發，整理主因與暗線。');
    if (action) L.push('這題要求做法：將最關鍵的阻力或轉機轉成具體可執行建議。');
    if (mind) L.push('涉及感情或他人想法：解讀互動傾向、投入、顧慮與後續發展，並提示可用哪些現實行為驗證。');
    if (lost) L.push('涉及失物／位置：綜合八卦方位、場域與物象，給優先搜索區域、物件特徵與順序。');
    if (exact) L.push('涉及數量、身分、金額、年齡或機率時，沒有可查的數值依據就明說無法測得；不得把猜測改寫成範圍或百分比。仍可解讀與問題相關的處境、條件與行動。');
    if (high || allegation || liveFact) L.push('若問題牽涉醫療、法律、投資、安全、指控或即時資料，請把卦象判斷和需要現實查證的部分分開說明。');
    return L.join('\n');
  }

  function buildMeihuaPrompt(question, mh) {
    if(!mh||!mh.up||!mh.lo||!Number.isInteger(mh.dong)||mh.dong<1||mh.dong>6||!mh.ben||!mh.hu||!mh.bian||!mh.tiG||!mh.yoG)throw new Error('梅花卦盤資料不完整');
    var castDate=mh.castContext&&mh.castContext.timestamp?new Date(mh.castContext.timestamp):null;
    if(castDate&&!Number.isFinite(castDate.getTime()))throw new Error('起卦時間資料無效');
    var seasonDate=castDate||new Date(), seasonPrecision='未確認';
    var tiName = (mh.tiG && mh.tiG.name) || '', yoName = (mh.yoG && mh.yoG.name) || '';
    var tiEl = mh.tiG && mh.tiG.el, yoEl = mh.yoG && mh.yoG.el;
    var timing = WX_TIMING[yoEl] || '節奏依用卦五行性質判';
    var luck = mh.ty ? mh.ty.f : '';
    // ── 旺衰（旺相休囚死）：體、用、變後用 都要算，生剋力道才準（天花板在材料）──
    //    優先用既有引擎 getMhWangShuai（v80.16 起含節氣判月＋四季月土旺），失敗才退國曆近似簡表；同一函數對任一五行通用。
    function _wsLevelOf(el) {
      if (!el) return '';
      try { if (typeof getMhWangShuai === 'function') { var r = getMhWangShuai(el,seasonDate); if (r && r.level) {seasonPrecision=r.precision||'未標示算法精度';return r.level;} } } catch (e) {}
      seasonPrecision='公曆季節近似備援，節令交界不作精細旺衰判斷';
      var _m = seasonDate.getMonth() + 1, _sea;
      if (_m>=2 && _m<=4) _sea='spring'; else if (_m>=5 && _m<=7) _sea='summer';
      else if (_m>=8 && _m<=10) _sea='autumn'; else _sea='winter';
      var _T = { spring:{木:'旺',火:'相',水:'休',金:'囚',土:'死'}, summer:{火:'旺',土:'相',木:'休',水:'囚',金:'死'}, autumn:{金:'旺',水:'相',土:'休',火:'囚',木:'死'}, winter:{水:'旺',木:'相',金:'休',土:'囚',火:'死'} };
      return (_T[_sea] && _T[_sea][el]) || '平';
    }
    var wsLevel = _wsLevelOf(tiEl);   // 體卦旺衰
    var yoWs    = _wsLevelOf(yoEl);   // 用卦旺衰
    var _wsNoteMap = {
      '旺':'當令最旺、力足', '相':'受令神所生、次旺偏有力', '休':'洩氣於令神、力退',
      '囚':'克令神反受牽制、力弱', '死':'被當令之氣所克、最弱', '平':'不逢令、力道持平'
    };
    var wsNote = ({
      '旺':'體當令最旺、力足——吉更實，逢凶也扛得住。',
      '相':'體受令神所生、次旺，偏有力。',
      '休':'體生令神而洩氣、力退——吉要打折，別高估後勁。',
      '囚':'體克令神反被牽制、力弱——推得吃力。',
      '死':'體被當令之氣所克、最弱——凶上加凶，吉也難落實。',
      '平':'體不逢令，力道持平。'
    })[wsLevel] || '';
    // 生剋力道：把「體旺衰＋用旺衰」合參，定生剋的真實輕重——
    //   剋體之卦（用）休囚死則克無力、凶大減；用旺相則凶不可當；受剋方（體）旺則能扛。
    var _rank = { '旺':4, '相':3, '平':2, '休':1, '囚':0, '死':0 };
    function _forceNote(relName, tw, yw) {
      relName = (relName || '').replace('剋', '克');
      var ts = (_rank[tw]!=null ? _rank[tw] : 2), ys = (_rank[yw]!=null ? _rank[yw] : 2);
      var tiStrong = ts>=3, tiWeak = ts<=1, yoStrong = ys>=3, yoWeak = ys<=1;
      if (relName==='用克體') {
        if (yoWeak && tiStrong) return '用衰體旺——克你的力道其實很弱、你站得住，這個「凶」要大打折扣，別當成困難重重。';
        if (yoStrong && tiWeak) return '用旺體弱——克力強、受傷重，這個凶要當真。';
        if (yoStrong && tiStrong) return '雙方都旺——硬碰硬，受阻但你頂得住，要主動出力才壓得下。';
        if (yoWeak && tiWeak) return '雙方都弱——事不成氣候，拖著沒力、難有結果。';
        return '克力中等——受點阻，程度中等。';
      }
      if (relName==='體生用') {
        if (tiWeak && yoStrong) return '體弱生旺用——旺者奪氣，洩耗最重、得不償失之象。';
        if (tiStrong && yoWeak) return '體旺生衰用——洩得起且洩耗有限，付出有本錢，但仍是你在貼。';
        if (tiStrong) return '體旺——洩得起，付出有本錢，但仍是你在貼、被牽著走。';
        if (tiWeak) return '體弱還在洩——越給越虛，洩耗偏重、得不償失之象。';
        return '在洩耗——付出與回收要算清楚，別無底線投入。';
      }
      if (relName==='體克用') {
        if (tiWeak && yoStrong) return '體弱剋旺用——有主動處理之象，但自身力弱、外在條件強，不能只因體剋用便斷吉或保證成功；先審承受力與本互變。';
        if (tiStrong && yoWeak) return '體旺剋衰用——壓得輕鬆、最易成。';
        if (tiStrong) return '體旺——你壓得住、可成，主動推進就行。';
        if (tiWeak) return '體弱想掌控——吉意仍在，但力道不足，成得很費勁。';
        return '掌控力中等——可成但需出力。';
      }
      if (relName==='用生體') {
        if (yoStrong) return '用旺生體——外助強而實，貴人／環境有力，借得上力。';
        if (yoWeak) return '用衰生體——象徵支持條件偏弱；是否真有外援仍待現實確認。';
        return '外助中等——有幫襯，仍要自己接得住。';
      }
      if (relName==='比和') {
        if (tiStrong || yoStrong) return '同氣且有力——順而能成，但同質性高、突破有限。';
        if (tiWeak && yoWeak) return '同氣但都弱——順是順卻沒力，難有大進展。';
        return '同氣相順——事順，突破有限。';
      }
      return '';
    }

    // 變卦體用（結局對體）：動爻必在「用卦」，故體不變、用變；翻動爻所在爻得變後用卦
    var bianTy = null, yoBianName = '', yoBianEl = '';
    try {
      if (mh.yoG && mh.yoG.li && typeof gByL === 'function' && typeof tiYong === 'function') {
        var _yl = mh.yoG.li.slice();
        var _idx = (mh.dong <= 3) ? (mh.dong - 1) : (mh.dong - 4); // 動爻在用卦內的爻位
        if (_idx >= 0 && _idx <= 2) {
          _yl[_idx] = _yl[_idx] ? 0 : 1;
          var _yb = gByL(_yl[0], _yl[1], _yl[2]);
          if (_yb) { yoBianName = _yb.name || ''; yoBianEl = _yb.el || ''; bianTy = tiYong(tiEl, _yb.el); }
        }
      }
    } catch (e) {}

    var L = [];
    L.push('你是一位資深梅花易數占者。請運用你自身完整的易學、體用、生剋、卦氣、類象與應期知識，綜合本次卦象資料，以白話直接回答問題，讓結論有具體依據。');
    L.push('');
    L.push('問題：' + (question || '（未填）'));
    L.push('');
    L.push('動爻自下而上計數；依本次體用、卦氣與本互變共同判斷。生剋類型是傳統象義，不能單獨證明有人暗助、阻擋或注定成敗。卦數與旬、季節象徵不是已驗證的日期或現實數量。');
    L.push(_mhQuestionContract(question));
    L.push('');
    L.push('【卦象資料】');
    L.push('互卦政策：下互取二三四爻，上互取三四五爻；乾坤採《互卦起例》「互其變卦」，先翻本次動爻再取互卦。文字筆畫取數為現代延伸，並非原典四至十字按平上去入取數的復刻。');
    L.push('起卦依據：'+(mh.castContext?JSON.stringify(mh.castContext):'舊資料未保存起卦時間與原始取數；當下旺衰只作匯出時參考，不能追認為起卦時令。'));
    L.push('旺衰算法：'+seasonPrecision+'。');
    if(mh.lo.li&&mh.up.li)L.push('本卦六爻（自下而上，1陽0陰）：'+mh.lo.li.concat(mh.up.li).join('、')+'；只翻轉第'+mh.dong+'爻生成變卦。');
    L.push('判讀順序：先核對取數與體用，再以本卦定背景、互卦觀察內部過程、變後用卦對原體卦看條件變化；用卦含動爻，體卦是不動的另一個三爻卦。比較生剋方向與雙方旺衰，不只計算吉凶數量。');
    L.push('每個主判指出本互變的具體卦名、生剋關係與動爻位置，再說明對原問題的含義、反向訊號和可觀察條件。錯綜及爻辭屬補充鏡頭，不取代體用；本法只有一動爻，不擅自套用六爻納甲世應與多爻變占規則。');
    L.push('原典參考：《梅花易數》卷一、卷二 https://www.eee-learning.com/book/4080 、 https://www.eee-learning.com/book/4085 。本次公式變體已另行標示；書目不代表 AI 已即時查網。');
    L.push('本卦：' + (mh.ben && mh.ben.n) + '（上卦' + _mhTrig(mh.up) + '，下卦' + _mhTrig(mh.lo) + '）—— 事情的當前定性。');
    L.push('互卦：' + (mh.hu && mh.hu.n) + ' —— 發展過程、可供思考的內在結構與中間變數（尚待現實核對）。');
    // v80.33 互卦對體生剋（《體用總訣》「宜受他卦之生，不宜受他卦之剋。他卦者，謂用互變也」——資料直給，不靠 AI 自己算）
    try {
      if (mh.lo && mh.lo.li && mh.up && mh.up.li && typeof gByL === 'function' && tiEl) {
        var _SH = (typeof SHENG !== 'undefined') ? SHENG : {木:'火',火:'土',土:'金',金:'水',水:'木'};
        var _KEm = (typeof KE !== 'undefined') ? KE : {木:'土',土:'水',水:'火',火:'金',金:'木'};
        var _six = [mh.lo.li[0], mh.lo.li[1], mh.lo.li[2], mh.up.li[0], mh.up.li[1], mh.up.li[2]];
        var _nuclear=mhNuclearContext(mh);
        var _huLo = _nuclear.lower;
        var _huUp = _nuclear.upper;
        var _hrel = function (g) {
          if (!g || !g.el) return '';
          if (g.el === tiEl) return (g.name||'') + '（' + g.el + '）與體比和＝過程有同氣相助';
          if (_SH[g.el] === tiEl) return (g.name||'') + '（' + g.el + '）生體＝過程中可能存在支持條件，不能據此認定有人暗助';
          if (_SH[tiEl] === g.el) return (g.name||'') + '（' + g.el + '）受體生＝過程在洩耗你';
          if (_KEm[g.el] === tiEl) return (g.name||'') + '（' + g.el + '）剋體＝可檢視過程的外部限制，不證明特定人物阻撓';
          if (_KEm[tiEl] === g.el) return (g.name||'') + '（' + g.el + '）受體剋＝過程可控但費力';
          return '';
        };
        var _hl = _hrel(_huLo), _hu2 = _hrel(_huUp);
        if (_hl || _hu2) L.push('互卦對體生剋（過程在幫你還是扯你）：互上' + (_hu2 || '—') + '；互下' + (_hl || '—') + '。');
      }
    } catch (e) {}
    L.push('變卦：' + (mh.bian && mh.bian.n) + ' —— 若照目前走向，可能的後續走向，仍會隨條件與行動改變。');
    var _cuo = (typeof mhCuoGua === 'function') ? mhCuoGua(mh) : null;
    var _zong = (typeof mhZongGua === 'function') ? mhZongGua(mh) : null;
    if (_cuo) L.push('錯卦（上' + _cuo.up + '下' + _cuo.lo + '）—— 事情的反面、你沒看到的相反可能與潛在反作用力；若這一面反而有利，提醒當事人可能看錯方向或另有轉圜。');
    if (_zong) L.push('綜卦：' + (_zong.isSelf ? '與本卦相同 —— 正反看都一樣，此卦上下倒置後結構相同；僅是卦形對稱，不代表事情無法改變' : ('上' + _zong.up + '下' + _zong.lo + ' —— 把局面整個倒過來、站對方／對立位置看到的另一種樣貌，可輔助觀察換位後的立場或事情循環另一端，但不能單憑此卦斷定對方內心')) + '。');
    L.push('體卦：' + _mhTrig(mh.tiG) + ' —— 問卜者自身／所問之主體。體宜旺、宜被生。');
    L.push('用卦：' + _mhTrig(mh.yoG) + ' —— 所問之事／外在環境／對方。');
    L.push('本卦體用關係：' + (mh.ty && mh.ty.r) + '；未加旺衰的傳統分類為「' + luck + '」，不是事件結論。實際傾向須以下方體用旺衰及本互變綜合校準。');
    L.push('生剋力道（體用旺衰合參、定輕重）：' + _forceNote(mh.ty && mh.ty.r, wsLevel, yoWs));
    if (bianTy) {
      L.push('變卦體用關係（結局）：體仍為' + tiName + '（' + tiEl + '），用變為' + yoBianName + '（' + yoBianEl + '）→ ' + bianTy.r + '（' + bianTy.f + '）。變後用「' + yoBianName + '」當下旺衰為「' + _wsLevelOf(yoBianEl) + '」。生剋力道：' + _forceNote(bianTy.r, wsLevel, _wsLevelOf(yoBianEl)) + ' 拿它跟本卦體用比：同向＝維持，轉壞＝越走越不利，轉好＝漸入佳境。');
    }
    L.push('動爻：第 ' + mh.dong + ' 爻動（變卦由此而生，是事情變化的關鍵點）。');
    // v80.38 動爻爻位層次（《繫辭傳下》：其初難知、其上易知；二多譽、四多懼、三多凶、五多功）
    var _YAO_POS = {
      1:'初爻＝事之始、根基層，方向未定（其初難知）——變化發生在起步與底層條件',
      2:'二爻＝內部核心、得中之位，多獲助與稱譽（二多譽）——變化發生在內部主力與核心本身',
      3:'三爻＝內外交界、進退尷尬之位，多波折（三多凶）——變化發生在轉換與銜接處',
      4:'四爻＝近事之外場、伴君之位，多戒懼（四多懼）——變化發生在對外接口與關鍵他方',
      5:'五爻＝主導尊位、事之高峰（五多功）——變化發生在主導權與大局層',
      6:'上爻＝事之末、過極之位，局面將收（其上易知）——變化發生在收尾與規則層，過頭則散'
    };
    if (_YAO_POS[mh.dong]) L.push('動爻爻位參考：' + _YAO_POS[mh.dong] + '。把它跟變卦合著讀，點出變化具體落在事情的哪一層。');
    L.push('體卦旺衰：' + tiName + '（' + tiEl + '）當下時令為「' + wsLevel + '」——' + wsNote);
    L.push('用卦旺衰：' + yoName + '（' + yoEl + '）當下時令為「' + yoWs + '」——用' + (_wsNoteMap[yoWs] || '') + '；用代表所問之事或外部條件，它與體的生剋比和及雙方旺衰共同決定作用力度。');
    L.push('事情節奏參考（用卦五行性質，只定快慢、不定應期月份）：用卦五行為「' + yoEl + '」，' + timing + '。');
    // 應期只提供可追溯的傳統卦氣候選，不用今日日期加固定節氣日製造「最近幾個月」的假精確。
    try {
      if (mh.yingQi) {
        L.push('應期資料層級：' + (mh.yingQi.precision || '傳統卦氣候選') + '。');
        if (mh.yingQi.jiTxt) L.push('・吉應候選：' + mh.yingQi.jiTxt + '。');
        if (mh.yingQi.baiTxt) L.push('・不利候選：' + mh.yingQi.baiTxt + '。');
        if (mh.yingQi.layerTxt) L.push('・遠近層次：' + mh.yingQi.layerTxt + '。');
      } else {
        L.push('應期資料：本盤沒有曆法換算結果。可說明本互變的過程層次，不把三卦硬配三段時間，也不報精確日期。');
      }
    } catch (e) {}
    // 選品置於完整解讀後，由生活情境承接，不把體用當成補五行處方。
    L.push('【八卦類象（推具體人事物，只取與問題相關的，不要全列）】');
    L.push('體卦 ' + tiName + '：' + (GUA_XIANG[tiName] || ''));
    L.push('用卦 ' + yoName + '：' + (GUA_XIANG[yoName] || ''));
    L.push('其餘速查（推互卦、變卦的人事物用）：乾＝' + GUA_XIANG['乾'] + '；兌＝' + GUA_XIANG['兌'] + '；離＝' + GUA_XIANG['離'] + '；震＝' + GUA_XIANG['震'] + '；巽＝' + GUA_XIANG['巽'] + '；坎＝' + GUA_XIANG['坎'] + '；艮＝' + GUA_XIANG['艮'] + '；坤＝' + GUA_XIANG['坤'] + '。');
    L.push('類象請與問題、本互變、體用和動爻交叉使用，挑選真正相關且可驗證的線索。');
    L.push('');
    L.push("互卦不只抄卦名：分上互與下互的五行，分別與原體卦比較生剋，再看互卦之間是否制約本卦的助力或阻力。變後體仍取原體，動爻所在的用卦改變；不為求吉而交換體用。");
    L.push("天時、尋物、感情、求財等題有各自取象方式；先看原問題需要何種現象，再用本互變與旺衰交叉選象。無現場外應資料時明說未用外應，不編造聽到、看到或感應到的徵兆。");
    L.push("本吉變受制時說清有利條件為何可能耗損，本受制變得助時說清轉機依賴什麼；體用屬主從與作用比喻，不能用體克用鼓勵控制伴侶或他人。");
    L.push("同一動爻形成變卦，因此動爻與變卦不是兩份獨立佐證。卦數、動爻、月份符號可作傳統取象的候選，但未經日曆推導與現實資料支持時不能報確切日期。");
    var _readingQuality=window.JY_READING_QUALITY;
    // 舊頁面可能快取到舊版共用規則：即使介面同名，也不可把舊寫作契約混回新提示詞。
    // 按能力及最低相容版本挑選，不鎖死 6.0.0，以免往後相容版本退回備援。
    var _qualityCurrent=false;
    try {
      var _v=String(_readingQuality&&_readingQuality.readingVersion||'').split('.').map(Number);
      _qualityCurrent=!!(_readingQuality&&_v.length===3&&_v.every(Number.isInteger)&&
        (_v[0]>=8)&&typeof _readingQuality.lines==='function'&&
        typeof _readingQuality.methodKinds==='function'&&_readingQuality.methodKinds().includes('meihua'));
    } catch(e) { _qualityCurrent=false; }
    L=L.concat(_qualityCurrent?_readingQuality.lines('meihua'):JY_READING_MEIHUA);
    L.push('【判讀方法】');
    L.push('判讀參考：體用與旺衰定主調，本互變、動爻核轉折；錯綜卦與類象只有改變答案時才補充。');
    L.push('2. 體用基本關係可依《梅花易數》傳統語義理解，再按雙方旺衰、動爻和變卦校準實際力度：');
    L.push('　・用生體＝有進益之喜：外力來助。');
    L.push('　・比和＝百事順遂：同氣相順，但突破幅度另看旺衰。');
    L.push('　・體剋用＝主動在體、較有掌控；體弱剋旺用時落實較費力。');
    L.push('　・體生用＝有耗失之患：體在洩耗，先看投入是否值得。');
    L.push('　・用剋體＝外力制約、阻力較明顯；用衰時影響減輕，用旺體弱時較重。');
    L.push('3. 訊號衝突時給出主判與牽制，說明哪些現實條件會讓結果轉強、轉弱或改變；具象線索只採資料與情境支持的部分，不為生動而補造人物、場所或事件。');
    L.push('4. 題目問時間時，結合用近、互中、變遠、五行卦氣與盤內應期資料；時間精度請與資料相稱。');
    L.push('取互版本：本站純乾／純坤採《梅花易數・互卦起例》記載的「乾坤無互，互其變卦」支線，先翻本次動爻、再由變卦的2–4與3–5爻取互；其他卦直接由本卦取互。以實際排出的互卦判讀，不暗中更換算法。');
    // 解讀規則 6.0.0 與選品規則 4.3.0 各自版本化；舊選品檔可能仍帶新版
    // readingVersion，不能因此接受它的過時 recommendationText。
    var _recommendationCurrent=false;
    try {
      var _rv=String(_readingQuality&&_readingQuality.version||'').split('.').map(Number);
      _recommendationCurrent=!!(_qualityCurrent&&_rv.length===3&&_rv.every(Number.isInteger)&&
        (_rv[0]>4||_rv[0]===4&&(_rv[1]>=6))&&
        typeof _readingQuality.recommendationText==='function');
    } catch(e) { _recommendationCurrent=false; }
    L.push(_recommendationCurrent?_readingQuality.recommendationText('meihua'):JY_REC_MEIHUA);
    L.push('最後保留以下兩行：');
    L.push('[靜月之光蝦皮賣場](https://shopee.tw/a50h95648d?tab=shop)');
    L.push('願你諸事順遂。');
    return globalThis.JYReadingWorkflow.finish(L.join('\n'),{method:'meihua',question:question});
  }

  // ════════════════════════════════════════════════════════
  //  Public API
  // ════════════════════════════════════════════════════════
  window._meihuaShare = function () {
    if (!window.JYShareCard) { alert('\u5206\u4EAB\u5143\u4EF6\u8F09\u5165\u4E2D\uFF0C\u8ACB\u7A0D\u5019\u518D\u8A66'); return; }
    var mh = _mhResult || {};
    var concl = (mh.ty ? (mh.ty.r + '\uFF08' + mh.ty.f + '\uFF09\u30FB' + mh.ty.d) : '') + (mh.dong ? ' \u30FB \u52D5\u723B\u7B2C' + mh.dong + '\u723B' : '');
    // v80.39：補爻線資料——share-card v2.2 起直繪六爻卦象（陽實陰斷、動爻高亮）。
    //   本卦＝下卦.li＋上卦.li（由下而上）；互卦取 2-4/3-5 爻；變卦＝本卦動爻翻轉（與 calcMH 同式推導）
    var benL = (mh.lo && mh.lo.li && mh.up && mh.up.li) ? mh.lo.li.concat(mh.up.li) : null;
    var huL = null, biL = null;
    if (benL) {
      huL = mhNuclearContext(mh).lines.slice();
      biL = benL.slice(); if (mh.dong) biL[mh.dong - 1] = biL[mh.dong - 1] ? 0 : 1;
    }
    JYShareCard.open('meihua', {
      cardTitle: '\u6211\u7684\u5366\u8C61',
      spread: '\u6885\u82B1\u6613\u6578 \u30FB \u9AD4\u7528\u5360',
      question: _mhQuestion || '',
      cards: [
        { name: (mh.ben && mh.ben.n) || '', pos: '\u672C\u5366', lines: benL, dong: mh.dong },
        { name: (mh.hu && mh.hu.n) || '', pos: '\u4E92\u5366', lines: huL },
        { name: (mh.bian && mh.bian.n) || '', pos: '\u8B8A\u5366', lines: biL, dong: mh.dong }
      ],
      conclusion: concl
    });
  };

  window._meihuaStandaloneOpen = function () {
    _mhPhase = 'input'; _mhQuestion = ''; _mhMethod = 'time';
    _mhUpNum = ''; _mhLoNum = ''; _mhText = ''; _mhResult = null; _lastPrompt = '';
    var w = _getWrap();
    w.style.display = 'block';
    try { document.body.style.overflow = 'hidden'; } catch(e){} // 鎖背景捲動，避免固定層與底頁互搶造成抖動
    _render();
    w.scrollTop = 0;
  };
  window._meihuaClose = function () {
    _castEpoch++;
    if(window.JYRitual)window.JYRitual.cancel('meihua');
    var w = _getWrap();
    if (w) w.style.display = 'none';
    try { document.body.style.overflow = ''; } catch(e){}
  
    if (window.JY_ATELIER) window.JY_ATELIER.restoreEntrance();
  };
  window._mhSetMethod = function (m) {
    var qEl = document.getElementById('mhx-q'); if (qEl) _mhQuestion = qEl.value;
    var uEl = document.getElementById('mhx-up'); if (uEl) _mhUpNum = uEl.value;
    var lEl = document.getElementById('mhx-lo'); if (lEl) _mhLoNum = lEl.value;
    var tEl = document.getElementById('mhx-text'); if (tEl) _mhText = tEl.value;
    _mhMethod = m;
    _render();
  };
  function _finishCast(nums) {
    _showLoading(function () {
      try {
        _mhResult = calcMH(nums.up, nums.lo, nums.dong, nums.context);
        _lastPrompt = buildMeihuaPrompt(_mhQuestion, _mhResult);
        _mhPhase = 'result';
        _render();
        _getWrap().scrollTop = 0;
      } catch (e) {
        console.error('[meihua] cast error', e);
        alert('起卦計算發生問題，請重試或改用另一種起卦方式。');
      }
    });
  }
  window._mhDoCast = function () {
    if(window.JYRitual && window.JYRitual.isActive())return;
    var epoch=++_castEpoch;
    var qEl = document.getElementById('mhx-q'); _mhQuestion = qEl ? qEl.value.trim() : '';
    var uEl = document.getElementById('mhx-up'); if (uEl) _mhUpNum = uEl.value;
    var lEl = document.getElementById('mhx-lo'); if (lEl) _mhLoNum = lEl.value;
    var tEl = document.getElementById('mhx-text'); if (tEl) _mhText = tEl.value;
    if (typeof calcMH !== 'function') { alert('梅花引擎尚未載入，請重新整理頁面。'); return; }
    if (_mhMethod === 'char') {
      _castChar(function (nums) { if (epoch===_castEpoch && nums) _finishCast(nums); });
    } else {
      var nums = _castNumbers();
      if (!nums) return;
      _finishCast(nums);
    }
  };
  window._mhCopy = function () {
    if (!_lastPrompt) return;
    var ok = function () {
      var btn = document.querySelector('.mhx-ai-copy-btn');
      if (btn) { var o = btn.innerHTML; btn.innerHTML = '✓ 已複製！貼到 AI 送出即可'; btn.style.borderColor = 'rgba(52,211,153,.5)'; setTimeout(function(){ btn.innerHTML = o; btn.style.borderColor = ''; }, 2500); }
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(_lastPrompt).then(ok, function(){ _fallbackCopy(_lastPrompt); ok(); });
    } else { _fallbackCopy(_lastPrompt); ok(); }
  };
  window._mhOpenAI = function (id, url, btn) {
    var open = function () {
      var s = btn && btn.querySelector('span'); var nm = s ? s.textContent : '';
      if (s) s.textContent = '已複製！';
      setTimeout(function(){ window.open(url, '_blank'); }, 280);
      setTimeout(function(){ if (s) s.textContent = nm; }, 2000);
    };
    if (!_lastPrompt) { window.open(url, '_blank'); return; }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(_lastPrompt).then(open, function(){ _fallbackCopy(_lastPrompt); open(); });
    } else { _fallbackCopy(_lastPrompt); open(); }
  };
  window._mhReset = function () {
    _mhPhase = 'input';
    _render();
    _getWrap().scrollTop = 0;
  };

  function _fallbackCopy(text) {
    try { var ta = document.createElement('textarea'); ta.value = text; ta.style.cssText = 'position:fixed;left:-9999px'; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta); } catch (e) {}
  }

})();
