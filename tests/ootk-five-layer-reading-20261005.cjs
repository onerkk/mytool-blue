'use strict';
const assert=require('node:assert/strict');
require('../JS/native-card-analysis.js');
require('../JS/native-depth-contract.js');
const quality=require('../JS/reading-quality.js');
const workflow=require('../JS/reading-workflow.js');

const mk=(extra={})=>Object.assign({valid:true,abandoned:false,activeCards:[{name:'X'}],keyCards:[{name:'K'}],countingPath:[{cardName:'X'}],pairs:[{left:{name:'A'},right:{name:'B'}}],dignities:[{relation:'friendly'}],bookTMajorities:{observations:['sample']}},extra);
const raw={ootkData:{operations:{
  op1:mk({activePile:'air',domainMeaning:'思維與衝突',mainLineValidation:'未定'}),
  op2:mk({activeHouse:3,domainMeaning:'溝通'}),
  op3:mk({activeSign:'金牛',signTrump:'教皇'}),
  op4:mk({ringSize:36,ringCountingPath:[{cardName:'A'}],ringPairing:[{left:{name:'A'},right:{name:'B'}}]}),
  op5:mk({activeSephirah:'Netzach',sephirahZh:'勝利',sephirahMeaning:'情感、慾望、愛、藝術'})
}}};

const native=globalThis.JYNativeCards.ootk(raw);
assert.deepEqual(native.completed,['op1','op2','op3','op4','op5']);
assert.equal(native.layerEvidence.length,5);
assert.equal(native.layerEvidence[0].readingStatus,'context-mainline-pending');
assert.equal(native.layerEvidence[4].stage,'最終落點與態度');
assert(native.layerEvidence.every(x=>x.requiredContribution.length===5));
assert(native.layerContract.perLayerRule.includes('每一個完成且有效的操作'));
assert(native.layerContract.synthesisRule.includes('最可能方向'));
assert(native.layerContract.thirdPartyMindRule.includes('方向性模型'));
assert(native.layerContract.unresolvedRule.includes('不能成為停止解讀的理由'));

const contract=globalThis.JYNativeDepthContract.build('ootk',{}, {methodData:native,unavailable:['由象徵證實人物心意或未發生事件']});
assert.equal(contract.version,'20261005depth15');
assert.equal(contract.status,'ready-for-scoped-reading');
assert(contract.methodOutputPolicy.fiveLayerRequirement.includes('每一個完成且有效的操作'));
assert(contract.methodOutputPolicy.attributionBoundary.includes('關係場／互動場'));
const contractPrompt=globalThis.JYNativeDepthContract.toPrompt(contract);
assert(contractPrompt.includes('本法輸出契約'));
assert(contractPrompt.includes('最可能方向、次可能方向'));
assert(contractPrompt.includes('不得因「無法證實他人心意」就停止解讀'));

assert.equal(quality.readingVersion,'9.4.0');
const q=quality.lines('ootk').join('\n');
for(const phrase of ['五次操作不是五個月份，而是五層閱讀','每一個完成且有效的操作都必須對原問題新增','不能證實』不等於『不能判方向','最可能方向、次可能方向、最強反證'])assert(q.includes(phrase),phrase);

assert.equal(workflow.version,'1.6.0');
const rendered=workflow.render({method:'ootk',question:'公司異性女工程師到底怎看我'});
for(const phrase of ['每一有效輪次都先對原題新增一個具體判斷','第三方角色歸屬不足時降低確定度','最可能方向、次可能方向'])assert(rendered.includes(phrase),phrase);

console.log('ootk-five-layer-reading-20261005: engine, depth contract and prompt convergence passed.');
