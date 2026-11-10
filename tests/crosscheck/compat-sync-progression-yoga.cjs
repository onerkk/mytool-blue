const fs=require('fs'),vm=require('vm'),path=require('path');const root=process.env.JY_ROOT||'/home/claude/mytool-blue';
const c=require(root+'/tests/native-fixtures-20261003.cjs').environment().ctx;
let seed=123;const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
const TG='甲乙丙丁戊己庚辛壬癸',DZ='子丑寅卯辰巳午未申酉戌亥';const opt={referenceDate:'2026-11-10T04:00:00Z'};
const mk=g=>c.computeBazi(1955+Math.floor(rnd()*55),1+Math.floor(rnd()*12),1+Math.floor(rnd()*28),Math.floor(rnd()*23),Math.floor(rnd()*60),g,opt);
let n=0,bad=[];const yk=new Set();
for(let i=0;i<60;i++){const a=mk('male'),b=mk('female'),r=c.BaziSuiteCore.createCompatibility(a,b,{scenarioId:'couple'}),s=r.luckSynchronization;n++;
 const cur=x=>x.dayun.find(d=>d.isCurrent);
 if((s.aCurrent&&s.aCurrent.gz)!==(cur(a)&&cur(a).gz))bad.push(['aCurrent',s.aCurrent&&s.aCurrent.gz,cur(a)&&cur(a).gz]);
 if((s.bCurrent&&s.bCurrent.gz)!==(cur(b)&&cur(b).gz))bad.push(['bCurrent']);
 for(const y of s.years){Object.keys(y).forEach(k=>yk.add(k));const g=y.gz||y.ganzhi||y.yearGz;const e=TG[((y.year-4)%10+10)%10]+DZ[((y.year-4)%12+12)%12];if(g&&g!==e)bad.push(['yearGz',y.year,g,e]);}}
console.log('compat luck sync couples',n,'mismatch',bad.length,JSON.stringify(bad.slice(0,3)),'year keys',[...yk].join(','));
const ctx={console,Intl,Date,Math,Set,Map,Object,Array,Number,JSON};ctx.globalThis=ctx;vm.createContext(ctx);
for(const f of ['vendor/astronomy-engine-2.1.19.min.js','vedic-ayanamsa.js','astro-time.js','western-engine.js','vedic-engine.js'])vm.runInContext(fs.readFileSync(path.join(root,'JS',f),'utf8'),ctx,{filename:f});
let pb=0,pn=0,gk=0,gkBad=0,ba=0,baMiss=0,baBad=0;const names={};
for(let i=0;i<300;i++){const ms=Date.UTC(1940+Math.floor(rnd()*80),Math.floor(rnd()*12),1+Math.floor(rnd()*28),Math.floor(rnd()*24),Math.floor(rnd()*60));const utc=new Date(ms).toISOString(),ref='2026-11-10T04:00:00Z';const lat=+(rnd()*100-50).toFixed(2),lon=+(rnd()*360-180).toFixed(2);
 if(i<120){const w=ctx.JYWestern.compute({utc,reference:ref,latitude:lat,longitude:lon,houseSystem:'P'});const p=w.progressions;pn++;const age=(Date.parse(ref)-ms)/864e5/365.24219;const expMs=ms+age*864e5;if(Math.abs(Date.parse(p.utc)-expMs)>2000||Math.abs(p.ageYears-age)>1e-6)pb++;}
 const v=ctx.JYVedic.compute({utc,reference:ref,latitude:lat,longitude:lon});const sg=k=>Math.floor(v.planets[k].longitude/30);
 for(const y of v.yogas){names[y.name]=(names[y.name]||0)+1;if(/Gaja Kesari/.test(y.name)){gk++;if(![0,3,6,9].includes(((sg('Jupiter')-sg('Moon'))%12+12)%12))gkBad++;}if(/Budha Aditya/.test(y.name)){ba++;if(sg('Sun')!==sg('Mercury'))baBad++;}}
 if(sg('Sun')===sg('Mercury')&&!v.yogas.some(y=>/Budha Aditya/.test(y.name)))baMiss++;}
console.log('progression timing checked',pn,'bad',pb);
console.log('GajaKesari listed',gk,'not-in-kendra',gkBad,'| BudhaAditya listed',ba,'wrong',baBad,'missed',baMiss);
console.log(JSON.stringify(names).slice(0,900));
