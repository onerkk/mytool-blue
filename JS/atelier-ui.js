/* 靜月之光 · Celestial Atelier UI / 20260911celestial1 */
(function () {
  'use strict';
  var entrance = null;
  // Explicit render hooks: no global MutationObserver or background polling.
  window.JY_ATELIER = {
    setMode: function (tool) {
      var input = document.getElementById('input-screen');
      if (!input || (tool !== 'tarot' && tool !== 'ootk')) return;
      input.setAttribute('data-atelier-mode', tool);
      var label = input.querySelector('.at-input-head .at-eyebrow');
      if (label) label.textContent = tool === 'ootk' ? 'OPENING OF THE KEY · 深入脈絡' : 'TAROT · 此刻的選擇';
    },
    restoreEntrance: function () {
      if (entrance && entrance.isConnected && typeof entrance.focus === 'function') entrance.focus({ preventScroll: true });
    },
    enhance: function (root) {
      if (!root || !root.querySelectorAll) return;
      root.querySelectorAll('.ln-spread-btn,.mhx-method-btn,.bzx-gbtn,.bzx-dbtn,.zw-in-pill,.bzs-chip,.bzs-choice-btn,.bzs-tab').forEach(function (button) {
        button.setAttribute('aria-pressed', String(button.classList.contains('active') || button.classList.contains('on')));
      });
      root.querySelectorAll('.bzs-field,.zw-in-field').forEach(function (field) {
        var label = field.querySelector('label'), control = field.querySelector('button,input:not([type="hidden"]),select,textarea');
        if (label && control && control.id && !label.getAttribute('for')) label.setAttribute('for', control.id);
      });
    }
  };
  window._atelierChoose = function (tool) {
    entrance = document.activeElement;
    if (tool === 'tarot' || tool === 'ootk') {
      window._enterFromHome();
      window.pickTool(tool, { stayAtQuestion: true });
      var input = document.getElementById('input-screen');
      if (input) input.setAttribute('data-atelier-mode', tool);
      var question = document.getElementById('f-question');
      if (question) question.focus({ preventScroll: true });
      window.scrollTo({ top: 0, behavior: 'instant' });
      return;
    }
    if (tool === 'compat' && window.BaziSuiteUI) { window.BaziSuiteUI.open('compat'); return; }
    var calls = { lenormand: '_lenormandOpen', bazi: '_baziOpen', ziwei: '_ziweiOpen', meihua: '_meihuaOpen', oracle: '_oracleOpen' };
    if (calls[tool] && typeof window[calls[tool]] === 'function') window[calls[tool]]();
  };

  // The old input markup still called backToHook after its implementation was
  // removed. Navigation must not call the reading reset and erase the question.
  window.backToHook = function () {
    if (typeof window.goStep === 'function') window.goStep(0);
    var home = document.getElementById('hook-screen');
    var input = document.getElementById('input-screen');
    if (home) home.style.display = 'block';
    if (input) input.style.display = 'none';
    window.scrollTo({ top: 0, behavior: 'instant' });
    var start = document.getElementById('home-cta-btn');
    if (start) start.focus({ preventScroll: true });
  };
  window._atelierReturnToInput = function () {
    if (typeof window.goStep === 'function') window.goStep(0);
    if (typeof window._enterFromHome === 'function') window._enterFromHome();
    var input = document.getElementById('input-screen');
    var home = document.getElementById('hook-screen');
    if (input) input.style.display = 'block';
    if (home) home.style.display = 'none';
    var question = document.getElementById('f-question');
    if (question) question.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: 'instant' });
  };
})();
