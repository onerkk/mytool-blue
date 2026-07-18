'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const F = require(path.join(ROOT, 'JS/tarot-foundation.js'));
const E = require(path.join(ROOT, 'JS/tarot-semantic-engine.js'));

let passed = 0;
function test(name, fn) {
  try {
    fn();
    passed += 1;
    console.log('✓', name);
  } catch (err) {
    console.error('✗', name, '\n ', err.stack || err);
    process.exitCode = 1;
  }
}

function compiled(question) {
  return F.compileQuestion(question, { referenceDate: '2026-07-18T12:00:00+08:00' });
}
function plan(id, question = '現任是正緣嗎？') {
  return F.instantiateMethod(id, compiled(question));
}
function cardsFor(methodPlan) {
  const names = ['權杖四', '聖杯九', '正義', '寶劍六', '金幣六', '女祭司', '力量'];
  return methodPlan.slots.map((slot, i) => ({
    name: names[i % names.length],
    position: '舊介面位置' + (i + 1),
    positionMeaning: '舊介面位置意義' + (i + 1),
    sourceCore: 'Book T 核心義',
    sourceGloss: 'Book T 核心義',
    semanticCandidates: ['Book T 核心義'],
    element: ['火', '水', '風', '土'][i % 4]
  }));
}
function graphFor(id) {
  const p = plan(id);
  return E.compileEvidenceGraph(id, cardsFor(p), { methodPlan: p });
}
function promptContext(builderName, payload, question) {
  const context = {
    console,
    window: null,
    self: null,
    globalThis: null,
    S: { form: { question } },
    navigator: { clipboard: { writeText: () => Promise.resolve() } },
    setTimeout,
    clearTimeout,
    Date,
    JSON,
    Math,
    RegExp,
    String,
    Number,
    Array,
    Object,
    Error,
    Promise,
    document: {
      getElementById: () => null,
      querySelector: () => null,
      createElement: () => ({
        style: {}, setAttribute() {}, appendChild() {}, select() {},
        querySelectorAll() { return []; }
      }),
      body: { appendChild() {}, removeChild() {} },
      execCommand() { return true; }
    },
    JYTarotFoundation: F,
    JYTarotSemanticEngine: E
  };
  context[builderName] = () => payload;
  context.window = context;
  context.self = context;
  context.globalThis = context;
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'JS/prompt-export.js'), 'utf8'), context);
  return context;
}
function assembledPrompt(id, question = '現任是正緣嗎？') {
  const p = plan(id, question);
  const cards = cardsFor(p);
  const contract = E.compileReadingSpec({
    question,
    spreadId: id,
    methodPlan: p,
    cards,
    sourceProfile: 'gd_book_t',
    referenceDate: '2026-07-18'
  });
  const payload = {
    mode: 'tarot',
    methodPlan: p,
    semanticContract: contract,
    tarotData: {
      spreadType: id,
      spreadZh: p.label || id,
      methodPlan: p,
      semanticContract: contract,
      cards,
      readingDate: '2026-07-18'
    },
    shopRecommendation: {
      sourceFile: '靜月之光_庫存_20260717.xlsx',
      allowedItems: ['粉晶手排／10mm／手圍16cm']
    }
  };
  const context = promptContext('_buildTarotOnlyPayload', payload, question);
  return context.JY_buildExportPrompt('tarot');
}

// Single source of truth and method registry
test('v101 foundation and semantic contracts load coherently', () => {
  assert.equal(F.VERSION, '101.0.0');
  assert.equal(F.SCHEMA, 'jy.tarot.foundation/5');
  assert.equal(E.VERSION, '101.0.0');
  assert.equal(E.SCHEMA, 'jy.tarot.semantic-contract/8');
  assert.deepEqual(F.validateMethodRegistry(), { ok: true, errors: [] });
});

test('Every registered method has one native protocol instead of a shared generic story template', () => {
  const ids = Object.keys(F.METHODS).sort();
  assert.deepEqual(Object.keys(F.METHOD_PROTOCOLS).sort(), ids);
  ids.forEach((id) => {
    const protocol = F.getMethodProtocol(id);
    assert(protocol && protocol.id === id, id);
    assert(protocol.kind && protocol.slotMode && protocol.summary, id);
    assert(Array.isArray(protocol.phases) && protocol.phases.length > 0, id);
    assert(protocol.conclusionRule && protocol.conflictRule && protocol.timeRule, id);
    assert.equal(protocol.fixedReversalDictionary, false, id);
    assert.equal(protocol.pairingIsAdjacency, false, id);
    (protocol.structures || []).forEach((structure) => {
      if (structure.type === 'semantic_pairing') {
        assert.equal(structure.elementalDignity, false, id + ':' + structure.label);
      }
    });
  });
});

test('Every registered spread instantiates the slot mode declared by its own method protocol', () => {
  Object.keys(F.METHODS).forEach((id) => {
    if (id === 'ootk') return;
    const p = plan(id, '請完整看這件事如何發展');
    assert(p.protocol, id);
    assert.equal(p.slots.length, p.count, id);
    p.slots.forEach((slot) => {
      assert.equal(slot.slotMode, p.protocol.slotMode, id);
      if (p.protocol.slotMode === 'sequence_member' || p.protocol.slotMode === 'triad_member') {
        assert.equal(slot.independentSemanticPosition, false, id);
      }
    });
  });
});

// Native spread execution
test('Semantic-position layouts retain their actual independent position authority', () => {
  ['three_card', 'five_card', 'cross', 'either_or', 'relationship', 'timeline', 'horseshoe', 'celtic_cross', 'minor_arcana'].forEach((id) => {
    const p = plan(id);
    assert.equal(p.protocol.slotMode, 'semantic_position', id);
    p.slots.forEach((slot) => assert.equal(slot.independentSemanticPosition, true, id));
  });
  assert.equal(plan('tree_of_life').protocol.slotMode, 'qabalistic_position');
  assert.equal(plan('zodiac').protocol.slotMode, 'domain_position');
});

test('Fifteen-card method is five triads, not fifteen independent positions', () => {
  const p = plan('fifteen_card');
  assert.equal(p.protocol.slotMode, 'triad_member');
  assert(/沒有專屬最終結果牌/.test(p.protocol.conclusionRule));
  assert.equal(p.protocol.structures.filter((x) => x.type === 'triad').length, 5);
  const graph = graphFor('fifteen_card');
  assert.equal(graph.evidenceUnits.filter((x) => x.type === 'triad_member_node').length, 15);
  assert.equal(graph.evidenceUnits.filter((x) => /^triad_/.test(x.type) && x.type !== 'triad_member_node').length, 6);
  assert(!graph.evidenceUnits.some((x) => x.type === 'atomic_node'));
});

test('Mathers 21 is three right-to-left rows plus semantic outer pairing, with no invented time rows or result center', () => {
  const p = plan('mathers_21');
  assert.equal(p.protocol.slotMode, 'sequence_member');
  assert(/不是預設的未來／結果排/.test(p.protocol.structures.find((x) => x.label === '第三排').instruction));
  assert(/不是中心結果牌/.test(p.protocol.structures.find((x) => x.type === 'unpaired_member').instruction));
  assert(p.slots.every((x) => x.slotKind === 'sequence_member' && x.independentSemanticPosition === false));
  const graph = graphFor('mathers_21');
  assert.equal(graph.evidenceUnits.filter((x) => x.type === 'ordered_row').length, 3);
  assert.equal(graph.evidenceUnits.filter((x) => x.type === 'declared_outer_pair').length, 10);
  assert.equal(graph.evidenceUnits.filter((x) => x.type === 'unpaired_sequence_member').length, 1);
  graph.evidenceUnits.filter((x) => x.type === 'declared_outer_pair').forEach((x) => {
    assert.equal(x.metadata.relationKind, 'semantic_pair');
    assert.equal(x.metadata.elementalDignity, false);
  });
});

test('Mathers 54 is A/C/E connected answers plus pair supplements, never 54 invented positions or an automatic E-result group', () => {
  const p = plan('mathers_horseshoe');
  assert.equal(p.protocol.slotMode, 'sequence_member');
  assert(/沒有五十四個獨立牌位/.test(p.protocol.summary));
  assert(/沒有原典授權的過去／現在／未來或最終結果身份/.test(p.protocol.conclusionRule));
  assert.equal(p.protocol.structures.filter((x) => x.type === 'ordered_sequence').length, 3);
  assert.deepEqual(p.protocol.structures.filter((x) => x.type === 'semantic_pairing').map((x) => x.pairs.length), [13, 8, 5]);
  const graph = graphFor('mathers_horseshoe');
  assert.equal(graph.evidenceUnits.filter((x) => x.type === 'sequence_member_node').length, 54);
  assert.equal(graph.evidenceUnits.filter((x) => x.type === 'ordered_group').length, 3);
  assert.equal(graph.evidenceUnits.filter((x) => x.type === 'declared_outer_pair').length, 26);
  assert.equal(graph.evidenceUnits.filter((x) => x.type === 'unpaired_sequence_member').length, 2);
  assert(!graph.evidenceUnits.some((x) => /final|past|future/i.test(String(x.label || ''))));
});

test('Opening of the Key remains a separate five-operation procedure and is not aliased to either Mathers method', () => {
  const ootk = F.getMethodProtocol('ootk');
  assert.equal(ootk.kind, 'five_operation_procedure');
  assert.equal(ootk.slotMode, 'procedure_stage');
  assert.equal(ootk.phases.length, 5);
  assert(/只有第五次操作/.test(ootk.conclusionRule));
  assert.notEqual(ootk.kind, F.getMethodProtocol('mathers_21').kind);
  assert.notEqual(ootk.kind, F.getMethodProtocol('mathers_horseshoe').kind);
});

test('Opening of the Key exports the five native operations and grants final-result authority only to operation five', () => {
  function op(n) {
    return { operation: n, valid: true, landing: 'stage-' + n, countingPath: [{ cardName: '權杖一', countValue: 11 }], pairs: [] };
  }
  const operations = {};
  for (let i = 1; i <= 5; i += 1) operations['op' + i] = op(i);
  operations.op4.ringSize = 36;
  operations.op4.ringCountingPath = operations.op4.countingPath;
  const question = '請用開鑰之法看現任是否適合長期交往';
  const ootkData = {
    significator: { name: '權杖國王' },
    operations,
    procedureStatus: { completedOperations: 5, abandoned: false }
  };
  const contract = E.compileReadingSpec({ question, spreadId: 'ootk', ootkData, referenceDate: '2026-07-18' });
  assert.equal(contract.validation.ok, true);
  assert.equal(contract.evidenceGraph.completedStageCount, 5);
  const payload = {
    mode: 'ootk', ootkData, semanticContract: contract,
    shopRecommendation: { sourceFile: '靜月之光_庫存_20260717.xlsx', allowedItems: ['粉晶手排／10mm／手圍16cm'] }
  };
  const context = promptContext('_buildOOTKPayload', payload, question);
  const prompt = context.JY_buildExportPrompt('ootk');
  assert(prompt.includes('方法識別：ootk'));
  assert(prompt.includes('第一次：YHVH四堆'));
  assert(prompt.includes('第五次：生命之樹十堆'));
  assert(prompt.includes('只有第五次操作具有原典明示的Final Result權限'));
  assert(prompt.includes('第四次三十六牌環不是月份或旬位'));
  assert(!prompt.includes('Mathers 五十四張'));
});

test('Every native protocol separates semantic structures from true elemental-dignity adjacency', () => {
  Object.keys(F.METHOD_PROTOCOLS).forEach((id) => {
    const protocol = F.getMethodProtocol(id);
    assert.equal(protocol.causalEdgeIsAdjacency, false, id);
    assert.equal(protocol.pairingIsAdjacency, false, id);
    (protocol.structures || []).forEach((st) => {
      if (['semantic_pairing', 'cross', 'dependency_network', 'synthesis', 'house_wheel', 'dyad'].includes(st.type)) {
        assert.equal(st.elementalDignity, false, id + ':' + st.label);
      }
    });
  });
  assert.deepEqual(F.validateMethodRegistry(), { ok: true, errors: [] });
});

// Prompt-generation regressions
test('Every registered non-OOTK spread can compile its native evidence graph and export a method-specific prompt', () => {
  Object.keys(F.METHODS).filter((id) => id !== 'ootk').forEach((id) => {
    const p = plan(id, '請完整看這件事如何發展');
    const cards = cardsFor(p);
    const spec = E.compileReadingSpec({
      question: '請完整看這件事如何發展', spreadId: id, methodPlan: p, cards,
      sourceProfile: 'gd_book_t', referenceDate: '2026-07-18'
    });
    assert.equal(spec.validation.ok, true, id);
    const prompt = assembledPrompt(id, '請完整看這件事如何發展');
    assert(prompt.includes('方法識別：' + id), id);
    assert(prompt.includes(p.protocol.summary), id);
    assert(prompt.includes('正逆位政策：不使用Waite固定正逆位字典'), id);
  });
});

test('Mathers 54 prompt explicitly teaches the native method and does not emit 54 fake position questions', () => {
  const prompt = assembledPrompt('mathers_horseshoe');
  assert(prompt.includes('沒有五十四個獨立牌位'));
  assert(prompt.includes('首尾配對、對宮、軸線、因果線、分支與依賴線只作語義互動'));
  assert(prompt.includes('A、C、E沒有原典授權的過去／現在／未來或最終結果身份'));
  assert(prompt.includes('〔序列成員；無獨立牌位權限〕'));
  assert(!prompt.includes('先只回答此位置代表的問題'));
  assert(!prompt.includes('第三組對最終走向'));
  assert(!prompt.includes('舊介面位置意義'));
});

test('Mathers 21 prompt does not call the rows past/present/future or the unpaired card a result', () => {
  const prompt = assembledPrompt('mathers_21');
  assert(prompt.includes('二十一張都只是三排序列成員'));
  assert(prompt.includes('第三排由右至左，重新從代表牌起讀'));
  assert(prompt.includes('第11張作未配對成員納入全盤'));
  assert(prompt.includes('三排不自動等於過去、現在、未來'));
  assert(!prompt.includes('整個敘事的最終落點'));
});

test('Five-card prompt still lists its real semantic positions and preserves result dependency', () => {
  const prompt = assembledPrompt('five_card', '今年這件事會成功嗎？');
  assert(prompt.includes('本盤明示牌位'));
  assert(prompt.includes('牌位「目前事件狀態」'));
  assert(prompt.includes('牌位「促成事件成立的力量」'));
  assert(prompt.includes('結果位可作條件性裁決'));
  assert(!prompt.includes('〔序列成員；無獨立牌位權限〕'));
});

test('Non-Book-T relationship labels such as 正緣 are operationalized without inventing unique cosmic destiny', () => {
  const prompt = assembledPrompt('relationship', '現任是正緣嗎？');
  assert(prompt.includes('正緣、命定、靈魂伴侶'));
  assert(prompt.includes('真實感情、互惠、承諾、可持續性'));
  assert(prompt.includes('不得宣稱宇宙唯一指定或必然終身'));
});

test('Recommendation contract naturally closes from the actual question and remains independent from divination evidence', () => {
  const prompt = assembledPrompt('relationship', '現任是正緣嗎？');
  assert(prompt.includes('延伸選品'));
  assert(prompt.includes('先用一句承接使用者這次真正問的事'));
  assert(prompt.includes('本盤已成立的一個核心提醒或可行方向'));
  assert(prompt.includes('不得把商品說成牌面證據或改變結果的工具'));
  assert(prompt.includes('推薦品項：<品項全名>'));
  assert(prompt.trimEnd().endsWith('連結之後不得再有任何內容。'));
});

test('UI method labels no longer inject false narrative positions into Mathers 21 or 54', () => {
  const src = fs.readFileSync(path.join(ROOT, 'JS/tarot_upgrade.js'), 'utf8');
  const m21 = src.slice(src.indexOf('mathers_21:'), src.indexOf('mathers_horseshoe:'));
  const m54Start = src.indexOf('mathers_horseshoe:');
  const m54 = src.slice(m54Start, src.indexOf('\n  horseshoe: {', m54Start));
  assert(m21.includes('序列成員'));
  assert(!m21.includes('敘事最終段'));
  assert(!m21.includes('最終落點'));
  assert(m54.includes('配對不是元素相鄰'));
  assert(m54.includes('不是中心牌、結果位或時間位'));
});

test('Index loads all changed Golden Dawn method components with coherent v101 cache tags', () => {
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  ['tarot-foundation.js', 'tarot_upgrade.js', 'tarot-semantic-engine.js', 'ai-analysis.js', 'prompt-export.js'].forEach((file) => {
    assert(html.includes('JS/' + file + '?v=20260718v101_0'), file);
  });
  assert(html.includes('Golden Dawn 原生方法協議根治'));
});

test('Changed JavaScript files pass syntax checks', () => {
  ['tarot-foundation.js', 'tarot-semantic-engine.js', 'tarot_upgrade.js', 'ai-analysis.js', 'prompt-export.js'].forEach((file) => {
    cp.execFileSync(process.execPath, ['--check', path.join(ROOT, 'JS', file)], { stdio: 'pipe' });
  });
});

if (!process.exitCode) console.log(`\n${passed} tests passed.`);
