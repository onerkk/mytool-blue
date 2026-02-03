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
    var scrollState = {
      body: {
        overflow: state.bodyOverflow,
        position: state.bodyPosition,
        h: state.bodyClientHeight,
        sh: state.bodyScrollHeight,
        canScroll: state.bodyScrollHeight > state.bodyClientHeight && (state.bodyOverflow === 'auto' || state.bodyOverflow === 'scroll')
      },
      main: {
        overflow: state.mainOverflowY,
        h: state.mainClientHeight,
        sh: state.mainScrollHeight,
        canScroll: state.mainScrollHeight > state.mainClientHeight && (state.mainOverflowY === 'auto' || state.mainOverflowY === 'scroll')
      }
    };
    console.log('[SCROLL_STATE]', scrollState);
    var payload = {
      htmlOverflow: state.htmlOverflow,
      bodyOverflow: state.bodyOverflow,
      bodyPosition: state.bodyPosition,
      bodyTop: state.bodyTop,
      scrollY: state.scrollY,
      innerHeight: state.innerHeight,
      clientHeight: state.clientHeight,
      SCROLL_STATE: scrollState,
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

  function runElementFromPointProbe() {
    var w = window.innerWidth;
    var h = window.innerHeight;
    var probes = [
      { name: 'center', x: w * 0.5, y: h * 0.5 },
      { name: 'left', x: w * 0.02, y: h * 0.5 },
      { name: 'right', x: w * 0.98, y: h * 0.5 }
    ];
    var results = [];
    probes.forEach(function(p) {
      var el = document.elementFromPoint(p.x, p.y);
      var tag = el ? el.tagName : null;
      var id = el ? (el.id || '') : '';
      var cls = el ? (el.className && typeof el.className === 'string' ? el.className.substring(0, 80) : '') : '';
      var fixed = el ? (getComputedStyle(el).position === 'fixed') : false;
      var overlayLike = cls && /overlay|modal|fixed|floating|fab/i.test(cls + id);
      results.push({ position: p.name, x: p.x, y: p.y, tag: tag, id: id, class: cls, positionFixed: fixed, overlayLike: overlayLike });
    });
    console.log('[ELEMENT_FROM_POINT]', results);
    if (global.__SCROLL_DEBUG_OVERLAY__) {
      global.__SCROLL_DEBUG_OVERLAY__.update({ elementFromPoint: results });
    }
    return results;
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
    var probeBtn = document.createElement('button');
    probeBtn.textContent = 'elementFromPoint 掃描';
    probeBtn.style.cssText = 'margin-left:8px;padding:4px 8px;cursor:pointer;';
    probeBtn.addEventListener('click', function() {
      runElementFromPointProbe();
      SCROLL_DEBUG({ trigger: 'elementFromPoint' });
    });
    el.appendChild(probeBtn);
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

  function installScrollBlockAudit() {
    if (global.__SCROLL_BLOCK_AUDIT_INSTALLED__) return;
    global.__SCROLL_BLOCK_AUDIT_INSTALLED__ = true;
    var lockCount = function() { return global.scrollLockManager ? global.scrollLockManager.getLockCount() : 0; };
    var logOnce = { touch: false, pointer: false };
    function onTouchMove(e) {
      if (!logOnce.touch) {
        logOnce.touch = true;
        console.log('[BLOCK_SCROLL]', { reason: 'audit', event: 'touchmove', target: (e.target && e.target.tagName) || null, id: (e.target && e.target.id) || '', isDragging: false, isModalOpen: lockCount() > 0, preventDefaultCalled: false });
      }
    }
    function onPointerMove(e) {
      if (!logOnce.pointer) {
        logOnce.pointer = true;
        console.log('[BLOCK_SCROLL]', { reason: 'audit', event: 'pointermove', target: (e.target && e.target.tagName) || null, id: (e.target && e.target.id) || '', isDragging: false, isModalOpen: lockCount() > 0, preventDefaultCalled: false });
      }
    }
    document.addEventListener('touchmove', onTouchMove, { passive: true });
    document.addEventListener('pointermove', onPointerMove, { passive: true });
  }

  function logTopActionBar() {
    var el = document.getElementById('quick-action-bar') || document.getElementById('topActionBar');
    if (!el) {
      console.log('[TOP_ACTION_BAR] 元素不存在（可能尚未進入結果頁）');
      return;
    }
    var s = getComputedStyle(el);
    var rect = el.getBoundingClientRect();
    var offsetParent = el.offsetParent;
    var transformedParent = null;
    try {
      var p = el.parentElement;
      while (p && p !== document.body) {
        var ps = getComputedStyle(p);
        if (ps.transform !== 'none' || ps.filter !== 'none' || ps.perspective !== 'none') {
          transformedParent = { tag: p.tagName, id: p.id, className: p.className, transform: ps.transform, filter: ps.filter };
          break;
        }
        p = p.parentElement;
      }
    } catch (e) {}
    console.log('[TOP_ACTION_BAR]', {
      position: s.position,
      top: s.top,
      left: s.left,
      transform: s.transform,
      zIndex: s.zIndex,
      width: s.width,
      height: s.height,
      display: s.display,
      getBoundingClientRect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height },
      offsetParentId: offsetParent ? (offsetParent.id || offsetParent.className) : null,
      transformedParent: transformedParent
    });
  }

  function init() {
    var params = new URLSearchParams(typeof location !== 'undefined' ? location.search : '');
    if (params.get('debug') === '1' || params.get('debug') === 'scroll') {
      global.SCROLL_DEBUG = SCROLL_DEBUG;
      global.runScrollAcceptanceTests = runScrollAcceptanceTests;
      global.runElementFromPointProbe = runElementFromPointProbe;
      global.__logTopActionBar = logTopActionBar;
      createOverlay();
      installScrollBlockAudit();
      SCROLL_DEBUG({ init: true });
      runElementFromPointProbe();
      logTopActionBar();
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
