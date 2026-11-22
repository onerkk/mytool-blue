/* One consultation per completed result. Both table and follow-up consume the
 * immutable selection used by the packet, so inspecting a station cannot draw again. */
(function (root) {
  'use strict';
  const doc = root.document, byResult = new WeakMap(), views = new Map();
  let serial = 0;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const lenormand = 'rider clover ship house tree clouds snake coffin bouquet scythe whip birds child fox bear stars stork dog tower garden mountain crossroads mice heart ring book letter man woman lily sun moon key fish anchor cross'.split(' ');
  const verdicts = ['和我的經驗相符','和實際情況不同','這一點還不確定'];
  function imagePath(id, isTarot) {
    if (!Number.isInteger(id)) return '';
    if (isTarot) return id >= 0 && id < 78 ? 'tarot_img/' + String(id).padStart(2,'0') + '.webp' : '';
    return lenormand[id - 1] ? 'ln-cards/ln-' + String(id).padStart(2,'0') + '-' + lenormand[id - 1] + '.png' : '';
  }
  function art(point, visit) {
    const v = point.visual || {};
    if (v.kind === 'limit') return '<span class="jc-paper-seal">待核</span>';
    if (v.edition === 'rws_reversals' && imagePath(v.face,true)) return '<img class="jc-face' + (v.reversed?' jc-reversed':'') + '" src="' + imagePath(v.face,true) + '" alt="">';
    if (v.faces?.length) return '<span class="jc-fan">' + v.faces.map(id => imagePath(id,false)).filter(Boolean).map(src => '<img src="' + src + '" alt="">').join('') + '</span>';
    if (v.lines?.length === 6) return '<span class="jc-hex">' + v.lines.map((yang,i) => '<i class="' + (yang?'solid':'broken') + (v.position === i+1?' selected':'') + '"></i>').reverse().join('') + '</span>';
    const mark = esc(v.mark || point.label.split('・')[0]);
    if (visit.theme === 'sky' || visit.theme === 'plate') {
      const sector = Number.isInteger(v.sector) && v.sector >= 0 && v.sector < 12 ? v.sector : null;
      return '<span class="jc-dial"><span class="jc-ring">' + (sector === null ? '' : '<b style="--angle:' + sector*30 + 'deg"></b>') + '</span><em>' + mark + '</em></span>';
    }
    return '<span class="jc-glyph">' + mark + '</span>';
  }
  function panel(record) {
    const ix = record.index, step = record.steps[ix], point = step.point;
    return '<div class="jc-piece" data-kind="' + esc(step.visit.theme) + '" aria-hidden="true">' + art(point,step.visit) + '</div>' +
      '<div class="jc-interpret"><h3>' + esc(point.label) + '</h3><p class="jc-fact">' + esc(point.detail) + '</p>' +
      '<p class="jc-guide">' + esc(point.reading) + '</p></div>';
  }
  function tabLabel(step) {
    if (step.visit.method === 'tarot') return step.point.label.split('・').slice(1).join('・').split(/[／；]/)[0] || step.point.label;
    if (step.visit.method === 'lenormand') return step.point.detail;
    return step.point.label.split(' · ')[0];
  }
  function checkPanel(r) {
    return '<details class="jc-check"'+(r.answer ? ' open' : '')+'><summary>核對 AI 回答中引用的盤面</summary>'+
      '<label>貼上已收到的回答，在這台裝置比對<textarea data-consult-answer rows="4" maxlength="18000">'+esc(r.answer || '')+'</textarea></label>'+
      '<button type="button" data-consult-check>核對引用</button><div class="jc-check-result" role="status">'+(r.checkResult || '')+'</div></details>';
  }
  function checkAnswer(r) {
    if (!r.answer?.trim()) return '請先貼上要核對的回答。';
    const result=root.JYReadingWorkflow.checkChartText(r.body,r.answer);
    if (result.issues.length) return '<p>請回到原盤核對這些地方。</p><ul>'+
      result.issues.map(i=>'<li>'+esc(i.message)+(i.excerpt?' <q>'+esc(i.excerpt.slice(0,160))+'</q>':'')+'</li>').join('')+'</ul>';
    if (result.checks) return '比對了 '+result.checks+' 處可辨識的盤面引用，未見衝突。結論及白話推論仍要逐一對照。';
    return '這段文字沒有可直接比對的明確引用。你可以選上方的落點，對照 AI 說的依據。';
  }
  function render(prompt, owner) {
    const packet = root.JYPromptPacket?.get?.(prompt), visits = packet?.projection?.consultation;
    if (!visits?.length) return '';
    const key = owner && typeof owner === 'object' ? owner : packet;
    let r = byResult.get(key);
    if (!r || r.body !== packet.body || !views.has(r.id)) {
      const steps = visits.flatMap(visit => visit.points.map(point=>({visit,point})));
      if (!steps.length) return '';
      r = { id:String(++serial), body:packet.body, index:0, steps, notes:new Map() };
      byResult.set(key,r); views.set(r.id,r);
      if (views.size > 48) {
        for (const id of views.keys()) if (!doc.querySelector('.jy-consult[data-visit="'+id+'"]') && id !== r.id) { views.delete(id); break; }
      }
    }
    const first = visits[0], paired = visits.length > 1, active = r.notes.get(r.index) || {};
    const question = esc(packet.question), intake = packet.projection.intake || {};
    const context = [[intake.facts,'你補充的實際情況'],[intake.priority,'你最想釐清的事']]
      .filter(([value]) => value).map(([value,label]) => '<dt>'+label+'</dt><dd>'+esc(value)+'</dd>').join('');
    return '<section class="jy-consult" data-visit="' + r.id + '" data-theme="' + esc(first.theme) + '" aria-label="本次互動解讀">' +
      '<header><div><h2>' + esc(paired?'一起讀這幾份盤':first.title) + '</h2>' + (question ? '<p class="jc-question">' + question + '</p>':'') + '</div></header>' + (context ? '<details class="jc-context"><summary>你帶來的情況</summary><dl>'+context+'</dl></details>' : '') +
      '<div class="jc-reading" aria-live="polite" aria-atomic="true">' + panel(r) + '</div>' +
      '<div class="jc-stations" role="group" aria-label="' + esc(first.action) + '">' +
      r.steps.map((s,i) => '<button type="button" data-consult-point="' + i + '" aria-pressed="' + (i===r.index) + '">' +
        (paired ? '<small>' + esc(s.visit.source) + '</small>':'') + esc(tabLabel(s)) + '</button>').join('') + '</div>' +
      '<details class="jc-observe"' + (active.choice || active.note ? ' open':'') + '><summary>拿這一處和自己的情況對照</summary><fieldset><legend>這一處跟你的經驗合得上嗎？</legend>' +
      '<div class="jc-responses">' + verdicts.map((v,i) => '<button type="button" data-consult-choice="'+i+'" aria-pressed="'+(active.choice===v)+'">'+v+'</button>').join('') + '</div>' +
      '<label>你想讓解讀知道的細節（選填）<textarea data-consult-note rows="2" maxlength="240">' + esc(active.note || '') + '</textarea></label></fieldset>' +
      '<button type="button" data-consult-copy>複製這個落點的追問</button><span class="jc-message" role="status"></span></details>'+(root.JYReadingWorkflow?.checkChartText?checkPanel(r):'')+'</section>';
  }
  function current(target) {
    const el = target?.closest?.('.jy-consult'), r = el && views.get(el.dataset.visit);
    return r ? {el,r} : null;
  }
  function draft(r) {
    if (!r.notes.has(r.index)) r.notes.set(r.index,{ note:'',choice:'' });
    return r.notes.get(r.index);
  }
  function showState(el,r) {
    const data = draft(r);
    el.querySelectorAll('[data-consult-point]').forEach(b => b.setAttribute('aria-pressed',String(Number(b.dataset.consultPoint) === r.index)));
    el.querySelectorAll('[data-consult-choice]').forEach(b => b.setAttribute('aria-pressed',String(verdicts[Number(b.dataset.consultChoice)] === data.choice)));
    el.querySelector('[data-consult-note]').value = data.note;
    el.querySelector('.jc-message').textContent = '';
    el.dataset.theme = r.steps[r.index].visit.theme;
    el.querySelector('.jc-reading').innerHTML = panel(r);
  }
  function followUp(r) {
    const {visit,point} = r.steps[r.index], d = draft(r);
    const observation = { source:visit.source || visit.title, location:point.label, evidence:point.detail, experience:d.choice || '', note:d.note.trim() };
    return root.JYPromptPacket.followUp(r.body,observation);
  }
  doc.addEventListener('input',e => {
    if (e.target.matches?.('[data-consult-answer]')) {
      const c=current(e.target);
      if(c){c.r.answer=e.target.value;c.r.checkResult='';c.el.querySelector('.jc-check-result').textContent='';}
      return;
    }
    if (!e.target.matches?.('[data-consult-note]')) return;
    const c = current(e.target);
    if (c) draft(c.r).note=e.target.value;
  });
  doc.addEventListener('click',async e => {
    const b=e.target.closest?.('[data-consult-point],[data-consult-choice],[data-consult-copy],[data-consult-check]'), c=current(b);
    if (!b || !c) return;
    const {el,r}=c;
    if (b.hasAttribute('data-consult-check')) {
      r.checkResult=checkAnswer(r);
      el.querySelector('.jc-check-result').innerHTML=r.checkResult;
      return;
    }
    if (b.hasAttribute('data-consult-point')) { r.index=Number(b.dataset.consultPoint); showState(el,r); }
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
