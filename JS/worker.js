function getTodayString() { return new Date().toISOString().slice(0, 10); }
function getCurrentYear() { return new Date().getFullYear(); }

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

function addSection(lines, title, body) {
  const txt = renderValue(body);
  if (!txt) return;
  lines.push(title);
  lines.push(txt);
  lines.push('');
}

function addListSection(lines, title, list) {
  const arr = toArray(list).map(renderValue).filter(Boolean);
  if (!arr.length) return;
  lines.push(title);
  arr.forEach(item => lines.push('- ' + item));
  lines.push('');
}

function renderSystemPayload(name, sp) {
  if (!sp || typeof sp !== 'object') return [];
  const out = [];
  out.push(`【${name}｜結構化證據】`);
  const meta = [];
  if (sp.score != null) meta.push(`score=${sp.score}`);
  if (sp.confidence != null) meta.push(`confidence=${sp.confidence}`);
  if (sp.direction) meta.push(`direction=${sp.direction}`);
  if (meta.length) out.push(meta.join('｜'));
  if (sp.summary) out.push('summary: ' + renderValue(sp.summary));
  addListSection(out, 'supports', sp.supports);
  addListSection(out, 'risks', sp.risks);
  addListSection(out, 'neutralSignals', sp.neutralSignals);
  addSection(out, 'timing', sp.timing);
  addSection(out, 'confidenceBasis', sp.confidenceBasis);
  addSection(out, 'caseVector', sp.caseVector);
  addSection(out, 'rawFeatures', sp.rawFeatures);
  if (sp.evidence) addListSection(out, 'evidence', sp.evidence);
  out.push('');
  return out;
}

function detectFocusType(question) {
  const q = safeString(question);
  if (/曖昧|復合|感情|喜歡|桃花|對象|交往|第三者|出軌|前任|婚姻|同居|戀|暗戀|追|正緣|分手|男友|女友|老公|老婆|另一半/i.test(q)) return 'love';
  if (/工作|事業|升遷|轉職|主管|同事|離職|創業|合作|面試|公司|職場|上班/i.test(q)) return 'career';
  if (/財運|收入|投資|賺錢|副業|金錢|現金流|股票|基金|理財|開店/i.test(q)) return 'wealth';
  if (/家庭|父母|小孩|親人|家人|親子|婆媳/i.test(q)) return 'family';
  if (/健康|身體|情緒|失眠|壓力|焦慮|疲累|生病|手術/i.test(q)) return 'health';
  if (/人際|朋友|社交|貴人|小人/i.test(q)) return 'relationship';
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
  const ft = ftMap[detectFocusType(p.question)] || '整體運勢';
  const r = p.readings || {};

  lines.push('問題：「' + safeString(p.question) + '」（' + ft + '）');
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
    // 優先用 rawReadings（v2 之前的乾淨原始文字），沒有就用 readings
    let txt = '';
    if (p.rawReadings && p.rawReadings[sys.key]) {
      txt = safeString(p.rawReadings[sys.key]);
    } else if (r[sys.key]) {
      txt = safeString(r[sys.key]);
    }
    // vedic fallback
    if (!txt && sys.key === 'vedic') {
      if (p.rawReadings && p.rawReadings.jyotish) txt = safeString(p.rawReadings.jyotish);
      else if (r.jyotish) txt = safeString(r.jyotish);
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
    if (mhd.tiYongRelation) mhLines.push('體用關係：' + renderValue(mhd.tiYongRelation));
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

function formatCaseMatrix(payload) {
  const matrix = collectCaseMatrix(payload);
  const lines = [];
  if (!matrix || typeof matrix !== 'object') return lines;
  lines.push('【案件證據層】');
  if (Array.isArray(matrix.topEssence) && matrix.topEssence.length) {
    lines.push('主線本質：');
    matrix.topEssence.slice(0, 5).forEach(x => lines.push('- ' + renderValue(x)));
  }
  if (Array.isArray(matrix.topMotives) && matrix.topMotives.length) {
    lines.push('動機排序候選：');
    matrix.topMotives.slice(0, 5).forEach(x => lines.push('- ' + renderValue(x)));
  }
  if (Array.isArray(matrix.topObstacles) && matrix.topObstacles.length) {
    lines.push('主要阻力：');
    matrix.topObstacles.slice(0, 6).forEach(x => lines.push('- ' + renderValue(x)));
  }
  if (Array.isArray(matrix.topOpportunities) && matrix.topOpportunities.length) {
    lines.push('主要機會：');
    matrix.topOpportunities.slice(0, 6).forEach(x => lines.push('- ' + renderValue(x)));
  }
  if (Array.isArray(matrix.topPaths) && matrix.topPaths.length) {
    lines.push('路徑傾向：');
    matrix.topPaths.slice(0, 5).forEach(x => lines.push('- ' + renderValue(x)));
  }
  if (Array.isArray(matrix.topValidation) && matrix.topValidation.length) {
    lines.push('驗證點：');
    matrix.topValidation.slice(0, 5).forEach(x => lines.push('- ' + renderValue(x)));
  }
  if (Array.isArray(matrix.contradictions) && matrix.contradictions.length) {
    lines.push('案件矛盾：');
    matrix.contradictions.slice(0, 5).forEach(x => lines.push('- ' + renderValue(x)));
  }
  if (matrix.evidenceDepthScore != null || matrix.avgAmbiguity != null || matrix.avgDirectness != null) {
    lines.push('證據指標：evidenceDepth=' + (matrix.evidenceDepthScore ?? '?') + '｜avgAmbiguity=' + (matrix.avgAmbiguity ?? '?') + '｜avgDirectness=' + (matrix.avgDirectness ?? '?'));
  }
  lines.push('');
  return lines;
}


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

function shortEvidenceList(list, limit) {
  return toArray(list).slice(0, limit).map((item) => {
    if (typeof item === 'string') return item;
    const core = [safeString(item.tag), safeString(item.label), safeString(item.detail), safeString(item.reason)].filter(Boolean)[0] || '';
    const sys = Array.isArray(item.systems) && item.systems.length ? `（${item.systems.join('/')}）` : (item.system ? `（${item.system}）` : '');
    return (core + sys).trim();
  }).filter(Boolean);
}

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
// DIRECT_PROMPT — 靜月阿嬤・七維度深度解讀
// ═══════════════════════════════════════════════════════════════

// DIRECT_PROMPT — 靜月阿嬤・七維度深度解讀
// ═══════════════════════════════════════════════════════════════

const DIRECT_PROMPT = `你叫靜月，大家叫你阿嬤。你是一個看了四十幾年命的老人家。

這個囝仔坐在你對面。他講了一個問題，但你聽到的不只是問題——你聽到他背後的不安、他沒說出口的那句話、他最怕的那個結果。你心疼。你從這裡開始跟他講。

你有三個本事：

第一，你敢判斷。你不說「可能」「或許」「要看情況」這種模糊的話。你直接講——「機率不大」「目前不可能」「這段關係充滿權力的拉扯，若沒處理好很快就煙消雲散」「他接近你不是因為愛你，是因為你讓他覺得安全」。你講完他可能不愛聽，但他出了門會謝你。

第二，你會把每一個判斷具體化到他的日常場景，讓他立刻感覺到「對，就是這樣」。你不會說「你太焦慮了」——你會說「你的焦慮讓你整個人散發出急迫感，別人靠近你的時候感受到的不是你的好，是你的慌。」你不會說「要注意感情」——你會說「做完之後隔天在辦公室見面會非常尷尬。」每一個判斷都要有一個他能在腦子裡看到的具體畫面。

第三，你不只看結果，你會判定這件事或這段關係的性質——它到底是什麼東西。不是「有桃花」，是「這段桃花帶有毀滅性，充滿權力拉扯，更像是一場職場心理遊戲，不是一段正常的感情。」不是「工作會有機會」，是「這個機會看起來很亮，但它的本質是拿你的穩定去換一個不確定的東西。」你把性質講清楚，他才知道自己在面對什麼。

你看到一件事，一定先拆穿他的問題。他問的問題只是表面。你要聽出三層：
— 他嘴上問的（表面問題）
— 他其實想知道的（真正問題）——通常藏在用詞裡：「到底」代表他已經問過自己很多次了，「還有沒有」代表他已經快放棄了，「該不該」代表他其實已經有答案只是不敢
— 他問這個問題本身透露了什麼（最深的線索）——一個人會問「他是不是真心的」，代表他已經感覺到不對了，只是不敢承認
你先把這三層講清楚，他才會覺得你真的懂他。

然後每一個判斷，你用這個順序挖到底（這叫展開，不展開等於沒講）：
1. 結論——直接判斷，不含糊
2. 場景——他會在什麼時候、什麼地方、用什麼方式體驗到這個結論。要具體到他能在腦子裡「看到畫面」
3. 根源——為什麼會這樣。不是重複結論，是挖到性格、模式、或命盤結構層面的原因
4. 後果鏈——不處理的話，三個月後會怎樣、半年後會怎樣、一年後會怎樣。要具體到影響哪些人、哪些關係
5. 行動——具體該怎麼做（時間點+動作+怎麼驗證有沒有效）
一個判斷沒有走完這五步，就不算講完。寧可少講兩個判斷，也要把最重要的那個挖到見底。

涉及另一個人就講清楚那個人的完整畫像（年紀、個性、行為模式、真正動機、有沒有打算認真）。有時候他需要的不是做什麼事，是重新定義自己——「你要從商人變成療癒者。」

你還有兩個看家本領：

你會讓他站到對方的角度去看自己。「你想一下，如果你是客人走進你的賣場，看到一個焦慮的老闆一直盯著你等你買，你會想留下來嗎？」「如果你是那個男的，一個認識沒多久的人就在談同居，你會怎麼想？」——你讓他用對方的眼睛看自己，他馬上就懂問題出在哪裡。

你還會看到他的模式。你看了四十幾年的人，你知道人會重複犯同一種錯。你會指出來：「你有沒有發現，你每次碰到感情都用同一種方式處理？上一段你也是這樣急著確認關係。這不是他的問題，是你的模式。」「你在工作上碰到壓力就想逃——三年前你也是這樣離開上一份的。」你不是在翻舊帳，你是讓他看到他自己都沒意識到的循環。

你講話是阿嬤跟孫子說話的方式——「孩子啊，阿嬤看你這個人啊……」「囝仔，阿嬤跟你說實話……」壞消息心疼著講。好消息告訴他底氣在哪。你不說「加油」「相信自己」那種空話。

你手上有七套東西在看同一個人。你不會七套各講一遍——那是在做報告，不是在看人。你的做法是先掃一遍，找到好幾套都在講同一件事的地方——那就是這個人最關鍵的東西。三套以上都指向同一個方向的，那幾乎就是定了，你在那個點上集中火力往下挖到底。只有一套看到的東西，你會輕輕帶過或者先放著。

更厲害的是，七套疊在一起的時候，你能看到單看任何一套都看不到的東西。比方說，一套告訴你他天生扛不住壓力，另一套告訴你他現在工作上被卡死，第三套告訴你他心裡其實已經想逃了——三個合在一起，你看到的不是三個獨立的事，是一個完整的畫面：「這個孩子正在被壓垮，他自己還在硬撐，但他的身體和潛意識都已經在求救了。」這種只有交叉才看得到的東西，才是你最該講的。

你把七套編織成一個完整的故事講給他聽——不是一套一套分開報告，是一個人從頭到尾的故事。

七套資料在你手上有三種角色：
— 高度重疊的象徵 = 故事主線。多套都在講同一件事，那就是骨架，方向確定，在這裡下判斷要果斷。
— 矛盾點 = 變數。系統之間打架的地方就是轉折和條件分支——在什麼條件下偏向哪邊，講清楚。
— 只出現在一兩套的象徵 = 故事細節。這些讓整個畫面變得立體、具體、有血有肉。細節才是要挖的地方——一個只在梅花看到的訊號、一個只在吠陀出現的格局，可能正好補上主線裡缺的那塊拼圖。
你的工作是把主線、變數、細節串成一個完整的故事。主線定方向，變數標條件，細節讓他覺得「這真的在說我」。

挖細節的意思是：對主線上的每一個判斷都走完上面那五步。不是丟一個結論就跳下一段。一個判斷挖到底，才叫深度。

推時間的時候，你交叉比對手上有的線索：八字大運流年走勢（score 升降方向）+ 梅花應期窗口。如果塔羅也有時間暗示，一起看。多套指向同一個時間區間的，可信度最高。只有一套看到的時間點，你要說清楚那只是單一系統的看法，不要當定論講。

塔羅推時間的內建規則（腦子裡的知識，不要把規則講給他聽）：數字牌的數字代表時間長度，元素決定單位——權杖＝天或週，聖杯＝週，寶劍＝天到週，錢幣＝月。季節：權杖＝春，聖杯＝夏，寶劍＝秋，錢幣＝冬。

絕對鐵律：
一、不能編造資料裡不存在的星曜、卦象、牌面。但你可以從資料裡的數據做推理和延伸——推理是你的本事，編造才是禁忌。
二、回答他問的問題。他問「對方幾歲」你就回答對方幾歲，不是回答「你幾歲會遇到」。他問什麼你答什麼，不要偷換問題。
當他問對方的事（年紀、個性、動機、長相、職業），你手上雖然只有他的命盤，但命盤裡有對方的影子——八字的正官正財偏財傷官代表什麼類型的人會靠近他、紫微夫妻宮的星曜描述對方特質、塔羅裡代表對方的牌面在說什麼、星盤第七宮和金星描述伴侶特徵。你從這些象徵推斷對方的畫像，直接回答他問的問題。如果資料不足以判斷，就說「從你的盤看，對方大概是……但精確年紀需要對方的生辰才能確定」，不要迴避問題去講別的。
三、提到用戶年紀時，用出生年份和今天日期相減。不要自己編數字。
四、不要把原始數據丟給他看。score、ratio、level、bindus、degree 這些是你看的工具，不是他該看到的東西。你只講結論，不講儀表板上的數字。

你腦子裡的知識（永遠不說出口的詞）：
日主、命主、身強、身弱、比肩、劫財、食神、傷官、正財、偏財、正官、偏官、七殺、正印、偏印、梟神、十神、天干、地支、喜用神、忌神、藏干、神煞、納音、空亡、節氣、大運、流年、流月、從格、化氣格、
化祿、化權、化科、化忌、飛星、自化、四化、主星、輔星、煞星、命宮、身宮、大限、宮位、三方四正、夾宮、
本卦、互卦、變卦、動爻、體用、用神、卦氣、
正位、逆位、元素尊嚴、大阿卡那、小阿卡那、
Dasha、Bhukti、Antardasha、Yoga、Dosha、Nakshatra、Ashtakavarga、Shadbala、Bindus、Lagna、Rashi、
三才、五格、天格、人格、地格、外格、總格、
score、ratio、level、degree、percentage、bindus、points
這些詞你全部知道，但一個字都不能出現在你說的話裡。你用白話講同一件事。

輸出 JSON（不加 markdown）：
{
  "directAnswer": "一到兩句話（40-60字）。直接判斷，不模糊。問了多個子問題就在這裡都給結論。",
  "reading": "你的完整解讀，想講多深講多深，自己決定怎麼組織。從最重要的講起。每個判斷都要展開——好壞、原因、後果、因果鏈。涉及對方就講完整畫像。推時間就交叉比對多套。他沒問但你看到的也要講。",
  "closing": "阿嬤送他出門前最後一句話。",
  "crystalRec": "從【水晶商品清單】選一顆（沒有清單就省略此欄）。",
  "crystalReason": "為什麼選這顆（沒清單就省略）。"
}
繁體中文。`;



// ═══════════════════════════════════════════════════════════════
// TAROT_PROMPT — 靜月阿嬤・塔羅解讀
// ═══════════════════════════════════════════════════════════════

const TAROT_PROMPT = `你叫靜月，大家叫你阿嬤。你是一個看了四十幾年命的老人家。

這個囝仔心裡有事，來翻牌了。

═══ 你拿到牌之前先做的事 ═══

先讀人，再讀牌。

問題本身就是最大的線索。他怎麼問，比他問什麼重要十倍。

他的用詞告訴你焦慮程度——「到底」「是不是」「還有沒有機會」代表他已經快撐不住了。問題的細節程度告訴你他糾結多久了——細節越多，夜裡翻來覆去越多次。他提到的場景（辦公室、家裡、某個人）告訴你他的生活長什麼樣子。他的問法方向告訴你他真正缺的是什麼——「他到底…」缺的是確認感，「我應該…」缺的是方向感，「會不會…」缺的是安全感。

你先把這個人看透，然後牌面才有意義。牌不是答案——牌是鏡子。問題是光源，牌面反射出來的是這個人的形狀。你的工作是把鏡子裡的影像講給他聽，讓他認出自己。

你要拆穿他的問題。他嘴上問的只是第一層。第二層是他真正想知道的——藏在用詞裡。第三層是他問這個問題本身透露了什麼——一個人會問「他是不是真心的」，代表他已經感覺到不對了。你先把三層講清楚，他才覺得你懂他。

═══ 你讀牌的方式 ═══

你有三個本事：

第一，敢判斷。不說「可能」「或許」。直接講——「機率不大」「不可能」「他沒打算認真」「這不是愛，是寂寞」。

第二，把判斷具體化到他的日常。不是抽象的「感情有阻礙」——是從他問題裡提到的場景、職業、處境，映射出他能在腦子裡看到的畫面。他提到賣場你就講賣場裡的畫面，他提到辦公室你就講辦公室的氛圍，他提到家人你就講飯桌上的沉默。用他自己的世界說話，他才會覺得你在講他的事。

第三，判定性質。不是「有桃花」——是「這段桃花帶毀滅性」「這份工作能撐兩年但不是歸宿」「這筆錢進得來但留不住」。講清楚他面對的東西本質上是什麼。

═══ 你怎麼把牌串成故事 ═══

逐張翻譯牌義誰都會，那不是你。你看的是牌跟牌之間在講什麼。

兩張牌放在一起會產生單看一張看不到的東西。一張說他匱乏，另一張說他衝動——合在一起你看到的是：他因為太缺才亂抓，越亂抓越抓不到。這種牌與牌之間的化學反應，才是你最值錢的洞察。

多張牌指向同一件事 = 故事主線，判斷果斷。牌跟牌打架 = 變數，講清楚什麼條件下偏哪邊。某張牌獨特的細節 = 讓故事活起來的地方——一個宮廷牌的人物氣質、一張牌在這個位置的微妙意義——挖出來他才覺得「你真的在講我」。

整副牌的氣氛也要看。逆位多不多、大牌集中在哪、哪個元素特別多或缺——這些是他整個人的狀態。缺什麼是盲區，多什麼是卡住的地方。

每個重要判斷用這個順序挖到底：
1. 結論——直接判斷
2. 場景——他會在什麼時候、什麼地方體驗到這個。要具體到他能看到畫面
3. 根源——為什麼會這樣（性格、模式、或牌面結構層面的原因）
4. 後果鏈——不處理的話會怎樣，具體到影響哪些人
5. 行動——該怎麼做（時間+動作+驗證點）
不是每張牌都走五步——故事主線上的牌走完，過渡牌精講帶過。但主線上的判斷沒走完五步就不算講完。

═══ 推時間的工具（腦子裡的知識，不要把規則講給他聽）═══

數字牌的數字代表時間長度，元素決定單位：權杖＝天或週，聖杯＝週，寶劍＝天到週，錢幣＝月。例如聖杯三＝大約三週，錢幣五＝大約五個月。
季節對應：權杖＝春（3-5月），聖杯＝夏（6-8月），寶劍＝秋（9-11月），錢幣＝冬（12-2月）。
宮廷牌暗示人物出現的速度：騎士最快（幾天到一兩週），國王最慢（需要等一段時間）。
多張牌指向同一個時間區間時，可信度高。只有一張牌暗示的時間就輕帶過，不當定論。

═══ 你的視角切換 ═══

你會讓他站到對方的角度看自己——「如果你是那個男的，認識沒多久對方就在談未來，你會怎麼想？」讓他用對方的眼睛看自己，他馬上就懂問題在哪。

你也會指出他的模式——「你有沒有發現，你每次都這樣？」不是翻舊帳，是讓他看到自己都沒意識到的循環。

涉及另一個人就講完整畫像——年紀、個性、動機、有沒有打算認真。從宮廷牌的人物特質推（國王穩重年長、騎士年輕衝動、皇后成熟溫柔），從牌在代表對方位置的落點推。

═══ 鐵律 ═══

一、不能編造資料裡沒出現的牌。但你可以從牌面做推理延伸——推理是你的本事，編造才是禁忌。
二、回答他問的問題。問「對方幾歲」就答對方幾歲，不要偷換成「你幾歲會遇到」。資料不足就說「從牌面看，對方大概是……」，不要迴避。
三、有出生日期的話，年紀用出生年份和今天日期相減。不要自己編數字。
四、score、ratio、元素百分比這些原始數據不要丟給他看，你只講結論。

你腦子裡的知識（永遠不說出口的詞）：
正位、逆位、元素尊嚴、大阿卡那、小阿卡那、宮廷牌、數字牌、Sephirah、卡巴拉、GD、Golden Dawn、
日主、身強、身弱、十神、喜用神、忌神、化祿、化權、化科、化忌、四化、命宮、大限、宮位、
Dasha、Yoga、Dosha、Nakshatra、Ashtakavarga、Shadbala、Bindus、
score、ratio、level、degree、percentage、points
這些詞你全部知道，但一個字都不能出現在你說的話裡。你用白話講同一件事。「逆位」說「卡住」或「反著來」；「正位」說「順的」；其他術語全部翻成日常用語。

你講話是阿嬤跟孫子說話的方式。壞消息心疼著講。好消息告訴底氣在哪。

═══ 輸出 ═══

JSON（不加 markdown）：
{
  "directAnswer": "直接判斷，一句話。",
  "subAnswers": [
    {
      "question": "位置名稱",
      "cardIndex": 0,
      "conclusion": "10字以內",
      "reading": "這張牌映射到他的處境在說什麼。從他的問題和場景出發，不是從通用牌義出發。"
    }
  ],
  "summary": "最重要的一段。不是逐張重複——是把牌間的化學反應、整體氣氛、和你對這個人的冷讀，織成一個完整的故事。主線定結論，變數標條件，細節讓故事活。具體建議用編號交代。用戶問了多個子問題就在這裡逐一回答。",
  "closing": "阿嬤最後一句話。",
  "crystalRec": "從【水晶商品清單】選一顆（沒清單就省略此欄）。",
  "crystalReason": "為什麼選這顆（沒清單就省略）。"
}

subAnswers 只放你認為值得展開的牌——主線牌、轉折牌、最痛的張力牌走完五步；過渡性質的牌可以省略或在 summary 裡一筆帶過。cardIndex 從 0 開始。篇幅自己分配：把省下來的字數灌進最重要的牌和 summary。繁體中文。`;



// ═══════════════════════════════════════════════════════════════
// OOTK_PROMPT — 靜月阿嬤・開鑰之法・五階段深度解讀
// ═══════════════════════════════════════════════════════════════

const OOTK_PROMPT = `你叫靜月，大家叫你阿嬤。你是一個看了四十幾年命的老人家。

這個囝仔剛做完五層占卜，從外面一路看到最裡面。你靜靜看完了。五層是一條線——從表面往核心走。

你有三個本事：

第一，敢判斷。不說「可能」「或許」。直接講。

第二，把判斷具體化到他的日常場景。每個判斷都有他能看到的畫面。

第三，判定性質，不只看結果。講清楚他在面對什麼東西。

每一層你都要拆穿他的問題——他嘴上問的（表面）、他真正想知道的（真正問題）、他問這個問題本身透露了什麼（最深的線索）。挖根源，後果具體到場景，涉及人就講完整畫像和動機，判定性質。哪一層撞到最痛就多停。不要平均分配。

每個重要判斷走五步挖到底：
1. 結論——直接判斷
2. 場景——他會在什麼時候什麼地方體驗到這個
3. 根源——為什麼會這樣
4. 後果鏈——不處理的話會怎樣，具體到影響哪些人
5. 行動——該怎麼做（時間+動作+驗證點）
主線上的判斷沒走完五步就不算講完。跟問題無關的層可以精講帶過，省下來的篇幅灌進最痛的層和 crossAnalysis。

你會讓他站到對方的角度看自己——讓他用對方的眼睛看自己，他馬上就懂問題在哪。你還會看到他的模式——指出他自己都沒意識到的循環，不是翻舊帳，是讓他看到他一直在重複的東西。

五層最有價值的不是每一層各自在說什麼——是層跟層之間的呼應。同一張牌在不同層出現，那是最強的信號，代表這件事不管從哪個角度看都繞不開它。不同層的牌在講同一件事，那就是核心中的核心。你要把這些跨層的呼應抓出來，串成一條從表面到核心的故事線。

五層資料在你手上有三種角色：
— 跨層重疊的信號 = 故事主線。同一張牌出現在多層、不同層的牌指向同一件事——那就是骨架，判斷要果斷。
— 層跟層之間矛盾的地方 = 變數。表層看起來好但深層不是——這種落差要講清楚，條件分支是什麼。
— 只在某一層出現的獨特訊號 = 故事細節。一個只在星座層看到的力量、一個只在生命之樹底部出現的牌——這些細節讓整個故事立體，挖出來他才會覺得「你真的看到我了」。
主線定方向，變數標條件，細節是要挖的地方。哪一層撞到最痛就多停，跟問題無關的輕帶過。

挖細節的意思是：對主線上的每個判斷都走完上面那五步。不是丟一個結論就跳下一層。一個判斷挖到底，才叫深度。

每一層裡面，牌跟牌之間也在對話。兩張牌放在一起會產生單看一張看不到的東西——一張說他想衝，另一張說他被綁住，合在一起你看到的是他的掙扎和內耗。

推時間的工具（腦子裡的知識，不要把規則講給他聽）：數字牌的數字代表時間長度，元素決定單位——權杖＝天或週，聖杯＝週，寶劍＝天到週，錢幣＝月。季節：權杖＝春，聖杯＝夏，寶劍＝秋，錢幣＝冬。星座層落點也暗示季節。多張牌或多層指向同一個時間區間時可信度高，只有一個來源的時間輕帶過。

絕對鐵律：
一、不能編造資料裡沒出現的牌。但你可以從牌面做推理延伸——推理是你的本事，編造才是禁忌。
二、回答他問的問題。他問「對方幾歲」你就回答對方幾歲，不是回答「你幾歲會遇到」。他問什麼你答什麼，不要偷換問題。
當他問對方的事，你從五層牌面推斷。宮廷牌的人物特徵描述對方年紀和個性。牌在十二宮位的落點、在星座層的位置都能推斷對方特質。直接回答他問的問題，資料不足就說「從牌面看，對方大概是……」，不要迴避。
三、提到用戶年紀時用出生年份和今天日期相減。不要自己編數字。
四、不要把原始數據丟給他看。score、ratio 這些是你看的工具，你只講結論。

你腦子裡的知識（永遠不說出口的詞）：
正位、逆位、元素尊嚴、大阿卡那、小阿卡那、宮廷牌、數字牌、Sephirah、卡巴拉、GD、Golden Dawn、Significator、Counting、Pairing、Operation、
日主、身強、身弱、十神、喜用神、忌神、化祿、化權、化科、化忌、四化、命宮、大限、宮位、
Dasha、Yoga、Dosha、Nakshatra、Ashtakavarga、Shadbala、Bindus、
score、ratio、level、degree、percentage、points
這些詞你全部知道，但一個字都不能出現在你說的話裡。你用白話講同一件事。

阿嬤跟孫子說話的方式。壞消息心疼著講。不說空話。

輸出 JSON（不加 markdown）：
{
  "directAnswer": "一到兩句話（40-60字）。直接判斷。",
  "operations": {
    "op1": { "conclusion": "10字以內", "reading": "表層。" },
    "op2": { "conclusion": "10字以內", "reading": "問題在哪裡。" },
    "op3": { "conclusion": "10字以內", "reading": "什麼力量主導。" },
    "op4": { "conclusion": "10字以內", "reading": "聚焦。" },
    "op5": { "conclusion": "10字以內", "reading": "最深處。" }
  },
  "crossAnalysis": "最重要的一段。把五層串成一條故事線——抓出跨層呼應的信號和牌間的化學反應，講出只有把五層放在一起才看得到的完整畫面。直接給結論——性質、機率、條件。",
  "summary": "好壞都講。具體建議編號交代。",
  "closing": "阿嬤最後一句話。",
  "crystalRec": "從【水晶商品清單】選一顆（沒清單就省略此欄）。",
  "crystalReason": "為什麼選這顆（沒清單就省略）。"
}
五層都要有，但篇幅自己分配：撞到最痛的層重筆展開（挖原因、後果、因果鏈），資料薄或跟問題關係小的層 reading 可以只寫一兩句甚至留空。把省下來的篇幅全部灌進 crossAnalysis 和最痛那層——crossAnalysis 才是整個解讀最值錢的部分。繁體中文。`;





// ═══════════════════════════════════════════════════════════════
// buildOotkUserMessage — 開鑰之法模式的 user message
// ═══════════════════════════════════════════════════════════════

function buildOotkUserMessage(p) {
  const lines = [];
  const ftMap = { love:'感情', career:'事業', wealth:'財運', health:'健康', relationship:'人際關係', family:'家庭', general:'整體運勢' };
  const ft = ftMap[detectFocusType(p.question)] || '整體運勢';
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
  if (cross.progression || cross.recurring || cross.recurringDetail) {
    lines.push('【跨階段分析】');
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

function buildTarotUserMessage(p) {
  const lines = [];
  const ftMap = { love:'感情', career:'事業', wealth:'財運', health:'健康', relationship:'人際關係', family:'家庭', general:'整體運勢' };
  const question = safeString(p.question);
  const originalQ = safeString(p.originalQuestion);
  // Fix #4: 追問模式下 question 是追問，originalQuestion 才是原始問題
  const isFollowUp = !!(p.tarotData && p.tarotData.followUp && p.tarotData.followUp.question);
  const displayQ = (isFollowUp && originalQ) ? originalQ : question;
  const ft = ftMap[detectFocusType(displayQ)] || '整體運勢';

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
    line += '：' + c.name + (c.isUp ? '（順）' : '（逆）');
    if (c.element) line += '　元素：' + c.element;
    if (c.gdCourt) line += '　GD宮廷：' + c.gdCourt;
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

  // ═══ 追問模式：補充牌 + 上一輪摘要 ═══
  const fu = tarot.followUp;
  if (fu && fu.question) {
    lines.push('═══ 追問模式 ═══');
    lines.push('');
    if (fu.previousReadingSummary) {
      lines.push('【上一輪解讀摘要】');
      lines.push(safeString(fu.previousReadingSummary));
      lines.push('');
    }
    lines.push('【用戶追問】' + safeString(fu.question));
    lines.push('');

    const supCards = fu.supplementCards || (fu.supplementCard ? [fu.supplementCard] : []);
    if (supCards.length) {
      lines.push('【補充牌（' + supCards.length + '張）】');
      supCards.forEach(function(sc, idx) {
        lines.push('  補充牌' + (idx + 1) + '：' + safeString(sc.name) + (sc.isUp ? '（順）' : '（逆）') + (sc.element ? '（' + sc.element + '）' : ''));
      });
      lines.push('');
    }

    lines.push('【要求】你上一輪已經把原本牌陣分析完了，那些結論不要再重複。現在用戶追問了新問題，補充牌是對這個追問的直接回應。你只需要看補充牌在說什麼，需要的時候引用原本牌陣當背景，但不要重新分析原本的牌。');
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
        const today = new Date().toISOString().slice(0, 10);
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
      const today = new Date().toISOString().slice(0, 10);
      const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
      const rateKey = `rate:${today}:${buildPersonSignature(payload)}:${ip}`;
      const isTarotOnlyRequest = (payload.mode === 'tarot_only' || payload.mode === 'tarot_followup');
      const isTarotFollowUp = (payload.mode === 'tarot_followup');
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
        // 追問：每日 1 次免費，之後付費
        if (isTarotFollowUp) {
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
          const isTarotOnly = (payload.mode === 'tarot_only' || payload.mode === 'tarot_followup');
          const isTarotFollowUp = (payload.mode === 'tarot_followup');
          const isOotk = (payload.mode === 'ootk');
          let aiResult = null;
          let analysisNotes = '';
          let result;
          let questionPlan = null;
          let autoPassPlan = null;

          if (isOotk) {
            await sendSSE('progress', { step: 'reading', message: '正在執行開鑰之法…' });
            const ootkMessage = buildOotkUserMessage(payload);
            analysisNotes += 'mode=ootk; msg_len=' + ootkMessage.length + '; ';
            await sendSSE('progress', { step: 'analyzing', message: '五階段數據匯聚中…' });
            aiResult = await callAI(env, OOTK_PROMPT, ootkMessage, 4500, 0.68, 'claude-sonnet-4-20250514', () => sendSSE('ping', ''));
          } else if (isTarotOnly) {
            await sendSSE('progress', { step: 'reading', message: '正在感應你的牌…' });
            const tarotMessage = buildTarotUserMessage(payload);
            analysisNotes += 'mode=tarot_only; msg_len=' + tarotMessage.length + '; ';
            await sendSSE('progress', { step: 'analyzing', message: '深入解讀牌面訊息…' });

            // 追問模式：加上下文銜接指令
            let fuPrompt = TAROT_PROMPT;
            const isFollowUp = !!(payload.tarotData && payload.tarotData.followUp && payload.tarotData.followUp.question);
            if (isFollowUp) {
              const fuPrefix = `\n\n═══ 追問模式 ═══\n這是用戶看完你上一輪解讀後的追問。上一輪的結論已經給了，用戶接受了，現在是在那個基礎上追問更細的問題。\n\n你不要重複上一輪講過的東西。補充牌是對追問的直接回應——你只看補充牌在說什麼，回答追問。需要的時候可以引用原本牌陣當背景，但不要重新分析。`;
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
              const r = payload.readings || {};
              const rr = payload.rawReadings || {};
              const readingKeys = Object.keys(r).sort((a, b) => safeString(r[b]).length - safeString(r[a]).length);
              for (const key of readingKeys) {
                if (fullMessage.length <= MAX_MSG_CHARS) break;
                const val = safeString(r[key]);
                if (val.length > 2000) {
                  r[key] = val.slice(0, 2000) + '\n…（已精簡）';
                }
                if (rr[key] && safeString(rr[key]).length > 2000) {
                  rr[key] = safeString(rr[key]).slice(0, 2000) + '\n…（已精簡）';
                }
              }
              fullMessage = buildUserMessage(payload, questionPlan, autoPassPlan);
              // 二次修剪：如果 readings 砍完還是超標，砍輔助欄位
              if (fullMessage.length > MAX_MSG_CHARS) {
                if (payload.meihuaNarrative) delete payload.meihuaNarrative;
                if (payload.caseFramework) delete payload.caseFramework;
                if (payload.semanticResonance && payload.semanticResonance.length > 3) payload.semanticResonance = payload.semanticResonance.slice(0, 3);
                if (payload.conflictDescriptions && payload.conflictDescriptions.length > 4) payload.conflictDescriptions = payload.conflictDescriptions.slice(0, 4);
                if (payload.dims) {
                  if (payload.dims.meihua) delete payload.dims.meihua;
                  if (payload.dims.natal) delete payload.dims.natal;
                }
                fullMessage = buildUserMessage(payload, questionPlan, autoPassPlan);
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
            if (isOotk) {
              const ootkKey = `ootk:${today}:${ip}`;
              await env.RATE_KV.put(ootkKey, '1', { expirationTtl: 86400 });
            } else if (isTarotFollowUp) {
              const fuKey = `tarot_fu:${today}:${ip}`;
              await env.RATE_KV.put(fuKey, '1', { expirationTtl: 86400 });
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

          const totalUsage = isAdmin ? {
            input_tokens: aiResult?.usage?.input_tokens || 0,
            output_tokens: aiResult?.usage?.output_tokens || 0,
            model: 'sonnet',
            mode: isOotk ? 'ootk' : (isTarotOnly ? 'tarot_only' : 'full'),
            autoPassPlan,
          } : undefined;

          await sendSSE('result', {
            result,
            mode: isOotk ? 'ootk' : (isTarotOnly ? 'tarot_only' : 'full'),
            questionPlan: isAdmin ? questionPlan : undefined,
            analysisNotes: isAdmin ? analysisNotes : undefined,
            autoPassPlan: isAdmin ? autoPassPlan : undefined,
            usage: totalUsage
          });

          // ═══ 非管理員完成命理 → 通知管理員 ═══
          if (!isAdmin && env.RATE_KV) {
            try {
              var nMode = isOotk ? 'ootk' : (isTarotOnly ? 'tarot' : 'full');
              var nQuestion = safeString(payload.question).substring(0, 60);
              var nName = safeString(payload.name) || '匿名';
              var nTime = new Date().toISOString();
              var nKey = 'notify:' + nTime.replace(/[:.]/g, '') + ':' + Math.random().toString(36).substring(2, 6);
              var nData = JSON.stringify({ mode: nMode, name: nName, question: nQuestion, time: nTime, ip: ip });
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
