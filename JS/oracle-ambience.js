/* 靜月靈籤・沉浸動畫 v2（2026-11-12）
 * v1 只是一層會動的背景，使用者實測後說「沒什麼變化」——確實不夠。v2 把每個動作做成真的動畫：
 *  1. 擲筊：兩片筊帶透視拋起、翻滾多圈、遠去再落下；落地有彈跳、陰影、揚塵、畫面震動。
 *  2. 結果：聖筊金光放射＋金色火花；笑筊筊身搖晃；陰筊畫面壓暗、灰煙。三聖筊確認有全畫面金光。
 *  3. 搖籤：籤筒大幅度立體搖晃、越搖越急、有搖晃殘影；出籤時有光柱、鏡頭推近、籤號落定。
 *  4. 鏡頭：廟景依階段推近或拉遠；手機傾斜時場景跟著微微位移（視差）。
 *  5. 動手：往上滑＝擲筊；搖手機＝搖籤（按鈕仍可用）。
 * 只用 transform／opacity 與一張 canvas；尊重 prefers-reduced-motion；不改任何求籤規則、機率與文字。
 */
(function(){
  'use strict';
  if(window._jyOracleAmbienceLoaded)return;window._jyOracleAmbienceLoaded=true;
  var BG='img/oracle/oracle-temple-bg.jpg?v=67k_20260503';
  var REDUCED=!!(window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches);
  var css=document.createElement('style');css.id='jy-orc-amb-style';
  css.textContent=[
    '#oracle-screen{background:#0d0503!important}',
    '#oracle-screen .orc-temple-overlay{display:none!important}',
    '.orc-amb{position:fixed;inset:0;z-index:-1;pointer-events:none;overflow:hidden;contain:strict;--gx:0;--gy:0}',
    '.orc-amb-cam{position:absolute;inset:-8%;transition:transform 1.3s cubic-bezier(.22,.8,.2,1);transform:scale(var(--cam,1.02)) translate3d(0,var(--camy,0),0);will-change:transform}',
    '.orc-amb-bg{position:absolute;inset:0;background:url('+BG+') center/cover no-repeat;transform:translate3d(calc(var(--gx)*-16px),calc(var(--gy)*-12px),0) scale(1.04);transition:transform .25s linear;filter:saturate(1.08) brightness(.86)}',
    '.orc-amb-veil{position:absolute;inset:0;background:radial-gradient(120% 80% at 50% 40%,rgba(10,4,2,.10) 0%,rgba(10,4,2,.5) 55%,rgba(6,2,1,.9) 100%),linear-gradient(180deg,rgba(8,3,1,.7) 0%,rgba(8,3,1,.2) 28%,rgba(8,3,1,.3) 62%,rgba(6,2,1,.86) 100%);transition:opacity .8s,background .8s}',
    '.orc-amb-glow{position:absolute;width:66vmin;height:66vmin;border-radius:50%;background:radial-gradient(circle,rgba(255,176,84,.38) 0%,rgba(255,140,50,.15) 35%,rgba(255,120,40,0) 70%);mix-blend-mode:screen;animation:orcAmbFlicker 3.4s ease-in-out infinite;transform:translate3d(calc(var(--gx)*10px),calc(var(--gy)*8px),0)}',
    '.orc-amb-glow.l{left:-22vmin;bottom:16%}.orc-amb-glow.r{right:-24vmin;bottom:24%;animation-duration:4.1s;animation-delay:-1.3s}',
    '@keyframes orcAmbFlicker{0%,100%{opacity:.72}22%{opacity:.98}41%{opacity:.58}63%{opacity:.92}82%{opacity:.66}}',
    '.orc-amb-smoke{position:absolute;bottom:-18%;width:46vmin;height:90vmin;border-radius:50%;background:radial-gradient(ellipse at 50% 70%,rgba(232,222,205,.22) 0%,rgba(232,222,205,.09) 38%,rgba(232,222,205,0) 70%);filter:blur(14px);opacity:0;animation:orcAmbSmoke 17s linear infinite}',
    '.orc-amb-smoke.s1{left:18%}.orc-amb-smoke.s2{left:46%;animation-duration:21s;animation-delay:-7s}.orc-amb-smoke.s3{left:64%;animation-duration:19s;animation-delay:-12s}',
    '@keyframes orcAmbSmoke{0%{transform:translate(0,0) scale(.7) rotate(0);opacity:0}15%{opacity:.85}60%{opacity:.55}100%{transform:translate(9vmin,-115vh) scale(1.5) rotate(14deg);opacity:0}}',
    /* 階段鏡頭 */
    '#oracle-screen[data-oracle-phase="allowAsk"] .orc-amb{--cam:1.05}',
    '#oracle-screen[data-oracle-phase="allowThrowing"] .orc-amb,#oracle-screen[data-oracle-phase="throwing"] .orc-amb{--cam:1.2;--camy:4%}',
    '#oracle-screen[data-oracle-phase="shaking"] .orc-amb{--cam:1.12;--camy:1%}',
    '#oracle-screen[data-oracle-phase="rising"] .orc-amb{--cam:1.26;--camy:2%}',
    '#oracle-screen[data-oracle-phase="drawn"] .orc-amb{--cam:1.1}',
    '#oracle-screen[data-oracle-phase="shengjia"] .orc-amb{--cam:1.3;--camy:-2%}',
    '#oracle-screen[data-oracle-phase="intro"] .orc-amb-veil,#oracle-screen[data-oracle-phase="guide"] .orc-amb-veil{background:linear-gradient(180deg,rgba(8,6,14,.9),rgba(8,6,14,.84))}',
    '#oracle-screen[data-oracle-phase="poem"] .orc-amb-veil{background:linear-gradient(180deg,rgba(8,4,2,.9),rgba(8,4,2,.86))}',
    '#oracle-screen.orc-fx-dark .orc-amb-veil{background:radial-gradient(90% 60% at 50% 45%,rgba(4,2,6,.55) 0%,rgba(2,1,3,.93) 100%)}',
    /* 原本各頁自貼的背景改透明，所有階段站在同一個場景 */
    '#oracle-screen .orc-dragon-phase{background-image:none!important;background-color:transparent!important}',
    '#oracle-screen .orc-dragon-overlay,#oracle-screen .orc-v63-ritual-overlay{background:transparent!important}',
    '#oracle-screen .orc-v63-ritual{background-image:none!important}',
    '#oracle-screen .orc-center-phase,#oracle-screen .orc-pray-phase{background:transparent!important}',
    '#oracle-screen .orc-body>*{animation:orcAmbIn .7s cubic-bezier(.16,1,.3,1) both}',
    '@keyframes orcAmbIn{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}',
    /* ── 擲筊：立體拋擲 ── */
    '#oracle-screen #orc-jiao-zone{perspective:820px;perspective-origin:50% 70%;min-height:44vh!important;align-items:flex-end!important;overflow:visible}',
    '#oracle-screen .orc-toss-jiao{transform-style:preserve-3d;will-change:transform}',
    '#oracle-screen .orc-toss-L{animation:orcTossL 1.18s cubic-bezier(.33,0,.4,1) both!important}',
    '#oracle-screen .orc-toss-R{animation:orcTossR 1.18s cubic-bezier(.33,0,.4,1) .05s both!important}',
    '@keyframes orcTossL{0%{transform:translate3d(8px,6vh,60px) rotateX(0) rotateZ(-10deg) scale(1.2)}18%{transform:translate3d(-10px,-12vh,-60px) rotateX(300deg) rotateZ(18deg) scale(.95)}45%{transform:translate3d(-34px,-33vh,-380px) rotateX(760deg) rotateZ(64deg) scale(.6);filter:blur(1px)}60%{transform:translate3d(-40px,-35vh,-420px) rotateX(980deg) rotateZ(92deg) scale(.56);filter:blur(1px)}100%{transform:translate3d(-14px,2vh,40px) rotateX(1620deg) rotateZ(170deg) scale(1.12);filter:blur(2.5px);opacity:.85}}',
    '@keyframes orcTossR{0%{transform:translate3d(-8px,6vh,60px) rotateX(0) rotateZ(12deg) scale(1.2)}18%{transform:translate3d(12px,-13vh,-60px) rotateX(-260deg) rotateZ(-22deg) scale(.95)}45%{transform:translate3d(36px,-31vh,-360px) rotateX(-700deg) rotateZ(-70deg) scale(.62);filter:blur(1px)}60%{transform:translate3d(44px,-34vh,-410px) rotateX(-900deg) rotateZ(-104deg) scale(.57);filter:blur(1px)}100%{transform:translate3d(16px,2vh,40px) rotateX(-1500deg) rotateZ(-190deg) scale(1.12);filter:blur(2.5px);opacity:.85}}',
    /* ── 落地：彈跳、陰影 ── */
    '#oracle-screen .orc-land-jiao{position:relative;transform-style:preserve-3d}',
    '#oracle-screen .orc-land-drop-L{animation:orcLandL .82s cubic-bezier(.3,0,.35,1) both!important}',
    '#oracle-screen .orc-land-drop-R{animation:orcLandR .82s cubic-bezier(.3,0,.35,1) .04s both!important}',
    '@keyframes orcLandL{0%{transform:translate3d(-12px,-34vh,0) rotate(-250deg) scale(1.35);opacity:.2;filter:blur(3px)}42%{transform:translate3d(0,0,0) rotate(-12deg) scale(1.04);opacity:1;filter:blur(0)}56%{transform:translate3d(-6px,-26px,0) rotate(9deg) scale(1)}72%{transform:translate3d(0,0,0) rotate(-4deg)}84%{transform:translate3d(-2px,-8px,0) rotate(2deg)}100%{transform:none}}',
    '@keyframes orcLandR{0%{transform:translate3d(12px,-36vh,0) rotate(230deg) scale(1.35);opacity:.2;filter:blur(3px)}42%{transform:translate3d(0,0,0) rotate(14deg) scale(1.04);opacity:1;filter:blur(0)}58%{transform:translate3d(8px,-30px,0) rotate(-10deg) scale(1)}74%{transform:translate3d(0,0,0) rotate(5deg)}86%{transform:translate3d(2px,-9px,0) rotate(-2deg)}100%{transform:none}}',
    '#oracle-screen .orc-land-jiao::after{content:"";position:absolute;left:8%;right:8%;bottom:-10px;height:16px;border-radius:50%;background:radial-gradient(ellipse,rgba(0,0,0,.72) 0%,rgba(0,0,0,0) 70%);animation:orcShadow .82s ease-out both}',
    '@keyframes orcShadow{0%{transform:scale(.2);opacity:0}42%{transform:scale(1.1);opacity:1}56%{transform:scale(.7);opacity:.6}72%,100%{transform:scale(1);opacity:.95}}',
    '#oracle-screen.orc-fx-laugh .orc-land-img{animation:orcRock 1.5s ease-in-out .85s 1 both}',
    '@keyframes orcRock{0%,100%{transform:rotate(0)}15%{transform:rotate(9deg)}32%{transform:rotate(-8deg)}48%{transform:rotate(6deg)}64%{transform:rotate(-4deg)}80%{transform:rotate(2deg)}}',
    '#oracle-screen.orc-fx-shake .orc-body{animation:orcQuake .42s linear 1}',
    '@keyframes orcQuake{0%,100%{transform:none}12%{transform:translate3d(-7px,5px,0)}26%{transform:translate3d(6px,-4px,0)}40%{transform:translate3d(-5px,3px,0)}55%{transform:translate3d(4px,-2px,0)}70%{transform:translate3d(-2px,2px,0)}85%{transform:translate3d(1px,-1px,0)}}',
    '#oracle-screen #orc-throw-label{animation:orcLabelIn .6s cubic-bezier(.2,1.3,.3,1) .5s both}',
    '@keyframes orcLabelIn{from{opacity:0;transform:scale(1.7);filter:blur(6px)}to{opacity:1;transform:none;filter:blur(0)}}',
    /* ── 結果特效層 ── */
    '.orc-fx{position:fixed;inset:0;z-index:40;pointer-events:none;overflow:hidden}',
    '.orc-fx canvas{position:absolute;inset:0;width:100%;height:100%}',
    '.orc-fx-rays{position:absolute;left:50%;top:38%;width:170vmax;height:170vmax;margin:-85vmax 0 0 -85vmax;border-radius:50%;background:repeating-conic-gradient(from 0deg,rgba(255,214,130,.34) 0deg 5deg,rgba(255,214,130,0) 5deg 15deg);-webkit-mask:radial-gradient(circle,rgba(0,0,0,1) 0%,rgba(0,0,0,.55) 22%,rgba(0,0,0,0) 58%);mask:radial-gradient(circle,rgba(0,0,0,1) 0%,rgba(0,0,0,.55) 22%,rgba(0,0,0,0) 58%);mix-blend-mode:screen;opacity:0;animation:orcRays 2.2s ease-out forwards}',
    '.orc-fx-rays.big{animation-duration:3.4s}',
    '@keyframes orcRays{0%{opacity:0;transform:rotate(0) scale(.3)}16%{opacity:1}100%{opacity:0;transform:rotate(70deg) scale(1.15)}}',
    '.orc-fx-flash{position:absolute;inset:0;background:radial-gradient(circle at 50% 40%,rgba(255,236,190,.75) 0%,rgba(255,200,120,.22) 35%,rgba(255,200,120,0) 68%);opacity:0;animation:orcFlash .9s ease-out forwards}',
    '.orc-fx-flash.big{background:radial-gradient(circle at 50% 42%,rgba(255,246,220,.98) 0%,rgba(255,214,140,.5) 40%,rgba(255,200,120,0) 78%);animation-duration:1.6s}',
    '@keyframes orcFlash{0%{opacity:0}14%{opacity:1}100%{opacity:0}}',
    '.orc-fx-dust{position:absolute;left:50%;width:74vmin;height:18vmin;margin-left:-37vmin;border-radius:50%;background:radial-gradient(ellipse,rgba(222,205,180,.5) 0%,rgba(222,205,180,.16) 45%,rgba(222,205,180,0) 70%);filter:blur(6px);opacity:0;animation:orcDust 1s ease-out forwards}',
    '@keyframes orcDust{0%{opacity:0;transform:scale(.25)}20%{opacity:.95}100%{opacity:0;transform:scale(1.5) translateY(-16px)}}',
    /* ── 搖籤、出籤 ── */
    '#oracle-screen .orc-qiantong-shake-wrap,#oracle-screen .orc-rise-wrap{position:relative;perspective:700px}',
    '#oracle-screen .orc-tube-shake{animation:orcTube3d .52s cubic-bezier(.4,0,.6,1) infinite!important;transform-origin:50% 86%;will-change:transform}',
    '@keyframes orcTube3d{0%{transform:rotateZ(-13deg) rotateX(6deg) translate3d(-14px,2px,0)}25%{transform:rotateZ(4deg) rotateX(-9deg) translate3d(6px,-12px,0)}50%{transform:rotateZ(14deg) rotateX(7deg) translate3d(15px,3px,0)}75%{transform:rotateZ(-5deg) rotateX(-8deg) translate3d(-7px,-11px,0)}100%{transform:rotateZ(-13deg) rotateX(6deg) translate3d(-14px,2px,0)}}',
    '#oracle-screen[data-oracle-phase="shaking"] .orc-qiantong-shake-wrap::before{content:"";position:absolute;left:50%;top:6%;width:160%;height:112%;transform:translateX(-50%);background:radial-gradient(ellipse at 50% 55%,rgba(255,190,100,.34) 0%,rgba(255,170,80,.12) 38%,rgba(255,170,80,0) 68%);pointer-events:none;animation:orcAmbFlicker 1.1s ease-in-out infinite}',
    '#oracle-screen .orc-qiantong-shake-wrap::after{content:"";position:absolute;left:50%;bottom:-3%;width:90%;height:9%;transform:translateX(-50%);background:radial-gradient(ellipse,rgba(0,0,0,.65) 0%,rgba(0,0,0,0) 70%);pointer-events:none;animation:orcTubeShadow .52s ease-in-out infinite}',
    '@keyframes orcTubeShadow{0%,100%{transform:translateX(-58%) scaleX(1.05)}50%{transform:translateX(-42%) scaleX(.92)}}',
    '#oracle-screen .orc-rise-wrap{animation:orcPush 2.4s cubic-bezier(.2,.7,.2,1) both}',
    '@keyframes orcPush{from{transform:scale(.9) translateY(10px)}to{transform:scale(1.16) translateY(-6px)}}',
    '#oracle-screen .orc-rise-wrap::before{content:"";position:absolute;left:50%;bottom:30%;width:62%;height:125%;transform:translateX(-50%);background:linear-gradient(180deg,rgba(255,226,160,0) 0%,rgba(255,226,160,.42) 42%,rgba(255,206,120,.14) 78%,rgba(255,206,120,0) 100%);filter:blur(10px);mix-blend-mode:screen;opacity:0;animation:orcBeam 2.3s ease-out .2s forwards;pointer-events:none}',
    '@keyframes orcBeam{0%{opacity:0;transform:translateX(-50%) scaleX(.2)}35%{opacity:1;transform:translateX(-50%) scaleX(1)}100%{opacity:.6;transform:translateX(-50%) scaleX(.82)}}',
    '#oracle-screen .orc-rise-stick-img{filter:drop-shadow(0 0 16px rgba(255,208,120,.75)) drop-shadow(0 12px 18px rgba(0,0,0,.6))}',
    '#oracle-screen[data-oracle-phase="drawn"] .orc-card-banner{animation:orcSlam .75s cubic-bezier(.2,1.25,.3,1) .1s both}',
    '@keyframes orcSlam{0%{opacity:0;transform:scale(2.3) rotate(-5deg);filter:blur(8px)}55%{opacity:1;transform:scale(.94) rotate(1deg);filter:blur(0)}75%{transform:scale(1.05)}100%{transform:none}}',
    '#oracle-screen .orc-qiantong-img,#oracle-screen .orc-toss-img,#oracle-screen .orc-land-img{filter:drop-shadow(0 14px 22px rgba(0,0,0,.6)) drop-shadow(0 0 18px rgba(255,170,80,.2))}',
    '.orc-gesture-hint{display:block;margin:.7rem auto 0;font-size:.8rem;letter-spacing:.14em;color:rgba(244,231,189,.78);text-align:center;animation:orcHint 2.2s ease-in-out infinite}',
    '@keyframes orcHint{0%,100%{opacity:.45;transform:translateY(0)}50%{opacity:1;transform:translateY(-4px)}}',
    '@media (prefers-reduced-motion:reduce){.orc-amb *,.orc-fx *,#oracle-screen .orc-body>*,#oracle-screen .orc-body,#oracle-screen .orc-toss-jiao,#oracle-screen .orc-land-jiao,#oracle-screen .orc-land-img,#oracle-screen .orc-tube-shake,#oracle-screen .orc-rise-wrap,#oracle-screen .orc-card-banner{animation:none!important;transition:none!important}.orc-amb-smoke,.orc-fx{display:none}}'
  ].join('');
  document.head.appendChild(css);

  function el(c,h){var e=document.createElement('div');e.className=c;if(h)e.innerHTML=h;return e;}
  function buzz(p){try{if(navigator.vibrate&&!REDUCED)navigator.vibrate(p);}catch(_){}}
  var wrap=null,layer=null,fx=null,cv=null,ctx=null,parts=[],raf=0,lastPhase='',seenLand=null;

  function buildLayer(){var a=el('orc-amb');a.setAttribute('aria-hidden','true');a.innerHTML='<div class="orc-amb-cam"><div class="orc-amb-bg"></div></div><div class="orc-amb-glow l"></div><div class="orc-amb-glow r"></div><div class="orc-amb-smoke s1"></div><div class="orc-amb-smoke s2"></div><div class="orc-amb-smoke s3"></div><div class="orc-amb-veil"></div>';return a;}
  function buildFx(){var f=el('orc-fx');f.setAttribute('aria-hidden','true');cv=document.createElement('canvas');f.appendChild(cv);ctx=cv.getContext('2d');return f;}
  function sizeCanvas(){if(!cv)return;var d=Math.min(2,window.devicePixelRatio||1);cv.width=Math.round(innerWidth*d);cv.height=Math.round(innerHeight*d);ctx.setTransform(d,0,0,d,0,0);}

  // ── 粒子：金色火花／灰塵／灰煙，都在同一張 canvas ──
  function spawn(kind,x,y,n){
    for(var i=0;i<n;i++){
      var a,s,p;
      if(kind==='gold'){a=-Math.PI/2+(Math.random()-.5)*Math.PI*1.5;s=3+Math.random()*9;p={x:x,y:y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-2,g:.16,life:1,decay:.008+Math.random()*.012,r:1.2+Math.random()*2.6,c:[255,200+Math.random()*40|0,110+Math.random()*60|0],tw:Math.random()*6};}
      else if(kind==='dust'){a=Math.PI+Math.random()*Math.PI;s=1+Math.random()*4;p={x:x+(Math.random()-.5)*120,y:y,vx:Math.cos(a)*s*1.6,vy:-Math.abs(Math.sin(a))*s*.7,g:.03,life:1,decay:.02+Math.random()*.02,r:6+Math.random()*14,c:[214,198,172],soft:1};}
      else{p={x:x+(Math.random()-.5)*innerWidth*.7,y:y+Math.random()*80,vx:(Math.random()-.5)*.8,vy:-.6-Math.random()*1.2,g:-.004,life:1,decay:.006+Math.random()*.006,r:26+Math.random()*40,c:[120,120,132],soft:1};}
      parts.push(p);
    }
    if(!raf)raf=requestAnimationFrame(tick);
  }
  function tick(){
    raf=0;if(!ctx)return;ctx.clearRect(0,0,innerWidth,innerHeight);
    for(var i=parts.length-1;i>=0;i--){var p=parts[i];p.vy+=p.g;p.x+=p.vx;p.y+=p.vy;p.vx*=.985;p.life-=p.decay;if(p.life<=0||p.y>innerHeight+60){parts.splice(i,1);continue;}
      var al=Math.max(0,p.life)*(p.soft?.34:1);
      if(p.soft){var g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r);g.addColorStop(0,'rgba('+p.c[0]+','+p.c[1]+','+p.c[2]+','+al+')');g.addColorStop(1,'rgba('+p.c[0]+','+p.c[1]+','+p.c[2]+',0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,6.283);ctx.fill();}
      else{var tw=.6+.4*Math.sin((p.tw+=.5));ctx.globalCompositeOperation='lighter';ctx.fillStyle='rgba('+p.c[0]+','+p.c[1]+','+p.c[2]+','+(al*tw)+')';ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,6.283);ctx.fill();ctx.fillStyle='rgba(255,246,220,'+(al*.9)+')';ctx.beginPath();ctx.arc(p.x,p.y,p.r*.4,0,6.283);ctx.fill();ctx.globalCompositeOperation='source-over';}
    }
    if(parts.length)raf=requestAnimationFrame(tick);
  }
  function overlay(cls,ms,style){if(!fx)return;var d=el(cls);if(style)d.style.cssText=style;fx.appendChild(d);setTimeout(function(){if(d.parentNode)d.parentNode.removeChild(d);},ms);}
  function flag(cls,ms){if(!wrap)return;wrap.classList.add(cls);setTimeout(function(){if(wrap)wrap.classList.remove(cls);},ms);}

  // ── 筊落地：依結果給不同的光與塵 ──
  function onLand(zone){
    var r=zone.getBoundingClientRect(),cx=r.left+r.width/2,fy=r.bottom-6;
    setTimeout(function(){
      flag('orc-fx-shake',460);buzz([24,50,34]);
      overlay('orc-fx-dust',1050,'top:'+(fy-40)+'px');spawn('dust',cx,fy,26);
      var lb=document.getElementById('orc-throw-label'),t=lb?(lb.textContent||''):'';
      setTimeout(function(){
        t=(document.getElementById('orc-throw-label')||{}).textContent||t;
        if(/聖/.test(t)){overlay('orc-fx-flash',950);overlay('orc-fx-rays',2300,'top:'+(r.top+r.height*.6)+'px');spawn('gold',cx,fy-30,90);buzz([30,40,60]);}
        else if(/笑/.test(t)){flag('orc-fx-laugh',2600);spawn('dust',cx,fy,10);}
        else if(/陰/.test(t)){flag('orc-fx-dark',2400);spawn('smoke',cx,fy,14);buzz(120);}
      },330);
    },330);
  }
  function finale(){overlay('orc-fx-flash big',1700);overlay('orc-fx-rays big',3500);var cx=innerWidth/2,cy=innerHeight*.45;spawn('gold',cx,cy,150);setTimeout(function(){spawn('gold',cx*.6,cy*1.1,70);spawn('gold',cx*1.4,cy*1.1,70);},420);buzz([40,60,40,60,120]);}

  function onPhase(ph){
    if(ph===lastPhase)return;lastPhase=ph;seenLand=null;
    if(ph==='allowThrowing'||ph==='throwing')buzz(35);
    else if(ph==='shaking')buzz([40,70,40,70,40,70,40,70,40]);
    else if(ph==='rising'){setTimeout(function(){spawn('gold',innerWidth/2,innerHeight*.5,36);},900);buzz([12,60,30]);}
    else if(ph==='drawn')buzz([20,30,50]);
    else if(ph==='shengjia')finale();
  }
  // ── 手勢：往上滑＝擲筊；搖手機＝搖籤 ──
  function mainBtn(rx){if(!wrap)return null;var bs=wrap.querySelectorAll('.orc-body button');for(var i=bs.length-1;i>=0;i--){var t=(bs[i].innerText||'').replace(/\s/g,'');if(bs[i].offsetParent!==null&&!bs[i].disabled&&rx.test(t))return bs[i];}return null;}
  var hintT=0;
  function hint(){
    clearTimeout(hintT);hintT=setTimeout(function(){
      if(!wrap||wrap.querySelector('.orc-gesture-hint'))return;
      var b=mainBtn(/^(擲杯請示|再擲杯|擲筊|繼續擲筊)$/),txt='或往上滑，把筊擲出去';
      if(!b){b=mainBtn(/^(搖籤|重新求籤)$/);txt='或搖一搖手機';}
      if(!b||!(('ontouchstart' in window)||navigator.maxTouchPoints>0))return;
      var h=document.createElement('span');h.className='orc-gesture-hint';h.textContent=txt;b.parentNode.insertBefore(h,b.nextSibling);
    },500);
  }
  var ty=null,tt=0;
  document.addEventListener('touchstart',function(e){if(!wrap||wrap.style.display==='none')return;ty=e.touches[0].clientY;tt=Date.now();},{passive:true});
  document.addEventListener('touchend',function(e){
    if(ty==null||!wrap||wrap.style.display==='none')return;var dy=ty-e.changedTouches[0].clientY,dt=Date.now()-tt;ty=null;
    if(dy<90||dt>650)return;var tg=e.target;if(tg&&tg.closest&&tg.closest('button,a,textarea,input,.orc-topbar'))return;
    var b=mainBtn(/^(擲杯請示|再擲杯|擲筊|繼續擲筊)$/);if(b){buzz(20);b.click();}
  },{passive:true});
  var lastShake=0,acc=0;
  window.addEventListener('devicemotion',function(e){
    if(!wrap||wrap.style.display==='none')return;var a=e.accelerationIncludingGravity||e.acceleration;if(!a)return;
    var m=Math.abs(a.x||0)+Math.abs(a.y||0)+Math.abs(a.z||0);acc=acc*.7+m*.3;
    if(m-acc>13&&Date.now()-lastShake>1600){var b=mainBtn(/^(搖籤|重新求籤)$/);if(b){lastShake=Date.now();buzz(30);b.click();}}
  });
  window.addEventListener('deviceorientation',function(e){
    if(!layer||REDUCED||e.gamma==null)return;var gx=Math.max(-1,Math.min(1,e.gamma/28)),gy=Math.max(-1,Math.min(1,((e.beta||45)-45)/32));
    layer.style.setProperty('--gx',gx.toFixed(3));layer.style.setProperty('--gy',gy.toFixed(3));
  });

  function ensure(){
    if(!wrap)return;
    if(!layer)layer=buildLayer();if(layer.parentNode!==wrap)wrap.insertBefore(layer,wrap.firstChild);
    if(!fx){fx=buildFx();sizeCanvas();}if(fx.parentNode!==wrap)wrap.appendChild(fx);
    onPhase(wrap.getAttribute('data-oracle-phase')||'');
    var land=wrap.querySelector('#orc-jiao-zone .orc-land-jiao');
    if(land&&seenLand!==land){seenLand=land;onLand(document.getElementById('orc-jiao-zone'));}
    hint();
  }
  function attach(){
    wrap=document.getElementById('oracle-screen');if(!wrap)return false;
    ensure();
    try{new MutationObserver(ensure).observe(wrap,{childList:true,subtree:true,attributes:true,attributeFilter:['data-oracle-phase']});}catch(_){}
    window.addEventListener('resize',sizeCanvas);
    return true;
  }
  if(!attach()){try{var mo=new MutationObserver(function(){if(attach())mo.disconnect();});mo.observe(document.body||document.documentElement,{childList:true});}catch(_){}}
})();
