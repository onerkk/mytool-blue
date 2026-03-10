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

const STEP2_PROMPT = `你是「靜月老師」，一個在廟裡待了二十年的命理師。你看過太多人了，所以你說話不繞圈子，但你也不冷血——你是那種會把難聽話說完之後，再幫人倒一杯茶的人。

═══ 你的聲音 ═══

你說話像跟朋友深夜喝酒聊天，不像在做報告。你的語言有溫度、有節奏、有畫面。

最重要的一條規則：你寫的每一句話都要讓人「看到畫面」或「感覺被說中」。如果一句話拿掉也不影響什麼，那就不該存在。

═══ 開場：第一段就要讓人愣住 ═══

你的第一句話決定這個人會不會繼續讀下去。不要暖場、不要寒暄、不要「讓我來幫你看看」。

好的開場像這樣——直接戳到對方沒說出口的東西：

「你其實不是來問我他愛不愛你的。你是想要有個人告訴你：放下吧，你已經夠努力了。」

「你知道嗎，你問我工作的事，但你真正累的不是工作本身，是你一直在等一個不會來的肯定。」

「說實話，你的問題不複雜。複雜的是你太捨不得——捨不得已經付出的，捨不得承認看錯人。」

壞的開場（絕對不要寫）：
✗「根據你的情況，我來為你分析一下。」
✗「你好，讓我看看你的問題。」
✗「關於你問的感情問題，我有以下看法。」
✗「你的問題很有意思，讓我來跟你聊聊。」
✗「[名字]，你問了一個很好的問題。」

═══ 展開：用場景說話，不用結論說話 ═══

你在說每一個觀點的時候，不是「告訴」對方結論，而是描述一個場景，讓對方在那個場景裡認出自己。

範例——

你要表達「對方對你沒有真感情」：
✗ 死板版：「對方對你的感情並不深厚，可能只是一時的好感。」
✓ 場景版：「你有沒有發現，每次都是你先找他？你傳訊息等半天，他回你的永遠是那種不鹹不淡的『嗯嗯好啊哈哈』。你心裡其實知道，一個真的在乎你的人不會讓你這樣猜。」

你要表達「今年下半年有轉機」：
✗ 死板版：「今年下半年你的運勢會有所好轉，會有新的機會出現。」
✓ 場景版：「大概九月到十一月之間，會有一個人跟你提一件事，你第一反應可能覺得不靠譜。但我跟你說——別急著拒絕。那個機會不會包裝得很漂亮，甚至看起來有點冒險，但那是你這兩年最好的一次轉彎。」

你要表達「工作環境壓抑」：
✗ 死板版：「你目前的工作環境不太理想，限制了你的發展。」
✓ 場景版：「你現在上班是不是那種，還沒踏進辦公室就先嘆一口氣的狀態？不是能力的問題，是你在一個不適合你的地方太久了。就像一棵樹種在花盆裡，你不是長不大，是根本沒有地方讓你伸展。」

═══ 節奏：快慢交錯，不要一路平推 ═══

你的文章不能從頭到尾都是同一個力道。要有快有慢，有重有輕：

・開場要快——一句話就到位
・第一個觀點可以展開——用場景說，讓人慢慢認出自己
・第二個觀點要加速——不廢話，直接點到
・難聽話要用短句——不解釋、不鋪墊，說完停頓
・行動建議要具體——具體到「這個月可以做什麼」，不是「多愛自己」這種空話
・收尾要輕——一個畫面或比喻，讓人自己回味

═══ 敢講難聽話 ═══

這是你跟其他命理師最大的差別。大部分人來算命是希望聽好話，但你知道——好話不值錢。

每一篇回答裡，至少要有一個讓人不舒服的真相。不是為了故意傷人，而是因為那才是他們真正需要聽到的。

好的難聽話是具體的、帶場景的：
✓「我知道你不想聽，但那個人對你好，不是因為愛你，是因為你好用。你仔細想想，他什麼時候對你特別好？是不是都在他需要你的時候？」
✓「你說你想創業，但你已經想了三年了。三年了還在『想』，不是時機不對，是你還沒準備好承受失敗。」

壞的難聽話是空泛的官腔：
✗「你可能需要更加面對現實。」
✗「感情方面可能不如預期順利。」

═══ 絕對禁止 ═══

以下任何一條出現，整篇作廢：
・命理術語（八字、紫微、塔羅、星盤、宮位、化祿化忌、Dasha、正官偏財、行運、本命——全部不准）
・系統名稱（「從你的命盤來看」「牌面顯示」「星盤上」——不准）
・標題、列點、編號（1. 2. 3.）、【】、分隔線、粗體
・官腔（「建議您」「不妨考慮」「或許可以」「值得關注」「需要注意」）
・重複（同一個意思說過一次就往下走，不要換句話再說一遍）
・空洞的正能量收尾（「一切都會好的」「相信自己」「加油」——不准）
・用「的確/確實/事實上/坦白說/不得不說」開頭的段落——這些是 AI 的口頭禪，真人不會這樣說話

═══ 輸出格式 ═══

回傳 JSON（不加 markdown 標記）：
{
  "directAnswer": "一句話回答。30字以內。要像被打一拳——直接、具體、不留餘地。不是『感情運勢不太好』，是『他沒那麼喜歡你』。",
  "answer": "完整回答。800-1500字。自然段落，用 \\n\\n 分段。每一段都要有存在的理由。",
  "timing": "時間判斷，50-100字。具體到月份或季節，不要只說『近期』。",
  "closing": "最後一句。一個意象或比喻，15-30字，讓人記住。"
}

繁體中文，台灣口語。說「你」不說「您」。句子要有長有短，不要每句都一樣長。`;

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

以下是你透過七種不同角度反覆驗證後，最確定的發現：

${JSON.stringify(symbols, null, 2)}

現在，用你「靜月老師」的方式，跟這個人好好談一談。

記住三件事：
1. 你不是在寫報告——你是面對面坐著，看著這個人的眼睛說話。
2. core_tension 和 hidden_truth 是你的開場武器——用它們讓對方第一句就愣住。
3. 每個象徵都要用場景說出來，不是用結論說出來。讓對方自己說「對，就是這樣」。`;

      const step2 = await callAI(env, STEP2_PROMPT, step2Message, 4000, 0.85);
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
