const c=require('../native-fixtures-20261003.cjs').environment().ctx;
const A=require((process.env.REF_DIR||'/tmp/ref/node_modules')+'/astronomy-engine');
const TG='甲乙丙丁戊己庚辛壬癸',DZ='子丑寅卯辰巳午未申酉戌亥';let seed=77;const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
let n=0,bad=[],maxAmb=0;
for(let i=0;i<160;i++){const y=1930+Math.floor(rnd()*100),k=Math.floor(rnd()*12);const target=(315+30*k)%360;
 const t0=A.SearchSunLongitude(target,new Date(Date.UTC(y,0,1)),370).date;
 for(const off of [-600,-180,-90,90,180,600]){const t=new Date(t0.getTime()+off*1000),w=new Date(t.getTime()+8*3600e3);
  const r=c.computeBazi(w.getUTCFullYear(),w.getUTCMonth()+1,w.getUTCDate(),w.getUTCHours(),w.getUTCMinutes(),'male',{second:w.getUTCSeconds(),referenceDate:'2026-11-10T04:00:00Z'});
  const mIdx=(k+(off>0?0:11))%12,expZ=DZ[(mIdx+2)%12];n++;
  if(r.pillars.month.zhi!==expZ)bad.push([w.toISOString().slice(0,19),off,r.pillars.month.zhi,expZ]);}}
console.log('boundary cases',n,'month-branch mismatches',bad.length,JSON.stringify(bad.slice(0,8)));
const by={};bad.forEach(b=>by[b[1]]=(by[b[1]]||0)+1);console.log('by offset sec',JSON.stringify(by));
console.log(String(c.calcMhTime).slice(0,1600));
