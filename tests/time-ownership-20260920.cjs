'use strict';
// Regression assertions concern calculation and data ownership, not predictive accuracy.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),acorn=require('acorn');
const {environment}=require('./dom-fixture.cjs');
const base=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(base,f),'utf8');
const {ctx:c}=environment();c.console={log(){},warn(){},error(){}};
const load=f=>vm.runInContext(read(f),c,{filename:f}),plain=x=>JSON.parse(JSON.stringify(x));
['JS/vendor/lunar.js','JS/bazi-calendar-core.js','JS/solar-location.js','JS/bazi.js','JS/bazi_upgrade.js','JS/bazi-prompt-root.js','JS/bazi-suite-core.js','JS/ziwei-prompt-root.js'].forEach(load);
const constants=read('JS/ai-analysis.js');
for(const n of acorn.parse(constants,{ecmaVersion:'latest'}).body){
 if(n.type==='VariableDeclaration'&&n.declarations.some(d=>['SIHUA_TABLE','ZW_PALACES','ZW_MAJOR','ZW_BRIGHTNESS'].includes(d.id.name))||n.type==='FunctionDeclaration'&&n.id.name==='getStarBright')vm.runInContext(constants.slice(n.start,n.end),c);
}
['JS/ziwei.js','JS/ziwei-standalone.js','JS/relationship-core.js','JS/relationship-ui.js'].forEach(load);

const reference='2026-09-19T04:00:00Z';
const ai={year:1983,month:8,day:25,hour:14,minute:55,gender:'male',location:{longitude:120.23,timezone:8,timezoneId:'Asia/Taipei'}};
const bi={year:2004,month:7,day:5,hour:21,minute:0,gender:'female',location:{longitude:120.54,timezone:8,timezoneId:'Asia/Taipei'}};
function person(input,ref=reference){
 const l=input.location,s=c.calcTrueSolarTime(input.year,input.month,input.day,input.hour,input.minute,l.longitude,l.timezone,l.timezoneId);
 const chart=c.computeBazi(s.year,s.month,s.day,s.hour,s.minute,input.gender,{second:s.second,birthInstant:s.utcTimestamp,trueSolarTimeApplied:true,civilTimeStatus:s.civilTimeStatus,longitude:l.longitude,timezoneId:l.timezoneId,timezoneOffset:l.timezone,dayBoundaryMode:input.boundary||'ZI_HOUR_23',referenceDate:ref});c.enhanceBazi(chart);
 const date=[input.year,String(input.month).padStart(2,'0'),String(input.day).padStart(2,'0')].join('-'),time=[input.hour,input.minute].map(x=>String(x).padStart(2,'0')).join(':');
 const meta={name:input.gender,gender:input.gender,unknown:!!input.unknown,solarInfo:s,longitude:l.longitude,timezoneId:l.timezoneId,birthLine:date+' '+(input.unknown?'時辰未知':time),civilInput:{date,time:input.unknown?null:time,gender:input.gender,timezoneId:l.timezoneId}};
 return {chart,meta,z:c.JYRelationshipCore.calculatePerson(input,ref)};
}
function pair(a,b,question='未來會發生肉體關係嗎'){
 const comp=c.BaziSuiteCore.createCompatibility(a.chart,b.chart,{scenarioId:'friendship',metaA:a.meta,metaB:b.meta});
 const ziwei=c.JYRelationshipCore.createZiweiPair(a.z,b.z,{scenarioId:'friendship',question});
 return {comp,ziwei,prompt:c.JYRelationshipCore.buildPrompt(comp,ziwei,question)};
}
const a=person(ai),b=person(bi),result=pair(a,b);let count=0;
function test(name,fn){try{fn();count++;console.log('PASS '+name);}catch(e){console.error('FAIL '+name+'\n'+e.stack);process.exitCode=1;}}
const facts=x=>c.BaziSuiteCore.verifiedBirthFacts(x.chart,x.meta),hour=x=>x.chart.pillars.hour.gan+x.chart.pillars.hour.zhi;
test('21:00 Changhua uses Bing-Xu Bazi and civil Hai Ziwei; hidden Ding is never declared exposed',()=>{
 assert.equal(b.meta.solarInfo.trueSolarDateTime,'2004-07-05 20:57:30');assert.equal(hour(b),'丙戌');
 assert.equal(b.z.birthInput.hourBranch,'亥');assert.equal(b.z.birthInput.civilTime,'21:00');
 const f=facts(b);assert.equal(f.pillars.find(x=>x.key==='hour').stemTenGod,'傷官');
 assert(f.hiddenOnlyStems.includes('丁'));assert(!f.exposedStems.some(x=>x.stem==='丁'));
 assert.deepEqual(Array.from(f.pillars.find(x=>x.key==='hour').hiddenStems,x=>x.stem),['戊','辛','丁']);
 const row=result.ziwei.birthTimeAudit.people[1];assert(row.differentHour);assert.equal(row.bazi.hourPillar,'丙戌');assert.equal(row.ziwei.hourBranch,'亥');
 assert(result.prompt.includes('時柱 丙戌'));assert(result.prompt.includes('藏干不可寫成透干'));assert(result.prompt.includes('時柱丙戌'));
 assert(result.comp.branchRelations.some(r=>r.aBranch==='未'&&r.bBranch==='戌'||/未.*戌|戌.*未/.test(r.description)));
 assert(result.ziwei.focusPalaces.includes('夫妻'));
 const html=c.JYRelationshipUI.birthTimes(result.ziwei.birthTimeAudit);assert(html.includes('丙戌'));assert(html.includes('亥時（民用 21:00）'));assert(html.includes('20:57:30'));
});
test('Minutes around the true-solar 21:00 boundary change only the intended chart',()=>{
 const before=person({...bi,minute:2}),after=person({...bi,minute:3}),later=person({...bi,minute:5});
 assert.equal(hour(before),'丙戌');assert.equal(hour(after),'丁亥');assert.equal(hour(later),'丁亥');
 for(const x of [before,after,later]){assert.equal(x.z.birthInput.hourBranch,'亥');facts(x);}
 assert(!pair(a,later).ziwei.birthTimeAudit.people[1].differentHour);
});
test('The same LiChun instant has different local solar readings but identical canonical windows',()=>{
 const periods=x=>x.chart.dayun.flatMap(d=>d.liuNian).filter(y=>y.year===2026),aa=periods(a)[0],bb=periods(b)[0];
 assert.notEqual(aa.periodStart,bb.periodStart);assert.equal(aa.timeBasis,'true-solar-wall');
 assert.equal(aa.window.start,bb.window.start);assert.equal(aa.annualWindow.start,bb.annualWindow.start);
 assert.equal(aa.annualWindow.startUtc8.slice(0,16),'2026-02-04T04:02');
 assert.equal(Date.parse(aa.window.startUtc8),Date.parse(aa.window.start));
 assert.equal(Date.parse(bb.window.endExclusiveUtc8),Date.parse(bb.window.endExclusive));
 assert(result.prompt.includes('2026-02-04T04:02:08+08:00'));
 assert(!result.prompt.includes('2026-02-04 03:49'));assert(!result.prompt.includes('2026-02-04 03:50'));
});
test('The 2029 decade transition retains both contiguous UTC segments inside one annual window',()=>{
 const x=result.comp.luckSynchronization.years.find(y=>y.year===2029);
 assert.equal(x.a.segments.length,2);const [one,two]=x.a.segments;
 assert.equal(one.dayun,'丙辰');assert.equal(two.dayun,'乙卯');
 assert.equal(one.window.endExclusive,two.window.start);
 assert.equal(one.window.start,x.window.start);assert.equal(two.window.endExclusive,x.window.endExclusive);
 assert.equal(x.window.start,x.b.annualWindow.start);
 const end=Date.parse(one.window.endExclusive);
 const pre=person(ai,new Date(end-1000).toISOString()),post=person(ai,new Date(end+1000).toISOString());
 assert.equal(pre.chart.dayun.find(d=>d.isCurrent).gz,'丙辰');assert.equal(post.chart.dayun.find(d=>d.isCurrent).gz,'乙卯');
});
test('A different civil timezone still resolves the same worldwide annual boundary',()=>{
 const ny=person({...bi,location:{longitude:-74,timezone:-5,timezoneId:'America/New_York'}});
 const p=pair(a,ny),window=p.comp.luckSynchronization.years.find(y=>y.year===2026).window;
 assert.equal(window.start,result.comp.luckSynchronization.years.find(y=>y.year===2026).window.start);
 assert.equal(facts(ny).birthInstant,'2004-07-06T01:00:00.000Z');
 assert.equal(p.ziwei.birthTimeAudit.people[1].civilDateTime,'2004-07-05 21:00:00');
});
test('Before LiChun the Bazi year stays previous year; Ziwei waits for lunar New Year',()=>{
 const before=person(ai,'2026-02-03T20:02:07Z'),after=person(ai,'2026-02-03T20:02:09Z');
 assert.equal(c.BaziSuiteCore.referenceBaziYear(before.chart),2025);assert.equal(c.BaziSuiteCore.referenceBaziYear(after.chart),2026);
 assert.equal(after.z.calculationPolicy.referenceLunarYear,2025);
 const s=c.BaziSuiteCore.buildChartDataBlock(before.chart,before.meta);
 assert(s.split('【近五個立春年度】')[1].startsWith('\n・2025'));
});
test('23:00 and midnight policies retain the distinct day-pillar date in the audit',()=>{
 const x=person({year:1994,month:6,day:20,hour:23,minute:26,gender:'female',location:bi.location});
 const row=pair(a,x).ziwei.birthTimeAudit.people[1];
 assert.equal(row.ziwei.civilDate,'1994-06-20');assert.equal(row.ziwei.dayDivide,'current');
 assert.equal(row.bazi.dayPillarDate,'1994-06-21');assert(row.differentDayDate);
 const same=person({year:1994,month:6,day:20,hour:23,minute:26,gender:'female',boundary:'MIDNIGHT_00',location:bi.location});
 assert.equal(facts(same).dayPillarDate,'1994-06-20');assert.notEqual(same.chart.pillars.day.gan,x.chart.pillars.day.gan);
 const next=person({year:1994,month:6,day:21,hour:0,minute:1,gender:'female',location:bi.location});facts(next);
});
test('Unknown hour exports only verified three pillars, no surrogate Ziwei chart or precise birth instant',()=>{
 const unknown=person({...bi,hour:12,unknown:true}),p=pair(a,unknown),f=facts(unknown);
 assert.equal(f.status,'PARTIAL_UNKNOWN_HOUR');assert.equal(f.pillars.length,3);assert.equal(f.birthInstant,null);assert.equal(f.chartDateTime,null);
 assert.equal(p.ziwei.personB,null);assert.equal(p.ziwei.birthTimeAudit.people[1].bazi.hourPillar,null);assert.equal(p.comp.directionalTenGods.aViewsB.length,3);
 assert.equal(p.comp.luckSynchronization.years.length,0);
});
test('Wrong pillars, hidden stems, ten gods and birth summaries are rejected before prompting',()=>{
 for(const mutate of [x=>x.chart.pillars.hour={gan:'丁',zhi:'亥'},x=>x.chart.cangGan.hour=['壬','甲'],x=>x.chart.gods.hour.gan='食神',x=>x.meta.civilInput.time='21:05',x=>x.meta.solarInfo.trueSolarDateTime='2004-07-05 21:00:00',x=>x.chart._birthTimestamp+=3600000]){
  const x={chart:plain(b.chart),meta:plain(b.meta),z:b.z};mutate(x);assert.throws(()=>pair(a,x),/不一致/);
 }
});
test('Mixing people, timezones or reference instants is rejected',()=>{
 const swapped=c.JYRelationshipCore.createZiweiPair(b.z,a.z,{scenarioId:'friendship'});
 assert.throws(()=>c.JYRelationshipCore.buildPrompt(result.comp,swapped,'問題'),/出生資料不一致/);
 const bad=plain(result.ziwei);bad.personB.birthInput.timezoneId='America/New_York';bad.personB.birthInput.timezoneOffset=-5;
 assert.throws(()=>c.JYRelationshipCore.buildPrompt(result.comp,bad,'問題'),/時區不一致/);
 const later=person(bi,'2027-09-19T04:00:00Z');assert.throws(()=>c.BaziSuiteCore.createCompatibility(a.chart,later.chart),/參考時刻不一致/);
});
test('All production entry points use this release; mirrors match; history cannot silently reuse old prompts',()=>{
 const html=read('index.html');for(const f of ['bazi.js','bazi-suite-core.js','bazi-suite.js','bazi-standalone.js','relationship-core.js','relationship-ui.js','ai-analysis.js'])assert(html.includes('JS/'+f+'?v=20260920time1'),f);
 for(const f of ['ai-analysis.js','bazi-suite-core.js'])assert.equal(read(f),read('JS/'+f));
 assert(read('sw.js').includes('jy-main-v88'));assert.equal(read('sw.js'),read('JS/sw.js'));
 assert(read('JS/bazi-suite.js').includes('item.timeDataVersion!==TIME_DATA_VERSION'));
});

(async()=>{
 try{
  // The shared minimal fixture handles simple selectors; this real UI also uses descendants.
  const proto=Object.getPrototypeOf(c.document.body),simpleMatch=proto.matches;
  proto.matches=function(selector){return selector.split(',').some(raw=>{
   const parts=raw.trim().split(/\s+/);if(parts.length===1)return simpleMatch.call(this,raw);
   if(!simpleMatch.call(this,parts.pop()))return false;
   let parent=this.parentNode;while(parts.length){const wanted=parts.pop();while(parent&&!simpleMatch.call(parent,wanted))parent=parent.parentNode;if(!parent)return false;parent=parent.parentNode;}return true;
  });};
  load('JS/bazi-suite.js');c.BaziSuiteUI.open('compat');
  for(const [prefix,input,city]of [['a',ai,'台南'],['b',bi,'彰化']]){
   const values={date:[input.year,String(input.month).padStart(2,'0'),String(input.day).padStart(2,'0')].join('-'),time:[input.hour,input.minute].map(v=>String(v).padStart(2,'0')).join(':'),name:prefix,gender:input.gender,country:'TW',city:String(c.BIRTH_CITIES.TW.cities.findIndex(x=>x[0].includes(city))),boundary:'ZI_HOUR_23'};
   for(const [k,v]of Object.entries(values)){const el=c.document.getElementById(prefix+'-'+k);assert(el,prefix+'-'+k);el.value=v;}
   c.document.getElementById(prefix+'-unknown').checked=false;
  }
  c.document.getElementById('c-question').value='未來會發生肉體關係嗎';
  const button=c.document.querySelector('[data-act="cast-compat"]');assert(button);
  c.document.getElementById('bzs-screen').dispatch('click',{target:button});
  // Only Promise microtasks are needed: the real engines are already loaded.
  for(let i=0;i<12;i++)await Promise.resolve();
  const state=c.BaziSuiteUI.getState(),ex=state.exportData;
  assert(ex,c.document.getElementById('bzs-toast').textContent||'UI failed to export');
  assert.equal(ex.kind,'bazi-ziwei-compatibility');assert.equal(ex.timeDataVersion,'20260920time1');
  assert.equal(ex.bazi.birthFacts.personB.pillars.find(p=>p.key==='hour').gz,'丙戌');
  assert.equal(ex.birthTimeAudit.people[1].ziwei.hourBranch,'亥');assert.equal(ex.metaB.civilInput.time,'21:00');
  assert.equal(ex.prompt,state.prompt);assert(ex.prompt.includes('時柱 丙戌'));
  const raw=JSON.parse(JSON.stringify(ex));assert.equal(raw.ziwei.birthTimeAudit.people[1].bazi.hourPillar,'丙戌');
  assert(c.document.getElementById('bzs-main').innerHTML.includes('亥時（民用 21:00）'));
  count++;console.log('PASS Actual form submission keeps UI, copied prompt and JSON on the same verified facts');
 }catch(e){process.exitCode=1;console.error('FAIL Actual form submission\n'+e.stack);}
 console.log('Time ownership regression: '+count+' groups passed.');
})();
