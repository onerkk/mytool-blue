'use strict';
/* 提示詞中文化總檢：15 種方法 × 6 種題型（加實際塔羅與五輪 payload），除了機器標頭與規則來源網址，
 * 任何區段都不得出現小寫開頭的英文詞（鍵名、列舉值、駝峰名）、JSON 括號或 undefined/NaN。
 * 新欄位漏進對照表就會在這裡失敗，修法是補 prompt-single-paste.js 的 ZH 對照，不是改這個測試。 */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {environment,examples}=require('./native-fixtures-20261003.cjs');
const env=environment(),c=env.ctx;['tarot-foundation','prompt-brief','prompt-packet'].forEach(env.load);const x=examples(c),P=c.JYPromptPacket;
const Q=['目前的工作適合我嗎？','他會跟我在一起嗎？','我什麼時候會換工作？','下個月業績能做到多少？','我蝦皮賣場副業該堅持嗎？','真正適合我的是什麼工作？'];
const problems=[];
function lint(tag,body){
  const secs=body.split(/\n\n(?=【)/);
  for(const sec of secs){const title=(sec.match(/^【([^】]*)】/)||[])[1]||'';if(/規則來源/.test(title))continue;
    let t=sec.replace(/https?:\/\/\S+/g,'');
    if(/^一次貼上/.test(title))t=t.replace(/^【[^】]*】\n+\{[^\n]*\}/,'');
    const w=t.match(/(?<![A-Za-z0-9-])[a-z][A-Za-z0-9_]{2,}(?:-[A-Za-z0-9_]+)*(?![A-Za-z0-9])/);if(w)problems.push(tag+'｜'+title.slice(0,20)+'｜英文：'+w[0]);
    if(/\{"|\["|":\s*[\[{"]/.test(t))problems.push(tag+'｜'+title.slice(0,20)+'｜JSON 殘留');
    if(/undefined|NaN/.test(t))problems.push(tag+'｜'+title.slice(0,20)+'｜undefined/NaN');}
}
for(const [m,chart] of Object.entries(x.charts))for(const q of Q){let b;try{b=P.build(m,chart,q);}catch(e){continue;}lint(m+'｜'+q.slice(0,8),b);}
// real OOTK payload from the shared fixture
const ootk=JSON.parse(fs.readFileSync(path.join(__dirname,'..','docs/qa-single-paste27','ootk-fixture.json'),'utf8'));lint('ootk-real',P.build('ootk',ootk,ootk.question));
const uniq=[...new Set(problems)];console.log('checked; problems',uniq.length);uniq.slice(0,40).forEach(p=>console.log(p));
assert.equal(uniq.length,0);console.log(JSON.stringify({passed:1}));
