/**
 * 靜月之光 — JS 混淆腳本
 * 
 * 基於原本能跑的設定，新增：
 *   + 防護盾注入（域名鎖定/反iframe/鍵盤封鎖/toString陷阱）
 *   + admin/ 資料夾處理
 *
 * 使用：
 *   cd D:\mytool-blue
 *   copy JS_backup\*.js JS\          ← 從原始碼開始
 *   node obfuscate.js
 *   git add . && git commit -m "obfuscate" && git push origin master
 */

const JavaScriptObfuscator = require('javascript-obfuscator');
const fs = require('fs');
const path = require('path');

// ═══════════════════════════════════════════════
// 要混淆的檔案（跟原本一樣）
// ═══════════════════════════════════════════════
const JS_FILES = [
  'JS/bazi.js','JS/ziwei.js','JS/tarot.js','JS/ai-analysis.js',
  'JS/meihua_output_layer.js','JS/meihua_upgrade.js','JS/renderMeihua_upgrade.js',
  'JS/bazi_upgrade.js','JS/jyotish_full_upgrade.js','JS/meihua_upgrade2.js',
  'JS/name_upgrade.js','JS/render_upgrade.js','JS/tarot_upgrade.js',
  'JS/western_upgrade.js','JS/api_upgrade.js','JS/payment-wall.js',
  'JS/solar-location.js','JS/ui.js',
];
const SHIELD_TARGET = 'JS/ui.js';
const JS_BACKUP_DIR = 'JS_backup';

// ═══════════════════════════════════════════════
// 防護盾（注入 ui.js 開頭）
// ═══════════════════════════════════════════════
const SHIELD_CODE = `
(function(){
  var _ok = true;
  try {
    var _h = window.location.hostname;
    if (_h !== 'jingyue.uk' && _h.indexOf('.jingyue.uk') === -1
        && _h !== 'localhost' && _h !== '127.0.0.1' && _h !== '') {
      _ok = false;
    }
  } catch(e) { _ok = false; }
  try {
    if (window.self !== window.top) {
      try { window.top.location.href = window.location.href; } catch(e) { _ok = false; }
    }
  } catch(e) {}
  try {
    if (navigator.webdriver === true) _ok = false;
    if (window.callPhantom || window._phantom) _ok = false;
  } catch(e) {}
  document.addEventListener('contextmenu', function(e) {
    if (!window._JY_ADMIN_TOKEN) e.preventDefault();
  }, true);
  document.addEventListener('keydown', function(e) {
    if (window._JY_ADMIN_TOKEN) return;
    if (e.keyCode === 123) { e.preventDefault(); return false; }
    if (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) { e.preventDefault(); return false; }
    if (e.ctrlKey && e.keyCode === 85) { e.preventDefault(); return false; }
  }, true);
  try {
    var _ot = Function.prototype.toString;
    Function.prototype.toString = function() {
      var _r = _ot.call(this);
      if (_r.indexOf('_jy') !== -1 || _r.indexOf('jingyue') !== -1) return 'function () { [native code] }';
      return _r;
    };
    Function.prototype.toString.toString = function() { return 'function toString() { [native code] }'; };
  } catch(e) {}
  if (!_ok) {
    try { document.body.innerHTML = ''; window.location.href = 'about:blank'; } catch(e) {}
  }
})();
`;

// ═══════════════════════════════════════════════
// 混淆設定（跟你原本能跑的一模一樣）
// ═══════════════════════════════════════════════
const OBF_OPTS = {
  compact: true,
  controlFlowFlattening: true,
  controlFlowFlatteningThreshold: 0.5,
  deadCodeInjection: true,
  deadCodeInjectionThreshold: 0.2,
  identifierNamesGenerator: 'hexadecimal',
  numbersToExpressions: true,
  stringArray: true,
  stringArrayEncoding: ['base64'],
  stringArrayThreshold: 0.75,
  rotateStringArray: true,
  shuffleStringArray: true,
  splitStrings: true,
  splitStringsChunkLength: 8,
  disableConsoleOutput: false,
  selfDefending: true,
  renameGlobals: false,
  unicodeEscapeSequence: true,
  target: 'browser',
  sourceMap: false,
};

// ai-analysis.js 太大，降低強度（跟原本一樣）
const LARGE_OPTS = {
  controlFlowFlatteningThreshold: 0.3,
  deadCodeInjectionThreshold: 0.1,
  splitStringsChunkLength: 12,
};

// ═══════════════════════════════════════════════
// 開始
// ═══════════════════════════════════════════════
console.log('');
console.log('🔒 靜月之光 JS 混淆工具');
console.log('════════════════════════════════');
console.log('');

if (!fs.existsSync(JS_BACKUP_DIR)) {
  fs.mkdirSync(JS_BACKUP_DIR, { recursive: true });
  console.log(`📁 已建立備份資料夾: ${JS_BACKUP_DIR}/`);
}

let success = 0, failed = 0;

// ───────────────────────────────────────────────
// Part 1: JS/ 資料夾
// ───────────────────────────────────────────────
for (const filePath of JS_FILES) {
  const fullPath = path.resolve(filePath);
  if (!fs.existsSync(fullPath)) { console.log(`⚠️  找不到: ${filePath}，跳過`); failed++; continue; }
  const fileName = path.basename(filePath);
  const backupPath = path.join(JS_BACKUP_DIR, fileName);
  fs.copyFileSync(fullPath, backupPath);
  console.log(`📋 備份: ${filePath} → ${backupPath}`);

  let originalCode = fs.readFileSync(fullPath, 'utf-8');

  // 注入防護盾
  if (filePath === SHIELD_TARGET) {
    console.log(`🛡️  注入防護盾 → ${filePath}`);
    originalCode = SHIELD_CODE + '\n' + originalCode;
  }

  const originalSize = (Buffer.byteLength(originalCode) / 1024).toFixed(0);
  console.log(`🔄 混淆中: ${filePath} (${originalSize} KB)...`);

  try {
    const startTime = Date.now();
    const result = JavaScriptObfuscator.obfuscate(originalCode, {
      ...OBF_OPTS,
      ...(fileName === 'ai-analysis.js' ? LARGE_OPTS : {}),
    });
    const obfuscatedCode = result.getObfuscatedCode();
    const newSize = (Buffer.byteLength(obfuscatedCode) / 1024).toFixed(0);
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    fs.writeFileSync(fullPath, obfuscatedCode, 'utf-8');
    console.log(`✅ 完成: ${filePath} (${originalSize} KB → ${newSize} KB, ${elapsed}s)`);
    success++;
  } catch (err) {
    console.error(`❌ 失敗: ${filePath} — ${err.message}`);
    fs.copyFileSync(backupPath, fullPath);
    console.log(`↩️  已還原: ${filePath}`);
    failed++;
  }
}

// ───────────────────────────────────────────────
// Part 2: admin/ 資料夾
// ───────────────────────────────────────────────
console.log('');
console.log('📁 admin/ 資料夾');
console.log('────────────────────────────────');

const AH = 'admin/index.html', AB = 'admin/index.backup.html';
const ASW = 'admin/admin-sw.js', ASWB = 'admin/admin-sw.backup.js';

if (fs.existsSync(AH)) {
  const origHtml = fs.readFileSync(AH, 'utf-8');
  fs.writeFileSync(AB, origHtml, 'utf-8');
  console.log(`📋 備份: ${AH}`);

  const re = /(<script>)([\s\S]*?)(<\/script>)/g;
  const matches = []; let m;
  while ((m = re.exec(origHtml)) !== null)
    matches.push({ full: m[0], open: m[1], code: m[2], close: m[3], idx: m.index });

  let result = origHtml;
  for (let i = matches.length - 1; i >= 0; i--) {
    const bl = matches[i];
    if (bl.code.trim().length < 100) continue;
    const bKB = (Buffer.byteLength(bl.code) / 1024).toFixed(1);
    console.log(`🔄 混淆: ${AH} <script#${i+1}> (${bKB} KB)...`);
    try {
      const t0 = Date.now();
      const r = JavaScriptObfuscator.obfuscate(bl.code, OBF_OPTS);
      const ob = r.getObfuscatedCode();
      result = result.substring(0, bl.idx) + bl.open + '\n' + ob + '\n' + bl.close
             + result.substring(bl.idx + bl.full.length);
      console.log(`   ✅ ${bKB} → ${(Buffer.byteLength(ob)/1024).toFixed(1)} KB (${((Date.now()-t0)/1000).toFixed(1)}s)`);
      success++;
    } catch (err) { console.error(`   ❌ ${err.message}`); failed++; }
  }
  fs.writeFileSync(AH, result, 'utf-8');
}

if (fs.existsSync(ASW)) {
  const sw = fs.readFileSync(ASW, 'utf-8');
  if (sw.trim().length > 100) {
    console.log(`🔄 混淆: ${ASW}...`);
    try {
      fs.writeFileSync(ASWB, sw, 'utf-8');
      const swOpts = { ...OBF_OPTS, selfDefending: false };
      fs.writeFileSync(ASW, JavaScriptObfuscator.obfuscate(sw, swOpts).getObfuscatedCode(), 'utf-8');
      console.log('   ✅ 完成'); success++;
    } catch (e) { console.log(`   ⚠️  ${e.message}`); failed++; }
  }
}

// ═══════════════════════════════════════════════
// 總結
// ═══════════════════════════════════════════════
console.log('');
console.log('════════════════════════════════');
console.log(`🔒 混淆完成: ${success} 成功, ${failed} 失敗`);
console.log(`📁 原始碼備份在: ${JS_BACKUP_DIR}/`);
console.log('');
console.log('還原指令:');
console.log('   copy JS_backup\\*.js JS\\');
console.log('   copy admin\\index.backup.html admin\\index.html');
console.log('');
console.log('下一步：');
console.log('   git add .');
console.log('   git commit -m "obfuscate"');
console.log('   git push origin master');
console.log('');
console.log('⚠️  .gitignore 加入: JS_backup/ admin/index.backup.html admin/admin-sw.backup.js');
console.log('');
