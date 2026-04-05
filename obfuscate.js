// 測試用：跟原本一模一樣的設定，不注入防護盾
const JavaScriptObfuscator = require('javascript-obfuscator');
const fs = require('fs');
const path = require('path');

const JS_FILES = [
  'JS/bazi.js','JS/ziwei.js','JS/tarot.js','JS/ai-analysis.js',
  'JS/meihua_output_layer.js','JS/meihua_upgrade.js','JS/renderMeihua_upgrade.js',
  'JS/bazi_upgrade.js','JS/jyotish_full_upgrade.js','JS/meihua_upgrade2.js',
  'JS/name_upgrade.js','JS/render_upgrade.js','JS/tarot_upgrade.js',
  'JS/western_upgrade.js','JS/api_upgrade.js','JS/payment-wall.js',
  'JS/solar-location.js','JS/ui.js',
];
const JS_BACKUP_DIR = 'JS_backup';

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

console.log('');
console.log('🔒 測試混淆（無防護盾，原始設定）');
console.log('════════════════════════════════');

if (!fs.existsSync(JS_BACKUP_DIR)) fs.mkdirSync(JS_BACKUP_DIR, { recursive: true });
let success = 0, failed = 0;

for (const filePath of JS_FILES) {
  const fullPath = path.resolve(filePath);
  if (!fs.existsSync(fullPath)) { console.log('⚠️  找不到: ' + filePath); failed++; continue; }
  const fileName = path.basename(filePath);
  fs.copyFileSync(fullPath, path.join(JS_BACKUP_DIR, fileName));
  const code = fs.readFileSync(fullPath, 'utf-8');
  const origKB = (Buffer.byteLength(code) / 1024).toFixed(0);
  console.log('🔄 ' + filePath + ' (' + origKB + ' KB)...');
  try {
    const t0 = Date.now();
    const opts = fileName === 'ai-analysis.js'
      ? { ...OBF_OPTS, controlFlowFlatteningThreshold: 0.3, deadCodeInjectionThreshold: 0.1, splitStringsChunkLength: 12 }
      : OBF_OPTS;
    const res = JavaScriptObfuscator.obfuscate(code, opts);
    fs.writeFileSync(fullPath, res.getObfuscatedCode(), 'utf-8');
    console.log('   ✅ (' + ((Date.now()-t0)/1000).toFixed(1) + 's)');
    success++;
  } catch (err) {
    console.error('   ❌ ' + err.message);
    fs.copyFileSync(path.join(JS_BACKUP_DIR, fileName), fullPath);
    failed++;
  }
}

// admin（只混淆 admin-sw.js，index.html 是後台不需要混淆）
const ASW = 'admin/admin-sw.js', ASWB = 'admin/admin-sw.backup.js';
if (fs.existsSync(ASW)) {
  const sw = fs.readFileSync(ASW, 'utf-8');
  if (sw.trim().length > 100) {
    fs.writeFileSync(ASWB, sw, 'utf-8');
    console.log('🔄 ' + ASW + '...');
    try {
      const r = JavaScriptObfuscator.obfuscate(sw, { ...OBF_OPTS, selfDefending: false });
      fs.writeFileSync(ASW, r.getObfuscatedCode(), 'utf-8');
      console.log('   ✅ admin-sw.js 完成'); success++;
    } catch(err) { console.error('   ❌ ' + err.message); failed++; }
  }
}

console.log('');
console.log('完成: ' + success + ' 成功, ' + failed + ' 失敗');
console.log('還原: copy JS_backup\\*.js JS\\');
console.log('');
