'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),acorn=require('acorn');
const {environment}=require('./dom-fixture.cjs');
const F=require('../JS/tarot-foundation');
const read=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8'),plain=x=>JSON.parse(JSON.stringify(x));
let passed=0;function test(name,fn){try{fn();passed++;console.log('PASS '+name);}catch(e){console.error('FAIL '+name+'\n'+e.stack);process.exitCode=1;}}
const e=environment(),c=e.ctx;c.console={log(){},warn(){},error(){}};
for(const f of ['reading-quality','picker-core','tarot-foundation','golden-dawn-tarot','tarot','tarot-reading','tarot_upgrade','lenormand'])vm.runInContext(read('JS/'+f+'.js'),c,{filename:f});
vm.runInContext('window.__defs=SPREAD_DEFS;window.__deck=TAROT;',c); // Lenormand IIFE is exposed separately below.
const le=environment(),lc=le.ctx;lc.console=c.console;
vm.runInContext(read('JS/reading-quality.js'),lc);
vm.runInContext(read('JS/lenormand.js').replace(/\}\)\(\);\s*$/,'window.__ln={build:buildPrompt,cards:CARDS,drawn:function(){return _lnDrawn;},plan:function(){return _lnReadingPlan;}};})();'),lc);
const LN=lc.JYLenormand;
function actual(file,name){const src=read(file);let result;function walk(n){if(!n||typeof n!=='object')return;if(n.type==='FunctionDeclaration'&&n.id?.name===name)result=src.slice(n.start,n.end);Object.values(n).forEach(v=>Array.isArray(v)?v.forEach(walk):v&&typeof v==='object'&&walk(v));}walk(acorn.parse(src,{ecmaVersion:'latest'}));assert(result,name);return result;}
c._jyTarotQuestionText=()=>c.S.form.question;
vm.runInContext(actual('JS/ai-analysis.js','_buildTarotOnlyPayload'),c);
vm.runInContext(read('JS/prompt-export.js'),c);
function drawTarot(q,forced){c.S.tarot={};c.S.form={question:q};c._forcedSpread=forced||null;vm.runInContext('drawnCards=[];',c);const id=c.JY_resolveTarotSpread(q,'general'),def=c.getCurrentSpreadDef(),cards=c.JY_buildCanonicalTarotDraw(c.__deck,id,def,'fixed','general',q);c.S.tarot.drawn=cards;vm.runInContext('drawnCards=S.tarot.drawn;',c);return {id,def,cards,plan:c.S.tarot.methodPlan,payload:c._buildTarotOnlyPayload(),prompt:c.JY_buildExportPrompt('tarot'),html:c.buildSlotLayout(id,def)};}
test('One canonical question plan in both readers; all method definitions validate',()=>{
 assert.deepEqual(F.validateMethodRegistry(),{ok:true,errors:[]});
 const q='同事與女友閨蜜各自有交往機會嗎？';assert.deepEqual(plain(F.analyzeReadingQuestion(q)),plain(LN.analyze(q).questionPlan));
});
test('Same topic different people, outcomes and newlines receive independent branches',()=>{
 for(const q of ['同事與女友閨蜜各自有交往機會嗎？','我和女友會結婚嗎？她同意3P嗎？','同事甲有好感嗎\n同事乙會主動嗎','小美跟小雅分別對我有好感嗎？']){
  const r=F.routeQuestion(q);assert.equal(r.spreadId,'multi_question',q);assert.equal(r.methodPlan.branches.length,2,q);assert.equal(LN.recommend(q).id,'branches',q);
  const a=new Set(r.methodPlan.slots.map(s=>s.binding.eventId));assert.equal(a.size,2,q);
 }
 for(const q of ['她喜歡我嗎？為什麼？我該怎麼做？','工作能順利嗎？何時？有什麼阻礙？'])assert.equal(F.analyzeReadingQuestion(q).mode,'single',q);
});
test('Three to six real options retain their labels and all card branches',()=>{
 for(const count of [3,4,6]){const opts=['留職','跳槽','創業','留學','兼職','退休'].slice(0,count);const q=opts.map((x,i)=>String.fromCharCode(65+i)+'：'+x).join('；')+'？';
  const qp=F.analyzeReadingQuestion(q);assert.deepEqual(qp.options,opts,q);const r=F.routeQuestion(q);assert.equal(r.spreadId,'multi_option');assert.equal(r.methodPlan.branches.length,count);assert.equal(LN.instantiate('branches',q).count,count*3);
 }
 const q='我該留職還是跳槽還是創業？';assert.deepEqual(F.analyzeReadingQuestion(q).options,['留職','跳槽','創業']);
 assert.equal(F.analyzeReadingQuestion('請幫我三選一').ready,false);
 const overflow='同事甲好嗎？同事乙好嗎？前任好嗎？女友好嗎？主管好嗎？客戶好嗎？朋友好嗎？';assert.equal(F.routeQuestion(overflow).ready,false);
});
test('No alternate-person inference from continuation or hypotheses',()=>{
 for(const q of ['她還是喜歡我嗎？','她是喜歡我還是只當朋友？','明年是機會還是挑戰？']){assert.equal(F.analyzeReadingQuestion(q).options.length,0);assert.notEqual(F.routeQuestion(q).spreadId,'multi_option');}
});
test('Separate deadlines bind locally; months differ from zodiac houses and durations',()=>{
 const choice=F.analyzeReadingQuestion('A：先接案兩週；B：留在原公司三個月？');assert.deepEqual(choice.branches.map(b=>b.scope),['兩週','三個月']);
 const p=F.routeQuestion('今年能升職嗎？明年能結婚嗎？').methodPlan;
 assert(p.slots.filter(s=>s.binding.eventId==='SUBJECT_1').every(s=>s.binding.scope==='今年'));
 assert(p.slots.filter(s=>s.binding.eventId==='SUBJECT_2').every(s=>s.binding.scope==='明年'));
 const r=F.routeQuestion('2027年每個月的運勢如何？',{referenceDate:'2026-09-22'});assert.equal(r.spreadId,'monthly');assert.equal(r.methodPlan.slots[0].label,'2027年1月的主題');assert.equal(r.methodPlan.slots[11].label,'2027年12月的主題');
 assert.notEqual(F.routeQuestion('未來12個月內能結婚嗎？').spreadId,'monthly');assert.notEqual(F.routeQuestion('每月收入能超過六萬嗎？').spreadId,'monthly');
 const houses=F.instantiateMethod('zodiac',F.compileQuestion('明年的運勢'));assert(houses.slots.every(s=>!s.label||!s.label.includes('月份')));
});
test('Eligibility precedes preference; manual selection preserves honest missing coverage',()=>{
 const q='同事與女友閨蜜各自有交往機會嗎？';const r=F.routeQuestion(q);assert.equal(r.coverage.complete,true);
 assert(F.instantiateMethod('three_card',r.compiledQuestion).missingObservables.includes('independent_subjects'));
 assert.equal(F.routeQuestion('請用單牌提醒，我該怎麼辦？').spreadId,'single_card');
 assert(!/^mathers|fifteen/.test(F.routeQuestion('請完整分析工作和感情所有阻礙與建議').spreadId));
});
test('New Tarot catalog draws unique cards with identical slot counts in layout, payload and prompt',()=>{
 for(const id of Object.keys(F.METHODS).filter(id=>F.METHODS[id].picker)){
  const q=id==='multi_option'?'A：留職；B：跳槽；C：創業？':id==='multi_question'?'同事和女友閨蜜各自有好感嗎？':'2027年每個月的提醒';
  const r=drawTarot(q,id);assert.equal(r.cards.length,r.plan.count,id);assert.equal(new Set(r.cards.map(c=>c.id)).size,r.plan.count);assert.equal((r.html.match(/id="t-slot-/g)||[]).length,r.plan.count,id);assert.equal(r.payload.tarotData.cards.length,r.plan.count);
  r.plan.slots.forEach(s=>assert(r.prompt.includes(s.label),id+' '+s.label));assert(!/\[object Object\]|undefined/.test(r.prompt),id);
 }
 const celtic=drawTarot('目前工作狀況如何？','celtic_cross');assert.equal((celtic.html.match(/id="t-slot-/g)||[]).length,10);
 const r=drawTarot('A：先找主管；B：先寫報告？請分別分析代價與下一步。');assert.equal(r.id,'either_or');assert.equal(r.cards.length,7);assert.equal((r.html.match(/id="t-slot-/g)||[]).length,7);
});
test('Tarot auto mode follows explicit method; ordinary themes keep RWS and drawn mode is immutable',()=>{
 const r=drawTarot('請用Book T解讀我的工作？','action_three');assert(r.cards.every(x=>x.readingMode==='gd_book_t'&&x.isUp));
 assert.equal(F.recommendSystem('不要用 Book T，看工作').readingMode,'rws_reversals');
 c.S.form.question='今日提醒';assert.equal(c.JYTarotReading.mode(r.id,r.cards),'gd_book_t');
 const ordinary=drawTarot('我的工作會順利嗎？','action_three');assert(ordinary.cards.every(x=>x.readingMode==='rws_reversals'));
});
test('All Lenormand layouts export the declared count and preserve drawn facts',()=>{
 for(const id of Object.keys(LN.spreads)){
  const q='同事和女友閨蜜各自有好感嗎？',def=LN.instantiate(id,q),cards=lc.__ln.cards.slice(0,def.count),before=JSON.stringify(cards),prompt=lc.__ln.build(q,cards,id,null,null,def);
  assert(prompt.includes(def.name));cards.forEach(x=>assert(prompt.includes(x.id+'.'+x.name)));assert.equal(JSON.stringify(cards),before);assert(!/\[object Object\]|undefined/.test(prompt));
 }
 assert.equal(LN.recommend('請用七張線，工作會順利嗎？').id,'seven');assert.equal(LN.recommend('請用4×9大牌陣看工作').id,'grand_nines');
});
test('4×9 geometry contains 36 real houses, complete straight paths and only valid knight moves',()=>{
 const g=LN.grandNineGeometry(lc.__ln.cards);assert.equal(g.cells.length,36);assert.deepEqual(plain(g.corners),[0,8,27,35]);
 for(const cell of g.cells){assert.equal(cell.house,cell.index+1);for(const n of cell.knights){const t=g.cells[n],d=[Math.abs(t.row-cell.row),Math.abs(t.col-cell.col)].sort();assert.deepEqual(d,[1,2]);}for(const n of cell.neighbors){assert(Math.abs(g.cells[n].row-cell.row)<=1);assert(Math.abs(g.cells[n].col-cell.col)<=1);assert.notEqual(n,cell.index);}}
 assert(g.lines.some(l=>JSON.stringify(l)==='[27,28,29,30,31,32,33,34,35]'));assert(g.cells[35].neighbors.length>0);assert(g.cells[35].knights.length>0);
 assert.equal(new Set(g.lines.map(x=>x.join(','))).size,g.lines.length);
});
test('System suggestions distinguish requested tradition, reflective questions and concrete events',()=>{
 for(const [q,want]of [['求籤看今年工作','oracle'],['包裹何時有消息','lenormand'],['我的出生八字命格如何','bazi'],['紫微看我的事業','ziwei'],['起卦看案子','meihua'],['她對我的感受如何','tarot'],['請用雷諾曼看感情','lenormand'],['之前用雷諾曼，這次請用塔羅看感情','tarot']])assert.equal(F.recommendSystem(q).system,want,q);
});
test('Real Lenormand input, manual layout and draw controllers keep preview and saved plan aligned',()=>{
 lc.scrollTo=()=>{};lc._lenormandOpen();const input=lc.document.getElementById('ln-q');assert(input);
 input.value='同事和女友閨蜜各自有好感嗎？';input.dispatch('input');
 assert(lc.document.getElementById('ln-spread-preview').textContent.includes('6張'));
 lc._lnDoDraw();assert.equal(lc.__ln.drawn().length,6);assert.equal(lc.__ln.plan().branches.length,2);
 const saved=JSON.stringify(lc.__ln.drawn());lc._lnSetGender('male');assert.equal(JSON.stringify(lc.__ln.drawn()),saved);
 lc._lnReset();lc.document.getElementById('ln-q').value='工作狀況如何？';lc._lnSetSpread('grand_nines');lc.document.getElementById('ln-q').value='工作狀況如何？';lc._lnDoDraw();assert.equal(lc.__ln.drawn().length,36);
 assert(lc.document.body.querySelector('[aria-label="四排九張大牌陣"]'));assert.equal(lc.document.body.querySelectorAll('.ln-card').length,36);
});
test('Recommendation preview and switching preserve typed text without changing a completed Tarot draw',()=>{
 const doc=c.document,input=doc.createElement('textarea');input.id='f-question';doc.body.appendChild(input);
 c.Event=class {constructor(type,options){this.type=type;Object.assign(this,options);}};
 const proto=Object.getPrototypeOf(input);proto.dispatchEvent=function(e){this.dispatch(e.type,e);};proto.contains=function(n){return this===n||this.children.some(x=>x.contains(n));};
 vm.runInContext(read('JS/reading-recommender.js'),c);
 let called=null;c._atelierChoose=system=>{called=system;const target=doc.createElement('textarea');target.id='ln-q';doc.body.appendChild(target);};
 input.value='包裹何時有消息？';const before=JSON.stringify(c.S.tarot.drawn);c.JYReadingRecommender.render(input);
 const host=doc.getElementById('jy-recommend-f-question');assert(host);host.querySelector('button').click();assert.equal(called,'lenormand');assert.equal(doc.getElementById('ln-q').value,input.value);assert.equal(JSON.stringify(c.S.tarot.drawn),before);
});
console.log('question-routing: '+passed+' groups passed.');
