'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(ROOT, 'JS', 'tarot_upgrade.js'), 'utf8');
const uiSource = fs.readFileSync(path.join(ROOT, 'JS', 'ui.js'), 'utf8');

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

const sandbox = { console, setTimeout: (fn) => fn() };
sandbox.window = sandbox;
sandbox.SPREAD_DEFS = Object.fromEntries([
  'three_card','five_card','relationship','either_or','cross','timeline','celtic_cross',
  'tree_of_life','zodiac','minor_arcana','fifteen_card','mathers_21','mathers_horseshoe'
].map(id => [id, { id }]));
sandbox.setCurrentSpread = id => { sandbox.currentSpread = id; };
vm.createContext(sandbox);
vm.runInContext(
  extractFunction(source, 'detectSpreadType') + '\n' +
  extractFunction(source, 'resolveTarotSpread') + '\n' +
  'this.detectSpreadType = detectSpreadType; this.resolveTarotSpread = resolveTarotSpread;',
  sandbox,
  { filename: 'spread-router-v93.js' }
);

let passed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log('✓', name); }
  catch (err) { console.error('✗', name); throw err; }
}
function route(q, type = 'general') { return sandbox.detectSpreadType(q, type); }

test('營業額＋本月＋破萬門檻不再誤判為三牌快答', () => {
  assert.strictEqual(route('這月我副業營業額能破萬嗎？', 'money'), 'five_card');
  assert(/門檻|數值目標/.test(sandbox._jyLastSpreadDecision.reason));
});

test('真正單一低複雜度能否題仍使用三牌陣', () => {
  assert.strictEqual(route('這件事會成嗎？'), 'three_card');
});

test('期限內能否與直接問何時被正確分流', () => {
  assert.strictEqual(route('這個月底前營業額能破萬嗎？', 'money'), 'five_card');
  assert.strictEqual(route('營業額什麼時候會破萬？', 'money'), 'timeline');
});

test('已知雙方走關係牌陣，未知人物事件不虛構對方', () => {
  assert.strictEqual(route('我跟前任會復合嗎？', 'love'), 'relationship');
  assert.strictEqual(route('主管怎麼看我？', 'work'), 'relationship');
  assert.strictEqual(route('公司有人喜歡我嗎？', 'love'), 'five_card');
});

test('今年單一關係題不會被「今年＋整體」誤送十二宮', () => {
  assert.strictEqual(route('我今年的整體運勢如何？'), 'zodiac');
  assert.strictEqual(route('今年我跟他的關係整體如何？', 'love'), 'relationship');
});

test('進階牌陣只由其專屬問題結構觸發，不再雜湊輪替', () => {
  assert.strictEqual(route('幫我看看感情和工作整體狀況'), 'fifteen_card');
  assert.strictEqual(route('這段關係的來龍去脈是什麼？', 'love'), 'mathers_21');
  assert.strictEqual(route('把我的人生全部攤開看一次最完整的'), 'mathers_horseshoe');
  assert.strictEqual(route('請完整分析目前這件事的整體局勢與所有影響'), 'celtic_cross');
  const routerSlice = source.slice(source.indexOf('function detectSpreadType'), source.indexOf('// ── 建構牌陣結果物件'));
  assert(!routerSlice.includes('_pickBySeed'));
});

test('二選一、卡點、重複模式與日常小事各走專屬結構', () => {
  assert.strictEqual(route('該留下還是離職？', 'work'), 'either_or');
  assert.strictEqual(route('我陷入瓶頸了怎麼辦？'), 'cross');
  assert.strictEqual(route('為什麼我總是遇到同一種人？', 'love'), 'tree_of_life');
  assert.strictEqual(route('錢包不見了找得回來嗎？'), 'minor_arcana');
});

test('多選項不硬塞二選一牌陣', () => {
  assert.strictEqual(route('A、B、C 哪個比較好？'), 'five_card');
});

test('多問號不再由 UI 旁路強制改成凱爾特十字', () => {
  assert.strictEqual(route('我和他之間怎麼回事？接下來呢？會穩定嗎？', 'love'), 'relationship');
  assert(!uiSource.includes("if (qMarkCount >= 3) spreadId = 'celtic_cross'"));
  assert(!uiSource.includes("if (qm >= 3) sid = 'celtic_cross'"));
  assert((uiSource.match(/JY_resolveTarotSpread/g) || []).length >= 5);
});

test('中央解析入口同步自動結果，手動指定仍有最高優先權', () => {
  sandbox._forcedSpread = null;
  assert.strictEqual(sandbox.resolveTarotSpread('這月我副業營業額能破萬嗎？', 'money'), 'five_card');
  assert.strictEqual(sandbox._autoDetectedSpread, 'five_card');
  assert.strictEqual(sandbox.currentSpread, 'five_card');
  sandbox._forcedSpread = 'cross';
  assert.strictEqual(sandbox.resolveTarotSpread('這件事會成嗎？', 'general'), 'cross');
  assert.strictEqual(sandbox._autoDetectedSpread, null);
  assert.strictEqual(sandbox.currentSpread, 'cross');
});

console.log(`\n${passed} v93 semantic spread router tests passed`);
