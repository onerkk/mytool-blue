'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const {environment}=require('./dom-fixture.cjs'),root=path.resolve(__dirname,'..');
const env=environment(),c=env.ctx,logs=[],results=[],plain=x=>JSON.parse(JSON.stringify(x));
c.console={log(){},warn(...a){logs.push(a.join(' '));},error(...a){logs.push(a.join(' '));}};
c.Image=function(){return c.document.createElement('img');};c.fetch=async()=>{throw Error('No live requests');};c.requestAnimationFrame=undefined;
const files=['vendor/lunar','bazi-calendar-core','solar-location','bazi','bazi_upgrade','picker-core','tarot-foundation','golden-dawn-tarot','tarot','tarot-reading','tarot_upgrade','meihua_upgrade','meihua_output_layer','meihua_upgrade2','reading-quality','ai-analysis','ziwei','ziwei-prompt-root','ziwei-standalone','bazi-prompt-root','bazi-standalone','bazi-suite-core','prompt-export','vendor/astronomy-engine-2.1.19.min','vedic-ayanamsa','astro-time','western-engine','vedic-engine','western-chart','western-prompt','vedic-prompt','astro-bridge'];
for(const file of files)vm.runInContext(fs.readFileSync(path.join(root,'JS',file+'.js'),'utf8'),c,{filename:file});
const B=c.JYAstroBridge,reference='2026-09-22T12:00:00Z',base={bdate:'1983-08-25',btime:'14:55',gender:'male',type:'general',question:'轉職需要觀察什麼？',birthLocation:{latitude:25.03,longitude:121.56,timezoneId:'Asia/Taipei',timezone:8,label:'台北'}};
const normal=B.compute(base,reference);
function reset(form=base,bundle=normal){c.S.form={...form};c.S.bazi=c.enhanceBazi(c.computeBazi(1983,8,25,14,55,'male',{referenceDate:reference}));c.S.ziwei=c.computeZiwei(1983,8,25,14,'male',{referenceDate:reference});c.S.tarot={};c.S.meihua=null;c._ootkResults=null;B.commit(c.S,bundle);logs.length=0;}
async function test(name,fn){try{await fn();results.push({name,status:'passed'});console.log('PASS '+name);}catch(e){results.push({name,status:'failed',error:e.stack});process.exitCode=1;console.error('FAIL '+name+'\n'+e.stack);}}
(async()=>{
await test('Native snapshots equal standalone engines; original civil clock reaches both',()=>{
 assert.equal(normal.input.utc,'1983-08-25T06:55:00.000Z');
 assert.deepEqual(plain(normal.western),plain(c.JYWestern.compute(normal.input)));
 assert.deepEqual(plain(normal.vedic),plain(c.JYVedic.compute(normal.input)));
 const f={...base,trueSolar:{hour:13,minute:7,utcTimestamp:0}};assert.deepEqual(plain(B.inputFor(f,reference)),plain(normal.input));
 assert(Object.isFrozen(normal.western.planets.Sun));assert(Object.isFrozen(normal.vedic.planets.Sun));
});
await test('Historical IANA offset overrides a stale fixed city offset; DST folds require a choice',()=>{
 const f={...base,bdate:'1990-07-15',btime:'09:00',birthLocation:{latitude:40.71,longitude:-74.01,timezoneId:'America/New_York',timezone:-5,label:'紐約'}};
 const i=B.inputFor(f,reference);assert.equal(i.utc,'1990-07-15T13:00:00.000Z');assert.equal(i.civil.offsetMinutes,-240);
 const b=B.compute(f,reference);assert.equal(b.western.input.utc,b.vedic.input.utc);assert.equal(b.western.input.longitude,-74.01);
 assert.throws(()=>B.inputFor({...f,bdate:'2024-03-10',btime:'02:30'},reference),/不存在/);
 const fold={...f,bdate:'2024-11-03',btime:'01:30'};assert.throws(()=>B.inputFor(fold,reference),/兩次/);
 assert.equal(+new Date(B.inputFor({...fold,astroDisambiguation:'later'},reference).utc)-+new Date(B.inputFor({...fold,astroDisambiguation:'earlier'},reference).utc),3600000);
 assert.throws(()=>B.compute({...f,birthLocation:{...f.birthLocation,latitude:100}},reference),/座標/);
 const solar=c.calcTrueSolarTime(2024,11,3,1,30,-74.01,{timezone:-5,timezoneId:'America/New_York',disambiguation:'later'});assert.equal(new Date(solar.utcTimestamp).toISOString(),B.inputFor({...fold,astroDisambiguation:'later'},reference).utc);
});
await test('All real composite payload wrappers and reading copy use the native facts without old scores',()=>{
 reset();c.S._dimResults={natal:{verdict:'STALE_MARKER'},vedic:{verdict:'STALE_MARKER'}};c.S._sevenSummary={verdict:'STALE_MARKER'};
 // A fresh commit must discard old summaries, even when the same person is recalculated.
 B.commit(c.S,normal);const p=c._buildPayload();
 assert.equal(p.dims.natal.engine,c.JYWestern.version);assert.equal(p.dims.vedic.engine,c.JYVedic.version);
 assert.deepEqual(plain(p.dims.natal),JSON.parse(p.rawReadings.natal));assert.deepEqual(plain(p.dims.vedic),JSON.parse(p.rawReadings.vedic));
 assert.deepEqual(JSON.parse(c.talkNatal('general')),plain(p.dims.natal));assert.deepEqual(JSON.parse(c.talkJyotish('general')),plain(p.dims.vedic));
 assert.deepEqual(plain(p.dims.natal.patterns),plain(normal.western.patterns));assert.deepEqual(plain(p.dims.vedic.specialRules),plain(normal.vedic.specialRules));
 for(const key of ['crossSummary','confidence','finalProb','weights'])assert(!(key in p));
 assert(!/STALE_MARKER|undefined|NaN|危險度=/.test(JSON.stringify(p)));assert.deepEqual(logs,[]);
});
await test('Actual renderers use native geometry, safe HTML, no legacy star scores',()=>{
 reset();for(const prefix of ['d-natal-','d-jyotish-'])for(const id of ['summary','chart','planets','aspects','reading','deep','yoga','dasha','transit','nakshatra','d9','d10d2','d7d4','shadbala','ashtaka','karaka','relations','remedy']){const e=env.doc.body.appendChild(new env.Element());e.id=prefix+id;}
 c.renderNatalChart();c.renderJyotish();
 const text=env.doc.body.children.map(e=>e.innerHTML).join('\n');assert(text.includes('處女'));assert(text.includes('射手'));assert(text.includes('SAV'));assert(!/undefined|NaN|\[object Object\]/.test(text),(text.match(/.{0,85}(?:undefined|NaN|\[object Object\]).{0,85}/g)||[]).slice(0,5).join('\n'));
 assert(env.doc.getElementById('d-natal-chart').innerHTML.includes('<svg'));
});
let unknown;
await test('Unknown hour uses the whole 25-hour local day and omits noon-derived houses and exact dashas',()=>{
 const f={...base,bdate:'2024-11-03',btime:'',btimeUnknown:true,timePrecision:'unknown',birthLocation:{latitude:40.71,longitude:-74.01,timezoneId:'America/New_York',timezone:-5}};
 unknown=B.compute(f,reference);reset(f,unknown);
 assert.equal(c.S.natal.ascSign,null);assert.equal(c.S.jyotish.lagna,null);assert.equal(c.S.jyotish.currentMD,null);
 const p=c._buildPayload();assert.equal(p.dims.natal.houses,null);assert.equal(p.dims.natal.progressions,null);assert.equal(p.dims.vedic.lagna,null);assert(!p.dims.vedic.dasha.nextThreeYears);assert(!p.dims.vedic.dasha.current);
 assert.equal((+new Date(unknown.western.sensitivity.utcInterval[1])-+new Date(unknown.western.sensitivity.utcInterval[0]))/3600000,25);
 c.renderNatalChart();c.renderJyotish();assert(!/undefined|NaN/.test(env.doc.body.children.map(e=>e.innerHTML).join('')));assert.deepEqual(logs,[]);
});
await test('Changed birth data is rejected at the API boundary, failed calculation clears the old chart',async()=>{
 reset();c.S.form.btime='14:56';assert.throws(()=>c._buildPayload(),/已更改/);
 c.S.form={...base,bdate:'2026-02-30'};await assert.rejects(()=>B.prepare(c.S,reference),/不存在/);assert.equal(c.S.natal,null);assert.equal(c.S.jyotish,null);assert.equal(c.S.astroBundle,null);assert(c.S.astroError);
 const p=c._buildPayload();assert.equal(p.dims.natal.status,'CALCULATION_FAILED');assert.equal(p.dims.vedic.status,'CALCULATION_FAILED');
});
await test('Concurrent submissions never commit a cancelled snapshot and recover after failure',async()=>{
 reset();const a=B.prepare(c.S,reference);c.S.form={...base,btime:'15:05'};const b=B.prepare(c.S,reference);assert.equal(await a,null);assert(await b);assert.equal(c.S.astroBundle.input.civil.time,'15:05');assert.equal(c.S.astroError,null);
});
console.log(JSON.stringify({passed:results.filter(r=>r.status==='passed').length,total:results.length},null,2));
if(process.env.JY_ASTRO_REPORT)fs.writeFileSync(process.env.JY_ASTRO_REPORT,JSON.stringify({checkedAt:new Date().toISOString(),results},null,2)+'\n');
})();
