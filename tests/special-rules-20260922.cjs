'use strict';
// Adversarial structure fixtures plus real runtime exports. Not predictive validation.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const {environment}=require('./dom-fixture.cjs'),base=path.resolve(__dirname,'..'),plain=x=>JSON.parse(JSON.stringify(x));
const {ctx:c}=environment();c.console={log(){},warn(){},error(){}};c.Image=function(){return c.document.createElement('img');};
const load=f=>vm.runInContext(fs.readFileSync(path.join(base,'JS',f+'.js'),'utf8'),c,{filename:f});
['vendor/lunar','bazi-calendar-core','solar-location','bazi','bazi_upgrade','picker-core','tarot-foundation','golden-dawn-tarot','tarot','tarot-reading','tarot_upgrade','meihua_upgrade','meihua_output_layer','meihua_upgrade2','reading-quality','ai-analysis','ziwei','ziwei-prompt-root','ziwei-standalone','bazi-prompt-root','bazi-standalone','bazi-suite-core','prompt-export','name_upgrade','lenormand','liuyao-core','yijing-data','yijing-core','gua-prompt','vendor/astronomy-engine-2.1.19.min','vedic-ayanamsa','vedic-engine','vedic-prompt','western-engine','western-prompt'].forEach(load);
const tests=[];function test(name,fn){try{fn();tests.push({name,status:'passed'});console.log('PASS '+name);}catch(e){tests.push({name,status:'failed',error:e.stack});console.error('FAIL '+name+'\n'+e.stack);process.exitCode=1;}}
const L=c.JYLiuyaoCore,V=c.JYVedic,W=c.JYWestern;
const cal=L.calendar({year:2026,month:9,day:22,hour:12,minute:0,timezoneOffset:8});
test('Sixyao: role-aware focus does not turn office attraction into a job question',()=>{
 assert.deepEqual(plain(L.focusFor('公司有異性喜歡我嗎？').candidates),['世應']);
 assert(L.focusFor('月底前能找到工作嗎').candidates.includes('官鬼'));
 assert(L.focusFor('這筆錢拿得回來嗎').candidates.includes('妻財'));
 const r=L.calculate({values:[7,7,7,7,7,7],calendar:cal,question:'爸爸求職會錄取嗎'});
 assert(r.interpretation.targets.some(t=>t.relative==='父母'&&t.role==='明示親屬'));
 assert(r.interpretation.targets.some(t=>t.relative==='官鬼'));
});
test('Sixyao: month-strength, static/moving, weak emptiness and tombs retain distinct effects',()=>{
 const make=(states,moving=false)=>({position:1,branch:'卯',element:'木',moving,states:{monthRelation:'生',dayRelation:'克',dayClash:true,...states},changed:{branch:'未'},transition:null});
 let x=make({});assert.equal(L.assessLine(x,{day:'辛酉'},[x]).dayEffect,'hidden-movement');
 x=make({monthRelation:'克',void:true});let a=L.assessLine(x,{day:'辛酉'},[x]);assert.equal(a.dayEffect,'day-break');assert(a.obstacles.some(v=>v.includes('未作沖實')));
 x=make({},true);assert.equal(L.assessLine(x,{day:'辛酉'},[x]).dayEffect,'moving-not-dispersed');
 x=make({monthRelation:'克',dayClash:false});a=L.assessLine(x,{day:'癸未'},[x]);assert.equal(a.lifeStages.day,'墓');assert(a.obstacles.some(v=>v.includes('入墓')));
 for(const [e,life,tomb,dead]of [['木','亥','未','申'],['火','寅','戌','亥'],['金','巳','丑','寅'],['水','申','辰','巳'],['土','申','辰','巳']]){assert.equal(L.lifeStage(e,life),'長生');assert.equal(L.lifeStage(e,tomb),'墓');assert.equal(L.lifeStage(e,dead),'絕');}
});
test('Sixyao: bounded dates follow actual calendar; next-month does not become this-month',()=>{
 assert.equal(L.parseWindow('下個月底之前',cal).end,'2026-10-31');
 assert.equal(L.parseWindow('未來兩週會聯絡嗎',cal).end,'2026-10-05');
 assert.equal(L.parseWindow('最近怎樣',cal).status,'unspecified');
 assert.throws(()=>L.parseWindow('',cal,{end:'2027-02-29'}));
 const r=L.calculate({values:[9,7,9,6,7,6],calendar:cal,question:'月底前會錄取嗎？'}),t=r.interpretation.timing;
 assert.equal(t.window.end,'2026-09-30');assert(t.candidates.length>0);
 for(const d of t.candidates){assert(d.date>='2026-09-22'&&d.date<='2026-09-30');const [year,month,day]=d.date.split('-').map(Number);assert.equal(d.day,L.calendar({year,month,day,hour:12,minute:0,timezoneOffset:8}).day);}
 const p=c.JYGuaPrompt.build(r);assert(p.includes('已核對的取用'));assert(p.includes('有期限的應期候選'));assert(p.includes('targets'));assert(!p.includes('undefined'));
 assert.equal(L.calculate({values:[7,7,7,7,7,7],calendar:cal}).interpretation.transformations.length,0);
});
const names=['命宮','兄弟','夫妻','子女','財帛','疾厄','遷移','交友','官祿','田宅','福德','父母'],dz='子丑寅卯辰巳午未申酉戌亥';
function zw(branch='卯'){return names.map((name,i)=>({name,branch:dz[(dz.indexOf(branch)-i+12)%12],stars:[]}));}
function put(z,p,...stars){z.find(x=>x.name===p).stars.push(...stars.map(name=>({name,type:['火星','鈴星','左輔','右弼','文昌','文曲'].includes(name)?'minor':'major'})));return z;}
function matched(z,id){return c.assessZiweiPatterns(z).patterns.some(p=>p.id===id);}
test('Ziwei: rejects old wrong sun/pearl patterns and three-out-of-four shortcut',()=>{
 let z=put(zw(),'命宮','太陽','巨門');assert(!matched(z,'sun-thunder'));z=put(zw(),'命宮','太陽','天梁');assert(matched(z,'sun-thunder'));
 z=zw('未');put(z,'財帛','太陽');put(z,'官祿','太陰');put(z,'遷移','天同','巨門');assert(matched(z,'pearl'));put(z,'命宮','天機');assert(!matched(z,'pearl'));
 z=zw();put(z,'命宮','天機');put(z,'財帛','太陰');put(z,'官祿','天同');assert(!matched(z,'jiyuetongliang'));put(z,'遷移','天梁');assert(matched(z,'jiyuetongliang'));
});
test('Ziwei: flanking means two neighboring palaces; light levels are actual table values',()=>{
 let z=zw();put(z,'父母','文昌');put(z,'兄弟','文曲');assert(matched(z,'literary-flank'));z=zw();put(z,'命宮','文昌','文曲');assert(!matched(z,'literary-flank'));
 z=zw('丑');put(z,'官祿','太陽');put(z,'財帛','太陰');assert(matched(z,'sunmoon-bright'));
 z=zw('未');put(z,'官祿','太陽');put(z,'財帛','太陰');assert(matched(z,'sunmoon-fallen'));assert(!matched(z,'sunmoon-bright'));
 z=zw();put(z,'夫妻','火星','貪狼');const p=c.assessZiweiPatterns(z).patterns.find(p=>p.name==='火貪同宮');assert.deepEqual(plain(p.palaces),['夫妻']);assert(p.modifiers.some(m=>m.star==='火星'));
});
function pillars(text){return Object.fromEntries(text.split(' ').map((s,i)=>[['year','month','day','hour'][i],{gan:s[0],zhi:s[1]}]));}
const brule=(p,id)=>c.assessBaziSpecialRules(pillars(p)).rules.find(r=>r.id===id);
test('Bazi: following-output permits rooted peers; the printed season does not create a special pattern',()=>{
 assert.equal(brule('甲午 丙午 甲午 丁未','follow-output').status,'structural');
 assert.equal(brule('癸亥 丙午 甲午 丁未','follow-output').status,'not-established');
 assert.equal(brule('辛巳 丁酉 庚丑 辛酉','special-金').status,'variant-structure');
 assert.equal(brule('辛巳 丁酉 庚子 辛酉','special-金').status,'not-established');
 const a=c.assessBaziSpecialRules(pillars('癸亥 庚申 乙酉 癸未'));assert(!a.matched.some(x=>x.id==='follow-officer'));assert(a.huaQi);
 assert.equal(brule('甲卯 丙卯 乙卯 丁未','jianlu').status,'structural');assert.equal(brule('甲卯 丙卯 乙卯 丁未','yangren').status,'not-established');
});
test('Bazi: real following-output chart does not restore ordinary support advice in its upgrade',()=>{
 const b=c.enhanceBazi(c.computeBazi(1966,6,24,3,0,'male',{referenceDate:'2026-09-22T00:00:00Z'}));
 assert.deepEqual(plain(b.pillars),plain(pillars('丙午 甲午 甲寅 丙寅')));
 assert(b.specialRuleAssessment.matched.some(r=>r.id==='follow-output'));
 assert.equal(b.fuyiAssessment.appliesAsFinalUse,false);assert(b.fuyiAssessment.ordinaryComparison.fav.length);
 assert.equal(b.fav.length,0);assert.equal(b.unfav.length,0);
 assert(Object.values(b.wuxingStance.map).every(x=>x==='待定'));assert(b.wuxingStance.candidateOnly);
 assert(b.fuyiAssessment.items.every(x=>x.stance==='待定'));assert(b.wuxingStance.summary.includes('從兒'));
 assert(!b.wuxingStance.summary.includes('扶抑以根氣與印比承接為主'));
});
test('Bazi: unknown-hour composite exports omit noon-derived structures, timing and cached consensus',()=>{
 const saved={form:c.S.form,bazi:c.S.bazi,tarot:c.S.tarot,_dimResults:c.S._dimResults};
 try{
  c.S.bazi=c.enhanceBazi(c.computeBazi(1983,8,25,12,0,'male',{referenceDate:'2026-09-22T00:00:00Z'}));
  c.S.form={bdate:'1983-08-25',btime:'',btimeUnknown:true,gender:'male',type:'general',question:'工作？'};c.S.tarot={};
  c.S._dimResults=[{dim:'八字',reason:'暫排時柱根氣',positives:['暫排時柱根氣'],supports:['暫排時柱根氣']}];
  const p=c._buildPayload(),d=p.dims.bazi;
  assert.equal(d.status,'BIRTH_TIME_UNKNOWN');assert.equal(d.birthFacts.pillars.length,3);assert.equal(d.rootFacts.scope,'THREE_KNOWN_BRANCHES');
  for(const key of ['specialRuleAssessment','fuyiAssessment','seasonalAssessment','strengthAssessment','allDayun','qiyun','favEls','shensha'])assert(!(key in d));
  assert(!/時干壬|時支午藏|壬午|1989-05-03/.test(JSON.stringify(d)+p.rawReadings.bazi));
  assert(!(p.timeline||[]).some(x=>/^八字/.test(x)));
  assert(!JSON.stringify(p.crossSummary).includes('暫排時柱根氣'));
  assert(!JSON.stringify(p.crossSummary).includes('"bazi"'));
 }finally{Object.assign(c.S,saved);}
});
test('Meihua: all 384 inputs use one nuclear rule and unchanged original body',()=>{
 for(let up=1;up<=8;up++)for(let lo=1;lo<=8;lo++)for(let dong=1;dong<=6;dong++){
  const m=c.calcMH(up,lo,dong,{timestamp:'2026-09-22T04:00:00Z'}),bits=plain(m.lo.li.concat(m.up.li)),pure=bits.every(v=>v===bits[0]);
  if(pure)bits[dong-1]^=1;
  const expected=[bits[1],bits[2],bits[3],bits[2],bits[3],bits[4]],n=c.mhNuclearContext(m),deep=c.mhHuGuaDeep(m),a=c.analyzeMeihua(m,'general');
  assert.deepEqual(plain(n.lines),expected);assert.equal(m.hu.n,n.hexagram.n);assert.equal(deep.lower.name,n.lower.name);assert.equal(deep.upper.name,n.upper.name);assert.equal(a.nuclear.hexagram.n,m.hu.n);assert.equal(m.tiG.name,dong<=3?m.up.name:m.lo.name);
 }
 const m=c.calcMH(1,1,2,{timestamp:'2026-09-22T04:00:00Z'}),old=c.getYaoCi;
 try{c.getYaoCi=()=> '大吉元吉';const a=c.analyzeMeihua(m,'general');c.getYaoCi=()=> '無凶無厲';assert.equal(a.score,c.analyzeMeihua(m,'general').score);}finally{c.getYaoCi=old;}
});
function planets(houses,asc=0){const ps={};V.KEYS.forEach((key,i)=>{const sign=((houses[i%houses.length]-1)+(asc||0))%12,longitude=sign*30+8+i*.2;ps[key]={key,sign,longitude,degree:longitude%30,house:asc==null?null:(sign-asc+12)%12+1,dignity:V.dignity(key,longitude),sunSeparation:0};});return ps;}
const special=(ps,asc=0)=>V.specialYogas(ps,asc,V.aspects(ps,asc));
test('Jyotisha: all 32 Naabhasa identities present, shapes and Sankhya priority stay distinct',()=>{
 const a=special(planets([1,4,7,10,1,4,7]));assert.equal(a.checks.filter(x=>x.id.startsWith('N-')).length,32);assert.equal(a.checks.find(x=>x.id==='N-Kamala').status,'structural');assert.equal(a.checks.find(x=>x.id==='N-Kedaara').status,'superseded');
 const h=special(planets([1,2,3,4,5,6,7]));assert.equal(h.checks.find(x=>x.id==='N-Naukaa').status,'structural');assert.equal(h.checks.find(x=>x.id==='N-Chatra').status,'not-established');
 const short=special(planets([1,1,1,1,1,1,1]));assert.equal(short.checks.find(x=>x.id==='N-Kamala').status,'not-established');
 const absent=special(planets([1,2,3,4,5,6,7],null),null);assert.equal(absent.checks.find(x=>x.id==='N-Naukaa').status,'insufficient-data');assert.equal(absent.checks.find(x=>x.id==='N-Veenaa').status,'insufficient-data');
});
test('Jyotisha: Kemadruma cancellation and unknown time do not report a confirmed bad yoga',()=>{
 const ps=planets([1,5,8,8,8,8,8]);let a=special(ps);assert.equal(a.checks.find(x=>x.id==='Kemadruma').status,'cancelled');
 for(const key of V.KEYS)ps[key].house=null;
 a=special(ps,null);assert.equal(a.checks.find(x=>x.id==='Kemadruma').status,'insufficient-data');
 assert(!a.matched.some(x=>x.id==='Kemadruma'));
 const flank=planets([1,5,3,3,3,3,3]);flank.Rahu.sign=5;flank.Ketu.sign=3;a=special(flank);assert.equal(a.checks.find(x=>x.id==='Sunaphaa').status,'not-established');
});
test('Jyotisha: named dusthana yogas require their own house, export carries all exclusions',()=>{
 const ps=planets([1,2,3,12,5,6,8]);let a=special(ps);assert.equal(a.checks.find(x=>x.id==='Harsha').status,'not-established');
 ps.Mercury.house=6;ps.Mercury.sign=5;a=special(ps);assert.equal(a.checks.find(x=>x.id==='Harsha').status,'structural');
 const r=V.compute({utc:'1983-08-25T06:55:00Z',reference:'2026-09-22T04:00:00Z',latitude:23.31,longitude:120.31,uncertaintyMinutes:0});
 for(const y of r.yogas)assert(Array.isArray(y.conditions));assert(c.JYVedicPrompt.build('工作走向',r).includes('specialRules'));
});
function edges(spec){const ps={};W.KEYS.forEach((key,i)=>{const longitude=spec[i]??(23.7+i*25.81);ps[key]={key,longitude,sign:Math.floor(longitude/30),speed:0};});return W.aspects(ps,null,{minor:true});}
test('Western: Yod, boomerang, cradle, rectangle, kite and hexagon require all edges',()=>{
 assert(W.patterns(edges([0,60,210])).some(p=>p.name==='Yod'));assert(!W.patterns(edges([0,60,214])).some(p=>p.name==='Yod'&&p.planets.every(k=>['Sun','Moon','Mercury'].includes(k))));
 for(const [pattern,angles] of [['迴力鏢 Yod',[0,60,210,30]],['搖籃',[0,60,120,180]],['神秘矩形',[0,60,180,240]],['風箏',[0,120,240,180]],['大六分相',[0,60,120,180,240,300]]])assert(W.patterns(edges(angles)).some(p=>p.name===pattern),pattern);
 const p=Object.fromEntries(W.KEYS.map((k,i)=>[k,{key:k,longitude:100+i*20,sign:0}]));p.Sun.longitude=359.9;p.Mercury.longitude=0.1;assert.equal(W.solarConditions(p).find(x=>x.planet==='Mercury').state,'cazimi');p.Mercury.longitude=8.39;assert.equal(W.solarConditions(p)[0].state,'combust');p.Mercury.longitude=8.5;assert.equal(W.solarConditions(p)[0].state,'under-beams');
});
test('Lenormand: both full tableaux preserve house cycles, swaps, fixed points and reject damaged decks',()=>{
 const deck=Array.from({length:36},(_,i)=>({id:i+1,name:String(i+1)}));let r=c.JYLenormand.houseRelations(deck);assert.equal(r.ownHouses.length,36);
 [deck[0],deck[1]]=[deck[1],deck[0]];r=c.JYLenormand.houseRelations(deck);assert.deepEqual(plain(r.mutualHouses),[[1,2]]);assert.equal(r.ownHouses.length,34);assert.equal(r.houseCycles.reduce((n,x)=>n+x.steps.length,0),36);
 deck[2]=deck[1];assert.throws(()=>c.JYLenormand.houseRelations(deck));
});
test('Nameology: real loaded upgrade preserves unknown strokes and compound surname calculation',()=>{
 assert.equal(c.kangxiStroke('𠮷'),null);assert.equal(c.analyzeName('王𠮷'),null);assert(c._jyNameError.includes('不估算'));
 const r=c.analyzeName('歐陽明');assert(r,c._jyNameError);assert.equal(r.surname,'歐陽');assert.equal(r.given,'明');assert.equal(r.tianGe.num,r.strokes[0]+r.strokes[1]);assert.equal(r.diGe.num,r.strokes[2]+1);assert.equal(r.waiGe.num,r.strokes[0]+1);
 const x=c.analyzeName('王 志明華');assert.equal(x.surname,'王');assert.equal(x.given,'志明華');assert.equal(x.waiGe.num,x.tianGe.num+x.diGe.num-x.renGe.num);
 assert.equal(c.analyzeZodiacName('歐陽明',2026,{date:'2026-01-01'}).zodiac,'蛇');
});
test('Tarot: export blocks duplicate draws, missing positions and mixed traditions',()=>{
 const cards=[{id:0,readingMode:'rws_reversals',isUp:true},{id:1,readingMode:'rws_reversals',isUp:false}],args=[{},'工作',cards,'two',{slots:[{},{}]},{}];
 assert.equal(c.JYTarotReading.payload(...args).tarotData.cards[1].direction,'逆位');
 assert.throws(()=>c.JYTarotReading.payload({},'工作',[cards[0],cards[0]],'two',{slots:[{},{}]},{}));
 assert.throws(()=>c.JYTarotReading.payload({},'工作',cards,'three',{slots:[{},{},{}]},{}));
 assert.throws(()=>c.JYTarotReading.payload({},'工作',[cards[0],{...cards[1],readingMode:'gd_book_t'}],'two',{slots:[{},{}]},{}));
});
test('Coverage register accounts for every active reading method and names its limits',()=>{
 const coverage=JSON.parse(fs.readFileSync(path.join(base,'data/engine-rule-coverage.json'),'utf8'));
 assert.deepEqual(coverage.methods.map(x=>x.method).sort(),plain(c.JY_READING_QUALITY.methodKinds()).sort());
 for(const m of coverage.methods){assert(fs.existsSync(path.join(base,m.engine)));assert(m.implemented.length);assert(m.limits.length);assert(m.profile);}
});
if(process.env.JY_SPECIAL_REPORT){fs.mkdirSync(path.dirname(process.env.JY_SPECIAL_REPORT),{recursive:true});fs.writeFileSync(process.env.JY_SPECIAL_REPORT,JSON.stringify({date:'2026-09-22',tests,scope:'Rule arithmetic, exclusions, adapters; no empirical predictive validation'},null,2));}
console.log('Special-rule regression groups: '+tests.filter(t=>t.status==='passed').length+'/'+tests.length);
