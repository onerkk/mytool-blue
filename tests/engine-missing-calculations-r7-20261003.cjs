'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{environment}=require('./native-fixtures-20261003.cjs'),e=environment(),c=e.ctx,plain=x=>JSON.parse(JSON.stringify(x)),results=[];
function test(name,fn){fn();results.push({name,status:'passed'});console.log('PASS '+name);}
function near(actual,expected,tolerance=1e-8){assert(Math.abs(actual-expected)<=tolerance,actual+' vs '+expected);}
const start='2026-10-03T04:00:00Z',at=d=>new Date(Date.parse(start)+d*86400000).toISOString(),event=(a,b,d,angle=0)=>({a,b,angle,utc:at(d)});
function western(assign){const ps={};['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn'].forEach((k,i)=>ps[k]={key:k,longitude:20+i*40,speed:.02*(7-i),house:1,sign:Math.floor((20+i*40)/30)});for(const [k,p]of Object.entries(assign))ps[k]={...ps[k],...p,sign:Math.floor(p.longitude/30)};return {input:{utc:start},planets:ps,houses:null,essentialDignities:{dignityHosting:[]}};}
function light(ch,events,past=[],stations=[],ingresses=[]){const keys=Object.keys(ch.planets),pairs=[];for(let i=0;i<keys.length;i++)for(let j=i+1;j<keys.length;j++){const p=c.JYWestern.pairAspect(ch.planets[keys[i]],ch.planets[keys[j]],c.JYWestern.ASPECTS,12);if(p)pairs.push(p);}return c.JYHoraryLight.evaluate(ch,pairs,{start,endExclusive:at(30),events,stations,ingresses},{start:at(-30),endExclusive:start,events:past});}
test('Sanming published Jiazi-hour example: first Yichou, sixth Gengwu; four sex/year directions and fixed ancient profile',()=>{
 const base={gender:'male',dm:'甲',pillars:{year:{gan:'甲',zhi:'子'},month:{gan:'丙',zhi:'寅'},day:{gan:'甲',zhi:'子'},hour:{gan:'甲',zhi:'子'}},calculationPolicy:{birthInstant:'1984-03-01T00:00:00Z',referenceInstant:start}};
 const x=c.JYBaziXiaoyun.compute(base);assert.equal(x.periods.length,120);assert.equal(x.periods[0].gz,'乙丑');assert.equal(x.periods[5].gz,'庚午');assert.equal(x.periods[0].alternativeFixedSex.gz,'丙寅');assert.equal(c.JYBaziXiaoyun.compute({...base,gender:'female'}).periods[0].gz,'癸亥');
 const yin={...base,pillars:{...base.pillars,year:{gan:'乙',zhi:'丑'}}};assert.equal(c.JYBaziXiaoyun.compute(yin).direction,-1);assert.equal(c.JYBaziXiaoyun.compute({...yin,gender:'female'}).direction,1);
});
test('Xiaoyun birth-clipped first solar year, contiguous half-open windows, no invented unknown-hour cycle',()=>{
 const b=c.JYBaziXiaoyun.compute({gender:'male',dm:'甲',pillars:{year:{gan:'乙',zhi:'巳'},hour:{gan:'甲',zhi:'子'}},calculationPolicy:{birthInstant:'2026-01-01T00:00:00Z',referenceInstant:start}});
 assert.equal(b.birthSolarYear,2025);assert.equal(b.periods[0].window.start,'2026-01-01T00:00:00.000Z');b.periods.slice(1).forEach((p,i)=>assert.equal(p.window.start,b.periods[i].window.endExclusive));assert.equal(b.periods.filter(p=>p.isCurrent).length,1);assert.equal(c.JYBaziXiaoyun.compute({birthTimeUnknown:true}).status,'insufficient-data');assert.throws(()=>c.JYBaziXiaoyun.compute({},151),/1至150/);
});
e.load('tarot-foundation');
test('Mathers1888 physical stacking: circle first33 last66, original S66/33-1/34-2, last single65 and 66-card conservation',()=>{
 const cards=Array.from({length:66},(_,i)=>({id:i+1,name:'Card'+(i+1),isUp:i%2===0})),sig={id:78,name:'Queen'},before=JSON.stringify(cards),r=c.JYTarotFoundation.mathersThirdCircle(cards,sig);
 assert.equal(r.circle[0].ordinal,33);assert.equal(r.circle.at(-1).ordinal,66);assert.deepEqual(plain(r.stackBottomToTop.slice(0,4).map(p=>p.ordinal)),[66,1,65,2]);assert.deepEqual(plain(r.pairs.slice(0,2).map(p=>p.map(q=>q.ordinal))),[[33,1],[34,2]]);assert.equal(r.unpaired.ordinal,65);
 const all=[r.significatorPair.card.id,...r.pairs.flat().map(p=>p.id),r.unpaired.id];assert.equal(all.length,66);assert.equal(new Set(all).size,66);assert.deepEqual(all.slice().sort((a,b)=>a-b),cards.map(p=>p.id));r.circle.forEach(p=>assert.equal(p.isUp,cards[p.index].isUp));assert.equal(JSON.stringify(cards),before);assert.throws(()=>c.JYTarotFoundation.mathersThirdCircle(cards.slice(1),sig),/66/);
});
test('Tobyn type1 published degrees with synthetic dates: last separation and first next application, not arbitrary past link',()=>{
 const ch=western({Mercury:{longitude:134,speed:1.2},Jupiter:{longitude:131,speed:.1},Venus:{longitude:196,speed:.7}}),future=[event('Mercury','Venus',2,60)],past=[event('Mercury','Jupiter',-1)];
 let r=light(ch,future,past).translations.find(p=>p.form.startsWith('type1')&&p.from==='Jupiter'&&p.to==='Venus'&&p.interpositor==='Mercury');assert.equal(r.status,'established');
 r=light(ch,future,[...past,event('Mercury','Sun',-.5)]).translations.find(p=>p.form.startsWith('type1')&&p.from==='Jupiter'&&p.to==='Venus'&&p.interpositor==='Mercury');assert.equal(r.status,'not-established');
 r=light(ch,future,past,[{planet:'Mercury',utc:at(1),after:'retrograde'}]).translations.find(p=>p.form.startsWith('type1')&&p.from==='Jupiter'&&p.to==='Venus'&&p.interpositor==='Mercury');assert.equal(r.status,'not-established');
});
test('Tobyn type2 receive/carry, caught carrier and true collection have separate source geometry',()=>{
 let ch=western({Mercury:{longitude:165,speed:1.2},Venus:{longitude:46,speed:.7},Jupiter:{longitude:141,speed:.1}}),r=light(ch,[event('Mercury','Venus',1,120),event('Venus','Jupiter',5,90)]).translations.find(p=>p.form==='type2-receive-then-carry'&&p.from==='Mercury'&&p.to==='Jupiter'&&p.interpositor==='Venus');assert.equal(r.status,'established');
 ch=western({Mercury:{longitude:165,speed:1.2},Venus:{longitude:227,speed:.7},Jupiter:{longitude:136,speed:.1}});r=light(ch,[event('Mercury','Venus',1,60)],[event('Venus','Jupiter',-1,90)]).translations.find(p=>p.form==='type2-caught-carrier'&&p.from==='Jupiter'&&p.to==='Mercury'&&p.interpositor==='Venus');assert.equal(r.status,'established');
 ch=western({Mercury:{longitude:165,speed:1.2},Jupiter:{longitude:201,speed:.1},Saturn:{longitude:82,speed:.03}});r=light(ch,[event('Mercury','Saturn',2,90),event('Jupiter','Saturn',5,120)]).collections.find(p=>p.from==='Mercury'&&p.to==='Jupiter'&&p.interpositor==='Saturn'||p.to==='Mercury'&&p.from==='Jupiter'&&p.interpositor==='Saturn');assert.equal(r.status,'established');
});
test('Bonatti published equidistance Moon4Aquarius/Venus4Aries/Mars9Aries uses 5-degree gaps, conjunction outranks earlier Moon contact',()=>{
 const ch=western({Moon:{longitude:304,speed:13},Venus:{longitude:4,speed:1.1},Mars:{longitude:9,speed:.6}}),r=light(ch,[event('Moon','Mars',.4,60),event('Venus','Mars',10)]),row=r.spatialProhibition.find(p=>p.pair[0]==='Moon'&&p.pair[1]==='Mars'),v=row.checks.find(p=>p.interpositor==='Venus');near(v.spatialDistance,5);near(v.applicantDistance,5);assert.equal(v.conjunctionPriority,true);assert.equal(v.status,'established');
});
test('PVR6 supplemental published D6/D11 examples and D8 formula/printed discrepancy; D5 odd/even sequences',()=>{
 const V=c.JYVedic;assert.equal(V.varga(71,6).sign,2);assert.equal(V.varga(229,6).sign,9);assert.equal(V.varga(71,11).sign,2);assert.equal(V.varga(229,11).sign,11);assert.equal(V.varga(70,8).sign,6);assert.equal(V.varga(229,8).sign,1);
 assert.deepEqual([0,6,12,18,24].map(p=>V.varga(p,5).sign),[0,10,8,2,6]);assert.deepEqual([30,36,42,48,54].map(p=>V.varga(p,5).sign),[1,5,11,9,7]);assert.equal(Object.keys(V.VARGAS).length,20);
});
test('PVR26 original Pinda example86 times5: Maanasa25th, Capricorn10th; zero modulo means last, not nonexistent index',()=>{
 const P=c.JYVedicTransitRules;const p=P.pindaTarget(86,5);assert.equal(p.product,430);assert.equal(p.nakshatraIndex,24);assert.equal(p.sign,9);assert.equal(P.pindaTarget(108,0).nakshatraIndex,26);assert.equal(P.pindaTarget(108,0).sign,11);
});
console.time('published-year-chart');
const chart=c.JYVedic.compute({utc:'1967-03-08T12:10:00Z',reference:'2000-05-01T00:00:00Z',latitude:26.3,longitude:73+4/60});
console.timeEnd('published-year-chart');
const t=chart.tajaka,T=c.JYVedicTajaka,R=c.JYVedicTajakaRules;
test('PVR Example118 independent printed solar return: difference below120s, real months/144 solar-degree segments contiguous',()=>{
 const printed=Date.parse('2000-03-07T23:11:21Z');assert(Math.abs(Date.parse(t.return.utc)-printed)<120000);assert(t.return.errorDegrees<1e-6);assert.equal(t.months.length,12);assert.equal(t.sixtyHours.length,144);for(const rows of [t.months,t.sixtyHours]){assert.equal(rows[0].start,t.return.utc);assert.equal(rows.at(-1).endExclusive,t.nextReturn.utc);rows.slice(1).forEach((p,i)=>assert.equal(p.start,rows[i].endExclusive));}
 assert(t.currentMonth&&t.currentSixtyHour);assert.equal(Object.keys(t.currentMonth.chart.vargas).length,20);assert.equal(Object.keys(t.currentSixtyHour.chart.vargas).length,20);
});
test('PVR Examples119/120: seven Harsha totals0,15,0,10,5,10,5; MunthaTaurus and Mars13.7/yearlord',()=>{
 assert.deepEqual(plain(t.harsha.map(p=>p.total)),[0,15,0,10,5,10,5]);assert.equal(t.muntha.sign,1);near(t.ruleLedger.panchavargeeya.profiles.TAJIKASARA_CONSTANT_2.find(p=>p.planet==='Mars').total,13.7,.05);assert.equal(t.ruleLedger.yearLord.winner,'Mars');assert.equal(t.ruleLedger.yogas.families.length,16);assert.equal(t.sahams.points.length,36);
});
test('PVR Example121 printed independent longitude operands reproduce Artha2Sc30/Samartha5Pi02/Vanik7Sg04 exactly',()=>{
 const A=plain(t.currentMonth.chart);A.lagna={sign:9,longitude:280+50/60,degree:10+50/60};A.strength.clock.segment.daytime=false;A.planets.Saturn.longitude=19+10/60;A.planets.Mars.longitude=354+58/60;A.planets.Moon.longitude=345+14/60;A.planets.Mercury.longitude=311+28/60;
 const points=T.sahams(A).points;near(points.find(p=>p.name==='Artha').longitude,212.5);near(points.find(p=>p.name==='Samartha').longitude,335+2/60);near(points.find(p=>p.name==='Vanik').longitude,247+4/60);assert.equal(points.find(p=>p.name==='Samartha').correction,30);assert.equal(points.find(p=>p.name==='Artha').nightReversed,false);
});
test('PVR Table75 independent Patyayini degrees: first24.98/next48.17 days and own-first subperiod, conserved365.2425',()=>{
 const p={lagna:{degree:7+14/60},planets:Object.fromEntries([['Venus',1+38/60],['Mercury',4+47/60],['Moon',4+49/60],['Saturn',6.5],['Jupiter',10+59/60],['Sun',17+5/60],['Mars',23+53/60]].map(([k,degree])=>[k,{degree}]))},d=T.patyayini(p,0);assert.equal(d.periods[0].lord,'Venus');near(d.periods[0].days,24.98,.02);near(d.periods[1].days,48.17,.02);assert.equal(d.periods[0].children[0].lord,'Venus');near(d.periods.at(-1).end/86400000,365.2425);d.periods.forEach(p=>near(p.children.at(-1).end,p.end,.001));
});
test('Three annual MD/AD systems and all20 Narayana conserve their named windows and active half-open subperiods',()=>{
 for(const d of [t.dashas.patyayini,t.dashas.mudda,...Object.values(t.dashas.varshaNarayana)]){assert(d.periods.length>0);assert.equal(d.periods[0].start,Date.parse(t.return.utc));d.periods.slice(1).forEach((p,i)=>near(p.start,d.periods[i].end,.001));assert(d.current.maha);assert(d.current.antar);for(const p of d.periods.filter(p=>p.end>p.start)){assert(p.children.length>0);near(p.children[0].start,p.start,.1);near(p.children.at(-1).end,p.end,.1);}}
 assert.equal(Object.keys(t.dashas.varshaNarayana).length,20);
});
test('Vedha all7 profiles,27Tara,11 special anchors,9 actual ingress Murthi and all20 PAV Kakshya/Pinda are populated',()=>{
 const r=chart.transitRules;assert.equal(r.vedha.length,7);assert.equal(r.taras.length,27);assert.equal(r.taras.reduce((n,p)=>n+p.special.length,0),11);assert.equal(r.murthis.length,9);r.murthis.forEach(p=>{assert.equal(p.status,'calculated');assert(p.errorDegrees<.001);assert(Date.parse(p.utc)<=Date.parse(chart.input.reference));assert.equal(Math.floor(c.JYVedic.astronomy(new Date(p.utc),chart.input.latitude,chart.input.longitude,chart.input.ayanamsa).planets[p.planet].sidereal/30),p.sign);});const moonIngress=r.murthis.find(p=>p.planet==='Moon');assert.equal(moonIngress.moonAtIngress.sign,moonIngress.sign);assert(moonIngress.boundaryPolicy.includes('入座後'));assert.equal(Object.keys(r.vargas).length,20);Object.values(r.vargas).forEach(p=>{assert.equal(p.activation.length,9);assert.equal(p.kakshya.length,7);assert.equal(p.pinda.length,84);p.kakshya.forEach(p=>assert([0,1].includes(p.rekha)));});
});
test('Unknown clock keeps all Tajaka charts absent and does not fabricate month/60h charts',()=>{
 const u=c.JYVedic.compute({...chart.input,unknownTime:true});assert.equal(u.tajaka.status,'insufficient-data');assert.equal(u.tajaka.annual,null);assert.equal(u.tajaka.currentMonth,undefined);assert.equal(u.lagna,null);
});
e.load('prompt-brief');e.load('prompt-packet');
test('Complete copied prompt includes real new facts; month detail, full annual AD and matrices expand only when requested',()=>{
 const P=c.JYPromptPacket,question='請分析2000年的工作',small=P.get(P.build('vedic',chart,question)),full=P.get(P.build('vedic',chart,question+'、本月、所有歲時條件及全部年度副運'));
 assert(small.body.includes('27Tara'));assert(small.body.includes('144段'));assert(small.body.includes('二十分盤')||small.body.includes('20分盤'));assert(small.body.includes('36Sahams'));assert(full.body.length>small.body.length);assert(small.body.includes('Moon')||small.body.includes('月'));assert(!/NaN|undefined|\[object Object\]/.test(full.body));for(const p of [small,full]){assert(!/(?:請|必須|先)上傳附件/.test(p.body));p.parts.forEach(part=>{assert(P.chars(part)<=8000);assert(P.utf8(part)<=20000);});assert.equal(p.contentChunks.join(''),p.body);}
});
const report={testedAt:new Date().toISOString(),scope:'R7 actual missing calculations: primary published manual examples, explicitly synthetic horary chronology, twenty vargas, selected annual/month/sixty-hour native data and complete plain text',sources:['SanmingTonghui2/Xiaoyun','Mathers1888ThirdMethod','Tobyn2007Part1','PVRExamples13/15/18/118/119/120/121 and Table75','Hayanaratna2.4–5'],printedSolarReturnErrorSeconds:(Date.parse(t.return.utc)-Date.parse('2000-03-07T23:11:21Z'))/1000,results,passed:results.length,total:results.length};
fs.writeFileSync(path.resolve(__dirname,'../docs/engine-missing-calculations-r7-validation-20261003.json'),JSON.stringify(report,null,2)+'\n');

fs.writeFileSync(path.resolve(__dirname,'../docs/vedic-r7-swiss-input-20261003.json'),JSON.stringify({input:chart.input,natalSun:chart.planets.Sun.longitude,annual:t.return,months:t.months,segments:t.sixtyHours,ingresses:chart.transitRules.murthis},null,2)+'\n');
