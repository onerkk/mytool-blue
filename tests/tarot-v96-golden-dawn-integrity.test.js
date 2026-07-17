'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ROOT = path.resolve(__dirname, '..');
const read = rel => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const json = value => JSON.parse(JSON.stringify(value));

function extractFunction(code, name) {
  const start = code.indexOf(`function ${name}(`);
  assert(start >= 0, `missing function ${name}`);
  let i = code.indexOf('{', start), depth = 0;
  for (; i < code.length; i++) {
    if (code[i] === '{') depth++;
    else if (code[i] === '}') {
      depth--;
      if (depth === 0) return code.slice(start, i + 1);
    }
  }
  throw new Error(`unclosed function ${name}`);
}

// 1) Unified Book T core and source-faithful meanings.
const gdBox = { console };
gdBox.window = gdBox;
gdBox.globalThis = gdBox;
vm.createContext(gdBox);
vm.runInContext(read('JS/golden-dawn-tarot.js'), gdBox, { filename: 'golden-dawn-tarot.js' });
const gd = gdBox.JYGoldenDawn;
assert(gd, 'JYGoldenDawn must load');
assert.strictEqual(gd.version, '2.0.0');
assert.strictEqual(gd.sourceId, 'gd_book_t');
assert(/不使用 Waite 固定正逆/.test(gd.sourceContract().reversalPolicy));
assert(/後世牌陣的因果／語義連線不自動等於 Book T 左右相鄰/.test(gd.sourceContract().spreadPolicy));

let p = gd.profile({ n:'寶劍七', suit:'sword', rank:'7', num:7 });
assert.strictEqual(p.bookTTitle, '不穩定努力之主');
assert(/部分成功/.test(p.core) && /未繼續努力/.test(p.core));
assert(!/低調行動|避開正面耗損|審查資訊/.test(p.core));
p = gd.profile({ n:'金幣八', suit:'pent', rank:'8', num:8 });
assert(/過度謹慎/.test(p.core) && /小額現金收益/.test(p.core) && /缺乏進取/.test(p.core));
p = gd.profile({ n:'寶劍十', suit:'sword', rank:'10', num:10 });
assert(/完全瓦解/.test(p.core) && /計畫與工程遭到毀壞/.test(p.core));
p = gd.profile({ n:'聖杯騎士', suit:'cup', rank:'knight' });
assert(/Prince of the Chariot of the Waters/.test(p.bookTTitle));
assert(/細微/.test(p.core) && /強烈/.test(p.core) && /狡黠/.test(p.core) && /藝術性/.test(p.core) && /外表平靜/.test(p.core));
assert(Array.isArray(gd.courtRolePriority.knight));
assert(/與事情相關的人物/.test(gd.courtRolePriority.knight[0]));

// 2) Dignity topology is separated from modern spread dependency topology.
assert.deepStrictEqual(json(gd.spreadDignityLines('celtic_cross', 10)), [[4,0,5],[3,0,2],[6,7,8,9]]);
assert.deepStrictEqual(json(gd.spreadCompatibilityEdges('celtic_cross')), [[0,1]]);
assert.deepStrictEqual(json(gd.spreadDependencyGroups('celtic_cross', 10)), [[0,1],[2,0,3],[4,0,5],[6,7,8,9]]);
const ccCards = [
  {n:'核心',suit:'cup',rank:'2',num:2},{n:'交叉',suit:'cup',rank:'3',num:3},
  {n:'上方',suit:'sword',rank:'4',num:4},{n:'根基',suit:'wand',rank:'5',num:5},
  {n:'過去',suit:'pent',rank:'6',num:6},{n:'未來',suit:'pent',rank:'7',num:7},
  {n:'本人',suit:'wand',rank:'8',num:8},{n:'環境',suit:'pent',rank:'9',num:9},
  {n:'希望',suit:'sword',rank:'9',num:9},{n:'結果',suit:'sword',rank:'10',num:10}
];
assert.strictEqual(gd.dignityContext(ccCards, 0, 'celtic_cross').state, 'multi_line');
assert.strictEqual(gd.dignityContext(ccCards, 1, 'celtic_cross').state, 'interaction_only');
assert.strictEqual(gd.dignityContext(ccCards, 1, 'celtic_cross').fullDignity, false);

// 3) Typed question graph: no whole-question pseudo atom and no false exact-value request.
const engine = require(path.join(ROOT, 'JS/tarot-semantic-engine.js'));
assert.strictEqual(engine.VERSION, '96.0.0');
const question = '我副業蝦皮賣場未來可以超過正職的收入嗎？';
const q = engine.compileQuestion(question);
const atoms = q.queryGraph.requiredAtoms;
assert.deepStrictEqual(atoms.map(a => a.kind), ['actor','left_operand','measured_attribute','comparator','right_operand','modality','scope']);
assert.deepStrictEqual(atoms.map(a => a.text), ['我','副業蝦皮賣場','收入','超過','正職','可以','未來']);
assert(atoms.every(a => a.eventId === 'QUERY_EVENT' && a.role));
assert(!q.requestedDimensions.some(d => d.id === 'exact_value'));
assert(q.queryGraph.roundTripReconstruction.includes('我的副業蝦皮賣場'));
assert.strictEqual(q.relations[0].leftEntity, '我副業蝦皮賣場');
assert.strictEqual(q.relations[0].rightEntity, '正職');
assert.strictEqual(q.relations[0].scale, '收入');
const amountQ = engine.compileQuestion('我的副業收入是多少錢？');
assert(amountQ.requestedDimensions.some(d => d.id === 'exact_value'));
const trendQ = engine.compileQuestion('我的副業收入會成長嗎？');
assert(trendQ.requestedDimensions.some(d => d.id === 'trend'));
assert(!trendQ.requestedDimensions.some(d => d.id === 'threshold_crossing'));
assert.deepStrictEqual(
  engine.compileQuestion('我副業能成功超過正職收入嗎？').relations.map(r=>[r.left,r.right,r.scale]),
  engine.compileQuestion('我的副業收入會高於正職收入嗎？').relations.map(r=>[r.left,r.right,r.scale])
);

// 4) A query-bound threshold is qualitatively answerable by outcome layouts, but exact amounts are not invented.
const celtic = engine.compileReadingSpec({ question, spreadId:'celtic_cross', sourceProfile:'gd_book_t', cards:ccCards });
const threshold = celtic.capabilityMatrix.find(x => x.dimensionId === 'threshold_crossing');
assert(threshold && threshold.canAnswer === true);
assert.strictEqual(threshold.precheckStatus, 'qualitative_relational_event');
assert(/不能量測差額、金額、比例或機率/.test(threshold.reason));
assert.strictEqual(celtic.method.layoutSource, '後世觀測布局；不得冒充 Book T 原創');
const either = engine.compileReadingSpec({ question:'A還是B比較好？', spreadId:'either_or', sourceProfile:'gd_book_t', cards:[] });
const comparison = either.capabilityMatrix.find(x => x.dimensionId === 'comparison');
assert(comparison && comparison.canAnswer === true);

// 5) Opening of the Key core algorithms: count includes the starting card; generic pairing is linear, not circular.
const upgrade = read('JS/tarot_upgrade.js');
const ootkBox = {
  console,
  getBookTCountDirection: () => 1,
  getCountValue: card => card.count,
  elementalDignity: () => 'support',
  getCardElement: card => card.element || ''
};
vm.createContext(ootkBox);
vm.runInContext(
  extractFunction(upgrade, 'ootkCounting') + '\n' +
  extractFunction(upgrade, 'ootkPairing') + '\n' +
  extractFunction(upgrade, 'ootkDignities') + '\n' +
  'this.ootkCounting=ootkCounting;this.ootkPairing=ootkPairing;this.ootkDignities=ootkDignities;',
  ootkBox
);
const countCards = [{id:0,n:'A',count:3},{id:1,n:'B',count:2},{id:2,n:'C',count:2}];
assert.deepStrictEqual(json(ootkBox.ootkCounting(countCards,0).path.map(x => x.position)), [0,2]);
const seven = Array.from({length:7}, (_,i)=>({id:i,n:String(i)}));
assert.deepStrictEqual(json(ootkBox.ootkPairing(seven,3).map(x => [x.left.id,x.right.id])), [[2,4],[1,5],[0,6]]);
assert.deepStrictEqual(json(ootkBox.ootkPairing(seven,0)), []);
const dignity = ootkBox.ootkDignities([{card:seven[0]},{card:seven[1]},{card:seven[2]}]);
assert.strictEqual(dignity[1].fullDignity, true);
assert.strictEqual(dignity[0].fullDignity, false);
assert.strictEqual(dignity[0].dignityScope, 'one_sided_local_context');
assert(/for \(var c = 1; c < count; c\+\+\)/.test(extractFunction(upgrade,'ootkCounting')));
assert(!/% n|circular|freeAgent|Source of the Nile/.test(extractFunction(upgrade,'ootkPairing')));
assert(/op3Policy:bindings\.op3Policy === 'observe_only'/.test(upgrade));
assert(/countDirection:bindings\.countDirection === 'left'/.test(upgrade));
assert(upgrade.includes('ootk-bind-direction'));
assert(/!bindings\.countDirection/.test(upgrade));
assert(/mainLineValidation/.test(upgrade));
assert(/pendingCheckpoint: 'op1_main_line_confirmation'/.test(upgrade));
assert(!/SEPHIRAH_OMEN/.test(upgrade));
assert(!/keyHouses: keyHouses/.test(upgrade));

// 6) Prompt and payload preserve source boundaries and procedural uncertainty.
const prompt = read('JS/prompt-export.js');
assert(prompt.includes('完整尊貴須在明示有序牌列中由同一張牌左右兩側共同裁決'));
assert(prompt.includes('程序完成但第一次操作主要線索尚未由問卜者確認，只能標為暫定'));
assert(prompt.includes('後世牌陣的因果連線只構成互動，不自動冒充 Book T 左右相鄰'));
assert(!/收入\|薪水\|薪資[^\n]{0,80}add\('exact_value'/.test(prompt));
const ai = read('JS/ai-analysis.js');
assert(ai.includes('out.mainLineValidation = op.mainLineValidation || null'));
assert(ai.includes('out.procedurePolicy = op.procedurePolicy ||'));
assert(ai.includes('predeclaredBindings: results.predeclaredBindings || null'));
assert(ai.includes('divinationValidity: results.divinationValidity || null'));

// 7) Every public spread is source-locked, with layout provenance declared separately.
const spreadIds = ['three_card','five_card','cross','either_or','relationship','timeline','celtic_cross','tree_of_life','zodiac','minor_arcana','fifteen_card','mathers_21','mathers_horseshoe','horseshoe','ootk'];
spreadIds.forEach(id => {
  const spec = engine.METHOD_SPECS[id];
  assert(spec, `${id} missing`);
  assert.strictEqual(spec.sourceProfile, 'gd_book_t');
  assert(spec.layoutSource, `${id} layoutSource missing`);
});
assert.strictEqual(engine.METHOD_SPECS.ootk.layoutSource, 'Golden Dawn《Book T／Liber T》程序');
assert(/Mathers 歷史布局/.test(engine.METHOD_SPECS.mathers_21.layoutSource));
const wrongSource = engine.compileReadingSpec({question:'結果？', spreadId:'three_card', sourceProfile:'modern_rws', cards:ccCards.slice(0,3)});
assert.strictEqual(wrongSource.validation.ok, false);
assert(wrongSource.validation.errors.some(x=>x.includes('source_profile_not_allowed')));

// 8) Runtime load order and cache-bust version.
const index = read('index.html');
const order = ['JS/golden-dawn-tarot.js','JS/tarot.js','JS/tarot_upgrade.js','JS/tarot-semantic-engine.js','JS/ai-analysis.js','JS/prompt-export.js'].map(x => index.indexOf(x));
order.forEach((n,i)=>assert(n >= 0, `script missing: ${i}`));
for (let i=1;i<order.length;i++) assert(order[i] > order[i-1], 'script load order wrong');
assert(index.includes('20260717v96_0'));

console.log('tarot-v96-golden-dawn-integrity: PASS');
