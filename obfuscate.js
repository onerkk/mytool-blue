/**
 * 靜月之光 — JS 混淆腳本（終極版）
 * 
 * 超越收費版混淆器的功能：
 *   ✦ RC4 字串加密 + 多層包裝器（逆向工具無法自動解）
 *   ✦ 控制流扁平化（邏輯變成 switch-case 迷宮）
 *   ✦ 域名鎖定（雙層：混淆器級 + 自寫運行時校驗）
 *   ✦ 反調試陷阱（開 DevTools 直接卡死 + 計時偵測）
 *   ✦ 反 iframe 嵌入（別人不能用 iframe 偷嵌你的頁面）
 *   ✦ 環境偵測（防止在 Node.js 裡離線解析）
 *   ✦ Console 攔截偵測（有人 hook console 會觸發）
 *   ✦ 鍵盤 / 右鍵封鎖（F12, Ctrl+Shift+I, 右鍵全擋）
 *   ✦ 函數 toString 陷阱（讀原始碼會拿到假資料）
 *   ✦ 自我防護（格式化程式碼後直接壞掉）
 *   ✦ 死碼注入 + 物件 key 混淆
 *
 * 保護層自動注入到 ui.js 開頭，混淆時一起加密
 * 
 * 使用方式：
 *   cd D:\mytool-blue
 *   node obfuscate.js
 *   git add . && git commit -m "obfuscate" && git push origin master
 */

const JavaScriptObfuscator = require('javascript-obfuscator');
const fs = require('fs');
const path = require('path');

// ═══════════════════════════════════════════════
// JS/ 資料夾要混淆的檔案
// ═══════════════════════════════════════════════
const JS_FILES = [
  'JS/ai-analysis.js',
  'JS/api_upgrade.js',
  'JS/bazi.js',
  'JS/bazi_upgrade.js',
  'JS/jyotish_full_upgrade.js',
  'JS/meihua_output_layer.js',
  'JS/meihua_upgrade.js',
  'JS/meihua_upgrade2.js',
  'JS/name_upgrade.js',
  'JS/payment-wall.js',
  'JS/render_upgrade.js',
  'JS/renderMeihua_upgrade.js',
  'JS/solar-location.js',
  'JS/tarot.js',
  'JS/tarot_upgrade.js',
  'JS/ui.js',
  'JS/western_upgrade.js',
  'JS/ziwei.js',
];

// 保護層注入目標（最早載入的 JS）
const SHIELD_TARGET = 'JS/ui.js';

const JS_BACKUP_DIR = 'JS_backup';

// ═══════════════════════════════════════════════
// 保護層原始碼（注入後會跟 ui.js 一起被混淆）
// ═══════════════════════════════════════════════
const SHIELD_CODE = `
// ═══ 靜月之光 防護盾 ═══
(function(){
  'use strict';
  var _jy_ok = true;

  // ── 1. 域名鎖定（運行時校驗，混淆器的 domainLock 是第一層，這是第二層）──
  try {
    var _h = window.location.hostname;
    var _allowed = ['jingyue.uk','localhost','127.0.0.1',''];
    var _pass = false;
    for (var i = 0; i < _allowed.length; i++) {
      if (_h === _allowed[i] || _h.indexOf('.jingyue.uk') !== -1) { _pass = true; break; }
    }
    if (!_pass) { _jy_ok = false; }
  } catch(e) { _jy_ok = false; }

  // ── 2. 反 iframe 嵌入（防止被別的網站嵌入）──
  try {
    if (window.self !== window.top) {
      // 被 iframe 嵌入了
      try { window.top.location.href = window.location.href; } catch(e) {
        _jy_ok = false;
      }
    }
  } catch(e) {}

  // ── 3. 環境偵測（防止在 Node.js / Puppeteer 無頭環境解析）──
  try {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      _jy_ok = false;
    }
    // 偵測 Puppeteer / Playwright 自動化工具
    if (navigator.webdriver === true) {
      _jy_ok = false;
    }
    // 偵測 PhantomJS
    if (window.callPhantom || window._phantom) {
      _jy_ok = false;
    }
  } catch(e) {}

  // ── 4. 反調試：多層 debugger 陷阱 + 計時偵測 ──
  var _dbgCount = 0;
  function _antiDebug() {
    var _start = Date.now();
    debugger;
    var _elapsed = Date.now() - _start;
    if (_elapsed > 100) {
      _dbgCount++;
      if (_dbgCount > 2) {
        // 有人持續開著 DevTools，破壞頁面
        try {
          document.body.innerHTML = '<div style="background:#000;color:#333;min-height:100vh;display:flex;align-items:center;justify-content:center;font-family:monospace">.</div>';
          // 清除所有計時器
          var id = setTimeout(function(){}, 0);
          while (id--) { clearTimeout(id); clearInterval(id); }
        } catch(e) {}
      }
    }
  }
  // 隨機間隔執行（不是固定的，更難被 hook 掉）
  function _scheduleAntiDebug() {
    var _delay = 2000 + Math.floor(Math.random() * 3000);
    setTimeout(function(){ _antiDebug(); _scheduleAntiDebug(); }, _delay);
  }
  _scheduleAntiDebug();

  // ── 5. Console 覆寫偵測（有人 hook console.log 來偷看資料）──
  try {
    var _origLog = console.log;
    var _nativeStr = Function.prototype.toString.call(_origLog);
    if (_nativeStr.indexOf('native code') === -1 && _nativeStr.indexOf('[Command Line API]') === -1) {
      // console.log 被替換了（可能是攔截器）
      // 不直接壞掉，但停止輸出敏感資訊
      window._jy_console_compromised = true;
    }
  } catch(e) {}

  // ── 6. 鍵盤 / 右鍵封鎖 ──
  document.addEventListener('contextmenu', function(e) {
    if (!window._JY_ADMIN_TOKEN) e.preventDefault();
  }, true);

  document.addEventListener('keydown', function(e) {
    if (window._JY_ADMIN_TOKEN) return; // Admin 不擋
    // F12
    if (e.keyCode === 123) { e.preventDefault(); return false; }
    // Ctrl+Shift+I / Ctrl+Shift+J / Ctrl+Shift+C
    if (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) {
      e.preventDefault(); return false;
    }
    // Ctrl+U（查看原始碼）
    if (e.ctrlKey && e.keyCode === 85) { e.preventDefault(); return false; }
  }, true);

  // ── 7. 函數 toString 陷阱（讀函數原始碼會拿到假資料）──
  try {
    var _origToString = Function.prototype.toString;
    Function.prototype.toString = function() {
      // 如果有人對我們的函數做 toString()，回傳假的
      var _result = _origToString.call(this);
      if (_result.indexOf('_jy') !== -1 || _result.indexOf('jingyue') !== -1) {
        return 'function () { [native code] }';
      }
      return _result;
    };
    // 保護 toString 自己不被偵測
    Function.prototype.toString.toString = function() {
      return 'function toString() { [native code] }';
    };
  } catch(e) {}

  // ── 8. 偵測 source map 請求攔截 ──
  // （有人可能用 Service Worker 攔截 .js.map 請求來嘗試還原）
  // 不需要額外處理，因為我們不產生 source map

  // ── 執行域名校驗結果 ──
  if (!_jy_ok) {
    try {
      document.body.innerHTML = '';
      window.location.href = 'about:blank';
    } catch(e) {}
    return;
  }
})();
`;

// ═══════════════════════════════════════════════
// 混淆設定（最高實用強度）
// ═══════════════════════════════════════════════
const OBFUSCATION_OPTIONS = {
  compact: true,

  // 控制流扁平化
  controlFlowFlattening: true,
  controlFlowFlatteningThreshold: 0.75,

  // 死碼注入
  deadCodeInjection: true,
  deadCodeInjectionThreshold: 0.4,

  // 變數名 hex
  identifierNamesGenerator: 'hexadecimal',

  // 數字轉運算式
  numbersToExpressions: true,

  // 字串 RC4 加密
  stringArray: true,
  stringArrayEncoding: ['rc4'],
  stringArrayThreshold: 0.75,
  rotateStringArray: true,
  shuffleStringArray: true,
  splitStrings: true,
  splitStringsChunkLength: 6,

  // 多層字串包裝器
  stringArrayWrappersCount: 3,
  stringArrayWrappersChainedCalls: true,
  stringArrayWrappersParametersMaxCount: 4,
  stringArrayWrappersType: 'function',

  // 字串呼叫轉換
  stringArrayCallsTransform: true,
  stringArrayCallsTransformThreshold: 0.75,

  // 物件 key 混淆
  transformObjectKeys: true,

  // 反調試（混淆器級）
  debugProtection: true,
  debugProtectionInterval: 2000,

  // 保留 console
  disableConsoleOutput: false,

  // 自我防護（格式化就壞）
  selfDefending: true,

  // 不重命名全域（跨檔案不會壞）
  renameGlobals: false,

  // Unicode 跳脫
  unicodeEscapeSequence: true,

  // 域名鎖定（混淆器級，第一層）
  domainLock: ['jingyue.uk', '.jingyue.uk'],
  domainLockRedirectUrl: 'about:blank',

  target: 'browser',
  sourceMap: false,
};

// 大檔案降低部分強度
const LARGE_FILE_OPTIONS = {
  controlFlowFlatteningThreshold: 0.4,
  deadCodeInjectionThreshold: 0.2,
  splitStringsChunkLength: 10,
  stringArrayWrappersCount: 2,
  debugProtection: false,
  debugProtectionInterval: 0,
};

// Service Worker 專用（關掉不相容選項）
const SW_OPTIONS = {
  selfDefending: false,
  debugProtection: false,
  debugProtectionInterval: 0,
  domainLock: [],
};

// ═══════════════════════════════════════════════
// 開始
// ═══════════════════════════════════════════════
console.log('');
console.log('🔒 靜月之光 JS 混淆工具（終極版）');
console.log('════════════════════════════════════════');
console.log('');
console.log('   ✦ RC4 加密 + 多層包裝器');
console.log('   ✦ 域名鎖定（雙層）');
console.log('   ✦ 反調試陷阱 + 計時偵測');
console.log('   ✦ 反 iframe / 反自動化');
console.log('   ✦ 鍵盤右鍵封鎖');
console.log('   ✦ toString 陷阱');
console.log('   ✦ 控制流扁平化 + 死碼注入');
console.log('');

let totalSuccess = 0;
let totalFailed = 0;

// ───────────────────────────────────────────────
// Part 1: JS/ 資料夾
// ───────────────────────────────────────────────
console.log('📁 [Part 1] JS/ 資料夾');
console.log('────────────────────────────────');

if (!fs.existsSync(JS_BACKUP_DIR)) {
  fs.mkdirSync(JS_BACKUP_DIR, { recursive: true });
  console.log(`📁 建立備份資料夾: ${JS_BACKUP_DIR}/`);
}

for (const filePath of JS_FILES) {
  const fullPath = path.resolve(filePath);

  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  找不到: ${filePath}，跳過`);
    totalFailed++;
    continue;
  }

  const fileName = path.basename(filePath);
  const backupPath = path.join(JS_BACKUP_DIR, fileName);

  // 備份
  fs.copyFileSync(fullPath, backupPath);

  let originalCode = fs.readFileSync(fullPath, 'utf-8');

  // ★ 注入保護層到 ui.js 開頭（混淆前注入，一起加密）
  if (filePath === SHIELD_TARGET) {
    console.log(`🛡️  注入防護盾到 ${filePath}`);
    originalCode = SHIELD_CODE + '\n' + originalCode;
  }

  const originalSize = (Buffer.byteLength(originalCode) / 1024).toFixed(0);
  console.log(`🔄 混淆: ${filePath} (${originalSize} KB)...`);

  try {
    const startTime = Date.now();
    const opts = (fileName === 'ai-analysis.js')
      ? { ...OBFUSCATION_OPTIONS, ...LARGE_FILE_OPTIONS }
      : OBFUSCATION_OPTIONS;

    const result = JavaScriptObfuscator.obfuscate(originalCode, opts);
    const obfuscatedCode = result.getObfuscatedCode();
    const newSize = (Buffer.byteLength(obfuscatedCode) / 1024).toFixed(0);
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

    fs.writeFileSync(fullPath, obfuscatedCode, 'utf-8');
    console.log(`   ✅ ${originalSize} KB → ${newSize} KB (${elapsed}s)`);
    totalSuccess++;
  } catch (err) {
    console.error(`   ❌ 失敗: ${err.message}`);
    fs.copyFileSync(backupPath, fullPath);
    console.log(`   ↩️  已還原`);
    totalFailed++;
  }
}

// ───────────────────────────────────────────────
// Part 2: admin/ 資料夾
// ───────────────────────────────────────────────
console.log('');
console.log('📁 [Part 2] admin/ 資料夾');
console.log('────────────────────────────────');

const ADMIN_HTML = 'admin/index.html';
const ADMIN_BACKUP = 'admin/index.backup.html';
const ADMIN_SW = 'admin/admin-sw.js';
const ADMIN_SW_BACKUP = 'admin/admin-sw.backup.js';

// 2a: admin/index.html 內嵌 JS
if (fs.existsSync(ADMIN_HTML)) {
  const originalHtml = fs.readFileSync(ADMIN_HTML, 'utf-8');
  const htmlSize = (Buffer.byteLength(originalHtml) / 1024).toFixed(1);

  fs.writeFileSync(ADMIN_BACKUP, originalHtml, 'utf-8');
  console.log(`📋 備份: ${ADMIN_HTML} → ${ADMIN_BACKUP} (${htmlSize} KB)`);

  const scriptRegex = /(<script>)([\s\S]*?)(<\/script>)/g;
  const matches = [];
  let m;
  while ((m = scriptRegex.exec(originalHtml)) !== null) {
    matches.push({
      fullMatch: m[0],
      openTag: m[1],
      code: m[2],
      closeTag: m[3],
      index: m.index,
    });
  }

  if (matches.length === 0) {
    console.log('   ⚠️  找不到 <script> 區塊，跳過');
  } else {
    let resultHtml = originalHtml;

    for (let i = matches.length - 1; i >= 0; i--) {
      const block = matches[i];
      if (block.code.trim().length < 100) {
        console.log(`   ⏭  第 ${i + 1} 個 <script> 太短，跳過`);
        continue;
      }

      const codeSize = (Buffer.byteLength(block.code) / 1024).toFixed(1);
      console.log(`🔄 混淆: ${ADMIN_HTML} 第 ${i + 1} 個 <script> (${codeSize} KB)...`);

      try {
        const startTime = Date.now();
        // Admin 不用域名鎖定和反調試（你自己要用 DevTools）
        const adminOpts = {
          ...OBFUSCATION_OPTIONS,
          domainLock: [],
          domainLockRedirectUrl: '',
          debugProtection: false,
          debugProtectionInterval: 0,
        };
        const result = JavaScriptObfuscator.obfuscate(block.code, adminOpts);
        const obfuscated = result.getObfuscatedCode();
        const newSize = (Buffer.byteLength(obfuscated) / 1024).toFixed(1);
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

        resultHtml =
          resultHtml.substring(0, block.index) +
          block.openTag + '\n' + obfuscated + '\n' + block.closeTag +
          resultHtml.substring(block.index + block.fullMatch.length);

        console.log(`   ✅ ${codeSize} KB → ${newSize} KB (${elapsed}s)`);
        totalSuccess++;
      } catch (err) {
        console.error(`   ❌ 失敗: ${err.message}`);
        totalFailed++;
      }
    }

    fs.writeFileSync(ADMIN_HTML, resultHtml, 'utf-8');
    const newHtmlSize = (Buffer.byteLength(resultHtml) / 1024).toFixed(1);
    console.log(`   📄 ${ADMIN_HTML}: ${htmlSize} KB → ${newHtmlSize} KB`);
  }
} else {
  console.log(`   ⚠️  找不到 ${ADMIN_HTML}，跳過`);
}

// 2b: admin/admin-sw.js
if (fs.existsSync(ADMIN_SW)) {
  const swCode = fs.readFileSync(ADMIN_SW, 'utf-8');
  if (swCode.trim().length > 100) {
    console.log(`🔄 混淆: ${ADMIN_SW}...`);
    try {
      fs.writeFileSync(ADMIN_SW_BACKUP, swCode, 'utf-8');
      const swResult = JavaScriptObfuscator.obfuscate(swCode, {
        ...OBFUSCATION_OPTIONS,
        ...SW_OPTIONS,
      });
      fs.writeFileSync(ADMIN_SW, swResult.getObfuscatedCode(), 'utf-8');
      console.log(`   ✅ admin-sw.js 完成`);
      totalSuccess++;
    } catch (e) {
      console.log(`   ⚠️  admin-sw.js 失敗: ${e.message}（跳過）`);
      totalFailed++;
    }
  } else {
    console.log(`   ⏭  admin-sw.js 太短，跳過`);
  }
} else {
  console.log(`   ⏭  ${ADMIN_SW} 不存在，跳過`);
}

// ═══════════════════════════════════════════════
// 總結
// ═══════════════════════════════════════════════
console.log('');
console.log('════════════════════════════════════════');
console.log(`🔒 全部完成: ${totalSuccess} 成功, ${totalFailed} 失敗`);
console.log('');
console.log('🛡️  防護層已注入 → ' + SHIELD_TARGET);
console.log('   域名鎖定 ✦ 反調試 ✦ 反 iframe ✦ 反自動化');
console.log('   鍵盤封鎖 ✦ toString 陷阱 ✦ Console 偵測');
console.log('');
console.log('備份位置：');
console.log(`   ${JS_BACKUP_DIR}/ ← JS 原始碼`);
console.log(`   ${ADMIN_BACKUP} ← admin 原始碼`);
console.log('');
console.log('下一步：');
console.log('   git add .');
console.log('   git commit -m "obfuscate"');
console.log('   git push origin master');
console.log('');
console.log('⚠️  .gitignore 加入：');
console.log('   JS_backup/');
console.log('   admin/index.backup.html');
console.log('   admin/admin-sw.backup.js');
console.log('');
