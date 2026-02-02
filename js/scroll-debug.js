/**
 * 捲動診斷（?debug=1 開啟）：找出誰鎖住滑動
 * 使用方式：SCROLL_DEBUG() 或 SCROLL_DEBUG({ customKey: value })
 */
(function(global) {
  function SCROLL_DEBUG(extra) {
    if (!global.scrollLockManager || !global.scrollLockManager.getState) {
      console.log('[SCROLL_DEBUG] scrollLockManager 未載入');
      return;
    }
    var state = global.scrollLockManager.getState();
    var payload = {
      htmlOverflow: state.htmlOverflow,
      bodyOverflow: state.bodyOverflow,
      bodyPosition: state.bodyPosition,
      bodyTop: state.bodyTop,
      scrollY: state.scrollY,
      innerHeight: state.innerHeight,
      clientHeight: state.clientHeight,
      overlays: state.overlays,
      activeModalCount: state.activeModalCount,
      isTouchBlocked: state.lockCount > 0 || state.hasScrollLockClass || (state.overlays && state.overlays.some(function(o) { return o.cover && o.visible && o.pointerEvents !== 'none'; })),
      lockCount: state.lockCount,
      hasScrollLockClass: state.hasScrollLockClass,
      customModalOpen: state.customModalOpen
    };
    if (extra && typeof extra === 'object') {
      for (var k in extra) payload[k] = extra[k];
    }
    console.log('[SCROLL_DEBUG]', payload);
    if (global.__SCROLL_DEBUG_OVERLAY__) {
      global.__SCROLL_DEBUG_OVERLAY__.update(payload);
    }
    return payload;
  }

  function createOverlay() {
    if (global.__SCROLL_DEBUG_OVERLAY__) return global.__SCROLL_DEBUG_OVERLAY__.el;
    var el = document.createElement('div');
    el.id = 'scroll-debug-overlay';
    el.setAttribute('aria-hidden', 'true');
    el.style.cssText = 'position:fixed;bottom:0;left:0;right:0;max-height:180px;overflow:auto;background:rgba(0,0,0,0.9);color:#0f0;font:12px monospace;padding:8px;z-index:99999;pointer-events:auto;touch-action:pan-y;border-top:2px solid #0f0;';
    var pre = document.createElement('pre');
    pre.id = 'scroll-debug-text';
    pre.style.margin = '0';
    el.appendChild(pre);
    var btn = document.createElement('button');
    btn.textContent = 'SCROLL_DEBUG()';
    btn.style.cssText = 'margin-top:6px;padding:4px 8px;cursor:pointer;';
    btn.addEventListener('click', function() { SCROLL_DEBUG(); });
    el.appendChild(btn);
    var unlockBtn = document.createElement('button');
    unlockBtn.textContent = 'forceUnlock';
    unlockBtn.style.cssText = 'margin-left:8px;padding:4px 8px;cursor:pointer;';
    unlockBtn.addEventListener('click', function() {
      if (global.scrollLockManager) global.scrollLockManager.forceUnlock();
      SCROLL_DEBUG({ reason: 'forceUnlock' });
    });
    el.appendChild(unlockBtn);
    var runTestsBtn = document.createElement('button');
    runTestsBtn.textContent = '執行捲動驗收';
    runTestsBtn.style.cssText = 'margin-left:8px;padding:4px 8px;cursor:pointer;';
    runTestsBtn.addEventListener('click', runScrollAcceptanceTests);
    el.appendChild(runTestsBtn);
    document.body.appendChild(el);
    global.__SCROLL_DEBUG_OVERLAY__ = {
      el: el,
      pre: pre,
      update: function(payload) {
        pre.textContent = JSON.stringify(payload, null, 2);
      }
    };
    return el;
  }

  function runScrollAcceptanceTests() {
    var results = { passed: 0, failed: 0, tests: [] };
    function ok(name, cond, msg) {
      if (cond) { results.passed++; results.tests.push({ test: name, ok: true }); console.log('[SCROLL_TEST] ' + name + ': OK'); }
      else { results.failed++; results.tests.push({ test: name, ok: false, msg: msg }); console.warn('[SCROLL_TEST] ' + name + ': FAIL', msg); }
    }
    ok('1. 首頁可捲動（lockCount=0）', !global.scrollLockManager || global.scrollLockManager.getLockCount() === 0, 'lockCount=' + (global.scrollLockManager ? global.scrollLockManager.getLockCount() : 'N/A'));
    var modal = document.getElementById('custom-order-modal');
    if (modal) {
      modal.classList.add('active');
      document.body.classList.add('custom-modal-open');
      if (global.scrollLockManager) global.scrollLockManager.lockScroll();
      ok('2. 開啟 modal 後 lockCount>0 或 body 鎖定', (global.scrollLockManager && global.scrollLockManager.getLockCount() > 0) || (document.body.style.overflow === 'hidden'), 'lockCount=' + (global.scrollLockManager ? global.scrollLockManager.getLockCount() : ''));
      if (global.scrollLockManager) global.scrollLockManager.unlockScroll();
      modal.classList.remove('active');
      document.body.classList.remove('custom-modal-open');
      ok('3. 關閉 modal 後 lockCount=0', !global.scrollLockManager || global.scrollLockManager.getLockCount() === 0, 'lockCount=' + (global.scrollLockManager ? global.scrollLockManager.getLockCount() : ''));
    } else {
      ok('2. 開啟 modal', false, 'custom-order-modal 不存在');
      ok('3. 關閉 modal', true, '略過');
    }
    var lockBefore = global.scrollLockManager ? global.scrollLockManager.getLockCount() : 0;
    for (var i = 0; i < 10; i++) {
      if (global.scrollLockManager) global.scrollLockManager.lockScroll();
      if (global.scrollLockManager) global.scrollLockManager.unlockScroll();
    }
    var lockAfter = global.scrollLockManager ? global.scrollLockManager.getLockCount() : 0;
    ok('4. 快速 lock/unlock 10 次後無殘留', lockAfter === 0, 'lockCount=' + lockAfter);
    ok('5. 實機驗證', true, '請在 Android Chrome / iOS Safari 手動測試滑動');
    console.log('[SCROLL_TEST] 驗收結果', results);
    if (global.__SCROLL_DEBUG_OVERLAY__) global.__SCROLL_DEBUG_OVERLAY__.update({ scrollAcceptance: results });
    global.SCROLL_DEBUG({ scrollAcceptance: results });
  }

  function init() {
    var params = new URLSearchParams(typeof location !== 'undefined' ? location.search : '');
    if (params.get('debug') === '1' || params.get('debug') === 'scroll') {
      global.SCROLL_DEBUG = SCROLL_DEBUG;
      global.runScrollAcceptanceTests = runScrollAcceptanceTests;
      createOverlay();
      SCROLL_DEBUG({ init: true });
      document.addEventListener('visibilitychange', function() {
        if (document.visibilityState === 'visible') SCROLL_DEBUG({ trigger: 'visibilitychange' });
      });
    }
  }

  if (typeof window !== 'undefined') {
    window.SCROLL_DEBUG = SCROLL_DEBUG;
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  }
})(typeof window !== 'undefined' ? window : this);
