/* 靜月之光・互動式人物開場 v2.0
 * - 真互動：按住喚醒 → 角色回應 → 分支選擇 → 月輪進站
 * - 角色／背景視差、角色呼吸與眨眼、分支色調與粒子回應
 * - 持續動畫只使用 transform / opacity / canvas，避開 Android background-position 閃爍
 */
(function(){
  'use strict';

  var root=document.documentElement;
  var intro=document.getElementById('jy-cinematic-intro');
  if(!intro)return;

  var params;
  try{params=new URLSearchParams(location.search);}catch(_){params={get:function(){return null;}};}
  var force=params.get('intro')==='1';
  var disabled=params.get('intro')==='0';
  var seen=false;
  try{seen=sessionStorage.getItem('jy-intro-seen-v2')==='1';}catch(_){}
  if(disabled||(seen&&!force)||root.classList.contains('jy-intro-seen')){
    root.classList.add('jy-intro-seen');
    intro.setAttribute('aria-hidden','true');
    intro.style.display='none';
    return;
  }

  var body=document.body;
  var enterBtn=intro.querySelector('[data-jy-intro-enter]');
  var skipBtn=intro.querySelector('[data-jy-intro-skip]');
  var soundBtn=intro.querySelector('[data-jy-intro-sound]');
  var soundLabel=intro.querySelector('[data-jy-intro-sound-label]');
  var dialogue=intro.querySelector('[data-jy-dialogue]');
  var choices=intro.querySelector('[data-jy-choices]');
  var choiceBtns=[].slice.call(intro.querySelectorAll('[data-jy-choice]'));
  var focusLine=intro.querySelector('[data-jy-focus-line]');
  var orb=intro.querySelector('[data-jy-orb]');
  var canvas=intro.querySelector('.jy2-particles');
  var ctx=canvas&&canvas.getContext?canvas.getContext('2d',{alpha:true,desynchronized:true}):null;
  var reduced=!!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var lowPower=reduced||((navigator.hardwareConcurrency||8)<=4)||((navigator.deviceMemory||8)<=3);

  var phase='idle';
  var finished=false;
  var soundOn=true;
  var audioCtx=null,master=null,ambience=null;
  var timers=[];
  var holdRAF=0,holdStart=0,holdPointer=null,holdDone=false;
  var raf=0,w=0,h=0,dpr=1,last=0,burst=0;
  var particles=[];
  var typedToken=0;

  body.classList.add('jy-intro-active');
  intro.setAttribute('aria-hidden','false');
  if(lowPower)intro.classList.add('jy2-low-power');

  function later(fn,ms){var id=setTimeout(fn,ms);timers.push(id);return id;}
  function clearTimers(){while(timers.length)clearTimeout(timers.pop());}
  function markSeen(){try{sessionStorage.setItem('jy-intro-seen-v2','1');}catch(_){}}
  function setPhase(next){phase=next;intro.setAttribute('data-phase',next);}
  function vibrate(pattern){try{if(navigator.vibrate)navigator.vibrate(pattern);}catch(_){}}
  function focusSafe(el){try{el&&el.focus({preventScroll:true});}catch(_){try{el&&el.focus();}catch(__){}}}

  function setSoundUI(){
    if(!soundBtn)return;
    soundBtn.setAttribute('aria-pressed',soundOn?'true':'false');
    var icon=soundBtn.querySelector('.icon');
    if(icon)icon.textContent=soundOn?'♪':'×';
    if(soundLabel)soundLabel.textContent=soundOn?'音效':'靜音';
  }

  function ensureAudio(){
    if(!soundOn||reduced)return false;
    try{
      var AC=window.AudioContext||window.webkitAudioContext;
      if(!AC)return false;
      if(!audioCtx||audioCtx.state==='closed'){
        audioCtx=new AC();
        master=audioCtx.createGain();
        master.gain.value=.0001;
        master.connect(audioCtx.destination);
      }
      if(audioCtx.state==='suspended')audioCtx.resume();
      return true;
    }catch(_){soundOn=false;setSoundUI();return false;}
  }

  function tone(freq,delay,dur,vol,type,detune){
    if(!ensureAudio())return;
    var now=audioCtx.currentTime+(delay||0);
    var o=audioCtx.createOscillator(),g=audioCtx.createGain();
    o.type=type||'sine';o.frequency.setValueAtTime(freq,now);if(detune)o.detune.setValueAtTime(detune,now);
    g.gain.setValueAtTime(.0001,now);g.gain.exponentialRampToValueAtTime(Math.max(.0002,vol||.03),now+.035);g.gain.exponentialRampToValueAtTime(.0001,now+(dur||.5));
    o.connect(g).connect(master);o.start(now);o.stop(now+(dur||.5)+.08);
  }

  function swell(){
    if(!ensureAudio())return;
    var now=audioCtx.currentTime;
    master.gain.cancelScheduledValues(now);master.gain.setValueAtTime(.0001,now);master.gain.exponentialRampToValueAtTime(.095,now+.18);
    if(ambience){try{ambience.stop();}catch(_){}}
    var o=audioCtx.createOscillator(),g=audioCtx.createGain(),f=audioCtx.createBiquadFilter();
    o.type='sine';o.frequency.setValueAtTime(73.42,now);o.frequency.exponentialRampToValueAtTime(110,now+2.2);
    f.type='lowpass';f.frequency.value=380;g.gain.setValueAtTime(.0001,now);g.gain.exponentialRampToValueAtTime(.055,now+.35);g.gain.exponentialRampToValueAtTime(.012,now+3.4);
    o.connect(f).connect(g).connect(master);o.start(now);ambience=o;
    tone(392,.04,1.4,.06,'sine');tone(587.33,.1,1.1,.035,'triangle');tone(783.99,.72,1.5,.055,'sine');
  }

  function choiceSound(kind){
    if(!ensureAudio())return;
    var map={love:[440,659.25,880],career:[392,587.33,783.99],wealth:[329.63,493.88,739.99],moon:[349.23,523.25,783.99]};
    var a=map[kind]||map.moon;
    tone(a[0],0,.9,.045,'sine');tone(a[1],.08,.78,.038,'triangle');tone(a[2],.16,1.1,.032,'sine');
  }

  function enterSound(){
    if(!ensureAudio())return;
    tone(523.25,0,1.15,.06,'sine');tone(783.99,.05,1.05,.055,'triangle');tone(1046.5,.14,1.25,.045,'sine');tone(1567.98,.2,.85,.025,'sine');
    var now=audioCtx.currentTime;master.gain.cancelScheduledValues(now+.55);master.gain.setValueAtTime(.08,now+.55);master.gain.exponentialRampToValueAtTime(.0001,now+1.25);
  }

  function stopAudio(){
    if(!audioCtx||!master)return;
    try{var now=audioCtx.currentTime;master.gain.cancelScheduledValues(now);master.gain.setValueAtTime(Math.max(.0001,master.gain.value||.04),now);master.gain.exponentialRampToValueAtTime(.0001,now+.28);later(function(){try{audioCtx.suspend();}catch(_){}},360);}catch(_){}
  }

  function toggleSound(){
    soundOn=!soundOn;setSoundUI();
    if(!soundOn)stopAudio();else if(phase!=='idle'&&!finished){ensureAudio();tone(659.25,0,.65,.045,'sine');tone(987.77,.08,.5,.025,'triangle');}
  }

  function typeText(text,done){
    typedToken++;
    var token=typedToken,i=0;
    dialogue.textContent='';
    function step(){
      if(token!==typedToken||finished)return;
      var amount=/[，。！？；]/.test(text.charAt(i))?1:((i%4===0)?2:1);
      dialogue.textContent=text.slice(0,Math.min(text.length,i+amount));
      i+=amount;
      if(i<text.length)later(step,/[，。！？；]/.test(text.charAt(i-1))?120:36);
      else if(done)later(done,260);
    }
    step();
  }

  function summon(){
    if(phase!=='idle'||holdDone)return;
    holdDone=true;setPhase('summon');burst=2.2;vibrate([18,24,36]);swell();
    later(function(){
      if(finished)return;
      setPhase('oracle');
      typeText('我已聽見你心裡那個沒有說出口的問題。告訴我，它最接近哪一件事？',function(){choices.classList.add('is-ready');focusSafe(choiceBtns[0]);});
    },1680);
  }

  function resetHold(){
    if(holdDone)return;
    cancelAnimationFrame(holdRAF);holdRAF=0;holdStart=0;holdPointer=null;
    intro.style.setProperty('--jy-hold','0%');
  }

  function holdTick(now){
    if(!holdStart||holdDone)return;
    var pct=Math.min(1,(now-holdStart)/920);
    intro.style.setProperty('--jy-hold',(pct*100).toFixed(1)+'%');
    if(pct>=1){holdRAF=0;summon();return;}
    holdRAF=requestAnimationFrame(holdTick);
  }

  function startHold(e){
    if(phase!=='idle'||holdDone)return;
    if(e&&e.button!=null&&e.button!==0)return;
    if(e&&e.preventDefault)e.preventDefault();
    ensureAudio();
    holdPointer=e&&e.pointerId!=null?e.pointerId:'key';
    holdStart=performance.now();
    intro.style.setProperty('--jy-hold','1%');
    if(enterBtn&&e&&e.pointerId!=null){try{enterBtn.setPointerCapture(e.pointerId);}catch(_){}}
    holdRAF=requestAnimationFrame(holdTick);
    vibrate(12);
  }

  function endHold(e){
    if(holdDone)return;
    if(holdPointer!==null&&e&&e.pointerId!=null&&holdPointer!==e.pointerId)return;
    resetHold();
  }

  var copy={
    love:'你要問的不是一句「愛不愛」，而是這段關係值不值得你繼續投入。把那個名字放進月輪。',
    career:'你需要的不是空泛鼓勵，而是看清阻力、機會與下一步。把真正卡住你的事放進月輪。',
    wealth:'先分清機會與誘惑，再談能不能得到。把你正在衡量的選擇放進月輪。',
    moon:'你不必先替問題分類。把此刻最放不下的那件事，直接交給月光。'
  };

  function choose(kind){
    if(phase!=='oracle')return;
    kind=copy[kind]?kind:'moon';
    intro.setAttribute('data-intent',kind);
    try{sessionStorage.setItem('jy-intro-intent',kind);}catch(_){}
    focusLine.textContent=copy[kind];
    choices.classList.remove('is-ready');
    setPhase('focus');burst=3.2;choiceSound(kind);vibrate([12,30,18]);
    later(function(){focusSafe(orb);},500);
  }

  function applyIntent(){
    var kind=intro.getAttribute('data-intent')||'moon';
    var q=document.getElementById('f-question');
    if(q&&!q.value){
      var ph={love:'例：她對我是真心，還是只把我當朋友？',career:'例：我現在應該留在原工作，還是換一條路？',wealth:'例：這個投資或副業值得繼續投入嗎？',moon:'輸入你此刻最想知道的問題…'};
      q.placeholder=ph[kind]||ph.moon;
      q.setAttribute('data-intro-intent',kind);
    }
  }

  function enterSite(){
    if(phase!=='focus'||finished)return;
    setPhase('enter');burst=8;enterSound();vibrate([24,40,48]);
    later(function(){finish(false);},1050);
  }

  function finish(immediate){
    if(finished)return;
    finished=true;typedToken++;clearTimers();resetHold();stopAudio();applyIntent();
    intro.classList.add('is-finishing');intro.setAttribute('aria-hidden','true');body.classList.remove('jy-intro-active');
    var delay=immediate?260:720;
    later(function(){
      markSeen();root.classList.add('jy-intro-seen');intro.style.display='none';
      if(raf)cancelAnimationFrame(raf);raf=0;
      var q=document.getElementById('f-question');
      if(!immediate&&q){try{q.scrollIntoView({behavior:reduced?'auto':'smooth',block:'center'});}catch(_){}later(function(){focusSafe(q);},reduced?20:520);}
    },delay);
  }

  function skip(){if(finished)return;setPhase('enter');finish(true);}

  function resize(){
    if(!canvas||!ctx)return;
    var r=intro.getBoundingClientRect();w=Math.max(1,Math.round(r.width));h=Math.max(1,Math.round(r.height));dpr=Math.min(window.devicePixelRatio||1,lowPower?1:1.5);
    canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);canvas.style.width=w+'px';canvas.style.height=h+'px';ctx.setTransform(dpr,0,0,dpr,0,0);
    var count=lowPower?34:Math.min(92,Math.round((w*h)/12000));particles.length=0;
    for(var i=0;i<count;i++)particles.push({x:Math.random()*w,y:Math.random()*h,r:.45+Math.random()*1.4,v:.06+Math.random()*.22,a:.12+Math.random()*.48,p:Math.random()*Math.PI*2,g:Math.random()>.82});
  }

  function draw(now){
    if(finished||!ctx)return;
    if(now-last<(lowPower?33:16)){raf=requestAnimationFrame(draw);return;}last=now;
    ctx.clearRect(0,0,w,h);
    var intent=intro.getAttribute('data-intent');
    var rgb=intent==='love'?[231,126,172]:intent==='wealth'?[239,190,86]:intent==='career'?[151,147,244]:[180,188,255];
    for(var i=0;i<particles.length;i++){
      var p=particles[i];p.y-=p.v*(1+burst*.18);p.x+=Math.sin(now*.00045+p.p)*.08;
      if(p.y<-5){p.y=h+5;p.x=Math.random()*w;}
      var tw=.48+.52*Math.sin(now*.0013+p.p);var alpha=p.a*tw*(phase==='idle'?.55:1);
      ctx.beginPath();ctx.arc(p.x,p.y,p.r*(p.g?1.35:1),0,Math.PI*2);ctx.fillStyle='rgba('+rgb[0]+','+rgb[1]+','+rgb[2]+','+alpha.toFixed(3)+')';ctx.fill();
      if(p.g&&alpha>.25){ctx.beginPath();ctx.moveTo(p.x-4,p.y);ctx.lineTo(p.x+4,p.y);ctx.moveTo(p.x,p.y-4);ctx.lineTo(p.x,p.y+4);ctx.strokeStyle='rgba(255,236,174,'+(alpha*.45).toFixed(3)+')';ctx.lineWidth=.5;ctx.stroke();}
    }
    burst*=.962;if(burst<.03)burst=0;
    raf=requestAnimationFrame(draw);
  }

  function parallax(e){
    if(finished||reduced)return;
    var x,y;
    if(e.touches&&e.touches[0]){x=e.touches[0].clientX;y=e.touches[0].clientY;}else{x=e.clientX;y=e.clientY;}
    var nx=(x/window.innerWidth-.5),ny=(y/window.innerHeight-.5);
    intro.style.setProperty('--jy2-px',(nx*10).toFixed(2)+'px');intro.style.setProperty('--jy2-py',(ny*8).toFixed(2)+'px');
  }

  if(enterBtn){
    enterBtn.addEventListener('pointerdown',startHold,{passive:false});
    enterBtn.addEventListener('pointerup',endHold);enterBtn.addEventListener('pointercancel',endHold);enterBtn.addEventListener('pointerleave',endHold);
    enterBtn.addEventListener('keydown',function(e){if((e.key==='Enter'||e.key===' ')&&!holdDone){e.preventDefault();startHold();}});
    enterBtn.addEventListener('keyup',function(e){if(e.key==='Enter'||e.key===' ')endHold();});
  }
  choiceBtns.forEach(function(btn){btn.addEventListener('click',function(){choose(btn.getAttribute('data-jy-choice'));});});
  if(orb)orb.addEventListener('click',enterSite);
  if(skipBtn)skipBtn.addEventListener('click',skip);
  if(soundBtn)soundBtn.addEventListener('click',toggleSound);
  intro.addEventListener('pointermove',parallax,{passive:true});
  window.addEventListener('resize',resize,{passive:true});
  document.addEventListener('visibilitychange',function(){if(document.hidden){if(raf)cancelAnimationFrame(raf);raf=0;}else if(!finished&&!raf){raf=requestAnimationFrame(draw);}});

  setSoundUI();resize();if(ctx)raf=requestAnimationFrame(draw);focusSafe(enterBtn);
})();
