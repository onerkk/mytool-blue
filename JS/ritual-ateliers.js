/* 靜月之光 · Moon Sanctum. Scenes accompany the existing reading; they never draw again. */
(function (root) {
  'use strict';
  var active = null;
  var themes = {
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
    for(var i=0;i<9;i++)h+='<span class="jr-card" style="--i:'+i+';--offset:'+(i-4)+'"><img src="img/card-back.jpg" alt=""></span>';
    return h+'</div>';
  }
  function play(kind,options){
    options=options||{};
    if(!themes[kind])throw new Error('Unknown ceremony: '+kind);
    if(active)return active.handle;
    var cfg=themes[kind],doc=root.document,previous=doc.activeElement;
    var reduced=!!(root.matchMedia&&root.matchMedia('(prefers-reduced-motion: reduce)').matches);
    var phase=0,settled=false,timers=[],frame=0,holding=false,holdAt=0,lit=0,audio=null,audioOn=false;
    var bodyOverflow=doc.body.style.overflow,inertSiblings=[],fallback=false;
    // Snapshot supplied cards; do not mutate the canonical draw or generate a replacement.
    var cards=(options.cards||[]).slice(0,3).map(function(c){return {id:c.id,name:String(c.name||''),image:safeImage(c.image),isUp:c.isUp!==false};});
    var dealing=kind==='tarot'&&options.variant==='deal';
    var mode=(dealing&&cards.length)||kind==='lenormand'&&cards.length?'cards':cfg.type==='cards'?'hold':cfg.type;
    var question=String(options.question!=null?options.question:fallbackQuestion(kind)).trim().slice(0,500);
    var dialog=doc.createElement('dialog');dialog.className='jr-dialog';
    dialog.setAttribute('data-ritual',kind);dialog.setAttribute('data-world',cfg.world);dialog.setAttribute('data-mode',mode);
    dialog.setAttribute('data-motion',reduced?'still':'full');dialog.setAttribute('aria-labelledby','jr-title');dialog.setAttribute('aria-describedby','jr-note');
    var interaction='';
    if(mode==='cards'){
      interaction='<div class="jr-reveal-row">'+cards.map(function(c,i){return '<button type="button" class="jr-reveal" data-card-index="'+i+'" aria-label="揭開第 '+(i+1)+' 張牌" aria-pressed="false"><span class="jr-flip"><span class="jr-back"><img src="img/card-back.jpg" alt=""></span><span class="jr-front"></span></span><span class="jr-card-label">'+String(i+1).padStart(2,'0')+' · 輕觸揭牌</span></button>';}).join('')+'</div>';
    }else if(mode==='seals'){
      interaction='<div class="jr-seals">'+cfg.seals.map(function(label,i){return '<button type="button" class="jr-seal" data-seal-index="'+i+'" aria-pressed="false" aria-label="點亮'+label+'座標"><span>'+label+'</span><small>'+String(i+1).padStart(2,'0')+'</small></button>';}).join('')+'</div>';
    }else{
      interaction='<button type="button" class="jr-touch" aria-label="'+esc(cfg.guide)+'">'+(kind==='tarot'?fan():'<span class="jr-art at-art" data-art="'+kind+'" aria-hidden="true"></span>')+'<span class="jr-touch-label">按住，讓光靠近</span><span class="jr-touch-track"><i></i></span></button>';
    }
    var constellation='';
    if(kind==='ziwei')constellation='<div class="jr-stars" aria-hidden="true">'+['命宮','兄弟','夫妻','子女','財帛','疾厄','遷移','交友','官祿','田宅','福德','父母'].map(function(x,i){return '<span style="--i:'+i+';--angle:'+(i*30)+'deg">'+x+'</span>';}).join('')+'</div>';
    dialog.innerHTML='<div class="jr-shell"><div class="jr-world" aria-hidden="true"><img class="jr-world-image" src="assets/ui/ritual-'+cfg.world+'.webp" alt=""><div class="jr-light"></div><div class="jr-vignette"></div><img class="jr-mist" src="img/oracle/oracle-smoke.png" alt=""><div class="jr-dust"></div><div class="jr-flash"></div></div><header class="jr-header"><button type="button" class="jr-cancel">← 返回</button><span>靜月之光<small>JINGYUE</small></span><button type="button" class="jr-sound" aria-pressed="false">聲音：關</button></header><div class="jr-place"><span>'+cfg.en+'</span><p>'+cfg.room+'</p></div><div class="jr-playfield">'+constellation+interaction+'</div><section class="jr-dialogue"><p class="jr-eyebrow">'+cfg.name+' · <span class="jr-chapter">入境</span></p><div class="jr-text" aria-live="polite" aria-atomic="true"><h2 id="jr-title">'+cfg.title+'</h2><p id="jr-note">'+cfg.intro+'</p></div>'+(question?'<details class="jr-question"><summary>此刻，我想問…</summary><p>'+esc(question)+'</p></details>':'')+'<p class="jr-hint" role="status"></p><button type="button" class="jr-next">走進'+cfg.room+' <span aria-hidden="true">→</span></button><footer class="jr-footer"><ol aria-label="儀式進度"><li class="is-current">入境</li><li>凝心</li><li>啟程</li></ol><button type="button" class="jr-skip">跳過儀式 →</button></footer></section></div>';
    var resolve,finished=new Promise(function(r){resolve=r;});
    var handle={finished:finished,cancel:function(){finish(false,false);},skip:function(){finish(true,false);}};
    var entry={kind:kind,handle:handle};active=entry;
    var next=dialog.querySelector('.jr-next'),touch=dialog.querySelector('.jr-touch'),hint=dialog.querySelector('.jr-hint'),sound=dialog.querySelector('.jr-sound');
    function schedule(fn,ms){var id=root.setTimeout(function(){if(!settled)fn();},ms);timers.push(id);return id;}
    function stopHold(){holding=false;if(frame)root.cancelAnimationFrame(frame);frame=0;if(phase===1)dialog.style.setProperty('--hold','0');dialog.classList.remove('is-holding');}
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
      stopHold();timers.forEach(function(id){root.clearTimeout(id);});disposeAudio();
      root.removeEventListener('pagehide',onPageHide);root.removeEventListener('popstate',onPopState);doc.removeEventListener('visibilitychange',onVisibility);
      dialog.removeEventListener('close',onNativeClose);dialog.removeEventListener('keydown',onKeyDown);
      try{if(dialog.open)dialog.close();}catch(e){}
      inertSiblings.forEach(function(item){item.node.inert=item.value;});dialog.remove();doc.body.style.overflow=bodyOverflow;if(active===entry)active=null;
    }
    function finish(completed,userCancel){
      if(settled)return;settled=true;cleanup();
      if(previous&&previous.isConnected&&typeof previous.focus==='function')previous.focus({preventScroll:true});resolve(completed);
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
      stopHold();dialog.classList.toggle('is-paused',!!doc.hidden);
      if(audio){try{var p=doc.hidden?audio.suspend():audio.resume();if(p&&p.catch)p.catch(function(){});}catch(e){}}
      // No elapsed-time completion: returning to a tab must never bypass an unanswered interaction.
    }
    function setCopy(title,note){dialog.querySelector('#jr-title').textContent=title;dialog.querySelector('#jr-note').textContent=note;}
    function updatePhase(value){
      if(settled)return;phase=value;dialog.setAttribute('data-phase',String(value));
      dialog.querySelector('.jr-chapter').textContent=value===0?'入境':value===1?'凝心':'啟程';
      dialog.querySelectorAll('.jr-footer li').forEach(function(li,i){li.classList.toggle('is-current',i===Math.min(value,2));li.classList.toggle('is-done',i<Math.min(value,2));});
      dialog.querySelectorAll('.jr-playfield button').forEach(function(btn){btn.disabled=value!==1||btn.getAttribute('aria-pressed')==='true';});
      if(value===1){
        setCopy(dealing?'你選擇的牌，即將相遇。':cfg.focus,mode==='cards'?'輕觸每一張牌，讓本次抽牌的線索逐一出現。':cfg.guide);
        if(question)dialog.querySelector('.jr-question').open=true;
        hint.textContent=mode==='cards'?((options.cards||[]).length>3?'先揭開本次牌陣前 3 張，其餘將在完整牌陣呈現。':'按照你的節奏，親手揭開本次的牌。'):mode==='seals'?'已點亮 0 / '+cfg.seals.length:'長按約 1.6 秒，或使用下方按鈕。';
        next.disabled=mode!=='hold';next.textContent=mode==='hold'?'點一下啟動 →':mode==='cards'?'等待你揭開牌面':'等待你點亮座標';
        if(mode==='hold')next.focus({preventScroll:true});else {var first=dialog.querySelector(mode==='cards'?'.jr-reveal':'.jr-seal');if(first)first.focus({preventScroll:true});}
      }else if(value===2){
        setCopy(cfg.action,'');hint.textContent='';next.disabled=true;next.textContent='光正在展開…';if(question)dialog.querySelector('.jr-question').open=false;
      }else if(value===3){
        setCopy(dealing?'你的牌陣，已在眼前。':cfg.ready,dealing?'保留你已親手選出的牌，接著查看本次完整牌陣與牌位。':cfg.outro);
        hint.textContent=options.spreadName?String(options.spreadName):'';next.disabled=false;next.textContent=(options.finishLabel||(dealing?'查看本次牌陣':cfg.finish))+' →';next.focus({preventScroll:true});
      }
    }
    function awaken(){if(settled||phase!==1)return;stopHold();dialog.style.setProperty('--hold','1');updatePhase(2);bell();schedule(function(){updatePhase(3);},reduced?0:1900);}
    function holdTick(){if(!holding||settled||phase!==1)return;var progress=Math.min(1,(Date.now()-holdAt)/1600);dialog.style.setProperty('--hold',String(progress));if(progress>=1){awaken();return;}frame=root.requestAnimationFrame(holdTick);}
    if(touch){
      touch.onpointerdown=function(event){if(phase!==1||settled||event.isPrimary===false||event.button>0)return;holding=true;holdAt=Date.now();dialog.classList.add('is-holding');try{touch.setPointerCapture(event.pointerId);}catch(e){}frame=root.requestAnimationFrame(holdTick);};
      touch.onpointerup=touch.onpointercancel=touch.onlostpointercapture=stopHold;
      touch.onclick=function(event){if(event.detail===0)awaken();};
    }
    dialog.querySelectorAll('.jr-seal').forEach(function(btn,i){btn.onclick=function(){
      if(phase!==1||settled||btn.getAttribute('aria-pressed')==='true')return;
      if(kind==='bazi'&&i!==lit){hint.textContent='先點亮「'+cfg.seals[lit]+'」，再沿著時間往前。';return;}
      btn.setAttribute('aria-pressed','true');btn.disabled=true;lit++;dialog.style.setProperty('--lit',String(lit));hint.textContent='已點亮 '+lit+' / '+cfg.seals.length;bell();
      if(lit===cfg.seals.length)awaken();else{var remaining=Array.prototype.find.call(dialog.querySelectorAll('.jr-seal'),function(x){return !x.disabled;});if(remaining)remaining.focus({preventScroll:true});}
    };});
    dialog.querySelectorAll('.jr-reveal').forEach(function(btn,i){btn.onclick=function(){
      if(phase!==1||settled||btn.getAttribute('aria-pressed')==='true')return;
      var c=cards[i],front=btn.querySelector('.jr-front');
      // Face and accessible card name are inserted only after a deliberate reveal.
      if(c.image){var img=doc.createElement('img');img.src=c.image;img.alt=c.name;img.className=c.isUp?'':'is-reversed';front.appendChild(img);img.onerror=function(){img.remove();front.textContent=c.name;};}else front.textContent=c.name;
      btn.setAttribute('aria-pressed','true');btn.setAttribute('aria-label','第 '+(i+1)+' 張：'+c.name+(kind==='tarot'?(c.isUp?'，正位':'，逆位'):''));btn.disabled=true;btn.querySelector('.jr-card-label').textContent=c.name;lit++;bell();
      hint.textContent='已揭開 '+lit+' / '+cards.length+((options.cards||[]).length>3?' · 其餘牌面在完整牌陣查看':'');
      if(lit===cards.length)schedule(awaken,reduced?0:900);else{var remaining=Array.prototype.find.call(dialog.querySelectorAll('.jr-reveal'),function(x){return !x.disabled;});if(remaining)remaining.focus({preventScroll:true});}
    };});
    next.onclick=function(){if(settled||next.disabled)return;if(phase===0)updatePhase(1);else if(phase===1&&mode==='hold')awaken();else if(phase===3)finish(true,false);};
    sound.onclick=toggleSound;dialog.querySelector('.jr-cancel').onclick=function(){finish(false,true);};dialog.querySelector('.jr-skip').onclick=function(){finish(true,false);};
    dialog.addEventListener('cancel',function(event){event.preventDefault();finish(false,true);});dialog.addEventListener('close',onNativeClose);dialog.addEventListener('keydown',onKeyDown);
    doc.body.appendChild(dialog);doc.body.style.overflow='hidden';
    try{if(typeof dialog.showModal!=='function')throw new Error('Native dialog unavailable');dialog.showModal();}catch(e){fallback=true;dialog.setAttribute('open','');dialog.setAttribute('role','dialog');dialog.setAttribute('aria-modal','true');Array.prototype.forEach.call(doc.body.children,function(node){if(node!==dialog){inertSiblings.push({node:node,value:node.inert});node.inert=true;}});}
    updatePhase(0);next.focus({preventScroll:true});if(dealing)updatePhase(1);
    root.addEventListener('pagehide',onPageHide);root.addEventListener('popstate',onPopState);doc.addEventListener('visibilitychange',onVisibility);
    return handle;
  }
  root.JYRitual={play:play,cancel:function(kind){if(active&&(!kind||active.kind===kind))active.handle.cancel();},isActive:function(kind){return !!active&&(!kind||active.kind===kind);}};
})(window);
