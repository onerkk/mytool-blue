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

// Leading calendar scopes, first-person subjects, recurrence wording and "encounter" verbs
// must survive together. "肉體桃花" is an intimacy domain, but is not itself an explicit sex act.
const physicalRomanceQuestion='今年我還會遇到肉體桃花嗎？';
const physicalRomancePlan=workflow.plan({method:'tarot',question:physicalRomanceQuestion,referenceDate:'2026-09-28'});
const physicalRomance=physicalRomancePlan.questionModel.events[0];
assert.equal(physicalRomancePlan.questionModel.status,'validated_atomized');
assert.equal(physicalRomancePlan.depth,'deep');
assert.equal(physicalRomancePlan.questionModel.queryIntent.shape,'bounded_yes_no');
assert.deepEqual(physicalRomancePlan.questionModel.queryIntent.domains,['relationship','intimacy']);
assert.equal(physicalRomance.eventActor,'我');
assert.equal(physicalRomance.grammaticalSubject,'我');
assert.equal(physicalRomance.type,'intimate_opportunity_query');
assert.deepEqual(physicalRomance.actionSequence,['遇到']);
assert.equal(physicalRomance.actionObject,'肉體桃花');
assert.match(physicalRomance.target,/遇到.*肉體桃花/);
assert.equal(physicalRomance.recurrenceCue,'還');
assert.equal(physicalRomance.priorOccurrenceVerified,false,'「還會」 must not be treated as proof of an earlier encounter');
assert.equal(physicalRomance.explicitSexualAct,false,'meeting a physical-romance opportunity is not the same proposition as sex occurring');
assert(physicalRomance.semanticDomains.includes('intimacy'));
assert(physicalRomance.requiredObservables.includes('bounded_outcome'));
assert(physicalRomance.requiredObservables.includes('event_action'));
assert(physicalRomance.requiredObservables.includes('recurrence_context'));
assert(physicalRomance.temporal.actorBoundFutureEvent);
assert.equal(physicalRomancePlan.questionModel.queryIntent.explicitTime[0].resolved,'2026年');

const numericYear=workflow.plan({method:'tarot',question:'2026年我還會遇到肉體桃花嗎？',referenceDate:'2026-09-28'}).questionModel;
assert.equal(numericYear.status,'validated_atomized');
assert.deepEqual(numericYear.events[0].timeScope,['2026年'],'explicit calendar year is a single bounded scope');
assert.equal(numericYear.events[0].actionObject,'肉體桃花');
const actualIntimacy=workflow.plan({method:'tarot',question:'今年我還會做愛嗎？',referenceDate:'2026-09-28'}).questionModel.events[0];
assert.equal(actualIntimacy.type,'intimate_event_occurrence_query');
assert.equal(actualIntimacy.explicitSexualAct,true,'an explicitly named act stays distinct from an opportunity to meet someone');
assert.equal(workflow.plan({method:'tarot',question:'我該不該離職？'}).questionModel.events[0].type,'alternative_comparison','a decision question must not be routed as a future occurrence');
assert.equal(workflow.plan({method:'tarot',question:'她有沒有同意？'}).questionModel.events[0].type,'qualitative_state_query','a consent-state question must stay distinct from a future physical action');

for(const method of methods){
  const prompt=workflow.render({method,question:physicalRomanceQuestion,referenceDate:'2026-09-28'});
  assert(prompt.includes('"type":"intimate_opportunity_query"'),`${method} receives the typed event`);
  assert(prompt.includes('"eventActor":"我"'),`${method} receives the correct actor`);
  assert(prompt.includes('"semanticDomains":["relationship","intimacy"]'),`${method} receives both domains`);
  assert(prompt.includes('"actionObject":"肉體桃花"'),`${method} receives the object of encounter`);
}
const indexHtml=require('node:fs').readFileSync(require('node:path').join(__dirname,'..','index.html'),'utf8');
for(const asset of ['reading-workflow.js','tarot-foundation.js','lenormand.js'])assert(indexHtml.includes(`JS/${asset}?v=20260928semantic1`),`${asset} cache token is updated`);
assert(require('node:fs').readFileSync(require('node:path').join(__dirname,'..','sw.js'),'utf8').includes("jy-main-v102"),'service worker cache version is refreshed');

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

console.log('question model regression: semantic roles, measurements, comparisons, intimate-action layers, year-bound encounters and all 14 methods passed.');
