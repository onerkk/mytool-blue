/*! Jingyue nameology · 1.0.0. Native facts first; no fortune/health probabilities. */
(function(root){
  'use strict';
  var GENERATES={木:'火',火:'土',土:'金',金:'水',水:'木'},CONTROLS={木:'土',火:'金',土:'水',金:'木',水:'火'};
  var NUMERALS={一:1,二:2,三:3,四:4,五:5,六:6,七:7,八:8,九:9,十:10};
  var ROLES={天格:'姓氏承接與起點參考；不代指父母命運',人格:'姓名接合與核心做法的傳統象義',地格:'名字組合與實作基礎的傳統象義',外格:'外部互動方式的傳統象義',總格:'全名整合的傳統象義；不指定晚年事件'};
  var MEANINGS={王:'王、君主；常見姓氏',李:'李樹、李子；常見姓氏',張:'張開、伸展；常見姓氏',陳:'排列、陳述；常見姓氏',林:'成片的樹木；常見姓氏',黃:'黃色；常見姓氏',吳:'姓氏；古國名',劉:'姓氏',楊:'楊樹；常見姓氏',歐:'姓氏',陽:'陽光、明亮',司:'掌管',馬:'馬；姓氏',諸:'眾、多；姓氏用字',葛:'葛藤；姓氏用字',小:'小、細微',明:'明亮、清楚',文:'文字、文采',華:'花、繁盛、光彩',美:'美好',婷:'姿態美好',安:'安定、平安',宇:'屋簷、空間',軒:'車、敞朗',涵:'包容、涵養',源:'來源、源頭',清:'清澈、清楚',淑:'美好、和善',怡:'愉快、和悅',欣:'喜悅',雅:'雅正、文雅',哲:'明智',智:'智慧',仁:'仁愛',義:'合宜、義理',信:'信用、誠信',德:'品德',志:'志向、意志',宏:'廣大',弘:'廣大、擴充',博:'廣博',睿:'明智、通達',宸:'屋宇；古代帝王居處的稱呼',宥:'寬容',承:'承接、承擔',恩:'恩惠',慈:'慈愛',善:'善良、合宜',樂:'快樂；也有音樂等讀法',靜:'安靜、平穩',月:'月亮、月份',光:'光亮',星:'星辰',晴:'晴朗',雨:'雨水',雪:'雪',云:'說；雲的簡化字',雲:'雲',海:'大海',山:'山',川:'河川',江:'大河；姓氏',河:'河流',沐:'洗髮、潤澤',澤:'水聚之處、恩澤',瀚:'廣大的水域',潤:'滋潤',浩:'水勢浩大',洋:'廣大水域',森:'樹木繁密',柏:'柏樹',桐:'桐樹',梓:'梓樹；木作相關用字',榮:'繁盛、榮譽',萱:'萱草',芷:'香草',芳:'芳香',芸:'香草；除草',蓉:'芙蓉',瑋:'珍奇、美好',瑄:'古代祭祀用玉',瑾:'美玉',瑜:'美玉、美好',璇:'美玉',琪:'美玉',瑞:'吉祥的符號',玥:'古代傳說中的神珠',君:'君子、對人的尊稱',家:'家庭',福:'福祉',祥:'吉祥',穎:'穀物芒端；才智出眾',敏:'敏捷、勤勉',翔:'飛翔',遠:'距離遠、深遠',成:'完成、成就',祐:'輔助、庇佑',佑:'輔助',彥:'有才學的人',庭:'庭院',昱:'日光、明亮',昀:'日光',昕:'黎明',熙:'光明、和樂',煜:'照耀',煒:'光亮',旭:'初升的日光',勇:'勇敢',維:'繫連、維持',銘:'銘記、刻記',鈞:'古代重量單位；敬語',傑:'傑出',倫:'條理、人際關係',子:'子女；尊稱、學問稱號',一:'一、開始',二:'二',三:'三',四:'四',五:'五',六:'六',七:'七',八:'八',九:'九',十:'十'};
  // These are paraphrased lexical notes, separate from numerology and personal intent.
  MEANINGS.政='治理、政務、規則；用名用意須由本人說明';
  MEANINGS.軒='古代車輛、窗或廊室；也有高起之義';
  MEANINGS.淋='用水或其他液體澆灌；姓名讀法須本人確認';
  MEANINGS.鴻='鴻雁；也表示宏大、盛大，另可借指書信';
  MEANINGS.洪='大水；也有大、廣大的意思，亦為姓氏';
  MEANINGS.水='水與液體；也用來稱江河湖海等水域';
  MEANINGS.扁='寬而薄；也有匾額等字義及不同讀法，姓名用意須核對';
  var MEANING_SOURCES={政:'https://dict.variants.moe.edu.tw/dictView.jsp?educode=A01720',軒:'https://dict.variants.moe.edu.tw/dictView.jsp?ID=44309&la=0',淋:'https://dict.variants.moe.edu.tw/dictView.jsp?ID=24038&powerMode=2&q=1',鴻:'https://pedia.cloud.edu.tw/Entry/Detail?title=%E9%B4%BB',洪:'https://pedia.cloud.edu.tw/Entry/Detail?title=%E6%B4%AA',水:'https://pedia.cloud.edu.tw/Entry/Detail?title=%E6%B0%B4',扁:'https://pedia.cloud.edu.tw/Entry/Detail?title=%E6%89%81'};
  var VERSION='20261003-name4';
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
    var d=data().numerology,k=cycle(n),theme=d.themes[k-1],original=d.original&&d.original.rows[k-1];
    if(!original||original.number!==k)throw new Error('81數原著表未核齊，請重新載入姓名資料。');
    return {role:role,num:n,number81:k,numberCycleAudit:{baseNumber:n>=81?(n-1)%80+1:n,alias81:1,source:d.original.cycle.sourceUrl,scope:'1931循環例與1935原著54頁一致：81返1，超81每次減80。81條主題已逐條核對1935原圖46–54頁。'},element:element(n),polarity:n%2?'陽':'陰',level:original.tone,theme:original.theme,focus:original.summary,practice:theme[2],practiceSource:'本站實務建議，與原著摘要分開',originalNumerology:{profile:d.original.profile,...original,scope:d.original.scope},commonModernTable:{level:d.favorable.includes(k)?'偏利':d.mixed.includes(k)?'吉阻並存':'偏阻',theme:theme[0],focus:theme[1],scope:'前版通行三分分類與本站中性主題，保留供版本差異核對，不混作原著斷語'},formula:formula,scope:ROLES[role]};
  }
  function fiveGrids(surname,given, facts,profile){
    if(facts.some(function(f){return f.stroke==null;}))return {status:'incomplete',missing:facts.filter(function(f){return f.stroke==null;}).map(function(f){return f.char;}),reason:'筆畫尚未覆核，五格、三才與筆畫起卦暫不計算。'};
    var s=facts.slice(0,surname.length).map(function(f){return f.stroke;}),g=facts.slice(surname.length).map(function(f){return f.stroke;}),sky=sum(s)+(s.length===1?1:0),person=s[s.length-1]+g[0],earth=sum(g)+(g.length===1?1:0),outer=sky+earth-person,total=sum(s)+sum(g);
    var nums=[numberFact(sky,'天格',s.join('+')+(s.length===1?'+1（單姓虛數）':'')),numberFact(person,'人格',s[s.length-1]+'（姓末字）+'+g[0]+'（名首字）'),numberFact(earth,'地格',g.join('+')+(g.length===1?'+1（單名虛數）':'')),numberFact(outer,'外格',sky+'（天格）+'+earth+'（地格）−'+person+'（人格）'),numberFact(total,'總格',s.concat(g).join('+'))];
    var sc=nums.slice(0,3).map(function(n){return n.element;}),configuration=sc.join(''),registry=root.JYNameSancai,chosen=profile||(registry?'CDI_125':'LEGACY_UNVERIFIED'),legacy=data().traditional._SC[configuration];
    if(chosen!=='LEGACY_UNVERIFIED'&&(!registry||!registry.profiles[chosen]))throw Error('三才版本尚未載入或名稱無效');
    var versions=registry?Object.entries(registry.profiles).map(function(row){return {profile:row[0],name:row[1].name,level:row[1].rows[configuration],source:row[1].source,sourceStatus:'identified-publisher-table-125-entries'};}):[];
    versions.push({profile:'LEGACY_UNVERIFIED',name:'原專案三才表（未核原著）',level:legacy,source:null,sourceStatus:'not-original-source-verified'});
    var selected=versions.find(function(v){return v.profile===chosen;});
    return {status:'complete',grids:nums,sanCai:{elements:sc,configuration:configuration,profile:chosen,level:selected.level,source:selected.source,sourceStatus:selected.sourceStatus,versions:versions,sourceAudit:registry&&registry.audit,relations:[{from:'天格',to:'人格',elements:[sc[0],sc[1]],relation:relation(sc[0],sc[1])},{from:'人格',to:'地格',elements:[sc[1],sc[2]],relation:relation(sc[1],sc[2])}],scope:'數理五行關係；不是八字用神或身體五行。'},yinYang:{sequence:nums.map(function(n){return n.polarity;}),yin:nums.filter(function(n){return n.polarity==='陰';}).length,yang:nums.filter(function(n){return n.polarity==='陽';}).length,scope:'只記奇偶分布；不由陰陽推斷性別、健康或人格。'}};
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
    var writingComplete=facts.every(function(f){return f.modern!=null;}),knownWriting=sum(facts.map(function(f){return f.modern||0;}));
    return {status:'complete',resolution:{reading:letters.every(function(f){return !!f.reading;})?'available':'partial',confirmedReading:letters.every(function(f){return f.confirmed;})?'confirmed':'unconfirmed',meaning:letters.every(function(f){return f.meaning||f.definitionEnglish;})?'available':'partial',writing:writingComplete?'complete':'partial',note:'已完成資料檢查，不表示本人讀音、命名用意與全字拆解都已確認。'},characters:letters,toneSequence:letters.map(function(f){return f.tone||'待核';}),writingStrokes:writingComplete?knownWriting:null,knownWritingStrokes:knownWriting,writingCoverage:writingComplete?'完整':'部分',warnings:Array.from(new Set(warnings)),checks:['用本人慣用語言完整自我介紹，請對方重複名字。','試寫正式署名、小字表單與手機搜尋；繁簡、異體字保留原字形。','檢查姓名連讀諧音、家族命名慣例、現有證件與改名成本；本版不自造諧音。'],scope:'普通話資料不代替台語、客語、粵語或本人慣用讀法；字義不證明本人性格。'};
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
    var pillars=computed.pillars,ps=Array.isArray(pillars)?pillars:pillars?[pillars.year,pillars.month,pillars.day,pillars.hour]:[];
    if(ps.length!==4||ps.some(function(p){return !p||typeof p!=='object'||!p.gan||!p.zhi;}))return {status:'incomplete',reason:'八字來源未保留完整四柱，不把不完整物件標成已算。'};
    var instant=computed.calculationPolicy&&computed.calculationPolicy.birthInstant;
    if(instant){var expected=Date.parse(birth.civilDate+'T'+input.birthTime+':00Z')-Number(input.timezoneOffset==null?8:input.timezoneOffset)*3600000;if(Date.parse(instant)!==expected)throw new Error('八字實算出生瞬間與本次姓名生辰不同，請重新計算，不可套用舊命盤。');}
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
    var facts=s.concat(g).map(function(ch){return lookup(ch,{strokeBasis:basis,numericPolicy:input.numericPolicy,overrides:input.overrides});}),birth=dateFacts(input.birthDate),five=fiveGrids(s,g,facts,input.sancaiProfile);
    var alternateFacts=s.concat(g).map(function(ch){return lookup(ch,{strokeBasis:basis==='kangxi'?'modern':'kangxi',numericPolicy:input.numericPolicy});}),alternate=fiveGrids(s,g,alternateFacts,input.sancaiProfile);
    var differences=facts.filter(function(f){return f.kangxi!=null&&f.modern!=null&&f.kangxi!==f.modern;}).map(function(f){return {char:f.char,kangxi:f.kangxi,modern:f.modern};});
    var result={schema:'jy.name/1',version:VERSION,name:s.concat(g).join(''),surname:s.join(''),given:g.join(''),purpose:input.purpose||'personal',question:String(input.question||'請完整分析這個姓名的使用適合度及各派支持與牽制。').trim(),purpose:input.purpose||'personal',inputPolicy:{split:'使用者分欄明示姓與名，不自動猜複姓',strokeBasis:basis,numericPolicy:input.numericPolicy||'glyph',sancaiProfile:five.status==='complete'?five.sanCai.profile:input.sancaiProfile||'CDI_125',numberCycle:data().numerology.policy,strokeSource:basis==='kangxi'?data().meta.kangxiPolicy:data().meta.modernPolicy,unknown:data().meta.unknownPolicy,birthTimePrecision:input.birthTime?'民用時間至分鐘':'未提供',trueSolarTime:false},characters:facts,birth:birth,fiveGrids:five,strokeSensitivity:{differences:differences,alternateBasis:basis==='kangxi'?'modern':'kangxi',alternateFiveGrids:alternate,status:differences.length?'兩套筆畫會改變部分數理，分開比較，不互相加權':'已知字表未見兩口徑差異；使用者覆核仍須另核'},zodiac:zodiacFacts(birth,facts,s.length),phonetic:phonetic(facts),nameGua:gua(facts,s.length),bazi:baziFacts(birth,input,options.bazi),shapeElementPolicy:{name:'本版明列字形取象參照',roots:SHAPE_ELEMENTS,scope:'依已收錄字根或字典部首比對；只作象徵方向，不是唯一字五行。玉、日、月及其他多派有分歧的字根不自行配五行；未命中不是五行缺額。音韻、字義及數理五行分開，不混表。'},methodBoundaries:{enabled:['五格81數理','三才五行與陰陽','音形字義','生肖形義（需生辰）','八字取向（需完整生時及實算）','筆畫姓名易卦'],notClaimed:['河洛專盤未具起例，不冒稱已算','音韻五行多表不一，未選定資料不自造','奇門、紫微姓名派需其專盤；不借其他盤假裝完整']},sources:data().meta.sources};
    facts.forEach(function(f){if(!input.overrides||!input.overrides[f.char]||!input.overrides[f.char].meaning){if(MEANING_SOURCES[f.char]){f.meaningSource='本站依教育部字典整理的字義摘要，非逐字引文';f.meaningUrl=MEANING_SOURCES[f.char];}}});
    result.bazi.characterAlignment=facts.map(function(f){return {char:f.char,coverage:f.rootCoverage,references:f.elementReferences,fuyiMatches:f.elementReferences.filter(function(e){return result.bazi.status==='complete'&&Array.isArray(result.bazi.favored)&&result.bazi.favored.includes(e.element);}).map(function(e){return e.element;}),seasonalCandidates:f.elementReferences.filter(function(e){return result.bazi.status==='complete'&&result.bazi.tiaohou&&Array.isArray(result.bazi.tiaohou.need)&&result.bazi.tiaohou.need.includes(e.element);}).map(function(e){return e.element;}),seasonalConditionMatches:((result.bazi.seasonalAssessment||{}).stems||[]).filter(function(stem){return f.elementReferences.some(function(e){return e.element===stem.element;});}),scope:'字根五行與候選天干同五行，不代表此字就是該天干；已透、藏支、未見與受制須分開。不把已有癸水等同還要補水；調候候選不等於最終喜用。'};});
    result.strokeSensitivity.alternateCharacters=alternateFacts;
    result.strokeSensitivity.alternateNameGua=gua(alternateFacts,s.length);
    result.strokeSensitivity.selectedVersusAlternate=facts.map(function(f,i){return {char:f.char,selected:f.stroke,selectedSource:f.strokeSource,alternate:alternateFacts[i].stroke,alternateSource:alternateFacts[i].strokeSource,changed:f.stroke!==alternateFacts[i].stroke};});
    result.strokeSensitivity.manualReviews=facts.filter(function(f){return f.strokeSource.indexOf('使用者覆核')===0;}).map(function(f){return {char:f.char,selected:f.stroke,dictionarySelected:basis==='kangxi'?f.kangxi:f.modern,source:f.strokeSource};});
    result.strokeSensitivity.policy='主要口徑定判讀，另一口徑只檢查結果依賴哪些字與規則；差異大不自動較差，也不是第二次獨立命運驗證。現代實際書寫與康熙數理總數分開。';
    result.evidenceCoverage={phonetic:result.phonetic.resolution,zodiac:{year:result.zodiac.status,characters:facts.map(function(f){return {char:f.char,rootCoverage:f.rootCoverage};}),note:'已查生肖規則不等於完成每字全部拆解；相反字根不按條數相抵。'},bazi:{chart:result.bazi.status,nameElement:'僅明列字根取象，非唯一字五行或實際補運'},stroke:five.status};
    result.coverage={fiveGrids:five.status,sanCai:five.status,yinYang:five.status,zodiac:result.zodiac.status,bazi:result.bazi.status,phonetic:result.phonetic.status,nameGua:result.nameGua.status};
    return result;
  }
  function splitReference(value,surname,source,label){
    var s,g;
    if(value&&typeof value==='object'){s=String(value.surname||surname||'').trim();g=String(value.given||'').trim();}
    else {
      var full=String(value||'').replace(/\s+/g,'');s=String(surname||'').trim();
      if(!full.startsWith(s))throw new Error('比較基準「'+full+'」與姓氏欄不同；請明列基準姓／名，不能猜單姓或複姓。');
      g=full.slice(s.length);
    }
    if(chars(s).length<1||chars(s).length>2||chars(g).length<1||chars(g).length>3||!chars(s+g).every(function(ch){return /\p{Script=Han}/u.test(ch);}))throw new Error('比較基準請填完整漢字姓名；姓1–2字、名1–3字。');
    return {name:s+g,surname:s,given:g,source:source,label:label||'比較基準'};
  }
  function resolveBaseline(input){
    input=input||{};var q=String(input.question||''),mentions=[],warnings=[];
    // Explicit labels only. An unrelated person or an unlabelled string is never a baseline.
    var re=/(現名|原名|舊名|本名|曾用名|現用姓名|現在(?:的)?(?:姓名|名字)|目前(?:的)?(?:姓名|名字)|原本(?:的)?(?:姓名|名字))\s*(?:[:：=]|是|為|叫)?\s*([「『“"]?)([\p{Script=Han}]{2,})(?=$|[」』”"\s，,。；;！？?])/gu,m;
    while((m=re.exec(q))){
      var token=m[3],original=token;
      if(!m[2]){
        token=token.split(/比較|相比|還是|哪個|哪一個|那個|是否|值不值得/)[0];
        if(/(?:比|比起|勝過|優於)\s*$/.test(q.slice(0,m.index)))token=token.replace(/(?:更)?(?:好|適合|合適)(?:嗎|呢)?$/,'');
      }
      var mention=splitReference(token,input.surname,'question_explicit_label',m[1]);
      if(token!==original)mention.boundary={source:original,name:token,policy:'按明示比較述語分開姓名與問句；引號內姓名不刪字。'};
      mentions.push(mention);
    }
    var explicit=input.baseline||input.baselineName||input.currentName||input.originalName;
    var selected=explicit?splitReference(explicit,input.baselineSurname||input.surname,'baseline_field',input.baselineLabel||(input.originalName?'原名':'現名／原名比較基準')):null;
    var unique=Array.from(new Set(mentions.map(function(x){return x.name;})));
    if(selected){
      if(unique.length===1&&unique[0]!==selected.name)throw new Error('比較基準欄「'+selected.name+'」與問題中的「'+unique[0]+'」不一致，請先統一。');
      if(unique.length>1&&!unique.includes(selected.name))throw new Error('問題提到多個原名／現名，且均與基準欄不同，請明列這次要比較的基準。');
      if(unique.length>1)warnings.push('問題另提其他歷史姓名；本次以明示基準欄「'+selected.name+'」為比較對象，其他姓名不冒充已計算的對照組。');
    } else if(unique.length===1)selected=mentions[0];
    var requested=!!explicit||mentions.length>0||/(?:比.{0,16}(?:現在|目前|現名|原名|舊名)|(?:現在|目前|現有|原來)(?:的)?(?:姓名|名字)|原名|舊名|現名)/.test(q);
    return {status:selected?'resolved':unique.length>1?'ambiguous':requested?'missing':'not_requested',requested:requested,selected:selected,mentions:mentions,warnings:warnings,reason:selected?null:unique.length>1?'問題明列多個不同基準，請在現名／原名欄選定本次比較對象。':requested?'原問句要和原名／現名比較，但沒有可核的完整基準姓名。':'本次只比較明列候選，未要求既有姓名對照。'};
  }
  function directionFacts(sc){
    return sc.relations.map(function(r){var a=r.elements[0],b=r.elements[1];return Object.assign({},r,{statement:a===b?a+'與'+b+'比和':GENERATES[a]===b?a+'生'+b:GENERATES[b]===a?b+'生'+a:CONTROLS[a]===b?a+'剋'+b:b+'剋'+a});});
  }
  function pairFacts(base,candidate){
    var a=base.fiveGrids,b=candidate.fiveGrids,gridReady=a.status==='complete'&&b.status==='complete';
    var letters=[],aa=base.characters,bb=candidate.characters;
    for(var i=0;i<Math.max(aa.length,bb.length);i++){if(!aa[i]||!bb[i]||aa[i].char!==bb[i].char)letters.push({position:i+1,baseline:aa[i]||null,candidate:bb[i]||null});}
    var writingReady=base.phonetic.writingCoverage==='完整'&&candidate.phonetic.writingCoverage==='完整';
    return {baseline:base.name,candidate:candidate.name,sameName:base.name===candidate.name,changedCharacters:letters,
      fiveGrids:{status:gridReady?'complete':'incomplete',changes:gridReady?a.grids.map(function(g,i){var to=b.grids[i];return {role:g.role,unchanged:g.num===to.num,baseline:{num:g.num,element:g.element,level:g.level,theme:g.theme},candidate:{num:to.num,element:to.element,level:to.level,theme:to.theme},difference:to.num-g.num};}):[],scope:'只列真實差異；共同姓氏與未變格數不當候選新增優勢。差值是格數差，不是運勢改善分數。'},
      sanCai:{status:gridReady?'complete':'incomplete',baseline:gridReady?{configuration:a.sanCai.configuration,profile:a.sanCai.profile,level:a.sanCai.level,source:a.sanCai.source,versions:a.sanCai.versions,relations:directionFacts(a.sanCai)}:null,candidate:gridReady?{configuration:b.sanCai.configuration,profile:b.sanCai.profile,level:b.sanCai.level,source:b.sanCai.source,versions:b.sanCai.versions,relations:directionFacts(b.sanCai)}:null},
      phonetic:{baseline:base.phonetic,candidate:candidate.phonetic,writingDifference:writingReady?candidate.phonetic.writingStrokes-base.phonetic.writingStrokes:null,scope:'使用現代字形核實書寫成本；未確認讀法不能定為本人聲調或實際諧音。'},
      zodiac:{baseline:base.zodiac,candidate:candidate.zodiac,scope:'共用生肖年；只比較實際改字的命中字根。相反字根不能按條數補回或抵銷。'},
      bazi:{sharedChart:base.bazi.status==='complete'&&candidate.bazi.status==='complete',baselineAlignment:base.bazi.characterAlignment,candidateAlignment:candidate.bazi.characterAlignment,scope:'同一生辰只有一個原局，不因名字不同重算強弱。調候候選與已存在的天干條件一起看；沒有最終取用就保留該層，其他層仍可比較。'},
      nameGua:{baseline:base.nameGua,candidate:candidate.nameGua,scope:'本卦、動爻與之卦按固定姓名起例解釋；之卦某句不能單獨否決名字，不視為改名後事件預測。'},
      strokeSensitivity:{baseline:base.strokeSensitivity,candidate:candidate.strokeSensitivity,scope:'比較依賴的筆畫口徑，不把口徑差異當好壞或獨立加權。'}};
  }
  function questionModel(question,reference,candidates){
    var baseline=reference.selected,comparisonRequested=reference.requested||candidates.length>1||/比較|比.{0,18}(?:好|適合|合適)|哪[個一]|何者|改名|換名/.test(question);
    var assumptions=[];
    if(/那個|那个/.test(question)&&comparisonRequested)assumptions.push({type:'contextual_choice_reading',source:'那個',interpretation:'比較語境暫按「哪個候選」理解；原問句保持不變',status:'explicitly_marked'});
    return {schema:'jy.question_model/1',status:reference.status==='ambiguous'?'name_baseline_ambiguous':'name_context_bound',sourceQuestion:question,
      queryIntent:{shape:comparisonRequested?'comparison':'single_name',operatorFocus:comparisonRequested?'compare_names':'analyze_name',domains:['name_usage'],explicitTime:[],note:'「現名／現在名字」指比較基準，不當成流年時限；姓名不解析為未知人物心意。'},
      events:[{id:'NAME_QUERY',source:question,type:comparisonRequested?'name_comparison':'name_analysis',queryOperator:comparisonRequested?'compare_names':'describe_name_usage',comparison:comparisonRequested?{left:candidates.slice(),right:baseline?baseline.name:null,operator:'prefer_for_stated_use',criterion:'本次用途、字義音形、同口徑各法取捨'}:null,requiredObservables:comparisonRequested?['baseline_facts','each_candidate_facts','pairwise_tradeoffs','selection_conditions']:['name_facts','usage_tradeoffs']}],
      unresolved:{assumptions:assumptions,baselineStatus:reference.status,language:reference.reason?[reference.reason]:[],notes:reference.warnings.slice()},
      validation:{sourceQuestionPreserved:true,baselineBound:!!baseline,candidatesBound:candidates.length>0,provenance:'本頁明列候選與原問句明示姓名／基準欄，不讀記憶；未聲稱通用語義圖已完整驗證。'}};
  }
  function assembleComparison(input,candidateResults,reference,base){
    var candidates=candidateResults.map(function(n){return n.name;}),names=base?[base].concat(candidateResults.filter(function(n){return n.name!==base.name;})):candidateResults.slice();
    names=names.map(function(n){return Object.assign({},n,{comparisonRole:base&&n.name===base.name?candidates.includes(n.name)?'baseline_and_candidate':'baseline':'candidate'});});
    var complete=base&&names.every(function(n){return n.fiveGrids.status==='complete'&&n.nameGua.status==='complete';});
    var question=String(input.question||'請按相同標準比較這些姓名的適合度、優勢、代價與待核條件。');
    var result={schema:'jy.name-comparison/1',version:VERSION,question:question,surname:input.surname,purpose:input.purpose||'personal',
      policy:'原名／現名與每一候選共用本次生辰、筆畫、數字規則及用途；基準姓名完整實算並包含在names。不把不同派吉凶加成總分或事件機率。',
      baseline:base?Object.assign({},reference.selected,{nameIndex:0,status:'computed'}):null,baselineResolution:reference,candidateNames:candidates,names:names,
      comparison:{status:base?(complete?'ready':'partial'):reference.status==='ambiguous'?'ambiguous_baseline':reference.requested?'missing_baseline':'candidates_only',baselineName:base?base.name:null,candidateNames:candidates,
        methodMatrix:names.map(function(n){return {name:n.name,role:n.comparisonRole,calculation:n.coverage,verification:n.evidenceCoverage||null};}),
        pairs:base?candidateResults.map(function(n){return pairFacts(base,n);}):[],scope:'ready只表示筆畫主算與姓名卦可比，讀音、字義用意、拆字與取用的覆核狀態另外保留；不等於所有流派認定更好。'},
      criteria:['本人用意與字義','實際稱呼、讀音歧義','字形辨識與現代書寫成本','同一筆畫體系五格、三才與人工覆核','生肖形義與八字各自條件','固定姓名卦與同源資料限制','使用情境、家族慣例及更換成本'],
      decisionPolicy:{defaultPriority:'使用者明示用途與不可接受的條件優先；未提供時按字義音形與實際使用先行，再合讀傳統象義，明說此為實務預設。',requiredAnswers:['每個候選相對基準在哪些面向較好、較差或尚未確認','候選內部首選與足以取代基準是兩個不同結論','是否值得改名、保留哪個字或要再找新候選','最強反證與會改判的可核條件'],prohibited:['吉數多即全面較好','口徑差異大即較差','生肖吉根抵銷凶根','之卦一句定終身','同源五格三才姓名卦重複投票','未提供本人偏好卻宣稱絕對排名']}};
    result.questionModel=questionModel(question,reference,candidates);return result;
  }
  function compare(input,options){
    input=input||{};options=options||{};
    if(!Array.isArray(input.candidates)||!input.candidates.length||input.candidates.length>5)throw new Error('請提供1–5個候選名字；比較基準另外保留，不佔候選名額。');
    var seen=new Set(),reference=resolveBaseline(input);
    var results=input.candidates.map(function(given){given=String(given).trim();if(seen.has(given))throw new Error('候選名字重複，請保留不同的名字。');seen.add(given);return analyze(Object.assign({},input,{given:given}),options);});
    var base=reference.selected?(results.find(function(n){return n.name===reference.selected.name;})||analyze(Object.assign({},input,{surname:reference.selected.surname,given:reference.selected.given}),options)):null;
    return assembleComparison(input,results,reference,base);
  }
  function evaluate(input,options){
    input=input||{};
    if(Array.isArray(input.candidates)&&input.candidates.length)return compare(input,options);
    var ref=resolveBaseline(input);
    if(ref.requested)return compare(Object.assign({},input,{candidates:[input.given]}),options);
    return analyze(input,options);
  }
  // Rehydrate older exported facts without asking the reader to calculate a missing baseline.
  function completePayload(payload){
    if(!payload||!['jy.name/1','jy.name-comparison/1'].includes(payload.schema))throw new Error('請先完成本次姓名分析。');
    if(payload.version===VERSION&&payload.comparison){
      if(payload.baseline&&!payload.names.some(function(n){return n.name===payload.baseline.name;}))throw new Error('比較基準的完整計算遺失，請重新分析，不可匯出殘缺比較。');
      return payload;
    }
    var names=payload.names||[payload],first=names[0],policy=first.inputPolicy||{},overrides={};
    names.forEach(function(n){if(n.inputPolicy.strokeBasis!==policy.strokeBasis||n.inputPolicy.numericPolicy!==policy.numericPolicy||n.inputPolicy.sancaiProfile!==policy.sancaiProfile||JSON.stringify(n.birth)!==JSON.stringify(first.birth))throw new Error('姓名對照口徑或生辰不同，請重新以同一設定計算。');n.characters.forEach(function(f){var o=overrides[f.char]||{};if(f.strokeSource.indexOf('使用者覆核')===0){if(o.stroke!=null&&o.stroke!==f.stroke)throw new Error('同字覆核筆畫矛盾，請先核對。');o.stroke=f.stroke;}if(f.reading)o.reading=f.reading;if(f.meaningSource==='使用者明示')o.meaning=f.meaning;overrides[f.char]=o;});});
    var input={surname:first.surname,given:first.given,candidates:names.map(function(n){return n.given;}),question:payload.question,purpose:payload.purpose||first.purpose,strokeBasis:policy.strokeBasis,numericPolicy:policy.numericPolicy,sancaiProfile:policy.sancaiProfile,birthDate:first.birth&&first.birth.civilDate,birthTime:first.bazi&&first.bazi.civilTime,timezoneOffset:first.bazi&&first.bazi.timezoneOffset,overrides:overrides};
    var reference=resolveBaseline(input);if(payload.schema==='jy.name/1'&&!reference.requested)return payload;
    var chart=first.bazi&&first.bazi.status==='complete'?Object.assign({},first.bazi,{fav:first.bazi.favored,unfav:first.bazi.unfavored}):null;
    var base=reference.selected?(names.find(function(n){return n.name===reference.selected.name;})||analyze(Object.assign({},input,{surname:reference.selected.surname,given:reference.selected.given}),{bazi:chart})):null;
    return assembleComparison(input,names,reference,base);
  }
  var api={version:VERSION,lookup:lookup,analyze:analyze,compare:compare,evaluate:evaluate,resolveBaseline:resolveBaseline,completePayload:completePayload,dateFacts:dateFacts,cycle:cycle,element:element,relation:relation};
  root.JYNameEngine=Object.freeze(api);if(typeof module==='object'&&module.exports)module.exports=api;
})(globalThis);
