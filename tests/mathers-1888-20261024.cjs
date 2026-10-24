'use strict';
/* Mathers 牌陣端到端：自動模式採《The Tarot》(1888) 原書——抽牌保留正逆位、送出資料標為 mathers_1888、
 * 提示詞的牌義段為原書牌義、正統取法為 Mathers 程序；使用者明確選 RWS 時照選擇。 */
const assert=require('assert/strict');const {fixture,load}=require('./ritual-lifecycle-20260911.cjs'),e=fixture(),c=e.ctx;
['reading-quality','reading-workflow','native-depth-contract','native-card-analysis','engine-computation-audit','native-rule-sources','native-chart-analysis','picker-core','tarot-foundation','golden-dawn-tarot','tarot-semantic-engine','tarot','tarot-reading','tarot_upgrade','prompt-brief','prompt-packet','prompt-export'].forEach(n=>load(e,n));
const F=c.JYTarotFoundation,P=c.JYPromptPacket,R=c.JYTarotReading,M=c.jyMathers1888Meanings;assert(M&&Object.keys(M).length===78);
const q='我的工作接下來如何？';
for(const id of ['mathers_21','mathers_horseshoe']){
  const compiled=F.compileQuestion(q,{referenceDate:'2026-10-24T00:00:00Z'}),plan=F.instantiateMethod(id,compiled);
  const drawn=Array.from({length:plan.count},(_,i)=>R.apply(Object.assign({},c.TAROT[(i*7+3)%78]),i%3!==1,id));
  assert(drawn.every(x=>x.readingMode==='mathers_1888'),id+' default mode');assert(drawn.some(x=>x.isUp===false),id+' reversals kept');
  const body=P.build('tarot',R.payload({spreadType:id,drawn,methodPlan:plan,compiledQuestion:compiled},q,drawn,id,plan,c.SPREAD_DEFS&&c.SPREAD_DEFS[id]),q);
  assert(body.includes('【牌義（Mathers《The Tarot》1888 原書'),id+' book meaning header');assert(body.includes('【本法正統取法（Mathers 塔羅）】'),id+' orthodox procedure');
  const first=drawn[0];assert(body.includes(first.isUp?M[first.n].up:M[first.n].rv),id+' exact book meaning');
}
const rws=R.apply(Object.assign({},c.TAROT[5]),false,'mathers_21','rws_reversals');assert.equal(rws.readingMode,'rws_reversals','explicit RWS selection is respected');
console.log(JSON.stringify({passed:3}));
