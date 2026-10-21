/* 靜月之光 · 房間背景守門 / 20261021depth29
 * 根因：十三個全螢幕房間（雷諾曼、八字、合盤、紫微、梅花、靈籤、印度、西洋、六爻、易經、姓名、六壬…）
 * 都是直接掛在 body 底下的 fixed 層，打開時背後的導覽列、首頁、頁尾仍可被 Tab、讀屏與外接鍵盤點到，
 * 使用者會「看不見地」操作到首頁。這裡不改任何房間：只要偵測到全螢幕房間，就把層級比它低的背景設為 inert，
 * 房間關掉立即還原。層級比房間高的（儀式動畫、交接導引、提示詞對話框）一律不碰。 */
(function(root){
  'use strict';
  if(!root.document||!('inert' in HTMLElement.prototype))return;
  var doc=root.document,MARK='data-room-inert',current=null;
  var SKIP=/^(SCRIPT|STYLE|LINK|TEMPLATE|NOSCRIPT|DIALOG)$/;
  function z(el){var v=parseInt(getComputedStyle(el).zIndex,10);return isNaN(v)?0:v;}
  function isRoom(el){
    if(SKIP.test(el.tagName)||el.hasAttribute(MARK))return false;
    if(el.matches('[role=dialog],[aria-modal=true],#jy-handoff,#jy-prompt-packet,.modal-overlay'))return false;
    if(el.classList.contains('jy-veil')||el.getAttribute('aria-hidden')==='true')return false;
    var cs=getComputedStyle(el);if(cs.position!=='fixed'||cs.display==='none'||cs.visibility==='hidden'||cs.pointerEvents==='none')return false;
    var r=el.getBoundingClientRect();return r.width>=innerWidth*0.9&&r.height>=innerHeight*0.85&&z(el)>=1000;
  }
  function release(){doc.querySelectorAll('['+MARK+']').forEach(function(el){el.inert=false;el.removeAttribute(MARK);});}
  function sync(){
    if(doc.hidden)return;
    var kids=Array.prototype.slice.call(doc.body.children),room=null;
    for(var i=kids.length-1;i>=0;i--){if(isRoom(kids[i])){room=kids[i];break;}}
    if(room===current&&room)return;
    release();current=room;if(!room)return;
    var top=z(room);
    kids.forEach(function(el){
      if(el===room||SKIP.test(el.tagName)||el.inert)return;
      if(el.matches('[role=dialog],[aria-modal=true],#jy-handoff,#jy-prompt-packet'))return;
      if(getComputedStyle(el).position==='fixed'&&z(el)>top)return;
      el.inert=true;el.setAttribute(MARK,'');
    });
    // Focus left behind in the background would now be stranded; move it into the room.
    var a=doc.activeElement;if(a&&a!==doc.body&&!room.contains(a)&&a.closest('['+MARK+']')){
      var f=room.querySelector('h1,h2,[tabindex="-1"],button,input,textarea');if(f){if(!f.hasAttribute('tabindex')&&/^H[12]$/.test(f.tagName))f.tabIndex=-1;f.focus({preventScroll:true});}
    }
  }
  setInterval(sync,350);
  doc.addEventListener('visibilitychange',sync);
  root.JYRoomGuard=Object.freeze({version:'20261021depth29',sync:sync,current:function(){return current;}});
})(typeof window!=='undefined'?window:globalThis);
