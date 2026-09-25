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
// BEGIN GENERATED READING JY_READING_LENORMAND
var JY_READING_LENORMAND = [
  "【白話優先】【像命理師當面解惑】使用繁體中文直接對提問者說話，先回答，再解釋：先答原問題。開頭2～3句給有依據的方向、真正卡點或優先行動；正文只呈現結論及必要依據，讓理由服務解答。\n單一複雜題通常用4～6段自然段落；簡單題簡答，多子題逐題先答。挑2～4組最有解釋力的已提供盤面資料，每段先說對提問者意味什麼，再以具體符號／結構說明如何落到原問題。段落按使用者要解決的事組織，方法資料留作判讀。\n【主判前核對】讀完整有效資料後才成判。交代最重要的牽制或相反訊號，說清它改變哪部分；同一訊號若對不同人物或方向作用相反，要分開說清。本命、當期觸發與條件走向分層，同源訊號不重複加權。依據相持就保留未定部分，完成其餘可判內容。替代讀法只有會實質改變答案時才簡短提出。\n把可核對的排盤／抽取事實、傳統方法的解釋、對個案的推論分清楚。具體情境未由使用者提供時，以「若實際出現…」提出核對，不能寫成已發生。象徵不證明病情、他人心念或事件；限制集中一次。醫療、法律、財務行動另依現實資料與專業依據，不冒稱由盤面證明。\n答案要落到現實：方法題說先做什麼及怎麼開口，結構題說最關鍵的一個循環，決策題比較相同標準，時間題只用已提供資料的精度。以1～3項可執行做法或觀察指標收束，指出什麼具體條件會支持、削弱或改變判斷。親密互動取得每位參與者明確、無壓力且可撤回的同意。\n成稿再讀一次：第一段是否已解答？主要結論是否有本次依據與反證？每段是否增加新答案？刪去重複講同一組訊號的段落；把「多溝通、給空間、步調不同」落實成誰、何事、如何做。先完成解答，最後才用短段落承接單一選品。",
  "【方法參考：供判讀，不是正文清單】只啟用本次有資料的方法；輸出依上述規則，方法說明不另設回答格式。",
  "【雷諾曼：完整牌句】依原問題→相鄰牌→完整長線→實際位置選主義；相鄰 A→B 是主題與修飾的關係，加入C後重讀全句。中間牌要有實際功能，末牌與全線共同定落點；這些是判讀方法，正文直接說牌句在本題的意思。",
  "短線先讀相鄰組合再讀完整牌句。九宮格以中心及最切題的穿越線形成主判，外框、外圍線及鏡像只有提供新資訊時才補充。",
  "大牌陣先讀人物／主題近域與落宮，再延伸實際長線、距離、方向、鏡像及騎士步。遠距技巧不憑數量壓過近域主線，重複節點只算同一訊號。",
  "人物須有角色依據；月亮、蛇、狐狸等取義由組合限定，不由單牌認定第三者、職業、欺騙或私密事實。共同九宮格沒有獨立的人物支線時，只回答共同走向及個別未定部分。",
  "牌句最後要落到本題中的事、阻力與條件；同樣的魚、錨等符號在收入題與感情題不可照貼同一套文案。相鄰修飾是可採讀法，不把名詞加形容詞當唯一文法；先核全線語義是否連貫及是否遺漏轉折牌。",
  "【雷諾曼判讀主線】先把主題牌與相鄰牌組成一個具體生活句，再讓後續牌修改事情的方式、阻力和落點。以「誰的什麼事、透過什麼途徑、遇到哪個轉折」完成整條牌句；例如同一阻礙牌在開端可能限制起步，在收尾則可能限制完成，須由實際次序決定。",
  "九宮或大牌陣從本題人物／主題的核心線建立主判，再用落宮、近域與穿越線查原因及可用資源。兩方各有定位時分別說明靠近、投入與距離的條件；多條路線相反時，指出是各自立場不同、不同領域有代價，或主題仍被同一關鍵因素卡住。"
];
// END GENERATED READING JY_READING_LENORMAND
// BEGIN GENERATED RECOMMENDATION JY_REC_LENORMAND
var JY_REC_LENORMAND = "【本題延伸手鍊建議】先完整回答問題，再用一小段自然對話推薦一款具體手鍊；理由須引用本次一項有效盤面發現，連到提問者真正面對的需要與可採取的行動。選品規則不得影響前面的占卜判斷，不先選商品再反推需求。只選一個主項，必要時才補一個替代，不列商品清單、不重講判讀步驟。\n材質或色系要符合本法資料與已知偏好；證據不足以指定礦物時，坦白說是依本題方向挑的象徵性提醒，仍給一個可辨認的設計建議，不編造使用者偏好、喜忌或信仰，也不把五行／星盤象徵說成身體實際缺少某種礦物。命理取象不代表礦物有療效，也不能保證改變事件；不捏造商品庫存、價格、成分、產地或認證。\n手鍊建議放在分析與行動之後，用2～3句自然承接：給誰佩戴、單一可辨認的材質或設計、它提醒的具體行動，再邀請有興趣者到靜月之光挑選喜歡的款式。這是自選的配戴建議，不是付費解法。若提問者提到預算吃緊或暫不想購買，先用現有物件承載同一提醒，不能勸借貸或暗示不買會錯失轉機。不可為導購加重凶象、製造恐懼，亦不宣稱購買就能復合、治病或改運。最後保留指定賣場連結及祝福。\n【本法選材提醒】\n雷諾曼：依實際相鄰牌句與牌陣位置取主題；月亮不自動配月光石，心不自動配粉晶。";
// END GENERATED RECOMMENDATION JY_REC_LENORMAND
// ═══════════════════════════════════════
// 靜月之光 — 雷諾曼牌 Lenormand v21.0（型別語義圖與失敗關閉引擎）
// 2026/9/4：保留牌義、合法幾何與大牌陣位置資料，改由 AI 自身 Lenormand 知識整合牌組、長線、宮位、距離與方向。
// 五種牌陣只提供可驗證幾何；內容量完全由合法牌句產生的獨立命題決定，不依牌數、固定章節或預設篇幅。
// 每條合法路徑及全部連續片段先生成候選牌句，再以覆蓋帳本逐一確認新增、佐證、限定、反證、無關或不足；不採事件關鍵字表。
// 三張、五張、雙路、九宮格與大牌陣均採同一完成標準：凡合法牌句能增加原問題答案內容，就必須解讀並呈現。
// 最終輸出合併同義佐證、保留所有獨立命題與條件分支，並將牌面機制轉成可觀察、可執行的現實方向。
// Petit Lenormand 36 張・相鄰組合句法・五牌陣共用引擎・品牌層獨立
// ═══════════════════════════════════════
(function () {
'use strict';
console.log('[Lenormand] 靜月之光 雷諾曼牌 v21.0 loaded — typed semantic graph engine');

// ════════════════════════════════════
// 一、36 張牌完整數據
// ════════════════════════════════════
var CARDS = [
  {id:1,  name:'騎士',  en:'Rider',      key:'消息・到來・速度',       scope:'消息、來訪、到來、快速移動、推進',                    guard:'消息好壞由相鄰牌決定；沒有圖像朝向資料時不判斷來向。'},
  {id:2,  name:'幸運草',en:'Clover',     key:'短暫機會・小幸運',       scope:'短暫機會、小幅有利、輕鬆、偶然、時間短',                guard:'機會通常有限或短暫，不等於長期保證。'},
  {id:3,  name:'船',    en:'Ship',       key:'遠方・移動・貿易',       scope:'遠方、旅行、移動、貿易、拓展、距離',                    guard:'是否延遲或順利必須由相鄰牌決定。'},
  {id:4,  name:'房屋',  en:'House',      key:'家庭・住處・根基',       scope:'家庭、住處、私人領域、根基、穩定結構、房產',             guard:'不自動等同婚姻或一定安全。'},
  {id:5,  name:'大樹',  en:'Tree',       key:'健康・生命・長期',       scope:'健康、身體、生命力、根源、成長、長期累積',               guard:'健康題只能談牌面傾向與就醫提醒，不作診斷。'},
  {id:6,  name:'雲',    en:'Clouds',     key:'混亂・不確定・遮蔽',     scope:'混亂、不確定、資訊模糊、看不清、反覆',                  guard:'只有牌組提供明暗面方向資料時，才可判斷哪一側較清晰；本系統未提供時禁止使用。'},
  {id:7,  name:'蛇',    en:'Snake',      key:'複雜・繞路・策略',       scope:'複雜、繞路、策略、誘惑、戒心、欺瞞風險',                 guard:'不自動等於第三者、壞女人或背叛；必須有問題脈絡與連線支持。'},
  {id:8,  name:'棺材',  en:'Coffin',     key:'結束・停擺・封閉',       scope:'結束、終止、停擺、封閉、失去、無法繼續',                guard:'不可為了好聽把結束改寫成必然重生或轉機。'},
  {id:9,  name:'花束',  en:'Bouquet',    key:'邀請・禮物・愉悅',       scope:'邀請、禮物、讚美、愉悅、吸引力、禮貌',                  guard:'不自動等於長期承諾。'},
  {id:10, name:'鐮刀',  en:'Scythe',     key:'突然切斷・決斷・風險',   scope:'突然切斷、快速決定、分離、收割、尖銳風險',               guard:'沒有牌面刀刃朝向資料時，不判斷切向哪一張牌。'},
  {id:11, name:'鞭子',  en:'Whip',       key:'重複・摩擦・衝突',       scope:'重複、摩擦、爭論、壓力、訓練、反覆行為',                 guard:'只有親密或性問題脈絡明確時，才可讀成性行為或性張力。'},
  {id:12, name:'鳥',    en:'Birds',      key:'對話・焦慮・短暫騷動',   scope:'對話、交換、電話、焦慮、八卦、成雙、短暫騷動',           guard:'不自動等於正式承諾或確定消息。'},
  {id:13, name:'孩子',  en:'Child',      key:'小・新・初階',           scope:'小、新開始、初學、孩子、單純、規模小、不成熟',            guard:'不自動推定懷孕或實際兒童，除非問題與連線支持。'},
  {id:14, name:'狐狸',  en:'Fox',        key:'自保・策略・工作風險',   scope:'自保、策略、警覺、自利、欺瞞風險；工作題可指任務或職務', guard:'不論任何題型都不可單張直接判定詐騙或犯罪。'},
  {id:15, name:'熊',    en:'Bear',       key:'力量・權威・資源',       scope:'力量、保護、權威、資源、財力、控制、佔有',               guard:'依問題判斷是資源、主管、保護者或控制，不可全部同時套用。'},
  {id:16, name:'星星',  en:'Stars',      key:'方向・清晰・希望',       scope:'方向、清晰、希望、指引、長程規劃、網絡',                 guard:'只有問題本身涉及數位平台或網路時，才可具體讀成線上管道。'},
  {id:17, name:'鸛',    en:'Stork',      key:'改變・遷移・轉換',       scope:'改變、遷移、轉換、調整、改善或不穩定',                  guard:'是否改善由相鄰牌決定；不自動推定懷孕。'},
  {id:18, name:'狗',    en:'Dog',        key:'朋友・忠誠・支持',       scope:'朋友、忠誠、信任、支持、熟人、依賴',                    guard:'不自動等於戀愛對象。'},
  {id:19, name:'塔',    en:'Tower',      key:'機構・權威・分隔',       scope:'機構、官方、公司、權威、獨立、距離、孤立、界線',          guard:'依問題與相鄰牌判斷是獨立、制度還是隔離。'},
  {id:20, name:'花園',  en:'Garden',     key:'公開・社交・群體',       scope:'公開場合、社交、群體、活動、曝光、觀眾、名聲',            guard:'不自動等於網路；只有問題脈絡支持時才可延伸為公開平台。'},
  {id:21, name:'山',    en:'Mountain',   key:'阻礙・封鎖・延遲',       scope:'阻礙、封鎖、延遲、距離、難以跨越、抗拒',                 guard:'除非問題本身詢問防守或固定不動，否則不可淡化成單純穩固。'},
  {id:22, name:'十字路口',en:'Crossroads',key:'選擇・分岔・猶豫',     scope:'選擇、替代方案、分岔、自由、猶豫、方向不一',              guard:'不自動代表多個對象，除非問題與連線支持。'},
  {id:23, name:'老鼠',  en:'Mice',       key:'消耗・流失・焦慮',       scope:'消耗、流失、侵蝕、減少、焦慮、細小損耗',                 guard:'不單張指控偷竊；犯罪只能描述可觀察風險。'},
  {id:24, name:'心',    en:'Heart',      key:'愛・喜歡・熱情',         scope:'愛、喜歡、熱情、情感投入、愉悅、欲望',                  guard:'不自動等於承諾、婚姻或關係穩定。'},
  {id:25, name:'戒指',  en:'Ring',       key:'承諾・協議・循環',       scope:'承諾、協議、合約、關係、循環、重複',                    guard:'承諾是否公平、持久或會結束由相鄰牌決定。'},
  {id:26, name:'書',    en:'Book',       key:'未知・秘密・知識',       scope:'未知、秘密、尚未揭露、知識、學習、紀錄',                 guard:'不單張推定秘密一定揭露，也不捏造秘密內容。'},
  {id:27, name:'信',    en:'Letter',     key:'文字・文件・通知',       scope:'文字訊息、文件、通知、紀錄、書面往來',                  guard:'消息好壞由相鄰牌決定；不自動等於合約成立。'},
  {id:28, name:'紳士',  en:'Man',        key:'男性人物・男性指示牌',   scope:'男性問卜者、明確指定的男性、或牌面中的重要男性',          guard:'角色須由性別聲明、預先指定與問題脈絡決定；不因單張推定成熟度。'},
  {id:29, name:'淑女',  en:'Woman',      key:'女性人物・女性指示牌',   scope:'女性問卜者、明確指定的女性、或牌面中的重要女性',          guard:'角色須由性別聲明、預先指定與問題脈絡決定；不因單張推定成熟度。'},
  {id:30, name:'百合',  en:'Lily',       key:'成熟・和平・倫理',       scope:'成熟、和平、和諧、長者、倫理、冷靜；親密題可指性',         guard:'只有親密問題脈絡明確時才讀性；不以牌號換算年齡。'},
  {id:31, name:'太陽',  en:'Sun',        key:'成功・活力・可見',       scope:'成功、活力、信心、清楚、曝光、熱度、成果',               guard:'不等於任何具體事件必然成功，仍須服從整條組合。'},
  {id:32, name:'月亮',  en:'Moon',       key:'情緒・認可・名聲',       scope:'情緒、認可、名聲、創意、週期、感受',                    guard:'名譽認可、感受與創意依題目和相鄰組合選義；部分現代讀法也談直覺或夢境，採用時說明語境，不由月亮單張判定戀愛身分或欺騙。'},
  {id:33, name:'鑰匙',  en:'Key',        key:'重要・確定・解法',       scope:'重要、確定、解法、開啟、關鍵條件、可行性',               guard:'確定的是相鄰組合所指內容，不可跳過中間牌。'},
  {id:34, name:'魚',    en:'Fish',       key:'金錢・生意・流動',       scope:'金錢、生意、交易、流動、資源、數量、自由',               guard:'不以牌號或單張推算精確金額。'},
  {id:35, name:'錨',    en:'Anchor',     key:'穩定・持續・工作',       scope:'穩定、持續、工作、長期、固定、停滯、執著',               guard:'是穩定還是卡住，由相鄰牌與問句決定。'},
  {id:36, name:'十字架',en:'Cross',      key:'負擔・痛苦・責任',       scope:'負擔、痛苦、責任、考驗、信仰、不得不承受',               guard:'不自動宣稱命中注定或不可改變。'}
];

// Contextual grammar, authored for this site. These guide selection among meanings;
// they are not fixed pair answers or an assertion about the person being asked about.
var COMBINATION_ROLES = [null,
  '先找消息／來訪帶來什麼，再看後牌使它加快、受阻、改向或落實；人物讀法需與題目角色相符。',
  '把相鄰事物限定成容易把握但幅度或時間有限的機會；後續是否有人承接，決定它會不會持續。',
  '看人、資源或計畫如何離開熟悉範圍；相鄰牌交代目的、阻力、交換與距離造成的影響。',
  '可作家庭／私生活的主題，也可把相鄰內容限定於熟悉、固定或私人範圍；要說清被穩定的是生活、關係還是某種習慣。',
  '看累積與根源如何影響當下，或相鄰事物如何長期發展；成長速度、承受力與健康題的生活層面須由組合限定。',
  '辨認哪個主題變得難以看清、反覆或難以判斷，再看後續有無澄清通道；未提供明暗朝向時以真實牌序解釋。',
  '把相鄰主題讀成迂迴、多重考量或需要策略的處境；戀愛、競爭、自保等讀法須比較哪一種最能解釋整條線。',
  '指出什麼結束、停擺或退出，以及這個終止對後續造成什麼影響；前後牌共同決定是必要結束還是進展受阻。',
  '看邀請、善意、賞識或吸引如何進入局勢；後牌交代這份愉悅能否轉成持續行動，或只是一次禮貌互動。',
  '辨認突然改變或決斷切入哪個議題、造成何種分離或收割；力度和後果由相鄰牌限定，朝向以實際資料為準。',
  '看哪件事反覆發生，重複是在練習、協商還是耗損；相鄰牌決定衝突的內容與能否停下來。',
  '把交流的對象、內容與情緒放回前後牌，分清溝通、議論、短暫不安或協調；後續是否落成安排要另看承接。',
  '可作實際孩子的主題，也可把事情修飾為剛開始、小規模、簡單或尚不成熟；選義要符合問題和整句。',
  '看相鄰議題需要何種警覺、策略或自保；工作語境可讀任務與職務，信任語境比較合理防備與利益不一致。',
  '辨認誰或什麼握有資源與影響力，再看這份力量是在支持、保護、擴張還是加重控制與負荷。',
  '看相鄰內容如何獲得方向、目標或清晰度；規劃與具體落實仍須由後續行動和條件承接。',
  '指出改變發生在哪個主題，是調整、遷移、改善還是反覆變動；前後狀態相比較，才能判斷變化的質量。',
  '看信任、熟悉與互相支持如何作用，並以相鄰牌判斷支持的方式、依賴的代價或友誼的發展。',
  '比較制度／機構與個人界線兩種語境：前者看規則與權力如何作用，後者看距離、獨立或隔離如何影響相鄰議題。',
  '把相鄰內容放到公開、群體或社交場域，說明曝光、人際連結與群體規範如何改變事情。',
  '辨認阻礙具體擋在哪一段、是時間、距離、抗拒還是條件不足；後牌是否提供繞行或持續封鎖的資訊。',
  '說清哪件事出現分岔、替代方向或猶豫；前牌提供選擇的背景，後牌限定選擇的方向或代價。',
  '看被消耗的是時間、資源、信任還是心力，以及流失是漸進還是已影響落實；後牌說明是否仍在持續。',
  '辨認喜歡與投入指向什麼，前後牌如何使它更熱烈、受限、轉移或持續；情感強度和正式關係是不同層面。',
  '先辨識承諾、協議、連結或循環的語境，再看相鄰牌限定其內容、約束力、穩定度與是否被中止。',
  '比較知識／學習與未公開／未知兩種讀法；看前後牌是在增加理解、保留資訊，還是指出需要弄清的內容。',
  '看書面交流具體承載哪件事，前牌給主題、後牌給性質或後續；通知、證明與協議要依整句區分。',
  '有可靠角色資料時作人物入口，讀其周圍的處境、行動與關係；未綁定時先解釋這個人物位置在全句扮演的作用。',
  '有可靠角色資料時作人物入口，讀其周圍的處境、行動與關係；未綁定時先解釋這個人物位置在全句扮演的作用。',
  '依題目比較成熟、平和、倫理、長者或親密層面，讓相鄰牌決定是沉穩、節制、和諧還是冷卻。',
  '看相鄰主題獲得什麼活力、能見度或成果；有阻力時解釋資源能否突破，有過量時解釋熱度帶來的代價。',
  '在感受／情緒投入與認可／名聲兩條語義中，依題目和前後牌選義；要說明誰對什麼有感受或獲得認可，不能僅把情緒存在換成伴侶身分。',
  '辨認已建立的主題如何變得重要、明確、可解或獲得入口；作中間牌時須說清它開啟或確立了哪個前後關係，肯定性所指的內容要先成立。',
  '看資源、交易或流動的來源、去向及是否能留存；自由與商業讀法依問題選擇，數量感不等於實際金額。',
  '看相鄰內容如何維持、固定或成為長期依靠；持續若有助題目是穩定，若鎖住改變則可能是停滯。',
  '辨認責任、負荷、痛苦或信念落在哪件事上，前後牌交代是否有承接、減輕或仍需面對的代價。'
];

var IMG_MAP = {
  1: 'ln-cards/ln-01-rider.png',
  2: 'ln-cards/ln-02-clover.png',
  3: 'ln-cards/ln-03-ship.png',
  4: 'ln-cards/ln-04-house.png',
  5: 'ln-cards/ln-05-tree.png',
  6: 'ln-cards/ln-06-clouds.png',
  7: 'ln-cards/ln-07-snake.png',
  8: 'ln-cards/ln-08-coffin.png',
  9: 'ln-cards/ln-09-bouquet.png',
  10: 'ln-cards/ln-10-scythe.png',
  11: 'ln-cards/ln-11-whip.png',
  12: 'ln-cards/ln-12-birds.png',
  13: 'ln-cards/ln-13-child.png',
  14: 'ln-cards/ln-14-fox.png',
  15: 'ln-cards/ln-15-bear.png',
  16: 'ln-cards/ln-16-stars.png',
  17: 'ln-cards/ln-17-stork.png',
  18: 'ln-cards/ln-18-dog.png',
  19: 'ln-cards/ln-19-tower.png',
  20: 'ln-cards/ln-20-garden.png',
  21: 'ln-cards/ln-21-mountain.png',
  22: 'ln-cards/ln-22-crossroads.png',
  23: 'ln-cards/ln-23-mice.png',
  24: 'ln-cards/ln-24-heart.png',
  25: 'ln-cards/ln-25-ring.png',
  26: 'ln-cards/ln-26-book.png',
  27: 'ln-cards/ln-27-letter.png',
  28: 'ln-cards/ln-28-man.png',
  29: 'ln-cards/ln-29-woman.png',
  30: 'ln-cards/ln-30-lily.png',
  31: 'ln-cards/ln-31-sun.png',
  32: 'ln-cards/ln-32-moon.png',
  33: 'ln-cards/ln-33-key.png',
  34: 'ln-cards/ln-34-fish.png',
  35: 'ln-cards/ln-35-anchor.png',
  36: 'ln-cards/ln-36-cross.png',
};

// ════════════════════════════════════
// 二、牌陣定義
// ════════════════════════════════════
var SPREADS = {
  three: { id:'three', name:'三張線', en:'Three-Card Line', count:3,
    desc:'現代短線讀法。三個合法片段全部成句，輸出深度由其獨立語義產出決定。',
    positions:['第1張','第2張','第3張']
  },
  five: { id:'five', name:'五張線', en:'Five-Card Line', count:5,
    desc:'現代長線讀法。十個連續片段逐層折疊，保留全部新增命題與條件。',
    positions:['第1張','第2張','第3張','第4張','第5張']
  },
  choice: { id:'choice', name:'雙路比較', en:'Two-Path Comparison', count:7,
    desc:'現代對稱比較。兩路各自完整產生命題，再由共同情境以同一標準比較。',
    positions:['A1','A2','A3','共同背景','B1','B2','B3'],
    layout:'choice'
  },
  nine: { id:'nine', name:'九宮格', en:'Nine-Card Box (3×3)', count:9,
    desc:'現代九張方陣。八條線與全部相鄰關係形成交會語義網，深度由有效命題決定。',
    positions:['第1格','第2格','第3格','第4格','中心','第6格','第7格','第8格','第9格'],
    layout:'3x3'
  },
  grand: { id:'grand', name:'大牌陣', en:'Grand Tableau', count:36,
    desc:'36張全牌陣。30條主盤直線與獨立末排完整覆蓋，合併為不重複的跨線命題網。',
    positions:null,
    layout:'8-8-8-8-4'
  }
};
SPREADS.two={id:'two',name:'雙牌組合',en:'Card Pair',count:2,positions:['主題','修飾'],desc:'以主題與修飾讀一句話；適合日常短問'};
SPREADS.seven={id:'seven',name:'七張線',en:'Line of Seven',count:7,positions:['第1張','第2張','第3張','中心第4張','第5張','第6張','第7張'],desc:'單一事件的較長發展線；中心與鏡像輔讀'};
SPREADS.grand_nines={id:'grand_nines',name:'大牌陣・4×9',en:'Grand Tableau of Nines',count:36,positions:null,layout:'4x9',desc:'四排各九張；全盤落宮、近域、鏡像與騎士步'};
SPREADS.branches={id:'branches',name:'多子題／多選項分線',en:'Independent Lines',count:6,positions:null,layout:'branches',desc:'本站自訂：每個子題或選項各抽三張，抽牌前固定人物與問題；最多六路'};
SPREADS.three.desc='以相鄰組合與完整三張句回答單一短問';
SPREADS.five.desc='單一事件的中心、發展與轉折；以完整五張句形成主判';
SPREADS.grand.name='大牌陣・4×8＋4';
var _lnReadingPlan=null;
function _lnBuildSpreadDef(id,question){
  if(!SPREADS[id])throw new Error('雷諾曼牌陣未完成或未知牌陣');
  var def=JSON.parse(JSON.stringify(SPREADS[id])),plan=analyzeReadingQuestion(question);
  def.questionPlan=plan;
  if(id==='branches'){
    if(!plan.ready)throw new Error(plan.notes.join(' '));
    var branches=plan.branches.length?plan.branches:[{id:'SUBJECT_1',question:'原問題',entity:'',scope:''}];
    def.count=branches.length*3;def.positions=[];def.branches=branches;
    branches.forEach(function(b,i){for(var j=0;j<3;j++)def.positions.push('第'+(i+1)+'路・'+(b.entity||b.question)+'・'+(j+1));});
    def.name=SPREADS.branches.name+'（'+branches.length+'路）';
  }
  return def;
}
function _lnGrandNineGeometry(drawn){
  function coord(i){return {row:Math.floor(i/9),col:i%9};}
  function index(r,c){return r>=0&&r<4&&c>=0&&c<9?r*9+c:-1;}
  var cells=drawn.map(function(card,i){
    var c=coord(i),neighbors=[],knights=[];
    for(var dr=-1;dr<=1;dr++)for(var dc=-1;dc<=1;dc++){var n=index(c.row+dr,c.col+dc);if((dr||dc)&&n>=0)neighbors.push(n);}
    [[1,2],[1,-2],[-1,2],[-1,-2],[2,1],[2,-1],[-2,1],[-2,-1]].forEach(function(d){var n=index(c.row+d[0],c.col+d[1]);if(n>=0)knights.push(n);});
    return {index:i,row:c.row,col:c.col,house:i+1,cardId:card.id,neighbors:neighbors,knights:knights,horizontal:index(c.row,8-c.col),vertical:index(3-c.row,c.col)};
  }),lines=[];
  [[0,1],[1,0],[1,1],[1,-1]].forEach(function(d){
    cells.forEach(function(c){if(index(c.row-d[0],c.col-d[1])>=0)return;var line=[],r=c.row,k=c.col,n;
      while((n=index(r,k))>=0){line.push(n);r+=d[0];k+=d[1];}if(line.length>=2)lines.push(line);
    });
  });
  return {width:9,height:4,cells:cells,lines:lines,corners:[0,8,27,35]};
}


// ════════════════════════════════════
// 三、洗牌與抽牌
// ════════════════════════════════════
var _lnDeck = [];
var _lnDrawn = [];
var _lnSpread = 'auto';      // v2.6：預設自動判斷（使用者仍可手動選）
var _lnResolved = 'three';   // v2.6：實際抽牌用的牌陣（auto 解析後）
var _lnAutoPick = null;      // v2.6：自動判斷結果 {id, why}，供結果區標示
var _lnQuestion = '';
var _lnSigGender = null; // for Grand Tableau（未聲明性別時的暫定定位，會被 _lnGender 覆寫）
var _lnGender = (function(){ try { return localStorage.getItem('jy_ln_gender') || null; } catch(e){ return null; } })(); // v3.1：問卜者性別（男/女/未聲明）——人物牌歸屬與 GT 代表牌的權威來源
var _lnSignif = null;        // v3.0：指示牌 card id（1-36）或 null＝不使用。28男士/29女士＝問卜者；任一張可作主題指示牌（signifier）。
                             //   v4.0：九宮格置中屬現代焦點法；大牌陣不預置、在36張中定位；線讀不預置。

function _lnSecRand() { // v3.6 密碼學隨機（決定牌序的唯一隨機源；退路 Math.random）
  try { var _u = new Uint32Array(1); (window.crypto || window.msCrypto).getRandomValues(_u); return _u[0] / 4294967296; }
  catch (e) { return Math.random(); }
}
function _lnRandInt(max){
  if(typeof window._secInt==='function')return window._secInt(max);
  if(!Number.isInteger(max)||max<1||max>4294967296)throw new RangeError('無效的洗牌範圍');
  var cr=window.crypto||window.msCrypto;
  if(cr&&cr.getRandomValues){
    var u=new Uint32Array(1),limit=Math.floor(4294967296/max)*max;
    for(var i=0;i<128;i++){cr.getRandomValues(u);if(u[0]<limit)return u[0]%max;}
    throw new Error('隨機來源未產生有效樣本');
  }
  return Math.floor(Math.random()*max);
}
function shuffleDeck() {
  _lnDeck = CARDS.map(function(c){ return JSON.parse(JSON.stringify(c)); });
  // Fisher-Yates
  for (var i = _lnDeck.length - 1; i > 0; i--) {
    var j = _lnRandInt(i + 1); // v3.6 密碼學隨機洗牌
    var t = _lnDeck[i]; _lnDeck[i] = _lnDeck[j]; _lnDeck[j] = t;
  }
  _lnDrawn = [];
}

function drawCards(count) {
  shuffleDeck();
  _lnDrawn = _lnDeck.slice(0, count);
  return _lnDrawn;
}

// ════════════════════════════════════
// 四、正統提示詞生成
// ════════════════════════════════════
// ── v7.0 問題→牌陣：按問題重點、選項與資料邊界選陣，牌義由AI綜合 ──
function _lnEscapeHTML(value) {return String(value||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
function _lnLocalISODate() {
  var d = new Date();
  var p = function(n){ return String(n).padStart(2, '0'); };
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
}

function _lnCleanChoiceOption(s) {
  return String(s || '')
    .replace(/[？?。！!；;]+$/g, '')
    .replace(/^(?:我)?(?:到底)?(?:該|要|應該|選擇|選|考慮)\s*/g, '')
    .replace(/(?:哪一個|哪個)?(?:比較|較)?(?:適合(?:我)?|好|有利|值得)(?:我)?\s*$/g, '')
    .trim();
}

function _lnCountMatches(text, re) {
  var m = String(text || '').match(re);
  return m ? m.length : 0;
}

// 問句只作方法選擇；原文完整保留。不是以牌陣大小表示準確率。
function _lnSpreadDirectives(q) {
  var defs = [
    ['grand_nines',/4\s*[x×]\s*9|9\s*[x×]\s*4|九張大牌陣|Grand Tableau of Nines/ig],
    ['seven',/七張線|7\s*張線/ig],['two',/雙牌組合|雙牌|兩張線|2\s*張線/ig],['branches',/分線解讀|多子題牌陣|多選項分線/ig],
    ['grand', /大牌陣|Grand\s*Tableau|(?:36|三十六)\s*張(?:牌陣|牌)?/ig],
    ['nine', /九宮格|(?:9|九)\s*(?:宮|張牌陣)|3\s*[x×]\s*3/ig],
    ['choice', /雙路比較|七張比較|二選一牌陣|A\s*\/\s*B牌陣/ig],
    ['five', /五張線|(?:5|五)\s*張牌陣/ig],
    ['three', /三張線|(?:3|三)\s*張牌陣/ig]
  ], events=[];
  defs.forEach(function(d){ var m; while((m=d[1].exec(q))){
    var prefix=q.slice(Math.max(0,m.index-24),m.index).split(/[，,。；;！？?\n]/).pop();
    var negative=/(?:不要|不用|不使用|不想用|別用|避免|排除|不要選|不選)(?:再|使用|採用|選擇|選|用|這個|那個|的|\s)*$/.test(prefix);
    var requested=/(?:請(?:幫我)?|麻煩(?:幫我)?)?(?:改用|使用|採用|選擇|選|用)\s*$/.test(prefix) && !/上次|之前|曾經|昨天/.test(prefix);
    if(negative||requested||q.trim()===m[0])events.push({id:d[0],at:m.index,negative:negative});
  }});
  if(events.some(function(e){return e.id==='grand_nines'&&!e.negative;}))events=events.filter(function(e){return e.id!=='grand'||e.negative;});
  events.sort(function(a,b){return a.at-b.at;});
  var excluded=[], explicit=null;
  events.forEach(function(e){if(e.negative){if(excluded.indexOf(e.id)<0)excluded.push(e.id);if(explicit===e.id)explicit=null;}else{explicit=e.id;excluded=excluded.filter(function(id){return id!==e.id;});}});
  return {explicit:explicit,excluded:excluded};
}
function _lnQuestionFocus(q) {
  return String(q||'').replace(/(?:不是|並非|不)(?:在)?(?:問|想問|要問)[^，,。；;！？?\n]*?(?=而是|[，,。；;！？?\n]|$)/g,'')
    .replace(/(?:請)?(?:不要|不用|不使用|別用|避免|排除)[^，,。；;！？?\n]{0,16}(?:大牌陣|九宮格|雙路比較|五張線|三張線|[三五九]|36)(?:張牌陣|張牌|張)?/g,'')
    .replace(/(?:請(?:幫我)?|麻煩(?:幫我)?)?(?:改用|使用|採用|選擇|用)\s*(?:大牌陣|Grand\s*Tableau|九宮格|雙路比較|七張比較|五張線|三張線|[三五九]\s*張牌陣|36\s*張(?:牌陣|牌)?)(?:來)?(?:分析|解讀|看)?/ig,'').trim();
}
function _lnDomainIds(q) {
  return [['love',/感情|愛情|婚姻|桃花|戀愛|復合|伴侶|前任|男友|女友/],['work',/工作|事業|職場|轉職|離職|升遷|創業|生意|錄取|主管|職位/],['money',/財運|財務|投資|收入|負債|現金流|營業額|營收|業績|獎金|中獎|開獎|統一發票|發票|抽獎|付款|入帳|薪資|薪水|賺錢/],['family',/家庭|家人|親子|父母|子女/],['study',/學業|考試|進修|證照/],['health',/健康|睡眠|身體/],['travel',/旅行|搬家|移居/]].filter(function(d){return d[1].test(q);}).map(function(d){return d[0];});
}

// BEGIN SHARED DECISION PARSER
// Canonical source, embedded in both independent readers by build-decision-parser.cjs.
// This is a conservative language parser, not a claim that keywords understand every question.
function classifyDecisionQuestion(question) {
  var raw = String(question || '').trim();
  function result(kind, left, right, reason) {
    return {kind:kind, left:left || null, right:right || null, source:raw, reason:reason || ''};
  }
  function clean(value, first) {
    var s = String(value || '').trim().replace(/^[，,：:\s]+|[，,。？?！!；;\s]+$/g, '');
    s = s.replace(/(?:[，,]\s*)?(?:哪一個|哪個|何者)(?:比較|較|更)?(?:適合(?:我|我們)?|好|有利|可行|值得).*$/, '');
    s = s.replace(/(?:比較|較|更)(?:適合(?:我|我們)?|好|有利|可行|值得)(?:嗎|呢)?$/, '').replace(/[嗎呢]$/, '').trim();
    if (first) {
      s = s.replace(/^(?:請幫我|請問|請|幫我|我想知道|我想問|想問|我想|想)(?:比較)?\s*/, '').replace(/^比較\s*/, '');
      s = s.replace(/^(?:我|我們)(?:和|跟|與).{1,16}?(?:應該|該|要選|選擇|考慮)\s*/, '');
      s = s.replace(/^(?:我|我們)?(?:到底)?(?:應該|該|可以|要選|要|選擇|選|考慮)\s*/, '');
      s = s.replace(/^(?:我|我們)(?=留|接受|拒絕|全職|兼職|辭|離|搬|轉|去|繼續|開始)/, '');
    }
    return s.replace(/^[，,\s]+|[，,\s]+$/g, '');
  }
  if (!raw) return result('none');
  // Labels and their time qualifiers are part of the user's options. Do not strip dates/durations.
  if (/\bA(?:\s*[：:.、]|\s+)[\s\S]+\bB(?:\s*[：:.、]|\s+)[\s\S]+\bC(?:\s*[：:.、]|\s+)/i.test(raw) || /(?:^|[^A-Za-z])A\s*、\s*B\s*、\s*C(?:$|[^A-Za-z])/i.test(raw) || /(?:三|四|五|3|4|5)(?:個|家|種)?(?:選項|方案|選擇)|三選一|三擇一|四選一/.test(raw)) return result('multiple', null, null, '超過兩個方案，不能套成只有 A、B 的牌位。');
  if(/(?:^|[，,：:\s])A(?:\s*[：:.、]|\s+)[\s\S]*B\s*[：:.、]\s*[？?]?\s*$/i.test(raw))return result('incomplete');
  var labelled = raw.match(/(?:^|[，,：:\s])A(?:\s*[：:.、]\s*|\s+)([\s\S]+?)\s*(?:還是|或者|或是|或|與|和|跟|vs\.?|versus)?\s*B(?:\s*[：:.、]\s*|\s+)([\s\S]+?)(?:[。！？?]|$)/i);
  if (labelled && !/^(?:還是|或者|或是|或|or|vs\.?)\s*$/i.test(labelled[1].trim())) {
    var la = clean(labelled[1].replace(/(?:還是|或者|或是|或|與|和|跟|vs\.?)\s*$/i, ''), false), lb = clean(labelled[2], false);
    return la && lb ? result('binary', la, lb, '使用原文明確標示的 A、B 方案。') : result('incomplete');
  }
  var q = raw.split(/[？?！!。；;\n]/)[0].trim();
  var connector = /還是|或者|或是|或(?!許)|\bor\b|\bversus\b|\bvs\.?\b/ig;
  var matches = [], m;
  while ((m = connector.exec(q))) matches.push({at:m.index, value:m[0]});
  var decisionCue = /(?:我|我們)(?:(?:和|跟|與).{1,16})?(?:到底)?(?:該|應該|可以|要|想選|選|考慮)|^(?:該|應該|要|選|考慮)|(?:方案|選項)(?:是|有|為)|二選一|二擇一|兩個選項|請比較|(?:哪一個|哪個|何者|哪裡|哪邊|哪一邊)(?:比較|較|更)?(?:適合|好|有利|可行|值得)?|(?:該|應該)選|比較.{0,50}(?:適合|有利|好|值得)/.test(q);
  if (matches.length > 1 && decisionCue) return result('multiple', null, null, '原文有三個以上選項，先整理共同條件，不能假造第三條路的牌位。');
  var takeOrWait = !matches.length && q.match(/^(?:請問|我想知道|想問)?(?:我|我們)?(?:到底)?(?:該不該|要不要|應不應該)\s*(.+?)(?:[，,]|$)/);
  if (takeOrWait) {
    var action = clean(takeOrWait[1], false);
    return action ? result('binary', action, '暫不採取「' + action + '」，維持目前安排', '比較採取這個行動與暫不採取，沒有新增其他方案。') : result('incomplete');
  }
  var left = '', right = '';
  if (matches.length === 1) {
    left = clean(q.slice(0, matches[0].at), true); right = clean(q.slice(matches[0].at + matches[0].value.length), false);
    if (!left || !right) return result('incomplete', left, right, '請把另一個方案補齊，才能分別安排兩路牌位。');
    if (decisionCue && /[、]/.test(left + right)) return result('multiple');
    if (decisionCue && /(?:選|考慮)[^，,]+[，,][^，,]+$/.test(q.slice(0, matches[0].at).replace(/[，,\s]+$/, ''))) return result('multiple');
    // 「她還是喜歡我嗎」means "still", not A=her, B=likes me.
    if (/^(?:他|她|你|我|它|對方|我們|他們|她們)(?:現在|最近|今年|明年)?$/.test(left)) return result('none', null, null, '「還是」在這裡表示仍然如此，不是兩個方案。');
    var actionStart = /^(?:先|暫時|繼續|直接|主動|全職|兼職|留在|留下|留職|離職|離開|辭職|轉職|接受|拒絕|搬到|搬去|搬家|移居|買|賣|租|投資|創業|接案|加入|報名|就讀|讀|念|告白|分手|復合|維持|放棄|聯絡|等待|去|不去|不買|不賣|不投資|暫不|跟.{1,12}告白)/;
    var labels = /^[AB甲乙](?:公司|方案|選項)?$/i.test(left) && /^[AB甲乙](?:公司|方案|選項)?$/i.test(right);
    // Polarity alternatives are one outcome proposition, not two hypotheses or two user choices:
    // 「會聯絡還是不聯絡」「喜歡還是不喜歡」「能成功還是不能成功」.
    function polarityCore(v){return String(v||'').replace(/^(?:我|你|他|她|它|對方|我們|你們|他們|她們)/,'').replace(/^(?:到底|現在|最近|未來|之後)/,'').replace(/^(?:會不會|會|能不能|能|可不可以|可以|是否|是不是|有沒有|有|可能)/,'').replace(/^(?:不會|不能|不可以|不可|沒有|沒|未|不)/,'').replace(/[嗎呢\s]/g,'').trim();}
    var lc=polarityCore(left), rc=polarityCore(right), rightNegative=/^(?:不會|不能|不可以|不可|沒有|沒|未|不)/.test(right), leftNegative=/^(?:不會|不能|不可以|不可|沒有|沒|未|不)/.test(left.replace(/^(?:我|你|他|她|它|對方|我們|你們|他們|她們)/,''));
    if(lc&&rc&&(rightNegative!==leftNegative)&&(lc===rc||lc.endsWith(rc)||rc.endsWith(lc)))return result('outcome_polarity',null,null,'這是同一事件的正反結果，不是兩個可採取方案，也不是兩個獨立原因假設。');
    var hypothesis = /^(?:只是|僅僅|單純)|禮貌|客氣|沒興趣|不喜歡|不愛|挑戰|變糟|失敗|生氣|隱瞞/.test(right) || /(?:會|能|是|喜歡|愛我|機會|變好|上漲|下跌)/.test(left);
    // 口語二選一常把第二個選項省略共同動詞，例如「買iPhone還是Samsung」「去台北還是高雄發展」。
    // 只有第一側明確是可執行動作、第二側是短方案名時才繼承動詞；不套用到「會不會／喜不喜歡」等結果假設。
    var sharedActionMatch = left.match(/^(買|賣|租|投資|去|到|留在|搬到|搬去|讀|念|用|選|加入|接受|拒絕|吃|換|改用)(.+)$/);
    var inheritedAction = sharedActionMatch && !actionStart.test(right) && right.length <= 24 && !/[嗎呢？?]/.test(right) && !hypothesis;
    if (inheritedAction) right = sharedActionMatch[1] + right;
    var explicitComparisonTail = /(?:比較|較|更)(?:適合(?:我|我們)?|好|有利|可行|值得)|(?:哪裡|哪邊|哪一邊).*(?:適合|好|有利|發展)/.test(q);
    if (!decisionCue && !explicitComparisonTail && !labels && !(actionStart.test(left) && actionStart.test(right)) && !inheritedAction) return result(hypothesis ? 'hypotheses' : 'ambiguous', null, null, '這是在詢問狀況或不同解釋；沒有確認是命主可選的兩個行動。');
    return result('binary', left, right, '先比較兩個原文方案各自的條件與走向，再看共同限制。');
  }
  // 「跟」can be inside an action. Use it as a separator only for an explicit comparison.
  var comparison = q.match(/^(?:請)?(?:幫我)?比較\s*(.+?)(?:與|和|跟)\s*(.+?)(?:[，,]\s*)?(?:哪個|哪一個|何者)(?:比較|較|更)?(?:適合|好|有利|可行)/) || q.match(/^(.+?)(?:與|和|跟)\s*(.+?)(?:[，,]\s*)?(?:哪個|哪一個|何者)(?:比較|較|更)?(?:適合|好|有利|可行)/);
  if (comparison) {
    left = clean(comparison[1], true); right = clean(comparison[2], false);
    if (left && right && !/^(?:我|我們|他|她|你)$/.test(left)) return result('binary', left, right, '按原問句的比較對象安排 A、B 牌位。');
  }
  if (/(?:還是|或者|或是|或)\s*$/.test(q)) return result('incomplete');
  if (/(?:要|該|應該)?選哪(?:一個|個)?[呢嗎]?$|^(?:我要|我該|我應該|請)?二選一$/.test(q)) return result('incomplete');
  return result('none');
}
// END SHARED DECISION PARSER

// BEGIN SHARED QUESTION PLANNER
// Canonical semantic question planner.
// Architecture: normalize -> clause frames -> coreference/dependency graph -> topology.
// Method engines consume the typed result; they do not need to recognize every surface wording.
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
    privateState:['暗戀','喜歡','愛','在乎','欣賞','心動','好感','討厭','害怕','擔心','懷疑','信任','想法','心裡','內心','真心','感受','態度','意圖','打算','有意思'],
    overtAction:['告白','表白','追求','聯絡','回覆','邀約','邀請','約會','交往','分手','復合','結婚','承諾','主動','靠近','示好','說出口','坦白','確認關係','錄取','升遷','付款','入帳','到貨','出貨','成交','簽約','離職','轉職','搬家','出發','回來'],
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
      travel:['旅行','旅遊','出國','搬家','移居','出發','行程']
    }
  };
  var SUBJECT_WORDS=['我','我們','你','你們','他','她','他們','她們','對方','這個人','那個人','有人','某人','女生','女性','男生','男性','異性','同事','女同事','男同事','異性同事','女性同事','男性同事','主管','客戶','朋友','好友','閨蜜','女友','男友','伴侶','前任','前男友','前女友','老婆','老公','妻子','丈夫','家人','媽媽','爸爸','父母','孩子'];
  var CONTINUATION=['未來','之後','後來','往後','接下來','再來','下一步','那','那麼','然後','後續','到時','如果','若','假如','所以','並且','以及','還有'];
  var ADVICE=['怎麼辦','做什麼','方法','策略','建議','下一步','怎麼做','如何做','怎麼改善','如何改善','怎麼處理','如何處理','該怎麼','應該怎麼','該如何','應該如何','要怎麼','要如何','可以怎麼','可以如何'];
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
    if(xs.length<2||xs.length>6||xs.some(function(x){return x.length>12||/(?:嗎|呢|為什麼|怎麼|如何|會不會|有沒有)/.test(x);}))return [];
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
    var t=s.replace(/\s+/g,'');
    if(/[嗎么]\s*$/.test(t))return true;
    if(YESNO_PREFIX.some(function(w){return t.indexOf(w)===0||t.indexOf(w)>0;}))return true;
    if(/還是(?:不|沒有|不能|不會|不可|不要)/.test(t))return true;
    // Modal-event questions in Chinese often omit 嗎, e.g.「明天會下雨？」
    if(/[？?]$/.test(String(s||'')) && /(?:會|能|可以|可能|可望|有機會)/.test(t) && !/(?:多少|幾|何時|什麼時候|為什麼|如何|怎麼|誰|哪個)/.test(t))return true;
    return false;
  }
  function inferPredicateClass(s,dims){
    var stateHits=matchAllWords(s,ONTOLOGY.privateState), actionHits=matchAllWords(s,ONTOLOGY.overtAction);
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
  function parseClause(text,index){
    var s=clean(text), dims=inferQuestionDimensions(s), entities=extractEntities(s), subject=extractSubject(s), domains=domainIds(s);
    var frame={
      id:'C'+(index+1),index:index,text:s,
      scope:scope(s),domains:domains,dimensions:dims,
      yesNo:detectYesNo(text),
      temporal:{future:hasAny(s,FUTURE)||/(?:會|將|可能|有機會)/.test(s),anchors:scope(s)},
      discourse:{continuation:CONTINUATION.some(function(w){return s.indexOf(w)===0;}),conditional:/^(?:如果|若|假如)|(?:如果|若|假如).*(?:就|才|再)/.test(s)},
      entities:entities,explicitSubjects:subject?[subject]:[],subjectRef:subject,subjectSource:subject?'explicit':'none',coreferenceCandidates:[],
      predicateClass:inferPredicateClass(s,dims),predicate:stripSurfaceOperators(s),
      privateState:hasAny(s,ONTOLOGY.privateState),overtAction:hasAny(s,ONTOLOGY.overtAction),actorBoundFutureEvent:false,
      hidden:/暗|秘密|隱|沒說|未公開|真心|內心|心裡/.test(s)||hasAny(s,ONTOLOGY.privateState),
      confirmedOccurrence:/(?:已經|已|確定|顯示|確認)(?:[^，,。？?；;]{0,10})(?:中獎|錄取|成交|付款|入帳|到貨|出貨|簽約|發生|成立)|(?:我|他|她|對方)?(?:中了|錄取了|成交了|付款了|入帳了|到了|出貨了|簽約了)/.test(s),
      futureAction:false,
      occurrenceQuery:false,measurement:null,role:'outcome'
    };
    if(dims.indexOf('reason')>=0)frame.role='reason';
    else if(dims.indexOf('advice')>=0)frame.role='action_advice';
    else if(dims.indexOf('timing')>=0)frame.role='timing';
    else if(dims.indexOf('identity')>=0||dims.indexOf('profile')>=0||dims.indexOf('age')>=0)frame.role='profile';
    else if(frame.privateState)frame.role='hidden_state';
    else if(frame.overtAction||frame.temporal.future)frame.role='future_or_event_action';
    if(dims.indexOf('amount')>=0)frame.measurement='amount';
    else if(dims.indexOf('count')>=0)frame.measurement='count';
    else if(dims.indexOf('quantity')>=0)frame.measurement='quantity';
    else if(dims.indexOf('probability')>=0)frame.measurement='probability';
    else if(dims.indexOf('age')>=0)frame.measurement='age';
    else if(dims.indexOf('timing')>=0)frame.measurement='timing';
    frame.requestedPrecision=frame.measurement?'exact_or_value':((dims.indexOf('identity')>=0)?'exact_identity':((dims.indexOf('profile')>=0)?'qualitative_profile':'symbolic'));
    frame.epistemicScope=frame.privateState?'private_unobserved':(frame.temporal.future?'future_unobserved':'observable_or_present');
    var eventModal=/(?:會|能|可以|可能|可望|有機會|可不可以|能不能|會不會)/.test(s);
    frame.occurrenceQuery=frame.yesNo||(eventModal && frame.predicateClass!=='private_state');
    // futureAction is actor-bound behaviour, not every future event/measurement.
    frame.futureAction=frame.temporal.future && (frame.overtAction||frame.predicateClass==='event_action');
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

  // Sentence boundaries are structural. A comma only splits when it explicitly opens another topic.
  var parts=q.split(/[？?。；;\n]+|[，,](?=(?:另外|還有|以及|也想問|至於))/).map(clean).filter(Boolean);
  var frames=parts.map(parseClause), edges=[];

  // Discourse coreference is resolved before topic/domain routing. A lexical domain shift must not hide an ambiguous pronoun.
  for(var i=1;i<frames.length;i++){
    var prev=frames[i-1], cur=frames[i];
    var pron=pronounAtStart(cur.text);
    if(pron){
      var coref=resolvePronounFromContext(pron,frames.slice(0,i));
      if(coref.status==='resolved'){
        cur.subjectRef=coref.value;cur.subjectSource='coreference';cur.coreferenceCandidates=coref.candidates.slice();
      } else if(coref.status==='ambiguous'){
        cur.subjectRef=null;cur.subjectSource='ambiguous_coreference';cur.coreferenceCandidates=coref.candidates.slice();
      } else {
        cur.subjectRef=null;cur.subjectSource='unresolved_coreference';cur.coreferenceCandidates=[];
      }
    }
    // Domain change normally starts a new topic. One structural exception: a subjectless/coreferential future yes/no clause can continue a previous private-state claim about the same actor.
    var dependentActorCarry=!!((!cur.subjectRef||cur.subjectSource==='coreference')&&prev.subjectRef&&prev.privateState&&cur.temporal&&cur.temporal.future&&cur.yesNo&&!cur.privateState&&!cur.measurement&&(cur.discourse.continuation||cur.discourse.conditional||cur.subjectSource==='coreference'));
    var disjointDomains=cur.domains.length&&prev.domains.length&&cur.domains.every(function(d){return prev.domains.indexOf(d)<0;});
    var newDomainAfterUnscoped=cur.domains.length&&!prev.domains.length&&!cur.discourse.continuation&&!cur.discourse.conditional&&cur.subjectSource!=='coreference';
    var domainSwitch=!!((disjointDomains||newDomainAfterUnscoped)&&!dependentActorCarry);
    var newExplicit=cur.explicitSubjects.length>0 && prev.subjectRef && cur.explicitSubjects.indexOf(prev.subjectRef)<0 && !pron;
    if(!cur.subjectRef && cur.subjectSource!=='ambiguous_coreference'&&cur.subjectSource!=='unresolved_coreference'&&!domainSwitch){
      cur.subjectRef=prev.subjectRef||'DISCOURSE_ENTITY_'+i;
      cur.subjectSource='inherited';
    }
    // After coreference is resolved, an open-class future predicate attached to a person is still an actor-bound future event even when the verb is not in the finite action lexicon.
    cur.actorBoundFutureEvent=!!(cur.temporal&&cur.temporal.future&&cur.subjectRef&&!cur.privateState&&!cur.measurement&&['reason','action_advice','timing','profile'].indexOf(cur.role)<0);
    if(cur.actorBoundFutureEvent&&cur.role==='outcome')cur.role='future_or_event_action';
    var sameActor=!!cur.subjectRef && !!prev.subjectRef && cur.subjectRef===prev.subjectRef;
    var linked=false, type='';
    var operatorFollowUp=['reason','action_advice','timing'].indexOf(cur.role)>=0&&!cur.domains.length;
    if(!domainSwitch&&(!newExplicit||operatorFollowUp)){
      if(prev.privateState && (cur.futureAction||cur.actorBoundFutureEvent)){type='hidden_state_to_future_action_same_actor';linked=true;}
      else if(prev.occurrenceQuery && cur.measurement){type='occurrence_to_measurement';linked=true;}
      else if((prev.occurrenceQuery||prev.futureAction||prev.privateState) && ['reason','action_advice','timing','profile'].indexOf(cur.role)>=0){type='event_to_'+cur.role;linked=true;}
      else if(['reason','action_advice'].indexOf(prev.role)>=0 && ['reason','action_advice','outcome','future_or_event_action'].indexOf(cur.role)>=0){type='diagnostic_bundle';linked=true;}
      else if(['reason','action_advice'].indexOf(cur.role)>=0 && ['reason','action_advice','outcome','future_or_event_action'].indexOf(prev.role)>=0){type='diagnostic_bundle';linked=true;}
      else if(cur.discourse.continuation||cur.discourse.conditional){type='discourse_continuation';linked=true;}
    }
    if(linked)edges.push({from:i-1,to:i,type:type,actorBinding:(cur.subjectSource==='inherited'||cur.subjectSource==='coreference')?'inherit_previous':'same_actor',fromRole:prev.role,toRole:cur.role});
  }

  // Operator follow-ups (reason/advice/timing) attach to the nearest compatible prior event, not merely the immediately previous clause.
  // This keeps chains such as「會成功嗎？何時？有什麼阻礙？」as one event graph while still respecting explicit domain switches.
  frames.forEach(function(cur,i){
    if(i===0||['reason','action_advice','timing'].indexOf(cur.role)<0)return;
    if(edges.some(function(e){return e.to===i;}))return;
    for(var j=i-1;j>=0;j--){
      var prev=frames[j];
      var anchor=!!(prev.occurrenceQuery||prev.futureAction||prev.privateState||prev.role==='outcome'||prev.role==='future_or_event_action'||prev.role==='hidden_state');
      if(!anchor)continue;
      var incompatible=cur.domains.length&&prev.domains.length&&cur.domains.every(function(d){return prev.domains.indexOf(d)<0;});
      if(incompatible)continue;
      edges.push({from:j,to:i,type:'event_to_'+cur.role,actorBinding:cur.subjectRef&&prev.subjectRef&&cur.subjectRef===prev.subjectRef?'same_actor':'event_context',fromRole:prev.role,toRole:cur.role});
      break;
    }
  });

  // A single clause can contain occurrence + measure, e.g.「會中多少」. Represent the dependency explicitly.
  frames.forEach(function(f,i){
    if(f.measurement && !f.confirmedOccurrence && /(會|能|可以|可能|有機會|中|拿|領|得|收|賺|入帳|獲得)/.test(f.text)){
      edges.push({from:i,to:i,type:'occurrence_to_measurement_same_clause',actorBinding:f.subjectRef?'same_actor':'event',fromRole:'outcome',toRole:f.measurement});
    }
  });

  var linkedIndices={};edges.forEach(function(e){linkedIndices[e.from]=true;linkedIndices[e.to]=true;});
  // Connected components across clauses; independent components are genuine multi-question branches.
  var parent=frames.map(function(_,i){return i;});
  function find(x){while(parent[x]!==x){parent[x]=parent[parent[x]];x=parent[x];}return x;}
  function union(a,b){a=find(a);b=find(b);if(a!==b)parent[b]=a;}
  edges.forEach(function(e){if(e.from!==e.to)union(e.from,e.to);});
  // Do not merge clauses merely because they share an actor/domain.  Two propositions can concern the same person and still be independent.
  // Only explicit semantic dependency edges join clauses into one event chain.
  var components=unique(frames.map(function(_,i){return find(i);}));

  var globalScope=scope(parts[0]||q), groups=[];
  function groupFromFrames(indices){
    var texts=indices.map(function(i){return frames[i].text;}), entities=unique(indices.map(function(i){return frames[i].subjectRef;}).filter(Boolean));
    return {id:'SUBJECT_'+(groups.length+1),question:texts.join('；'),entity:entities.join('、'),scope:unique(indices.map(function(i){return frames[i].scope;}).filter(Boolean)).join('、')||globalScope,scopeInherited:!indices.some(function(i){return !!frames[i].scope;})&&!!globalScope,clauseIndices:indices};
  }
  if(!options.length&&frames.length){
    components.forEach(function(root){var idxs=frames.map(function(_,i){return i;}).filter(function(i){return find(i)===root;});groups.push(groupFromFrames(idxs));});
  }
  var coordinatedActors=extractCoordinatedActors(q);
  // Actor identity comes from grammatical/topic subjects, not every entity mention (objects such as「我」must not become branches).
  var namedActors=unique(coordinatedActors.concat(frames.map(function(f){return f.subjectRef;}).filter(Boolean)));
  if(groups.length===1&&coordinatedActors.length>=2){
    groups=coordinatedActors.map(function(actor,i){return {id:'SUBJECT_'+(i+1),question:actor+'：'+q,entity:actor,scope:globalScope,scopeInherited:false,clauseIndices:frames.map(function(_,k){return k;})};});
  }

  var ambiguities=[];
  frames.forEach(function(f){if(f.subjectSource==='ambiguous_coreference'||f.subjectSource==='unresolved_coreference')ambiguities.push({clause:f.index,type:f.subjectSource,candidates:(f.coreferenceCandidates||[]).slice(),text:f.text});});
  var notes=[],criticalIssues=[];
  if(ambiguities.length){notes.push('有代名詞無法唯一對應前文人物；請明確指出人物後再抽牌。');criticalIssues.push({code:'AMBIGUOUS_REFERENCE',count:ambiguities.length});}
  if(options.length>6||groups.length>6){notes.push('本次最多分開六個分支；請將問題分批。');criticalIssues.push({code:'TOO_MANY_BRANCHES',count:Math.max(options.length,groups.length)});}
  if(decision.kind==='multiple'&&!options.length){notes.push('尚未辨識完整選項；請用 A：…；B：…；C：… 列出。');criticalIssues.push({code:'MISSING_OPTIONS'});}
  if(decision.kind==='incomplete'){notes.push('比較題的選項尚未完整；請把所有要比較的方案補齊。');criticalIssues.push({code:'INCOMPLETE_CHOICE'});}
  var mode=options.length>2?'multi_option':options.length===2?'binary':groups.length>1?'multi_question':'single';
  var firstOptionAt=options.length?q.indexOf(options[0]):-1,choiceScope=firstOptionAt>=0?scope(q.slice(0,firstOptionAt)):'';
  var branches=options.length?options.map(function(s,i){return {id:'OPTION_'+(i+1),question:s,entity:s,scope:scope(s)||choiceScope,scopeInherited:!scope(s)&&!!choiceScope};}):groups;

  var allDims=unique(frames.reduce(function(acc,f){return acc.concat(f.dimensions);},[]));
  var allDomains=unique(frames.reduce(function(acc,f){return acc.concat(f.domains);},[]));
  var daily=/(?:每日|日常)(?:提醒|指引|訊息|信息|主題|運勢)|(?:今天|今日)(?:的)?(?:整體)?(?:運勢|提醒|指引|訊息|信息|主題|牌訊|牌卡)|(?:今天|今日).*(?:該注意什麼|需要注意什麼|有什麼提醒|有何提醒)/.test(q) && !frames.some(function(f){return f.yesNo||f.measurement||f.privateState||f.overtAction;});
  var monthly=/(?:每個月|每月|各月份|逐月|(?:十二|12)個月).*(?:運勢|趨勢|走向|主題|提醒|工作|感情|財運|牌)/.test(q);
  var hiddenState=frames.some(function(f){return f.privateState&&f.hidden;});
  var futureAction=frames.some(function(f){return f.futureAction;});
  var futureActorEvent=frames.some(function(f){return f.futureAction||f.actorBoundFutureEvent;});
  var dependent=edges.some(function(e){return e.type!=='occurrence_to_measurement_same_clause';})||edges.some(function(e){return e.type==='occurrence_to_measurement_same_clause';});
  var unresolved=[];
  frames.forEach(function(f){if(!f.predicate && !f.dimensions.length)unresolved.push({clause:f.index,reason:'predicate_unresolved'});});
  var ready=criticalIssues.length===0;
  var coverageStatus=ambiguities.length?'ambiguous':(criticalIssues.length?'incomplete':(unresolved.length?'partial':'resolved'));
  var contract={version:'1.0.0',policy:'fail_closed_on_material_ambiguity',ready:ready,criticalIssues:criticalIssues,warnings:unresolved.slice(),maxBranches:6};

  var semantic={
    version:'2.1.0',status:coverageStatus,
    clauses:frames,
    graph:{nodes:frames.map(function(f){return {id:f.id,role:f.role,subjectRef:f.subjectRef,predicateClass:f.predicateClass,dimensions:f.dimensions,domains:f.domains,actorBoundFutureEvent:!!f.actorBoundFutureEvent,measurement:f.measurement,requestedPrecision:f.requestedPrecision,epistemicScope:f.epistemicScope};}),edges:edges},
    topology:{clauseCount:frames.length,componentCount:components.length,dependent:dependent,maxDependencyDepth:(function(){var depth=1;for(var k=0;k<frames.length;k++){var d=1,cur=k,seen={};while(true){var e=edges.find(function(x){return x.to===cur&&x.from!==x.to&&!seen[x.from+'>'+x.to];});if(!e)break;seen[e.from+'>'+e.to]=1;d++;cur=e.from;}if(d>depth)depth=d;}return depth;})(),dimensions:allDims,domains:allDomains},
    claims:{hiddenState:hiddenState,futureAction:futureAction,futureActorEvent:futureActorEvent},
    unresolved:unresolved,ambiguities:ambiguities,contract:contract
  };

  return {
    version:'2.1.0',originalQuestion:raw,normalizedQuestion:q,mode:mode,decisionKind:decision.kind,options:options,
    actors:namedActors,branches:branches,clauses:frames,dependencies:edges,ready:ready,notes:notes,contract:contract,
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
// END SHARED QUESTION PLANNER
var LENORMAND_CAPABILITY_MATRIX={
  amount:{id:'exact_amount',label:'精確金額',resolution:'qualitative_band',supported:['是否有實際結果的傾向','相對幅度','牌面可支持的大小／級距']},
  count:{id:'exact_count',label:'精確數量',resolution:'qualitative_count',supported:['有無／多寡傾向','相對數量級','重複或集中程度']},
  quantity:{id:'exact_count',label:'精確數量',resolution:'qualitative_count',supported:['有無／多寡傾向','相對數量級','重複或集中程度']},
  probability:{id:'exact_probability',label:'精確機率',resolution:'qualitative_support',supported:['支持或不支持的程度','主要條件','反證']},
  timing:{id:'exact_datetime',label:'精確日期時間',resolution:'relative_timing',supported:['快慢節奏','先決條件','已有期限內的相對時段']},
  age:{id:'exact_age',label:'精確歲數',resolution:'relative_profile',supported:['相對年齡感','成熟度／生命階段的象徵傾向']},
  identity:{id:'exact_identity',label:'精確身分／個資',resolution:'role_profile',supported:['角色類型','可觀察特徵','互動位置']}
};
function _lnCapabilityProfile(x) {
  var semantic=x.questionPlan&&x.questionPlan.semantic, semDims=semantic&&semantic.topology?semantic.topology.dimensions:[], dims=[], seen={};
  function addByKey(k){var d=LENORMAND_CAPABILITY_MATRIX[k];if(!d||seen[d.id])return;seen[d.id]=1;dims.push({id:d.id,label:d.label,exact:false,supported:d.supported.slice()});}
  (semDims||[]).forEach(addByKey);
  // Backward-compatible fallbacks for older callers that construct x without semantic IR.
  if(x.asksExactAmount)addByKey('amount');
  if(x.asksExactCount)addByKey('count');
  if(x.asksProbability)addByKey('probability');
  if(x.asksWhen)addByKey('timing');
  if(x.asksExactAge)addByKey('age');
  if(x.asksExactIdentity)addByKey('identity');
  var occurrenceGate=!!(x.asksOccurrenceThenAmount||x.asksOccurrenceThenCount);
  var dependencyGate=!!x.dependencyGate;
  var intent='qualitative';
  if(x.asksExactAmount)intent=occurrenceGate?'conditional_amount':'amount';
  else if(x.asksExactCount)intent=occurrenceGate?'conditional_count':'count';
  else if(x.asksProbability)intent='probability';
  else if(x.asksExactDate||x.asksWhen)intent='timing';
  else if(x.asksExactIdentity||x.asksPersonProfile)intent='profile';
  else if(x.isChoice)intent='comparison';
  else if(dependencyGate)intent='conditional_outcome_chain';
  else if(x.isYesNo)intent='outcome';
  var resolution=dims.length?'symbolic_resolution':(dependencyGate?'conditional_symbolic':'direct_symbolic');
  if(x.asksExactAmount)resolution=LENORMAND_CAPABILITY_MATRIX.amount.resolution;
  else if(x.asksExactCount)resolution=LENORMAND_CAPABILITY_MATRIX.count.resolution;
  else if(x.asksProbability)resolution=LENORMAND_CAPABILITY_MATRIX.probability.resolution;
  else if(x.asksWhen)resolution=LENORMAND_CAPABILITY_MATRIX.timing.resolution;
  else if(x.asksExactAge)resolution=LENORMAND_CAPABILITY_MATRIX.age.resolution;
  else if(x.asksExactIdentity)resolution=LENORMAND_CAPABILITY_MATRIX.identity.resolution;
  var tasks=[];
  if(dependencyGate&&x.hiddenStateClaim&&x.futureActionClaim){
    tasks.push('先判前項未公開／內在狀態是否獲牌面支持');
    tasks.push('前項獲支持時，再判同一人物是否有把該狀態轉成明確行動的傾向');
  }
  if(occurrenceGate)tasks.push(x.asksExactAmount?'先判事件是否有成立／得財傾向':'先判事件是否有成立傾向');
  if(x.asksExactAmount)tasks.push('再判相對幅度或級距');
  if(x.asksExactCount)tasks.push(occurrenceGate?'再判相對數量級與分散／集中程度':'判相對數量級與分散／集中程度');
  if(x.asksProbability)tasks.push('判支持程度與改變條件');
  if(x.asksWhen)tasks.push('判快慢與條件性時段');
  if(x.asksExactAge)tasks.push('判相對年齡／成熟度範圍');
  if(x.asksExactIdentity)tasks.push('判角色類型與可觀察特徵');
  if(!tasks.length)tasks.push('依原問句直接判讀');
  return {version:'2.1.0',semanticVersion:semantic&&semantic.version||null,semanticStatus:semantic&&semantic.status||'legacy',semanticReady:!!(x.questionPlan&&x.questionPlan.ready),intent:intent,resolution:resolution,occurrenceGate:occurrenceGate,dependencyGate:dependencyGate,dependencies:x.dependencyEdges||[],claimPolicy:{hiddenState:x.hiddenStateClaim?'symbolic_tendency':null,futureAction:x.futureActionClaim?'conditional_tendency':null},exactValueSupported:dims.length?false:null,exactNumericSupported:dims.some(function(d){return /amount|count|probability|age|datetime/.test(d.id);})?false:null,dimensions:dims,tasks:tasks};
}

function _lnAnalyzeQuestion(q) {
  var originalQuestion = String(q || '').trim();
  q = _lnQuestionFocus(originalQuestion);
  var compact = q.replace(/\s+/g, '');
  var parts = q.split(/[？?；;\n]+/).map(function(s){ return s.trim(); }).filter(Boolean);

  // 只辨識「問句幾何與安全邊界」。內容詞不直接決定牌義、答案或牌陣大小。
  var asksExactDate = /哪一天|哪天發生|幾月幾日|確切日期|確切時間|幾號|幾點|幾分|哪個日期|哪個時間點/.test(q);
  var asksWhen = /什麼時候|幾時|何時|多久|還要等|等多久|哪一週|幾週|哪個月|幾個月|幾年|應期|多快|多晚|何日/.test(q) || asksExactDate;
  var hasFixedHorizon = /今天|明天|後天|本週|這週|下週|本月|這月|這個月|下個月|今年|明年|年底前|月底前|週內|月內|年內|近期|最近|\d+\s*(?:天|週|個月|月|年)內|\d{4}[\/-]\d{1,2}(?:[\/-]\d{1,2})?/.test(q);
  var asksWhy = /為什麼|為何|什麼原因|原因是|根源|問題出在|怎麼會|怎麼回事|卡在哪|阻礙在哪|障礙在哪/.test(q);
  var asksHow = /該先開口|該做什麼|該從哪|應該怎麼|該怎麼|怎麼辦|如何做|怎麼做|怎樣做|怎麼改善|如何改善|怎麼準備|如何準備|方法|策略|建議|下一步|該如何|如何處理|怎麼處理/.test(q);
  var asksInner = /怎麼想|想法|心裡|內心|意圖|打算|真心|喜不喜歡|愛不愛|愛我|喜歡我|在不在乎|是否隱瞞|有沒有隱瞞|是否可信|可信嗎|值得信任|誠不誠實|態度|暗戀|秘密喜歡|對我有沒有意思|對我有意思嗎/.test(q);
  var isHiddenClaim = /暗戀|秘密|暗中|隱瞞|沒說|未公開|真心|背著|外遇|出軌|第三者|欺騙/.test(q);

  var asksExactAge = /幾歲|歲數|年齡(?:是多少|多大|大約多少|約多少)?|幾年次|出生年|出生年月|生日|\d+\s*歲(?:以下|以上|以內|左右|內)?/.test(q);
  var asksWho = /是誰|有誰|誰在|哪一位|哪個人|哪個同事|哪名|具體是誰/.test(q);
  var asksExactIdentity = asksWho || /叫什麼名字|姓名是什麼|真實姓名|住哪裡|詳細地址|電話號碼|手機號碼|帳號是什麼|身分證|身份證/.test(q);
  var moneyContext = /錢|金額|獎金|收入|營業額|營收|業績|價格|薪資|薪水|發票|統一發票|中獎|開獎|彩券|彩票|樂透|威力彩|大樂透|刮刮樂|付款|入帳/.test(q);
  var explicitMoneyAmount = /(?:賺|賺到|拿到|拿|領到|領|獲得|得到|收到|入帳|回饋|退款|退回|賠|贏得|可得|能得|會得|可以得|可以拿|能拿|會拿|可以領|能領|會領)多少(?:錢|元|塊|獎金|金額)|中獎(?:金額|獎金)?(?:會|能|可以|可|是|有)?多少|獎金(?:會|能|可以|可|是|有)?多少|收入多少|營業額多少|營收多少|業績多少|金額多少|確切金額|價格是多少|多少(?:錢|元|塊)/.test(q);
  var contextualMoneyAmount = moneyContext && /(?:會|能|可以|可|可能)?(?:中(?:獎)?|拿到|領到|獲得|得到|收到|入帳|賺到|贏得)?多少(?!\s*(?:張|個|次|件|份|人|筆|單|顆|條|位))/.test(q);
  var asksExactAmount = explicitMoneyAmount || contextualMoneyAmount;
  var asksExactCount = /(?:多少|幾)(?:張|次|件|份|人|筆|單|顆|條|位)|(?:多少|幾)個(?!月|年|週|天)/.test(q);
  var asksProbability = /百分之幾|幾成機率|機率多少|概率多少|成功率多少|勝率多少/.test(q);
  var confirmedOccurrence = /已經?(?:確定)?中獎|已中獎|我中了|顯示中獎|確定有獎/.test(q);
  var asksOccurrenceThenAmount = asksExactAmount && !confirmedOccurrence && /中獎|開獎|發票|統一發票|抽獎|彩券|彩票|樂透|威力彩|大樂透|刮刮樂|(?:會|能|可以|可|可能)(?:拿到|領到|獲得|得到|收到|入帳|賺到|贏得)/.test(q);
  var asksOccurrenceThenCount = asksExactCount && !confirmedOccurrence && /中獎|開獎|發票|統一發票|抽獎|彩券|彩票|樂透|威力彩|大樂透|刮刮樂|(?:會|能|可以|可|可能)(?:有|出現|收到|拿到|得到|中)/.test(q);
  var concreteOutcomeEvent = /中獎|開獎|統一發票|發票|抽獎|錄取|升遷|付款|入帳|到貨|出貨|訂單|成交|簽約|聯絡|回覆|通知|會面|結果/.test(q);

  var asksPersonProfile = /外貌|長相|身高|體型|職業|做什麼工作|哪裡人|個性|性格|特徵|類型|年輕|同齡|成熟|年長|年紀|相處模式/.test(q);
  var profileTraitCount = [
    /外貌|長相|身高|體型/.test(q),
    /職業|做什麼工作/.test(q),
    /個性|性格|相處模式/.test(q),
    /年輕|同齡|成熟|年長|年紀/.test(q),
    /哪裡人|地區|背景/.test(q)
  ].filter(Boolean).length;

  // 「單一議題多面向」只在問句明確要求多個不同面向時成立；單純問發展、走向或整體結果仍是單一開放題。
  var aspectFlags = [
    /來源|起因|根源/.test(q),
    /優勢|助力|有利條件/.test(q),
    /風險|阻礙|障礙|代價/.test(q),
    /結果|結局|後續結果/.test(q),
    /方法|策略|建議|下一步/.test(q),
    /時間|何時|多久/.test(q)
  ];
  var aspectTermCount = aspectFlags.filter(Boolean).length;
  var explicitMultiAspect = /多面向|各面向|全面分析|完整分析|優勢.*(?:風險|阻礙|結果)|風險.*(?:優勢|結果|方法)|來源.*(?:阻礙|結果)|阻礙.*(?:結果|方法)|助力.*阻力|阻力.*結果/.test(q) || aspectTermCount >= 3;

  // 領域要有明確列舉或分開的提問；「我和主管的工作關係」仍是同一個議題。
  var domainIds = _lnDomainIds(q);
  var globalCue = /人生全貌|整體人生|所有面向|全部領域|全年整體|年度總運|未來一年整體|人生各方面|(?:今年|明年|全年|年度)(?:的)?整體(?:運勢|狀況|發展)/.test(q);
  var looksLikePersonPair = /^(?:我|你|他|她|我們|你們|他們|她們)(?:和|跟|與)/.test(compact);
  var domainList = /(?:感情|愛情|婚姻|桃花|工作|事業|財運|財務|家庭|學業|健康|旅行)(?:方面)?(?:、|以及|及|和|與|跟)(?:感情|愛情|婚姻|桃花|工作|事業|財運|財務|家庭|學業|健康|旅行)/.test(q);
  var isGlobal = globalCue || (domainIds.length >= 2 && domainList);

  // The same tested parser is embedded in both readers; no load-order dependency.
  var decision = classifyDecisionQuestion(q);
  var moreThanTwoOptions = decision.kind === 'multiple';
  var incompleteChoice = decision.kind === 'incomplete';
  var hypothesisChoice = decision.kind === 'hypotheses' || decision.kind === 'ambiguous';
  var isChoice = decision.kind === 'binary' && !!decision.left && !!decision.right;
  var choiceA = isChoice ? decision.left : null, choiceB = isChoice ? decision.right : null;

  var yesNoPartRe = /嗎\s*$|^(?:會不會|有沒有|能不能|可不可以|是不是|是否|要不要|該不該|應不應該|適不適合|值不值得|行不行|成不成|愛不愛|喜不喜歡)/;
  var partYesNoCount = parts.reduce(function(n, part){ return n + (yesNoPartRe.test(part.replace(/\s+/g,'')) ? 1 : 0); }, 0);
  var isYesNo = partYesNoCount > 0 || /嗎[？?]?\s*$/.test(compact) || /^(?:會不會|有沒有|能不能|可不可以|是不是|是否|愛不愛|喜不喜歡)/.test(compact) || /(?:會|有|能|愛|喜歡).+還是(?:不|沒有|不能)/.test(compact);

  var isConditionalProfileBundle = asksPersonProfile && /(?:若|如果|假如).*(?:有|會|出現|發生)|(?:若有|如果有|若會|如果會)/.test(q);
  var linkedFollowUp = /^(?:那|又|並且|以及|另外)?(?:為什麼|原因|阻礙|障礙|卡在哪|怎麼|如何|何時|什麼時候|多久|結果|走向|後續|若有|如果有|他|她|對方|這件事|這段|該怎麼)/;
  var clausesLinked = true;
  if (parts.length > 1) {
    for (var ci = 1; ci < parts.length; ci++) {
      if (!linkedFollowUp.test(parts[ci])) { clausesLinked = false; break; }
    }
  }
  var independentMulti = parts.length >= 2 && !isChoice && domainIds.length >= 2 && parts.some(function(part,i){return i>0 && _lnDomainIds(part).some(function(id){return _lnDomainIds(parts[0]).indexOf(id)<0;});});
  var linkedDiagnosticBundle = parts.length <= 3 && clausesLinked && (asksWhy || asksHow) && !asksPersonProfile;
  var linkedTimingBundle = parts.length <= 3 && clausesLinked && asksWhen;
  var multiPart = parts.length >= 2 || /(?:以及|另外|還有|同時)/.test(q);
  var asksThreshold = /破\s*(?:\d|[一二三四五六七八九十百千萬兩])|超過\s*(?:\d|[一二三四五六七八九十百千萬兩])|達到\s*(?:\d|[一二三四五六七八九十百千萬兩])|至少\s*(?:\d|[一二三四五六七八九十百千萬兩])|高於\s*(?:\d|[一二三四五六七八九十百千萬兩])|低於\s*(?:\d|[一二三四五六七八九十百千萬兩])|門檻/.test(q);

  var medicalDiagnosis = /(?:我|他|她|對方).*(?:是不是|是否|有沒有|會不會).*(?:癌症|腫瘤|懷孕|流產|精神病|憂鬱症|躁鬱症|傳染病|重病)|(?:我|他|她)?懷孕(?:了)?嗎|是不是懷孕/.test(q);
  var fatalityQuestion = /會不會死|何時死|幾歲死|壽命多久|死期/.test(q);
  var criminalFact = /(?:是不是|是否|有沒有).*(?:偷竊|偷我|詐騙|下毒|犯罪|犯法|性侵|侵占)|(?:他|她|對方).*(?:偷了|騙了|下毒)/.test(q);
  var directLegalLiability = /(?:是不是|是否|有沒有).*(?:違法|有罪|犯罪成立)|會不會被判刑/.test(q);

  // 面向數只計算原問句明示要求的回答工作，不把「暗戀／秘密／內心」當成額外面向。
  var facetCount = 1;
  if (asksWhy) facetCount++;
  if (asksHow) facetCount++;
  if (asksWhen) facetCount++;
  if (asksPersonProfile) facetCount += profileTraitCount >= 2 ? 2 : 1;
  if (explicitMultiAspect) facetCount = Math.max(facetCount, 3);
  if (isConditionalProfileBundle) facetCount = Math.max(facetCount, 3);

  // v21: consume the canonical typed semantic IR. Surface regex above is legacy-compatible fallback only.
  var sharedQuestion=analyzeReadingQuestion(originalQuestion);
  var semantic=sharedQuestion.semantic||null;
  if(semantic){
    var semFrames=Array.isArray(semantic.clauses)?semantic.clauses:[];
    var semDims=(semantic.topology&&semantic.topology.dimensions)||[];
    var semDomains=(semantic.topology&&semantic.topology.domains)||[];
    asksWhy=semDims.indexOf('reason')>=0;
    asksHow=semDims.indexOf('advice')>=0;
    asksWhen=semDims.indexOf('timing')>=0;
    asksExactAmount=semDims.indexOf('amount')>=0;
    asksExactCount=semDims.indexOf('count')>=0||semDims.indexOf('quantity')>=0;
    asksProbability=semDims.indexOf('probability')>=0;
    asksExactAge=semDims.indexOf('age')>=0;
    asksExactIdentity=semDims.indexOf('identity')>=0;
    asksPersonProfile=semDims.indexOf('profile')>=0;
    asksInner=semFrames.some(function(f){return !!f.privateState;});
    isHiddenClaim=semFrames.some(function(f){return !!f.hidden&&!!f.privateState;});
    isYesNo=semFrames.some(function(f){return !!f.yesNo;});
    partYesNoCount=semFrames.filter(function(f){return !!f.yesNo;}).length;
    concreteOutcomeEvent=semFrames.some(function(f){return !!f.occurrenceQuery||!!f.futureAction;});
    domainIds=semDomains.length?semDomains:domainIds;
    multiPart=semFrames.length>=2;
  }
  var dependencyEdges=Array.isArray(sharedQuestion.dependencies)?sharedQuestion.dependencies:[];
  var dependencyGate=dependencyEdges.some(function(e){return e.type==='state_to_future_action'||e.type==='hidden_state_to_future_action_same_actor';});
  var hiddenStateClaim=semantic?!!semantic.claims.hiddenState:parts.some(function(part){return /暗戀|秘密喜歡|喜歡我|喜歡你|對我有意思|對你有意思|有好感|愛我|愛你|真心/.test(part);});
  var futureActionClaim=semantic?!!(semantic.claims.futureAction||semantic.claims.futureActorEvent):parts.some(function(part){return /告白|表白|追求|交往|約會|邀約|主動(?:聯絡|找|靠近|示好|追求|約)|說出口|坦白心意|確認關係/.test(part);});
  asksOccurrenceThenAmount=asksExactAmount&&dependencyEdges.some(function(e){return e.type==='occurrence_to_measurement_same_clause'||e.type==='occurrence_to_measurement';});
  asksOccurrenceThenCount=asksExactCount&&dependencyEdges.some(function(e){return e.type==='occurrence_to_measurement_same_clause'||e.type==='occurrence_to_measurement';});
  clausesLinked=clausesLinked||dependencyEdges.length>0;
  independentMulti=sharedQuestion.mode==='multi_question';
  linkedDiagnosticBundle=dependencyEdges.some(function(e){return e.type==='diagnostic_bundle'||e.type==='event_to_reason'||e.type==='event_to_action_advice';});
  linkedTimingBundle=dependencyEdges.some(function(e){return e.type==='event_to_timing';});
  if(semantic){
    facetCount=Math.max(1,(semantic.topology.dimensions||[]).length);
    profileTraitCount=(semantic.clauses||[]).filter(function(f){return f.dimensions&&f.dimensions.indexOf('profile')>=0;}).length;
  }
  var questionShape = '一般單一議題';
  if(dependencyGate)questionShape='條件相依的單一事件鏈';
  else if(sharedQuestion.mode==='multi_question')questionShape='多人物／多事件分題';
  else if(sharedQuestion.mode==='multi_option')questionShape='多選項獨立比較';
  else if (isChoice) questionShape = '雙路決策比較';
  else if (isGlobal) questionShape = '多領域／全景問題';
  else if (explicitMultiAspect || isConditionalProfileBundle || profileTraitCount >= 2) questionShape = '單一議題多面向全貌';
  else if (asksWhy || asksHow || asksWhen || asksPersonProfile || facetCount >= 2) questionShape = '需要脈絡的單一議題';
  else if (isYesNo) questionShape = '單一可裁決命題';
  var result={
    questionPlan:sharedQuestion, q:originalQuestion, analysisQuestion:q, compact:compact, parts:parts, empty:!originalQuestion,
    domainIds:domainIds, hypothesisChoice:hypothesisChoice,
    isChoice:isChoice, choiceA:choiceA, choiceB:choiceB,
    moreThanTwoOptions:moreThanTwoOptions, incompleteChoice:incompleteChoice,
    asksWhen:asksWhen, asksExactDate:asksExactDate, hasFixedHorizon:hasFixedHorizon,
    asksWhy:asksWhy, asksHow:asksHow, isYesNo:isYesNo, partYesNoCount:partYesNoCount,
    isInner:asksInner, isHiddenClaim:isHiddenClaim,
    asksExactAge:asksExactAge, asksExactIdentity:asksExactIdentity,
    asksExactAmount:asksExactAmount, asksExactCount:asksExactCount, asksProbability:asksProbability, asksOccurrenceThenAmount:asksOccurrenceThenAmount, asksOccurrenceThenCount:asksOccurrenceThenCount,
    concreteOutcomeEvent:concreteOutcomeEvent,
    asksPersonProfile:asksPersonProfile, profileTraitCount:profileTraitCount,
    isConditionalProfileBundle:isConditionalProfileBundle,
    isOverview:explicitMultiAspect, isGlobal:isGlobal, multiPart:multiPart,
    independentMulti:independentMulti, linkedDiagnosticBundle:linkedDiagnosticBundle,
    linkedTimingBundle:linkedTimingBundle, clausesLinked:clausesLinked,
    asksThreshold:asksThreshold,
    medicalDiagnosis:medicalDiagnosis, fatalityQuestion:fatalityQuestion,
    criminalFact:criminalFact, directLegalLiability:directLegalLiability,
    facetCount:facetCount, questionShape:questionShape,
    isSensitiveHidden:asksInner || isHiddenClaim,
    dependencyEdges:dependencyEdges, dependencyGate:dependencyGate,
    hiddenStateClaim:hiddenStateClaim, futureActionClaim:futureActionClaim
  };
  result.capability=_lnCapabilityProfile(result);
  return result;
}
function _lnPersonRepId(declaredGender) {
  if (declaredGender === 'male') return 28;
  if (declaredGender === 'female') return 29;
  if (_lnSignif === 28 || _lnSignif === 29) return _lnSignif;
  return null;
}

function _lnCustomFocusId() {
  return (_lnSignif && _lnSignif !== 28 && _lnSignif !== 29) ? _lnSignif : null;
}

function _lnGrandCoord(index) {
  if (index < 0) return null;
  if (index < 32) return { zone:'main', row:Math.floor(index / 8) + 1, col:(index % 8) + 1, label:'R' + (Math.floor(index / 8) + 1) + 'C' + ((index % 8) + 1) };
  if (index < 36) return { zone:'tail', row:5, col:index - 31, label:'末排' + (index - 31) };
  return null;
}

function _lnFindCardIndex(drawn, cardId) {
  for (var i = 0; i < drawn.length; i++) if (drawn[i].id === cardId) return i;
  return -1;
}

function _lnGrandImmediateNeighbors(drawn, index) {
  var out = [];
  if (index < 0 || index >= drawn.length) return out;
  if (index >= 32) {
    if (index > 32) out.push({dir:'左', index:index - 1, card:drawn[index - 1]});
    if (index < 35) out.push({dir:'右', index:index + 1, card:drawn[index + 1]});
    return out;
  }
  var r = Math.floor(index / 8), c = index % 8;
  var dirs = [
    [-1,-1,'左上'],[-1,0,'上'],[-1,1,'右上'],
    [0,-1,'左'],[0,1,'右'],
    [1,-1,'左下'],[1,0,'下'],[1,1,'右下']
  ];
  dirs.forEach(function(d){
    var rr=r+d[0], cc=c+d[1];
    if (rr>=0 && rr<4 && cc>=0 && cc<8) {
      var idx=rr*8+cc;
      out.push({dir:d[2], index:idx, card:drawn[idx]});
    }
  });
  return out;
}

function _lnGrandExtraLinks(index) {
  if(index<0||index>=32)return {horizontal:null,vertical:null,knights:[]};
  var r=Math.floor(index/8),c=index%8,out={horizontal:r*8+7-c,vertical:(3-r)*8+c,knights:[]};
  [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]].forEach(function(d){var rr=r+d[0],cc=c+d[1];if(rr>=0&&rr<4&&cc>=0&&cc<8)out.knights.push(rr*8+cc);});
  return out;
}

function _lnGrandNeighborText(drawn, index) {
  var ns = _lnGrandImmediateNeighbors(drawn, index);
  if (!ns.length) return '無';
  return ns.map(function(n){ return n.dir + '＝' + (n.index + 1) + '.' + n.card.name; }).join('；');
}


// v10：36張主盤的完整合法直線清單。只產生水平、垂直與兩組斜線；末排另作獨立水平線。
function _lnGrandStraightLines() {
  var out = [], r, c, indices;
  for (r = 0; r < 4; r++) {
    indices = [];
    for (c = 0; c < 8; c++) indices.push(r * 8 + c);
    out.push({ label:'水平R' + (r + 1), indices:indices });
  }
  for (c = 0; c < 8; c++) {
    indices = [];
    for (r = 0; r < 4; r++) indices.push(r * 8 + c);
    out.push({ label:'垂直C' + (c + 1), indices:indices });
  }
  // 左上→右下：由頂列與左列作起點，長度至少2。
  for (c = 0; c < 8; c++) {
    indices = [];
    for (r = 0; r < 4 && c + r < 8; r++) indices.push(r * 8 + (c + r));
    if (indices.length >= 2) out.push({ label:'斜↘起R1C' + (c + 1), indices:indices });
  }
  for (r = 1; r < 4; r++) {
    indices = [];
    for (c = 0; r + c < 4 && c < 8; c++) indices.push((r + c) * 8 + c);
    if (indices.length >= 2) out.push({ label:'斜↘起R' + (r + 1) + 'C1', indices:indices });
  }
  // 右上→左下：由頂列與右列作起點，長度至少2。
  for (c = 0; c < 8; c++) {
    indices = [];
    for (r = 0; r < 4 && c - r >= 0; r++) indices.push(r * 8 + (c - r));
    if (indices.length >= 2) out.push({ label:'斜↙起R1C' + (c + 1), indices:indices });
  }
  for (r = 1; r < 4; r++) {
    indices = [];
    for (c = 7; r + (7 - c) < 4 && c >= 0; c--) indices.push((r + (7 - c)) * 8 + c);
    if (indices.length >= 2) out.push({ label:'斜↙起R' + (r + 1) + 'C8', indices:indices });
  }
  return out;
}

function _lnGrandLineText(drawn, line) {
  return line.indices.map(function(idx){ return (idx + 1) + '.' + drawn[idx].name; }).join('→');
}

function _lnContiguousSegmentCount(indices) {
  var n = (indices || []).length;
  return n > 1 ? (n * (n - 1)) / 2 : 0;
}

function _lnGrandMainSegmentCount() {
  return _lnGrandStraightLines().reduce(function(total, line){
    return total + _lnContiguousSegmentCount(line.indices);
  }, 0);
}

function _lnGrandLinesThroughText(drawn, index) {
  if (index < 0 || index >= 32) return '不在主盤，無主盤穿越線';
  var hits = _lnGrandStraightLines().filter(function(line){ return line.indices.indexOf(index) >= 0; });
  return hits.map(function(line){ return line.label + '＝' + _lnGrandLineText(drawn, line); }).join('；');
}

function _lnValidateQuestion(q) {
  var x = _lnAnalyzeQuestion(q);
  if (x.empty) return { ok:false, code:'EMPTY', reason:'請先輸入一個明確問題。' };
  if (x.questionPlan && !x.questionPlan.ready) {
    var issue=(x.questionPlan.contract&&x.questionPlan.contract.criticalIssues&&x.questionPlan.contract.criticalIssues[0])||{};
    return {ok:false,code:issue.code||'SEMANTIC_CONTRACT_UNRESOLVED',reason:(x.questionPlan.notes&&x.questionPlan.notes[0])||'問題結構尚未能唯一解析，請補齊人物、選項或分支後再抽牌。'};
  }
  if (x.questionPlan && x.questionPlan.semantic && x.questionPlan.semantic.status === 'ambiguous') return { ok:false, code:'AMBIGUOUS_REFERENCE', reason:(x.questionPlan.notes&&x.questionPlan.notes[0])||'問題中的人物指涉無法唯一解析，請明確指出人物後再抽牌。' };
  // 只攔截占卜不能替代的高風險事實判定；其餘複合、精確或非典型問句交由AI分層理解。
  if (x.fatalityQuestion) return {
    ok:false, code:'FATALITY',
    reason:'小雷諾曼不能可靠判定死亡時間、壽命或死期。請改問目前可觀察的健康風險與可採取的照護行動。'
  };
  if (x.medicalDiagnosis) return {
    ok:false, code:'DIAGNOSIS',
    reason:'這是需要檢驗或專業評估的醫療診斷／懷孕確認，不能用牌面代替。可改問目前有哪些可觀察狀況與應優先採取的照護行動。'
  };
  if (x.criminalFact || x.directLegalLiability) return {
    ok:false, code:'ALLEGATION',
    reason:'牌面不能認定他人犯罪、違法或法律責任。可改問這段互動有哪些可觀察風險、應保留哪些證據或尋求何種專業協助。'
  };
  return { ok:true, x:x };
}

// 自動選陣採宣告式決策表：輸入只看語義拓撲與所需解析度，不按題材詞硬綁牌陣。
var LENORMAND_SPREAD_DECISION_TABLE=[
  {id:'branches',when:function(x){var p=x.questionPlan;return !!(p&&(p.mode==='multi_question'||p.mode==='multi_option')&&p.ready);},why:'每個人物、獨立子題或選項各有一條三張線，先固定問題再抽牌，避免混用同一組結論'},
  {id:'two',when:function(x){var p=x.questionPlan;return !!(p&&p.daily&&!x.concreteOutcomeEvent&&!x.asksExactAmount&&!x.asksProbability&&!x.asksWhen);},why:'單一日常提醒，以雙牌的主題與修飾形成一句話'},
  {id:'seven',when:function(x){var p=x.questionPlan;return !!(p&&p.mode==='single'&&x.asksWhen&&(x.asksWhy||x.asksHow)&&!x.isGlobal);},why:'同一事件同時需要階段、原因與行動脈絡，七張線保留較長的發展與轉折'},
  {id:'nine',when:function(x){return !!x.moreThanTwoOptions;},why:'問題超過兩個方案，九宮格先釐清共同條件與阻力；本盤不為每個方案配置獨立支線，不合併選項或編造排名'},
  {id:'five',when:function(x){return !!x.incompleteChoice;},why:'比較選項尚未完整，五張線先分析已說明的處境；不代你補出另一個方案'},
  {id:'five',when:function(x){return !!x.hypothesisChoice;},why:'這是在比較同一事件的不同解釋／假設，而不是命主可選的兩個行動；五張線保留成因、修飾與哪個解釋較能被整句支持'},
  {id:'grand',when:function(x){return !!x.independentMulti;},why:'問題包含多個可獨立回答的主題，大牌陣能保留各主題及其交互作用'},
  {id:'choice',when:function(x){return !!x.isChoice;},why:'問題包含兩個可替代方案，需要分成A／B兩條獨立支線比較'},
  {id:'grand',when:function(x){return !!x.isGlobal;},why:'問題同時涵蓋多個獨立生活領域或要求全景，需使用36張大牌陣'},
  {id:'nine',when:function(x){return !!(x.isOverview||x.isConditionalProfileBundle||x.profileTraitCount>=2);},why:'同一議題明確要求三個以上面向，需要九宮格以多條合法交會線回答'},
  {id:'seven',when:function(x){return !!(x.dependencyGate&&x.futureActionClaim);},why:'同一人物的隱性狀態與後續明確行動具有前後條件依賴，七張線保留狀態、轉折、阻力與是否落實行動的完整路徑'},
  {id:'five',when:function(x){return !!(x.asksWhy||x.asksHow||x.asksWhen||x.asksPersonProfile||x.asksExactAge||x.asksExactIdentity||x.isInner||x.isHiddenClaim||x.facetCount>=2);},why:'同一事件需要原因、方法、時間、人物輪廓、隱含狀態或階段脈絡，五張線較完整'},
  {id:'three',when:function(x){return !!(x.asksExactAmount||x.asksExactCount||x.asksProbability);},why:'這是單一事件的結果／幅度問題，三張線先判事件是否成立，再判相對強弱或級距；量測精度由引擎能力層另行標記'},
  {id:'three',when:function(x){return !!x.isYesNo;},why:'這是聚焦單一狀態的問題，以三張線讀起始語境、關鍵修飾與整句傾向；答案深度取決於實際組合'},
  {id:'five',when:function(){return true;},why:'這是單一開放題，五張線能保留必要脈絡而不過度展開'}
];
function _lnRecommendSpread(x) {
  for(var i=0;i<LENORMAND_SPREAD_DECISION_TABLE.length;i++){
    var row=LENORMAND_SPREAD_DECISION_TABLE[i];
    if(row.when(x))return {id:row.id,why:row.why,ruleIndex:i};
  }
  return {id:'five',why:'這是單一開放題，五張線能保留必要脈絡而不過度展開',ruleIndex:-1};
}

function _lnCheckSpreadFit(q, spreadId) {
  var v = _lnValidateQuestion(q);
  if (!v.ok) return v;
  var x = v.x;
  var rec = _lnRecommendSpread(x);
  // 手動選陣尊重使用者選擇。牌陣只改變解析度與可用幾何，不預先否決問句；
  // AI會依實際牌面回答能支持的全部內容，並坦白指出超出該牌陣解析度的部分。
  return {
    ok:true,
    x:x,
    recommended:rec,
    resolutionNote: spreadId === rec.id ? '' : ('你選擇' + SPREADS[spreadId].name + '；系統原先較建議' + SPREADS[rec.id].name + '，本次仍依你選的牌陣完整解讀。')
  };
}

function _lnDetectSpread(q) {
  q = String(q || '').trim();
  var v = _lnValidateQuestion(q);
  if (!v.ok) return {id:null,why:v.reason,code:v.code};
  if(!v.x.questionPlan.ready)return {id:null,why:v.x.questionPlan.notes.join(' '),code:'INCOMPLETE_BRANCHES',x:v.x};
  var directives=_lnSpreadDirectives(q), rec=_lnRecommendSpread(v.x);
  if(directives.explicit) return {id:directives.explicit,why:'依你明確指定的'+SPREADS[directives.explicit].name+'解讀；仍以實際可用牌位為限',x:v.x};
  if(directives.excluded.indexOf(rec.id)>=0){
    var alternatives={three:['five','nine','grand'],five:['nine','three','grand'],choice:['nine','five','grand','three'],nine:['grand','five','three'],grand:['nine','five','three']}[rec.id]||Object.keys(SPREADS).filter(function(id){return id!==rec.id;});
    var id=alternatives.filter(function(id){return directives.excluded.indexOf(id)<0;})[0];
    if(!id)return {id:null,why:'目前可用牌陣都被排除，請保留一個牌陣或手動選擇。',code:'ALL_EXCLUDED'};
    return {id:id,why:'已排除你不想使用的牌陣，改以'+SPREADS[id].name+'回答可支持的部分；不足以獨立判斷的分支會明示',x:v.x};
  }
  rec.x=v.x;return rec;
}

function _lnPushReaderKernel(lines) {
  lines.push('<系統設定與方法參考>');
  lines.push('使用正位 Petit Lenormand；牌名、順序與下方幾何是本次事實。雙牌、三／五／七張線、各獨立分線、九宮格及兩種大牌陣各依本次明示版式，不套塔羅正逆位。');
  lines.push('相鄰、落宮、鏡像及騎士步是不同關係；只使用已提供的幾何。圖像朝向未提供時不推造面向。下方牌陣模組供全盤判讀，並不要求正文依技法逐項報告。');
  lines.push('</系統設定與方法參考>','');
}
function _lnPushSpreadModule(lines, spreadId, drawn, personRepId, customFocusId, def) {
  var guides={
  "three": [
    "先把第1張視作起始語境、第2張作連接與修飾、第3張作句子落點，依題目調整主詞與修飾關係；位置不預設過去／現在／未來。",
    "先讀1-2與2-3，再合讀1-2-3的完整意思；正文用整句回答。鏡像1↔3是首尾呼應的補充，不能取代中間牌，也不能稱為相鄰。",
    "單一是非題先給有條件的傾向，再交代最主要助力／阻力與一個可以觀察的下一步；不能把吉牌數量當投票、百分比或確定答案。"
  ],
  "five": [
    "先依完整1→2→3→4→5讀單一事件的脈絡，再核1-2、2-3、3-4、4-5的推進與轉折；三張及四張片段只在提供新意義時展開，避免十段重複。",
    "第3張作本次線讀的中心焦點，2-3-4看核心作用，1與5看外框；鏡像1↔5、2↔4作對照。這是本站預先聲明的中心／鏡像輔助法，不事後任意把五格改成固定過去、現在、未來。",
    "原因題說清成因如何經中間牌延續，方法題指出可以干預的環節，時間題區分快慢節奏、先決條件與實際期限；末張要與全線合讀，不能單牌決定成敗。"
  ],
  "choice": [
    "本站雙路比較是現代自訂牌陣。A路1→2→3與B路5→6→7分別成句，第4張是共享情境或比較基準；4不把兩路接成七張時間線。",
    "每路先讀相鄰兩張再整合三張，各自說明發展、阻力、成本與條件性落點。兩路以相同時間範圍和評估標準比較，不能把其中一路當現況、另一路當未來。",
    "使用提問原有的A、B方案名稱；要不要採取某行動時，B為暫不採取並維持現況。缺少兩個清楚方案、或其實是猜測他人的動機時，先明示無法作有效分支比較，仍可解釋現有牌句，不擅自創造方案。",
    "最後給出條件式選擇：重視何者時哪路較相符、各要承擔什麼、什麼資訊會改變選擇；相同好壞牌數量不能證明兩路等值。"
  ],
  "nine": [
    "先定中心5的議題焦點，再看四角1、3、7、9所構成的外框；中心不是唯一結論，四角組合是框架呼應，不能假稱相鄰長線。",
    "依三橫、三直、兩斜共八條線交叉核對，以穿過中心且最切題的牌句形成主判；外圍線只有改變答案時才補充；同一張牌反覆被線穿過，不算多份獨立佐證。",
    "本站採議題九宮格：各行列不預設過去／現在／未來或意識／現實／潛意識。這些是其他讀法可預定的軸，不能抽完牌再更換；此盤的時間只由題目與完整牌句的發展條件說明。",
    "水平與垂直鏡像作補充對照；比較中心線與外框是否一致，衝突時說明主線、限制與更能區分兩種讀法的現實訊號。三個以上方案沒有各自獨立路徑，只能分析共同局勢，不能偽造選項排名。"
  ],
  "grand": [
    "版式固定為4排×8張主盤，加獨立末排4張。先確認本人／焦點角色和全盤落點，再選與問題相關的主題牌；主題牌的傳統聯想需由相鄰牌限定，例如魚不必然是獲利、狐狸不必然是職業或欺騙。",
    "先讀本人或焦點的立即鄰域，再比較主題牌的鄰域與落宮：宮位是固定背景、落入牌是該背景的內容。「魚牌落在某宮」與「魚宮落入某牌」是兩個不同關係，按提供的36格映射說明。",
    "由主要議題向水平、垂直與斜線追蹤支持和阻力，完整檢視全盤後按主題合併有新意義的牌句。30條主盤路徑不必全部逐條抄寫，也不能用路徑數量充當證據強度。",
    "鏡像是跨位對照；騎士步是列差2／欄差1或列差1／欄差2的延伸關聯，均不是相鄰。只用提供的主盤座標表，先有主題及近域主線，再用這些關係補充，不用遠距技法推翻所有近域訊號。",
    "本站末排33→34→35→36作獨立收束線。末排仍各有33至36宮，但不延伸為完整第五列，也不與R4自行連線、鏡像或走騎士步。沒有牌面朝向資料時，不宣稱人物向左／向右或背對誰。",
    "全景題依實際提問分生活領域，說明跨領域的共同影響與分開的限制；不得因全36張必然包含某牌，便認定使用者必有該事件。時間不從格數直接換算月份。"
  ]
};
  guides.two=['第一張定主題，第二張修飾；結合問句讀成一句生活語言，不把兩張當二選一或吉凶投票。'];
  guides.seven=['先讀完整1→2→3→4→5→6→7與相鄰組合，第四張為中心；非相鄰鏡像1↔7、2↔6、3↔5僅作補充。沒有預設日期，也沒有七個獨立語義牌位。'];
  guides.grand_nines=['固定四排九張，四角是1、9、28、36；36格全部屬主盤，沒有獨立尾排。先看人物／主題近域，再讀通過焦點的連續線、落宮與必要的鏡像或騎士步。','落宮以格號為固定背景，牌號是實際內容；主盤中心沒有單一中心牌，人物缺少預選身分時不自行指認。欄數不直接換算日期。'];
  guides.branches=['本站現代自訂分線：每三張只回答抽牌前綁定的那個問題或選項，先相鄰組合，再合讀該路完整三張句。不同路不相鄰，不設跨路鏡像、宮位或騎士步；不得把某一路的好感移到另一位人物。','比較選項時採相同尺度與題目期限；對不同子題各先回答，再整理相互影響。不能以牌面替代他人現實意願或同意。'];
  lines.push('<牌陣模組 name="'+(def||SPREADS[spreadId]).name+'">');
  (guides[spreadId]||[]).forEach(function(step,i){lines.push((i+1)+'. '+step);});
  if(spreadId==='nine'&&drawn[4]&&drawn[4]._presetSig)lines.push('中心牌是抽牌前置入的閱讀焦點；置中本身不是隨機徵兆，但它與周圍牌形成的實際牌句仍照常解讀。');
  if(spreadId==='grand'&&customFocusId)lines.push('使用者預選焦點為'+customFocusId+'.'+CARDS[customFocusId-1].name+'；只增加閱讀入口，不取代本人牌或其餘議題。');
  lines.push('</牌陣模組>','');
}
function _lnPushCardData(lines, drawn, sp) {
  lines.push('<牌面資料>');
  for (var i = 0; i < drawn.length; i++) {
    var c = drawn[i];
    var label = sp.positions ? sp.positions[i] : ('第' + (i + 1) + '格');
    lines.push((i + 1) + '. ' + label + '：' + c.id + '.' + c.name + '（' + c.en + '）' + (c._presetSig ? '〔抽牌前置入焦點〕' : ''));
    lines.push('   核心語彙：' + c.key);
    lines.push('   語義範圍：' + c.scope);
    lines.push('   組合用法：' + COMBINATION_ROLES[c.id]);
    lines.push('   語義校準：' + c.guard);
  }
  lines.push('</牌面資料>');
  lines.push('');
}

function _lnHouseRelations(drawn){
  if(!Array.isArray(drawn)||drawn.length!==36||new Set(drawn.map(function(c){return c.id;})).size!==36||drawn.some(function(c){return !Number.isInteger(c.id)||c.id<1||c.id>36;}))throw new Error('大牌陣須有36張不重複的有效牌。');
  var own=[],mutual=[],cycles=[],seen=new Set();
  drawn.forEach(function(c,i){if(c.id===i+1)own.push(c.id);if(c.id>i+1&&drawn[c.id-1].id===i+1)mutual.push([i+1,c.id]);});
  for(var start=1;start<=36;start++){if(seen.has(start))continue;var chain=[],at=start;while(!seen.has(at)){seen.add(at);chain.push({house:at,card:drawn[at-1].id});at=drawn[at-1].id;}cycles.push({steps:chain,returnsTo:at});}
  return {ownHouses:own,mutualHouses:mutual,houseCycles:cycles,policy:'格號為固定宮號，連到該格實際牌號的宮位；是宮位鏈，非相鄰牌句，也不是多份獨立證據。',source:'https://prismavisions.com/pages/lenormand-the-grand-tableau'};
}
function _lnPushGeometryData(lines, spreadId, drawn, personRepId, customFocusId, def) {
  lines.push('<合法幾何>');
  if(spreadId==='two'||spreadId==='seven'){
    lines.push('唯一完整主線：'+drawn.map(function(c,i){return (i+1)+'.'+c.name;}).join('→'));
    if(spreadId==='seven')lines.push('中心：4；鏡像：1↔7、2↔6、3↔5。鏡像不是相鄰。');
  }else if(spreadId==='branches'){
    (def.branches||[]).forEach(function(b,i){var offset=i*3;lines.push('第'+(i+1)+'路綁定：'+b.question+(b.scope?'；範圍：'+b.scope:'')+'；合法主線：'+drawn.slice(offset,offset+3).map(function(c,j){return (offset+j+1)+'.'+c.name;}).join('→'));});
    lines.push('各路獨立；每路只有三張內部的相鄰關係，沒有跨路連線。');
  }else if(spreadId==='grand_nines'){
    var g=_lnGrandNineGeometry(drawn);
    g.cells.forEach(function(c){lines.push('格'+(c.index+1)+' R'+(c.row+1)+'C'+(c.col+1)+'：'+CARDS[c.index].name+'宮 ← '+drawn[c.index].name+'；近鄰 '+c.neighbors.map(function(n){return n+1;}).join('、')+'；水平鏡像 '+(c.horizontal===c.index?'位於中軸（無另一格）':c.horizontal+1)+'；垂直鏡像 '+(c.vertical+1)+'；騎士步 '+c.knights.map(function(n){return n+1;}).join('、'));});
    lines.push('合法最大路徑：'+g.lines.map(function(line){return line.map(function(i){return i+1;}).join('-');}).join('；'));
    lines.push('四角框架：1、9、28、36；沒有獨立尾排。');
  }else if (spreadId === 'three') {
    lines.push('最大路徑：1.' + drawn[0].name + '→2.' + drawn[1].name + '→3.' + drawn[2].name);
    lines.push('全部連續片段：1-2、2-3、1-2-3。');
    lines.push('非相鄰鏡像：1↔3。');
  } else if (spreadId === 'five') {
    lines.push('最大路徑：1.' + drawn[0].name + '→2.' + drawn[1].name + '→3.' + drawn[2].name + '→4.' + drawn[3].name + '→5.' + drawn[4].name);
    lines.push('全部連續片段：1-2、2-3、3-4、4-5；1-2-3、2-3-4、3-4-5；1-2-3-4、2-3-4-5；1-2-3-4-5。');
    lines.push('中心：3；非相鄰鏡像：1↔5、2↔4。');
  } else if (spreadId === 'choice') {
    lines.push('A路最大路徑：1.' + drawn[0].name + '→2.' + drawn[1].name + '→3.' + drawn[2].name);
    lines.push('共同情境牌：4.' + drawn[3].name);
    lines.push('B路最大路徑：5.' + drawn[4].name + '→6.' + drawn[5].name + '→7.' + drawn[6].name);
    lines.push('支線連續片段：A＝1-2、2-3、1-2-3；B＝5-6、6-7、5-6-7。');
  } else if (spreadId === 'nine') {
    lines.push('九宮格：');
    lines.push('[' + drawn[0].name + '] [' + drawn[1].name + '] [' + drawn[2].name + ']');
    lines.push('[' + drawn[3].name + '] [' + drawn[4].name + '] [' + drawn[5].name + ']');
    lines.push('[' + drawn[6].name + '] [' + drawn[7].name + '] [' + drawn[8].name + ']');
    lines.push('合法相鄰對：1-2、2-3、4-5、5-6、7-8、8-9、1-4、4-7、2-5、5-8、3-6、6-9、1-5、5-9、3-5、5-7；另有短斜鄰接2-4、2-6、4-8、6-8，這四對不延長成穿越中心的三張線。');
    lines.push('合法最大路徑：1-2-3、4-5-6、7-8-9、1-4-7、2-5-8、3-6-9、1-5-9、3-5-7。');
    lines.push('四角框架：1、3、7、9；水平鏡像：1↔3、4↔6、7↔9；垂直鏡像：1↔7、2↔8、3↔9。鏡像與四角不算相鄰線。');
  } else if (spreadId === 'grand') {
    var row = function(a,b){ var out=[]; for (var k=a;k<=b;k++) out.push('['+(k+1)+']'+drawn[k].name); return out.join('  '); };
    lines.push('主盤R1（格1-8）：' + row(0,7));
    lines.push('主盤R2（格9-16）：' + row(8,15));
    lines.push('主盤R3（格17-24）：' + row(16,23));
    lines.push('主盤R4（格25-32）：' + row(24,31));
    lines.push('末排獨立線（格33-36）：' + row(32,35));
    lines.push('全牌座標：' + drawn.map(function(card, idx){ return card.name + '＝' + _lnGrandCoord(idx).label; }).join('；'));
    lines.push('固定宮位映射（格號＝宮號；左為背景宮、右為實際落入牌）：');
    drawn.forEach(function(card,idx){lines.push((idx+1)+'. '+CARDS[idx].name+'宮 ← '+card.id+'.'+card.name+'；座標'+_lnGrandCoord(idx).label);});
    lines.push('主盤鏡像與騎士步（數字皆為格號，非牌號）：');
    for(var gi=0;gi<32;gi++){
      var links=_lnGrandExtraLinks(gi);
      lines.push('格'+(gi+1)+'：水平鏡像'+(links.horizontal+1)+'；垂直鏡像'+(links.vertical+1)+'；騎士步'+links.knights.map(function(k){return k+1;}).join('、'));
    }
    lines.push('末排格33–36沒有主盤鏡像或騎士步；宮位背景仍有效。');
    lines.push('主盤30條合法最大路徑（共含' + _lnGrandMainSegmentCount() + '個兩張以上連續片段）：');
    _lnGrandStraightLines().forEach(function(line){ lines.push(line.label + '：' + _lnGrandLineText(drawn, line)); });
    lines.push('末排最大路徑：33.' + drawn[32].name + '→34.' + drawn[33].name + '→35.' + drawn[34].name + '→36.' + drawn[35].name + '；全部連續片段＝33-34、34-35、35-36、33-34-35、34-35-36、33-34-35-36。');
    if (personRepId) {
      var si = _lnFindCardIndex(drawn, personRepId);
      if (si >= 0) {
        lines.push('本人牌入口：' + drawn[si].name + '在' + _lnGrandCoord(si).label + '（全盤第' + (si + 1) + '格）。');
        lines.push('本人牌立即鄰域：' + _lnGrandNeighborText(drawn, si) + '。');
        lines.push('本人牌穿越路徑：' + _lnGrandLinesThroughText(drawn, si) + '。');
      }
    }
    if (customFocusId) {
      var fi = _lnFindCardIndex(drawn, customFocusId);
      if (fi >= 0) {
        lines.push('額外焦點入口：' + drawn[fi].name + '在' + _lnGrandCoord(fi).label + '（全盤第' + (fi + 1) + '格）。');
        lines.push('焦點牌立即鄰域：' + _lnGrandNeighborText(drawn, fi) + '。');
        lines.push('焦點牌穿越路徑：' + _lnGrandLinesThroughText(drawn, fi) + '。');
      }
    }
  }
  lines.push('</合法幾何>');
  if(spreadId==='grand'||spreadId==='grand_nines')lines.push('固定宮位關係資料：'+JSON.stringify(_lnHouseRelations(drawn))+'。僅在會改變本題主判時採用，不逐鏈朗讀。');
  lines.push('');
}

function _lnPushOutputContract(lines, legalNames) {
  lines.push('本盤可引用牌名：' + legalNames.join('、') + '。正文依共用解讀規則，以最切題的牌句回答，不照資料表順序講解。');
}
function _lnPushBrandModule(lines) {
  lines.push('<品牌附加層>');
  lines.push((window.JY_READING_QUALITY&&typeof window.JY_READING_QUALITY.recommendationEnding==="function"&&String(window.JY_READING_QUALITY.version||"0").localeCompare("4.6.0",undefined,{numeric:true})>=0?window.JY_READING_QUALITY.recommendationText('lenormand'):JY_REC_LENORMAND));
  lines.push('</品牌附加層>','');
}

function buildPrompt(question, drawn, spreadId, sigGender, declaredGender, readingPlan) {
  var sp = readingPlan||_lnBuildSpreadDef(spreadId,question);
  if(!sp||!Array.isArray(drawn)||drawn.length!==sp.count||drawn.some(function(c){return !c||!Number.isInteger(c.id)||c.id<1||c.id>36||!c.name;})||new Set(drawn.map(function(c){return c.id;})).size!==drawn.length)throw new Error('雷諾曼牌陣未完成或牌面資料重複，請重新抽牌');
  drawn.forEach(function(c){
    var canonical=CARDS[c.id-1];
    if(['name','en','key','scope','guard'].some(function(k){return c[k]!==canonical[k];}))throw new Error('雷諾曼牌號、牌名或牌義與本次牌庫不一致，請重新產生資料');
  });
  var lines = [];
  var legalNames = drawn.map(function(c){ return c.name; });
  var personRepId = _lnPersonRepId(declaredGender);
  var customFocusId = _lnCustomFocusId();
  var personRep = personRepId === 28 ? '紳士(28)' : personRepId === 29 ? '淑女(29)' : '未指定';

  lines.push('你是一位資深 Petit Lenormand（小雷諾曼）讀牌者。請運用你自身完整的牌義、牌組、宮位與大牌陣知識，結合下方本次牌面和實際幾何，以白話直接回答問題，讓結論有具體依據。');
  lines.push('');
  lines.push('<本次任務>');
  lines.push('問題：' + String(question || '').trim());
  lines.push('占卜日期：' + _lnLocalISODate());
  lines.push('牌陣：' + sp.name + '（' + sp.count + '張）');
  var questionModel=_lnAnalyzeQuestion(question), selection=_lnDetectSpread(question);
  var capability=questionModel.capability||_lnCapabilityProfile(questionModel);
  var actualAuto=_lnAutoPick&&_lnAutoPick.id===spreadId&&_lnQuestion===String(question||'').trim();
  lines.push('選陣說明：'+(actualAuto?_lnAutoPick.why:selection.id===spreadId?'本題與此牌陣相符：'+selection.why:'本次實際使用'+sp.name+'，按下方已定義的牌位與幾何解讀。自動選陣建議不是牌面證據。'));
  // 這是引擎對問題量測層級的結構化結果，不是額外牌義或人工結論。
  lines.push('引擎問題解析：'+JSON.stringify({intent:capability.intent,resolution:capability.resolution,occurrenceGate:capability.occurrenceGate,dependencyGate:capability.dependencyGate,dependencies:capability.dependencies,claimPolicy:capability.claimPolicy,exactNumericSupported:capability.exactNumericSupported,tasks:capability.tasks}));
  if(questionModel.isChoice)lines.push('原問句方案綁定：A＝'+questionModel.choiceA+'；B＝'+questionModel.choiceB+'。非雙路牌陣時這僅是提問資料，不憑空新增兩路牌位。');
  if(questionModel.moreThanTwoOptions&&spreadId!=='branches')lines.push('問題有三個以上方案：逐一保留原方案，這個版式沒有每方案獨立的可比支線；先回答共同條件，若仍需逐路比較，可改用各題分線牌陣另起一次占卜。');
  if(questionModel.hypothesisChoice)lines.push('問題比較的是同一事件的不同解釋，並非使用者可各自採取的兩個方案；以牌句比較可能解釋與可觀察證據，不冒充已證實對方心意。');
  lines.push('人物歸屬：問卜者本人代表為' + personRep + '。這只建立角色資料；該牌實際出現在本盤時才能進入牌句。其他人物僅在已有明確角色對應時綁定。若同時問多位對象而未分配各自牌位，不自行把不同線派給不同人物或比較誰的支持較強；可答共同局勢，個別差異保留未定。');
  if (_lnSignif && spreadId !== 'nine' && !/^grand/.test(spreadId)) {
    lines.push('使用者選擇的指示牌' + _lnSignif + '.' + ((CARDS[_lnSignif-1] || {}).name || '') + '未被預置本牌陣；若自然抽到，僅依其實際位置與已聲明角色解讀，未抽到則不加入牌句。');
  }
  lines.push('</本次任務>');
  lines.push('');

  lines.push('雷諾曼以本次牌序形成組合語法；指示牌有明確角色才綁定。蛇、狐狸、棺材等象徵先依題目及相鄰牌分辨情境，不憑單牌認定第三者、欺騙、疾病或死亡。');
  if(spreadId==='two')lines.push('雙牌主題與修飾方法參考：https://labyrinthos.co/blogs/learn-tarot-with-labyrinthos-academy/how-to-read-lenormand-card-combinations');
  lines.push('線讀／鏡像／九宮格方法參考：Tina Gong（Labyrinthos）https://labyrinthos.co/blogs/learn-tarot-with-labyrinthos-academy/how-to-read-three-card-lenormand-spreads 、https://labyrinthos.co/blogs/learn-tarot-with-labyrinthos-academy/how-to-read-five-card-and-seven-card-lenormand-spreads 、https://labyrinthos.co/blogs/learn-tarot-with-labyrinthos-academy/how-to-read-nine-card-portrait-box-or-3x3-lenormand-spreads 。本站雙路比較、議題九宮格的軸與末排收束採明示變體，不宣稱是唯一正統。');
  lines.push('牌義流派對照：月亮的認可／情感用法參見讀牌者 Layla https://www.lenormandreader.com/the-moon；Labyrinthos 的月亮文偏現代心理語彙，並非所有流派的共同定義。依題目與組合選擇有解釋力的一支；不影響答案的流派差異不展開。方法參考：牌組作者 James R. Eads 的 Grand Tableau 說明 https://prismavisions.com/pages/lenormand-the-grand-tableau 。該作者頁面採四排九張；本站提供4×9與4×8＋4兩種版式，宮位、鄰域、鏡像和騎士步須依本次提供的版式與座標，不互相借用連線；此為方法書目，並非作者認證或 AI 已即時查網。雷諾曼不套用塔羅的大阿卡那、正逆位與元素尊貴。');
  lines=lines.concat(window.JY_READING_QUALITY&&typeof window.JY_READING_QUALITY.lines==="function"&&String(window.JY_READING_QUALITY.readingVersion||"0").localeCompare("8.0.0",undefined,{numeric:true})>=0?window.JY_READING_QUALITY.lines('lenormand'):JY_READING_LENORMAND);
  _lnPushReaderKernel(lines);
  _lnPushSpreadModule(lines, spreadId, drawn, personRepId, customFocusId,sp);
  _lnPushCardData(lines, drawn, sp);
  _lnPushGeometryData(lines, spreadId, drawn, personRepId, customFocusId,sp);
  _lnPushOutputContract(lines, legalNames);
  _lnPushBrandModule(lines);

  lines.push('【開始解讀】');
  lines.push('請按共用解讀規則直接回答原問題。正文完成後才承接簡短選品，一般有效解讀最後保留以下兩行：');
  lines.push('[靜月之光蝦皮賣場](https://shopee.tw/a50h95648d?tab=shop)');
  lines.push('願你諸事順遂。');

  return window.JYReadingWorkflow.finish(lines.join('\n'),{method:'lenormand',question:question});
}

// ════════════════════════════════════
// 五、Overlay UI（整合進 index.html）
// ════════════════════════════════════
var _lnWrap = null;
var _lnPhase = 'input'; // input | result
var _lastPrompt = '';

function _getWrap() {
  if (!_lnWrap) {
    _lnWrap = document.createElement('div');
    _lnWrap.id = 'ln-screen';
    _lnWrap.style.cssText = 'display:none;position:fixed;top:0;left:0;right:0;bottom:0;width:100%;height:100%;z-index:99999;overflow-y:auto;overflow-x:hidden;background:#0a0a0f;-webkit-overflow-scrolling:touch;';
    document.body.appendChild(_lnWrap);
    // Inject CSS
    var css = document.createElement('style');
    css.textContent = [
      '#ln-screen *{box-sizing:border-box}',
      '.ln-container{max-width:480px;margin:0 auto;padding:1rem .8rem 3rem;font-family:"Noto Serif TC",Georgia,serif;color:#e8e0d0}',
      '.ln-header{text-align:center;padding:1.5rem 0 1rem}',
      '.ln-header h1{font-size:1.5rem;color:#c9a84c;letter-spacing:8px;margin-bottom:.3rem}',
      '.ln-header p{font-size:.75rem;color:rgba(232,224,208,.5);letter-spacing:2px}',
      '.ln-back{color:rgba(232,224,208,.5);text-decoration:none;font-size:.82rem;display:inline-block;margin-bottom:.5rem}',
      '.ln-section{background:#13131a;border:1px solid rgba(201,168,76,.15);border-radius:14px;padding:1.1rem;margin-bottom:.8rem}',
      '.ln-section-title{font-size:.82rem;color:#c9a84c;margin-bottom:.7rem}',
      '.ln-q-input{width:100%;padding:.65rem;border-radius:10px;border:1px solid rgba(201,168,76,.3);background:rgba(255,255,255,.03);color:#e8e0d0;font-family:inherit;font-size:.85rem;resize:none;outline:none;line-height:1.6}',
      '.ln-q-input::placeholder{color:rgba(232,224,208,.4)}',
      '.ln-q-input:focus{border-color:rgba(201,168,76,.5);box-shadow:0 0 12px rgba(201,168,76,.1)}',
      '.ln-spread-grid{display:grid;grid-template-columns:1fr 1fr;gap:.45rem}',
      '.ln-spread-btn{padding:.6rem .4rem;border-radius:10px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.03);color:rgba(232,224,208,.5);cursor:pointer;transition:all .2s;text-align:center;font-family:inherit;font-size:.8rem}',
      '.ln-spread-btn.active{border-color:rgba(201,168,76,.5);background:rgba(201,168,76,.08);color:#c9a84c}',
      '.ln-spread-auto{grid-column:1/-1;background:linear-gradient(135deg,rgba(201,168,76,.1),rgba(201,168,76,.03));border-color:rgba(201,168,76,.3);color:rgba(232,224,208,.8)}',
      '.ln-spread-auto.active{border-color:rgba(243,224,160,.6);background:linear-gradient(135deg,rgba(201,168,76,.18),rgba(201,168,76,.06));color:#f3e0a0;box-shadow:0 0 16px rgba(201,168,76,.15)}',
      '.ln-auto-note{font-size:.72rem;color:rgba(201,168,76,.85);background:rgba(201,168,76,.07);border:1px solid rgba(201,168,76,.18);border-radius:10px;padding:.5rem .7rem;margin:-.2rem 0 .7rem;line-height:1.5}',
      '.ln-draw-btn{display:block;width:100%;padding:.85rem;border-radius:12px;border:1.5px solid rgba(201,168,76,.5);background:linear-gradient(135deg,rgba(201,168,76,.12),rgba(201,168,76,.04));color:#c9a84c;font-family:inherit;font-size:.95rem;font-weight:600;letter-spacing:4px;cursor:pointer;transition:all .3s;margin-top:.8rem}',
      '.ln-draw-btn:active{transform:scale(.97)}',
      '.ln-cards-row{display:flex;flex-wrap:wrap;justify-content:center;gap:.35rem;margin:.6rem 0}',
      '.ln-five-layout{display:grid;grid-template-columns:repeat(6,38px);grid-auto-rows:auto;row-gap:.58rem;justify-content:center;align-items:start;width:228px;max-width:100%;margin:.7rem auto .85rem}',
      '.ln-five-layout .ln-card{justify-self:center;margin:0}',
      '.ln-five-layout .ln-card:nth-child(1){grid-column:1/3;grid-row:1}',
      '.ln-five-layout .ln-card:nth-child(2){grid-column:3/5;grid-row:1}',
      '.ln-five-layout .ln-card:nth-child(3){grid-column:5/7;grid-row:1}',
      '.ln-five-layout .ln-card:nth-child(4){grid-column:2/4;grid-row:2}',
      '.ln-five-layout .ln-card:nth-child(5){grid-column:4/6;grid-row:2}',
      '.ln-card{width:68px;padding:.25rem;border-radius:10px;border:1px solid rgba(201,168,76,.3);background:linear-gradient(145deg,rgba(30,25,15,.9),rgba(20,15,10,.95));text-align:center;animation:lnIn .4s ease-out both;overflow:hidden}',
      '@keyframes lnIn{from{opacity:0;transform:translateY(12px) scale(.9)}to{opacity:1;transform:none}}',
      '.ln-card-img{width:100%;border-radius:6px;display:block}',
      '.ln-card-name{font-size:.65rem;color:#e8e0d0;font-weight:600;margin-top:.2rem}',
      '.ln-card-en{font-size:.5rem;color:rgba(232,224,208,.4)}',
      '.ln-grid-3x3{display:grid;grid-template-columns:repeat(3,1fr);gap:.35rem;max-width:260px;margin:0 auto}',
      '.ln-ai-card{background:linear-gradient(135deg,rgba(30,25,15,.95),rgba(20,15,8,.98));border:1px solid rgba(201,168,76,.3);border-radius:14px;padding:1rem;margin-top:1rem;text-align:center;animation:lnIn .6s ease-out}',
      '.ln-ai-title{font-size:.95rem;color:#c9a84c;letter-spacing:3px;margin-bottom:.5rem}',
      '.ln-ai-desc{font-size:.72rem;color:rgba(232,224,208,.5);line-height:1.6;margin-bottom:.7rem}',
      '.ln-ai-copy-btn{display:block;width:100%;padding:.75rem;border-radius:12px;border:1.5px solid rgba(201,168,76,.5);background:linear-gradient(135deg,rgba(201,168,76,.12),rgba(201,168,76,.04));color:#c9a84c;font-family:inherit;font-size:.88rem;font-weight:600;letter-spacing:3px;cursor:pointer;transition:all .3s;margin-bottom:.5rem}',
      '.ln-ai-copy-btn:active{transform:scale(.97)}',
      '.ln-ai-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:.3rem;margin:.5rem 0}',
      '.ln-ai-sc{display:flex;flex-direction:column;align-items:center;gap:.2rem;padding:.35rem .1rem;border-radius:10px;border:1px solid rgba(255,255,255,.06);background:rgba(255,255,255,.02);cursor:pointer;transition:all .2s;font-family:inherit;text-decoration:none;-webkit-tap-highlight-color:transparent}',
      '.ln-ai-sc:active{transform:scale(.91)}',
      '.ln-ai-sc img{width:30px;height:30px;border-radius:8px}',
      '.ln-ai-sc span{font-size:.55rem;color:rgba(232,224,208,.5);font-weight:600}',
      '.ln-ai-foot{font-size:.6rem;color:rgba(232,224,208,.4);margin-top:.3rem;font-style:italic}',
      '.ln-reset-btn{display:inline-block;padding:.45rem 1rem;border-radius:10px;border:1px solid rgba(255,255,255,.1);background:transparent;color:rgba(232,224,208,.5);cursor:pointer;font-family:inherit;font-size:.78rem;margin-top:.8rem}',
      '.ln-footer{text-align:center;font-size:.6rem;color:rgba(232,224,208,.4);margin-top:1.5rem;letter-spacing:1px;line-height:1.8}',
    ].join('\n');
    document.head.appendChild(css);
  // ═══ 鎏金夜祭 v2（2026/6/10）：視圖升級層——第二樣式表 append-only，同表後者勝、整段可刪回退；流光動畫引用 style.css v81.0 全域 keyframes（jyGiltFlow），快取舊版時退化為靜態鎏金，無害 ═══
  try{var _g2=document.createElement('style');_g2.setAttribute('data-jy-gilt2','lenormand');_g2.textContent='.ln-section{background:linear-gradient(180deg,rgba(24,20,14,.78),rgba(14,12,9,.86));border:1px solid rgba(201,168,76,.2);border-radius:18px;box-shadow:0 18px 40px rgba(0,0,0,.45),inset 0 1px 0 rgba(245,231,184,.14);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px)}.ln-section-title{position:relative;padding-left:12px;letter-spacing:.08em;color:#e8d28a}.ln-section-title::before{content:"";position:absolute;left:0;top:50%;transform:translateY(-50%);width:3px;height:1.05em;border-radius:2px;background:rgba(226,232,240,.85);box-shadow:0 0 8px rgba(226,232,240,.85)}.ln-q-input{background:rgba(8,7,5,.62);border:1px solid rgba(201,168,76,.26);border-radius:12px;color:#f2e9d6;transition:border-color .2s,box-shadow .2s}.ln-q-input:focus{border-color:#e8d28a;box-shadow:0 0 0 3px rgba(201,168,76,.16);outline:none}.ln-spread-btn{background:rgba(201,168,76,.06);border:1px solid rgba(201,168,76,.22);color:#d8c79a;border-radius:12px;transition:all .18s}.ln-spread-btn.active{background:linear-gradient(135deg,#e8d28a,#c9a84c);color:#171208;border-color:transparent;box-shadow:0 6px 18px rgba(201,168,76,.28);font-weight:700}.ln-spread-auto{border:1px solid rgba(232,210,138,.55);box-shadow:0 0 0 1px rgba(201,168,76,.18),0 8px 22px rgba(201,168,76,.16);border-radius:14px}.ln-draw-btn{background:linear-gradient(110deg,#8a6d2f,#e8d28a 28%,#c9a84c 52%,#f5e7b8 74%,#8a6d2f);background-size:220% 100%;animation:jyGiltFlow 5.5s linear infinite;color:#171208;border:none;border-radius:14px;font-weight:800;letter-spacing:.14em;box-shadow:0 10px 26px rgba(201,168,76,.32),inset 0 1px 0 rgba(255,255,255,.35)}.ln-draw-btn:active{transform:translateY(1px)}.ln-reset-btn{background:transparent;border:1px solid rgba(201,168,76,.34);color:#cdb87f;border-radius:12px}.ln-back{color:rgba(232,210,138,.75)}.ln-back:hover{color:#f5e7b8}.ln-card{background:linear-gradient(180deg,rgba(26,24,20,.9),rgba(15,13,10,.94));border:1px solid rgba(226,232,240,.16);border-radius:12px;box-shadow:0 10px 26px rgba(0,0,0,.5),inset 0 1px 0 rgba(245,231,184,.1)}.ln-grid-3x3{gap:10px}.ln-ai-card{background:linear-gradient(180deg,rgba(24,20,14,.78),rgba(14,12,9,.86));border:1px solid rgba(201,168,76,.2);border-radius:18px;box-shadow:0 18px 40px rgba(0,0,0,.45),inset 0 1px 0 rgba(245,231,184,.14);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px)}@media (prefers-reduced-motion:reduce){.ln-draw-btn{animation:none}}@supports not (backdrop-filter:blur(1px)){[data-jy-view-lenormand]{}}.ln-draw-btn:focus-visible{outline:2px solid #e8d28a;outline-offset:2px}';document.head.appendChild(_g2);}catch(e){}
  }
  return _lnWrap;
}

var AI_LIST = [
  {id:'chatgpt',name:'ChatGPT',url:'https://chatgpt.com/'},
  {id:'claude',name:'Claude',url:'https://claude.ai/new'},
  {id:'gemini',name:'Gemini',url:'https://gemini.google.com/app?hl=zh-TW'},
  {id:'grok',name:'Grok',url:'https://grok.x.ai/'},
  {id:'deepseek',name:'DeepSeek',url:'https://chat.deepseek.com/'},
  {id:'kimi',name:'Kimi',url:'https://kimi.moonshot.cn/'},
  {id:'doubao',name:'豆包',url:'https://www.doubao.com/'},
  {id:'metaai',name:'Meta AI',url:'https://www.meta.ai/'},
  {id:'copilot',name:'Copilot',url:'https://copilot.microsoft.com/'},
  {id:'perplexity',name:'Perplexity',url:'https://www.perplexity.ai/'}
];

function _render() {
  // v3.2 根治：重繪會銷毀並重建 textarea——任何觸發 _render 的按鈕（牌陣/指示牌/性別/未來新增）
  //   都曾或將把使用者打到一半的問題刷掉。收口在唯一入口：重建前先把現值回存 _lnQuestion，
  //   不再要求每個按鈕各自記得先存（v2.x 只有 _lnSetSpread 有存，_lnSetSig/_lnSetGender 漏了＝實測問題被清空的根因）。
  var _qNow = document.getElementById('ln-q');
  if (_qNow) _lnQuestion = _qNow.value;
  var w = _getWrap();
    var savedScroll=w.getAttribute('data-flow-view')===_lnPhase?w.scrollTop:0;w.setAttribute('data-flow-view',_lnPhase);
  var h = '<div class="ln-container">';
  h += '<nav class="at-room-nav" aria-label="頁面導覽"><button type="button" class="at-back ln-back" onclick="' + (_lnPhase === 'input' ? '_lenormandClose()' : '_lnReset()') + '">← ' + (_lnPhase === 'input' ? '返回首頁' : '返回修改') + '</button>' + (_lnPhase !== 'input' ? '<button type="button" class="at-home-link" onclick="_lenormandClose()">首頁</button>' : '') + '<a class="at-room-shop" href="https://shopee.tw/a50h95648d?tab=shop" target="_blank" rel="noopener noreferrer">蝦皮選物 <span aria-hidden="true">↗</span></a></nav>';
  h += '<div class="ln-header at-tool-header"><span class="at-art" data-art="lenormand" aria-hidden="true"></span><div><span class="at-eyebrow">PETIT LENORMAND · 36 CARDS</span><h1>雷諾曼</h1><p>把牌與牌連成一句話，釐清生活的線索。</p></div></div>';

  if (_lnPhase === 'input') {
    h += '<div class="at-flow-guide" aria-label="探索流程"><span><b>01</b> 整理問題</span><span><b>02</b> 選陣與抽牌</span><span><b>03</b> 探索解讀</span></div>';
    // Question
    h += '<div class="ln-section"><div class="ln-section-title">✦ 你想問什麼？</div>';
    h += '<textarea class="ln-q-input" id="ln-q" aria-label="雷諾曼想釐清的問題" rows="2" maxlength="1000" placeholder="例如：這份工作值得繼續嗎？請寫下你最在意的事。">' + _lnEscapeHTML(_lnQuestion) + '</textarea></div>';
    // Spread
    h += '<div class="ln-section"><div class="ln-section-title">✦ 選擇牌陣</div><div class="ln-spread-grid">';
    var sps=[{id:'auto',n:'✦ 自動判斷',d:'依問題重點選擇牌陣（可手動調整）'}].concat(Object.keys(SPREADS).map(function(id){var sp=SPREADS[id];return {id:id,n:sp.name,d:sp.desc};}));
    for (var i=0;i<sps.length;i++) {
      h += '<button class="ln-spread-btn' + (sps[i].id===_lnSpread?' active':'') + (sps[i].id==='auto'?' ln-spread-auto':'') + '" onclick="_lnSetSpread(\''+sps[i].id+'\')">' + sps[i].n + '<br><span style="font-size:.6rem;opacity:.6">' + sps[i].d + '</span></button>';
    }
    h += '</div><div id="ln-spread-preview" class="ln-auto-note" role="status" aria-live="polite" style="margin-top:.7rem"></div></div>';
    // v3.0：指示牌（Significator）
    h += '<div class="at-form-options">';
    h += '<div class="ln-section"><div class="ln-section-title">✦ 定位牌（可選）</div>';
    h += '<div style="display:flex;flex-wrap:wrap;gap:.45rem">';
    h += '<button class="ln-spread-btn' + (_lnSignif===null?' active':'') + '" onclick="_lnSetSig(null)">不使用</button>';
    h += '<button class="ln-spread-btn' + (_lnSignif===28?' active':'') + '" onclick="_lnSetSig(28)">男士(28)</button>';
    h += '<button class="ln-spread-btn' + (_lnSignif===29?' active':'') + '" onclick="_lnSetSig(29)">女士(29)</button>';
    var _sigCustom = (_lnSignif!==null && _lnSignif!==28 && _lnSignif!==29);
    h += '<button class="ln-spread-btn' + (_sigCustom?' active':'') + '" onclick="_lnSigPickOpen()">' + (_sigCustom ? ('自選：' + _lnSignif + '.' + (CARDS[_lnSignif-1]||{}).name) : '自選一張') + '</button>';
    h += '</div>';
    h += '<div class="ln-auto-note" style="margin-top:.5rem">男士／女士只用來代表你本人；自選其他牌只作議題定位，不能代替本人牌。九宮格會把定位牌置於中央；大牌陣在36張中尋找已指定的本人牌與議題牌；未指定本人牌時以問題主題切入。線讀與雙路比較不預置。</div></div>';
    // v3.1：性別聲明（人物牌歸屬與 GT 代表牌的權威來源；可不選）
    h += '<div class="ln-section"><div class="ln-section-title">✦ 本人性別（選填）</div>';
    h += '<div style="display:flex;flex-wrap:wrap;gap:.45rem">';
    h += '<button class="ln-spread-btn' + (_lnGender===null?' active':'') + '" onclick="_lnSetGender(null)">不指定</button>';
    h += '<button class="ln-spread-btn' + (_lnGender==='male'?' active':'') + '" onclick="_lnSetGender(\'male\')">男</button>';
    h += '<button class="ln-spread-btn' + (_lnGender==='female'?' active':'') + '" onclick="_lnSetGender(\'female\')">女</button>';
    h += '</div></div>';
    h += '</div>';
    h += '<button class="ln-draw-btn" onclick="_lnDoDraw()">✦ 抽 牌 ✦</button>';
  } else {
    // Results
    var sp = _lnReadingPlan||SPREADS[_lnResolved];
    h += '<div class="ln-section"><div class="ln-section-title">✦ ' + sp.name + '（' + sp.count + ' 張）</div>';
    if (_lnAutoPick) h += '<div class="ln-auto-note">✦ 自動判斷：' + _lnAutoPick.why + '</div>';
    if (_lnSignif) h += '<div class="ln-auto-note">✦ ' + ((_lnSignif===28||_lnSignif===29)?'本人定位牌':'議題定位牌') + '：' + _lnSignif + '.' + ((CARDS[_lnSignif-1]||{}).name||'') + (_lnResolved==='nine' ? '（已置中央・現代焦點九宮格）' : /^grand/.test(_lnResolved) ? '（於36張中定位讀取）' : '（本牌陣不置入）') + '</div>';
    if(_lnResolved==='grand_nines'){
      h+='<p class="at-result-note">四排各九張，橫向滑動查看完整盤面。</p><div class="at-chart-scroll" tabindex="0" role="region" aria-label="四排九張大牌陣"><div style="display:grid;grid-template-columns:repeat(9,72px);gap:8px;width:max-content">';
    }else if(_lnResolved==='seven'){
      h+='<div class="at-chart-scroll" tabindex="0" role="region" aria-label="七張線"><div style="display:flex;gap:8px;width:max-content">';
    }else if(_lnResolved==='branches'){
      h+='<div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px">';
    }else if (_lnResolved === 'grand') {
      h += '<p class="at-result-note">依 8 × 4 ＋底部 4 張排列。橫向滑動可查看完整牌陣，牌位編號對應解讀提示詞。</p><div class="at-chart-scroll" tabindex="0" role="region" aria-label="可橫向捲動的大牌陣"><div class="ln-grand-layout">';
    } else if (_lnResolved === 'nine') {
      h += '<div class="ln-grid-3x3">';
    } else if (_lnResolved === 'choice') {
      h += '<div class="ln-choice-layout" style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;align-items:start">';
    } else if (_lnResolved === 'five') {
      // v3.11：固定 3+2 幾何網格。不可再交給 flex 依螢幕寬度自行換行，否則會出現 4+1 或底排偏斜。
      h += '<div class="ln-five-layout" role="group" aria-label="五張線：上排三張，下排兩張">';
    } else {
      h += '<div class="ln-cards-row">';
    }
    for (var j=0;j<_lnDrawn.length;j++) {
      var c = _lnDrawn[j];
      var imgSrc = IMG_MAP[c.id] || '';
      var _choicePos = ''; if (_lnResolved === 'choice') { if (j === 3) _choicePos='grid-column:2;grid-row:2;'; else if (j >= 4) _choicePos='grid-column:'+(j-3)+';grid-row:3;'; }
      h += '<div class="ln-card" style="'+_choicePos+'animation-delay:'+j*0.05+'s">' + (c._presetSig ? '<div style="font-size:.6rem;color:#e8d28a;letter-spacing:.12em;margin-bottom:2px">★ 指示牌</div>' : '');
      h += '<div class="at-card-position">' + _lnEscapeHTML(sp.positions ? sp.positions[j] : ('牌位 ' + (j+1))) + '</div>';
      if (imgSrc) h += '<img class="ln-card-img" src="'+imgSrc+'" alt="'+c.name+'">';
      h += '<div class="ln-card-name">' + c.id + '. ' + c.name + '</div>';
      h += '<div class="ln-card-en">' + c.en + '</div></div>';
    }
    h += '</div>';
    if (/^(grand|grand_nines|seven)$/.test(_lnResolved)) h += '</div>';
    h += '</div>';

    // AI card
    h += '<div class="ln-ai-card"><div class="ln-ai-title">🌙 AI 深度解讀</div>';
    h += '<div class="ln-ai-desc">點擊 AI 圖示會先複製提示詞，再於新分頁直接開啟該 AI 網頁版。</div>';
    h += '<button class="ln-ai-copy-btn" onclick="_lnCopy()">✦ 一鍵複製占卜提示詞 ✦</button>';
    h += '<div class="ln-ai-grid">';
    for (var a=0;a<AI_LIST.length;a++) {
      var ai = AI_LIST[a];
      // v3.14：Gemini 改回與其它 9 個 AI 一致的 target="_blank"——v3.11/v3.13 兩次的特例（_self、
      // 同頁開啟）都已實機驗證無法解決閃退問題，繼續猜 target 不是根治，先回到唯一沒人回報過問題的寫法。
      h += '<a class="ln-ai-sc" href="'+ai.url+'" target="_blank" rel="external noopener noreferrer" onpointerdown="_lnPrimeAICopy(event,this)" onclick="_lnPrimeAICopy(event,this)" aria-label="複製提示詞並開啟 '+ai.name+' 網頁版">';
      h += '<img src="ai-icons/ai-'+ai.id+'.png" alt="'+ai.name+'">';
      h += '<span>'+ai.name+'</span></a>';
    }
    h += '</div></div>';
    h += '<div style="text-align:center;margin-top:.2rem"><button type="button" class="at-share-button" onclick="_lenormandShare()" style="padding:.72rem 1.5rem;border-radius:12px;border:1px solid rgba(201,168,76,.5);background:linear-gradient(135deg,rgba(201,168,76,.18),rgba(201,168,76,.05));color:#c9a84c;font-family:inherit;font-size:.92rem;font-weight:600;letter-spacing:1px;cursor:pointer">\uD83D\uDCE4 \u751F\u6210\u5206\u4EAB\u5361</button></div>';
    h += '<div style="text-align:center"><button class="ln-reset-btn" onclick="_lnReset()">↺ 重新抽牌</button></div>';
  }
  h += '<div class="ln-footer">靜月之光 ・ jingyue.uk<br>Petit Lenormand 雷諾曼牌</div></div>';
  w.innerHTML = h;
    if (window.JY_ATELIER) window.JY_ATELIER.enhance(w);
    w.scrollTop=savedScroll;
  var input=document.getElementById('ln-q');
  if(input){input.addEventListener('input',_lnUpdateSpreadPreview);_lnUpdateSpreadPreview();}
}

// Preview does not mutate a completed draw; _lnDoDraw always resolves the current input again.
function _lnUpdateSpreadPreview() {
  var input=document.getElementById('ln-q'),host=document.getElementById('ln-spread-preview');
  if(!input||!host)return;
  var q=input.value.trim();
  if(!q){host.textContent='寫下問題後，這裡會顯示建議牌陣與原因。';return;}
  if(_lnSpread!=='auto'){try{var manual=_lnBuildSpreadDef(_lnSpread,q);host.textContent='手動選擇：'+manual.name+'（'+manual.count+'張）。依實際牌位解讀。';if(manual.branches)host.textContent+='\n'+manual.branches.map(function(b,i){return (i+1)+'. '+b.question;}).join('\n');}catch(e){host.textContent=e.message;}return;}
  var pick=_lnDetectSpread(q);
  host.textContent=pick.id?'建議：'+SPREADS[pick.id].name+'（'+SPREADS[pick.id].count+'張）・'+pick.why:pick.why;
  if(pick.id){var pd=_lnBuildSpreadDef(pick.id,q);host.textContent='建議：'+pd.name+'（'+pd.count+'張）・'+pick.why;if(pd.branches)host.textContent+='\n'+pd.branches.map(function(b,i){return (i+1)+'. '+b.question+(b.scope?'〔'+b.scope+'〕':'');}).join('\n');}
  var sys=recommendReadingSystem(q);host.textContent+='\n系統建議：'+sys.label+'・'+sys.reason;
  if(pick.x&&pick.x.isChoice)host.textContent+='\nA：'+pick.x.choiceA+'\nB：'+pick.x.choiceB+'\n請核對這是否就是你想比較的兩條路；可直接修改上方問題。';
}

// ════ Public API ════
window._lenormandOpen = function() {
  _lnPhase = 'input';
  _lnQuestion = '';
  _lnSpread = 'auto';
  _lnReadingPlan=null;
  _lnResolved = 'three';
  _lnAutoPick = null;
  _lnDrawn = [];
  _lastPrompt = '';
  var w = _getWrap();
  w.style.display = 'block';
  _render();
  w.scrollTop = 0;
};

window._lenormandShare = function() {
  if (!window.JYShareCard) { alert('\u5206\u4EAB\u5143\u4EF6\u8F09\u5165\u4E2D\uFF0C\u8ACB\u7A0D\u5019\u518D\u8A66'); return; }
  var sp = _lnReadingPlan||SPREADS[_lnResolved] || {};
  var pos = sp.positions || [];
  var cards = (_lnDrawn || []).map(function(c, i) {
    var pl = (pos[i] || ('\u7B2C' + (i + 1) + '\u5F35'));
    pl = String(pl).split('/').pop();
    // v3.3：補傳 id/img/sig——share-card v2.0 起依牌陣張數排版並繪真牌面（img 同源資產、畫布無汙染）
    return { id: c.id, name: c.name || '', pos: pl, img: (typeof IMG_MAP !== 'undefined' && IMG_MAP[c.id]) || '', sig: !!c._presetSig };
  });
  JYShareCard.open('lenormand', {
    cardTitle: '\u6211\u7684\u96F7\u8AFE\u66FC',
    spread: (sp.name || '\u96F7\u8AFE\u66FC') + (sp.count ? '\uFF08' + sp.count + '\u5F35\uFF09' : ''),
    question: _lnQuestion || '',
    cards: cards
  });
};

window._lenormandClose = function() {
    if(window.JYRitual)window.JYRitual.cancel('lenormand');
  var w = _getWrap();
  w.style.display = 'none';

    if (window.JY_ATELIER) window.JY_ATELIER.restoreEntrance();
  };

window._lnSetSpread = function(id) {
  if(id!=='auto'&&!SPREADS[id])return;
  // v3.2：問題文字回存已收口至 _render() 入口，這裡不再各自處理
  _lnSpread = id;
  _render();
};

window._lnDoDraw = function() {
    if(window.JYRitual && window.JYRitual.isActive())return;
  var qEl = document.getElementById('ln-q');
  _lnQuestion = qEl ? qEl.value.trim() : '';
  if (!_lnQuestion) { alert('請先輸入一個明確問題。時間範圍只有在你需要限定期限時才必填。'); return; }
  // v5.0：自動與手動選陣都走同一套問題驗證與適配檢查。
  _lnAutoPick = null;
  _lnResolved = _lnSpread;
  if (_lnSpread === 'auto') {
    var _det = _lnDetectSpread(_lnQuestion);
    if (!_det.id) { alert(_det.why || '請先輸入明確問題。'); return; }
    _lnResolved = _det.id;
    _lnAutoPick = _det;
  } else {
    var _fit = _lnCheckSpreadFit(_lnQuestion, _lnResolved);
    if (!_fit.ok) { alert(_fit.reason || '這個問題不適合目前選擇的牌陣。'); return; }
  }
  var sp;try{sp=_lnBuildSpreadDef(_lnResolved,_lnQuestion);}catch(e){alert(e.message);return;}
  _lnReadingPlan=JSON.parse(JSON.stringify(sp));
  var _personRepId = _lnPersonRepId(_lnGender);
  // 未指定本人牌仍可作主題全景；提示詞明示未指定，絕不暗中以性別猜代表牌。
  // v4.0：九宮格＋指示牌＝現代焦點九宮格；池先移除指示牌避免重複
  if (_lnResolved === 'nine' && _lnSignif) {
    shuffleDeck();
    _lnDeck = _lnDeck.filter(function (c) { return c.id !== _lnSignif; });
    var _sigCard = JSON.parse(JSON.stringify(CARDS[_lnSignif - 1]));
    _sigCard._presetSig = true;
    _lnDrawn = _lnDeck.slice(0, 8);
    _lnDrawn.splice(4, 0, _sigCard);
  } else {
    drawCards(sp.count);
  }
  if(sp.branches)_lnDrawn.forEach(function(c,i){c.questionBinding=JSON.parse(JSON.stringify(sp.branches[Math.floor(i/3)]));});
  if (_lnGender) _lnSigGender = _lnGender; // v3.1：聲明性別優先
  _lastPrompt = buildPrompt(_lnQuestion, _lnDrawn, _lnResolved, _lnSigGender, _lnGender,_lnReadingPlan);
  function reveal(){
    _lnPhase = 'result'; _render(); _getWrap().scrollTop = 0;
  }
  if(window.JYRitual)window.JYRitual.play('lenormand',{
    question:_lnQuestion, spreadName:sp.name+'（'+sp.count+' 張）',
    cards:_lnDrawn.map(function(c){return {id:c.id,name:c.name,image:IMG_MAP[c.id]||''};}),
    onComplete:reveal,
    onCancel:function(){_lnDrawn=[];_lastPrompt='';}
  });
  else reveal();
};

// v3.0：指示牌選擇
window._lnSetGender = function (g) {
  _lnGender = g;
  try { if (g) localStorage.setItem('jy_ln_gender', g); else localStorage.removeItem('jy_ln_gender'); } catch (e) {}
  _lnSigGender = g || null;
  _render();
};
window._lnSetSig = function (id) {
  _lnSignif = id;
  if (id === null && !_lnGender) _lnSigGender = null;
  if (id === 28) { _lnSigGender = 'male'; _lnGender = 'male'; try { localStorage.setItem('jy_ln_gender', 'male'); } catch (e) {} }
  if (id === 29) { _lnSigGender = 'female'; _lnGender = 'female'; try { localStorage.setItem('jy_ln_gender', 'female'); } catch (e) {} }
  var ov = document.getElementById('ln-sig-ov'); if (ov) ov.remove();
  _render();
};
window._lnSigPickOpen = function () {
  // v3.0.1：①modal 改掛進視圖容器且 z-index 100000——原掛 body z-index 9999 被 ln-screen(99999) 蓋住，
  //   實測「按了沒反應、退出畫面才跑出來」；②選牌格上真實牌面圖（IMG_MAP），無圖時退回純文字。
  var _old = document.getElementById('ln-sig-ov'); if (_old) _old.remove();
  var ov = document.createElement('div'); ov.id = 'ln-sig-ov';
  ov.style.cssText = 'position:fixed;inset:0;z-index:100000;background:rgba(8,7,5,.86);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;padding:14px';
  var bx = '<div style="max-width:560px;width:100%;max-height:82vh;overflow:auto;background:rgba(20,17,12,.97);border:1px solid rgba(201,168,76,.35);border-radius:18px;padding:14px;box-shadow:0 24px 60px rgba(0,0,0,.6)">';
  bx += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;position:sticky;top:-14px;background:rgba(20,17,12,.97);padding:6px 0;z-index:2"><b style="color:#e8d28a;letter-spacing:.1em">選擇指示牌</b><button onclick="document.getElementById(\'ln-sig-ov\').remove()" style="background:none;border:none;color:#cdb87f;font-size:1.25rem;cursor:pointer;padding:4px 8px">✕</button></div>';
  bx += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:9px">';
  for (var i = 0; i < CARDS.length; i++) {
    var c = CARDS[i];
    var _on = (_lnSignif === c.id);
    var _img = (typeof IMG_MAP !== 'undefined' && IMG_MAP[c.id]) ? IMG_MAP[c.id] : '';
    bx += '<button onclick="_lnSetSig(' + c.id + ')" style="padding:.45rem .3rem .55rem;border-radius:12px;border:1.5px solid rgba(201,168,76,' + (_on ? '.85' : '.25') + ');background:rgba(201,168,76,' + (_on ? '.14' : '.04') + ');color:#e9dec0;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:6px' + (_on ? ';box-shadow:0 0 0 1px rgba(201,168,76,.3),0 6px 16px rgba(201,168,76,.18)' : '') + '">';
    if (_img) bx += '<img src="' + _img + '" alt="' + c.name + '" loading="lazy" style="width:100%;aspect-ratio:2/3;object-fit:cover;border-radius:8px;display:block">';
    bx += '<span style="font-size:.78rem;line-height:1.2">' + c.id + '. ' + c.name + '</span></button>';
  }
  bx += '</div></div>'; ov.innerHTML = bx;
  ov.onclick = function (e) { if (e.target === ov) ov.remove(); };
  (_getWrap() || document.body).appendChild(ov);
};

// v3.14：可選診斷——預設完全不啟動，不影響任何正常使用者。網址列加上 ?lndebug=1 才會生效。
// 用途：下次歐那實機重現「點 Gemini 閃一下其他頁面又跳回」時，回到本頁會跳出 alert，
//   標示 (a) pageshow.persisted（true＝瀏覽器真的離開過、靠 bfcache 瞬間還原，屬本頁可診斷範圍）
//   (b) 距離點擊的毫秒數。若 persisted 為 false 或事件根本沒觸發，代表文件其實沒被瀏覽器卸載過，
//   就更指向 Android 對 gemini.google.com 的 App Link/Intent 攔截（非本頁 JS 可控，需在手機
//   設定關閉 Gemini App 的「預設開啟連結」來驗證並繞過）。看到結果後判斷下一步，不在這裡先猜答案。
var _lnDebug = false;
try { _lnDebug = /(^|[?&])lndebug=1(&|$)/.test(location.search || ''); } catch (e) {}
if (_lnDebug) {
  try {
    window.addEventListener('pageshow', function (ev) {
      var lastClick = Number(sessionStorage.getItem('jy_ln_dbg_click') || 0);
      var delta = lastClick ? (Date.now() - lastClick) : null;
      if (delta !== null && delta >= 0 && delta < 20000) {
        alert('[lndebug] 返回本頁\nbfcache 還原(persisted)：' + ev.persisted +
          '\n距上次點 AI 圖示：' + delta + 'ms\ndocument.referrer：' + (document.referrer || '(無)'));
      }
    });
  } catch (e) {}
}

// v3.11：剪貼簿唯一入口。Clipboard API 在安全來源優先；舊瀏覽器才使用同步 textarea 後備。
// 注意：AI 網頁導覽由真實 <a href> 的預設行為負責，這裡絕不 window.open、location.href 或 _render。
function _lnLegacyCopy(text) {
  var ta = null;
  try {
    ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.setAttribute('aria-hidden', 'true');
    ta.style.cssText = 'position:fixed;top:0;left:-9999px;width:1px;height:1px;opacity:0;font-size:16px;pointer-events:none';
    document.body.appendChild(ta);
    try { ta.focus({ preventScroll: true }); } catch (_focusErr) { ta.focus(); }
    ta.select();
    ta.setSelectionRange(0, ta.value.length);
    return !!document.execCommand('copy');
  } catch (e) {
    return false;
  } finally {
    if (ta && ta.parentNode) ta.parentNode.removeChild(ta);
  }
}

function _lnWriteClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      return navigator.clipboard.writeText(text).then(function () { return true; }).catch(function () {
        return _lnLegacyCopy(text);
      });
    } catch (e) {}
  }
  return Promise.resolve(_lnLegacyCopy(text));
}

window._lnCopy = function() {
  if (!_lastPrompt) return false;
  var btn = document.querySelector('.ln-ai-copy-btn');
  var original = btn ? btn.innerHTML : '';
  _lnWriteClipboard(_lastPrompt).then(function(ok){
    if (!btn) return;
    btn.innerHTML = ok ? '✓ 已複製！貼到 AI 送出即可' : '複製失敗，請長按提示詞複製';
    btn.style.borderColor = ok ? 'rgba(52,211,153,.5)' : 'rgba(248,113,113,.65)';
    setTimeout(function(){
      if (!btn.isConnected) return;
      btn.innerHTML = original;
      btn.style.borderColor = '';
    }, 2500);
  });
  return false;
};

window._lnPrimeAICopy = function(ev, link) {
  if (!_lastPrompt || !link) return;

  // v3.14：診斷時間戳，僅 ?lndebug=1 時寫入，供 pageshow 比對「點擊到返回」經過多久。
  if (_lnDebug) { try { sessionStorage.setItem('jy_ln_dbg_click', String(Date.now())); } catch (e) {} }

  // pointerdown 與 click 會連續觸發，短時間只複製一次。
  var now = Date.now();
  var last = Number(link.getAttribute('data-ln-copy-at') || 0);
  if (now - last < 700) return;
  link.setAttribute('data-ln-copy-at', String(now));

  // 僅同步複製。禁止 preventDefault／stopPropagation／return false；
  // 連結導覽完全由真實 <a href> 的瀏覽器預設行為執行。
  var copied = _lnLegacyCopy(_lastPrompt);
  if (!copied && navigator.clipboard && window.isSecureContext) {
    try { navigator.clipboard.writeText(_lastPrompt).catch(function(){}); } catch (e) {}
  }

  var label = link.querySelector('span');
  if (label && copied) {
    var original = link.getAttribute('data-ln-label') || label.textContent;
    link.setAttribute('data-ln-label', original);
    label.textContent = '已複製';
    setTimeout(function(){ if (label.isConnected) label.textContent = original; }, 1800);
  }
};
window._lnReset = function() {
  _lnReadingPlan=null;
  if(window.JYRitual)window.JYRitual.cancel('lenormand');
  _lnDrawn=[];_lastPrompt='';
  _lnPhase = 'input';
  _render();
  _getWrap().scrollTop = 0;
};

function _lnReviewAnswerGranularity(question, answer) {
  var x=_lnAnalyzeQuestion(question), text=String(answer||''), issues=[];
  function add(code,message,match){issues.push({code:code,message:message,match:match||''});}
  if(x.asksExactAmount){
    var amount=text.match(/(?:中獎|獎金|會中|能中|可中|中到|拿到|領到|獲得|得到|收到|入帳|營業額|營收|收入|業績|金額|價格|約|大約|大概|落在|介於|範圍)[^。！？!?\n]{0,28}?(\d[\d,]*(?:\.\d+)?)(?:\s*)(元|塊|萬元|萬|千元|千)/);
    if(amount)add('EXACT_AMOUNT_OVERREACH','雷諾曼引擎只支援相對幅度／級距，答案卻把牌面換算成具體金額。',amount[0]);
  }
  if(x.asksExactCount){
    var count=text.match(/\d+\s*(?:張|個|次|件|份|人|筆|單|顆|條|位)/);
    if(count && String(question||'').indexOf(count[0])<0)add('EXACT_COUNT_OVERREACH','雷諾曼引擎只支援相對數量級，不應把牌面換算成精確數量。',count[0]);
  }
  if(x.asksProbability){
    var prob=text.match(/\d+(?:\.\d+)?\s*[%％]/);
    if(prob)add('EXACT_PROBABILITY_OVERREACH','雷諾曼引擎不以牌面換算精確機率。',prob[0]);
  }
  if(x.asksExactDate){
    var date=text.match(/(?:20\d{2}[年\/-]\d{1,2}(?:[月\/-]\d{1,2}日?)?|\d{1,2}月\d{1,2}日|\d{1,2}號|\d{1,2}點(?:\d{1,2}分)?)/);
    if(date && String(question||'').indexOf(date[0])<0)add('EXACT_DATETIME_OVERREACH','雷諾曼引擎只支援相對時段與條件，不應由牌面新增精確日期時間。',date[0]);
  }
  if(x.asksExactAge){
    var age=text.match(/\d{1,3}\s*歲/);
    if(age && String(question||'').indexOf(age[0])<0)add('EXACT_AGE_OVERREACH','雷諾曼引擎只支援相對年齡／成熟度，不應由牌面新增精確歲數。',age[0]);
  }
  var sentences=text.match(/[^。！？!?\n]+[。！？!?]?/g)||[];
  function hasQualifier(sentence){return /牌面(?:偏向|支持|較(?:像|支持|可能)|顯示.{0,8}(?:傾向|可能)|只能|僅能)|牌勢(?:偏向|支持|較(?:像|支持|可能))|組合(?:偏向|支持|較(?:像|支持|可能))|象徵(?:上)?(?:偏向|支持|較(?:像|支持|可能))|傾向|偏向|較(?:像|支持|可能)|可能|有機會|看起來|目前看|若|如果|假如|未必|不一定|不能證明|不代表|不等於|僅能|只能/.test(sentence);}
  function negated(sentence){return /沒有證據|不能證明|不代表|不等於|未必|不一定|並非|不是/.test(sentence);}
  if(x.isSensitiveHidden||x.hiddenStateClaim){
    sentences.forEach(function(sentence){
      var hidden=/(?:暗戀|秘密喜歡|真心喜歡|對(?:你|我)有意思|對(?:你|我)有好感|愛(?:你|我)|在乎(?:你|我))/.test(sentence);
      if(hidden&&!negated(sentence)&&!hasQualifier(sentence))add('HIDDEN_STATE_AS_FACT','答案把未公開的他人內心狀態寫成已證實事實；引擎只支援由牌面形成的象徵傾向。',sentence.trim());
      if(hidden&&/(?:百分之百|100%|一定|必然|肯定|確定|毫無疑問|就是事實|真的就是|(?:牌面|牌勢|組合|象徵).{0,8}(?:證明|確認))/.test(sentence)&&!negated(sentence))add('HIDDEN_STATE_CERTAINTY','答案對未公開內心使用了確定性斷言；牌面只能形成有條件的象徵判讀。',sentence.trim());
    });
  }
  if(x.futureActionClaim){
    sentences.forEach(function(sentence){
      var action=/(?:告白|表白|追求|交往|約會|邀約|主動(?:聯絡|找|靠近|示好|追求|約)|說出口|坦白心意|確認關係)/.test(sentence);
      if(!action||negated(sentence))return;
      var hard=/(?:百分之百|100%|一定|必然|肯定|確定(?:會|不會)|注定|遲早(?:會|要))/.test(sentence);
      var direct=/(?:她|他|對方|這位(?:女生|女性|男生|男性)|那位(?:女生|女性|男生|男性)).{0,18}(?:會|不會).{0,18}(?:告白|表白|追求|交往|約會|邀約|主動|說出口|坦白心意|確認關係)/.test(sentence);
      if((hard||direct)&&!hasQualifier(sentence))add('FUTURE_ACTION_AS_CERTAINTY','答案把尚未發生的後續行動寫成確定事件；本題只能判條件性行動傾向。',sentence.trim());
    });
  }
  return {ok:issues.length===0,issues:issues,capability:x.capability};
}

window.JYLenormand={version:'21.0.0',analyze:_lnAnalyzeQuestion,capability:function(q){return _lnAnalyzeQuestion(q).capability;},reviewAnswer:_lnReviewAnswerGranularity,recommend:_lnDetectSpread,instantiate:_lnBuildSpreadDef,grandNineGeometry:_lnGrandNineGeometry,houseRelations:_lnHouseRelations,spreads:SPREADS};
})();
