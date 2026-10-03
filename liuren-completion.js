/* 六壬：四立前十八日土旺、實際日出日落、明示真太陽時及逐日應期條件。
 * 原則來自六壬大全畢法／心鏡／課經；十八日界採選擇紀要引神樞經。
 * 日期是規則觸發候選，不是現實事件保證。未提供坐標不造天文晝夜。
 */
(function(root){
 'use strict';
 const VERSION='20261003-liuren-completion1',DAY=86400000,G=Array.from('甲乙丙丁戊己庚辛壬癸'),B=Array.from('子丑寅卯辰巳午未申酉戌亥'),E=['木','火','土','金','水'],BE=[4,2,0,0,2,1,1,2,3,3,2,4],GE=[0,0,1,1,2,2,3,3,4,4],HE=[1,0,11,10,9,8,7,6,5,4,3,2],MUB=[7,10,4,1,4];
 const mod=(n,m=12)=>(n%m+m)%m,pad=n=>String(n).padStart(2,'0'),iso=n=>new Date(n).toISOString(),seasonState=(a,m)=>a===m?'旺':mod(m+1,5)===a?'相':mod(a+1,5)===m?'休':mod(a+2,5)===m?'囚':'死';
 const SOURCES={earth18:'https://zh.wikisource.org/wiki/選擇紀要/上編',liuren:'https://zh.wikisource.org/zh-hant/六壬大全_(四庫全書本)/全覽',astronomy:'https://github.com/cosinekitty/astronomy'};
 function finiteCoordinate(value,bound,label){if(value==null||value==='')return null;const n=Number(value);if(!Number.isFinite(n)||Math.abs(n)>bound)throw Error(label+'無效');return n;}
 function civilParts(utc,offset){const d=new Date(utc+offset*3600000);return {year:d.getUTCFullYear(),month:d.getUTCMonth()+1,day:d.getUTCDate(),hour:d.getUTCHours(),minute:d.getUTCMinutes(),second:d.getUTCSeconds()};}
 function clock(input,p,instant){
   const longitude=finiteCoordinate(input.longitude,180,'經度'),latitude=finiteCoordinate(input.latitude,89,'緯度'),trueSolar=!!input.trueSolarTime;
   let corrected=null;
   if(trueSolar){if(longitude==null)throw Error('真太陽時需要起課地經度');if(!root.calcTrueSolarTime)throw Error('真太陽時計算元件未載入');corrected=root.calcTrueSolarTime(p.year,p.month,p.day,p.hour,p.minute,longitude,{timezone:p.timezoneOffset,second:p.second});}
   const astronomy={status:longitude==null||latitude==null?'coordinates-unavailable':!root.Astronomy?'module-unavailable':'calculated',longitude,latitude,daytime:null,previousRise:null,nextRise:null,previousSet:null,nextSet:null};
   if(astronomy.status==='calculated'){
     const A=root.Astronomy,observer=new A.Observer(latitude,longitude,0),events={rise:[],set:[]};
     for(const [key,direction]of [['rise',1],['set',-1]]){let start=new Date(instant-2*DAY);for(let i=0;i<6;i++){const x=A.SearchRiseSet(A.Body.Sun,observer,direction,start,5);if(!x||+x.date>instant+2*DAY)break;events[key].push(+x.date);start=new Date(+x.date+1000);}}
     const previousRise=events.rise.filter(x=>x<=instant).at(-1),nextRise=events.rise.find(x=>x>instant),previousSet=events.set.filter(x=>x<=instant).at(-1),nextSet=events.set.find(x=>x>instant);
     for(const [key,value]of Object.entries({previousRise,nextRise,previousSet,nextSet}))astronomy[key]=value==null?null:iso(value);
     if(previousRise!=null&&previousSet!=null&&nextRise!=null&&nextSet!=null)astronomy.daytime=previousRise>previousSet;
     else astronomy.status='polar-sunrise-interval-unavailable';
     astronomy.policy='Astronomy Engine apparent upper-limb sunrise/set, sea-level standard refraction; actual UTC instant unaffected by clock correction.';
   }
   return {version:VERSION,trueSolarTimeApplied:trueSolar,longitude,latitude,corrected,astronomy,originalInstant:iso(instant),effectiveWall:corrected?corrected.trueSolarDateTime:[p.year,pad(p.month),pad(p.day)].join('-')+' '+[pad(p.hour),pad(p.minute),pad(p.second)].join(':'),policy:'起課瞬間固定；月將／年建月建按原瞬間換節，日柱時支按所選民用／真太陽鐘。活時支為使用者另指定，保留兩者。'};
 }
 function seasonal(lunar,instant,monthBranch,profile='earth18'){
   if(!['earth18','whole-month'].includes(profile))throw Error('土旺政策無效');
   const starts=['立春','立夏','立秋','立冬'],elements=[0,1,3,4],aliases={LI_CHUN:'立春'},table=lunar.getJieQiTable(),events=[];
   for(const [key,s]of Object.entries(table)){const name=aliases[key]||key,i=starts.indexOf(name);if(i<0)continue;events.push({name,element:elements[i],instant:Date.UTC(s.getYear(),s.getMonth()-1,s.getDay(),s.getHour(),s.getMinute(),s.getSecond())-8*3600000});}
   events.sort((a,b)=>a.instant-b.instant);const next=events.find(x=>x.instant>instant),prev=events.filter(x=>x.instant<=instant).at(-1),earthStart=next?next.instant-18*DAY:null,earth18=earthStart!=null&&instant>=earthStart&&instant<next.instant;
   // The month's first12days continue the preceding season in the18-day model.
   const monthIndex=B.indexOf(monthBranch),seasonIndex=monthIndex>=0?Math.floor(mod(monthIndex-2)/3):null,base=prev?.element??(seasonIndex==null?null:[0,1,3,4][seasonIndex]),wholeMonthElement=monthIndex<0?null:BE[monthIndex],active=profile==='whole-month'?wholeMonthElement:earth18?2:base;
   return {profile,status:active==null?'insufficient-calendar':'calculated',activeElement:active==null?null:E[active],activeElementIndex:active,wholeMonthElement:wholeMonthElement==null?null:E[wholeMonthElement],earth18Active:earth18,earth18Interval:next?{start:iso(earthStart),endExclusive:iso(next.instant),nextFourStart:next.name,durationDays:18}:null,precedingFourStart:prev?{name:prev.name,instant:iso(prev.instant)}:null,states:active==null?{}:Object.fromEntries(E.map((e,i)=>[e,seasonState(i,active)])),source:profile==='earth18'?SOURCES.earth18:SOURCES.liuren,sourceAudit:'六壬大全物類明列辰戌丑未各寄旺18日，並有全季土旺用語；18日具名界採神樞經四立前18日，整月版並列不混用。'};
 }
 function targetSelection(r,input){
   const permitted=['妻財','官鬼','父母','子孫','兄弟','干支'],manual=input.targetKinship&&input.targetKinship!=='auto'?input.targetKinship:null;if(manual&&!permitted.includes(manual))throw Error('六壬取用方向無效');
   const q=String(r.question||''),hits=[];
   for(const [kind,pattern,role]of [['妻財',/財|钱|錢|收入|獲利|利润|利潤|交易|投資|付款|費用|貨物/,'資源／財務'],['官鬼',/工作|職位|职位|升遷|升迁|官司|诉讼|訴訟|考公|任職|任职/,'職務／約束'],['父母',/文書|文件|合同|契約|证件|證件|房屋|買房|买房|考試|考试|學習|学习|父母|老師|老师/,'文書／庇護'],['子孫',/子女|孩子|兒子|儿子|女兒|女儿|學生|学生|寵物|宠物/,'子女／受養者'],['兄弟',/兄弟|姊妹|姐妹|同事|同伴|朋友|夥伴|伙伴/,'同輩']])if(pattern.test(q))hits.push({kinship:kind,role});
   if(/伴侶|伴侣|婚姻|夫妻|感情|交往|復合|复合|關係|关系/.test(q))hits.push({kinship:'干支',role:'双方；不凭问句猜性别或配偶身份'});
   const selected=manual?[{kinship:manual,role:'使用者明示'}]:hits.filter((x,i,a)=>a.findIndex(y=>y.kinship===x.kinship)===i);
   const targets=selected.map(x=>({...x,placements:x.kinship==='干支'?[{...r.courses[0],role:'干上'},{...r.courses[2],role:'支上'}]:r.plate.filter(p=>p.kinship===x.kinship).map(p=>({...p,role:'天盤'+p.branch+'臨'+p.earth})),transmissions:x.kinship==='干支'?r.transmissions.filter(t=>[r.courses[0].branchIndex,r.courses[2].branchIndex].includes(t.branchIndex)):r.transmissions.filter(t=>t.kinship===x.kinship)}));
   return {mode:manual?'manual':'question-explicit-domain',status:targets.length?'calculated':'unresolved-topic',targets,policy:'事情六親與提問者干、對象／環境支分開；自動只辨明示議題。多項並存不強排唯一用神，全部實際天盤落點保留。'};
 }
 function windowFor(question,date,supplied){
   const q=String(question||''),yr=Number(date.slice(0,4));let start=date,end=new Date(Date.parse(date+'T12:00:00Z')+59*DAY).toISOString().slice(0,10),source='default60-calendar-days';
   if(supplied){start=supplied.startDate||supplied.start||start;end=supplied.endDate||supplied.end||end;source='explicit-window';}
   else {const range=q.match(/(20\d{2})\s*(?:年)?\s*(?:至|到|—|-|～|~)\s*(20\d{2})/),year=q.match(/(20\d{2})年/);if(range){start=range[1]+'-01-01';end=range[2]+'-12-31';source='question-year-range';}else if(/明年/.test(q)){start=(yr+1)+'-01-01';end=(yr+1)+'-12-31';source='question-next-year';}else if(/今年/.test(q)||year){const y=year?Number(year[1]):yr;start=y+'-01-01';end=y+'-12-31';source='question-year';}}
   if(!/^\d{4}-\d{2}-\d{2}$/.test(start)||!/^\d{4}-\d{2}-\d{2}$/.test(end))throw Error('應期範圍須為完整日期');
   for(const value of [start,end]){const n=Date.parse(value+'T00:00:00Z');if(!Number.isFinite(n)||new Date(n).toISOString().slice(0,10)!==value)throw Error('應期日期無效');}
   if(end<start)throw Error('應期結束日期不可早於開始日期');
   const originalStart=start;start=start<date?date:start;const count=Math.round((Date.parse(end+'T12:00:00Z')-Date.parse(start+'T12:00:00Z'))/DAY)+1;if(!Number.isFinite(count)||count>3660)throw Error('應期範圍須為起課後至多3660日');return {startDate:start,endDateInclusive:end,calendarDays:Math.max(0,count),source,status:count<1?'past-window':'calculated',originalStartDate:originalStart};
 }
 function timing(r,input){
   const selection=targetSelection(r,input),window=windowFor(r.question,r.time.civilDate,input.timeWindow),reference=Date.parse(r.time.instant),offset=r.time.timezoneOffset,baseHead=r.xun.head,chosen=selection.targets.flatMap(t=>t.placements.map(p=>({target:t.kinship,role:p.role,branch:p.branch,branchIndex:p.branchIndex,element:p.element,empty:p.empty,earthIndex:p.earthIndex,monthlyBroken:mod(B.indexOf(r.calendarContext.monthBranch)+6)===p.branchIndex}))),candidates=[],inspected=[];
   const first=r.transmissions[0],scales=[];
   if(first.branch===r.calendarContext.yearBranch)scales.push({rule:'太歲發用',scale:'within-symbolic-year',sourceSection:'心鏡應期'});
   if(first.branch===r.calendarContext.monthBranch)scales.push({rule:'月建發用',scale:'within-symbolic-month',sourceSection:'心鏡應期'});
   if(first.branch===r.day.zhi)scales.push({rule:'日辰發用',scale:'within-xun',sourceSection:'心鏡應期'});
   if(first.branch===r.day.residence)scales.push({rule:'寄干發用',scale:'within-day',sourceSection:'心鏡應期'});
   if(first.branch===r.hourBranch)scales.push({rule:'占時發用',scale:'within-day',variant:'心鏡另言八刻，刻長歷制不一，未暗換固定現代分鐘'});
   const wall=r.clock?.corrected||civilParts(reference,offset),dayLabel=Date.UTC(wall.year,wall.month-1,wall.day)+(r.calculationPolicy.dayBoundary==='ZI_HOUR_23'&&wall.hour>=23?DAY:0),firstExitDate=new Date(dayLabel+(10-G.indexOf(r.day.gan))*DAY).toISOString().slice(0,10);
   for(let i=0;i<window.calendarDays;i++){
     const noonDate=new Date(Date.parse(window.startDate+'T12:00:00Z')+i*DAY),date=noonDate.toISOString().slice(0,10),p={year:noonDate.getUTCFullYear(),month:noonDate.getUTCMonth()+1,day:noonDate.getUTCDate(),hour:12,minute:0,second:0,timezoneOffset:offset,dayBoundaryMode:r.calculationPolicy.dayBoundary};
     const c=root.BaziCalendarCore.calculateChart(p),d=c.pillars.day,di=B.indexOf(d.zhi),gi=G.indexOf(d.gan),head='甲'+B[mod(di-gi)],exits=date===firstExitDate;
     let start=Date.UTC(p.year,p.month-1,p.day)-(offset*3600000)-(p.dayBoundaryMode==='ZI_HOUR_23'?3600000:0),end=start+DAY;
     function inverseSolar(utc){if(!r.clock?.trueSolarTimeApplied)return utc;let guess=utc;for(let j=0;j<4;j++){const w=civilParts(guess,offset),s=root.calcTrueSolarTime(w.year,w.month,w.day,w.hour,w.minute,r.clock.longitude,{timezone:offset,second:w.second}),actualWall=Date.UTC(s.year,s.month-1,s.day,s.hour,s.minute,s.second),desiredWall=utc+offset*3600000;guess+=desiredWall-actualWall;}return guess;}
     start=Math.max(reference,inverseSolar(start));end=inverseSolar(end);if(end<=reference)continue;
     // 月建以原瞬間的節換月；同一所選換日區间內可有兩個月建。
     const centre=new Date((start+end)/2+8*3600000),lunar=root.Solar.fromYmdHms(centre.getUTCFullYear(),centre.getUTCMonth()+1,centre.getUTCDate(),centre.getUTCHours(),centre.getUTCMinutes(),centre.getUTCSeconds()).getLunar(),table=lunar.getJieQiTable(),jie=['立春','惊蛰','清明','立夏','芒种','小暑','立秋','白露','寒露','立冬','大雪','小寒'],alias={DA_XUE:'大雪',XIAO_HAN:'小寒',LI_CHUN:'立春',JING_ZHE:'惊蛰'},cuts=[start,end];
     for(const [key,s] of Object.entries(table)){const name=alias[key]||key;if(!jie.includes(name))continue;const t=Date.UTC(s.getYear(),s.getMonth()-1,s.getDay(),s.getHour(),s.getMinute(),s.getSecond())-8*3600000;if(t>start&&t<end)cuts.push(t);if(r.seasonal?.profile==='earth18'&&['立春','立夏','立秋','立冬'].includes(name)&&t-18*DAY>start&&t-18*DAY<end)cuts.push(t-18*DAY);}
     const ordered=Array.from(new Set(cuts)).sort((a,b)=>a-b),segments=ordered.slice(0,-1).map((a,j)=>{const b=ordered[j+1],probe=(a+b)/2,w=civilParts(probe,offset);let local=w;if(r.clock?.trueSolarTimeApplied)local={...w,...root.calcTrueSolarTime(w.year,w.month,w.day,w.hour,w.minute,r.clock.longitude,{timezone:offset,second:w.second})};const future=root.BaziCalendarCore.calculateChart({...local,timezoneOffset:offset,dayBoundaryMode:p.dayBoundaryMode,birthInstant:probe});return {start:iso(a),endExclusive:iso(b),yearGanzhi:future.pillars.year.gan+future.pillars.year.zhi,monthGanzhi:future.pillars.month.gan+future.pillars.month.zhi,monthBranch:future.pillars.month.zhi,dayGanzhi:future.pillars.day.gan+future.pillars.day.zhi};});
     const row={date,dayGanzhi:d.gan+d.zhi,monthBranch:segments[0].monthBranch,monthSegments:segments,xunHead:head,start:iso(start),endExclusive:iso(end),conditions:[]};
     for(const u of chosen){const why=[];
       if(di===u.branchIndex)why.push({id:u.empty?'填實旬空':'用神值日',kind:'activation'});
       if(mod(di+6)===u.branchIndex)why.push({id:u.empty?'沖空':'沖用神',kind:u.empty?'conditional-release':'interaction'});
       if(HE[di]===u.branchIndex)why.push({id:u.monthlyBroken?'月破逢合候選':'日合用神',kind:'interaction'});
       if(exits&&u.empty)why.push({id:'首次出原旬',kind:'conditional-release'});
       const element=E.indexOf(u.element),tomb=MUB[element];if(u.earthIndex===tomb&&di===mod(tomb+6))why.push({id:'用神臨墓逢沖墓',kind:'conditional-release'});
       if(di===tomb)why.push({id:'用神五行逢日墓',kind:'constraint'});
       if(r.rotation===0&&mod(di+6)===u.branchIndex)why.push({id:'伏吟逢沖候選',kind:'conditional-release'});
       if(r.rotation===6&&HE[di]===u.branchIndex)why.push({id:'反吟逢合候選',kind:'interaction'});
       const monthConstraints=segments.map(s=>({...s,monthlyBroken:mod(B.indexOf(s.monthBranch)+6)===u.branchIndex,season:seasonal(lunar,Date.parse(s.start)+(Date.parse(s.endExclusive)-Date.parse(s.start))/2,s.monthBranch,r.seasonal?.profile).states[u.element],dayEmpty:[B[mod(B.indexOf(head[1])+10)],B[mod(B.indexOf(head[1])+11)]].includes(u.branch)}));
       if(why.length)row.conditions.push({target:u.target,role:u.role,branch:u.branch,why,monthConstraints});
     }
     inspected.push({date,dayGanzhi:row.dayGanzhi,monthBranch:row.monthBranch,monthSegments:segments,xunHead:head,start:row.start,endExclusive:row.endExclusive});if(row.conditions.length)candidates.push(row);
   }
   return {version:VERSION,source:SOURCES.liuren,selection,window,status:window.status==='past-window'?'past-window':selection.targets.length?'calculated':'unresolved-topic',scales,inspectedDays:inspected,candidates,policy:'每一候選日實排干支、旬界及所選換日；真太陽鐘用逆解修正；交節日按實際節瞬間分段月建，原課月破與未來月破分列。心鏡的太歲／月建／日辰／寄干尺度與支值、沖、合、旬、墓的客觀候選分開。伏吟沖、反吟合標為互動候選，不能投票變成唯一事件日；未明示吉凶不憑生我／克我口訣強判吉凶。'};
 }
 root.JYLiurenCompletion=Object.freeze({version:VERSION,clock,seasonal,timing,targetSelection,windowFor,seasonState,sources:SOURCES});
})(typeof window==='undefined'?globalThis:window);
