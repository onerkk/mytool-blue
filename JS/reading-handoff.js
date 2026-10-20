/* 靜月之光 · 提示詞交接導引 / 20261021depth29
 * 根因：十五種工具各自畫「複製提示詞」按鈕，複製成功後沒有任何一處告訴使用者下一步要做什麼
 * （去哪裡貼、貼完要不要再說話、AI 回答不完整怎麼辦）。這裡只攔同一個共用出口 JYPromptPacket.copy：
 * 複製成功 → 一張底部導引卡，三步講完。不改任何工具的抽牌／排盤／複製邏輯，不碰剪貼簿內容。 */
(function (root) {
  'use strict';
  var VERSION = '20261021depth29', KEY = 'jy-handoff-dismissed-v1', ID = 'jy-handoff';
  if (!root.document) return;
  var doc = root.document, lastFocus = null, timer = null;

  function dismissed() { try { return root.localStorage.getItem(KEY) === '1'; } catch (e) { return false; } }
  function remember(flag) { try { if (flag) root.localStorage.setItem(KEY, '1'); else root.localStorage.removeItem(KEY); } catch (e) {} }

  function close() {
    var el = doc.getElementById(ID); if (!el) return;
    el.classList.remove('is-open');
    clearTimeout(timer);
    timer = setTimeout(function () { if (el.isConnected) el.remove(); }, 260);
    if (lastFocus && lastFocus.isConnected && typeof lastFocus.focus === 'function') lastFocus.focus({ preventScroll: true });
  }

  function build(detail) {
    var chars = detail && detail.characters ? detail.characters.toLocaleString() : '';
    var card = doc.createElement('div');
    card.id = ID; card.className = 'jy-handoff'; card.setAttribute('role', 'dialog'); card.setAttribute('aria-modal', 'false');
    card.setAttribute('aria-labelledby', ID + '-title');
    card.innerHTML =
      '<div class="jy-handoff-sheet">' +
        '<div class="jy-handoff-head"><span class="jy-handoff-check" aria-hidden="true">✓</span>' +
          '<div><b id="' + ID + '-title">提示詞已複製' + (chars ? '（' + chars + ' 字）' : '') + '</b><small>接下來三步，答案就會回到你面前。</small></div>' +
          '<button type="button" class="jy-handoff-close" aria-label="關閉導引">✕</button></div>' +
        '<ol class="jy-handoff-steps">' +
          '<li><i>1</i><div><b>打開你常用的 AI</b><span>ChatGPT、Gemini、Claude、Copilot 都可以；點上面的 AI 圖示會直接幫你開新分頁。</span></div></li>' +
          '<li><i>2</i><div><b>在對話框長按 → 貼上 → 送出</b><span>整段一次貼，不用刪、不用改，也不用先解釋你是誰。</span></div></li>' +
          '<li><i>3</i><div><b>讀完，想追問就直接問</b><span>看不懂的地方用白話再問一次；若它沒答完，回它一句：「請依提示詞要求，把沒回答的部分補完。」</span></div></li>' +
        '</ol>' +
        '<div class="jy-handoff-foot">' +
          '<label class="jy-handoff-mute"><input type="checkbox"> 以後不用再提醒我</label>' +
          '<button type="button" class="jy-handoff-ok">知道了</button>' +
        '</div>' +
      '</div>';
    card.querySelector('.jy-handoff-close').addEventListener('click', close);
    card.querySelector('.jy-handoff-ok').addEventListener('click', function () {
      remember(card.querySelector('.jy-handoff-mute input').checked); close();
    });
    card.addEventListener('click', function (e) { if (e.target === card) close(); });
    card.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
    return card;
  }

  function show(detail) {
    if (dismissed()) return;
    var old = doc.getElementById(ID); if (old) old.remove();
    lastFocus = doc.activeElement;
    var card = build(detail);
    doc.body.appendChild(card);
    // Two frames: let the sheet mount before the slide-in transition runs.
    requestAnimationFrame(function () { requestAnimationFrame(function () { card.classList.add('is-open'); }); });
    var ok = card.querySelector('.jy-handoff-ok'); if (ok) ok.focus({ preventScroll: true });
  }

  // Wrap the single shared copy exit. Every tool (塔羅、雷諾曼、八字、紫微、六壬……) funnels through it.
  var wrapped = null;
  function wrap() {
    var P = root.JYPromptPacket;
    if (!P || wrapped === P.copy) return !!P;
    var original = P.copy;
    var patched = function (text) {
      return original.apply(this, arguments).then(function (result) {
        try { doc.dispatchEvent(new CustomEvent('jy:prompt-copied', { detail: result })); } catch (e) {}
        return result;
      });
    };
    try { // JYPromptPacket is frozen; expose the wrapped copy without mutating the frozen object.
      root.JYPromptPacket = Object.freeze(Object.assign({}, P, { copy: patched }));
      wrapped = root.JYPromptPacket.copy;
    } catch (e) { return false; }
    return true;
  }
  doc.addEventListener('jy:prompt-copied', function (e) { show(e.detail || {}); });
  if (!wrap()) {
    var tries = 0, poll = setInterval(function () { tries++; if (wrap() || tries > 100) clearInterval(poll); }, 100);
  }
  root.JYReadingHandoff = Object.freeze({ version: VERSION, show: show, close: close, reset: function () { remember(false); } });
})(typeof window !== 'undefined' ? window : globalThis);
