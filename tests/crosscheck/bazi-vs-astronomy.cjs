const c=require('../native-fixtures-20261003.cjs').environment().ctx;
const A=require((process.env.REF_DIR||'/tmp/ref/node_modules')+'/astronomy-engine');
const TG='甲乙丙丁戊己庚辛壬癸',DZ='子丑寅卯辰巳午未申酉戌亥';
let seed=7;const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
const jdn=(y,m,d)=>{const a=Math.floor((14-m)/12),yy=y+4800-a,mm=m+12*a-3;return d+Math.floor((153*mm+2)/5)+365*yy+Math.floor(yy/4)-Math.floor(yy/100)+Math.floor(yy/400)-32045;};
const sunLon=t=>A.SunPosition(t).elon;
function termNear(t,dir){ // nearest 節 (lon ≡ 15 mod 30) before(dir=-1)/after(+1)
  const lon=sunLon(t);let k=Math.floor((lon-15)/30);let target=dir>0?(k+1)*30+15:k*30+15;target=((target%360)+360)%360;
  const start=new Date(t.getTime()+(dir>0?0:-33*864e5));const r=A.SearchSunLongitude(target,start,34);return r.date;}
const diff={},ex={};const note=(k,i)=>{diff[k]=(diff[k]||0)+1;if(!ex[k])ex[k]=i;};
let n=0,near=0,qn=0,maxq=0;
for(let i=0;i<1500;i++){
 const y=1925+Math.floor(rnd()*110),m=1+Math.floor(rnd()*12),d=1+Math.floor(rnd()*28),h=Math.floor(rnd()*23),mi=Math.floor(rnd()*60),g=rnd()<.5?'male':'female';
 const t=new Date(Date.UTC(y,m-1,d,h-8,mi));const lon=sunLon(t);
 const dist=Math.min(((lon-15)%30+30)%30,30-((lon-15)%30+30)%30); if(dist<0.003){near++;continue;} // within ~4 min of a 節
 let by=y;if(m<=2&&lon>=270&&lon<315)by=y-1;
 const yg=((by-4)%10+10)%10,yz=((by-4)%12+12)%12;
 const mIdx=Math.floor((((lon-315)%360+360)%360)/30);const mz=(mIdx+2)%12,mg=((yg%5)*2+2+mIdx)%10;
 const di=(jdn(y,m,d)+49)%60,dg=di%10,dz=di%12;const hz=Math.floor((h+1)/2)%12,hg=((dg%5)*2+hz)%10;
 const exp=TG[yg]+DZ[yz]+' '+TG[mg]+DZ[mz]+' '+TG[dg]+DZ[dz]+' '+TG[hg]+DZ[hz];
 let r;try{r=c.computeBazi(y,m,d,h,mi,g,{});}catch(e){note('throw',e.message);continue;}
 if(!r||!r.pillars){note('null',`${y}-${m}-${d} ${h}:${mi}`);continue;}
 const p=r.pillars,got=['year','month','day','hour'].map(k=>p[k].gan+p[k].zhi).join(' ');n++;
 if(got!==exp)note('pillars',`${y}-${m}-${d} ${h}:${mi} got ${got} exp ${exp}`);
 // 起運
 const fwd=(yg%2===0)===(g==='male');const term=termNear(t,fwd?1:-1);const days=Math.abs(term-t)/864e5;const expY=days/3;
 const tx=r.dayun&&r.dayun[0]&&r.dayun[0].ageEndText||'';const mm=tx.match(/(?:(\d+)歲)?(?:(\d+)月)?(?:(\d+)日)?(?:(\d+)時)?/);
 if(!mm||!mm[0]){note('qiyun-format',tx+' '+JSON.stringify(r.qiyun).slice(0,120));continue;}
 const gotY=(+(mm[1]||0))+(+(mm[2]||0))/12+(+(mm[3]||0))/360+(+(mm[4]||0))/8640;qn++;const dq=Math.abs(gotY-expY);maxq=Math.max(maxq,dq);
 if(dq>0.02)note('qiyun',`${y}-${m}-${d} ${h}:${mi} ${g} got ${tx} exp ${expY.toFixed(3)}y`);
 // 大運 first pillar
 const d1=r.dayun.find(x=>x.gz&&x.gz!=='小運');const mi60=(()=>{for(let k=0;k<60;k++)if(k%10===mg&&k%12===mz)return k;})();const e1=(mi60+(fwd?1:-1)+60)%60;
 if(d1&&d1.gz!==TG[e1%10]+DZ[e1%12])note('dayun1',`${y}-${m}-${d} ${g} got ${d1.gz} exp ${TG[e1%10]+DZ[e1%12]}`);
}
console.log('bazi cases',n,'skipped-near-term',near,'qiyun-checked',qn,'max-qiyun-diff-years',maxq.toFixed(4));
for(const k in diff)console.log(diff[k],k,'|',String(ex[k]).slice(0,200));
