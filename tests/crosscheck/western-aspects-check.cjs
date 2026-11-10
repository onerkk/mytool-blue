const fs=require('fs'),vm=require('vm'),path=require('path');const root=require('path').resolve(__dirname,'../..');
const ctx={console,Intl,Date,Math,Set,Map,Object,Array,Number,JSON};ctx.globalThis=ctx;vm.createContext(ctx);
for(const f of ['vendor/astronomy-engine-2.1.19.min.js','vedic-ayanamsa.js','astro-time.js','western-engine.js'])vm.runInContext(fs.readFileSync(path.join(root,'JS',f),'utf8'),ctx,{filename:f});
const E=ctx.JYWestern;let seed=17;const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
const MAJ=[0,60,90,120,180];let n=0,wrongOrb=0,wrongAngle=0,missed=0,ex=[],prof=0,profBad=0,srBad=0,lotBad=0;const K=['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto'];
const sep=(a,b)=>{const d=Math.abs(a-b)%360;return d>180?360-d:d;};
for(let i=0;i<300;i++){const ms=Date.UTC(1940+Math.floor(rnd()*80),Math.floor(rnd()*12),1+Math.floor(rnd()*28),Math.floor(rnd()*24),Math.floor(rnd()*60));
 const w=E.compute({utc:new Date(ms).toISOString(),reference:'2026-11-10T04:00:00Z',latitude:+(rnd()*100-50).toFixed(2),longitude:+(rnd()*360-180).toFixed(2),houseSystem:'P'});
 if(i===0){console.log(JSON.stringify(w.aspects[0]).slice(0,300));console.log(JSON.stringify(w.profection).slice(0,400));console.log(JSON.stringify(w.lots).slice(0,500));console.log(JSON.stringify(w.sect).slice(0,200));console.log(JSON.stringify(w.solarReturn&&{y:w.solarReturn.year,utc:w.solarReturn.utc,res:w.solarReturn.residualDegrees}));}
 const got=new Map();for(const a of w.aspects){if(!K.includes(a.a)||!K.includes(a.b))continue;n++;const s=sep(w.planets[a.a].longitude,w.planets[a.b].longitude);if(Math.abs(Math.abs(s-a.angle)-a.orb)>1e-6)wrongOrb++;if(MAJ.includes(a.angle))got.set([a.a,a.b].sort().join('/'),a.angle);}
 for(let x=0;x<K.length;x++)for(let y=x+1;y<K.length;y++){const s=sep(w.planets[K[x]].longitude,w.planets[K[y]].longitude);for(const A of MAJ)if(Math.abs(s-A)<3){const k=[K[x],K[y]].sort().join('/');if(got.get(k)!==A){missed++;if(ex.length<4)ex.push([k,A,s.toFixed(2)]);}}}
 if(w.solarReturn&&w.solarReturn.residualDegrees>1e-4)srBad++;
}
console.log('aspects checked',n,'orb mismatch',wrongOrb,'tight major aspects (<3°) not listed',missed,JSON.stringify(ex),'solar return residual>1e-4°:',srBad);
