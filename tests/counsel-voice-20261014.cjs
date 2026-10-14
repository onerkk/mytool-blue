'use strict';
// Verify real exported prompts and fallback copies, not model-generated prose.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {environment,examples}=require('./native-fixtures-20261003.cjs');
const {ctx:c,load}=environment();
['prompt-brief','prompt-packet'].forEach(load);
const fixture=examples(c),Q=c.JY_READING_QUALITY,W=c.JYReadingWorkflow,P=c.JYPromptPacket,results=[];
const root=path.resolve(__dirname,'..');
const q='今年公司女性工程師會愛上我並跟我有親密接觸嗎？';
assert.equal(Q.readingVersion,'13.0.0');assert.equal(W.version,'2.2.0');
for(const [method,chart]of Object.entries(fixture.charts)){
 const before=JSON.stringify(chart),text=P.build(method,chart,q),record=P.get(text);
 assert(text.includes('命理師當面解惑')||text.includes('像命理師當面解惑'),method+' natural counseling voice');
 assert(text.includes('重要且有')&&text.includes('即使'),method+' proactively reads important supported findings');
 assert(text.includes('不是正文目錄')||text.includes('不是成稿目錄'),method+' technical ledgers are not the response outline');
 assert(text.includes('原句複合結果核對')&&text.includes('愛上')&&text.includes('親密接觸'),method+' distinguishes feeling from contact');
 assert(text.includes('親密接觸不自動等於性交'),method+' retains actual wording without sexual-act escalation');
 assert(text.includes('日數除以7換算週數'),method+' duration unit check reaches actual export');
 assert(!text.includes('逐子題交代主判、作用如何傳到結果、最強支持與反證、成立条件、時間及行動'),method+' old report-style brief removed');
 assert(text.endsWith(W.footer),method+' intentional shop close preserved');
 assert(record&&record.readingData,method+' original structured record retained');
 assert.equal(JSON.stringify(chart),before,method+' no chart or card mutation');
 assert(Q.methodLines(method).join('\n').includes('【本法重要發現與解惑方式】'),method+' has its own important-finding scope');
 results.push({method,status:'passed',characters:text.length,originalDataUnchanged:true});
}
assert.equal(results.length,15,'all actual native method exporters checked');
const withQuality=W.render({method:'liuren',question:q});
c.JY_READING_QUALITY=undefined;
const fallback=W.render({method:'liuren',question:q});
for(const text of [withQuality,fallback]){
 assert(text.includes('【解惑的成稿方式】'));assert(text.includes('【重要發現主動提醒】'));
 assert(text.includes('【本法重要發現與解惑方式】'));assert(text.includes('此核對不改原句、牌序或角色'));
}
c.JY_READING_QUALITY=Q;
const staleGuide={...Q,version:'4.9.0',readingVersion:'10.0.0',recommendationEnding:()=> 'STALE_REPORT_ENDING'};
c.JY_READING_QUALITY=staleGuide;
assert(!P.build('liuren',fixture.l,q).includes('STALE_REPORT_ENDING'),'cached previous closing cannot override the new authoring check');
c.JY_READING_QUALITY=undefined;c.JYPromptPacket=undefined;load('liuren-prompt');
const bare=c.JYLiurenPrompt.build(fixture.l);
assert(bare.includes('【解惑的成稿方式】')&&bare.includes('【本法重要發現與解惑方式】'),'standalone Liuren keeps the canonical voice without the shared quality or packet');
c.JY_READING_QUALITY=Q;c.JYPromptPacket=P;
assert(!W.render({method:'tarot',question:'如果她愛上我並有親密接觸，我該怎麼辦？'}).includes('【原句複合結果核對】'),'hypothetical advice is not promoted to an occurrence query');
const scope=W.reportScope('今年感情怎麼發展？','bazi');assert.equal(scope.fullChart,false,'important reminders do not silently request a full lifetime reading');
const broad=W.render({method:'ziwei',question:'完整分析十二宮與所有大限逐年流年'});
assert(broad.includes('【全盤作答覆蓋】')&&broad.includes('【逐年／逐期作答覆蓋】'),'explicit full and annual requests keep complete coverage');
const qualityPath=path.join(root,'JS/reading-quality.js');
assert(fs.readFileSync(qualityPath,'utf8').includes("var READING_VERSION='13.0.0'"));
const report={version:'20261014plain22',actualMethods:15,results,fallbackWithoutSharedGuide:'passed',compoundQuestion:'passed',hypotheticalNegativeControl:'passed',fullAndAnnualCoverage:'passed',scope:'Actual local builders and unchanged chart fixtures. External AI prose compliance and prediction accuracy are not certified.'};
if(process.env.JY_COUNSEL_REPORT)fs.writeFileSync(process.env.JY_COUNSEL_REPORT,JSON.stringify(report,null,2)+'\n');
console.log('Counsel voice: all 15 real method exports, fallback, compound question and full/annual coverage passed.');
