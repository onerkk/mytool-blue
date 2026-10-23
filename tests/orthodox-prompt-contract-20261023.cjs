'use strict';
/* 正統解讀契約：50 種問法 × 15 種方法，每份提示詞都要有「本法正統取法」，規則只剩三條（口吻、正統推演、誠實與安全），
 * 不得出現站內自訂的焦點層、邊界層或題型限制句，資料全中文、無 JSON、無 undefined。 */
const assert=require('assert/strict');const {environment,examples}=require('./native-fixtures-20261003.cjs');
const env=environment(),c=env.ctx;['tarot-foundation','prompt-brief','prompt-packet'].forEach(env.load);const x=examples(c),P=c.JYPromptPacket;
const Q=require('./fixtures/question-corpus-20261023.cjs');const bad=[];let n=0;
const FORBIDDEN=/本題焦點|本題邊界|能回答：|不能做：|量化題|看不到命定|不斷定某個人|沒問時間|回看資料|五輪時間規則|答案以這張為準|吉凶傾向/;
for(const q of Q)for(const [m,chart] of Object.entries(x.charts)){let b;try{b=P.build(m,chart,q);}catch(e){if(/超過單次貼上預算/.test(e.message))continue;bad.push(m+'｜'+q+'｜build '+e.message.slice(0,40));continue;}n++;
  if(!/【本法正統取法（[^）]+）】\n依/.test(b))bad.push(m+'｜'+q+'｜no orthodox procedure');
  const rules=(b.split('【解讀與查證規則】\n')[1]||'').split('\n\n【')[0].split('\n');if(rules.length!==3)bad.push(m+'｜rules '+rules.length);
  const f=b.match(FORBIDDEN);if(f)bad.push(m+'｜'+q+'｜site rule present: '+f[0]);
  const t=b.replace(/https?:\/\/\S+/g,'').replace(/^【[^】]*】\n+\{[^\n]*\}/,'').split(/\n\n(?=【)/).filter(s=>!/^【規則來源/.test(s)).join('\n');
  const w=t.match(/(?<![A-Za-z0-9-])[a-z][A-Za-z0-9_]{2,}(?:-[A-Za-z0-9_]+)*(?![A-Za-z0-9])/);if(w)bad.push(m+'｜'+q+'｜english '+w[0]);
  if(/\{"|\["/.test(t))bad.push(m+'｜'+q+'｜JSON');if(/undefined|NaN/.test(t))bad.push(m+'｜'+q+'｜undefined');}
console.log('builds',n,'problems',bad.length);bad.slice(0,15).forEach(x=>console.log(x));assert.equal(bad.length,0);console.log(JSON.stringify({passed:1}));
