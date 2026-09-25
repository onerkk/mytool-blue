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
// BEGIN GENERATED READING JY_READING_ZIWEI_FALLBACK
var JY_READING_ZIWEI_FALLBACK = "【白話優先】【像命理師當面解惑】使用繁體中文直接對提問者說話，先回答，再解釋：先答原問題。開頭2～3句給有依據的方向、真正卡點或優先行動；正文只呈現結論及必要依據，讓理由服務解答。\n單一複雜題通常用4～6段自然段落；簡單題簡答，多子題逐題先答。挑2～4組最有解釋力的已提供盤面資料，每段先說對提問者意味什麼，再以具體符號／結構說明如何落到原問題。段落按使用者要解決的事組織，方法資料留作判讀。\n【主判前核對】讀完整有效資料後才成判。交代最重要的牽制或相反訊號，說清它改變哪部分；同一訊號若對不同人物或方向作用相反，要分開說清。本命、當期觸發與條件走向分層，同源訊號不重複加權。依據相持就保留未定部分，完成其餘可判內容。替代讀法只有會實質改變答案時才簡短提出。\n把可核對的排盤／抽取事實、傳統方法的解釋、對個案的推論分清楚。具體情境未由使用者提供時，以「若實際出現…」提出核對，不能寫成已發生。象徵不證明病情、他人心念或事件；限制集中一次。醫療、法律、財務行動另依現實資料與專業依據，不冒稱由盤面證明。\n答案要落到現實：方法題說先做什麼及怎麼開口，結構題說最關鍵的一個循環，決策題比較相同標準，時間題只用已提供資料的精度。以1～3項可執行做法或觀察指標收束，指出什麼具體條件會支持、削弱或改變判斷。親密互動取得每位參與者明確、無壓力且可撤回的同意。\n成稿再讀一次：第一段是否已解答？主要結論是否有本次依據與反證？每段是否增加新答案？刪去重複講同一組訊號的段落；把「多溝通、給空間、步調不同」落實成誰、何事、如何做。先完成解答，最後才用短段落承接單一選品。\n【方法參考：供判讀，不是正文清單】只啟用本次有資料的方法；輸出依上述規則，方法說明不另設回答格式。\n【紫微：主宮星組與牽動】核命身、宮支、五行局、農曆與運限政策；按本題選主宮及實際三方四正。本命、大限、流年同名宮未必同一格。\n本宮主星組合連同廟旺、輔煞、三合資源及對宮牽制成判；空宮借對宮是參照，不改原盤。逐顆吉凶計票不能取代組合作用。\n四化保留星性與來源、落宮：生年、宮干、大限、流年各自定位，自化及來因宮依本次流派；祿忌或權忌同會不直接抵銷。\n疊宮保留本命與運限宮名，限年需有實算資料。正文只引用改變答案的宮組、四化或運限；全盤題才展開十二宮，不強制報每層飛化過程。\n逐筆核四化引用的來源方、層級、宮干、星曜、化象、受方和落宮。相同天干在生年與宮干重現不是兩份獨立證據；不同來源的化祿、化忌必須同時保留。命宮格局不能替代關係題的夫妻、福德與運限結構；化祿不證明本人目前有錢或對特定人願意付出。\n【紫微判讀主線】主宮回答事情怎麼運作，三合宮查可調用的資源，對宮查角色與環境的牽動；先讀主星搭配的共同作用，再看輔煞與廟旺如何改變做法的成本。關係題把夫妻的互動方式、福德的內在滿足、田宅的生活安排與官祿的責任牽動串起來，選其中最卡住的一環回答。\n四化依星性說清增加的是什麼、主導的是什麼、可疏解的是什麼、代價集中在哪裡；順著來源宮到落宮說明兩個領域怎麼牽連。大限改變焦點與可用資源，流年再指出本年何處被觸發。遇到祿忌同會時，回答取得某種好處需要付出什麼代價，以及現有輔助通道能處理多少。";
// END GENERATED READING JY_READING_ZIWEI_FALLBACK
/*! ziwei-standalone.js — 靜月之光 紫微斗數獨立流程  [v3.0.0]
 *  v3.0.0(2026/9/4)：提示詞改為知識開放核心；保留動態三方四正、四化、飛星欽天與運限資料，移除 ROOT-SPEC、帳本、稽核及大量限制式指令。
 *  v80.62(2026/7/17)：紫微 ROOT-SPEC v2 全域真值根治——特定外部主體不可與一般窗口綁定、必要條件瓶頸、使用者自述不計命中、三方四正由地支動態序列化、弱年份留白與跨年不串同一事件、運限切換政策透明化。
 *  v80.61(2026/7/17)：真正根治手機選單機率性缺列——移除透明 fixed 疊層雙 RAF 顯示競態與巢狀捲動，改同步可見、visualViewport 實高、整張 sheet 捲動；日期改為明確六列七欄，並在字型／視窗穩定後校驗 6 列 42 格及強制重繪。
 *  v80.60(2026/7/17)：紫微提示詞 ROOT-SPEC 共用根治——三合主判與飛星／欽天輔助分層、問題保真、空宮／格局／四化／運限證據裁決、題型量測邊界、反證與可驗證行動、依問題自然導流的單一礦物品牌層。另修正資料標頭不再誤稱已作真太陽時校正，並將引擎格局／星系固定文案降為候選。
 *  v80.59(2026/7/17)：根治 Android／Samsung 底部選單偶發缺欄、缺列與空白重繪：補獨立 box-sizing、動態視窗高度、安全區、橫向防溢出、固定六週日曆；手機停用 transform＋backdrop-filter 疊層，改穩定淡入並以雙 requestAnimationFrame 開啟。
 *  v80.58(2026/6/12)：①題型判斷把「天命/人生方向/人生意義」明列綜合題（實測此類問題被當單一主題從簡：
 *    漏身宮、漏格局名、無吉凶影響度標記、只用單一流年）②深度要求1補「人生主軸題必讀身宮」（實測身宮坐
 *    福德與生年貪狼忌同宮——全盤最強天命訊號——輸出隻字未提）③修 v80.56 接縫贅語「語氣平實不推銷，語氣平實」
 *  v80.56(2026/6/12)：①空宮借星資料層直給（實測 AI 把財帛酉空宮借成夫妻武破；正統借星安宮只借對宮，
 *    酉應借卯福德紫貪——借宮運算不再留給模型）②鐵律⑦應期精確到「年」為止，禁編月份窗口（實測輸出
 *    「2026年5–8月」等月份，但資料區無流月資料＝硬編；待引擎實作斗君流月再開放）③蝦皮連結改「犧牲行」
 *    結構（網址倒數第二行＋固定收尾句墊後；實測紫微輸出 URL 尾又黏不可見字元，與梅花 v80.38 同款根治）
 *  v80.53(2026/6/10)：①廟旺改印全稱——原 slice(-1) 把「得地」截成「地」（AI 實測誤讀成弱、竄寫成落陷）、「不得地」截成「得」＝負級印成正級（UI 端同修）②化忌行標註「（沖對宮）」資料直給（AI 實測只讀坐宮漏讀沖宮）③鐵律②嚴禁盤外資訊（八字路徑已驗有效，紫微未設防實測全面復發：工廠/班別/商品全進來了）④⑤等級嚴禁改寫⑥四化層級不可錯置（實測把大限祿寫成化權）⑦選石嚴禁並列（實測又寫「天鐵或黑瑪瑙」）⑧清單補石項
 *  v80.52(2026/6/10)：完整性清單加「正文無指令字眼」（八字路徑實測模型把「語氣平實」唸給客人聽，同款收尾指令一律補防線）
 *  目的（歐那 2026/6/6）：
 *    1) 紫微斗數獨立入口不再借用七維表單與七維流程；只需出生年月日 + 時辰(可選) + 性別，「不需姓名」。
 *    2) 全新紫微專屬過場動畫（十二宮命盤天成），符合網頁金色/暗底風格，純 CSS/SVG，不需圖檔。
 *    3) 最後輸出「比文墨天機更深」的紫微斗數 AI 解讀提示詞：三方四正整合、四化飛星串連、格局判定、體用應期。
 *  資料來源：沿用既有 computeZiwei()（三合四化骨架）；本入口以時辰代表時排盤，未作出生地經度真太陽時校正。
 *  只需部署本檔 + ui.js + index.html（version bump）。
 */
(function () {
  'use strict';

  var DZ = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
  var GOLD = '#c9a84c';

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

  var _lastPrompt = '';
  var _zwGender = '';   // 自包覆輸入頁的性別選擇
  // v80.30 自訂選擇器狀態（寫回隱藏 zw-bd / zw-hh，_ziweiSubmit 沿用）
  var _zwSelDate = '';
  var _zwSelHH = '';
  var _zwExactTime = '';
  var _zwLastChart = null;
  var _zwLastForm = null;

  function zwReferenceYear(zw){
    var policy=zw.calculationPolicy||{};
    if(Number.isInteger(policy.referenceLunarYear))return policy.referenceLunarYear;
    var instant=policy.referenceDate?new Date(policy.referenceDate):new Date();
    var clock=new Date(instant.getTime()+8*3600000);
    if(typeof approxLunar==='function')return approxLunar(clock.getUTCFullYear(),clock.getUTCMonth()+1,clock.getUTCDate()).year;
    return clock.getUTCFullYear(); // Legacy supplied charts without a calendar engine.
  }
  function zwNominalAge(zw){
    if(Number.isInteger(zw.currentAge))return zw.currentAge;
    var lunar=zw.lunar||zw.birthLunar;
    return lunar&&Number.isInteger(lunar.year)?zwReferenceYear(zw)-lunar.year+1:null;
  }

  // ════════════════════════════════════════════════════════
  //  CSS（命名空間 zw-*，自帶不依賴 style.css）
  // ════════════════════════════════════════════════════════
  function zwEnsureCSS() {
    if (document.getElementById('zw-standalone-css')) return;
    var st = document.createElement('style');
    st.id = 'zw-standalone-css';
    st.textContent = [
      // ── 過場動畫 ──
      '.zw-load{position:fixed;inset:0;z-index:3000;display:flex;flex-direction:column;align-items:center;justify-content:center;',
        'background:radial-gradient(120% 90% at 50% 28%,rgba(46,30,12,.55),rgba(13,8,5,.97) 62%,#0a0604 100%);overflow:hidden}',
      '.zw-load-stars{position:absolute;inset:0;pointer-events:none;overflow:hidden}',
      '.zw-load-stars i{position:absolute;bottom:-6%;width:2px;height:2px;border-radius:50%;background:rgba(212,175,55,.7);box-shadow:0 0 6px rgba(212,175,55,.6);',
        'animation:zwRise var(--d,5s) linear var(--dl,0s) infinite;opacity:0}',
      '@keyframes zwRise{0%{transform:translateY(0) scale(.6);opacity:0}12%{opacity:.9}88%{opacity:.7}100%{transform:translateY(-108vh) scale(1);opacity:0}}',
      // 命盤方陣
      '.zw-board{position:relative;width:min(340px,84vw);aspect-ratio:1;display:grid;grid-template-columns:repeat(4,1fr);grid-template-rows:repeat(4,1fr);gap:6px;',
        'padding:10px;border-radius:16px;border:1px solid rgba(212,175,55,.32);background:linear-gradient(150deg,rgba(212,175,55,.05),rgba(212,175,55,.012));',
        'box-shadow:0 0 50px rgba(212,175,55,.10),inset 0 0 26px rgba(0,0,0,.4);opacity:0;transform:scale(.92);animation:zwBoardIn .7s cubic-bezier(.16,1,.3,1) forwards}',
      '@keyframes zwBoardIn{to{opacity:1;transform:scale(1)}}',
      '.zw-cell{position:relative;border:1px solid rgba(212,175,55,.14);border-radius:8px;background:rgba(212,175,55,.018);display:flex;align-items:center;justify-content:center;',
        'font-family:"Noto Serif TC",serif;font-size:.62rem;color:rgba(212,175,55,.45);letter-spacing:.04em;opacity:0;transform:scale(.7);',
        'animation:zwCellIn .5s cubic-bezier(.16,1,.3,1) forwards;animation-delay:var(--cd,0s)}',
      '@keyframes zwCellIn{0%{opacity:0;transform:scale(.7)}60%{opacity:1}100%{opacity:1;transform:scale(1)}}',
      '.zw-cell.zw-ming{color:rgba(255,236,184,.95);border-color:rgba(212,175,55,.6);background:rgba(212,175,55,.10);box-shadow:0 0 16px rgba(212,175,55,.35)}',
      '.zw-cell.zw-ming::after{content:"";position:absolute;inset:-1px;border-radius:8px;border:1px solid rgba(255,236,184,.5);animation:zwMingPulse 1.8s ease-in-out infinite}',
      '@keyframes zwMingPulse{0%,100%{opacity:.25}50%{opacity:.9}}',
      '.zw-center{grid-column:2/4;grid-row:2/4;border-radius:10px;border:1px solid rgba(212,175,55,.22);background:radial-gradient(circle at 50% 45%,rgba(212,175,55,.10),rgba(212,175,55,.02));',
        'display:flex;align-items:center;justify-content:center;position:relative;overflow:visible}',
      '.zw-svg{position:absolute;inset:10px;width:calc(100% - 20px);height:calc(100% - 20px);pointer-events:none;overflow:visible}',
      '.zw-svg line{stroke:rgba(212,175,55,.55);stroke-width:1;stroke-dasharray:240;stroke-dashoffset:240;animation:zwDraw 1s ease forwards}',
      '@keyframes zwDraw{to{stroke-dashoffset:0}}',
      '.zw-ziwei{position:absolute;left:50%;top:-58%;transform:translate(-50%,0);font-size:2rem;color:#ffeab8;text-shadow:0 0 18px rgba(212,175,55,.9);opacity:0;',
        'animation:zwDrop 1.1s cubic-bezier(.5,0,.2,1) forwards}',
      '@keyframes zwDrop{0%{top:-58%;opacity:0;transform:translate(-50%,0) scale(.5)}60%{opacity:1}100%{top:50%;transform:translate(-50%,-50%) scale(1);opacity:1}}',
      '.zw-burst{position:absolute;left:50%;top:50%;width:10px;height:10px;border-radius:50%;transform:translate(-50%,-50%);background:radial-gradient(circle,rgba(255,236,184,.95),rgba(212,175,55,0));opacity:0}',
      '.zw-burst.go{animation:zwBurst .6s ease-out forwards}',
      '@keyframes zwBurst{0%{opacity:.95;width:10px;height:10px}100%{opacity:0;width:340px;height:340px}}',
      '.zw-load-status{margin-top:1.5rem;font-family:"Noto Serif TC",serif;font-size:1.05rem;font-weight:700;color:'+GOLD+';letter-spacing:.12em;text-shadow:0 2px 14px rgba(0,0,0,.6);transition:opacity .3s;min-height:1.4rem}',
      '.zw-load-sub{margin-top:.4rem;font-size:.74rem;color:rgba(212,175,55,.55);letter-spacing:.08em;transition:opacity .3s;min-height:1.1rem}',
      // ── 結果頁 ──
      '.zw-res{position:fixed;inset:0;z-index:2900;overflow-y:auto;-webkit-overflow-scrolling:touch;background:radial-gradient(120% 80% at 50% 0%,rgba(40,26,10,.5),#0c0805 60%,#090604 100%);padding:calc(14px + env(safe-area-inset-top,0)) 14px calc(34px + env(safe-area-inset-bottom,0))}',
      '.zw-res-inner{max-width:560px;margin:0 auto}',
      '.zw-res-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:.4rem}',
      '.zw-res-title{font-family:"Noto Serif TC",serif;font-size:1.18rem;font-weight:800;color:'+GOLD+';letter-spacing:.04em;display:flex;align-items:center;gap:8px}',
      '.zw-res-x{background:none;border:none;color:rgba(212,175,55,.6);font-size:1.7rem;line-height:1;cursor:pointer;padding:0 6px}',
      '.zw-meta{font-size:.72rem;color:rgba(200,190,170,.6);line-height:1.6;margin-bottom:.9rem}',
      // 命盤 grid（地支固定盤）
      '.zw-chart{display:grid;grid-template-columns:repeat(4,1fr);grid-template-rows:repeat(4,1fr);gap:5px;aspect-ratio:1;margin-bottom:1rem}',
      '.zw-pg{position:relative;border:1px solid rgba(212,175,55,.16);border-radius:9px;background:rgba(212,175,55,.022);padding:5px 5px 4px;display:flex;flex-direction:column;overflow:hidden;min-height:0}',
      '.zw-pg.ming{border-color:rgba(255,236,184,.55);background:rgba(212,175,55,.085);box-shadow:0 0 14px rgba(212,175,55,.18)}',
      '.zw-pg-stars{flex:1;display:flex;flex-wrap:wrap;gap:2px 4px;align-content:flex-start;font-family:"Noto Serif TC",serif;font-size:.62rem;line-height:1.2;color:rgba(255,236,184,.92)}',
      '.zw-pg-stars .sha{color:rgba(239,138,138,.85)}',
      '.zw-pg-stars .aux{color:rgba(160,200,255,.8)}',
      '.zw-pg-stars .hua{color:#0c0805;background:'+GOLD+';border-radius:3px;padding:0 2px;font-size:.52rem;font-weight:800;margin-left:1px;vertical-align:top}',
      '.zw-pg-stars .hua.ji{background:#ef8a8a;color:#2a0c0c}',
      '.zw-pg-foot{display:flex;justify-content:space-between;align-items:flex-end;margin-top:2px}',
      '.zw-pg-name{font-family:"Noto Serif TC",serif;font-size:.6rem;font-weight:700;color:rgba(212,175,55,.8)}',
      '.zw-pg-name .badge{font-size:.5rem;color:#0c0805;background:rgba(255,236,184,.9);border-radius:3px;padding:0 2px;margin-left:2px}',
      '.zw-pg-dz{font-size:.55rem;color:rgba(200,190,170,.45)}',
      '.zw-pg-center{grid-column:2/4;grid-row:2/4;border:1px solid rgba(212,175,55,.22);border-radius:11px;background:radial-gradient(circle at 50% 40%,rgba(212,175,55,.07),rgba(212,175,55,.012));',
        'display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:8px;gap:3px}',
      '.zw-pg-center b{font-family:"Noto Serif TC",serif;color:'+GOLD+';font-size:.82rem;letter-spacing:.05em}',
      '.zw-pg-center span{font-size:.62rem;color:rgba(200,190,170,.7);line-height:1.5}',
      // facts + 格局
      '.zw-facts{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-bottom:.9rem}',
      '.zw-fact{border:1px solid rgba(212,175,55,.12);border-radius:10px;background:rgba(212,175,55,.025);padding:.5rem .65rem}',
      '.zw-fact .k{font-size:.62rem;color:rgba(212,175,55,.6);margin-bottom:.15rem}',
      '.zw-fact .v{font-size:.8rem;color:rgba(255,236,184,.92);line-height:1.45;font-family:"Noto Serif TC",serif}',
      '.zw-chips{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:1.1rem}',
      '.zw-chip{font-size:.66rem;color:'+GOLD+';background:rgba(212,175,55,.1);border:1px solid rgba(212,175,55,.24);border-radius:999px;padding:3px 10px;font-family:"Noto Serif TC",serif}',
      '.zw-chip.warn{color:#ef9a9a;background:rgba(239,138,138,.08);border-color:rgba(239,138,138,.3)}',
      // AI 卡
      '.zw-ai{border:1px solid rgba(212,175,55,.2);border-radius:16px;background:linear-gradient(160deg,rgba(212,175,55,.06),rgba(212,175,55,.012));padding:1.1rem 1rem;text-align:center}',
      '.zw-ai-title{font-family:"Noto Serif TC",serif;font-size:1rem;font-weight:800;color:'+GOLD+';margin-bottom:.25rem}',
      '.zw-ai-desc{font-size:.72rem;color:rgba(200,190,170,.6);margin-bottom:.8rem;line-height:1.55}',
      '.zw-ai-copy{width:100%;padding:.85rem;border-radius:12px;border:1.5px solid rgba(212,175,55,.45);background:linear-gradient(135deg,rgba(212,175,55,.16),rgba(212,175,55,.05));',
        'color:#ffeab8;font-family:"Noto Serif TC",serif;font-size:.95rem;font-weight:700;letter-spacing:.06em;cursor:pointer;transition:all .25s}',
      '.zw-ai-copy:active{transform:scale(.98)}',
      '.zw-ai-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-top:.85rem}',
      '.zw-ai-sc{display:flex;flex-direction:column;align-items:center;gap:3px;padding:.5rem .2rem;border-radius:11px;border:1px solid rgba(255,255,255,.06);background:rgba(255,255,255,.02);cursor:pointer;transition:all .2s}',
      '.zw-ai-sc:active{transform:scale(.95)}',
      '.zw-ai-sc img{width:26px;height:26px;border-radius:7px}',
      '.zw-ai-sc span{font-size:.58rem;color:rgba(200,190,170,.75)}',
      '.zw-ai-foot{font-size:.64rem;color:rgba(200,190,170,.4);margin-top:.7rem;line-height:1.5}',
      '.zw-actions{display:flex;gap:10px;margin-top:1.1rem}',
      '.zw-btn{flex:1;padding:.75rem;border-radius:11px;border:1px solid rgba(212,175,55,.2);background:transparent;color:rgba(212,175,55,.75);font-size:.82rem;font-weight:600;cursor:pointer;font-family:inherit}',
      '.zw-res-foot{text-align:center;font-size:.66rem;color:rgba(160,152,128,.4);margin-top:1.3rem;line-height:1.6}',
      // ── 自包覆輸入頁（比照雷諾曼，自成一頁，不借用 step-0）──
      '.zw-in{position:fixed;inset:0;z-index:99999;overflow-y:auto;-webkit-overflow-scrolling:touch;background:#0a0a0f;font-family:"Noto Serif TC",Georgia,serif;color:#e8e0d0}',
      '.zw-in-wrap{max-width:480px;margin:0 auto;padding:1rem .8rem 3rem}',
      '.zw-in-back{color:rgba(232,224,208,.5);text-decoration:none;font-size:.82rem;display:inline-block;margin-bottom:.5rem;cursor:pointer}',
      '.zw-in-head{text-align:center;padding:1.5rem 0 1rem}',
      '.zw-in-head h1{font-size:1.5rem;color:'+GOLD+';letter-spacing:8px;margin-bottom:.3rem}',
      '.zw-in-head p{font-size:.75rem;color:rgba(232,224,208,.5);letter-spacing:2px}',
      '.zw-in-sec{background:#13131a;border:1px solid rgba(201,168,76,.15);border-radius:14px;padding:1.1rem;margin-bottom:.8rem}',
      '.zw-in-title{font-size:.82rem;color:'+GOLD+';margin-bottom:.7rem}',
      '.zw-in-q{width:100%;padding:.65rem;border-radius:10px;border:1px solid rgba(201,168,76,.3);background:rgba(255,255,255,.03);color:#e8e0d0;font-family:inherit;font-size:.85rem;resize:none;outline:none;line-height:1.6}',
      '.zw-in-q::placeholder{color:rgba(232,224,208,.4)}',
      '.zw-in-q:focus{border-color:rgba(201,168,76,.5)}',
      '.zw-in-field{margin-bottom:.7rem}',
      '.zw-in-select{width:100%;min-height:48px;padding:.7rem;border:1px solid rgba(212,175,55,.35);border-radius:10px;background:#122033;color:#f4e8cf;font:inherit}.zw-in-select:focus-visible{outline:2px solid #dfc58e;outline-offset:3px}',
      '.zw-in-label{font-size:.72rem;color:rgba(232,224,208,.55);margin-bottom:.3rem;display:block}',
      '.zw-in input[type=date],.zw-in select{width:100%;padding:.6rem;border-radius:10px;border:1px solid rgba(201,168,76,.3);background:rgba(255,255,255,.03);color:#e8e0d0;font-family:inherit;font-size:.9rem;outline:none}',
      '.zw-in input[type=date]:focus,.zw-in select:focus{border-color:rgba(201,168,76,.5)}',
      '.zw-in-pills{display:flex;gap:.5rem}',
      '.zw-in-pill{flex:1;padding:.6rem;border-radius:10px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.03);color:rgba(232,224,208,.55);text-align:center;cursor:pointer;font-family:inherit;font-size:.88rem;transition:all .2s}',
      '.zw-in-pill.active{border-color:rgba(201,168,76,.5);background:rgba(201,168,76,.08);color:'+GOLD+'}',
      '.zw-in-hint{font-size:.68rem;color:rgba(232,224,208,.4);margin-top:.5rem;line-height:1.6}',
      '.zw-in-go{display:block;width:100%;padding:.85rem;border-radius:12px;border:1.5px solid rgba(201,168,76,.5);background:linear-gradient(135deg,rgba(201,168,76,.12),rgba(201,168,76,.04));color:'+GOLD+';font-family:inherit;font-size:.95rem;font-weight:600;letter-spacing:4px;cursor:pointer;transition:all .3s;margin-top:.4rem}',
      '.zw-in-go:active{transform:scale(.97)}',
      // ── v80.30 自訂欄位 / 底部選擇器（zwx-）──
      '.zwx-field{width:100%;display:flex;align-items:center;justify-content:space-between;gap:.5rem;padding:.72rem .8rem;border-radius:10px;border:1px solid rgba(201,168,76,.3);background:rgba(255,255,255,.03);color:#e8e0d0;font-family:inherit;font-size:.92rem;cursor:pointer;transition:all .2s;text-align:left}',
      '.zwx-field:active{transform:scale(.985)}',
      '.zwx-field .ph{color:rgba(232,224,208,.4)}',
      '.zwx-field .val{color:#ffeab8}',
      '.zwx-field .chev{color:rgba(201,168,76,.7);font-size:.78rem;flex-shrink:0}',
      '.zwx-err{margin:.5rem 0 0;padding:.55rem .7rem;border-radius:10px;border:1px solid rgba(214,108,92,.55);background:rgba(214,108,92,.12);color:#f0c8be;font-size:.74rem;line-height:1.5;display:none}',
      '.zwx-err.show{display:block}',
      '.zwx-sheet-bd,.zwx-sheet-bd *{box-sizing:border-box}',
      '.zwx-sheet-bd{position:fixed;inset:0;width:100%;height:var(--jy-picker-vh,100vh);z-index:100002;background:rgba(0,0,0,.62);display:flex;align-items:flex-end;justify-content:center;overflow:hidden;overscroll-behavior:none;opacity:1;transition:none;padding-top:env(safe-area-inset-top);contain:none;content-visibility:visible}',
      '.zwx-sheet-bd.show{opacity:1}',
      '.zwx-sheet{width:100%;max-width:480px;max-height:calc(var(--jy-picker-vh,100vh) - env(safe-area-inset-top));display:block;overflow-x:hidden;overflow-y:auto;overscroll-behavior:contain;background:linear-gradient(180deg,#16161e,#0d0d13);border-radius:20px 20px 0 0;border:1px solid rgba(201,168,76,.25);border-bottom:none;box-shadow:0 -10px 50px rgba(0,0,0,.6),0 0 60px rgba(201,168,76,.05);padding:.9rem max(1rem,env(safe-area-inset-right)) calc(1.4rem + env(safe-area-inset-bottom)) max(1rem,env(safe-area-inset-left));opacity:1;transform:none;transition:none;font-family:"Noto Serif TC",serif;-webkit-overflow-scrolling:touch;contain:none;content-visibility:visible}',
      '.zwx-sheet-bd.show .zwx-sheet{opacity:1}',
      '#zwx-sbody{width:100%;min-width:0;min-height:0;overflow:visible;overscroll-behavior:auto;touch-action:auto;contain:none;content-visibility:visible}.zwx-cal-nav,.zwx-cal-table,.zwx-cal-head,.zwx-cal-row{width:100%;min-width:0}',
      '.zwx-grip{width:40px;height:4px;border-radius:2px;background:rgba(201,168,76,.4);margin:0 auto .7rem}',
      '.zwx-stitle{text-align:center;color:'+GOLD+';font-size:1.02rem;letter-spacing:3px;margin-bottom:.2rem}',
      '.zwx-ssub{text-align:center;color:rgba(232,224,208,.5);font-size:.7rem;margin-bottom:.9rem;min-height:1rem;line-height:1.5}',
      '.zwx-sfoot{flex:0 0 auto;display:grid;grid-template-columns:1fr 1.2fr;gap:.5rem;margin-top:.45rem;padding:.7rem 0 .1rem;background:linear-gradient(180deg,rgba(13,13,19,0),#0d0d13 30%)}',
      '.zwx-sbtn{padding:.72rem;border-radius:11px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.03);color:rgba(232,224,208,.6);font-family:inherit;font-size:.86rem;cursor:pointer;letter-spacing:2px}',
      '.zwx-sbtn.go{border-color:rgba(201,168,76,.55);background:linear-gradient(135deg,rgba(201,168,76,.18),rgba(201,168,76,.05));color:'+GOLD+';font-weight:600}',
      '.zwx-sbtn:active{transform:scale(.97)}',
      '.zwx-cal-nav{display:flex;align-items:center;justify-content:space-between;gap:.4rem;margin-bottom:.6rem}',
      '.zwx-cal-nav button{width:42px;height:42px;flex-shrink:0;border-radius:11px;border:1px solid rgba(201,168,76,.22);background:rgba(255,255,255,.03);color:'+GOLD+';font-size:1.2rem;cursor:pointer}',
      '.zwx-cal-nav button:active{transform:scale(.92)}',
      '.zwx-cal-ttl{flex:1;text-align:center;color:#ffeab8;font-size:.96rem;letter-spacing:1px;cursor:pointer;padding:.5rem;border-radius:9px}',
      '.zwx-cal-ttl:active{background:rgba(201,168,76,.08)}',
      '.zwx-cal-table{display:block;contain:none;content-visibility:visible}',
      '.zwx-cal-head,.zwx-cal-row{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));column-gap:.22rem;contain:none;content-visibility:visible}',
      '.zwx-cal-row{min-height:44px;align-items:center}',
      '.zwx-cal-wk{text-align:center;color:rgba(201,168,76,.55);font-size:.66rem;padding:.2rem 0}',
      '.zwx-cal-d{appearance:none;-webkit-appearance:none;border:0;background:transparent;padding:0;margin:0;min-width:0;width:100%;height:42px;display:flex;align-items:center;justify-content:center;border-radius:9px;color:rgba(232,224,208,.82);font-family:inherit;font-size:.88rem;line-height:1;cursor:pointer;contain:none;content-visibility:visible}',
      '.zwx-cal-d:active{background:rgba(201,168,76,.12)}',
      '.zwx-cal-d.sel{background:linear-gradient(135deg,#c9a84c,#a8863a);color:#1a140a;font-weight:700;box-shadow:0 0 14px rgba(201,168,76,.4)}',
      '.zwx-cal-d.empty{cursor:default}',
      '.zwx-pg{display:grid;gap:.4rem}',
      '.zwx-pg.y{grid-template-columns:repeat(4,1fr)}',
      '.zwx-pg.mo{grid-template-columns:repeat(3,1fr)}',
      '.zwx-cell{padding:.66rem .2rem;text-align:center;border-radius:10px;border:1px solid rgba(201,168,76,.18);background:rgba(255,255,255,.03);color:rgba(232,224,208,.82);font-size:.84rem;cursor:pointer}',
      '.zwx-cell.sel{background:linear-gradient(135deg,#c9a84c,#a8863a);color:#1a140a;font-weight:700}',
      '.zwx-cell:active{transform:scale(.95)}',
      '.zwx-yhead{display:flex;align-items:center;justify-content:space-between;margin-bottom:.6rem}',
      '.zwx-yhead button{width:40px;height:40px;border-radius:10px;border:1px solid rgba(201,168,76,.22);background:rgba(255,255,255,.03);color:'+GOLD+';font-size:1.1rem;cursor:pointer}',
      '.zwx-yhead span{color:#ffeab8;font-size:.9rem;letter-spacing:1px}',
      '.zwx-sc-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:.4rem}',
      '.zwx-sc{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.15rem;padding:.6rem .2rem;border-radius:11px;border:1px solid rgba(201,168,76,.18);background:rgba(255,255,255,.03);cursor:pointer}',
      '.zwx-sc b{color:#ffeab8;font-size:.92rem;font-weight:600}',
      '.zwx-sc i{color:rgba(232,224,208,.5);font-size:.64rem;font-style:normal;letter-spacing:.5px}',
      '.zwx-sc.sel{background:linear-gradient(135deg,#c9a84c,#a8863a);box-shadow:0 0 12px rgba(201,168,76,.35)}',
      '.zwx-sc.sel b{color:#1a140a}',
      '.zwx-sc.sel i{color:rgba(26,20,10,.7)}',
      '.zwx-sc:active{transform:scale(.94)}',
      '.zwx-sc.wide{grid-column:1/-1;flex-direction:row;gap:.5rem}',
      '.zw-in-foot{text-align:center;font-size:.6rem;color:rgba(232,224,208,.4);margin-top:1.5rem;letter-spacing:1px;line-height:1.8}',
      '@media(max-width:700px),(pointer:coarse){.zwx-sheet{backdrop-filter:none!important;-webkit-backdrop-filter:none!important;transform:none!important;transition:none!important}.zwx-sheet-bd{transition:none!important}.zwx-cal-head,.zwx-cal-row{column-gap:.12rem}.zwx-cal-d{font-size:.84rem}}',
      '@media(max-height:620px){.zwx-sheet{border-radius:16px 16px 0 0;padding-top:.55rem}.zwx-grip{margin-bottom:.45rem}.zwx-ssub{margin-bottom:.55rem}.zwx-cal-nav{margin-bottom:.3rem}.zwx-cal-nav button{height:38px}.zwx-cal-row{min-height:36px}.zwx-cal-d{height:34px}.zwx-sfoot{margin-top:.55rem}}',
      '@media(prefers-reduced-motion:reduce){.zwx-sheet-bd,.zwx-sheet{transition:none!important}}'
    ].join('');
    (document.head || document.documentElement).appendChild(st);
  // ═══ 鎏金夜祭 v2（2026/6/18）：主 CTA 採靜態鎏金底＋transform-only 獨立流光層，避免 Android/Samsung 對 background-position 動畫漏畫按鈕 ═══
  try{var _g2=document.createElement('style');_g2.setAttribute('data-jy-gilt2','ziwei');_g2.textContent='.zw-in-sec{background:linear-gradient(180deg,rgba(24,20,14,.78),rgba(14,12,9,.86));border:1px solid rgba(201,168,76,.2);border-radius:18px;box-shadow:0 18px 40px rgba(0,0,0,.45),inset 0 1px 0 rgba(245,231,184,.14);backdrop-filter:none;-webkit-backdrop-filter:none}.zw-in-title{position:relative;padding-left:12px;letter-spacing:.08em;color:#e8d28a}.zw-in-title::before{content:"";position:absolute;left:0;top:50%;transform:translateY(-50%);width:3px;height:1.05em;border-radius:2px;background:rgba(156,130,222,.9);box-shadow:0 0 8px rgba(156,130,222,.9)}.zw-in-q,.zwx-field,.zw-in-sec input,.zw-in-sec select,.zw-in-sec textarea{background:rgba(8,7,5,.62);border:1px solid rgba(201,168,76,.26);border-radius:12px;color:#f2e9d6;transition:border-color .2s,box-shadow .2s}.zw-in-q:focus,.zwx-field:focus,.zw-in-sec input:focus,.zw-in-sec select:focus,.zw-in-sec textarea:focus{border-color:#e8d28a;box-shadow:0 0 0 3px rgba(201,168,76,.16);outline:none}.zw-in-pill,.zwx-sbtn,.zwx-cell{background:rgba(201,168,76,.06);border:1px solid rgba(201,168,76,.22);color:#d8c79a;border-radius:12px;transition:color .18s,background-color .18s,border-color .18s,box-shadow .18s,transform .18s}.zw-in-pill.active,.zw-in-pill.on,.zwx-sbtn.active,.zwx-cell.active,.zwx-cell.on{background:linear-gradient(135deg,#e8d28a,#c9a84c);color:#171208;border-color:transparent;box-shadow:0 6px 18px rgba(201,168,76,.28);font-weight:700}.zw-in-go{background:linear-gradient(135deg,#a98232 0%,#e8d28a 44%,#f5e7b8 58%,#c9a84c 100%);color:#171208;border:none;border-radius:14px;font-weight:800;letter-spacing:.14em;box-shadow:0 10px 26px rgba(201,168,76,.32),inset 0 1px 0 rgba(255,255,255,.35);position:relative;overflow:hidden;isolation:isolate}.zw-in-go::before{content:none;display:none}.zw-in-go:active{transform:translateY(1px)}.zw-in-back{color:rgba(232,210,138,.75)}.zw-in-back:hover{color:#f5e7b8}.zwx-sheet{background:rgba(16,13,10,.97);backdrop-filter:none;-webkit-backdrop-filter:none;border-top:1px solid rgba(201,168,76,.3);box-shadow:0 -18px 50px rgba(0,0,0,.6)}.zwx-grip{background:linear-gradient(90deg,#8a6d2f,#e8d28a,#8a6d2f);opacity:.85;border-radius:99px}.zw-ai{background:linear-gradient(180deg,rgba(24,20,14,.78),rgba(14,12,9,.86));border:1px solid rgba(201,168,76,.2);border-radius:18px;box-shadow:0 18px 40px rgba(0,0,0,.45),inset 0 1px 0 rgba(245,231,184,.14);backdrop-filter:none;-webkit-backdrop-filter:none}.zwx-cal-d{border-radius:10px}.zwx-cal-d.active{background:linear-gradient(135deg,#e8d28a,#c9a84c);color:#171208;border-color:transparent;box-shadow:0 6px 18px rgba(201,168,76,.28);font-weight:700}.zw-board{border-color:rgba(201,168,76,.28)}@supports not (backdrop-filter:blur(1px)){[data-jy-view-ziwei]{}}.zw-in-go:focus-visible{outline:2px solid #e8d28a;outline-offset:2px}';document.head.appendChild(_g2);}catch(e){}
  }

  // ════════════════════════════════════════════════════════
  //  過場動畫
  // ════════════════════════════════════════════════════════
  // 12 宮繞方陣外圈的格位（row,col 於 4×4）+ 顯示用宮名（動畫順序，非命盤定位）
  var RING = [
    {r:1,c:1},{r:1,c:2},{r:1,c:3},{r:1,c:4},
    {r:2,c:4},{r:3,c:4},
    {r:4,c:4},{r:4,c:3},{r:4,c:2},{r:4,c:1},
    {r:3,c:1},{r:2,c:1}
  ];
  var RING_NAMES = ['命','財','官','遷','福','田','子','夫','兄','疾','友','父'];

  function showLoading(done) {
    if (window.JYRitual) return window.JYRitual.play('ziwei', {
      onComplete: done,
      onCancel: function(){var input=document.getElementById('zw-input');if(input)input.style.display='block';}
    });
    if (typeof done === 'function') done();
  }

  // ════════════════════════════════════════════════════════
  //  小工具
  // ════════════════════════════════════════════════════════
  function brightOf(starName, branch) {
    try {
      if (typeof getStarBright === 'function') {
        var br = getStarBright(starName, DZ.indexOf(branch));
        if (br && br.label) return br.label;
      }
    } catch (e) {}
    return '';
  }
  function huaShort(h) { return h ? h.replace('化', '') : ''; }
  function esc(s){ return String(s == null ? '' : s).replace(/[&<>]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;'}[c]; }); }

  // 宮位星曜（依等級分類）
  function palaceStarParts(p) {
    var majors = [], aux = [], sha = [];
    (p.stars || []).forEach(function (s) {
      var tag = '';
      var br = brightOf(s.name, p.branch);
      if (br) tag = br; // 廟旺得利平陷
      var hua = s.hua ? '(' + huaShort(s.hua) + ')' : '';
      var _tg = tag === '不得' ? '不得地' : tag;  // v80.53 印全稱：slice(-1) 曾把「得地」截成「地」、「不得地」截成「得」（負級變正級）
      var label = s.name + (_tg ? '·' + _tg : '') + hua;
      if (s.type === 'major') majors.push(label);
      else if (s.type === 'sha') sha.push(s.name + hua);
      else aux.push(s.name + hua);
    });
    return { majors: majors, aux: aux, sha: sha };
  }

  // ════════════════════════════════════════════════════════
  //  命盤資料序列化（送進提示詞）
  // ════════════════════════════════════════════════════════
  function serializeChart(zw, form, options) {
    options=options||{};
    var scope=options.compact&&window.JY_READING_QUALITY&&window.JY_READING_QUALITY.timeScope?window.JY_READING_QUALITY.timeScope(form&&form.question,zwReferenceYear(zw)):null;
    var L = [];
    var birth = (form && form.bdate) ? form.bdate : '';
    var btime = (form && form.btime) ? form.btime : (form && form.btimeUnknown ? '時辰未知(暫以午時)' : '');
    var gender = (form && form.gender === 'male') ? '男' : (form && form.gender === 'female') ? '女' : '';

    if (form && form.btimeUnknown) {
      return ['【出生資料待確認】', '國曆出生日期：' + birth + '；性別：' + gender + '；出生時辰未知。',
        '本次沒有已確認的紫微命盤。午時只是程式內部暫排值，未作時辰校驗；命宮、身宮、星曜落宮、三方四正與大限落宮均可能改變，因此不把午時盤交給 AI 當成命主的定盤。',
        '先針對原問題整理目前可確認的現實條件與需要補充的資訊，說明如何查找出生紀錄；確認時辰後再作個人化紫微判讀。若需要校時，應以多個候選時辰和可核對事件比較，不能只靠一段自述認定。'].join('\n');
    }
    L.push('【基本資料】');
    var policy=zw.calculationPolicy;
    if(policy){
      var raw=zw.birthLunar||zw.lunar;
      L.push('引擎版本：'+zw.engineVersion+'；農曆出生：'+raw.year+'年'+(raw.isLeap?'閏':'')+raw.month+'月'+raw.day+'日。');
      L.push('【安星政策】農曆正月初一換年；'+(policy.dayBoundaryMode==='ZI_HOUR_23'?'23:00子初換日':'00:00午夜換日')+'；閏月'+(policy.leapMonthPolicy==='SPLIT_AT_15'?'十五日後作次月':'沿用本月')+'；實際安星月='+policy.effectiveMonth+'、日='+policy.effectiveDay+'。');
      L.push('【紫微 calculationPolicy｜本盤唯一計算政策】'+JSON.stringify(policy));
      L.push('本站預設 dayDivide=current：23:00–23:59 仍歸民用當日，00:00 換日；fixLeap=false：閏月整月沿用本月。這兩項非 iztro 預設。若本盤另選23時換日／閏月拆分，以以上實際政策為準。');
      L.push('命主按命宮地支，身主按生年地支；天傷交友、天使疾厄；解神為月解；流月採斗君、小限按生年三合起宮；旬空／截空保留雙支，依生年陰陽分正副（旬空／副旬、截空／副截），不作兩顆同等正星。不同設定須重排，不能混套別派星位。');
      L.push('本盤四化順序為祿權科忌：'+policy.sihuaTable+'。');
      L.push('參考時刻：'+policy.referenceDate+'；參考農曆年：'+policy.referenceLunarYear+'；目前虛歲：'+zw.currentAge+'，每年正月初一增歲。');
    }

    var input=zw.birthInput||{};
    L.push('民用出生日期：'+birth+'；民用出生時間：'+(input.civilTime||(form&&form.timePrecision==='shichen'?'未提供分鐘':btime)||'未提供分鐘')+'；性別：'+gender+'。');
    L.push('排盤時辰：'+(input.hourBranch||'依輸入時辰')+'；安星代表時：'+(input.representativeTime||btime)+'（不是原始出生時刻）；真太陽時：本模組不採用。');
    L.push('年干支：' + ((zw.yGan||'') + (zw.yZhi||'')) + '　五行局：' + ({2:'水二局',3:'木三局',4:'金四局',5:'土五局',6:'火六局'}[zw.wuxingJu]||zw.wuxingJu||'') + '　命主：' + (zw.mingZhu||'') + '　身主：' + (zw.shenZhu||'') + '　命宮天干：' + (zw.mingGan||''));

    // 命宮/身宮定位
    var palaces = zw.palaces || [];
    var ming = palaces.find(function(p){return p.isMing||/^命宮?$/.test(p.name||'');});
    var shen = palaces.find(function(p){ return p.isShen; });
    if (ming) {
      var mp = palaceStarParts(ming);
      L.push('');
      L.push('【命宮】' + (ming.branch||'') + '宮　' + (mp.majors.length ? '主星：' + mp.majors.join('、') : '空宮(無主星，借對宮遷移星力)') +
        (mp.aux.length ? '　輔雜曜：' + mp.aux.join('、') : '') + (mp.sha.length ? '　煞：' + mp.sha.join('、') : ''));
    }
    if (shen) {
      L.push('【身宮】坐於「' + shen.name + '」(' + shen.branch + ')—一生後天用力與晚運落點在此。');
    }
    if (zw.laiYin) {
      L.push('【來因宮（欽天派視角）】落「' + zw.laiYin.name + '」' + (zw.laiYin.name.slice(-1)==='宮'?'':'宮') + '(' + zw.laiYin.branch + '，宮干' + zw.laiYin.gan + ')—可用來觀察該流派所稱的生年四化發射源與課題；僅限欽天體系內解釋，不作三合派共同定義。');
    }

    // v80.62：三方四正由實際地支動態計算並資料層直給，禁止題型模板硬寫固定宮位。
    // 標準地支序列每隔4位為三合、相隔6位為對宮；再回查本盤實際宮名。
    try {
      var _byBranch = {};
      palaces.forEach(function(p){ if (p && p.branch) _byBranch[p.branch] = p; });
      function _fullPalName(p){
        var n = p && p.name ? String(p.name) : '未知';
        return n.slice(-1) === '宮' ? n : n + '宮';
      }
      function _relationAt(branch, offset){
        var idx = DZ.indexOf(branch);
        if (idx < 0) return null;
        return _byBranch[DZ[(idx + offset + 12) % 12]] || null;
      }
      L.push('');
      L.push('【三方四正索引（引擎依本盤地支動態計算）】');
      palaces.forEach(function(p){
        var op = _relationAt(p.branch, 6);
        var t1 = _relationAt(p.branch, 4);
        var t2 = _relationAt(p.branch, 8);
        L.push('・' + _fullPalName(p) + '(' + p.branch + ')：對宮 ' + _fullPalName(op) + '(' + (op ? op.branch : '—') + ')；三合 ' + _fullPalName(t1) + '(' + (t1 ? t1.branch : '—') + ')、' + _fullPalName(t2) + '(' + (t2 ? t2.branch : '—') + ')');
      });
    } catch (e) {}

    // v80.53 忌沖對宮標註：忌坐B宮同時沖B的對宮（坐宮受傷、對宮被沖）——AI 實測只讀坐宮，改資料直給
    var _OPP = {命宮:'遷移',遷移:'命宮',兄弟:'交友',交友:'兄弟',夫妻:'官祿',官祿:'夫妻',子女:'田宅',田宅:'子女',財帛:'福德',福德:'財帛',疾厄:'父母',父母:'疾厄'};
    function _oppPal(p){ p = String(p||'').replace(/宮$/,''); if (p === '命') p = '命宮'; return _OPP[p] || ''; }
    function _jiChong(p){ var o = _oppPal(p); return o ? '（沖' + o + '）' : ''; }

    // 生年四化
    if (zw.sihua && zw.sihua.length) {
      L.push('');
      L.push('【生年四化】(先天動線，最關鍵)');
      zw.sihua.forEach(function(h){ var _hs = huaShort(h.hua); L.push('・' + h.star + '化' + _hs + '　入「' + h.palace + '」宮' + (_hs === '忌' ? _jiChong(h.palace) : '')); });
    }
    // 自化（離心↓＝本宮宮干自化飛出；向心↑＝對宮飛入本宮）
    try {
      if (zw.selfHua) {
        var sh = [], _seen = {};
        if (Array.isArray(zw.selfHua)) {
          zw.selfHua.forEach(function(x){
            if (!x || !x.star) return;
            var pname = x.palace || '';
            if (pname && pname.charAt(pname.length-1) !== '宮') pname = pname + '宮';   // 修「命宮宮」重複
            var ht = huaShort(x.type || x.hua || x.label || '');                         // 引擎欄位是 .type
            var dir = x.direction === '↑' ? '向心↑（對宮飛入）' : (x.direction === '↓' ? '離心↓（飛出）' : '');
            var line = pname + x.star + '自化' + ht + (dir ? '，' + dir : '');
            var key = pname + '|' + x.star + '|' + ht + '|' + (x.direction || '');         // 去重
            if (_seen[key]) return; _seen[key] = 1;
            sh.push(line);
          });
        } else if (typeof zw.selfHua === 'object') {
          Object.keys(zw.selfHua).forEach(function(kk){ var v = zw.selfHua[kk]; if (v) sh.push(kk + '：' + (typeof v==='string'?v:JSON.stringify(v))); });
        }
        if (sh.length) { L.push(''); L.push('【自化（飛星派視角）】(可觀察功能外放、回收、反覆或不易固著的傾向)'); sh.forEach(function(s){ L.push('・' + s); }); }
      }
    } catch (e) {}

    // 飛宮四化（宮與宮的因果鏈）
    try {
      if (zw.feiGongHua && zw.feiGongHua.length) {
        L.push('');
        L.push('【飛宮四化（飛星／欽天派視角）】(宮干四化的投射路徑，請與三方四正及生年四化交叉分析)');
        zw.feiGongHua.forEach(function (r) {
          function seg(o) { return (o && o.star) ? (o.star + '→本命' + o.to + (o.self ? '(離心自化)' : '')) : '—'; }
          L.push('・來源類型=本命宮干飛化；發射宮=' + (r.palace.slice(-1) === '宮' ? r.palace : r.palace + '宮') + '(干' + r.gan + ')　祿:' + seg(r.lu) + '｜權:' + seg(r.quan) + '｜科:' + seg(r.ke) + '｜忌:' + seg(r.ji));
        });
        L.push('(讀法參考：A宮「忌」入B宮，可觀察A領域的執著、阻滯或代價如何投向B領域；「祿」入可觀察資源投向。請再結合星曜強弱、三方與運限。)');
      }
    } catch (e) {}

    // 十二宮全盤
    L.push('');
    L.push('【十二宮全盤】(每宮：地支｜主星含廟旺｜輔雜曜｜煞｜十二長生)');
    palaces.forEach(function(p, _pi){
      var pp = palaceStarParts(p);
      var _pn = (p.name && p.name.charAt(p.name.length-1)==='宮') ? p.name : (p.name + '宮'); // 修「命宮宮」重複
      // v80.56：空宮借星資料層直給——實測 AI 把財帛(酉)空宮借成「夫妻武曲破軍」（正統借星安宮＝借「對宮」，
      // 酉對卯應借福德紫貪）；借宮運算留給模型＝幻覺面，改預先算好注入
      var _emptyTxt = '空宮';
      if (!pp.majors.length) {
        var _op = palaces[(_pi + 6) % 12];
        var _ops = _op ? palaceStarParts(_op) : null;
        if (_ops && _ops.majors.length) {
          var _opn = (_op.name && _op.name.charAt(_op.name.length-1)==='宮') ? _op.name : (_op.name + '宮');
          _emptyTxt = '空宮〔借對宮' + _opn + '(' + _op.branch + ')：' + _ops.majors.join('、') + '〕';
        }
      }
      var seg = _pn + '(' + p.branch + ')：' +
        (pp.majors.length ? pp.majors.join('、') : _emptyTxt) +
        (pp.aux.length ? '｜輔雜曜:' + pp.aux.join('、') : '') +
        (pp.sha.length ? '｜煞:' + pp.sha.join('、') : '') +
        (p.changsheng ? '｜長生:' + p.changsheng : '');
      L.push('・' + seg);
    });

    // 格局
    if (zw.patterns && zw.patterns.length) {
      L.push('');
      L.push('【命盤格局候選】(請以主星強弱、三方吉煞、四化、破格與運限覆核)');
      (zw.candidateInterpretation||zw.patterns).forEach(function(g){ L.push('・'+g.name+'；'+(g.status==='variant-structure'?'所列流派位置條件成立':'已核對位置結構')+'；盤面條件：'+(g.observedStructure||[]).join('；')+'；支持：'+JSON.stringify(g.support||[])+'；牽制：'+JSON.stringify(g.modifiers||[])+'；成色：'+(g.review||'結合本題宮位、廟旺及歲運'));  });
    }
    // 星系註記
    try {
      if (zw.starComboNotes && zw.starComboNotes.length) {
        L.push('');
        L.push('【星系組合候選】(請依本宮、三方、廟旺、四化與運限綜合判讀)');
        zw.starComboNotes.forEach(function(n){
          var raw = (typeof n === 'string' ? n : (n && n.text) || '');
          var nameOnly = raw.split('：')[0] || raw;
          if (nameOnly) L.push('・' + nameOnly);
        });
      }
    } catch (e) {}

    // 大限
    if (zw.daXian && zw.daXian.length) {
      var nowY = zwReferenceYear(zw);
      var age = zwNominalAge(zw);
      // v80.48 治本：紫微大限以「虛歲」計（與引擎 isCurrent 同基準），不可用實歲，否則虛歲/實歲兩套
      //   基準各標一限造成「兩個◀現在」。虛歲 = 今年 - 出生年 + 1。
      var _hasCur = zw.daXian.some(function(d){ return d.isCurrent; }); // 引擎已標當前大限就以它為唯一準
      L.push('');
      L.push('【運限計算政策】大限採虛歲；現行大限依同一查詢時刻的 isCurrent 與農曆虛歲判斷。資料未提供精確大限切換日期，以引擎年齡區間判讀。下方年份為農曆年度，正月初一交替；公曆元旦至農曆新年前仍列前一年度，不能把公曆「今年」誤套成同號農曆流年。流月未在本提示詞列出。');
      L.push('【大限走勢】(本命為長期底色，大限為十年作用場域；僅提供計算資料，不傳送前端吉凶評級；現行大限以 ◀現在 標示)');
      zw.daXian.forEach(function(dx){
        // 只標一個：優先信引擎 isCurrent；引擎全沒標時才用虛歲回推（同一基準，不混實歲、不 OR 兩套）
        var _isNow = _hasCur ? !!dx.isCurrent : (age != null && age >= dx.ageStart && age <= dx.ageEnd);
        if(scope&&scope.mode!=='all'&&!_isNow){
          var born=zw.lunar.year;
          if(dx.ageEnd<scope.start-born+1||dx.ageStart>scope.end-born+1)return;
        }
        var cur = _isNow ? ' ◀現在' : '';
        var huaTxt = (dx.hua && dx.hua.length) ? '　限內四化:' + dx.hua.map(function(h){var _hs=huaShort(h.hua);return h.star+'化'+_hs+'入本命'+h.palace+(h.periodPalace?'〔大限'+h.periodPalace+'〕':'')+(_hs==='忌'?_jiChong(h.palace):'');}).join('、') : '';
        L.push('・' + dx.ageStart + '–' + dx.ageEnd + '歲　走「' + (dx.palaceName||dx.palace||'') + '」宮(' + (dx.branch||'') + ')' +
          huaTxt + cur);
        if(dx.flowStars&&dx.flowStars.length)L.push('    大限流曜：'+JSON.stringify(dx.flowStars));
        if(dx.palaces&&dx.palaces.length)L.push('    大限十二宮疊宮：'+dx.palaces.map(function(p){return p.name+'['+p.branch+']＝本命'+p.natalPalace;}).join('；'));
      });
    }

    // 流年（今年＋未來3年，供「明年運勢」「未來三年哪一年」類問題比較）
    try {
      if (typeof zw.getLiuNianZw === 'function') {
        var ly0 = zwReferenceYear(zw);
        L.push('');
        var first=scope&&scope.mode!=='all'?scope.start:ly0;
        var requestedLast=scope&&scope.mode!=='all'?scope.end:ly0+3;
        var last=Math.min(requestedLast,first+30);
        L.push('【流年走勢 ' + first + '–' + last + '】(提供年度觸發：流年命宮落點與流年四化；時間精度為年度層級)');
        if(requestedLast>last)L.push('單次年度資料上限31年；'+(last+1)+'年以後未列出，不能補造該段結論，需縮小期間另查。');
        for (var yy = first; yy <= last; yy++) {
          var lnf = zw.getLiuNianZw(yy);
          if (!lnf) continue;
          var tag = (yy === ly0) ? '（現行農曆年度）' : (yy === ly0 + 1) ? '（下一農曆年度）' : '';
          L.push('・' + yy + tag + '　' + (lnf.gz || '') + '　流年命宮落本命「' + (lnf.mingPalace || '') + '」' +
            '' +
            ((lnf.hua && lnf.hua.length) ? '　流年四化:' + lnf.hua.map(function(h){var _hs=huaShort(h.hua);return h.star+'化'+_hs+'入本命'+h.palace+(h.periodPalace?'〔流年'+h.periodPalace+'〕':'')+(_hs==='忌'?_jiChong(h.palace):'');}).join('、') : ''));
          if(lnf.flowStars&&lnf.flowStars.length)L.push('    流年流曜：'+JSON.stringify(lnf.flowStars));
          if(lnf.palaces&&lnf.palaces.length)L.push('    流年十二宮疊宮：'+lnf.palaces.map(function(p){return p.name+'['+p.branch+']＝本命'+p.natalPalace;}).join('；'));
          // Frontend interpretation notes are intentionally excluded from the prompt.
        }
      }
    } catch (e) {}

    return L.join('\n');
  }

  window.JYZiweiData=Object.freeze({serialize:serializeChart});

  // ════════════════════════════════════════════════════════
  //  深度提示詞（比文墨天機更深）
  // ════════════════════════════════════════════════════════
  // v80.60：紫微提示詞改由 ziwei-prompt-root.js 提供單一共用證據核心。
  // 不再在本檔維護題型補丁，避免三合、飛星、欽天與品牌規則各自漂移。
  function _zwPromptRootApi() {
    try {
      if (typeof window !== 'undefined' && window.JY_ZIWEI_PROMPT_ROOT) return window.JY_ZIWEI_PROMPT_ROOT;
      if (typeof globalThis !== 'undefined' && globalThis.JY_ZIWEI_PROMPT_ROOT) return globalThis.JY_ZIWEI_PROMPT_ROOT;
    } catch (e) {}
    return null;
  }

  var ZW_HEAD_FALLBACK =
    '你是一位資深紫微斗數命理師，熟悉十四主星、宮位、三方四正、廟旺、四化、格局、運限，以及三合、飛星與欽天等流派。請運用你自身完整的命理知識，綜合本次命盤資料，直接、深入且精準地回答問題。以本命結構為底，結合動態三方四正、星曜組合、輔煞、生年四化、身宮、格局、大限與流年；飛化、自化與來因宮可提供另一流派視角。不同判法僅在改變本題答案時簡短交代。';

  var ZW_TAIL_FALLBACK =
    '請依共用解讀規則回答；正文定稿後才選品，不為材料改寫主判。需要選品時承接前文已說明的需要，沒有個人選材依據就用已有飾品作提醒，不假定礦物有療效或改運能力。一般有效解讀且未拒絕選品時，最後保留：\n[靜月之光蝦皮賣場](https://shopee.tw/a50h95648d?tab=shop)\n願你諸事順遂。';

  function _zwHeadText() {
    var api = _zwPromptRootApi();
    return (api && typeof api.composeHead === 'function') ? api.composeHead() : ZW_HEAD_FALLBACK+'\n'+(window.JY_READING_QUALITY&&typeof window.JY_READING_QUALITY.lines==="function"&&String(window.JY_READING_QUALITY.readingVersion||"0").localeCompare("8.0.0",undefined,{numeric:true})>=0?window.JY_READING_QUALITY.lines('ziwei').join('\n'):JY_READING_ZIWEI_FALLBACK);
  }

  function _zwTailText() {
    var api = _zwPromptRootApi();
    return (api && typeof api.composeTail === 'function') ? api.composeTail() : ZW_TAIL_FALLBACK;
  }

  function buildPrompt(zw, form) {
    var q = (form && form.question) ? form.question.trim() : '';
    var parts = [];
    parts.push(_zwHeadText());
    parts.push('\n────────────────────────────');
    parts.push('提問者的問題：' + (q || '(未填寫，請以命盤為主，分析命格、事業、財運、感情婚姻、健康風險與近年大限流年走勢)'));
    parts.push('────────────────────────────\n');
    parts.push(serializeChart(zw, form,{compact:true}));
    parts.push('\n────────────────────────────\n');
    parts.push(_zwTailText());
    return globalThis.JYReadingWorkflow.finish(parts.join('\n'),{method:'ziwei',question:q});
  }

  // ════════════════════════════════════════════════════════
  //  結果頁
  // ════════════════════════════════════════════════════════
  // 地支固定盤位置（4×4）
  var DZ_CELL = {
    '巳':{r:1,c:1},'午':{r:1,c:2},'未':{r:1,c:3},'申':{r:1,c:4},
    '酉':{r:2,c:4},'戌':{r:3,c:4},'亥':{r:4,c:4},'子':{r:4,c:3},
    '丑':{r:4,c:2},'寅':{r:4,c:1},'卯':{r:3,c:1},'辰':{r:2,c:1}
  };

  function renderChartGrid(zw) {
    var palaces = zw.palaces || [];
    var html = '<div class="zw-chart">';
    palaces.forEach(function(p){
      var cell = DZ_CELL[p.branch];
      if (!cell) return;
      var pp = palaceStarParts(p);
      var starHtml = '';
      (p.stars || []).forEach(function(s){
        if (s.type !== 'major') return;
        var br = brightOf(s.name, p.branch);
        var hua = s.hua ? '<span class="hua' + (s.hua==='化忌'?' ji':'') + '">' + huaShort(s.hua) + '</span>' : '';
        starHtml += '<span>' + esc(s.name) + (br?'<span style="opacity:.5;font-size:.5rem">' + esc(br) + '</span>':'') + hua + '</span>';
      });
      // 輔吉／煞完整送出；由 AI 依題目相關性與獨立性去重，不在資料層先截斷。
      var auxArr = (p.stars||[]).filter(function(s){ return s.type!=='major' && s.type!=='sha'; });
      var shaArr = (p.stars||[]).filter(function(s){ return s.type==='sha'; });
      auxArr.forEach(function(s){ starHtml += '<span class="aux">' + esc(s.name) + (s.hua?'<span class="hua' + (s.hua==='化忌'?' ji':'') + '">'+huaShort(s.hua)+'</span>':'') + '</span>'; });
      shaArr.forEach(function(s){ starHtml += '<span class="sha">' + esc(s.name) + '</span>'; });
      if (!starHtml) starHtml = '<span style="opacity:.4">空宮</span>';

      var badge = p.isMing ? '<span class="badge">命</span>' : (p.isShen ? '<span class="badge">身</span>' : '');
      html += '<div class="zw-pg' + (p.isMing?' ming':'') + '" style="grid-row:' + cell.r + ';grid-column:' + cell.c + '">' +
        '<div class="zw-pg-stars">' + starHtml + '</div>' +
        '<div class="zw-pg-foot"><span class="zw-pg-name">' + esc(p.name) + badge + '</span><span class="zw-pg-dz">' + esc(p.branch) + '</span></div>' +
        '</div>';
    });
    // 中宮
    var sihuaTxt = (zw.sihua||[]).map(function(h){ return h.star + huaShort(h.hua); }).join(' ');
    html += '<div class="zw-pg-center">' +
      '<b>' + esc((zw.yGan||'')+(zw.yZhi||'')) + '</b>' +
      '<span>' + esc(zw.wuxingJu||'') + '</span>' +
      '<span>命主 ' + esc(zw.mingZhu||'-') + '・身主 ' + esc(zw.shenZhu||'-') + '</span>' +
      (sihuaTxt ? '<span style="color:rgba(212,175,55,.7)">四化 ' + esc(sihuaTxt) + '</span>' : '') +
      '</div>';
    html += '</div>';
    return html;
  }

  // ════════════════════════════════════════════════════════
  //  自包覆輸入頁（比照雷諾曼，自成一頁、不借用 step-0、不需姓名）
  // ════════════════════════════════════════════════════════
  // 時辰 → 代表時（供 computeZiwei 由 solarHH 反推時辰）
  var SHICHEN = [
    {n:'早子 00–01', h:0},{n:'晚子 23–24', h:23},{n:'丑時 01–03', h:2},{n:'寅時 03–05', h:4},{n:'卯時 05–07', h:6},
    {n:'辰時 07–09', h:8},{n:'巳時 09–11', h:10},{n:'午時 11–13', h:12},{n:'未時 13–15', h:14},
    {n:'申時 15–17', h:16},{n:'酉時 17–19', h:18},{n:'戌時 19–21', h:20},{n:'亥時 21–23', h:22}
  ];

  function showInput(restoreForm) {
    zwEnsureCSS();
    var old = document.getElementById('zw-input'); if (old) old.remove();
    var oldR = document.getElementById('zw-result'); if (oldR) oldR.remove();
    var draft = restoreForm === true ? _zwLastForm : null;
    _zwGender = draft ? draft.gender : '';
    _zwSelDate = draft ? draft.bdate : '';
    _zwSelHH = draft ? (draft.btimeUnknown ? 'unknown' : String(draft.hour!=null?draft.hour:parseInt(draft.btime,10))) : '';
    _zwExactTime = draft&&draft.timePrecision==='minute'?draft.btime:'';
    if(_zwExactTime){var draftHour=Number(_zwExactTime.split(':')[0]);_zwSelHH=String(draftHour===23?23:Math.floor(((draftHour+1)%24)/2)*2);}
    var w = document.createElement('div');
    w.className = 'zw-in';
    w.id = 'zw-input';
    var hhOpts = '<option value="">選擇時辰</option>';
    for (var i=0;i<SHICHEN.length;i++) hhOpts += '<option value="'+SHICHEN[i].h+'">'+SHICHEN[i].n+'</option>';
    hhOpts += '<option value="unknown">不確定（尚未定盤）</option>';
    w.innerHTML =
      '<div class="zw-in-wrap">' +
        '<nav class="at-room-nav" aria-label="頁面導覽"><button type="button" class="at-back zw-in-back" onclick="_zwClose()">← 返回首頁</button><a class="at-room-shop" href="https://shopee.tw/a50h95648d?tab=shop" target="_blank" rel="noopener noreferrer">蝦皮選物 <span aria-hidden="true">↗</span></a></nav>' +
        '<div class="zw-in-head at-tool-header"><span class="at-art" data-art="ziwei" aria-hidden="true"></span><div><span class="at-eyebrow">ZI WEI · TWELVE PALACES</span><h1>紫微斗數</h1><p>以十二宮為圖，探索人生的不同面向。</p></div></div><div class="at-flow-guide" aria-label="探索流程"><span><b>01</b> 整理問題</span><span><b>02</b> 核對資料排盤</span><span><b>03</b> 探索解讀</span></div>' +
        '<div class="zw-in-sec"><div class="zw-in-title">✦ 你想問什麼？</div>' +
          '<textarea class="zw-in-q" id="zw-q" aria-label="紫微斗數想釐清的問題（選填）" rows="2" maxlength="200" placeholder="例如：今年適合換工作嗎？留空可探索整體命盤。"></textarea></div>' +
        '<div class="zw-in-sec"><div class="zw-in-title">✦ 出生資料（國曆，不需姓名）</div>' +
          '<div class="zw-in-field"><label class="zw-in-label">國曆出生日期</label><button type="button" class="zwx-field" id="zwx-fld-date" onclick="_zwxOpenDate()">' + _zwDateInner() + '</button></div>' +
          '<div class="zw-in-field"><label class="zw-in-label">出生時辰</label><button type="button" class="zwx-field" id="zwx-fld-hh" onclick="_zwxOpenHH()">' + _zwHHInner() + '</button></div>' +
          '<div class="zw-in-field"><label class="zw-in-label" for="zw-exact-time">已知出生時分（選填）</label><input id="zw-exact-time" type="time" step="60" class="zw-in-select" oninput="_zwExactChanged(this.value)" value="'+_zwExactTime+'"><p class="zw-in-hint">填入原始時分會自動對應時辰，完整保留出生紀錄。</p></div>' +
          '<input type="hidden" id="zw-bd" value="' + _zwSelDate + '">' +
          '<input type="hidden" id="zw-hh" value="' + _zwSelHH + '">' +
          '<div class="zw-in-field"><label class="zw-in-label">性別</label><div class="zw-in-pills">' +
            '<button type="button" class="zw-in-pill" id="zw-g-m" onclick="_zwSetGender(\'male\')">男</button>' +
            '<button type="button" class="zw-in-pill" id="zw-g-f" onclick="_zwSetGender(\'female\')">女</button>' +
          '</div></div>' +
          '<div class="zw-in-field"><label class="zw-in-label" for="zw-leap-policy">農曆閏月安宮</label><select class="zw-in-select" id="zw-leap-policy"><option value="SAME_MONTH">沿用本月</option><option value="SPLIT_AT_15">十五日後作次月</option></select></div>' +
          '<div class="zw-in-field"><label class="zw-in-label" for="zw-day-policy">晚子時換日</label><select class="zw-in-select" id="zw-day-policy"><option value="MIDNIGHT_00">00:00 午夜換日</option><option value="ZI_HOUR_23">23:00 子初換日</option></select></div>' +
          '<p class="zw-in-hint">兩項設定存在流派差異，會隨命盤保留。沿用本月與午夜換日為本站預設。</p>' +
          '<div class="zwx-err" id="zwx-err"></div>' +
          '<div class="zw-in-hint">紫微以時辰定盤；不知道時辰可先整理問題與出生資料，確認後再解讀個人命盤。</div>' +
        '</div>' +
        '<button class="zw-in-go" onclick="_ziweiSubmit()">✦ 起 盤 ✦</button>' +
        '<div class="zw-in-foot">靜月之光 ・ jingyue.uk<br>紫微斗數 ・ 命盤僅供參考</div>' +
      '</div>';
    document.body.appendChild(w);
    if (draft) {
      document.getElementById('zw-q').value = draft.question || '';
      window._zwSetGender(_zwGender);
      document.getElementById('zw-leap-policy').value=draft.leapMonthPolicy||'SAME_MONTH';
      document.getElementById('zw-day-policy').value=draft.dayBoundaryMode||'MIDNIGHT_00';
    }
    if (window.JY_ATELIER) window.JY_ATELIER.enhance(w);
    try { document.body.style.overflow = 'hidden'; } catch(e){} // 鎖背景捲動，避免抖動
    // 趁使用者填表時背景預載排盤引擎（idle 載入器可能還沒載到），按「起盤」時就緒
    try {
      if (typeof computeZiwei !== 'function' && typeof window._jyLazyScript === 'function') {
        var loadZiwei=function(){window._jyLazyScript('JS/ziwei.js?v=20260924root2', null);};
        if(typeof TG==='undefined'||typeof DZ==='undefined') window._jyLazyScript('JS/bazi.js?v=20260925engine1', function(ok){if(ok)loadZiwei();}); else loadZiwei();
      }
    } catch(e){}
    w.scrollTop = 0;
  }

  function showResult(zw, form) {
    zwEnsureCSS();
    _zwLastChart = zw; _zwLastForm = form;
    _lastPrompt = buildPrompt(zw, form);

    var old = document.getElementById('zw-result');
    if (old) old.remove();
    var w = document.createElement('div');
    w.className = 'zw-res';
    w.id = 'zw-result';

    // facts
    var nowY = zwReferenceYear(zw);
    var curDx = null;
    try {
      curDx = (zw.daXian||[]).find(function(d){ return d.isCurrent; });
      if (!curDx) {
        var age = zwNominalAge(zw);
        if (age != null) curDx = (zw.daXian||[]).find(function(d){ return age>=d.ageStart && age<=d.ageEnd; });
      }
    } catch(e){}
    var ln = null;
    try { if (typeof zw.getLiuNianZw === 'function') ln = zw.getLiuNianZw(nowY); } catch(e){}

    var facts =
      fact('命主・身主', (zw.mingZhu||'-') + '　／　' + (zw.shenZhu||'-')) +
      fact('五行局', zw.wuxingJu || '-') +
      fact('生年四化', (zw.sihua||[]).map(function(h){return h.star+huaShort(h.hua);}).join('  ') || '-') +
      fact('現行大限', curDx ? (curDx.ageStart+'–'+curDx.ageEnd+'歲 走'+(curDx.palaceName||curDx.palace||'')+'宮') : '-') +
      fact('今年流年 '+nowY, ln ? ((ln.gz||'')+' 命宮落'+(ln.mingPalace||'')) : '-') +
      fact('命宮', (zw.palaces && zw.palaces[0]) ? ((zw.palaces[0].branch||'')+'宮 '+(palaceStarParts(zw.palaces[0]).majors.join('、')||'空宮')) : '-');

    // chips（格局）
    var chips = '';
    (zw.patterns||[]).forEach(function(g){
      var warn = /凶|忌|煞|破|沖/.test((g.level||'')+(g.name||''));
      chips += '<span class="zw-chip' + (warn?' warn':'') + '">' + esc(g.name) + (g.level?'·'+g.level:'') + '</span>';
    });
    if (!chips) chips = '<span class="zw-chip" style="opacity:.6">無明顯特殊格局</span>';

    var aiSc = '';
    AI_LIST.forEach(function(ai){
      aiSc += '<button class="zw-ai-sc" onclick="_zwOpenAI(\'' + ai.id + '\',\'' + ai.url + '\',this)">' +
        '<img src="ai-icons/ai-' + ai.id + '.png" alt="' + ai.name + '" onerror="this.style.display=\'none\'"><span>' + ai.name + '</span></button>';
    });

    w.innerHTML =
      '<div class="zw-res-inner">' +
        '<nav class="at-room-nav" aria-label="命盤結果導覽"><button type="button" class="at-back" onclick="_zwReset()">← 返回修改資料</button><button type="button" class="at-home-link" onclick="_zwClose()">首頁</button><a class="at-room-shop" href="https://shopee.tw/a50h95648d?tab=shop" target="_blank" rel="noopener noreferrer">蝦皮選物 <span aria-hidden="true">↗</span></a></nav>' +
        '<div class="zw-res-head">' +
          '<div class="zw-res-title">紫微斗數命盤</div>' +
          '<button class="zw-res-x" onclick="_zwClose()" aria-label="關閉">×</button>' +
        '</div>' +
        '<div class="zw-meta">三合派四化骨架 ・ 民用時辰代表時，未校正真太陽時 ・ 不需姓名</div>' +
        (form.btimeUnknown ? '<div class="zw-meta" role="status">出生時辰未知，尚未定盤。請先查找出生紀錄；下方提示詞會協助整理問題，不會把午時盤當作你的命盤。</div>' : '<p class="at-result-note">十二宮保留完整星曜與四化標記。手機可左右滑動查看命盤。</p><div class="at-chart-scroll" tabindex="0" role="region" aria-label="可橫向捲動的紫微十二宮命盤">' + renderChartGrid(zw) + '</div><div class="zw-facts">' + facts + '</div><div class="zw-chips">' + chips + '</div>') +
        '<div class="zw-ai">' +
          '<div class="zw-ai-title">🌙 AI 深度解讀</div>' +
          '<div class="zw-ai-desc">依已確認的出生資料整理提示詞；時辰已知時附命盤依據，未知時協助整理問題及定盤所需資料。輕觸複製後貼到 AI 對話即可。</div>' +
          '<button class="zw-ai-copy" onclick="_zwCopy()">✦ 一鍵複製紫微解讀提示詞 ✦</button>' +
          '<div class="zw-ai-grid">' + aiSc + '</div>' +
          '<div class="zw-ai-foot">點 AI 圖示 → 自動複製＋開啟 → 貼上送出</div>' +
        '</div>' +
        '<div class="zw-actions">' +
          '<button class="zw-btn" onclick="_ziweiShare()" style="background:linear-gradient(135deg,rgba(201,168,76,.18),rgba(201,168,76,.05));border-color:rgba(201,168,76,.5);color:#c9a84c">📤 生成分享卡</button>' +
          '<button class="zw-btn" onclick="_zwReset()">↺ 重新輸入生辰</button>' +
          '<button class="zw-btn" onclick="_zwClose()">⌂ 回首頁</button>' +
        '</div>' +
        '<div class="zw-res-foot">靜月之光 ・ jingyue.uk<br>紫微斗數 ・ 命盤僅供參考，不構成醫療、法律或財務建議</div>' +
      '</div>';
    document.body.appendChild(w);
    if (window.JY_ATELIER) window.JY_ATELIER.enhance(w);
    if(window.JYExperience&&!form.btimeUnknown)window.JYExperience.mountZiwei(w,zw);
    w.scrollTop = 0;
  }

  // fact helper（module scope，供 showResult 透過閉包使用）
  function fact(k, v) {
    return '<div class="zw-fact"><div class="k">' + esc(k) + '</div><div class="v">' + esc(v) + '</div></div>';
  }

  // ════════════════════════════════════════════════════════
  //  Orchestrator
  // ════════════════════════════════════════════════════════
  window._ziweiSubmit = function () {
    _zwxClearErr();
    var qEl = document.getElementById('zw-q');
    var question = qEl && qEl.value ? qEl.value.trim() : '';

    if (!_zwGender) { _zwxErr('請選擇性別'); return; }

    var bdEl = document.getElementById('zw-bd');
    var bd = bdEl && bdEl.value ? bdEl.value : '';
    var md = /^(\d{4})-(\d{2})-(\d{2})$/.exec(bd);
    if (!md) { _zwxErr('請選擇國曆出生日期'); return; }
    var y = +md[1], mo = +md[2], d = +md[3];
    if (!window.JY_PICKER.validDate(y, mo, d, 2100)) { _zwxErr('請選擇有效的國曆日期（1900–2100）'); return; }

    var exact=(document.getElementById('zw-exact-time')||{}).value||'';
    if(exact&&!/^([01]\d|2[0-3]):[0-5]\d$/.test(exact)){_zwxErr('請填寫有效出生時分');return;}
    var hhEl = document.getElementById('zw-hh');
    var hhVal = exact?String(Number(exact.split(':')[0])):(hhEl ? hhEl.value : '');
    if (hhVal === '') { _zwxErr('請選擇出生時辰，或明確選擇「不確定」'); return; }
    var btimeUnknown = (hhVal === 'unknown');
    var hh = btimeUnknown ? 12 : Number(hhVal);
    if (!Number.isInteger(hh) || hh < 0 || hh > 23) { _zwxErr('出生時辰格式不正確'); return; }

    if (typeof computeZiwei !== 'function') { _zwxErr('排盤引擎仍在背景載入，請過幾秒再按一次「起盤」'); return; }

    var bdate = y + '-' + (mo < 10 ? '0' : '') + mo + '-' + (d < 10 ? '0' : '') + d;
    var btime = btimeUnknown ? '' : (exact||((hh < 10 ? '0' : '') + hh + ':00'));
    var form = {hour:hh,minute:exact?Number(exact.split(':')[1]):null,timePrecision:exact?'minute':'shichen', type:'general', question: question, gender: _zwGender, bdate: bdate, btime: btime, name:'', btimeUnknown: btimeUnknown,leapMonthPolicy:(document.getElementById('zw-leap-policy')||{}).value||'SAME_MONTH',dayBoundaryMode:(document.getElementById('zw-day-policy')||{}).value||'MIDNIGHT_00' };
    try { if (typeof S !== 'undefined') { S.form = form; S._tarotOnlyMode = false; S._autoMode = false; } } catch (e) {}

    // 亮度表由共用引擎單一來源提供，避免此入口與其他入口覆寫成不同盤。
    // 紫微以時辰定盤：直接以時辰代表時排盤（無出生地經度校正，符合斗數慣例）
    // 保險：approxLunar 用 Lunar.Solar，而 lunar.js 把它掛在 window.Solar，故補上橋接。
    try { if (window.Solar && (!window.Lunar || !window.Lunar.Solar)) { if (!window.Lunar) window.Lunar = {}; window.Lunar.Solar = window.Solar; } } catch(e){}
    var zw = null;
    try {
      zw = computeZiwei(y, mo, d, hh, _zwGender,form);
      if (typeof S !== 'undefined') S.ziwei = zw;
    } catch (e) {
      console.error('[Ziwei] computeZiwei 失敗:', e);
      _zwxErr('排盤失敗：' + (e && e.message ? e.message : '請確認農曆轉換庫已載入後再試'));
      return;
    }
    if (!zw || !zw.palaces) {
      var _er = (typeof window !== 'undefined' && window._jyZiweiError) ? window._jyZiweiError : '';
      _zwxErr('排盤資料不完整，請重試' + (_er ? '（原因：' + _er + '）' : ''));
      return;
    }

    var inp = document.getElementById('zw-input'); if (inp) inp.style.display = 'none';
    showLoading(function () { showResult(zw, form); });
  };

  // ════════════════════════════════════════════════════════
  //  複製 / 開啟 AI / 重設 / 關閉
  // ════════════════════════════════════════════════════════
  window._ziweiShare = function () {
    if (_zwLastForm && _zwLastForm.btimeUnknown) { _zwxErr('時辰未知，尚無可分享的個人命盤'); return; }
    if (!window.JYShareCard) { _zwxErr('分享元件載入中，請稍候再試一次'); return; }
    var zw = _zwLastChart || {}, form = _zwLastForm || {};
    var palaces = zw.palaces || [];
    function byBranch(br) { for (var i = 0; i < palaces.length; i++) { if (palaces[i].branch === br) return palaces[i]; } return { branch: br, name: '', stars: [] }; }
    function majors(p) { try { return palaceStarParts(p).majors.slice(0, 2).join(''); } catch (e) { return ''; } }
    var order = ['巳', '午', '未', '申', '辰', '酉', '卯', '戌', '寅', '丑', '子', '亥'];
    var cardP = order.map(function (br) {
      var p = byBranch(br), nm = p.name || '';
      if (nm && nm.charAt(nm.length - 1) !== '宮') nm += '宮';
      return { branch: br, name: nm, star: majors(p) };
    });
    var ming = palaces.find(function(p){return p.isMing||/^命宮?$/.test(p.name||'');}) || {};
    var juName = ({ 2: '水二局', 3: '木三局', 4: '金四局', 5: '土五局', 6: '火六局' })[zw.wuxingJu] || (zw.wuxingJu || '');
    var shen = null;
    for (var i = 0; i < palaces.length; i++) { if (palaces[i].isShen) { shen = palaces[i]; break; } }
    JYShareCard.open('ziwei', {
      question: form.question || '',
      palaces: cardP,
      ming: '命宮 ・ ' + (majors(ming) || '空宮'),
      info: juName + (shen ? ' ・ 身宮在' + (shen.name || '') : '')
    });
  };

  window._zwCopy = function () {
    if (!_lastPrompt) return;
    function ok(){
      var b = document.querySelector('.zw-ai-copy');
      if (b) { var o = b.innerHTML; b.innerHTML = '✓ 已複製！貼到 AI 送出即可'; b.style.borderColor = 'rgba(52,211,153,.6)'; setTimeout(function(){ b.innerHTML = o; b.style.borderColor = ''; }, 2500); }
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(_lastPrompt).then(ok, function(){ _fallbackCopy(_lastPrompt); ok(); });
    } else { _fallbackCopy(_lastPrompt); ok(); }
  };
  window._zwOpenAI = function (id, url, btn) {
    if (!_lastPrompt) { window.open(url, '_blank'); return; }
    function go(){ var s = btn && btn.querySelector('span'); var nm = s ? s.textContent : ''; if (s) s.textContent = '已複製！'; setTimeout(function(){ window.open(url, '_blank'); }, 280); setTimeout(function(){ if (s) s.textContent = nm; }, 2200); }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(_lastPrompt).then(go, function(){ _fallbackCopy(_lastPrompt); go(); });
    } else { _fallbackCopy(_lastPrompt); go(); }
  };
  function _fallbackCopy(text) {
    try { var ta = document.createElement('textarea'); ta.value = text; ta.style.cssText = 'position:fixed;left:-9999px'; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta); } catch (e) {}
  }
  window._zwSetGender = function (g) {
    _zwGender = g;
    var m = document.getElementById('zw-g-m'), f = document.getElementById('zw-g-f');
    if (m) m.classList.toggle('active', g === 'male');
    if (f) f.classList.toggle('active', g === 'female');
    if (m) m.setAttribute('aria-pressed', String(g==='male'));
    if (f) f.setAttribute('aria-pressed', String(g==='female'));
  };
  window._zwReset = function () {
    var r = document.getElementById('zw-result'); if (r) r.remove();
    showInput(true);
  };
  window._zwClose = function () {
    if(window.JYRitual)window.JYRitual.cancel('ziwei');
    _zwxCloseSheet();
    if (window.JY_ATELIER) window.JY_ATELIER.restoreEntrance();
    var r = document.getElementById('zw-result'); if (r) r.remove();
    var inp = document.getElementById('zw-input'); if (inp) inp.remove();
    try { document.body.style.overflow = ''; } catch(e){}
    try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch(e){ window.scrollTo(0,0); }
  };

  // 對外入口（首頁點「紫微斗數」→ ui.js _ziweiOpen 轉呼叫此函式，開啟自包覆乾淨頁）
  window._ziweiStandaloneOpen = showInput;

  // 對外（除錯/重用）
  window._ziweiBuildPrompt = buildPrompt;
  window._ziweiShowResult = showResult;
  window._ziweiShowLoading = showLoading;


  // ════════════════════════════════════════════════════════
  //  v80.30 自訂選擇器（日期 + 時辰）— 取代手機原生 UI
  //  寫回隱藏 zw-bd / zw-hh，_ziweiSubmit 完全沿用、引擎不動。
  //  紫微以時辰定盤：日期 1900–2100、時辰 12 格＋不確定，無出生地。
  // ════════════════════════════════════════════════════════
  var ZWK = ['日','一','二','三','四','五','六'];
  function _zwPad(n){ return (n<10?'0':'')+n; }
  function _zwDim(y,m){ return new Date(y, m, 0).getDate(); }
  function _zwFdow(y,m){ return new Date(y, m-1, 1).getDay(); }

  // ── 欄位顯示 ──
  function _zwDateInner(){
    if(!_zwSelDate) return '<span class="ph">請選擇出生日期</span><span class="chev">▾</span>';
    var p=_zwSelDate.split('-'), y=+p[0], m=+p[1], d=+p[2];
    var wk=ZWK[new Date(y,m-1,d).getDay()];
    return '<span class="val">'+y+' 年 '+m+' 月 '+d+' 日（週'+wk+'）</span><span class="chev">▾</span>';
  }
  window._zwExactChanged=function(value){_zwExactTime=value;if(/^([01]\d|2[0-3]):[0-5]\d$/.test(value)){var hh=Number(value.split(':')[0]);_zwSelHH=String(hh===23?23:Math.floor(((hh+1)%24)/2)*2);}_zwxSyncFields();};
  function _zwHHInner(){
    if(_zwSelHH===''||_zwSelHH==null) return '<span class="ph">請選擇出生時辰</span><span class="chev">▾</span>';
    if(_zwSelHH==='unknown') return '<span class="val">不確定（尚未定盤）</span><span class="chev">▾</span>';
    var hh=parseInt(_zwSelHH,10), nm='';
    for(var i=0;i<SHICHEN.length;i++){ if(SHICHEN[i].h===hh){ nm=SHICHEN[i].n; break; } }
    return '<span class="val">'+(nm||(_zwPad(hh)+':00'))+'</span><span class="chev">▾</span>';
  }
  function _zwxSyncFields(){
    var a=document.getElementById('zwx-fld-date'); if(a) a.innerHTML=_zwDateInner();
    var b=document.getElementById('zwx-fld-hh'); if(b) b.innerHTML=_zwHHInner();
    var hb=document.getElementById('zw-bd'); if(hb) hb.value=_zwSelDate;
    var hh=document.getElementById('zw-hh'); if(hh) hh.value=_zwSelHH;
  }

  // ── 內嵌錯誤 ──
  function _zwxErr(msg){ var e=document.getElementById('zwx-err'); if(e){ e.textContent='⚠ '+msg; e.classList.add('show'); try{e.scrollIntoView({behavior:'smooth',block:'center'});}catch(x){} } else { try{alert(msg);}catch(z){} } }
  function _zwxClearErr(){ var e=document.getElementById('zwx-err'); if(e) e.classList.remove('show'); }

  // ── 底部 sheet ──
  var _zwxSheetType='', _zwxDispose=null;
  function _zwxOpenSheet(title, sub, body, foot, prepare){
    _zwxCloseSheet(true);
    var bd=document.createElement('dialog'); bd.id='zwx-sheet-bd'; bd.className='zwx-sheet-bd show'; bd.setAttribute('role','presentation');
    bd.onclick=function(e){ if(e.target===bd) _zwxCloseSheet(); };
    bd.onkeydown=function(e){ if(e.key==='Escape') _zwxCloseSheet(); };
    bd.innerHTML='<div class="zwx-sheet" role="dialog" aria-modal="true" aria-label="'+title+'"><div class="zwx-grip"></div>'+
      '<div class="zwx-stitle">'+title+'</div>'+
      '<div class="zwx-ssub" id="zwx-ssub">'+(sub||'')+'</div>'+
      '<div id="zwx-sbody">'+body+'</div>'+
      (foot?'<div class="zwx-sfoot"><button class="zwx-sbtn" onclick="_zwxCancel()">取消</button><button class="zwx-sbtn go" onclick="_zwxConfirm()">確定</button></div>':'')+
      '</div>';
    if(prepare) prepare(bd.querySelector('#zwx-sbody'));
    _zwxDispose=window.JY_PICKER.mount(bd,'#zwx-sbody',_zwxCloseSheet);
  }

  function _zwxCloseSheet(){ if(_zwxDispose){ var dispose=_zwxDispose; _zwxDispose=null; dispose(); } }
  function _zwxSub(t){ var s=document.getElementById('zwx-ssub'); if(s) s.innerHTML=t; }
  function _zwxBody(h){ var b=document.getElementById('zwx-sbody'); if(b){ b.innerHTML=h; b.scrollTop=0; window.JY_PICKER.refresh(document.getElementById('zwx-sheet-bd')); } }
  window._zwxCancel=function(){ _zwxCloseSheet(); };
  window._zwxConfirm=function(){
    if(_zwxSheetType==='date'){ _zwSelDate=_zwDpY+'-'+_zwPad(_zwDpM)+'-'+_zwPad(_zwDpD); }
    _zwxClearErr(); _zwxSyncFields(); _zwxCloseSheet();
  };

  // ── 日期選擇器（1900–2100）──
  var _zwDpY=1990,_zwDpM=1,_zwDpD=1,_zwDpDec=1984;
  window._zwxOpenDate=function(){
    _zwxSheetType='date';
    if(_zwSelDate){ var p=_zwSelDate.split('-'); _zwDpY=+p[0]; _zwDpM=+p[1]; _zwDpD=+p[2]; }
    else { _zwDpY=1990; _zwDpM=1; _zwDpD=1; }
    _zwxOpenSheet('出生日期','國曆，點上方年月可快速跳轉', '', true, _zwDpDay);
  };
  function _zwDpClamp(){ var dim=_zwDim(_zwDpY,_zwDpM); if(_zwDpD>dim) _zwDpD=dim; if(_zwDpD<1) _zwDpD=1; }
  function _zwDpDay(initialBody){
    _zwDpClamp();
    var h='<div class="zwx-cal-nav"><button type="button" onclick="_zwxDpNav(-1)">‹</button>'+ 
      '<button type="button" class="zwx-cal-ttl jy-picker-title-button" onclick="_zwxDpMode(\'year\')">'+_zwDpY+' 年 '+_zwDpM+' 月 ▾</button>'+ 
      '<button type="button" onclick="_zwxDpNav(1)">›</button></div><div class="zwx-cal-table" role="grid"><div class="zwx-cal-head" role="row">';
    for(var w=0;w<7;w++) h+='<div class="zwx-cal-wk" role="columnheader">'+ZWK[w]+'</div>';
    h+='</div>';
    var fd=_zwFdow(_zwDpY,_zwDpM), dim=_zwDim(_zwDpY,_zwDpM), cells=[], i, day;
    for(i=0;i<42;i++){
      day=i-fd+1;
      if(day<1||day>dim) cells.push('<span class="zwx-cal-d empty" aria-hidden="true"></span>');
      else cells.push('<button type="button" class="zwx-cal-d'+(day===_zwDpD?' sel':'')+'" aria-pressed="'+(day===_zwDpD?'true':'false')+'" onclick="_zwxDpDay('+day+')">'+day+'</button>');
    }
    for(var r=0;r<6;r++) h+='<div class="zwx-cal-row" role="row">'+cells.slice(r*7,r*7+7).join('')+'</div>';
    h+='</div>';
    if(initialBody) initialBody.innerHTML=h;
    else { _zwxBody(h); _zwxSub('點日期，或點上方年月快速跳轉'); }
  }
  function _zwDpYear(){
    var h='<div class="zwx-yhead"><button onclick="_zwxDpDec(-1)">‹</button><span>'+_zwDpDec+' – '+(_zwDpDec+11)+'</span><button onclick="_zwxDpDec(1)">›</button></div><div class="zwx-pg y">';
    for(var y=_zwDpDec;y<_zwDpDec+12;y++){ var dis=(y<1900||y>2100);
      h+='<button type="button" class="zwx-cell'+(y===_zwDpY?' sel':'')+'"'+(dis?' disabled style="opacity:.3;pointer-events:none"':' onclick="_zwxDpYear('+y+')"')+'>'+y+'</button>'; }
    h+='</div>'; _zwxBody(h); _zwxSub('選擇年份');
  }
  function _zwDpMonth(){
    var h='<div class="zwx-pg mo">';
    for(var m=1;m<=12;m++) h+='<button type="button" class="zwx-cell'+(m===_zwDpM?' sel':'')+'" onclick="_zwxDpMonth('+m+')">'+m+' 月</button>';
    h+='</div>'; _zwxBody(h); _zwxSub('選擇月份（'+_zwDpY+' 年）');
  }
  window._zwxDpMode=function(mode){ if(mode==='year'){ _zwDpDec=Math.floor(_zwDpY/12)*12; if(_zwDpDec<1896)_zwDpDec=1896; _zwDpYear(); } else if(mode==='month'){ _zwDpMonth(); } else { _zwDpDay(); } };
  window._zwxDpNav=function(d){ var next=window.JY_PICKER.shiftMonth(_zwDpY,_zwDpM,_zwDpD,d,2100); _zwDpY=next.year; _zwDpM=next.month; _zwDpD=next.day; _zwDpDay(); };
  window._zwxDpDec=function(d){ _zwDpDec+=d*12; if(_zwDpDec<1896)_zwDpDec=1896; if(_zwDpDec>2100)_zwDpDec=2100; _zwDpYear(); };
  window._zwxDpDay=function(d){ _zwDpD=d; _zwDpDay(); };
  window._zwxDpYear=function(y){ _zwDpY=y; _zwDpClamp(); _zwDpMonth(); };
  window._zwxDpMonth=function(m){ _zwDpM=m; _zwDpClamp(); _zwDpDay(); };

  // ── 時辰選擇器（單點即選；12 時辰＋不確定）──
  window._zwxOpenHH=function(){
    _zwxSheetType='hh';
    var h='<div class="zwx-sc-grid" role="group" aria-label="十二時辰">';
    for(var i=0;i<SHICHEN.length;i++){
      var parts=SHICHEN[i].n.split(' ');
      h+='<button type="button" aria-pressed="'+((''+SHICHEN[i].h)===(''+_zwSelHH))+'" class="zwx-sc'+((''+SHICHEN[i].h)===(''+_zwSelHH)?' sel':'')+'" onclick="_zwxPickHH('+SHICHEN[i].h+')"><b>'+parts[0]+'</b><i>'+(parts[1]||'')+'</i></button>';
    }
    h+='<button type="button" class="zwx-sc wide'+(_zwSelHH==='unknown'?' sel':'')+'" onclick="_zwxPickHHU()"><b>不確定</b><i>尚未定盤</i></button>';
    h+='</div>';
    _zwxOpenSheet('出生時辰','紫微以時辰定盤，不需到分', h, false);
  };
  window._zwxPickHH=function(h){ _zwExactTime='';var el=document.getElementById('zw-exact-time');if(el)el.value='';_zwSelHH=''+h; _zwxClearErr(); _zwxSyncFields(); _zwxCloseSheet(); };
  window._zwxPickHHU=function(){ _zwExactTime='';var el=document.getElementById('zw-exact-time');if(el)el.value='';_zwSelHH='unknown'; _zwxClearErr(); _zwxSyncFields(); _zwxCloseSheet(); };


})();
