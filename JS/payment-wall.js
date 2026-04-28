// ═══════════════════════════════════════════════════════════════
// 💰 靜月之光 — 綠界付費牆 v3 (payment-wall.js)
// v64.B:定價對齊 worker.js v64.B(雙層會員 999/1999;單次標準 30/60/70 塔羅/開鑰/七維;深度 60/120/140;會員加購無折扣同訪客價)
// 載入位置：在 index.html 最底部（所有 JS 之後）
// ═══════════════════════════════════════════════════════════════

(function() {
  'use strict';

  var WORKER_URL = 'https://jy-ai-proxy.onerkk.workers.dev';

  // ═══ 定價：優先從 window.JY_PRICES（由 pricing-loader.js 從 worker /pricing 動態載入）讀取 ═══
  // 斷網或 pricing-loader 未載入時使用硬編保底值（與 worker.js v52 同步）
  function P() {
    // v62 修補：fallback 補齊額度欄位（向下對齊 worker /pricing 完整回應結構）
    //   原本只有定價，額度欄位散在 _buildPaywallHTML 各處用 || N 補，維護混亂
    //   pricing-loader 失敗時這裡是最後保命
    return (window.JY_PRICES && typeof window.JY_PRICES === 'object') ? window.JY_PRICES : {
      SUB_STANDARD: 999, SUB_PREMIUM: 1999,
      SINGLE_7D: 70, SINGLE_TAROT: 30, SINGLE_OOTK: 60,
      FOLLOWUP: 15,
      OPUS_7D: 140, OPUS_TAROT: 60, OPUS_OOTK: 120,
      OPUS_7D_MEMBER: 140, OPUS_TAROT_MEMBER: 60, OPUS_OOTK_MEMBER: 120,
      // 額度欄位（與 worker.js 第 44-52 行常數同步）
      TAROT_DAILY_STANDARD: 1, TAROT_DAILY_PREMIUM: 2,
      D7_MONTHLY_STANDARD: 2, D7_MONTHLY_PREMIUM: 5,
      OPUS_MONTHLY_PREMIUM: 1, OPUS_MONTHLY_STANDARD: 0,
      FREE_TRIAL_PER_TOOL: 1
    };
  }
  // 舊常數名保留給下面檔案後半段（付款流程、輪詢等）向下相容
  Object.defineProperty(window, '_jyPricesRef', { get: P, configurable: true });

  // 這些變數現在是 getter，永遠讀最新值
  function _PRICE_SUB()      { return P().SUB_STANDARD; }
  function _PRICE_SUB_PREM() { return P().SUB_PREMIUM; }
  function _PRICE_FU()       { return P().FOLLOWUP; }
  function _PRICE_OPUS_DEFAULT() { return P().OPUS_7D; }
  // 舊程式碼用到的常數名重導向（保留給第 48 行後的付款流程邏輯讀）
  var PRICE_SUB = 999;                    // 初始值，下方事件觸發後更新
  var PRICE_SINGLE = 79;
  var PRICE_OPUS = 140;  // v64.B 169→140
  var PRICE_SINGLE_FOLLOWUP = 15;  // v64.B 29→15
  function _syncLegacyConsts() {
    var p = P();
    PRICE_SUB = p.SUB_STANDARD;
    PRICE_SINGLE = p.SINGLE_7D;
    PRICE_OPUS = p.OPUS_7D;
    PRICE_SINGLE_FOLLOWUP = p.FOLLOWUP;
  }
  _syncLegacyConsts();
  // pricing-loader 抓到最新價時會派發這個事件 → 同步舊常數 → 下一次 openPaywall 自動用新價
  window.addEventListener('jy-pricing-updated', _syncLegacyConsts);

  // ═══ 1. 付費牆 HTML ═══

  function _buildPaywallHTML(mode) {
    // v60-hotfix7-c：同 _jyStartPayment，這裡也優先偵測實際當前工具
    //   ui.js 有多處直接呼叫 _buildPaywallHTML 傳寫死 mode，偵測到真實工具時以真實為準
    //   若是 mode 明確帶進來但 _detectCurrentTool 偵測失敗（三信號都沒命中），才用 mode 參數
    try {
      var _detectedMode = _detectCurrentTool();
      if (_detectedMode === 'tarot') _detectedMode = 'tarot_only';
      if (_detectedMode && _detectedMode !== mode) {
        // 只在偵測結果 ≠ 叫方傳的 mode 時 log，方便以後除錯
        console.warn('[Paywall] mode 偵測修正：叫方傳 "' + mode + '"，實際偵測為 "' + _detectedMode + '" → 以偵測為準');
        mode = _detectedMode;
      } else if (!mode && _detectedMode) {
        mode = _detectedMode;
      }
    } catch(_) {}
    if (!mode) mode = 'full';

    var p = P();  // 每次打開付費牆都拿最新價
    var PRICE_SUB_STANDARD = p.SUB_STANDARD;
    var PRICE_SUB_PREMIUM  = p.SUB_PREMIUM;
    var PRICE_SINGLE_FOLLOWUP = p.FOLLOWUP;

    // 依模式決定單次價 & 深度價
    var singlePrice = mode === 'full' ? p.SINGLE_7D
                    : (mode === 'tarot_only' ? p.SINGLE_TAROT : p.SINGLE_OOTK);
    var opusPriceNonMember = mode === 'full' ? p.OPUS_7D
                           : (mode === 'tarot_only' ? p.OPUS_TAROT : p.OPUS_OOTK);
    var opusPriceMember = mode === 'full' ? p.OPUS_7D_MEMBER
                        : (mode === 'tarot_only' ? p.OPUS_TAROT_MEMBER : p.OPUS_OOTK_MEMBER);
    var toolName = mode === 'full' ? '七維度' : (mode === 'tarot_only' ? '塔羅' : '開鑰');

    // 會員額度（來自 worker，預設與 worker v52 一致）
    var tarotDailyStandard  = p.TAROT_DAILY_STANDARD  || 1;
    var tarotDailyPremium   = p.TAROT_DAILY_PREMIUM   || 2;
    var d7MonthlyStandard   = p.D7_MONTHLY_STANDARD   || 2;
    var d7MonthlyPremium    = p.D7_MONTHLY_PREMIUM    || 5;
    var opusMonthlyPremium  = (typeof p.OPUS_MONTHLY_PREMIUM === 'number') ? p.OPUS_MONTHLY_PREMIUM : 1;

    return '<div style="max-width:360px;width:90%;background:linear-gradient(145deg,#1a0a0a,#2a1515);border:1.5px solid rgba(212,175,55,.35);border-radius:18px;padding:2rem 1.3rem;text-align:center;box-shadow:0 24px 80px rgba(0,0,0,.6);max-height:92vh;overflow-y:auto">' +
      '<div style="font-size:2.4rem;margin-bottom:.5rem;filter:drop-shadow(0 0 12px rgba(212,175,55,.3))">🌙</div>' +
      '<h3 style="color:var(--c-gold,#c9a84c);font-size:1.05rem;margin-bottom:.8rem;font-family:var(--f-display,serif)">靜月之光</h3>' +

      // ─── v64.B:會員制下架,只剩單次購買 ───
      //   舊會員仍能用(後端邏輯保留),但前端不再顯示開通入口
      //   訪客/到期會員看到的就是直接的單次購買區
      '<div style="font-size:.74rem;color:var(--c-text-dim,#a09880);line-height:1.7;margin-bottom:.6rem;padding:.6rem .8rem;border-radius:8px;background:rgba(212,175,55,.04);border:1px solid rgba(212,175,55,.12)">' +
        '一份解讀,一杯咖啡的價格。' +
      '</div>' +

      // ─── 單次購買按鈕 ───
      '<div style="display:flex;flex-direction:column;gap:.4rem;align-items:center">' +
        '<button onclick="_jyStartPayment(\'' + mode + '\',\'single\')" style="width:100%;padding:10px;border-radius:10px;background:linear-gradient(135deg,rgba(255,255,255,.06),rgba(255,255,255,.02));color:var(--c-text,#e8dcc8);font-size:.82rem;font-weight:600;border:1px solid rgba(255,255,255,.12);cursor:pointer;font-family:inherit">⚡ ' + toolName + '單次 NT$' + singlePrice + '</button>' +
        '<button onclick="_jyStartPayment(\'' + mode + '\',\'opus_single\')" style="width:100%;padding:10px;border-radius:10px;background:linear-gradient(135deg,rgba(147,51,234,.1),rgba(147,51,234,.04));color:#c084fc;font-size:.82rem;font-weight:600;border:1px solid rgba(147,51,234,.25);cursor:pointer;font-family:inherit">🔮 深度解析 NT$' + opusPriceNonMember + '</button>' +
        '<div style="font-size:.58rem;color:var(--c-text-muted,#7a7060);opacity:.75;line-height:1.5;margin-top:.1rem">單次僅限信用卡・含一次追問 NT$' + PRICE_SINGLE_FOLLOWUP + '</div>' +

        '<div style="display:flex;gap:.3rem;flex-wrap:wrap;justify-content:center;margin-top:.35rem">' +
          '<span style="font-size:.6rem;padding:.15rem .4rem;border-radius:5px;background:rgba(255,255,255,.05);color:var(--c-text-muted)">💳信用卡</span>' +
          '<span style="font-size:.6rem;padding:.15rem .4rem;border-radius:5px;background:rgba(255,255,255,.05);color:var(--c-text-muted)">🏧ATM</span>' +
          '<span style="font-size:.6rem;padding:.15rem .4rem;border-radius:5px;background:rgba(255,255,255,.05);color:var(--c-text-muted)">🏪超商</span>' +
        '</div>' +
        '<div style="font-size:.58rem;color:var(--c-text-muted);margin-top:.15rem;opacity:.5">ATM／超商僅限會員訂閱</div>' +
        '<div style="font-size:.58rem;color:var(--c-text-muted);margin-top:.1rem;opacity:.5">付款由綠界科技安全處理</div>' +

        '<button onclick="var m=document.getElementById(\'jy-pay-modal\');if(m){m.remove();return;} var p=this.closest(\'[style*=text-align]\');if(p)p.innerHTML=\'<div style=padding:1rem;text-align:center;color:var(--c-text-muted);font-size:.8rem>需要時隨時回來 🌙</div>\';" style="width:100%;padding:9px;border-radius:10px;background:transparent;color:var(--c-text-dim,#a09880);font-size:.75rem;border:1px solid rgba(255,255,255,.06);cursor:pointer;font-family:inherit;margin-top:.3rem">先不用，謝謝</button>' +
      '</div>' +
    '</div>';
  }

  // ═══ 2. 付款流程 ═══

  // v60-hotfix6 Bug H1：防止用戶連點付費按鈕建立多筆訂單
  //   原本無防護，快速連點會：第一次 fetch create-payment 還沒回，第二次又發，
  //   localStorage._jy_pending_payment 被後面那筆覆寫，前端追的是 tradeNo2，
  //   但用戶可能付的是 tradeNo1 → 前端查不到付款狀態 = 付了錢沒答案。
  //   修法：加 module-level flag，fetch 期間拒絕第二次點擊。
  var _jyPaymentInFlight = false;

  // v60-hotfix7-b：共用的「當前工具 mode 偵測」函式
  //   問題：ui.js 很多地方直接呼叫 _jyStartPayment('full') 寫死 mode，
  //         不管使用者當下在塔羅還是開鑰，都會叫出七維度付費牆。
  //   修法：不信任叫方傳的 mode，自己用多信號偵測當前工具；
  //         只在偵測不到才 fallback 到叫方傳的 mode。
  //   偵測優先順序：
  //     1. S._tarotOnlyMode + S.tarot.spreadType → 塔羅 or 開鑰
  //     2. window._pendingOOTK → 開鑰
  //     3. DOM #tool-X 的 .selected class → pickTool 設的
  function _detectCurrentTool() {
    try {
      // Signal 1: 塔羅 only 模式（開鑰底層也會設這個，所以要看 spreadType）
      if (window.S && window.S._tarotOnlyMode === true) {
        var _st = (window.S.tarot && window.S.tarot.spreadType) || '';
        if (_st === 'ootk' || window._pendingOOTK === true) return 'ootk';
        return 'tarot';
      }
      // Signal 2: 明確的開鑰旗標
      if (window._pendingOOTK === true ||
          (window.S && window.S.tarot && window.S.tarot.spreadType === 'ootk')) {
        return 'ootk';
      }
      // Signal 3: DOM .selected class
      var _elT = document.getElementById('tool-tarot');
      var _elO = document.getElementById('tool-ootk');
      var _elF = document.getElementById('tool-full');
      if (_elT && _elT.classList && _elT.classList.contains('selected')) return 'tarot';
      if (_elO && _elO.classList && _elO.classList.contains('selected')) return 'ootk';
      if (_elF && _elF.classList && _elF.classList.contains('selected')) return 'full';
    } catch(_) {}
    return null;
  }
  // 對外暴露，讓其他檔案（例如 ui.js、tool-guide.js 若需要）也能用
  window._jyDetectCurrentTool = _detectCurrentTool;

  // _jyStartPayment 的 mode 正規化：
  //   ui.js 可能傳 'tarot_only' / 'full' / 'ootk'
  //   _detectCurrentTool 回傳 'tarot' / 'full' / 'ootk'（塔羅是 tarot 不是 tarot_only）
  //   統一成 payment-wall 內部用的 'tarot_only' / 'full' / 'ootk'
  function _normalizeMode(m) {
    if (m === 'tarot') return 'tarot_only';
    if (m === 'tarot_only' || m === 'full' || m === 'ootk') return m;
    return null;
  }

  window._jyStartPayment = async function(mode, type) {
    // v60-hotfix7-b：優先以「實際當前工具」為準，ui.js 傳的 mode 只當 fallback
    var _detected = _normalizeMode(_detectCurrentTool());
    var _fromArg   = _normalizeMode(mode);
    mode = _detected || _fromArg || 'full';
    type = type || 'single';  // v64.B:會員制下架,預設改 single(訪客只能買單次)
    // v60-hotfix6：防連點
    if (_jyPaymentInFlight) {
      console.warn('[Payment] 已有付款建立中，忽略重複請求');
      return;
    }
    _jyPaymentInFlight = true;
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
      // v60-hotfix7-d：修正 session token 讀取（原本讀錯 key 名 _jy_session_token，
      //   全站正確 key 是 _jy_session；另外優先用 window._JY_SESSION_TOKEN（runtime 快取）
      //   跟攔截器第 800-801 行的邏輯統一，避免同個檔案裡兩種取法不一致
      var _st = window._JY_SESSION_TOKEN || '';
      if (!_st) { try { _st = localStorage.getItem('_jy_session') || ''; } catch(_e){} }

      var resp = await fetch(WORKER_URL + '/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: mode, type: type, session_token: _st })
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
        // v64.B:用動態價格表(避免 worker 改價後前端等待畫面顯示舊價)
        var _payPrices = P();
        var _payTier = (typeof window._jyGetUserTier === 'function') ? window._jyGetUserTier() : null;
        // Opus 顯示價：高級會員走 _MEMBER 加購價，否則走標準單次價
        var opusDisplayPrice;
        if (mode === 'tarot_only') {
          opusDisplayPrice = (_payTier === 'premium') ? _payPrices.OPUS_TAROT_MEMBER : _payPrices.OPUS_TAROT;
        } else if (mode === 'ootk') {
          opusDisplayPrice = (_payTier === 'premium') ? _payPrices.OPUS_OOTK_MEMBER : _payPrices.OPUS_OOTK;
        } else {
          opusDisplayPrice = (_payTier === 'premium') ? _payPrices.OPUS_7D_MEMBER : _payPrices.OPUS_7D;
        }
        // 單次顯示價：依 mode 取對應單次價
        var singleDisplayPrice =
          mode === 'tarot_only' ? _payPrices.SINGLE_TAROT :
          mode === 'ootk'       ? _payPrices.SINGLE_OOTK  :
                                  _payPrices.SINGLE_7D;
        // v62 修補：訂閱型分標準/高級顯示，避免高級會員看到 NT$999
        var _subLabel = (type === 'subscription_premium')
          ? '高級會員 NT$' + _payPrices.SUB_PREMIUM
          : '標準會員 NT$' + _payPrices.SUB_STANDARD;
        var labelText = type === 'opus_single' ? '深度解析 NT$' + opusDisplayPrice
                      : type === 'followup_single' ? '追問單次 NT$' + _payPrices.FOLLOWUP
                      : type === 'single' ? '單次解讀 NT$' + singleDisplayPrice
                      : _subLabel;
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
    } finally {
      // v60-hotfix6 Bug H1：無論成功失敗都清除 in-flight 旗標
      _jyPaymentInFlight = false;
    }
  };

  // v60-hotfix5：付款成功後自動觸發對應 AI 分析的共用函式
  //   key 理解：用戶付費時原頁面 state 仍在（S 物件、表單、本地分析結果都保留），
  //   只要直接呼叫對應的 _triggerXXX 函式即可重啟 AI 分析流程。不需儲存 payload。
  //   pending = { mode, type, tradeNo, ts }
  //   mode: 'full' | 'tarot_only' | 'ootk'
  //   type: 'single' | 'opus_single' | 'subscription' | 'subscription_premium' | 'followup_single'
  function _jyAutoTriggerAfterPayment(pending) {
    if (!pending) { console.warn('[Payment] auto-trigger: no pending'); return false; }
    var mode = pending.mode || 'full';
    var type = pending.type || 'single';
    console.log('[Payment] auto-trigger start, mode=' + mode + ', type=' + type);
    // 深度旗標：opus_single 一定是深度路徑，subscription 不是（會員可選）
    if (type === 'opus_single') {
      try { window._jyOpusDepth = true; } catch(_) {}
    }
    try {
      // followup_single 維持原邏輯（_jyCheckPaymentAndUnlock 內已處理）
      if (type === 'followup_single') { console.log('[Payment] auto-trigger: followup_single, skip'); return false; }
      // 訂閱型：reload 頁面（會員狀態已寫入，reload 後原表單還在）
      if (type === 'subscription' || type === 'subscription_standard' || type === 'subscription_premium') {
        console.log('[Payment] auto-trigger: subscription, skip (will reload)');
        return false;
      }
      // 單次 / Opus 單次：根據 mode 呼叫對應的 AI 觸發函式
      if (mode === 'tarot_only') {
        if (typeof window._triggerTarotAI === 'function') { console.log('[Payment] auto-trigger: calling window._triggerTarotAI'); window._triggerTarotAI(); return true; }
        if (typeof _triggerTarotAI === 'function') { console.log('[Payment] auto-trigger: calling _triggerTarotAI'); _triggerTarotAI(); return true; }
        console.warn('[Payment] auto-trigger: _triggerTarotAI not found');
      } else if (mode === 'ootk') {
        if (typeof window._triggerOOTKAI === 'function') { console.log('[Payment] auto-trigger: calling window._triggerOOTKAI'); window._triggerOOTKAI(); return true; }
        if (typeof window._ootkTriggerAI === 'function') { console.log('[Payment] auto-trigger: calling window._ootkTriggerAI'); window._ootkTriggerAI(); return true; }
        console.warn('[Payment] auto-trigger: ootk trigger not found');
      } else {
        // mode === 'full' 或其他 → 七維度
        if (typeof window._triggerAIDeep === 'function') { console.log('[Payment] auto-trigger: calling window._triggerAIDeep'); window._triggerAIDeep(); return true; }
        if (typeof _triggerAIDeep === 'function') { console.log('[Payment] auto-trigger: calling _triggerAIDeep'); _triggerAIDeep(); return true; }
        console.warn('[Payment] auto-trigger: _triggerAIDeep not found');
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

  // ═══════════════════════════════════════════════════════════════
  // v64.C:統一的付款結果 UI(回跳必顯,絕不靜默)
  // ═══════════════════════════════════════════════════════════════
  // 三種使用情境:
  //   1. 已確認付款 + 能 auto-trigger AI (_jyUnlockAndTrigger 主流程):pending 有效 → 走原邏輯
  //   2. 已確認付款 + 無法 auto-trigger:顯示綠卡(購買項目+剩餘次數+繼續按鈕)
  //   3. 用戶手動回來但未付款(ClientBackURL 點返回但沒付):顯示橘卡(等待確認+重新驗證按鈕)
  //
  // 用法:
  //   _jyShowPaymentResultCard(tradeNo, { paid: true, mode, type })   // 場景 2
  //   _jyShowPaymentResultCard(tradeNo, { paid: false })              // 場景 3
  // ───────────────────────────────────────────────────────────────
  async function _jyShowPaymentResultCard(tradeNo, opts) {
    opts = opts || {};

    // 移除舊卡(避免重複)
    var existing = document.getElementById('jy-paid-retry-card');
    if (existing) existing.remove();

    // ── 場景 3:未付款 / 不確定 → 橘卡讓用戶重新驗證 ──
    if (!opts.paid) {
      var pendingCard = document.createElement('div');
      pendingCard.id = 'jy-paid-retry-card';
      pendingCard.style.cssText = 'position:fixed;top:60px;left:50%;transform:translateX(-50%);z-index:99998;max-width:90%;width:340px;background:linear-gradient(145deg,#3a2818,#2a1810);border:1.5px solid rgba(251,191,36,.45);border-radius:14px;padding:1.1rem 1rem;text-align:center;box-shadow:0 12px 40px rgba(0,0,0,.5)';
      pendingCard.innerHTML =
        '<div style="font-size:1.6rem;margin-bottom:.4rem">⏳</div>' +
        '<div style="font-size:1rem;color:#fbbf24;font-weight:700;margin-bottom:.4rem">等待付款確認</div>' +
        '<div style="font-size:.78rem;color:#fde68a;line-height:1.6;margin-bottom:.9rem">系統還沒收到綠界的付款通知。如果你剛完成付款,請等幾秒後按下方按鈕重新驗證。</div>' +
        '<button onclick="window._jyManualVerifyPayment(\'' + tradeNo + '\')" style="width:100%;padding:12px;border-radius:10px;background:linear-gradient(135deg,rgba(251,191,36,.8),rgba(217,151,56,.9));color:#1a0a0a;font-size:.92rem;font-weight:700;border:none;cursor:pointer;font-family:inherit">🔄 重新驗證付款</button>' +
        '<button onclick="document.getElementById(\'jy-paid-retry-card\').remove()" style="width:100%;padding:8px;margin-top:.5rem;border-radius:10px;background:transparent;color:#fde68a;font-size:.78rem;border:none;cursor:pointer;font-family:inherit;opacity:.7">關閉</button>';
      document.body.appendChild(pendingCard);

      // 提供手動驗證函式
      window._jyManualVerifyPayment = async function(tNo) {
        var btn = document.querySelector('#jy-paid-retry-card button');
        if (btn) { btn.disabled = true; btn.textContent = '驗證中...'; }
        try {
          var r = await fetch(WORKER_URL + '/check-payment', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tradeNo: tNo })
          });
          var d = await r.json();
          if (d.paid) {
            // 付款已成立 → 走完整解鎖
            var card = document.getElementById('jy-paid-retry-card');
            if (card) card.remove();
            // v64.F BUG #4 修補:優先用 server 回的真實 type/toolMode,localStorage 為 fallback
            //   清快取場景下 _jy_last_paid 不見,server 回的才是真實資料
            var _finalMode = 'full', _finalType = 'single';
            try {
              var _lp = JSON.parse(localStorage.getItem('_jy_last_paid') || 'null');
              if (_lp && _lp.tradeNo === tNo) {
                if (_lp.mode) _finalMode = _lp.mode;
                if (_lp.type) _finalType = _lp.type;
              }
            } catch(_){}
            // server 覆蓋(權威來源)
            if (d.type) _finalType = d.type;
            if (d.toolMode) _finalMode = d.toolMode;
            try {
              localStorage.setItem('_jy_pending_payment', JSON.stringify({
                tradeNo: tNo, mode: _finalMode, type: _finalType, ts: Date.now()
              }));
            } catch(_){}
            await _jyUnlockAndTrigger();
          } else {
            if (btn) { btn.disabled = false; btn.textContent = '🔄 重新驗證付款'; }
            alert('系統仍未收到付款通知,請再等 30 秒後重試。\n如果已從綠界完成付款卻一直無法驗證,請聯繫客服。');
          }
        } catch(e) {
          if (btn) { btn.disabled = false; btn.textContent = '🔄 重新驗證付款'; }
          alert('驗證失敗:' + (e.message || '請稍後再試'));
        }
      };
      return;
    }

    // ── 場景 2:已確認付款 → 綠卡顯示購買項目 + 剩餘次數 + 繼續按鈕 ──
    var mode = opts.mode || 'full';
    var type = opts.type || 'single';

    // 購買項目文字
    var _P = (typeof P === 'function') ? P() : (window.JY_PRICES || {});
    var purchaseText = '解讀服務';
    if (type === 'opus_single') {
      var opusPriceMap = { tarot_only: _P.OPUS_TAROT, ootk: _P.OPUS_OOTK, full: _P.OPUS_7D };
      var opusName = mode === 'tarot_only' ? '塔羅深度解析' : mode === 'ootk' ? '開鑰深度解析' : '七維度深度解析';
      purchaseText = '🔮 ' + opusName + ' NT$' + (opusPriceMap[mode] || '-');
    } else if (type === 'single') {
      var singlePriceMap = { tarot_only: _P.SINGLE_TAROT, ootk: _P.SINGLE_OOTK, full: _P.SINGLE_7D };
      var singleName = mode === 'tarot_only' ? '塔羅單次' : mode === 'ootk' ? '開鑰單次' : '七維度單次';
      purchaseText = '✨ ' + singleName + ' NT$' + (singlePriceMap[mode] || '-');
    } else if (type === 'followup_single') {
      purchaseText = '💬 追問單次 NT$' + (_P.FOLLOWUP || 15);
    } else if (type === 'subscription' || type === 'subscription_standard') {
      purchaseText = '👑 標準會員 30 天 NT$' + (_P.SUB_STANDARD || 999);
    } else if (type === 'subscription_premium') {
      purchaseText = '💎 高級會員 30 天 NT$' + (_P.SUB_PREMIUM || 1999);
    }

    // 繼續按鈕文字
    var continueLabel = '🌙 繼續七維度解讀 →';
    if (mode === 'tarot_only') continueLabel = '🃏 繼續塔羅解讀 →';
    else if (mode === 'ootk') continueLabel = '🔑 繼續開鑰解讀 →';

    // 先建卡(配額位置先顯示「載入中」,稍後填入)
    var retryCard = document.createElement('div');
    retryCard.id = 'jy-paid-retry-card';
    retryCard.style.cssText = 'position:fixed;top:60px;left:50%;transform:translateX(-50%);z-index:99998;max-width:90%;width:340px;background:linear-gradient(145deg,#1a3020,#0f2015);border:1.5px solid rgba(34,197,94,.45);border-radius:14px;padding:1.1rem 1rem;text-align:center;box-shadow:0 12px 40px rgba(0,0,0,.5)';
    retryCard.innerHTML =
      '<div style="font-size:1.6rem;margin-bottom:.4rem">✅</div>' +
      '<div style="font-size:1rem;color:#86efac;font-weight:700;margin-bottom:.3rem">付款成功</div>' +
      '<div style="font-size:.85rem;color:#d1fae5;font-weight:600;margin-bottom:.4rem">' + purchaseText + '</div>' +
      '<div id="jy-paid-card-quota" style="font-size:.72rem;color:#a7f3d0;line-height:1.5;margin-bottom:.9rem;padding:.5rem;background:rgba(34,197,94,.08);border-radius:8px">載入剩餘次數中…</div>' +
      '<button onclick="window._jyContinueAfterPay && window._jyContinueAfterPay()" style="width:100%;padding:12px;border-radius:10px;background:linear-gradient(135deg,rgba(34,197,94,.8),rgba(22,163,74,.9));color:#fff;font-size:.92rem;font-weight:700;border:none;cursor:pointer;font-family:inherit">' + continueLabel + '</button>' +
      '<button onclick="document.getElementById(\'jy-paid-retry-card\').remove()" style="width:100%;padding:8px;margin-top:.5rem;border-radius:10px;background:transparent;color:#6ee7b7;font-size:.78rem;border:none;cursor:pointer;font-family:inherit;opacity:.7">稍後手動繼續</button>';
    document.body.appendChild(retryCard);

    // 註冊「繼續」函式(每次都覆寫,避免上一次付款的 mode 殘留)
    window._jyContinueAfterPay = function() {
      var el = document.getElementById('jy-paid-retry-card');
      if (el) el.remove();
      var toolKey = mode === 'tarot_only' ? 'tarot' : mode === 'ootk' ? 'ootk' : 'full';
      try {
        if (typeof window.pickTool === 'function') window.pickTool(toolKey);
        else if (typeof pickTool === 'function') pickTool(toolKey);
        else {
          var toolId = mode === 'tarot_only' ? 'tool-tarot' : mode === 'ootk' ? 'tool-ootk' : 'tool-full';
          var tile = document.getElementById(toolId);
          if (tile && typeof tile.click === 'function') tile.click();
        }
        setTimeout(function() {
          var q = document.getElementById('q-text') || document.getElementById('input-question') || document.getElementById('tool-cta');
          if (q && q.scrollIntoView) q.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 400);
      } catch(err) {
        try { alert('付款成功!請手動點上方的工具圖示繼續。'); } catch(_){}
      }
    };

    // 背景拉剩餘次數
    try {
      var _st = window._JY_SESSION_TOKEN || '';
      var _body = _st ? { session_token: _st } : {};
      var r = await fetch(WORKER_URL + '/check-subscription', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(_body)
      });
      var d = await r.json();
      var quotaEl = document.getElementById('jy-paid-card-quota');
      if (!quotaEl) return;

      // v64.C:從 paidQuota(7 池配額)算當前購買對應的剩餘次數
      var lines = [];
      if (d.active) {
        // 會員身份顯示
        var tierName = d.tier === 'premium' ? '💎 高級會員' : '👑 標準會員';
        var daysLeft = Math.max(0, Math.ceil((d.expiresAt - Date.now()) / 86400000));
        lines.push('<div style="font-weight:700;color:#86efac;margin-bottom:.3rem">' + tierName + ' · ' + daysLeft + ' 天到期</div>');
        var tarotLeft = Math.max(0, (d.dailyLimit || 0) - (d.dailyUsed || 0));
        var d7Left = Math.max(0, (d.d7Limit || 0) - (d.d7Used || 0));
        lines.push('塔羅/開鑰今日剩 <strong>' + tarotLeft + '</strong> · 七維度本月剩 <strong>' + d7Left + '</strong>');
      }
      // v64.C:單次購買配額(會員/非會員都看)
      var pq = d.paidQuota || {};
      // 算這次購買對應的 quota key
      var _qkey = '';
      if (type === 'opus_single') {
        _qkey = (mode === 'tarot_only') ? 'tarot_opus' : (mode === 'ootk') ? 'ootk_opus' : '7d_opus';
      } else if (type === 'single') {
        _qkey = (mode === 'tarot_only') ? 'tarot_std' : (mode === 'ootk') ? 'ootk_std' : '7d_std';
      } else if (type === 'followup_single') {
        _qkey = 'fu';
      }
      if (_qkey && pq[_qkey]) {
        var q = pq[_qkey];
        var used = parseInt(q.u || 0);
        var lim = parseInt(q.l || 0);
        var remain = Math.max(0, lim - used);
        var qLabel = {
          '7d_std': '七維標準', '7d_opus': '七維深度',
          'tarot_std': '塔羅標準', 'tarot_opus': '塔羅深度',
          'ootk_std': '開鑰標準', 'ootk_opus': '開鑰深度',
          'fu': '追問加購'
        }[_qkey] || _qkey;
        lines.push('<div style="font-weight:700;color:#86efac;margin-top:' + (lines.length ? '.3rem' : '0') + '">✓ ' + qLabel + ' 已開通</div>');
        lines.push('剩餘 <strong>' + remain + '</strong> 次(已用 ' + used + ' / 上限 ' + lim + ')');
      } else if (lines.length === 0) {
        // 沒抓到對應配額(可能 webhook 還沒處理完),fallback
        lines.push('✓ 付款已收到,點下方按鈕繼續即可使用');
      }
      quotaEl.innerHTML = lines.join('<br>');
    } catch(e) {
      var quotaEl2 = document.getElementById('jy-paid-card-quota');
      if (quotaEl2) quotaEl2.innerHTML = '✓ 付款已收到,點下方按鈕繼續即可使用';
    }
  }

  // v60-hotfix5:實際執行「寫 token → 觸發 AI」的核心邏輯(自動輪詢和手動按按鈕共用)
  async function _jyUnlockAndTrigger() {
    var pending = null;
    try { pending = JSON.parse(localStorage.getItem('_jy_pending_payment') || 'null'); } catch(_) {}
    // v60-hotfix7-f：多分頁 race 防呆
    //   場景：付款開新分頁 A，原分頁 B 輪詢；A 付完先跑 _jyUnlockAndTrigger 會 removeItem pending；
    //   B 切回來、輪詢或 _checkPaymentReturn 觸發時找不到 pending，結果沒解鎖、沒寫 token
    //   修法：若 pending 是空的，從備份 _jy_last_paid 還原（備份在下面 write token 時存）
    if (!pending) {
      try {
        var _bak = JSON.parse(localStorage.getItem('_jy_last_paid') || 'null');
        // 備份 1 小時內有效（避免拿到很舊的資料）
        if (_bak && _bak.tradeNo && _bak.ts && (Date.now() - _bak.ts < 3600000)) {
          pending = _bak;
        }
      } catch(_){}
    }
    if (!pending || !pending.tradeNo) {
      console.error('[Payment] pending 是空的 or 沒 tradeNo, pending:', pending);
      return false;
    }
    // v60-hotfix7-f：先寫備份（_jy_last_paid），讓別的分頁/下次呼叫能還原
    try {
      localStorage.setItem('_jy_last_paid', JSON.stringify({
        tradeNo: pending.tradeNo, mode: pending.mode, type: pending.type, ts: Date.now()
      }));
    } catch(_){}
    // 寫 token
    try {
      localStorage.setItem('_jy_paid_token', pending.tradeNo);
      localStorage.setItem('_jy_paid_token_type', pending.type || 'single');
      localStorage.setItem('_jy_paid_token_at', String(Date.now()));  // v64.B-bugfix:寫入時間戳供除錯/驗證
      _jyLog('SET paid_token', { token: pending.tradeNo, type: pending.type, ts: Date.now() });
    } catch(e){
      _jyLog('SET paid_token FAILED', { error: e.message });
    }
    if (pending.type !== 'single' && pending.type !== 'opus_single' && pending.type !== 'followup_single') {
      // ★ Bug #9 fix: 之前寫死 now+30d，但 worker 端是「舊到期日+30d」累積邏輯
      //   前端少算實際剩餘天數，造成前端判斷會員狀態跟後端不同步
      //   修法：先樂觀寫 +30d 作為 fallback，然後立刻向 worker /sub-status 拿真實 expiresAt 同步
      //   （worker 端配套：新增 /sub-status POST 端點回傳 isActive/tier/expiresAt）
      localStorage.setItem('_jy_sub_expires', String(Date.now() + 86400000 * 30));
      // 同步從 worker 拿真實 expiresAt（背景進行，不阻塞 UI）
      try {
        var _sessTok = window._JY_SESSION_TOKEN || '';
        var _workerUrl = (typeof AI_WORKER_URL !== 'undefined') ? AI_WORKER_URL : 'https://jy-ai-proxy.onerkk.workers.dev';
        // /sub-status 是新增端點；舊版 worker 沒有的話會 404，但因為前面已經寫了 fallback，不影響
        if (_sessTok) {
          fetch(_workerUrl + '/sub-status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ session_token: _sessTok })
          }).then(function(r){
            if (!r.ok) return null;
            return r.json();
          }).then(function(d){
            if (d && d.expiresAt) {
              try { localStorage.setItem('_jy_sub_expires', String(d.expiresAt)); } catch(_) {}
            }
          }).catch(function(){});
        }
      } catch(_e) {}
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
        // v64.F BUG #6 修補:followup UI 還原 retry 機制
        //   原本只試一次,若 tarot-followup-area 元素還沒出現(極罕見:用戶付款返回時頁面尚在 loading)
        //   → followup UI 沒重建 → 用戶要手動點按鈕才能繼續
        //   修法:retry 3 次,每次 500ms,涵蓋頁面 loading / DOM 慢產生等場景
        var _fuRetryCount = 0;
        var _fuMaxRetries = 3;
        var _restoreFollowupUI = function() {
          try {
            var _fuA = document.getElementById('tarot-followup-area');
            if (_fuA && typeof _appendFollowUpUI === 'function') {
              var _srcMode = _fuA.getAttribute('data-source') || 'tarot';
              var _parent = _fuA.parentNode;
              _fuA.remove();
              _appendFollowUpUI(_parent, _srcMode);
              var _newFuA = document.getElementById('tarot-followup-area');
              if (_newFuA) _newFuA.scrollIntoView({ behavior: 'smooth', block: 'center' });
              console.log('[Payment] followup UI 還原成功 (retry=' + _fuRetryCount + ')');
              return true;
            } else {
              // 元素不存在或函式還沒 ready → retry
              _fuRetryCount++;
              if (_fuRetryCount < _fuMaxRetries) {
                console.log('[Payment] followup UI 還原延後重試 (retry=' + _fuRetryCount + '/' + _fuMaxRetries + ')');
                setTimeout(_restoreFollowupUI, 500);
              } else {
                console.warn('[Payment] followup UI 還原失敗:重試已達上限,用戶需手動點抽補充牌');
              }
              return false;
            }
          } catch(_e) {
            console.warn('[Payment] fu UI restore failed:', _e);
            _fuRetryCount++;
            if (_fuRetryCount < _fuMaxRetries) setTimeout(_restoreFollowupUI, 500);
            return false;
          }
        };
        _restoreFollowupUI();
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
      // v64.C:auto-trigger 失敗 → 走統一的成功 UI(顯示購買項目+剩餘次數+繼續按鈕)
      console.warn('[Payment] auto trigger returned false, 顯示統一成功卡');
      _jyShowPaymentResultCard(pending.tradeNo, {
        paid: true, mode: pending.mode || 'full', type: pending.type || 'single'
      });
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

          // v60-hotfix7-c：排除 tool-guide.js 的狀態提示（它會顯示「☽ 免費已用完・會員...」
          //   只是給使用者看的狀態文字，不是要觸發付費牆。之前誤攔截 → 工具選擇畫面也被塞付費牆）
          var _isGuideText = false;
          try {
            if (node.id === 'jy-trial-line' || node.id === 'jy-tool-guide-panel') _isGuideText = true;
            else if (node.closest) {
              if (node.closest('#jy-trial-line') || node.closest('#jy-tool-guide-panel')) _isGuideText = true;
            }
          } catch(_) {}
          if (_isGuideText) continue;

          // ai-deep-wrap 裡的額度已用完
          if (txt.indexOf('免費') >= 0 && (txt.indexOf('已用完') >= 0 || txt.indexOf('已用盡') >= 0)) {
            var wrap = node.closest('#ai-deep-wrap') || node.closest('#ai-deep-result') || node.parentElement;
            if (wrap) {
              // v60-hotfix7-c：依實際工具 mode 顯示，不再寫死 full
              var _m = _detectCurrentTool();
              if (_m === 'tarot') _m = 'tarot_only';
              if (!_m) _m = 'full'; // 偵測不到才退回 full
              setTimeout(function() {
                wrap.innerHTML = '<div style="text-align:center;padding:1.5rem">' + _buildPaywallHTML(_m) + '</div>';
              }, 30);
              return;
            }
          }

          // 429 「今天這題已看過」或七維度月度用完
          if (txt.indexOf('今天這題已看過') >= 0 || txt.indexOf('月度配額') >= 0 || txt.indexOf('七維度配額') >= 0) {
            var p = node.closest('#ai-deep-result') || node.closest('#ai-deep-wrap');
            if (p) {
              // v60-hotfix7-c：「七維度配額」「月度配額」明確是七維度，其他也依偵測
              var _m2 = (txt.indexOf('七維度') >= 0 || txt.indexOf('月度配額') >= 0) ? 'full' : _detectCurrentTool();
              if (_m2 === 'tarot') _m2 = 'tarot_only';
              if (!_m2) _m2 = 'full';
              setTimeout(function() {
                p.innerHTML = '<div style="text-align:center;padding:1.5rem">' + _buildPaywallHTML(_m2) + '</div>';
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
  //   v64.B-final:全面重寫 — 不再依賴 DOM 文字偵測
  //   架構:
  //     - fetch hook 動態讀 token + 注入 body
  //     - 「AI fetch 200 OK」是清 token 的權威信號(不再用 MutationObserver 偵測 DOM)
  //     - opus/fu/single 三種 token 各自只在對應 fetch 成功時清除
  //     - 60 秒安全網 fallback(極罕見 fetch 沒抓到的邊界)

  function _injectPaidToken() {
    // 重複呼叫保護 — fetch 不可被多層包裝
    if (window._jyFetchHijacked) return;
    window._jyFetchHijacked = true;

    var _realFetch = window.fetch;
    var _aiFetchSuccessSeen = false;

    window.fetch = function(url, opts) {
      // ── 注入 token 到 AI fetch ──
      var _curToken = '';
      var _isAiFetch = false;
      var _isFollowUp = false;
      var _isOpusFetch = false;

      if (typeof url === 'string' && url.indexOf('jy-ai-proxy') >= 0 && opts && opts.body && typeof opts.body === 'string') {
        try { _curToken = localStorage.getItem('_jy_paid_token') || ''; } catch(_) {}
        if (_curToken) {
          try {
            var bodyObj = JSON.parse(opts.body);
            if (bodyObj.payload || bodyObj.action === 'check') {
              bodyObj.paid_token = _curToken;
              opts.body = JSON.stringify(bodyObj);
            }
          } catch(_) {}
        }
        // 識別 fetch 類型(用於後續清 token 判斷)
        try {
          var _b2 = JSON.parse(opts.body);
          _isAiFetch = !!(_b2.payload && !_b2.action);
          if (_isAiFetch && _b2.payload) {
            _isFollowUp = !!(_b2.payload.followUp || _b2.payload.mode === 'followup' || (_b2.payload.followup_index !== undefined && _b2.payload.followup_index >= 0));
            _isOpusFetch = !!(_b2.payload.depth === 'opus' || _b2.payload.useOpus || window._jyOpusDepth);
          }
        } catch(_) {}
      }

      var _respPromise = _realFetch.call(window, url, opts);

      // 只追蹤 AI fetch 的結果
      if (_isAiFetch) {
        _respPromise.then(function(resp) {
          if (!resp.ok) {
            // ── AI fetch 被 worker 拒絕 ──
            // 不清 token!保留給用戶重試
            resp.clone().json().then(function(errData) {
              _jyLog('AI REJECTED by worker', {
                status: resp.status,
                error: errData.error,
                code: errData.code,
                hadPaidToken: !!_curToken,
                paidTokenValue: _curToken,
                isFollowUp: _isFollowUp,
                isOpusFetch: _isOpusFetch
              });
            }).catch(function(){});
            return;
          }
          // ── AI fetch 200 OK = 權威「AI 真的跑完」信號 ──
          //   這是新邏輯的核心:用 fetch 結果取代 DOM 偵測
          //   - 不會被 banner/loading/水晶處方/錯誤頁誤觸發
          //   - 不會被未來改文字打破
          //   - 失敗時自動保留 token 給用戶重試
          _aiFetchSuccessSeen = true;
          _jyLog('AI request OK', {
            status: resp.status,
            isFollowUp: _isFollowUp,
            isOpusFetch: _isOpusFetch
          });

          // ── 清 token 邏輯(精準對應 token 類型) ──
          var _ptType = localStorage.getItem('_jy_paid_token_type');
          if (!_ptType) return;  // 沒 token 不用清

          var _shouldClear = false;

          if (_ptType === 'followup_single') {
            // 追問 token 只在追問 fetch 成功時清
            if (_isFollowUp) _shouldClear = true;
          } else if (_ptType === 'opus_single') {
            // Opus token 只在深度 fetch 成功時清
            if (_isOpusFetch) _shouldClear = true;
          } else if (_ptType === 'single') {
            // 單次標準 token,首輪 fetch 成功就清(不能用於追問)
            if (!_isFollowUp) _shouldClear = true;
          } else {
            // 訂閱類型(subscription/subscription_premium)— 不清 single token
            // 訂閱靠 worker sub:{userKey} 認證,paid_token 用過即丟
            _shouldClear = true;
          }

          if (_shouldClear) {
            _jyLog('CLEAR paid_token (fetch-based)', {
              token: localStorage.getItem('_jy_paid_token'),
              type: _ptType,
              reason: 'AI fetch 200 OK',
              isFollowUp: _isFollowUp,
              isOpusFetch: _isOpusFetch
            });
            try {
              localStorage.removeItem('_jy_paid_token');
              localStorage.removeItem('_jy_paid_token_type');
              localStorage.removeItem('_jy_paid_token_at');
            } catch(_){}
            // v64.F BUG #5 修補:Opus 單次解讀完成 → reset window._jyOpusDepth
            //   原本 _jyAutoTriggerAfterPayment 設 _jyOpusDepth=true 後從不重設
            //   邊界 case:用戶買 Opus 七維 → 解讀完 5 分鐘後再次免費跑七維
            //              → fetch 攔截器看到 _jyOpusDepth=true 誤判為 Opus
            //              → 60 秒安全網誤清 token(若有的話)
            //   修法:Opus token 清掉時(代表 Opus 解讀已完成)同步 reset depth flag
            if (_ptType === 'opus_single' && _isOpusFetch) {
              try { window._jyOpusDepth = false; } catch(_) {}
              _jyLog('RESET _jyOpusDepth', { reason: 'opus single fetch completed' });
            }
          }
        }).catch(function(err){
          // 網路錯誤等(fetch 本身失敗,不是 worker 拒絕)— 不清 token
          _jyLog('AI fetch network error', { error: String(err).slice(0, 200) });
        });
      }
      return _respPromise;
    };

    // ── 60 秒安全網(極罕見邊界) ──
    //   如果 60 秒內有 AI fetch 成功但 token 沒清(理論上不該發生),強清
    //   60 秒內沒成功的 → 保留 token 給用戶重試(這正是新架構的優勢)
    setTimeout(function() {
      if (_aiFetchSuccessSeen && localStorage.getItem('_jy_paid_token')) {
        _jyLog('CLEAR paid_token (60s safety net)', {
          token: localStorage.getItem('_jy_paid_token'),
          type: localStorage.getItem('_jy_paid_token_type'),
          reason: 'fetch ok seen but token still here'
        });
        try {
          localStorage.removeItem('_jy_paid_token');
          localStorage.removeItem('_jy_paid_token_type');
          localStorage.removeItem('_jy_paid_token_at');
        } catch(_){}
      }
    }, 60000);
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

  async function _checkPaymentReturn() {
    var params = new URLSearchParams(window.location.search);
    var paidTradeNo = params.get('paid');
    if (!paidTradeNo) return;

    // v60-hotfix7-g：診斷 log（生產環境也留著，只在付款回跳時印，頻率低）
    console.log('[Payment] 偵測到 ?paid=' + paidTradeNo + ' 回跳');

    // 立刻清掉 URL 參數避免重整重複觸發
    history.replaceState(null, '', window.location.pathname + window.location.hash);

    // 從 pending 拿 mode/type；若 pending 已被輪詢清掉，tradeNo 還在 localStorage 就不重跑
    var pending = null;
    try { pending = JSON.parse(localStorage.getItem('_jy_pending_payment') || 'null'); } catch(_) {}
    console.log('[Payment] pending:', pending);

    // ── pending 不匹配:可能是輪詢已處理 / 多分頁 / ClientBackURL 手動回來 / 跨裝置 ──
    // v64.C:不再靜默 — 必定顯示 UI 給用戶看到「付款成功還是失敗」
    if (!pending || !pending.tradeNo || pending.tradeNo !== paidTradeNo) {
      console.log('[Payment] pending 不匹配,走查證 + 顯示 UI 流程');

      // 先查 worker 確認這個 tradeNo 到底有沒有付款成立 + 拿真實 mode/type/toolMode
      var _verifiedPaid = false;
      var _serverType = null;
      var _serverToolMode = null;
      try {
        var vr = await fetch(WORKER_URL + '/check-payment', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tradeNo: paidTradeNo })
        });
        var vd = await vr.json();
        _verifiedPaid = !!vd.paid;
        _serverType = vd.type || null;          // v64.F BUG #4:server 回的真實 type
        _serverToolMode = vd.toolMode || null;  // v64.F BUG #4:server 回的真實 toolMode
      } catch(e) {
        console.warn('[Payment] check-payment 失敗:', e);
      }

      // v64.F BUG #4 修補:優先順序為 server > localStorage > hard-coded
      //   原本只看 _jy_last_paid,清快取後就回 hard-coded 'full'/'single'(NT$80)
      //   邊界 case:用戶買 Opus 七維 NT$140 後清快取返回 → 顯示卡片寫成 NT$80(配額是對的,只是顯示錯)
      //   修法:先用 server 回的真實資料,server 沒給才退 localStorage,再沒才用 hard-coded
      var _restoredMode = 'full', _restoredType = 'single';
      // 第一順位:_jy_last_paid(因為這是用戶實際下單的記錄)
      try {
        var _lp = JSON.parse(localStorage.getItem('_jy_last_paid') || 'null');
        if (_lp && _lp.tradeNo === paidTradeNo) {
          if (_lp.mode) _restoredMode = _lp.mode;
          if (_lp.type) _restoredType = _lp.type;
        }
      } catch(_){}
      // 第二順位(覆蓋):server 回的真實資料(清快取場景下這是唯一來源)
      if (_serverType) _restoredType = _serverType;
      if (_serverToolMode) _restoredMode = _serverToolMode;

      if (_verifiedPaid) {
        // ── 已付款:寫 token 並顯示成功 UI(含購買項目+剩餘次數) ──
        if (!localStorage.getItem('_jy_paid_token')) {
          localStorage.setItem('_jy_paid_token', paidTradeNo);
          localStorage.setItem('_jy_paid_token_type', _restoredType);
          localStorage.setItem('_jy_paid_token_at', String(Date.now()));
          console.log('[Payment] token 已備援寫入: ' + paidTradeNo + ' type=' + _restoredType + ' mode=' + _restoredMode + ' (server-verified)');
        }
        await _jyShowPaymentResultCard(paidTradeNo, {
          paid: true, mode: _restoredMode, type: _restoredType
        });
      } else {
        // ── 未付款 / 不確定:顯示等待確認 UI(用戶可重新驗證) ──
        await _jyShowPaymentResultCard(paidTradeNo, { paid: false });
      }
      return;
    }

    // 停止輪詢避免雙觸發
    if (_jyPayPollTimer) { clearInterval(_jyPayPollTimer); _jyPayPollTimer = null; }
    console.log('[Payment] pending 匹配，走完整解鎖流程');
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

      // v60-hotfix7 Bug 修復：
      //   原本用 btn.id / onclick 寫死判斷 mode，結果：
      //   - 塔羅用 pickTool('tarot')，按鈕 id 仍是 btn-go（只有罕見的純塔羅 flow 才會改成 btn-tarot-go）
      //   - 開鑰用 pickTool('ootk')，按鈕 id 也是 btn-go
      //   - 第 583 行 btn.id === 'btn-go' 就把塔羅/開鑰全部誤判為 full
      //   → 付費牆顯示「七維度單次 NT$70」而非「塔羅單次 NT$30」(v64.B 改價)
      //   修法：先讀 ui.js 的 window._selectedTool（真理來源），再 fallback 到原判斷
      //   _selectedTool 值: 'tarot' | 'ootk' | 'full'（pickTool 時寫入）

      // ── (A) 使用共用偵測函式（多信號）──
      var selectedTool = _detectCurrentTool();

      // 只有在「確實是三個工具 CTA 按鈕」的情況下才啟用攔截
      //   辨識 CTA 按鈕：btn-go / btn-tarot-go / onclick 含 enterFullAnalysis 或 submitStep0Fast / fa-hand-pointer 圖示
      var isToolCTA = false;
      if (btn.id === 'btn-go' || btn.id === 'btn-tarot-go') isToolCTA = true;
      else if (onclick.indexOf('enterFullAnalysis') >= 0) isToolCTA = true;
      else if (onclick.indexOf('submitStep0Fast') >= 0) isToolCTA = true;
      else if (iconClass.indexOf('fa-hand-pointer') >= 0) isToolCTA = true;

      if (!isToolCTA) return;

      // ── (B) mode 決定：_selectedTool 優先，fallback 到舊邏輯 ──
      if (selectedTool === 'tarot') {
        mode = 'tarot_only';
      } else if (selectedTool === 'ootk') {
        mode = 'ootk';
      } else if (selectedTool === 'full') {
        mode = 'full';
      } else {
        // _selectedTool 讀不到 → 退回舊邏輯
        if (btn.id === 'btn-tarot-go') mode = 'tarot_only';
        else if (iconClass.indexOf('fa-hand-pointer') >= 0) mode = 'tarot_only';
        else if (onclick.indexOf('enterFullAnalysis') >= 0) mode = 'full';
        else if (onclick.indexOf('submitStep0Fast') >= 0) mode = 'full';
        else if (btn.id === 'btn-go') mode = 'full'; // 最後保底
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
