'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const c=require('./native-fixtures-20261003.cjs').environment().ctx,S=c.JYVedicStrength,plain=x=>JSON.parse(JSON.stringify(x)),results=[];
const input={utc:'1983-08-25T06:55:00Z',reference:'2026-10-02T04:00:00Z',latitude:23.31,longitude:120.31,uncertaintyMinutes:0};
const v=c.JYVedic.compute(input);
function close(actual,expected,tolerance=1e-8){assert(Math.abs(actual-expected)<=tolerance,actual+' != '+expected);}
function test(name,fn){try{fn();results.push({name,status:'passed'});console.log('PASS '+name);}catch(e){results.push({name,status:'failed',error:e.stack});console.error('FAIL '+name+' '+e.stack);process.exitCode=1;}}
test('Raman printed Example 48: five Cheshta values, independent given mean/true/seeghra inputs',()=>{
 const expected=[
 ['Mars',229.50,266.34,181.23,22.23],
 ['Mercury',181.52,181.23,174.49,2.30],
 ['Jupiter',84.01,66.91,181.23,35.26],
 ['Venus',171.16,181.23,158.35,5.95],
 ['Saturn',124.39,111.23,181.23,21.14]];
 // Both the printed input/angle and final output were rounded to two decimals.
 for(const [k,real,mean,apogee,out]of expected)close(S.motional(k,real,mean,apogee).virupas,out,.006);
 close(S.motional('Mars',1,359,0).midpoint,0);
});
test('Raman printed Example 55: all seven signed Drik strengths, Mercury combust',()=>{
 const x=plain(v),lons={Sun:180+53/60+55/3600,Moon:311+17/60+19/3600,Mars:229+30/60+34/3600,Mercury:181+31/60+47/3600,Jupiter:84+1/60,Venus:171+10/60,Saturn:124+22/60+41/3600};
 for(const k in lons){Object.assign(x.planets[k],{longitude:lons[k],sign:Math.floor(lons[k]/30),solar:{combust:k==='Mercury'}});}
 const s=S.compute(x),out={Sun:15.86,Moon:-21.73,Mars:.95,Mercury:15.64,Jupiter:-16.04,Venus:18.47,Saturn:7.21};
 for(const p of s.planets)close(p.drik.virupas,out[p.planet],.02);
});
test('Raman Examples 20-22: 1918 Ahargana and year/month/day lords independently recorded',()=>{
 const chart=c.JYVedic.compute({...input,utc:'1918-10-16T08:55:56Z',latitude:13,longitude:77+35/60,ayanamsa:'raman'}),clock=chart.strength.clock;
 assert.equal(clock.ahargana,714404130045);assert.equal(clock.yearLord,'Saturn');assert.equal(clock.monthLord,'Mercury');assert.equal(clock.dayLord,'Mercury');assert.equal(clock.horaLord,'Moon');assert.equal(clock.segment.lord,'Saturn');
 close(S.nathonnatha('Sun',clock.apparentHours),48.32,.03);
});
test('Mean-motion epoch and printed motions reproduce continuous rates without coercing table errors',()=>{
 const p=S.meanPositions('1899-12-31T18:56:00Z',1900);
 assert.equal(p.days,0);close(p.mean.Sun,257.4568);close(p.mean.Mars,270.22);close(p.mean.Jupiter,216.71);close(p.mean.Saturn,241.74);
 const q=S.meanPositions('1918-10-16T08:56:00Z',1918);close(q.mean.Mars,266.34,.01);close(q.mean.Saturn,111.23,.01);close(q.seeghra.Venus,158.35,.01);
 assert(S.compute(v).sourceAudit.some(x=>x.issue.includes('66.91')));
});
test('Directed ordinary and special aspect breakpoints retain selected Raman/Santanam profiles',()=>{
 const table=[[0,0],[30,0],[45,7.5],[60,15],[75,30],[90,45],[105,37.5],[120,30],[135,15],[150,0],[165,30],[180,60],[210,45],[240,30],[270,15],[300,0],[330,0],[360,0]];
 for(const [d,out]of table)close(S.aspectValue('Sun',d).virupas,out);
 for(const [k,d,out]of [['Mars',90,60],['Mars',210,60],['Jupiter',120,60],['Jupiter',240,60],['Saturn',60,60],['Saturn',270,60]])close(S.aspectValue(k,d).virupas,out);
 for(const [d,out]of [[30,0],[45,30],[60,60],[75,52.5],[240,30],[255,45],[270,60],[285,30]])close(S.aspectValue('Saturn',d,'bphs').virupas,out);
 assert.notEqual(S.aspectValue('Sun',60).virupas,S.aspectValue('Sun',300).virupas);
});
test('Temporal endpoint values: apparent midnight/noon, lunar phase and north/south Ayana',()=>{
 for(const t of [0,24]){close(S.nathonnatha('Sun',t),0);close(S.nathonnatha('Moon',t),60);}
 close(S.nathonnatha('Sun',12),60);close(S.nathonnatha('Moon',12),0);close(S.nathonnatha('Mercury',7),60);
 for(const phase of [0,180,360]){close(S.paksha('Moon',phase,{},'raman'),phase===180?120:0);close(S.paksha('Moon',phase,{},'bphs'),phase===180?60:0);}
 close(S.ayana('Sun',24).virupas,120);close(S.ayana('Sun',-24).virupas,0);close(S.ayana('Moon',24).virupas,0);close(S.ayana('Saturn',-24).virupas,60);close(S.ayana('Mercury',-12).virupas,45);
 assert.equal(S.ayana('Moon',27).beyondReference,true);
 const out=S.ishtaKashta(30,30);close(out.ishta,30);close(out.kashta,30);
});
test('Twelve Sripathi centres/sandhis cover the circle once; boundaries are half-open',()=>{
 const bs=S.sripathi({ASC:0,IC:90,DSC:180,MC:270});assert.equal(bs.length,12);
 for(let i=0;i<12;i++){close(bs[i].centre,i*30);assert.equal(S.locateBhava(bs[i].start,bs),i+1);assert.equal(S.locateBhava(bs[i].centre,bs),i+1);}
 for(let lon=0;lon<360;lon+=.25)assert.equal(bs.filter(b=>((lon-b.start+360)%360)<((b.end-b.start+360)%360)).length,1);
 assert.throws(()=>S.sripathi({ASC:270,IC:90,DSC:90,MC:270}));
});
test('Full seven-ledger arithmetic, minimum ratios and explicit luminary/variant rules',()=>{
 for(const school of ['raman','bphs']){const a=S.compute(v,{school});assert.equal(a.complete,true);assert.equal(a.planets.length,7);assert.equal(a.ranking.length,7);
 for(const p of a.planets){close(p.sthana.virupas,Object.values(p.sthana.components).reduce((a,b)=>a+b,0));close(p.kala.virupas,Object.values(p.kala.components).reduce((a,b)=>a+b,0));close(p.totalVirupas,['sthana','dig','kala','cheshta','naisargika','drik'].reduce((n,k)=>n+p[k].virupas,0));close(p.totalRupas,p.totalVirupas/60);close(p.relativeStrength,p.totalVirupas/p.minimumVirupas);}
 for(let i=1;i<a.ranking.length;i++)assert(a.ranking[i-1].relativeStrength>=a.ranking[i].relativeStrength);
 const sun=a.planets.find(p=>p.planet==='Sun'),moon=a.planets.find(p=>p.planet==='Moon');
 close(sun.cheshta.virupas,school==='raman'?0:sun.kala.components.ayana);close(moon.cheshta.virupas,school==='raman'?0:moon.kala.components.paksha);assert.equal(sun.minimumVirupas,school==='raman'?300:390);}
});
test('Planetary war: five-graha eligibility, one-degree exclusion, conservation and circular proximity',()=>{
 const x=plain(v);for(const [i,k]of ['Mars','Mercury','Jupiter','Venus','Saturn'].entries())x.planets[k].longitude=i*50+10;
 x.planets.Mars.longitude=359.7;x.planets.Mercury.longitude=.2;
 const a=S.warAdjustments(x,v.strength.planets,'raman');assert.equal(a.wars.length,1);assert.equal(a.wars[0].winner,'Mercury');close(Object.values(a.adjustments).reduce((a,b)=>a+b,0),0);close(a.wars[0].discDifference,2.8);
 x.planets.Mars.longitude=1.2;assert.equal(S.warAdjustments(x,v.strength.planets,'raman').wars.length,0);
 x.planets.Mars.longitude=.2;assert.equal(S.warAdjustments(x,v.strength.planets,'raman').complete,false);
});
test('Before-sunrise day/Hora retains preceding date; on-sunrise switches by real event',()=>{
 const clock=v.strength.clock,rise=clock.previousRise;
 const pre=c.JYVedic.compute({...input,utc:new Date(Date.parse(rise)-60000).toISOString()}).strength.clock;
 const post=c.JYVedic.compute({...input,utc:new Date(Date.parse(rise)+60000).toISOString()}).strength.clock;
 assert.notEqual(pre.traditionalDate,post.traditionalDate);assert.equal(post.dayLord,'Jupiter');assert.equal(post.horaLord,'Jupiter');assert.equal(post.horaIndex,0);assert.equal(pre.segment.daytime,false);assert.equal(post.segment.daytime,true);
});
test('Unknown time and polar absence withhold complete totals and never publish fictitious rankings',()=>{
 const unknown=c.JYVedic.compute({...input,unknownTime:true}).strength;assert.equal(unknown.complete,false);assert.equal(unknown.totalVirupas,null);assert.equal(unknown.planets.length,0);
 const polar=c.JYVedic.compute({...input,utc:'2026-06-21T10:00:00Z',latitude:75,longitude:0}).strength;assert.equal(polar.complete,false);assert.equal(polar.totalVirupas,null);assert(polar.missing.length);assert(!polar.ranking||polar.ranking.length===0);
});
test('Prompt, native activation and full JSON all consume the same calculated strength ledger',()=>{
 const a=c.JYNativeAnalysis.analyze('vedic',v);assert.equal(a.coverage.shadbalaPlanets,7);assert(a.items.some(x=>x.id==='shadbala'));
 for(const d of a.activation){const expected=v.strength.planets.find(p=>p.planet===d.lord);assert.equal(d.strength?.totalVirupas||null,expected?.totalVirupas||null);}
 const p=c.JYVedicPrompt.build('完整分析當期事業',v);assert(p.includes('Raman/Sripathi'));assert(p.includes('relativeStrength'));assert(p.includes('Ishta/Kashta'));assert(!p.includes('未計算的完整 Shadbala'));assert(!/NaN|undefined/.test(p));
});
fs.writeFileSync(path.resolve(__dirname,'../docs/vedic-strength-validation-20261003.json'),JSON.stringify({testedAt:new Date().toISOString(),scope:'Chosen Raman/Sripathi and explicitly separate Santanam formulas; published component examples, boundary and real pipeline checks',sources:['https://www.scribd.com/document/340918236/Bhava-and-Graha-Balas-B-v-RAMAN-pdf','https://vedic-astro.s3.amazonaws.com/books/bhrihat_parasara_hora_shastra.pdf'],results,passed:results.filter(x=>x.status==='passed').length,total:results.length},null,2));
console.log(JSON.stringify({passed:results.filter(x=>x.status==='passed').length,total:results.length}));
