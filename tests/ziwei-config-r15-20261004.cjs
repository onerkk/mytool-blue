'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const c=require('./native-fixtures-20261003.cjs').environment().ctx;
const reference=require('./fixtures/ziwei-iztro261-r15.json'),results=[];
let assertions=0;
const eq=(a,b,m)=>{assert.deepEqual(JSON.parse(JSON.stringify(a)),JSON.parse(JSON.stringify(b)),m);assertions++;};
const ok=(v,m)=>{assert(v,m);assertions++;};
const chart=(date,opts={},gender='male')=>{const z=c.computeZiwei(...date.split('-').map(Number),14,gender,{minute:55,referenceDate:'2026-10-01T04:00:00Z',...opts});ok(z,c._jyZiweiError||date);return z;};
function test(name,f){f();results.push({name,status:'passed'});console.log('PASS '+name);}
test('160 independent iztro 2.6.1 reference charts: both genders, eight configurations, all natal positions and 48 decorative entries',()=>{
 for(const f of reference.cases){const z=chart(f.date,f.config,f.gender);
  eq(z.yGan+z.yZhi,f.yearGz);eq(z.mingZhu,f.soul);eq(z.shenZhu,f.body);eq(z.palaces.find(p=>p.isMing).branch,f.ming);eq(z.palaces.find(p=>p.isShen).branch,f.shen);
  for(const p of f.palaces){const a=z.palaces.find(q=>q.branch===p.branch);eq(a.gan,p.gan);eq(a.changsheng,p.changsheng);eq(a.boshi12,p.boshi);eq(a.suiqian12,p.sui);eq(a.jiangqian12,p.jiang);
   for(const name of p.stars){const aliases=name==='截路'||name==='空亡'?['截空','副截']:[name];ok(a.stars.some(s=>aliases.includes(s.name)),f.date+' '+JSON.stringify(f.config)+' '+p.branch+' '+name);}
  }
  eq(z.integrity.status,'PASS');eq(z.sihua.length,4);
 }
});
const term=c.Solar.fromYmd(2026,2,4).getLunar().getJieQiTable()['立春'];
const termUtc=Date.UTC(term.getYear(),term.getMonth()-1,term.getDay(),term.getHour(),term.getMinute(),term.getSecond())-8*3600000;
test('Li-chun switches only at the actual clock boundary, independently for natal and horoscope years',()=>{
 const make=ms=>{const d=new Date(ms+8*3600000);return c.computeZiwei(d.getUTCFullYear(),d.getUTCMonth()+1,d.getUTCDate(),d.getUTCHours(),'male',{minute:d.getUTCMinutes(),second:d.getUTCSeconds(),yearDivide:'exact',horoscopeDivide:'normal',referenceDate:new Date(termUtc).toISOString()});};
 const before=make(termUtc-1000),after=make(termUtc);ok(before&&after);eq(before.yGan+before.yZhi,'乙巳');eq(after.yGan+after.yZhi,'丙午');eq(after.calculationPolicy.natalFlowYearGz,'乙巳');
 const z=chart('1983-8-25',{horoscopeDivide:'exact'});eq(z.getHoroscopeAtInstant(new Date(termUtc-1000)).annual.gz,'乙巳');eq(z.getHoroscopeAtInstant(new Date(termUtc)).annual.gz,'丙午');
 const n=chart('1983-8-25');eq(n.getHoroscopeAtInstant(new Date(termUtc)).annual.gz,'乙巳');eq(n.getHoroscopeAtInstant('2026-02-16T16:00:00Z').annual.gz,'丙午');
 const astronomical=c.Astronomy.SearchSunLongitude(315,new Date('2026-02-03T00:00:00Z'),3).date;ok(Math.abs(+astronomical-termUtc)<90000,'independent Astronomy Engine solar-longitude boundary within 90 seconds');
});
test('Foreign civil clocks resolve the same Li-chun instant; invalid and nonexistent timezone clocks are rejected',()=>{
 const make=(ms,offset,timezoneId)=>{const d=new Date(ms+offset*3600000);return c.computeZiwei(d.getUTCFullYear(),d.getUTCMonth()+1,d.getUTCDate(),d.getUTCHours(),'male',{minute:d.getUTCMinutes(),second:d.getUTCSeconds(),yearDivide:'exact',horoscopeDivide:'exact',timezoneOffset:offset,timezoneId,referenceDate:'2026-10-01T04:00:00Z'});};
 for(const [offset,zone] of [[-5,'America/New_York'],[0,'Europe/London'],[8,'Asia/Taipei'],[5.75,null]]){
  const a=make(termUtc-1000,offset,zone),b=make(termUtc,offset,zone);ok(a&&b,c._jyZiweiError);eq(a.yGan+a.yZhi,'乙巳');eq(b.yGan+b.yZhi,'丙午');eq(b.calculationPolicy.birthInstant,new Date(termUtc).toISOString());eq(b.calculationPolicy.birthTimezoneOffset,offset);eq(b.calculationPolicy.solarTermTimezone,'Asia/Taipei');
 }
 const before=chart('2026-2-17',{referenceDate:'2026-02-17T06:54:59Z'});eq(before.currentAge,null);eq(before.getAgeAtInstant('2026-02-17T06:54:59Z'),null);eq(before.getAgeAtInstant('2026-02-17T06:55:00Z'),1);
 const err=c.console.error;c.console.error=()=>{};
 for(const opts of [{timezoneOffset:NaN},{timezoneOffset:15},{timezoneId:'Invalid/Timezone'},{disambiguation:'invalid'}])eq(c.computeZiwei(1983,8,25,14,'male',{minute:55,...opts}),null);
 eq(c.computeZiwei(2026,3,8,2,'male',{minute:30,timezoneId:'America/New_York',timezoneOffset:-5}),null);ok(/跳時缺口/.test(c._jyZiweiError));
 const earlier=c.computeZiwei(2026,11,1,1,'male',{minute:30,timezoneId:'America/New_York',timezoneOffset:-5}),later=c.computeZiwei(2026,11,1,1,'male',{minute:30,timezoneId:'America/New_York',timezoneOffset:-5,disambiguation:'later'});ok(earlier&&later);eq(Date.parse(later.calculationPolicy.birthInstant)-Date.parse(earlier.calculationPolicy.birthInstant),3600000);eq(later.calculationPolicy.birthCivilTimeStatus,'ambiguous-later');
 c.console.error=err;
});
test('Birthday ages, minor limits and decades switch together; year-boundary method remains distinct',()=>{
 const z=chart('1983-8-25',{ageDivide:'birthday'}),b=c.Lunar.fromYmd(2026,7,17).getSolar();
 const birthday=Date.UTC(b.getYear(),b.getMonth()-1,b.getDay())-8*3600000;
 eq(z.getAgeAtInstant(new Date(birthday-1000)),43);eq(z.getAgeAtInstant(new Date(birthday)),44);
 eq(z.getXiaoXianAtInstant(new Date(birthday)).age,44);eq(z.getHoroscopeAtInstant(new Date(birthday)).minor.age,44);
 eq(z.getAgeAtInstant('2026-02-16T16:00:00Z'),43);eq(chart('1983-8-25').getAgeAtInstant('2026-02-16T16:00:00Z'),44);
 const source=chart('1983-8-25',{ageDivide:'birthday',birthdayBoundary:'AFTER_DATE_IZTRO261'});eq(source.getAgeAtInstant(new Date(birthday)),43);eq(source.getAgeAtInstant(new Date(birthday+86400000)),44);
 const edge=chart('1983-8-25',{ageDivide:'birthday'}),day=c.Lunar.fromYmd(2026,7,17).getSolar(),instant=Date.UTC(day.getYear(),day.getMonth()-1,day.getDay())-8*3600000;
 eq(edge.getHoroscopeAtInstant(new Date(instant-1000)).decade.ageStart,34);eq(edge.getHoroscopeAtInstant(new Date(instant)).decade.ageStart,44);
 const newborn=chart('2026-2-17',{referenceDate:'2026-02-17T07:00:00Z',ageDivide:'birthday'}).getHoroscopeAtInstant();eq(newborn.age,1);eq(newborn.childhood.palaceName,'命宮');eq(newborn.childhood.palaces.length,12);eq(newborn.childhood.hua.length,4);
 eq(edge.getAgeAtInstant('1982-01-01T00:00:00Z'),null);
 const late=c.computeZiwei(1994,6,20,23,'female',{minute:26,ageDivide:'birthday',dayDivide:'forward',referenceDate:'2026-10-01T04:00:00Z'}),raw=late.birthLunar,s=c.Lunar.fromYmd(2026,raw.month,raw.day).getSolar(),t=Date.parse(s.toYmd()+'T00:00:00+08:00');
 eq(late.getAgeAtInstant(new Date(t-1000)),32);eq(late.getAgeAtInstant(new Date(t)),33);eq(late.calculationPolicy.birthdayBirthDateBasis,'ORIGINAL_CIVIL_LUNAR_DATE');
});
test('Exact month stem changes at Jie while the Doujun palace follows the lunar calendar',()=>{
 const z=chart('1983-8-25',{horoscopeDivide:'exact'}),jie=c.Solar.fromYmd(2026,3,5).getLunar().getJieQiTable()['惊蛰'];
 const t=Date.UTC(jie.getYear(),jie.getMonth()-1,jie.getDay(),jie.getHour(),jie.getMinute(),jie.getSecond())-8*3600000;
 const before=z.getHoroscopeAtInstant(new Date(t-1000)),after=z.getHoroscopeAtInstant(new Date(t));eq(before.monthly.gz,'庚寅');eq(after.monthly.gz,'辛卯');eq(before.monthly.mingBranch,after.monthly.mingBranch);
 ok(JSON.stringify(before.monthly.hua)!==JSON.stringify(after.monthly.hua));ok(after.monthly.flowStars.every(s=>s.stem==='辛'));
 const months=z.getLiuYueZw(2026);eq(months.length,12);ok(months.some(m=>m.segments.length>1));ok(months[0].segments.some(s=>Date.parse(s.startsAt)===t),'Jingzhe belongs to first lunar month and must not be omitted');
 for(const m of months)for(let i=0;i<m.segments.length;i++){const s=m.segments[i];ok(Date.parse(s.endsAt)>Date.parse(s.startsAt));if(i)eq(m.segments[i-1].endsAt,s.startsAt);const actual=z.getHoroscopeAtInstant(s.startsAt);eq(s.gz,actual.monthly.gz);eq(s.mingBranch,actual.monthly.mingBranch);eq(s.hua,actual.monthly.hua);}
 const facts=c.ziweiPeriodFacts(months[1],'MONTH_STEM');eq(facts.segments.length,months[1].segments.length);ok(!JSON.stringify(facts).includes('ZERO_CENTERED_RELATIVE_MODEL'));
});
test('Leap-month exact segments retain lunar changes; day rollover and birthday policy are explicit',()=>{
 const z=chart('2025-7-26',{horoscopeDivide:'exact',leapMonthPolicy:'SPLIT_AT_15',ageDivide:'birthday'}),m=z.getLiuYueZw(2025).find(x=>x.month===6);ok(m.segments.some(s=>s.context.lunar.isLeap));ok(m.segments.some(s=>s.context.lunar.isLeap&&s.context.lunar.effectiveMonth===7));
 const a=chart('1983-8-25',{dayDivide:'current'}),b=chart('1983-8-25',{dayDivide:'forward'});eq(a.getHoroscopeAtInstant('2026-02-16T15:30:00Z').context.lunar.year,2025);eq(b.getHoroscopeAtInstant('2026-02-16T15:30:00Z').context.lunar.year,2026);
 eq(b.getHoroscopeAtInstant('2026-02-03T15:30:00Z').context.year,2025);
 const birthday=c.Lunar.fromYmd(1983,6,10).getSolar().toYmd(),ageChart=chart(birthday,{ageDivide:'birthday'}),at=(month,day)=>{const s=c.Lunar.fromYmd(2025,month,day).getSolar();return s.toYmd()+'T00:00:00+08:00';};
 eq(ageChart.getAgeAtInstant(at(6,9)),42);eq(ageChart.getAgeAtInstant(at(6,10)),43);eq(ageChart.getAgeAtInstant(at(-6,1)),43);eq(ageChart.getAgeAtInstant(at(-6,9)),43);eq(ageChart.getAgeAtInstant(at(7,1)),43);
});
test('Mixed school compatibility preserves each source table and partitions Li-chun, lunar New Year and birthdays',()=>{
 const a=chart('1982-8-25',{yearDivide:'exact',horoscopeDivide:'exact',ageDivide:'birthday',sihuaProfile:'QUANSHU_XINGGE'}),b=chart('1983-8-25'),pair=c.JYRelationshipCore.createZiweiPair(a,b,{question:'2026年逐年分析雙方'}),row=pair.timeline.find(x=>x.year===2026);
 ok(pair.projectionGroups.some(g=>g.sourcePerson==='A'&&g.stem==='壬'&&g.star==='天府'&&g.hua==='化科'));ok(row.segments.length>=3);
 const mixed=row.segments.find(s=>s.a.annual.gz==='丙午'&&s.b.annual.gz==='乙巳');ok(mixed,'same instant, independently selected year boundaries');
 for(let i=0;i<row.segments.length;i++){const s=row.segments[i];if(i)eq(row.segments[i-1].window.endExclusive,s.window.start);eq(s.a.nominalAge,a.getAgeAtInstant(s.window.start));eq(s.b.nominalAge,b.getAgeAtInstant(s.window.start));eq(s.a.annual.gz,a.getHoroscopeAtInstant(s.window.start).annual.gz);eq(s.b.annual.gz,b.getHoroscopeAtInstant(s.window.start).annual.gz);}
 const text=c.JYRelationshipCore.dataBlock(pair,{compact:true});ok(text.includes('各方年界聯集'));ok(text.includes('分段 ['));ok(!/undefined|NaN/.test(text));
});
test('Configuration is isolated per chart; alternate four-transformations and read-time mismatch work with new algorithms',()=>{
 const a=chart('1982-8-25',{algorithm:'zhongzhou',horoscopeDivide:'exact',sihuaProfile:'QUANSHU_XINGGE'}),snapshot=JSON.stringify(a.getHoroscopeAtInstant());chart('1982-8-25',{algorithm:'default'});eq(JSON.stringify(a.getHoroscopeAtInstant()),snapshot);ok(a.sihua.some(h=>h.star==='天府'&&h.hua==='化科'));
 const n=c.JYNativeAnalysis.analyze('ziwei',a);eq(n.schoolCompletion.status,'calculated');eq(n.schoolCompletion.localSupportedOptions.algorithm,['default','zhongzhou']);ok(n.layers.months.some(m=>m.segments.length>1));eq(n.currentMinor.age,a.currentAge);
 const warning=c.JYZiweiSchoolCompletion.compute(a,{algorithm:'default'});eq(warning.policyMismatches.length,1);eq(warning.config.algorithm,'zhongzhou');
 const nested=chart('1983-8-25',{ziweiConfig:{algorithm:'zhongzhou',yearDivide:'exact'}});eq(nested.calculationPolicy.algorithm,'zhongzhou');
 c.console.error=()=>{};eq(c.computeZiwei(1983,8,25,14,'male',{algorithm:'default',ziweiConfig:{algorithm:'zhongzhou'}}),null);eq(c.computeZiwei(1983,8,25,14,'male',{horoscopeDivide:'bogus'}),null);
});
test('Supplemental month markers and exact intervals retain every overlay, transformation and flow star',()=>{
 const z=chart('1983-8-25',{algorithm:'zhongzhou',horoscopeDivide:'exact'}),before=JSON.stringify(z),a=c.JYNativeAnalysis.analyze('ziwei',z),text=c.JYNativeAnalysis.prompt('ziwei',z,'分析本月',{supplement:true}),raw=JSON.parse(text.split('\n')[1]);
 function pointer(p){return p.slice(2).split('/').reduce((v,k)=>v[k.replace(/~1/g,'/').replace(/~0/g,'~')],raw);}
 function restore(v){if(v==null||typeof v!=='object')return v;if(v.$ref)return restore(pointer(v.$ref));if(v.$table){const columns=restore(v.$table),rows=restore(v.rows);return rows.map(row=>Object.fromEntries(columns.map((k,i)=>[k,row[i]])));}if(Array.isArray(v))return v.map(restore);return Object.fromEntries(Object.entries(v).map(([k,x])=>[k,restore(x)]));}
 const p=restore(raw);eq(p.activeMonth,a.activeMonth);eq(p.layers.months.length,a.layers.months.length);
 for(let m=0;m<p.layers.months.length;m++){const actual=p.layers.months[m],expected=a.layers.months[m];eq(actual.gz,expected.gz);eq(actual.mingBranch,expected.mingBranch);eq(actual.hua,expected.hua);eq(actual.segments,expected.segments);eq(actual.palaces.length,12);
  for(let i=0;i<12;i++){eq(actual.palaces[i].branch,expected.palaces[i].branch);eq(actual.palaces[i].natalPalace,expected.palaces[i].natalPalace);eq(actual.palaces[i].transformations,expected.palaces[i].transformations);eq(actual.palaces[i].flowStars,expected.palaces[i].flowStars);ok(!Object.hasOwn(actual.palaces[i],'stars'));}
 }
 eq(JSON.stringify(z),before);ok(text.includes('本命十二宮及全部本命星組已在前文列明'));
});
fs.writeFileSync('docs/ziwei-config-validation-r15-20261004.json',JSON.stringify({testedAt:new Date().toISOString(),assertions,independentReferenceCharts:reference.cases.length,results},null,2)+'\n');
console.log('R15 Ziwei assertions '+assertions+' PASS');
