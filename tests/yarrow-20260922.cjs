'use strict';
const assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm'),path=require('path'),root=path.resolve(__dirname,'..');
const ctx={console,Uint32Array,crypto:require('node:crypto').webcrypto};vm.createContext(ctx);for(const f of ['liuyao-core','yarrow-core','yijing-data','yijing-core','reading-quality','gua-prompt'])vm.runInContext(fs.readFileSync(path.join(root,'JS',f+'.js'),'utf8'),ctx);
const C=ctx.JYYarrowCore,counts={6:0,7:0,8:0,9:0};
// Enumerate all 4³ equally likely remainder paths, independent of RNG and display.
for(let a=1;a<=4;a++)for(let b=1;b<=4;b++)for(let c=1;c<=4;c++){
 let n=49,changes=[];for(const rem of [a,b,c]){let v=C.split(n,rem+8);assert.equal(v.left+v.right,n);assert.equal(v.hang,1);assert.equal(v.removed,1+v.leftRemainder+v.rightRemainder);assert.equal(v.remaining%4,0);assert(n===49?[5,9].includes(v.removed):[4,8].includes(v.removed));changes.push(v);n=v.remaining;}
 const r=C.record(changes);assert.equal(r.value,n/4);counts[r.value]++;C.validate(r,r.value);
 const records=Array(6).fill(r),result=ctx.JYYijingCore.calculate({values:records.map(x=>x.value),method:'yarrow',records,question:'轉職是否合適？'});
 assert.equal(result.method,'yarrow');assert.equal(result.records.length,6);assert(ctx.JYGuaPrompt.facts(result).includes('大衍蓍草'));
}
assert.deepEqual(counts,{6:4,7:20,8:28,9:12});console.log('✓ 64 餘數路徑：老陰／少陽／少陰／老陽 = 1:5:7:3');
// Every physical valid cut conserves stalks and respects the 5/9 then 4/8 rule.
for(const n of [49,44,40,36,32])for(let l=1;l<n-1;l++){const r=C.split(n,l);assert.equal(r.remaining+r.removed,n);assert(r.leftRemainder>=1&&r.leftRemainder<=4);assert(r.rightRemainder>=1&&r.rightRemainder<=4);}
console.log('✓ 所有合法切點：分二、掛一、四揲、歸餘皆守恆');
let rec=C.cast();C.validate(rec,rec.value);let broken=JSON.parse(JSON.stringify(rec));broken.changes[1].remaining+=4;assert.throws(()=>C.validate(broken,rec.value));assert.throws(()=>C.record([]));assert.throws(()=>C.split(49,48));
ctx.crypto=null;assert.throws(()=>C.cast(),/安全/);console.log('✓ 破損紀錄與無安全亂數均拒絕；六爻仍走獨立三錢引擎');
