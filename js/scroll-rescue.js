/**
 * Scroll Rescue Mode：?scrollfix=1 或 localStorage.scrollfix=1 時強制頁面可滑
 * - 解除 html/body 鎖滑 style 與 class
 * - 注入強制可捲動 CSS
 * - 攔截 document/window/body 的 touchmove/pointermove，禁止 preventDefault
 * - 掃描全頁 fixed 覆蓋 >80% 的非可見 modal，設 pointer-events:none
 * - 輸出 ROOT_CAUSE_A/B/C 供正式修復
 */
(function(global) {
  var params = typeof location !== 'undefined' && location.search ? new URLSearchParams(location.search) : null;
  var fromStorage = false;
  try { fromStorage = global.localStorage && global.localStorage.getItem('scrollfix') === '1'; } catch (e) {}
  var rescueOn = (params && params.get('scrollfix') === '1') || fromStorage;
  global.SCROLL_RESCUE_MODE = rescueOn;

  var rootCauseA = [];
  var rootCauseB = [];
  var rootCauseC = null;

  function applyUnlockStyles() {
    var doc = document.documentElement;
    var body = document.body;
    if (!body) return;
    doc.style.overflow = 'auto';
    body.style.overflow = 'auto';
    doc.style.position = 'static';
    body.style.position = 'static';
    body.style.top = '0';
    body.style.width = 'auto';
    body.classList.remove('no-scroll', 'scroll-lock', 'lock', 'modal-open', 'prevent-scroll', 'scroll-lock-active', 'custom-modal-open');
    doc.classList.remove('no-scroll', 'scroll-lock', 'lock', 'scroll-lock-active');
  }

  function injectRescueCSS() {
    var id = 'scroll-rescue-style';
    if (document.getElementById(id)) return;
    var style = document.createElement('style');
    style.id = id;
    style.textContent = [
      'html,body{ overflow-y:auto !important; height:auto !important; position:static !important; touch-action:pan-y !important; }',
      '*{ overscroll-behavior:auto !important; }',
      '#app,.app,.main,.page,.content,#page-scroll,.page-scroll,.main-container{ overflow:visible !important; height:auto !important; touch-action:pan-y !important; }'
    ].join('\n');
    (document.head || document.documentElement).appendChild(style);
  }

  function wrapAddEventListener(target, name) {
    if (!target || !target.addEventListener) return;
    var orig = target.addEventListener;
    target.addEventListener = function(type, handler, options) {
      if (global.SCROLL_RESCUE_MODE && (type === 'touchmove' || type === 'pointermove')) {
        rootCauseA.push({ target: name, type: type, stack: (new Error()).stack });
        var wrapped = function(e) {
          var prev = e.preventDefault;
          e.preventDefault = function() { return; };
          try { if (typeof handler === 'function') handler.call(this, e); } catch (err) { }
          e.preventDefault = prev;
        };
        return orig.call(target, type, wrapped, options);
      }
      return orig.call(target, type, handler, options);
    };
  }

  function disarmFixedOverlays() {
    var vw = window.innerWidth;
    var vh = window.innerHeight;
    var threshold = 0.8;
    var minW = vw * threshold;
    var minH = vh * threshold;
    var visibleModalSel = '.custom-order-modal.active, .card-interpretation-modal.active, .modal.active';
    var list = [];
    try {
      document.querySelectorAll('*').forEach(function(el) {
        var s = getComputedStyle(el);
        if (s.position !== 'fixed') return;
        var r = el.getBoundingClientRect();
        if (r.width < minW || r.height < minH) return;
        var isVisibleModal = el.matches && el.matches(visibleModalSel);
        var isScrollDebug = el.id === 'scroll-debug-overlay' || el.id === 'scroll-rescue-panel';
        if (isVisibleModal || isScrollDebug) return;
        el.style.pointerEvents = 'none';
        var sel = el.id ? '#' + el.id : (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/)[0] : el.tagName);
        list.push(sel);
      });
    } catch (e) { }
    rootCauseB = list.slice(0, 10);
  }

  function runRootCauseDiagnostics() {
    var body = document.body;
    var html = document.documentElement;
    if (!body) return;
    var bodyStyle = getComputedStyle(body);
    var htmlStyle = getComputedStyle(html);
    var bodyOverflow = bodyStyle.overflowY || body.style.overflowY;
    var bodyPos = bodyStyle.position || body.style.position;
    if (bodyOverflow === 'hidden' || bodyPos === 'fixed') {
      rootCauseC = {
        where: 'body inline or scrollLockManager',
        bodyOverflow: bodyOverflow,
        bodyPosition: bodyPos,
        file: 'js/scrollLockManager.js',
        fn: 'lockScroll()'
      };
    }
  }

  function createDebugPanel() {
    if (!global.SCROLL_RESCUE_MODE) return;
    var id = 'scroll-rescue-panel';
    if (document.getElementById(id)) return;
    var panel = document.createElement('div');
    panel.id = id;
    panel.setAttribute('aria-hidden', 'true');
    panel.style.cssText = 'position:fixed;top:8px;right:8px;max-width:280px;font-size:11px;font-family:monospace;background:rgba(0,0,0,0.9);color:#0f0;padding:8px;border:1px solid #0f0;z-index:99999;pointer-events:auto;touch-action:pan-y;';
    function update() {
      var body = document.body;
      var html = document.documentElement;
      var bodyStyle = body ? getComputedStyle(body) : {};
      var htmlStyle = html ? getComputedStyle(html) : {};
      var line1 = 'SCROLL_RESCUE: ' + (global.SCROLL_RESCUE_MODE ? 'ON' : 'off');
      var line2 = 'html overflow=' + (htmlStyle.overflowY || '') + ' body overflow=' + (bodyStyle.overflowY || '') + ' position=' + (bodyStyle.position || '');
      var line3 = 'Fixed overlay (first 3): ' + (rootCauseB.length ? rootCauseB.slice(0, 3).join(', ') : 'none');
      var line4 = 'Touchmove on doc/body: ' + (rootCauseA.length ? rootCauseA.length + ' handler(s)' : 'none');
      panel.innerHTML = line1 + '<br/>' + line2 + '<br/>' + line3 + '<br/>' + line4;
    }
    update();
    document.body.appendChild(panel);
    setInterval(update, 1500);
  }

  function logRootCauses() {
    if (rootCauseA.length) {
      console.warn('[ROOT_CAUSE_A] 全域 touchmove/pointermove preventDefault 可能來源（rescue 已攔截）:', rootCauseA);
    } else {
      console.log('[ROOT_CAUSE_A] 未偵測到 document/window/body 上的 touchmove/pointermove 註冊');
    }
    if (rootCauseB.length) {
      console.warn('[ROOT_CAUSE_B] 全頁 fixed 覆蓋層（rescue 已設 pointer-events:none）:', rootCauseB);
    } else {
      console.log('[ROOT_CAUSE_B] 未偵測到 >80% viewport 的 fixed 覆蓋層');
    }
    if (rootCauseC) {
      console.warn('[ROOT_CAUSE_C] html/body overflow 或 position 被鎖定:', rootCauseC);
    } else {
      console.log('[ROOT_CAUSE_C] body 未偵測到 overflow:hidden 或 position:fixed');
    }
  }

  function runRescue() {
    applyUnlockStyles();
    injectRescueCSS();
    disarmFixedOverlays();
    runRootCauseDiagnostics();
    createDebugPanel();
    logRootCauses();
    if (global.scrollLockManager) {
      global.scrollLockManager.lockScroll = function() { };
      global.scrollLockManager.forceUnlock = function() {
        applyUnlockStyles();
      };
      global.scrollLockManager.forceUnlock();
    }
  }

  wrapAddEventListener(document, 'document');
  wrapAddEventListener(global, 'window');
  if (document.body) {
    wrapAddEventListener(document.body, 'body');
  } else {
    document.addEventListener('DOMContentLoaded', function() {
      wrapAddEventListener(document.body, 'body');
    });
  }
  if (rescueOn) {
    if (document.body) runRescue();
    document.addEventListener('DOMContentLoaded', function() {
      runRescue();
    });
    if (typeof global.addEventListener === 'function') {
      global.addEventListener('load', function() { runRescue(); });
    }
  }
})(typeof window !== 'undefined' ? window : this);
