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

// admin
const AH = 'admin/index.html', AB = 'admin/index.backup.html';
if (fs.existsSync(AH)) {
  const html = fs.readFileSync(AH, 'utf-8');
  fs.writeFileSync(AB, html, 'utf-8');
  const re = /(<script>)([\s\S]*?)(<\/script>)/g;
  const matches = []; let m;
  while ((m = re.exec(html)) !== null) matches.push({full:m[0],open:m[1],code:m[2],close:m[3],idx:m.index});
  let result = html;
  for (let i = matches.length-1; i >= 0; i--) {
    const bl = matches[i];
    if (bl.code.trim().length < 100) continue;
    try {
      const r = JavaScriptObfuscator.obfuscate(bl.code, { ...OBF_OPTS, selfDefending: false });
      result = result.substring(0,bl.idx)+bl.open+'\n'+r.getObfuscatedCode()+'\n'+bl.close+result.substring(bl.idx+bl.full.length);
      console.log('   ✅ admin <script>');
      success++;
    } catch(err) { console.error('   ❌ admin: '+err.message); failed++; }
  }
  fs.writeFileSync(AH, result, 'utf-8');
}

console.log('');
console.log('完成: ' + success + ' 成功, ' + failed + ' 失敗');
console.log('還原: copy JS_backup\\*.js JS\\');
console.log('');
