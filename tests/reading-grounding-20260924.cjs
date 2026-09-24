'use strict';
// Calculation / exported evidence tests. They do not measure predictive accuracy
// or claim to have called an external language model.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),acorn=require('acorn');
const {environment}=require('./dom-fixture.cjs');
const base=path.resolve(__dirname,'..'),env=environment(),c=env.ctx;
const load=f=>vm.runInContext(fs.readFileSync(path.join(base,'JS',f+'.js'),'utf8'),c,{filename:f});
let network=0,checks=0;
c.console={log(){},warn(){},error(){}};
c.fetch=()=>{network++;throw Error('No API permitted');};c.Image=function(){return env.doc.createElement('img');};
['vendor/lunar','bazi-calendar-core','solar-location','bazi','bazi_upgrade','reading-quality'].forEach(load);
const source=fs.readFileSync(path.join(base,'JS/ai-analysis.js'),'utf8');
for(const n of acorn.parse(source,{ecmaVersion:'latest'}).body){
 if(n.type==='VariableDeclaration'&&n.declarations.some(d=>['SIHUA_TABLE','ZW_PALACES','ZW_MAJOR','ZW_BRIGHTNESS'].includes(d.id.name))||n.type==='FunctionDeclaration'&&n.id.name==='getStarBright')vm.runInContext(source.slice(n.start,n.end),c);
}
['ziwei','ziwei-prompt-root','ziwei-standalone','bazi-prompt-root','bazi-suite-core','relationship-core'].forEach(load);
const plain=x=>JSON.parse(JSON.stringify(x));
function test(name,fn){try{fn();checks++;console.log('PASS '+name);}catch(e){process.exitCode=1;console.error('FAIL '+name+'\n'+e.stack);}}
const reference='2026-09-24T04:50:03.960Z';
function person(y,m,d,h,minute,gender,longitude){
 const input={year:y,month:m,day:d,hour:h,minute,gender,location:{longitude,timezone:8,timezoneId:'Asia/Taipei'}};
 const s=c.calcTrueSolarTime(y,m,d,h,minute,longitude,8,'Asia/Taipei');
 const b=c.computeBazi(s.year,s.month,s.day,s.hour,s.minute,gender,{second:s.second,birthInstant:s.utcTimestamp,trueSolarTimeApplied:true,civilTimeStatus:s.civilTimeStatus,longitude,timezoneId:'Asia/Taipei',timezoneOffset:8,dayBoundaryMode:'MIDNIGHT_00',referenceDate:reference});c.enhanceBazi(b);
 const pad=n=>String(n).padStart(2,'0');
 const meta={solarInfo:s,longitude,timezoneId:'Asia/Taipei',civilInput:{date:[y,pad(m),pad(d)].join('-'),time:pad(h)+':'+pad(minute),gender,timezoneId:'Asia/Taipei'}};
 return {b,z:c.JYRelationshipCore.calculatePerson(input,reference),meta};
}
const a=person(1983,8,25,14,55,'male',120.23),b=person(1994,6,20,12,0,'female',120.54);
const q='我與現任這段關係目前的結構性挑戰是什麼';
const comp=c.BaziSuiteCore.createCompatibility(a.b,b.b,{scenarioId:'marriage',metaA:a.meta,metaB:b.meta});
const pair=c.JYRelationshipCore.createZiweiPair(a.z,b.z,{scenarioId:'marriage',question:q});
const before=JSON.stringify([a.b,b.b,a.z.calculatedFacts,b.z.calculatedFacts]);
const prompt=c.JYRelationshipCore.buildPrompt(comp,pair,q);
test('Noon regression: exact four pillars and civil / solar hours survive',()=>{
 assert.deepEqual(Object.values(a.b.pillars).map(p=>p.gan+p.zhi),['癸亥','庚申','乙酉','癸未']);
 assert.deepEqual(Object.values(b.b.pillars).map(p=>p.gan+p.zhi),['甲戌','庚午','丁丑','丙午']);
 assert.equal(pair.birthTimeAudit.people[0].ziwei.hourBranch,'未');assert.equal(pair.birthTimeAudit.people[1].ziwei.hourBranch,'午');
 assert(prompt.includes('日柱丁丑、時柱丙午'));assert(prompt.includes('日支坐根：否'));
 assert.equal(JSON.stringify([a.b,b.b,a.z.calculatedFacts,b.z.calculatedFacts]),before);
});
test('Direct spouse branches include Chou-You half-trine, not a clash or a completed transformation',()=>{
 const rows=plain(comp.spousePalace.branchRelations);
 assert(rows.some(r=>r.typeCode==='HALF_TRINE'&&r.candidateElement==='金'&&r.missingBranches.join('')==='巳'));
 assert(!rows.some(r=>r.typeCode==='CLASH'||r.typeCode==='PUNISHMENT'));
 assert(prompt.includes('日支作用：酉丑半合金'));
 const cross=comp.branchRelations.filter(r=>r.aPillar==='hour'&&r.bPillar==='day');
 assert(cross.some(r=>r.typeCode==='CLASH'));assert(cross.some(r=>r.typeCode==='PUNISHMENT'&&r.description.includes('恃勢')));
 assert(comp.branchRelations.some(r=>r.aPillar==='hour'&&r.bPillar==='year'&&r.typeCode==='PUNISHMENT'));
 assert(comp.groupRelations.every(r=>r.description.includes('不是任何一方原局成局')));
});
test('All 144 branch pairs preserve relations when people swap; directed punishment edge remains explicit',()=>{
 const branches=[...'子丑寅卯辰巳午未申酉戌亥'];
 const chart=z=>({pillars:{day:{gan:'甲',zhi:z}}});
 for(const x of branches)for(const y of branches){
  const one=plain(c.BaziSuiteCore.branchCrossRelations(chart(x),chart(y))).map(r=>[r.typeCode,r.candidateElement||null,r.traditionalDirection||null]).sort();
  const two=plain(c.BaziSuiteCore.branchCrossRelations(chart(y),chart(x))).map(r=>[r.typeCode,r.candidateElement||null,r.traditionalDirection||null]).sort();
  // 子卯 is bidirectional; the pair and name must agree, either edge is valid.
  for(const list of [one,two])for(const row of list)if(row[2]==='子卯'||row[2]==='卯子')row[2]='子卯雙向';
  assert.deepEqual(one,two,x+y);
 }
 const partial=c.BaziSuiteCore.branchCrossRelations({pillars:{hour:{gan:'癸',zhi:'未'}}},chart('丑'),{unknownA:true});
 assert.equal(partial.length,0);
 const yin=c.BaziSuiteCore.branchCrossRelations(chart('寅'),chart('巳'));
 assert(yin.some(r=>r.description.includes('無恩之刑')));
});
test('Projection provenance distinguishes Jia Lian-Zhen Lu from Bing Lian-Zhen Ji; duplicates are not evidence votes',()=>{
 const groups=plain(c.JYRelationshipCore.projectionGroups(pair));
 const find=(stem,hua)=>groups.find(g=>g.sourcePerson==='B'&&g.targetPerson==='A'&&g.stem===stem&&g.star==='廉貞'&&g.hua===hua);
 const lu=find('甲','化祿'),ji=find('丙','化忌');
 assert(lu&&ji);assert.equal(lu.targetPalace,'遷移');assert.equal(ji.targetPalace,'遷移');
 assert(lu.origins.some(o=>o.sourceType==='PARTNER_YEAR_STEM_PROJECTION'));
 assert(!ji.origins.some(o=>o.sourceType==='PARTNER_YEAR_STEM_PROJECTION'));
 assert.deepEqual(ji.origins.map(o=>o.palace).sort(),['命宮','福德']);
 assert.equal(ji.independentCount,1);
 assert(prompt.includes('B 甲干 廉貞化祿→A 遷移(未)'));
 assert(prompt.includes('B 丙干 廉貞化忌→A 遷移(未)'));
 assert(!prompt.includes('生年甲干 廉貞化忌'));
 const row=pair.directions[1].birthStemProjection[0],saved=row.hua;row.hua='化忌';
 try{assert.throws(()=>c.JYRelationshipCore.projectionGroups(pair),/來源或落宮不一致/);}finally{row.hua=saved;}
});
test('Current question exports both complete natal charts and current periods without lifetime/no-match flooding',()=>{
 assert.equal(pair.timeline.length,1);assert.equal(pair.timeline[0].year,2026);
 assert(prompt.includes('2026-02-04T04:02:08+08:00'));assert(prompt.includes('2026-02-17T00:00:00+08:00'));
 assert(prompt.includes('44–53歲'));assert(prompt.includes('32–41歲'));
 assert(!prompt.includes('114–123歲'));assert(!prompt.includes('not-established'));assert(!prompt.includes('purple-treasury'));
 for(const f of [pair.personA,pair.personB]){
  assert.equal(f.palaces.length,12);assert(f.patternAssessment.catalog.length>0);
  for(const p of f.palaces)assert(prompt.includes(p.name+'['+p.gan+p.branch+']'));
  for(const flight of f.palaceFlights)assert(prompt.includes(flight.star+flight.hua+'→'+flight.targetPalace+'('+flight.targetBranch+')'));
 }
 assert(prompt.length<40000,'Keep the complete natal facts usable in a copied prompt');
 assert.equal((prompt.match(/https:\/\/shopee.tw\/a50h95648d\?tab=shop/g)||[]).length,1);
 assert(prompt.endsWith('願你諸事順遂。'));assert(!/undefined|NaN|\[object Object\]/.test(prompt));
 console.log('  actual relationship prompt characters: '+prompt.length);
});
test('Question windows preserve requested future years and unknown-time boundaries',()=>{
 const quality=c.JY_READING_QUALITY;
 assert.deepEqual(plain(quality.timeScope(q,2026)),{mode:'range',start:2026,end:2026});
 assert.deepEqual(plain(quality.timeScope('未來三年事業如何',2026)),{mode:'range',start:2026,end:2028});
 const future=c.JYRelationshipCore.createZiweiPair(a.z,b.z,{question:'2029到2030關係如何',scenarioId:'marriage'});
 assert.deepEqual(Array.from(future.timeline,t=>t.year),[2029,2030]);
 const years=c.JYRelationshipCore.buildPrompt(comp,future,'2029到2030關係如何');
 assert(years.includes('2029-03-22T04:05:33+08:00'));assert(years.includes('2029-05-17T18:49:10+08:00'));
 const beyond=c.BaziSuiteCore.buildCompatibilityDataBlock(comp,{compact:true,question:'2035到2036年的相處如何'}).split('【八字歲運同步】')[1];
 assert(beyond.includes('"year":2035'));assert(beyond.includes('"year":2036'));assert(!beyond.includes('"year":2026'));
 const standalone=c.JYZiweiData.serialize(a.z,{bdate:'1983-08-25',btime:'14:55',gender:'male',question:q},{compact:true});
 assert(standalone.includes('【流年走勢 2026–2026】'));assert(!standalone.includes('114–123歲'));
 const raw=c.JYZiweiData.serialize(a.z,{bdate:'1983-08-25',btime:'14:55',gender:'male'});
 assert(raw.includes('114–123歲'),'Raw serializer must preserve its full-data contract');
 const partial=c.JYRelationshipCore.createZiweiPair(a.z,null,{question:q});
 assert.equal(partial.projectionGroups.length,0);assert.equal(partial.personB,null);
});
test('All fourteen methods use answer-led paragraphs, limits only when relevant and voluntary single-design close',()=>{
 const quality=c.JY_READING_QUALITY;
 for(const kind of quality.methodKinds()){
  const p=quality.lines(kind).join('\n')+'\n'+quality.recommendationEnding(kind);
  for(const rule of ['每段先說','真正卡點','反證','可執行做法','不能寫成已發生','不為導購']){
   if(rule==='不為導購')assert(p.includes('不可為導購'));else assert(p.includes(rule),kind+' '+rule);
  }
  assert.equal((p.match(/https:\/\/shopee.tw/g)||[]).length,1);
  assert(quality.methodLines(kind).join('\n').includes('判讀主線'),kind+' must explain how to reach a judgment, not only list restrictions');
 }
 assert(quality.methodLines('compat').join('\n').includes('十神映射不是對方的心理報告'));
 assert(quality.recommendationText('compat').includes('不能因B喜土金水就叫A戴土色'));
 assert.equal(network,0);
});
test('A stale shared guide cannot override the new embedded evidence and voice safeguards',()=>{
 const saved=c.JY_READING_QUALITY;
 c.JY_READING_QUALITY={readingVersion:'6.3.0',version:'4.4.0',lines:()=>['STALE_SENTINEL'],methodLines:()=>[],recommendationEnding:()=> 'STALE_SHOP'};
 try{
  const fallback=c.JYRelationshipCore.buildPrompt(comp,pair,q);
  assert(!fallback.includes('STALE_SENTINEL'));assert(!fallback.includes('STALE_SHOP'));
  assert(fallback.includes('十神映射不是對方的心理報告'));assert(fallback.includes('每段先說'));
 }finally{c.JY_READING_QUALITY=saved;}
});
if(process.env.JY_OUTPUT_REVIEW){fs.mkdirSync(process.env.JY_OUTPUT_REVIEW,{recursive:true});fs.writeFileSync(path.join(process.env.JY_OUTPUT_REVIEW,'relationship-current-prompt.txt'),prompt);}
console.log('reading-grounding: '+checks+'/8 groups passed; no external AI requests.');
