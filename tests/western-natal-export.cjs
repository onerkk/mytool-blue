'use strict';
const assert = require('node:assert/strict');
const env = require('./native-fixtures-20261003.cjs').environment();
const c = env.ctx;
['prompt-brief','prompt-packet'].forEach(env.load);
const input = {utc:'1983-08-25T06:55:00Z', reference:'2026-11-18T04:00:00Z',
  latitude:22.9999, longitude:120.2269, houseSystem:'P',
  civil:{date:'1983-08-25',time:'14:55',timezone:'Asia/Taipei'}};
const chart = c.JYWestern.compute(input);
const text = c.JYPromptPacket.build('astro',chart,'請完整分析本次星盤');
for (const fact of ['太陽在處女第8宮','月亮在雙魚第3宮','上升摩羯座','命主星土星在天蠍第10宮',
  '火4、土3、風1、水2','基本1、固定2、變動7','第8宮×2、第10宮×2、第11宮×2',
  '月亮四分相交點軸','水星四分相海王星','太陽合相金星','行運星／本命點','願你諸事順遂。']) assert.ok(text.includes(fact),fact);
assert.doesNotMatch(text,/各數一遍|每一句都用肯定句/);
const minutes = [[151,31],[349,49],[177,59],[151,22],[127,27],[242,9],[210,4],[245,7],[266,31],[207,22]];
c.JYWestern.KEYS.forEach((key,i)=>assert.ok(Math.abs(chart.planets[key].longitude-(minutes[i][0]+minutes[i][1]/60))<1/60,key));
assert.ok(Math.abs(chart.houses.angles.ASC-(275+53/60))<1/60);
assert.ok(Math.abs(chart.houses.angles.MC-(198+23/60))<1/60);
const unknown=c.JYWestern.compute({...input,unknownTime:true});
const provisional=c.JYPromptPacket.build('astro',unknown,'完整星盤');
assert.ok(provisional.includes('宮位與四角未定'));
assert.ok(!provisional.includes('命主星土星在天蠍第10宮'));
console.log('PASS Tainan natal export and unknown birth time');
