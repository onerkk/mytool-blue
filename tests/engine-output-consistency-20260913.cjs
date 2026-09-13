'use strict';
// Load complete runtime scripts and all _buildPayload wrappers, not extracted sections.
// Fixtures test data/method consistency, not whether divination predicts events.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const {environment}=require('./dom-fixture.cjs');
const root=path.resolve(__dirname,'..'),plain=x=>JSON.parse(JSON.stringify(x));
const env=environment(),c=env.ctx,logs=[],results=[];
c.console={log(){},warn(...x){logs.push(x.map(String).join(' '));},error(...x){logs.push(x.map(String).join(' '));}};
c.Image=function(){return c.document.createElement('img');};c.fetch=async()=>{throw Error('Test forbids live requests');};
const files=['vendor/lunar','bazi-calendar-core','solar-location','bazi','bazi_upgrade','picker-core','tarot-foundation','golden-dawn-tarot','tarot','tarot-reading','tarot_upgrade','meihua_upgrade','meihua_output_layer','meihua_upgrade2','reading-quality','ai-analysis','ziwei','ziwei-prompt-root','ziwei-standalone','bazi-prompt-root','bazi-standalone','bazi-suite-core','prompt-export'];
for(const file of files)vm.runInContext(fs.readFileSync(path.join(root,'JS',file+'.js'),'utf8'),c,{filename:file});
const reference='2026-09-13T00:00:00Z';
function test(name,fn){try{fn();results.push({name,status:'passed'});console.log('PASS '+name);}catch(e){results.push({name,status:'failed',error:e.stack});process.exitCode=1;console.error('FAIL '+name+'\n'+e.stack);}}
function birth(ref=reference){return c.enhanceBazi(c.computeBazi(1983,8,25,14,55,'male',{referenceDate:ref}));}
const b=birth(),z=c.computeZiwei(1983,8,25,14,'male',{referenceDate:reference});
function reset(){c.S.form={bdate:'1983-08-25',btime:'14:55',gender:'male',type:'general',question:'我適合配戴什麼手鍊？'};c.S.bazi=b;c.S.ziwei=z;c.S.meihua=null;c.S.tarot={};c._ootkResults=null;logs.length=0;}
function clean(obj){const text=JSON.stringify(obj),bad=text.match(/.{0,70}(?:undefined|NaN|\[object Object\]).{0,70}/);assert(!bad,'Broken serialization: '+(bad&&bad[0]));}
function save(name,obj){if(!process.env.JY_OUTPUT_REVIEW)return;fs.mkdirSync(process.env.JY_OUTPUT_REVIEW,{recursive:true});fs.writeFileSync(path.join(process.env.JY_OUTPUT_REVIEW,name),typeof obj==='string'?obj:JSON.stringify(obj,null,2));}
reset();
const independentHidden={子:'癸',丑:'己癸辛',寅:'甲丙戊',卯:'乙',辰:'戊乙癸',巳:'丙戊庚',午:'丁己',未:'己丁乙',申:'庚壬戊',酉:'辛',戌:'戊辛丁',亥:'壬甲'};
const independentElements=Object.fromEntries([...'甲乙丙丁戊己庚辛壬癸'].map((g,i)=>[g,'木木火火土土金金水水'[i]]));
test('120 root combinations: day sitting root and four-branch root are independent facts',()=>{
 for(const dm of Object.keys(independentElements))for(const dz of Object.keys(independentHidden)){
  const chart={pillars:{year:{gan:'癸',zhi:'亥'},month:{gan:'庚',zhi:'申'},day:{gan:dm,zhi:dz},hour:{gan:'癸',zhi:'未'}},deDi:true,sittingRoot:true};
  const f=c.baziRootFacts(chart),has=z=>[...independentHidden[z]].some(g=>independentElements[g]===independentElements[dm]);
  assert.equal(f.sittingRoot,has(dz));assert.equal(f.hasAnyRoot,['亥','申',dz,'未'].some(has));
  assert.deepEqual(plain(f.dayHidden).sort(),[...independentHidden[dz]].sort()); // Root presence does not depend on listing order.
 }
 const f=c.baziRootFacts(b);assert.equal(f.sittingRoot,false);assert.equal(f.hasAnyRoot,true);
 assert.deepEqual(plain(f.roots.map(x=>[x.pillar,x.branch,x.stem])),[['year','亥','甲'],['hour','未','乙']]);
 const unknown=c.baziRootFacts(b,{unknown:true});assert.equal(unknown.scope,'THREE_KNOWN_BRANCHES');assert.equal(unknown.roots.length,1);assert(!c.baziRootLines(b,{unknown:true}).join('').includes('時支未'));
 const noKnownRoot={pillars:{year:{gan:'辛',zhi:'酉'},month:{gan:'辛',zhi:'酉'},day:{gan:'乙',zhi:'酉'}}};
 assert.equal(c.baziRootFacts(noKnownRoot).hasAnyRoot,null);assert.equal(c.baziRootFacts(noKnownRoot).hasRootInKnownPillars,false);
});
test('Actual Bazi standalone and six-lens exports distinguish sitting root from roots elsewhere',()=>{
 const before=JSON.stringify(b),prompt=c.buildBaziPrompt(c.S.form.question,b,{bdate:'1983-08-25',btime:'14:55',gender:'male'});
 assert(prompt.includes('日支坐根：否（乙酉；日支藏辛）'));assert(prompt.includes('四支通根：是'));assert(!prompt.includes('日支坐根：是'));clean(prompt);
 for(const lens of Object.keys(c.BaziSuiteCore.lenses)){
  const text=c.BaziSuiteCore.buildSinglePrompt(lens,b,{},'我適合配戴什麼手鍊？');assert(text.includes('日支坐根：否'));assert(text.includes('年支亥藏甲'));assert(text.includes('時支未藏乙'));clean(text);
 }
 const partial=c.buildBaziPrompt('根氣？',b,{unknown:true});assert(partial.includes('已知柱通根'));assert(!partial.includes('時支未藏乙'));
 assert.equal(JSON.stringify(b),before,'Export must not alter the strength model');save('bazi-standalone-prompt.txt',prompt);
});
test('Complete composite payload preserves neutral strength, god identities, Shensha and exact luck dates',()=>{
 reset();const p=c._buildPayload(),d=p.dims.bazi;assert(b.isNeutral);assert.equal(d.strengthLabel,'中和');assert.equal(d.strong,null);
 assert(p.rawReadings.bazi.includes('旺衰模型：中和'));assert(p.reversibility.bazi.fix.includes('旺衰模型：中和'));
 assert.equal(d.sittingRoot,false);assert.equal(d.hasAnyRoot,true);assert(d.deLingDiShi.includes('日支坐根：否'));
 assert(d.tenGods.includes('年干癸=偏印'));assert(d.tenGods.includes('月干庚=正官'));assert(d.shensha.includes(b.shensha[0]));
 for(const dy of b.dayun){assert(d.allDayun.includes(dy.startDate));assert(d.allDayun.includes(dy.endDateExclusive||dy.endDate));}
 assert(d.qiyun.includes(b.qiyun.startAgeText));assert(d.qiyun.includes(b.qiyun.startDate));assert(p.timeline.some(x=>x.includes((b.dayun.find(x=>x.isCurrent)).endDateExclusive)));
 assert.equal(d.selfPartyWeightPercent,b.selfRatio);assert(!('strongPercent' in d));clean(p.rawReadings);clean(d);assert.deepEqual(logs,[]);
 save('composite-payload.json',p);
 const old=b.shensha;b.shensha=[{name:'天乙貴人'}];try{const shaped=c._buildPayload();assert(shaped.dims.bazi.shensha.includes('天乙貴人'));clean(shaped.rawReadings.bazi);}finally{b.shensha=old;}
});
test('Actual composite Bazi result renderer displays neutral and distinguishes day/other roots',()=>{
 reset();
 const ids=[...(fs.readFileSync(path.join(root,'JS/tarot.js'),'utf8')+'\n'+c.renderBazi.toString()).matchAll(/getElementById\(['"]([^'"]+)['"]\)/g)].map(m=>m[1]);
 for(const id of ids)if(!env.doc.getElementById(id)){const el=env.doc.body.appendChild(new env.Element('div'));el.id=id;}
 c.renderBazi();
 const output=ids.map(id=>env.doc.getElementById(id).innerHTML).join('\n');
 assert(output.includes('日支坐根：否'));assert(output.includes('四支通根：是'));assert(output.includes('中和'));assert(!output.includes('天生自帶能量'));assert(!/undefined|NaN/.test(output),(output.match(/.{0,65}(?:undefined|NaN).{0,65}/g)||[]).slice(0,8).join('\n'));
});
test('Ziwei periods retain their own scale and saved lunar year in raw text and structured data',()=>{
 reset();const p=c._buildPayload(),text=p.rawReadings.ziwei,dx=z.daXian.find(d=>d.isCurrent),year=z.getLiuNianZw(2026);
 assert(text.includes(dx.level));assert(!text.includes('很差'));assert(text.includes('零為基準'));assert(text.includes((year.score>=0?'+':'')+year.score));
 assert(p.dims.ziwei.lnDetail.includes('2026農曆年度'));
 for(const [ref,yr]of [['2026-02-16T04:00:00Z',2025],['2026-02-17T04:00:00Z',2026]]){
  c.S.ziwei=c.computeZiwei(1983,8,25,14,'male',{referenceDate:ref});const q=c._buildPayload();assert(q.dims.ziwei.lnDetail.startsWith(yr+'農曆年度'));assert(q.rawReadings.ziwei.includes(yr+'年'));
 }
 c.S.ziwei=c.computeZiwei(1983,8,25,14,'male',{referenceDate:'2025-08-01T04:00:00Z'});assert(c._buildPayload().rawReadings.ziwei.includes('農曆閏6月'));
 c.S.ziwei=z;
});
const gen={木:'火',火:'土',土:'金',金:'水',水:'木'},control={木:'土',土:'水',水:'火',火:'金',金:'木'};
const trigrams={'111':['乾','金'],'110':['兌','金'],'101':['離','火'],'100':['震','木'],'011':['巽','木'],'010':['坎','水'],'001':['艮','土'],'000':['坤','土']};
const rel=(a,b)=>a===b?'比和':gen[a]===b?'A生B':gen[b]===a?'B生A':control[a]===b?'A剋B':'B剋A';
test('384 Meihua cases: moving trigram is Yong; changed Yong and both mutual trigrams retain their actual relation to Ti',()=>{
 let conflicts=0,drain=0,example;
 for(let up=1;up<=8;up++)for(let lo=1;lo<=8;lo++)for(let moving=1;moving<=6;moving++){
  const r=c.calcMH(up,lo,moving,{timestamp:reference,method:'fixture'}),a=c.analyzeMeihua(r,'general'),bits=plain(r.lo.li.concat(r.up.li));
  assert.equal(a.dongYao.inTi,false);assert.equal(a.dongYao.inYong,true);assert.equal(a.dongYao.side,moving>3?'upper':'lower');
  const changed=bits.map((v,i)=>i===moving-1?1-v:v),ti=trigrams[(moving<=3?bits.slice(3):bits.slice(0,3)).join('')][1],use=trigrams[(moving<=3?changed.slice(0,3):changed.slice(3)).join('')][1];
  assert.equal(a.bianGua.changedUseRelation,rel(ti,use));
  const lower=rel(ti,trigrams[bits.slice(1,4).join('')][1]),upper=rel(ti,trigrams[bits.slice(2,5).join('')][1]);
  assert.equal(a.huGua.lowerRelation,lower);assert.equal(a.huGua.upperRelation,upper);assert.equal(a.huGua.primaryRelation,lower===upper?lower:'交錯');
  const deep=c.mhHuGuaDeep(r);assert.equal(deep.huGua,r.hu.n);assert.equal(deep.lower.relation,lower);assert.equal(deep.upper.relation,upper);clean(deep);
  if(lower!==upper)conflicts++;if(rel(ti,use)==='A生B'){drain++;example??={input:[up,lo,moving],hexagram:r.ben.n,changed:r.bian.n,body:r.tiG,changedUse:use,relation:a.bianGua.changedUseRelation};}
 }
 assert(conflicts>0);assert(drain>0);save('meihua-geometry-case.json',{cases:384,mutualMixedCases:conflicts,changedUseDrainCases:drain,example});
});
test('Meihua saved casting time reaches initial analysis, enriched season and complete composite output',()=>{
 reset();const r=c.calcMH(2,3,5,{timestamp:'2026-06-15T00:00:00Z',method:'fixture'});c.enhanceMeihua(r);assert.equal(r.analysis.referenceTimestamp,'2026-06-15T00:00:00.000Z');
 const before=JSON.stringify({analysis:r.analysis,deep:r.tiYongDeep}),Native=c.Date;
 class LaterDate extends Date{constructor(...args){super(...(args.length?args:['2026-12-15T00:00:00Z']));}static now(){return Date.parse('2026-12-15T00:00:00Z');}}
 c.Date=LaterDate;try{c.buildMeihuaOutput(r,'general');c.enhanceMeihua(r);assert.equal(JSON.stringify({analysis:r.analysis,deep:r.tiYongDeep}),before);}finally{c.Date=Native;}
 c.S.meihua=r;const p=c._buildPayload();assert(p.rawReadings.meihua.includes('本次用卦'));assert(!p.rawReadings.meihua.includes('動爻在體卦'));assert(!p.dims.meihua.dongYao.includes('動爻在體卦'));clean(p.rawReadings.meihua);save('meihua-composite.json',{raw:p.rawReadings.meihua,dims:p.dims.meihua});
 assert.throws(()=>c.calcMH(2,3,5,{timestamp:'bad'}),/時間/);
});
vm.runInContext('window.__deck=TAROT;window.__defs=SPREAD_DEFS;',c);
function draw(id,mode){
 const question='公司女工程師與我的互動如何？',f=c.JYTarotFoundation,compiled=f.compileQuestion(question,{referenceDate:reference}),plan=f.instantiateMethod(id,compiled),def=c.__defs[id];
 c.S.form.type='love';c.S.form.question=question;c.S.tarot={spreadType:id,spreadDef:def,compiledQuestion:compiled,methodPlan:plan};c.setCurrentSpread(id);
 let n=0;c._secRand=()=>++n%2?0.2:0.8;const deck=def.deckFilter==='minor_only'?c.__deck.filter(x=>x.suit!=='major'):c.__deck;
 const cards=c.JY_buildCanonicalTarotDraw(deck,id,def,'fixture','love',question);
 cards.forEach(x=>c.JYTarotReading.apply(x,mode==='gd_book_t'?true:x.isUp,id,mode));c.S.tarot.drawn=cards;return cards;
}
test('27 tarot mode/spread combinations remain identical through the full composite adapter, including RWS reversals',()=>{
 reset();const ids=['three_card','five_card','cross','either_or','timeline','relationship','horseshoe','celtic_cross','tree_of_life','zodiac','minor_arcana','fifteen_card','mathers_21','mathers_horseshoe'];let count=0;
 for(const id of ids)for(const mode of id==='fifteen_card'?['gd_book_t']:['rws_reversals','gd_book_t']){
  const cards=draw(id,mode),native=c._buildTarotOnlyPayload().tarotData,before=JSON.stringify(cards),p=c._buildPayload();
  assert(p.dims.tarot,id+' missing cards');assert.deepEqual(plain(p.dims.tarot),plain(native),id+' mode '+mode);assert.equal(JSON.stringify(cards),before,id+' mutated cards');
  assert.deepEqual(JSON.parse(p.rawReadings.tarot),plain(native));clean(p.dims.tarot);
  if(id!=='celtic_cross')assert(!(p.otherPersonProfile||[]).some(x=>x.includes('塔羅環境位')||x.includes('凱爾特十字第8位')));
  if(id==='celtic_cross'&&mode==='rws_reversals'){const envLine=(p.otherPersonProfile||[]).find(x=>x.includes('凱爾特十字第8位'));assert(envLine);assert(envLine.includes('RWS'));assert(!envLine.includes('Book T'));save('tarot-rws-composite.json',{cards:p.dims.tarot,context:p.otherPersonProfile});}
  count++;
 }
 assert.equal(count,27);
});
test('Invalid tarot draws and stopped Key cannot leave fabricated or stale composite cards',()=>{
 reset();const cards=draw('five_card','rws_reversals');c.S.tarot.drawn=[cards[0],cards[0],...cards.slice(2)];let p=c._buildPayload();assert(p.dataErrors.some(x=>x.system==='tarot'));assert(!p.dims.tarot);assert(!p.rawReadings.tarot);
 c.S.tarot.spreadType='ootk';c._ootkResults={questionText:'原始問題',castTimestamp:reference,significator:{id:35,name:'權杖國王'},op1:{activeCards:c.__deck.slice(0,4),mainLineValidation:{status:'requires_querent_confirmation'}},abandonedAt:'op1'};
 const native=c._buildOOTKPayload().ootkData;p=c._buildPayload();assert.deepEqual(plain(p.dims.ootk),plain(native));assert(!p.dims.tarot);assert(!p.rawReadings.tarot);assert.deepEqual(Object.keys(p.dims.ootk.operations),['op1']);
 c._ootkResults={abandonedAt:'predeal_binding'};p=c._buildPayload();assert(!p.dims.ootk);assert(p.dataErrors.some(x=>x.system==='tarot'));
});
save('output-test-results.json',{suite:'complete-runtime-output-consistency',runtimeFiles:files,results,liveAIRequests:false});
console.log('Output consistency: '+results.filter(x=>x.status==='passed').length+'/'+results.length+' groups passed.');
