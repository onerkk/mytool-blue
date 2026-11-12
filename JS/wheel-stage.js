/* 靜月・紫微十二宮盤與梅花卦盤的舞台（2026-11-12）
 * 攔下紫微與梅花原本的平面過場（JYRitual.play('ziwei'／'meihua')），改演立體場景（JS/wheel-scene.js）。
 * 宮名、主星、上卦、下卦、動爻都由各自的程式算好後傳入。畫面外框沿用 pillar-stage.js 的樣式。
 * 回傳形狀與原本相同（帶 finished 的物件），也會呼叫 onComplete／onCancel；不支援 WebGL 或失敗時退回原過場。
 */
(function(){
  'use strict';
  if(window._jyWheelStageLoaded)return;window._jyWheelStageLoaded=true;
  var VER=(function(){try{var s=document.currentScript&&document.currentScript.src||'';var m=s.match(/[?&]v=([^&]+)/);return m?m[1]:'1';}catch(_){return '1';}})();
  function buzz(p){try{if(navigator.vibrate)navigator.vibrate(p);}catch(_){}}
  function snd(key,vol,delay){try{if(window.JYFoley&&window.JYFoley.play)window.JYFoley.play(key,{scope:'wheel3d',volume:vol==null?.7:vol,delay:delay||0,throttle:60});}catch(_){}}
  function webgl(){try{var c=document.createElement('canvas');return !!(window.WebGLRenderingContext&&(c.getContext('webgl2')||c.getContext('webgl')));}catch(_){return false;}}
  var loading=false,failed=false,origPlay=null,active=null;
  var SCENES_V='4bc68e39a667';
  // 四個立體場景合併在 JS/jy-scenes.js；全站只載一次，各舞台共用同一個載入狀態。
  function jyScenes(cb){var w=window;if(w._jyScenesState==='ok')return cb(true);if(w._jyScenesState==='fail')return cb(false);(w._jyScenesWait=w._jyScenesWait||[]).push(cb);if(w._jyScenesState==='loading')return;w._jyScenesState='loading';var s=document.createElement('script');s.src='JS/jy-scenes.js?v='+SCENES_V;s.async=true;var done=function(ok){w._jyScenesState=ok?'ok':'fail';var q=w._jyScenesWait||[];w._jyScenesWait=[];q.forEach(function(f){try{f(ok);}catch(_){}});};s.onload=function(){done(true);};s.onerror=function(){done(false);};document.head.appendChild(s);}
  function load(){if(window.JYWheelSceneModule||loading||failed||!webgl())return;loading=true;jyScenes(function(ok){loading=false;if(!ok||!window.JYWheelSceneModule)failed=true;});}
  var TXT={ziwei:{title:'紫微星盤',bg:'assets/ui/ritual-celestial-observatory.webp',intro:['十二宮還暗著。','點一下，讓星落進你的宮位。'],auto:'替我排完',done:['十二宮都亮了。','命宮在紫色那一格，其餘十一宮繞著它。'],go:'看我的命盤'},
           liuren:{title:'六壬天地盤',bg:'assets/ui/ritual-celestial-observatory.webp',intro:['',''],auto:'替我轉',done:['課成了。','四課定、三傳出，可以看課了。'],go:'看這一課'},
           meihua:{title:'梅花卦盤',bg:'assets/ui/ritual-moon-garden.webp',intro:['花還在落。','點一下，依你起的數，把卦一爻一爻立起來。'],auto:'替我起完',done:['卦成了。','上卦、下卦，加上變動的那一爻。'],go:'看卦象'}};
  function open(kind,opts,settle){
    opts=opts||{};var X=TXT[kind],layer=document.createElement('div');layer.className='pil3d';layer.setAttribute('role','dialog');layer.setAttribute('aria-label',X.title);layer.style.backgroundImage='url('+X.bg+')';
    layer.innerHTML='<div class="pil3d-host"></div><div class="pil3d-vig"></div><div class="pil3d-top"><button type="button" class="pil3d-back">← 返回</button><span class="pil3d-title"></span><span style="width:64px"></span></div><div class="pil3d-hud"><div class="pil3d-line"></div><div class="pil3d-sub"></div><button type="button" class="pil3d-btn"></button></div>';
    // 六壬的房間自己就在最上層，舞台放在 body 會被它蓋住（第一次測試時畫面上完全看不到舞台）；改放進房間裡並把層級拉到最高。
    var lrRoom=kind==='liuren'?document.getElementById('lr-room'):null;if(lrRoom)layer.style.zIndex='2147483647';(lrRoom||document.body).appendChild(layer);
    var $=function(s){return layer.querySelector(s);},line=$('.pil3d-line'),sub=$('.pil3d-sub'),btn=$('.pil3d-btn'),S={closed:false,done:false,scene:null,timers:[]};$('.pil3d-title').textContent=X.title;
    function later(fn,ms){var t=setTimeout(function(){if(!S.closed)fn();},ms);S.timers.push(t);}
    function say(a,b){a=a||'';b=b||'';if(S.sayA===a&&S.sayB===b)return;S.sayA=a;S.sayB=b;line.classList.add('sw');sub.classList.add('sw');clearTimeout(S.sayT);S.sayT=setTimeout(function(){line.textContent=S.sayA;sub.textContent=S.sayB;line.classList.remove('sw');sub.classList.remove('sw');},170);}
    function close(finished){
      if(S.closed)return;S.closed=true;S.timers.forEach(clearTimeout);layer.classList.remove('on');if(active===S)active=null;
      setTimeout(function(){try{if(S.scene)S.scene.dispose();}catch(_){}if(layer.parentNode)layer.parentNode.removeChild(layer);},460);
      try{if(finished){if(typeof opts.onComplete==='function')opts.onComplete();}else if(typeof opts.onCancel==='function')opts.onCancel();}catch(_){}
      settle({finished:!!finished});
    }
    $('.pil3d-back').addEventListener('click',function(){close(false);});
    var cfg=kind==='ziwei'?{kind:'ziwei',palaces:opts.palaces||[]}:kind==='liuren'?{kind:'liuren',chart:opts.chart||{}}:{kind:'meihua',up:opts.nums&&opts.nums.up,lo:opts.nums&&opts.nums.lo,dong:opts.nums&&opts.nums.dong};
    var LC=opts.chart||{},LMG=(LC.monthGeneral&&LC.monthGeneral.branch)||'',LMN=(LC.monthGeneral&&LC.monthGeneral.name)||'',LHR=LC.hourBranch||'';
    if(kind==='liuren'){cfg.onLock=function(){buzz([30,50,90]);snd('wood',.85);snd('bamboo',.5,.2);say('月將加時，天盤定住了。','「'+LMG+'」落在「'+LHR+'」上。點一下，立四課。');btn.style.display='';btn.textContent='替我排完';};cfg.onTurn=function(d){if(d<.2)buzz(8);};}
    cfg.onStep=function(i,n,texts){buzz([25,40,50]);snd(kind==='ziwei'?'stems':'wood',.7);var t=(texts||[]).filter(Boolean);say(t[0]||'',t.slice(1).join('　')||(i<n?'再點一下，繼續。':''));if(i>=n)btn.style.display='none';};
    cfg.onDone=function(){S.done=true;buzz([40,60,40,60,110]);snd('bamboo',.6);say(X.done[0],X.done[1]);btn.style.display='';btn.textContent=X.go;btn.onclick=function(){close(true);};};
    try{S.scene=window.JYWheelSceneModule.create($('.pil3d-host'),cfg);
      S.scene.onLost(function(){failed=true;S.closed=true;S.timers.forEach(clearTimeout);try{S.scene.dispose();}catch(_){}if(layer.parentNode)layer.parentNode.removeChild(layer);if(active===S)active=null;if(kind==='liuren'){settle({finished:false});return;}var r=origPlay.call(window.JYRitual,kind,opts);if(r&&r.finished&&typeof r.finished.then==='function')r.finished.then(function(v){settle({finished:!!v});},function(){settle({finished:false});});else settle({finished:true});});}
    catch(e){S.closed=true;if(layer.parentNode)layer.parentNode.removeChild(layer);return false;}
    active=S;requestAnimationFrame(function(){layer.classList.add('on');});
    window.addEventListener('deviceorientation',function(e){if(S.closed||!S.scene||e.gamma==null)return;S.scene.tilt(e.gamma/30,((e.beta||45)-45)/34);});
    if(kind==='liuren')say('月將'+(LMN?LMN+'（'+LMG+'）':LMG)+'，占時'+LHR+'。','左右拖動，把天盤上發亮的「'+LMG+'」轉到地盤發亮的「'+LHR+'」上。');else say(X.intro[0],X.intro[1]);
    btn.textContent=X.auto;btn.onclick=function(){btn.style.display='none';if(kind==='liuren'&&!S.scene.locked){S.scene.auto();return;}(function next(){if(S.closed||S.done)return;var i=S.scene.next();if(i>=0&&i<S.scene.total())later(next,kind==='ziwei'?1500:2100);})();};
    return true;
  }
  function patch(){
    if(origPlay||!window.JYRitual||typeof window.JYRitual.play!=='function')return;
    origPlay=window.JYRitual.play;
    window.JYRitual.play=function(kind,opts){
      if((kind==='ziwei'||kind==='meihua')&&window.JYWheelSceneModule&&!failed&&!active){var settle,fin=new Promise(function(res){settle=function(v){res(!!(v&&v.finished));};});if(open(kind,opts,settle))return {finished:fin};}
      return origPlay.apply(this,arguments);
    };
  }
  // 六壬沒有用 JYRitual：由 liuren-room.js 在排好課、顯示結果之前呼叫這裡。回傳 Promise，演完或按返回都會結束，之後照常顯示結果。
  window.JYLiurenStage={play:function(chart){return new Promise(function(res){if(!window.JYWheelSceneModule||failed||active||!webgl())return res(false);var ok=false;try{ok=open('liuren',{chart:chart,onComplete:function(){},onCancel:function(){}},function(v){res(!!(v&&v.finished));});}catch(_){ok=false;}if(!ok)res(false);});}};
  function shown(e){return !!(e&&e.getClientRects&&e.getClientRects().length&&getComputedStyle(e).display!=='none');}
  var poll=setInterval(function(){patch();if(shown(document.getElementById('zw-input'))||shown(document.getElementById('mhx-screen'))||shown(document.getElementById('lr-room')))load();if(origPlay&&(window.JYWheelSceneModule||failed))clearInterval(poll);},700);
})();
