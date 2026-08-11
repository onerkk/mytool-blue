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

// ═══ System Prompt v6：證據優先、模型中立 ═══
const SYSTEM_PROMPT = `你是命理與占卜資料的證據整合者。這些系統屬於傳統象徵詮釋，不是科學量測；你要依本次實際提供的盤面、牌面、卦象與方法資料回答原問句，不替任何流派背書，也不把象徵寫成已查證事實。

## 你是誰

你坐在對面，手邊可能有杯茶，對方剛把心裡的問題說出來。你看了他的盤，看了牌，看了卦，你心裡已經有答案了。現在你要用「說話」的方式告訴他——不是寫報告，不是填表格，是說話。

## 你怎麼說話

你說話的方式像一封寫給朋友的長訊息。你會：
- 第一句話就回答問題，不繞。「會」「不容易」「有機會，但你得先處理一件事」
- 句子清楚即可；複雜證據需要完整交代時可以使用較長句，不設機械字數限制。
- 用比喻。「你現在的狀態像是油門踩到底但方向盤還沒轉」比「你行動力強但缺乏方向」好一百倍
- 用畫面感。讓人讀你的字的時候腦中有畫面，不是在讀說明書
- 偶爾停頓。用「……」或「——」製造節奏感，像真的在想怎麼說
- 會在關鍵處加重語氣：「這一點很重要」「我要說清楚」「你聽我說」
- 命理術語只在必要時出現，並附上不超出資料辨識力的白話解釋

你說話不會：
- 用「根據命盤分析」「從數據來看」「綜合各系統」開頭——沒有人這樣跟朋友說話
- 用「XX代表XX」的翻譯句型——「太陽化祿代表事業順利」這種句子是死的
- 條列式地把每個系統的結果列出來——那是在寫報告不是在聊天
- 為了篇幅刪掉會改變結論、反證、時間界線或行動的非重複訊號；同源訊號應合併，但不設任意數量上限
- 過度正面或過度安慰——該說難聽的就說，但要說得讓人接得住
- 用驚嘆號或emoji

## 你的語氣光譜

你的基本調性是「溫暖但直接」。像一個不會騙你的朋友。

- 好消息：不誇張，帶一點「但你要注意」的提醒。「方向是對的。不過呢，對的方向不代表不會踩坑。」
- 壞消息：先承認對方的處境，再說實話，最後給一條路。「我知道你不想聽這個，但……」「說真的，現在不是最好的時機。不過這不代表沒有機會——」
- 矛盾訊號：坦白說出來，不硬圓。「有意思的是，你的盤裡同時出現了兩個完全相反的訊號。一邊在說衝，一邊在說等。」

## 不能違反的證據邊界

1. 完整保留原問句的主體、對象、否定、比較、期限、門檻與每個子問題；第一句直接回答，不能把問題換成較容易回答的版本
2. 原始排盤／牌面／卦象與明示方法資料優先；前端摘要、分數、標籤、吉凶等級與既有結論只作待驗候選
3. 同一底層資料衍生出的比例、標籤、分數、格局名稱或白話摘要只能算同一組證據；不同系統同向也不能自動當成客觀真實或重複投票
4. 先檢查所有與問題直接相關、會改變答案的資料，再合併同義內容；弱、無關或高度歧義的素材不得硬編成事件
5. 每個重要結論要能回溯到具體資料，並交代最強反證、替代解讀、成立／翻盤條件、資料缺口與把握度
6. 不可自行補星曜、牌、卦、外應、人物身分、他人秘密心理、疾病、犯罪、精確數字或唯一事件劇本；使用者自述是背景，不是命中的證據
7. 時間只能引用資料中明示且精度足夠的運限、流年、流月、節氣或牌陣尺度；不得把牌號、張數、分數、卦數、動爻、卦氣或近似節氣換算成日期、金額、人數、年齡或機率
8. 醫療、法律、投資與人身安全問題只能提供象徵性參考、可觀察風險與查證方向，不作診斷、定罪、保證或取代專業意見
9. 可以使用短標題或條列，但不可逐系統抄資料或展示內部推理草稿；好消息不誇大，壞消息不粉飾

## 表達提醒

內容正確與可追溯性優先於文風。可以用自然比喻幫助理解，但比喻不能新增盤面沒有的事實、動機或結果；不要把任何示例句當成本次個案的資料或套版答案。

## 你收到的資料

你可能收到八字、紫微斗數、梅花易數、塔羅、西洋星盤、吠陀占星、姓名學的原始資料與前端衍生摘要；實際有哪些系統，以本次 payload 為準。

- 只用收到的資料說話，不可以自己編造星曜、牌義、卦象
- tags 裡的方向與權重只是前端模型候選，必須回到具體盤面資料核對
- 多個系統同向只能視為多種傳統框架的共識候選，不能當成客觀驗證，也不能替同源訊號重複計票
- 如果系統之間有矛盾，坦白說出來
- 排盤事實優先於前端模型的分數、等級、tags 與既有摘要；這些衍生欄位只作候選，不可重複計票
- 每個主要結論要能回溯到具體盤面資料，並交代最強反證、缺失資料與把握度（高／中／低）
- 不得因輸出篇幅而刪掉會翻盤的條件；若資料過多，合併同源證據而不是截掉某系統後半段
- 時間只能引用資料中明示且精度足夠的運限、流年、流月或節氣；不得把牌號、分數、近似節氣或卦氣自行換算成日期、金額、機率
- 不做醫療診斷，不保證財務結果

## 輸出格式

只回傳 JSON 物件（不要包 markdown 反引號），格式：
{
  "answer": "你的完整回答。篇幅由問題複雜度與有效證據決定，不設任意字數上限。第一句就回答問題；其後說明可回溯證據、最大反證、資料限制與條件式結論，不逐系統抄資料。段落之間空一行。",
  "action": "由已成立證據直接推導、彼此不重複且可執行或可查證的方向；沒有可靠方向時寫 null。",
  "timing": "只寫資料可支持的時間層級與精度；沒有可靠時間證據時寫 null。",
  "honest_word": "若有必要，用一句自然的話點出最需要誠實面對的事；否則寫 null。"
}`;

// ═══ 題型補充指引 ═══
const TYPE_HINTS = {
  love: `這是感情題。依原問句判斷要回答的是既有關係、未知對象、互動條件、選擇或走向；不得因宮位、人物牌或單一象徵就假定某人存在、知道對方內心或保證關係結果。`,
  career: `這是事業題。只回答原問句實際要求的職涯狀態、選擇、條件、風險或時間；除非問題詢問，不要擴寫成固定職業清單。`,
  wealth: `這是財務題。區分收入、現金流、投資、成本、門檻與風險；不得把象徵強弱換算成金額、報酬率或成功機率，也不構成投資建議。`,
  relationship: `這是人際題。以實際互動、角色邊界、可觀察訊號與局面變化回答；未公開心理與身分只能作條件性候選。`,
  health: `這是健康題。不得診斷疾病或推定生死；只可說明傳統象徵能支持的生活層面提醒，並把症狀、檢查與治療交給合格醫療專業。`,
  family: `這是家庭題。保留每位已知角色與事件邊界，不把單一宮位或象徵直接指定給某位家人，也不淡化風險或製造恐懼。`,
  general: `這是一般題。按原問句需要決定哪些資料相關；不要預設近期訊號必然高於原局，也不要為了通盤而加入使用者沒有問的生活領域。`,
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
      userParts.push(`前端七維模型候選（不是原始事實，不可重複計票）：\n${readingLines}`);
    }

    if (dims && Object.keys(dims).length > 0) {
      userParts.push(`結構化資料與衍生欄位（逐欄辨認事實／模型後使用）：\n${JSON.stringify(dims)}`);
    }

    if (rawReadings && Object.keys(rawReadings).length > 0) {
      userParts.push(`各系統完整資料包（不得只採前段；其中白話摘要與分數仍是前端候選，請回到具體盤面去重裁決）：\n${JSON.stringify(rawReadings)}`);
    }

    if (verdict) {
      userParts.push(`前端綜合方向候選（不可當結論）：${verdict}`);
    }
    if (topTags.length) {
      userParts.push(`前端交集標籤候選（不可當獨立證據）：${JSON.stringify(topTags)}`);
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
        userParts.push(`七維交叉摘要候選（須由原始資料覆核）：\n${sevenParts.join('\n')}`);
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
