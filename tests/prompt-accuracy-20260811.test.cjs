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

test('首頁先載入 v3 共用提示詞根，再載入八字與紫微 standalone', () => {
  const html = read('index.html');
  const bRoot = html.indexOf('JS/bazi-prompt-root.js');
  const bStandalone = html.indexOf('JS/bazi-standalone.js');
  const zRoot = html.indexOf('JS/ziwei-prompt-root.js');
  const zStandalone = html.indexOf('JS/ziwei-standalone.js');
  assert(bRoot >= 0 && bRoot < bStandalone);
  assert(zRoot >= 0 && zRoot < zStandalone);
  assert(html.includes('JS/bazi-prompt-root.js?v=20260905fix1'));
  assert(html.includes('JS/ziwei-prompt-root.js?v=20260905fix1'));
});

test('八字提示詞根在真實執行路徑可用，並開放 AI 自身命理知識', () => {
  const ctx = loadBaziRuntime();
  assert.strictEqual(ctx.JY_BAZI_PROMPT_ROOT.version, '3.1.0');
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
  assert(prompt.includes('【A. 排盤與曆法資料】'));
  assert(prompt.includes('【B. 前端流派模型（供交叉核對）】'));
  assert(prompt.includes('運用你自身完整的命理知識'));
  assert(prompt.includes('格局、扶抑、調候、病藥、通關'));
  assert(!prompt.includes('ROOT-SPEC'));
  assert(!prompt.includes('答案反向稽核'));
  assert((prompt.match(/不得|嚴禁|禁止|硬規則|帳本|稽核/g) || []).length <= 4);
  assert(prompt.includes('工作與現金流兩個問題都請完整判斷'));
});

test('紫微資料不再截掉第四顆之後的輔星、煞星或第九個格局', () => {
  const source = read('JS/ziwei-standalone.js');
  assert(source.includes('輔吉／煞完整送出'));
  assert(!source.includes("filter(function(s){ return s.type!=='major' && s.type!=='sha'; }).slice(0,3)"));
  assert(!source.includes('(zw.patterns||[]).slice(0,8)'));
  assert.strictEqual(require('vm').runInNewContext(read('JS/ziwei-prompt-root.js') + ';window.JY_ZIWEI_PROMPT_ROOT.version', {
    window: {}, console
  }), '3.1.0');
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

test('靈籤提示詞保留完整材料並開放 AI 的解籤知識', () => {
  const source = read('JS/oracle.js');
  assert(!source.includes('maxlength="120"'));
  assert(!source.includes("String(v||'').slice(0,120)"));
  assert(source.includes('各項傳統判讀（請依原問題選用'));
  assert(source.includes('運用你自身完整的籤詩、典故、象徵、傳統解法'));
  assert(source.includes('詩文、籤等與各項判讀是否同向'));
  assert(!source.includes('【完整性清單'));
  assert(!source.includes('嚴禁引用籤詩之外'));
});

test('雷諾曼保留合法幾何，並改為精簡的牌組整合方法', () => {
  const source = read('JS/lenormand.js');
  assert(source.includes('運用你自身完整的 Petit Lenormand 知識'));
  assert(source.includes('以相鄰牌組、長線、交會路徑及牌陣位置形成完整牌句'));
  assert(source.includes('大牌陣另外留意人物牌周圍、宮位、距離、方向與跨線重複'));
  assert(!source.includes('覆蓋帳本與語義飽和'));
  assert(!source.includes('第七輪｜現實轉譯'));
});

test('七維 API 以盤面為主並允許模型使用自身跨系統知識', () => {
  const api = read('functions/api/ai.js');
  assert(api.includes('System Prompt v7：知識開放、盤面優先'));
  assert(api.includes('運用你自身完整且可靠的專業知識'));
  assert(api.includes('前端七維摘要（供交叉參考）'));
  assert(api.includes('各系統先按自身正確方法判讀'));
  assert(!api.includes('不能違反的證據邊界'));
  assert(!api.includes('你怎麼說話'));
  assert((api.match(/不得|嚴禁|禁止|硬規則|帳本|稽核/g) || []).length === 0);
  assert(!read('JS/ai-analysis.js').includes('function capLen('));
});

if (process.exitCode) process.exit(process.exitCode);
console.log('\nAll ' + passed + ' prompt-accuracy regression tests passed.');
