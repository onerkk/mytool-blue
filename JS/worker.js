function getTodayString() { return new Date(Date.now() + 8 * 3600000).toISOString().slice(0, 10); }
function getCurrentYear() { return new Date(Date.now() + 8 * 3600000).getFullYear(); }

function safeString(v) { return v == null ? '' : String(v).trim(); }
function hashString(input) { let hash = 0; const s = safeString(input); for (let i = 0; i < s.length; i++) { hash = ((hash << 5) - hash) + s.charCodeAt(i); hash |= 0; } return String(Math.abs(hash)); }
function buildPersonSignature(payload) { const parts = [safeString(payload?.name), safeString(payload?.birth), safeString(payload?.gender)].filter(Boolean); if (!parts.length) return 'anon'; return 'sig_' + hashString(parts.join('|')); }

// ═══════════════════════════════════════════════════════════════
// 綠界 ECPay 金流工具
// ═══════════════════════════════════════════════════════════════

const ECPAY_MERCHANT_ID = '3493341';
const ECPAY_HASH_KEY = 'zvPmm1ChM42ScwuJ';
const ECPAY_HASH_IV = '4Kp6FhMTTyG4C32u';
const ECPAY_PAYMENT_URL = 'https://payment.ecpay.com.tw/Cashier/AioCheckOut/V5';
const PRICE_TAROT = 45;  // NT$45 塔羅快讀 (4500 tokens)
const PRICE_FULL = 45;   // NT$45 七維度深度 (4500 tokens)
const PRICE_OOTK = 45;   // NT$45 開鑰之法 (4500 tokens)
const PRICE_FOLLOWUP = 15; // NT$15 塔羅追問 (1500 tokens)

function generateTradeNo() {
  // 綠界要求: 英數字 20 碼內，不可重複
  const now = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return ('JY' + now + rand).substring(0, 20);
}

function formatECPayDate(d) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}/${pad(d.getMonth()+1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

async function generateCheckMacValue(params) {
  // 1. 按參數名稱排序
  const sorted = Object.keys(params).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
  // 2. 組成 key=value& 字串
  let raw = `HashKey=${ECPAY_HASH_KEY}`;
  for (const key of sorted) {
    raw += `&${key}=${params[key]}`;
  }
  raw += `&HashIV=${ECPAY_HASH_IV}`;
  // 3. URL encode (小寫)
  raw = encodeURIComponent(raw).toLowerCase();
  // 4. 特殊字元還原 (綠界規格)
  raw = raw.replace(/%2d/g, '-').replace(/%5f/g, '_').replace(/%2e/g, '.').replace(/%21/g, '!').replace(/%2a/g, '*').replace(/%28/g, '(').replace(/%29/g, ')').replace(/%20/g, '+');
  // 5. SHA256 → 大寫
  const hash = await sha256Hex(raw);
  return hash.toUpperCase();
}

async function sha256Hex(str) {
  const data = new TextEncoder().encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// 產生綠界付款表單 HTML（前端會收到這個 HTML 然後自動 submit）
async function buildECPayFormHTML(tradeNo, workerBaseUrl, amount, itemName) {
  const now = new Date(Date.now() + 8 * 3600000); // UTC+8
  const params = {
    MerchantID: ECPAY_MERCHANT_ID,
    MerchantTradeNo: tradeNo,
    MerchantTradeDate: formatECPayDate(now),
    PaymentType: 'aio',
    TotalAmount: String(amount),
    TradeDesc: encodeURIComponent('靜月之光AI深度解讀'),
    ItemName: itemName || 'AI深度命理解讀x1',
    ReturnURL: `${workerBaseUrl}/ecpay-notify`,
    OrderResultURL: `https://jingyue.uk?paid=${tradeNo}`,
    ChoosePayment: 'ALL',
    EncryptType: '1',
    ClientBackURL: 'https://jingyue.uk',
    NeedExtraPaidInfo: 'N',
  };
  params.CheckMacValue = await generateCheckMacValue(params);

  // 產生自動提交的 HTML form
  let formFields = '';
  for (const [key, val] of Object.entries(params)) {
    formFields += `<input type="hidden" name="${key}" value="${val}">`;
  }
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>前往付款...</title></head><body>
<form id="ecpay" method="POST" action="${ECPAY_PAYMENT_URL}">${formFields}</form>
<script>document.getElementById('ecpay').submit();</script>
</body></html>`;
}

// 解析 URL encoded form body（綠界回傳用）
function parseFormBody(text) {
  const params = {};
  for (const pair of text.split('&')) {
    const [k, ...v] = pair.split('=');
    if (k) params[decodeURIComponent(k)] = decodeURIComponent(v.join('='));
  }
  return params;
}


// ═══════════════════════════════════════════════════════════════
// callAI — Anthropic streaming API（防止 Cloudflare Worker timeout）
// 使用 stream:true 讓 Anthropic 即時回傳 SSE，Worker 邊收邊組裝
// ═══════════════════════════════════════════════════════════════
async function callAI(env, system, userMessage, maxTokens, temp, model, keepAlive) {
  const useModel = model || 'claude-haiku-4-5-20251001';
  const maxRetries = 2;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const resp = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: useModel,
          max_tokens: maxTokens,
          temperature: temp,
          system: system,
          stream: true,
          messages: [{ role: 'user', content: userMessage }]
        })
      });

      // Anthropic 過載或暫時不可用 → 等一下重試
      if ((resp.status === 529 || resp.status === 503) && attempt < maxRetries) {
        await new Promise(r => setTimeout(r, 2500 * (attempt + 1)));
        continue;
      }

      if (!resp.ok) {
        const e = await resp.text();
        throw new Error('Anthropic ' + resp.status + ': ' + e);
      }

      // ── 讀取 Anthropic SSE stream，組裝完整回應 ──
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let fullText = '';
      let usage = { input_tokens: 0, output_tokens: 0 };
      let chunkCount = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        // 解析 Anthropic SSE 事件
        const parts = buffer.split('\n\n');
        buffer = parts.pop(); // 最後一段可能不完整

        for (const block of parts) {
          if (!block.trim()) continue;
          const lines = block.split('\n');
          let eventType = '';
          let eventData = '';
          for (const line of lines) {
            if (line.startsWith('event: ')) eventType = line.slice(7).trim();
            else if (line.startsWith('data: ')) eventData += line.slice(6);
          }

          if (eventType === 'content_block_delta' && eventData) {
            try {
              const delta = JSON.parse(eventData);
              if (delta.delta?.text) fullText += delta.delta.text;
            } catch (_) {}
          } else if (eventType === 'message_delta' && eventData) {
            try {
              const md = JSON.parse(eventData);
              if (md.usage) {
                usage.output_tokens = md.usage.output_tokens || usage.output_tokens;
              }
            } catch (_) {}
          } else if (eventType === 'message_start' && eventData) {
            try {
              const ms = JSON.parse(eventData);
              if (ms.message?.usage) {
                usage.input_tokens = ms.message.usage.input_tokens || 0;
              }
            } catch (_) {}
          }

          // 每 20 個 chunk 送一次 keepalive，防止前端 SSE 連線 idle timeout
          chunkCount++;
          if (keepAlive && chunkCount % 20 === 0) {
            try { await keepAlive(); } catch (_) {}
          }
        }
      }

      return { text: fullText, usage };

    } catch (err) {
      // 5xx 類 → 重試
      if (attempt < maxRetries && (/5\d\d/.test(err.message) || err.name === 'AbortError')) {
        await new Promise(r => setTimeout(r, 2500 * (attempt + 1)));
        continue;
      }
      throw err;
    }
  }
}

function _fixJsonStringNewlines(s) {
  var result = '', inStr = false, esc = false;
  for (var i = 0; i < s.length; i++) {
    var ch = s[i];
    if (esc) { result += ch; esc = false; continue; }
    if (ch === '\\' && inStr) { result += ch; esc = true; continue; }
    if (ch === '"') { inStr = !inStr; result += ch; continue; }
    if (inStr) {
      if (ch === '\n') { result += '\\n'; continue; }
      if (ch === '\r') { result += '\\r'; continue; }
      if (ch === '\t') { result += '\\t'; continue; }
    }
    result += ch;
  }
  return result;
}

function parseJSON(raw) {
  let c = String(raw || '').trim();
  if (!c) return {};
  if (c.startsWith('```')) c = c.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
  try { return JSON.parse(c); } catch(_) {}
  const first = c.indexOf('{');
  const last = c.lastIndexOf('}');
  if (first !== -1 && last > first) {
    let extracted = c.slice(first, last + 1);
    try { return JSON.parse(extracted); } catch(_) {}
    let fixed = extracted.replace(/,\s*([\]}])/g, '$1');
    fixed = _fixJsonStringNewlines(fixed);
    try { return JSON.parse(fixed); } catch(_) {}
  }
  return { answer: c };
}

function toArray(v) {
  if (Array.isArray(v)) return v.filter(Boolean);
  if (v == null || v === '') return [];
  return [v];
}

function renderValue(v) {
  if (v == null || v === '') return '';
  if (typeof v === 'string') return v.trim();
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  if (Array.isArray(v)) return v.map(renderValue).filter(Boolean).join('；');
  if (typeof v === 'object') {
    return Object.entries(v)
      .filter(([, value]) => value != null && value !== '' && !(Array.isArray(value) && !value.length))
      .map(([k, value]) => `${k}: ${renderValue(value)}`)
      .join('；');
  }
  return String(v);
}

// ★ v13：renderSystemPayload / addSection / addListSection 已移除（死碼，無人呼叫）

function detectFocusType(question) {
  const q = safeString(question);
  if (/曖昧|復合|感情|喜歡|桃花|對象|交往|第三者|出軌|前任|婚姻|同居|戀|暗戀|追|正緣|分手|男友|女友|老公|老婆|另一半|love|relationship|partner|boyfriend|girlfriend|marriage|crush/i.test(q)) return 'love';
  if (/工作|事業|升遷|轉職|主管|同事|離職|創業|合作|面試|公司|職場|上班|career|job|promotion|business|work/i.test(q)) return 'career';
  if (/財運|收入|投資|賺錢|副業|金錢|現金流|股票|基金|理財|開店|money|wealth|invest|income|finance/i.test(q)) return 'wealth';
  if (/家庭|父母|小孩|親人|家人|親子|婆媳|family|parents|children/i.test(q)) return 'family';
  if (/健康|身體|情緒|失眠|壓力|焦慮|疲累|生病|手術|health|anxiety|stress|sleep/i.test(q)) return 'health';
  if (/人際|朋友|社交|貴人|小人|friends|social/i.test(q)) return 'relationship';
  return 'general';
}


function formatQuestionDecomposition(qd) {
  if (!qd || typeof qd !== 'object') return '（無法拆解，後續請依原問題自行逐題辨識）';
  const lines = [];
  if (qd.topic) lines.push('topic: ' + qd.topic);
  if (qd.surface_question) lines.push('surface_question: ' + qd.surface_question);
  if (qd.core_need) lines.push('core_need: ' + qd.core_need);
  const subs = Array.isArray(qd.subquestions) ? qd.subquestions : [];
  if (subs.length) {
    lines.push('subquestions:');
    subs.forEach((sq, idx) => {
      const q = safeString(sq.question) || `子題${idx + 1}`;
      const type = safeString(sq.type) || '未分類';
      const pri = sq.priority != null ? `priority=${sq.priority}` : '';
      const primary = sq.is_primary ? 'primary' : 'secondary';
      const need = safeString(sq.implicit_need);
      lines.push(`- ${(sq.id || ('q' + (idx + 1)))}｜${q}｜${type}｜${primary}${pri ? '｜' + pri : ''}${need ? '｜implicit_need=' + need : ''}`);
    });
  }
  if (Array.isArray(qd.answer_strategy) && qd.answer_strategy.length) {
    lines.push('answer_strategy:');
    qd.answer_strategy.forEach(s => lines.push('- ' + renderValue(s)));
  }
  return lines.join('\n');
}

function buildUserMessage(p, questionPlan, autoPassPlan) {
  const lines = [];
  const ftMap = { love:'感情', career:'事業', wealth:'財運', health:'健康', relationship:'人際關係', family:'家庭', general:'整體運勢' };
  // ★ #22 修復：優先用前端用戶手選的 focusType，fallback 才用 regex 偵測
  const ftKey = (p.focusType && p.focusType !== 'general' && ftMap[p.focusType]) ? p.focusType : detectFocusType(p.question);
  const ft = ftMap[ftKey] || '整體運勢';
  // ★ v14：p.readings 在 v2 wrapper 中已 delete 並移至 rawReadings，不再宣告死碼 r

  lines.push('問題：「' + safeString(p.question) + '」（' + ft + '）');
  lines.push('今天日期：' + getTodayString() + '（西元' + getCurrentYear() + '年）');
  if (p.birth) {
    var birthYear = parseInt(String(p.birth).split('-')[0]);
    var userAge = birthYear ? (getCurrentYear() - birthYear) : null;
    lines.push('出生：' + p.birth + (p.birthTime ? ' ' + p.birthTime : '') + (userAge ? '（今年' + userAge + '歲）' : ''));
    if (p.btimeUnknown) lines.push('⚠ 出生時辰不確定——八字時柱、紫微命宮可能有偏差，判斷以大運流年和其他系統為主。');
  }
  if (p.gender) lines.push('性別：' + p.gender);
  else lines.push('（用戶未提供性別，請用「你」稱呼，避免先生/小姐、他/她等性別化詞彙）');
  if (p.name) lines.push('姓名：' + p.name);
  lines.push('');

  if (questionPlan) {
    lines.push('【問題拆解】');
    lines.push(formatQuestionDecomposition(questionPlan));
    lines.push('');
  }

  // Fix #10: 把複雜度分析結果告訴 AI，讓它調整深度
  if (autoPassPlan) {
    const af = autoPassPlan.flags || {};
    const hints = [];
    if (af.involves_other) hints.push('涉及他人互動→需講清對方畫像');
    if (af.asks_motive) hints.push('需判斷對方動機');
    if (af.asks_timeline) hints.push('需推時間');
    if (af.asks_decision_path) hints.push('需給具體路徑建議');
    if (af.conflicts >= 2) hints.push('系統間矛盾明顯→需解釋為什麼矛盾');
    if (af.asks_risk_or_verify) hints.push('需講風險和驗證點');
    if (hints.length) {
      lines.push('【這題的重點】' + hints.join('；'));
      lines.push('');
    }
  }

  // ═══ 核心改動：每個系統只送一次數據，優先送 readings（前端已整理好的白話文） ═══
  // 不再同時送 readings + systems + symbolicEvidence + crossSummary 重複數據

  // ═══ 交叉觀察（前置摘要——讓 AI 先看到全局輪廓，再讀細節）═══
  // 這不是結論，是從數據裡提取的觀察事實，AI 自己決定怎麼用
  const crossObs = [];
  try {
    const rr = p.rawReadings || {};
    // 觀察1：多系統身強/身弱方向
    if (rr.bazi && rr.vedic) {
      const baziStrong = /身強/.test(rr.bazi);
      const baziWeak = /身弱/.test(rr.bazi);
      const vedicWeak = /虛弱|偏弱|不足/.test(rr.vedic);
      const vedicStrong = /極強|偏強|足夠/.test(rr.vedic);
      if (baziWeak && vedicWeak) crossObs.push('觀察：八字和吠陀都顯示先天能量偏弱');
      if (baziStrong && vedicStrong) crossObs.push('觀察：八字和吠陀都顯示先天能量充足');
      if ((baziStrong && vedicWeak) || (baziWeak && vedicStrong)) crossObs.push('觀察：八字和吠陀對先天能量的判斷不一致，需要看其他系統來裁決');
    }
    // 觀察2：大運/流年方向
    if (rr.bazi) {
      const dyGood = /大運.*[吉好]|運勢很好|運勢不錯/.test(rr.bazi);
      const dyBad = /大運.*[凶差]|運勢差|運勢偏弱/.test(rr.bazi);
      const lnGood = rr.bazi.indexOf('今年') >= 0 && /今年.*[吉好]/.test(rr.bazi);
      const lnBad = rr.bazi.indexOf('今年') >= 0 && /今年.*[凶差壓力]/.test(rr.bazi);
      if (dyGood && lnBad) crossObs.push('觀察：大運整體好但今年流年不利——大方向對但今年要小心');
      if (dyBad && lnGood) crossObs.push('觀察：大運整體差但今年流年有利——趁今年窗口把握機會');
    }
    // 觀察3：梅花體用 + 塔羅結果方向
    if (rr.meihua && rr.tarot) {
      const mhGood = /大吉|吉|用生體/.test(rr.meihua);
      const mhBad = /凶|用克體|體生用/.test(rr.meihua);
      const tarotOutGood = rr.tarot.indexOf('最終結果') >= 0 && /結果.*順/.test(rr.tarot);
      const tarotOutBad = rr.tarot.indexOf('最終結果') >= 0 && /結果.*逆/.test(rr.tarot);
      if (mhGood && tarotOutGood) crossObs.push('觀察：梅花和塔羅都指向正面結果');
      if (mhBad && tarotOutBad) crossObs.push('觀察：梅花和塔羅都指向阻礙——兩個即時系統同向，短期壓力明確');
      if ((mhGood && tarotOutBad) || (mhBad && tarotOutGood)) crossObs.push('觀察：梅花和塔羅方向矛盾——事情有變數，需要看條件');
    }
  } catch(e){}
  if (crossObs.length) {
    lines.push('【跨系統觀察（AI 參考用，不是結論）】');
    crossObs.forEach(o => lines.push(o));
    lines.push('');
  }

  // ═══ 統一時間軸（多系統時間線索集中呈現）═══
  if (p.timeline && p.timeline.length) {
    lines.push('【時間軸】');
    p.timeline.forEach(tl => lines.push(tl));
    lines.push('');
  }

  // ═══ 對方畫像線索（感情/人際題）═══
  if (p.otherPersonProfile && p.otherPersonProfile.length) {
    lines.push('【對方畫像線索（從命盤推斷）】');
    p.otherPersonProfile.forEach(op => lines.push(op));
    lines.push('');
  }

  // Fix #6: 告訴 AI 以下是工作數據，不要在回答裡使用專業術語
  lines.push('───以下是你的工作數據，裡面的專業名詞（日主、身弱、十神、化忌、Dasha 等）是給你看的，回答時全部翻成白話，一個術語都不能出現在你說的話裡。───');
  lines.push('');
  const systems = [
    { key: 'bazi', name: '八字' },
    { key: 'ziwei', name: '紫微斗數' },
    { key: 'meihua', name: '梅花易數' },
    { key: 'tarot', name: '塔羅' },
    { key: 'natal', name: '西洋星盤' },
    { key: 'vedic', name: '吠陀占星' },
    { key: 'name', name: '姓名學' },
  ];

  // 不截斷單系統資料 — AI 需要完整數據才能做交叉判斷
  // 總量由 MAX_MSG_CHARS (50000) 在外層控制

  for (const sys of systems) {
    // ★ v14：rawReadings 是唯一來源（v2 wrapper 把 readings 移過來了），移除死碼 r 分支
    let txt = '';
    if (p.rawReadings && p.rawReadings[sys.key]) {
      txt = safeString(p.rawReadings[sys.key]);
    }
    // vedic fallback：前端可能用 'jyotish' 作 key
    if (!txt && sys.key === 'vedic') {
      if (p.rawReadings && p.rawReadings.jyotish) txt = safeString(p.rawReadings.jyotish);
    }

    if (!txt || txt.length < 20) continue;

    // 清理 v2 填充殘留：砍掉 【系統摘要】【原始判讀重述】【長度補齊】【補齊片段】【欄位重點重列】【來源資料重列】【系統載荷重列】等重複段
    txt = txt.replace(/\n*【(?:系統摘要|原始判讀重述|摘要重述|長度補齊|補齊片段|欄位重點重列|來源資料重列|系統載荷重列|結構欄位展開|來源資料 JSON|系統載荷 JSON)】[\s\S]*?(?=\n【|$)/g, '');
    // 砍掉 【系統角色】（v4 加的固定文字）
    txt = txt.replace(/【系統角色】[\s\S]*?(?=\n【|$)/g, '');
    txt = txt.trim();

    // 如果清理後有 【原始判讀】 標題，去掉標題只保留內容
    txt = txt.replace(/^【原始判讀】\n?/, '');
    txt = txt.trim();

    // ★ v14 修復：梅花去重——dims.meihua 只要有結構化數據就截斷 readings（之前 >= 3 太鬆）
    if (sys.key === 'meihua' && p.dims && p.dims.meihua && Object.keys(p.dims.meihua).length >= 1) {
      if (txt.length > 600) txt = txt.slice(0, 600) + '\n…（結構化數據在【梅花深層】）';
    }

    if (txt.length >= 20) {
      lines.push(`【${sys.name}】`);
      lines.push(txt);
      lines.push('');
    }
  }

  // ═══ 大運・流年（推時間的關鍵數據） ═══
  if (p.dims && p.dims.bazi) {
    const bz = p.dims.bazi;
    const bzLines = [];
    if (bz.dyDetail) bzLines.push('當前大運：' + renderValue(bz.dyDetail));
    if (bz.lnDetail) bzLines.push('今年流年：' + renderValue(bz.lnDetail));
    if (bz.lnNext) bzLines.push('明年流年：' + renderValue(bz.lnNext));
    if (bz.strongPercent != null) bzLines.push('身強比例：' + bz.strongPercent + '%');
    if (bzLines.length) {
      lines.push('【大運流年】');
      bzLines.forEach(l => lines.push(l));
      lines.push('');
    }
  }

  // ═══ 紫微四化 ═══
  if (p.dims && p.dims.ziwei && p.dims.ziwei.sihua && p.dims.ziwei.sihua.length) {
    lines.push('【紫微四化】' + p.dims.ziwei.sihua.join('、'));
    if (p.dims.ziwei.gongHua && p.dims.ziwei.gongHua.length) {
      lines.push('宮干四化：' + p.dims.ziwei.gongHua.join('、'));
    }
    lines.push('');
  }

  // ═══ 梅花深層（互卦・變卦・時機・風險） ═══
  if (p.dims && p.dims.meihua) {
    const mhd = p.dims.meihua;
    const mhLines = [];
    // Fix #9: 體用、動爻、旺衰
    if (mhd.tiYong) mhLines.push('體用：' + renderValue(mhd.tiYong));
    if (mhd.dongYao) mhLines.push('動爻：' + renderValue(mhd.dongYao));
    if (mhd.tiStrength) mhLines.push('體卦旺衰：' + renderValue(mhd.tiStrength));
    if (mhd.yongStrength) mhLines.push('用卦旺衰：' + renderValue(mhd.yongStrength));
    if (mhd.huGua) mhLines.push('互卦：' + renderValue(mhd.huGua));
    if (mhd.huHidden) mhLines.push('互卦隱象：' + renderValue(mhd.huHidden));
    if (mhd.bianGua) mhLines.push('變卦：' + renderValue(mhd.bianGua));
    if (mhd.bianTrend) mhLines.push('變卦走向：' + renderValue(mhd.bianTrend));
    if (mhd.timing) mhLines.push('梅花時機：' + renderValue(mhd.timing));
    if (mhd.timingNote) mhLines.push('時機備註：' + renderValue(mhd.timingNote));
    if (mhd.risk) mhLines.push('梅花風險：' + renderValue(mhd.risk));
    if (mhd.actionAdvice && mhd.actionAdvice.length) mhLines.push('梅花行動：' + toArray(mhd.actionAdvice).join('、'));
    if (mhd.signals && mhd.signals.length) mhLines.push('梅花訊號：' + toArray(mhd.signals).slice(0, 5).map(renderValue).join('、'));
    if (mhLines.length) {
      lines.push('【梅花深層】');
      mhLines.forEach(l => lines.push(l));
      lines.push('');
    }
  }

  // ═══ 梅花敘事（情境→張力→趨勢→行動；timing/risk 在【梅花深層】已送） ═══
  if (p.meihuaNarrative) {
    const mn = p.meihuaNarrative;
    const mnLines = [];
    if (mn.situation) mnLines.push('現況：' + renderValue(mn.situation));
    if (mn.coreTension) mnLines.push('核心張力：' + renderValue(mn.coreTension));
    if (mn.trend) mnLines.push('趨勢：' + renderValue(mn.trend));
    if (mn.action) mnLines.push('行動：' + renderValue(mn.action));
    if (mnLines.length) {
      lines.push('【梅花敘事】');
      mnLines.forEach(l => lines.push(l));
      lines.push('');
    }
  }

  // ═══ 塔羅結構分析（元素・數字・比例） ═══
  if (p.dims && p.dims.tarot) {
    const td = p.dims.tarot;
    const tdLines = [];
    if (td.elementSummary) tdLines.push(renderValue(td.elementSummary));
    if (td.numerology) tdLines.push('數字學：' + renderValue(td.numerology));
    if (tdLines.length) {
      lines.push('【塔羅結構】' + tdLines.join('；'));
      lines.push('');
    }
  }

  // ═══ 西洋占星結構化（行星落點・相位・格局・行運・小限） ═══
  if (p.dims && p.dims.natal) {
    const nd = p.dims.natal;
    const ndLines = [];
    if (nd.asc) ndLines.push('上升：' + nd.asc);
    if (nd.mc) ndLines.push('MC：' + nd.mc);
    if (nd.planets) ndLines.push(nd.planets);
    if (nd.aspects) ndLines.push('主要相位：' + nd.aspects);
    if (nd.patterns) ndLines.push('相位格局：' + nd.patterns);
    if (nd.dignity) ndLines.push('行星品質：' + nd.dignity);
    if (nd.transits) ndLines.push('外行星行運：' + nd.transits);
    if (nd.profection) ndLines.push('小限：' + nd.profection);
    if (ndLines.length) {
      lines.push('【西洋星盤結構】');
      ndLines.forEach(l => lines.push(l));
      lines.push('');
    }
  }

  // ═══ 吠陀占星結構化（Dasha週期・Yoga・Sade Sati・行星落宮） ═══
  if (p.dims && p.dims.vedic) {
    const vd = p.dims.vedic;
    const vdLines = [];
    if (vd.lagna) vdLines.push('上升：' + vd.lagna);
    if (vd.moon) vdLines.push('月亮：' + vd.moon);
    if (vd.planets) vdLines.push('行星落宮：' + vd.planets);
    if (vd.dasha) vdLines.push('當前大週期：' + vd.dasha + (vd.dashaEnd ? '（結束於' + vd.dashaEnd + '）' : ''));
    if (vd.subDasha) vdLines.push('當前副週期：' + vd.subDasha + (vd.subDashaEnd ? '（結束於' + vd.subDashaEnd + '）' : ''));
    if (vd.sadeSati) vdLines.push('土星考驗期：' + vd.sadeSati);
    if (vd.yogas) vdLines.push('特殊格局：' + vd.yogas);
    if (vd.ashtakavargaTotal != null) vdLines.push('整體力量指數：' + vd.ashtakavargaTotal);
    if (vdLines.length) {
      lines.push('【吠陀占星結構】');
      vdLines.forEach(l => lines.push(l));
      lines.push('');
    }
  }

  // ═══ 矛盾信號（帶具體描述）——讓 AI 知道系統間不一致的地方 ═══
  if (p.conflictDescriptions && p.conflictDescriptions.length) {
    lines.push('【系統間矛盾】');
    p.conflictDescriptions.slice(0, 8).forEach(function(cd) { lines.push(cd); });
    lines.push('注意：矛盾不代表判斷失效。你需要把正反兩面都講給他聽，告訴他為什麼會矛盾，以及在什麼條件下會偏向哪一邊。');
    lines.push('');
  } else if (p.conflicts && p.conflicts.length) {
    lines.push('【系統間矛盾】');
    p.conflicts.slice(0, 8).forEach(function(c) { lines.push('- ' + renderValue(c)); });
    lines.push('');
  }

  // ═══ 語義碼跨系統共振（多系統用不同方法看到同一個信號） ═══
  if (p.semanticResonance && p.semanticResonance.length) {
    lines.push('【跨系統共振（高可信度信號）】');
    p.semanticResonance.slice(0, 6).forEach(function(sr) { lines.push(sr); });
    lines.push('');
  }

  // ═══ 深挖框架（按題型切入角度） ═══
  if (p.caseFramework) {
    const cf = p.caseFramework;
    const cfLines = [];
    if (cf.domain) cfLines.push('題型：' + cf.domain);
    if (cf.deep_checks && cf.deep_checks.length) cfLines.push('可切入角度：' + cf.deep_checks.join('、'));
    if (cfLines.length) {
      lines.push('【深挖框架】');
      cfLines.forEach(l => lines.push(l));
      lines.push('');
    }
  }

  // ═══ 水晶商品清單（AI 只能從這裡面推薦） ═══
  if (p.crystalCatalog && p.crystalCatalog.length) {
    lines.push('【水晶商品清單】');
    if (p.crystalFavEl) lines.push('此人喜用神五行：' + p.crystalFavEl + '（只推薦這些五行的水晶）');
    p.crystalCatalog.forEach(c => lines.push(c));
    lines.push('crystalRec 只能填上面清單裡的水晶名稱（｜前面那段），不要自己編。');
    lines.push('');
  }

  return lines.join('\n');
}


function collectCaseMatrix(payload) {
  const cross = payload?.crossSummary || payload?.consensus || payload?.crossSystem || {};
  const matrix = cross.caseMatrix || payload?.crossSystem?.caseMatrix || {};
  return matrix && typeof matrix === 'object' ? matrix : {};
}

function buildEvidenceHealth(payload) {
  const matrix = collectCaseMatrix(payload);
  const symbol = payload?.symbolicEvidence || {};
  const systems = ['bazi','ziwei','meihua','tarot','natal','vedic','name'];
  let richSystems = 0;
  let signalCount = 0;
  systems.forEach((k) => {
    const row = symbol?.[k] || {};
    const n = countArray(row.supports) + countArray(row.risks) + countArray(row.variables) + countArray(row.timing);
    signalCount += n;
    if (n >= 6) richSystems += 1;
  });
  return {
    richSystems,
    signalCount,
    evidenceDepth: Number(matrix.evidenceDepthScore || 0),
    avgAmbiguity: Number(matrix.avgAmbiguity || 0),
    avgDirectness: Number(matrix.avgDirectness || 0),
    topEssence: countArray(matrix.topEssence),
    topMotives: countArray(matrix.topMotives),
    topObstacles: countArray(matrix.topObstacles),
    contradictions: countArray(matrix.contradictions)
  };
}

// ★ v13：formatCaseMatrix 已移除（死碼，無人呼叫）


function countArray(v) {
  return Array.isArray(v) ? v.length : 0;
}

function buildAutoPassPlan(payload, questionPlan) {
  const subs = Array.isArray(questionPlan?.subquestions) ? questionPlan.subquestions : [];
  const q = safeString(payload?.question);
  const cross = payload?.crossSummary || payload?.consensus || {};
  const matrix = collectCaseMatrix(payload);
  const health = buildEvidenceHealth(payload);
  const conflicts = countArray(payload?.conflicts) + countArray(cross.conflict_pairs) + countArray(matrix.contradictions);
  const mainN = countArray(cross.main_symbols) + countArray(matrix.topEssence);
  const riskN = countArray(cross.risk_symbols) + countArray(matrix.topObstacles);
  const varN = countArray(cross.variable_symbols);
  const tagsN = countArray(payload?.tags);
  const systemCount = ['bazi','ziwei','meihua','tarot','natal','vedic','name'].reduce((n, k) => n + ((payload?.readings?.[k] || payload?.systems?.[k] || (k === 'vedic' && payload?.systems?.jyotish)) ? 1 : 0), 0);
  const involvesOther = /他|她|對方|前任|主管|同事|合作|客戶|家人|父母|另一半|曖昧|桃花|感情|婚姻|同居|復合/.test(q);
  const asksMotive = /心態|想法|動機|目的|為什麼靠近|圖什麼|真心|試探|觀望|是不是喜歡|要什麼/.test(q);
  const asksTimeline = /何時|多久|幾月|什麼時候|下半年|上半年|今年|明年|時間|節奏/.test(q);
  const asksDecisionPath = /怎麼做|要不要|該不該|是否適合|會怎麼走|結果如何|能不能成/.test(q);
  const asksMulti = /？.*？|、|還是|以及|並且|跟.*有關/.test(q) || subs.length >= 3;
  const asksRiskOrVerify = /風險|阻力|代價|要注意|驗證|怎麼看|是不是真的/.test(q);

  let score = 0;
  score += Math.max(0, subs.length - 1) * 2.1;
  score += Math.min(conflicts, 5) * 1.5;
  score += Math.min(varN, 4) * 0.9;
  score += Math.min(riskN, 6) * 0.45;
  score += Math.min(health.richSystems, 7) * 0.45;
  score += Math.min(health.evidenceDepth / 22, 3.8);
  if (involvesOther) score += 1.3;
  if (asksMotive) score += 3.0;
  if (asksTimeline) score += 1.1;
  if (asksDecisionPath) score += 1.4;
  if (asksRiskOrVerify) score += 0.8;
  if (health.avgAmbiguity >= 46) score += 1.2;
  if (health.avgDirectness >= 58 && health.topEssence >= 3) score += 0.7;
  if (systemCount >= 6) score += 0.8;
  if (tagsN >= 10) score += 0.5;
  if (q.length >= 28) score += 0.6;
  if (mainN >= 5 && conflicts >= 2) score += 1.0;

  const isSimple = (
    subs.length <= 1 &&
    !involvesOther &&
    !asksMotive &&
    !asksTimeline &&
    !asksMulti &&
    conflicts <= 1 &&
    health.topEssence >= 1 &&
    health.avgDirectness >= 42 &&
    systemCount >= 4
  );

  const passes = isSimple ? 1 : 2;
  const reasons = [];
  if (passes === 1) {
    reasons.push('題型相對單純');
    if (health.topEssence >= 1) reasons.push('主線重疊明確');
    if (health.avgDirectness >= 42) reasons.push('多系統方向足夠直接');
  } else {
    if (subs.length >= 2) reasons.push('子問題不只一個');
    if (involvesOther) reasons.push('涉及他人互動');
    if (asksMotive) reasons.push('需要判斷對方或他方動機');
    if (asksTimeline) reasons.push('需要時間與路徑拆解');
    if (asksDecisionPath) reasons.push('需要回答怎麼走與如何做');
    if (conflicts >= 2) reasons.push('跨系統矛盾明顯');
    if (health.richSystems >= 5) reasons.push('七維證據層夠深');
    if (health.avgAmbiguity >= 46) reasons.push('案件存在模糊帶');
  }
  if (!reasons.length) reasons.push('一般問題');

  return {
    passes,
    complexity_score: Math.round(score * 10) / 10,
    mode: passes === 1 ? 'lite' : 'deep',
    reasons,
    thresholds: { simple_max_conflicts: 1 },
    flags: {
      involves_other: involvesOther,
      asks_motive: asksMotive,
      asks_timeline: asksTimeline,
      asks_decision_path: asksDecisionPath,
      asks_multi: asksMulti,
      asks_risk_or_verify: asksRiskOrVerify,
      conflicts,
      variables: varN,
      systems: systemCount,
      rich_systems: health.richSystems,
      evidence_depth: health.evidenceDepth,
      avg_ambiguity: health.avgAmbiguity,
      avg_directness: health.avgDirectness,
      top_essence_overlap: health.topEssence,
      top_motive_overlap: health.topMotives,
      top_obstacle_overlap: health.topObstacles
    }
  };
}

// ★ v13：shortEvidenceList 已移除（死碼，無人呼叫）

function buildLocalQuestionPlan(payload) {
  const q = safeString(payload?.question);
  // Fix #11: 先用問號句號斷句
  let parts = q.split(/[？?。]/).map(s => s.trim()).filter(Boolean);
  // 如果只有一段但包含逗號/頓號分隔的多個子問題，再拆
  if (parts.length <= 1) {
    // 偵測「還是」二擇一
    if (/還是/.test(q)) {
      parts = [q]; // 整句保留，但標記為決策題
    } else {
      // 用逗號拆，但每段至少5字才算獨立子問題
      const commaParts = q.split(/[，,、]/).map(s => s.trim()).filter(s => s.length >= 5);
      // 檢查每段是否看起來像獨立問題（含動詞或疑問詞）
      const qWords = /怎麼|什麼|幾|嗎|呢|到底|有沒有|是不是|能不能|要不要|該不該|何時|多久|會不會|適不適合/;
      const validParts = commaParts.filter(s => qWords.test(s));
      if (validParts.length >= 2) parts = validParts;
    }
  }

  const subquestions = [];
  if (parts.length >= 2) {
    parts.slice(0, 5).forEach((part, i) => {
      subquestions.push({ id: 'q' + (i + 1), question: part, type: '綜合判定', priority: i + 1, is_primary: i === 0, implicit_need: '' });
    });
  } else {
    subquestions.push({ id: 'q1', question: q, type: '綜合判定', priority: 1, is_primary: true, implicit_need: '' });
  }
  return {
    topic: detectFocusType(payload?.question || ''),
    surface_question: q,
    core_need: '想知道這件事真正怎麼看，並得到直接可用的判斷',
    subquestions,
    answer_strategy: ['先直答主要問題，再說原因與變數，最後補驗證點']
  };
}



// ═══════════════════════════════════════════════════════════════
// DIRECT_PROMPT — 靜月・七維度深度解讀
// ═══════════════════════════════════════════════════════════════

// DIRECT_PROMPT — 靜月・七維度深度解讀
// ═══════════════════════════════════════════════════════════════

const DIRECT_PROMPT = `你是靜月，一個整合七套命理系統的深度分析師。

═══ 核心邏輯：每套系統先各自講完自己的故事，再找交集重組新故事 ═══

你手上有七套系統。每一套都能獨立組成一段完整的故事——有前因、有現況、有走向、有變數。你的工作分三步：

【第一步：讓每套系統各自說完自己的完整故事】

每套系統都要獨立回答這四個問題：①這件事的本質是什麼 ②現在處在什麼階段 ③接下來會怎麼走 ④變數在哪裡

・八字的故事：先天格局（身強弱＝他天生能扛多少、格局類型＝他適合怎樣的人生路線、十神結構＝他身邊什麼類型的人/能量最多）→ 時運節奏（大運走到哪＝現在是上坡還是下坡、流年好壞＝今年的底色、流月拐點＝哪幾個月是關鍵）→ 前後大運對比＝運勢正在變好還是變差 → 喜忌＝他需要什麼、應該避開什麼

・紫微的故事：命宮主星＝他是什麼類型的人（性格核心）→ 跟問題相關的宮位裡有什麼星＝那個面向的先天條件好不好 → 那個宮位有沒有煞星壓力、有沒有吉星加持 → 四化飛到哪裡＝機會（祿）和卡點（忌）具體落在生活的哪個面向 → 大限走到哪＝這十年的主題 → 流年走到哪＝今年的重點

・梅花的故事：體用關係＝這件事裡誰是主動方誰是被動方、力量誰強誰弱 → 動爻＝事情發展到什麼階段（初爻＝剛開始、上爻＝尾聲）→ 互卦＝過程中會出現的隱藏因素 → 變卦＝事情最終會變成什麼樣子 → 應期＝多快會看到結果

・塔羅的故事：核心十字（1+2）＝現況被什麼力量影響 → 根因（3）＝為什麼會走到這步 → 時間軸（4→1→6）＝從過去到近期未來的走勢 → 內外對照（7vs8）＝他自己的狀態跟外界是同步還是拉扯 → 結局軸（9+10）＝希望恐懼怎麼影響結果 → 整體元素和大牌分佈＝整件事的能量基調

・西洋星盤的故事：行星落宮＝他在各個生活面向的天生傾向 → 跟問題相關的宮位有什麼行星＝那個面向的能量配置 → 相位格局＝哪些能量在合作、哪些在衝突 → 行運（外行星現在過哪些宮）＝大環境現在在推他往哪走 → 小限＝今年的主題

・吠陀的故事：上升+月亮星宿＝他的靈魂底色和情緒模式 → 主運（Dasha）＝現在人生大階段的底色 → 副運（Antardasha）＝最近這段時間的具體節奏 → 副運結束時間＝下一個轉折點 → Yoga格局＝有沒有特殊的命格加持或壓力 → Sade Sati＝土星壓力期有沒有在作用

・姓名學的故事：五格五行跟命格是配合還是拖累 → 三才配置順不順＝基礎運勢有沒有被名字拉住 → 如果名字五行剛好是忌神，那代表名字本身在給他製造阻力

【第二步：七段故事放在一起，找交集、分歧、變數】

・高度重疊（三套以上講同一件事）→ 幾乎是定論，判斷果斷
・兩套看到同一件事但角度不同 → 互相補充，拼出更完整的畫面
・系統之間打架（有的說好有的說壞）→ 這就是變數——要講清楚「在什麼條件下偏向好的那邊、在什麼條件下偏向壞的那邊」
・只有一套看到的獨特訊號 → 不當主線但不能忽略，它可能是其他系統看不到的盲區

【第三步：用交集的結果重新組成一個新的、完整的故事】

這個新故事不是七段的拼接——是透過底層邏輯重新組合出來的。它有：
・前因（先天格局+過去的累積怎麼導致現在的處境）
・現況（現在到底在什麼位置、什麼狀態）
・走向（接下來最可能怎麼發展、什麼時候出現變化）
・變數（什麼條件會讓結果往好的方向走、什麼條件會往壞的方向走）
・具體建議（基於以上所有分析，他現在該做什麼、不該做什麼）

═══ 分析要求 ═══

一、每個子問題正面回答，不迴避。每個判斷交代來源（用白話）。
二、七套都要用到。每套都要在分析裡看得到它的貢獻。資料不足的說「這套在這題上看不出明確方向」。
三、至少一段明確的交叉發現——「A看到X、B看到Y、合在一起才看到Z」。
四、所有變數都要講清楚——不是只講「有變數」，要講「什麼條件下往哪邊、什麼條件下往另一邊」。
五、推時間要交叉驗證：八字流年流月 + 紫微大限流年 + 梅花應期 + 吠陀副運結束日 + 西洋行運。多套指向同一區間→可信度最高。
六、涉及另一個人就從所有相關位置萃取完整畫像。
七、「期望翻轉」：先點名他期望的結果，再用數據告訴他實際情況。

推時間備忘（內建知識，不說出口）：
・八字：大運升降＝長期，流年流月＝年月節奏，流月沖合＝事件觸發
・梅花：用生體＝快，體生用＝慢。動爻數字小(1-3)＝天到週，大(6-8)＝月
・吠陀：Antardasha 結束＝轉折點
・塔羅：權杖＝天/週，聖杯＝週，寶劍＝天到週，錢幣＝月
・姓名學：不推時間，佐證性格

鐵律：
一、不編造資料裡不存在的數據。推理延伸可以，憑空編造不行。
二、不把 score、ratio、degree、percentage 等原始數字丟給他看。

禁詞（知道但不能出現）：
日主、命主、身強、身弱、比肩、劫財、食神、傷官、正財、偏財、正官、偏官、七殺、正印、偏印、梟神、十神、天干、地支、喜用神、忌神、藏干、神煞、納音、空亡、大運、流年、流月、從格、化氣格、化祿、化權、化科、化忌、飛星、自化、四化、主星、輔星、煞星、命宮、身宮、大限、宮位、三方四正、本卦、互卦、變卦、動爻、體用、卦氣、正位、逆位、元素尊嚴、大阿卡那、小阿卡那、Dasha、Bhukti、Antardasha、Yoga、Dosha、Nakshatra、Ashtakavarga、Shadbala、Bindus、Lagna、Rashi、三才、五格、天格、人格、地格、外格、總格、score、ratio、level、degree、percentage、bindus、points
全部翻成白話。

語氣：溫暖但直接。壞消息不閃躲，好消息告訴底氣在哪。不說空話。

輸出 JSON（不加 markdown）：
{
  "directAnswer": "直接判斷，一到兩句話。問了多個子問題就都給結論。",
  "systemStories": {
    "bazi": "八字看到的完整故事——格局是什麼、時運走到哪、對這件事的判斷、變數在哪。如果資料不足就寫「資料不足，無法判斷」。",
    "ziwei": "紫微看到的完整故事——命宮性格、相關宮位狀態、大限流年走向、四化影響。",
    "meihua": "梅花看到的完整故事——體用強弱、動爻階段、互卦隱因、變卦走向、應期。",
    "tarot": "塔羅看到的完整故事——核心十字、位置對讀、元素氣氛、牌面組合出的敘事。",
    "natal": "西洋星盤看到的完整故事——行星配置、相位、行運、小限主題。",
    "vedic": "吠陀看到的完整故事——月宿性格、主副運週期、Yoga格局、壓力期。",
    "name": "姓名學看到的——名字五行跟命格配合還是拖累、三才順不順。如果資料不足就寫「資料不足」。"
  },
  "reading": "用七段故事的交集重組出來的新故事——前因→現況→走向→變數（什麼條件下往哪邊）→具體建議。每個子問題獨立段落回答。所有變數都要講清楚條件。這段不是七段的拼接，是透過底層邏輯重新組合的新洞察。換行分段。",
  "closing": "最後一句話。",
  "crystalRec": "從【水晶商品清單】選一顆（沒清單就省略）。",
  "crystalReason": "接回分析（沒清單就省略）。"
}
繁體中文。`;



// ═══════════════════════════════════════════════════════════════
// TAROT_PROMPT — 靜月・塔羅解讀
// ═══════════════════════════════════════════════════════════════

const TAROT_PROMPT = `你是靜月，一個深度塔羅分析師。

═══ 核心分析邏輯：象徵交集 ═══

你看的不是單張牌義——是牌與牌之間的關係。每張牌都是一個象徵，你的工作是找這些象徵之間的交集、分歧和正反面。

第一步：看整體氣氛。
・元素分佈：哪個元素多（=主導能量）、哪個缺（=盲區）
・大牌數量：多＝命運層級議題，少＝日常可控
・逆位比例：高＝內在阻力明顯
・宮廷牌數量：多＝人際因素是關鍵

第二步：根據牌陣類型，讀位置關係。

【凱爾特十字 Celtic Cross（10張）】
・1+2 核心十字：現況被什麼力量橫跨（2正放＝助力，2倒放＝阻力）
・1→10 故事弧線：從起點到終點，中間經歷了什麼
・3→1→6 時間軸：根因如何影響現在，現在指向什麼近期走向
・3+5 垂直軸：潛意識根因 vs 意識層面的目標——兩者對齊＝方向清楚，衝突＝他自己不知道自己要什麼
・7 vs 8 內外對照：他自己的狀態 vs 外界環境——同步還是拉扯
・9+10 結局軸：最深的希望/恐懼如何影響最終結果。9是恐懼時10是壞結果＝恐懼自我實現；9是希望時10是好結果＝走對方向
・4+6 動能方向：近期過去→近期未來，事情在加速還是減速

【三牌陣 Three-Card（3張）】
・1→2→3 時間流：過去→現在→未來，讀的是趨勢方向
・1和3對比：起點和終點差多大＝改變幅度
・2是轉折點：現在這張牌決定了從1到3的路徑是順是卡
・三張元素是否一致：同元素＝單一能量貫穿，混合＝多股力量在拉

【五牌陣 Five-Card（5張）】
・1現況→2原因→3阻礙→4建議→5結果
・2+3 對讀：原因和阻礙是同一件事還是不同層面＝問題是單純還是複合
・3+4 對讀：阻礙和建議的元素關係＝建議能不能真的克服阻礙
・1+5 對比：現況到結果改變多大＝可以有多少期待

【十字牌陣 Cross（5張）】
・1核心被2阻礙橫跨——跟凱爾特前兩張同邏輯
・3過去→1現在→4未來：時間軸
・5建議：整個十字的解方
・1+2+5 三角：核心+阻礙+建議＝最關鍵的三張

【二選一牌陣 Either-Or（5張）】
・1你＝當事人現在的狀態和核心需求
・2 A選項 vs 3 B選項：兩條路的能量和發展方向
・4 A結果 vs 5 B結果：兩條路的終點
・關鍵對讀：1分別和2、3搭配看＝你跟哪條路的能量更合。4 vs 5直接比較＝哪個結果更好
・不是一定要選好的——要看1的需求跟哪條路對齊

【關係牌陣 Relationship（6張）】
・1你 vs 2對方：雙方各自的狀態和心理
・3關係現狀：兩人之間此刻的能量（不是任何一方的）
・4挑戰：這段關係正在面對的考驗
・5建議：最適合的應對
・6走向：關係未來的方向
・核心對讀：1 vs 2＝雙方的差異和互補。3+4＝現況裡的張力在哪。4+5＝考驗的解法對不對。5→6＝照建議做會走向哪裡

【時間線牌陣 Timeline（5張）】
・1根源→2近況→3轉折點→4發展→5結果
・3是最關鍵的牌：什麼事件或決定會觸發改變
・1→3之前＝過去到轉折。3→5之後＝轉折到結果
・3的元素和數字暗示轉折的時間和性質

【生命之樹 Tree of Life（10張）】
・1 Kether王冠＝最高靈性指引，他的終極方向
・6 Tiphereth美＝核心自我，他真正的狀態
・10 Malkuth王國＝物質現實，最終落地的結果
・1→6→10 中柱：從靈性→自我→現實的貫穿線＝最重要的主軸
・2+3 智慧vs理解：擴展力量 vs 限制力量＝他的內在張力
・4+5 慈悲vs嚴厲：機會 vs 必須割捨的＝外在抉擇
・7+8 情感vs思維：他想要什麼 vs 他怎麼想＝感性理性是否衝突
・9 Yesod基礎＝潛意識，他沒意識到但在影響他的東西

【黃道十二宮 Zodiac（13張）】
・1-12對應十二宮位，13是總結
・按問題類型聚焦：感情看5宮(戀愛)+7宮(伴侶)+8宮(親密)，事業看6宮(工作)+10宮(事業)+2宮(收入)，健康看1宮(身體)+6宮(健康)+8宮(轉化)
・對宮對讀：1vs7(自我vs他人)、2vs8(我的資源vs共同資源)、4vs10(家庭vs事業)、5vs11(個人快樂vs群體理想)
・13總結牌要能串起前面12張的主題

【小阿卡那占卜 Minor Arcana（7張）】
・只用56張小牌＝聚焦在具體生活問題，不涉及命運層級
・1現狀→2原因→3挑戰→4周圍的人→5你的資源→6建議→7結果
・4是人際因素：誰在影響這件事
・5是你手上的牌：你有什麼可以用的
・3+5+6 三角：挑戰+資源+建議＝能不能解決
・全部是同一花色→那個元素的議題壟斷了整件事

第三步：找象徵交集。
・多張牌指向同一件事 → 判斷果斷，那就是答案
・牌跟牌打架 → 變數——要講清楚「什麼條件下往好的方向、什麼條件下往壞的方向」
・某張牌獨立出現的細節 → 可能是其他牌看不到的盲區，挖出來
・同一元素反覆出現 → 那個能量領域是核心議題

第四步：用交集結果重組成一個新的完整故事。
這個故事要有：前因（根因位+過去位告訴你為什麼走到這步）→ 現況（核心位+阻礙位告訴你現在卡在哪）→ 走向（近期未來+結果位告訴你接下來怎麼走）→ 變數（哪些牌在打架、在什麼條件下翻盤）→ 具體建議（基於以上所有分析，他現在該做什麼）。

═══ 分析要求 ═══

一、先讀人再讀牌。他的問題本身就是最大的線索——用詞、場景、問法都在告訴你他真正怕的是什麼。
二、每個子問題正面回答。不迴避。
三、每個判斷交代來源（白話）。
四、每張值得展開的牌不是只講一句牌義——要講它在這個位置上、跟旁邊的牌組合起來、映射到他的處境後，完整地說了什麼。前因、影響、後果都要有。
五、所有變數都要講清楚——不是「有變數」就結束，要講「什麼條件下往哪邊、什麼條件下往另一邊」。
六、「期望翻轉」：先點名他期望的結果，再用牌面告訴他實際情況。

推時間備忘（內建知識，不說出口）：
・數字牌數字＝時間長度。權杖＝天/週，聖杯＝週，寶劍＝天到週，錢幣＝月
・季節：權杖＝春，聖杯＝夏，寶劍＝秋，錢幣＝冬
・宮廷牌速度：騎士最快，國王最慢
・多張牌指向同一時間段→可信度高

鐵律：
一、不編造資料裡不存在的牌。推理延伸可以，憑空編造不行。
二、不把 score、ratio 等原始數字丟給他看。

禁詞（知道但不能出現）：
正位、逆位、元素尊嚴、大阿卡那、小阿卡那、宮廷牌、數字牌、Sephirah、卡巴拉、GD、Golden Dawn、score、ratio、level、degree、percentage、points
「逆位」→「卡住」「反著來」；「正位」→「順的」「通了」。

語氣：溫暖但直接。壞消息不閃躲。不說空話。

輸出 JSON（不加 markdown）：
{
  "directAnswer": "直接判斷，一句話。",
  "subAnswers": [
    {
      "theme": "這張牌在故事裡扮演什麼角色（你自己的話）",
      "cardIndex": 0,
      "conclusion": "10字以內",
      "reading": "這張牌的完整分析。必須包含：①它在這個位置上的意義 ②它跟對讀位置的牌組合起來說了什麼（例如：這是阻礙位，跟核心位的牌放在一起看，阻礙的具體內容是……）③映射到他的處境，前因、影響、後果。換行分段。"
    }
  ],
  "summary": "最重要的一段——用象徵交集重組出來的新故事。不是逐張重複。前因→現況→走向→所有變數（什麼條件下往好的方向、什麼條件下往壞的方向，講清楚）→具體建議。每個子問題都要回答到。換行分段。",
  "closing": "最後一句話。",
  "crystalRec": "從【水晶商品清單】選一顆（沒清單就省略）。",
  "crystalReason": "接回分析（沒清單就省略）。"
}
subAnswers 只放值得展開的牌，過渡牌在 summary 帶過。cardIndex 從 0 開始。篇幅自己分配。
注意：subAnswers 裡每張牌的 reading 不能只講單張牌義——必須結合它的對讀位置（第二步教的位置關係）來分析。如果這張牌沒有明確的對讀關係，至少要講它跟整體牌面氣氛的關係。繁體中文。`;



// ═══════════════════════════════════════════════════════════════
// OOTK_PROMPT — 靜月・開鑰之法・五階段深度解讀
// ═══════════════════════════════════════════════════════════════

const OOTK_PROMPT = `你是靜月，一個深度塔羅分析師。這個人剛完成金色黎明開鑰之法（Opening of the Key）五層占卜。

═══ 五層結構（從表面到核心）═══

Op.1 四元素分堆：代表牌落在哪個元素堆＝這件事的基本屬性（火＝行動/意志、水＝情感/關係、風＝思維/溝通、土＝物質/現實）。活躍堆的牌面組成＝跟這件事直接相關的所有能量。
Op.2 十二宮位：代表牌落在哪一宮＝這件事衝擊他生活的哪個面向（1宮自我、2宮財務、3宮溝通、4宮家庭、5宮戀愛/創造、6宮健康/工作、7宮伴侶/合作、8宮共同資產/轉化、9宮信仰/遠方、10宮事業、11宮朋友/理想、12宮隱藏/潛意識）。
Op.3 十二星座：代表牌落在哪個星座＝什麼能量模式在主導這件事。
Op.4 三十六旬：精確聚焦到特定度數區間和旬主星＝最具體的能量焦點。
Op.5 生命之樹：代表牌落在哪個質點＝這件事在靈魂層面的功課（Kether＝最高指引、Malkuth＝物質落地、Tiphereth＝核心自我、Yesod＝潛意識）。

═══ 每層的分析方法 ═══

計數路徑（資料裡已提供）：從代表牌出發逐步跳到下一張牌——途中經過的每張牌＝事情發展過程中會遭遇的能量，終點牌＝這一層的結論。途中逆位牌多＝過程阻力大。途中有大牌＝遇到命運級轉折。

配對（資料裡已提供）：從代表牌兩側對稱展開——距離越近影響越直接。每一對代表一體兩面：同元素＝合作、互補元素＝支持、對立元素＝衝突。

═══ 核心分析邏輯：每層先講完自己的完整故事，再找交集重組 ═══

【第一步：每層各自講完自己的故事】

每一層都不是只給一個結論——要講完整：這一層看到了什麼、它說了什麼故事、計數路徑途中經歷了哪些能量（途中的牌＝過程中會遭遇的事，終點牌＝這一層的結論）、配對關係裡最靠近代表牌的那對在說什麼（＝最直接的影響）、這一層的變數在哪裡。

Op.1 要講：落在哪個元素堆→這件事的基本屬性→活躍堆裡有哪些牌在說什麼故事→計數路徑走過了什麼→配對顯示什麼影響
Op.2 要講：落在哪個宮→衝擊生活哪個面向→活躍堆的牌面怎麼描述這個面向的狀態→計數和配對的訊息
Op.3 要講：落在什麼星座→什麼能量模式在主導→這個星座的特質怎麼影響這件事→牌面的呼應
Op.4 要講：聚焦到什麼旬→旬主星的能量是什麼→精確到什麼程度→牌面的印證
Op.5 要講：落在生命之樹哪個質點→靈魂層面的功課是什麼→活躍堆的牌在這個層次說了什麼→最深處的訊息

【第二步：五段故事放在一起，找交集】

・同一張牌在多層重複出現 → 那張牌代表的能量是核心答案
・多層指向同一個方向 → 幾乎是定論，判斷果斷
・層與層之間打架 → 變數——講清楚「什麼條件下往好的方向、什麼條件下往壞的方向」
・某一層獨有的訊號 → 可能是其他層看不到的盲區，不能忽略

【第三步：用交集結果重組成一個新的故事】

crossAnalysis 是整個解讀最值錢的部分。它不是五層摘要的拼接——是透過底層邏輯重新組合出來的新故事：
・Op.1 表層看到的是什麼 vs Op.5 最深處看到的是什麼 → 那個翻轉就是真正的答案
・前因（什麼導致這件事走到現在這步）→ 現況（現在到底在什麼位置）→ 走向（接下來最可能怎麼發展）→ 所有變數（什麼條件下翻盤、什麼條件下惡化）→ 具體建議

═══ 分析要求 ═══

一、每個子問題正面回答。不迴避。每個判斷交代來源（白話）。
二、涉及另一個人就從牌面推斷完整畫像：宮廷牌特質推年齡和性格，牌在十二宮的落點推對方處境，星座層位置推對方氣質。
三、「期望翻轉」：先點名他期望的結果，再用五層數據告訴他實際情況。
四、所有變數都要講清楚條件——不是「有變數」就結束。

鐵律：
一、不編造資料裡不存在的牌。推理延伸可以，憑空編造不行。
二、不把 score、ratio 等原始數字丟給他看。

禁詞（知道但不能出現）：
正位、逆位、元素尊嚴、大阿卡那、小阿卡那、宮廷牌、數字牌、Sephirah、卡巴拉、GD、Golden Dawn、Significator、Counting、Pairing、Operation、計數、計數路徑、配對、代表牌、score、ratio、level、degree、percentage、points
「逆位」→「卡住」「走不通」；「正位」→「順的」「通了」；計數和配對→不提方法名，直接講「牌面顯示事情的發展過程是……」；代表牌→「代表你的那張牌」。
資料裡的「（順）」「（逆）」要翻譯成白話。

語氣：溫暖但直接。壞消息不閃躲。不說空話。

輸出 JSON（不加 markdown）：
{
  "directAnswer": "直接判斷，一到兩句話。",
  "operations": {
    "op1": { "conclusion": "10字以內", "reading": "完整故事：①落在哪個元素堆＝這件事的基本屬性 ②活躍堆裡的牌面組成在說什麼故事 ③發展過程（途中經歷了什麼能量）④結論牌說了什麼 ⑤最靠近的配對在說什麼。換行分段。" },
    "op2": { "conclusion": "10字以內", "reading": "完整故事：①落在哪個宮＝衝擊生活哪個面向 ②那個面向的現狀（活躍堆牌面描述）③發展過程和結論 ④配對顯示什麼影響。換行分段。" },
    "op3": { "conclusion": "10字以內", "reading": "完整故事：①什麼星座能量在主導 ②這個能量模式怎麼影響事情 ③發展過程和結論 ④跟前兩層的呼應或矛盾。換行分段。" },
    "op4": { "conclusion": "10字以內", "reading": "完整故事：①精確聚焦到什麼旬＝焦點在哪 ②旬主星的能量意味著什麼 ③牌面印證了什麼 ④跟其他層的對照。換行分段。" },
    "op5": { "conclusion": "10字以內", "reading": "完整故事：①落在生命之樹哪個位置＝靈魂層面的功課 ②活躍堆在最深層次說了什麼 ③發展過程和結論 ④最深處看到的跟表層（Op.1）的落差。換行分段。" }
  },
  "crossAnalysis": "最重要的一段——用五層交集重組出來的新故事。①重複牌是核心答案 ②多層同向的結論 ③層間矛盾＝變數（什麼條件下往哪邊）④Op.1表層 vs Op.5最深處的翻轉——表面看起來是A，潛到底才發現其實是B ⑤前因→現況→走向→所有變數→建議。換行分段。",
  "summary": "好壞都講。具體建議編號交代。換行分段。",
  "closing": "最後一句話。",
  "crystalRec": "從【水晶商品清單】選一顆（沒清單就省略）。",
  "crystalReason": "接回分析（沒清單就省略）。"
}
五層都要有，每層都要講完整故事不是只給結論——至少要包含活躍堆牌面分析+發展過程+結論。篇幅自己分配：最痛的層深挖，弱相關的可以精簡但不能只有一兩句。省下的篇幅灌進 crossAnalysis。繁體中文。`;






// ═══════════════════════════════════════════════════════════════
// buildOotkUserMessage — 開鑰之法模式的 user message
// ═══════════════════════════════════════════════════════════════

function buildOotkUserMessage(p) {
  const lines = [];
  const ftMap = { love:'感情', career:'事業', wealth:'財運', health:'健康', relationship:'人際關係', family:'家庭', general:'整體運勢' };
  const ftKey = (p.focusType && p.focusType !== 'general' && ftMap[p.focusType]) ? p.focusType : detectFocusType(p.question);
  const ft = ftMap[ftKey] || '整體運勢';
  const question = safeString(p.question);

  lines.push('問題：「' + question + '」（' + ft + '）');
  lines.push('今天日期：' + getTodayString() + '（西元' + getCurrentYear() + '年）');
  if (p.birth) {
    var birthYear = parseInt(String(p.birth).split('-')[0]);
    var userAge = birthYear ? (getCurrentYear() - birthYear) : null;
    lines.push('出生：' + p.birth + (p.birthTime ? ' ' + p.birthTime : '') + (userAge ? '（今年' + userAge + '歲）' : ''));
  }
  if (p.gender) lines.push('性別：' + p.gender);
  else lines.push('（用戶未提供性別，請用「你」稱呼，避免先生/小姐、他/她等性別化詞彙）');
  if (p.name) lines.push('姓名：' + p.name);
  lines.push('');

  const ootk = p.ootkData || {};
  const sig = ootk.significator || {};
  if (sig.name || sig.id) {
    lines.push('代表牌(Significator)：' + (sig.name || sig.id) + (sig.element ? '（' + sig.element + '）' : ''));
    lines.push('');
  }

  const opNames = ['Op.1 四元素分堆', 'Op.2 十二宮位', 'Op.3 十二星座', 'Op.4 三十六旬', 'Op.5 生命之樹'];
  const ops = ootk.operations || {};
  ['op1','op2','op3','op4','op5'].forEach(function(k, i) {
    if (ops[k]) { lines.push('【' + opNames[i] + '】'); lines.push(ops[k]); lines.push(''); }
  });

  const cross = ootk.crossAnalysis || {};
  if (cross.progression || cross.recurring || cross.recurringDetail || cross.pileElement || cross.elementFlow) {
    lines.push('【跨階段分析】');
    if (cross.pileElement) lines.push('活躍堆元素屬性：' + cross.pileElement);
    if (cross.elementFlow && typeof cross.elementFlow === 'object') {
      var ef = cross.elementFlow;
      lines.push('五層落點進程：' + [ef.op1, ef.op2, ef.op3, ef.op4, ef.op5].filter(Boolean).join(' → '));
    }
    if (cross.progression) lines.push('進程：' + cross.progression);
    if (cross.recurring) lines.push('重複牌：' + cross.recurring);
    if (cross.recurringDetail) lines.push('重複牌詳情：' + cross.recurringDetail);
    lines.push('');
  }

  // ═══ 水晶商品清單 ═══
  if (p.crystalCatalog && p.crystalCatalog.length) {
    lines.push('【水晶商品清單】');
    if (p.crystalFavEl) lines.push('此人喜用神五行：' + p.crystalFavEl + '（只推薦這些五行的水晶）');
    p.crystalCatalog.forEach(c => lines.push(c));
    lines.push('crystalRec 只能填上面清單裡的水晶名稱（｜前面那段），不要自己編。');
    lines.push('');
  }

  return lines.join('\n');
}

// ═══════════════════════════════════════════════════════════════
// _extractPrevReading — 從完整 JSON 結果中提取上一輪解讀（智慧截斷）
// ═══════════════════════════════════════════════════════════════
function _extractPrevReading(raw, maxLen) {
  if (!raw) return '';
  try {
    const r = JSON.parse(raw);
    const parts = [];
    if (r.directAnswer) parts.push('結論：' + r.directAnswer);
    // 七維度格式
    if (r.reading) parts.push(r.reading);
    else if (r.answer) parts.push(r.answer);
    // 塔羅格式
    if (r.subAnswers && r.subAnswers.length) {
      r.subAnswers.forEach(function(sa) {
        if (sa.reading) parts.push(sa.reading);
      });
    }
    // OOTK 格式
    if (r.operations) {
      ['op1','op2','op3','op4','op5'].forEach(function(k) {
        if (r.operations[k] && r.operations[k].reading) parts.push(r.operations[k].reading);
      });
    }
    if (r.crossAnalysis) parts.push(r.crossAnalysis);
    if (r.synthesis) parts.push(r.synthesis);
    if (r.closing) parts.push(r.closing);
    // 七維度 systemStories
    if (r.systemStories) {
      Object.keys(r.systemStories).forEach(function(k) {
        if (r.systemStories[k]) parts.push(k + '：' + r.systemStories[k]);
      });
    }
    var result = parts.filter(Boolean).join('\n');
    return result.length > maxLen ? result.substring(0, maxLen) + '…' : result;
  } catch(_) {
    // 不是 JSON，直接截斷原始文字
    return raw.length > maxLen ? raw.substring(0, maxLen) + '…' : raw;
  }
}

// ═══════════════════════════════════════════════════════════════
// buildFullFollowUpMessage — 七維度追問模式的 user message
// ★ v15：七系統背景 + 上一輪完整解讀 + 補充牌
// ═══════════════════════════════════════════════════════════════
function buildFullFollowUpMessage(p) {
  const lines = [];
  const ftMap = { love:'感情', career:'事業', wealth:'財運', health:'健康', relationship:'人際關係', family:'家庭', general:'整體運勢' };
  const question = safeString(p.question);
  const originalQ = safeString(p.originalQuestion);
  const ftKey = (p.focusType && p.focusType !== 'general' && ftMap[p.focusType]) ? p.focusType : detectFocusType(originalQ || question);
  const ft = ftMap[ftKey] || '整體運勢';

  lines.push('原始問題：「' + (originalQ || question) + '」（' + ft + '）');
  if (originalQ && originalQ !== question) {
    lines.push('追問：「' + question + '」');
  }
  lines.push('今天日期：' + getTodayString() + '（西元' + getCurrentYear() + '年）');
  if (p.birth) {
    var birthYear = parseInt(String(p.birth).split('-')[0]);
    var userAge = birthYear ? (getCurrentYear() - birthYear) : null;
    lines.push('出生：' + p.birth + (p.birthTime ? ' ' + p.birthTime : '') + (userAge ? '（今年' + userAge + '歲）' : ''));
  }
  if (p.gender) lines.push('性別：' + p.gender);
  else lines.push('（用戶未提供性別，請用「你」稱呼，避免先生/小姐、他/她等性別化詞彙）');
  if (p.name) lines.push('姓名：' + p.name);
  lines.push('');

  // ── 七系統原始解讀（背景，每系統截 600 字）──
  const rr = p.rawReadings || {};
  const sysNames = { bazi:'八字', ziwei:'紫微', meihua:'梅花', tarot:'塔羅', natal:'西洋星盤', vedic:'吠陀', name:'姓名學' };
  Object.keys(sysNames).forEach(function(k) {
    if (rr[k]) {
      var txt = safeString(rr[k]);
      if (txt.length > 600) txt = txt.substring(0, 600) + '…';
      lines.push('【' + sysNames[k] + '（背景）】');
      lines.push(txt);
      lines.push('');
    }
  });

  // ── 上一輪完整 AI 解讀 ──
  const fu = (p.tarotData && p.tarotData.followUp) ? p.tarotData.followUp : {};
  const prevFull = fu.previousFullResult || '';
  if (prevFull) {
    lines.push('【上一輪靜月解讀】');
    lines.push(safeString(_extractPrevReading(prevFull, 3000)));
    lines.push('');
  }

  // ── 補充牌 ──
  const supCards = fu.supplementCards || [];
  if (supCards.length) {
    lines.push('【補充牌（' + supCards.length + '張）——針對追問的直接回應】');
    supCards.forEach(function(sc, idx) {
      lines.push('  補充牌' + (idx + 1) + '：' + safeString(sc.name) + (sc.isUp === true ? '（順）' : '（逆）') + (sc.element ? '（' + sc.element + '）' : ''));
    });
    lines.push('');
  }

  lines.push('【用戶追問】' + question);
  lines.push('');
  lines.push('【要求】上一輪七系統交叉解讀已經完成，那些結論不要重複。現在用戶追問了「' + question + '」，你只看補充牌在說什麼，結合七系統背景回答追問。回答重點就好，精準命中。');
  lines.push('');

  // ── 水晶清單 ──
  if (p.crystalCatalog && p.crystalCatalog.length) {
    lines.push('【水晶商品清單】');
    if (p.crystalFavEl) lines.push('此人喜用神五行：' + p.crystalFavEl + '（只推薦這些五行的水晶）');
    p.crystalCatalog.forEach(c => lines.push(c));
    lines.push('crystalRec 只能填上面清單裡的水晶名稱（｜前面那段），不要自己編。');
    lines.push('');
  }

  return lines.join('\n');
}

// ═══════════════════════════════════════════════════════════════
// buildOotkFollowUpMessage — OOTK 追問模式的 user message
// Bug #2 修復：OOTK 追問需要五階段背景 + 補充牌
// ═══════════════════════════════════════════════════════════════
function buildOotkFollowUpMessage(p) {
  const lines = [];
  const ftMap = { love:'感情', career:'事業', wealth:'財運', health:'健康', relationship:'人際關係', family:'家庭', general:'整體運勢' };
  const question = safeString(p.question);
  const originalQ = safeString(p.originalQuestion);
  const ftKey = (p.focusType && p.focusType !== 'general' && ftMap[p.focusType]) ? p.focusType : detectFocusType(originalQ || question);
  const ft = ftMap[ftKey] || '整體運勢';

  lines.push('原始問題：「' + (originalQ || question) + '」（' + ft + '）');
  if (originalQ && originalQ !== question) {
    lines.push('追問：「' + question + '」');
  }
  lines.push('今天日期：' + getTodayString() + '（西元' + getCurrentYear() + '年）');
  if (p.birth) {
    var birthYear = parseInt(String(p.birth).split('-')[0]);
    var userAge = birthYear ? (getCurrentYear() - birthYear) : null;
    lines.push('出生：' + p.birth + (p.birthTime ? ' ' + p.birthTime : '') + (userAge ? '（今年' + userAge + '歲）' : ''));
  }
  if (p.gender) lines.push('性別：' + p.gender);
  else lines.push('（用戶未提供性別，請用「你」稱呼，避免先生/小姐、他/她等性別化詞彙）');
  if (p.name) lines.push('姓名：' + p.name);
  lines.push('');

  // ── 原本五階段數據（背景）──
  const ootk = p.ootkData || {};
  const sig = ootk.significator || {};
  if (sig.name || sig.id) {
    lines.push('代表牌(Significator)：' + (sig.name || sig.id) + (sig.element ? '（' + sig.element + '）' : ''));
    lines.push('');
  }

  const opNames = ['Op.1 四元素分堆', 'Op.2 十二宮位', 'Op.3 十二星座', 'Op.4 三十六旬', 'Op.5 生命之樹'];
  const ops = ootk.operations || {};
  ['op1','op2','op3','op4','op5'].forEach(function(k, i) {
    if (ops[k]) { lines.push('【' + opNames[i] + '（背景）】'); lines.push(ops[k]); lines.push(''); }
  });

  const cross = ootk.crossAnalysis || {};
  if (cross.progression || cross.recurring || cross.recurringDetail || cross.elementFlow) {
    lines.push('【跨階段分析（背景）】');
    if (cross.elementFlow && typeof cross.elementFlow === 'object') {
      var ef = cross.elementFlow;
      lines.push('五層落點：' + [ef.op1, ef.op2, ef.op3, ef.op4, ef.op5].filter(Boolean).join(' → '));
    }
    if (cross.progression) lines.push('進程：' + cross.progression);
    if (cross.recurring) lines.push('重複牌：' + cross.recurring);
    if (cross.recurringDetail) lines.push('重複牌詳情：' + cross.recurringDetail);
    if (cross.pileElement) lines.push('活躍堆元素：' + cross.pileElement);
    lines.push('');
  }

  // ── 上一輪解讀 ──
  const fu = (p.tarotData && p.tarotData.followUp) ? p.tarotData.followUp : {};
  const prevFull = fu.previousFullResult || fu.previousReadingSummary || '';
  if (prevFull) {
    lines.push('【上一輪解讀】');
    lines.push(safeString(_extractPrevReading(prevFull, 2500)));
    lines.push('');
  }

  // ── 補充牌 ──
  const supCards = fu.supplementCards || [];
  if (supCards.length) {
    lines.push('【補充牌（' + supCards.length + '張）——針對追問的直接回應】');
    supCards.forEach(function(sc, idx) {
      lines.push('  補充牌' + (idx + 1) + '：' + safeString(sc.name) + (sc.isUp === true ? '（順）' : '（逆）') + (sc.element ? '（' + sc.element + '）' : ''));
    });
    lines.push('');
  }

  lines.push('【要求】上一輪五階段解讀已經完成，那些結論不要重複。現在用戶追問了「' + question + '」，你只看補充牌在說什麼，結合五階段背景回答追問。回答重點就好，精準命中。');
  lines.push('');

  // ── 水晶清單 ──
  if (p.crystalCatalog && p.crystalCatalog.length) {
    lines.push('【水晶商品清單】');
    if (p.crystalFavEl) lines.push('此人喜用神五行：' + p.crystalFavEl + '（只推薦這些五行的水晶）');
    p.crystalCatalog.forEach(c => lines.push(c));
    lines.push('crystalRec 只能填上面清單裡的水晶名稱（｜前面那段），不要自己編。');
    lines.push('');
  }

  return lines.join('\n');
}

function buildTarotUserMessage(p) {
  const lines = [];
  const ftMap = { love:'感情', career:'事業', wealth:'財運', health:'健康', relationship:'人際關係', family:'家庭', general:'整體運勢' };
  const question = safeString(p.question);
  const originalQ = safeString(p.originalQuestion);
  // Fix #4: 追問模式下 question 是追問，originalQuestion 才是原始問題
  const isFollowUp = !!(p.tarotData && p.tarotData.followUp && p.tarotData.followUp.question);
  const displayQ = (isFollowUp && originalQ) ? originalQ : question;
  const ftKey = (p.focusType && p.focusType !== 'general' && ftMap[p.focusType]) ? p.focusType : detectFocusType(displayQ);
  const ft = ftMap[ftKey] || '整體運勢';

  lines.push('原始問題：「' + displayQ + '」（' + ft + '）');
  if (isFollowUp && originalQ && originalQ !== question) {
    lines.push('追問：「' + question + '」');
  }
  lines.push('今天日期：' + getTodayString() + '（西元' + getCurrentYear() + '年）');
  if (p.birth) {
    var birthYear = parseInt(String(p.birth).split('-')[0]);
    var userAge = birthYear ? (getCurrentYear() - birthYear) : null;
    lines.push('出生：' + p.birth + (p.birthTime ? ' ' + p.birthTime : '') + (userAge ? '（今年' + userAge + '歲）' : ''));
  }
  if (p.gender) lines.push('性別：' + p.gender);
  else lines.push('（用戶未提供性別，請用「你」稱呼，避免先生/小姐、他/她等性別化詞彙）');
  if (p.name) lines.push('姓名：' + p.name);
  lines.push('');

  const tarot = p.tarotData || {};
  const cards = tarot.cards || [];
  const spreadType = tarot.spreadType || '';

  // ── 牌陣與牌面（原封不動全部給 AI）──
  var spreadName = tarot.spreadZh || spreadType || '自由牌陣';
  lines.push('【牌陣：' + spreadName + '（共 ' + cards.length + ' 張）】');
  lines.push('（以下「順」＝正放、「逆」＝倒放，回答時用白話如「卡住」「反著來」「順的」，不要說「正位」「逆位」）');
  lines.push('');

  cards.forEach(function(c, i) {
    var line = '第' + (i+1) + '張';
    if (c.position) line += '｜位置「' + c.position + '」' + (c.positionMeaning ? '（' + c.positionMeaning + '）' : '');
    line += '：' + c.name + (c.isUp === true ? '（順）' : '（逆）');
    if (c.element) line += '　元素：' + c.element;
    if (c.gdCourt) line += '　GD宮廷：' + c.gdCourt;
    // ★ #12: Celtic Cross 位置2 明確標注助力/阻力方向
    if (i === 1 && /celtic/i.test(spreadType)) {
      line += c.isUp === true ? '　→ 此為【助力】：這股力量在幫他' : '　→ 此為【阻力】：這股力量在擋他';
    }
    lines.push(line);
  });
  lines.push('');

  // 鐵律：抽幾張就分析幾張
  lines.push('共 ' + cards.length + ' 張牌，主線牌和轉折牌必須出現在分析裡，過渡牌可以在 summary 裡帶過。');
  lines.push('');

  if (tarot.numerology) { lines.push('【數字學】' + safeString(tarot.numerology)); lines.push(''); }
  if (tarot.elementInteraction) { lines.push('【元素統計】' + safeString(tarot.elementInteraction)); lines.push(''); }
  if (tarot.kabbalah) { lines.push('【卡巴拉生命之樹】' + safeString(tarot.kabbalah)); lines.push(''); }
  if (tarot.combos) { lines.push('【牌組共振】' + safeString(tarot.combos)); lines.push(''); }
  if (tarot.courtElements) { lines.push('【宮廷牌GD元素】' + safeString(tarot.courtElements)); lines.push(''); }

  // ═══ 追問模式：補充牌 + 上一輪解讀 ═══
  const fu = tarot.followUp;
  if (fu && fu.question) {
    lines.push('═══ 追問模式 ═══');
    lines.push('');
    const prevFull = fu.previousFullResult || fu.previousReadingSummary || '';
    if (prevFull) {
      lines.push('【上一輪解讀】');
      lines.push(safeString(_extractPrevReading(prevFull, 2500)));
      lines.push('');
    }
    lines.push('【用戶追問】' + safeString(fu.question));
    lines.push('');

    const supCards = fu.supplementCards || (fu.supplementCard ? [fu.supplementCard] : []);
    if (supCards.length) {
      lines.push('【補充牌（' + supCards.length + '張）】');
      supCards.forEach(function(sc, idx) {
        lines.push('  補充牌' + (idx + 1) + '：' + safeString(sc.name) + (sc.isUp === true ? '（順）' : '（逆）') + (sc.element ? '（' + sc.element + '）' : ''));
      });
      lines.push('');
    }

    lines.push('【要求】你上一輪已經把原本牌陣分析完了，那些結論不要再重複。現在用戶追問了新問題，補充牌是對這個追問的直接回應。你只需要看補充牌在說什麼，需要的時候引用原本牌陣當背景，但不要重新分析原本的牌。回答重點就好，精準命中。');
    lines.push('');
  }

  // ═══ 水晶商品清單 ═══
  if (p.crystalCatalog && p.crystalCatalog.length) {
    lines.push('【水晶商品清單】');
    if (p.crystalFavEl) lines.push('此人喜用神五行：' + p.crystalFavEl + '（只推薦這些五行的水晶）');
    p.crystalCatalog.forEach(c => lines.push(c));
    lines.push('crystalRec 只能填上面清單裡的水晶名稱（｜前面那段），不要自己編。');
    lines.push('');
  }

  return lines.join('\n');
}



// ═══════════════════════════════════════════════════════════════
// 主 Handler
// ═══════════════════════════════════════════════════════════════

export default {
  async fetch(request, env) {
    const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, GET, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' };
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') return new Response(null, { headers: cors });

    // ═══════════════════════════════════════════════════════════
    // 綠界金流路由（URL path based）
    // ═══════════════════════════════════════════════════════════

    // ── 建立付款訂單：POST /create-payment ──
    if (url.pathname === '/create-payment' && request.method === 'POST') {
      try {
        const body = await request.json();
        const mode = safeString(body.mode); // 'tarot_only' or 'full'
        const amount = mode === 'ootk' ? PRICE_OOTK : (mode === 'tarot_followup' ? PRICE_FOLLOWUP : (mode === 'tarot_only' ? PRICE_TAROT : PRICE_FULL));
        const itemName = mode === 'ootk' ? '開鑰之法AI深度占卜x1' : (mode === 'tarot_followup' ? '塔羅追問補牌x1' : (mode === 'tarot_only' ? '塔羅AI深度解讀x1' : '七維度AI深度命理解讀x1'));
        const tradeNo = generateTradeNo();
        if (env.RATE_KV) {
          await env.RATE_KV.put(`pay:${tradeNo}`, JSON.stringify({
            status: 'pending',
            amount,
            mode,
            created: Date.now(),
            ip: request.headers.get('CF-Connecting-IP') || 'unknown',
          }), { expirationTtl: 86400 });
        }
        const workerBaseUrl = url.origin;
        const formHTML = await buildECPayFormHTML(tradeNo, workerBaseUrl, amount, itemName);
        return new Response(JSON.stringify({ html: formHTML, tradeNo }), {
          headers: { ...cors, 'Content-Type': 'application/json' }
        });
      } catch (err) {
        return Response.json({ error: err.message }, { status: 500, headers: cors });
      }
    }

    // ── 綠界付款結果通知（Server POST callback）：POST /ecpay-notify ──
    if (url.pathname === '/ecpay-notify' && request.method === 'POST') {
      try {
        const text = await request.text();
        const params = parseFormBody(text);
        
        // 驗證 CheckMacValue
        const receivedMac = params.CheckMacValue;
        delete params.CheckMacValue;
        const expectedMac = await generateCheckMacValue(params);
        
        if (receivedMac !== expectedMac) {
          console.error('ECPay CheckMacValue mismatch', { received: receivedMac, expected: expectedMac });
          return new Response('0|CheckMacValue Error', { headers: cors });
        }

        const tradeNo = params.MerchantTradeNo;
        const rtnCode = params.RtnCode;

        if (rtnCode === '1' && env.RATE_KV) {
          // 付款成功 → 在 KV 標記為已付費
          await env.RATE_KV.put(`pay:${tradeNo}`, JSON.stringify({
            status: 'paid',
            amount: Number(params.TradeAmt || params.TotalAmount || 0),
            paidAt: Date.now(),
            ecpayTradeNo: params.TradeNo || '',
          }), { expirationTtl: 86400 * 7 }); // 保留 7 天

          // 同時寫一筆 payment token，前端拿 tradeNo 來驗證就放行
          await env.RATE_KV.put(`paid_token:${tradeNo}`, '1', { expirationTtl: 86400 * 7 });
        }

        // 綠界要求回傳 1|OK
        return new Response('1|OK', { headers: { 'Content-Type': 'text/plain' } });
      } catch (err) {
        console.error('ecpay-notify error:', err);
        return new Response('0|Error', { headers: { 'Content-Type': 'text/plain' } });
      }
    }

    // ── 驗證付費 token：POST /check-payment ──
    if (url.pathname === '/check-payment' && request.method === 'POST') {
      try {
        const body = await request.json();
        const tradeNo = safeString(body.tradeNo);
        if (!tradeNo) return Response.json({ paid: false }, { headers: cors });
        
        const token = env.RATE_KV ? await env.RATE_KV.get(`paid_token:${tradeNo}`) : null;
        return Response.json({ paid: !!token, tradeNo }, { headers: cors });
      } catch (err) {
        return Response.json({ paid: false, error: err.message }, { status: 500, headers: cors });
      }
    }

    // ═══════════════════════════════════════════════════════════
    // 原有 AI 分析路由（JSON body based）
    // ═══════════════════════════════════════════════════════════

    // ── 管理員通知查詢：GET /admin/notifications?token=xxx ──
    if (url.pathname === '/admin/notifications' && request.method === 'GET') {
      const token = url.searchParams.get('token');
      if (!token || token !== env.ADMIN_TOKEN) return Response.json({ error: 'unauthorized' }, { status: 401, headers: cors });
      if (!env.RATE_KV) return Response.json({ notifications: [] }, { headers: cors });
      try {
        const list = await env.RATE_KV.list({ prefix: 'notify:' });
        const notifications = [];
        for (const key of list.keys) {
          const val = await env.RATE_KV.get(key.name);
          if (val) { try { notifications.push(JSON.parse(val)); } catch(_e) {} }
        }
        notifications.sort((a, b) => (b.time || '').localeCompare(a.time || ''));
        return Response.json({ notifications: notifications.slice(0, 50) }, { headers: cors });
      } catch(e) { return Response.json({ error: e.message }, { status: 500, headers: cors }); }
    }

    // ── 管理員清除通知：DELETE /admin/notifications?token=xxx ──
    if (url.pathname === '/admin/notifications' && request.method === 'DELETE') {
      const token = url.searchParams.get('token');
      if (!token || token !== env.ADMIN_TOKEN) return Response.json({ error: 'unauthorized' }, { status: 401, headers: cors });
      if (!env.RATE_KV) return Response.json({ ok: true }, { headers: cors });
      try {
        const list = await env.RATE_KV.list({ prefix: 'notify:' });
        for (const key of list.keys) { await env.RATE_KV.delete(key.name); }
        return Response.json({ ok: true, cleared: list.keys.length }, { headers: cors });
      } catch(e) { return Response.json({ error: e.message }, { status: 500, headers: cors }); }
    }

    if (request.method !== 'POST') return Response.json({ error: '只接受 POST' }, { status: 405, headers: cors });
    
    try {
      const body = await request.json();

      // ═══ 輕量預檢：action='check' → 只查 KV 不跑 AI（不需要 streaming）═══
      if (body.action === 'check') {
        const cp = body.payload;
        if (!cp) return Response.json({ error: '缺少 payload' }, { status: 400, headers: cors });
        let isAdmin = !!(body.admin_token && body.admin_token === env.ADMIN_TOKEN);
        if (isAdmin) return Response.json({ allowed: true }, { headers: cors });
        const today = new Date(Date.now() + 8 * 3600000).toISOString().slice(0, 10);
        const ip = request.headers.get('CF-Connecting-IP') || 'unknown';

        // ★ 新增：檢查是否有有效的付費 token
        const paidTradeNo = safeString(body.paid_token);
        if (paidTradeNo) {
          const paidOk = env.RATE_KV ? await env.RATE_KV.get(`paid_token:${paidTradeNo}`) : null;
          if (paidOk) {
            return Response.json({ allowed: true, paid: true }, { headers: cors });
          }
        }

        if (cp.mode === 'ootk') {
          const ootkKey = `ootk:${today}:${ip}`;
          if (await env.RATE_KV?.get(ootkKey)) {
            return Response.json({ allowed: false, code: 'OOTK_RATE_LIMITED' }, { headers: cors });
          }
          return Response.json({ allowed: true }, { headers: cors });
        }

        if (cp.mode === 'tarot_only') {
          const tarotKey = `tarot:${today}:${ip}`;
          if (await env.RATE_KV?.get(tarotKey)) {
            return Response.json({ allowed: false, code: 'TAROT_RATE_LIMITED' }, { headers: cors });
          }
          return Response.json({ allowed: true }, { headers: cors });
        }

        if (cp.mode === 'tarot_followup') {
          const fuKey = `tarot_fu:${today}:${ip}`;
          if (await env.RATE_KV?.get(fuKey)) {
            return Response.json({ allowed: false, code: 'FOLLOWUP_RATE_LIMITED' }, { headers: cors });
          }
          return Response.json({ allowed: true }, { headers: cors });
        }

        const rateKey = `rate:${today}:${buildPersonSignature(cp)}:${ip}`;
        if (env.RATE_KV && await env.RATE_KV.get(rateKey)) {
          return Response.json({ allowed: false, code: 'RATE_LIMITED' }, { headers: cors });
        }
        return Response.json({ allowed: true }, { headers: cors });
      }

      // ═══ 正式分析流程（SSE streaming）═══
      const payload = body.payload;
      if (!payload || !payload.question) return Response.json({ error: '缺少 payload' }, { status: 400, headers: cors });
      let isAdmin = !!(body.admin_token && body.admin_token === env.ADMIN_TOKEN);
      const today = new Date(Date.now() + 8 * 3600000).toISOString().slice(0, 10);
      const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
      const rateKey = `rate:${today}:${buildPersonSignature(payload)}:${ip}`;
      const isTarotOnlyRequest = (payload.mode === 'tarot_only' || payload.mode === 'tarot_followup');
      const isTarotFollowUp = (payload.mode === 'tarot_followup');
      const isFullFollowUp = (payload.mode === 'full_followup');
      const isOotkRequest = (payload.mode === 'ootk');

      // ★ 新增：付費 token 繞過 rate limit
      const paidTradeNo = safeString(body.paid_token);
      let isPaidUser = false;
      if (paidTradeNo && env.RATE_KV) {
        const paidOk = await env.RATE_KV.get(`paid_token:${paidTradeNo}`);
        if (paidOk) isPaidUser = true;
      }

      if (!isAdmin && !isPaidUser && env.RATE_KV) {
        // OOTK：每日 1 次免費，之後付費
        if (isOotkRequest) {
          const ootkKey = `ootk:${today}:${ip}`;
          if (await env.RATE_KV.get(ootkKey)) {
            return Response.json({ error: '今日開鑰已使用', code: 'OOTK_RATE_LIMITED' }, { status: 429, headers: cors });
          }
        }
        // 追問（塔羅/OOTK/七維度共用）：每日 1 次免費，之後付費
        if (isTarotFollowUp || isFullFollowUp) {
          const fuKey = `tarot_fu:${today}:${ip}`;
          if (await env.RATE_KV.get(fuKey)) {
            return Response.json({ error: '今日追問已使用', code: 'FOLLOWUP_RATE_LIMITED' }, { status: 429, headers: cors });
          }
        } else if (isTarotOnlyRequest) {
          const tarotKey = `tarot:${today}:${ip}`;
          if (await env.RATE_KV.get(tarotKey)) {
            return Response.json({ error: '今日塔羅解讀已使用', code: 'TAROT_RATE_LIMITED' }, { status: 429, headers: cors });
          }
        } else {
          if (await env.RATE_KV.get(rateKey)) {
            return Response.json({ error: '今日解讀已使用', code: 'RATE_LIMITED' }, { status: 429, headers: cors });
          }
        }
      }

      // ── SSE streaming response ──
      const sseHeaders = {
        ...cors,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      };

      const { readable, writable } = new TransformStream();
      const writer = writable.getWriter();
      const encoder = new TextEncoder();

      function sendSSE(event, data) {
        const payload_str = typeof data === 'string' ? data : JSON.stringify(data);
        return writer.write(encoder.encode(`event: ${event}\ndata: ${payload_str}\n\n`));
      }


      // 在背景執行 AI 流程
      const aiProcess = (async () => {
        try {
          // ★ Bug #1 修復：OOTK 追問（mode=tarot_followup + ootkData 有實際五階段資料）要走 OOTK_PROMPT
          // ★ Bug E 修復：!!{} === true，必須檢查 operations 存在才算真正的 OOTK 追問
          const isOotkFollowUp = (payload.mode === 'tarot_followup' && payload.ootkData && payload.ootkData.operations && Object.keys(payload.ootkData.operations).length > 0);
          const isTarotFollowUp = (payload.mode === 'tarot_followup' && !isOotkFollowUp);
          const isTarotOnly = (payload.mode === 'tarot_only' || isTarotFollowUp);
          const isOotk = (payload.mode === 'ootk' || isOotkFollowUp);
          const isFullFollowUpMode = (payload.mode === 'full_followup');
          let aiResult = null;
          let analysisNotes = '';
          let result;
          let questionPlan = null;
          let autoPassPlan = null;

          // ★ v15：七維度追問
          if (isFullFollowUpMode) {
            await sendSSE('progress', { step: 'reading', message: '正在結合七系統回答追問…' });
            const fullFuMsg = buildFullFollowUpMessage(payload);
            analysisNotes += 'mode=full_followup; msg_len=' + fullFuMsg.length + '; ';
            const fullFuPrompt = DIRECT_PROMPT + `\n\n═══ 追問模式 ═══\n這是用戶看完你上一輪七系統交叉解讀後的追問。上一輪的結論已經給了，用戶接受了，現在是追問更細的問題。\n\n你不要重複上一輪講過的東西。補充牌是對追問的直接回應——你只看補充牌在說什麼，結合七系統背景回答追問。不要重新分析每套系統。\n\n追問回答精準命中重點就好，不要長篇大論。策略：先點名他心裡期望的結果→用補充牌翻轉那個期望→描述補充牌畫面映射到他的場景→給出具體後果→一個今天就能做的小動作。\n\n輸出 JSON（不加 markdown）：\n{ "directAnswer": "直接回答追問", "answer": "補充牌解讀 + 結合七系統背景的分析，重點就好", "closing": "一句話收尾", "crystalRec": "水晶名（沒清單就省略）", "crystalReason": "理由（沒清單就省略）" }`;
            await sendSSE('progress', { step: 'analyzing', message: '交叉比對補充牌…' });
            aiResult = await callAI(env, fullFuPrompt, fullFuMsg, 1500, 0.68, 'claude-sonnet-4-20250514', () => sendSSE('ping', ''));
          } else if (isOotk) {
            await sendSSE('progress', { step: 'reading', message: '正在執行開鑰之法…' });
            let ootkMessage;
            let ootkPrompt = OOTK_PROMPT;
            let ootkMaxTokens = 4500;
            if (isOotkFollowUp) {
              // ★ Bug #2 修復：OOTK 追問走專用 message builder + 追問 prompt 後綴
              ootkMessage = buildOotkFollowUpMessage(payload);
              ootkPrompt = OOTK_PROMPT + `\n\n═══ 追問模式 ═══\n這是用戶看完你上一輪五階段解讀後的追問。上一輪的結論已經給了，用戶接受了，現在是追問更細的問題。\n\n你不要重複上一輪講過的東西。補充牌是對追問的直接回應——你只看補充牌在說什麼，結合原本五階段的背景來回答追問。不要重新分析五階段。\n\n追問回答精準命中重點就好，不要長篇大論。策略：先點名他心裡期望的結果→用補充牌翻轉那個期望→描述補充牌畫面映射到他的場景→給出具體後果→一個今天就能做的小動作。`;
              ootkMaxTokens = 1500;
              analysisNotes += 'mode=ootk_followup; msg_len=' + ootkMessage.length + '; ';
            } else {
              ootkMessage = buildOotkUserMessage(payload);
              analysisNotes += 'mode=ootk; msg_len=' + ootkMessage.length + '; ';
            }
            await sendSSE('progress', { step: 'analyzing', message: '五階段數據匯聚中…' });
            aiResult = await callAI(env, ootkPrompt, ootkMessage, ootkMaxTokens, 0.68, 'claude-sonnet-4-20250514', () => sendSSE('ping', ''));
          } else if (isTarotOnly) {
            await sendSSE('progress', { step: 'reading', message: '正在感應你的牌…' });
            const tarotMessage = buildTarotUserMessage(payload);
            analysisNotes += 'mode=tarot_only; msg_len=' + tarotMessage.length + '; ';
            await sendSSE('progress', { step: 'analyzing', message: '深入解讀牌面訊息…' });

            // 追問模式：加上下文銜接指令
            let fuPrompt = TAROT_PROMPT;
            const isFollowUp = !!(payload.tarotData && payload.tarotData.followUp && payload.tarotData.followUp.question);
            if (isFollowUp) {
              const fuPrefix = `\n\n═══ 追問模式 ═══\n這是用戶看完你上一輪解讀後的追問。上一輪的結論已經給了，用戶接受了，現在是在那個基礎上追問更細的問題。\n\n你不要重複上一輪講過的東西。補充牌是對追問的直接回應——你只看補充牌在說什麼，回答追問。需要的時候可以引用原本牌陣當背景，但不要重新分析。\n\n追問回答精準命中重點就好，不要長篇大論。策略：\n1. 先點名他心裡期望的結果\n2. 用補充牌翻轉那個期望\n3. 描述補充牌的訊號，映射到他追問的場景\n4. 給出具體後果\n5. 一個今天就能做的小動作`;
              fuPrompt = TAROT_PROMPT + fuPrefix;
            }

            aiResult = await callAI(env, fuPrompt, tarotMessage, isFollowUp ? 1500 : 4500, 0.68, 'claude-sonnet-4-20250514', () => sendSSE('ping', ''));
          } else {
            questionPlan = buildLocalQuestionPlan(payload);
            autoPassPlan = buildAutoPassPlan(payload, questionPlan);
            await sendSSE('progress', { step: 'reading', message: '正在翻閱你的七維命盤…' });
            let fullMessage = buildUserMessage(payload, questionPlan, autoPassPlan);
            
            const MAX_MSG_CHARS = 50000;
            if (fullMessage.length > MAX_MSG_CHARS) {
              analysisNotes += 'payload_trimmed_from_' + fullMessage.length + '_to_' + MAX_MSG_CHARS + '; ';
              // 進一步縮減每系統上限
              // ★ v14：payload.readings 已被 v2 wrapper delete，只剩 rawReadings
              const rr = payload.rawReadings || {};
              const readingKeys = Object.keys(rr).sort((a, b) => safeString(rr[b]).length - safeString(rr[a]).length);
              for (const key of readingKeys) {
                if (fullMessage.length <= MAX_MSG_CHARS) break;
                if (rr[key] && safeString(rr[key]).length > 2000) {
                  rr[key] = safeString(rr[key]).slice(0, 2000) + '\n…（已精簡）';
                }
              }
              fullMessage = buildUserMessage(payload, questionPlan, autoPassPlan);
              // 二次修剪：如果 readings 砍完還是超標，砍輔助欄位
              // ★ Bug #5 修復：trim 順序調整——dims.meihua（時機/體用）是推時間的關鍵，最後才砍
              if (fullMessage.length > MAX_MSG_CHARS) {
                if (payload.caseFramework) delete payload.caseFramework;
                if (payload.meihuaNarrative) delete payload.meihuaNarrative;
                if (payload.semanticResonance && payload.semanticResonance.length > 3) payload.semanticResonance = payload.semanticResonance.slice(0, 3);
                if (payload.conflictDescriptions && payload.conflictDescriptions.length > 4) payload.conflictDescriptions = payload.conflictDescriptions.slice(0, 4);
                if (payload.dims) {
                  // ★ v14：trim 順序根據 focusType 動態調整
                  // 感情/人際 → natal 行運有價值（金星/七宮），先砍 vedic
                  // 事業/財運 → vedic Dasha 有時間價值，先砍 tarot 結構
                  // 健康 → natal 行運很重要，先砍 tarot
                  var _ft = payload.focusType || 'general';
                  if (_ft === 'love' || _ft === 'relationship' || _ft === 'family') {
                    // 感情類：vedic → tarot → natal（natal 行運留到最後）
                    if (payload.dims.vedic) delete payload.dims.vedic;
                    if (fullMessage.length > MAX_MSG_CHARS) { fullMessage = buildUserMessage(payload, questionPlan, autoPassPlan); }
                    if (fullMessage.length > MAX_MSG_CHARS && payload.dims.tarot) delete payload.dims.tarot;
                  } else if (_ft === 'career' || _ft === 'wealth') {
                    // 事業財運：tarot → natal → vedic（vedic Dasha 推時間留到最後）
                    if (payload.dims.tarot) delete payload.dims.tarot;
                    if (fullMessage.length > MAX_MSG_CHARS) { fullMessage = buildUserMessage(payload, questionPlan, autoPassPlan); }
                    if (fullMessage.length > MAX_MSG_CHARS && payload.dims.natal) delete payload.dims.natal;
                  } else {
                    // 一般/健康：vedic → tarot → natal（原順序）
                    if (payload.dims.vedic) delete payload.dims.vedic;
                    if (payload.dims.natal) delete payload.dims.natal;
                    if (payload.dims.tarot) delete payload.dims.tarot;
                  }
                }
                fullMessage = buildUserMessage(payload, questionPlan, autoPassPlan);
                // 三次修剪：還是超標才砍梅花深層
                if (fullMessage.length > MAX_MSG_CHARS && payload.dims && payload.dims.meihua) {
                  delete payload.dims.meihua;
                  fullMessage = buildUserMessage(payload, questionPlan, autoPassPlan);
                }
                analysisNotes += 'secondary_trim_to_' + fullMessage.length + '; ';
              }
            }
            
            await sendSSE('progress', { step: 'analyzing', message: '七套系統交叉比對中…' });
            aiResult = await callAI(env, DIRECT_PROMPT, fullMessage, 4500, 0.68, 'claude-sonnet-4-20250514', () => sendSSE('ping', ''));
          }

          try { result = parseJSON(aiResult.text); } catch (e) { result = { answer: aiResult.text }; }

          if (result && typeof result.answer === 'string') {
            const ans = result.answer.trim();
            if (ans.startsWith('{') || ans.startsWith('```')) {
              try {
                const nested = parseJSON(ans);
                if (nested && typeof nested === 'object') result = nested;
              } catch (_) {}
            }
          }
          // 新結構也可能被包在 structure 裡
          if (result && typeof result.structure === 'string') {
            const st = result.structure.trim();
            if (st.startsWith('{') || st.startsWith('```')) {
              try {
                const nested = parseJSON(st);
                if (nested && typeof nested === 'object') result = nested;
              } catch (_) {}
            }
          }

          if (!result.closing && result.oneliner) result.closing = result.oneliner;
          if (!result.closing && result.summary) result.closing = result.summary;
          // 向後相容：reading → answer
          if (!result.answer && result.reading) {
            result.answer = result.reading;
          }
          // 向後相容：如果 AI 還是回了舊的 5 欄位結構
          if (!result.answer && result.structure) {
            result.answer = [result.structure, result.event, result.timing, result.action, result.hidden].filter(Boolean).join('\n\n');
          }

          // ═══ Rate limit 寫入 ═══
          if (!isAdmin && !isPaidUser && env.RATE_KV) {
            if (isFullFollowUpMode || isOotkFollowUp || isTarotFollowUp) {
              // 所有追問共用同一個追問額度
              const fuKey = `tarot_fu:${today}:${ip}`;
              await env.RATE_KV.put(fuKey, '1', { expirationTtl: 86400 });
            } else if (isOotk) {
              const ootkKey = `ootk:${today}:${ip}`;
              await env.RATE_KV.put(ootkKey, '1', { expirationTtl: 86400 });
            } else if (isTarotOnly) {
              const tarotKey = `tarot:${today}:${ip}`;
              await env.RATE_KV.put(tarotKey, '1', { expirationTtl: 86400 });
            } else {
              await env.RATE_KV.put(rateKey, '1', { expirationTtl: 86400 });
            }
          }

          // ★ 付費用戶用完後消耗 token（一次性使用）
          if (isPaidUser && paidTradeNo && env.RATE_KV) {
            await env.RATE_KV.delete(`paid_token:${paidTradeNo}`);
          }

          const _resultMode = isFullFollowUpMode ? 'full_followup' : (isOotk ? 'ootk' : (isTarotOnly ? 'tarot_only' : 'full'));
          const totalUsage = isAdmin ? {
            input_tokens: aiResult?.usage?.input_tokens || 0,
            output_tokens: aiResult?.usage?.output_tokens || 0,
            model: 'sonnet',
            mode: _resultMode,
            autoPassPlan,
          } : undefined;

          await sendSSE('result', {
            result,
            mode: _resultMode,
            questionPlan: isAdmin ? questionPlan : undefined,
            analysisNotes: isAdmin ? analysisNotes : undefined,
            autoPassPlan: isAdmin ? autoPassPlan : undefined,
            usage: totalUsage
          });

          // ═══ 非管理員完成命理 → 通知管理員 ═══
          if (!isAdmin && env.RATE_KV) {
            try {
              // ★ v15：nMode 細分追問，加 isPaid 欄位
              var _isFollowUp = isFullFollowUpMode || isOotkFollowUp || isTarotFollowUp;
              var nMode = isFullFollowUpMode ? 'full_followup' : (isOotkFollowUp ? 'ootk_followup' : (isOotk ? 'ootk' : (isTarotFollowUp ? 'tarot_followup' : (isTarotOnly ? 'tarot' : 'full'))));
              var nQuestion = safeString(payload.question).substring(0, 60);
              var nName = safeString(payload.name) || '匿名';
              var nTime = new Date().toISOString();
              var nKey = 'notify:' + nTime.replace(/[:.]/g, '') + ':' + Math.random().toString(36).substring(2, 6);
              var nData = JSON.stringify({ mode: nMode, name: nName, question: nQuestion, time: nTime, ip: ip, paid: isPaidUser, followUp: _isFollowUp });
              await env.RATE_KV.put(nKey, nData, { expirationTtl: 604800 }); // 7天過期
            } catch(ne) { console.error('notification error:', ne); }
          }

        } catch (err) {
          console.error('Worker AI process error:', err);
          await sendSSE('error', { error: err.message || '伺服器錯誤' });
        } finally {
          await writer.close();
        }
      })();

      return new Response(readable, { headers: sseHeaders });

    } catch (err) {
      console.error('Worker error:', err);
      return Response.json({ error: '伺服器錯誤', detail: err.message }, { status: 500, headers: cors });
    }
  },
};
