/* Intake is scoped to a method and a question, including dynamically rebuilt rooms. */
(function (root) {
  'use strict';
  const doc = root.document;
  const fields = {
    'f-question':'cards', 'f2-question':'integrated', 'bzx-q':'bazi', 's-question':'suite-bazi',
    'ln-q':'lenormand', 'mhx-q':'meihua', 'zw-q':'ziwei', 'c-question':'compat',
    'lr-question':'liuren', 'nm-question':'name', 'p-question':'personality',
    'vd-question':'vedic', 'wx-question':'astro', 'orc-q-input':'oracle', 'ly-q':'liuyao', 'yj-q':'yijing'
  };
  const selector = Object.keys(fields).map(id => '#' + id).join(',');
  const drafts = new Map(), latest = new Map(), controls = new WeakMap();
  const blank = () => ({ facts:'', priority:'' });
  const key = (method, question) => JSON.stringify([method,String(question || '').trim()]);
  const methodFor = q => fields[q.id] === 'cards' ? doc.getElementById('input-screen')?.dataset.atelierMode || 'tarot' : fields[q.id];
  let active = '';
  function store(k, data) {
    const [method] = JSON.parse(k), previous = latest.get(method);
    if (previous && previous !== k) drafts.delete(previous);
    if (data.facts || data.priority) { drafts.set(k, data); latest.set(method,k); }
    else { drafts.delete(k); latest.delete(method); }
  }
  function snapshot(methods, question) {
    if (!methods) return drafts.get(active) || blank();
    const unique = [...new Set([].concat(methods))];
    const method = unique.length === 1 ? unique[0] : 'integrated';
    const match = drafts.get(key(method, question));
    if (match) return match;
    // Rooms supply an explicit default question when the visitor left the field blank.
    if (/^(?:請|完整命盤|綜合分析)/.test(String(question || '')) && active === key(method, '')) return drafts.get(active) || blank();
    return blank();
  }
  function sync(q) {
    const ui = controls.get(q);
    if (!ui) return;
    const k = key(methodFor(q), q.value), data = drafts.get(k) || blank();
    ui.facts.value = data.facts;
    ui.priority.value = data.priority;
    ui.current = k; ui.question = String(q.value || '').trim(); ui.method = methodFor(q);
    ui.summary.textContent = data.facts || data.priority ? '你想讓解讀知道的事（已填寫）' : '你想讓解讀知道的事（選填）';
  }
  function attach(q) {
    if (controls.has(q)) { sync(q); return; }
    const method=methodFor(q), previous=latest.get(method);
    if (!q.value && previous && previous!==key(method,'')) store(previous,blank());
    const box = doc.createElement('details'), summary = doc.createElement('summary');
    box.className = 'jy-facts-wrap';
    box.appendChild(summary);
    function field(id, label, hint, limit) {
      const l = doc.createElement('label'), t = doc.createElement('textarea'), h = doc.createElement('small');
      t.id = q.id + '-' + id; l.htmlFor = t.id; l.textContent = label; t.rows = 2; t.maxLength = limit;
      t.className = id === 'facts' ? 'jy-facts' : 'jy-priority'; t.setAttribute('aria-label', label);
      h.id = t.id + '-hint'; h.textContent = hint; t.setAttribute('aria-describedby', h.id);
      box.append(l, t, h);
      return t;
    }
    const facts = field('facts','已知的實際情況（選填）','寫下已經發生或確認的事。',600);
    const priority = field('priority','你最想釐清的取捨（選填）','哪一點會影響你的選擇？也可以先只填原問題。',220);
    const target = q.closest('label') || q;
    target.insertAdjacentElement('afterend', box);
    controls.set(q, { facts, priority, summary, current:'' });
    const identify = () => { active = key(methodFor(q), q.value); };
    for (const t of [facts, priority]) {
      t.addEventListener('focus', identify);
      t.addEventListener('input', () => {
        identify();
        store(active, { facts:facts.value, priority:priority.value });
        controls.get(q).current = active;
        summary.textContent = facts.value || priority.value ? '你想讓解讀知道的事（已填寫）' : '你想讓解讀知道的事（選填）';
      });
    }
    q.addEventListener('focus', () => {
      const ui = controls.get(q);
      if (!q.value && ui.question && ui.method === methodFor(q)) store(ui.current,blank());
      identify(); sync(q);
    });
    q.addEventListener('beforeinput', () => {
      controls.get(q).replacing = !!q.value && q.selectionStart === 0 && q.selectionEnd === q.value.length;
    });
    q.addEventListener('input', e => {
      const ui = controls.get(q), method = methodFor(q), value = String(q.value || '').trim();
      identify();
      if (ui.current !== active && ui.method === method) {
        const previous = drafts.get(ui.current);
        const editing = e.isTrusted && !ui.replacing && value;
        if (previous) store(active, editing ? previous : blank());
      }
      ui.replacing = false; sync(q);
    });
    sync(q);
  }
  function added(node) {
    if (node.nodeType !== 1) return;
    if (node.matches(selector)) attach(node);
    else if (node.firstElementChild) node.querySelectorAll(selector).forEach(attach);
  }
  root.JYKnownFacts = {
    forInput(q) {
      if (!q) return {};
      const s = snapshot([methodFor(q)], q.value);
      return {knownFacts:s.facts.trim(), priority:s.priority.trim()};
    },
    get: (methods,q) => snapshot(methods,q).facts.trim(),
    priority: (methods,q) => snapshot(methods,q).priority.trim(),
    set(value, methods, q) {
      const unique = [...new Set([].concat(methods || []))];
      const k = methods ? key(unique.length===1 ? unique[0] : 'integrated',q) : active;
      if (!k) return;
      store(k, { ...(drafts.get(k) || blank()), facts:String(value || '').slice(0,600) });
      doc.querySelectorAll(selector).forEach(sync);
    }
  };
  function start() {
    doc.querySelectorAll(selector).forEach(attach);
    new MutationObserver(records => records.forEach(r => {
      if (r.type === 'attributes') { const q = doc.getElementById('f-question'); if (q) sync(q); }
      else r.addedNodes.forEach(added);
    })).observe(doc.documentElement, { childList:true,subtree:true,attributes:true,attributeFilter:['data-atelier-mode'] });
  }
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', start, { once:true }); else start();
})(window);
