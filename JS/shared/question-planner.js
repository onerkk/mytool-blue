// Canonical question planner; embedded so both readers also work independently.
// Conservative rules expose the parsed subjects before drawing; they do not infer minds.
function analyzeReadingQuestion(value) {
  var raw=String(value||'').trim(), q=raw;
  try { q=q.normalize('NFKC'); } catch (_) {}
  var conversions={'选择':'選擇','还是':'還是','问题':'問題','关系':'關係','结婚':'結婚','同事们':'同事們','各自':'各自','未来':'未來','建议':'建議','事业':'事業','财运':'財運','工作机会':'工作機會'};
  Object.keys(conversions).forEach(function(k){q=q.split(k).join(conversions[k]);});
  function unique(xs){return xs.filter(function(x,i){return x&&xs.indexOf(x)===i;});}
  function clean(s){return s.replace(/^\s*(?:[①②③④⑤⑥]|\d+[.、)）]|(?:另外|還有|以及|也想問|請問))\s*/,'').replace(/[？?。；;]+$/,'').trim();}
  function scope(s){return (s.match(/(?:20\d{2}年|今年|明年|未來一年|未來十二個月|未來12個月|本月|下個月|本週|下週|今天|明天|年底前|月底前|(?:未來|接下來)?[一二三四五六七八九十兩\d]+(?:個月|週|天|年)(?:內|後)?)/g)||[]).join('、');}
  var decision=classifyDecisionQuestion(q), options=[];
  // Named options retain the user's exact labels and do not swallow a trailing question.
  var labels=Array.from(q.matchAll(/(?:^|[\s，,；;、])([A-F])\s*[:：]\s*([^\n，,；;]+?)(?=(?:[\s，,；;、]+[A-F]\s*[:：])|$)/g));
  if(labels.length>=2) options=labels.map(function(m){return clean(m[2].replace(/[？?].*$/,'').replace(/(?:哪個|哪一個|何者|要選哪|該選哪).*$/,''));});
  if(decision.kind==='binary')options=[decision.left,decision.right];
  if(decision.kind==='multiple'&&options.length<3){
    var surface=q.replace(/^(?:我)?(?:該|應該|應不應該|要)(?:選擇|選)?/,'').replace(/^.*?(?:選項(?:是|有)?|方案(?:是|有)?)\s*[:：]/,'').replace(/(?:我)?(?:應該|應|該)?(?:選擇|選|要選|要)(?=[^，,；;]*還是)/,'').replace(/(?:哪個|哪一個|何者|三選一|四選一|五選一|六選一|比較適合|比較好|較適合).*$/,'');
    options=surface.split(/、|還是|或是|或者|[，,；;\n]/).map(clean).filter(Boolean);
    if(options.some(function(s){return s.length>60;})||options.length<3)options=[];
  }
  options=unique(options);
  var parts=q.split(/[？?。；;\n]+|[，,](?=(?:另外|還有|以及|也想問|至於))/).map(clean).filter(Boolean);
  var peoplePattern=/(?:女友|男友|伴侶|朋友)的?(?:閨蜜|好友|朋友)|(?:[A-F甲乙丙丁]\s*)?(?:公司)?(?:異性|女性|男性|女|男)?同事(?:\s*[A-F甲乙丙丁])?|前任|前男友|前女友|女友|男友|伴侶|主管|客戶/g;
  function people(s){var matches=s.match(peoplePattern)||[];return unique(matches);}
  var actors=people(q),namedPair=q.match(/([^，,。？?；;\n]{1,18}?)(?:與|和|跟|、)([^，,。？?；;\n]{1,18}?)[，,]?(?:各自|分別)/);if(actors.length<2&&namedPair)actors=unique([clean(namedPair[1].replace(/^(?:請問|我想問|幫我看)/,'')),clean(namedPair[2])]);
  var globalScope=scope(parts[0]||q), groups=[];
  function group(s,entity){return {id:'SUBJECT_'+(groups.length+1),question:s,entity:entity||'',scope:scope(s)||globalScope,scopeInherited:!!(!scope(s)&&globalScope)};}
  var follow=/^(?:那|又|並且|以及|另外)?(?:我|我們)?(?:應該|該)?(?:有什麼(?:阻礙|方法)|為什麼|為何|原因|阻礙|障礙|怎麼|如何|何時|什麼時候|多久|結果|走向|後續|若有|如果有|他的?幾歲|她的?幾歲|他幾歲|她幾歲|對方幾歲|長相|年齡|該怎麼)/;
  if(!options.length&&parts.length){
    parts.forEach(function(part){
      if(/^(?:請)?(?:用|使用|採用|不要用|不用).{0,15}(?:牌陣|張線|九宮格)$/.test(part))return;
      var prev=groups[groups.length-1], ps=people(part), distinct=prev&&ps.length&&ps.some(function(p){return prev.entity.indexOf(p)<0;});
      var isQuestion=/嗎|是否|會不會|有沒有|能不能|可不可以|能否|會否|如何|怎樣|怎麼|運勢|走向|發展|何時|多久|哪|誰|請分析|幫我看|結婚|交往|同意/.test(part);
      if(prev&&!distinct&&(follow.test(part)||!isQuestion))prev.question+='；'+part;
      else groups.push(group(part,ps.join('、')));
    });
    // Only explicit distributive language splits several named people in one sentence.
    if(groups.length===1&&actors.length>=2&&/各自|分別|每個|每位/.test(q)){
      groups=actors.map(function(actor,i){return {id:'SUBJECT_'+(i+1),question:actor+'：'+q,entity:actor,scope:globalScope,scopeInherited:false};});
    }
  }
  var notes=[];
  if(options.length>6||groups.length>6)notes.push('本次最多分開六個分支；請將問題分批，避免省略後面的子題。');
  if(decision.kind==='multiple'&&!options.length)notes.push('尚未辨識完整選項；請用 A：…；B：…；C：… 列出。');
  var mode=options.length>2?'multi_option':options.length===2?'binary':groups.length>1?'multi_question':'single';
  var firstOptionAt=options.length?q.indexOf(options[0]):-1,choiceScope=firstOptionAt>=0?scope(q.slice(0,firstOptionAt)):'';
  var branches=options.length?options.map(function(s,i){return {id:'OPTION_'+(i+1),question:s,entity:s,scope:scope(s)||choiceScope,scopeInherited:!scope(s)&&!!choiceScope};}):groups;
  return {version:'1.0.0',originalQuestion:raw,normalizedQuestion:q,mode:mode,decisionKind:decision.kind,options:options,actors:actors,branches:branches,ready:branches.length<=6&&!(decision.kind==='multiple'&&!options.length),notes:notes,scope:globalScope,monthly:/(?:每個月|每月|各月份)(?:的)?(?:運勢|趨勢|走向|主題|提醒|工作|感情|財運|牌|$)|逐月|(?:十二|12)個月(?:的)?(?:運勢|趨勢|主題)|月份牌陣/.test(q),daily:/今天|今日|每日|日常提醒/.test(q)&&!/嗎|會不會|是否|結果|何時/.test(q)};
}
function recommendReadingSystem(question) {
  var q=String(question||'').trim(), plan=analyzeReadingQuestion(q);
  if(!q)return {system:null,label:'',reason:'輸入問題後推薦',plan:plan};
  var rules=[['lenormand','雷諾曼',/雷諾曼|雷诺曼|lenormand/i],['tarot','塔羅',/塔羅|塔罗|tarot|RWS|Book\s*T|Golden\s*Dawn/i],['oracle','靈籤',/靈籤|灵签|求籤|求签|籤詩|签诗/],['meihua','梅花易數',/梅花|易經|易经|起卦/],['ziwei','紫微斗數',/紫微/],['bazi','八字',/八字|四柱|大運|大运/],['astro','西洋占星',/星盤|星盘|占星|行星|上升星座/]];
  var requests=[];
  q.split(/[，,。；;！？?\n]/).forEach(function(clause,order){
    rules.forEach(function(rule){var m=clause.match(rule[2]);if(!m)return;var before=clause.slice(0,m.index);
      if(/(?:不要(?:用|使用)?|不用|不使用|不想用|別用|排除)\s*$/.test(before)||/以前|上次|之前|曾經/.test(before))return;
      if(!before.trim()||/(?:用|使用|採用|改用|想用|請)\s*$/.test(before))requests.push({rule:rule,order:order,at:m.index});
    });
  });
  requests.sort(function(a,b){return a.order-b.order||a.at-b.at;});
  var explicit=requests.length?requests[requests.length-1].rule:null;
  var result;
  if(explicit)result={system:explicit[0],label:explicit[1],reason:'依你明確指定的解讀系統',explicit:true};
  else if(/出生|命格|一生|先天|流年|命盤/.test(q))result={system:'bazi',label:'八字／紫微',reason:'問題重點是先天傾向或長期週期，需先提供出生資料'};
  else if(/指引|啟示|提醒|該以什麼心態/.test(q)&&!/(?:感受|內心|心理|原因)/.test(q))result={system:'oracle',label:'靈籤',reason:'你要的是一個主題的提醒與行動方向'};
  else if(/內心|感受|心態|自我|心理|關係|暗戀|愛我|喜歡我|為什麼|抉擇|該不該/.test(q)||plan.options.length)result={system:'tarot',label:'塔羅',reason:'適合分開看處境、互動、阻力與選擇條件'};
  else if(/聯絡|消息|包裹|合約|工作|搬家|會面|何時|進展|事情|尋物|遺失/.test(q))result={system:'lenormand',label:'雷諾曼',reason:'問題聚焦具體事件、連續發展與周邊條件'};
  else result={system:'tarot',label:'塔羅',reason:'開放式問題先以具名牌位整理重點'};
  result.plan=plan;result.readingMode='rws_reversals';
  q.split(/[，,。；;！？?\n]/).forEach(function(clause){
    var m=clause.match(/Book\s*T|Golden\s*Dawn|黃金黎明|元素尊貴|RWS|正逆位/i);if(!m)return;
    var before=clause.slice(0,m.index);if(/以前|上次|之前|曾經/.test(before))return;
    var neg=/(?:不要(?:用|使用)?|不用|不使用|不想用|別用|排除)\s*$/.test(before),rws=/RWS|正逆位/i.test(m[0]);
    if(!neg)result.readingMode=rws?'rws_reversals':'gd_book_t';
  });
  result.birthDataRequired=/^(bazi|ziwei|astro)$/.test(result.system);
  return result;
}
