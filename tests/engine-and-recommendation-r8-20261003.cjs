'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {environment,examples}=require('./native-fixtures-20261003.cjs'),e=environment(),c=e.ctx,plain=x=>JSON.parse(JSON.stringify(x)),results=[];
e.load('prompt-brief');e.load('prompt-packet');
const f=examples(c),sc=f.v.sudarsana,S=c.JYVedicSudarsana,mod=n=>(n%12+12)%12;
function test(name,fn){fn();results.push({name,status:'passed'});console.log('PASS '+name);}
test('PVR31.3 printed age44 example gives house9 and Scorpio/Libra/Pisces; age59 gives house12',()=>{
 assert.equal(S.yearHouse(44),9);assert.deepEqual(plain(S.periodSigns({Lagna:11,Moon:10,Sun:3},8)),{Lagna:7,Moon:6,Sun:11});
 assert.equal(S.yearHouse(59),12);assert.equal(S.yearHouse(0),1);assert.equal(S.yearHouse(12),1);assert.throws(()=>S.yearHouse(-1),/非負/);
});
test('PVR Example126 synthetic reconstruction retains the six printed favorable D24 placements and Rahu literal conflict',()=>{
 const signs={Sun:7,Moon:1,Mars:9,Mercury:11,Jupiter:2,Venus:3,Saturn:0,Rahu:5,Ketu:5};
 const planets=Object.fromEntries(Object.entries(signs).map(([k,sign])=>[k,{sign,longitude:sign*30+12,degree:12}]));
 const entry={input:{utc:'1987-04-04T00:00:00Z'},planets,vargas:{24:{division:24,lagna:{sign:0},planets}}};
 const r=S.assess(f.v,entry,24,7);
 for(const [k,h]of [['Mercury',5],['Jupiter',8],['Venus',9],['Saturn',6],['Rahu',11],['Ketu',11]]){const p=r.placements.find(p=>p.planet===k);assert.equal(p.house,h);assert.equal(p.assessment,'favorable');}
 const rahu=r.placements.find(p=>p.planet==='Rahu');assert.equal(rahu.variants[0].assessment,'adverse');assert.equal(rahu.variants[1].assessment,'favorable');
 assert(sc.sourceAudit.some(p=>p.source.includes('Example127')));
});
test('All20 divisions calculate three natal wheels, 12 monthly and144 subperiod signs, and180 current reference readings',()=>{
 assert.equal(sc.status,'calculated');assert.equal(Object.keys(sc.vargas).length,20);
 for(const v of Object.values(sc.vargas)){
  assert.equal(v.monthlySigns.length,12);assert.equal(v.sixtyHourSigns.length,144);
  for(const k of ['Lagna','Moon','Sun']){
   assert.equal(v.natalWheels[k].length,12);assert.equal(v.annualSigns[k],mod(v.anchors[k]+sc.completedYears));
   v.monthlySigns.forEach((p,i)=>assert.equal(p[k],mod(v.anchors[k]+sc.completedYears+i)));
   v.sixtyHourSigns.forEach((p,i)=>assert.equal(p[k],mod(v.anchors[k]+sc.completedYears+Math.floor(i/12)+i%12)));
  }
  for(const p of Object.values(v.current)){assert(p);for(const r of Object.values(p.readings)){assert.equal(r.placements.length,9);assert.equal(r.houses.length,12);assert.equal(r.status,'calculated');assert.equal(r.entryUTC,p.window.start);}}
 }
});
test('Period readings use actual entry positions and PVR25.5 physical D1 transit signs against natal Dn BAV',()=>{
 let differing=0;
 for(const v of Object.values(sc.vargas))for(const [level,p]of Object.entries(v.current)){
  const entry=level==='annual'?f.v.tajaka.annual:level==='monthly'?f.v.tajaka.currentMonth.chart:f.v.tajaka.currentSixtyHour.chart;
  for(const r of Object.values(p.readings))for(const z of r.placements){
   assert.equal(z.sign,entry.vargas[v.division].planets[z.planet].sign);assert.equal(z.house,mod(z.sign-r.sign)+1);
   assert.equal(z.avTransitSign,entry.planets[z.planet].sign);
   if(['Rahu','Ketu'].includes(z.planet))assert.equal(z.natalBav,null);else assert.equal(z.natalBav,f.v.vargaAshtakavarga[v.division].bav[z.planet][z.avTransitSign]);
   if(z.sign!==f.v.vargas[v.division].planets[z.planet].sign)differing++;
  }
 }
 assert(differing>0,'entry charts must not just replay natal placements');
});
test('Shared signs retain the BPHS74 fallback as a separate profile without tripling the evidence',()=>{
 const shared=Object.values(sc.vargas).filter(v=>new Set(Object.values(v.anchors)).size<3);assert(shared.length);
 shared.forEach(v=>{assert.deepEqual(plain(v.bphsApplicability.references),['Lagna']);assert.equal(v.bphsApplicability.decision,'rasi-kundali-only');assert.equal(Object.keys(v.current.annual.readings).length,3);});
});
test('All windows remain half-open, cover the solar year, and preserve genuine variable solar durations',()=>{
 for(const rows of [sc.months,sc.sixtyHours]){assert.equal(rows[0].start,sc.window.start);assert.equal(rows.at(-1).endExclusive,sc.window.endExclusive);rows.slice(1).forEach((p,i)=>assert.equal(p.start,rows[i].endExclusive));}
 assert(new Set(sc.sixtyHours.map(p=>Math.round((Date.parse(p.endExclusive)-Date.parse(p.start))/60000))).size>1);
 assert.equal(S.compute({...f.v,input:{...f.v.input,unknownTime:true}}).status,'insufficient-data');
 assert.equal(S.compute(f.v,{status:'before-birth'}).status,'before-birth');
});
test('Noncurrent subperiod API actually computes its20 division chart and three reference readings, with index checks',()=>{
 const p=S.chartForPeriod(f.v,sc,'sixty-hour',37);assert.equal(p.chart.input.utc,sc.sixtyHours[36].start);assert.equal(Object.keys(p.chart.vargas).length,20);
 for(const [d,v]of Object.entries(p.vargas)){assert.deepEqual(plain(v.signs),plain(sc.vargas[d].sixtyHourSigns[36]));assert.equal(v.readings.Lagna.placements[0].sign,p.chart.vargas[d].planets.Sun.sign);}
 assert.throws(()=>S.chartForPeriod(f.v,sc,'sixty-hour',145),/1–144/);
});
const prompts={};
test('Every15 native bounded-prompt path restores its canonical specific recommendation and exactly one final shop footer',()=>{
 for(const [kind,chart]of Object.entries(f.charts)){
  const body=c.JYPromptPacket.build(kind,chart,'本次工作或關係該如何調整？'),packet=c.JYPromptPacket.get(body);prompts[kind]={characters:Array.from(body).length,bytes:Buffer.byteLength(body),parts:packet.parts.length};
  assert(body.includes(c.JY_READING_QUALITY.recommendationText(kind)),kind);assert(body.includes('有效解讀完成後須接上本段'));
  assert.equal(body.split('https://shopee.tw/a50h95648d?tab=shop').length-1,1,kind);assert(body.endsWith(c.JYReadingWorkflow.footer),kind);
  assert.equal(packet.contentChunks.join(''),body);packet.parts.forEach(p=>{assert(Array.from(p).length<=8000);assert(Buffer.byteLength(p)<=20000);});assert(packet.parts.at(-1).includes('https://shopee.tw/a50h95648d?tab=shop'));
 }
 assert.equal(Object.keys(prompts).length,15);
});
test('Complete Vedic plaintext includes the new calculated three-reference signs, all20 matrices and audit limits',()=>{
 const body=c.JYPromptPacket.build('vedic',f.v,'請分析完整二十分盤、三重年運月運細運');assert(body.includes('【三重運期完整對照】'));assert(body.includes('【三重運期九曜作用】'));assert(body.includes('不偷偷改成一致'));assert(body.includes('不需要上傳附件'));
 for(const v of Object.values(sc.vargas))assert(body.includes(v.division+'/'+['Lagna','Moon','Sun'].map(k=>v.anchors[k]).join(',')));
});
test('Composite chart export retains A-only selection constraints and deduplicates repeated method guides',()=>{
 const b=c.JYPromptPacket.buildMany([{method:'bazi',chart:f.b,label:'A'},{method:'bazi',chart:f.bb,label:'B'}],'兩人如何相處？');
 assert(b.includes('給A的建議只能用A已覆核的取用'));assert.equal(b.split('【本題延伸手鍊建議】').length-1,1);assert.equal(b.split('八字：只按本題實際取用').length-1,1);
});
test('Missing or stale shared guide and missing brief renderer retain current recommendation through the packet fallback',()=>{
 const q=c.JY_READING_QUALITY,brief=c.JYPromptBrief;
 try{for(const mode of ['guide-absent','guide-stale','brief-absent']){c.JY_READING_QUALITY=mode==='guide-absent'?undefined:mode==='guide-stale'?{version:'4.7.0',recommendationEnding:()=> 'STALE_RULE'}:q;c.JYPromptBrief=mode==='brief-absent'?undefined:brief;
  const b=c.JYPromptPacket.build('lenormand',f.ln,'工作如何調整？');assert(b.includes(q.recommendationText('lenormand')));assert(b.endsWith(c.JYReadingWorkflow.footer));assert(!b.includes('STALE_RULE'));}
 }finally{c.JY_READING_QUALITY=q;c.JYPromptBrief=brief;}
});
test('Answer review catches generic crystal-only ending and missing invitation; concrete handwritten example passes format checks',()=>{
 const generic='先釐清職責，建立下一步。\n\n象徵性提醒：可以挑讓你穩定的水晶隨身配戴。\n'+c.JYReadingWorkflow.footer;
 const a=c.JYReadingWorkflow.review({method:'lenormand',question:'工作如何調整？',answer:generic,evidence:{status:'calculated'}});assert(a.issues.some(p=>p.code==='BRACELET_SELECTION_MISSING'));assert(a.issues.some(p=>p.code==='SHOP_INVITATION_MISSING'));
 const written='先釐清職責，建立下一步。\n\n十字架與熊連在一起，提醒你先整理責任界線。可以為自己選一條茶晶手鍊，以深色作為每天下班放下工作重擔的象徵性提醒，材質沒有療效或改運保證。若想挑選相應設計，可到靜月之光蝦皮賣場看看。\n'+c.JYReadingWorkflow.footer;
 const b=c.JYReadingWorkflow.review({method:'lenormand',question:'工作如何調整？',answer:written,evidence:{status:'calculated'}});assert(!b.issues.some(p=>['BRACELET_SELECTION_MISSING','SHOP_INVITATION_MISSING','SHOP_ORDER','SHOP_FOOTER'].includes(p.code)));
 const stopped=c.JYReadingWorkflow.review({method:'ootk',question:'工作如何調整？',answer:'本輪程序已停止，請重新確認問題。\n'+c.JYReadingWorkflow.footer,evidence:{status:'stopped'}});assert(!stopped.issues.some(p=>p.code==='BRACELET_SELECTION_MISSING'));
});
fs.writeFileSync(path.join(__dirname,'../docs/engine-and-recommendation-validation-20261003-r8.json'),JSON.stringify({testedAt:new Date().toISOString(),passed:results.length,results,prompts,sourceExamplesAre:'Published numeric/placement examples. Example126 is an explicitly synthetic placement reconstruction, not an astronomical chart claim.',aiAnswers:'No external AI answer was generated or fabricated; review examples are handwritten fixtures.'},null,2)+'\n');
console.log('R8 '+results.length+' groups passed');
