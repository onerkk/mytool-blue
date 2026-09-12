/* 靜月之光 · Scene director. Presentation only; no reading data or RNG. */
(function(root){
  'use strict';
  var profiles={
    tarot:{place:'月下神殿',chapter:'月光，替你留了一個位置',invitation:'走近牌桌',beats:['先讓牌聚攏。','讓心裡的問題，穿過月光。','牌已展開，接下來由你選擇。']},
    lenormand:{place:'翡翠密庭',chapter:'每條線索，都有它的來處',invitation:'走進庭院',beats:['把眼前的牌放在一起。','看看它們如何前後相連。','帶著完整牌序，回到你的問題。']},
    bazi:{place:'時光長廊',chapter:'沿著時間，重新認識自己',invitation:'走入時間長廊',beats:['四個時間座標，緩緩升起。','每個座標，都要放回整張命盤看。','先核對出生資料，再理解自己的節奏。']},
    compat:{place:'雙星之境',chapter:'兩個世界，可以慢慢靠近',invitation:'走近兩束星光',beats:['先看見各自完整的自己。','讓差異被看見，也留出理解的空間。','接下來，一起尋找相處的方法。']},
    ziwei:{place:'紫微觀星殿',chapter:'星河展開，從自己開始',invitation:'走上觀星臺',beats:['讓星儀慢慢展開。','十二個面向，彼此照映。','真正的宮位與星曜，請在命盤中核對。']},
    meihua:{place:'梅影水庭',chapter:'停在此刻，看看事情如何變化',invitation:'走近花影',beats:['先把問題留在心上。','花開與水波，都在提醒我們觀察變化。','帶著本次起卦資料，整理下一步。']},
    oracle:{place:'月光祈願庭',chapter:'一件心事，一次好好說',invitation:'走入祈願庭',beats:['讓心事，慢慢安放下來。','不必急著替自己下結論。','接下來，一次專注一件事。']},
    ootk:{place:'秘鑰之門',chapter:'一扇門，一層新的觀察',invitation:'走近第一扇門',beats:['牌在聚攏，程序即將開始。','沿著本階段的牌序，逐步觀察。','每層都保留原始資料與停止條件。']}
  };
  // Add only finished, reviewed, locally hosted films here. Empty means no video
  // requests, no blank loading screens, and the real-time scene remains visible.
  var films=Object.freeze({});
  function mount(dialog,kind,options){
    options=options||{};
    var cfg=profiles[kind];if(!cfg)return null;
    var doc=root.document,dead=false,phase=-1,elapsed=0,last=0,timer=null,beat=-1;
    var reduced=!!options.reduced,ready=null,media=null,mediaEpoch=0;
    var shell=dialog.querySelector('.jr-shell'),brief=dialog.querySelector('.jr-brief');
    var dialogue=dialog.querySelector('.jr-dialogue');
    var heading=doc.createElement('div');heading.className='js-story-heading';
    var place=doc.createElement('span');place.className='js-story-place';place.textContent=cfg.place;
    var chapter=doc.createElement('p');chapter.textContent=cfg.chapter;
    heading.appendChild(place);heading.appendChild(chapter);shell.appendChild(heading);
    var caption=doc.createElement('p');caption.className='js-story-caption';caption.setAttribute('aria-live','polite');caption.hidden=true;shell.appendChild(caption);
    // Preserve the real buttons and their handlers; the dialogue stays next to
    // its main action. Nothing is cloned and the page is never scrolled here.
    if(brief&&dialogue)dialogue.prepend(brief);
    dialog.setAttribute('data-story','true');
    function cue(name,index){
      if(dead)return;dialog.setAttribute('data-shot',name);
      if(options.onShot)options.onShot({name:name,index:index||0});
    }
    function stopClock(){if(timer!==null)root.clearTimeout(timer);timer=null;last=0;}
    function stopMedia(){
      mediaEpoch++;if(!media)return;
      var old=media;media=null;old.oncanplay=old.onerror=old.onended=null;
      try{old.pause();old.removeAttribute('src');old.load();}catch(e){}
      old.remove();dialog.removeAttribute('data-film');
      if(options.onFilm)options.onFilm(false);
    }
    function playFilm(key){
      stopMedia();var src=films[kind]&&films[kind][key];
      if(reduced||doc.hidden||!/^assets\/cinema\/[\w/-]+\.mp4$/.test(src||''))return;
      var video=doc.createElement('video'),epoch=mediaEpoch;
      media=video;video.className='js-story-film';video.muted=true;video.playsInline=true;
      video.preload='auto';video.setAttribute('playsinline','');video.setAttribute('aria-hidden','true');video.src=src;
      var world=dialog.querySelector('.jr-world');world.appendChild(video);
      video.onerror=stopMedia;
      video.oncanplay=function(){
        if(dead||epoch!==mediaEpoch||doc.hidden)return;
        try{var result=video.play();if(result&&result.then)result.then(function(){if(!dead&&epoch===mediaEpoch&&!doc.hidden){dialog.setAttribute('data-film','playing');if(options.onFilm)options.onFilm(true);}}).catch(function(){if(epoch===mediaEpoch)stopMedia();});}catch(e){stopMedia();}
      };
      // Film never controls navigation. A denied autoplay or unfinished download
      // cannot trap the visitor or expose a result before their confirmation.
      video.onended=function(){if(epoch===mediaEpoch)dialog.setAttribute('data-film','ended');};
    }
    function complete(){
      stopClock();var fn=ready;ready=null;if(!dead&&fn)fn();
    }
    function tick(){
      timer=null;if(dead||phase!==2)return;
      if(doc.hidden){last=0;return;}
      var now=Date.now();if(last)elapsed+=Math.max(0,Math.min(100,now-last));last=now;
      var index=Math.min(2,Math.floor(elapsed/1800));
      if(index!==beat){beat=index;caption.textContent=cfg.beats[index];cue(['gather','orbit','settle'][index],index);}
      if(elapsed>=5400){complete();return;}timer=root.setTimeout(tick,50);
    }
    function visibility(){
      if(doc.hidden){stopClock();if(media)try{media.pause();}catch(e){}}
      else if(phase===2&&!reduced){last=0;tick();}
      // A paused film stays paused; it never resumes audible playback on return.
    }
    doc.addEventListener('visibilitychange',visibility);
    return {
      invitation:cfg.invitation,
      setPhase:function(value,onReady){
        if(dead)return;stopClock();ready=null;phase=value;elapsed=0;beat=-1;
        caption.hidden=value!==2;heading.hidden=value===2;
        if(value===2){ready=onReady||null;playFilm('response');if(reduced){cue('settle',2);timer=root.setTimeout(complete,0);}else tick();}
        else {caption.textContent='';cue(value===0?'arrival':value===1?'listen':'settle',value);playFilm(value===0?'entrance':value===1?'waiting':'closing');}
      },
      setReduced:function(value){reduced=!!value;stopMedia();if(reduced&&phase===2){cue('settle',2);complete();}},
      dispose:function(){if(dead)return;dead=true;stopClock();ready=null;stopMedia();doc.removeEventListener('visibilitychange',visibility);heading.remove();caption.remove();dialog.removeAttribute('data-story');}
    };
  }
  root.JYStory=Object.freeze({mount:mount,profiles:Object.freeze(profiles)});
})(window);
