'use strict';
// 回歸：真實介面送出的合盤資料（八字雙向 117KB＋紫微雙向 213KB）必須能產生單則提示詞。
// 10/15 起夾具只有真實資料的五分之一，導致合盤在真實操作下 100% 被「超過預算」擋下而測試全綠。
const assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs');
const root=path.resolve(__dirname,'..');
const {environment}=require('./native-fixtures-20261003.cjs');
const env=environment(),c=env.ctx;['tarot-foundation','prompt-brief','prompt-packet'].forEach(env.load);
const cap=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures/compat-real-ui-20261021.json'),'utf8'));
assert(JSON.stringify(cap.list[1].chart).length>150000,'fixture must stay real-size');
const text=c.JYPromptPacket.buildMany(cap.list,cap.q),meta=c.JYSinglePaste.get(text);
assert(meta,'compiled packet');assert(meta.characters<=12000&&meta.utf8Bytes<=28000);
for(const k of ['紫微甲方本命','紫微乙方本命','紫微宮位疊合','紫微跨盤四化投射・題目主宮','跨盤天干作用','跨盤地支作用','同步運限（目前起三年）','雙向十神'])assert(text.includes(k),k);
assert(/夫妻\/亥\/癸\/[^\n]*破軍[^\n]*祿/.test(text),'palace rows carry brightness and natal transformation');
assert(!text.includes('"yearGanZhi":""'),'no empty summary line');
assert(!(meta.notExpanded>0)||text.includes('【未展開細表】'),'omitted optional blocks are receipted when any are omitted');
assert.equal(text.split('https://shopee.tw/a50h95648d?tab=shop').length-1,1);
assert(!/NaN|undefined|\[object Object\]/.test(text));
console.log(JSON.stringify({status:'passed',characters:meta.characters,bytes:meta.utf8Bytes,included:meta.includedBlocks.length,notExpanded:meta.notExpanded.length}));
