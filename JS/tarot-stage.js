/* 靜月塔羅・立體牌桌的舞台與同步（2026-11-12）
 * 使用者要求把塔羅整個重做成沉浸式。原本的流程是：平面的洗牌過場 → 一格一格的牌背 → 清單。
 * 現在按「開始洗牌」會進到一張立體牌桌（JS/tarot-scene.js，單一 WebGL 畫布）：用手洗牌 → 收牌、切三疊 → 展成弧 → 伸手選牌 → 牌飛到牌位 → 逐張翻開。
 * 抽到哪張、正逆位仍由原本的塔羅程式決定：這裡在使用者點立體牌時，去點原本牌堆裡對應的一張，再把程式給的結果翻出來。
 * 裝置不支援 WebGL 或載入失敗時，退回原本的洗牌過場，流程不受影響。
 */
(function(){
  'use strict';
  if(window._jyTarotStageLoaded)return;window._jyTarotStageLoaded=true;
  var VER=(function(){try{var s=document.currentScript&&document.currentScript.src||'';var m=s.match(/[?&]v=([^&]+)/);return m?m[1]:'1';}catch(_){return '1';}})();
  var css=document.createElement('style');css.id='jy-tar3d-style';
  css.textContent=[
    '.tar3d{position:fixed;inset:0;z-index:2147483000;background:#05070f;color:#f1e8d2;font-family:var(--f-display,"Noto Serif TC",serif);opacity:0;transition:opacity .45s;-webkit-tap-highlight-color:transparent;touch-action:none;overscroll-behavior:contain}',
    '.tar3d.on{opacity:1}',
    '.tar3d-host{position:absolute;inset:0}.tar3d-canvas{display:block;width:100%;height:100%;touch-action:none}',
    '.tar3d-top{position:absolute;left:0;right:0;top:0;display:flex;align-items:center;justify-content:space-between;padding:calc(10px + env(safe-area-inset-top)) 14px 10px;background:linear-gradient(180deg,rgba(5,7,15,.86),rgba(5,7,15,0));pointer-events:none}',
    '.tar3d-top button{pointer-events:auto;background:rgba(18,24,44,.8);border:1px solid rgba(214,178,96,.4);color:#f1e8d2;border-radius:999px;padding:8px 14px;font-size:.86rem}',
    '.tar3d-title{font-size:.82rem;letter-spacing:.3em;color:#d6b260}',
    '.tar3d-hud{position:absolute;left:0;right:0;bottom:0;padding:26px 18px calc(18px + env(safe-area-inset-bottom));background:linear-gradient(180deg,rgba(5,7,15,0),rgba(5,7,15,.9) 46%);text-align:center;pointer-events:none}',
    '.tar3d-line{font-size:1.04rem;line-height:1.6;min-height:1.6em;color:#f4e7bd;transition:opacity .3s}',
    '.tar3d-sub{font-size:.84rem;color:rgba(241,232,210,.72);margin-top:4px;min-height:1.3em}',
    '.tar3d-btn{pointer-events:auto;display:block;width:100%;max-width:420px;margin:14px auto 0;padding:14px;border-radius:14px;border:0;background:linear-gradient(135deg,#f1dfa6,#c79f45);color:#1b1505;font-size:1rem;font-weight:700;letter-spacing:.06em;transition:opacity .25s,transform .15s}',
    '.tar3d-btn:active{transform:scale(.98)}.tar3d-btn[disabled]{opacity:.38}.tar3d-btn.ghost{background:none;border:1px solid rgba(214,178,96,.45);color:#f4e7bd;font-weight:500}',
    '.tar3d-dots{display:flex;gap:7px;justify-content:center;margin-top:10px}.tar3d-dots i{width:9px;height:9px;border-radius:50%;border:1px solid rgba(214,178,96,.7);transition:background .3s}.tar3d-dots i.f{background:#d6b260}'
  ].join('');
  document.head.appendChild(css);

  function buzz(p){try{if(navigator.vibrate)navigator.vibrate(p);}catch(_){}}
  function webgl(){try{var c=document.createElement('canvas');return !!(window.WebGLRenderingContext&&(c.getContext('webgl2')||c.getContext('webgl')));}catch(_){return false;}}
  var loading=false,failed=false,origPlay=null,stage=null;
  function load(){if(window.JYTarotSceneModule||loading||failed||!webgl())return;loading=true;var s=document.createElement('script');s.src='JS/tarot-scene.js?v='+encodeURIComponent(VER);s.async=true;s.onload=function(){loading=false;};s.onerror=function(){loading=false;failed=true;};document.head.appendChild(s);}
  function drawn(){try{return (typeof drawnCards!=='undefined'&&drawnCards)?drawnCards:[];}catch(_){return [];}}
  function spreadCount(){try{var d=typeof getCurrentSpreadDef==='function'?getCurrentSpreadDef():null;return (d&&d.count)||3;}catch(_){return 3;}}
  function deckCards(){var deck=document.getElementById('t-deck');if(!deck)return [];var seen={},out=[];deck.querySelectorAll('.tarot-deck-card:not(.picked)').forEach(function(c){var k=c.getAttribute('data-idx');if(k==null||seen[k])return;seen[k]=1;out.push(c);});return out;}

  function open(opts){
    var layer=document.createElement('div');layer.className='tar3d';layer.setAttribute('role','dialog');layer.setAttribute('aria-label','塔羅牌桌');
    layer.innerHTML='<div class="tar3d-host"></div><div class="tar3d-top"><button type="button" class="tar3d-back">← 返回</button><span class="tar3d-title">月下牌桌</span><span style="width:64px"></span></div><div class="tar3d-hud"><div class="tar3d-line"></div><div class="tar3d-sub"></div><div class="tar3d-dots"></div><button type="button" class="tar3d-btn"></button></div>';
    document.body.appendChild(layer);
    var $=function(s){return layer.querySelector(s);},line=$('.tar3d-line'),sub=$('.tar3d-sub'),btn=$('.tar3d-btn'),dots=$('.tar3d-dots');
    var S={layer:layer,scene:null,opts:opts,shuffled:false,busy:false,count:spreadCount(),closed:false,act:null,timers:[]};
    function later(fn,ms){var t=setTimeout(function(){if(!S.closed)fn();},ms);S.timers.push(t);return t;}
    function say(a,b){line.textContent=a||'';sub.textContent=b||'';}
    function button(label,fn,dis){if(!label){btn.style.display='none';S.act=null;return;}btn.style.display='';btn.textContent=label;btn.disabled=!!dis;S.act=fn;}
    function paintDots(){var n=S.count,k=drawn().length,h='';for(var i=0;i<n;i++)h+='<i class="'+(i<k?'f':'')+'"></i>';dots.innerHTML=h;}
    btn.addEventListener('click',function(){if(S.act&&!btn.disabled)S.act();});
    function close(){
      if(S.closed)return;S.closed=true;S.timers.forEach(clearTimeout);layer.classList.remove('on');
      setTimeout(function(){try{if(S.scene)S.scene.dispose();}catch(_){}if(layer.parentNode)layer.parentNode.removeChild(layer);},460);
      if(stage===S)stage=null;
      if(!S.shuffled&&opts&&typeof opts.onCancel==='function'){try{opts.onCancel();}catch(_){}}
    }
    S.close=close;$('.tar3d-back').addEventListener('click',close);
    try{S.scene=window.JYTarotSceneModule.create($('.tar3d-host'),{onPick:onPick});S.scene.onLost(function(){var sh=S.shuffled;close();if(!sh&&origPlay)origPlay.call(window.JYRitual,'tarot',opts);});}
    catch(e){S.closed=true;if(layer.parentNode)layer.parentNode.removeChild(layer);return false;}
    stage=S;requestAnimationFrame(function(){layer.classList.add('on');});
    window.addEventListener('deviceorientation',function(e){if(S.closed||!S.scene||e.gamma==null)return;S.scene.tilt(e.gamma/30,((e.beta||45)-45)/34);});

    // 一、牌疊在桌上，等他伸手
    S.scene.mode('stack');say('靜下來，把問題放在心裡。','準備好了，就把牌洗開。');dots.innerHTML='';button('把牌洗開',startWash);
    function startWash(){S.scene.mode('wash');buzz(20);say('用手指在桌上畫圈，把牌攪開。','洗到你覺得夠了為止。');button('洗好了',finishWash,true);later(function(){btn.disabled=false;},1500);later(finishWash,12000);}
    function finishWash(){if(S.scene.state!=='wash')return;button(null);say('把牌收攏。','');S.scene.mode('gather');buzz(15);
      later(function(){say('切成三疊，再疊回去。','');S.scene.mode('cut');buzz([15,90,15,90,15]);},1100);
      later(function(){S.shuffled=true;try{if(opts&&typeof opts.onComplete==='function')opts.onComplete();}catch(e){}later(spread,250);},3050);}
    // 二、展成一道弧，選牌
    function spread(){S.count=spreadCount();S.scene.mode('ribbon',{count:S.count});paintDots();say('左右滑動看牌，輕點你有感覺的那一張。','要選 '+S.count+' 張');button('替我抽完',quick);buzz(25);
      if(drawn().length>=S.count)later(revealAll,600);}
    function domPick(pos,total,done){
      var list=deckCards(),before=drawn().length;if(!list.length)return done(false);
      var el=list[Math.max(0,Math.min(list.length-1,Math.round(pos*(list.length-1)/Math.max(1,total-1))))];try{el.click();}catch(_){return done(false);}
      var tries=0;(function wait(){if(S.closed)return;if(drawn().length>before)return done(true,before);if(++tries>40)return done(false);setTimeout(wait,80);})();
    }
    function onPick(pos,ci){
      if(S.busy||S.closed||!S.shuffled||drawn().length>=S.count)return;S.busy=true;var total=S.scene.remainingCount();
      domPick(pos,total,function(ok,slot){
        if(!ok){S.busy=false;say('這一張沒有選到，再點一次。','要選 '+S.count+' 張');return;}
        S.scene.take(pos,slot,ci);buzz(22);paintDots();var k=drawn().length;say(k<S.count?'再選下一張。':'牌選好了。','已選 '+k+' / '+S.count);
        later(function(){S.busy=false;if(drawn().length>=S.count)revealAll();},520);
      });
    }
    function quick(){if(S.busy||S.closed)return;button(null);(function next(){if(S.closed)return;if(drawn().length>=S.count)return;var total=S.scene.remainingCount(),pos=Math.floor(((Date.now()%997)/997)*total);S.busy=false;onPick(pos,null);later(next,760);})();}
    // 三、逐張翻開
    var revealing=false;
    function revealAll(){if(revealing||S.closed)return;revealing=true;button(null);S.scene.mode('reveal');S.scene.focusSlots();say('牌位已滿。','一張一張翻開。');
      var d=drawn(),i=0;(function step(){if(S.closed)return;if(i>=S.count||i>=d.length){say('牌都翻開了。','');button('看完整牌陣與解讀',close);return;}
        var c=d[i],url='';try{url=typeof getTarotCardImage==='function'?getTarotCardImage(c):'';}catch(_){}
        var idx=i;later(function(){say((c&&c.n)||'',(c&&c.isUp===false)?'逆位':'正位');buzz(c&&c.isUp===false?[20,40,20]:30);},420);
        S.scene.reveal(i,url,!(c&&c.isUp===false),function(){i=idx+1;later(step,620);});})();}
    return true;
  }
  // 攔下塔羅的洗牌過場；立體牌桌開著時，其餘塔羅過場（揭牌）由牌桌自己演，直接回報完成。
  function patch(){
    if(origPlay||!window.JYRitual||typeof window.JYRitual.play!=='function')return;
    origPlay=window.JYRitual.play;
    window.JYRitual.play=function(kind,opts){
      if(kind==='tarot'){
        if(stage&&!stage.closed){var o=opts||{};setTimeout(function(){try{if(typeof o.onComplete==='function')o.onComplete();}catch(_){}},0);return;}
        if(opts&&opts.variant==='shuffle'&&window.JYTarotSceneModule&&!failed){if(open(opts))return;}
      }
      return origPlay.apply(this,arguments);
    };
  }
  var poll=setInterval(function(){patch();var d=document.getElementById('tarot-dock-action');if(d&&d.offsetParent!==null)load();if(origPlay&&(window.JYTarotSceneModule||failed))clearInterval(poll);},700);
})();
