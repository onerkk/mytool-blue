'use strict';
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),ctx={Date,Intl,console};ctx.globalThis=ctx;vm.createContext(ctx);
for(const f of ['vendor/astronomy-engine-2.1.19.min','vedic-ayanamsa','vedic-engine','vedic-prompt'])vm.runInContext(fs.readFileSync(path.join(root,'JS',f+'.js'),'utf8'),ctx,{filename:f});
const V=ctx.JYVedic,P=ctx.JYVedicPrompt,results=[],plain=x=>JSON.parse(JSON.stringify(x));
const sample={utc:'1983-08-25T06:55:00Z',reference:'2026-09-13T04:00:00Z',latitude:23.31,longitude:120.31,civil:{date:'1983-08-25',time:'14:55',timezone:'Asia/Taipei'}};
function test(name,fn){try{fn();console.log('PASS '+name);results.push({name,status:'passed'});}catch(e){console.error('FAIL '+name,e);results.push({name,status:'failed',error:e.message});process.exitCode=1;}}
function close(a,b,eps=1e-8){assert(Math.abs(a-b)<=eps,`${a} != ${b}`);}
let maxima={};
test('167 independent Swiss / Moshier charts: sidereal planets, mean node, ascending intersection and ayanamsa',()=>{
 const cases=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures/vedic-swiss-20260913.json'))).cases;
 for(const x of cases){const a=V.astronomy(new Date((x.jd-2440587.5)*86400000),x.latitude,x.longitude,'lahiri');
  for(const key of [...V.KEYS.slice(0,8),'ascendant','ayanamsa']){
   const actual=key==='ascendant'?a.ascendant:key==='ayanamsa'?a.ayanamsa:a.planets[key].sidereal,expected=key==='ascendant'?x.ascendant:key==='ayanamsa'?x.ayanamsa:x.sidereal[key][0];
   const error=Math.abs(V.diff(actual,expected))*3600;maxima[key]=Math.max(maxima[key]||0,error);
   const limit={ascendant:10,ayanamsa:.5,Rahu:.5,Moon:5,Sun:3}[key]||25;assert(error<limit,`${key} ${x.jd}: ${error} arcseconds`);
  }
  close(Math.abs(V.diff(a.planets.Ketu.sidereal,a.planets.Rahu.sidereal)),180);
 }
});
test('All 27 nakshatra and 108 pada boundaries, wrapping and half-open intervals',()=>{
 for(let k=0;k<108;k++){
  const x=k*360/108,n=V.nakshatra(x);assert.equal(n.index,Math.floor(k/4));assert.equal(n.pada,k%4+1);
  assert.equal(V.nakshatra(x+1e-7).index,Math.floor(k/4));
  assert.equal(V.nakshatra(x-1e-7).pada,(k+3)%4+1);
 }
 assert.equal(V.nakshatra(360).name,'Ashwini');assert.equal(V.nakshatra(-.1).name,'Revati');
});
test('72 polar ascendants and 6 Raman charts agree with separately generated Swiss references',()=>{
 const f=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures/vedic-swiss-extra-20260913.json')));
 for(const [mode,cases]of [['lahiri',f.polar],['raman',f.raman]])for(const x of cases){const a=V.astronomy(new Date((x.jd-2440587.5)*86400000),x.latitude,x.longitude,mode);assert(Math.abs(V.diff(a.ascendant,x.ascendant))*3600<10);if(x.Moon!=null){assert(Math.abs(V.diff(a.planets.Moon.sidereal,x.Moon))*3600<5);assert(Math.abs(a.ayanamsa-x.ayanamsa)*3600<.5);}}
});
test('Sixteen divisional charts: independent textbook examples and documented D3 erratum',()=>{
 const expected={1:8,2:3,3:4,4:5,7:2,9:8,10:5,12:7,16:11,20:11,24:3,27:2,30:6,40:3,45:4,60:7};
 // PVR Example 27 prints D3 Libra, contradicting its own same/5th/9th rule.
 // 29°49 Sagittarius is in the ninth sign FROM Sagittarius: Leo, not Libra.
 for(const [d,s]of Object.entries(expected))assert.equal(V.varga(269+49/60,+d).sign,s,'D'+d);
 const examples=[[71,9,9],[229,9,8],[70,10,5],[229,10,9],[71,16,1],[229,16,2],[71,24,0],[229,24,6],[222+58/60,60,8]];
 for(const [lon,d,s]of examples)assert.equal(V.varga(lon,d).sign,s);
 for(const [x,s]of [[0,0],[5,10],[10,8],[18,2],[25,6],[30,1],[35,5],[42,11],[50,9],[55,7]])assert.equal(V.varga(x,30).sign,s);
 assert.equal(V.varga(14.999999,2).sign,4);assert.equal(V.varga(15,2).sign,3);assert.equal(V.varga(45,2).sign,4);
});
test('Dignity degree transitions: Moon, Mercury, and moolatrikona end points',()=>{
 for(const [k,x,s]of [['Moon',32.999,'exalted'],['Moon',33,'moolatrikona'],['Moon',59.99,'moolatrikona'],['Mercury',164.99,'exalted'],['Mercury',165,'moolatrikona'],['Mercury',170,'own'],['Mars',0,'moolatrikona'],['Mars',12,'own'],['Sun',140,'own'],['Venus',195,'own']])assert.equal(V.dignity(k,x).status,s);
 assert.equal(V.dignity('Rahu',10).status,'node');
});
test('Vimshottari Example 50: 809.55-day remainder, pre-birth MD/AD, full-length proportion and exact transitions',()=>{
 const birth=new Date('2000-04-28T09:50:00Z'),d=V.dasha(302+23/60,birth,birth,360);
 assert.equal(d.firstLord,'Mars');close(d.balanceYears,2.24875);close((d.periods[0].end-birth)/86400000,809.55);
 assert(d.periods[0].start<+birth);assert.equal(d.current.antar.lord,'Ketu');
 close((d.periods[0].children[0].end-d.periods[0].children[0].start)/86400000,147);
 for(const m of d.periods){assert.equal(m.children[0].start,m.start);assert.equal(m.children[8].end,m.end);for(let i=1;i<9;i++)assert.equal(m.children[i-1].end,m.children[i].start);}
 const end=d.periods[0].end,at=V.dasha(302+23/60,birth,end,360),before=V.dasha(302+23/60,birth,end-1,360);assert.equal(at.current.maha.lord,'Rahu');assert.equal(before.current.maha.lord,'Mars');
 assert.equal(V.dasha(1,birth,+birth-1,360).current,null);
 assert(V.dasha(1,birth,new Date('2125-01-01'),365.2425).current);
 for(const ad of d.periods[0].children){const kids=V.children(ad);assert.equal(kids[0].start,ad.start);assert.equal(kids[8].end,ad.end);}
});
test('IANA civil time: Taiwan, India, DST gap/fold, invalid dates and half-hour offset',()=>{
 assert.equal(V.civilToUTC({date:'1983-08-25',time:'14:55',timezone:'Asia/Taipei'}).date.toISOString(),'1983-08-25T06:55:00.000Z');
 assert.equal(V.civilToUTC({date:'2000-01-01',time:'12:00',timezone:'Asia/Kolkata'}).date.toISOString(),'2000-01-01T06:30:00.000Z');
 assert.throws(()=>V.civilToUTC({date:'2026-03-08',time:'02:30',timezone:'America/New_York'}),/不存在/);
 const fold={date:'2026-11-01',time:'01:30',timezone:'America/New_York'};assert.throws(()=>V.civilToUTC(fold),/兩次/);
 assert.equal(V.civilToUTC({...fold,disambiguation:'later'}).date-V.civilToUTC({...fold,disambiguation:'earlier'}).date,3600000);
 assert.throws(()=>V.civilToUTC({date:'2026-02-30',time:'12:00',timezone:'Asia/Taipei'}),/不存在/);
 assert.throws(()=>V.civilToUTC({date:'2026-01-01',time:'25:00',timezone:'Asia/Taipei'}));
});
const c=V.compute(sample);
test('Immutable chart: 16 vargas, whole signs, all nine grahas and 36 actual monthly transit samples',()=>{
 assert.equal(Object.keys(c.vargas).length,16);assert.equal(c.planets.Rahu.house,(c.planets.Rahu.sign-c.lagna.sign+12)%12+1);
 assert.equal(c.transitSnapshots.length,36);assert(Object.isFrozen(c.planets.Moon));assert.throws(()=>{c.planets.Moon.longitude=12;});
 for(const v of Object.values(c.vargas))for(const k of V.KEYS)assert.equal(v.planets[k].house,(v.planets[k].sign-v.lagna.sign+12)%12+1);
 assert(!/NaN|undefined|\[object Object\]/.test(JSON.stringify(c)));assert.equal(c.input.utc,sample.utc.replace('00Z','00.000Z'));
 assert(!Object.isFrozen(sample.civil),'Do not freeze caller-owned input');
});
test('All seven BAV totals, SAV 337, and each prastara contribution independently reconstructed',()=>{
 assert.deepEqual(plain(Object.fromEntries(Object.entries(c.ashtakavarga.bav).map(([k,v])=>[k,v.reduce((a,b)=>a+b,0)]))),{Sun:48,Moon:49,Mars:39,Mercury:54,Jupiter:56,Venus:52,Saturn:39});
 assert.equal(c.ashtakavarga.total,337);
 const synthetic={};V.KEYS.forEach(k=>synthetic[k]={sign:2});const a=V.ashtakavarga(synthetic,2);
 // Jupiter from Venus, PVR Example 37: Venus Gemini -> Cn Li Sc Aq Pi Ar.
 assert.deepEqual(plain(a.prastara.Jupiter[5].flatMap((x,i)=>x?[i]:[])),[0,3,6,7,10,11]);
 for(const k of V.KEYS.slice(0,7))for(let i=0;i<12;i++)assert.equal(c.ashtakavarga.bav[k][i],c.ashtakavarga.prastara[k].reduce((n,a)=>n+a[i],0));
});
test('Directed drishti and arudha exceptions are geometric, not interchangeable',()=>{
 const ps={};V.KEYS.forEach(k=>ps[k]={sign:0,longitude:0});ps.Jupiter={sign:2,longitude:60};ps.Mars={sign:4,longitude:120};ps.Saturn={sign:8,longitude:240};
 const a=V.aspects(ps,0);assert.deepEqual(plain(a.graha.filter(x=>x.from==='Jupiter').map(x=>x.toSign)),[6,8,10]);assert.deepEqual(plain(a.graha.filter(x=>x.from==='Mars').map(x=>x.toSign)),[7,10,11]);assert(!a.graha.some(x=>x.from==='Rahu'));
 ps.Mars={sign:0,longitude:0};assert.equal(V.arudhas(ps,0)[0].sign,9);ps.Mars={sign:3,longitude:90};assert.equal(V.arudhas(ps,0)[0].sign,3);ps.Mars={sign:6,longitude:180};assert.equal(V.arudhas(ps,0)[0].sign,9);
});
test('Time sensitivity computes alternatives; unknown time omits houses and exact prompt dasha',()=>{
 const s=V.compute({...sample,uncertaintyMinutes:5});assert(s.sensitivity.changes.some(x=>x.key==='Lagna/D60'));
 const unknown=V.compute({...sample,unknownTime:true});assert.equal(unknown.lagna,null);assert.equal(unknown.houses.length,0);assert.equal(unknown.ashtakavarga,null);assert.equal(unknown.dasha.current,null);assert(!JSON.stringify(P.data(unknown,'general').dasha).includes('nextThreeYears'));
});
test('Eight topic prompts reuse native facts, exact date anchors, proper method paths and branding',()=>{
 const before=JSON.stringify(c),q='我適合配戴什麼手鍊？也想了解 2026–2029 轉職的節奏。';
 for(const key of Object.keys(P.topics)){const text=P.build(q,c,key);assert(text.includes(q));assert(text.includes('副運按完整大運比例分配'));assert(text.includes('十六分盤如何交叉判讀'));assert(text.includes('本題深入方向'));assert(text.includes('移動')||text.includes('日常'));assert(!/undefined|NaN|\[object Object\]/.test(text));assert.equal((text.match(/https:\/\/shopee.tw\/a50h95648d/g)||[]).length,1);assert(text.includes(c.planets.Moon.nakshatra.name));}
 assert.equal(before,JSON.stringify(c));assert.equal(P.data(c,'career').dasha.current.maha.lord,c.dasha.current.maha.lord);
});
test('Input failures are explicit, never silently substitute a different mode/date',()=>{
 assert.throws(()=>V.compute({...sample,latitude:NaN}));assert.throws(()=>V.compute({...sample,ayanamsa:'unknown'}));assert.throws(()=>V.compute({...sample,yearDays:366}));assert.throws(()=>V.compute({...sample,utc:'1800-01-01'}));assert.throws(()=>V.compute({...sample,uncertaintyMinutes:-1}));
 assert.throws(()=>V.compute({...sample,utc:null}));assert.throws(()=>V.compute({...sample,utc:'2000-01-01T12:00:00'}));assert.throws(()=>V.civilToUTC({date:'2000-01-01',time:'12:00'}));
});
test('Legacy dasha projection also preserves pre-birth AD and uses the natal UTC Julian day',()=>{
 const e=require('./dom-fixture.cjs').environment();vm.runInContext(fs.readFileSync(path.join(root,'JS/bazi.js'),'utf8'),e.ctx);
 const b=new Date('2000-04-28T09:50:00Z'),ds=e.ctx.jyCalcDasha(302+23/60,b);assert(ds[0].fullStart<b);assert(ds[0].antardashas[0].start<b);close((ds[0].antardashas[0].end-ds[0].antardashas[0].start)/86400000,7*7/120*365.25,1e-7);
 const n=e.ctx.computeNatalChart(1983,8,25,14,55,120.31,23.31),j=e.ctx.computeJyotish(n,1983,8,25,14,55);assert.equal(j.dashas[0].start.toISOString(),'1983-08-25T06:55:00.000Z');
 assert.equal(e.ctx.jyGetDignity('Moon',1,10),'moola');assert.equal(e.ctx.jyGetDignity('Mercury',5,22),'own');
});
if(process.env.JY_VEDIC_REVIEW){const out=process.env.JY_VEDIC_REVIEW;fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'engine-tests.json'),JSON.stringify({scope:'Calculation agreement and traditional-method implementation, not prediction accuracy',maxErrorArcseconds:maxima,results},null,2));fs.writeFileSync(path.join(out,'example-chart.json'),JSON.stringify(c,null,2));for(const key of Object.keys(P.topics))fs.writeFileSync(path.join(out,'prompt-'+key+'.txt'),P.build('我適合配戴什麼手鍊？也想了解 2026–2029 轉職的節奏。',c,key));}
console.log(JSON.stringify({passed:results.filter(x=>x.status==='passed').length,total:results.length,maxErrorArcseconds:maxima}));
