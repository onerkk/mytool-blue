'use strict';
// Arithmetic, published-policy and regression tests; not predictive validation.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),acorn=require('acorn');
const {environment}=require('./dom-fixture.cjs');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const {ctx:c}=environment();
const load=f=>vm.runInContext(read(f),c,{filename:f});
['JS/vendor/lunar.js','JS/bazi-calendar-core.js','JS/solar-location.js','JS/bazi.js','JS/bazi_upgrade.js'].forEach(load);
const source=read('JS/ai-analysis.js');
for(const n of acorn.parse(source,{ecmaVersion:'latest'}).body){
 if(n.type==='VariableDeclaration'&&n.declarations.some(d=>['SIHUA_TABLE','ZW_PALACES','ZW_MAJOR','ZW_BRIGHTNESS'].includes(d.id.name))||n.type==='FunctionDeclaration'&&n.id.name==='getStarBright')vm.runInContext(source.slice(n.start,n.end),c);
}
c.Lunar.Solar=c.Solar;load('JS/ziwei.js');load('JS/ziwei-standalone.js');
let groups=0,comparisons=0;
function test(name,fn){try{fn();groups++;console.log('PASS '+name);}catch(e){process.exitCode=1;console.error('FAIL '+name+'\n'+e.stack);}}
const normalize=n=>n.replace('命宮','命').replace('交友','僕役');
test('iztro 2.5.8: 160 independent frozen charts, both sexes, leap policies and date boundaries',()=>{
 const fixture=JSON.parse(read('tests/fixtures/iztro-2.5.8-comparison.json'));
 assert.equal(fixture.fixtures.length,160);
 const ju={水二局:2,木三局:3,金四局:4,土五局:5,火六局:6};
 for(const f of fixture.fixtures){
  const a=f.input,[y,m,d]=a.date.split('-').map(Number);
  const z=c.computeZiwei(y,m,d,a.hour,a.gender,{leapMonthPolicy:a.split?'SPLIT_AT_15':'SAME_MONTH',referenceDate:'2026-09-12T12:00:00Z'});
  assert(z,c._jyZiweiError);
  for(const [actual,want] of [[z.palaces[0].branch,f.ming],[z.palaces.find(p=>p.isShen).branch,f.shen],[z.mingZhu,f.soul],[z.shenZhu,f.body],[z.wuxingJu,ju[f.ju]]]){assert.equal(actual,want,JSON.stringify(a));comparisons++;}
  for(const p of f.palaces){
   const actual=z.palaces.find(x=>x.branch===p.branch),dx=z.daXian.find(x=>x.branch===p.branch);
   assert.equal(normalize(actual.name),normalize(p.name));assert.equal(actual.gan,p.gan);assert.equal(actual.changsheng,p.changsheng);
   assert.deepEqual([dx.ageStart,dx.ageEnd],p.decadal);comparisons+=4;
   for(const name of p.stars){const loc=z.palaces.find(x=>x.stars.some(s=>s.name===name&&s.type!=='minor3'))||z.palaces.find(x=>x.stars.some(s=>s.name===name));assert.equal(loc&&loc.branch,p.branch,a.date+' '+a.hour+' '+name);comparisons++;}
  }
 }
});
test('Li-Chun annual boundary uses actual UTC instants, including explicit offsets',()=>{
 for(const [at,want] of [['2026-02-03T20:01:00Z','乙巳'],['2026-02-03T20:03:00Z','丙午'],['2026-02-04T04:03:00+08:00','丙午'],['2026-02-03T15:03:00-05:00','丙午']])assert.equal(c.BAZI_CORE.getYearGanZhiAt(at).gz,want);
 const t=c.BaziCalendarCore.getLiChun(2026).instantTimestamp;
 assert.equal(c.BAZI_CORE.getYearGanZhiAt(t-1).year,2025);assert.equal(c.BAZI_CORE.getYearGanZhiAt(t).year,2026);
 const before=c.BAZI_CORE.getAnnualYearsOverlapping(t-60000,t),after=c.BAZI_CORE.getAnnualYearsOverlapping(t,t+60000);
 assert.deepEqual(Array.from(before,r=>r.year),[2025]);assert.deepEqual(Array.from(after,r=>r.year),[2026]);
 for(const timezoneOffset of [-5,0,8,13]){
  const wall=t+timezoneOffset*3600000;
  assert.deepEqual(Array.from(c.BAZI_CORE.getAnnualYearsOverlapping(wall,wall+60000,{timezoneOffset}),r=>r.year),[2026]);
 }
 assert.throws(()=>c.BAZI_CORE.getYearGanZhiAt('invalid'));
});
test('Calendar rejects invalid dates, NaN fields and unsupported policies',()=>{
 const base={year:2000,month:2,day:29,hour:12,minute:0,gender:'male'};
 for(const bad of [{day:30},{year:1900},{hour:24},{minute:NaN},{second:60},{second:NaN},{timezoneOffset:Infinity},{timezoneOffset:15},{dayBoundaryMode:'unknown'}])assert.throws(()=>c.BaziCalendarCore.calculateChart({...base,...bad}));
 assert.throws(()=>c.BaziCalendarCore.calculateYun({...base,gender:'unknown'}));
 assert.throws(()=>c.computeBazi(2000,2,29,12,NaN,'male'));
 assert.throws(()=>c.computeBazi(2000,2,29,12,0,'male',{second:NaN}));
 assert.throws(()=>c.computeBazi(2000,2,29,12,0,'male',{referenceDate:'invalid'}));
});
test('Month pillar and elapsed Jie days share one ephemeris, including simplified term names',()=>{
 for(const [m,name,zhi] of [[3,'驚蟄','卯'],[6,'芒種','午'],[12,'大雪','子']]){
  const b=c.computeBazi(2026,m,12,12,0,'male');
  assert.equal(b.jqInfo.jieName,name);assert(b.jqInfo.jieIdx>=0);assert.equal(b.pillars.month.zhi,zhi);
  const previous=Date.parse(b.calendarBoundary.previousJie.date.replace(' ','T')+'+08:00');
  assert.equal(b.jqInfo.daysAfterJie,Math.floor((Date.parse(b.calculationPolicy.birthInstant)-previous)/86400000));
 }
});
test('Infancy before first Yun is represented; leap-day decades clamp to February end',()=>{
 const b=c.computeBazi(2026,2,3,12,0,'female',{referenceDate:'2026-02-03T05:00:00Z'});
 assert(b.qiyun.years<1);assert.equal(b.dayun[0].gz,'小運');assert.equal(b.dayun[0].ageStart,0);assert.equal(b.dayun[0].isCurrent,true);
 assert.equal(b.dayun[0].endDateExclusive,b.dayun[1].startDate);
 assert.equal(new Date(c._baziAddYearsMs(Date.UTC(2000,1,29,12),10)).toISOString(),'2010-02-28T12:00:00.000Z');
 for(let i=2;i<b.dayun.length;i++)assert.equal(b.dayun[i-1].endDateExclusive,b.dayun[i].startDate);
});
test('Explicit chart-wall reference resolves back to the matching actual instant',()=>{
 for(const offset of [-5,8,13]){
  const r=c.BAZI_CORE.referenceToChartWall(Date.UTC(2026,1,4,4,3),{timezoneOffset:offset,referenceTimeBasis:'chart-wall'});
  assert.equal(r.instantTimestamp,Date.UTC(2026,1,4,4,3)-offset*3600000);
 }
 const opts={longitude:121.56,timezoneOffset:8,timezoneId:'Asia/Taipei',trueSolarTimeApplied:true};
 const at=Date.parse('2026-02-03T20:03:00Z'),r=c.BAZI_CORE.referenceToChartWall(at,opts);
 const inverse=c.BAZI_CORE.referenceToChartWall(r.timestamp,{...opts,referenceTimeBasis:'chart-wall'});
 assert(Math.abs(inverse.instantTimestamp-at)<1000);
});
test('不得地 is weaker than 平, while 得地 is stronger',()=>{
 // Actual registered brightness labels, no patched getStarBright implementation.
 let weak,neutral,strong;
 const stars=['紫微','天機','太陽','武曲','天同','廉貞','天府','太陰','貪狼','巨門','天相','天梁','七殺','破軍'];
 for(const name of stars)for(let i=0;i<12;i++){
  const label=c.getStarBright(name,i).label,score=c.analyzePalace({stars:[{name,type:'major'}]},i).score;
  if(label==='不得地'||label==='不得')weak=score;if(label==='平')neutral=score;if(label==='得地')strong=score;
 }
 assert(Number.isFinite(weak)&&Number.isFinite(neutral)&&Number.isFinite(strong));assert(weak<neutral);assert(strong>neutral);
});
test('Neutral palace input gives neutral annual/monthly model output, not an offset of 50 or 100',()=>{
 const z=c.computeZiwei(2000,1,7,12,'male');
 // Isolate the score scale: a synthetic neutral major star has no brightness or four transformations.
 z.palaces.forEach(p=>{p.stars=[{name:'測試中性主星',type:'major'}];});
 for(let y=2020;y<=2031;y++){assert.equal(z.getLiuNianZw(y).score,0);for(const m of z.getLiuYueZw(y))assert.equal(m.score,0);}
 assert.throws(()=>z.getLiuNianZw(NaN));assert.throws(()=>z.getLiuYueZw(2026.5));
});
test('Ziwei exported current year follows saved lunar year before Lunar New Year',()=>{
 const opts={referenceDate:'2026-02-16T12:00:00Z'};
 const z=c.computeZiwei(2000,1,7,12,'male',opts);
 assert.equal(z.calculationPolicy.referenceLunarYear,2025);
 const prompt=c._ziweiBuildPrompt(z,{bdate:'2000-01-07',btime:'12:00',gender:'male'});
 assert(prompt.includes('現行農曆年度'));
 assert(prompt.includes('2025'));
 assert(prompt.includes('【流年走勢 2025–2028】'));
 assert(prompt.includes('・2025（現行農曆年度）'));assert(prompt.includes('・2026（下一農曆年度）'));
 assert(!prompt.includes('・2029'));
});
console.log('Engine fix groups passed: '+groups+'; independent comparisons: '+comparisons);
