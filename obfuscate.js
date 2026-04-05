// Step 3: RC4 ✓ + 防護盾（ui.js 關掉 selfDefending）
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
const SHIELD_TARGET = 'JS/ui.js';
const JS_BACKUP_DIR = 'JS_backup';

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
  controlFlowFlatteningThreshold: 0.7,  // ★ Step 6: 0.5 → 0.7
  deadCodeInjection: true,
  deadCodeInjectionThreshold: 0.3,      // ★ Step 6: 0.2 → 0.3
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
  stringArrayWrappersCount: 2,
  stringArrayWrappersChainedCalls: true,
  stringArrayWrappersParametersMaxCount: 3,
  stringArrayWrappersType: 'function',
  stringArrayCallsTransform: true,
  stringArrayCallsTransformThreshold: 0.5,
  // ★ Step 5: 物件 key 混淆
  transformObjectKeys: true,
  disableConsoleOutput: false,
  selfDefending: true,
  renameGlobals: false,
  unicodeEscapeSequence: true,
  target: 'browser',
  sourceMap: false,
};

console.log('');
console.log('🔒 Step 3: RC4 + 防護盾');
console.log('════════════════════════════════');

if (!fs.existsSync(JS_BACKUP_DIR)) fs.mkdirSync(JS_BACKUP_DIR, { recursive: true });
let success = 0, failed = 0;

for (const filePath of JS_FILES) {
  const fullPath = path.resolve(filePath);
  if (!fs.existsSync(fullPath)) { console.log('⚠️  找不到: ' + filePath); failed++; continue; }
  const fileName = path.basename(filePath);
  fs.copyFileSync(fullPath, path.join(JS_BACKUP_DIR, fileName));
  let code = fs.readFileSync(fullPath, 'utf-8');
  let opts = { ...OBF_OPTS };
  if (fileName === 'ai-analysis.js') {
    opts.controlFlowFlatteningThreshold = 0.4;  // 大檔降低
    opts.deadCodeInjectionThreshold = 0.15;
    opts.splitStringsChunkLength = 12;
    opts.stringArrayWrappersCount = 1;
  }
  if (filePath === SHIELD_TARGET) {
    console.log('🛡️  注入防護盾 → ' + filePath);
    code = SHIELD_CODE + code;
    opts.selfDefending = false; // 注入後結構變了，selfDefending 會衝突
  }
  const origKB = (Buffer.byteLength(code) / 1024).toFixed(0);
  console.log('🔄 ' + filePath + ' (' + origKB + ' KB)...');
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
