/*! tarot-semantic-engine.js — ROOT-SPEC v98 Foundation compiler
 * 單一乾淨架構：原句型別化 → 方法觀測模型 → 合法證據圖 →
 * 實體／事件共指 → 原子覆蓋裁決 → 語義飽和 → 反向稽核。
 *
 * 本檔不包含題材式答案規則，也不把任何牌義預先寫成結論。
 */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.JYTarotSemanticEngine = api;
})(typeof globalThis !== 'undefined' ? globalThis : (typeof window !== 'undefined' ? window : this), function () {
  'use strict';

  var Foundation = null;
  try {
    Foundation = (typeof globalThis !== 'undefined' && globalThis.JYTarotFoundation)
      ? globalThis.JYTarotFoundation
      : (typeof require === 'function' ? require('./tarot-foundation.js') : null);
  } catch (_foundationErr) { Foundation = null; }

  var VERSION = '98.0.0';
  var SCHEMA = 'jy.tarot.semantic-contract/6';

  function clone(value) {
    return value == null ? value : JSON.parse(JSON.stringify(value));
  }
  function text(value) {
    return value == null ? '' : String(value).trim();
  }
  function uniq(values) {
    var seen = Object.create(null);
    var out = [];
    (values || []).forEach(function (value) {
      var key = typeof value === 'string' ? value : JSON.stringify(value);
      if (!seen[key]) {
        seen[key] = true;
        out.push(value);
      }
    });
    return out;
  }
  function pad(number, width) {
    return String(number).padStart(width, '0');
  }
  function nodeId(index) {
    return 'N' + pad(index + 1, 2);
  }
  function unitId(index) {
    return 'E' + pad(index + 1, 3);
  }
  function stripDirection(name) {
    return text(name)
      .replace(/^[▲▼]\s*(?:正位|逆位)\s*/, '')
      .replace(/^(?:正位|逆位)\s*/, '')
      .trim();
  }
  function getDirection(card) {
    if (!card) return '';
    if (card.direction) return text(card.direction);
    if (card.isUp === true || card.isUp === false) return '元素尊貴裁決';
    return '';
  }
  function splitCandidates(value) {
    if (Array.isArray(value)) return uniq(value.map(text).filter(Boolean));
    return uniq(text(value).split(/[・、,，/／;；|｜]+/).map(text).filter(Boolean));
  }

  var SOURCE_PROFILES = {
    gd_book_t: {
      id: 'gd_book_t',
      label: 'Golden Dawn《Book T／Liber T》',
      reversalPolicy: '不套用 Waite 固定正逆位字典；一般牌陣由位置、有序連續線上的左右相鄰元素尊貴、卡巴拉位階與占星對應裁決；後世牌陣的因果連線只作互動，不自動視為 Book T 相鄰，Opening of the Key 依其程序裁決。',
      imagePolicy: '牌面圖像只作辨識與次級象徵；不得以 PCS 或 Thoth 圖像敘事覆寫 Book T 的結構與牌義。',
      forbiddenMixes: ['modern_rws', 'waite_1910', 'thoth_crowley', 'etteilla'],
      sourceContract: '所有牌陣與開鑰之法共用同一 Golden Dawn Book T 牌義核心；牌陣本身只是一種觀測拓撲，不冒充 Book T 原創。'
    }
  };

  var ROLE_AUTHORITY = {
    state: '描述本觀測通道的狀態；不自行建立未知人物或盤外事件。',
    antecedent: '只描述先前階段或既有影響；不能自動升格為根本原因。',
    development: '只描述後續發展傾向或下一階段；不能自動升格為最終結果。',
    cause: '只說明形成機制；不能單獨取代完整事件或結果。',
    obstacle: '只說明限制、延遲、扭曲或反證。',
    enabler: '只說明助力、催化或可用資源；不能單獨證明結果已成立。',
    interaction_force: '描述橫跨核心的作用；可為助力、阻力、催化、代價或混合作用，須由相連結構裁決。',
    advice: '只說明可介入點；不能用來證明預測事件已存在。',
    outcome: '說明本結構下的條件性收束；仍須由前段機制與角色鏈支撐。',
    bounded_outcome: '在原問句明示的期限終點，定性裁決完整事件或固定門檻的成立傾向；不得反推實際金額、差額、機率或額外日期。',
    person_known: '可描述原問句已明確指認的對象；仍不得越權推算未量測身分與數字。',
    person_aggregate: '只描述條件性或聚合角色作用；不證明人物存在、不等於一人、也不是人數上限。',
    environment: '描述外界條件或他人作用；未完成實體綁定時不得具名或計數。',
    comparison: '只在獨立、已綁定且同尺度的通道間判斷差異。',
    timeline: '描述相對先後、節奏與轉折；無時間錨不得換算日期。',
    domain: '描述生活領域；不自動枚舉該領域內的未知人物或事件。',
    structural: '描述結構層級、路徑或程序功能；不能單獨創造現實事實。',
    synthesis: '只綜合其依賴命題、指出主旋律或校正；不能自行創造人物、意圖、行為或結果。',
    stage: '只描述本次操作的階段作用；跨階段只能透過已完成的階段摘要承接。'
  };

  var BASE_MEASUREMENT = {
    event_or_state: 'qualitative_direct',
    existence: 'qualitative_inference',
    event_realization: 'qualitative_inference',
    degree: 'qualitative_inference',
    cause: 'when_channel_exists',
    trajectory: 'when_channel_exists',
    outcome: 'when_channel_exists',
    guidance: 'when_channel_exists',
    trend: 'qualitative_inference',
    stability: 'qualitative_inference',
    comparison: 'requires_independent_channels',
    relative_order: 'requires_independent_comparable_channels',
    threshold_crossing: 'qualitative_relational_event_if_query_bound',
    relational_event: 'qualitative_inference',
    exact_value: 'not_measured',
    numeric_range: 'not_measured',
    cardinality: 'not_measured',
    exact_age: 'not_measured',
    identity: 'not_measured',
    person_attribute: 'qualitative_or_unmeasured',
    exact_date: 'not_measured',
    probability: 'not_measured',
    time_scope: 'scope_constraint',
    modality: 'question_operator',
    description: 'qualitative_direct',
    annual_overview: 'domain_channels_required',
    multi_domain: 'domain_channels_required',
    timing: 'relative_timing_channel',
    location: 'qualitative_location_only'
  };

  function measurement(overrides) {
    var result = clone(BASE_MEASUREMENT);
    Object.keys(overrides || {}).forEach(function (key) {
      result[key] = overrides[key];
    });
    return result;
  }

  function observationModel(id) {
    var common = {
      queryScopePropagation: true,
      entityCreation: 'forbidden',
      entityResolution: 'query_explicit_or_unbound',
      eventResolution: 'claim_graph_required',
      sameEventJoin: 'explicit_join_trace_required',
      actorTargetJoin: 'explicit_role_binding_required',
      identityMeasurement: 'not_measured',
      cardinalityMeasurement: 'not_measured',
      exactValueMeasurement: 'not_measured',
      exactTimeMeasurement: 'not_measured',
      comparisonChannels: 0,
      temporalModel: 'relative_or_user_scope',
      synthesisModel: 'depends_on_claims_only'
    };
    var variants = {
      three_card: { temporalModel: 'ordered_or_structural_path' },
      five_card: { temporalModel: 'mechanism_to_outcome' },
      cross: { temporalModel: 'structural_axis' },
      either_or: {
        comparisonChannels: 2,
        entityResolution: 'branch_bound_by_question',
        eventResolution: 'parallel_branch_claim_graph'
      },
      relationship: {
        entityResolution: 'known_counterpart_or_aggregate',
        eventResolution: 'dyadic_claim_graph'
      },
      timeline: { temporalModel: 'ordered_relative_time' },
      celtic_cross: {
        temporalModel: 'relative_axis',
        eventResolution: 'nonlinear_dependency_claim_graph'
      },
      tree_of_life: { eventResolution: 'three_pillar_claim_graph' },
      zodiac: {
        eventResolution: 'domain_claim_graph',
        entityResolution: 'domain_does_not_create_entity'
      },
      minor_arcana: { eventResolution: 'directed_dependency_claim_graph' },
      fifteen_card: {
        comparisonChannels: 2,
        eventResolution: 'triad_claim_graph'
      },
      mathers_21: {
        eventResolution: 'rows_pairs_claim_graph',
        entityResolution: 'court_or_query_binding_must_be_proved'
      },
      mathers_horseshoe: {
        eventResolution: 'group_claim_graph',
        entityResolution: 'court_or_query_binding_must_be_proved'
      },
      horseshoe: { eventResolution: 'arc_claim_graph' },
      ootk: {
        eventResolution: 'five_stage_query_event_graph',
        entityResolution: 'significator_anchors_querent_not_unknown_actors',
        temporalModel: 'op4_explicit_anchor_only',
        synthesisModel: 'stage_summaries_only'
      }
    };
    return Object.assign(common, clone(variants[id] || {}));
  }

  function makeSpec(id, label, sourceProfile, roles, operators, measurementOverrides, topology, notes) {
    sourceProfile = 'gd_book_t';
    return {
      id: id,
      label: label,
      sourceProfile: sourceProfile,
      allowedSourceProfiles: ['gd_book_t'],
      layoutSource: id === 'ootk'
        ? 'Golden Dawn《Book T／Liber T》程序'
        : (/^mathers_/.test(id)
          ? 'Mathers 歷史布局；牌義與尊貴仍鎖定 Book T'
          : '後世觀測布局；不得冒充 Book T 原創'),
      roles: roles.slice(),
      expectedCardCount: id === 'ootk' ? null : roles.length,
      expectedOperationCount: id === 'ootk' ? 5 : null,
      operators: operators.slice(),
      measurement: measurement(measurementOverrides),
      topology: clone(topology),
      observationModel: observationModel(id),
      notes: (notes || []).slice()
    };
  }

  var METHOD_SPECS = {
    three_card: makeSpec(
      'three_card', '三牌陣', 'gd_book_t',
      ['state', 'state', 'outcome'],
      ['atomic_node', 'adjacent_segment', 'whole_ordered_path'],
      { trajectory: 'direct_channel', outcome: 'direct_channel' },
      { kind: 'ordered_path', independentComparableChannels: 0 },
      ['位置數不等於人物數、事件數或固定時間單位。']
    ),
    five_card: makeSpec(
      'five_card', '五牌陣', 'gd_book_t',
      ['state', 'cause', 'obstacle', 'advice', 'outcome'],
      ['atomic_node', 'declared_mechanism', 'full_event_chain'],
      { cause: 'direct_channel', trajectory: 'qualitative_inference', outcome: 'direct_channel', guidance: 'direct_channel' },
      { kind: 'directed_event_graph', independentComparableChannels: 0 },
      ['結果須由現況、原因、阻礙與介入點共同限定。']
    ),
    cross: makeSpec(
      'cross', '十字牌陣', 'gd_book_t',
      ['state', 'interaction_force', 'cause', 'outcome', 'advice'],
      ['atomic_node', 'core_cross', 'development_axis', 'intervention_link'],
      { cause: 'direct_channel', trajectory: 'direct_channel', guidance: 'direct_channel' },
      { kind: 'cross_with_axis', independentComparableChannels: 0 },
      ['交叉力量不預設為負面，須與核心共同裁決。']
    ),
    either_or: makeSpec(
      'either_or', '二選一牌陣', 'gd_book_t',
      ['state', 'comparison', 'comparison', 'outcome', 'outcome'],
      ['atomic_node', 'branch_A', 'branch_B', 'branch_comparison'],
      {
        comparison: 'direct_comparison_channel',
        relative_order: 'direct_comparison_channel',
        threshold_crossing: 'qualitative_comparison_if_bound',
        trajectory: 'direct_channel',
        outcome: 'direct_channel'
      },
      { kind: 'independent_branches', independentComparableChannels: 2, channelLabels: ['A', 'B'] },
      ['兩路必須各自成句後，才可在同一尺度下比較。']
    ),
    relationship: makeSpec(
      'relationship', '關係牌陣', 'gd_book_t',
      ['state', 'person_aggregate', 'state', 'obstacle', 'advice', 'outcome'],
      ['atomic_node', 'self_other_contrast', 'relationship_mechanism', 'obstacle_link', 'intervention_chain', 'outcome_dependency_graph'],
      {
        comparison: 'qualitative_contrast_only',
        relative_order: 'not_measured',
        threshold_crossing: 'not_measured',
        trajectory: 'direct_channel',
        outcome: 'direct_channel',
        guidance: 'direct_channel',
        cardinality: 'not_measured',
        identity: 'not_measured',
        exact_age: 'not_measured'
      },
      { kind: 'dyadic_relation_network', independentComparableChannels: 0 },
      ['已知對象可綁定；未知對象只能描述聚合作用，不反向證明有人存在。']
    ),
    timeline: makeSpec(
      'timeline', '時間線牌陣', 'gd_book_t',
      ['cause', 'timeline', 'timeline', 'timeline', 'outcome'],
      ['atomic_node', 'ordered_timeline', 'trigger_chain'],
      { cause: 'direct_channel', trajectory: 'direct_channel', outcome: 'direct_channel', exact_date: 'anchor_required' },
      { kind: 'ordered_timeline', independentComparableChannels: 0 },
      ['直接觀察相對順序與節奏；日期必須另有明示錨點。']
    ),
    celtic_cross: makeSpec(
      'celtic_cross', '凱爾特十字', 'gd_book_t',
      ['state', 'interaction_force', 'structural', 'cause', 'timeline', 'timeline', 'state', 'environment', 'state', 'outcome'],
      ['atomic_node', 'core_cross', 'vertical_axis', 'time_axis', 'self_environment_axis', 'expectation_outcome_axis', 'dependency_network'],
      {
        cause: 'direct_channel',
        trajectory: 'direct_channel',
        outcome: 'direct_channel',
        guidance: 'qualitative_inference',
        comparison: 'requires_independent_channels',
        relative_order: 'requires_independent_comparable_channels',
        threshold_crossing: 'qualitative_relational_event_if_query_bound'
      },
      { kind: 'nonlinear_dependency_network', independentComparableChannels: 0 },
      ['第九位是希望／恐懼，不是結果。', '完整牌陣是多軸依賴圖，不是十張線性時間線。']
    ),
    tree_of_life: makeSpec(
      'tree_of_life', '生命之樹', 'gd_book_t',
      ['structural', 'structural', 'structural', 'structural', 'structural', 'state', 'state', 'state', 'state', 'outcome'],
      ['atomic_node', 'mercy_pillar', 'severity_pillar', 'middle_pillar', 'pillar_dependency_network'],
      { cause: 'qualitative_inference', trajectory: 'qualitative_inference', outcome: 'direct_channel' },
      { kind: 'three_pillar_network', independentComparableChannels: 0 },
      ['質點是作用層級，不是現實數量或固定時間。']
    ),
    zodiac: makeSpec(
      'zodiac', '黃道十二宮牌陣', 'gd_book_t',
      ['domain', 'domain', 'domain', 'domain', 'domain', 'domain', 'domain', 'domain', 'domain', 'domain', 'domain', 'domain', 'synthesis'],
      ['atomic_node', 'house_axis', 'domain_dependency_network', 'domain_synthesis'],
      { state: 'direct_channel', trajectory: 'qualitative_inference', outcome: 'qualitative_inference_only_if_supported' },
      { kind: 'domain_network', independentComparableChannels: 0 },
      ['十二宮分隔生活領域，不枚舉未知人物。', '第十三張只作全盤綜合／指引，不自動成為結果位。']
    ),
    minor_arcana: makeSpec(
      'minor_arcana', '小阿卡那專題牌陣', 'gd_book_t',
      ['state', 'cause', 'obstacle', 'environment', 'state', 'advice', 'outcome'],
      ['atomic_node', 'mechanism_chain', 'resource_intervention', 'outcome_dependency_graph'],
      { cause: 'direct_channel', guidance: 'direct_channel', outcome: 'direct_channel' },
      { kind: 'directed_event_graph', independentComparableChannels: 0 },
      ['人物通道未綁定時仍是環境作用，不代表具體一人。']
    ),
    fifteen_card: makeSpec(
      'fifteen_card', '十五張英式牌陣', 'gd_book_t',
      ['state', 'state', 'state', 'timeline', 'timeline', 'state', 'structural', 'timeline', 'timeline', 'state', 'structural', 'timeline', 'timeline', 'state', 'structural'],
      ['atomic_node', 'triad_core', 'triad_natural', 'triad_alternative', 'triad_decision', 'triad_fate', 'triad_comparison'],
      {
        cause: 'qualitative_inference',
        comparison: 'direct_comparison_channel',
        relative_order: 'direct_comparison_channel',
        threshold_crossing: 'qualitative_comparison_if_bound',
        trajectory: 'direct_channel',
        outcome: 'qualitative_inference'
      },
      { kind: 'five_triad_network', independentComparableChannels: 2, channelLabels: ['natural', 'alternative'] },
      ['五個三牌組各自成句後才能比較，不跨組任意拼牌。']
    ),
    mathers_21: makeSpec(
      'mathers_21', 'Mathers 1888 第二法', 'gd_book_t',
      new Array(21).fill('structural'),
      ['atomic_node', 'ordered_row', 'declared_outer_pair', 'center_card', 'row_dependency_network'],
      { state: 'qualitative_inference', cause: 'qualitative_inference', trajectory: 'qualitative_inference', outcome: 'qualitative_inference' },
      { kind: 'rows_and_pairs', independentComparableChannels: 0 },
      ['三排從右往左各自成句，再讀指定首尾配對與中心牌。']
    ),
    mathers_horseshoe: makeSpec(
      'mathers_horseshoe', 'Mathers 1888 第一法完整 Horseshoe', 'gd_book_t',
      new Array(54).fill('structural'),
      ['atomic_node', 'ordered_group', 'contiguous_segment', 'declared_outer_pair', 'center_card', 'group_claim_synthesis', 'cross_group_synthesis'],
      { state: 'qualitative_inference', cause: 'qualitative_inference', trajectory: 'qualitative_inference', outcome: 'qualitative_inference', exact_age: 'not_measured', cardinality: 'not_measured' },
      { kind: 'three_evidence_groups', independentComparableChannels: 0 },
      ['只讀 A=26、C=17、E=11；F組不進入解讀。', '跨組只綜合各組已成立命題。']
    ),
    horseshoe: makeSpec(
      'horseshoe', '七張馬蹄形牌陣', 'gd_book_t',
      ['cause', 'state', 'state', 'advice', 'environment', 'obstacle', 'outcome'],
      ['atomic_node', 'ordered_arc', 'environment_obstacle_link', 'intervention_outcome_chain'],
      { cause: 'direct_channel', trajectory: 'qualitative_inference', outcome: 'direct_channel', guidance: 'direct_channel' },
      { kind: 'ordered_arc_with_links', independentComparableChannels: 0 },
      ['他人／環境通道未綁定時不得反向創造人物。']
    ),
    ootk: makeSpec(
      'ootk', 'Opening of the Key 五次操作', 'gd_book_t',
      ['stage', 'stage', 'stage', 'stage', 'stage'],
      ['operation_landing', 'operation_counting_path', 'operation_pair', 'operation_dignity_context', 'operation_validity', 'operation_stage_summary', 'op4_ring_structure', 'cross_operation_stage_network'],
      { state: 'direct_channel', cause: 'qualitative_inference', trajectory: 'direct_channel', outcome: 'direct_channel', exact_date: 'not_measured', cardinality: 'not_measured', exact_age: 'not_measured', identity: 'not_measured' },
      { kind: 'five_stage_procedure', independentComparableChannels: 0 },
      ['五次操作是同一 QUERY_EVENT 的階段程序，不得跨操作直接拼牌。']
    )
  };

  function applyFoundationMethods() {
    if (!Foundation || !Foundation.METHODS) return;
    Object.keys(METHOD_SPECS).forEach(function (id) {
      var source = Foundation.METHODS[id];
      var target = METHOD_SPECS[id];
      if (!source || !target) return;
      target.label = source.label || target.label;
      target.layoutSource = source.layoutSource || target.layoutSource;
      target.expectedCardCount = source.count == null ? target.expectedCardCount : source.count;
      target.roles = (source.slots || []).map(function (slot) { return slot.authority || 'structural'; });
      target.provides = clone(source.provides || []);
      target.specialties = clone(source.specialties || []);
      target.topology.registryId = id;
      target.topology.dignityLines = clone(source.dignityLines || []);
      target.topology.dependencyGroups = clone(source.dependencies || []);
      target.topology.compatibilityEdges = clone(source.compatibilityEdges || []);
      target.topology.independentComparableChannels = target.provides.indexOf('comparison_outcome') >= 0 ? 2 : 0;
      target.observationModel.foundationVersion = Foundation.VERSION;
      target.observationModel.comparisonChannels = target.topology.independentComparableChannels;
    });
  }
  applyFoundationMethods();

  function inferExplicitCounterpartBinding(question) {
    var q = text(question);
    if (!q) return false;

    // 明示排除或未知存在問句，不可因出現某關係詞就誤判為已知對象。
    if (/(?:非|不是|不屬於)\s*[^，。！？?]{1,12}/.test(q)) return false;
    if (/(?:除了|排除)[^，。！？?]{1,20}(?:以外|之外)/.test(q)) return false;
    if (/(?:有人|某人|哪個人|誰|異性|對象|追求者|暗戀者|未來人物)/.test(q) && !/(?:這個人|該人|對方|他|她|現任|前任|伴侶|配偶|同事[甲乙丙A-Z]?|朋友[甲乙丙A-Z]?)/.test(q)) return false;

    return /(?:我\s*(?:和|與|跟)\s*(?:現任|前任|伴侶|配偶|對方|他|她|這個人|該人|某位已指明[^，。！？?]{0,8})|(?:現任|前任|伴侶|配偶|對方|他|她|這個人|該人)\s*(?:對我|跟我|和我|與我)|關於\s*(?:他|她|對方|這個人|該人))/.test(q);
  }

  function detectScopes(question) {
    var q = text(question);
    var found = q.match(/(?:今年|明年|去年|本月|下個月|這個月|本週|下週|今天|明天|後天|近期|短期|長期|未來|過去|目前|現在|\d{4}\s*年|\d{1,2}\s*月(?:到|至|－|-)\s*\d{1,2}\s*月|\d+\s*(?:天|週|個月|年)(?:內|後|前)?)/g) || [];
    return uniq(found.map(function (surface, index) {
      return { id: 'S' + pad(index + 1, 2), surface: surface, source: surface, type: 'time_or_scope' };
    }));
  }

  function cleanRelationOperand(value, scopes) {
    var out = text(value);
    (scopes || []).forEach(function (scope) { out = out.replace(scope.surface, ''); });
    out = out.replace(/(?:將會|可能會|會不會|能不能|可不可以|是否|可以|能夠|能|會|未來|之後|最終)+\s*$/g, '');
    out = out.replace(/^[，,、\s]+|[，,、\s]+$/g, '');
    return out;
  }
  function normalizeThresholdRelation(relation, scopes) {
    if (!relation || relation.type !== 'fixed_numeric_threshold') return relation;
    var left = cleanRelationOperand(relation.left, scopes);
    var right = cleanRelationOperand(relation.right, scopes);
    // Remove a trailing success/modal phrase when the actual same-scale attribute
    // is supplied by the opposite operand (e.g.「副業能成功超過正職收入」).
    left = left.replace(/(?:可以|能夠|能|會)?成功\s*$/g, '');
    right = right.replace(/(?:可以|能夠|能|會)?成功\s*$/g, '');
    var scale = 'model_resolve_same_scale';
    var leftEntity = left, rightEntity = right;
    var scalePattern = /^(.+?)(?:的)?(收入|薪水|營收|獲利|成本|價格|金額|數量|人數|成績|表現|速度|高度|重量|價值|程度)$/;
    var rightScale = right.match(scalePattern);
    var leftScale = left.match(scalePattern);
    if (rightScale) { rightEntity=text(rightScale[1]); scale=text(rightScale[2]); }
    if (leftScale) { leftEntity=text(leftScale[1]); scale=text(leftScale[2]); }
    // Canonical relation surfaces make synonymous threshold questions comparable.
    function canonical(entity, metric) {
      entity=text(entity);
      if (!metric || metric==='model_resolve_same_scale') return entity;
      if (/^我(?!的)/.test(entity)) entity='我的'+entity.slice(1);
      return entity + metric;
    }
    if (scale !== 'model_resolve_same_scale') {
      left = canonical(leftEntity, scale);
      right = canonical(rightEntity, scale);
    }
    relation.left = left;
    relation.right = right;
    relation.leftEntity = leftEntity;
    relation.rightEntity = rightEntity;
    relation.scale = scale;
    relation.queryMode = 'single_relational_proposition';
    return relation;
  }

  function detectRelations(question) {
    var q = text(question);
    var relationScopes = detectScopes(q);
    var relations = [];
    var match;

    var patterns = [
      { re: /(.{1,30}?)\s*(超過|高於|大於|多於)\s*(.{1,30}?)(?:嗎|呢|？|\?|$)/, op: 'gt' },
      { re: /(.{1,30}?)\s*(低於|小於|少於|不及)\s*(.{1,30}?)(?:嗎|呢|？|\?|$)/, op: 'lt' },
      { re: /(.{1,30}?)\s*(等於|相同於|一樣多|持平)\s*(.{1,30}?)(?:嗎|呢|？|\?|$)/, op: 'eq' },
      { re: /(.{1,20}?)\s*比\s*(.{1,20}?)\s*(更|較)(.{1,12}?)(?:嗎|呢|？|\?|$)/, op: 'comparative' }
    ];
    patterns.some(function (pattern) {
      match = q.match(pattern.re);
      if (!match) return false;
      if (pattern.op === 'comparative') {
        relations.push({
          id: 'R01',
          type: 'comparison',
          operator: 'comparative',
          operatorText: match[3] + match[4],
          left: text(match[1]),
          right: text(match[2]),
          scale: text(match[4]),
          threshold: null,
          source: match[0]
        });
      } else {
        relations.push({
          id: 'R01',
          type: 'threshold_or_order',
          operator: pattern.op,
          operatorText: match[2],
          left: text(match[1]),
          right: text(match[3]),
          scale: 'model_resolve_same_scale',
          threshold: match[2],
          source: match[0]
        });
      }
      return true;
    });

    if (!relations.length) {
      match = q.match(/(.{1,20}?)\s*(?:還是|或是|或者)\s*(.{1,20}?)(?:比較|較|更)?(?:好|適合|有利|可行|嗎|呢|？|\?|$)/);
      if (match) {
        relations.push({
          id: 'R01',
          type: 'alternative_comparison',
          operator: 'choose',
          operatorText: '還是',
          left: text(match[1]),
          right: text(match[2]),
          scale: 'model_resolve',
          threshold: null,
          source: match[0]
        });
      }
    }
    return relations.map(function (relation) { return normalizeThresholdRelation(relation, relationScopes); });
  }

  function extractConstraints(question, scopes, relations) {
    var q = text(question);
    var constraints = [];
    var index = 0;
    function add(type, value, source, attachTo) {
      value = text(value);
      source = text(source || value);
      if (!value) return;
      var key = type + '|' + value + '|' + source;
      if (constraints.some(function (item) { return item._key === key; })) return;
      constraints.push({
        id: 'C' + pad(++index, 2),
        type: type,
        text: value,
        source: source,
        essential: true,
        attachTo: attachTo || 'QUERY_EVENT',
        _key: key
      });
    }

    (scopes || []).forEach(function (scope) {
      add('scope', scope.surface, scope.source, 'QUERY_EVENT.timeScope');
    });
    (relations || []).forEach(function (relation) {
      add('relation', relation.source, relation.source, 'QUERY_EVENT.relation');
    });

    var patterns = [
      /除了([^，。！？?]{1,30}?)(?:以外|之外)/g,
      /排除([^，。！？?]{1,30}?)(?:以外|之外)?/g,
      /(?:非|不是|不屬於)\s*([^的，。！？?]{1,20})/g,
      /([^，。！？?]{1,20}?)(?:以外|之外)(?:的)?/g
    ];
    patterns.forEach(function (re) {
      var match;
      while ((match = re.exec(q))) {
        add('exclusion', text(match[1]), text(match[0]), 'QUERY_EVENT.actor_or_target');
      }
    });

    var quantifierMatches = q.match(/(?:至少|至多|最多|最少|全部|任何|每一個|每個|所有|唯一|只有|多個|數個|幾個|幾位|多少)/g) || [];
    quantifierMatches.forEach(function (item) {
      add('quantifier', item, item, 'model_resolve');
    });

    var negationMatches = q.match(/(?:不會|不能|沒有|未曾|尚未|不要|不再|不是|不成立)/g) || [];
    negationMatches.forEach(function (item) {
      add('polarity', item, item, 'model_resolve');
    });

    var modalityMatches = q.match(/(?:會不會|能不能|可不可以|是否|有沒有|可能|應該|一定|必然|傾向|會|能)/g) || [];
    modalityMatches.slice(0, 3).forEach(function (item) {
      add('modality', item, item, 'QUERY_EVENT.modality');
    });

    return constraints.map(function (item) {
      delete item._key;
      return item;
    });
  }

  function requestedDimensions(question, scopes, relations) {
    var q = text(question);
    var dimensions = [
      { id: 'event_or_state', label: '核心事件／狀態', source: q }
    ];
    function add(id, label, source) {
      if (!dimensions.some(function (item) { return item.id === id; })) {
        dimensions.push({ id: id, label: label, source: source || q });
      }
    }

    if (/(?:嗎|呢|是否|有沒有|會不會|能不能|可不可以|是不是)[？?]?\s*$/.test(q) || /(?:是否|有沒有|會不會|能不能|可不可以)/.test(q) || /(?:有|會|能|可以|可能)[^，。！？?]{0,30}(?:嗎|呢|？|\?)/.test(q)) {
      add('existence', '存在／成立與否');
      add('modality', '可能性／能力模態');
    }
    if ((relations || []).length) {
      if (relations[0].type === 'threshold_or_order') {
        add('relational_event', '比較命題本身是否成立', relations[0].source);
        add('threshold_crossing', '門檻跨越', relations[0].source);
      } else {
        add('comparison', '比較關係', relations[0].source);
        add('relative_order', '相對排序', relations[0].source);
      }
    }
    if (/(?:幾個|幾位|多少(?:人|個|位|次)|人數|數量)/.test(q)) add('cardinality', '現實數量');
    if (/(?:幾歲|年齡)/.test(q)) {
      add('exact_age', '精確年齡');
      add('person_attribute', '人物屬性');
    }
    if (/(?:多少錢|多少(?:薪水|收入|成本|獲利|營收)|(?:薪水|收入|成本|獲利|營收)(?:是多少|有多少|多少|金額)|具體(?:金額|數字|數值)|金額|價位|百分比|幾成|機率)/.test(q)) add('exact_value', '精確數值／金額');
    if (/(?:誰|哪位|哪一個人|姓名|名字|身分|是什麼人)/.test(q)) add('identity', '人物身分');
    if (/(?:為什麼|為何|原因|根源|怎麼會)/.test(q)) add('cause', '原因／機制');
    if (/(?:怎麼做|怎麼辦|如何改善|建議|策略|方法|該怎麼)/.test(q)) add('guidance', '方法／建議');
    if (/(?:成長|增加|上升|提升|改善|變多|擴大|下降|減少|衰退|惡化|變少|縮小)/.test(q)) add('trend', '增減／變化趨勢');
    if (/(?:未來|走向|結果|發展|最後|結局|之後|會變成)/.test(q)) add('trajectory', '發展／結果');
    if (/(?:穩定|長久|持續|短暫|維持)/.test(q)) add('stability', '穩定度');
    if ((scopes || []).length) add('time_scope', '使用者明示期限／範圍', scopes.map(function (s) { return s.surface; }).join('、'));

    return dimensions;
  }

  function normalizeQuerentOwnedOperand(value) {
    var raw = text(value);
    var match = raw.match(/^我(?:的)?(.+)$/);
    if (match && text(match[1])) {
      return { surface:text(match[1]), ownedBy:'QUERENT', source:raw };
    }
    return { surface:raw, ownedBy:null, source:raw };
  }

  function compileQuestion(question, options) {
    if (Foundation && typeof Foundation.compileQuestion === 'function') {
      return Foundation.compileQuestion(question, options || {});
    }
    var q = text(question) || '（未提供明確問題）';
    return {
      originalQuestion:q, normalizedQuestion:q, requestedDimensions:[{id:'event_or_state',label:'核心事件／狀態',source:q}],
      explicitScopes:[], relations:[], knownCounterpart:false, features:{},
      queryGraph:{schema:'typed_query_graph/3',events:[{id:'QUERY_EVENT',type:'qualitative_state_query',surface:q,predicate:'describe_state',roles:{actor:'QUERENT',target:'TARGET_STATE'}}],entities:[{id:'QUERENT',type:'querent',source:'問卜者'}],relations:[],constraints:[],requiredAtoms:[{id:'A01',kind:'actor',text:'問卜者本人',source:'語境預設問卜者',essential:true,eventId:'QUERY_EVENT',role:'actor',implicit:true},{id:'A02',kind:'state_target',text:q,source:q,essential:true,eventId:'QUERY_EVENT',role:'target'}],roundTripReconstruction:q,compilerStatus:'fallback_atomized',validation:{roundTripCompatible:true,everyDeletionChangesTruthConditions:true,noAddedPremise:true},atomizationRequirement:'每個會改變真值條件的語義角色必須獨立成為 essential atom。'}
    };
  }

  function resolveSemanticProfile(spreadId, options) {
    return 'gd_book_t';
  }

  function positionLabel(card, index) {
    return text(card && (card.position || card.positionName || card.slot || card.label)) || ('位置' + (index + 1));
  }

  function nodeBindingPolicy(authority) {
    var policy = {
      entityBinding: 'UNBOUND_OR_QUERY_EXPLICIT',
      eventBinding: 'QUERY_EVENT_OR_SUBEVENT_WITH_TRACE',
      eventRoles: ['state_or作用'],
      cannotEstablish: ['new_entity', 'new_event', 'identity', 'cardinality', 'exact_age', 'exact_value', 'exact_date'],
      requires: ['eventId', 'entityBindings', 'roleBindings', 'scope', 'joinTrace']
    };
    if (authority === 'person_known') {
      policy.entityBinding = 'QUERY_EXPLICIT_COUNTERPART';
      policy.eventRoles = ['actor', 'target', 'state'];
      policy.cannotEstablish = ['new_entity', 'identity_beyond_query', 'cardinality', 'exact_age'];
    } else if (authority === 'person_aggregate') {
      policy.entityBinding = 'AGGREGATE_UNBOUND_COUNTERPART';
      policy.eventRoles = ['conditional_actor作用', 'environment'];
    } else if (authority === 'antecedent') {
      policy.eventRoles = ['prior_stage', 'antecedent_influence'];
      policy.cannotEstablish.push('root_cause');
    } else if (authority === 'development') {
      policy.eventRoles = ['future_tendency', 'next_stage'];
      policy.cannotEstablish.push('terminal_result');
    } else if (authority === 'cause') {
      policy.eventRoles = ['cause', 'mechanism'];
    } else if (authority === 'enabler') {
      policy.eventRoles = ['support', 'catalyst', 'available_resource'];
      policy.cannotEstablish.push('result');
    } else if (authority === 'obstacle' || authority === 'interaction_force') {
      policy.eventRoles = ['constraint', 'counterevidence', 'catalyst'];
    } else if (authority === 'advice') {
      policy.eventRoles = ['intervention'];
      policy.cannotEstablish.push('event_exists');
    } else if (authority === 'outcome') {
      policy.eventRoles = ['conditional_result', 'terminal_tendency'];
    } else if (authority === 'bounded_outcome') {
      policy.eventRoles = ['bounded_result', 'threshold_result'];
      policy.cannotEstablish.push('actual_numeric_value', 'difference_amount', 'probability');
    } else if (authority === 'timeline') {
      policy.eventRoles = ['stage', 'transition'];
    } else if (authority === 'environment' || authority === 'domain') {
      policy.eventRoles = ['environment', 'domain_condition'];
    } else if (authority === 'comparison') {
      policy.eventRoles = ['branch_state', 'comparison_feature'];
    } else if (authority === 'synthesis') {
      policy.entityBinding = 'NONE';
      policy.eventBinding = 'DEPENDS_ON_CLAIMS_ONLY';
      policy.eventRoles = ['synthesis'];
      policy.cannotEstablish = ['new_entity', 'new_event', 'actor', 'intent', 'speech_act', 'result'];
    } else if (authority === 'stage') {
      policy.entityBinding = 'SIGNIFICATOR_OR_QUERY_EXPLICIT';
      policy.eventBinding = 'QUERY_EVENT_STAGE_ONLY';
      policy.eventRoles = ['stage_state', 'stage_transition'];
    } else if (authority === 'structural') {
      policy.eventRoles = ['structural作用'];
    }
    return policy;
  }

  function normalizeCards(cards, spec, options) {
    var opts = options || {};
    var known = opts.knownCounterpart === true;
    return (cards || []).map(function (card, index) {
      var authority = spec.roles[index] || 'structural';
      if (spec.id === 'relationship' && index === 1) authority = known ? 'person_known' : 'person_aggregate';
      var candidates = splitCandidates(
        card && (card.semanticCandidates || card.candidateMeanings || card.keywords || card.keyword || card.title)
      );
      var sourceGloss = text(card && (card.sourceGloss || card.baseMeaning || card.meaning || card.description));
      return {
        id: nodeId(index),
        index: index,
        position: positionLabel(card, index),
        authority: authority,
        authorityRule: ROLE_AUTHORITY[authority] || ROLE_AUTHORITY.structural,
        bindingPolicy: nodeBindingPolicy(authority),
        cardName: stripDirection(card && (card.cardName || card.name || card.title || ('牌' + (index + 1)))),
        direction: getDirection(card),
        semanticCandidates: candidates,
        sourceGloss: sourceGloss,
        raw: clone(card || {})
      };
    });
  }

  function makeUnitFactory(nodes) {
    var units = [];
    function nodeRefs(indices) {
      return (indices || []).map(function (index) { return nodes[index] && nodes[index].id; }).filter(Boolean);
    }
    function add(type, label, indices, options) {
      var opts = options || {};
      var directNodes = Array.isArray(opts.nodes) ? opts.nodes.slice() : nodeRefs(indices);
      var unit = {
        id: unitId(units.length),
        type: type,
        label: label,
        topology: opts.topology || type,
        nodes: directNodes,
        dependsOn: (opts.dependsOn || []).slice(),
        claimPolicy: opts.claimPolicy || (directNodes.length ? 'direct_interpretation' : 'synthesis_only'),
        eventBinding: opts.eventBinding || 'QUERY_EVENT_OR_SUBEVENT_WITH_TRACE',
        stage: opts.stage || null,
        stageFunction: opts.stageFunction || null,
        metadata: clone(opts.metadata || {})
      };
      unit.joinPolicy = {
        eventJoin: opts.eventJoin || (unit.claimPolicy === 'synthesis_only'
          ? 'claims_only_from_dependsOn'
          : 'same_event_only_with_explicit_joinTrace'),
        entityJoin: opts.entityJoin || 'same_entity_only_with_explicit_binding',
        roleJoin: opts.roleJoin || 'role_compatibility_required',
        scopeJoin: opts.scopeJoin || 'scope_overlap_or_explicit_transition_required',
        polarityJoin: opts.polarityJoin || 'contradictions_preserved_not_erased',
        synthesisJoin: opts.synthesisJoin || (unit.claimPolicy === 'synthesis_only'
          ? 'dependsOn_claims_only_no_direct_card_sequence'
          : 'local_nodes_only'),
        forbidden: uniq((opts.forbidden || []).concat([
          'topic_similarity_is_not_coreference',
          'same_domain_is_not_same_actor',
          'same_suit_is_not_same_event'
        ]))
      };
      units.push(unit);
      return unit.id;
    }
    return { units: units, add: add };
  }

  function addAtomicUnits(factory, nodes) {
    nodes.forEach(function (node, index) {
      factory.add('atomic_node', node.position + '：' + node.cardName, [index], {
        topology: 'node',
        roleJoin: 'single_node_role_only'
      });
    });
  }

  function range(start, end) {
    var out = [];
    for (var i = start; i < end; i += 1) out.push(i);
    return out;
  }

  function compileEvidenceGraph(spreadId, cards, options) {
    var id = METHOD_SPECS[spreadId] ? spreadId : 'three_card';
    if (id === 'ootk') return compileOOTKEvidence((options || {}).ootkData || options || {});
    var opts = options || {};
    var spec = clone(METHOD_SPECS[id]);
    var methodPlan = opts.methodPlan || null;
    if (methodPlan && Array.isArray(methodPlan.slots)) {
      spec.roles = methodPlan.slots.map(function (slot) { return slot.authority || 'structural'; });
      spec.slotBindings = clone(methodPlan.slotBindings || []);
      spec.expectedCardCount = methodPlan.count == null ? spec.expectedCardCount : methodPlan.count;
    }
    var questionSpec = opts.questionSpec || null;
    var known = typeof opts.knownCounterpart === 'boolean'
      ? opts.knownCounterpart
      : !!(questionSpec && questionSpec.knownCounterpart);
    var nodes = normalizeCards(cards, spec, { knownCounterpart: known });
    var factory = makeUnitFactory(nodes);
    addAtomicUnits(factory, nodes);

    var atomicIds = factory.units.map(function (unit) { return unit.id; });
    var compositeIds = [];

    function direct(type, label, indices, extra) {
      return factory.add(type, label, indices, extra || {});
    }
    function synthesis(type, label, dependsOn, extra) {
      var opts2 = Object.assign({}, extra || {}, {
        nodes: [],
        dependsOn: dependsOn,
        claimPolicy: 'synthesis_only',
        eventJoin: 'claims_only_from_dependsOn',
        synthesisJoin: 'dependsOn_claims_only_no_direct_card_sequence'
      });
      var result = factory.add(type, label, [], opts2);
      compositeIds.push(result);
      return result;
    }

    if (id === 'three_card') {
      var t1 = direct('adjacent_segment', '相鄰段 1→2', [0, 1], { topology: 'ordered_edge' });
      var t2 = direct('adjacent_segment', '相鄰段 2→3', [1, 2], { topology: 'ordered_edge' });
      synthesis('whole_ordered_path', '三張完整路徑', [t1, t2].concat(atomicIds));
    } else if (id === 'five_card') {
      var f1 = direct('cause_to_state', '原因→現況', [1, 0], { topology: 'directed_edge' });
      var f2 = direct('obstacle_to_state', '阻礙↔現況', [2, 0], { topology: 'interaction_edge' });
      var f3 = direct('advice_to_obstacle', '介入→阻礙', [3, 2], { topology: 'intervention_edge' });
      var f4 = direct('outcome_dependency', '結果依賴', [0, 2, 3, 4], { topology: 'dependency_set' });
      synthesis('full_event_chain', '五牌事件依賴網', [f1, f2, f3, f4]);
    } else if (id === 'cross') {
      var c1 = direct('core_cross', '核心與交叉力量', [0, 1], { topology: 'cross' });
      var c2 = direct('development_axis', '過去影響→核心→後續趨勢', [2, 0, 3], { topology: 'directed_axis' });
      var c3 = direct('intervention_link', '建議→核心／交叉', [4, 0, 1], { topology: 'intervention_link' });
      synthesis('cross_dependency_network', '十字完整網絡', [c1, c2, c3]);
    } else if (id === 'either_or') {
      var a = direct('branch_A', 'A 路徑', [0, 1, 3], {
        topology: 'independent_branch',
        eventBinding: 'BRANCH_A_EVENT',
        entityJoin: 'branch_A_entities_only'
      });
      var b = direct('branch_B', 'B 路徑', [0, 2, 4], {
        topology: 'independent_branch',
        eventBinding: 'BRANCH_B_EVENT',
        entityJoin: 'branch_B_entities_only'
      });
      synthesis('branch_comparison', '兩路同尺度比較', [a, b], {
        eventBinding: 'QUERY_COMPARISON_EVENT',
        roleJoin: 'same_comparison_scale_required',
        entityJoin: 'branches_remain_distinct'
      });
    } else if (id === 'relationship') {
      var r1 = direct('self_other_contrast', '你／對方作用對照', [0, 1], { topology: 'dyadic_contrast' });
      var r2 = direct('relationship_mechanism', '雙方作用→關係現況', [0, 1, 2], { topology: 'relation_mechanism' });
      var r3 = direct('obstacle_link', '挑戰→關係現況', [3, 2], { topology: 'constraint_edge' });
      var r4 = direct('intervention_chain', '建議→挑戰／現況', [4, 3, 2], { topology: 'intervention_chain' });
      var r5 = direct('outcome_dependency', '短期走向依賴', [0, 1, 2, 3, 4, 5], { topology: 'dependency_set' });
      synthesis('relationship_dependency_network', '關係完整網絡', [r1, r2, r3, r4, r5]);
    } else if (id === 'timeline') {
      var tl1 = direct('ordered_timeline', '相對時間路徑', [0, 1, 2, 3, 4], { topology: 'ordered_path' });
      var tl2 = direct('trigger_chain', '觸發與轉折鏈', [1, 2, 3], { topology: 'trigger_chain' });
      synthesis('timeline_dependency_network', '時間線完整網絡', [tl1, tl2]);
    } else if (id === 'celtic_cross') {
      var cc1 = direct('core_cross', '核心與交叉力量', [0, 1], { topology: 'cross' });
      var cc2 = direct('vertical_axis', '上方可能↔腳下根基', [2, 3], { topology: 'axis' });
      var cc3 = direct('time_axis', '身後→身前', [4, 5], { topology: 'ordered_axis' });
      var cc4 = direct('self_environment_axis', '本人↔環境', [6, 7], { topology: 'axis' });
      var cc5 = direct('expectation_outcome_axis', '希望恐懼↔結果', [8, 9], { topology: 'axis' });
      synthesis('dependency_network', '凱爾特完整依賴網', [cc1, cc2, cc3, cc4, cc5], {
        eventBinding: 'QUERY_EVENT_DEPENDENCY_GRAPH'
      });
    } else if (id === 'tree_of_life') {
      var tr1 = direct('mercy_pillar', '慈悲之柱', [1, 3, 6], { topology: 'pillar' });
      var tr2 = direct('severity_pillar', '嚴厲之柱', [2, 4, 7], { topology: 'pillar' });
      var tr3 = direct('middle_pillar', '中柱落地主軸', [0, 5, 8, 9], { topology: 'pillar' });
      synthesis('pillar_dependency_network', '三柱完整網絡', [tr1, tr2, tr3]);
    } else if (id === 'zodiac') {
      var axes = [];
      for (var zi = 0; zi < 6; zi += 1) {
        axes.push(direct('house_axis', '宮位對軸 ' + (zi + 1) + '↔' + (zi + 7), [zi, zi + 6], { topology: 'axis' }));
      }
      var network = synthesis('domain_dependency_network', '十二領域依賴網', axes, {
        eventBinding: 'QUERY_EVENT_DOMAIN_NETWORK'
      });
      synthesis('domain_synthesis', '十二領域與第十三張綜合', [network, atomicIds[12]], {
        eventBinding: 'QUERY_EVENT_SYNTHESIS_ONLY'
      });
    } else if (id === 'minor_arcana') {
      var mi1 = direct('mechanism_chain', '原因→現況→挑戰', [1, 0, 2], { topology: 'directed_chain' });
      var mi2 = direct('resource_intervention', '環境／本人資源→建議', [3, 4, 5], { topology: 'resource_intervention' });
      var mi3 = direct('outcome_dependency', '結果依賴', [0, 2, 3, 4, 5, 6], { topology: 'dependency_set' });
      synthesis('minor_dependency_network', '小阿卡那完整網絡', [mi1, mi2, mi3]);
    } else if (id === 'fifteen_card') {
      var fi1 = direct('triad_core', '核心三牌組', [1, 0, 2], { topology: 'triad' });
      var fi2 = direct('triad_natural', '自然發展三牌組', [3, 7, 11], { topology: 'triad', eventBinding: 'NATURAL_PATH_EVENT' });
      var fi3 = direct('triad_alternative', '替代路徑三牌組', [12, 8, 4], { topology: 'triad', eventBinding: 'ALTERNATIVE_PATH_EVENT' });
      var fi4 = direct('triad_decision', '決策依據三牌組', [5, 9, 13], { topology: 'triad' });
      var fi5 = direct('triad_fate', '不可控條件三牌組', [6, 10, 14], { topology: 'triad' });
      synthesis('triad_comparison', '五組三牌依賴與路徑比較', [fi1, fi2, fi3, fi4, fi5], {
        entityJoin: 'natural_and_alternative_remain_distinct',
        roleJoin: 'same_comparison_scale_required'
      });
    } else if (id === 'mathers_21') {
      var rows = [
        direct('ordered_row', '第一排由右往左', range(0, 7), { topology: 'ordered_row' }),
        direct('ordered_row', '第二排由右往左', range(7, 14), { topology: 'ordered_row' }),
        direct('ordered_row', '第三排由右往左', range(14, 21), { topology: 'ordered_row' })
      ];
      var pairs21 = [];
      for (var mp = 0; mp < 10; mp += 1) {
        pairs21.push(direct('declared_outer_pair', '配對 ' + (mp + 1) + '↔' + (21 - mp), [mp, 20 - mp], { topology: 'declared_pair' }));
      }
      var center21 = direct('center_card', '中心牌', [10], { topology: 'center' });
      synthesis('row_dependency_network', '三排、配對與中心綜合', rows.concat(pairs21, [center21]));
    } else if (id === 'mathers_horseshoe') {
      var groupA = direct('ordered_group', 'A 組 26 張由右往左', range(0, 26), { topology: 'ordered_group', eventBinding: 'GROUP_A_EVENT' });
      var groupC = direct('ordered_group', 'C 組 17 張由右往左', range(26, 43), { topology: 'ordered_group', eventBinding: 'GROUP_C_EVENT' });
      var groupE = direct('ordered_group', 'E 組 11 張由右往左', range(43, 54), { topology: 'ordered_group', eventBinding: 'GROUP_E_EVENT' });
      var groupAPairs = [];
      for (var ap = 0; ap < 13; ap += 1) {
        groupAPairs.push(direct('declared_outer_pair', 'A 配對 ' + (ap + 1) + '↔' + (26 - ap), [ap, 25 - ap], { topology: 'declared_pair', eventBinding: 'GROUP_A_EVENT' }));
      }
      var groupCPairs = [];
      for (var cp = 0; cp < 8; cp += 1) {
        groupCPairs.push(direct('declared_outer_pair', 'C 配對 ' + (cp + 1) + '↔' + (17 - cp), [26 + cp, 42 - cp], { topology: 'declared_pair', eventBinding: 'GROUP_C_EVENT' }));
      }
      var centerC = direct('center_card', 'C 組中心牌', [34], { topology: 'center', eventBinding: 'GROUP_C_EVENT' });
      var groupEPairs = [];
      for (var ep = 0; ep < 5; ep += 1) {
        groupEPairs.push(direct('declared_outer_pair', 'E 配對 ' + (ep + 1) + '↔' + (11 - ep), [43 + ep, 53 - ep], { topology: 'declared_pair', eventBinding: 'GROUP_E_EVENT' }));
      }
      var centerE = direct('center_card', 'E 組中心牌', [48], { topology: 'center', eventBinding: 'GROUP_E_EVENT' });
      var summaryA = synthesis('group_claim_synthesis', 'A 組完整命題', [groupA].concat(groupAPairs), { eventBinding: 'GROUP_A_EVENT' });
      var summaryC = synthesis('group_claim_synthesis', 'C 組完整命題', [groupC].concat(groupCPairs, [centerC]), { eventBinding: 'GROUP_C_EVENT' });
      var summaryE = synthesis('group_claim_synthesis', 'E 組完整命題', [groupE].concat(groupEPairs, [centerE]), { eventBinding: 'GROUP_E_EVENT' });
      synthesis('cross_group_synthesis', 'A→C→E 已成立命題綜合', [summaryA, summaryC, summaryE], {
        eventBinding: 'QUERY_EVENT_CROSS_GROUP',
        eventJoin: 'group_summaries_only_no_cross_group_card_sentence'
      });
    } else if (id === 'horseshoe') {
      var h1 = direct('ordered_arc', '過去→現在→隱藏作用', [0, 1, 2], { topology: 'ordered_arc' });
      var h2 = direct('environment_obstacle_link', '環境↔阻礙', [4, 5], { topology: 'interaction_edge' });
      var h3 = direct('intervention_outcome_chain', '建議→環境／阻礙→結果', [3, 4, 5, 6], { topology: 'intervention_chain' });
      synthesis('horseshoe_dependency_network', '馬蹄形完整網絡', [h1, h2, h3]);
    }

    return {
      methodId: id,
      topology: clone(spec.topology),
      observationModel: clone(spec.observationModel),
      nodes: nodes,
      evidenceUnits: factory.units,
      legalSynthesisRule: '只可依本圖的 nodes、dependsOn 與 joinPolicy 合成。直接單位先各自成命題；synthesis_only 單位只能讀取 dependsOn 已成立命題，不得把未相連牌名改寫成新牌句。',
      forbiddenInference: [
        '牌張數、牌號、宮廷牌數不得換算現實數量、年齡、日期、金額或機率',
        '位置名稱不能反向證明未知人物或事件存在',
        '同題材、同宮位領域或同花色不等於同一實體或同一事件',
        '無 eventId／entityBindings／roleBindings／joinTrace 的訊號不得併成完整事件',
        '不以吉凶牌數、正逆位票數、花色缺席或單一強牌裁決'
      ]
    };
  }

  function ootkStageFunction(stage) {
    return [
      'opening_and_present_condition',
      'development_through_houses',
      'continuing_development_through_signs',
      'penultimate_ring_of_thirty_six',
      'termination_through_tree_of_life'
    ][stage - 1];
  }

  function compileOOTKEvidence(ootkData) {
    var data = ootkData || {};
    var nodes = [];
    var factory = makeUnitFactory(nodes);
    var operations = data.operations || {};

    function addNode(cardName, position, stage, raw) {
      var index = nodes.length;
      var node = {
        id: nodeId(index),
        index: index,
        position: position,
        authority: 'stage',
        authorityRule: ROLE_AUTHORITY.stage,
        bindingPolicy: nodeBindingPolicy('stage'),
        cardName: stripDirection(cardName || ('操作牌' + (index + 1))),
        direction: '',
        semanticCandidates: splitCandidates(raw && (raw.semanticCandidates || raw.title || raw.keywords)),
        sourceGloss: text(raw && (raw.sourceGloss || raw.baseMeaning || raw.meaning || raw.title)),
        stage: stage,
        raw: clone(raw || {})
      };
      nodes.push(node);
      return index;
    }

    var summaryIds = [];
    for (var stage = 1; stage <= 5; stage += 1) {
      var op = operations['op' + stage] || operations[stage] || {};
      var stageDeps = [];
      var pathIndices = [];
      (op.countingPath || []).forEach(function (entry, index) {
        pathIndices.push(addNode(entry.cardName || entry.name || entry.title, '第' + stage + '次操作計數路徑 #' + (index + 1), stage, entry));
      });
      if (pathIndices.length) {
        stageDeps.push(factory.add('operation_counting_path', '第' + stage + '次操作完整計數路徑', pathIndices, {
          topology: 'ordered_counting_path',
          stage: stage,
          eventBinding: 'QUERY_EVENT_STAGE_' + stage,
          eventJoin: 'within_same_operation_path_only'
        }));
      }

      var landingLabel = op.activePile || op.activeHouse || op.activeSign || op.activeSephirah || op.landing || '';
      stageDeps.push(factory.add('operation_landing', '第' + stage + '次操作落點／分堆', [], {
        topology: 'procedural_landing',
        stage: stage,
        claimPolicy: 'direct_procedure_fact',
        eventBinding: 'QUERY_EVENT_STAGE_' + stage,
        metadata: { landing: landingLabel },
        eventJoin: 'procedure_stage_only'
      }));

      (op.pairs || []).forEach(function (pair, index) {
        var left = pair.left || {};
        var right = pair.right || {};
        var leftIndex = addNode(left.name || left.cardName || left.title, '第' + stage + '次操作配對 #' + (index + 1) + ' 左', stage, left);
        var rightIndex = addNode(right.name || right.cardName || right.title, '第' + stage + '次操作配對 #' + (index + 1) + ' 右', stage, right);
        stageDeps.push(factory.add('operation_pair', '第' + stage + '次操作配對 #' + (index + 1), [leftIndex, rightIndex], {
          topology: 'declared_pair',
          stage: stage,
          eventBinding: 'QUERY_EVENT_STAGE_' + stage,
          eventJoin: 'within_same_operation_declared_pair_only'
        }));
      });

      if ((op.dignities || []).length) {
        stageDeps.push(factory.add('operation_dignity_context', '第' + stage + '次操作牌力脈絡', [], {
          topology: 'procedural_context',
          stage: stage,
          claimPolicy: 'direct_procedure_fact',
          eventBinding: 'QUERY_EVENT_STAGE_' + stage,
          metadata: { dignities: clone(op.dignities) },
          eventJoin: 'modifies_same_stage_claim_strength_only'
        }));
      }

      if (stage === 4) {
        stageDeps.push(factory.add('op4_ring_structure', '第四次操作：代表牌後方三十六張之環', [], {
          topology: 'ring_of_thirty_six',
          stage: stage,
          claimPolicy: 'direct_procedure_fact',
          eventBinding: 'QUERY_EVENT_STAGE_4',
          metadata: {
            ringSize: 36,
            orderPolicy: 'the_thirty_six_cards_following_the_significator',
            pairingPolicy: '1_with_36_2_with_35_and_so_on',
            timingPolicy: 'not_a_calendar_or_decan_time_anchor'
          },
          eventJoin: 'ring_structure_applies_only_to_stage_4_claims'
        }));
      }

      var validity = factory.add('operation_validity', '第' + stage + '次操作適配／有效性', [], {
        topology: 'procedure_gate',
        stage: stage,
        claimPolicy: 'direct_procedure_fact',
        eventBinding: 'QUERY_EVENT_STAGE_' + stage,
        metadata: {
          valid: op.valid !== false,
          retry: !!op.retry,
          stop: !!op.stop,
          reason: text(op.validityReason || op.stopReason || op.reason)
        },
        eventJoin: 'validity_gate_controls_stage_weight'
      });
      stageDeps.push(validity);

      var summary = factory.add('operation_stage_summary', '第' + stage + '次操作階段摘要', [], {
        topology: 'stage_summary',
        stage: stage,
        stageFunction: ootkStageFunction(stage),
        dependsOn: stageDeps,
        claimPolicy: 'synthesis_only',
        eventBinding: 'QUERY_EVENT_ONLY',
        eventJoin: 'claims_only_from_same_operation_dependsOn',
        entityJoin: 'significator_and_query_entities_only',
        synthesisJoin: 'same_operation_claims_only_no_cross_operation_card_sentence',
        forbidden: ['不能直接把不同操作中的牌拼成新牌句']
      });
      summaryIds.push(summary);
    }

    factory.add('cross_operation_stage_network', '五次操作階段綜合', [], {
      topology: 'ordered_stage_dependency_network',
      dependsOn: summaryIds,
      claimPolicy: 'synthesis_only',
      eventBinding: 'QUERY_EVENT_ONLY',
      eventJoin: 'stage_summaries_only',
      entityJoin: 'same_query_event_roles_only',
      scopeJoin: 'stage_order_only_op4_is_not_a_date_anchor',
      synthesisJoin: 'operation_stage_summaries_only_no_direct_card_merge',
      forbidden: ['不能直接把不同操作中的牌拼成新牌句', '代表牌重複出現不等於新增人物或事件']
    });

    return {
      methodId: 'ootk',
      topology: clone(METHOD_SPECS.ootk.topology),
      observationModel: clone(METHOD_SPECS.ootk.observationModel),
      significator: clone(data.significator || null),
      nodes: nodes,
      evidenceUnits: factory.units,
      legalSynthesisRule: '五次操作各自先完成落點、完整計數路徑、明示配對、牌力脈絡與有效性。跨操作只能綜合 operation_stage_summary；不能直接把不同操作中的牌拼成新牌句。第四次操作的三十六牌環只形成倒數階段的計數與配對命題，不提供旬位、月份或日期錨。',
      forbiddenInference: [
        '計數值與步數只導航牌序，不換算現實人數、年齡、金額或機率',
        '代表牌只錨定問卜者，不建立未知行動者',
        '適配失敗、重試、中止或降權必須保留，不能美化成隱藏吉兆',
        '五次操作不能被壓成一條任意牌序',
        '不同操作只能透過階段摘要承接'
      ]
    };
  }

  function requiredDimensionId(dimension) {
    var id = dimension && dimension.id || '';
    var map = {
      event_or_state:'state', existence:'realization', event_realization:'realization',
      cause:'cause', trajectory:'trajectory', outcome:'conditional_outcome', guidance:'advice',
      comparison:'comparison_outcome', relative_order:'comparison_outcome', threshold_crossing:'threshold_outcome',
      relational_event:'realization', annual_overview:'annual_overview', multi_domain:'domain_coverage',
      timing:'temporal_sequence', location:'location'
    };
    return map[id] || id;
  }

  function buildCapabilityMatrix(questionSpec, method) {
    var provided = (method.provides || []).slice();
    var providedSet = Object.create(null);
    provided.forEach(function (id) { providedSet[id] = true; });
    var unsupported = Object.create(null);
    ((questionSpec || {}).unsupportedDimensions || []).forEach(function (id) { unsupported[id] = true; });
    return (questionSpec.requestedDimensions || []).map(function (dimension) {
      var observable = requiredDimensionId(dimension);
      var queryConstraint = dimension.id === 'time_scope' || dimension.id === 'modality';
      var intrinsicallyUnmeasured = unsupported[dimension.id] || /^(?:exact_value|numeric_range|cardinality|exact_age|identity|exact_date|probability)$/.test(dimension.id);
      var canAnswer = queryConstraint || (!intrinsicallyUnmeasured && !!providedSet[observable]);
      var status = queryConstraint ? 'query_constraint' : (intrinsicallyUnmeasured ? 'not_measured' : (canAnswer ? 'direct_or_qualitative_channel' : 'missing_required_channel'));
      var reason;
      if (queryConstraint) reason = '這是原句提供的範圍／模態約束，不是由牌面推算。';
      else if (intrinsicallyUnmeasured) reason = '本方法不推算實際精確數值、差額、機率、身分或日期；使用者明示的門檻仍保留為查詢條件。';
      else if (canAnswer && observable === 'threshold_outcome') reason = '方法具有綁定原問句尺度、比較子、門檻與截止範圍的結果通道，可定性裁決是否跨越；不得反推實際營業額或差額。';
      else if (canAnswer && observable === 'comparison_outcome') reason = '方法提供兩個獨立且同尺度的分支結果通道，先各自成句再比較。';
      else if (canAnswer) reason = '方法註冊表明示提供此觀測通道，可依合法證據圖定性裁決。';
      else reason = '原問句需要此觀測通道，但所選方法未提供；自動路由時必須改選，使用者強制指定時只能明示限制。';
      return {dimensionId:dimension.id,dimension:dimension.label,source:dimension.source,observableId:observable,methodCapability:canAnswer?'provided':'not_provided',precheckStatus:status,canAnswer:canAnswer,reason:reason};
    });
  }

  function claimSchema() {
    return {
      id: 'tarot_claim/2',
      required: [
        'claimId', 'claimType', 'eventId', 'subject', 'predicate', 'objectOrState',
        'scope', 'modality', 'entityBindings', 'roleBindings', 'supportedDimensions',
        'evidenceIds', 'counterEvidenceIds', 'joinTrace', 'assumptions',
        'doesNotEstablish', 'strength', 'status'
      ],
      enums: {
        claimType: ['direct', 'conditional', 'constraint', 'counterevidence', 'synthesis', 'guidance', 'unmeasured_boundary'],
        strength: ['weak', 'moderate', 'strong'],
        status: ['candidate', 'accepted', 'rejected', 'unresolved']
      },
      rule: '每項主張必須可追溯至合法 evidenceId；跨單位合成必須提供 joinTrace，明示實體共指、事件同一、角色承接、範圍與極性相容。'
    };
  }

  function compileReadingSpec(input) {
    var data = input || {};
    var questionSpec = compileQuestion(data.question, { referenceDate: data.referenceDate || data.readingDate || null });
    var route = Foundation && typeof Foundation.routeQuestion === 'function'
      ? Foundation.routeQuestion(questionSpec, { referenceDate: data.referenceDate || data.readingDate || null })
      : null;
    var spreadId = METHOD_SPECS[data.spreadId] ? data.spreadId : (route && route.spreadId) || 'three_card';
    var methodPlan = data.methodPlan || (Foundation && typeof Foundation.instantiateMethod === 'function' ? Foundation.instantiateMethod(spreadId, questionSpec) : null);
    var method = clone(METHOD_SPECS[spreadId]);
    if (methodPlan) {
      method.label = methodPlan.label || method.label;
      method.roles = (methodPlan.slots || []).map(function (slot) { return slot.authority || 'structural'; });
      method.expectedCardCount = methodPlan.count == null ? method.expectedCardCount : methodPlan.count;
      method.provides = clone(methodPlan.provides || []);
      method.requiredObservables = clone(methodPlan.requiredObservables || questionSpec.requiredObservables || []);
      method.missingObservables = clone(methodPlan.missingObservables || []);
      method.coverageComplete = method.missingObservables.length === 0;
      method.questionShape = methodPlan.questionShape || (questionSpec.features && questionSpec.features.shape) || '';
      method.slotBindings = clone(methodPlan.slotBindings || []);
      method.dynamicSlots = clone(methodPlan.slots || []);
    }
    var sourceProfileId = resolveSemanticProfile(spreadId, data);
    var sourceProfile = clone(SOURCE_PROFILES[sourceProfileId] || SOURCE_PROFILES.gd_book_t);
    method.defaultSourceProfile = method.sourceProfile;
    method.requestedSourceProfile = text(data.sourceProfile || 'gd_book_t');
    method.sourceProfile = sourceProfileId;

    var evidenceGraph = spreadId === 'ootk'
      ? compileOOTKEvidence(data.ootkData || {})
      : compileEvidenceGraph(spreadId, data.cards || [], {
          questionSpec: questionSpec,
          methodPlan: methodPlan,
          knownCounterpart: typeof data.knownCounterpart === 'boolean'
            ? data.knownCounterpart
            : questionSpec.knownCounterpart
        });

    var contract = {
      schema: SCHEMA,
      engineVersion: VERSION,
      question: questionSpec,
      route: route ? { spreadId: route.spreadId, selectedBy: route.selectedBy, reason: route.reason, coverage: clone(route.coverage || {}) } : null,
      methodPlan: clone(methodPlan || null),
      method: method,
      sourceProfile: sourceProfile,
      capabilityMatrix: buildCapabilityMatrix(questionSpec, method),
      evidenceGraph: evidenceGraph,
      claimSchema: claimSchema(),
      adjudication: {
        executionPlan: {
          passes: [
            { id: 'P1_QUERY', name: 'QuestionCompiler', output: 'completedQueryGraph', gate: 'roundTrip && deletionSensitivity && noAddedPremise' },
            { id: 'P2_LOCAL', name: 'EvidenceInterpreter', output: 'candidateClaimsByEvidenceId', gate: 'every_evidence_unit_processed' },
            { id: 'P3_BIND', name: 'GraphBinder', output: 'boundClaimGraph', gate: 'every_join_has_entity_event_role_scope_trace' },
            { id: 'P4_ADJUDICATE', name: 'Adjudicator', output: 'atomCoverageAndVerdicts', gate: 'all_essential_atoms_classified' },
            { id: 'P5_REVIEW', name: 'SaturationReviewer', output: 'counterReadingAndSaturationLedger', gate: 'strongest_alternative_tested' },
            { id: 'P6_NARRATE', name: 'AnswerVerifier', output: 'finalAnswer', gate: 'reverse_audit_passed' }
          ],
          isolationRule: '每一階段只讀原始契約與前一階段的結構化輸出；正文生成階段不得新增未經命題帳本驗證的推論。'
        },
        program: [
          '完成細粒度查詢圖並通過 round-trip、deletion-sensitivity 與 no-added-premise',
          '逐一處理全部合法證據單位，每個單位產生候選命題、限制、反讀與 doesNotEstablish',
          '只依 joinPolicy 合併可共指命題；沒有 joinTrace 的相關訊號保持平行',
          '建立 essential atom 覆蓋矩陣：supported／conditional／contradicted／unmeasured',
          '完整事件強度不得高於最弱必要原子；未量測不等於否定',
          '建立最強替代解讀並與主解競爭，選擇解釋更多合法證據且依賴更少盤外假設者',
          '完成語義飽和帳本：每個證據單位標記 used／duplicate／irrelevant_to_query／unresolved',
          '正文後反向抽取主張，逐句核對 evidenceIds、eventId、entityBindings、scope、合法牌名與數字錨'
        ],
        entityEventRule: '若角色、意圖、行為、結果與期限被宣稱屬於同一完整事件，必須共同綁定同一 eventId；不同位置、宮位、牌組或操作中的相關訊號不能因題材相似而自行合併。',
        coverageRule: '完整命題只有在所有 essential atoms 受到相容支持、必要角色完成共指且沒有未解決的事件同一性缺口時，才可給肯定傾向。某一原子未量測時，只限制該原子並呈現其餘已成立子圖。',
        counterEvidenceRule: '反證依位置權限、方法拓撲與事件階段限定結論；不以吉凶票數、正逆位數量、花色缺席或單張強牌表決。',
        depthRule: '深度來自完整處理細粒度 query atoms、每個合法證據單位的候選解讀、形成機制、反證、最強替代解讀、歧義判別、可觀察訊號與行動；不來自固定字數或逐牌抄義。',
        calibrationRule: '不得因害怕越權而把所有答案降成無法確認；對已由同一事件／實體鏈支持的原子要明確裁決，只有真正未量測、未綁定或被反證者才保留。',
        synthesisRule: evidenceGraph.legalSynthesisRule
      },
      saturationLedgerSchema: {
        required: ['evidenceId', 'status', 'claimIds', 'reason'],
        status: ['used', 'duplicate', 'irrelevant_to_query', 'unresolved']
      },
      outputContract: {
        firstSentence: '第一句直接回答完整原問句。固定門檻題若方法具有 bounded_outcome／threshold_outcome 通道，可對原句門檻作定性肯定、否定或附條件裁決；實際數值與差額仍不得推算。若必要通道缺失，先明說完整命題不能確認。',
        body: '依已成立命題自然展開形成原因、限制／反證、最強替代解讀為何較弱、歧義如何辨識、可觀察訊號及直接可行方向；不逐格報告、不教內部程序。',
        visibleEvidence: '重要判斷附本盤實際牌名；不得把未相連牌名排列成不存在的牌句。',
        length: '輸出所有不同且與原問句相關的有效命題；同義合併，篇幅不由牌數決定。',
        facts: '精確數字、身分、日期、金額、年齡與人物屬性都需要明示量測錨及實體綁定。'
      }
    };
    contract.validation = validateContract(contract);
    return contract;
  }

  function validateContract(contract) {
    var errors = [];
    var warnings = [];
    if (!contract || contract.schema !== SCHEMA) errors.push('schema_missing_or_mismatch');
    var method = contract && contract.method;
    var graph = contract && contract.evidenceGraph;
    var question = contract && contract.question;
    if (!method || !METHOD_SPECS[method.id]) errors.push('method_missing');
    if (!question || !question.queryGraph || !question.queryGraph.requiredAtoms || !question.queryGraph.requiredAtoms.length) errors.push('typed_query_graph_missing');
    if (!question || !question.queryGraph || !question.queryGraph.atomizationRequirement) errors.push('semantic_atomization_requirement_missing');
    if (!question || !question.queryGraph || !question.queryGraph.validationRules || !question.queryGraph.validationRules.roundTrip) errors.push('query_round_trip_rule_missing');
    if (!graph || !Array.isArray(graph.nodes) || !Array.isArray(graph.evidenceUnits)) errors.push('evidence_graph_missing');

    if (method) {
      if (method.requestedSourceProfile && method.requestedSourceProfile !== 'gd_book_t') errors.push('source_profile_not_allowed:' + method.requestedSourceProfile);
      if (method.allowedSourceProfiles.indexOf(method.sourceProfile) < 0) errors.push('source_profile_not_allowed:' + method.sourceProfile);
      if (method.id !== 'ootk' && graph && graph.nodes.length !== method.expectedCardCount) {
        errors.push('card_count_mismatch:' + graph.nodes.length + '/' + method.expectedCardCount);
      }
      if (!method.observationModel) errors.push('method_observation_model_missing');
    }

    var nodeIds = Object.create(null);
    (graph && graph.nodes || []).forEach(function (node) {
      if (nodeIds[node.id]) errors.push('duplicate_node_id:' + node.id);
      nodeIds[node.id] = true;
      if (!node.bindingPolicy) errors.push('node_binding_policy_missing:' + node.id);
      if (!ROLE_AUTHORITY[node.authority]) errors.push('unknown_node_authority:' + node.id + ':' + node.authority);
    });

    var unitIds = Object.create(null);
    (graph && graph.evidenceUnits || []).forEach(function (unit) {
      if (unitIds[unit.id]) errors.push('duplicate_evidence_id:' + unit.id);
      unitIds[unit.id] = true;
      if (!unit.joinPolicy) errors.push('evidence_join_policy_missing:' + unit.id);
      if (unit.claimPolicy === 'synthesis_only' && unit.nodes.length) errors.push('synthesis_unit_contains_direct_nodes:' + unit.id);
      unit.nodes.forEach(function (id) {
        if (!nodeIds[id]) errors.push('evidence_unknown_node:' + unit.id + ':' + id);
      });
    });
    (graph && graph.evidenceUnits || []).forEach(function (unit) {
      unit.dependsOn.forEach(function (id) {
        if (!unitIds[id]) errors.push('evidence_unknown_dependency:' + unit.id + ':' + id);
      });
    });

    if (method && method.id === 'celtic_cross') {
      var network = (graph.evidenceUnits || []).find(function (unit) { return unit.type === 'dependency_network'; });
      if (!network || network.claimPolicy !== 'synthesis_only' || network.nodes.length || network.dependsOn.length !== 5) errors.push('celtic_nonlinear_dependency_missing');
    }
    if (method && method.id === 'zodiac') {
      var node13 = graph.nodes[12];
      if (!node13 || node13.authority !== 'synthesis') errors.push('zodiac_summary_must_be_synthesis');
      var domainSynthesis = (graph.evidenceUnits || []).find(function (unit) { return unit.type === 'domain_synthesis'; });
      if (!domainSynthesis || domainSynthesis.nodes.length || domainSynthesis.dependsOn.length !== 2) errors.push('zodiac_domain_synthesis_invalid');
    }
    if (method && method.id === 'ootk') {
      var summaries = (graph.evidenceUnits || []).filter(function (unit) { return unit.type === 'operation_stage_summary'; });
      if (summaries.length !== 5) errors.push('ootk_stage_summary_count:' + summaries.length);
      summaries.forEach(function (summary, index) {
        if (summary.eventBinding !== 'QUERY_EVENT_ONLY') errors.push('ootk_stage_event_binding:' + summary.id);
        if (summary.stageFunction !== ootkStageFunction(index + 1)) errors.push('ootk_stage_function:' + summary.id);
        var hasValidity = summary.dependsOn.some(function (depId) {
          var dep = graph.evidenceUnits.find(function (unit) { return unit.id === depId; });
          return dep && dep.type === 'operation_validity';
        });
        if (!hasValidity) errors.push('ootk_stage_validity_missing:' + summary.id);
      });
      var cross = (graph.evidenceUnits || []).find(function (unit) { return unit.type === 'cross_operation_stage_network'; });
      if (!cross || cross.nodes.length || cross.dependsOn.length !== 5) errors.push('ootk_cross_operation_network_invalid');
      if (cross && cross.dependsOn.some(function (depId) { return !summaries.some(function (summary) { return summary.id === depId; }); })) errors.push('ootk_cross_operation_direct_dependency');
    }

    if (!contract || !contract.adjudication || !contract.adjudication.executionPlan || contract.adjudication.executionPlan.passes.length !== 6) errors.push('staged_execution_plan_missing');
    return { ok: errors.length === 0, errors: uniq(errors), warnings: uniq(warnings) };
  }

  function renderEvidenceUnit(unit, graph) {
    var nodeMap = Object.create(null);
    (graph.nodes || []).forEach(function (node) { nodeMap[node.id] = node; });
    var direct = unit.nodes.map(function (id) {
      var node = nodeMap[id];
      return node ? node.id + ' ' + node.position + '=' + node.cardName + (node.direction ? '(' + node.direction + ')' : '') : id;
    }).join(' ↔ ');
    var deps = unit.dependsOn.length ? 'dependsOn=' + unit.dependsOn.join(',') : '';
    var payload = direct || deps || '程序／結構資料';
    return unit.id + '｜' + unit.type + '｜' + unit.label + '｜topology=' + unit.topology + '｜' + payload;
  }

  function renderPromptContract(contract) {
    if (!contract) return '';
    var question = contract.question;
    var method = contract.method;
    var graph = contract.evidenceGraph;
    var source = contract.sourceProfile;
    var lines = [];
    lines.push('────────────────────────────');
    lines.push('◆ ROOT-SPEC v98｜已驗證查詢圖—最小充分方法—合法證據／共指契約');
    lines.push('────────────────────────────');
    lines.push('原問句：' + question.originalQuestion);
    lines.push('需求預檢：' + question.requestedDimensions.map(function (dimension) {
      return dimension.label + (dimension.source ? '〔' + dimension.source + '〕' : '');
    }).join('、'));
    lines.push('已完成並通過驗證的型別化查詢圖（正文不得重新分類或改寫）：');
    question.queryGraph.events.forEach(function (event) {
      lines.push('・' + event.id + '｜surface=' + event.surface + '｜actor=' + event.roles.actor + '｜predicate=' + event.predicate + '｜roles=' + JSON.stringify(event.roles));
    });
    if (question.queryGraph.constraints.length) {
      lines.push('原句必要限定：');
      question.queryGraph.constraints.forEach(function (constraint) {
        lines.push('・' + constraint.id + '｜' + constraint.type + '｜' + constraint.text + '｜attach=' + constraint.attachTo || constraint.attach + '｜source=' + constraint.source);
      });
    }
    lines.push('必要語義原子：' + question.queryGraph.requiredAtoms.map(function (atom) { return atom.id + '=' + atom.text; }).join('；'));
    lines.push('細粒度原子化：' + question.queryGraph.atomizationRequirement);
    lines.push('查詢圖完成規則：' + question.queryGraph.completionRules.join(' '));
    lines.push('查詢圖驗證：' + question.queryGraph.validationRules.roundTrip + ' ' + question.queryGraph.validationRules.deletionSensitivity + ' ' + question.queryGraph.validationRules.sameEventTest + ' ' + question.queryGraph.validationRules.noAddedPremise);
    lines.push('方法：' + method.label + '〔' + method.id + '〕；拓撲=' + method.topology.kind + '。');
    lines.push('布局來源：' + method.layoutSource + '。');
    lines.push('方法觀測模型：entityResolution=' + method.observationModel.entityResolution + '；eventResolution=' + method.observationModel.eventResolution + '；comparisonChannels=' + method.observationModel.comparisonChannels + '；temporalModel=' + method.observationModel.temporalModel + '；synthesis=' + method.observationModel.synthesisModel + '。');
    lines.push('牌義來源：' + source.label + '〔' + source.id + '〕；本次只准使用這一個來源設定。');
    lines.push('觀測能力預檢：');
    contract.capabilityMatrix.forEach(function (row) {
      lines.push('・' + row.dimension + '＝' + row.precheckStatus + '〔' + row.methodCapability + '〕｜' + row.reason);
    });
    lines.push('位置／節點權限與綁定：');
    graph.nodes.forEach(function (node) {
      lines.push('・' + node.id + ' ' + node.position + '=' + node.cardName + (node.direction ? '(' + node.direction + ')' : '') + '｜authority=' + node.authority + '｜entityBinding=' + node.bindingPolicy.entityBinding + '｜eventRoles=' + node.bindingPolicy.eventRoles.join('/') + '｜' + node.authorityRule);
    });
    lines.push('牌義素材（不是已成立事件句）：');
    graph.nodes.forEach(function (node) {
      lines.push('・' + node.id + ' ' + node.cardName + '｜候選原子=' + (node.semanticCandidates.join('／') || '未拆分') + (node.sourceGloss ? '｜來源釋義僅供拆解=' + node.sourceGloss : ''));
    });
    lines.push('合法證據單位：');
    graph.evidenceUnits.forEach(function (unit) {
      lines.push('・' + renderEvidenceUnit(unit, graph) + '｜claimPolicy=' + unit.claimPolicy + '｜join=' + unit.joinPolicy.eventJoin);
    });
    lines.push('跨證據合成：' + graph.legalSynthesisRule);
    lines.push('命題帳本 schema：' + contract.claimSchema.required.join('、') + '。' + contract.claimSchema.rule);
    lines.push('分階段執行：' + contract.adjudication.executionPlan.passes.map(function (pass) {
      return pass.id + '/' + pass.name + '→' + pass.output + '〔gate=' + pass.gate + '〕';
    }).join('；') + '。' + contract.adjudication.executionPlan.isolationRule);
    lines.push('裁決程式：' + contract.adjudication.program.join(' → ') + '。');
    lines.push('實體／事件同一性：' + contract.adjudication.entityEventRule);
    lines.push('原子覆蓋：' + contract.adjudication.coverageRule);
    lines.push('反證：' + contract.adjudication.counterEvidenceRule);
    lines.push('深度標準：' + contract.adjudication.depthRule);
    lines.push('校準：' + contract.adjudication.calibrationRule);
    lines.push('語義飽和帳本：每個 evidenceId 必須內部標記 used／duplicate／irrelevant_to_query／unresolved；未完成不得交稿。');
    lines.push('禁止推理：' + graph.forbiddenInference.join('；') + '。');
    lines.push('最終輸出：' + contract.outputContract.firstSentence + ' ' + contract.outputContract.body + ' ' + contract.outputContract.visibleEvidence + ' ' + contract.outputContract.length + ' ' + contract.outputContract.facts);
    return lines.join('\n');
  }

  var TAROT_NAME_RE = /(?:愚者|魔術師|女祭司|皇后|皇帝|教皇|戀人|戰車|力量|隱者|命運之輪|正義|吊人|倒吊人|死神|節制|惡魔|高塔|塔|星星|月亮|太陽|審判|世界|(?:權杖|聖杯|寶劍|金幣|錢幣)(?:王牌|一|二|三|四|五|六|七|八|九|十|侍者|騎士|皇后|國王))/g;

  function positiveThresholdAssertion(answer, relation) {
    if (!relation || !relation.operatorText) return false;
    var escaped = relation.operatorText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    var re = new RegExp('(會|能|可以|將|終將|必然|確定|傾向)(?:.{0,12})' + escaped);
    if (!re.test(answer)) return false;
    var index = answer.search(re);
    var prefix = answer.slice(Math.max(0, index - 18), index + 3);
    return !/(無法|不能|未能|尚不能|不足以|不代表|未必|不一定|無從)/.test(prefix);
  }

  function validateAnswer(answer, contract) {
    var output = text(answer);
    var graph = contract && contract.evidenceGraph || { nodes: [] };
    var violations = [];
    var warnings = [];
    var allowedCards = Object.create(null);
    graph.nodes.forEach(function (node) { allowedCards[node.cardName] = true; });

    var mentioned = output.match(TAROT_NAME_RE) || [];
    uniq(mentioned).forEach(function (name) {
      if (!allowedCards[name] && !(name === '塔' && allowedCards['高塔'])) violations.push('引用本盤外牌名：' + name);
    });

    var capabilityMap = Object.create(null);
    ((contract || {}).capabilityMatrix || []).forEach(function (row) { capabilityMap[row.dimensionId] = row; });
    if (capabilityMap.exact_age && capabilityMap.exact_age.canAnswer === false && /(?:\d{1,3}|[一二三四五六七八九十兩]{1,3})\s*歲/.test(output)) violations.push('本方法未量測年齡，卻輸出具體歲數');
    if (capabilityMap.cardinality && capabilityMap.cardinality.canAnswer === false && /(?:\d+|[一二三四五六七八九十兩]+)\s*(?:個|位|人)(?:異性|對象|追求者|暗戀者|桃花|候選人)?/.test(output)) violations.push('本方法未量測人數，卻輸出具體人數');
    if (capabilityMap.probability && capabilityMap.probability.canAnswer === false && /\d+(?:\.\d+)?\s*%/.test(output)) violations.push('本方法未量測機率，卻輸出百分比');
    if (capabilityMap.exact_value && capabilityMap.exact_value.canAnswer === false && /(?:NT\$|\$|新台幣)?\s*\d[\d,]*(?:元|萬|千)/.test(output)) violations.push('本方法未量測精確金額，卻輸出具體金額');
    if (capabilityMap.exact_date && capabilityMap.exact_date.canAnswer === false && /\d{4}年\d{1,2}月|\d{1,2}月\d{1,2}日|\d+\s*(?:天|週|個月)內/.test(output)) violations.push('本方法未量測精確時間，卻輸出具體日期或區間');

    (((contract || {}).question || {}).relations || []).forEach(function (relation) {
      var cap = capabilityMap.threshold_crossing || capabilityMap.relative_order;
      if (relation.type !== 'fixed_numeric_threshold' && cap && cap.canAnswer === false && positiveThresholdAssertion(output, relation)) {
        violations.push('本方法沒有獨立選項比較通道，卻肯定相對排序：' + relation.left + ' ' + relation.operatorText + ' ' + relation.right);
      }
    });

    if ((((contract || {}).question || {}).relations || []).length && /(?:若|如果).{0,24}成功.{0,14}(?:是指|定義為)/.test(output)) violations.push('重新定義原問句已明示的成功門檻');
    if (/\d/.test(output)) warnings.push('輸出含阿拉伯數字，需逐一核對資料錨點。');
    if (!output) violations.push('空白輸出');

    var synthesisCards = Object.create(null);
    graph.nodes.forEach(function (node) {
      if (node.authority === 'synthesis') synthesisCards[node.cardName] = true;
    });
    Object.keys(synthesisCards).forEach(function (card) {
      var re = new RegExp(card + '.{0,14}(?:證明|確定|必然).{0,14}(?:有人|對方|事件|結果)');
      if (re.test(output)) warnings.push('綜合／指引牌可能被越權作存在或結果證據：' + card);
    });

    return {
      ok: violations.length === 0,
      violations: uniq(violations),
      warnings: uniq(warnings),
      mentionedCards: uniq(mentioned)
    };
  }

  function routeQuestion(question, options) {
    if (Foundation && typeof Foundation.routeQuestion === 'function') {
      return Foundation.routeQuestion(typeof question === 'string' ? compileQuestion(question, options || {}) : question, options || {});
    }
    return { version:VERSION, engine:'fallback', spreadId:'three_card', reason:'基礎路由不可用，使用最小一般牌陣', confidence:.5, candidates:[{id:'three_card',score:0}] };
  }

  return {
    VERSION: VERSION,
    SCHEMA: SCHEMA,
    SOURCE_PROFILES: SOURCE_PROFILES,
    METHOD_SPECS: METHOD_SPECS,
    ROLE_AUTHORITY: ROLE_AUTHORITY,
    compileQuestion: compileQuestion,
    routeQuestion: routeQuestion,
    Foundation: Foundation,
    resolveSemanticProfile: resolveSemanticProfile,
    compileEvidenceGraph: compileEvidenceGraph,
    compileOOTKEvidence: compileOOTKEvidence,
    compileReadingSpec: compileReadingSpec,
    renderPromptContract: renderPromptContract,
    validateContract: validateContract,
    validateAnswer: validateAnswer,
    inferExplicitCounterpartBinding: inferExplicitCounterpartBinding,
    stripDirection: stripDirection
  };
});
