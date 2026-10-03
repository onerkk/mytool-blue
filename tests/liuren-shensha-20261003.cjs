'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),c=require('./native-fixtures-20261003.cjs').environment().ctx,S=c.JYLiurenShensha,Core=c.JYLiurenCore,Z=[...'子丑寅卯辰巳午未申酉戌亥'],G=[...'甲乙丙丁戊己庚辛壬癸'],plain=x=>JSON.parse(JSON.stringify(x)),results=[];
function test(name,fn){try{fn();results.push({name,status:'passed'});console.log('PASS '+name);}catch(e){results.push({name,status:'failed',error:e.stack});console.error('FAIL '+name+' '+e.stack);process.exitCode=1;}}
const r=Core.calculate({date:'1998-11-30',time:'12:00',timezoneOffset:8,participants:[{natalBranch:'午',age:34,direction:'female'}]});
const get=(s,name,basis)=>s.checks.find(x=>x.name===name&&(!basis||x.basis===basis));
test('Published 1998-11-30 chart independently matches 辛巳日寅將午時 and winter 天目 on branch upper',()=>{
 assert.equal(r.day.ganzhi,'辛巳');assert.equal(r.monthGeneral.branch,'寅');assert.equal(r.hourBranch,'午');assert.deepEqual(plain(r.transmissions.map(x=>x.branch)),['午','寅','戌']);
 const eye=get(r.shensha,'天目');assert.equal(eye.location.original,'癸');assert.deepEqual(plain(eye.location.branches),['丑']);assert(eye.hits.some(h=>h.scope==='course'&&h.role===3));assert.equal(eye.occurrences[0].earth,'巳');
 // Only chart geometry and published rule are verified, not its reported event.
});
test('All twelve monthly tables use independent primary endpoints and preserve stem/direction distinctions',()=>{
 const expected={天德:[...'丁申壬辛亥甲癸寅丙乙巳庚'],月德:[...'丙甲壬庚丙甲壬庚丙甲壬庚'],天喜:[...'戌戌戌丑丑丑辰辰辰未未未'],地解:[...'申申酉酉戌戌亥亥午午未未'],解神:[...'申申戌戌子子寅寅辰辰午午'],皇恩方圖:[...'戌丑辰未酉卯子午寅巳申亥'],天解:[...'申未午巳辰卯寅丑子亥戌酉'],天馬:[...'午申戌子寅辰午申戌子寅辰'],罪至:[...'午子未丑申寅酉卯戌辰亥巳']};
 for(let m=0;m<12;m++){const a=S.compute(r,{...r.calendarContext,monthBranch:Z[(m+2)%12]});for(const [name,table]of Object.entries(expected))assert.equal(get(a,name).location.original,table[m],name+' month '+(m+1));assert.equal(get(a,'天德合').status,[1,4,7,10].includes(m)?'not-applicable':'calculated');assert.equal(get(a,'月建').location.original,Z[(m+2)%12]);assert.equal(get(a,'月建合神').location.original,[...'亥戌酉申未午巳辰卯寅丑子'][m]);}
 const a=S.compute(r,{...r.calendarContext,lunarMonth:-4},{monthPolicy:'lunar'});assert.equal(get(a,'天德').location.original,'辛');assert.equal(a.policy.month,'lunar');assert.throws(()=>S.compute(r,r.calendarContext,{monthPolicy:'invented'}));
});
test('Sixty annual ganzhi match independent twelve-god sequence, general and stem tables',()=>{
 const gods=['太歲','太陽','喪門','歲六合','歲官符','歲小耗','歲破','龍德','歲白虎','歲福德','弔客','病符'],general=[...'酉酉子子子卯卯卯午午午酉'],court=[...'丑寅辰巳辰巳未申戌亥'];
 for(let i=0;i<60;i++){const a=S.compute(r,{...r.calendarContext,yearGan:G[i%10],yearBranch:Z[i%12]});gods.forEach((name,j)=>assert.equal(get(a,name).location.original,Z[(i+j)%12]));assert.equal(get(a,'大將軍').location.original,general[i%12]);assert.equal(get(a,'天庭').location.original,court[i%10]);}
});
test('All daily stems/branches, real xun stems, multi-branch officers and Yin-day tile opposition',()=>{
 const lu=[...'寅卯巳午巳午申酉亥子'],de=[...'寅申巳亥巳寅申巳亥巳'],horse=[...'寅亥申巳寅亥申巳寅亥申巳'],gui=[['申'],['酉'],['子'],['亥'],['寅'],['卯'],['午'],['巳'],['辰','戌'],['丑','未']];
 for(let i=0;i<60;i++){const a=Core.chartFromSymbols({dayGan:G[i%10],dayZhi:Z[i%12],monthGeneral:'子',hourBranch:'午',context:{...r.calendarContext,monthBranch:'寅'}}).shensha;assert.equal(get(a,'日祿').location.original,lu[i%10]);assert.equal(get(a,'日德').location.original,de[i%10]);assert.equal(get(a,'驛馬','dayBranch').location.original,horse[i%12]);assert.deepEqual(plain(get(a,'日鬼').location.branches),gui[i%10]);const head=(i%12-i%10+12)%12;assert.equal(get(a,'旬癸閉口').location.original,Z[(head+9)%12]);assert.equal(get(a,'瓦煞').location.original,Z[(5+(i%10%2?6:0))%12]);}
});
test('All 290 registry rules execute over 720 day/rotation charts and twelve actual month indices',()=>{
 const names=S.registry().map(x=>x.id);assert.equal(names.length,290);assert.equal(new Set(names).size,290);let count=0;
 for(let i=0;i<60;i++)for(let rotation=0;rotation<12;rotation++){
  const chart=Core.chartFromSymbols({dayGan:G[i%10],dayZhi:Z[i%12],monthGeneral:Z[rotation],hourBranch:'子',context:r.calendarContext});
  for(let month=0;month<12;month++){const a=S.compute(chart,{...r.calendarContext,monthBranch:Z[(month+2)%12],yearGan:G[i%10],yearBranch:Z[i%12]});assert.equal(a.complete,true);assert.equal(a.counts.rules,290);for(const q of a.checks){assert.notEqual(q.status,'insufficient-data');for(const hit of q.hits){assert(q.location.branches.includes(hit.branch));if(hit.scope==='transmission')assert(chart.transmissions.some(t=>t.role===hit.role&&t.branch===hit.branch));}for(const p of q.occurrences)assert.equal(chart.plate.find(x=>x.earth===p.earth).sky,p.sky);}count++;}
 }
 results.push({name:'Exhaustive placement count',status:'measurement',charts:count,decisions:count*290});
});
test('Missing year/month input, fixed-ganzhi establishment and unresolved source text never become false facts',()=>{
 const simple=Core.chartFromSymbols({dayGan:'甲',dayZhi:'子',monthGeneral:'亥',hourBranch:'卯'}).shensha;assert.equal(simple.complete,false);assert(simple.counts.insufficientData>0);assert(get(simple,'太歲').missing.length);assert.equal(get(simple,'日祿').status,'calculated');assert.equal(get(simple,'太歲').location,null);
 const x=plain(r);Object.assign(x.day,{gan:'甲',zhi:'午',ganzhi:'甲午',yang:true});const summer=S.compute(x,{...r.calendarContext,monthBranch:'午'});assert.equal(get(summer,'天赦').dayEstablished,true);x.day.ganzhi='丙午';assert.equal(get(S.compute(x,{...r.calendarContext,monthBranch:'午'}),'天赦').dayEstablished,false);
 assert.equal(r.shensha.unresolvedSourceEntries.length,0);assert(r.shensha.resolvedSourceEntries.some(x=>x.raw.includes('胡')));assert(get(r.shensha,'罪至').source.endsWith('/5'));assert(r.shensha.sourceAudit.some(x=>x.variants?.daquan));
});
test('Real native prompt, participant upper hits and JSON stay source-aware and do not mutate registry',()=>{
 const before=JSON.stringify(r),a=c.JYNativeAnalysis.analyze('liuren',r),p=c.JYLiurenPrompt.build(r);assert.equal(a.coverage.shenshaRules,290);assert(a.items.some(x=>x.id==='shensha'));assert(p.includes('jy.liuren-shensha/1'));assert(p.includes('dayEstablished'));assert(p.includes('同原理別名'));assert(!/NaN|undefined/.test(p));assert(r.shensha.active.some(x=>x.hits.some(h=>h.scope==='participant-upper')));assert.equal(JSON.stringify(r),before);
 const modified=S.compute(r,r.calendarContext);modified.checks[0].table[0]='亥';assert.equal(S.registry()[0].table[0],'子');
});
const report={testedAt:new Date().toISOString(),passed:results.filter(x=>x.status==='passed').length,total:results.filter(x=>x.status!=='measurement').length,results};fs.writeFileSync(path.join(__dirname,'../docs/liuren-shensha-validation-20261003.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({passed:report.passed,total:report.total}));
