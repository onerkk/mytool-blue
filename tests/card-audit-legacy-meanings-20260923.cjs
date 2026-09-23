'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const tarot=fs.readFileSync(path.join(root,'JS/tarot.js'),'utf8');
const meihua=fs.readFileSync(path.join(root,'JS/meihua_upgrade.js'),'utf8');
function functionText(text,name){
  const match=text.match(new RegExp('^function '+name+'\\([^\\n]*\\)\\{[\\s\\S]*?^\\}','m'));
  assert(match,`${name} must be part of production`);
  return match[0];
}
// Run the actual legacy data and the actual card-domain consumer in an isolated browser-style VM.
const context={window:{},S:{form:{domains:[]}},console};
vm.createContext(context);
const deckStart=tarot.indexOf('var TAROT=['),deckEnd=tarot.indexOf('\n];',deckStart)+3;
assert(deckStart>=0&&deckEnd>deckStart);
vm.runInContext(tarot.slice(deckStart,deckEnd),context);
const deepStart=tarot.indexOf('var TAROT_DEEP = {};'),deepEnd=tarot.indexOf('// ── 小牌 fallback',deepStart);
assert(deepStart>=0&&deepEnd>deepStart);
vm.runInContext(tarot.slice(deepStart,deepEnd),context);
vm.runInContext(functionText(tarot,'getTarotTypeMeaning'),context);
const meaning=context.getTarotTypeMeaning;
assert.match(meaning(2,true,'love'),/不能判定對方的好感/);
assert.doesNotMatch(meaning(2,true,'love'),/對方有好感但還沒說出口/);
assert.match(meaning(10,true,'love'),/雙方|互動/);
assert.doesNotMatch(meaning(10,true,'love'),/命中注定/);
assert.match(meaning(10,true,'wealth'),/核對收入、風險/);
assert.doesNotMatch(meaning(10,true,'wealth'),/投資時機到/);
assert.match(meaning(10,true,'health'),/症狀與檢查/);
assert.doesNotMatch(meaning(10,true,'health'),/身體好轉的週期/);
assert.match(meaning(11,false,'health'),/不能由牌面判斷是否誤診/);
assert.match(meaning(59,false,'health'),/是否恢復應按實際健康狀況確認/);
assert.match(context.TAROT_DEEP[2].loveUp,/仍要看實際互動/);
assert.match(context.TAROT_DEEP[10].wealthUp,/風險/);
assert.match(context.TAROT_DEEP[10].healthRv,/實際評估/);
// The same selected cards in the RWS payload must export only real draw facts;
// domain-specific snippets cannot silently become verified events in a local prompt.
context.window.document={addEventListener(){}};
context.window.S={form:{type:'love',question:'公司裡有人暗戀我嗎？'}};
vm.runInContext(fs.readFileSync(path.join(root,'JS/tarot-reading.js'),'utf8'),context);
const cards=[2,10,11].map(id=>({...context.TAROT[id],isUp:true,readingMode:'rws_reversals'}));
const plan={slots:cards.map((card,i)=>({label:'位置'+(i+1),binding:{eventId:'QUESTION'}}))};
const result=context.window.JYTarotReading.payload({},'公司裡有人暗戀我嗎？',cards,'three_card',plan,{zh:'三張牌',positions:plan.slots});
const payload=JSON.stringify(result);
assert.deepEqual(result.tarotData.cards.map(c=>c.name),['女祭司','命運之輪','正義']);
assert(!payload.includes('對方有好感但還沒說出口'));
assert(!payload.includes('投資時機到'));
assert(!payload.includes('誤診'));
// The older lazy-loader mirror executes before the upgrade is fetched. It must
// retain identical symbolic semantics and must not manufacture a third person's intent.
const mirrorNames=['_mhHuHidden','_mhBianTrend','_mhDongStage','_mhTySemantics','_mhTimingSemantics','_mhTiming','_mhTypeAnalysis'];
for(const name of mirrorNames)assert.equal(functionText(tarot,name),functionText(meihua,name),`${name} mirror must match the canonical engine`);
vm.runInContext(['_mhDongStage','_mhTySemantics','_mhTypeAnalysis'].map(name=>functionText(tarot,name)).join('\n'),context);
const love=context._mhTypeAnalysis('love','用生體','木','火',5,context._mhDongStage(5),{cat:'拉鋸',desc:'仍需核對'},{type:'好轉'}, {level:'旺'});
assert.match(love.signals.join(''),/不能單憑此卦認定對方主動或有好感/);
assert.match(love.actionCore.join(''),/對方若持續主動/);
assert(!love.focus.includes('有人要做決定了'));
const health=context._mhTypeAnalysis('health','用克體','木','金',2,context._mhDongStage(2),{cat:'外部壓制',desc:'承壓象'},{type:'平穩'},{level:'囚'});
assert.match(health.focus,/實際壓力來源/);
assert(!health.signals.join('').includes('免疫力可能偏低'));
console.log('card-audit-legacy-meanings: live card meanings, RWS payload, Mei Hua mirror and love/wealth/health counterexamples passed.');
