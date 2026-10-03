'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const c=require('./native-fixtures-20261003.cjs').environment().ctx,S=c.JYVedicStrength,plain=x=>JSON.parse(JSON.stringify(x)),results=[];
const input={utc:'1983-08-25T06:55:00Z',reference:'2026-10-02T04:00:00Z',latitude:23.31,longitude:120.31},chart=c.JYVedic.compute(input);
const close=(a,b,t=1e-8)=>assert(Math.abs(a-b)<=t,a+' != '+b);
function test(name,fn){try{fn();results.push({name,status:'passed'});console.log('PASS '+name);}catch(e){results.push({name,status:'failed',error:e.stack});console.error('FAIL '+name+' '+e.stack);process.exitCode=1;}}
test('Raman IX Example 59: twelve printed direction/aspect components and independent lord strengths',()=>{
 const x=plain(chart),longitudes={Sun:180+54/60,Moon:311+17/60,Mars:229+31/60,Mercury:181+32/60,Jupiter:84+1/60,Venus:171+10/60,Saturn:124+23/60};
 for(const k in longitudes)Object.assign(x.planets[k],{longitude:longitudes[k],sign:Math.floor(longitudes[k]/30),solar:{combust:k==='Mercury'}});
 // Read from the published house table, independently of the runtime geometry.
 const centres=[298+27/60,331+10/60,3+53/60,36+36/60,63+53/60,91+10/60,118+27/60,151+10/60,183+53/60,216+36/60,243+53/60,271+10/60],norm=n=>(n%360+360)%360;
 const totals={Sun:424.24,Moon:389.80,Mars:298.14,Mercury:537.02,Jupiter:433.77,Venus:376.15,Saturn:389.21};
 const ledger={school:'raman',planets:Object.keys(totals).map(planet=>({planet,totalVirupas:totals[planet]})),bhavas:centres.map((centre,i)=>({house:i+1,centre,sign:Math.floor(centre/30),start:norm(centre-norm(centre-centres[(i+11)%12])/2),end:norm(centre+norm(centres[(i+1)%12]-centre)/2)}))};
 const expectedDig=[30,40,10,0,20,40,30,10,20,30,40,40],expectedDrishti=[54.18,36.44,58.99,28.10,11.57,2.92,5.70,32.51,44.80,44.51,33.12,97.55],b=S.bhavaStrength(x,ledger);
 const errors=[];for(const [i,h]of b.houses.entries()){close(h.dig.virupas,expectedDig[i]);close(h.adhipathi.virupas,totals[h.lord]);close(h.drishti.virupas,expectedDrishti[i],.25);errors.push(Math.abs(h.drishti.virupas-expectedDrishti[i]));}
 assert.equal(b.ranking[0].house,8);assert.equal(b.ranking.at(-1).house,3);
 // The last printed total is 426.76, but its components add to 526.76.
 close(b.houses[11].totalVirupas,526.76,.04);assert(b.sourceAudit.some(a=>a.issue.includes('426.76')));
 results.push({name:'Published component precision',status:'measurement',maximumVirupaDifference:Math.max(...errors),note:'Given printed house midpoints/minute-rounded planets; no fitting to inconsistent final sums'});
});
test('Four sign groups, Sagittarius/Capricorn 15-degree boundaries and all twelve direction distances',()=>{
 for(const [lon,group,weak]of [[0,'quadruped',4],[30,'quadruped',4],[60,'human',7],[90,'aquatic',10],[120,'quadruped',4],[150,'human',7],[180,'human',7],[210,'insect',1],[254.999999,'human',7],[255,'quadruped',4],[284.999999,'quadruped',4],[285,'aquatic',10],[300,'human',7],[330,'aquatic',10]]){
  for(let h=1;h<=12;h++){const d=S.bhavaDirection(h,lon);assert.equal(d.category,group);assert.equal(d.weakHouse,weak);close(d.virupas,Math.min((h-weak+12)%12,(weak-h+12)%12)*10);}
 }
 assert.throws(()=>S.bhavaDirection(0,0));assert.throws(()=>S.bhavaDirection(1,NaN));
});
test('Residential ratios: both half widths, unequal quadrant geometry and every sandhi',()=>{
 const bs=S.sripathi({ASC:298.45,IC:36.5,DSC:118.45,MC:216.5}),norm=n=>(n%360+360)%360;
 for(const b of bs){close(S.residence(b.start,bs).fraction,0);close(S.residence(b.centre,bs).fraction,1);assert.equal(S.residence(b.end,bs).house,b.house%12+1);close(S.residence(norm(b.start+norm(b.centre-b.start)/2),bs).fraction,.5);close(S.residence(norm(b.centre+norm(b.end-b.centre)/2),bs).fraction,.5);}
 for(let lon=0;lon<360;lon+=.125){const r=S.residence(lon,bs);assert(r.fraction>=0&&r.fraction<=1+1e-12);}
});
test('Runtime twelve-house sums, seven aspects per house, nine residents and distinct whole-sign lords',()=>{
 const b=chart.bhavaStrength;assert.equal(b.complete,true);assert.equal(b.houses.length,12);assert.equal(b.residential.length,9);assert.equal(b.ranking.length,12);
 for(const h of b.houses){assert.equal(h.drishti.aspects.length,7);close(h.totalVirupas,h.adhipathi.virupas+h.dig.virupas+h.drishti.virupas);close(h.totalRupas,h.totalVirupas/60);assert.equal(h.lord,c.JYVedic.LORDS[Math.floor(h.centre/30)]);assert.equal(h.adhipathi.virupas,chart.strength.totalVirupas[h.lord]);for(const a of h.drishti.aspects)close(a.contributionVirupas,a.virupas*a.weight*a.polarity);}
 for(const r of b.residential)assert(b.houses.find(h=>h.house===r.house).occupants.includes(r.planet));
 const tilted=c.JYVedic.compute({...input,latitude:52});assert(tilted.bhavaStrength.houses.some(h=>h.lord!==tilted.houses[h.house-1].lord),'High-latitude reference must exercise difference from whole-sign lord');
});
test('Mercury always full benefic for house aspects even while planetary Drik sees combustion',()=>{
 const x=plain(chart);x.planets.Mercury.solar.combust=true;const ledger=S.compute(x),b=S.bhavaStrength(x,ledger);
 assert.equal(ledger.nature.drik.Mercury,'malefic');for(const h of b.houses){const m=h.drishti.aspects.find(a=>a.planet==='Mercury');assert.equal(m.nature,'benefic');assert.equal(m.weight,1);assert(m.contributionVirupas>=0);}
 const variant=c.JYVedic.compute({...input,strengthSchool:'bphs'});assert.equal(variant.strength.school,'bphs');assert.equal(variant.bhavaStrength.policy.lordStrengthSchool,'bphs');
});
test('Unknown clock/polar incomplete lord totals keep unavailable separate from zero',()=>{
 const unknown=c.JYVedic.compute({...input,unknownTime:true}).bhavaStrength;assert.equal(unknown.complete,false);assert.equal(unknown.houses.length,0);assert.equal(unknown.ranking.length,0);
 const polar=c.JYVedic.compute({...input,utc:'2026-06-21T10:00:00Z',latitude:75,longitude:0}).bhavaStrength;assert.equal(polar.complete,false);assert.equal(polar.ranking.length,0);for(const h of polar.houses){assert.equal(h.totalVirupas,null);assert.equal(h.adhipathi.virupas,null);assert(Number.isFinite(h.dig.virupas));}
});
test('Native panel, real prompt data and immutable JSON retain exactly the same computed house ledger',()=>{
 const before=JSON.stringify(chart),a=c.JYNativeAnalysis.analyze('vedic',chart),p=c.JYVedicPrompt.build('完整分析工作與財務',chart);
 assert.equal(a.coverage.bhavaStrengthHouses,12);assert.equal(a.coverage.residentialPlanets,9);assert(a.items.some(x=>x.id==='bhava-bala'));assert.equal(JSON.stringify(a.bhavaStrength),JSON.stringify(chart.bhavaStrength));
 assert.equal(JSON.stringify(c.JYVedicPrompt.data(chart).bhavaStrength),JSON.stringify(chart.bhavaStrength));assert(p.includes('jy.vedic-bhava-strength/1'));assert(p.includes('residential'));assert(p.includes('526.76'));assert(!/NaN|undefined/.test(p));assert.equal(JSON.stringify(chart),before);
});
const report={testedAt:new Date().toISOString(),passed:results.filter(x=>x.status==='passed').length,total:results.filter(x=>x.status!=='measurement').length,results};fs.writeFileSync(path.join(__dirname,'../docs/vedic-bhava-strength-validation-20261003.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({passed:report.passed,total:report.total}));
