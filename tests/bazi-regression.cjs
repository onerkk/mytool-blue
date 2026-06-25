#!/usr/bin/env node
'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
let passed = 0;

function test(name, fn) {
  try {
    fn();
    passed += 1;
    process.stdout.write(`✓ ${name}\n`);
  } catch (error) {
    process.stderr.write(`✗ ${name}\n${error.stack || error}\n`);
    process.exitCode = 1;
  }
}

function fakeElement() {
  return {
    style: {},
    classList: { add() {}, remove() {}, contains() { return false; } },
    appendChild() {}, removeChild() {}, setAttribute() {}, addEventListener() {},
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
  const silentConsole = { log() {}, warn() {}, error: console.error };
  const ctx = {
    console: silentConsole, Date, Math, Intl, TextEncoder, TextDecoder,
    setTimeout, clearTimeout, setInterval, clearInterval,
    document,
    navigator: { clipboard: { writeText: async () => {} } },
    location: { hostname: 'localhost', href: 'http://localhost/' },
    localStorage: { getItem() { return null; }, setItem() {} },
    alert() {}, open() { return null; }, requestIdleCallback(fn) { fn(); },
    performance: { now: () => 0 }
  };
  ctx.window = ctx;
  ctx.global = ctx;
  vm.createContext(ctx);
  return ctx;
}

function loadRuntime(includePrompt = true) {
  const ctx = createContext();
  const files = [
    'JS/vendor/lunar.js',
    'JS/bazi-calendar-core.js',
    'JS/solar-location.js',
    'JS/bazi.js',
    'JS/bazi_upgrade.js'
  ];
  if (includePrompt) files.push('JS/bazi-standalone.js');
  for (const file of files) {
    vm.runInContext(fs.readFileSync(path.join(ROOT, file), 'utf8'), ctx, { filename: file });
  }
  return ctx;
}

function chartAt(ctx, referenceDate, extraOptions = {}) {
  const solar = ctx.calcTrueSolarTime(1983, 8, 25, 14, 55, 120.23, 8, 'Asia/Taipei');
  const chart = ctx.computeBazi(
    solar.year, solar.month, solar.day, solar.hour, solar.minute, 'male',
    {
      second: solar.second,
      trueSolarTimeApplied: true,
      timezoneId: 'Asia/Taipei',
      timezoneOffset: 8,
      longitude: 120.23,
      referenceDate: referenceDate || '2026-06-25T12:00:00Z',
      ...extraOptions
    }
  );
  ctx.enhanceBazi(chart);
  return { solar, chart };
}

const ctx = loadRuntime(true);

test('台南出生時間真太陽時精確到秒', () => {
  const { solar } = chartAt(ctx);
  assert.strictEqual(solar.trueSolarDateTime, '1983-08-25 14:53:39');
  assert.strictEqual(solar.timezoneSource, 'iana');
  assert.strictEqual(solar.civilTimeStatus, 'exact');
});

test('本命四柱不變且起運精確到日秒', () => {
  const { chart } = chartAt(ctx);
  const pillars = ['year', 'month', 'day', 'hour'].map(k => chart.pillars[k].gan + chart.pillars[k].zhi);
  assert.deepStrictEqual(pillars, ['癸亥', '庚申', '乙酉', '癸未']);
  assert.strictEqual(chart.qiyun.startAgeText, '5歲8月20日');
  assert.strictEqual(chart.qiyun.startDate, '1989-05-15 14:53:39');
  assert.strictEqual(chart.qiyun.precision, 'second');
});

test('大運採精確半開區間，命盤牆鐘交界前後不重疊', () => {
  const before = chartAt(ctx, '2029-05-15T14:53:38Z', { referenceTimeBasis: 'chart-wall' }).chart.dayun.find(d => d.isCurrent);
  const at = chartAt(ctx, '2029-05-15T14:53:39Z', { referenceTimeBasis: 'chart-wall' }).chart.dayun.find(d => d.isCurrent);
  assert.strictEqual(before.gz, '丙辰');
  assert.strictEqual(before.endDateExclusive, '2029-05-15 14:53:39');
  assert.strictEqual(at.gz, '乙卯');
  assert.strictEqual(at.startDate, '2029-05-15 14:53:39');
});

test('真實 UTC 瞬間先轉台北真太陽牆鐘，再判精確換運點', () => {
  const opts = { timezoneId: 'Asia/Taipei', timezoneOffset: 8, longitude: 120.23, trueSolarTimeApplied: true };
  const beforeWall = ctx.BAZI_CORE.referenceToChartWall(Date.parse('2029-05-15T06:49:06Z'), opts);
  const atWall = ctx.BAZI_CORE.referenceToChartWall(Date.parse('2029-05-15T06:49:07Z'), opts);
  assert.strictEqual(new Date(beforeWall.timestamp).toISOString(), '2029-05-15T14:53:38.000Z');
  assert.strictEqual(new Date(atWall.timestamp).toISOString(), '2029-05-15T14:53:39.000Z');
  const before = chartAt(ctx, '2029-05-15T06:49:06Z').chart;
  const at = chartAt(ctx, '2029-05-15T06:49:07Z').chart;
  assert.strictEqual(before.dayun.find(d => d.isCurrent).gz, '丙辰');
  assert.strictEqual(at.dayun.find(d => d.isCurrent).gz, '乙卯');
  assert.strictEqual(at.calculationPolicy.referenceTimeBasis, 'true-solar-wall');
});

test('原局作用由核心唯一列出申亥害與亥未拱木，沒有重複', () => {
  const { chart } = chartAt(ctx);
  const keys = chart.branchInteractions.map(x => `${x.type}:${(x.branches || []).join('')}`);
  assert(keys.includes('六害:亥申'));
  assert(keys.includes('拱合:亥未'));
  assert.strictEqual(new Set(keys).size, keys.length);
  assert.strictEqual(chart.hiddenInteractions.length, 0);
  assert.strictEqual(chart.hiddenInteractionPolicy.enabled, false);
});

test('天干五合與六合不自動判定成化或灌入分數', () => {
  const { chart } = chartAt(ctx);
  const he = chart.tianGanHe.find(x => x.pair === '庚乙' || x.pair === '乙庚');
  assert(he, '應找到乙庚天干五合');
  assert.strictEqual(he.transforms, null);
  assert.strictEqual(he.transformationStatus, '待審');
  assert.strictEqual(chart.branchInterpretationPolicy.mutatesElementWeights, false);
  assert(chart.branchInteractions.every(x => x.score === undefined));
  assert.strictEqual(chart.calculationPolicy.forecastInteractionScoring, false);
  assert(chart.dayun.filter(d => d.gz !== '小運').every(d => d.interactionScoreAdjustment === 0));
  assert(chart.dayun.filter(d => d.gz !== '小運').every(d => d.scorePolicy === 'ELEMENT_TEN_GOD_CLIMATE_ONLY'));
  assert(chart.dayun.flatMap(d => d.liuNian || []).every(y => y.interactionScoreAdjustment === 0));
});

test('特殊格局只列候選，不自動覆蓋扶抑喜忌', () => {
  const { chart } = chartAt(ctx);
  assert.strictEqual(chart.specialStructure, null);
  assert(Array.isArray(chart.specialStructureCandidates));
  assert(chart.specialStructureCandidates.some(x => String(x.type).startsWith('化氣格候選')));
  assert(chart.specialStructureCandidates.every(x => x.appliesAutomatically === false));
});

test('調候與扶抑分離，不因火極少便自動加入核心用神', () => {
  const { chart } = chartAt(ctx);
  assert(chart.tiaohou && chart.tiaohou.integrationMode === 'SEPARATE_LENS');
  assert(chart.tiaohou.need.includes('火'));
  assert(!chart.fav.includes('火'));
});

test('23時換日政策可選，午夜派與子初派輸出各自一致', () => {
  const midnight = ctx.computeBazi(1983, 8, 25, 23, 30, 'male', { dayBoundaryMode: 'MIDNIGHT_00' });
  const ziHour = ctx.computeBazi(1983, 8, 25, 23, 30, 'male', { dayBoundaryMode: 'ZI_HOUR_23' });
  const fmt = b => ['year', 'month', 'day', 'hour'].map(k => b.pillars[k].gan + b.pillars[k].zhi);
  assert.deepStrictEqual(fmt(midnight), ['癸亥', '庚申', '乙酉', '丙子']);
  assert.deepStrictEqual(fmt(ziHour), ['癸亥', '庚申', '丙戌', '戊子']);
});

test('流年以立春為界，不以公曆元旦換干支', () => {
  assert.strictEqual(ctx.BAZI_CORE.getYearGanZhiAt(new Date('2026-01-20T00:00:00Z')).gz, '乙巳');
  assert.strictEqual(ctx.BAZI_CORE.getYearGanZhiAt(new Date('2026-02-04T20:00:00Z')).gz, '丙午');
});

test('IANA 時區能處理紐約夏令時間，固定偏移備援不偽裝成 DST', () => {
  const iana = ctx.calcTrueSolarTime(2024, 7, 1, 12, 0, -74.01, -5, 'America/New_York');
  const fixed = ctx.calcTrueSolarTime(2024, 7, 1, 12, 0, -74.01, -5, null);
  assert.strictEqual(iana.trueSolarDateTime, '2024-07-01 10:59:56');
  assert.strictEqual(iana.dstOffsetMinutes, 60);
  assert.strictEqual(iana.civilTimeStatus, 'exact');
  assert.strictEqual(fixed.dstOffsetMinutes, 0);
  assert.strictEqual(fixed.timezoneSource, 'fixed-offset');
});

test('DST 重疊與缺口明確標記，秒數不在轉換中遺失', () => {
  const overlap = ctx.calcTrueSolarTime(2024, 11, 3, 1, 30, -74.01, { timezone: -5, timezoneId: 'America/New_York', second: 0 });
  const gap = ctx.calcTrueSolarTime(2024, 3, 10, 2, 30, -74.01, { timezone: -5, timezoneId: 'America/New_York', second: 0 });
  const withSecond = ctx.calcTrueSolarTime(2024, 7, 1, 12, 0, -74.01, { timezone: -5, timezoneId: 'America/New_York', second: 37 });
  assert.strictEqual(overlap.civilTimeStatus, 'ambiguous-earlier');
  assert.strictEqual(gap.civilTimeStatus, 'nonexistent-compatible');
  assert.strictEqual(withSecond.trueSolarDateTime, '2024-07-01 11:00:33');
});



test('流月沖合只列觸發，不以沖喜沖忌自動改分', () => {
  const { chart } = chartAt(ctx);
  const clashMonth = (chart.liuYue || []).find(m => m.isChong);
  assert(clashMonth, '應至少有一個沖日支的流月');
  const st = chart.wuxingStance.map;
  const j = el => st[el] === '喜' ? 1 : (st[el] === '忌' ? -1 : 0);
  const expected = j(clashMonth.ganEl) * 2 + j(clashMonth.zhiEl);
  assert.strictEqual(clashMonth.score, expected);
  assert(clashMonth.note.includes('不自動加減分'));
});

test('提示詞分離排盤事實與流派模型，包含精確運界及限制', () => {
  const { solar, chart } = chartAt(ctx);
  const prompt = ctx.buildBaziPrompt('測試問題', chart, {
    birthLine: '國曆 1983/08/25 14:55・台南', solarInfo: solar, longitude: 120.23
  });
  assert(prompt.includes('【A. 排盤事實層'));
  assert(prompt.includes('【B. 流派模型層'));
  assert(prompt.includes('經度 120.23°'));
  assert(prompt.includes('目前運勢比較基準 true-solar-wall'));
  assert(prompt.includes('1989-05-15 14:53:39'));
  assert(prompt.includes('2029-05-15 14:53:39'));
  assert(prompt.includes('六害：年支亥害月支申'));
  assert.strictEqual((prompt.match(/六害：年支亥害月支申/g) || []).length, 1);
  assert(prompt.includes('沒有證據可保證改運、招財或治療'));
  assert(prompt.includes('刑沖合害、三合三會只列觸發，不參與自動加減分'));
  assert(!prompt.includes('主規範底下的隱性壓力與暗中競爭'));
  assert(!prompt.includes('非貧即夭'));
  assert(!prompt.includes('已化成某五行。半合'));
});

test('未知時辰提示詞明確降級時柱與精確起運可信度', () => {
  const { solar, chart } = chartAt(ctx);
  const prompt = ctx.buildBaziPrompt('測試問題', chart, {
    birthLine: '國曆 1983/08/25（時辰未知，以午時暫排）・台南', solarInfo: solar, unknown: true
  });
  assert(prompt.includes('重大限制：出生時辰未知'));
  assert(prompt.includes('精確起運時刻均屬低信度'));
});

test('固定 UTC 偏移排盤在提示詞明示歷史時區限制', () => {
  const solar = ctx.calcTrueSolarTime(1983, 8, 25, 14, 55, 120.23, 8, null);
  const chart = ctx.computeBazi(solar.year, solar.month, solar.day, solar.hour, solar.minute, 'male', {
    second: solar.second, trueSolarTimeApplied: true, timezoneOffset: 8, longitude: 120.23,
    referenceDate: '2026-06-25T12:00:00Z'
  });
  ctx.enhanceBazi(chart);
  const prompt = ctx.buildBaziPrompt('測試問題', chart, { solarInfo: solar, longitude: 120.23 });
  assert(prompt.includes('只有固定 UTC 偏移'));
  assert(prompt.includes('無法驗證出生地歷史 DST／時區變更'));
  assert.strictEqual(chart.calculationPolicy.referenceTimeBasis, 'true-solar-wall');
});

test('精確曆法庫缺席時明示備援近似，不偽裝成秒級引擎', () => {
  const fallbackCtx = createContext();
  for (const file of ['JS/solar-location.js', 'JS/bazi.js']) {
    vm.runInContext(fs.readFileSync(path.join(ROOT, file), 'utf8'), fallbackCtx, { filename: file });
  }
  const solar = fallbackCtx.calcTrueSolarTime(1983, 8, 25, 14, 55, 120.23, 8, 'Asia/Taipei');
  const chart = fallbackCtx.computeBazi(solar.year, solar.month, solar.day, solar.hour, solar.minute, 'male', {
    second: solar.second, trueSolarTimeApplied: true, timezoneId: 'Asia/Taipei', timezoneOffset: 8,
    longitude: 120.23, referenceDate: '2026-06-25T12:00:00Z'
  });
  assert.strictEqual(chart.calculationPolicy.calendarFallback, true);
  assert.notStrictEqual(chart.calculationPolicy.calendarPrecision, 'second');
  assert(['approximate', 'minute-jieqi'].includes(chart.qiyun.precision));
});

test('首頁載入本地曆法引擎且版本路徑正確', () => {
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  assert(html.includes('JS/vendor/lunar.js?v=1.7.7'));
  assert(html.includes('JS/solar-location.js?v=20260625v18_2'));
  assert(html.includes('JS/bazi-calendar-core.js?v=20260625v1_0_0'));
  assert(html.includes('JS/bazi.js?v=20260625v44'));
  assert(html.includes('JS/bazi_upgrade.js?v=20260625v80_37'));
  assert(html.includes('JS/bazi-standalone.js?v=20260625v80_50'));
  const standalone = fs.readFileSync(path.join(ROOT, 'JS/bazi-standalone.js'), 'utf8');
  const upgrade = fs.readFileSync(path.join(ROOT, 'JS/bazi_upgrade.js'), 'utf8');
  assert(standalone.includes("var _dayBoundaryMode = 'ZI_HOUR_23'"));
  assert(standalone.includes('onclick="_baziSetDayBoundary'));
  assert(standalone.includes("{n:'台中', lng:120.68, tz:8}, {n:'台南', lng:120.23, tz:8}"));
  assert(standalone.includes("{n:'倫敦', lng:-0.13, tz:0}, {n:'雪梨', lng:151.21, tz:10}"));
  assert(standalone.includes('提示詞已含排盤事實、模型限制與判讀規範。'));
  assert(standalone.includes('本系統採真太陽時'));
  assert(!upgrade.includes("子:['癸'],丑:['己','癸','辛']"));
});

if (process.exitCode) {
  process.stderr.write(`\n${passed} tests passed before failure(s).\n`);
  process.exit(process.exitCode);
}
process.stdout.write(`\nAll ${passed} regression tests passed.\n`);
