'use strict';
const assert = require('node:assert/strict');
const env = require('./native-fixtures-20261003.cjs').environment();
const c = env.ctx;
['prompt-brief','prompt-packet'].forEach(env.load);
const longitude = 120.227;
const t = c.calcTrueSolarTime(1983,8,25,14,55,longitude,8,'Asia/Taipei');
const chart = c.computeBazi(t.year,t.month,t.day,t.hour,t.minute,'male',{
  longitude, second:t.second, birthInstant:t.utcTimestamp, trueSolarTimeApplied:true,
  timezoneId:'Asia/Taipei', timezoneOffset:8, dayBoundaryMode:'ZI_HOUR_23',
  referenceDate:'2026-11-17T23:35:14Z'
});
c.enhanceBazi(chart);
const prompt = c.JYPromptPacket.build('bazi',chart,'請完整分析本命與所問時段');
for(const fact of ['日柱/乙酉/日主','木 1/1.9','火 0/0.6','土 1/1.3','金 3/3','水 3/3.6',
  '比肩 0/0.3','偏印 2/2','半會金：月柱申、日柱酉，間距1，貼鄰',
  '間距3，中隔月柱申、日柱酉','2019年（丁巳運','2019年（丙辰運',
  '2029/丙辰/己酉','2029/乙卯/己酉','時支丁食神（藏，中氣）','願你諸事順遂。']){
  assert.ok(prompt.includes(fact),fact);
}
assert.doesNotMatch(prompt,/各數一遍|透干比肩，藏干辛七殺|每一句都用肯定句/);
console.log('PASS Bazi structure, split years and paste output', t.trueSolarDateTime, chart.qiyun.startAgeText,chart.qiyun.startUtc8);
