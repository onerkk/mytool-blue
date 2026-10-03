'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const ctx=require('./native-fixtures-20261003.cjs').environment().ctx,E=ctx.JYVedic,C=ctx.JYVedicCompletion,plain=x=>JSON.parse(JSON.stringify(x)),results=[];
const input={utc:'1983-08-25T06:55:00Z',reference:'2026-10-03T00:00:00Z',latitude:23.31,longitude:120.31},chart=E.compute(input);
const close=(a,b,e=1e-7)=>assert(Math.abs(a-b)<e,`${a} != ${b}`);
function test(name,fn){try{fn();results.push({name,status:'passed'});console.log('PASS '+name);}catch(e){results.push({name,status:'failed',error:e.stack});console.error('FAIL '+name+' '+e.stack);process.exitCode=1;}}
function synthetic(signs,degrees={}){return Object.fromEntries(E.KEYS.map((k,i)=>[k,{sign:signs[k]??i,degree:degrees[k]??10+i,longitude:(signs[k]??i)*30+(degrees[k]??10+i)}]));}
function moonChart(longitude){const q=plain(chart);q.planets.Moon={...q.planets.Moon,...plain(E.placement(longitude)),nakshatra:plain(E.nakshatra(longitude))};return q;}
test('PVR17 Example59: Moon24Leo has6years remaining; Mars follows; AD starts next planet',()=>{
 const d=C.ashtottari(moonChart(144));close(d.balanceYears,6,1e-8);assert.equal(d.firstLord,'Moon');assert.deepEqual(plain(d.periods.slice(0,4).map(p=>p.lord)),['Moon','Mars','Mercury','Saturn']);assert.equal(d.periods[0].children[0].lord,'Mars');close((d.periods[0].children[0].end-d.periods[0].children[0].start)/(365.2425*86400000),15*8/108,1e-8);
});
test('BPHS46 distinct Abhijit slots and BPHS51 same-lord AD retained alongside PVR',()=>{
 for(const [x,slot] of [[276.666666-1e-5,20],[276.666666+1e-5,'Abhijit'],[280.888888-1e-5,'Abhijit'],[280.888888+1e-5,21]]){const d=C.conditionalNakshatraDasas(moonChart(x)).Ashtottari28;assert.equal(d.birthSlot.nakshatra,slot);assert.equal(d.firstLord,'Saturn');assert.equal(d.periods[0].children[0].lord,'Saturn');}
 const q=moonChart(280);assert.notEqual(C.ashtottari(q).balanceYears,C.conditionalNakshatraDasas(q).Ashtottari28.balanceYears);
});
test('PVR24 Example95: Rohini2, paramayush83, elapsed62.25, Scbalance4.75 and original nine sequence',()=>{
 const d=C.kalachakra(moonChart(45+50/60));assert.equal(d.subgroup,1);assert.equal(d.savya,false);assert.equal(d.pada,2);assert.equal(d.paramayush,83);close(d.elapsedPadaYears,62.25);close(d.balanceYears,4.75,1e-8);assert.deepEqual(plain(d.periods.slice(0,9).map(p=>p.lord)),[7,6,5,4,3,2,1,0,8]);assert.equal(d.deha,6);assert.equal(d.jeeva,5);
});
test('PVR24 Example96: Punarvasu4, Pi8.6 balance, boundary goes into Savya2 sequence',()=>{
 const d=C.kalachakra(moonChart(93));assert.equal(d.paramayush,86);close(d.balanceYears,8.6,1e-8);assert.deepEqual(plain(d.periods.slice(0,4).map(p=>p.lord)),[11,7,6,5]);
});
test('Explicit BPHS46 corrects PVR Table44/45 Revati/UttaraBhadrapada transcription conflict',()=>{
 const rev=C.kalachakra(moonChart(350)),utt=C.kalachakra(moonChart(337));assert.equal(rev.subgroup,1);assert.equal(utt.subgroup,2);assert(rev.sourceAudit.includes('Revati'));assert.equal(rev.periods[0].children.length,9);
});
test('PVR Table40 independently printed twelve normal Narayana sequences, Saturn and Ketu exceptions',()=>{
 const table=[[0,1,2,3,4,5,6,7,8,9,10,11],[1,8,3,10,5,0,7,2,9,4,11,6],[2,10,6,5,1,9,8,4,0,11,7,3],[3,2,1,0,11,10,9,8,7,6,5,4],[4,9,2,7,0,5,10,3,8,1,6,11],[5,9,1,2,6,10,11,3,7,8,0,4],[6,7,8,9,10,11,0,1,2,3,4,5],[7,2,9,4,11,6,1,8,3,10,5,0],[8,4,0,11,7,3,2,10,6,5,1,9],[9,8,7,6,5,4,3,2,1,0,11,10],[10,3,8,1,6,11,4,9,2,7,0,5],[11,3,7,8,0,4,5,9,1,2,6,10]];
 for(let s=0;s<12;s++){const p=synthetic({Saturn:(s+1)%12,Ketu:(s+2)%12});assert.deepEqual(plain(C.narayanaOrder(p,s).order),table[s]);p.Saturn.sign=s;assert.deepEqual(plain(C.narayanaOrder(p,s).order),Array.from({length:12},(_,i)=>(s+i)%12));p.Saturn.sign=(s+1)%12;p.Ketu.sign=s;const reversed=C.narayanaOrder(p,s);assert.equal(reversed.direction,-C.narayanaOrder(synthetic({Saturn:(s+1)%12,Ketu:(s+2)%12}),s).direction);assert.equal(new Set(reversed.order).size,12);}
});
test('PVR15 co-lord hierarchical stop, doubled Mercury/dispositor roles, reverse node advancement',()=>{
 const p=synthetic({Saturn:2,Mercury:2,Rahu:0,Venus:0,Mars:4,Jupiter:1,Sun:9,Moon:10,Ketu:11});const d=C.coLord(p,10);assert.equal(d.winner,'Saturn');assert.equal(d.decisive,'jupiter-mercury-dispositor-roles');assert.deepEqual(plain(d.trace.at(-1).values),[2,1]);
 p.Saturn.sign=10;assert.equal(C.coLord(p,10).winner,'Rahu');assert.equal(C.rawLength(synthetic({Mercury:5}),5,'Mercury').years,12);assert.equal(C.rawLength(synthetic({Mercury:5}),5,'Mercury').literalAdditiveYears,13);
 const ties=synthetic({Mars:2,Ketu:2},{Mars:15,Ketu:15});assert(C.coLord(ties,7,'arudha').trace.some(r=>r.key==='degree-advancement')||C.coLord(ties,7,'arudha').decisive);
});
test('PVR9 Example30 all nine graha arudhas, original exception destinations preserved',()=>{
 const p=synthetic({Sun:11,Moon:2,Mars:0,Mercury:11,Jupiter:0,Venus:11,Saturn:0,Rahu:3,Ketu:9}),a=C.arudhas(p,5);assert.deepEqual(plain(a.graha.map(r=>r.sign)),[9,4,9,2,10,1,3,5,5]);assert.equal(a.bhava.length,12);
});
test('PVR10 MercuryGe sample: Saturn fourth blocked Jupiter tenth; Venus eleventh unobstructed',()=>{
 const p=synthetic({Mercury:2,Jupiter:11,Venus:0,Saturn:5,Sun:9,Moon:9,Mars:9,Rahu:9,Ketu:8}),a=C.argala(p,2,E.naturalNatures(chart.planets)),s=a.signs[2];assert.equal(s.direction,1);assert.deepEqual(plain(s.channels[1].contributors),['Saturn']);assert.deepEqual(plain(s.channels[1].blockers),['Jupiter']);assert.equal(s.channels[2].countDecision,'unobstructed');assert.equal(a.signs[8].direction,-1);assert.equal(a.houses.length,12);assert.equal(a.planets.length,9);
});
test('PVR21 Example80 Libra lagna Drigdasa exact order; all major and minor intervals close without gap',()=>{
 const d=C.rasiDasha(chart,chart.planets,6,'Drigdasa');assert.deepEqual(plain(d.progression.order),[2,5,8,11,3,1,10,7,4,0,9,6]);
 for(const x of Object.values(chart.advanced.dashas)){assert(x.periods.length);for(let i=1;i<x.periods.length;i++)assert.equal(x.periods[i].start,x.periods[i-1].end);for(const p of x.periods){if(!p.children.length)continue;assert.equal(p.children[0].start,p.start);assert.equal(p.children.at(-1).end,p.end);for(let i=1;i<p.children.length;i++)assert.equal(p.children[i].start,p.children[i-1].end);}}
});
test('PVR4 Example6 five solar upagrahas and PVR5 Example10 SreeLagna348°47',()=>{
 const q=plain(chart);q.planets.Sun.longitude=249+36/60;q.planets.Moon.nakshatra=plain(E.nakshatra(193.1));q.lagna.longitude=175+5/60;
 const a=C.specialPoints(q);close(a.upagrahas.Dhuma.longitude,22+56/60);close(a.upagrahas.Vyatipaata.longitude,337+4/60);close(a.upagrahas.Parivesha.longitude,157+4/60);close(a.upagrahas.Indrachaapa.longitude,202+56/60);close(a.upagrahas.Upaketu.longitude,219.6);close(a.specialLagnas.SreeLagna.longitude,348+47/60);assert.equal(Object.keys(a.upagrahas).length,11);assert.equal(a.dayNightParts.length,8);
});
test('Full16 PVR18.5 varga seeds use actual D1 nth-house lord in Dn, never blindly Dn ascendant',()=>{
 for(const [d,v]of Object.entries(chart.advanced.vargas)){assert.equal(v.arudhas.graha.length,9);assert.equal(v.arudhas.bhava.length,12);assert.equal(v.argala.signs.length,12);assert.equal(v.argala.houses.length,12);if(d==='1')continue;const s=v.narayana.vargaSeed;assert.equal(s.seedHouse,((Number(d)-1)%12)+1);assert.equal(s.seedLagna,chart.vargas[d].planets[s.seedPlanet].sign);assert.equal(v.narayana.periods.length,24);}
});
test('BPHS conditional dashas compute eligibility and17 systems; old Yogini cycles cover actual reference',()=>{
 assert.equal(Object.keys(chart.advanced.dashas).length,17);for(const k of ['Shodashottari','Dwadashottari','Panchottari','Shatabdika','ChaturashitiSama','DwisaptatiSama','ShatTrimshatSama']){const d=chart.advanced.dashas[k];assert.equal(typeof d.applicability,'boolean');assert.equal(d.periods[0].children[0].lord,d.firstLord);}
 const old=moonChart(5);old.input.utc='1900-01-01T00:00:00Z';old.input.reference='2100-01-01T00:00:00Z';const d=C.yogini(old);assert(d.current);assert(d.periods.length>16);
});
test('Confirmed lagna computes all41 additional Yoga statuses and7 actual Neechabhanga predicates',()=>{
 const y=chart.advanced.yogas;assert.equal(y.checks.length,41);assert.equal(new Set(y.checks.map(r=>r.id)).size,41);assert.equal(y.neechabhanga.length,7);assert(y.neechabhanga.every(r=>r.conditions.length===4));for(const r of y.matched)assert.equal(r.established,true);assert(y.checks.every(r=>[true,false,null].includes(r.established)));
});
test('Unknown birth clock withholds all17 timelines,16 house arudhas, special ascendants and deterministic AK role',()=>{
 const q=E.compute({...input,unknownTime:true});for(const d of Object.values(q.advanced.dashas)){assert.equal(d.periods.length,0);assert.equal(d.current,null);}for(const v of Object.values(q.advanced.vargas))assert.equal(v.arudhas.bhava.length,0);assert.equal(q.advanced.specialPoints.specialLagnas.SreeLagna,undefined);assert.equal(q.advanced.eightKarakas.karakamsa,null);
});
test('Full native data and prompt preserve17 timelines,all16 Jaimini calculations without mutating chart',()=>{
 const before=JSON.stringify(chart),full=ctx.JYVedicPrompt.data(chart),s=C.promptSnapshot(chart.advanced),prompt=ctx.JYVedicPrompt.build('完整分析',chart);assert.deepEqual(plain(full.advanced),plain(chart.advanced));assert.equal(Object.keys(s.dashas).length,17);assert.equal(Object.keys(s.vargas).length,16);assert(prompt.includes('Kalachakra'));assert(prompt.includes('neechabhanga'));assert(!/NaN|undefined/.test(prompt));assert.equal(JSON.stringify(chart),before);
});
test('Exact highest-degree ties preserve bothAK candidates and withhold unique Karakamsa',()=>{
 const q=plain(chart);for(const [i,k]of E.KEYS.entries())q.planets[k].degree=5+i;q.planets.Sun.degree=29;q.planets.Moon.degree=29;q.planets.Rahu.degree=20;
 const r=C.charaKarakas(q),t=r.rank.filter(r=>r.possibleRoles.includes('AK'));assert.equal(t.length,2);assert(t.every(r=>r.role===null&&r.tied));assert.equal(r.karakamsa,null);assert.equal(r.karakamsaCandidates.length,2);
});
test('Lossless PAV bitmasks and JSONPointer dedup reconstruct all16 original contribution tables',()=>{
 const prompt=ctx.JYVedicPrompt.build('完整分析',chart),line=prompt.split('\n').find(s=>s.startsWith('{')&&s.includes('prastaraMasks')),encoded=JSON.parse(line);
 const at=p=>p.slice(2).split('/').reduce((x,k)=>x[k.replace(/~1/g,'/').replace(/~0/g,'~')],encoded);
 const expand=x=>x&&typeof x==='object'?(x.$ref?expand(at(x.$ref)):Array.isArray(x)?x.map(expand):Object.fromEntries(Object.entries(x).map(([k,v])=>[k,expand(v)]))):x;
 const full=expand(encoded);assert.equal(full.nativeAnalysis.method,'vedic');assert.equal(Object.keys(full.vargaAshtakavarga).length,16);
 for(const [d,a]of Object.entries(chart.vargaAshtakavarga)){const av=full.vargaAshtakavarga[d];for(const [k,rows]of Object.entries(a.prastara))assert.deepEqual(av.prastaraMasks[k].map(mask=>Array.from({length:12},(_,s)=>(mask>>s)&1)),plain(rows));}
});
fs.writeFileSync(path.resolve(__dirname,'../docs/vedic-completion-validation-20261003.json'),JSON.stringify({testedAt:new Date().toISOString(),sourceExamples:['PVR17 Example59','PVR24 Examples95,96','PVR Table40','PVR9 Example30','PVR10.6 Mercury example','PVR21 Example80','PVR4 Example6','PVR5 Example10','BPHS46 28slot boundaries','BPHS51 same-lord antardasa'],results,passed:results.filter(r=>r.status==='passed').length,total:results.length},null,2));
