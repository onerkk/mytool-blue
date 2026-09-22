/*! Jingyue Liuyao / Wen Wang Gua · 1.0.0
 * Pure, deterministic Na Jia calculation. Arrays always run bottom → top.
 * Sources and deliberate school policies: docs/liuyao-20260922.md.
 * A correctly calculated traditional chart does not validate prediction.
 */
(function (root) {
  'use strict';
  var GAN = '甲乙丙丁戊己庚辛壬癸'.split('');
  var ZHI = '子丑寅卯辰巳午未申酉戌亥'.split('');
  var ELEMENT = ['水','土','木','木','土','火','火','土','金','金','土','水'];
  var GENERATES = {木:'火',火:'土',土:'金',金:'水',水:'木'};
  var CONTROLS = {木:'土',土:'水',水:'火',火:'金',金:'木'};
  var SPIRITS = ['青龍','朱雀','勾陳','螣蛇','白虎','玄武'];
  var SPIRIT_START = [0,0,1,1,2,3,4,4,5,5];
  var LABELS = ['初爻','二爻','三爻','四爻','五爻','上爻'];
  // Numeric bit 0 is the bottom line, bit 2 the top of a trigram.
  var TRIGRAMS = [
    {id:7,name:'乾',image:'天',element:'金',stems:['甲','壬'],branches:[0,2,4,6,8,10]},
    {id:3,name:'兌',image:'澤',element:'金',stems:['丁','丁'],branches:[5,3,1,11,9,7]},
    {id:5,name:'離',image:'火',element:'火',stems:['己','己'],branches:[3,1,11,9,7,5]},
    {id:1,name:'震',image:'雷',element:'木',stems:['庚','庚'],branches:[0,2,4,6,8,10]},
    {id:6,name:'巽',image:'風',element:'木',stems:['辛','辛'],branches:[1,11,9,7,5,3]},
    {id:2,name:'坎',image:'水',element:'水',stems:['戊','戊'],branches:[2,4,6,8,10,0]},
    {id:4,name:'艮',image:'山',element:'土',stems:['丙','丙'],branches:[4,6,8,10,0,2]},
    {id:0,name:'坤',image:'地',element:'土',stems:['乙','癸'],branches:[7,5,3,1,11,9]}
  ];
  // Upper-trigram rows, lower-trigram columns, in TRIGRAMS order.
  var KING_WEN = [
    [1,10,13,25,44,6,33,12],[43,58,49,17,28,47,31,45],
    [14,38,30,21,50,64,56,35],[34,54,55,51,32,40,62,16],
    [9,61,37,42,57,59,53,20],[5,60,63,3,48,29,39,8],
    [26,41,22,27,18,4,52,23],[11,19,36,24,46,7,15,2]
  ];
  var NAMES = '乾 坤 屯 蒙 需 訟 師 比 小畜 履 泰 否 同人 大有 謙 豫 隨 蠱 臨 觀 噬嗑 賁 剝 復 無妄 大畜 頤 大過 坎 離 咸 恆 遯 大壯 晉 明夷 家人 睽 蹇 解 損 益 夬 姤 萃 升 困 井 革 鼎 震 艮 漸 歸妹 豐 旅 巽 兌 渙 節 中孚 小過 既濟 未濟'.split(' ');
  var PALACE_MASK = [0,1,3,7,15,31,23,16];
  var WORLD = [6,1,2,3,4,5,4,3];
  var GENERATION = ['本宮','一世','二世','三世','四世','五世','遊魂','歸魂'];
  var PALACES = {}, BY_ID = {};
  TRIGRAMS.forEach(function (t) {
    BY_ID[t.id] = t;
    PALACE_MASK.forEach(function (mask, i) {
      var code = (t.id | (t.id << 3)) ^ mask;
      if (PALACES[code]) throw new Error('八宮重複');
      PALACES[code] = {name:t.name,element:t.element,generation:GENERATION[i],shi:WORLD[i],ying:(WORLD[i]+2)%6+1,pureCode:t.id|(t.id<<3)};
    });
  });
  function copy(value) { return JSON.parse(JSON.stringify(value)); }
  function freeze(value) {
    if (value && typeof value === 'object' && !Object.isFrozen(value)) {
      Object.keys(value).forEach(function (k) { freeze(value[k]); }); Object.freeze(value);
    } return value;
  }
  function mod(n, m) { return ((n % m) + m) % m; }
  function relation(from, to) {
    if (!GENERATES[from] || !GENERATES[to]) throw new Error('五行無效');
    if (from === to) return '比和';
    if (GENERATES[from] === to) return '生';
    if (CONTROLS[from] === to) return '克';
    return GENERATES[to] === from ? '受生' : '受克';
  }
  function relative(palaceElement, element) {
    return {比和:'兄弟',生:'子孫',克:'妻財',受生:'父母',受克:'官鬼'}[relation(palaceElement, element)];
  }
  function hexagram(code) {
    if (!Number.isInteger(code) || code < 0 || code > 63) throw new Error('卦碼必須介於 0 至 63');
    var lower = BY_ID[code & 7], upper = BY_ID[code >> 3];
    var number = KING_WEN[TRIGRAMS.indexOf(upper)][TRIGRAMS.indexOf(lower)];
    return {code:code,number:number,name:NAMES[number-1],fullName:upper===lower?upper.name+'為'+upper.image:upper.image+lower.image+NAMES[number-1],
      symbol:String.fromCodePoint(0x4dc0+number-1),lower:lower.name,upper:upper.name,
      lines:Array.from({length:6},function (_, i) { return (code >> i) & 1; }),palace:copy(PALACES[code])};
  }
  function najia(code, palaceElement) {
    var g = hexagram(code), owner = palaceElement || g.palace.element;
    return g.lines.map(function (yang, i) {
      var t = BY_ID[i<3 ? code&7 : code>>3], branch = t.branches[i];
      return {position:i+1,label:LABELS[i],yang:!!yang,stem:t.stems[i<3?0:1],branch:ZHI[branch],branchIndex:branch,element:ELEMENT[branch],relative:relative(owner,ELEMENT[branch])};
    });
  }
  function voidBranches(day) {
    if (typeof day !== 'string' || day.length !== 2) throw new Error('日干支無效');
    var gan = GAN.indexOf(day[0]), zhi = ZHI.indexOf(day[1]);
    if (gan<0 || zhi<0 || (gan%2)!==(zhi%2)) throw new Error('日干支不在六十甲子中');
    var start = mod(zhi-gan,12);
    return [ZHI[(start+10)%12],ZHI[(start+11)%12]];
  }
  function branchLinks(a,b) {
    var ai = ZHI.indexOf(a), bi = ZHI.indexOf(b);
    if(ai<0 || bi<0) throw new Error('地支無效');
    return {same:ai===bi,clash:mod(ai-bi,12)===6,combine:(ai+bi)%12===1};
  }
  function states(line, date) {
    var month = branchLinks(line.branch,date.monthBranch), day = branchLinks(line.branch,date.day[1]);
    return {void:date.voidBranches.indexOf(line.branch)>=0,monthBroken:month.clash,monthSame:month.same,
      monthCombine:month.combine,daySame:day.same,dayClash:day.clash,dayCombine:day.combine,
      monthRelation:relation(ELEMENT[ZHI.indexOf(date.monthBranch)],line.element),dayRelation:relation(ELEMENT[ZHI.indexOf(date.day[1])],line.element)};
  }
  function transition(from,to) {
    var pair=from.branch+to.branch,links=branchLinks(from.branch,to.branch),back=relation(to.element,from.element);
    var progress=['亥子','寅卯','巳午','申酉','丑辰','辰未','未戌','戌丑'];
    return {from:from.branch,to:to.branch,returnRelation:back,
      returnLabel:back==='生'?'回頭生':back==='克'?'回頭克':back==='比和'?'變爻比和':back==='受生'?'本爻生變爻':'本爻克變爻',
      advance:progress.indexOf(pair)>=0,retreat:progress.indexOf(to.branch+from.branch)>=0,
      sameBranch:links.same,clash:links.clash,combine:links.combine};
  }
  function fromCoins(coins) {
    if (!Array.isArray(coins) || coins.length!==3 || coins.some(function (c) { return c!=='front' && c!=='back'; })) throw new Error('每次必須是三枚有效銅錢');
    return coins.reduce(function (sum,c) { return sum+(c==='back'?3:2); },0);
  }
  function toss() {
    if (!root.crypto || typeof root.crypto.getRandomValues !== 'function') throw new Error('此瀏覽器無法安全擲錢，請改用手動記卦。');
    var bits = new Uint8Array(3); root.crypto.getRandomValues(bits);
    var coins = Array.from(bits,function (v) { return (v&1)?'back':'front'; });
    return freeze({coins:coins,value:fromCoins(coins)});
  }
  function localTimeAt(instant, offset) {
    if (!Number.isFinite(instant) || !Number.isFinite(offset) || offset < -12 || offset > 14 || !Number.isInteger(offset*4)) throw new Error('時間或 UTC 時差無效');
    var d = new Date(instant+offset*3600000);
    return {year:d.getUTCFullYear(),month:d.getUTCMonth()+1,day:d.getUTCDate(),hour:d.getUTCHours(),minute:d.getUTCMinutes(),second:d.getUTCSeconds(),timezoneOffset:offset};
  }
  function calendar(input) {
    if (!root.BaziCalendarCore || !root.BaziCalendarCore.hasEngine()) throw new Error('曆法尚未載入，請稍後重試。');
    var data=Object.assign({},input), offset=data.timezoneOffset==null?8:Number(data.timezoneOffset);
    if (!Number.isFinite(offset) || offset < -12 || offset > 14 || !Number.isInteger(offset*4)) throw new Error('UTC 時差須介於 −12 與 +14，並以 15 分鐘為單位');
    data.timezoneOffset=offset; data.dayBoundaryMode=data.dayBoundaryMode||'MIDNIGHT_00';
    // Always derive the instant from the declared wall clock. No caller-supplied
    // birthInstant can make the solar-term month disagree with the displayed time.
    delete data.birthInstant; delete data.trueSolarTimeApplied;
    var c;
    try { c=root.BaziCalendarCore.calculateChart(data); }
    catch (e) { throw new Error(String(e.message||e).replace(/出生/g,'起卦')); }
    if (!c) throw new Error('曆法計算失敗，沒有使用估算日期。');
    function gz(p){return p.gan+p.zhi;}
    return freeze({wall:root.BaziCalendarCore.formatParts(data),instant:new Date(c.birthInstant).toISOString(),timezoneOffset:offset,
      dayBoundaryMode:data.dayBoundaryMode,year:gz(c.pillars.year),month:gz(c.pillars.month),day:gz(c.pillars.day),hour:gz(c.pillars.hour),
      monthBranch:c.pillars.month.zhi,voidBranches:voidBranches(gz(c.pillars.day)),previousJie:c.previousJie,nextJie:c.nextJie,
      termTimezone:c.termTimezone,engine:c.engine,engineVersion:c.engineVersion,precision:c.precision});
  }
  function focusFor(question, selected) {
    var allowed=['auto','世應','妻財','官鬼','父母','兄弟','子孫'];
    if (selected && allowed.indexOf(selected)<0) throw new Error('用神設定無效');
    if (selected && selected!=='auto') return {mode:'manual',candidates:[selected],note:'提問者指定的取用方向；仍須依完整原問句判讀。'};
    var q=String(question||''), candidates=[];
    if(/營收|收入|獲利|貨款|回款|收款|財運|求財|利潤|賺錢|薪水|資金/.test(q))candidates.push('妻財');
    if(/求職|錄取|面試|升遷|職位|考公職|轉職|官司|訴訟/.test(q))candidates.push('官鬼');
    if(/合約|簽約|證照|文書|申請|考試|父母|爸爸|媽媽|房屋/.test(q))candidates.push('父母');
    if(/孩子|女兒|兒子|子女|懷孕/.test(q))candidates.push('子孫');
    if(/兄弟|姊妹|姐妹|哥哥|弟弟|姊姊|姐姐|妹妹/.test(q))candidates.push('兄弟');
    if(/交往|感情|伴侶|喜歡|愛我|曖昧|結婚|對方|合作/.test(q) || !candidates.length)candidates.push('世應');
    return {mode:'suggested',candidates:candidates,note:'依問句提供取用候選，不是已證實的人物角色或吉凶。感情先看已知關係與世應，不由姓名或性別猜配偶爻。'};
  }
  function calculate(input) {
    input=input||{};
    var values=input.values;
    if(!Array.isArray(values) || values.length!==6 || values.some(function (v) { return !Number.isInteger(v) || v<6 || v>9; })) throw new Error('請由初爻到上爻，完整輸入六個 6、7、8 或 9。');
    var date=input.calendar;
    if(!date || !date.day || ZHI.indexOf(date.monthBranch)<0) throw new Error('缺少有效月建與日辰');
    date=copy(date); date.voidBranches=voidBranches(date.day);
    var mode=input.method||'manual';
    if(mode!=='manual' && mode!=='coins') throw new Error('起卦方式無效');
    var records=input.records ? copy(input.records) : [];
    if(mode==='coins' && (records.length!==6 || records.some(function(r,i){return fromCoins(r.coins)!==values[i] || r.value!==values[i];}))) throw new Error('擲錢紀錄與爻值不一致');
    var code=0,changedCode=0;
    values.forEach(function (v,i) { if(v%2)code|=1<<i; if(v===6 || v===7)changedCode|=1<<i; });
    var original=hexagram(code),changed=hexagram(changedCode),owner=original.palace.element;
    var lines=najia(code,owner),changedLines=najia(changedCode,owner),pure=najia(original.palace.pureCode,owner);
    var present=lines.map(function(l){return l.relative;}), spirit=SPIRIT_START[GAN.indexOf(date.day[0])];
    lines.forEach(function(l,i){
      l.value=values[i]; l.moving=values[i]===6||values[i]===9;
      l.valueName={6:'老陰',7:'少陽',8:'少陰',9:'老陽'}[values[i]];
      l.marker=values[i]===6?'×':values[i]===9?'○':'';
      l.role=l.position===original.palace.shi?'世':l.position===original.palace.ying?'應':'';
      l.spirit=SPIRITS[(spirit+i)%6];l.states=states(l,date);
      l.changed=changedLines[i];l.changed.states=states(l.changed,date);
      l.changed.active=l.moving; // Static transformed rows are context, not moving yao.
      l.transition=l.moving?transition(l,l.changed):null;
      l.hidden=present.indexOf(pure[i].relative)<0?Object.assign({},pure[i],{states:states(pure[i],date),flightRelation:relation(l.element,pure[i].element)}):null;
    });
    var links=[0,1,2].map(function(i){return branchLinks(lines[i].branch,lines[i+3].branch);});
    var changedLinks=[0,1,2].map(function(i){return branchLinks(changedLines[i].branch,changedLines[i+3].branch);});
    return freeze({version:'1.0.0',system:'liuyao',method:mode,question:String(input.question||'').trim(),calendar:date,values:values.slice(),records:records,
      original:original,changed:changed,hasChange:code!==changedCode,lines:lines,movingPositions:lines.filter(function(l){return l.moving;}).map(function(l){return l.position;}),
      structures:{sixClash:links.every(function(p){return p.clash;}),sixCombine:links.every(function(p){return p.combine;}),changedSixClash:changedLinks.every(function(p){return p.clash;}),changedSixCombine:changedLinks.every(function(p){return p.combine;})},
      focus:focusFor(input.question,input.focus),policy:{lineOrder:'bottom-up',coinConvention:'字面=2、背面=3；6老陰、7少陽、8少陰、9老陽',relativeBasis:'本卦卦宮五行（變爻亦同）',hiddenRule:'本卦缺六親時，取本宮純卦同位伏神',monthBasis:'節令交節瞬間，不以農曆初一換月',dayClash:'只標日沖；暗動／日破須連同旺衰判定，不直接定論',prediction:'傳統象徵解讀，不是現實事件的保證'}});
  }
  var api={version:'1.0.0',hexagram:hexagram,najia:najia,relative:relative,relation:relation,voidBranches:voidBranches,branchLinks:branchLinks,
    fromCoins:fromCoins,toss:toss,localTimeAt:localTimeAt,calendar:calendar,calculate:calculate,focusFor:focusFor,
    trigramData:copy(TRIGRAMS),labels:LABELS.slice()};
  root.JYLiuyaoCore=freeze(api);
  if(typeof module!=='undefined'&&module.exports)module.exports=root.JYLiuyaoCore;
})(typeof window!=='undefined'?window:globalThis);
