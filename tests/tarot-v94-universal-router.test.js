'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(ROOT, 'JS', 'tarot_upgrade.js'), 'utf8');
const picker = fs.readFileSync(path.join(ROOT, 'JS', 'spread-picker.js'), 'utf8');

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

const ids = [
  'three_card','five_card','relationship','either_or','cross','timeline','horseshoe','celtic_cross',
  'tree_of_life','zodiac','minor_arcana','fifteen_card','mathers_21','mathers_horseshoe'
];
const sandbox = { console, setTimeout: fn => fn() };
sandbox.window = sandbox;
sandbox.SPREAD_DEFS = Object.fromEntries(ids.map(id => [id, { id }]));
sandbox.setCurrentSpread = id => { sandbox.currentSpread = id; };
vm.createContext(sandbox);
vm.runInContext(
  extractFunction(source, 'detectSpreadType') + '\n' +
  extractFunction(source, 'resolveTarotSpread') + '\n' +
  'this.detectSpreadType=detectSpreadType;this.resolveTarotSpread=resolveTarotSpread;',
  sandbox,
  { filename: 'spread-router-v94.js' }
);

function route(q, type='general') { return sandbox.detectSpreadType(q, type); }
let passed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log('✓', name); }
  catch (e) { console.error('✗', name); throw e; }
}

test('所有輸入都回傳現有牌陣，並留下可解釋候選與信心值', () => {
  const samples = [
    '', '幫我看看', '這件事我也說不清楚', 'xyzzy', 'What is going on?', '人生',
    '這月我副業營業額能破萬嗎？', '我跟他會怎樣？'
  ];
  for (const q of samples) {
    const id = route(q);
    assert(ids.includes(id), `${q} => ${id}`);
    const d = sandbox._jyLastSpreadDecision;
    assert.strictEqual(d.version, '94.0.0');
    assert.strictEqual(d.engine, 'capability_scoring');
    assert(d.reason && typeof d.reason === 'string');
    assert(Array.isArray(d.candidates) && d.candidates.length >= 2);
    assert(d.confidence >= 0.45 && d.confidence <= 1);
  }
});

test('單一快問、條件門檻、中等盲點與高複雜全局分層', () => {
  assert.strictEqual(route('這件事會成嗎？'), 'three_card');
  assert.strictEqual(route('這個月底前副業營業額能破萬嗎？', 'money'), 'five_card');
  assert.strictEqual(route('這件事我忽略了什麼，接下來該怎麼做，最後會怎樣？'), 'horseshoe');
  assert.strictEqual(route('請完整深入分析這件事的整體局勢、內外影響與所有盲點'), 'celtic_cross');
});

test('專用結構優先：雙方、二選一、時機、卡點、反覆模式', () => {
  assert.strictEqual(route('我跟前任的關係接下來會怎樣？', 'love'), 'relationship');
  assert.strictEqual(route('該留在原公司還是接受新工作？', 'work'), 'either_or');
  assert.strictEqual(route('營業額什麼時候會破萬？', 'money'), 'timeline');
  assert.strictEqual(route('工作卡住的根本原因是什麼，我該怎麼解？', 'work'), 'cross');
  assert.strictEqual(route('為什麼我每次都遇到同樣的感情模式？', 'love'), 'tree_of_life');
});

test('廣度、年度、歷程與人生級完整盤各用對應牌陣', () => {
  assert.strictEqual(route('我今年十二個月各方面的整體運勢如何？'), 'zodiac');
  assert.strictEqual(route('感情、工作和財務想一起完整看'), 'fifteen_card');
  assert.strictEqual(route('這件事從開始到現在怎麼演變，未來又會如何？'), 'mathers_21');
  assert.strictEqual(route('把我的整個人生全部攤開，做最完整的大盤點'), 'mathers_horseshoe');
});

test('具體日常事件與未知人物事件不錯綁關係牌陣', () => {
  assert.strictEqual(route('錢包不見了找得回來嗎？'), 'minor_arcana');
  assert.strictEqual(route('公司有人喜歡我嗎？', 'love'), 'five_card');
});

test('英文與簡體改寫仍依問題結構選陣', () => {
  assert.strictEqual(route('Should I stay or resign?'), 'either_or');
  assert.strictEqual(route('When will my package arrive?'), 'timeline');
  assert.strictEqual(route('Why do I keep choosing unavailable partners?'), 'tree_of_life');
  assert.strictEqual(route('What am I overlooking and what should I do next?'), 'horseshoe');
  assert.strictEqual(route('这个月底前收入能达到一万元吗？', 'money'), 'five_card');
});

test('語義同義改寫保持同一結構，不受字數或問號票數干擾', () => {
  const choice = [
    '我該留下還是離職？',
    '留下與離職，哪個選擇比較適合我？',
    'Should I stay or resign?'
  ].map(q => route(q, 'work'));
  assert(choice.every(x => x === 'either_or'));

  const relation = [
    '我和他目前的關係如何？',
    '他怎麼看我？我們接下來會穩定嗎？',
    '我跟前任之間怎麼回事？接下來呢？會復合嗎？'
  ].map(q => route(q, 'love'));
  assert(relation.every(x => x === 'relationship'));
});

test('自動結果與手動覆寫共用單一解析入口', () => {
  sandbox._forcedSpread = null;
  assert.strictEqual(sandbox.resolveTarotSpread('我忽略了什麼，下一步怎麼做？'), 'horseshoe');
  assert.strictEqual(sandbox._autoDetectedSpread, 'horseshoe');
  sandbox._forcedSpread = 'cross';
  assert.strictEqual(sandbox.resolveTarotSpread('這件事會成嗎？'), 'cross');
  assert.strictEqual(sandbox._autoDetectedSpread, null);
});

test('七張馬蹄形已加入可見牌陣選單，不是隱藏自動路由', () => {
  assert(/horseshoe:\s*\{[^}]*cn:\s*'七張馬蹄形'/.test(picker));
  assert(/常用[^\n]*horseshoe/.test(picker));
});

console.log(`\n${passed} v94 universal semantic router tests passed`);
