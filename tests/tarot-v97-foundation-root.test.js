'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const childProcess = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const read = rel => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const json = value => JSON.parse(JSON.stringify(value));

function segment(code, startToken, endToken) {
  const a = code.indexOf(startToken);
  assert(a >= 0, `missing segment start: ${startToken}`);
  const b = code.indexOf(endToken, a + startToken.length);
  assert(b > a, `missing segment end: ${endToken}`);
  return code.slice(a, b);
}

function functionText(code, name) {
  const start = code.indexOf(`function ${name}(`);
  assert(start >= 0, `missing function ${name}`);
  let i = code.indexOf('{', start);
  let depth = 0;
  let quote = null;
  let escaped = false;
  let lineComment = false;
  let blockComment = false;
  for (; i < code.length; i++) {
    const ch = code[i], next = code[i + 1];
    if (lineComment) { if (ch === '\n') lineComment = false; continue; }
    if (blockComment) { if (ch === '*' && next === '/') { blockComment = false; i++; } continue; }
    if (quote) {
      if (escaped) { escaped = false; continue; }
      if (ch === '\\') { escaped = true; continue; }
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === '/' && next === '/') { lineComment = true; i++; continue; }
    if (ch === '/' && next === '*') { blockComment = true; i++; continue; }
    if (ch === '"' || ch === "'" || ch === '`') { quote = ch; continue; }
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) return code.slice(start, i + 1);
    }
  }
  throw new Error(`unclosed function ${name}`);
}

function dummyCards(n) {
  const suits = ['wand', 'cup', 'sword', 'pent'];
  const zh = { wand:'權杖', cup:'聖杯', sword:'寶劍', pent:'金幣' };
  return Array.from({ length:n }, (_, i) => {
    const suit = suits[i % 4], num = (i % 10) + 1;
    return {
      id:22 + i, n:zh[suit] + (num === 1 ? '王牌' : String(num)), suit,
      rank:num === 1 ? 'ace' : String(num), num, position:'位置' + (i + 1),
      semanticCandidates:['Book T 候選'], sourceGloss:'Book T 來源素材', isUp:true
    };
  });
}

// ──────────────────────────────────────────────────────────────────────
// 1. One registry is the source of truth for methods, roles, dignity lines.
// ──────────────────────────────────────────────────────────────────────
const Foundation = require(path.join(ROOT, 'JS/tarot-foundation.js'));
assert.strictEqual(Foundation.VERSION, '97.0.0');
assert.strictEqual(Foundation.SCHEMA, 'jy.tarot.foundation/2');
assert.deepStrictEqual(Foundation.validateMethodRegistry(), { ok:true, errors:[] });

const methodIds = [
  'three_card','five_card','cross','either_or','relationship','timeline','horseshoe',
  'celtic_cross','tree_of_life','zodiac','minor_arcana','fifteen_card',
  'mathers_21','mathers_horseshoe','ootk'
];
assert.deepStrictEqual(Object.keys(Foundation.METHODS), methodIds);
methodIds.forEach(id => {
  const m = Foundation.getMethod(id);
  assert(m && m.id === id, `registry method missing: ${id}`);
  assert(m.layoutSource, `layout provenance missing: ${id}`);
  if (id !== 'ootk') assert.strictEqual(m.slots.length, m.count, `slot count mismatch: ${id}`);
  (m.dignityLines || []).forEach(line => assert(line.length >= 3, `pair-only dignity line: ${id}`));
});
assert.deepStrictEqual(Foundation.getDignityLines('cross'), [[2,0,3],[4,0,1]]);
assert.deepStrictEqual(Foundation.getDignityLines('celtic_cross'), [[4,0,5],[3,0,2],[6,7,8,9]]);
assert.deepStrictEqual(Foundation.getCompatibilityEdges('celtic_cross'), [[0,1]]);
assert.deepStrictEqual(
  Foundation.getMethod('cross').slots.map(x => x.authority),
  ['state','interaction_force','antecedent','development','advice']
);
assert.deepStrictEqual(
  Foundation.getMethod('fifteen_card').slots.map(x => x.authority),
  ['state','state','state','development','development','advice','structural','development','development','advice','structural','development','development','advice','structural']
);

// ──────────────────────────────────────────────────────────────────────
// 2. Typed query compiler: question truth conditions, not keyword patches.
// ──────────────────────────────────────────────────────────────────────
function compile(q) { return Foundation.compileQuestion(q, { referenceDate:'2026-07-17' }); }
function route(q) { return Foundation.routeQuestion(compile(q), { referenceDate:'2026-07-17' }); }
function assertGraph(q) {
  const c = compile(q), g = c.queryGraph;
  assert.strictEqual(g.compilerStatus, 'validated_atomized', q);
  assert(g.validation.roundTripCompatible, q);
  assert(g.validation.everyDeletionChangesTruthConditions, q);
  assert(g.validation.noAddedPremise, q);
  assert(g.validation.noWholeQuestionAtom, q);
  assert(g.validation.allAtomsBound, q);
  assert(g.requiredAtoms.every(a => a.eventId === 'QUERY_EVENT' && a.role), q);
  assert(g.requiredAtoms.every(a => Foundation.normalizeQuestion(a.text) !== c.normalizedQuestion), q);
  return c;
}

let c = assertGraph('今年運勢為何');
assert.strictEqual(c.features.causal, false, 'nominal 為何 must not become a cause question');
assert.deepStrictEqual(c.queryGraph.requiredAtoms.map(a => [a.kind,a.text]), [
  ['actor','問卜者本人'],['state_target','運勢'],['query_operator','qualitative_description'],['scope','今年〔2026年〕']
]);
assert.strictEqual(c.queryGraph.roundTripReconstruction, '今年運勢如何');
assert(c.queryGraph.assumptions.some(a => a.type === 'deictic_subject_resolution'));

c = assertGraph('為什麼今年工作一直卡住');
assert.strictEqual(c.features.causal, true);
assert(c.requestedDimensions.some(d => d.id === 'cause'));

c = assertGraph('今年年底前工作運勢如何');
assert.strictEqual(c.queryGraph.requiredAtoms.filter(a => a.role === 'timeScope').length, 2);
assert(c.queryGraph.validation.everyDeletionChangesTruthConditions);

c = assertGraph('我副業蝦皮賣場未來可以超過正職的收入嗎？');
assert.deepStrictEqual(c.queryGraph.requiredAtoms.map(a => a.kind), [
  'actor','left_operand','measured_attribute','comparator','right_operand','modality','scope'
]);
assert.deepStrictEqual(c.queryGraph.requiredAtoms.map(a => a.text), [
  '問卜者本人','副業蝦皮賣場','收入','超過','正職','可以','未來〔未來〕'
]);
assert(!c.requestedDimensions.some(d => d.id === 'exact_value'));
assert(c.requestedDimensions.some(d => d.id === 'threshold_crossing'));
assert.deepStrictEqual(c.relations.map(r => [r.left,r.right,r.scale,r.operator]), [['副業蝦皮賣場','正職','收入','gt']]);
assert(compile('我的副業收入是多少錢？').requestedDimensions.some(d => d.id === 'exact_value'));

assert.strictEqual(assertGraph('我想完整了解目前人生局勢').queryGraph.requiredAtoms.find(a => a.role === 'target').text, '人生局勢');
assert.strictEqual(assertGraph('我想知道這件事的來龍去脈').queryGraph.requiredAtoms.find(a => a.role === 'target').text, '這件事的來龍去脈');
assert.strictEqual(assertGraph('把我整個人生所有面向徹底攤開').queryGraph.requiredAtoms.find(a => a.role === 'target').text, '整個人生所有面向');

// ──────────────────────────────────────────────────────────────────────
// 3. Deterministic capability gates cover distinct problem structures.
// ──────────────────────────────────────────────────────────────────────
const routingCases = [
  ['今年運勢為何','zodiac'],
  ['為什麼今年工作一直卡住','cross'],
  ['今年工作運勢如何','five_card'],
  ['我今年工作和財運整體如何','fifteen_card'],
  ['我該留任還是離職','either_or'],
  ['我和前任的關係會怎麼發展','relationship'],
  ['有人喜歡我嗎','three_card'],
  ['什麼時候會找到工作','timeline'],
  ['我的鑰匙掉在哪裡','minor_arcana'],
  ['這件事有什麼隱藏因素和外在阻礙','horseshoe'],
  ['我想完整了解目前人生局勢','celtic_cross'],
  ['我為什麼總是重複同樣的感情模式','tree_of_life'],
  ['我想知道這件事的來龍去脈','mathers_21'],
  ['把我整個人生所有面向徹底攤開','mathers_horseshoe'],
  ['請用開鑰之法看這件事','ootk']
];
routingCases.forEach(([q,id]) => {
  const r = route(q);
  assert.strictEqual(r.spreadId, id, `${q} -> ${r.spreadId}, expected ${id}`);
  assert.strictEqual(r.selectedBy, id === 'ootk' ? 'explicit' : 'deterministic_capability_gates');
  assert(r.reason);
});
assert.notStrictEqual(route('有人喜歡我嗎').spreadId, 'relationship', 'unknown person must not be invented as a dyad');
assert.strictEqual(route('我和主管的關係如何').spreadId, 'relationship');
assert.strictEqual(route('請用凱爾特十字看工作').spreadId, 'celtic_cross');

// ──────────────────────────────────────────────────────────────────────
// 4. Book T source core and elemental dignity are separate from spread links.
// ──────────────────────────────────────────────────────────────────────
global.JYTarotFoundation = Foundation;
delete require.cache[require.resolve(path.join(ROOT, 'JS/golden-dawn-tarot.js'))];
require(path.join(ROOT, 'JS/golden-dawn-tarot.js'));
const GD = global.JYGoldenDawn;
assert(GD);
assert.strictEqual(GD.version, '3.0.0');
assert.strictEqual(GD.sourceId, 'gd_book_t');
assert(/不使用 Waite 固定正逆/.test(GD.sourceContract().reversalPolicy));
assert(/後世牌陣的因果／語義連線不自動等於 Book T 左右相鄰/.test(GD.sourceContract().spreadPolicy));

let p = GD.profile({n:'寶劍七',suit:'sword',rank:'7',num:7});
assert.strictEqual(p.bookTTitle, '不穩定努力之主');
assert(/部分成功/.test(p.sourceCore) && /未繼續努力/.test(p.sourceCore));
assert(!/低調行動|避開正面耗損|審查資訊/.test(p.sourceCore));
p = GD.profile({n:'金幣八',suit:'pent',rank:'8',num:8});
assert(/過度謹慎/.test(p.sourceCore) && /小額現金收益/.test(p.sourceCore));
p = GD.profile({n:'寶劍十',suit:'sword',rank:'10',num:10});
assert(/完全瓦解/.test(p.sourceCore));
p = GD.profile({n:'聖杯騎士',suit:'cup',rank:'knight'});
assert(/Prince of the Chariot of the Waters/.test(p.bookTTitle));
assert(/細微/.test(p.sourceCore) && /強烈/.test(p.sourceCore) && /狡黠/.test(p.sourceCore) && /藝術性/.test(p.sourceCore));

assert.strictEqual(GD.relation({suit:'cup'},{suit:'cup'}).code, 'same_suit');
assert.strictEqual(GD.relation({suit:'wand'},{suit:'major',n:'皇帝',el:'火'}).code, 'strengthen');
assert(GD.relation({suit:'cup'},{suit:'cup'}).effect > GD.relation({suit:'wand'},{suit:'major',n:'皇帝',el:'火'}).effect);
assert.strictEqual(GD.relation({suit:'wand'},{suit:'cup'}).code, 'weaken');
assert.strictEqual(GD.relation({suit:'sword'},{suit:'pent'}).code, 'weaken');
assert.strictEqual(GD.relation({suit:'wand'},{suit:'pent'}).code, 'support');

const crossCards = dummyCards(5);
assert.strictEqual(GD.dignityContext(crossCards,0,'cross').state, 'multi_line');
assert.strictEqual(GD.dignityContext(crossCards,2,'cross').fullDignity, false);
const ccCards = dummyCards(10);
assert.strictEqual(GD.dignityContext(ccCards,0,'celtic_cross').state, 'multi_line');
assert.strictEqual(GD.dignityContext(ccCards,1,'celtic_cross').state, 'interaction_only');
assert.strictEqual(GD.dignityContext(ccCards,1,'celtic_cross').fullDignity, false);

// ──────────────────────────────────────────────────────────────────────
// 5. Semantic contracts consume Foundation; no second role/topology system.
// ──────────────────────────────────────────────────────────────────────
delete require.cache[require.resolve(path.join(ROOT, 'JS/tarot-semantic-engine.js'))];
const Engine = require(path.join(ROOT, 'JS/tarot-semantic-engine.js'));
assert.strictEqual(Engine.VERSION, '97.0.0');
assert.strictEqual(Engine.Foundation, Foundation);
assert.deepStrictEqual(Engine.METHOD_SPECS.cross.roles, ['state','interaction_force','antecedent','development','advice']);
assert.deepStrictEqual(Engine.METHOD_SPECS.fifteen_card.roles, Foundation.getMethod('fifteen_card').slots.map(x => x.authority));
methodIds.forEach(id => {
  assert(Engine.METHOD_SPECS[id], `semantic method missing: ${id}`);
  assert.strictEqual(Engine.METHOD_SPECS[id].sourceProfile, 'gd_book_t');
  assert.strictEqual(Engine.METHOD_SPECS[id].layoutSource, Foundation.getMethod(id).layoutSource);
});

function spec(q,id,n) {
  return Engine.compileReadingSpec({question:q,spreadId:id,sourceProfile:'gd_book_t',cards:dummyCards(n),referenceDate:'2026-07-17'});
}
let sp = spec('今年運勢為何','cross',5);
assert(sp.validation.ok, sp.validation.errors.join(','));
let cap = sp.capabilityMatrix.find(x => x.dimensionId === 'annual_overview');
assert(cap && cap.canAnswer === false && cap.precheckStatus === 'not_measured');
sp = spec('今年運勢為何','zodiac',13);
assert(sp.validation.ok, sp.validation.errors.join(','));
cap = sp.capabilityMatrix.find(x => x.dimensionId === 'annual_overview');
assert(cap && cap.canAnswer === true && cap.precheckStatus === 'direct_channel');
assert.strictEqual(sp.evidenceGraph.nodes[12].authority, 'synthesis');
sp = spec('我的鑰匙掉在哪裡','minor_arcana',7);
assert(sp.validation.ok, sp.validation.errors.join(','));
assert(sp.capabilityMatrix.find(x => x.dimensionId === 'location').canAnswer);
sp = spec('我今年工作和財運整體如何','fifteen_card',15);
assert(sp.validation.ok, sp.validation.errors.join(','));
assert(sp.capabilityMatrix.find(x => x.dimensionId === 'multi_domain').canAnswer);
sp = spec('我副業蝦皮賣場未來可以超過正職的收入嗎？','five_card',5);
assert(sp.validation.ok, sp.validation.errors.join(','));
cap = sp.capabilityMatrix.find(x => x.dimensionId === 'threshold_crossing');
assert(cap && cap.canAnswer && /不能量測差額、金額、比例或機率/.test(cap.reason));
const wrongSource = Engine.compileReadingSpec({question:'結果如何',spreadId:'three_card',sourceProfile:'modern_rws',cards:dummyCards(3)});
assert(!wrongSource.validation.ok && wrongSource.validation.errors.some(x => x.includes('source_profile_not_allowed')));

// ──────────────────────────────────────────────────────────────────────
// 6. Runtime source firewall: route, UI, payload, and cross-system summary.
// ──────────────────────────────────────────────────────────────────────
const upgrade = read('JS/tarot_upgrade.js');
const detector = functionText(upgrade, 'detectSpreadType');
assert(detector.includes('foundation.routeQuestion'));
assert(detector.includes('fail_closed'));
assert(!/semantic_score|question\.length\s*[><=]|Math\.random/.test(detector));
const numerologyFn = functionText(upgrade, 'tarotNumerologyAnalysis');
assert(/return null/.test(numerologyFn));
assert(!/numCounts|finalNum|totalReduction/.test(numerologyFn));
const kabbalahFn = functionText(upgrade, 'tarotKabbalahAnalysis');
assert(kabbalahFn.includes('gd.profile'));
assert(kabbalahFn.includes("sourceProfile: 'gd_book_t'"));
assert(!kabbalahFn.includes('TAROT_KABBALAH['));
const renderHelper = functionText(upgrade, 'getBookTRenderData');
assert(renderHelper.includes('gd.profile'));
assert(renderHelper.includes('gd.dignityContext'));
assert(!/getTarotDeep|kwRv|loveUp|careerUp|wealthUp|healthUp|\.rv\b/.test(renderHelper));
const activeShow = segment(upgrade, '// 9. showSpread 覆寫', '// 10. TAROT_DEEP 擴充');
assert(activeShow.includes('getBookTRenderData'));
assert(!/getTarotDeep|loveUp|careerUp|wealthUp|healthUp|transform:rotate\(180deg\)|c\.isUp\?/.test(activeShow));

const ai = read('JS/ai-analysis.js');
const payloadFn = segment(ai, 'function _buildTarotOnlyPayload()', 'async function _triggerTarotAI()');
[
  'reversedType','_suitTime','opposingPairs','decisionLean','numerologyText','signifier',
  'getTarotTypeMeaning','loveUp','careerUp','kwRv'
].forEach(x => assert(!payloadFn.includes(x), `legacy payload field present: ${x}`));
assert(payloadFn.includes('foundation.getMethod'));
assert(payloadFn.includes('gd.profile'));
assert(payloadFn.includes('semantic.validateContract'));
assert(payloadFn.includes("sourceProfile:'gd_book_t'"));
const renderTarotFn = segment(ai, 'function renderTarot(){', 'function getTypeLabel');
assert(renderTarotFn.includes('gd.profile'));
assert(renderTarotFn.includes('gd.dignityContext'));
assert(!/getTarotTypeMeaning|buildTarotStats|c\.isUp|upCount|rvCount|numCluster|TAROT\[|transform\s*:\s*rotate/.test(renderTarotFn));
const talkTarotFn = segment(ai, 'function talkTarot(tarot, focusType){', 'function talkNatal');
assert(talkTarotFn.includes('gd.profile'));
assert(talkTarotFn.includes('foundation.getMethod'));
assert(!/getTarotTypeMeaning|c\.isUp|upCount|rvCount|analyzeTarotInteractions|TAROT\[/.test(talkTarotFn));
assert(!ai.includes('這件事在命運層級有份量'));
assert(!ai.includes('牌面主導元素是「'));

// ──────────────────────────────────────────────────────────────────────
// 7. Opening of the Key algorithm invariants remain intact.
// ──────────────────────────────────────────────────────────────────────
const ootkBox = {
  console,
  getBookTCountDirection: () => 1,
  getCountValue: card => card.count,
  elementalDignity: () => 'support',
  getCardElement: card => card.element || ''
};
vm.createContext(ootkBox);
vm.runInContext(
  functionText(upgrade,'ootkCounting')+'\n'+functionText(upgrade,'ootkPairing')+'\n'+functionText(upgrade,'ootkDignities')+'\n'+
  'this.ootkCounting=ootkCounting;this.ootkPairing=ootkPairing;this.ootkDignities=ootkDignities;',
  ootkBox
);
const countCards=[{id:0,n:'A',count:3},{id:1,n:'B',count:2},{id:2,n:'C',count:2}];
assert.deepStrictEqual(json(ootkBox.ootkCounting(countCards,0).path.map(x=>x.position)),[0,2]);
const seven=Array.from({length:7},(_,i)=>({id:i,n:String(i)}));
assert.deepStrictEqual(json(ootkBox.ootkPairing(seven,3).map(x=>[x.left.id,x.right.id])),[[2,4],[1,5],[0,6]]);
assert.deepStrictEqual(json(ootkBox.ootkPairing(seven,0)),[]);
const dignities=ootkBox.ootkDignities([{card:seven[0]},{card:seven[1]},{card:seven[2]}]);
assert.strictEqual(dignities[1].fullDignity,true);
assert.strictEqual(dignities[0].fullDignity,false);
assert(/for \(var c = 1; c < count; c\+\+\)/.test(functionText(upgrade,'ootkCounting')));
assert(!/% n|circular|Source of the Nile|freeAgent/.test(functionText(upgrade,'ootkPairing')));
assert(upgrade.includes("pendingCheckpoint: 'op1_main_line_confirmation'"));
assert(!/SEPHIRAH_OMEN/.test(upgrade));

// ──────────────────────────────────────────────────────────────────────
// 8. Load order, prompt boundary, syntax, and test wiring.
// ──────────────────────────────────────────────────────────────────────
const index = read('index.html');
const orderedScripts = [
  'JS/tarot-foundation.js','JS/golden-dawn-tarot.js','JS/tarot.js','JS/tarot_upgrade.js',
  'JS/tarot-semantic-engine.js','JS/ai-analysis.js','JS/prompt-export.js'
];
const positions = orderedScripts.map(x => index.indexOf(x));
positions.forEach((x,i) => assert(x >= 0, `script missing: ${orderedScripts[i]}`));
for (let i=1;i<positions.length;i++) assert(positions[i] > positions[i-1], 'script load order wrong');
assert(index.includes('20260717v97_0'));

const prompt = read('JS/prompt-export.js');
assert(prompt.includes('完整尊貴須在明示有序牌列中由同一張牌左右兩側共同裁決'));
assert(prompt.includes('後世牌陣的因果連線只構成互動，不自動冒充 Book T 左右相鄰'));
assert(!/收入\|薪水\|薪資[^\n]{0,80}add\('exact_value'/.test(prompt));

[
  'JS/tarot-foundation.js','JS/golden-dawn-tarot.js','JS/tarot-semantic-engine.js',
  'JS/tarot_upgrade.js','JS/ai-analysis.js','JS/prompt-export.js'
].forEach(rel => childProcess.execFileSync(process.execPath,['--check',path.join(ROOT,rel)],{stdio:'pipe'}));

const pkg = JSON.parse(read('package.json'));
assert.strictEqual(pkg.scripts['test:tarot'], 'node tests/tarot-v97-foundation-root.test.js');

console.log('tarot-v97-foundation-root: PASS');
