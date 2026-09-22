/* Question preview only: never changes a draw or switches a system without a click. */
(function(root){
  'use strict';
  var fields={'f-question':'tarot','f2-question':'tarot','ln-q':'lenormand','orc-q-input':'oracle','mhx-q':'meihua','bzx-q':'bazi','zw-q':'ziwei','wx-question':'astro','ly-q':'liuyao','yj-q':'yijing'};
  var targets={tarot:'f-question',lenormand:'ln-q',oracle:'orc-q-input',meihua:'mhx-q',bazi:'bzx-q',ziwei:'zw-q',astro:'wx-question',liuyao:'ly-q',yijing:'yj-q'};
  var pending=null;
  function populate(){
    if(!pending)return;
    var input=document.getElementById(targets[pending.system]);if(!input)return;
    input.value=pending.question;pending=null;input.dispatchEvent(new Event('input',{bubbles:true}));
  }
  function switchSystem(from,to,question){
    if(typeof root._atelierChoose!=='function')return;
    var close={lenormand:'_lenormandClose',oracle:'_oracleClose',meihua:'_meihuaClose',bazi:'_baziClose',ziwei:'_zwClose',liuyao:'_liuyaoClose',yijing:'_yijingClose'}[from];
    if(close&&typeof root[close]==='function')root[close]();
    pending={system:to,question:question};root._atelierChoose(to==='astro'?'western':to);
    populate(); // Current modules open synchronously; enhance() also handles lazy loads.
  }
  function render(input){
    var F=root.JYTarotFoundation,system=fields[input.id];if(!F||!system)return;
    var id='jy-recommend-'+input.id,host=document.getElementById(id);
    if(!host){host=document.createElement('div');host.id=id;host.className='jy-question-recommendation';host.setAttribute('aria-live','polite');input.parentNode.insertBefore(host,input.nextSibling);}
    host.textContent='';var q=input.value.trim();host.hidden=!q;if(!q)return;
    var rec=F.recommendSystem(q),copy=document.createElement('p');
    copy.textContent='系統建議：'+rec.label+'。'+rec.reason+'。';host.appendChild(copy);
    if(system==='tarot'){
      var route=F.routeQuestion(q),manual=root._forcedSpread;
      var plan=manual?F.instantiateMethod(manual,route.compiledQuestion):route.methodPlan;
      var detail=document.createElement('p');
      detail.textContent=plan?(manual?'手動選擇：':'牌陣建議：')+plan.label+'（'+plan.count+' 張）。'+(manual?'':route.reason):route.reason;
      if(plan&&plan.branches)detail.textContent+='\n'+plan.branches.map(function(b,i){return (i+1)+'. '+b.question+(b.scope?'〔'+b.scope+'〕':'');}).join('\n');
      if(route.ready===false)detail.textContent+='\n'+route.questionPlan.notes.join(' ');
      if(manual&&plan.missingObservables.length)detail.textContent+='\n本陣沒有獨立位置回答：'+plan.missingObservables.map(function(k){return F.OBSERVABLES[k]||k;}).join('、');
      host.appendChild(detail);
    }
    if(rec.birthDataRequired){var birth=document.createElement('p');birth.textContent='排盤前需填寫出生日期、時間等資料。';host.appendChild(birth);}
    if(rec.system!==system&&targets[rec.system]&&system!=='astro'){
      var button=document.createElement('button');button.type='button';button.className='btn btn-outline btn-sm';button.textContent='改用'+rec.label;
      button.addEventListener('click',function(){switchSystem(system,rec.system,q);});host.appendChild(button);
    }
  }
  function enhance(container){populate();Object.keys(fields).forEach(function(id){var input=document.getElementById(id);if(input&&(!container||container.contains(input)))render(input);});}
  document.addEventListener('input',function(e){if(e.target&&fields[e.target.id])render(e.target);});
  document.addEventListener('focusin',function(e){if(e.target&&fields[e.target.id])render(e.target);});
  document.addEventListener('DOMContentLoaded',function(){enhance();});
  root.JYReadingRecommender={render:render,enhance:enhance};
})(window);
