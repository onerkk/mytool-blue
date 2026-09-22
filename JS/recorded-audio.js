/*! Jingyue physical foley / 1.0.0. Recorded files only. assets/audio/CREDITS.md */
(function(root){
 'use strict';
 var doc=root.document,script=doc.currentScript;
 var base=new URL('../assets/audio/',script&&script.src?script.src:new URL('JS/recorded-audio.js',doc.baseURI).href).href;
 var files={coins:'coins-recorded.mp3',stems:'stems-recorded.mp3',bamboo:'bamboo-recorded.mp3',shuffle:'shuffle-recorded.mp3',card:'card-recorded.mp3',wood:'wood-recorded.mp3',paper:'paper-recorded.mp3',bowl:'bowl-recorded.mp3'};
 var bytes=new Map(),buffers=new Map(),fetching=new Map(),decoding=new Map(),sources=new Set(),epochs=new Map(),last=new Map(),played={},errors={},context=null,master=null,volume=.8,muted=false,loading=0;
 try{muted=root.localStorage.getItem('jy-foley-muted')==='1';var v=root.localStorage.getItem('jy-foley-volume');if(v!==null&&Number.isFinite(+v))volume=Math.max(0,Math.min(1,+v));}catch(_){}
 function epoch(scope){return epochs.get(scope)||0;}
 function usable(){return !muted&&volume>0&&!doc.hidden;}
 function publish(){
  var state=muted?'muted':Object.keys(errors).length?'error':loading?'loading':context&&context.state==='running'?'ready':'waiting';
  doc.querySelectorAll('[data-foley-toggle]').forEach(function(b){b.setAttribute('aria-pressed',String(!muted));b.dataset.soundState=state;b.textContent=muted?'♫ 音效關':state==='error'?'♫ 重試音效':state==='loading'?'♫ 音效載入中':'♫ 音效開';b.title=muted?'開啟實錄音效':state==='error'?'檔案尚未載入，點一下重試':state==='waiting'?'操作後播放實錄音效':'關閉實錄音效';});
  doc.querySelectorAll('[data-foley-volume]').forEach(function(el){el.value=String(Math.round(volume*100));});
 }
 function fetchFile(key){
  if(!files[key])return Promise.reject(new Error('Unknown recorded sound: '+key));
  if(bytes.has(key))return Promise.resolve(bytes.get(key));if(fetching.has(key))return fetching.get(key);
  var p=(async function(){var ctl=new AbortController(),timer=setTimeout(function(){ctl.abort();},8000);loading++;publish();
   try{var r=await fetch(base+files[key]+'?v=foley1',{signal:ctl.signal});if(!r.ok)throw new Error('HTTP '+r.status);var data=await r.arrayBuffer();if(data.byteLength<128)throw new Error('Empty recording');bytes.set(key,data);delete errors[key];return data;}
   catch(e){errors[key]=e.message;throw e;}finally{clearTimeout(timer);loading--;fetching.delete(key);publish();}
  })();fetching.set(key,p);return p;
 }
 function prepare(keys){return Promise.allSettled((keys||Object.keys(files)).map(fetchFile));}
 // Called synchronously from the gesture, before awaiting downloads. Motion and
 // sound preferences are independent. No silent oscillator unlock workaround.
 function resume(){
  if(!usable())return Promise.resolve(false);
  try{var AC=root.AudioContext||root.webkitAudioContext;if(!AC)throw new Error('Audio unavailable');
   if(!context||context.state==='closed'){context=new AC();master=context.createGain();master.gain.value=volume;master.connect(context.destination);context.onstatechange=publish;}
   var p=context.state==='running'?Promise.resolve():context.resume();
   return Promise.race([p,new Promise(function(_,reject){setTimeout(function(){if(context.state!=='running')reject(new Error('請再輕觸音效按鈕'));},2500);})]).then(function(){publish();return context.state==='running';}).catch(function(e){errors.resume=e.message;publish();return false;});
  }catch(e){errors.resume=e.message;publish();return Promise.resolve(false);}
 }
 function decode(key){
  if(buffers.has(key))return Promise.resolve(buffers.get(key));if(decoding.has(key))return decoding.get(key);
  var p=fetchFile(key).then(function(data){if(!context)throw new Error('Audio not unlocked');return context.decodeAudioData(data.slice(0));}).then(function(buffer){if(!buffer.duration)throw new Error('Empty audio');buffers.set(key,buffer);delete errors[key];return buffer;}).catch(function(e){bytes.delete(key);errors[key]=e.message;throw e;}).finally(function(){decoding.delete(key);publish();});decoding.set(key,p);return p;
 }
 async function unlock(keys){if(!usable())return false;delete errors.resume;var ok=await resume();if(!ok)return false;var rr=await Promise.allSettled((keys||[]).map(decode));return rr.every(function(r){return r.status==='fulfilled';});}
 function stop(scope){
  if(scope){epochs.set(scope,epoch(scope)+1);}else{new Set(Array.from(epochs.keys()).concat(Array.from(sources).map(function(s){return s.scope;}))).forEach(function(k){epochs.set(k,epoch(k)+1);});}
  sources.forEach(function(item){if(scope&&item.scope!==scope)return;try{item.source.stop();}catch(_){}item.source.disconnect();item.gain.disconnect();if(item.pan)item.pan.disconnect();sources.delete(item);});
 }
 async function play(key,options){
  options=options||{};if(!usable()||!files[key])return false;
  var scope=options.scope||'site';if(!epochs.has(scope))epochs.set(scope,0);var token=epoch(scope),at=performance.now(),id=scope+':'+key,throttle=options.throttle==null?90:options.throttle;
  if(at-(last.get(id)||-Infinity)<throttle)return false;last.set(id,at);
  var deadline=at+(options.delay||0)*1000;
  try{
   var pair=await Promise.all([resume(),decode(key)]),buf=pair[1];if(!pair[0])return false;
   if(token!==epoch(scope)||!usable()||context.state!=='running')return false;
   // Discard stale interactions rather than making a departed room audible.
   if(performance.now()-deadline>1600)return false;
   var source=context.createBufferSource(),gain=context.createGain(),pan=null,start=context.currentTime+Math.max(0,(deadline-performance.now())/1000),offset=Math.max(0,Math.min(options.offset||0,buf.duration-.01));
   var duration=Math.min(options.duration||buf.duration,buf.duration-offset);source.buffer=buf;source.playbackRate.value=1;
   var level=Math.max(0,Math.min(1,options.volume==null?.7:options.volume));gain.gain.setValueAtTime(0,start);gain.gain.linearRampToValueAtTime(level,start+.006);gain.gain.setValueAtTime(level,start+Math.max(.008,duration-.035));gain.gain.linearRampToValueAtTime(0,start+duration);
   source.connect(gain);if(context.createStereoPanner&&options.pan){pan=context.createStereoPanner();pan.pan.value=Math.max(-.5,Math.min(.5,options.pan));gain.connect(pan);pan.connect(master);}else gain.connect(master);
   var item={source:source,gain:gain,pan:pan,scope:scope,key:key};sources.add(item);source.onended=function(){sources.delete(item);source.disconnect();gain.disconnect();if(pan)pan.disconnect();};
   source.start(start,offset,duration);played[key]=(played[key]||0)+1;delete errors[key];publish();return true;
  }catch(e){last.delete(id);errors[key]=e.message;publish();return false;}
 }
 function setEnabled(enabled){muted=!enabled;try{root.localStorage.setItem('jy-foley-muted',muted?'1':'0');}catch(_){}if(muted)stop();publish();}
 function setVolume(value){volume=Math.max(0,Math.min(1,Number(value)||0));if(master)master.gain.setTargetAtTime(volume,context.currentTime,.03);try{root.localStorage.setItem('jy-foley-volume',String(volume));}catch(_){}if(!volume)stop();publish();}
 function button(preview,scope){return '<button type="button" class="jy-foley-button" data-foley-toggle data-foley-preview="'+(files[preview]?preview:'paper')+'" data-foley-scope="'+(scope||'site')+'" aria-pressed="'+!muted+'">♫ 音效'+(muted?'關':'開')+'</button>';}
 function controls(preview,scope){return '<div class="jy-foley-controls">'+button(preview,scope)+'<details class="jy-foley-settings"><summary aria-label="音量與試聽">⋯</summary><div><label>音量 <input type="range" data-foley-volume min="0" max="100" value="'+Math.round(volume*100)+'"></label><button type="button" data-foley-preview-only="'+preview+'" data-foley-scope="'+scope+'">試聽實錄音效</button><p data-foley-status role="status"></p></div></details></div>';}
 doc.addEventListener('click',function(e){var b=e.target.closest('[data-foley-toggle],[data-foley-preview-only]');if(!b)return;
  var retry=b.dataset.soundState==='error'||b.dataset.soundState==='waiting',preview=b.dataset.foleyPreviewOnly||b.dataset.foleyPreview||'paper';
  if(b.hasAttribute('data-foley-toggle')&&!muted&&!retry){setEnabled(false);return;}
  setEnabled(true);errors={};play(preview,{scope:b.dataset.foleyScope||'site',volume:.65}).then(function(ok){var status=b.closest('.jy-foley-controls')?.querySelector('[data-foley-status]');if(status)status.textContent=ok?'實錄音效已播放':'無法播放，請確認媒體音量後再試。';});
 },true);
 doc.addEventListener('input',function(e){if(e.target.hasAttribute('data-foley-volume'))setVolume(+e.target.value/100);});
 doc.addEventListener('pointerdown',function(e){if(e.target.closest('button,[role=button]')&&usable())resume();},true);
 doc.addEventListener('keydown',function(e){if((e.key==='Enter'||e.key===' ')&&e.target.closest('button,[role=button]')&&usable())resume();},true);
 doc.addEventListener('visibilitychange',function(){if(doc.hidden)stop();publish();});root.addEventListener('pagehide',function(){stop();});
 publish();
 root.JYFoley=Object.freeze({prepare:prepare,unlock:unlock,play:play,stop:stop,enabled:function(){return !muted;},setEnabled:setEnabled,setVolume:setVolume,button:button,controls:controls,sync:publish,status:function(){return {enabled:!muted,volume:volume,state:context?context.state:'waiting',loaded:Array.from(buffers.keys()),active:sources.size,played:{...played},errors:{...errors},durations:Object.fromEntries(Array.from(buffers).map(function(pair){return [pair[0],pair[1].duration];}))};}});
})(window);
