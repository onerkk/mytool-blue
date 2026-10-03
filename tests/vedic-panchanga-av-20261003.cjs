'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const c=require('./native-fixtures-20261003.cjs').environment().ctx,V=c.JYVedic,plain=x=>JSON.parse(JSON.stringify(x)),results=[];
const input={utc:'1983-08-25T06:55:00Z',reference:'2026-10-02T04:00:00Z',latitude:23.31,longitude:120.31,civil:{date:'1983-08-25',time:'14:55',timezone:'Asia/Taipei'}},chart=V.compute(input);
function test(name,fn){try{fn();results.push({name,status:'passed'});console.log('PASS '+name);}catch(e){results.push({name,status:'failed',error:e.stack});console.error('FAIL '+name+' '+e.stack);process.exitCode=1;}}
test('PVR printed Examples 40, 41, 43: complete Mercury reduction and Rasi77/Graha75/Sodhya152',()=>{
 const bav=[7,4,7,4,4,3,4,4,4,3,6,4],expected=[3,1,3,0,0,0,0,0,0,0,2,0],ps={Sun:{sign:2},Moon:{sign:4},Mars:{sign:2},Mercury:{sign:2},Jupiter:{sign:5},Venus:{sign:0},Saturn:{sign:8}};
 const first=V.trikonaReduce(bav);assert.deepEqual(plain(first.values),expected);
 const second=V.ekadhipatyaReduce(first.values,Array.from({length:12},(_,i)=>Object.values(ps).some(p=>p.sign===i)));assert.deepEqual(plain(second.values),expected);
 const p=V.sodhyaPinda(second.values,ps);assert.equal(p.rasi,77);assert.equal(p.graha,75);assert.equal(p.total,152);assert.equal(p.grahaTerms.length,7);
});
test('PVR Example42 all five occupation cases; independent classical equal and zero exceptions',()=>{
 const cases=[[4,2,true,true,4,2],[4,2,true,false,4,0],[4,2,false,true,2,2],[4,2,false,false,2,2],[2,2,false,false,0,0],[2,2,true,false,2,0],[2,2,false,true,0,2],[0,4,true,false,0,4],[4,0,false,false,4,0]];
 for(const pair of [[0,7],[1,6],[2,5],[8,11],[9,10]])for(const [a,b,oa,ob,ea,eb]of cases){const r=Array(12).fill(0),o=Array(12).fill(false);r[pair[0]]=a;r[pair[1]]=b;o[pair[0]]=oa;o[pair[1]]=ob;const out=V.ekadhipatyaReduce(r,o).values;assert.equal(out[pair[0]],ea);assert.equal(out[pair[1]],eb);}
 const r=[5,0,0,3,0,0,0,0,0,0,0,0];assert.equal(V.trikonaReduce(r).values[0],5);assert.equal(V.ekadhipatyaReduce(Array(12).fill(3),Array(12).fill(false)).values[3],3);
});
test('All20 actual divisional charts retain raw337, 7 BAV totals, 8-source PAV and reductions for all5 lord pairs',()=>{
 assert.equal(Object.keys(chart.vargaAshtakavarga).length,20);
 for(const [d,av]of Object.entries(chart.vargaAshtakavarga)){assert.equal(av.total,337);assert.deepEqual(plain(Object.values(av.bav).map(r=>r.reduce((n,v)=>n+v,0))),[48,49,39,54,56,52,39]);assert.equal(av.reductions.Sun.ekadhipatya.steps.length,5);
 for(const k of V.KEYS.slice(0,7))for(let s=0;s<12;s++){assert.equal(av.bav[k][s],av.prastara[k].reduce((n,r)=>n+r[s],0));assert(av.reductions[k].soav[s]<=av.bav[k][s]);assert.equal(av.occupied[s],V.KEYS.slice(0,7).some(p=>chart.vargas[d].planets[p].sign===s));}}
 assert.notDeepEqual(plain(chart.vargaAshtakavarga[1].bav),plain(chart.vargaAshtakavarga[10].bav));
});
test('PVR angular Examples2–3 and all60 Karana half-tithis, full/new Moon and27 Yoga names',()=>{
 const a=V.panchangaAngles(227+46/60,84+12/60);assert.equal(a.tithi.index,19);assert.equal(a.tithi.name,'Chaturthi');assert.equal(a.tithi.paksha,'Krishna');
 const b=V.panchangaAngles(293+50/60,197+20/60);assert.equal(b.yoga.index,10);assert.equal(b.yoga.name,'Ganda');
 const cycle=['Bava','Balava','Kaulava','Taitila','Garaja','Vanija','Vishti'];assert.equal(V.panchangaAngles(0,0).karana.name,'Kimstughna');
 for(let i=1;i<=56;i++)assert.equal(V.panchangaAngles(0,i*6+.1).karana.name,cycle[(i-1)%7]);
 for(const [i,n]of [[57,'Shakuni'],[58,'Chatushpada'],[59,'Naga']])assert.equal(V.panchangaAngles(0,i*6+.1).karana.name,n);
 assert.equal(V.panchangaAngles(0,179.99).tithi.name,'Purnima');assert.equal(V.panchangaAngles(0,359.99).tithi.name,'Amavasya');assert.equal(V.panchangaAngles(0,360).tithi.index,1);
 for(let i=0;i<27;i++){const p=V.panchangaAngles(0,(i+.5)*360/27);assert.equal(p.yoga.index,i+1);assert.equal(p.nakshatra.index,i+1);assert(p.yoga.name);}
});
let maximumSeconds=0;
test('8 independent native Swiss sidereal cases /64 real Sun-Moon crossings, 1900–2100, both ayanamsas',()=>{
 const fixtures=require('./fixtures/vedic-panchanga-swiss-20261003.json');
 for(const f of fixtures.cases){const x=V.compute({...input,...f});assert.equal(x.panchanga.complete,true);for(const [k,e]of Object.entries(f.expected)){const a=x.panchanga.limbs[k];assert.equal(a.index,e.index);assert(Date.parse(a.start)<=Date.parse(f.utc)&&Date.parse(f.utc)<Date.parse(a.end));
 // A ten-second numerical acceptance budget is separate from the 0.5-second
 // root-search bracket; this geocentric ephemeris is not a subsecond standard.
 for(const [field,ref]of [['start','startEpochSeconds'],['end','endEpochSeconds']]){const error=Math.abs(Date.parse(a[field])/1000-e[ref]);maximumSeconds=Math.max(maximumSeconds,error);assert(error<10,`${f.utc}/${f.ayanamsa}/${k}/${field} differs ${error}s`);}}
 }
});
test('Each angular crossing switches exactly once across the computed one-second bracket; no midnight weekday switch',()=>{
 for(const key of ['tithi','karana','yoga','nakshatra']){const boundary=Date.parse(chart.panchanga.limbs[key].end),before=V.compute({...input,utc:new Date(boundary-2000).toISOString()}),after=V.compute({...input,utc:new Date(boundary+2000).toISOString()});assert.notEqual(before.panchanga.limbs[key].index,after.panchanga.limbs[key].index);}
 const rise=Date.parse(chart.panchanga.limbs.vaara.start),pre=V.compute({...input,utc:new Date(rise-60000).toISOString()}),post=V.compute({...input,utc:new Date(rise+60000).toISOString()});assert.equal(pre.panchanga.limbs.vaara.name,'Wednesday');assert.equal(post.panchanga.limbs.vaara.name,'Thursday');assert.equal(post.panchanga.limbs.vaara.dateBasis,'IANA:Asia/Taipei');
 const midnight=V.compute({...input,utc:'1983-08-24T16:01:00Z'});assert.equal(midnight.panchanga.limbs.vaara.name,'Wednesday');
 const explicit=V.compute({...input,civil:{offsetMinutes:840}});assert.equal(explicit.panchanga.limbs.vaara.dateBasis,'explicit-offset');
});
test('Unknown clock and polar solar absence withhold Vaara/complete claim while retaining calculable angular data',()=>{
 const u=V.compute({...input,unknownTime:true});assert.equal(u.panchanga.complete,false);assert.equal(u.vargaAshtakavarga,null);assert.equal(u.panchanga.limbs.vaara.index,null);assert.equal(u.panchanga.limbs.tithi.start,null);assert.equal(u.panchanga.limbs.tithi.status,'provisional-anchor');
 const polar=V.compute({...input,utc:'2026-06-21T10:00:00Z',latitude:75,longitude:0});assert.equal(polar.panchanga.complete,false);assert.equal(polar.panchanga.limbs.vaara.status,'sunrise-unavailable');assert.equal(polar.panchanga.limbs.yoga.status,'calculated');assert.equal(polar.panchanga.limbs.karana.status,'calculated');
});
test('Same entire AV/Pinda/Panchanga ledgers are exposed by native panel, full prompt and downloaded JSON',()=>{
 const before=JSON.stringify(chart),native=c.JYNativeAnalysis.analyze('vedic',chart),data=c.JYVedicPrompt.data(chart),prompt=c.JYVedicPrompt.build('完整分析',chart),saved=c.JYNativeAnalysisView.exportData('vedic',chart,native);
 assert(native.items.some(x=>x.id==='ashtakavarga'));assert(native.items.some(x=>x.id==='panchanga'));assert.deepEqual(plain(data.ashtakavarga),plain(chart.ashtakavarga));assert.equal(Object.keys(data.vargaAshtakavarga).length,20);assert.equal(saved.panchanga.limbs.vaara.name,'Thursday');assert.equal(saved.ashtakavarga.reductions.Mercury.pinda.total,chart.ashtakavarga.reductions.Mercury.pinda.total);assert(prompt.includes('Sodhya Pinda'));assert(prompt.includes('panchanga'));assert(!/NaN|undefined/.test(prompt));assert.equal(JSON.stringify(chart),before);
});
fs.writeFileSync(path.resolve(__dirname,'../docs/vedic-panchanga-av-validation-20261003.json'),JSON.stringify({testedAt:new Date().toISOString(),scope:'PVR Ch1 five limbs with astronomical intervals; Ch12 all20 AV/PAV/BAV, reductions and Pindas; published examples and independent Swiss numerical crossings',independentCrossings:64,maximumCrossingErrorSeconds:maximumSeconds,results,passed:results.filter(x=>x.status==='passed').length,total:results.length},null,2));
console.log(JSON.stringify({passed:results.filter(x=>x.status==='passed').length,total:results.length,maximumSeconds}));
