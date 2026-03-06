// ═══════════════════════════════════════════════════════════════════
// 靜月之光 — Cloudflare Worker v4.0
// 溫柔自然對話式命理解讀 + JSON 結構化輸出
// ═══════════════════════════════════════════════════════════════════

// ═══ 安全：只允許自家網站呼叫 ═══
const ALLOWED_ORIGINS = [
  'https://onerkk.github.io',
  'http://localhost',      // 本地開發用
  'http://127.0.0.1',
];

function getCorsHeaders(request) {
  const origin = request.headers.get('Origin') || '';
  // file:// 開啟時 Origin 是 'null'（字串），需要特殊處理
  if (origin === 'null') {
    return {
      'Access-Control-Allow-Origin': 'null',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Vary': 'Origin',
    };
  }
  const allowed = ALLOWED_ORIGINS.some(o => origin.startsWith(o));
  return {
    'Access-Control-Allow-Origin': allowed ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin',
  };
}

// ═══ System Prompt：溫柔命理師 ═══
const SYSTEM_PROMPT = `你是「靜月之光」的命理解讀師。

你的第一原則：直接回答問題。
- 使用者問「會有25歲以下異性愛上我嗎」，你的第一句話就要回答「會」或「不容易」或「有機會但需要條件」
- 使用者問「什麼時候能升遷」，你的第一句話就要回答時間點
- 不要先介紹命盤格局再慢慢繞到答案，這樣使用者會覺得你在迴避問題
- 先給答案，再用命理資料解釋為什麼

你的說話方式：
- 像一個溫柔、有經驗的朋友在深夜陪對方聊天
- 把命理符號自然融進句子裡，不要「XX代表XX」的翻譯句型
- 用「你」稱呼對方，語氣親近但不輕浮
- 可以用「其實」「說真的」「坦白講」「不過呢」這類口語轉折
- 遇到矛盾訊號，用「一方面…但另一方面…」自然帶出
- 每一段都要像在說話，不是在填表格
- 不要用「根據命盤分析」「從數據來看」這種開場

你的工作原則：
- 七大命理系統的計算已經完成，你收到的是結果摘要和各系統的 tags
- 只用收到的資料說話，不可以自己編造星曜、牌義、卦象
- tags 裡的 + 是有利訊號，- 是不利訊號，把它們自然融進回答裡
- 找出多個系統重疊指向同一方向的訊號，這是最可信的結論
- 如果系統之間有矛盾，要說清楚矛盾在哪，不要硬圓
- 不說「一定會」「絕對不行」，但也不要模糊到什麼都沒說
- 不做醫療診斷，不保證財務結果

你必須回傳 JSON 物件（不要包 markdown 反引號），格式如下：
{
  "answer": "直接回答問題的完整段落，至少150字。第一句話就要回答問題本身（會/不會/有機會但…），然後用命理 tags 的具體內容解釋原因，最後給出你的整體判斷。這是最重要的部分。",
  "consensus": "多個系統交叉指向同一方向的訊號整理成自然敘述。80-200字。",
  "conflict": "如果有矛盾或阻力，溫和但誠實地說出來。沒有就寫 null。80-200字。",
  "strategy": "2-3個具體建議，用自然段落寫，不要編號。告訴對方現在先做什麼、先別急著做什麼。100-200字。",
  "timing": "時間相關訊號，什麼時候有利、什麼時候小心。沒有就寫 null。",
  "summary": "一句溫暖但有力的收尾。20-40字。"
}

記住：answer 欄位是重點中的重點。第一句話就要回答問題，不要繞。`;

// ═══ 題型補充指引 ═══
const TYPE_HINTS = {
  love: '這是感情問題。優先看夫妻宮/桃花訊號/塔羅情感牌/梅花近期變化。八字性格只當背景，重點放在「現在感情走向如何」。',
  career: '這是事業問題。優先看大運流年/官祿宮/事業宮位/梅花成敗。重點是「現在適不適合行動、方向對不對」。',
  wealth: '這是財運問題。優先看財星/財帛宮/財富宮/梅花成敗。不保證獲利，但要說清楚財的格局和時機。',
  relationship: '這是人際問題。優先看交友宮/十神結構/互動訊號。重點是關係怎麼經營，不是命主性格分析。',
  health: '這是健康問題。優先看五行平衡/疾厄宮/健康宮位。不做醫療診斷，只談能量趨勢和需要留意的方向。',
  family: '這是家庭問題。優先看田宅宮/父母宮/家庭相關宮位和十神。重點是家庭關係的動態和互動方式。',
  general: '這是一般性問題。優先看近期訊號（梅花、塔羅、流年），原局當背景。重點是「現在的局勢和適合的應對方式」。',
};


export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: getCorsHeaders(request) });
    }
    if (request.method !== 'POST') {
      return jsonResp(request, { error: '只接受 POST' }, 405);
    }

    // ═══ Referer / Origin 檢查（第二層防護）═══
    const origin = request.headers.get('Origin') || '';
    const referer = request.headers.get('Referer') || '';
    const isFromSite = ALLOWED_ORIGINS.some(o => origin.startsWith(o)) ||
                       referer.startsWith('https://onerkk.github.io');
    const isLocalFile = (origin === 'null');  // file:// 開啟時 Origin 是字串 'null'
    
    if (!isFromSite && !isLocalFile) {
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

      // ── 從前端傳來的七維整合摘要（如果有的話）──
      const seven = payload.seven || null;
      const aiGuide = payload.aiGuide || null;

      if (!question) return jsonResp(request, { error: '缺少問題' }, 400);

      // ═══ Admin 判定：用出生資料比對，不再用 token ═══
      const adminId = body.admin_id || {};
      const isAdmin = (
        adminId.bdate === '1983-08-25' &&
        typeof adminId.name === 'string' && adminId.name.includes('弘林') &&
        adminId.gender === 'male'
      );

      // 從本地檔案 (file://) 打過來的，必須是管理員才放行
      if (isLocalFile && !isAdmin) {
        return jsonResp(request, { error: '本地存取需要管理員身份' }, 403);
      }

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
      const systemPrompt = SYSTEM_PROMPT + '\n\n' + typeHint;

      // ═══ 組裝 User Message（精簡版，減少 token 浪費）═══
      let userParts = [];
      userParts.push(`問題：「${question}」`);
      
      // ── 各系統具體判讀（核心資料）──
      const dimReadings = payload.dimReadings || [];
      if (dimReadings.length > 0) {
        let readingLines = dimReadings.map(d => {
          let line = `【${d.dim}】${d.dir==='pos'?'偏正面':d.dir==='neg'?'偏負面':'中性'} (${d.score}分)`;
          if (d.reason) line += ` — ${d.reason}`;
          if (d.tags && d.tags.length) line += '\n  ' + d.tags.join('\n  ');
          return line;
        }).join('\n');
        userParts.push(`七大系統判讀結果：\n${readingLines}`);
      }

      // 原始命理資料（補充用）
      if (dims && Object.keys(dims).length > 0) {
        userParts.push(`原始命理摘要：\n${JSON.stringify(dims)}`);
      }
      
      // 綜合判定
      if (verdict) {
        userParts.push(`綜合方向：${verdict}`);
      }
      if (topTags.length) {
        userParts.push(`交集信號：${JSON.stringify(topTags)}`);
      }

      // 七維整合摘要
      if (seven) {
        let sevenParts = [];
        if (seven.directAnswer) sevenParts.push(`直接判斷：${seven.directAnswer}`);
        if (seven.whySummary) sevenParts.push(`原因：${seven.whySummary}`);
        if (seven.bottleneckSummary) sevenParts.push(`瓶頸：${seven.bottleneckSummary}`);
        if (seven.strategySummary) sevenParts.push(`策略方向：${seven.strategySummary}`);
        if (seven.timingSummary) sevenParts.push(`時機：${seven.timingSummary}`);
        if (seven.conflictState && seven.conflictState !== 'none') sevenParts.push(`矛盾狀態：${seven.conflictState}`);
        if (seven.supports && seven.supports.length) sevenParts.push(`有利：${seven.supports.slice(0,4).join('；')}`);
        if (seven.risks && seven.risks.length) sevenParts.push(`風險：${seven.risks.slice(0,4).join('；')}`);
        if (sevenParts.length) {
          userParts.push(`七維交叉摘要：\n${sevenParts.join('\n')}`);
        }
      }

      userParts.push('請根據以上各系統的具體判讀（tags），用溫柔自然的口吻整合回答。回傳 JSON 物件。');

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

      // ═══ 嘗試解析 JSON，失敗則回退為純文字 ═══
      let result;
      try {
        // 清除可能的 markdown 包裹
        let cleaned = resultText.trim();
        if (cleaned.startsWith('```')) {
          cleaned = cleaned.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');
        }
        result = JSON.parse(cleaned);
      } catch (e) {
        // JSON 解析失敗，直接回傳原始文字
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
};

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
