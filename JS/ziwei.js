// ═══════════════════════════════════════════════════════════════
// ziwei.js — 靜月之光模組化拆分
// ═══════════════════════════════════════════════════════════════

// ── computeZiwei (lines 21385-22032) ──

const ZW_MAJOR_NATURE = {
  '紫微':'帝星，主領導、格局、統御與核心掌控力。',
  '天機':'機巧善思，主變通、策劃、思考與應變。',
  '太陽':'光明外放，主表現、名望、行動力與承擔。',
  '武曲':'務實果決，主財務、執行、紀律與效率。',
  '天同':'溫和隨緣，主福氣、人和、享受與修復力。',
  '廉貞':'自持好勝，主判斷、掌控、慾望與原則衝突。',
  '天府':'穩重守成，主資源、管理、庫藏與承接能力。',
  '太陰':'細膩內斂，主情感、計畫、積蓄與內在安全感。',
  '貪狼':'欲望與才藝強，主人際、開創、桃花與企圖心。',
  '巨門':'善辯多疑，主口才、分析、質疑與是非辨別。',
  '天相':'公正持重，主協調、輔佐、規範與平衡。',
  '天梁':'庇護清高，主貴人、原則、長輩助力與保護。',
  '七殺':'衝勁強烈，主突破、壓力、變動與決斷。',
  '破軍':'破舊立新，主改革、風險、重組與極端轉折。'
};

// ═══ 農曆轉換：v80.14 嚴格模式 ═══
// 紫微斗數安命宮、身宮、五行局與紫微星，都必須依「真實農曆年月日」。
// 舊版用農曆新年 + 29.5306 日粗估，會在閏月、大小月、月界附近排錯盤；正統模式下禁止再用粗估。
function approxLunar(year, month, day) {
  var solarFactory=(typeof Solar!=='undefined'&&typeof Solar.fromYmd==='function')?Solar:(typeof Lunar!=='undefined'&&Lunar.Solar);
  if (solarFactory && typeof solarFactory.fromYmd==='function') {
    var solar = solarFactory.fromYmd(year, month, day);
    var lunar = solar.getLunar();
    return {
      year: lunar.getYear(),
      month: Math.abs(lunar.getMonth()),
      rawMonth: lunar.getMonth(),
      day: lunar.getDay(),
      isLeap: lunar.getMonth() < 0 || (typeof lunar.isLeap === 'function' && !!lunar.isLeap()),
      source: 'lunar-javascript'
    };
  }
  throw new Error('紫微斗數需要精準農曆轉換；Solar 曆法庫尚未載入，已停止排盤，避免用粗估農曆產生錯盤。');
}

// ═══ 宮位吉凶分析（大限/流年/流月共用）═══
// 回傳 { score: 數字, notes: 字串陣列, bright: 字串 }
function analyzePalace(palace, branchIdx) {
  var score = 50; // 基準分
  var notes = [];
  var brightLabel = '';
  if (!palace || !palace.stars) return { score: score, notes: notes, bright: '' };
  var majors = palace.stars.filter(function(s) { return s.type === 'major'; });
  var luckys = palace.stars.filter(function(s) { return s.type === 'lucky' || s.type === 'minor'; });
  var shas = palace.stars.filter(function(s) { return s.type === 'sha'; });

  // 主星廟旺分析
  majors.forEach(function(s) {
    var br = (typeof getStarBright === 'function') ? getStarBright(s.name, branchIdx) : null;
    if (br && br.label) {
      if (/廟|旺/.test(br.label)) { score += 8; notes.push(s.name + br.label + '，力量充足'); }
      else if (/^(不得地|不得|不)$/.test(br.label)) { score -= 4; notes.push(s.name + br.label + '，力量較弱'); }
      else if (/^(得地|得|利益|利)$/.test(br.label)) { score += 4; notes.push(s.name + br.label + '，尚可'); }
      else if (/落陷|陷/.test(br.label)) { score -= 8; notes.push(s.name + '落陷，力量不足'); }
      else if (/平/.test(br.label)) { /* 不加不減 */ }
      if (!brightLabel) brightLabel = s.name + br.label;
    }
  });

  // 無主星
  if (majors.length === 0) {
    score -= 5;
    notes.push('空宮（無主星），需借對宮星力');
  }

  // 吉星加分
  luckys.forEach(function(s) {
    if (/文昌|文曲|左輔|右弼|天魁|天鉞/.test(s.name)) {
      score += 3;
    } else {
      score += 1;
    }
  });
  if (luckys.length >= 3) notes.push('吉星雲集（' + luckys.length + '顆），助力明顯');

  // 煞星扣分
  shas.forEach(function(s) {
    if (/擎羊|陀羅|火星|鈴星|地空|地劫/.test(s.name)) {
      score -= 5;
    } else {
      score -= 2;
    }
  });
  if (shas.length >= 3) notes.push('煞星聚集（' + shas.length + '顆），阻力大');
  else if (shas.length === 1) notes.push('有' + shas[0].name + '，有阻力但不致命');
  else if (shas.length === 2) notes.push('有' + shas.map(function(s){return s.name;}).join('、') + '，壓力明顯');

  // 四化加減
  palace.stars.forEach(function(s) {
    if (s.hua === '化祿') { score += 6; notes.push(s.name + '化祿，有資源進場'); }
    if (s.hua === '化權') { score += 4; notes.push(s.name + '化權，有掌控力'); }
    if (s.hua === '化科') { score += 3; notes.push(s.name + '化科，有貴人或名聲'); }
    if (s.hua === '化忌') { score -= 7; notes.push(s.name + '化忌，容易卡住或糾結'); }
  });

  // 限制分數範圍
  if (score > 95) score = 95;
  if (score < 5) score = 5;

  return { score: score, notes: notes, bright: brightLabel };
}

function validateZiweiPlacements(palaces, huaMap) {
  if(!Array.isArray(palaces)||palaces.length!==12||new Set(palaces.map(p=>p.branch)).size!==12||new Set(palaces.map(p=>p.name)).size!==12)throw new Error('紫微十二宮缺漏或重複，已停止輸出。');
  if(palaces.some(p=>!DZ.includes(p.branch)||!ZW_PALACES.includes(p.name))||palaces.filter(p=>p.isMing).length!==1||palaces.filter(p=>p.isShen).length!==1)throw new Error('紫微命身宮或宮位身分不完整。');
  const majors=palaces.flatMap(p=>(p.stars||[]).filter(s=>s.type==='major').map(s=>s.name));
  if(majors.length!==14||new Set(majors).size!==14||Object.keys(ZW_MAJOR_NATURE).some(n=>!majors.includes(n)))throw new Error('紫微十四主星缺漏或重複，已停止輸出。');
  const huas=palaces.flatMap(p=>(p.stars||[]).filter(s=>s.hua).map(s=>s.hua));
  if(['化祿','化權','化科','化忌'].some(h=>huas.filter(x=>x===h).length!==1))throw new Error('紫微生年四化缺漏或重複，已停止輸出。');
  return {palaces:12,majorStars:14,natalTransformations:4,status:'PASS',scope:'落宮完整性，不等同事件預測驗證'};
}

// Explicit allowlists keep frontend scores and interpretation strings out of AI facts.
function ziweiPeriodFacts(period, sourceType) {
  if(!period)return null;
  var out={sourceType:sourceType};
  ['year','month','monthName','calendar','method','gz','ageStart','ageEnd','isCurrent','branch','gan','palaceName','mingPalace','mingBranch','palaces','hua','flowStars'].forEach(function(k){
    if(period[k]!=null)out[k]=JSON.parse(JSON.stringify(period[k]));
  });
  return out;
}

function ziweiCalculatedFacts(chart) {
  var palaces=chart.palaces;
  function ref(p){return {palace:p.name,branch:p.branch};}
  function at(br){return palaces.find(function(p){return p.branch===br;});}
  return {
    engineVersion:chart.engineVersion,birthInput:chart.birthInput,birthLunar:chart.birthLunar,
    effectiveLunar:chart.lunar,calculationPolicy:chart.calculationPolicy,
    yearStem:chart.yGan,yearBranch:chart.yZhi,wuxingJu:chart.wuxingJu,mingZhu:chart.mingZhu,shenZhu:chart.shenZhu,currentAge:chart.currentAge,
    palaces:palaces.map(function(p){return {name:p.name,branch:p.branch,gan:p.gan,isMing:!!p.isMing,isShen:!!p.isShen,changsheng:p.changsheng,
      stars:p.stars.map(function(s){return {name:s.name,type:s.type,brightness:typeof getStarBright==='function'?getStarBright(s.name,DZ.indexOf(p.branch)).label:'',natalHua:s.hua||null};})};}),
    sanFangSiZheng:palaces.map(function(p){var i=DZ.indexOf(p.branch);return {palace:p.name,branch:p.branch,opposite:ref(at(DZ[(i+6)%12])),trines:[ref(at(DZ[(i+4)%12])),ref(at(DZ[(i+8)%12]))]};}),
    natalTransformations:chart.sihua.map(function(h){var p=palaces.find(function(p){return p.name===h.palace;});return {sourceType:'NATAL_YEAR_STEM',stem:chart.yGan,star:h.star,hua:h.hua,targetPalace:h.palace,targetBranch:p.branch};}),
    palaceFlights:chart.feiGongHua.flatMap(function(row){return ['lu','quan','ke','ji'].map(function(key,i){var t=row[key],from=palaces.find(function(p){return p.name===row.palace;}),to=palaces.find(function(p){return p.name===t.to;});return {
      sourceType:'NATAL_PALACE_STEM',sourcePalace:row.palace,sourceBranch:from.branch,stem:row.gan,star:t.star,hua:['化祿','化權','化科','化忌'][i],targetPalace:t.to,targetBranch:to.branch,
      selfTransformation:t.self?'CENTRIFUGAL':null,convention:'飛星口徑；本宮干飛入本宮標為離心自化，不與生年四化混層'};});}),
    selfTransformations:chart.selfHua.map(function(h){return Object.assign({sourceType:'NATAL_PALACE_STEM',convention:'飛星自化口徑'},h);}),
    laiYin:chart.laiYin?Object.assign({school:'欽天',scope:'僅限欽天體系內解釋，不作三合派共同定義'},chart.laiYin):null,
    patternAssessment:chart.patternAssessment,
    decades:chart.daXian.map(function(p){return ziweiPeriodFacts(p,'DECADAL_STEM');})
  };
}

// Named structures are geometrical facts, with support/affliction kept separate.
// Adopted profile: iztro author's pattern catalogue; disputed names keep a variant.
function assessZiweiPatterns(palaces) {
  var source='https://iztro.com/zh_TW/learn/pattern',rows=[],catalog=[];
  var at=function(name){return palaces.find(function(p){return p.name===name;});};
  var ming=at('命宮'),wealth=at('財帛'),career=at('官祿'),travel=at('遷移');
  if(!ming||!wealth||!career||!travel)throw new Error('特殊格局缺少十二宮定位');
  function has(p,n){return !!p&&p.stars.some(function(s){return s.name===n;});}
  function stars(p){return p.stars.filter(function(s){return s.type==='major';}).map(function(s){return s.name;});}
  function four(p){var i=DZ.indexOf(p.branch);return [0,4,8,6].map(function(d){return palaces.find(function(x){return x.branch===DZ[(i+d)%12];});});}
  function witnesses(ps,ns){return ps.flatMap(function(p){return p.stars.filter(function(s){return !ns||ns.includes(s.name);}).map(function(s){return {palace:p.name,branch:p.branch,star:s.name,brightness:typeof getStarBright==='function'?getStarBright(s.name,DZ.indexOf(p.branch)).label:null,hua:s.hua||null};});});}
  function add(id,name,checks,ps,ns,note,variant){
    catalog.push({id:id,name:name,checks:checks,matched:checks.every(function(c){return c.passed===true;}),source:source});
    if(!catalog[catalog.length-1].matched)return;
    var region=[...new Set(ps.flatMap(four))],support=witnesses(region).filter(function(w){return ['左輔','右弼','文昌','文曲','天魁','天鉞','祿存'].includes(w.star)||['化祿','化權','化科'].includes(w.hua);});
    var blockers=witnesses(region).filter(function(w){return ['擎羊','陀羅','火星','鈴星','地空','地劫'].includes(w.star)||w.hua==='化忌';});
    rows.push({id:id,name:name,status:variant?'variant-structure':'structural',classification:'位置結構',palaces:ps.map(function(p){return p.name;}),checks:checks,
      evidence:witnesses(ps,ns),support:support,modifiers:blockers,source:source,variant:variant||null,
      desc:note+'；依實際落宮、廟旺、輔煞與四化判成色，不以格名保證事件。',
      observedStructure:witnesses(ps,ns).map(function(w){return w.palace+'('+w.branch+') '+w.star+(w.hua||'');}),
      review:blockers.length?'三方四正見 '+blockers.map(function(w){return w.palace+' '+w.star+(w.hua||'');}).join('、'):'三方四正未見本表六煞或生年忌；仍合看星性與運限'});
  }
  function check(label,passed){return {label:label,passed:!!passed};}
  var sf=four(ming),all=function(ns){return ns.every(function(n){return sf.some(function(p){return has(p,n);});});};
  function same(id,name,ns,note,branches){add(id,name,[check('命宮同見 '+ns.join('、'),ns.every(function(n){return has(ming,n);})),check('地支條件',!branches||branches.includes(ming.branch))],[ming],ns,note);}
  same('purple-treasury','紫府同宮',['紫微','天府'],'領導與資源承接並見',['寅','申']);
  same('purple-greedy','極居卯酉',['紫微','貪狼'],'主導與探索的星組',['卯','酉']);
  same('sun-thunder','日照雷門',['太陽','天梁'],'公開表達與原則性的星組',['卯']);
  same('moon-heaven','月朗天門',['太陰'],'太陰居亥的結構',['亥']);
  same('sun-noon','日麗中天',['太陽'],'太陽午宮；吉輔與煞忌另列',['午']);
  same('purple-noon','極向離明',['紫微'],'紫微在午坐命',['午']);
  same('hidden-jade','石中隱玉',['巨門'],'巨門在子午；科權祿另列支持',['子','午']);
  // 「午命擎羊」只是必要一環；天同太陰同度，或空命借對宮，須分辨。
  var horseArrowCore=has(ming,'天同')&&has(ming,'太陰');
  var horseArrowBorrowed=stars(ming).length===0&&has(travel,'天同')&&has(travel,'太陰');
  add('horse-arrow','馬頭帶箭',[check('命宮在午且有擎羊',ming.branch==='午'&&has(ming,'擎羊')),check('天同太陰同宮或空命借對宮',horseArrowCore||horseArrowBorrowed)],horseArrowBorrowed?[ming,travel]:[ming],['擎羊','天同','太陰'],'採午宮擎羊與天同太陰同度（或命空借對宮）的嚴格支線；丙戊年配祿及煞忌另審');
  add('horse-arrow-greedy','馬頭帶箭（貪狼化祿旁格）',[check('午命擎羊貪狼同宮',ming.branch==='午'&&has(ming,'擎羊')&&has(ming,'貪狼')),check('命宮貪狼生年化祿',ming.stars.some(function(s){return s.name==='貪狼'&&s.hua==='化祿';}))],[ming],['擎羊','貪狼'],'貪狼化祿與擎羊午宮同度只列旁格','不與天同太陰主格合併');
  same('minister','君臣慶會',['紫微','左輔','右弼'],'採紫微左右同守命的起例');
  add('empty','命無正曜',[check('命宮無十四主星',stars(ming).length===0)],[ming,travel],null,'參照對宮主星，保留本宮輔煞；不搬移原盤');
  add('jiyuetongliang','機月同梁格',[check('四曜齊全，不以三曜代替',all(['天機','太陰','天同','天梁']))],sf,['天機','太陰','天同','天梁'],'三方四正四曜俱備');
  add('kill-break-greedy','殺破狼星系',[check('三曜齊全',all(['七殺','破軍','貪狼']))],sf,['七殺','破軍','貪狼'],'變動型主星相互呼應');
  add('treasury-minister','府相朝垣',[check('天府在官祿',has(career,'天府')),check('天相在財帛',has(wealth,'天相'))],[ming,wealth,career],['天府','天相'],'採官祿天府、財帛天相拱命的起例');
  add('pearl','明珠出海',[check('未宮空命',ming.branch==='未'&&stars(ming).length===0),check('卯財帛太陽',wealth.branch==='卯'&&has(wealth,'太陽')),check('亥官祿太陰',career.branch==='亥'&&has(career,'太陰')),check('遷移同巨',has(travel,'天同')&&has(travel,'巨門'))],[ming,wealth,career,travel],['太陽','太陰','天同','巨門'],'日月照空命的指定結構');
  var estate=at('田宅');
  add('moon-sea-home','月生滄海（子田宅本）',[check('田宅居子且天同太陰同守',estate&&estate.branch==='子'&&has(estate,'天同')&&has(estate,'太陰'))],[estate],['天同','太陰'],'《紫微斗數全書》原文採子宮田宅同陰，不直接推定住宅或財產');
  add('moon-sea-life','月生滄海（子命變體）',[check('命居子且天同太陰同守',ming.branch==='子'&&has(ming,'天同')&&has(ming,'太陰'))],[ming],['天同','太陰'],'作者擴充的子命版本','與原文子田宅版本分列');
  add('hero-temple','英星入廟',[check('破軍在子或午宮坐命',['子','午'].includes(ming.branch)&&has(ming,'破軍'))],[ming],['破軍'],'採子午破軍命宮的固定結構；廟旺與煞忌須看實盤，不由名稱推論成就');
  var sides=[palaces.find(function(p){return DZ.indexOf(p.branch)===(DZ.indexOf(ming.branch)+11)%12;}),palaces.find(function(p){return DZ.indexOf(p.branch)===(DZ.indexOf(ming.branch)+1)%12;})];
  function flanks(a,b){return (has(sides[0],a)&&has(sides[1],b))||(has(sides[1],a)&&has(sides[0],b));}
  var clearCourt=!sf.some(function(p){return p.stars.some(function(s){return ['擎羊','陀羅','火星','鈴星','地空','地劫'].includes(s.name)||s.hua==='化忌';});});
  add('minister-flanked','君臣慶會（紫破輔弼夾命）',[check('紫微破軍守命',has(ming,'紫微')&&has(ming,'破軍')),check('左右分居兩側',flanks('左輔','右弼')),check('命宮三方四正無六煞及生年忌',clearCourt)],[ming].concat(sides),['紫微','破軍','左輔','右弼'],'採作者列出的紫破輔弼夾命支線','與紫微左右同守命的古籍起例分列');
  add('minister-literary','君臣慶會（紫相昌曲命遷）',[check('紫微天相守命',has(ming,'紫微')&&has(ming,'天相')),check('昌曲分居命遷',(has(ming,'文昌')&&has(travel,'文曲'))||(has(ming,'文曲')&&has(travel,'文昌'))),check('命宮三方四正無六煞及生年忌',clearCourt)],[ming,travel],['紫微','天相','文昌','文曲'],'採作者列出的紫相昌曲命遷支線','與紫微左右同守命的古籍起例分列');
  add('assists-purple','輔弼拱主',[check('紫微坐命',has(ming,'紫微')),check('左輔右弼三方會照或分夾命宮',(all(['左輔','右弼'])||flanks('左輔','右弼')))],sf.concat(sides),['紫微','左輔','右弼'],'紫微坐命而左右在三方四正會照或分夾兩側；單見一曜不成完整結構');
  add('golden-carriage-fu','金輿扶駕（天府日月夾命）',[check('天府守命',has(ming,'天府')),check('日月分居兩側',flanks('太陽','太陰'))],[ming].concat(sides),['天府','太陽','太陰'],'依作者天府守命的修訂解釋，保留原典用字爭議','原文紫微守命被作者指出與安星位置不相容；此項只採天府修訂本');
  add('sun-beam-literary-lu','陽梁昌祿',[check('命宮三方四正同見四曜',all(['太陽','天梁','文昌','祿存']))],sf,['太陽','天梁','文昌','祿存'],'四曜必須齊備，化祿不能替代祿存；不據此推定學歷或考試結果');
  [['purple-flank','紫府夾命','紫微','天府'],['assist-flank','左右夾命','左輔','右弼'],['literary-flank','昌曲夾命','文昌','文曲'],['noble-flank','魁鉞夾命','天魁','天鉞'],['sunmoon-flank','日月夾命','太陽','太陰'],['firebell-flank','火鈴夾命','火星','鈴星'],['goat-drag-flank','羊陀夾命','擎羊','陀羅'],['empty-rob-flank','空劫夾命','地空','地劫']].forEach(function(g){
    add(g[0],g[1],[check('兩側不同宮各具一星',(has(sides[0],g[2])&&has(sides[1],g[3]))||(has(sides[1],g[2])&&has(sides[0],g[3])))],sides,g.slice(2),'夾宮按命宮兩側地支定位，非命宮同見兩星');
  });
  var transformations=['化祿','化權','化科'];
  add('three-transformations','三奇加會',[check('生年祿權科齊會',transformations.every(function(h){return sf.some(function(p){return p.stars.some(function(s){return s.hua===h;});});}))],sf,null,'只合看同一生年層祿權科；不跨層湊格');
  add('double-fortune','雙祿交流',[check('祿存會命',all(['祿存'])),check('生年化祿會命',sf.some(function(p){return p.stars.some(function(s){return s.hua==='化祿';});}))],sf,null,'祿存與生年化祿並見，成色不相加成機率');
  var hasHuaLu=function(p){return !!p&&p.stars.some(function(s){return s.hua==='化祿';});};
  var luMaPlace=palaces.find(function(p){return has(p,'祿存')&&has(p,'天馬');});
  add('luma-together','祿馬交馳（同宮）',[check('祿存、天馬落在同一宮',!!luMaPlace)],luMaPlace?[luMaPlace]:[ming],['祿存','天馬'],'採祿存天馬實際同宮的嚴格起例；落在非命宮時按該宮題意取象，不推定財運或遷動結果');
  var lufortunePlace=palaces.find(function(p){return has(p,'祿存');});
  var lufortuneOpposite=lufortunePlace&&palaces.find(function(p){return p.branch===DZ[(DZ.indexOf(lufortunePlace.branch)+6)%12];});
  add('fortune-pair','祿合鴛鴦',[check('祿存與生年化祿同宮或對拱',!!lufortunePlace&&(hasHuaLu(lufortunePlace)||hasHuaLu(lufortuneOpposite)))],
    lufortunePlace?[lufortunePlace,lufortuneOpposite]:[ming],['祿存'],'採本命祿存與生年化祿同宮或對宮；三方四正並見而不同宮、不對拱不能混稱');
  var hiddenBranch={'子':'丑','丑':'子','寅':'亥','亥':'寅','卯':'戌','戌':'卯','辰':'酉','酉':'辰','巳':'申','申':'巳','午':'未','未':'午'};
  var hiddenLuck=palaces.find(function(p){return p.branch===hiddenBranch[ming.branch];});
  add('bright-hidden-fortune','明祿暗祿',[check('命宮與暗合宮分見祿存、化祿',(has(ming,'祿存')&&hasHuaLu(hiddenLuck))||(hasHuaLu(ming)&&has(hiddenLuck,'祿存')))],
    [ming,hiddenLuck],['祿存'],'按命宮六合暗合宮，不將對宮或三方會祿誤認暗合');
  add('two-hoods','兩重華蓋',[check('命宮祿存與生年化祿同宮',has(ming,'祿存')&&hasHuaLu(ming)),check('命宮同見地空或地劫',has(ming,'地空')||has(ming,'地劫'))],[ming],['祿存','地空','地劫'],'採祿存化祿坐命遇地空或地劫；不推定財務結果');
  add('luma-seal','祿馬佩印',[check('命宮天相祿存天馬同宮',has(ming,'天相')&&has(ming,'祿存')&&has(ming,'天馬'))],[ming],['天相','祿存','天馬'],'天相祿存天馬在同一命宮的分支；空亡、生旺另列補證，不推定富貴');
  var body=palaces.find(function(p){return p.isShen;});
  var aidesAt=has(ming,'左輔')&&has(ming,'右弼')?ming:body&&has(body,'左輔')&&has(body,'右弼')?body:null;
  add('aides-together','左右同宮',[check('左輔右弼同守命宮或身宮',!!aidesAt)],aidesAt?[aidesAt]:[ming],['左輔','右弼'],'按命／身實際同宮，不以三方會照代替；輔助條件與煞忌仍須合盤');
  var lightPalaces=['太陽','太陰'].map(function(n){return sf.find(function(p){return has(p,n);});});
  var lightLevels=lightPalaces.map(function(p,i){return p&&typeof getStarBright==='function'?getStarBright(['太陽','太陰'][i],DZ.indexOf(p.branch)).label:null;});
  var bothFallen=lightLevels.every(function(b){return b==='陷'||b==='落陷';});
  add('sunmoon-bright','日月並明',[check('日月同在命宮三方四正且均廟旺',lightLevels.every(function(b){return b==='廟'||b==='旺';}))],sf,['太陽','太陰'],'採實際亮度表，不以吉星個數代替廟旺');
  add('sunmoon-fallen','日月反背',[check('日月同在命宮三方四正且均落陷',bothFallen)],sf,['太陽','太陰'],'表示所採亮度條件；不推定命主成就或人格');
  add('hidden-lights','日月藏輝',[check('日月反背',bothFallen),check('巨門同會',all(['巨門']))],sf,['太陽','太陰','巨門'],'採《全書》日月反背又逢巨門的分支');
  var home=at('田宅');
  add('lights-home','日月照璧',[check('田宅日月同宮',has(home,'太陽')&&has(home,'太陰')),check('田宅在丑未',home&&['丑','未'].includes(home.branch))],[home],['太陽','太陰'],'只記田宅星组，不保證房產或財富');
  // A role pair is a structure in its own palace, never automatically the natal life pattern.
  [['fire-greedy','火貪同宮','火星','貪狼'],['bell-greedy','鈴貪同宮','鈴星','貪狼'],['wu-greedy','武貪同宮','武曲','貪狼'],['ji-liang','機梁同宮','天機','天梁'],['wu-fu','武府同宮','武曲','天府'],['ji-ju','機巨同宮','天機','巨門'],['lian-kill','廉殺同宮','廉貞','七殺'],['sun-moon','日月同宮','太陽','太陰']].forEach(function(g){palaces.forEach(function(p){add(g[0]+'-'+p.branch,g[1],[check('兩曜實際同宮',has(p,g[2])&&has(p,g[3]))],[p],g.slice(2),'此星組落在'+p.name+'，不是自動升格為命宮格局');});});
  palaces.forEach(function(p){add('beam-horse-'+p.branch,'梁馬同宮',[check('天梁與天馬實際同宮',has(p,'天梁')&&has(p,'天馬'))],[p],['天梁','天馬'],'梁馬飄蕩的同宮結構；只保留遷動取象，不沿用古代人格及性道德斷語');});
  add('xiong-original','雄宿朝元（申未本）',[check('廉貞守命',has(ming,'廉貞')),check('申未本地支',['申','未'].includes(ming.branch))],[ming],['廉貞'],'保留原文申未的異說','《全書》引文申未；iztro 作者用寅申，兩說不合併');
  add('xiong-iztro','雄宿朝元（寅申本）',[check('廉貞守命',has(ming,'廉貞')),check('寅申本地支',['寅','申'].includes(ming.branch))],[ming],['廉貞'],'採作者解說寅申的異說','與申未本並列，禁止以廉貞化祿代替地支条件');
  return {version:'1.1.0',source:source,patterns:rows,catalog:catalog,policy:'先判位置結構，再列支持和牽制；structural 不等於富貴、疾病、性格或事件事實。'};
}

function computeZiwei(year,month,day,hour,gender,options){
  window._jyZiweiError = null;
  try {
  options = options || {};
  if (![year,month,day,hour].every(Number.isInteger) || year < 1900 || year > 2100 || hour < 0 || hour > 23 || !['male','female'].includes(gender)) throw new Error('出生日期、時辰或性別資料無效。');
  const civil = new Date(Date.UTC(year,month-1,day));
  if(civil.getUTCFullYear()!==year || civil.getUTCMonth()+1!==month || civil.getUTCDate()!==day) throw new Error('出生日期不存在。');
  // One explicit policy per chart. Legacy aliases are accepted only when consistent.
  if(options.dayDivide!=null&&!['current','forward'].includes(options.dayDivide))throw new Error('未支援的 dayDivide。');
  if(options.fixLeap!=null&&typeof options.fixLeap!=='boolean')throw new Error('fixLeap 必須為布林值。');
  const dayBoundaryMode = options.dayBoundaryMode || (options.dayDivide==='forward'?'ZI_HOUR_23':'MIDNIGHT_00');
  const leapMonthPolicy = options.leapMonthPolicy || (options.fixLeap===true?'SPLIT_AT_15':'SAME_MONTH');
  if(options.dayDivide!=null&&options.dayDivide!==(dayBoundaryMode==='ZI_HOUR_23'?'forward':'current'))throw new Error('紫微換日政策互相矛盾。');
  if(options.fixLeap!=null&&options.fixLeap!==(leapMonthPolicy==='SPLIT_AT_15'))throw new Error('紫微閏月政策互相矛盾。');
  ['yearDivide','horoscopeDivide','ageDivide'].forEach(function(k){if(options[k]!=null&&options[k]!=='normal')throw new Error('本站紫微僅支援 '+k+'=normal。');});
  if(options.algorithm!=null&&options.algorithm!=='default')throw new Error('本站紫微安星算法為 default 加本站覆蓋政策。');
  if(options.trueSolarTime===true)throw new Error('本紫微模組使用民用出生時間，不套用真太陽時。');
  const suppliedTime=options.civilTime||options.btime||null;
  const timeMatch=suppliedTime&&/^(\d{2}):(\d{2})$/.exec(suppliedTime);
  if(suppliedTime&&(!timeMatch||+timeMatch[1]!==hour||+timeMatch[2]>59))throw new Error('原始出生時間與安星時刻不一致。');
  const minute=options.minute!=null?options.minute:(timeMatch?+timeMatch[2]:null);
  if(minute!=null&&(!Number.isInteger(minute)||minute<0||minute>59))throw new Error('出生分鐘無效。');
  if(timeMatch&&minute!==+timeMatch[2])throw new Error('出生分鐘資料互相矛盾。');
  const hourBranchIndex=Math.floor(((hour+1)%24)/2);
  const representativeHour=hour===23?23:hourBranchIndex*2;
  const birthInput={civilDate:[year,String(month).padStart(2,'0'),String(day).padStart(2,'0')].join('-'),
    civilTime:options.btimeUnknown?null:(options.timePrecision==='shichen'?null:(suppliedTime||(minute!=null?String(hour).padStart(2,'0')+':'+String(minute).padStart(2,'0'):null))),
    timePrecision:options.btimeUnknown?'unknown':(options.timePrecision==='shichen'||minute==null&&!suppliedTime?'shichen':'minute'),
    hour:hour,minute:options.btimeUnknown||options.timePrecision==='shichen'?null:minute,gender:gender,
    hourBranch:DZ[hourBranchIndex],hourBranchIndex:hourBranchIndex,representativeTime:String(representativeHour).padStart(2,'0')+':00',
    timezoneId:options.timezoneId||null,timezoneOffset:options.timezoneOffset!=null?Number(options.timezoneOffset):null,trueSolarTime:false};
  const flowStarPolicy = options.flowStarPolicy || 'COMMON_7';
  if(!['COMMON_7','ZHONGZHOU_8'].includes(flowStarPolicy))throw new Error('未支援的流曜設定。');
  if(!['MIDNIGHT_00','ZI_HOUR_23'].includes(dayBoundaryMode) || !['SAME_MONTH','SPLIT_AT_15'].includes(leapMonthPolicy)) throw new Error('未支援的紫微曆法設定。');
  const birthLunar = approxLunar(year,month,day);
  if(dayBoundaryMode==='ZI_HOUR_23' && hour===23) civil.setUTCDate(civil.getUTCDate()+1);
  const lunar = approxLunar(civil.getUTCFullYear(),civil.getUTCMonth()+1,civil.getUTCDate());
  const effectiveMonth = ((lunar.month - 1 + (lunar.isLeap && leapMonthPolicy==='SPLIT_AT_15' && lunar.day>15 ? 1 : 0)) % 12) + 1;
  const referenceDate = options.referenceDate ? new Date(options.referenceDate) : new Date();
  if(!Number.isFinite(referenceDate.getTime())) throw new Error('參考日期無效。');
  const refClock = new Date(referenceDate.getTime()+8*3600000);
  const referenceLunar = approxLunar(refClock.getUTCFullYear(),refClock.getUTCMonth()+1,refClock.getUTCDate());
  const ageAtLunarYear = function(y){ return y-lunar.year+1; };
  const currentAge = ageAtLunarYear(referenceLunar.year);
  const calculationPolicy = {
    version:'20260917-policy1', implementation:'JINGYUE_LOCAL_IZTRO_RULES_WITH_OVERRIDES',
    yearDivide:'normal',horoscopeDivide:'normal',ageDivide:'normal',dayDivide:dayBoundaryMode==='ZI_HOUR_23'?'forward':'current',
    algorithm:'default',fixLeap:leapMonthPolicy==='SPLIT_AT_15',trueSolarTime:false,
    upstreamDefaults:{dayDivide:'forward',fixLeap:true},
    overrides:['本站午夜換日與閏月沿用本月為預設，不等同 iztro 預設。','選用23時換日時，本站先完整推進民用日期再轉農曆；跨月跨年不宣稱等同 iztro 的所有邊界行為。'],
    yearBoundary:'LUNAR_NEW_YEAR', dayBoundaryMode:dayBoundaryMode,
    leapMonthPolicy:leapMonthPolicy, effectiveMonth:effectiveMonth, effectiveDay:lunar.day,
    flowStarPolicy:flowStarPolicy,flowStarLayers:['大限','流年'],flowStarYearBoundary:'LUNAR_NEW_YEAR',flowStarScoreAdjustment:0,
    mingZhuBasis:'MING_PALACE_BRANCH', shenZhuBasis:'BIRTH_YEAR_BRANCH',
    monthPalaceMethod:'DOUJUN', monthStemMethod:'YEAR_STEM_WUHU', monthScoreBasis:'ZERO_CENTERED_RELATIVE_MODEL', minorLimitMethod:'BIRTH_YEAR_TRINE_MALE_FORWARD_FEMALE_BACKWARD',
    injuryAngelMethod:'FIXED_FRIENDS_HEALTH', voidMethod:'TWO_BRANCHES_PRIMARY_SECONDARY_BY_YEAR_PARITY',
    sihuaTable:'甲廉破武陽；乙機梁紫陰；丙同機昌廉；丁陰同機巨；戊貪陰弼機；己武貪梁曲；庚陽武陰同；辛巨陽曲昌；壬梁紫輔武；癸破巨陰貪',
    referenceDate:referenceDate.toISOString(), referenceLunarYear:referenceLunar.year, referenceLunar:referenceLunar,
    ageMethod:'LUNAR_NEW_YEAR_NOMINAL', predictionValidated:false,
    birthTimeBasis:'LOCAL_CIVIL_WALL_CLOCK',referenceTimezone:'Asia/Taipei',
    effectiveCivilDate:civil.toISOString().slice(0,10),
    sources:['https://iztro.com/zh_TW/learn/setup','https://github.com/SylarLong/iztro/blob/main/src/astro/astro.ts','https://github.com/SylarLong/iztro/blob/main/src/star/location.ts','https://github.com/SylarLong/iztro/blob/main/src/astro/palace.ts']
  };
  // ★ v16 修復：紫微年干支必須用農曆年，不是西曆年
  // 正月初一前出生 → 農曆仍屬上一年 → 年干支用上一年
  // 影響範圍：四化、祿存、擎羊陀羅、天魁天鉞、紅鸞天喜、火鈴、大限起點
  const _lunarY = (lunar && lunar.year) ? lunar.year : year;
  const yGan = TG[((_lunarY-4)%10+10)%10];
  const yZhi = DZ[((_lunarY-4)%12+12)%12];

  // 命宮地支：月支-時支
  const shi = Math.floor(((hour+1)%24)/2);
  const mingIdx = ((effectiveMonth - shi + 13) % 12 + 12) % 12; // 修正: +13 (正月子時=寅)
  // 身宮：月+時+寅基
  const shenIdx = ((effectiveMonth + shi + 1) % 12 + 12) % 12;

  // 五行局 (簡化：依命宮天干地支組合)
  // 宮干：年干起月法 (甲己→丙寅=2, 乙庚→戊寅=4, 丙辛→庚寅=6, 丁壬→壬寅=8, 戊癸→甲寅=0)
  const ganBase={'甲':2,'己':2,'乙':4,'庚':4,'丙':6,'辛':6,'丁':8,'壬':8,'戊':0,'癸':0};
  const gBase=ganBase[yGan]||0;
  const mingGanIdx=(gBase+((mingIdx-2+12)%12))%10;
  const mingGan = TG[mingGanIdx];
  const wuxingJu = getWuxingJu(mingGan, DZ[mingIdx]);

  // 安紫微星
  const ziweiIdx = getZiweiPalaceByJu(wuxingJu, lunar.day);
  // 天府位置: 與紫微以寅-申軸對稱
  // 紫微寅(2)→天府寅(2), 紫微卯(3)→天府丑(1), 紫微辰(4)→天府子(0)...
  const tianfuIdx = ((4 - ziweiIdx + 12) % 12 + 12) % 12;

  // 建立12宮 (逆時針排列: 命→兄弟→夫妻→子女→...)
  const palaces = [];
  for(let i=0;i<12;i++){
    const pIdx = ((mingIdx - i) % 12 + 12) % 12;
    palaces.push({
      name: ZW_PALACES[i],
      branch: DZ[pIdx],
      stars: [],
      isMing: i===0,
      isShen: pIdx === shenIdx
    });
  }

  // 安14主星（簡化排列）
  const ziweiOrder = [0,1,null,2,3,4,5]; // 紫微系
  const tianfuOrder = [6,7,8,9,10,11,12,13]; // 天府系

  // 紫微系安星
  const zwStarMap = [
    {star:0, offset:0},  // 紫微
    {star:1, offset:-1}, // 天機
    {star:2, offset:-3}, // 太陽
    {star:3, offset:-4}, // 武曲
    {star:4, offset:-5}, // 天同
    {star:5, offset:4}   // 廉貞（紫微逆8位=+4）
  ];
  zwStarMap.forEach(({star,offset})=>{
    const pos = ((ziweiIdx + offset) % 12 + 12) % 12;
    const palaceIdx = palaces.findIndex(p=> DZ.indexOf(p.branch) === pos);
    if(palaceIdx>=0) palaces[palaceIdx].stars.push({...ZW_MAJOR[star], type:'major'});
  });

  // 天府系安星
  const tfStarMap = [
    {star:6, offset:0},   // 天府
    {star:7, offset:1},   // 太陰
    {star:8, offset:2},   // 貪狼
    {star:9, offset:3},   // 巨門
    {star:10, offset:4},  // 天相
    {star:11, offset:5},  // 天梁
    {star:12, offset:6},  // 七殺
    {star:13, offset:10}  // 破軍
  ];
  tfStarMap.forEach(({star,offset})=>{
    const pos = ((tianfuIdx + offset) % 12 + 12) % 12;
    const palaceIdx = palaces.findIndex(p=> DZ.indexOf(p.branch) === pos);
    if(palaceIdx>=0) palaces[palaceIdx].stars.push({...ZW_MAJOR[star], type:'major'});
  });

  // 安吉星（簡化）
  const wcIdx = ((year-4)%12+12)%12;
  addStarToPalace(palaces,'文昌','minor',(10-shi+12)%12);
  addStarToPalace(palaces,'文曲','minor',(shi+4)%12);
  addStarToPalace(palaces,'左輔','minor',(effectiveMonth+3)%12);
  addStarToPalace(palaces,'右弼','minor',(11-effectiveMonth+12)%12);

  // 安煞星（業界標準查表法）
  const yZhiIdx = DZ.indexOf(yZhi);
  
  // 擎羊陀羅：依年干查表（標準安星法）
  // 擎羊在祿存後一位，陀羅在祿存前一位
  const QY_TABLE={甲:3,乙:4,丙:6,丁:7,戊:6,己:7,庚:9,辛:10,壬:0,癸:1};
  const TL_TABLE={甲:1,乙:2,丙:4,丁:5,戊:4,己:5,庚:7,辛:8,壬:10,癸:11};
  addStarToPalace(palaces,'擎羊','sha',QY_TABLE[yGan]!==undefined?QY_TABLE[yGan]:3);
  addStarToPalace(palaces,'陀羅','sha',TL_TABLE[yGan]!==undefined?TL_TABLE[yGan]:1);

  // 火星：依年支分組+時支查表
  // 寅午戌年從丑(1)起，申子辰年從寅(2)起，巳酉丑年從卯(3)起，亥卯未年從酉(9)起
  const HX_BASE={寅:1,午:1,戌:1, 申:2,子:2,辰:2, 巳:3,酉:3,丑:3, 亥:9,卯:9,未:9};
  const hxBase=HX_BASE[yZhi]!==undefined?HX_BASE[yZhi]:2;
  addStarToPalace(palaces,'火星','sha',(hxBase+shi)%12);

  // 鈴星：依年支分組+時支查表
  // 寅午戌年從卯(3)起，申子辰年從戌(10)起，巳酉丑年從戌(10)起，亥卯未年從戌(10)起
  const LX_BASE={寅:3,午:3,戌:3, 申:10,子:10,辰:10, 巳:10,酉:10,丑:10, 亥:10,卯:10,未:10};
  const lxBase=LX_BASE[yZhi]!==undefined?LX_BASE[yZhi]:10;
  addStarToPalace(palaces,'鈴星','sha',(lxBase+shi)%12);

  // 安天魁天鉞（依年干·業界標準）
  // 甲戊庚→魁丑(1)鉞未(7), 乙己→魁子(0)鉞申(8), 丙丁→魁亥(11)鉞酉(9), 辛→魁午(6)鉞寅(2), 壬癸→魁卯(3)鉞巳(5)
  const TIANKU_TABLE={甲:1,戊:1,庚:1, 乙:0,己:0, 丙:11,丁:11, 辛:6, 壬:3,癸:3};
  const TIANYUE_TABLE={甲:7,戊:7,庚:7, 乙:8,己:8, 丙:9,丁:9, 辛:2, 壬:5,癸:5};
  addStarToPalace(palaces,'天魁','lucky',TIANKU_TABLE[yGan]!==undefined?TIANKU_TABLE[yGan]:1);
  addStarToPalace(palaces,'天鉞','lucky',TIANYUE_TABLE[yGan]!==undefined?TIANYUE_TABLE[yGan]:7);

  // 安祿存（依年干）
  const LUCUN_TABLE={甲:2,乙:3,丙:5,丁:6,戊:5,己:6,庚:8,辛:9,壬:11,癸:0}; // 祿存位置(地支idx)
  addStarToPalace(palaces,'祿存','lucky',LUCUN_TABLE[yGan]!==undefined?LUCUN_TABLE[yGan]:2);

  // 安天馬（依年支）
  const TIANMA_TABLE={寅:8,申:2,巳:11,亥:5,子:2,午:8,卯:5,酉:11,辰:2,戌:8,丑:11,未:5};
  addStarToPalace(palaces,'天馬','lucky',TIANMA_TABLE[yZhi]!==undefined?TIANMA_TABLE[yZhi]:2);

  // ═══ 乙級星（依年支）═══
  // 紅鸞：子→卯,丑→寅,寅→丑,卯→子,辰→亥,巳→戌,午→酉,未→申,申→未,酉→午,戌→巳,亥→辰
  addStarToPalace(palaces,'紅鸞','minor2',(3-yZhiIdx+12)%12);
  // 天喜：紅鸞對宮(+6)
  addStarToPalace(palaces,'天喜','minor2',(3-yZhiIdx+6+12)%12);
  // 天虛：依年支 子→午,丑→未,...
  addStarToPalace(palaces,'天虛','minor2',(yZhiIdx+6)%12);
  // 天哭：依年支 子→午反向 子→午,丑→巳,...
  addStarToPalace(palaces,'天哭','minor2',(6-yZhiIdx+12)%12);
  // 龍池：依年支順行 子→辰(4),丑→巳,...
  addStarToPalace(palaces,'龍池','minor2',(yZhiIdx+4)%12);
  // 鳳閣：依年支逆行 子→戌(10),丑→酉,...
  addStarToPalace(palaces,'鳳閣','minor2',(10-yZhiIdx+12)%12);
  // 華蓋：依年支三合局 寅午戌→戌,申子辰→辰,巳酉丑→丑,亥卯未→未
  const HG_TABLE={0:4,1:1,2:10,3:7,4:4,5:1,6:10,7:7,8:4,9:1,10:10,11:7};
  addStarToPalace(palaces,'華蓋','minor2',HG_TABLE[yZhiIdx]!==undefined?HG_TABLE[yZhiIdx]:4);
  // 咸池（桃花）：依年支 寅午戌→卯,申子辰→酉,巳酉丑→午,亥卯未→子
  const XC_TABLE={0:9,1:6,2:3,3:0,4:9,5:6,6:3,7:0,8:9,9:6,10:3,11:0};
  addStarToPalace(palaces,'咸池','minor2',XC_TABLE[yZhiIdx]!==undefined?XC_TABLE[yZhiIdx]:9);
  // 年系天德、月德；解神採月解，不與年解混用。
  addStarToPalace(palaces,'天德','minor2',(yZhiIdx+9)%12);
  addStarToPalace(palaces,'月德','minor2',(yZhiIdx+5)%12);
  addStarToPalace(palaces,'解神','minor2',[8,10,0,2,4,6][Math.floor((effectiveMonth-1)/2)]);
  // 命宮起子順數年支安天才；身宮起子順數年支安天壽。
  addStarToPalace(palaces,'天壽','minor2',(shenIdx+yZhiIdx)%12);

  // ═══ 乙級星（依年干）═══
  // 天官：甲→未(7),乙→辰(4),丙→巳(5),丁→寅(2),戊→卯(3),己→酉(9),庚→亥(11),辛→酉(9),壬→戌(10),癸→巳(5)
  const TGUAN={甲:7,乙:4,丙:5,丁:2,戊:3,己:9,庚:11,辛:9,壬:10,癸:6};
  addStarToPalace(palaces,'天官','minor2',TGUAN[yGan]!==undefined?TGUAN[yGan]:7);
  // 天福：甲→酉(9),乙→申(8),丙→子(0),丁→亥(11),戊→卯(3),己→寅(2),庚→午(6),辛→巳(5),壬→午(6),癸→巳(5)
  const TFUL={甲:9,乙:8,丙:0,丁:11,戊:3,己:2,庚:6,辛:5,壬:6,癸:5};
  addStarToPalace(palaces,'天福','minor2',TFUL[yGan]!==undefined?TFUL[yGan]:9);
  // 天貴：文曲起初一，順數生日，再退一宮。
  addStarToPalace(palaces,'天貴','minor2',(shi+4+lunar.day-2+120)%12);

  // 月系星：正月酉宮起天刑、丑宮起天姚，逐月順行。
  addStarToPalace(palaces,'天刑','minor2',(effectiveMonth+8)%12);
  addStarToPalace(palaces,'天姚','minor2',effectiveMonth%12);
  // 恩光：文昌起初一，順數生日，再退一宮。
  addStarToPalace(palaces,'恩光','minor2',(10-shi+lunar.day-2+120)%12);
  // 本版本採固定宮法：天傷交友、天使疾厄。
  addStarToPalace(palaces,'天傷','minor2',DZ.indexOf(palaces[7].branch));
  addStarToPalace(palaces,'天使','minor2',DZ.indexOf(palaces[5].branch));

  // ═══ 甲級煞星補充：地空/地劫 ═══
  // 地空：亥(11)起逆行至時支 = (11-shi+12)%12
  addStarToPalace(palaces,'地空','sha',(11-shi+12)%12);
  // 地劫：亥(11)起順行至時支 = (11+shi)%12
  addStarToPalace(palaces,'地劫','sha',(11+shi)%12);

  // ═══ 乙級星補充 ═══
  // 天空：依年支 (yZhiIdx+1)%12
  addStarToPalace(palaces,'天空','minor2',(yZhiIdx+1)%12);

  // 孤辰：依年支三合局
  // 寅卯辰年→巳(5), 巳午未年→申(8), 申酉戌年→亥(11), 亥子丑年→寅(2)
  const GUCHEN_TABLE={0:2,1:2,2:5,3:5,4:5,5:8,6:8,7:8,8:11,9:11,10:11,11:2};
  addStarToPalace(palaces,'孤辰','minor2',GUCHEN_TABLE[yZhiIdx]);
  // 寡宿：依年支三合局
  // 寅卯辰年→丑(1), 巳午未年→辰(4), 申酉戌年→未(7), 亥子丑年→戌(10)
  const GUASU_TABLE={0:10,1:10,2:1,3:1,4:1,5:4,6:4,7:4,8:7,9:7,10:7,11:10};
  addStarToPalace(palaces,'寡宿','minor2',GUASU_TABLE[yZhiIdx]);

  // 年系蜚廉（三年一組）、月系天巫（巳申寅亥循環）。
  addStarToPalace(palaces,'蜚廉','minor2',[8,9,10,5,6,7,2,3,4,11,0,1][yZhiIdx]);
  addStarToPalace(palaces,'天巫','minor2',[5,8,2,11][(effectiveMonth-1)%4]);
  addStarToPalace(palaces,'天才','minor2',(mingIdx+yZhiIdx)%12);
  // 年系大耗；與博士十二神中的大耗分層記錄。
  addStarToPalace(palaces,'大耗','minor2',[7,6,9,8,11,10,1,0,3,2,5,4][yZhiIdx]);
  const TIANCHU={甲:5,乙:6,丙:0,丁:5,戊:6,己:8,庚:2,辛:6,壬:9,癸:11};
  addStarToPalace(palaces,'天廚','minor2',TIANCHU[yGan]);

  // 天月：依月支
  // 正月→戌(10),二月→巳(5),三月→辰(4),四月→寅(2),五月→未(7),六月→卯(3),七月→亥(11),八月→未(7),九月→寅(2),十月→午(6),十一月→戌(10),十二月→寅(2)
  const TIANYUE_M={1:10,2:5,3:4,4:2,5:7,6:3,7:11,8:7,9:2,10:6,11:10,12:2};
  addStarToPalace(palaces,'天月','minor2',TIANYUE_M[effectiveMonth]!==undefined?TIANYUE_M[effectiveMonth]:10);

  // 破碎：子午卯酉在巳、寅申巳亥在酉、辰戌丑未在丑。
  addStarToPalace(palaces,'破碎','minor2',[5,1,9,5,1,9,5,1,9,5,1,9][yZhiIdx]);

  // 劫煞：依年支三合局
  // 寅午戌年→亥(11), 申子辰年→巳(5), 巳酉丑年→寅(2), 亥卯未年→申(8)
  const JIESHA_TABLE={0:5,1:2,2:11,3:8,4:5,5:2,6:11,7:8,8:5,9:2,10:11,11:8};
  addStarToPalace(palaces,'劫煞','minor2',JIESHA_TABLE[yZhiIdx]);

  // 陰煞依農曆月，不依出生年支。
  addStarToPalace(palaces,'陰煞','minor2',[2,0,10,8,6,4][(effectiveMonth-1)%6]);

  // ═══ 丙級星 ═══
  // 三台：左輔位置+日-1
  const zuofuPos=palaces.findIndex(p=>p.stars.some(s=>s.name==='左輔'));
  if(zuofuPos>=0){
    const zfBranch=DZ.indexOf(palaces[zuofuPos].branch);
    addStarToPalace(palaces,'三台','minor3',(zfBranch+lunar.day-1)%12);
  }
  // 八座：右弼位置-(日-1)
  const youbiPos=palaces.findIndex(p=>p.stars.some(s=>s.name==='右弼'));
  if(youbiPos>=0){
    const ybBranch=DZ.indexOf(palaces[youbiPos].branch);
    addStarToPalace(palaces,'八座','minor3',(ybBranch-lunar.day+1+120)%12);
  }
  // 台輔：依時支 午(6)起順行
  addStarToPalace(palaces,'台輔','minor3',(shi+6)%12);
  // 封誥：依時支 寅(2)起順行
  addStarToPalace(palaces,'封誥','minor3',(2+shi)%12);

  // ═══ 旬空＋截空（正副雙星法）═══
  // 旬空：六十甲子每旬空亡兩位
  const ganIdx_y = TG.indexOf(yGan);
  const zhiIdx_y = yZhiIdx;
  // 旬首天干永遠是甲(0), 旬首地支 = zhiIdx - ganIdx (mod 12)
  const xunShou = ((zhiIdx_y - ganIdx_y) % 12 + 12) % 12;
  // 空亡 = 旬首前兩位 = xunShou-2, xunShou-1 (mod 12)
  const xk1 = ((xunShou - 2) % 12 + 12) % 12;
  const xk2 = ((xunShou - 1) % 12 + 12) % 12;
  // Both void branches are retained, but only the matching year parity is primary.
  const primaryXun=xk1%2===yZhiIdx%2?xk1:xk2;
  addStarToPalace(palaces,'旬空','minor3',primaryXun);
  addStarToPalace(palaces,'副旬','minor3',primaryXun===xk1?xk2:xk1);

  // 截空（截路空亡）：依年干
  // 甲己→申酉, 乙庚→午未, 丙辛→辰巳, 丁壬→寅卯, 戊癸→子丑
  const JIEKONG_TABLE={甲:[8,9],己:[8,9],乙:[6,7],庚:[6,7],丙:[4,5],辛:[4,5],丁:[2,3],壬:[2,3],戊:[0,1],癸:[0,1]};
  const jk=JIEKONG_TABLE[yGan]||[0,1];
  const primaryJie=jk[yZhiIdx%2];
  addStarToPalace(palaces,'截空','minor3',primaryJie);
  addStarToPalace(palaces,'副截','minor3',jk[1-yZhiIdx%2]);

  // ═══ 博士十二星（依祿存位置+陰陽順逆）═══
  // 博士從祿存所在宮位起，陽男陰女順行，陰男陽女逆行
  const BOSHI_NAMES=['博士','力士','青龍','小耗','將軍','奏書','飛廉','喜神','病符','大耗','伏兵','官府'];
  const lucunIdx=LUCUN_TABLE[yGan]!==undefined?LUCUN_TABLE[yGan]:2;
  const boshiFwd=(gender==='male'&&YY_G[yGan]==='陽')||(gender==='female'&&YY_G[yGan]==='陰');
  const boshiDir=boshiFwd?1:-1;
  for(let bi=0;bi<12;bi++){
    const bIdx=((lucunIdx+bi*boshiDir)%12+12)%12;
    addStarToPalace(palaces,BOSHI_NAMES[bi],'minor3',bIdx);
  }

  // 四化
  const sihua = SIHUA_TABLE[yGan] || SIHUA_TABLE['甲'];
  const huaMap = [];
  [{type:'祿',label:'化祿'},{type:'權',label:'化權'},{type:'科',label:'化科'},{type:'忌',label:'化忌'}].forEach(h=>{
    const starName = sihua[h.type];
    palaces.forEach(p=>{
      const found = p.stars.find(s=>s.name===starName);
      if(found){
        found.hua = h.label;
        huaMap.push({star:starName, hua:h.label, palace:p.name});
      }
    });
  });

  // ═══ 宮干四化（自化/飛星）═══
  // 每宮有自己的天干（五虎遁），可以飛四化
  // 自化：宮干四化的星就在本宮 → 離心(↓)
  // 化入：對宮宮干四化的星在本宮 → 向心(↑)
  const selfHuaMap = []; // {palace, star, type, direction}
  // 先建立每宮天干（需要先有五虎遁）
  const WUHU_YIN_PRE = {'甲':'丙','己':'丙','乙':'戊','庚':'戊',
                     '丙':'庚','辛':'庚','丁':'壬','壬':'壬','戊':'甲','癸':'甲'};
  const yinGanPre = WUHU_YIN_PRE[yGan] || '甲';
  const yinGanIdxPre = TG.indexOf(yinGanPre);
  function getPalaceGanPre(branchIdx){
    return TG[(yinGanIdxPre + ((branchIdx - 2 + 12) % 12)) % 10];
  }

  palaces.forEach((p, pi)=>{
    const bIdx = DZ.indexOf(p.branch);
    const pGan = getPalaceGanPre(bIdx);
    p.gan = pGan; // 存入宮干
    const pSihua = SIHUA_TABLE[pGan] || SIHUA_TABLE['甲'];

    // 檢查自化（宮干四化的星在本宮）
    [{type:'祿',label:'化祿'},{type:'權',label:'化權'},{type:'科',label:'化科'},{type:'忌',label:'化忌'}].forEach(h=>{
      const starName = pSihua[h.type];
      const inThisPalace = p.stars.find(s=>s.name===starName);
      if(inThisPalace){
        // 自化：離心(↓)
        if(!inThisPalace.selfHua) inThisPalace.selfHua = [];
        inThisPalace.selfHua.push({type:h.label, direction:'↓', from:p.name});
        selfHuaMap.push({palace:p.name, star:starName, type:h.label, direction:'↓'});
      }
    });
  });

  // 檢查向心自化（正統：對宮宮干四化使本宮星曜四化 → 向心↑）
  // v80.48 治本：自化(離心/向心)是「本宮↔對宮」的直線力量；全12宮的宮干飛化屬「飛宮四化(飛星)」，
  //   是拋物線力量，已另存於 feiGongHua，不可混入自化。舊 v35「查全部12宮」把飛宮誤當向心自化，
  //   造成同一顆星被多宮飛化、自化爆量（已查證：許銓仁/北派四化/紫微學堂——向心自化只取對宮）。
  palaces.forEach((targetP, targetIdx)=>{
    // 只取 targetP 的「對宮」當向心自化來源（對宮＝地支相差6）
    const _tgtBr = DZ.indexOf(targetP.branch);
    palaces.forEach((sourceP, sourceIdx)=>{
      if(sourceIdx === targetIdx) return; // 自己飛自己=自化（離心），已處理
      const _srcBr = DZ.indexOf(sourceP.branch);
      if(((_tgtBr + 6) % 12) !== _srcBr) return; // 非對宮 → 屬飛宮四化、非向心自化，略過
      const srcGan = sourceP.gan;
      const srcSihua = SIHUA_TABLE[srcGan] || SIHUA_TABLE['甲'];
      
      [{type:'祿',label:'化祿'},{type:'權',label:'化權'},{type:'科',label:'化科'},{type:'忌',label:'化忌'}].forEach(h=>{
        const starName = srcSihua[h.type];
        const inTargetPalace = targetP.stars.find(s=>s.name===starName);
        if(inTargetPalace){
          // 化入：向心(↑) — 從 sourceP 飛入 targetP
          if(!inTargetPalace.flyInHua) inTargetPalace.flyInHua = [];
          // 避免重複（同一顆星同一種化從同一宮飛入）
          const _exists = inTargetPalace.flyInHua.some(fh => fh.type === h.label && fh.from === sourceP.name);
          if(!_exists){
            inTargetPalace.flyInHua.push({type:h.label, direction:'↑', from:sourceP.name});
            selfHuaMap.push({palace:targetP.name, star:starName, type:h.label, direction:'↑', from:sourceP.name});
          }
        }
      });
    });
  });

  // ═══ 十二長生排列 ═══
  // 依五行局的五行 + 陰陽男女決定順逆
  // 五行長生起點: 金→巳, 木→亥, 水→申, 火→寅, 土→申
  const CHANGSHENG_START = {金:5, 木:11, 水:8, 火:2, 土:8};
  const CHANGSHENG_NAMES = ['長生','沐浴','冠帶','臨官','帝旺','衰','病','死','墓','絕','胎','養'];
  const juEl = {2:'水',3:'木',4:'金',5:'土',6:'火'}[wuxingJu] || '金';
  const csStart = CHANGSHENG_START[juEl] !== undefined ? CHANGSHENG_START[juEl] : 5;
  // 陽順陰逆：陽男陰女順排，陰男陽女逆排
  const yGanYY_cs=YY_G[yGan]; // 陽/陰
  const dxFwd_cs=(gender==='male'&&yGanYY_cs==='陽')||(gender==='female'&&yGanYY_cs==='陰');
  const csDir = dxFwd_cs ? 1 : -1;
  palaces.forEach(p=>{
    const bIdx = DZ.indexOf(p.branch);
    const steps = ((bIdx - csStart) * csDir % 12 + 12) % 12;
    p.changsheng = CHANGSHENG_NAMES[steps] || '';
  });

  // 命主採命宮地支；年支命主另屬中州派設定，本版不混用。
  const MING_ZHU={0:'貪狼',1:'巨門',2:'祿存',3:'文曲',4:'廉貞',5:'武曲',6:'破軍',7:'武曲',8:'廉貞',9:'文曲',10:'祿存',11:'巨門'};
  // 身主星 (以年支決定)
  const SHEN_ZHU={0:'火星',1:'天相',2:'天梁',3:'天同',4:'文昌',5:'天機',6:'火星',7:'天相',8:'天梁',9:'天同',10:'文昌',11:'天機'};
  const yZhiIdx2=DZ.indexOf(yZhi);
  const mingZhu=MING_ZHU[mingIdx];
  const shenZhu=SHEN_ZHU[yZhiIdx2]||'火星';

  // ═══ 大限（紫微斗數大運）═══
  // 大限起始歲=五行局局數，每十年一宮
  // 陽男陰女順行，陰男陽女逆行
  const yGanYY=YY_G[yGan]; // 陽/陰
  const dxFwd=(gender==='male'&&yGanYY==='陽')||(gender==='female'&&yGanYY==='陰');
  const dxDir=dxFwd?1:-1;
  const dxStartAge=wuxingJu; // 大限起始歲=五行局數

  // ═══ 五虎遁：年干 → 寅宮天干 → 排定12宮天干 ═══
  // 口訣：甲己之年丙作首，乙庚之歲戊為頭，
  //       丙辛之年從庚起，丁壬壬寅順水流，戊癸甲寅好追求。
  const WUHU_YIN = {'甲':'丙','己':'丙','乙':'戊','庚':'戊',
                     '丙':'庚','辛':'庚','丁':'壬','壬':'壬','戊':'甲','癸':'甲'};
  const yinGan = WUHU_YIN[yGan] || '甲';
  const yinGanIdx = TG.indexOf(yinGan);
  // 十二宮天干：從寅(idx=2)開始，寅=yinGan, 卯=yinGan+1, 辰=yinGan+2...
  // 宮位地支idx → 天干idx: ganOfBranch[branchIdx] = TG[(yinGanIdx + (branchIdx-2+12)%12) % 10]
  function getPalaceGan(branchIdx){
    return TG[(yinGanIdx + ((branchIdx - 2 + 12) % 12)) % 10];
  }

  // Every time layer names its twelve palaces from its own Ming branch.
  // Keep natal identity and period identity together; do not move natal stars.
  function periodPalaces(mingBranchIndex, layer) {
    return ZW_PALACES.map(function(name, offset) {
      const branch = DZ[(mingBranchIndex - offset + 24) % 12];
      const natal = palaces.find(function(p){return p.branch === branch;});
      return {name:name, branch:branch, natalPalace:natal ? natal.name : '', layer:layer};
    });
  }
  function periodHua(star, hua, natal, mapping, layer, stem) {
    const period = mapping.find(function(p){return p.branch === natal.branch;});
    return {star:star, hua:hua, palace:natal.name, palaceBranch:natal.branch,
      natalPalace:natal.name, periodPalace:period ? period.name : '', layer:layer, stem:stem};
  }
  // Flow stars keep their own time layer and never alter natal placement.
  // Setup verses 48–49 / iztro author location.ts; 流曲 is a named optional
  // Zhongzhou variant, not silently mixed into the default common-seven policy.
  function periodFlowStars(stem, branch, mapping, layer) {
    const lu=LUCUN_TABLE[stem],kui=TIANKU_TABLE[stem],yue=TIANYUE_TABLE[stem],ma=TIANMA_TABLE[branch];
    const chang={甲:5,乙:6,丙:8,丁:9,戊:8,己:9,庚:11,辛:0,壬:2,癸:3};
    const qu={甲:9,乙:8,丙:6,丁:5,戊:6,己:5,庚:3,辛:2,壬:0,癸:11};
    const positions=[['祿存',lu],['擎羊',(lu+1)%12],['陀羅',(lu+11)%12],['天魁',kui],['天鉞',yue],['天馬',ma],['文昌',chang[stem]]];
    if(flowStarPolicy==='ZHONGZHOU_8')positions.push(['文曲',qu[stem]]);
    return positions.map(function(pair){
      const br=DZ[pair[1]],p=mapping.find(p=>p.branch===br);
      if(!p)throw new Error('流曜落宮資料不完整。');
      return {star:pair[0],displayName:(layer==='大限'?'運':'流')+pair[0],branch:br,natalPalace:p.natalPalace,periodPalace:p.name,layer:layer,stem:stem,referenceBranch:branch,policy:flowStarPolicy};
    });
  }
  const daXian=[];
  for(let i=0;i<12;i++){
    const ageStart=dxStartAge+i*10;
    const ageEnd=ageStart+9;
    const curAge=currentAge; // 虛歲（紫微大限以虛歲計：出生即1歲，與文墨天機一致）
    const isCur=curAge>=ageStart&&curAge<=ageEnd;

    // 大限宮位地支：命宮出發，順/逆行
    const dxBranchIdx=((mingIdx+i*dxDir)%12+12)%12;
    const dxBranch=DZ[dxBranchIdx];
    const dxPalaces=periodPalaces(dxBranchIdx, '大限');
    
    // 大限天干：該宮位地支對應的天干（五虎遁）
    const dxGan=getPalaceGan(dxBranchIdx);

    // 找大限宮位對應的原盤宮位
    const origPalace=palaces.find(p=>p.branch===dxBranch);
    const dxPalaceName=origPalace?origPalace.name:'';
    const dxStars=origPalace?origPalace.stars:[];

    // 大限四化（依大限天干）
    const dxSihua=SIHUA_TABLE[dxGan]||SIHUA_TABLE['甲'];
    const dxHua=[];
    [{type:'祿',label:'化祿'},{type:'權',label:'化權'},{type:'科',label:'化科'},{type:'忌',label:'化忌'}].forEach(h=>{
      const sn=dxSihua[h.type];
      palaces.forEach(p=>{
        const found=p.stars.find(s=>s.name===sn);
        if(found) dxHua.push(periodHua(sn,h.label,p,dxPalaces,'大限',dxGan));
      });
    });

    // ═══ 大限吉凶評估（紫微斗數象徵體系）═══
    const hasMajor=dxStars.filter(s=>s.type==='major');
    const hasLucky=dxStars.filter(s=>['lucky','minor'].includes(s.type));
    const hasSha=dxStars.filter(s=>s.type==='sha');

    // 用analyzePalace做完整宮位分析（含廟旺落陷+吉煞組合+特殊格局）
    const dxAnalysis=analyzePalace(origPalace, dxBranchIdx);
    let dxScore=dxAnalysis.score - 50; // 修scale：analyzePalace為0-100基準50，須回正到0中心，否則下面門檻永遠破表→全大吉
    let dxNotes=dxAnalysis.notes.map(function(n){return '大限命宮所疊本命星組：'+n;});

    // 大限四化飛入各宮的影響（權重放大到與0中心尺度相稱）
    dxHua.forEach(h=>{
      // 四化飛入本命盤的對應宮位
      const targetPalace=palaces.find(p=>p.name===h.palace);
      if(h.hua==='化祿'){
        dxScore+=6;
        dxNotes.push('大限'+h.star+'化祿入'+h.palace+'（'+h.star+'帶來'+h.palace+'領域的機會）');
      }
      if(h.hua==='化權'){
        dxScore+=3;
        dxNotes.push('大限'+h.star+'化權入'+h.palace+'（'+h.palace+'領域有掌控力）');
      }
      if(h.hua==='化科'){
        dxScore+=2;
        dxNotes.push('大限'+h.star+'化科入'+h.palace+'（'+h.palace+'領域有貴人）');
      }
      if(h.hua==='化忌'){
        dxScore-=8;
        dxNotes.push('大限'+h.star+'化忌入'+h.palace+'（'+h.palace+'領域有困擾）');
        // 四化疊加：大限化忌+原盤化忌=雙忌（大凶）
        if(targetPalace){
          const origJi=targetPalace.stars.find(s=>s.hua==='化忌');
          if(origJi){dxScore-=6;dxNotes.push('⚠ 大限化忌疊原盤化忌於'+h.palace+'（雙忌同宮，須合參星組與運限條件）');}
        }
      }
    });
    // 夾制範圍，避免主星廟旺+祿權衝破或雙忌探底失真
    dxScore=Math.max(-25,Math.min(25,dxScore));

    // 大限宮位象徵含義（走到什麼宮=人生主題）
    const DX_THEME={
      命宮:'自我發展期',兄弟:'人脈拓展期',夫妻:'感情重點期',子女:'創造力/子女期',
      財帛:'理財重點期',疾厄:'健康注意期',遷移:'變動發展期',交友:'社交擴展期',
      官祿:'事業衝刺期',田宅:'安家置業期',福德:'心靈成長期',父母:'長輩/學業期'
    };
    const dxTheme=DX_THEME[dxPalaceName]||'';

    let dxLevel='平';
    if(dxScore>=11) dxLevel='大吉';
    else if(dxScore>=5) dxLevel='中吉';
    else if(dxScore>=2) dxLevel='小吉';
    else if(dxScore>=-2) dxLevel='平';
    else if(dxScore>=-5) dxLevel='小凶';
    else if(dxScore>=-11) dxLevel='中凶';
    else dxLevel='大凶';

    daXian.push({
      ageStart,ageEnd,isCurrent:isCur,
      branch:dxBranch,gan:dxGan,
      palaceName:dxPalaceName,theme:dxTheme,palaces:dxPalaces,
      stars:hasMajor.map(s=>s.name),
      lucky:hasLucky.map(s=>s.name),
      sha:hasSha.map(s=>s.name),
      bright:dxAnalysis.bright,
      hua:dxHua,flowStars:periodFlowStars(dxGan,dxBranch,dxPalaces,'大限'),notes:dxNotes,
      level:dxLevel,score:dxScore
    });
  }

  // ═══ 流年盤（依流年地支走宮）═══
  // 流年命宮 = 流年地支所在宮位（斗數流年以太歲入命）
  function getLiuNianZw(lnYear){
    if(!Number.isInteger(lnYear)||lnYear<1900||lnYear>2300)throw new Error('流年年度無效。');
    const lnZI=((lnYear-4)%12+12)%12;
    const lnGI=((lnYear-4)%10+10)%10;
    const lnZ=DZ[lnZI], lnG=TG[lnGI];
    const lnPalaces=periodPalaces(lnZI, '流年');
    // 流年命宮 = 太歲地支所在的原盤宮位
    const lnMingPalace=palaces.find(p=>p.branch===lnZ);
    // 流年四化（依流年天干）
    const lnSH=SIHUA_TABLE[lnG]||SIHUA_TABLE['甲'];
    const lnHua=[];
    [{type:'祿',label:'化祿'},{type:'權',label:'化權'},{type:'科',label:'化科'},{type:'忌',label:'化忌'}].forEach(h=>{
      const sn=lnSH[h.type];
      palaces.forEach(p=>{
        const found=p.stars.find(s=>s.name===sn);
        if(found) lnHua.push(periodHua(sn,h.label,p,lnPalaces,'流年',lnG));
      });
    });
    // ═══ 流年吉凶（紫微象徵體系）═══
    const lnBranchIdx=DZ.indexOf(lnZ);
    const lnAnalysis=analyzePalace(lnMingPalace, lnBranchIdx);
    let lnScore=lnAnalysis.score-50;
    let lnNotes=lnAnalysis.notes.map(function(n){return '流年命宮所疊本命星組：'+n;});

    // ═══ 三方四正合參 ═══
    // 命宮的三方四正：財帛宮(宮位4)、官祿宮(宮位8)、遷移宮(宮位6=對宮)
    // palaces[i] 的 i 是宮位序號：0命,1兄弟,2夫妻,3子女,4財帛,5疾厄,6遷移,7交友,8官祿,9田宅,10福德,11父母
    // 流年命宮所在的地支，找出三方四正在哪些原盤宮位
    if(lnMingPalace){
      const lnMingBr=lnMingPalace.branch;
      const lnMingBrIdx=DZ.indexOf(lnMingBr);
      // 三合宮=地支+4、+8；對宮=地支+6
      const sfBranches=[
        {brIdx:(lnMingBrIdx+4)%12, label:'三合位', w:0.3},
        {brIdx:(lnMingBrIdx+8)%12, label:'三合位', w:0.3},
        {brIdx:(lnMingBrIdx+6)%12, label:'對宮', w:0.4}
      ];
      sfBranches.forEach(function(sf){
        var sp=palaces.find(function(p){return DZ.indexOf(p.branch)===sf.brIdx;});
        if(!sp) return;
        var spBrIdx=DZ.indexOf(sp.branch);
        var spA=analyzePalace(sp, spBrIdx);
        lnScore+=(spA.score-50)*sf.w;
        // 三方四正有四化才記錄
        sp.stars.forEach(function(s){
          if(s.hua==='化祿') lnNotes.push(sf.label+'本命'+sp.name+'有'+s.name+'生年化祿（本命背景）');
          if(s.hua==='化忌') lnNotes.push(sf.label+'本命'+sp.name+'有'+s.name+'生年化忌（本命背景）');
        });
        var spSha=sp.stars.filter(function(s){return s.type==='sha';});
        if(spSha.length>=2) lnNotes.push(sf.label+sp.name+'煞星聚集（壓力來源）');
      });
    }

    // 流年四化飛入各宮
    lnHua.forEach(h=>{
      const targetP=palaces.find(p=>p.name===h.palace);
      if(h.hua==='化祿'){
        lnScore+=1.5;
        lnNotes.push(h.star+'化祿入'+h.palace);
        // 化祿入命/財/官=大好
        if(['命宮','財帛','官祿'].includes(h.palace)) lnScore+=0.5;
      }
      if(h.hua==='化權'){lnScore+=1;lnNotes.push(h.star+'化權入'+h.palace);}
      if(h.hua==='化科'){lnScore+=0.5;lnNotes.push(h.star+'化科入'+h.palace);}
      if(h.hua==='化忌'){
        lnScore-=1.5;
        lnNotes.push(h.star+'化忌入'+h.palace);
        if(['命宮','財帛','官祿','疾厄'].includes(h.palace)) lnScore-=0.5;
        // 流年化忌疊原盤化忌
        if(targetP){
          const origJi=targetP.stars.find(s=>s.hua==='化忌');
          if(origJi){lnScore-=2;lnNotes.push('⚠ 流年化忌疊原盤化忌於'+h.palace+'（雙忌）');}
        }
        // 流年化忌疊大限化忌
        const targetAge=ageAtLunarYear(lnYear);
        const curDx=daXian.find(d=>targetAge>=d.ageStart&&targetAge<=d.ageEnd);
        if(curDx&&curDx.hua){
          const dxJi=curDx.hua.find(dh=>dh.palace===h.palace&&dh.hua==='化忌');
          if(dxJi){lnScore-=2;lnNotes.push('流年化忌疊大限化忌於本命'+h.palace+'（雙忌同宮，須合參星組與運限條件）');}
        }
      }
    });

    // 流年走宮象徵
    const lnMingName=lnMingPalace?lnMingPalace.name:'';
    const LN_FOCUS={
      命宮:'自我表現',財帛:'財運收入',官祿:'事業升遷',夫妻:'感情婚姻',
      疾厄:'健康注意',遷移:'外出變動',交友:'人際社交',田宅:'家庭居住',
      子女:'創意/子女',福德:'心靈享受',兄弟:'人脈合作',父母:'長輩/學業'
    };
    const lnFocus=LN_FOCUS[lnMingName]||'';

    return {year:lnYear,gz:lnG+lnZ,mingPalace:lnMingName,mingBranch:lnZ,palaces:lnPalaces,focus:lnFocus,hua:lnHua,flowStars:periodFlowStars(lnG,lnZ,lnPalaces,'流年'),score:lnScore,scoreBasis:'ZERO_CENTERED_RELATIVE_MODEL',notes:lnNotes,bright:lnAnalysis.bright};
  }

  // ═══ 流月盤（斗君安流月命宮；月份干支另列）═══
  // 正月=寅(2), 二月=卯(3), ... 十二月=丑(1)
  // 流月天干 = 五虎遁（流年天干→正月天干→逐月遞推）
  function getLiuYueZw(lnYear) {
    if(!Number.isInteger(lnYear)||lnYear<1900||lnYear>2300)throw new Error('流月年度無效。');
    // 流年天干地支
    var lnGI = ((lnYear - 4) % 10 + 10) % 10;
    var lnGan = TG[lnGI];

    // 五虎遁：流年天干 → 正月(寅)天干
    var LY_WUHU = {'甲':'丙','己':'丙','乙':'戊','庚':'戊',
                    '丙':'庚','辛':'庚','丁':'壬','壬':'壬','戊':'甲','癸':'甲'};
    var yinGanForYear = LY_WUHU[lnGan] || '甲';
    var yinGanIdx = TG.indexOf(yinGanForYear);

    var months = [];
    var MONTH_NAMES = ['正月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月'];

    for (var m = 1; m <= 12; m++) {
      // 流月地支：正月=寅(2), 二月=卯(3)... 十二月=丑(1)
      var mBranchIdx = ((((lnYear-4)%12+12)%12 - effectiveMonth + shi + m)%12+12)%12;
      var mBranch = DZ[(m+1)%12]; // 農曆月干支與斗君命宮分开記錄
      // 流月天干：從正月天干開始，逐月+1
      var mGanIdx = (yinGanIdx + (m - 1)) % 10;
      var mGan = TG[mGanIdx];

      // 流月命宮依生月、生時與流年太歲起斗君，不等於月份地支
      var mMingPalace = palaces.find(function(p) { return p.branch === DZ[mBranchIdx]; });
      if (!mMingPalace) continue;
      var mPalaces = periodPalaces(mBranchIdx, '流月');

      // 流月四化（依流月天干）
      var mSH = SIHUA_TABLE[mGan] || SIHUA_TABLE['甲'];
      var mHua = [];
      [{type:'祿',label:'化祿'},{type:'權',label:'化權'},{type:'科',label:'化科'},{type:'忌',label:'化忌'}].forEach(function(h) {
        var sn = mSH[h.type];
        palaces.forEach(function(p) {
          var found = p.stars.find(function(s) { return s.name === sn; });
          if (found) mHua.push(periodHua(sn,h.label,p,mPalaces,'流月',mGan));
        });
      });

      // 流月吉凶評分
      var mScore = 0;
      var mNotes = [];

      // 宮位基礎分析
      if (typeof analyzePalace === 'function') {
        try {
          var mAnalysis = analyzePalace(mMingPalace, mBranchIdx);
          // analyzePalace is centred on 50; month/year/decade model scores on 0.
          mScore = mAnalysis.score - 50;
          mNotes = mAnalysis.notes ? mAnalysis.notes.slice() : [];
        } catch(e) {}
      } else {
        // fallback: 簡易評分
        var mjStars = mMingPalace.stars.filter(function(s) { return s.type === 'major'; });
        var luckyStars = mMingPalace.stars.filter(function(s) { return s.type === 'lucky'; });
        var shaStars = mMingPalace.stars.filter(function(s) { return s.type === 'sha'; });
        mScore = luckyStars.length * 1.5 - shaStars.length * 1.5;
        if (mjStars.length) mScore += 1;
      }

      // 流月四化影響
      mHua.forEach(function(h) {
        if (h.hua === '化祿') { mScore += 1.5; }
        if (h.hua === '化權') { mScore += 1; }
        if (h.hua === '化科') { mScore += 0.5; }
        if (h.hua === '化忌') {
          mScore -= 1.5;
          // 疊原盤化忌
          var targetP = palaces.find(function(p) { return p.name === h.palace; });
          if (targetP) {
            var origJi = targetP.stars.find(function(s) { return s.hua === '化忌'; });
            if (origJi) { mScore -= 1.5; mNotes.push('流月化忌疊原盤化忌於' + h.palace); }
          }
        }
      });

      // 流月走宮焦點
      var LM_FOCUS = {
        命宮:'自我', 財帛:'財運', 官祿:'事業', 夫妻:'感情',
        疾厄:'健康', 遷移:'外出', 交友:'人際', 田宅:'家庭',
        子女:'創意', 福德:'心靈', 兄弟:'合作', 父母:'學業'
      };

      months.push({
        month: m,
        monthName: MONTH_NAMES[m - 1],
        calendar:'農曆平月（閏月須另按政策判定）',mingBranch:DZ[mBranchIdx],method:'斗君',
        gz: mGan + mBranch,
        mingPalace: mMingPalace.name, palaces: mPalaces,
        focus: LM_FOCUS[mMingPalace.name] || '',
        hua: mHua,
        score: Math.round(mScore * 10) / 10,
        scoreBasis:'ZERO_CENTERED_RELATIVE_MODEL',
        notes: mNotes.slice(0, 4)
      });
    }

    return months;
  }

  // ═══ 小限（流年個人宮位走法）═══
  // 小限按出生年支三合起宮，男順女逆；虛歲每年正月初一遞增。
  function getXiaoXian(targetAge) {
    if (!Number.isInteger(targetAge) || targetAge < 1) return null;
    var startIdx = [10,7,4,1,10,7,4,1,10,7,4,1][yZhiIdx];
    var dir = gender === 'male' ? 1 : -1;
    var xxBranchIdx = ((startIdx + (targetAge - 1) * dir) % 12 + 12) % 12;
    var xxPalace = palaces.find(function(p) { return DZ.indexOf(p.branch) === xxBranchIdx; });
    if (!xxPalace) return null;
    var xxAnalysis = analyzePalace(xxPalace, xxBranchIdx);
    return { age: targetAge, palace: xxPalace.name, branch: DZ[xxBranchIdx], score: xxAnalysis.score, notes: xxAnalysis.notes };
  }

  var patternAssessment=assessZiweiPatterns(palaces);
  var patterns=patternAssessment.patterns;
  var starComboNotes=patterns.map(function(p){return p.name+'：'+p.desc;});

  // ═══ 來因宮（欽天派：宮干 == 生年天干 那一宮 = 此生課題與內在驅力的根源）═══
  var laiYin = null;
  try {
    var _lyP = palaces.find(function (p) { return p.gan === yGan && p.branch!=='子' && p.branch!=='丑'; });
    if (_lyP) laiYin = { name: _lyP.name, branch: _lyP.branch, gan: _lyP.gan };
  } catch (_e) {}

  // ═══ 飛宮四化（宮與宮的因果鏈：每宮宮干把祿/權/科/忌飛去哪一宮）═══
  var feiGongHua = [];
  try {
    var _starPalace = {};
    palaces.forEach(function (p) { (p.stars || []).forEach(function (s) { if (s && s.name) _starPalace[s.name] = p.name; }); });
    var _km = { '祿': 'lu', '權': 'quan', '科': 'ke', '忌': 'ji' };
    palaces.forEach(function (p) {
      var ps = SIHUA_TABLE[p.gan] || SIHUA_TABLE['甲'];
      var row = { palace: p.name, gan: p.gan };
      ['祿', '權', '科', '忌'].forEach(function (t) {
        var star = ps[t];
        var land = _starPalace[star] || '?';
        row[_km[t]] = { star: star, to: land, self: (land === p.name) };
      });
      feiGongHua.push(row);
    });
  } catch (_e) {}

  const integrity=validateZiweiPlacements(palaces,huaMap);
  const result={integrity,palaces, mingIdx, shenIdx, yGan, yZhi, wuxingJu, sihua: huaMap, selfHua: selfHuaMap, laiYin: laiYin, feiGongHua: feiGongHua, lunar, mingZhu, shenZhu, mingGan, ziweiIdx, tianfuIdx, daXian, getLiuNianZw, getLiuYueZw, getXiaoXian, patterns, starComboNotes, engineVersion:'20260917-policy1', birthInput:birthInput,birthLunar:birthLunar, calculationPolicy:calculationPolicy, currentAge:currentAge, orthodoxMode:false, notes:['農曆轉換採 Lunar.Solar 精準換算，未載入時停止排盤，不使用粗估農曆。','依 calculationPolicy 所列安星與曆法版本排盤；相對評分不代表機率或已驗證的預測準確度。']};
  result.patternAssessment=patternAssessment;
  result.calculatedFacts=ziweiCalculatedFacts(result);
  // Legacy rendering properties above remain aliases for existing screens only.
  result.heuristics={patterns:patterns,starComboNotes:starComboNotes,decades:daXian.map(function(d){return {ageStart:d.ageStart,score:d.score,level:d.level,theme:d.theme};})};
  result.candidateInterpretation=patterns;
  return result;
  } catch(_zwErr) {
    console.error('[computeZiwei] 排盤失敗:', _zwErr && _zwErr.message ? _zwErr.message : _zwErr, _zwErr && _zwErr.stack ? _zwErr.stack : '');
    window._jyZiweiError = (_zwErr && _zwErr.message) ? _zwErr.message : String(_zwErr);
    return null;
  }
}

function addStarToPalace(palaces, name, type, zhiIdx){
  const pIdx = palaces.findIndex(p=> DZ.indexOf(p.branch) === zhiIdx);
  if(pIdx>=0) palaces[pIdx].stars.push({name, type});
}

// ═══ 紫微斗數整合進八字大運流年吉凶 ═══
// 在S.bazi和S.ziwei都算完後呼叫

// ── mergeZiweiIntoBazi + helper (lines 22033-22130) ──
function mergeZiweiIntoBazi(){
  if(!S.bazi||!S.ziwei)return;
  // 八字大運用出生後周歲區間；紫微大限用虛歲，不能直接按相同歲數配對或加權打分。
  S.bazi.ziweiReference={policy:'SEPARATE_SYSTEMS_NO_SCORE_MERGE',mingPalace:S.ziwei.palaces[0].branch,
    daXian:S.ziwei.daXian.map(function(d){return {ageStart:d.ageStart,ageEnd:d.ageEnd,palaceName:d.palaceName,ageBasis:'農曆虛歲'};})};
}

function getWuxingJu(gan, zhi){
  // 納音五行局：命宮干支→納音→五行→局數
  // 納音五行: 金=4, 木=3, 水=2, 火=6, 土=5
  const NY_EL=['金','火','木','土','金','火','水','土','金','木','水','土','火','木','水','金','火','木','土','金','火','水','土','金','木','水','土','火','木','水'];
  const JU={'金':4,'木':3,'水':2,'火':6,'土':5};
  const gi=TG.indexOf(gan), zi=DZ.indexOf(zhi);
  if(gi<0||zi<0)throw new Error('命宮干支無效。');
  let idx=-1;
  for(let n=0;n<60;n++)if(n%10===gi&&n%12===zi){idx=n;break;}
  if(idx<0)throw new Error('命宮干支不在六十甲子中。');
  const nyEl=NY_EL[Math.floor(idx/2)];
  return JU[nyEl]||4;
}

function getZiweiPalaceByJu(ju, lunarDay){
  // 安紫微：補到可整除局數，從寅起商數；補數奇退、偶進。
  // 對照：https://github.com/SylarLong/iztro/blob/main/src/star/location.ts#getStartIndex
  if(![2,3,4,5,6].includes(ju) || !Number.isInteger(lunarDay) || lunarDay<1 || lunarDay>30) throw new Error('紫微局數或農曆日無效。');
  const offset=(ju-lunarDay%ju)%ju;
  const quotient=(lunarDay+offset)/ju;
  return ((2+quotient-1+(offset%2===0?offset:-offset))%12+12)%12;
}


// ── renderZiwei display (lines 22131-22572) ──
function renderZiwei(){
  const zw = S.ziwei;
  const st = (window.getZiweiSettings ? window.getZiweiSettings() : {});
  const host = document.getElementById('d-ziwei');
  if(host){
    host.classList.toggle('zw-bold-major', !!st.bold_major_assist);
    host.classList.toggle('zw-concise', !!st.concise_mode);
    host.classList.toggle('zw-sixsha-black', !!st.six_sha_black);
  }
  if(!zw){document.getElementById('d-ziwei-info').innerHTML='<p class="text-dim">請先填寫出生資料</p>';return}

  const _zwType = (S.form && S.form.type) || 'general';
  const _zwQuestion = (S.form && S.form.question) || '';
  let _zwQ = null, _zwNarr = null;
  try { if(typeof analyzeZiweiQuestion==='function') _zwQ = analyzeZiweiQuestion(zw, _zwType, _zwQuestion); } catch(e) {}
  try { if(typeof buildZiweiNarrative==='function' && _zwQ) _zwNarr = buildZiweiNarrative(_zwQ, zw, _zwType); } catch(e) {}

  // ═══ 白話結論卡片 ═══
  const _zwMing=zw.palaces[0];
  const _zwMajors=_zwMing?_zwMing.stars.filter(s=>s.type==='major'):[];
  const _STAR_LIFE={紫微:'你天生有老闆格局，適合帶團隊而不是被管',天機:'你腦子轉很快，但容易想太多、做太少',太陽:'你天生自帶光環，適合面對群眾的工作',武曲:'你做事講效率、重結果，天生的業績王',天同:'你追求舒適和平衡，壓力大時會想逃避',廉貞:'你自尊心極強，不服輸，但情緒容易失控',天府:'你穩重不冒進，適合管理資產和長期規劃',太陰:'你心思細膩、有計畫，但容易內耗',貪狼:'你多才多藝，什麼都想學，但容易分心',巨門:'你分析能力極強，但嘴巴容易惹禍',天相:'你正派可靠，是天生的二把手和協調者',天梁:'你大器晚成，年輕時多磨練反而是好事',七殺:'你是行動派，壓力下反而更有爆發力',破軍:'你不怕改變，但要確認方向再全力投入'};
  const _zwStarName=_zwMajors.length?_zwMajors[0].name:'';
  const _zwLifeTip=_STAR_LIFE[_zwStarName]||'';
  const _zwCurDx=zw.daXian?zw.daXian.find(d=>d.isCurrent):null;
  let _zwInsight='';
  if(_zwLifeTip) _zwInsight+=`<div class="insight-card"><div class="insight-title">💫 ${_zwLifeTip}</div><div class="insight-sub">命宮主星：${_zwMajors.map(s=>s.name).join('、')}</div></div>`;
  if(_zwCurDx) _zwInsight+=`<div class="insight-card" style="border-left-color:#60a5fa"><div class="insight-title" style="color:#60a5fa">📍 ${_zwCurDx.theme||_zwCurDx.palaceName+'期'}</div><div class="insight-sub">大限走「${_zwCurDx.palaceName}」宮（${_zwCurDx.ageStart}-${_zwCurDx.ageEnd}歲・${_zwCurDx.level}）</div></div>`;
  if(_zwInsight){
    const infoEl=document.getElementById('d-ziwei-info');
    if(infoEl) infoEl.insertAdjacentHTML('beforebegin',_zwInsight);
  }

  // Info - 白話版
  const shenPalace=zw.palaces.find(p=>p.isShen);
  const shenPalaceName=shenPalace?shenPalace.name:'';
  const juLabel=['水二','木三','金四','土五','火六'][[2,3,4,5,6].indexOf(zw.wuxingJu)]||'土五';
  const SHEN_MEANING={'命宮':'你一輩子最在意「自我」','兄弟':'你一輩子最在意「朋友與人脈」','夫妻':'你一輩子最在意「感情與婚姻」','子女':'你一輩子最在意「創造力與下一代」','財帛':'你一輩子最在意「錢財與資源」','疾厄':'你一輩子最在意「健康」','遷移':'你一輩子最在意「外在發展與變動」','交友':'你一輩子最在意「社交圈」','官祿':'你一輩子最在意「事業成就」','田宅':'你一輩子最在意「家庭與房產」','福德':'你一輩子最在意「精神滿足」','父母':'你一輩子最在意「長輩關係與學業」'};
  const shenTip = SHEN_MEANING[shenPalaceName] || '';
  document.getElementById('d-ziwei-info').innerHTML=`
    ${_zwQ ? `
    <div class="insight-card" style="margin-bottom:.7rem;border-left-color:${_zwQ.direction==='positive'?'#4ade80':_zwQ.direction==='negative'?'#f87171':'#d4af37'}">
      <div class="insight-title">🪐 紫微直判：${_zwQ.yesNoAnswer}</div>
      <div class="insight-sub">主題宮位：${_zwQ.palace} ｜ 分數：${_zwQ.score}/100 ｜ 信心度：${_zwQ.confidence}%</div>
      ${_zwNarr ? `<div style="margin-top:.45rem;font-size:.84rem;line-height:1.7"><p style="margin:.2rem 0"><strong>目前局面：</strong>${_zwNarr.situation}</p><p style="margin:.2rem 0;color:#fca5a5"><strong>風險：</strong>${_zwNarr.risk}</p><p style="margin:.2rem 0;color:var(--c-gold)"><strong>建議：</strong>${_zwNarr.advice}</p>${_zwNarr.timing?`<p style="margin:.2rem 0"><strong>應期：</strong>${_zwNarr.timing}</p>`:''}</div>`:''}
    </div>` : ''}
    <p>你的命盤格局：<strong>${juLabel}局</strong>（決定人生節奏快慢）</p>
    <p class="text-xs text-dim mt-xs">命主星：${zw.mingZhu} ｜ 身主星：${zw.shenZhu}</p>
    ${shenTip ? '<p class="text-xs mt-xs" style="color:#60a5fa">🎯 身宮在'+shenPalaceName+'：'+shenTip+'</p>' : ''}`;
  if(window.__plainHtml){ var _infoEl=document.getElementById('d-ziwei-info'); if(_infoEl) _infoEl.innerHTML = window.__plainHtml(_infoEl.innerHTML); }

  // 12宮格（4x4, 中間2x2空）
  // 排列順序 DZ idx: 辰(4)巳(5)午(6)未(7) / 卯(3)[空][空]申(8) / 寅(2)[空][空]酉(9) / 丑(1)子(0)亥(11)戌(10)
  const order = [
    [4,5,6,7],    // 辰巳午未
    [3,-1,-1,8],  // 卯 center center 申
    [2,-1,-1,9],  // 寅 center center 酉
    [1,0,11,10]   // 丑子亥戌
  ];

  let html = '<div class="zw-grid">';
  for(let row=0;row<4;row++){
    for(let col=0;col<4;col++){
      const idx = order[row][col];
      if(idx===-1){
        if(row===1&&col===1){
          // Center cell spans 2x2
          html+=`<div class="zw-cell zw-center" style="grid-column:2/4;grid-row:2/4">
            <div class="serif text-gold" style="font-size:1.1rem;margin-bottom:var(--sp-sm)">紫微斗數</div>
            <p class="text-dim text-xs">命宮：${DZ[zw.mingIdx]}</p>
            <p class="text-dim text-xs">年干：${zw.yGan}${zw.yZhi}</p>
          </div>`;
        }
        continue;
      }
      const palace = zw.palaces.find(p => DZ.indexOf(p.branch) === idx);
      if(!palace){html+=`<div class="zw-cell"><span class="zw-palace">${DZ[idx]}</span></div>`;continue}

      const isMing = palace.isMing;
      const isShen = palace.isShen;
      html+=`<div class="zw-cell${isMing?' active-palace':''}${isShen?' shen-palace':''}">
        <div class="zw-palace">${palace.name}${isMing?' ⭐':''}${isShen?'<span style="color:#9cf;font-size:.6rem;margin-left:3px">身</span>':''}</div>
        <div class="zw-branch">${palace.branch}</div>
        <div class="zw-stars">`;
      // 先排主星，再吉煞，再乙級
      const sortOrder={major:0,sha:1,lucky:2,minor:3,minor2:4,minor3:5};
      const sorted=[...palace.stars].sort((a,b)=>(sortOrder[a.type]||9)-(sortOrder[b.type]||9));
      const bIdx=DZ.indexOf(palace.branch);
      sorted.forEach(s=>{
        const cls = s.type==='major'?'major':s.type==='sha'?'text-danger':s.type==='minor2'?'zw-m2':s.type==='minor3'?'zw-m3':'minor';
        html+=`<span class="zw-star ${cls}">${s.name}</span>`;
        if(s.type==='major'||s.type==='lucky'||s.type==='minor'||s.type==='sha'){const br=getStarBright(s.name,bIdx);if(br.label&&br.label!=='平')html+=`<span class="zw-bright">${br.label}</span>`;}
        if(s.hua){
          const huaCls = s.hua.includes('祿')?'color:#4ade80':s.hua.includes('權')?'color:#d8b56a':s.hua.includes('科')?'color:#60a5fa':'color:#f87171';
          html+=`<span class="zw-hua" style="${huaCls}">${s.hua}</span>`;
        }
        // 自化標記
        if(s.selfHua&&s.selfHua.length) s.selfHua.forEach(sh=>html+=`<span class="zw-self-hua" style="color:#ff9800;font-size:.55rem" title="自化${sh.type}（離心）">${sh.direction}${sh.type.replace('化','')}</span>`);
        if(s.flyInHua&&s.flyInHua.length) s.flyInHua.forEach(fh=>html+=`<span class="zw-fly-hua" style="color:#4fc3f7;font-size:.55rem" title="從${fh.from}化入${fh.type}（向心）">${fh.direction}${fh.type.replace('化','')}</span>`);
      });
      // 十二長生
      if(palace.changsheng) html+=`<div class="zw-changsheng" style="font-size:.5rem;color:var(--c-text-muted);margin-top:2px">${palace.changsheng}</div>`;
      html+=`</div></div>`;
    }
  }
  html+='</div>';
  document.getElementById('d-ziwei-grid').innerHTML=window.__plainHtml ? window.__plainHtml(html) : html;

  // ── 大限走勢面板 ──
  var dxHtml = '';
  try {
    if(zw.daXian && zw.daXian.length){
      dxHtml += '<p class="text-dim text-xs" style="margin-bottom:.5rem">紫微大限每十年一個宮位輪轉，決定你那十年的整體運勢基調</p>';
      dxHtml += '<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:.8rem">';
      zw.daXian.forEach(function(dx){
        var bg = dx.isCurrent ? 'rgba(212,175,55,.2)' : 'rgba(255,255,255,.04)';
        var border = dx.isCurrent ? '2px solid var(--c-gold)' : '1px solid rgba(255,255,255,.1)';
        var levelColor = dx.level && dx.level.includes('吉') ? '#4ade80' : dx.level && dx.level.includes('凶') ? '#f87171' : 'var(--c-text-dim)';
        dxHtml += '<div style="padding:6px 10px;border-radius:6px;background:'+bg+';border:'+border+';font-size:.75rem;text-align:center;min-width:80px">' +
          '<div style="font-weight:600;color:'+(dx.isCurrent?'var(--c-gold)':'var(--c-text)')+'">'+dx.palaceName+'</div>' +
          '<div style="color:'+levelColor+';font-size:.7rem">'+(dx.level||'')+'</div>' +
          '<div style="opacity:.5;font-size:.6rem">'+dx.ageStart+'-'+dx.ageEnd+'歲</div>' +
          (dx.isCurrent?'<div style="font-size:.6rem;color:var(--c-gold)">◀ 目前</div>':'')+
          '</div>';
      });
      dxHtml += '</div>';
      var curDxZW = zw.daXian.find(function(d){return d.isCurrent;});
      if(curDxZW){
        var dxDetail = '<div style="padding:.6rem;background:rgba(212,175,55,.05);border-radius:8px;border-left:3px solid var(--c-gold)">';
        dxDetail += '<p style="margin:0;font-weight:600;color:var(--c-gold)">目前大限：'+curDxZW.palaceName+'（'+curDxZW.ageStart+'-'+curDxZW.ageEnd+'歲，'+curDxZW.level+'）</p>';
        var DX_PALACE_TALK = {
          '命宮':'大限走回命宮，重新認識自己的十年。自我意識和行動力增強。',
          '兄弟':'大限走兄弟宮，人脈合作是這十年重點。多結交志同道合的夥伴。',
          '夫妻':'大限走夫妻宮，感情是主旋律。已婚者婚姻有考驗或升華，未婚者有機會遇對象。',
          '子女':'大限走子女宮，創造力和子女相關事務是重點。適合投入創作或投資。',
          '財帛':'大限走財帛宮，財運是主軸。適合積極理財和投資布局。',
          '疾厄':'大限走疾厄宮，健康最需注意。定期體檢、養成好習慣。',
          '遷移':'大限走遷移宮，出外運重點。適合外出發展、搬家、擴大生活圈。',
          '僕役':'大限走僕役宮，人際關係是這十年功課。辨別真心朋友。',
          '官祿':'大限走官祿宮，事業主場。適合衝刺事業、建立專業口碑。',
          '田宅':'大限走田宅宮，家庭和不動產是重點。適合買房、穩固家庭。',
          '福德':'大限走福德宮，精神世界和內心是重心。適合修身養性。',
          '父母':'大限走父母宮，跟長輩關係和自我成長是重點。'
        };
        if(DX_PALACE_TALK[curDxZW.palaceName]) dxDetail += '<p style="margin:.5rem 0;font-size:.85rem;line-height:1.7">'+DX_PALACE_TALK[curDxZW.palaceName]+'</p>';
        if(curDxZW.hua && curDxZW.hua.length){
          dxDetail += '<div style="margin-top:.4rem">';
          curDxZW.hua.forEach(function(h){
            var hColor = h.hua==='化祿'?'#4ade80':h.hua==='化忌'?'#f87171':h.hua==='化權'?'var(--c-gold)':'#60a5fa';
            dxDetail += '<span style="display:inline-block;margin:2px 4px;padding:2px 8px;border-radius:4px;font-size:.72rem;background:rgba(255,255,255,.05);border:1px solid '+hColor+';color:'+hColor+'">'+h.star+h.hua+'→'+h.palace+'</span>';
          });
          dxDetail += '</div>';
          var dxJi = curDxZW.hua.find(function(h){return h.hua==='化忌';});
          if(dxJi) dxDetail += '<p style="margin:.3rem 0;font-size:.8rem;color:#f87171">⚠ 大限化忌入'+dxJi.palace+'，這十年需要特別留意的功課。</p>';
          var dxLu = curDxZW.hua.find(function(h){return h.hua==='化祿';});
          if(dxLu) dxDetail += '<p style="margin:.3rem 0;font-size:.8rem;color:#4ade80">✨ 大限化祿入'+dxLu.palace+'，這十年的能量紅利。</p>';
        }
        dxDetail += '</div>';
        dxHtml += dxDetail;
      }
    }
  } catch(e){}
  var dxElZW = document.getElementById('d-ziwei-daxian');
  if(dxElZW) dxElZW.innerHTML = window.__plainHtml ? window.__plainHtml(dxHtml) : dxHtml;

  // ── 今年流年面板 ──
  var lnHtmlZW = '';
  try {
    if(zw.getLiuNianZw){
      var thisYearZW = zw.calculationPolicy && zw.calculationPolicy.referenceLunarYear;
      if(!Number.isInteger(thisYearZW)){
        var refZW=new Date(Date.now()+8*3600000);
        thisYearZW=approxLunar(refZW.getUTCFullYear(),refZW.getUTCMonth()+1,refZW.getUTCDate()).year;
      }
      var zwLnR = zw.getLiuNianZw(thisYearZW);
      if(zwLnR){
        var lnLC = zwLnR.score >= 3 ? '#4ade80' : zwLnR.score <= -3 ? '#f87171' : 'var(--c-gold)';
        lnHtmlZW += '<div style="padding:.6rem;background:rgba(212,175,55,.05);border-radius:8px">';
        lnHtmlZW += '<p style="margin:0;font-weight:600"><span style="color:var(--c-gold)">農曆'+thisYearZW+'年</span> 流年命宮走「<span style="color:'+lnLC+'">'+zwLnR.mingPalace+'</span>」</p>';
        lnHtmlZW += '<p style="margin:.3rem 0;font-size:.85rem">干支：'+zwLnR.gz+' ｜ 本年度焦點：'+(zwLnR.focus||'綜合運勢')+'</p>';
        if(zwLnR.hua && zwLnR.hua.length){
          lnHtmlZW += '<div style="margin:.4rem 0">';
          zwLnR.hua.forEach(function(h){
            var hC2 = h.hua==='化祿'?'#4ade80':h.hua==='化忌'?'#f87171':h.hua==='化權'?'var(--c-gold)':'#60a5fa';
            lnHtmlZW += '<span style="display:inline-block;margin:2px 4px;padding:2px 8px;border-radius:4px;font-size:.72rem;background:rgba(255,255,255,.05);border:1px solid '+hC2+';color:'+hC2+'">'+h.star+h.hua+'→'+h.palace+'</span>';
          });
          lnHtmlZW += '</div>';
          var lnJi3 = zwLnR.hua.find(function(h){return h.hua==='化忌';});
          if(lnJi3) lnHtmlZW += '<p style="font-size:.8rem;color:#f87171;margin:.3rem 0">⚠ 今年化忌入'+lnJi3.palace+'，格外謹慎。</p>';
          var lnLu3 = zwLnR.hua.find(function(h){return h.hua==='化祿';});
          if(lnLu3) lnHtmlZW += '<p style="font-size:.8rem;color:#4ade80;margin:.3rem 0">✨ 今年化祿入'+lnLu3.palace+'，把握機會！</p>';
        }
        if(zwLnR.notes && zwLnR.notes.length){
          zwLnR.notes.forEach(function(n){ lnHtmlZW += '<p style="font-size:.82rem;line-height:1.6;margin:.2rem 0">• '+n+'</p>'; });
        }
        lnHtmlZW += '</div>';
      }
    }
  } catch(e){}
  var lnElZW = document.getElementById('d-ziwei-liunian');
  if(lnElZW) lnElZW.innerHTML = window.__plainHtml ? window.__plainHtml(lnHtmlZW) : lnHtmlZW;
  const HUA_EXPLAIN = {
    '化祿': {icon:'💰', label:'好運加持', desc:'這個領域容易獲得好的結果和資源'},
    '化權': {icon:'💪', label:'掌控力強', desc:'你在這方面有主導權，但小心太強勢'},
    '化科': {icon:'⭐', label:'貴人相助', desc:'這方面有好名聲，容易得到幫助'},
    '化忌': {icon:'⚠️', label:'需要注意', desc:'這是你最在意也最容易卡關的地方'}
  };
  let sihuaHtml = '';
  if(zw.sihua.length){
    sihuaHtml += '<p class="text-xs text-dim" style="margin-bottom:8px">你出生年的天干帶來四種特殊能量，影響你人生不同面向：</p>';
    zw.sihua.forEach(h=>{
      const ex = HUA_EXPLAIN[h.hua] || {icon:'',label:h.hua,desc:''};
      const tagCls = h.hua.includes('祿')?'tag-green':h.hua.includes('忌')?'tag-red':h.hua.includes('權')?'tag-gold':'tag-blue';
      sihuaHtml += `<div style="margin-bottom:6px;padding:6px 8px;background:rgba(255,255,255,0.03);border-radius:6px">
        <span class="tag ${tagCls}">${ex.icon} ${ex.label}</span> <strong>${h.star}</strong> → ${h.palace}
        <div class="text-xs text-dim" style="margin-top:2px">${ex.desc}</div>
      </div>`;
    });
  } else {
    sihuaHtml = '<p class="text-dim">四化資訊計算中</p>';
  }
  // 自化/飛星（簡化版）
  if(zw.selfHua && zw.selfHua.length){
    sihuaHtml += '<p class="text-xs text-dim" style="margin-top:10px;margin-bottom:6px">各宮位之間也有能量互動：</p>';
    zw.selfHua.forEach(sh=>{
      const dir = sh.direction==='↓' ? '向外發散' : '被吸引進來';
      const huaEx = HUA_EXPLAIN[sh.type] || {icon:'', label:sh.type};
      sihuaHtml += `<p class="text-xs" style="margin-bottom:3px">${sh.palace} 的 ${sh.star}（${huaEx.icon}${huaEx.label}）能量${dir}</p>`;
    });
  }
  document.getElementById('d-ziwei-sihua').innerHTML = window.__plainHtml ? window.__plainHtml(sihuaHtml) : sihuaHtml;

  // 解讀
  const mingPalace = zw.palaces[0];
  const mingStars = mingPalace.stars.filter(s=>s.type==='major');
  let reading = '';
  if(mingStars.length){
    reading+=`<p><strong>命宮主星：</strong>${mingStars.map(s=>s.name).join('、')}</p>`;
    mingStars.forEach(s=>{
      const info = ZW_MAJOR.find(m=>m.name===s.name);
      const natureText = (info && info.nature) || ZW_MAJOR_NATURE[s.name] || '此星主題資料未補齊';
      reading+=`<p class="text-dim">→ ${s.name}：${natureText}</p>`;
    });
  }else{
    // 命宮無主星：動態整合 煞星 + 對宮 + 身宮
    const mingShaStar=mingPalace.stars.filter(s=>s.type==='sha').map(s=>s.name);
    const qianyi=zw.palaces[6]; // 遷移宮（對宮）
    const qianyiMajors=qianyi?qianyi.stars.filter(s=>s.type==='major').map(s=>s.name):[];
    const qianyiHua=qianyi?qianyi.stars.filter(s=>s.hua).map(s=>s.name+s.hua):[];
    reading+=`<p>命宮無主星，借對宮（遷移宮）星曜判斷。`;
    if(mingShaStar.includes('擎羊')||mingShaStar.includes('陀羅')){
      reading+=`命宮帶${mingShaStar.join('、')}，性格中有強烈的防衛心與堅韌面，外柔內剛，被壓迫時會激烈反彈。`;
    } else if(mingShaStar.length){
      reading+=`命宮帶${mingShaStar.join('、')}，處事風格較為銳利。`;
    } else {
      reading+=`性格定位較模糊，容易將生命重心向外尋求。`;
    }
    if(qianyiMajors.length){
      reading+=`對宮有${qianyiMajors.join('、')}`;
      if(qianyiMajors.includes('武曲')&&qianyiMajors.includes('貪狼')){
        reading+=`，武曲貪狼組合極度渴望實質成就，在外發展力強但容易慾望受阻`;
      } else if(qianyiMajors.some(s=>['紫微','天府'].includes(s))){
        reading+=`，外在環境有貴氣格局`;
      }
      if(qianyiHua.some(h=>h.includes('化忌'))){
        reading+=`。對宮帶化忌，外出發展或人際交往容易遇到挫折與變數`;
      }
      reading+=`。</p>`;
    } else {
      reading+=`</p>`;
    }
    // 身宮提示
    const shenP2=zw.palaces.find(p=>p.isShen);
    if(shenP2){
      const shenMajors=shenP2.stars.filter(s=>s.type==='major').map(s=>s.name);
      const shenHua=shenP2.stars.filter(s=>s.hua).map(s=>s.name+s.hua);
      if(shenMajors.length){
        reading+=`<p class="text-dim">身宮在${shenP2.name}（${shenMajors.join('、')}${shenHua.length?'、'+shenHua.join('、'):''}），`;
        if(shenP2.name==='福德宮'||shenP2.name==='福德'){
          reading+=`代表一生終極追求受精神滿足感主導，而非單純物質。`;
        } else if(shenP2.name==='財帛宮'||shenP2.name==='財帛'){
          reading+=`代表一生重心在財富累積與資源運用。`;
        } else if(shenP2.name==='官祿宮'||shenP2.name==='官祿'){
          reading+=`代表一生重心在事業成就與社會地位。`;
        } else {
          reading+=`中晚年生命重心偏向${shenP2.name}領域。`;
        }
        reading+=`</p>`;
      }
    }
  }
  // 財帛宮 - 白話
  const caiPalace = zw.palaces[4];
  const caiStars = caiPalace.stars.filter(s=>s.type==='major');
  if(caiStars.length)reading+=`<p class="mt-sm"><strong>💰 你的財運：</strong>${caiStars.some(s=>['武曲','天府','太陰'].includes(s.name))?'先天財運底子不錯，適合穩健投資和長期累積':'財運需要靠自己努力去爭取，不適合投機'}</p>`;

  // 官祿宮 - 白話
  const guanPalace = zw.palaces[8];
  const guanStars = guanPalace.stars.filter(s=>s.type==='major');
  if(guanStars.length)reading+=`<p class="mt-sm"><strong>💼 你的事業：</strong>${guanStars.some(s=>['紫微','天府','太陽'].includes(s.name))?'事業格局大，適合帶團隊或做管理':'適合走專業技術路線或自由業'}</p>`;

  // 煞星提醒 - 白話
  const shaInMing = zw.palaces[0].stars.filter(s=>s.type==='sha').map(s=>s.name);
  if(shaInMing.length)reading+=`<p class="mt-sm text-warn"><strong>⚡ 命宮帶挑戰星：</strong>${shaInMing.join('、')} — 代表性格中有衝勁和稜角，遇到壓力時特別要注意控制情緒</p>`;

  // 桃花星分析
  const peachStars=[];
  zw.palaces.forEach(p=>p.stars.filter(s=>['紅鸞','天喜','咸池','天姚'].includes(s.name)).forEach(s=>peachStars.push(s.name+'('+p.name+')')));
  if(peachStars.length)reading+=`<p class="mt-sm" style="color:#f9b"><strong>桃花星：</strong>${peachStars.join('、')}</p>`;

  // 特殊星曜提示
  const specials=[];
  zw.palaces.forEach(p=>{
    p.stars.forEach(s=>{
      if(s.name==='華蓋'&&p.isMing) specials.push('命坐華蓋，宗教緣深、性格清高');
      if(s.name==='天刑'&&p.name==='官祿') specials.push('天刑入官祿，適合法律、軍警、外科');
      if(s.name==='龍池'&&p.name==='命宮') specials.push('龍池入命，才藝出眾');
      if(s.name==='恩光'&&p.isMing) specials.push('恩光入命，貴人緣佳');
    });
  });
  if(specials.length)reading+=specials.map(s=>'<p class="mt-xs text-dim">★ '+s+'</p>').join('');

  // ── 問題類型對應宮位深度解讀 ──
  const typeLabel2 = S.form ? ({'love':'愛情','career':'事業','wealth':'財運','health':'健康','general':'綜合','relationship':'人際','family':'家庭'}[S.form.type]||'綜合') : '綜合';
  const typeToGong2 = {love:2,career:8,wealth:4,health:5,family:9,relationship:7,general:0};
  const tgIdx = typeToGong2[S.form?S.form.type:'general'];
  if(tgIdx !== undefined && tgIdx !== 0) {
    const tgPalace = zw.palaces[tgIdx];
    if(tgPalace) {
      const tgMajors = tgPalace.stars.filter(s=>s.type==='major');
      const tgMinors = tgPalace.stars.filter(s=>s.type==='minor');
      const tgSha = tgPalace.stars.filter(s=>s.type==='sha');
      reading += `<div class="divider"></div>`;
      const GONG_PLAIN = {'夫妻':'感情','官祿':'事業','財帛':'財運','疾厄':'健康','田宅':'家庭','交友':'人際'};
      const plainLabel = GONG_PLAIN[tgPalace.name] || tgPalace.name;
      reading += `<p class="mt-sm"><strong>📌 針對你問的「${typeLabel2}」：</strong></p>`;
      if(tgMajors.length) {
        // 白話解讀（不顯示技術性星曜名稱）
        const tgTypeAdvice = {
          love: function(stars) {
            const msgs = [];
            if(stars.some(s=>s.name==='太陰')) msgs.push('太陰入夫妻宮，感情細膩溫柔，異性緣佳。');
            if(stars.some(s=>s.name==='貪狼')) msgs.push('貪狼入夫妻宮，桃花旺盛，但感情容易波折。');
            if(stars.some(s=>s.name==='天同')) msgs.push('天同入夫妻宮，感情和睦，相處舒適。');
            if(stars.some(s=>s.name==='天機')) msgs.push('天機入夫妻宮，感情中多變，需要用心經營。');
            if(stars.some(s=>s.name==='武曲')) msgs.push('武曲入夫妻宮，另一半務實能幹，但可能缺乏浪漫。');
            if(stars.some(s=>s.name==='紫微')) msgs.push('紫微入夫妻宮，另一半有主見有能力，但可能較強勢。');
            if(stars.some(s=>s.name==='七殺')) msgs.push('七殺入夫妻宮，感情來得快烈但有波動。');
            if(stars.some(s=>s.name==='破軍')) msgs.push('破軍入夫妻宮，感情多變化，婚前可能經歷多段戀情。');
            if(stars.some(s=>s.name==='太陽')) msgs.push('太陽入夫妻宮，另一半為人光明正大，社交活躍。');
            if(stars.some(s=>s.name==='巨門')) msgs.push('巨門入夫妻宮，感情中需注意口舌爭執，溝通是關鍵。');
            if(stars.some(s=>s.name==='天梁')) msgs.push('天梁入夫妻宮，另一半穩重可靠，年齡差距可能較大。');
            if(stars.some(s=>s.name==='天相')) msgs.push('天相入夫妻宮，另一半溫和有禮，適合共同經營家庭。');
            if(stars.some(s=>s.name==='天府')) msgs.push('天府入夫妻宮，另一半穩健有財，感情穩定。');
            if(stars.some(s=>s.name==='廉貞')) msgs.push('廉貞入夫妻宮，感情熱烈但需防第三者。');
            return msgs.length ? msgs.join('') : '';
          },
          career: function(stars) {
            const msgs = [];
            if(stars.some(s=>s.name==='紫微')) msgs.push('紫微入官祿宮，事業格局大，適合管理或獨立經營。');
            if(stars.some(s=>s.name==='天府')) msgs.push('天府入官祿宮，事業穩定有發展，適合大機構。');
            if(stars.some(s=>s.name==='太陽')) msgs.push('太陽入官祿宮，事業有公眾曝光度，適合公職或傳播業。');
            if(stars.some(s=>s.name==='武曲')) msgs.push('武曲入官祿宮，適合金融、軍警或需要果斷的職業。');
            if(stars.some(s=>s.name==='天機')) msgs.push('天機入官祿宮，適合策劃、企劃或變動性高的職業。');
            if(stars.some(s=>s.name==='天同')) msgs.push('天同入官祿宮，工作偏安穩，適合服務業或教育。');
            if(stars.some(s=>s.name==='七殺')) msgs.push('七殺入官祿宮，事業心強，適合獨當一面的角色。');
            if(stars.some(s=>s.name==='破軍')) msgs.push('破軍入官祿宮，適合開創性工作，職業易有大變動。');
            if(stars.some(s=>s.name==='貪狼')) msgs.push('貪狼入官祿宮，適合業務、公關或需要交際的工作。');
            if(stars.some(s=>s.name==='巨門')) msgs.push('巨門入官祿宮，適合律師、教師或需要口才的工作。');
            if(stars.some(s=>s.name==='天梁')) msgs.push('天梁入官祿宮，適合醫療、法律或公益事業。');
            if(stars.some(s=>s.name==='廉貞')) msgs.push('廉貞入官祿宮，事業有重心，適合公務或管理。');
            return msgs.length ? msgs.join('') : '';
          },
          wealth: function(stars) {
            const msgs = [];
            if(stars.some(s=>s.name==='武曲')) msgs.push('武曲入財帛宮，天生財星，正財運極佳，適合金融投資。');
            if(stars.some(s=>s.name==='天府')) msgs.push('天府入財帛宮，財庫穩固，適合穩健理財。');
            if(stars.some(s=>s.name==='太陰')) msgs.push('太陰入財帛宮，適合不動產投資，財富慢慢累積。');
            if(stars.some(s=>s.name==='貪狼')) msgs.push('貪狼入財帛宮，偏財運佳但花費也大，需控制開支。');
            if(stars.some(s=>s.name==='紫微')) msgs.push('紫微入財帛宮，大器晚成型，財富會隨地位提升。');
            if(stars.some(s=>s.name==='天機')) msgs.push('天機入財帛宮，財來財卻，需靈活理財。');
            if(stars.some(s=>s.name==='太陽')) msgs.push('太陽入財帛宮，大方慷慨，正財運佳但不宜太慷慨。');
            if(stars.some(s=>s.name==='巨門')) msgs.push('巨門入財帛宮，靠口才賺錢，但理財需更謹慎。');
            if(stars.some(s=>s.name==='七殺')) msgs.push('七殺入財帛宮，財運起伏大，適合冒險型投資。');
            if(stars.some(s=>s.name==='破軍')) msgs.push('破軍入財帛宮，財運大起大落，需建立儲蓄習慣。');
            return msgs.length ? msgs.join('') : '';
          },
          health: function(stars) {
            const msgs = [];
            if(stars.some(s=>s.name==='天同')) msgs.push('天同入疾厄宮，先天體質不差，注意肥胖與脾臟。');
            if(stars.some(s=>s.name==='天機')) msgs.push('天機入疾厄宮，注意肝膽、神經系統。');
            if(stars.some(s=>s.name==='太陽')) msgs.push('太陽入疾厄宮，注意眼睛、血壓、心臟。');
            if(stars.some(s=>s.name==='太陰')) msgs.push('太陰入疾厄宮，注意脾臟、婦科或泌尿系統。');
            if(stars.some(s=>s.name==='武曲')) msgs.push('武曲入疾厄宮，注意呼吸系統、筋骨。');
            if(stars.some(s=>s.name==='廉貞')) msgs.push('廉貞入疾厄宮，注意心臟、血液循環。');
            if(stars.some(s=>s.name==='貪狼')) msgs.push('貪狼入疾厄宮，注意肝膽、過度消耗。');
            if(stars.some(s=>s.name==='巨門')) msgs.push('巨門入疾厄宮，主消化系統與暗疾，疾病容易隱藏不易察覺，需定期檢查腸胃與免疫系統。');
            if(stars.some(s=>s.name==='天梁')) msgs.push('天梁入疾厄宮，常有小病但能逢凶化吉，注意慢性問題。');
            if(stars.some(s=>s.name==='七殺')) msgs.push('七殺入疾厄宮，體質帶煞氣，注意意外傷害與急性發炎。');
            if(stars.some(s=>s.name==='破軍')) msgs.push('破軍入疾厄宮，身體耗損度高，注意免疫力與過度勞累。');
            if(stars.some(s=>s.name==='紫微')) msgs.push('紫微入疾厄宮，底子不差但容易忽視保養。');
            if(stars.some(s=>s.name==='天相')) msgs.push('天相入疾厄宮，注意皮膚與泌尿系統。');
            if(stars.some(s=>s.name==='天府')) msgs.push('天府入疾厄宮，先天體質不錯，注意脾胃消化。');
            // 化權在疾厄的特殊處理
            const huaQuan=stars.find(s=>s.hua==='化權');
            if(huaQuan) msgs.push(`⚠ ${huaQuan.name}化權在疾厄宮，代表身體機能常處於「高壓運轉」狀態。這不是健康的掌控力，而是壓力導致的過度消耗。需特別警惕隱性健康問題。`);
            const huaJi=stars.find(s=>s.hua==='化忌');
            if(huaJi) msgs.push(`⚠ ${huaJi.name}化忌在疾厄宮，健康方面是命盤中最需關注的弱點，宜定期體檢。`);
            return msgs.length ? msgs.join('') : '';
          }
        };
        const typeAdviceFn = tgTypeAdvice[S.form?S.form.type:'general'];
        if(typeAdviceFn) {
          const advice = typeAdviceFn(tgMajors);
          if(advice) reading += `<p class="mt-sm">${advice}</p>`;
        }
      } else {
        // 無主星時的詳細 fallback（尤其健康）
        if(S.form && S.form.type === 'health'){
          reading += `<p>疾厄宮無主星坐守 → 健康方面沒有「先天硬傷」，但也缺乏天然保護力。</p>`;
          reading += `<p class="text-sm mt-sm">📋 <strong>具體建議：</strong></p>`;
          reading += `<p class="text-sm">• 需借對宮（遷移宮）星曜判斷體質傾向</p>`;
          reading += `<p class="text-sm">• 疾厄宮空宮的人容易忽略身體警訊，等有症狀才處理</p>`;
          reading += `<p class="text-sm">• 建議每年至少一次全面健檢，不要等不舒服才看醫生</p>`;
          // 看小星有沒有線索
          if(tgMinors.length){
            const minorNames = tgMinors.map(s=>s.name);
            if(minorNames.includes('火星')||minorNames.includes('鈴星')) reading += `<p class="text-sm text-warn">⚡ 疾厄宮有火星/鈴星，注意發炎、急性問題和意外傷害</p>`;
            if(minorNames.includes('擎羊')||minorNames.includes('陀羅')) reading += `<p class="text-sm text-warn">⚡ 疾厄宮有擎羊/陀羅，注意外傷、慢性疼痛</p>`;
            if(minorNames.includes('天空')||minorNames.includes('地劫')) reading += `<p class="text-sm text-warn">⚡ 疾厄宮有空劫，身體容易虛耗，注意補氣養神</p>`;
          }
        } else {
          reading += `<p>${typeLabel2}方面的宮位無主星坐守，需借對宮星曜判斷，這個領域較不穩定，需要主動經營。</p>`;
        }
      }
      if(tgMinors.some(s=>['文昌','文曲','左輔','右弼'].includes(s.name))) reading += `<p class="text-sm mt-sm" style="color:#4ade80">✨ ${typeLabel2}方面有吉星幫忙，發展會比較順利</p>`;
      if(tgSha.length) reading += `<p class="text-warn text-sm mt-sm">⚡ ${typeLabel2}方面有挑戰星介入，過程中容易遇到阻礙，需要更有耐心</p>`;

      // 四化在此宮的影響 - 白話版
      const huaInGong = zw.sihua.filter(h=>h.palace===tgPalace.name);
      if(huaInGong.length) {
        huaInGong.forEach(h=>{
          if(h.hua==='化祿') reading+=`<p class="text-sm" style="color:#4ade80">💎 ${typeLabel2}方面有先天福氣，容易有好的結果。</p>`;
          if(h.hua==='化權'){
            if(tgPalace.name==='疾厄'||tgPalace.name.includes('疾')){
              reading+=`<p class="text-sm text-warn">⚠ 身體容易長期處於高壓運轉，要注意定期檢查，別硬撐。</p>`;
            } else {
              reading+=`<p class="text-sm text-gold">💪 ${typeLabel2}方面你有掌控力，但不要太強勢，適當放手效果更好。</p>`;
            }
          }
          if(h.hua==='化科') reading+=`<p class="text-sm" style="color:#60a5fa">⭐ ${typeLabel2}方面容易得到貴人幫忙，口碑也好。</p>`;
          if(h.hua==='化忌'){
            reading+=`<p class="text-sm text-danger">⚠ ${typeLabel2}是你最在意、也最容易卡關的地方。但正因為你特別在乎，反而會逼自己做得更好。把壓力當成動力，就能轉化成優勢。</p>`;
          }
        });
      }
    }
  }

  document.getElementById('d-ziwei-reading').innerHTML=reading||'<p class="text-dim">解讀生成中…</p>';
}

// ── ZiWei palace constants + chart data (lines 22573-25676) ──
/* =============================================================
   姓名學 NAMEOLOGY（三才五格）
   ============================================================= */
const STROKE_OVERRIDE={
  // ═══ 康熙字典筆畫（姓名學專用・部首已還原）═══
  // 原則：氵=4, 忄=4, 扌=4, 艹=6, 衤=6, 礻=5, 辶=7, 犭=4
  //       阝左(阜)=8, 阝右(邑)=7, 王旁(玉)=5, 月(肉旁)=6

  // ── 百大姓氏（康熙正確畫數）──
  '趙':14,'錢':16,'孫':10,'李':7,'周':8,'吳':7,'鄭':19,'王':4,
  '馮':12,'陳':16,'褚':15,'衛':16,'蔣':17,'沈':8,'韓':17,'楊':13,
  '朱':6,'秦':10,'尤':4,'許':11,'何':7,'呂':7,'施':9,'張':11,
  '孔':4,'曹':11,'嚴':20,'華':14,'金':8,'魏':18,'陶':16,'姜':9,
  '戚':11,'謝':17,'鄒':17,'喻':12,'柏':9,'水':4,'竇':20,'章':11,
  '雲':12,'蘇':22,'潘':16,'葛':15,'奚':10,'范':11,'彭':12,'郎':14,
  '魯':16,'韋':9,'昌':8,'馬':10,'苗':11,'鳳':14,'花':10,'方':4,
  '俞':9,'任':6,'袁':10,'柳':9,'酆':20,'鮑':16,'史':5,'唐':10,
  '費':12,'廉':13,'岑':7,'薛':19,'雷':13,'賀':12,'倪':10,'湯':13,
  '滕':14,'殷':10,'羅':20,'畢':11,'郝':14,'鄔':19,'安':6,'常':11,
  '樂':15,'于':3,'時':10,'傅':12,'皮':5,'卞':4,'齊':14,'康':11,
  '伍':6,'余':7,'元':4,'卜':2,'顧':21,'孟':8,'黃':12,'和':8,
  '穆':16,'蕭':18,'尹':4,'姚':9,'邵':12,'湛':13,'汪':8,'祁':8,
  '毛':4,'禹':9,'狄':8,'米':6,'貝':7,'明':8,'臧':14,'計':9,
  '伏':6,'成':7,'戴':18,'談':15,'宋':7,'茅':11,'龐':19,'熊':14,
  '紀':9,'舒':12,'屈':8,'項':12,'祝':10,'董':15,'梁':11,'杜':7,
  '阮':12,'藍':18,'閔':12,'席':10,'季':8,'麻':11,'強':12,'賈':13,
  '路':13,'婁':11,'危':6,'江':7,'童':12,'顏':18,'郭':15,'梅':11,
  '盛':12,'林':8,'刁':2,'鍾':17,'徐':10,'邱':7,'駱':16,'高':10,
  '夏':10,'蔡':17,'田':5,'樊':15,'胡':11,'凌':10,'霍':16,'虞':13,
  '萬':15,'支':4,'柯':9,'昝':9,'管':14,'盧':16,'莫':13,'經':13,
  '房':8,'裘':13,'繆':17,'干':3,'解':13,'應':17,'宗':8,'丁':2,
  '宣':9,'賁':12,'鄧':19,'郁':13,'單':12,'杭':8,'洪':10,'包':5,
  '諸':16,'左':5,'石':5,'崔':11,'吉':6,'鈕':10,'龔':22,'程':12,
  '嵇':13,'邢':7,'滑':14,'裴':14,'陸':16,'榮':14,'翁':10,'荀':11,
  '羊':6,'於':8,'惠':12,'甄':14,'曲':6,'家':10,'封':9,'芮':10,
  '羿':9,'儲':18,'靳':13,'汲':7,'邴':11,'糜':17,'松':8,'井':4,
  '段':9,'富':12,'巫':7,'烏':10,'焦':12,'巴':4,'弓':3,'牧':8,
  '隗':13,'山':3,'谷':7,'車':7,'侯':9,'宓':8,'蓬':17,'全':6,
  '郗':14,'班':10,'仰':6,'秋':9,'仲':6,'伊':6,'宮':10,'甯':12,
  '仇':4,'欒':23,'暴':15,'甘':5,'鈄':10,'厲':15,'戎':6,'祖':10,
  '武':8,'符':11,'劉':15,'景':12,'詹':13,'束':7,'龍':16,'葉':15,
  '幸':8,'司':5,'韶':14,'薄':17,'印':6,'宿':11,'白':5,'懷':20,
  '蒲':16,'邰':13,'從':11,'鄂':11,'索':10,'咸':9,'籍':20,'賴':16,
  '卓':8,'藺':21,'屠':11,'蒙':16,'池':7,'喬':12,'陰':11,'鬱':29,
  '胥':11,'能':10,'蒼':16,'雙':18,'聞':14,'莘':13,'黨':20,'翟':14,
  '譚':19,'貢':10,'勞':12,'逄':14,'姬':10,'申':5,'扶':8,'堵':12,
  '冉':5,'宰':10,'酈':21,'雍':13,'卻':9,'璩':18,'桑':10,'桂':10,
  '濮':18,'牛':4,'壽':14,'通':14,'邊':22,'扈':11,'燕':16,'冀':16,
  '郟':14,'浦':11,'尚':8,'農':13,'溫':14,'別':7,'莊':13,'晏':10,
  '柴':10,'瞿':18,'閻':16,'充':6,'慕':15,'連':14,'茹':12,'習':11,
  '宦':9,'艾':8,'魚':11,'容':10,'向':6,'古':5,'易':8,'慎':14,
  '戈':4,'廖':14,'庾':11,'終':11,'暨':14,'居':8,'衡':16,'步':7,
  '都':16,'耿':10,'滿':15,'弘':5,'匡':6,'國':11,'文':4,'寇':11,
  '廣':15,'祿':13,'闕':18,'東':8,'歐':15,'殳':4,'沃':8,'利':7,
  '蔚':17,'越':12,'夔':21,'隆':17,'師':10,'鞏':15,'厙':6,'聶':18,
  '晁':10,'勾':4,'敖':11,'融':16,'冷':7,'訾':12,'辛':7,'闞':20,
  '那':7,'簡':18,'饒':21,'空':8,'曾':12,'毋':4,'沙':8,'乜':2,
  '養':15,'鞠':17,'須':12,'豐':18,'巢':11,'關':19,'蒯':16,'相':9,
  '查':9,'后':6,'荊':12,'紅':9,'游':13,'竺':8,'權':22,'逯':14,
  '蓋':16,'益':10,'桓':10,'公':4,

  // ── 常見名字用字（康熙正確畫數・部首已還原）──
  // 氵部（+1）
  '淑':12,'清':12,'潔':16,'浩':11,'洋':10,'涵':12,'淳':12,
  '渝':13,'源':14,'溢':14,'滿':15,'漢':15,'潤':16,'澄':16,
  '濤':18,'瀾':21,'灝':25,'沛':8,'洛':10,'湘':13,'澤':17,
  '淇':12,'洪':10,'淨':12,'深':12,'淵':12,'游':13,'渙':13,
  '湛':13,'溫':14,'滋':13,'滑':14,'漫':15,'潛':16,'瀚':20,
  '沐':8,'津':10,'泉':9,'泓':9,'泰':10,'波':9,'泳':9,
  '海':11,'浮':11,'涼':12,'淮':12,'減':13,'渡':13,'港':13,
  '湖':13,'準':13,'溝':14,'溪':14,'溫':14,'滅':14,'漁':15,
  '漂':15,'漓':14,'漠':15,'演':15,'漲':15,'潘':16,'潮':16,
  '澳':17,'濃':17,'濕':18,'濟':18,'瀑':19,'灌':22,'灣':26,
  // 忄部（+1）
  '怡':9,'恆':10,'悅':11,'惠':12,'慧':15,'憲':16,'懷':20,
  '恩':10,'慈':13,'慎':14,'愷':14,'懿':22,
  '悟':11,'情':12,'惜':12,'惟':12,'愉':13,'慰':15,
  '懋':17,'憶':17,'憑':16,'懷':20,'憫':16,'慕':15,
  // 扌部（+1）
  '振':11,'揚':13,'捷':13,'掌':12,'推':12,'描':12,
  '提':13,'搏':14,'撫':16,'操':17,'擇':17,'擎':18,
  // 艹部（+3！）
  '芳':10,'芝':10,'芬':10,'花':10,'若':11,'苗':11,
  '英':11,'茂':11,'茜':12,'茗':12,'茹':12,'荷':13,
  '莉':13,'莎':13,'菁':14,'菲':14,'萊':14,'萍':14,
  '萱':15,'葉':15,'蒂':15,'蓮':17,'蓉':16,'蓁':14,
  '蔚':17,'薇':19,'蘭':21,'蘊':22,'蘇':22,'藝':21,
  '藍':18,'藏':18,'薰':17,'蕙':18,'蕊':18,'蕭':18,
  '芮':10,'苡':11,'荀':11,'莘':13,'莊':13,'董':15,
  '葛':15,'蒲':16,'蒙':16,'蔡':17,'蔣':17,'薛':19,
  '華':14,'萌':14,'萬':15,'葵':15,'蓓':16,'薔':19,
  // 衤部（+1）
  '裕':13,'褚':15,'裴':14,'褀':14,'裝':13,'補':13,
  '複':14,'褐':15,'褒':15,
  // 礻部（+1）
  '祈':9,'祐':10,'祖':10,'祥':11,'祺':13,'禧':17,
  '禎':14,'祿':13,'禮':18,'禪':17,'祝':10,'神':10,
  '福':14,'禹':9,'祁':8,
  // 辶部（+4）
  '建':9,'連':14,'進':15,'達':16,'遠':17,'道':16,
  '運':16,'遊':16,'還':20,'邊':22,'遇':16,'過':16,
  '逸':15,'遍':15,'逢':14,'通':14,'迪':12,'迎':11,
  '述':12,'逆':13,'迅':10,'迪':12,'週':12,
  // 犭部（+1）
  '狄':8,'猛':12,'獅':13,'獨':17,'獻':20,
  // 王(玉)旁（+1）
  '玲':10,'珍':10,'珊':10,'珠':11,'琪':13,'琳':13,
  '瑜':14,'瑛':14,'瑞':14,'瑋':14,'瑤':15,'瑩':15,
  '璇':16,'璋':16,'璐':17,'璟':16,'瑄':14,'琦':13,
  '琬':13,'琰':13,'琮':13,'珮':11,'珈':10,'瑾':16,
  '瑀':14,'璿':18,'瓊':20,'琥':13,'璨':18,'環':18,
  '珺':12,'琴':12,'珏':10,'瑆':13,'珞':11,
  // 月(肉旁)（+2）：左旁的「月」多為肉部
  '胡':11,'育':10,'胖':11,'胤':9,'胸':12,'腸':14,
  '腦':15,'膽':17,'臨':17,'朋':8,'朝':12,'期':12,
  '服':8,
  // 阝左(阜部=8畫)
  '陳':16,'陽':17,'阮':12,'陸':16,'陶':16,'陰':11,
  '陵':16,'隆':17,'隊':12,'階':12,'際':19,'障':16,
  '隨':21,'險':16,'隱':22,'院':10,
  // 阝右(邑部=7畫)
  '鄭':19,'郭':15,'邱':7,'邵':12,'郁':13,'鄒':17,
  '鄧':19,'鄂':11,'郝':14,'鄔':19,'都':16,'鄰':19,
  '邢':7,'郎':14,'那':7,'邦':11,'邸':10,'郗':14,

  // ── 其他高頻名字用字 ──
  '一':1,'二':2,'三':3,'四':4,'五':5,'六':6,'七':7,'八':8,'九':9,'十':10,
  '大':3,'小':3,'中':4,'上':3,'下':3,'人':2,'天':4,'地':6,
  '水':4,'火':4,'木':4,'金':8,'土':3,'日':4,'月':4,'年':6,
  '明':8,'光':6,'國':11,'德':15,'仁':4,'義':13,'禮':18,'信':9,
  '智':12,'勇':9,'忠':8,'孝':7,'志':7,'剛':10,'強':12,'文':4,
  '武':8,'成':7,'功':5,'安':6,'平':5,'吉':6,'祥':11,'瑞':14,
  '昌':8,'盛':12,'榮':14,'富':12,'貴':12,'康':11,'壽':14,
  '福':14,'喜':12,'樂':15,'和':8,'順':12,'利':7,'道':16,
  '春':9,'夏':10,'秋':9,'冬':5,'東':8,'西':6,'南':9,'北':5,
  '心':4,'思':9,'想':13,'意':13,'恩':10,'慈':13,'善':12,
  '美':9,'真':10,'靜':16,'淨':12,'雲':12,'風':9,'雨':8,
  '雪':11,'花':10,'草':10,'樹':16,'海':11,'山':3,'河':9,
  '江':7,'湖':13,'龍':16,'鳳':14,'虎':8,'鶴':21,'馬':10,
  '牛':4,'羊':6,'鼠':13,'兔':8,'蛇':11,'猴':12,'雞':18,'狗':9,'豬':16,
  '愛':13,'情':12,'錢':16,'財':10,'工':3,'作':7,'事':8,'業':13,
  '健':11,'家':10,'庭':10,'際':19,'運':16,'勢':13,'感':13,
  '婚':11,'姻':9,'學':16,'習':11,'考':6,'試':13,'升':4,
  '職':18,'轉':18,'危':6,'凶':4,
  // 常見名字字
  '宇':6,'宸':10,'翔':12,'鈺':13,'筠':13,'霈':15,'芸':10,'嘉':14,
  '瀚':20,'宥':9,'睿':14,'俐':9,'浩':11,'昕':8,'沛':8,
  '晴':12,'芷':10,'彤':7,'宸':10,'紘':10,'彬':11,'濬':18,
  '靖':13,'諺':16,'丞':6,'翰':16,'鈞':12,'銘':14,'鋒':15,
  '駿':17,'翊':11,'勛':12,'奕':9,'晏':10,'柏':9,'柔':9,
  '棠':12,'森':12,'楷':13,'楚':13,'楠':13,'楓':13,'樺':14,
  '煜':13,'照':13,'熠':15,'燁':16,'皓':12,'穎':16,'竣':12,
  '筱':13,'維':14,'繡':18,'翠':14,'耀':20,'肇':14,
  '臻':16,'若':11,'莉':13,'莎':13,'菁':14,'菲':14,
  '萊':14,'蓁':14,'蓉':16,'蓓':16,'薰':17,'蘊':22,
  '蘭':21,'裕':13,'謙':17,'豪':14,'賢':15,'赫':14,
  '鋆':15,'鐸':21,'雋':12,'霖':16,'霞':17,'靈':24,
  '韻':19,'黎':15,'龔':22,'磊':15,'穆':16,'竹':6,
  '紫':12,'聖':13,'聰':17,'茂':11,'莊':13,'蔚':17,
  '逸':15,'頤':16,'馨':20,'驊':22,'騏':18,
  '堯':12,'堃':11,'淳':12,'渙':13,'煒':13,
  '茗':12,'菡':14,'景':12,'詹':13,'束':7,
  '幸':8,'司':5,'韶':14,'鑫':24,'欣':8,'佳':8,
  '妍':7,'雯':12,'祺':13,'禧':17,'萌':14,
  '晞':11,'桓':10,'綺':14,'語':14,'芊':9,'苡':11,
  '歆':13,'弘':5,'弼':12,'弭':9,'弟':7,'弦':8,'弧':9,'弩':8,
  '妤':7,'昊':8,'晟':11,'辰':7,'曦':20,'軒':10,
  '晨':11,'薇':19,'佳':8,
  '俊':9,'傑':12,'宏':7,'雅':12,'靜':16,'慧':15,
  '敏':11,'婷':12,'秀':7,'芳':10,'麗':19,'英':11,
  '費':12,'起':10,'曾':12,'邱':7,'邵':12,'范':11,
  '魏':18,'陶':16,'姜':9,'鄒':17,'柴':10,'閻':16,
  '席':10,'季':8,'戚':11,'施':9,'袁':10,'鍾':17,
  '洪':10,'甘':5,'田':5,'石':5,'丘':5,'毛':4,'汪':8,
  '塗':13,'管':14,'闕':18,'鄧':19,'邢':7,'苗':11,
  '程':12,'崔':11,'於':8,'童':12,'阮':12,'湛':13,
  '溫':14,'項':12,'倪':10,'滕':14,'段':9,'鄂':11,
  '牧':8,'單':12,'瞿':18,'賴':16,'藍':18,'戴':18,
  '莫':13,'須':12,'聶':18,'廖':14,'畢':11,'殷':10,

  // ── 補充高頻名字用字（康熙正確畫數・部首已還原）──
  // 火/灬部
  '然':12,'烽':11,'焱':12,'煦':13,'熙':14,'熹':16,'燦':17,'燁':16,
  // 彡部
  '彥':9,'彰':14,'影':15,'彩':11,
  // 亻部
  '佑':7,'佐':7,'佩':8,'侑':8,'儀':15,'億':15,'儒':16,
  // 广部
  '廷':7,'廣':15,'庠':10,'廉':13,
  // 宀部
  '宜':8,'宥':9,'宸':10,'寧':14,
  // 日部
  '昀':8,'旻':8,'昱':9,'晏':10,'暄':13,'曙':18,
  // 山部
  '峻':10,'崴':12,'嵐':12,'巍':21,
  // 心/忄部
  '恬':10,'恪':10,'悌':11,
  // 言/訁部
  '詩':13,'諒':16,'詠':12,'誼':15,
  // 馬部
  '騰':20,'驊':22,'騏':18,'駿':17,
  // 其他
  '毅':15,'禾':5,'澔':17,'璿':18,'珩':11,'翊':11,'熠':15,'琅':12,

  // ── 五行常用字補充（按部首分類・康熙正確畫數）──
  // 木部
  '本':5,'札':5,'朴':6,'朵':6,'朽':6,'杉':7,'杏':7,'村':7,
  '杰':8,'柱':9,'栩':10,'梓':11,'棋':12,'櫟':19,
  // 氵/水部
  '永':5,'汀':6,'浚':11,
  // 火/灬部
  '灿':7,'炎':8,'炳':9,'炫':9,'烈':10,'烜':10,'煊':13,
  // 土部
  '均':7,'坤':8,'城':10,'培':11,'堅':12,'堂':11,'基':11,
  '境':14,'增':15,'壯':7,
  // 金部
  '錦':16,'鎮':18
};

// kangxiStroke is now defined earlier alongside bihua()
// This old location is kept as a redirect for any other callers
// (actual implementation is in the bihua/kangxiStroke block above)

function analyzeName(fullName,options){
  options=options||{};window._jyNameError=null;
  if(typeof fullName!=='string')return null;
  var segments=fullName.trim().split(/\s+/),normalized=segments.join(''),chars=[...normalized];
  if(chars.length<2||chars.length>6){window._jyNameError='姓名長度超出本版支援範圍，請核對姓與名。';return null;}
  const strokes=chars.map(c=>kangxiStroke(c));
  if(strokes.some(n=>!Number.isInteger(n)||n<1)){window._jyNameError='字表尚無「'+chars.filter((c,i)=>!Number.isInteger(strokes[i])||strokes[i]<1).join('、')+'」的可靠筆畫，請核對字形；本次不估算五格。';return null;}
  var compound=['歐陽','司馬','上官','諸葛','東方','皇甫','尉遲','公孫','慕容','司徒','司空','夏侯','令狐','宇文','長孫','南宮','獨孤','西門','軒轅','端木','公羊','公冶','澹臺','赫連','聞人','申屠','仲孫','拓跋','公西','呼延'];
  var declared=options.surnameLength!=null?Number(options.surnameLength):segments.length===2?[...segments[0]].length:null;
  var surnameLength=declared==null?(compound.includes(chars.slice(0,2).join(''))?2:1):declared;
  if(![1,2].includes(surnameLength)||chars.length<=surnameLength||chars.length-surnameLength>3){window._jyNameError='請以「姓 名」分隔，或核對單姓／複姓與名字長度。';return null;}
  var surname=chars.slice(0,surnameLength).join(''),given=chars.slice(surnameLength).join(''),sum=a=>a.reduce((x,y)=>x+y,0);
  let tianGe=sum(strokes.slice(0,surnameLength))+(surnameLength===1?1:0);
  let renGe=strokes[surnameLength-1]+strokes[surnameLength];
  let diGe=sum(strokes.slice(surnameLength))+(chars.length-surnameLength===1?1:0);
  let zongGe=sum(strokes),waiGe=tianGe+diGe-renGe;
  fullName=normalized;

  // 五行
  function geWuxing(ge){
    const tail=ge%10;
    if(tail===1||tail===2)return'木';
    if(tail===3||tail===4)return'火';
    if(tail===5||tail===6)return'土';
    if(tail===7||tail===8)return'金';
    return'水';
  }

  // 吉凶（依正統81數理靈動數）
  function geFortune(ge){
    const n=((ge-1)%80)+1;
    // 吉祥運（大吉）— 依正統81數理靈動數（多版本校對）
    const dj=[1,3,5,7,8,11,13,15,16,18,21,23,24,25,31,32,33,35,37,39,41,45,47,48,52,57,61,63,65,67,68,81];
    // 次吉祥運（吉/半吉）
    const ji=[6,17,26,27,29,30,38,49,51,55,58,71,72,73,75,77];
    // 凶數（其餘）
    if(dj.includes(n))return{level:'大吉',cls:'text-success'};
    if(ji.includes(n))return{level:'吉',cls:'text-success'};
    return{level:'凶',cls:'text-danger'};
  }

  // 三才配置（完整125組合查表）
  const sanCai=[geWuxing(tianGe),geWuxing(renGe),geWuxing(diGe)];
  const _SC={
  '木木木':'大吉','木木火':'大吉','木木土':'吉','木木金':'凶','木木水':'吉',
  '木火木':'大吉','木火火':'吉','木火土':'大吉','木火金':'凶','木火水':'凶',
  '木土木':'凶','木土火':'平','木土土':'平','木土金':'凶','木土水':'凶',
  '木金木':'凶','木金火':'凶','木金土':'凶','木金金':'凶','木金水':'凶',
  '木水木':'大吉','木水火':'凶','木水土':'凶','木水金':'吉','木水水':'吉',
  '火木木':'大吉','火木火':'大吉','火木土':'吉','火木金':'凶','火木水':'吉',
  '火火木':'大吉','火火火':'吉','火火土':'大吉','火火金':'凶','火火水':'凶',
  '火土木':'平','火土火':'大吉','火土土':'大吉','火土金':'吉','火土水':'凶',
  '火金木':'凶','火金火':'凶','火金土':'凶','火金金':'凶','火金水':'凶',
  '火水木':'凶','火水火':'凶','火水土':'凶','火水金':'凶','火水水':'凶',
  '土木木':'平','土木火':'吉','土木土':'凶','土木金':'凶','土木水':'凶',
  '土火木':'大吉','土火火':'吉','土火土':'大吉','土火金':'平','土火水':'凶',
  '土土木':'平','土土火':'大吉','土土土':'大吉','土土金':'吉','土土水':'凶',
  '土金木':'凶','土金火':'凶','土金土':'大吉','土金金':'吉','土金水':'吉',
  '土水木':'凶','土水火':'凶','土水土':'凶','土水金':'凶','土水水':'凶',
  '金木木':'凶','金木火':'凶','金木土':'凶','金木金':'凶','金木水':'凶',
  '金火木':'凶','金火火':'凶','金火土':'平','金火金':'凶','金火水':'凶',
  '金土木':'平','金土火':'大吉','金土土':'大吉','金土金':'大吉','金土水':'平',
  '金金木':'凶','金金火':'凶','金金土':'大吉','金金金':'吉','金金水':'吉',
  '金水木':'大吉','金水火':'凶','金水土':'吉','金水金':'吉','金水水':'吉',
  '水木木':'大吉','水木火':'大吉','水木土':'吉','水木金':'凶','水木水':'吉',
  '水火木':'平','水火火':'凶','水火土':'平','水火金':'凶','水火水':'凶',
  '水土木':'凶','水土火':'平','水土土':'平','水土金':'平','水土水':'凶',
  '水金木':'凶','水金火':'凶','水金土':'吉','水金金':'吉','水金水':'吉',
  '水水木':'大吉','水水火':'凶','水水土':'凶','水水金':'吉','水水水':'平'
  };
  let sanCaiLevel=_SC[sanCai.join('')]||'平';

  return{
    name:fullName, strokes,surname,given,surnameLength,
    inputPolicy:{split:declared==null?'常見複姓表／其餘暫按單姓；可用姓與名間的空白明示':'使用者明示',strokeBasis:'本站康熙姓名學字表及數字特規；不是 Unicode 現代字形筆畫',unlisted:'停止五格，不猜數',numberCycle:'原數保留；81以上採本站減80循環口徑',fortuneBasis:'本站81數理及125三才表；流派分類，不是客觀命運'},
    tianGe:{num:tianGe,el:geWuxing(tianGe),fortune:geFortune(tianGe)},
    renGe:{num:renGe,el:geWuxing(renGe),fortune:geFortune(renGe)},
    diGe:{num:diGe,el:geWuxing(diGe),fortune:geFortune(diGe)},
    waiGe:{num:waiGe,el:geWuxing(waiGe),fortune:geFortune(waiGe)},
    zongGe:{num:zongGe,el:geWuxing(zongGe),fortune:geFortune(zongGe)},
    sanCai,sanCaiLevel
  };
}

/* =============================================================
   生肖姓名學 ZODIAC NAMEOLOGY（形義派）
   「字如環境，生肖如生物」— 適者生存原則
   ============================================================= */

// ── 出生年→生肖 ──
function getChineseZodiac(year){
  const z=['鼠','牛','虎','兔','龍','蛇','馬','羊','猴','雞','狗','豬'];
  return z[((year-4)%12+12)%12];
}
const ZODIAC_EMOJI={鼠:'🐭',牛:'🐂',虎:'🐯',兔:'🐰',龍:'🐲',蛇:'🐍',馬:'🐴',羊:'🐑',猴:'🐵',雞:'🐔',狗:'🐶',豬:'🐷'};
const ZODIAC_DIZHI={鼠:'子',牛:'丑',虎:'寅',兔:'卯',龍:'辰',蛇:'巳',馬:'午',羊:'未',猴:'申',雞:'酉',狗:'戌',豬:'亥'};

// ── 十二生肖字根喜忌資料庫 ──
// 每個生肖：{ like:[ {roots:[], label, reason, score} ], dislike:[ ... ] }
// roots 裡放字根/部首字串，拆字時比對
const ZODIAC_NAME_DB = {
  "鼠": {
    "like": [
      {
        "roots": [
          "口",
          "品",
          "宀",
          "冖",
          "穴",
          "門",
          "广",
          "冂"
        ],
        "label": "得洞",
        "reason": "鼠有洞穴藏身，安全感十足",
        "score": 8
      },
      {
        "roots": [
          "禾",
          "米",
          "豆",
          "麥",
          "粟"
        ],
        "label": "得糧",
        "reason": "鼠愛五穀雜糧，衣食無缺",
        "score": 9
      },
      {
        "roots": [
          "王",
          "玉",
          "大",
          "君",
          "主",
          "天"
        ],
        "label": "稱王",
        "reason": "鼠排行老大，逢大稱王得位",
        "score": 8
      },
      {
        "roots": [
          "申",
          "辰"
        ],
        "label": "三合",
        "reason": "申子辰三合水局，貴人運強",
        "score": 8
      },
      {
        "roots": [
          "亥",
          "丑",
          "牛"
        ],
        "label": "三會",
        "reason": "亥子丑三會北方水局，根基穩固",
        "score": 7
      },
      {
        "roots": [
          "艹"
        ],
        "label": "得草",
        "reason": "田間有草有糧，安穩富足",
        "score": 6
      },
      {
        "roots": [
          "水",
          "氵",
          "雨",
          "冫"
        ],
        "label": "得水",
        "reason": "子鼠屬水，逢水旺得助力",
        "score": 7
      },
      {
        "roots": [
          "金",
          "钅"
        ],
        "label": "逢金",
        "reason": "金生水，得長輩助力提攜",
        "score": 6
      },
      {
        "roots": [
          "木",
          "林"
        ],
        "label": "得木",
        "reason": "鼠在林間有掩護，安全自在",
        "score": 5
      },
      {
        "roots": [
          "田"
        ],
        "label": "得田",
        "reason": "鼠入田中有糧食，豐衣足食",
        "score": 6
      },
      {
        "roots": [
          "夕"
        ],
        "label": "得夕",
        "reason": "鼠為夜行動物，逢夕如魚得水",
        "score": 5
      },
      {
        "roots": [
          "衣",
          "巾",
          "彡",
          "采",
          "糸"
        ],
        "label": "得衣",
        "reason": "鼠披彩衣華麗其身，增添魅力",
        "score": 6
      },
      {
        "roots": [
          "礻"
        ],
        "label": "得福",
        "reason": "鼠逢示旁有福祿加身",
        "score": 5
      }
    ],
    "dislike": [
      {
        "roots": [
          "午",
          "馬"
        ],
        "label": "六衝",
        "reason": "子午相衝，衝擊大，感情事業受損",
        "score": -9
      },
      {
        "roots": [
          "未",
          "羊"
        ],
        "label": "六害",
        "reason": "子未相害，做事常有阻礙",
        "score": -7
      },
      {
        "roots": [
          "火",
          "灬"
        ],
        "label": "見火",
        "reason": "子為水忌火，水火不容",
        "score": -6
      },
      {
        "roots": [
          "日",
          "光",
          "明"
        ],
        "label": "見光",
        "reason": "鼠見光即死，處境危險",
        "score": -6
      },
      {
        "roots": [
          "人",
          "亻",
          "入"
        ],
        "label": "遇人",
        "reason": "人見老鼠人人喊打，不利",
        "score": -4
      },
      {
        "roots": [
          "心",
          "忄",
          "月",
          "肉"
        ],
        "label": "遇肉",
        "reason": "鼠雖雜食但見肉代表危險投機",
        "score": -3
      },
      {
        "roots": [
          "土"
        ],
        "label": "逢土",
        "reason": "土剋水，鼠逢土受剋阻礙多",
        "score": -4
      },
      {
        "roots": [
          "小",
          "少"
        ],
        "label": "逢小",
        "reason": "鼠為生肖之首，逢小降格",
        "score": -3
      }
    ]
  },
  "牛": {
    "like": [
      {
        "roots": [
          "艹"
        ],
        "label": "得草",
        "reason": "牛為草食動物，有草安穩飽足",
        "score": 9
      },
      {
        "roots": [
          "禾",
          "米",
          "豆",
          "麥",
          "粟"
        ],
        "label": "得糧",
        "reason": "牛逢五穀有吃有喝，福祿雙全",
        "score": 8
      },
      {
        "roots": [
          "水",
          "氵",
          "雨",
          "冫"
        ],
        "label": "得水",
        "reason": "丑牛土藏水，逢水相生順遂",
        "score": 7
      },
      {
        "roots": [
          "宀",
          "冖",
          "穴",
          "門",
          "广"
        ],
        "label": "得屋",
        "reason": "牛有牛棚安居，受人保護",
        "score": 7
      },
      {
        "roots": [
          "巳",
          "蛇",
          "辶",
          "弓",
          "几",
          "廴"
        ],
        "label": "六合",
        "reason": "巳丑合金，貴人運旺",
        "score": 8
      },
      {
        "roots": [
          "酉",
          "雞",
          "鳥"
        ],
        "label": "三合",
        "reason": "巳酉丑三合金局，助力宏大",
        "score": 8
      },
      {
        "roots": [
          "子",
          "鼠",
          "亥"
        ],
        "label": "三會",
        "reason": "亥子丑三會北方水局，根基穩",
        "score": 7
      },
      {
        "roots": [
          "田"
        ],
        "label": "得田",
        "reason": "牛在田中耕作有用武之地",
        "score": 6
      },
      {
        "roots": [
          "車"
        ],
        "label": "拉車",
        "reason": "牛拉車雖辛勞但受重用",
        "score": 4
      },
      {
        "roots": [
          "金",
          "钅"
        ],
        "label": "逢金",
        "reason": "土生金，才華能發揮",
        "score": 5
      }
    ],
    "dislike": [
      {
        "roots": [
          "未",
          "羊"
        ],
        "label": "六衝",
        "reason": "丑未相衝，做事波折反覆",
        "score": -9
      },
      {
        "roots": [
          "午",
          "馬"
        ],
        "label": "六害",
        "reason": "丑午相害，辛苦勞碌無回報",
        "score": -7
      },
      {
        "roots": [
          "王",
          "玉",
          "大",
          "君",
          "天",
          "帝"
        ],
        "label": "稱王",
        "reason": "牛逢大為犧牲祭品，勞碌命",
        "score": -7
      },
      {
        "roots": [
          "日",
          "光",
          "明"
        ],
        "label": "見日",
        "reason": "牛在烈日下耕作成喘牛",
        "score": -5
      },
      {
        "roots": [
          "山",
          "岳"
        ],
        "label": "上山",
        "reason": "牛走山路辛苦異常",
        "score": -5
      },
      {
        "roots": [
          "心",
          "忄",
          "月",
          "肉"
        ],
        "label": "遇肉",
        "reason": "牛為草食不食肉，見肉缺財",
        "score": -4
      },
      {
        "roots": [
          "衣",
          "巾",
          "彡",
          "采",
          "糸"
        ],
        "label": "披衣",
        "reason": "牛披彩衣如祭品，犧牲奉獻",
        "score": -6
      },
      {
        "roots": [
          "火",
          "灬"
        ],
        "label": "見火",
        "reason": "火剋金，有損牛之運勢",
        "score": -4
      },
      {
        "roots": [
          "礻"
        ],
        "label": "祭祀",
        "reason": "牛見示旁如被祭祀，大凶",
        "score": -7
      }
    ]
  },
  "虎": {
    "like": [
      {
        "roots": [
          "山",
          "岳",
          "岡"
        ],
        "label": "得山",
        "reason": "虎嘯山林，適得其所",
        "score": 9
      },
      {
        "roots": [
          "木",
          "林",
          "森",
          "東"
        ],
        "label": "得林",
        "reason": "虎居森林中如魚得水",
        "score": 9
      },
      {
        "roots": [
          "王",
          "玉",
          "大",
          "君",
          "天",
          "帝",
          "主"
        ],
        "label": "稱王",
        "reason": "虎為森林之王，稱王得位",
        "score": 9
      },
      {
        "roots": [
          "午",
          "馬"
        ],
        "label": "六合",
        "reason": "寅午合火，貴人助力",
        "score": 8
      },
      {
        "roots": [
          "戌",
          "犬",
          "犭"
        ],
        "label": "三合",
        "reason": "寅午戌三合火局，力量強大",
        "score": 8
      },
      {
        "roots": [
          "卯",
          "兔"
        ],
        "label": "三會",
        "reason": "寅卯辰三會東方木局",
        "score": 6
      },
      {
        "roots": [
          "心",
          "忄",
          "月",
          "肉"
        ],
        "label": "得肉",
        "reason": "虎為肉食動物，有肉飽足",
        "score": 8
      },
      {
        "roots": [
          "衣",
          "巾",
          "彡",
          "采",
          "糸"
        ],
        "label": "得衣",
        "reason": "虎披彩衣為華麗猛虎，威風加倍",
        "score": 7
      },
      {
        "roots": [
          "水",
          "氵",
          "雨",
          "冫"
        ],
        "label": "得水",
        "reason": "水生木，虎得水滋養",
        "score": 5
      },
      {
        "roots": [
          "口",
          "品"
        ],
        "label": "開口",
        "reason": "虎開口展威風，能力發揮",
        "score": 6
      }
    ],
    "dislike": [
      {
        "roots": [
          "申",
          "猴"
        ],
        "label": "六衝",
        "reason": "寅申相衝，衝突極大",
        "score": -9
      },
      {
        "roots": [
          "巳",
          "蛇",
          "辶",
          "弓",
          "几",
          "廴"
        ],
        "label": "六害",
        "reason": "蛇虎相害，互相傷害",
        "score": -7
      },
      {
        "roots": [
          "人",
          "亻",
          "入"
        ],
        "label": "遇人",
        "reason": "虎落平陽被犬欺，人伐虎不利",
        "score": -5
      },
      {
        "roots": [
          "日",
          "光",
          "明"
        ],
        "label": "見光",
        "reason": "虎在白日行動易暴露",
        "score": -3
      },
      {
        "roots": [
          "門",
          "宀"
        ],
        "label": "入門",
        "reason": "虎入平地被關，有志難伸",
        "score": -4
      },
      {
        "roots": [
          "小",
          "少"
        ],
        "label": "逢小",
        "reason": "虎逢小降格為貓，失威風",
        "score": -5
      },
      {
        "roots": [
          "禾",
          "米",
          "豆",
          "麥"
        ],
        "label": "逢糧",
        "reason": "虎不食五穀，英雄無用武之地",
        "score": -3
      },
      {
        "roots": [
          "田"
        ],
        "label": "入田",
        "reason": "虎入田中被困，無法發揮",
        "score": -3
      }
    ]
  },
  "兔": {
    "like": [
      {
        "roots": [
          "艹",
          "竹"
        ],
        "label": "得草",
        "reason": "兔有青草，生活安穩無憂",
        "score": 9
      },
      {
        "roots": [
          "口",
          "品",
          "宀",
          "冖",
          "穴",
          "門",
          "广"
        ],
        "label": "得洞",
        "reason": "兔有窩穴，安全感十足",
        "score": 8
      },
      {
        "roots": [
          "禾",
          "米",
          "豆",
          "麥"
        ],
        "label": "得糧",
        "reason": "五穀豐登，不愁溫飽",
        "score": 7
      },
      {
        "roots": [
          "木",
          "林",
          "森",
          "東"
        ],
        "label": "得林",
        "reason": "兔在林中有掩護，安全自在",
        "score": 8
      },
      {
        "roots": [
          "亥",
          "未"
        ],
        "label": "三合",
        "reason": "亥卯未三合木局，貴人運強",
        "score": 8
      },
      {
        "roots": [
          "寅"
        ],
        "label": "三會",
        "reason": "寅卯辰三會東方木局，根基穩",
        "score": 6
      },
      {
        "roots": [
          "衣",
          "巾",
          "彡",
          "采",
          "糸"
        ],
        "label": "得衣",
        "reason": "兔得彩衣為華麗，增添魅力",
        "score": 6
      },
      {
        "roots": [
          "水",
          "氵",
          "雨",
          "冫"
        ],
        "label": "得水",
        "reason": "水生木，兔得水滋養",
        "score": 5
      },
      {
        "roots": [
          "食"
        ],
        "label": "得食",
        "reason": "有食不缺，安穩富足",
        "score": 5
      },
      {
        "roots": [
          "小",
          "少"
        ],
        "label": "得小",
        "reason": "兔為小動物，小而得位",
        "score": 5
      }
    ],
    "dislike": [
      {
        "roots": [
          "酉",
          "雞",
          "鳥",
          "隹",
          "羽",
          "飛",
          "金",
          "钅",
          "西"
        ],
        "label": "六衝",
        "reason": "卯酉相衝，口舌是非不斷",
        "score": -9
      },
      {
        "roots": [
          "辰",
          "龍"
        ],
        "label": "六害",
        "reason": "卯辰相害，身邊人反成阻礙",
        "score": -7
      },
      {
        "roots": [
          "日",
          "光",
          "明",
          "白"
        ],
        "label": "見光",
        "reason": "兔見日光暴露，處境危險",
        "score": -5
      },
      {
        "roots": [
          "人",
          "亻",
          "入"
        ],
        "label": "遇人",
        "reason": "守株待兔，見人被獵捕",
        "score": -6
      },
      {
        "roots": [
          "大",
          "王",
          "玉",
          "君",
          "主",
          "天",
          "帝"
        ],
        "label": "太大",
        "reason": "兔太大引注目被捕，不宜張揚",
        "score": -5
      },
      {
        "roots": [
          "刀",
          "刂",
          "匕",
          "力",
          "斤"
        ],
        "label": "遇刀",
        "reason": "利刃在側，有開刀之虞",
        "score": -6
      },
      {
        "roots": [
          "火",
          "灬"
        ],
        "label": "見火",
        "reason": "兔遇火有劫，易衝動犯錯",
        "score": -5
      },
      {
        "roots": [
          "山",
          "岳",
          "阝"
        ],
        "label": "上山",
        "reason": "兔入山為虎口送食",
        "score": -4
      },
      {
        "roots": [
          "心",
          "忄",
          "月",
          "肉"
        ],
        "label": "遇肉",
        "reason": "兔為草食動物，見肉不合",
        "score": -3
      },
      {
        "roots": [
          "石"
        ],
        "label": "遇石",
        "reason": "兔撞石受傷，處境不利",
        "score": -3
      }
    ]
  },
  "龍": {
    "like": [
      {
        "roots": [
          "日",
          "明",
          "光",
          "星"
        ],
        "label": "得天",
        "reason": "龍見日月星飛龍在天，大展鴻圖",
        "score": 9
      },
      {
        "roots": [
          "水",
          "氵",
          "雨",
          "冫"
        ],
        "label": "得水",
        "reason": "辰龍見水字根的形義派象徵偏合；不由字根推論財富或地位",
        "score": 9
      },
      {
        "roots": [
          "王",
          "玉",
          "君",
          "主",
          "大",
          "天",
          "帝"
        ],
        "label": "得位",
        "reason": "龍為至尊，見王字根稱帝",
        "score": 9
      },
      {
        "roots": [
          "申",
          "猴"
        ],
        "label": "三合",
        "reason": "申子辰三合水局，貴人助力",
        "score": 8
      },
      {
        "roots": [
          "子",
          "鼠"
        ],
        "label": "三合",
        "reason": "申子辰三合水局，財運順暢",
        "score": 8
      },
      {
        "roots": [
          "月"
        ],
        "label": "明珠",
        "reason": "龍得月明珠，日月同輝",
        "score": 7
      },
      {
        "roots": [
          "馬",
          "午"
        ],
        "label": "龍馬",
        "reason": "龍馬精神，事業亨通",
        "score": 6
      },
      {
        "roots": [
          "衣",
          "巾",
          "彡",
          "采",
          "糸"
        ],
        "label": "得衣",
        "reason": "龍披彩衣增添威嚴",
        "score": 5
      }
    ],
    "dislike": [
      {
        "roots": [
          "戌",
          "犬",
          "犭"
        ],
        "label": "六衝",
        "reason": "辰戌正衝，生肖最大忌",
        "score": -9
      },
      {
        "roots": [
          "卯",
          "兔"
        ],
        "label": "六害",
        "reason": "玉兔見龍雲裡去，相害",
        "score": -7
      },
      {
        "roots": [
          "山",
          "岳",
          "阝"
        ],
        "label": "龍虎鬥",
        "reason": "山為虎鄉，龍虎相鬥",
        "score": -6
      },
      {
        "roots": [
          "虎",
          "寅"
        ],
        "label": "龍虎鬥",
        "reason": "龍虎鬥兩敗俱傷",
        "score": -6
      },
      {
        "roots": [
          "口",
          "品"
        ],
        "label": "困龍",
        "reason": "小口困龍，有志難伸",
        "score": -5
      },
      {
        "roots": [
          "辶",
          "弓",
          "几",
          "廴",
          "乙"
        ],
        "label": "降格",
        "reason": "龍降格為蛇，地位降低",
        "score": -5
      },
      {
        "roots": [
          "禾",
          "米",
          "豆",
          "麥",
          "艹"
        ],
        "label": "逢糧",
        "reason": "龍不食人間煙火",
        "score": -3
      },
      {
        "roots": [
          "心",
          "忄",
          "肉"
        ],
        "label": "遇肉",
        "reason": "龍不食肉類五穀",
        "score": -3
      },
      {
        "roots": [
          "未",
          "羊"
        ],
        "label": "天羅",
        "reason": "辰未天羅地網，多禍多愁",
        "score": -5
      },
      {
        "roots": [
          "小",
          "少"
        ],
        "label": "逢小",
        "reason": "龍逢小降格，失威嚴",
        "score": -4
      }
    ]
  },
  "蛇": {
    "like": [
      {
        "roots": [
          "口",
          "品",
          "宀",
          "冖",
          "穴",
          "門",
          "广"
        ],
        "label": "得洞",
        "reason": "蛇有洞穴棲息，安全自在",
        "score": 8
      },
      {
        "roots": [
          "木",
          "林",
          "森"
        ],
        "label": "得林",
        "reason": "蛇在林中攀爬自如，如魚得水",
        "score": 7
      },
      {
        "roots": [
          "衣",
          "巾",
          "彡",
          "采",
          "糸"
        ],
        "label": "得衣",
        "reason": "蛇披彩衣轉升為龍",
        "score": 8
      },
      {
        "roots": [
          "酉",
          "雞",
          "鳥",
          "隹",
          "羽"
        ],
        "label": "六合",
        "reason": "巳酉合金，貴人運旺",
        "score": 8
      },
      {
        "roots": [
          "丑",
          "牛"
        ],
        "label": "三合",
        "reason": "巳酉丑三合金局",
        "score": 8
      },
      {
        "roots": [
          "午",
          "馬"
        ],
        "label": "六合",
        "reason": "巳午會南方火局",
        "score": 7
      },
      {
        "roots": [
          "心",
          "忄",
          "月",
          "肉"
        ],
        "label": "得肉",
        "reason": "蛇為肉食動物，有肉飽足",
        "score": 7
      },
      {
        "roots": [
          "田"
        ],
        "label": "得田",
        "reason": "蛇在田間有食物來源",
        "score": 5
      },
      {
        "roots": [
          "辶",
          "弓",
          "几",
          "廴",
          "乙"
        ],
        "label": "同形",
        "reason": "蛇形字根為同類相助",
        "score": 6
      },
      {
        "roots": [
          "火",
          "灬"
        ],
        "label": "得火",
        "reason": "巳蛇屬火，見火比旺",
        "score": 5
      },
      {
        "roots": [
          "王",
          "玉",
          "大",
          "君",
          "天"
        ],
        "label": "稱王",
        "reason": "蛇有稱王之意（小龍）",
        "score": 5
      }
    ],
    "dislike": [
      {
        "roots": [
          "亥",
          "豬",
          "豕"
        ],
        "label": "六衝",
        "reason": "巳亥相衝，衝擊極大",
        "score": -9
      },
      {
        "roots": [
          "寅",
          "虎"
        ],
        "label": "六害",
        "reason": "蛇虎相害，互相傷害",
        "score": -7
      },
      {
        "roots": [
          "人",
          "亻",
          "入"
        ],
        "label": "遇人",
        "reason": "人蛇相遇兩害怕",
        "score": -5
      },
      {
        "roots": [
          "日",
          "光",
          "明"
        ],
        "label": "見光",
        "reason": "蛇怕暴露在陽光下",
        "score": -4
      },
      {
        "roots": [
          "水",
          "氵",
          "雨",
          "冫"
        ],
        "label": "見水",
        "reason": "蛇入水有溺水之虞",
        "score": -4
      },
      {
        "roots": [
          "禾",
          "米",
          "豆",
          "麥",
          "艹"
        ],
        "label": "逢糧",
        "reason": "蛇不食五穀雜糧",
        "score": -3
      },
      {
        "roots": [
          "山",
          "岳"
        ],
        "label": "上山",
        "reason": "蛇在山中遇老虎不利",
        "score": -3
      },
      {
        "roots": [
          "石"
        ],
        "label": "遇石",
        "reason": "打草驚蛇之虞",
        "score": -3
      }
    ]
  },
  "馬": {
    "like": [
      {
        "roots": [
          "艹"
        ],
        "label": "得草",
        "reason": "馬有草原奔馳，自在快意",
        "score": 9
      },
      {
        "roots": [
          "禾",
          "米",
          "豆",
          "麥"
        ],
        "label": "得糧",
        "reason": "馬有五穀飽足安穩",
        "score": 7
      },
      {
        "roots": [
          "木",
          "林",
          "森",
          "東"
        ],
        "label": "得林",
        "reason": "馬在林間有蔭有靠",
        "score": 6
      },
      {
        "roots": [
          "寅",
          "虎"
        ],
        "label": "六合",
        "reason": "寅午合火，貴人助力",
        "score": 8
      },
      {
        "roots": [
          "戌",
          "犬",
          "犭"
        ],
        "label": "三合",
        "reason": "寅午戌三合火局",
        "score": 8
      },
      {
        "roots": [
          "未",
          "羊"
        ],
        "label": "三合",
        "reason": "午未合，桃花貴人旺",
        "score": 7
      },
      {
        "roots": [
          "衣",
          "巾",
          "彡",
          "采",
          "糸"
        ],
        "label": "得衣",
        "reason": "馬披彩衣為良駒，得遇伯樂",
        "score": 7
      },
      {
        "roots": [
          "龍",
          "辰"
        ],
        "label": "龍馬",
        "reason": "龍馬精神，事業亨通",
        "score": 6
      },
      {
        "roots": [
          "大",
          "王",
          "玉",
          "君",
          "天"
        ],
        "label": "稱王",
        "reason": "馬逢大為良駒受重用",
        "score": 5
      },
      {
        "roots": [
          "火",
          "灬"
        ],
        "label": "得火",
        "reason": "午馬屬火，見火比旺",
        "score": 5
      },
      {
        "roots": [
          "山",
          "岳"
        ],
        "label": "得山",
        "reason": "馬在山中自在奔馳",
        "score": 5
      },
      {
        "roots": [
          "宀",
          "冖",
          "穴",
          "門"
        ],
        "label": "得屋",
        "reason": "馬有馬廄安居",
        "score": 5
      }
    ],
    "dislike": [
      {
        "roots": [
          "子",
          "鼠"
        ],
        "label": "六衝",
        "reason": "子午相衝，衝擊極大",
        "score": -9
      },
      {
        "roots": [
          "丑",
          "牛"
        ],
        "label": "六害",
        "reason": "丑午相害，勞碌無功",
        "score": -7
      },
      {
        "roots": [
          "水",
          "氵",
          "雨",
          "冫"
        ],
        "label": "見水",
        "reason": "馬入水有溺水之虞",
        "score": -5
      },
      {
        "roots": [
          "田"
        ],
        "label": "入田",
        "reason": "馬入田地被困耕田勞碌",
        "score": -5
      },
      {
        "roots": [
          "口",
          "品"
        ],
        "label": "開口",
        "reason": "馬開口不祥，好馬不吃回頭草",
        "score": -3
      },
      {
        "roots": [
          "人",
          "亻",
          "入"
        ],
        "label": "遇人",
        "reason": "馬被人騎驅使勞碌",
        "score": -4
      },
      {
        "roots": [
          "心",
          "忄",
          "月",
          "肉"
        ],
        "label": "遇肉",
        "reason": "馬為草食動物不食肉",
        "score": -3
      },
      {
        "roots": [
          "石"
        ],
        "label": "遇石",
        "reason": "馬行石路不穩",
        "score": -3
      }
    ]
  },
  "羊": {
    "like": [
      {
        "roots": [
          "艹",
          "竹"
        ],
        "label": "得草",
        "reason": "羊有青草飽足安穩",
        "score": 9
      },
      {
        "roots": [
          "禾",
          "米",
          "豆",
          "麥"
        ],
        "label": "得糧",
        "reason": "羊逢五穀不愁吃穿",
        "score": 8
      },
      {
        "roots": [
          "口",
          "品",
          "宀",
          "冖",
          "穴",
          "門",
          "广"
        ],
        "label": "得洞",
        "reason": "羊有欄有洞受保護",
        "score": 7
      },
      {
        "roots": [
          "木",
          "林",
          "森",
          "東"
        ],
        "label": "得林",
        "reason": "羊在林中有蔭安穩",
        "score": 7
      },
      {
        "roots": [
          "亥",
          "豬",
          "豕"
        ],
        "label": "三合",
        "reason": "亥卯未三合木局",
        "score": 8
      },
      {
        "roots": [
          "卯",
          "兔"
        ],
        "label": "三合",
        "reason": "亥卯未三合木局",
        "score": 8
      },
      {
        "roots": [
          "午",
          "馬"
        ],
        "label": "六合",
        "reason": "午未合，桃花貴人旺",
        "score": 7
      },
      {
        "roots": [
          "小",
          "少"
        ],
        "label": "得小",
        "reason": "羊喜小得位，安穩自在",
        "score": 6
      },
      {
        "roots": [
          "水",
          "氵",
          "雨",
          "冫"
        ],
        "label": "得水",
        "reason": "羊逢水有滋潤",
        "score": 4
      },
      {
        "roots": [
          "火",
          "灬"
        ],
        "label": "得火",
        "reason": "未羊土藏火，見火比旺",
        "score": 5
      },
      {
        "roots": [
          "食"
        ],
        "label": "得食",
        "reason": "有食安穩",
        "score": 5
      }
    ],
    "dislike": [
      {
        "roots": [
          "丑",
          "牛"
        ],
        "label": "六衝",
        "reason": "丑未相衝，做事反覆波折",
        "score": -9
      },
      {
        "roots": [
          "子",
          "鼠"
        ],
        "label": "六害",
        "reason": "子未相害，常遇阻礙",
        "score": -7
      },
      {
        "roots": [
          "辰",
          "龍"
        ],
        "label": "天羅",
        "reason": "辰為天羅困羊，有志難伸",
        "score": -6
      },
      {
        "roots": [
          "戌",
          "犬",
          "犭"
        ],
        "label": "地網",
        "reason": "戌為地網困羊",
        "score": -6
      },
      {
        "roots": [
          "王",
          "玉",
          "大",
          "君",
          "天",
          "帝"
        ],
        "label": "太大",
        "reason": "羊逢大為祭品犧牲",
        "score": -7
      },
      {
        "roots": [
          "衣",
          "巾",
          "彡",
          "采",
          "糸"
        ],
        "label": "披衣",
        "reason": "羊披彩衣上供桌",
        "score": -6
      },
      {
        "roots": [
          "心",
          "忄",
          "月",
          "肉"
        ],
        "label": "遇肉",
        "reason": "羊為草食見肉失落",
        "score": -4
      },
      {
        "roots": [
          "刀",
          "刂",
          "匕",
          "力",
          "斤"
        ],
        "label": "遇刀",
        "reason": "羊逢刀為被宰殺",
        "score": -6
      },
      {
        "roots": [
          "日",
          "光",
          "明"
        ],
        "label": "見日",
        "reason": "羊在烈日下辛苦",
        "score": -3
      }
    ]
  },
  "猴": {
    "like": [
      {
        "roots": [
          "口",
          "品",
          "宀",
          "冖",
          "穴",
          "門",
          "广"
        ],
        "label": "得洞",
        "reason": "猴有洞穴棲息安全",
        "score": 8
      },
      {
        "roots": [
          "木",
          "林",
          "森",
          "東"
        ],
        "label": "得林",
        "reason": "猴在林中攀爬自如",
        "score": 9
      },
      {
        "roots": [
          "禾",
          "米",
          "豆",
          "麥"
        ],
        "label": "得糧",
        "reason": "猴有五穀安穩飽足",
        "score": 7
      },
      {
        "roots": [
          "子",
          "鼠"
        ],
        "label": "三合",
        "reason": "申子辰三合水局",
        "score": 8
      },
      {
        "roots": [
          "辰",
          "龍"
        ],
        "label": "三合",
        "reason": "申子辰三合水局",
        "score": 8
      },
      {
        "roots": [
          "水",
          "氵",
          "雨",
          "冫"
        ],
        "label": "得水",
        "reason": "金生水，猴逢水聰明伶俐",
        "score": 6
      },
      {
        "roots": [
          "金",
          "钅"
        ],
        "label": "得金",
        "reason": "申猴屬金，見金比旺",
        "score": 6
      },
      {
        "roots": [
          "土"
        ],
        "label": "得土",
        "reason": "土生金，猴逢土有根基",
        "score": 5
      },
      {
        "roots": [
          "人",
          "亻",
          "入"
        ],
        "label": "得人",
        "reason": "猴得人緣好，有貴人",
        "score": 5
      },
      {
        "roots": [
          "王",
          "玉",
          "大",
          "君",
          "天"
        ],
        "label": "稱王",
        "reason": "猴為山中王，得位有威",
        "score": 7
      },
      {
        "roots": [
          "衣",
          "巾",
          "彡",
          "采",
          "糸"
        ],
        "label": "得衣",
        "reason": "猴披衣如人，增添智慧",
        "score": 5
      },
      {
        "roots": [
          "山",
          "岳"
        ],
        "label": "得山",
        "reason": "猴在山中自在為王",
        "score": 6
      },
      {
        "roots": [
          "礻"
        ],
        "label": "得示",
        "reason": "示旁含申為猴本位",
        "score": 7
      },
      {
        "roots": [
          "心",
          "忄",
          "月",
          "肉"
        ],
        "label": "得肉",
        "reason": "猴為雜食動物有肉飽足",
        "score": 5
      }
    ],
    "dislike": [
      {
        "roots": [
          "寅",
          "虎"
        ],
        "label": "六衝",
        "reason": "寅申相衝，衝突極大",
        "score": -9
      },
      {
        "roots": [
          "亥",
          "豬",
          "豕"
        ],
        "label": "六害",
        "reason": "豬遇猿猴似箭投",
        "score": -7
      },
      {
        "roots": [
          "火",
          "灬"
        ],
        "label": "見火",
        "reason": "火剋金，猴逢火受傷",
        "score": -6
      },
      {
        "roots": [
          "田"
        ],
        "label": "入田",
        "reason": "猴入田被獵人追捕",
        "score": -4
      },
      {
        "roots": [
          "辶",
          "弓",
          "几",
          "廴",
          "乙"
        ],
        "label": "蛇形",
        "reason": "巳猴相刑害",
        "score": -4
      },
      {
        "roots": [
          "刀",
          "刂",
          "匕",
          "力",
          "斤"
        ],
        "label": "遇刀",
        "reason": "利器在旁有傷害之虞",
        "score": -5
      }
    ]
  },
  "雞": {
    "like": [
      {
        "roots": [
          "禾",
          "米",
          "豆",
          "麥",
          "粟"
        ],
        "label": "得糧",
        "reason": "雞有五穀安穩飽足",
        "score": 9
      },
      {
        "roots": [
          "艹"
        ],
        "label": "得草",
        "reason": "雞逢草有食物來源",
        "score": 7
      },
      {
        "roots": [
          "虫"
        ],
        "label": "得蟲",
        "reason": "雞食蟲安穩自在",
        "score": 6
      },
      {
        "roots": [
          "口",
          "品",
          "宀",
          "冖",
          "穴",
          "門",
          "广"
        ],
        "label": "得洞",
        "reason": "雞有雞舍安居",
        "score": 7
      },
      {
        "roots": [
          "丑",
          "牛"
        ],
        "label": "三合",
        "reason": "巳酉丑三合金局",
        "score": 8
      },
      {
        "roots": [
          "巳",
          "蛇",
          "辶",
          "弓",
          "几",
          "廴"
        ],
        "label": "三合",
        "reason": "巳酉丑三合金局",
        "score": 8
      },
      {
        "roots": [
          "衣",
          "巾",
          "彡",
          "采",
          "糸",
          "羽",
          "飛"
        ],
        "label": "得衣",
        "reason": "雞有羽毛華麗增添魅力",
        "score": 7
      },
      {
        "roots": [
          "山",
          "岳"
        ],
        "label": "得山",
        "reason": "雞上山為鳳凰升格",
        "score": 7
      },
      {
        "roots": [
          "金",
          "钅"
        ],
        "label": "得金",
        "reason": "酉雞屬金，見金比旺",
        "score": 6
      },
      {
        "roots": [
          "土"
        ],
        "label": "得土",
        "reason": "土生金，根基穩固",
        "score": 5
      },
      {
        "roots": [
          "小",
          "少"
        ],
        "label": "得小",
        "reason": "雞逢小安穩得位",
        "score": 4
      },
      {
        "roots": [
          "王",
          "玉",
          "大",
          "君",
          "天"
        ],
        "label": "稱王",
        "reason": "雞上山稱鳳凰得位",
        "score": 5
      }
    ],
    "dislike": [
      {
        "roots": [
          "卯",
          "兔"
        ],
        "label": "六衝",
        "reason": "卯酉相衝，衝擊極大",
        "score": -9
      },
      {
        "roots": [
          "戌",
          "犬",
          "犭"
        ],
        "label": "六害",
        "reason": "金雞遇犬淚雙流",
        "score": -7
      },
      {
        "roots": [
          "水",
          "氵",
          "雨",
          "冫"
        ],
        "label": "見水",
        "reason": "雞落水不吉，有溺水之虞",
        "score": -5
      },
      {
        "roots": [
          "心",
          "忄",
          "月",
          "肉"
        ],
        "label": "遇肉",
        "reason": "雞為禽食不食肉",
        "score": -4
      },
      {
        "roots": [
          "木",
          "林",
          "森"
        ],
        "label": "逢木",
        "reason": "金剋木耗損精力",
        "score": -3
      },
      {
        "roots": [
          "刀",
          "刂",
          "匕",
          "力",
          "斤"
        ],
        "label": "遇刀",
        "reason": "雞遇刀如被宰殺",
        "score": -6
      },
      {
        "roots": [
          "人",
          "亻",
          "入"
        ],
        "label": "遇人",
        "reason": "雞逢人被宰殺",
        "score": -5
      },
      {
        "roots": [
          "火",
          "灬"
        ],
        "label": "見火",
        "reason": "烤雞大凶",
        "score": -6
      }
    ]
  },
  "狗": {
    "like": [
      {
        "roots": [
          "口",
          "品",
          "宀",
          "冖",
          "穴",
          "門",
          "广"
        ],
        "label": "得洞",
        "reason": "狗有家有窩，忠心守護",
        "score": 8
      },
      {
        "roots": [
          "心",
          "忄",
          "月",
          "肉"
        ],
        "label": "得肉",
        "reason": "狗為肉食動物，有肉飽足",
        "score": 9
      },
      {
        "roots": [
          "禾",
          "米",
          "豆",
          "麥"
        ],
        "label": "得糧",
        "reason": "狗有五穀安穩",
        "score": 6
      },
      {
        "roots": [
          "寅",
          "虎"
        ],
        "label": "三合",
        "reason": "寅午戌三合火局",
        "score": 8
      },
      {
        "roots": [
          "午",
          "馬"
        ],
        "label": "三合",
        "reason": "寅午戌三合火局",
        "score": 8
      },
      {
        "roots": [
          "卯",
          "兔"
        ],
        "label": "六合",
        "reason": "卯戌合火，貴人運旺",
        "score": 8
      },
      {
        "roots": [
          "人",
          "亻",
          "入"
        ],
        "label": "得人",
        "reason": "狗為人類忠僕，有人依靠",
        "score": 7
      },
      {
        "roots": [
          "小",
          "少"
        ],
        "label": "得小",
        "reason": "狗逢小可愛得人疼",
        "score": 5
      },
      {
        "roots": [
          "衣",
          "巾",
          "彡",
          "采",
          "糸"
        ],
        "label": "得衣",
        "reason": "狗披衣受人寵愛",
        "score": 6
      },
      {
        "roots": [
          "木",
          "林",
          "森"
        ],
        "label": "得林",
        "reason": "狗在林中自在",
        "score": 4
      },
      {
        "roots": [
          "火",
          "灬"
        ],
        "label": "得火",
        "reason": "戌狗土藏金，見火溫暖",
        "score": 5
      },
      {
        "roots": [
          "土"
        ],
        "label": "得土",
        "reason": "狗逢土根基穩",
        "score": 5
      }
    ],
    "dislike": [
      {
        "roots": [
          "辰",
          "龍"
        ],
        "label": "六衝",
        "reason": "辰戌正衝，天羅地網",
        "score": -9
      },
      {
        "roots": [
          "酉",
          "雞",
          "鳥",
          "隹",
          "羽",
          "飛"
        ],
        "label": "六害",
        "reason": "雞犬不寧，口舌是非",
        "score": -7
      },
      {
        "roots": [
          "丑",
          "牛"
        ],
        "label": "三刑",
        "reason": "丑戌相刑，是非煩惱",
        "score": -6
      },
      {
        "roots": [
          "未",
          "羊"
        ],
        "label": "相破",
        "reason": "未戌相破，做事反覆",
        "score": -5
      },
      {
        "roots": [
          "水",
          "氵",
          "雨",
          "冫"
        ],
        "label": "落水",
        "reason": "落水狗人人喊打",
        "score": -6
      },
      {
        "roots": [
          "禾",
          "米",
          "豆",
          "麥",
          "艹"
        ],
        "label": "素食",
        "reason": "狗為肉食見素不飽",
        "score": -3
      },
      {
        "roots": [
          "王",
          "玉",
          "大",
          "君",
          "天"
        ],
        "label": "太大",
        "reason": "狗稱王有虎視耽耽之憂",
        "score": -4
      },
      {
        "roots": [
          "日",
          "光",
          "明"
        ],
        "label": "見日",
        "reason": "狗吠日，愛管閒事徒勞",
        "score": -4
      },
      {
        "roots": [
          "田"
        ],
        "label": "入田",
        "reason": "狗入田追兔不受歡迎",
        "score": -3
      }
    ]
  },
  "豬": {
    "like": [
      {
        "roots": [
          "口",
          "品",
          "宀",
          "冖",
          "穴",
          "門",
          "广"
        ],
        "label": "得洞",
        "reason": "豬有豬圈安居，被養育照顧",
        "score": 8
      },
      {
        "roots": [
          "禾",
          "米",
          "豆",
          "麥",
          "粟"
        ],
        "label": "得糧",
        "reason": "豬有五穀安穩飽足",
        "score": 9
      },
      {
        "roots": [
          "艹"
        ],
        "label": "得草",
        "reason": "豬逢草有食物安穩",
        "score": 7
      },
      {
        "roots": [
          "卯",
          "兔"
        ],
        "label": "三合",
        "reason": "亥卯未三合木局",
        "score": 8
      },
      {
        "roots": [
          "未",
          "羊"
        ],
        "label": "三合",
        "reason": "亥卯未三合木局",
        "score": 8
      },
      {
        "roots": [
          "子",
          "鼠"
        ],
        "label": "三會",
        "reason": "亥子丑三會北方水局",
        "score": 7
      },
      {
        "roots": [
          "丑",
          "牛"
        ],
        "label": "三會",
        "reason": "亥子丑三會水局",
        "score": 7
      },
      {
        "roots": [
          "木",
          "林",
          "森",
          "東"
        ],
        "label": "得林",
        "reason": "豬在林中有木有靠",
        "score": 6
      },
      {
        "roots": [
          "月"
        ],
        "label": "得月",
        "reason": "月為卯兔，三合有助",
        "score": 6
      },
      {
        "roots": [
          "水",
          "氵",
          "雨",
          "冫"
        ],
        "label": "得水",
        "reason": "亥豬屬水，逢水旺",
        "score": 6
      },
      {
        "roots": [
          "金",
          "钅"
        ],
        "label": "得金",
        "reason": "金生水，有長輩助力",
        "score": 5
      },
      {
        "roots": [
          "田"
        ],
        "label": "得田",
        "reason": "豬在田中有糧有食",
        "score": 5
      }
    ],
    "dislike": [
      {
        "roots": [
          "巳",
          "蛇"
        ],
        "label": "六衝",
        "reason": "巳亥相衝，衝擊極大",
        "score": -9
      },
      {
        "roots": [
          "辶",
          "弓",
          "几",
          "廴",
          "乙"
        ],
        "label": "蛇形",
        "reason": "蛇形字根=六衝巳蛇",
        "score": -8
      },
      {
        "roots": [
          "申",
          "猴"
        ],
        "label": "六害",
        "reason": "豬遇猿猴似箭投",
        "score": -7
      },
      {
        "roots": [
          "衣",
          "巾",
          "彡",
          "采",
          "糸"
        ],
        "label": "披衣",
        "reason": "豬披彩衣上供桌祭祀",
        "score": -7
      },
      {
        "roots": [
          "王",
          "玉",
          "大",
          "君",
          "天",
          "帝"
        ],
        "label": "太大",
        "reason": "豬逢大為祭品犧牲",
        "score": -6
      },
      {
        "roots": [
          "刀",
          "刂",
          "匕",
          "力",
          "斤"
        ],
        "label": "遇刀",
        "reason": "殺豬刀大凶",
        "score": -7
      },
      {
        "roots": [
          "礻"
        ],
        "label": "祭祀",
        "reason": "豬見祭祀如上供桌",
        "score": -8
      },
      {
        "roots": [
          "火",
          "灬"
        ],
        "label": "見火",
        "reason": "烤豬大凶",
        "score": -6
      },
      {
        "roots": [
          "山",
          "岳",
          "阝"
        ],
        "label": "上山",
        "reason": "豬上山勞碌",
        "score": -3
      },
      {
        "roots": [
          "人",
          "亻",
          "入"
        ],
        "label": "遇人",
        "reason": "人豬相遇，豬被宰殺",
        "score": -5
      },
      {
        "roots": [
          "車",
          "軍"
        ],
        "label": "遇車",
        "reason": "豬見車代表被載送宰殺，奔波勞碌",
        "score": -5
      },
      {
        "roots": [
          "网",
          "罒",
          "冂"
        ],
        "label": "遇網",
        "reason": "豬見網代表被捕捉束縛，有志難伸",
        "score": -4
      }
    ]
  }
};

// ── 字根拆解引擎// ── 字根拆解引擎（預建表 + Unicode 部首雙軌） ──
// 預建表：常見字→包含的字根（精準拆解）
const CHAR_ROOTS = {
  // 蛇形字根（辶弓几廴之乙）相關字
  '弘':['弓'],'強':['弓'],'張':['弓'],'弦':['弓'],'引':['弓'],'弟':['弓'],'弘':['弓'],
  '建':['廴'],'廷':['廴'],'延':['廴'],
  '連':['辶'],'通':['辶'],'達':['辶'],'道':['辶'],'遠':['辶'],'運':['辶'],'進':['辶'],'遊':['辶'],'過':['辶'],'近':['辶'],'迎':['辶'],'返':['辶'],'逢':['辶'],'遷':['辶'],'選':['辶'],'透':['辶'],'造':['辶'],'迷':['辶'],'追':['辶'],'退':['辶'],'送':['辶'],'逸':['辶'],'遙':['辶'],'邊':['辶'],
  '乙':['乙'],'也':['乙'],'乾':['乙'],
  // 人/亻相關
  '仁':['亻'],'仙':['亻'],'代':['亻'],'令':['令','人'],'以':['人'],'任':['亻'],'份':['亻'],'伯':['亻'],'何':['亻'],'佑':['亻'],'佳':['亻'],'依':['亻'],'俊':['亻'],'信':['亻'],'修':['亻'],'倫':['亻'],'偉':['亻'],'傑':['亻'],'儀':['亻'],'優':['亻'],
  // 王/玉相關
  '王':['王'],'玉':['玉'],'珍':['王'],'珠':['王'],'琪':['王'],'琳':['王'],'瑞':['王'],'瑜':['王'],'瑤':['王'],'璇':['王'],'璿':['王'],'環':['王'],'瓊':['王'],'玟':['王'],'玫':['王'],'珊':['王'],'琦':['王'],'璋':['王'],'璞':['王'],'璐':['王'],'瑰':['王'],'琉':['王'],'理':['王'],'現':['王'],'琴':['王'],
  // 大相關
  '大':['大'],'天':['大'],'太':['大'],'奇':['大'],'奧':['大'],'奉':['大'],'奎':['大'],'奕':['大'],
  // 彩衣相關
  '彩':['彡'],'影':['彡'],'彤':['彡'],'彰':['彡'],'形':['彡'],
  '帆':['巾'],'布':['巾'],'帝':['巾'],'師':['巾'],'帥':['巾'],'常':['巾'],'幕':['巾'],'幣':['巾'],'帶':['巾'],'希':['巾'],'帷':['巾'],
  '衣':['衣'],'裝':['衣'],'裕':['衣'],'褔':['衣'],'表':['衣'],'被':['衣'],'袁':['衣','袁'],'裴':['衣'],'補':['衣'],'衫':['衣'],'褚':['衣'],'裙':['衣'],'褐':['衣'],
  '初':['衣','刀'],'袖':['衣'],
  '紅':['糸'],'紋':['糸'],'純':['糸'],'素':['糸'],'紫':['糸'],'細':['糸'],'結':['糸'],'絲':['糸'],'綺':['糸'],'綠':['糸'],'緣':['糸'],'線':['糸'],'縈':['糸'],'織':['糸'],'繡':['糸'],'綿':['糸'],'綸':['糸'],'緯':['糸'],'繁':['糸'],'繼':['糸'],
  // 刀刂相關
  '刀':['刀'],'分':['刀'],'切':['刀'],'刊':['刂'],'列':['刂'],'刑':['刂'],'利':['刂'],'別':['刂'],'判':['刂'],'到':['刂'],'制':['刂'],'剛':['刂'],'前':['刂'],'剪':['刀'],'創':['刂'],'劉':['刂'],'劍':['刂'],'劑':['刂'],
  '力':['力'],'功':['力'],'加':['力'],'助':['力'],'努':['力'],'勇':['力'],'動':['力'],'勝':['力'],'勢':['力'],'勵':['力'],'勤':['力'],
  '匕':['匕'],'比':['匕'],'北':['匕'],
  '斤':['斤'],'新':['斤'],'斷':['斤'],'所':['斤'],
  // 宀冖穴門口相關
  '安':['宀'],'宇':['宀'],'守':['宀'],'宏':['宀'],'宗':['宀'],'官':['宀'],'定':['宀'],'宜':['宀'],'客':['宀'],'宣':['宀'],'室':['宀'],'宮':['宀'],'家':['宀'],'容':['宀'],'富':['宀'],'寒':['宀'],'寓':['宀'],'寧':['宀'],'實':['宀'],'寶':['宀'],'寬':['宀'],
  '冠':['冖','冠'],'冥':['冖'],'冤':['冖'],'寫':['冖'],
  '門':['門'],'閃':['門'],'閉':['門'],'開':['門'],'間':['門'],'閒':['門'],'閣':['門'],'闊':['門'],'關':['門'],
  '口':['口'],'古':['口'],'台':['口'],'吉':['口'],'合':['口'],'名':['口'],'品':['口','品'],'唐':['口'],'嘉':['口'],'喬':['口'],
  // 禾米豆糧食相關
  '禾':['禾'],'秀':['禾'],'私':['禾'],'秋':['禾'],'科':['禾'],'秦':['禾'],'程':['禾'],'稀':['禾'],'種':['禾'],'稚':['禾'],'穎':['禾'],'穗':['禾'],'穰':['禾'],
  '米':['米'],'粒':['米'],'精':['米'],'粹':['米'],'糧':['米'],'粉':['米'],'粟':['米'],
  '豆':['豆'],'豐':['豆'],'豔':['豆'],
  // 艹草相關
  '芳':['艹'],'花':['艹'],'苗':['艹'],'英':['艹'],'草':['艹'],'茂':['艹'],'莊':['艹'],'華':['艹'],'萍':['艹'],'菁':['艹'],'菲':['艹'],'萱':['艹'],'蓉':['艹'],'蓮':['艹'],'蕙':['艹'],'蕊':['艹'],'藝':['艹'],'蘭':['艹'],'蘋':['艹'],'薇':['艹'],'芬':['艹'],'芸':['艹'],'若':['艹'],'茹':['艹'],'荷':['艹'],'莉':['艹'],'葉':['艹'],'蒼':['艹'],'蔚':['艹'],'蕭':['艹'],
  // 木林相關
  '木':['木'],'本':['木'],'杉':['木'],'李':['木'],'村':['木'],'杏':['木'],'材':['木'],'松':['木'],'林':['木','林'],'果':['木'],'柏':['木'],'柔':['木'],'柳':['木'],'桂':['木'],'桃':['木'],'梅':['木'],'梓':['木'],'森':['木','林'],'楊':['木'],'楓':['木'],'榮':['木'],'樂':['木'],'樹':['木'],'橋':['木'],'檸':['木'],'棟':['木'],'棉':['木'],
  // 山岳相關
  '山':['山'],'岳':['山'],'峰':['山'],'崇':['山'],'嵐':['山'],'嶺':['山'],'巍':['山'],'崖':['山'],'岩':['山'],'崑':['山'],'嵩':['山'],
  // 水氵雨相關
  '水':['水'],'永':['水'],'江':['氵'],'河':['氵'],'沁':['氵'],'沈':['氵'],'沐':['氵'],'沛':['氵'],'治':['氵'],'泉':['氵'],'泰':['氵'],'洋':['氵'],'洛':['氵'],'洪':['氵'],'浩':['氵'],'海':['氵'],'涵':['氵'],'淑':['氵'],'淳':['氵'],'清':['氵'],'渝':['氵'],'湘':['氵'],'源':['氵'],'溪':['氵'],'滿':['氵'],'漢':['氵'],'潔':['氵'],'潤':['氵'],'澤':['氵'],'濤':['氵'],'瀚':['氵'],'灣':['氵'],
  '雨':['雨'],'雪':['雨'],'雲':['雨'],'零':['雨'],'霖':['雨'],'霜':['雨'],'霞':['雨'],'露':['雨'],'靈':['雨'],'霆':['雨'],
  // 火灬相關
  '火':['火'],'炎':['火'],'炳':['火'],'烈':['火'],'煌':['火'],'煥':['火'],'熊':['火','灬'],'熙':['灬'],'燕':['灬'],'燦':['火'],'照':['灬'],'熱':['灬'],'然':['灬'],'烹':['灬'],'煮':['灬'],'點':['灬'],
  // 日月光明相關
  '日':['日'],'旭':['日'],'昌':['日'],'明':['日','月','明'],'昕':['日'],'星':['日','星'],'春':['日'],'昭':['日'],'映':['日'],'晨':['日'],'景':['日'],'晶':['日'],'智':['日'],'暖':['日'],'曉':['日'],'曜':['日'],'曦':['日'],'旺':['日'],'晴':['日'],
  '月':['月'],'朋':['月'],'朗':['月'],'望':['月'],'朝':['月'],
  '光':['光'],'晃':['光','日'],
  // 田甫相關
  '田':['田'],'由':['田'],'甲':['田'],'申':['田','申'],'男':['田'],'界':['田'],'畫':['田'],'當':['田'],'疆':['田'],'留':['田'],'略':['田'],'畢':['田'],
  // 心忄月肉相關
  '心':['心'],'必':['心'],'志':['心','志'],'忠':['心'],'忻':['心'],'念':['心'],'思':['心'],'恩':['心'],'恭':['心'],'悅':['心'],'慈':['心'],'慧':['心'],'慶':['心'],'憲':['心'],'懷':['心'],'戀':['心'],'愛':['心'],'意':['心'],'感':['心'],'德':['心'],
  '忍':['心','刀'],'忙':['忄'],'快':['忄'],'怡':['忄'],'性':['忄'],'恆':['忄'],'悟':['忄'],'惠':['忄'],'情':['忄'],'惟':['忄'],'慎':['忄'],'憶':['忄'],
  // 肉（月旁在左為肉）
  '肯':['月','肉'],'胡':['月','肉'],'能':['月','肉'],'腰':['月','肉'],'臉':['月','肉'],
  // 地支相關字
  '子':['子'],'丑':['丑'],'寅':['寅'],'卯':['卯'],'辰':['辰'],'巳':['巳'],'午':['午'],'未':['未'],'酉':['酉'],'戌':['戌'],'亥':['亥'],
  // 其他常用字
  '文':['文'],'武':['武'],'成':['成'],'國':['口','王'],'民':['民'],'正':['正'],'平':['平'],
  '東':['木','東'],'西':['西'],'南':['南'],'北':['匕','北'],
  '中':['口','中'],'上':['上'],'下':['下'],
  '人':['人'],'入':['入'],'土':['土'],'士':['士'],'夕':['夕'],'夜':['夕','夜'],
  '龍':['龍'],'鳳':['鳥'],'馬':['馬'],'虎':['虎'],'犬':['犬'],'猴':['猴'],'雞':['雞','鳥'],'蛇':['蛇','巳'],'鼠':['鼠'],'兔':['兔'],'羊':['羊'],'豬':['豬','豕'],
  '穴':['穴'],'空':['穴'],'窗':['穴'],'窮':['穴'],'究':['穴'],
  '采':['采'],'釆':['采'],'番':['采'],
  '豕':['豕'],'象':['豕'],'豪':['豕'],
  '廣':['廣'],'庭':['廣'],'廉':['廣'],'應':['廣'],
  // 十二生肖直接字
  '鼠':['鼠','子'],'牛':['牛','丑'],'虎':['虎','寅'],'兔':['兔','卯'],
  '龍':['龍','辰'],'蛇':['蛇','巳'],'馬':['馬','午'],'羊':['羊','未'],
  '猴':['猴','申'],'雞':['雞','酉'],'狗':['狗','犬','戌'],'豬':['豬','豕','亥'],
  // ═══ 擴充：常用名字用字（500+） ═══
  // 含「羽」的字（羽=鳥/雞相關）
  '羽':['羽'],'翔':['羽'],'翊':['羽'],'翎':['羽'],'翠':['羽'],'翰':['羽'],'翼':['羽'],'翹':['羽'],'羿':['羽'],
  '飛':['飛'],
  // 含「函」「凡」「凌」等（冫/冖/凵）
  '函':['水','氵'],'凡':['几'],'凌':['冫','氵'],'冰':['冫','氵'],'冷':['冫','氵'],'凜':['冫','氵'],'凝':['冫','氵'],'准':['冫','氵'],'凍':['冫','氵'],'涼':['氵'],'淩':['氵'],
  // 含「宸」「辰」等
  '宸':['宀','辰'],'辰':['辰'],'晨':['日','辰'],'振':['辰'],
  // 含「彥」「顏」等
  '彥':['彡','文'],'顏':['彡','頁'],
  // 含「瑋」「瑄」等（王旁）
  '瑋':['王'],'瑄':['王'],'瑾':['王'],'璽':['王'],'琬':['王'],'琇':['王'],'琪':['王'],'琳':['王'],'瑩':['王'],'瑞':['王'],'瑜':['王'],'瑤':['王'],'珩':['王'],'珮':['王'],'琰':['王'],'瑗':['王'],'璟':['王'],'璇':['王'],'璿':['王'],'瓏':['王'],'玥':['王'],'珺':['王'],'瑆':['王'],'璐':['王'],'瑢':['王'],'琍':['王'],'璦':['王'],'琅':['王'],'珂':['王'],'琮':['王'],'璘':['王'],'瑒':['王'],'珈':['王'],'珧':['王'],'珣':['王'],'琯':['王'],'琸':['王'],'琤':['王'],'瑁':['王'],'瑀':['王'],'瑂':['王'],'瑝':['王'],
  // 含「恩」「惠」「慈」等（心/忄）
  '恩':['心'],'惠':['心'],'慈':['心'],'悅':['忄'],'愷':['心'],'憲':['心'],'懿':['心'],'怡':['忄'],'恬':['忄'],'恆':['忄'],'惟':['忄'],'愉':['忄'],'慎':['忄'],'憶':['忄'],'懷':['心'],'恕':['心'],'悠':['心'],'惇':['忄'],'慧':['心'],'懋':['心'],'愫':['心'],'懿':['心'],
  // 含「祐」「祥」等（示/礻）
  '祐':['礻'],'祥':['礻'],'祺':['礻'],'禎':['礻'],'禧':['礻'],'福':['礻'],'祿':['礻'],'神':['礻'],'祈':['礻'],'祝':['礻'],'祖':['礻'],'禪':['礻'],'禮':['礻'],
  // 含「軒」「輝」等（車）
  '軒':['車'],'輝':['車','光'],'輔':['車'],'轉':['車'],'軾':['車'],
  // 含「鈞」「銘」等（金/钅）
  '鈞':['金'],'銘':['金'],'鋒':['金'],'鑫':['金'],'鐘':['金'],'錦':['金'],'鍾':['金'],'鑰':['金'],'銓':['金'],'鎧':['金'],'鑠':['金'],'釗':['金'],'鈺':['金'],'鈿':['金'],'鉉':['金'],
  // 含「睿」「睦」等（目）
  '睿':['目'],'睦':['目'],'睛':['目'],'瞳':['目'],'瞻':['目'],'矚':['目'],'盼':['目'],'眉':['目'],'眸':['目'],'瞬':['目'],
  // 含「皓」「皎」等（白）
  '皓':['白','日'],'皎':['白'],'皙':['白'],
  // 含「語」「詩」等（言）
  '語':['言'],'詩':['言'],'諾':['言'],'誠':['言'],'謙':['言'],'詠':['言'],'諭':['言'],'詮':['言'],'誼':['言'],'諦':['言'],'謝':['言'],'論':['言'],'詹':['言'],'諳':['言'],'讓':['言'],
  // 含「豪」「家」等
  '豪':['豕'],'家':['宀','豕'],
  // 含「霖」「霈」「霓」等（雨）
  '霖':['雨','林','木'],'霈':['雨'],'霓':['雨'],'靖':['立'],'霏':['雨'],'霆':['雨'],'靈':['雨'],'霞':['雨'],'霜':['雨'],'露':['雨'],
  // 含「逸」「遙」等（辶）
  '逸':['辶','兔'],'遙':['辶'],'逍':['辶'],'遠':['辶'],'邁':['辶'],
  // 含「陽」「隆」等（阜/阝）
  '陽':['阝','日'],'隆':['阝'],'陵':['阝'],'陸':['阝'],'院':['阝'],'隱':['阝'],'階':['阝'],'陳':['阝'],
  // 含「雅」「雄」等（隹）
  '雅':['隹'],'雄':['隹'],'雋':['隹'],'集':['隹','木'],'雍':['隹'],'雯':['雨','文'],'雲':['雨'],
  // 含「韻」「音」等
  '韻':['音'],'韋':['韋'],'音':['音'],
  // 含「駿」「驊」等（馬）
  '駿':['馬'],'驊':['馬'],'騏':['馬'],'驍':['馬'],'驥':['馬'],'騰':['馬'],
  // 含「嘉」「喬」「善」等（口/吉）
  '嘉':['口'],'喬':['口'],'善':['口','羊'],'喜':['口'],'嘯':['口'],'嗣':['口'],
  // 含「鵬」「鴻」等（鳥）
  '鵬':['鳥'],'鴻':['鳥','氵'],'鳳':['鳥'],'鶴':['鳥'],'鷹':['鳥'],'鸞':['鳥'],
  // 含「哲」「啟」等
  '哲':['口'],'啟':['口'],'呈':['口'],'君':['口'],'吟':['口'],'周':['口'],
  // 含「俞」「愈」等
  '俞':['亻','月'],'愈':['心','月'],'瑜':['王','月'],
  // 含「亭」「亮」「京」（高/亠）
  '亭':['亠','口'],'亮':['亠','口'],'京':['亠','口'],'亦':['亠'],
  // 含「冠」（冖）
  '冠':['冖'],'軍':['冖','車'],
  // 含「仲」「俊」「傑」等（亻）
  '仲':['亻'],'俊':['亻'],'傑':['亻'],'偉':['亻'],'倫':['亻'],'儀':['亻'],'佩':['亻'],'佑':['亻'],'伶':['亻'],'侑':['亻'],'佰':['亻'],'佐':['亻'],'修':['亻'],'信':['亻'],'儒':['亻'],'優':['亻'],'億':['亻'],
  // 含「銀」「鑫」等已在金
  // 含「竹」「筠」等
  '竹':['竹'],'筠':['竹'],'笙':['竹'],'箏':['竹'],'簫':['竹'],'策':['竹'],'筱':['竹'],'篤':['竹'],
  // 含「虹」「蝶」等（虫）
  '虹':['虫'],'蝶':['虫'],'蜻':['虫'],'螢':['虫'],'蟬':['虫'],
  // 含「豐」「豔」等
  '豐':['豆','豐'],'豔':['豆'],
  // 含「堅」「城」「培」等（土）
  '堅':['土'],'城':['土'],'培':['土'],'基':['土'],'塘':['土'],'境':['土'],'墨':['土'],'壁':['土'],'壇':['土'],'坤':['土'],'堃':['土'],'堯':['土'],'垣':['土'],'均':['土'],'坊':['土'],'圻':['土'],'埸':['土'],'域':['土'],
  // 含「柏」「楷」等（已在木）
  // 含「尚」
  '尚':['口'],'堂':['土','口'],'當':['田','口'],
  // 含「頤」「碩」等
  '頤':['頁'],'碩':['石','頁'],'頌':['頁'],
  // 含「貝」
  '貞':['貝'],'財':['貝'],'賢':['貝'],'貴':['貝'],'賓':['貝'],'賜':['貝'],'資':['貝'],
  // 含「辛」
  '辛':['辛'],'辜':['辛'],'辟':['辛'],
  // 含「石」
  '石':['石'],'岩':['山','石'],'碧':['石','王'],'磊':['石'],'研':['石'],'確':['石'],
  // 含「立」
  '立':['立'],'端':['立'],'竣':['立'],'站':['立'],'章':['立'],'童':['立'],
  // 含「厂」「广」
  '廣':['广'],'庭':['广'],'廉':['广'],'廷':['廴'],'康':['广'],'庸':['广'],'庫':['广'],'序':['广'],'廈':['广'],'度':['广'],
  // 數字常用
  '一':['一'],'二':['二'],'三':['三'],'四':['口'],'五':['五'],'六':['六'],'七':['七'],'八':['八'],'九':['九'],'十':['十'],'百':['白'],'千':['千'],'萬':['艹'],
  // 顏色常用
  '白':['白'],'黑':['黑'],'赤':['赤'],'青':['青'],'黃':['黃','田'],'紅':['糸'],
  // 含「長」「永」「恆」
  '長':['長'],'永':['水'],'恆':['忄'],'恒':['忄'],
  // 含「少」「小」
  '少':['小'],'小':['小'],'尖':['小','大'],
  // 含「妍」「娟」「婷」等（女）
  '妍':['女'],'娟':['女'],'婷':['女'],'婉':['女'],'姍':['女'],'妮':['女'],'姿':['女'],'媛':['女'],'嫻':['女'],'妤':['女'],'姝':['女'],'娜':['女'],'婕':['女'],'媚':['女'],'嫣':['女'],'嬌':['女'],'姞':['女'],'姵':['女'],'婧':['女'],'嫦':['女'],'娉':['女'],'婓':['女'],'姮':['女'],
  // 含「豕」相關
  '豕':['豕'],'象':['豕'],'豪':['豕'],'豫':['豕'],'豹':['豕'],
  // 含「穴」相關
  '穴':['穴'],'空':['穴'],'窗':['穴'],'窮':['穴'],'究':['穴'],'穎':['禾','穴'],
  // 含「采」
  '采':['采'],'釆':['采'],'番':['采','田'],'彩':['彡','采'],'釋':['采'],

  // ═══ 補充：常見名字用字字根（高頻缺漏修補）═══
  // 攵/攴部
  '政':['正','攵'],'敏':['每','攵'],'敬':['苟','攵'],'教':['孝','攵'],'敦':['享','攵'],
  '效':['交','攵'],'敘':['余','攵'],'數':['米','攵'],'敵':['啇','攵'],'整':['正','攵','束'],
  '散':['月','攵'],'啟':['戶','口','攵'],'救':['求','攵'],'故':['古','攵'],
  // 文部
  '斌':['文','武'],'斐':['非','文'],'斑':['文','王'],
  // 方部
  '放':['方'],'旁':['方'],'旋':['方'],'族':['方','矢'],'旗':['方','其'],
  // 欠部
  '欣':['斤','欠'],'歡':['雚','欠'],'欽':['金','欠'],'款':['士','欠'],'歌':['哥','欠'],
  // 止部
  '正':['正','一','止'],'步':['止'],'歲':['止','戈'],'歷':['厂','止'],'此':['止'],
  '武':['止','戈'],
  // 戈部
  '戎':['戈'],'成':['戈'],'或':['口','戈'],'戰':['單','戈'],'我':['戈'],
  '威':['女','戈'],'戴':['異','戈'],'截':['隹','戈'],
  // 力部
  '功':['工','力'],'加':['口','力'],'助':['且','力'],'努':['女','又','力'],
  '勁':['巠','力'],'勇':['甬','力'],'動':['重','力'],'勤':['堇','力'],
  '勝':['月','力'],'勵':['厲','力'],'勢':['埶','力'],
  // 又/寸部
  '友':['又'],'及':['又'],'叔':['又'],'取':['耳','又'],'受':['又','爪'],
  '反':['又'],'發':['弓','又'],'對':['寸'],'封':['圭','寸'],'射':['身','寸'],
  '尊':['酋','寸'],'將':['爿','寸'],'導':['道','寸'],'尋':['寸'],
  // 宀/冖部（補充）
  '宇':['宀'],'宋':['宀','木'],'宗':['宀','示'],'宜':['宀'],'客':['宀','各'],
  '宣':['宀'],'宮':['宀'],'容':['宀','谷'],'家':['宀','豕'],'富':['宀','口','田'],
  '實':['宀'],'寧':['宀','心'],'寶':['宀','玉','貝'],'寬':['宀'],
  '密':['宀'],'察':['宀'],'寒':['宀'],'審':['宀'],'寫':['宀'],
  // 心/忄部（補充）
  '心':['心'],'必':['心'],'志':['心','士'],'忍':['心','刃'],'忠':['心','中'],
  '念':['心','今'],'怒':['心','女','又'],'思':['心','田'],'急':['心'],
  '恩':['心','大','口','因'],'悲':['心','非'],'惜':['心','昔'],'惟':['心','隹'],
  '愛':['心','爪','冖'],'慶':['心','广'],'憲':['心','目','宀'],
  // 口部（補充）
  '台':['口'],'史':['口'],'召':['口','刀'],'吉':['口','士'],'呈':['口','王'],
  '品':['口'],'哲':['口','折'],'員':['口','貝'],'商':['口'],
  '嘉':['口','加','豆'],'嘯':['口'],'器':['口','犬'],
  // 日部（補充）  
  '旭':['日','九'],'昇':['日','升'],'昌':['日'],'昕':['日','斤'],
  '昊':['日','天'],'昱':['日','立'],'晉':['日'],'晨':['日','辰'],
  '景':['日','京'],'暉':['日','軍'],'曜':['日','翟'],
  // 月部（補充）
  '朋':['月'],'朗':['月','良'],'望':['月','王','亡'],'朝':['月','十','日'],
  '期':['月','其'],
  // 木部（補充）
  '本':['木'],'朱':['木'],'杰':['木'],'松':['木','公'],'柏':['木','白'],
  '梓':['木','辛'],'棟':['木','東'],'楓':['木','風'],'樂':['木','白','幺'],
  '機':['木','幾'],'權':['木','雚'],
  // 水/氵部（補充）
  '永':['水'],'泉':['水','白'],'洋':['水','羊'],'津':['水','聿'],
  '浩':['水','告'],'涵':['水','函'],'淳':['水','享'],'清':['水','青'],
  '湘':['水','相'],'源':['水','原'],'溪':['水','奚'],'澤':['水','睪'],
  // 火/灬部（補充）
  '炎':['火'],'烈':['火','列'],'焜':['火','昆'],'煜':['火','昱'],
  '照':['火','日','刀'],'熙':['火','巳'],'燕':['火','口','北','廿'],
  // 土部（補充）
  '坤':['土','申'],'城':['土','成'],'培':['土','咅'],'堅':['土','臣'],
  '堯':['土','堯'],'基':['土','其'],'堂':['土','尚'],'塔':['土','荅'],
  '境':['土','竟'],'墨':['土','黑'],'壁':['土','辟'],
  // 金/釒部（補充）
  '鈺':['金'],'銘':['金','名'],'鋒':['金','丰'],'鑫':['金'],
  '鈞':['金','匀'],'鑠':['金'],
  // 糸/纟部（補充）
  '紘':['糸','厷'],'紫':['糸','此'],'絲':['糸'],'綺':['糸','奇'],
  '維':['糸','隹'],'緯':['糸','韋'],'緣':['糸','彖'],'縈':['糸','火'],
  // 車部
  '軒':['車','干'],'軍':['車','冖'],'輝':['車','光'],'輪':['車'],
  '轉':['車','專'],'載':['車','戈'],
  // 馬部
  '馳':['馬'],'駿':['馬','夋'],'騏':['馬','其'],'驊':['馬','華'],
  // 示/礻部（補充）
  '祖':['示'],'祐':['示','右'],'祥':['示','羊'],'福':['示','畐'],
  '禎':['示','貞'],'禮':['示','豊'],
  // 言/訁部（補充）
  '詩':['言','寺'],'語':['言','吾'],'諺':['言','彥'],'謙':['言','兼'],
  // 頁/首部
  '頤':['頁','臣'],'頂':['頁','丁'],'預':['頁','予'],'願':['頁','原'],
  // 其他常見
  '冠':['冖','寸','元'],'函':['冂','了','水'],'凱':['几','豈'],
  '克':['十','兄','克'],'兆':['儿'],'先':['儿'],'允':['儿','厶'],
  '其':['八','一','甘'],'典':['八','曲'],'冊':['冂'],'再':['一','冂'],
  '辰':['辰'],'辛':['辛','立','十']
};

// Unicode 部首推斷（fallback）

// ── Name analysis: Kangxi radicals + zodiac roots (lines 25677-26125) ──
// ═══ 康熙 214 部首 → 生肖字根映射 ═══
// ═══ 偏旁→字 完整映射表（4300+ 常用字，71 部首組） ═══
const RADICAL_DB=[{c:"仁仃仇仍仕他付代令以仙仗仞仟仡仫份仰仲件任仿伉伊伍伎伏伐休伙伯估伴伶伸伺似佃但位低住佐佑何佗佚佛作佞佩佬佯佰佳併來侃侈例侍供依侖侗侘侚侮侯侵便俁係促俄俊俎俐俑俗俚俞俟信修俯俱俳俸俺俾倆倉個倌倍倏們倒倔倖倘候倚倜借倡倦倫倭假偃偉偏偕偶偷偵偽傀傅傍傑傘備催傭傲傳傷傻傾僅僑僕僖僚價僧僭僮僵儀億儂儉儐儒儘儲儷儸儺",r:['人','亻']},{c:"汁汀汃汋汍汎汏汐汕汗汙汛汝汞江池汨汪汰汲汴決沁沂沃沅沈沉沌沐沒沓沖沙沛沫沮沱河沸油沺治沼沾況泄泅泉泊泌泓法泗泛泡波泣泥注泫泮泯泰泱洄洋洌洎洗洛洞津洧洩洪洮洲洵洶活洽派流浙浚浣浤浦浩浪浮浴海浸涉涊涎涓涔涕涮涯液涵涸涼淇淋淌淏淑淒淕淘淙淚淝淞淡淥淦淨淩淪淫淬淮深淳淵混淹添淼清渙渝渟渠渡渣渤渥溈温渲渴游湃湊湍湖湘湛湜湞湟湧湮湯源準溝溟溢溥溧溪溫溯溶溺滂滄滅滇滋滌滑滓滔滕滘滙滬滯滲滴滷滸滾滿漁漂漆漏漓漠漢漣漩漪漫漬漯漲漳漸漾潁潑潔潘潛潞潤潭潮澄澈澎澤澧澱激濃濕濘濛濟濤濫濬濮濱濺濾瀅瀉瀋瀑瀕瀘瀚瀛瀝瀟瀦瀧灌灑灘灝灣",r:['水','氵']},{c:"口古句另叨叩只叫召叭叮可台史右叶號司叻吁吃各吆合吉吊同名后吏吐向吒君吟吠否吧吩含吭吮吳吵吶吸吹吻吾呀呂呃呆呈告呎呢呤周咀呱呵呻呼命咖咦咧咨咩咪咫咬咯品咳咸哀哄哆哇哈哉員哥哦哨哩哭哮哲哺唁唄唇唉唐唑唧唬售唯唱唸商啃啄啊問啓啜啞啡啣啤啥啦啪啬啵喂善喃喇喉喊喋喘喚喜喝喧嗅嗆嗎嗑嗔嗚嗜嗡嗣嗤嗦嗨嗬嗯嗲嘀嘆嘈嘉嘍嘎嘔嘗嘛嘩嘮嘯嘲嘴嘶噁噎噓噗噙噠噢噤器噩噪噬噱噴噶噸嚀嚇嚎嚐嚕嚙嚨嚮嚴嚷嚼囂囉囊囑囔",r:['口']},{c:"宀它宅宇守安宋完宏宓宕宗官宙定宛宜客宣室宥宦宧宮宰宴家宸容宿寂寄寅密寇富寐寒寓寔察寡寢寤實寧審寫寬寮寰寱寶",r:['宀']},{c:"心必忌忍忖志忘忙忡快忱忻念忽忿怎怒怔怕怖思怡急性怨怪恃恆恍恐恕恙恢恣恤恥恨恩恪恫恬恭息恰悄悉悔悖悚悟悠患悲悶悸悻悼情惆惇惋惑惕惘惚惜惟惠惡惦惰惱惲惶惹愁愆愈愉愍愎意愕愚愛感愧愴愷慄慈態慌慎慕慘慚慟慣慧慨慫慮慰慳慵慶慷慾憂憊憋憎憐憑憔憚憤憧憨憩憫憬憲憶憾懂懇懈應懊懋懌懍懦懲懵懶懷懸懺懼懾戀",r:['心','忄']},{c:"木未末本札朮朱朵杆杉李杏材村杓杖杜杞束杯杰東杲杳杵杷松板枉析枋枕林枚果枝枯架枷柄柏某柑柒染柔柘柚柜柝柞柢查柩柬柮柯柱柳柴柵柿栓栖栗校栩株核根格栽桀桂桃桅桉案桌桎桐桑桓桔桕桶梁梅梆梏梓梗梢梧梨梭梯械梱梳梵梶棄棉棋棍棒棕棗棘棚棟棠棣棧森棲棵棻椅椎植椒椿楊楓楔楗楚楞楠楣楫業楷楹榆榔榕榛榜榨榭榮榱榴槁構槍槐槓槤槳樁樂樊樑標樓樞模樣樵樸樹樺橄橋橘機橡橫檀檄檎檐檔檜檢檬檳櫃櫓櫚櫛櫥櫸櫻權欄",r:['木']},{c:"水永氾汁汀江汝汗汙汛池汪沁沃沈沉沐沒沖沙沛河油治沼泉泊泌法泡波泣泥注泰洋洗洛洞津洪浙浩浪浮浴海涉涵淇淑淚清淵減渡港湖源準溪溫滅滑滿漁漂演漫潔潛潮澤濃瀑灌灣",r:['水','氵']},{c:"日旦旨早旬旭旱昂昃昆昇昉昊昌明昏昕星映春昧昨昭昱昶昻是時晃晉晏晒晗晚晝晞晟晤晦晨晰晳晴晶智暄暇暈暉暌暐暑暖暗暘暝暢暨暫暮暱暴曄曆曉曖曙曚曛曜曝曦曩曬曰曳曷書曹曼曾會朋朔朗朝期朦朧",r:['日']},{c:"月有朋服朔朗望朝期朦朧肉肋肌肖肘肚肛肝股肢肥肩肪肯育肴胃背胎胖胚胡胤胥胸能脂脅脈脊脖脣脩脫脯脹腆腈腋腎腐腔腕腥腦腫腰腳腸腹腺腿膀膂膈膊膏膚膛膜膝膠膨膩膳膺膽膾臀臂臆臉臍臟臠",r:['月','肉']},{c:"艾芊芋芍芎芙芝芡芥芬芭芮芯花芳芸芹芻芽苑苒苓苔苗苛苜苞苟苡苣苦苧苫英苳苹茁茂范茄茅茉茗茜茨茫茭茯茱茲茴茵茶茹荀荃荊荏草荒荔荖荷荸荻莊莉莎莒莓莖莘莛莞莠莢莧莩莪莫莽菁菅菇菊菌菏菓菜菠菡菩菪菱菲菴菸菽萃萄萊萌萍萎萬萱萸萼落葉葑著葛葡葦葩葫葬葭葳葵葷蒂蒐蒔蒙蒜蒞蒟蒡蒨蒲蒸蒺蒼蒿蓀蓁蓄蓉蓋蓑蓓蓬蓮蔑蔓蔔蔗蔚蔡蔣蔥蔬蔭蕃蕈蕉蕊蕙蕨蕩蕪蕭蕾薄薇薈薊薏薑薔薛薦薩薪薫薰藉藍藏藐藝藤藥藩藻蘆蘇蘊蘋蘑蘚蘭蘿董華虎",r:['艹']},{c:"女奴奶她好妁妃妄妊妍妒妓妖妙妝妞妣妤妥妨妮妯妲妳妹妻妾姆姊始姐姑姒姓委姚姜姝姞姣姥姦姨姪姬姮姵姶姻姿威娃娉娑娘娛娜娟娠娣娥娩娶婁婆婉婊婕婚婦婧婪婷婺媒媚媛媧媲媳媽嫁嫂嫉嫌嫖嫘嫚嫡嫣嫦嫩嫻嬈嬉嬌嬋嬖嬛嬤嬪嬰嬴嬸嬿孀孃",r:['女']},{c:"王玉玎玓玖玗玘玟玠玡玢玥玦玧玩玫玬環玲玳玷玹玻珀珂珅珈珉珊珍珏珒珖珙珞珠珣珥珧珩班珮珺珽琄琇琉琊琍琎琛琝琢琤琥琦琨琪琮琯琲琳琴琵琶琺琿瑁瑂瑄瑆瑋瑕瑗瑙瑚瑛瑜瑝瑞瑟瑠瑢瑤瑧瑩瑪瑭瑮瑯瑰瑱瑳瑶瑾璀璁璃璇璈璉璋璐璘璜璞璟璠璣璥璦璧璨璩璪璫璬璮璲璵璸璹璽璿瓊瓏瓔瓘瓚瓛理現",r:['王','玉']},{c:"系紀紂約紅紆紉紊紋納紐紓純紗紘紙級紛紜素紡索紫紮累細紳紹紺終組絃結絕給絡絢統絲絨經綁綏綑綜綠綢綣綬維綱網綴綸綺綻綽綾緊緋緒緘線緜緝緞締緣編緩緬緯練緻縈縊縛縝縞縣縫縮縱總績繁繃繆繇繋織繕繖繚繞繡繩繪繫繭繰繳繹繼繽纂纈纏纓纖纜",r:['糸']},{c:"言訂訃計訊訌討訐訓訕託記訛訝訟訣訥訪設許訴訶診註詆詈詉詐詒詔評詘詛詞詠詡詢詣試詩詫詬詭詮詰話該詳詹詼誅誇誌認誓誕誘語誠誡誣誤誥誦誨說誰課誹誼調諄談請諍諏諒論諗諜諞諠諡諢諧諫諭諮諱諳諶諷諸諺諻諼諾謀謁謂謄謇謊謎謐謔謗謙謚講謝謠謡謨謫謬謳謹謾譁證譊譎譏譖識譙譚譜譫譬譯議譴護譽讀讒讓讖讚讜",r:['言']},{c:"金釗釘針釣釦釧釩釵鈀鈉鈍鈎鈐鈔鈕鈞鈣鈦鈪鈴鈺鈿鉀鉅鉉鉋鉍鉑鉚鉛鉤鉦鉸銀銃銅銑銓銖銘銜銠銦銨銩銬銭銮銳銷鋁鋅鋇鋌鋏鋒鋤鋪鋰鋸鋼錄錐錘錚錛錠錢錦錨錫錮錯錳錶鍊鍋鍍鍔鍛鍥鍬鍰鍵鍺鍾鎂鎊鎔鎖鎗鎚鎛鎢鎧鎬鎮鎳鏃鏈鏊鏐鏑鏗鏘鏜鏝鏞鏡鏢鏤鏨鐃鐓鐔鐘鐙鐡鐫鐬鐮鐲鐳鐵鐶鐸鐺鐿鑄鑊鑌鑑鑒鑠鑣鑫鑰鑲鑷鑼鑽鑾鑿",r:['金']},{c:"辶迂迄迅迎近返迢迤迥迦迪迫迭述迴迷迸追退送逃逅逆逋逍透逐逑途逕逖逗這通逛逝速造逢連逮週進逵逶逸逹逼遂遇遊運遍過遏遐遑遒道達違遘遙遜遞遠遣遨適遭遮遵遷選遺遼避邀邁還邇邈邊邏",r:['辶']},{c:"田由甲申男甸町畋界畏畔留畜略畝番畢畦畫當畸畹畿疆疇",r:['田']},{c:"山屹岌岐岑岔岡岢岣岩岫岬岱岳岷峇峋峒峙峨峪峭峯峰峴峻崁崆崇崎崑崔崖崗崙崛崢崤崧崩嵇嵌嵐嵩嵬嵯嶄嶇嶋嶒嶔嶙嶝嶠嶢嶧嶮嶰嶴嶺嶼巍巒巔",r:['山']},{c:"火灰灸灼災炅炆炊炎炒炕炙炤炫炬炭炮炯炰炱炳炷炸烈烊烋烏烘烙烜烝烤烯烴烹烽焉焊焙焚焜焠焦焯焰焱然煉煊煌煎煒煕煖煗煙煜煞煤煥照煩煮煲煸熄熊熏熔熙熛熟熠熨熬熱熹熾燁燃燈燉燊燎營燒燔燕燙燜燠燥燦燧燬燭燮燴燹燻燼燿爆爍爐爛爨爪爬爭爯爲爵爸爹爺爻爽爿",r:['火','灬']},{c:"禾禿秀私秉秋科秒秕秘租秣秤秦秧秩移稀稅程稍稔稗稚稜稞稟稠種稱稻稼稽稿穀穂穆穌積穎穗穡穢穩穫穰穴",r:['禾']},{c:"米籽粉粒粕粗粘粟粢粥粧粱粲粳粵粹粽精粿糊糕糖糗糙糜糞糟糠糢糧糨糯糰糲糸",r:['米']},{c:"竹竺竿笄笆笈笊笏笑笙笛笞笠笥符笨笩第笭笮笱笳笵笸筅筆筇筊筋筌等筍筏筐筑筒答策筠筥筧筬筮筱筲筵筷箄箇箋箍箏箒箔箕算箝管箬箭箱箴箸節篁範篆篇篋篌篙篝篠篤篩篪篲篳篷篾簀簇簍簑簒簙簞簡簣簧簪簫簷簸簽簾簿籃籌籍籐籙籟籠籤籥籩籬籮籲",r:['竹']},{c:"衣表衫衩衰衲衷衹衽衾袁袂袈袋袍袒袖袗袞袤袪被袱裁裂裊裎裏裔裕裘裙補裝裟裡裨裳裴裸裹裼製褂複褊褐褒褓褔褚褟褥褪褫褰褲褶褸褻襁襄襌襖襝襟襠襤襦襪襬襯襲襴襾",r:['衣']},{c:"刀刁刃分切刈刊刎刑列初判別利刪到制刷刺刻剃則削前剋剌剎剔剖剛剝剩剪副割創剷剽剿劃劈劉劊劍劑劚力功加劣助努劫劬勁勃勇勉勐勒動勘務勛勝勞勢勤勦勰勳勵勸勻勾匀勿包匆匈匍匏匐匕化北匙匝匠匡匣匪匯匱匹匾",r:['刀','刂']},{c:"巾市布帆帋帑帔帕帖帗帘帙帚帛帝帟帢帥師席帳帶帷常帽幃幄幅幌幔幕幗幘幛幟幡幢幣幫幬幭干平年幷幸幹幻幼幽幾庁",r:['巾']},{c:"彡形彣彤彥彧彩彪彫彬彭彰影彲彳彷役彼往征待徇很徉徊律後徐徑徒得徘徙從御徧復循微徵德徹徽",r:['彡']},{c:"弓弔引弗弘弛弟弢弦弧弩弭弱張強弼彀彈彊彎",r:['弓']},{c:"門閂閃閉開閎閏閑閒間閔閘閡閣閤閥閨閩閫閬閭閱閲閹閻閼閽闆闇闈闊闋闌闍闐闑闓闔闕闖關闘闚闛闞闡闢",r:['門']},{c:"隹隻隼雀雁雄雅集雇雉雋雌雍雎雒雕雖雙雛雜雞離難",r:['隹']},{c:"雨雩雪雫雯雱雲零雷雹電需霄霆震霈霉霍霎霏霑霓霖霜霞霧霪霰露霸霹靂靄靈靖靚靛靜",r:['雨']},{c:"羽羿翁翅翊翌翎翏習翔翕翛翟翠翡翦翩翫翮翰翱翳翹翻翼耀",r:['羽']},{c:"豕豚象豢豨豪豬豫豸豹豺貂貉貊貌貍貓貔",r:['豕']},{c:"犬犯狀狂狄狎狐狒狗狙狠狡狩狸狹狻狼猙猛猜猝猥猩猴猶猷猾獄獅獎獗獠獨獰獲獵獷獸獺獻",r:['犬','犭']},{c:"馬馭馮馱馳馴馹駁駃駈駐駑駒駔駕駘駙駛駝駟駢駭駰駱駿騁騂騅騎騏騖騙騤騫騭騮騰騶騷騸驀驁驂驃驄驅驊驌驍驎驏驕驗驘驚驛驟驢驤驥驦驪驫",r:['馬']},{c:"鳥鳩鳳鳴鳶鴉鴕鴛鴝鴞鴟鴣鴦鴨鴻鴿鵑鵓鵜鵝鵠鵡鵪鵬鵯鵲鵺鶇鶉鶊鶖鶘鶚鶡鶩鶯鶴鶹鶺鶻鷂鷄鷓鷗鷙鷚鷥鷦鷯鷲鷸鷹鷺鸚鸛鸞鸝",r:['鳥']},{c:"龍龎龐龔龕龜",r:['龍']},{c:"虎虐虔處虛虜號虞虧虩虫虯虱虹虺蛀蛄蛆蛇蛉蛋蛎蛐蛑蛙蛛蛞蛟蛤蛭蛯蛹蛻蜀蜂蜃蜆蜈蜊蜍蜒蜓蜘蜚蜜蜞蜡蜢蜥蜩蜮蜱蜴蜷蜻蜾蝌蝎蝓蝕蝗蝙蝟蝠蝦蝨蝮蝰蝴蝶蝸蝻螂螃螄螈螉螋融螐螗螘螞螟螢螣螨螫螭螯螳螵螺螻蟀蟄蟆蟈蟋蟎蟑蟒蟜蟠蟬蟯蟲蟳蟹蟻蟾蠅蠍蠔蠕蠖蠛蠟蠡蠢蠣蠱蠶蠹蠻",r:['虎']},{c:"貝貞負財貢貧貨販貪貫責貯貰貲貳貴貶買貸費貼貽貿賀賁賂賃賄賅資賈賊賑賒賓賕賚賜賞賠賡賢賣賤賦質賫賬賭賰賴賵賺賻購賽贄贅贈贊贋贍贏贓贖贗贛",r:['貝']},{c:"石砂砌砍砒研砝砟砢砥砦砧砩砭砰砲砷砸砼硃硅硎硏硒硝硤硨硫硬硯硼碇碉碌碎碑碗碘碚碞碟碣碧碩碰碳碴碼碾磁磅磊磋磐磚磨磬磯磲磷磺礁礅礎礙礦礪礫礬礱",r:['石']},{c:"穴究空穹穿突窄窈窒窕窖窗窘窟窠窣窩窪窮窯窰窳窺窿竄竅竇竊竈",r:['穴']},{c:"邑邢那邦邪邯邱邲邳邵邸邽邾郁郅郇郊郎郗郛部郝郡郢郤郭都鄂鄉鄒鄔鄗鄘鄙鄞鄢鄧鄭鄰鄱鄴鄺阡阮阪阬阱防阻阿陀附陂陋陌降限陔陘陛陜陝陞陟院陣除陪陬陰陲陳陵陶陷陸隄隅隆隈隊隋隍階隔隕際障隧隨險隱隴隸隹",r:['阝']},{c:"目盯盲直盼盾相眇眈眉眊看眙眛眞真眠眥眦眨眩眭眯眴眶眷眸眺眼着睛睜睞睡睢督睥睦睨睪睫睬睹睽睾睿瞄瞅瞇瞋瞌瞎瞑瞞瞟瞠瞥瞧瞪瞬瞭瞰瞳瞻瞼瞿矇矍矓矗",r:['目']},{c:"酉酊酋酌配酎酐酒酗酡酢酣酥酩酪酬酮酯酲酳酴酵酷酸醃醇醉醋醍醐醒醜醞醢醣醪醫醬醮醯醱醴醵醺釀",r:['酉']},{c:"示社祀祁祂祇祈祉祊祋祐祓祕祖祗祚祛祜祝神祟祠祢祥票祧祭祺祼祿禁禂禄禊禍禎福禑禓禔禕禖禘禛禝禞禟禡禢禤禥禧禨禪禫禬禮禰禱禳禴禸禹禺禽禾",r:['礻']},{c:"白百皂的皆皇皈皋皎皓皖皙皚皛皜皝皞皮",r:['白']},{c:"立站竑竟章竣童竭端競竹",r:['立']},{c:"小少尖尚尞尢尤尨尪尬就尷尸尹尺尻尼尾局屁屆屈屉届屋屌屍屎屏屐屑展屠屢屣層履屬屯",r:['小','少']},{c:"大天太夫央失夷夸夾奄奇奈奉奎奏契奔奕奘套奚奠奢奧奪奮奰",r:['大']},{c:"子孑孔孕孖字存孛孜孝孟季孤孥孩孫孰孱孳孵學孺孻孼孽",r:['子']},{c:"牛牝牟牡牢牣牤牧物牲牴特牽犀犁犂犄犇犉犋犍犏犒犖犛犢犧犬",r:['牛']},{c:"食飢飯飲飴飼飽飾餃餅餉養餌餐餒餓餕餘餛餞餡館餮餵餾饅饈饉饊饋饌饑饒饕饗饞饢",r:['食']},{c:"魚魛魟魣魨魩魬魯魴魷魺鮀鮁鮃鮊鮋鮍鮎鮑鮒鮓鮗鮚鮜鮝鮞鮠鮡鮣鮦鮨鮪鮫鮭鮮鮰鮲鮳鯀鯁鯉鯊鯒鯔鯖鯗鯛鯝鯡鯤鯧鯨鯪鯰鯷鯽鰈鰉鰍鰓鰜鰟鰣鰥鰭鰱鰲鰳鰷鰹鰻鰼鰾鱅鱈鱉鱒鱔鱖鱗鱘鱚鱝鱟鱠鱣鱧鱨鱭鱮鱲鱷鱸鱺",r:['魚']},{c:"羊羌美羔羚羞羡羣群義羲羶羹羺羼羽",r:['羊']},{c:"豆豇豈豉豊豌豎豐豔豗",r:['豆']},{c:"采釉釋番悉",r:['采']},{c:"飛飜飝",r:['飛']},{c:"鼠鼡鼢鼩鼫鼬鼯鼱鼴鼷鼹鼻",r:['鼠']},{c:"麥麩麪麫麯麰麴麵麸",r:['麥']},{c:"黃黈黌黎黏",r:['黃','田']},{c:"冗冘冠冢冤冥冪冬冰冱冲冶冷冽凄凅准凇凈凊凋凌凍凜凝凞几凡凰凱凳凶凸凹",r:['冖']},{c:"廴廷建廻延廿",r:['廴']},{c:"广庁序庄底庇店庚府庠度座庫庭庵庶庸康庾廁廂廈廉廊廓廖廚廛廝廟廠廡廢廣廨廩廬廰廱廳",r:['广']},{c:"文斌斐斑斕斗料斛斜斝斞斟斡斤斥斧斫斬新斲斷斸",r:['文']},{c:"几凡凰凱凳凶凸凹",r:['几']},{c:"車軋軌軍軒軔軛軟軸軹軺軻軼軾較輅輈載輊輒輓輔輕輛輜輝輞輟輦輩輪輬輮輯輳輶輸輻輾輿轂轅轆轉轊轍轎轔轗轘轙轟轡轢轤",r:['車']},{c:"夕外多夜夢夥夠夤",r:['夕']},{c:"乙乞也乳乾亂事云互五井亙亞亟亡亢交亦亨享京亭亮亳亶亹",r:['乙']},{c:"匕化北匙匜匝匠匡匣匪匯匱匹匾",r:['匕']},{c:"力功加劣助努劫劬勁勃勇勉勐勒動勘務勛勝勞勢勤勦勰勳勵勸勻勾勿包匆匈匍匏匐",r:['力']},{c:"辰辱農辸辳",r:['辰']},{c:"斤斥斧斫斬斯新斲斷",r:['斤']}];

function guessRoots(ch){
  // 層 1: 精確預建表（最高優先）
  if(CHAR_ROOTS[ch]) return CHAR_ROOTS[ch];
  
  // 層 2: RADICAL_DB 完整偏旁映射（覆蓋 4300+ 常用字）
  for(let i=0; i<RADICAL_DB.length; i++){
    if(RADICAL_DB[i].c.includes(ch)) return RADICAL_DB[i].r;
  }
  
  // 層 3: 硬性結構拆解（絕不回傳空陣列）
  // 原則：拆解「陽邊（左/上）」與「陰邊（右/下）」
  // 使用 CJK Ideographic Description Sequences 或常見偏旁模式
  const roots = [];
  const code = ch.charCodeAt(0);
  
  // 常見偏旁 Unicode 範圍檢測（CJK Radicals Supplement + Kangxi Radicals）
  // 2F00-2FDF: 康熙部首, 2E80-2EFF: CJK部首補充
  
  // 嘗試用已知偏旁字形匹配
  const COMMON_LEFT = [
    {pattern:/[氵]/, roots:['氵','水']},
    {pattern:/[忄]/, roots:['忄','心']},
    {pattern:/[扌]/, roots:['扌','手']},
    {pattern:/[犭]/, roots:['犭','犬']},
    {pattern:/[礻]/, roots:['礻','示']},
    {pattern:/[衤]/, roots:['衤','衣']},
    {pattern:/[飠]/, roots:['飠','食']},
    {pattern:/[纟]/, roots:['纟','糸']},
    {pattern:/[钅]/, roots:['钅','金']},
  ];

  // 嘗試從字的視覺結構推測
  // 左右結構常見模式：取字的第一個筆畫區域
  const strCh = ch;
  
  // 策略A：檢查是否包含已知的子字形
  const SUB_CHARS = {
    '口':['口'],'日':['日'],'月':['月'],'木':['木'],'火':['火'],
    '水':['水'],'金':['金'],'土':['土'],'心':['心'],'田':['田'],
    '山':['山'],'石':['石'],'示':['示'],'禾':['禾'],'竹':['竹'],
    '米':['米'],'糸':['糸'],'言':['言'],'車':['車'],'馬':['馬'],
    '王':['王'],'玉':['玉'],'人':['人'],'大':['大'],'小':['小'],
    '女':['女'],'子':['子'],'手':['手'],'力':['力'],'刀':['刀'],
    '弓':['弓'],'戈':['戈'],'門':['門'],'宀':['宀'],'穴':['穴'],
    '艹':['艹'],'辶':['辶'],'阝':['阝'],'犬':['犬'],
  };
  
  // 策略B：用已知字的組合推測
  // 例：左右結構=左偏旁+右偏旁, 上下結構=上部+下部
  // 嘗試將字拆為兩部分
  const KNOWN_COMBOS = {
    // 左右結構
    '洋':['氵','羊'],'汪':['氵','王'],'池':['氵','也'],
    '怡':['忄','台'],'悟':['忄','吾'],'惟':['忄','隹'],
    '提':['扌','是'],'搏':['扌','尃'],'振':['扌','辰'],
    '琪':['王','其'],'瑤':['王','搖'],'珮':['王','佩'],
    '祈':['礻','斤'],'祺':['礻','其'],'福':['礻','畐'],
    // 上下結構
    '宇':['宀','于'],'安':['宀','女'],'室':['宀','至'],
    '芳':['艹','方'],'英':['艹','央'],'華':['艹','化'],
    '思':['田','心'],'意':['音','心'],'慧':['彗','心'],
    '景':['日','京'],'晨':['日','辰'],'暉':['日','軍'],
  };
  if(KNOWN_COMBOS[ch]) return KNOWN_COMBOS[ch];

  // 策略C：強制從 Unicode 碼位估算部首分類
  // CJK 統一漢字按部首排列，可粗略推測
  if(code >= 0x4E00 && code <= 0x9FFF){
    // 根據 Unicode 碼位分段推測部首（粗略但不留空白）
    const offset = code - 0x4E00;
    const totalRange = 0x9FFF - 0x4E00;
    // Unicode CJK 大致按部首筆畫排列
    // 前段偏向一~人~口~土等少畫部首
    // 後段偏向金~雨~風~馬~魚~鳥等多畫部首
    const ratio = offset / totalRange;
    if(ratio < 0.05) roots.push('一','丨');
    else if(ratio < 0.1) roots.push('人','亻');
    else if(ratio < 0.15) roots.push('刀','力');
    else if(ratio < 0.2) roots.push('口');
    else if(ratio < 0.25) roots.push('土');
    else if(ratio < 0.3) roots.push('大','女');
    else if(ratio < 0.35) roots.push('宀','小');
    else if(ratio < 0.4) roots.push('心','忄');
    else if(ratio < 0.45) roots.push('手','扌');
    else if(ratio < 0.5) roots.push('日','木');
    else if(ratio < 0.55) roots.push('水','氵');
    else if(ratio < 0.6) roots.push('火');
    else if(ratio < 0.65) roots.push('田','目');
    else if(ratio < 0.7) roots.push('禾','竹');
    else if(ratio < 0.75) roots.push('糸');
    else if(ratio < 0.8) roots.push('言');
    else if(ratio < 0.85) roots.push('車','金');
    else if(ratio < 0.9) roots.push('門','阝');
    else if(ratio < 0.95) roots.push('雨','馬');
    else roots.push('魚','鳥');
  }
  
  // 如果還是空的（非CJK字元），至少標記字本身
  if(roots.length === 0) roots.push(ch);
  
  return roots;
}

// ── 漢字結構拆解引擎（陽邊/陰邊）──
// 原則：嚴格拆解每個字的「陽邊（左/上）」與「陰邊（右/下）」
// 絕不回傳空結果，即使罕見字也必須硬性拆解
const CHAR_DECOMPOSE = {
  // ═══ 左右結構 ═══
  // 氵部
  '清':{ struct:'左右', yang:'氵(水4畫)', yin:'青(8畫)', roots:['氵','水','青'] },
  '浩':{ struct:'左右', yang:'氵(水4畫)', yin:'告(7畫)', roots:['氵','水','告','口'] },
  '洪':{ struct:'左右', yang:'氵(水4畫)', yin:'共(6畫)', roots:['氵','水','共'] },
  '涵':{ struct:'左右', yang:'氵(水4畫)', yin:'函(8畫)', roots:['氵','水','函'] },
  '淳':{ struct:'左右', yang:'氵(水4畫)', yin:'享(8畫)', roots:['氵','水','享'] },
  '渝':{ struct:'左右', yang:'氵(水4畫)', yin:'俞(9畫)', roots:['氵','水','俞','人'] },
  '源':{ struct:'左右', yang:'氵(水4畫)', yin:'原(10畫)', roots:['氵','水','原','厂','小'] },
  '澤':{ struct:'左右', yang:'氵(水4畫)', yin:'睪(13畫)', roots:['氵','水','睪'] },
  '沛':{ struct:'左右', yang:'氵(水4畫)', yin:'巿(4畫)', roots:['氵','水'] },
  '湘':{ struct:'左右', yang:'氵(水4畫)', yin:'相(9畫)', roots:['氵','水','相','木','目'] },
  '洋':{ struct:'左右', yang:'氵(水4畫)', yin:'羊(6畫)', roots:['氵','水','羊'] },
  '津':{ struct:'左右', yang:'氵(水4畫)', yin:'聿(6畫)', roots:['氵','水','聿'] },
  '淑':{ struct:'左右', yang:'氵(水4畫)', yin:'叔(8畫)', roots:['氵','水','叔','又'] },
  '潔':{ struct:'左右', yang:'氵(水4畫)', yin:'絜(12畫)', roots:['氵','水','絜','糸','刀'] },
  '潤':{ struct:'左右', yang:'氵(水4畫)', yin:'閏(12畫)', roots:['氵','水','閏','門','王'] },
  '淇':{ struct:'左右', yang:'氵(水4畫)', yin:'其(8畫)', roots:['氵','水','其'] },
  '泉':{ struct:'獨體/上下', yang:'白(5畫)', yin:'水(4畫)', roots:['白','水'] },
  // 忄部
  '怡':{ struct:'左右', yang:'忄(心4畫)', yin:'台(5畫)', roots:['忄','心','台','口'] },
  '恆':{ struct:'左右', yang:'忄(心4畫)', yin:'亘(6畫)', roots:['忄','心','亘','日'] },
  '悅':{ struct:'左右', yang:'忄(心4畫)', yin:'兌(7畫)', roots:['忄','心','兌','口'] },
  '惠':{ struct:'上下', yang:'叀(7畫)', yin:'心(4畫)', roots:['心','叀'] },
  '慧':{ struct:'上下', yang:'彗(11畫)', yin:'心(4畫)', roots:['心','彗'] },
  // 扌部
  '振':{ struct:'左右', yang:'扌(手4畫)', yin:'辰(7畫)', roots:['扌','手','辰'] },
  '揚':{ struct:'左右', yang:'扌(手4畫)', yin:'昜(9畫)', roots:['扌','手','昜','日'] },
  '捷':{ struct:'左右', yang:'扌(手4畫)', yin:'疌(9畫)', roots:['扌','手'] },
  // 阝左(阜8畫)
  '陳':{ struct:'左右', yang:'阝(阜8畫)', yin:'東(8畫)', roots:['阝','阜','東','木','日'] },
  '陽':{ struct:'左右', yang:'阝(阜8畫)', yin:'昜(9畫)', roots:['阝','阜','昜','日'] },
  '陸':{ struct:'左右', yang:'阝(阜8畫)', yin:'坴(8畫)', roots:['阝','阜','坴','土'] },
  '陶':{ struct:'左右', yang:'阝(阜8畫)', yin:'匋(8畫)', roots:['阝','阜','匋','缶'] },
  '阮':{ struct:'左右', yang:'阝(阜8畫)', yin:'元(4畫)', roots:['阝','阜','元'] },
  // 阝右(邑7畫)
  '鄭':{ struct:'左右', yang:'奠(12畫)', yin:'阝(邑7畫)', roots:['奠','阝','邑','酋','大'] },
  '郭':{ struct:'左右', yang:'享(8畫)', yin:'阝(邑7畫)', roots:['享','阝','邑'] },
  '邱':{ struct:'左右', yang:'丘(5畫)', yin:'阝(邑7畫)', roots:['丘','阝','邑'] },
  '邵':{ struct:'左右', yang:'召(5畫)', yin:'阝(邑7畫)', roots:['召','阝','邑','口','刀'] },
  '郁':{ struct:'左右', yang:'有(6畫)', yin:'阝(邑7畫)', roots:['有','阝','邑','月'] },
  // 王(玉5畫)旁
  '玲':{ struct:'左右', yang:'王(玉5畫)', yin:'令(5畫)', roots:['王','玉','令'] },
  '琪':{ struct:'左右', yang:'王(玉5畫)', yin:'其(8畫)', roots:['王','玉','其'] },
  '瑜':{ struct:'左右', yang:'王(玉5畫)', yin:'俞(9畫)', roots:['王','玉','俞'] },
  '瑞':{ struct:'左右', yang:'王(玉5畫)', yin:'耑(9畫)', roots:['王','玉','耑','山'] },
  '琳':{ struct:'左右', yang:'王(玉5畫)', yin:'林(8畫)', roots:['王','玉','林','木'] },
  '瑤':{ struct:'左右', yang:'王(玉5畫)', yin:'搖省(10畫)', roots:['王','玉','缶'] },
  '瑋':{ struct:'左右', yang:'王(玉5畫)', yin:'韋(9畫)', roots:['王','玉','韋'] },
  '珮':{ struct:'左右', yang:'王(玉5畫)', yin:'佩省(6畫)', roots:['王','玉','巾'] },
  '瑄':{ struct:'左右', yang:'王(玉5畫)', yin:'宣(9畫)', roots:['王','玉','宣','宀'] },
  '璟':{ struct:'左右', yang:'王(玉5畫)', yin:'景(12畫)', roots:['王','玉','景','日','京'] },
  // 礻部(示5畫)
  '祈':{ struct:'左右', yang:'礻(示5畫)', yin:'斤(4畫)', roots:['礻','示','斤'] },
  '祐':{ struct:'左右', yang:'礻(示5畫)', yin:'右(5畫)', roots:['礻','示','右','口'] },
  '祥':{ struct:'左右', yang:'礻(示5畫)', yin:'羊(6畫)', roots:['礻','示','羊'] },
  '福':{ struct:'左右', yang:'礻(示5畫)', yin:'畐(9畫)', roots:['礻','示','畐','口','田'] },
  '禮':{ struct:'左右', yang:'礻(示5畫)', yin:'豊(13畫)', roots:['礻','示','豊','豆'] },
  // 衤部(衣6畫)
  '裕':{ struct:'左右', yang:'衤(衣6畫)', yin:'谷(7畫)', roots:['衤','衣','谷','口'] },
  '褚':{ struct:'左右', yang:'衤(衣6畫)', yin:'者(9畫)', roots:['衤','衣','者','日'] },
  // 犭部(犬4畫)
  '狄':{ struct:'左右', yang:'犭(犬4畫)', yin:'火(4畫)', roots:['犭','犬','火'] },
  // 攵部
  '政':{ struct:'左右', yang:'正(5畫)', yin:'攵(攴4畫)', roots:['正','攵','攴','一','止'] },
  '敏':{ struct:'左右', yang:'每(7畫)', yin:'攵(攴4畫)', roots:['每','攵','攴','母'] },
  '敬':{ struct:'左右', yang:'苟(8畫)', yin:'攵(攴4畫)', roots:['苟','攵','攴','艹'] },
  '教':{ struct:'左右', yang:'孝(7畫)', yin:'攵(攴4畫)', roots:['孝','攵','攴','子'] },
  // 木部
  '林':{ struct:'左右', yang:'木(4畫)', yin:'木(4畫)', roots:['木','林'] },
  '柏':{ struct:'左右', yang:'木(4畫)', yin:'白(5畫)', roots:['木','白'] },
  '楓':{ struct:'左右', yang:'木(4畫)', yin:'風(9畫)', roots:['木','風'] },
  '梓':{ struct:'左右', yang:'木(4畫)', yin:'辛(7畫)', roots:['木','辛'] },
  '棟':{ struct:'左右', yang:'木(4畫)', yin:'東(8畫)', roots:['木','東','日'] },
  '楠':{ struct:'左右', yang:'木(4畫)', yin:'南(9畫)', roots:['木','南'] },
  // 車部
  '軒':{ struct:'左右', yang:'車(7畫)', yin:'干(3畫)', roots:['車','干'] },
  '輝':{ struct:'左右', yang:'光(6畫)', yin:'車(7畫)省', roots:['光','車','軍'] },
  // 金部
  '銘':{ struct:'左右', yang:'釒(金8畫)', yin:'名(6畫)', roots:['金','名','口','夕'] },
  '鋒':{ struct:'左右', yang:'釒(金8畫)', yin:'丰(4畫)', roots:['金','丰'] },
  '鈺':{ struct:'左右', yang:'釒(金8畫)', yin:'玉(5畫)', roots:['金','玉'] },
  // 言部
  '詩':{ struct:'左右', yang:'言(7畫)', yin:'寺(6畫)', roots:['言','寺','土','寸'] },
  '謙':{ struct:'左右', yang:'言(7畫)', yin:'兼(10畫)', roots:['言','兼'] },
  // 糸部
  '維':{ struct:'左右', yang:'糸(6畫)', yin:'隹(8畫)', roots:['糸','隹'] },
  '綺':{ struct:'左右', yang:'糸(6畫)', yin:'奇(8畫)', roots:['糸','奇','大'] },
  // ═══ 上下結構 ═══
  // 艹部(艸6畫)
  '芳':{ struct:'上下', yang:'艹(艸6畫)', yin:'方(4畫)', roots:['艹','艸','方'] },
  '英':{ struct:'上下', yang:'艹(艸6畫)', yin:'央(5畫)', roots:['艹','艸','央','大'] },
  '華':{ struct:'上下', yang:'艹(艸6畫)', yin:'化(4畫)', roots:['艹','艸','化'] },
  '萱':{ struct:'上下', yang:'艹(艸6畫)', yin:'宣(9畫)', roots:['艹','艸','宣','宀'] },
  '蕙':{ struct:'上下', yang:'艹(艸6畫)', yin:'惠(12畫)', roots:['艹','艸','惠','心'] },
  '菲':{ struct:'上下', yang:'艹(艸6畫)', yin:'非(8畫)', roots:['艹','艸','非'] },
  '蓮':{ struct:'上下', yang:'艹(艸6畫)', yin:'連(11畫)', roots:['艹','艸','連','辶','車'] },
  // 宀部
  '宇':{ struct:'上下', yang:'宀(3畫)', yin:'于(3畫)', roots:['宀','于'] },
  '安':{ struct:'上下', yang:'宀(3畫)', yin:'女(3畫)', roots:['宀','女'] },
  '宸':{ struct:'上下', yang:'宀(3畫)', yin:'辰(7畫)', roots:['宀','辰'] },
  '家':{ struct:'上下', yang:'宀(3畫)', yin:'豕(7畫)', roots:['宀','豕'] },
  '富':{ struct:'上下', yang:'宀(3畫)', yin:'畐(9畫)', roots:['宀','畐','口','田'] },
  '寶':{ struct:'上下', yang:'宀(3畫)', yin:'玉+貝+缶', roots:['宀','玉','貝','缶'] },
  // 日部
  '景':{ struct:'上下', yang:'日(4畫)', yin:'京(8畫)', roots:['日','京','口','小'] },
  '晨':{ struct:'上下', yang:'日(4畫)', yin:'辰(7畫)', roots:['日','辰'] },
  '昕':{ struct:'左右', yang:'日(4畫)', yin:'斤(4畫)', roots:['日','斤'] },
  '昊':{ struct:'上下', yang:'日(4畫)', yin:'天(4畫)', roots:['日','天','大'] },
  '晟':{ struct:'上下', yang:'日(4畫)', yin:'成(7畫)', roots:['日','成','戈'] },
  '明':{ struct:'左右', yang:'日(4畫)', yin:'月(4畫)', roots:['日','月','明'] },
  // 心/思/意系
  '思':{ struct:'上下', yang:'田(5畫)', yin:'心(4畫)', roots:['田','心'] },
  '志':{ struct:'上下', yang:'士(3畫)', yin:'心(4畫)', roots:['士','心'] },
  '忠':{ struct:'上下', yang:'中(4畫)', yin:'心(4畫)', roots:['中','心'] },
  '愛':{ struct:'上中下', yang:'爪+冖', yin:'心+友', roots:['爪','冖','心','友','又'] },
  // 其他
  '弘':{ struct:'左右', yang:'弓(3畫)', yin:'厶(2畫)', roots:['弓','厶'] },
  '建':{ struct:'半包', yang:'聿(6畫)', yin:'廴(3畫)', roots:['聿','廴'] },
  '強':{ struct:'左右', yang:'弓(3畫)', yin:'厶+虫', roots:['弓','厶','虫'] },
  '張':{ struct:'左右', yang:'弓(3畫)', yin:'長(8畫)', roots:['弓','長'] },
  '功':{ struct:'左右', yang:'工(3畫)', yin:'力(2畫)', roots:['工','力'] },
  '武':{ struct:'半包', yang:'一+弋', yin:'止(4畫)', roots:['一','弋','止','戈'] },
  '成':{ struct:'獨體', yang:'戊省', yin:'—', roots:['戈','丁'] },
  '嘉':{ struct:'上下', yang:'壴(8畫)', yin:'加(5畫)', roots:['壴','加','口','力'] },
  '翔':{ struct:'左右', yang:'羊(6畫)', yin:'羽(6畫)', roots:['羊','羽'] },
  '翰':{ struct:'左右', yang:'倝(10畫)', yin:'羽(6畫)', roots:['倝','羽','日'] },
  '翊':{ struct:'左右', yang:'立(5畫)', yin:'羽(6畫)', roots:['立','羽'] },
  '俊':{ struct:'左右', yang:'亻(人2畫)', yin:'夋(7畫)', roots:['亻','人','夋'] },
  '傑':{ struct:'上下', yang:'亻(人2畫)省', yin:'桀', roots:['人','木','舛'] },
  '偉':{ struct:'左右', yang:'亻(人2畫)', yin:'韋(9畫)', roots:['亻','人','韋'] },
  '宏':{ struct:'上下', yang:'宀(3畫)', yin:'厷(4畫)', roots:['宀','厷','弓'] },
  '雅':{ struct:'左右', yang:'牙(4畫)', yin:'隹(8畫)', roots:['牙','隹'] },
  '靜':{ struct:'左右', yang:'青(8畫)', yin:'爭(8畫)', roots:['青','爭'] },
  '秀':{ struct:'上下', yang:'禾(5畫)', yin:'乃(2畫)', roots:['禾','乃'] },
  '婷':{ struct:'左右', yang:'女(3畫)', yin:'亭(9畫)', roots:['女','亭','口','丁'] },
  '麗':{ struct:'上下', yang:'鹿省', yin:'丽', roots:['鹿'] },
  '奕':{ struct:'上下', yang:'亦(6畫)', yin:'大(3畫)', roots:['亦','大'] },
  '勇':{ struct:'上下', yang:'甬(7畫)', yin:'力(2畫)', roots:['甬','力','用'] },
  '豪':{ struct:'上下', yang:'高省', yin:'豕(7畫)', roots:['高','豕'] },
  '龍':{ struct:'獨體', yang:'立+月', yin:'—', roots:['立','月','龍'] },
  '鳳':{ struct:'半包', yang:'几', yin:'鳥省', roots:['几','鳥'] },
  '飛':{ struct:'獨體', yang:'—', yin:'—', roots:['飛'] },
  '凱':{ struct:'左右', yang:'豈(10畫)', yin:'几(2畫)', roots:['豈','几','山','己'] },
  '冠':{ struct:'上下', yang:'冖(2畫)', yin:'元+寸', roots:['冖','元','寸'] },
  '駿':{ struct:'左右', yang:'馬(10畫)', yin:'夋(7畫)', roots:['馬','夋'] },
  '皓':{ struct:'左右', yang:'白(5畫)', yin:'告(7畫)', roots:['白','告','口'] },
  '睿':{ struct:'上下', yang:'目(5畫)', yin:'叡省', roots:['目','谷'] },
  '穎':{ struct:'上下', yang:'禾(5畫)+頃', yin:'匕', roots:['禾','匕','頁'] },
};

// 通用結構拆解函數（用於 CHAR_DECOMPOSE 表外的字，強制硬性拆解）
function decomposeChar(ch){
  // 優先查精確拆解表
  if(CHAR_DECOMPOSE[ch]) return CHAR_DECOMPOSE[ch];
  
  // 從 guessRoots 取字根，組裝結構描述
  const roots = guessRoots(ch);
  if(roots.length >= 2){
    return { struct:'推測', yang:roots[0], yin:roots.slice(1).join('+'), roots:roots };
  } else if(roots.length === 1){
    return { struct:'獨體', yang:roots[0], yin:'—', roots:roots };
  }
  // 絕不回傳空（guessRoots 已保證不回傳空陣列）
  return { struct:'獨體', yang:ch, yin:'—', roots:[ch] };
}
function analyzeZodiacName(fullName, birthYear, options){
  if(!fullName || !birthYear) return null;
  options=options||{};
  const nameFacts=analyzeName(fullName,options);if(!nameFacts)return null;
  var yearBasis='僅提供公曆年份，年界尚未核對';
  if(options.date){var rawDate=String(options.date),parts=rawDate.split('-').map(Number);if(!/^\d{4}-\d{2}-\d{2}$/.test(rawDate)||parts.length!==3||parts.some(x=>!Number.isInteger(x)))return null;var civilDate=new Date(Date.UTC(parts[0],parts[1]-1,parts[2]));if(civilDate.getUTCFullYear()!==parts[0]||civilDate.getUTCMonth()+1!==parts[1]||civilDate.getUTCDate()!==parts[2])return null;birthYear=approxLunar(parts[0],parts[1],parts[2]).year;yearBasis='農曆正月初一換生肖年；與八字立春年界分開';}
  const zodiac = getChineseZodiac(birthYear),db=ZODIAC_NAME_DB[zodiac];
  if(!db)return null;
  fullName=nameFacts.name;
  const chars=[...fullName],positions=[{char:nameFacts.surname,label:'姓氏',lifeStage:'姓氏字義參考'}];
  [...nameFacts.given].forEach(function(ch,i){positions.push({char:ch,label:'名字第'+(i+1)+'字',lifeStage:'名字字義參考；不由字位指定年齡事件'});});

  // 逐字拆解＋比對
  const results = [];
  let totalScore = 0;
  let totalLike = 0;
  let totalDislike = 0;

  positions.forEach(pos => {
    const charList = [...pos.char]; // 處理複姓
    const charResults = [];

    charList.forEach(ch => {
      const decomp = decomposeChar(ch);
      const roots = decomp.roots.length ? decomp.roots : (CHAR_ROOTS[ch] || guessRoots(ch));
      const hits = [];

      // 比對喜用
      db.like.forEach(rule => {
        const matched = rule.roots.filter(r => roots.includes(r));
        if(matched.length > 0){
          hits.push({type:'吉', label:rule.label, reason:'字根'+matched.join('、')+'在生肖形義派列作「'+rule.label+'」的合拍取象；須合看名字字義，不能據此推斷現實結果。', score:rule.score, matchedRoots:matched});
          totalScore += rule.score;
          totalLike++;
        }
      });

      // 比對忌用
      db.dislike.forEach(rule => {
        const matched = rule.roots.filter(r => roots.includes(r));
        if(matched.length > 0){
          hits.push({type:'凶', label:rule.label, reason:'字根'+matched.join('、')+'在生肖形義派列作「'+rule.label+'」的提醒取象；不能據此推斷事故、疾病或人際事件。', score:rule.score, matchedRoots:matched});
          totalScore += rule.score; // score 本身是負數
          totalDislike++;
        }
      });

      charResults.push({char:ch, roots, hits, decomp});
    });

    results.push({...pos, charResults});
  });

  // 犧牲格特殊判定
  let isSacrifice = false;
  let sacrificeNote = '';
  if(['豬','牛','羊'].includes(zodiac)){
    const allHits = results.flatMap(r=>r.charResults.flatMap(c=>c.hits));
    // 資料表實際使用太大／稱王／披衣／祭祀；舊標籤「犧牲格」並不存在，故原分支永不命中。
    const hasSacrifice = allHits.some(h=>h.type==='凶'&&['太大','稱王','披衣','祭祀'].includes(h.label));
    if(hasSacrifice){
      isSacrifice = true;
      sacrificeNote = `${ZODIAC_EMOJI[zodiac]}${zodiac}在這套形義派有「犧牲格」字根的取象；這是民俗分類，不能從名字推定本人內心、處境或是否為他人犧牲。`;
    }
  }

  // 蛇豬衝特殊判定
  let isSnakePigClash = false;
  let clashNote = '';
  if(zodiac==='豬'){
    const allHits = results.flatMap(r=>r.charResults.flatMap(c=>c.hits));
    const hasClash = allHits.some(h=>h.type==='凶'&&['蛇形','六衝'].includes(h.label));
    if(hasClash){
      isSnakePigClash = true;
      const clashChars = results.flatMap(r=>r.charResults.filter(c=>c.hits.some(h=>h.type==='凶'&&['蛇形','六衝'].includes(h.label)))).map(c=>c.char);
      clashNote = `「${clashChars.join('、')}」在此派列為蛇形字根（辶/弓/几/廴），以亥巳相沖作象徵提醒；不能據此預測小人、受傷或財務損失。`;
    }
  }

  // 凶優先原則：有凶字根時壓過吉字根
  let overallLevel;
  if(totalDislike > 0 && totalLike > 0){
    overallLevel = '形義派字根夾雜';
  } else if(totalDislike === 0 && totalLike > 0){
    overallLevel = '形義派字根偏合';
  } else if(totalDislike > 0 && totalLike === 0){
    overallLevel = '形義派字根有疑慮';
  } else {
    overallLevel = '形義派未見明顯字根';
  }

  // 犧牲格強制判定
  if(isSacrifice) overallLevel = '形義派犧牲字根候選';

  // 字根形義與八字五行是兩套不同的分析資料；不可按標籤猜五行、覆寫喜忌。
  const baziOverride=false;
  const baziOverrideNote='生肖姓名字根不可覆寫八字取用或調候；兩者若衝突，須各自呈現其依據。';
  const warnings = [];
  if(isSacrifice) warnings.push('此名在形義派有犧牲字根：可作界線與互惠的自我提醒，不能證明本人處境。');
  if(isSnakePigClash) warnings.push('蛇豬衝屬形義取象：一般生活安全仍依實際情況留意，不由字根推定事故。');
  const allDislikeHits = results.flatMap(r=>r.charResults.flatMap(c=>c.hits.filter(h=>h.type==='凶')));
  if(allDislikeHits.some(h=>h.label==='遇刀')) warnings.push('「遇刀」屬傳統字根象徵，不能用來推斷手術或外傷。');
  if(allDislikeHits.some(h=>h.label==='遇人被宰'||h.label==='遇人')) warnings.push('「遇人」屬傳統字根象徵，不能用來推斷人際待遇。');
  if(allDislikeHits.some(h=>h.label.includes('六衝'))) warnings.push('「六衝」屬生肖字根分類，不能用來預測衝突。');

  // 計算 0-100 分
  let numericScore = 50 + totalScore * 2;
  numericScore = Math.max(5, Math.min(95, numericScore));
  
  return {
    name: fullName,
    zodiac,yearBasis,
    splitPolicy:nameFacts.inputPolicy.split,
    emoji: ZODIAC_EMOJI[zodiac],
    dizhi: ZODIAC_DIZHI[zodiac],
    positions: results,
    totalScore,
    totalLike,
    totalDislike,
    overallLevel,
    numericScore,
    scorePolicy:'生肖形義派自訂的字根權重，僅供辨識此派分類；不是事件機率、健康風險、財務評分或跨系統整合分。',
    isSacrifice,
    sacrificeNote,
    isSnakePigClash,
    clashNote,
    warnings,
    baziOverride,
    baziOverrideNote
  };
}


// ── Crystal WuXing + TianTie + crystal render (lines 26126-26342) ──
/* 色彩／材質設計參考。五行在此只是傳統色彩取象，不是礦物成分、療效或命盤禁忌。
   照護參考：GIA amethyst/tourmaline/moonstone care；隕鐵與鎳：NHM、AAD。 */
const CRYSTAL_DB={
  金:[
    {n:'天鐵（鎳鐵隕石）',icon:'☄️',el:'金',d:'若實物經確認是鐵隕石，主要由鐵鎳合金構成，銀灰色外觀可作金色系設計參考。',wear:'先核對來源、成分與金屬配件；鎳過敏者避免鎳直接接觸皮膚。',tier:'special'},
    {n:'白水晶',icon:'💍',el:'金',d:'透明石英適合留白、俐落的飾品風格。',wear:'依喜歡的觸感與日常活動選尺寸。'},
    {n:'白幽靈',icon:'💠',el:'金',d:'白色包裹物帶來層次感，適合偏好清淡配色的人。',wear:'購買時核對實物外觀與處理資訊。'},
    {n:'銀鈦晶',icon:'⚡',el:'金',d:'金屬色絲狀內含物有鮮明的視覺效果。',wear:'核對商品標示與實物內含物。'},
    {n:'月光石',icon:'🌙',el:'金',d:'長石類的光暈適合柔和的銀白設計。',wear:'避免碰撞，選擇能保護石面的鑲嵌。'},
    {n:'純銀飾品',icon:'🔗',el:'金',d:'銀色金屬可和現有飾品搭配。',wear:'核對純度及接觸皮膚的所有配件材質。'}
  ],
  木:[
    {n:'綠幽靈',icon:'💚',el:'木',d:'綠色包裹物讓透明石英呈現植物般的層次。',wear:'依自己的配色與佩戴情境選款。'},
    {n:'翡翠',icon:'💎',el:'木',d:'綠色硬玉適合喜愛溫潤色澤的設計。',wear:'核對處理、鑲嵌與來源。'},
    {n:'綠碧璽',icon:'💚',el:'木',d:'綠色電氣石可作清新色系的設計。',wear:'避免碰撞，留意鑲嵌是否保護石面。'},
    {n:'東菱玉',icon:'🌿',el:'木',d:'帶微光的綠色石材適合自然風格。',wear:'按實物處理資訊選保養方式。'},
    {n:'橄欖石',icon:'🌱',el:'木',d:'黃綠色光澤適合輕巧的日常飾品。',wear:'避免硬物碰撞。'},
    {n:'綠檀木',icon:'🌳',el:'木',d:'木質紋理適合偏好輕量觸感的人。',wear:'先確認木材和塗層，避免長時間浸水。'},
    {n:'沉香',icon:'🪵',el:'木',d:'木材紋理與氣味可作傳統文化興趣的選項。',wear:'核對來源與個人對氣味的接受度。'},
    {n:'捷克隕石',icon:'☄️',el:'木',d:'綠色天然玻璃適合偏好特殊紋理的人。',wear:'核對實物來源與真偽，避免碰撞。'}
  ],
  水:[
    {n:'黑曜石',icon:'🖤',el:'水',d:'深黑色天然玻璃適合簡潔配色。',wear:'避免撞擊及銳利邊緣。'},
    {n:'拉長石',icon:'🔮',el:'水',d:'轉動時可見變彩，適合喜愛幽藍光澤的人。',wear:'避免碰撞。'},
    {n:'海藍寶',icon:'💙',el:'水',d:'淺藍色綠柱石適合柔和的海洋色系。',wear:'核對顏色、處理與鑲嵌。'},
    {n:'藍紋瑪瑙',icon:'🌊',el:'水',d:'藍色紋理適合偏好細節的設計。',wear:'留意實物是否染色或經處理。'},
    {n:'黑髮晶',icon:'🕸️',el:'水',d:'黑色絲狀內含物可增加飾品層次。',wear:'依實際色澤與佩戴舒適度挑選。'}
  ],
  火:[
    {n:'紅石榴石',icon:'🔴',el:'火',d:'深紅色可作暖色系設計主石。',wear:'核對鑲嵌和日常活動所需的耐用性。'},
    {n:'紅紋石',icon:'💗',el:'火',d:'粉紅色條紋適合細緻的設計。',wear:'避免碰撞與酸性清潔品。'},
    {n:'太陽石',icon:'☀️',el:'火',d:'閃光內含物能形成暖色調效果。',wear:'觀察實物的光澤與鑲嵌。'},
    {n:'草莓晶',icon:'🍓',el:'火',d:'粉紅色內含物讓透明石英更有層次。',wear:'挑選個人喜歡的色澤與尺寸。'},
    {n:'粉晶',icon:'💕',el:'火',d:'柔和粉色常用於溫暖的人際主題設計。',wear:'可選用已有飾品，不需為占卜結果另購。'},
    {n:'紅瑪瑙',icon:'❤️',el:'火',d:'均勻暖紅色適合簡單的點綴。',wear:'核對染色處理與保養方式。'},
    {n:'紫水晶',icon:'💜',el:'火',d:'紫色石英可作沉靜色系的視覺提醒。',wear:'部分紫水晶長時間強光照射會褪色，避免高熱。'}
  ],
  土:[
    {n:'黃水晶',icon:'💛',el:'土',d:'黃金色石英適合暖色系穿搭。',wear:'依實物處理與配件材質選擇。'},
    {n:'虎眼石',icon:'🐅',el:'土',d:'棕金色絲絹光澤適合偏好低調質感的人。',wear:'按自己方便的方式佩戴，沒有固定左右手。'},
    {n:'茶晶',icon:'🍵',el:'土',d:'煙棕色石英適合大地色系。',wear:'可選配已有飾品。'},
    {n:'鈦晶',icon:'⚡',el:'土',d:'金棕色絲狀內含物適合有質感的暖色設計。',wear:'核對實物、處理資訊與佩戴舒適度。'}
  ]
};

// 沒有實物檢驗與使用者佩戴資料時，命盤不能給鐵隕石適配分數或安全禁忌。
function evaluateTianTie(bazi, ziwei){
  return {
    score:null, stars:null, suitable:null,
    reason:'若想選鐵隕石飾品，先核對實物來源、材質與配件；已知對鎳過敏時避免含鎳部件直接接觸皮膚。五行色彩只能作設計象徵，不能判斷佩戴安全。'
  };
}

// 主題只提供顏色設計入口；不能由感情／財務／健康問題指定商品或效果。
const CRYSTAL_BY_TYPE={
  love:['粉晶','草莓晶'],
  career:['白水晶','虎眼石'],
  wealth:['黃水晶','綠幽靈'],
  health:['紫水晶','月光石']
};

// 顯示可選風格；沒有把八字忌神、星曜五行或單一主題當作物性檢驗。
function renderCrystalExpanded(bazi, type){
  const fav=bazi && Array.isArray(bazi.fav) ? bazi.fav : [];
  const color=fav.find(function(el){return Object.prototype.hasOwnProperty.call(CRYSTAL_DB,el);});
  const candidates=[];
  const seen=new Set();
  function add(c){if(c && c.tier!=='special' && !seen.has(c.n)){seen.add(c.n);candidates.push(c);}}
  // 題型只改變可瀏覽的造型，不推論當事人必須買特定寶石。
  const topicOptions=Object.prototype.hasOwnProperty.call(CRYSTAL_BY_TYPE,type) ? CRYSTAL_BY_TYPE[type] : [];
  topicOptions.forEach(function(name){
    Object.keys(CRYSTAL_DB).forEach(function(el){add((CRYSTAL_DB[el]||[]).find(function(c){return c.n===name;}));});
  });
  if(color) (CRYSTAL_DB[color]||[]).forEach(add);
  if(!candidates.length) [CRYSTAL_DB.金[1],CRYSTAL_DB.木[1],CRYSTAL_DB.水[0]].forEach(add);
  const ttEval=evaluateTianTie(bazi,typeof S!=='undefined'?S.ziwei:null);
  const cards=candidates.slice(0,3).map(function(c){return `
      <div class="crystal-card">
        <div class="crystal-icon">${c.icon}</div>
        <div class="crystal-name">${c.n}</div>
        <div class="text-xs mb-sm"><span class="el-tag el-${c.el}">${c.el}色系取象</span></div>
        <p class="text-sm text-dim">${c.d}</p>
        <p class="text-xs text-muted mt-sm"><i class="fas fa-hand-holding-heart"></i> ${c.wear}</p>
      </div>`;}).join('');
  const html=`<div style="margin-bottom:1rem">
      <p class="mb-sm">飾品設計參考${color?'：盤面取用可聯想'+color+'色系':''}</p>
      <p class="text-sm text-dim">顏色只是傳統象徵，不代表礦物含有該五行，也不能用命盤判定是否安全或有效；依實物、喜好、預算與佩戴情境選擇。</p>
    </div>
    <div class="crystal-grid">${cards}</div>
    <div style="margin-top:1rem;padding:.8rem;background:rgba(212,175,55,0.06);border-radius:8px;border:1px solid rgba(212,175,55,0.15)">
      <p style="font-weight:700;margin-bottom:.4rem">☄️ 鐵隕石飾品選擇提醒</p>
      <p class="text-sm text-dim">${ttEval.reason}</p>
    </div>
    <p class="text-xs text-muted mt-md"><i class="fas fa-info-circle"></i> 可先用已有飾品作提醒，購買前核對商品資訊；水晶和金屬均不能保證改善感情、財運或健康。</p>`;
  const target=document.getElementById('r-crystal');
  if(target) target.innerHTML=html;
  return html;
}
