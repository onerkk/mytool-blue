const STEP0_PROMPT = `你是問題拆解器。
只做一件事：把使用者原問題拆成真正需要逐題回答的子問題。
回傳 JSON：
{
  "topic":"感情/工作/財務/人際/家庭/健康/綜合/其他",
  "surface_question":"",
  "core_need":"",
  "subquestions":[{"id":"q1","question":"","type":"現況判定","priority":1,"is_primary":true,"implicit_need":""}],
  "answer_strategy":["先回答...","再回答..."]
}`;

const STEP1_PROMPT = `你是七維案件整理員。你不寫故事，不安慰，不講術語，不灌水。
你會收到：原問題、問題拆解、七維 questionReadings、各系統原始 readings、結構化資料。
你的工作：把它整理成可供第二輪直接說人話的結構 JSON。

規則：
1. 七套都要看，不能因為字少忽略。
2. 先看和問題最相關的訊號，再看原始底盤。
3. 分出主線、支線、正向、負向、變數、時間、行動。
4. 不可把矛盾硬平均，必須保留矛盾來源。
5. energy_form 必須帶 first_yongshen、second_yongshen、avoid_elements、seven_primary_need、seven_secondary_need、recommended_modes。
6. system_support 必須七套都列，即使內容較少也要寫出該套實際支持或保留點。
7. 只回 JSON。

JSON 格式：
{
  "question_core":"",
  "mainline":[""],
  "branches":[""],
  "positive_signals":[""],
  "negative_signals":[""],
  "variables":[""],
  "timing":[""],
  "actions":[""],
  "verification_points":[""],
  "subquestion_answers":[{"id":"q1","question":"","direct_answer":"","why":"","confidence":"高/中/低","variable":""}],
  "system_support":{
    "bazi":[""],"ziwei":[""],"meihua":[""],"tarot":[""],"natal":[""],"vedic":[""],"name":[""]
  },
  "energy_form":{
    "first_yongshen":"",
    "second_yongshen":"",
    "avoid_elements":[""],
    "seven_primary_need":"",
    "seven_primary_need_label":"",
    "seven_secondary_need":"",
    "seven_secondary_need_label":"",
    "recommended_modes":[{"key":"seven","label":"七維平衡","elements":["木","火"],"reason":""}]
  },
  "tone_notes":["第二輪該先講什麼","哪裡要苦口婆心","哪裡要留一點希望"]
}`;

const STEP2_PROMPT = `你是「靜月分析師」。
你像會把事情講清楚的知心好友，帶點閨蜜感。你溫柔，但不是空泛安慰。你會接住人，也會講真話，會提醒風險，也會給鼓勵。

禁語：不要提命理、系統、模型、盤、牌、星、宮、流年、能量、分析。
你只能講現實、感受、關係、節奏、選擇、代價。

寫法要求：
1. 一開頭先接住對方，再直接點核心。
2. 若有多個子題，前半段逐題回答，每題先直答，再補一句原因。
3. 中段講主線、風險、變數、短中期走法。
4. 要有溫柔、苦口婆心、陪伴感，但不能假。
5. 要像一個真正懂她/他的人，不是客服，不是雞湯。
6. 最後收成一句能讓人被接住的話。
7. 只回 JSON。

JSON：
{
  "directAnswer":"18字內，一句點核心",
  "answer":"900-1500字，自然分段，用\\n\\n分段",
  "closing":"12-28字，收尾一句"
}`;

function safeString(v){ return v == null ? '' : String(v).trim(); }
function hashString(input){ let hash = 0; const s = safeString(input); for(let i=0;i<s.length;i++){ hash = ((hash<<5)-hash)+s.charCodeAt(i); hash |= 0; } return String(Math.abs(hash)); }
function buildPersonSignature(payload){ const parts = [safeString(payload?.name), safeString(payload?.birth), safeString(payload?.gender)].filter(Boolean); return parts.length ? 'sig_'+hashString(parts.join('|')) : 'anon'; }
async function callAI(env, system, userMessage, maxTokens, temp, model){
  const useModel = model || 'claude-sonnet-4-20250514';
  const resp = await fetch('https://api.anthropic.com/v1/messages', {
    method:'POST',
    headers:{'Content-Type':'application/json','x-api-key':env.ANTHROPIC_API_KEY,'anthropic-version':'2023-06-01'},
    body: JSON.stringify({ model:useModel, max_tokens:maxTokens, temperature:temp, system:system, messages:[{role:'user', content:userMessage}] })
  });
  if(!resp.ok){ const e = await resp.text(); throw new Error('Anthropic '+resp.status+': '+e); }
  const data = await resp.json();
  return { text:data.content?.[0]?.text || '', usage:data.usage };
}
function parseJSON(raw){ let c = String(raw||'').trim(); if(!c) return {}; if(c.startsWith('```')) c = c.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, ''); return JSON.parse(c); }
function toArray(v){ if(Array.isArray(v)) return v.filter(Boolean); if(v==null||v==='') return []; return [v]; }
function renderValue(v){ if(v==null||v==='') return ''; if(typeof v==='string') return v.trim(); if(typeof v==='number' || typeof v==='boolean') return String(v); if(Array.isArray(v)) return v.map(renderValue).filter(Boolean).join('；'); if(typeof v==='object') return Object.entries(v).map(([k,val])=>`${k}: ${renderValue(val)}`).filter(Boolean).join('；'); return String(v); }
function addSection(lines, title, body){ const txt = renderValue(body); if(!txt) return; lines.push(title); lines.push(txt); lines.push(''); }
function addList(lines, title, list){ const arr = toArray(list).map(renderValue).filter(Boolean); if(!arr.length) return; lines.push(title); arr.forEach(x=>lines.push('- '+x)); lines.push(''); }
function formatQuestionDecomposition(qd){
  if(!qd || typeof qd!=='object') return '（無法拆解，請依原問題逐題回應）';
  const lines = [];
  if(qd.topic) lines.push('topic: '+qd.topic);
  if(qd.surface_question) lines.push('surface_question: '+qd.surface_question);
  if(qd.core_need) lines.push('core_need: '+qd.core_need);
  const subs = Array.isArray(qd.subquestions) ? qd.subquestions : [];
  if(subs.length){ lines.push('subquestions:'); subs.forEach((sq,idx)=>{ lines.push(`- ${(sq.id||('q'+(idx+1)))}｜${safeString(sq.question)}｜${safeString(sq.type)}｜${sq.is_primary?'primary':'secondary'}｜priority=${sq.priority ?? idx+1}${sq.implicit_need ? '｜implicit_need='+safeString(sq.implicit_need) : ''}`); }); }
  if(Array.isArray(qd.answer_strategy) && qd.answer_strategy.length){ lines.push('answer_strategy:'); qd.answer_strategy.forEach(s=>lines.push('- '+renderValue(s))); }
  return lines.join('\n');
}
function buildStep1Message(p, questionPlan){
  const lines = [];
  const ft = ({love:'感情',career:'事業',wealth:'財運',health:'健康',relationship:'人際關係',family:'家庭',general:'整體運勢'})[p.focusType] || '整體運勢';
  lines.push(`問題：「${safeString(p.question)}」（${ft}）`);
  if(p.name) lines.push(`${safeString(p.name)}，${safeString(p.gender)}，${safeString(p.birth)}`);
  lines.push('');
  lines.push('【問題拆解】');
  lines.push(formatQuestionDecomposition(questionPlan));
  lines.push('');
  addSection(lines, '【各系統原始 readings】', p.readings || {});
  addSection(lines, '【各系統 questionReadings】', p.questionReadings || {});
  addSection(lines, '【系統結構化資料】', p.systems || p.systemPayloads || p.dims || {});
  addSection(lines, '【七維綜合】', p.seven || p.consensus || p.crossSummary || {});
  addSection(lines, '【能量表單草稿】', p.energyForm || {});
  addSection(lines, '【其他附註】', p.meta || p.apiMeta || {});
  return lines.join('\n');
}
function buildStep2Message(payload, questionPlan, structured){
  return [
    `來找你的人叫${safeString(payload.name || '這位朋友')}，${safeString(payload.gender)}，${safeString(payload.birth)}。`,
    `原問題：${safeString(payload.question)}`,
    '',
    '問題拆解：',
    formatQuestionDecomposition(questionPlan),
    '',
    '第一輪整理 JSON：',
    JSON.stringify(structured, null, 2),
    '',
    '現在請你用靜月分析師的方式，把上面內容說成人話。'
  ].join('\n');
}
export default {
  async fetch(request, env){
    const cors = { 'Access-Control-Allow-Origin':'*', 'Access-Control-Allow-Methods':'POST, OPTIONS', 'Access-Control-Allow-Headers':'Content-Type' };
    if(request.method === 'OPTIONS') return new Response(null, { headers:cors });
    if(request.method !== 'POST') return Response.json({ error:'只接受 POST' }, { status:405, headers:cors });
    try{
      const body = await request.json();
      const payload = body.payload;
      if(!payload || !payload.question) return Response.json({ error:'缺少 payload' }, { status:400, headers:cors });
      let isAdmin = !!(body.admin_token && body.admin_token === env.ADMIN_TOKEN);
      if(!isAdmin && env.RATE_KV){
        const today = new Date().toISOString().slice(0,10);
        const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
        const key = `rate:${today}:${buildPersonSignature(payload)}:${ip}`;
        if(await env.RATE_KV.get(key)) return Response.json({ error:'今日解讀已使用', code:'RATE_LIMITED' }, { status:429, headers:cors });
        await env.RATE_KV.put(key, '1', { expirationTtl:86400 });
      }
      const step0Message = `原問題：${safeString(payload.question)}\nfocusType:${safeString(payload.focusType || 'general')}\nname:${safeString(payload.name)}`;
      const step0 = await callAI(env, STEP0_PROMPT, step0Message, 1200, 0.1);
      let questionPlan;
      try{ questionPlan = parseJSON(step0.text); }
      catch(_){ questionPlan = { topic:payload.focusType||'general', surface_question:payload.question, core_need:'想知道事情真正怎麼看，並得到能落地的判斷', subquestions:[{ id:'q1', question:payload.question, type:'綜合判定', priority:1, is_primary:true, implicit_need:'' }], answer_strategy:['先直答主題，再拆原因、變數、行動'] }; }
      const step1 = await callAI(env, STEP1_PROMPT, buildStep1Message(payload, questionPlan), 5200, 0.18);
      let structured;
      try{ structured = parseJSON(step1.text); }
      catch(_){ structured = { question_core:safeString(payload.question), mainline:[safeString(step1.text).slice(0,220)], branches:[], positive_signals:[], negative_signals:[], variables:[], timing:[], actions:[], verification_points:[], subquestion_answers:(questionPlan.subquestions||[]).map(sq=>({id:sq.id, question:sq.question, direct_answer:'需進一步人工判讀', why:'第一輪 JSON 解析失敗', confidence:'低', variable:''})), system_support:{ bazi:[], ziwei:[], meihua:[], tarot:[], natal:[], vedic:[], name:[] }, energy_form: payload.energyForm || {}, tone_notes:['先接住，再點破，再給路'] }; }
      const step2 = await callAI(env, STEP2_PROMPT, buildStep2Message(payload, questionPlan, structured), 4200, 0.78);
      let result;
      try{ result = parseJSON(step2.text); } catch(_){ result = { directAnswer:'事情不是不能動', answer:step2.text, closing:'先把方向調正，再去拚。' }; }
      result.energyForm = structured.energy_form || payload.energyForm || {};
      result.structured = isAdmin ? structured : undefined;
      const totalUsage = isAdmin ? {
        input_tokens:(step0.usage?.input_tokens||0)+(step1.usage?.input_tokens||0)+(step2.usage?.input_tokens||0),
        output_tokens:(step0.usage?.output_tokens||0)+(step1.usage?.output_tokens||0)+(step2.usage?.output_tokens||0),
        step0:{ in:step0.usage?.input_tokens||0, out:step0.usage?.output_tokens||0 },
        step1:{ in:step1.usage?.input_tokens||0, out:step1.usage?.output_tokens||0 },
        step2:{ in:step2.usage?.input_tokens||0, out:step2.usage?.output_tokens||0 },
      } : undefined;
      return Response.json({ result, questionPlan:isAdmin ? questionPlan : undefined, analysisNotes:isAdmin ? structured : undefined, usage:totalUsage }, { headers:cors });
    }catch(err){
      console.error('Worker error:', err);
      return Response.json({ error:'伺服器錯誤', detail:err.message }, { status:500, headers:cors });
    }
  }
};
