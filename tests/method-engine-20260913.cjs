'use strict';
// Tests actual source paths. Table anchors are separately transcribed from the
// cited texts; synthetic birth data is never a predictive-accuracy experiment.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),acorn=require('acorn');
const {environment}=require('./dom-fixture.cjs');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8'),plain=x=>JSON.parse(JSON.stringify(x));
const {ctx:c}=environment();let passed=0;
function test(name,fn){try{fn();passed++;console.log('PASS '+name);}catch(e){process.exitCode=1;console.error('FAIL '+name+'\n'+e.stack);}}
function load(f){vm.runInContext(read(f),c,{filename:f});}
['JS/reading-quality.js','JS/vendor/lunar.js','JS/bazi-calendar-core.js','JS/bazi.js'].forEach(load);
const adapter=read('JS/ai-analysis.js'),ast=acorn.parse(adapter,{ecmaVersion:'latest'});
for(const n of ast.body){
 if(n.type==='VariableDeclaration'&&n.declarations.some(d=>['SIHUA_TABLE','ZW_PALACES','ZW_MAJOR','ZW_BRIGHTNESS'].includes(d.id.name)))vm.runInContext(adapter.slice(n.start,n.end),c);
 if(n.type==='FunctionDeclaration'&&n.id.name==='getStarBright')vm.runInContext(adapter.slice(n.start,n.end),c);
}
c.Lunar.Solar=c.Solar;load('JS/ziwei.js');
const stems='甲乙丙丁戊己庚辛壬癸',branches='子丑寅卯辰巳午未申酉戌亥';
const names=['命宮','兄弟','夫妻','子女','財帛','疾厄','遷移','交友','官祿','田宅','福德','父母'];
test('120 seasonal references keep stem roles and derived elements consistent',()=>{
 for(const g of stems)for(const z of branches){const r=c.getBaziSeasonalReference(g,z);assert(r,g+z);assert(r.candidateStems.length);assert.equal(r.integrationMode,'SEPARATE_LENS');assert(r.detail.includes('典籍取用入口'));assert(r.sourceUrl.startsWith('https://'));assert.deepEqual(plain(r.need),[...new Set(r.candidateStems.map(x=>'木木火火土土金金水水'[stems.indexOf(x)]))]);for(const x of r.candidateStems)assert(r.detail.includes(x));}
 for(const pair of [['甲',''],['甲','寅卯'],['toString','寅'],['','寅'],[null,'寅']])assert.equal(c.getBaziSeasonalReference(...pair),null);
});
test('Text anchors distinguish months, seasonal paragraphs and conditional branches',()=>{
 const anchors={甲寅:'丙癸',乙申:'己丙癸',丙卯:'壬',丁寅:'庚甲',戊辰:'甲丙癸',己寅:'丙癸',庚巳:'壬戊丙',辛寅:'己壬',辛卯:'壬甲',壬申:'戊丁',壬酉:'甲',壬丑:'丙甲',癸卯:'庚辛',癸申:'丁甲'};
 for(const [key,value]of Object.entries(anchors))assert.equal(c.getBaziSeasonalReference(key[0],key[1]).candidateStems.join(''),value,key);
 assert(c.getBaziSeasonalReference('己','子').detail.includes('土多另審甲'));
 assert(c.getBaziSeasonalReference('丁','亥').detail.includes('三冬丁火總論'));
 assert(c.getBaziSeasonalReference('辛','寅').need.includes('土'));
 assert(c.getBaziSeasonalReference('癸','卯').need.includes('金'));
});
function chart(year,month=4,day=8,hour=14,gender='male',referenceDate='2026-09-13T04:00:00Z'){
 const z=c.computeZiwei(year,month,day,hour,gender,{referenceDate});assert(z,c._jyZiweiError);return z;
}
function checkLayer(z,period,layer,ming){
 assert.equal(period.palaces.length,12);assert.equal(new Set(period.palaces.map(p=>p.branch)).size,12);
 for(let i=0;i<12;i++){const p=period.palaces[i];assert.equal(p.name,names[i]);assert.equal(p.branch,branches[(branches.indexOf(ming)-i+24)%12]);assert.equal(p.natalPalace,z.palaces.find(n=>n.branch===p.branch).name);assert.equal(p.layer,layer);}
 assert.equal(period.hua.length,4);assert.deepEqual(plain(period.hua.map(h=>h.hua)),['化祿','化權','化科','化忌']);
 for(const h of period.hua){const natal=z.palaces.find(p=>p.stars.some(s=>s.name===h.star));assert.equal(h.palace,natal.name);assert.equal(h.natalPalace,natal.name);assert.equal(h.palaceBranch,natal.branch);assert.equal(h.layer,layer);assert.equal(h.periodPalace,period.palaces.find(p=>p.branch===natal.branch).name);}
}
test('Ten birth stems: all decade/year/month layers preserve twelve identities and all four transformations',()=>{
 for(let i=0;i<10;i++){
  const z=chart(1984+i,4+i%6,8+i,2*(i%12),i%2?'female':'male');const natalBefore=JSON.stringify(z.palaces);
  z.daXian.forEach(d=>checkLayer(z,d,'大限',d.branch));
  for(const y of [2025,2026,2027]){const n=z.getLiuNianZw(y);checkLayer(z,n,'流年',n.mingBranch);}
  z.getLiuYueZw(2026).forEach(m=>checkLayer(z,m,'流月',m.mingBranch));
  assert.equal(JSON.stringify(z.palaces),natalBefore,'periods must not move or relabel natal stars');
 }
 const z=chart(2008),n=z.getLiuNianZw(2026);assert.deepEqual(plain(n.palaces.slice(0,3).map(p=>[p.name,p.branch])),[['命宮','午'],['兄弟','巳'],['夫妻','辰']]);
});
const start=adapter.indexOf('// ═══ 6. 紫微加入四化資訊'),end=adapter.indexOf('// ═══ 7. 西洋占星結構化 dims',start);assert(start>0&&end>start);
function pack(z){c.S.ziwei=z;c.p={dims:{},birth:'2008-02-07'};vm.runInContext(adapter.slice(start,end),c,{filename:'actual-Ziwei-payload-section'});return plain(c.p.dims.ziwei);}
test('Actual composite adapter uses nominal age and lunar reference year across New Year',()=>{
 const before=chart(2008,2,7,0,'male','2026-02-16T04:00:00Z'),after=chart(2008,2,7,0,'male','2026-02-17T04:00:00Z');
 for(const [z,y,age]of [[before,2025,18],[after,2026,19]]){const p=pack(z);assert.equal(p.currentAge,age);assert(p.xiaoXian.includes('虛歲'+age));assert(p.xiaoXian.includes(z.getXiaoXian(age).branch));assert(p.lnDetail.startsWith(y+'農曆年度'));assert.equal(p.lnHuaData.length,4);assert.equal(p.dxHuaData.length,4);assert.equal(p.liuYueData.length,12);assert.equal(p.daXianData.length,12);assert.equal(p.natalPalaces.length,12);assert(p.laiyinGong.startsWith(z.laiYin.name+'（'));assert.deepEqual(p.selfHuaData,plain(z.selfHua));assert.deepEqual(p.feiGongHuaData,plain(z.feiGongHua));}
});
test('Actual composite adapter binds palace names to records, independent of serialization order',()=>{
 const z=chart(1983,8,25),original=pack(z);z.palaces=z.palaces.slice(5).concat(z.palaces.slice(0,5));const rotated=pack(z);
 assert.equal(rotated.mingStars,original.mingStars);assert.equal(rotated.shenGong,original.shenGong);assert.equal(rotated.laiyinGong,original.laiyinGong);
 for(const [field,separator]of [['allPalaces','\n'],['keyPalaces','；'],['flyMatrix','\n']])assert.deepEqual(rotated[field].split(separator).sort(),original[field].split(separator).sort(),field);
 assert.deepEqual(rotated.sihua.sort(),original.sihua.sort());assert.deepEqual(rotated.gongHua.sort(),original.gongHua.sort());
});
test('Twelve native methods reach the API system instructions without a tarot default',()=>{
 const q=c.JY_READING_QUALITY;assert.equal(q.methodKinds().length,12);assert.deepEqual(plain(q.methodLines('unknown')),[]);
 const guide=q.payloadGuide(q.methodKinds());assert.equal(Object.keys(guide.methods).length,12);
 const server=read('functions/api/ai.js'),serverAst=acorn.parse(server,{ecmaVersion:'latest',sourceType:'module'}),methodNode=serverAst.body.find(n=>n.type==='VariableDeclaration'&&n.declarations.some(d=>d.id.name==='SYSTEM_METHODS'));
 const methodCtx=vm.createContext({});vm.runInContext(server.slice(methodNode.start,methodNode.end)+';globalThis.value=SYSTEM_METHODS;',methodCtx);
 for(const kind of q.methodKinds())for(const step of q.methodLines(kind))assert(methodCtx.value.includes(step),'missing '+kind+' method step');
 assert(q.plainText().includes('充分解釋'));assert(!/接著說明現在能做什麼，再用一小段/.test(q.plainText()));
});
console.log('Method/engine regression groups passed: '+passed);
