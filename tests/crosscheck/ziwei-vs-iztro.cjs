const c=require('../native-fixtures-20261003.cjs').environment().ctx;
const {astro}=require((process.env.REF_DIR||'/tmp/ref/node_modules')+'/iztro');
astro.config({yearDivide:'normal',horoscopeDivide:'normal',ageDivide:'normal',dayDivide:'current',algorithm:'default'});
const DZ='子丑寅卯辰巳午未申酉戌亥';
let seed=20261110;const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
const alias={'截路':'截空','空亡':'副截'};const alias2={'截路':'副截','空亡':'截空'};
const diff={};let n=0,fail=0;const ex={};
const note=(k,info)=>{diff[k]=(diff[k]||0)+1;if(!ex[k])ex[k]=info;};
for(let i=0;i<4000;i++){
 const y=1930+Math.floor(rnd()*101),m=1+Math.floor(rnd()*12),d=1+Math.floor(rnd()*28),h=Math.floor(rnd()*24),g=rnd()<.5?'male':'female';
 const z=c.computeZiwei(y,m,d,h,g,{minute:30,referenceDate:'2026-10-01T04:00:00Z'});
 const ti=h===23?12:Math.floor((h+1)/2);
 let a;try{a=astro.bySolar(`${y}-${m}-${d}`,ti,g==='male'?'男':'女',true,'zh-TW');}catch(e){note('iztro-throw',e.message);continue;}
 n++;const id=`${y}-${m}-${d} ${h}h ${g}`;let bad=false;const N=(k,info)=>{bad=true;note(k,id+' '+info);};
 if(!z){N('site-null',c._jyZiweiError);fail++;continue;}
 const ming=z.palaces.find(p=>p.isMing).branch, am=a.palaces.find(p=>p.name==='命宮').earthlyBranch;
 if(ming!==am)N('ming',ming+' vs '+am);
 const sh=z.palaces.find(p=>p.isShen).branch, as=a.palaces.find(p=>p.isBodyPalace).earthlyBranch; if(sh!==as)N('shen',sh+' vs '+as);
 if('二三四五六'['23456'.indexOf(String(z.wuxingJu))]!==a.fiveElementsClass[1])N('ju',JSON.stringify(z.wuxingJu)+' vs '+a.fiveElementsClass);
 if(z.mingZhu!==a.soul)N('soul',z.mingZhu+' vs '+a.soul); if(z.shenZhu!==a.body)N('body',z.shenZhu+' vs '+a.body);
 for(const p of a.palaces){const q=z.palaces.find(x=>x.branch===p.earthlyBranch);
  if(q.gan!==p.heavenlyStem)N('gan',p.earthlyBranch);
  if(q.changsheng!==p.changsheng12)N('changsheng',q.changsheng+' vs '+p.changsheng12);
  if(q.boshi12!==p.boshi12)N('boshi',q.boshi12+' vs '+p.boshi12);
  const names=q.stars.map(s=>s.name);
  for(const s of [...p.majorStars,...p.minorStars,...p.adjectiveStars]){const nm=alias[s.name]||s.name;
    if(alias2[s.name]&&names.includes(alias2[s.name]))continue;if(!names.includes(nm)&&!names.includes(s.name))N('star-missing:'+s.name,p.earthlyBranch+' has '+names.join(','));
    else{const qs=q.stars.find(x=>x.name===nm||x.name===s.name);const hu=(qs.hua||'').replace('化','');if((s.mutagen||'')!==hu)N('hua:'+s.name,hu+' vs '+s.mutagen);
     if(s.brightness&&typeof c.getStarBright==='function'){const b=c.getStarBright(qs.name,DZ.indexOf(q.branch));const lb=b&&b.label||'';if(lb&&lb[0]!==s.brightness[0])N('bright:'+s.name,q.branch+' '+lb+' vs '+s.brightness);if(!lb)N('bright-missing:'+s.name,q.branch+' vs '+s.brightness);}}
  }
  const izn=[...p.majorStars,...p.minorStars].map(s=>s.name);
  for(const s of q.stars.filter(x=>x.type==='major'))if(!izn.includes(s.name))N('star-extra:'+s.name,p.earthlyBranch);
  const dx=z.daXian.find(x=>x.branch===p.earthlyBranch);if(!dx||dx.ageStart!==p.decadal.range[0]||dx.ageEnd!==p.decadal.range[1])N('daxian',p.earthlyBranch+' '+(dx&&dx.ageStart)+' vs '+p.decadal.range[0]);
 }
 if(bad)fail++;
}
console.log('cases',n,'with-diff',fail);
for(const k of Object.keys(diff).sort((a,b)=>diff[b]-diff[a]).slice(0,40))console.log(diff[k],k,'|',String(ex[k]).slice(0,160));
