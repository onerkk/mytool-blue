/*! tarot-foundation.js — Tarot v103 method-data foundation
 * 單一真相來源：問題型別化、觀測需求、牌陣能力、動態牌位綁定與自動路由。
 * 牌義不在本檔；Book T 由 golden-dawn-tarot.js 提供；RWS 正逆位由 tarot-reading.js 處理。
 */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.JYTarotFoundation = api;
})(typeof globalThis !== 'undefined' ? globalThis : (typeof window !== 'undefined' ? window : this), function () {
  'use strict';

  var VERSION = '103.1.0';
  var SCHEMA = 'jy.tarot.foundation/6';

  function text(v) { return v == null ? '' : String(v).trim(); }
  function clone(v) { return v == null ? v : JSON.parse(JSON.stringify(v)); }
  function pad(n, w) { return String(n).padStart(w, '0'); }
  function range(a, b) { var out=[]; for(var i=a;i<b;i+=1) out.push(i); return out; }
  function mirrorPairs(start, count) { var out=[]; for(var i=0;i<Math.floor(count/2);i+=1) out.push([start+i,start+count-1-i]); return out; }
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
    // A civil date is not a UTC midnight. Preserve the stated day in every TZ.
    var civil=typeof value==='string'&&/^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    var d=civil?new Date(Number(civil[1]),Number(civil[2])-1,Number(civil[3]),12):value?new Date(value):new Date();
    if(isNaN(d.getTime()))d=new Date();
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
    ],[[2,0,3],[4,0,1]],[[0,1],[2,0,3],[4,0,1]],['state','antecedent','obstacle','enabler','advice','trajectory','realization'],['conflict','stuck']),
    either_or: methodDef('either_or','雙路比較牌陣',5,[
      {authority:'state',role:'comparison_context'},{authority:'comparison',role:'branch_A_state'},{authority:'comparison',role:'branch_B_state'},{authority:'outcome',role:'branch_A_outcome'},{authority:'outcome',role:'branch_B_outcome'}
    ],[[0,1,3],[0,2,4]],[[0,1,3],[0,2,4]],['state','trajectory','comparison_outcome','conditional_outcome','realization'],['choice','comparison']),
    relationship: methodDef('relationship','關係牌陣',6,[
      {authority:'state',role:'querent_state'},{authority:'person_aggregate',role:'counterpart_state'},{authority:'state',role:'relation_state'},{authority:'obstacle',role:'relation_constraint'},{authority:'advice',role:'intervention'},{authority:'outcome',role:'relation_outcome'}
    ],[[0,2,1],[4,3,2,5]],[[0,1,2],[3,2],[4,3,2,5]],['state','dyad','cause','obstacle','advice','trajectory','conditional_outcome','realization','external'],['dyad','relationship']),
    timeline: methodDef('timeline','相對時間線',5,[
      {authority:'antecedent',role:'prior_stage'},{authority:'timeline',role:'near_stage'},{authority:'timeline',role:'turning_point'},{authority:'timeline',role:'later_stage'},{authority:'development',role:'terminal_tendency'}
    ],[[0,1,2,3,4]],[[0,1,2,3,4]],['state','antecedent','trajectory','temporal_sequence','realization'],['timing']),
    horseshoe: methodDef('horseshoe','七張馬蹄形',7,[
      {authority:'antecedent',role:'prior_influence'},{authority:'state',role:'current_state'},{authority:'structural',role:'hidden_influence'},{authority:'advice',role:'intervention'},{authority:'environment',role:'external_condition'},{authority:'obstacle',role:'constraint'},{authority:'outcome',role:'conditional_outcome'}
    ],[[0,1,2,3,4,5,6]],[[0,1,2],[4,5],[3,4,5,6]],['state','antecedent','hidden','external','obstacle','advice','trajectory','conditional_outcome','realization'],['hidden','external','complex_event']),
    celtic_cross: methodDef('celtic_cross','凱爾特十字',10,[
      {authority:'state',role:'core_state'},{authority:'interaction_force',role:'crossing_force'},{authority:'structural',role:'possible_formation'},{authority:'cause',role:'root_mechanism'},{authority:'timeline',role:'receding_stage'},{authority:'timeline',role:'approaching_stage'},{authority:'state',role:'querent_state'},{authority:'environment',role:'external_condition'},{authority:'state',role:'expectation_or_fear'},{authority:'outcome',role:'conditional_outcome'}
    ],[[4,0,5],[3,0,2],[6,7,8,9]],[[0,1],[3,0,2],[4,0,5],[6,7,8,9],[8,9]],['state','cause','antecedent','hidden','external','obstacle','enabler','advice','trajectory','conditional_outcome','realization','structural_depth'],['deep_overview','single_complex'],undefined,[[0,1]]),
    tree_of_life: methodDef('tree_of_life','生命之樹',10,new Array(9).fill(null).map(function(){return {authority:'structural',role:'qabalistic_layer'};}).concat([{authority:'outcome',role:'material_manifestation'}]),[[1,3,6],[2,4,7],[0,5,8,9]],[[1,3,6],[2,4,7],[0,5,8,9]],['state','cause','advice','hidden','trajectory','realization','structural_depth'],['pattern','spiritual','deep_structure'],'後世卡巴拉觀測布局；不得冒充 Book T 原創占卜程序'),
    zodiac: methodDef('zodiac','黃道十二宮',13,new Array(12).fill(null).map(function(){return {authority:'domain',role:'house_domain'};}).concat([{authority:'synthesis',role:'annual_synthesis'}]),[],[[0,6],[1,7],[2,8],[3,9],[4,10],[5,11]],['state','annual_overview','domain_coverage','trajectory','realization','external'],['annual','domains'],'後世占星宮位觀測布局；不得冒充 Book T 原創占卜程序'),
    minor_arcana: methodDef('minor_arcana','小阿卡那實務牌陣',7,[
      {authority:'state',role:'current_state'},{authority:'cause',role:'cause'},{authority:'obstacle',role:'constraint'},{authority:'environment',role:'external_condition'},{authority:'state',role:'available_resource'},{authority:'advice',role:'intervention'},{authority:'outcome',role:'conditional_outcome'}
    ],[[1,0,2],[3,4,5,6]],[[1,0,2],[3,4,5,6]],['state','cause','obstacle','external','advice','trajectory','conditional_outcome','realization','location'],['practical','location'],'後世觀測布局；牌組限制為小阿卡那，牌義依本次讀牌方式'),
    fifteen_card: methodDef('fifteen_card','金色黎明衍生十五張',15,[
      {authority:'state',role:'core_state'},{authority:'state',role:'core_support'},{authority:'state',role:'core_support'},
      {authority:'development',role:'natural_path'},{authority:'development',role:'alternative_path'},{authority:'advice',role:'decision_basis'},{authority:'structural',role:'uncontrolled_condition'},
      {authority:'development',role:'natural_path'},{authority:'development',role:'alternative_path'},{authority:'advice',role:'decision_basis'},{authority:'structural',role:'uncontrolled_condition'},
      {authority:'development',role:'natural_path'},{authority:'development',role:'alternative_path'},{authority:'advice',role:'decision_basis'},{authority:'structural',role:'uncontrolled_condition'}
    ],[[1,0,2],[3,7,11],[12,8,4],[5,9,13],[6,10,14]],[[1,0,2],[3,7,11],[12,8,4],[5,9,13],[6,10,14]],['state','cause','advice','trajectory','conditional_outcome','comparison_outcome','realization','domain_coverage','hidden','external','structural_depth'],['multi_domain','wide_overview'],'後世金色黎明衍生布局；牌義與尊貴仍鎖定 Book T'),
    mathers_21: methodDef('mathers_21','Mathers 二十一張',21,new Array(21).fill(null).map(function(){return {authority:'structural',role:'ordered_narrative'};}),[range(0,7),range(7,14),range(14,21)],[range(0,7),range(7,14),range(14,21)],['state','antecedent','cause','trajectory','conditional_outcome','realization','narrative','hidden','external'],['narrative'],'Mathers 1888 歷史程序；牌義依選定的 RWS 或 Golden Dawn，不等同1888原書牌義'),
    mathers_horseshoe: methodDef('mathers_horseshoe','Mathers 五十四張',54,new Array(54).fill(null).map(function(){return {authority:'structural',role:'ordered_group'};}),[range(0,26),range(26,43),range(43,54)],[range(0,26),range(26,43),range(43,54)],['state','antecedent','cause','trajectory','conditional_outcome','realization','narrative','exhaustive','domain_coverage','hidden','external'],['exhaustive'],'Mathers 1888 歷史程序；牌義依選定的 RWS 或 Golden Dawn，不等同1888原書牌義'),
    ootk: methodDef('ootk','Opening of the Key 五次操作',null,new Array(5).fill(null).map(function(){return {authority:'stage',role:'operation_stage'};}),[],[],['state','antecedent','cause','obstacle','enabler','advice','trajectory','temporal_sequence','conditional_outcome','bounded_outcome','threshold_outcome','realization','dyad','hidden','external','annual_overview','domain_coverage','structural_depth','narrative','exhaustive'],['ootk','exhaustive'],'Golden Dawn《Book T／Liber T》程序')
  };



  // v101：每個牌陣的「原生讀法協議」。牌義核心與方法拓撲分離：
  // Book T 決定牌的本性與元素尊貴；本協議決定牌位、序列、配對、軸線、分組及結論權限。
  function protocolDef(id, kind, slotMode, summary, phases, structures, conclusionRule, conflictRule, timeRule, sourceNote) {
    return {
      id:id,
      kind:kind,
      slotMode:slotMode,
      summary:summary,
      phases:(phases||[]).slice(),
      structures:clone(structures||[]),
      conclusionRule:conclusionRule,
      conflictRule:conflictRule,
      timeRule:timeRule,
      sourceNote:sourceNote||'',
      pairingIsAdjacency:false,
      causalEdgeIsAdjacency:false,
      fixedReversalDictionary:false
    };
  }

  var METHOD_PROTOCOLS = {
    three_card: protocolDef('three_card','semantic_path','semantic_position',
      '三個明示牌位構成最小事件路徑；每張先在自己的牌位內成義，再讀相鄰與全路徑。',
      ['依三個牌位逐位成義','讀1→2與2→3的相鄰改寫','以1→2→3整體回答原問句'],
      [{type:'ordered_sequence',label:'三牌主線',indices:[0,1,2],elementalDignity:true,instruction:'依實際牌位名稱讀成一條有方向的最小路徑。'}],
      '只有第三張被前端明示為結果／走向時才具有收束權限；仍須受前兩張限定。',
      '單張不得脫離整條路徑翻轉結論；衝突時保留條件與轉折。',
      '牌位只提供相對階段；沒有外部日曆錨時不得換算日期。','現代三牌布局'),
    five_card: protocolDef('five_card','directed_event_graph','semantic_position',
      '現況、原因、阻礙、建議與結果形成有向事件網，不是五張直線故事。',
      ['現況定義問題','原因與阻礙建立形成機制','建議作用於阻礙','結果由前四張共同限定'],
      [{type:'dependency_network',label:'五牌事件網',indices:[0,1,2,3,4],elementalDignity:false,links:[{from:1,to:0,relation:'形成機制影響現況'},{from:2,to:0,bidirectional:true,relation:'主要限制與現況互相作用'},{from:3,to:2,relation:'介入方向作用於限制'},{from:[0,1,2,3],to:4,relation:'前述條件共同限定結果'}],instruction:'這是具名互動網，不是第2張一路走到第5張的時間或因果直線。'}],
      '結果位可作條件性裁決，但不得脫離原因、阻礙與介入條件單獨定案。',
      '阻礙與反證優先限定結果的成立條件，不用吉凶票數。',
      '只有原問句提供期限或牌位明示相對階段時才能談時間。','現代五牌事件布局'),
    cross: protocolDef('cross','cross_axis','semantic_position',
      '核心與交叉力量先形成拉扯，再由過去—核心—未來軸及建議介入。',
      ['核心↔交叉力量','過去影響→核心→後續趨勢','建議接回核心與交叉力量'],
      [{type:'cross',label:'核心交叉',indices:[0,1],elementalDignity:false,instruction:'交叉牌可為助力、阻力、代價或混合作用。'},{type:'axis',label:'發展軸',indices:[2,0,3],elementalDignity:true,instruction:'只讀相對發展，不把未來位自動當最終結果。'}],
      '本法沒有專屬最終結果位；只能對核心拉扯與後續傾向作定性綜合。',
      '核心—交叉的直接張力優先，其他牌只補充來源、走向與介入點。',
      '過去與未來是相對位置，不等於固定日期。','現代十字布局'),
    either_or: protocolDef('either_or','parallel_branches','semantic_position',
      '共同基準與兩條互不混牌的分支構成比較。',
      ['先定共同需求與尺度','各自完成A路徑與B路徑','在同一尺度比較落點、代價與可持續性'],
      [{type:'branch',label:'A路徑',indices:[0,1,3],elementalDignity:true,instruction:'A路徑獨立成句。'},{type:'branch',label:'B路徑',indices:[0,2,4],elementalDignity:true,instruction:'B路徑獨立成句。'}],
      'A、B結果只屬各自分支；不得跨分支拼牌後再宣稱第三條路。',
      '兩路先各自成立，再以同一標準比較；不得抹平各自條件。',
      '沒有明示時間尺度時只比較相對進程。','現代雙路比較布局'),
    relationship: protocolDef('relationship','dyadic_network','semantic_position',
      '問卜者、已知對象／對方作用、關係現況、挑戰、建議與走向形成雙人關係網。',
      ['比較雙方狀態或作用','雙方共同形成關係現況','挑戰與建議改寫關係','走向作條件性收束'],
      [{type:'dyad',label:'雙方—關係機制',indices:[0,1,2],elementalDignity:false,links:[{from:[0,1],to:2,relation:'雙方狀態／作用共同形成關係現況'}],instruction:'已知對象才能具體化；未知對象位只作聚合作用；此三者是語義網，不冒充左右相鄰。'},{type:'dependency_network',label:'挑戰—介入—走向',indices:[2,3,4,5],elementalDignity:false,links:[{from:3,to:2,bidirectional:true,relation:'挑戰改寫關係現況'},{from:4,to:3,relation:'建議作用於挑戰'},{from:[0,1,2,3,4],to:5,relation:'整體條件共同限定走向'}],instruction:'走向須受雙方、關係現況、挑戰與介入共同支撐；不是一條直線。'}],
      '走向位是維持目前互動條件下的關係傾向，不是對方內心的獨立證明。',
      '現實中明示的界線、同意與行為優先於牌面推測。',
      '只提供相對後續；無日曆錨不報日期。','現代關係布局'),
    timeline: protocolDef('timeline','relative_timeline','semantic_position',
      '五張依牌位構成相對時間鏈，重點是階段、觸發與轉換，不是公曆換算。',
      ['前置階段','近期狀態','轉折觸發','轉折後發展','較後段收束'],
      [{type:'ordered_sequence',label:'相對時間線',indices:[0,1,2,3,4],elementalDignity:true,instruction:'每張說明如何改寫前一階段。'}],
      '末位只代表牌陣設定的較後段走向；不等於永久最終命運。',
      '轉折牌的觸發條件優先於抽象快慢判斷。',
      '五個位置不是五天、五月或五年；只有外部錨可細化。','現代相對時間布局'),
    horseshoe: protocolDef('horseshoe','semantic_arc','semantic_position',
      '七個明示牌位沿馬蹄弧形成目前局勢、介入與結果。',
      ['過去→現在→隱藏作用','建議作用於他人／環境與阻礙','前六張共同導向結果'],
      [{type:'ordered_sequence',label:'馬蹄弧',indices:[0,1,2,3,4,5,6],elementalDignity:true,instruction:'依明示牌位順序讀，不把他人位自動具名。'}],
      '結果位可作條件性收束，但必須由前六張共同支撐。',
      '隱藏作用與他人／環境位若未完成實體綁定，不得編造秘密人物。',
      '過去、現在、結果是相對牌位，不自動提供日期。','現代七張馬蹄布局'),
    celtic_cross: protocolDef('celtic_cross','cross_and_staff','semantic_position',
      '先讀核心十字，再讀垂直、時間、本人—環境與希望恐懼—結果等結構。',
      ['核心↔交叉力量','上方可能↔腳下根基','身後→身前','本人↔環境','希望／恐懼校正結果','全盤匯入第十張'],
      [{type:'cross',label:'核心十字',indices:[0,1],elementalDignity:false,instruction:'交叉牌不預設為凶。'},{type:'axis',label:'垂直軸',indices:[2,3],elementalDignity:false,instruction:'可能成形與根基互校。'},{type:'axis',label:'時間軸',indices:[4,5],elementalDignity:false,instruction:'相對離開與接近。'},{type:'staff',label:'權杖列',indices:[6,7,8,9],elementalDignity:true,instruction:'本人、環境、希望恐懼與結果依序校正。'}],
      '第十張是全盤條件下的最終將至；不可只抽第十張定案。',
      '核心十字與根基若強烈反證，第十張須改為附條件而非硬判。',
      '第五、六張只給相對時間；無外部錨不換算日期。','Celtic Cross 後世布局'),
    tree_of_life: protocolDef('tree_of_life','qabalistic_tree','qabalistic_position',
      '每張先在指定質點功能內成義，再讀三柱、成對質點與中柱落地。',
      ['逐質點成義','右柱擴張與左柱界定','成對質點互校','Kether→Tiphareth→Yesod→Malkuth中柱整合'],
      [{type:'pillar',label:'慈悲之柱',indices:[1,3,6],elementalDignity:true,instruction:'擴張與推進作用。'},{type:'pillar',label:'嚴厲之柱',indices:[2,4,7],elementalDignity:true,instruction:'形式、界定與辨析作用。'},{type:'pillar',label:'中柱',indices:[0,5,8,9],elementalDignity:true,instruction:'源頭、核心、基礎與物質落地。'}],
      'Malkuth描述物質落地層；只有牌陣明示作結果時才可作條件性結果，不等於永久命運。',
      '任何單一質點不得凌駕三柱與中軸整合。',
      '質點不是時間單位。','後世 Hermetic Qabalah 生命之樹布局'),
    zodiac: protocolDef('zodiac','house_wheel','domain_position',
      '十二宮各自回答一個生活領域，第十三張只統整全盤主旋律。',
      ['逐宮成義','讀六組對宮軸','依問題聚焦相關宮位與其對宮','第十三張統整但不覆蓋各宮差異'],
      [{type:'house_wheel',label:'十二宮輪',indices:range(0,12),elementalDignity:false,instruction:'宮位是領域通道，不是十二個事件或人物。'},{type:'synthesis',label:'全盤主旋律',indices:[12],elementalDignity:false,instruction:'只統整已成立的宮位命題。'}],
      '第十三張不是萬用結果牌；年度題可統整全年主題，聚焦題只作校正。',
      '對宮衝突須保留兩個領域的交換與代價。',
      '十二宮不是十二個月；除非前端另明示時間映射。','後世占星十二宮布局'),
    minor_arcana: protocolDef('minor_arcana','practical_event_graph','semantic_position',
      '七個實務牌位建立現況、原因、挑戰、環境、資源、建議與結果。',
      ['原因→現況→挑戰','環境與資源接入建議','建議作用後形成結果'],
      [{type:'dependency_network',label:'小牌實務網',indices:[0,1,2,3,4,5,6],elementalDignity:false,links:[{from:1,to:0,relation:'原因影響現況'},{from:2,to:0,bidirectional:true,relation:'挑戰與現況互相作用'},{from:[3,4],to:5,relation:'環境與資源共同限定建議'},{from:[0,1,2,3,4,5],to:6,relation:'全盤條件共同限定結果'}],instruction:'小牌聚焦可觀察流程；這是互動網，不是牌號順序故事。'}],
      '結果位是依建議行動後的條件性結果。',
      '周圍人物位未完成共指時只描述環境作用，不具名。',
      '不以小牌占星分度自行換算日期。','現代小阿卡那專題布局'),
    fifteen_card: protocolDef('fifteen_card','triad_network','triad_member',
      '十五張不是十五個獨立牌位，而是五個三牌組；每組以中牌為主題、兩側牌依元素尊貴與牌義修正。',
      ['核心三牌組2–1–3','自然路徑4–8–12','替代路徑13–9–5','決策依據6–10–14','不可控條件7–11–15','比較五組如何改寫核心'],
      [{type:'triad',label:'核心',indices:[1,0,2],elementalDignity:true,instruction:'中牌1為主題，2與3修正。'},{type:'triad',label:'自然路徑',indices:[3,7,11],elementalDignity:true,instruction:'描述不改變做法時的發展。'},{type:'triad',label:'替代路徑',indices:[12,8,4],elementalDignity:true,instruction:'描述改採其他做法的發展。'},{type:'triad',label:'決策依據',indices:[5,9,13],elementalDignity:true,instruction:'描述心理與決策作用。'},{type:'triad',label:'不可控條件',indices:[6,10,14],elementalDignity:true,instruction:'描述需適應的外在結構。'}],
      '本布局沒有專屬最終結果牌；只能比較自然與替代路徑的整體傾向。',
      '單張或單一三牌組不得覆蓋其他組的反證；路徑保持分離。',
      '三牌組是主題與修飾結構，不自帶近／中／遠時間標籤。','後世 Golden Dawn 衍生十五張布局；非 Book T 開鑰原法'),
    mathers_21: protocolDef('mathers_21','ordered_rows_with_mirror_pairs','sequence_member',
      '二十一張都只是三排序列成員，沒有二十一個獨立牌位。每排由右至左、以代表牌為共同起點讀成連續答案，再讀首尾配對。',
      ['第一排由右至左，從代表牌起讀','第二排由右至左，重新從代表牌起讀','第三排由右至左，重新從代表牌起讀','讀1↔21、2↔20…10↔12','第11張作未配對成員納入全盤','綜合三排主線與配對補充'],
      [{type:'ordered_sequence',label:'第一排',indices:range(0,7),elementalDignity:true,instruction:'由右至左；代表牌在右側作共同起點。'},{type:'ordered_sequence',label:'第二排',indices:range(7,14),elementalDignity:true,instruction:'由右至左；不是第一排的時間續篇。'},{type:'ordered_sequence',label:'第三排',indices:range(14,21),elementalDignity:true,instruction:'由右至左；不是預設的未來／結果排。'},{type:'semantic_pairing',label:'首尾配對',pairs:mirrorPairs(0,21),elementalDignity:false,instruction:'配對補充連續答案省略的細節；配對不是左右相鄰。'},{type:'unpaired_member',label:'未配對第11張',indices:[10],elementalDignity:false,instruction:'仍屬整體答案，不是中心結果牌。'}],
      '本方法可由三排連續答案與配對整體作定性裁決，但沒有專屬結果位。',
      '連續答案是主線；配對用來補充、限定或在多組一致反證時修正主線，單一配對不得翻盤。',
      '三排不自動等於過去、現在、未來，也不提供日期。','S. L. MacGregor Mathers 1888 第二法；牌義依本次讀牌方式，代表牌自動選法另見抽牌紀錄'),
    mathers_horseshoe: protocolDef('mathers_horseshoe','ordered_groups_with_mirror_pairs','sequence_member',
      '五十四張都只是A、C、E三組馬蹄序列成員，沒有五十四個獨立牌位。每組先由右至左形成connected answer，再由外向內配對；A、C、E依序讀，F組不讀。',
      ['A組26張由右至左形成第一個連續答案','A1↔A26至A13↔A14配對補充','C組17張同法，C9為未配對成員','E組11張同法，E6為未配對成員','比較C、E如何補充、修正或限定A，但不賦予時間／結果名稱'],
      [{type:'ordered_sequence',label:'A組',indices:range(0,26),elementalDignity:true,instruction:'由右至左讀成connected answer。'},{type:'semantic_pairing',label:'A組配對',pairs:mirrorPairs(0,26),elementalDignity:false,instruction:'A1↔A26至A13↔A14；配對不是元素相鄰。'},{type:'ordered_sequence',label:'C組',indices:range(26,43),elementalDignity:true,instruction:'由右至左讀成第二個connected answer。'},{type:'semantic_pairing',label:'C組配對',pairs:mirrorPairs(26,17),elementalDignity:false,instruction:'C1↔C17至C8↔C10；C9未配對。'},{type:'ordered_sequence',label:'E組',indices:range(43,54),elementalDignity:true,instruction:'由右至左讀成第三個connected answer。'},{type:'semantic_pairing',label:'E組配對',pairs:mirrorPairs(43,11),elementalDignity:false,instruction:'E1↔E11至E5↔E7；E6未配對。'}],
      '本方法以三組完整答案作定性綜合；A、C、E沒有原典授權的過去／現在／未來或最終結果身份。',
      '每組連續答案是主線，該組配對補細節；後組只能補充、修正或限定前組，不能把跨組單牌拼成新句。',
      '牌組先後不是時間軸，牌張數與配對數也不是日期。','S. L. MacGregor Mathers 1888 第一法；牌義依本次讀牌方式'),
    ootk: protocolDef('ootk','five_operation_procedure','procedure_stage',
      'Book T 開鑰之法是五次獨立洗牌與程序操作，不是一般牌陣，也不得與Mathers馬蹄法混用。',
      ['第一次：YHVH四堆、落點驗題、計數故事、配對故事','第二次：十二宮預選主宮／相近宮、計數與配對','第三次：十二星座預選落點、計數與配對','第四次：代表牌後方三十六牌環、計數與配對','第五次：生命之樹十堆、計數與配對、最終結果'],
      [],
      '只有第五次操作具有原典明示的Final Result權限；前四次依各自階段作用。',
      '每次操作先獨立成階段結論；跨操作只能承接階段摘要，不拼接不同操作的單牌。',
      '第四次三十六牌環不是月份或旬位；無外部錨不得換算日期。','Golden Dawn Book T Opening of the Key')
  };

  // v103: interpretation depth belongs to each method, not a single generic paragraph.
  var READING_PLANS = {
  "three_card": [
    "先用一句話確認這三個牌位在本次實際代表什麼。本站預設是既有基礎、核心現況、維持現狀的走向，不是抽完後再改成身心靈或三種選項。",
    "第1張解釋哪種既有條件帶到現在；第2張是目前正在作用的矛盾或資源；第3張解釋這種互動持續時的發展。每張都須參與完整答案。",
    "比較1→2與2→3的變化：是同一傾向累積、轉折，還是表面改善但條件未解？指出造成轉向的具體牌義。",
    "是非題給有條件的偏向及最主要反證；沒有專屬建議位時，從已辨識的限制提出可做的一件事，明示這是建議。"
  ],
  "five_card": [
    "先依本次動態牌位確認第2張是原因、助力或年度驅動因素，不能把所有五牌問題都讀成「原因」。",
    "以第1張描述正在困擾使用者的機制，第2張說明它如何形成或受到推動，第3張辨認真正瓶頸及使用者可否控制。",
    "第4張必須對準第3張的具體限制：說明採取何種行動、需要什麼資源、應避免何種過量反應；不只翻成抽象鼓勵。",
    "第5張結合前四張判斷維持目前條件的走向；若討論採取建議後的改善，要標為條件推演，不能宣稱另抽了一個改善後的結果。",
    "收入或門檻題分開需求、現有資源、代價與達成條件，不能用結果牌直接報金額或成功率。"
  ],
  "cross": [
    "先讀1核心與2交叉力量的具體拉扯，分清是外在障礙、內在猶豫，還是某項優勢使用過度。",
    "以3過去影響→1核心→4後續趨勢建立發展脈絡；第3張說已形成的模式，第4張說近期力量開始往哪裡走。",
    "第5張建議回應交叉力量：哪些需要接受、哪些可以協商、哪些要停止？給出與本題相符的操作方式。",
    "本陣沒有獨立最終結果牌。收束應回答如何鬆動僵局及可能走向，不能把第5張建議當必然結局。"
  ],
  "either_or": [
    "先從原問句逐字對齊A、B選項與共同目標；第1張是共同背景。若分支名稱不完整，明示採用的理解，不自行替使用者新增選項。",
    "A路只讀1、2、4；B路只讀1、3、5。兩路分別說明投入方式、主要代價、可能發展，再使用同一組判準比較。",
    "先比較使用者最重視的條件，再比較時間、資源及可逆性；較順利的牌面不一定符合使用者的優先需求。",
    "給出目前較值得考慮的選項及何種條件下會改選另一項。兩路都受限時可提出蒐集資料或暫緩的現實建議，但不得把它寫成已抽出的第三條路。"
  ],
  "relationship": [
    "第1張談使用者在關係中的需要與表達，第2張是對方在互動中的象徵狀態，第3張是雙方實際形成的關係；比較需求與表達是否互相接得住。",
    "第4張挑戰要連回1、2、3：可能是節奏、溝通、承諾、距離或角色壓力；選哪一解釋須有本盤支持，不能只憑牌名指定第三者。",
    "第5張建議以使用者能做、且尊重對方界線的行動落地；第6張受雙方投入與挑戰是否改變所限定。",
    "問愛意時分開好感、持續投入、願意承諾三件事；問不聯絡時比較關係冷卻、生活壓力或互動習慣等與本盤相容的解釋，指出可觀察差異。",
    "不能把一張對方牌當讀心事實。若對方已明確拒絕或保持距離，建議應尊重其表態；分析的目的包含幫使用者取回選擇權。"
  ],
  "timeline": [
    "先確認問題是詢問發展階段，還是要求日曆日期；本陣五張預設只提供相對時間，不是五個固定月份。",
    "依1前置→2近期→3轉折→4後續→5較後段逐步分析，每段說清正在變化的因素，而非為每張各編一件事件。",
    "第3張轉折須翻成可辨識的觸發條件，並檢查第2與第4張是否支持這種轉變；牌面無明確改變時也要如實說明。",
    "給出使用者可觀察的進展訊號和重新評估點；提問有截止日僅限定觀察範圍，不能據此把五張等分成精確日期。"
  ],
  "horseshoe": [
    "先讀1過去、2現在、3隱藏影響，找出使用者原來的理解與可能忽略的條件；隱藏位只是探索線索，不證明有秘密。",
    "第4張是可採取行動，第5張是他人／環境，第6張是障礙；比較行動能否接住外援、避開摩擦，以及何處超出控制。",
    "第7張受前六張限定。若行動位積極但環境與障礙不支持，應說明成本或前置條件，不能只看結果牌報好消息。",
    "七個牌位各交代其本題作用，再把核心盲點、最有效介入與條件性結果串起來；馬蹄形狀本身不提供時間單位。"
  ],
  "celtic_cross": [
    "本次採Waite式編號：1現況、2交叉、3冠頂／目標與潛能、4根基、5漸退影響、6漸入影響、7本人、8環境、9希望／恐懼、10綜合結果。第3與第5位置不要套入別家版本；本站未另置代表牌，勿編造第11張。",
    "1↔2先定核心矛盾；4→1→3比較已成事實與尚未實現的目標，指出真正落差；5→1→6辨認退場與進場的力量。",
    "7↔8比較本人態度與外界回應是否一致；9分辨希望、恐懼或投射，回頭核對1、2、7、8，不能把害怕的情境判成已發生。",
    "10由前九張整合：說明哪幾組支持、哪一組最能反駁、目前採何種有條件的主判。第6張近期和第10張整體結果可以不同，須解釋中間需要改變什麼。",
    "正文涵蓋十個牌位，但以核心軸線分組說明。末段提出最值得先處理的矛盾、可執行行動和停止無效等待的觀察條件。"
  ],
  "tree_of_life": [
    "這是本站赫密士卡巴拉取向的十質點布局；質點是象徵分析層，不是心理診斷或過去世證據。依資料中的質點與牌位名稱，不混入其他生命之樹排列。",
    "1王冠定位核心方向；2智慧與3理解比較推動力和承載結構；4慈悲與5嚴厲比較擴展、限制及界線；6美麗看整合方式。",
    "7勝利與8光輝比較感受／欲求及語言／思考；9基礎檢視習慣與內在模式如何傳遞；10王國看這些結構如何落到生活實踐。",
    "比較三柱2–4–7、3–5–8及1–6–9–10，不把十質點當十個月份；指出哪一層失衡、哪種資源能接回整合。",
    "反覆模式題要描述「觸發情境—常見反應—代價—可練習的替代行動」，讓使用者檢查是否符合自身經驗。"
  ],
  "zodiac": [
    "逐一讀12個領域：1自我、2個人資源、3學習溝通、4家與根基、5創作戀愛、6日常工作照顧、7伙伴、8共享資源、9遠行信念、10社會角色、11社群願景、12休整與隱性壓力。以實際牌位標示為準。",
    "第13張是跨領域主軸，需從前12張歸納而不是覆蓋它們；每宮至少交代一個和本次問題相關的具體作用。",
    "比較1↔7自我與伙伴、2↔8個人與共享資源、3↔9資訊與觀點、4↔10私人與公共角色、5↔11創作與社群、6↔12日常投入與休整。",
    "選出互相牽動最明顯的領域，說明改善哪一處能帶動另一處；最後排出生活行動的優先順序。",
    "12宮不是12個月份，也不是使用者的實際出生星盤；疾病、死亡和投資收益不能按第6、8、12宮的單牌直接斷定。"
  ],
  "minor_arcana": [
    "本次僅由56張小阿卡那抽取，沒有大牌是牌組設定，不可解釋為問題不重要。",
    "依1現況、2原因、3阻礙辨識日常問題；4外在條件、5可用資源評估能調動的時間、人手與資訊；6行動接回瓶頸，7條件性結果收束。",
    "花色與點數幫助辨別操作、情緒、資訊或物質層面的議題；宮廷牌可代表做事方式、服務窗口或協助角色，需有問題背景支持。",
    "尋物題把牌象轉成待排查的場景特徵，並列出先查最近路線、常放處、聯絡窗口等現實步驟；不宣稱牌已定位某地址或證明遭竊。"
  ],
  "fifteen_card": [
    "嚴格依資料的五個三牌組讀。核心2–1–3先定主題；其他四組分別是4–8–12自然路徑、13–9–5替代路徑、6–10–14決策依據、7–11–15不可控條件。",
    "每組中牌定主題，兩側分別說明如何增強、削弱或限制；元素尊貴須計入兩側彼此的關係，強不等於好、弱不等於壞。十五張都要在組內有作用。",
    "自然與替代兩路依本站抽前設定保持分開，先各自成句，再比較決策依據與不可控條件會讓哪一路更能落地；不可因牌面喜好事後互換路徑。",
    "若兩路相似，指出改變做法仍須面對的共同條件；若兩路相反，指出需要改變哪項行動才成立。這不是五個時間區段，也沒有單獨的最後一張結果牌。",
    "這是本站採用的後世衍生十五張布局，元素規則參考Book T；不得聲稱其布局就是Book T五次開鑰原法或已獲原作者認證。"
  ],
  "mathers_21": [
    "先交代代表牌及實際發牌紀錄，再按資料中三排各七張由右至左讀完整牌句。每排都從同一代表牌重新定位問題，不把三排命名為過去、現在、未來。",
    "三排各自形成一段有主詞、作用、轉折與條件的答案；21張都須在所屬排參與意義，可按相鄰小段合併說明，不能只挑三張當全盤。",
    "依實際序號讀1↔21至10↔12，共10組首尾配對；第11張沒有配對，仍放回第二排序列。配對補充或限定主線，不當相鄰元素線。",
    "綜合三排與配對一致、矛盾的部分，以共同條件回答原問題。沒有抽前時間設定就不為各排指定年份。",
    "此為Mathers 1888第二法布局；本站牌義採本次選定RWS或Book T，屬明示混合用法，不能稱逐字復刻1888原書牌義。"
  ],
  "mathers_horseshoe": [
    "核對實際發牌紀錄為A26、C17、E11，共54張；F24不參與解讀。原文末輪張數存在算術歧義，本站採完整三張組取牌的11／24設定，按這份紀錄讀而不偷偷換牌。",
    "依A→C→E逐組讀由右至左的完整答案，每組用相鄰片段呈現起點、轉折與落點。所有54張納入所屬組，但可合併相同作用，避免54段字典。",
    "每組讀完再由首尾向內配對，A13組、C8組、E5組；C9與E6是未配對成員，仍在各組主線中。",
    "分別說明C、E如何補充、限制或修正A；三組不是三段固定時間，不能跨組抽出喜歡的牌組新故事，也不能把F組拿來補證。",
    "本法的深度在連續答案及配對的相互校驗，最後要收斂到本題的主要困境、條件與可做行動，而不是以張數宣稱更準。"
  ],
  "ootk": [
    "先核對代表牌、提問、各次預選落點與實際完成狀態。第一次主線需問卜者確認；待確認或不適配應如實說明，不能把中止解成凶兆。",
    "第一操作用四堆落點建立當前問題背景，再讀計數與配對。第二操作讀十二宮的發展場域，第三操作讀十二星座的進一步發展；只有實際命中的堆和相近宮紀錄可用。",
    "第四操作讀代表牌後36張環的後段因素；第五操作依十質點堆讀最後整合。五次各自重新洗牌，同牌重現不能當作獨立的現實事件證明。",
    "每次計數故事保留包含起算牌的計數與實際方向，配對故事補充被計數省略的細節；尊貴依所在堆／環的鄰牌，不以計數跳點冒充相鄰。",
    "每一已完成操作都交代它新增了什麼、修正了什麼；跨操作只整合階段結論。只完成前幾次就交付相應範圍，不補造第五次最終結果。"
  ]
};
  var METHOD_REFERENCES = {
  "three_card": [
    "https://labyrinthos.co/blogs/learn-tarot-with-labyrinthos-academy/3-card-tarot-spreads-simple-tarot-spreads-organized-by-layout"
  ],
  "either_or": [
    "https://labyrinthos.co/blogs/learn-tarot-with-labyrinthos-academy/making-tough-choices-a-5-card-tarot-spread-for-decision-making"
  ],
  "relationship": [
    "https://biddytarot.com/blog/relationship-check-in-tarot-spread/"
  ],
  "celtic_cross": [
    "https://sacred-texts.com/tarot/pkt/pkt0307.htm",
    "https://labyrinthos.co/blogs/learn-tarot-with-labyrinthos-academy/the-celtic-cross-tarot-spread-exploring-the-classic-10-card-tarot-spread"
  ],
  "mathers_21": [
    "https://sacred-texts.com/tarot/mathers/mtar04.htm"
  ],
  "mathers_horseshoe": [
    "https://sacred-texts.com/tarot/mathers/mtar04.htm"
  ],
  "ootk": [
    "https://sacred-texts.com/oto/lib78.htm"
  ],
  "fifteen_card": [
    "https://sacred-texts.com/oto/lib78.htm"
  ],
  "tree_of_life": [
    "https://sacred-texts.com/oto/lib78.htm"
  ],
  "five_card": [
    "https://www.learntarot.com/less4.htm",
    "https://www.learntarot.com/less18.htm"
  ],
  "cross": [
    "https://www.learntarot.com/less4.htm",
    "https://www.learntarot.com/less18.htm"
  ],
  "timeline": [
    "https://www.learntarot.com/less4.htm",
    "https://www.learntarot.com/less18.htm"
  ],
  "horseshoe": [
    "https://www.learntarot.com/less4.htm",
    "https://www.learntarot.com/less18.htm"
  ],
  "zodiac": [
    "https://www.learntarot.com/less4.htm",
    "https://www.learntarot.com/less18.htm"
  ],
  "minor_arcana": [
    "https://www.learntarot.com/less4.htm",
    "https://www.learntarot.com/less18.htm"
  ]
};
  Object.keys(METHOD_PROTOCOLS).forEach(function(id){
    METHOD_PROTOCOLS[id].readingPlan=READING_PLANS[id]||[];
    METHOD_PROTOCOLS[id].references=METHOD_REFERENCES[id]||[];
  });

  function method(id){var m=clone(METHODS[id]||null);if(m)m.protocol=clone(METHOD_PROTOCOLS[id]||null);return m;}
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
    var rel=q.match(/(?:(?:未來|接下來)\s*[0-9零〇一二兩三四五六七八九十百]+\s*(?:天|週|個月|月|年)(?:內|後|前)?|本週|這週|下週|今天|明天|後天|近期|短期|長期|未來|過去|目前|現在|年底前|年內|月底前|[0-9零〇一二兩三四五六七八九十百]+\s*(?:天|週|個月|月|年)(?:內|後|前)?)/g)||[];
    rel.forEach(function(surface){
      var compact=text(surface).replace(/\s/g,'');
      var bounded=/(?:前|內|月底|年底|年內)/.test(compact)||/^(?:未來|接下來)[0-9零〇一二兩三四五六七八九十百]+(?:天|週|個月|月|年)$/.test(compact);
      add(surface,'relative_scope',{label:surface,anchor:d.iso},bounded);
    });
    return out.map(function(x){delete x._key;return x;});
  }

  function detectDomains(q){
    var defs=[
      ['relationship',/感情|愛情|婚姻|桃花|戀愛|復合|伴侶|關係|前任|現任|男友|女友|love|romance|relationship|marriage/i],
      ['career',/工作|事業|職場|轉職|離職|升遷|升職|副業|創業|生意|賣場|career|job|work|business/i],
      ['finance',/財運|金錢|財務|投資|收入|營業額|營收|薪水|獲利|利潤|現金流|money|finance|income|revenue/i],
      ['health',/健康|身體|疾病|病症|癌症|腫瘤|感染|疼痛|症狀|診斷|檢查|治療|手術|藥物|睡眠|懷孕|生育|health|illness|cancer|diagnosis|surgery|sleep/i],
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
    var choice=classifyDecisionQuestion(stripSpreadDirective(q)).kind==='binary';
    var timing=/什麼時候|何時|幾時|哪一天|幾月|多久|要等|時間點|when\b|how long|what date|which month/i.test(q);
    var advice=/該先開口|該做什麼|該從哪|怎麼改善|如何處理|怎麼做|怎麼辦|如何改善|建議|策略|方法|該怎麼|下一步|應如何|怎麼找|如何找|what should|what can i do|advice|strategy/i.test(q);
    var hidden=/忽略|盲點|隱藏|背後|未察覺|不知道的|overlook|hidden influence|blind spot/i.test(q);
    var external=/外在|環境|市場|公司環境|家庭影響|別人影響|他人態度|external|environment|market condition/i.test(q);
    var pattern=/為什麼一直|總是|每次都|反覆|重複|循環|模式|always|every time|repeating pattern/i.test(q);
    var spiritual=/靈性|業力|課題|天命|使命|潛意識|靈魂|內在陰影|spiritual|karma|soul|life purpose|subconscious/i.test(q);
    var narrative=/來龍去脈|前因後果|從頭到尾|始末|完整歷程|過去.{0,8}現在.{0,8}未來|whole story|from the beginning|past.*present.*future/i.test(q);
    var exhaustive=/全部攤開|最完整|徹底|人生大局|整個人生|所有人生面向|most exhaustive|complete life reading|everything about my life/i.test(q);
    var deepOverview=/完整|全面|深入|詳細|全局|大局|所有影響|整體局勢|comprehensive|full picture|in depth/i.test(q);
    var practical=/找回.{0,5}(?:錢包|鑰匙|手機|文件|證件)|(?:東西|鑰匙|錢包|手機|文件|證件).{0,10}(?:遺失|不見|掉|找不到|在哪|位置)|(?:遺失|不見|掉了|找不到).{0,10}(?:東西|鑰匙|錢包|手機|文件|證件)|包裹|快遞|訂單|報稅|證件|維修|退貨|寄件|出貨|lost item|package|delivery|repair|refund/i.test(q);
    var location=/從哪裡找|從哪找|找回|在哪(?:裡|邊)?|位置|何處|哪個方向|where\b|location/i.test(q);
    var conflict=/卡住|阻礙|衝突|拉扯|困境|僵局|競爭|壓力|對立|stuck|conflict|blocked/i.test(q);
    var yearScope=(scopes||[]).some(function(s){return s.kind==='calendar_year';}), domainCount=(domains||[]).length;
    var annualWords=/流年|全年|整年|一整年|年度|年運|整體運勢|各方面運勢|各領域運勢|overall outlook|yearly|annual/i;
    var bareYearFortune=yearScope&&domainCount===0&&/(?:今年|明年|20\d{2}年).{0,8}運勢(?:為何|如何|怎樣|怎麼樣)?/i.test(q);
    var annual=yearScope&&(annualWords.test(q)||bareYearFortune), annualSingleDomain=yearScope&&domainCount===1&&!annual;
    // v103.1：人物稱呼還須有關係／互動述詞；第三人的升職或健康不等於雙方關係。
    // 已知雙方必須由主要問句中的正向人物指稱建立；「非現任／排除前任」等排除語不得反向建立既有關係。
    var dyadProbe=q.replace(/(?:非|不是|不含|排除|除了)(?:現任|前任|伴侶|配偶|男友|女友|特定對象)/g,'');
    var knownDyad=/(?:公司)?(?:女|男)?(?:工程師|主管|老闆|同事|朋友|客戶).{0,18}(?:愛我|喜歡我|不回|對我|跟我|和我)|我(?:和|與|跟).{1,24}|(?:這段關係|目前這段關係)|(?:我們).{0,24}(?:關係|互動|相處|復合|分手|在一起|正緣|溝通|衝突)|(?:對方|他|她|現任|前任|伴侶|配偶|男友|女友|主管|老闆|同事|朋友|客戶).{0,12}(?:對我|跟我|和我|與我|怎麼看我|的態度|的想法|的關係)|^(?:對方|他|她|現任|前任|伴侶|配偶|男友|女友)(?!.*(?:是誰|幾歲|多大年紀|做什麼工作|什麼職業|長什麼樣|住哪)).{0,32}(?:愛我|喜歡我|想我|告白|正緣|真心|復合|分手|在一起|交往|找我|回我|理我|主動聯絡|回覆|回訊息|聯絡我|聯繫我|見面|相處|互動|關係)|between us|my partner|my ex|my boss/i.test(dyadProbe);
    var unknownPerson=/有人|某人|哪個人|誰會|新對象|未來對象|桃花|暗戀我|喜歡我嗎|追求我|future partner|anyone likes me|who will/i.test(q)&&!knownDyad;
    var yesNo=/(?:嗎[？?]?\s*$|會不會|有沒有|該不該|可不可以|能不能|能否|是否|可否|是不是|適不適合|要不要|應不應該|值不值得)|\b(?:will|can|should|is|are|do|does)\b/i.test(q);
    var descriptive=isNominalWeiHe(q)||/如何[？?]?$|怎麼樣[？?]?$|怎樣[？?]?$|狀況如何|運勢如何|走向如何|what is .* like|how is/i.test(q);
    var multiDomain=domainCount>=2&&(/(?:感情|愛情|婚姻|桃花|工作|事業|財運|財務|家庭|學業|健康|旅行)(?:方面)?(?:、|以及|及|和|與|跟)(?:感情|愛情|婚姻|桃花|工作|事業|財運|財務|家庭|學業|健康|旅行)/.test(q)||/各方面|一起看|都看|所有領域|both|all areas|together/i.test(q));
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
  function stripSpreadDirective(v){
    var out=text(v);
    out=out.replace(/^(?:請|麻煩|幫我|請幫我)?\s*(?:用|使用|採用)\s*(?:Golden\s*Dawn|金色黎明|Book\s*T|Liber\s*T)?\s*(?:開鑰之法|Opening\s+of\s+the\s+Key|Mathers[^看占解讀分析]{0,16}|凱爾特十字(?:牌陣)?|生命之樹(?:牌陣)?|黃道十二宮(?:牌陣)?|十二宮(?:牌陣)?|七張馬蹄(?:形)?(?:牌陣)?|馬蹄形(?:牌陣)?|關係牌陣|時間線牌陣|十字牌陣|三牌陣|三張牌陣|五牌陣|五張牌陣|二選一牌陣|雙路比較牌陣|小阿卡那(?:實務)?牌陣|十五張(?:牌陣)?|二十一張(?:牌陣)?|五十四張(?:牌陣)?)\s*(?:來)?\s*(?:看|占|解讀|分析|問)?\s*/i,'');
    return text(out);
  }
  function cleanCore(q,scopes){var out=stripSpreadDirective(q).replace(/[？?。！!，,]+$/,'');(scopes||[]).forEach(function(s){out=out.split(s.surface).join('');});return text(out);}
  function stripQuestionPrefix(v){return text(v).replace(/^(?:請|幫我|請幫我|想問|我想問|看看|看一下)\s*/,'').replace(/^(?:我|本人)(?:的)?/,'').replace(/^(?:該|應該|要選|選擇|要不要|是否要|是否該)\s*/,'').trim();}
  function stripComparisonOperand(v){var raw=text(v);if(/^(?:我|本人)$/.test(raw))return '問卜者本人';return stripModalTail(stripQuestionPrefix(raw)).replace(/(?:未來|之後|接下來)$/,'').replace(/(?:能|會|可以|可能)?(?:成功|達成|做到|實現)$/,'').trim();}
  function stripModalTail(v){return text(v).replace(/(?:一定|必然|應該|可能|會不會|能不能|可不可以|是否|有沒有|可以|能夠|會|能)+$/g,'').trim();}
  function metricName(v){var m=text(v).match(/(營業額|營收|收入|薪水|獲利|利潤|成本|價格|金額|數量|人數|成績|表現|速度|高度|重量|價值|程度)$/);return m?m[1]:'';}
  function splitEntityMetric(v){var m=text(v).match(/^(.+?)(?:的)?(營業額|營收|收入|薪水|獲利|利潤|成本|價格|金額|數量|人數|成績|表現|速度|高度|重量|價值|程度)$/);return m?{entity:text(m[1]),metric:m[2]}:{entity:text(v),metric:''};}

  function scaleLabel(v){return v==='suitability'?'適合度':(v==='model_resolve_same_scale'?'同一可比較尺度':text(v));}
  function queryOperatorLabel(v){var map={truth_or_realization:'是否成立',choice:'選擇較適合者',qualitative_description:'描述狀態與走向',cause_explanation:'說明原因／形成機制',relative_timing:'判斷相對時序',location_guidance:'判斷位置線索',action_guidance:'提出可介入方向',exact_attribute:'詢問精確人物屬性'};return map[v]||text(v);}

  // v99：先把多子題切成獨立查詢事件，避免把「會不會發生？她幾歲？」整串塞進同一 target。
  function splitQuestionClauses(q){
    q=text(q);if(!q)return [];
    var source=q.match(/[^？?！!。；;]+[？?！!。；;]?/g)||[q];
    // A/B labels may be written on separate lines or separated by a semicolon.
    // They still form one comparison; preserve the later independent questions.
    if(/A(?:\s*[：:.、]|\s+)[\s\S]+B(?:\s*[：:.、]|\s+)/i.test(q)&&classifyDecisionQuestion(q).kind==='binary'){
      var end=q.search(/[？?！!。]/);if(end<0)source=[q];
      else source=[q.slice(0,end+1)].concat(q.slice(end+1).match(/[^？?！!。；;]+[？?！!。；;]?/g)||[]);
    }
    var out=source.map(function(x){return text(x).replace(/[？?！!。；;]+$/,'');}).filter(Boolean);
    if(out.length===1){
      var m=out[0].match(/^(.+?嗎)(?=(?:他|她|它|對方|這個人|那個人|其).{0,20}(?:幾歲|年齡|姓名|名字|身分|職業|工作|外貌|長相|星座|生肖|住哪|在哪))/);
      if(m){var rest=text(out[0].slice(m[1].length));out=[text(m[1]),rest].filter(Boolean);}
    }
    return out.map(function(surface,index){return {id:'Q'+pad(index+1,2),surface:surface,index:index};});
  }

  function attributeRequest(clause){
    var c=text(clause).replace(/\s/g,'');
    var subject='';
    var sm=c.match(/^(他|她|它|對方|這個人|那個人|其)/);if(sm){subject=sm[1];c=c.slice(sm[1].length).replace(/^的/,'');}
    var defs=[
      {id:'exact_age',re:/^(?:幾歲|多大(?:年紀)?|年齡(?:是多少|多大|如何)?)/,label:'實際年齡',role:'age'},
      {id:'identity',re:/^(?:是誰|誰|姓名|名字|身分(?:是什麼)?|什麼人)/,label:'人物身分',role:'identity'},
      {id:'person_attribute',re:/^(?:做什麼工作|從事什麼|什麼職業|職業(?:是什麼)?|工作(?:是什麼)?)/,label:'職業',role:'occupation'},
      {id:'person_attribute',re:/^(?:長什麼樣|外貌|長相|身高|體重)/,label:'外貌／身體特徵',role:'appearance'},
      {id:'person_attribute',re:/^(?:什麼星座|什麼生肖|星座|生肖)/,label:'星座／生肖',role:'astrological_identity'},
      {id:'exact_location',re:/^(?:住哪|住在哪|在哪裡|來自哪裡|哪裡人)/,label:'具體地點',role:'location'}
    ];
    for(var i=0;i<defs.length;i+=1){var m=c.match(defs[i].re);if(m)return {dimensionId:defs[i].id,label:defs[i].label,attributeRole:defs[i].role,subjectSurface:subject||'',source:text(clause),matched:m[0]};}
    return null;
  }

  function unsupportedDimensionsFor(q){
    var out=[];
    if(/多少錢|多少(?:收入|薪水|營收|營業額|獲利|成本)|具體(?:金額|數字|數值)|確切(?:金額|數字|數值)|價位/.test(q))out.push('exact_value');
    if(/百分比|幾成|機率|概率|%/.test(q))out.push('probability');
    if(/幾個|幾位|多少人|人數|數量/.test(q))out.push('cardinality');
    if(/幾歲|多大年紀|年齡|年齡區間/.test(q))out.push('exact_age');
    if(/姓名|名字|身分|是什麼人|是誰|什麼人/.test(q))out.push('identity');
    if(/職業|工作是什麼|做什麼工作|什麼職業|外貌|長相|長什麼樣|身高|體重|星座|生肖/.test(q))out.push('person_attribute');
    if(/住哪|住在哪|具體地點|地址|哪裡人/.test(q))out.push('exact_location');
    if(/哪一天|幾月(?:幾號)?|確切日期|幾號/.test(q))out.push('exact_date');
    return uniq(out);
  }

  function detectNumericThreshold(q,scopes){
    var core=cleanCore(q,scopes);
    var metric='(?:營業額|營收|收入|薪水|獲利|利潤|成本|價格|金額|數量|人數|成績|表現|速度|高度|重量|價值|程度)';
    var number='(?:[0-9][0-9,]*(?:\\.[0-9]+)?(?:萬|億)?|[零〇一二兩三四五六七八九十百千萬億]+)';
    var re=new RegExp('^(.*?)('+metric+')(?:是否|能否|可否|能不能|可不可以|會不會|可以|能夠|可能|會|能)?\\s*(不超過|至多|低於|小於|少於|破|超過|高於|大於|達到|至少)\\s*('+number+')');
    var m=core.match(re); if(!m)return null;
    var subject=stripQuestionPrefix(m[1])||'問卜者本人', metricNameValue=m[2], opText=m[3], thresholdSurface=m[4], value=parseChineseNumber(thresholdSurface);
    if(value==null)return null;
    var op=(opText==='破'||opText==='超過'||opText==='高於'||opText==='大於')?'gt':(opText==='達到'||opText==='至少')?'gte':(opText==='不超過'||opText==='至多')?'lte':'lt';
    return {id:'R01',type:'fixed_numeric_threshold',subject:subject,metric:metricNameValue,operator:op,operatorText:opText,thresholdValue:value,thresholdSurface:thresholdSurface,source:m[0]};
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
  if (/\bA(?:\s*[：:.、]|\s+)[\s\S]+\bB(?:\s*[：:.、]|\s+)[\s\S]+\bC(?:\s*[：:.、]|\s+)/i.test(raw) || /(?:三|四|五|3|4|5)(?:個|家|種)?(?:選項|方案)|三選一|三擇一|四選一/.test(raw)) return result('multiple', null, null, '超過兩個方案，不能套成只有 A、B 的牌位。');
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
  var decisionCue = /(?:我|我們)(?:(?:和|跟|與).{1,16})?(?:到底)?(?:該|應該|可以|要|想選|選|考慮)|^(?:該|應該|要|選|考慮)|二選一|二擇一|兩個選項|請比較|(?:哪一個|哪個|何者)(?:比較|較|更)?(?:適合|好|有利|可行)|(?:該|應該)選|比較.{1,50}(?:適合|有利)/.test(q);
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
    var hypothesis = /^(?:只是|僅僅|單純)|禮貌|客氣|沒興趣|不喜歡|不愛|挑戰|變糟|失敗|生氣|隱瞞/.test(right) || /(?:會|能|是|喜歡|愛我|機會|變好|上漲|下跌)/.test(left);
    if (!decisionCue && !labels && !(actionStart.test(left) && actionStart.test(right))) return result(hypothesis ? 'hypotheses' : 'ambiguous', null, null, '這是在詢問狀況或不同解釋；沒有確認是命主可選的兩個行動。');
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
  function detectRelation(q,scopes){
    var numeric=detectNumericThreshold(q,scopes);if(numeric)return numeric;
    var core=cleanCore(q,scopes);
    var decision=classifyDecisionQuestion(stripSpreadDirective(q));
    if(decision.kind==='binary')return {id:'R01',type:'alternative_comparison',operator:'choose',operatorText:'比較原文兩個方案',left:decision.left,right:decision.right,scale:'suitability',source:decision.source};
    if(/^(hypotheses|multiple|ambiguous|incomplete)$/.test(decision.kind))return null;
    var bm=core.match(/^(.{1,36}?)\s*比\s*(.{1,48}?)(?:嗎|呢|？|\?|$)/);
    if(bm){
      var tail=text(bm[2]),detail=tail.match(/^(.+?)(?:的)?(營業額|營收|收入|薪水|獲利|利潤|成本|價格|金額|數量|人數|成績|表現|速度|高度|重量|價值|穩定度)(更|較)?(高|低|多|少|好|差|快|慢|強|弱|穩定)$/);
      if(detail)return {id:'R01',type:'entity_comparison',operator:'comparative',operatorText:text(detail[3])+detail[4],left:stripComparisonOperand(bm[1]),right:stripComparisonOperand(detail[1]),scale:detail[2],source:bm[0]};
      var simple=tail.match(/^(.+?)(更|較)?(成功|適合|有利|穩定|好|差|快|慢|高|低|多|少|強|弱)$/);
      if(simple){var scaleMap={成功:'成功程度',適合:'適合度',有利:'有利程度',穩定:'穩定度',好:'整體表現',差:'整體表現',快:'速度',慢:'速度',高:'高度／程度',低:'高度／程度',多:'數量／程度',少:'數量／程度',強:'強度',弱:'強度'};return {id:'R01',type:'entity_comparison',operator:'comparative',operatorText:text(simple[2])+simple[3],left:stripComparisonOperand(bm[1]),right:stripComparisonOperand(simple[1]),scale:scaleMap[simple[3]]||simple[3],source:bm[0]};}
    }
    var patterns=[{re:/(.{1,48}?)\s*(超過|高於|大於|多於)\s*(.{1,48}?)(?:嗎|呢|？|\?|$)/,op:'gt'},{re:/(.{1,48}?)\s*(低於|小於|少於|不及)\s*(.{1,48}?)(?:嗎|呢|？|\?|$)/,op:'lt'},{re:/(.{1,48}?)\s*(等於|相同於|一樣多|持平)\s*(.{1,48}?)(?:嗎|呢|？|\?|$)/,op:'eq'}];
    for(var i=0;i<patterns.length;i+=1){var m=core.match(patterns[i].re);if(!m)continue;
      var rawLeft=text(m[1]),rawRight=text(m[3]),lm=splitEntityMetric(stripComparisonOperand(rawLeft)),rm=splitEntityMetric(stripComparisonOperand(rawRight));
      var inferredScale=lm.metric||rm.metric||(/成功|達成|實現/.test(rawLeft+rawRight)?'成功程度':'model_resolve_same_scale');
      return {id:'R01',type:'entity_comparison',operator:patterns[i].op,operatorText:m[2],left:lm.entity,right:rm.entity,scale:inferredScale,source:m[0]};}
    return null;
  }

  function queryTarget(q,scopes,intent){
    var core=cleanCore(q,scopes);core=core.replace(/^(?:我|本人)(?:的)?/,'').replace(/^(?:請|幫我|請幫我|想問|我想問)\s*/,'').replace(/^想(?:要)?(?:完整|全面|深入|詳細)?(?:知道|了解|看看|詢問|問)\s*/,'').replace(/^把(?:我|本人)?(?:的)?\s*/,'');
    if(intent.causal)core=core.replace(/^(?:為什麼|為何|什麼原因|怎麼會)/,'');
    if(intent.timing)core=core.replace(/^(?:什麼時候|何時|幾時|多久)/,'').replace(/^(?:會|能|可以|可能)/,'');
    core=core.replace(/(?:為何|如何|怎麼樣|怎樣|是什麼|會怎樣|會如何|會怎麼發展|嗎|呢)$/,'').replace(/(?:徹底)?攤開$/,'');
    if(intent.location)core=core.replace(/(?:在)?哪(?:裡|邊)|何處|什麼位置|哪個方向/g,'位置');
    if(intent.advice)core=core.replace(/(?:我)?(?:該|應該)?(?:怎麼做|怎麼辦|如何改善|下一步|怎麼找|如何找)$/,'');
    if(intent.hidden||intent.external){
      core=core.replace(/(?:有)?(?:哪些|什麼|何種|有何)?(?:隱藏|背後|未察覺|盲點|外在|環境)(?:與|和|及|或)?(?:隱藏|背後|未察覺|盲點|外在|環境)?(?:條件|影響|因素|力量|作用)?$/,'');
      core=core.replace(/(?:忽略了?|未察覺|不知道的)(?:哪些|什麼|何種)?(?:外在|環境|隱藏|背後|盲點)+(?:條件|影響|因素|力量|作用)?$/,'');
    }
    return text(core)||'整體事件／狀態';
  }

  function buildShape(intent,relation,scopes,domains){
    if(intent.exhaustive)return 'exhaustive'; if(intent.narrative)return 'narrative';
    if(relation&&relation.type==='alternative_comparison')return 'choice'; if(relation&&relation.type==='entity_comparison')return 'comparison'; if(relation&&relation.type==='fixed_numeric_threshold')return 'threshold';
    if(intent.timing)return 'timing'; if(intent.knownDyad)return 'dyad'; if(intent.location)return 'location'; if(intent.pattern||intent.spiritual)return 'deep_structure';
    if(intent.annual)return 'annual';
    if((scopes||[]).some(function(s){return s.bounded;})&&intent.yesNo)return 'bounded_yes_no';
    if(intent.annualSingleDomain&&!intent.timing)return 'annual_single_domain';
    if(intent.multiDomain)return 'multi_domain'; if(intent.hidden||intent.external)return 'hidden_external'; if(intent.deepOverview)return 'deep_overview'; if(intent.conflict)return 'conflict';
    if(intent.causal||intent.advice)return 'cause_action'; if(intent.yesNo)return 'yes_no'; return 'simple';
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

  function questionFocus(q) {
    return text(q).replace(/(?:我)?(?:並?不是|並?非)(?:在)?(?:問|要問|想問|詢問)[^，。；;！？?]*?(?=而是|[，。；;！？?]|$)/g, '')
      .replace(/(?:不用|不要用|不使用|不採用|排除)\s*(?:Mathers\s*)?(?:凱爾特十字(?:牌陣)?|生命之樹(?:牌陣)?|(?:黃道)?十二宮(?:牌陣)?|五十四張(?:牌陣|牌)?|54\s*張(?:牌陣|牌)?|二十一張(?:牌陣|牌)?|21\s*張(?:牌陣|牌)?|三牌陣|五牌陣|關係牌陣|時間線牌陣|十字牌陣)/gi, '')
      .replace(/^[，。；;！？?\s]+|[，。；;！？?\s]+$/g, '').trim();
  }
  function comparisonKind(q) {
    return classifyDecisionQuestion(stripSpreadDirective(q)).kind;
  }

  function compileQuestion(question,options){
    options=options||{};
    var q=normalize(question)||'（未提供明確問題）';
    var analysisQ=questionFocus(q)||q;
    var clauses=splitQuestionClauses(analysisQ);
    var scopes=detectScopes(analysisQ,options.referenceDate,options.timezone),domains=detectDomains(analysisQ);
    var clauseMeta=clauses.map(function(clause){
      var analysisSurface=stripSpreadDirective(clause.surface)||clause.surface;
      var cs=detectScopes(analysisSurface,options.referenceDate,options.timezone),cd=detectDomains(analysisSurface),ci=detectIntent(analysisSurface,cs,cd);
      ci._q=analysisSurface;
      return {clause:clause,analysisSurface:analysisSurface,scopes:cs,domains:cd,intent:ci,relation:detectRelation(analysisSurface,cs),attribute:attributeRequest(analysisSurface)};
    });
    var inheritedScopeNotes=[];
    clauseMeta.forEach(function(meta,index){
      if(index>0&&!meta.scopes.length&&!meta.attribute&&clauseMeta[0]&&clauseMeta[0].scopes.length){
        meta.scopes=clone(clauseMeta[0].scopes);meta.inheritedScope=true;
        inheritedScopeNotes.push({eventIndex:index,scope:meta.scopes.map(function(x){return x.surface;}).join('、')});
      }
    });
    var intent=detectIntent(analysisQ,scopes,domains);intent._q=analysisQ;
    ['causal','choice','timing','advice','hidden','external','pattern','spiritual','narrative','exhaustive','deepOverview','practical','location','conflict','yesNo','descriptive'].forEach(function(k){
      intent[k]=!!intent[k]||clauseMeta.some(function(x){return !!x.intent[k];});
    });
    // 人物共指只由第一個非屬性事件建立。附屬「她幾歲／他是誰」不得把未知人物誤升格為既知雙方。
    var primaryMeta=clauseMeta.find(function(x){return !x.attribute;})||clauseMeta[0];
    intent.knownDyad=!!(primaryMeta&&primaryMeta.intent&&primaryMeta.intent.knownDyad);
    intent.unknownPerson=!!(primaryMeta&&primaryMeta.intent&&primaryMeta.intent.unknownPerson);
    if(intent.unknownPerson)intent.knownDyad=false;
    var yearScope=scopes.some(function(s){return s.kind==='calendar_year';});
    intent.multiDomain=!!intent.multiDomain||(domains.length>=2&&clauseMeta.some(function(meta,i){return i>0&&meta.domains.some(function(id){return clauseMeta[0].domains.indexOf(id)<0;})&&/如何|怎樣|運勢|會不會|能不能|嗎/.test(meta.analysisSurface);}));
    // 年份＋多個關鍵字不等於年度總覽；只有原句確實並列多領域時才升格為 annual overview。
    if(yearScope&&intent.multiDomain)intent.annual=true;
    intent.annualSingleDomain=yearScope&&domains.length===1&&!intent.annual;
    var relations=clauseMeta.map(function(x){return x.relation;}).filter(Boolean),relation=relations[0]||null;
    var shape=buildShape(intent,relation,scopes,domains);
    var atoms=[],entities=[{id:'QUERENT',type:'querent',source:'問卜者'}],constraints=[],assumptions=[],events=[],graphRelations=[];
    var explicitThird=q.match(/^([^，。！？?]{1,20}?)(?:的)(?:今年|明年|未來|目前|現在)?(?:運勢|狀況|感情|工作|事業|健康|財運)/),actor='QUERENT';
    if(explicitThird&&!/^我$|^本人$/.test(text(explicitThird[1]))){actor='ACTOR_1';entities.push({id:actor,type:'query_explicit_actor',surface:text(explicitThird[1]),source:explicitThird[1]});}
    var explicitSelf=/(?:我|本人)(?:的)?/.test(q),implicitActor=actor==='QUERENT'&&!explicitSelf;
    if(implicitActor)assumptions.push({id:'AS01',type:'deictic_subject_resolution',value:'省略主詞依占卜語境解析為問卜者本人',status:'explicitly_marked'});
    inheritedScopeNotes.forEach(function(note){assumptions.push({id:'AS'+pad(assumptions.length+1,2),type:'scope_ellipsis_resolution',value:'後續平行子問句沿用前一子問句明示範圍：'+note.scope,status:'explicitly_marked'});});
    function atom(kind,value,role,source,eventId,implicit){value=text(value);if(!value)return;atoms.push({id:'A'+pad(atoms.length+1,2),kind:kind,text:value,source:text(source||value),essential:true,eventId:eventId||'QUERY_EVENT',role:role,implicit:!!implicit});}
    var rootEntityId='';
    if(intent.unknownPerson){
      rootEntityId='UNBOUND_ENTITY_01';
      entities.push({id:rootEntityId,type:'unbound_person',source:'原問句中的未知人物／新對象',bindingStatus:'conditional_unbound'});
    }
    clauseMeta.forEach(function(meta,index){
      var clause=meta.clause.surface,analysisClause=meta.analysisSurface||clause,eventId=index===0?'QUERY_EVENT':'QUERY_EVENT_'+pad(index+1,2),roles={actor:actor,target:'',subject:'',metric:'',threshold:'',leftOperand:'',rightOperand:'',attribute:'',comparator:'',queryOperator:''};
      var eventType='qualitative_state_query',predicate='describe_state',modality=(analysisClause.match(/(?:一定|必然|應該|可能|會不會|能不能|可不可以|是否|有沒有|可以|能夠|能否|可否|要不要|應不應該|會|能)/)||[])[0]||'open';
      atom('actor',actor==='QUERENT'?'問卜者本人':text(explicitThird&&explicitThird[1]),'actor',actor==='QUERENT'?(implicitActor?'語境預設問卜者':(q.indexOf('本人')>=0?'本人':'我')):text(explicitThird&&explicitThird[1]),eventId,implicitActor);
      var rel=meta.relation;
      if(meta.attribute){
        var subjectId=rootEntityId||'UNBOUND_ENTITY_01';
        if(!rootEntityId){rootEntityId=subjectId;entities.push({id:subjectId,type:'unbound_person',source:meta.attribute.subjectSurface||'附屬人物指稱',bindingStatus:'conditional_unbound'});}
        eventType='person_attribute_query';predicate='query_person_attribute';roles.subject=subjectId;roles.attribute=meta.attribute.attributeRole;roles.queryOperator='exact_attribute';
        atom('entity_reference',meta.attribute.subjectSurface||'該人物','subject',meta.attribute.source,eventId,false);
        atom('requested_attribute',meta.attribute.label,'attribute',meta.attribute.matched,eventId,false);
        atom('query_operator',queryOperatorLabel('exact_attribute'),'queryOperator',clause,eventId,false);
        if(index>0)graphRelations.push({id:'QR'+pad(graphRelations.length+1,2),type:'conditional_coreference',fromEventId:eventId,toEventId:'QUERY_EVENT',entityId:subjectId,source:meta.attribute.subjectSurface||'附屬人物指稱',rule:'只有主要事件建立並完成實體共指後，附屬人物屬性問題才有可回答對象；未量測屬性仍須明示未量測。'});
      }else if(rel&&rel.type==='fixed_numeric_threshold'){
        eventType='fixed_threshold_event';predicate='cross_fixed_threshold';var sid='SUBJECT_'+pad(index+1,2);entities.push({id:sid,type:'query_subject',surface:rel.subject,owner:'QUERENT',source:rel.subject});roles.subject=sid;roles.metric=rel.metric;roles.threshold='THRESHOLD_'+pad(index+1,2);roles.comparator=rel.operator;roles.queryOperator='truth_or_realization';
        atom('subject',rel.subject,'subject',rel.subject,eventId);atom('measured_attribute',rel.metric,'metric',rel.metric,eventId);atom('comparator',rel.operatorText,'comparator',rel.operatorText,eventId);atom('threshold_value',rel.thresholdSurface+'〔'+rel.thresholdValue+'〕','threshold',rel.thresholdSurface,eventId);atom('query_operator',queryOperatorLabel('truth_or_realization'),'queryOperator',clause,eventId);
      }else if(rel&&rel.type==='alternative_comparison'){
        eventType='alternative_comparison';predicate='compare_branches';var leftId='REL_LEFT_'+pad(index+1,2),rightId='REL_RIGHT_'+pad(index+1,2);entities.push({id:leftId,type:'query_explicit_operand',surface:rel.left,source:rel.left});entities.push({id:rightId,type:'query_explicit_operand',surface:rel.right,source:rel.right});roles.leftOperand=leftId;roles.rightOperand=rightId;roles.comparator=rel.operator;roles.attribute=rel.scale;roles.queryOperator='choice';
        atom('left_operand',rel.left,'leftOperand',rel.left,eventId);atom('comparator',rel.operatorText,'comparator',rel.source,eventId);atom('right_operand',rel.right,'rightOperand',rel.right,eventId);atom('measured_attribute',scaleLabel(rel.scale),'attribute',rel.scale,eventId);atom('query_operator',queryOperatorLabel('choice'),'queryOperator',clause,eventId);
      }else if(rel){
        eventType='entity_comparison';predicate='compare_on_same_scale';var lId='REL_LEFT_'+pad(index+1,2),rId='REL_RIGHT_'+pad(index+1,2);entities.push({id:lId,type:'query_explicit_operand',surface:rel.left,source:rel.left});entities.push({id:rId,type:'query_explicit_operand',surface:rel.right,source:rel.right});roles.leftOperand=lId;roles.rightOperand=rId;roles.comparator=rel.operator;roles.attribute=rel.scale;roles.queryOperator='truth_or_realization';
        atom('left_operand',rel.left,'leftOperand',rel.left,eventId);atom('measured_attribute',scaleLabel(rel.scale),'attribute',rel.source,eventId);atom('comparator',rel.operatorText,'comparator',rel.operatorText,eventId);atom('right_operand',rel.right,'rightOperand',rel.right,eventId);atom('query_operator',queryOperatorLabel('truth_or_realization'),'queryOperator',clause,eventId);
      }else{
        var target=queryTarget(analysisClause,meta.scopes,meta.intent),targetId=index===0?'TARGET_STATE':'TARGET_STATE_'+pad(index+1,2);entities.push({id:targetId,type:'query_target',surface:target,source:target});roles.target=targetId;if(rootEntityId&&index===0)roles.conditionalEntity=rootEntityId;atom('state_target',target,'target',target,eventId);
        var op='qualitative_description';if(meta.intent.causal)op='cause_explanation';else if(meta.intent.timing)op='relative_timing';else if(meta.intent.location)op='location_guidance';else if(meta.intent.advice)op='action_guidance';else if(meta.intent.yesNo)op='truth_or_realization';roles.queryOperator=op;atom('query_operator',queryOperatorLabel(op),'queryOperator',analysisClause,eventId);
      }
      if(modality!=='open')atom('modality',modality,'modality',modality,eventId);
      meta.scopes.forEach(function(sc){atom('scope',sc.resolved&&sc.resolved.label?sc.surface+'〔'+sc.resolved.label+'〕':sc.surface,'timeScope',sc.source,eventId);constraints.push({id:'C'+pad(constraints.length+1,2),type:'scope',surface:sc.surface,text:sc.surface,resolved:clone(sc.resolved),bounded:sc.bounded,timezone:sc.timezone,attach:eventId+'.timeScope',source:sc.source});});
      (analysisClause.match(/(?:不會|不能|沒有|未曾|尚未|不要|不再|不是|不成立)/g)||[]).forEach(function(x){atom('polarity',x,'polarity',x,eventId);constraints.push({id:'C'+pad(constraints.length+1,2),type:'polarity',surface:x,text:x,attach:eventId+'.polarity',source:x});});
      (analysisClause.match(/(?:除了|排除|不含)[^，。！？?]{1,24}|非(?:現任|前任|本人|單身|特定對象|[^的，。！？?\s]{1,10})/g)||[]).forEach(function(x){var cleanEx=x.replace(/(?:嗎|呢)$/,'');atom('exclusion',cleanEx,'exclusion',x,eventId);constraints.push({id:'C'+pad(constraints.length+1,2),type:'exclusion',surface:cleanEx,text:cleanEx,attach:eventId+'.exclusion',source:x});});
      var clauseReq=requiredObservables(meta.intent,rel,meta.scopes,meta.domains,buildShape(meta.intent,rel,meta.scopes,meta.domains));
      events.push({id:eventId,type:eventType,surface:clause,analysisSurface:analysisClause,predicate:predicate,roles:roles,modality:modality,timeScope:meta.scopes.map(function(s){return s.surface;}),resolvedTimeScopes:clone(meta.scopes),relationIds:rel?[rel.id]:[],shape:buildShape(meta.intent,rel,meta.scopes,meta.domains),requiredObservables:clauseReq,dependsOn:index>0&&meta.attribute?['QUERY_EVENT']:[]});
    });
    var reqObs=requiredObservables(intent,relation,scopes,domains,shape),unsupported=unsupportedDimensionsFor(q);
    var dims=[],seenDim=Object.create(null);
    function addDim(id,label,source){var key=id+'|'+source;if(seenDim[key])return;seenDim[key]=1;dims.push({id:id,label:label,source:source});}
    clauseMeta.forEach(function(meta,index){
      if(meta.attribute)addDim(meta.attribute.dimensionId,meta.attribute.label,meta.clause.surface);
      else addDim('event_or_state','核心事件／狀態',meta.clause.surface);
      var creq=events[index].requiredObservables||[];creq.forEach(function(id){if(id!=='state')addDim(id,OBSERVABLES[id]||id,meta.clause.surface);});
    });
    unsupported.forEach(function(id){var labels={exact_value:'精確數值／金額',cardinality:'精確人數／數量',exact_age:'實際精確年齡',identity:'具體人物身分',person_attribute:'具體人物屬性',exact_location:'具體地點',exact_date:'精確日期',probability:'精確機率／比例'};if(!dims.some(function(d){return d.id===id;}))addDim(id,labels[id]||id,q);});
    if(scopes.length)addDim('time_scope','使用者明示期限／範圍',scopes.map(function(s){return s.surface;}).join('、'));
    var canonical=atoms.map(function(a){return a.eventId+':'+a.role+'='+a.text;}).join('|');
    var deletion=atoms.map(function(a){var rem=atoms.filter(function(x){return x.id!==a.id;});return {atomId:a.id,removedRole:a.role,changesTruthConditions:rem.map(function(x){return x.eventId+':'+x.role+'='+x.text;}).join('|')!==canonical&&!rem.some(function(x){return x.eventId===a.eventId&&x.role===a.role&&x.text===a.text;})};});
    var reconstructed=events.map(function(event){
      if(event.type==='person_attribute_query'){var attrLabel={age:'實際年齡',identity:'人物身分',occupation:'職業',appearance:'外貌／身體特徵',astrological_identity:'星座／生肖',location:'具體地點'}[event.roles.attribute]||'人物屬性';return (event.roles.subject==='UNBOUND_ENTITY_01'?'該人物':'該對象')+'的'+attrLabel+'為何？';}
      var sourceMeta=clauseMeta[events.indexOf(event)],rel=sourceMeta&&sourceMeta.relation,ss=(sourceMeta&&sourceMeta.scopes||[]).map(function(x){return x.surface;}).join('');
      if(rel&&rel.type==='fixed_numeric_threshold')return ss+'我的'+rel.subject+rel.metric+(event.modality==='open'?'是否能':event.modality)+rel.operatorText+rel.thresholdSurface+'？';
      if(rel&&rel.type==='alternative_comparison')return ss+rel.left+'與'+rel.right+'何者較適合？';
      if(rel){var scale=rel.scale&&rel.scale!=='model_resolve_same_scale'?rel.scale:'';return ss+'我的'+rel.left+(scale?scale:'')+(event.modality==='open'?'是否':event.modality)+rel.operatorText+rel.right+(scale?scale:'')+'？';}
      return ss+queryTarget(event.analysisSurface||event.surface,sourceMeta.scopes,sourceMeta.intent)+(sourceMeta.intent.causal?'的原因為何？':sourceMeta.intent.timing?'的相對時序為何？':sourceMeta.intent.location?'的位置為何？':sourceMeta.intent.advice?'應如何處理？':sourceMeta.intent.yesNo?'是否成立？':'如何？');
    }).join('；');
    var eventIds=setOf(events.map(function(e){return e.id;}));
    var hasActor=atoms.some(function(a){return a.role==='actor';}),noWhole=atoms.every(function(a){return normalize(a.text)!==q&&a.text.indexOf('?')<0&&a.text.indexOf('？')<0;}),allSensitive=deletion.every(function(x){return x.changesTruthConditions;});
    var everyEventTyped=events.length===clauses.length&&events.every(function(event){return !!event.predicate&&!!event.roles.queryOperator&&(!!event.roles.target||!!event.roles.subject||!!event.roles.leftOperand);});
    var noAdded=assumptions.every(function(a){return a.status==='explicitly_marked';});
    var valid=hasActor&&noWhole&&allSensitive&&everyEventTyped&&noAdded;
    var graph={schema:'typed_query_graph/7',events:events,entities:entities,relations:relations.concat(graphRelations),constraints:constraints,assumptions:assumptions,requiredAtoms:atoms,requiredObservables:reqObs,unsupportedDimensions:unsupported,roundTripReconstruction:reconstructed,canonicalSemanticSignature:canonical,compilerStatus:valid?'validated_atomized':'invalid_atomization',validation:{roundTripCompatible:everyEventTyped&&!!reconstructed,deletionSensitivity:deletion,everyDeletionChangesTruthConditions:allSensitive,noAddedPremise:noAdded,uniqueAtomIds:new Set(atoms.map(function(a){return a.id;})).size===atoms.length,noWholeQuestionAtom:noWhole,allAtomsBound:atoms.every(function(a){return !!eventIds[a.eventId]&&!!a.role;}),subquestionCountPreserved:events.length===clauses.length},atomizationRequirement:'每個子問句先成獨立 event；主體／事件主體／人物共指／屬性／尺度／比較子／門檻／模態／期限／否定與排除須各自成為 essential atom。精確數字是查詢需求，不是牌面推算值。'};
    graph.subquestions=clauses.map(function(c,i){return {id:c.id,surface:c.surface,eventId:events[i]&&events[i].id,order:i+1};});
    graph.completionRules=['每個會改變答案真值的自然語言成分都必須成為 essential atom，且綁定其 eventId 與 role／scope。','多子題不得合併成單一 target；指示詞人物只能建立條件性 UNBOUND_ENTITY，並以明示 coreference 關係承接。','原句未明示的前提只能列為 assumption；附屬人物屬性問題必須受主要事件與實體共指是否成立所限制。'];
    graph.validationRules={roundTrip:'依各子問句的事件角色圖重建，須保留原順序、主體、事件、屬性、比較、門檻、模態、期限、否定與排除。',deletionSensitivity:'逐一刪除 essential atom；刪除任何原子都必須改變該事件或附屬查詢的真值條件。',sameEventTest:'同一完整事件的角色、作用、結果與期限共享其 eventId；附屬人物屬性查詢另建 event，透過明示 conditional_coreference 承接。',noAddedPremise:'原句未含且牌面未建立的前提不得進入完整命題。'};
    var riskDomains=domains.filter(function(id){return /^(?:health|legal|finance)$/.test(id);});
    if(/犯罪|暴力|威脅|跟蹤|自殺|自傷|人身安全|失蹤/.test(q))riskDomains.push('personal_safety');
    riskDomains=uniq(riskDomains);
    var features=Object.assign({},intent,{domains:domains,domainCount:domains.length,relationType:relation?relation.type:null,hasRelation:!!relation,hasThreshold:!!(relation&&relation.type==='fixed_numeric_threshold'),shape:shape,requiredObservables:reqObs,unsupportedDimensions:unsupported,riskDomains:riskDomains,highRisk:riskDomains.length>0,referenceDate:dateParts(options.referenceDate).iso,questionLength:q.length,subquestionCount:clauses.length,compoundQuestion:clauses.length>1});
    return {originalQuestion:q,normalizedQuestion:q,requestedDimensions:dims,explicitScopes:scopes,relations:relations,knownCounterpart:intent.knownDyad,queryGraph:graph,features:features,requiredObservables:reqObs,unsupportedDimensions:unsupported,riskDomains:riskDomains};
  }

  function spreadDirectives(q) {
    var rules=[
      ['ootk',/開鑰之法|opening\s+of\s+the\s+key/i],
      ['mathers_horseshoe',/Mathers\s*(?:第一法|古法|horseshoe|馬蹄|五十四|54)|(?:五十四|54)\s*張牌陣/i],
      ['mathers_21',/Mathers\s*(?:第二法|二十一|21)|三排七|(?:二十一|21)\s*張牌陣/i],
      ['fifteen_card',/金色黎明.{0,8}(?:十五|15)|英式牌陣|fifteen.?card/i],
      ['minor_arcana',/小阿卡那|小牌牌陣|minor arcana/i],['celtic_cross',/凱爾特(?:十字)?|celtic(?: cross)?/i],
      ['tree_of_life',/生命之樹|卡巴拉牌陣|tree of life/i],['zodiac',/(?:黃道十二宮|黃道|十二宮|星座)牌陣|黃道十二宮|zodiac spread/i],
      ['horseshoe',/七張馬蹄|馬蹄形牌陣|seven.?card horseshoe/i],['relationship',/關係牌陣|relationship spread/i],
      ['timeline',/時間線牌陣|timeline spread/i],['cross',/十字牌陣|cross spread/i],
      ['three_card',/(?:三牌|三張牌)陣|three.?card spread/i],['five_card',/(?:五牌|五張牌)陣|five.?card spread/i],
      ['either_or',/二選一牌陣|雙路比較牌陣|either.?or spread/i]
    ];
    var selected='',excluded=[];
    text(q).split(/[，,。；;！？?]/).forEach(function(clause){
      var numeric=clause.match(/(?:用|使用|採用|抽|選擇)\s*(五十四|54|二十一|21|十五|15)\s*張(?:牌)?/i);
      var hits=rules.map(function(rule){var m=clause.match(rule[1]);return m?{id:rule[0],at:m.index}:null;}).filter(Boolean);
      if(numeric)hits.unshift({id:/五十四|54/.test(numeric[1])?'mathers_horseshoe':/二十一|21/.test(numeric[1])?'mathers_21':'fifteen_card',at:numeric.index});
      // A specific Celtic name must not also match the generic cross alias.
      if(hits.some(function(h){return h.id==='celtic_cross';}))hits=hits.filter(function(h){return h.id!=='cross';});
      hits.forEach(function(hit){
        var before=clause.slice(0,hit.at),neg=/(?:不要|不用|不使用|不採用|別用|不想用|排除|不選|不需要)(?:\s*(?:用|使用|採用))?\s*$/i.test(before)||/^(?:不要|不用|不使用|不採用|排除|別用)/.test(clause.trim());
        if(neg){excluded.push(hit.id);if(selected===hit.id)selected='';}
        else if((!before.trim()||/(?:請(?:幫我)?|麻煩(?:幫我)?)?(?:使用|採用|選擇|改用|用|抽)\s*$/.test(before)||numeric)&&!/上次|之前|曾經|昨天/.test(before)){selected=hit.id;excluded=excluded.filter(function(id){return id!==hit.id;});}
      });
    });
    return {selected:selected,excluded:uniq(excluded)};
  }
  function explicitSpread(q){return spreadDirectives(q).selected;}
  function affinity(method,shape){return method.specialties.indexOf(shape)>=0?0:(method.specialties.indexOf('simple')>=0&&shape==='yes_no'?1:4);}
  function candidateRank(m,shape,required){var surplus=difference(m.provides,required).length;return affinity(m,shape)*100+(m.count==null?80:m.count)+surplus*2;}

  function bindSlots(base,compiled){
    var slots=clone(base.slots),f=compiled.features||{},shape=f.shape,scope=(compiled.explicitScopes||[])[0],scopeLabel=scope&&scope.resolved&&scope.resolved.label?scope.resolved.label:(scope?scope.surface:'期限終點'),rel=(compiled.relations||[])[0];
    function s(i,authority,role,label,bind){slots[i]=Object.assign({},slots[i]||{},{authority:authority,role:role,label:label,binding:bind||{eventId:'QUERY_EVENT'}});}
    if(base.id==='three_card'){
      s(0,'antecedent','basis','形成目前局勢的既有基礎');s(1,'state','current_state','目前核心狀態');s(2,'outcome','conditional_outcome','維持現狀的條件性走向');
    }else if(base.id==='five_card'&&shape==='threshold'){
      var threshold=rel&&rel.type==='fixed_numeric_threshold'?(rel.metric+rel.operatorText+rel.thresholdSurface):'原問句成立門檻';
      s(0,'state','current_baseline','目前累積狀態',{eventId:'QUERY_EVENT',metric:rel&&rel.metric});s(1,'enabler','threshold_enabler','推動跨越門檻的力量',{eventId:'QUERY_EVENT',threshold:threshold});s(2,'obstacle','threshold_obstacle','阻礙跨越門檻的力量',{eventId:'QUERY_EVENT',threshold:threshold});s(3,'advice','intervention','可介入的行動',{eventId:'QUERY_EVENT'});s(4,'bounded_outcome','threshold_result','截至'+scopeLabel+'的門檻結果',{eventId:'QUERY_EVENT',scope:scopeLabel,threshold:threshold});
    }else if(base.id==='five_card'&&shape==='bounded_yes_no'){
      s(0,'state','current_state','目前事件狀態',{eventId:'QUERY_EVENT'});s(1,'enabler','event_enabler','促成事件成立的力量',{eventId:'QUERY_EVENT'});s(2,'obstacle','event_obstacle','阻礙事件成立的力量',{eventId:'QUERY_EVENT'});s(3,'advice','intervention','可介入的方向',{eventId:'QUERY_EVENT'});s(4,'bounded_outcome','event_result','截至'+scopeLabel+'的事件成立傾向',{eventId:'QUERY_EVENT',scope:scopeLabel});
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
  function instantiateMethod(id,compiled){var base=method(id);if(!base)return null;compiled=compiled&&compiled.queryGraph?compiled:compileQuestion((compiled&&compiled.originalQuestion)||'');base.slots=bindSlots(base,compiled);var protocol=base.protocol||METHOD_PROTOCOLS[id]||null;if(protocol){base.slots=base.slots.map(function(slot,i){var copy=Object.assign({},slot||{});copy.slotMode=protocol.slotMode;copy.independentSemanticPosition=protocol.slotMode==='semantic_position'||protocol.slotMode==='qabalistic_position'||protocol.slotMode==='domain_position';if(protocol.slotMode==='sequence_member'){copy.slotKind='sequence_member';copy.independentSemanticPosition=false;if(id==='mathers_21'){var row=Math.floor(i/7)+1,pos=(i%7)+1;copy.label='第'+row+'排第'+pos+'張（序列成員；由右至左）';}else if(id==='mathers_horseshoe'){var group=i<26?'A':(i<43?'C':'E'),local=i<26?i+1:(i<43?i-25:i-42);copy.label=group+'組第'+local+'張（序列成員）';}}else if(protocol.slotMode==='triad_member'){copy.slotKind='triad_member';copy.independentSemanticPosition=false;}else{copy.slotKind='semantic_position';}return copy;});}base.requiredObservables=clone(compiled.requiredObservables||[]);base.missingObservables=difference(base.requiredObservables,base.provides);base.coverageComplete=!base.missingObservables.length;base.questionShape=compiled.features&&compiled.features.shape;base.slotBindings=base.slots.map(function(s,i){return {index:i,authority:s.authority,role:s.role,label:s.label||s.role,slotKind:s.slotKind||'semantic_position',independentSemanticPosition:s.independentSemanticPosition!==false,binding:clone(s.binding||{eventId:'QUERY_EVENT'})};});return base;}

  function routeQuestion(input,options){
    options=options||{};
    var compiled=typeof input==='string'?compileQuestion(input,options):input;
    if(!compiled||!text(compiled.originalQuestion)||compiled.originalQuestion==='（未提供明確問題）')return {spreadId:null,methodPlan:null,reason:'請先寫下想詢問的問題。',selectedBy:'empty_question',coverage:{complete:false,missing:[]},compiledQuestion:compiled};
    var q=compiled.normalizedQuestion||compiled.originalQuestion,active=questionFocus(q)||q,f=compiled.features||{},shape=f.shape||'simple',required=compiled.requiredObservables||[],directive=spreadDirectives(q),kind=comparisonKind(active),notes=[];
    var preferred={annual:'zodiac',annual_single_domain:'five_card',choice:'either_or',comparison:'either_or',threshold:'five_card',bounded_yes_no:'five_card',dyad:'relationship',timing:'timeline',location:'minor_arcana',deep_structure:'tree_of_life',multi_domain:'zodiac',hidden_external:'horseshoe',deep_overview:'celtic_cross',conflict:'cross',cause_action:'five_card',narrative:'celtic_cross',exhaustive:'zodiac',yes_no:'three_card',simple:'three_card'}[shape]||'five_card';
    // Decisions compare actions; competing explanations of one person's behaviour do not create two independent futures.
    if(kind==='hypotheses')preferred=f.knownDyad?'relationship':'five_card';
    else if(kind==='incomplete'||kind==='ambiguous'){
      preferred=f.knownDyad?'relationship':'five_card';
      notes.push('尚未確認兩個完整、可替代的方案。本次先看原問題的處境，不新增 A／B 支線；若要比較決策，請明寫「A：…，B：…」。');
    }
    else if(kind==='multiple'){
      preferred='celtic_cross';
      notes.push('問題含三個以上選項：本次看共同決策局勢與取捨，逐項比較已知條件；沒有為每一選項抽獨立結果牌，不能編造各選項的抽牌結果或成功排名。若要分支牌位，需另選兩個明確選項。');
    }else if(kind==='binary'&&compiled.relations&&compiled.relations.some(function(r){return /comparison/.test(r.type);}))preferred='either_or';
    else if(f.timing&&(f.causal||f.advice||f.hidden||f.external))preferred='celtic_cross';
    else if(f.knownDyad&&!f.deepOverview&&!f.multiDomain&&(f.causal||f.advice||!f.timing))preferred='relationship';
    if(f.multiDomain&&(f.causal||f.advice)&&/互相影響|兼顧|平衡|衝突/.test(active))preferred='celtic_cross';
    if(f.location&&f.practical)preferred='minor_arcana';
    if((f.pattern||f.spiritual)&&kind!=='binary'&&!f.timing)preferred='tree_of_life';
    if(f.deepOverview&&(preferred==='three_card'||preferred==='relationship'))preferred='celtic_cross';
    if(directive.selected)preferred=directive.selected;
    var candidates=Object.keys(METHODS).filter(function(id){return id!=='ootk'&&directive.excluded.indexOf(id)<0;}).map(function(id){
      var m=METHODS[id],missing=difference(required,m.provides);
      // Historical large procedures are opt-in, never triggered by ordinary numbers or adjectives such as "thorough".
      var rank=missing.length*40+(m.count||80)+(id==='mathers_21'||id==='mathers_horseshoe'?300:0);
      if(id===preferred)rank-=150;
      return {id:id,eligible:!missing.length,missing:missing,rank:rank,cards:m.count,provides:m.provides};
    }).sort(function(a,b){return a.rank-b.rank||a.cards-b.cards;});
    var selected=directive.selected||((directive.excluded.indexOf(preferred)<0)?preferred:(candidates[0]&&candidates[0].id));
    if(!selected)return {spreadId:null,methodPlan:null,reason:'目前可用牌陣都已被排除，請保留至少一種牌陣。',selectedBy:'all_methods_excluded',coverage:{complete:false,missing:required},compiledQuestion:compiled};
    var plan=instantiateMethod(selected,compiled),missing=plan.missingObservables||[];
    if(missing.length)notes.push('本陣未設獨立牌位的面向：'+missing.map(function(x){return OBSERVABLES[x]||x;}).join('、')+'。完整保留原問句；可由整體結構作條件性討論，無資料可判的部分明說，不新增牌位或假裝已量測。');
    if(f.knownDyad&&selected==='timeline')notes.push('本次優先讀相對階段與轉折，沒有獨立的雙方內心牌位；不以階段牌認定對方意願。');
    var reasons={three_card:'單一焦點，先看既有基礎、現況與條件性走向',five_card:'需要分辨現況、形成因素、阻礙、可做的事與走向',cross:'重點是卡住的核心、拉扯力量與可介入方向',either_or:'兩個可辨識的選項，需要用相同標準比較兩條路',relationship:'問題聚焦已指明的雙方、互動原因、限制及下一步',timeline:'主要想了解階段順序與轉折條件',horseshoe:'需要同時查看盲點、外在影響、阻礙與可採取行動',celtic_cross:'需要整合根基、目標、近程、本人、環境及整體走向',tree_of_life:'問題聚焦反覆模式、內在需求或深層課題',zodiac:'需要分開檢視多個生活領域，再整合整體重點',minor_arcana:'具體日常事件，適合整理操作、資源與搜尋線索',fifteen_card:'依指定的五個三牌組比較核心、發展、決策與外在條件',mathers_21:'依指定的歷史三排七與首尾配對程序',mathers_horseshoe:'依指定的歷史三輪分堆與配對程序',ootk:'依指定的五次開鑰操作'};
    plan.routingNotes=notes.slice();plan.selectionReason=reasons[selected]+'。';
    if(!directive.selected&&kind==='multiple')plan.selectionReason='這題有三個以上選項，先整理共同局勢與取捨；沒有替每個選項抽獨立結果牌。需要逐路比較時，請先選定兩個方案。';
    if(!directive.selected&&(kind==='ambiguous'||kind==='incomplete'))plan.selectionReason='尚未確認兩個完整方案，先看原問題的處境。若要雙路比較，請明寫「A：…，B：…」，再核對下方建議。';
    if(selected==='either_or'){
      var branch=compiled.relations.find(function(r){return r.type==='alternative_comparison';});
      if(branch)plan.selectionReason+='本次比較 A：「'+branch.left+'」；B：「'+branch.right+'」。請核對是否符合你的原意。';
    }
    return {version:VERSION,engine:'question_structure_router_v7',spreadId:selected,reason:(directive.selected?'你已指定此牌陣；':'')+plan.selectionReason,selectedBy:directive.selected?'explicit':'question_structure',compiledQuestion:compiled,methodPlan:plan,ready:true,coverage:{required:required,provided:plan.provides,missing:missing,complete:!missing.length},readingNotes:notes,unsupportedDimensions:compiled.unsupportedDimensions||[],excludedMethods:directive.excluded,candidates:candidates.slice(0,8)};
  }

  function validateMethodRegistry(){
    var errors=[],authorities={state:1,antecedent:1,development:1,cause:1,enabler:1,obstacle:1,interaction_force:1,advice:1,outcome:1,bounded_outcome:1,person_known:1,person_aggregate:1,environment:1,comparison:1,timeline:1,domain:1,structural:1,synthesis:1,stage:1};
    Object.keys(METHODS).forEach(function(id){
      var m=METHODS[id],p=METHOD_PROTOCOLS[id];
      if(m.id!==id)errors.push('id_mismatch:'+id);
      if(!p)errors.push('native_protocol_missing:'+id);
      if(id!=='ootk'&&m.slots.length!==m.count)errors.push('slot_count:'+id);
      m.slots.forEach(function(s,i){if(!authorities[s.authority])errors.push('unknown_authority:'+id+':'+i+':'+s.authority);});
      (m.dignityLines||[]).forEach(function(line,li){if(line.length<3)errors.push('dignity_line_requires_three_or_more:'+id+':'+li);line.forEach(function(i){if(i<0||(m.count!=null&&i>=m.count))errors.push('dignity_index:'+id+':'+i);});});
      difference(m.provides,Object.keys(OBSERVABLES)).forEach(function(x){errors.push('unknown_observable:'+id+':'+x);});
      if(p){
        if(p.fixedReversalDictionary!==false)errors.push('fixed_reversal_not_disabled:'+id);
        if(p.pairingIsAdjacency!==false)errors.push('pairing_adjacency_confusion:'+id);
        var dignityEdges=Object.create(null);
        (m.dignityLines||[]).forEach(function(line){for(var di=0;di<line.length-1;di++)dignityEdges[line[di]+'>'+line[di+1]]=true;});
        (p.structures||[]).forEach(function(st,si){
          (st.indices||[]).forEach(function(i){if(m.count!=null&&(i<0||i>=m.count))errors.push('protocol_index:'+id+':'+si+':'+i);});
          (st.pairs||[]).forEach(function(pair){pair.forEach(function(i){if(m.count!=null&&(i<0||i>=m.count))errors.push('protocol_pair_index:'+id+':'+si+':'+i);});if(st.elementalDignity===true)errors.push('semantic_pair_marked_as_dignity:'+id+':'+si);});
          if(st.elementalDignity===true&&st.indices&&st.indices.length>1){
            for(var ei=0;ei<st.indices.length-1;ei++){
              if(!dignityEdges[st.indices[ei]+'>'+st.indices[ei+1]])errors.push('undeclared_dignity_edge:'+id+':'+si+':'+st.indices[ei]+'>'+st.indices[ei+1]);
            }
          }
        });
      }
    });
    return {ok:!errors.length,errors:errors};
  }

  return {VERSION:VERSION,SCHEMA:SCHEMA,OBSERVABLES:OBSERVABLES,METHODS:METHODS,METHOD_PROTOCOLS:METHOD_PROTOCOLS,normalizeQuestion:normalize,questionFocus:questionFocus,spreadDirectives:spreadDirectives,parseChineseNumber:parseChineseNumber,compileQuestion:compileQuestion,routeQuestion:routeQuestion,instantiateMethod:instantiateMethod,getMethod:method,getMethodProtocol:function(id){return clone(METHOD_PROTOCOLS[id]||null);},getDignityLines:dignityLines,getDependencyGroups:dependencyGroups,getCompatibilityEdges:compatibilityEdges,validateMethodRegistry:validateMethodRegistry};
});
