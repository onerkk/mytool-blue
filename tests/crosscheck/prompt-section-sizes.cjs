const {environment,examples}=require('/home/claude/mytool-blue/tests/native-fixtures-20261003.cjs');const fs=require('fs');
const env=environment(),c=env.ctx;['tarot-foundation','prompt-brief','prompt-packet'].forEach(env.load);const x=examples(c),P=c.JYPromptPacket;
const Q=require('/home/claude/mytool-blue/tests/fixtures/question-corpus-20261023.cjs');const agg={};const tot={};
for(const m of Object.keys(x.charts)){agg[m]={};let n=0,sum=0,max=0;for(const q of Q){let b;try{b=P.build(m,x.charts[m],q);}catch(e){continue;}n++;sum+=b.length;max=Math.max(max,b.length);
  for(const s of b.split(/\n\n(?=【)/)){const t=((s.match(/^【([^】]*)】/)||[])[1]||'?').replace(/\d{4}年/g,'YYYY年').slice(0,16);(agg[m][t]=agg[m][t]||[0,0]);agg[m][t][0]+=s.length;agg[m][t][1]++;}}
 tot[m]=[n,Math.round(sum/n),max];}
for(const m of ['ziwei','vedic','astro','bazi']){console.log(m,tot[m].join('/'));console.log(Object.entries(agg[m]).map(([t,[s,k]])=>[t,Math.round(s/tot[m][0]),k]).sort((a,b)=>b[1]-a[1]).slice(0,9).map(r=>r.join(':')).join(' | '));}
console.log(Object.entries(tot).map(([m,v])=>m+' avg'+v[1]+' max'+v[2]).join(', '));
fs.writeFileSync('/tmp/x/zw_sample.txt',P.build('ziwei',x.charts.ziwei,'我跟現在的男友交往三年了，明年適合結婚嗎？他是對的人嗎？'));
