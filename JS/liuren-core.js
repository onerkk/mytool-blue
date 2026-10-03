/* Jingyue Da Liu Ren — native deterministic chart facts, 20261003liuren3.
 * Nine-gate browser adaptation: d1210182010/daliuren-web-engine,
 * shipan.py 4ad0c57a1508c42b801d2608da0205e9397c1657 (MIT).
 * See data/liuren/REFERENCE-LICENSE.txt. No question-driven chart selection.
 */
(function(root){
  'use strict';
  var VERSION='20261003liuren3',GAN=Array.from('甲乙丙丁戊己庚辛壬癸'),ZHI=Array.from('子丑寅卯辰巳午未申酉戌亥');
  var ELEMENTS=['木','火','土','金','水'],GE=[0,0,1,1,2,2,3,3,4,4],ZE=[4,2,0,0,2,1,1,2,3,3,2,4],JI=[2,4,5,7,5,7,8,10,11,1];
  var GENERALS=['貴人','螣蛇','朱雀','六合','勾陳','青龍','天空','白虎','太常','玄武','太陰','天后'];
  var SHORT=['貴','蛇','雀','合','勾','龍','空','虎','常','玄','陰','后'];
  var NOBLE_DAY=[1,0,11,11,1,0,1,6,5,5],NOBLE_NIGHT=[7,8,9,9,7,8,7,2,3,3];
  var XING=[3,10,5,0,4,8,6,1,2,9,7,11],LU=[2,3,5,6,5,6,8,9,11,0],MA=[2,11,8,5,2,11,8,5,2,11,8,5];
  var QI={'雨水':11,'春分':10,'穀雨':9,'谷雨':9,'小滿':8,'小满':8,'夏至':7,'大暑':6,'處暑':5,'处暑':5,'秋分':4,'霜降':3,'小雪':2,'冬至':1,'大寒':0};
  var JIANG_NAMES=['神后','大吉','功曹','太衝','天罡','太乙','勝光','小吉','傳送','從魁','河魁','登明'];
  function mod(n,m){return (n%m+m)%m;}
  function index(v,arr,label){var i=typeof v==='number'?v:arr.indexOf(v);if(!Number.isInteger(i)||i<0||i>=arr.length)throw new Error(label+'無效，請重新核對。');return i;}
  function ke(a,b){return mod(a+2,5)===b;}
  function relation(a,b){return a===b?'比和':mod(a+1,5)===b?'下生上':mod(b+1,5)===a?'上生下':ke(a,b)?'下賊上':'上剋下';}
  function kin(day,branch){return day===branch?'兄弟':mod(day+1,5)===branch?'子孫':ke(day,branch)?'妻財':ke(branch,day)?'官鬼':'父母';}
  function unique(courses){return courses.filter(function(c,i,a){return a.findIndex(function(x){return x.upper===c.upper;})===i;});}
  function takeTransmissions(g,d,offset){
    var t=function(b){return mod(b+offset,12);},earth=function(b){return mod(b-offset,12);},gy=t(JI[g]),gi=t(gy),zy=t(d),zi=t(zy),yang=g%2===0;
    var courses=[{index:1,lower:GAN[g],lowerBranch:JI[g],lowerElement:GE[g],upper:gy},{index:2,lower:ZHI[gy],lowerBranch:gy,lowerElement:ZE[gy],upper:gi},{index:3,lower:ZHI[d],lowerBranch:d,lowerElement:ZE[d],upper:zy},{index:4,lower:ZHI[zy],lowerBranch:zy,lowerElement:ZE[zy],upper:zi}];
    courses.forEach(function(c){c.relation=relation(c.lowerElement,ZE[c.upper]);});
    var trace=[],depths=[],gate='',type='',selected=[],path=[];
    function follow(first){return [first,t(first),t(t(first))];}
    function compare(candidates){
      var same=candidates.filter(function(c){return c.upper%2===g%2;});
      trace.push({step:'比用',candidates:candidates.map(function(c){return ZHI[c.upper];}),matching:same.map(function(c){return ZHI[c.upper];})});
      if(same.length===1){if(!gate)gate='比用';type='知一';selected=[same[0].index];return follow(same[0].upper);}
      var list=same.length?same:candidates;
      depths=list.map(function(c){var count=0,p=earth(c.upper),steps=[];for(var i=0;i<12;i++){
        var b=mod(p+i,12);if(b===c.upper)break;
        var isThief=ke(c.lowerElement,ZE[c.upper]),hit=isThief?ke(ZE[b],ZE[c.upper]):ke(ZE[c.upper],ZE[b]);
        var stems=GAN.filter(function(_,j){return JI[j]===b&&(isThief?ke(GE[j],ZE[c.upper]):ke(ZE[c.upper],GE[j]));});
        count+=(hit?1:0)+stems.length;steps.push({branch:ZHI[b],branchHit:hit,stemHits:stems});
      }return {course:c.index,branch:ZHI[c.upper],earth:ZHI[p],count:count,steps:steps};});
      var max=Math.max.apply(null,depths.map(function(x){return x.count;})),ties=list.filter(function(_,i){return depths[i].count===max;});
      var winner=ties.length===1?ties[0]:ties.find(function(c){return [2,5,8,11].includes(earth(c.upper));});
      type=ties.length===1?'涉害':winner?'見機':'';
      if(!winner){winner=ties.find(function(c){return [0,3,6,9].includes(earth(c.upper));});if(winner)type='察微';}
      if(!gate)gate='涉害';
      trace.push({step:'涉害',depths:depths.map(function(x){return {branch:x.branch,count:x.count,earth:x.earth};}),tieRule:'深度優先，其次所臨孟、仲；仍等取陽干上／陰支上'});
      if(winner){selected=[winner.index];return follow(winner.upper);}type='復等';return follow(yang?gy:zy);
    }
    function thief(){
      var lows=unique(courses.filter(function(c){return c.relation==='下賊上';})),highs=unique(courses.filter(function(c){return c.relation==='上剋下';})),cs=lows.length?lows:highs;
      trace.push({step:'賊剋',lowerOverUpper:lows.map(function(c){return c.index;}),upperOverLower:highs.map(function(c){return c.index;})});
      if(!cs.length)return null;
      if(cs.length===1){if(!gate)gate='賊剋';type=lows.length?'重審':'元首';selected=[cs[0].index];return follow(cs[0].upper);}return compare(cs);
    }
    if(offset===0){
      gate='伏吟';type=yang?'自任':'自信';var f=(yang||g===1||g===9)?gy:zy,m=XING[f];if(m===f)m=(yang||g===1||g===9)?zy:gy;var end=XING[m];if(end===m||end===f)end=mod(m+6,12);path=[f,m,end];
      trace.push({step:'伏吟',rule:'陽日及乙癸取干上，其餘陰日取支上；循刑，遇自刑與互刑按本版規則改取支／干上或沖'});
    }else if(offset===6){
      gate='返吟';path=thief();if(!path){type='無依';path=[MA[d],zy,gy];trace.push({step:'返吟無剋',rule:'驛馬發用，支上為中、干上為末'});}
    }else{
      path=thief();
      var eight=['甲寅','庚申','丁未','己未'].includes(GAN[g]+ZHI[d]);
      if(!path&&!eight){
        var remote=unique(courses.slice(1).filter(function(c){return ke(ZE[c.upper],GE[g]);})),remoteKind='蒿矢';
        if(!remote.length){remote=unique(courses.slice(1).filter(function(c){return ke(GE[g],ZE[c.upper]);}));remoteKind='彈射';}
        trace.push({step:'遙剋',candidates:remote.map(function(c){return ZHI[c.upper];}),kind:remoteKind});
        if(remote.length){gate='遙剋';if(remote.length===1){type=remoteKind;selected=[remote[0].index];path=follow(remote[0].upper);}else{path=compare(remote);type=remoteKind+'・'+type;}}
      }
      if(!path){
        var count=unique(courses).length;
        if(count===4){gate='昴星';type=yang?'虎視':'冬蛇掩目';path=yang?[t(9),zy,gy]:[earth(9),gy,zy];}
        else if(count===3){gate='別責';type='蕪淫';path=[yang?t(JI[mod(g+5,10)]):mod(d+4,12),gy,gy];}
        else if(eight){gate='八專';type='八專';path=[yang?mod(gy+2,12):mod(zi-2,12),gy,gy];}
        else throw new Error('三傳取法沒有成立；保留輸入，請核對日干支與取課口徑。');
        trace.push({step:gate,distinctCourses:count,rule:type});
      }
    }
    return {courses:courses,transmissions:path,gate:gate,type:type,selectedCourses:selected,trace:trace,depths:depths};
  }
  function chartFromSymbols(input){
    input=input||{};var g=index(input.dayGan,GAN,'日干'),d=index(input.dayZhi,ZHI,'日支'),month=index(input.monthGeneral,ZHI,'月將'),hour=index(input.hourBranch,ZHI,'占時');
    if(g%2!==d%2)throw new Error('日干與日支陰陽不合，請用有效六十甲子。');
    var mode=input.nobleMode||'auto';if(!['auto','day','night'].includes(mode))throw new Error('晝夜設定無效。');
    var daytime=mode==='day'||(mode==='auto'&&hour>=3&&hour<=8),delta=mod(month-hour,12),r=takeTransmissions(g,d,delta),noble=(daytime?NOBLE_DAY:NOBLE_NIGHT)[g],nobleEarth=mod(noble-delta,12),reverse=nobleEarth>=5&&nobleEarth<=10;
    var general=function(b){return mod((reverse?-1:1)*(b-noble),12);},xun=mod(d-g,12),empties=[mod(xun+10,12),mod(xun+11,12)];
    function fact(b){var n=general(b);return {branch:ZHI[b],branchIndex:b,element:ELEMENTS[ZE[b]],general:GENERALS[n],generalShort:SHORT[n],generalIndex:n,kinship:kin(GE[g],ZE[b]),empty:empties.includes(b),hiddenStem:empties.includes(b)?null:GAN[mod(b-xun,12)],earth:ZHI[mod(b-delta,12)],earthIndex:mod(b-delta,12)};}
    var plate=ZHI.map(function(z,b){var upper=mod(b+delta,12);return Object.assign({earth:z,earthIndex:b,earthElement:ELEMENTS[ZE[b]],sky:ZHI[upper],skyIndex:upper,relation:relation(ZE[b],ZE[upper])},fact(upper));});
    var courses=r.courses.map(function(c){return Object.assign({},c,{upper:ZHI[c.upper],upperIndex:c.upper,lowerElement:ELEMENTS[c.lowerElement]},fact(c.upper));});
    var transmissions=r.transmissions.map(function(b,i){return Object.assign({index:i+1,role:['初傳','中傳','末傳'][i]},fact(b));});
    var tags=[r.gate,r.type];if(delta===0&&!tags.includes('伏吟'))tags.push('伏吟');if(delta===6&&!tags.includes('返吟'))tags.push('返吟');
    if(r.transmissions[1]===mod(r.transmissions[0]+1,12)&&r.transmissions[2]===mod(r.transmissions[1]+1,12))tags.push('進連茹');
    if(r.transmissions[1]===mod(r.transmissions[0]-1,12)&&r.transmissions[2]===mod(r.transmissions[1]-1,12))tags.push('退連茹');
    var groups=[[8,0,4],[11,3,7],[2,6,10],[5,9,1]];if(groups.some(function(a){return new Set(r.transmissions).size===3&&r.transmissions.every(function(b){return a.includes(b);});}))tags.push('三合傳');
    var out={schema:'jy.liuren/1',version:VERSION,day:{gan:GAN[g],zhi:ZHI[d],ganzhi:GAN[g]+ZHI[d],element:ELEMENTS[GE[g]],residence:ZHI[JI[g]],yang:g%2===0},monthGeneral:{branch:ZHI[month],name:JIANG_NAMES[month]},hourBranch:ZHI[hour],rotation:delta,daytime:daytime,noble:{mode:mode,branch:ZHI[noble],earth:ZHI[nobleEarth],direction:reverse?'逆布':'順布'},xun:{head:'甲'+ZHI[xun],empty:empties.map(function(b){return ZHI[b];})},plate:plate,courses:courses,transmissions:transmissions,method:{gate:r.gate,type:r.type,tags:Array.from(new Set(tags)),selectedCourses:r.selectedCourses,trace:r.trace,depths:r.depths},auxiliary:{dayHorse:ZHI[MA[d]],dayLu:ZHI[LU[g]],dayClash:ZHI[mod(d+6,12)]},calculationPolicy:{version:VERSION,school:'本版九宗門：歷歸本家涉害，計地支與寄干；同深度依課序取孟、再仲、最後陽干／陰支上',nobleTable:'甲戊庚牛羊；乙己鼠猴；丙丁豬雞；辛馬虎；壬癸蛇兔（前晝後夜）',dayNight:'自動採卯辰巳午未申為晝，酉戌亥子丑寅為夜；可明示晝／夜',monthGeneral:'中氣換將；使用者手動覆核時另保留自動值',dayBoundary:'MIDNIGHT_00',trueSolarTime:false,predictionValidated:false,reference:'https://github.com/d1210182010/daliuren-web-engine',referenceRevision:'d5cb9a79ebe2c368ead76319ad37bac1e8096d22',notImplemented:['未明列或其他流派神煞','真太陽時與天文日出日落']}};
    if(root.JYLiurenClasses){out.participants=(input.participants||[]).map(root.JYLiurenClasses.annual);out.calendarContext=input.context||{};out.classAnalysis=root.JYLiurenClasses.compute(out,out.calendarContext,out.participants);}else out.calculationPolicy.notImplemented.push('六十四課體元件尚未載入');
    if(root.JYLiurenShensha)out.shensha=root.JYLiurenShensha.compute(out,input.context||{},input.shenshaOptions||{});
    return out;
  }
  function solarTime(s){return s.toYmdHms();}
  function calculate(input){
    input=input||{};if(!root.BaziCalendarCore||!root.Solar)throw new Error('曆法元件尚未完成載入，請重試。');
    var match=/^(\d{4})-(\d{2})-(\d{2})$/.exec(input.date||''),tm=/^(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(input.time||'');
    if(!match||!tm)throw new Error('請填完整起課日期與時間。');
    var tz=input.timezoneOffset==null?8:Number(input.timezoneOffset);if(!Number.isFinite(tz)||tz< -12||tz>14)throw new Error('UTC時差需介於−12至+14。');
    var p={year:Number(match[1]),month:Number(match[2]),day:Number(match[3]),hour:Number(tm[1]),minute:Number(tm[2]),second:Number(tm[3]||0),timezoneOffset:tz,dayBoundaryMode:input.dayBoundaryMode||'MIDNIGHT_00'};
    var calendar,clock=null;try{calendar=root.BaziCalendarCore.calculateChart(p);if(root.JYLiurenCompletion){clock=root.JYLiurenCompletion.clock(input,p,calendar.birthInstant);if(clock.corrected){p=Object.assign({},p,clock.corrected,{birthInstant:calendar.birthInstant,trueSolarTimeApplied:true});calendar=root.BaziCalendarCore.calculateChart(p);}}}catch(e){throw new Error(String(e.message).replace(/出生/g,'起課'));}if(!calendar)throw new Error('無法取得曆法資料，請重試。');
    var cn=new Date(calendar.birthInstant+8*3600000),solar=root.Solar.fromYmdHms(cn.getUTCFullYear(),cn.getUTCMonth()+1,cn.getUTCDate(),cn.getUTCHours(),cn.getUTCMinutes(),cn.getUTCSeconds()),lunar=solar.getLunar(),prev=lunar.getPrevQi(false),next=lunar.getNextQi(false),prevName=prev.getName(),auto=QI[prevName];
    if(auto==null)throw new Error('月將中氣名稱未識別，請核對曆法資料。');
    var day=calendar.pillars.day,hour=input.hourBranch||calendar.pillars.hour.zhi,month=input.monthGeneral==null||input.monthGeneral==='auto'?auto:input.monthGeneral;
    var nobleMode=input.nobleMode||'auto';if(nobleMode==='astronomical'){if(clock?.astronomy.daytime==null)throw new Error('天文晝夜需要完整經緯度與可用的日出日落區間');nobleMode=clock.astronomy.daytime?'day':'night';}
    var r=chartFromSymbols({dayGan:day.gan,dayZhi:day.zhi,hourBranch:hour,monthGeneral:month,nobleMode:nobleMode,participants:input.participants||[]});
    r.clock=clock;r.noble.requestedMode=input.nobleMode||'auto';r.calculationPolicy.trueSolarTime=!!clock?.trueSolarTimeApplied;if(input.nobleMode==='astronomical')r.calculationPolicy.dayNight='依起課地實際日出日落；不以固定卯酉代替';
    r.question=String(input.question||'').slice(0,4000);
    r.time={civilDate:input.date,civilTime:input.time,timezoneOffset:tz,instant:new Date(calendar.birthInstant).toISOString(),pillars:calendar.pillars,calendarEngine:calendar.engine,calendarVersion:calendar.engineVersion,precision:calendar.precision,previousQi:{name:prevName,time:solarTime(prev.getSolar()),timeBasis:'UTC+08:00'},nextQi:{name:next.getName(),time:solarTime(next.getSolar()),timeBasis:'UTC+08:00'},dayBoundaryMode:p.dayBoundaryMode};
    r.monthGeneral.automatic=ZHI[auto];r.monthGeneral.manual=input.monthGeneral!=null&&input.monthGeneral!=='auto';r.monthGeneral.source=r.monthGeneral.manual?'使用者明示月將':'上一中氣換將';
    r.time.hourSource=input.hourBranch?'活時：使用者指定占時支':clock?.trueSolarTimeApplied?'正時：明示真太陽時':'正時：民用時辰';r.time.effectiveWall=clock?.effectiveWall||null;r.calculationPolicy.dayBoundary=p.dayBoundaryMode;r.calculationPolicy.termTime='月將依原起課瞬間轉UTC+8核對中氣；日柱時支依明示鐘制，不改原瞬間';
    var prevDate=new Date(Date.UTC(p.year,p.month-1,p.day)-86400000),previous=root.BaziCalendarCore.calculateChart(Object.assign({},p,{year:prevDate.getUTCFullYear(),month:prevDate.getUTCMonth()+1,day:prevDate.getUTCDate()})).pillars.day;
    var table=lunar.getJieQiTable(),events=[],starts=['立春','立夏','立秋','立冬'],cardinals=['春分','夏至','秋分','冬至'],aliases={LI_CHUN:'立春',DONG_ZHI:'冬至'},civil=input.date;
    Object.keys(table).forEach(function(key){var name=aliases[key]||key;if(!starts.includes(name)&&!cardinals.includes(name))return;var s=table[key],instant=Date.UTC(s.getYear(),s.getMonth()-1,s.getDay(),s.getHour(),s.getMinute(),s.getSecond())-8*3600000,local=new Date(instant+tz*3600000),date=local.toISOString().slice(0,10),before=new Date(instant+tz*3600000-86400000).toISOString().slice(0,10);if(date===civil||before===civil)events.push({name:name,instant:new Date(instant).toISOString(),localDate:date,previousDate:before,isTermDay:date===civil,isPreviousDay:before===civil});});
    var lm=root.LunarMonth&&root.LunarMonth.fromYm(lunar.getYear(),lunar.getMonth());
    r.calendarContext={yearGan:calendar.pillars.year.gan,yearBranch:calendar.pillars.year.zhi,monthBranch:calendar.pillars.month.zhi,lunarYear:lunar.getYear(),lunarMonth:lunar.getMonth(),lunarDay:lunar.getDay(),lunarDayCount:lm?lm.getDayCount():null,previousDayGan:previous.gan,previousDayBranch:previous.zhi,fourStarts:events.some(function(e){return starts.includes(e.name)&&e.isTermDay;}),fourSeparations:events.some(function(e){return cardinals.includes(e.name)&&e.isPreviousDay;}),fourCardinals:events.some(function(e){return cardinals.includes(e.name)&&e.isTermDay;}),solarDayEvents:events,policy:'太歲以立春、月建以節；農曆月日以UTC+8朔曆；四立四離按起課地民用曆日；昨日干支使用同一民用時間與換日口徑'};
    if(root.JYLiurenCompletion){r.seasonal=root.JYLiurenCompletion.seasonal(lunar,calendar.birthInstant,calendar.pillars.month.zhi,input.seasonPolicy||'earth18');r.calendarContext.seasonElementIndex=r.seasonal.activeElementIndex;r.calendarContext.seasonPolicy=r.seasonal.profile;r.calculationPolicy.seasonPolicy=r.seasonal.profile;r.calculationPolicy.completionProfile=root.JYLiurenCompletion.version;}
    if(root.JYLiurenClasses)r.classAnalysis=root.JYLiurenClasses.compute(r,r.calendarContext,r.participants);
    if(root.JYLiurenShensha){r.shensha=root.JYLiurenShensha.compute(r,r.calendarContext,input.shenshaOptions||{});r.calculationPolicy.shenshaProfile=r.shensha.profile;}
    if(root.JYLiurenCompletion)r.timing=root.JYLiurenCompletion.timing(r,input);
    if(root.JYLiurenCompletion){r.calculationPolicy.notImplemented=r.calculationPolicy.notImplemented.filter(x=>x!=='真太陽時與天文日出日落');r.calculationPolicy.inputRequirements=clock?.astronomy.daytime==null?['起課地經緯度供天文晝夜，極區另需明示貴人晝夜口徑']:[];}
    return r;
  }
  root.JYLiurenCore={version:VERSION,calculate:calculate,chartFromSymbols:chartFromSymbols,branches:ZHI.slice(),stems:GAN.slice(),generals:GENERALS.slice(),elements:ELEMENTS.slice(),monthGeneralNames:JIANG_NAMES.slice(),relation:relation};
  if(typeof module!=='undefined'&&module.exports)module.exports=root.JYLiurenCore;
})(typeof window!=='undefined'?window:globalThis);
