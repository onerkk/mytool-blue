/* 靜月之光 · Moon Sanctum. Scenes accompany the existing reading; they never draw again. */
(function (root) {
  'use strict';
  var active = null;
  var themes = {
    ootk:{name:'開鑰之法',world:'moon-sanctum',room:'秘鑰之門',en:'OPENING OF THE KEY',title:'一扇門，一層新的觀察。',intro:'帶著同一個問題，沿著五層程序慢慢探索。每層看完，再決定何時繼續。',focus:'讓牌，為第一扇門聚攏。',guide:'左右拖曳牌組，或按住片刻。',action:'牌在聚攏，第一扇門即將開啟',ready:'從第一層，開始觀察。',outro:'接下來保留每次操作的牌序、計數與配對；若程序需要停止，會清楚說明原因。',finish:'進入五層程序',type:'hold'},
    tarot: {name:'塔羅',world:'moon-sanctum',room:'月下神殿',en:'THE MOON SANCTUM',title:'今夜，先聽見自己。',intro:'越過日常的喧囂，把最在意的那件事，留在這片月光裡。',focus:'讓牌，回應你的觸碰。',guide:'按住牌組，讓散落的心緒慢慢收攏。',action:'月光正在穿過牌組',ready:'牌已洗好，輪到你的直覺。',outro:'不必尋找「正確」的一張。接下來，從牌背中選出你的牌。',finish:'開始選牌',type:'hold'},
    lenormand: {name:'雷諾曼',world:'moon-garden',room:'翡翠月庭',en:'THE EMERALD GARDEN',title:'線索，藏在相遇之間。',intro:'沿著月光走進庭院。帶著一個具體的問題，看看牌與牌會如何相遇。',focus:'親手，揭開故事的起點。',guide:'依你的節奏，輕觸面前的牌。',action:'讓線索在月光裡相連',ready:'讓相遇的牌，連成一句話。',outro:'帶著原來的問題，查看完整牌陣與牌序，再探索它們之間的關係。',finish:'展開完整牌陣',type:'cards'},
    bazi: {name:'八字命理',world:'celestial-observatory',room:'時光觀測殿',en:'THE HALL OF TIME',title:'每段人生，都有自己的節奏。',intro:'走入時間的長廊。從出生的那一刻，重新認識一路走來的自己。',focus:'點亮，生命的四個座標。',guide:'依序輕觸年、月、日、時，為這次探索留下一個安靜的起點。',action:'四個時間座標，緩緩相會',ready:'時間的長卷，為你展開。',outro:'接下來核對四柱與排盤資料，從中整理自己的特質、選擇與生活節奏。',finish:'展開我的命盤',type:'seals',seals:['年','月','日','時']},
    compat: {name:'八字合盤',world:'celestial-observatory',room:'雙星之境',en:'WHEN TWO WORLDS MEET',title:'相遇，從理解彼此開始。',intro:'兩個人帶著不同的時間與故事而來。先看見彼此，再談如何靠近。',focus:'為彼此，留一束光。',guide:'輕觸兩個座標。你們各自完整，也能一起尋找相處的方法。',action:'兩束光，照見相遇的地方',ready:'一起看見，關係裡的可能。',outro:'合盤將並列兩人的資料與互動線索；理解差異，讓下一次對話更清楚。',finish:'展開兩人的合盤',type:'seals',seals:['甲方','乙方']},
    ziwei: {name:'紫微斗數',world:'celestial-observatory',room:'紫微觀星殿',en:'THE CELESTIAL OBSERVATORY',title:'抬頭，看見人生的不同面向。',intro:'讓視線穿過星軌。那些關於自己、關係與未來的疑問，都有值得慢慢理解的位置。',focus:'讓星軌，從你手中啟動。',guide:'按住星儀，喚起十二宮的光。',action:'十二宮，沿星軌依次點亮',ready:'星圖已亮，從自己開始。',outro:'先核對命盤，再循宮位探索人生面向；把看到的提醒帶回真實生活。',finish:'展開紫微命盤',type:'hold'},
    meihua: {name:'梅花易數',world:'moon-garden',room:'梅影月庭',en:'A MOMENT IN BLOOM',title:'此時此刻，值得停留。',intro:'庭前花影、水面月光。先把心事說清楚，再看看此刻的變化。',focus:'留住，這一刻的心念。',guide:'按住梅影，讓心裡的問題慢慢沉澱。',action:'花影落定，準備觀察變化',ready:'帶著問題，走進卦象。',outro:'接下來呈現本次起卦所得的本卦、互卦與變卦，從變化裡整理下一步。',finish:'展開本次卦象',type:'hold'},
    oracle: {name:'靜月靈籤',world:'moon-garden',room:'月光祈願庭',en:'A QUIET PLACE FOR YOUR WISH',title:'有些心事，終於能好好說。',intro:'在這裡，不必急著得到答案。先安靜一會，將此刻所求之事放在心上。',focus:'把心事，安放在月光裡。',guide:'按住祈願之光，在心中默念你所求的那件事。',action:'讓心念，隨光慢慢安定',ready:'心已安定，開始問事。',outro:'接下來進入擲筊與求籤流程。慢慢來，一次專注一件事。',finish:'準備擲筊',type:'hold'}
  };
  function esc(value){return String(value == null ? '' : value).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function safeImage(path){return /^(?:assets\/|img\/|tarot_img\/|ln-cards\/)[\w./%-]+$/i.test(String(path||'')) ? path : '';}
  function fallbackQuestion(kind){
    var ids={bazi:['bzx-q'],ziwei:['zw-q'],meihua:['mhx-q'],oracle:['orc-q-input']};
    var list=ids[kind]||[];
    for(var i=0;i<list.length;i++){var el=root.document.getElementById(list[i]);if(el&&el.value)return el.value;}
    return '';
  }
  function fan(){
    var h='<div class="jr-fan" aria-hidden="true">';
    for(var i=0;i<9;i++)h+='<span class="jr-card" style="--i:'+i+';--offset:'+(i-4)+'"><img src="assets/ui/tarot-back-moon-gold.jpg" alt="" draggable="false"></span>';
    return h+'</div>';
  }
  function play(kind,options){
    options=options||{};
    if(!themes[kind])throw new Error('Unknown ceremony: '+kind);
    if(active)return active.handle;
    var cfg=themes[kind],doc=root.document,previous=doc.activeElement;
    var reduced=!!(root.matchMedia&&root.matchMedia('(prefers-reduced-motion: reduce)').matches);
    var phase=0,settled=false,timers=[],frame=0,holding=false,holdAt=0,lit=0,audio=null,audioOn=false,stage=null;
    var story=null;
    var gesture=null,travel=0,turn=0,intent='clarity';
    var bodyOverflow=doc.body.style.overflow,inertSiblings=[],fallback=false;
    // Snapshot supplied cards; do not mutate the canonical draw or generate a replacement.
    var cardPage=0,autoReveal=false,autoTimer=null;
    var cards=(options.cards||[]).map(function(c){return {id:c.id,name:String(c.name||''),image:safeImage(c.image),isUp:c.isUp!==false};});
    var dealing=kind==='tarot'&&options.variant==='deal';
    var mode=(dealing&&cards.length)||kind==='lenormand'&&cards.length?'cards':cfg.type==='cards'?'hold':cfg.type;
    var question=String(options.question!=null?options.question:fallbackQuestion(kind)).trim().slice(0,500);
    var dialog=doc.createElement('dialog');dialog.className='jr-dialog';
    var actors={tarot:['lunar-guide','月見','塔羅引路人'],lenormand:['lunar-guide','月見','牌語引路人'],bazi:['star-guide','星衡','四柱引路人'],compat:['star-guide','星衡','關係引路人'],ziwei:['star-guide','星衡','星圖引路人'],meihua:['blossom-guide','清和','觀象引路人'],oracle:['blossom-guide','清和','靜心引路人']};
    actors.ootk=['lunar-guide','月見','開鑰引路人'];
    var actor=actors[kind],gestureCopy={ootk:'左右拖曳切牌，或按住牌組',tarot:'左右拖曳切牌，或按住牌組',ziwei:'沿星軌轉動手指，或按住星儀',meihua:'左右拂過光線，或按住凝心',oracle:'上下輕晃籤筒，或按住祈願'};
    dialog.setAttribute('data-ritual',kind);dialog.setAttribute('data-world',cfg.world);dialog.setAttribute('data-mode',mode);
    dialog.setAttribute('data-motion',reduced?'still':'full');dialog.setAttribute('aria-labelledby','jr-title');dialog.setAttribute('aria-describedby','jr-note');
    var interaction='';
    if(mode==='cards'){
      interaction='<div class="jr-reveal-row">'+cards.map(function(c,i){return '<button type="button" class="jr-reveal" data-card-index="'+i+'" aria-label="揭開第 '+(i+1)+' 張牌" aria-pressed="false"><span class="jr-flip"><span class="jr-back"><img src="assets/ui/tarot-back-moon-gold.jpg" alt="" draggable="false"></span><span class="jr-front"></span></span><span class="jr-card-label">'+String(i+1).padStart(2,'0')+' · 輕觸揭牌</span></button>';}).join('')+'</div>';
    }else if(mode==='seals'){
      interaction='<div class="jr-seals">'+cfg.seals.map(function(label,i){return '<button type="button" class="jr-seal" data-seal-index="'+i+'" aria-pressed="false" aria-label="點亮'+label+'座標"><span>'+label+'</span><small>'+String(i+1).padStart(2,'0')+'</small></button>';}).join('')+'</div>';
    }else{
      interaction='<button type="button" class="jr-touch" aria-label="'+esc(gestureCopy[kind]||cfg.guide)+'">'+(kind==='tarot'||kind==='ootk'?fan():'<span class="jr-art at-art" data-art="'+kind+'" aria-hidden="true"></span>')+'<span class="jr-touch-label">'+esc(gestureCopy[kind]||'按住，讓光靠近')+'</span><span class="jr-touch-track"><i></i></span></button>';
    }
    var constellation='';
    if(kind==='ziwei')constellation='<div class="jr-stars" aria-hidden="true">'+['命宮','兄弟','夫妻','子女','財帛','疾厄','遷移','交友','官祿','田宅','福德','父母'].map(function(x,i){return '<span style="--i:'+i+';--angle:'+(i*30)+'deg">'+x+'</span>';}).join('')+'</div>';
    var portrait='<div class="jr-actor-fallback" aria-hidden="true">';
    for(var pi=0;pi<4;pi++)portrait+='<span class="jr-actor-pose" data-pose="'+pi+'" style="background-image:url(assets/ui/'+actor[0]+'.webp);background-position:'+(pi*100/3)+'% 0"></span>';
    portrait+='</div>';
    dialog.innerHTML='<div class="jr-shell">'+
      '<div class="jr-world" aria-hidden="true"><img class="jr-world-image" src="assets/ui/ritual-'+cfg.world+'.webp" alt=""><div class="jr-light"></div><div class="jr-vignette"></div><img class="jr-mist" src="img/oracle/oracle-smoke.png" alt=""><div class="jr-dust"></div><div class="jr-flash"></div></div>'+
      '<header class="jr-header"><button type="button" class="jr-cancel">← 返回</button><span>靜月之光<small>JINGYUE</small></span><div class="jr-preferences"><button type="button" class="jr-motion" aria-pressed="'+reduced+'">動態：'+(reduced?'靜態':'完整')+'</button><button type="button" class="jr-sound" aria-pressed="false">聲音：關</button></div></header>'+
      '<section class="jr-brief"><div class="jr-speaker"><span class="jr-speaker-name">'+actor[1]+'</span><span>'+actor[2]+'</span></div><p class="jr-eyebrow">'+cfg.room+' · <span class="jr-chapter">入境</span></p>'+
      '<div class="jr-text" aria-live="polite" aria-atomic="true"><h2 id="jr-title">'+cfg.title+'</h2><p id="jr-note">'+cfg.intro+'</p></div>'+
      '<div class="jr-intent" role="group" aria-label="這次想如何探索"><button type="button" data-intent="clarity" aria-pressed="true">看清現況</button><button type="button" data-intent="action" aria-pressed="false">找到下一步</button></div>'+
      (question?'<details class="jr-question"><summary>回看我的問題</summary><p>'+esc(question)+'</p></details>':'')+'</section>'+
      '<div class="jr-stage">'+portrait+'</div><div class="jr-playfield">'+constellation+interaction+'</div>'+
      '<section class="jr-dialogue">'+(mode==='cards'?'<div class="jr-reveal-controls" role="group" aria-label="揭牌方式"><button type="button" class="jr-auto-reveal" aria-pressed="false">自動依序翻牌</button><button type="button" class="jr-reveal-all">全部揭開</button></div>':'')+'<div class="jr-response" hidden><div><span class="jr-response-label">等待你的觸碰</span><span class="jr-response-value">0%</span></div><div class="jr-response-track" role="progressbar" aria-label="儀式互動進度" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><i></i></div></div><p class="jr-hint" role="status"></p><button type="button" class="jr-next">走進'+cfg.room+' <span aria-hidden="true">→</span></button>'+
      '<footer class="jr-footer"><ol aria-label="儀式進度"><li class="is-current">相遇</li><li>共鳴</li><li>啟程</li></ol><button type="button" class="jr-skip">跳過儀式 →</button></footer></section></div>';
    var resolve,finished=new Promise(function(r){resolve=r;});
    var handle={finished:finished,cancel:function(){finish(false,false);},skip:function(){finish(true,false);}};
    var entry={kind:kind,handle:handle};
    var next=dialog.querySelector('.jr-next'),touch=dialog.querySelector('.jr-touch'),hint=dialog.querySelector('.jr-hint'),sound=dialog.querySelector('.jr-sound');
    // Presentation must never own the reading lock. A failed GPU scene keeps
    // the illustrated ritual and its real controls, without completing a draw.
    function warn(label,error){if(root.console&&root.console.warn)root.console.warn('[JYRitual '+label+']',error);}
    function releaseStage(){var current=stage;stage=null;if(current&&typeof current.dispose==='function'){try{current.dispose();}catch(error){warn('dispose',error);}}}
    function fallbackStage(error){
      warn('scene',error);releaseStage();dialog.setAttribute('data-renderer','fallback');
      var host=dialog.querySelector('.jr-stage');
      if(host){host.classList.remove('jr-gpu-ready','jr-actor-ready');host.setAttribute('data-renderer','fallback');host.querySelectorAll('canvas').forEach(function(canvas){canvas.remove();});}
    }
    function stageCall(method,value){if(!stage||typeof stage[method]!=='function')return;try{stage[method](value);}catch(error){fallbackStage(error);}}
    function suspendHome(value){if(root.JYCinemaUI&&typeof root.JYCinemaUI.suspendHome==='function'){try{root.JYCinemaUI.suspendHome(value);}catch(error){warn('home',error);}}}
    function focus(el){if(!el||typeof el.focus!=='function')return;try{el.focus({preventScroll:true});}catch(error){try{el.focus();}catch(ignored){}}}
    function schedule(fn,ms){var id=root.setTimeout(function(){if(!settled)fn();},ms);timers.push(id);return id;}
    function showProgress(value,label){
      var percentage=Math.round(Math.max(0,Math.min(1,value))*100),response=dialog.querySelector('.jr-response');
      response.style.setProperty('--response',percentage+'%');response.querySelector('.jr-response-value').textContent=percentage+'%';
      response.querySelector('[role="progressbar"]').setAttribute('aria-valuenow',String(percentage));
      if(label)response.querySelector('.jr-response-label').textContent=label;
    }
    function stopHold(){holding=false;gesture=null;travel=0;if(frame)root.cancelAnimationFrame(frame);frame=0;if(phase===1&&mode==='hold'){dialog.style.setProperty('--hold','0');dialog.style.setProperty('--gesture-x','0px');dialog.style.setProperty('--gesture-y','0px');dialog.style.setProperty('--gesture-tilt','0deg');stageCall('setPower',0);showProgress(0,'再觸碰一次，或用下方按鈕繼續');}dialog.classList.remove('is-holding');}
    function disposeAudio(){if(!audio)return;var ctx=audio;audio=null;audioOn=false;try{var p=ctx.close();if(p&&p.catch)p.catch(function(){});}catch(e){}}
    function bell(){if(!audioOn||!audio||doc.hidden)return;try{var t=audio.currentTime,g=audio.createGain(),o=audio.createOscillator();o.type='sine';o.frequency.setValueAtTime(kind==='lenormand'?659.25:523.25,t);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.035,t+.02);g.gain.exponentialRampToValueAtTime(.0001,t+1.5);o.connect(g);g.connect(audio.destination);o.start(t);o.stop(t+1.6);}catch(e){}}
    function toggleSound(){
      if(audioOn){disposeAudio();sound.textContent='聲音：關';sound.setAttribute('aria-pressed','false');return;}
      var Audio=root.AudioContext||root.webkitAudioContext;
      if(!Audio){sound.textContent='此裝置無音效';sound.disabled=true;return;}
      try{
        audio=new Audio();audioOn=true;
        var context=audio,g=context.createGain();g.gain.value=.015;g.connect(context.destination);
        [130.81,196,261.63].forEach(function(f){var o=context.createOscillator();o.type='sine';o.frequency.value=f;o.connect(g);o.start();});
        var resume=context.resume();if(resume&&resume.catch)resume.catch(function(){if(audio===context){disposeAudio();sound.textContent='聲音：關';sound.setAttribute('aria-pressed','false');}});
        sound.textContent='聲音：開';sound.setAttribute('aria-pressed','true');bell();
      }catch(e){disposeAudio();sound.textContent='此裝置無音效';sound.disabled=true;}
    }
    function cleanup(){
      stopHold();pauseReveal();timers.forEach(function(id){root.clearTimeout(id);});disposeAudio();
      if(story){story.dispose();story=null;}releaseStage();
      root.removeEventListener('pagehide',onPageHide);root.removeEventListener('popstate',onPopState);doc.removeEventListener('visibilitychange',onVisibility);
      dialog.removeEventListener('close',onNativeClose);dialog.removeEventListener('keydown',onKeyDown);
      try{if(dialog.open)dialog.close();}catch(e){}
      inertSiblings.forEach(function(item){item.node.inert=item.value;});dialog.remove();doc.body.style.overflow=bodyOverflow;if(active===entry)active=null;
      suspendHome(false);
    }
    function finish(completed,userCancel){
      if(settled)return;settled=true;cleanup();
      if(previous&&previous.isConnected)focus(previous);resolve(completed);
      if(completed&&typeof options.onComplete==='function')options.onComplete();else if(!completed&&userCancel&&typeof options.onCancel==='function')options.onCancel();
    }
    function onPageHide(){finish(false,false);}
    function onPopState(){finish(false,true);}
    function onNativeClose(){finish(false,true);}
    function onKeyDown(event){
      if(event.key==='Escape'){event.preventDefault();finish(false,true);return;}
      if(!fallback||event.key!=='Tab')return;
      var buttons=Array.prototype.filter.call(dialog.querySelectorAll('button,summary'),function(el){return !el.disabled&&!el.hidden&&!(phase!==1&&el.closest('.jr-playfield'));});
      var first=buttons[0],last=buttons[buttons.length-1];
      if(event.shiftKey&&doc.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&doc.activeElement===last){event.preventDefault();first.focus();}
    }
    function onVisibility(){
      stopHold();if(doc.hidden)pauseReveal();dialog.classList.toggle('is-paused',!!doc.hidden);
      if(audio){try{var p=doc.hidden?audio.suspend():audio.resume();if(p&&p.catch)p.catch(function(){});}catch(e){}}
      // No elapsed-time completion: returning to a tab must never bypass an unanswered interaction.
    }
    function setCopy(title,note){dialog.querySelector('#jr-title').textContent=title;dialog.querySelector('#jr-note').textContent=note;}
    function showCardPage(){
      dialog.querySelectorAll('.jr-reveal').forEach(function(btn,i){btn.hidden=Math.floor(i/3)!==cardPage;btn.disabled=phase!==1||btn.getAttribute('aria-pressed')==='true'||btn.hidden;});
      hint.textContent='第 '+(cardPage*3+1)+'–'+Math.min(cardPage*3+3,cards.length)+' 張 · 共 '+cards.length+' 張 · 可切換自動翻牌。';
    }
    function updatePhase(value){
      if(settled)return;phase=value;dialog.setAttribute('data-phase',String(value));
      dialog.querySelector('.jr-response').hidden=value===0;
      if(value===1)showProgress(lit/(mode==='cards'?cards.length:mode==='seals'?cfg.seals.length:1),mode==='cards'?'逐張輕觸，或選擇自動翻牌':mode==='seals'?'輕觸座標，點亮本次探索':'拖曳或按住，下方光帶會回應你');
      if(value>=2)showProgress(1,value===2?'已接住你的心念':'準備好了，由你決定何時繼續');
      stageCall('setPhase',value);
      if(story)story.setPhase(value,function(){if(phase===2)updatePhase(3);});
      var revealControls=dialog.querySelector('.jr-reveal-controls');if(revealControls)revealControls.hidden=value!==1;
      var choices=dialog.querySelector('.jr-intent');if(choices)choices.hidden=value!==0;
      dialog.querySelector('.jr-chapter').textContent=value===0?'入境':value===1?'凝心':'啟程';
      dialog.querySelectorAll('.jr-footer li').forEach(function(li,i){li.classList.toggle('is-current',i===Math.min(value,2));li.classList.toggle('is-done',i<Math.min(value,2));});
      dialog.querySelectorAll('.jr-playfield button').forEach(function(btn){btn.disabled=value!==1||btn.getAttribute('aria-pressed')==='true';});
      if(value===1){
        setCopy(dealing?'你選擇的牌，即將相遇。':cfg.focus,mode==='cards'?'你可以親手翻牌，也可以讓牌依序展開，或一次揭曉。':mode==='hold'?(gestureCopy[kind]||cfg.guide)+'。'+({tarot:'牌組隨手勢聚攏與展開。',ziwei:'星軌隨手勢旋轉，逐圈點亮。',meihua:'光環隨指尖舒展，讓心緒慢慢安定。',oracle:'籤筒隨手勢輕晃，準備進入擲筊。'}[kind]||'依自己的節奏繼續。'):cfg.guide);
        if(question)dialog.querySelector('.jr-question').open=false;
        hint.textContent=mode==='cards'?'按照你的節奏，親手揭開本次的牌。':mode==='seals'?'已點亮 0 / '+cfg.seals.length:'長按約 1.6 秒，或使用下方按鈕。';
        if(mode==='cards'){showCardPage();dialog.querySelector('.jr-skip').textContent='直接展開牌陣 →';}
        next.disabled=mode!=='hold';next.textContent=mode==='hold'?'直接啟動儀式 →':mode==='cards'?'等待你揭開牌面':'等待你點亮座標';
        if(mode==='hold')focus(next);else focus(dialog.querySelector(mode==='cards'?'.jr-reveal':'.jr-seal'));
      }else if(value===2){
        setCopy(cfg.action,'');hint.textContent='';next.disabled=true;next.textContent='光正在展開…';if(question)dialog.querySelector('.jr-question').open=false;
      }else if(value===3){
        setCopy(dealing?'你的牌陣，已在眼前。':cfg.ready,dealing?'保留你已親手選出的牌，接著查看本次完整牌陣與牌位。':cfg.outro+(intent==='action'?' 讀完後，選一件自己做得到的小事開始。':''));
        hint.textContent=options.spreadName?String(options.spreadName):'';next.disabled=false;next.textContent=(options.finishLabel||(dealing?'查看本次牌陣':cfg.finish))+' →';focus(next);
      }
    }
    function awaken(){if(settled||phase!==1)return;stopHold();dialog.style.setProperty('--hold','1');updatePhase(2);bell();if(!story)schedule(function(){if(phase===2)updatePhase(3);},reduced?0:2700);}
    // Commit the threshold in the input event itself. A quick swipe followed by
    // release must not lose completion while waiting for the next animation frame.
    function applyHoldProgress(){
      if(!holding||settled||phase!==1||doc.hidden)return;
      var progress=Math.min(1,Math.max(travel/180,(Date.now()-holdAt)/1600));
      dialog.style.setProperty('--hold',String(progress));showProgress(progress,'已感應你的觸碰');stageCall('setPower',progress);
      if(progress>=1)awaken();
    }
    function holdTick(){if(!holding||settled||phase!==1)return;applyHoldProgress();if(holding&&phase===1)frame=root.requestAnimationFrame(holdTick);}
    if(touch){
      // The surface owns this gesture. Pointer capture keeps a drag alive
      // outside the fan; CSS touch-action prevents native pan from cancelling it.
      touch.onpointerdown=function(event){
        if(phase!==1||settled||holding||event.isPrimary===false||event.button>0)return;
        if(event.cancelable)event.preventDefault();
        holding=true;holdAt=Date.now();travel=0;turn=0;
        gesture={x:event.clientX||0,y:event.clientY||0,startX:event.clientX||0,startY:event.clientY||0,id:event.pointerId};
        dialog.classList.add('is-holding');
        showProgress(0,'已感應你的觸碰');
        try{touch.setPointerCapture(event.pointerId);}catch(e){}
        frame=root.requestAnimationFrame(holdTick);
      };
      touch.onpointermove=function(event){
        if(!holding||!gesture||phase!==1||event.isPrimary===false||event.pointerId!==gesture.id)return;
        if(event.cancelable)event.preventDefault();
        var x=event.clientX||0,y=event.clientY||0,dx=x-gesture.x,dy=y-gesture.y;
        travel+=kind==='oracle'?Math.abs(dy):kind==='ziwei'?Math.hypot(dx,dy):Math.abs(dx);
        turn+=(kind==='oracle'?dy:dx)/90;
        gesture.x=x;gesture.y=y;
        // Same immediate feedback with and without a GPU scene.
        var offset=Math.max(-65,Math.min(65,x-gesture.startX));
        dialog.style.setProperty('--gesture-x',offset+'px');
        dialog.style.setProperty('--gesture-y',(kind==='oracle'?Math.max(-35,Math.min(35,y-gesture.startY)):0)+'px');
        dialog.style.setProperty('--gesture-tilt',(offset/7)+'deg');
        stageCall('setTurn',turn);
        applyHoldProgress();
      };
      touch.onpointerup=touch.onpointercancel=touch.onlostpointercapture=function(event){
        if(gesture&&event.pointerId!==undefined&&event.pointerId!==gesture.id)return;
        if(event.type==='pointerup')applyHoldProgress();
        stopHold();
      };
      touch.ondragstart=function(event){event.preventDefault();};
      touch.onclick=function(event){if(event.detail===0)awaken();};
    }
    dialog.querySelectorAll('.jr-seal').forEach(function(btn,i){btn.onclick=function(){
      if(phase!==1||settled||btn.getAttribute('aria-pressed')==='true')return;
      if(kind==='bazi'&&i!==lit){hint.textContent='先點亮「'+cfg.seals[lit]+'」，再沿著時間往前。';return;}
      btn.setAttribute('aria-pressed','true');btn.disabled=true;if(options.sealValues&&options.sealValues[i]){btn.querySelector('small').textContent=String(options.sealValues[i]);}lit++;dialog.style.setProperty('--lit',String(lit));hint.textContent='已點亮 '+lit+' / '+cfg.seals.length;bell();
      stageCall('setLit',lit);
      showProgress(lit/cfg.seals.length,'已點亮 '+lit+' / '+cfg.seals.length+' 個座標');
      if(lit===cfg.seals.length)awaken();else{var remaining=Array.prototype.find.call(dialog.querySelectorAll('.jr-seal'),function(x){return !x.disabled;});if(remaining)remaining.focus({preventScroll:true});}
    };});
    function pauseReveal(){
      autoReveal=false;if(autoTimer!==null)root.clearTimeout(autoTimer);autoTimer=null;
      if(phase===1&&mode==='cards'&&lit<cards.length){var current=Array.from(dialog.querySelectorAll('.jr-reveal')).filter(function(x){return !x.hidden;});var completePage=current.length&&current.every(function(x){return x.getAttribute('aria-pressed')==='true';});next.disabled=!completePage;next.textContent=completePage?'下一組牌 →':'等待你揭開牌面';}
      var b=dialog.querySelector('.jr-auto-reveal');if(b){b.setAttribute('aria-pressed','false');b.textContent=lit?'繼續自動翻牌':'自動依序翻牌';}
    }
    function revealCard(i,all){
      var btn=dialog.querySelectorAll('.jr-reveal')[i];
      if(!btn||phase!==1||settled||!all&&(btn.hidden||btn.disabled)||btn.getAttribute('aria-pressed')==='true')return false;
      var c=cards[i],front=btn.querySelector('.jr-front');
      // Faces are inserted only after a deliberate manual/auto/all reveal action.
      if(c.image){var img=doc.createElement('img');img.src=c.image;img.alt=c.name;img.className=c.isUp?'':'is-reversed';front.appendChild(img);img.onerror=function(){img.remove();front.textContent=c.name;};}else front.textContent=c.name;
      btn.setAttribute('aria-pressed','true');btn.setAttribute('aria-label','第 '+(i+1)+' 張：'+c.name+(kind==='tarot'?(c.isUp?'，正位':'，逆位'):''));btn.disabled=true;btn.querySelector('.jr-card-label').textContent=c.name;lit++;
      if(!all)bell();stageCall('setLit',lit);stageCall('setPower',lit/cards.length);
      showProgress(lit/cards.length,'已揭開 '+lit+' / '+cards.length+' 張牌');hint.textContent='已揭開 '+lit+' / '+cards.length+' 張';
      if(lit===cards.length){pauseReveal();schedule(awaken,reduced?0:900);}
      else if(!autoReveal&&!all){
        var remaining=Array.prototype.find.call(dialog.querySelectorAll('.jr-reveal'),function(x){return !x.disabled&&!x.hidden;});
        if(remaining)focus(remaining);else{next.disabled=false;next.textContent='下一組牌 →';focus(next);}
      }
      return true;
    }
    function advanceReveal(){
      autoTimer=null;if(!autoReveal||settled||phase!==1||doc.hidden)return;
      var buttons=Array.from(dialog.querySelectorAll('.jr-reveal')),index=buttons.findIndex(function(b){return b.getAttribute('aria-pressed')!=='true';});
      if(index<0){pauseReveal();return;}
      cardPage=Math.floor(index/3);showCardPage();next.disabled=true;next.textContent='牌正在依序展開…';
      revealCard(index,false);
      if(autoReveal)autoTimer=schedule(advanceReveal,reduced?80:(index%3===2?1100:680));
    }
    dialog.querySelectorAll('.jr-reveal').forEach(function(btn,i){btn.onclick=function(){pauseReveal();revealCard(i,false);};});
    var autoButton=dialog.querySelector('.jr-auto-reveal'),allButton=dialog.querySelector('.jr-reveal-all');
    if(autoButton)autoButton.onclick=function(){
      if(settled||phase!==1)return;
      if(autoReveal){pauseReveal();showCardPage();hint.textContent='已暫停，牌與順序保留。';return;}
      autoReveal=true;autoButton.setAttribute('aria-pressed','true');autoButton.textContent='暫停自動翻牌';advanceReveal();
    };
    if(allButton)allButton.onclick=function(){
      if(settled||phase!==1)return;pauseReveal();bell();
      cards.forEach(function(c,i){revealCard(i,true);});
      hint.textContent='本次 '+cards.length+' 張牌已全部揭開，牌序保持不變。';
    };
    next.onclick=function(){if(settled||next.disabled)return;if(phase===0)updatePhase(1);else if(phase===1&&mode==='hold')awaken();else if(phase===1&&mode==='cards'&&lit<cards.length){cardPage++;showCardPage();next.disabled=true;next.textContent='等待你揭開牌面';var card=dialog.querySelector('.jr-reveal:not([hidden])');focus(card);}else if(phase===3)finish(true,false);};
    dialog.querySelectorAll('[data-intent]').forEach(function(btn){btn.onclick=function(){if(phase!==0)return;intent=btn.getAttribute('data-intent');dialog.querySelectorAll('[data-intent]').forEach(function(b){b.setAttribute('aria-pressed',String(b===btn));});setCopy(intent==='action'?'好，我們一起找一個起點。':cfg.title,intent==='action'?'帶著你真正能改變的部分進入探索。解讀之後，我們再把提醒整理成可以採取的行動。':cfg.intro);};});
    dialog.querySelector('.jr-motion').onclick=function(){
      if(settled)return;stopHold();reduced=!reduced;dialog.setAttribute('data-motion',reduced?'still':'full');
      if(story)story.setReduced(reduced);
      this.textContent='動態：'+(reduced?'靜態':'完整');this.setAttribute('aria-pressed',String(reduced));
      releaseStage();
      if(root.JYCinema&&typeof root.JYCinema.mount==='function'){try{stage=root.JYCinema.mount(dialog.querySelector('.jr-stage'),kind,{mode:mode,reduced:reduced,story:!!root.JYStory,sealValues:options.sealValues||[]});stageCall('setPhase',phase);stageCall('setLit',lit);stageCall('setTurn',turn);stageCall('setPower',phase>=2?1:mode==='hold'?0:lit/(mode==='cards'?cards.length:cfg.seals.length));}catch(error){fallbackStage(error);}}
      if(reduced&&phase===2)updatePhase(3);
    };
    sound.onclick=toggleSound;dialog.querySelector('.jr-cancel').onclick=function(){finish(false,true);};dialog.querySelector('.jr-skip').onclick=function(){finish(true,false);};
    dialog.addEventListener('cancel',function(event){event.preventDefault();finish(false,true);});dialog.addEventListener('close',onNativeClose);dialog.addEventListener('keydown',onKeyDown);
    // Acquire the lock only when the detached dialog is ready. Roll back every
    // mounted resource on startup failure so the same question can be retried.
    try{
    active=entry;doc.body.appendChild(dialog);doc.body.style.overflow='hidden';
    suspendHome(true);
    try{if(typeof dialog.showModal!=='function')throw new Error('Native dialog unavailable');dialog.showModal();}catch(e){fallback=true;dialog.setAttribute('open','');dialog.setAttribute('role','dialog');dialog.setAttribute('aria-modal','true');Array.prototype.forEach.call(doc.body.children,function(node){if(node!==dialog){inertSiblings.push({node:node,value:node.inert});node.inert=true;}});}
    if(root.JYCinema&&typeof root.JYCinema.mount==='function'){try{stage=root.JYCinema.mount(dialog.querySelector('.jr-stage'),kind,{mode:mode,reduced:reduced,story:!!root.JYStory,sealValues:options.sealValues||[]});}catch(e){fallbackStage(e);}}
    if(root.JYStory&&typeof root.JYStory.mount==='function'){try{story=root.JYStory.mount(dialog,kind,{reduced:reduced,onShot:function(shot){stageCall('setShot',shot);},onFilm:function(covered){stageCall('setCovered',covered);}});if(story)next.textContent=story.invitation+' →';}catch(error){warn('story',error);}}
    updatePhase(0);if(mode==='cards')showCardPage();focus(next);if(dealing)updatePhase(1);
    root.addEventListener('pagehide',onPageHide);root.addEventListener('popstate',onPopState);doc.addEventListener('visibilitychange',onVisibility);
    return handle;
    }catch(error){finish(false,false);throw error;}
  }
  root.JYRitual={play:play,cancel:function(kind){if(active&&(!kind||active.kind===kind))active.handle.cancel();},isActive:function(kind){return !!active&&(!kind||active.kind===kind);}};
})(window);
