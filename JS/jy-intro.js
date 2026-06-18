/* 靜月之光・月門開場 v1.0
 * - 原創動畫，不複製外站角色／畫面／素材
 * - GPU 友善：主動畫僅使用 transform / opacity
 * - 音效由 Web Audio 即時合成，不載入外部音檔
 * - sessionStorage：同一分頁工作階段只播放一次；?intro=1 可強制重播
 */
(function(){
  'use strict';

  var root = document.documentElement;
  var intro = document.getElementById('jy-cinematic-intro');
  if (!intro) return;

  var params;
  try { params = new URLSearchParams(location.search); } catch (_) { params = { get:function(){ return null; } }; }
  var force = params.get('intro') === '1';
  var disabled = params.get('intro') === '0';
  var alreadySeen = false;
  try { alreadySeen = sessionStorage.getItem('jy-intro-seen') === '1'; } catch (_) {}

  if (disabled || (alreadySeen && !force) || root.classList.contains('jy-intro-seen')) {
    root.classList.add('jy-intro-seen');
    intro.setAttribute('aria-hidden','true');
    return;
  }

  var body = document.body;
  var enterBtn = intro.querySelector('[data-jy-intro-enter]');
  var skipBtn = intro.querySelector('[data-jy-intro-skip]');
  var soundBtn = intro.querySelector('[data-jy-intro-sound]');
  var soundLabel = intro.querySelector('[data-jy-intro-sound-label]');
  var canvas = intro.querySelector('canvas');
  var ctx = canvas && canvas.getContext ? canvas.getContext('2d',{ alpha:true, desynchronized:true }) : null;
  var reducedMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var lowPower = reducedMotion || ((navigator.hardwareConcurrency || 8) <= 4) || ((navigator.deviceMemory || 8) <= 3);
  var soundOn = true;
  var started = false;
  var finished = false;
  var timers = [];
  var raf = 0;
  var particles = [];
  var w = 0, h = 0, dpr = 1, lastDraw = 0, burst = 0;
  var audioCtx = null;
  var masterGain = null;

  body.classList.add('jy-intro-active');
  intro.setAttribute('aria-hidden','false');
  if (lowPower) intro.classList.add('jy-low-power');

  function later(fn,ms){
    var id = window.setTimeout(fn,ms);
    timers.push(id);
    return id;
  }

  function clearTimers(){
    while(timers.length) window.clearTimeout(timers.pop());
  }

  function safeFocus(el){
    try { if (el && typeof el.focus === 'function') el.focus({ preventScroll:true }); } catch (_) { try { el.focus(); } catch(__){} }
  }

  function markSeen(){
    try { sessionStorage.setItem('jy-intro-seen','1'); } catch (_) {}
  }

  function finish(immediate){
    if (finished) return;
    finished = true;
    clearTimers();
    stopAudio(immediate ? .05 : .45);
    intro.classList.add('is-finishing');
    intro.setAttribute('aria-hidden','true');
    body.classList.remove('jy-intro-active');
    var delay = immediate ? 260 : 620;
    later(function(){
      markSeen();
      root.classList.add('jy-intro-seen');
      intro.style.display = 'none';
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      var mainCta = document.getElementById('home-cta-btn');
      safeFocus(mainCta);
    },delay);
  }

  function skip(){
    if (finished) return;
    intro.classList.add('is-opening');
    finish(true);
  }

  function setSoundUI(){
    if (!soundBtn) return;
    soundBtn.setAttribute('aria-pressed',soundOn ? 'true' : 'false');
    var icon = soundBtn.querySelector('.icon');
    if (icon) icon.textContent = soundOn ? '♪' : '×';
    if (soundLabel) soundLabel.textContent = soundOn ? '音效 開' : '音效 關';
  }

  function toggleSound(){
    soundOn = !soundOn;
    setSoundUI();
    if (!soundOn) stopAudio(.16);
    else if (started && !finished) startAudio(true);
  }

  function makeGain(value,time){
    var g = audioCtx.createGain();
    g.gain.setValueAtTime(value,time);
    return g;
  }

  function tone(freq,start,duration,volume,type){
    if (!audioCtx || !masterGain) return;
    var osc = audioCtx.createOscillator();
    var gain = audioCtx.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq,start);
    gain.gain.setValueAtTime(0.0001,start);
    gain.gain.exponentialRampToValueAtTime(Math.max(.0002,volume),start+.04);
    gain.gain.exponentialRampToValueAtTime(.0001,start+duration);
    osc.connect(gain).connect(masterGain);
    osc.start(start);
    osc.stop(start+duration+.06);
  }

  function startAudio(resumeOnly){
    if (!soundOn || reducedMotion) return;
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      if (!audioCtx || audioCtx.state === 'closed') {
        audioCtx = new AC();
        masterGain = audioCtx.createGain();
        masterGain.gain.setValueAtTime(.0001,audioCtx.currentTime);
        masterGain.connect(audioCtx.destination);
      }
      if (audioCtx.state === 'suspended') audioCtx.resume();
      var now = audioCtx.currentTime + .02;
      masterGain.gain.cancelScheduledValues(now);
      masterGain.gain.setValueAtTime(.0001,now);
      masterGain.gain.exponentialRampToValueAtTime(.09,now+.18);
      masterGain.gain.exponentialRampToValueAtTime(.0001,now+4.25);

      if (resumeOnly) {
        tone(659.25,now,.9,.09,'sine');
        tone(987.77,now+.08,.72,.04,'triangle');
        return;
      }

      /* 低頻月門共鳴 */
      [73.42,110,146.83].forEach(function(freq,i){
        var osc = audioCtx.createOscillator();
        var g = audioCtx.createGain();
        var f = audioCtx.createBiquadFilter();
        osc.type = i === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq,now);
        f.type = 'lowpass'; f.frequency.setValueAtTime(520,now); f.Q.setValueAtTime(.8,now);
        g.gain.setValueAtTime(.0001,now);
        g.gain.exponentialRampToValueAtTime(i===0?.045:.018,now+.35);
        g.gain.exponentialRampToValueAtTime(.0001,now+3.95);
        osc.connect(f).connect(g).connect(masterGain);
        osc.start(now); osc.stop(now+4.05);
      });

      /* 三段鈴音，對應解印、開門、顯字 */
      tone(523.25,now+.03,1.1,.11,'sine');
      tone(783.99,now+.07,.86,.055,'triangle');
      tone(659.25,now+1.05,1.25,.105,'sine');
      tone(987.77,now+1.13,.92,.05,'triangle');
      tone(783.99,now+2.38,1.35,.095,'sine');
      tone(1174.66,now+2.48,1.05,.045,'triangle');
    } catch (_) {
      soundOn = false;
      setSoundUI();
    }
  }

  function stopAudio(fade){
    if (!audioCtx || !masterGain) return;
    try {
      var now = audioCtx.currentTime;
      masterGain.gain.cancelScheduledValues(now);
      masterGain.gain.setValueAtTime(Math.max(.0001,masterGain.gain.value || .04),now);
      masterGain.gain.exponentialRampToValueAtTime(.0001,now+(fade||.2));
      later(function(){ try { if (audioCtx && audioCtx.state !== 'closed') audioCtx.suspend(); } catch(_){} },Math.ceil((fade||.2)*1000)+80);
    } catch (_) {}
  }

  function start(){
    if (started || finished) return;
    started = true;
    if (enterBtn) enterBtn.disabled = true;
    startAudio(false);
    burst = 1;
    intro.classList.add('is-opening');

    if (reducedMotion) {
      later(function(){ intro.classList.add('is-revealing'); },100);
      later(function(){ finish(false); },780);
      return;
    }

    later(function(){ intro.classList.add('is-unsealing'); burst = 1.7; },620);
    later(function(){ intro.classList.add('is-passing'); burst = 3.4; },1640);
    later(function(){ intro.classList.add('is-revealing'); burst = 1.2; },2920);
    later(function(){ finish(false); },4380);
  }

  function resizeCanvas(){
    if (!canvas || !ctx) return;
    var rect = intro.getBoundingClientRect();
    w = Math.max(1,Math.round(rect.width));
    h = Math.max(1,Math.round(rect.height));
    dpr = Math.min(window.devicePixelRatio || 1, lowPower ? 1 : 1.5);
    canvas.width = Math.round(w*dpr);
    canvas.height = Math.round(h*dpr);
    canvas.style.width = w+'px';
    canvas.style.height = h+'px';
    ctx.setTransform(dpr,0,0,dpr,0,0);
    makeParticles();
  }

  function makeParticles(){
    if (!ctx || reducedMotion) return;
    var count = lowPower ? 24 : Math.min(58,Math.max(34,Math.round((w*h)/36000)));
    particles = [];
    for (var i=0;i<count;i++) {
      var a = Math.random()*Math.PI*2;
      var r = Math.random()*Math.max(w,h)*.56;
      particles.push({
        x:w*.5+Math.cos(a)*r,
        y:h*.48+Math.sin(a)*r,
        a:a,
        r:r,
        z:.25+Math.random()*.85,
        s:.08+Math.random()*.22,
        tw:Math.random()*Math.PI*2,
        warm:Math.random()>.72
      });
    }
  }

  function draw(ts){
    if (!ctx || finished || document.hidden) { raf = requestAnimationFrame(draw); return; }
    if (ts-lastDraw < (lowPower ? 42 : 28)) { raf=requestAnimationFrame(draw); return; }
    lastDraw = ts;
    ctx.clearRect(0,0,w,h);
    var cx=w*.5, cy=h*.48;
    for (var i=0;i<particles.length;i++) {
      var p=particles[i];
      p.tw += .018*p.z;
      p.r += p.s*(1+burst*1.65);
      if (p.r > Math.max(w,h)*.78) {
        p.r = 14+Math.random()*70;
        p.a = Math.random()*Math.PI*2;
      }
      var x = cx+Math.cos(p.a)*p.r;
      var y = cy+Math.sin(p.a)*p.r*.9;
      var alpha=(.18+.28*(.5+.5*Math.sin(p.tw)))*p.z;
      var size=.45+1.15*p.z;
      if (started && burst>1.5) {
        var px=cx+Math.cos(p.a)*(p.r-10-14*p.z);
        var py=cy+Math.sin(p.a)*(p.r-10-14*p.z)*.9;
        var grad=ctx.createLinearGradient(px,py,x,y);
        grad.addColorStop(0,'rgba(229,197,109,0)');
        grad.addColorStop(1,p.warm?'rgba(245,210,122,'+Math.min(.55,alpha+.18)+')':'rgba(165,177,255,'+Math.min(.48,alpha+.15)+')');
        ctx.strokeStyle=grad;ctx.lineWidth=Math.max(.45,p.z);
        ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(x,y);ctx.stroke();
      } else {
        ctx.fillStyle=p.warm?'rgba(239,207,125,'+alpha+')':'rgba(188,197,255,'+alpha+')';
        ctx.beginPath();ctx.arc(x,y,size,0,Math.PI*2);ctx.fill();
      }
    }
    burst *= .985;
    raf=requestAnimationFrame(draw);
  }

  function pointerMove(ev){
    if (started || reducedMotion) return;
    var x=0,y=0;
    if (ev && typeof ev.clientX==='number') {
      x=(ev.clientX/window.innerWidth-.5)*2;
      y=(ev.clientY/window.innerHeight-.5)*2;
    }
    intro.style.setProperty('--jy-x',(Math.max(-1,Math.min(1,x))*8).toFixed(2)+'px');
    intro.style.setProperty('--jy-y',(Math.max(-1,Math.min(1,y))*5).toFixed(2)+'px');
  }

  if (enterBtn) enterBtn.addEventListener('click',start,{ passive:true });
  if (skipBtn) skipBtn.addEventListener('click',skip,{ passive:true });
  if (soundBtn) soundBtn.addEventListener('click',toggleSound,{ passive:true });
  intro.addEventListener('pointermove',pointerMove,{ passive:true });
  window.addEventListener('resize',resizeCanvas,{ passive:true });
  document.addEventListener('keydown',function(ev){
    if (finished) return;
    if (ev.key==='Escape') { ev.preventDefault(); skip(); }
    else if ((ev.key==='Enter'||ev.key===' ') && !started && document.activeElement!==soundBtn && document.activeElement!==skipBtn) { ev.preventDefault(); start(); }
  });

  setSoundUI();
  resizeCanvas();
  if (ctx && !reducedMotion) raf=requestAnimationFrame(draw);
  safeFocus(enterBtn);

  /* 防止任何意外把使用者困在覆蓋層 */
  later(function(){ if (!finished) finish(true); },18000);

  window.JYIntro = {
    start:start,
    skip:skip,
    replay:function(){
      try { sessionStorage.removeItem('jy-intro-seen'); } catch(_){}
      var u=new URL(location.href);u.searchParams.set('intro','1');location.href=u.toString();
    }
  };
})();
