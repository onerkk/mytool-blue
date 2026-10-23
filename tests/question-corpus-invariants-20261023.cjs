'use strict';
/* 語料不變量：50 種問法 × 15 種方法，每一組都必須：有焦點段、有完整無條件邊界（能回答／不能做，含存在、心意、金額、命定或時間）、
 * 沒有英文鍵名或 JSON、沒有 undefined/NaN、沒在非時間題附取時方法。題型沒被認出來時，保證也照樣成立。 */
const assert=require('assert/strict');const {environment,examples}=require('./native-fixtures-20261003.cjs');
const env=environment(),c=env.ctx;['tarot-foundation','prompt-brief','prompt-packet'].forEach(env.load);const x=examples(c),P=c.JYPromptPacket;
const Q=require('./fixtures/question-corpus-20261023.cjs');const prof=require('../JS/shared/question-profile.js').jyQuestionProfile;
const natal=new Set(['bazi','ziwei','vedic','astro','compat']);const bad=[];let n=0,unrecognized=0;
for(const q of Q){const pf=prof(q);if(pf.domain==='general'&&!Object.values(pf.asks).some(Boolean))unrecognized++;
  for(const [m,chart] of Object.entries(x.charts)){let body;try{body=P.build(m,chart,q);}catch(e){if(/超過單次貼上預算/.test(e.message))continue;bad.push(m+'｜'+q+'｜build: '+e.message.slice(0,40));continue;}n++;
    const i=body.indexOf('【本題焦點');if(i<0){bad.push(m+'｜'+q+'｜no focus');continue;}const f=body.slice(i,body.indexOf('\n\n【',i+5));
    const B=(f.split('\n').find(l=>l.startsWith('【本題邊界】'))||'');
    for(const must of ['這個方法能回答','不斷定某個人存不存在','不給金額、次數或百分比','不保證事件一定發生'])if(!B.includes(must))bad.push(m+'｜'+q+'｜missing '+must);
    if(!natal.has(m)&&!B.includes('看不到命定的事'))bad.push(m+'｜'+q+'｜missing destiny boundary');
    if(!pf.asks.timing&&B.includes('原題問時間'))bad.push(m+'｜'+q+'｜timing technique without timing question');
    const t=body.replace(/https?:\/\/\S+/g,'').replace(/^【[^】]*】\n+\{[^\n]*\}/,'').split(/\n\n(?=【)/).filter(s=>!/^【規則來源/.test(s)).join('\n');
    const w=t.match(/(?<![A-Za-z0-9-])[a-z][A-Za-z0-9_]{2,}(?:-[A-Za-z0-9_]+)*(?![A-Za-z0-9])/);if(w)bad.push(m+'｜'+q+'｜english '+w[0]);
    if(/undefined|NaN/.test(t))bad.push(m+'｜'+q+'｜undefined/NaN');}}
console.log('builds',n,'questions not recognized by any type',unrecognized+'/'+Q.length,'problems',bad.length);bad.slice(0,20).forEach(b=>console.log(b));
assert.equal(bad.length,0);console.log(JSON.stringify({passed:1}));
