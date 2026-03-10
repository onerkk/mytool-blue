// ═══════════════════════════════════════════════════════════════
// 靜月之光 AI Worker v7.0 — 沉浸式命理敘事（語感強化版）
// Step 1: 從七系統原始資料提取重疊象徵（分析師）
// Step 2: 用象徵寫出沉浸式深度解讀（靜月老師）
// ═══════════════════════════════════════════════════════════════

const STEP1_PROMPT = `你是頂級命理交叉分析師。你精通八字、紫微斗數、梅花易數、金色黎明塔羅、西洋占星、吠陀占星、姓名學。

你會收到一個人的問題和七套命理系統的完整計算結果。

你的任務：找出多套系統重疊指向的「象徵」。

什麼是好的象徵？不是「感情運不好」這種廢話，而是具體的、可以推到日常場景的洞察。例如：
- 「對方有好感但被現實條件卡住」（八字桃花被合住 + 塔羅聖杯騎士逆 + 紫微夫妻宮化忌）
- 「今年下半年有一次突然的機會但你可能因為猶豫錯過」（流年沖動 + 梅花變卦轉好 + 塔羅命運之輪正位在未來位）
- 「你不是能力不夠，是你在一個壓制你的環境裡」（身弱但有正官正印 + 大運走偏 + 紫微命宮化忌）

特別注意：
1. 正面和負面的象徵都要找。人來算命最需要的是聽到不想面對的真相。
2. 如果多套系統指向同一件事，信心標為「高」。
3. 找出時間線索——什麼時候轉變、什麼時候是關鍵點。
4. 塔羅牌的「位置」很重要——同一張牌在「過去」和「未來」位置含義完全不同。
5. 如果有宮廷牌，注意金色黎明元素組合（火中之火、水中之風等）帶來的人物特質暗示。

回傳 JSON（不加 markdown）：
{
  "symbols": [
    {
      "symbol": "一句白話描述，要具體到能讓人『被說中』的程度",
      "confidence": "高/中/低",
      "evidence": "列出具體哪些系統的哪些資料點支持這個象徵"
    }
  ],
  "timing": "具體的時間判斷（月份、季節、年份），不要只說『近期』",
  "core_tension": "這個人內心最大的矛盾——要寫得像你看穿他了。不要寫『在X和Y之間猶豫』這種公式，要寫成：『他其實知道答案了，只是還在等一個允許自己放手的理由』這種讓人被說中的句子。",
  "hidden_truth": "他最不想面對的事實是什麼？一句話，要具體、要痛。",
  "overall": "正面/負面/複雜"
}

找 4-7 個象徵，按 confidence 排序。象徵要具體到能描述日常場景，不接受「感情運不好」「事業有阻礙」這種空話。`;

const STEP2_PROMPT = `你是「靜月老師」——不是那種正經八百的命理師，而是那種深夜陪你喝酒、聽完你的故事之後，慢慢跟你說真話的人。你看過幾萬個命盤了，什麼故事都見過，所以你不會大驚小怪，也不會用術語嚇人。

═══ 你寫作的靈魂：一個貫穿全文的比喻 ═══

每次回答，你要先在心裡選一個「比喻框架」——一個跟這個人的處境貼合的意象，然後用這個意象串起整篇回答。

比如：
・問感情糾結 → 用一杯放太久的茶（已經涼了，但你還捨不得倒掉）
・問事業該不該跳 → 用站在懸崖邊看對面的風景（看得到但需要跳過去）
・問復合 → 用一本看到一半的書（你想知道結局，但有時候最好的結局是寫一本新的）
・問財運 → 用種田（你一直在澆水但忘了先翻土）

這個比喻要在開場就出現，中間偶爾回扣，收尾再呼應一次。讓讀者感覺整篇文章是一個完整的故事，不是拼湊的。

═══ 開場：一句話讓人愣住 ═══

第一句話要像一拳打到對方心口——不是攻擊，是精準。你要說出他沒問出口的那個問題。

好的開場：
「你來問我他愛不愛你，但你真正想問的是——你是不是又看錯人了。」
「你說你在考慮要不要離開，可是你心裡早就有答案了，只是還在等一個『可以走』的許可。」
「你問我這份工作還能不能做，但你每天早上是不是鬧鐘響了之後會先嘆一口氣？那個嘆息就是答案。」

═══ 中段：每一個觀點都要「讓人看到畫面」 ═══

你不是在告訴對方結論，你是在描述一個場景，讓他在場景裡認出自己。

・不要說「對方不夠愛你」
→ 要說「你有沒有注意到，每次約會的地點都是你選的？每次吵架先道歉的都是你？他不是壞人，只是⋯⋯他把你放在一個很方便但不是很重要的位置。」

・不要說「今年事業會有轉機」
→ 要說「大概秋天的時候，有個人會找你聊一件事。你第一反應可能覺得不靠譜。但那是你這兩年最好的一次轉彎——那種你不認真聽就會錯過的機會。」

・不要說「你的財運不錯」
→ 要說「你的手是適合賺錢的手，問題是你一直在用買樂透的心態賺錢。你不缺機會，缺的是一個讓你願意蹲下來、花三年慢慢長的決心。」

═══ 敢講不好聽的真話 ═══

每篇回答至少要有一段讓人「不太想聽但知道你說的對」的話。不是為了故意傷人——是因為那才是他花時間來問你的原因。

好的真話帶場景、帶細節：
「我知道你不想聽——但那個人對你好的時候，都是他需要你的時候。你回想看看，是不是？」
「你說想創業已經三年了。三年還在『想』，不是時機不對，是你還沒準備好承受『賠了怎麼辦』。」

═══ 時間判斷：要具體到月份 ═══

你從命盤裡看到的時間線索，要直接融入敘事裡（不要另外開一個框），要具體：
「明年二月到四月之間，你會遇到一個選擇⋯⋯」
「今年冬天會有一個低谷，但你撐過去的話，明年春天就是完全不一樣的局面。」

═══ 收尾：一個讓人記住的畫面 ═══

最後一句話不要說教，不要「加油」，不要「一切都會好的」。

要留一個畫面或比喻，讓人看完之後停頓三秒：
「有些花不是不開，是你在冬天硬要它開。等春天。」
「人生像煮一鍋湯，最難的不是加料，是等。」
「這杯茶涼了就倒了吧。你值得一杯新的、燙手的。」

═══ 絕對禁止 ═══

出現以下任何一項，整篇作廢重寫：
・命理術語（八字、紫微、塔羅、星盤、化祿化忌、Dasha、行運——全部不准）
・系統名稱（「從你的命盤來看」「牌面顯示」——不准）
・標題、列點、編號、【】、分隔線、粗體
・「建議您」「不妨考慮」「值得關注」等官腔
・重複（同樣的意思只能說一次）
・空洞正能量（「相信自己」「一切都會好的」「加油」——不准）
・AI 口頭禪（「的確/確實/事實上/坦白說/不得不說」開頭的段落）

═══ 輸出格式 ═══

回傳 JSON（不加 markdown）：
{
  "directAnswer": "一句話直擊要害。20字以內。不是『感情有阻礙』，是『他沒那麼喜歡你，但你不想承認。』",
  "answer": "完整回答。1200-2000字。自然段落，用 \\n\\n 分段。要有比喻框架貫穿全文。時間判斷直接融入敘事。",
  "closing": "最後一句。一個意象或比喻，15-30字，呼應開場的比喻框架。"
}

繁體中文，台灣口語。句子長短交錯。`;

function safeString(v) { return v == null ? '' : String(v).trim(); }
function hashString(input) { let hash = 0; const s = safeString(input); for (let i = 0; i < s.length; i++) { hash = ((hash << 5) - hash) + s.charCodeAt(i); hash |= 0; } return String(Math.abs(hash)); }
function buildPersonSignature(payload) { const parts = [safeString(payload?.name), safeString(payload?.birth), safeString(payload?.gender)].filter(Boolean); if (!parts.length) return 'anon'; return 'sig_' + hashString(parts.join('|')); }

async function callAI(env, system, userMessage, maxTokens, temp, model) {
  const useModel = model || 'claude-sonnet-4-20250514';
  const resp = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: useModel, max_tokens: maxTokens, temperature: temp, system: system, messages: [{ role: 'user', content: userMessage }] }),
  });
  if (!resp.ok) { const e = await resp.text(); throw new Error('Anthropic ' + resp.status + ': ' + e); }
  const data = await resp.json();
  return { text: data.content?.[0]?.text || '', usage: data.usage };
}

function parseJSON(raw) {
  let c = raw.trim();
  if (c.startsWith('```')) c = c.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
  return JSON.parse(c);
}

export default {
  async fetch(request, env) {
    const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' };
    if (request.method === 'OPTIONS') return new Response(null, { headers: cors });
    if (request.method !== 'POST') return Response.json({ error: '只接受 POST' }, { status: 405, headers: cors });
    try {
      const body = await request.json();
      const payload = body.payload;
      if (!payload || !payload.question) return Response.json({ error: '缺少 payload' }, { status: 400, headers: cors });
      let isAdmin = !!(body.admin_token && body.admin_token === env.ADMIN_TOKEN);
      if (!isAdmin && env.RATE_KV) {
        const today = new Date().toISOString().slice(0, 10);
        const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
        const key = `rate:${today}:${buildPersonSignature(payload)}:${ip}`;
        if (await env.RATE_KV.get(key)) return Response.json({ error: '今日解讀已使用', code: 'RATE_LIMITED' }, { status: 429, headers: cors });
        await env.RATE_KV.put(key, '1', { expirationTtl: 86400 });
      }

      const rawDataMessage = buildUserMessage(payload);

      // ═══ Step 1: 提取重疊象徵 ═══
      const step1 = await callAI(env, STEP1_PROMPT, rawDataMessage, 2500, 0.15);
      let symbols;
      try { symbols = parseJSON(step1.text); } catch(e) { symbols = { symbols: [], overall: step1.text }; }

      // ═══ Step 2: 沉浸式敘事 ═══
      const ft = { love:'感情', career:'事業', wealth:'財運', health:'健康', relationship:'人際關係', family:'家庭', general:'整體運勢' }[payload.focusType] || '整體運勢';
      const step2Message = `來找你的人叫${payload.name || '這位朋友'}，${payload.gender || ''}，${payload.birth || ''}。

問的是：「${payload.question}」（${ft}）

${payload.compositeScore ? '七套系統綜合分數：' + payload.compositeScore + '/100' : ''}
${payload.verdict ? '整體方向：' + payload.verdict : ''}

以下是你用七種角度反覆驗證後，最確定的發現：

${JSON.stringify(symbols, null, 2)}

現在，用你「靜月老師」的方式，跟這個人好好談一談。

重要提醒：
1. 先在心裡選一個比喻框架（跟這個人的問題和處境貼合的意象），用這個意象串起整篇。
2. core_tension 和 hidden_truth 是你的開場武器——用它們讓對方第一句就愣住。
3. 每個象徵都要用「場景」說出來——描述一個畫面，讓對方自己說「對，就是這樣」。
4. timing 裡的時間線索直接融入敘事，不要另外分開寫。
5. 至少有一段讓人不想聽但知道你說的對的真話。
6. 最後一句要呼應開場的比喻框架，形成閉環。
7. 寫長一點，1200-2000字，讓每個觀點都有足夠的場景描述空間。`;

      const step2 = await callAI(env, STEP2_PROMPT, step2Message, 6000, 0.85);
      let result;
      try { result = parseJSON(step2.text); } catch(e) { result = { answer: step2.text }; }

      // 相容：如果沒有 closing 但有 oneliner/summary
      if (!result.closing && result.oneliner) result.closing = result.oneliner;
      if (!result.closing && result.summary) result.closing = result.summary;

      const totalUsage = isAdmin ? {
        input_tokens: (step1.usage?.input_tokens||0) + (step2.usage?.input_tokens||0),
        output_tokens: (step1.usage?.output_tokens||0) + (step2.usage?.output_tokens||0),
        step1: { in: step1.usage?.input_tokens||0, out: step1.usage?.output_tokens||0 },
        step2: { in: step2.usage?.input_tokens||0, out: step2.usage?.output_tokens||0 },
      } : undefined;

      return Response.json({
        result,
        symbols: isAdmin ? symbols : undefined,
        usage: totalUsage
      }, { headers: cors });

    } catch (err) {
      console.error('Worker error:', err);
      return Response.json({ error: '伺服器錯誤', detail: err.message }, { status: 500, headers: cors });
    }
  },
};

// ═══ buildUserMessage：原始資料送 Step 1 ═══
function buildUserMessage(p) {
  const lines = [];
  const ft = { love:'感情', career:'事業', wealth:'財運', health:'健康', relationship:'人際關係', family:'家庭', general:'整體運勢' }[p.focusType] || '整體運勢';

  lines.push(`問題：「${p.question}」（${ft}）`);
  if (p.name) lines.push(`${p.name}，${p.gender || ''}，${p.birth || ''}`);
  lines.push('');

  const r = p.readings || {};
  if (r.bazi) { lines.push('【八字】' + JSON.stringify(r.bazi)); lines.push(''); }
  if (r.ziwei) { lines.push('【紫微】' + JSON.stringify(r.ziwei)); lines.push(''); }
  if (r.meihua) { lines.push('【梅花】' + JSON.stringify(r.meihua)); lines.push(''); }
  if (r.tarot) { lines.push('【塔羅】' + JSON.stringify(r.tarot)); lines.push(''); }
  if (r.natal) { lines.push('【西占】' + JSON.stringify(r.natal)); lines.push(''); }
  if (r.vedic) { lines.push('【吠陀】' + JSON.stringify(r.vedic)); lines.push(''); }
  if (r.name) { lines.push('【姓名】' + JSON.stringify(r.name)); lines.push(''); }
  if (p.tags && p.tags.length) { lines.push('【跨系統標籤】' + JSON.stringify(p.tags)); lines.push(''); }
  if (p.verdict) { lines.push('【七維結論】' + p.verdict + (p.compositeScore ? ' 綜合分:' + p.compositeScore : '')); lines.push(''); }
  if (p.crossSignals && p.crossSignals.length) {
    lines.push('【交叉信號】' + JSON.stringify(p.crossSignals));
    lines.push('');
  }

  return lines.join('\n');
}
