const fs=require('fs'),vm=require('vm'),path=require('path');const root=require('path').resolve(__dirname,'../..');
const ctx={console,Intl,Date,Math,Set,Map,Object,Array,Number,JSON};ctx.globalThis=ctx;vm.createContext(ctx);
for(const f of ['vendor/astronomy-engine-2.1.19.min.js','vedic-ayanamsa.js','astro-time.js','western-engine.js','vedic-engine.js'])vm.runInContext(fs.readFileSync(path.join(root,'JS',f),'utf8'),ctx,{filename:f});
const E=ctx.JYWestern,V=ctx.JYVedic;let seed=99;const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
const out=[];const N=+process.argv[2]||120;let t0=Date.now();
for(let i=0;i<N;i++){const ms=Date.UTC(1930+Math.floor(rnd()*95),Math.floor(rnd()*12),1+Math.floor(rnd()*28),Math.floor(rnd()*24),Math.floor(rnd()*60));
 const lat=+(rnd()*120-60).toFixed(2),lon=+(rnd()*360-180).toFixed(2),utc=new Date(ms).toISOString(),ref='2026-11-10T04:00:00Z';const r={utc,lat,lon};
 try{const w=E.compute({utc,reference:ref,latitude:lat,longitude:lon,houseSystem:'P'});if(i===0)r.wkeys=Object.keys(w),r.hkeys=Object.keys(w.houses||{});
  r.w={planets:Object.fromEntries(Object.entries(w.planets).map(([k,p])=>[k,[p.longitude,p.retrograde,p.house]])),houses:w.houses};}catch(e){r.werr=e.message;}
 try{const v=V.compute({utc,reference:ref,latitude:lat,longitude:lon});if(i===0){r.vkeys=Object.keys(v);r.vsample=JSON.stringify(v.planets).slice(0,600);r.vd=JSON.stringify(v.dasha||v.vimshottari||{}).slice(0,700);r.vl=JSON.stringify(v.lagna||v.ascendant||{}).slice(0,300);}
  r.v={planets:v.planets,aya:v.policy&&v.policy.ayanamsaDegrees,lagna:v.lagna||v.ascendant,dfirst:v.dasha.firstLord,dbal:v.dasha.balanceYears};}catch(e){r.verr=e.message;}
 out.push(r);}
fs.writeFileSync('/tmp/wv.json',JSON.stringify(out));console.log('done',N,'ms/case',((Date.now()-t0)/N).toFixed(0));
const r=out[0];console.log(r.wkeys,r.hkeys,r.vkeys,'\n',r.vsample,'\n',r.vd,'\n',r.vl,r.werr,r.verr);
