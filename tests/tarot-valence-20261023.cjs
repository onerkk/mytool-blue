'use strict';
/* 牌的吉凶傾向表：78 張齊全；代表性牌的方向正確；逆位規則（順牌受阻、困難牌緩解、中性仍中性）。 */
const assert=require('assert/strict'),fs=require('fs'),path=require('path');
const src=fs.readFileSync(path.join(__dirname,'..','JS/prompt-single-paste.js'),'utf8');
const V=JSON.parse(src.match(/const TAROT_VALENCE=(\[[^\]]*\]);/)[1]);const cv=(id,reversed)=>{const v=V[id];if(v===undefined)return 0;return reversed?(v>0?-1:0):v;};assert(src.includes('const cardValence=(id,reversed)=>{const v=TAROT_VALENCE[id];if(v===undefined)return 0;return reversed?(v>0?-1:0):v;};'),'reversal rule changed without updating this test');
assert.equal(V.length,78);
const ids={太陽:19,星星:17,塔:16,惡魔:15,死神:13,寶劍五:54,寶劍三:52,寶劍十:59,聖杯十:45,金幣十:73,權杖十:31,聖杯五:40,金幣五:68,聖杯三:38,金幣九:72};
const want={太陽:1,星星:1,塔:-1,惡魔:-1,死神:-1,寶劍五:-1,寶劍三:-1,寶劍十:-1,聖杯十:1,金幣十:1,權杖十:-1,聖杯五:-1,金幣五:-1,聖杯三:1,金幣九:1};
for(const [n,id] of Object.entries(ids))assert.equal(V[id],want[n],n);
assert.equal(cv(19,true),-1);assert.equal(cv(54,true),0);assert.equal(cv(2,true),0);
console.log(JSON.stringify({cards:78,passed:1}));
