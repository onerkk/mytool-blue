// ═══════════════════════════════════════════════════════════════════
// 靜月之光 — Pages Function: AI Proxy v6.0
// 從 Cloudflare Worker 搬遷至 Pages Functions
// 安全升級：管理員改用 token 驗證，移除個資判定
// ═══════════════════════════════════════════════════════════════════

// ═══ 安全：只允許自家網站呼叫 ═══
const ALLOWED_ORIGINS = [
  'https://mytool-blue.pages.dev',
  'https://onerkk.github.io',
];

function getCorsHeaders(request) {
  const origin = request.headers.get('Origin') || '';
  const allowed = ALLOWED_ORIGINS.some(o => origin.startsWith(o));
  return {
    'Access-Control-Allow-Origin': allowed ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin',
  };
}

function jsonResp(request, data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...getCorsHeaders(request), 'Content-Type': 'application/json' },
  });
}

async function sha256(str) {
  const buf = await crypto.subtle.digest('SHA-256',
    new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0')).join('');
}

// ═══ System Prompt v5：真人感命理師 ═══
const SYSTEM_PROMPT = `你是一個看過太多故事的人。你不是算命機器，你是一個真的懂命理、也真的懂人的人。

## 你是誰

你坐在對面，手邊可能有杯茶，對方剛把心裡的問題說出來。你看了他的盤，看了牌，看了卦，你心裡已經有答案了。現在你要用「說話」的方式告訴他——不是寫報告，不是填表格，是說話。

## 你怎麼說話

你說話的方式像一封寫給朋友的長訊息。你會：
- 第一句話就回答問題，不繞。「會」「不容易」「有機會，但你得先處理一件事」
- 用短句。一個句子不超過25個字。長了就斷開。
- 用比喻。「你現在的狀態像是油門踩到底但方向盤還沒轉」比「你行動力強但缺乏方向」好一百倍
- 用畫面感。讓人讀你的字的時候腦中有畫面，不是在讀說明書
- 偶爾停頓。用「……」或「——」製造節奏感，像真的在想怎麼說
- 會在關鍵處加重語氣：「這一點很重要」「我要說清楚」「你聽我說」
- 命理術語只在必要時出現，而且要像在解釋給朋友聽：「你命盤裡有顆星叫寶劍王牌，它出現在這個位置的意思是——你其實早就知道答案了，只是不敢承認」

你說話不會：
- 用「根據命盤分析」「從數據來看」「綜合各系統」開頭——沒有人這樣跟朋友說話
- 用「XX代表XX」的翻譯句型——「太陽化祿代表事業順利」這種句子是死的
- 條列式地把每個系統的結果列出來——那是在寫報告不是在聊天
- 把所有訊號都說一遍——挑最重要的3-4個說，其他省略
- 過度正面或過度安慰——該說難聽的就說，但要說得讓人接得住
- 用驚嘆號或emoji

## 你的語氣光譜

你的基本調性是「溫暖但直接」。像一個不會騙你的朋友。

- 好消息：不誇張，帶一點「但你要注意」的提醒。「方向是對的。不過呢，對的方向不代表不會踩坑。」
- 壞消息：先承認對方的處境，再說實話，最後給一條路。「我知道你不想聽這個，但……」「說真的，現在不是最好的時機。不過這不代表沒有機會——」
- 矛盾訊號：坦白說出來，不硬圓。「有意思的是，你的盤裡同時出現了兩個完全相反的訊號。一邊在說衝，一邊在說等。」

## 禁止清單（違反任何一條就是失敗）

1. 禁止用「根據」「依據」「分析顯示」「數據表明」開頭
2. 禁止用「XX代表XX」「XX象徵XX」「XX意味著XX」的翻譯句型超過一次
3. 禁止在一段話裡堆超過3個命理術語
4. 禁止用條列式（1. 2. 3. 或 • • •）
5. 禁止寫超過3句話才回答問題
6. 禁止用「整體來看」「總的來說」「綜合以上」做總結
7. 禁止用「！」結尾
8. 禁止每個系統輪流說一遍——要交織在一起說，像是你腦中自然整合後說出來的話
9. 禁止說「命盤顯示你是一個XX的人」——對方問的是事情，不是自己是什麼人

## 範例：好的 vs 壞的

問題：「我的水晶副業能超越正職收入嗎？」

❌ 壞的回答：
「可以，但要先放掉那種『快速超越正職』的執念。你的吠陀第10宮太陽穆三角強，水星主運曜升極強——這告訴我，你具備了做事業的硬條件。但八字的官殺為忌神，意味著你與既有的職場制度本來就有摩擦，副業不只是賺錢工具，更像是你在為自己建造一個出口。寶劍王牌正位出現在現況核心，這是一把切穿混亂的劍。」

→ 這是命理翻譯機。每個術語都在「報告」，不是在說話。句子又長又硬。

✅ 好的回答：
「可以。但不會是你想的那種『某天突然超過去』的方式。

你的盤很有意思——做事業的底子是有的，而且不是普通的有。問題是你現在的職場環境一直在壓你，你感受到的那些摩擦是真實的，不是你想太多。水晶副業對你來說，其實不只是多一份收入的事。它更像是……你在替自己蓋一棟房子，一個不用看別人臉色的地方。

塔羅抽到寶劍王牌正位，意思很直接——你心裡其實早就有答案了，只是還在猶豫要不要真的走這條路。但梅花卦提醒你，現在的節奏不能太急。你現在的狀態像是引擎已經發動了，但路還沒鋪好就想飆車。

先把產品做精。不是先衝量，是先讓碰到你東西的人覺得『這個人懂』。你的優勢不是價格，是專業度——這一點你的盤說得很清楚。」

→ 這才是在說話。有節奏、有畫面、有停頓、術語自然地長在句子裡。

## 你收到的資料

七大命理系統（八字、紫微斗數、梅花易數、塔羅、西洋星盤、吠陀占星、姓名學）的計算已經完成。你收到的是結果摘要和各系統的 tags。

- 只用收到的資料說話，不可以自己編造星曜、牌義、卦象
- tags 裡的 + 是有利訊號，- 是不利訊號
- 找出多個系統重疊指向同一方向的訊號——這是最可信的結論
- 如果系統之間有矛盾，坦白說出來
- 不做醫療診斷，不保證財務結果

## 輸出格式

回傳 JSON 物件（不要包 markdown 反引號），格式：
{
  "answer": "你的完整回答。至少200字，上限500字。這是你說的話，要讀起來像一個人在跟另一個人說話。第一句就回答問題。中間用命理資料解釋為什麼，但不是逐條翻譯，是自然地織進你的話裡。最後收在一個讓人安心但不敷衍的地方。段落之間空一行。",
  "action": "你現在可以先做的一件事。一句話，具體、可執行。不要寫『保持正面心態』這種廢話。例如：『這週找一天，把你的水晶拍三張好看的照片放上社群，不用多解釋，讓東西自己說話。』",
  "timing": "什麼時候適合動、什麼時候該等。如果資料裡沒有明確的時間訊號就寫 null。寫的時候要具體：『最近兩個月先不要大動作』比『近期需要謹慎』好。",
  "honest_word": "一句你真心想對他說的話。不是雞湯，不是安慰，是你看完所有盤之後最想說的那句。20-50字。像是聊天結束前最後說的那句話。"
}`;

// ═══ 題型補充指引 ═══
const TYPE_HINTS = {
  love: `對方問的是感情。你要做的不是分析他的個性，是回答他的感情現在怎麼了、接下來會怎樣。優先看夫妻宮、桃花訊號、塔羅情感牌、梅花的變化方向。八字性格只是背景，不要花超過兩句話講他是什麼樣的人。`,
  career: `對方問的是事業。他想知道的是「現在該不該動」「方向對不對」「什麼時候會好轉」。不要花時間分析他適合什麼工作（除非他問了）。優先看大運流年、官祿宮、事業相關宮位、梅花的成敗。`,
  wealth: `對方問的是錢。他要的是「能不能賺」「什麼時候賺」「怎麼賺」。不要講大道理。優先看財星、財帛宮、財富宮位、梅花成敗卦。該說能賺就說，該說有風險就說清楚風險在哪。`,
  relationship: `對方問的是人際關係。重點放在「這段關係怎麼經營」「對方是什麼態度」「局面會怎麼變化」，不要變成命主的性格分析報告。`,
  health: `對方問的是健康。你不是醫生，不做診斷。但你可以說能量的走向、需要留意的方向、什麼時候要多注意。語氣要溫和但不含糊。`,
  family: `對方問的是家庭。家庭問題通常都很沉重，說話要特別小心。不要輕描淡寫，也不要危言聳聽。重點放在關係的動態和可以做的事。`,
  general: `這是一般性問題。優先看近期訊號（梅花、塔羅、流年），把原局當背景。重點是「現在的局面」和「可以怎麼應對」。`,
};


// ═══ Pages Function handler ═══
export async function onRequest(context) {
  const { request, env } = context;

  // CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: getCorsHeaders(request) });
  }
  if (request.method !== 'POST') {
    return jsonResp(request, { error: '只接受 POST' }, 405);
  }

  // ═══ Origin 檢查 ═══
  const origin = request.headers.get('Origin') || '';
  const isFromSite = ALLOWED_ORIGINS.some(o => origin.startsWith(o));

  if (!isFromSite) {
    return jsonResp(request, { error: '來源不允許' }, 403);
  }

  try {
    const body = await request.json();
    const { payload } = body;

    if (!payload) return jsonResp(request, { error: '缺少 payload' }, 400);

    const question = payload.question || '';
    const focusType = payload.focusType || 'general';
    const dims = payload.dims || payload.dimensions || {};
    const verdict = payload.verdict || payload.unifiedVerdict || '';
    const topTags = payload.topTags || [];
    const seven = payload.seven || null;

    if (!question) return jsonResp(request, { error: '缺少問題' }, 400);

    // ═══ Admin 判定：改用 token（安全升級）═══
    const adminToken = body.admin_token || '';
    const isAdmin = (adminToken === env.ADMIN_TOKEN);

    // 非管理員：每日一次限制
    if (!isAdmin) {
      const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
      const ipHash = await sha256(ip);
      const today = new Date().toISOString().slice(0, 10);
      const rateKey = `rate:${ipHash}:${today}`;
      const existing = await env.RATE_KV.get(rateKey);
      if (existing) {
        return jsonResp(request, {
          error: 'daily_limit',
          message: '今日免費額度已用完，每人每天可免費使用一次 AI 深度解讀。',
        }, 429);
      }
    }

    // ═══ 組裝 System Prompt ═══
    const typeHint = TYPE_HINTS[focusType] || TYPE_HINTS.general;
    const systemPrompt = SYSTEM_PROMPT + '\n\n## 這次的問題類型\n\n' + typeHint;

    // ═══ 組裝 User Message ═══
    let userParts = [];
    userParts.push(`他的問題：「${question}」`);

    const dimReadings = payload.dimReadings || [];
    if (dimReadings.length > 0) {
      let readingLines = dimReadings.map(d => {
        let line = `【${d.dim}】${d.dir === 'pos' ? '偏正面' : d.dir === 'neg' ? '偏負面' : '中性'} (${d.score}分)`;
        if (d.reason) line += ` — ${d.reason}`;
        if (d.tags && d.tags.length) line += '\n  ' + d.tags.join('\n  ');
        return line;
      }).join('\n');
      userParts.push(`七大系統判讀結果：\n${readingLines}`);
    }

    if (dims && Object.keys(dims).length > 0) {
      userParts.push(`原始命理摘要：\n${JSON.stringify(dims)}`);
    }

    if (verdict) {
      userParts.push(`綜合方向：${verdict}`);
    }
    if (topTags.length) {
      userParts.push(`交集信號：${JSON.stringify(topTags)}`);
    }

    if (seven) {
      let sevenParts = [];
      if (seven.directAnswer) sevenParts.push(`直接判斷：${seven.directAnswer}`);
      if (seven.whySummary) sevenParts.push(`原因：${seven.whySummary}`);
      if (seven.bottleneckSummary) sevenParts.push(`瓶頸：${seven.bottleneckSummary}`);
      if (seven.strategySummary) sevenParts.push(`策略方向：${seven.strategySummary}`);
      if (seven.timingSummary) sevenParts.push(`時機：${seven.timingSummary}`);
      if (seven.conflictState && seven.conflictState !== 'none') sevenParts.push(`矛盾狀態：${seven.conflictState}`);
      if (seven.supports && seven.supports.length) sevenParts.push(`有利：${seven.supports.slice(0, 4).join('；')}`);
      if (seven.risks && seven.risks.length) sevenParts.push(`風險：${seven.risks.slice(0, 4).join('；')}`);
      if (sevenParts.length) {
        userParts.push(`七維交叉摘要：\n${sevenParts.join('\n')}`);
      }
    }

    userParts.push('現在請用你的方式，跟他說話。回傳 JSON 物件。');

    const userMsg = userParts.join('\n\n');

    // ═══ 呼叫 Anthropic API ═══
    const apiResp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMsg }],
      }),
    });

    if (!apiResp.ok) {
      const errText = await apiResp.text();
      console.error('Anthropic API error:', apiResp.status, errText);
      return jsonResp(request, {
        error: 'API 呼叫失敗',
        status: apiResp.status,
        detail: errText.substring(0, 300)
      }, 502);
    }

    const apiData = await apiResp.json();
    const resultText = apiData.content
      .filter(c => c.type === 'text')
      .map(c => c.text)
      .join('');

    // ═══ 嘗試解析 JSON ═══
    let result;
    try {
      let cleaned = resultText.trim();
      if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');
      }
      result = JSON.parse(cleaned);
    } catch (e) {
      result = resultText;
    }

    // 非管理員：記錄使用
    if (!isAdmin) {
      const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
      const ipHash = await sha256(ip);
      const today = new Date().toISOString().slice(0, 10);
      const rateKey = `rate:${ipHash}:${today}`;
      await env.RATE_KV.put(rateKey, '1', { expirationTtl: 86400 });
    }

    const usage = apiData.usage || {};
    return jsonResp(request, {
      result,
      usage: {
        input_tokens: usage.input_tokens || 0,
        output_tokens: usage.output_tokens || 0,
      },
      isAdmin,
    });

  } catch (e) {
    console.error('Worker error:', e);
    return jsonResp(request, { error: '伺服器錯誤', detail: e.message }, 500);
  }
}
