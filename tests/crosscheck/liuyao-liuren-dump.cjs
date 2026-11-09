const path=require('path');const ROOT=process.env.JY_ROOT||path.resolve(__dirname,'../..');
const c=require(path.join(ROOT,'tests/native-fixtures-20261003.cjs')).environment().ctx;const fs=require('fs');
const G='甲乙丙丁戊己庚辛壬癸',Z='子丑寅卯辰巳午未申酉戌亥';
const Y=c.JYLiuyaoCore,L=c.JYLiurenCore;const ly=[];
for(let code=0;code<64;code++)for(const day of ['甲子','丙戌','戊申','己未','庚午','壬辰','乙亥','癸卯']){
 const values=Array.from({length:6},(_,i)=>(code>>i)&1?7:8);const r=Y.calculate({values,calendar:{day,monthBranch:'寅'}});
 if(code===0&&day==='甲子')console.log(Object.keys(r).join(','),JSON.stringify(r.original&&r.original.palace),JSON.stringify(r.calendar||r.date||{}).slice(0,200));
 const o=r.original||r.hexagram;ly.push({code,day,palace:o.palace,name:o.fullName,voids:(r.calendar||r.date||{}).voidBranches,lines:r.lines.map(l=>[l.stem,l.branch,l.relative,l.role,l.spirit,l.hidden?[l.hidden.stem,l.hidden.branch,l.hidden.relative]:null])});}
const lr=[];
for(let i=0;i<60;i++)for(let h=0;h<12;h++){const row={day:G[i%10]+Z[i%12],hour:Z[h]};
 for(const m of ['day','night']){const r=L.chartFromSymbols({dayGan:G[i%10],dayZhi:Z[i%12],monthGeneral:'亥',hourBranch:Z[h],nobleMode:m});
  row.tr=r.transmissions.map(t=>t.branch);row.courses=r.courses.map(x=>x.upper);row.plate=Object.fromEntries(r.plate.map(p=>[p.earth,p.sky]));row['gen_'+m]=Object.fromEntries(r.plate.map(p=>[p.earth,p.generalShort]));row.empty=r.xun.empty;row.type=r.method.type;row.gate=r.method.gate;}
 lr.push(row);}
fs.writeFileSync('/tmp/x/dump.json',JSON.stringify({ly,lr}));console.log('ly',ly.length,'lr',lr.length,JSON.stringify(lr[0]).slice(0,500));
