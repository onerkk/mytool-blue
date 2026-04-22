// ═══════════════════════════════════════════════════════════════
// 💰 靜月之光 — 綠界付費牆 v3 (payment-wall.js)
// v29：新增 NT$10 單次解讀（僅信用卡）
// 載入位置：在 index.html 最底部（所有 JS 之後）
// ═══════════════════════════════════════════════════════════════

(function() {
  'use strict';

  var WORKER_URL = 'https://jy-ai-proxy.onerkk.workers.dev';
  var PRICE_SUB = 1299;
  var PRICE_SINGLE = 69;
  var PRICE_OPUS = 99;
  var PRICE_SINGLE_FOLLOWUP = 19;

  // ═══ 1. 付費牆 HTML ═══

  function _buildPaywallHTML(mode) {
    var singlePrice = mode === 'full' ? 69 : 29;
    var opusSinglePrice = (mode === 'tarot_only' || mode === 'ootk') ? 49 : 99;
    var toolName = mode === 'full' ? '七維度' : (mode === 'tarot_only' ? '塔羅' : '開鑰');
    return '<div style="max-width:360px;width:90%;background:linear-gradient(145deg,#1a0a0a,#2a1515);border:1.5px solid rgba(212,175,55,.35);border-radius:18px;padding:2.2rem 1.5rem;text-align:center;box-shadow:0 24px 80px rgba(0,0,0,.6)">' +
      '<div style="font-size:2.8rem;margin-bottom:.8rem;filter:drop-shadow(0 0 12px rgba(212,175,55,.3))">🌙</div>' +
      '<h3 style="color:var(--c-gold,#c9a84c);font-size:1.1rem;margin-bottom:.3rem;font-family:var(--f-display,serif)">靜月會員</h3>' +
      '<p style="font-size:1.3rem;color:var(--c-gold-pale,#f5e6b8);font-weight:700;margin-bottom:.15rem">NT$' + PRICE_SUB + '<span style="font-size:.7rem;font-weight:400;opacity:.7"> /月</span></p>' +
      '<div style="font-size:.78rem;color:var(--c-text-dim,#a09880);line-height:1.8;margin-bottom:.8rem;text-align:left;padding:0 .4rem">' +
        '🃏 塔羅＋開鑰 <strong style="color:var(--c-gold)">每日 3 次</strong><br>' +
        '🌙 七維度交叉分析 <strong style="color:var(--c-gold)">每月 5 次</strong><br>' +
        '📷 面相＋手相＋水晶照片分析 <strong style="color:#c084fc">會員專屬</strong><br>' +
        '🔮 深度解析 <strong style="color:#c084fc">每月 2 次免費</strong><br>' +
        '⚡ 額外深度解析享 <strong style="color:#c084fc">會員半價</strong>' +
      '</div>' +
      '<div style="display:flex;flex-direction:column;gap:.5rem;align-items:center">' +
        '<button onclick="_jyStartPayment(\'' + mode + '\',\'subscription\')" style="display:flex;align-items:center;justify-content:center;gap:6px;width:220px;padding:13px;border-radius:12px;background:linear-gradient(135deg,rgba(212,175,55,.18),rgba(212,175,55,.06));color:var(--c-gold,#c9a84c);font-size:.9rem;font-weight:700;border:1.5px solid rgba(212,175,55,.45);cursor:pointer;font-family:inherit;box-shadow:0 4px 16px rgba(212,175,55,.12)">🌙 開通會員 NT$' + PRICE_SUB + '/月</button>' +
        '<button onclick="_jyStartPayment(\'' + mode + '\',\'single\')" style="display:flex;align-items:center;justify-content:center;gap:6px;width:220px;padding:11px;border-radius:12px;background:linear-gradient(135deg,rgba(255,255,255,.06),rgba(255,255,255,.02));color:var(--c-text,#e8dcc8);font-size:.85rem;font-weight:600;border:1px solid rgba(255,255,255,.12);cursor:pointer;font-family:inherit">⚡ ' + toolName + '單次 NT$' + singlePrice + '</button>' +
        '<button onclick="_jyStartPayment(\'' + mode + '\',\'opus_single\')" style="display:flex;align-items:center;justify-content:center;gap:6px;width:220px;padding:11px;border-radius:12px;background:linear-gradient(135deg,rgba(147,51,234,.1),rgba(147,51,234,.04));color:#c084fc;font-size:.85rem;font-weight:600;border:1px solid rgba(147,51,234,.25);cursor:pointer;font-family:inherit">🔮 深度解析 NT$' + opusSinglePrice + '</button>' +
        '<div style="font-size:.58rem;color:var(--c-text-muted,#7a7060);margin-top:-.1rem;opacity:.7">單次僅限信用卡・含追問</div>' +
        '<div style="display:flex;gap:.3rem;flex-wrap:wrap;justify-content:center;margin-top:.3rem">' +
          '<span style="font-size:.6rem;padding:.15rem .4rem;border-radius:5px;background:rgba(255,255,255,.05);color:var(--c-text-muted)">💳信用卡</span>' +
          '<span style="font-size:.6rem;padding:.15rem .4rem;border-radius:5px;background:rgba(255,255,255,.05);color:var(--c-text-muted)">🏧ATM</span>' +
          '<span style="font-size:.6rem;padding:.15rem .4rem;border-radius:5px;background:rgba(255,255,255,.05);color:var(--c-text-muted)">🏪超商</span>' +
        '</div>' +
        '<div style="font-size:.6rem;color:var(--c-text-muted);margin-top:.2rem;opacity:.5">付款由綠界科技安全處理</div>' +
        '<button onclick="var m=document.getElementById(\'jy-pay-modal\');if(m){m.remove();return;} var p=this.closest(\'[style*=text-align]\');if(p)p.innerHTML=\'<div style=padding:1rem;text-align:center;color:var(--c-text-muted);font-size:.8rem>需要時隨時回來 🌙</div>\';" style="width:200px;padding:10px;border-radius:10px;background:transparent;color:var(--c-text-dim,#a09880);font-size:.78rem;border:1px solid rgba(255,255,255,.06);cursor:pointer;font-family:inherit;margin-top:.2rem">先不用，謝謝</button>' +
      '</div>' +
    '</div>';
  }

  // ═══ 2. 付款流程 ═══

  window._jyStartPayment = async function(mode, type) {
    mode = mode || 'full';
    type = type || 'subscription';
    // 清除所有相關 modal
    ['jy-pay-modal','jy-used-modal','tarot-used-modal'].forEach(function(id) {
      var el = document.getElementById(id); if (el) el.remove();
    });

    // 載入提示
    var loadModal = document.createElement('div');
    loadModal.id = 'jy-pay-modal';
    loadModal.style.cssText = 'position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.75)';
    loadModal.innerHTML = '<div style="background:#1a0a0a;border:1px solid rgba(201,168,76,.25);border-radius:16px;padding:2rem;text-align:center"><div style="font-size:1rem;color:var(--c-gold)">正在建立付款訂單…</div></div>';
    document.body.appendChild(loadModal);

    try {
      var resp = await fetch(WORKER_URL + '/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: mode, type: type, session_token: localStorage.getItem('_jy_session_token') || '' })
      });
      var data = await resp.json();
      if (data.error) throw new Error(data.error);
      if (!data.html || !data.tradeNo) throw new Error('付款建立失敗');

      localStorage.setItem('_jy_pending_payment', JSON.stringify({
        tradeNo: data.tradeNo, mode: mode, type: type, ts: Date.now()
      }));
      loadModal.remove();

      var payWin = window.open('', '_blank');
      if (payWin) {
        payWin.document.write(data.html);
        payWin.document.close();
        var opusDisplayPrice = (mode === 'tarot_only' || mode === 'ootk') ? 49 : PRICE_OPUS;
        var singleDisplayPrice = mode === 'full' ? 69 : 29;
        var labelText = type === 'opus_single' ? '深度解析 NT$' + opusDisplayPrice
                      : type === 'followup_single' ? '追問單次 NT$' + PRICE_SINGLE_FOLLOWUP
                      : type === 'single' ? '單次解讀 NT$' + singleDisplayPrice
                      : '會員 NT$' + PRICE_SUB;
        // 關閉 Opus 付費 modal（如果存在）
        try { var _om = document.getElementById('jy-opus-pay-modal'); if (_om) _om.remove(); } catch(_) {}
        var waitModal = document.createElement('div');
        waitModal.id = 'jy-pay-modal';
        waitModal.style.cssText = 'position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.75)';
        // v60-hotfix5：主視窗自動輪詢付款狀態（信用卡 3 秒內知道，ATM/超商會等到真的付完）
        //   不再依賴用戶手動點「我已完成付款」（信用卡付完常常忘記回來按）
        //   偵測到 paid=true 立刻觸發對應的 AI 分析函式，用戶不需任何操作
        waitModal.innerHTML = '<div style="background:#1a0a0a;border:1px solid rgba(201,168,76,.25);border-radius:16px;padding:2rem 1.5rem;text-align:center;max-width:320px">' +
          '<div style="font-size:1.5rem;margin-bottom:.6rem">💳</div>' +
          '<div style="font-size:1rem;color:var(--c-gold);font-weight:700;margin-bottom:.5rem">付款頁面已開啟</div>' +
          '<div style="font-size:.8rem;color:var(--c-text-dim);line-height:1.7;margin-bottom:.8rem">請在新視窗完成付款（' + labelText + '）<br><span style="color:#fbbf24;font-weight:600">⚠️ 付完請回到此頁面</span>，系統會自動繼續為您生成解讀</div>' +
          '<div id="jy-pay-autodetect" style="font-size:.75rem;color:#60a5fa;margin-bottom:.8rem;padding:.5rem;background:rgba(96,165,250,.08);border-radius:6px"><span class="jy-pay-dot">●</span> 自動偵測付款中...</div>' +
          '<button onclick="_jyCheckPaymentAndUnlock()" style="width:200px;padding:12px;border-radius:10px;background:linear-gradient(135deg,rgba(201,168,76,.15),rgba(201,168,76,.06));color:var(--c-gold);font-size:.88rem;font-weight:600;border:1px solid rgba(255,255,255,.1);cursor:pointer;font-family:inherit">✅ 我已完成付款</button>' +
          '<div style="font-size:.6rem;color:var(--c-text-muted);margin-top:.5rem;opacity:.5">如果自動偵測沒反應，請點上方按鈕</div>' +
        '</div>';
        waitModal.addEventListener('click', function(e) { if (e.target === waitModal) waitModal.remove(); });
        document.body.appendChild(waitModal);
        // v60-hotfix5：啟動輪詢
        _jyStartPaymentPoll(data.tradeNo);
      } else {
        document.open(); document.write(data.html); document.close();
      }
    } catch (err) {
      console.error('[Payment]', err);
      loadModal.remove();
      alert('付款建立失敗：' + (err.message || '請稍後再試'));
    }
  };

  // v60-hotfix5：付款成功後自動觸發對應 AI 分析的共用函式
  //   key 理解：用戶付費時原頁面 state 仍在（S 物件、表單、本地分析結果都保留），
  //   只要直接呼叫對應的 _triggerXXX 函式即可重啟 AI 分析流程。不需儲存 payload。
  //   pending = { mode, type, tradeNo, ts }
  //   mode: 'full' | 'tarot_only' | 'ootk'
  //   type: 'single' | 'opus_single' | 'subscription' | 'subscription_premium' | 'followup_single'
  function _jyAutoTriggerAfterPayment(pending) {
    if (!pending) return false;
    var mode = pending.mode || 'full';
    var type = pending.type || 'single';
    // 深度旗標：opus_single 一定是深度路徑，subscription 不是（會員可選）
    if (type === 'opus_single') {
      try { window._jyOpusDepth = true; } catch(_) {}
    }
    try {
      // followup_single 維持原邏輯（_jyCheckPaymentAndUnlock 內已處理）
      if (type === 'followup_single') return false;
      // 訂閱型：reload 頁面（會員狀態已寫入，reload 後原表單還在）
      //   但注意：reload 會清掉已生成的本地分析結果，用戶要從填表單開始
      //   這個 case 少見（訂閱通常是免費用完才跳），暫不自動觸發，靠 reload 重啟流程
      if (type === 'subscription' || type === 'subscription_standard' || type === 'subscription_premium') {
        return false; // 走現有 reload 邏輯
      }
      // 單次 / Opus 單次：根據 mode 呼叫對應的 AI 觸發函式
      if (mode === 'tarot_only') {
        if (typeof window._triggerTarotAI === 'function') { window._triggerTarotAI(); return true; }
        if (typeof _triggerTarotAI === 'function') { _triggerTarotAI(); return true; }
      } else if (mode === 'ootk') {
        if (typeof window._triggerOOTKAI === 'function') { window._triggerOOTKAI(); return true; }
        if (typeof window._ootkTriggerAI === 'function') { window._ootkTriggerAI(); return true; }
      } else {
        // mode === 'full' 或其他 → 七維度
        if (typeof window._triggerAIDeep === 'function') { window._triggerAIDeep(); return true; }
        if (typeof _triggerAIDeep === 'function') { _triggerAIDeep(); return true; }
      }
    } catch (err) {
      console.warn('[Payment] auto trigger failed:', err);
    }
    return false;
  }

  // v60-hotfix5：主視窗自動輪詢付款狀態
  //   每 3 秒打一次 /check-payment，最多 10 分鐘（200 次）
  //   成功 → 執行完整解鎖流程（寫 token + 觸發 AI）
  //   失敗 → 停止輪詢，用戶仍可手動點「我已完成付款」
  var _jyPayPollTimer = null;
  var _jyPayPollCount = 0;
  function _jyStartPaymentPoll(tradeNo) {
    if (_jyPayPollTimer) { clearInterval(_jyPayPollTimer); _jyPayPollTimer = null; }
    _jyPayPollCount = 0;
    var MAX_POLLS = 200; // 3 秒 × 200 = 10 分鐘
    _jyPayPollTimer = setInterval(async function() {
      _jyPayPollCount++;
      if (_jyPayPollCount > MAX_POLLS) {
        clearInterval(_jyPayPollTimer); _jyPayPollTimer = null;
        var hintEl = document.getElementById('jy-pay-autodetect');
        if (hintEl) hintEl.innerHTML = '<span style="color:#fbbf24">⚠️ 自動偵測已停止，請手動點「我已完成付款」</span>';
        return;
      }
      try {
        var resp = await fetch(WORKER_URL + '/check-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tradeNo: tradeNo })
        });
        var data = await resp.json();
        if (data.paid) {
          clearInterval(_jyPayPollTimer); _jyPayPollTimer = null;
          _jyUnlockAndTrigger(); // 走跟手動按鈕同樣的解鎖 + 觸發邏輯
        }
      } catch(_) { /* 網路短暫斷不中斷輪詢 */ }
    }, 3000);
  }

  // v60-hotfix5：實際執行「寫 token → 觸發 AI」的核心邏輯（自動輪詢和手動按按鈕共用）
  async function _jyUnlockAndTrigger() {
    var pending = null;
    try { pending = JSON.parse(localStorage.getItem('_jy_pending_payment') || 'null'); } catch(_) {}
    if (!pending || !pending.tradeNo) return false;
    // 寫 token
    localStorage.setItem('_jy_paid_token', pending.tradeNo);
    localStorage.setItem('_jy_paid_token_type', pending.type || 'single');
    if (pending.type !== 'single' && pending.type !== 'opus_single' && pending.type !== 'followup_single') {
      localStorage.setItem('_jy_sub_expires', String(Date.now() + 86400000 * 30));
    }
    localStorage.removeItem('_jy_pending_payment');
    var m = document.getElementById('jy-pay-modal'); if (m) m.remove();

    // followup_single 走現有邏輯（appendFollowUpUI 還原追問 UI）
    if (pending.type === 'followup_single') {
      var banner = document.createElement('div');
      banner.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:99999;background:linear-gradient(135deg,rgba(34,197,94,.92),rgba(22,163,74,.95));color:white;text-align:center;padding:14px;font-size:.88rem;font-weight:600;box-shadow:0 2px 16px rgba(0,0,0,.3);transition:transform .4s';
      banner.textContent = '✅ 付款成功！追問單次已解鎖，請點「抽補充牌」繼續';
      document.body.prepend(banner);
      setTimeout(function() {
        banner.style.transform = 'translateY(-100%)';
        setTimeout(function() { banner.remove(); }, 500);
      }, 3500);
      try {
        var _fuA = document.getElementById('tarot-followup-area');
        if (_fuA && typeof _appendFollowUpUI === 'function') {
          var _srcMode = _fuA.getAttribute('data-source') || 'tarot';
          var _parent = _fuA.parentNode;
          _fuA.remove();
          _appendFollowUpUI(_parent, _srcMode);
          var _newFuA = document.getElementById('tarot-followup-area');
          if (_newFuA) _newFuA.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } catch(_e) { console.warn('[Payment] fu UI restore failed:', _e); }
      return true;
    }

    // 訂閱：reload 走現有流程（用戶重新填表 → 跑免費路徑會員放行）
    if (pending.type === 'subscription' || pending.type === 'subscription_standard' || pending.type === 'subscription_premium') {
      // 顯示成功 banner 1.5 秒後 reload
      var banner2 = document.createElement('div');
      banner2.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:99999;background:linear-gradient(135deg,rgba(34,197,94,.92),rgba(22,163,74,.95));color:white;text-align:center;padding:14px;font-size:.88rem;font-weight:600;box-shadow:0 2px 16px rgba(0,0,0,.3)';
      banner2.textContent = '✅ 付款成功！30 天會員已開通，即將重新載入頁面...';
      document.body.prepend(banner2);
      setTimeout(function() { window.location.reload(); }, 1500);
      return true;
    }

    // 單次 / Opus 單次：顯示 banner + 自動觸發 AI
    var banner3 = document.createElement('div');
    banner3.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:99999;background:linear-gradient(135deg,rgba(34,197,94,.92),rgba(22,163,74,.95));color:white;text-align:center;padding:14px;font-size:.88rem;font-weight:600;box-shadow:0 2px 16px rgba(0,0,0,.3);transition:transform .4s';
    var isOpus = pending.type === 'opus_single';
    banner3.textContent = isOpus ? '✅ 付款成功！深度解析正在為您生成...' : '✅ 付款成功！正在為您生成解讀...';
    document.body.prepend(banner3);
    setTimeout(function() {
      banner3.style.transform = 'translateY(-100%)';
      setTimeout(function() { banner3.remove(); }, 500);
    }, 3500);

    // ★ 核心：自動觸發對應的 AI 分析函式
    var triggered = _jyAutoTriggerAfterPayment(pending);
    if (!triggered) {
      // 沒觸發成功（例如頁面 state 消失、函式沒載入），fallback 到 reload
      console.warn('[Payment] auto trigger returned false, falling back to reload');
      setTimeout(function() { window.location.reload(); }, 1500);
    }
    return true;
  }

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
        // v60-hotfix5：改走共用 _jyUnlockAndTrigger
        //   包含：寫 token → 清 pending → 關 modal → 顯示 banner → 自動觸發對應 AI
        //   追問/訂閱/單次/Opus 都有正確分支
        if (_jyPayPollTimer) { clearInterval(_jyPayPollTimer); _jyPayPollTimer = null; }
        await _jyUnlockAndTrigger();
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
          // ★ v42：排除 trial banner——它是結果頁的資訊提示，不是錯誤訊息，不該觸發付費牆
          if (node.id === 'jy-trial-banner') continue;

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

          var txt = node.textContent || '';

          // ai-deep-wrap 裡的額度已用完
          if (txt.indexOf('免費') >= 0 && (txt.indexOf('已用完') >= 0 || txt.indexOf('已用盡') >= 0)) {
            var wrap = node.closest('#ai-deep-wrap') || node.closest('#ai-deep-result') || node.parentElement;
            if (wrap) {
              setTimeout(function() {
                wrap.innerHTML = '<div style="text-align:center;padding:1.5rem">' + _buildPaywallHTML('full') + '</div>';
              }, 30);
              return;
            }
          }

          // 429 「今天這題已看過」或七維度月度用完
          if (txt.indexOf('今天這題已看過') >= 0 || txt.indexOf('月度配額') >= 0 || txt.indexOf('七維度配額') >= 0) {
            var p = node.closest('#ai-deep-result') || node.closest('#ai-deep-wrap');
            if (p) {
              setTimeout(function() {
                p.innerHTML = '<div style="text-align:center;padding:1.5rem">' + _buildPaywallHTML('full') + '</div>';
              }, 30);
              return;
            }
          }

          // 塔羅 429
          if (txt.indexOf('塔羅') >= 0 && (txt.indexOf('已用完') >= 0 || txt.indexOf('已使用') >= 0 || txt.indexOf('已看過') >= 0)) {
            var p2 = node.closest('#tarot-ai-wrap') || node.parentElement;
            if (p2) {
              setTimeout(function() {
                p2.innerHTML = '<div style="text-align:center;padding:1.5rem">' + _buildPaywallHTML('tarot_only') + '</div>';
              }, 30);
              return;
            }
          }

          // ★ OOTK 429
          if (txt.indexOf('免費') >= 0 && txt.indexOf('已用完') >= 0) {
            var ootkWrap = node.closest('.ootk-result') || node.closest('#ootk-result-wrap');
            if (ootkWrap) {
              setTimeout(function() {
                ootkWrap.innerHTML = '<div style="text-align:center;padding:1.5rem">' + _buildPaywallHTML('ootk') + '</div>';
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

    // AI 結果出來後清 token（單次＋訂閱都清，訂閱靠 sub:{userKey} 繼續放行）
    var done = false;
    var clearObs = new MutationObserver(function() {
      if (done) return;
      var rd = document.getElementById('ai-deep-result');
      var tw = document.getElementById('tarot-ai-wrap');
      var ow = document.getElementById('ootk-ai-wrap');
      // ★ 追問結果容器（tarot-followup-result-N），追問單次付費跑完後也要清 token
      var fuResults = document.querySelectorAll('[id^="tarot-followup-result-"]');
      var hasFuResult = false;
      for (var _i = 0; _i < fuResults.length; _i++) {
        var _fu = fuResults[_i];
        if (_fu && _fu.innerHTML.length > 300 && _fu.textContent.indexOf('正在') === -1) { hasFuResult = true; break; }
      }
      var hasResult = (rd && rd.innerHTML.length > 300 && rd.textContent.indexOf('正在') === -1) ||
                      (tw && tw.innerHTML.length > 300 && tw.textContent.indexOf('正在') === -1) ||
                      (ow && ow.innerHTML.length > 300 && ow.textContent.indexOf('正在') === -1) ||
                      hasFuResult;
      if (hasResult) {
        done = true;
        // ★ Opus token 只在 Opus 分析完成時清除，不被標準分析誤刪
        // ★ followup_single token 只在追問結果完成時才清除
        var _ptType = localStorage.getItem('_jy_paid_token_type');
        var _shouldClear = true;
        if (_ptType === 'opus_single' && !window._jyOpusDepth) _shouldClear = false;
        if (_ptType === 'followup_single' && !hasFuResult) _shouldClear = false;
        if (_shouldClear) {
          localStorage.removeItem('_jy_paid_token');
          localStorage.removeItem('_jy_paid_token_type');
        }
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
    if (crystalDiv.innerHTML.trim().length > 100) return;

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
          '<a href="https://tw.shp.ee/2n5Mo2w" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;gap:6px;padding:10px 20px;border-radius:10px;background:linear-gradient(135deg,rgba(201,168,76,.12),rgba(201,168,76,.05));color:var(--c-gold);text-decoration:none;font-size:.82rem;font-weight:600;border:1px solid rgba(201,168,76,.3)"><i class="fas fa-gem"></i> 看看 ' + found + '</a>' +
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
  //   v60-hotfix5：綠界 OrderResultURL 觸發時（有些用戶會從綠界點「回商店」按鈕）,
  //                統一走 _jyUnlockAndTrigger 流程（寫 token + 自動觸發 AI）
  //                舊版只寫 token + 顯示 banner 就結束 = 用戶看不到答案 = 付款流失主因

  function _checkPaymentReturn() {
    var params = new URLSearchParams(window.location.search);
    var paidTradeNo = params.get('paid');
    if (!paidTradeNo) return;

    // 立刻清掉 URL 參數避免重整重複觸發
    history.replaceState(null, '', window.location.pathname + window.location.hash);

    // 從 pending 拿 mode/type；若 pending 已被輪詢清掉，tradeNo 還在 localStorage 就不重跑
    var pending = null;
    try { pending = JSON.parse(localStorage.getItem('_jy_pending_payment') || 'null'); } catch(_) {}

    // 若 pending 已被主視窗輪詢處理掉 → 不重複觸發（避免連按兩次）
    if (!pending || !pending.tradeNo || pending.tradeNo !== paidTradeNo) {
      // 但 token 還是要確保寫入（防止輪詢沒跑到但綠界回跳成功的極罕見狀況）
      if (!localStorage.getItem('_jy_paid_token')) {
        localStorage.setItem('_jy_paid_token', paidTradeNo);
        localStorage.setItem('_jy_paid_token_type', 'single');
      }
      return;
    }

    // 停止輪詢避免雙觸發
    if (_jyPayPollTimer) { clearInterval(_jyPayPollTimer); _jyPayPollTimer = null; }
    // 走跟主視窗輪詢一樣的完整解鎖 + 觸發 AI 流程
    _jyUnlockAndTrigger();
  }

  // ═══ 8. 攔截所有入口按鈕（capturing phase，比 ui.js 的 handler 更早執行）═══

  function _interceptAllButtons() {
    document.addEventListener('click', function(e) {
      if (e._jyPayChecked) return;

      var btn = e.target.closest ? e.target.closest('button') : null;
      if (!btn) return;

      var mode = null;
      var icon = btn.querySelector('i');
      var iconClass = icon ? icon.className : '';
      var onclick = btn.getAttribute('onclick') || '';

      if (btn.id === 'btn-tarot-go') {
        mode = 'tarot_only';
      } else if (iconClass.indexOf('fa-hand-pointer') >= 0) {
        mode = 'tarot_only';
      }
      else if (onclick.indexOf('enterFullAnalysis') >= 0) {
        mode = 'full';
      } else if (onclick.indexOf('submitStep0Fast') >= 0) {
        mode = 'full';
      } else if (btn.id === 'btn-go') {
        mode = 'full';
      }

      if (!mode) return;

      // ── Admin / 確認訂閱中 → 放行（單次購買不放行，走 server check）──
      var isAdmin = !!(window._JY_ADMIN_TOKEN);
      var subExpires = parseInt(localStorage.getItem('_jy_sub_expires') || '0');
      var isSubscriber = subExpires > Date.now();
      if (isAdmin || isSubscriber) return;

      // ── 阻止原始 handler ──
      e.preventDefault();
      e.stopImmediatePropagation();

      // ── 打 Worker 檢查額度 ──
      var checkPayload = mode === 'tarot_only'
        ? { action: 'check', payload: { mode: 'tarot_only' } }
        : { action: 'check', payload: { mode: mode } };

      // ★ v43：附帶 session_token 讓 Worker 識別會員
      var st = window._JY_SESSION_TOKEN || '';
      if (!st) { try { st = localStorage.getItem('_jy_session') || ''; } catch(_e){} }
      if (st) checkPayload.session_token = st;

      // ★ v29：附帶 paid_token（單次購買 or 舊的訂閱 token）
      var pt = localStorage.getItem('_jy_paid_token');
      if (pt) checkPayload.paid_token = pt;

      fetch(WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(checkPayload)
      })
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (!data.allowed) {
          var existing = document.getElementById('jy-pay-modal');
          if (existing) existing.remove();
          var m = document.createElement('div');
          m.id = 'jy-pay-modal';
          m.style.cssText = 'position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.75);backdrop-filter:blur(6px)';
          m.innerHTML = _buildPaywallHTML(mode);
          m.addEventListener('click', function(ev) { if (ev.target === m) m.remove(); });
          document.body.appendChild(m);
        } else {
          // ★ v43：Worker 確認是會員 → 更新 localStorage（修復 _jy_sub_expires 未寫入的 race condition）
          if (data.subscription) {
            try { localStorage.setItem('_jy_sub_expires', String(Date.now() + 86400000 * 7)); } catch(_e){}
          }
          var newEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
          newEvent._jyPayChecked = true;
          btn.dispatchEvent(newEvent);
        }
      })
      .catch(function(err) {
        console.warn('[PayWall] check failed, allowing:', err);
        var newEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
        newEvent._jyPayChecked = true;
        btn.dispatchEvent(newEvent);
      });

    }, true);
  }

  // ═══ 初始化 ═══

  function _init() {
    _checkPaymentReturn();
    _injectPaidToken();
    _hijackUsedModals();
    _watchCrystalPanel();
    _killOldOverlayFlash();
    _interceptAllButtons();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _init);
  } else {
    _init();
  }

})();
