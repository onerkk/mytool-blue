// ═══ v35b：工具指引 + 閃爍修正 + 試用倒數 + 增強回饋 ═══

// ════════════════════════════════════════
// 1. 閃爍修正
// ════════════════════════════════════════
(function(){
  var s = document.createElement('style');
  s.id = 'jy-flicker-fix';
  s.textContent = [
    '.jy-vignette{animation:none!important;opacity:.4!important;z-index:-1!important}',
    '.jy-stars{z-index:-1!important}',
    '.particles{z-index:-1!important}',
    '.jy-tool-card::after{display:none!important}',
    '.step.active{position:relative!important;z-index:1!important}',
    '#input-screen{position:relative!important;z-index:2!important;background:rgba(8,9,15,.97)!important;padding-bottom:2rem!important}',
    '#trust-preview{position:relative!important;z-index:2!important;background:rgba(8,9,15,.97)!important}',
    '#hook-screen{position:relative!important;z-index:2!important}',
    '#step-0.jy-input-active #jy-bg-slideshow{opacity:0!important;pointer-events:none!important}',
    '#step-0.jy-input-active .jy-bg-overlay{opacity:0!important}'
  ].join('\n');
  document.head.appendChild(s);
  document.addEventListener('DOMContentLoaded', function(){
    var v = document.querySelector('.jy-vignette');
    if(v){ v.style.cssText += ';animation:none!important;opacity:.4!important;z-index:-1!important'; }
    var st = document.querySelector('.jy-stars');
    if(st) st.style.zIndex = '-1';
    var pa = document.querySelector('.particles');
    if(pa) pa.style.zIndex = '-1';
  });
  var _flickObs = new MutationObserver(function(){
    var is = document.getElementById('input-screen');
    var step0 = document.getElementById('step-0');
    if(!is || !step0) return;
    if(is.style.display !== 'none' && is.offsetParent !== null){
      step0.classList.add('jy-input-active');
    } else {
      step0.classList.remove('jy-input-active');
    }
  });
  document.addEventListener('DOMContentLoaded', function(){
    var is = document.getElementById('input-screen');
    if(is) _flickObs.observe(is, {attributes:true, attributeFilter:['style']});
  });
})();

// ════════════════════════════════════════
// 2. 工具指引面板 + 試用/會員狀態
// ════════════════════════════════════════
(function(){
  function injectGuide() {
    if (document.getElementById('jy-tool-guide-panel')) return;
    var cta = document.getElementById('tool-cta');
    if (!cta || cta.offsetParent === null) return;
    var p = document.createElement('div');
    p.id = 'jy-tool-guide-panel';
    p.style.cssText = 'margin:.4rem 16px .6rem;padding:.55rem .7rem;border-radius:10px;background:rgba(212,175,55,.04);border:1px solid rgba(212,175,55,.1)';
    p.innerHTML =
      '<div style="font-size:.7rem;color:rgba(212,175,55,.6);font-weight:600;margin-bottom:.35rem">☽ 哪套適合你的問題？</div>' +
      '<div style="font-size:.66rem;line-height:1.7;color:#a09880">' +
        '<span style="color:rgba(139,92,246,.7);font-weight:600">塔羅快讀</span> → 問此刻「他怎麼想？」<br>' +
        '<span style="color:rgba(217,151,56,.7);font-weight:600">開鑰之法</span> → 問根源「為什麼卡住？」<br>' +
        '<span style="color:rgba(212,175,55,.7);font-weight:600">七維度</span> → 問全局「今年運勢？轉機？」' +
      '</div>' +
      '<div id="jy-trial-line" style="margin-top:.3rem;padding-top:.25rem;border-top:1px solid rgba(212,175,55,.06);font-size:.6rem;color:#8a7a6a;text-align:center">⏳</div>';
    cta.parentNode.insertBefore(p, cta);
    fetchTrialDays();
    // v60-hotfix10：順便更新三個工具徽章
    updateToolBadges();
  }

  // v60-hotfix10:根據用戶狀態動態更新三個工具徽章文字
  //   v64.C 全面改寫:加入 paid_quota 判斷
  //   狀態優先級(從高到低):
  //     1. 會員(有 active 訂閱) → 顯示會員配額
  //     2. 有單次購買配額(標準/深度任一) → 顯示「✓ N 次可用」
  //     3. 免費未用過 → 「免費體驗 1 次」
  //     4. 免費已用完 → 「單次 NT$XX」
  function updateToolBadges() {
    var url = (typeof AI_WORKER_URL !== 'undefined') ? AI_WORKER_URL : 'https://jy-ai-proxy.onerkk.workers.dev';
    var body = {};
    if (window._JY_SESSION_TOKEN) body.session_token = window._JY_SESSION_TOKEN;
    fetch(url.replace('/analyze','').replace(/\/$/, '') + '/check-subscription', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(body)
    })
      .then(function(r){ return r.json(); })
      .then(function(data){
        // v64.C:會員下架,只保留單次定價
        // v68.21 Bug #1 修:SINGLE_OOTK 60→70 對齊 worker
        var _p = (typeof window!=='undefined' && window._JY_PRICING) || {
          SINGLE_7D: 70, SINGLE_TAROT: 30, SINGLE_OOTK: 70
        };
        var _p7d = _p.SINGLE_7D || 70;
        var _pTarot = _p.SINGLE_TAROT || 30;
        var _pOotk = _p.SINGLE_OOTK || 70;

        // v64.C:讀單次購買配額(7 池)
        var pq = data.paidQuota || {};
        function _pqRemain(key) {
          var q = pq[key];
          if (!q) return 0;
          var u = parseInt(q.u || 0);
          var l = parseInt(q.l || 0);
          return Math.max(0, l - u);
        }

        // 會員(有 active 訂閱)
        if (data.active) {
          var isPremium = data.tier === 'premium';
          var dailyLim = data.dailyLimit || 1;
          var d7Lim = data.d7Limit || 2;
          var tierLabel = isPremium ? '💎 高級' : '👑 標準';
          var tarotBadge = tierLabel + '・每日 ' + (data.dailyUsed||0) + '/' + dailyLim + ' 次';
          var ootkBadge = tierLabel + '・每日 ' + (data.dailyUsed||0) + '/' + dailyLim + ' 次';
          var d7Badge = tierLabel + '・每月 ' + (data.d7Used||0) + '/' + d7Lim + ' 次';
          setBadge('tool-tarot-badge', tarotBadge, isPremium ? '#a855f7' : '#fbbf24');
          setBadge('tool-ootk-badge', ootkBadge, isPremium ? '#a855f7' : '#fbbf24');
          setBadge('tool-full-badge', d7Badge, isPremium ? '#a855f7' : '#fbbf24');
          return;
        }

        // 非會員:三工具各算「配額 + 免費」狀態
        var fs = data.freeStatus || { '7d': 0, tarot: 0, ootk: 0 };
        // v68.21 Bug #2 修:讀真實 freeLimits(後端 v68.19 已回傳),OOTK 預設 0 不再硬寫「免費 1 次」
        var fl = data.freeLimits || { '7d': 1, tarot: 1, ootk: 0 };

        // 通用組裝:依「配額」+「免費」+ 預設定價
        // v68.21 Bug #2 修:加 freeLimit 參數,讓 OOTK(=0) 不再 fallback 到「免費 1 次」
        function _compose(stdQ, opusQ, freeUsed, singlePrice, freeLimit) {
          var stdR = _pqRemain(stdQ);
          var opusR = _pqRemain(opusQ);
          // 1. 兩種配額都有
          if (stdR > 0 && opusR > 0) {
            return { txt: '✓ 標準 ' + stdR + ' + 深度 ' + opusR + ' 次', color: '#22c55e' };
          }
          // 2. 只有標準配額
          if (stdR > 0) {
            return { txt: '✓ 標準 ' + stdR + ' 次可用', color: '#22c55e' };
          }
          // 3. 只有深度配額
          if (opusR > 0) {
            return { txt: '✓ 深度 ' + opusR + ' 次可用', color: '#a855f7' };
          }
          // 4. 沒配額,看免費(v68.21:freeLimit=0 直接走「需付費解鎖」,不再誤顯示「免費 1 次」)
          if (freeLimit <= 0) {
            return { txt: '付費解鎖 NT$' + singlePrice, color: '#c084fc' };
          }
          if (freeUsed >= freeLimit) {
            return { txt: '單次 NT$' + singlePrice, color: 'rgba(212,175,55,.5)' };
          }
          return { txt: '免費體驗 ' + (freeLimit - freeUsed) + ' 次', color: '' };
        }

        var t = _compose('tarot_std', 'tarot_opus', fs.tarot, _pTarot, fl.tarot);
        var o = _compose('ootk_std', 'ootk_opus', fs.ootk, _pOotk, fl.ootk);
        var f = _compose('7d_std', '7d_opus', fs['7d'], _p7d, fl['7d']);
        setBadge('tool-tarot-badge', t.txt, t.color);
        setBadge('tool-ootk-badge', o.txt, o.color);
        setBadge('tool-full-badge', f.txt, f.color);
      })
      .catch(function(){
        // 失敗就維持 HTML 預設文字「免費體驗 1 次」,不動
      });
  }
  function setBadge(id, text, colorHint) {
    var el = document.getElementById(id);
    if (!el) return;
    el.textContent = text;
    if (colorHint) el.style.color = colorHint;
  }
  function fetchTrialDays() {
    var url = (typeof AI_WORKER_URL !== 'undefined') ? AI_WORKER_URL : 'https://jy-ai-proxy.onerkk.workers.dev';
    var body = { action: 'check', payload: { mode: 'full' } };
    var pt = localStorage.getItem('_jy_paid_token');
    if (pt) body.paid_token = pt;
    if (window._JY_SESSION_TOKEN) body.session_token = window._JY_SESSION_TOKEN;
    fetch(url, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) })
      .then(function(r){ return r.json(); })
      .then(function(data){
        var line = document.getElementById('jy-trial-line');
        if(!line) return;
        // v64.C:會員下架,改用配額制提示
        if(data.subscription && data.quotaType){
          var qt = data.quotaType === '7d_monthly' ? '七維度每月' : '塔羅每日';
          line.innerHTML = '☽ 會員・' + qt + ' ' + data.limit + ' 次(已用 ' + (data.used||0) + ' 次)';
          return;
        }
        if(data.paidQuota && data.paidQuota.remaining > 0){
          line.innerHTML = '☽ <span style="color:rgba(34,197,94,.85);font-weight:700">已購買 ' + data.paidQuota.remaining + ' 次</span>・本次可用';
          return;
        }
        if(data.paid){ line.innerHTML = '☽ 已付費・本次可用'; return; }
        var fl = data.freeUsesLeft;
        if(fl == null && data.code === 'FREE_USED_UP') fl = 0;
        if(fl != null){
          var color = fl <= 1 ? 'rgba(239,68,68,.8)' : 'rgba(212,175,55,.7)';
          line.innerHTML = fl > 0
            ? '☽ 免費體驗・還剩 <span style="color:'+color+';font-weight:700">'+fl+'</span> 次'
            : '☽ <span style="color:rgba(239,68,68,.8);font-weight:700">免費已用完</span>・單次購買繼續使用';
          return;
        }
        if(data.code === 'LOGIN_REQUIRED'){ line.innerHTML = '☽ 登入 Google 即享免費體驗'; return; }
        // v68.21 Bug #2 修:OOTK 沒免費,不再寫「三套各 1 次」
        line.innerHTML = '☽ 七維度・塔羅 各免費 1 次 ・ 開鑰需付費解鎖';
      })
      .catch(function(){ var l=document.getElementById('jy-trial-line'); if(l) l.innerHTML='☽ 免費體驗 1 次'; });
  }
  var _orig = window.pickTool;
  window.pickTool = function(tool) { if (_orig) _orig(tool); injectGuide(); };
  var _poll = setInterval(function() {
    var is = document.getElementById('input-screen');
    if (is && is.style.display !== 'none' && is.offsetParent !== null) { injectGuide(); clearInterval(_poll); }
  }, 500);
  setTimeout(function(){ clearInterval(_poll); }, 60000);

  // v60-hotfix12：工具選擇頁的徽章更新要獨立觸發（不能只靠 injectGuide）
  //   injectGuide 綁在 input-screen 出現時，但徽章在工具選擇頁就已經顯示。
  //   等策略：
  //     (1) DOMContentLoaded 時先嘗試——若 session_token 已就緒就更新
  //     (2) 延遲 1500ms 再更新一次——給 Google 登入/session 驗證完成的時間
  //     (3) 每次點「登入」按鈕後延遲 2000ms 再更新（徽章從「免費」變「會員」）
  //   只要 tool-tarot-badge 等元素存在就能更新，不需 input-screen 存在。
  function _tryUpdateBadges() {
    if (document.getElementById('tool-tarot-badge')) updateToolBadges();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _tryUpdateBadges);
  } else {
    _tryUpdateBadges();
  }
  // 延遲重試：確保 ui.js 把 session_token 設到 window 後再查一次
  setTimeout(_tryUpdateBadges, 1500);
  setTimeout(_tryUpdateBadges, 4000);
})();

// ════════════════════════════════════════
// 3. 增強回饋系統（覆蓋舊版）
// ════════════════════════════════════════
(function(){
  // 注入回饋面板樣式
  var fbStyle = document.createElement('style');
  fbStyle.textContent = [
    // ─────── 容器:深沉,微微浮起,七芒星淡背景 ───────
    '.jy-fb{margin:1.4rem 1rem;padding:1.4rem 1.2rem 1.2rem;border-radius:18px;border:1px solid rgba(212,175,55,.18);background:rgba(8,9,15,.85);position:relative;overflow:hidden}',
    '.jy-fb::before{content:"";position:absolute;top:50%;right:-80px;width:340px;height:340px;background-image:url(/img/fb-bg-heptagram.png);background-size:contain;background-repeat:no-repeat;background-position:center;opacity:.045;transform:translateY(-50%);pointer-events:none;z-index:0}',
    '.jy-fb > *{position:relative;z-index:1}',

    // ─────── 頂部:符令小裝飾 + 一行靜月口吻 ───────
    '.jy-fb-header{display:flex;flex-direction:column;align-items:center;margin-bottom:.9rem}',
    '.jy-fb-talisman{width:32px;height:auto;opacity:.62;margin-bottom:.55rem}',
    '.jy-fb-greeting{font-size:.78rem;color:rgba(212,175,55,.7);letter-spacing:.18em;font-weight:300}',

    // ─────── 主標題 ───────
    '.jy-fb-q{text-align:center;margin-bottom:.2rem}',
    '.jy-fb-title{font-size:1.05rem;color:var(--c-gold,#c9a84c);font-weight:500;letter-spacing:.05em;line-height:1.55;margin-bottom:.5rem}',
    '.jy-fb-sub{font-size:.74rem;color:rgba(160,152,128,.75);line-height:1.7;letter-spacing:.04em}',

    // ─────── 分隔線(用圖) ───────
    '.jy-fb-divider{width:100%;height:24px;background-image:url(/img/fb-divider.png);background-size:contain;background-repeat:no-repeat;background-position:center;margin:.85rem 0 1rem;opacity:.7}',

    // ─────── 三按鈕區 ───────
    '.jy-fb-btns{display:grid;grid-template-columns:repeat(3,1fr);gap:.55rem}',
    '.jy-fb-btn{position:relative;padding:1.1rem .35rem .85rem;border-radius:14px;border:1px solid rgba(212,175,55,.14);background:rgba(0,0,0,.25);cursor:pointer;transition:all .35s cubic-bezier(.2,.8,.2,1);font-family:inherit;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.55rem;min-height:120px;overflow:hidden}',
    '.jy-fb-btn::after{content:"";position:absolute;inset:0;border-radius:14px;background:radial-gradient(circle at center, rgba(212,175,55,.08), transparent 70%);opacity:0;transition:opacity .4s}',
    '.jy-fb-btn:hover::after{opacity:1}',
    '.jy-fb-btn:active{transform:scale(.97)}',
    '.jy-fb-btn-icon{width:46px;height:46px;background-repeat:no-repeat;background-position:center;background-size:contain;opacity:.78;transition:all .35s}',
    '.jy-fb-btn:hover .jy-fb-btn-icon{opacity:1;transform:scale(1.06)}',
    '.jy-fb-btn-label{font-size:.82rem;font-weight:500;color:rgba(232,224,208,.8);letter-spacing:.08em;transition:color .3s}',
    // 按鈕圖示對應(各自的圖)
    '.jy-fb-btn.good .jy-fb-btn-icon{background-image:url(/img/fb-icon-good.png)}',
    '.jy-fb-btn.vague .jy-fb-btn-icon{background-image:url(/img/fb-icon-vague.png)}',
    '.jy-fb-btn.bad .jy-fb-btn-icon{background-image:url(/img/fb-icon-bad.png)}',
    // hover / picked 各自顏色
    '.jy-fb-btn.good:hover,.jy-fb-btn.good.picked{border-color:rgba(212,175,55,.5);background:rgba(212,175,55,.04)}',
    '.jy-fb-btn.good.picked .jy-fb-btn-label{color:#c9a84c}',
    '.jy-fb-btn.vague:hover,.jy-fb-btn.vague.picked{border-color:rgba(212,175,55,.5);background:rgba(212,175,55,.04)}',
    '.jy-fb-btn.vague.picked .jy-fb-btn-label{color:#c9a84c}',
    '.jy-fb-btn.bad:hover,.jy-fb-btn.bad.picked{border-color:rgba(212,175,55,.5);background:rgba(212,175,55,.04)}',
    '.jy-fb-btn.bad.picked .jy-fb-btn-label{color:#c9a84c}',
    // 選中後右上角顯示月相
    '.jy-fb-btn.picked::before{content:"";position:absolute;top:8px;right:8px;width:18px;height:18px;background-repeat:no-repeat;background-position:center;background-size:contain;opacity:.85;animation:jyMoonRise .5s ease}',
    '.jy-fb-btn.good.picked::before{background-image:url(/img/fb-moon-4.png)}',  // 滿月=圓滿對得上
    '.jy-fb-btn.vague.picked::before{background-image:url(/img/fb-moon-2.png)}', // 半月=半明半暗
    '.jy-fb-btn.bad.picked::before{background-image:url(/img/fb-moon-1.png)}',   // 殘月=失落
    '@keyframes jyMoonRise{from{opacity:0;transform:translateY(-4px)}to{opacity:.85;transform:translateY(0)}}',

    // ─────── 底部小提示 ───────
    '.jy-fb-hint{text-align:center;font-size:.7rem;color:rgba(212,175,55,.42);margin-top:.9rem;letter-spacing:.1em}',

    // ─────── 詳細原因區 ───────
    '.jy-fb-detail{display:none;margin-top:1.1rem;padding-top:.9rem;border-top:1px solid rgba(212,175,55,.1)}',
    '.jy-fb-detail.open{display:block;animation:jyFbSlide .4s ease}',
    '@keyframes jyFbSlide{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}',
    '.jy-fb-detail-q{font-size:.82rem;color:rgba(232,224,208,.85);margin-bottom:.55rem;letter-spacing:.04em}',
    '.jy-fb-detail-q small{color:rgba(160,152,128,.65);font-size:.72rem;font-weight:400;margin-left:.35rem}',
    '.jy-fb-tags{display:flex;flex-wrap:wrap;gap:.4rem;margin-bottom:.7rem}',
    '.jy-fb-tag{font-size:.74rem;padding:.4rem .7rem;border-radius:18px;border:1px solid rgba(212,175,55,.12);background:rgba(0,0,0,.2);color:rgba(160,152,128,.85);cursor:pointer;transition:all .25s;font-family:inherit;letter-spacing:.04em}',
    '.jy-fb-tag:hover{border-color:rgba(212,175,55,.3);color:rgba(212,175,55,.85)}',
    '.jy-fb-tag.on{border-color:rgba(212,175,55,.45);background:rgba(212,175,55,.08);color:rgba(212,175,55,.95)}',
    '.jy-fb-text{width:100%;padding:.6rem .8rem;background:rgba(0,0,0,.25);border:1px solid rgba(212,175,55,.12);border-radius:10px;color:var(--c-text,#e8e0d0);font-size:.82rem;resize:vertical;min-height:55px;font-family:inherit;line-height:1.6;letter-spacing:.02em}',
    '.jy-fb-text:focus{outline:none;border-color:rgba(212,175,55,.3)}',
    '.jy-fb-text::placeholder{color:rgba(160,152,128,.4)}',
    '.jy-fb-send{margin-top:.7rem;width:100%;padding:.85rem;background:rgba(212,175,55,.08);color:rgba(212,175,55,.95);border:1px solid rgba(212,175,55,.35);border-radius:12px;font-weight:500;font-size:.88rem;cursor:pointer;font-family:inherit;transition:all .3s;letter-spacing:.1em}',
    '.jy-fb-send:hover{background:rgba(212,175,55,.15);border-color:rgba(212,175,55,.55)}',
    '.jy-fb-send:disabled{opacity:.4;cursor:not-allowed}',

    // ─────── 感謝區 ───────
    '.jy-fb-done{text-align:center;padding:1.4rem .5rem;animation:jyFbSlide .5s ease}',
    '.jy-fb-done .moon{width:48px;height:48px;background-image:url(/img/fb-moon-4.png);background-repeat:no-repeat;background-position:center;background-size:contain;margin:0 auto .7rem;opacity:.9;animation:jyMoonBreath 3s ease-in-out infinite}',
    '@keyframes jyMoonBreath{0%,100%{opacity:.85;transform:scale(1)}50%{opacity:1;transform:scale(1.04)}}',
    '.jy-fb-done .msg{font-size:1rem;color:var(--c-gold,#c9a84c);font-weight:500;letter-spacing:.08em;margin-bottom:.45rem}',
    '.jy-fb-done .sub{font-size:.76rem;color:rgba(160,152,128,.75);line-height:1.75;letter-spacing:.03em}'
  ].join('\n');
  document.head.appendChild(fbStyle);

  // 偵測用戶使用的工具
  function detectTool() {
    if (window._selectedTool) return window._selectedTool;
    if (window.S && window.S._tarotOnlyMode) return 'tarot';
    if (window.S && window.S._ootkMode) return 'ootk';
    return 'full';
  }

  // 覆蓋 showFeedbackSection
  var _origShowFb = window.showFeedbackSection;
  window.showFeedbackSection = function() {
    // 隱藏舊的
    var oldFb = document.getElementById('feedback-section');
    if (oldFb) oldFb.style.display = 'none';

    // 如果已經注入過就不重複
    if (document.getElementById('jy-fb-v2')) return;

    // 找到正確的插入位置
    var target = null;
    var stepTarot = document.getElementById('step-tarot');
    var step3 = document.getElementById('step-3');
    if (stepTarot && stepTarot.classList.contains('active')) {
      var ootkW = document.getElementById('ootk-ai-wrap');
      var tarotW = document.getElementById('tarot-ai-wrap');
      target = (ootkW && ootkW.style.display !== 'none' && ootkW.innerHTML) ? ootkW : tarotW;
    } else if (step3 && step3.classList.contains('active')) {
      target = document.getElementById('ai-deep-result');
    }

    var fb = document.createElement('div');
    fb.id = 'jy-fb-v2';
    fb.className = 'jy-fb';

    var tool = detectTool();
    var toolLabel = tool === 'tarot' ? '塔羅快讀' : tool === 'ootk' ? '開鑰之法' : '七維度分析';

    fb.innerHTML =
      // ★ v63.4 質感重設計:用訂製圖騰 + 靜月口吻,捨棄 emoji 跟壓迫式設計
      // 頂部:符令裝飾 + 一行靜月口吻
      '<div class="jy-fb-header">' +
        '<img class="jy-fb-talisman" src="/img/fb-header-talisman.png" alt="">' +
        '<div class="jy-fb-greeting">☽ 靜 月 想 聽 你 說</div>' +
      '</div>' +

      // 主標題
      '<div class="jy-fb-q">' +
        '<div class="jy-fb-title">這次的<span style="opacity:.95">' + toolLabel + '</span>,接得上你嗎?</div>' +
        '<div class="jy-fb-sub">你回的那一聲,會直接調整我下次解讀的權重——<br>回訪時的字句,會更貼近你。</div>' +
      '</div>' +

      // 詩意分隔線(用圖)
      '<div class="jy-fb-divider"></div>' +

      // 三按鈕(訂製圖騰,不用 emoji)
      '<div class="jy-fb-btns">' +
        '<button class="jy-fb-btn good" data-rating="good">' +
          '<div class="jy-fb-btn-icon"></div>' +
          '<div class="jy-fb-btn-label">對 得 上</div>' +
        '</button>' +
        '<button class="jy-fb-btn vague" data-rating="vague">' +
          '<div class="jy-fb-btn-icon"></div>' +
          '<div class="jy-fb-btn-label">太 籠 統</div>' +
        '</button>' +
        '<button class="jy-fb-btn bad" data-rating="bad">' +
          '<div class="jy-fb-btn-icon"></div>' +
          '<div class="jy-fb-btn-label">對 不 上</div>' +
        '</button>' +
      '</div>' +
      '<div class="jy-fb-hint">點 一 下 · 靜 月 會 記 得</div>' +

      // 詳細原因區(點「對不上」或「太籠統」後展開)
      '<div class="jy-fb-detail" id="jy-fb-detail">' +
        '<div class="jy-fb-detail-q">哪裡可以更好?<small>選填,但寫了我能改更快</small></div>' +
        '<div class="jy-fb-tags" id="jy-fb-tags">' +
          '<button class="jy-fb-tag" data-r="太籠統">解讀太籠統</button>' +
          '<button class="jy-fb-tag" data-r="答非所問">沒回答我的問題</button>' +
          '<button class="jy-fb-tag" data-r="方向錯">判斷方向錯</button>' +
          '<button class="jy-fb-tag" data-r="不準">感覺不準</button>' +
          '<button class="jy-fb-tag" data-r="太長">回覆太長</button>' +
          '<button class="jy-fb-tag" data-r="重複">內容重複</button>' +
          '<button class="jy-fb-tag" data-r="水晶不對">水晶建議不對</button>' +
          '<button class="jy-fb-tag" data-r="風格">不喜歡語氣風格</button>' +
        '</div>' +
        '<textarea class="jy-fb-text" id="jy-fb-text" placeholder="具體哪裡不對?你期望的答案是什麼?(選填)"></textarea>' +
        '<button class="jy-fb-send" id="jy-fb-send">送 出 回 饋</button>' +
      '</div>' +

      // 感謝畫面(滿月圖示 + 呼吸動畫)
      '<div class="jy-fb-done" id="jy-fb-done" style="display:none">' +
        '<div class="moon"></div>' +
        '<div class="msg">收 到 了</div>' +
        '<div class="sub">下次你回訪時,我會記得這次的對話脈絡,<br>解讀會更貼近你。</div>' +
      '</div>';

    if (target) {
      target.parentNode.insertBefore(fb, target.nextSibling);
    } else {
      document.querySelector('.step.active').appendChild(fb);
    }

    // 事件綁定
    var selectedRating = '';
    var selectedReasons = [];

    fb.querySelectorAll('.jy-fb-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        selectedRating = btn.dataset.rating;
        fb.querySelectorAll('.jy-fb-btn').forEach(function(b) { b.classList.remove('picked'); });
        btn.classList.add('picked');

        if (selectedRating === 'good') {
          // 直接送出 + 顯示感謝
          sendFeedback('good', [], '');
          fb.querySelector('.jy-fb-btns').style.display = 'none';
          fb.querySelector('.jy-fb-q').style.display = 'none';
          document.getElementById('jy-fb-done').style.display = 'block';
        } else {
          // 'bad' 或 'vague' 都展開讓用戶填細節
          // 'vague' 預先勾選「太籠統」tag,引導用戶
          if (selectedRating === 'vague') {
            var vagueTag = fb.querySelector('.jy-fb-tag[data-r="太籠統"]');
            if (vagueTag && !vagueTag.classList.contains('on')) {
              vagueTag.classList.add('on');
              if (selectedReasons.indexOf('太籠統') < 0) selectedReasons.push('太籠統');
            }
          }
          document.getElementById('jy-fb-detail').classList.add('open');
        }
      });
    });

    fb.querySelectorAll('.jy-fb-tag').forEach(function(tag) {
      tag.addEventListener('click', function() {
        tag.classList.toggle('on');
        var r = tag.dataset.r;
        var idx = selectedReasons.indexOf(r);
        if (idx >= 0) selectedReasons.splice(idx, 1);
        else selectedReasons.push(r);
      });
    });

    document.getElementById('jy-fb-send').addEventListener('click', function() {
      var comment = (document.getElementById('jy-fb-text').value || '').trim();
      // ★ vague(太籠統)由於進入時已自動勾「太籠統」tag,不會卡這層
      //   bad(對不上)仍要求至少選一個原因或寫一句話,確保有訓練訊號
      if (selectedRating === 'bad' && selectedReasons.length === 0 && !comment) {
        document.getElementById('jy-fb-tags').style.outline = '1px solid rgba(239,68,68,.5)';
        setTimeout(function(){ document.getElementById('jy-fb-tags').style.outline = 'none'; }, 1500);
        return;
      }
      sendFeedback(selectedRating, selectedReasons, comment);
      document.getElementById('jy-fb-detail').style.display = 'none';
      fb.querySelector('.jy-fb-btns').style.display = 'none';
      fb.querySelector('.jy-fb-q').style.display = 'none';
      var done = document.getElementById('jy-fb-done');
      var msgText = selectedRating === 'vague'
        ? '收到了,你的反饋已寫入學習資料庫。'
        : (selectedReasons.length > 0
            ? '收到了,我會針對「' + selectedReasons.join('、') + '」改進'
            : '收到了,你的反饋已寫入學習資料庫。');
      done.querySelector('.msg').textContent = msgText;
      done.style.display = 'block';
    });
  };

  function sendFeedback(rating, reasons, comment) {
    var url = (typeof AI_WORKER_URL !== 'undefined') ? AI_WORKER_URL : 'https://jy-ai-proxy.onerkk.workers.dev';
    // ★ v43：從 _jyFeedbackSnapshot 讀完整上下文（跟 ui.js 一致）
    var snap = window._jyFeedbackSnapshot || {};
    var q = snap.question || ((window.S && window.S.form) ? (window.S.form.question || '') : '');
    var type = snap.type || ((window.S && window.S.form) ? (window.S.form.type || '') : '');
    var name = snap.name || ((window.S && window.S.form) ? (window.S.form.name || '匿名') : '匿名');
    var tool = snap.tool || detectTool();
    var birth = snap.birth || ((window.S && window.S.form) ? (window.S.form.bdate || '') : '');
    var birthTime = snap.birthTime || ((window.S && window.S.form) ? (window.S.form.btime || '') : '');
    var gender = snap.gender || ((window.S && window.S.form) ? (window.S.form.gender || '') : '');
    var birthLocation = snap.birthLocation || '';
    var aiClosing = snap.aiClosing || '';
    var aiDirectAnswer = snap.aiDirectAnswer || '';
    var aiYesNo = snap.aiYesNo || '';
    var aiStory = snap.aiStory || '';
    var cards = snap.cards || '';
    // fallback：快照沒有時從 _jyPrevFullResult 讀
    if (!aiClosing && !aiDirectAnswer) {
      try {
        var prev = window._jyPrevFullResult ? JSON.parse(window._jyPrevFullResult) : null;
        if (prev) {
          aiClosing = (prev.closing || '').substring(0, 80);
          aiDirectAnswer = (prev.directAnswer || '').substring(0, 300);
          aiStory = (prev.story || '').substring(0, 800);
          if (prev.yesNo) aiYesNo = JSON.stringify(prev.yesNo).substring(0, 200);
        }
      } catch(_) {}
    }
    fetch(url + '/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        // ★ 配合 worker.js Bug #29 fix（feedback 加 rate limit）：帶 session_token 讓登入用戶有獨立 quota
        //   沒登入時 worker 會 fallback 到 IP-based rate limit（1 分鐘 5 次）
        session_token: window._JY_SESSION_TOKEN || '',
        rating: rating,
        question: q.substring(0, 200),
        type: type,
        tool: tool,
        reasons: reasons.join('、'),
        comment: comment.substring(0, 500),
        name: name.substring(0, 20),
        cards: cards,
        aiClosing: aiClosing,
        aiDirectAnswer: aiDirectAnswer,
        aiYesNo: aiYesNo,
        aiStory: aiStory,
        birth: birth,
        birthTime: birthTime,
        gender: gender,
        birthLocation: birthLocation
      })
    }).catch(function(){});
  }
})();
