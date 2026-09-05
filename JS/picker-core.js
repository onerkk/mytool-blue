/*! Shared picker lifecycle: viewport, modal layer and Gregorian boundaries. v1.0.0 */
(function (root) {
  'use strict';
  var active = null;
  function dimensions(viewport, fallback) {
    var v = viewport || {}, f = fallback || {};
    return {
      height: Math.max(1, Number(v.height) || Number(f.height) || 640),
      width: Math.max(1, Number(v.width) || Number(f.width) || 360),
      top: Math.max(0, Number(v.offsetTop) || 0),
      left: Math.max(0, Number(v.offsetLeft) || 0)
    };
  }
  function daysInMonth(y, m) { return new Date(y, m, 0).getDate(); }
  function validDate(y, m, d, maxYear) {
    return Number.isInteger(y) && y >= 1900 && y <= (maxYear || 2100) &&
      Number.isInteger(m) && m >= 1 && m <= 12 &&
      Number.isInteger(d) && d >= 1 && d <= daysInMonth(y, m);
  }
  function shiftMonth(y, m, d, delta, maxYear) {
    var n = Math.max(1900 * 12, Math.min((maxYear || 2100) * 12 + 11, y * 12 + m - 1 + delta));
    var year = Math.floor(n / 12), month = n % 12 + 1;
    return { year: year, month: month, day: Math.min(d, daysInMonth(year, month)) };
  }
  function installStyle() {
    var doc = root.document;
    if (doc.getElementById('jy-picker-style')) return;
    var style = doc.createElement('style'); style.id = 'jy-picker-style';
    style.textContent = [
      'dialog.jy-picker-dialog{position:fixed;inset:auto;top:var(--jy-picker-top,0px);left:var(--jy-picker-left,0px);width:var(--jy-picker-width,100vw);height:var(--jy-picker-vh,100dvh);max-width:none;max-height:none;min-height:0;margin:0;border:0;padding:env(safe-area-inset-top,0px) 0 0;box-sizing:border-box;display:flex;align-items:flex-end;justify-content:center;overflow:hidden;background:rgba(0,0,0,.62);color:#eee7d7;z-index:2147483647;isolation:isolate;transform:none;opacity:1}',
      'dialog.jy-picker-dialog:not([open]){display:none}',
      'dialog.jy-picker-dialog::backdrop{background:transparent}',
      'dialog.jy-picker-dialog>*{box-sizing:border-box}',
      'dialog.jy-picker-dialog>.jy-picker-panel{position:relative;display:flex;flex-direction:column;flex:0 1 480px;width:100%;height:auto;min-height:0;max-height:100%;margin:0;overflow:hidden;transform:none;contain:none;content-visibility:visible;box-sizing:border-box;padding-bottom:max(12px,env(safe-area-inset-bottom,0px))}',
      'dialog.jy-picker-dialog>.jy-picker-panel>div{flex-shrink:0}',
      'dialog.jy-picker-dialog>.jy-picker-panel>.jy-picker-body{flex:0 1 auto;min-height:0;max-height:none;overflow-x:hidden;overflow-y:auto;overscroll-behavior:contain;touch-action:pan-y;-webkit-overflow-scrolling:touch;scrollbar-gutter:stable}',
      'dialog.jy-picker-dialog #zwx-sbody,dialog.jy-picker-dialog #bzx-sheet-body,dialog.jy-picker-dialog #bzs-picker-body{display:block;flex:0 1 auto;min-height:0;max-height:none;overflow-x:hidden;overflow-y:auto;overscroll-behavior:contain;touch-action:pan-y}',
      'dialog.jy-picker-dialog .jy-picker-calendar{height:auto;min-height:0;display:block;contain:none;content-visibility:visible}',
      'dialog.jy-picker-dialog .jy-picker-week{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));grid-template-rows:44px;height:44px;min-height:44px;max-height:44px;align-content:start;contain:none;content-visibility:visible}',
      'dialog.jy-picker-dialog .jy-picker-week>*{height:42px;min-height:0;max-height:42px;min-width:0;align-self:center;opacity:1;visibility:visible}',
      'dialog.jy-picker-dialog button:focus-visible,dialog.jy-picker-dialog [role=button]:focus-visible{outline:2px solid #e8d28a;outline-offset:-2px}',
      'dialog.jy-picker-dialog .jy-picker-panel .jy-picker-title-button{width:auto;height:auto;min-height:42px;flex:1;font-size:.96rem}',
      'dialog.jy-picker-dialog .jy-picker-body [aria-disabled=true]{opacity:.3;pointer-events:none}',
      '@media(max-height:620px){dialog.jy-picker-dialog .jy-picker-week{height:36px;min-height:36px;max-height:36px;grid-template-rows:36px}dialog.jy-picker-dialog .jy-picker-week>*{height:34px;max-height:34px}}'
    ].join('\n');
    doc.head.appendChild(style);
  }
  function refresh(bd) {
    if (!bd) return;
    var cal = bd.querySelector('[role=grid]');
    if (cal) {
      cal.classList.add('jy-picker-calendar');
      Array.prototype.forEach.call(cal.querySelectorAll('[role=row]'), function (row) {
        if (!row.querySelector('[role=columnheader]')) row.classList.add('jy-picker-week');
      });
    }
  }
  function mount(bd, bodySelector, onCancel) {
    if (active) active.cancel();
    installStyle();
    var doc = root.document, previousFocus = doc.activeElement, overflow = doc.body.style.overflow;
    var panel = bd.firstElementChild, body = bd.querySelector(bodySelector);
    bd.classList.add('jy-picker-dialog'); bd.removeAttribute('role');
    bd.setAttribute('aria-label', panel.getAttribute('aria-label') || '選擇資料');
    panel.removeAttribute('role'); panel.removeAttribute('aria-modal');
    panel.classList.add('jy-picker-panel'); panel.tabIndex = -1;
    if (body) body.classList.add('jy-picker-body');
    function sync() {
      if (!bd.isConnected) return;
      var size = dimensions(root.visualViewport, { width: root.innerWidth, height: root.innerHeight });
      bd.style.setProperty('--jy-picker-vh', size.height + 'px');
      bd.style.setProperty('--jy-picker-width', size.width + 'px');
      bd.style.setProperty('--jy-picker-top', size.top + 'px');
      bd.style.setProperty('--jy-picker-left', size.left + 'px');
    }
    function cancel(e) { if (e) e.preventDefault(); onCancel(); }
    function keydown(e) {
      if (e.key === 'Escape') { e.stopPropagation(); cancel(e); return; }
      if (e.key !== 'Tab') return;
      var nodes = Array.prototype.filter.call(bd.querySelectorAll('button,input,select,textarea,[tabindex="0"]'), function (n) {
        return !n.disabled && n.getAttribute('aria-disabled') !== 'true' && n.getClientRects().length;
      });
      var first = nodes[0], last = nodes[nodes.length - 1];
      if (!first) { e.preventDefault(); panel.focus(); return; }
      if (e.shiftKey && (doc.activeElement === first || doc.activeElement === panel)) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && (doc.activeElement === last || doc.activeElement === panel)) { e.preventDefault(); first.focus(); }
    }
    doc.body.appendChild(bd); doc.body.style.overflow = 'hidden'; sync(); refresh(bd);
    bd.addEventListener('cancel', cancel); bd.addEventListener('keydown', keydown);
    root.addEventListener('resize', sync); root.addEventListener('orientationchange', sync);
    var vv = root.visualViewport;
    if (vv) { vv.addEventListener('resize', sync); vv.addEventListener('scroll', sync); }
    var hidden = [];
    if (typeof bd.showModal === 'function') bd.showModal();
    else {
      bd.setAttribute('open', ''); bd.setAttribute('role', 'dialog'); bd.setAttribute('aria-modal', 'true');
      Array.prototype.forEach.call(doc.body.children, function (node) {
        if (node !== bd) { hidden.push([node, node.inert]); node.inert = true; }
      });
    }
    panel.focus({ preventScroll: true });
    var entry = { cancel: cancel }; active = entry;
    var closed = false;
    return function () {
      if (closed) return; closed = true;
      bd.removeEventListener('cancel', cancel); bd.removeEventListener('keydown', keydown);
      root.removeEventListener('resize', sync); root.removeEventListener('orientationchange', sync);
      if (vv) { vv.removeEventListener('resize', sync); vv.removeEventListener('scroll', sync); }
      if (typeof bd.close === 'function' && bd.open) bd.close();
      bd.remove(); hidden.forEach(function (x) { x[0].inert = x[1]; });
      doc.body.style.overflow = overflow;
      if (active === entry) active = null;
      if (previousFocus && previousFocus.isConnected && previousFocus.focus) previousFocus.focus({ preventScroll: true });
    };
  }
  root.JY_PICKER = Object.freeze({ version: '1.0.0', mount: mount, refresh: refresh, dimensions: dimensions, validDate: validDate, daysInMonth: daysInMonth, shiftMonth: shiftMonth });
})(typeof window !== 'undefined' ? window : globalThis);
