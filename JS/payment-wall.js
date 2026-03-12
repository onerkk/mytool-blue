// ═══════════════════════════════════════════════════════════════
// 💰 靜月之光 — 綠界付費牆 v2 (payment-wall.js)
// 載入位置：在 index.html 最底部（所有 JS 之後）
// ═══════════════════════════════════════════════════════════════

(function() {
  'use strict';

  var WORKER_URL = 'https://jy-ai-proxy.onerkk.workers.dev';
  var PRICE_TAROT = 30;
  var PRICE_FULL = 50;

  // ═══ 1. 付費牆 HTML ═══

  function _buildPaywallHTML(mode) {
    var price = mode === 'tarot_only' ? PRICE_TAROT : PRICE_FULL;
    var label = mode === 'tarot_only' ? '塔羅深度解讀' : '七維度 AI 深度解讀';
    var icon = mode === 'tarot_only' ? '🃏' : '🔮';
    var accent = mode === 'tarot_only' ? '139,92,246' : '212,175,55';

    return '<div style="max-width:340px;width:90%;background:linear-gradient(145deg,#1a0a0a,#2a1515);border:1.5px solid rgba(' + accent + ',.35);border-radius:18px;padding:2.2rem 1.5rem;text-align:center;box-shadow:0 24px 80px rgba(0,0,0,.6)">' +
      '<div style="font-size:2.8rem;margin-bottom:1rem;filter:drop-shadow(0 0 12px rgba(' + accent + ',.3))">🌙</div>' +
      '<h3 style="color:var(--c-gold,#d4af37);font-size:1.05rem;margin-bottom:.6rem;font-family:var(--f-display,serif)">今日免費額度已用完</h3>' +
      '<p style="font-size:.85rem;color:var(--c-text-dim,#a09880);line-height:1.7;margin-bottom:.3rem">每人每天免費 1 次</p>' +
      '<p style="font-size:.78rem;color:var(--c-text-muted,#6b6355);margin-bottom:1.2rem">想再問一題？</p>' +
      '<div style="display:flex;flex-direction:column;gap:.5rem;align-items:center">' +
        '<button onclick="_jyStartPayment(\'' + mode + '\')" style="display:flex;align-items:center;justify-content:center;gap:6px;width:220px;padding:13px;border-radius:12px;background:linear-gradient(135deg,rgba(' + accent + ',.18),rgba(' + accent + ',.06));color:var(--c-gold,#d4af37);font-size:.9rem;font-weight:700;border:1.5px solid rgba(' + accent + ',.45);cursor:pointer;font-family:inherit;box-shadow:0 4px 16px rgba(' + accent + ',.12)">' + icon + ' 解鎖' + label + ' NT$' + price + '</button>' +
        '<div style="display:flex;gap:.3rem;flex-wrap:wrap;justify-content:center;margin-top:.3rem">' +
          '<span style="font-size:.6rem;padding:.15rem .4rem;border-radius:5px;background:rgba(255,255,255,.05);color:var(--c-text-muted)">💳信用卡</span>' +
          '<span style="font-size:.6rem;padding:.15rem .4rem;border-radius:5px;background:rgba(255,255,255,.05);color:var(--c-text-muted)">🏧ATM</span>' +
          '<span style="font-size:.6rem;padding:.15rem .4rem;border-radius:5px;background:rgba(255,255,255,.05);color:var(--c-text-muted)">🏪超商</span>' +
          '<span style="font-size:.6rem;padding:.15rem .4rem;border-radius:5px;background:rgba(255,255,255,.05);color:var(--c-text-muted)"> Pay</span>' +
        '</div>' +
        '<div style="font-size:.6rem;color:var(--c-text-muted);margin-top:.2rem;opacity:.5">付款由綠界科技安全處理</div>' +
        '<button onclick="var m=document.getElementById(\'jy-pay-modal\');if(m)m.remove();" style="width:200px;padding:10px;border-radius:10px;background:transparent;color:var(--c-text-dim,#a09880);font-size:.78rem;border:1px solid rgba(255,255,255,.06);cursor:pointer;font-family:inherit;margin-top:.2rem">00:00 重置免費次數</button>' +
      '</div>' +
    '</div>';
  }

  // ═══ 2. 付款流程 ═══

  window._jyStartPayment = async function(mode) {
    mode = mode || 'full';
    // 清除所有相關 modal
    ['jy-pay-modal','jy-used-modal','tarot-used-modal'].forEach(function(id) {
      var el = document.getElementById(id); if (el) el.remove();
    });

    // 載入提示
    var loadModal = document.createElement('div');
    loadModal.id = 'jy-pay-modal';
    loadModal.style.cssText = 'position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.75)';
    loadModal.innerHTML = '<div style="background:#1a0a0a;border:1px solid rgba(212,175,55,.25);border-radius:16px;padding:2rem;text-align:center"><div style="font-size:1rem;color:var(--c-gold)">正在建立付款訂單…</div></div>';
    document.body.appendChild(loadModal);

    try {
      var resp = await fetch(WORKER_URL + '/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: mode })
      });
      var data = await resp.json();
      if (data.error) throw new Error(data.error);
      if (!data.html || !data.tradeNo) throw new Error('付款建立失敗');

      localStorage.setItem('_jy_pending_payment', JSON.stringify({
        tradeNo: data.tradeNo, mode: mode, ts: Date.now()
      }));
      loadModal.remove();

      var payWin = window.open('', '_blank');
      if (payWin) {
        payWin.document.write(data.html);
        payWin.document.close();
        // 等待確認 modal
        var waitModal = document.createElement('div');
        waitModal.id = 'jy-pay-modal';
        waitModal.style.cssText = 'position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.75)';
        waitModal.innerHTML = '<div style="background:#1a0a0a;border:1px solid rgba(212,175,55,.25);border-radius:16px;padding:2rem 1.5rem;text-align:center;max-width:320px">' +
          '<div style="font-size:1.5rem;margin-bottom:.6rem">💳</div>' +
          '<div style="font-size:1rem;color:var(--c-gold);font-weight:700;margin-bottom:.5rem">付款頁面已開啟</div>' +
          '<div style="font-size:.8rem;color:var(--c-text-dim);line-height:1.7;margin-bottom:1rem">請在新視窗完成付款<br>付完後點下面按鈕</div>' +
          '<button onclick="_jyCheckPaymentAndUnlock()" style="width:200px;padding:12px;border-radius:10px;background:linear-gradient(135deg,rgba(212,175,55,.15),rgba(212,175,55,.06));color:var(--c-gold);font-size:.88rem;font-weight:600;border:1.5px solid rgba(212,175,55,.4);cursor:pointer;font-family:inherit">✅ 我已完成付款</button>' +
          '<div style="font-size:.6rem;color:var(--c-text-muted);margin-top:.5rem;opacity:.5">如果新視窗被擋，請允許彈出視窗</div>' +
        '</div>';
        waitModal.addEventListener('click', function(e) { if (e.target === waitModal) waitModal.remove(); });
        document.body.appendChild(waitModal);
      } else {
        document.open(); document.write(data.html); document.close();
      }
    } catch (err) {
      console.error('[Payment]', err);
      loadModal.remove();
      alert('付款建立失敗：' + (err.message || '請稍後再試'));
    }
  };

  window._jyCheckPaymentAndUnlock = async function() {
    var pending = null;
    try { pending = JSON.parse(localStorage.getItem('_jy_pending_payment') || 'null'); } catch(_) {}
    if (!pending || !pending.tradeNo) { alert('找不到付款紀錄'); return; }

    try {
      var resp = await fetch(WORKER_URL + '/check-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tradeNo: pending.tradeNo })
      });
      var data = await resp.json();
      if (data.paid) {
        localStorage.setItem('_jy_paid_token', pending.tradeNo);
        localStorage.removeItem('_jy_pending_payment');
        var m = document.getElementById('jy-pay-modal'); if (m) m.remove();
        window.location.reload();
      } else {
        alert('尚未收到付款通知，請等幾秒後再按一次');
      }
    } catch (err) {
      alert('驗證失敗：' + (err.message || '請稍後再試'));
    }
  };

  // ═══ 3. 攔截「已用完」彈窗 → 替換成付費牆 ═══

  function _hijackUsedModals() {
    var observer = new MutationObserver(function(mutations) {
      for (var i = 0; i < mutations.length; i++) {
        var added = mutations[i].addedNodes;
        for (var j = 0; j < added.length; j++) {
          var node = added[j];
          if (node.nodeType !== 1) continue;

          // 七維度已用完 modal
          if (node.id === 'jy-used-modal') {
            node.remove();
            var m1 = document.createElement('div');
            m1.id = 'jy-pay-modal';
            m1.style.cssText = 'position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.75);backdrop-filter:blur(6px)';
            m1.innerHTML = _buildPaywallHTML('full');
            m1.addEventListener('click', function(e) { if (e.target === m1) m1.remove(); });
            document.body.appendChild(m1);
            return;
          }

          // 塔羅已用完 modal
          if (node.id === 'tarot-used-modal') {
            node.remove();
            var m2 = document.createElement('div');
            m2.id = 'jy-pay-modal';
            m2.style.cssText = 'position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.75);backdrop-filter:blur(6px)';
            m2.innerHTML = _buildPaywallHTML('tarot_only');
            m2.addEventListener('click', function(e) { if (e.target === m2) m2.remove(); });
            document.body.appendChild(m2);
            return;
          }

          // ai-deep-wrap 裡的「今日解讀額度已用盡」文字
          var txt = node.textContent || '';
          if (txt.indexOf('今日解讀額度已用盡') >= 0) {
            var wrap = node.closest('#ai-deep-wrap') || node.parentElement;
            if (wrap) {
              setTimeout(function() {
                wrap.innerHTML = '<div style="text-align:center;padding:1.5rem">' + _buildPaywallHTML('full') + '</div>';
              }, 30);
              return;
            }
          }

          // 429 「今天這題已看過」
          if (txt.indexOf('今天這題已看過') >= 0) {
            var p = node.closest('#ai-deep-result') || node.closest('#ai-deep-wrap');
            if (p) {
              setTimeout(function() {
                p.innerHTML = '<div style="text-align:center;padding:1.5rem">' + _buildPaywallHTML('full') + '</div>';
              }, 30);
              return;
            }
          }

          // 塔羅 429 「今日塔羅已看過」
          if (txt.indexOf('今日塔羅已看過') >= 0 || txt.indexOf('今日塔羅解讀已使用') >= 0) {
            var p2 = node.closest('#tarot-ai-wrap') || node.parentElement;
            if (p2) {
              setTimeout(function() {
                p2.innerHTML = '<div style="text-align:center;padding:1.5rem">' + _buildPaywallHTML('tarot_only') + '</div>';
              }, 30);
              return;
            }
          }
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  // ═══ 4. 付費 token 注入到 AI fetch ═══

  function _injectPaidToken() {
    var token = localStorage.getItem('_jy_paid_token');
    if (!token) return;

    var _realFetch = window.fetch;
    window.fetch = function(url, opts) {
      if (typeof url === 'string' && url.indexOf('jy-ai-proxy') >= 0 && opts && opts.body && typeof opts.body === 'string') {
        try {
          var bodyObj = JSON.parse(opts.body);
          if (bodyObj.payload || bodyObj.action === 'check') {
            bodyObj.paid_token = token;
            opts.body = JSON.stringify(bodyObj);
          }
        } catch(_) {}
      }
      return _realFetch.call(window, url, opts);
    };

    // AI 結果出來後清 token
    var done = false;
    var clearObs = new MutationObserver(function() {
      if (done) return;
      var rd = document.getElementById('ai-deep-result');
      var tw = document.getElementById('tarot-ai-wrap');
      var hasResult = (rd && rd.innerHTML.length > 300 && rd.textContent.indexOf('正在') === -1) ||
                      (tw && tw.innerHTML.length > 300 && tw.textContent.indexOf('正在') === -1);
      if (hasResult) {
        done = true;
        localStorage.removeItem('_jy_paid_token');
        window.fetch = _realFetch;
        clearObs.disconnect();
      }
    });
    setTimeout(function() { clearObs.observe(document.body, { childList: true, subtree: true }); }, 500);
  }

  // ═══ 5. 水晶處方：接 AI energyNote + 自動展開 ═══

  function _watchCrystalPanel() {
    var triggered = false;
    var observer = new MutationObserver(function() {
      if (triggered) return;
      var rd = document.getElementById('ai-deep-result');
      if (!rd || rd.innerHTML.length < 300) return;
      if (rd.textContent.indexOf('正在') >= 0) return;

      triggered = true;
      setTimeout(function() {
        // 解鎖 + 展開
        var panel = document.getElementById('crystal-panel');
        if (!panel) return;
        panel.style.opacity = '1';
        panel.style.pointerEvents = 'auto';
        var title = document.getElementById('crystal-panel-title');
        if (title) title.textContent = '完整水晶處方 — 依你命盤精選';
        var body = panel.querySelector('.collapsible-body');
        if (body) { body.style.display = 'block'; body.style.maxHeight = 'none'; body.style.overflow = 'visible'; }
        panel.classList.remove('collapsed');
        var arrow = panel.querySelector('.collapse-arrow');
        if (arrow) arrow.style.transform = 'rotate(180deg)';

        // 嘗試從 AI 文字找水晶名稱填入 r-crystal
        _fillCrystalFromAI();
      }, 600);
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  function _fillCrystalFromAI() {
    var crystalDiv = document.getElementById('r-crystal');
    if (!crystalDiv) return;
    if (crystalDiv.innerHTML.trim().length > 100) return; // 離線已填

    var rd = document.getElementById('ai-deep-result');
    if (!rd) return;
    var text = rd.textContent || '';

    var crystals = ['月光石','粉晶','紫水晶','黑曜石','白水晶','黃水晶','虎眼石','拉長石','螢石','碧璽','綠幽靈','金髮晶','草莓晶','海藍寶','青金石','孔雀石','紅瑪瑙','黑碧璽','茶晶','煙晶','天河石','石榴石','橄欖石','蛋白石','藍紋瑪瑙','綠檀木','沉香','綠碧璽','粉碧璽','西瓜碧璽','黑碧璽'];
    var found = null;
    for (var i = 0; i < crystals.length; i++) {
      if (text.indexOf(crystals[i]) >= 0) { found = crystals[i]; break; }
    }

    if (found) {
      crystalDiv.innerHTML = 
        '<div style="padding:.8rem;text-align:center">' +
          '<div style="font-size:1.5rem;margin-bottom:.4rem">💎</div>' +
          '<div style="font-size:.95rem;color:var(--c-gold);font-weight:700;margin-bottom:.3rem">AI 推薦：' + found + '</div>' +
          '<div style="font-size:.8rem;color:var(--c-text-dim);line-height:1.7;margin-bottom:.8rem">根據你的命盤與問題方向，這顆水晶跟你目前的能量最共振</div>' +
          '<a href="https://tw.shp.ee/2n5Mo2w" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;gap:6px;padding:10px 20px;border-radius:10px;background:linear-gradient(135deg,rgba(212,175,55,.12),rgba(212,175,55,.05));color:var(--c-gold);text-decoration:none;font-size:.82rem;font-weight:600;border:1px solid rgba(212,175,55,.3)"><i class="fas fa-gem"></i> 看看 ' + found + '</a>' +
        '</div>';
    }
  }

  // ═══ 6. 移除塔羅模式下閃現的舊過場動畫 ═══

  function _killOldOverlayFlash() {
    var observer = new MutationObserver(function(mutations) {
      for (var i = 0; i < mutations.length; i++) {
        var added = mutations[i].addedNodes;
        for (var j = 0; j < added.length; j++) {
          var node = added[j];
          if (node.nodeType !== 1) continue;
          if (node.id === 'loading-overlay' && window.S && window.S._tarotOnlyMode) {
            node.remove();
          }
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  // ═══ 7. 從綠界付款回來 ═══

  function _checkPaymentReturn() {
    var params = new URLSearchParams(window.location.search);
    var paidTradeNo = params.get('paid');
    if (!paidTradeNo) return;
    history.replaceState(null, '', window.location.pathname + window.location.hash);
    localStorage.setItem('_jy_paid_token', paidTradeNo);
    localStorage.removeItem('_jy_pending_payment');

    var banner = document.createElement('div');
    banner.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:99999;background:linear-gradient(135deg,rgba(34,197,94,.92),rgba(22,163,74,.95));color:white;text-align:center;padding:14px;font-size:.88rem;font-weight:600;box-shadow:0 2px 16px rgba(0,0,0,.3);transition:transform .4s';
    banner.textContent = '✅ 付款成功！AI 深度解讀已解鎖';
    document.body.prepend(banner);
    setTimeout(function() {
      banner.style.transform = 'translateY(-100%)';
      setTimeout(function() { banner.remove(); }, 500);
    }, 3000);
  }

  // ═══ 8. 攔截手動抽牌模式：監聽 step-2 出現 + 塔羅模式 → 檢查額度 ═══

  function _interceptManualTarot() {
    // 策略：MutationObserver 監聽 step-2 被顯示（display 從 none 變成 block）
    // 如果是塔羅模式且額度用完，立刻蓋回去
    var checking = false;
    var observer = new MutationObserver(function(mutations) {
      if (checking) return;
      for (var i = 0; i < mutations.length; i++) {
        var target = mutations[i].target;
        if (!target || !target.id) continue;
        // step-2 是抽牌頁
        if (target.id === 'step-2' && target.style && target.style.display !== 'none') {
          // 確認是塔羅模式
          if (window.S && window.S._tarotOnlyMode) {
            var isAdmin = !!(window._JY_ADMIN_TOKEN);
            var hasPaidToken = !!localStorage.getItem('_jy_paid_token');
            if (!isAdmin && !hasPaidToken) {
              checking = true;
              _checkTarotQuota(target);
            }
          }
        }
      }
    });
    observer.observe(document.body, { subtree: true, attributes: true, attributeFilter: ['style', 'class'] });

    // 也用 setInterval 兜底（有些 goStep 實現不改 style 而是改 class）
    var lastStep2Visible = false;
    setInterval(function() {
      if (checking) return;
      var step2 = document.getElementById('step-2');
      if (!step2) return;
      var visible = step2.offsetParent !== null || step2.style.display === 'block';
      if (visible && !lastStep2Visible && window.S && window.S._tarotOnlyMode) {
        var isAdmin = !!(window._JY_ADMIN_TOKEN);
        var hasPaidToken = !!localStorage.getItem('_jy_paid_token');
        if (!isAdmin && !hasPaidToken) {
          checking = true;
          _checkTarotQuota(step2);
        }
      }
      lastStep2Visible = visible;
    }, 500);
  }

  async function _checkTarotQuota(step2El) {
    try {
      var checkResp = await fetch(WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'check', payload: { mode: 'tarot_only' } })
      });
      var checkData = await checkResp.json();
      if (!checkData.allowed) {
        // 額度用完 → 隱藏抽牌頁，回到首頁，彈付費牆
        step2El.style.display = 'none';
        var hookScreen = document.getElementById('hook-screen');
        if (hookScreen) hookScreen.style.display = 'block';
        var inputScreen = document.getElementById('input-screen');
        if (inputScreen) inputScreen.style.display = 'block';

        var m = document.createElement('div');
        m.id = 'jy-pay-modal';
        m.style.cssText = 'position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.75);backdrop-filter:blur(6px)';
        m.innerHTML = _buildPaywallHTML('tarot_only');
        m.addEventListener('click', function(e) { if (e.target === m) m.remove(); });
        document.body.appendChild(m);
      }
    } catch(e) {
      console.warn('[PayWall] manual tarot check failed:', e);
    }
  }

  // ═══ 初始化 ═══

  function _init() {
    _checkPaymentReturn();
    _injectPaidToken();
    _hijackUsedModals();
    _watchCrystalPanel();
    _killOldOverlayFlash();
    _interceptManualTarot();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _init);
  } else {
    _init();
  }

})();
