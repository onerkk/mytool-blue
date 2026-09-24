'use strict';
// A real browser test of the public prompt-only page with stale paid-session data.
// This test never forwards an AI request to a paid provider.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..');
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.mp3': 'audio/mpeg', '.woff2': 'font/woff2' };

(async function () {
  const browser = await chromium.launch({ executablePath: process.env.JY_CHROMIUM || undefined, args: ['--no-sandbox', '--disable-dev-shm-usage', '--enable-unsafe-swiftshader', '--use-gl=angle', '--use-angle=swiftshader'] });
  try {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block', reducedMotion: 'reduce' });
    await context.addInitScript(() => {
      localStorage.setItem('_jy_session', 'unused-old-session');
      localStorage.setItem('_jy_pricing_cache', JSON.stringify({ _savedAt: Date.now(), data: { SINGLE_TAROT: 9999 } }));
    });
    const page = await context.newPage();
    const outgoing = [], counters = [], errors = [];
    page.on('request', r => {
      // The site's existing visit counter is free and intentionally active.
      // Keep it distinct from paid AI, pricing and classifier endpoints.
      if (new URL(r.url()).pathname === '/api/pulse') { counters.push(r.method()); return; }
      if (/jy-ai-proxy|mytool-blue\.pages\.dev|\/api\//.test(r.url())) outgoing.push(r.url());
    });
    page.on('pageerror', e => errors.push(e.message));
    await page.route('**/*', async route => {
      const url = new URL(route.request().url());
      if (url.origin === 'https://jingyue.uk' && url.pathname === '/api/pulse') return route.fulfill({contentType:'application/json',body:JSON.stringify({ok:true,total:124,today:8})});
      if (url.origin !== 'https://jingyue.uk') return route.abort();
      const file = path.resolve(root, '.' + decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname));
      if (!file.startsWith(root + path.sep) || !fs.existsSync(file)) return route.fulfill({ status: 404, body: '' });
      return route.fulfill({ body: fs.readFileSync(file), contentType: mime[path.extname(file)] || 'application/octet-stream' });
    });
    await page.goto('https://jingyue.uk', { waitUntil: 'load' });
    await page.evaluate(async () => {
      if (typeof pickTool === 'function') pickTool('full');
      if (window._jyReloadPricing) window._jyReloadPricing();
      if (window.JyClassifier) await window.JyClassifier.classify('天地玄黃宇宙洪荒', 'general');
    });
    await page.waitForTimeout(400);
    assert.equal(await page.evaluate(() => window.JY_PROMPT_ONLY), true);
    assert.equal(await page.evaluate(() => window._JY_SESSION_TOKEN), '');
    assert.equal(await page.evaluate(() => window.JY_PRICES.SINGLE_TAROT), 100);
    // The birth engine is deliberately lazy; load it through the same public
    // page loader before verifying that symbolic name labels cannot alter scores.
    await page.evaluate(() => new Promise((resolve, reject) => {
      window._jyLazyScript('JS/bazi.js?v=20260923final1', ok => ok ? resolve() : reject(Error('八字排盤載入失敗')));
    }));
    // 姓名字根屬傳統分類，不應在頁面中的今日運勢和照片濾鏡暗中加減事件分數。
    const nameBoundary = await page.evaluate(() => {
      const b = computeBazi(1983, 8, 25, 14, 55, 'male', { referenceDate: '2026-09-22T12:00:00Z' });
      S.bazi = b; S.ziwei = null; S.natal = null; S.jyotish = null; S._uResult = null;
      S.nameResult = null; S.zodiacNameResult = null;
      const before = [computeRealFortune(b).score, computeDateFortune(b, new Date(2026, 8, 23)).score, analyzeTodayChakra(b).score];
      S.nameResult = { sanCai: ['木', '火', '土'], sanCaiLevel: '大吉', renGe: { num: 15, el: '火', fortune: { level: '大吉' } }, tianGe: { el: '木' }, diGe: { el: '土' } };
      S.zodiacNameResult = { zodiac: '龍', overallLevel: '凶', totalLike: 0, totalDislike: 8, isSacrifice: true, isSnakePigClash: true, positions: [] };
      const after = [computeRealFortune(b).score, computeDateFortune(b, new Date(2026, 8, 23)).score, analyzeTodayChakra(b).score];
      S.nameResult = null; S.zodiacNameResult = null; S.bazi = null;
      return { before, after };
    });
    assert.deepEqual(nameBoundary.after, nameBoundary.before, 'symbolic name labels cannot change daily scores');
    assert.deepEqual(outgoing, [], 'the prompt-only workflow must not contact paid AI, pricing or remote classification');
    assert.deepEqual(counters, ['POST'], 'the existing visit counter is mocked once, never sent to a live service');
    assert.deepEqual(errors, [], 'the prompt-only page should run without uncaught errors');
    await context.close();
    console.log('PASS prompt-only with stale session/pricing, tool selection and unmatched question: zero paid-AI requests; one locally mocked visit counter');
  } finally { await browser.close(); }
})().catch(e => { console.error(e.stack); process.exitCode = 1; });
