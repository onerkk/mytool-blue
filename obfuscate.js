/**
 * 靜月之光 — JS 混淆腳本（終極版 + 程式碼虛擬化）
 *
 * 安裝依賴：npm install javascript-obfuscator acorn
 *
 * 使用方式：
 *   cd D:\mytool-blue
 *   node obfuscate.js
 *   git add . && git commit -m "obfuscate" && git push origin master
 *
 * 功能：
 *   ✦ 程式碼虛擬化（自定義字節碼 VM — 收費版核心功能）
 *   ✦ RC4 字串加密 + 多層包裝器
 *   ✦ 域名鎖定（雙層）+ 反調試 + 反 iframe
 *   ✦ 控制流扁平化 + 死碼注入 + 自我防護
 */

const JavaScriptObfuscator = require('javascript-obfuscator');
const acorn = require('acorn');
const fs = require('fs');
const path = require('path');

// ═══════════════════════════════════════════════
// 檔案清單
// ═══════════════════════════════════════════════
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
// 防護盾原始碼（會被編譯成字節碼）
// ═══════════════════════════════════════════════
const SHIELD_SOURCE = `(function(){
  var _ok = true;
  try {
    var _h = window.location.hostname;
    var _al = ['jingyue.uk','localhost','127.0.0.1',''];
    var _p = false;
    for (var i = 0; i < _al.length; i++) {
      if (_h === _al[i] || _h.indexOf('.jingyue.uk') !== -1) { _p = true; break; }
    }
    if (!_p) { _ok = false; }
  } catch(e) { _ok = false; }
  try {
    if (window.self !== window.top) {
      try { window.top.location.href = window.location.href; } catch(e2) { _ok = false; }
    }
  } catch(e) {}
  try {
    if (navigator.webdriver === true) { _ok = false; }
    if (window.callPhantom || window._phantom) { _ok = false; }
  } catch(e) {}
  var _dc = 0;
  function _ad() {
    var _s = Date.now();
    debugger;
    if (Date.now() - _s > 100) {
      _dc = _dc + 1;
      if (_dc > 2) {
        try {
          document.body.innerHTML = '';
          var _id = setTimeout(function(){}, 0);
          while (_id) { clearTimeout(_id); clearInterval(_id); _id = _id - 1; }
        } catch(e) {}
      }
    }
  }
  function _sa() {
    var _d = 2000 + Math.floor(Math.random() * 3000);
    setTimeout(function(){ _ad(); _sa(); }, _d);
  }
  _sa();
  document.addEventListener('contextmenu', function(ev) {
    if (!window._JY_ADMIN_TOKEN) { ev.preventDefault(); }
  }, true);
  document.addEventListener('keydown', function(ev) {
    if (window._JY_ADMIN_TOKEN) { return; }
    if (ev.keyCode === 123) { ev.preventDefault(); }
    if (ev.ctrlKey && ev.shiftKey && (ev.keyCode === 73 || ev.keyCode === 74 || ev.keyCode === 67)) { ev.preventDefault(); }
    if (ev.ctrlKey && ev.keyCode === 85) { ev.preventDefault(); }
  }, true);
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
  if (!_ok) {
    try { document.body.innerHTML = ''; window.location.href = 'about:blank'; } catch(e) {}
  }
})();`;

// ═══════════════════════════════════════════════
// VM 運行時（瀏覽器端解釋器，~50行）
// ═══════════════════════════════════════════════
const VM_RUNTIME = `function _jyVM(P,E){
var s=P.s,B=P.b,K=P.k,f=P.f||[],pc=0,S=[],sc=E||{},ts=[];
var bc=[];for(var _i=0;_i<B.length;_i++)bc[_i]=B[_i]^K.charCodeAt(_i%K.length);
function u16(){var v=(bc[pc]<<8)|bc[pc+1];pc+=2;return v}
function pop(){return S.pop()}
function push(v){S.push(v)}
while(pc<bc.length){try{while(pc<bc.length){var op=bc[pc++];switch(op){
case 1:push(bc[pc++]);break;
case 2:push(s[u16()]);break;
case 3:push(!0);break;case 4:push(!1);break;case 5:push(null);break;case 6:push(void 0);break;
case 8:push(u16());break;case 9:push(-u16());break;
case 16:{var n=s[u16()];push(n in sc?sc[n]:typeof window!=='undefined'?window[n]:void 0);break}
case 17:sc[s[u16()]]=pop();break;
case 18:{var k=pop(),o=pop();push(o[k]);break}
case 19:{var v=pop(),k=pop(),o=pop();o[k]=v;break}
case 23:push(sc['this']||this);break;
case 32:{var b=pop(),a=pop();push(a+b);break}
case 33:{var b=pop(),a=pop();push(a-b);break}
case 34:{var b=pop(),a=pop();push(a*b);break}
case 35:{var b=pop(),a=pop();push(a===b);break}
case 36:{var b=pop(),a=pop();push(a!==b);break}
case 37:push(!pop());break;
case 40:{var b=pop(),a=pop();push(a>b);break}
case 41:{var b=pop(),a=pop();push(a<b);break}
case 42:{var b=pop(),a=pop();push(a>=b);break}
case 43:{var b=pop(),a=pop();push(a<=b);break}
case 44:push(typeof pop());break;
case 45:{var b=pop(),a=pop();push(a==b);break}
case 46:{var b=pop(),a=pop();push(a!=b);break}
case 47:push(-pop());break;
case 48:pc=u16();break;
case 49:{var t=u16();if(!pop())pc=t;break}
case 50:{var t=u16();if(pop())pc=t;break}
case 64:{var n=bc[pc++],ar=[];for(var i=0;i<n;i++)ar.unshift(pop());var m=pop(),o=pop();push(o[m].apply(o,ar));break}
case 65:{var n=bc[pc++],ar=[];for(var i=0;i<n;i++)ar.unshift(pop());push(pop().apply(null,ar));break}
case 66:{var n=bc[pc++],ar=[];for(var i=0;i<n;i++)ar.unshift(pop());push(ar);break}
case 68:{var idx=u16(),sp=f[idx],cs=sc;push(function(){for(var i=0;i<sp.p.length;i++)cs[sp.p[i]]=arguments[i];cs['this']=this;return _jyVM(sp,cs)});break}
case 80:pop();break;
case 81:push(S[S.length-1]);break;
case 82:ts.push({a:u16(),sl:S.length});break;
case 83:ts.pop();break;
case 84:debugger;break;
case 255:return pop();
}}}catch(err){if(ts.length){var fr=ts.pop();S.length=fr.sl;push(err);pc=fr.a}else{break}}}
}`;

// ═══════════════════════════════════════════════
// 字節碼編譯器（Node.js 端，用 acorn 解析 AST）
// ═══════════════════════════════════════════════
class VMCompiler {
  constructor() { this.bc = []; this.strings = []; this.functions = []; this.breakStack = []; }
  addStr(s) { let i = this.strings.indexOf(s); if (i === -1) { i = this.strings.length; this.strings.push(s); } return i; }
  emit(...ops) { this.bc.push(...ops); }
  emit16(v) { this.bc.push((v >> 8) & 0xFF, v & 0xFF); }
  pos() { return this.bc.length; }
  patch16(p, v) { this.bc[p] = (v >> 8) & 0xFF; this.bc[p + 1] = v & 0xFF; }

  compile(code) {
    const ast = acorn.parse(code, { ecmaVersion: 2020 });
    let body = ast.body;
    // 偵測 IIFE 並直接編譯內部
    if (body.length === 1 && body[0].type === 'ExpressionStatement') {
      const expr = body[0].expression;
      if (expr.type === 'CallExpression' && expr.callee.type === 'FunctionExpression') {
        body = expr.callee.body.body;
      }
    }
    // 先提升 FunctionDeclaration
    for (const n of body) { if (n.type === 'FunctionDeclaration') this.funcDecl(n); }
    for (const n of body) { if (n.type !== 'FunctionDeclaration') this.stmt(n); }
    return { s: this.strings, b: this.bc, f: this.functions, p: [], k: '' };
  }

  stmt(n) {
    if (!n) return;
    switch (n.type) {
      case 'BlockStatement': n.body.forEach(c => this.stmt(c)); break;
      case 'ExpressionStatement':
        if (n.expression.type === 'Literal' && typeof n.expression.value === 'string') break; // skip 'use strict'
        this.expr(n.expression); this.emit(80); break;
      case 'VariableDeclaration':
        for (const d of n.declarations) {
          if (d.init) this.expr(d.init); else this.emit(6);
          this.emit(17); this.emit16(this.addStr(d.id.name));
        } break;
      case 'IfStatement':
        this.expr(n.test); this.emit(49);
        const jz = this.pos(); this.emit16(0);
        this.stmt(n.consequent);
        if (n.alternate) {
          this.emit(48); const jmp = this.pos(); this.emit16(0);
          this.patch16(jz, this.pos()); this.stmt(n.alternate); this.patch16(jmp, this.pos());
        } else { this.patch16(jz, this.pos()); }
        break;
      case 'ForStatement':
        if (n.init) { if (n.init.type === 'VariableDeclaration') this.stmt(n.init); else { this.expr(n.init); this.emit(80); } }
        const ls = this.pos();
        this.breakStack.push([]);
        let lePos;
        if (n.test) { this.expr(n.test); this.emit(49); lePos = this.pos(); this.emit16(0); }
        this.stmt(n.body);
        if (n.update) { this.expr(n.update); this.emit(80); }
        this.emit(48); this.emit16(ls);
        const endF = this.pos();
        if (n.test) this.patch16(lePos, endF);
        this.breakStack.pop().forEach(p => this.patch16(p, endF));
        break;
      case 'WhileStatement': {
        const ws = this.pos();
        this.breakStack.push([]);
        this.expr(n.test); this.emit(49); const we = this.pos(); this.emit16(0);
        this.stmt(n.body);
        this.emit(48); this.emit16(ws);
        const endW = this.pos(); this.patch16(we, endW);
        this.breakStack.pop().forEach(p => this.patch16(p, endW));
        break;
      }
      case 'ReturnStatement':
        if (n.argument) this.expr(n.argument); else this.emit(6);
        this.emit(255); break;
      case 'BreakStatement':
        this.emit(48);
        if (this.breakStack.length) this.breakStack[this.breakStack.length - 1].push(this.pos());
        this.emit16(0); break;
      case 'TryStatement': {
        this.emit(82); const cp = this.pos(); this.emit16(0);
        this.stmt(n.block); this.emit(83);
        this.emit(48); const ap = this.pos(); this.emit16(0);
        this.patch16(cp, this.pos());
        if (n.handler) {
          if (n.handler.param) { this.emit(17); this.emit16(this.addStr(n.handler.param.name)); }
          else this.emit(80);
          this.stmt(n.handler.body);
        } else { this.emit(80); }
        this.patch16(ap, this.pos());
        if (n.finalizer) this.stmt(n.finalizer);
        break;
      }
      case 'FunctionDeclaration': break; // handled by hoist
      case 'EmptyStatement': break;
      case 'DebuggerStatement': this.emit(84); break;
      default: console.warn('[VM] Unsupported stmt:', n.type);
    }
  }

  expr(n) {
    if (!n) { this.emit(6); return; }
    const binOps = {'+':32,'-':33,'*':34,'===':35,'!==':36,'>':40,'<':41,'>=':42,'<=':43,'==':45,'!=':46};
    switch (n.type) {
      case 'Literal':
        if (typeof n.value === 'number') this.emitNum(n.value);
        else if (typeof n.value === 'string') { this.emit(2); this.emit16(this.addStr(n.value)); }
        else if (n.value === true) this.emit(3);
        else if (n.value === false) this.emit(4);
        else if (n.value === null) this.emit(5);
        break;
      case 'Identifier':
        this.emit(16); this.emit16(this.addStr(n.name)); break;
      case 'ThisExpression': this.emit(23); break;
      case 'MemberExpression':
        this.expr(n.object);
        if (n.computed) this.expr(n.property);
        else { this.emit(2); this.emit16(this.addStr(n.property.name)); }
        this.emit(18); break;
      case 'CallExpression':
        if (n.callee.type === 'MemberExpression') {
          this.expr(n.callee.object);
          if (n.callee.computed) this.expr(n.callee.property);
          else { this.emit(2); this.emit16(this.addStr(n.callee.property.name)); }
          n.arguments.forEach(a => this.expr(a));
          this.emit(64, n.arguments.length);
        } else {
          this.expr(n.callee);
          n.arguments.forEach(a => this.expr(a));
          this.emit(65, n.arguments.length);
        }
        break;
      case 'BinaryExpression':
        this.expr(n.left); this.expr(n.right);
        if (binOps[n.operator] !== undefined) this.emit(binOps[n.operator]);
        else { console.warn('[VM] Unsupported op:', n.operator); this.emit(6); }
        break;
      case 'LogicalExpression':
        this.expr(n.left); this.emit(81); // DUP
        if (n.operator === '&&') {
          this.emit(49); const sk = this.pos(); this.emit16(0);
          this.emit(80); this.expr(n.right); this.patch16(sk, this.pos());
        } else {
          this.emit(50); const sk = this.pos(); this.emit16(0);
          this.emit(80); this.expr(n.right); this.patch16(sk, this.pos());
        }
        break;
      case 'UnaryExpression':
        if (n.operator === '-' && n.argument.type === 'Literal' && typeof n.argument.value === 'number') {
          this.emitNum(-n.argument.value);
        } else if (n.operator === 'typeof') {
          this.expr(n.argument); this.emit(44);
        } else {
          this.expr(n.argument);
          if (n.operator === '!') this.emit(37);
          else if (n.operator === '-') this.emit(47);
        }
        break;
      case 'UpdateExpression': {
        const vn = n.argument.name;
        if (n.prefix) {
          this.emit(16); this.emit16(this.addStr(vn));
          this.emit(1, 1); this.emit(n.operator === '++' ? 32 : 33);
          this.emit(81); this.emit(17); this.emit16(this.addStr(vn));
        } else {
          this.emit(16); this.emit16(this.addStr(vn));
          this.emit(81); this.emit(1, 1); this.emit(n.operator === '++' ? 32 : 33);
          this.emit(17); this.emit16(this.addStr(vn));
        }
        break;
      }
      case 'AssignmentExpression':
        if (n.left.type === 'Identifier') {
          if (n.operator === '=') { this.expr(n.right); }
          else {
            this.emit(16); this.emit16(this.addStr(n.left.name));
            this.expr(n.right);
            const aop = {'+=' :32, '-=':33, '*=':34};
            this.emit(aop[n.operator] || 32);
          }
          this.emit(81); this.emit(17); this.emit16(this.addStr(n.left.name));
        } else if (n.left.type === 'MemberExpression') {
          this.expr(n.left.object);
          if (n.left.computed) this.expr(n.left.property);
          else { this.emit(2); this.emit16(this.addStr(n.left.property.name)); }
          this.expr(n.right);
          this.emit(19); this.emit(6); // SET_PROP + push undef as expr result
        }
        break;
      case 'ArrayExpression':
        (n.elements || []).forEach(e => this.expr(e || { type: 'Literal', value: null }));
        this.emit(66, (n.elements || []).length); break;
      case 'ObjectExpression':
        this.emit(2); this.emit16(this.addStr('Object')); // push "Object"
        // Simplified: create empty object, then set properties
        // Actually just push {}:
        this.bc.pop(); this.bc.pop(); this.bc.pop(); // undo the PUSH_STR
        // Create object via array trick:
        this.emit(6); // push undefined placeholder
        // Actually let me just emit new object via JSON trick
        // For shield code, ObjectExpression isn't used, so skip
        console.warn('[VM] ObjectExpression not fully supported');
        break;
      case 'FunctionExpression':
        this.funcExpr(n); break;
      case 'ConditionalExpression':
        this.expr(n.test); this.emit(49);
        const te = this.pos(); this.emit16(0);
        this.expr(n.consequent); this.emit(48);
        const tend = this.pos(); this.emit16(0);
        this.patch16(te, this.pos()); this.expr(n.alternate);
        this.patch16(tend, this.pos()); break;
      case 'SequenceExpression':
        n.expressions.forEach((e, i) => {
          this.expr(e);
          if (i < n.expressions.length - 1) this.emit(80);
        }); break;
      default:
        console.warn('[VM] Unsupported expr:', n.type); this.emit(6);
    }
  }

  emitNum(n) {
    if (Number.isInteger(n) && n >= 0 && n <= 255) { this.emit(1, n); }
    else if (Number.isInteger(n) && n > 255 && n <= 65535) { this.emit(8); this.emit16(n); }
    else if (Number.isInteger(n) && n < 0 && n >= -65535) { this.emit(9); this.emit16(-n); }
    else { this.emit(2); this.emit16(this.addStr(String(n))); } // fallback
  }

  funcDecl(n) {
    const sub = new VMCompiler();
    for (const c of n.body.body) { if (c.type === 'FunctionDeclaration') sub.funcDecl(c); }
    for (const c of n.body.body) { if (c.type !== 'FunctionDeclaration') sub.stmt(c); }
    const idx = this.functions.length;
    this.functions.push({ s: sub.strings, b: sub.bc, f: sub.functions, p: n.params.map(p => p.name), k: '' });
    this.emit(68); this.emit16(idx);
    this.emit(17); this.emit16(this.addStr(n.id.name));
  }

  funcExpr(n) {
    const sub = new VMCompiler();
    for (const c of n.body.body) { if (c.type === 'FunctionDeclaration') sub.funcDecl(c); }
    for (const c of n.body.body) { if (c.type !== 'FunctionDeclaration') sub.stmt(c); }
    const idx = this.functions.length;
    this.functions.push({ s: sub.strings, b: sub.bc, f: sub.functions, p: n.params.map(p => p.name), k: '' });
    this.emit(68); this.emit16(idx);
  }
}

// ═══════════════════════════════════════════════
// 字節碼加密 + 產生虛擬化後的防護盾
// ═══════════════════════════════════════════════
function generateKey(len) {
  const c = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let k = '';
  for (let i = 0; i < len; i++) k += c[Math.floor(Math.random() * c.length)];
  return k;
}

function encryptProgram(prog, key) {
  prog.k = key;
  prog.b = prog.b.map((v, i) => v ^ key.charCodeAt(i % key.length));
  if (prog.f) prog.f.forEach(sp => encryptProgram(sp, key));
}

function generateVirtualizedShield() {
  console.log('🛡️  編譯防護盾 → 自定義字節碼...');
  const compiler = new VMCompiler();
  const program = compiler.compile(SHIELD_SOURCE);
  const key = generateKey(32);
  encryptProgram(program, key);
  const bcLen = program.b.length;
  const strCount = program.s.length;
  const funcCount = program.f.length;
  console.log(`   📊 字節碼: ${bcLen} bytes | 字串表: ${strCount} | 子程式: ${funcCount}`);
  return VM_RUNTIME + '\n_jyVM(' + JSON.stringify(program) + ');\n';
}

// ═══════════════════════════════════════════════
// 混淆設定（最高實用強度）
// ═══════════════════════════════════════════════
const OBF_OPTS = {
  compact: true,
  controlFlowFlattening: true, controlFlowFlatteningThreshold: 0.75,
  deadCodeInjection: true, deadCodeInjectionThreshold: 0.4,
  identifierNamesGenerator: 'hexadecimal',
  numbersToExpressions: true,
  stringArray: true, stringArrayEncoding: ['rc4'], stringArrayThreshold: 0.75,
  rotateStringArray: true, shuffleStringArray: true,
  splitStrings: true, splitStringsChunkLength: 6,
  stringArrayWrappersCount: 3, stringArrayWrappersChainedCalls: true,
  stringArrayWrappersParametersMaxCount: 4, stringArrayWrappersType: 'function',
  stringArrayCallsTransform: true, stringArrayCallsTransformThreshold: 0.75,
  transformObjectKeys: true,
  debugProtection: true, debugProtectionInterval: 2000,
  disableConsoleOutput: false,
  selfDefending: true,
  renameGlobals: false,
  unicodeEscapeSequence: true,
  domainLock: ['jingyue.uk', '.jingyue.uk'],
  domainLockRedirectUrl: 'about:blank',
  target: 'browser', sourceMap: false,
};
const LARGE_OPTS = { controlFlowFlatteningThreshold: 0.4, deadCodeInjectionThreshold: 0.2,
  splitStringsChunkLength: 10, stringArrayWrappersCount: 2,
  debugProtection: false, debugProtectionInterval: 0 };
const SW_OPTS = { selfDefending: false, debugProtection: false, debugProtectionInterval: 0, domainLock: [] };
const ADMIN_OPTS = { domainLock: [], domainLockRedirectUrl: '', debugProtection: false, debugProtectionInterval: 0 };

// ═══════════════════════════════════════════════
// 開始
// ═══════════════════════════════════════════════
console.log('');
console.log('🔒 靜月之光 JS 混淆工具（終極版 + VM 虛擬化）');
console.log('════════════════════════════════════════════════');
console.log('');

let totalOK = 0, totalFail = 0;

// 產生虛擬化後的防護盾
let SHIELD_CODE;
try {
  SHIELD_CODE = generateVirtualizedShield();
  console.log('   ✅ 防護盾已編譯為字節碼（逆向者需理解自定義 VM 指令集）');
} catch (err) {
  console.error('   ❌ 防護盾編譯失敗:', err.message);
  console.log('   ↩️  改用未虛擬化版本');
  SHIELD_CODE = SHIELD_SOURCE + '\n';
}
console.log('');

// ───────────────────────────────────────────────
// Part 1: JS/ 資料夾
// ───────────────────────────────────────────────
console.log('📁 [Part 1] JS/ 資料夾');
console.log('────────────────────────────────');
if (!fs.existsSync(JS_BACKUP_DIR)) fs.mkdirSync(JS_BACKUP_DIR, { recursive: true });

for (const fp of JS_FILES) {
  const full = path.resolve(fp);
  if (!fs.existsSync(full)) { console.log(`⚠️  找不到: ${fp}`); totalFail++; continue; }
  const fn = path.basename(fp);
  fs.copyFileSync(full, path.join(JS_BACKUP_DIR, fn));
  let code = fs.readFileSync(full, 'utf-8');
  if (fp === SHIELD_TARGET) {
    console.log(`🛡️  注入虛擬化防護盾 → ${fp}`);
    code = SHIELD_CODE + code;
  }
  const origKB = (Buffer.byteLength(code) / 1024).toFixed(0);
  console.log(`🔄 ${fp} (${origKB} KB)...`);
  try {
    const t0 = Date.now();
    const opts = fn === 'ai-analysis.js' ? { ...OBF_OPTS, ...LARGE_OPTS } : OBF_OPTS;
    const res = JavaScriptObfuscator.obfuscate(code, opts);
    const out = res.getObfuscatedCode();
    const newKB = (Buffer.byteLength(out) / 1024).toFixed(0);
    fs.writeFileSync(full, out, 'utf-8');
    console.log(`   ✅ ${origKB} → ${newKB} KB (${((Date.now()-t0)/1000).toFixed(1)}s)`);
    totalOK++;
  } catch (err) {
    console.error(`   ❌ ${err.message}`);
    fs.copyFileSync(path.join(JS_BACKUP_DIR, fn), full);
    console.log('   ↩️  已還原'); totalFail++;
  }
}

// ───────────────────────────────────────────────
// Part 2: admin/ 資料夾
// ───────────────────────────────────────────────
console.log('');
console.log('📁 [Part 2] admin/ 資料夾');
console.log('────────────────────────────────');

const AH = 'admin/index.html', AB = 'admin/index.backup.html';
const ASW = 'admin/admin-sw.js', ASWB = 'admin/admin-sw.backup.js';

if (fs.existsSync(AH)) {
  const origHtml = fs.readFileSync(AH, 'utf-8');
  fs.writeFileSync(AB, origHtml, 'utf-8');
  const hKB = (Buffer.byteLength(origHtml) / 1024).toFixed(1);
  console.log(`📋 備份: ${AH} (${hKB} KB)`);
  const re = /(<script>)([\s\S]*?)(<\/script>)/g;
  const matches = []; let m;
  while ((m = re.exec(origHtml)) !== null) matches.push({ full: m[0], open: m[1], code: m[2], close: m[3], idx: m.index });
  let result = origHtml;
  for (let i = matches.length - 1; i >= 0; i--) {
    const bl = matches[i];
    if (bl.code.trim().length < 100) continue;
    const bKB = (Buffer.byteLength(bl.code) / 1024).toFixed(1);
    console.log(`🔄 ${AH} <script#${i + 1}> (${bKB} KB)...`);
    try {
      const t0 = Date.now();
      const r = JavaScriptObfuscator.obfuscate(bl.code, { ...OBF_OPTS, ...ADMIN_OPTS });
      const ob = r.getObfuscatedCode();
      result = result.substring(0, bl.idx) + bl.open + '\n' + ob + '\n' + bl.close + result.substring(bl.idx + bl.full.length);
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
      const r = JavaScriptObfuscator.obfuscate(sw, { ...OBF_OPTS, ...SW_OPTS });
      fs.writeFileSync(ASW, r.getObfuscatedCode(), 'utf-8');
      console.log('   ✅ 完成'); totalOK++;
    } catch (e) { console.log(`   ⚠️  ${e.message}`); totalFail++; }
  }
}

// ═══════════════════════════════════════════════
// 總結
// ═══════════════════════════════════════════════
console.log('');
console.log('════════════════════════════════════════════════');
console.log(`🔒 完成: ${totalOK} 成功, ${totalFail} 失敗`);
console.log('');
console.log('🛡️  防護層級：');
console.log('   L1 — javascript-obfuscator（RC4 + 控制流 + 自我防護）');
console.log('   L2 — 域名鎖定 + 反調試 + 反 iframe + 鍵盤封鎖');
console.log('   L3 — ★ 程式碼虛擬化（自定義字節碼 VM）★');
console.log('');
console.log('   逆向者需要：');
console.log('   1. 解除 RC4 + selfDefending + debugProtection');
console.log('   2. 逆向自定義 VM 的 30+ 指令集');
console.log('   3. 解密字節碼（XOR 加密）');
console.log('   4. 手動追蹤字節碼執行流程');
console.log('');
console.log('備份: JS_backup/ + admin/index.backup.html');
console.log('');
console.log('.gitignore 加入:');
console.log('   JS_backup/');
console.log('   admin/index.backup.html');
console.log('   admin/admin-sw.backup.js');
console.log('');
