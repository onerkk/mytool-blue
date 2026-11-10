const fs=require('fs'),vm=require('vm'),path=require('path');const root=require('path').resolve(__dirname,'../..');
const ctx={console,Intl,Date,Math,Set,Map,Object,Array,Number,JSON};ctx.globalThis=ctx;vm.createContext(ctx);
for(const f of ['vendor/astronomy-engine-2.1.19.min.js','vedic-ayanamsa.js','astro-time.js','vedic-engine.js'])vm.runInContext(fs.readFileSync(path.join(root,'JS',f),'utf8'),ctx,{filename:f});
const V=ctx.JYVedic;let seed=41;const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
const F={2:(s,l)=>{const first=l<15;return (s%2===0)?(first?4:3):(first?3:4);},3:(s,l)=>(s+4*Math.floor(l/10))%12,7:(s,l)=>{const p=Math.floor(l/(30/7));return ((s%2===0?s:s+6)+p)%12;},9:(s,l,lon)=>Math.floor(lon*9/30)%12,10:(s,l)=>{const p=Math.floor(l/3);return ((s%2===0?s:s+8)+p)%12;},12:(s,l)=>(s+Math.floor(l/2.5))%12,
 4:(s,l)=>(s+3*Math.floor(l/7.5))%12,16:(s,l)=>{const p=Math.floor(l/(30/16));return ([0,4,8][s%3]+p)%12;},20:(s,l)=>{const p=Math.floor(l/1.5);return ([0,8,4][s%3]+p)%12;},24:(s,l)=>{const p=Math.floor(l/1.25);return ((s%2===0?4:3)+p)%12;},
 27:(s,l)=>{const p=Math.floor(l/(30/27));return ([0,3,6,9][s%4]+p)%12;},40:(s,l)=>{const p=Math.floor(l/0.75);return ((s%2===0?0:6)+p)%12;},45:(s,l)=>{const p=Math.floor(l/(30/45));return ([0,4,8][s%3]+p)%12;},60:(s,l)=>(s+Math.floor(l*2))%12};
const bad={},tot={};let first=true;
for(let i=0;i<300;i++){const ms=Date.UTC(1930+Math.floor(rnd()*95),Math.floor(rnd()*12),1+Math.floor(rnd()*28),Math.floor(rnd()*24),Math.floor(rnd()*60));
 const v=V.compute({utc:new Date(ms).toISOString(),reference:'2026-11-10T04:00:00Z',latitude:+(rnd()*100-50).toFixed(2),longitude:+(rnd()*360-180).toFixed(2)});
 const vg=v.vargas;if(first){first=false;console.log(Array.isArray(vg)?'array '+vg.length:Object.keys(vg).join(','));const one=Array.isArray(vg)?vg[1]:Object.values(vg)[1];console.log(JSON.stringify(one).slice(0,400));}
 const list=Array.isArray(vg)?vg:Object.values(vg);
 for(const g of list){const d=g.division;if(!F[d])continue;for(const k of ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn','Rahu','Ketu']){const lon=v.planets[k].longitude,s=Math.floor(lon/30),l=lon-30*s;const frac=(l*d/30)%1;if(Math.min(frac,1-frac)<1e-6)continue;const exp=F[d](s,l,lon),got=g.planets[k].sign;tot[d]=(tot[d]||0)+1;if(exp!==got){bad[d]=(bad[d]||0)+1;if(bad[d]===1)console.log('D'+d,k,'lon',lon.toFixed(3),'got',got,'exp',exp);}}}}
console.log('checked',JSON.stringify(tot));console.log('mismatch',JSON.stringify(bad));
