const c=require('/home/claude/mytool-blue/tests/native-fixtures-20261003.cjs').environment().ctx;const fs=require('fs');
let seed=31;const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
const mk=g=>c.computeBazi(1950+Math.floor(rnd()*70),1+Math.floor(rnd()*12),1+Math.floor(rnd()*28),Math.floor(rnd()*23),Math.floor(rnd()*60),g,{referenceDate:'2026-11-10T04:00:00Z'});
const out=[];for(let i=0;i<150;i++){const a=mk('male'),b=mk('female');const r=c.BaziSuiteCore.createCompatibility(a,b,{scenarioId:'couple'});
 if(i===0){console.log(Object.keys(r).join(','));for(const k of Object.keys(r))if(/relation|stem|gan/i.test(k))console.log(k,JSON.stringify(r[k]).slice(0,400));}
 const pl=x=>['year','month','day','hour'].map(k=>x.pillars[k].gan+x.pillars[k].zhi);
 out.push({a:pl(a),b:pl(b),br:r.branchRelations,st:r.stemRelations||r.ganRelations||r.stemInteractions||null});}
fs.writeFileSync('/tmp/x/cp.json',JSON.stringify(out));console.log(JSON.stringify(out[0]).slice(0,900));
