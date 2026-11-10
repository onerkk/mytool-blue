const c=require('../native-fixtures-20261003.cjs').environment().ctx,S=c.JYVedicStrength;
console.log(Object.keys(S).join(','));
let seed=77;const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
const EX={Sun:10,Moon:33,Mars:298,Mercury:165,Jupiter:95,Venus:357,Saturn:200},NAT={Sun:60,Moon:51.43,Venus:42.86,Jupiter:34.29,Mercury:25.71,Mars:17.14,Saturn:8.57};
const sep=(a,b)=>{const d=Math.abs(a-b)%360;return d>180?360-d:d;};
let first=true,n=0;const mx={uchcha:0,nat:0,dig:0};const ex={};
for(let i=0;i<40;i++){const ms=Date.UTC(1940+Math.floor(rnd()*80),Math.floor(rnd()*12),1+Math.floor(rnd()*28),Math.floor(rnd()*24),Math.floor(rnd()*60));
 const input={utc:new Date(ms).toISOString(),reference:'2026-11-10T04:00:00Z',latitude:+(rnd()*90-45).toFixed(2),longitude:+(rnd()*360-180).toFixed(2),uncertaintyMinutes:0};
 const v=c.JYVedic.compute(input);let r;try{r=(S.compute||S.calculate||S.shadbala)(v,input);}catch(e){if(first){console.log('ERR',e.message);first=false;}continue;}
 if(first){first=false;console.log(Object.keys(r).join(','));}
 const P0=r.planets;const P=Array.isArray(P0)?Object.fromEntries(P0.map(x=>[x.planet,x])):P0;n++;
 for(const k of Object.keys(EX)){const p=P[k];if(!p)continue;const lon=v.planets[k].longitude;
  const uexp=(180-sep(lon,EX[k]))/3;const ug=p.sthana&&(p.sthana.components?p.sthana.components.uchcha:p.sthana.uchcha);if(typeof ug==='number'){const d=Math.abs(ug-uexp);if(d>mx.uchcha){mx.uchcha=d;ex.uchcha=[k,lon.toFixed(2),ug,uexp.toFixed(2)];}}
  if(p.dig&&typeof p.dig.virupas==='number'&&typeof p.dig.weakLongitude==='number'){const dexp=sep(lon,p.dig.weakLongitude)/3;const d=Math.abs(p.dig.virupas-dexp);if(d>mx.dig){mx.dig=d;ex.dig=[k,p.dig.virupas,dexp];}const WD={Sun:'IC',Mars:'IC',Jupiter:'DSC',Mercury:'DSC',Moon:'MC',Venus:'MC',Saturn:'ASC'};if(p.dig.weakDirection!==WD[k]){ex.digdir=ex.digdir||[];if(ex.digdir.length<4)ex.digdir.push([k,p.dig.weakDirection,WD[k]]);}}
  const ng=p.naisargika&&p.naisargika.virupas;if(typeof ng==='number'){const d=Math.abs(ng-NAT[k]);if(d>mx.nat){mx.nat=d;ex.nat=[k,ng];}}
 }}
console.log('charts',n,'max diff',JSON.stringify(mx),JSON.stringify(ex));
