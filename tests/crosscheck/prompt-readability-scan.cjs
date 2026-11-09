const {environment,examples}=require('/home/claude/mytool-blue/tests/native-fixtures-20261003.cjs');
const env=environment(),c=env.ctx;['tarot-foundation','prompt-brief','prompt-packet'].forEach(env.load);const x=examples(c),P=c.JYPromptPacket;
const Q=require('/home/claude/mytool-blue/tests/fixtures/question-corpus-20261023.cjs');const hits={};
for(const m of Object.keys(x.charts))for(const q of Q.slice(0,50)){let b;try{b=P.build(m,x.charts[m],q);}catch(e){continue;}
 for(const s of b.split(/\n\n(?=【)/)){const t=((s.match(/^【([^】]*)】/)||[])[1]||'?').slice(0,18);if(/規則來源|一次貼上/.test(t))continue;const body=s.replace(/https?:\/\/\S+/g,'');
  const codes=[...new Set(body.match(/\b[A-Z][A-Z0-9]*_[A-Z0-9_]+\b/g)||[])];const nest=(body.match(/（[^（）]*（[^（）]*（/g)||[]).length;const q2=(body.match(/[\/；]\?(?=[\/；\n]|$)/g)||[]).length;const lower=[...new Set(body.match(/(?<![A-Za-z])[a-z]{2,}[A-Za-z]*：/g)||[])];
  if(codes.length||nest>2||q2>6||lower.length){const k=m+'｜'+t;hits[k]=hits[k]||{n:0,codes:new Set(),nest:0,q:0,lower:new Set(),len:0};const h=hits[k];h.n++;codes.forEach(z=>h.codes.add(z));lower.forEach(z=>h.lower.add(z));h.nest=Math.max(h.nest,nest);h.q=Math.max(h.q,q2);h.len=Math.max(h.len,s.length);}}}
for(const [k,h] of Object.entries(hits))console.log(k,'| n',h.n,'len',h.len,'| codes',[...h.codes].slice(0,5).join(','),'| nest',h.nest,'| ?cols',h.q,'| keys',[...h.lower].slice(0,5).join(','));
