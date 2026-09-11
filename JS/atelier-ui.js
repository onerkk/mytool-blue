/* 靜月之光 · Moon Atelier UI / 20260911atelier1 */
(function () {
  'use strict';
  // Explicit render hooks: no global MutationObserver or background polling.
  window.JY_ATELIER = {
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
})();
