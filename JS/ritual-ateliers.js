/* 靜月之光 · Ceremony stages. Motion is presentation, never a second draw. */
(function (root) {
  'use strict';
  var active = null;
  var themes = {
    tarot: { name:'塔羅', eyebrow:'THE LUNAR DECK', steps:['收攏心緒','月下洗牌','為你展牌'], note:'在心裡，留住最想問的那件事。', duration:4200 },
    lenormand: { name:'雷諾曼', eyebrow:'THE EMERALD COMPASS', steps:['讓問題沉澱','牌與牌相遇','線索即將展開'], note:'一張牌是一個詞，讓牌組連成你的故事。', duration:3900 },
    bazi: { name:'八字命理', eyebrow:'THE FOUR PILLARS', steps:['回到出生時刻','年月日時相會','四柱徐徐展開'], note:'留一段安靜的時間，認識自己的節奏。', duration:4300 },
    compat: { name:'八字合盤', eyebrow:'TWO WORLDS, ONE ENCOUNTER', steps:['看見彼此','兩份生命交會','展開關係的脈絡'], note:'帶著理解，看看相似之處與需要磨合的地方。', duration:4500 },
    ziwei: { name:'紫微斗數', eyebrow:'THE CELESTIAL OBSERVATORY', steps:['星軌緩緩轉動','十二宮點亮','命盤即將展開'], note:'從不同宮位，看見人生的不同面向。', duration:4500 },
    meihua: { name:'梅花易數', eyebrow:'THE MOMENT IN BLOOM', steps:['凝神取象','陰陽相交','卦象即將展開'], note:'把此刻的問題，放進變化之中。', duration:4100 },
    oracle: { name:'靜月靈籤', eyebrow:'A QUIET MOMENT OF PRAYER', steps:['靜心默念','將心事安放','準備擲筊'], note:'願你在這一刻，找到安定的力量。', duration:4200 }
  };
  function escapeText(value) { return String(value == null ? '' : value).replace(/[&<>"']/g, function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];}); }
  function cardFan(kind) {
    var h = '<div class="jr-fan" aria-hidden="true">';
    for (var i=0;i<9;i++) h += '<div class="jr-card" style="--i:'+i+';--x:'+((i-4)*24)+'px;--angle:'+((i-4)*10)+'deg"><img src="img/card-back.jpg" alt=""></div>';
    return h+'</div>';
  }
  function stage(kind) {
    var h='<div class="jr-scene" aria-hidden="true"><div class="jr-floor"></div><div class="jr-halo jr-halo-one"></div><div class="jr-halo jr-halo-two"></div><div class="jr-sweep"></div>';
    // The original commissioned object atlas is shared with the reading rooms.
    h+='<span class="jr-object at-art" data-art="'+kind+'"></span>';
    if (kind==='tarot' || kind==='lenormand') h+=cardFan(kind);
    if (kind==='bazi') {
      h+='<div class="jr-pillars">';
      ['年','月','日','時'].forEach(function(label,i){h+='<div class="jr-pillar" style="--i:'+i+'"><span>'+label+'</span><small>柱</small></div>';});
      h+='</div>';
    }
    if (kind==='compat') h+='<div class="jr-pair jr-pair-a"><span class="at-art" data-art="bazi"></span><b>甲方</b></div><div class="jr-pair jr-pair-b"><span class="at-art" data-art="bazi"></span><b>乙方</b></div><div class="jr-connection"></div>';
    if (kind==='ziwei') {
      h+='<div class="jr-constellation">';
      ['命宮','兄弟','夫妻','子女','財帛','疾厄','遷移','交友','官祿','田宅','福德','父母'].forEach(function(label,i){h+='<span style="--i:'+i+';--angle:'+(i*30)+'deg">'+label+'</span>';});
      h+='</div>';
    }
    if (kind==='meihua') {
      // Decorative alternating lines: never labelled as the user's drawn hexagram.
      h+='<div class="jr-yao">';
      for(var y=0;y<6;y++) h+='<div class="jr-line '+(y%2?'jr-broken':'')+'" style="--i:'+y+'"><i></i><i></i></div>';
      h+='</div>';
    }
    if (kind==='oracle') h+='<img class="jr-sanctuary" src="img/oracle/oracle-temple-bg.jpg" alt=""><div class="jr-incense jr-incense-a"></div><div class="jr-incense jr-incense-b"></div>';
    return h+'</div>';
  }
  function play(kind, options) {
    options=options||{};
    if(!themes[kind])throw new Error('Unknown ceremony: '+kind);
    // Repeated taps retain the same in-flight operation and cannot draw twice.
    if(active)return active.handle;
    var cfg=themes[kind], previous=root.document.activeElement, elapsed=0, started=Date.now(), timers=[], frame=0, settled=false;
    var reduced=!!(root.matchMedia&&root.matchMedia('(prefers-reduced-motion: reduce)').matches);
    var duration=reduced?180:cfg.duration;
    var dialog=root.document.createElement('dialog');
    dialog.className='jr-dialog';dialog.setAttribute('data-ritual',kind);dialog.setAttribute('aria-labelledby','jr-title');dialog.setAttribute('aria-describedby','jr-note');
    dialog.innerHTML='<div class="jr-shell"><div class="jr-grain"></div><header class="jr-header"><button type="button" class="jr-cancel">← 返回</button><span>靜月之光</span><button type="button" class="jr-skip">跳過動畫 →</button></header>'+stage(kind)+'<div class="jr-copy"><p class="jr-eyebrow">'+cfg.eyebrow+'</p><h2 id="jr-title">'+cfg.steps[0]+'</h2><p id="jr-note">'+cfg.note+'</p></div><footer class="jr-footer"><ol>'+cfg.steps.map(function(label,i){return '<li'+(i===0?' class="is-current"':'')+'><span>0'+(i+1)+'</span>'+label+'</li>';}).join('')+'</ol><div class="jr-track"><i></i></div><p>'+cfg.name+' · 靜月之光</p></footer></div>';
    var resolve;
    var finished=new Promise(function(r){resolve=r;});
    var handle={ finished:finished, cancel:function(){finish(false,false);}, skip:function(){finish(true,false);} };
    var bodyOverflow=root.document.body.style.overflow, inertSiblings=[], fallback=false;
    var entry={kind:kind,handle:handle};active=entry;
    function schedule(fn,ms){var id=root.setTimeout(fn,ms);timers.push(id);}
    function cleanup(){
      timers.forEach(function(id){root.clearTimeout(id);});
      if(frame)root.cancelAnimationFrame(frame);
      root.removeEventListener('pagehide',onPageHide);root.removeEventListener('popstate',onPopState);
      root.document.removeEventListener('visibilitychange',onVisibility);
      dialog.removeEventListener('close',onNativeClose);
      dialog.removeEventListener('keydown',onKeyDown);
      try{if(dialog.open)dialog.close();}catch(e){}
      inertSiblings.forEach(function(item){item.node.inert=item.value;});
      dialog.remove();root.document.body.style.overflow=bodyOverflow;
      if(active===entry)active=null;
    }
    function finish(completed, userCancel){
      if(settled)return;settled=true;
      cleanup();
      if(previous&&previous.isConnected&&typeof previous.focus==='function')previous.focus({preventScroll:true});
      resolve(completed);
      if(completed&&typeof options.onComplete==='function')options.onComplete();
      else if(!completed&&userCancel&&typeof options.onCancel==='function')options.onCancel();
    }
    function onPageHide(){finish(false,false);}
    function onPopState(){finish(false,true);}
    function onNativeClose(){finish(false,true);}
    function onKeyDown(event){
      if(!fallback)return;
      if(event.key==='Escape'){event.preventDefault();finish(false,true);return;}
      if(event.key==='Tab'){
        var first=dialog.querySelector('.jr-cancel'), last=dialog.querySelector('.jr-skip');
        if(event.shiftKey&&root.document.activeElement===first){event.preventDefault();last.focus();}
        else if(!event.shiftKey&&root.document.activeElement===last){event.preventDefault();first.focus();}
      }
    }
    function onVisibility(){if(!root.document.hidden && Date.now()-started>=duration)finish(true,false);}
    function updateStep(index){
      if(settled)return;
      dialog.setAttribute('data-phase',String(index));
      dialog.querySelector('#jr-title').textContent=cfg.steps[index];
      dialog.querySelectorAll('.jr-footer li').forEach(function(li,i){li.classList.toggle('is-current',i===index);li.classList.toggle('is-done',i<index);});
    }
    function tick(){
      if(settled)return;
      elapsed=Math.min(1,(Date.now()-started)/duration);
      dialog.style.setProperty('--progress',String(elapsed));
      frame=root.requestAnimationFrame(tick);
    }
    dialog.querySelector('.jr-cancel').onclick=function(){finish(false,true);};
    dialog.querySelector('.jr-skip').onclick=function(){finish(true,false);};
    dialog.addEventListener('cancel',function(event){event.preventDefault();finish(false,true);});
    dialog.addEventListener('close',onNativeClose);
    dialog.addEventListener('keydown',onKeyDown);
    root.document.body.appendChild(dialog);
    root.document.body.style.overflow='hidden';
    try{
      if(typeof dialog.showModal!=='function')throw new Error('Native dialog unavailable');
      dialog.showModal();
    }catch(error){
      fallback=true;
      dialog.setAttribute('open','');dialog.setAttribute('role','dialog');dialog.setAttribute('aria-modal','true');
      Array.prototype.forEach.call(root.document.body.children,function(node){
        if(node!==dialog){inertSiblings.push({node:node,value:node.inert});node.inert=true;}
      });
    }
    dialog.setAttribute('data-phase','0');
    dialog.querySelector('.jr-skip').focus({preventScroll:true});
    root.addEventListener('pagehide',onPageHide);root.addEventListener('popstate',onPopState);
    root.document.addEventListener('visibilitychange',onVisibility);
    schedule(function(){updateStep(1);},duration*.3);
    schedule(function(){updateStep(2);},duration*.68);
    schedule(function(){finish(true,false);},duration);
    if(!reduced)frame=root.requestAnimationFrame(tick);
    return handle;
  }
  root.JYRitual={
    play:play,
    cancel:function(kind){if(active&&(!kind||active.kind===kind))active.handle.cancel();},
    isActive:function(kind){return !!active&&(!kind||active.kind===kind);}
  };
})(window);
