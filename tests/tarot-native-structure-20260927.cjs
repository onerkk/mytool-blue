'use strict';
const assert = require('node:assert/strict');
const F = require('../JS/tarot-foundation.js');
const E = require('../JS/tarot-semantic-engine.js');

const referenceDate = '2026-09-27';
const question = '目前的工作方向與下一步如何？';
function planFor(id) {
  return F.instantiateMethod(id, F.compileQuestion(question, { referenceDate }));
}
function cardsFor(plan) {
  return (plan.slots || []).map((slot, i) => ({
    name: '測試牌' + (i + 1),
    positionMeaning: slot.label || '',
    direction: i % 2 ? '逆位' : '正位'
  }));
}
function graphFor(id, plan, qSpec) {
  return E.compileEvidenceGraph(id, cardsFor(plan), { methodPlan: plan, questionSpec: qSpec || F.compileQuestion(question, { referenceDate }) });
}

assert.deepEqual(F.validateMethodRegistry(), { ok: true, errors: [] });
assert.equal(Object.keys(F.METHODS).length, 24, 'Foundation method registry');
assert.deepEqual(Object.keys(F.METHODS).sort(), Object.keys(E.METHOD_SPECS).sort(), 'semantic compiler covers every selectable tarot method');

for (const id of Object.keys(F.METHODS)) {
  if (id === 'ootk') continue; // Its five-operation procedure has its own native compiler.
  const plan = planFor(id);
  assert(plan && Array.isArray(plan.slots), id + ' must provide native slots');
  assert.equal(plan.slots.length, plan.count, id + ' plan/card count must agree');
  const graph = graphFor(id, plan);
  assert.equal(graph.methodId, id, id + ' must retain its selected method');
  assert.equal(graph.nodes.length, plan.count, id + ' must retain every drawn card');
  if (id === 'single_card') assert.equal(graph.evidenceUnits.length, graph.nodes.length, 'a true single-card spread has one direct observation and no invented relation');
  else assert(graph.evidenceUnits.length > graph.nodes.length, id + ' must compile its native structure, not only atomic card descriptions');
}

{
  const plan = planFor('monthly');
  const graph = graphFor('monthly', plan);
  const path = graph.evidenceUnits.find(unit => unit.metadata && unit.metadata.nativeStructureId === 'year_month_path');
  const transitions = graph.evidenceUnits.filter(unit => unit.metadata && /^month_transition_/.test(unit.metadata.nativeStructureId || ''));
  const synthesis = graph.evidenceUnits.find(unit => unit.metadata && unit.metadata.nativeStructureId === 'annual_synthesis');
  assert(path, 'monthly layout includes its twelve-month path');
  assert.deepEqual(path.nodes, graph.nodes.slice(0, 12).map(node => node.id));
  assert.equal(path.nodes.includes(graph.nodes[12].id), false, 'the annual summary card must not be treated as a month');
  assert.equal(transitions.length, 11, 'monthly layout compiles every adjacent month transition');
  transitions.forEach((unit, i) => assert.deepEqual(unit.nodes, [graph.nodes[i].id, graph.nodes[i + 1].id]));
  assert(synthesis, 'thirteenth card receives a separate annual summary role');
  assert.equal(synthesis.metadata.contextNodeIds[0], graph.nodes[12].id);
  assert.equal(synthesis.dependsOn.length, 12, 'annual synthesis depends on the month path and all eleven transitions');
}

{
  const route = F.routeQuestion('請用多選項比較：A 是蝦皮副業，B 是接案，C 是繼續上班。', { referenceDate });
  assert.equal(route.spreadId, 'multi_option');
  const graph = graphFor(route.spreadId, route.methodPlan, route.compiledQuestion);
  const branches = graph.evidenceUnits.filter(unit => unit.metadata && /^branch_[1-3]$/.test(unit.metadata.nativeStructureId || ''));
  const synthesis = graph.evidenceUnits.find(unit => unit.metadata && unit.metadata.nativeStructureId === 'branch_comparison');
  assert.equal(branches.length, 3, 'each option is compiled as a separate path');
  assert(synthesis);
  assert.deepEqual(synthesis.dependsOn, branches.map(unit => unit.id));
}

{
  const route = F.routeQuestion('請用多子題分開解讀：工作如何？感情如何？', { referenceDate });
  assert.equal(route.spreadId, 'multi_question');
  const graph = graphFor(route.spreadId, route.methodPlan, route.compiledQuestion);
  const branches = graph.evidenceUnits.filter(unit => unit.metadata && /^branch_[12]$/.test(unit.metadata.nativeStructureId || ''));
  const synthesis = graph.evidenceUnits.find(unit => unit.metadata && unit.metadata.nativeStructureId === 'multi_question_synthesis');
  assert.equal(branches.length, 2, 'each question keeps its own five-card evidence path');
  assert(synthesis, 'the question summaries are combined only after each independent path is complete');
  assert.deepEqual(synthesis.dependsOn, branches.map(unit => unit.id));
}

{
  const route = F.routeQuestion('請用二選一牌陣，A：蝦皮賣水晶，B：賣飾品，並給兩邊各自建議。', { referenceDate });
  assert.equal(route.spreadId, 'either_or');
  assert.equal(route.methodPlan.count, 7);
  const graph = graphFor(route.spreadId, route.methodPlan, route.compiledQuestion);
  const advice = graph.evidenceUnits.filter(unit => unit.metadata && unit.metadata.supplemental);
  assert.equal(advice.length, 2, 'branch-specific advice positions must reach the semantic graph');
  assert.deepEqual(advice.map(unit => unit.eventBinding), ['BRANCH_A_EVENT', 'BRANCH_B_EVENT']);
  assert.deepEqual(advice.map(unit => unit.nodes), [[graph.nodes[5].id], [graph.nodes[6].id]]);
}

assert.throws(() => E.compileEvidenceGraph('not_a_registered_method', []), /unregistered_tarot_method/);
assert.throws(() => E.compileReadingSpec({ question, spreadId: 'not_a_registered_method' }), /unregistered_tarot_method/);
const monthlyPlan = planFor('monthly');
assert.throws(() => E.compileReadingSpec({ question, spreadId: 'five_card', methodPlan: monthlyPlan }), /spread_method_plan_mismatch/);

console.log('tarot-native-structure: all 24 selectable methods, native monthly geometry, independent branches, and invalid-route failures passed.');
