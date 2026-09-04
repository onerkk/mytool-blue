// ═══════════════════════════════════════════════════════════════════
// 靜月之光 — Pages Function: AI Proxy v6.0
// 從 Cloudflare Worker 搬遷至 Pages Functions
// 安全升級：管理員改用 token 驗證，移除個資判定
// ═══════════════════════════════════════════════════════════════════

// ═══ 安全：只允許自家網站呼叫 ═══
const ALLOWED_ORIGINS = [
  'https://jingyue.uk',
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

// ═══ System Prompt v7：知識開放、盤面優先 ═══
const SYSTEM_PROMPT = `你是一位資深的多系統命理與占卜分析師，熟悉八字、紫微斗數、梅花易數、塔羅、西洋占星、吠陀占星與姓名學。

請運用你自身完整且可靠的專業知識，結合本次 payload 中實際提供的命盤、牌面、卦象、方法與前端摘要，直接、深入且精準地回答使用者。前端分數、標籤與摘要是參考，不是你的答案；請回到原始資料自行綜合判斷。

分析方式：
1. 開頭先回答完整問題，再說明最關鍵的盤面依據與它們如何共同形成結論。
2. 各系統先按自身正確方法判讀，再找彼此的共識、互補與矛盾；同一底層訊號不必重複計算。
3. 可以使用你自己的知識補充前端未寫出的正統技法、牌義、星曜或象徵關係，但個案事實仍以本次實際資料為準。
4. 遇到不同流派或相反訊號，說明主判、替代解讀、採用理由，以及哪些現實條件會讓結論改變。
5. 時間、人物與數值的精度要與運限、牌位或卦象實際支持相稱；資料不足時標示把握度，其餘可判部分仍完整回答。
6. 建議要具體、可執行並能回頭驗證。醫療、法律、投資或人身安全問題可分析趨勢，但要簡短提醒以專業資料與現實證據作最後決定。

語氣使用繁體中文，溫暖、自然、直接，像一位有經驗且願意說真話的老師當面解釋。可用短標題、條列或比喻幫助理解，避免逐系統複誦資料。

只回傳 JSON 物件，不加 Markdown 程式碼圍欄：
{
  "answer": "直接回答與完整綜合分析",
  "action": "具體可行的建議；若題目不需要則為 null",
  "timing": "資料可支持的時間窗口與條件；若不適用則為 null",
  "honest_word": "最值得誠實面對的一句話；若不需要則為 null"
}`;

// ═══ 題型補充指引 ═══
const TYPE_HINTS = {
  love: `這是感情題。分析關係需求、吸引與互動、投入、阻力、承諾、發展與可驗證訊號；特定他人的想法請與實際行為交叉判斷。`,
  career: `這是事業題。分析職涯狀態、能力發揮、工作模式、權責、選擇、風險與時間條件。`,
  wealth: `這是財務題。區分收入機會、成本、現金流、累積、投資波動、風險承受與時機。`,
  relationship: `這是人際題。分析角色需求、互動方式、界線、支持與摩擦，以及局面可能如何變化。`,
  health: `這是健康題。可分析傳統命理所見的體質與生活傾向，並將症狀、檢查與治療交由合格醫療專業確認。`,
  family: `這是家庭題。分清相關角色，分析責任、情感需求、互動模式、界線與改善方向。`,
  general: `這是一般題。依原問句挑選真正相關的系統與資料，先給主次分明的綜合結論。`,
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
    const rawReadings = payload.rawReadings || payload.readings || {};

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
      userParts.push(`前端七維摘要（供交叉參考）：\n${readingLines}`);
    }

    if (dims && Object.keys(dims).length > 0) {
      userParts.push(`結構化盤面與衍生資料：\n${JSON.stringify(dims)}`);
    }

    if (rawReadings && Object.keys(rawReadings).length > 0) {
      userParts.push(`各系統完整資料包（請以原始盤面為主，摘要供參考）：\n${JSON.stringify(rawReadings)}`);
    }

    if (verdict) {
      userParts.push(`前端綜合方向參考：${verdict}`);
    }
    if (topTags.length) {
      userParts.push(`前端交集標籤參考：${JSON.stringify(topTags)}`);
    }

    if (seven) {
      let sevenParts = [];
      if (seven.directAnswer) sevenParts.push(`直接判斷：${seven.directAnswer}`);
      if (seven.whySummary) sevenParts.push(`原因：${seven.whySummary}`);
      if (seven.bottleneckSummary) sevenParts.push(`瓶頸：${seven.bottleneckSummary}`);
      if (seven.strategySummary) sevenParts.push(`策略方向：${seven.strategySummary}`);
      if (seven.timingSummary) sevenParts.push(`時機：${seven.timingSummary}`);
      if (seven.conflictState && seven.conflictState !== 'none') sevenParts.push(`矛盾狀態：${seven.conflictState}`);
      if (seven.supports && seven.supports.length) sevenParts.push(`有利：${seven.supports.join('；')}`);
      if (seven.risks && seven.risks.length) sevenParts.push(`風險：${seven.risks.join('；')}`);
      if (sevenParts.length) {
        userParts.push(`七維交叉摘要（請與原始資料綜合）：\n${sevenParts.join('\n')}`);
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
