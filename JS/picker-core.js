/*! Shared picker lifecycle and stable time fields. v1.2.0 */
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
      'dialog.jy-picker-dialog{position:fixed;inset:auto;top:var(--jy-picker-top,0px);left:var(--jy-picker-left,0px);width:var(--jy-picker-width,100vw);height:var(--jy-picker-vh,100dvh);max-width:none;max-height:none;min-height:0;margin:0;border:0;padding:env(safe-area-inset-top,0px) 0 0;box-sizing:border-box;display:flex;align-items:flex-end;justify-content:center;overflow:hidden;background:transparent;color:#eee7d7;z-index:2147483647;transform:none;opacity:1}',
      'dialog.jy-picker-dialog:not([open]){display:none}',
      'dialog.jy-picker-dialog::backdrop{background:rgba(0,0,0,.62);backdrop-filter:none;-webkit-backdrop-filter:none}',
      'dialog.jy-picker-dialog>*{box-sizing:border-box}',
      'dialog.jy-picker-dialog>.jy-picker-panel{position:relative;display:flex;flex-direction:column;flex:0 1 480px;width:100%;height:auto;min-height:0;max-height:100%;margin:0;overflow:hidden;background:#100d0a;transform:none;contain:none;content-visibility:visible;box-sizing:border-box;padding-top:52px;padding-bottom:max(12px,env(safe-area-inset-bottom,0px));backdrop-filter:none;-webkit-backdrop-filter:none;scrollbar-gutter:auto;-webkit-overflow-scrolling:auto}',
      'dialog.jy-picker-dialog>.jy-picker-panel>*{flex-shrink:0}',
      'dialog.jy-picker-dialog>.jy-picker-panel>.jy-picker-body{flex:0 1 auto;min-height:0;max-height:none;overflow-x:hidden;overflow-y:auto;overscroll-behavior:contain;touch-action:pan-y;-webkit-overflow-scrolling:auto;scrollbar-gutter:auto}',
      'dialog.jy-picker-dialog #zwx-sbody,dialog.jy-picker-dialog #bzx-sheet-body,dialog.jy-picker-dialog #bzs-picker-body{display:block;flex:0 1 auto;min-height:0;max-height:none;overflow-x:hidden;overflow-y:auto;overscroll-behavior:contain;touch-action:pan-y}',
      'dialog.jy-picker-dialog .jy-picker-calendar{height:auto;min-height:0;display:block;contain:none;content-visibility:visible}',
      'dialog.jy-picker-dialog .jy-picker-week{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));grid-template-rows:44px;height:44px;min-height:44px;max-height:44px;align-content:start;contain:none;content-visibility:visible}',
      'dialog.jy-picker-dialog .jy-picker-week>*{height:42px;min-height:0;max-height:42px;min-width:0;align-self:center;opacity:1;visibility:visible}',
      'dialog.jy-picker-dialog button:focus-visible,dialog.jy-picker-dialog [role=button]:focus-visible{outline:2px solid #e8d28a;outline-offset:-2px}',
      'dialog.jy-picker-dialog .jy-picker-panel .jy-picker-title-button{width:auto;height:auto;min-height:42px;flex:1;font-size:.96rem}',
      'dialog.jy-picker-dialog .jy-picker-body [aria-disabled=true]{opacity:.3;pointer-events:none}',
      'dialog.jy-picker-dialog .jy-picker-panel,dialog.jy-picker-dialog button,dialog.jy-picker-dialog input,dialog.jy-picker-dialog select{font-family:system-ui,-apple-system,"PingFang TC","Microsoft JhengHei",sans-serif}',
      'dialog.jy-picker-dialog .jy-picker-body{animation:none;transition:none;opacity:1;visibility:visible}',
      'dialog.jy-picker-dialog,dialog.jy-picker-dialog *{backdrop-filter:none!important;-webkit-backdrop-filter:none!important;animation:none!important;transition:none!important;will-change:auto!important}',
      'dialog.jy-picker-dialog .jy-picker-close{position:absolute;top:4px;right:8px;min-width:44px;min-height:44px;padding:8px;border:0;border-radius:8px;background:#211b12;color:#f5e7b8;font:600 14px system-ui;cursor:pointer;z-index:1}',
      'dialog.jy-picker-dialog .bzx-loc-chip,dialog.jy-picker-dialog .bzs-loc-chip{min-height:44px;font-size:14px;line-height:1.4}',
      'dialog.jy-picker-dialog .bzx-sheet-sub,dialog.jy-picker-dialog .zwx-ssub,dialog.jy-picker-dialog .bzs-picker-sub,dialog.jy-picker-dialog .bzx-loc-gt,dialog.jy-picker-dialog .bzs-loc-title{color:#c2b69f}',
      'body.jy-picker-open>:not(.jy-picker-dialog),body.jy-picker-open>:not(.jy-picker-dialog) *{animation-play-state:paused!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important}',
      '@media(max-width:760px),(any-pointer:coarse){dialog.jy-picker-dialog{background:#100d0a}dialog.jy-picker-dialog>.jy-picker-panel{flex:1 1 auto;max-width:none;height:100%;border:0;border-radius:0;box-shadow:none}dialog.jy-picker-dialog>.jy-picker-panel>.jy-picker-body{flex:1 1 auto}dialog.jy-picker-dialog #zwx-sbody,dialog.jy-picker-dialog #bzx-sheet-body,dialog.jy-picker-dialog #bzs-picker-body{flex:1 1 auto}dialog.jy-picker-dialog .bzx-sheet-grip,dialog.jy-picker-dialog .zwx-grip,dialog.jy-picker-dialog .bzs-picker-grip{display:none}}',
      '.jy-time-fields{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:16px 0}.jy-time-fields label{display:grid;gap:8px;color:#e8d28a;font-size:14px}.jy-time-fields select{display:block;width:100%;min-width:0;height:52px;padding:8px 12px;border:1px solid #78663e;border-radius:10px;background:#19171e;color:#fff3d5;font-size:20px;font-variant-numeric:tabular-nums}.jy-time-fields select:disabled{opacity:.4}.jy-time-preview{display:block;text-align:center;min-height:36px;font-size:24px;color:#fff3d5;font-variant-numeric:tabular-nums}.jy-time-unknown{display:flex;align-items:center;gap:10px;min-height:48px;font-size:14px}.jy-time-unknown input{width:20px;height:20px;accent-color:#c9a84c}.jy-time-help{font-size:13px;line-height:1.7;color:#c3bba8;margin:8px 0}',
      '@media(max-height:620px){dialog.jy-picker-dialog .jy-picker-week{height:36px;min-height:36px;max-height:36px;grid-template-rows:36px}dialog.jy-picker-dialog .jy-picker-week>*{height:34px;max-height:34px}}',
      '@media(max-height:420px){dialog.jy-picker-dialog>.jy-picker-panel{display:block;height:100%;overflow-x:hidden;overflow-y:auto}dialog.jy-picker-dialog .jy-picker-body,dialog.jy-picker-dialog #zwx-sbody,dialog.jy-picker-dialog #bzx-sheet-body,dialog.jy-picker-dialog #bzs-picker-body{overflow:visible}dialog.jy-picker-dialog footer,dialog.jy-picker-dialog .bzx-sheet-foot,dialog.jy-picker-dialog .zwx-sfoot,dialog.jy-picker-dialog .bzs-picker-foot{position:sticky;bottom:0;background:#100d0a}}'
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
  // Render once. Changing time updates values only, preserving focus and scroll.
  function renderTime(container, options) {
    var state = { hour: Number(options.hour) || 0, minute: Number(options.minute) || 0, unknown: options.allowUnknown !== false && !!options.unknown };
    function pad(n) { return String(n).padStart(2, '0'); }
    function choices(n) { var h = ''; for (var i=0; i<n; i++) h += '<option value="'+i+'">'+pad(i)+'</option>'; return h; }
    container.innerHTML = '<output class="jy-time-preview" aria-live="polite"></output><div class="jy-time-fields"><label>小時（24 小時制）<select data-jy-hour aria-label="小時">'+choices(24)+'</select></label><label>分鐘<select data-jy-minute aria-label="分鐘">'+choices(60)+'</select></label></div>' +
      (options.allowUnknown !== false ? '<label class="jy-time-unknown"><input type="checkbox" data-jy-unknown>出生時辰不確定</label>' : '') + '<p class="jy-time-help">請填出生紀錄上的當地時間；按「確定」才會套用。</p>';
    var hour=container.querySelector('[data-jy-hour]'), minute=container.querySelector('[data-jy-minute]'), unknown=container.querySelector('[data-jy-unknown]'), preview=container.querySelector('output');
    function sync() {
      hour.value=String(state.hour); minute.value=String(state.minute);
      hour.disabled=minute.disabled=state.unknown;
      if (unknown) unknown.checked=state.unknown;
      preview.textContent=state.unknown ? '時辰未知，僅分析可確定資料' : pad(state.hour)+'：'+pad(state.minute);
    }
    container.addEventListener('change', function(e) {
      if(e.target!==hour && e.target!==minute && e.target!==unknown) return;
      state.hour=Number(hour.value); state.minute=Number(minute.value); state.unknown=!!(unknown&&unknown.checked);
      sync(); if(options.onChange) options.onChange({hour:state.hour,minute:state.minute,unknown:state.unknown});
    });
    sync(); return state;
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
    var closeButton=doc.createElement('button');
    closeButton.type='button'; closeButton.className='jy-picker-close';
    closeButton.textContent='關閉'; closeButton.setAttribute('aria-label','關閉選擇視窗');
    // Append, so callers that bind their first existing button keep the same target.
    panel.appendChild(closeButton);
    var lastSize='';
    function sync() {
      if (!bd.isConnected) return;
      var size = dimensions(root.visualViewport, { width: root.innerWidth, height: root.innerHeight });
      var key=[size.width,size.height,size.top,size.left].join('|');
      if(key===lastSize) return;
      lastSize=key;
      bd.style.setProperty('--jy-picker-vh', size.height + 'px');
      bd.style.setProperty('--jy-picker-width', size.width + 'px');
      bd.style.setProperty('--jy-picker-top', size.top + 'px');
      bd.style.setProperty('--jy-picker-left', size.left + 'px');
    }
    function cancel(e) {
      if (e) e.preventDefault();
      try { if(onCancel) onCancel(); } finally { dispose(); }
    }
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
    var entry = { cancel: cancel }, closed = false, hidden = [], vv = root.visualViewport;
    function ink(open) {
      if(root.JY_INK && typeof root.JY_INK.setPickerOpen==='function') root.JY_INK.setPickerOpen(open);
    }
    function dispose() {
      if (closed) return; closed = true;
      bd.removeEventListener('cancel', cancel); bd.removeEventListener('keydown', keydown);
      bd.removeEventListener('close', dispose);
      root.removeEventListener('resize', sync); root.removeEventListener('orientationchange', sync);
      if (vv) { vv.removeEventListener('resize', sync); vv.removeEventListener('scroll', sync); }
      if (typeof bd.close === 'function' && bd.open) bd.close();
      bd.remove(); hidden.forEach(function (x) { x[0].inert = x[1]; });
      if (active === entry) {
        active = null; doc.body.style.overflow = overflow;
        doc.body.classList.remove('jy-picker-open'); ink(false);
        if (previousFocus && previousFocus.isConnected && previousFocus.focus) previousFocus.focus({ preventScroll: true });
      }
    }
    active = entry;
    closeButton.addEventListener('click',cancel);
    doc.body.classList.add('jy-picker-open'); ink(true);
    doc.body.appendChild(bd); doc.body.style.overflow = 'hidden'; sync(); refresh(bd);
    bd.addEventListener('cancel', cancel); bd.addEventListener('keydown', keydown); bd.addEventListener('close',dispose);
    root.addEventListener('resize', sync); root.addEventListener('orientationchange', sync);
    if (vv) { vv.addEventListener('resize', sync); vv.addEventListener('scroll', sync); }
    try {
      if (typeof bd.showModal === 'function') bd.showModal();
      else {
        bd.setAttribute('open', ''); bd.setAttribute('role', 'dialog'); bd.setAttribute('aria-modal', 'true');
        // Older browsers have no ::backdrop/top layer; the fallback owns its scrim.
        bd.style.background='#100d0a';
        Array.prototype.forEach.call(doc.body.children, function (node) {
          if (node !== bd) { hidden.push([node, node.inert]); node.inert = true; }
        });
      }
      panel.focus({ preventScroll: true });
    } catch(error) {
      dispose(); throw error;
    }
    return dispose;
  }
  root.JY_PICKER = Object.freeze({ version: '1.2.0', mount: mount, refresh: refresh, renderTime: renderTime, dimensions: dimensions, validDate: validDate, daysInMonth: daysInMonth, shiftMonth: shiftMonth });
})(typeof window !== 'undefined' ? window : globalThis);
