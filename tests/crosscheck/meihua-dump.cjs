const path=require('path');const ROOT=process.env.JY_ROOT||'/home/claude/mytool-blue';
const c=require(path.join(ROOT,'tests/native-fixtures-20261003.cjs')).environment().ctx;const fs=require('fs');
const out=[];const slim=o=>o&&typeof o==='object'?Object.fromEntries(Object.entries(o).filter(([k,v])=>typeof v!=='object'||Array.isArray(v)).map(([k,v])=>[k,Array.isArray(v)?v.slice(0,8):v])):o;
for(let u=1;u<=8;u++)for(let l=1;l<=8;l++)for(let d=1;d<=6;d++){const m=c.calcMH(u,l,d);out.push({u,l,d,up:slim(m.up),lo:slim(m.lo),ben:slim(m.ben),hu:slim(m.hu),bian:slim(m.bian),ti:m.tiG&&m.tiG.name||m.tiG&&m.tiG.n,yo:m.yoG&&(m.yoG.name||m.yoG.n),ty:slim(m.ty)||m.ty,nuc:slim(m.nuclear)});}
fs.writeFileSync('/tmp/x/mh.json',JSON.stringify(out));console.log(JSON.stringify(out[7]).slice(0,1800));
fs.writeFileSync('/tmp/x/yjj.json',JSON.stringify(c.JYYijingData.entries.map(e=>({number:e.number,name:e.name,judgment:e.judgment}))));
