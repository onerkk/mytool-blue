const fs=require('fs'),vm=require('vm'),path=require('path');const root=process.env.JY_ROOT||'/home/claude/mytool-blue';
const ctx={console,Intl,Date,Math,Set,Map,Object,Array,Number,JSON};ctx.globalThis=ctx;vm.createContext(ctx);
for(const f of ['vendor/astronomy-engine-2.1.19.min.js','vedic-ayanamsa.js','astro-time.js','vedic-engine.js'])vm.runInContext(fs.readFileSync(path.join(root,'JS',f),'utf8'),ctx,{filename:f});
let seed=9;const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};const EXP={1:'Saturn',3:'Mars',4:'Mars',6:'Saturn',9:'Venus',10:'Venus'};let bad=0,n=0;const by={};
for(let i=0;i<400;i++){const ms=Date.UTC(1940+Math.floor(rnd()*80),Math.floor(rnd()*12),1+Math.floor(rnd()*28),Math.floor(rnd()*24),Math.floor(rnd()*60));
 const v=ctx.JYVedic.compute({utc:new Date(ms).toISOString(),reference:'2026-11-10T04:00:00Z',latitude:+(rnd()*100-50).toFixed(2),longitude:+(rnd()*360-180).toFixed(2)});
 const y=v.yogas.find(x=>/^Yogakaraka/.test(x.name)),ls=v.lagna.sign,got=y?y.planets.join(','):'';n++;by[ls]=by[ls]||new Set();by[ls].add(got||'-');if((EXP[ls]||'')!==got)bad++;}
console.log('yogakaraka charts',n,'mismatch vs classical six-lagna table',bad,JSON.stringify(Object.fromEntries(Object.entries(by).map(([k,v])=>[k,[...v]]))));
