/*! Jingyue Liuyao / Wen Wang Gua · 1.2.0
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
  function relationDirection(source, relationName) {
    return ({'比和':source+'與爻同氣','生':source+'生爻','克':source+'克爻','受生':'爻生'+source,'受克':'爻克'+source})[relationName]||source+'關係未明';
  }
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
  // Question -> 用神 is an engine responsibility, not a prompt fallback.
  // Resolve the event first, then map the event to the classical target. Unknown
  // wording fails closed instead of silently turning into 世應.
  function normalizeQuestion(question){
    return String(question||'').trim().replace(/[Ａ-Ｚａ-ｚ０-９]/g,function(ch){return String.fromCharCode(ch.charCodeAt(0)-0xfee0);})
      .replace(/[\u3000\t\r]+/g,' ').replace(/\s+/g,' ')
      .replace(/中奖/g,'中獎').replace(/发票/g,'發票').replace(/奖金/g,'獎金')
      .replace(/营收/g,'營收').replace(/营业额/g,'營業額').replace(/获利/g,'獲利')
      .replace(/签约/g,'簽約').replace(/合同/g,'合約').replace(/证照/g,'證照').replace(/录取/g,'錄取')
      .replace(/升迁/g,'升遷').replace(/怀孕/g,'懷孕').replace(/对象/g,'對象').replace(/对方/g,'對方');
  }
  function evidenceHit(list,q,weight,label,out){
    list.forEach(function(re){if(re.test(q))out.push({label:label,weight:weight,match:(q.match(re)||[''])[0]});});
  }
  function scoreEvidence(items){return items.reduce(function(sum,x){return sum+x.weight;},0);}
  function resolveQuestionIntent(question){
    var q=normalizeQuestion(question),frames=[];
    function add(id,domain,relative,role,evidence){if(evidence.length)frames.push({id:id,domain:domain,relative:relative,role:role,score:scoreEvidence(evidence),evidence:evidence});}
    var amount=/多少(?:錢|元|塊|萬|獎金|彩金)?|幾(?:元|塊|萬|千|百)|金額|營業額|營收(?:多少|幾)?|收入(?:多少|幾)?|獲利(?:多少|幾)?/;
    var draw=/(?:統一)?發票.{0,8}(?:開獎|對獎|中獎|中多少)|(?:開獎|對獎).{0,8}(?:發票|彩券|彩票|樂透)|中獎|獎金|彩金|頭獎|特獎|特別獎|大樂透|威力彩|今彩|樂透|彩券|彩票|刮刮樂|抽獎/;
    var money=/(?:錢|金錢|現金|營業額|營收|收入|獲利|利潤|毛利|淨利|貨款|回款|收款|款項|薪資|薪水|工資|報酬|佣金|分紅|賠償金|租金|財運|求財|資金|回本|收益|賺錢|賺到|拿到.*錢|收到.*錢|討債|還錢|欠款|投資|股票|基金|股利|股息)/;
    var wealth=[];evidenceHit([draw],q,140,'中獎／獎金事件',wealth);evidenceHit([money],q,120,'實際金錢得失',wealth);
    if(amount.test(q)&&(draw.test(q)||money.test(q)))wealth.push({label:'詢問金額',weight:50,match:(q.match(amount)||[''])[0]});
    if(/(?:中|得|拿|收|領|賺|獲).{0,6}(?:多少|錢|金|款|獎|收入|利潤)/.test(q))wealth.push({label:'取得金錢結果',weight:90,match:(q.match(/(?:中|得|拿|收|領|賺|獲).{0,6}(?:多少|錢|金|款|獎|收入|利潤)/)||[''])[0]});
    add('financial-gain','wealth','妻財','事情用神',wealth);

    var career=[],careerOutcome=/(?:求職|找工作|錄取|面試|升遷|升職|職位|主管|考公職|轉職|換工作|失業|裁員|辭職|聘用|offer|官司|訴訟|工作.{0,8}(?:找到|保住|穩定|去留|發展)|事業.{0,8}(?:發展|升遷|去留)|副業.{0,8}(?:發展|去留|做下去|擴大))/i;
    evidenceHit([careerOutcome],q,120,'職位／功名結果',career);
    if(/(?:工作|職場|事業)/.test(q)&&!career.length)career.push({label:'職業事項',weight:95,match:(q.match(/(?:工作|職場|事業)/)||[''])[0]});
    else if(/副業/.test(q)&&!career.length)career.push({label:'副業情境',weight:60,match:'副業'});
    add('career-status','career','官鬼','事情用神',career);

    var document=[],documentOutcome=/(?:合約|簽約|契約|租約|證照|證書|文書|文件|申請|核准|許可|房屋|房子|住宅|不動產|考試|成績單|通知書|公文)/;
    evidenceHit([documentOutcome],q,110,'文書／房屋事項',document);add('document-property','document','父母','事情用神',document);

    var relationship=[],relationshipOutcome=/(?:交往|感情|現任|女友|男友|伴侶|另一半|對象|喜歡我|愛我|愛上|曖昧|告白|結婚|婚姻|復合|分手|正緣|桃花|對方.{0,8}(?:想|願意|態度)|我們.{0,8}(?:關係|發展)|合作.{0,8}(?:成|順利|意願))/;
    evidenceHit([relationshipOutcome],q,125,'雙方互動／關係結果',relationship);add('counterparty-relationship','relationship','世應','雙方對接',relationship);

    var child=[],childOutcome=/(?:孩子|小孩|女兒|兒子|子女|懷孕|受孕|生子|寶寶)/;
    evidenceHit([childOutcome],q,125,'子女／晚輩事項',child);add('children','kin','子孫','明示親屬',child);
    var sibling=[],siblingOutcome=/(?:兄弟|姊妹|姐妹|哥哥|弟弟|姊姊|姐姐|妹妹|同輩手足)/;
    evidenceHit([siblingOutcome],q,125,'手足／同輩事項',sibling);add('siblings','kin','兄弟','明示親屬',sibling);
    var parent=[],parentOutcome=/(?:父母|爸爸|媽媽|父親|母親|爸媽|長輩)/;
    evidenceHit([parentOutcome],q,125,'父母／長輩人物',parent);add('parents','kin','父母','明示親屬',parent);

    var health=[],healthOutcome=/(?:健康|身體|病情|生病|疾病|症狀|手術|治療|康復|痊癒|住院|疼痛|不舒服)/;
    evidenceHit([healthOutcome],q,115,'健康／疾病事項',health);if(health.length)add('self-health','health','世','本人狀態',health);

    var high=frames.filter(function(f){return f.score>=90;});
    if(high.length){
      var hasWealth=high.some(function(f){return f.domain==='wealth';});
      if(hasWealth&&amount.test(q))high=high.filter(function(f){return f.domain==='wealth'||(f.score>=120&&f.domain!=='career');});
      frames=high;
    }else frames=[];
    if(health.length){var kin=frames.filter(function(f){return f.domain==='kin';});if(kin.length)frames=frames.filter(function(f){return f.id!=='self-health';});}
    var seen={},resolved=[];frames.sort(function(a,b){return b.score-a.score;}).forEach(function(f){var key=f.relative+'|'+f.role;if(!seen[key]){seen[key]=1;resolved.push(f);}});
    return {question:q,status:resolved.length?'resolved':'unresolved',frames:resolved,facets:{amount:amount.test(q),timing:/何時|什麼時候|多久|哪天|哪月|哪年|期限|月底|本月|今天|明天|今年|明年/.test(q)}};
  }
  function structuredTarget(relative,role,priority,intent){
    return {selector:relative==='世'||relative==='應'?'role':relative==='世應'?'roles':'relative',value:relative,relative:relative,role:role,priority:priority||'primary',intent:intent||null};
  }
  function focusFor(question, selected) {
    var allowed=['auto','世應','妻財','官鬼','父母','兄弟','子孫'];
    if (selected && allowed.indexOf(selected)<0) throw new Error('用神設定無效');
    if (selected && selected!=='auto') return {mode:'manual',status:'resolved',primary:selected,candidates:[selected],targets:[structuredTarget(selected,'提問者指定','primary','manual')],intent:{status:'manual',frames:[]},note:'提問者手動指定取用方向；引擎保留此設定，不以自動分類覆蓋。'};
    var parsed=resolveQuestionIntent(question),frames=parsed.frames;
    if(!frames.length)return {mode:'unresolved',status:'unresolved',primary:null,candidates:[],targets:[],intent:parsed,note:'原問句未能可靠映射到傳統用神；引擎停止自動猜測，不以世應作萬用備援。'};
    var targets=frames.map(function(f){return structuredTarget(f.relative,f.role,'primary',f.id);}),candidates=[];
    frames.forEach(function(f){if(candidates.indexOf(f.relative)<0)candidates.push(f.relative);});
    if(frames.some(function(f){return f.domain==='wealth';}))targets.push(structuredTarget('世','問卜者承接','context','self-receipt'));
    if(frames.some(function(f){return f.domain==='health'&&f.relative==='世';}))targets.push(structuredTarget('官鬼','病勢參照','context','illness-factor'));
    return {mode:'resolved',status:frames.length>1?'multiple':'resolved',primary:frames[0].relative,candidates:candidates,targets:targets,intent:parsed,
      note:'引擎先解析事件，再依事件映射用神；'+(frames.length>1?'本題含多個可分辨事項，分列處理。':'主事情用神已解析。')};
  }
  // Zeng Shan Bu Yi rule profile. Conditions are retained; no additive fortune score.
  var RULE_SOURCE='https://zh.wikisource.org/zh-hant/增刪卜易';
  var LIFE_START={木:11,火:2,土:8,金:5,水:8}; // 土隨水；不混用八字陰干逆行。
  var LIFE_NAMES=['長生','沐浴','冠帶','臨官','帝旺','衰','病','死','墓','絕','胎','養'];
  function lifeStage(element,branch){return LIFE_NAMES[mod(ZHI.indexOf(branch)-LIFE_START[element],12)];}
  function assessLine(line,date,lines){
    var s=line.states,monthStrong=['比和','生'].includes(s.monthRelation)&&!s.monthBroken;
    var helpers=lines.filter(function(x){return x.position!==line.position&&x.moving&&!x.states.monthBroken&&(!x.states.void||x.states.daySame||x.states.dayClash)&&(!x.transition||x.transition.returnRelation!=='克')&&relation(x.element,line.element)==='生';}).map(function(x){return x.position;});
    var supported=monthStrong||s.daySame||s.dayRelation==='生'||helpers.length>0;
    var opposed=s.monthBroken||s.monthRelation==='克'||s.dayRelation==='克';
    var state=supported?(opposed?'supported-with-pressure':'supported'):'unsupported';
    var dayEffect='none';
    if(s.dayClash){
      if(line.moving)dayEffect=supported?'moving-not-dispersed':'moving-clash-unresolved';
      else dayEffect=monthStrong?'hidden-movement':helpers.length?'clash-with-support':'day-break';
    }
    var obstacles=[];
    if(s.void&&!s.daySame&&(!s.dayClash||!supported))obstacles.push(s.dayClash?'衰空逢沖，未作沖實':'旬空待填沖');
    if(s.monthBroken&&!s.daySame&&!s.dayCombine)obstacles.push('月破待值合或出月');
    if(line.moving&&s.dayCombine)obstacles.push('動爻日合，合絆待沖');
    if(line.transition&&line.transition.returnRelation==='克')obstacles.push('回頭克');
    var stages={day:lifeStage(line.element,date.day[1]),changed:line.moving?lifeStage(line.element,line.changed.branch):null};
    var tombs=[];
    if(stages.day==='墓')tombs.push({kind:'日墓',branch:date.day[1]});
    if(stages.changed==='墓')tombs.push({kind:'化墓',branch:line.changed.branch});
    lines.filter(function(x){return x.moving&&x.position!==line.position&&lifeStage(line.element,x.branch)==='墓';}).forEach(function(x){tombs.push({kind:'動墓',branch:x.branch,position:x.position});});
    if(tombs.length&&!supported)obstacles.push('休囚入墓候選，待沖墓及生扶');
    return {position:line.position,season:{label:{比和:'旺',生:'相',受生:'休',受克:'囚',克:'死'}[s.monthRelation],relation:s.monthRelation,direction:relationDirection('月令',s.monthRelation)},
      monthInfluence:relationDirection('月令',s.monthRelation),dayInfluence:relationDirection('日辰',s.dayRelation),
      strength:state,supportingMovingPositions:helpers,dayEffect:dayEffect,
      availability:obstacles.length?'conditional':dayEffect==='day-break'?'impaired':'available',obstacles:obstacles,
      lifeStages:stages,tombs:tombs,tombStatus:tombs.length?(supported?'旺有生扶，不逕作入墓':'休囚墓候選，待沖墓及生扶'):'無墓支',
      voidStatus:s.void?(s.daySame?'填實':s.dayClash?(supported?'旺空逢沖':'衰空逢沖，未作沖實'):'旬空，待出旬或填沖'):'非空',
      policy:'日沖先分動靜與生扶；月日矛盾保留。墓絕為條件，不把長生表直接當吉凶。',source:RULE_SOURCE};
  }
  function questionTargets(question,focus){
    var q=normalizeQuestion(question),targets=Array.isArray(focus.targets)&&focus.targets.length?copy(focus.targets):(focus.candidates||[]).map(function(x){return structuredTarget(x,'事情用神','primary','legacy');});
    if(focus.mode!=='manual'){
      [['父母',/爸爸|媽媽|父親|母親|父母|爸媽/],['子孫',/兒子|女兒|孩子|小孩|子女/],['兄弟',/哥哥|弟弟|姐姐|姊姊|妹妹|兄弟|姊妹|姐妹/]].forEach(function(pair){
        if(pair[1].test(q)&&!targets.some(function(t){return t.relative===pair[0]&&t.priority==='primary';}))targets.push(structuredTarget(pair[0],'明示親屬','context','explicit-kin'));
      });
    }
    return targets.filter(function(x,i,a){return a.findIndex(function(y){return y.role===x.role&&y.relative===x.relative&&y.priority===x.priority;})===i;});
  }
  function targetMatchesLine(target,line){
    if(target.selector==='role')return line.role===target.value;
    if(target.selector==='roles')return !!line.role;
    return line.relative===target.relative;
  }
  function hiddenCondition(hidden,flying,lines,date,assessments){
    var s=hidden.states,f=flying.states,help=[],cautions=[],gates=[];
    if(s.monthSame||s.daySame)help.push('伏神值月日');
    else if(s.monthRelation==='比和'||s.dayRelation==='比和')help.push('伏神得月日同氣');
    if(s.monthRelation==='生')help.push('伏神得月令生');
    if(s.dayRelation==='生')help.push('伏神得日辰生');
    if(relation(flying.element,hidden.element)==='生')help.push('飛神生伏神');
    var movingHelp=lines.filter(function(l){var a=assessments&&assessments[l.position-1];return l.moving&&relation(l.element,hidden.element)==='生'&&(!a||a.availability==='available')&&(!l.transition||l.transition.returnRelation!=='克');}).map(function(l){return l.position;});
    if(movingHelp.length)help.push('有效動爻生伏神：'+movingHelp.join('、')+'爻');
    if(f.void||f.monthBroken)help.push('飛神空或月破，制伏力減弱候選');
    if(s.monthBroken||s.void)cautions.push(s.monthBroken?'伏神月破':'伏神旬空');
    if(s.monthRelation==='克'||s.dayRelation==='克'||s.dayClash)cautions.push('伏神遇月日克沖候選');
    var flightRelation=relation(flying.element,hidden.element),fa=assessments&&assessments[flying.position-1];
    if(flightRelation==='克'){
      var flyingImpaired=!!(f.void||f.monthBroken||(fa&&fa.availability==='impaired'));
      cautions.push('飛神克伏神'+(flyingImpaired?'，飛神自身受損，制伏力待辨':'，出伏門檻尚在'));
      gates.push({type:'flying-controls-hidden',status:flyingImpaired?'conditional':'blocking',position:flying.position,branch:flying.branch,release:'須見飛神受制／失勢，或伏神得勢而能出伏，才可視為門檻解除'});
    }
    var movingAttacks=lines.filter(function(l){var a=assessments&&assessments[l.position-1];return l.position!==flying.position&&l.moving&&(branchLinks(l.branch,flying.branch).clash||relation(l.element,flying.element)==='克')&&(!a||a.availability==='available')&&(!l.transition||l.transition.returnRelation!=='克');}).map(function(l){return l.position;});
    if(movingAttacks.length)help.push('有效動爻沖克飛神：'+movingAttacks.join('、')+'爻');
    if(['墓','絕'].includes(lifeStage(hidden.element,date.day[1]))||['墓','絕'].includes(lifeStage(hidden.element,date.monthBranch))||['墓','絕'].includes(lifeStage(hidden.element,flying.branch)))cautions.push('伏神墓絕條件候選');
    var hardGate=gates.some(function(g){return g.status==='blocking';}),status=hardGate?(help.length?'blocked-with-support':'blocked'):help.length&&cautions.length?'mixed':help.length?'supported-conditional':cautions.length?'restrained-conditional':'unresolved';
    return {support:help,cautions:cautions,gates:gates,status:status,manifestation:'hidden',source:RULE_SOURCE,
      policy:'先判伏神能否出伏，再看一般生扶；飛神克伏神若門檻未解除，不以單一月日生扶直接改寫為已得用。'};
  }
  function parseWindow(question,date,explicit){
    if(!date.instant||!Number.isFinite(Date.parse(date.instant)))return {status:'missing-cast-instant',dates:[]};
    var wall=localTimeAt(Date.parse(date.instant),date.timezoneOffset==null?8:date.timezoneOffset),today=Date.UTC(wall.year,wall.month-1,wall.day),end=null,start=today,why='';
    function civil(s){if(!/^\d{4}-\d{2}-\d{2}$/.test(s))throw new Error('應期範圍請使用 YYYY-MM-DD');var ms=Date.parse(s+'T00:00:00Z');if(!Number.isFinite(ms)||new Date(ms).toISOString().slice(0,10)!==s)throw new Error('應期日期無效');return ms;}
    if(explicit){start=explicit.start?civil(explicit.start):today;end=civil(explicit.end);why='明示日期範圍';}
    else{var q=String(question||''),m=q.match(/(?:未來|接下來|今起|這)\s*(\d{1,3})[天日]/);if(m&&Number(m[1])>0){end=today+(Number(m[1])-1)*86400000;why=m[0];}
      else if((m=q.match(/(?:未來|接下來|這)\s*([一二兩三四1-4])(?:個)?(?:週|星期)/))){var weeks={'一':1,'二':2,'兩':2,'三':3,'四':4}[m[1]]||Number(m[1]);end=today+(weeks*7-1)*86400000;why=m[0];}
      else if(/下個月|下月/.test(q)){start=Date.UTC(wall.year,wall.month,1);end=Date.UTC(wall.year,wall.month+1,0);why='下個民用月';}
      else if(/月底|這個月|本月/.test(q)){end=Date.UTC(wall.year,wall.month,0);why='本月截至月底';}
      else if((m=q.match(/(\d{4}-\d{2}-\d{2})\s*(?:之前|以前|前|為止|截止)/))){end=civil(m[1]);why=m[0];}}
    if(end===null)return {status:'unspecified',dates:[],note:'未給期限，不自造精確應期。'};
    if(start<today||end<start||(end-start)/86400000>365)throw new Error('應期範圍須自起卦當日起，且不超過 366 日');
    return {status:'bounded',start:new Date(start).toISOString().slice(0,10),end:new Date(end).toISOString().slice(0,10),basis:why,startMs:start,endMs:end};
  }
  function interpretation(result,input){
    var lines=result.lines,date=result.calendar,assessments=lines.map(function(l){return assessLine(l,date,lines);});
    var targets=questionTargets(result.question,result.focus).map(function(t){
      var found=lines.filter(function(l){return targetMatchesLine(t,l);}).map(function(l){return {position:l.position,branch:l.branch,element:l.element,role:l.role,hidden:false,assessment:assessments[l.position-1]};});
      var hiddenOnly=!found.length&&t.selector==='relative';
      if(hiddenOnly)lines.forEach(function(l){if(l.hidden&&l.hidden.relative===t.relative)found.push({position:l.position,branch:l.hidden.branch,element:l.hidden.element,hidden:true,flightRelation:l.hidden.flightRelation,states:l.hidden.states,flightAssessment:hiddenCondition(l.hidden,l,lines,date,assessments)});});
      var calendarAlternatives=hiddenOnly?[{source:'月建',branch:date.monthBranch},{source:'日辰',branch:date.day[1]}].filter(function(x){return relative(result.original.palace.element,ELEMENT[ZHI.indexOf(x.branch)])===t.relative;}):[];
      return {role:t.role,relative:t.relative,selector:t.selector,value:t.value,priority:t.priority,intent:t.intent,status:hiddenOnly?(found.length?'hidden-only':'absent'):found.length===1?'unique':found.length?'multiple':'absent',candidates:found,
        calendarAlternatives:calendarAlternatives,selection:hiddenOnly?null:found.length===1?found[0].position:null,
        policy:'明現與伏神分開；伏神保留飛伏出伏條件。人物／世應與事情用神分層，不以世應替代事情六親。'};
    });
    var influences=targets.map(function(t){return {relative:t.relative,role:t.role,priority:t.priority,candidates:t.candidates.map(function(u){return {position:u.position,hidden:u.hidden,branch:u.branch,target:u.hidden?{function:t.priority==='primary'?'用神':t.role,relative:t.relative,position:u.position,branch:u.branch,element:u.element,hidden:true,flightRelation:u.flightRelation,flightAssessment:u.flightAssessment}:null,
      network:lines.map(function(l){var rel=relation(l.element,u.element),chou=CONTROLS[l.element]===Object.keys(GENERATES).find(function(e){return GENERATES[e]===u.element;});return {position:l.position,relative:l.relative,
        function:l.position===u.position&&!u.hidden?(t.priority==='primary'?'用神':t.role):rel==='生'?'元神':rel==='克'?'忌神':chou?'仇神':rel==='比和'?'同氣':'其他',
        movement:l.moving?'明動':assessments[l.position-1].dayEffect==='hidden-movement'?'暗動':'靜',availability:assessments[l.position-1].availability,
        transition:l.transition,obstacles:assessments[l.position-1].obstacles};})};})};});
    var combinations=[['申','子','辰','水'],['巳','酉','丑','金'],['寅','午','戌','火'],['亥','卯','未','木']].map(function(g){
      var members=lines.filter(function(l){return g.slice(0,3).includes(l.branch);}),missing=g.slice(0,3).filter(function(b){return !members.some(function(l){return l.branch===b;});}),active=members.filter(function(l){return l.moving||assessments[l.position-1].dayEffect==='hidden-movement';});
      var conditions=members.flatMap(function(l){return assessments[l.position-1].obstacles.map(function(s){return l.label+' '+s;});});
      return {name:g.slice(0,3).join('')+'三合'+g[3],element:g[3],positions:members.map(function(l){return l.position;}),missing:missing,
        status:missing.length?'incomplete':active.length===0?'static-background':conditions.length?'conditional-structure':'structure-present',
        activePositions:active.map(function(l){return l.position;}),conditions:conditions,
        policy:'依《增刪卜易》三合章：本卦三支俱全且至少一爻明動或暗動，列為動局候選；一支旬空或月破則保留待填／出月條件。三支皆靜只作靜態背景；缺支不借無關變爻拼局；不直接宣告化氣。'};
    }).filter(function(g){return g.positions.length>=2;});
    // Original/changed combinations are restricted to the two moving end rows
    // of an inner or outer trigram, not arbitrary static transformed rows.
    [0,3].forEach(function(start){var ends=[lines[start],lines[start+2]];if(!ends.every(function(l){return l.moving;}))return;
      [['申','子','辰','水'],['巳','酉','丑','金'],['寅','午','戌','火'],['亥','卯','未','木']].forEach(function(g){
        if(!ends.every(function(l){return g.slice(0,3).includes(l.branch);}))return;
        var branches=ends.map(function(l){return l.branch;}),missing=g.slice(0,3).filter(function(b){return !branches.includes(b);});
        if(missing.length!==1||!ends.some(function(l){return l.changed.branch===missing[0];}))return;
        combinations.push({name:g.slice(0,3).join('')+'三合'+g[3],element:g[3],positions:ends.map(function(l){return l.position;}),changedPositions:ends.filter(function(l){return l.changed.branch===missing[0];}).map(function(l){return l.position;}),status:'transformed-structure',conditions:ends.flatMap(function(l){return assessments[l.position-1].obstacles;}),policy:'增刪內初三／外四六爻動化出第三支的指定支線；成象不直接等於成化。'});
      });
    });
    var transformed=[];
    [0,3].forEach(function(start){var a=lines.slice(start,start+3),changed=a.some(function(l){return l.moving;});if(!changed)return;
      if(a.every(function(l){return branchLinks(l.branch,l.changed.branch).same;}))transformed.push({name:(start?'外卦':'內卦')+'伏吟',positions:a.map(function(l){return l.position;}),kind:'repeated-branches'});
      if(a.every(function(l){return branchLinks(l.branch,l.changed.branch).clash;}))transformed.push({name:(start?'外卦':'內卦')+'反吟',positions:a.map(function(l){return l.position;}),kind:'opposed-branches'});
    });
    var window=parseWindow(result.question,date,input.timeWindow),timing={window:window,status:window.status,candidates:[],policy:'條件觸發日，不是事件保證；多用神未定者不合併成唯一日期。日界沿用起卦設定，交節日须按瞬間核月。'};
    if(window.status==='bounded'){
      var offset=date.timezoneOffset==null?8:date.timezoneOffset;
      // 先讀窗外前一日的實際曆法，避免指定起始日已過交節／出旬，
      // 卻因 previous 為 null 而誤把查詢視窗第一天叫作「首次進入」。
      var prior=new Date(window.startMs-86400000);
      var previous=calendar({year:prior.getUTCFullYear(),month:prior.getUTCMonth()+1,day:prior.getUTCDate(),hour:12,minute:0,timezoneOffset:offset,dayBoundaryMode:date.dayBoundaryMode||'MIDNIGHT_00'});
      for(var ms=window.startMs;ms<=window.endMs;ms+=86400000){
        var d=new Date(ms),cal=calendar({year:d.getUTCFullYear(),month:d.getUTCMonth()+1,day:d.getUTCDate(),hour:12,minute:0,timezoneOffset:offset,dayBoundaryMode:date.dayBoundaryMode||'MIDNIGHT_00'}),triggers=[];
        targets.forEach(function(t){t.candidates.forEach(function(u){var l=u.hidden?lines[u.position-1].hidden:lines[u.position-1],links=branchLinks(u.branch,cal.day[1]),s=l.states,why=[];
          var leavesVoid=s.void&&!cal.voidBranches.includes(u.branch)&&(!previous||previous.voidBranches.includes(u.branch));
          var leavesMonth=s.monthBroken&&cal.monthBranch!==date.monthBranch&&(!previous||previous.monthBranch===date.monthBranch);
          if(leavesVoid)why.push('起卦旬空解除候選');
          if(s.monthBroken){if(links.same)why.push('月破逢值');if(links.combine)why.push('月破逢合');if(leavesMonth)why.push('首次進入新節令月');}
          if(l.moving){if(links.same)why.push('動爻逢值');if(links.combine)why.push('動爻逢合');if(l.changed&&cal.day[1]===l.changed.branch)why.push('變支逢值');}
          else{if(links.same)why.push('靜爻逢值');if(links.clash)why.push('靜爻逢沖');}
          if(!u.hidden){var assessment=assessments[u.position-1];assessment.tombs.forEach(function(tomb){if(branchLinks(tomb.branch,cal.day[1]).clash)why.push('沖'+tomb.kind+'候選');});
            if(l.moving&&s.dayCombine&&branchLinks(date.day[1],cal.day[1]).clash)why.push('沖開起卦日合候選');
          }
          if(why.length&&(leavesVoid||leavesMonth||links.same||links.clash||links.combine||why.some(function(w){return /^沖/.test(w);})||(l.changed&&l.moving&&cal.day[1]===l.changed.branch)))triggers.push({relative:t.relative,position:u.position,hidden:u.hidden,reasons:why,conditions:u.hidden?['伏神待出伏'].concat(u.flightAssessment?u.flightAssessment.cautions:[]):assessments[u.position-1].obstacles});
        });});
        if(triggers.length)timing.candidates.push({date:d.toISOString().slice(0,10),day:cal.day,month:cal.month,triggers:triggers});
        previous=cal;
      }
    }
    return {version:'1.0.0',school:'增刪卜易・條件規則',source:RULE_SOURCE,targets:targets,lines:assessments,influences:influences,
      combinations:combinations,transformations:transformed,independentChanges:{soleMoving:result.movingPositions.length===1?result.movingPositions[0]:null,soleStill:result.movingPositions.length===5?lines.find(function(l){return !l.moving;}).position:null},timing:timing,
      decisionPolicy:'結構及作用資料供整體判讀；先取事情／角色，再看元忌作用與解除條件。不把規則命中數當成成功機率。'};
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
    var result={version:'1.2.0',system:'liuyao',method:mode,question:String(input.question||'').trim(),calendar:date,values:values.slice(),records:records,
      original:original,changed:changed,hasChange:code!==changedCode,lines:lines,movingPositions:lines.filter(function(l){return l.moving;}).map(function(l){return l.position;}),
      structures:{sixClash:links.every(function(p){return p.clash;}),sixCombine:links.every(function(p){return p.combine;}),changedSixClash:changedLinks.every(function(p){return p.clash;}),changedSixCombine:changedLinks.every(function(p){return p.combine;})},
      focus:focusFor(input.question,input.focus),policy:{lineOrder:'bottom-up',coinConvention:'字面=2、背面=3；6老陰、7少陽、8少陰、9老陽',relativeBasis:'本卦卦宮五行（變爻亦同）',hiddenRule:'本卦缺六親時，取本宮純卦同位伏神',monthBasis:'節令交節瞬間，不以農曆初一換月',dayClash:'interpretation.lines 依動靜與月日生扶分類，矛盾不硬判',prediction:'傳統象徵解讀，不是現實事件的保證'}};
    result.interpretation=interpretation(result,input);
    return freeze(result);
  }
  var api={version:'1.2.0',hexagram:hexagram,najia:najia,relative:relative,relation:relation,voidBranches:voidBranches,branchLinks:branchLinks,
    fromCoins:fromCoins,toss:toss,localTimeAt:localTimeAt,calendar:calendar,calculate:calculate,focusFor:focusFor,resolveQuestionIntent:resolveQuestionIntent,
    assessLine:assessLine,lifeStage:lifeStage,parseWindow:parseWindow,interpretation:interpretation,trigramData:copy(TRIGRAMS),labels:LABELS.slice()};
  root.JYLiuyaoCore=freeze(api);
  if(typeof module!=='undefined'&&module.exports)module.exports=root.JYLiuyaoCore;
})(typeof window!=='undefined'?window:globalThis);
