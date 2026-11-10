const c=require('../native-fixtures-20261003.cjs').environment().ctx;
let seed=56;const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};const opt={referenceDate:'2026-11-10T04:00:00Z'};const d={},codes={};let n=0,bi=[];
for(let i=0;i<400;i++){const b=c.computeBazi(1950+Math.floor(rnd()*60),1+Math.floor(rnd()*12),1+Math.floor(rnd()*28),Math.floor(rnd()*23),Math.floor(rnd()*60),rnd()<.5?'male':'female',opt);const p=c.BaziSuiteCore.buildPersonality(b,{});n++;codes[p.code]=(codes[p.code]||0)+1;
 for(const x of p.axes){d[x.key]=d[x.key]||[0,0];d[x.key][x.rightSelected?1:0]++;if(x.key==='rhythm')bi.push(x.inputs.branchInteractions);}}
console.log(n,Object.entries(d).map(([k,v])=>k+' 左'+v[0]+'/右'+v[1]).join(' ; '));console.log('distinct types',Object.keys(codes).length,'top',JSON.stringify(Object.entries(codes).sort((a,b)=>b[1]-a[1]).slice(0,5)));
bi.sort((a,b)=>a-b);console.log('branchInteractions median',bi[200],'share>=2',(bi.filter(x=>x>=2).length/n).toFixed(2));
