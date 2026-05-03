// Step 3: RC4 ✓ + 防護盾（ui.js 關掉 selfDefending）
// ★ 2026/5/3 更新（接續 2026/4/29）：
//   - 比對 D:\JS_backup 實際檔案後，清單已涵蓋全部該混的檔案，無需新增
//   - 新增大檔降強度名單：>200KB 的命理運算檔案統一降混淆強度，避免處理時間爆炸
//     ai-analysis.js / ui.js / tarot.js / tarot_upgrade.js / bazi.js / oracle.js / ziwei.js
//   - 新增「跨模組共享物件」名單：這些檔案的物件 key 會跟外部其他模組對應，
//     必須關閉 transformObjectKeys 否則會踩雷：
//     pricing-loader.js / weight-engine.js / confidence-bridge.js / ephemeris-client.js
//     photo-upload.js / payment-wall.js
//   - oracle.js 含 crypto.subtle.digest('SHA-256') 神聖隨機數邏輯，降強度避免影響
//   - solar-location.js 用 ?. optional chaining，降一點強度保險
//
//   不混淆:
//     worker.js     → Cloudflare Workers 後端，混淆會炸
//     admin-sw.js   → 已有獨立邏輯處理（見下方）
//     sw.js         → Service Worker / PWA，混淆可能影響離線快取
const JavaScriptObfuscator = require('javascript-obfuscator');
const fs = require('fs');
const path = require('path');

const JS_FILES = [
  // === 七套命理核心 ===
  'JS/bazi.js','JS/ziwei.js','JS/tarot.js','JS/ai-analysis.js',
  'JS/meihua_output_layer.js','JS/meihua_upgrade.js','JS/renderMeihua_upgrade.js',
  'JS/bazi_upgrade.js','JS/jyotish_full_upgrade.js','JS/meihua_upgrade2.js',
  'JS/name_upgrade.js','JS/render_upgrade.js','JS/tarot_upgrade.js',
  'JS/western_upgrade.js','JS/api_upgrade.js','JS/oracle.js',
  'JS/solar-location.js','JS/ui.js',
  // === 商業邏輯模組(2026/4/29)===
  'JS/confidence-bridge.js',  // 七套交叉信心度核心(商業機密)
  'JS/weight-engine.js',      // 信心權重引擎(商業機密)
  'JS/ephemeris-client.js',   // 西占/吠陀星曆計算
  'JS/payment-wall.js',       // 付費牆邏輯
  'JS/pricing-loader.js',     // 價格載入
  'JS/photo-upload.js',       // 圖片上傳
  'JS/guide.js',              // 引導邏輯
  'JS/tool-guide.js',         // 工具說明
];
const SHIELD_TARGET = 'JS/ui.js';
const JS_BACKUP_DIR = 'JS_backup';

// ── 大檔降強度名單（>200KB 的檔案，避免混淆時間 / 解析爆炸）──
const LARGE_FILES = [
  'ai-analysis.js',     // 1.5 MB
  'ui.js',              // 358 KB
  'tarot.js',           // 358 KB
  'tarot_upgrade.js',   // 327 KB
  'bazi.js',            // 306 KB
  'oracle.js',          // 281 KB（同時也是神聖隨機數，降強度雙重保險）
  'ziwei.js',           // 240 KB
];

// ── 跨模組共享物件名單（key 對外可見，不能 transformObjectKeys）──
//   理由：
//     - pricing-loader.js: HARDCODED_FALLBACK 的 key（SUB_STANDARD 等）
//       要跟 ui.js 的 .SINGLE_TAROT 字面存取對應
//     - weight-engine.js: FALLBACK_WEIGHTS / MODEL_MULTIPLIER 的 key
//       (sonnet/opus/love/career/short/mid/long...) 對應 ai-analysis.js
//       傳進來的 string
//     - confidence-bridge.js: 與 weight-engine 同樣的維度 key 流通
//     - ephemeris-client.js: EN_TO_ZH 對應 worker 回傳的 planets[en]
//     - photo-upload.js: PHOTO_FIELDS 的 face/palmLeft/palmRight 與
//       getFieldsForTool 回傳值字串對應
//     - payment-wall.js: 與 worker 回傳 JSON 對接，已有獨立降強度
const SHARED_KEY_FILES = [
  'pricing-loader.js',
  'weight-engine.js',
  'confidence-bridge.js',
  'ephemeris-client.js',
  'photo-upload.js',
  'payment-wall.js',
];

const SHIELD_CODE = `try{(function(){
var _ok=true;
try{var _h=window.location.hostname;
if(_h!=='jingyue.uk'&&_h.indexOf('.jingyue.uk')===-1&&_h!=='localhost'&&_h!=='127.0.0.1'&&_h!==''){_ok=false;}
}catch(e){_ok=false;}
try{if(window.self!==window.top){try{window.top.location.href=window.location.href;}catch(e){_ok=false;}}}catch(e){}
try{if(navigator.webdriver===true)_ok=false;if(window.callPhantom||window._phantom)_ok=false;}catch(e){}
document.addEventListener('contextmenu',function(e){if(!window._JY_ADMIN_TOKEN)e.preventDefault();},true);
document.addEventListener('keydown',function(e){if(window._JY_ADMIN_TOKEN)return;if(e.keyCode===123){e.preventDefault();return false;}if(e.ctrlKey&&e.shiftKey&&(e.keyCode===73||e.keyCode===74||e.keyCode===67)){e.preventDefault();return false;}if(e.ctrlKey&&e.keyCode===85){e.preventDefault();return false;}},true);
try{var _ot=Function.prototype.toString;Function.prototype.toString=function(){var _r=_ot.call(this);if(_r.indexOf('_jy')!==-1||_r.indexOf('jingyue')!==-1)return'function () { [native code] }';return _r;};Function.prototype.toString.toString=function(){return'function toString() { [native code] }';};}catch(e){}
if(!_ok){try{document.body.innerHTML='';window.location.href='about:blank';}catch(e){}}
})();}catch(_e){}\n`;

const OBF_OPTS = {
  compact: true,
  controlFlowFlattening: true,
  controlFlowFlatteningThreshold: 0.75, // ★ Final: 最高實用值
  deadCodeInjection: true,
  deadCodeInjectionThreshold: 0.4,     // ★ Final: 0.3 → 0.4
  identifierNamesGenerator: 'hexadecimal',
  numbersToExpressions: true,
  stringArray: true,
  stringArrayEncoding: ['rc4'],  // ★ 測試這個
  stringArrayThreshold: 0.75,
  rotateStringArray: true,
  shuffleStringArray: true,
  splitStrings: true,
  splitStringsChunkLength: 8,
  // ★ Step 4: 字串多層包裝器
  stringArrayWrappersCount: 3,           // ★ Final: 2 → 3 層
  stringArrayWrappersChainedCalls: true,
  stringArrayWrappersParametersMaxCount: 4, // ★ Final: 3 → 4
  stringArrayWrappersType: 'function',
  stringArrayCallsTransform: true,
  stringArrayCallsTransformThreshold: 0.75, // ★ Final: 0.5 → 0.75
  // ★ Step 5: 物件 key 混淆
  transformObjectKeys: true,
  disableConsoleOutput: false,
  selfDefending: true,
  renameGlobals: false,
  unicodeEscapeSequence: true,
  // ★ Step 7: 域名鎖定（混淆器級，每個檔案都檢查）
  domainLock: ['jingyue.uk', '.jingyue.uk'],
  domainLockRedirectUrl: 'about:blank',
  target: 'browser',
  sourceMap: false,
};

console.log('');
console.log('🔒 Step 3: RC4 + 防護盾(2026/5/3 完整版)');
console.log('════════════════════════════════');
console.log('混淆檔案總數:' + JS_FILES.length + ' 個');
console.log('  • 大檔降強度:' + LARGE_FILES.length + ' 個 (>200KB)');
console.log('  • 共享 key 保留:' + SHARED_KEY_FILES.length + ' 個 (跨模組對接)');
console.log('');

if (!fs.existsSync(JS_BACKUP_DIR)) fs.mkdirSync(JS_BACKUP_DIR, { recursive: true });
let success = 0, failed = 0;

for (const filePath of JS_FILES) {
  const fullPath = path.resolve(filePath);
  if (!fs.existsSync(fullPath)) { console.log('⚠️  找不到: ' + filePath); failed++; continue; }
  const fileName = path.basename(filePath);
  fs.copyFileSync(fullPath, path.join(JS_BACKUP_DIR, fileName));
  let code = fs.readFileSync(fullPath, 'utf-8');
  let opts = { ...OBF_OPTS };
  let strengthNote = '';

  // ─── 大檔降強度（避免處理 / 解析爆炸）───
  if (LARGE_FILES.indexOf(fileName) !== -1) {
    opts.controlFlowFlatteningThreshold = 0.5;
    opts.deadCodeInjectionThreshold = 0.2;
    opts.splitStringsChunkLength = 12;
    opts.stringArrayWrappersCount = 2;
    strengthNote += '[大檔降強度]';
  }

  // ─── 跨模組共享物件保留 key（防 ui.js / ai-analysis.js 對接斷裂）───
  if (SHARED_KEY_FILES.indexOf(fileName) !== -1) {
    opts.transformObjectKeys = false;
    strengthNote += '[保留 key]';
  }

  // ─── payment-wall.js 額外降強度（金流核心，保護既有 fetch hook）───
  if (fileName === 'payment-wall.js') {
    opts.controlFlowFlatteningThreshold = 0.5;
    opts.deadCodeInjectionThreshold = 0.2;
    opts.stringArrayWrappersCount = 2;
    strengthNote += '[金流降強度]';
  }

  // ─── solar-location.js 用 ?. optional chaining，保險降一點強度 ───
  if (fileName === 'solar-location.js') {
    opts.controlFlowFlatteningThreshold = 0.5;
    opts.deadCodeInjectionThreshold = 0.2;
    strengthNote += '[ES2020 保護]';
  }

  // ─── 防護盾注入（只 ui.js）───
  if (filePath === SHIELD_TARGET) {
    console.log('🛡️  注入防護盾 → ' + filePath);
    code = SHIELD_CODE + code;
    opts.selfDefending = false; // 注入後結構變了，selfDefending 會衝突
  }

  const origKB = (Buffer.byteLength(code) / 1024).toFixed(0);
  console.log('🔄 ' + filePath + ' (' + origKB + ' KB) ' + strengthNote);
  try {
    const t0 = Date.now();
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
      const r = JavaScriptObfuscator.obfuscate(sw, { ...OBF_OPTS, selfDefending: false, domainLock: [] });
      fs.writeFileSync(ASW, r.getObfuscatedCode(), 'utf-8');
      console.log('   ✅ admin-sw.js 完成'); success++;
    } catch(err) { console.error('   ❌ ' + err.message); failed++; }
  }
}

console.log('');
console.log('完成: ' + success + ' 成功, ' + failed + ' 失敗');
console.log('還原: copy JS_backup\\*.js JS\\');
console.log('');
console.log('⚠️  以下檔案【不會】被混淆,這是故意的:');
console.log('   • worker.js          → Cloudflare Workers 後端,混淆會炸');
console.log('   • sw.js              → Service Worker / PWA,影響離線快取');
console.log('   • admin-sw.js        → 已有獨立混淆邏輯(見上方)');
console.log('');
