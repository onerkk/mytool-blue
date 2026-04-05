/**
 * 靜月之光 — JS 混淆腳本（修正版）
 *
 * javascript-obfuscator 的 debugProtection/selfDefending 實現有 bug 會炸頁面
 * → 關掉它的，自己在 shield 裡寫穩定版本
 *
 * 使用：cd D:\mytool-blue && node obfuscate.js
 */

const JavaScriptObfuscator = require('javascript-obfuscator');
const fs = require('fs');
const path = require('path');

const JS_FILES = [
  'JS/ai-analysis.js','JS/api_upgrade.js','JS/bazi.js','JS/bazi_upgrade.js',
  'JS/jyotish_full_upgrade.js','JS/meihua_output_layer.js','JS/meihua_upgrade.js',
  'JS/meihua_upgrade2.js','JS/name_upgrade.js','JS/payment-wall.js',
  'JS/render_upgrade.js','JS/renderMeihua_upgrade.js','JS/solar-location.js',
  'JS/tarot.js','JS/tarot_upgrade.js','JS/ui.js','JS/western_upgrade.js','JS/ziwei.js',
];
const SHIELD_TARGET = 'JS/ui.js';
const JS_BACKUP_DIR = 'JS_backup';

// ═══════════════════════════════════════════════
// 防護盾（自寫穩定版，替代 javascript-obfuscator 的爛實現）
// ═══════════════════════════════════════════════
const SHIELD_CODE = `
(function(){
  var _ok = true;

  // ══ 1. 域名鎖定（雙層：這裡 + 混淆器的 domainLock）══
  try {
    var _h = window.location.hostname;
    if (_h !== 'jingyue.uk' && _h.indexOf('.jingyue.uk') === -1
        && _h !== 'localhost' && _h !== '127.0.0.1' && _h !== '') {
      _ok = false;
    }
  } catch(e) { _ok = false; }

  // ══ 2. 反 iframe 嵌入 ══
  try {
    if (window.self !== window.top) {
      try { window.top.location.href = window.location.href; } catch(e) { _ok = false; }
    }
  } catch(e) {}

  // ══ 3. 反自動化（Puppeteer / PhantomJS）══
  try {
    if (navigator.webdriver === true) { _ok = false; }
    if (window.callPhantom || window._phantom) { _ok = false; }
  } catch(e) {}

  // ══ 4. 反調試（穩定版）══
  // 收費版做法：不盲目觸發 debugger，而是偵測到才反應
  // - 頁面載入 8 秒後才開始（不影響首屏）
  // - 用 setTimeout 遞增間隔（不是 setInterval 固定轟炸）
  // - 最多檢查 15 次就停（不會無限跑）
  // - Admin 完全跳過
  var _dCnt = 0, _dHit = 0, _dMax = 15;
  function _dCheck() {
    if (_dCnt >= _dMax) return;
    if (window._JY_ADMIN_TOKEN) return;
    _dCnt++;
    try {
      var _t = performance.now();
      debugger;
      var _e = performance.now() - _t;
      if (_e > 80) {
        _dHit++;
        if (_dHit >= 3) {
          try {
            document.body.innerHTML = '';
            var _id = setTimeout(function(){}, 0);
            while (_id > 0) { clearTimeout(_id); clearInterval(_id); _id--; }
          } catch(x) {}
          return;
        }
      } else {
        if (_dHit > 0) _dHit--;
      }
    } catch(x) {}
    var _delay = 5000 + (_dCnt * 1000) + Math.floor(Math.random() * 3000);
    setTimeout(_dCheck, _delay);
  }
  setTimeout(_dCheck, 8000);

  // ══ 5. Console 監控（穩定版 selfDefending 替代）══
  // 收費版做法：不檢查程式碼格式，而是監控是否有人 hook 了 console
  try {
    var _cn = console.log;
    var _cs = Function.prototype.toString;
    var _native = _cs.call(_cn);
    if (_native.indexOf('native code') === -1 && _native.indexOf('[Command Line API]') === -1) {
      window._jy_console_hooked = true;
    }
  } catch(e) {}

  // ══ 6. 右鍵 / 鍵盤封鎖（Admin 跳過）══
  document.addEventListener('contextmenu', function(e) {
    if (!window._JY_ADMIN_TOKEN) e.preventDefault();
  }, true);
  document.addEventListener('keydown', function(e) {
    if (window._JY_ADMIN_TOKEN) return;
    if (e.keyCode === 123) { e.preventDefault(); return false; }
    if (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) {
      e.preventDefault(); return false;
    }
    if (e.ctrlKey && e.keyCode === 85) { e.preventDefault(); return false; }
  }, true);

  // ══ 7. toString 陷阱 ══
  try {
    var _ot = Function.prototype.toString;
    Function.prototype.toString = function() {
      var _r = _ot.call(this);
      if (_r.indexOf('_jy') !== -1 || _r.indexOf('jingyue') !== -1) {
        return 'function () { [native code] }';
      }
      return _r;
    };
    Function.prototype.toString.toString = function() {
      return 'function toString() { [native code] }';
    };
  } catch(e) {}

  // ══ 執行結果 ══
  if (!_ok) {
    try { document.body.innerHTML = ''; window.location.href = 'about:blank'; } catch(e) {}
  }
})();
`;

// ═══════════════════════════════════════════════
// 混淆設定
// ═══════════════════════════════════════════════
const OBF_OPTS = {
  compact: true,
  controlFlowFlattening: true,
  controlFlowFlatteningThreshold: 0.5,
  deadCodeInjection: true,
  deadCodeInjectionThreshold: 0.3,
  identifierNamesGenerator: 'hexadecimal',
  numbersToExpressions: true,

  // RC4 字串加密 + 多層包裝器
  stringArray: true,
  stringArrayEncoding: ['rc4'],
  stringArrayThreshold: 0.75,
  rotateStringArray: true,
  shuffleStringArray: true,
  splitStrings: true,
  splitStringsChunkLength: 8,
  stringArrayWrappersCount: 2,
  stringArrayWrappersChainedCalls: true,
  stringArrayWrappersParametersMaxCount: 3,
  stringArrayWrappersType: 'function',
  stringArrayCallsTransform: true,
  stringArrayCallsTransformThreshold: 0.5,

  // 物件 key 混淆
  transformObjectKeys: true,

  // ★ 關掉 javascript-obfuscator 的爛實現，用 shield 自寫版替代
  debugProtection: false,
  selfDefending: false,

  disableConsoleOutput: false,
  renameGlobals: false,
  unicodeEscapeSequence: true,

  // 域名鎖定（混淆器級，第一層）
  domainLock: ['jingyue.uk', '.jingyue.uk'],
  domainLockRedirectUrl: 'about:blank',

  target: 'browser',
  sourceMap: false,
};

const LARGE_OPTS = {
  controlFlowFlatteningThreshold: 0.3,
  deadCodeInjectionThreshold: 0.15,
  splitStringsChunkLength: 12,
  stringArrayWrappersCount: 1,
};
const ADMIN_OPTS = { domainLock: [], domainLockRedirectUrl: '' };
const SW_OPTS = { domainLock: [] };

// ═══════════════════════════════════════════════
// 開始
// ═══════════════════════════════════════════════
console.log('');
console.log('🔒 靜月之光 JS 混淆工具（修正版）');
console.log('════════════════════════════════════════');
console.log('');
console.log('   ✦ RC4 加密 + 多層包裝器');
console.log('   ✦ 控制流扁平化 + 死碼注入');
console.log('   ✦ 域名鎖定（雙層）');
console.log('   ✦ 反調試（自寫穩定版，不用 JO 的爛實現）');
console.log('   ✦ 反 iframe + 反自動化 + toString 陷阱');
console.log('');

let totalOK = 0, totalFail = 0;

// Part 1: JS/
console.log('📁 [Part 1] JS/ 資料夾');
console.log('────────────────────────────────');
if (!fs.existsSync(JS_BACKUP_DIR)) fs.mkdirSync(JS_BACKUP_DIR, { recursive: true });

for (const fp of JS_FILES) {
  const full = path.resolve(fp);
  if (!fs.existsSync(full)) { console.log(`⚠️  找不到: ${fp}`); totalFail++; continue; }
  const fn = path.basename(fp);
  fs.copyFileSync(full, path.join(JS_BACKUP_DIR, fn));
  let code = fs.readFileSync(full, 'utf-8');
  if (fp === SHIELD_TARGET) { console.log(`🛡️  注入防護盾 → ${fp}`); code = SHIELD_CODE + code; }
  const origKB = (Buffer.byteLength(code) / 1024).toFixed(0);
  console.log(`🔄 ${fp} (${origKB} KB)...`);
  try {
    const t0 = Date.now();
    const opts = fn === 'ai-analysis.js' ? { ...OBF_OPTS, ...LARGE_OPTS } : OBF_OPTS;
    const res = JavaScriptObfuscator.obfuscate(code, opts);
    const out = res.getObfuscatedCode();
    fs.writeFileSync(full, out, 'utf-8');
    console.log(`   ✅ ${origKB} → ${(Buffer.byteLength(out)/1024).toFixed(0)} KB (${((Date.now()-t0)/1000).toFixed(1)}s)`);
    totalOK++;
  } catch (err) {
    console.error(`   ❌ ${err.message}`);
    fs.copyFileSync(path.join(JS_BACKUP_DIR, fn), full); console.log('   ↩️  已還原'); totalFail++;
  }
}

// Part 2: admin/
console.log('');
console.log('📁 [Part 2] admin/ 資料夾');
console.log('────────────────────────────────');
const AH = 'admin/index.html', AB = 'admin/index.backup.html';
const ASW = 'admin/admin-sw.js', ASWB = 'admin/admin-sw.backup.js';

if (fs.existsSync(AH)) {
  const origHtml = fs.readFileSync(AH, 'utf-8');
  fs.writeFileSync(AB, origHtml, 'utf-8');
  console.log(`📋 備份: ${AH} (${(Buffer.byteLength(origHtml)/1024).toFixed(1)} KB)`);
  const re = /(<script>)([\s\S]*?)(<\/script>)/g;
  const matches = []; let m;
  while ((m = re.exec(origHtml)) !== null) matches.push({full:m[0],open:m[1],code:m[2],close:m[3],idx:m.index});
  let result = origHtml;
  for (let i = matches.length-1; i >= 0; i--) {
    const bl = matches[i];
    if (bl.code.trim().length < 100) continue;
    const bKB = (Buffer.byteLength(bl.code)/1024).toFixed(1);
    console.log(`🔄 ${AH} <script#${i+1}> (${bKB} KB)...`);
    try {
      const t0 = Date.now();
      const r = JavaScriptObfuscator.obfuscate(bl.code, {...OBF_OPTS,...ADMIN_OPTS});
      const ob = r.getObfuscatedCode();
      result = result.substring(0,bl.idx)+bl.open+'\n'+ob+'\n'+bl.close+result.substring(bl.idx+bl.full.length);
      console.log(`   ✅ ${bKB} → ${(Buffer.byteLength(ob)/1024).toFixed(1)} KB (${((Date.now()-t0)/1000).toFixed(1)}s)`);
      totalOK++;
    } catch (err) { console.error(`   ❌ ${err.message}`); totalFail++; }
  }
  fs.writeFileSync(AH, result, 'utf-8');
} else { console.log(`⚠️  ${AH} 不存在`); }

if (fs.existsSync(ASW)) {
  const sw = fs.readFileSync(ASW, 'utf-8');
  if (sw.trim().length > 100) {
    console.log(`🔄 ${ASW}...`);
    try {
      fs.writeFileSync(ASWB, sw, 'utf-8');
      fs.writeFileSync(ASW, JavaScriptObfuscator.obfuscate(sw, {...OBF_OPTS,...SW_OPTS}).getObfuscatedCode(), 'utf-8');
      console.log('   ✅ 完成'); totalOK++;
    } catch (e) { console.log(`   ⚠️  ${e.message}`); totalFail++; }
  }
}

// 總結
console.log('');
console.log('════════════════════════════════════════');
console.log(`🔒 完成: ${totalOK} 成功, ${totalFail} 失敗`);
console.log('');
console.log('還原指令（如果又炸了）:');
console.log('   copy JS_backup\\*.js JS\\');
console.log('   copy admin\\index.backup.html admin\\index.html');
console.log('');
console.log('.gitignore 加入: JS_backup/ admin/index.backup.html admin/admin-sw.backup.js');
console.log('');
