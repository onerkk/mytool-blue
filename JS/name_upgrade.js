// ══════════════════════════════════════════════════════════════════════
// 📛 姓名學 TOP-TIER UPGRADE
// 音韻五行 · 81數理詳細含義 · 姓名×八字用神交叉 · 字義五行
// 三才配置詳細解讀
// ══════════════════════════════════════════════════════════════════════
// 載入順序：ziwei.js 之後（ziwei.js 含 analyzeName 基礎）
// enhanceName(S.nameResult, S.bazi) 在 analyzeName 之後呼叫


// ── 1. 音韻五行 ──
// 聲母五行：唇音(土)、舌音(火)、齒音(金)、牙音(木)、喉音(水)

var NAME_INITIALS_WUXING = {
  // 唇音 → 土：b, p, m, f
  b:'土', p:'土', m:'土', f:'土',
  // 舌音 → 火：d, t, n, l
  d:'火', t:'火', n:'火', l:'火',
  // 齒音 → 金：z, c, s, zh, ch, sh, r
  z:'金', c:'金', s:'金',
  // 牙音 → 木：j, q, x, g, k, h
  j:'木', q:'木', x:'木', g:'木', k:'木', h:'木',
  // 喉音 → 水：y, w, 零聲母(a,o,e,i,u)
  y:'水', w:'水', a:'水', o:'水', e:'水', i:'水', u:'水'
};

// 韻母五行（五音分類）
var NAME_FINALS_WUXING = {
  // a 系 → 土
  a:'土', ai:'土', ao:'土', an:'土', ang:'土',
  // o/e 系 → 火
  o:'火', ou:'火', e:'火', ei:'火', en:'火', eng:'火', er:'火',
  // i 系 → 金
  i:'金', in:'金', ing:'金', ia:'金', ie:'金', iu:'金', ian:'金', iang:'金',
  // u 系 → 木
  u:'木', un:'木', ua:'木', uo:'木', ui:'木', uan:'木', uang:'木',
  // ü 系 → 水
  v:'水', ve:'水', vn:'水', van:'水'
};

/**
 * 分析單字的音韻五行
 * @param {string} pinyin - 拼音（如 'zhang', 'hua'）
 * @returns {object} 聲母五行 + 韻母五行
 */
function analyzeCharPhonetic(pinyin) {
  if (!pinyin) return {initial: '', final: '', initialEl: '', finalEl: ''};

  pinyin = pinyin.toLowerCase().replace(/[1-5]/g, ''); // 去聲調數字

  // 提取聲母
  var initial = '';
  var finals = pinyin;

  // 雙字母聲母
  if (pinyin.startsWith('zh') || pinyin.startsWith('ch') || pinyin.startsWith('sh')) {
    initial = pinyin.substring(0, 2);
    finals = pinyin.substring(2);
  } else if (/^[bpmfdtnlgkhjqxzcsryw]/.test(pinyin)) {
    initial = pinyin[0];
    finals = pinyin.substring(1);
  }
  // 零聲母
  if (!initial) {
    initial = pinyin[0] || '';
  }

  var initialEl = NAME_INITIALS_WUXING[initial] || '水'; // 默認喉音
  // zh/ch/sh 歸金
  if (['zh','ch','sh','r'].includes(initial)) initialEl = '金';

  var finalEl = '';
  // 嘗試匹配最長韻母
  for (var len = Math.min(finals.length, 4); len >= 1; len--) {
    var sub = finals.substring(0, len);
    if (NAME_FINALS_WUXING[sub]) {
      finalEl = NAME_FINALS_WUXING[sub];
      break;
    }
  }
  if (!finalEl) finalEl = '土'; // 默認

  return {
    initial: initial,
    final: finals,
    initialEl: initialEl,
    finalEl: finalEl,
    combinedEl: initialEl, // 傳統以聲母為主
    zh: '聲母' + initial + '(' + initialEl + ') 韻母' + finals + '(' + finalEl + ')'
  };
}


// ── 2. 81數理詳細吉凶含義 ──
var SHULI_81 = {
  1:{ji:'大吉',zh:'太極之數：萬物開基，富貴榮華，天賦之力'},
  2:{ji:'凶',zh:'兩儀之數：混沌分離，進退保守，困難不安'},
  3:{ji:'大吉',zh:'三才之數：進取如意，智慧明達，家門昌盛'},
  4:{ji:'凶',zh:'四象之數：萬物枯萎，破敗衰亡，不吉不利'},
  5:{ji:'大吉',zh:'五行之數：福祿長壽，陰陽和合，興家成業'},
  6:{ji:'吉',zh:'六爻之數：天德地祥，信用得固，安穩與成'},
  7:{ji:'吉',zh:'七政之數：獨立權威，精悍果斷，剛毅進取'},
  8:{ji:'吉',zh:'八卦之數：意志堅剛，勤勉進取，含意興隆'},
  9:{ji:'凶',zh:'大成之數：興盡凶始，窮乏困苦，利去名空'},
  10:{ji:'凶',zh:'終結之數：萬物終局，充滿損耗，多禍短命'},
  11:{ji:'大吉',zh:'旱苗逢雨：挽回家運，順利發展，一門鼎盛'},
  12:{ji:'凶',zh:'掘井無泉：意志薄弱，家庭寂寞，企圖不當'},
  13:{ji:'大吉',zh:'春日牡丹：才藝多能，智謀奇略，忍柔當事'},
  14:{ji:'凶',zh:'破兆之數：家庭緣薄，孤獨遭難，忍耐可安'},
  15:{ji:'大吉',zh:'福壽之數：福壽圓滿，慈祥有德，繁榮隆昌'},
  16:{ji:'大吉',zh:'厚重之數：貴人得助，天乙貴人，堅持順利'},
  17:{ji:'吉',zh:'剛柔兼備：突破萬難，事業可成，剛強不屈'},
  18:{ji:'大吉',zh:'鐵鏡重磨：權威顯達，有志竟成，博得名利'},
  19:{ji:'凶',zh:'多難之數：風雲蔽日，辛苦重重，雖有智謀'},
  20:{ji:'凶',zh:'屋下藏金：非業破運，百事不如意，進退維谷'},
  21:{ji:'大吉',zh:'明月中天：獨立權威，光風霽月，大博名利'},
  22:{ji:'凶',zh:'秋草逢霜：薄弱之數，百事不如意，哀嘆'},
  23:{ji:'大吉',zh:'壯麗之數：旭日東昇，質實剛堅，一鳴驚人'},
  24:{ji:'大吉',zh:'掘藏得金：家門餘慶，金錢豐盈，白手成家'},
  25:{ji:'大吉',zh:'資性英敏：才力奇特，智慧超群，成就大業'},
  26:{ji:'吉',zh:'變怪之數：變怪奇異，英雄豪傑，波瀾重疊'},
  27:{ji:'吉',zh:'增長之數：欲望無止，自我犧牲，其難可期'},
  28:{ji:'凶',zh:'闊水浮萍：豪氣生離，遭難不安，家屬多苦'},
  29:{ji:'吉',zh:'智謀之數：智謀優秀，財力歸集，名聞海內'},
  30:{ji:'吉',zh:'非運之數：浮沉不定，凶吉難變，禍福倚伏'},
  31:{ji:'大吉',zh:'春日花開：智勇得志，博得名利，領導群倫'},
  32:{ji:'大吉',zh:'寶馬金鞍：僥倖多望，貴人得助，財帛如裕'},
  33:{ji:'大吉',zh:'旭日昇天：鸞鳳相會，才藝精絕，家門興隆'},
  34:{ji:'凶',zh:'破家之數：危難蹉跎，災厄至極，空虛哀嘆'},
  35:{ji:'大吉',zh:'高樓望月：溫和平靜，智達通暢，文昌技藝'},
  36:{ji:'凶',zh:'波瀾之數：風浪不盡，俠義豪傑，犧牲奉獻'},
  37:{ji:'大吉',zh:'猛虎出林：權威顯達，忠實豐富，獨立權威'},
  38:{ji:'吉',zh:'磨鐵成針：意志薄弱，藝術之才，學者技術'},
  39:{ji:'大吉',zh:'富貴榮華：光風霽月，富貴繁榮，德望高大'},
  40:{ji:'凶',zh:'退安之數：智謀膽力，有才華而不得志'},
  41:{ji:'大吉',zh:'有德之數：純陽獨秀，德望兼備，萬事順利'},
  42:{ji:'凶',zh:'寒蟬在柳：博識多能，才略奇巧，成敗一瞬'},
  43:{ji:'凶',zh:'散財之數：雨夜花落，薄弱散漫，諸事不如'},
  44:{ji:'凶',zh:'煩悶之數：破家亡身，暗淡惨悴，事不如意'},
  45:{ji:'大吉',zh:'順風之數：新生泰和，順風揚帆，智謀經緯'},
  46:{ji:'凶',zh:'浪裡淘金：載寶沉舟，羅網繫身，多災多難'},
  47:{ji:'大吉',zh:'點石成金：花開之象，萬事如意，祯祥之兆'},
  48:{ji:'大吉',zh:'青松立鶴：智謀兼備，德量隆厚，顧問之才'},
  49:{ji:'凶',zh:'轉變之數：吉凶難分，不定之象，禍福並至'},
  50:{ji:'凶',zh:'小舟入海：吉凶互見，一成一敗，兇中有吉'},
  51:{ji:'吉',zh:'沉浮之數：盛衰交加，先甘後苦，晚年安泰'},
  52:{ji:'大吉',zh:'達眼之數：先見之明，理想實現，卓越成就'},
  53:{ji:'凶',zh:'曲卷難星：外祥內憂，盛衰參半，先吉後凶'},
  54:{ji:'凶',zh:'石上栽花：多難之數，難以安寧，災禍並至'},
  55:{ji:'吉',zh:'善惡之數：外美內苦，和順和暢，吉中帶凶'},
  56:{ji:'凶',zh:'浪裡行舟：缺乏實力，歷盡艱辛，四處碰壁'},
  57:{ji:'大吉',zh:'日照春松：寒雪青松，夜鶯吟春，繁榮茂盛'},
  58:{ji:'吉',zh:'晚行遇月：澤被後裔，先苦後甘，沉浮多端'},
  59:{ji:'凶',zh:'寒蟬悲風：須防外患，災厄連連，難以安定'},
  60:{ji:'凶',zh:'無謀之數：搖擺不定，黑暗無光，大起大落'},
  61:{ji:'大吉',zh:'牡丹芙蓉：花開富貴，名利雙收，繁茂興隆'},
  62:{ji:'凶',zh:'衰敗之數：基礎虛弱，艱難困苦，難以成功'},
  63:{ji:'大吉',zh:'舟歸平海：富貴長壽，家庭和合，財源廣進'},
  64:{ji:'凶',zh:'非命之數：骨肉分離，孤獨悲愁，前途未定'},
  65:{ji:'大吉',zh:'巨流歸海：天長地久，家運盛大，繁榮興隆'},
  66:{ji:'凶',zh:'岩頭步馬：進退無自由，內外不和，多災多難'},
  67:{ji:'大吉',zh:'通達之數：利路亨通，萬事順利，大吉之象'},
  68:{ji:'大吉',zh:'順風吹帆：興家立業，才德兼備，充實繁榮'},
  69:{ji:'凶',zh:'非業貧困：坐立不安，半凶半吉，進退維谷'},
  70:{ji:'凶',zh:'凶星之數：慘淡經營，多入不敷出，破敗衰亡'},
  71:{ji:'吉',zh:'石裡藏玉：吉凶參半，惟賴努力，始免困境'},
  72:{ji:'吉',zh:'勞苦之數：先甘後苦，利害互見，半吉半凶'},
  73:{ji:'吉',zh:'無勇之數：安樂自來，高遠意象，進取則凶'},
  74:{ji:'凶',zh:'沉淪之數：利不及費，坐食山空，秋草逢霜'},
  75:{ji:'吉',zh:'退守之數：守之可安，進則招禍，退而保吉'},
  76:{ji:'凶',zh:'離散之數：傾覆離散，多災多難，欲速不達'},
  77:{ji:'吉',zh:'半吉之數：先苦後甘，但需堅忍，方可成功'},
  78:{ji:'凶',zh:'晚苦之數：先甘後苦，晚景淒涼，享受太過'},
  79:{ji:'凶',zh:'挽回之數：極凶之象，風光不再，難以為繼'},
  80:{ji:'凶',zh:'遁隱之數：退守安吉，進取招凶，隱遁為佳'},
  81:{ji:'大吉',zh:'萬物回春：回歸太極，還本歸元，重新開始'}
};

function getShuliDetail(ge) {
  var n = ((ge - 1) % 80) + 1;
  return SHULI_81[n] || {ji:'平', zh:'未知數理'};
}


// ── 3. 姓名與八字用神交叉 ──
// 分析名字五行是否補到八字的喜用神

function nameVsBaziAnalysis(nameResult, bazi) {
  if (!nameResult || !bazi) return null;

  var fav = bazi.fav || [];
  var unfav = bazi.unfav || [];

  // 收集名字中所有五行
  var nameElements = [];
  ['tianGe','renGe','diGe','waiGe','zongGe'].forEach(function(ge) {
    if (nameResult[ge] && nameResult[ge].el) {
      nameElements.push({source: ge, el: nameResult[ge].el});
    }
  });

  var favCount = 0, unfavCount = 0, details = [];

  nameElements.forEach(function(ne) {
    var geNames = {tianGe:'天格',renGe:'人格',diGe:'地格',waiGe:'外格',zongGe:'總格'};
    var geName = geNames[ne.source] || ne.source;

    if (fav.includes(ne.el)) {
      favCount++;
      details.push({ge: geName, el: ne.el, match: 'fav', zh: geName + '(' + ne.el + ')補到喜用神 ✓'});
    } else if (unfav.includes(ne.el)) {
      unfavCount++;
      details.push({ge: geName, el: ne.el, match: 'unfav', zh: geName + '(' + ne.el + ')犯到忌神 ✗'});
    } else {
      details.push({ge: geName, el: ne.el, match: 'neutral', zh: geName + '(' + ne.el + ')中性'});
    }
  });

  // 三才五行與用神
  var sanCaiMatch = 0;
  if (nameResult.sanCai) {
    nameResult.sanCai.forEach(function(el) {
      if (fav.includes(el)) sanCaiMatch++;
    });
  }

  var score = favCount * 20 - unfavCount * 25 + sanCaiMatch * 10;
  var label = score >= 60 ? '極佳' : score >= 30 ? '良好' : score >= 0 ? '普通' : score >= -20 ? '不理想' : '需改善';

  return {
    favCount: favCount,
    unfavCount: unfavCount,
    sanCaiMatch: sanCaiMatch,
    score: Math.max(0, Math.min(100, 50 + score)),
    label: label,
    details: details,
    favElements: fav,
    unfavElements: unfav,
    zh: '名字與八字契合度：' + label + '（喜用命中' + favCount + '格，忌神命中' + unfavCount + '格，三才命中' + sanCaiMatch + '行）'
  };
}


// ── 4. 三才配置詳細解讀 ──

var SANCAI_DETAIL = {
  '大吉': '天地人三才配置極為和諧，一生順遂，貴人運佳，健康長壽。事業發展阻力小，人際關係融洽。',
  '吉':   '三才配置良好，基礎穩固。雖偶有小波折但總體順利，能逢凶化吉。適合穩步發展。',
  '平':   '三才配置平平，不特別好也不特別壞。需要自身努力才能出人頭地，不能過度依賴運氣。',
  '凶':   '三才配置不佳，天地人之間有沖剋。可能在健康、事業或人際方面遇到較多阻礙。建議以其他方面（如八字用神、生肖字根）彌補。'
};


// ══════════════════════════════════════════════════════════════════════
// INTEGRATION
// ══════════════════════════════════════════════════════════════════════

function enhanceName(nameResult, bazi) {
  if (!nameResult) return nameResult;

  // 1. 81數理詳細含義
  ['tianGe','renGe','diGe','waiGe','zongGe'].forEach(function(ge) {
    if (nameResult[ge] && nameResult[ge].num) {
      nameResult[ge].shuliDetail = getShuliDetail(nameResult[ge].num);
    }
  });

  // 2. 三才詳解
  if (nameResult.sanCaiLevel) {
    nameResult.sanCaiDetail = SANCAI_DETAIL[nameResult.sanCaiLevel] || '';
  }

  // 3. 姓名×八字交叉
  if (bazi) {
    try { nameResult.baziMatch = nameVsBaziAnalysis(nameResult, bazi); }
    catch(e) { nameResult.baziMatch = null; }
  }

  // 4. 音韻五行（需要拼音資料，目前作為框架預留）
  // 實際使用時需要前端輸入拼音或使用拼音轉換庫
  nameResult.phoneticNote = '音韻五行分析需提供各字拼音，可透過 analyzeCharPhonetic() 函式計算';

  return nameResult;
}
