/**
 * 靜月之光 — JS 混淆腳本
 * 
 * 使用方式：
 * 1. 在你的 mytool-blue 資料夾裡打開終端機
 * 2. 執行：npm install javascript-obfuscator
 * 3. 執行：node obfuscate.js
 * 4. 混淆後的檔案會出現在 JS/ 資料夾（覆蓋原本的）
 * 5. 原始檔備份在 JS_backup/ 資料夾
 * 6. git add . && git commit -m "obfuscate JS" && git push origin master
 */

const JavaScriptObfuscator = require('javascript-obfuscator');
const fs = require('fs');
const path = require('path');

// 要混淆的檔案（計算引擎）
const FILES_TO_OBFUSCATE = [
  'JS/bazi.js',
  'JS/ziwei.js',
  'JS/tarot.js',
  'JS/ai-analysis.js',
  'JS/meihua_output_layer.js',
  'JS/meihua_upgrade.js',
  'JS/renderMeihua_upgrade.js',
];

// 不混淆的檔案（UI 操作，混淆容易出問題）
// JS/ui.js — 因為跟 DOM 綁很緊，混淆後容易壞

// 備份資料夾
const BACKUP_DIR = 'JS_backup';

// 混淆設定（高強度但保持功能正常）
const OBFUSCATION_OPTIONS = {
  // 壓縮
  compact: true,
  
  // 控制流扁平化（讓邏輯變得難以追蹤）
  controlFlowFlattening: true,
  controlFlowFlatteningThreshold: 0.5,  // 50% 的區塊做扁平化（太高會變很慢）
  
  // 無用程式碼注入（混淆用的假程式碼）
  deadCodeInjection: true,
  deadCodeInjectionThreshold: 0.2,  // 20%（太高檔案會膨脹）
  
  // 變數名混淆
  identifierNamesGenerator: 'hexadecimal',
  
  // 數字轉換
  numbersToExpressions: true,
  
  // 字串混淆
  stringArray: true,
  stringArrayEncoding: ['base64'],
  stringArrayThreshold: 0.75,
  rotateStringArray: true,
  shuffleStringArray: true,
  splitStrings: true,
  splitStringsChunkLength: 8,
  
  // 移除 console.log
  disableConsoleOutput: false,  // 保留 console（你的 debug 可能需要）
  
  // 自我防護（防止被格式化）
  selfDefending: true,
  
  // 保留函數名（讓跨檔案呼叫不會壞）
  renameGlobals: false,
  
  // Unicode 跳脫
  unicodeEscapeSequence: true,
  
  // 目標環境
  target: 'browser',
  
  // 不要 source map（不然混淆就白做了）
  sourceMap: false,
};

// ═══ 執行 ═══
console.log('');
console.log('🔒 靜月之光 JS 混淆工具');
console.log('════════════════════════════════');
console.log('');

// 建立備份資料夾
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  console.log(`📁 已建立備份資料夾: ${BACKUP_DIR}/`);
}

let success = 0;
let failed = 0;

for (const filePath of FILES_TO_OBFUSCATE) {
  const fullPath = path.resolve(filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  找不到: ${filePath}，跳過`);
    failed++;
    continue;
  }
  
  const fileName = path.basename(filePath);
  const backupPath = path.join(BACKUP_DIR, fileName);
  
  // 備份原始檔
  fs.copyFileSync(fullPath, backupPath);
  console.log(`📋 備份: ${filePath} → ${backupPath}`);
  
  // 讀取原始碼
  const originalCode = fs.readFileSync(fullPath, 'utf-8');
  const originalSize = (Buffer.byteLength(originalCode) / 1024).toFixed(0);
  
  console.log(`🔄 混淆中: ${filePath} (${originalSize} KB)...`);
  
  try {
    const startTime = Date.now();
    
    const result = JavaScriptObfuscator.obfuscate(originalCode, {
      ...OBFUSCATION_OPTIONS,
      // ai-analysis.js 太大，降低混淆強度避免超時
      ...(fileName === 'ai-analysis.js' ? {
        controlFlowFlatteningThreshold: 0.3,
        deadCodeInjectionThreshold: 0.1,
        splitStringsChunkLength: 12,
      } : {}),
    });
    
    const obfuscatedCode = result.getObfuscatedCode();
    const newSize = (Buffer.byteLength(obfuscatedCode) / 1024).toFixed(0);
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    
    // 寫回原位
    fs.writeFileSync(fullPath, obfuscatedCode, 'utf-8');
    
    console.log(`✅ 完成: ${filePath} (${originalSize} KB → ${newSize} KB, ${elapsed}s)`);
    success++;
    
  } catch (err) {
    console.error(`❌ 失敗: ${filePath} — ${err.message}`);
    // 還原備份
    fs.copyFileSync(backupPath, fullPath);
    console.log(`↩️  已還原: ${filePath}`);
    failed++;
  }
}

console.log('');
console.log('════════════════════════════════');
console.log(`🔒 混淆完成: ${success} 成功, ${failed} 失敗`);
console.log(`📁 原始碼備份在: ${BACKUP_DIR}/`);
console.log('');
console.log('下一步：');
console.log('  git add .');
console.log('  git commit -m "obfuscate JS engines"');
console.log('  git push origin master');
console.log('');
console.log('⚠️  重要：JS_backup/ 資料夾不要推上 GitHub！');
console.log('  建議加到 .gitignore：echo "JS_backup/" >> .gitignore');
console.log('');
