'use strict';
// Regression contracts for real calculation/export paths. No paid AI or browser requests.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),acorn=require('acorn');
const {environment}=require('./dom-fixture.cjs');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
let passed=0;
function test(name,fn){try{fn();passed++;console.log('✓ '+name);}catch(e){process.exitCode=1;console.error('✗ '+name+'\n'+e.stack);}}
function runtime(files){const e=environment();e.ctx.console={log(){},warn(){},error(){}};files.forEach(f=>vm.runInContext(read('JS/'+f+'.js'),e.ctx,{filename:f}));return e;}
const parsed=new Map();
function actualFunction(file,name){
  if(!parsed.has(file)){const src=read(file),nodes={};function walk(n){if(!n||typeof n!=='object')return;if(n.type==='FunctionDeclaration'&&n.id)nodes[n.id.name]=src.slice(n.start,n.end);for(const [k,v] of Object.entries(n)){if(k==='parent')continue;if(Array.isArray(v))v.forEach(walk);else if(v&&typeof v==='object')walk(v);}}walk(acorn.parse(src,{ecmaVersion:'latest'}));parsed.set(file,nodes);}
  const fn=parsed.get(file)[name];assert(fn,'Missing actual function '+name);return fn;
}
function expose(ctx,file,body){const src=read(file);assert(/\}\)\(\);\s*$/.test(src));vm.runInContext(src.replace(/\}\)\(\);\s*$/,body+'\n})();'),ctx,{filename:file});}
function plain(x){return JSON.parse(JSON.stringify(x));}

const t=runtime(['picker-core','tarot-foundation','golden-dawn-tarot','tarot','tarot-reading','tarot_upgrade']);
const c=t.ctx;vm.runInContext('window.__defs=SPREAD_DEFS;window.__deck=TAROT;',c);
c._jyTarotQuestionText=()=>c.S.form.question;
['_buildTarotOnlyPayload','_buildOOTKPayload'].forEach(n=>vm.runInContext(actualFunction('JS/ai-analysis.js',n),c));
vm.runInContext(read('JS/prompt-export.js'),c);
const question='今年工作與感情的主要條件？';
function draw(spread,mode='rws_reversals'){
  const f=c.JYTarotFoundation,compiled=f.compileQuestion(question,{referenceDate:'2026-09-08T12:00:00Z'}),plan=f.instantiateMethod(spread,compiled),def=c.__defs[spread];
  c.S.form={question};c.S.tarot={spreadType:spread,spreadDef:def,compiledQuestion:compiled,methodPlan:plan};
  c.setCurrentSpread(spread);
  let rng=0;c._secRand=()=>++rng%2?0.2:0.8;
  const deck=def.deckFilter==='minor_only'?c.__deck.filter(x=>x.suit!=='major'):c.__deck;
  const cards=c.JY_buildCanonicalTarotDraw(deck,spread,def,'fixture','general',question);
  if(mode==='gd_book_t')cards.forEach(x=>c.JYTarotReading.apply(x,true,spread,mode));
  c.S.tarot.drawn=cards;return {cards,plan,payload:c._buildTarotOnlyPayload(),prompt:c.JY_buildExportPrompt('tarot')};
}
test('14 tarot spreads: actual cards, directions, complete structural guide and result rules survive export',()=>{
  const ids=['three_card','five_card','cross','either_or','timeline','relationship','horseshoe','celtic_cross','tree_of_life','zodiac','minor_arcana','fifteen_card','mathers_21','mathers_horseshoe'];
  let cases=0;
  for(const id of ids)for(const mode of id==='fifteen_card'?['gd_book_t']:['rws_reversals','gd_book_t']){
    const r=draw(id,mode),td=r.payload.tarotData;assert.equal(td.cards.length,r.plan.count,id);assert.equal(new Set(td.cards.map(x=>x.name)).size,r.plan.count,id);
    for(const rule of ['conclusionRule','conflictRule','timeRule'])assert(r.prompt.includes(r.plan.protocol[rule]),id+' '+rule);
    for(const st of r.plan.protocol.structures)assert(r.prompt.includes(st.label),id+' '+st.label);
    if(mode==='rws_reversals'){r.cards.forEach(x=>assert(r.prompt.includes(x.n+'【'+(x.isUp?'正位':'逆位')+'】')));assert(!r.prompt.includes('Book T原典核心義'));assert(!r.prompt.includes('真正有序相鄰線（用於完整元素尊貴）'));}
    else{assert(r.cards.every(x=>x.isUp));assert(r.prompt.includes('Book T原典核心義'));}
    if(id==='minor_arcana')assert(r.cards.every(x=>x.suit!=='major'));
    cases++;
  }
  assert.equal(cases,27);
});
test('Mathers 54: physical heap order, stated 26/17/11 sizes and all 24 excluded cards are accounted for',()=>{
  const r=draw('mathers_horseshoe');
  // Reference from 1888 stated heap sizes, face-down stack order and documented tail policy.
  const want=[76,73,70,67,64,61,58,55,52,49,46,43,40,37,34,31,28,25,22,19,16,13,10,7,4,1,3,8,12,17,21,26,30,35,39,44,48,53,57,62,66,71,75,69,63,56,50,42,36,29,23,15,9,2];
  assert.deepEqual(plain(r.cards.map(x=>x.id)),want);
  assert.deepEqual(['A','C','E'].map(g=>r.cards.filter(x=>x.mathersGroup===g).length),[26,17,11]);
  const f=c._jyMathersDiscardedF;assert.equal(f.length,24);assert.equal(new Set(r.cards.concat(f).map(x=>x.id)).size,78);
  assert(r.prompt.includes('12/23'));assert(r.prompt.includes('11/24'));assert(r.prompt.includes('F不讀'));
  assert.equal(r.cards.filter(x=>x.mathersPair==='中心單張').length,2);
});
test('Mathers 21: King/Queen excluded, top card first, seventh next, complete symmetric pairs',()=>{
  c._jyMathersSignificatorId=35;const r=draw('mathers_21');assert.equal(c._jyLastMathersSignificator.id,35);assert(!r.cards.some(x=>x.id===35));
  assert.deepEqual(plain(r.cards.slice(0,5).map(x=>x.id)),[0,7,14,21,28]);
  for(let i=0;i<21;i++)assert.equal(r.cards[i].mathersPair,r.cards[20-i].mathersPair);
  assert(r.prompt.includes('代表牌：'));assert(r.prompt.includes('使用者預選'));delete c._jyMathersSignificatorId;
});
test('The actual mode selector controls Mathers orientations and keeps the fifteen-card procedure fixed',()=>{
  vm.runInContext('drawnCards=[];',c);const host=t.doc.body.appendChild(new t.Element('div'));host.id='tarot-reading-controls';
  c.S.tarot={spreadType:'mathers_21',spreadDef:c.__defs.mathers_21};c.setCurrentSpread('mathers_21');c.JYTarotReading.syncControls();const select=host.querySelector('select');assert(!select.disabled);
  const sig=host.querySelector('#jy-mathers-significator');assert.equal(sig.querySelectorAll('option').length,9);sig.value='49';sig.dispatch('change');assert.equal(c._jyMathersSignificatorId,49);
  select.value='gd_book_t';select.dispatch('change');let cards=c.JY_buildCanonicalTarotDraw(c.__deck,'mathers_21',c.__defs.mathers_21,'selector');assert(cards.every(x=>x.isUp&&x.readingMode==='gd_book_t'));assert(!cards.some(x=>x.id===49));
  select.value='rws_reversals';select.dispatch('change');c._secRand=()=>0.1;cards=c.JY_buildCanonicalTarotDraw(c.__deck,'mathers_21',c.__defs.mathers_21,'selector');assert(cards.every(x=>!x.isUp&&x.readingMode==='rws_reversals'));
  c.S.tarot={spreadType:'fifteen_card',spreadDef:c.__defs.fifteen_card};c.setCurrentSpread('fifteen_card');c.JYTarotReading.syncControls();assert(select.disabled);assert.equal(select.value,'gd_book_t');
  delete c._jyMathersSignificatorId;
});
test('Partial, duplicate, invalid and mixed-mode draws fail without a usable export or silent second builder call',()=>{
  const r=draw('five_card'),good=r.cards.slice();
  c.S.tarot.drawn=good.slice(0,3);assert.throws(()=>c._buildTarotOnlyPayload(),/Card count mismatch/);assert.equal(c.JY_buildExportPrompt('tarot'),'');
  c.S.tarot.drawn=[good[0],good[0],...good.slice(2)];assert.throws(()=>c._buildTarotOnlyPayload(),/Duplicate/);
  c.S.tarot.drawn=good.map(x=>Object.assign({},x));c.S.tarot.drawn[0].id=99;assert.throws(()=>c._buildTarotOnlyPayload(),/identity/);
  c.S.tarot.drawn=good.map(x=>Object.assign({},x));c.S.tarot.drawn[0].readingMode='gd_book_t';assert.throws(()=>c._buildTarotOnlyPayload(),/Mixed/);
  c.S.tarot.drawn=good;const real=c._buildTarotOnlyPayload;let calls=0;c._buildTarotOnlyPayload=()=>{calls++;throw Error('fixture');};assert.equal(c.JY_buildExportPrompt('tarot'),'');assert.equal(calls,1);c._buildTarotOnlyPayload=real;
});
test('Canonical Mathers failure cannot silently become an ordinary top-N draw',()=>{
  vm.runInContext(actualFunction('JS/ui.js','jyTarotBuildDraw'),c);
  vm.runInContext('deckShuffled=TAROT.slice(0,60);drawnCards=[];',c);
  assert.throws(()=>c.jyTarotBuildDraw(c.__defs.mathers_horseshoe,'mathers_horseshoe'),/78/);
});
test('OOTK keeps the original question, actual operation boundary, card lexicon and cast timestamp',()=>{
  c._ootkResults={questionText:'原始開鑰問題',castTimestamp:'2026-09-08T01:02:03Z',significator:{id:35,name:'權杖國王'},op1:{activeCards:c.__deck.slice(0,4),countingPath:[{cardId:0,cardName:c.__deck[0].n,countValue:3,position:0,direction:'right'}],mainLineValidation:{status:'requires_querent_confirmation'}},op2:{activeCards:c.__deck.slice(4,8),abandoned:true},op3:{activeCards:c.__deck.slice(8,12)},abandonedAt:'op2'};
  c._ootkResults.completedOperations=5;c.S.form.question='後來改寫的問題';const p=c._buildOOTKPayload();assert.equal(p.question,'原始開鑰問題');assert.deepEqual(Object.keys(p.ootkData.operations),['op1','op2']);
  assert.equal(p.ootkData.operations.op2.valid,false);assert.equal(p.ootkData.procedureStatus.completedOperations,2);
  const text=c.JY_buildExportPrompt('ootk');assert(text.includes('2026-09-08T01:02:03Z'));assert(text.includes('requires_querent_confirmation'));assert(text.includes('本次活躍牌的牌義底稿'));assert(!text.includes('【第三次操作'));
  c.S.tarot.spreadType='ootk';assert(c.JY_buildExportPrompt('tarot').includes('程序參考：Liber LXXVIII'));
  c._ootkResults={abandonedAt:'predeal_binding'};assert.equal(c._buildOOTKPayload(),null);assert.equal(c.JY_buildExportPrompt('ootk'),'');
  assert.equal(c._buildTarotOnlyPayload(),null);assert.equal(c.JY_buildExportPrompt('tarot'),'');
});

const m=runtime(['vendor/lunar','tarot','meihua_upgrade','meihua_output_layer','meihua_upgrade2']).ctx;
expose(m,'JS/meihua-standalone.js',`window.__mhAudit={build:buildMeihuaPrompt,numbers:function(method,u,l){_mhMethod=method;_mhUpNum=u;_mhLoNum=l;return _castNumbers();},chars:function(text,cb){_mhText=text;_cncharReady=true;_castChar(cb);}};`);
test('All 64 hexagrams × 6 moving lines preserve Ti/Yong, one-line change, mutual hexagram and prompt data',()=>{
  for(let up=1;up<=8;up++)for(let lo=1;lo<=8;lo++)for(let moving=1;moving<=6;moving++){
    const r=m.calcMH(up,lo,moving),bits=plain(r.lo.li.concat(r.up.li));assert.equal(r.tiG.n,moving<=3?up:lo);assert.equal(r.yoG.n,moving<=3?lo:up);
    const flipped=bits.map((v,i)=>i===moving-1?1-v:v),g1=m.gByL(...flipped.slice(3)),g2=m.gByL(...flipped.slice(0,3));assert.equal(r.bian.n,m.g64(g1.n,g2.n).n);
    const hu1=m.gByL(bits[2],bits[3],bits[4]),hu2=m.gByL(bits[1],bits[2],bits[3]);assert.equal(r.hu.n,m.g64(hu1.n,hu2.n).n);
    r.castContext={timestamp:'2026-06-15T12:00:00Z',method:'fixture'};const p=m.__mhAudit.build('專案如何推進？',r);assert(p.includes(r.ben.n));assert(p.includes(r.hu.n));assert(p.includes(r.bian.n));assert(p.includes(bits.join('、')));assert(!/undefined|NaN/.test(p));
  }
});
test('Original Guan-Mei example: upper Dui, lower Li, first line → Ge to Xian with Dui as Ti',()=>{
  const r=m.calcMH(2,3,1);assert(r.ben.n.includes('革'));assert(r.bian.n.includes('咸'));assert.equal(r.tiG.name,'兌');assert.equal(r.yoG.name,'離');
});
test('Numeric and character casting reject truncation and incomplete strokes; raw calculation provenance survives',()=>{
  for(const pair of [['2.5','3'],['12abc','3'],['','4'],['0','4'],['-1','3'],['9007199254740991','9']])assert.equal(m.__mhAudit.numbers('num',...pair),null);
  const n=m.__mhAudit.numbers('num','16','8');assert.equal(n.up,8);assert.equal(n.lo,8);assert.equal(n.context.upperNumber,16);assert.equal(n.dong,(24+n.context.shichen)%6||6);assert(Number.isFinite(Date.parse(n.context.timestamp)));
  const time=m.__mhAudit.numbers('time');assert(time.context.lunar);assert(time.context.policy.includes('閏月'));
  m.cnchar={stroke:()=>[3,0]};let result;m.__mhAudit.chars('山水',x=>result=x);assert.equal(result,null);
  m.cnchar.stroke=()=>[3,4];m.__mhAudit.chars('山水',x=>result=x);assert.deepEqual(plain(result.context.strokes),[3,4]);assert.equal(result.context.totalStrokes,7);
});
test('Season uses saved cast instant, recognizes simplified Jie names, and identifies unavailable-calendar fallback honestly',()=>{
  const year=m.Solar.fromYmdHms(2026,7,1,12,0,0).getLunar().getJieQiTable();
  for(const [jie,before,after] of [['立春','丑','寅'],['惊蛰','寅','卯'],['芒种','巳','午'],['白露','申','酉']]){
    assert(year[jie],jie);const instant=Date.parse(year[jie].toYmdHms().replace(' ','T')+'+08:00');
    assert.equal(m.mhMonthZhiFromDate(new Date(instant-1000)),before,jie+' before');assert.equal(m.mhMonthZhiFromDate(new Date(instant+1000)),after,jie+' after');
    assert.equal(m.getMhWangShuai('木',new Date(instant+1000)).precision,'engine-jieqi');
  }
  const r=m.calcMH(2,3,1);r.castContext={timestamp:'2026-06-15T00:00:00Z'};const saved=m.__mhAudit.build('測試',r);
  const NativeDate=m.Date;function OtherDate(...a){return a.length?new Date(...a):new Date('2026-12-15T00:00:00Z');}OtherDate.prototype=Date.prototype;OtherDate.now=()=>Date.parse('2026-12-15T00:00:00Z');m.Date=OtherDate;assert.equal(m.__mhAudit.build('測試',r),saved);m.Date=NativeDate;
  const solar=m.Solar;m.Solar=null;assert.equal(m.getMhWangShuai('木',new Date('2026-06-15T00:00:00Z')).precision,'approximate-jie-day-fallback');m.Solar=solar;
});

const b=runtime(['vendor/lunar','bazi-calendar-core','solar-location','bazi','bazi_upgrade','bazi-prompt-root','bazi-suite-core']).ctx;
function bazi(y,mo,d,sex,ref){const x=b.computeBazi(y,mo,d,14,0,sex,{referenceDate:ref||'2026-09-08T12:00:00Z'});b.enhanceBazi(x);return x;}
const a=bazi(1983,8,25,'male'),partner=bazi(1994,6,20,'female');
test('Six Bazi lenses and eight compatibility scenarios export actual model details, directional roles and uncertainty',()=>{
  for(const lens of Object.keys(b.BaziSuiteCore.lenses)){const p=b.BaziSuiteCore.buildSinglePrompt(lens,a,{},'工作與感情？');for(const key of ['月令格局候選','官殺辨析','病藥模型','通關模型'])assert(p.includes(key),lens+' '+key);assert(!p.includes('[object Object]'));}
  for(const s of b.BaziSuiteCore.scenarios){const comp=b.BaziSuiteCore.createCompatibility(a,partner,{scenarioId:s.id,metaA:{name:'A'},metaB:{name:'B'}}),p=b.BaziSuiteCore.buildCompatibilityPrompt(comp,'如何相處？');assert(p.includes(s.roleA));assert(p.includes(s.roleB));assert(p.includes('A看B：'));assert(p.includes('B看A：'));assert(!p.includes('前端配對分數'));}
  const unknown=b.BaziSuiteCore.createCompatibility(a,partner,{metaA:{unknown:true}}),p=b.BaziSuiteCore.buildCompatibilityPrompt(unknown,'合作？');assert.equal(unknown.directionalTenGods.bViewsA.length,3);assert.equal(unknown.luckSynchronization.years.length,0);assert(!p.includes('undefined'));
});
test('Bazi annual list starts with ongoing Li-Chun year in January, then advances at Li-Chun',()=>{
  const before=bazi(1983,8,25,'male','2026-01-15T12:00:00Z');assert.equal(before.liuNianPeriod.year,2025);const p=b.BaziSuiteCore.buildSinglePrompt('annual',before,{},'今年？');assert(p.includes('・2025 乙巳'),p.slice(-1500));
  const after=bazi(1983,8,25,'male','2026-02-10T12:00:00Z');assert.equal(after.liuNianPeriod.year,2026);assert(b.BaziSuiteCore.buildSinglePrompt('annual',after,{},'今年？').includes('・2026 丙午'));
  const old=bazi(1983,8,25,'male','2024-01-15T12:00:00Z'),sync=b.BaziSuiteCore.luckSynchronization(old,old);assert(sync.years.some(x=>x.year===2023));
});
const z=runtime(['ziwei-prompt-root','ziwei-standalone']).ctx;
test('Ziwei serialization locates Ming by palace identity, independent of array rotation',()=>{
  const names=['命宮','兄弟宮','夫妻宮','子女宮','財帛宮','疾厄宮','遷移宮','交友宮','官祿宮','田宅宮','福德宮','父母宮'];
  const branches=['丑','子','亥','戌','酉','申','未','午','巳','辰','卯','寅'];
  const ps=names.map((name,i)=>({name,branch:branches[i],gan:'乙',isMing:i===0,isShen:i===10,stars:i===0?[{name:'天府',type:'major'}]:[]}));
  for(let rotation=0;rotation<12;rotation++){
    const chart={palaces:ps.slice(rotation).concat(ps.slice(0,rotation)),yGan:'癸',yZhi:'亥',wuxingJu:4,mingGan:'乙'};
    const p=z._ziweiBuildPrompt(chart,{bdate:'1983-08-25',btime:'14:00',gender:'male',question:'工作？'});assert(p.includes('【命宮】丑宮　主星：天府'));assert(p.includes('夫妻宮(亥)：對宮 官祿宮(巳)'));assert(p.includes('四化'));
  }
});
const l=runtime([]).ctx;
expose(l,'JS/lenormand.js','window.__lnAudit={build:buildPrompt,cards:CARDS,spreads:SPREADS};');
test('Every Lenormand layout preserves all card facts; incomplete/duplicate/unknown cards cannot export',()=>{
  for(const [id,sp] of Object.entries(l.__lnAudit.spreads)){if(!sp.count)continue;const cards=l.__lnAudit.cards.slice(0,sp.count),p=l.__lnAudit.build('如何推進？',cards,id);assert(p.includes(sp.name));cards.forEach(x=>assert(p.includes(x.id+'.'+x.name)));assert.throws(()=>l.__lnAudit.build('如何推進？',cards.slice(1),id),/未完成/);}
  assert.throws(()=>l.__lnAudit.build('測試',[l.__lnAudit.cards[0],l.__lnAudit.cards[0],l.__lnAudit.cards[2]],'three'),/重複/);assert.throws(()=>l.__lnAudit.build('測試',[],'missing'),/未完成/);
});
const o=runtime([]).ctx;
expose(o,'JS/oracle.js','window.__oracleAudit={build:_buildOraclePrompt,poems:P,last:function(){return _lastOraclePrompt;}};');
test('All 60 oracle poems preserve original text, numbering and edition boundaries; invalid lot clears prior export',()=>{
  const api=o.__oracleAudit;assert.equal(api.poems.length,60);assert.equal(new Set(api.poems.map(x=>x.n)).size,60);
  for(const lot of api.poems){const p=api.build(lot,'事業如何？');assert(p.includes(lot.p));assert(p.includes('第'+lot.n+'籤（'+lot.g+'）'));assert(p.includes('本站收錄'));assert(!p.includes('籤意（廟方提要'));assert(!p.includes('undefined'));}
  assert(api.poems.find(x=>x.n===31).t.includes('南方'));assert(api.build(api.poems[30],'事業？').includes('本籤校勘記錄'));
  assert.equal(api.build({n:1,g:'甲子',p:''},'測試'),'');assert.equal(api.last(),'');
});
console.log('divination-audit: '+passed+' groups passed; offline runtime/data contracts only.');
if(process.exitCode)process.exit(process.exitCode);
