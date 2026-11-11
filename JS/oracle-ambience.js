/* 靜月靈籤・立體廟案的掛載與同步 v3（2026-11-12）
 * v1（會動的背景）、v2（疊在平面圖上的特效）都被使用者否定：v2 在手機上卡頓、出現黑塊破圖。兩版全部移除。
 * v3 是重新製作：把筊、籤筒、籤改成真的立體模型（JS/oracle-scene.js，單一 WebGL 畫布），原本的平面圖片在立體場景啟用時隱藏。
 * 這個檔只做三件事：①需要時才載入立體場景；②看著 oracle.js 的階段與結果，叫場景演出同樣的結果；③手勢與震動。
 * 求籤規則、筊象機率、抽到哪支籤，仍全部由 oracle.js 決定。裝置不支援 WebGL 或載入失敗時，自動退回原本的平面畫面。
 */
(function(){
  'use strict';
  if(window._jyOracleAmbienceLoaded)return;window._jyOracleAmbienceLoaded=true;
  var BG='img/oracle/oracle-temple-bg.jpg?v=67k_20260503';
  var VER=(function(){try{var s=document.currentScript&&document.currentScript.src||'';var m=s.match(/[?&]v=([^&]+)/);return m?m[1]:'1';}catch(_){return '1';}})();
  var css=document.createElement('style');css.id='jy-orc-amb-style';
  css.textContent=[
    /* 靜態場景底：一張圖加一層壓暗，不做任何濾鏡、混合或持續動畫 */
    '#oracle-screen{background:#0d0503 url('+BG+') center/cover no-repeat!important}',
    '#oracle-screen .orc-temple-overlay{display:block!important;position:fixed;inset:0;z-index:-2;background:linear-gradient(180deg,rgba(8,3,1,.72) 0%,rgba(8,3,1,.28) 26%,rgba(8,3,1,.4) 60%,rgba(6,2,1,.9) 100%)!important;pointer-events:none}',
    '#oracle-screen[data-oracle-phase="intro"] .orc-temple-overlay,#oracle-screen[data-oracle-phase="guide"] .orc-temple-overlay,#oracle-screen[data-oracle-phase="poem"] .orc-temple-overlay{background:rgba(8,5,8,.9)!important}',
    '#oracle-screen .orc-dragon-phase{background-image:none!important;background-color:transparent!important}',
    '#oracle-screen .orc-dragon-overlay,#oracle-screen .orc-v63-ritual-overlay{background:transparent!important}',
    '#oracle-screen .orc-v63-ritual{background-image:none!important}',
    '#oracle-screen .orc-center-phase,#oracle-screen .orc-pray-phase{background:transparent!important}',
    /* 立體場景層 */
    '.orc3d-host{position:fixed;inset:0;z-index:-1;pointer-events:none;opacity:0;transition:opacity .5s}',
    '.orc3d-host.on{opacity:1}',
    '.orc3d-canvas{display:block;width:100%;height:100%}',
    /* 立體場景啟用時：原本的平面筊、籤筒、籤隱藏，只留下它們佔的位置當作看場景的窗 */
    '#oracle-screen.orc-3d #orc-jiao-zone{min-height:44vh!important}',
    '#oracle-screen.orc-3d #orc-jiao-zone>*{visibility:hidden!important;animation:none!important}',
    '#oracle-screen.orc-3d .orc-qiantong-shake-wrap,#oracle-screen.orc-3d .orc-qiantong-wrap{visibility:hidden!important;height:44vh!important;margin:0 auto!important;overflow:hidden}',
    '#oracle-screen.orc-3d .orc-rise-wrap{visibility:hidden!important;height:44vh!important}',
    '#oracle-screen.orc-3d .orc-qiantong-shake-wrap *,#oracle-screen.orc-3d .orc-rise-wrap *{animation:none!important}',
    '#oracle-screen.orc-3d[data-oracle-phase="allowAsk"] .orc-center-phase{padding-top:40vh}',
    '.orc-gesture-hint{display:block;margin:.7rem auto 0;font-size:.8rem;letter-spacing:.14em;color:rgba(244,231,189,.8);text-align:center}'
  ].join('');
  document.head.appendChild(css);

  function buzz(p){try{if(navigator.vibrate)navigator.vibrate(p);}catch(_){}}
  var wrap=null,host=null,scene=null,loading=false,failed=false,lastPhase='',seenLand=null,RITUAL={allowAsk:1,allowThrowing:1,throwing:1,shaking:1,rising:1,drawn:1,shengjia:1};
  function webgl(){try{var c=document.createElement('canvas');return !!(window.WebGLRenderingContext&&(c.getContext('webgl2')||c.getContext('webgl')));}catch(_){return false;}}
  function load(cb){
    if(window.JYOracleSceneModule)return cb(true);if(failed||!webgl())return cb(false);
    if(loading)return;loading=true;var s=document.createElement('script');s.src='JS/oracle-scene.js?v='+encodeURIComponent(VER);s.async=true;
    s.onload=function(){loading=false;cb(!!window.JYOracleSceneModule);};s.onerror=function(){loading=false;failed=true;cb(false);};document.head.appendChild(s);
  }
  function mount(){
    if(scene||failed||!wrap)return;
    load(function(ok){
      if(!ok||scene||!wrap){if(!ok)failed=true;return;}
      try{host=document.createElement('div');host.className='orc3d-host';host.setAttribute('aria-hidden','true');wrap.insertBefore(host,wrap.firstChild);scene=window.JYOracleSceneModule.create(host);if(scene.onLost)scene.onLost(fallback);wrap.classList.add('orc-3d');lastPhase='';sync();}
      catch(e){fallback();}
    });
  }
  // 立體場景不能用（不支援、建立失敗、繪圖環境遺失）就整個退回原本的平面畫面，不留下空白。
  function fallback(){failed=true;try{if(scene)scene.dispose();}catch(_){}scene=null;if(host&&host.parentNode)host.parentNode.removeChild(host);host=null;if(wrap)wrap.classList.remove('orc-3d');}
  function txt(sel){var e=wrap&&wrap.querySelector(sel);return e?(e.textContent||'').replace(/\s/g,''):'';}
  function sync(){
    if(!wrap)return;var ph=wrap.getAttribute('data-oracle-phase')||'',visible=wrap.style.display!=='none';
    if(visible&&RITUAL[ph]&&!scene&&!failed)mount();
    if(scene){
      if(host&&host.parentNode!==wrap)wrap.insertBefore(host,wrap.firstChild);
      var on=visible&&!!RITUAL[ph];host.classList.toggle('on',on);
      if(!on){if(lastPhase!=='off'){lastPhase='off';setTimeout(function(){if(lastPhase==='off'&&scene)scene.stop();},600);}}
      else{
        if(ph!==lastPhase){lastPhase=ph;seenLand=null;scene.start();
          if(ph==='allowAsk'){scene.phase('ask');}
          else if(ph==='allowThrowing'||ph==='throwing'){scene.phase('toss');buzz(35);}
          else if(ph==='shaking'){scene.phase('shake');buzz([40,70,40,70,40,70,40]);}
          else if(ph==='rising'){scene.phase('rise',{label:txt('.orc-stick-label')});buzz([12,60,30]);}
          else if(ph==='drawn'){scene.phase('drawn',{label:txt('.orc-card-banner-num')});buzz([20,30,50]);}
          else if(ph==='shengjia'){scene.phase('finale');buzz([40,60,40,60,120]);}
        }
        var land=wrap.querySelector('#orc-jiao-zone .orc-land-jiao');
        if(land&&seenLand!==land){seenLand=land;var imgs=wrap.querySelectorAll('#orc-jiao-zone .orc-land-img'),faces=[];for(var i=0;i<2;i++){var src=imgs[i]?(imgs[i].getAttribute('src')||''):'';faces.push(/jiao-flat/.test(src));}
          var r=faces[0]!==faces[1]?'holy':(faces[0]?'laugh':'dark');scene.phase('land',{faces:faces,result:r,yaw:(Date.now()%7)/10});
          setTimeout(function(){buzz(r==='holy'?[24,50,60]:r==='dark'?[24,50,120]:[24,50,30]);},440);}
      }
    }
    hint();
  }
  // ── 手勢：往上滑＝擲筊；搖手機＝搖籤（按鈕照樣能用）──
  function mainBtn(rx){if(!wrap)return null;var bs=wrap.querySelectorAll('.orc-body button');for(var i=bs.length-1;i>=0;i--){var t=(bs[i].innerText||'').replace(/\s/g,'');if(bs[i].offsetParent!==null&&!bs[i].disabled&&rx.test(t))return bs[i];}return null;}
  var hintT=0;
  function hint(){clearTimeout(hintT);hintT=setTimeout(function(){
    if(!wrap||wrap.querySelector('.orc-gesture-hint')||!(('ontouchstart' in window)||navigator.maxTouchPoints>0))return;
    var b=mainBtn(/^(擲杯請示|再擲杯|擲筊|繼續擲筊)$/),t='或往上滑，把筊擲出去';if(!b){b=mainBtn(/^(搖籤|重新求籤)$/);t='或搖一搖手機';}if(!b)return;
    var h=document.createElement('span');h.className='orc-gesture-hint';h.textContent=t;b.parentNode.insertBefore(h,b.nextSibling);},500);}
  var ty=null,tt=0;
  document.addEventListener('touchstart',function(e){if(!wrap||wrap.style.display==='none')return;ty=e.touches[0].clientY;tt=Date.now();},{passive:true});
  document.addEventListener('touchend',function(e){
    if(ty==null||!wrap||wrap.style.display==='none')return;var dy=ty-e.changedTouches[0].clientY,dt=Date.now()-tt;ty=null;if(dy<90||dt>650)return;
    var tg=e.target;if(tg&&tg.closest&&tg.closest('button,a,textarea,input,.orc-topbar'))return;var b=mainBtn(/^(擲杯請示|再擲杯|擲筊|繼續擲筊)$/);if(b){buzz(20);b.click();}
  },{passive:true});
  var lastShake=0,acc=0;
  window.addEventListener('devicemotion',function(e){
    if(!wrap||wrap.style.display==='none')return;var a=e.accelerationIncludingGravity||e.acceleration;if(!a)return;var m=Math.abs(a.x||0)+Math.abs(a.y||0)+Math.abs(a.z||0);acc=acc*.7+m*.3;
    if(m-acc>13&&Date.now()-lastShake>1600){var b=mainBtn(/^(搖籤|重新求籤)$/);if(b){lastShake=Date.now();buzz(30);b.click();}}
  });
  window.addEventListener('deviceorientation',function(e){if(!scene||e.gamma==null)return;scene.tilt(e.gamma/28,((e.beta||45)-45)/32);});

  var syncT=0;function queue(){if(syncT)return;syncT=setTimeout(function(){syncT=0;sync();},30);}
  function attach(){
    wrap=document.getElementById('oracle-screen');if(!wrap)return false;sync();
    try{new MutationObserver(queue).observe(wrap,{childList:true,subtree:true,attributes:true,attributeFilter:['data-oracle-phase','style']});}catch(_){}
    return true;
  }
  if(!attach()){try{var mo=new MutationObserver(function(){if(attach())mo.disconnect();});mo.observe(document.body||document.documentElement,{childList:true});}catch(_){}}
})();
