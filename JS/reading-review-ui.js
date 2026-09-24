/* Optional local feedback loop for externally generated answers. */
(function(){
  'use strict';
  var flow=window.JYReadingWorkflow,$=function(id){return document.getElementById(id);};
  flow.methods.forEach(function(k){var option=document.createElement('option');option.value=k;option.textContent=flow.methodInfo[k].name;$('method').appendChild(option);});
  function input(){return {method:$('method').value,question:$('question').value,answer:$('answer').value,sourcePrompt:$('source').value};}
  function hideRepair(){$('repair-panel').classList.add('hidden');$('repair').value='';}
  ['question','answer','source','method'].forEach(function(id){$(id).addEventListener('input',function(){$('result').classList.add('hidden');hideRepair();$('status').textContent='';});});
  $('check').addEventListener('click',function(){
    hideRepair();var value=input();
    if(!value.question.trim()||!value.answer.trim()){$('status').textContent='請先填入原問題與實際答案。';return;}
    var r=flow.review(value);$('issues').replaceChildren();
    r.issues.forEach(function(i){var li=document.createElement('li');li.textContent=i.message;$('issues').appendChild(li);});
    $('result-title').textContent=r.issues.length?'這些地方值得修訂或核對':'目前未找到已知的明顯問題';
    $('scope').textContent=r.note+' 請再確認：答案有沒有回答全部子題，以及它引用的盤面是否真的支持結論。';
    $('result').classList.remove('hidden');$('status').textContent='檢查完成，結果列在下方。';
  });
  $('repair-button').addEventListener('click',function(){
    try{$('repair').value=flow.repairPrompt(input());$('repair-panel').classList.remove('hidden');$('status').textContent='已依原資料整理重新解讀提示詞。';}
    catch(e){$('status').textContent=e.message;document.querySelector('details').open=true;$('source').focus();}
  });
  $('copy').addEventListener('click',async function(){
    try{await navigator.clipboard.writeText($('repair').value);$('status').textContent='已複製，可貼到你使用的 AI。';}
    catch(_){$('repair').focus();$('repair').select();$('status').textContent='請長按上方提示詞手動複製。';}
  });
  $('clear').addEventListener('click',function(){['question','answer','source'].forEach(function(id){$(id).value='';});$('result').classList.add('hidden');hideRepair();$('status').textContent='本頁內容已清除。';$('question').focus();});
})();
