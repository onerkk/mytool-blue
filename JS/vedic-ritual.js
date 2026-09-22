/* Navagraha palace: one native chart, four spatial chapters, a cancellable lifecycle. */
(function(root){
  'use strict';
  let active=null,loading=null;
  const D=document,VERSION='20260914palace1',DURATION=14500;
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function loadScene(){
    if(root.JYVedicScene)return Promise.resolve();if(loading)return loading;
    loading=new Promise((resolve,reject)=>{const s=D.createElement('script');let timer=setTimeout(()=>reject(Error('scene timeout')),10000);s.src='JS/vedic-scene.js?v='+VERSION;s.onload=()=>{clearTimeout(timer);resolve();};s.onerror=()=>{clearTimeout(timer);reject(Error('scene unavailable'));};D.head.appendChild(s);}).catch(e=>{loading=null;throw e;});return loading;
  }
  function fallback(chart){return '<div class="vdr-fallback" aria-hidden="true"><div class="vdr-fallback-rings"><i></i><i></i><i></i><b>✧</b></div><div class="vdr-fallback-core"><span>JANMA KUNDALI</span><b>'+esc(chart.lagna?.signName||chart.planets.Moon.signName)+'</b><small>'+esc(chart.planets.Moon.nakshatra.name)+'</small></div><div class="vdr-fallback-plinth"></div></div>';}
  function play(chart,options={}){
    const foley=root.JYFoley,scope='vedic';if(foley){foley.prepare(['bowl','paper']);foley.unlock(['bowl','paper']);}
    if(active)active.cancel();
    let done,scene=null,frame=0,dead=false,elapsed=0,lastTime=performance.now(),lastPaint=0,stage=-1,started=false;
    const still=!!options.reduced,entry=D.activeElement,modal=D.createElement('dialog'),C=root.JYVedic,n=chart.planets.Moon.nakshatra;
    modal.id='vd-ceremony';modal.className='vd-modal vdr-modal';modal.dataset.motion=still?'still':'full';modal.setAttribute('aria-label','印度占星・九曜星殿');
    modal.innerHTML='<div class="vdr-room" aria-hidden="true"></div><div class="vdr-stage">'+fallback(chart)+'<div id="vdr-canvas" class="vdr-canvas" aria-label="立體星儀，可左右拖曳轉動"></div></div><div class="vdr-vignette" aria-hidden="true"></div><header class="vdr-header"><span class="vdr-mark"><b>✧</b><span>靜月之光<small>THE NAVAGRAHA PALACE</small></span></span>'+(foley?foley.button('paper',scope):'')+'<button type="button" data-vdr="cancel" class="vd-quiet">返回資料</button></header><div class="vdr-copy"><span class="vd-kicker" id="vdr-chapter">JYOTISHA · 九曜星殿</span><h2 id="vdr-title">星殿，即將為你開啟</h2><p id="vdr-caption">'+esc(chart.input.civil?.date||chart.input.utc.slice(0,10))+' · '+esc(chart.input.location||'自訂出生地')+'</p></div><div class="vdr-bottom"><div class="vdr-phases" aria-label="演出階段"><span>01 入殿</span><span>02 喚星</span><span>03 軌跡</span><span>04 命盤</span></div><div class="vdr-progress" aria-hidden="true"><i></i></div><p id="vdr-fact" aria-live="polite">正在點亮你的星殿…</p><button type="button" data-vdr="open" class="vd-primary" '+(still?'':'disabled')+'>展開我的印度命盤 <span>→</span></button><div class="vdr-foot-actions"><span class="vdr-drag-hint">↔ 輕觸星儀，左右轉動</span><button type="button" data-vdr="skip" class="vdr-skip">略過演出</button></div></div>';
    D.body.appendChild(modal);if(foley)foley.sync();try{modal.showModal();}catch(_){modal.setAttribute('open','');modal.classList.add('vd-modal-fallback');}
    const finished=new Promise(r=>done=r),host=modal.querySelector('#vdr-canvas');
    function end(outcome){if(dead)return;dead=true;foley?.stop(scope);cancelAnimationFrame(frame);scene?.dispose();modal.close?.();modal.remove();D.removeEventListener('visibilitychange',visibility);if(entry?.isConnected&&!entry.disabled)entry.focus({preventScroll:true});active=null;done(outcome);}
    active={finished,cancel:()=>end(false),getSceneState:()=>scene?.getDiagnostics()||null};
    function setStage(p){
      const index=p<.22?0:p<.47?1:p<.76?2:3;if(index!==stage){stage=index;modal.dataset.stage=String(index);if(foley)foley.play(index===0?'bowl':'paper',{scope,volume:index===0?.25:.5});
        const names=['穿過星光之門','讓九曜，緩緩醒來','循著你的星空軌跡','十二宮，為你展開'];
        const captions=[(chart.input.location||'出生的座標')+' · 時間留下的光',n.name+' · 第 '+n.pada+' 足','月亮 '+chart.planets.Moon.signName+' · '+(chart.lagna?'上升 '+chart.lagna.signName:'出生時間待確認'),chart.lagna?'你的出生星位，匯成此刻的命盤':'時間未知 · 先保留穩定星位'];
        modal.querySelector('#vdr-title').textContent=names[index];modal.querySelector('#vdr-caption').textContent=captions[index];
        modal.querySelector('#vdr-chapter').textContent=['I · THE THRESHOLD','II · THE AWAKENING','III · THE CELESTIAL PATH','IV · YOUR JANMA KUNDALI'][index];
        modal.querySelector('#vdr-fact').textContent=['由出生座標，走進你的九曜星殿。','本命月宿主：'+C.zh(n.lord)+' · 星儀正在升起。','星環相交，九曜依本次出生星位入盤。','同一份命盤，接續展開本命、分盤與運期。'][index];
        modal.querySelectorAll('.vdr-phases span').forEach((x,i)=>{x.dataset.active=String(i===index);x.dataset.past=String(i<index);});
      }
      if(p>=1){modal.dataset.complete='true';modal.querySelector('[data-vdr="open"]').disabled=false;}
    }
    function draw(now){if(dead)return;const dt=Math.max(0,now-lastTime);lastTime=now;if(started&&!D.hidden)elapsed+=dt;
      const p=still?1:Math.min(1,elapsed/DURATION);if(started){setStage(p);if(now-lastPaint>=32||still){scene?.render(p,elapsed/1000);lastPaint=now;}modal.querySelector('.vdr-progress i').style.transform='scaleX('+p+')';}
      if(!D.hidden&&(!still||!started))frame=requestAnimationFrame(draw);
    }
    function visibility(){lastTime=performance.now();cancelAnimationFrame(frame);if(!D.hidden&&!dead)frame=requestAnimationFrame(draw);}
    D.addEventListener('visibilitychange',visibility);
    modal.addEventListener('cancel',e=>{e.preventDefault();end(false);});modal.addEventListener('click',e=>{const b=e.target.closest('[data-vdr]'),a=b?.dataset.vdr;if(a==='cancel')end(false);if(a==='skip'||a==='open'&&!b.disabled)end(true);});
    modal.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();end(false);}if(e.key==='Tab'){const a=[...modal.querySelectorAll('button')].filter(b=>!b.disabled);if(e.shiftKey&&D.activeElement===a[0]){e.preventDefault();a.at(-1).focus();}else if(!e.shiftKey&&D.activeElement===a.at(-1)){e.preventDefault();a[0].focus();}}});
    host.addEventListener('vedic-scene-lost',()=>{scene?.dispose();scene=null;modal.dataset.renderer='fallback';});
    host.addEventListener('pointermove',()=>{if(still)scene?.render(1,0);});
    Promise.all([loadScene(),D.fonts?.ready||Promise.resolve()]).then(async()=>{
      if(dead)return;try{scene=root.JYVedicScene.create(host,chart);await scene.ready;if(dead)return;scene.render(still?1:0,0);modal.dataset.renderer='webgl';}catch(_){if(!dead)modal.dataset.renderer='fallback';}
    }).catch(()=>{if(!dead)modal.dataset.renderer='fallback';}).finally(()=>{if(dead)return;started=true;lastTime=performance.now();cancelAnimationFrame(frame);frame=requestAnimationFrame(draw);});
    frame=requestAnimationFrame(draw);modal.querySelector('[data-vdr="cancel"]').focus({preventScroll:true});return active;
  }
  root.JYVedicRitual=Object.freeze({play,preload:loadScene,isActive:()=>!!active,cancel:()=>active?.cancel(),getSceneState:()=>active?.getSceneState()||null});
})(window);
