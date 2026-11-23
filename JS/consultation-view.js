/* One consultation per completed result. Both table and follow-up consume the
 * immutable selection used by the packet, so inspecting a station cannot draw again. */
(function (root) {
  'use strict';
  const doc = root.document, byResult = new WeakMap(), views = new Map();
  let serial = 0;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const verdicts = ['和我的經驗相符','和實際情況不同','這一點還不確定'];
  function imagePath(id, isTarot) {
    if (!Number.isInteger(id) || (isTarot ? id<0||id>77 : id<1||id>36)) return '';
    const existing=isTarot?root.getTarotCardImage?.({id}):root.JYLenormand?.imageFor?.(id);
    return existing || 'assets/cards/bright-20261011/'+(isTarot?'tarot':'lenormand')+'/'+String(id).padStart(2,'0')+'.webp';
  }
  function art(point, visit, previous) {
    const v = point.visual || {};
    if (v.kind === 'limit') return '<span class="jc-paper-seal">待核</span>';
    const face=v.edition==='rws_reversals'?imagePath(v.face,true):'';
    if (face) return '<img class="jc-face' + (v.reversed?' jc-reversed':'') + '" draggable="false" src="' + esc(face) + '" alt="">';
    if (v.faces?.length) return '<span class="jc-fan">' + v.faces.map(id => imagePath(id,false)).filter(Boolean).map((src,i) => '<img style="--order:'+i+'" draggable="false" src="' + esc(src) + '" alt="">').join('') + '</span>';
    if (v.lines?.length === 6) return '<span class="jc-hex">' + v.lines.map((yang,i) => '<i style="--order:'+i+'" class="' + (yang?'solid':'broken') + (v.position === i+1?' selected':'') + '"></i>').reverse().join('') + '</span>';
    const mark = esc(v.mark || point.label.split('・')[0]);
    if (visit.theme === 'sky' || visit.theme === 'plate') {
      const sector = Number.isInteger(v.sector) && v.sector >= 0 && v.sector < 12 ? v.sector : null;
      const prior=previous?.visual?.sector;
      const changesDivision=visit.method==='vedic' && [previous?.visual?.mark,v.mark].some(mark=>/^D\d+$/.test(mark||''));
      const known=!changesDivision && Number.isInteger(prior) && prior>=0 && prior<12 && sector!==null;
      const distance=known?((sector-prior+18)%12)-6:0;
      const marker=sector===null?'':'<b style="--angle:'+sector*30+'deg;--from-angle:'+(sector-distance)*30+'deg"></b>';
      return '<span class="jc-dial"><span class="jc-ring">' + marker + '</span><em>' + mark + '</em></span>';
    }
    return '<span class="jc-glyph">' + mark + '</span>';
  }
  function panel(record, previous) {
    const ix = record.index, step = record.steps[ix], point = step.point;
    return '<div class="jc-piece" data-kind="' + esc(step.visit.theme) + '" aria-hidden="true">' + art(point,step.visit,previous?.visit===step.visit?previous.point:null) + '</div>' +
      '<div class="jc-interpret"><h3>' + esc(point.label) + '</h3><p class="jc-fact">' + esc(point.detail) + '</p>' +
      '<p class="jc-guide">' + esc(point.reading) + '</p></div>';
  }
  function tabLabel(step) {
    if (step.visit.method === 'tarot') return step.point.label.split('・').slice(1).join('・').split(/[／；]/)[0] || step.point.label;
    if (step.visit.method === 'lenormand') return step.point.detail;
    return step.point.label.split(' · ')[0];
  }
  function initialSource(question,rows) {
    const cues=[
      [/候選日|應期|哪.{0,4}[日天]|幾號/,/應期候選日/],
      [/試聽|聽.{0,10}寫|讀音|唸法/,/字音形義/],
      [/伏財|伏神|飛伏/,/飛伏|伏神|用神/],
      [/卦辭|哪一段|取辭/,/主讀|取用卦爻辭|本卦與之卦取辭/],
      [/試講|第一輪|首輪/,/第一輪|第1輪/],
      [/分盤|D\d+/i,/分盤/]
    ];
    for(const [query,title] of cues){
      if(!query.test(question))continue;
      const names=rows.filter(row=>title.test(row.label));
      const named=names.find(row=>{
        const name=row.label.split('／').at(-1).match(/^(.+?)字音形義/);
        return name && question.includes(name[1]);
      });
      if(names.length)return rows.indexOf(named || names[0]);
    }
    const focus=rows.findIndex(row=>/(?:^|／)本題起斷（/.test(row.label));
    return focus<0?0:focus;
  }
  function sourcePanel(r) {
    if(!r.sources.length)return '';
    return '<details class="jc-source"><summary>查這一盤的原文</summary>'+
      '<label>本次完整提示詞裡的資料<select data-consult-source>'+r.sources.map((s,i)=>'<option value="'+i+'"'+(i===r.sourceIndex?' selected':'')+'>'+esc(s.label)+'</option>').join('')+'</select></label>'+
      '<div class="jc-source-text" tabindex="0" aria-label="所選原盤資料">'+esc(r.sources[r.sourceIndex].value)+'</div>'+
      '<button type="button" data-consult-source-copy>複製這段原文追問</button><p class="jc-source-status" role="status"></p>'+
      '<textarea hidden readonly data-consult-source-manual aria-label="可手動複製的原盤追問"></textarea></details>';
  }
  function checkPanel(r) {
    return '<details class="jc-check"'+(r.answer ? ' open' : '')+'><summary>核對 AI 回答，或請它依原盤重讀</summary>'+
      (root.JYPromptPacket?.rereadByMethod?'<div class="jc-reread"><button type="button" data-consult-reread>只收到一般建議？複製依原盤重讀</button><p class="jc-reread-status" role="status"></p><textarea hidden readonly aria-label="可手動複製的命理重讀訊息"></textarea></div>':'')+
      '<label>貼上已收到的回答，在這台裝置比對<textarea data-consult-answer rows="4" maxlength="18000">'+esc(r.answer || '')+'</textarea></label>'+
      '<button type="button" data-consult-check>核對回答</button><div class="jc-check-result" role="status">'+(r.checkResult || '')+'</div>'+
      '<div class="jc-repair"'+(r.problems?.length?'':' hidden')+'><button type="button" data-consult-repair>複製補讀要求</button>'+
      '<p class="jc-repair-status" role="status"></p><textarea hidden readonly data-consult-repair-manual aria-label="可手動複製的補讀訊息"></textarea></div>'+
      '<details class="jc-correct"'+(r.answer?.trim() ? '' : ' hidden')+(r.quote || r.clarification ? ' open' : '')+'><summary>AI 有一句把我的情況說錯了</summary>'+
      (r.intake.facts ? '<p>你原先寫的是</p><blockquote>'+esc(r.intake.facts)+'</blockquote>' : '')+
      '<label>從上方回答複製想更正的原句<textarea data-consult-quote rows="2" maxlength="600">'+esc(r.quote || '')+'</textarea></label>'+
      '<label>你能確認什麼？哪些仍然未知？<textarea data-consult-clarify rows="2" maxlength="480">'+esc(r.clarification || '')+'</textarea></label>'+
      '<button type="button" data-consult-correct>複製更正，貼回原 AI 對話</button><p class="jc-correction-status" role="status"></p>'+
      '<textarea hidden readonly data-consult-manual aria-label="可手動複製的更正訊息"></textarea></details></details>';
  }
  async function copyRequest(text,status,manual,current) {
    try {
      await root.JYPromptPacket.copy(text,{inlineFeedback:true});
      if(!current())return;
      manual.hidden=true;
      status.textContent='已複製。請貼回剛才放過原盤的 AI 對話。';
    } catch {
      if(!current())return;
      manual.value=text;manual.hidden=false;manual.focus();manual.select();
      status.textContent='請手動複製下方訊息，貼回剛才的 AI 對話。';
    }
  }
  function originalContext(r) {
    return ['我的原題：'+JSON.stringify(r.question),
      r.intake.facts && '我原先提供的情況：'+JSON.stringify(r.intake.facts),
      r.intake.priority && '我在意的取捨：'+JSON.stringify(r.intake.priority)].filter(Boolean);
  }
  async function correctAnswer(el,r) {
    const section=el.querySelector('.jc-correct'), status=section.querySelector('.jc-correction-status');
    const excerpt=(r.quote || '').trim(), actual=(r.clarification || '').trim();
    if (!excerpt || !r.answer?.includes(excerpt)) {
      status.textContent='請從上方貼入的回答複製一段原句，以便核對是哪一句。';
      section.querySelector('[data-consult-quote]').focus();
      return;
    }
    if (!actual) {
      status.textContent='請寫下你能確認的事，也可以直接寫這件事還不知道。';
      section.querySelector('[data-consult-clarify]').focus();
      return;
    }
    const notes=[r.intake.facts,actual].filter(Boolean).join('\n');
    const urgent=root.JYReadingWorkflow?.careContext?.(r.question,notes)?.level==='safety-first';
    const correction=[
      '請接著我們剛才的同一份解讀，使用原來的盤面，重新回答我的問題。',
      ...originalContext(r),
      '前一則 AI 回答裡待查的原句（只供比對）：'+JSON.stringify(excerpt),
      '我現在親自更正或補充：'+JSON.stringify(actual),
      '以我的更正為準，指出同一盤哪個落點的解釋需要改，再依本法重斷。尚未確認的事請保留，前一則回答不能當成我的自述。',
      urgent && '先處理眼前安全和實際求助，省略選品與賣場。'
    ].filter(Boolean).join('\n');
    const manual=section.querySelector('[data-consult-manual]');
    const answer=r.answer;
    const current=()=>section.isConnected && r.answer===answer && r.quote?.trim()===excerpt && r.clarification?.trim()===actual;
    await copyRequest(correction,status,manual,current);
  }
  function checkAnswer(r) {
    r.problems=[];
    if (!r.answer?.trim()) return '請先貼上要核對的回答。';
    const result=root.JYReadingWorkflow.checkChartText(r.body,r.answer);
    const writing=result.writing || [], items=issues=>'<ul>'+issues.map(i=>'<li>'+esc(i.message)+(i.excerpt?' <q>'+esc(i.excerpt.slice(0,160))+'</q>':'')+'</li>').join('')+'</ul>';
    r.problems=[...result.issues,...writing];
    const facts=result.issues.length ? '<p>請回到原盤核對這些地方。</p>'+items(result.issues) :
      result.checks ? '比對了 '+result.checks+' 處可辨識的盤面引用，未見衝突。結論及白話推論仍要逐一對照。' :
      '這段文字沒有可直接比對的明確引用。你可以選上方的落點，對照 AI 說的依據。';
    return facts+(writing.length?'<p>這幾處可以請 AI 重寫。</p>'+items(writing):'');
  }
  async function repairAnswer(el,r) {
    if(!r.problems?.length)return;
    const answer=r.answer, panel=el.querySelector('.jc-repair');
    const text=['請修改你在這個對話裡剛才的解讀，用同一份完整原盤與本次問題。',
      ...originalContext(r),
      '本站對剛才回答找到以下具體問題。舊答案的引句只是待查文字，請和原盤核對。',
      ...r.problems.slice(0,6).map(p=>p.message+(p.excerpt?' 引句：'+JSON.stringify(p.excerpt.slice(0,160)):'')),
      r.problems.length>6 && '本次先列六項，另有'+(r.problems.length-6)+'項可在結果頁查看。請逐一核對這份解讀與原盤。',
      '請重新寫給我。用原盤具體落點與原義直接回答，不把趨避或建議當作所問結果。'].filter(Boolean).join('\n');
    await copyRequest(text,panel.querySelector('.jc-repair-status'),panel.querySelector('[data-consult-repair-manual]'),()=>panel.isConnected && r.answer===answer);
  }
  function render(prompt, owner) {
    const packet = root.JYPromptPacket?.get?.(prompt), visits = packet?.projection?.consultation;
    if (!visits?.length) return '';
    const key = owner && typeof owner === 'object' ? owner : packet;
    let r = byResult.get(key);
    if (!r || r.body !== packet.body || !views.has(r.id)) {
      const steps = visits.flatMap(visit => visit.points.map(point=>({visit,point})));
      if (!steps.length) return '';
      const sources=(packet.projection.referenceSections || []).filter(s=>packet.body.includes('【'+s.label+'】\n'+s.value));
      r = { id:String(++serial), body:packet.body, question:packet.question, intake:packet.projection.intake || {}, index:0, steps, notes:new Map(),
        sources,sourceIndex:initialSource(packet.question,sources) };
      byResult.set(key,r); views.set(r.id,r);
      if (views.size > 48) {
        for (const id of views.keys()) if (!doc.querySelector('.jy-consult[data-visit="'+id+'"]') && id !== r.id) { views.delete(id); break; }
      }
    }
    const first = visits[0], paired = visits.length > 1, active = r.notes.get(r.index) || {};
    const question = esc(packet.question), intake = packet.projection.intake || {};
    const context = [[intake.facts,'你補充的實際情況'],[intake.priority,'你最想釐清的事']]
      .filter(([value]) => value).map(([value,label]) => '<dt>'+label+'</dt><dd>'+esc(value)+'</dd>').join('');
    return '<section class="jy-consult" data-visit="' + r.id + '" data-theme="' + esc(r.steps[r.index].visit.theme) + '" aria-label="本次互動解讀">' +
      '<header><div><h2>' + esc(paired?'一起讀這幾份盤':first.title) + '</h2>' + (question ? '<p class="jc-question">' + question + '</p>':'') + '</div></header>' + (context ? '<details class="jc-context"><summary>你帶來的情況</summary><dl>'+context+'</dl></details>' : '') +
      '<div class="jc-reading" aria-live="polite" aria-atomic="true"' + (r.steps.length>1?' tabindex="0" role="group" aria-label="讀這一處，可用左右方向鍵切換" aria-keyshortcuts="ArrowLeft ArrowRight Home End"':'') + '>' + panel(r) + '</div>' +
      (r.steps.length>1?'<div class="jc-pager" role="group" aria-label="逐處讀這份盤"><button type="button" data-consult-move="-1"'+(r.index===0?' disabled':'')+'>‹ 上一處</button><span>'+ (r.index+1)+' / '+r.steps.length+'</span><button type="button" data-consult-move="1"'+(r.index===r.steps.length-1?' disabled':'')+'>下一處 ›</button></div>':'')+
      '<div class="jc-stations" role="group" aria-label="' + esc(first.action) + '">' +
      r.steps.map((s,i) => '<button type="button" data-consult-point="' + i + '" aria-pressed="' + (i===r.index) + '">' +
        (paired ? '<small>' + esc(s.visit.source) + '</small>':'') + esc(tabLabel(s)) + '</button>').join('') + '</div>' +
      '<details class="jc-observe"' + (active.choice || active.note ? ' open':'') + '><summary>拿這一處和自己的情況對照</summary><fieldset><legend>這一處跟你的經驗合得上嗎？</legend>' +
      '<div class="jc-responses">' + verdicts.map((v,i) => '<button type="button" data-consult-choice="'+i+'" aria-pressed="'+(active.choice===v)+'">'+v+'</button>').join('') + '</div>' +
      '<label>你想讓解讀知道的細節（選填）<textarea data-consult-note rows="2" maxlength="240">' + esc(active.note || '') + '</textarea></label></fieldset>' +
      '<button type="button" data-consult-copy>複製這個落點的追問</button><span class="jc-message" role="status"></span></details>'+sourcePanel(r)+(root.JYReadingWorkflow?.checkChartText?checkPanel(r):'')+'</section>';
  }
  function current(target) {
    const el = target?.closest?.('.jy-consult'), r = el && views.get(el.dataset.visit);
    return r ? {el,r} : null;
  }
  function draft(r) {
    if (!r.notes.has(r.index)) r.notes.set(r.index,{ note:'',choice:'' });
    return r.notes.get(r.index);
  }
  function selectPoint(el,r,index) {
    if(!Number.isInteger(index)||index<0||index>=r.steps.length||index===r.index)return;
    const previous=r.steps[r.index], reading=el.querySelector('.jc-reading');
    reading.dataset.direction=index>r.index?'next':'previous';
    r.index=index;
    const data = draft(r);
    el.querySelectorAll('[data-consult-point]').forEach(b => b.setAttribute('aria-pressed',String(Number(b.dataset.consultPoint) === r.index)));
    el.querySelectorAll('[data-consult-choice]').forEach(b => b.setAttribute('aria-pressed',String(verdicts[Number(b.dataset.consultChoice)] === data.choice)));
    el.querySelector('[data-consult-note]').value = data.note;
    el.querySelector('.jc-message').textContent = '';
    el.dataset.theme = r.steps[r.index].visit.theme;
    reading.innerHTML=panel(r,previous);
    const pager=el.querySelector('.jc-pager');
    if(pager){
      pager.querySelector('span').textContent=(index+1)+' / '+r.steps.length;
      pager.querySelector('[data-consult-move="-1"]').disabled=index===0;
      pager.querySelector('[data-consult-move="1"]').disabled=index===r.steps.length-1;
    }
  }
  doc.addEventListener('keydown',e=>{
    if(!e.target.matches?.('.jc-reading,[data-consult-point]')||e.altKey||e.ctrlKey||e.metaKey||e.shiftKey)return;
    const c=current(e.target);
    if(!c||c.r.steps.length<2)return;
    const destinations={ArrowLeft:c.r.index-1,ArrowRight:c.r.index+1,Home:0,End:c.r.steps.length-1};
    if(!Object.hasOwn(destinations,e.key))return;
    e.preventDefault();selectPoint(c.el,c.r,destinations[e.key]);
    if(e.target.hasAttribute('data-consult-point'))c.el.querySelector('[data-consult-point="'+c.r.index+'"]').focus();
  });
  let swipe=null;
  doc.addEventListener('pointerdown',e=>{
    if(!e.isPrimary){swipe=null;return;}
    const piece=e.target.closest?.('.jc-piece'), c=current(piece);
    if(!c||c.r.steps.length<2||e.button!==0)return;
    swipe={id:e.pointerId,x:e.clientX,y:e.clientY,piece,index:c.r.index};
    piece.setPointerCapture(e.pointerId);
  });
  doc.addEventListener('pointerup',e=>{
    if(swipe?.id!==e.pointerId)return;
    const start=swipe;swipe=null;
    const c=current(start.piece),dx=e.clientX-start.x,dy=e.clientY-start.y;
    if(!c||!start.piece.isConnected||c.r.index!==start.index||Math.abs(dx)<24||Math.abs(dx)<Math.abs(dy)*1.5)return;
    selectPoint(c.el,c.r,start.index+(dx<0?1:-1));
  });
  for(const event of ['pointercancel','lostpointercapture'])doc.addEventListener(event,e=>{if(swipe?.id===e.pointerId)swipe=null;});
  function followUp(r) {
    const {visit,point} = r.steps[r.index], d = draft(r);
    const observation = { source:visit.source || visit.title, location:point.label, evidence:point.detail, experience:d.choice || '', note:d.note.trim() };
    return root.JYPromptPacket.followUp(r.body,observation);
  }
  doc.addEventListener('change',e=>{
    if(!e.target.matches?.('[data-consult-source]'))return;
    const c=current(e.target), i=Number(e.target.value);
    if(!c?.r.sources[i])return;
    c.r.sourceIndex=i;
    const panel=c.el.querySelector('.jc-source');
    const body=panel.querySelector('.jc-source-text');
    body.textContent=c.r.sources[i].value;body.scrollTop=0;
    panel.querySelector('.jc-source-status').textContent='';
    const manual=panel.querySelector('[data-consult-source-manual]');manual.value='';manual.hidden=true;
  });
  doc.addEventListener('input',e => {
    if (e.target.matches?.('[data-consult-answer],[data-consult-quote],[data-consult-clarify]')) {
      const c=current(e.target);
      if(!c)return;
      const {r,el}=c, section=el.querySelector('.jc-correct');
      section.querySelector('.jc-correction-status').textContent='';
      const manual=section.querySelector('[data-consult-manual]');
      manual.hidden=true;manual.value='';
      if(e.target.hasAttribute('data-consult-answer')){
        r.answer=e.target.value;r.checkResult='';el.querySelector('.jc-check-result').textContent='';
        r.problems=[];const repair=el.querySelector('.jc-repair');
        repair.hidden=true;repair.querySelector('.jc-repair-status').textContent='';
        const repairManual=repair.querySelector('[data-consult-repair-manual]');repairManual.value='';repairManual.hidden=true;
        r.quote='';r.clarification='';
        section.querySelector('[data-consult-quote]').value='';
        section.querySelector('[data-consult-clarify]').value='';
        section.hidden=!r.answer.trim();section.open=false;
      }else if(e.target.hasAttribute('data-consult-quote'))r.quote=e.target.value;
      else r.clarification=e.target.value;
      return;
    }
    if (!e.target.matches?.('[data-consult-note]')) return;
    const c = current(e.target);
    if (c) draft(c.r).note=e.target.value;
  });
  doc.addEventListener('click',async e => {
    const b=e.target.closest?.('[data-consult-point],[data-consult-move],[data-consult-choice],[data-consult-copy],[data-consult-check],[data-consult-correct],[data-consult-repair],[data-consult-source-copy],[data-consult-reread]'), c=current(b);
    if (!b || !c) return;
    const {el,r}=c;
    if (b.hasAttribute('data-consult-reread')) {
      const panel=b.closest('.jc-reread'), status=panel.querySelector('[role=status]');
      try { await copyRequest(root.JYPromptPacket.rereadByMethod(r.body),status,panel.querySelector('textarea'),()=>panel.isConnected); }
      catch(error) { status.textContent=error.message; }
      return;
    }
    if (b.hasAttribute('data-consult-source-copy')) {
      const source=r.sources[r.sourceIndex], panel=el.querySelector('.jc-source');
      if(!source)return;
      const text=['請接續原對話的同一份盤。',...originalContext(r),'我想讀懂原盤裡的這一段：',
        '【'+source.label+'】',source.value,'請依這段原文與同盤作用重斷原題，說明此象能定到什麼程度。'].join('\n');
      await copyRequest(text,panel.querySelector('.jc-source-status'),panel.querySelector('[data-consult-source-manual]'),()=>panel.isConnected && r.sources[r.sourceIndex]===source);
      return;
    }
    if (b.hasAttribute('data-consult-correct')) { await correctAnswer(el,r); return; }
    if (b.hasAttribute('data-consult-repair')) { await repairAnswer(el,r); return; }
    if (b.hasAttribute('data-consult-check')) {
      r.checkResult=checkAnswer(r);
      el.querySelector('.jc-check-result').innerHTML=r.checkResult;
      el.querySelector('.jc-repair').hidden=!r.problems.length;
      return;
    }
    if (b.hasAttribute('data-consult-point')) selectPoint(el,r,Number(b.dataset.consultPoint));
    else if(b.hasAttribute('data-consult-move'))selectPoint(el,r,r.index+Number(b.dataset.consultMove));
    else if (b.hasAttribute('data-consult-choice')) {
      const d=draft(r),v=verdicts[Number(b.dataset.consultChoice)];
      d.choice=d.choice===v?'':v;
      el.querySelectorAll('[data-consult-choice]').forEach(t=>t.setAttribute('aria-pressed',String(verdicts[Number(t.dataset.consultChoice)]===d.choice)));
    } else {
      const msg=el.querySelector('.jc-message');
      try { const text=followUp(r); await root.JYPromptPacket.copy(text,{inlineFeedback:true}); msg.textContent='已複製。貼到 AI 對話，就能接著談你選的這一處。'; }
      catch(err) { msg.textContent=err?.code==='CLIPBOARD_UNAVAILABLE'?'請使用開啟的文字框手動複製。':err?.message || '目前無法複製。'; }
    }
  });
  root.JYConsultationView=Object.freeze({render});
})(window);
