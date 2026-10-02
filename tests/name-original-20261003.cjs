'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {ctx:c}=require('./native-fixtures-20261003.cjs').environment(),E=c.JYNameEngine,root=path.resolve(__dirname,'..'),original=JSON.parse(fs.readFileSync(path.join(root,'data/name/numerology-original-1935.json'),'utf8')),results=[];
function test(name,f){try{f();results.push({name,pass:true});console.log('PASS '+name);}catch(e){results.push({name,pass:false,error:e.message});console.error(e.stack);process.exitCode=1;}}
test('All 81 independently numbered source rows, printed pages and canvas IDs are preserved in offline bundle',()=>{
 assert.equal(original.rows.length,81);assert.equal(original.profile,'KUMAZAKI-UN-NI-NORU-HO-1935');
 for(let i=0;i<81;i++){const a=original.rows[i],b=c.JYNameData.numerology.original.rows[i];assert.equal(a.number,i+1);assert.equal(b.number,i+1);assert.equal(b.summary,a.summary);assert.equal(a.canvas,Math.floor(a.printedPage/2)+2);assert(a.sourceUrl.includes('/1094933/1/'+a.canvas));assert(a.summary.length>=20);assert(a.verification);}
 const digest=crypto.createHash('sha256').update(JSON.stringify(c.JYNameData.characters)).digest('hex');assert.equal(digest,'9a0e6e74849146903b77d7902067d1ab213f694ef432a9c632eeadfed25de52d');
});
test('Every source row is bundled; actual five-grid inputs preserve 2–81 and the 81→1 alias',()=>{
 for(let k=1;k<=81;k++){const n=k===1?161:k===81?81:k+80,a=Math.floor(n/3),b=Math.floor((n-a)/2),d=n-a-b,r=E.analyze({surname:'王',given:'小明',overrides:{王:{stroke:a},小:{stroke:b},明:{stroke:d}}}),grids=r.fiveGrids.grids;assert.deepEqual(JSON.parse(JSON.stringify(grids.map(x=>x.num))),[a+1,a+b,b+d,d+1,n]);assert.equal(grids[4].number81,k===1?81:k);assert.equal(grids[4].originalNumerology.number,k===1?81:k);assert.equal(grids[4].focus,original.rows[k===1?80:k-1].summary);if(k===1){assert.equal(grids[4].numberCycleAudit.baseNumber,1);assert.equal(E.cycle(1),1);}assert.equal(grids[4].originalNumerology.profile,original.profile);assert(grids[4].practiceSource.includes('本站'));assert(grids[4].commonModernTable.scope.includes('不混作原著'));}
});
test('Original conditional meanings are not replaced by modern favourable-number labels',()=>{
 const rows=original.rows;assert(rows[24].summary.includes('偏執'));assert(rows[25].summary.includes('破折'));assert(rows[26].summary.includes('爭'));assert(rows[70].summary.includes('執行'));assert(rows[74].summary.includes('退'));
 const r=E.compare({surname:'王',candidates:['小明','明小'],baselineName:'王安'}),prompt=c.JYNamePrompt.build(r);assert(prompt.includes('originalNumerology'));assert(prompt.includes('1935'));assert(prompt.includes('原名'));assert(!prompt.includes('undefined'));assert(!prompt.includes('NaN'));
});
const report={date:'2026-10-03',engineVersion:E.version,sourceProfile:original.profile,results,passed:results.filter(x=>x.pass).length,total:results.length};fs.writeFileSync(path.join(root,'docs/name-original-validation-20261003.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({passed:report.passed,total:report.total}));
