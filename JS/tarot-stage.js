/* 靜月・立體牌桌的舞台與同步 v3（2026-11-12）
 * 塔羅快讀與雷諾曼共用同一張立體牌桌（JS/tarot-scene.js，單一 WebGL 畫布）：
 *   攤開洗牌 → 收牌敲齊 → 切三疊 → 一路推開成弧 → 選牌、放到牌陣上的位置 → 逐張翻開 → 回到原本的結果頁。
 * 抽到什麼牌仍由各自原本的程式決定，這裡只負責演出與回報使用者的動作：
 *   塔羅：使用者點立體牌時，去點原本牌堆 #t-deck 裡對應的一張，再把 drawnCards 的結果翻出來。
 *   雷諾曼：原程式在進場前就已抽好牌（原本的過場也是如此），這裡依序把抽好的牌發到牌陣上。
 * 音效沿用站內的 JYFoley（shuffle、card）。不支援 WebGL、載入失敗或繪圖環境遺失時，退回原本的過場。
 */
(function(){
  'use strict';
  if(window._jyTarotStageLoaded)return;window._jyTarotStageLoaded=true;
  var VER=(function(){try{var s=document.currentScript&&document.currentScript.src||'';var m=s.match(/[?&]v=([^&]+)/);return m?m[1]:'1';}catch(_){return '1';}})();
  var css=document.createElement('style');css.id='jy-tar3d-style';
  css.textContent=[
    '.tar3d{position:fixed;inset:0;z-index:2147483000;background:#05070f center top/cover no-repeat;color:#f1e8d2;font-family:var(--f-display,"Noto Serif TC",serif);opacity:0;transition:opacity .45s;-webkit-tap-highlight-color:transparent;touch-action:none;overscroll-behavior:contain}',
    '.tar3d.on{opacity:1}',
    '.tar3d::before{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(5,7,15,.5) 0%,rgba(5,7,15,.18) 22%,rgba(5,7,15,.55) 46%,rgba(5,7,15,.9) 100%);pointer-events:none}',
    '.tar3d-host{position:absolute;inset:0}.tar3d-canvas{display:block;width:100%;height:100%;touch-action:none}',
    '.tar3d-vig{position:absolute;inset:0;pointer-events:none;background:radial-gradient(120% 85% at 50% 55%,rgba(0,0,0,0) 52%,rgba(2,3,8,.62) 100%)}',
    '.tar3d-top{position:absolute;left:0;right:0;top:0;display:flex;align-items:center;justify-content:space-between;padding:calc(10px + env(safe-area-inset-top)) 14px 10px;background:linear-gradient(180deg,rgba(5,7,15,.86),rgba(5,7,15,0));pointer-events:none}',
    '.tar3d-top button{pointer-events:auto;background:rgba(18,24,44,.8);border:1px solid rgba(214,178,96,.4);color:#f1e8d2;border-radius:999px;padding:8px 14px;font-size:.86rem}',
    '.tar3d-title{font-size:.82rem;letter-spacing:.3em;color:#d6b260}',
    '.tar3d-hud{position:absolute;left:0;right:0;bottom:0;padding:30px 18px calc(18px + env(safe-area-inset-bottom));background:linear-gradient(180deg,rgba(5,7,15,0),rgba(5,7,15,.92) 48%);text-align:center;pointer-events:none}',
    '.tar3d-line{font-size:1.04rem;line-height:1.6;min-height:1.6em;color:#f4e7bd}',
    '.tar3d-sub{font-size:.84rem;color:rgba(241,232,210,.74);margin-top:4px;min-height:1.3em}',
    '.tar3d-btn{pointer-events:auto;display:block;width:100%;max-width:420px;margin:14px auto 0;padding:14px;border-radius:14px;border:0;background:linear-gradient(135deg,#f1dfa6,#c79f45);color:#1b1505;font-size:1rem;font-weight:700;letter-spacing:.06em;transition:opacity .25s,transform .15s}',
    '.tar3d-btn:active{transform:scale(.98)}.tar3d-btn[disabled]{opacity:.38}',
    /* 2026-11-12 精緻化：文字換句時淡出淡入、金色細線與標題飾紋、按鈕的光澤掃過；都只動 opacity 與 transform */
    '.tar3d-line,.tar3d-sub{transition:opacity .22s ease,transform .22s ease}.tar3d-line.sw,.tar3d-sub.sw{opacity:0;transform:translateY(5px)}',
    '.tar3d-line{letter-spacing:.04em;text-shadow:0 2px 14px rgba(0,0,0,.75)}.tar3d-sub{letter-spacing:.03em;text-shadow:0 1px 10px rgba(0,0,0,.8)}',
    '.tar3d-hud::before{content:"";display:block;width:86px;height:1px;margin:0 auto 14px;background:linear-gradient(90deg,rgba(214,178,96,0),rgba(214,178,96,.9),rgba(214,178,96,0))}',
    '.tar3d-title::before{content:"✦";margin-right:.9em;font-size:.7em;opacity:.8}.tar3d-title::after{content:"✦";margin-left:.6em;font-size:.7em;opacity:.8}',
    '.tar3d-btn{position:relative;overflow:hidden;box-shadow:0 10px 26px rgba(0,0,0,.45),inset 0 1px 0 rgba(255,255,255,.55);background:linear-gradient(180deg,#f6e7b4 0%,#dcbb66 55%,#c39a40 100%)!important}',
    '.tar3d-btn::after{content:"";position:absolute;top:0;bottom:0;left:0;width:38%;background:linear-gradient(100deg,rgba(255,255,255,0),rgba(255,255,255,.5),rgba(255,255,255,0));transform:translateX(-140%) skewX(-18deg);animation:tar3dShine 4.6s ease-in-out infinite}',
    '@keyframes tar3dShine{0%,62%{transform:translateX(-140%) skewX(-18deg)}100%{transform:translateX(380%) skewX(-18deg)}}',
    '@media (prefers-reduced-motion:reduce){.tar3d-btn::after{animation:none}.tar3d-line,.tar3d-sub{transition:none}}',
    '.tar3d-dots{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin-top:10px;max-width:300px;margin-left:auto;margin-right:auto}.tar3d-dots i{width:8px;height:8px;border-radius:50%;border:1px solid rgba(214,178,96,.7);transition:background .3s}.tar3d-dots i.f{background:#d6b260}'
  ].join('');
  document.head.appendChild(css);

  function buzz(p){try{if(navigator.vibrate)navigator.vibrate(p);}catch(_){}}
  function snd(key,vol,delay){try{if(window.JYFoley&&window.JYFoley.play)window.JYFoley.play(key,{scope:'table3d',volume:vol==null?.7:vol,delay:delay||0,throttle:60});}catch(_){}}
  function webgl(){try{var c=document.createElement('canvas');return !!(window.WebGLRenderingContext&&(c.getContext('webgl2')||c.getContext('webgl')));}catch(_){return false;}}
  var loading=false,failed=false,origPlay=null,stage=null;
  // 開鑰之法接牌桌的程式已寫好，但 2026-11-12 的自動測試沒能走到它的洗牌那一步（卡在選代表牌），沒有驗證過就不啟用，以免像八字那次一樣把流程弄斷。驗證後改成 true。
  var OOTK_ON_TABLE=false;
  function load(){if(window.JYTarotSceneModule||loading||failed||!webgl())return;loading=true;var s=document.createElement('script');s.src='JS/tarot-scene.js?v='+encodeURIComponent(VER);s.async=true;s.onload=function(){loading=false;};s.onerror=function(){loading=false;failed=true;};document.head.appendChild(s);}

  // ── 兩種牌各自的接法 ──
  function tarotKit(opts){
    function drawn(){try{return (typeof drawnCards!=='undefined'&&drawnCards)?drawnCards:[];}catch(_){return [];}}
    function def(){try{return typeof getCurrentSpreadDef==='function'?getCurrentSpreadDef():null;}catch(_){return null;}}
    function deckCards(){var deck=document.getElementById('t-deck');if(!deck)return [];var seen={},out=[];deck.querySelectorAll('.tarot-deck-card:not(.picked)').forEach(function(c){var k=c.getAttribute('data-idx');if(k==null||seen[k])return;seen[k]=1;out.push(c);});return out;}
    return {title:'月下牌桌',deck:78,back:'assets/cards/bright-20261011/tarot/back.webp',bg:'assets/ui/ritual-moon-sanctum.webp',preset:false,
      need:function(){var d=def();return (d&&d.count)||3;},spread:function(){var d=def();return {id:d&&d.id,names:(d&&d.positions||[]).map(function(p){return p&&p.name||'';})};},
      onShuffled:function(){if(opts&&typeof opts.onComplete==='function')opts.onComplete();},onCancel:function(){if(opts&&typeof opts.onCancel==='function')opts.onCancel();},onFinish:function(){},
      count:function(){return drawn().length;},
      pick:function(pos,total,done,alive){var list=deckCards(),before=drawn().length;if(!list.length)return done(false);var el=list[Math.max(0,Math.min(list.length-1,Math.round(pos*(list.length-1)/Math.max(1,total-1))))];try{el.click();}catch(_){return done(false);}
        var tries=0;(function wait(){if(!alive())return;if(drawn().length>before)return done(true,before);if(++tries>40)return done(false);setTimeout(wait,80);})();},
      card:function(i){var c=drawn()[i]||{},url='';try{url=typeof getTarotCardImage==='function'?getTarotCardImage(c):'';}catch(_){}return {url:url,name:c.n||'',upright:c.isUp!==false,showOrientation:true};}};
  }
  function lenormandKit(opts){
    var cards=(opts&&opts.cards)||[],n=0,id=opts&&opts.spreadId;
    return {title:'月下牌桌・雷諾曼',deck:36,back:'assets/cards/bright-20261011/lenormand/back.webp',bg:'assets/ui/ritual-moon-garden.webp',preset:true,
      need:function(){return cards.length;},spread:function(){return {id:'ln-'+id,names:[],cols:cards.length===9?3:cards.length>10?9:0};},
      onShuffled:function(){},onCancel:function(){if(opts&&typeof opts.onCancel==='function')opts.onCancel();},onFinish:function(){if(opts&&typeof opts.onComplete==='function')opts.onComplete();},
      count:function(){return n;},pick:function(pos,total,done){if(n>=cards.length)return done(false);var slot=n;n++;done(true,slot);},
      card:function(i){var c=cards[i]||{};return {url:c.image||'',name:c.name||'',upright:true,showOrientation:false};}};
  }

  // 開鑰之法：原本的過場只是進五輪之前的洗牌儀式，抽牌與五輪由它自己的畫面處理；這裡演完洗牌與切牌就交回去。
  function ootkKit(opts){return {title:'月下牌桌・開鑰之法',deck:78,back:'assets/cards/bright-20261011/tarot/back.webp',bg:'assets/ui/ritual-moon-sanctum.webp',preset:true,shuffleOnly:true,need:function(){return 0;},spread:function(){return {};},onShuffled:function(){},onCancel:function(){if(opts&&typeof opts.onCancel==='function')opts.onCancel();},onFinish:function(){if(opts&&typeof opts.onComplete==='function')opts.onComplete();},count:function(){return 0;},pick:function(p,t,done){done(false);},card:function(){return {};}};}
  function open(kit){
    var layer=document.createElement('div');layer.className='tar3d';layer.setAttribute('role','dialog');layer.setAttribute('aria-label',kit.title);if(kit.bg)layer.style.backgroundImage='url('+kit.bg+')';
    layer.innerHTML='<div class="tar3d-host"></div><div class="tar3d-vig"></div><div class="tar3d-top"><button type="button" class="tar3d-back">← 返回</button><span class="tar3d-title"></span><span style="width:64px"></span></div><div class="tar3d-hud"><div class="tar3d-line"></div><div class="tar3d-sub"></div><div class="tar3d-dots"></div><button type="button" class="tar3d-btn"></button></div>';
    document.body.appendChild(layer);
    var $=function(s){return layer.querySelector(s);},line=$('.tar3d-line'),sub=$('.tar3d-sub'),btn=$('.tar3d-btn'),dots=$('.tar3d-dots');$('.tar3d-title').textContent=kit.title;
    var S={scene:null,shuffled:false,finished:false,busy:false,count:kit.need(),closed:false,act:null,timers:[],names:[]};
    function alive(){return !S.closed;}
    function later(fn,ms){var t=setTimeout(function(){if(!S.closed)fn();},ms);S.timers.push(t);return t;}
    function say(a,b){a=a||'';b=b||'';if(S.sayA===a&&S.sayB===b)return;S.sayA=a;S.sayB=b;line.classList.add('sw');sub.classList.add('sw');clearTimeout(S.sayT);S.sayT=setTimeout(function(){line.textContent=S.sayA;sub.textContent=S.sayB;line.classList.remove('sw');sub.classList.remove('sw');},170);}
    function button(label,fn,dis){if(!label){btn.style.display='none';S.act=null;return;}btn.style.display='';btn.textContent=label;btn.disabled=!!dis;S.act=fn;}
    function paintDots(){var n=S.count,k=kit.count();if(n>12){dots.innerHTML='';return;}var h='';for(var i=0;i<n;i++)h+='<i class="'+(i<k?'f':'')+'"></i>';dots.innerHTML=h;}
    btn.addEventListener('click',function(){if(S.act&&!btn.disabled)S.act();});
    function close(){
      if(S.closed)return;S.closed=true;S.timers.forEach(clearTimeout);layer.classList.remove('on');
      setTimeout(function(){try{if(S.scene)S.scene.dispose();}catch(_){}if(layer.parentNode)layer.parentNode.removeChild(layer);},460);
      if(stage===S)stage=null;
      try{if(S.finished)kit.onFinish();else if(!S.shuffled||kit.preset)kit.onCancel();}catch(_){}
    }
    S.close=close;$('.tar3d-back').addEventListener('click',close);
    var lastStir=0;
    try{S.scene=window.JYTarotSceneModule.create($('.tar3d-host'),{count:kit.deck,back:kit.back,onPick:onPick,onStir:function(){var t=Date.now();if(t-lastStir>850){lastStir=t;snd('shuffle',.5);}}});
      S.scene.onLost(function(){S.closed=true;S.timers.forEach(clearTimeout);try{S.scene.dispose();}catch(_){}if(layer.parentNode)layer.parentNode.removeChild(layer);if(stage===S)stage=null;failed=true;if(S.shuffled&&!kit.preset)return;if(kit.fallback)kit.fallback();});}
    catch(e){S.closed=true;if(layer.parentNode)layer.parentNode.removeChild(layer);return false;}
    stage=S;requestAnimationFrame(function(){layer.classList.add('on');});
    window.addEventListener('deviceorientation',function(e){if(S.closed||!S.scene||e.gamma==null)return;S.scene.tilt(e.gamma/30,((e.beta||45)-45)/34);});

    // 一、牌疊在桌上
    S.scene.mode('stack');say('靜下來，把問題放在心裡。','準備好了，就把牌在桌上攤開來洗。');dots.innerHTML='';button('把牌攤開',startWash);
    function startWash(){S.scene.mode('wash');buzz(20);snd('shuffle',.75);say('手放上去，把牌推開、攪亂。','你推到哪裡，哪裡的牌就會動；洗到你覺得夠了為止。');button('洗好了',finishWash,true);later(function(){btn.disabled=false;},2200);later(finishWash,20000);}
    function finishWash(){if(S.scene.state!=='wash')return;button(null);say('把牌攏回來，敲齊。','');S.scene.mode('gather');buzz(15);snd('card',.6);snd('card',.7,.85);
      later(function(){say('切牌：分成三疊，再反著疊回去。','');S.scene.mode('cut');buzz([15,480,15,900,20,400,20]);snd('card',.6,.5);snd('card',.6,1.05);snd('card',.65,2.2);snd('card',.7,2.8);snd('card',.75,3.35);},1500);
      later(function(){S.shuffled=true;try{kit.onShuffled();}catch(e){}if(kit.shuffleOnly){S.scene.mode('stack');say('牌洗好、切好了。','接下來，從代表牌開始走五輪。');later(function(){S.finished=true;button('開始五輪',close);},700);}else later(spread,200);},5300);}
    // 二、一路推開成弧，選牌
    function spread(){S.count=kit.need();var sp=kit.spread()||{};S.names=sp.names||[];S.scene.mode('ribbon',{count:S.count,id:sp.id,names:S.names,cols:sp.cols});snd('shuffle',.6);paintDots();
      say('牌一路推開了。左右滑動，輕點你有感覺的那一張。',(S.count>10?'一張一張發到牌陣上，共 ':'依序放到牌陣上，要選 ')+S.count+' 張');button(S.count>10?'替我發完':'替我抽完',quick);buzz(25);
      if(kit.count()>=S.count)later(revealAll,600);}
    function onPick(pos,ci){
      if(S.busy||S.closed||!S.shuffled||kit.count()>=S.count)return;S.busy=true;var total=S.scene.remainingCount();
      kit.pick(pos,total,function(ok,slot){
        if(!ok){S.busy=false;say('這一張沒有選到，再點一次。','');return;}
        S.scene.take(pos,slot,ci);buzz(22);snd('card',.7);paintDots();var k=kit.count(),nm=(S.names&&S.names[slot])||'';say(k<S.count?'再選下一張。':'牌選好了。',(nm?'這一張放在「'+nm+'」　':'')+'已選 '+k+' / '+S.count);
        later(function(){S.busy=false;if(kit.count()>=S.count)revealAll();},kit.preset?(S.count>10?140:380):520);
      },alive);
    }
    function quick(){if(S.closed)return;button(null);var gap=kit.preset?(S.count>10?230:520):760;(function next(){if(S.closed||kit.count()>=S.count)return;var total=S.scene.remainingCount(),pos=Math.floor(((Date.now()%997)/997)*total);S.busy=false;onPick(pos,null);later(next,gap);})();}
    // 三、翻開
    var revealing=false;
    function revealAll(){if(revealing||S.closed)return;revealing=true;button(null);S.scene.mode('reveal');say('牌陣擺好了。',S.count>10?'整個牌陣翻開。':'照順序，一張一張翻開。');
      var i=0,fast=S.count>10;
      function done(){S.finished=true;say('牌都翻開了。','');button(kit.preset?'看牌陣與解讀':'看完整牌陣與解讀',close);}
      (function step(){if(S.closed)return;if(i>=S.count)return later(done,fast?900:0);var idx=i,c=kit.card(idx);
        if(!fast)later(function(){say(c.name||'',((S.names&&S.names[idx])?S.names[idx]+'　':'')+(c.showOrientation?(c.upright?'正位':'逆位'):''));buzz(c.upright?30:[20,40,20]);snd('card',.75);},420);
        else if(idx%4===0)snd('card',.55);
        if(fast){S.scene.reveal(idx,c.url,c.upright,null);i=idx+1;later(step,170);}
        else S.scene.reveal(idx,c.url,c.upright,function(){i=idx+1;later(step,620);});})();}
    return true;
  }
  // 攔下塔羅洗牌與雷諾曼的過場；牌桌開著時，同類的其餘過場（揭牌）由牌桌自己演，直接回報完成。
  function patch(){
    if(origPlay||!window.JYRitual||typeof window.JYRitual.play!=='function')return;
    origPlay=window.JYRitual.play;
    window.JYRitual.play=function(kind,opts){
      var self=this,args=arguments,ready=window.JYTarotSceneModule&&!failed;
      if(kind==='tarot'){
        if(stage&&!stage.closed){var o=opts||{};setTimeout(function(){try{if(typeof o.onComplete==='function')o.onComplete();}catch(_){}},0);return;}
        if(opts&&opts.variant==='shuffle'&&ready){var k=tarotKit(opts);k.fallback=function(){origPlay.apply(self,args);};if(open(k))return;}
      }else if(OOTK_ON_TABLE&&kind==='ootk'&&ready&&!(stage&&!stage.closed)){var k3=ootkKit(opts||{});k3.fallback=function(){origPlay.apply(self,args);};if(open(k3))return;
      }else if(kind==='lenormand'&&ready&&opts&&opts.cards&&opts.cards.length){var k2=lenormandKit(opts);k2.fallback=function(){origPlay.apply(self,args);};if(open(k2))return;}
      return origPlay.apply(this,arguments);
    };
  }
  function shown(e){return !!(e&&e.getClientRects&&e.getClientRects().length&&getComputedStyle(e).display!=='none'&&getComputedStyle(e).visibility!=='hidden');}
  function near(){return shown(document.getElementById('tarot-dock-action'))||shown(document.getElementById('ln-screen'))||shown(document.getElementById('ootk-sig-overlay'))||shown(document.getElementById('btn-tool-go'));}
  var poll=setInterval(function(){patch();if(near())load();if(origPlay&&(window.JYTarotSceneModule||failed))clearInterval(poll);},700);
})();
