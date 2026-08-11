#!/usr/bin/env node
'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
let passed = 0;

function read(file) {
  return fs.readFileSync(path.join(ROOT, file), 'utf8');
}

function test(name, fn) {
  try {
    fn();
    passed += 1;
    console.log('✓ ' + name);
  } catch (error) {
    console.error('✗ ' + name + '\n' + (error.stack || error));
    process.exitCode = 1;
  }
}

function fakeElement() {
  return {
    style: {}, dataset: {},
    classList: { add() {}, remove() {}, contains() { return false; } },
    appendChild() {}, removeChild() {}, remove() {}, setAttribute() {}, addEventListener() {},
    querySelector() { return null; }, querySelectorAll() { return []; },
    innerHTML: '', textContent: '', value: '', checked: false, parentNode: null
  };
}

function createContext() {
  const body = fakeElement();
  const document = {
    title: '', body, head: fakeElement(),
    createElement() { const x = fakeElement(); x.parentNode = body; return x; },
    getElementById() { return null; }, addEventListener() {},
    querySelector() { return null; }, querySelectorAll() { return []; }
  };
  const ctx = {
    console: { log() {}, warn() {}, error: console.error }, Date, Math, Intl,
    TextEncoder, TextDecoder, setTimeout, clearTimeout, setInterval, clearInterval,
    document, navigator: { clipboard: { writeText: async () => {} } },
    location: { hostname: 'localhost', href: 'http://localhost/' },
    localStorage: { getItem() { return null; }, setItem() {}, removeItem() {} },
    alert() {}, open() { return null; }, requestIdleCallback(fn) { fn(); },
    performance: { now: () => 0 }
  };
  ctx.window = ctx;
  ctx.global = ctx;
  vm.createContext(ctx);
  return ctx;
}

function loadBaziRuntime() {
  const ctx = createContext();
  [
    'JS/vendor/lunar.js',
    'JS/bazi-calendar-core.js',
    'JS/solar-location.js',
    'JS/bazi.js',
    'JS/bazi_upgrade.js',
    'JS/bazi-prompt-root.js',
    'JS/bazi-standalone.js'
  ].forEach(file => vm.runInContext(read(file), ctx, { filename: file }));
  return ctx;
}

test('首頁先載入共用提示詞根，再載入八字與紫微 standalone', () => {
  const html = read('index.html');
  const bRoot = html.indexOf('JS/bazi-prompt-root.js');
  const bStandalone = html.indexOf('JS/bazi-standalone.js');
  const zRoot = html.indexOf('JS/ziwei-prompt-root.js');
  const zStandalone = html.indexOf('JS/ziwei-standalone.js');
  assert(bRoot >= 0 && bRoot < bStandalone);
  assert(zRoot >= 0 && zRoot < zStandalone);
  assert(html.includes('JS/bazi-prompt-root.js?v=20260811v2_0_1'));
  assert(html.includes('JS/ziwei-prompt-root.js?v=20260811v2_0_1'));
});

test('八字提示詞根在真實執行路徑可用，且輸出證據優先契約', () => {
  const ctx = loadBaziRuntime();
  assert.strictEqual(ctx.JY_BAZI_PROMPT_ROOT.version, '2.0.1');
  const solar = ctx.calcTrueSolarTime(1983, 8, 25, 14, 55, 120.23, 8, 'Asia/Taipei');
  const chart = ctx.computeBazi(solar.year, solar.month, solar.day, solar.hour, solar.minute, 'male', {
    second: solar.second,
    trueSolarTimeApplied: true,
    timezoneId: 'Asia/Taipei',
    timezoneOffset: 8,
    longitude: 120.23,
    referenceDate: '2026-08-11T12:00:00Z'
  });
  ctx.enhanceBazi(chart);
  const prompt = ctx.buildBaziPrompt('工作與現金流兩個問題都請完整判斷', chart, {
    birthLine: '國曆 1983/08/25 14:55・台南', solarInfo: solar, longitude: 120.23
  });
  assert(prompt.includes('【A. 排盤事實層'));
  assert(prompt.includes('【B. 流派模型層'));
  assert(prompt.includes('獨立證據與禁止重複計票'));
  assert(prompt.includes('不設任意的依據數量或字數上限'));
  assert(prompt.includes('工作與現金流兩個問題都請完整判斷'));
});

test('紫微資料不再截掉第四顆之後的輔星、煞星或第九個格局', () => {
  const source = read('JS/ziwei-standalone.js');
  assert(source.includes('輔吉／煞完整送出'));
  assert(!source.includes("filter(function(s){ return s.type!=='major' && s.type!=='sha'; }).slice(0,3)"));
  assert(!source.includes('(zw.patterns||[]).slice(0,8)'));
  assert.strictEqual(require('vm').runInNewContext(read('JS/ziwei-prompt-root.js') + ';window.JY_ZIWEI_PROMPT_ROOT.version', {
    window: {}, console
  }), '2.0.1');
});

test('梅花兩條 standalone 路徑完全一致，且不製造日曆假精確', () => {
  const active = read('JS/meihua-standalone.js');
  const fallback = read('meihua-standalone.js');
  assert.strictEqual(active, fallback);
  const joined = active + read('JS/meihua_upgrade.js') + read('JS/meihua_output_layer.js') + read('JS/meihua_upgrade2.js') + read('JS/tarot.js');
  ['1～7天', '1～4週', '1～3個月', '3個月以上', '最近吉應窗', '距今約', '應期推算：約'].forEach(x => assert(!joined.includes(x), x));
  assert(read('JS/meihua_upgrade.js').includes("precision:'engine-jieqi'"));
  assert(!read('JS/prompt-export.js').includes('24小時行動'));
});

test('靈籤保留完整問題並隔離歷史文本中的高風險斷語', () => {
  const source = read('JS/oracle.js');
  assert(!source.includes('maxlength="120"'));
  assert(!source.includes("String(v||'').slice(0,120)"));
  assert(source.includes('歷史傳承文本；可能含過時、矛盾或高風險措辭'));
  assert(source.includes('不得照抄「必死、必生男／女、一定有罪、必賺／必失」等斷語'));
});

test('雷諾曼掃描全部合法幾何，但不強迫弱片段編成事件', () => {
  const source = read('JS/lenormand.js');
  assert(source.includes('先掃描本牌陣所有合法牌句'));
  assert(source.includes('弱、歧義高或與本題無關的牌句可標為低信度或不輸出'));
  assert(source.includes('同義佐證合併，弱或高度歧義的片段不得硬升級成事件'));
  assert(!source.includes('正文必須呈現全部與原問句相關、能增加不同答案內容的有效命題'));
});

test('七維 API 把原始資料置於模型摘要之前，且沒有機械篇幅上限', () => {
  const api = read('functions/api/ai.js');
  assert(api.includes('System Prompt v6：證據優先、模型中立'));
  assert(api.includes('不同系統同向也不能自動當成客觀真實或重複投票'));
  assert(api.includes('前端七維模型候選（不是原始事實，不可重複計票）'));
  assert(api.includes('篇幅由問題複雜度與有效證據決定，不設任意字數上限'));
  assert(!api.includes('找出多個系統重疊指向同一方向的訊號——這是最可信的結論'));
  assert(!api.includes('20-50字'));
  assert(!api.includes('不要花超過兩句話'));
  assert(!read('JS/ai-analysis.js').includes('function capLen('));
});

if (process.exitCode) process.exit(process.exitCode);
console.log('\nAll ' + passed + ' prompt-accuracy regression tests passed.');
