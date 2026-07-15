/*! tarot-semantic-engine.js — 塔羅需求編譯器、方法拓撲與證據契約 [v91.0]
 * 目的：把原問句的關係／門檻／比較／量測形式，與牌陣真正可觀測的通道分離；
 * 再以方法拓撲、單一牌義來源、合法證據單位與可執行稽核約束模型。
 */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.JYTarotSemanticEngine = api;
})(typeof globalThis !== 'undefined' ? globalThis : (typeof window !== 'undefined' ? window : this), function () {
  'use strict';

  var VERSION = '91.0.0';
  var SCHEMA = 'jy.tarot.semantic-contract/2';

  function clone(x) { return x == null ? x : JSON.parse(JSON.stringify(x)); }
  function text(x) { return x == null ? '' : String(x).trim(); }
  function uniq(xs) {
    var seen = Object.create(null), out = [];
    (xs || []).forEach(function (x) {
      var k = typeof x === 'string' ? x : JSON.stringify(x);
      if (!seen[k]) { seen[k] = 1; out.push(x); }
    });
    return out;
  }
  function stripDirection(name) {
    return text(name).replace(/^[▲▼]\s*(正位|逆位)\s*/, '').replace(/^(正位|逆位)\s*/, '').trim();
  }
  function cardDirection(card) {
    if (!card) return '';
    if (card.direction) return card.direction;
    if (card.isUp === true) return '正位';
    if (card.isUp === false) return '逆位';
    return '';
  }
  function nodeId(i) { return 'N' + String(i + 1).padStart(2, '0'); }
  function unitId(i) { return 'E' + String(i + 1).padStart(3, '0'); }
  function obligationId(i) { return 'Q' + String(i + 1).padStart(2, '0'); }

  var SOURCE_PROFILES = {
    modern_rws: {
      id:'modern_rws', label:'現代 RWS 通行義＋PCS 圖像',
      reversalPolicy:'使用資料區的現代通行正逆義',
      imagePolicy:'PCS 圖像只有在改變命題時才可使用',
      disallow:['Mathers 1888 原義冒充現代 RWS','Book T 計數規則冒充一般牌位義']
    },
    waite_1910: {
      id:'waite_1910', label:'Waite 1910《Pictorial Key》',
      reversalPolicy:'依資料區提供的 Waite 正逆占義',
      imagePolicy:'PCS 圖像只輔助 Waite 原義',
      disallow:['現代 RWS 關鍵字覆寫原義','Golden Dawn 元素或旬位自行創造事件']
    },
    mathers_1888: {
      id:'mathers_1888', label:'Mathers 1888《The Tarot》牌義與程序',
      reversalPolicy:'依 Mathers 1888 正逆義',
      imagePolicy:'不以 1909 PCS 場景作原法證據',
      disallow:['現代 RWS 牌義混入','任意跨排或跨組拼牌']
    },
    modern_rws_gd_structure: {
      id:'modern_rws_gd_structure', label:'現代 RWS 牌義＋明示的 GD／Thoth 結構混合實務',
      reversalPolicy:'依資料區；方法若明示不用逆位則不得自行讀逆位',
      imagePolicy:'PCS 圖像可作次級敘事',
      disallow:['宣稱為純 Book T 或純 Thoth 原法']
    },
    gd_book_t: {
      id:'gd_book_t', label:'Golden Dawn《Book T》開鑰之法',
      reversalPolicy:'不以一般 RWS 逆位心理化；牌力由本方法資料決定',
      imagePolicy:'不以 PCS 場景取代計數、配對與元素程序',
      disallow:['跨操作拼成單一路徑','計數步數換算現實數量','代表牌重複視為額外徵兆']
    }
  };

  var ROLE_AUTHORITY = {
    state:'描述該觀測通道的狀態，不自行證明盤外人物或事件存在',
    cause:'只說明形成機制，不可單獨取代結果',
    obstacle:'只說明限制、延遲、扭曲或反證',
    interaction_force:'描述橫跨核心的主要作用；它可成為助力、阻力、催化、代價或混合作用，必須由本牌、核心牌與全盤共同判定，不預設負面',
    advice:'只說明可介入點，不可用來證明預測事件已成立',
    outcome:'說明在本結構下的收束；仍須由前段形成機制支撐',
    person_known:'可描述原問句已辨識的人物，但仍不得超出牌面推算精確身分或數字',
    person_aggregate:'條件性或聚合角色作用；不證明人物存在、不等於一人、也不是人數上限',
    environment:'描述外界條件或他人作用；未綁定時不得具名或計數',
    comparison:'只能在同一比較基準與已綁定的獨立通道下判斷相對差異',
    timeline:'描述相對先後與轉折；沒有時間錨不得換算日期',
    domain:'描述該生活領域，不自動枚舉領域內的未知人物',
    structural:'只描述結構層級或路徑功能'
  };

  var BASE_MEASUREMENT = {
    event_or_state:'qualitative_direct',
    existence:'qualitative_inference',
    event_realization:'qualitative_inference',
    degree:'qualitative_inference',
    cause:'when_channel_exists',
    trajectory:'when_channel_exists',
    outcome:'when_channel_exists',
    guidance:'when_channel_exists',
    value_attribute:'qualitative_inference',
    trend:'qualitative_inference',
    stability:'qualitative_inference',
    comparison:'requires_independent_channels',
    relative_order:'requires_independent_comparable_channels',
    threshold_crossing:'requires_independent_comparable_channels',
    exact_value:'not_measured',
    numeric_range:'not_measured',
    cardinality:'not_measured',
    exact_age:'not_measured',
    identity:'not_measured',
    person_attribute:'qualitative_or_unmeasured',
    exact_date:'not_measured',
    probability:'not_measured',
    time_scope:'scope_constraint',
    modality:'question_operator'
  };
  function measure(extra) {
    var out = clone(BASE_MEASUREMENT);
    Object.keys(extra || {}).forEach(function (k) { out[k] = extra[k]; });
    return out;
  }

  function mkSpec(id, label, sourceProfile, roles, operators, measurement, topology, notes) {
    var strictSource = sourceProfile === 'mathers_1888' || sourceProfile === 'gd_book_t';
    return {
      id:id,
      label:label,
      sourceProfile:sourceProfile,
      allowedSourceProfiles:strictSource ? [sourceProfile] : uniq([sourceProfile,'modern_rws','waite_1910']),
      roles:roles || [],
      expectedCardCount:id === 'ootk' ? null : (roles || []).length,
      expectedOperationCount:id === 'ootk' ? 5 : null,
      operators:operators || [],
      measurement:measurement || measure(),
      topology:topology || {kind:'single_subject_network',independentComparableChannels:0},
      notes:notes || []
    };
  }

  var METHOD_SPECS = {
    three_card:mkSpec('three_card','三牌陣','modern_rws',
      ['state','state','outcome'],
      ['atomic_node','adjacent_segment','whole_ordered_path'],
      measure({trajectory:'direct_channel',outcome:'direct_channel'}),
      {kind:'ordered_path',independentComparableChannels:0},
      ['三張是三個觀測位置，不是三個人物或三個時間單位']),

    five_card:mkSpec('five_card','五牌陣','modern_rws',
      ['state','cause','obstacle','advice','outcome'],
      ['atomic_node','declared_mechanism','full_event_chain'],
      measure({cause:'direct_channel',trajectory:'qualitative_inference',outcome:'direct_channel',guidance:'direct_channel'}),
      {kind:'directed_event_graph',independentComparableChannels:0},
      ['結果必須由現況、原因、阻礙與介入點共同限定']),

    cross:mkSpec('cross','十字牌陣','modern_rws',
      ['state','interaction_force','cause','outcome','advice'],
      ['atomic_node','core_cross','development_axis','intervention_link'],
      measure({cause:'direct_channel',trajectory:'direct_channel',guidance:'direct_channel'}),
      {kind:'cross_with_axis',independentComparableChannels:0},
      ['核心與交叉力量的關係優先於吉凶票數']),

    either_or:mkSpec('either_or','二選一牌陣','modern_rws',
      ['state','comparison','comparison','outcome','outcome'],
      ['atomic_node','branch_A','branch_B','branch_comparison'],
      measure({comparison:'direct_comparison_channel',relative_order:'direct_comparison_channel',threshold_crossing:'qualitative_comparison_if_bound',trajectory:'direct_channel',outcome:'direct_channel'}),
      {kind:'independent_branches',independentComparableChannels:2,channelLabels:['A','B']},
      ['A 與 B 必須各自成路徑後才比較，不得把兩路牌任意拼句']),

    relationship:mkSpec('relationship','關係牌陣','modern_rws',
      ['state','person_aggregate','state','obstacle','advice','outcome'],
      ['atomic_node','self_other_contrast','relationship_mechanism','obstacle_link','intervention_chain','outcome_dependency_graph'],
      measure({comparison:'qualitative_contrast_only',relative_order:'not_measured',threshold_crossing:'not_measured',trajectory:'direct_channel',outcome:'direct_channel',guidance:'direct_channel',cardinality:'not_measured',identity:'not_measured',exact_age:'not_measured'}),
      {kind:'dyadic_relation_network',independentComparableChannels:0},
      ['原問句有可辨識對象時第二通道可綁定該人；未知對象時只能讀條件性作用']),

    timeline:mkSpec('timeline','時間線牌陣','modern_rws',
      ['cause','timeline','timeline','timeline','outcome'],
      ['atomic_node','ordered_timeline','trigger_chain'],
      measure({cause:'direct_channel',trajectory:'direct_channel',outcome:'direct_channel',exact_date:'anchor_required'}),
      {kind:'ordered_timeline',independentComparableChannels:0},
      ['直接量測相對順序、觸發與節奏；日期必須另有可回溯錨點']),

    celtic_cross:mkSpec('celtic_cross','凱爾特十字','waite_1910',
      ['state','interaction_force','structural','cause','timeline','timeline','state','environment','state','outcome'],
      ['atomic_node','core_cross','vertical_axis','time_axis','self_environment_axis','expectation_outcome_axis','dependency_network'],
      measure({cause:'direct_channel',trajectory:'direct_channel',outcome:'direct_channel',guidance:'qualitative_inference',comparison:'not_measured_single_subject_network',relative_order:'not_measured_single_subject_network',threshold_crossing:'not_measured_single_subject_network'}),
      {kind:'nonlinear_dependency_network',independentComparableChannels:0},
      ['第九位是希望或恐懼，不得越權當結果','完整網絡是多軸依賴圖，不是十張時間線']),

    tree_of_life:mkSpec('tree_of_life','生命之樹','modern_rws_gd_structure',
      ['structural','structural','structural','structural','structural','state','state','state','state','outcome'],
      ['atomic_node','mercy_pillar','severity_pillar','middle_pillar','pillar_dependency_network'],
      measure({cause:'qualitative_inference',trajectory:'qualitative_inference',outcome:'direct_channel'}),
      {kind:'three_pillar_network',independentComparableChannels:0},
      ['質點是作用層級，不是現實人數、次數或月份']),

    zodiac:mkSpec('zodiac','黃道十二宮牌陣','modern_rws_gd_structure',
      ['domain','domain','domain','domain','domain','domain','domain','domain','domain','domain','domain','domain','outcome'],
      ['atomic_node','house_axis','domain_dependency_network'],
      measure({state:'direct_channel',trajectory:'qualitative_inference',outcome:'direct_channel'}),
      {kind:'domain_network',independentComparableChannels:0},
      ['十二宮分隔生活領域，不枚舉同一宮內的未知人物']),

    minor_arcana:mkSpec('minor_arcana','小阿卡那專題牌陣','modern_rws',
      ['state','cause','obstacle','environment','state','advice','outcome'],
      ['atomic_node','mechanism_chain','resource_intervention','outcome_dependency_graph'],
      measure({cause:'direct_channel',guidance:'direct_channel',outcome:'direct_channel'}),
      {kind:'directed_event_graph',independentComparableChannels:0},
      ['人物通道未綁定時仍是環境作用，不代表一個具體人']),

    fifteen_card:mkSpec('fifteen_card','十五張英式牌陣','modern_rws_gd_structure',
      ['state','state','state','timeline','timeline','state','structural','timeline','timeline','state','structural','timeline','timeline','state','structural'],
      ['atomic_node','triad_core','triad_natural','triad_alternative','triad_decision','triad_fate','triad_comparison'],
      measure({cause:'qualitative_inference',comparison:'direct_comparison_channel',relative_order:'direct_comparison_channel',threshold_crossing:'qualitative_comparison_if_bound',trajectory:'direct_channel',outcome:'qualitative_inference'}),
      {kind:'five_triad_network',independentComparableChannels:2,channelLabels:['natural','alternative']},
      ['固定五個三牌組；不同三牌組只能在各自成句後綜合']),

    mathers_21:mkSpec('mathers_21','Mathers 1888 第二法','mathers_1888',
      new Array(21).fill('structural'),
      ['atomic_node','ordered_row','declared_outer_pair','center_card','row_dependency_network'],
      measure({state:'qualitative_inference',cause:'qualitative_inference',trajectory:'qualitative_inference',outcome:'qualitative_inference'}),
      {kind:'rows_and_pairs',independentComparableChannels:0},
      ['三排各自從右往左成連續故事，再讀 1↔21 至 10↔12；第11張為中心']),

    mathers_horseshoe:mkSpec('mathers_horseshoe','Mathers 1888 第一法完整 Horseshoe','mathers_1888',
      new Array(54).fill('structural'),
      ['atomic_node','ordered_group','contiguous_segment','declared_outer_pair','center_card','group_claim_synthesis'],
      measure({state:'qualitative_inference',cause:'qualitative_inference',trajectory:'qualitative_inference',outcome:'qualitative_inference',exact_age:'not_measured',cardinality:'not_measured'}),
      {kind:'three_evidence_groups',independentComparableChannels:0},
      ['只讀 A=26、C=17、E=11；F=24 不進入解讀','跨組只能綜合各組已成立命題，不能把不同組牌名拼成一條新牌句']),

    horseshoe:mkSpec('horseshoe','七張馬蹄形牌陣','modern_rws_gd_structure',
      ['cause','state','state','advice','environment','obstacle','outcome'],
      ['atomic_node','ordered_arc','environment_obstacle_link','intervention_outcome_chain'],
      measure({cause:'direct_channel',trajectory:'qualitative_inference',outcome:'direct_channel',guidance:'direct_channel'}),
      {kind:'ordered_arc_with_links',independentComparableChannels:0},
      ['他人／環境通道未綁定時不得反向創造人物']),

    ootk:mkSpec('ootk','Opening of the Key 五次操作','gd_book_t',
      ['structural','structural','structural','structural','structural'],
      ['operation_landing','operation_counting_path','operation_pair','operation_validity','operation_stage_summary','op4_time_anchor','cross_operation_stage_network'],
      measure({state:'direct_channel',cause:'qualitative_inference',trajectory:'direct_channel',outcome:'direct_channel',exact_date:'op4_anchor_only',cardinality:'not_measured',exact_age:'not_measured',identity:'not_measured'}),
      {kind:'five_stage_procedure',independentComparableChannels:0},
      ['五次操作是五個獨立讀盤；先各自成句，再整合階段命題','計數值、步數、堆張數、代表牌重複都不是現實數量'])
  };

  function normalizeSpreadId(id) {
    var x = text(id).toLowerCase();
    var aliases = {
      'three-card':'three_card','threecard':'three_card','3':'three_card',
      'five-card':'five_card','fivecard':'five_card','5':'five_card',
      'celtic':'celtic_cross','celtic-cross':'celtic_cross',
      'tree-of-life':'tree_of_life','tree':'tree_of_life',
      'mathers-first':'mathers_horseshoe','mathers_54':'mathers_horseshoe',
      'mathers-second':'mathers_21','mathers21':'mathers_21',
      'opening_of_the_key':'ootk','opening-of-the-key':'ootk'
    };
    return aliases[x] || x || 'three_card';
  }

  function resolveSemanticProfile(spreadId, options) {
    options = options || {};
    var id = normalizeSpreadId(spreadId);
    if (id === 'ootk') return 'gd_book_t';
    if (id === 'mathers_21' || id === 'mathers_horseshoe') return 'mathers_1888';
    if (options.waitePure === true) return 'waite_1910';
    if (id === 'fifteen_card' || id === 'tree_of_life' || id === 'zodiac' || id === 'horseshoe') return 'modern_rws_gd_structure';
    return 'modern_rws';
  }

  var DIMENSION_DEFS = [
    {id:'cardinality',label:'數量／基數',re:/幾個|幾位|幾人|多少(?:人|個|位|次|件|張)|人數|數量/},
    {id:'exact_age',label:'人物年齡',re:/幾歲|年齡|歲數|年紀/},
    {id:'identity',label:'人物身分',re:/是誰|哪(?:一)?個人|哪(?:一)?位|姓名|名字|身分|什麼人/},
    {id:'person_attribute',label:'人物屬性',re:/外貌|長相|身高|體重|職業|個性|星座|生肖|性別/},
    {id:'exact_value',label:'精確數值／金額',re:/多少錢|金額(?:是|有)?多少|收入(?:是|有)?多少|薪水(?:是|有)?多少|價格(?:是|有)?多少|獲利(?:是|有)?多少/},
    {id:'numeric_range',label:'數值範圍',re:/大約多少|約多少|落在什麼範圍|幾萬|幾千|區間/},
    {id:'probability',label:'機率／比例',re:/百分比|幾成|機率|多少%|多少趴|可能性多(?:高|大)/},
    {id:'exact_date',label:'精確時間',re:/什麼時候|何時|幾時|多久|幾天|幾週|幾月|哪一年|日期|時間點/},
    {id:'cause',label:'原因／機制',re:/為什麼|為何|原因|根源|怎麼會|問題出在/},
    {id:'guidance',label:'方法／建議',re:/怎麼做|怎麼辦|如何(?:做|處理|改善|選)|建議|方法|策略|該怎麼/},
    {id:'trajectory',label:'發展／走向',re:/未來|走向|結果|會變成|發展|最後|結局|之後|接下來/},
    {id:'existence',label:'存在／成立與否',re:/有沒有|是否|會不會|是不是|能不能|可不可以|有.{0,16}嗎[？?]?|會.{0,16}嗎[？?]?|能.{0,16}嗎[？?]?/},
    {id:'degree',label:'程度／強弱',re:/多(?:強|深|嚴重|明顯)|程度|強不強|深不深|嚴不嚴重/},
    {id:'trend',label:'趨勢方向',re:/增加|成長|上升|下降|減少|變多|變少|越來越|改善|惡化/},
    {id:'stability',label:'持續性／穩定度',re:/穩定|長期|持續|每月|固定|永久|一直|能維持/},
    {id:'value_attribute',label:'價值／收入屬性',re:/收入|薪水|獲利|營收|成本|價格|價值|報酬/},
    {id:'event_realization',label:'事件落實程度',re:/成功|實現|發生|成真|做到|達成|落實|成交|結婚|告白|升遷|超過|高於|低於/},
    {id:'modality',label:'可能性／能力模態',re:/能不能|能否|會不會|是否會|可能|可不可以|可以嗎|有機會|能.{0,20}嗎|會.{0,20}嗎/}
  ];

  function splitClauses(q) {
    return text(q).split(/[？?。！!；;，,\n]+/).map(function (s) { return s.trim(); }).filter(Boolean);
  }
  function detectScope(q) {
    var x = text(q), scopes = [];
    var patterns = [
      /今年|明年|後年|去年|本年|未來一年|這一年/g,
      /今天|明天|後天|今晚|本週|這週|下週|本月|這個月|下個月|近期|最近/g,
      /\d{4}年(?:\d{1,2}月(?:\d{1,2}日)?)?/g,
      /(?:一|二|三|四|五|六|七|八|九|十|兩|\d+)個?(?:天|週|月|年)內/g
    ];
    patterns.forEach(function (re) { var m; while ((m = re.exec(x))) scopes.push(m[0]); });
    return uniq(scopes);
  }
  function cleanSide(s) {
    return text(s)
      .replace(/^[我你他她它我們你們他們]+(?:的)?/, '')
      .replace(/(?:能否|能不能|能|會不會|會|是否|可不可以|可以|可能|有機會)(?:成功)?$/,'')
      .replace(/(?:成功)$/,'')
      .replace(/[嗎呢嘛]$/,'')
      .replace(/^[的\s]+|[的\s]+$/g,'')
      .trim();
  }
  function inferParallelMetric(left, right) {
    var metric = '';
    ['收入','薪水','獲利','營收','成本','價格','價值','報酬','時間','速度','距離'].some(function (m) {
      if (right.indexOf(m) >= 0) { metric = m; return true; }
      return false;
    });
    if (metric && left && left.indexOf(metric) < 0) return {text:left + metric,inferred:true,metric:metric};
    return {text:left,inferred:false,metric:metric};
  }
  function detectRelations(q) {
    var out = [];
    var ops = [
      {token:'不低於',op:'gte'},{token:'不少於',op:'gte'},{token:'至少達到',op:'gte'},
      {token:'不高於',op:'lte'},{token:'不多於',op:'lte'},{token:'至多',op:'lte'},
      {token:'超過',op:'gt'},{token:'高於',op:'gt'},{token:'大於',op:'gt'},{token:'勝過',op:'gt'},{token:'多於',op:'gt'},
      {token:'低於',op:'lt'},{token:'少於',op:'lt'},{token:'小於',op:'lt'}
    ];
    function pushRelation(r) {
      var signature=[r.type,r.operator,r.left,r.right,r.metric].join('|');
      if(out.some(function(x){return [x.type,x.operator,x.left,x.right,x.metric].join('|')===signature;})) return;
      r.id='R'+String(out.length+1).padStart(2,'0'); out.push(r);
    }
    splitClauses(q).forEach(function(rawClause){
      var s=text(rawClause).replace(/[？?。！!]+$/,'').trim();
      if(!s)return;
      var found=false;
      for (var i=0;i<ops.length;i++) {
        var o=ops[i], idx=s.indexOf(o.token);
        if (idx < 0) continue;
        var l=cleanSide(s.slice(0,idx));
        var r=cleanSide(s.slice(idx+o.token.length));
        var p=inferParallelMetric(l,r);
        pushRelation({
          type:'ordered_comparison', operator:o.op, operatorText:o.token,
          left:p.text || l, right:r, metric:p.metric || '',
          inferredLeftMetric:p.inferred,
          thresholdDefinition:s,
          requires:['relative_order','threshold_crossing'],
          fidelityRule:'必須回答「'+(p.text||l)+' '+o.token+' '+r+'」這個完整關係，不得改成只要有成長、收入或機會就算成功。'
        });
        found=true; break;
      }
      if(!found) {
        var m=s.match(/^(.+?)比(.+?)(?:更|還)?(高|低|多|少|好|差|適合|成功)$/);
        if (m) pushRelation({type:'ordered_comparison',operator:/高|多|好|適合|成功/.test(m[3])?'gt':'lt',operatorText:'比…'+m[3],left:cleanSide(m[1]),right:cleanSide(m[2]),metric:m[3],inferredLeftMetric:false,thresholdDefinition:s,requires:['relative_order'],fidelityRule:'必須保留兩個比較對象與同一比較基準。'});
      }
      var alt=s.match(/^(.+?)(?:還是|或者)(.+)$/);
      if (alt) pushRelation({type:'alternative_choice',operator:'choose',operatorText:s.indexOf('還是')>=0?'還是':'或者',left:cleanSide(alt[1]),right:cleanSide(alt[2]),metric:'',inferredLeftMetric:false,thresholdDefinition:s,requires:['comparison'],fidelityRule:'兩個選項必須各自成路徑後才比較。'});
    });
    return out;
  }

  function compileQuestion(question) {
    var q = text(question), clauses = splitClauses(q), scopes = detectScope(q), relations = detectRelations(q);
    var dims = [{id:'event_or_state',label:'核心事件／狀態',source:'整句原文'}];
    DIMENSION_DEFS.forEach(function (d) {
      var m=q.match(d.re); if (m) dims.push({id:d.id,label:d.label,source:m[0]});
    });
    // Generic compositional rule: a yes/no or modal question asks whether its
    // proposition becomes true, even when the predicate is not in a topic list.
    // This derives event/state realization from sentence form, not from tarot themes.
    var detectedIds=dims.map(function(d){return d.id;});
    if(detectedIds.indexOf('cardinality')>=0 && detectedIds.indexOf('existence')<0){
      dims.push({id:'existence',label:'存在／成立與否',source:'數量問題包含零／非零的存在邊界'});
      detectedIds.push('existence');
    }
    if((detectedIds.indexOf('existence')>=0 || detectedIds.indexOf('modality')>=0) && detectedIds.indexOf('event_realization')<0){
      dims.push({id:'event_realization',label:'事件／狀態成立程度',source:'由問句的是非／可能模態要求'});
    }
    relations.forEach(function (r) {
      dims.push({id:'comparison',label:'比較關係',source:r.operatorText});
      if (r.requires.indexOf('relative_order') >= 0) dims.push({id:'relative_order',label:'相對排序',source:r.left+' ↔ '+r.right});
      if (r.requires.indexOf('threshold_crossing') >= 0) dims.push({id:'threshold_crossing',label:'門檻跨越',source:r.left+' '+r.operatorText+' '+r.right});
    });
    if (scopes.length) dims.push({id:'time_scope',label:'使用者明示期限／範圍',source:scopes.join('、')});
    var seen=Object.create(null);
    dims=dims.filter(function(d){if(seen[d.id])return false;seen[d.id]=1;return true;});

    var obligations=[];
    clauses.forEach(function(c){obligations.push({id:obligationId(obligations.length),type:'clause_preservation',text:c,required:true});});
    relations.forEach(function(r){obligations.push({id:obligationId(obligations.length),type:'relation_preservation',text:r.left+' '+r.operatorText+' '+r.right,required:true,relationId:r.id});});
    scopes.forEach(function(s){obligations.push({id:obligationId(obligations.length),type:'scope_preservation',text:s,required:true});});
    if (/成功/.test(q) && relations.length) obligations.push({id:obligationId(obligations.length),type:'success_definition',text:'「成功」以原句中的比較／門檻關係為成立尺度，不得另行降格定義。',required:true});

    return {
      schema:SCHEMA,
      originalQuestion:q,
      clauses:clauses,
      explicitScopes:scopes,
      relations:relations,
      requestedDimensions:dims,
      semanticObligations:obligations,
      modelMustInfer:['主體','對象或場域','核心謂詞','成立尺度','不可省略限定'],
      fidelityRule:'完整命題必須與原問句雙向相容：不得漏掉必要成分，也不得加入原句沒有且牌面未建立的前提。',
      comparisonRule:'原句含比較或門檻時，先裁決完整關係，再呈現較弱的趨勢、機會或子命題；不得重新定義成功。',
      completionRule:'詞法與關係偵測只是機械預檢；模型仍須逐字核對整句，但不得刪除已偵測的關係、門檻與期限。'
    };
  }

  function splitAtoms(s) {
    return uniq(text(s).replace(/[〔〕【】\[\]]/g,'').split(/[·・、,，;；／/|｜。\.]+/).map(function(x){return x.trim();}).filter(Boolean));
  }
  function normalizeCards(cards) {
    return (cards || []).map(function (c,i) {
      var keywords=text(c.semanticCandidates || c.keywords || c.kw || '');
      var gloss=text(c.sourceGloss || c.baseMeaning || c.meaning || c.mathersMeaning || c.waiteMeaning || '');
      var candidates=Array.isArray(c.semanticCandidates) ? c.semanticCandidates.map(text).filter(Boolean) : splitAtoms(keywords);
      if (!candidates.length && gloss) candidates=splitAtoms(gloss).slice(0,8);
      return {
        id:nodeId(i), index:i+1,
        cardName:stripDirection(c.name || c.n || c.cardName || '?'),
        direction:cardDirection(c),
        position:text(c.positionMeaning || c.position || c.zh || c.role || ('位置'+(i+1))),
        role:text(c.role || ''),
        semanticCandidates:candidates,
        sourceGloss:gloss,
        element:text(c.element || c.el || ''),
        sourcePosition:text(c.sourcePosition || '')
      };
    });
  }

  function addUnit(units,type,label,nodeIds,meta) {
    meta=meta || {};
    var u={
      id:unitId(units.length), type:type, label:label,
      nodes:(nodeIds || []).slice(), nodeIds:(nodeIds || []).slice(),
      dependsOn:(meta.dependsOn || []).slice(),
      topology:meta.topology || (meta.ordered===false?'set':'ordered_path'),
      ordered:meta.ordered !== false,
      claimPolicy:meta.claimPolicy || 'direct_or_synthesis',
      rule:meta.rule || '', stage:meta.stage || '', group:meta.group || '',
      edges:clone(meta.edges || [])
    };
    units.push(u); return u;
  }

  function compileEvidenceGraph(spreadId,cards,options) {
    options=options || {};
    var id=normalizeSpreadId(spreadId), spec=METHOD_SPECS[id] || METHOD_SPECS.three_card;
    var nodes=normalizeCards(cards), units=[];
    nodes.forEach(function(n,i){
      var role=spec.roles[i] || 'structural';
      if(id==='relationship' && i===1 && options.knownCounterpart===true) role='person_known';
      n.authority=role; n.authorityRule=ROLE_AUTHORITY[role] || ROLE_AUTHORITY.structural;
      addUnit(units,'atomic_node',n.position+'：'+n.cardName,[n.id],{ordered:false,topology:'node'});
    });
    function ids(idxs){return idxs.map(function(i){return nodeId(i);}).filter(function(nid){return nodes.some(function(n){return n.id===nid;});});}
    function add(type,label,idxs,meta){return addUnit(units,type,label,ids(idxs),meta);}
    function composite(type,label,deps,meta){meta=meta||{};meta.dependsOn=deps.map(function(x){return typeof x==='string'?x:x.id;});meta.ordered=false;meta.topology=meta.topology||'dependency_graph';meta.claimPolicy=meta.claimPolicy||'synthesis_only';return addUnit(units,type,label,[],meta);}

    if(id==='three_card'){
      add('adjacent_segment','前段相鄰句',[0,1],{topology:'ordered_path'}); add('adjacent_segment','後段相鄰句',[1,2],{topology:'ordered_path'}); add('whole_ordered_path','完整三張路徑',[0,1,2],{topology:'ordered_path'});
    } else if(id==='five_card'){
      var fm1=add('declared_mechanism','原因形成現況',[1,0],{topology:'directed_link'}), fm2=add('declared_mechanism','阻礙限制現況',[2,0],{topology:'interaction'}), fm3=add('declared_mechanism','建議介入阻礙',[3,2],{topology:'intervention_link'}), fm4=add('declared_mechanism','結果形成機制',[0,1,2,4],{topology:'directed_event_graph',edges:[[1,0],[2,0],[0,4]]});
      composite('full_event_chain','完整事件依賴網絡',[fm1,fm2,fm3,fm4],{topology:'dependency_graph'});
    } else if(id==='cross'){
      add('core_cross','核心與交叉力量',[0,1],{topology:'interaction'}); add('development_axis','背景—核心—發展',[2,0,3],{topology:'ordered_path'}); add('intervention_link','建議介入核心與交叉力量',[4,0,1],{topology:'intervention_graph',edges:[[4,0],[4,1]]});
    } else if(id==='either_or'){
      var ba=add('branch_A','A 路徑',[0,1,3],{group:'A',topology:'ordered_path'}), bb=add('branch_B','B 路徑',[0,2,4],{group:'B',topology:'ordered_path'});
      composite('branch_comparison','A／B 同基準比較',[ba,bb],{topology:'parallel_branch_comparison'});
    } else if(id==='relationship'){
      var rc=add('self_other_contrast','雙方作用對照',[0,1],{ordered:false,topology:'contrast'}), rm=add('relationship_mechanism','雙方如何形成現況',[0,1,2],{topology:'directed_relation_graph',edges:[[0,2],[1,2]]}), ro=add('obstacle_link','挑戰如何改變現況',[2,3],{topology:'interaction'}), ri=add('intervention_chain','現況—挑戰—介入',[2,3,4],{topology:'intervention_graph',edges:[[2,3],[4,3]]});
      var rout=add('outcome_node_link','走向受現況、挑戰與介入共同限定',[2,3,4,5],{topology:'directed_dependency_graph',edges:[[2,5],[3,5],[4,5]]});
      composite('outcome_dependency_graph','完整關係收束網絡',[rc,rm,ro,ri,rout],{topology:'dependency_graph'});
    } else if(id==='timeline'){
      add('ordered_timeline','完整相對時間線',[0,1,2,3,4],{topology:'ordered_timeline'}); add('trigger_chain','現況—觸發—發展—結果',[1,2,3,4],{topology:'ordered_timeline'});
    } else if(id==='celtic_cross'){
      var cc=add('core_cross','核心與交叉力量',[0,1],{topology:'interaction'}), va=add('vertical_axis','上方可能—腳下根基',[2,3],{ordered:false,topology:'axis'}), ta=add('time_axis','身後—身前',[4,5],{topology:'ordered_axis'}), se=add('self_environment_axis','本人—環境',[6,7],{ordered:false,topology:'axis'}), eo=add('expectation_outcome_axis','希望恐懼—結果',[8,9],{topology:'constraint_to_outcome'});
      composite('dependency_network','凱爾特完整依賴網絡',[cc,va,ta,se,eo],{topology:'nonlinear_dependency_network',rule:'五個結構單位共同限定結果；不得按 N01→N10 線性敘事。'});
    } else if(id==='tree_of_life'){
      var mp=add('mercy_pillar','慈悲柱',[1,3,6],{topology:'ordered_pillar'}), sp=add('severity_pillar','嚴厲柱',[2,4,7],{topology:'ordered_pillar'}), mid=add('middle_pillar','中柱',[0,5,8,9],{topology:'ordered_pillar'});
      composite('pillar_dependency_network','三柱整合',[mp,sp,mid],{topology:'three_pillar_network'});
    } else if(id==='zodiac'){
      var axes=[]; for(var ax=0;ax<6;ax++) axes.push(add('house_axis','宮位對軸 '+(ax+1)+'↔'+(ax+7),[ax,ax+6],{ordered:false,topology:'axis'}));
      composite('domain_dependency_network','十二領域與主旋律',axes,{topology:'domain_network',rule:'各宮與對軸先獨立成命題，再由總結位整合。'});
    } else if(id==='minor_arcana'){
      var ma=add('mechanism_chain','原因—現況—挑戰',[1,0,2],{topology:'directed_event_graph',edges:[[1,0],[2,0]]}), mr=add('resource_intervention','環境與資源—建議',[3,4,5],{topology:'intervention_graph'}), mo=add('outcome_link','結果受前述機制限定',[0,2,3,4,5,6],{topology:'directed_dependency_graph',edges:[[0,6],[2,6],[3,6],[4,6],[5,6]]});
      composite('outcome_dependency_graph','完整日常事件網絡',[ma,mr,mo],{topology:'dependency_graph'});
    } else if(id==='fifteen_card'){
      var tc=add('triad_core','核心三牌組',[1,0,2],{group:'core',topology:'triad'}), tn=add('triad_natural','自然發展三牌組',[3,7,11],{group:'natural',topology:'triad'}), tal=add('triad_alternative','替代路徑三牌組',[12,8,4],{group:'alternative',topology:'triad'}), td=add('triad_decision','決策依據三牌組',[5,9,13],{group:'decision',topology:'triad'}), tf=add('triad_fate','不可控條件三牌組',[6,10,14],{group:'fate',topology:'triad'});
      composite('triad_comparison','自然與替代路徑比較',[tn,tal,tc,td,tf],{topology:'parallel_branch_comparison'});
    } else if(id==='mathers_21'){
      var rows=[]; rows.push(add('ordered_row','第一排連續故事',[0,1,2,3,4,5,6],{group:'row1',topology:'ordered_path'})); rows.push(add('ordered_row','第二排連續故事',[7,8,9,10,11,12,13],{group:'row2',topology:'ordered_path'})); rows.push(add('ordered_row','第三排連續故事',[14,15,16,17,18,19,20],{group:'row3',topology:'ordered_path'}));
      var pairs=[]; for(var mp2=0;mp2<10;mp2++) pairs.push(add('declared_outer_pair','Mathers 配對 '+(mp2+1)+'↔'+(21-mp2),[mp2,20-mp2],{ordered:false,group:'pair',topology:'pair'}));
      var center=add('center_card','中心單張',[10],{ordered:false,topology:'node'}); composite('row_dependency_network','三排、配對與中心綜合',rows.concat(pairs).concat([center]),{topology:'dependency_graph'});
    } else if(id==='mathers_horseshoe'){
      add('ordered_group','A 組 26 張由右至左',Array.from({length:26},function(_,i){return i;}),{group:'A',topology:'ordered_path'});
      add('ordered_group','C 組 17 張由右至左',Array.from({length:17},function(_,i){return i+26;}),{group:'C',topology:'ordered_path'});
      add('ordered_group','E 組 11 張由右至左',Array.from({length:11},function(_,i){return i+43;}),{group:'E',topology:'ordered_path'});
      for(var a=0;a<13;a++) add('declared_outer_pair','A'+(a+1)+'↔A'+(26-a),[a,25-a],{ordered:false,group:'A',topology:'pair'});
      for(var c=0;c<8;c++) add('declared_outer_pair','C'+(c+1)+'↔C'+(17-c),[26+c,42-c],{ordered:false,group:'C',topology:'pair'});
      add('center_card','C 組中心單張',[34],{ordered:false,group:'C',topology:'node'});
      for(var e=0;e<5;e++) add('declared_outer_pair','E'+(e+1)+'↔E'+(11-e),[43+e,53-e],{ordered:false,group:'E',topology:'pair'});
      add('center_card','E 組中心單張',[48],{ordered:false,group:'E',topology:'node'});
    } else if(id==='horseshoe'){
      add('ordered_arc','七張弧形主線',[0,1,2,3,4,5,6],{topology:'ordered_arc'}); add('environment_obstacle_link','他人／環境與阻礙',[4,5],{ordered:false,topology:'interaction'}); add('intervention_outcome_chain','建議—阻礙—結果',[3,5,6],{topology:'intervention_graph'});
    }

    return {
      schema:SCHEMA, methodId:id, methodLabel:spec.label,
      sourceProfile:options.sourceProfile || resolveSemanticProfile(id,options),
      topology:clone(spec.topology), nodes:nodes, evidenceUnits:units,
      legalSynthesisRule:id==='mathers_horseshoe' ? '同組可讀連續片段與明示配對；跨 A／C／E 只能綜合各組已成立命題，不得把跨組牌名拼成新牌句。' : id==='mathers_21' ? '每排先成連續故事，再讀明示配對；跨排只能綜合已成立命題。' : '只能使用本圖列出的節點、直接結構與依賴單位；綜合單位只能合成其 dependsOn 已成立命題，不得把依賴圖改寫成不存在的線性牌句。',
      forbiddenInference:['牌張數、牌號、宮廷牌數不得換算現實數量','聚合角色位不得當成一名人物或人數上限','建議位不得證明事件存在','較弱現象不得升格為完整事件','不同牌義來源不得混用','綜合單位不得被讀成任意牌序']
    };
  }

  function normalizeOotkCard(c,fallback) {
    if(!c) return null;
    return {name:stripDirection(c.name || c.n || c.cardName || fallback || '?'),title:text(c.thothTitle || c.title || ''),element:text(c.element || c.el || '')};
  }
  function compileOOTKEvidence(ootkData) {
    var data=ootkData || {}, ops=data.operations || {}, units=[], nodes=[], nodeCounter=0, stageSummaries=[];
    function addNode(card,opKey,channel){var c=normalizeOotkCard(card);if(!c)return null;var n={id:nodeId(nodeCounter++),cardName:c.name,direction:'',position:opKey+' '+channel,authority:'structural',authorityRule:ROLE_AUTHORITY.structural,sourceOperation:opKey,semanticCandidates:splitAtoms(c.title),sourceGloss:c.title};nodes.push(n);return n.id;}
    ['op1','op2','op3','op4','op5'].forEach(function(key,idx){
      var op=ops[key]; if(!op)return; var stage=idx+1, stageUnits=[];
      var landing=text(op.activePile || op.activeHouse || op.activeSign || op.activeSephirah || op.sephirahZh || '');
      stageUnits.push(addUnit(units,'operation_landing','第'+stage+'次操作落點：'+(landing || '資料未命名'),[],{stage:stage,group:key,ordered:false,topology:'procedure_state'}));
      var pathNodes=[]; (op.countingPath || []).forEach(function(x){var nid=addNode(x.card || x,key,'counting-path');if(nid)pathNodes.push(nid);});
      if(pathNodes.length) stageUnits.push(addUnit(units,'operation_counting_path','第'+stage+'次操作完整計數路徑',pathNodes,{stage:stage,group:key,topology:'ordered_counting_path'}));
      (op.pairs || []).forEach(function(pr,pi){var pairNodes=[],l=addNode(pr.left || pr.card1,key,'pair-left'),r=addNode(pr.right || pr.card2,key,'pair-right');if(l)pairNodes.push(l);if(r)pairNodes.push(r);if(pairNodes.length)stageUnits.push(addUnit(units,'operation_pair','第'+stage+'次操作配對 #'+(pi+1),pairNodes,{stage:stage,group:key,ordered:false,topology:'pair'}));});
      if(stage===4 && op.decanDateRange) stageUnits.push(addUnit(units,'op4_time_anchor','第四次操作時間錨：'+text(op.decanSign)+' '+text(op.decanRange)+' / '+text(op.decanDateRange),[],{stage:stage,group:key,ordered:false,topology:'explicit_anchor'}));
      if(op.abandonTriggered || op.weakSignalWarning || op.sephExpectationMet===false || op.attempt>1) stageUnits.push(addUnit(units,'operation_validity','第'+stage+'次操作適配／重試／降權資料',[],{stage:stage,group:key,ordered:false,topology:'validity_constraint'}));
      stageSummaries.push(addUnit(units,'operation_stage_summary','第'+stage+'次操作階段命題',[],{stage:stage,group:key,ordered:false,topology:'dependency_graph',claimPolicy:'synthesis_only',dependsOn:stageUnits.map(function(u){return u.id;}),rule:'只綜合本次操作內已成立命題。'}));
    });
    if(stageSummaries.length) addUnit(units,'cross_operation_stage_network','五次操作階段整合',[],{ordered:false,topology:'five_stage_dependency_network',claimPolicy:'synthesis_only',dependsOn:stageSummaries.map(function(u){return u.id;}),rule:'只綜合各次操作的階段命題，不直接跨操作連牌。'});
    return {
      schema:SCHEMA,methodId:'ootk',methodLabel:METHOD_SPECS.ootk.label,sourceProfile:'gd_book_t',topology:clone(METHOD_SPECS.ootk.topology),nodes:nodes,evidenceUnits:units,
      legalSynthesisRule:'每次操作先以自己的落點、完整計數路徑、配對與有效性成句；跨操作只能綜合階段命題（operation_stage_summary），不能把不同操作的牌直接拼成一條牌句。',
      forbiddenInference:['計數值、步數、落堆張數不得換算現實數量','代表牌每次出現屬程序機制','不同操作不可直接連牌','第四次以外不得自行製造精確日期']
    };
  }

  function capabilityStatus(code,dim,methodSpec,questionSpec) {
    var relation=(questionSpec.relations || [])[0] || null;
    var common={dimensionId:dim.id,dimension:dim.label,methodCapability:code,evidenceRequirement:'最終裁決仍須由合法證據命題與反證競爭決定'};
    if(code==='not_measured' || /^not_measured/.test(code)) return Object.assign(common,{precheckStatus:'未直接量測',canAnswer:false,answerForm:'boundary_then_weaker_claims',reason:code==='not_measured_single_subject_network'?'本方法只有單一情勢網絡，沒有為比較雙方建立可分離且同尺度的觀測通道。':'本方法沒有此精確量測通道。'});
    if(code==='requires_independent_channels' || code==='requires_independent_comparable_channels') return Object.assign(common,{precheckStatus:'缺少獨立比較通道',canAnswer:false,answerForm:'boundary_then_weaker_claims',reason:'原問句要求比較／門檻，但本方法未建立兩個已綁定、彼此獨立且使用同一基準的通道。'});
    if(code==='anchor_required' || code==='op4_anchor_only') return Object.assign(common,{precheckStatus:'有明示錨才可量測',canAnswer:null,answerForm:'anchored_only',reason:code==='op4_anchor_only'?'只可使用第四次操作提供的明示時間錨。':'必須有資料區可回溯時間錨。'});
    if(code==='scope_constraint') return Object.assign(common,{precheckStatus:'原句範圍約束',canAnswer:true,answerForm:'constrain_all_claims',reason:'期限來自使用者原句，不是牌面推算。'});
    if(code==='question_operator') return Object.assign(common,{precheckStatus:'原句模態約束',canAnswer:true,answerForm:'calibrated_modality',reason:'回答強度必須對應「能／會／可能」等原句模態。'});
    if(code==='direct_comparison_channel') return Object.assign(common,{precheckStatus:'有獨立比較通道',canAnswer:true,answerForm:'qualitative_comparison',reason:'本方法有兩條獨立分支，可在同一基準下比較。'});
    if(code==='qualitative_comparison_if_bound') return Object.assign(common,{precheckStatus:'綁定兩路後可定性比較',canAnswer:null,answerForm:'qualitative_comparison_if_bound',reason:'只有題目兩個比較對象已分別綁定到兩條路徑時才可裁決。'});
    if(code==='qualitative_contrast_only') return Object.assign(common,{precheckStatus:'只可描述關係差異',canAnswer:true,answerForm:'qualitative_contrast',reason:'可比較互動作用，但不量測數值排序或門檻。'});
    if(code==='direct_channel' || code==='qualitative_direct') return Object.assign(common,{precheckStatus:'有直接觀測通道',canAnswer:true,answerForm:'qualitative',reason:'方法有對應位置或結構通道。'});
    return Object.assign(common,{precheckStatus:'可作定性推論',canAnswer:true,answerForm:'qualitative',reason:relation && /comparison|relative_order|threshold_crossing/.test(dim.id)?'只可在方法真正支持比較時使用。':'由多個合法命題一致支持後定性回答。'});
  }
  function capabilityForDimension(spec,dimId) {
    return (spec.measurement && spec.measurement[dimId]) || 'qualitative_inference';
  }
  function buildCapabilityMatrix(questionSpec,methodSpec) {
    return (questionSpec.requestedDimensions || []).map(function(d){return capabilityStatus(capabilityForDimension(methodSpec,d.id),d,methodSpec,questionSpec);});
  }

  function compileReadingSpec(input) {
    input=input || {};
    var questionSpec=compileQuestion(input.question || ''), spreadId=normalizeSpreadId(input.spreadId || (input.ootkData?'ootk':'three_card'));
    var sourceProfile=input.sourceProfile || resolveSemanticProfile(spreadId,{waitePure:input.waitePure});
    var graph=spreadId==='ootk'?compileOOTKEvidence(input.ootkData || {}):compileEvidenceGraph(spreadId,input.cards || [],{knownCounterpart:!!input.knownCounterpart,sourceProfile:sourceProfile,waitePure:input.waitePure});
    var method=clone(METHOD_SPECS[spreadId] || METHOD_SPECS.three_card); method.defaultSourceProfile=method.sourceProfile; method.sourceProfile=sourceProfile;
    var profile=clone(SOURCE_PROFILES[sourceProfile] || SOURCE_PROFILES.modern_rws);
    var contract={
      schema:SCHEMA,engineVersion:VERSION,question:questionSpec,method:method,sourceProfile:profile,
      capabilityMatrix:buildCapabilityMatrix(questionSpec,method),evidenceGraph:graph,
      claimSchema:{
        required:['claimId','claimType','subject','predicate','objectOrState','modality','scope','supportedDimensions','evidenceIds','counterEvidenceIds','assumptions','doesNotEstablish'],
        claimType:['direct_observation','structured_inference','boundary','contextual_example','actionable_translation'],
        modality:['established_within_method','favored','possible','limited','not_supported','unmeasured'],
        rule:'每一命題先標明它回答原問句哪一維度、由哪個合法證據單位支持、需要哪些假設，以及它不能證明什麼；情境例子不得冒充牌面事實。'
      },
      adjudication:{
        steps:['重建並核對原句語義義務','逐一以合法證據單位生成候選命題','淘汰主詞、受詞、範圍、來源或位置越權者','依依賴圖先完成局部命題再做綜合','把每個需求維度的支持、限制、反證與未量測分開登記','完整事件強度不得高於最弱必要成分','先裁決原問句完整關係，再輸出較弱子命題'],
        noVoteRule:'不以吉凶牌數、正逆位票數、花色缺席或單一強牌裁決。',
        relationRule:'比較／門檻題只有在方法存在兩個已綁定、獨立且同尺度的觀測通道時，才可裁決相對排序或跨越門檻；否則只能裁決各自可觀測的趨勢與結果。',
        semanticMaterialRule:'牌義資料是候選語義原子與來源釋義，不是已成立的事件句；必須經牌位、結構與反證選擇後才能成為命題。',
        synthesisRule:graph.legalSynthesisRule
      },
      outputContract:{
        firstSentence:'直接逐項回答原問句的完整命題；比較／門檻若未量測，先明說不能確認，再說牌面支持到哪一個較弱層級。不得重新定義「成功」或其他成立尺度。',
        visibleEvidence:'重要判斷附實際牌名；證據 ID 只供內部稽核，不必顯示。',
        contextualization:'牌面只能支持較抽象作用時，具體生活情境必須標成「例如／可能表現為」，不得寫成已發生的事實。',
        length:'只由非重複有效命題數量決定。',
        facts:'任何精確數字、身分、日期、金額或年齡必須有明示量測錨。'
      }
    };
    contract.validation=validateContract(contract); return contract;
  }

  function validateContract(contract) {
    var errors=[],warnings=[];
    if(!contract || contract.schema!==SCHEMA) errors.push('schema_missing');
    var sourceId=contract && contract.sourceProfile && contract.sourceProfile.id, method=contract && contract.method || {}, methodId=method.id, graph=contract && contract.evidenceGraph || {}, units=graph.evidenceUnits || [], nodes=graph.nodes || [];
    if((method.allowedSourceProfiles || []).length && method.allowedSourceProfiles.indexOf(sourceId)<0) errors.push('source_profile_not_allowed:'+sourceId+' for '+methodId);
    if((methodId==='mathers_21'||methodId==='mathers_horseshoe') && sourceId!=='mathers_1888') errors.push('mathers_source_mismatch');
    if(methodId==='ootk' && sourceId!=='gd_book_t') errors.push('ootk_source_mismatch');
    if(methodId!=='ootk' && method.expectedCardCount!=null && nodes.length!==method.expectedCardCount) errors.push('card_count_mismatch:'+nodes.length+'/'+method.expectedCardCount);
    var unitIds=Object.create(null),nodeIds=Object.create(null);
    nodes.forEach(function(n){if(nodeIds[n.id])errors.push('duplicate_node_id:'+n.id);nodeIds[n.id]=1;});
    units.forEach(function(u){if(unitIds[u.id])errors.push('duplicate_evidence_id:'+u.id);unitIds[u.id]=1;});
    units.forEach(function(u){
      (u.nodes || []).forEach(function(nid){if(!nodeIds[nid])errors.push('evidence_references_missing_node:'+u.id+'/'+nid);});
      (u.dependsOn || []).forEach(function(uid){if(!unitIds[uid])errors.push('evidence_references_missing_dependency:'+u.id+'/'+uid);});
      if(u.claimPolicy==='synthesis_only' && (u.nodes || []).length) errors.push('synthesis_unit_must_not_linearize_nodes:'+u.id);
      if(methodId==='ootk' && (u.nodes || []).length){var opSet=uniq(u.nodes.map(function(nid){var n=nodes.find(function(x){return x.id===nid;});return n&&n.sourceOperation;}).filter(Boolean));if(opSet.length>1)errors.push('ootk_cross_operation_direct_unit:'+u.id);}
    });
    if(methodId==='celtic_cross'){
      if(nodes[1] && nodes[1].authority!=='interaction_force') errors.push('celtic_crossing_role_must_be_interaction_force');
      var whole=units.find(function(u){return u.type==='dependency_network';});
      if(!whole || whole.nodes.length || whole.topology!=='nonlinear_dependency_network') errors.push('celtic_network_linearized');
    }
    if(methodId!=='ootk' && nodes.length && nodes.every(function(n){return !n.semanticCandidates.length && !text(n.sourceGloss);})) errors.push('selected_source_meanings_missing');
    if(methodId==='ootk'){
      var stages=uniq(units.map(function(u){return Number(u.stage);}).filter(function(n){return n>=1&&n<=5;}));
      if(stages.length!==method.expectedOperationCount) errors.push('ootk_operation_count_mismatch:'+stages.length+'/'+method.expectedOperationCount);
      var cross=units.find(function(u){return u.type==='cross_operation_stage_network';});
      if(!cross || cross.nodes.length || cross.dependsOn.length!==5) errors.push('ootk_stage_network_missing');
    }
    var q=contract && contract.question || {};
    (q.relations || []).forEach(function(r){if(r.type==='ordered_comparison'){
      var dims=(q.requestedDimensions || []).map(function(d){return d.id;});
      if(dims.indexOf('relative_order')<0 || dims.indexOf('threshold_crossing')<0) errors.push('comparison_dimensions_incomplete:'+r.id);
    }});
    if(!(q.requestedDimensions || []).length) warnings.push('question_dimensions_empty');
    return {ok:errors.length===0,errors:uniq(errors),warnings:uniq(warnings)};
  }

  function renderEvidenceUnit(u,graph) {
    var nodeMap=Object.create(null);(graph.nodes || []).forEach(function(n){nodeMap[n.id]=n;});
    var cards=(u.nodes || []).map(function(id){var n=nodeMap[id];return n?id+' '+n.position+'='+n.cardName+(n.direction?'('+n.direction+')':''):id;});
    var dep=(u.dependsOn || []).length?'｜dependsOn='+u.dependsOn.join(','):'';
    var topo='｜topology='+u.topology;
    return u.id+'｜'+u.type+'｜'+u.label+topo+dep+(cards.length?'｜'+cards.join(u.ordered?' → ':' ↔ '):'');
  }
  function renderPromptContract(contract) {
    if(!contract)return '';
    var q=contract.question,m=contract.method,g=contract.evidenceGraph,src=contract.sourceProfile,L=[];
    L.push('────────────────────────────');L.push('◆ ROOT-SPEC v91｜原句關係—量測能力—方法拓撲—證據契約');L.push('────────────────────────────');
    L.push('原問句：'+q.originalQuestion);
    L.push('需求維度：'+q.requestedDimensions.map(function(d){return d.label+(d.source?'〔'+d.source+'〕':'');}).join('、'));
    if(q.explicitScopes.length)L.push('原句明示範圍：'+q.explicitScopes.join('、'));
    if(q.relations.length){L.push('原句關係：');q.relations.forEach(function(r){L.push('・'+r.id+'｜'+r.type+'｜'+r.left+' '+r.operatorText+' '+r.right+(r.inferredLeftMetric?'〔左側量測名詞由平行結構補回〕':'')+'；'+r.fidelityRule);});}
    L.push('語義義務：');q.semanticObligations.forEach(function(o){L.push('・'+o.id+'｜'+o.type+'｜'+o.text);});
    L.push('問題保真：'+q.fidelityRule+' '+q.comparisonRule+' '+q.completionRule);
    L.push('方法：'+m.label+'〔'+m.id+'〕；拓撲='+m.topology.kind+'。');
    L.push('牌義來源：'+src.label+'〔'+src.id+'〕；本次只准使用這一個來源設定。');
    L.push('來源邊界：'+src.reversalPolicy+'；'+src.imagePolicy+'。');
    L.push('觀測能力預檢：');contract.capabilityMatrix.forEach(function(r){L.push('・'+r.dimension+'＝'+r.precheckStatus+'（'+r.methodCapability+'）｜'+r.reason);});
    L.push('位置權限：');(g.nodes || []).forEach(function(n){L.push('・'+n.id+' '+n.position+'｜'+n.authority+'｜'+n.authorityRule);});
    L.push('牌義候選素材（不是已成立事件句）：');(g.nodes || []).forEach(function(n){L.push('・'+n.id+' '+n.cardName+'｜候選語義='+((n.semanticCandidates || []).join('／') || '未拆分')+(n.sourceGloss?'｜來源釋義='+n.sourceGloss:''));});
    L.push('合法證據單位：');(g.evidenceUnits || []).forEach(function(u){L.push('・'+renderEvidenceUnit(u,g));});
    L.push('合法合成：'+g.legalSynthesisRule);
    L.push('內部命題帳本：先依 claim schema 建立命題；每項命題必填 claimType、supportedDimensions、evidenceIds、counterEvidenceIds、assumptions、doesNotEstablish。帳本不輸出給客人。');
    L.push('裁決程序：'+contract.adjudication.steps.join(' → ')+'。');
    L.push('比較與門檻：'+contract.adjudication.relationRule);
    L.push('語義素材：'+contract.adjudication.semanticMaterialRule);
    L.push('裁決上限：完整事件的結論強度不得高於最弱的必要語義成分；未量測維度只標示邊界，不得污染其他維度。');
    L.push('禁止推理：'+(g.forbiddenInference || []).concat([contract.adjudication.noVoteRule]).join('；')+'。');
    L.push('最終輸出：'+contract.outputContract.firstSentence+' '+contract.outputContract.visibleEvidence+' '+contract.outputContract.contextualization+' '+contract.outputContract.length+' '+contract.outputContract.facts);
    return L.join('\n');
  }

  var TAROT_NAME_RE=/(?:愚者|魔術師|女祭司|皇后|皇帝|教皇|戀人|戰車|力量|隱者|命運之輪|正義|吊人|倒吊人|死神|節制|惡魔|高塔|塔|星星|月亮|太陽|審判|世界|(?:權杖|聖杯|寶劍|金幣|錢幣)(?:王牌|一|二|三|四|五|六|七|八|九|十|侍者|騎士|皇后|國王))/g;
  function positiveThresholdAssertion(s,relation) {
    if(!relation)return false;
    var op=relation.operatorText.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
    var re=new RegExp('(會|能|可以|將|終將|必然|傾向)(?:.{0,8})'+op);
    if(!re.test(s))return false;
    var prefix=s.slice(Math.max(0,s.search(re)-12),s.search(re)+2);
    return !/(無法|不能|未能|尚不能|不足以|不代表|未必|不一定)/.test(prefix);
  }
  function validateAnswer(answer,contract) {
    var s=text(answer),graph=contract && contract.evidenceGraph || {},allowed=Object.create(null),violations=[],warnings=[];
    (graph.nodes || []).forEach(function(n){allowed[n.cardName]=1;});
    var mentioned=s.match(TAROT_NAME_RE) || [];uniq(mentioned).forEach(function(n){if(!allowed[n] && !(n==='塔'&&allowed['高塔']))violations.push('引用本盤外牌名：'+n);});
    var caps=Object.create(null);((contract || {}).capabilityMatrix || []).forEach(function(r){caps[r.dimensionId]=r;});
    if(caps.exact_age && caps.exact_age.canAnswer===false && /(?:\d{1,3}|[一二三四五六七八九十兩]{1,3})\s*歲/.test(s))violations.push('本方法未量測年齡，卻輸出具體歲數');
    if(caps.cardinality && caps.cardinality.canAnswer===false && /(?:\d+|[一二三四五六七八九十兩]+)\s*(?:個|位|人)(?:異性|對象|追求者|暗戀者|桃花|候選人)?/.test(s))violations.push('本方法未量測人數，卻輸出具體人數');
    if(caps.probability && caps.probability.canAnswer===false && /\d+(?:\.\d+)?\s*%/.test(s))violations.push('本方法未量測機率，卻輸出百分比');
    if(caps.exact_value && caps.exact_value.canAnswer===false && /(?:NT\$|\$|新台幣)?\s*\d[\d,]*(?:元|萬|千)/.test(s))violations.push('本方法未量測精確金額，卻輸出具體金額');
    if(caps.exact_date && caps.exact_date.canAnswer===false && /\d{4}年\d{1,2}月|\d{1,2}月\d{1,2}日|\d+\s*(?:天|週|個月)內/.test(s))violations.push('本方法未量測精確時間，卻輸出具體日期或區間');
    var relations=((contract || {}).question || {}).relations || [];
    relations.forEach(function(r){
      var cap=caps.threshold_crossing || caps.relative_order;
      if(cap && cap.canAnswer===false && positiveThresholdAssertion(s,r))violations.push('本方法沒有獨立比較通道，卻肯定跨越比較門檻：'+r.left+' '+r.operatorText+' '+r.right);
    });
    if(relations.length && /若.{0,20}成功.{0,12}是指|如果.{0,20}成功.{0,12}是指/.test(s))violations.push('重新定義原問句已明示的成功門檻');
    if(/\d/.test(s))warnings.push('輸出含阿拉伯數字，需逐一核對資料錨點');
    if(!s)violations.push('空白輸出');
    return {ok:violations.length===0,violations:uniq(violations),warnings:uniq(warnings),mentionedCards:uniq(mentioned)};
  }

  return {
    VERSION:VERSION,SCHEMA:SCHEMA,SOURCE_PROFILES:SOURCE_PROFILES,METHOD_SPECS:METHOD_SPECS,ROLE_AUTHORITY:ROLE_AUTHORITY,
    compileQuestion:compileQuestion,resolveSemanticProfile:resolveSemanticProfile,compileEvidenceGraph:compileEvidenceGraph,compileOOTKEvidence:compileOOTKEvidence,compileReadingSpec:compileReadingSpec,renderPromptContract:renderPromptContract,validateContract:validateContract,validateAnswer:validateAnswer,stripDirection:stripDirection
  };
});
