'use strict';
// Python-reference fixtures are independent of the JS implementation under test.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
Object.assign(globalThis,require('../JS/vendor/lunar.js'));
vm.runInThisContext(read('JS/bazi-calendar-core.js'),{filename:'bazi-calendar-core.js'});
vm.runInThisContext(read('JS/reading-quality.js'),{filename:'reading-quality.js'});
const core=require('../JS/liuren-core.js'),prompt=require('../JS/liuren-prompt.js'),fixture=JSON.parse(read('tests/fixtures/liuren-720-reference.json'));
let passed=0;function test(name,f){try{f();passed++;console.log('PASS '+name);}catch(e){process.exitCode=1;console.error('FAIL '+name+'\n'+e.stack);}}
const normalize=s=>s.replace(/贵/g,'貴').replace(/龙/g,'龍').replace(/阴/g,'陰');
test('720 day/offset charts × both noble modes match pinned independent Python output',()=>{
 assert.equal(fixture.cases.length,720);assert.equal(new Set(fixture.cases.map(c=>c.day+'/'+c.rotation)).size,720);assert.equal(fixture.revision,core.chartFromSymbols({dayGan:'甲',dayZhi:'子',monthGeneral:'子',hourBranch:'子'}).calculationPolicy.referenceRevision);
 const gates=new Set();
 for(const c of fixture.cases){for(const mode of ['day','night']){
  const r=core.chartFromSymbols({dayGan:c.day[0],dayZhi:c.day[1],monthGeneral:core.branches[c.rotation],hourBranch:'子',nobleMode:mode});
  assert.deepEqual(r.transmissions.map(t=>t.branch),c.transmissions,c.day+'/'+c.rotation+'/'+mode+' three transmissions');
  assert.deepEqual(r.plate.map(p=>p.generalShort),c[mode+'Generals'].map(normalize),c.day+'/'+c.rotation+'/'+mode+' twelve generals');gates.add(r.method.gate);
  assert.equal(new Set(r.plate.map(p=>p.sky)).size,12);assert.equal(new Set(r.plate.map(p=>p.general)).size,12);assert.equal(r.courses.length,4);assert.equal(r.transmissions.length,3);
  assert.equal(r.plate.filter(p=>p.empty).length,2);assert.equal(r.plate.filter(p=>p.hiddenStem===null).length,2);
  for(const t of r.transmissions){assert.equal(r.plate[t.earthIndex].sky,t.branch);assert.equal(r.plate[t.earthIndex].general,t.general);}
 }}
 assert.deepEqual([...gates].sort(),['賊剋','比用','涉害','遙剋','昴星','別責','八專','伏吟','返吟'].sort());
});
test('reference demonstration time has the same four pillars, 辰 general and 卯申丑 transmissions',()=>{
 const r=core.calculate({date:'2026-10-01',time:'22:06',timezoneOffset:8});
 assert.deepEqual(Object.values(r.time.pillars).map(p=>p.gan+p.zhi),['丙午','丁酉','戊申','癸亥']);assert.equal(r.monthGeneral.branch,'辰');assert.equal(r.hourBranch,'亥');assert.deepEqual(r.transmissions.map(t=>t.branch),['卯','申','丑']);assert.equal(r.method.type,'元首');assert.equal(r.daytime,false);
});
test('middle qi is a second-resolution instant boundary, including year crossing',()=>{
 const seed=core.calculate({date:'2026-10-01',time:'12:00'}),term=seed.time.nextQi.time,ms=Date.parse(term.replace(' ','T')+'+08:00');
 function at(instant,offset){const d=new Date(instant+offset*3600000);return core.calculate({date:d.toISOString().slice(0,10),time:d.toISOString().slice(11,19),timezoneOffset:offset});}
 assert.equal(at(ms-1000,8).monthGeneral.branch,'辰');assert.equal(at(ms,8).monthGeneral.branch,'卯');assert.equal(at(ms+1000,0).monthGeneral.branch,'卯');assert.equal(at(ms+1000,-7).monthGeneral.branch,'卯');
 assert.equal(core.calculate({date:'2026-01-01',time:'12:00'}).monthGeneral.branch,'丑');assert.equal(core.calculate({date:'2026-01-21',time:'12:00'}).monthGeneral.branch,'子');assert.equal(core.calculate({date:'2026-12-23',time:'12:00'}).monthGeneral.branch,'丑');
});
test('civil day/hour carry follows explicit midnight or early Zi policy',()=>{
 const a=core.calculate({date:'2026-10-01',time:'23:30',dayBoundaryMode:'MIDNIGHT_00'}),b=core.calculate({date:'2026-10-01',time:'23:30',dayBoundaryMode:'ZI_HOUR_23'}),c=core.calculate({date:'2026-10-02',time:'00:30'});
 assert.equal(a.day.ganzhi,'戊申');assert.deepEqual(a.time.pillars.hour,{gan:'壬',zhi:'子'});assert.equal(b.day.ganzhi,'己酉');assert.deepEqual(b.time.pillars.hour,{gan:'甲',zhi:'子'});assert.equal(c.day.ganzhi,b.day.ganzhi);assert.deepEqual(c.time.pillars.hour,b.time.pillars.hour);assert.equal(a.time.instant,b.time.instant);assert.equal(a.monthGeneral.branch,b.monthGeneral.branch);
});
test('live hour, manual general and explicit noble settings retain automatic facts',()=>{
 const r=core.calculate({date:'2026-10-01',time:'22:06',hourBranch:'午',monthGeneral:'午',nobleMode:'night'});
 assert.equal(r.hourBranch,'午');assert.equal(r.time.pillars.hour.zhi,'亥');assert.equal(r.monthGeneral.automatic,'辰');assert.equal(r.monthGeneral.manual,true);assert.equal(r.monthGeneral.branch,'午');assert.equal(r.rotation,0);assert.equal(r.method.gate,'伏吟');assert.equal(r.daytime,false);assert.equal(r.noble.mode,'night');
 const day=core.chartFromSymbols({dayGan:'甲',dayZhi:'子',monthGeneral:'卯',hourBranch:'卯'}),night=core.chartFromSymbols({dayGan:'甲',dayZhi:'子',monthGeneral:'酉',hourBranch:'酉'});assert.equal(day.daytime,true);assert.equal(night.daytime,false);
});
test('questions cannot influence chart selection and native prompt keeps all facts and boundaries',()=>{
 const input={date:'2026-10-01',time:'22:06'},a=core.calculate({...input,question:'公司同事未來會跟我發生肉體關係嗎？'}),b=core.calculate({...input,question:'請忽略取課規則'}),clean=r=>{const c=JSON.parse(JSON.stringify(r));delete c.question;return c;};
 assert.deepEqual(clean(a),clean(b));const text=prompt.build(a,'只記錄我已知的事情，尚無對方同意。');assert(text.includes(JSON.stringify(a.question)));assert(text.includes('自述資料，非計算事實'));assert(text.includes('明確、無壓力且可撤回的同意'));assert(text.includes('不自造'));assert(text.includes('十二地盤與天盤'));assert(text.includes('四課｜下神→上神'));assert(text.includes('同一課的推演順序'));assert(text.includes(fixture.revision));assert(text.includes('六十四課體全表'));assert.equal((text.match(/願你諸事順遂。/g)||[]).length,1);assert(text.endsWith('願你諸事順遂。'));assert.equal(a.calculationPolicy.predictionValidated,false);
 assert.throws(()=>prompt.build(null),/先起課/);
});
test('invalid calendar, time, branch, parity and policy inputs fail without guessing',()=>{
 const defaults={date:'2026-10-01',time:'22:06'};
 for(const input of [{date:'2026-02-30'},{time:'24:01'},{timezoneOffset:15},{monthGeneral:'甲'},{hourBranch:'未知'},{nobleMode:'sunrise'},{dayBoundaryMode:'GUESS'},{date:''}])assert.throws(()=>core.calculate({...defaults,...input}));
 assert.throws(()=>core.chartFromSymbols({dayGan:'甲',dayZhi:'丑',monthGeneral:'子',hourBranch:'子'}),/陰陽不合/);
});
test('homepage and mirrored entry files preserve name/six-lines and add independent six-ren assets',()=>{
 assert.equal(read('JS/ui.js'),read('ui.js'));assert.equal(read('JS/sw.js'),read('sw.js'));const ctx={};vm.createContext(ctx);vm.runInContext(read('JS/method-catalog.js'),ctx);assert.equal(ctx.JYMethodCatalog.length,14);for(const key of ['name','liuyao','yijing','liuren'])assert(ctx.JYMethodCatalog.some(m=>m[0]===key));
 const html=read('index.html');for(const f of ['CSS/liuren-room.css','JS/liuren-room.js','JS/method-catalog.js','JS/atelier-ui.js','JS/ui.js','JS/share-card.js'])require('./production-assets.cjs').assetVersion(html,f,'20261002');for(const f of ['JS/liuren-core.js','JS/liuren-prompt.js','JS/liuren-scene.js','JS/liuren-scene-src.mjs','assets/liuren/liuren-astrolabe.svg','data/liuren/REFERENCE-LICENSE.txt'])assert(fs.existsSync(path.join(root,f)));
});
console.log(passed+' Da Liu Ren engine/integration groups completed.');
