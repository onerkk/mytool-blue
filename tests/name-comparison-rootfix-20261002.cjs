'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const base=path.resolve(__dirname,'..'),noop=()=>{},element=()=>({style:{},classList:{add:noop,remove:noop,contains:()=>false},appendChild:noop,setAttribute:noop,querySelector:()=>null,querySelectorAll:()=>[]});
const ctx={console:{log:noop,warn:noop,error:console.error},Date,Math,Intl,setTimeout:noop,clearTimeout:noop,setInterval:noop,clearInterval:noop,document:{body:element(),head:element(),createElement:element,getElementById:()=>null,querySelector:()=>null,querySelectorAll:()=>[],addEventListener:noop},navigator:{},localStorage:{getItem:()=>{throw Error('No account memory access');},setItem:noop},location:{hostname:'localhost'},alert:noop};ctx.window=ctx;vm.createContext(ctx);
for(const file of ['vendor/lunar','bazi-calendar-core','bazi','liuyao-core','yijing-data','reading-quality','reading-workflow','tarot-foundation','name-data','name-engine','name-prompt'])vm.runInContext(fs.readFileSync(path.join(base,'JS',file+'.js'),'utf8'),ctx,{filename:file});
const E=ctx.JYNameEngine,P=ctx.JYNamePrompt,plain=x=>JSON.parse(JSON.stringify(x));let passed=0;
function test(name,run){try{run();passed++;console.log('PASS '+name);}catch(e){console.error('FAIL '+name+'\n'+e.stack);process.exitCode=1;}}
const question='那個比現在名字好 現名陳政軒',input={surname:'陳',candidates:['弘林','鴻淋','沐洪','水扁'],purpose:'rename',question},chart=ctx.computeBazi(1983,8,25,14,55,'male',{timezoneOffset:8,trueSolarTime:false,dayBoundaryMode:'MIDNIGHT_00'});
const full=()=>E.compare(Object.assign({},input,{birthDate:'1983-08-25',birthTime:'14:55',timezoneOffset:8}),{bazi:chart});
function promptFacts(prompt){const marker='【本次姓名與各派原生計算事實】';const part=prompt.slice(prompt.indexOf(marker)+marker.length);return JSON.parse(part.slice(part.indexOf('\n\n{')+2,part.indexOf('\n\n【成稿要求】')));}
test('Reported question computes original and all four candidates, preserving raw wording and input',()=>{
 const before=JSON.stringify(input),r=E.compare(input);assert.equal(JSON.stringify(input),before);assert.deepEqual(plain(r.names.map(n=>n.name)),['陳政軒','陳弘林','陳鴻淋','陳沐洪','陳水扁']);assert.equal(r.baseline.name,'陳政軒');assert.equal(r.baseline.source,'question_explicit_label');assert.equal(r.comparison.pairs.length,4);assert.equal(r.comparison.status,'ready');
 assert.deepEqual(plain(r.names[0].fiveGrids.grids.map(g=>g.num)),[17,24,18,11,34]);assert.deepEqual(plain(r.names[0].strokeSensitivity.alternateFiveGrids.grids.map(g=>g.num)),[11,19,19,11,29]);assert.equal(r.names[0].characters[1].kangxi,8);assert.equal(r.names[0].characters[1].modern,9);assert.equal(r.question,question);assert.equal(r.questionModel.sourceQuestion,question);assert.equal(r.questionModel.events[0].comparison.right,'陳政軒');assert.equal(r.questionModel.queryIntent.operatorFocus,'compare_names');assert.equal(r.questionModel.queryIntent.explicitTime.length,0);assert(r.questionModel.unresolved.assumptions[0].status==='explicitly_marked');
});
test('Original/candidate with identical numbers retains distinct sound, shape and meanings',()=>{
 const r=E.compare(input),pair=r.comparison.pairs.find(p=>p.candidate==='陳沐洪');assert(pair.fiveGrids.changes.every(g=>g.unchanged));assert.equal(pair.changedCharacters.length,2);assert.equal(pair.phonetic.writingDifference,-3);assert.notDeepEqual(plain(pair.phonetic.baseline.characters),plain(pair.phonetic.candidate.characters));assert(r.names[0].characters[1].meaningUrl.includes('moe.edu.tw'));
 const p=P.build(r);assert(p.includes('候選中較好'));assert(p.includes('是否值得改名'));assert(p.includes('相同'));assert(!p.includes('那個比名字好'));assert(!p.includes('validated_atomized'));
});
test('Single-name mode also turns an explicit original into a complete comparison',()=>{
 const r=E.evaluate({surname:'陳',given:'弘林',baselineName:'陳政軒',question:'改名是否值得？'});assert.equal(r.schema,'jy.name-comparison/1');assert.equal(r.names.length,2);assert.equal(r.baseline.name,'陳政軒');assert.equal(r.comparison.pairs[0].candidate,'陳弘林');
 const fromQuestion=E.evaluate({surname:'陳',given:'弘林',question:'是否比現在名字好？原名：「陳政軒」'});assert.equal(fromQuestion.baseline.name,'陳政軒');
 const single=E.evaluate({surname:'陳',given:'弘林',question:'請分析此姓名的音形字義'});assert.equal(single.schema,'jy.name/1');
});
test('Baseline never consumes the five-candidate limit and is deduplicated if also a candidate',()=>{
 const r=E.compare({surname:'王',candidates:['小明','安','源','弘林','文華'],baselineName:'王明'});assert.equal(r.names.length,6);assert.equal(r.comparison.pairs.length,5);
 const same=E.compare({surname:'陳',candidates:['政軒','弘林'],baselineName:'陳政軒'});assert.equal(same.names.length,2);assert.equal(same.names[0].comparisonRole,'baseline_and_candidate');assert.equal(same.comparison.pairs[0].sameName,true);assert(same.comparison.pairs[0].fiveGrids.changes.every(g=>g.unchanged));
});
test('Baseline resolution refuses contradictions, ambiguity and surname guessing',()=>{
 assert.throws(()=>E.compare(Object.assign({},input,{baselineName:'陳弘林'})),/不一致/);
 const amb=E.compare({surname:'陳',candidates:['弘林'],question:'原名陳政軒，現名陳沐洪，哪個好？'});assert.equal(amb.comparison.status,'ambiguous_baseline');assert.equal(amb.baseline,null);
 assert.equal(E.compare({surname:'陳',candidates:['弘林'],question:'原名陳政軒，現名陳沐洪，哪個好？',baselineName:'陳政軒'}).baseline.name,'陳政軒');
 assert.throws(()=>E.compare({surname:'陳',candidates:['弘林'],baselineName:'王小明'}),/明列基準姓/);
 const structured=E.compare({surname:'陳',candidates:['弘林'],baseline:{surname:'歐陽',given:'修'}});assert.equal(structured.baseline.name,'歐陽修');assert.deepEqual(plain(structured.names[0].fiveGrids.grids.map(g=>g.num)),[32,27,11,16,42]);
 const compound=E.compare({surname:'歐陽',candidates:['明'],question:'與原名歐陽修比較'});assert.equal(compound.baseline.name,'歐陽修');assert(compound.baseline.boundary);
 assert.equal(E.compare({surname:'歐陽',candidates:['明'],question:'與原名歐陽修，比較讀音'}).baseline.name,'歐陽修');
 assert.equal(E.compare({surname:'陳',candidates:['弘林'],question:'哪個比現名陳政軒好嗎'}).baseline.name,'陳政軒');
 assert.equal(E.compare({surname:'陳',candidates:['弘林'],question:'比現名「陳安好」好嗎'}).baseline.name,'陳安好');
});
test('A genuinely missing baseline or stroke leaves only the affected layer open',()=>{
 const r=E.compare({surname:'陳',candidates:['弘林','沐洪'],question:'哪個比現在名字好'});assert.equal(r.comparison.status,'missing_baseline');assert.equal(r.names.length,2);assert.equal(r.baseline,null);assert(P.build(r).includes('不聲稱')||P.build(r).includes('不能聲稱'));
 const ch=Object.keys(ctx.JYNameData.characters).find(c=>ctx.JYNameData.characters[c][0]==null&&/\p{Script=Han}/u.test(c));const partial=E.compare({surname:'陳',candidates:['弘林'],baselineName:'陳'+ch});assert.equal(partial.comparison.status,'partial');assert.equal(partial.comparison.pairs[0].fiveGrids.status,'incomplete');assert.equal(partial.names[0].zodiac.status,'missing');assert(partial.names[0].phonetic.resolution);
});
test('Manual baseline review affects the primary result while alternate sources stay intact',()=>{
 const r=E.compare(Object.assign({},input,{overrides:{政:{stroke:9,reading:'zhèng'}}})),n=r.names[0];assert.deepEqual(plain(n.fiveGrids.grids.map(g=>g.num)),[17,25,19,11,35]);assert.equal(n.characters[1].kangxi,8);assert.equal(n.characters[1].modern,9);assert.equal(n.strokeSensitivity.manualReviews[0].dictionarySelected,8);assert.equal(n.strokeSensitivity.alternateCharacters[1].stroke,9);assert(n.strokeSensitivity.alternateNameGua.status==='complete');assert(n.phonetic.characters[1].confirmed);
 const m=E.analyze({surname:'王',given:'安',overrides:{安:{stroke:7}}});assert.equal(m.strokeSensitivity.differences.length,0);assert(m.strokeSensitivity.selectedVersusAlternate.some(d=>d.char==='安'&&d.changed));assert.equal(m.strokeSensitivity.manualReviews.length,1);
});
test('Natal chart is shared accurately, seasonal candidates remain conditional, stale birth charts fail',()=>{
 const r=full();assert(r.names.every(n=>n.bazi.status==='complete'));assert(r.names.every(n=>JSON.stringify(n.bazi.pillars)===JSON.stringify(r.names[0].bazi.pillars)));assert.deepEqual(plain(Object.values(r.names[0].bazi.pillars).map(p=>p.gan+p.zhi)),['癸亥','庚申','乙酉','癸未']);
 const water=r.names.find(n=>n.name==='陳沐洪').bazi.characterAlignment.find(c=>c.char==='沐');assert(water.seasonalConditionMatches.some(s=>s.stem==='癸'&&s.status==='已透'));assert.equal(water.fuyiMatches.length,0);
 assert.throws(()=>E.compare(Object.assign({},input,{birthDate:'1983-08-26',birthTime:'14:55'}),{bazi:chart}),/出生瞬間/);
 assert.equal(E.analyze({surname:'陳',given:'弘林',birthDate:'1983-08-25',birthTime:'14:55'},{bazi:{}}).bazi.status,'incomplete');
});
test('Prompt includes complete baseline, per-candidate duties, both hexagram policies and one ending',()=>{
 const r=full(),before=JSON.stringify(r),p=P.build(r),facts=promptFacts(p);assert.equal(JSON.stringify(r),before);assert.equal(facts.names.length,5);assert.equal(facts.baseline.name,'陳政軒');assert(facts.sharedBazi.strengthAssessment);assert.equal(facts.names[0].bazi.sharedReference,'#/sharedBazi');assert.deepEqual(facts.names[0].bazi.characterAlignment,plain(r.names[0].bazi.characterAlignment));
 for(const n of facts.names){assert(n.strokeSensitivity.alternateNameGua.original);for(const c of n.phonetic.characters)assert(c.lexicalReference.startsWith('#/names/'));}
 for(const n of r.candidateNames)assert(p.includes('必答對照：'+n+' ↔ 陳政軒'));
 for(const marker of ['已提供並實算比較基準','不能直接扣分','補回','不能單憑一句否決','favored 為空','沒有明列者均為未知'])assert(p.includes(marker),marker);
 assert.equal((p.match(/願你諸事順遂。/g)||[]).length,1);assert(p.endsWith('願你諸事順遂。'));assert(!p.includes('undefined'));assert(!p.includes('NaN'));
});
test('Older incomplete comparison exports are rehydrated before prompt construction, without mutation',()=>{
 const legacy=plain(E.compare(input));delete legacy.baseline;delete legacy.baselineResolution;delete legacy.questionModel;delete legacy.comparison;delete legacy.candidateNames;legacy.version='20261001-name1';legacy.names=legacy.names.filter(n=>n.name!=='陳政軒');const before=JSON.stringify(legacy),p=P.build(legacy);assert.equal(JSON.stringify(legacy),before);assert.equal(promptFacts(p).baseline.name,'陳政軒');assert.equal(promptFacts(p).names.length,5);
 const single=E.analyze({surname:'陳',given:'弘林',question});assert.equal(promptFacts(P.build(single)).baseline.name,'陳政軒');
 const damaged=plain(E.compare(input));damaged.names=damaged.names.filter(n=>n.name!=='陳政軒');assert.throws(()=>P.build(damaged),/完整計算遺失/);
});
test('Permutation leaves the same facts and every baseline comparison intact, without a built-in winner',()=>{
 const a=E.compare(input),b=E.compare(Object.assign({},input,{candidates:input.candidates.slice().reverse()}));const canonical=r=>r.comparison.pairs.map(p=>({name:p.candidate,changes:plain(p.fiveGrids.changes),writing:p.phonetic.writingDifference})).sort((x,y)=>x.name.localeCompare(y.name));assert.deepEqual(canonical(a),canonical(b));assert(!Object.hasOwn(a,'winner'));assert(!Object.hasOwn(a,'score'));assert.equal(b.baseline.name,'陳政軒');
});
console.log('Name comparison root fix: '+passed+' groups.');
