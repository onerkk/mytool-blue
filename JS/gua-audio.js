/*! Recorded coin foley: Jesús Lastra / CC0 1.0. See assets/audio/CREDITS.md. */
(function(root){
 'use strict';
 var context=null,buffer=null,pending=null,playing=new Set(),generation=0;
 var script=document.currentScript,base=new URL('../assets/audio/',script&&script.src?script.src:new URL('JS/gua-audio.js',document.baseURI).href).href;
 async function unlock(){
   var A=root.AudioContext||root.webkitAudioContext;if(!A)throw new Error('瀏覽器不支援音效');
   if(!context)context=new A();await context.resume();if(context.state!=='running')throw new Error('音效未獲允許');
   if(buffer)return buffer;if(pending)return pending;
   pending=(async function(){
     for(var name of ['coins-recorded.mp3','coins-recorded.ogg']){
       var control=new AbortController(),timer=setTimeout(function(){control.abort();},9000);
       try{var r=await fetch(base+name,{signal:control.signal});if(!r.ok)throw new Error('音效檔案未載入');var data=await r.arrayBuffer();var b=await context.decodeAudioData(data);if(!b.duration)throw new Error('音效檔案為空');buffer=b;return b;}catch(e){if(name.endsWith('.ogg'))throw e;}finally{clearTimeout(timer);}
     }
   })().finally(function(){pending=null;});return pending;
 }
 function stop(){generation++;playing.forEach(function(s){try{s.stop();}catch(_){}s.disconnect();});playing.clear();}
 function hit(delay,volume,rate,offset,duration){
   if(!buffer||!context||context.state!=='running')return false;
   var source=context.createBufferSource(),gain=context.createGain();source.buffer=buffer;source.playbackRate.value=rate;gain.gain.value=volume;source.connect(gain);gain.connect(context.destination);playing.add(source);
   source.onended=function(){playing.delete(source);source.disconnect();gain.disconnect();};source.start(context.currentTime+delay,offset||0,Math.min(duration||buffer.duration,buffer.duration-(offset||0)));return true;
 }
 function toss(){stop();if(!buffer)return false;[0,1,2].forEach(function(i){hit(.99+i*.07,.85,1+i*.025,.09,.6);});return true;}
 function preview(){stop();return hit(0,.85,1,.09,.6);}
 document.addEventListener('visibilitychange',function(){if(document.hidden)stop();});
 root.JYGuaAudio=Object.freeze({unlock:unlock,toss:toss,preview:preview,stop:stop,status:function(){return {loaded:!!buffer,duration:buffer?buffer.duration:0,active:playing.size,state:context?context.state:'unavailable',generation:generation};}});
})(window);
