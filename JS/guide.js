// ═══════════════════════════════════════════════════════════════
// guide.js — 使用指引 + 提問品質引導（替換 confirm()）
// 放在 JS_backup/ → obfuscate → JS/
// 在 index.html 載入順序：ui.js 之後
// ═══════════════════════════════════════════════════════════════

(function() {
  'use strict';

  // ── CSS ──
  var css = document.createElement('style');
  css.textContent = [
    '.jy-gov{position:fixed;inset:0;z-index:9999;background:rgba(5,5,8,.85);backdrop-filter:blur(14px);display:flex;align-items:center;justify-content:center;padding:1rem;opacity:0;transition:opacity .4s;pointer-events:none}',
    '.jy-gov.v{opacity:1;pointer-events:auto}',
    '.jy-gbox{background:linear-gradient(160deg,#161618,#111113);border:1px solid rgba(201,168,76,.25);border-radius:16px;max-width:420px;width:100%;max-height:85vh;overflow-y:auto;padding:0;box-shadow:0 24px 80px rgba(0,0,0,.6),0 0 40px rgba(201,168,76,.06);animation:jyG .4s cubic-bezier(.16,1,.3,1)}',
    '@keyframes jyG{from{transform:translateY(30px) scale(.96);opacity:0}to{transform:none;opacity:1}}',
    '.jy-gbox::-webkit-scrollbar{width:4px}.jy-gbox::-webkit-scrollbar-thumb{background:rgba(201,168,76,.2);border-radius:2px}',
    '.jy-hd{text-align:center;padding:2rem 1.5rem 1rem;border-bottom:1px solid rgba(255,255,255,.04)}',
    '.jy-hd .mn{font-size:2rem;margin-bottom:.5rem}',
    '.jy-hd h2{font-family:"Noto Serif TC",serif;font-size:1.15rem;font-weight:600;color:#c9a84c;margin:0 0 .3rem}',
    '.jy-hd p{font-size:.78rem;color:rgba(228,228,231,.5);margin:0;line-height:1.5}',
    '.jy-ss{padding:1.2rem 1.5rem}',
    '.jy-st{display:flex;gap:.8rem;align-items:flex-start;margin-bottom:1.2rem;position:relative}',
    '.jy-st:last-child{margin-bottom:0}',
    '.jy-st::after{content:"";position:absolute;left:15px;top:34px;bottom:-12px;width:1px;background:rgba(201,168,76,.15)}',
    '.jy-st:last-child::after{display:none}',
    '.jy-nm{min-width:30px;height:30px;border-radius:50%;background:rgba(201,168,76,.1);border:1px solid rgba(201,168,76,.3);display:flex;align-items:center;justify-content:center;font-size:.75rem;color:#c9a84c;font-weight:700;flex-shrink:0;position:relative;z-index:1}',
    '.jy-sc h3{font-size:.88rem;color:#e4e4e7;margin:0 0 .25rem;font-weight:600}',
    '.jy-sc p{font-size:.78rem;color:rgba(228,228,231,.55);margin:0;line-height:1.6}',
    '.jy-tg{display:grid;grid-template-columns:1fr 1fr 1fr;gap:.5rem;margin-top:.6rem}',
    '.jy-tc{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:8px;padding:.5rem .4rem;text-align:center;font-size:.72rem;color:rgba(228,228,231,.6)}',
    '.jy-tc .i{font-size:1rem;display:block;margin-bottom:.2rem}',
    '.jy-tc b{color:#dfc373;font-size:.75rem}',
    '.jy-tp{background:rgba(201,168,76,.04);border-top:1px solid rgba(201,168,76,.1);padding:1rem 1.5rem}',
    '.jy-tp h3{font-size:.82rem;color:#c9a84c;margin:0 0 .5rem;font-weight:600}',
    '.jy-ex{display:flex;gap:.4rem;align-items:baseline;margin-bottom:.5rem;flex-wrap:wrap}',
    '.jy-ex:last-child{margin-bottom:0}',
    '.jy-ex .bd{font-size:.75rem;color:rgba(228,228,231,.35);text-decoration:line-through}',
    '.jy-ex .ar{color:#c9a84c;font-size:.7rem}',
    '.jy-ex .gd{font-size:.75rem;color:rgba(228,228,231,.7)}',
    '.jy-ft{padding:1rem 1.5rem 1.5rem;text-align:center}',
    '.jy-btn{background:linear-gradient(135deg,#c9a84c,#a88832);color:#0a0a0c;border:none;border-radius:10px;padding:.7rem 2rem;font-size:.88rem;font-weight:700;cursor:pointer;transition:all .2s;font-family:inherit}',
    '.jy-btn:hover{transform:translateY(-1px);box-shadow:0 4px 20px rgba(201,168,76,.3)}',
    '.jy-qov{position:fixed;inset:0;z-index:9998;background:rgba(5,5,8,.75);backdrop-filter:blur(10px);display:flex;align-items:center;justify-content:center;padding:1rem;opacity:0;transition:opacity .3s;pointer-events:none}',
    '.jy-qov.v{opacity:1;pointer-events:auto}',
    '.jy-qb{background:linear-gradient(160deg,#1c1c1f,#111113);border:1px solid rgba(201,168,76,.2);border-radius:14px;max-width:380px;width:100%;padding:1.5rem;box-shadow:0 20px 60px rgba(0,0,0,.5);animation:jyG .3s cubic-bezier(.16,1,.3,1)}',
    '.jy-qb .qi{text-align:center;font-size:1.5rem;margin-bottom:.6rem}',
    '.jy-qb .qt{font-family:"Noto Serif TC",serif;font-size:.95rem;color:#dfc373;text-align:center;margin:0 0 .8rem}',
    '.jy-qb .qm{font-size:.82rem;color:rgba(228,228,231,.7);line-height:1.7;margin:0 0 1.2rem}',
    '.jy-qa{display:flex;gap:.6rem;justify-content:center}',
    '.jy-qa button{border-radius:8px;padding:.55rem 1.2rem;font-size:.82rem;font-weight:600;cursor:pointer;transition:all .2s;font-family:inherit}',
    '.jy-qc{background:rgba(201,168,76,.12);border:1px solid rgba(201,168,76,.3);color:#c9a84c}',
    '.jy-qc:hover{background:rgba(201,168,76,.2)}',
    '.jy-qe{background:linear-gradient(135deg,#c9a84c,#a88832);color:#0a0a0c;border:none}',
    '.jy-qe:hover{transform:translateY(-1px);box-shadow:0 4px 16px rgba(201,168,76,.25)}',
    '.jy-hb{position:fixed;bottom:1rem;left:1rem;z-index:800;width:36px;height:36px;border-radius:50%;background:rgba(201,168,76,.1);border:1px solid rgba(201,168,76,.25);color:#c9a84c;font-size:.82rem;font-weight:700;cursor:pointer;transition:all .25s;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(8px)}',
    '.jy-hb:hover{background:rgba(201,168,76,.2);box-shadow:0 0 20px rgba(201,168,76,.15);transform:scale(1.08)}'
  ].join('\n');
  document.head.appendChild(css);

  // ══ Guide ══
  function showGuide() {
    var el = document.getElementById('jy-gov');
    if (el) { el.classList.add('v'); return; }
    var d = document.createElement('div');
    d.id = 'jy-gov'; d.className = 'jy-gov';
    d.innerHTML = '<div class="jy-gbox">' +
      '<div class="jy-hd"><div class="mn">\uD83C\uDF19</div><h2>靜月之光・使用指引</h2><p>三種占卜工具，七套命理交叉驗證</p></div>' +
      '<div class="jy-ss">' +
        '<div class="jy-st"><div class="jy-nm">1</div><div class="jy-sc"><h3>選擇占卜工具</h3>' +
          '<div class="jy-tg">' +
            '<div class="jy-tc"><span class="i">⭐</span><b>塔羅快讀</b><br>抽牌問事<br>最快 30 秒</div>' +
            '<div class="jy-tc"><span class="i">🔑</span><b>開鑰之法</b><br>五層深潛<br>最深度解讀</div>' +
            '<div class="jy-tc"><span class="i">📊</span><b>七維深度</b><br>需要生辰<br>七套系統</div>' +
          '</div></div></div>' +
        '<div class="jy-st"><div class="jy-nm">2</div><div class="jy-sc"><h3>輸入你的問題</h3><p>可以選預設問題，也可以自己寫。問題越具體，解讀越精準。</p></div></div>' +
        '<div class="jy-st"><div class="jy-nm">3</div><div class="jy-sc"><h3>填寫基本資料</h3><p>塔羅快讀只需性別。七維深度需要出生年月日時（越完整越準）。不知道出生時間可以勾「不確定」。</p></div></div>' +
        '<div class="jy-st"><div class="jy-nm">4</div><div class="jy-sc"><h3>等待靜月解讀</h3><p>塔羅和開鑰需要選牌。七維深度直接出結果。解讀約 10-30 秒。</p></div></div>' +
        '<div class="jy-st"><div class="jy-nm">5</div><div class="jy-sc"><h3>看完可以追問</h3><p>結果下方有「追問靜月」按鈕，補抽牌再問更深入的問題。</p></div></div>' +
      '</div>' +
      '<div class="jy-tp"><h3>💡 問對問題，答案更準</h3>' +
        '<div class="jy-ex"><span class="bd">運勢如何</span><span class="ar">→</span><span class="gd">今年感情有機會嗎？對方大概什麼類型？</span></div>' +
        '<div class="jy-ex"><span class="bd">工作好嗎</span><span class="ar">→</span><span class="gd">我在考慮換工作，現在是好時機嗎？</span></div>' +
        '<div class="jy-ex"><span class="bd">他喜歡我嗎</span><span class="ar">→</span><span class="gd">我跟他認識三個月，最近態度冷淡，還有機會嗎？</span></div>' +
      '</div>' +
      '<div class="jy-ft"><button class="jy-btn" onclick="window._closeGuide()">開始占卜 ✨</button></div>' +
    '</div>';
    document.body.appendChild(d);
    requestAnimationFrame(function() { requestAnimationFrame(function() { d.classList.add('v'); }); });
  }

  function closeGuide() {
    var el = document.getElementById('jy-gov');
    if (el) { el.classList.remove('v'); setTimeout(function() { if (el.parentNode) el.parentNode.removeChild(el); }, 400); }
  }
  window._showGuide = showGuide;
  window._closeGuide = closeGuide;

  // First visit
  if (!localStorage.getItem('_jy_guide_seen')) {
    setTimeout(function() { showGuide(); localStorage.setItem('_jy_guide_seen', '1'); }, 800);
  }

  // Help button
  var hb = document.createElement('button');
  hb.className = 'jy-hb'; hb.textContent = '?'; hb.title = '使用說明'; hb.onclick = showGuide;
  document.body.appendChild(hb);

  // ══ Question Quality Modal ══
  var _qR = null;
  function showQH(msg) {
    return new Promise(function(resolve) {
      _qR = resolve;
      var old = document.getElementById('jy-qov');
      if (old) old.parentNode.removeChild(old);
      var d = document.createElement('div');
      d.id = 'jy-qov'; d.className = 'jy-qov';
      d.innerHTML = '<div class="jy-qb">' +
        '<div class="qi">🌙</div>' +
        '<div class="qt">靜月的小建議</div>' +
        '<div class="qm">' + msg + '</div>' +
        '<div class="jy-qa">' +
          '<button class="jy-qc" onclick="window._qA(true)">直接送出</button>' +
          '<button class="jy-qe" onclick="window._qA(false)">修改問題</button>' +
        '</div>' +
      '</div>';
      document.body.appendChild(d);
      requestAnimationFrame(function() { requestAnimationFrame(function() { d.classList.add('v'); }); });
    });
  }
  window._qA = function(go) {
    var el = document.getElementById('jy-qov');
    if (el) { el.classList.remove('v'); setTimeout(function() { if (el.parentNode) el.parentNode.removeChild(el); }, 300); }
    if (_qR) { _qR(go); _qR = null; }
  };

  // ══ Wrap submit functions to use styled modal ══
  function wrap(fnName) {
    var t = setInterval(function() {
      if (typeof window[fnName] !== 'function') return;
      clearInterval(t);
      var orig = window[fnName];
      window[fnName] = async function() {
        var qEl = document.getElementById('f-question');
        var q = (qEl && qEl.value) ? qEl.value.trim() : '';
        if (!q && typeof window.selectedPresetQ === 'string') q = window.selectedPresetQ.trim();
        if (!q) { orig.apply(this, arguments); return; }
        if (typeof _checkQuestionQuality === 'function' && !sessionStorage.getItem('_jy_q_hint_shown')) {
          var hint = _checkQuestionQuality(q);
          if (hint) {
            sessionStorage.setItem('_jy_q_hint_shown', '1');
            var go = await showQH(hint);
            if (!go) { if (qEl) { qEl.focus(); qEl.select(); } return; }
          }
        }
        sessionStorage.setItem('_jy_q_hint_shown', '1');
        orig.apply(this, arguments);
      };
    }, 200);
  }
  wrap('submitWithTool');
  wrap('submitTarotQuick');

})();
