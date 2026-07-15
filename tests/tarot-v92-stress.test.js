'use strict';
const assert = require('assert');
const path = require('path');
const E = require(path.resolve(__dirname, '..', 'JS', 'tarot-semantic-engine.js'));

function cards(n, seed) {
  return Array.from({ length: n }, (_, i) => ({
    name: `${seed}牌${i + 1}`,
    position: `${seed}位置${i + 1}`,
    isUp: i % 3 !== 0,
    semanticCandidates: [`候選${i + 1}甲`, `候選${i + 1}乙`, `候選${i + 1}丙`],
    sourceGloss: `來源素材${i + 1}`
  }));
}
function ootk(seed) {
  const operations = {};
  for (let stage = 1; stage <= 5; stage += 1) {
    operations[`op${stage}`] = {
      activePile: stage === 1 ? `${seed}元素堆` : '',
      activeHouse: stage === 2 ? `${stage}` : '',
      activeSign: stage === 3 ? `${seed}星座` : '',
      activeSephirah: stage === 5 ? `${seed}質點` : '',
      valid: true,
      countingPath: [
        { cardName: `${seed}路徑${stage}甲`, semanticCandidates: ['形成', '限制'] },
        { cardName: `${seed}路徑${stage}乙`, semanticCandidates: ['轉折', '收束'] }
      ],
      pairs: [{
        left: { name: `${seed}配對${stage}左`, title: '左側作用' },
        right: { name: `${seed}配對${stage}右`, title: '右側作用' }
      }],
      dignities: [{ card: `${seed}路徑${stage}甲`, score: 1 }],
      decanDateRange: stage === 4 ? '資料明示時間錨' : ''
    };
  }
  return { sourceProfile: 'gd_book_t', significator: { name: `${seed}代表牌` }, operations };
}
function assertAcyclic(contract) {
  const units = new Map(contract.evidenceGraph.evidenceUnits.map(u => [u.id, u]));
  const visiting = new Set();
  const visited = new Set();
  function visit(id) {
    if (visited.has(id)) return;
    assert(!visiting.has(id), `evidence dependency cycle at ${id}`);
    visiting.add(id);
    const unit = units.get(id);
    assert(unit, `missing evidence unit ${id}`);
    unit.dependsOn.forEach(visit);
    visiting.delete(id);
    visited.add(id);
  }
  [...units.keys()].forEach(visit);
}

const questions = [
  '今年會有非現任的異性跟我告白嗎？',
  '副業收入能超過正職收入嗎？',
  '除了既有方案以外，另一條路是否仍能在指定期限內成立？',
  '公司有幾個人真正願意承擔這件事？',
  '可能對象幾歲，身分是誰？',
  '甲方案還是乙方案較適合長期維持？',
  '為什麼目前沒有進展，接下來如何發展？',
  '當Ω在甲域經過β後，非丙的δ是否仍保持ζ？',
  '這件事不會因外部阻力而失敗嗎？',
  '未來三個月內，事件會先轉折還是先停滯？',
  '沒有明確人物時，這個作用是否存在並會落實？',
  '請完整說明已成立、被反證與尚未量測的部分。'
];

let contracts = 0;
for (const [methodId, spec] of Object.entries(E.METHOD_SPECS)) {
  for (let i = 0; i < questions.length; i += 1) {
    const input = { question: questions[i], spreadId: methodId };
    if (methodId === 'ootk') input.ootkData = ootk(`Q${i}`);
    else input.cards = cards(spec.expectedCardCount, `Q${i}`);
    const contract = E.compileReadingSpec(input);
    assert.strictEqual(contract.validation.ok, true, `${methodId}/Q${i}: ${contract.validation.errors.join(',')}`);
    assert.strictEqual(contract.schema, E.SCHEMA);
    assert(contract.question.queryGraph.requiredAtoms.length >= 1);
    assert.strictEqual(contract.adjudication.executionPlan.passes.length, 6);
    assert(contract.evidenceGraph.evidenceUnits.every(u => u.joinPolicy));
    assert(contract.evidenceGraph.nodes.every(n => n.bindingPolicy));
    assertAcyclic(contract);
    const rendered = E.renderPromptContract(contract);
    assert(rendered.includes('ROOT-SPEC v92'));
    assert(rendered.includes(spec.label));
    assert(rendered.includes('合法證據單位：'));
    assert(rendered.includes('語義飽和帳本'));
    contracts += 1;
  }
}

assert.strictEqual(contracts, Object.keys(E.METHOD_SPECS).length * questions.length);
console.log(`✓ ${contracts} cross-question × all-method contracts compiled, validated, rendered, and DAG-checked`);
