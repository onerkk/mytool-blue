'use strict';
const assert = require('node:assert/strict');
const env = require('./native-fixtures-20261003.cjs').environment();
const c = env.ctx;
['prompt-brief', 'prompt-packet'].forEach(env.load);
const referenceDate = '2026-11-17T23:21:00Z';
function exportCase(day, options = {}) {
  const chart = c.computeZiwei(1983, 8, day, 14, 'male', {minute:55, referenceDate, ...options});
  return {chart, text:c.JYPromptPacket.build('ziwei', chart, '完整命盤')};
}
const {chart,text} = exportCase(25);
assert.equal(chart.wuxingJu, 4);
for (const fact of ['金四局','生年以農曆正月初一換年','44–53虛歲/辛酉/財帛',
  '2023/癸卯/福德/41/壬戌','2026/丙午/午/44','兄弟/太陽/化忌/↓/兄弟',
  '流日（2026-11-18）：干支丙申','流時（2026-11-18 07:21）：干支壬辰','流擎羊/午',
  '2029年流月','流月按農曆月','四化表 2.6.1','願你諸事順遂。']) assert.ok(text.includes(fact),fact);
assert.doesNotMatch(text,/土五局|各數一遍|每一句都用肯定句/);
const alt = exportCase(25,{yearDivide:'exact',horoscopeDivide:'normal',ageDivide:'birthday'}).text;
assert.match(alt,/生年以立春交節瞬間換年；運限以農曆正月初一換年；農曆生日當日增虛歲/);
assert.match(alt,/2023\/癸卯\/福德\/40–41/);
console.log('PASS Ziwei engine to exported prompt, default and alternate policies');
