/* 靜月八字・立體四柱殿的舞台與同步（2026-11-12）
 * 攔下八字的過場（JYRitual.play('bazi')），改演立體四柱殿（JS/pillar-scene.js）。柱上的干支由八字程式算好後傳入（sealValues）。
 * 回傳值與原本相容：可 await，結果有 finished；也會呼叫 onComplete／onCancel。不支援 WebGL 或載入失敗時退回原本的過場。
 */
(function(){
  'use strict';
  if(window._jyPillarStageLoaded)return;window._jyPillarStageLoaded=true;
  var VER=(function(){try{var s=document.currentScript&&document.currentScript.src||'';var m=s.match(/[?&]v=([^&]+)/);return m?m[1]:'1';}catch(_){return '1';}})();
  var css=document.createElement('style');css.id='jy-pil3d-style';
  css.textContent=[
    '.pil3d{position:fixed;inset:0;z-index:2147483000;background:#05070f url(assets/ui/ritual-celestial-observatory.webp) center top/cover no-repeat;color:#f1e8d2;font-family:var(--f-display,"Noto Serif TC",serif);opacity:0;transition:opacity .45s;-webkit-tap-highlight-color:transparent;touch-action:none;overscroll-behavior:contain}',
    '.pil3d.on{opacity:1}',
    '.pil3d::before{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(5,7,15,.55) 0%,rgba(5,7,15,.25) 26%,rgba(5,7,15,.6) 52%,rgba(5,7,15,.92) 100%);pointer-events:none}',
    '.pil3d-host{position:absolute;inset:0}.pil3d-canvas{display:block;width:100%;height:100%;touch-action:none}',
    '.pil3d-vig{position:absolute;inset:0;pointer-events:none;background:radial-gradient(120% 85% at 50% 50%,rgba(0,0,0,0) 52%,rgba(2,3,8,.64) 100%)}',
    '.pil3d-top{position:absolute;left:0;right:0;top:0;display:flex;align-items:center;justify-content:space-between;padding:calc(10px + env(safe-area-inset-top)) 14px 10px;background:linear-gradient(180deg,rgba(5,7,15,.86),rgba(5,7,15,0));pointer-events:none}',
    '.pil3d-top button{pointer-events:auto;background:rgba(18,24,44,.8);border:1px solid rgba(214,178,96,.4);color:#f1e8d2;border-radius:999px;padding:8px 14px;font-size:.86rem}',
    '.pil3d-title{font-size:.82rem;letter-spacing:.3em;color:#d6b260}',
    '.pil3d-hud{position:absolute;left:0;right:0;bottom:0;padding:30px 18px calc(18px + env(safe-area-inset-bottom));background:linear-gradient(180deg,rgba(5,7,15,0),rgba(5,7,15,.92) 48%);text-align:center;pointer-events:none}',
    '.pil3d-line{font-size:1.04rem;line-height:1.6;min-height:1.6em;color:#f4e7bd}.pil3d-sub{font-size:.84rem;color:rgba(241,232,210,.74);margin-top:4px;min-height:1.3em}',
    '.pil3d-btn{pointer-events:auto;display:block;width:100%;max-width:420px;margin:14px auto 0;padding:14px;border-radius:14px;border:0;background:linear-gradient(135deg,#f1dfa6,#c79f45);color:#1b1505;font-size:1rem;font-weight:700;letter-spacing:.06em}'
  ].join('');
  document.head.appendChild(css);
  function buzz(p){try{if(navigator.vibrate)navigator.vibrate(p);}catch(_){}}
  function snd(key,vol,delay){try{if(window.JYFoley&&window.JYFoley.play)window.JYFoley.play(key,{scope:'pillar3d',volume:vol==null?.7:vol,delay:delay||0,throttle:60});}catch(_){}}
  function webgl(){try{var c=document.createElement('canvas');return !!(window.WebGLRenderingContext&&(c.getContext('webgl2')||c.getContext('webgl')));}catch(_){return false;}}
  var loading=false,failed=false,origPlay=null,active=null,NAMES=['年柱','月柱','日柱','時柱'],MEAN=['祖上與早年','父母與成長的環境','你自己與伴侶','子女與晚年'];
  function load(){if(window.JYPillarSceneModule||loading||failed||!webgl())return;loading=true;var s=document.createElement('script');s.src='JS/pillar-scene.js?v='+encodeURIComponent(VER);s.async=true;s.onload=function(){loading=false;};s.onerror=function(){loading=false;failed=true;};document.head.appendChild(s);}
  function open(opts,settle){
    opts=opts||{};var vals=(opts.sealValues||[]).slice(0,4);
    var layer=document.createElement('div');layer.className='pil3d';layer.setAttribute('role','dialog');layer.setAttribute('aria-label','四柱殿');
    layer.innerHTML='<div class="pil3d-host"></div><div class="pil3d-vig"></div><div class="pil3d-top"><button type="button" class="pil3d-back">← 返回</button><span class="pil3d-title">四柱殿</span><span style="width:64px"></span></div><div class="pil3d-hud"><div class="pil3d-line"></div><div class="pil3d-sub"></div><button type="button" class="pil3d-btn"></button></div>';
    document.body.appendChild(layer);
    var $=function(s){return layer.querySelector(s);},line=$('.pil3d-line'),sub=$('.pil3d-sub'),btn=$('.pil3d-btn'),S={closed:false,done:false,scene:null,timers:[]};
    function later(fn,ms){var t=setTimeout(function(){if(!S.closed)fn();},ms);S.timers.push(t);}
    function say(a,b){line.textContent=a||'';sub.textContent=b||'';}
    function close(finished){
      if(S.closed)return;S.closed=true;S.timers.forEach(clearTimeout);layer.classList.remove('on');if(active===S)active=null;
      setTimeout(function(){try{if(S.scene)S.scene.dispose();}catch(_){}if(layer.parentNode)layer.parentNode.removeChild(layer);},460);
      try{if(finished){if(typeof opts.onComplete==='function')opts.onComplete();}else if(typeof opts.onCancel==='function')opts.onCancel();}catch(_){}
      settle({finished:!!finished});
    }
    $('.pil3d-back').addEventListener('click',function(){close(false);});
    try{S.scene=window.JYPillarSceneModule.create($('.pil3d-host'),{pillars:vals,
      onLight:function(i,n){buzz([25,40,60]);snd('wood',.8);snd('stems',.5,.25);var v=vals[i]||'';say(NAMES[i]+(v&&v!=='未定'?'：'+v:''),MEAN[i]+(n<4?'　還有 '+(4-n)+' 根':''));if(n>=4){btn.style.display='none';}},
      onAllLit:function(){S.done=true;buzz([40,60,40,60,120]);snd('bamboo',.6);later(function(){say('四柱立齊了。','年、月、日、時，合起來就是你的命盤。');btn.style.display='';btn.textContent='看我的命盤';btn.onclick=function(){close(true);};},1500);}});
      S.scene.onLost(function(){failed=true;S.closed=true;S.timers.forEach(clearTimeout);try{S.scene.dispose();}catch(_){}if(layer.parentNode)layer.parentNode.removeChild(layer);if(active===S)active=null;var r=origPlay.call(window.JYRitual,'bazi',opts);if(r&&typeof r.then==='function')r.then(settle,function(){settle({finished:false});});else settle({finished:true});});}
    catch(e){S.closed=true;if(layer.parentNode)layer.parentNode.removeChild(layer);return false;}
    active=S;requestAnimationFrame(function(){layer.classList.add('on');});
    window.addEventListener('deviceorientation',function(e){if(S.closed||!S.scene||e.gamma==null)return;S.scene.tilt(e.gamma/30,((e.beta||45)-45)/34);});
    say('四根柱還暗著。','一根一根點它，把你的年、月、日、時立起來。');btn.textContent='替我點亮';btn.onclick=function(){btn.style.display='none';(function next(){if(S.closed||S.done)return;var i=S.scene.next();if(i>=0)later(next,1250);})();};
    return true;
  }
  function patch(){
    if(origPlay||!window.JYRitual||typeof window.JYRitual.play!=='function')return;
    origPlay=window.JYRitual.play;
    window.JYRitual.play=function(kind,opts){
      if(kind==='bazi'&&window.JYPillarSceneModule&&!failed&&!active){var settle,p=new Promise(function(res){settle=res;});if(open(opts,settle))return p;}
      return origPlay.apply(this,arguments);
    };
  }
  function shown(e){return !!(e&&e.getClientRects&&e.getClientRects().length&&getComputedStyle(e).display!=='none');}
  var poll=setInterval(function(){patch();if(shown(document.getElementById('bzx-screen'))||shown(document.getElementById('bzs-screen')))load();if(origPlay&&(window.JYPillarSceneModule||failed))clearInterval(poll);},700);
})();
