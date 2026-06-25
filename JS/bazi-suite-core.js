/*! bazi-suite-core.js — 靜月之光八字完整功能套件核心 v1.0.0 (2026-06-26)
 *  功能：單盤多主題、雙人情境合盤、五軸32型人格卡、可追溯提示詞。
 *  注意：此為依公開功能範圍自行實作的本地規則引擎；不含、也不冒充任何第三方未公開的私有評分或提示詞。
 */
(function (root) {
  'use strict';

  var STEMS = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
  var BRANCHES = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
  var STEM_EL = {甲:'木',乙:'木',丙:'火',丁:'火',戊:'土',己:'土',庚:'金',辛:'金',壬:'水',癸:'水'};
  var BRANCH_EL = {子:'水',丑:'土',寅:'木',卯:'木',辰:'土',巳:'火',午:'火',未:'土',申:'金',酉:'金',戌:'土',亥:'水'};
  var YINYANG = {甲:'陽',乙:'陰',丙:'陽',丁:'陰',戊:'陽',己:'陰',庚:'陽',辛:'陰',壬:'陽',癸:'陰'};
  var GENERATES = {木:'火',火:'土',土:'金',金:'水',水:'木'};
  var CONTROLS = {木:'土',土:'水',水:'火',火:'金',金:'木'};
  var STEM_COMBINE = {'甲己':'土','乙庚':'金','丙辛':'水','丁壬':'木','戊癸':'火'};
  var CLASH = {子:'午',午:'子',丑:'未',未:'丑',寅:'申',申:'寅',卯:'酉',酉:'卯',辰:'戌',戌:'辰',巳:'亥',亥:'巳'};
  var SIX_COMBINE = {子:'丑',丑:'子',寅:'亥',亥:'寅',卯:'戌',戌:'卯',辰:'酉',酉:'辰',巳:'申',申:'巳',午:'未',未:'午'};
  var SIX_COMBINE_EL = {'子丑':'土','寅亥':'木','卯戌':'火','辰酉':'金','巳申':'水','午未':'火'};
  var HARM = {子:'未',未:'子',丑:'午',午:'丑',寅:'巳',巳:'寅',卯:'辰',辰:'卯',申:'亥',亥:'申',酉:'戌',戌:'酉'};
  var DESTRUCTION = {子:'酉',酉:'子',丑:'辰',辰:'丑',寅:'亥',亥:'寅',卯:'午',午:'卯',巳:'申',申:'巳',未:'戌',戌:'未'};
  var PUNISH_PAIRS = {'寅巳':'恃勢之刑','巳申':'恃勢之刑','申寅':'恃勢之刑','丑戌':'無恩之刑','戌未':'無恩之刑','未丑':'無恩之刑','子卯':'無禮之刑','卯子':'無禮之刑'};
  var SELF_PUNISH = {辰:true,午:true,酉:true,亥:true};
  var TRINES = [
    {branches:['申','子','辰'], element:'水', name:'申子辰三合水局'},
    {branches:['亥','卯','未'], element:'木', name:'亥卯未三合木局'},
    {branches:['寅','午','戌'], element:'火', name:'寅午戌三合火局'},
    {branches:['巳','酉','丑'], element:'金', name:'巳酉丑三合金局'}
  ];
  var DIRECTIONALS = [
    {branches:['亥','子','丑'], element:'水', name:'亥子丑三會水方'},
    {branches:['寅','卯','辰'], element:'木', name:'寅卯辰三會木方'},
    {branches:['巳','午','未'], element:'火', name:'巳午未三會火方'},
    {branches:['申','酉','戌'], element:'金', name:'申酉戌三會金方'}
  ];
  var PILLAR_LABEL = {year:'年柱',month:'月柱',day:'日柱',hour:'時柱'};
  var PILLAR_ORDER = ['year','month','day','hour'];
  var ELEMENTS = ['木','火','土','金','水'];
  var CHINESE_ZODIAC = {子:'鼠',丑:'牛',寅:'虎',卯:'兔',辰:'龍',巳:'蛇',午:'馬',未:'羊',申:'猴',酉:'雞',戌:'狗',亥:'豬'};

  var SCENARIOS = [
    {id:'marriage', name:'婚戀／婚姻', roleA:'甲方', roleB:'乙方', focus:'親密需求、承諾、夫妻宮、情緒與生活節奏、長期壓力及邊界', cautions:'不得以單一日柱、生肖、合沖或分數斷定必婚、必離或外遇。'},
    {id:'business', name:'事業合夥', roleA:'發起人／夥伴A', roleB:'夥伴B', focus:'決策權、風險偏好、財務責任、執行互補、分工與退出機制', cautions:'命盤不能代替盡職調查、契約、股權與財務審查。'},
    {id:'mother_in_law', name:'婆媳關係', roleA:'婆婆', roleB:'媳婦', focus:'家庭角色、權責邊界、照顧方式、生活規則與代際壓力', cautions:'不得將十神或宮位直接等同為任何一方的人品或固定衝突。'},
    {id:'best_friends', name:'閨蜜／摯友', roleA:'朋友A', roleB:'朋友B', focus:'信任、支持方式、社交節奏、競爭感、情緒承接與長期友誼', cautions:'不以比劫、刑害等單一訊號直接判定背叛或嫉妒。'},
    {id:'father_son', name:'父子關係', roleA:'父親', roleB:'兒子', focus:'規範、期待、獨立、權威、教養方式與成年後邊界', cautions:'不得把父星、子女宮或官殺直接套成已發生的家庭事件。'},
    {id:'mother_son', name:'母子關係', roleA:'母親', roleB:'兒子', focus:'保護、依附、情緒照顧、控制感、獨立與成年後邊界', cautions:'不得以印星多寡直接斷定溺愛、冷漠或心理疾病。'},
    {id:'friendship', name:'一般朋友', roleA:'朋友A', roleB:'朋友B', focus:'溝通、互惠、距離感、資源交換、衝突修復與相處成本', cautions:'不以單一合沖判定朋友一定可靠或一定有害。'},
    {id:'boss_employee', name:'主管與部屬', roleA:'主管', roleB:'部屬', focus:'授權、回報、規則、績效壓力、溝通與權責不對稱', cautions:'命盤不能代替勞動法、績效資料與實際管理紀錄。'}
  ];

  var LENSES = {
    chart: {name:'純排盤', question:'請校核排盤事實，清楚列出四柱、藏干、十神、十二長生、納音、空亡、起運、大運與原局作用；不延伸具體人生事件。'},
    general: {name:'綜合命盤', question:'請從月令、日主根氣、全局制化、格局候選、扶抑、調候、大運與流年，給出平衡且可驗證的綜合判讀。'},
    career: {name:'事業方向', question:'請聚焦職涯結構、適合的工作模式、權責承擔、組織與自主性的取捨、升遷或轉型節奏；不得憑空指定職業。'},
    wealth: {name:'財富策略', question:'請聚焦財星、食傷生財、官殺與承擔能力、現金流風險、大運流年節奏，提出保守且可執行的財務策略；不得保證致富或編造金額。'},
    love: {name:'感情婚姻', question:'請聚焦日支、財官十神、親密需求、界線與關係節奏，並結合大運流年看較可能的關係主題；不得斷定必婚、必離或特定對象。'},
    annual: {name:'流年趨勢', question:'請以精確大運交界和立春流年區間，說明未來四個立春年度的主題、觸發與風險；不得編造月份、事件或機率。'}
  };

  function own(obj, key) { return Object.prototype.hasOwnProperty.call(obj || {}, key); }
  function uniq(arr) { return Array.from(new Set((arr || []).filter(Boolean))); }
  function pairKey(a, b) { return a + b; }
  function unorderedPairKey(a, b) { return [a,b].sort(function(x,y){return STEMS.indexOf(x)-STEMS.indexOf(y);}).join(''); }
  function hasAll(list, needed) { return needed.every(function(x){ return list.indexOf(x) >= 0; }); }
  function safeArray(x) { return Array.isArray(x) ? x : []; }
  function safeText(x, fallback) { return x == null || x === '' ? (fallback || '') : String(x); }
  function escapeLine(x) { return safeText(x).replace(/[\r\n]+/g, ' ').trim(); }
  function fmtDate(x) { return safeText(x, '未提供'); }

  function tenGod(dayMaster, targetStem) {
    var d = STEM_EL[dayMaster], t = STEM_EL[targetStem];
    if (!d || !t) return '—';
    var samePolarity = YINYANG[dayMaster] === YINYANG[targetStem];
    if (d === t) return samePolarity ? '比肩' : '劫財';
    if (GENERATES[d] === t) return samePolarity ? '食神' : '傷官';
    if (CONTROLS[d] === t) return samePolarity ? '偏財' : '正財';
    if (CONTROLS[t] === d) return samePolarity ? '七殺' : '正官';
    if (GENERATES[t] === d) return samePolarity ? '偏印' : '正印';
    return '—';
  }

  function elementRelation(fromEl, toEl) {
    if (!fromEl || !toEl) return {type:'unknown', label:'未知'};
    if (fromEl === toEl) return {type:'same', label:'同五行'};
    if (GENERATES[fromEl] === toEl) return {type:'generate', label:fromEl + '生' + toEl};
    if (GENERATES[toEl] === fromEl) return {type:'receive', label:toEl + '生' + fromEl};
    if (CONTROLS[fromEl] === toEl) return {type:'control', label:fromEl + '剋' + toEl};
    if (CONTROLS[toEl] === fromEl) return {type:'controlled', label:toEl + '剋' + fromEl};
    return {type:'neutral', label:'關係待審'};
  }

  function getPillars(chart) {
    var p = chart && chart.pillars || {};
    return PILLAR_ORDER.map(function(k){
      var x = p[k] || {};
      return {key:k, label:PILLAR_LABEL[k], gan:x.gan || '', zhi:x.zhi || ''};
    });
  }

  function chartSummary(chart, meta) {
    var p = getPillars(chart);
    var current = safeArray(chart && chart.dayun).find(function(x){return x && x.isCurrent;}) || null;
    return {
      name: meta && meta.name || '',
      gender: chart && chart.gender || meta && meta.gender || '',
      birthLine: meta && meta.birthLine || '',
      trueSolarDateTime: meta && meta.solarInfo && meta.solarInfo.trueSolarDateTime || '',
      pillars: p,
      pillarText: p.map(function(x){return x.gan + x.zhi;}).join('　'),
      dayMaster: chart && chart.dm || (p[2] && p[2].gan) || '',
      dayMasterElement: chart && chart.dmEl || STEM_EL[(p[2] && p[2].gan) || ''] || '',
      strength: chart && chart.strongLevel || '',
      elementWeights: chart && chart.ep || {},
      favorable: safeArray(chart && chart.fav),
      unfavorable: safeArray(chart && chart.unfav),
      stance: chart && chart.wuxingStance || null,
      qiyun: chart && chart.qiyun || null,
      currentLuck: current,
      interactions: safeArray(chart && chart.branchInteractions),
      stemCombinations: safeArray(chart && chart.tianGanHe),
      chineseZodiac: CHINESE_ZODIAC[(p[0] && p[0].zhi) || ''] || '',
      chenggu: chart && chart.chenggu || null,
      auxiliary: {mingGong:chart&&chart.mingGong||null,taiYuan:chart&&chart.taiYuan||null,taiXi:chart&&chart.taiXi||null,shenGong:chart&&chart.shenGong||null,kongwang:safeArray(chart&&chart.kongwang)},
      unknownTime: !!(meta && meta.unknown)
    };
  }

  function stemCrossRelations(chartA, chartB, options) {
    options=options||{};
    var pa = getPillars(chartA), pb = getPillars(chartB), out = [];
    pa.forEach(function(a){
      pb.forEach(function(b){
        if ((options.unknownA&&a.key==='hour')||(options.unknownB&&b.key==='hour')) return;
        if (!a.gan || !b.gan) return;
        var rel = elementRelation(STEM_EL[a.gan], STEM_EL[b.gan]);
        var ck = STEM_COMBINE[pairKey(a.gan,b.gan)] || STEM_COMBINE[pairKey(b.gan,a.gan)] || null;
        var same = a.gan === b.gan;
        if (ck) {
          out.push({type:'天干五合', typeCode:'STEM_COMBINATION', aPillar:a.key, bPillar:b.key, aStem:a.gan, bStem:b.gan, candidateElement:ck, transformationStatus:'待審', description:'A'+a.label+a.gan+'與B'+b.label+b.gan+'構成天干五合，傳統化神候選'+ck+'；只確認配對，不直接判定合化。'});
        } else if (same || rel.type !== 'neutral') {
          out.push({type:same?'同干':'天干生剋', typeCode:same?'SAME_STEM':'STEM_ELEMENT_RELATION', aPillar:a.key, bPillar:b.key, aStem:a.gan, bStem:b.gan, relation:rel.type, description:'A'+a.label+a.gan+'與B'+b.label+b.gan+'：'+rel.label+'。'});
        }
      });
    });
    return out;
  }

  function branchPairRelation(a, b) {
    var rels = [];
    if (a === b) {
      rels.push({type:'同支重疊', typeCode:'SAME_BRANCH', description:a+a+'同支重疊；表示相同主題容易被彼此放大，吉凶另審。'});
      if (SELF_PUNISH[a]) rels.push({type:'自刑候選', typeCode:'SELF_PUNISHMENT', description:a+a+'符合傳統自刑配對；不得直接推成心理或疾病結論。'});
    }
    if (CLASH[a] === b) rels.push({type:'六沖', typeCode:'CLASH', description:a+b+'六沖；先視為節奏、立場或生活方式的對立／變動訊號。'});
    if (SIX_COMBINE[a] === b) {
      var k = [a,b].sort(function(x,y){return BRANCHES.indexOf(x)-BRANCHES.indexOf(y);}).join('');
      var el = SIX_COMBINE_EL[k] || SIX_COMBINE_EL[a+b] || SIX_COMBINE_EL[b+a] || null;
      rels.push({type:'六合', typeCode:'SIX_COMBINATION', candidateElement:el, transformationStatus:'待審', description:a+b+'六合'+(el?'，傳統化神候選'+el:'')+'；配對存在不等於已合化，也可能呈現牽連或合絆。'});
    }
    if (HARM[a] === b) rels.push({type:'六害', typeCode:'HARM', description:a+b+'六害；先列為隱性牽制或期待落差的查表關係，強弱與吉凶另審。'});
    if (DESTRUCTION[a] === b) rels.push({type:'相破', typeCode:'DESTRUCTION', description:a+b+'相破；作為關係不穩或磨損的參考級訊號，不單獨定論。'});
    var pn = PUNISH_PAIRS[a+b];
    if (pn) rels.push({type:'相刑', typeCode:'PUNISHMENT', description:a+b+'相刑（'+pn+'）；先列互動張力，需看落柱與現實應驗。'});
    return rels;
  }

  function branchCrossRelations(chartA, chartB, options) {
    options=options||{};
    var pa = getPillars(chartA), pb = getPillars(chartB), out = [];
    pa.forEach(function(a){
      pb.forEach(function(b){
        if ((options.unknownA&&a.key==='hour')||(options.unknownB&&b.key==='hour')) return;
        if (!a.zhi || !b.zhi) return;
        branchPairRelation(a.zhi,b.zhi).forEach(function(r){
          out.push(Object.assign({}, r, {
            aPillar:a.key, bPillar:b.key, aBranch:a.zhi, bBranch:b.zhi,
            description:'A'+a.label+a.zhi+'與B'+b.label+b.zhi+'：'+r.description
          }));
        });
      });
    });
    return out;
  }

  function crossGroupRelations(chartA, chartB, options) {
    options=options||{};
    var pa = getPillars(chartA), pb = getPillars(chartB);
    var all = pa.filter(function(x){return !(options.unknownA&&x.key==='hour');}).map(function(x){return {side:'A',pillar:x.key,branch:x.zhi};}).concat(pb.filter(function(x){return !(options.unknownB&&x.key==='hour');}).map(function(x){return {side:'B',pillar:x.key,branch:x.zhi};}));
    var branches = all.map(function(x){return x.branch;});
    var out = [];
    TRINES.concat(DIRECTIONALS).forEach(function(g, idx){
      if (!hasAll(branches,g.branches)) return;
      var participants = all.filter(function(x){return g.branches.indexOf(x.branch)>=0;});
      if (!participants.some(function(x){return x.side==='A';}) || !participants.some(function(x){return x.side==='B';})) return;
      out.push({
        type:idx<TRINES.length?'跨盤三合':'跨盤三會',
        typeCode:idx<TRINES.length?'CROSS_TRINE':'CROSS_DIRECTIONAL',
        branches:g.branches.slice(), element:g.element,
        participants:participants,
        transformationStatus:'待審',
        description:g.name+'由兩盤共同湊成；只表示成局條件出現，仍須審月令、透干、同黨、沖破與全局氣勢。'
      });
    });
    return out;
  }

  function directionalTenGods(observerChart, partnerChart, options) {
    options=options||{};
    var dm = observerChart && observerChart.dm || (observerChart && observerChart.pillars && observerChart.pillars.day && observerChart.pillars.day.gan) || '';
    var hidden = partnerChart && partnerChart.cangGan || {};
    return getPillars(partnerChart).filter(function(p){return !(options.partnerUnknown&&p.key==='hour');}).map(function(p){
      var hs=safeArray(hidden[p.key]).map(function(stem){return {stem:stem,tenGod:tenGod(dm,stem)};});
      return {partnerPillar:p.key, partnerStem:p.gan, tenGod:tenGod(dm,p.gan), hidden:hs, description:'對命主'+dm+'而言，對方'+p.label+p.gan+'映射為'+tenGod(dm,p.gan)+(hs.length?'；該支藏干映射 '+hs.map(function(x){return x.stem+'＝'+x.tenGod;}).join('、'):'')+'。'};
    });
  }

  function elementComplement(chartA, chartB) {
    var epA = chartA && chartA.ep || {}, epB = chartB && chartB.ep || {};
    var favA = (chartA && chartA.wuxingStance && chartA.wuxingStance.xi) || safeArray(chartA && chartA.fav);
    var favB = (chartB && chartB.wuxingStance && chartB.wuxingStance.xi) || safeArray(chartB && chartB.fav);
    var jiA = (chartA && chartA.wuxingStance && chartA.wuxingStance.ji) || safeArray(chartA && chartA.unfav);
    var jiB = (chartB && chartB.wuxingStance && chartB.wuxingStance.ji) || safeArray(chartB && chartB.unfav);
    var dominantA = ELEMENTS.filter(function(e){return Number(epA[e]||0)>=25;});
    var dominantB = ELEMENTS.filter(function(e){return Number(epB[e]||0)>=25;});
    var supportA = dominantB.filter(function(e){return favA.indexOf(e)>=0;});
    var supportB = dominantA.filter(function(e){return favB.indexOf(e)>=0;});
    var loadA = dominantB.filter(function(e){return jiA.indexOf(e)>=0;});
    var loadB = dominantA.filter(function(e){return jiB.indexOf(e)>=0;});
    return {
      dominantA:dominantA, dominantB:dominantB,
      partnerMaySupportA:supportA, partnerMaySupportB:supportB,
      partnerMayLoadA:loadA, partnerMayLoadB:loadB,
      selectionRule:'僅將本系統相對權重達25%以上者列為偏強五行候選。',
      caveat:'此處只比較本系統的相對五行權重與扶抑候選，不代表對方本人等同某五行，也不能單獨定合不合。'
    };
  }

  function currentAndAnnual(chart) {
    var dayun=safeArray(chart && chart.dayun),current = dayun.find(function(x){return x && x.isCurrent;}) || null;
    var nowYear = new Date().getFullYear(), byYear={};
    dayun.forEach(function(d){safeArray(d&&d.liuNian).forEach(function(y){if(y&&y.year>=nowYear-1&&y.year<=nowYear+4&&!byYear[y.year])byYear[y.year]=Object.assign({dayun:d.gz},y);});});
    var annual=Object.keys(byYear).map(Number).sort().map(function(y){return byYear[y];});
    return {currentLuck:current, annual:annual};
  }

  function luckSynchronization(chartA, chartB) {
    var a = currentAndAnnual(chartA), b = currentAndAnnual(chartB), years = uniq(a.annual.map(function(x){return x.year;}).concat(b.annual.map(function(x){return x.year;}))).sort();
    return {
      aCurrent:a.currentLuck, bCurrent:b.currentLuck,
      years:years.map(function(y){
        var ay=a.annual.find(function(x){return x.year===y;})||null;
        var by=b.annual.find(function(x){return x.year===y;})||null;
        return {year:y,a:ay,b:by,note:'只並列雙方同年運勢資料，不把兩個模型分數相加成關係機率。'};
      })
    };
  }

  function spousePalaceRelation(chartA, chartB) {
    var a = chartA && chartA.pillars && chartA.pillars.day || {}, b = chartB && chartB.pillars && chartB.pillars.day || {};
    return {
      aDayPillar:(a.gan||'')+(a.zhi||''), bDayPillar:(b.gan||'')+(b.zhi||''),
      stemRelation:elementRelation(STEM_EL[a.gan],STEM_EL[b.gan]),
      branchRelations:branchPairRelation(a.zhi,b.zhi),
      caveat:'日柱與日支是合盤重點之一，但不能凌駕兩張完整命局、角色情境及現實相處。'
    };
  }

  function getScenario(id) { return SCENARIOS.find(function(x){return x.id===id;}) || SCENARIOS[0]; }

  function buildCompatibility(chartA, chartB, options) {
    options = options || {};
    if (!chartA || !chartB) throw new Error('合盤需要兩張完整命盤');
    var scenario = getScenario(options.scenarioId || 'marriage');
    var unknownA=!!(options.metaA&&options.metaA.unknown), unknownB=!!(options.metaB&&options.metaB.unknown);
    var relationOptions={unknownA:unknownA,unknownB:unknownB};
    var stems = stemCrossRelations(chartA,chartB,relationOptions);
    var branches = branchCrossRelations(chartA,chartB,relationOptions);
    var groups = crossGroupRelations(chartA,chartB,relationOptions);
    var tensionTypes = {CLASH:true,HARM:true,DESTRUCTION:true,PUNISHMENT:true,SELF_PUNISHMENT:true};
    var supportTypes = {STEM_COMBINATION:true,SIX_COMBINATION:true,CROSS_TRINE:true,CROSS_DIRECTIONAL:true};
    var tension = branches.filter(function(x){return tensionTypes[x.typeCode];});
    var support = stems.concat(branches).concat(groups).filter(function(x){return supportTypes[x.typeCode];});
    var signal = support.length && tension.length ? '支持與張力並存' : support.length ? '支持／牽連訊號較多' : tension.length ? '磨合與邊界議題較多' : '明顯配對訊號較少，需回到十神與現實互動';
    return {
      version:'1.0.0', scenario:scenario,
      personA:chartSummary(chartA,options.metaA||{}),
      personB:chartSummary(chartB,options.metaB||{}),
      dayMasters:{aToB:elementRelation(chartA.dmEl||STEM_EL[chartA.dm],chartB.dmEl||STEM_EL[chartB.dm]), bToA:elementRelation(chartB.dmEl||STEM_EL[chartB.dm],chartA.dmEl||STEM_EL[chartA.dm])},
      spousePalace:spousePalaceRelation(chartA,chartB),
      directionalTenGods:{aViewsB:directionalTenGods(chartA,chartB,{partnerUnknown:unknownB}),bViewsA:directionalTenGods(chartB,chartA,{partnerUnknown:unknownA})},
      stemRelations:stems, branchRelations:branches, groupRelations:groups,
      elementComplement:elementComplement(chartA,chartB),
      luckSynchronization:luckSynchronization(chartA,chartB),
      evidenceSummary:{signal:signal,supportCount:support.length,tensionCount:tension.length,neutralRule:'數量只作資料整理，不是配對分數或成功機率。'},
      uncertainty:{unknownTimeA:unknownA,unknownTimeB:unknownB,hourRelationsExcluded:unknownA||unknownB,luckTimingProvisionalA:unknownA,luckTimingProvisionalB:unknownB,note:(unknownA||unknownB)?'未知時辰一方的時柱跨盤關係已排除；其精確起運與歲運同步只作暫排。':'雙方時辰已提供，仍須以出生資料準確性為前提。'},
      policy:{scenarioAware:true,roleAware:true,noSingleScore:true,noAutomaticTransformation:true,noDeterministicEvents:true,excludeUnknownHourRelations:true}
    };
  }

  function pillarFactLines(chart) {
    var P = chart && chart.pillars || {}, gods=chart&&chart.gods||{}, cang=chart&&chart.cangGan||{}, cs=chart&&chart.cs||{}, ny=chart&&chart.nayinAll||{};
    return PILLAR_ORDER.map(function(k){
      var p=P[k]||{}, g=gods[k]||{};
      return '・'+PILLAR_LABEL[k]+'：'+(p.gan||'')+(p.zhi||'')+'；天干十神 '+safeText(g.gan,'—')+'；藏干 '+safeArray(cang[k]).join('、')+'（'+safeArray(g.zhi).join('、')+'）；十二長生 '+safeText(cs[k],'—')+'；納音 '+safeText(ny[k],'—');
    });
  }

  function interactionLines(chart) {
    var out = safeArray(chart && chart.branchInteractions).map(function(x){return '・'+safeText(x.type)+'：'+safeText(x.desc||x.description)+'；'+safeText(x.effect);});
    safeArray(chart && chart.tianGanHe).forEach(function(x){out.push('・天干五合：'+safeText(x.zh||x.pair)+'；合化狀態 '+safeText(x.transformationStatus,'待審'));});
    return out.length ? out : ['・未偵測到需特別列出的原局干支作用。'];
  }

  function luckLines(chart, limit) {
    return safeArray(chart && chart.dayun).filter(function(x){return x.gz && x.gz!=='小運';}).slice(0,limit||10).map(function(x){
      return '・'+x.gz+'：'+fmtDate(x.startDate)+' ～ '+fmtDate(x.endDateExclusive)+'（終點不含）；干十神 '+safeText(x.god,'—')+'；支本氣十神 '+safeText(x.zGod,'—')+(x.isCurrent?' ★現行':'');
    });
  }

  function annualLines(chart, count) {
    var nowYear=new Date().getFullYear(), byYear={};
    safeArray(chart&&chart.dayun).forEach(function(d){safeArray(d&&d.liuNian).forEach(function(y){if(y&&y.year>=nowYear&&!byYear[y.year])byYear[y.year]=Object.assign({dayun:d.gz},y);});});
    return Object.keys(byYear).map(Number).sort().slice(0,count||5).map(function(year){var x=byYear[year];return '・'+year+' '+safeText(x.gz)+'（大運 '+safeText(x.dayun)+'；模型 '+safeText(x.level,'未標記')+'；區間 '+safeText(x.periodStart,'未提供')+' ～ '+safeText(x.periodEndExclusive,'未提供')+'）';});
  }

  function modelLines(chart) {
    var ep=chart&&chart.ep||{}, stance=chart&&chart.wuxingStance||{}, th=chart&&chart.tiaohou||{};
    return [
      '日主 '+safeText(chart&&chart.dm)+'（'+safeText(chart&&chart.dmEl)+'），本系統旺衰候選：'+safeText(chart&&chart.strongLevel,'未判定')+'；自黨相對分 '+safeText(chart&&chart.selfPts,'—')+'。',
      '五行相對權重：'+ELEMENTS.map(function(e){return e+safeText(ep[e],0)+'%';}).join('、')+'。此為本模型內比較，不是古籍固定比例或科學測量。',
      '扶抑立場：'+safeText(stance.summary, '喜候選 '+safeArray(chart&&chart.fav).join('、')+'；忌候選 '+safeArray(chart&&chart.unfav).join('、'))+'。',
      '調候鏡頭：需 '+safeArray(th.need).join('、')+'；'+safeText(th.detail)+'。調候與扶抑分開，不自動互相覆蓋。',
      '特殊格局：'+(safeArray(chart&&chart.specialStructureCandidates).length?safeArray(chart.specialStructureCandidates).map(function(x){return x.type+'（'+x.status+'）';}).join('、'):'無自動成立項；候選仍須人工覆核')+'。'
    ];
  }

  function buildChartDataBlock(chart, meta) {
    meta=meta||{};
    var current=safeArray(chart&&chart.dayun).find(function(x){return x&&x.isCurrent;});
    return [
      '【A. 排盤事實層——可以重算核對，不得擅自改柱】',
      '命主：'+escapeLine(meta.name||'未具名')+'・'+escapeLine(meta.genderLabel||chart&&chart.gender||'')+'・'+escapeLine(meta.birthLine||'出生資料未標示'),
      meta.solarInfo&&meta.solarInfo.trueSolarDateTime?'民用出生時間校正為真太陽時：'+meta.solarInfo.trueSolarDateTime+'；經度 '+safeText(meta.longitude)+'°；時區 '+safeText(meta.timezoneId||meta.solarInfo.timezoneId)+'。':'真太陽時資料未提供。',
      '排盤政策：換日 '+safeText(chart&&chart.calculationPolicy&&chart.calculationPolicy.dayBoundaryMode)+'；流年以立春為界；大運採半開區間 [起點,下一起點)。',
      meta.unknown?'重要限制：時辰未知，以暫定時刻排盤；時柱、神煞、子女晚景象義及精確起運可信度降低。':'',
      pillarFactLines(chart).join('\n'),
      (meta.unknown?'・暫定起運（以12:00暫排，不可作精確交運依據）：':'・起運：')+safeText(chart&&chart.qiyun&&chart.qiyun.startAgeText)+'；交運點 '+safeText(chart&&chart.qiyun&&chart.qiyun.startDate)+'；順逆 '+safeText(chart&&chart.qiyun&&chart.qiyun.direction)+'。',
      '・輔助資料：生肖 '+safeText(CHINESE_ZODIAC[chart&&chart.pillars&&chart.pillars.year&&chart.pillars.year.zhi],'—')+'；空亡 '+(safeArray(chart&&chart.kongwang).join('、')||'—')+'；命宮 '+safeText(chart&&chart.mingGong&&(chart.mingGong.gan+chart.mingGong.zhi),'—')+'；胎元 '+safeText(chart&&chart.taiYuan&&(chart.taiYuan.gan+chart.taiYuan.zhi),'—')+'；八字重量 '+safeText(chart&&chart.chenggu&&chart.chenggu.display,'未計得')+'。稱骨、命宮、胎元、納音與神煞只列末位輔助，不得凌駕月令與生剋主線。',
      '【原局干支作用——由核心唯一計算】',
      interactionLines(chart).join('\n'),
      '判讀限制：配對存在≠必然成化；沖刑害破不自動等於凶，須看所動之柱、十神、喜忌與歲運。',
      '【B. 流派模型層——必須標成判斷，不得冒充客觀數值】',
      modelLines(chart).join('\n'),
      '【大運資料】',
      luckLines(chart,10).join('\n'),
      current?'現行大運：'+current.gz+'，'+current.startDate+' 起，至 '+current.endDateExclusive+' 交下一運。':'現行大運未能判定。',
      '【近五個立春年度】',
      annualLines(chart,5).join('\n')||'・近年流年資料未能取得。',
      '流年與大運等級只能當本模型內相對排序；刑沖合害只列觸發，不自動加減分。',
      '神煞只作末位輔助：'+safeArray(chart&&chart.shensha).join('、')+'。'
    ].filter(Boolean).join('\n');
  }

  function buildSinglePrompt(lensId, chart, meta, userQuestion) {
    var lens=LENSES[lensId]||LENSES.general;
    return [
      '【角色】',
      '你是熟悉子平法、節氣曆法與不同命理流派的資深八字分析者。先直接回答問題，再交代盤面依據。命理是傳統詮釋體系，不是科學預測；不得把推論寫成確定會發生的事。',
      '【分析模式】'+lens.name,
      lens.question,
      '【使用者問題】',
      escapeLine(userQuestion||lens.question),
      buildChartDataBlock(chart,meta),
      '【判讀規範】',
      '1. 推理順序：月令與日主根氣 → 全局生剋制化 → 格局是否成立 → 扶抑與調候 → 原局作用 → 精確大運交界 → 流年引動。',
      '2. 主判與替代判法有分歧時，說明爭點及可用現實應驗區分的條件；不可事後怎樣都能解釋。',
      '3. 六合、五合、三合三會只確認配對／成局條件；未審查前不得寫已化成某五行。',
      '4. 大運干支十年共同作用；前後五年只能作側重，不可截然切斷。',
      '5. 不引用本提示詞以外的個人背景，不臆測職業、人物、私生活、疾病、金額或已發生事件。',
      '6. 財務、健康、法律等高風險事項只能給一般風險提醒，不能以命盤代替專業判斷。',
      '【輸出要求】',
      '繁體中文。第一句直接回答；之後用自然段交代最關鍵的3–5個盤面依據、時間界線、風險與可行行動。不要逐欄複誦資料，不要裝作百分之百確定。',
      '最後可推薦至多一種水晶作為穿搭或文化象徵；必須明說沒有證據可保證改運、招財或治療。',
      '[靜月之光蝦皮賣場](https://shopee.tw/a50h95648d?tab=shop)',
      '願你諸事順遂。'
    ].join('\n\n');
  }

  function relationFacts(comp) {
    var s=comp.scenario;
    var lines=[];
    lines.push('情境：'+s.name+'；角色A＝'+s.roleA+'；角色B＝'+s.roleB+'。');
    lines.push('情境焦點：'+s.focus+'。');
    lines.push('日主五行互動：A→B '+comp.dayMasters.aToB.label+'；B→A '+comp.dayMasters.bToA.label+'。方向不同時須分開解讀。');
    lines.push('日柱／夫妻宮：A '+comp.spousePalace.aDayPillar+'；B '+comp.spousePalace.bDayPillar+'；日干 '+comp.spousePalace.stemRelation.label+'。');
    safeArray(comp.spousePalace.branchRelations).forEach(function(x){lines.push('・日支作用：'+x.description);});
    safeArray(comp.stemRelations).filter(function(x){return x.typeCode==='STEM_COMBINATION'||(x.aPillar==='day'&&x.bPillar==='day');}).forEach(function(x){lines.push('・'+x.description);});
    safeArray(comp.branchRelations).forEach(function(x){lines.push('・'+x.description);});
    safeArray(comp.groupRelations).forEach(function(x){lines.push('・'+x.description);});
    if (!comp.branchRelations.length&&!comp.groupRelations.length) lines.push('・跨盤地支未偵測到需特別列出的合沖刑害破；不代表關係一定平淡或合適。');
    var c=comp.elementComplement;
    lines.push('五行互補候選：B較強五行中落入A喜候選＝'+(c.partnerMaySupportA.join('、')||'無明顯項')+'；A較強五行中落入B喜候選＝'+(c.partnerMaySupportB.join('、')||'無明顯項')+'。');
    lines.push('五行負荷候選：B較強五行中落入A忌候選＝'+(c.partnerMayLoadA.join('、')||'無明顯項')+'；A較強五行中落入B忌候選＝'+(c.partnerMayLoadB.join('、')||'無明顯項')+'。');
    lines.push(c.caveat);
    lines.push('整體證據整理：'+comp.evidenceSummary.signal+'；支持類訊號 '+comp.evidenceSummary.supportCount+' 項、張力類訊號 '+comp.evidenceSummary.tensionCount+' 項。'+comp.evidenceSummary.neutralRule);
    return lines;
  }

  function buildCompatibilityPrompt(comp, userQuestion) {
    var s=comp.scenario;
    return [
      '【角色】',
      '你是熟悉子平法、雙人八字合參、節氣曆法與不同命理流派的資深分析者。先直接回答問題，再交代雙向盤面依據。命理是傳統詮釋體系，不是科學預測；不得把推論寫成確定事件。',
      '【合盤情境】',
      s.name+'；A為'+s.roleA+'，B為'+s.roleB+'。本次只用此角色框架判讀，不把婚姻邏輯套入職場，也不把親子權責當成平等朋友關係。',
      '【使用者問題】',
      escapeLine(userQuestion||'請分析雙方在此情境下的契合、摩擦、溝通、長期壓力、支持方式、節奏與邊界。'),
      '【A方命盤】',
      buildChartDataBlock(comp._chartA||{},comp._metaA||{}),
      '【B方命盤】',
      buildChartDataBlock(comp._chartB||{},comp._metaB||{}),
      '【跨盤事實與模型整理】',
      relationFacts(comp).join('\n'),
      '資料可信度：'+safeText(comp.uncertainty&&comp.uncertainty.note,'未標示')+'。',
      '【雙向十神映射】',
      'A看B：'+comp.directionalTenGods.aViewsB.map(function(x){return PILLAR_LABEL[x.partnerPillar]+x.partnerStem+'＝'+x.tenGod+(x.hidden&&x.hidden.length?'（藏干 '+x.hidden.map(function(h){return h.stem+'＝'+h.tenGod;}).join('、')+'）':'');}).join('；')+'。',
      'B看A：'+comp.directionalTenGods.bViewsA.map(function(x){return PILLAR_LABEL[x.partnerPillar]+x.partnerStem+'＝'+x.tenGod+(x.hidden&&x.hidden.length?'（藏干 '+x.hidden.map(function(h){return h.stem+'＝'+h.tenGod;}).join('、')+'）':'');}).join('；')+'。',
      '十神映射方向不可互換；同一人對A與對B可能呈現不同角色感受。',
      '【運勢同步】',
      'A現行大運：'+(comp.luckSynchronization.aCurrent?comp.luckSynchronization.aCurrent.gz+'（'+comp.luckSynchronization.aCurrent.startDate+'～'+comp.luckSynchronization.aCurrent.endDateExclusive+'）':'未判定')+'。',
      'B現行大運：'+(comp.luckSynchronization.bCurrent?comp.luckSynchronization.bCurrent.gz+'（'+comp.luckSynchronization.bCurrent.startDate+'～'+comp.luckSynchronization.bCurrent.endDateExclusive+'）':'未判定')+'。',
      comp.luckSynchronization.years.map(function(x){return '・'+x.year+'：A '+(x.a?x.a.gz+'／'+x.a.level:'無資料')+'；B '+(x.b?x.b.gz+'／'+x.b.level:'無資料')+'。';}).join('\n'),
      '【判讀規範】',
      '1. 先各自看兩張原局，再看A→B與B→A的十神方向，最後才談跨盤合沖與運勢同步。',
      '2. 必須分別回答：支持點、摩擦點、溝通方式、權責／邊界、長期壓力、可操作的相處策略。',
      '3. 不提供單一配對分數，不編造成功率；合多不必然好、沖刑害多也不必然壞。',
      '4. 跨盤三合三會、六合、天干五合只表示條件出現，未審全局不得宣告合化。',
      '5. '+s.cautions,
      '6. 未知時辰者，不可重判時柱、子女晚景、精確起運或時柱跨盤作用。',
      '7. 不引用提示詞外的個人背景，不臆測已發生的背叛、疾病、金錢或私生活。',
      '【輸出要求】',
      '繁體中文。第一句直接給此情境下的主判，但使用「較可能、傾向、條件是」。接著以A方感受、B方感受、共同優勢、核心摩擦、運勢節奏與具體協議六部分回答。不要把資料逐欄重抄。',
      '[靜月之光蝦皮賣場](https://shopee.tw/a50h95648d?tab=shop)',
      '願你諸事順遂。'
    ].join('\n\n');
  }

  var PERSONALITY_CORES = [
    '靜域觀察者','深林規劃者','獨立鍛造者','邊界守望者',
    '明場推進者','群島協作者','破浪實作者','星火領航者'
  ];
  var PERSONALITY_VARIANTS = ['穩態版','流變版','共振版','破局版'];

  function godCounts(chart) {
    var out={比肩:0,劫財:0,食神:0,傷官:0,偏財:0,正財:0,七殺:0,正官:0,偏印:0,正印:0};
    var g=chart&&chart.gods||{};
    PILLAR_ORDER.forEach(function(k){
      var x=g[k]||{};
      if (own(out,x.gan)) out[x.gan]++;
      safeArray(x.zhi).forEach(function(v){if(own(out,v))out[v]++;});
    });
    return out;
  }

  function personalityAxes(chart) {
    var gc=godCounts(chart), p=getPillars(chart), yin=0,yang=0;
    p.forEach(function(x){if(YINYANG[x.gan]==='陽')yang++;else if(YINYANG[x.gan]==='陰')yin++;});
    var outward=(gc.食神+gc.傷官+gc.偏財+gc.正財), inward=(gc.偏印+gc.正印+gc.比肩+gc.劫財);
    var structured=(gc.正官+gc.七殺+gc.正印+gc.偏印), free=(gc.食神+gc.傷官+gc.比肩+gc.劫財);
    var relational=(gc.正財+gc.偏財+gc.正官+gc.正印+gc.比肩), selfLed=(gc.劫財+gc.傷官+gc.七殺+gc.偏印);
    var resilient=!!(chart&&(chart.strong===true||['中和','偏強','身強','太強'].indexOf(chart.strongLevel)>=0));
    var adaptive=yin>yang || safeArray(chart&&chart.branchInteractions).length>=2;
    return [
      {key:'energy',left:'內省',right:'外放',rightSelected:outward>inward,evidence:'輸出／財星訊號 '+outward+'，印比訊號 '+inward},
      {key:'order',left:'自主',right:'秩序',rightSelected:structured>=free,evidence:'官印訊號 '+structured+'，食傷比劫訊號 '+free},
      {key:'relation',left:'獨行',right:'協作',rightSelected:relational>selfLed,evidence:'關係導向訊號 '+relational+'，自我驅動訊號 '+selfLed},
      {key:'pressure',left:'敏感',right:'韌行',rightSelected:resilient,evidence:'旺衰候選 '+safeText(chart&&chart.strongLevel,'未判定')},
      {key:'rhythm',left:'穩態',right:'變通',rightSelected:adaptive,evidence:'陰干數 '+yin+'、陽干數 '+yang+'；原局作用 '+safeArray(chart&&chart.branchInteractions).length+' 項'}
    ];
  }

  function buildPersonality(chart, meta) {
    var axes=personalityAxes(chart), bits=axes.map(function(x){return x.rightSelected?1:0;}), idx=bits.reduce(function(a,b){return (a<<1)|b;},0);
    var coreIdx=(bits[0]<<2)|(bits[1]<<1)|bits[2], variantIdx=(bits[3]<<1)|bits[4];
    var code=(bits[0]?'E':'I')+(bits[1]?'S':'F')+(bits[2]?'C':'A')+(bits[3]?'T':'V')+(bits[4]?'M':'P');
    var traits=axes.map(function(x){return x.rightSelected?x.right:x.left;});
    var name=PERSONALITY_CORES[coreIdx]+'・'+PERSONALITY_VARIANTS[variantIdx];
    var strengths=[]; var watch=[];
    if(bits[0]) strengths.push('較容易把想法推到外部世界'); else strengths.push('擅長先觀察、整理再回應');
    if(bits[1]) strengths.push('重視規則、品質與可預期性'); else strengths.push('能自行定義方法並保持彈性');
    if(bits[2]) strengths.push('較會讀取互動與合作需求'); else strengths.push('獨立判斷與自我驅動較鮮明');
    if(bits[3]) strengths.push('承壓時較能維持推進'); else watch.push('高壓下可能需要更多恢復與安全邊界');
    if(bits[4]) strengths.push('面對變動時切換速度較快'); else strengths.push('能透過固定節奏累積成果');
    if(bits[0]&&bits[2]) watch.push('外部承諾過多時，可能分散自己的節奏');
    if(!bits[0]&&!bits[2]) watch.push('過度獨自消化時，需求可能不易被他人看見');
    if(bits[1]&&!bits[4]) watch.push('規則與穩定偏好過強時，可能降低試錯速度');
    if(!bits[1]&&bits[4]) watch.push('彈性很高時，需要額外建立收尾與紀錄機制');
    return {
      system:'靜月五軸人格', version:'1.0.0', independent:true,
      disclaimer:'此為本地自建的生日人格翻譯工具，不是 OpenFate BZTI，也未使用其未公開演算法。結果屬傳統命理語言的輕量自我觀察，不是心理測驗或科學診斷。',
      index:idx, code:code, name:name, traits:traits, axes:axes,
      strengths:uniq(strengths), watch:uniq(watch),
      chart:chartSummary(chart,meta||{})
    };
  }

  function buildPersonalityPrompt(personality, userQuestion) {
    return [
      '【角色】你是熟悉八字但不把命理當心理診斷的人格分析者。',
      '【系統聲明】'+personality.disclaimer,
      '【人格卡】',
      personality.name+'｜代碼 '+personality.code+'｜五軸：'+personality.traits.join('／'),
      personality.axes.map(function(x){return '・'+x.left+'／'+x.right+'：選擇 '+(x.rightSelected?x.right:x.left)+'；依據 '+x.evidence+'。';}).join('\n'),
      '優勢候選：'+personality.strengths.join('；')+'。',
      '留意點：'+(personality.watch.join('；')||'無單一固定弱點，仍需看情境')+'。',
      '【使用者問題】'+escapeLine(userQuestion||'請用易懂、可驗證、不貼死標籤的方式解讀這張人格卡。'),
      '【規範】不得把人格卡寫成疾病、命定性格或不可改變的結論；需提出哪些現實行為會支持或推翻此描述。',
      '[靜月之光蝦皮賣場](https://shopee.tw/a50h95648d?tab=shop)',
      '願你諸事順遂。'
    ].join('\n\n');
  }

  function normalizeBaziString(input) {
    var chars=String(input||'').replace(/[\s,，、/|｜·・._-]+/g,'');
    if(chars.length!==8) throw new Error('四柱請輸入8個干支字，例如：戊寅己未己卯辛未');
    var pillars=[];
    for(var i=0;i<8;i+=2){
      var gan=chars.charAt(i),zhi=chars.charAt(i+1);
      if(STEMS.indexOf(gan)<0||BRANCHES.indexOf(zhi)<0) throw new Error('第'+(i/2+1)+'柱不是有效干支：'+gan+zhi);
      pillars.push(gan+zhi);
    }
    return {normalized:pillars.join(' '),compact:pillars.join(''),pillars:pillars};
  }

  function chartPillarStrings(fact) {
    if(!fact||!fact.pillars)return [];
    return PILLAR_ORDER.map(function(k){var x=fact.pillars[k]||{};return (x.gan||'')+(x.zhi||'');});
  }

  function samePrefix(got,target,count) {
    for(var i=0;i<count;i++)if(got[i]!==target[i])return false;
    return true;
  }

  function reverseHourRange(hour) {
    if(hour===23)return '23:00–23:59';
    if(hour===0)return '00:00–00:59';
    return String(hour).padStart(2,'0')+':00–'+String(hour+1).padStart(2,'0')+':59';
  }

  function reverseBaziToSolarTimes(options) {
    options=options||{};
    if(!root.BaziCalendarCore||!root.BaziCalendarCore.hasEngine()) throw new Error('缺少 lunar-javascript 曆法引擎');
    var parsed=normalizeBaziString(options.bazi), target=parsed.pillars;
    var startYear=Math.trunc(Number(options.startYear)),endYear=Math.trunc(Number(options.endYear==null?new Date().getFullYear():options.endYear));
    var limit=Math.max(1,Math.min(200,Math.trunc(Number(options.limit)||50)));
    var mode=options.dayBoundaryMode==='MIDNIGHT_00'?'MIDNIGHT_00':'ZI_HOUR_23';
    if(!Number.isFinite(startYear)||!Number.isFinite(endYear)||startYear<1||endYear<startYear)throw new Error('反查年份範圍無效');
    if(endYear-startYear>300)throw new Error('一次反查最多301個公曆年份，請縮小範圍');
    var calculate=root.BaziCalendarCore.calculateChart, candidateYears=[];
    for(var y=startYear;y<=endYear;y++){
      var jan=chartPillarStrings(calculate({year:y,month:1,day:15,hour:12,minute:0,second:0,dayBoundaryMode:mode}));
      var jul=chartPillarStrings(calculate({year:y,month:7,day:1,hour:12,minute:0,second:0,dayBoundaryMode:mode}));
      if((jan[0]===target[0]||jul[0]===target[0])&&candidateYears.indexOf(y)<0)candidateYears.push(y);
    }
    var matches=[],seen={},hours=[0,1,3,5,7,9,11,13,15,17,19,21];
    function exact(y,m,d,h){
      var fact=calculate({year:y,month:m,day:d,hour:h,minute:0,second:0,dayBoundaryMode:mode}),got=chartPillarStrings(fact);
      if(got.join('')!==target.join(''))return;
      var key=y+'-'+m+'-'+d+' '+h;
      if(seen[key])return;seen[key]=true;
      matches.push({year:y,month:m,day:d,hour:h,minute:0,datetime:y+'-'+String(m).padStart(2,'0')+'-'+String(d).padStart(2,'0')+' '+String(h).padStart(2,'0')+':00:00',hourRange:reverseHourRange(h),pillars:got.join(' '),dayBoundaryMode:mode,clockTimeOnly:true});
    }
    outer:for(var yi=0;yi<candidateYears.length;yi++){
      var year=candidateYears[yi],date=new Date(Date.UTC(year,0,1));
      while(date.getUTCFullYear()===year){
        var m=date.getUTCMonth()+1,d=date.getUTCDate();
        var at0=chartPillarStrings(calculate({year:year,month:m,day:d,hour:0,minute:0,second:0,dayBoundaryMode:mode}));
        var at12=chartPillarStrings(calculate({year:year,month:m,day:d,hour:12,minute:0,second:0,dayBoundaryMode:mode}));
        if(samePrefix(at0,target,3)||samePrefix(at12,target,3)){
          for(var hi=0;hi<hours.length;hi++){exact(year,m,d,hours[hi]);if(matches.length>=limit)break outer;}
        }
        exact(year,m,d,23);if(matches.length>=limit)break outer;
        date.setUTCDate(date.getUTCDate()+1);
      }
    }
    return {query:parsed.normalized,startYear:startYear,endYear:endYear,dayBoundaryMode:mode,limit:limit,matches:matches,note:'此反查只用民用鐘錶時間的四柱作候選搜尋；最終必須帶入出生城市經度、IANA時區與真太陽時重新排盤。時辰範圍內若跨節氣，仍需逐分鐘複核。'};
  }

  function reverseBaziToSolarTimesAsync(options,onProgress) {
    // 先以 Promise 讓 UI 有機會更新「運算中」；核心演算法已用年柱週期縮小候選年。
    return new Promise(function(resolve,reject){setTimeout(function(){try{onProgress&&onProgress({stage:'searching'});var r=reverseBaziToSolarTimes(options);onProgress&&onProgress({stage:'done',matches:r.matches.length});resolve(r);}catch(e){reject(e);}},20);});
  }

  function attachCompatibilityPrivate(comp, chartA, chartB, metaA, metaB) {
    Object.defineProperties(comp,{
      _chartA:{value:chartA,enumerable:false}, _chartB:{value:chartB,enumerable:false},
      _metaA:{value:metaA||{},enumerable:false}, _metaB:{value:metaB||{},enumerable:false}
    });
    return comp;
  }

  function createCompatibility(chartA, chartB, options) {
    options=options||{};
    return attachCompatibilityPrivate(buildCompatibility(chartA,chartB,options),chartA,chartB,options.metaA,options.metaB);
  }

  root.BaziSuiteCore = {
    version:'1.0.0',
    scenarios:SCENARIOS.slice(), lenses:Object.assign({},LENSES),
    constants:{stems:STEMS.slice(),branches:BRANCHES.slice(),stemElements:Object.assign({},STEM_EL),branchElements:Object.assign({},BRANCH_EL)},
    tenGod:tenGod, elementRelation:elementRelation, chartSummary:chartSummary,
    stemCrossRelations:stemCrossRelations, branchCrossRelations:branchCrossRelations, crossGroupRelations:crossGroupRelations,
    directionalTenGods:directionalTenGods, elementComplement:elementComplement, luckSynchronization:luckSynchronization,
    createCompatibility:createCompatibility, buildCompatibilityPrompt:buildCompatibilityPrompt,
    buildChartDataBlock:buildChartDataBlock, buildSinglePrompt:buildSinglePrompt,
    buildPersonality:buildPersonality, buildPersonalityPrompt:buildPersonalityPrompt,
    normalizeBaziString:normalizeBaziString, reverseBaziToSolarTimes:reverseBaziToSolarTimes, reverseBaziToSolarTimesAsync:reverseBaziToSolarTimesAsync,
    policy:{trueSolarTimePreferred:true,defaultDayBoundaryMode:'ZI_HOUR_23',annualBoundary:'LI_CHUN',luckInterval:'[start,end)',reverseLookupClockTimeOnly:true},
    personalityCatalog:(function(){var out=[];for(var i=0;i<32;i++){var c=PERSONALITY_CORES[(i>>2)&7]+'・'+PERSONALITY_VARIANTS[i&3];out.push({index:i,name:c});}return out;})()
  };
})(typeof window !== 'undefined' ? window : globalThis);
