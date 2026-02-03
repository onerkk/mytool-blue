/**
 * 集中式捲動鎖定管理（跨裝置 iOS / Samsung / OPPO 通用）
 * - 禁止在各處散落 document.body.style.overflow='hidden'
 * - 僅透過 lockScroll() / unlockScroll() 控制，支援計數器與 iOS 捲動恢復
 */
(function(global) {
  var lockCount = 0;
  var savedScrollY = 0;
  var savedPageScrollTop = 0;
  var savedBodyStyles = { overflow: '', position: '', top: '', width: '' };

  function isMobileScroll() {
    var w = global.innerWidth;
    var ua = global.navigator && global.navigator.userAgent ? global.navigator.userAgent : '';
    return w <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  }

  function lockScroll() {
    lockCount++;
    if (lockCount > 1) return;
    var body = document.body;
    var html = document.documentElement;
    var pageScroll = document.getElementById('page-scroll');
    var usePageScroll = isMobileScroll() && pageScroll;

    if (usePageScroll) {
      savedPageScrollTop = pageScroll.scrollTop;
      html.classList.add('scroll-lock-active');
      body.classList.add('scroll-lock-active');
    } else {
      savedScrollY = window.scrollY || window.pageYOffset;
      savedBodyStyles.overflow = body.style.overflow;
      savedBodyStyles.position = body.style.position;
      savedBodyStyles.top = body.style.top;
      savedBodyStyles.width = body.style.width;
      body.style.overflow = 'hidden';
      body.style.width = '100%';
      if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        body.style.position = 'fixed';
        body.style.top = savedScrollY ? '-' + savedScrollY + 'px' : '0';
      }
      html.classList.add('scroll-lock-active');
      body.classList.add('scroll-lock-active');
    }
    if (typeof global.SCROLL_DEBUG === 'function') {
      global.SCROLL_DEBUG({ reason: 'lockScroll', lockCount: lockCount });
    }
  }

  function unlockScroll() {
    if (lockCount <= 0) return;
    lockCount--;
    if (lockCount > 0) return;
    var body = document.body;
    var html = document.documentElement;
    var pageScroll = document.getElementById('page-scroll');
    var usePageScroll = isMobileScroll() && pageScroll;

    if (usePageScroll) {
      html.classList.remove('scroll-lock-active');
      body.classList.remove('scroll-lock-active');
      if (pageScroll && savedPageScrollTop) pageScroll.scrollTop = savedPageScrollTop;
    } else {
      body.style.removeProperty('overflow');
      body.style.removeProperty('position');
      body.style.removeProperty('top');
      body.style.removeProperty('width');
      html.classList.remove('scroll-lock-active');
      body.classList.remove('scroll-lock-active');
      if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) && savedScrollY) {
        window.scrollTo(0, savedScrollY);
      }
    }
    if (typeof global.SCROLL_DEBUG === 'function') {
      global.SCROLL_DEBUG({ reason: 'unlockScroll', lockCount: lockCount });
    }
  }

  function getState() {
    var body = document.body;
    var html = document.documentElement;
    var bodyStyle = body ? getComputedStyle(body) : null;
    var overlays = [];
    document.querySelectorAll('.global-loading-overlay, .custom-order-modal, .card-interpretation-modal, .modal-overlay, [class*="overlay"]').forEach(function(el) {
      var s = getComputedStyle(el);
      var rect = el.getBoundingClientRect();
      var fixed = s.position === 'fixed';
      var cover = rect.width >= window.innerWidth * 0.9 && rect.height >= window.innerHeight * 0.9;
      var hidden = el.hasAttribute('hidden') || el.getAttribute('aria-hidden') === 'true';
      var visible = s.visibility !== 'hidden' && s.display !== 'none' && s.opacity !== '0';
      overlays.push({ id: el.id || el.className, fixed: fixed, cover: cover, hidden: hidden, visible: visible, pointerEvents: s.pointerEvents });
    });
    var activeModals = document.querySelectorAll('.custom-order-modal.active, .card-interpretation-modal.active').length;
    var mainEl = document.getElementById('page-scroll') || document.querySelector('.main-container') || document.querySelector('main');
    var mainStyle = mainEl ? getComputedStyle(mainEl) : null;
    return {
      lockCount: lockCount,
      htmlOverflow: html && getComputedStyle(html).overflowY,
      bodyOverflow: bodyStyle ? bodyStyle.overflowY : '',
      bodyPosition: bodyStyle ? bodyStyle.position : '',
      bodyTop: body.style.top || '',
      scrollY: window.scrollY,
      innerHeight: window.innerHeight,
      clientHeight: document.documentElement.clientHeight,
      bodyScrollHeight: body ? body.scrollHeight : 0,
      bodyClientHeight: body ? body.clientHeight : 0,
      mainScrollHeight: mainEl ? mainEl.scrollHeight : 0,
      mainClientHeight: mainEl ? mainEl.clientHeight : 0,
      mainOverflowY: mainStyle ? mainStyle.overflowY : '',
      overlays: overlays,
      activeModalCount: activeModals,
      hasScrollLockClass: body && body.classList.contains('scroll-lock-active'),
      customModalOpen: body && body.classList.contains('custom-modal-open')
    };
  }

  function forceUnlock() {
    lockCount = 0;
    unlockScroll();
  }

  global.scrollLockManager = {
    lockScroll: lockScroll,
    unlockScroll: unlockScroll,
    getState: getState,
    forceUnlock: forceUnlock,
    getLockCount: function() { return lockCount; }
  };
})(typeof window !== 'undefined' ? window : this);
