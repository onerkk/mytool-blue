/* Narrative continuity. Fields remain in their original DOM and retain their
 * original validation/handlers. This layer never changes chart or draw data. */
(function(root){
 'use strict';
 var steps=Object.create(null),homeScene=null,homeObserver=null,homeVisible=false,homeSuspended=false,homeHost=null;
 function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
 function cast(kind){return root.JYCinema&&root.JYCinema.cast[kind];}
 function portrait(cfg){return '<div class="jc-portrait" aria-hidden="true">'+[0,1,3].map(function(n){return '<span data-jc-pose="'+n+'" style="background-image:url(assets/ui/'+cfg.actor+'.webp);background-position:'+(n*100/3)+'% 0"></span>';}).join('')+'</div>';}
 function addGuide(header,kind){
  if(!header)return;
  var existing=header.querySelector('.jc-guide');if(existing&&header.getAttribute('data-chapter')===kind)return;if(existing)existing.remove();
  var cfg=cast(kind);if(!cfg)return;
  var guide=document.createElement('div');guide.className='jc-guide';guide.innerHTML=portrait(cfg)+'<div class="jc-guide-line"><span>'+cfg.speaker+' <small>· '+cfg.role+'</small></span><p>'+cfg.lens+'</p></div>';
  header.classList.add('jc-room-header');header.setAttribute('data-chapter',kind);header.appendChild(guide);
 }
 function enhance(container){
  if(!container||!container.querySelector)return;
  var header=container.querySelector('.at-tool-header'),art=header&&header.querySelector('[data-art]');
  var kind=art&&art.getAttribute('data-art'),cfg=cast(kind);if(!cfg)return;
  addGuide(header,kind);
  var selector={lenormand:'.ln-section',bazi:'.bzx-section',meihua:'.mhx-section',ziwei:'.zw-in-sec',compat:'.bzs-card'}[kind];
  var submit=container.querySelector('.ln-draw-btn,.bzx-cast-btn,.mhx-cast-btn,.zw-in-go,[data-act="cast-compat"],[data-act="cast-single"],[data-act="cast-personality"]');
  var sections=selector?Array.from(container.querySelectorAll(selector)):[];
  if(!submit||sections.length<2){delete steps[kind];header.setAttribute('data-guide-state','result');results(container);return;}
  if(container.querySelector('.jc-flow'))return;
  // A rerender (changing a spread/gender/method) resumes the same chapter.
  var groups=kind==='lenormand'?[sections.slice(0,1),sections.slice(1,2),sections.slice(2)]:sections.map(function(s){return [s];});
  groups=groups.filter(function(g){return g.length;});
  var current=Math.min(steps[kind]||0,groups.length-1),all=false;
  var nav=document.createElement('nav');nav.className='jc-flow';nav.setAttribute('aria-label','填寫進度');
  var labels=kind==='lenormand'?['心裡的問題','選擇牌陣','個人設定']:kind==='compat'?['關係情境','甲方資料','乙方資料','關係問題']:kind==='bazi'?['出生資料','心裡的問題']:kind==='ziwei'?['心裡的問題','出生資料']:['心裡的問題','起卦方式'];
  nav.innerHTML='<div class="jc-flow-steps">'+groups.map(function(g,i){return '<button type="button" data-jc-step="'+i+'"><b>'+String(i+1).padStart(2,'0')+'</b><span>'+esc(labels[i]||'核對資料')+'</span></button>';}).join('')+'</div><div class="jc-flow-status" aria-live="polite"></div>';
  sections[0].before(nav);
  var actions=document.createElement('div');actions.className='jc-flow-actions';actions.innerHTML='<button type="button" class="jc-previous">← 上一步</button><button type="button" class="jc-continue">繼續 →</button><button type="button" class="jc-all">展開全部欄位</button>';
  submit.before(actions);
  var oldFlow=container.querySelector('.at-flow-guide');if(oldFlow)oldFlow.hidden=true;
  function update(focus){
   steps[kind]=current;
   groups.forEach(function(g,i){g.forEach(function(s){s.classList.add('jc-pane');s.hidden=!all&&i!==current;});});
   nav.querySelectorAll('[data-jc-step]').forEach(function(b,i){b.setAttribute('aria-current',i===current?'step':'false');});
   nav.querySelector('.jc-flow-status').textContent=all?'所有欄位已展開，可自由核對。':'第 '+(current+1)+' 步，共 '+groups.length+' 步 · '+(labels[current]||'核對資料');
   header.setAttribute('data-guide-state',current?'listening':'welcome');
   actions.querySelector('.jc-previous').hidden=current===0||all;
   actions.querySelector('.jc-continue').hidden=current===groups.length-1||all;
   actions.querySelector('.jc-all').textContent=all?'回到逐步填寫':'展開全部欄位';
   submit.hidden=!all&&current!==groups.length-1;
   if(focus){var first=groups[current][0];first.tabIndex=-1;first.focus({preventScroll:true});first.scrollIntoView({block:'start',behavior:'auto'});}
  }
  actions.querySelector('.jc-previous').onclick=function(){current=Math.max(0,current-1);update(true);};
  actions.querySelector('.jc-continue').onclick=function(){current=Math.min(groups.length-1,current+1);update(true);};
  actions.querySelector('.jc-all').onclick=function(){all=!all;update(false);};
  nav.querySelectorAll('[data-jc-step]').forEach(function(btn){btn.onclick=function(){current=Number(btn.getAttribute('data-jc-step'));all=false;update(true);};});
  // Existing validation can report an error in any section. Reveal all before
  // invoking it so an invalid date/location can never be trapped off-screen.
  submit.addEventListener('click',function(){all=true;update(false);},true);
  update(false);
 }
 function inputGuide(){
  var input=document.getElementById('input-screen');if(!input)return;
  var header=input.querySelector('.at-input-head');addGuide(header,input.getAttribute('data-atelier-mode')==='ootk'?'ootk':'tarot');
 }
 function results(container){
  if(!container||!container.querySelector||container.querySelector('.jc-reading-close'))return;
  var target=container.querySelector('.ln-ai-card,.bzx-ai-card,.mhx-ai-card,.zw-ai,.orc-ai-card,.bzs-copy-guide');
  if(!target&&container.id!=='step-tarot')return;
  var note=document.createElement('aside');note.className='jc-reading-close';note.innerHTML='<span class="jc-close-label">把提醒，帶回生活</span><h3>留下一個，做得到的下一步。</h3><p>把本次提示詞貼到 AI 送出後，先對照自己的經驗，再選一件可以開始的小事。你仍然可以調整自己的選擇。</p><details><summary>為這段靜心時間，留一個日常提醒 ↗</summary><p>如果你喜歡水晶與飾品，可以到靜月蝦皮選一件合眼緣的日常配件，紀念自己願意重新出發的時刻。</p><a href="https://shopee.tw/a50h95648d?tab=shop" target="_blank" rel="noopener noreferrer">逛逛靜月蝦皮選物 ↗</a></details>';
  if(target){var parent=target.closest('.bzs-card')||target;parent.after(note);}else container.appendChild(note);
 }
 function oracle(container,phase){
  if(!container||container.querySelector('.jc-oracle-companion'))return;
  if(['praying','allowThrowing','throwing','rising','shaking','shengjia','todayClosed'].indexOf(phase)>=0)return;
  var area=container.querySelector('.orc-fade');if(!area)return;
  var cfg=cast('oracle');if(!cfg)return;
  var guide=document.createElement('div');guide.className='jc-oracle-companion';guide.setAttribute('data-guide-state',phase==='poem'?'result':'welcome');
  var line=phase==='poem'?'慢慢讀完這首籤，再把提醒帶回生活。':phase==='drawn'?'保留這次求得的籤，接著依流程擲筊確認。':'我是清和。先安定心緒，一次專注一件想釐清的事。';
  guide.innerHTML=portrait(cfg)+'<div><span>清和 <small>· 靜心引路人</small></span><p>'+line+'</p></div>';area.prepend(guide);
  if(phase==='poem')results(container);
 }
 function syncHome(){
  if(homeScene&&(!homeVisible||homeSuspended||document.hidden))releaseHome();
  if(!homeScene&&homeVisible&&!homeSuspended&&!document.hidden&&homeHost&&homeHost.isConnected&&root.JYCinema){
   try{homeScene=root.JYCinema.mount(homeHost,'tarot',{mode:'hold',reduced:!!(root.matchMedia&&root.matchMedia('(prefers-reduced-motion: reduce)').matches)});}
   catch(error){releaseHome();if(root.console)root.console.warn('[JYCinema home mount]',error);}
  }
 }
 function releaseHome(){
  var scene=homeScene;homeScene=null;
  try{if(scene&&typeof scene.dispose==='function')scene.dispose();}
  catch(error){if(root.console)root.console.warn('[JYCinema home dispose]',error);}
  finally{if(homeHost){homeHost.querySelectorAll('canvas').forEach(function(canvas){canvas.remove();});homeHost.classList.remove('jr-gpu-ready','jr-actor-ready');}}
 }
 function homePhase(value){try{if(homeScene)homeScene.setPhase(value);}catch(error){releaseHome();if(root.console)root.console.warn('[JYCinema home phase]',error);}}
 function home(){
  var hero=document.querySelector('.at-hero');if(!hero)return;
  if(hero.querySelector('.jc-home-stage'))return;
  var art=hero.querySelector('.at-hero-art'),cfg=cast('tarot');if(!art||!cfg)return;
  hero.classList.add('jc-home-hero');
  var title=hero.querySelector('h1');if(title)title.innerHTML='心裡的事，<br><em>今晚慢慢說。</em>';
  var subtitle=hero.querySelector('.at-hero-copy>p');if(subtitle)subtitle.innerHTML='走進月光裡，與自己相遇。<br>從一個問題，找到能前進的方向。';
  var eyebrow=hero.querySelector('.at-eyebrow');if(eyebrow)eyebrow.textContent='JINGYUE · 月下問心';
  var old=art.querySelector('img');if(old)old.hidden=true;
  homeHost=document.createElement('div');homeHost.className='jc-home-stage';
  homeHost.innerHTML='<div class="jr-actor-fallback" aria-hidden="true"><span class="jr-actor-pose" style="opacity:1;background-image:url(assets/ui/lunar-guide.webp);background-position:0% 0"></span></div>';
  art.prepend(homeHost);
  var cap=document.createElement('div');cap.className='jc-home-caption';cap.innerHTML='<span>月見 <small>· 塔羅引路人</small></span><p>「不必急著有答案，先說說你最在意的事。」</p>';art.appendChild(cap);
  homeHost.addEventListener('pointerenter',function(){homePhase(3);});
  homeHost.addEventListener('pointerleave',function(){homePhase(0);});
  var button=hero.querySelector('#home-cta-btn>span');if(button)button.textContent='走進月下神殿';
  if(typeof IntersectionObserver==='function'){homeObserver?.disconnect();homeObserver=new IntersectionObserver(function(entries){homeVisible=entries.some(function(e){return e.isIntersecting;});syncHome();},{threshold:.08});homeObserver.observe(homeHost);}
  // Older browsers keep an illustrated entrance rather than a permanent render loop.
 }
 function start(){inputGuide();home();var result=document.getElementById('step-tarot');if(result)results(result);document.addEventListener('visibilitychange',syncHome);}
 root.JYCinemaUI={enhance:enhance,home:home,input:inputGuide,oracle:oracle,results:results,suspendHome:function(value){homeSuspended=!!value;syncHome();}};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})(window);
