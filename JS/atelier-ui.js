/* 靜月之光 · Celestial Atelier UI / 20260911celestial1 */
(function () {
  'use strict';
  var entrance = null;
  function esc(value){return String(value==null?'':value).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  // Explicit render hooks: no global MutationObserver or background polling.
  window.JY_ATELIER = {
    syncTarot: function () {
      var def=typeof getCurrentSpreadDef==='function'?getCurrentSpreadDef():null;
      var cards=typeof drawnCards!=='undefined'?drawnCards:[];
      var count=cards.length, target=def?def.count:3, complete=count===target;
      var dock=document.getElementById('tarot-draw-dock');
      if(!dock)return;
      dock.setAttribute('data-phase',complete?'complete':window._deckIsShuffled?'choosing':'ready');
      document.getElementById('tarot-dock-count').textContent=count+' / '+target+' 張';
      document.getElementById('tarot-dock-step').textContent=complete?'本次牌陣已完成':window._deckIsShuffled?'還差 '+(target-count)+' 張':'第一步 · 靜心洗牌';
      document.getElementById('tarot-dock-action').textContent=complete?'取得解讀提示詞':window._deckIsShuffled?(count?'快速補滿':'快速抽牌'):'開始洗牌';
      var layoutCount=document.getElementById('tarot-layout-count');
      if(layoutCount)layoutCount.textContent=count+' / '+target;
      var details=document.getElementById('tarot-layout-details');
      if(details && count===0)details.open=false;
      var legend=document.getElementById('tarot-position-list');
      if(legend && def)legend.innerHTML=def.positions.map(function(pos,i){return '<li><span>'+esc(pos.name.replace(/^\s*\d+\s*[.．、]\s*/,''))+'</span><small>'+esc(cards[i]?(cards[i].n+' · '+(window.JYTarotReading?window.JYTarotReading.label(cards[i]):'')):'尚未選牌')+'</small></li>';}).join('');
      var recent=document.getElementById('tarot-last-card');
      if(recent){
        var last=cards[count-1];
        if(last&&window.JYTarotReading)recent.innerHTML='<div class="at-recent-face">'+window.JYTarotReading.face(last)+'</div><div><small>剛選的第 '+count+' 張</small><strong>'+esc(last.n)+' · '+esc(window.JYTarotReading.label(last))+'</strong><p>'+esc(last.pos)+'</p></div>';
        else recent.innerHTML='<span>'+(window._deckIsShuffled?'左右滑動牌背，選一張你想停下來的牌。':'選牌前先洗牌，讓心緒沉澱。')+'</span>';
      }
      var hint=document.getElementById('pick-hint');
      if(hint){hint.style.display='';hint.textContent=complete?'牌陣已完成，可查看牌位或取得解讀提示詞。':window._deckIsShuffled?'慢慢選牌，讓問題留在心裡。':'留一段時間，專注在你的問題。';}
    },
    setMode: function (tool) {
      var input = document.getElementById('input-screen');
      if (!input || (tool !== 'tarot' && tool !== 'ootk')) return;
      input.setAttribute('data-atelier-mode', tool);
      var label = input.querySelector('.at-input-head .at-eyebrow');
      if (label) label.textContent = tool === 'ootk' ? 'OPENING OF THE KEY · 深入脈絡' : 'TAROT · 此刻的選擇';
      if(window.JYCinemaUI)window.JYCinemaUI.input();
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
      if(window.JYCinemaUI)window.JYCinemaUI.enhance(root);
    }
  };
  window._atelierChoose = function (tool) {
    entrance = document.activeElement;
    if (tool === 'tarot' || tool === 'ootk') {
      window._enterFromHome();
      window.pickTool(tool, { stayAtQuestion: true });
      var input = document.getElementById('input-screen');
      if (input) input.setAttribute('data-atelier-mode', tool);
      var heading = input && input.querySelector('.at-input-head');
      if (heading) { heading.tabIndex=-1; heading.focus({ preventScroll: true }); }
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
    if(window.JYTarotSession)window.JYTarotSession.reset();
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
    if(window.JYTarotSession)window.JYTarotSession.reset();
    if (typeof window.goStep === 'function') window.goStep(0);
    if (typeof window._enterFromHome === 'function') window._enterFromHome();
    var input = document.getElementById('input-screen');
    var home = document.getElementById('hook-screen');
    if (input) input.style.display = 'block';
    if (home) home.style.display = 'none';
    var heading=input&&input.querySelector('.at-input-head');
    if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true});}
    window.scrollTo({ top: 0, behavior: 'instant' });
  };
  // The visible action owns the ceremony. Never delegate to a hidden, stale DOM button.
  window._atelierStartTarotShuffle=function(){
    if(window._deckIsShuffled || (window.JYRitual && window.JYRitual.isActive()))return;
    function report(message){var hint=document.getElementById('pick-hint');if(hint){hint.textContent=message;hint.style.display='';hint.setAttribute('role','alert');if(hint.scrollIntoView)hint.scrollIntoView({block:'center'});}else window.alert(message);}
    if(!window.JYRitual || typeof window.JYRitual.play!=='function'){
      report('洗牌元件尚未載入，請重新整理頁面後再試。');return;
    }
    try{
      if(typeof deckShuffled==='undefined'||!deckShuffled.length){
        if(typeof initTarotDeck==='function')initTarotDeck();
      }
      var deck=document.getElementById('t-deck');
      if(!deck || typeof deckShuffled==='undefined' || !deckShuffled.length){
        report('牌組尚未準備完成，請返回修改問題後重新進入。');return;
      }
      var epoch=window.JYTarotSession?window.JYTarotSession.epoch():0;
      return window.JYRitual.play('tarot',{
        variant:'shuffle',question:(typeof S!=='undefined'&&S.form&&S.form.question)||'',finishLabel:'開始選牌',
        onComplete:function(){
          if(window.JYTarotSession && epoch!==window.JYTarotSession.epoch())return;
          deck.querySelectorAll('.tarot-deck-card').forEach(function(card){
            var face=card.querySelector('.tdc-face'),back=card.querySelector('.tdc-back');
            if(face)face.style.display='none';if(back)back.style.transform='none';
            card.style.visibility='';card.classList.remove('shuffling','deck-center');
          });
          window._deckIsShuffled=true;
          var old=document.getElementById('jy-shuffle-btn');if(old)old.remove();
          window.JY_ATELIER.syncTarot();
        },
        onCancel:function(){window._atelierReturnToInput();}
      });
    }catch(error){
      console.error('[Tarot shuffle]',error);
      window._deckIsShuffled=false;
      report('洗牌未能啟動，請返回修改問題後重試。');
    }
  };
  window._atelierTarotAction=function(){
    if(window.JYRitual && window.JYRitual.isActive())return;
    var def=typeof getCurrentSpreadDef==='function'?getCurrentSpreadDef():null;
    if(!def)return;
    if(typeof drawnCards!=='undefined'&&drawnCards.length===def.count){
      var analyze=document.getElementById('btn-analyze');if(analyze&&!analyze.disabled)analyze.click();return;
    }
    if(!window._deckIsShuffled)return window._atelierStartTarotShuffle();
    if(typeof autoDraw==='function')autoDraw();
  };
  // Measure the real header so larger text and wrapped navigation stay usable.
  function measureHeader(){var nav=document.querySelector('body>.nav');if(!nav)nav=document.querySelector('.nav');if(nav)document.documentElement.style.setProperty('--jy-header-height',Math.ceil(nav.getBoundingClientRect().height)+'px');}
  function start(){measureHeader();var nav=document.querySelector('.nav');if(nav&&window.ResizeObserver){var observer=new ResizeObserver(measureHeader);observer.observe(nav);}window.JY_ATELIER.syncTarot();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
