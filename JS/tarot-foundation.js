/*! tarot-foundation.js — Golden Dawn Tarot v98 semantic foundation
 * 單一真相來源：問題型別化、觀測需求、牌陣能力、動態牌位綁定與自動路由。
 * 牌義不在本檔；牌義只由 golden-dawn-tarot.js 的 Book T 核心提供。
 */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.JYTarotFoundation = api;
})(typeof globalThis !== 'undefined' ? globalThis : (typeof window !== 'undefined' ? window : this), function () {
  'use strict';

  var VERSION = '98.0.0';
  var SCHEMA = 'jy.tarot.foundation/3';

  function text(v) { return v == null ? '' : String(v).trim(); }
  function clone(v) { return v == null ? v : JSON.parse(JSON.stringify(v)); }
  function pad(n, w) { return String(n).padStart(w, '0'); }
  function range(a, b) { var out=[]; for(var i=a;i<b;i+=1) out.push(i); return out; }
  function uniq(arr, keyFn) {
    var seen=Object.create(null), out=[];
    (arr||[]).forEach(function(v){ var k=keyFn?keyFn(v):(typeof v==='string'?v:JSON.stringify(v)); if(!seen[k]){seen[k]=1;out.push(v);} });
    return out;
  }
  function setOf(arr){var s=Object.create(null);(arr||[]).forEach(function(x){s[x]=1;});return s;}
  function hasAll(have, need){var h=setOf(have);return (need||[]).every(function(x){return !!h[x];});}
  function difference(a,b){var bs=setOf(b);return (a||[]).filter(function(x){return !bs[x];});}
  function normalize(q) {
    q=text(q); try{if(q.normalize)q=q.normalize('NFKC');}catch(_e){}
    var map={
      '为什么':'為什麼','为何':'為何','什么时候':'什麼時候','关系':'關係','选择':'選擇','还是':'還是','整体':'整體','发展':'發展','事业':'事業','财运':'財運','结果':'結果','复合':'復合','对象':'對象','对方':'對方','问题':'問題','建议':'建議','阻碍':'阻礙','未来':'未來','现在':'現在','过去':'過去','职业':'職業','离职':'離職','创业':'創業','全年':'全年','运势':'運勢','营业额':'營業額','营收':'營收','利润':'利潤','这月':'這月','这个月':'這個月','下个月':'下個月','本月':'本月'
    };
    Object.keys(map).forEach(function(k){q=q.split(k).join(map[k]);});
    return q.replace(/[\u3000\t\r\n]+/g,' ').replace(/\s+/g,' ').trim();
  }
  function dateParts(value) {
    var d=value?new Date(value):new Date(); if(isNaN(d.getTime()))d=new Date();
    return {date:d,year:d.getFullYear(),month:d.getMonth()+1,day:d.getDate(),iso:d.getFullYear()+'-'+pad(d.getMonth()+1,2)+'-'+pad(d.getDate(),2)};
  }
  function monthBounds(year,month){var end=new Date(year,month,0).getDate();return {label:year+'年'+month+'月',start:year+'-'+pad(month,2)+'-01',end:year+'-'+pad(month,2)+'-'+pad(end,2)};}
  function addMonths(year,month,offset){var d=new Date(year,month-1+offset,1);return {year:d.getFullYear(),month:d.getMonth()+1};}

  var OBSERVABLES = {
    state:'現況／核心狀態', realization:'成立與否的定性裁決', trajectory:'後續發展傾向', conditional_outcome:'維持條件下的結果',
    bounded_outcome:'明示期限終點的條件性結果', threshold_outcome:'單一指標對固定門檻的跨越', comparison_outcome:'兩個獨立對象或路徑的同尺度比較',
    cause:'形成機制', antecedent:'前置影響', obstacle:'阻礙／限制', enabler:'助力／推動力', advice:'可介入行動',
    dyad:'已知雙方與關係通道', temporal_sequence:'相對時間序列', annual_overview:'年度跨領域總覽', domain_coverage:'多領域分隔觀測',
    hidden:'隱藏作用', external:'外在條件', location:'尋物／位置線索', structural_depth:'深層結構', narrative:'長敘事歷程', exhaustive:'廣泛完整程序'
  };

  function methodDef(id,label,count,slots,dignityLines,dependencies,provides,specialties,layoutSource,compatibilityEdges){
    var declared=uniq(provides||[]), hasBindableOutcome=(slots||[]).some(function(slot){return !!slot&&(slot.authority==='outcome'||slot.authority==='bounded_outcome');});
    // 有明示結果位的方法，可把該結果位綁定到使用者提供的截止範圍；這是位置權限，不是額外牌義。
    if(hasBindableOutcome)declared=uniq(declared.concat(['bounded_outcome']));
    return {id:id,label:label,count:count,slots:slots,dignityLines:dignityLines||[],dependencies:dependencies||[],compatibilityEdges:compatibilityEdges||[],provides:declared,specialties:uniq(specialties||[]),layoutSource:layoutSource||'後世觀測布局；不得冒充 Book T 原創'};
  }
  var METHODS = {
    three_card: methodDef('three_card','三牌陣',3,[
      {authority:'antecedent',role:'basis'},{authority:'state',role:'current_state'},{authority:'outcome',role:'conditional_outcome'}
    ],[[0,1,2]],[[0,1,2]],['state','antecedent','trajectory','conditional_outcome','realization'],['simple','yes_no','single_topic']),
    five_card: methodDef('five_card','五牌事件陣',5,[
      {authority:'state',role:'current_state'},{authority:'cause',role:'cause'},{authority:'obstacle',role:'constraint'},{authority:'advice',role:'intervention'},{authority:'outcome',role:'conditional_outcome'}
    ],[[1,0,2],[3,0,4]],[[1,0,2],[3,2,0,4]],['state','cause','obstacle','enabler','advice','trajectory','conditional_outcome','bounded_outcome','threshold_outcome','realization'],['threshold','bounded','cause','advice','single_domain_year']),
    cross: methodDef('cross','十字牌陣',5,[
      {authority:'state',role:'core_state'},{authority:'interaction_force',role:'crossing_force'},{authority:'antecedent',role:'prior_influence'},{authority:'development',role:'future_tendency'},{authority:'advice',role:'intervention'}
    ],[[2,0,3],[4,0,1]],[[0,1],[2,0,3],[4,0,1]],['state','antecedent','obstacle','enabler','advice','trajectory'],['conflict','stuck']),
    either_or: methodDef('either_or','雙路比較牌陣',5,[
      {authority:'state',role:'comparison_context'},{authority:'comparison',role:'branch_A_state'},{authority:'comparison',role:'branch_B_state'},{authority:'outcome',role:'branch_A_outcome'},{authority:'outcome',role:'branch_B_outcome'}
    ],[[0,1,3],[0,2,4]],[[0,1,3],[0,2,4]],['state','trajectory','comparison_outcome','conditional_outcome','realization'],['choice','comparison']),
    relationship: methodDef('relationship','關係牌陣',6,[
      {authority:'state',role:'querent_state'},{authority:'person_aggregate',role:'counterpart_state'},{authority:'state',role:'relation_state'},{authority:'obstacle',role:'relation_constraint'},{authority:'advice',role:'intervention'},{authority:'outcome',role:'relation_outcome'}
    ],[[0,2,1],[4,3,2,5]],[[0,1,2],[3,2],[4,3,2,5]],['state','dyad','obstacle','advice','trajectory','conditional_outcome','realization','external'],['dyad','relationship']),
    timeline: methodDef('timeline','相對時間線',5,[
      {authority:'antecedent',role:'prior_stage'},{authority:'timeline',role:'near_stage'},{authority:'timeline',role:'turning_point'},{authority:'timeline',role:'later_stage'},{authority:'development',role:'terminal_tendency'}
    ],[[0,1,2,3,4]],[[0,1,2,3,4]],['state','antecedent','trajectory','temporal_sequence','realization'],['timing']),
    horseshoe: methodDef('horseshoe','七張馬蹄形',7,[
      {authority:'antecedent',role:'prior_influence'},{authority:'state',role:'current_state'},{authority:'structural',role:'hidden_influence'},{authority:'advice',role:'intervention'},{authority:'environment',role:'external_condition'},{authority:'obstacle',role:'constraint'},{authority:'outcome',role:'conditional_outcome'}
    ],[[0,1,2,3,4,5,6]],[[0,1,2],[4,5],[3,4,5,6]],['state','antecedent','hidden','external','obstacle','advice','trajectory','conditional_outcome','realization'],['hidden','external','complex_event']),
    celtic_cross: methodDef('celtic_cross','凱爾特十字',10,[
      {authority:'state',role:'core_state'},{authority:'interaction_force',role:'crossing_force'},{authority:'structural',role:'possible_formation'},{authority:'cause',role:'root_mechanism'},{authority:'timeline',role:'receding_stage'},{authority:'timeline',role:'approaching_stage'},{authority:'state',role:'querent_state'},{authority:'environment',role:'external_condition'},{authority:'state',role:'expectation_or_fear'},{authority:'outcome',role:'conditional_outcome'}
    ],[[4,0,5],[3,0,2],[6,7,8,9]],[[0,1],[3,0,2],[4,0,5],[6,7,8,9],[8,9]],['state','cause','antecedent','hidden','external','obstacle','enabler','advice','trajectory','conditional_outcome','realization','structural_depth'],['deep_overview','single_complex'],undefined,[[0,1]]),
    tree_of_life: methodDef('tree_of_life','生命之樹',10,new Array(9).fill(null).map(function(){return {authority:'structural',role:'qabalistic_layer'};}).concat([{authority:'outcome',role:'material_manifestation'}]),[[1,3,6],[2,4,7],[0,5,8,9]],[[1,3,6],[2,4,7],[0,5,8,9]],['state','cause','advice','hidden','trajectory','structural_depth'],['pattern','spiritual','deep_structure'],'後世卡巴拉觀測布局；不得冒充 Book T 原創占卜程序'),
    zodiac: methodDef('zodiac','黃道十二宮',13,new Array(12).fill(null).map(function(){return {authority:'domain',role:'house_domain'};}).concat([{authority:'synthesis',role:'annual_synthesis'}]),[],[[0,6],[1,7],[2,8],[3,9],[4,10],[5,11]],['state','annual_overview','domain_coverage','trajectory','external'],['annual','domains'],'後世占星宮位觀測布局；不得冒充 Book T 原創占卜程序'),
    minor_arcana: methodDef('minor_arcana','小阿卡那實務牌陣',7,[
      {authority:'state',role:'current_state'},{authority:'cause',role:'cause'},{authority:'obstacle',role:'constraint'},{authority:'environment',role:'external_condition'},{authority:'state',role:'available_resource'},{authority:'advice',role:'intervention'},{authority:'outcome',role:'conditional_outcome'}
    ],[[1,0,2],[3,4,5,6]],[[1,0,2],[3,4,5,6]],['state','cause','obstacle','external','advice','trajectory','conditional_outcome','realization','location'],['practical','location'],'後世觀測布局；牌組限制為小阿卡那，牌義仍採 Book T'),
    fifteen_card: methodDef('fifteen_card','金色黎明衍生十五張',15,[
      {authority:'state',role:'core_state'},{authority:'state',role:'core_support'},{authority:'state',role:'core_support'},
      {authority:'development',role:'natural_path'},{authority:'development',role:'alternative_path'},{authority:'advice',role:'decision_basis'},{authority:'structural',role:'uncontrolled_condition'},
      {authority:'development',role:'natural_path'},{authority:'development',role:'alternative_path'},{authority:'advice',role:'decision_basis'},{authority:'structural',role:'uncontrolled_condition'},
      {authority:'development',role:'natural_path'},{authority:'development',role:'alternative_path'},{authority:'advice',role:'decision_basis'},{authority:'structural',role:'uncontrolled_condition'}
    ],[[1,0,2],[3,7,11],[12,8,4],[5,9,13],[6,10,14]],[[1,0,2],[3,7,11],[12,8,4],[5,9,13],[6,10,14]],['state','cause','advice','trajectory','conditional_outcome','comparison_outcome','domain_coverage','hidden','external','structural_depth'],['multi_domain','wide_overview'],'後世金色黎明衍生布局；牌義與尊貴仍鎖定 Book T'),
    mathers_21: methodDef('mathers_21','Mathers 二十一張',21,new Array(21).fill(null).map(function(){return {authority:'structural',role:'ordered_narrative'};}),[range(0,7),range(7,14),range(14,21)],[range(0,7),range(7,14),range(14,21)],['state','antecedent','cause','trajectory','conditional_outcome','narrative','hidden','external'],['narrative'],'Mathers 歷史布局；牌義與尊貴仍鎖定 Book T'),
    mathers_horseshoe: methodDef('mathers_horseshoe','Mathers 五十四張',54,new Array(54).fill(null).map(function(){return {authority:'structural',role:'ordered_group'};}),[range(0,26),range(26,43),range(43,54)],[range(0,26),range(26,43),range(43,54)],['state','antecedent','cause','trajectory','conditional_outcome','narrative','exhaustive','domain_coverage','hidden','external'],['exhaustive'],'Mathers 歷史布局；牌義與尊貴仍鎖定 Book T'),
    ootk: methodDef('ootk','Opening of the Key 五次操作',null,new Array(5).fill(null).map(function(){return {authority:'stage',role:'operation_stage'};}),[],[],['state','antecedent','cause','advice','trajectory','conditional_outcome','realization','hidden','external','domain_coverage','structural_depth','narrative','exhaustive'],['ootk','exhaustive'],'Golden Dawn《Book T／Liber T》程序')
  };

  function method(id){return clone(METHODS[id]||null);}
  function dignityLines(id,count){var m=METHODS[id];return m?clone(m.dignityLines||[]):(count?[range(0,count)]:[]);}
  function dependencyGroups(id,count){var m=METHODS[id];return m?clone(m.dependencies||[]):(count?[range(0,count)]:[]);}
  function compatibilityEdges(id){var m=METHODS[id];return m?clone(m.compatibilityEdges||[]):[];}

  function detectScopes(q, referenceDate, timezone) {
    var d=dateParts(referenceDate), out=[], n=0;
    function add(surface,kind,resolved,bounded){if(!surface)return;var key=surface+'|'+kind;if(out.some(function(x){return x._key===key;}))return;out.push({id:'S'+pad(++n,2),surface:surface,source:surface,type:'time_scope',kind:kind,resolved:resolved||null,bounded:!!bounded,timezone:timezone||'local',_key:key});}
    [{re:/今年/g,off:0},{re:/明年/g,off:1},{re:/去年/g,off:-1}].forEach(function(x){var m;while((m=x.re.exec(q))){var y=d.year+x.off;add(m[0],'calendar_year',{label:y+'年',start:y+'-01-01',end:y+'-12-31',anchor:d.iso},true);}});
    var ym,yre=/(20\d{2})\s*年/g;while((ym=yre.exec(q))){var yy=Number(ym[1]);add(ym[0],'calendar_year',{label:yy+'年',start:yy+'-01-01',end:yy+'-12-31',anchor:d.iso},true);}
    var monthDefs=[{re:/(?:本月|這月|這個月)/g,off:0},{re:/下個月/g,off:1},{re:/上個月/g,off:-1}];
    monthDefs.forEach(function(x){var m;while((m=x.re.exec(q))){var mm=addMonths(d.year,d.month,x.off),b=monthBounds(mm.year,mm.month);b.anchor=d.iso;add(m[0],'calendar_month',b,true);}});
    var rel=q.match(/(?:本週|這週|下週|今天|明天|後天|近期|短期|長期|未來|過去|目前|現在|年底前|年內|月底前|\d+\s*(?:天|週|個月)(?:內|後|前)?|\d+\s*年(?:內|後|前))/g)||[];
    rel.forEach(function(s){add(s,'relative_scope',{label:s,anchor:d.iso},/(?:前|內|月底|年底|年內)/.test(s));});
    return out.map(function(x){delete x._key;return x;});
  }

  function detectDomains(q){
    var defs=[
      ['relationship',/感情|愛情|婚姻|桃花|戀愛|復合|伴侶|關係|前任|現任|男友|女友|love|romance|relationship|marriage/i],
      ['career',/工作|事業|職場|轉職|離職|升遷|副業|創業|生意|賣場|career|job|work|business/i],
      ['finance',/財運|金錢|財務|投資|收入|營業額|營收|薪水|獲利|利潤|現金流|money|finance|income|revenue/i],
      ['health',/健康|身體|疾病|手術|藥物|睡眠|health|illness|surgery|sleep/i],
      ['family',/家庭|家人|父母|小孩|子女|家宅|family|parents|children|home/i],
      ['study',/學業|考試|進修|學習|證照|書面|溝通|study|exam|school|certificate|learning/i],
      ['legal',/法律|訴訟|官司|合約|law|legal|court case|contract/i],
      ['travel',/旅行|出國|搬家|移動|行程|travel|move|relocate/i]
    ];
    return defs.filter(function(d){return d[1].test(q);}).map(function(d){return d[0];});
  }
  function isNominalWeiHe(q){return /(?:運勢|走向|結果|結局|狀況|情形|前景|發展|現況|狀態|影響|意義|主題)為何[？?]?$/.test(q.replace(/\s/g,''));}
  function detectIntent(q,scopes,domains){
    var compact=q.replace(/\s/g,'');
    var causal=/為什麼|什麼原因|原因(?:是|為何|在哪)|根源|問題出在|怎麼會|why\b|root cause/i.test(q)||/(?:^|[，。！？?])為何(?:會|總是|一直|無法|不能|沒有|不|變|發生|出現|造成)/.test(q);
    if(isNominalWeiHe(q))causal=false;
    var choice=/還是|或者|或是|二選一|哪一個|哪個比較|choose between|which option|\bvs\.?\b|\bversus\b/i.test(q);
    var timing=/什麼時候|何時|幾時|哪一天|幾月|多久|要等|時間點|when\b|how long|what date|which month/i.test(q);
    var advice=/怎麼做|怎麼辦|如何改善|建議|策略|方法|該怎麼|下一步|應如何|怎麼找|如何找|what should|what can i do|advice|strategy/i.test(q);
    var hidden=/忽略|盲點|隱藏|背後|未察覺|不知道的|overlook|hidden influence|blind spot/i.test(q);
    var external=/外在|環境|市場|公司環境|家庭影響|別人影響|他人態度|external|environment|market condition/i.test(q);
    var pattern=/為什麼一直|總是|每次都|反覆|重複|循環|模式|always|every time|repeating pattern/i.test(q);
    var spiritual=/靈性|業力|課題|天命|使命|潛意識|靈魂|內在陰影|spiritual|karma|soul|life purpose|subconscious/i.test(q);
    var narrative=/來龍去脈|前因後果|從頭到尾|始末|完整歷程|過去.{0,8}現在.{0,8}未來|whole story|from the beginning|past.*present.*future/i.test(q);
    var exhaustive=/全部攤開|最完整|徹底|人生大局|整個人生|所有人生面向|most exhaustive|complete life reading|everything about my life/i.test(q);
    var deepOverview=/完整|全面|深入|詳細|全局|大局|所有影響|整體局勢|comprehensive|full picture|in depth/i.test(q);
    var practical=/(?:東西|鑰匙|錢包|手機|文件|證件).{0,10}(?:遺失|不見|掉|找不到|在哪|位置)|(?:遺失|不見|掉了|找不到).{0,10}(?:東西|鑰匙|錢包|手機|文件|證件)|包裹|快遞|訂單|報稅|證件|維修|退貨|寄件|出貨|lost item|package|delivery|repair|refund/i.test(q);
    var location=/在哪(?:裡|邊)?|位置|何處|哪個方向|where\b|location/i.test(q);
    var conflict=/卡住|阻礙|衝突|拉扯|困境|僵局|競爭|壓力|對立|stuck|conflict|blocked/i.test(q);
    var yearScope=(scopes||[]).some(function(s){return s.kind==='calendar_year';}), domainCount=(domains||[]).length;
    var annualWords=/流年|全年|整年|一整年|年度|年運|整體運勢|各方面運勢|各領域運勢|overall outlook|yearly|annual/i;
    var bareYearFortune=yearScope&&domainCount===0&&/(?:今年|明年|20\d{2}年).{0,8}運勢(?:為何|如何|怎樣|怎麼樣)?/i.test(q);
    var annual=yearScope&&(annualWords.test(q)||bareYearFortune), annualSingleDomain=yearScope&&domainCount===1&&!annual;
    var knownDyad=/我(?:和|與|跟).{1,24}|(?:對方|他|她|現任|前任|伴侶|配偶|男友|女友|主管|老闆|同事|朋友|客戶).{0,12}(?:對我|跟我|和我|與我|怎麼看我|的態度|的想法|的關係)|between us|my partner|my ex|my boss/i.test(q);
    var unknownPerson=/有人|某人|哪個人|誰會|新對象|未來對象|桃花|暗戀我|喜歡我嗎|追求我|future partner|anyone likes me|who will/i.test(q)&&!knownDyad;
    var yesNo=/嗎[？?]?\s*$|^(?:會不會|有沒有|該不該|可不可以|能不能|能否|是否|可否|是不是|適不適合|要不要)|will\b|can\b|should\b|is\b|are\b/i.test(q);
    var descriptive=isNominalWeiHe(q)||/如何[？?]?$|怎麼樣[？?]?$|怎樣[？?]?$|狀況如何|運勢如何|走向如何|what is .* like|how is/i.test(q);
    var multiDomain=domainCount>=2&&/整體|全面|各方面|一起看|都看|同時|以及|和|與|both|all areas|together/i.test(q);
    return {causal:causal,choice:choice,timing:timing,advice:advice,hidden:hidden,external:external,pattern:pattern,spiritual:spiritual,narrative:narrative,exhaustive:exhaustive,deepOverview:deepOverview,practical:practical,location:location,conflict:conflict,annual:annual,annualSingleDomain:annualSingleDomain,knownDyad:knownDyad,unknownPerson:unknownPerson,yesNo:yesNo,descriptive:descriptive,multiDomain:multiDomain};
  }

  var CN_DIGIT={'零':0,'〇':0,'一':1,'二':2,'兩':2,'三':3,'四':4,'五':5,'六':6,'七':7,'八':8,'九':9};
  var CN_UNIT={'十':10,'百':100,'千':1000,'萬':10000,'億':100000000};
  function parseChineseNumber(s){
    s=text(s).replace(/[,，\s]/g,''); if(!s)return null;
    if(/^\d+(?:\.\d+)?$/.test(s))return Number(s);
    if(/^\d+(?:\.\d+)?[萬億]$/.test(s)){var u=s.slice(-1);return Number(s.slice(0,-1))*CN_UNIT[u];}
    var total=0,section=0,number=0,seen=false;
    for(var i=0;i<s.length;i+=1){var ch=s[i];if(CN_DIGIT[ch]!=null){number=CN_DIGIT[ch];seen=true;continue;}var unit=CN_UNIT[ch];if(!unit)return null;seen=true;if(unit===10000||unit===100000000){section+=(number||0);if(section===0)section=1;total+=section*unit;section=0;number=0;}else{if(number===0)number=1;section+=number*unit;number=0;}}
    return seen?total+section+number:null;
  }
  function cleanCore(q,scopes){var out=q.replace(/[？?。！!，,]+$/,'');(scopes||[]).forEach(function(s){out=out.split(s.surface).join('');});return text(out);}
  function stripQuestionPrefix(v){return text(v).replace(/^(?:請|幫我|請幫我|想問|我想問)\s*/,'').replace(/^(?:我|本人)(?:的)?/,'').replace(/^(?:該|應該|要不要|是否要|是否該)\s*/,'').trim();}
  function stripModalTail(v){return text(v).replace(/(?:一定|必然|應該|可能|會不會|能不能|可不可以|是否|有沒有|可以|能夠|會|能)+$/g,'').trim();}
  function metricName(v){var m=text(v).match(/(營業額|營收|收入|薪水|獲利|利潤|成本|價格|金額|數量|人數|成績|表現|速度|高度|重量|價值|程度)$/);return m?m[1]:'';}
  function splitEntityMetric(v){var m=text(v).match(/^(.+?)(?:的)?(營業額|營收|收入|薪水|獲利|利潤|成本|價格|金額|數量|人數|成績|表現|速度|高度|重量|價值|程度)$/);return m?{entity:text(m[1]),metric:m[2]}:{entity:text(v),metric:''};}

  function scaleLabel(v){return v==='suitability'?'適合度':(v==='model_resolve_same_scale'?'同一可比較尺度':text(v));}
  function queryOperatorLabel(v){var map={truth_or_realization:'是否成立',choice:'選擇較適合者',qualitative_description:'描述狀態與走向',cause_explanation:'說明原因／形成機制',relative_timing:'判斷相對時序',location_guidance:'判斷位置線索',action_guidance:'提出可介入方向'};return map[v]||text(v);}

  function detectNumericThreshold(q,scopes){
    var core=cleanCore(q,scopes);
    var re=/(.*?)(營業額|營收|收入|薪水|獲利|利潤|成本|價格|金額|數量|人數|成績|表現|速度|高度|重量|價值|程度)(?:是否|能否|可否|能不能|可不可以|會不會|可以|能夠|可能|會|能)?\s*(不超過|至多|低於|小於|少於|破|超過|高於|大於|達到|至少)\s*([0-9][0-9,]*(?:\.[0-9]+)?(?:萬|億)?|[零〇一二兩三四五六七八九十百千萬億]+)/;
    var m=core.match(re); if(!m)return null;
    var subject=stripQuestionPrefix(m[1]), metric=m[2], opText=m[3], thresholdSurface=m[4], value=parseChineseNumber(thresholdSurface);
    if(!subject||value==null)return null;
    var op=(opText==='破'||opText==='超過'||opText==='高於'||opText==='大於')?'gt':(opText==='達到'||opText==='至少')?'gte':(opText==='不超過'||opText==='至多')?'lte':'lt';
    return {id:'R01',type:'fixed_numeric_threshold',subject:subject,metric:metric,operator:op,operatorText:opText,thresholdValue:value,thresholdSurface:thresholdSurface,source:m[0]};
  }
  function detectRelation(q,scopes){
    var numeric=detectNumericThreshold(q,scopes);if(numeric)return numeric;
    var core=cleanCore(q,scopes);
    var c=core.match(/(.{1,36}?)\s*(?:還是|或是|或者|\bor\b)\s*(.{1,36}?)(?:比較|較|更)?(?:好|適合|有利|可行|嗎|呢|？|\?|$)/i);
    if(c)return {id:'R01',type:'alternative_comparison',operator:'choose',operatorText:'還是',left:stripModalTail(stripQuestionPrefix(c[1])),right:stripModalTail(c[2]),scale:'suitability',source:c[0]};
    var patterns=[{re:/(.{1,48}?)\s*(超過|高於|大於|多於)\s*(.{1,48}?)(?:嗎|呢|？|\?|$)/,op:'gt'},{re:/(.{1,48}?)\s*(低於|小於|少於|不及)\s*(.{1,48}?)(?:嗎|呢|？|\?|$)/,op:'lt'},{re:/(.{1,48}?)\s*(等於|相同於|一樣多|持平)\s*(.{1,48}?)(?:嗎|呢|？|\?|$)/,op:'eq'},{re:/(.{1,36}?)\s*比\s*(.{1,36}?)\s*(更|較)(.{1,20}?)(?:嗎|呢|？|\?|$)/,op:'comparative'}];
    for(var i=0;i<patterns.length;i+=1){var m=core.match(patterns[i].re);if(!m)continue;if(patterns[i].op==='comparative')return {id:'R01',type:'entity_comparison',operator:'comparative',operatorText:m[3]+m[4],left:stripModalTail(stripQuestionPrefix(m[1])),right:stripModalTail(m[2]),scale:text(m[4]),source:m[0]};
      var lm=splitEntityMetric(stripModalTail(stripQuestionPrefix(m[1]))),rm=splitEntityMetric(stripModalTail(m[3]));return {id:'R01',type:'entity_comparison',operator:patterns[i].op,operatorText:m[2],left:lm.entity,right:rm.entity,scale:lm.metric||rm.metric||'model_resolve_same_scale',source:m[0]};}
    return null;
  }

  function queryTarget(q,scopes,intent){
    var core=cleanCore(q,scopes);core=core.replace(/^(?:我|本人)(?:的)?/,'').replace(/^(?:請|幫我|請幫我|想問|我想問)\s*/,'').replace(/^想(?:要)?(?:完整|全面|深入|詳細)?(?:知道|了解|看看|詢問|問)\s*/,'').replace(/^把(?:我|本人)?(?:的)?\s*/,'');
    if(intent.causal)core=core.replace(/^(?:為什麼|為何|什麼原因|怎麼會)/,'');
    if(intent.timing)core=core.replace(/^(?:什麼時候|何時|幾時|多久)/,'').replace(/^(?:會|能|可以|可能)/,'');
    core=core.replace(/(?:為何|如何|怎麼樣|怎樣|是什麼|會怎樣|會如何|會怎麼發展|嗎|呢)$/,'').replace(/(?:徹底)?攤開$/,'');
    if(intent.location)core=core.replace(/(?:在)?哪(?:裡|邊)|何處|什麼位置|哪個方向/g,'位置');
    if(intent.advice)core=core.replace(/(?:我)?(?:該|應該)?(?:怎麼做|怎麼辦|如何改善|下一步|怎麼找|如何找)$/,'');
    return text(core)||'整體事件／狀態';
  }

  function buildShape(intent,relation,scopes,domains){
    if(intent.exhaustive)return 'exhaustive'; if(intent.narrative)return 'narrative'; if(intent.annual)return 'annual'; if(intent.annualSingleDomain&&!intent.timing)return 'annual_single_domain';
    if(relation&&relation.type==='alternative_comparison')return 'choice'; if(relation&&relation.type==='entity_comparison')return 'comparison'; if(relation&&relation.type==='fixed_numeric_threshold')return 'threshold';
    if(intent.knownDyad)return 'dyad'; if(intent.timing)return 'timing'; if(intent.location)return 'location'; if(intent.pattern||intent.spiritual)return 'deep_structure';
    if(intent.multiDomain)return 'multi_domain'; if(intent.hidden||intent.external)return 'hidden_external'; if(intent.deepOverview)return 'deep_overview'; if(intent.conflict)return 'conflict';
    if(intent.causal||intent.advice)return 'cause_action'; if((scopes||[]).some(function(s){return s.bounded;})&&intent.yesNo)return 'bounded_yes_no'; if(intent.yesNo)return 'yes_no'; return 'simple';
  }
  function requiredObservables(intent,relation,scopes,domains,shape){
    var req=['state'];
    if(intent.yesNo)req.push('realization');
    if(relation&&relation.type==='fixed_numeric_threshold'){req.push('threshold_outcome');if((scopes||[]).some(function(s){return s.bounded;}))req.push('bounded_outcome');}
    if(relation&&(relation.type==='entity_comparison'||relation.type==='alternative_comparison'))req.push('comparison_outcome');
    if(intent.causal)req.push('cause'); if(intent.advice)req.push('advice'); if(intent.timing)req.push('temporal_sequence'); if(intent.knownDyad)req.push('dyad');
    if(intent.annual){req.push('annual_overview');req.push('domain_coverage');}
    else if(intent.annualSingleDomain){
      // 「今年何時」的年份是搜尋窗口，由時間線承接；其他單領域年題才要求截止年末的結果位。
      if(!intent.timing)req.push('bounded_outcome');
      req.push('trajectory');
    }else if(intent.multiDomain)req.push('domain_coverage');
    if(intent.hidden)req.push('hidden'); if(intent.external)req.push('external'); if(intent.location)req.push('location'); if(intent.pattern||intent.spiritual)req.push('structural_depth');
    if(intent.narrative)req.push('narrative'); if(intent.exhaustive)req.push('exhaustive');
    if((scopes||[]).some(function(s){return s.bounded;})&&intent.yesNo&&!relation)req.push('bounded_outcome');
    if(/未來|走向|結果|發展|之後|最後|結局/.test(intent._q||''))req.push('trajectory');
    if(intent.conflict)req.push('obstacle');
    return uniq(req);
  }

  function compileQuestion(question,options){
    options=options||{};var q=normalize(question)||'（未提供明確問題）';var scopes=detectScopes(q,options.referenceDate,options.timezone),domains=detectDomains(q),intent=detectIntent(q,scopes,domains);intent._q=q;var relation=detectRelation(q,scopes);var shape=buildShape(intent,relation,scopes,domains);
    var atoms=[],entities=[{id:'QUERENT',type:'querent',source:'問卜者'}],constraints=[],assumptions=[];
    function atom(kind,value,role,source,implicit){value=text(value);if(!value)return;atoms.push({id:'A'+pad(atoms.length+1,2),kind:kind,text:value,source:text(source||value),essential:true,eventId:'QUERY_EVENT',role:role,implicit:!!implicit});}
    var explicitThird=q.match(/^([^，。！？?]{1,20}?)(?:的)(?:今年|明年|未來|目前|現在)?(?:運勢|狀況|感情|工作|事業|健康|財運)/),actor='QUERENT';
    if(explicitThird&&!/^我$|^本人$/.test(text(explicitThird[1]))){actor='ACTOR_1';entities.push({id:actor,type:'query_explicit_actor',surface:text(explicitThird[1]),source:explicitThird[1]});atom('actor',text(explicitThird[1]),'actor',explicitThird[1],false);}else{var explicitSelf=/(?:我|本人)(?:的)?/.test(q),implicitActor=!explicitSelf;atom('actor','問卜者本人','actor',implicitActor?'語境預設問卜者':(q.indexOf('本人')>=0?'本人':'我'),implicitActor);if(implicitActor)assumptions.push({id:'AS01',type:'deictic_subject_resolution',value:'省略主詞依占卜語境解析為問卜者本人',status:'explicitly_marked'});}
    var roles={actor:actor,target:'',subject:'',metric:'',threshold:'',leftOperand:'',rightOperand:'',attribute:'',comparator:'',queryOperator:''},eventType='qualitative_state_query',predicate='describe_state';
    if(relation&&relation.type==='fixed_numeric_threshold'){
      eventType='fixed_threshold_event';predicate='cross_fixed_threshold';entities.push({id:'SUBJECT_1',type:'query_subject',surface:relation.subject,owner:'QUERENT',source:relation.subject});roles.subject='SUBJECT_1';roles.metric=relation.metric;roles.threshold='THRESHOLD_1';roles.comparator=relation.operator;roles.queryOperator='truth_or_realization';
      atom('subject',relation.subject,'subject',relation.subject);atom('measured_attribute',relation.metric,'metric',relation.metric);atom('comparator',relation.operatorText,'comparator',relation.operatorText);atom('threshold_value',relation.thresholdSurface+'〔'+relation.thresholdValue+'〕','threshold',relation.thresholdSurface);atom('query_operator',queryOperatorLabel('truth_or_realization'),'queryOperator',q);
    }else if(relation&&relation.type==='alternative_comparison'){
      eventType='alternative_comparison';predicate='compare_branches';entities.push({id:'REL_LEFT',type:'query_explicit_operand',surface:relation.left,source:relation.left});entities.push({id:'REL_RIGHT',type:'query_explicit_operand',surface:relation.right,source:relation.right});roles.leftOperand='REL_LEFT';roles.rightOperand='REL_RIGHT';roles.comparator=relation.operator;roles.attribute=relation.scale;roles.queryOperator='choice';
      atom('left_operand',relation.left,'leftOperand',relation.left);atom('comparator',relation.operatorText,'comparator',relation.source);atom('right_operand',relation.right,'rightOperand',relation.right);atom('measured_attribute',scaleLabel(relation.scale),'attribute',relation.scale);atom('query_operator',queryOperatorLabel('choice'),'queryOperator',q);
    }else if(relation){
      eventType='entity_comparison';predicate='compare_on_same_scale';entities.push({id:'REL_LEFT',type:'query_explicit_operand',surface:relation.left,source:relation.left});entities.push({id:'REL_RIGHT',type:'query_explicit_operand',surface:relation.right,source:relation.right});roles.leftOperand='REL_LEFT';roles.rightOperand='REL_RIGHT';roles.comparator=relation.operator;roles.attribute=relation.scale;roles.queryOperator='truth_or_realization';
      atom('left_operand',relation.left,'leftOperand',relation.left);atom('measured_attribute',scaleLabel(relation.scale),'attribute',relation.source);atom('comparator',relation.operatorText,'comparator',relation.operatorText);atom('right_operand',relation.right,'rightOperand',relation.right);atom('query_operator',queryOperatorLabel('truth_or_realization'),'queryOperator',q);
    }else{
      var target=queryTarget(q,scopes,intent);entities.push({id:'TARGET_STATE',type:'query_target',surface:target,source:target});roles.target='TARGET_STATE';atom('state_target',target,'target',target);var op='qualitative_description';if(intent.causal)op='cause_explanation';else if(intent.timing)op='relative_timing';else if(intent.location)op='location_guidance';else if(intent.advice)op='action_guidance';else if(intent.yesNo)op='truth_or_realization';roles.queryOperator=op;atom('query_operator',queryOperatorLabel(op),'queryOperator',q);
    }
    var modality=(q.match(/(?:一定|必然|應該|可能|會不會|能不能|可不可以|是否|有沒有|可以|能夠|能否|可否|會|能)/)||[])[0];if(modality)atom('modality',modality,'modality',modality);
    scopes.forEach(function(s){atom('scope',s.resolved&&s.resolved.label?s.surface+'〔'+s.resolved.label+'〕':s.surface,'timeScope',s.source);constraints.push({id:'C'+pad(constraints.length+1,2),type:'scope',surface:s.surface,text:s.surface,resolved:clone(s.resolved),bounded:s.bounded,timezone:s.timezone,attach:'QUERY_EVENT.timeScope',source:s.source});});
    (q.match(/(?:不會|不能|沒有|未曾|尚未|不要|不再|不是|不成立)/g)||[]).forEach(function(x){atom('polarity',x,'polarity',x);});(q.match(/(?:除了|排除|不含|非)[^，。！？?]{1,24}/g)||[]).forEach(function(x){atom('exclusion',x,'exclusion',x);});
    var reqObs=requiredObservables(intent,relation,scopes,domains,shape),unsupported=[];
    if(/多少錢|多少(?:收入|薪水|營收|營業額|獲利|成本)|具體(?:金額|數字|數值)|確切(?:金額|數字|數值)|價位|百分比|幾成|機率/.test(q))unsupported.push('exact_value');
    if(/幾個|幾位|多少人|人數|數量/.test(q))unsupported.push('cardinality');if(/幾歲|年齡/.test(q))unsupported.push('exact_age');if(/姓名|名字|身分|是什麼人/.test(q))unsupported.push('identity');if(intent.timing&&/哪一天|幾月幾號|確切日期/.test(q))unsupported.push('exact_date');
    var dims=[{id:'event_or_state',label:'核心事件／狀態',source:q}];reqObs.forEach(function(id){if(id!=='state')dims.push({id:id,label:OBSERVABLES[id]||id,source:q});});unsupported.forEach(function(id){dims.push({id:id,label:id==='exact_value'?'精確數值／金額':id,source:q});});if(scopes.length)dims.push({id:'time_scope',label:'使用者明示期限／範圍',source:scopes.map(function(s){return s.surface;}).join('、')});
    var event={id:'QUERY_EVENT',type:eventType,surface:q,predicate:predicate,roles:roles,modality:modality||'open',timeScope:scopes.map(function(s){return s.surface;}),resolvedTimeScopes:clone(scopes),relationIds:relation?[relation.id]:[],shape:shape,requiredObservables:reqObs};
    var canonical=atoms.map(function(a){return a.role+'='+a.text;}).join('|');var deletion=atoms.map(function(a){var rem=atoms.filter(function(x){return x.id!==a.id;});return {atomId:a.id,removedRole:a.role,changesTruthConditions:rem.map(function(x){return x.role+'='+x.text;}).join('|')!==canonical&&!rem.some(function(x){return x.role===a.role&&x.text===a.text;})};});
    var scopeSurface=scopes.map(function(s){return s.surface;}).join(''),reconstructed;
    if(relation&&relation.type==='fixed_numeric_threshold'){
      reconstructed=scopeSurface+'我的'+relation.subject+relation.metric+(modality||'是否能')+relation.operatorText+relation.thresholdSurface+'？';
    }else if(relation&&relation.type==='alternative_comparison'){
      reconstructed=scopeSurface+relation.left+'與'+relation.right+'何者較適合？';
    }else if(relation){
      var scale=relation.scale&&relation.scale!=='model_resolve_same_scale'?relation.scale:'';
      reconstructed=scopeSurface+'我的'+relation.left+(scale?scale:'')+(modality||'是否')+relation.operatorText+relation.right+(scale?scale:'')+'？';
    }else{
      reconstructed=scopeSurface+queryTarget(q,scopes,intent)+(intent.causal?'的原因為何？':intent.timing?'的相對時序為何？':intent.location?'的位置為何？':intent.advice?'應如何處理？':intent.yesNo?'是否成立？':'如何？');
    }
    var hasActor=atoms.some(function(a){return a.role==='actor';}),noWhole=atoms.every(function(a){return normalize(a.text)!==q;}),allSensitive=deletion.every(function(x){return x.changesTruthConditions;}),hasShape=relation?atoms.some(function(a){return a.role==='queryOperator';}):['target','queryOperator'].every(function(r){return atoms.some(function(a){return a.role===r;});});
    var graph={schema:'typed_query_graph/6',events:[event],entities:entities,relations:relation?[relation]:[],constraints:constraints,assumptions:assumptions,requiredAtoms:atoms,requiredObservables:reqObs,unsupportedDimensions:unsupported,roundTripReconstruction:reconstructed,canonicalSemanticSignature:canonical,compilerStatus:(hasActor&&hasShape&&noWhole&&allSensitive)?'validated_atomized':'invalid_atomization',validation:{roundTripCompatible:hasActor&&hasShape&&noWhole&&!!reconstructed,deletionSensitivity:deletion,everyDeletionChangesTruthConditions:allSensitive,noAddedPremise:assumptions.every(function(a){return a.status==='explicitly_marked';}),uniqueAtomIds:new Set(atoms.map(function(a){return a.id;})).size===atoms.length,noWholeQuestionAtom:noWhole,allAtomsBound:atoms.every(function(a){return a.eventId==='QUERY_EVENT'&&!!a.role;})},atomizationRequirement:'主體／所有者、事件主體、尺度、比較子、門檻、模態、期限、否定與排除須各自成為 essential atom；使用者明示數字是查詢條件，不是牌面推算值。'};
    graph.completionRules=[
      '每個會改變答案真值的自然語言成分都必須成為 essential atom，且綁定 eventId 與 role／scope。',
      '未知人物只能建立 UNBOUND_ENTITY；原句未明示的前提只能列為 assumption。'
    ];
    graph.validationRules={
      roundTrip:'依角色圖重建的命題須與原句雙向相容；語序可規範化，但主體、尺度、比較子、門檻、模態與期限不得改變。',
      deletionSensitivity:'逐一刪除 essential atom；刪除任何原子都必須改變真值條件。',
      sameEventTest:'同一完整事件的角色、作用、結果與期限共享 QUERY_EVENT；比較分支另用已宣告 subevent。',
      noAddedPremise:'原句未含且牌面未建立的前提不得進入完整命題。'
    };
    var features=Object.assign({},intent,{domains:domains,domainCount:domains.length,relationType:relation?relation.type:null,hasRelation:!!relation,hasThreshold:!!(relation&&relation.type==='fixed_numeric_threshold'),shape:shape,requiredObservables:reqObs,unsupportedDimensions:unsupported,referenceDate:dateParts(options.referenceDate).iso,questionLength:q.length});
    return {originalQuestion:q,normalizedQuestion:q,requestedDimensions:dims,explicitScopes:scopes,relations:relation?[relation]:[],knownCounterpart:intent.knownDyad,queryGraph:graph,features:features,requiredObservables:reqObs,unsupportedDimensions:unsupported};
  }

  function explicitSpread(q){var rules=[['mathers_horseshoe',/Mathers.*(?:第一法|古法|horseshoe|馬蹄)|五十四.?張|54.?張/i],['mathers_21',/Mathers.*(?:第二法|牌陣)|三排七|二十一.?張|21.?張/i],['fifteen_card',/金色黎明.*十五|英式.*牌陣|fifteen.?card|十五.?張/i],['minor_arcana',/小阿卡那|小牌牌陣|minor arcana/i],['celtic_cross',/凱爾特|celtic/i],['tree_of_life',/生命之樹|卡巴拉牌陣|tree of life/i],['zodiac',/(?:黃道|十二宮|星座)牌陣|zodiac/i],['horseshoe',/七張馬蹄|馬蹄形牌陣|seven.?card horseshoe/i],['relationship',/關係牌陣|relationship spread/i],['timeline',/時間線牌陣|timeline spread/i],['cross',/十字牌陣|cross spread/i],['three_card',/(?:三牌|三張牌)陣|three.?card spread/i],['five_card',/(?:五牌|五張牌)陣|five.?card spread/i],['either_or',/二選一牌陣|雙路比較牌陣|either.?or spread/i],['ootk',/開鑰之法|opening of the key/i]];for(var i=0;i<rules.length;i+=1)if(rules[i][1].test(q))return rules[i][0];return '';}
  function affinity(method,shape){return method.specialties.indexOf(shape)>=0?0:(method.specialties.indexOf('simple')>=0&&shape==='yes_no'?1:4);}
  function candidateRank(m,shape,required){var surplus=difference(m.provides,required).length;return affinity(m,shape)*100+(m.count==null?80:m.count)+surplus*2;}

  function bindSlots(base,compiled){
    var slots=clone(base.slots),f=compiled.features||{},shape=f.shape,scope=(compiled.explicitScopes||[])[0],scopeLabel=scope&&scope.resolved&&scope.resolved.label?scope.resolved.label:(scope?scope.surface:'期限終點'),rel=(compiled.relations||[])[0];
    function s(i,authority,role,label,bind){slots[i]=Object.assign({},slots[i]||{},{authority:authority,role:role,label:label,binding:bind||{eventId:'QUERY_EVENT'}});}
    if(base.id==='three_card'){
      s(0,'antecedent','basis','形成目前局勢的既有基礎');s(1,'state','current_state','目前核心狀態');s(2,'outcome','conditional_outcome','維持現狀的條件性走向');
    }else if(base.id==='five_card'&&(shape==='threshold'||shape==='bounded_yes_no')){
      var threshold=rel&&rel.type==='fixed_numeric_threshold'?(rel.metric+rel.operatorText+rel.thresholdSurface):'原問句成立門檻';
      s(0,'state','current_baseline','目前累積狀態',{eventId:'QUERY_EVENT',metric:rel&&rel.metric});s(1,'enabler','threshold_enabler','推動跨越門檻的力量',{eventId:'QUERY_EVENT',threshold:threshold});s(2,'obstacle','threshold_obstacle','阻礙跨越門檻的力量',{eventId:'QUERY_EVENT',threshold:threshold});s(3,'advice','intervention','可介入的行動',{eventId:'QUERY_EVENT'});s(4,'bounded_outcome','threshold_result','截至'+scopeLabel+'的門檻結果',{eventId:'QUERY_EVENT',scope:scopeLabel,threshold:threshold});
    }else if(base.id==='five_card'&&f.annualSingleDomain){
      s(0,'state','current_state','本領域目前狀態');s(1,'cause','year_driver','本年度形成機制');s(2,'obstacle','year_constraint','本年度主要限制');s(3,'advice','intervention','本年度可介入方向');s(4,'bounded_outcome','scope_end_outcome','截至'+scopeLabel+'的條件性結果',{eventId:'QUERY_EVENT',scope:scopeLabel});
    }else if(base.id==='five_card'){
      s(0,'state','current_state','目前狀態');s(1,'cause','cause','形成機制');s(2,'obstacle','constraint','主要阻礙');s(3,'advice','intervention','可介入方向');s(4,(scope&&scope.bounded)?'bounded_outcome':'outcome','conditional_outcome',(scope&&scope.bounded?'截至'+scopeLabel+'的':'')+'條件性結果',{eventId:'QUERY_EVENT',scope:scopeLabel});
    }else if(base.id==='either_or'){
      var left=rel&&(rel.left||rel.subject)||'A路徑',right=rel&&rel.right||'B路徑';s(0,'state','comparison_context','共同背景與比較尺度');s(1,'comparison','branch_A_state',left+'的狀態',{eventId:'BRANCH_A_EVENT',entity:left});s(2,'comparison','branch_B_state',right+'的狀態',{eventId:'BRANCH_B_EVENT',entity:right});s(3,'outcome','branch_A_outcome',left+'的條件性走向',{eventId:'BRANCH_A_EVENT',entity:left});s(4,'outcome','branch_B_outcome',right+'的條件性走向',{eventId:'BRANCH_B_EVENT',entity:right});
    }else if(base.id==='relationship'){
      s(0,'state','querent_state','問卜者在關係中的狀態');s(1,f.knownDyad?'person_known':'person_aggregate','counterpart_state',f.knownDyad?'原問句已指明對象的狀態':'未知／聚合對方作用');s(2,'state','relation_state','關係本身的狀態');s(3,'obstacle','relation_constraint','關係主要限制');s(4,'advice','intervention','可介入方向');s(5,'outcome','relation_outcome','維持現狀的關係走向');
    }else if(base.id==='timeline'){
      ['前置階段','近期階段','轉折階段','後續階段','較後段走向'].forEach(function(l,i){s(i,i===0?'antecedent':(i===4?'development':'timeline'),['prior_stage','near_stage','turning_point','later_stage','terminal_tendency'][i],l);});
    }
    // 通用截止範圍綁定：只有原本已具 outcome 權限的位置才可升為 bounded_outcome。
    // 不因「未來／發展」字樣把 development 或 timeline 位置冒充最終結果。
    if(scope&&scope.bounded){
      slots=slots.map(function(slot){
        if(!slot||slot.authority!=='outcome')return slot;
        var bound=Object.assign({},slot.binding||{eventId:'QUERY_EVENT'},{scope:scopeLabel});
        return Object.assign({},slot,{authority:'bounded_outcome',label:'截至'+scopeLabel+'的'+(slot.label||'條件性結果'),binding:bound});
      });
    }
    return slots;
  }
  function instantiateMethod(id,compiled){var base=method(id);if(!base)return null;compiled=compiled&&compiled.queryGraph?compiled:compileQuestion((compiled&&compiled.originalQuestion)||'');base.slots=bindSlots(base,compiled);base.requiredObservables=clone(compiled.requiredObservables||[]);base.missingObservables=difference(base.requiredObservables,base.provides);base.coverageComplete=!base.missingObservables.length;base.questionShape=compiled.features&&compiled.features.shape;base.slotBindings=base.slots.map(function(s,i){return {index:i,authority:s.authority,role:s.role,label:s.label||s.role,binding:clone(s.binding||{eventId:'QUERY_EVENT'})};});return base;}

  function routeQuestion(input,options){
    options=options||{};var compiled=typeof input==='string'?compileQuestion(input,options):input,q=compiled.normalizedQuestion||compiled.originalQuestion||'',shape=compiled.features&&compiled.features.shape||'simple',required=compiled.requiredObservables||[],explicit=explicitSpread(q);
    if(explicit){var plan=instantiateMethod(explicit,compiled);return {version:VERSION,engine:'foundation_router_v3',spreadId:explicit,reason:'使用者明確指定牌陣；系統保留指定，但同時回報方法能否覆蓋原問句。',confidence:plan.coverageComplete?1:.55,selectedBy:'explicit',compiledQuestion:compiled,methodPlan:plan,coverage:{required:required,provided:plan.provides,missing:plan.missingObservables,complete:plan.coverageComplete},unsupportedDimensions:compiled.unsupportedDimensions||[],candidates:[{id:explicit,eligible:plan.coverageComplete,missing:plan.missingObservables,rank:0}]};}
    var candidates=Object.keys(METHODS).filter(function(id){return id!=='ootk';}).map(function(id){var m=METHODS[id],missing=difference(required,m.provides),eligible=!missing.length,rank=eligible?candidateRank(m,shape,required):99999+missing.length*100+(m.count||999);return {id:id,eligible:eligible,missing:missing,rank:rank,cards:m.count,provides:m.provides};}).sort(function(a,b){return a.rank-b.rank||((a.cards||999)-(b.cards||999));});
    var eligible=candidates.filter(function(c){return c.eligible;}),selected=eligible.length?eligible[0].id:'';
    var preferred={annual:'zodiac',annual_single_domain:'five_card',choice:'either_or',comparison:'either_or',threshold:'five_card',bounded_yes_no:'five_card',dyad:'relationship',timing:'timeline',location:'minor_arcana',deep_structure:'tree_of_life',multi_domain:'fifteen_card',hidden_external:'horseshoe',deep_overview:'celtic_cross',conflict:'cross',cause_action:'five_card',narrative:'mathers_21',exhaustive:'mathers_horseshoe',yes_no:'three_card',simple:'three_card'}[shape];
    if(preferred){var pc=candidates.find(function(c){return c.id===preferred&&c.eligible;});if(pc)selected=preferred;}
    if(!selected){
      var nearest=candidates[0]||null,missing=nearest?nearest.missing:required.slice();
      return {version:VERSION,engine:'foundation_router_v3',spreadId:null,reason:'沒有單一已登錄牌陣能同時觀測原問句要求的全部通道；系統已停止抽牌，避免把不相容方法硬套成答案。',confidence:0,selectedBy:'blocked_no_compatible_method',compiledQuestion:compiled,methodPlan:null,coverage:{required:required,provided:nearest?nearest.provides:[],missing:missing,complete:false},unsupportedDimensions:compiled.unsupportedDimensions||[],candidates:candidates.slice(0,8)};
    }
    var plan=instantiateMethod(selected,compiled),reason='依型別化問題所需觀測通道選擇最小充分牌陣：'+required.map(function(x){return OBSERVABLES[x]||x;}).join('、')+'。';
    return {version:VERSION,engine:'foundation_router_v3',spreadId:selected,reason:reason,confidence:plan.coverageComplete?.99:.6,selectedBy:'observable_subset_and_minimum_sufficient_method',compiledQuestion:compiled,methodPlan:plan,coverage:{required:required,provided:plan.provides,missing:plan.missingObservables,complete:plan.coverageComplete},unsupportedDimensions:compiled.unsupportedDimensions||[],candidates:candidates.slice(0,8)};
  }

  function validateMethodRegistry(){var errors=[],authorities={state:1,antecedent:1,development:1,cause:1,enabler:1,obstacle:1,interaction_force:1,advice:1,outcome:1,bounded_outcome:1,person_known:1,person_aggregate:1,environment:1,comparison:1,timeline:1,domain:1,structural:1,synthesis:1,stage:1};Object.keys(METHODS).forEach(function(id){var m=METHODS[id];if(m.id!==id)errors.push('id_mismatch:'+id);if(id!=='ootk'&&m.slots.length!==m.count)errors.push('slot_count:'+id);m.slots.forEach(function(s,i){if(!authorities[s.authority])errors.push('unknown_authority:'+id+':'+i+':'+s.authority);});(m.dignityLines||[]).forEach(function(line,li){if(line.length<3)errors.push('dignity_line_requires_three_or_more:'+id+':'+li);line.forEach(function(i){if(i<0||(m.count!=null&&i>=m.count))errors.push('dignity_index:'+id+':'+i);});});difference(m.provides,Object.keys(OBSERVABLES)).forEach(function(x){errors.push('unknown_observable:'+id+':'+x);});});return {ok:!errors.length,errors:errors};}

  return {VERSION:VERSION,SCHEMA:SCHEMA,OBSERVABLES:OBSERVABLES,METHODS:METHODS,normalizeQuestion:normalize,parseChineseNumber:parseChineseNumber,compileQuestion:compileQuestion,routeQuestion:routeQuestion,instantiateMethod:instantiateMethod,getMethod:method,getDignityLines:dignityLines,getDependencyGroups:dependencyGroups,getCompatibilityEdges:compatibilityEdges,validateMethodRegistry:validateMethodRegistry};
});
