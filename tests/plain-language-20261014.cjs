'use strict';
// Real prompt exports, separate data/wording, and novice-facing examples.
// Does not certify an external AI response or event predictions.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {environment,examples}=require('./native-fixtures-20261003.cjs');
const {ctx:c,load}=environment();['prompt-brief','prompt-packet'].forEach(load);
const f=examples(c),Q=c.JY_READING_QUALITY,W=c.JYReadingWorkflow,P=c.JYPromptPacket;
assert.equal(Q.readingVersion,'13.0.0');assert.equal(W.version,'2.2.0');
const jargon=/干支|四課|三傳|初傳|中傳|末傳|旬空|空亡|妻財|官鬼|用神|格局|四化|廟旺|體用|動爻|元素尊貴|Yoga|承接|牽制|落點|作用網|場域|金幣三|寶劍二|戰車|正義正位/;
const results=[],question='公司異性女工程師未來會跟我交往嗎？';
for(const [method,chart]of Object.entries(f.charts)){
 const before=JSON.stringify(chart),prompt=P.build(method,chart,question),record=P.get(prompt);
 assert(prompt.includes('對完全沒學過命理的人')||prompt.includes('對完全沒有學過命理的人'),method+' addresses novice readers');
 assert(prompt.includes('一般解惑正文不使用專門術語'),method+' ordinary answers use everyday words');
 assert(prompt.includes('只有原問題明確要求學原理、核盤或解釋術語時'),method+' explicit technical requests remain supported');
 assert(prompt.includes('深入分析照常完成'),method+' simplicity does not remove analysis depth');
 assert(prompt.includes('重要且有實際依據')&&prompt.includes('重要且有據'),method+' important findings retained');
 const ex=Q.narrativeExample(method);assert(ex&&ex.status==='illustrative_only');
 assert(!jargon.test(ex.text),method+' sample answer has no specialist or abstract process terms');
 assert(ex.text.length>100,method+' explanatory sample is substantive');
 assert(record&&record.readingData,method+' structured facts retained');
 assert.equal(JSON.stringify(chart),before,method+' chart and cards unchanged');
 assert(prompt.endsWith(W.footer),method+' intentional shop ending preserved');
 results.push({method,status:'passed',sampleCharacters:ex.text.length,sampleJargonMatches:0,originalDataUnchanged:true,promptCharacters:prompt.length});
}
assert.equal(results.length,15);
assert.equal(Q.lines('bazi')[1],Q.truthPolicy(),'legacy truth slot remains stable');
const broad=W.render({method:'ziwei',question:'完整解說十二宮與所有大限逐年流年'});
assert(broad.includes('【全盤作答覆蓋】')&&broad.includes('【逐年／逐期作答覆蓋】'));
assert(W.render({method:'ootk',question}).includes('完整36張環牌故事'),'all effective OOTK content remains covered');
c.JY_READING_QUALITY=undefined;c.JYPromptPacket=undefined;load('liuren-prompt');
const fallback=c.JYLiurenPrompt.build(f.l);
assert(fallback.includes('一般解惑正文不使用專門術語')&&fallback.includes('這項合作有開始談的可能'),'standalone Liuren has the new policy and everyday example');
c.JY_READING_QUALITY=Q;c.JYPromptPacket=P;
const old={...Q,version:'5.1.0',readingVersion:'12.0.0',methodLines:()=>['STALE_JARGON_GUIDE'],recommendationEnding:()=> 'STALE_JARGON_CLOSE'};
c.JY_READING_QUALITY=old;const mixed=P.build('liuren',f.l,question);
assert(!mixed.includes('STALE_JARGON_GUIDE')&&!mixed.includes('STALE_JARGON_CLOSE'));c.JY_READING_QUALITY=Q;
const api=fs.readFileSync(path.join(__dirname,'../functions/api/ai.js'),'utf8'),worker=fs.readFileSync(path.join(__dirname,'../workers/ai-proxy.js'),'utf8');
assert(api.includes('answer、action、timing、honest_word 都不用專門術語'));
assert(worker.includes(api.trimEnd()),'standalone Worker contains the same complete API source');
const report={release:'20261014plain22',status:'passed',methods:results,fallback:'passed',mixedCachedGuide:'passed',fullAnnualAndOOTKCoverage:'passed',apiAndWorker:'passed',scope:'Actual local prompt exports, original data and original sample prose. External AI prose compliance and prediction accuracy not certified.'};
if(process.env.JY_PLAIN_REPORT)fs.writeFileSync(process.env.JY_PLAIN_REPORT,JSON.stringify(report,null,2)+'\n');
console.log('Plain language: 15 real exports, jargon-free examples, original facts, fallback, API/Worker and coverage passed.');
