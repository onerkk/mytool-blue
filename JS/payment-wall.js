// ═══════════════════════════════════════════════════════════════
// 💰 靜月之光 — 綠界付費牆 (payment-wall.js)
// 載入位置：在 ai-analysis.js 之後
// 功能：免費次數用完 → 顯示付費按鈕 → 綠界刷卡/ATM → 解鎖 AI
// ═══════════════════════════════════════════════════════════════

(function() {
  'use strict';

  var WORKER_URL = 'https://jy-ai-proxy.onerkk.workers.dev';
  var PRICE_TAROT = 30;
  var PRICE_FULL = 50;

  // ── 偵測當前模式 ──
  function _getCurrentMode() {
    // 塔羅快讀頁面 vs 七維度結果頁
    var tarotWrap = document.getElementById('tarot-ai-wrap');
    var fullWrap = document.getElementById('ai-deep-wrap');
    if (tarotWrap && tarotWrap.offsetParent !== null) return 'tarot_only';
    return 'full';
  }

  // ── 付費牆 HTML ──
  function _buildPaywallHTML(mode) {
    var price = mode === 'tarot_only' ? PRICE_TAROT : PRICE_FULL;
    var label = mode === 'tarot_only' ? '塔羅深度解讀' : '七維度 AI 深度解讀';
    var icon = mode === 'tarot_only' ? '🃏' : '🔮';
    var accent = mode === 'tarot_only' ? '139,92,246' : '212,175,55';

    return '<div style="text-align:center;padding:2rem 1.2rem">' +
      '<div style="font-size:2rem;margin-bottom:.6rem">🔒</div>' +
      '<div style="font-size:1rem;color:var(--c-gold);font-weight:700;margin-bottom:.3rem">今日免費額度已用完</div>' +
      '<div style="font-size:.78rem;color:var(--c-text-dim);margin-bottom:1.2rem;line-height:1.6">每人每天免費 1 次・想再看一次？</div>' +

      // 付費按鈕
      '<button onclick="_jyStartPayment(\'' + mode + '\')" style="' +
        'display:inline-flex;align-items:center;gap:8px;' +
        'padding:14px 28px;border-radius:14px;' +
        'background:linear-gradient(135deg,rgba(' + accent + ',.18),rgba(' + accent + ',.08));' +
        'color:var(--c-gold);font-size:.95rem;font-weight:700;' +
        'border:2px solid rgba(' + accent + ',.5);' +
        'cursor:pointer;font-family:inherit;' +
        'box-shadow:0 4px 20px rgba(' + accent + ',.15);' +
        'transition:all .2s;letter-spacing:.02em' +
      '">' +
        icon + ' 解鎖' + label + '  NT$' + price +
      '</button>' +

      // 支付方式提示
      '<div style="margin-top:.8rem;display:flex;justify-content:center;gap:.5rem;flex-wrap:wrap">' +
        '<span style="font-size:.65rem;padding:.2rem .5rem;border-radius:6px;background:rgba(255,255,255,.06);color:var(--c-text-dim)">💳 信用卡</span>' +
        '<span style="font-size:.65rem;padding:.2rem .5rem;border-radius:6px;background:rgba(255,255,255,.06);color:var(--c-text-dim)">🏧 ATM轉帳</span>' +
        '<span style="font-size:.65rem;padding:.2rem .5rem;border-radius:6px;background:rgba(255,255,255,.06);color:var(--c-text-dim)">🏪 超商代碼</span>' +
        '<span style="font-size:.65rem;padding:.2rem .5rem;border-radius:6px;background:rgba(255,255,255,.06);color:var(--c-text-dim)"> Apple Pay</span>' +
      '</div>' +

      '<div style="font-size:.65rem;color:var(--c-text-dim);margin-top:.6rem;opacity:.5">付款由綠界科技安全處理・付完自動解鎖</div>' +

      // 明天再來提示
      '<div style="margin-top:1rem;font-size:.72rem;color:var(--c-text-dim);opacity:.4">或等明天 00:00 重置免費次數</div>' +
    '</div>';
  }

  // ── 發起付款 ──
  window._jyStartPayment = async function(mode) {
    mode = mode || _getCurrentMode();
    var price = mode === 'tarot_only' ? PRICE_TAROT : PRICE_FULL;

    // 顯示「前往付款中…」
    var targetDiv = mode === 'tarot_only'
      ? document.getElementById('tarot-ai-wrap')
      : document.getElementById('ai-deep-result') || document.getElementById('ai-deep-wrap');
    if (targetDiv) {
      targetDiv.innerHTML = '<div style="text-align:center;padding:2rem">' +
        '<div style="font-size:1.1rem;color:var(--c-gold);margin-bottom:.5rem">正在建立付款訂單…</div>' +
        '<div style="font-size:.75rem;color:var(--c-text-dim)">即將跳轉到付款頁面</div>' +
      '</div>';
    }

    try {
      var resp = await fetch(WORKER_URL + '/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: mode })
      });
      var data = await resp.json();

      if (data.error) throw new Error(data.error);
      if (!data.html || !data.tradeNo) throw new Error('付款建立失敗');

      // 儲存 tradeNo 到 localStorage，付款完回來用
      localStorage.setItem('_jy_pending_payment', JSON.stringify({
        tradeNo: data.tradeNo,
        mode: mode,
        ts: Date.now()
      }));

      // 在新視窗開啟綠界付款頁（或當前頁面導轉）
      // 方法：建立一個隱藏 iframe 注入 HTML 然後 submit
      // 但綠界要求 form submit 導轉，所以直接寫入當前頁面
      var payWin = window.open('', '_blank');
      if (payWin) {
        payWin.document.write(data.html);
        payWin.document.close();
        // 在原頁面顯示等待付款狀態
        if (targetDiv) {
          targetDiv.innerHTML = '<div style="text-align:center;padding:2rem">' +
            '<div style="font-size:1.1rem;color:var(--c-gold);margin-bottom:.5rem">付款頁面已開啟</div>' +
            '<div style="font-size:.78rem;color:var(--c-text-dim);margin-bottom:1rem;line-height:1.6">請在新視窗完成付款<br>付款完成後點擊下方按鈕</div>' +
            '<button onclick="_jyCheckPaymentAndUnlock()" style="' +
              'padding:12px 24px;border-radius:12px;' +
              'background:linear-gradient(135deg,rgba(212,175,55,.15),rgba(212,175,55,.08));' +
              'color:var(--c-gold);font-size:.9rem;font-weight:600;' +
              'border:1.5px solid rgba(212,175,55,.4);' +
              'cursor:pointer;font-family:inherit' +
            '">✅ 我已完成付款</button>' +
            '<div style="font-size:.65rem;color:var(--c-text-dim);margin-top:.6rem;opacity:.5">如果新視窗被阻擋，請允許彈出視窗</div>' +
          '</div>';
        }
      } else {
        // 彈出視窗被擋 → 直接在當前頁面導轉
        document.open();
        document.write(data.html);
        document.close();
      }

    } catch (err) {
      console.error('[Payment]', err);
      if (targetDiv) {
        targetDiv.innerHTML = '<div style="text-align:center;padding:1.5rem">' +
          '<div style="color:#f87171;font-size:.85rem;margin-bottom:.8rem">付款建立失敗：' + (err.message || '請稍後再試') + '</div>' +
          '<button onclick="_jyStartPayment(\'' + mode + '\')" style="padding:.6rem 1.2rem;border-radius:10px;background:transparent;color:var(--c-gold);border:1.5px solid rgba(212,175,55,.4);font-size:.85rem;cursor:pointer;font-family:inherit">再試一次</button>' +
        '</div>';
      }
    }
  };

  // ── 付款完成後驗證並解鎖 ──
  window._jyCheckPaymentAndUnlock = async function() {
    var pending = null;
    try { pending = JSON.parse(localStorage.getItem('_jy_pending_payment') || 'null'); } catch(_) {}
    if (!pending || !pending.tradeNo) {
      alert('找不到付款紀錄，請重新操作');
      return;
    }

    var targetDiv = pending.mode === 'tarot_only'
      ? document.getElementById('tarot-ai-wrap')
      : document.getElementById('ai-deep-result') || document.getElementById('ai-deep-wrap');

    if (targetDiv) {
      targetDiv.innerHTML = '<div style="text-align:center;padding:1.5rem">' +
        '<div style="font-size:.9rem;color:var(--c-gold)">驗證付款中…</div>' +
      '</div>';
    }

    try {
      var resp = await fetch(WORKER_URL + '/check-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tradeNo: pending.tradeNo })
      });
      var data = await resp.json();

      if (data.paid) {
        // 付款成功 → 儲存 token → 觸發 AI
        localStorage.setItem('_jy_paid_token', pending.tradeNo);
        localStorage.removeItem('_jy_pending_payment');

        // 確保結果容器存在
        if (pending.mode === 'tarot_only') {
          if (typeof _triggerTarotAI === 'function') _triggerTarotAI();
        } else {
          var wrap = document.getElementById('ai-deep-wrap');
          if (wrap && !document.getElementById('ai-deep-result')) {
            wrap.innerHTML = '<div id="ai-deep-result"></div>';
          }
          if (typeof _triggerAIDeep === 'function') _triggerAIDeep();
        }
      } else {
        // 尚未收到付款通知
        if (targetDiv) {
          targetDiv.innerHTML = '<div style="text-align:center;padding:1.5rem">' +
            '<div style="font-size:.85rem;color:var(--c-gold);margin-bottom:.5rem">尚未收到付款通知</div>' +
            '<div style="font-size:.75rem;color:var(--c-text-dim);margin-bottom:1rem;line-height:1.6">可能需要幾秒鐘處理，請稍後再點</div>' +
            '<button onclick="_jyCheckPaymentAndUnlock()" style="padding:10px 20px;border-radius:10px;background:transparent;color:var(--c-gold);border:1.5px solid rgba(212,175,55,.4);font-size:.85rem;cursor:pointer;font-family:inherit;margin-right:.5rem">🔄 再檢查一次</button>' +
            '<button onclick="_jyStartPayment(\'' + pending.mode + '\')" style="padding:10px 20px;border-radius:10px;background:transparent;color:var(--c-text-dim);border:1px solid rgba(255,255,255,.1);font-size:.8rem;cursor:pointer;font-family:inherit">重新付款</button>' +
          '</div>';
        }
      }
    } catch (err) {
      console.error('[Payment check]', err);
      if (targetDiv) {
        targetDiv.innerHTML = '<div style="text-align:center;padding:1rem;color:#f87171;font-size:.82rem">驗證失敗，請稍後再試</div>';
      }
    }
  };

  // ═══════════════════════════════════════════════════════════
  // 覆寫 _injectAIButton — 免費用完改顯示付費牆
  // ═══════════════════════════════════════════════════════════

  var _origInjectAIButton = window._injectAIButton;

  window._injectAIButton = function() {
    var wrap = document.getElementById('ai-deep-wrap');
    if (!wrap) { if (_origInjectAIButton) _origInjectAIButton(); return; }

    var admin = typeof _aiIsAdmin === 'function' ? _aiIsAdmin() : !!(window._JY_ADMIN_TOKEN);
    var used = !admin && (typeof _aiUsedToday === 'function' ? _aiUsedToday() : false);

    // 檢查是否有付費 token（付款回來後）
    var paidToken = localStorage.getItem('_jy_paid_token');
    if (paidToken) {
      // 有 token → 直接觸發 AI，token 會在 _triggerAIDeep 裡帶給 Worker
      used = false;
    }

    if (used) {
      // 免費額度已用完 → 顯示付費牆
      wrap.innerHTML = _buildPaywallHTML('full');
      return;
    }

    // 正常流程
    if (_origInjectAIButton) {
      _origInjectAIButton();
    } else {
      wrap.innerHTML = '<div id="ai-deep-result"></div>';
      setTimeout(function() {
        try { if (typeof _triggerAIDeep === 'function') _triggerAIDeep(); } catch(e) {}
      }, 300);
    }
  };

  // ═══════════════════════════════════════════════════════════
  // 覆寫 _triggerAIDeep — 帶付費 token + 429 改顯示付費牆
  // ═══════════════════════════════════════════════════════════

  var _origTriggerAIDeep = window._triggerAIDeep;

  window._triggerAIDeep = async function() {
    // 在呼叫 Worker 前，把 paid_token 注入到 fetch body
    var paidToken = localStorage.getItem('_jy_paid_token');

    if (paidToken) {
      // 有 paid token → 需要攔截 fetch 把 token 帶進去
      // 暫時 monkey-patch fetch
      var _realFetch = window.fetch;
      var _patchUsed = false;
      window.fetch = function(url, opts) {
        if (!_patchUsed && typeof url === 'string' && url.indexOf('jy-ai-proxy') >= 0 && opts && opts.body) {
          _patchUsed = true;
          try {
            var bodyObj = JSON.parse(opts.body);
            bodyObj.paid_token = paidToken;
            opts.body = JSON.stringify(bodyObj);
          } catch(_) {}
        }
        return _realFetch.call(window, url, opts);
      };

      try {
        await _origTriggerAIDeep();
        // 成功後清除 token（一次性）
        localStorage.removeItem('_jy_paid_token');
      } catch(e) {
        // 失敗也清
        localStorage.removeItem('_jy_paid_token');
        throw e;
      } finally {
        window.fetch = _realFetch;
      }
      return;
    }

    // 無 paid token → 正常呼叫，但攔截 429 顯示付費牆
    try {
      await _origTriggerAIDeep();
    } catch(e) {
      // _origTriggerAIDeep 內部已經 catch 了 429 並顯示「已看過」
      // 不需要在這裡再處理
    }
  };

  // ═══════════════════════════════════════════════════════════
  // 覆寫 _triggerTarotAI — 帶付費 token + 429 改顯示付費牆
  // ═══════════════════════════════════════════════════════════

  var _origTriggerTarotAI = window._triggerTarotAI;

  if (_origTriggerTarotAI) {
    window._triggerTarotAI = async function() {
      var paidToken = localStorage.getItem('_jy_paid_token');

      if (paidToken) {
        var _realFetch = window.fetch;
        var _patchUsed = false;
        window.fetch = function(url, opts) {
          if (!_patchUsed && typeof url === 'string' && url.indexOf('jy-ai-proxy') >= 0 && opts && opts.body) {
            _patchUsed = true;
            try {
              var bodyObj = JSON.parse(opts.body);
              bodyObj.paid_token = paidToken;
              opts.body = JSON.stringify(bodyObj);
            } catch(_) {}
          }
          return _realFetch.call(window, url, opts);
        };
        try {
          await _origTriggerTarotAI();
          localStorage.removeItem('_jy_paid_token');
        } catch(e) {
          localStorage.removeItem('_jy_paid_token');
        } finally {
          window.fetch = _realFetch;
        }
        return;
      }

      await _origTriggerTarotAI();
    };
  }

  // ═══════════════════════════════════════════════════════════
  // 頁面載入時：檢查 URL 是否有 ?paid=TRADENO（從綠界回來）
  // ═══════════════════════════════════════════════════════════

  function _checkPaymentReturn() {
    var params = new URLSearchParams(window.location.search);
    var paidTradeNo = params.get('paid');
    if (!paidTradeNo) return;

    // 清除 URL 參數（不重新載入）
    var cleanUrl = window.location.pathname + window.location.hash;
    history.replaceState(null, '', cleanUrl);

    // 儲存 token
    localStorage.setItem('_jy_paid_token', paidTradeNo);
    localStorage.removeItem('_jy_pending_payment');

    // 在頁面頂部顯示付款成功提示
    var banner = document.createElement('div');
    banner.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:99999;background:linear-gradient(135deg,rgba(34,197,94,.9),rgba(22,163,74,.95));color:white;text-align:center;padding:12px;font-size:.85rem;font-weight:600;box-shadow:0 2px 12px rgba(0,0,0,.3);transition:transform .3s';
    banner.textContent = '✅ 付款成功！正在為你解鎖 AI 深度解讀…';
    document.body.prepend(banner);

    // 3 秒後隱藏
    setTimeout(function() {
      banner.style.transform = 'translateY(-100%)';
      setTimeout(function() { banner.remove(); }, 400);
    }, 3000);
  }

  // ═══════════════════════════════════════════════════════════
  // 覆寫 429 error 的顯示（在 _triggerAIDeep 內部的 catch）
  // 因為原版 _triggerAIDeep 內部已經處理了 429，我們需要
  // 在 DOM 變化時偵測到「今天這題已看過」，然後替換成付費牆
  // ═══════════════════════════════════════════════════════════

  function _watchFor429() {
    var observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(m) {
        if (m.type !== 'childList') return;
        m.addedNodes.forEach(function(node) {
          if (node.nodeType !== 1) return;
          var text = node.textContent || '';
          // 七維度 429
          if (text.indexOf('今天這題已看過') >= 0 || text.indexOf('今日解讀額度已用盡') >= 0) {
            var parent = node.closest('#ai-deep-result') || node.closest('#ai-deep-wrap') || node.parentElement;
            if (parent) {
              setTimeout(function() { parent.innerHTML = _buildPaywallHTML('full'); }, 50);
            }
          }
          // 塔羅 429
          if (text.indexOf('今日塔羅已看過') >= 0 || text.indexOf('塔羅額度已用盡') >= 0) {
            var parent2 = node.closest('#tarot-ai-wrap') || node.parentElement;
            if (parent2) {
              setTimeout(function() { parent2.innerHTML = _buildPaywallHTML('tarot_only'); }, 50);
            }
          }
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  // ── 初始化 ──
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      _checkPaymentReturn();
      _watchFor429();
    });
  } else {
    _checkPaymentReturn();
    _watchFor429();
  }

})();
