'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),root=path.resolve(__dirname,'..');
const {ctx:c}=require('./native-fixtures-20261003.cjs').environment(),R=c.JYOracleRegister,fixtures=require('./fixtures/oracle-temple-20261003.json'),results=[];
const plain=x=>JSON.parse(JSON.stringify(x)),poem=n=>{const p=R.get(n);return {n,g:p.ganzhi,p:p.canonicalPoem,sourceUrl:p.poemSource};};
function test(name,f){try{f();results.push({name,status:'passed'});console.log('PASS '+name);}catch(e){results.push({name,status:'failed',error:e.stack});process.exitCode=1;console.error(e.stack);}}
const normalize=s=>s.replace(/[\s，。；]/g,'');
test('All sixty actual primary poems, five explicit absent fields and 300 original story titles',()=>{
 assert.equal(R.all().length,60);let present=0;
 for(const f of fixtures.cases){const p=R.get(f.number);assert.equal(p.ganzhi,f.ganzhi);assert.equal(p.sourceSHA256,f.sourceSHA256);assert.equal(normalize(p.canonicalPoem),normalize(f.templePoem).replace(f.number===5?'兒恐':'INVALID','只恐'));assert.deepEqual(plain(p.storyTitles),f.storyTitles);assert.equal(p.categories.length,29);assert.equal(p.categories.filter(x=>x.present).length,f.sourceCategories);present+=f.sourceCategories;assert(p.summary&&p.premises&&p.domainNotes);}
 assert.equal(present,1735);assert.deepEqual(plain(R.all().filter(x=>x.categories.some(y=>!y.present)).map(x=>x.number)),[25,35,39,40,41]);
});
test('Wrong edition, same-number foreign poem, fake source and missing register never get a reading',()=>{
 const p=poem(5);assert.throws(()=>c.JYNativeCards.oracle({...p,g:'甲戌'}));assert.throws(()=>c.JYNativeCards.oracle({...p,p:poem(6).p}));assert.throws(()=>c.JYNativeCards.oracle({...p,sourceUrl:'https://example.org/5'}));assert.throws(()=>c.JYNativeCards.oracle({...p,n:61}));
 const a=c.JYNativeCards.oracle(p);assert(a.supplementSource.endsWith('/fs05-2/'));assert(a.sourceAudit.some(s=>s.includes('第6籤')));
});
test('Corrupt mixed paragraphs do not become advice; incompatible source conditions stay distinct',()=>{
 const a=R.get(22),b=R.get(33);assert(a.summary.includes('太公'));assert(!a.summary.includes('魚'));assert(a.sourceAudit.some(x=>x.includes('丁酉')));assert(b.sourceAudit.some(x=>x.includes('第13籤')));for(const n of [28,40,41,43,60])assert(R.get(n).sourceAudit.length);assert(R.get(28).domainNotes.includes('矛盾'));
});
test('All sixty native result/export records retain unique interpretation, 29 category slots and edition evidence',()=>{
 for(let n=1;n<=60;n++){const p=poem(n),s=JSON.stringify(p),a=c.JYNativeAnalysis.analyze('oracle',p),out=c.JYNativeAnalysisView.exportData('oracle',p,a);assert.equal(a.coverage.editionMatched,true);assert.equal(a.items.length,5);assert.equal(out.nativeAnalysis.methodData.categories.length,29);assert.equal(out.nativeAnalysis.methodData.reading.summary,R.get(n).summary);assert.equal(JSON.stringify(p),s);assert.equal(a.methodData.lines.length,4);}
});
test('Actual sixty-lot prompt entry carries source audits and reviewed structural conditions',()=>{
 const source=fs.readFileSync(path.join(root,'JS/oracle.js'),'utf8');vm.runInContext(source.replace(/\}\)\(\);\s*$/,'window.__oracleBuild=_buildOraclePrompt;})();'),c);
 for(const n of [1,5,22,28,33,60]){const text=c.__oracleBuild(poem(n),'最近換工作，需要留意什麼？');assert(text.includes(R.get(n).summary));assert(text.includes(R.get(n).premises));assert(text.includes(R.get(n).supplementSource));assert(text.includes('textFeatureTags'));assert(text.includes('最近換工作'));}
});
fs.writeFileSync(path.join(root,'docs/oracle-register-validation-20261003.json'),JSON.stringify({results,scope:'60 actual temple-page poems, 1735 published fields plus five absent slots, 300 story titles, edition validation and prompt/export entry'},null,2));
