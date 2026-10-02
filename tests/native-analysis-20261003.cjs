'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {ctx:c,load}=require('./native-fixtures-20261003.cjs').environment(),N=c.JYNativeAnalysis,plain=x=>JSON.parse(JSON.stringify(x)),results=[];
function test(name,fn){try{fn();results.push({name,status:'passed'});console.log('PASS '+name);}catch(e){results.push({name,status:'failed',error:e.stack});process.exitCode=1;console.error('FAIL '+name+'\n'+e.stack);}}
const {instant,q,b,z,input,v,w,l,six,yi,mh,nm,bb,comp,profile,cards,tarot,ln,ootk,oracle,charts}=require('./native-fixtures-20261003.cjs').examples(c);
test('15 methods consume real records without mutating charts; complete JSON and HTML preserve scope',()=>{
 assert.equal(N.methods().length,15);
 for(const [k,x]of Object.entries(charts)){const before=JSON.stringify(x),a=N.analyze(k,x);assert.equal(a.method,k);assert(a.items.length,k);assert(a.sources.length,k);assert(!/NaN|undefined|\[object Object\]/.test(JSON.stringify(a)),k);const h=N.render(k,x);assert(h.includes('jy-native-analysis'),k);assert.equal(JSON.stringify(x),before,k);const exported=c.JYNativeAnalysisView.exportData(k,x,a);assert.equal(exported.nativeAnalysis.method,k);}
});
test('Independent ten-god and directional five-element tables',()=>{
 assert.deepEqual(plain(Array.from('甲乙丙丁戊己庚辛壬癸',g=>N.tenGod('甲',g))),['比肩','劫財','食神','傷官','偏財','正財','七殺','正官','偏印','正印']);
 for(const [a,b,r]of [['木','火','生'],['火','木','受生'],['木','土','克'],['土','木','受克'],['水','水','比和']])assert.equal(N.relation(a,b),r);
});
test('Bazi annual segments retain both sides of a luck transition and independently reconstruct all links',()=>{
 const a=N.analyze('bazi',b);assert.equal(a.annualSegments.length,b.dayun.flatMap(d=>d.liuNian||[]).length);assert(a.annualSegments.length>=100);assert.equal(a.stemPairs.length,6);
 for(const y of a.annualSegments){assert.equal(y.connections.length,8);for(const x of y.connections){const p=a.pillars.find(p=>p.label===x.to),gz=x.from==='大運'?y.dayun:y.annual;assert.equal(x.repeatedPillar,gz===p.gan+p.zhi);assert.deepEqual(plain(x.branchRelations),Object.entries(N.links(gz[1],p.zhi)).filter(([,v])=>v).map(([k])=>k));}}
});
test('Unknown Bazi export has only three pillars and excludes temporary-hour strength/luck claims',()=>{
 const a=N.analyze('bazi',b,{unknown:true}),out=c.JYNativeAnalysisView.exportData('bazi',b,a);assert.equal(a.coverage.pillars,3);assert.equal(a.annualSegments,undefined);assert.equal(out.schema,'jy.partial-bazi/1');assert(!JSON.stringify(out).includes('"hour"'));assert.equal(out.qiyun,undefined);assert.equal(out.strengthAssessment,undefined);
});
test('Ziwei twelve actual trines/oppositions, 14 major stars, 48 flights and 12 monthly overlays',()=>{
 const a=N.analyze('ziwei',z),br=Array.from('子丑寅卯辰巳午未申酉戌亥');assert.equal(a.items.length,12);assert.equal(a.coverage.majorStars,14);assert.equal(a.coverage.palaceFlights,48);assert.equal(a.layers.months.length,12);
 for(const it of a.items){const p=z.palaces.find(p=>'palace-'+p.name===it.id),i=br.indexOf(p.branch),ev=it.evidence[0];assert.equal(br.indexOf(ev.opposite.branch),(i+6)%12);assert.deepEqual(plain(ev.trines.map(p=>br.indexOf(p.branch))),[(i+4)%12,(i+8)%12]);assert.equal(ev.borrowed.length,p.stars.some(s=>s.type==='major')?0:ev.opposite.stars.filter(s=>s.type==='major').length);}
});
test('Western active return changes only at the actual solar-return instant',()=>{
 const before=c.JYWestern.compute({...input,reference:'2026-01-01T04:00:00Z'}),a=N.analyze('astro',before);assert.equal(a.returnAnalysis.year,2025);assert(Date.parse(a.returnAnalysis.utc)<=Date.parse(before.input.reference));assert.equal(N.analyze('astro',w).returnAnalysis.year,2026);assert.equal(before.activeSolarReturn.year,2025);assert(a.returnAnalysis.aspects.length);assert(a.returnAnalysis.natalOverlay.length);
});
test('Ziwei daily/hourly locations: year/month/leap/day boundaries, twelve hours and four real transformations',()=>{
 const br=Array.from('子丑寅卯辰巳午未申酉戌亥'),dates=['2025-01-28','2025-01-29','2025-07-25','2025-08-08','2025-08-09','2025-08-22','2026-10-02'];
 for(const boundary of ['MIDNIGHT_00','ZI_HOUR_23'])for(const leap of ['SAME_MONTH','SPLIT_AT_15']){
  const chart=c.computeZiwei(1983,8,25,14,'male',{minute:55,referenceDate:instant,dayBoundaryMode:boundary,leapMonthPolicy:leap});
  for(const date of dates)for(const hour of [0,2,4,6,8,10,12,14,16,18,20,22,23]){
   const utc=new Date(Date.parse(date+'T00:00:00Z')+(hour-8)*3600000).toISOString(),effective=new Date(Date.parse(date+'T00:00:00Z')+(boundary==='ZI_HOUR_23'&&hour===23?86400000:0)),ln=c.Solar.fromYmd(effective.getUTCFullYear(),effective.getUTCMonth()+1,effective.getUTCDate()).getLunar(),rm=ln.getMonth(),month=((Math.abs(rm)-1+(rm<0&&leap==='SPLIT_AT_15'&&ln.getDay()>15?1:0))%12)+1,hourIndex=Math.floor((hour+1)%24/2),yearBranch=(ln.getYear()-4)%12,first=(yearBranch-(chart.calculationPolicy.effectiveMonth-1)+chart.birthInput.hourBranchIndex+24)%12,day=(first+month-1+ln.getDay()-1)%12;
   const d=chart.getLiuRiZw(utc),h=chart.getLiuShiZw(utc);assert.equal(d.mingBranch,br[day]);assert.equal(h.mingBranch,br[(day+hourIndex)%12]);assert.equal(d.context.effectiveDate,effective.toISOString().slice(0,10));assert.equal(d.gz,ln.getDayInGanZhi());assert.equal(h.gz[1],br[hourIndex]);assert.equal(d.hua.length,4);assert.equal(h.hua.length,4);
   for(const p of [d,h]){assert.equal(p.palaces.length,12);assert.equal(p.flowStars.length,10);assert.equal(new Set(p.flowStars.map(s=>s.star)).size,10);for(const s of p.flowStars){assert.equal(s.stem,p.gz[0]);assert.equal(s.referenceBranch,p.gz[1]);assert.equal(s.periodPalace,p.palaces.find(v=>v.branch===s.branch).name);}for(const x of p.hua){assert(chart.palaces.find(v=>v.branch===x.palaceBranch).stars.some(s=>s.name===x.star));assert.equal(x.periodPalace,p.palaces.find(v=>v.branch===x.palaceBranch).name);}}
  }
 }
 const unknown=c.computeZiwei(1983,8,25,14,'male',{btimeUnknown:true,referenceDate:instant});assert.equal(unknown.getLiuRiZw(),null);assert.equal(unknown.getLiuShiZw(),null);const partial=N.analyze('ziwei',unknown),exported=c.JYNativeAnalysisView.exportData('ziwei',unknown,partial);assert.equal(partial.coverage.palaces,0);assert.equal(exported.schema,'jy.partial-ziwei/1');assert.equal(exported.palaces,undefined);assert.throws(()=>z.getLiuRiZw('2026-10-02T12:00:00'));
 const a=N.analyze('ziwei',z);assert(a.layers.daily&&a.layers.hourly);
});
test('PVR published avastha examples and sign-only D9 dignity avoid fictitious degree precision',()=>{
 const cases=[['Cancer',3,23,'Kumaara'],['Libra',6,19,'Vriddha'],['Sagittarius',8,14,'Yuva'],['Pisces',11,27,'Saisava']];
 for(const [,sign,degree,expected]of cases){const x=plain(v);x.planets.Sun={...x.planets.Sun,sign,degree};assert.equal(N.analyze('vedic',x).states.find(s=>s.planet==='Sun').ageState,expected);}
 assert.equal(N.signDignity('Mercury',2),'own');assert.equal(N.signDignity('Mercury',5),'exalted');assert.equal(N.signDignity('Moon',1),'exalted');
});
test('Published Raman Standard Horoscope: Sun Saptavargaja 90 and Sthana 198.0',()=>{
 const S=c.JYVedicStrength,lon=180+53/60+55/3600,x={planets:{Sun:{dignity:c.JYVedic.dignity('Sun',lon)}},vargas:{},relationships:[{from:'Sun',to:'Venus',compound:0},{from:'Sun',to:'Mars',compound:2}]};
 for(const d of [1,2,3,7,9,12,30])x.vargas[d]={planets:{Sun:c.JYVedic.varga(lon,d)}};
 assert.equal(S.sapta(x,'Sun','raman').virupas,90);
 assert(Math.abs(S.uchcha('Sun',lon)+90+S.oja('Sun',6,6)+S.kendra(10)+S.drekkana('Sun',lon%30)-198.0)<.04);
 assert.notEqual(S.sapta(x,'Sun','bphs').virupas,90);
});
test('Vedic six-strength totals, endpoint/boundary values, independent tropical angles and unknown-time contract',()=>{
 const S=c.JYVedicStrength,exalt={Sun:10,Moon:33,Mars:298,Mercury:165,Jupiter:95,Venus:357,Saturn:200};
 for(const [k,lon]of Object.entries(exalt)){assert.equal(S.uchcha(k,lon),60);assert.equal(S.uchcha(k,(lon+180)%360),0);assert.equal(S.uchcha(k,(lon+90)%360),30);}
 assert.equal(S.drekkana('Sun',9.999),15);assert.equal(S.drekkana('Sun',10),0);assert.equal(S.drekkana('Mercury',10),15);assert.equal(S.drekkana('Mercury',20),0);assert.equal(S.drekkana('Moon',20),15);
 const ledger=v.strength;assert.equal(ledger.planets.length,7);assert.equal(ledger.complete,true);assert.equal(Object.keys(ledger.totalVirupas).length,7);
 for(const k of ['ASC','DSC','MC','IC'])assert(S.arc(ledger.angles[k],w.houses.angles[k]-v.policy.ayanamsaDegrees)<1e-8);
 for(const p of ledger.planets){assert(Number.isFinite(p.totalVirupas));assert.equal(p.totalVirupas,['sthana','dig','kala','cheshta','naisargika','drik'].reduce((sum,k)=>sum+p[k].virupas,0));assert.equal(p.totalRupas,p.totalVirupas/60);assert.equal(p.relativeStrength,p.totalVirupas/p.minimumVirupas);assert(p.dig.virupas>=0&&p.dig.virupas<=60);}
 const unknown=c.JYVedic.compute({...input,unknownTime:true});assert.equal(unknown.strength.planets.length,0);assert.equal(unknown.strength.totalVirupas,null);
});
test('Published dignity tables and two consistent examples; discrepant Cancer answer is recorded',()=>{
 const D=c.JYWesternDignities;
 for(const [key,lon,day,bounds,rulers,peregrine]of [
  ['Saturn',30+15+35/60,true,'ptolemy',['Venus','Moon','Venus','Jupiter','Moon'],true],
  ['Moon',90+19+45/60,false,'ptolemy',['Moon','Jupiter','Mars','Venus','Mercury'],false],
  ['Mercury',26+12/60,false,'ptolemy',['Mars','Sun','Jupiter','Saturn','Venus'],true]
 ]){const p=D.placement(key,lon,day,bounds);assert.deepEqual(plain(['sign','exaltation','triplicity','term','face'].map(k=>p[k+'Lord'])),rulers);assert.equal(p.peregrine,peregrine);}
 // The author's Mercury answer is inconsistent with both displayed tables.
 // Retain the table-derived expectation, document the discrepancy explicitly.
 assert.equal(D.rulers(90+19+45/60,false,'ptolemy').termLord,'Venus');
 assert.equal(D.rulers(90+19+45/60,false,'egyptian').termLord,'Jupiter');
 for(const lon of [0,210,150]){const p=D.placement('Venus',lon,true);assert(p.detriment||p.fall);}
 assert.equal(D.rulers(12,false,'egyptian').termLord,'Mercury');assert.equal(D.rulers(12,false,'ptolemy').termLord,'Venus');assert.equal(D.rulers(6,false).termLord,'Venus');assert.equal(D.rulers(30,false).signLord,'Venus');
 assert.equal(D.placement('Saturn',45,null).peregrine,null);assert.equal(D.placement('Moon',105,null).peregrine,false);assert.throws(()=>D.placement('Uranus',0,true));assert(w.essentialDignities.planets.length===7);
});
test('Requested first two Bazi decades export only those actually calculated decades',()=>{
 const prompt=N.prompt('bazi',b,'前兩個大運逐年完整分析'),a=JSON.parse(prompt.split('\n')[1]),allowed=b.dayun.map((d,i)=>({d,i})).filter(x=>x.d.gz!=='小運').slice(0,2).map(x=>x.i);
 assert.equal(a.exportScope.requestedDecades,2);assert(a.annualSegments.length>0);assert(a.annualSegments.every(y=>allowed.includes(y.decadeIndex)));assert(a.coverage.computedAnnualSegments>a.coverage.annualSegments);
});
test('Two unknown Ziwei birth clocks do not fabricate compatibility overlays',()=>{
 const a=N.analyze('compat',{personA:null,personB:null,status:'partial',overlays:[],directions:[],policy:{unknownTime:true}});assert.equal(a.coverage.people,0);assert.equal(a.coverage.crossRelations,0);assert.equal(a.items[0].id,'unknown-time');
});
test('All 16 varga house owners/occupants and three exact active dasha intervals',()=>{
 const a=N.analyze('vedic',v);assert.equal(a.coverage.vargaHouses,192);assert.equal(a.activation.length,3);
 for(const d of a.vargas){assert.equal(d.houses.length,12);for(const h of d.houses){assert.equal(h.lord,c.JYVedic.LORDS[h.sign]);assert.equal(h.lordHouse,v.vargas[d.division].planets[h.lord].house);assert.deepEqual(plain(h.occupants),plain(c.JYVedic.KEYS.filter(k=>v.vargas[d.division].planets[k].house===h.house)));}}
 for(const x of a.activation){assert(Date.parse(x.start)<=Date.parse(input.reference));assert(Date.parse(x.endExclusive)>Date.parse(input.reference));assert.equal(x.vargaHouses.length,16);}
});
test('Unknown Vedic and Western clocks never introduce varga houses, active dasha or solar return',()=>{
 const vv=N.analyze('vedic',c.JYVedic.compute({...input,unknownTime:true}));assert.equal(vv.coverage.vargaHouses,0);assert.equal(vv.activation.length,0);assert.equal(vv.states.length,0);assert(vv.vargas.every(v=>v.provisional));const ww=N.analyze('astro',c.JYWestern.compute({...input,unknownTime:true}));assert.equal(ww.returnAnalysis,null);assert.equal(ww.coverage.houses,0);
});
test('Liuren twelve generals and inner/outer battle retain element direction and emptiness',()=>{
 const a=N.analyze('liuren',l),els=['土','火','火','木','土','木','土','金','土','水','金','水'];assert.equal(a.plate.length,12);assert.equal(a.edges.length,3);for(const p of a.plate){assert.equal(p.assessment.generalElement,els[p.generalIndex]);assert.equal(p.assessment.innerBattle,N.relation(p.assessment.generalElement,p.element)==='受克');assert.equal(p.assessment.outerBattle,N.relation(p.assessment.generalElement,p.element)==='克');assert.equal(p.assessment.empty,p.empty);}
});
test('4096 line states: Yijing geometry and Liuyao changing line facts remain exact',()=>{
 for(let code=0;code<4096;code++){const values=Array.from({length:6},(_,i)=>6+(code>>(i*2)&3)),a=N.analyze('yijing',c.JYYijingCore.calculate({values})),ly=c.JYLiuyaoCore.calculate({values,calendar:{day:'甲子',monthBranch:'辰'}}),b=N.analyze('liuyao',ly);assert.equal(b.items.length,6);for(let i=0;i<6;i++){assert.equal(a.originalGeometry[i].yang,!!(values[i]%2));assert.equal(a.originalGeometry[i].proper,!!(values[i]%2)===(i%2===0));assert.equal(a.changedGeometry[i].yang,[6,9].includes(values[i])?!a.originalGeometry[i].yang:a.originalGeometry[i].yang);}}
});
test('384 Meihua charts preserve original body; pure Qian/Kun use changed nuclear chart',()=>{
 for(let up=1;up<=8;up++)for(let lo=1;lo<=8;lo++)for(let moving=1;moving<=6;moving++){const x=c.calcMH(up,lo,moving,{timestamp:instant}),a=N.analyze('meihua',x),bits=x.lo.li.concat(x.up.li),changed=bits.slice();changed[moving-1]^=1;assert.deepEqual(plain(a.changedLines),plain(changed));assert.equal(a.items.length,4);const src=bits.every(v=>v===bits[0])?changed:bits;assert.deepEqual(plain(a.nuclear.lower.li),plain(src.slice(1,4)));assert.deepEqual(plain(a.nuclear.upper.li),plain(src.slice(2,5)));assert.equal(a.body.el,x.tiG.el);assert(a.coverage.seasonAvailable);}
});
test('Name comparison includes original, every candidate and all pair calculations',()=>{const a=N.analyze('name',nm);assert.equal(a.items.length,3);assert.equal(a.comparisons.length,2);assert.equal(a.items[0].label,'陳政軒');});
test('1931 original cycle examples remain auditable in actual five-grid output',()=>{
 for(const n of [81,82,83]){const name=c.JYNameEngine.analyze({surname:'王',given:'小明',overrides:{王:{stroke:30},小:{stroke:26},明:{stroke:n-56}}}),g=name.fiveGrids.grids.find(g=>g.role==='總格');assert.equal(g.num,n);assert.equal(g.number81,n===81?81:n-80);assert.equal(g.numberCycleAudit.baseNumber,n-80);assert(g.numberCycleAudit.scope.includes('逐條核對'));assert.equal(g.originalNumerology.number,g.number81);}
});
test('Compatibility preserves directed ten gods and native cross-pillar data',()=>{const a=N.analyze('compat',comp);assert.equal(a.coverage.people,2);assert.equal(a.system,'bazi');assert(a.items.find(x=>x.id==='direction').evidence[2]);assert(a.items.find(x=>x.id==='branchRelations').evidence[0].length);});
test('Personality axis outcomes are independently reproduced from exported numeric inputs',()=>{
 assert(profile.modelInputs);for(const x of profile.axes){assert(x.inputs);const p=x.inputs;if(x.key==='energy')assert.equal(x.rightSelected,p.outward>p.inward);if(x.key==='order')assert.equal(x.rightSelected,p.structured>=p.free);if(x.key==='relation')assert.equal(x.rightSelected,p.relational>p.selfLed);if(x.key==='rhythm')assert.equal(x.rightSelected,p.yin>p.yang||p.branchInteractions>=2);}assert(profile.disclaimer.includes('不是心理測驗'));
});
test('156 RWS orientations retain actual card identity, direction, meaning and unknown-direction gap',()=>{
 for(const p of cards)for(const isUp of [true,false]){const a=c.JYNativeCards.tarot({sourceProfile:'rws_reversals',cards:[{id:p.id,isUp,name:p.n}]});assert.equal(a.records[0].direction,isUp?'正位':'逆位');assert.deepEqual(plain(a.records[0].keywords),String(isUp?p.kwUp:p.kwRv).split('·'));}const unknown=c.JYNativeCards.tarot({sourceProfile:'rws_reversals',cards:[{id:cards[0].id}]});assert.equal(unknown.records[0].direction,'方向未記錄');assert.equal(unknown.records[0].keywords.length,0);
});
test('Lenormand independent 3x3, 8x4+4, 9x4 geometry; choices and branches never cross',()=>{
 for(const [spread,w,h,neighborCount]of [['nine',3,3,20],['grand',8,4,97],['grand_nines',9,4,107]]){const count=spread==='grand'?36:w*h,a=c.JYNativeCards.lenormand({spreadType:spread,expectedCount:count,cards:Array.from({length:count},(_,i)=>({id:i+1,name:'牌'+(i+1)}))});assert.equal(a.knights.length,2*(w-1)*(h-2)+2*(w-2)*(h-1));assert.equal(a.neighbors.length,neighborCount);for(const x of a.knights)assert(x.a<=w*h&&x.b<=w*h);for(const x of a.segments)assert(x.positions.every(p=>p<=w*h)||x.positions.every(p=>p>w*h));}
 const choice=c.JYNativeCards.lenormand({spreadType:'choice',cards:Array.from({length:7},(_,i)=>({id:i+1}))});assert.deepEqual(plain(choice.paths),[[1,2,3],[5,6,7]]);assert.equal(choice.commonContext,4);assert.throws(()=>c.JYNativeCards.lenormand({...ln,expectedCount:8}));
});
test('OOTK incomplete/abandoned rounds retain records without being counted completed',()=>{const a=c.JYNativeCards.ootk(ootk);assert.deepEqual(plain(a.completed),['op1']);assert.deepEqual(plain(a.notCompleted),['op2','op3']);assert.deepEqual(plain(a.operations[0].data.sequence),[1,2,3]);});
test('OOTK not-started state keeps zero operations and explicitly withholds divination',()=>{const a=N.analyze('ootk',{ootkData:{operations:{}}});assert.equal(a.coverage.records,0);assert.equal(a.items[0].id,'not-started');assert.equal(a.methodData.completed.length,0);assert.equal(a.methodData.status,'not-started');});
test('Combined prompt with native modules keeps all four systems/people in a practical scoped export',()=>{
 const zz=c.computeZiwei(1994,6,20,23,'female',{minute:26,referenceDate:instant}),question='未來三年，雙方的相處與承諾條件',pair=c.JYRelationshipCore.createZiweiPair(z,zz,{question}),p=c.JYRelationshipCore.buildPrompt(comp,pair,question);
 assert(p.length<150000,p.length);assert.equal((p.match(/"classicalAssessment":/g)||[]).length,2);assert(p.includes('SANMING_MAIN_30'));for(const marker of ['A方八字','B方八字','A方紫微','B方紫微','八字歲運同步','紫微同期大限與流年'])assert(p.includes(marker),marker);
 assert.equal((p.match(/【引擎原生作用資料】/g)||[]).length,4);assert(p.includes('annualSegments'));assert(p.includes('topicPlacements'));assert(p.includes('補充前文已列的排盤事實'));assert(p.includes('2028'));
});
test('Oracle lines retain exact poem, source and literal condition positions',()=>{const a=c.JYNativeCards.oracle(oracle);assert.equal(a.lines.length,4);assert.equal(a.poem,oracle.p);assert.equal(a.source,oracle.sourceUrl);assert.throws(()=>c.JYNativeCards.oracle({...oracle,sourceUrl:null}));});
test('Prompt integration includes calculated native structures; source chart stays unchanged',()=>{
 for(const [kind,x,prompt]of [['vedic',v,c.JYVedicPrompt.build(q,v)],['astro',w,c.JYWesternPrompt.build(w,{question:q})],['liuren',l,c.JYLiurenPrompt.build(l)],['liuyao',six,c.JYGuaPrompt.build(six)],['yijing',yi,c.JYGuaPrompt.build(yi)],['ziwei',z,c._ziweiBuildPrompt(z,{question:q,bdate:'1983-08-25',btime:'14:55'})],['name',nm,c.JYNamePrompt.build(nm)],['bazi',b,c.BaziSuiteCore.buildSinglePrompt('general',b,{},q)],['personality',profile,c.BaziSuiteCore.buildPersonalityPrompt(profile,q)]]){assert(prompt.includes('jy.native-analysis/1'),kind);assert(prompt.includes('"method":"'+kind+'"'),kind);assert(!/NaN|undefined|\[object Object\]/.test(prompt),kind);}
});
test('All compact JSON pointers resolve to present complete evidence without a cycle',()=>{
 for(const [kind,x]of Object.entries(charts)){const text=N.prompt(kind,x,q),raw=text.slice(text.indexOf('\n')+1).split('\n')[0],a=JSON.parse(raw);function walk(v){if(!v||typeof v!=='object')return;if(v.$ref){let target=a;for(const key of v.$ref.slice(2).split('/'))target=target[key.replace(/~1/g,'/').replace(/~0/g,'~')];assert(target&&typeof target==='object');assert(!target.$ref);return;}for(const child of Object.values(v))walk(child);}walk(a);}
});
test('User input is escaped in native HTML and no capability becomes a fabricated total',()=>{
 const x={...ln,cards:ln.cards.map(p=>({...p,name:'<img src=x onerror=alert(1)>'}))},html=N.render('lenormand',x);assert(!html.includes('<img src=x'));assert(html.includes('&lt;img'));assert.equal(N.analyze('vedic',v).coverage.shadbalaPlanets,7);assert(N.analyze('vedic',c.JYVedic.compute({...input,unknownTime:true})).unavailable.some(x=>x.startsWith('六力總分：')));
});
const output=path.resolve(__dirname,'../docs/native-validation-20261003.json');fs.writeFileSync(output,JSON.stringify({testedAt:new Date().toISOString(),scope:'Traditional rule implementation and calculation/data agreement; not prediction validation',results,passed:results.filter(x=>x.status==='passed').length,total:results.length},null,2));
console.log(JSON.stringify({passed:results.filter(x=>x.status==='passed').length,total:results.length}));
