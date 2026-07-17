/*! tarot-foundation.js — Golden Dawn Tarot v97 single source of truth
 * 統一管理：問題編譯、問題型別、牌陣路由、位置權限、牌陣依賴與 Book T 有序尊貴線。
 * 不含牌義；牌義唯一由 golden-dawn-tarot.js 的 Book T 核心提供。
 */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.JYTarotFoundation = api;
})(typeof globalThis !== 'undefined' ? globalThis : (typeof window !== 'undefined' ? window : this), function () {
  'use strict';

  var VERSION = '97.0.0';
  var SCHEMA = 'jy.tarot.foundation/2';

  function text(v) { return v == null ? '' : String(v).trim(); }
  function clone(v) { return v == null ? v : JSON.parse(JSON.stringify(v)); }
  function uniq(arr, keyFn) {
    var seen = Object.create(null), out = [];
    (arr || []).forEach(function (v) {
      var k = keyFn ? keyFn(v) : (typeof v === 'string' ? v : JSON.stringify(v));
      if (!seen[k]) { seen[k] = true; out.push(v); }
    });
    return out;
  }
  function pad(n, w) { return String(n).padStart(w, '0'); }
  function range(a, b) { var out = []; for (var i = a; i < b; i += 1) out.push(i); return out; }
  function normalize(q) {
    q = text(q);
    try { if (q.normalize) q = q.normalize('NFKC'); } catch (_e) {}
    var map = {
      '为什么':'為什麼','为何':'為何','什么时候':'什麼時候','关系':'關係','选择':'選擇','还是':'還是',
      '整体':'整體','发展':'發展','事业':'事業','财运':'財運','结果':'結果','复合':'復合','对象':'對象',
      '对方':'對方','问题':'問題','建议':'建議','阻碍':'阻礙','未来':'未來','现在':'現在','过去':'過去',
      '职业':'職業','离职':'離職','创业':'創業','全年':'全年','运势':'運勢','收入':'收入'
    };
    Object.keys(map).forEach(function (k) { q = q.split(k).join(map[k]); });
    return q.replace(/[\u3000\t\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();
  }
  function dateParts(value) {
    var d = value ? new Date(value) : new Date();
    if (isNaN(d.getTime())) d = new Date();
    return { year:d.getFullYear(), month:d.getMonth()+1, day:d.getDate(), iso:d.getFullYear()+'-'+pad(d.getMonth()+1,2)+'-'+pad(d.getDate(),2) };
  }

  var METHODS = {
    three_card: {
      id:'three_card', label:'三牌陣', count:3, layoutSource:'後世觀測布局；不得冒充 Book T 原創',
      slots:[
        {authority:'antecedent', role:'prior_influence'},
        {authority:'state', role:'current_state'},
        {authority:'development', role:'future_tendency'}
      ],
      dignityLines:[[0,1,2]], dependencies:[[0,1,2]], compatibilityEdges:[],
      capabilities:{state:1, existence:.8, cause:.25, guidance:.2, trajectory:.8, outcome:.45, timing:.3, comparison:.05, annual:.05, dyad:.1, domains:.05, hidden:.05, external:.05, location:.05}
    },
    five_card: {
      id:'five_card', label:'五牌陣', count:5, layoutSource:'後世觀測布局；不得冒充 Book T 原創',
      slots:[
        {authority:'state', role:'current_state'}, {authority:'cause', role:'cause'},
        {authority:'obstacle', role:'constraint'}, {authority:'advice', role:'intervention'},
        {authority:'outcome', role:'conditional_outcome'}
      ],
      dignityLines:[[1,0,2],[3,0,4]], dependencies:[[1,0,2],[3,2,0,4]], compatibilityEdges:[],
      capabilities:{state:1, existence:.8, cause:1, guidance:1, trajectory:.85, outcome:.9, timing:.35, comparison:.45, annual:.1, dyad:.3, domains:.25, hidden:.4, external:.3, location:.25}
    },
    cross: {
      id:'cross', label:'十字牌陣', count:5, layoutSource:'後世觀測布局；不得冒充 Book T 原創',
      slots:[
        {authority:'state', role:'core_state'}, {authority:'interaction_force', role:'crossing_force'},
        {authority:'antecedent', role:'prior_influence'}, {authority:'development', role:'future_tendency'},
        {authority:'advice', role:'intervention'}
      ],
      dignityLines:[[2,0,3],[4,0,1]], dependencies:[[0,1],[2,0,3],[4,0,1]], compatibilityEdges:[],
      capabilities:{state:1, existence:.7, cause:.7, guidance:1, trajectory:.8, outcome:.35, timing:.3, comparison:.15, annual:.05, dyad:.25, domains:.15, hidden:.6, external:.3, location:.25}
    },
    either_or: {
      id:'either_or', label:'二選一牌陣', count:5, layoutSource:'後世觀測布局；不得冒充 Book T 原創',
      slots:[
        {authority:'state', role:'decision_state'}, {authority:'comparison', role:'branch_A_state'},
        {authority:'comparison', role:'branch_B_state'}, {authority:'development', role:'branch_A_tendency'},
        {authority:'development', role:'branch_B_tendency'}
      ],
      dignityLines:[[0,1,3],[0,2,4]], dependencies:[[0,1,3],[0,2,4]], compatibilityEdges:[],
      capabilities:{state:.8, existence:.5, cause:.35, guidance:.7, trajectory:.9, outcome:.55, timing:.2, comparison:1, annual:0, dyad:.1, domains:.1, hidden:.1, external:.1, location:.05}
    },
    relationship: {
      id:'relationship', label:'關係牌陣', count:6, layoutSource:'後世觀測布局；不得冒充 Book T 原創',
      slots:[
        {authority:'state', role:'querent_state'}, {authority:'person_aggregate', role:'counterpart_state'},
        {authority:'state', role:'relation_state'}, {authority:'obstacle', role:'relation_constraint'},
        {authority:'advice', role:'intervention'}, {authority:'development', role:'relation_tendency'}
      ],
      dignityLines:[[0,2,1],[4,3,2,5]], dependencies:[[0,1,2],[3,2],[4,3,2,5]], compatibilityEdges:[],
      capabilities:{state:1, existence:.65, cause:.65, guidance:.85, trajectory:.9, outcome:.5, timing:.2, comparison:.25, annual:.05, dyad:1, domains:.1, hidden:.5, external:.9, location:.05}
    },
    timeline: {
      id:'timeline', label:'相對時間線', count:5, layoutSource:'後世觀測布局；不得冒充 Book T 原創',
      slots:[
        {authority:'antecedent', role:'prior_influence'}, {authority:'timeline', role:'near_stage'},
        {authority:'timeline', role:'turning_point'}, {authority:'timeline', role:'later_stage'},
        {authority:'development', role:'terminal_tendency'}
      ],
      dignityLines:[[0,1,2,3,4]], dependencies:[[0,1,2,3,4]], compatibilityEdges:[],
      capabilities:{state:.8, existence:.6, cause:.35, guidance:.3, trajectory:1, outcome:.5, timing:1, comparison:.05, annual:.15, dyad:.1, domains:.05, hidden:.15, external:.1, location:.1}
    },
    horseshoe: {
      id:'horseshoe', label:'七張馬蹄形', count:7, layoutSource:'後世觀測布局；不得冒充 Book T 原創',
      slots:[
        {authority:'antecedent', role:'prior_influence'}, {authority:'state', role:'current_state'},
        {authority:'structural', role:'hidden_influence'}, {authority:'advice', role:'intervention'},
        {authority:'environment', role:'external_condition'}, {authority:'obstacle', role:'constraint'},
        {authority:'outcome', role:'conditional_outcome'}
      ],
      dignityLines:[[0,1,2,3,4,5,6]], dependencies:[[0,1,2],[4,5],[3,4,5,6]], compatibilityEdges:[],
      capabilities:{state:1, existence:.7, cause:.75, guidance:1, trajectory:.9, outcome:.9, timing:.45, comparison:.2, annual:.1, dyad:.4, domains:.3, hidden:1, external:1, location:.75}
    },
    celtic_cross: {
      id:'celtic_cross', label:'凱爾特十字', count:10, layoutSource:'後世觀測布局；不得冒充 Book T 原創',
      slots:[
        {authority:'state', role:'core_state'}, {authority:'interaction_force', role:'crossing_force'},
        {authority:'structural', role:'possible_formation'}, {authority:'cause', role:'root_mechanism'},
        {authority:'timeline', role:'receding_stage'}, {authority:'timeline', role:'approaching_stage'},
        {authority:'state', role:'querent_state'}, {authority:'environment', role:'external_condition'},
        {authority:'state', role:'expectation_or_fear'}, {authority:'outcome', role:'conditional_outcome'}
      ],
      dignityLines:[[4,0,5],[3,0,2],[6,7,8,9]], dependencies:[[0,1],[3,0,2],[4,0,5],[6,7,8,9],[8,9]], compatibilityEdges:[[0,1]],
      capabilities:{state:1, existence:.75, cause:1, guidance:.75, trajectory:1, outcome:1, timing:.5, comparison:.3, annual:.2, dyad:.55, domains:.5, hidden:1, external:1, location:.75}
    },
    tree_of_life: {
      id:'tree_of_life', label:'生命之樹', count:10, layoutSource:'後世卡巴拉觀測布局；不得冒充 Book T 原創占卜程序',
      slots:new Array(9).fill(null).map(function(){return {authority:'structural',role:'qabalistic_layer'};}).concat([{authority:'outcome',role:'material_manifestation'}]),
      dignityLines:[[1,3,6],[2,4,7],[0,5,8,9]], dependencies:[[1,3,6],[2,4,7],[0,5,8,9]], compatibilityEdges:[],
      capabilities:{state:.9, existence:.35, cause:.8, guidance:.7, trajectory:.55, outcome:.5, timing:.1, comparison:.1, annual:.1, dyad:.2, domains:.45, hidden:1, external:.35, location:.15}
    },
    zodiac: {
      id:'zodiac', label:'黃道十二宮', count:13, layoutSource:'後世占星宮位觀測布局；不得冒充 Book T 原創占卜程序',
      slots:new Array(12).fill(null).map(function(){return {authority:'domain',role:'house_domain'};}).concat([{authority:'synthesis',role:'annual_synthesis'}]),
      dignityLines:[], dependencies:[[0,6],[1,7],[2,8],[3,9],[4,10],[5,11]], compatibilityEdges:[],
      capabilities:{state:1, existence:.3, cause:.45, guidance:.55, trajectory:.7, outcome:.35, timing:.55, comparison:.1, annual:1, dyad:.2, domains:1, hidden:.55, external:.65, location:.05}
    },
    minor_arcana: {
      id:'minor_arcana', label:'小阿卡那專題牌陣', count:7, layoutSource:'後世觀測布局；牌組限制為小阿卡那，牌義仍採 Book T',
      slots:[
        {authority:'state',role:'current_state'},{authority:'cause',role:'cause'},{authority:'obstacle',role:'constraint'},
        {authority:'environment',role:'external_condition'},{authority:'state',role:'available_resource'},
        {authority:'advice',role:'intervention'},{authority:'outcome',role:'conditional_outcome'}
      ],
      dignityLines:[[1,0,2],[3,4,5,6]], dependencies:[[1,0,2],[3,4,5,6]], compatibilityEdges:[],
      capabilities:{state:1, existence:.8, cause:.75, guidance:.9, trajectory:.75, outcome:.8, timing:.35, comparison:.25, annual:.05, dyad:.2, domains:.1, hidden:.4, external:.55, location:1}
    },
    fifteen_card: {
      id:'fifteen_card', label:'金色黎明衍生十五張', count:15, layoutSource:'後世金色黎明衍生布局；牌義與尊貴仍鎖定 Book T',
      slots:[
        {authority:'state',role:'core_state'}, {authority:'state',role:'core_support'}, {authority:'state',role:'core_support'},
        {authority:'development',role:'natural_path'}, {authority:'development',role:'alternative_path'},
        {authority:'advice',role:'decision_basis'}, {authority:'structural',role:'uncontrolled_condition'},
        {authority:'development',role:'natural_path'}, {authority:'development',role:'alternative_path'},
        {authority:'advice',role:'decision_basis'}, {authority:'structural',role:'uncontrolled_condition'},
        {authority:'development',role:'natural_path'}, {authority:'development',role:'alternative_path'},
        {authority:'advice',role:'decision_basis'}, {authority:'structural',role:'uncontrolled_condition'}
      ],
      dignityLines:[[1,0,2],[3,7,11],[12,8,4],[5,9,13],[6,10,14]], dependencies:[[1,0,2],[3,7,11],[12,8,4],[5,9,13],[6,10,14]], compatibilityEdges:[],
      capabilities:{state:1, existence:.4, cause:.75, guidance:.65, trajectory:.8, outcome:.65, timing:.3, comparison:.45, annual:.55, dyad:.35, domains:1, hidden:.85, external:.85, location:.3}
    },
    mathers_21: {
      id:'mathers_21', label:'Mathers 二十一張', count:21, layoutSource:'Mathers 歷史布局；牌義與尊貴仍鎖定 Book T',
      slots:new Array(21).fill(null).map(function(){return {authority:'structural',role:'ordered_narrative'};}),
      dignityLines:[range(0,7),range(7,14),range(14,21)], dependencies:[range(0,7),range(7,14),range(14,21)], compatibilityEdges:[],
      capabilities:{state:.9, existence:.4, cause:.65, guidance:.45, trajectory:1, outcome:.65, timing:.6, comparison:.15, annual:.35, dyad:.3, domains:.6, hidden:.65, external:.55, location:.15}
    },
    mathers_horseshoe: {
      id:'mathers_horseshoe', label:'Mathers 五十四張', count:54, layoutSource:'Mathers 歷史布局；牌義與尊貴仍鎖定 Book T',
      slots:new Array(54).fill(null).map(function(){return {authority:'structural',role:'ordered_group'};}),
      dignityLines:[range(0,26),range(26,43),range(43,54)], dependencies:[range(0,26),range(26,43),range(43,54)], compatibilityEdges:[],
      capabilities:{state:1, existence:.35, cause:.85, guidance:.6, trajectory:.9, outcome:.7, timing:.5, comparison:.2, annual:.75, dyad:.4, domains:1, hidden:1, external:1, location:.75}
    },
    ootk: {
      id:'ootk', label:'Opening of the Key 五次操作', count:null, layoutSource:'Golden Dawn《Book T／Liber T》程序',
      slots:new Array(5).fill(null).map(function(){return {authority:'stage',role:'operation_stage'};}),
      dignityLines:[], dependencies:[], compatibilityEdges:[],
      capabilities:{state:1, existence:.75, cause:.75, guidance:.65, trajectory:1, outcome:1, timing:.45, comparison:.4, annual:.45, dyad:.45, domains:.8, hidden:1, external:1, location:.75}
    }
  };

  function method(id) { return clone(METHODS[id] || null); }
  function dignityLines(id, count) { var m = METHODS[id]; return m ? clone(m.dignityLines || []) : (count ? [range(0,count)] : []); }
  function dependencyGroups(id, count) { var m = METHODS[id]; return m ? clone(m.dependencies || []) : (count ? [range(0,count)] : []); }
  function compatibilityEdges(id) { var m = METHODS[id]; return m ? clone(m.compatibilityEdges || []) : []; }

  function detectScopes(q, referenceDate) {
    var d = dateParts(referenceDate), out = [], idx = 0;
    function add(surface, kind, resolved) {
      if (!surface) return;
      var key = surface + '|' + kind;
      if (out.some(function (x) { return x._key === key; })) return;
      out.push({ id:'S'+pad(++idx,2), surface:surface, source:surface, type:'time_scope', kind:kind, resolved:resolved || null, _key:key });
    }
    var yearTerms = [
      {re:/今年/g, off:0, kind:'calendar_year'}, {re:/明年/g, off:1, kind:'calendar_year'}, {re:/去年/g, off:-1, kind:'calendar_year'}
    ];
    yearTerms.forEach(function (x) {
      var m; while ((m=x.re.exec(q))) {
        var y=d.year+x.off;
        add(m[0],x.kind,{label:String(y)+'年',start:y+'-01-01',end:y+'-12-31',anchor:d.iso});
      }
    });
    var ym, exactYearSurfaces = Object.create(null);
    var yre=/(20\d{2})\s*年/g;
    while ((ym=yre.exec(q))) {
      var yy=Number(ym[1]), surf=ym[0]; exactYearSurfaces[surf]=true;
      add(surf,'calendar_year',{label:yy+'年',start:yy+'-01-01',end:yy+'-12-31',anchor:d.iso});
    }
    var rel = q.match(/(?:本月|這個月|下個月|本週|這週|下週|今天|明天|後天|近期|短期|長期|未來|過去|目前|現在|年底前|年內|月底前|\d+\s*(?:天|週|個月)(?:內|後|前)?|\d+\s*年(?:內|後|前))/g) || [];
    rel.forEach(function (surface) {
      if (exactYearSurfaces[surface]) return;
      add(surface,'relative_scope',{label:surface,anchor:d.iso});
    });
    return out.map(function (x) { delete x._key; return x; });
  }

  function detectDomains(q) {
    var defs = [
      ['relationship',/感情|愛情|婚姻|桃花|戀愛|復合|伴侶|關係|love|romance|relationship|marriage/i],
      ['career',/工作|事業|職場|轉職|離職|升遷|副業|創業|生意|career|job|work|business/i],
      ['finance',/財運|金錢|財務|投資|收入|營業額|薪水|獲利|利潤|money|finance|income|revenue/i],
      ['health',/健康|身體|疾病|手術|藥物|睡眠|health|illness|surgery|sleep/i],
      ['family',/家庭|家人|父母|小孩|子女|家宅|family|parents|children|home/i],
      ['study',/學業|考試|進修|學習|證照|study|exam|school|certificate|learning/i],
      ['legal',/法律|訴訟|官司|合約|law|legal|court case|contract/i],
      ['travel',/旅行|出國|搬家|移動|行程|travel|move|relocate/i]
    ];
    return defs.filter(function (d) { return d[1].test(q); }).map(function (d) { return d[0]; });
  }

  function isNominalWeiHe(q) {
    return /(?:運勢|走向|結果|結局|狀況|情形|前景|發展|現況|狀態|影響|意義|主題)為何[？?]?$/i.test(q);
  }
  function detectIntent(q, scopes, domains) {
    var compact=q.replace(/\s/g,'');
    var causal = /為什麼|什麼原因|原因(?:是|為何|在哪)|根源|問題出在|怎麼會|why\b|root cause/i.test(q)
      || /(?:^|[，。！？?])為何(?:會|總是|一直|無法|不能|沒有|不|變|發生|出現|造成)/.test(q);
    if (isNominalWeiHe(compact)) causal=false;
    var choice = /還是|或者|或是|二選一|哪一個|哪個比較|choose between|which option|\bvs\.?\b|\bversus\b/i.test(q);
    var timing = /什麼時候|何時|幾時|哪一天|幾月|多久|要等|時間點|when\b|how long|what date|which month/i.test(q);
    var advice = /怎麼做|怎麼辦|如何改善|建議|策略|方法|該怎麼|下一步|應如何|怎麼找|如何找|what should|what can i do|advice|strategy/i.test(q);
    var hidden = /忽略|盲點|隱藏|背後|未察覺|不知道的|overlook|hidden influence|blind spot/i.test(q);
    var external = /外在|環境|市場|公司環境|家庭影響|別人影響|他人態度|external|environment|market condition/i.test(q);
    var pattern = /為什麼一直|總是|每次都|反覆|重複|循環|模式|always|every time|repeating pattern/i.test(q);
    var spiritual = /靈性|業力|課題|天命|使命|潛意識|靈魂|內在陰影|spiritual|karma|soul|life purpose|subconscious/i.test(q);
    var narrative = /來龍去脈|前因後果|從頭到尾|始末|完整歷程|過去.{0,8}現在.{0,8}未來|whole story|from the beginning|past.*present.*future/i.test(q);
    var exhaustive = /全部攤開|最完整|徹底|人生大局|整個人生|所有人生面向|most exhaustive|complete life reading|everything about my life/i.test(q);
    var deepOverview = /完整|全面|深入|詳細|各方面|全局|大局|所有影響|整體局勢|comprehensive|full picture|in depth/i.test(q);
    var practical = /(?:東西|鑰匙|錢包|手機|文件|證件).{0,10}(?:遺失|不見|掉|找不到|在哪|位置)|(?:遺失|不見|掉了|找不到).{0,10}(?:東西|鑰匙|錢包|手機|文件|證件)|包裹|快遞|訂單|報稅|證件|維修|退貨|寄件|出貨|lost item|package|delivery|repair|refund/i.test(q);
    var location = /在哪(?:裡|邊)?|位置|何處|哪個方向|where\b|location/i.test(q);
    var yearScope=(scopes||[]).some(function(s){return s.kind==='calendar_year';});
    var domainCount=(domains||[]).length;
    var annualWords=/流年|全年|整年|一整年|年度|年運|整體運勢|各方面運勢|各領域運勢|overall outlook|yearly|annual/i;
    var bareYearFortune=yearScope && domainCount===0 && /(?:今年|明年|20\d{2}年).{0,8}運勢(?:為何|如何|怎樣|怎麼樣)?/i.test(q);
    var annual = yearScope && (annualWords.test(q) || bareYearFortune);
    var annualSingleDomain = yearScope && domainCount===1 && !annual;
    var knownDyad = /我(?:和|與|跟).{1,24}|(?:對方|他|她|現任|前任|伴侶|配偶|男友|女友|主管|老闆|同事|朋友|客戶).{0,12}(?:對我|跟我|和我|與我|怎麼看我|的態度|的想法|的關係)|between us|my partner|my ex|my boss/i.test(q);
    var unknownPerson = /有人|某人|哪個人|誰會|新對象|未來對象|桃花|暗戀我|喜歡我嗎|追求我|future partner|anyone likes me|who will/i.test(q) && !knownDyad;
    var yesNo = /嗎[？?]?\s*$|^(?:會不會|有沒有|該不該|可不可以|能不能|能否|是否|可否|是不是|適不適合|要不要)|will\b|can\b|should\b|is\b|are\b/i.test(q);
    var descriptive = isNominalWeiHe(compact) || /如何[？?]?$|怎麼樣[？?]?$|怎樣[？?]?$|狀況如何|運勢如何|走向如何|what is .* like|how is/i.test(q);
    var multiDomain=domainCount>=2 && /整體|全面|各方面|一起看|都看|同時|以及|和|與|both|all areas|together/i.test(q);
    return {causal:causal,choice:choice,timing:timing,advice:advice,hidden:hidden,external:external,pattern:pattern,spiritual:spiritual,narrative:narrative,exhaustive:exhaustive,deepOverview:deepOverview,practical:practical,location:location,annual:annual,annualSingleDomain:annualSingleDomain,knownDyad:knownDyad,unknownPerson:unknownPerson,yesNo:yesNo,descriptive:descriptive,multiDomain:multiDomain};
  }

  function cleanOperand(value, scopes, side) {
    var out=text(value).replace(/[？?。！!，,]+$/,'');
    (scopes||[]).forEach(function(s){out=out.split(s.surface).join('');});
    if (side==='left') out=out.replace(/^(?:我|本人)(?:的)?/,'');
    out=out.replace(/^(?:我)?(?:該|應該|要不要|是否|能否|可否)/,'');
    out=out.replace(/(?:一定|必然|應該|可能|會不會|能不能|可不可以|是否|有沒有|可以|能夠|會|能)+$/g,'');
    return text(out);
  }

  function splitMetric(operand) {
    var metricRe=/^(.+?)(?:的)?(收入|薪水|營收|獲利|利潤|成本|價格|金額|數量|人數|成績|表現|速度|高度|重量|價值|程度)$/;
    var m=text(operand).match(metricRe);
    return m ? {entity:text(m[1]),metric:text(m[2])} : {entity:text(operand),metric:''};
  }

  function detectRelation(q, scopes) {
    var patterns=[
      {re:/(.{1,48}?)\s*(超過|高於|大於|多於)\s*(.{1,48}?)(?:嗎|呢|？|\?|$)/,op:'gt'},
      {re:/(.{1,48}?)\s*(低於|小於|少於|不及)\s*(.{1,48}?)(?:嗎|呢|？|\?|$)/,op:'lt'},
      {re:/(.{1,48}?)\s*(等於|相同於|一樣多|持平)\s*(.{1,48}?)(?:嗎|呢|？|\?|$)/,op:'eq'},
      {re:/(.{1,36}?)\s*比\s*(.{1,36}?)\s*(更|較)(.{1,20}?)(?:嗎|呢|？|\?|$)/,op:'comparative'}
    ];
    for(var i=0;i<patterns.length;i+=1){
      var m=q.match(patterns[i].re); if(!m)continue;
      if(patterns[i].op==='comparative'){
        return {id:'R01',type:'comparison',operator:'comparative',operatorText:m[3]+m[4],left:cleanOperand(m[1],scopes,'left'),right:cleanOperand(m[2],scopes,'right'),scale:text(m[4]),source:m[0]};
      }
      var rawLeft=cleanOperand(m[1],scopes,'left'),rawRight=cleanOperand(m[3],scopes,'right');
      var lm=splitMetric(rawLeft),rm=splitMetric(rawRight),metric=lm.metric||rm.metric||'model_resolve_same_scale';
      var left=lm.entity,right=rm.entity;
      if (!left && rawLeft) left=rawLeft;
      if (!right && rawRight) right=rawRight;
      return {id:'R01',type:'threshold_or_order',operator:patterns[i].op,operatorText:m[2],left:left,right:right,scale:metric,source:m[0]};
    }
    var c=q.match(/(.{1,36}?)\s*(?:還是|或是|或者|\bor\b)\s*(.{1,36}?)(?:比較|較|更)?(?:好|適合|有利|可行|嗎|呢|？|\?|$)/i);
    if(c)return {id:'R01',type:'alternative_comparison',operator:'choose',operatorText:'還是',left:cleanOperand(c[1],scopes,'left'),right:cleanOperand(c[2],scopes,'right'),scale:'suitability',source:c[0]};
    return null;
  }

  function queryTarget(q, scopes, intent) {
    var core=q.replace(/[？?。！!]$/,'');
    (scopes||[]).forEach(function(s){core=core.split(s.surface).join('');});
    core=core.replace(/^(?:我|本人)(?:的)?/,'');
    core=core.replace(/^(?:請|幫我|請幫我|想問|我想問)\s*/,'');
    core=core.replace(/^想(?:要)?(?:完整|全面|深入|詳細)?(?:知道|了解|看看|詢問|問)\s*/,'');
    core=core.replace(/^把(?:我|本人)?(?:的)?\s*/,'');
    if(intent.causal)core=core.replace(/^(?:為什麼|為何|什麼原因|怎麼會)/,'');
    if(intent.timing){core=core.replace(/^(?:什麼時候|何時|幾時|多久)/,'');core=core.replace(/^(?:會|能|可以|可能)/,'');}
    core=core.replace(/(?:為何|如何|怎麼樣|怎樣|是什麼|會怎樣|會如何|會怎麼發展|嗎|呢)$/,'');
    core=core.replace(/(?:徹底)?攤開$/,'');
    if(intent.location)core=core.replace(/(?:在)?哪(?:裡|邊)|何處|什麼位置|哪個方向/g,'位置');
    if(intent.advice)core=core.replace(/(?:我)?(?:該|應該)?(?:怎麼做|怎麼辦|如何改善|下一步|怎麼找|如何找)$/,'');
    return text(core)||'整體事件／狀態';
  }

  function compileQuestion(question, options) {
    options=options||{};
    var q=normalize(question)||'（未提供明確問題）';
    var scopes=detectScopes(q,options.referenceDate);
    var domains=detectDomains(q);
    var intent=detectIntent(q,scopes,domains);
    var relation=detectRelation(q,scopes);
    var atoms=[],entities=[{id:'QUERENT',type:'querent',source:'問卜者'}],constraints=[],assumptions=[];
    function atom(kind,value,role,source,implicit){
      value=text(value); if(!value)return;
      atoms.push({id:'A'+pad(atoms.length+1,2),kind:kind,text:value,source:text(source||value),essential:true,eventId:'QUERY_EVENT',role:role,implicit:!!implicit});
    }
    var explicitThird = q.match(/^([^，。！？?]{1,20}?)(?:的)(?:今年|明年|未來|目前|現在)?(?:運勢|狀況|感情|工作|事業|健康|財運)/);
    var actor='QUERENT';
    if(explicitThird && !/^我$|^本人$/.test(text(explicitThird[1]))){
      actor='ACTOR_1'; entities.push({id:actor,type:'query_explicit_actor',surface:text(explicitThird[1]),source:explicitThird[1]}); atom('actor',text(explicitThird[1]),'actor',explicitThird[1],false);
    } else {
      var implicitActor=!/^(?:我|本人)/.test(q);
      atom('actor','問卜者本人','actor',implicitActor?'語境預設問卜者':'我',implicitActor);
      if(implicitActor) assumptions.push({id:'AS01',type:'deictic_subject_resolution',value:'省略主詞依占卜語境解析為問卜者本人',status:'explicitly_marked'});
    }

    var roles={actor:actor,target:'TARGET_STATE',leftOperand:'',rightOperand:'',attribute:'',comparator:'',queryOperator:''};
    var eventType='qualitative_state_query', predicate='describe_state';
    if(relation){
      if(relation.type==='alternative_comparison'){
        eventType='alternative_comparison';predicate='compare_branches';
        entities.push({id:'REL_LEFT',type:'query_explicit_operand',surface:relation.left,source:relation.left});
        entities.push({id:'REL_RIGHT',type:'query_explicit_operand',surface:relation.right,source:relation.right});
        roles.leftOperand='REL_LEFT';roles.rightOperand='REL_RIGHT';roles.comparator=relation.operator;roles.attribute=relation.scale;
        atom('left_operand',relation.left,'leftOperand',relation.left);atom('comparator',relation.operatorText,'comparator',relation.source);atom('right_operand',relation.right,'rightOperand',relation.right);atom('measured_attribute',relation.scale,'attribute',relation.scale);
      }else{
        eventType='query_bound_relational_event';predicate='compare_on_same_scale';
        entities.push({id:'REL_LEFT',type:'query_explicit_operand',surface:relation.left,source:relation.left});
        entities.push({id:'REL_RIGHT',type:'query_explicit_operand',surface:relation.right,source:relation.right});
        roles.leftOperand='REL_LEFT';roles.rightOperand='REL_RIGHT';roles.comparator=relation.operator;roles.attribute=relation.scale;
        atom('left_operand',relation.left,'leftOperand',relation.left);atom('measured_attribute',relation.scale,'attribute',relation.source);atom('comparator',relation.operatorText,'comparator',relation.operatorText);atom('right_operand',relation.right,'rightOperand',relation.right);
      }
    }else{
      var target=queryTarget(q,scopes,intent);entities.push({id:'TARGET_STATE',type:'query_target',surface:target,source:target});roles.target='TARGET_STATE';atom('state_target',target,'target',target);
      var op='qualitative_description';
      if(intent.causal)op='cause_explanation';else if(intent.timing)op='relative_timing';else if(intent.location)op='location_guidance';else if(intent.advice)op='action_guidance';else if(intent.yesNo)op='truth_or_realization';
      roles.queryOperator=op;atom('query_operator',op,'queryOperator',q);
    }
    var modality=(q.match(/(?:一定|必然|應該|可能|會不會|能不能|可不可以|是否|有沒有|可以|能夠|會|能)/)||[])[0];
    if(modality)atom('modality',modality,'modality',modality);
    scopes.forEach(function(s){
      atom('scope',s.resolved&&s.resolved.label?s.surface+'〔'+s.resolved.label+'〕':s.surface,'timeScope',s.source);
      constraints.push({id:'C'+pad(constraints.length+1,2),type:'scope',surface:s.surface,text:s.surface,resolved:clone(s.resolved),attach:'QUERY_EVENT.timeScope',attachTo:'QUERY_EVENT.timeScope',source:s.source});
    });
    var neg=(q.match(/(?:不會|不能|沒有|未曾|尚未|不要|不再|不是|不成立)/g)||[]);neg.forEach(function(x){atom('polarity',x,'polarity',x);});
    var excl=(q.match(/(?:除了|排除|不含|非)[^，。！？?]{1,24}/g)||[]);excl.forEach(function(x){atom('exclusion',x,'exclusion',x);});

    var dims=[{id:'event_or_state',label:'核心事件／狀態',source:q}];
    function dim(id,label,source){if(!dims.some(function(d){return d.id===id;}))dims.push({id:id,label:label,source:source||q});}
    if(intent.descriptive)dim('description','定性描述');
    if(intent.causal)dim('cause','原因／機制');
    if(intent.advice)dim('guidance','方法／建議');
    if(intent.timing){dim('trajectory','相對時間與發展');dim('timing','相對時序');}
    if(intent.location)dim('location','位置／尋物方向');
    if(intent.yesNo){dim('existence','存在／成立與否');dim('modality','可能性／能力模態');}
    if(relation){if(relation.type==='alternative_comparison'){dim('comparison','比較關係');dim('relative_order','相對排序');}else{dim('relational_event','比較命題本身是否成立');dim('threshold_crossing','門檻跨越');}}
    if(/多少錢|多少(?:收入|薪水|營收|獲利|成本)|具體(?:金額|數字|數值)|確切(?:金額|數字|數值)|價位|百分比|幾成|機率/.test(q))dim('exact_value','精確數值／金額');
    if(/幾個|幾位|多少人|人數|數量/.test(q))dim('cardinality','現實數量');
    if(/幾歲|年齡/.test(q))dim('exact_age','精確年齡');
    if(/誰|哪位|哪一個人|姓名|名字|身分|是什麼人/.test(q))dim('identity','人物身分');
    if(/未來|走向|結果|發展|最後|結局|之後|會變成/.test(q)||intent.annual)dim('trajectory','發展／結果');
    if(/成長|增加|上升|提升|改善|下降|減少|衰退|惡化/.test(q))dim('trend','增減／變化趨勢');
    if(scopes.length)dim('time_scope','使用者明示期限／範圍',scopes.map(function(s){return s.surface;}).join('、'));
    if(intent.annual)dim('annual_overview','年度跨領域總覽');
    if(intent.multiDomain)dim('multi_domain','多領域並行觀測');

    var event={id:'QUERY_EVENT',type:eventType,surface:q,predicate:predicate,roles:roles,modality:modality||'open',timeScope:scopes.map(function(s){return s.surface;}),resolvedTimeScopes:clone(scopes),relationIds:relation?[relation.id]:[]};
    var canonicalParts=atoms.map(function(a){return a.role+'='+a.text;});
    var canonicalSignature=canonicalParts.join('|');
    var requiredRoleCounts=Object.create(null);atoms.forEach(function(a){requiredRoleCounts[a.role]=(requiredRoleCounts[a.role]||0)+1;});
    var deletion=atoms.map(function(a){
      var remaining=atoms.filter(function(x){return x.id!==a.id;});
      var remainingSignature=remaining.map(function(x){return x.role+'='+x.text;}).join('|');
      var equivalentRemains=remaining.some(function(x){return x.role===a.role&&x.text===a.text;});
      return {atomId:a.id,removedRole:a.role,changesTruthConditions:remainingSignature!==canonicalSignature&&!equivalentRemains};
    });
    var reconstructed;
    if(relation){
      var scopePrefix=scopes.map(function(s){return s.surface;}).join('');
      var attr=relation.scale&&relation.scale!=='model_resolve_same_scale'?relation.scale:'';
      reconstructed=scopePrefix+relation.left+(attr?'的'+attr:'')+(modality||'')+relation.operatorText+relation.right+(attr?'的'+attr:'')+'嗎';
    }else{
      reconstructed=(scopes.map(function(s){return s.surface;}).join(''))+queryTarget(q,scopes,intent)+(intent.causal?'的原因為何':intent.timing?'的相對時序為何':intent.location?'的位置為何':intent.advice?'應如何處理':'如何');
    }
    var hasActorAtom=atoms.some(function(a){return a.role==='actor';});
    var hasEventShape=relation
      ? ['leftOperand','rightOperand','attribute','comparator'].every(function(role){return atoms.some(function(a){return a.role===role;});})
      : ['target','queryOperator'].every(function(role){return atoms.some(function(a){return a.role===role;});});
    var noWholeQuestionAtom=atoms.every(function(a){return normalize(a.text)!==q;});
    var allDeletionSensitive=deletion.every(function(x){return x.changesTruthConditions;});
    var graph={schema:'typed_query_graph/5',events:[event],entities:entities,relations:relation?[relation]:[],constraints:constraints,assumptions:assumptions,requiredAtoms:atoms,roundTripReconstruction:reconstructed,canonicalSemanticSignature:canonicalSignature,compilerStatus:(hasActorAtom&&hasEventShape&&noWholeQuestionAtom&&allDeletionSensitive)?'validated_atomized':'invalid_atomization',validation:{roundTripCompatible:hasActorAtom&&hasEventShape&&noWholeQuestionAtom&&!!reconstructed,deletionSensitivity:deletion,everyDeletionChangesTruthConditions:allDeletionSensitive,noAddedPremise:assumptions.every(function(a){return a.status==='explicitly_marked';}),uniqueAtomIds:new Set(atoms.map(function(a){return a.id;})).size===atoms.length,noWholeQuestionAtom:noWholeQuestionAtom,allAtomsBound:atoms.every(function(a){return a.eventId==='QUERY_EVENT'&&!!a.role;})},completionRules:['每個會改變答案真值的自然語言成分都必須成為 essential atom。','每個 atom 必須綁定 eventId 與 role／scope。','未知人物只能建立 UNBOUND_ENTITY；原句未明示的前提只能列為 assumption。'],validationRules:{roundTrip:'依角色圖重建的命題須與原句雙向相容；語序可規範化，但主體、目標、比較雙方、尺度、模態與期限不得改變。',deletionSensitivity:'逐一刪除 essential atom；刪除任何原子都必須改變真值條件。',sameEventTest:'同一完整事件的角色、作用、結果與期限共享 QUERY_EVENT。',noAddedPremise:'原句未含且牌面未建立的前提不得進入完整命題。'},atomizationRequirement:'主體、狀態／事件目標、疑問運算子、比較兩端、尺度、比較子、模態、期限、否定與排除皆須獨立成為 essential atom；完整原句只作 surface。'};
    var features=Object.assign({},intent,{domains:domains,domainCount:domains.length,relationType:relation?relation.type:null,hasRelation:!!relation,hasThreshold:!!(relation&&relation.type==='threshold_or_order'),referenceDate:dateParts(options.referenceDate).iso,questionLength:q.length});
    return {originalQuestion:q,normalizedQuestion:q,requestedDimensions:dims,explicitScopes:scopes,relations:relation?[relation]:[],knownCounterpart:intent.knownDyad,queryGraph:graph,features:features};
  }

  function explicitSpread(q) {
    var rules=[
      ['mathers_horseshoe',/Mathers.*(?:第一法|古法|horseshoe|馬蹄)|五十四.?張|54.?張/i],
      ['mathers_21',/Mathers.*(?:第二法|牌陣)|三排七|二十一.?張|21.?張/i],
      ['fifteen_card',/金色黎明.*十五|英式.*牌陣|fifteen.?card|十五.?張/i],
      ['minor_arcana',/小阿卡那|小牌牌陣|minor arcana/i],['celtic_cross',/凱爾特|celtic/i],
      ['tree_of_life',/生命之樹|卡巴拉牌陣|tree of life/i],['zodiac',/(?:黃道|十二宮|星座)牌陣|zodiac/i],
      ['horseshoe',/七張馬蹄|馬蹄形牌陣|seven.?card horseshoe/i],['relationship',/關係牌陣|relationship spread/i],
      ['timeline',/時間線牌陣|timeline spread/i],['cross',/十字牌陣|cross spread/i],
      ['three_card',/(?:三牌|三張牌)陣|three.?card spread/i],['five_card',/(?:五牌|五張牌)陣|five.?card spread/i],
      ['either_or',/二選一牌陣|either.?or spread/i],['ootk',/開鑰之法|opening of the key/i]
    ];
    for(var i=0;i<rules.length;i+=1)if(rules[i][1].test(q))return rules[i][0];
    return '';
  }

  function routeQuestion(input, options) {
    options=options||{};
    var compiled=typeof input==='string'?compileQuestion(input,options):input;
    var q=compiled.normalizedQuestion||compiled.originalQuestion||'';
    var f=compiled.features||{};
    var explicit=explicitSpread(q);
    if(explicit)return {version:VERSION,engine:'foundation_router',spreadId:explicit,reason:'使用者明確指定牌陣',confidence:1,selectedBy:'explicit',compiledQuestion:compiled,candidates:[{id:explicit,score:999}]};

    var choiceRelation=compiled.relations&&compiled.relations.some(function(r){return r.type==='alternative_comparison';});
    var selected='three_card',reason='問題是單一低複雜度快問，三個階段已足以回答';
    if(f.exhaustive){selected='mathers_horseshoe';reason='問題明示人生級、全部攤開的最完整盤點';}
    else if(f.narrative){selected='mathers_21';reason='問題要求完整來龍去脈與長敘事';}
    else if(f.annual){selected='zodiac';reason='問題要求曆年範圍的整體運勢，需以生活領域分開觀測';}
    else if(choiceRelation||f.choice){selected='either_or';reason='問題包含兩條明示選項，需建立對稱且互不混淆的分支';}
    else if(f.knownDyad){selected='relationship';reason='問題有已知雙方，需分開觀測問卜者、對方與關係本身';}
    else if(f.timing){selected='timeline';reason='問題要求相對時序、等待長度或轉折階段';}
    else if(f.practical){selected='minor_arcana';reason='問題是具體日常事件，適合使用實務導向的小阿卡那結構';}
    else if(f.pattern||f.spiritual){selected='tree_of_life';reason='問題聚焦重複模式、深層內在或靈性結構';}
    else if(f.multiDomain){selected='fifteen_card';reason='問題明示多個生活領域，需要並行的多面向結構';}
    else if(f.hidden||f.external){selected='horseshoe';reason='問題要求隱藏因素或外在環境，需保留環境與阻礙通道';}
    else if(f.deepOverview){selected='celtic_cross';reason='問題是單一主題的高複雜度全局';}
    else if(f.causal&&(f.advice||/卡住|阻礙|衝突|困境|一直/.test(q))){selected='cross';reason='問題核心是形成機制、衝突或卡點，且需要辨識介入方向';}
    else if(f.causal||f.advice||f.hasThreshold||f.annualSingleDomain){selected='five_card';reason='問題需要現況、形成機制、限制、介入與條件性發展';}

    var requirements={state:1,existence:f.yesNo?1:.2,cause:f.causal?1:.1,guidance:f.advice?1:.1,trajectory:(f.timing||f.annual||f.annualSingleDomain||/未來|走向|結果|發展/.test(q))?1:.3,timing:f.timing?1:0,comparison:(choiceRelation||f.choice)?1:(f.hasThreshold?.5:0),annual:f.annual?1:0,dyad:f.knownDyad?1:0,domains:f.multiDomain||f.annual?1:0,hidden:f.hidden?1:0,external:f.external?1:0,location:f.location?1:0};
    var candidates=Object.keys(METHODS).filter(function(id){return id!=='ootk';}).map(function(id){
      var m=METHODS[id],score=0,total=0,covered=0;
      Object.keys(requirements).forEach(function(k){var need=requirements[k]||0;if(!need)return;var cap=(m.capabilities||{})[k]||0;score+=need*cap*10;total+=need;covered+=need*cap;});
      if(id===selected)score+=100;
      return {id:id,score:Math.round(score*100)/100,coverage:total?Math.round(covered/total*1000)/1000:0,cards:m.count};
    }).sort(function(a,b){return b.score-a.score||((a.cards||999)-(b.cards||999));});
    return {version:VERSION,engine:'foundation_router',spreadId:selected,reason:reason,confidence:.98,selectedBy:'deterministic_capability_gates',compiledQuestion:compiled,candidates:candidates.slice(0,6)};
  }

  function validateMethodRegistry() {
    var errors=[];
    var authorities={state:1,antecedent:1,development:1,cause:1,obstacle:1,interaction_force:1,advice:1,outcome:1,person_aggregate:1,environment:1,comparison:1,timeline:1,domain:1,structural:1,synthesis:1,stage:1};
    Object.keys(METHODS).forEach(function(id){
      var m=METHODS[id];
      if(m.id!==id)errors.push('id_mismatch:'+id);
      if(id!=='ootk'&&m.slots.length!==m.count)errors.push('slot_count:'+id);
      (m.slots||[]).forEach(function(slot,si){if(!authorities[slot.authority])errors.push('unknown_authority:'+id+':'+si+':'+slot.authority);});
      (m.dignityLines||[]).forEach(function(line,li){
        if(line.length<3)errors.push('dignity_line_requires_three_or_more:'+id+':'+li);
        line.forEach(function(i){if(i<0||(m.count!=null&&i>=m.count))errors.push('dignity_index:'+id+':'+i);});
      });
      (m.compatibilityEdges||[]).forEach(function(edge,ei){if(edge.length!==2)errors.push('compatibility_edge_arity:'+id+':'+ei);});
    });
    return {ok:!errors.length,errors:errors};
  }

  return {
    VERSION:VERSION, SCHEMA:SCHEMA, METHODS:METHODS,
    normalizeQuestion:normalize, compileQuestion:compileQuestion, routeQuestion:routeQuestion,
    getMethod:method, getDignityLines:dignityLines, getDependencyGroups:dependencyGroups,
    getCompatibilityEdges:compatibilityEdges, validateMethodRegistry:validateMethodRegistry
  };
});
