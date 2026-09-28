/* Local, voluntary review log for time-bounded reading signals. No upload and no accuracy claim. */
(function installForecastReview(root){
  'use strict';
  var KEY='jy_forecast_review_v1',STATUSES={pending:'待回顧',matched:'符合',partial:'部分符合',not_matched:'未符合',unclear:'無法判定'};
  function read(){try{var v=JSON.parse(root.localStorage.getItem(KEY)||'[]');return Array.isArray(v)?v.filter(function(x){return x&&x.id&&x.signal&&x.dueDate;}):[];}catch(_){return [];}}
  function write(rows){try{root.localStorage.setItem(KEY,JSON.stringify(rows));try{root.dispatchEvent(new CustomEvent('jy:forecast-review:update'));}catch(_){}return true;}catch(_){return false;}}
  function escAttr(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
  function localDate(){var d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
  function renderControls(signal,method,question){
    if(!signal||!signal.signal||!signal.period)return '';
    var payload={question:String(question||''),method:String(method||'reading'),signal:String(signal.signal),period:String(signal.period),confidence:String(signal.confidence||'')};
    return '<div class="jy-forecast-save"><label>自選回顧日 <input type="date" class="jy-forecast-due" aria-label="自選預測回顧日期"></label><button type="button" class="jy-forecast-add" data-jy-forecast-save data-payload="'+escAttr(JSON.stringify(payload))+'">存入本機回顧</button><a href="reading-review.html#forecast-review">查看回顧</a><span class="jy-forecast-save-status" role="status" aria-live="polite"></span></div>';
  }
  function add(record){var rows=read();record.id=record.id||('fr-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8));record.createdAt=record.createdAt||new Date().toISOString();record.status='pending';record.note='';record.reviewedAt='';rows.unshift(record);return write(rows)?record:null;}
  function statusNode(host,message){var n=host.querySelector('.jy-forecast-save-status');if(n)n.textContent=message;}
  function setupCapture(){if(!root.document)return;root.document.addEventListener('click',function(event){var button=event.target.closest&&event.target.closest('[data-jy-forecast-save]');if(!button)return;var host=button.closest('.jy-forecast-save'),date=host&&host.querySelector('.jy-forecast-due'),dueDate=date&&date.value;if(!dueDate){if(date){date.focus();date.reportValidity();}statusNode(host,'請先選擇實務回顧日。');return;}var payload;try{payload=JSON.parse(button.getAttribute('data-payload')||'{}');}catch(_){statusNode(host,'這筆資料格式有誤，無法存入。');return;}var saved=add({question:payload.question,method:payload.method,signal:payload.signal,period:payload.period,confidence:payload.confidence,dueDate:dueDate});if(!saved){statusNode(host,'瀏覽器儲存空間不可用，沒有上傳任何資料。');return;}button.disabled=true;button.textContent='已存入';statusNode(host,'已保存在這個瀏覽器；到期不會自動通知。');});}
  function el(tag,cls,text){var n=root.document.createElement(tag);if(cls)n.className=cls;if(text!=null)n.textContent=text;return n;}
  function displayDate(value){try{return new Date(value+'T12:00:00').toLocaleDateString('zh-TW',{year:'numeric',month:'long',day:'numeric'});}catch(_){return value;}}
  function reviewPage(){var list=root.document.getElementById('forecast-review-list');if(!list)return;var status=root.document.getElementById('forecast-review-status');
    function say(s){if(status)status.textContent=s;}
    function render(){list.replaceChildren();var rows=read();if(!rows.length){list.appendChild(el('p','jy-forecast-empty','目前沒有已保存的預測回顧。可在解讀的「驗證信號」旁選一個回顧日期再保存。'));return;}
      rows.forEach(function(item){var card=el('article','jy-forecast-record'),head=el('div','jy-forecast-record-head'),title=el('strong','',item.period+' · '+(STATUSES[item.status]||STATUSES.pending));head.appendChild(title);var due=el('span','jy-forecast-due-label','回顧日：'+displayDate(item.dueDate));head.appendChild(due);card.appendChild(head);
        var q=el('p','jy-forecast-question',item.question||'未附原問題');card.appendChild(q);var sig=el('p','jy-forecast-signal',item.signal);card.appendChild(sig);var meta=el('small','jy-forecast-meta','方法／模式：'+(item.method||'未標示')+' · 建立：'+displayDate(String(item.createdAt||'').slice(0,10)));card.appendChild(meta);
        var dueStatus=el('p','jy-forecast-local-status','');dueStatus.textContent=item.status&&item.status!=='pending'?'已由你回填結果。':(item.dueDate<=localDate()?'已到你設定的回顧日；請依實際紀錄判斷。':'尚未到你設定的回顧日。');card.appendChild(dueStatus);
        var label=el('label','jy-forecast-field','實際結果（到回顧時再填）'),select=root.document.createElement('select');Object.keys(STATUSES).forEach(function(key){var opt=root.document.createElement('option');opt.value=key;opt.textContent=STATUSES[key];select.appendChild(opt);});select.value=item.status||'pending';label.appendChild(select);card.appendChild(label);
        var noteLabel=el('label','jy-forecast-field','可核對的實際情況'),note=root.document.createElement('textarea');note.rows=3;note.value=item.note||'';note.placeholder='記錄實際發生了什麼；也可說明資料不足。';noteLabel.appendChild(note);card.appendChild(noteLabel);
        var actions=el('div','jy-forecast-record-actions'),save=el('button','jy-forecast-save-review','保存回顧'),del=el('button','jy-forecast-delete','刪除');actions.appendChild(save);actions.appendChild(del);card.appendChild(actions);
        save.addEventListener('click',function(){var all=read(),row=all.find(function(x){return x.id===item.id;});if(!row)return;row.status=select.value;row.note=note.value.trim();row.reviewedAt=row.status==='pending'?'':new Date().toISOString();if(write(all)){say('回顧已保存在本機。這是你的自述紀錄，不自動代表預測準確。');render();}});
        del.addEventListener('click',function(){var all=read().filter(function(x){return x.id!==item.id;});write(all);say('已刪除該筆本機回顧。');render();});list.appendChild(card);
      });
    }
    var exportButton=root.document.getElementById('forecast-review-export'),clearButton=root.document.getElementById('forecast-review-clear');
    if(exportButton)exportButton.addEventListener('click',function(){var blob=new Blob([JSON.stringify(read(),null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=root.document.createElement('a');a.href=url;a.download='jingyue-reading-review.json';a.click();URL.revokeObjectURL(url);say('已匯出本機回顧紀錄。');});
    if(clearButton)clearButton.addEventListener('click',function(){if(!read().length){say('目前沒有紀錄。');return;}if(!root.confirm('確定清除此瀏覽器保存的所有回顧紀錄？此操作無法復原。'))return;write([]);say('已清除本機回顧紀錄。');render();});
    root.addEventListener('jy:forecast-review:update',render);render();
  }
  setupCapture();
  if(root.document){if(root.document.readyState==='loading')root.document.addEventListener('DOMContentLoaded',reviewPage,{once:true});else reviewPage();}
  root.JYForecastReview=Object.freeze({renderControls:renderControls,records:read,add:add,storage:'localStorage; user-entered outcomes; no upload or accuracy claim'});
})(typeof window!=='undefined'?window:globalThis);
