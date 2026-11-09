const c=require('/home/claude/mytool-blue/tests/native-fixtures-20261003.cjs').environment().ctx;const fs=require('fs');
const N=c.JYNameEngine,Y=c.JYYijingCore;
const chars=JSON.parse(fs.readFileSync('/tmp/x/chars.json','utf8'));const st={};
for(const ch of Object.keys(chars)){try{const f=N.lookup(ch,{});st[ch]=f&&f.stroke;}catch(e){st[ch]='ERR '+e.message.slice(0,30);}}
const grids={};for(const [s,g] of [['陳','弘林'],['王','明'],['歐陽','修'],['司馬','相如'],['林','志玲']]){const r=N.analyze({surname:s,given:g});grids[s+g]={strokes:r.characters.map(x=>x.stroke),nums:r.fiveGrids.grids.map(x=>x.num),el:r.fiveGrids.sanCai.elements};}
const yj=[];for(let code=0;code<64;code++){const values=Array.from({length:6},(_,i)=>(code>>i)&1?7:8);const y=Y.calculate({values,calendar:{day:'甲子',monthBranch:'寅'}});yj.push({code,number:y.original.number,name:y.original.name,full:y.original.fullName,views:y.complementaryViews,text:JSON.stringify([y.originalText,y.lines.map(l=>l.text),y.expositions])});}
fs.writeFileSync('/tmp/x/nm.json',JSON.stringify({st,grids,yj}));
console.log(JSON.stringify(yj[13].views).slice(0,400));console.log(String(c.calcMH).slice(0,700));
