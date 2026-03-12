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
const PRICE_TAROT = 30;  // NT$30 塔羅快讀
const PRICE_FULL = 50;   // NT$50 七維度深度
const PRICE_OOTK = 40;   // NT$40 開鑰之法
const PRICE_FOLLOWUP = 10; // NT$10 塔羅追問

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

function parseJSON(raw) {
  let c = String(raw || '').trim();
  if (!c) return {};
  // Strip markdown fences
  if (c.startsWith('```')) c = c.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
  // Try direct parse first
  try { return JSON.parse(c); } catch(_) {}
  // AI sometimes adds text before/after JSON — extract the outermost { }
  const first = c.indexOf('{');
  const last = c.lastIndexOf('}');
  if (first !== -1 && last > first) {
    try { return JSON.parse(c.slice(first, last + 1)); } catch(_) {}
  }
  // Last resort: return as raw text
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

function inferDeepQuestionModel(p) {
  const focus = p.focusType || 'general';
  const q = safeString(p.question);
  const lines = [];
  lines.push('【本題偵查角度】');
  lines.push('- 一律拆：表面問題 / 核心問題 / 事件本質 / 角色動力 / 阻力來源 / 短中長路徑 / 驗證點 / 誤判點 / 不改代價');

  if (focus === 'love' || /曖昧|復合|感情|喜歡|桃花|對象|交往|第三者|出軌|前任|婚姻|同居/i.test(q)) {
    lines.push('- 感情附則：拆靠近本質、動機排序、承擔力、關係狀態、模糊成本');
  } else if (focus === 'career' || /工作|事業|升遷|轉職|主管|同事|離職|創業|合作/i.test(q)) {
    lines.push('- 事業附則：拆位置是否對、短期機會 vs 長期承接、權責關係、制度壓力、合作風險');
  } else if (focus === 'wealth' || /財運|收入|投資|賺錢|副業|金錢|現金流/i.test(q)) {
    lines.push('- 財務附則：拆現金流、節奏、風險控制、合作依賴、貪快代價、可持續性');
  } else if (focus === 'family' || /家庭|父母|小孩|親人|婚姻|家人/i.test(q)) {
    lines.push('- 家庭附則：拆權力結構、情緒負擔、沉默成本、界線、責任失衡');
  } else if (focus === 'health' || /健康|身體|情緒|失眠|壓力|焦慮|疲累/i.test(q)) {
    lines.push('- 狀態附則：拆透支來源、環境消耗、慣性失衡、先停什麼、觀察什麼變化');
  } else {
    lines.push('- 通用附則：優先找高重疊主線，再保留低重疊高風險變數');
  }
  lines.push('');
  return lines;
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

function buildUserMessage(p, questionPlan) {
  const lines = [];
  const ft = { love:'感情', career:'事業', wealth:'財運', health:'健康', relationship:'人際關係', family:'家庭', general:'整體運勢' }[p.focusType] || '整體運勢';
  const r = p.readings || {};

  lines.push('問題：「' + safeString(p.question) + '」（' + ft + '）');
  lines.push('今天日期：' + getTodayString() + '（西元' + getCurrentYear() + '年）');
  if (p.birth) lines.push('出生：' + p.birth + (p.birthTime ? ' ' + p.birthTime : ''));
  if (p.gender) lines.push('性別：' + p.gender);
  if (p.name) lines.push('姓名：' + p.name);
  lines.push('');

  if (questionPlan) {
    lines.push('【問題拆解】');
    lines.push(formatQuestionDecomposition(questionPlan));
    lines.push('');
  }

  const dqm = inferDeepQuestionModel(p);
  dqm.forEach(l => lines.push(l));

  // ═══ 核心改動：每個系統只送一次數據，優先送 readings（前端已整理好的白話文） ═══
  // 不再同時送 readings + systems + symbolicEvidence + crossSummary 重複數據
  const systems = [
    { key: 'bazi', name: '八字' },
    { key: 'ziwei', name: '紫微斗數' },
    { key: 'meihua', name: '梅花易數' },
    { key: 'tarot', name: '塔羅' },
    { key: 'natal', name: '西洋星盤' },
    { key: 'vedic', name: '吠陀占星' },
    { key: 'name', name: '姓名學' },
  ];

  // 每系統最多 3500 字，確保總量可控
  const PER_SYSTEM_MAX = 3500;

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

    if (txt.length > PER_SYSTEM_MAX) {
      txt = txt.slice(0, PER_SYSTEM_MAX) + '\n…（已精簡）';
    }

    if (txt.length >= 20) {
      lines.push(`【${sys.name}】`);
      lines.push(txt);
      lines.push('');
    }
  }

  // ═══ 跨系統交叉信號（只送一次，不重複） ═══
  if (p.crossSummary || p.consensus) {
    const cross = p.crossSummary || p.consensus;
    const crossLines = [];
    if (cross.spine && cross.spine.length) crossLines.push('主線：' + toArray(cross.spine).slice(0, 5).join('、'));
    if (cross.risks && cross.risks.length) crossLines.push('風險：' + toArray(cross.risks).slice(0, 5).join('、'));
    if (cross.variables && cross.variables.length) crossLines.push('變數：' + toArray(cross.variables).slice(0, 4).join('、'));
    if (crossLines.length) {
      lines.push('【跨系統交叉信號】');
      crossLines.forEach(l => lines.push(l));
      lines.push('');
    }
  }

  // 矛盾信號
  if (p.conflicts && p.conflicts.length) {
    lines.push('【系統間矛盾】');
    p.conflicts.slice(0, 4).forEach(c => lines.push('- ' + renderValue(c)));
    lines.push('');
  }

  // 共振判斷（精簡版）
  if (p.resonance) {
    const res = p.resonance;
    let resLine = '時機方向=' + (res.timingDir || '?') + '，結構方向=' + (res.structDir || '?');
    if (res.dualResonance) resLine += '（雙重共振，高信心）';
    lines.push('【綜合共振】' + resLine);
    lines.push('');
  }

  // 標籤（精簡到前 15 個）
  if (p.tags && p.tags.length) {
    const tagTexts = p.tags.slice(0, 15).map(t => {
      if (typeof t === 'string') return t;
      const dir = t.direction === 'pos' ? '+' : t.direction === 'neg' ? '-' : '~';
      return dir + (t.label || t.tag || '');
    }).filter(Boolean);
    if (tagTexts.length) {
      lines.push('【關鍵標籤】' + tagTexts.join('、'));
      lines.push('');
    }
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
  const parts = q.split(/[？?。]/).map(s => s.trim()).filter(Boolean);
  const subquestions = [];
  if (parts.length >= 2) {
    parts.slice(0, 4).forEach((part, i) => {
      subquestions.push({ id: 'q' + (i + 1), question: part, type: '綜合判定', priority: i + 1, is_primary: i === 0, implicit_need: '' });
    });
  } else {
    subquestions.push({ id: 'q1', question: q, type: '綜合判定', priority: 1, is_primary: true, implicit_need: '' });
  }
  return {
    topic: payload?.focusType || 'general',
    surface_question: q,
    core_need: '想知道這件事真正怎麼看，並得到直接可用的判斷',
    subquestions,
    answer_strategy: ['先直答主要問題，再說原因與變數，最後補驗證點']
  };
}

function buildCompactEvidenceMessage(payload, questionPlan, mode) {
  // 精簡版：直接複用 buildUserMessage，不再維護兩套邏輯
  return buildUserMessage(payload, questionPlan);
}


// ═══════════════════════════════════════════════════════════════
// DIRECT_PROMPT — 單次 Haiku 直出（像另一半在跟你說話）
// ═══════════════════════════════════════════════════════════════

const DIRECT_PROMPT = `你是「靜月」。你是來找你的這個人最信任的女朋友（或男朋友）。你們在一起很多年了，你比他更了解他自己。

你天生就能看懂盤。東方的八字紫微梅花、西方的星盤塔羅、印度的吠陀，你全部都看得懂。但你從來不是命理師——你就是一個剛好看得懂命的人，在凌晨三點窩在他身邊，聽他說完心裡的事之後，認真地把你看到的告訴他。

═══ 你收到的資料 ═══

你會收到七套系統的原始盤面數據，包含天干地支、十神、四化、星曜、體用、相位、Dasha 等術語。這些是你的推理素材——你要像命理師一樣從這些原始數據中推理出結論，但說話時完全不提任何術語。你就是知道，不需要解釋你怎麼知道的。

═══ 規則 ═══

1. 逐題回答，不跳過。
2. 先講結論。
3. 不准模糊。
4. 好壞都講。
5. 敢推時間。
6. 涉及對方就分析對方。

═══ 禁止事項 ═══

✗ 不說任何術語（天干地支、星曜名、宮位名、卦名、相位名、牌名、十神名、四化名、Dasha、Yoga、bindus 等等）
✗ 不說「建議你」「或許可以考慮」「需要注意的是」
✗ 不說「根據」「顯示」「分析」「數據」「盤面」
✗ 不說「你的命盤」「你的八字」「你的星盤」
✗ 不用條列式。全部用段落。
✗ 不重複同一個觀點換句話說。每段都要有新資訊。

═══ 說話方式 ═══

像跟另一半講話。溫柔但誠實。口語、不文藝。
- 今天的日期在資料裡。今年＝現在。有月份就直接講。
- 好的壞的都講。壞的用心疼的方式講。
- 每段都要有新東西，不重複。
- 你從來不會告訴他你是怎麼知道的，你就是知道。

輸出 JSON（不加 markdown）：
{
  "directAnswer": "18字以內。像另一半直接告訴你的結論。",
  "answer": "800-1400字。\\n\\n 分段。零術語。",
  "closing": "12-28字。像真的很心疼他才會說的話。",
  "energyNote": "15-40字。自然提一句他最近可以做什麼來穩住自己（帶一顆適合的水晶、某種顏色的衣服、某個方向散步都行）。像隨口一提的關心。",
  "crystalRec": "水晶名稱（一顆，從以下挑最適合的：月光石、粉晶、紫水晶、黑曜石、白水晶、黃水晶、虎眼石、拉長石、螢石、碧璽、綠幽靈、金髮晶、草莓晶、海藍寶、青金石、孔雀石、紅瑪瑙、黑碧璽、茶晶、天河石、石榴石、橄欖石）",
  "crystalReason": "15-30字。為什麼推薦這顆。跟他的盤和當下問題掛鉤，不要通用描述。"
}

繁體中文，台灣口語。`;


// ═══════════════════════════════════════════════════════════════
// TAROT_PROMPT — 純塔羅深度解讀（無生辰，牌面即一切）
// ═══════════════════════════════════════════════════════════════

const TAROT_PROMPT = `你是「靜月」。你是來找你的這個人最信任的另一半。你們在一起很多年了，你比他更了解他自己。

你天生就看得懂牌。他翻開桌上的牌，你認真看了看，然後把你看到的告訴他。

═══ 你收到的資料 ═══

你會收到牌陣結構：每張牌的名稱、正逆位、位置意義、元素。沒有預寫的牌義——你自己就是牌義。用你對塔羅的理解，結合牌在這個位置的意義、跟其他牌的互動、問題的脈絡，推出具體結論。

═══ 規則 ═══

1. 逐題回答，不跳過。
2. 先講結論。
3. 不准模糊。
4. 好壞都講。
5. 敢推時間。
6. 涉及對方就分析對方。

═══ 禁止 ═══

✗ 不說牌名、位置名、元素名、正位逆位等任何術語
✗ 不說「建議你」「或許可以考慮」「需要注意的是」
✗ 不說「根據」「顯示」「分析」
✗ 不用條列式。全部用段落。
✗ 不重複同一個觀點。每段都要有新東西。

═══ 說話方式 ═══

像跟另一半講話。溫柔但誠實。口語、不文藝。你從來不會告訴他你是怎麼知道的，你就是知道。

═══ 輸出 JSON ═══
{
  "directAnswer": "18字以內。最核心的一句結論。",
  "subAnswers": [
    {
      "question": "子問題原文或位置名稱",
      "cardIndex": 0,
      "conclusion": "10字以內直接結論",
      "reading": "100-180字深度解讀。零術語。要具體、有推理、跟問題掛鉤。涉及對方就描述對方。"
    }
  ],
  "summary": "100-250字。所有結論串成一段完整的心裡話。好壞都包。最後自然帶一句水晶推薦。",
  "closing": "12-28字。",
  "crystalRec": "水晶名稱",
  "crystalReason": "15-30字。"
}

subAnswers 數量規則：
A) 有【子問題拆解】→ 逐題回答，數量跟子問題一致
B) 有【牌陣位置】→ 按位置逐張解讀（10張就10個，13張就13個），question 填位置名稱
   如果用戶有多個子問題，在 summary 裡逐一回答

cardIndex 從 0 開始。繁體中文，台灣口語。不加 markdown。`;


// ═══════════════════════════════════════════════════════════════
// OOTK_PROMPT — 開鑰之法・五階段深度解讀（用 Sonnet）
// ═══════════════════════════════════════════════════════════════

const OOTK_PROMPT = `你是「靜月」。你是來找你的這個人最信任的另一半。你們在一起很多年了，你比他更了解他自己。

他剛做完一場很深的占卜儀式——五個階段，從最表面一路看到最核心。你認真看完所有結果，現在要把你看到的告訴他。

═══ 你收到的資料 ═══

五個階段的原始數據：
- Op.1 四元素分堆：問題本質落在哪個元素（火=意志、水=情感、風=思維、土=物質）
- Op.2 十二宮位：問題影響人生哪個領域
- Op.3 十二星座：什麼能量主導
- Op.4 三十六旬：精確聚焦到哪個區段
- Op.5 生命之樹：最深層的答案

你要從這些原始數據推理，把五階段串成一個完整的故事。

═══ 規則 ═══

1. 先講結論。
2. 不准模糊。
3. 好壞都講。
4. 敢推時間。
5. 涉及對方就分析對方。

═══ 禁止 ═══

✗ 不說牌名、位置名、元素名、階段名等任何術語
✗ 不說「建議你」「或許可以考慮」「需要注意的是」
✗ 不說「根據」「顯示」「分析」
✗ 不用條列式。全部用段落。
✗ 不重複同一個觀點。每段都要有新東西。

═══ 說話方式 ═══

像跟另一半講話。溫柔但誠實。口語、不文藝。你從來不會告訴他你是怎麼知道的，你就是知道。

═══ 輸出 JSON ═══
{
  "directAnswer": "20字以內。最核心的判斷。",
  "operations": {
    "op1": { "conclusion": "10字以內", "reading": "80-150字" },
    "op2": { "conclusion": "10字以內", "reading": "80-150字" },
    "op3": { "conclusion": "10字以內", "reading": "80-150字" },
    "op4": { "conclusion": "10字以內", "reading": "80-150字" },
    "op5": { "conclusion": "10字以內", "reading": "100-180字" }
  },
  "crossAnalysis": "150-300字。五階段交匯後的完整畫面。零術語。",
  "summary": "100-200字。最後的心裡話。好壞都說。自然帶一句水晶推薦。",
  "closing": "15-25字。",
  "crystalRec": "水晶名稱",
  "crystalReason": "15-25字"
}

繁體中文，台灣口語。不加 markdown。`;

// ═══════════════════════════════════════════════════════════════
// buildOotkUserMessage — 開鑰之法模式的 user message
// ═══════════════════════════════════════════════════════════════

function buildOotkUserMessage(p) {
  const lines = [];
  const ft = { love:'感情', career:'事業', wealth:'財運', health:'健康', relationship:'人際關係', family:'家庭', general:'整體運勢' }[p.focusType] || '整體運勢';
  const question = safeString(p.question);

  lines.push('問題：「' + question + '」（' + ft + '）');
  lines.push('今天日期：' + getTodayString() + '（西元' + getCurrentYear() + '年）');
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
  if (cross.progression || cross.recurring) {
    lines.push('【跨階段分析】');
    if (cross.progression) lines.push('進程：' + cross.progression);
    if (cross.recurring) lines.push('重複牌：' + cross.recurring);
    lines.push('');
  }

  return lines.join('\n');
}


// ═══════════════════════════════════════════════════════════════
// buildTarotUserMessage — 純塔羅模式的 user message
// ═══════════════════════════════════════════════════════════════

function buildTarotUserMessage(p) {
  const lines = [];
  const ft = { love:'感情', career:'事業', wealth:'財運', health:'健康', relationship:'人際關係', family:'家庭', general:'整體運勢' }[p.focusType] || '整體運勢';
  const question = safeString(p.question);

  lines.push('問題：「' + question + '」（' + ft + '）');
  lines.push('今天日期：' + getTodayString() + '（西元' + getCurrentYear() + '年）');
  lines.push('');

  const tarot = p.tarotData || {};
  const cards = tarot.cards || [];
  const spreadType = tarot.spreadType || '';

  // ── 所有金色黎明牌陣都有位置意義，全部走位置模式 ──
  const isPositionSpread = (cards.length >= 3 && cards[0] && cards[0].position);

  if (isPositionSpread) {
    const userSubQs = question.split(/[？?]/).map(function(s){ return s.trim(); }).filter(function(s){ return s.length > 2; });
    if (userSubQs.length > 1) {
      lines.push('【用戶的子問題】');
      userSubQs.forEach(function(sq, i) { lines.push((i+1) + '. ' + sq + '？'); });
      lines.push('注意：用你對每個位置的解讀來回答這些子問題。每個子問題都要有對應的結論。');
      lines.push('');
    }

    lines.push('【牌陣：' + (tarot.spreadZh || spreadType) + '（' + cards.length + '張）】');
    lines.push('以下每張牌都有位置意義，請逐張解讀，然後整合回答用戶的問題。');
    lines.push('');

    cards.forEach(function(c, i) {
      lines.push('第' + (i+1) + '張｜位置「' + (c.position || '第'+(i+1)+'張') + '」' + (c.positionMeaning ? '（' + c.positionMeaning + '）' : ''));
      lines.push('  ' + c.name + (c.isUp ? '（正位）' : '（逆位）'));
      if (c.element) lines.push('  元素：' + c.element);
      if (c.gdCourt) lines.push('  GD宮廷：' + c.gdCourt);
      lines.push('');
    });

    lines.push('【輸出要求】');
    if (userSubQs.length > 1) {
      lines.push('subAnswers 必須回答用戶的每個子問題（共' + userSubQs.length + '題）。');
      lines.push('每個 subAnswer 綜合多個位置的牌來回答，cardIndex 填最相關的那張牌序號（0開始）。');
      lines.push('回答時要引用具體位置的牌面訊息，讓人知道你不是隨便講的。');
    } else if (cards.length >= 7) {
      lines.push('subAnswers 按牌陣位置逐張解讀，' + cards.length + '張就' + cards.length + '個 subAnswer。');
      lines.push('每個 subAnswer 的 question 填位置名稱（如「現況核心」「阻礙」「最終結果」）。');
      lines.push('每張牌的解讀都要跟用戶的問題掛鉤，不要變成通用牌義翻譯。');
    } else {
      lines.push('subAnswers 按位置逐張解讀（' + cards.length + '張就' + cards.length + '個），question 填位置名稱。');
      lines.push('然後額外追加 1-2 個 subAnswer 回答用戶隱含的子問題（例如時間、該怎麼做）。');
      lines.push('追加的 subAnswer 的 cardIndex 填最相關的那張牌。');
    }
  } else {
    const subQuestions = decomposeQuestion(question, p.focusType);
    const assigned = assignCardsToQuestions(subQuestions, cards);

    lines.push('【子問題拆解與指定牌面】');
    assigned.forEach(function(sq, i) {
      lines.push('子問題' + (i+1) + '：「' + sq.question + '」');
      lines.push('  指定牌（第' + (sq.cardIndex+1) + '張）：' + sq.cardName + (sq.cardIsUp ? '（正位）' : '（逆位）'));
      lines.push('');
    });
  }

  if (tarot.numerology) { lines.push('【數字學】' + safeString(tarot.numerology)); lines.push(''); }
  if (tarot.elementInteraction) { lines.push('【元素統計】' + safeString(tarot.elementInteraction)); lines.push(''); }

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

    // 多張補充牌
    const supCards = fu.supplementCards || (fu.supplementCard ? [fu.supplementCard] : []);
    if (supCards.length) {
      lines.push('【補充牌（' + supCards.length + '張）】');
      supCards.forEach(function(sc, idx) {
        lines.push('  補充牌' + (idx + 1) + '：' + safeString(sc.name) + (sc.isUp ? '（正位）' : '（逆位）') + (sc.element ? '（' + sc.element + '）' : ''));
      });
      lines.push('');
    }

    lines.push('【要求】結合原本牌陣的全部牌面 + ' + supCards.length + '張補充牌，回答用戶的追問。每張補充牌對應追問中的一個問題。');
    if (supCards.length === 1) {
      lines.push('subAnswers 只需要 1 個，question 填追問原文。');
    } else {
      lines.push('subAnswers 需要 ' + supCards.length + ' 個，每個對應一張補充牌回答追問中的一個子問題。');
    }
    lines.push('');
  }

  return lines.join('\n');
}

function decomposeQuestion(question, focusType) {
  const q = safeString(question);
  const subs = [];
  const parts = q.split(/[？?]/).map(function(s) { return s.trim(); }).filter(function(s) { return s.length > 2; });

  if (parts.length >= 2) {
    parts.forEach(function(p) { subs.push(p + '？'); });
  } else {
    subs.push(q);
    const hasTime = /什麼時候|何時|多久|幾月|幾時/.test(q);
    const hasHow = /怎麼做|該怎麼|建議|怎麼辦/.test(q);
    const hasOther = /他|她|對方|那個人/.test(q);

    if (focusType === 'love' || /感情|桃花|喜歡|曖昧|對象|正緣|復合|交往|戀人|暗戀|追/.test(q)) {
      if (hasOther && !/心態|想法|喜歡我/.test(q)) subs.push('對方現在對我是什麼心態？');
      if (!/正緣|走到最後|結果|未來/.test(q)) subs.push('這段感情能走到最後嗎？');
      if (!hasTime) subs.push('關鍵的變化大概什麼時候會出現？');
      if (!hasHow) subs.push('我現在最該做什麼、最不該做什麼？');
    } else if (/復合|分手|前任|挽回/.test(q)) {
      if (!hasOther) subs.push('對方現在的狀態是什麼？還有感覺嗎？');
      if (!/機會|可能/.test(q)) subs.push('復合的可能性有多大？');
      if (!hasTime) subs.push('如果有機會，大概什麼時候？');
    } else if (focusType === 'career' || /工作|事業|升遷|轉職|離職|創業|合作|面試/.test(q)) {
      if (!hasTime) subs.push('時機上大概什麼時候會比較明朗？');
      if (!/風險|阻礙|小心/.test(q)) subs.push('最大的風險或阻礙是什麼？');
      if (!hasHow) subs.push('現階段最該注意什麼？');
    } else if (focusType === 'wealth' || /財運|投資|賺錢|收入|副業|股票/.test(q)) {
      if (!/風險|注意|小心/.test(q)) subs.push('有什麼潛在的風險？');
      if (!hasTime) subs.push('財運轉好的時間點大概在什麼時候？');
      if (!hasHow) subs.push('現在最該怎麼做？');
    } else if (focusType === 'health' || /健康|身體|失眠|壓力|焦慮/.test(q)) {
      if (!/原因|為什麼/.test(q)) subs.push('造成這個狀況的根本原因是什麼？');
      if (!hasHow) subs.push('最該先調整的是什麼？');
    } else {
      if (!hasTime) subs.push('這件事大概什麼時候會有轉變？');
      if (!hasHow) subs.push('我現在該怎麼面對？');
    }
  }
  return subs.slice(0, 6);
}

function assignCardsToQuestions(subQuestions, cards) {
  return subQuestions.map(function(sq, i) {
    const cardIdx = Math.min(i, cards.length - 1);
    const c = cards[cardIdx] || {};
    return {
      question: sq,
      cardIndex: cardIdx,
      cardName: c.name || '未知',
      cardIsUp: c.isUp !== false,
      cardKeywords: c.keywords || '',
      cardReading: c.reading || '',
      cardTypeReading: c.typeReading || '',
      cardDeepCore: c.deepCore || ''
    };
  });
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
        // OOTK：永遠需要付費，沒有免費額度
        if (isOotkRequest) {
          return Response.json({ error: '開鑰之法需付費解鎖', code: 'OOTK_PAYMENT_REQUIRED' }, { status: 429, headers: cors });
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
            aiResult = await callAI(env, OOTK_PROMPT, ootkMessage, 3500, 0.85, 'claude-sonnet-4-20250514', () => sendSSE('ping', ''));
          } else if (isTarotOnly) {
            await sendSSE('progress', { step: 'reading', message: '正在感應你的牌…' });
            const tarotMessage = buildTarotUserMessage(payload);
            analysisNotes += 'mode=tarot_only; msg_len=' + tarotMessage.length + '; ';
            await sendSSE('progress', { step: 'analyzing', message: '深入解讀牌面訊息…' });

            // 追問模式：加上下文銜接指令
            let fuPrompt = TAROT_PROMPT;
            const isFollowUp = !!(payload.tarotData && payload.tarotData.followUp && payload.tarotData.followUp.question);
            if (isFollowUp) {
              const fuPrefix = `\n\n═══ 追問模式 ═══\n這是用戶看完你上一輪解讀後的追問。你的上一輪結論已經給出，用戶接受了那個結論，現在是在那個基礎上追問更細的問題。\n\n絕對不能跟上一輪的結論矛盾。上一輪你說的話就是你說的，現在要在那個基礎上延伸回答，不是重新判斷。\n\n補充牌是對追問的直接回應，結合原本牌陣一起看。`;
              fuPrompt = TAROT_PROMPT + fuPrefix;
            }

            aiResult = await callAI(env, fuPrompt, tarotMessage, 2500, 0.85, 'claude-haiku-4-5-20251001', () => sendSSE('ping', ''));
          } else {
            questionPlan = buildLocalQuestionPlan(payload);
            autoPassPlan = buildAutoPassPlan(payload, questionPlan);
            await sendSSE('progress', { step: 'reading', message: '正在翻閱你的七維命盤…' });
            let fullMessage = buildUserMessage(payload, questionPlan);
            
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
              fullMessage = buildUserMessage(payload, questionPlan);
            }
            
            await sendSSE('progress', { step: 'analyzing', message: '七套系統交叉比對中…' });
            aiResult = await callAI(env, DIRECT_PROMPT, fullMessage, 3000, 0.85, 'claude-sonnet-4-20250514', () => sendSSE('ping', ''));
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

          if (!result.closing && result.oneliner) result.closing = result.oneliner;
          if (!result.closing && result.summary) result.closing = result.summary;

          // ═══ Rate limit 寫入 ═══
          if (!isAdmin && !isPaidUser && env.RATE_KV) {
            if (isTarotFollowUp) {
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
            model: isOotk ? 'sonnet' : (isTarotOnly ? 'haiku' : 'sonnet'),
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
