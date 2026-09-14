'use strict';
// Independent numerical references, traditional condition fixtures, and native scene geometry.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),ctx={Date,Intl,console};ctx.globalThis=ctx;ctx.window=ctx;vm.createContext(ctx);
for(const file of ['vendor/astronomy-engine-2.1.19.min','vedic-ayanamsa','vedic-engine','vedic-prompt','vedic-picker','vedic-scene'])vm.runInContext(fs.readFileSync(path.join(root,'JS',file+'.js'),'utf8'),ctx,{filename:file});
const V=ctx.JYVedic,P=ctx.JYVedicPicker,S=ctx.JYVedicScene,results=[],speedErrors={};
const plain=x=>JSON.parse(JSON.stringify(x)),near=(a,b,e=1e-8)=>assert(Math.abs(a-b)<=e,`${a} != ${b}`);
const sample={utc:'1983-08-25T06:55:00Z',reference:'2026-09-14T04:00:00Z',latitude:23.31,longitude:120.31,civil:{date:'1983-08-25',time:'14:55',timezone:'Asia/Taipei'}};
function test(name,fn){try{fn();results.push({name,status:'passed'});console.log('PASS '+name);}catch(e){results.push({name,status:'failed',error:e.message});console.error('FAIL '+name,e.stack);process.exitCode=1;}}
function fixture(overrides={}){const lon={Sun:10,Moon:260,Mars:130,Mercury:80,Jupiter:340,Venus:345,Saturn:110,Rahu:210,Ketu:30,...overrides},planets={};for(const k of V.KEYS){const p=V.placement(lon[k]);planets[k]={...p,key:k,house:(p.sign+12-8)%12+1,dignity:V.dignity(k,lon[k]),sunSeparation:Math.abs(V.diff(lon[k],lon.Sun)),solar:V.solarCondition(k,lon[k],lon.Sun),retrograde:false};}return planets;}
function gaja(planets){return V.yogas(planets,8,V.aspects(planets,8)).find(y=>y.checks);}

test('Civil date validation: leap centuries, every month end, allowed range, no normalization',()=>{
 assert(P.validDate('2000-02-29'));assert(P.validDate('2024-02-29'));assert(!P.validDate('1900-02-29'));assert(!P.validDate('2100-02-29'));
 for(let year=1900;year<=2100;year++)for(let month=1;month<=12;month++){const end=new Date(Date.UTC(year,month,0)).getUTCDate(),prefix=year+'-'+String(month).padStart(2,'0')+'-';assert(P.validDate(prefix+end));assert(!P.validDate(prefix+(end+1)));}
 for(const value of ['',null,'2026-2-03','2026-00-01','2026-13-01','2026-01-00','1899-12-31','2101-01-01'])assert(!P.validDate(value),String(value));
});
test('All 1,440 civil minutes survive the local editor without AM/PM or UTC reinterpretation',()=>{
 for(let h=0;h<24;h++)for(let m=0;m<60;m++)assert(P.validTime(String(h).padStart(2,'0')+':'+String(m).padStart(2,'0')));
 for(const s of ['24:00','23:60','-1:00','00:00:01','1:05','12:5','',null])assert(!P.validTime(s));
});
test('Six documented combustion thresholds, retrograde exceptions, wrap and boundary behavior',()=>{
 for(const [k,retro,limit]of [['Moon',false,12],['Mars',false,17],['Mercury',false,14],['Mercury',true,12],['Jupiter',false,11],['Venus',false,10],['Venus',true,8],['Saturn',false,15]]){
  for(const sign of [-1,1]){const sun=357;assert.equal(V.solarCondition(k,sun+sign*(limit-.001),sun,retro).combust,true);assert.equal(V.solarCondition(k,sun+sign*(limit+.001),sun,retro).combust,false);}
  const boundary=V.solarCondition(k,limit,0,retro);assert.equal(boundary.thresholdDegrees,limit);assert.equal(boundary.combust,false);assert.equal(boundary.nearBoundary,true);
 }
 for(const k of ['Sun','Rahu','Ketu']){assert.equal(V.solarCondition(k,1,0).combust,null);assert.equal(V.solarCondition(k,1,0).thresholdDegrees,null);}
 near(V.solarCondition('Venus',2,358).separationDegrees,4);
});
test('Moon phase and Mercury association change natural quality independently of dignity',()=>{
 assert.equal(V.naturalNatures(fixture({Moon:100})).Moon,'benefic');assert.equal(V.naturalNatures(fixture({Moon:260})).Moon,'malefic');
 assert.equal(V.naturalNatures(fixture()).Mercury,'benefic');assert.equal(V.naturalNatures(fixture({Mercury:12})).Mercury,'malefic');
 assert.equal(V.naturalNatures(fixture({Mercury:12,Venus:13})).Mercury,'mixed');assert.equal(V.naturalNatures(fixture({Mercury:12,Venus:13,Jupiter:14})).Mercury,'benefic');
});
test('Gaja Kesari: quadrant alone cannot pass the full selected definition',()=>{
 const full=gaja(fixture());assert.equal(full.status,'structural');assert(full.checks.every(c=>c.passed===true));
 const relation=gaja(fixture({Venus:60}));assert.equal(relation.status,'relation');assert.equal(relation.name,'月木角宮關係');assert.equal(relation.checks.find(c=>c.key==='beneficSupport').passed,false);
 assert(!gaja(fixture({Moon:40})));
});
test('Gaja Kesari rejects combustion, debility and compound enemy placement; friend systems stay distinct',()=>{
 const hot=gaja(fixture({Sun:342}));assert.equal(hot.status,'relation');assert.equal(hot.checks.find(c=>c.key==='notCombust').passed,false);
 const weak=gaja(fixture({Sun:100,Moon:10,Jupiter:280,Venus:285,Saturn:250}));assert.equal(weak.checks.find(c=>c.key==='notDebilitated').passed,false);
 const bad=fixture({Sun:220,Moon:135,Jupiter:45,Mercury:50,Venus:195,Rahu:150,Ketu:330});assert.equal(gaja(bad).checks.find(c=>c.key==='notEnemy').passed,false);
 const neutral=fixture({Sun:220,Moon:135,Jupiter:45,Mercury:50,Venus:95,Rahu:150,Ketu:330});assert.equal(neutral.Jupiter.dignity.status,'enemy');assert.equal(gaja(neutral).checks.find(c=>c.key==='notEnemy').passed,true);assert.equal(gaja(neutral).status,'structural');
});
test('167 Swiss reference charts independently check the local ten-minute velocity derivative',()=>{
 const cases=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures/vedic-swiss-20260913.json'))).cases,half=10/1440;
 for(const c of cases){const t=(c.jd-2440587.5)*86400000,lo=V.astronomy(new Date(t-half*86400000),c.latitude,c.longitude,'lahiri'),hi=V.astronomy(new Date(t+half*86400000),c.latitude,c.longitude,'lahiri');
  for(const k of V.KEYS.slice(0,8)){const speed=V.diff(hi.planets[k].sidereal,lo.planets[k].sidereal)/(2*half),error=Math.abs(speed-c.sidereal[k][2]);speedErrors[k]=Math.max(speedErrors[k]||0,error);assert(error<.001,`${k} velocity error ${error} deg/day`);if(Math.abs(c.sidereal[k][2])>.005)assert.equal(speed<0,c.sidereal[k][2]<0);}
 }
});
const chart=V.compute({...sample,uncertaintyMinutes:5});
test('The user example retains its native positions and exposes the missing benefic support',()=>{
 assert.equal(chart.lagna.signName,'射手');assert.equal(chart.planets.Moon.signName,'水瓶');assert.equal(chart.yogas.find(y=>y.checks).name,'月木角宮關係');assert.equal(chart.yogas.find(y=>y.checks).checks.find(c=>c.key==='beneficSupport').passed,false);
 assert(chart.planets.Venus.solar.combust);assert(chart.planets.Venus.retrograde);assert.equal(chart.planets.Venus.solar.thresholdDegrees,8);
 const previous=V.astronomy(new Date(sample.utc),sample.latitude,sample.longitude,'lahiri');for(const k of V.KEYS)near(chart.planets[k].longitude,previous.planets[k].sidereal);
});
test('Birth-time uncertainty propagates into dasha dates, compared with independent endpoint calculations',()=>{
 const timing=chart.sensitivity.dashaTiming,ends=[];assert.equal(timing.sampleCount,21);
 for(const minutes of [-5,0,5]){const when=new Date(Date.parse(sample.utc)+minutes*60000),raw=V.astronomy(when,sample.latitude,sample.longitude,'lahiri'),ds=V.dasha(raw.planets.Moon.sidereal,when,new Date(sample.reference),365.2425);ends.push(ds.periods[0].end);assert(timing.firstLords.includes(ds.firstLord));assert(timing.currentLords.includes([ds.current.maha.lord,ds.current.antar.lord,ds.current.pratyantar.lord].join('/')));}
 assert(timing.firstEndMax>timing.firstEndMin);for(const end of ends)assert(end>=timing.firstEndMin&&end<=timing.firstEndMax);
 near(timing.firstEndMin,Math.min(...ends),1);near(timing.firstEndMax,Math.max(...ends),1);
});
test('All nine selected antardashas subdivide themselves, including the first pre-birth parent',()=>{
 const md=chart.dasha.current.maha;
 for(const ad of md.children){const pd=V.children(ad);assert.equal(pd.length,9);assert.equal(pd[0].lord,ad.lord);near(pd[0].start,ad.start,1);near(pd[8].end,ad.end,1);for(let i=1;i<9;i++)near(pd[i].start,pd[i-1].end,1);}
 const born=chart.dasha.periods[0];assert(born.start<Date.parse(sample.utc));assert(born.children.some(a=>a.start<Date.parse(sample.utc)));
});
test('3D scene uses nine native longitudes and twelve North Indian house destinations; no chart mutation',()=>{
 const before=JSON.stringify(chart),model=S.model(chart);assert.equal(model.planets.length,9);assert.equal(model.nakshatra,chart.planets.Moon.nakshatra.index);
 for(const p of model.planets){const native=chart.planets[p.key];near(p.longitude,native.longitude);assert.equal(p.house,native.house);const ringAngle=(90-Math.atan2(p.ring[1],p.ring[0])*180/Math.PI+360)%360;near(V.diff(ringAngle,native.longitude),0,1e-10);assert(p.target.every(Number.isFinite));}
 // All twelve houses tested independently from a one-occupant synthetic scene.
 const expected=[[0,1],[-1,1.5],[-1.5,1],[-1,0],[-1.5,-1],[-1,-1.5],[0,-1],[1,-1.5],[1.5,-1],[1,0],[1.5,1],[1,1.5]];
 for(let h=1;h<=12;h++){const c=plain(chart);c.planets.Sun.house=h;for(const k of V.KEYS.slice(1))c.planets[k].house=h===12?1:h+1;const p=S.model(c).planets[0];near(p.target[0],expected[h-1][0],.08);near(p.target[1],expected[h-1][1],.08);}
 assert.equal(JSON.stringify(chart),before);
});
test('Unknown time omits lagna, house destinations and determinate dasha timing in scene and prompt',()=>{
 const unknown=V.compute({...sample,unknownTime:true}),m=S.model(unknown);assert.equal(m.lagna,null);assert(m.planets.every(p=>p.house===null));assert.equal(unknown.sensitivity.dashaTiming,null);
 const payload=ctx.JYVedicPrompt.data(unknown,'general');assert.equal(payload.lagna,null);assert(payload.dasha.status.includes('時間未知'));assert(!Object.hasOwn(payload.dasha,'nextThreeYears'));
});
test('All eight prompt topics consume actual condition checks, solar state and date sensitivity',()=>{
 for(const topic of Object.keys(ctx.JYVedicPrompt.topics)){const payload=ctx.JYVedicPrompt.data(chart,topic),prompt=ctx.JYVedicPrompt.build('如何規劃 2026–2029？',chart,topic);assert.equal(payload.engine,V.version);assert.deepEqual(plain(payload.yogas),plain(chart.yogas));assert.deepEqual(plain(payload.sensitivity.dashaTiming),plain(chart.sensitivity.dashaTiming));assert.equal(payload.planets.Venus.solar.thresholdDegrees,8);assert(!/undefined|NaN|\[object Object\]/.test(prompt));}
});
const report={scope:'Numerical and explicitly selected traditional method agreement, not predictive accuracy',passed:results.filter(r=>r.status==='passed').length,total:results.length,maxSpeedErrorDegreesPerDay:speedErrors,results};
if(process.env.JY_VEDIC_REVIEW){fs.mkdirSync(process.env.JY_VEDIC_REVIEW,{recursive:true});fs.writeFileSync(path.join(process.env.JY_VEDIC_REVIEW,'design-engine-tests.json'),JSON.stringify(report,null,2));}
console.log(JSON.stringify(report));
