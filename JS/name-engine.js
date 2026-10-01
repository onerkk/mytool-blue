/*! Jingyue nameology · 1.0.0. Native facts first; no fortune/health probabilities. */
(function(root){
  'use strict';
  var GENERATES={木:'火',火:'土',土:'金',金:'水',水:'木'},CONTROLS={木:'土',火:'金',土:'水',金:'木',水:'火'};
  var NUMERALS={一:1,二:2,三:3,四:4,五:5,六:6,七:7,八:8,九:9,十:10};
  var ROLES={天格:'姓氏承接與起點參考；不代指父母命運',人格:'姓名接合與核心做法的傳統象義',地格:'名字組合與實作基礎的傳統象義',外格:'外部互動方式的傳統象義',總格:'全名整合的傳統象義；不指定晚年事件'};
  var MEANINGS={王:'王、君主；常見姓氏',李:'李樹、李子；常見姓氏',張:'張開、伸展；常見姓氏',陳:'排列、陳述；常見姓氏',林:'成片的樹木；常見姓氏',黃:'黃色；常見姓氏',吳:'姓氏；古國名',劉:'姓氏',楊:'楊樹；常見姓氏',歐:'姓氏',陽:'陽光、明亮',司:'掌管',馬:'馬；姓氏',諸:'眾、多；姓氏用字',葛:'葛藤；姓氏用字',小:'小、細微',明:'明亮、清楚',文:'文字、文采',華:'花、繁盛、光彩',美:'美好',婷:'姿態美好',安:'安定、平安',宇:'屋簷、空間',軒:'車、敞朗',涵:'包容、涵養',源:'來源、源頭',清:'清澈、清楚',淑:'美好、和善',怡:'愉快、和悅',欣:'喜悅',雅:'雅正、文雅',哲:'明智',智:'智慧',仁:'仁愛',義:'合宜、義理',信:'信用、誠信',德:'品德',志:'志向、意志',宏:'廣大',弘:'廣大、擴充',博:'廣博',睿:'明智、通達',宸:'屋宇；古代帝王居處的稱呼',宥:'寬容',承:'承接、承擔',恩:'恩惠',慈:'慈愛',善:'善良、合宜',樂:'快樂；也有音樂等讀法',靜:'安靜、平穩',月:'月亮、月份',光:'光亮',星:'星辰',晴:'晴朗',雨:'雨水',雪:'雪',云:'說；雲的簡化字',雲:'雲',海:'大海',山:'山',川:'河川',江:'大河；姓氏',河:'河流',沐:'洗髮、潤澤',澤:'水聚之處、恩澤',瀚:'廣大的水域',潤:'滋潤',浩:'水勢浩大',洋:'廣大水域',森:'樹木繁密',柏:'柏樹',桐:'桐樹',梓:'梓樹；木作相關用字',榮:'繁盛、榮譽',萱:'萱草',芷:'香草',芳:'芳香',芸:'香草；除草',蓉:'芙蓉',瑋:'珍奇、美好',瑄:'古代祭祀用玉',瑾:'美玉',瑜:'美玉、美好',璇:'美玉',琪:'美玉',瑞:'吉祥的符號',玥:'古代傳說中的神珠',君:'君子、對人的尊稱',家:'家庭',福:'福祉',祥:'吉祥',穎:'穀物芒端；才智出眾',敏:'敏捷、勤勉',翔:'飛翔',遠:'距離遠、深遠',成:'完成、成就',祐:'輔助、庇佑',佑:'輔助',彥:'有才學的人',庭:'庭院',昱:'日光、明亮',昀:'日光',昕:'黎明',熙:'光明、和樂',煜:'照耀',煒:'光亮',旭:'初升的日光',勇:'勇敢',維:'繫連、維持',銘:'銘記、刻記',鈞:'古代重量單位；敬語',傑:'傑出',倫:'條理、人際關係',子:'子女；尊稱、學問稱號',一:'一、開始',二:'二',三:'三',四:'四',五:'五',六:'六',七:'七',八:'八',九:'九',十:'十'};
  var VERSION='20261001-name1';
  var SHAPE_ELEMENTS={木:['木','艹','艸','竹'],火:['火','灬'],土:['土','山','石'],金:['金','釒','钅'],水:['水','氵','冫']};
  function data(){if(!root.JYNameData)throw new Error('姓名字表尚未準備完成，請重試。');return root.JYNameData;}
  function chars(value){return Array.from(String(value||'').trim());}
  function sum(a){return a.reduce(function(s,n){return s+n;},0);}
  function cycle(n){while(n>81)n-=80;return n;}
  function element(n){return ['水','木','木','火','火','土','土','金','金','水'][n%10];}
  function relation(a,b){return a===b?'比和':GENERATES[a]===b?'相生':CONTROLS[a]===b?'相剋':GENERATES[b]===a?'被生':'被剋';}
  function dateFacts(date){
    if(!date)return null;
    if(!/^\d{4}-\d{2}-\d{2}$/.test(date))throw new Error('請填完整的出生日期。');
    var p=date.split('-').map(Number),d=new Date(Date.UTC(p[0],p[1]-1,p[2]));
    if(p[0]<1900||p[0]>2100||d.getUTCFullYear()!==p[0]||d.getUTCMonth()+1!==p[1]||d.getUTCDate()!==p[2])throw new Error('出生日期不存在，或超出1900–2100支援範圍。');
    var solar=root.Solar||(root.Lunar&&root.Lunar.Solar);
    if(!solar||!solar.fromYmd)throw new Error('農曆資料未載入，不能只用公曆年份猜生肖。');
    var lunar=solar.fromYmd(p[0],p[1],p[2]).getLunar(),year=lunar.getYear();
    return {civilDate:date,lunarYear:year,lunarMonth:lunar.getMonth(),lunarDay:lunar.getDay(),zodiac:'鼠牛虎兔龍蛇馬羊猴雞狗豬'.charAt(((year-4)%12+12)%12),yearBoundary:'農曆正月初一；八字年柱另依立春，不混用'};
  }
  function lookup(ch, options){
    options=options||{};var d=data(),r=d.characters[ch],manual=options.overrides&&options.overrides[ch]||{},basis=options.strokeBasis||'kangxi',numeric=options.numericPolicy==='value'&&Object.prototype.hasOwnProperty.call(NUMERALS,ch);
    var stroke=numeric?NUMERALS[ch]:r?r[basis==='modern'?1:0]:null,source=numeric?'使用者選定數字按數值特規':basis==='modern'?'Unicode 17.0 現代筆畫':'Unicode 14.0 康熙部首還原';
    if(manual.stroke!==''&&manual.stroke!=null){var n=Number(manual.stroke);if(!Number.isInteger(n)||n<1||n>64)throw new Error('「'+ch+'」筆畫請填1–64的整數。');stroke=n;source='使用者覆核（'+basis+'）；不冒稱已核字典';}
    var roots=d.traditional.CHAR_ROOTS[ch],decomp=d.traditional.CHAR_DECOMPOSE[ch];
    // A dictionary radical is a partial fact, never a guessed complete decomposition.
    roots=roots?roots.slice():r&&r[2]?[r[2]]:[];
    return {char:ch,stroke:Number.isInteger(stroke)?stroke:null,strokeSource:source,kangxi:r?r[0]:null,modern:r?r[1]:null,kangxiRadicalResidual:r?r[5]:null,radical:r?r[2]:null,readings:r?Array.from(new Set((r[3]+' '+(r[6]||'')).trim().split(/\s+/).filter(Boolean))):[],reading:manual.reading?String(manual.reading).trim():null,readingSource:manual.reading?'使用者明示':'Unicode普通話候選，未確認姓名實際讀法',meaning:manual.meaning?String(manual.meaning).trim():MEANINGS[ch]||null,meaningSource:manual.meaning?'使用者明示':MEANINGS[ch]?'本站字義摘要，須結合用名情境':'未作中文詞義斷言',definitionEnglish:r&&r[4]||null,roots:roots,rootCoverage:d.traditional.CHAR_ROOTS[ch]?'本站明列字根表':'僅字典部首參考，未完成全字拆解',structure:decomp?decomp.struct:null,elementReferences:Object.keys(SHAPE_ELEMENTS).map(function(element){return {element:element,matchedRoots:roots.filter(function(r){return SHAPE_ELEMENTS[element].includes(r);})};}).filter(function(x){return x.matchedRoots.length;})};
  }
  function numberFact(n,role,formula){
    var d=data().numerology,k=cycle(n),theme=d.themes[k-1];
    return {role:role,num:n,number81:k,element:element(n),polarity:n%2?'陽':'陰',level:d.favorable.includes(k)?'偏利':d.mixed.includes(k)?'吉阻並存':'偏阻',theme:theme[0],focus:theme[1],practice:theme[2],formula:formula,scope:ROLES[role]};
  }
  function fiveGrids(surname,given, facts){
    if(facts.some(function(f){return f.stroke==null;}))return {status:'incomplete',missing:facts.filter(function(f){return f.stroke==null;}).map(function(f){return f.char;}),reason:'筆畫尚未覆核，五格、三才與筆畫起卦暫不計算。'};
    var s=facts.slice(0,surname.length).map(function(f){return f.stroke;}),g=facts.slice(surname.length).map(function(f){return f.stroke;}),sky=sum(s)+(s.length===1?1:0),person=s[s.length-1]+g[0],earth=sum(g)+(g.length===1?1:0),outer=sky+earth-person,total=sum(s)+sum(g);
    var nums=[numberFact(sky,'天格',s.join('+')+(s.length===1?'+1（單姓虛數）':'')),numberFact(person,'人格',s[s.length-1]+'（姓末字）+'+g[0]+'（名首字）'),numberFact(earth,'地格',g.join('+')+(g.length===1?'+1（單名虛數）':'')),numberFact(outer,'外格',sky+'（天格）+'+earth+'（地格）−'+person+'（人格）'),numberFact(total,'總格',s.concat(g).join('+'))];
    var sc=nums.slice(0,3).map(function(n){return n.element;});
    return {status:'complete',grids:nums,sanCai:{elements:sc,configuration:sc.join(''),level:data().traditional._SC[sc.join('')],relations:[{from:'天格',to:'人格',elements:[sc[0],sc[1]],relation:relation(sc[0],sc[1])},{from:'人格',to:'地格',elements:[sc[1],sc[2]],relation:relation(sc[1],sc[2])}],scope:'數理五行關係；不是八字用神或身體五行。'},yinYang:{sequence:nums.map(function(n){return n.polarity;}),yin:nums.filter(function(n){return n.polarity==='陰';}).length,yang:nums.filter(function(n){return n.polarity==='陽';}).length,scope:'只記奇偶分布；不由陰陽推斷性別、健康或人格。'}};
  }
  function zodiacFacts(birth, facts, surnameLength){
    if(!birth)return {status:'missing',reason:'未提供完整出生日期，生肖形義尚未啟用。'};
    var rules=data().traditional.ZODIAC_NAME_DB[birth.zodiac];
    var results=facts.map(function(f,i){var hits=[];['like','dislike'].forEach(function(side){rules[side].forEach(function(rule){var matched=rule.roots.filter(function(r){return f.roots.includes(r);});if(matched.length)hits.push({direction:side==='like'?'取象助力':'取象牽制',roots:matched,label:rule.label,reason:rule.reason});});});return {char:f.char,position:i<surnameLength?'姓氏第'+(i+1)+'字':'名字第'+(i-surnameLength+1)+'字',roots:f.roots,coverage:f.rootCoverage,hits:hits};});
    return {status:'complete',zodiac:birth.zodiac,lunarYear:birth.lunarYear,yearBoundary:birth.yearBoundary,characters:results,scope:'生肖形義的民俗取象；同一字根不重複計成獨立證據。字位不指定年齡或性行為；未命中字根不代表不合。'};
  }
  function tone(reading){var m=String(reading||'').match(/[1-5]$/);if(m)return Number(m[0]);var groups=['āēīōūǖ','áéíóúǘ','ǎěǐǒǔǚ','àèìòùǜ'];for(var i=0;i<groups.length;i++)if(Array.from(String(reading)).some(function(ch){return groups[i].includes(ch);}))return i+1;return null;}
  function phonetic(facts){
    var warnings=[],letters=facts.map(function(f){var reading=f.reading||(f.readings.length===1?f.readings[0]:null);if(!reading)warnings.push('「'+f.char+'」'+(f.readings.length>1?'有多個候選讀音，需確認姓名讀法。':'缺少已確認讀音。'));return {char:f.char,reading:reading,candidates:f.readings,confirmed:!!f.reading,tone:tone(reading),meaning:f.meaning,definitionEnglish:f.definitionEnglish};});
    letters.forEach(function(f,i){if(i&&f.reading&&letters[i-1].reading&&f.reading===letters[i-1].reading)warnings.push('「'+letters[i-1].char+f.char+'」連讀同音，請實際試叫確認辨識度。');if(i&&f.tone===3&&letters[i-1].tone===3)warnings.push('有相鄰第三聲；普通話連讀可能變調，需以本人讀法核對。');});
    facts.forEach(function(f){if(f.modern&&f.modern>=20)warnings.push('「'+f.char+'」現代筆畫較多，請試寫小字與電話報名。');if(!f.meaning&& !f.definitionEnglish)warnings.push('「'+f.char+'」缺字義參考，須查字典及本人用意。');});
    return {status:'complete',characters:letters,toneSequence:letters.map(function(f){return f.tone||'待核';}),writingStrokes:sum(facts.map(function(f){return f.modern||0;})),writingCoverage:facts.every(function(f){return f.modern!=null;})?'完整':'部分',warnings:Array.from(new Set(warnings)),checks:['用本人慣用語言完整自我介紹，請對方重複名字。','試寫正式署名、小字表單與手機搜尋；繁簡、異體字保留原字形。','檢查姓名連讀諧音、家族命名慣例、現有證件與改名成本；本版不自造諧音。'],scope:'普通話資料不代替台語、客語、粵語或本人慣用讀法；字義不證明本人性格。'};
  }
  function gua(facts,surnameLength){
    if(facts.some(function(f){return f.stroke==null;}))return {status:'incomplete',reason:'筆畫未核齊，不起姓名卦。'};
    if(!root.JYLiuyaoCore||!root.JYYijingData)return {status:'missing',reason:'卦象或原文資料尚未載入。'};
    var ss=sum(facts.slice(0,surnameLength).map(function(f){return f.stroke;})),gs=sum(facts.slice(surnameLength).map(function(f){return f.stroke;})),upper=ss%8||8,lower=gs%8||8,moving=(ss+gs)%6||6,bits=[7,3,5,1,6,2,4,0],code=(bits[upper-1]<<3)|bits[lower-1],changedCode=code^(1<<(moving-1)),c=root.JYLiuyaoCore,base=c.hexagram(code),changed=c.hexagram(changedCode),text=root.JYYijingData.entries[base.number-1],to=root.JYYijingData.entries[changed.number-1];
    return {status:'complete',method:'姓名筆畫起卦（本版選定口徑）',formula:'姓筆畫總和÷8餘數為上卦；名總和÷8餘數為下卦；全名總和÷6餘數為動爻。餘0作8／6。先天乾1兌2離3震4巽5坎6艮7坤8。',sums:{surname:ss,given:gs,total:ss+gs},upperNumber:upper,lowerNumber:lower,movingLine:moving,original:{number:base.number,name:base.fullName,symbol:base.symbol,lines:base.lines,judgment:text.judgment,image:text.image,line:text.lines[moving-1],source:text.source,revision:text.revision},changed:{number:changed.number,name:changed.fullName,symbol:changed.symbol,lines:changed.lines,judgment:to.judgment,source:to.source,revision:to.revision},scope:'姓名數理的固定文化參照；不是另一次事件起卦，不冒稱河洛、六爻納甲或所有易卦姓名派。不能以固定姓名卦推某年會發生何事。'};
  }
  function baziFacts(birth,input,computed){
    if(!birth)return {status:'missing',reason:'未提供生辰，未推五行喜用，也不以生肖或名字筆畫補用神。'};
    if(!input.birthTime)return {status:'missing',reason:'未提供精確生時，未啟用完整八字用字合參；生肖不受此缺口影響。'};
    if(!computed)return {status:'missing',reason:'八字尚未實算；不由五行數量猜需要補哪個字。'};
    return {status:'complete',civilDate:birth.civilDate,civilTime:input.birthTime,timezoneOffset:Number(input.timezoneOffset==null?8:input.timezoneOffset),yearBoundary:'立春，月柱依節氣；與生肖農曆年界分開',pillars:computed.pillars,dayMaster:computed.dayMaster||computed.dayGan||(computed.pillars&&computed.pillars.day&&computed.pillars.day.gan)||null,strengthAssessment:computed.strengthAssessment||null,structureFacts:computed.structureFacts||null,fuyiAssessment:computed.fuyiAssessment||null,seasonalAssessment:computed.seasonalAssessment||null,favored:computed.fav||null,unfavored:computed.unfav||null,tiaohou:computed.tiaohou||null,calculationPolicy:computed.calculationPolicy?Object.fromEntries(['termTimeBasis','birthInstant','civilTimeStatus','dayBoundaryMode','dayBoundaryLabel','annualBoundary','trueSolarTimeApplied','timezoneId','timezoneOffset','longitude','calendarEngine','calendarEngineVersion','calendarPrecision','calendarFallback','rootScope'].filter(function(k){return k in computed.calculationPolicy;}).map(function(k){return [k,computed.calculationPolicy[k]];})):null,scope:'用既有完整八字原局作條件合參；偏旁五行僅作字義聯想，未計字的唯一五行，名字不改變生辰八字。未實算的字音五行、字義五行不自造；不採缺什麼就補什麼。'};
  }
  function analyze(input,options){
    input=input||{};options=options||{};
    var s=chars(input.surname),g=chars(input.given),basis=input.strokeBasis||'kangxi';
    if(input.birthTime&&(!input.birthDate||!/^([01]\d|2[0-3]):[0-5]\d$/.test(input.birthTime)))throw new Error('出生時間請填24小時制至分鐘，並同時提供完整日期。');
    if(input.timezoneOffset!=null&&(!Number.isFinite(Number(input.timezoneOffset))||Number(input.timezoneOffset)<-12||Number(input.timezoneOffset)>14))throw new Error('出生地UTC時差無效。');
    if(s.length<1||s.length>2||g.length<1||g.length>3)throw new Error('請明列姓（1–2字）與名（1–3字）；複姓請完整放在姓氏欄。');
    if(!['kangxi','modern'].includes(basis)||!['glyph','value'].includes(input.numericPolicy||'glyph'))throw new Error('筆畫口徑無效。');
    if(!s.concat(g).every(function(ch){return /\p{Script=Han}/u.test(ch);}))throw new Error('本版五格支援漢字姓名；標點、空白及英文名請另作音義分析。');
    var facts=s.concat(g).map(function(ch){return lookup(ch,{strokeBasis:basis,numericPolicy:input.numericPolicy,overrides:input.overrides});}),birth=dateFacts(input.birthDate),five=fiveGrids(s,g,facts);
    var alternateFacts=s.concat(g).map(function(ch){return lookup(ch,{strokeBasis:basis==='kangxi'?'modern':'kangxi',numericPolicy:input.numericPolicy});}),alternate=fiveGrids(s,g,alternateFacts);
    var differences=facts.filter(function(f){return f.kangxi!=null&&f.modern!=null&&f.kangxi!==f.modern;}).map(function(f){return {char:f.char,kangxi:f.kangxi,modern:f.modern};});
    var result={schema:'jy.name/1',version:VERSION,name:s.concat(g).join(''),surname:s.join(''),given:g.join(''),purpose:input.purpose||'personal',question:String(input.question||'請完整分析這個姓名的使用適合度及各派支持與牽制。').trim(),purpose:input.purpose||'personal',inputPolicy:{split:'使用者分欄明示姓與名，不自動猜複姓',strokeBasis:basis,numericPolicy:input.numericPolicy||'glyph',numberCycle:data().numerology.policy,strokeSource:basis==='kangxi'?data().meta.kangxiPolicy:data().meta.modernPolicy,unknown:data().meta.unknownPolicy,birthTimePrecision:input.birthTime?'民用時間至分鐘':'未提供',trueSolarTime:false},characters:facts,birth:birth,fiveGrids:five,strokeSensitivity:{differences:differences,alternateBasis:basis==='kangxi'?'modern':'kangxi',alternateFiveGrids:alternate,status:differences.length?'兩套筆畫會改變部分數理，分開比較，不互相加權':'已知字表未見兩口徑差異；使用者覆核仍須另核'},zodiac:zodiacFacts(birth,facts,s.length),phonetic:phonetic(facts),nameGua:gua(facts,s.length),bazi:baziFacts(birth,input,options.bazi),shapeElementPolicy:{name:'本版明列字形取象參照',roots:SHAPE_ELEMENTS,scope:'依已收錄字根或字典部首比對；只作象徵方向，不是唯一字五行。玉、日、月及其他多派有分歧的字根不自行配五行；未命中不是五行缺額。音韻、字義及數理五行分開，不混表。'},methodBoundaries:{enabled:['五格81數理','三才五行與陰陽','音形字義','生肖形義（需生辰）','八字取向（需完整生時及實算）','筆畫姓名易卦'],notClaimed:['河洛專盤未具起例，不冒稱已算','音韻五行多表不一，未選定資料不自造','奇門、紫微姓名派需其專盤；不借其他盤假裝完整']},sources:data().meta.sources};
    result.bazi.characterAlignment=facts.map(function(f){return {char:f.char,coverage:f.rootCoverage,references:f.elementReferences,fuyiMatches:f.elementReferences.filter(function(e){return result.bazi.status==='complete'&&Array.isArray(result.bazi.favored)&&result.bazi.favored.includes(e.element);}).map(function(e){return e.element;}),seasonalCandidates:f.elementReferences.filter(function(e){return result.bazi.status==='complete'&&result.bazi.tiaohou&&Array.isArray(result.bazi.tiaohou.need)&&result.bazi.tiaohou.need.includes(e.element);}).map(function(e){return e.element;}),scope:'調候候選不等於最終喜用；原局中和或取用未定時不判名字補足。'};});
    result.coverage={fiveGrids:five.status,sanCai:five.status,yinYang:five.status,zodiac:result.zodiac.status,bazi:result.bazi.status,phonetic:result.phonetic.status,nameGua:result.nameGua.status};
    return result;
  }
  function compare(input,options){
    if(!Array.isArray(input.candidates)||!input.candidates.length||input.candidates.length>5)throw new Error('請提供1–5個候選名字，全部使用同一姓氏與筆畫口徑。');
    var seen=new Set();var results=input.candidates.map(function(given){given=String(given).trim();if(seen.has(given))throw new Error('候選名字重複，請保留不同的名字。');seen.add(given);return analyze(Object.assign({},input,{given:given}),options);});
    return {schema:'jy.name-comparison/1',version:VERSION,question:String(input.question||'請按相同標準比較這些姓名的適合度、優勢、代價與待核條件。'),surname:input.surname,policy:'同姓、同生辰、同筆畫及數字口徑；不把不同派吉凶加成總分或事件機率。',names:results,criteria:['本人用意與字義','實際稱呼、讀音歧義','字形辨識與書寫成本','五格三才結構與敏感度','生肖形義與八字各自條件','使用情境、家族慣例及更換成本']};
  }
  var api={version:VERSION,lookup:lookup,analyze:analyze,compare:compare,dateFacts:dateFacts,cycle:cycle,element:element,relation:relation};
  root.JYNameEngine=Object.freeze(api);if(typeof module==='object'&&module.exports)module.exports=api;
})(globalThis);
