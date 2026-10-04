'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),vm=require('node:vm');
const F=require('../JS/tarot-foundation.js'),flow=require('../JS/reading-workflow.js');
const results=[],plain=x=>JSON.parse(JSON.stringify(x));
function test(name,fn){try{fn();results.push({name,status:'passed'});console.log('PASS '+name);}catch(e){results.push({name,status:'failed',error:e.stack});console.error('FAIL '+name+' '+e.stack);process.exitCode=1;}}
const original='年底前會出現非現任的肉體桃花嗎？她幾歲？';
test('reported non-current person and exact-age query agree across both semantic graphs',()=>{
 const q=F.compileQuestion(original),age=q.queryGraph.events[1];
 assert.equal(q.originalQuestion,original);assert.equal(q.readingQuestion.clauses[1].subjectRef,'非現任對象');
 assert.equal(age.roles.personBinding.surface,'非現任對象');assert.equal(age.roles.subject,q.queryGraph.events[0].roles.conditionalEntity);
 assert.equal(age.roles.attribute,'age');assert.equal(age.roles.queryOperator,'exact_attribute');assert.deepEqual(age.dependsOn,['QUERY_EVENT']);
 assert.equal(age.roles.personBinding.excluded[0].entity,'現任');assert(q.queryGraph.requiredAtoms.some(a=>a.role==='excludedParticipant'&&a.text==='現任'));
 assert.equal(q.queryGraph.compilerStatus,'validated_atomized');
});
test('negated relationship, exclusion preface and simplified variants preserve queried person',()=>{
 for(const q of ['年底前會出現不是現任的女性嗎？她幾歲？','除了現任女友，年底前會有別的女性桃花嗎？她幾歲？','年底前会出现非现任的肉体桃花吗？她几岁？','年底前會出現非現任的肉體桃花嗎？\n對方幾歲？','我會遇到新對象嗎？她幾歲？','年底前會有非現任女性嗎？該名女性幾歲？']){
  const p=F.compileQuestion(q),b=p.queryGraph.events.at(-1).roles.personBinding;
  assert(b,q);assert(!/^(現任|現任女友)$/.test(b.surface),q);assert.equal(p.queryGraph.events.at(-1).roles.attribute,'age',q);
 }
});
test('explicit current partner and subsequent topic switch bind to the latest actual participant',()=>{
 for(const q of ['現任會支持我嗎？她幾歲？','現任女友喜歡我嗎？她幾歲？','年底前會有非現任女性嗎？現任會支持我嗎？她幾歲？']){
  const p=F.compileQuestion(q),last=p.queryGraph.events.at(-1);
  assert.match(last.roles.personBinding.surface,/^現任/);assert.equal(last.roles.personBinding.status,'explicit_reference');assert.deepEqual(last.dependsOn,[]);
 }
});
test('multiple named women and plural unknown women keep ambiguity instead of assigning age to one',()=>{
 for(const q of ['女友和女同事會支持我嗎？她幾歲？','年底前會出現兩位非現任女性嗎？她幾歲？']){
  const p=F.compileQuestion(q),b=p.queryGraph.events.at(-1).roles.personBinding;
  assert.equal(b.status,'ambiguous',q);assert(b.candidates.length,q);assert.equal(p.readingQuestion.clauses.at(-1).subjectSource,'surface_pronoun_ambiguous_context');
 }
});
test('relative-age comparison retains its own operator, comparator and original question',()=>{
 const p=F.compileQuestion('年底前會有非現任女性嗎？她比我年輕嗎？'),e=p.queryGraph.events.at(-1);
 assert.equal(e.roles.attribute,'relative_age');assert.equal(e.roles.queryOperator,'relative_attribute');assert.deepEqual(e.roles.attributeComparison,{reference:'我',relation:'年輕'});assert.equal(e.roles.personBinding.surface,'非現任女性');
 assert(p.requestedDimensions.some(x=>x.id==='relative_age'));assert(!p.unsupportedDimensions.includes('exact_age'));
});
test('all fifteen methods export the same binding and preserve age precision plus same-cast repair rules',()=>{
 for(const method of flow.methods){const p=flow.plan({method,question:original}),t=flow.render({method,question:original});
  assert.equal(p.question,original);assert.equal(p.questionModel.events.at(-1).personBinding.surface,'非現任對象');assert.equal(p.questionModel.events.at(-1).attribute,'age');
  assert(t.includes('不擅改問相對年齡'));assert(t.includes('不得聲稱重新抽牌'));assert(t.includes('非現任對象不得改綁現任'));
 }
});
test('a saved old incorrect reference is detected and corrected as annotation while every actual card stays unchanged',()=>{
 const chart={cards:[{id:1,isUp:true,position:'年齡子題原牌位',binding:{eventId:'SUBJECT_2',entity:'現任',question:'她幾歲'}}]},before=JSON.stringify(chart);
 const a=flow.chartReferenceAudit({method:'tarot',question:original},chart);
 assert.equal(JSON.stringify(chart),before);assert.equal(a.status,'reference_annotation_needs_correction');assert.equal(a.issues[0].correctedSameQuestionEntity,'非現任對象');assert(a.cardSequencePreserved&&a.positionAndOrientationPreserved);
});
const env=require('./native-fixtures-20261003.cjs').environment(),c=env.ctx;env.load('tarot-foundation');
// Actual standalone Lenormand routing, not a second implementation of the parser.
let lnSource=fs.readFileSync(path.join(__dirname,'../JS/lenormand.js'),'utf8');
lnSource=lnSource.replace(/\}\)\(\);\s*$/,`window.__r11ln={analyze:analyzeReadingQuestion,spread:_lnBuildSpreadDef,detect:_lnDetectSpread};})();`);
vm.runInContext(lnSource,c);const ln=c.__r11ln;
test('standalone Lenormand branches and labels no longer name the excluded partner',()=>{
 const p=ln.analyze(original),sp=ln.spread('branches',original);assert.equal(sp.count,6);
 assert.equal(p.clauses.at(-1).subjectRef,'非現任對象');assert.equal(sp.branches.at(-1).entity,'非現任對象');
 assert(sp.positions.slice(3).every(x=>x.includes('她幾歲')));assert(!sp.positions.some(x=>/・現任・/.test(x)));
});
const close=(x,y,e=1e-7)=>assert(Math.abs(x-y)<e,`${x} != ${y}`);
test('PVR5 printed Examples7/8/9 and the conflicting introductory Bhava definition all calculate independently',()=>{
 const p=c.JYVedicCompletion.specialLagnaVariants(294+17/60,766);
 close(p.BhavaPrintedProcedure.longitude,340+17/60);close(p.Hora.longitude,317+17/60);close(p.Ghati.longitude,171+47/60);
 close(p.BhavaDefinition.longitude,125+47/60);assert.notEqual(p.BhavaDefinition.sign,p.BhavaPrintedProcedure.sign);
 assert.equal(p.BhavaDefinition.degreesPerMinute,.25);assert.equal(p.BhavaPrintedProcedure.degreesPerMinute,1);
});
test('PVR5 Exercise8 uses the preceding sunrise across midnight and seconds without resetting at midnight',()=>{
 const elapsed=(Date.parse('1961-05-28T03:11:48Z')-Date.parse('1961-05-27T06:19:18Z'))/60000;
 assert.equal(elapsed,1252.5);const p=c.JYVedicCompletion.specialLagnaVariants(42+11/60,elapsed);
 close(p.Hora.longitude,308+26/60);close(p.Ghati.longitude,167+48.5/60);
 assert.throws(()=>c.JYVedicCompletion.specialLagnaVariants(NaN,30));assert.throws(()=>c.JYVedicCompletion.specialLagnaVariants(0,-1));
});
const K=['year','month','day','hour'];
function facts(stems,branches){return {dm:stems[2],stems:K.map((pillar,i)=>({pillar,stem:stems[i],label:pillar,constraints:[]})),hidden:K.flatMap((pillar,i)=>Array.from({子:'癸',丑:'己癸辛',寅:'甲丙戊',卯:'乙',辰:'戊乙癸',巳:'丙戊庚',午:'丁己',未:'己丁乙',申:'庚壬戊',酉:'辛',戌:'戊辛丁',亥:'壬甲'}[branches[i]]).map(stem=>({pillar,branch:branches[i],stem,label:pillar})))};}
test('Qiongtong Gui-Wu explicit two Ren and one Geng exposed counts are computed, not mere presence',()=>{
 const yes=c.JYBaziQiongtong.evaluate(facts(['壬','壬','癸','庚'],['子','午','卯','申'])),no=c.JYBaziQiongtong.evaluate(facts(['壬','甲','癸','庚'],['子','午','卯','申']));
 const a=yes.checks.find(x=>x.clause.includes('二壬一庚同透')),b=no.checks.find(x=>x.clause.includes('二壬一庚同透'));
 assert(a&&b);assert(a.conditions.find(x=>x.id==='visible-count-壬-2').satisfied);assert(!b.conditions.find(x=>x.id==='visible-count-壬-2').satisfied);assert(a.conditions.find(x=>x.id==='visible-count-庚-1').satisfied);
});
test('Qiongtong Gui-You separated Bing/Xin exposure differs from adjacent exposure with the same stems',()=>{
 const yes=c.JYBaziQiongtong.evaluate(facts(['丙','乙','癸','辛'],['辰','酉','亥','丑'])),no=c.JYBaziQiongtong.evaluate(facts(['丙','辛','癸','乙'],['辰','酉','亥','丑']));
 const pick=r=>r.checks.find(x=>x.clause.includes('丙與辛隔位同透')).conditions.find(x=>x.id==='separated-visible-丙辛');
 assert(pick(yes).satisfied);assert(!pick(no).satisfied);assert.equal(pick(yes).evidence.pairs[0].distance,3);
 assert(yes.policy.countsAndPositions.includes('不宣稱已解除合'));
});
test('Qiongtong Ren-Zi Ding in the hour stem is not satisfied by Ding in the year stem',()=>{
 const yes=c.JYBaziQiongtong.evaluate(facts(['庚','甲','壬','丁'],['戌','子','寅','未'])),no=c.JYBaziQiongtong.evaluate(facts(['丁','甲','壬','庚'],['戌','子','寅','未']));
 const pick=r=>r.checks.find(x=>x.clause.includes('丁出時干')).conditions.find(x=>x.id==='specified-visible-hour-丁');
 assert(pick(yes).satisfied);assert(!pick(no).satisfied);
});
const x=require('./native-fixtures-20261003.cjs').examples(c);env.load('prompt-brief');env.load('prompt-packet');
test('native repeated policies use shorter references and restore exactly, including escaped pointer keys',()=>{
 const policy='同一段完整政策文字重複出現時保留首次值與可還原參照，資料不得截斷或改寫。';
 const raw={first:policy,second:policy,'key/with~escape':{policy},again:{policy},['a'.repeat(180)]:{short:policy},last:policy};
 const packed=plain(c.JYNativeAnalysis.compact(raw));
 function restore(v){if(v==null||typeof v!=='object')return v;if(v.$ref){let target=packed;for(const k of v.$ref.slice(2).split('/'))target=target[k.replace(/~1/g,'/').replace(/~0/g,'~')];return restore(target);}return Array.isArray(v)?v.map(restore):Object.fromEntries(Object.entries(v).map(([k,z])=>[k,restore(z)]));}
 assert.deepEqual(restore(packed),raw);assert(JSON.stringify(packed).length<JSON.stringify(raw).length);
 const longPath={['b'.repeat(180)]:policy,repeated:policy},encoded=c.JYNativeAnalysis.compact(longPath);assert.equal(encoded.repeated,policy);
});
test('independent decoder exactly restores all twenty special-point matrices without omitted cells or fields',()=>{
 const raw=x.v.advanced.specialPoints.specialPointVargas,packed=plain(c.JYPromptBrief.encodeSpecialPointVargas(raw));
 function decode(map){if(!map.$vargaPoints)return map;const {divisions,points,signNames,rows}=map.$vargaPoints;return Object.fromEntries(divisions.map((d,i)=>[d,Object.fromEntries(points.map((k,j)=>{const [sign,part,house]=rows[i][j];return [k,{division:Number(d),sign,signName:signNames[sign],part,house}];}))]));}
 const restored={...packed,specialLagnas:decode(packed.specialLagnas),lagnaVariants:decode(packed.lagnaVariants),upagrahas:decode(packed.upagrahas),upagrahaVariants:Object.fromEntries(Object.entries(packed.upagrahaVariants).map(([k,m])=>[k,decode(m)]))};
 assert.deepEqual(restored,plain(raw));assert(JSON.stringify(packed).length<JSON.stringify(raw).length/2);
 const unexpected=plain(raw);unexpected.specialLagnas[1].BhavaLagna.extra='must survive';const encoded=c.JYPromptBrief.encodeSpecialPointVargas(unexpected);assert.equal(encoded.specialLagnas[1].BhavaLagna.extra,'must survive');
});
test('actual astronomical timed upagraha profiles and all twenty special-point vargas are present',()=>{
 const p=x.v.advanced.specialPoints;assert.equal(p.status,'calculated');assert.equal(Object.keys(p.specialPointVargas.specialLagnas).length,20);
 for(const v of Object.values(p.upagrahaVariants))for(const [k,q]of Object.entries(v.points)){
  const interval=p.dayNightParts[q.part-1],beginning=v===p.upagrahaVariants.PVR_PART_BEGINNING_FOOTNOTE||k==='Maandi';
  close(Date.parse(q.utc),Date.parse(interval.start)+(Date.parse(interval.endExclusive)-Date.parse(interval.start))*(beginning?0:.5),2);
  close(q.longitude,c.JYVedic.astronomy(new Date(q.utc),x.input.latitude,x.input.longitude,x.v.input.ayanamsa).ascendant,1e-5);
 }
 for(const d of Object.keys(x.v.vargas))for(const [k,pnt]of Object.entries(p.specialLagnas)){
  const row=p.specialPointVargas.specialLagnas[d][k],z=c.JYVedic.varga(pnt.longitude,+d);assert.equal(row.sign,z.sign);assert.equal(row.house,((z.sign-x.v.vargas[d].lagna.sign+12)%12)+1);
 }
});
test('special-point corruption is rejected and unknown birth time cannot manufacture timed variants',()=>{
 const bad=plain(x.v);bad.advanced.specialPoints.specialLagnaVariants.BhavaPrintedProcedure.longitude+=1;
 assert.throws(()=>c.JYNativeAnalysis.analyze('vedic',bad),/查核|計算|無效/);
 const unknown=plain(x.v);unknown.input.unknownTime=true;const p=c.JYVedicCompletion.specialPoints(unknown);
 assert.equal(p.status,'partial');assert.equal(p.specialLagnaVariants,undefined);assert.equal(p.upagrahaVariants,undefined);
});
test('fifteen complete-text prompts retain actual chart records, bindings, all chunks and shop footer',()=>{
 for(const [method,z]of Object.entries(x.charts)){
  const before=JSON.stringify(z),t=c.JYPromptPacket.build(method,z,original),p=c.JYPromptPacket.get(t);
  assert.equal(JSON.stringify(z),before);assert.equal(p.contentChunks.join(''),p.body);assert(p.body.includes('非現任對象'));assert(p.body.includes('不得聲稱重新抽牌'));
  assert(p.parts.every(s=>Array.from(s).length<=8000&&Buffer.byteLength(s)<=20000));assert(p.body.endsWith(flow.footer));
 }
 const t=c.JYPromptPacket.build('vedic',x.v,'完整分析特殊上升與副星');assert(t.includes('BhavaPrintedProcedure')&&t.includes('PVR_PART_BEGINNING_FOOTNOTE'));
});
const report={testedAt:new Date().toISOString(),release:'r11',passed:results.filter(x=>x.status==='passed').length,failed:results.filter(x=>x.status==='failed').length,results,scope:'Reported question, actual standalone parser/layout, fifteen actual chart text exports, independent printed PVR arithmetic and sourced Qiongtong structural predicates. Not historical prediction efficacy or universal language comprehension.'};
fs.writeFileSync(path.join(__dirname,'../docs/engine-and-reference-validation-20261004-r11.json'),JSON.stringify(report,null,2));console.log('R11 '+report.passed+'/'+results.length+' groups passed');
