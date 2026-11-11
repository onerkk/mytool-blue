/* 靜月靈籤・沉浸場景層 v1（2026-11-12）
 * 問題：靈籤各階段在「有廟景的擲筊畫面」和「純深色底的搖籤／得籤／請示畫面」之間硬切，
 *       重新求籤時來回跳，像在換頁而不是站在同一座廟裡。
 * 做法：在 #oracle-screen 放一層常駐的廟內場景（不隨每次重繪消失），所有階段共用：
 *       廟景緩慢呼吸、兩側燭光搖曳、香煙上升、微塵飄浮；各階段內容改為淡入；
 *       擲筊、落地、搖籤、得籤時給手機震動回饋。
 * 只用 transform／opacity；尊重 prefers-reduced-motion；不改任何求籤規則與文字。
 */
(function(){
  'use strict';
  if(window._jyOracleAmbienceLoaded)return;window._jyOracleAmbienceLoaded=true;
  var BG='img/oracle/oracle-temple-bg.jpg?v=67k_20260503';
  var css=document.createElement('style');css.id='jy-orc-amb-style';
  css.textContent=[
    '#oracle-screen{background:#0d0503!important}',
    '#oracle-screen .orc-temple-overlay{display:none!important}',
    '.orc-amb{position:fixed;inset:0;z-index:-1;pointer-events:none;overflow:hidden;contain:strict}',
    '.orc-amb-bg{position:absolute;inset:-4%;background:url('+BG+') center/cover no-repeat;transform-origin:50% 60%;animation:orcAmbBreath 26s ease-in-out infinite alternate;filter:saturate(1.05) brightness(.82)}',
    '@keyframes orcAmbBreath{from{transform:scale(1) translateY(0)}to{transform:scale(1.07) translateY(-1.2%)}}',
    '.orc-amb-veil{position:absolute;inset:0;background:radial-gradient(120% 80% at 50% 38%,rgba(10,4,2,.18) 0%,rgba(10,4,2,.55) 55%,rgba(6,2,1,.9) 100%),linear-gradient(180deg,rgba(8,3,1,.72) 0%,rgba(8,3,1,.25) 28%,rgba(8,3,1,.35) 62%,rgba(6,2,1,.86) 100%);transition:opacity .8s}',
    '.orc-amb-glow{position:absolute;width:62vmin;height:62vmin;border-radius:50%;background:radial-gradient(circle,rgba(255,176,84,.34) 0%,rgba(255,140,50,.14) 35%,rgba(255,120,40,0) 70%);mix-blend-mode:screen;animation:orcAmbFlicker 3.4s ease-in-out infinite}',
    '.orc-amb-glow.l{left:-22vmin;bottom:16%}.orc-amb-glow.r{right:-24vmin;bottom:24%;animation-duration:4.1s;animation-delay:-1.3s}',
    '@keyframes orcAmbFlicker{0%,100%{opacity:.72;transform:scale(1)}22%{opacity:.95;transform:scale(1.05)}41%{opacity:.6;transform:scale(.97)}63%{opacity:.9;transform:scale(1.03)}82%{opacity:.68;transform:scale(.99)}}',
    '.orc-amb-smoke{position:absolute;bottom:-18%;width:46vmin;height:90vmin;border-radius:50%;background:radial-gradient(ellipse at 50% 70%,rgba(232,222,205,.20) 0%,rgba(232,222,205,.08) 38%,rgba(232,222,205,0) 70%);filter:blur(14px);opacity:0;animation:orcAmbSmoke 17s linear infinite}',
    '.orc-amb-smoke.s1{left:18%}.orc-amb-smoke.s2{left:46%;animation-duration:21s;animation-delay:-7s}.orc-amb-smoke.s3{left:64%;animation-duration:19s;animation-delay:-12s}',
    '@keyframes orcAmbSmoke{0%{transform:translate(0,0) scale(.7) rotate(0);opacity:0}15%{opacity:.85}60%{opacity:.55}100%{transform:translate(9vmin,-115vh) scale(1.5) rotate(14deg);opacity:0}}',
    '.orc-amb-mote{position:absolute;bottom:-3%;width:3px;height:3px;border-radius:50%;background:rgba(255,214,150,.9);box-shadow:0 0 6px rgba(255,190,110,.9);opacity:0;animation:orcAmbMote 14s linear infinite}',
    '@keyframes orcAmbMote{0%{transform:translate(0,0);opacity:0}12%{opacity:.9}85%{opacity:.5}100%{transform:translate(var(--dx,4vw),-108vh);opacity:0}}',
    /* 各階段：首頁與籤詩頁要好讀，場景退到後面；儀式階段場景最亮 */
    '#oracle-screen[data-oracle-phase="intro"] .orc-amb-veil,#oracle-screen[data-oracle-phase="guide"] .orc-amb-veil{opacity:1;background:linear-gradient(180deg,rgba(8,6,14,.9),rgba(8,6,14,.84))}',
    '#oracle-screen[data-oracle-phase="poem"] .orc-amb-veil{background:linear-gradient(180deg,rgba(8,4,2,.9),rgba(8,4,2,.86))}',
    /* 擲筊畫面原本自己再貼一次廟景，改成透明，直接站在同一個場景裡，不再硬切 */
    '#oracle-screen .orc-dragon-phase{background-image:none!important;background-color:transparent!important}',
    '#oracle-screen .orc-dragon-overlay,#oracle-screen .orc-v63-ritual-overlay{background:transparent!important}',
    '#oracle-screen .orc-v63-ritual{background-image:none!important}',
    '#oracle-screen .orc-center-phase,#oracle-screen .orc-pray-phase{background:transparent!important}',
    /* 內容淡入上浮，取代換頁感 */
    '#oracle-screen .orc-body>*{animation:orcAmbIn .7s cubic-bezier(.16,1,.3,1) both}',
    '@keyframes orcAmbIn{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}',
    /* 籤筒與籤：腳下一圈燈光、身後一道光 */
    '#oracle-screen .orc-qiantong-shake-wrap{position:relative}',
    '#oracle-screen .orc-qiantong-shake-wrap::before{content:"";position:absolute;left:50%;top:8%;width:150%;height:110%;transform:translateX(-50%);background:radial-gradient(ellipse at 50% 55%,rgba(255,190,100,.28) 0%,rgba(255,170,80,.10) 38%,rgba(255,170,80,0) 68%);pointer-events:none;animation:orcAmbFlicker 3.8s ease-in-out infinite}',
    '#oracle-screen .orc-qiantong-shake-wrap::after{content:"";position:absolute;left:50%;bottom:-3%;width:86%;height:9%;transform:translateX(-50%);background:radial-gradient(ellipse,rgba(0,0,0,.6) 0%,rgba(0,0,0,0) 70%);pointer-events:none}',
    '#oracle-screen .orc-qiantong-img,#oracle-screen .orc-toss-img,#oracle-screen .orc-jiao-img{filter:drop-shadow(0 14px 22px rgba(0,0,0,.6)) drop-shadow(0 0 18px rgba(255,170,80,.18))}',
    '@media (prefers-reduced-motion:reduce){.orc-amb *,#oracle-screen .orc-body>*,#oracle-screen .orc-qiantong-shake-wrap::before{animation:none!important}.orc-amb-smoke,.orc-amb-mote{display:none}}'
  ].join('');
  document.head.appendChild(css);

  function build(){
    var a=document.createElement('div');a.className='orc-amb';a.setAttribute('aria-hidden','true');
    var h='<div class="orc-amb-bg"></div><div class="orc-amb-glow l"></div><div class="orc-amb-glow r"></div><div class="orc-amb-smoke s1"></div><div class="orc-amb-smoke s2"></div><div class="orc-amb-smoke s3"></div>';
    for(var i=0;i<12;i++){var left=6+((i*37)%88),dur=11+((i*5)%9),delay=-((i*3.1)%14),dx=((i%2)?1:-1)*(2+(i%5));h+='<i class="orc-amb-mote" style="left:'+left+'%;animation-duration:'+dur+'s;animation-delay:'+delay.toFixed(1)+'s;--dx:'+dx+'vw"></i>';}
    h+='<div class="orc-amb-veil"></div>';a.innerHTML=h;return a;
  }
  var layer=null,lastPhase='';
  function buzz(p){try{if(navigator.vibrate&&!(window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches))navigator.vibrate(p);}catch(_){}}
  function onPhase(ph){
    if(ph===lastPhase)return;lastPhase=ph;
    if(ph==='allowThrowing'||ph==='throwing')buzz(35);
    else if(ph==='allowResult'||ph==='result')buzz([18,60,26]);
    else if(ph==='shaking')buzz([30,90,30,90,30,90,30]);
    else if(ph==='drawn')buzz([12,40,40]);
    else if(ph==='shengjia')buzz([40,60,40,60,90]);
  }
  function ensure(w){
    if(!w)return;
    if(!layer)layer=build();
    if(layer.parentNode!==w)w.insertBefore(layer,w.firstChild);
    onPhase(w.getAttribute('data-oracle-phase')||'');
  }
  function attach(){
    var w=document.getElementById('oracle-screen');if(!w)return false;
    ensure(w);
    try{new MutationObserver(function(){ensure(w);}).observe(w,{childList:true,attributes:true,attributeFilter:['data-oracle-phase']});}catch(_){}
    return true;
  }
  if(!attach()){
    try{var mo=new MutationObserver(function(){if(attach())mo.disconnect();});mo.observe(document.body||document.documentElement,{childList:true});}catch(_){}
  }
})();
