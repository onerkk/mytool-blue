/*! tarot-semantic-engine.js — 塔羅語義編譯器與合法證據圖 [v90.0]
 * 目的：把「問題理解、方法規格、牌義來源、合法證據單位、量測邊界、輸出稽核」
 * 從長篇提示詞拆成可執行規格，避免依錯例繼續追加題型補丁。
 */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.JYTarotSemanticEngine = api;
})(typeof globalThis !== 'undefined' ? globalThis : (typeof window !== 'undefined' ? window : this), function () {
  'use strict';

  var VERSION = '90.0.0';
  var SCHEMA = 'jy.tarot.semantic-contract/1';

  function clone(x) { return x == null ? x : JSON.parse(JSON.stringify(x)); }
  function uniq(xs) {
    var seen = Object.create(null), out = [];
    (xs || []).forEach(function (x) {
      var k = typeof x === 'string' ? x : JSON.stringify(x);
      if (!seen[k]) { seen[k] = 1; out.push(x); }
    });
    return out;
  }
  function text(x) { return x == null ? '' : String(x).trim(); }
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

  var SOURCE_PROFILES = {
    modern_rws: {
      id: 'modern_rws',
      label: '現代 RWS 通行義＋PCS 圖像',
      reversalPolicy: '使用資料區的現代通行正逆義',
      imagePolicy: 'PCS 圖像只有在改變命題時才可使用',
      compatibleMethods: 'modern_rws',
      disallow: ['Mathers 1888 原義冒充現代 RWS', 'Book T 計數規則冒充一般牌位義']
    },
    waite_1910: {
      id: 'waite_1910',
      label: 'Waite 1910《Pictorial Key》',
      reversalPolicy: '依資料區提供的 Waite 正逆占義',
      imagePolicy: 'PCS 圖像只輔助 Waite 原義',
      compatibleMethods: 'rws_geometry',
      disallow: ['現代 RWS 關鍵字覆寫原義', 'Golden Dawn 元素或旬位自行創造事件']
    },
    mathers_1888: {
      id: 'mathers_1888',
      label: 'Mathers 1888《The Tarot》牌義與程序',
      reversalPolicy: '依 Mathers 1888 正逆義',
      imagePolicy: '不以 1909 PCS 場景作原法證據',
      compatibleMethods: 'mathers_1888',
      disallow: ['現代 RWS 牌義混入', '任意跨排或跨組拼牌']
    },
    modern_rws_gd_structure: {
      id: 'modern_rws_gd_structure',
      label: '現代 RWS 牌義＋明示的 GD/Thoth 結構混合實務',
      reversalPolicy: '依資料區；方法若明示不用逆位則不得自行讀逆位',
      imagePolicy: 'PCS 圖像可作次級敘事',
      compatibleMethods: 'declared_hybrid',
      disallow: ['宣稱為純 Book T 或純 Thoth 原法']
    },
    gd_book_t: {
      id: 'gd_book_t',
      label: 'Golden Dawn《Book T》開鑰之法',
      reversalPolicy: '不以一般 RWS 逆位心理化；牌力由本方法資料決定',
      imagePolicy: '不以 PCS 場景取代計數、配對與元素程序',
      compatibleMethods: 'ootk',
      disallow: ['跨操作拼成單一路徑', '計數步數換算現實數量', '代表牌重複視為額外徵兆']
    }
  };

  var ROLE_AUTHORITY = {
    state: '描述該觀測通道的狀態，不自行證明盤外人物或事件存在',
    cause: '只說明形成機制，不可單獨取代結果',
    obstacle: '只說明限制、延遲、扭曲或反證',
    advice: '只說明可介入點，不可用來證明預測事件已成立',
    outcome: '說明在本結構下的收束；仍須由前段形成機制支撐',
    person_known: '可描述原問句已辨識的人物',
    person_aggregate: '條件性或聚合角色作用；不證明人物存在、不等於一人、也不是人數上限',
    environment: '描述外界條件或他人作用；未綁定時不得具名或計數',
    comparison: '只能在同一比較基準下判斷相對差異',
    timeline: '描述相對先後與轉折；沒有時間錨不得換算日期',
    domain: '描述該生活領域，不自動枚舉領域內的未知人物',
    structural: '只描述結構層級或路徑功能'
  };

  function mkSpec(id, label, sourceProfile, roles, operators, measurement, notes) {
    var roleList = roles || [];
    var strictSource = (sourceProfile === 'mathers_1888' || sourceProfile === 'gd_book_t');
    return {
      id: id,
      label: label,
      sourceProfile: sourceProfile,
      allowedSourceProfiles: strictSource ? [sourceProfile] : uniq([sourceProfile, 'modern_rws', 'waite_1910']),
      roles: roleList,
      expectedCardCount: id === 'ootk' ? null : roleList.length,
      expectedOperationCount: id === 'ootk' ? 5 : null,
      operators: operators || [],
      measurement: measurement || {},
      notes: notes || []
    };
  }

  var COMMON_MEASUREMENT = {
    state: 'direct_channel',
    existence: 'qualitative_inference',
    degree: 'qualitative_inference',
    cause: 'when_channel_exists',
    trajectory: 'when_channel_exists',
    outcome: 'when_channel_exists',
    guidance: 'when_channel_exists',
    comparison: 'not_measured',
    cardinality: 'not_measured',
    exact_age: 'not_measured',
    identity: 'not_measured',
    exact_date: 'not_measured',
    money: 'not_measured',
    probability: 'not_measured'
  };

  function measure(extra) {
    var x = clone(COMMON_MEASUREMENT);
    Object.keys(extra || {}).forEach(function (k) { x[k] = extra[k]; });
    return x;
  }

  var METHOD_SPECS = {
    three_card: mkSpec('three_card', '三牌陣', 'modern_rws',
      ['state','state','outcome'],
      ['atomic_node','adjacent_segment','whole_ordered_path'],
      measure({ trajectory: 'direct_channel', outcome: 'direct_channel' }),
      ['三張是三個觀測位置，不是三個人物或三個時間單位']),

    five_card: mkSpec('five_card', '五牌陣', 'modern_rws',
      ['state','cause','obstacle','advice','outcome'],
      ['atomic_node','declared_mechanism','full_event_chain'],
      measure({ cause:'direct_channel', trajectory:'qualitative_inference', outcome:'direct_channel', guidance:'direct_channel' }),
      ['結果必須由現況、原因、阻礙與介入點共同限定']),

    cross: mkSpec('cross', '十字牌陣', 'modern_rws',
      ['state','obstacle','cause','outcome','advice'],
      ['atomic_node','core_cross','development_axis','intervention_link'],
      measure({ cause:'direct_channel', trajectory:'direct_channel', guidance:'direct_channel' }),
      ['核心與交叉力量的關係優先於吉凶票數']),

    either_or: mkSpec('either_or', '二選一牌陣', 'modern_rws',
      ['state','comparison','comparison','outcome','outcome'],
      ['atomic_node','branch_A','branch_B','branch_comparison'],
      measure({ comparison:'direct_channel', trajectory:'direct_channel', outcome:'direct_channel' }),
      ['A 與 B 必須各自成路徑後才比較，不得把兩路牌任意拼句']),

    relationship: mkSpec('relationship', '關係牌陣', 'modern_rws',
      ['state','person_aggregate','state','obstacle','advice','outcome'],
      ['atomic_node','self_other_contrast','relationship_mechanism','obstacle_link','intervention_chain','outcome_chain'],
      measure({ trajectory:'direct_channel', outcome:'direct_channel', guidance:'direct_channel', cardinality:'not_measured', identity:'not_measured', exact_age:'not_measured' }),
      ['原問句有可辨識對象時第二通道可綁定該人；未知對象時只能讀條件性作用']),

    timeline: mkSpec('timeline', '時間線牌陣', 'modern_rws',
      ['cause','timeline','timeline','timeline','outcome'],
      ['atomic_node','ordered_timeline','trigger_chain'],
      measure({ cause:'direct_channel', trajectory:'direct_channel', outcome:'direct_channel', exact_date:'anchor_required' }),
      ['直接量測相對順序、觸發與節奏；日期必須另有可回溯錨點']),

    celtic_cross: mkSpec('celtic_cross', '凱爾特十字', 'waite_1910',
      ['state','obstacle','structural','cause','timeline','timeline','state','environment','state','outcome'],
      ['atomic_node','core_cross','vertical_axis','time_axis','self_environment_axis','expectation_outcome_axis','whole_network'],
      measure({ cause:'direct_channel', trajectory:'direct_channel', outcome:'direct_channel', guidance:'qualitative_inference' }),
      ['第九位是希望或恐懼，不得越權當結果']),

    tree_of_life: mkSpec('tree_of_life', '生命之樹', 'modern_rws_gd_structure',
      ['structural','structural','structural','structural','structural','state','state','state','state','outcome'],
      ['atomic_node','mercy_pillar','severity_pillar','middle_pillar','cross_pillar_synthesis'],
      measure({ cause:'qualitative_inference', trajectory:'qualitative_inference', outcome:'direct_channel' }),
      ['質點是作用層級，不是現實人數、次數或月份']),

    zodiac: mkSpec('zodiac', '黃道十二宮牌陣', 'modern_rws_gd_structure',
      ['domain','domain','domain','domain','domain','domain','domain','domain','domain','domain','domain','domain','outcome'],
      ['atomic_node','house_axis','annual_summary'],
      measure({ state:'direct_channel', trajectory:'qualitative_inference', outcome:'direct_channel' }),
      ['十二宮分隔生活領域，不枚舉同一宮內的未知人物']),

    minor_arcana: mkSpec('minor_arcana', '小阿卡那專題牌陣', 'modern_rws',
      ['state','cause','obstacle','environment','state','advice','outcome'],
      ['atomic_node','mechanism_chain','resource_intervention','outcome_chain'],
      measure({ cause:'direct_channel', guidance:'direct_channel', outcome:'direct_channel' }),
      ['人物通道未綁定時仍是環境作用，不代表一個具體人']),

    fifteen_card: mkSpec('fifteen_card', '十五張英式牌陣', 'modern_rws_gd_structure',
      ['state','state','state','timeline','timeline','state','structural','timeline','timeline','state','structural','timeline','timeline','state','structural'],
      ['atomic_node','triad_core','triad_natural','triad_alternative','triad_decision','triad_fate','triad_comparison'],
      measure({ cause:'qualitative_inference', comparison:'direct_channel', trajectory:'direct_channel', outcome:'qualitative_inference' }),
      ['固定五個三牌組；不同三牌組只能在各自成句後綜合']),

    mathers_21: mkSpec('mathers_21', 'Mathers 1888 第二法', 'mathers_1888',
      new Array(21).fill('structural'),
      ['atomic_node','ordered_row','declared_outer_pair','center_card','cross_row_synthesis'],
      measure({ state:'qualitative_inference', cause:'qualitative_inference', trajectory:'qualitative_inference', outcome:'qualitative_inference' }),
      ['三排各自從右往左成連續故事，再讀 1↔21 至 10↔12；第11張為中心']),

    mathers_horseshoe: mkSpec('mathers_horseshoe', 'Mathers 1888 第一法完整 Horseshoe', 'mathers_1888',
      new Array(54).fill('structural'),
      ['atomic_node','ordered_group','contiguous_segment','declared_outer_pair','center_card','cross_group_claim_synthesis'],
      measure({ state:'qualitative_inference', cause:'qualitative_inference', trajectory:'qualitative_inference', outcome:'qualitative_inference', exact_age:'not_measured', cardinality:'not_measured' }),
      ['只讀 A=26、C=17、E=11；F=24 不進入解讀','跨組只能綜合各組已成立命題，不能把不同組牌名拼成一條新牌句']),

    horseshoe: mkSpec('horseshoe', '七張馬蹄形牌陣', 'modern_rws_gd_structure',
      ['cause','state','state','advice','environment','obstacle','outcome'],
      ['atomic_node','ordered_arc','environment_obstacle_link','intervention_outcome_chain'],
      measure({ cause:'direct_channel', trajectory:'qualitative_inference', outcome:'direct_channel', guidance:'direct_channel' }),
      ['他人／環境通道未綁定時不得反向創造人物']),

    ootk: mkSpec('ootk', 'Opening of the Key 五次操作', 'gd_book_t',
      ['structural','structural','structural','structural','structural'],
      ['operation_landing','operation_counting_path','operation_pair','operation_validity','op4_time_anchor','cross_operation_claim_synthesis'],
      measure({ state:'direct_channel', cause:'qualitative_inference', trajectory:'direct_channel', outcome:'direct_channel', exact_date:'op4_anchor_only', cardinality:'not_measured', exact_age:'not_measured', identity:'not_measured' }),
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
    { id:'cardinality', label:'數量／基數', re:/幾個|幾位|幾人|多少(?:人|個|位|次|件|張)|人數|數量/ },
    { id:'exact_age', label:'人物年齡', re:/幾歲|年齡|歲數|年紀/ },
    { id:'identity', label:'人物身分', re:/是誰|哪(?:一)?個人|哪(?:一)?位|姓名|名字|身分|什麼人/ },
    { id:'person_attribute', label:'人物屬性', re:/外貌|長相|身高|體重|職業|個性|星座|生肖|性別/ },
    { id:'money', label:'金額／價值', re:/多少錢|金額|價位|薪水|收入|成本|獲利|價格|報酬/ },
    { id:'probability', label:'機率／比例', re:/百分比|幾成|機率|多少%|多少趴|可能性多(?:高|大)/ },
    { id:'exact_date', label:'精確時間', re:/什麼時候|何時|幾時|多久|幾天|幾週|幾月|哪一年|日期|時間點/ },
    { id:'cause', label:'原因／機制', re:/為什麼|為何|原因|根源|怎麼會|問題出在/ },
    { id:'guidance', label:'方法／建議', re:/怎麼做|怎麼辦|如何(?:做|處理|改善|選)|建議|方法|策略|該怎麼/ },
    { id:'comparison', label:'比較／選擇', re:/還是|或者|二選一|哪個(?:較|更|好|適合)|比較|選哪/ },
    { id:'trajectory', label:'發展／走向', re:/未來|走向|結果|會變成|發展|最後|結局|之後|接下來/ },
    { id:'existence', label:'存在／成立與否', re:/有沒有|是否|會不會|是不是|能不能|可不可以|有.{0,12}嗎[？?]?|會.{0,12}嗎[？?]?/ },
    { id:'degree', label:'程度／強弱', re:/多(?:強|深|嚴重|明顯)|程度|強不強|深不深|嚴不嚴重/ }
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
    patterns.forEach(function (re) {
      var m; while ((m = re.exec(x))) scopes.push(m[0]);
    });
    return uniq(scopes);
  }

  function compileQuestion(question) {
    var q = text(question);
    var dims = [{ id:'event_or_state', label:'核心事件／狀態', source:'整句原文' }];
    DIMENSION_DEFS.forEach(function (d) {
      if (d.re.test(q)) dims.push({ id:d.id, label:d.label, source:(q.match(d.re)||[])[0] || '' });
    });
    var scopes = detectScope(q);
    if (scopes.length) dims.push({ id:'time_scope', label:'使用者明示期限／範圍', source:scopes.join('、') });
    dims = uniq(dims.map(function (d) { return d.id; })).map(function (id) {
      if (id === 'event_or_state') return { id:id, label:'核心事件／狀態', source:'整句原文' };
      if (id === 'time_scope') return { id:id, label:'使用者明示期限／範圍', source:scopes.join('、') };
      var def = DIMENSION_DEFS.find(function (x) { return x.id === id; });
      var src = def && q.match(def.re); return { id:id, label:def ? def.label : id, source:src ? src[0] : '' };
    });
    return {
      schema: SCHEMA,
      originalQuestion: q,
      clauses: splitClauses(q),
      explicitScopes: scopes,
      requestedDimensions: dims,
      modelMustInfer: ['主體','對象或場域','核心謂詞','成立尺度','不可省略限定'],
      fidelityRule: '模型建立的完整命題必須與原問句雙向相容：不得漏掉原句必要成分，也不得加入原句沒有且牌面未建立的前提。',
      completionRule: '詞法偵測只是提示；模型必須重新核對整句，補回未被詞法偵測但語義上實際要求的資訊維度。'
    };
  }

  function normalizeCards(cards) {
    return (cards || []).map(function (c, i) {
      var name = stripDirection(c.name || c.n || c.cardName || '?');
      return {
        id: nodeId(i),
        index: i + 1,
        cardName: name,
        direction: cardDirection(c),
        position: text(c.positionMeaning || c.position || c.zh || c.role || ('位置' + (i + 1))),
        role: text(c.role || ''),
        keywords: text(c.keywords || c.kw || ''),
        neutralMeaning: text(c.baseMeaning || c.meaning || c.mathersMeaning || c.waiteMeaning || ''),
        element: text(c.element || c.el || ''),
        sourcePosition: text(c.sourcePosition || '')
      };
    });
  }

  function addUnit(units, type, label, nodeIds, meta) {
    units.push({
      id: unitId(units.length),
      type: type,
      label: label,
      nodes: nodeIds.slice(),
      ordered: !(meta && meta.ordered === false),
      rule: (meta && meta.rule) || '',
      stage: (meta && meta.stage) || '',
      group: (meta && meta.group) || ''
    });
  }

  function rangeIds(start, end) {
    var out = [];
    for (var i = start; i <= end; i++) out.push(nodeId(i));
    return out;
  }

  function compileEvidenceGraph(spreadId, cards, options) {
    options = options || {};
    var id = normalizeSpreadId(spreadId);
    var spec = METHOD_SPECS[id] || METHOD_SPECS.three_card;
    var nodes = normalizeCards(cards);
    nodes.forEach(function (n, i) {
      var role = spec.roles[i] || 'structural';
      if (id === 'relationship' && i === 1 && options.knownCounterpart === true) role = 'person_known';
      n.authority = role;
      n.authorityRule = ROLE_AUTHORITY[role] || ROLE_AUTHORITY.structural;
    });
    var units = [];
    nodes.forEach(function (n) { addUnit(units, 'atomic_node', n.position + '：' + n.cardName, [n.id], { ordered:false }); });
    function add(type, label, idxs, meta) {
      var ids = idxs.map(function (i) { return nodeId(i); }).filter(function (nid) { return nodes.some(function (n) { return n.id === nid; }); });
      if (ids.length) addUnit(units, type, label, ids, meta);
    }

    if (id === 'three_card') {
      add('adjacent_segment','前段相鄰句',[0,1]); add('adjacent_segment','後段相鄰句',[1,2]); add('whole_ordered_path','完整三張路徑',[0,1,2]);
    } else if (id === 'five_card') {
      add('declared_mechanism','原因形成現況',[1,0]); add('declared_mechanism','阻礙限制現況',[2,0]); add('declared_mechanism','建議介入阻礙',[3,2]); add('declared_mechanism','形成機制通往結果',[0,1,2,4]); add('full_event_chain','完整事件鏈',[1,0,2,3,4]);
    } else if (id === 'cross') {
      add('core_cross','核心與交叉力量',[0,1]); add('development_axis','過去—核心—未來',[2,0,3]); add('intervention_link','建議介入核心與阻礙',[4,0,1]);
    } else if (id === 'either_or') {
      add('branch_A','A 路徑',[0,1,3],{group:'A'}); add('branch_B','B 路徑',[0,2,4],{group:'B'}); add('branch_comparison','A/B 同基準比較',[1,3,2,4],{ordered:false});
    } else if (id === 'relationship') {
      add('self_other_contrast','雙方作用對照',[0,1],{ordered:false}); add('relationship_mechanism','雙方如何形成現況',[0,1,2]); add('obstacle_link','挑戰如何改變現況',[2,3]); add('intervention_chain','現況—挑戰—介入',[2,3,4]); add('outcome_chain','完整關係收束',[0,1,2,3,4,5]);
    } else if (id === 'timeline') {
      add('ordered_timeline','完整相對時間線',[0,1,2,3,4]); add('trigger_chain','現況—觸發—發展—結果',[1,2,3,4]);
    } else if (id === 'celtic_cross') {
      add('core_cross','核心與交叉力量',[0,1]); add('vertical_axis','上方可能—腳下根基',[2,3],{ordered:false}); add('time_axis','身後—身前',[4,5]); add('self_environment_axis','本人—環境',[6,7],{ordered:false}); add('expectation_outcome_axis','希望恐懼—結果',[8,9]); add('whole_network','凱爾特完整網絡',[0,1,2,3,4,5,6,7,8,9]);
    } else if (id === 'tree_of_life') {
      add('mercy_pillar','慈悲柱',[1,3,6]); add('severity_pillar','嚴厲柱',[2,4,7]); add('middle_pillar','中柱',[0,5,8,9]); add('cross_pillar_synthesis','三柱整合',[0,1,2,3,4,5,6,7,8,9]);
    } else if (id === 'zodiac') {
      for (var ax=0; ax<6; ax++) add('house_axis','宮位對軸 '+(ax+1)+'↔'+(ax+7),[ax,ax+6],{ordered:false});
      add('annual_summary','十二領域與主旋律',[0,1,2,3,4,5,6,7,8,9,10,11,12]);
    } else if (id === 'minor_arcana') {
      add('mechanism_chain','原因—現況—挑戰',[1,0,2]); add('resource_intervention','環境與資源—建議',[3,4,5]); add('outcome_chain','完整日常事件鏈',[1,0,2,3,4,5,6]);
    } else if (id === 'fifteen_card') {
      add('triad_core','核心三牌組',[1,0,2],{group:'core'}); add('triad_natural','自然發展三牌組',[3,7,11],{group:'natural'}); add('triad_alternative','替代路徑三牌組',[12,8,4],{group:'alternative'}); add('triad_decision','決策依據三牌組',[5,9,13],{group:'decision'}); add('triad_fate','不可控條件三牌組',[6,10,14],{group:'fate'}); add('triad_comparison','自然與替代路徑比較',[3,7,11,12,8,4],{ordered:false});
    } else if (id === 'mathers_21') {
      add('ordered_row','第一排連續故事',[0,1,2,3,4,5,6],{group:'row1'}); add('ordered_row','第二排連續故事',[7,8,9,10,11,12,13],{group:'row2'}); add('ordered_row','第三排連續故事',[14,15,16,17,18,19,20],{group:'row3'});
      for (var mp=0; mp<10; mp++) add('declared_outer_pair','Mathers 配對 '+(mp+1)+'↔'+(21-mp),[mp,20-mp],{ordered:false,group:'pair'});
      add('center_card','中心單張',[10],{ordered:false});
    } else if (id === 'mathers_horseshoe') {
      add('ordered_group','A 組 26 張由右至左',[].concat(Array.from({length:26},function(_,i){return i;})),{group:'A'});
      add('ordered_group','C 組 17 張由右至左',[].concat(Array.from({length:17},function(_,i){return i+26;})),{group:'C'});
      add('ordered_group','E 組 11 張由右至左',[].concat(Array.from({length:11},function(_,i){return i+43;})),{group:'E'});
      for (var a=0;a<13;a++) add('declared_outer_pair','A'+(a+1)+'↔A'+(26-a),[a,25-a],{ordered:false,group:'A'});
      for (var c=0;c<8;c++) add('declared_outer_pair','C'+(c+1)+'↔C'+(17-c),[26+c,42-c],{ordered:false,group:'C'});
      add('center_card','C 組中心單張',[34],{ordered:false,group:'C'});
      for (var e=0;e<5;e++) add('declared_outer_pair','E'+(e+1)+'↔E'+(11-e),[43+e,53-e],{ordered:false,group:'E'});
      add('center_card','E 組中心單張',[48],{ordered:false,group:'E'});
    } else if (id === 'horseshoe') {
      add('ordered_arc','七張弧形主線',[0,1,2,3,4,5,6]); add('environment_obstacle_link','他人／環境與阻礙',[4,5],{ordered:false}); add('intervention_outcome_chain','建議—阻礙—結果',[3,5,6]);
    }

    return {
      schema: SCHEMA,
      methodId: id,
      methodLabel: spec.label,
      sourceProfile: options.sourceProfile || resolveSemanticProfile(id, options),
      nodes: nodes,
      evidenceUnits: units,
      legalSynthesisRule: id === 'mathers_horseshoe' ? '同組可讀連續片段與明示配對；跨 A/C/E 只能綜合各組已成立命題，不得把跨組牌名拼成新牌句。' : id === 'mathers_21' ? '每排先成連續故事，再讀明示配對；跨排只能綜合已成立命題。' : '只能使用本圖列出的節點與結構單位；跨單位綜合時先保留各單位的獨立命題。',
      forbiddenInference: ['牌張數、牌號、宮廷牌數不得換算現實數量','聚合角色位不得當成一名人物或人數上限','建議位不得證明事件存在','較弱現象不得升格為完整事件','不同牌義來源不得混用']
    };
  }

  function normalizeOotkCard(c, fallback) {
    if (!c) return null;
    return { name:stripDirection(c.name || c.n || c.cardName || fallback || '?'), title:text(c.thothTitle || c.title || ''), element:text(c.element || c.el || '') };
  }

  function compileOOTKEvidence(ootkData) {
    var data = ootkData || {}, ops = data.operations || {}, units = [], nodes = [], nodeCounter = 0;
    function addNode(card, opKey, channel) {
      var c = normalizeOotkCard(card);
      if (!c) return null;
      var n = { id:nodeId(nodeCounter++), cardName:c.name, direction:'', position:opKey+' '+channel, authority:'structural', authorityRule:ROLE_AUTHORITY.structural, sourceOperation:opKey };
      nodes.push(n); return n.id;
    }
    ['op1','op2','op3','op4','op5'].forEach(function (key, idx) {
      var op = ops[key]; if (!op) return;
      var stage = idx + 1;
      var landing = text(op.activePile || op.activeHouse || op.activeSign || op.activeSephirah || op.sephirahZh || '');
      addUnit(units,'operation_landing','第'+stage+'次操作落點'+(landing ? '：'+landing : ''),[],{stage:stage,group:key,ordered:false});
      var countNodes = [];
      (op.countingPath || []).forEach(function (step) { var nid = addNode({name:step.cardName || (step.card && (step.card.n || step.card.name))},key,'counting'); if(nid) countNodes.push(nid); });
      if (countNodes.length) addUnit(units,'operation_counting_path','第'+stage+'次操作完整計數路徑',countNodes,{stage:stage,group:key});
      (op.pairs || []).forEach(function (pr, pi) {
        var pairNodes = [];
        var l = addNode(pr.left || pr.card1,key,'pair-left'); var r = addNode(pr.right || pr.card2,key,'pair-right');
        if (l) pairNodes.push(l); if (r) pairNodes.push(r);
        if (pairNodes.length) addUnit(units,'operation_pair','第'+stage+'次操作配對 #'+(pi+1),pairNodes,{stage:stage,group:key,ordered:false});
      });
      if (stage === 4 && op.decanDateRange) addUnit(units,'op4_time_anchor','第四次操作時間錨：'+text(op.decanSign)+' '+text(op.decanRange)+' / '+text(op.decanDateRange),[],{stage:stage,group:key,ordered:false});
      if (op.abandonTriggered || op.weakSignalWarning || op.sephExpectationMet === false || op.attempt > 1) {
        addUnit(units,'operation_validity','第'+stage+'次操作適配／重試／降權資料',[],{stage:stage,group:key,ordered:false});
      }
    });
    return {
      schema: SCHEMA,
      methodId:'ootk', methodLabel:METHOD_SPECS.ootk.label, sourceProfile:'gd_book_t', nodes:nodes, evidenceUnits:units,
      legalSynthesisRule:'每次操作先以自己的落點、完整計數路徑、配對與有效性成句；跨操作只能綜合階段命題，不得把不同操作的牌直接拼成一條牌句。',
      forbiddenInference:['計數值、步數、落堆張數不得換算現實數量','代表牌每次出現屬程序機制','不同操作不可直接連牌','第四次以外不得自行製造精確日期']
    };
  }

  function capabilityForDimension(spec, dimId) {
    if (dimId === 'event_or_state' || dimId === 'time_scope' || dimId === 'person_attribute') return dimId === 'person_attribute' ? 'qualitative_or_unmeasured' : 'direct_or_qualitative';
    return (spec.measurement && spec.measurement[dimId]) || 'qualitative_inference';
  }

  function buildCapabilityMatrix(questionSpec, methodSpec) {
    return (questionSpec.requestedDimensions || []).map(function (d) {
      var cap = capabilityForDimension(methodSpec, d.id);
      var status = /not_measured/.test(cap) ? '未直接量測' : /anchor_required|op4_anchor_only/.test(cap) ? '有錨才可量測' : /direct_channel/.test(cap) ? '有直接觀測通道' : '可作定性推論';
      return { dimensionId:d.id, dimension:d.label, methodCapability:cap, precheckStatus:status, evidenceRequirement:'最終裁決仍須由合法證據命題與反證競爭決定' };
    });
  }

  function compileReadingSpec(input) {
    input = input || {};
    var questionSpec = compileQuestion(input.question || '');
    var spreadId = normalizeSpreadId(input.spreadId || (input.ootkData ? 'ootk' : 'three_card'));
    var sourceProfile = input.sourceProfile || resolveSemanticProfile(spreadId,{waitePure:input.waitePure});
    var graph = spreadId === 'ootk' ? compileOOTKEvidence(input.ootkData || {}) : compileEvidenceGraph(spreadId,input.cards || [],{knownCounterpart:!!input.knownCounterpart,sourceProfile:sourceProfile,waitePure:input.waitePure});
    var method = clone(METHOD_SPECS[spreadId] || METHOD_SPECS.three_card);
    method.defaultSourceProfile = method.sourceProfile;
    method.sourceProfile = sourceProfile;
    var profile = clone(SOURCE_PROFILES[sourceProfile] || SOURCE_PROFILES.modern_rws);
    var contract = {
      schema:SCHEMA,
      engineVersion:VERSION,
      question:questionSpec,
      method:method,
      sourceProfile:profile,
      capabilityMatrix:buildCapabilityMatrix(questionSpec,method),
      evidenceGraph:graph,
      claimSchema:{
        required:['claimId','subject','predicate','objectOrState','modality','scope','supportedDimensions','evidenceIds','counterEvidenceIds','assumptions','doesNotEstablish'],
        modality:['established_within_method','favored','possible','limited','not_supported','unmeasured'],
        rule:'每一命題先標明它回答原問句哪一個維度，以及它不能證明什麼。'
      },
      adjudication:{
        steps:['逐一以合法證據單位生成候選命題','淘汰主詞、受詞、範圍或來源不一致者','把每個需求維度的支持、限制、反證與未量測分開登記','完整事件強度不得高於最弱必要成分','先裁決原問句各維度，再生成自然語言答案'],
        noVoteRule:'不以吉凶牌數、正逆位票數、花色缺席或單一強牌裁決。',
        synthesisRule:graph.legalSynthesisRule
      },
      outputContract:{
        firstSentence:'直接逐項回答原問句；未量測者明說邊界，但不得因此丟掉其餘有效答案。',
        visibleEvidence:'重要判斷附實際牌名；證據 ID 只供內部稽核，不必顯示。',
        length:'只由非重複有效命題數量決定。',
        facts:'任何精確數字、身分、日期、金額或年齡必須有明示量測錨。'
      }
    };
    contract.validation = validateContract(contract);
    return contract;
  }

  function validateContract(contract) {
    var errors = [], warnings = [];
    if (!contract || contract.schema !== SCHEMA) errors.push('schema_missing');
    var sourceId = contract && contract.sourceProfile && contract.sourceProfile.id;
    var method = contract && contract.method || {};
    var methodId = method.id;
    var graph = contract && contract.evidenceGraph || {};
    var units = graph.evidenceUnits || [], nodes = graph.nodes || [];
    if ((method.allowedSourceProfiles || []).length && method.allowedSourceProfiles.indexOf(sourceId) < 0) {
      errors.push('source_profile_not_allowed:' + sourceId + ' for ' + methodId);
    }
    if ((methodId === 'mathers_21' || methodId === 'mathers_horseshoe') && sourceId !== 'mathers_1888') errors.push('mathers_source_mismatch');
    if (methodId === 'ootk' && sourceId !== 'gd_book_t') errors.push('ootk_source_mismatch');
    if (methodId !== 'ootk' && method.expectedCardCount != null && nodes.length !== method.expectedCardCount) {
      errors.push('card_count_mismatch:' + nodes.length + '/' + method.expectedCardCount);
    }
    var ids = Object.create(null), nodeIds = Object.create(null);
    nodes.forEach(function (n) {
      if (nodeIds[n.id]) errors.push('duplicate_node_id:' + n.id);
      nodeIds[n.id] = 1;
    });
    units.forEach(function (u) {
      if (ids[u.id]) errors.push('duplicate_evidence_id:' + u.id);
      ids[u.id]=1;
      (u.nodes || []).forEach(function (nid) { if (!nodeIds[nid]) errors.push('evidence_references_missing_node:' + u.id + '/' + nid); });
      if (methodId === 'ootk') {
        var ops = uniq((u.nodes || []).map(function (nid) {
          var n = nodes.find(function (x) { return x.id === nid; });
          return n && n.sourceOperation;
        }).filter(Boolean));
        if (ops.length > 1) errors.push('ootk_cross_operation_direct_unit:' + u.id);
      }
    });
    if (methodId !== 'ootk' && nodes.length && nodes.every(function (n) { return !text(n.neutralMeaning); })) {
      errors.push('selected_source_meanings_missing');
    } else if (methodId !== 'ootk' && nodes.some(function (n) { return !text(n.neutralMeaning); })) {
      warnings.push('some_selected_source_meanings_missing');
    }
    if (methodId === 'ootk') {
      var stages = uniq(units.map(function (u) { return Number(u.stage); }).filter(function (n) { return n >= 1 && n <= 5; }));
      if (stages.length !== method.expectedOperationCount) errors.push('ootk_operation_count_mismatch:' + stages.length + '/' + method.expectedOperationCount);
    }
    if (!(((contract||{}).question||{}).requestedDimensions||[]).length) warnings.push('question_dimensions_empty');
    return { ok:errors.length===0, errors:uniq(errors), warnings:uniq(warnings) };
  }

  function compactJson(x) { return JSON.stringify(x); }
  function renderEvidenceUnit(u, graph) {
    var nodeMap = Object.create(null); (graph.nodes||[]).forEach(function(n){nodeMap[n.id]=n;});
    var cards = (u.nodes||[]).map(function(id){ var n=nodeMap[id]; return n ? id+' '+n.position+'='+n.cardName+(n.direction?'('+n.direction+')':'') : id; });
    return u.id+'｜'+u.type+'｜'+u.label+(cards.length?'｜'+cards.join(' → '):'');
  }

  function renderPromptContract(contract) {
    if (!contract) return '';
    var q = contract.question, m = contract.method, g = contract.evidenceGraph, src = contract.sourceProfile;
    var L = [];
    L.push('────────────────────────────');
    L.push('◆ ROOT-SPEC v90｜機械編譯的問題—方法—證據契約');
    L.push('────────────────────────────');
    L.push('原問句：'+q.originalQuestion);
    L.push('需求維度：'+q.requestedDimensions.map(function(d){return d.label+(d.source?'〔'+d.source+'〕':'');}).join('、'));
    if (q.explicitScopes.length) L.push('原句明示範圍：'+q.explicitScopes.join('、'));
    L.push('問題保真：'+q.fidelityRule+' '+q.completionRule);
    L.push('方法：'+m.label+'〔'+m.id+'〕');
    L.push('牌義來源：'+src.label+'〔'+src.id+'〕；本次只准使用這一個來源設定。');
    L.push('來源邊界：'+src.reversalPolicy+'；'+src.imagePolicy+'。');
    L.push('觀測能力預檢：');
    contract.capabilityMatrix.forEach(function(r){L.push('・'+r.dimension+'＝'+r.precheckStatus+'（'+r.methodCapability+'）');});
    L.push('位置權限：');
    (g.nodes||[]).forEach(function(n){L.push('・'+n.id+' '+n.position+'｜'+n.authority+'｜'+n.authorityRule);});
    L.push('合法證據單位：');
    (g.evidenceUnits||[]).forEach(function(u){L.push('・'+renderEvidenceUnit(u,g));});
    L.push('合法合成：'+g.legalSynthesisRule);
    L.push('內部命題帳本：先依 claim schema 建立命題；每項命題必填 supportedDimensions、evidenceIds、counterEvidenceIds、assumptions、doesNotEstablish。帳本不輸出給客人。');
    L.push('裁決程序：'+contract.adjudication.steps.join(' → ')+'。');
    L.push('裁決上限：完整事件的結論強度不得高於最弱的必要語義成分；未量測維度只標示邊界，不得污染其他維度。');
    L.push('禁止推理：'+(g.forbiddenInference||[]).concat([contract.adjudication.noVoteRule]).join('；')+'。');
    L.push('最終輸出：'+contract.outputContract.firstSentence+' '+contract.outputContract.visibleEvidence+' '+contract.outputContract.length+' '+contract.outputContract.facts);
    return L.join('\n');
  }

  var TAROT_NAME_RE = /(?:愚者|魔術師|女祭司|皇后|皇帝|教皇|戀人|戰車|力量|隱者|命運之輪|正義|吊人|倒吊人|死神|節制|惡魔|高塔|塔|星星|月亮|太陽|審判|世界|(?:權杖|聖杯|寶劍|金幣|錢幣)(?:王牌|一|二|三|四|五|六|七|八|九|十|侍者|騎士|皇后|國王))/g;

  function validateAnswer(answer, contract) {
    var s = text(answer), graph = contract && contract.evidenceGraph || {}, allowed = Object.create(null), violations = [], warnings = [];
    (graph.nodes||[]).forEach(function(n){allowed[n.cardName]=1;});
    var mentioned = s.match(TAROT_NAME_RE) || [];
    uniq(mentioned).forEach(function(n){ if(!allowed[n] && !(n==='塔' && allowed['高塔'])) violations.push('引用本盤外牌名：'+n); });
    var caps = Object.create(null);
    (((contract||{}).capabilityMatrix)||[]).forEach(function(r){caps[r.dimensionId]=r.precheckStatus;});
    if (caps.exact_age === '未直接量測' && /(?:\d{1,3}|[一二三四五六七八九十兩]{1,3})\s*歲/.test(s)) violations.push('本方法未量測年齡，卻輸出具體歲數');
    if (caps.cardinality === '未直接量測' && /(?:\d+|[一二三四五六七八九十兩]+)\s*(?:個|位|人)(?:異性|對象|追求者|暗戀者|桃花|候選人)?/.test(s)) violations.push('本方法未量測人數，卻輸出具體人數');
    if (caps.probability === '未直接量測' && /\d+(?:\.\d+)?\s*%/.test(s)) violations.push('本方法未量測機率，卻輸出百分比');
    if (caps.money === '未直接量測' && /(?:NT\$|\$|新台幣)?\s*\d[\d,]*(?:元|萬|千)/.test(s)) violations.push('本方法未量測金額，卻輸出具體金額');
    if (caps.exact_date === '未直接量測' && /\d{4}年\d{1,2}月|\d{1,2}月\d{1,2}日|\d+\s*(?:天|週|個月)內/.test(s)) violations.push('本方法未量測精確時間，卻輸出具體日期或區間');
    if (/\d/.test(s)) warnings.push('輸出含阿拉伯數字，需逐一核對資料錨點');
    if (!s) violations.push('空白輸出');
    return {ok:violations.length===0,violations:uniq(violations),warnings:uniq(warnings),mentionedCards:uniq(mentioned)};
  }

  return {
    VERSION:VERSION,
    SCHEMA:SCHEMA,
    SOURCE_PROFILES:SOURCE_PROFILES,
    METHOD_SPECS:METHOD_SPECS,
    compileQuestion:compileQuestion,
    resolveSemanticProfile:resolveSemanticProfile,
    compileEvidenceGraph:compileEvidenceGraph,
    compileOOTKEvidence:compileOOTKEvidence,
    compileReadingSpec:compileReadingSpec,
    renderPromptContract:renderPromptContract,
    validateContract:validateContract,
    validateAnswer:validateAnswer,
    stripDirection:stripDirection
  };
});
