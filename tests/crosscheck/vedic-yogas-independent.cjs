const fs=require('fs'),vm=require('vm'),path=require('path');const root=process.env.JY_ROOT||'/home/claude/mytool-blue';
const ctx={console,Intl,Date,Math,Set,Map,Object,Array,Number,JSON};ctx.globalThis=ctx;vm.createContext(ctx);
for(const f of ['vendor/astronomy-engine-2.1.19.min.js','vedic-ayanamsa.js','astro-time.js','vedic-engine.js'])vm.runInContext(fs.readFileSync(path.join(root,'JS',f),'utf8'),ctx,{filename:f});
let seed=2024;const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
const L=['Mars','Venus','Mercury','Moon','Sun','Mercury','Venus','Mars','Jupiter','Saturn','Saturn','Jupiter'],EX={Sun:0,Moon:1,Mars:9,Mercury:5,Jupiter:3,Venus:11,Saturn:6};
const five=['Mars','Mercury','Jupiter','Venus','Saturn'],MP={Mars:'Ruchaka',Mercury:'Bhadra',Jupiter:'Hamsa',Venus:'Malavya',Saturn:'Sasa'};
const st={};const B=(k,ok,info)=>{st[k]=st[k]||{n:0,bad:0,ex:null};st[k].n++;if(!ok){st[k].bad++;st[k].ex=st[k].ex||info;}};
for(let i=0;i<500;i++){const ms=Date.UTC(1940+Math.floor(rnd()*80),Math.floor(rnd()*12),1+Math.floor(rnd()*28),Math.floor(rnd()*24),Math.floor(rnd()*60));const utc=new Date(ms).toISOString();
 const v=ctx.JYVedic.compute({utc,reference:'2026-11-10T04:00:00Z',latitude:+(rnd()*100-50).toFixed(2),longitude:+(rnd()*360-180).toFixed(2)});
 const s=k=>Math.floor(v.planets[k].longitude/30),asc=v.lagna.sign,rel=(a,b)=>((a-b)%12+12)%12+1,has=re=>v.yogas.some(y=>re.test(y.name));
 for(const p of five){const own=L[s(p)]===p||EX[p]===s(p),kl=[1,4,7,10].includes(rel(s(p),asc)),km=[1,4,7,10].includes(rel(s(p),s('Moon')));const listed=has(new RegExp('^'+MP[p]));
  B('Mahapurusha '+MP[p]+' (lagna kendra)',listed===(own&&kl),[utc,p,'own/exalt',own,'kendraLagna',kl,'kendraMoon',km,'listed',listed]);}
 const in2=five.filter(p=>rel(s(p),s('Moon'))===2).length>0,in12=five.filter(p=>rel(s(p),s('Moon'))===12).length>0;
 B('Sunaphaa',has(/^Sunaphaa/)===(in2&&!in12),[utc,in2,in12]);B('Anaphaa',has(/^Anaphaa/)===(in12&&!in2),[utc,in2,in12]);B('Duradhara',has(/^Duradhara/)===(in2&&in12),[utc,in2,in12]);
 if(has(/^Kemadruma/))B('Kemadruma (necessary: none in 2/12 from Moon)',!in2&&!in12,[utc,in2,in12]);
 const s2=five.filter(p=>rel(s(p),s('Sun'))===2).length>0,s12=five.filter(p=>rel(s(p),s('Sun'))===12).length>0;
 const ves=has(/^Vesi/),vos=has(/^Vosi/),ubh=has(/^Ubhayachara/);
 B('Vesi/Vosi/Ubhayachara A(exclusive)',ves===(s2&&!s12)&&vos===(s12&&!s2)&&ubh===(s2&&s12),[utc,s2,s12,ves,vos,ubh]);
 B('Vesi/Vosi/Ubhayachara B(inclusive)',ves===s2&&vos===s12&&ubh===(s2&&s12),[utc,s2,s12,ves,vos,ubh]);
 B('Chandra Mangala',has(/^Chandra Mangala/)===(s('Moon')===s('Mars')),[utc]);
 const seven=['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn'];let pv=false;for(const a of seven)for(const b of seven)if(a<b&&L[s(a)]===b&&L[s(b)]===a)pv=true;
 B('Parivartana',has(/^Parivartana/)===pv,[utc,pv]);}
for(const [k,x] of Object.entries(st))console.log(k.padEnd(46),'n',x.n,'bad',x.bad,x.bad?JSON.stringify(x.ex):'');
