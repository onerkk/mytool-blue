'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),acorn=require('acorn');
const {environment}=require('./dom-fixture.cjs');
const base=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(base,f),'utf8'),plain=x=>JSON.parse(JSON.stringify(x));
const {ctx:c}=environment();c.console={log(){},warn(){},error(){}};
const load=f=>vm.runInContext(read(f),c,{filename:f});
['JS/vendor/lunar.js','JS/bazi-calendar-core.js','JS/solar-location.js','JS/bazi.js','JS/bazi_upgrade.js','JS/ziwei.js','JS/ziwei-standalone.js','JS/bazi-prompt-root.js','JS/bazi-standalone.js','JS/bazi-suite-core.js'].forEach(load);
const chartConstants=read('JS/ai-analysis.js');
for(const n of acorn.parse(chartConstants,{ecmaVersion:'latest'}).body){
  if(n.type==='VariableDeclaration'&&n.declarations.some(d=>['SIHUA_TABLE','ZW_PALACES','ZW_MAJOR','ZW_BRIGHTNESS'].includes(d.id.name))||n.type==='FunctionDeclaration'&&n.id.name==='getStarBright')vm.runInContext(chartConstants.slice(n.start,n.end),c);
}
function sourceFunction(file,name,ctx=c){const src=read(file),ast=acorn.parse(src,{ecmaVersion:'latest'});let found;function walk(n){if(!n||typeof n!=='object')return;if(n.type==='FunctionDeclaration'&&n.id.name===name)found=n;for(const [k,v]of Object.entries(n)){if(k==='start'||k==='end')continue;if(Array.isArray(v))v.forEach(walk);else if(v&&typeof v==='object')walk(v);}}walk(ast);assert(found,name);vm.runInContext(src.slice(found.start,found.end),ctx,{filename:file+':'+name});}
function pillars(text){return Object.fromEntries(text.split(' ').map((s,i)=>[['year','month','day','hour'][i],{gan:s[0],zhi:s[1]}]));}
let groups=0;const evidence={};
function test(name,fn){try{fn();groups++;console.log('PASS '+name);}catch(e){console.error('FAIL '+name+'\n'+e.stack);process.exitCode=1;}}
const b=c.enhanceBazi(c.computeBazi(1983,8,25,14,55,'male',{referenceDate:'2026-09-13T00:00:00Z'}));
test('Reported chart: year/hour roots reach the classifier; neutral is not silently weak',()=>{
  assert.equal(b.deDi,true);assert.equal(b.sittingRoot,false);
  assert.deepEqual(Array.from(b.structureFacts.dayMasterRoots,r=>[r.pillar,r.branch,r.stem]),[['year','亥','甲'],['hour','未','乙']]);
  assert.equal(b.strengthAssessment.components.root.allFourBranches,true);
  assert.equal(b.strengthAssessment.components.root.sittingRoot,false);
  assert.equal(b.isNeutral,true);assert.equal(b.fuyiAssessment.strengthInput,'中和附近');
  assert.deepEqual(plain(b.wuxingStance.map),{木:'平',火:'平',土:'平',金:'平',水:'平'});
  assert.equal(b.strengthPattern.length,0);assert.equal(b.medicineGod,null);
  assert(b.relayGod.evidence.includes('年干癸'));assert(!b.energyFlow.mainFlow.includes('金→水→木'));
  evidence.reported={pillars:b.pillars,strength:b.strengthAssessment,fuyi:b.fuyiAssessment,seasonal:b.seasonalAssessment,structure:b.zhengGe,huaqi:b.huaQiAssessments};
});
test('Position counterexample from Ziping: separated stem combination is not adjacency',()=>{
  const separated=c.getBaziStructureFacts(pillars('癸亥 甲寅 丙午 戊戌'));
  const touching=c.getBaziStructureFacts(pillars('戊戌 癸亥 丙午 甲寅'));
  assert.equal(separated.combinations.find(x=>/癸戊|戊癸/.test(x.pair)).adjacent,false);
  assert.equal(touching.combinations.find(x=>/癸戊|戊癸/.test(x.pair)).adjacent,true);
  assert(separated.adjacentGenerationPaths.some(p=>p.stems.join('')==='癸甲丙'));
  for(const p of touching.adjacentGenerationPaths)assert.notEqual(p.stems.join(''),'癸甲丙');
});
test('Support lens follows roles and existing channels, independent of invented shortage scores',()=>{
  const f=c.getBaziStructureFacts(pillars('癸亥 庚申 乙酉 癸未'));
  const weak=c.assessBaziFuyi(f,false,false),strong=c.assessBaziFuyi(f,true,false),neutral=c.assessBaziFuyi(f,false,true);
  assert.deepEqual(Array.from(weak.fav),['水','木']);assert(weak.mechanisms.some(m=>m.type==='官殺—印—身'));
  assert.deepEqual(new Set(strong.fav),new Set(['火','土','金']));
  assert.deepEqual(Array.from(neutral.fav),[]);assert(Object.values(neutral.map).every(x=>x==='平'));
  f.ec={木:0,火:60,土:0,金:0,水:0};assert.deepEqual(plain(c.assessBaziFuyi(f,false,false)),plain(weak));
  assert.equal(weak.items.find(x=>x.element==='火').exposed.length,0);
  assert.equal(f.stems.filter(s=>s.stem==='癸'&&s.rooted).length,2);
});
test('120 seasonal entries resolve actual stems, hidden roots and constraints; exact Yi-Shen branch fires',()=>{
  let count=0;const records=[];
  for(const dm of '甲乙丙丁戊己庚辛壬癸')for(const z of '寅卯辰巳午未申酉戌亥子丑'){
    const f=c.getBaziStructureFacts(pillars('癸亥 庚'+z+' '+dm+'酉 癸未')),ref=c.getBaziSeasonalReference(dm,z),a=c.assessBaziSeasonal(f,ref);
    assert(a.stems.length>0);assert.equal(a.climateScoreAdjustment,0);
    for(const item of a.stems){
      const seen=f.stems.some(s=>s.stem===item.stem),hidden=f.hidden.some(s=>s.stem===item.stem);
      assert.equal(item.status,seen?'已透':hidden?'藏支未透':'原局未見');
      assert.equal(item.usableAutomatically,false);
    }
    records.push({dm,month:z,...plain(a)});count++;
  }
  assert.equal(count,120);assert(b.seasonalAssessment.matchedClauses.some(x=>x.id==='YI_SHEN_GUI_WITHOUT_BING'));
  assert.equal(b.seasonalAssessment.stems.find(s=>s.stem==='己').status,'藏支未透');
  assert.equal(b.seasonalAssessment.stems.find(s=>s.stem==='丙').status,'原局未見');
  assert.equal(b.seasonalAssessment.stems.find(s=>s.stem==='癸').status,'已透');evidence.seasonal=records;
});
test('Changing prose alone cannot change decade/year scores; transit conditions retain exact stems',()=>{
  const original=c.getBaziSeasonalReference;
  const scores=chart=>chart.dayun.map(d=>[d.score,(d.liuNian||[]).map(y=>y.score)]);
  let cold,plainChart;
  try{
    c.getBaziSeasonalReference=(...a)=>({...original(...a),reason:'寒冷火旺燥熱'});cold=c.computeBazi(1983,8,25,14,55,'male');
    c.getBaziSeasonalReference=(...a)=>({...original(...a),reason:'中性文字'});plainChart=c.computeBazi(1983,8,25,14,55,'male');
  }finally{c.getBaziSeasonalReference=original;}
  assert.deepEqual(plain(scores(cold)),plain(scores(plainChart)));
  const dy=cold.dayun.find(d=>d.gz==='丙辰');assert(dy.notes.some(n=>n.includes('天干透出丙')));
  assert.equal(dy.climateScoreAdjustment,0);assert.equal(dy.scorePolicy,'ELEMENT_TEN_GOD_ONLY_CLIMATE_SEPARATE');
});
test('Ziwei flow-star published vectors, two profiles and natal identity remain separate',()=>{
  const z=c.computeZiwei(1983,8,25,14,'male',{referenceDate:'2026-09-13T00:00:00Z'});assert(z,c._jyZiweiError);
  const original=JSON.stringify(z.palaces),expected={2024:{祿存:'寅',擎羊:'卯',陀羅:'丑',天魁:'丑',天鉞:'未',天馬:'寅',文昌:'巳'},2026:{祿存:'巳',擎羊:'午',陀羅:'辰',天魁:'亥',天鉞:'酉',天馬:'申',文昌:'申'}};
  for(const yr of [2024,2026]){
    const y=z.getLiuNianZw(yr);assert.equal(y.flowStars.length,7);
    assert.deepEqual(Object.fromEntries(y.flowStars.map(s=>[s.star,s.branch])),expected[yr]);
    for(const star of y.flowStars){assert.equal(star.natalPalace,z.palaces.find(p=>p.branch===star.branch).name);assert.equal(star.periodPalace,y.palaces.find(p=>p.branch===star.branch).name);}
  }
  for(let yr=2020;yr<2080;yr++){const y=z.getLiuNianZw(yr);assert.equal(y.hua.length,4);assert.equal(y.flowStars.length,7);assert.equal(new Set(y.flowStars.map(s=>s.star)).size,7);}
  assert(z.daXian.every(d=>d.flowStars.length===7&&d.flowStars.every(s=>s.layer==='大限')));
  const alt=c.computeZiwei(1983,8,25,14,'male',{flowStarPolicy:'ZHONGZHOU_8'});
  assert.equal(alt.getLiuNianZw(2026).flowStars.find(s=>s.star==='文曲').branch,'午');
  assert.equal(JSON.stringify(z.palaces),original);assert.equal(z.integrity.status,'PASS');
  assert.equal(c.computeZiwei(1983,8,25,14,'male',{flowStarPolicy:'unknown'}),null);
  const damaged=plain(z.palaces);damaged[0].branch=damaged[1].branch;assert.throws(()=>c.validateZiweiPlacements(damaged,z.sihua));
  const missing=plain(z.palaces);for(const p of missing)p.stars=p.stars.filter(s=>s.name!=='紫微');assert.throws(()=>c.validateZiweiPlacements(missing,z.sihua));
  evidence.ziwei={policy:z.calculationPolicy,flow2026:z.getLiuNianZw(2026).flowStars};
});
test('Forty-five digital cut settings conserve all 78 cards through real counting and pairing',()=>{
  const {ctx:e}=environment();e.console={log(){},warn(){},error(){}};
  for(const name of ['picker-core','tarot-foundation','golden-dawn-tarot','tarot','tarot-reading','tarot_upgrade'])vm.runInContext(read('JS/'+name+'.js'),e);
  const deck=vm.runInContext('TAROT.map(c=>Object.assign({},c,{isUp:true}))',e),before=JSON.stringify(deck);
  let cuts=0;
  for(let first=0;first<5;first++)for(let left=0;left<3;left++)for(let right=0;right<3;right++){
    function run(sig){let i=0;e._secInt=n=>{assert.equal(n,[5,3,3][i]);return [first,left,right][i++];};return e.ootkOp1(deck,sig);}
    const initial=run(deck[0].id),sizes=Object.values(initial.piles);assert.equal(sizes.reduce((a,b)=>a+b),78);assert(sizes.every(n=>n>=16&&n<=22));
    let offset=0,all=[];
    for(const n of sizes){const op=run(deck[offset].id);assert.equal(op.activeCards.length,n);all.push(...op.activeCards.map(c=>c.id));offset+=n;}
    assert.deepEqual(all,Array.from(deck,c=>c.id));assert.equal(new Set(all).size,78);assert.equal(initial.cutPolicy,'NEAR_CENTRE_TWO_LEVELS_V1');cuts++;
  }
  assert.equal(cuts,45);assert.equal(JSON.stringify(deck),before);assert.throws(()=>e.ootkOp1(deck.slice(1),deck[0].id));
});
test('Single prompt, composite API and custom report preserve the same core; no second crystal classifier',()=>{
  const prompt=c.buildBaziPrompt('我適合配戴什麼手鍊？',b,{});assert(prompt.includes('YI_SHEN_GUI_WITHOUT_BING'));assert(prompt.includes('官殺—印—身'));
  const z=c.computeZiwei(1983,8,25,14,'male',{referenceDate:'2026-09-13T00:00:00Z'}),zp=c._ziweiBuildPrompt(z,{bdate:'1983-08-25',btime:'14:55',gender:'male'});
  assert(zp.includes('運祿存'));assert(zp.includes('流文昌'));
  const src=read('JS/ai-analysis.js'),a=src.indexOf('// ═══ 4. 八字更多細節'),end=src.indexOf('// ═══ 5.',a);
  c.S.bazi=b;c.p={dims:{}};vm.runInContext(src.slice(a,end),c);
  assert.deepEqual(plain(c.p.dims.bazi.fuyiAssessment),plain(b.fuyiAssessment));assert(c.p.dims.bazi.isNeutral);
  sourceFunction('JS/ai-analysis.js','analyzeFullCrystal');sourceFunction('JS/ai-analysis.js','formatCrystalReport');
  const custom=c.analyzeFullCrystal(b,z,'general','我適合配戴什麼手鍊？');assert.equal(custom.corrections.length,0);assert.equal(custom.crossCheck.length,0);assert.equal(custom.avoid.length,0);
  assert.equal(custom.roles.水.role,b.fuyiAssessment.map.水);
  const report=c.formatCrystalReport(custom,{question:'我適合配戴什麼手鍊？'});assert(report.includes('YI_SHEN_GUI_WITHOUT_BING'));assert(!/絕對禁止|全身用神佔比|雙系統確認|天鐵.*95分/.test(report));
  evidence.prompt=prompt;evidence.ziweiPrompt=zp;evidence.custom=report;
});

(async()=>{
  const {ctx:r}=environment();sourceFunction('JS/tarot.js','_secInt',r);sourceFunction('JS/lenormand.js','_lnRandInt',r);sourceFunction('JS/oracle.js','_v63FallbackRandom',r);
  test('All bounded random draws reject the uint32 tail, retain endpoints and reject invalid ranges',()=>{
    for(const fn of [r._secInt,r._lnRandInt,r._v63FallbackRandom]){
      let seq=[4294967295,4],calls=0;r.crypto={getRandomValues(u){u[0]=seq[calls++];return u;}};
      assert.equal(fn(3),1);assert.equal(calls,2);
      r.crypto={getRandomValues(u){u[0]=4294967295;return u;}};assert.equal(fn(4294967296),4294967295);
      for(const n of [0,-1,2.5,NaN,Infinity])assert.throws(()=>fn(n));
    }
  });
  sourceFunction('JS/oracle.js','_v63ThrowJiao',r);
  try{const got=[];for(const seq of [[0,0],[0,1],[1,0],[1,1]]){let i=0;r._v63FairRandom=async n=>{assert.equal(n,2);return seq[i++];};got.push(await r._v63ThrowJiao());}assert.deepEqual(got,['laugh','holy','holy','dark']);groups++;console.log('PASS Four digital block outcomes: two holy, one laugh, one dark; no physical probability claim');}catch(e){process.exitCode=1;console.error(e.stack);}
  if(process.env.JY_CORE_OUTPUT&&!process.exitCode){const dir=path.resolve(process.env.JY_CORE_OUTPUT);fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(path.join(dir,'core-evidence.json'),JSON.stringify({reported:evidence.reported,ziwei:evidence.ziwei},null,2));fs.writeFileSync(path.join(dir,'seasonal-120-conditions.json'),JSON.stringify(evidence.seasonal,null,2));fs.writeFileSync(path.join(dir,'bazi-hand-bracelet-prompt.txt'),evidence.prompt);fs.writeFileSync(path.join(dir,'ziwei-with-flow-stars.txt'),evidence.ziweiPrompt);fs.writeFileSync(path.join(dir,'custom-design-report.txt'),evidence.custom);}
  console.log('Core engine regression groups passed: '+groups);
})();
