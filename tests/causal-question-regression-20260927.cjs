'use strict';
const assert = require('node:assert/strict');
const foundation = require('../JS/tarot-foundation.js');
const workflow = require('../JS/reading-workflow.js');

const question = '我今天去拜拜 求財 結果今天因為水晶孔洞線材斷裂 損失一顆水晶 成本最少賠8000....拜完還破財 是為什麼？';
const compiled = foundation.compileQuestion(question, { referenceDate: '2026-09-27', timezone: 'Asia/Taipei' });
const event = compiled.queryGraph.events[0];
const incident = event.causalSituation;

assert.equal(event.type, 'causal_event_explanation');
assert.equal(event.predicate, 'explain_reported_event_and_causal_layers');
assert(compiled.features.domains.includes('finance'));
assert(!event.languageFrame.domains.includes('commerce'), 'individual accident must not become a commerce question');
assert(!compiled.features.domains.includes('commerce'), 'an individual crystal loss must not be classified as shop operations');
assert(incident, 'cause queries about reported incidents must carry a structured incident frame');
assert.match(incident.mechanismSurface, /水晶孔洞線材斷裂/);
assert.equal(incident.outcomeSurface, '損失一顆水晶');
assert.equal(incident.itemSurface, '一顆水晶');
assert.equal(incident.amountSurface, '成本最少賠8000');
assert.equal(incident.amountValue, '8000');
assert.match(incident.amountSurface, /^成本/);
assert.match(incident.timeScope, /今天/);
assert(incident.reportedFacts.every(f => f.source === 'user_reported'));
assert(incident.relations.some(r => r.type === 'explicit_user_attributed_cause' && /斷裂/.test(r.cause) && /損失/.test(r.effect)));
assert(incident.relations.some(r => r.type === 'temporal_sequence_only' && r.status === 'sequence_does_not_establish_cause'));
assert(event.requiredObservables.includes('causal_layers'));
assert(compiled.queryGraph.requiredAtoms.some(a => a.role === 'mechanism' && a.kind === 'reported_physical_mechanism' && /斷裂/.test(a.text)));
assert(compiled.queryGraph.requiredAtoms.some(a => a.role === 'amount' && /8000/.test(a.text)));

const allMethods = workflow.methods;
assert(allMethods.length >= 14, 'regression should cover every method registered in the shared workflow');
for (const method of allMethods) {
  const prompt = workflow.render({ method, question, referenceDate: '2026-09-27', timezone: 'Asia/Taipei' });
  assert(prompt.includes('【本題已報告的具體事故與因果層次】'), method + ' prompt omitted the concrete incident frame');
  assert(prompt.includes('水晶孔洞線材斷裂'), method + ' prompt omitted the reported physical failure');
  assert(prompt.includes('損失一顆水晶'), method + ' prompt omitted the reported loss');
  assert(prompt.includes('成本最少賠8000'), method + ' prompt omitted the reported amount');
  assert(prompt.includes('temporal_sequence_only'), method + ' prompt omitted the sequence/cause distinction');
}

const suitability = foundation.compileQuestion('我適合配戴鈦晶手排嗎？');
assert.equal(suitability.queryGraph.events[0].type, 'criterion_evaluation');
assert.equal(suitability.readingQuestion.clauses[0].evaluation.targetRef, '配戴鈦晶手排');
assert.equal(suitability.readingQuestion.clauses[0].causalSituation, null);

const shop = foundation.compileQuestion('我副業蝦皮賣場每月訂單超過30單要什麼時候才能達到？');
assert(shop.features.domains.includes('commerce'), 'real shop questions must retain the commerce domain');
assert(workflow.plan({ method: 'tarot', question: '我副業蝦皮賣場每月訂單超過30單要什麼時候才能達到？' }).domains.includes('finance'), 'side-business performance keeps the finance domain');

console.log('causal-question-regression: reported event, mechanism, impact, amount, sequence and all ' + allMethods.length + ' engines passed');
