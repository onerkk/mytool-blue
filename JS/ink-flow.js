// ═══════════════════════════════════════════════════════════════════
// 靜月之光 墨流 ink-flow v2.4 (2026/9/6)
// v2.4：手機、觸控與 reduced-motion 使用既有靜態背景，不建立 canvas。
// 桌面在選擇器開啟、分頁隱藏或手動 pause 時停止；close 不覆蓋手動 pause。
// 補齊 2D 調色底色 BACK，避免背景掛載拋出 ReferenceError。
// Suminagashi（墨流し）墨暈層——v2.0 渲染核心改寫：WebGL Stable Fluids
//   依設計參考影片（THREE.JS·STABLE FLUIDS 同類效果）根治 v1.x「大光圈散景感」：
//   v1.x 是 2D canvas 徑向漸層墨點＋回饋平流近似，0.5x 解析度，墨無湍流捲鬚；
//   v2.0 實作 Stam Stable Fluids：速度場/染料場半浮點紋理 ping-pong、
//   平流(advect)＋渦度補強(vorticity confinement，墨絲捲鬚來源)＋
//   散度→壓力 Jacobi 迭代→梯度修正；染料場解析度上限 768（約 v1.x 的 2.7 倍細節）。
//   觸控/滑動沿軌跡注墨（画面をなぞって墨を流す）、閒置自動演出。
// 掛載架構沿用 v1.2 並擴充：已知容器 id 輪詢（700ms）＋通用後備；
//   v2.0 補收塔羅主流程 step-tarot/step-2/step-1/step-0（v1.2 漏收＝塔羅頁無墨流根因）；
//   靜態定位的 step 容器掛載時補 isolation:isolate 建立堆疊上下文，z:-1 子層才不會沉到頁面背景之下。
// 後備鏈：桌面啟用 WebGL，不支援時走 2D；行動裝置不啟動動態繪圖。
//   WebGL 初始化失敗時會換一張乾淨 canvas 再進 2D，避免同一 canvas 取過 WebGL context 後無法再取 2D。
//   prefers-reduced-motion→既有 CSS 靜態背景。
// 效能：分頁隱藏即停、幀時 EMA>30ms 自動降檔（染料 768→448、Jacobi 18→11）。
// API：window.JY_INK = { burst(x,y), setPalette(name), pause(), resume() }（不變）
// ═══════════════════════════════════════════════════════════════════
(function () {
  'use strict';
  if (typeof document === 'undefined' || window.JY_INK) return;

  var GOLD = [201, 168, 76], MOON = [233, 226, 207], CRIMSON = [158, 53, 72],
      VIOLET = [126, 95, 174], INDIGO = [74, 93, 168], JADE = [79, 143, 110], BACK = [10, 10, 18];
  var PALETTES = {
    'default': [GOLD, MOON, CRIMSON],
    'bazi':    [GOLD, CRIMSON, MOON],
    'ziwei':   [VIOLET, GOLD, MOON],
    'meihua':  [JADE, GOLD, MOON],
    'lenormand': [INDIGO, MOON, GOLD],
    'oracle':  [MOON, GOLD, CRIMSON],
    'tarot':   [VIOLET, GOLD, MOON],
    'ootk':    [INDIGO, GOLD, MOON]
  };
  var palette = PALETTES['default'], manualPalette = false;

  var reduced = false;
  try { reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  // Form rendering must not compete with a full-viewport canvas. A 2D canvas
  // still repaints every frame, so changing WebGL to 2D was not a mobile fix.
  function prefersStatic() {
    return reduced || (navigator.maxTouchPoints || 0) > 0 ||
      !!(window.matchMedia && window.matchMedia('(max-width: 760px), (any-pointer: coarse)').matches);
  }
  if (prefersStatic()) {
    // Keep the public API for callers; the existing CSS supplies the still backdrop.
    // Return before creating canvases, contexts, input listeners, or timers.
    window.JY_INK = {version:'2.4',mode:'static',burst:function(){},setPalette:function(){},pause:function(){},resume:function(){},setPickerOpen:function(){}};
    return;
  }
  var pausedByUser=false, pickerOpen=false;
  function suspended() { return pausedByUser || pickerOpen || document.hidden || prefersStatic(); }

  function makeCanvas() {
    var el = document.createElement('canvas');
    el.id = 'jy-ink';
    el.setAttribute('aria-hidden', 'true');
    el.setAttribute('data-no-ink', '1');
    el.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;z-index:-1;pointer-events:none;';
    return el;
  }
  var cv = makeCanvas();

  function prefersStable2D() {
    var coarse = false;
    try { coarse = !!(window.matchMedia && window.matchMedia('(pointer: coarse)').matches); } catch (e) {}
    return coarse || ((navigator.maxTouchPoints || 0) > 0);
  }

  function replaceCanvasFor2D() {
    var next = makeCanvas();
    if (cv.parentNode) cv.parentNode.replaceChild(next, cv);
    cv = next;
  }

  var running = false, rafId = 0, t = 0, lastTs = 0, emaDt = 16, degraded = false;
  var lastSpawn = 0, nextAmbient = 900, lastPointer = 0;
  var host = null;
  var MODE = null; // 'gl' | '2d'（首次掛載時定案；canvas 取過一種 context 就不能換）

  // ════════════════════ WebGL Stable Fluids 引擎 ════════════════════
  var GL = (function () {
    var gl = null, isGL2 = false, halfType = 0, supportLinear = false, fmtRGBA = null, fmtRG = null;
    var progs = {}, quadBuf = null;
    var dye, velocity, divergence, pressure, curlTex;
    var simW = 128, simH = 128, dyeW = 512, dyeH = 512;
    var DYE_CAP = 768, SIM_CAP = 144, JACOBI = 18;

    function compile(type, src) {
      var sh = gl.createShader(type);
      gl.shaderSource(sh, src); gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh) || 'shader');
      return sh;
    }
    function program(fsSrc) {
      var p = gl.createProgram();
      gl.attachShader(p, compile(gl.VERTEX_SHADER, VS));
      gl.attachShader(p, compile(gl.FRAGMENT_SHADER, HEAD + fsSrc));
      gl.linkProgram(p);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error('link');
      var u = {}, n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
      for (var i = 0; i < n; i++) { var info = gl.getActiveUniform(p, i); u[info.name] = gl.getUniformLocation(p, info.name); }
      return { p: p, u: u };
    }

    var VS = [
      'precision highp float;',
      'attribute vec2 aP;',
      'varying vec2 vUv; varying vec2 vL; varying vec2 vR; varying vec2 vT; varying vec2 vB;',
      'uniform vec2 texelSize;',
      'void main(){ vUv = aP*0.5+0.5;',
      ' vL = vUv - vec2(texelSize.x,0.0); vR = vUv + vec2(texelSize.x,0.0);',
      ' vT = vUv + vec2(0.0,texelSize.y); vB = vUv - vec2(0.0,texelSize.y);',
      ' gl_Position = vec4(aP,0.0,1.0); }'
    ].join('\n');
    var HEAD = 'precision highp float;precision highp sampler2D;varying vec2 vUv;varying vec2 vL;varying vec2 vR;varying vec2 vT;varying vec2 vB;\n';

    var FS = {
      copy: 'uniform sampler2D uTex;void main(){gl_FragColor=texture2D(uTex,vUv);}',
      clear: 'uniform sampler2D uTex;uniform float value;void main(){gl_FragColor=value*texture2D(uTex,vUv);}',
      splat: ['uniform sampler2D uTarget;uniform float aspect;uniform vec3 color;uniform vec2 point;uniform float radius;',
        'void main(){vec2 p=vUv-point;p.x*=aspect;vec3 splat=exp(-dot(p,p)/radius)*color;',
        'vec3 base=texture2D(uTarget,vUv).xyz;gl_FragColor=vec4(base+splat,1.0);}'].join('\n'),
      advect: ['uniform sampler2D uVelocity;uniform sampler2D uSource;uniform vec2 texelSize;uniform vec2 dyeTexelSize;',
        'uniform float dt;uniform float dissipation;',
        '#ifdef MANUAL_FILTERING',
        'vec4 bilerp(sampler2D sam,vec2 uv,vec2 tsize){vec2 st=uv/tsize-0.5;vec2 iuv=floor(st);vec2 fuv=fract(st);',
        'vec4 a=texture2D(sam,(iuv+vec2(0.5,0.5))*tsize);vec4 b=texture2D(sam,(iuv+vec2(1.5,0.5))*tsize);',
        'vec4 c=texture2D(sam,(iuv+vec2(0.5,1.5))*tsize);vec4 d=texture2D(sam,(iuv+vec2(1.5,1.5))*tsize);',
        'return mix(mix(a,b,fuv.x),mix(c,d,fuv.x),fuv.y);}',
        'void main(){vec2 coord=vUv-dt*bilerp(uVelocity,vUv,texelSize).xy*texelSize;',
        'gl_FragColor=dissipation*bilerp(uSource,coord,dyeTexelSize);gl_FragColor.a=1.0;}',
        '#else',
        'void main(){vec2 coord=vUv-dt*texture2D(uVelocity,vUv).xy*texelSize;',
        'gl_FragColor=dissipation*texture2D(uSource,coord);gl_FragColor.a=1.0;}',
        '#endif'].join('\n'),
      divergence: ['uniform sampler2D uVelocity;',
        'void main(){float L=texture2D(uVelocity,vL).x;float R=texture2D(uVelocity,vR).x;',
        'float T=texture2D(uVelocity,vT).y;float B=texture2D(uVelocity,vB).y;',
        'vec2 C=texture2D(uVelocity,vUv).xy;',
        'if(vL.x<0.0){L=-C.x;} if(vR.x>1.0){R=-C.x;} if(vT.y>1.0){T=-C.y;} if(vB.y<0.0){B=-C.y;}',
        'gl_FragColor=vec4(0.5*(R-L+T-B),0.0,0.0,1.0);}'].join('\n'),
      curl: ['uniform sampler2D uVelocity;',
        'void main(){float L=texture2D(uVelocity,vL).y;float R=texture2D(uVelocity,vR).y;',
        'float T=texture2D(uVelocity,vT).x;float B=texture2D(uVelocity,vB).x;',
        'gl_FragColor=vec4(R-L-T+B,0.0,0.0,1.0);}'].join('\n'),
      vorticity: ['uniform sampler2D uVelocity;uniform sampler2D uCurl;uniform float curl;uniform float dt;',
        'void main(){float L=texture2D(uCurl,vL).x;float R=texture2D(uCurl,vR).x;',
        'float T=texture2D(uCurl,vT).x;float B=texture2D(uCurl,vB).x;float C=texture2D(uCurl,vUv).x;',
        'vec2 force=0.5*vec2(abs(T)-abs(B),abs(R)-abs(L));',
        'force/=length(force)+0.0001;force*=curl*C;force.y*=-1.0;',
        'vec2 vel=texture2D(uVelocity,vUv).xy;vel+=force*dt;vel=min(max(vel,-1000.0),1000.0);',
        'gl_FragColor=vec4(vel,0.0,1.0);}'].join('\n'),
      pressure: ['uniform sampler2D uPressure;uniform sampler2D uDivergence;',
        'void main(){float L=texture2D(uPressure,vL).x;float R=texture2D(uPressure,vR).x;',
        'float T=texture2D(uPressure,vT).x;float B=texture2D(uPressure,vB).x;',
        'float div=texture2D(uDivergence,vUv).x;',
        'gl_FragColor=vec4((L+R+B+T-div)*0.25,0.0,0.0,1.0);}'].join('\n'),
      gradient: ['uniform sampler2D uPressure;uniform sampler2D uVelocity;',
        'void main(){float L=texture2D(uPressure,vL).x;float R=texture2D(uPressure,vR).x;',
        'float T=texture2D(uPressure,vT).x;float B=texture2D(uPressure,vB).x;',
        'vec2 vel=texture2D(uVelocity,vUv).xy;vel-=vec2(R-L,T-B);',
        'gl_FragColor=vec4(vel,0.0,1.0);}'].join('\n'),
      display: ['uniform sampler2D uTex;',
        'void main(){vec3 c=texture2D(uTex,vUv).rgb;',
        'float a=clamp(max(c.r,max(c.g,c.b))*1.25,0.0,0.82);', // 半透明墨層，蓋不死表單
        'gl_FragColor=vec4(min(c*0.9,vec3(a)),a);}'].join('\n')
    };

    function getFormat(internal, format, type) {
      // 檢測該格式是否可作 render target
      var tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, internal, 4, 4, 0, format, type, null);
      var fbo = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
      var ok = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
      gl.deleteFramebuffer(fbo); gl.deleteTexture(tex);
      return ok ? { internal: internal, format: format } : null;
    }

    function createFBO(w, h, internal, format, type, filter) {
      var tex = gl.createTexture();
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, internal, w, h, 0, format, type, null);
      var fbo = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
      gl.viewport(0, 0, w, h);
      gl.clearColor(0, 0, 0, 1); gl.clear(gl.COLOR_BUFFER_BIT);
      return { tex: tex, fbo: fbo, w: w, h: h, texel: [1 / w, 1 / h],
        attach: function (id) { gl.activeTexture(gl.TEXTURE0 + id); gl.bindTexture(gl.TEXTURE_2D, this.tex); return id; } };
    }
    function createDouble(w, h, internal, format, type, filter) {
      var a = createFBO(w, h, internal, format, type, filter), b = createFBO(w, h, internal, format, type, filter);
      return { w: w, h: h, texel: a.texel,
        get read() { return a; }, get write() { return b; },
        swap: function () { var tmp = a; a = b; b = tmp; } };
    }

    function blit(target) {
      gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      if (target == null) { gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight); gl.bindFramebuffer(gl.FRAMEBUFFER, null); }
      else { gl.viewport(0, 0, target.w, target.h); gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo); }
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
    function use(pr, texel) {
      gl.useProgram(pr.p);
      if (pr.u.texelSize && texel) gl.uniform2f(pr.u.texelSize, texel[0], texel[1]);
    }

    function init(canvas) {
      try {
        var attrs = { alpha: true, premultipliedAlpha: true, depth: false, stencil: false, antialias: false, preserveDrawingBuffer: false };
        gl = canvas.getContext('webgl2', attrs);
        isGL2 = !!gl;
        if (!gl) gl = canvas.getContext('webgl', attrs) || canvas.getContext('experimental-webgl', attrs);
        if (!gl) return false;
        if (isGL2) {
          gl.getExtension('EXT_color_buffer_float');
          supportLinear = !!gl.getExtension('OES_texture_float_linear');
          halfType = gl.HALF_FLOAT;
          fmtRGBA = getFormat(gl.RGBA16F, gl.RGBA, halfType);
          fmtRG = getFormat(gl.RG16F, gl.RG, halfType) || fmtRGBA;
        } else {
          var ext = gl.getExtension('OES_texture_half_float');
          if (!ext) return false;
          supportLinear = !!gl.getExtension('OES_texture_half_float_linear');
          halfType = ext.HALF_FLOAT_OES;
          fmtRGBA = getFormat(gl.RGBA, gl.RGBA, halfType);
          fmtRG = fmtRGBA;
        }
        if (!fmtRGBA) return false;
        if (!supportLinear) HEAD = '#define MANUAL_FILTERING 1\n' + HEAD;

        quadBuf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

        progs.copy = program(FS.copy); progs.clear = program(FS.clear); progs.splat = program(FS.splat);
        progs.advect = program(FS.advect); progs.divergence = program(FS.divergence); progs.curl = program(FS.curl);
        progs.vorticity = program(FS.vorticity); progs.pressure = program(FS.pressure);
        progs.gradient = program(FS.gradient); progs.display = program(FS.display);
        return true;
      } catch (e) { gl = null; return false; }
    }

    function resize(cw, ch) {
      var aspect = cw / Math.max(1, ch);
      var dCap = degraded ? 448 : DYE_CAP, sCap = degraded ? 100 : SIM_CAP;
      JACOBI = degraded ? 11 : 18;
      dyeW = Math.round(aspect >= 1 ? dCap : dCap * aspect);
      dyeH = Math.round(aspect >= 1 ? dCap / aspect : dCap);
      simW = Math.round(aspect >= 1 ? sCap : sCap * aspect);
      simH = Math.round(aspect >= 1 ? sCap / aspect : sCap);
      var filter = supportLinear ? gl.LINEAR : gl.NEAREST;
      dye = createDouble(dyeW, dyeH, fmtRGBA.internal, fmtRGBA.format, halfType, filter);
      velocity = createDouble(simW, simH, fmtRG.internal, fmtRG.format, halfType, filter);
      divergence = createFBO(simW, simH, fmtRG.internal, fmtRG.format, halfType, gl.NEAREST);
      curlTex = createFBO(simW, simH, fmtRG.internal, fmtRG.format, halfType, gl.NEAREST);
      pressure = createDouble(simW, simH, fmtRG.internal, fmtRG.format, halfType, gl.NEAREST);
    }

    function splat(x, y, dx, dy, color, radius) {
      // x,y ∈ [0,1]（左下原點）；dx,dy 注入速度；color 0..1
      var aspect = cv.width / Math.max(1, cv.height);
      use(progs.splat, null);
      gl.uniform1i(progs.splat.u.uTarget, velocity.read.attach(0));
      gl.uniform1f(progs.splat.u.aspect, aspect);
      gl.uniform2f(progs.splat.u.point, x, y);
      gl.uniform3f(progs.splat.u.color, dx, dy, 0);
      gl.uniform1f(progs.splat.u.radius, (radius || 0.0028) * (aspect > 1 ? aspect : 1));
      blit(velocity.write); velocity.swap();
      gl.uniform1i(progs.splat.u.uTarget, dye.read.attach(0));
      gl.uniform3f(progs.splat.u.color, color[0], color[1], color[2]);
      blit(dye.write); dye.swap();
    }

    function step(dt) {
      gl.disable(gl.BLEND);
      // curl → vorticity confinement（捲鬚）
      use(progs.curl, velocity.texel);
      gl.uniform1i(progs.curl.u.uVelocity, velocity.read.attach(0));
      blit(curlTex);
      use(progs.vorticity, velocity.texel);
      gl.uniform1i(progs.vorticity.u.uVelocity, velocity.read.attach(0));
      gl.uniform1i(progs.vorticity.u.uCurl, curlTex.attach(1));
      gl.uniform1f(progs.vorticity.u.curl, 26);
      gl.uniform1f(progs.vorticity.u.dt, dt);
      blit(velocity.write); velocity.swap();
      // divergence → pressure → gradient subtract
      use(progs.divergence, velocity.texel);
      gl.uniform1i(progs.divergence.u.uVelocity, velocity.read.attach(0));
      blit(divergence);
      use(progs.clear, null);
      gl.uniform1i(progs.clear.u.uTex, pressure.read.attach(0));
      gl.uniform1f(progs.clear.u.value, 0.8);
      blit(pressure.write); pressure.swap();
      use(progs.pressure, velocity.texel);
      gl.uniform1i(progs.pressure.u.uDivergence, divergence.attach(0));
      for (var i = 0; i < JACOBI; i++) {
        gl.uniform1i(progs.pressure.u.uPressure, pressure.read.attach(1));
        blit(pressure.write); pressure.swap();
      }
      use(progs.gradient, velocity.texel);
      gl.uniform1i(progs.gradient.u.uPressure, pressure.read.attach(0));
      gl.uniform1i(progs.gradient.u.uVelocity, velocity.read.attach(1));
      blit(velocity.write); velocity.swap();
      // advect velocity / dye
      use(progs.advect, velocity.texel);
      if (progs.advect.u.dyeTexelSize) gl.uniform2f(progs.advect.u.dyeTexelSize, velocity.texel[0], velocity.texel[1]);
      gl.uniform1i(progs.advect.u.uVelocity, velocity.read.attach(0));
      gl.uniform1i(progs.advect.u.uSource, velocity.read.attach(0));
      gl.uniform1f(progs.advect.u.dt, dt);
      gl.uniform1f(progs.advect.u.dissipation, 0.995);
      blit(velocity.write); velocity.swap();
      use(progs.advect, velocity.texel);
      if (progs.advect.u.dyeTexelSize) gl.uniform2f(progs.advect.u.dyeTexelSize, dye.texel[0], dye.texel[1]);
      gl.uniform1i(progs.advect.u.uVelocity, velocity.read.attach(0));
      gl.uniform1i(progs.advect.u.uSource, dye.read.attach(1));
      gl.uniform1f(progs.advect.u.dissipation, 0.997); // 墨慢慢溶散（~3s 半衰，貼參考影片的留存感）
      blit(dye.write); dye.swap();
    }

    function render() {
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.clearColor(0, 0, 0, 0);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.clear(gl.COLOR_BUFFER_BIT);
      use(progs.display, null);
      gl.uniform1i(progs.display.u.uTex, dye.read.attach(0));
      blit(null);
    }

    function clearDye() { if (dye) { resize(cv.width, cv.height); } }

    return { init: init, resize: resize, splat: splat, step: step, render: render, clear: clearDye,
      get ok() { return !!gl; } };
  })();

  // ════════════════════ 2D 後備（v1.2 原渲染，WebGL 不可用時） ════════════════════
  var D2 = (function () {
    var ctx = null, buf = null, btx = null, paper = null, ptx = null;
    var W = 0, H = 0, SCALE = 0.72, CAPW = 900;
    var blooms = [], threads = [], BLOOM_CAP = 10, THREAD_CAP = 84;

    function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
    function mix(a, b, t2) { return [a[0] + (b[0] - a[0]) * t2, a[1] + (b[1] - a[1]) * t2, a[2] + (b[2] - a[2]) * t2]; }
    function alpha(c, a) { return 'rgba(' + (c[0] | 0) + ',' + (c[1] | 0) + ',' + (c[2] | 0) + ',' + a.toFixed(3) + ')'; }
    function prng(n) { var x = Math.sin(n * 127.1 + 311.7) * 43758.5453123; return x - Math.floor(x); }
    function easeOut(u) { return 1 - Math.pow(1 - clamp(u, 0, 1), 3); }
    function inkColor() {
      var base = palette[(Math.random() * palette.length) | 0];
      var wash = mix(base, BACK, 0.24 + Math.random() * 0.1);
      var body = mix(base, [18, 14, 24], 0.42 + Math.random() * 0.08);
      var dense = mix(body, [0, 0, 0], 0.1 + Math.random() * 0.06);
      var edge = mix(body, [6, 6, 10], 0.22 + Math.random() * 0.08);
      var glow = mix(base, MOON, 0.68 + Math.random() * 0.12);
      return { wash: wash, base: body, dense: dense, edge: edge, glow: glow };
    }

    function size() {
      var w = Math.min(window.innerWidth, 1400), h = Math.min(window.innerHeight, 1800);
      var s = Math.min(SCALE, CAPW / Math.max(1, w));
      W = Math.max(2, Math.round(w * s)); H = Math.max(2, Math.round(h * s));
      cv.width = W; cv.height = H;
      if (!buf) buf = document.createElement('canvas');
      if (!paper) paper = document.createElement('canvas');
      buf.width = W; buf.height = H; paper.width = W; paper.height = H;
      ctx = cv.getContext('2d'); btx = buf.getContext('2d'); ptx = paper.getContext('2d');
      buildPaper();
    }

    function buildPaper() {
      if (!ptx) return;
      ptx.clearRect(0, 0, W, H);
      var specks = Math.max(140, Math.round(W * H / 1800));
      for (var i = 0; i < specks; i++) {
        var x = Math.random() * W, y = Math.random() * H, r = 0.25 + Math.random() * 0.9;
        var a = 0.012 + Math.random() * 0.024;
        ptx.fillStyle = 'rgba(255,255,255,' + a.toFixed(3) + ')';
        ptx.beginPath(); ptx.arc(x, y, r, 0, 6.2832); ptx.fill();
      }
      for (var j = 0; j < 40; j++) {
        var fx = Math.random() * W, fy = Math.random() * H;
        ptx.strokeStyle = 'rgba(255,255,255,0.008)';
        ptx.lineWidth = 0.45 + Math.random() * 0.6;
        ptx.beginPath();
        ptx.moveTo(fx, fy);
        ptx.bezierCurveTo(fx + (Math.random() - 0.5) * 40, fy + (Math.random() - 0.5) * 24,
                          fx + (Math.random() - 0.5) * 40, fy + (Math.random() - 0.5) * 24,
                          fx + (Math.random() - 0.5) * 70, fy + (Math.random() - 0.5) * 40);
        ptx.stroke();
      }
    }

    function makeThread(px, py, ang, col, baseR) {
      return {
        x: px, y: py, px: px, py: py, ang: ang, born: t + Math.random() * 180,
        life: 2200 + Math.random() * 1800, speed: 0.55 + Math.random() * 0.65,
        curl: (Math.random() - 0.5) * 0.14, noise: Math.random() * 999, width: 0.35 + Math.random() * 0.95,
        alpha: 0.028 + Math.random() * 0.028, color: col, drift: baseR * (0.5 + Math.random() * 0.5),
        trail: []
      };
    }

    function makeBloom(px, py, small, delay) {
      var seed = Math.random() * 99999;
      var color = inkColor();
      var scale = Math.min(W, H) / 720;
      var maxR = (small ? 30 : 64) * scale + Math.random() * (small ? 24 : 82) * scale;
      var b = {
        x: px + (Math.random() - 0.5) * W * 0.014,
        y: py + (Math.random() - 0.5) * H * 0.014,
        born: t + (delay || 0), life: (small ? 3400 : 5600) + Math.random() * (small ? 1200 : 2200),
        maxR: maxR, alpha: small ? 0.095 : 0.13, feather: small ? 0.4 : 0.52,
        seed: seed, color: color, driftX: (Math.random() - 0.5) * 0.08, driftY: (Math.random() - 0.5) * 0.08,
        rot: Math.random() * 6.2832, sx: 1.05 + Math.random() * 0.55, sy: 0.8 + Math.random() * 1.25,
        lobes: [], satellites: [], grain: 10 + (Math.random() * 10 | 0), backruns: []
      };
      for (var i = 0; i < 28; i++) b.lobes.push(0.82 + prng(seed + i * 1.71) * 0.36);
      var satN = small ? 4 + (Math.random() * 2 | 0) : 6 + (Math.random() * 3 | 0);
      for (var s2 = 0; s2 < satN; s2++) {
        b.satellites.push({
          ang: (Math.PI * 2 * s2 / satN) + (Math.random() - 0.5) * 0.9,
          dist: 0.45 + Math.random() * 0.65,
          r: maxR * (0.12 + Math.random() * 0.22),
          born: b.born + 80 + Math.random() * 520,
          life: 2000 + Math.random() * 2600,
          spread: 0.18 + Math.random() * 0.25
        });
      }
      var backN = small ? 5 + (Math.random() * 3 | 0) : 9 + (Math.random() * 4 | 0);
      for (var q = 0; q < backN; q++) {
        b.backruns.push({
          ang: Math.random() * 6.2832,
          dist: 0.72 + Math.random() * 0.34,
          r: maxR * (0.04 + Math.random() * 0.08),
          born: b.born + 220 + Math.random() * 900,
          life: 1800 + Math.random() * 2600
        });
      }
      var tN = small ? 2 + (Math.random() * 2 | 0) : 4 + (Math.random() * 3 | 0);
      for (var k = 0; k < tN && threads.length < THREAD_CAP; k++) {
        threads.push(makeThread(b.x, b.y, Math.random() * 6.2832, color.edge, maxR));
      }
      return b;
    }

    function drawBlob(x, y, r, bloom, alphaMul, phase) {
      var points = 30;
      var rot = (bloom.rot || 0) + bloom.seed * 0.00014 + phase * 0.28;
      var sx = bloom.sx || 1.0, sy = bloom.sy || 1.0;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.scale(sx, sy);
      ctx.beginPath();
      for (var i = 0; i <= points; i++) {
        var p = i % points;
        var ang = (Math.PI * 2 * p / points);
        var n = bloom.lobes[p % bloom.lobes.length];
        var ripple = 1 + Math.sin(ang * 2.2 + phase * 1.6 + bloom.seed * 0.002) * 0.055;
        var rr = r * n * ripple;
        var px = Math.cos(ang) * rr, py = Math.sin(ang) * rr;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.closePath();

      var g = ctx.createRadialGradient(0, 0, r * 0.03, 0, 0, r * 1.02);
      g.addColorStop(0, alpha(bloom.color.base, alphaMul * 0.42));
      g.addColorStop(0.18, alpha(bloom.color.wash, alphaMul * 0.95));
      g.addColorStop(0.52, alpha(bloom.color.wash, alphaMul * 0.55));
      g.addColorStop(0.88, alpha(bloom.color.base, alphaMul * 0.12));
      g.addColorStop(1, alpha(bloom.color.base, 0));
      ctx.fillStyle = g;
      ctx.fill();

      var edge = ctx.createRadialGradient(0, 0, r * 0.72, 0, 0, r * 1.08);
      edge.addColorStop(0, alpha(bloom.color.edge, 0));
      edge.addColorStop(0.82, alpha(bloom.color.edge, alphaMul * 0.045));
      edge.addColorStop(1, alpha(bloom.color.edge, alphaMul * 0.16));
      ctx.fillStyle = edge;
      ctx.fill();

      var core = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 0.46);
      core.addColorStop(0, alpha(bloom.color.dense, alphaMul * 0.12));
      core.addColorStop(1, alpha(bloom.color.dense, 0));
      ctx.fillStyle = core;
      ctx.beginPath(); ctx.arc(0, 0, r * 0.46, 0, 6.2832); ctx.fill();
      ctx.restore();
    }

    function drawSettledStain(x, y, r, seed, color, a) {
      var fake = { seed: seed, lobes: [], color: color, rot: prng(seed) * 6.2832, sx: 1.35, sy: 0.92 };
      for (var i = 0; i < 24; i++) fake.lobes.push(0.82 + prng(seed + i * 2.3) * 0.3);
      drawBlob(x, y, r, fake, a, 0.2);
      ctx.save();
      ctx.globalAlpha = 0.04;
      ctx.drawImage(paper, 0, 0);
      ctx.restore();
    }

    function drawGranules(x, y, r, bloom, u, a2) {
      var dots = bloom.grain;
      for (var i = 0; i < dots; i++) {
        var rn = prng(bloom.seed * 0.19 + i * 7.11 + u * 21.0);
        var ang = rn * 6.2832;
        var dist = r * (0.52 + prng(bloom.seed * 0.31 + i * 3.9) * 0.5);
        var gx = x + Math.cos(ang) * dist;
        var gy = y + Math.sin(ang) * dist;
        var gr = 0.32 + prng(bloom.seed * 0.73 + i * 4.2) * Math.max(0.45, r * 0.012);
        ctx.fillStyle = alpha(bloom.color.edge, a2 * (0.02 + prng(i + bloom.seed) * 0.03));
        ctx.beginPath(); ctx.arc(gx, gy, gr, 0, 6.2832); ctx.fill();
      }
    }

    function drawBloom(bloom) {
      var age = t - bloom.born; if (age < 0) return true;
      var u = age / bloom.life; if (u >= 1) return false;
      var grow = easeOut(u);
      bloom.x += bloom.driftX; bloom.y += bloom.driftY;
      var x = bloom.x + Math.sin((bloom.seed + t) * 0.00045) * 0.18;
      var y = bloom.y + Math.cos((bloom.seed + t) * 0.00038) * 0.18;
      var r = bloom.maxR * (0.16 + 0.84 * grow);
      var a2 = bloom.alpha * Math.pow(1 - u, 0.76);

      drawBlob(x, y, r, bloom, a2, u);
      drawBlob(x, y, r * 0.86, bloom, a2 * 0.55, u + 0.22);
      drawBlob(x, y, r * 0.58, bloom, a2 * 0.28, u + 0.62);

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((bloom.rot || 0) + u * 0.1);
      ctx.scale((bloom.sx || 1), (bloom.sy || 1));
      var halo = ctx.createRadialGradient(0, 0, r * 0.45, 0, 0, r * 1.18);
      halo.addColorStop(0, alpha(bloom.color.glow, 0));
      halo.addColorStop(0.62, alpha(bloom.color.glow, a2 * 0.08));
      halo.addColorStop(1, alpha(bloom.color.glow, a2 * 0.18));
      ctx.fillStyle = halo;
      ctx.beginPath(); ctx.arc(0, 0, r * 1.18, 0, 6.2832); ctx.fill();
      ctx.restore();

      for (var i = 0; i < bloom.satellites.length; i++) {
        var s3 = bloom.satellites[i];
        var sa = t - s3.born; if (sa < 0 || sa > s3.life) continue;
        var su = sa / s3.life;
        var sr = s3.r * (0.4 + 0.85 * easeOut(su));
        var sx = x + Math.cos(s3.ang + bloom.rot * 0.2) * r * s3.dist * (0.52 + 0.48 * easeOut(su));
        var sy = y + Math.sin(s3.ang + bloom.rot * 0.2) * r * s3.dist * (0.52 + 0.48 * easeOut(su));
        drawBlob(sx, sy, sr, { seed: bloom.seed + i * 9.1, lobes: bloom.lobes, color: bloom.color, rot: bloom.rot + i * 0.45, sx: 0.9 + i * 0.02, sy: 0.9 }, a2 * 0.24 * (1 - su), su + i * 0.08);
      }

      for (var j = 0; j < bloom.backruns.length; j++) {
        var br = bloom.backruns[j];
        var ba = t - br.born; if (ba < 0 || ba > br.life) continue;
        var bu = ba / br.life;
        var bx = x + Math.cos(br.ang + (bloom.rot || 0)) * r * br.dist * (1.02 + bu * 0.08);
        var by = y + Math.sin(br.ang + (bloom.rot || 0)) * r * br.dist * (1.02 + bu * 0.08);
        ctx.fillStyle = alpha(bloom.color.edge, a2 * 0.11 * (1 - bu));
        ctx.beginPath(); ctx.arc(bx, by, br.r * (0.65 + 0.6 * bu), 0, 6.2832); ctx.fill();
      }
      drawGranules(x, y, r, bloom, u, a2);
      return true;
    }

    function drawThread(th) {
      var age = t - th.born; if (age < 0) return true;
      var u = age / th.life; if (u >= 1) return false;
      th.px = th.x; th.py = th.y;
      th.ang += Math.sin(t * 0.002 + th.noise) * 0.012 + th.curl;
      var sp = th.speed * (1.1 - u * 0.7);
      th.x += Math.cos(th.ang) * sp;
      th.y += Math.sin(th.ang) * sp;
      th.trail.push([th.x, th.y]); if (th.trail.length > 14) th.trail.shift();
      if (th.trail.length < 2) return true;
      ctx.strokeStyle = alpha(th.color, th.alpha * (1 - u));
      ctx.lineWidth = th.width * (1.2 - u * 0.65);
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(th.trail[0][0], th.trail[0][1]);
      for (var i = 1; i < th.trail.length; i++) ctx.lineTo(th.trail[i][0], th.trail[i][1]);
      ctx.stroke();
      return true;
    }

    function seedBase() {
      if (!ctx) return;
      ctx.save();
      ctx.clearRect(0, 0, W, H);
      ctx.globalAlpha = 0.08;
      ctx.drawImage(paper, 0, 0);
      ctx.globalAlpha = 1;
      var s1 = inkColor(), s2 = inkColor();
      drawSettledStain(W * 0.74, H * 0.79, Math.min(W, H) * 0.16, 101.3, s1, 0.06);
      drawSettledStain(W * 0.21, H * 0.18, Math.min(W, H) * 0.1, 202.7, s2, 0.04);
      ctx.restore();
    }

    function frame() {
      if (!ctx) return;
      btx.globalCompositeOperation = 'copy';
      btx.clearRect(0, 0, W, H);
      btx.drawImage(cv, 0, 0);

      ctx.globalCompositeOperation = 'copy';
      ctx.clearRect(0, 0, W, H);
      ctx.save();
      var cx = W * 0.5, cy = H * 0.5;
      ctx.globalAlpha = 0.992;
      ctx.translate(cx, cy);
      ctx.rotate(0.00035 + Math.sin(t * 0.00005) * 0.00015);
      ctx.scale(1.0016, 1.0016);
      ctx.translate(-cx, -cy);
      ctx.drawImage(buf, 0, 0);
      ctx.restore();

      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0,0,0,0.007)';
      ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 0.045;
      ctx.drawImage(paper, 0, 0);
      ctx.globalAlpha = 1;

      for (var i = threads.length - 1; i >= 0; i--) { if (!drawThread(threads[i])) threads.splice(i, 1); }
      for (var j = blooms.length - 1; j >= 0; j--) { if (!drawBloom(blooms[j])) blooms.splice(j, 1); }
    }

    function spawn(px, py, n, small) {
      var k = Math.max(1, n || 1);
      for (var i = 0; i < k && blooms.length < BLOOM_CAP; i++) {
        blooms.push(makeBloom(px, py, !!small, i * 90));
      }
      if (blooms.length > BLOOM_CAP) blooms = blooms.slice(-BLOOM_CAP);
      if (threads.length > THREAD_CAP) threads = threads.slice(-THREAD_CAP);
    }

    function staticWash() {
      size();
      seedBase();
    }

    return {
      size: size,
      frame: frame,
      spawn: spawn,
      staticWash: staticWash,
      reset: function () { blooms = []; threads = []; if (!ctx) size(); seedBase(); },
      toLocal: function (x, y) { var s = W / Math.max(1, window.innerWidth); return [x * s, y * s]; }
    };
  })();
  // ════════════════════ 共用驅動 ════════════════════
  function sizeUp() {
    if (MODE === 'gl') {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = Math.round(Math.min(window.innerWidth, 1400) * Math.min(dpr, 1.25));
      cv.height = Math.round(Math.min(window.innerHeight, 1800) * Math.min(dpr, 1.25));
      GL.resize(cv.width, cv.height);
    } else D2.size();
  }

  function glAmbientSplat(big) {
    var x = 0.15 + Math.random() * 0.7, y = 0.18 + Math.random() * 0.6;
    var c = palette[(Math.random() * palette.length) | 0];
    var n = big ? 2 + (Math.random() * 2 | 0) : 1;
    for (var i = 0; i < n; i++) {
      var ang = Math.random() * 6.2832, sp = 240 + Math.random() * 420;
      GL.splat(x + (Math.random() - 0.5) * 0.08, y + (Math.random() - 0.5) * 0.08,
        Math.cos(ang) * sp, Math.sin(ang) * sp,
        [c[0] / 255 * 0.42, c[1] / 255 * 0.42, c[2] / 255 * 0.42],
        0.0024 + Math.random() * 0.003);
    }
  }

  function frame(ts) {
    if (!running) return;
    if (suspended()) { stop(); cv.hidden=true; return; }
    rafId = requestAnimationFrame(frame);
    if (!host || !host.isConnected || !cv.isConnected || !isVisible(host)) { unmount(); return; }
    var dt = lastTs ? ts - lastTs : 16; lastTs = ts; t += Math.min(dt, 50);
    emaDt = emaDt * 0.95 + dt * 0.05;
    if (!degraded && emaDt > 30) { degraded = true; sizeUp(); }

    if (MODE === 'gl') {
      GL.step(Math.min(dt, 33) / 1000);
      GL.render();
    } else D2.frame(dt);

    if (MODE === 'gl' && t - lastSpawn > nextAmbient) {
      lastSpawn = t;
      nextAmbient = (degraded ? 9000 : 4800) + Math.random() * 3600;
      glAmbientSplat(true);
    }
  }

  function start() { if (running || suspended()) return; cv.hidden=false; running = true; lastTs = 0; rafId = requestAnimationFrame(frame); }
  function stop() { running = false; if (rafId) cancelAnimationFrame(rafId); rafId=0; }
  function syncActivity() {
    if (suspended()) { stop(); cv.hidden=true; }
    else if (host && isVisible(host)) start();
  }

  function sniffPalette() {
    if (manualPalette || !host) return;
    try {
      var hid = host.id || '';
      var key = hid.indexOf('bzx') === 0 ? 'bazi'
              : hid.indexOf('zw') === 0 ? 'ziwei'
              : hid.indexOf('mhx') === 0 ? 'meihua'
              : hid.indexOf('ln') === 0 ? 'lenormand'
              : hid.indexOf('step') === 0 ? 'tarot' // v2.0：主流程（塔羅/開鑰）紫金
              : host.querySelector('[id^="bzx"]') ? 'bazi'
              : host.querySelector('[id^="zw"]')  ? 'ziwei'
              : host.querySelector('[id^="mhx"], [id^="mh-"]') ? 'meihua'
              : host.querySelector('[id^="ln-"]') ? 'lenormand'
              : 'default';
      palette = PALETTES[key];
    } catch (e) {}
  }

  function mount(panel) {
    if (suspended()) return;
    if (host === panel) return;
    unmount();
    host = panel;
    try {
      // v2.0：靜態定位容器（主流程 .step）補建堆疊上下文，z:-1 子層才會落在
      // 「容器背景之上、內容之下」而不是沉到頁面背景底下消失
      var cs = window.getComputedStyle(panel);
      if (cs.position === 'static') panel.style.isolation = 'isolate';
      panel.insertBefore(cv, panel.firstChild);
    } catch (e) { host = null; return; }
    if (MODE === null) {
      var tryGL = !reduced && !prefersStable2D();
      if (tryGL && GL.init(cv)) MODE = 'gl';
      else {
        // GL.init 可能已在原 canvas 建立過 WebGL context；context 類型不可切換，
        // 因此失敗時必須換新 canvas，2D 後備才是真正可用而不是黑畫面。
        if (tryGL) replaceCanvasFor2D();
        MODE = '2d';
      }
    }
    sizeUp();
    if (MODE === 'gl') GL.clear(); else D2.reset();
    t = 0; lastSpawn = 0; nextAmbient = 700;
    sniffPalette();
    setTimeout(sniffPalette, 400);
    if (reduced) { D2.staticWash(); return; }
    if (MODE === 'gl') { glAmbientSplat(true); glAmbientSplat(); }
    start();
  }
  function unmount() {
    stop();
    if (cv.parentNode) { try { cv.parentNode.removeChild(cv); } catch (e) {} }
    host = null; manualPalette = false; palette = PALETTES['default'];
  }

  // v2.0：補收塔羅主流程（v1.2 漏收＝塔羅頁無墨流根因）。overlay 工具頁在前優先
  var PANEL_IDS = ['bzx-screen', 'mhx-screen', 'ln-screen', 'zw-input', 'zw-result',
                   'step-tarot', 'step-2', 'step-1', 'step-0'];

  function isVisible(el) {
    if (!el || !el.isConnected) return false;
    var cs;
    try { cs = window.getComputedStyle(el); } catch (e) { return false; }
    return cs.display !== 'none' && cs.visibility !== 'hidden';
  }

  function isPanel(el) {
    if (!el || el.nodeType !== 1 || el === cv || (el.getAttribute && el.getAttribute('data-no-ink'))) return false;
    if (el.tagName === 'DIALOG' || (el.closest && el.closest('dialog'))) return false;
    if (!isVisible(el)) return false;
    var cs;
    try { cs = window.getComputedStyle(el); } catch (e) { return false; }
    if (cs.position !== 'fixed') return false;
    var z = parseInt(cs.zIndex, 10);
    if (!(z >= 2900)) return false;
    var r = el.getBoundingClientRect();
    if (r.width < window.innerWidth * 0.85 || r.height < window.innerHeight * 0.7) return false;
    if (/rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*0?\./.test(cs.backgroundColor)) return false;
    return true;
  }

  function findOpenPanel() {
    var best = null, bestZ = -1, i, el, z;
    for (i = 0; i < PANEL_IDS.length; i++) {
      el = document.getElementById(PANEL_IDS[i]);
      if (el && isVisible(el)) {
        z = parseInt((window.getComputedStyle(el) || {}).zIndex, 10) || 0;
        if (z > bestZ) { best = el; bestZ = z; }
      }
    }
    if (best) return best;
    var kids = document.body ? document.body.children : [];
    for (i = 0; i < kids.length; i++) { if (isPanel(kids[i])) return kids[i]; }
    return null;
  }

  function poll() {
    if (suspended()) { syncActivity(); return; }
    if (host) {
      if (!host.isConnected || !isVisible(host)) { unmount(); return; }
      // v2.0：主流程 step 切換時換目標（同為可見時取 z 較高／清單較前者）
      var p = findOpenPanel();
      if (p && p !== host) mount(p);
      else syncActivity();
      return;
    }
    var p2 = findOpenPanel();
    if (p2) mount(p2);
  }

  function boot() {
    if (!document.body) return;
    setInterval(poll, 700);
    poll();

    document.addEventListener('visibilitychange', function () {
      syncActivity();
    });
    var rsT;
    window.addEventListener('resize', function () {
      clearTimeout(rsT);
      syncActivity();
      rsT = setTimeout(function () { if (host && !suspended()) { sizeUp(); } }, 320);
    });
    // 注墨互動：點按＝滴墨；拖曳＝沿軌跡注墨（画面をなぞって墨を流す）
    var lastMv = 0, px = 0, py = 0;
    window.addEventListener('pointerdown', function (ev) {
      if (!host || !running || suspended()) return;
      if (ev.target && ev.target.closest && ev.target.closest('button,input,select,textarea,[role="button"],dialog')) return;
      var now = Date.now();
      px = ev.clientX; py = ev.clientY;
      if (now - lastPointer < 450) return;
      lastPointer = now;
      if (MODE === 'gl') {
        var c = palette[(Math.random() * palette.length) | 0];
        GL.splat(ev.clientX / window.innerWidth, 1 - ev.clientY / window.innerHeight,
          (Math.random() - 0.5) * 300, (Math.random() - 0.5) * 300,
          [c[0] / 255 * 0.5, c[1] / 255 * 0.5, c[2] / 255 * 0.5], 0.0035);
      } else { var L = D2.toLocal(ev.clientX, ev.clientY); D2.spawn(L[0], L[1], 1, false); }
    }, { passive: true });
    window.addEventListener('pointermove', function (ev) {
      if (!host || !running || suspended() || MODE !== 'gl') return;
      if (ev.buttons !== 1 && ev.pointerType !== 'touch') return; // 僅按住拖曳/觸控滑動
      var now = Date.now();
      if (now - lastMv < 33) return;
      lastMv = now;
      var dx = (ev.clientX - px) * 6, dy = -(ev.clientY - py) * 6;
      px = ev.clientX; py = ev.clientY;
      if (Math.abs(dx) + Math.abs(dy) < 3) return;
      var c = palette[(Math.random() * palette.length) | 0];
      GL.splat(ev.clientX / window.innerWidth, 1 - ev.clientY / window.innerHeight,
        dx, dy, [c[0] / 255 * 0.3, c[1] / 255 * 0.3, c[2] / 255 * 0.3], 0.0022);
    }, { passive: true });
  }

  window.JY_INK = {
    version: '2.4',
    burst: function (x, y) {
      if (!host || suspended()) return;
      var bx = (x == null ? window.innerWidth / 2 : x), by = (y == null ? window.innerHeight / 2 : y);
      if (MODE === 'gl') {
        var c = palette[(Math.random() * palette.length) | 0];
        for (var i = 0; i < 3; i++) {
          var ang = Math.random() * 6.2832, sp = 300 + Math.random() * 400;
          GL.splat(bx / window.innerWidth, 1 - by / window.innerHeight,
            Math.cos(ang) * sp, Math.sin(ang) * sp,
            [c[0] / 255 * 0.45, c[1] / 255 * 0.45, c[2] / 255 * 0.45], 0.003);
        }
      } else { var L = D2.toLocal(bx, by); D2.spawn(L[0], L[1], 4); }
    },
    setPalette: function (name) { manualPalette = true; palette = PALETTES[name] || PALETTES['default']; },
    pause: function () { pausedByUser=true; syncActivity(); },
    resume: function () { pausedByUser=false; syncActivity(); },
    setPickerOpen: function (open) { pickerOpen=!!open; syncActivity(); }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
