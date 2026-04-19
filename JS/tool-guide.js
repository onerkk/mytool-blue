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
        // v52：動態讀 _JY_PRICING
        var _tgP = (typeof window!=='undefined' && window._JY_PRICING) || { SUB_STANDARD: 999, SUB_PREMIUM: 1999 };
        var _subLine = '標準 NT$' + _tgP.SUB_STANDARD + '／高級 NT$' + (_tgP.SUB_PREMIUM||1999).toLocaleString() + '/月';
        if(data.subscription && data.quotaType){
          var qt = data.quotaType === '7d_monthly' ? '七維度每月' : '塔羅每日';
          line.innerHTML = '☽ 會員・' + qt + ' ' + data.limit + ' 次（已用 ' + (data.used||0) + ' 次）';
          return;
        }
        if(data.paid){ line.innerHTML = '☽ 已付費・本次可用'; return; }
        var fl = data.freeUsesLeft;
        if(fl == null && data.code === 'FREE_USED_UP') fl = 0;
        if(fl != null){
          var color = fl <= 1 ? 'rgba(239,68,68,.8)' : 'rgba(212,175,55,.7)';
          line.innerHTML = fl > 0
            ? '☽ 免費體驗・還剩 <span style="color:'+color+';font-weight:700">'+fl+'</span> 次'
            : '☽ <span style="color:rgba(239,68,68,.8);font-weight:700">免費已用完</span>・會員 ' + _subLine;
          return;
        }
        if(data.code === 'LOGIN_REQUIRED'){ line.innerHTML = '☽ 登入 Google 即享免費體驗'; return; }
        line.innerHTML = '☽ 三套工具各免費 1 次・會員 ' + _subLine;
      })
      .catch(function(){ var l=document.getElementById('jy-trial-line'); if(l) l.innerHTML='☽ 前 3 次免費體驗'; });
  }
  var _orig = window.pickTool;
  window.pickTool = function(tool) { if (_orig) _orig(tool); injectGuide(); };
  var _poll = setInterval(function() {
    var is = document.getElementById('input-screen');
    if (is && is.style.display !== 'none' && is.offsetParent !== null) { injectGuide(); clearInterval(_poll); }
  }, 500);
  setTimeout(function(){ clearInterval(_poll); }, 60000);
})();

// ════════════════════════════════════════
// 3. 增強回饋系統（覆蓋舊版）
// ════════════════════════════════════════
(function(){
  // 注入回饋面板樣式
  var fbStyle = document.createElement('style');
  fbStyle.textContent = [
    '.jy-fb{margin:1rem;border-radius:14px;border:1px solid rgba(212,175,55,.15);background:rgba(8,9,15,.95);padding:1rem;overflow:hidden}',
    '.jy-fb-q{text-align:center;font-size:.88rem;color:var(--c-text,#e8e0d0);margin-bottom:.7rem}',
    '.jy-fb-btns{display:flex;justify-content:center;gap:1rem}',
    '.jy-fb-btn{font-size:.82rem;font-weight:600;padding:.5rem 1.5rem;border-radius:10px;border:1.5px solid rgba(255,255,255,.1);background:none;color:var(--c-text-dim,#a09880);cursor:pointer;transition:all .25s;font-family:inherit;display:flex;align-items:center;gap:.4rem}',
    '.jy-fb-btn:active{transform:scale(.96)}',
    '.jy-fb-btn.good:hover,.jy-fb-btn.good.picked{border-color:rgba(74,222,128,.4);background:rgba(74,222,128,.08);color:rgba(74,222,128,.9)}',
    '.jy-fb-btn.bad:hover,.jy-fb-btn.bad.picked{border-color:rgba(239,68,68,.4);background:rgba(239,68,68,.08);color:rgba(239,68,68,.9)}',
    '.jy-fb-detail{display:none;margin-top:.8rem;padding-top:.7rem;border-top:1px solid rgba(255,255,255,.06)}',
    '.jy-fb-detail.open{display:block;animation:jyFbSlide .3s ease}',
    '@keyframes jyFbSlide{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}',
    '.jy-fb-tags{display:flex;flex-wrap:wrap;gap:.35rem;margin-bottom:.5rem}',
    '.jy-fb-tag{font-size:.72rem;padding:.3rem .6rem;border-radius:8px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.03);color:var(--c-text-dim,#a09880);cursor:pointer;transition:all .2s;font-family:inherit}',
    '.jy-fb-tag.on{border-color:rgba(212,175,55,.35);background:rgba(212,175,55,.08);color:rgba(212,175,55,.9)}',
    '.jy-fb-text{width:100%;padding:.45rem .6rem;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:8px;color:var(--c-text,#e8e0d0);font-size:.78rem;resize:vertical;min-height:50px;font-family:inherit}',
    '.jy-fb-text::placeholder{color:rgba(255,255,255,.25)}',
    '.jy-fb-send{margin-top:.5rem;width:100%;padding:.5rem;background:linear-gradient(135deg,rgba(212,175,55,.9),rgba(201,168,76,.8));color:#1a1a2e;border:none;border-radius:10px;font-weight:700;font-size:.82rem;cursor:pointer;font-family:inherit;transition:opacity .2s}',
    '.jy-fb-send:disabled{opacity:.4;cursor:not-allowed}',
    '.jy-fb-done{text-align:center;padding:.6rem 0;animation:jyFbSlide .4s ease}',
    '.jy-fb-done .moon{font-size:1.5rem;margin-bottom:.3rem}',
    '.jy-fb-done .msg{font-size:.85rem;color:rgba(212,175,55,.8)}'
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
      // 主問題
      '<div class="jy-fb-q">☽ 這次的<span style="color:rgba(212,175,55,.8)">' + toolLabel + '</span>對你有幫助嗎？</div>' +

      // 兩個按鈕
      '<div class="jy-fb-btns">' +
        '<button class="jy-fb-btn good" data-rating="good">☽ 有感覺</button>' +
        '<button class="jy-fb-btn bad" data-rating="bad">☾ 沒感覺</button>' +
      '</div>' +

      // 展開的詳細原因區（點「沒感覺」後顯示）
      '<div class="jy-fb-detail" id="jy-fb-detail">' +
        '<div style="font-size:.78rem;color:var(--c-text-dim,#a09880);margin-bottom:.4rem">哪裡可以更好？</div>' +
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
        '<textarea class="jy-fb-text" id="jy-fb-text" placeholder="具體哪裡不對？你期望的答案是什麼？（選填，寫越具體我們改越快）"></textarea>' +
        '<button class="jy-fb-send" id="jy-fb-send">送出回饋</button>' +
      '</div>' +

      // 感謝畫面
      '<div class="jy-fb-done" id="jy-fb-done" style="display:none">' +
        '<div class="moon">☽</div>' +
        '<div class="msg">謝謝你，這會讓靜月更準</div>' +
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
      if (selectedReasons.length === 0 && !comment) {
        // 至少選一個原因或寫一句話
        document.getElementById('jy-fb-tags').style.outline = '1px solid rgba(239,68,68,.5)';
        setTimeout(function(){ document.getElementById('jy-fb-tags').style.outline = 'none'; }, 1500);
        return;
      }
      sendFeedback('bad', selectedReasons, comment);
      document.getElementById('jy-fb-detail').style.display = 'none';
      fb.querySelector('.jy-fb-btns').style.display = 'none';
      fb.querySelector('.jy-fb-q').style.display = 'none';
      var done = document.getElementById('jy-fb-done');
      done.querySelector('.msg').textContent = '收到了，我們會針對「' + selectedReasons.join('、') + '」改進';
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
