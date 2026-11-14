/* 2026-11-15：使用者實測梅花，結果與他知道的事實差很多——卦是從時間起的，沒有任何關於對方的資訊，題目也沒寫。
   在每一個問題欄下面加一格「已知的實際情況（選填）」，提示詞產生器會把它當成原題的一部分送出，並以它為最硬的依據。
   依使用者要求：這一格不放範例。內容只留在這次開啟的頁面裡，不存檔。 */
(function(){
  var IDS=['f-question','f2-question','bzx-q','ln-q','mhx-q','zw-q','c-question','lr-question','nm-question','p-question','s-question','vd-question','wx-question'];
  var value='';
  window.JYKnownFacts={get:function(){return String(value||'').trim().slice(0,600);},set:function(v){value=String(v||'');sync(null);}};
  function sync(src){var all=document.querySelectorAll('textarea.jy-facts');for(var i=0;i<all.length;i++)if(all[i]!==src&&all[i].value!==value)all[i].value=value;}
  function attach(q){
    if(!q||q.dataset.jyFacts)return;q.dataset.jyFacts='1';
    var wrap=document.createElement('div');wrap.className='jy-facts-wrap';
    var lab=document.createElement('label');lab.className='jy-facts-label';lab.textContent='已知的實際情況（選填）';
    var hint=document.createElement('div');hint.className='jy-facts-hint';hint.textContent='寫下你已經確定的事。解讀會以這些為準；盤象與它不合時會直接告訴你。';
    var t=document.createElement('textarea');t.className=(q.className?q.className+' ':'')+'jy-facts';t.rows=2;t.maxLength=600;t.setAttribute('aria-label','已知的實際情況（選填）');t.value=value;
    t.addEventListener('input',function(){value=t.value;sync(t);});
    wrap.appendChild(lab);wrap.appendChild(t);wrap.appendChild(hint);
    q.insertAdjacentElement('afterend',wrap);
  }
  function scan(){for(var i=0;i<IDS.length;i++)attach(document.getElementById(IDS[i]));}
  var st=document.createElement('style');st.textContent='.jy-facts-wrap{margin-top:.6rem}.jy-facts-label{display:block;font-size:.82rem;opacity:.85;margin-bottom:.3rem}.jy-facts-hint{font-size:.74rem;opacity:.6;margin-top:.25rem;line-height:1.5}textarea.jy-facts{width:100%;box-sizing:border-box;min-height:52px}';
  (document.head||document.documentElement).appendChild(st);
  var pending=false;function later(){if(pending)return;pending=true;setTimeout(function(){pending=false;scan();},200);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',scan);else scan();
  try{new MutationObserver(later).observe(document.documentElement,{childList:true,subtree:true});}catch(_){}
})();
