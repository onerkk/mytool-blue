'use strict';
const assert=require('node:assert/strict');
const foundation=require('../JS/tarot-foundation.js');
const workflow=require('../JS/reading-workflow.js');
const methods=require('../JS/reading-quality.js').methodKinds();

const orders='我蝦皮副業什麼時候能每月30訂單以上';
const orderModel=workflow.plan({method:'tarot',question:orders}).questionModel;
assert.equal(orderModel.status,'validated_atomized');
assert.deepEqual(orderModel.queryIntent.domains,['career','commerce']);
assert.deepEqual(orderModel.queryIntent.dimensions.map(x=>x.id).slice(0,3),['event_or_state','threshold_outcome','temporal_sequence']);
assert.deepEqual(orderModel.events[0].threshold,{surface:'30',value:30,operator:'gte'});
assert.equal(orderModel.events[0].metric,'訂單');
assert.equal(orderModel.events[0].metricKind,'count');
assert.equal(orderModel.events[0].metricCadence,'monthly');
assert.equal(orderModel.events[0].sourceRoles.subject,'蝦皮副業');
assert.equal(orderModel.events[0].queryOperator,'relative_timing_to_threshold');

const alternateThreshold=foundation.compileQuestion('每月要達到30張訂單以上要多久？');
assert.equal(alternateThreshold.relations[0].type,'fixed_numeric_threshold');
assert.equal(alternateThreshold.relations[0].thresholdValue,30);
assert.equal(alternateThreshold.relations[0].metricPeriod,'monthly');
assert.equal(alternateThreshold.features.shape,'threshold_timing');

const intimacy='現任會願意再約一個她認識的女性跟我一起做愛嗎';
const intimateModel=workflow.plan({method:'liuyao',question:intimacy}).questionModel.events[0];
assert.equal(intimateModel.type,'willingness_for_intimate_action');
assert.equal(intimateModel.eventActor,'現任');
assert.deepEqual(intimateModel.actionSequence,['約','做愛']);
assert.deepEqual(intimateModel.participants.map(x=>x.role),['grammatical_subject','co_participant','additional_participant']);
assert(intimateModel.requiredObservables.includes('willingness'));
assert(intimateModel.requiredObservables.includes('invitation_or_arrangement'));
assert(intimateModel.requiredObservables.includes('participant_structure'));
assert(intimateModel.sourceRoles.requiredDistinctions.includes('event_occurrence'));

const choice=workflow.plan({method:'bazi',question:'我該選哪個商品上架？'}).questionModel.events[0];
assert.equal(choice.type,'recommendation_with_unprovided_options');
assert.deepEqual(choice.actionSequence,['選擇','上架']);
assert.equal(choice.optionSet.status,'unspecified');
assert.equal(choice.optionSet.object,'商品');
assert(choice.requiredObservables.includes('decision_criteria'));

const comparison=workflow.plan({method:'tarot',question:'明年副業收入會不會超過正職？'}).questionModel.events[0];
assert.equal(comparison.comparison.left,'副業');
assert.equal(comparison.comparison.right,'正職');
assert.equal(comparison.comparison.criterion,'收入');
assert.deepEqual(comparison.negations,[],'會不會 is an interrogative, not a negation');
assert.equal(comparison.temporal.actorBoundFutureEvent,false);

const allMethodOutputs=methods.map(method=>workflow.render({method,question:orders}));
assert.equal(allMethodOutputs.length,14);
for(const output of allMethodOutputs){
  assert(output.includes('jy.question_model/1'));
  assert(output.includes('"metricCadence":"monthly"'));
  assert(output.includes('"value":30'));
}

console.log('question model regression: semantic roles, measurements, comparisons, intimate-action layers and all 14 methods passed.');
