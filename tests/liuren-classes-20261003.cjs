'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {environment}=require('./native-fixtures-20261003.cjs'),{ctx:c}=environment(),E=c.JYLiurenClasses,C=c.JYLiurenCore,results=[];
const plain=x=>JSON.parse(JSON.stringify(x)),branches=Array.from('子丑寅卯辰巳午未申酉戌亥');
function test(name,run){try{run();results.push({name,pass:true});console.log('PASS '+name);}catch(e){results.push({name,pass:false,error:e.message});console.error('FAIL '+name+'\n'+e.stack);process.exitCode=1;}}
function chart(day,hour,general,context={},participants=[],nobleMode='day'){return C.chartFromSymbols({dayGan:day[0],dayZhi:day[1],hourBranch:hour,monthGeneral:general,context,participants,nobleMode});}
const matched=(r,n)=>r.classAnalysis.checks.find(x=>x.name===n);
test('Published 課經 charts independently establish their named class and actual transmissions',()=>{
 const fixtures=[
  {name:'三陽',day:'乙丑',hour:'酉',general:'戌',month:'寅',trans:['寅','卯','辰']},
  {name:'連珠',day:'乙丑',hour:'酉',general:'戌',month:'寅',trans:['寅','卯','辰']},
  {name:'軒蓋',day:'甲子',hour:'卯',general:'子',month:'寅',trans:['午','卯','子']},
  {name:'鑄印',day:'丙子',hour:'未',general:'子',month:'寅',trans:['巳','戌','卯']},
  {name:'斫輪',day:'辛丑',hour:'辰',general:'亥',month:'寅',trans:['卯','戌','巳']},
  {name:'亨通',day:'丙戌',hour:'申',general:'亥',month:'寅',trans:['申','亥','寅']},
  {name:'三交',day:'戊子',hour:'午',general:'酉',month:'寅',trans:['卯','午','酉']},
  {name:'死奇',day:'甲子',hour:'丑',general:'巳',month:'寅',trans:['辰','申','子']},
  {name:'天獄',day:'乙酉',hour:'子',general:'巳',month:'寅',trans:['未','子','巳']},
  {name:'元胎',day:'甲寅',hour:'寅',general:'巳',month:'寅',trans:['申','亥','寅']},
  {name:'九丑',day:'乙卯',hour:'子',general:'戌',month:'卯',trans:['亥','酉','未']},
  {name:'迍福',day:'癸酉',hour:'午',general:'亥',month:'寅',trans:['未','子','巳']}
 ];
 for(const x of fixtures){const r=chart(x.day,x.hour,x.general,{monthBranch:x.month});assert.deepEqual(plain(r.transmissions.map(t=>t.branch)),x.trans,x.name+' transmissions');assert.equal(matched(r,x.name).established,true,x.name+' conditions');}
 // The source has inconsistent order in 軒蓋 and a non-initial 丑 in 九丑;
 // actual 九宗 transmissions are retained, not rewritten to make the example fit.
 const disputed=chart('庚午','寅','子',{monthBranch:'寅'});assert.deepEqual(plain(disputed.transmissions.map(t=>t.branch)),['寅','子','戌']);assert.equal(matched(disputed,'刑傷').established,true);
 const ugly=chart('乙卯','子','戌',{monthBranch:'卯'});assert.equal(matched(ugly,'九丑').variants[0].value,false);assert.equal(matched(ugly,'九丑').variants[1].value,true);
});
test('Original 行年 examples, 60-year cycle and all ages 1–150 keep valid 干支',()=>{
 assert.equal(E.annual({virtualAge:49,annualDirection:'male'}).annualGan+'寅','甲寅');assert.equal(E.annual({virtualAge:34,annualDirection:'female'}).annualGan+'亥','己亥');
 for(const mode of ['male','female'])for(let age=1;age<=150;age++){const r=E.annual({virtualAge:age,annualDirection:mode}),step=mode==='male'?age-1:1-age;assert.equal(r.annualIndex,((mode==='male'?2:8)+step%12+24)%12);assert.equal(r.annualGanIndex,((mode==='male'?2:8)+step%10+20)%10);assert.equal(r.annualIndex%2,r.annualGanIndex%2);}
 for(const p of [{virtualAge:0},{virtualAge:1.5},{virtualAge:151},{natalBranch:'甲'},{annualDirection:'guess'},{annualGan:'甲',annualBranch:'丑'}])assert.throws(()=>E.annual(p));
});
test('Published two-person 德孕 and 旺孕 require their actual separate inputs',()=>{
 const people=[{label:'夫',natalBranch:'子',virtualAge:49,annualDirection:'male'},{label:'妻',natalBranch:'酉',virtualAge:34,annualDirection:'female'}];
 const r=chart('壬申','未','巳',{monthBranch:'申'},people);const f=matched(r,'繁昌');assert.equal(f.established,true);assert.equal(f.variants[0].value,true);assert.deepEqual(plain(r.classAnalysis.participants.map(p=>p.annualGan+p.annualBranch)),['甲寅','己亥']);
 assert.equal(matched(chart('壬申','未','巳',{monthBranch:'申'}),'繁昌').established,null);
});
test('Ancient lunar-mansion table repeats each of six specified mansions and preserves real calendar limits',()=>{
 assert.deepEqual([1,2,3,4,5].map(d=>E.lunarMansion(1,d).mansion),['室','壁','奎','奎','婁']);assert.deepEqual([1,2,3,4,5].map(d=>E.lunarMansion(8,d).mansion),['角','亢','氐','氐','房']);
 assert.equal(E.lunarMansion(10,1).mansion,'心');assert.equal(E.lunarMansion(-2,1).mansion,'奎');assert.equal(E.lunarMansion(1,31),null);assert.equal(E.lunarMansion(0,1),null);
 for(let m=1;m<=12;m++)for(let d=1;d<=30;d++){const r=E.lunarMansion(m,d);assert.equal(r.astronomicalPosition,false);assert.equal(branches[r.branchIndex],r.branch);}
});
test('四立、四離 and 分至 are computed from solar-term civil dates, including timezone crossings',()=>{
 for(const tz of [-7,0,8,14]){
  const lunar=c.Solar.fromYmdHms(2026,4,1,12,0,0).getLunar(),table=lunar.getJieQiTable();
  for(const name of ['立春','立夏','立秋','立冬','春分','夏至','秋分','冬至']){
   const s=table[name],utc=Date.UTC(s.getYear(),s.getMonth()-1,s.getDay(),s.getHour(),s.getMinute(),s.getSecond())-8*3600000,local=utc+tz*3600000,date=new Date(local).toISOString().slice(0,10),before=new Date(local-86400000).toISOString().slice(0,10),at=C.calculate({date,time:'12:00',timezoneOffset:tz}),pre=C.calculate({date:before,time:'12:00',timezoneOffset:tz});
   if(name.startsWith('立'))assert.equal(at.calendarContext.fourStarts,true,name+'/'+tz);else{assert.equal(at.calendarContext.fourCardinals,true,name+'/'+tz);assert.equal(pre.calendarContext.fourSeparations,true,name+'/'+tz);}
   assert(Number.isInteger(at.calendarContext.lunarDayCount));assert([29,30].includes(at.calendarContext.lunarDayCount));
  }
 }
});
test('All 720 symbolic charts × 2 noble modes × 12 month contexts execute all 64 rule families without unknown math',()=>{
 const fixture=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures/liuren-720-reference.json'),'utf8')),seen=new Set();let decisions=0;
 for(const item of fixture.cases)for(const mode of ['day','night'])for(let m=0;m<12;m++){
  const ctx={yearBranch:branches[(m+item.rotation)%12],monthBranch:branches[m],lunarMonth:((m+10)%12)+1,lunarDay:15,lunarDayCount:30,fourStarts:false,fourSeparations:false,fourCardinals:false,previousDayGan:Array.from('甲乙丙丁戊己庚辛壬癸')[(Array.from('甲乙丙丁戊己庚辛壬癸').indexOf(item.day[0])+9)%10],previousDayBranch:branches[(branches.indexOf(item.day[1])+11)%12]};
  const people=[{natalBranch:branches[m],virtualAge:m+20,annualDirection:'male'},{natalBranch:branches[(m+3)%12],virtualAge:m+19,annualDirection:'female'}],r=chart(item.day,'子',branches[item.rotation],ctx,people,mode),a=r.classAnalysis;assert.equal(a.counts.implemented,64);assert.equal(a.counts.insufficientData,0,item.day+'/'+m);assert.equal(a.counts.established+a.counts.notEstablished,64);
  for(const x of a.checks){assert.equal(typeof x.established,'boolean');assert(x.variants.every(v=>v.conditions.length));assert(x.source.url.startsWith('https://zh.wikisource.org/'));if(x.established)seen.add(x.name);decisions++;}
 }
 assert(decisions===1105920);assert(seen.size>=50);results.push({measurement:'symbolicDecisions',decisions,positiveFamilies:seen.size});
});
test('Missing inputs remain tri-valued, prompt/native export keeps calculated rule evidence',()=>{
 assert.equal(E.all([true,null]),null);assert.equal(E.all([false,null]),false);assert.equal(E.any([true,null]),true);assert.equal(E.any([false,null]),null);
 const r=C.calculate({date:'2026-10-02',time:'12:00'}),before=JSON.stringify(r),n=c.JYNativeAnalysis.analyze('liuren',r),text=c.JYLiurenPrompt.build(r);assert.equal(JSON.stringify(r),before);assert.equal(n.coverage.classFamilies,64);assert.equal(n.classes.decisions.length,64);assert(text.includes('六十四課體全表'));assert(text.includes('classAnalysis'));assert(text.includes('sourceAudit'));assert(!text.includes('NaN'));assert(!text.includes('undefined'));assert(r.classAnalysis.counts.insufficientData>0);
});
const report={date:'2026-10-03',engineVersion:C.version,classVersion:E.version,results,passed:results.filter(x=>x.pass).length,total:results.filter(x=>'pass'in x).length};
fs.writeFileSync(path.join(__dirname,'../docs/liuren-class-validation-20261003.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({passed:report.passed,total:report.total}));
