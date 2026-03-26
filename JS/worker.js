function getTodayString() { return new Date(Date.now() + 8 * 3600000).toISOString().slice(0, 10); }
function getCurrentYear() { return new Date(Date.now() + 8 * 3600000).getFullYear(); }
function getCurrentTimeString() { const d = new Date(Date.now() + 8 * 3600000); const h = d.getUTCHours(); const m = d.getUTCMinutes(); return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m; }

function safeString(v) { return v == null ? '' : String(v).trim(); }
function hashString(input) { let hash = 0; const s = safeString(input); for (let i = 0; i < s.length; i++) { hash = ((hash << 5) - hash) + s.charCodeAt(i); hash |= 0; } return String(Math.abs(hash)); }
function buildPersonSignature(payload) { const parts = [safeString(payload?.name), safeString(payload?.birth), safeString(payload?.gender)].filter(Boolean); if (!parts.length) return 'anon'; return 'sig_' + hashString(parts.join('|')); }

// ═══════════════════════════════════════════════════════════════
// 綠界 ECPay 金流工具
// ═══════════════════════════════════════════════════════════════

// ★ v22：金流憑證改從 Cloudflare Worker Secrets 讀取
// 設定方式：wrangler secret put ECPAY_MERCHANT_ID / ECPAY_HASH_KEY / ECPAY_HASH_IV
// 或在 Cloudflare Dashboard → Workers → Settings → Variables → Encrypt
const ECPAY_PAYMENT_URL = 'https://payment.ecpay.com.tw/Cashier/AioCheckOut/V5';
const PRICE_SUB = 399;   // NT$399 月度會員（每日 5 次，不限工具）
const PRICE_SINGLE = 10; // NT$10 單次解讀（僅信用卡）

// ★ 取得金流憑證（從 env 讀取，fallback 到舊常數以防部署過渡期）
function _getECPayCreds(env) {
  return {
    merchantId: (env && env.ECPAY_MERCHANT_ID) || '3493341',
    hashKey:    (env && env.ECPAY_HASH_KEY)    || '',
    hashIV:     (env && env.ECPAY_HASH_IV)     || ''
  };
}

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

async function generateCheckMacValue(params, creds) {
  // 1. 按參數名稱排序
  const sorted = Object.keys(params).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
  // 2. 組成 key=value& 字串
  let raw = `HashKey=${creds.hashKey}`;
  for (const key of sorted) {
    raw += `&${key}=${params[key]}`;
  }
  raw += `&HashIV=${creds.hashIV}`;
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
async function buildECPayFormHTML(tradeNo, workerBaseUrl, amount, itemName, env, choosePayment) {
  const creds = _getECPayCreds(env);
  const now = new Date(Date.now() + 8 * 3600000); // UTC+8
  const params = {
    MerchantID: creds.merchantId,
    MerchantTradeNo: tradeNo,
    MerchantTradeDate: formatECPayDate(now),
    PaymentType: 'aio',
    TotalAmount: String(amount),
    TradeDesc: encodeURIComponent('靜月之光AI深度解讀'),
    ItemName: itemName || 'AI深度命理解讀x1',
    ReturnURL: `${workerBaseUrl}/ecpay-notify`,
    OrderResultURL: `https://jingyue.uk?paid=${tradeNo}`,
    ChoosePayment: choosePayment || 'ALL',
    EncryptType: '1',
    ClientBackURL: 'https://jingyue.uk',
    NeedExtraPaidInfo: 'N',
  };
  params.CheckMacValue = await generateCheckMacValue(params, creds);

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
// Google OAuth 工具
// ═══════════════════════════════════════════════════════════════

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo';
const OAUTH_REDIRECT_PATH = '/auth/callback';
const SESSION_TTL = 86400 * 30; // 30 天

function generateSessionToken() {
  const arr = new Uint8Array(32);
  crypto.getRandomValues(arr);
  return Array.from(arr, b => b.toString(16).padStart(2, '0')).join('');
}

async function getUserFromSession(body, env) {
  // 從 body.session_token 或 header Authorization 取 session token
  const token = safeString(body?.session_token);
  if (!token || !env.RATE_KV) return null;
  try {
    const data = await env.RATE_KV.get(`session:${token}`);
    if (!data) return null;
    return JSON.parse(data);
  } catch (_e) { return null; }
}

// 取得使用者識別 key（登入用 email，未登入用 IP）
function getUserKey(sessionUser, ip) {
  return sessionUser ? `u:${sessionUser.email}` : ip;
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

      // ★ v22c：在源頭剝 markdown fence，parseJSON 永遠不該看到 ```
      fullText = fullText.trim();
      if (fullText.startsWith('`')) {
        fullText = fullText.replace(/^`{3,}[^\n]*\n?/, '').replace(/\n?`{3,}\s*$/, '').trim();
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

  // Step 1: 直接試
  try { return JSON.parse(c); } catch(_) {}

  // Step 2: 去 fence → 抽 {...} → 殺控制字元 → parse
  // 舊版 bug：fence regex 在邊界條件失敗 → 控制字元替換後 ```json 殘留 → 全炸
  // 新版：先殺控制字元，再用 indexOf 找 {和}，一刀切
  let clean = c.replace(/[\x00-\x1F]+/g, ' ');
  const fi = clean.indexOf('{');
  const li = clean.lastIndexOf('}');
  if (fi === -1 || li <= fi) return { answer: c, _parseFailed: true };
  clean = clean.slice(fi, li + 1);

  try { return JSON.parse(clean); } catch(_) {}

  // 去 trailing comma
  clean = clean.replace(/,\s*([\]}])/g, '$1');
  try { return JSON.parse(clean); } catch(_) {}

  // 截斷修復：AI 被 max_tokens 截斷 → 關閉未完成字串 + 補齊括號
  // 先關字串，再從尾巴往前找可 parse 的點
  let truncFixed = clean;
  // 計算未閉合的引號（簡易：數引號奇偶）
  let quoteCount = 0;
  for (let q = 0; q < truncFixed.length; q++) {
    if (truncFixed[q] === '"' && (q === 0 || truncFixed[q-1] !== '\\')) quoteCount++;
  }
  if (quoteCount % 2 !== 0) truncFixed += '"'; // 關閉未完成字串
  // 補齊括號
  let depth = { brace: 0, bracket: 0 };
  let inStr = false, esc = false;
  for (let q = 0; q < truncFixed.length; q++) {
    let ch = truncFixed[q];
    if (esc) { esc = false; continue; }
    if (ch === '\\' && inStr) { esc = true; continue; }
    if (ch === '"') { inStr = !inStr; continue; }
    if (!inStr) {
      if (ch === '{') depth.brace++;
      else if (ch === '}') depth.brace--;
      else if (ch === '[') depth.bracket++;
      else if (ch === ']') depth.bracket--;
    }
  }
  // 去尾部殘留的逗號/冒號
  truncFixed = truncFixed.replace(/[,:]\s*$/, '');
  for (let q = 0; q < depth.bracket; q++) truncFixed += ']';
  for (let q = 0; q < depth.brace; q++) truncFixed += '}';
  try { 
    const truncResult = JSON.parse(truncFixed);
    if (truncResult && (truncResult.directAnswer || truncResult.layers)) return truncResult;
  } catch(_) {}

  // 最後手段：從尾巴往前找可 parse 的 }
  for (let i = clean.length - 1; i > 100; i--) {
    if (clean[i] === '}') {
      try { return JSON.parse(clean.slice(0, i + 1)); } catch(_) { continue; }
    }
  }

  return { answer: c, _parseFailed: true };
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

// ═══ 題型→各系統核心欄位映射 ═══
// 告訴 AI 這題該優先看哪些欄位，避免七套系統數據平等列出導致重點模糊
function _topicKeyFields(topic) {
  const m = {
    love: {
      bazi: '日支（配偶宮）、桃花神煞、官殺/正財（異性星）、大運流年是否引動婚姻宮、暗合=暗中吸引力、納音看年命與日柱的先天緣分',
      ziwei: '夫妻宮主星+四化、命宮桃花星、大限是否走夫妻宮、流年四化是否入夫妻/命宮、小限走到哪',
      meihua: '體用關係=雙方互動模式、用生體=對方對你好、體生用=你付出較多、動爻=事情在哪個階段轉、錯卦=你沒看到的另一面、綜卦=對方怎麼看這段關係',
      tarot: '阻礙位=真正卡關的是什麼、自己位vs外在位=你跟對方的落差、結果位=走向',
      natal: '5宮(戀愛)/7宮(伴侶)/8宮(深層連結)的宮主星+相位、金星狀態、行運觸發婚姻軸、幸運點落宮=幸福來源、恆星合相=放大的行星特質',
      vedic: 'D9婚盤配置、7宮lord品質+Dasha、金星/木星狀態、副週期是否引動關係、Karakamsa=靈魂目標、Vargottama=天生最強面向',
      name: '人格五行vs配偶宮五行是否相生、人格數理吉凶、生肖姓名學喜忌'
    },
    career: {
      bazi: '格局（正官格/七殺格/食傷生財等）、官殺十神、大運是否走官祿、喜忌用神在工作五行、十神組合=做事模式、歲運並臨=大事之年、十二運看哪柱有力',
      ziwei: '官祿宮主星+四化、遷移宮（外部機會）、大限是否走官祿/財帛、流年四化入官祿、特殊格局、星曜組合、小限',
      meihua: '體用關係=你跟這份工作/機會的互動、變卦走向=最終結果、體用精確旺衰=雙方力量對比、錯卦=看不到的風險',
      tarot: '現況位+阻礙位=目前工作困境、近未來+結果位=走向',
      natal: '10宮(事業)/6宮(日常工作)/2宮(收入)的宮主星、MC星座、土星行運位置、幸運點=最自然的成功路徑、恆星合相',
      vedic: 'Dasha主星是否為10宮lord、土星行運、Ashtakavarga 10宮分數、Karakamsa=靈魂職業方向、分盤強星=哪個領域底子厚',
      name: '人格數理vs事業運、總格數理=一生總運、生肖姓名學對事業的助力或拖累'
    },
    wealth: {
      bazi: '正財偏財十神、財庫、大運流年是否引動財星、喜用是否為財星五行、十神組合看理財模式、納音=先天財氣底子',
      ziwei: '財帛宮主星+四化、田宅宮（不動產）、大限流年四化入財帛、特殊格局（如府相朝垣、祿權科會等）',
      meihua: '體用=你跟錢的關係、用生體=財來就你、體克用=你要主動爭取、體用精確旺衰=誰強',
      tarot: '金幣牌數量、結果位正逆、阻礙位=花錢的地方',
      natal: '2宮(收入)/8宮(他人的錢)/11宮(大額收益)的宮主星、木星行運、幸運點=此生最自然的富足來源（財運必看）',
      vedic: 'Dasha主星與2/11宮的關係、木星品質、Dhana yoga、Vargottama行星=天生優勢、分盤強星看D2(財富盤)',
      name: '天格→外在資源、地格→基礎運、總格數理=一生財運走向、人格數理吉凶'
    },
    health: {
      bazi: '五行偏枯方向=容易出問題的器官、忌神五行=最脆弱的系統、大運是否加重偏枯、歲運並臨=身體大轉折年、十二運看日主在哪柱最虛、額外神煞（天醫/病符等）',
      ziwei: '疾厄宮主星+煞星、命宮天刑/天虛等、大限是否走疾厄、小限走到哪',
      meihua: '體卦旺衰=身體底子、用克體=外力消耗你、體用精確旺衰=精確強弱比',
      tarot: '寶劍牌多=精神壓力、逆位密集=身心不暢',
      natal: '6宮(健康)/12宮(隱疾)配置、火星/土星/冥王相位壓力、行運觸發、恆星合相（Algol=危機轉化相關）',
      vedic: 'Ashtakavarga總分=整體能量、sadeSati=長期壓力期、6宮lord狀態、Gandanta=業力結點（健康必看）、燃燒取消=被壓制的行星是否解除',
      name: '三才配置中間那格（人格）=核心健康基底、人格數理吉凶'
    },
    family: {
      bazi: '印星（母親）、財星（父親/妻）、食傷（子女）、年柱月柱狀態、納音=先天家族緣分、暗合暗沖=隱性家庭張力',
      ziwei: '父母宮、子女宮、田宅宮主星+四化、宮干四化飛出影響、小限',
      meihua: '體用關係=你跟家庭的互動模式、綜卦=家人怎麼看你、錯卦=你沒注意到的家庭動態',
      tarot: '自己位vs外在位=你跟家人的落差',
      natal: '4宮(家庭根基)/10宮(父親)/月亮(母親/情感需求)配置、幸運點落4宮附近=家庭是幸福來源',
      vedic: '4宮lord品質、月亮nakshatra、D12分盤、Karakamsa=靈魂歸屬',
      name: '天格=長輩運、地格=晚輩運、生肖姓名學喜忌=名字跟家族的能量契合'
    },
    relationship: {
      bazi: '比劫（同輩）、食傷（表達）、官殺（權威/規範）、日支、暗合=暗中吸引或協議、十神組合=社交模式',
      ziwei: '交友宮、遷移宮、僕役宮主星+四化、星曜組合',
      meihua: '體用=你跟對方的力量對比、綜卦=換位思考對方立場、錯卦=關係的盲點',
      tarot: '自己位vs外在位=雙方狀態、阻礙位=關係卡點',
      natal: '7宮(一對一關係)/11宮(群體)/3宮(溝通)配置、水星狀態、互容=兩顆行星互相幫助的特殊連結',
      vedic: '7宮lord+Dasha、金星品質、Vargottama=社交面天生優勢',
      name: '人格外格互動、生肖姓名學=名字給人的第一印象'
    },
    general: {
      bazi: '格局+身強弱=整體命格基調、大運流年=現在走到哪、十二運=日主在哪柱有力、歲運並臨=是否大事之年、十神組合=做事模式',
      ziwei: '命宮主星+四化=先天格局、大限+流年=現在走到哪、特殊格局+星曜組合=獨特優勢或壓力、小限',
      meihua: '體用關係+旺衰=這件事的核心判斷、錯卦=盲點、綜卦=換位思考、變卦=最終走向',
      tarot: '結果位方向、元素分佈、正逆比例',
      natal: '上升+MC=人生主軸、最緊密相位=核心張力、行運=外在推力、幸運點=自然優勢方向、恆星合相',
      vedic: 'Dasha基調+副運=時間節奏、Yoga=先天格局、Vargottama=天生強項、Karakamsa=靈魂方向',
      name: '三才+人格數理+總格數理=名字整體吉凶、生肖姓名學'
    }
  };
  return m[topic] || null;
}

// ═══════════════════════════════════════════════════════════════
// ★ v28：證據驅動權重 — 掃描每套系統的 dims 實際填充率
// 不再查表決定誰重要，而是看誰的證據真的多
// ═══════════════════════════════════════════════════════════════
function computeEvidenceRichness(dims, topic) {
  if (!dims || typeof dims !== 'object') return {};
  // 每套系統的 core fields（對任何題型都重要）和 topic-specific bonus fields
  const fieldDefs = {
    bazi: {
      core: ['favEls','unfavEls','strong','dyDetail','lnDetail','geJu','specialGe'],
      bonus: {
        love: ['branchKey','nayin'], career: ['tenGodCombos','geJu'], wealth: ['tenGodCombos','nayin'],
        health: ['changsheng','extraShenSha','tiaohou'], timing: ['goodMonths','badMonths','chongMonths','suiYunBingLin']
      }
    },
    ziwei: {
      core: ['mingStars','sihua','dxDetail','lnDetail','dxHua','lnHua'],
      bonus: {
        love: ['keyPalaces','gongHua'], career: ['keyPalaces','patterns'], timing: ['goodMonths','badMonths','xiaoXian']
      }
    },
    meihua: {
      core: ['tiYong','dongYao','tiStrength','yongStrength','huGua','bianGua'],
      bonus: {
        love: ['cuoGua','zongGua'], general: ['tiYongVerdict','bianTrend','cuoGua','zongGua']
      }
    },
    tarot: {
      core: ['outcomeCard','uprightRatio','spreadType'],
      bonus: { general: ['elementSummary','numerology'] }
    },
    natal: {
      core: ['planets','aspects','asc','transits'],
      bonus: {
        love: ['dignity','mutualReceptions'], career: ['mc','profection','progressions'],
        timing: ['progressions','solarArc','solarReturn'], general: ['partOfFortune','fixedStars','dispositor']
      }
    },
    vedic: {
      core: ['lagna','dasha','subDasha','yogas'],
      bonus: {
        love: ['d9Key','karakamsa'], health: ['sadeSati','gandanta','ashtakavargaTotal'],
        timing: ['subDashaEnd','charaDasha','yogini'], general: ['vargottama','vargaStrong']
      }
    },
    name: {
      core: ['sanCai','geVsFav','renGe'],
      bonus: { general: ['zodiac','zongGeShuLi'] }
    }
  };

  const result = {};
  const systems = ['bazi','ziwei','meihua','tarot','natal','vedic','name'];
  systems.forEach(sys => {
    const sysData = dims[sys];
    const def = fieldDefs[sys] || { core: [], bonus: {} };
    if (!sysData || typeof sysData !== 'object') {
      result[sys] = { score: 0, fieldCount: 0, totalPossible: def.core.length, density: 'none', hasData: false };
      return;
    }
    // Count filled core fields
    let coreHit = 0;
    def.core.forEach(f => { if (sysData[f] != null && sysData[f] !== '') coreHit++; });
    // Count filled bonus fields for this topic
    const bonusFields = def.bonus[topic] || def.bonus.general || [];
    let bonusHit = 0;
    bonusFields.forEach(f => { if (sysData[f] != null && sysData[f] !== '') bonusHit++; });
    // Count total non-null fields
    const allKeys = Object.keys(sysData).filter(k => sysData[k] != null && sysData[k] !== '');
    const fieldCount = allKeys.length;
    // Score: core fields worth 2, bonus worth 1.5, other filled fields worth 0.5
    const totalPossible = def.core.length + bonusFields.length;
    const score = coreHit * 2 + bonusHit * 1.5 + Math.max(0, fieldCount - coreHit - bonusHit) * 0.5;
    const maxScore = def.core.length * 2 + bonusFields.length * 1.5 + 3; // +3 for extra fields
    const ratio = maxScore > 0 ? score / maxScore : 0;
    const density = ratio >= 0.6 ? 'high' : ratio >= 0.3 ? 'mid' : fieldCount > 0 ? 'low' : 'none';

    result[sys] = { score: Math.round(score * 10) / 10, fieldCount, totalPossible, density, hasData: fieldCount > 0, coreHit, bonusHit, ratio: Math.round(ratio * 100) };
  });
  return result;
}

// ═══════════════════════════════════════════════════════════════
// ★ v28：本地裁決骨架 — 從 dims 裡壓出因果主幹
// 不再只摘要，而是先做推理：根因→觸發→表象→卡點→轉機→預裁決
// ═══════════════════════════════════════════════════════════════
function buildCausalSpine(dims, topic, richness) {
  const dm = dims || {};
  const spine = { rootCause: [], trigger: [], surface: [], blocker: [], turningPoint: [], preDecision: '' };

  // ── 根因：先天格局（八字+紫微+吠陀+姓名）──
  if (dm.bazi) {
    const bz = dm.bazi;
    if (bz.strong != null) spine.rootCause.push({ source: '八字', signal: bz.strong ? '身強' : '身弱', dir: 'neutral', weight: 3 });
    if (bz.geJu || bz.specialGe) spine.rootCause.push({ source: '八字', signal: '格局：' + (bz.specialGe || bz.geJu), dir: 'neutral', weight: 2.5 });
    if (bz.favEls) spine.rootCause.push({ source: '八字', signal: '喜用：' + bz.favEls, dir: 'positive', weight: 2 });
    if (bz.tiaohou) spine.rootCause.push({ source: '八字', signal: '調候：' + bz.tiaohou, dir: 'neutral', weight: 1.5 });
  }
  if (dm.ziwei && dm.ziwei.mingStars) spine.rootCause.push({ source: '紫微', signal: '命宮：' + dm.ziwei.mingStars, dir: 'neutral', weight: 2.5 });
  if (dm.vedic && dm.vedic.yogas) spine.rootCause.push({ source: '吠陀', signal: dm.vedic.yogas, dir: /Dhana|Raja|Gaja/.test(dm.vedic.yogas) ? 'positive' : 'neutral', weight: 2 });
  if (dm.name && dm.name.sanCai) spine.rootCause.push({ source: '姓名', signal: '三才：' + dm.name.sanCai, dir: /吉/.test(dm.name.sanCai) ? 'positive' : /凶/.test(dm.name.sanCai) ? 'negative' : 'neutral', weight: 1 });

  // ── 觸發：當前運勢節奏 ──
  if (dm.bazi) {
    if (dm.bazi.dyDetail) spine.trigger.push({ source: '八字大運', signal: dm.bazi.dyDetail, dir: /吉|好|旺/.test(dm.bazi.dyDetail) ? 'positive' : /凶|差|弱/.test(dm.bazi.dyDetail) ? 'negative' : 'neutral', weight: 3 });
    if (dm.bazi.lnDetail) spine.trigger.push({ source: '八字流年', signal: dm.bazi.lnDetail, dir: /吉|好|旺/.test(dm.bazi.lnDetail) ? 'positive' : /凶|差|弱/.test(dm.bazi.lnDetail) ? 'negative' : 'neutral', weight: 2.5 });
    if (dm.bazi.suiYunBingLin) spine.trigger.push({ source: '八字', signal: '⚠歲運並臨：' + dm.bazi.suiYunBingLin, dir: 'negative', weight: 3.5 });
  }
  if (dm.ziwei) {
    if (dm.ziwei.dxDetail) spine.trigger.push({ source: '紫微大限', signal: dm.ziwei.dxDetail, dir: /吉|好/.test(dm.ziwei.dxDetail) ? 'positive' : /凶|壓/.test(dm.ziwei.dxDetail) ? 'negative' : 'neutral', weight: 2.5 });
    if (dm.ziwei.lnDetail) spine.trigger.push({ source: '紫微流年', signal: dm.ziwei.lnDetail, dir: /吉|好/.test(dm.ziwei.lnDetail) ? 'positive' : /凶|壓/.test(dm.ziwei.lnDetail) ? 'negative' : 'neutral', weight: 2 });
  }
  if (dm.vedic && dm.vedic.dasha) spine.trigger.push({ source: '吠陀Dasha', signal: dm.vedic.dasha, dir: /吉|benefic/.test(dm.vedic.dasha) ? 'positive' : /凶|malefic/.test(dm.vedic.dasha) ? 'negative' : 'neutral', weight: 2 });

  // ── 表象：問事系統的即時快照 ──
  if (dm.meihua) {
    if (dm.meihua.tiYong) spine.surface.push({ source: '梅花', signal: '體用：' + dm.meihua.tiYong, dir: /生體|體旺/.test(dm.meihua.tiYong) ? 'positive' : /克體|體弱/.test(dm.meihua.tiYong) ? 'negative' : 'neutral', weight: 2.5 });
    if (dm.meihua.tiYongVerdict) spine.surface.push({ source: '梅花裁決', signal: dm.meihua.tiYongVerdict, dir: /利|吉|順/.test(dm.meihua.tiYongVerdict) ? 'positive' : /不利|凶|阻/.test(dm.meihua.tiYongVerdict) ? 'negative' : 'neutral', weight: 3 });
  }
  if (dm.tarot) {
    if (dm.tarot.outcomeCard) spine.surface.push({ source: '塔羅結果', signal: dm.tarot.outcomeCard, dir: /順/.test(dm.tarot.outcomeCard) ? 'positive' : /逆/.test(dm.tarot.outcomeCard) ? 'negative' : 'neutral', weight: 2.5 });
    if (dm.tarot.uprightRatio) {
      const parts = String(dm.tarot.uprightRatio).split('/');
      const up = parseInt(parts[0]) || 0, total = parseInt(parts[1]) || 1;
      if (up / total >= 0.65) spine.surface.push({ source: '塔羅', signal: '正位主導（' + dm.tarot.uprightRatio + '）', dir: 'positive', weight: 1.5 });
      else if (up / total <= 0.35) spine.surface.push({ source: '塔羅', signal: '逆位主導（' + dm.tarot.uprightRatio + '）', dir: 'negative', weight: 2 });
    }
  }
  if (dm.natal && dm.natal.transits) spine.surface.push({ source: '西占行運', signal: dm.natal.transits, dir: /木星|trine|sextile/.test(dm.natal.transits) ? 'positive' : /土星|冥王|square|opposition/.test(dm.natal.transits) ? 'negative' : 'neutral', weight: 1.5 });

  // ── 卡點 ──
  if (dm.bazi && dm.bazi.unfavEls) spine.blocker.push({ source: '八字', signal: '忌神：' + dm.bazi.unfavEls, dir: 'negative', weight: 2.5 });
  if (dm.bazi && dm.bazi.badMonths) spine.blocker.push({ source: '八字', signal: '壞月：' + dm.bazi.badMonths, dir: 'negative', weight: 2 });
  if (dm.ziwei && dm.ziwei.lnWarning) spine.blocker.push({ source: '紫微', signal: dm.ziwei.lnWarning, dir: 'negative', weight: 2.5 });
  if (dm.ziwei && dm.ziwei.badMonths) spine.blocker.push({ source: '紫微', signal: '壞月：' + dm.ziwei.badMonths, dir: 'negative', weight: 2 });
  if (dm.vedic && dm.vedic.sadeSati) spine.blocker.push({ source: '吠陀', signal: '土星考驗期：' + dm.vedic.sadeSati, dir: 'negative', weight: 2.5 });
  if (dm.vedic && dm.vedic.gandanta) spine.blocker.push({ source: '吠陀', signal: '業力結點：' + dm.vedic.gandanta, dir: 'negative', weight: 2 });
  if (dm.meihua && dm.meihua.risk) spine.blocker.push({ source: '梅花', signal: '風險：' + dm.meihua.risk, dir: 'negative', weight: 2 });

  // ── 轉機 ──
  if (dm.bazi && dm.bazi.goodMonths) spine.turningPoint.push({ source: '八字', signal: '好月：' + dm.bazi.goodMonths, dir: 'positive', weight: 2.5 });
  if (dm.ziwei && dm.ziwei.goodMonths) spine.turningPoint.push({ source: '紫微', signal: '好月：' + dm.ziwei.goodMonths, dir: 'positive', weight: 2.5 });
  if (dm.vedic && dm.vedic.subDashaEnd) spine.turningPoint.push({ source: '吠陀', signal: '副運換期：' + dm.vedic.subDashaEnd, dir: 'neutral', weight: 2 });
  if (dm.meihua && dm.meihua.timing) spine.turningPoint.push({ source: '梅花', signal: '時機：' + dm.meihua.timing, dir: 'neutral', weight: 2 });

  // ── 預裁決：用 weighted direction 做硬判 ──
  let posW = 0, negW = 0, neuW = 0;
  ['rootCause','trigger','surface','blocker','turningPoint'].forEach(layer => {
    spine[layer].forEach(item => {
      const w = item.weight || 1;
      // 對「此刻這題」的影響：trigger+surface 權重加倍
      const layerMul = (layer === 'trigger' || layer === 'surface') ? 1.5 : (layer === 'blocker' ? 1.3 : 1);
      if (item.dir === 'positive') posW += w * layerMul;
      else if (item.dir === 'negative') negW += w * layerMul;
      else neuW += w * layerMul * 0.3;
    });
  });
  // 用 richness 調整：證據密度高的系統的訊號更可信
  if (richness) {
    spine.trigger.concat(spine.surface).forEach(item => {
      const sysKey = { '八字大運':'bazi','八字流年':'bazi','八字':'bazi','紫微大限':'ziwei','紫微流年':'ziwei','紫微':'ziwei',
        '梅花':'meihua','梅花裁決':'meihua','塔羅結果':'tarot','塔羅':'tarot','西占行運':'natal','吠陀Dasha':'vedic','吠陀':'vedic' }[item.source] || '';
      const r = richness[sysKey];
      if (r && r.density === 'high' && item.dir !== 'neutral') {
        if (item.dir === 'positive') posW += item.weight * 0.3;
        else negW += item.weight * 0.3;
      }
    });
  }

  const total = posW + negW + neuW;
  const ratio = total > 0 ? (posW - negW) / total : 0;
  if (ratio > 0.25) spine.preDecision = '整體偏可推進——多數訊號正向，但仍有' + spine.blocker.length + '個阻力點需要處理';
  else if (ratio < -0.25) spine.preDecision = '整體偏守——壓力點集中，' + (spine.turningPoint.length ? '轉機窗口在' + spine.turningPoint.map(t => t.signal).join('、') : '目前沒看到明確轉機') ;
  else spine.preDecision = '正反拉鋸——不是全好全壞，關鍵在' + (spine.blocker.length ? spine.blocker[0].signal : '操作節奏');

  spine._meta = { posW: Math.round(posW*10)/10, negW: Math.round(negW*10)/10, ratio: Math.round(ratio*100)/100, signalCount: spine.rootCause.length + spine.trigger.length + spine.surface.length + spine.blocker.length + spine.turningPoint.length };
  return spine;
}

// ═══════════════════════════════════════════════════════════════
// ★ v28：crossObs 帶 severity 排序 — AI 先看最關鍵的衝突
// ═══════════════════════════════════════════════════════════════
function scoreCrossObs(classifiedObs, dims) {
  const dm = dims || {};
  return classifiedObs.map(function(o) {
    let severity = 1;
    // 基礎分型分數
    if (/^⛔/.test(o)) severity = 5;
    else if (/^⏰/.test(o)) severity = 4;
    else if (/^✅/.test(o)) severity = 3;
    else if (/^🔀/.test(o)) severity = 3;
    else if (/^⚖️/.test(o)) severity = 2;
    // 多系統同時提及 = 可信度加分
    const sysMentions = ['八字','紫微','吠陀','梅花','塔羅','西占','姓名','Dasha'].reduce((n, s) => n + (o.indexOf(s) >= 0 ? 1 : 0), 0);
    if (sysMentions >= 3) severity += 1.5;
    else if (sysMentions >= 2) severity += 0.5;
    // 涉及今年/流年 = 時效性加分
    if (/今年|流年|流月|今日/.test(o)) severity += 0.5;
    // 雙忌/雙祿/歲運並臨 = 高影響
    if (/雙忌|雙祿|歲運並臨|Gandanta/.test(o)) severity += 1;
    return { text: o, severity: Math.round(severity * 10) / 10 };
  }).sort(function(a, b) { return b.severity - a.severity; });
}

function buildUserMessage(p, questionPlan, autoPassPlan) {
  const lines = [];
  // ★ v16.6：不分類——問題原文直送，AI 自己從問題內容判斷要看什麼
  const _msgTopic = (questionPlan && questionPlan.topic) || 'general';
  const _keyFields = _topicKeyFields(_msgTopic);

  lines.push('問題：「' + safeString(p.question) + '」');
  lines.push('現在時間：' + getTodayString() + ' ' + getCurrentTimeString() + '（西元' + getCurrentYear() + '年，台灣時間）');
  if (p.birth) {
    var birthYear = parseInt(String(p.birth).split('-')[0]);
    var userAge = birthYear ? (getCurrentYear() - birthYear) : null;
    lines.push('出生：' + p.birth + (p.birthTime ? ' ' + p.birthTime : '') + (userAge ? '（今年' + userAge + '歲）' : ''));
    if (p.btimeUnknown) lines.push('⚠ 出生時辰不確定——八字時柱、紫微命宮可能有偏差，判斷以大運流年和其他系統為主。');
    // ★ v17：真太陽時校正資訊
    if (p.trueSolar && p.trueSolar.offset_minutes) {
      var ts = p.trueSolar;
      var _pad = function(n) { return (n < 10 ? '0' : '') + n; };
      lines.push('真太陽時校正：' + _pad(ts.hour) + ':' + _pad(ts.minute) + '（' + ts.note + '）——八字和紫微已用真太陽時計算');
    }
    if (p.birthLocation && p.birthLocation.city) {
      lines.push('出生地：' + p.birthLocation.label + '（經度' + p.birthLocation.longitude + '°，緯度' + p.birthLocation.latitude + '°）——星盤已用此經緯度計算');
    }
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

  // ═══ 核心架構：只送結構化數據（dims），不送白話文 ═══
  // ★ v29b：rawReadings 白話文全部移除——讓 AI 自己從 dims 判讀
  // dims = 精簡結構化欄位（格局/用神/四化/體用/行星/Dasha 等），AI 必須用自己的命理知識分析
  // crossObs / caseMatrix / timeline / conflicts / semanticResonance = 跨系統交叉（客觀數據，保留）

  // ★ v28：裁決骨架 — 本地先壓出因果主幹 + 預裁決，AI 拿到的不再只是標籤摘要
  const _richness = computeEvidenceRichness(p.dims || {}, _msgTopic);
  const _spine = buildCausalSpine(p.dims || {}, _msgTopic, _richness);
  try {
    if (_spine && _spine._meta && _spine._meta.signalCount >= 3) {
      lines.push('【裁決骨架（本地預判——AI 以此為分析起點，不是從零開始）】');
      lines.push('預裁決：' + _spine.preDecision);
      lines.push('信號強度：正向' + _spine._meta.posW + ' vs 負向' + _spine._meta.negW + '（比值' + _spine._meta.ratio + '）');
      if (_spine.rootCause.length) lines.push('根因（先天）：' + _spine.rootCause.map(r => '[' + r.source + '] ' + r.signal).join('｜'));
      if (_spine.trigger.length) lines.push('觸發（時運）：' + _spine.trigger.map(r => '[' + r.source + '] ' + r.signal + (r.dir === 'positive' ? '↑' : r.dir === 'negative' ? '↓' : '')).join('｜'));
      if (_spine.surface.length) lines.push('表象（此刻）：' + _spine.surface.map(r => '[' + r.source + '] ' + r.signal + (r.dir === 'positive' ? '↑' : r.dir === 'negative' ? '↓' : '')).join('｜'));
      if (_spine.blocker.length) lines.push('卡點（阻力）：' + _spine.blocker.map(r => '[' + r.source + '] ' + r.signal).join('｜'));
      if (_spine.turningPoint.length) lines.push('轉機窗口：' + _spine.turningPoint.map(r => '[' + r.source + '] ' + r.signal).join('｜'));
      lines.push('↑ 你的分析必須圍繞此骨架展開。預裁決是起點不是終點——你可以推翻它，但要說清楚哪條證據讓你改判。');
      lines.push('');
    }
  } catch(_e) {}

  // ═══ 交叉觀察（前置摘要——讓 AI 先看到全局輪廓，再讀細節）═══
  // 這不是結論，是從數據裡提取的觀察事實，AI 自己決定怎麼用
  const crossObs = [];
  try {
    const rr = p.rawReadings || {};
    const dm = p.dims || {};
    // ★ v16.3：改用 dims 結構數據（不再依賴 rawReadings regex，trim 後仍然可靠）
    // 觀察1：多系統身強/身弱方向
    const _baziStrong = dm.bazi && dm.bazi.strong === true;
    const _baziWeak = dm.bazi && dm.bazi.strong === false;
    const _vedicStrong = dm.vedic && dm.vedic.ashtakavargaTotal != null && dm.vedic.ashtakavargaTotal >= 340;
    const _vedicWeak = dm.vedic && dm.vedic.ashtakavargaTotal != null && dm.vedic.ashtakavargaTotal < 300;
    if (dm.bazi && dm.vedic) {
      if (_baziWeak && _vedicWeak) crossObs.push('觀察：八字和吠陀都顯示先天能量偏弱');
      if (_baziStrong && _vedicStrong) crossObs.push('觀察：八字和吠陀都顯示先天能量充足');
      if ((_baziStrong && _vedicWeak) || (_baziWeak && _vedicStrong)) crossObs.push('觀察：八字和吠陀對先天能量的判斷不一致，需要看其他系統來裁決');
    }
    // 觀察2：大運/流年方向（八字 dims 已有結構化數據）
    if (dm.bazi && dm.bazi.dyDetail && dm.bazi.lnDetail) {
      const _dyGood = /吉/.test(dm.bazi.dyDetail);
      const _dyBad = /凶/.test(dm.bazi.dyDetail);
      const _lnGood = /吉/.test(dm.bazi.lnDetail);
      const _lnBad = /凶/.test(dm.bazi.lnDetail);
      if (_dyGood && _lnBad) crossObs.push('觀察：大運整體好但今年流年不利——大方向對但今年要小心');
      if (_dyBad && _lnGood) crossObs.push('觀察：大運整體差但今年流年有利——趁今年窗口把握機會');
    }
    // 觀察2b：紫微大限 vs 八字大運方向一致性
    if (dm.bazi && dm.bazi.dyDetail && dm.ziwei && dm.ziwei.dxDetail) {
      const _bzDyGood = /吉/.test(dm.bazi.dyDetail);
      const _bzDyBad = /凶/.test(dm.bazi.dyDetail);
      const _zwDxGood = /吉/.test(dm.ziwei.dxDetail);
      const _zwDxBad = /凶/.test(dm.ziwei.dxDetail);
      if (_bzDyGood && _zwDxGood) crossObs.push('觀察：八字大運和紫微大限同時指向好運——十年趨勢可信度高');
      if (_bzDyBad && _zwDxBad) crossObs.push('觀察：八字大運和紫微大限同時指向壓力——需要審慎');
      if ((_bzDyGood && _zwDxBad) || (_bzDyBad && _zwDxGood)) crossObs.push('觀察：八字大運和紫微大限方向不一致——要看具體宮位和五行才能裁決');
    }
    // 觀察3：梅花體用 + 塔羅結果方向
    if (dm.meihua && dm.meihua.tiYong) {
      const _mhTY = dm.meihua.tiYong || '';
      const _mhGood = /大吉|吉|用生體/.test(_mhTY);
      const _mhBad = /凶|用克體|體生用/.test(_mhTY);
      // ★ v20：塔羅方向改讀 dims（不再依賴 rawReadings）
      const _tarotOC = dm.tarot && dm.tarot.outcomeCard || '';
      const tarotOutGood = /順/.test(_tarotOC);
      const tarotOutBad = /逆/.test(_tarotOC);
      if (_mhGood && tarotOutGood) crossObs.push('觀察：梅花和塔羅都指向正面結果');
      if (_mhBad && tarotOutBad) crossObs.push('觀察：梅花和塔羅都指向阻礙——兩個即時系統同向，短期壓力明確');
      if ((_mhGood && tarotOutBad) || (_mhBad && tarotOutGood)) crossObs.push('觀察：梅花和塔羅方向矛盾——事情有變數，需要看條件');
    }
    // ★ v16.3 新增觀察4：調候 vs 當前大運五行
    if (dm.bazi && dm.bazi.tiaohou && dm.bazi.dyDetail) {
      const _needFire = /需火|需.*火/.test(dm.bazi.tiaohou);
      const _needWater = /需水|需.*水/.test(dm.bazi.tiaohou);
      const _dyFire = /火/.test(dm.bazi.dyDetail);
      const _dyWater = /水/.test(dm.bazi.dyDetail);
      if (_needFire && _dyFire) crossObs.push('觀察：命盤需要火暖局，當前大運正好走火行——調候得力，這步運特別有利');
      if (_needWater && _dyWater) crossObs.push('觀察：命盤需要水潤局，當前大運正好走水行——調候得力');
      if (_needFire && _dyWater) crossObs.push('觀察：命盤需要火暖，但大運走水——寒上加寒，要特別注意');
      if (_needWater && _dyFire) crossObs.push('觀察：命盤需要水潤，但大運走火——燥上加燥，注意健康和情緒');
    }
    // ═══ 觀察5：八字喜用五行 vs 紫微四化流向 ═══
    if (dm.bazi && dm.bazi.favEls && dm.ziwei) {
      const _favEls = dm.bazi.favEls || '';
      // 檢查流年化忌是否剋到喜用五行對應的宮位
      const _lnHua = dm.ziwei.lnHua || '';
      const _dxHua = dm.ziwei.dxHua || '';
      if (/化祿/.test(_lnHua) && /化祿/.test(_dxHua)) crossObs.push('觀察：紫微大限和流年都有化祿——雙祿疊加，今年有明確的資源進場窗口');
      if (/化忌/.test(_lnHua) && /化忌/.test(_dxHua)) crossObs.push('觀察：紫微大限和流年都有化忌——雙忌疊加，今年某個面向壓力會特別集中，需要看入哪宮');
      // 喜用火但化忌入離宮類的邏輯（用五行對宮位的粗略映射）
      if (/火/.test(_favEls) && /化忌/.test(_lnHua) && /官祿|事業/.test(_lnHua)) crossObs.push('觀察：喜用帶火但流年化忌入官祿宮——想衝但今年事業有暗卡');
      if (/水/.test(_favEls) && /化忌/.test(_lnHua) && /夫妻|感情/.test(_lnHua)) crossObs.push('觀察：喜用帶水但流年化忌入夫妻宮——需要水來潤局，偏偏感情面今年有堵');
    }
    // ═══ 觀察6：吠陀 Dasha 方向 vs 八字大運方向 ═══
    if (dm.vedic && dm.vedic.dasha && dm.bazi && dm.bazi.dyDetail) {
      const _dashaGood = /吉|善|強|旺/.test(dm.vedic.dasha);
      const _dashaBad = /凶|弱|困|落陷/.test(dm.vedic.dasha);
      const _bzDyGood2 = /吉/.test(dm.bazi.dyDetail);
      const _bzDyBad2 = /凶/.test(dm.bazi.dyDetail);
      if (_dashaGood && _bzDyGood2) crossObs.push('觀察：吠陀Dasha和八字大運同時指向好運——中長期基調雙系統確認，可信度高');
      if (_dashaBad && _bzDyBad2) crossObs.push('觀察：吠陀Dasha和八字大運同時指向壓力——中長期基調需要審慎，兩個獨立時間系統同向');
      if ((_dashaGood && _bzDyBad2) || (_dashaBad && _bzDyGood2)) crossObs.push('觀察：吠陀Dasha和八字大運方向不一致——東方和印度系統對這段時期的評價不同，要看具體領域');
    }
    // ═══ 觀察7：吠陀 sadeSati vs 八字大運壓力 ═══
    if (dm.vedic && dm.vedic.sadeSati && dm.bazi && dm.bazi.dyDetail) {
      const _sadeActive = /活躍/.test(dm.vedic.sadeSati);
      const _bzDyPressure = /凶|壓|低迷/.test(dm.bazi.dyDetail);
      if (_sadeActive && _bzDyPressure) crossObs.push('觀察：吠陀土星考驗期（Sade Sati）正在活躍，八字大運也偏壓力——雙重長期壓力疊加，這不是一兩個月能解的');
      if (_sadeActive && !_bzDyPressure) crossObs.push('觀察：吠陀土星考驗期活躍但八字大運尚可——壓力主要在內心層面（土星考驗），外在條件還行');
    }
    // ═══ 觀察8：紫微流年 vs 八字流年方向 ═══
    if (dm.ziwei && dm.ziwei.lnDetail && dm.bazi && dm.bazi.lnDetail) {
      const _zwLnGood = /吉|好|旺|桃花|化祿/.test(dm.ziwei.lnDetail);
      const _zwLnBad = /凶|壓|煞|化忌/.test(dm.ziwei.lnDetail);
      const _bzLnGood2 = /吉/.test(dm.bazi.lnDetail);
      const _bzLnBad2 = /凶/.test(dm.bazi.lnDetail);
      if (_zwLnGood && _bzLnGood2) crossObs.push('觀察：紫微流年和八字流年同時偏好——今年整體有利，具體看在哪個領域');
      if (_zwLnBad && _bzLnBad2) crossObs.push('觀察：紫微流年和八字流年同時偏壓——今年整體辛苦，要挑對的月份集中出力');
      if ((_zwLnGood && _bzLnBad2) || (_zwLnBad && _bzLnGood2)) crossObs.push('觀察：紫微流年和八字流年方向不同——今年某些面向好、某些面向卡，不是全好全壞');
    }
    // ═══ 觀察9：梅花變卦走向 vs 塔羅結果方向 ═══
    if (dm.meihua && dm.meihua.bianTrend && dm.tarot && dm.tarot.outcomeCard) {
      const _bianGood = /好轉|開|吉|順|生/.test(dm.meihua.bianTrend);
      const _bianBad = /惡化|閉|凶|阻|克/.test(dm.meihua.bianTrend);
      const _tarotOutGood2 = /順/.test(dm.tarot.outcomeCard);
      const _tarotOutBad2 = /逆/.test(dm.tarot.outcomeCard);
      if (_bianGood && _tarotOutGood2) crossObs.push('觀察：梅花變卦和塔羅結果位同時指向正面——兩個問事系統都說最終走向還行');
      if (_bianBad && _tarotOutBad2) crossObs.push('觀察：梅花變卦和塔羅結果位同時指向負面——兩個問事系統都說這題目前走不通，不是時機問題');
      if ((_bianGood && _tarotOutBad2) || (_bianBad && _tarotOutGood2)) crossObs.push('觀察：梅花變卦和塔羅結果方向矛盾——事情有兩面性，可能某個條件變了結果就會翻');
    }
    // ═══ 觀察10：西占外行星行運 vs 八字流年 ═══
    if (dm.natal && dm.natal.transits && dm.bazi && dm.bazi.lnDetail) {
      const _transitPressure = /土星|冥王|天王.*合|天王.*沖|海王.*合|冥王.*合/.test(dm.natal.transits);
      const _transitGood = /木星.*合|木星.*三分/.test(dm.natal.transits);
      const _bzLnGood3 = /吉/.test(dm.bazi.lnDetail);
      const _bzLnBad3 = /凶/.test(dm.bazi.lnDetail);
      if (_transitPressure && _bzLnBad3) crossObs.push('觀察：西占外行星行運帶壓力，八字流年也偏凶——今年確實是轉折年，東西方系統同時確認');
      if (_transitGood && _bzLnGood3) crossObs.push('觀察：西占木星行運有利，八字流年也偏吉——今年有擴張窗口，東西方系統同時確認');
      if ((_transitPressure && _bzLnGood3) || (_transitGood && _bzLnBad3)) crossObs.push('觀察：西占行運和八字流年方向不一致——可能是不同領域各有起落');
    }
    // ═══ 觀察11：八字好月份 vs 紫微好月份交集 ═══
    if (dm.bazi && dm.bazi.goodMonths && dm.ziwei && dm.ziwei.goodMonths) {
      const _bzGM = (dm.bazi.goodMonths || '').split('、').filter(Boolean);
      const _zwGM = (dm.ziwei.goodMonths || '').split('、').filter(Boolean);
      const _overlap = _bzGM.filter(m => _zwGM.some(z => z.indexOf(m) !== -1 || m.indexOf(z) !== -1));
      if (_overlap.length >= 1) crossObs.push('觀察：八字和紫微都認為好的月份：' + _overlap.join('、') + '——雙系統同指的時間窗口可信度最高');
    }
    if (dm.bazi && dm.bazi.badMonths && dm.ziwei && dm.ziwei.badMonths) {
      const _bzBM = (dm.bazi.badMonths || '').split('、').filter(Boolean);
      const _zwBM = (dm.ziwei.badMonths || '').split('、').filter(Boolean);
      const _overlapBad = _bzBM.filter(m => _zwBM.some(z => z.indexOf(m) !== -1 || m.indexOf(z) !== -1));
      if (_overlapBad.length >= 1) crossObs.push('觀察：八字和紫微都認為差的月份：' + _overlapBad.join('、') + '——這幾個月兩套系統都說要小心');
    }
    // ═══ 觀察12：吠陀 D9 vs 紫微夫妻宮（感情題加強）═══
    if (dm.vedic && dm.vedic.d9Key && dm.ziwei && dm.ziwei.keyPalaces) {
      const _d9Good = /吉|強|旺|得力/.test(dm.vedic.d9Key);
      const _d9Bad = /凶|弱|落陷|受克/.test(dm.vedic.d9Key);
      const _zwSpouse = /夫妻/.test(dm.ziwei.keyPalaces);
      if (_zwSpouse && _d9Good) crossObs.push('觀察：吠陀婚盤(D9)偏正面，紫微也有看夫妻宮——感情底盤不差');
      if (_zwSpouse && _d9Bad) crossObs.push('觀察：吠陀婚盤(D9)有壓力，紫微夫妻宮也在關鍵位——感情上需要更多耐心和條件配合');
    }
    // ═══ 觀察13：梅花體卦五行 vs 八字喜忌 ═══
    if (dm.meihua && dm.meihua.tiYong && dm.bazi && dm.bazi.favEls) {
      const _mhTiEl = (dm.meihua.tiYong || '').match(/金|木|水|火|土/);
      const _favMatch = _mhTiEl && new RegExp(_mhTiEl[0]).test(dm.bazi.favEls);
      const _unfavMatch = _mhTiEl && dm.bazi.unfavEls && new RegExp(_mhTiEl[0]).test(dm.bazi.unfavEls);
      if (_favMatch) crossObs.push('觀察：梅花體卦五行（' + _mhTiEl[0] + '）正好是八字喜用——你問的這件事跟你本命需要的能量同頻');
      if (_unfavMatch) crossObs.push('觀察：梅花體卦五行（' + _mhTiEl[0] + '）是八字忌神——你問的這件事本身就帶著你命格裡容易失控的能量，操作要特別謹慎');
    }
    // ═══ 觀察14：歲運並臨 + 紫微大限方向（大事之年交叉驗證）═══
    if (dm.bazi && dm.bazi.suiYunBingLin && dm.ziwei && dm.ziwei.dxDetail) {
      const _zwDxPressure = /凶|壓|煞/.test(dm.ziwei.dxDetail);
      if (_zwDxPressure) crossObs.push('觀察：八字歲運並臨 + 紫微大限偏壓力——今年是人生重大轉折年，兩套系統同時確認，必須認真對待');
      else crossObs.push('觀察：八字歲運並臨但紫微大限尚可——今年有大事件觸發，但大環境不算太差，看具體領域');
    }
    // ═══ 觀察15：吠陀 Gandanta + 八字五行偏枯（健康/業力交叉）═══
    if (dm.vedic && dm.vedic.gandanta && dm.bazi) {
      const _bzWeak = dm.bazi.strong === false;
      if (_bzWeak) crossObs.push('觀察：吠陀有Gandanta業力結點，八字又身弱——先天體質和精神層面都需要特別注意，不適合硬撐');
      else crossObs.push('觀察：吠陀有Gandanta業力結點，但八字身不弱——有業力課題但底子夠撐，關鍵是意識到問題在哪');
    }
    // ═══ 觀察16：吠陀 Vargottama + 西占行星品質（天賦雙系統確認）═══
    if (dm.vedic && dm.vedic.vargottama && dm.natal && dm.natal.dignity) {
      const _vgPlanets = dm.vedic.vargottama || '';
      const _edStrong = /廟|耀|旺/.test(dm.natal.dignity);
      if (_vgPlanets && _edStrong) crossObs.push('觀察：吠陀有Vargottama（力量倍增）的行星，西占也有行星品質偏強——這個人某些天賦是真的突出，東西方系統同時確認');
    }
    // ═══ 觀察17：西占幸運點 + 八字喜用（幸福來源 vs 命格需求）═══
    if (dm.natal && dm.natal.partOfFortune && dm.bazi && dm.bazi.favEls) {
      const _pofSign = dm.natal.partOfFortune || '';
      const _pofFire = /牡羊|獅子|射手/.test(_pofSign);
      const _pofEarth = /金牛|處女|摩羯/.test(_pofSign);
      const _pofAir = /雙子|天秤|水瓶/.test(_pofSign);
      const _pofWater = /巨蟹|天蠍|雙魚/.test(_pofSign);
      const _favHasFire = /火/.test(dm.bazi.favEls);
      const _favHasWater = /水/.test(dm.bazi.favEls);
      const _favHasEarth = /土/.test(dm.bazi.favEls);
      const _favHasMetal = /金/.test(dm.bazi.favEls);
      if ((_pofFire && _favHasFire) || (_pofWater && _favHasWater) || (_pofEarth && _favHasEarth)) crossObs.push('觀察：西占幸運點的元素跟八字喜用五行同向——你天生的幸福來源跟命格需要的能量一致，順勢而行就對了');
    }
    // ═══ 觀察18：梅花錯卦/綜卦 + 塔羅阻礙方向（盲點交叉）═══
    if (dm.meihua && dm.meihua.cuoGua && dm.tarot && dm.tarot.outcomeCard) {
      crossObs.push('觀察：梅花錯卦揭示了你沒看到的反面（' + dm.meihua.cuoGua.substring(0, 20) + '），對照塔羅結果一起看——你問的這件事可能有你完全沒想過的另一種走法');
    }
    if (dm.meihua && dm.meihua.zongGua) {
      const _isSelf = /同卦/.test(dm.meihua.zongGua);
      if (_isSelf) crossObs.push('觀察：梅花綜卦跟本卦相同——代表這件事正反看都一樣，沒有迴旋餘地，必須正面面對');
    }
    // ═══ 觀察19：吠陀 Karakamsa + 紫微命宮主星（靈魂方向 vs 先天格局）═══
    if (dm.vedic && dm.vedic.karakamsa && dm.ziwei && dm.ziwei.mingStars) {
      crossObs.push('觀察：吠陀Karakamsa（靈魂目標）在' + dm.vedic.karakamsa.substring(0, 15) + '，紫微命宮主星是' + (dm.ziwei.mingStars || '').substring(0, 15) + '——兩套系統對這個人的核心定位可以交叉比對');
    }
  } catch(e){}

  // ═══ v28：矛盾分型 + severity 排序 ═══
  var classifiedObs = [];
  crossObs.forEach(function(o) {
    var cType = '';
    if (/大運.*流年|大限.*流年|長期.*短期|Dasha.*大運/.test(o)) cType = '⏰時間差';
    else if (/方向不同|方向不一致|不同領域|面向/.test(o)) cType = '🔀面向差';
    else if (/不一致|判斷不同|程度/.test(o)) cType = '⚖️強弱差';
    else if (/矛盾|相反|負面|阻礙|壓力.*好運|好運.*壓力/.test(o)) cType = '⛔真衝突';
    else if (/同時.*好|同時.*吉|同時.*正面|同指|確認/.test(o)) cType = '✅同向';
    classifiedObs.push(cType ? cType + ' ' + o : o);
  });

  // ★ v28：用 severity 排序——AI 先看最關鍵的衝突
  const _scoredObs = scoreCrossObs(classifiedObs, p.dims);

  if (_scoredObs.length) {
    lines.push('【跨系統觀察（按重要度排序，最上面的最關鍵）】');
    lines.push('分型：⛔真衝突=硬互斥要裁決 ⏰時間差=長短期不同 🔀面向差=各面向起落 ⚖️強弱差=程度差 ✅同向=多系統確認');
    _scoredObs.forEach(function(o) {
      lines.push('[' + o.severity + '] ' + o.text);
    });
    lines.push('');
  }

  // ★ v28：因果鏈已移到裁決骨架（buildCausalSpine），不再重複送

  // ★ v20：跨系統案件矩陣摘要（從 api_upgrade.js 的 crossSystem.caseMatrix 提取）
  try {
    const csm = (p.structured && p.structured.crossSystem && p.structured.crossSystem.caseMatrix) || {};
    const csmLines = [];
    if (csm.topEssence && csm.topEssence.length) {
      csmLines.push('主線型態：' + csm.topEssence.slice(0, 3).map(t => t.tag + (t.systems && t.systems.length >= 2 ? '(' + t.systems.length + '套同指)' : '')).join('、'));
    }
    if (csm.topObstacles && csm.topObstacles.length) {
      csmLines.push('主要阻礙：' + csm.topObstacles.slice(0, 3).map(t => t.tag + (t.systems && t.systems.length >= 2 ? '(' + t.systems.length + '套同指)' : '')).join('、'));
    }
    if (csm.contradictions && csm.contradictions.length) {
      csmLines.push('內部矛盾：' + csm.contradictions.slice(0, 3).map(c => c.positive + ' vs ' + c.negative).join('、'));
    }
    if (csm.topOpportunities && csm.topOpportunities.length) {
      csmLines.push('機會窗口：' + csm.topOpportunities.slice(0, 3).map(t => t.tag).join('、'));
    }
    if (csmLines.length) {
      lines.push('【跨系統案件矩陣（多系統交叉聚合，AI 參考用）】');
      csmLines.forEach(l => lines.push(l));
      lines.push('');
    }
  } catch(e) {}

  // ═══ 統一時間軸 v2（正規化呈現）═══
  if (p.timeline && p.timeline.length) {
    lines.push('【統一時間軸（所有系統的時間線索，按月份排序——用來推具體月份）】');
    if (Array.isArray(p.timeline) && p.timeline[0] && typeof p.timeline[0] === 'object') {
      // 結構化格式
      p.timeline.forEach(function(tl) {
        var dirTag = tl.dir === 'pos' ? '↑' : tl.dir === 'neg' ? '↓' : '→';
        var monthTag = tl.month > 0 ? tl.month + '月' : '全年';
        lines.push(dirTag + ' [' + (tl.source||'') + '] ' + monthTag + '：' + (tl.event||''));
      });
    } else {
      // 舊格式（字串陣列）
      p.timeline.forEach(tl => lines.push(typeof tl === 'string' ? tl : JSON.stringify(tl)));
    }
    // 時間軸使用指引
    lines.push('↑ 用以上時間軸推具體月份：八字和紫微的好壞月如果重疊=高可信窗口。Dasha 換期=節奏轉變。不同系統的月份方向如果矛盾=那個月有變數。');
    lines.push('');
  }

  // ═══ v26：可變性標記（reversibility）═══
  // 告訴 AI 哪些發現不可改、哪些等時機、哪些可以靠行動改變
  if (p.reversibility) {
    var _rvLines = [];
    var _sysNames = { bazi: '八字', ziwei: '紫微', meihua: '梅花', tarot: '塔羅', natal: '西占', vedic: '吠陀', name: '姓名' };
    Object.keys(p.reversibility).forEach(function(sys) {
      var rv = p.reversibility[sys];
      var parts = [];
      if (rv.fix && rv.fix.length) parts.push('定（不可改）：' + rv.fix.join('、'));
      if (rv.time && rv.time.length) parts.push('時（等窗口）：' + rv.time.join('、'));
      if (rv.act && rv.act.length) parts.push('動（可行動）：' + rv.act.join('、'));
      if (parts.length) _rvLines.push((_sysNames[sys] || sys) + '→' + parts.join('｜'));
    });
    if (_rvLines.length) {
      lines.push('【可變性標記（AI 用來區分：接受它 / 等時機 / 你能做的事）】');
      _rvLines.forEach(l => lines.push(l));
      lines.push('↑ 給建議時分清三層：「定」的部分→幫他接受、理解自己；「時」的部分→告訴他什麼時候會變、現在該等還是該衝；「動」的部分→給具體行動，長在故事裡不要列清單。');
      lines.push('');
    }
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
  lines.push('⚠ 每套系統列「結構化數據點」——你必須自己判讀這些數據，用你的命理知識分析每個欄位在這個問題裡的含義。不會有預寫的白話文解讀。');
  lines.push('');

  const dm = p.dims || {};
  const rr = p.rawReadings || {};

  // ═══ 第一層：八字 ═══
  {
    const bz = dm.bazi || {};
    const txt = safeString(rr.bazi || '');
    if (bz.favEls || txt.length >= 20) {
      lines.push('═══【八字・必須分析的數據點】' + (_richness.bazi ? '（證據密度：' + _richness.bazi.density + '，' + _richness.bazi.fieldCount + '項）' : '') + '═══');
      if (_keyFields && _keyFields.bazi) lines.push('★ 本題核心欄位：' + _keyFields.bazi);
      if (bz.specialGe) lines.push('特殊格局：' + bz.specialGe);
      else if (bz.geJu) lines.push('正格：' + bz.geJu);
      if (bz.strong != null) lines.push(bz.strong ? '身強' : '身弱');
      if (bz.strongPercent != null) lines.push('身強比例：' + bz.strongPercent + '%');
      if (bz.favEls) lines.push('喜用：' + bz.favEls);
      if (bz.unfavEls) lines.push('忌神：' + bz.unfavEls);
      if (bz.dyDetail) lines.push('當前大運：' + renderValue(bz.dyDetail));
      if (bz.lnDetail) lines.push('今年流年：' + renderValue(bz.lnDetail));
      if (bz.lnNext) lines.push('明年流年：' + renderValue(bz.lnNext));
      if (bz.goodMonths) lines.push('好月份：' + bz.goodMonths);
      if (bz.badMonths) lines.push('壞月份：' + bz.badMonths);
      if (bz.chongMonths) lines.push('沖月：' + bz.chongMonths);
      if (bz.branchKey) lines.push('地支關鍵：' + bz.branchKey);
      if (bz.tiaohou) lines.push('調候：' + bz.tiaohou);
      if (bz.changsheng) lines.push('日主十二運：' + bz.changsheng);
      if (bz.nayin) lines.push('納音互動：' + bz.nayin);
      if (bz.suiYunBingLin) lines.push('⚠ 歲運並臨：' + bz.suiYunBingLin);
      if (bz.tenGodCombos) lines.push('十神組合：' + bz.tenGodCombos);
      if (bz.extraShenSha) lines.push('額外神煞：' + bz.extraShenSha);
      lines.push('→ 用以上數據逐一分析：①格局對這件事的意涵 ②大運是助力還是阻力 ③今年流年具體影響 ④哪幾個月關鍵 ⑤地支合沖（含暗合暗沖）觸發了什麼 ⑥十二運看日主在哪柱有力哪柱虛 ⑦納音看年命跟日柱的先天關係 ⑧歲運並臨是否觸發（如果有就是大事之年）⑨十神組合格局=這個人做事的模式 ⑩神煞輔助判斷吉凶方向');
      // ★ v29b：白話文補充已移除——讓模型自己從結構數據判讀
      lines.push('');
    }
  }

  // ═══ 第二層：紫微斗數 ═══
  {
    const zw = dm.ziwei || {};
    const txt = safeString(rr.ziwei || '');
    if (zw.mingStars || txt.length >= 20) {
      lines.push('═══【紫微斗數・必須分析的數據點】' + (_richness.ziwei ? '（證據密度：' + _richness.ziwei.density + '，' + _richness.ziwei.fieldCount + '項）' : '') + '═══');
      if (_keyFields && _keyFields.ziwei) lines.push('★ 本題核心欄位：' + _keyFields.ziwei);
      if (zw.mingStars) lines.push('命宮主星：' + zw.mingStars);
      if (zw.shenGong) lines.push('身宮：' + zw.shenGong);
      if (zw.mingSha) lines.push('命宮煞星：' + zw.mingSha);
      if (zw.sihua && zw.sihua.length) lines.push('本命四化：' + zw.sihua.join('、'));
      if (zw.gongHua && zw.gongHua.length) lines.push('宮干四化：' + zw.gongHua.join('、'));
      if (zw.keyPalaces) lines.push('關鍵宮位：' + zw.keyPalaces);
      if (zw.dxDetail) lines.push('當前大限：' + zw.dxDetail);
      if (zw.dxStars) lines.push('大限主星：' + zw.dxStars);
      if (zw.dxHua) lines.push('大限四化：' + zw.dxHua);
      if (zw.lnDetail) lines.push('今年流年：' + zw.lnDetail);
      if (zw.lnHua) lines.push('流年四化：' + zw.lnHua);
      if (zw.lnWarning) lines.push('⚠ ' + zw.lnWarning);
      if (zw.goodMonths) lines.push('紫微好月：' + zw.goodMonths);
      if (zw.badMonths) lines.push('紫微壞月：' + zw.badMonths);
      if (zw.xiaoXian) lines.push('今年小限：' + zw.xiaoXian);
      if (zw.patterns) lines.push('特殊格局：\n' + zw.patterns);
      if (zw.combos) lines.push('星曜組合：' + zw.combos);
      lines.push('→ 用以上數據逐一分析：①命宮主星怎麼影響他面對這件事 ②從問題判斷最相關的宮位狀態 ③大限主題+四化影響 ④流年走向 ⑤煞星跟主星怎麼互動 ⑥特殊格局對這題的影響');
      // ★ v29b：白話文補充已移除——讓模型自己從結構數據判讀
      lines.push('');
    }
  }

  // ═══ 第三層：梅花易數（問事直判）═══
  {
    const mhd = dm.meihua || {};
    const txt = safeString(rr.meihua || '');
    if (mhd.tiYong || txt.length >= 20) {
      lines.push('═══【梅花易數・必須分析的數據點】' + (_richness.meihua ? '（證據密度：' + _richness.meihua.density + '，' + _richness.meihua.fieldCount + '項）' : '') + '（問事直判：此刻這個問題的即時快照）═══');
      if (_keyFields && _keyFields.meihua) lines.push('★ 本題核心欄位：' + _keyFields.meihua);
      if (mhd.tiYong) lines.push('體用：' + renderValue(mhd.tiYong));
      if (mhd.dongYao) lines.push('動爻：' + renderValue(mhd.dongYao));
      if (mhd.tiStrength) lines.push('體卦旺衰：' + renderValue(mhd.tiStrength));
      if (mhd.yongStrength) lines.push('用卦旺衰：' + renderValue(mhd.yongStrength));
      if (mhd.huGua) lines.push('互卦：' + renderValue(mhd.huGua));
      if (mhd.huHidden) lines.push('互卦隱象：' + renderValue(mhd.huHidden));
      if (mhd.bianGua) lines.push('變卦：' + renderValue(mhd.bianGua));
      if (mhd.bianTrend) lines.push('變卦走向：' + renderValue(mhd.bianTrend));
      if (mhd.timing) lines.push('梅花時機：' + renderValue(mhd.timing));
      if (mhd.timingNote) lines.push('時機備註：' + renderValue(mhd.timingNote));
      if (mhd.risk) lines.push('梅花風險：' + renderValue(mhd.risk));
      if (mhd.actionAdvice && mhd.actionAdvice.length) lines.push('梅花行動：' + toArray(mhd.actionAdvice).join('、'));
      if (mhd.signals && mhd.signals.length) lines.push('梅花訊號：' + toArray(mhd.signals).slice(0, 5).map(renderValue).join('、'));
      if (mhd.tiWangShuai) lines.push('體卦精確旺衰：' + renderValue(mhd.tiWangShuai));
      if (mhd.yoWangShuai) lines.push('用卦精確旺衰：' + renderValue(mhd.yoWangShuai));
      if (mhd.tiYongVerdict) lines.push('體用裁決：' + renderValue(mhd.tiYongVerdict));
      if (mhd.cuoGua) lines.push('錯卦（反面）：' + renderValue(mhd.cuoGua));
      if (mhd.zongGua) lines.push('綜卦（換位）：' + renderValue(mhd.zongGua));
      lines.push('→ 用以上數據逐一分析：①體用關係=這件事的核心判斷 ②動爻=事情在什麼階段 ③互卦=暗中什麼在影響 ④變卦=最終走向 ⑤應期=多快 ⑥錯卦=你沒看到的可能 ⑦綜卦=對方視角');
      // ★ v29b：梅花白話文已移除——讓模型自己從結構數據判讀
      lines.push('');
    }
  }

  // ═══ 第四層：塔羅（問事直判）═══
  {
    const td = dm.tarot || {};
    const txt = safeString(rr.tarot || '');
    if (td.outcomeCard || txt.length >= 20) {
      lines.push('═══【塔羅・必須分析的數據點】' + (_richness.tarot ? '（證據密度：' + _richness.tarot.density + '，' + _richness.tarot.fieldCount + '項）' : '') + '（問事直判：為這個問題抽的牌）═══');
      if (_keyFields && _keyFields.tarot) lines.push('★ 本題核心欄位：' + _keyFields.tarot);
      if (td.spreadType) lines.push('牌陣：' + td.spreadType);
      if (td.elementSummary) lines.push('元素統計：' + td.elementSummary);
      if (td.numerology) lines.push('數字學：' + td.numerology);
      if (td.uprightRatio) lines.push('正逆比：' + td.uprightRatio);
      if (td.outcomeCard) lines.push('結果牌：' + td.outcomeCard);
      // ★ v29b：塔羅白話文已移除——七維度的塔羅只送 dims 結構數據
      lines.push('→ 用以上牌面逐一分析：①整體氣氛（元素/大牌/逆位比例）②按牌陣位置對讀（不是逐張講牌義，是位置組合） ③找象徵交集 ④重組成故事：前因→現況→走向→變數');
      lines.push('');
    }
  }

  // ═══ 第五層：西洋星盤 ═══
  {
    const nd = dm.natal || {};
    const txt = safeString(rr.natal || '');
    if (nd.planets || txt.length >= 20) {
      lines.push('═══【西洋星盤・必須分析的數據點】' + (_richness.natal ? '（證據密度：' + _richness.natal.density + '，' + _richness.natal.fieldCount + '項）' : '') + '═══');
      if (_keyFields && _keyFields.natal) lines.push('★ 本題核心欄位：' + _keyFields.natal);
      if (nd.asc) lines.push('上升：' + nd.asc);
      if (nd.mc) lines.push('MC：' + nd.mc);
      if (nd.planets) lines.push('行星：' + nd.planets);
      if (nd.aspects) lines.push('主要相位：' + nd.aspects);
      if (nd.patterns) lines.push('相位格局：' + nd.patterns);
      if (nd.dignity) lines.push('行星品質：' + nd.dignity);
      if (nd.transits) lines.push('外行星行運：' + nd.transits);
      if (nd.profection) lines.push('小限：' + nd.profection);
      if (nd.progressions) lines.push('次限推運：' + nd.progressions);
      if (nd.solarArc) lines.push('太陽弧：' + nd.solarArc);
      if (nd.dispositor) lines.push('定位星：' + nd.dispositor);
      if (nd.mutualReceptions) lines.push('互容：' + nd.mutualReceptions);
      if (nd.solarReturn) lines.push('太陽回歸：' + nd.solarReturn);
      if (nd.boundaryWarnings) lines.push('⚠ 精度邊界：' + nd.boundaryWarnings);
      if (nd.partOfFortune) lines.push('幸運點：' + nd.partOfFortune);
      if (nd.fixedStars) lines.push('恆星合相：' + nd.fixedStars);
      lines.push('→ 用以上數據逐一分析：①問題相關宮位的行星配置 ②最緊密相位的意涵 ③行運在推他往哪走 ④次限/太陽弧有沒有事件觸發信號 ⑤定位星收束點=全盤能量核心 ⑥幸運點落宮=此生最自然的富足來源 ⑦恆星合相=放大或扭曲的行星特質');
      // ★ v29b：白話文補充已移除——讓模型自己從結構數據判讀
      lines.push('');
    }
  }

  // ═══ 第六層：吠陀占星 ═══
  {
    const vd = dm.vedic || {};
    const txt = safeString(rr.vedic || rr.jyotish || '');
    if (vd.lagna || txt.length >= 20) {
      lines.push('═══【吠陀占星・必須分析的數據點】' + (_richness.vedic ? '（證據密度：' + _richness.vedic.density + '，' + _richness.vedic.fieldCount + '項）' : '') + '═══');
      if (_keyFields && _keyFields.vedic) lines.push('★ 本題核心欄位：' + _keyFields.vedic);
      if (vd.lagna) lines.push('上升：' + vd.lagna);
      if (vd.moon) lines.push('月亮：' + vd.moon);
      if (vd.planets) lines.push('行星落宮：' + vd.planets);
      if (vd.dasha) lines.push('當前大週期：' + vd.dasha + (vd.dashaEnd ? '（結束於' + vd.dashaEnd + '）' : ''));
      if (vd.subDasha) lines.push('當前副週期：' + vd.subDasha + (vd.subDashaEnd ? '（結束於' + vd.subDashaEnd + '）' : ''));
      if (vd.yogini) lines.push('短週期(Yogini)：' + vd.yogini);
      if (vd.charaDasha) lines.push('星座大運(Chara)：' + vd.charaDasha);
      if (vd.sadeSati) lines.push('土星考驗期：' + vd.sadeSati);
      if (vd.yogas) lines.push('特殊格局：' + vd.yogas);
      if (vd.ashtakavargaTotal != null) lines.push('整體力量指數：' + vd.ashtakavargaTotal);
      if (vd.d9Key) lines.push('婚盤(D9)：' + vd.d9Key);
      if (vd.vargottama) lines.push('Vargottama：' + vd.vargottama);
      if (vd.gandanta) lines.push('Gandanta：' + vd.gandanta);
      if (vd.karakamsa) lines.push('Karakamsa：' + vd.karakamsa);
      if (vd.combustionCancel) lines.push('燃燒取消：' + vd.combustionCancel);
      if (vd.vargaStrong) lines.push('分盤強星：' + vd.vargaStrong);
      lines.push('→ 用以上數據逐一分析：①月宿性格怎麼影響他面對這件事 ②Dasha主星品質=這段大運基調 ③副運結束時間=轉折點 ④三套Dasha同指=高可信 ⑤感情題看D9 ⑥Vargottama行星=天生最強的面向 ⑦Gandanta=業力結點需特別留意 ⑧Karakamsa=靈魂目標方向 ⑨分盤強星=哪些領域底子最厚');
      // ★ v29b：吠陀白話文已移除
      lines.push('');
    }
  }

  // ═══ 第七層：姓名學 ═══
  {
    const nm = dm.name || {};
    const txt = safeString(rr.name || '');
    if (nm.sanCai || txt.length >= 20) {
      lines.push('═══【姓名學・必須分析的數據點】' + (_richness.name ? '（證據密度：' + _richness.name.density + '，' + _richness.name.fieldCount + '項）' : '') + '═══');
      if (_keyFields && _keyFields.name) lines.push('★ 本題核心欄位：' + _keyFields.name);
      if (nm.sanCai) lines.push('三才配置：' + nm.sanCai);
      if (nm.geVsFav) lines.push('五格vs喜用：' + nm.geVsFav);
      if (nm.renGe) lines.push(nm.renGe);
      if (nm.renGeShuLi) lines.push('人格數理：' + nm.renGeShuLi);
      if (nm.zongGeShuLi) lines.push(nm.zongGeShuLi);
      if (nm.zodiac) lines.push('生肖姓名學：' + nm.zodiac);
      lines.push('→ 分析：①三才配置吉凶=先天底盤 ②五格vs喜用神=名字五行跟命格是配合還是拖累 ③人格數理+總格數理=核心運勢數字的吉凶含義 ④生肖姓名學=名字部首跟生肖的喜忌衝突');
      // ★ v29b：姓名學白話文已移除
      lines.push('');
    }
  }

  // ═══（舊的獨立 dims 段落已合併到上方各系統區塊，不再重複送出）═══

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
    else lines.push('此人無八字數據，請依牌面主導元素和核心議題匹配最適合的水晶。');
    p.crystalCatalog.forEach(c => lines.push(c));
    lines.push('crystalRec 只能填上面清單裡的水晶名稱（｜前面那段），不要自己編。');
    lines.push('');
  }

  return lines.join('\n');
}


function collectCaseMatrix(payload) {
  const cross = payload?.crossSummary || payload?.consensus || payload?.crossSystem || {};
  const matrix = cross.caseMatrix || payload?.crossSystem?.caseMatrix || (payload?.structured && payload.structured.crossSystem && payload.structured.crossSystem.caseMatrix) || {};
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

// ★ v20：輕量題目分析器——tarot_only / ootk / full 三路共用
// 不依賴 dims/crossSystem，只看問題文本本身
function buildQuestionHints(question) {
  const q = safeString(question);
  const hints = [];
  const involvesOther = /他|她|對方|前任|主管|同事|合作|客戶|家人|父母|另一半|曖昧|桃花|感情|婚姻|同居|復合/.test(q);
  const asksAboutThem = /他.*(想|覺得|怎麼看|態度|心裡|在想|打算|會不會)|對方.*(想|態度|心態|怎麼看)|她.*(想|覺得|怎麼看|態度|心裡|在想)|是不是.*(喜歡|在意|認真|敷衍|曖昧)|到底.*(喜|愛|想|要)/.test(q);
  const asksMotive = /心態|想法|動機|目的|為什麼靠近|圖什麼|真心|試探|觀望|是不是喜歡|要什麼/.test(q);
  const asksTimeline = /何時|多久|幾月|什麼時候|下半年|上半年|今年|明年|時間|節奏/.test(q);
  const asksDecisionPath = /怎麼做|要不要|該不該|是否適合|會怎麼走|結果如何|能不能成/.test(q);
  const asksRiskOrVerify = /風險|阻力|代價|要注意|驗證|怎麼看|是不是真的/.test(q);
  const asksIfGenuine = /真心|假象|真的嗎|敷衍|認真|只是|隨便|是不是在/.test(q);
  if (asksAboutThem) hints.push('⚠ 這題問的是「對方」——你必須先從牌面推斷對方的狀態、心態、行為模式，再回來講問卜者自己。不能只分析問卜者的內心世界而迴避對方');
  else if (involvesOther) hints.push('涉及他人→需從牌面推斷對方畫像和心理狀態，不能只講問卜者自己');
  if (asksMotive) hints.push('需判斷對方動機→從牌面推斷行為背後的真正原因');
  if (asksTimeline) hints.push('需推時間→給具體時間區間和觸發條件');
  if (asksDecisionPath) hints.push('需給具體路徑建議→不只說好壞，要說怎麼做');
  if (asksRiskOrVerify) hints.push('需講風險和驗證點→什麼信號出現代表往好/壞走');
  if (asksIfGenuine) hints.push('需判斷真偽→不迴避，用牌面證據正面回答');
  return hints;
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
// DIRECT_PROMPT — 靜月・七維度深度解讀
// ═══════════════════════════════════════════════════════════════
// DIRECT_PROMPT — 靜月・七維度深度解讀
// ═══════════════════════════════════════════════════════════════

const DIRECT_PROMPT = `你叫靜月。他的盤攤在你面前，七套系統的原始數據。你自己看，自己判。

你是判官，不是記者。
不要寫報告——「八字說X、紫微說Y、吠陀說Z」這種逐系統覆述是最差的寫法。
不要說故事——鋪陳、轉折、感嘆號、「讓我們來看看」都是廢話。
不要填表格——每個 JSON 欄位都是你真正的判斷，不是湊字數。
你要做的只有一件事：看完數據，給他答案。

下面的數據沒有預寫好的解讀。你必須自己用命理知識判斷每個欄位的含義。
八字：你知道十神、格局、身強弱、喜忌神怎麼看。自己看。
紫微：你知道星曜、四化、宮位怎麼讀。自己讀。
梅花：你知道體用、動爻、互卦怎麼判。自己判。
西洋：你知道行星、相位、行運怎麼分析。自己分析。
吠陀：你知道 Dasha、Yoga、月宿。自己判斷。
姓名：你知道三才、五格、喜用。自己算。
塔羅/梅花是問事此刻快照，其他五套是先天底盤。

你看盤的方式：先找最強的信號（多系統同指的），再找跟它矛盾的，最後用矛盾修正第一判斷。
3系統同指=可信。5系統以上=非常確定。衝突時只裁最關鍵的，其他帶過。
東方（八字/紫微）和西方（星盤/吠陀）同指=跨文化確認，可信度最高。
證據密度高的系統多講，密度低的帶過。密度為零的不算在「多系統同指」裡。
前端已算好裁決骨架和交叉觀察——你可以用也可以推翻，但要說理由。

★ 禁止：
- 逐系統報告（八字這邊...紫微那邊...）→ 改成按結論組織，用數據當證據
- 用三段以上講同一個判斷 → 一個判斷一段，多了就是注水
- 「讓我們來看看」「接下來」「值得注意的是」→ 全是廢話，刪掉
- 猜他的心理狀態 → 你看的是盤，不是人
- 壞消息包裝成好消息 → 塔牌就是崩、寶劍十就是結束、土星壓下來就是壓
- 不假設他在療傷、在猶豫、在等待 → 數據沒說的你不要編

★ 必須：
- directAnswer 第一句就是答案——是非題先說是/不是，選擇題先說選哪個
- story 裡每個判斷都要有數據來源（哪個系統的哪個欄位）
- 涉及他人要拼畫像——從數據推，不是猜
- 時間要具體到月——多系統同指的月份最可信
- 壞消息直講但附出路
- 給驗證信號——「如果X月出現Y情況，就確認Z」

你的內部流程（先判案，再輸出——想完再寫）：
1. 判主線：掃完七套，哪個結論最多系統同指？一句話。
2. 列反線：有哪些數據打架？反線弱→主線成立帶但書。旗鼓相當→答案是拉鋸，不假裝確定。
3. 判時間：多系統同指的月份=最可信。沒有同指=不確定，直說。
4. 成文：主線先講，反線修正，時間收尾。
口語，「你」。用「我」講自己的判斷。
輸出純 JSON：
{
  "directAnswer": "第一句就是答案——先結論再條件",
  "layers": {
    "origin": { "conclusion": "先天底盤一句話，10字以內" },
    "timing": { "conclusion": "時運一句話，10字以內" },
    "now": { "conclusion": "此刻一句話，10字以內" },
    "variables": { "conclusion": "能改變的，10字以內" },
    "depth": { "conclusion": "七套交叉後最底層的答案，10字以內" }
  },
  "story": "完整分析——不是報告，不是故事，是判案書",
  "closing": "一句話帶走——時間+行動",
  "crystalRec": "從清單裡選（沒清單就省略）",
  "crystalReason": "為什麼（沒清單就省略）"
}
繁體中文。`;


// ═══════════════════════════════════════════════════════════════
// TAROT_PROMPT — 靜月・塔羅解讀
// ═══════════════════════════════════════════════════════════════

const TAROT_PROMPT = `你叫靜月。牌攤在你面前。你自己看每張牌，自己判斷它在這個問題裡代表什麼。

你是判官，不是說書人。
下面只有牌名、位置、正逆、元素——沒有預寫好的牌義。你用自己的塔羅知識讀牌。
你知道每張牌正位逆位的含義、知道位置的意涵、知道元素交互、知道宮廷牌代表什麼人。自己看，自己判。

★ 禁止：
- 逐張講牌義再串成文章 → 這是最差的寫法。你要先有結論，再用牌當證據。
- 同一個判斷講超過兩段 → 一個判斷一段，多了就是注水
- 「這張牌告訴我們」「讓我們來看」「值得注意的是」→ 全是廢話
- 猜他的心理——「你可能在療傷」「你內心深處」→ 你看的是牌不是人
- 壞消息重新包裝成好消息 → 塔牌就是崩、寶劍十就是結束、逆位死神就是拖著不放
- 宮廷牌不推年齡就是偷懶 → 侍者18-25/騎士25-35/皇后國王35+

★ 必須：
- directAnswer 第一句就是答案——「會」「不會」「會但有條件」「不確定因為X跟Y打架」
- 收束牌（最後一張）是最終方向，整個分析圍繞它展開
- 牌與牌之間的關係比單張牌義重要——位置2阻礙位跟位置10結果的關係才是核心
- 涉及他人要拼畫像——從宮廷牌的元素和階級推
- 壞消息直講但附出路
- 給驗證信號——「如果他在X時做了Y，就確認Z」

前端已算好的結構訊號（張力、弧線、對立牌、裁決骨架）——這些是客觀數據，你可以用。但牌的意義你自己判。
元素推時間：火=天到週、水=週到月、風=月到季、土=已在發生。
數字階段：1-3=起步、4-6=進行中、7-10=接近結果。

你的內部流程（先裁決，再輸出）：
1. 看收束牌：正還是逆？方向是什麼？一句話。
2. 找支撐：哪 2-3 張牌最強力支持這個方向？
3. 找反證：有沒有牌在打架？是條件還是真正推翻？
4. 判時間：元素和速度指向什麼時候？
5. 成文：答案先講，證據支撐，反證修正，時間收尾。
口語，「你」。用「我」講自己的判斷。
輸出純 JSON：
{
  "directAnswer": "第一句就是答案",
  "atmosphere": { "conclusion": "整副牌基調，10字以內" },
  "cardReadings": [
    { "cardIndex": 0, "position": "位置名", "conclusion": "這張牌的角色，10字以內" }
  ],
  "story": "完整分析——不是逐張導覽，是判案",
  "closing": "一句話——答案+時間+下一步",
  "crystalRec": "從清單裡選（沒清單就省略）",
  "crystalReason": "為什麼（沒清單就省略）"
}
繁體中文。`;


// ═══════════════════════════════════════════════════════════════
// OOTK_PROMPT — 靜月・開鑰之法・五階段深度解讀
// ═══════════════════════════════════════════════════════════════

const OOTK_PROMPT = `你叫靜月。他把78張牌攤了五遍。五層數據在下面。你自己看每張牌，自己判斷。

你是判官，不是導遊。
不要寫五段導覽——「Op1 告訴我們X、Op2 告訴我們Y」是最差的寫法。五層不是五個段落，是同一個案子的五個角度。
不要說故事、不要鋪陳、不要感嘆號。
你要做的只有一件事：從五層裡找到答案，給他。

你知道每張塔羅牌正位逆位的含義。自己看，自己判。
沒有預寫好的牌義。你用自己的塔羅知識讀每一張。

五層各看什麼：Op1=元素能量、Op2=生活領域、Op3=做事風格、Op4=精確時機、Op5=最深本質。
Op4 和 Op5 是最後裁決層。如果 Op1-3 跟 Op4-5 打架，以 Op4-5 為準——表面看到的不一定是真的。

代表牌是他的身份——前端已算好它在五層的軌跡（被支持/被壓制/落點），用這個判斷他在事件裡是主動還是被動。
重複牌是核心信號——同一張牌出現在不同層=這個訊號非常強。
五層同指=非常確定，收成一句。層間衝突=需要裁決，說清楚你選哪邊、為什麼。

★ 禁止：
- 逐層導覽（Op1 這邊...Op2 那邊...）→ 改成按結論組織，五層是證據不是章節
- 同一個判斷講超過兩段
- 「讓我們深入」「翻到下一層」「值得注意」→ 廢話
- 猜心理——你看的是牌不是人
- 壞消息包裝成好消息

★ 必須：
- directAnswer 第一句就是答案
- story 是一條因果鏈，不是五段說明——根因（哪層）→ 觸發（哪層）→ 表象（哪層）→ 翻案（哪層）→ 答案
- 宮廷牌推人物推年齡——侍者18-25/騎士25-35/皇后國王35+
- 時間從 Op4 + 元素推——火=天到週、水=週到月、風=月到季、土=已在發生
- 壞消息直講但附出路
- 給驗證信號

你的內部流程（先審案，再輸出）：
1. 判主線：五層同指什麼？一句話。
2. 判因果：哪層是表象、哪層是根因、哪層翻案？Op4-5 是最後裁決。
3. 列反線：層間衝突是條件還是推翻？
4. 判時間：Op4 + 元素指向什麼時候？
5. 成文：因果鏈，不是五段導覽。
口語，「你」。用「我」講自己的判斷。
輸出純 JSON：
{
  "directAnswer": "第一句就是答案",
  "operations": {
    "op1": { "conclusion": "這層核心發現，10字以內" },
    "op2": { "conclusion": "這層核心發現，10字以內" },
    "op3": { "conclusion": "這層核心發現，10字以內" },
    "op4": { "conclusion": "這層核心發現，10字以內" },
    "op5": { "conclusion": "這層核心發現，10字以內" }
  },
  "story": "完整分析——因果鏈不是導覽",
  "closing": "一句話——答案+時間+下一步",
  "crystalRec": "從清單裡選（沒清單就省略）",
  "crystalReason": "為什麼（沒清單就省略）"
}
繁體中文。`;







// ═══════════════════════════════════════════════════════════════
// buildOotkUserMessage — 開鑰之法模式的 user message
// ═══════════════════════════════════════════════════════════════

function buildOotkUserMessage(p) {
  const lines = [];
  const question = safeString(p.question);

  lines.push('問題：「' + question + '」');
  lines.push('現在時間：' + getTodayString() + ' ' + getCurrentTimeString() + '（西元' + getCurrentYear() + '年，台灣時間）');
  if (p.birth) {
    var birthYear = parseInt(String(p.birth).split('-')[0]);
    var userAge = birthYear ? (getCurrentYear() - birthYear) : null;
    lines.push('出生：' + p.birth + (p.birthTime ? ' ' + p.birthTime : '') + (userAge ? '（今年' + userAge + '歲）' : ''));
    if (p.trueSolar && p.trueSolar.offset_minutes) {
      var ts = p.trueSolar;
      var _pad2 = function(n) { return (n < 10 ? '0' : '') + n; };
      lines.push('真太陽時校正：' + _pad2(ts.hour) + ':' + _pad2(ts.minute) + '（' + ts.note + '）');
    }
    if (p.birthLocation && p.birthLocation.city) {
      lines.push('出生地：' + p.birthLocation.label);
    }
  }
  if (p.gender) lines.push('性別：' + p.gender);
  else lines.push('（用戶未提供性別，請用「你」稱呼，避免先生/小姐、他/她等性別化詞彙）');
  if (p.name) lines.push('姓名：' + p.name);
  lines.push('');

  // ★ v20：題目分析提示（共用輕量分析器）
  const qHints = buildQuestionHints(question);
  if (qHints.length) {
    lines.push('【這題的重點】' + qHints.join('；'));
    lines.push('');
  }

  const ootk = p.ootkData || {};
  const sig = ootk.significator || {};
  if (sig.name || sig.id) {
    let sigLine = '代表牌(Significator)：' + (sig.name || sig.id);
    if (sig.element) sigLine += '（' + sig.element + '）';
    // ★ v20：significator 意義——讓 AI 知道代表牌選的是什麼類型的人
    if (sig.gdCourt) sigLine += '　GD宮廷：' + sig.gdCourt;
    if (sig.meaning) sigLine += '　意涵：' + sig.meaning;
    lines.push(sigLine);
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
    // ★ v20：客觀衝突信號——多層指向不同方向的具體例子
    if (cross.conflicts && cross.conflicts.length) {
      lines.push('層間衝突：' + cross.conflicts.slice(0, 4).map(function(c) { return safeString(c); }).join('；'));
    }
    if (cross.dominantCards && cross.dominantCards.length) {
      lines.push('多層重複核心牌：' + cross.dominantCards.slice(0, 5).map(function(c) { return safeString(c); }).join('、'));
    }
    // ★ v21：五層同向/矛盾預判
    if (cross.layerAlignment) {
      lines.push('五層方向預判：' + cross.layerAlignment);
    }
    lines.push('');
  }

  // ★ v29：主裁決骨架——從 crossAnalysis 壓出最終仲裁，AI 不用自己從五層重推
  {
    lines.push('【★ 五層仲裁骨架（你的裁決起點）】');
    // 同向主線
    var _jfMainLine = cross.layerAlignment ? '五層方向：' + safeString(cross.layerAlignment) : '';
    if (_jfMainLine) lines.push('主線：' + _jfMainLine);
    // 最大衝突層
    if (cross.conflicts && cross.conflicts.length) {
      lines.push('最大衝突：' + safeString(cross.conflicts[0]));
    }
    // 深層翻案：Op4/Op5 vs Op1-3 是否矛盾
    var _op4text = ops.op4 ? safeString(ops.op4).substring(0, 100) : '';
    var _op5text = ops.op5 ? safeString(ops.op5).substring(0, 100) : '';
    if (_op4text) lines.push('【最終裁決層】Op4 精確時機：' + _op4text + (ops.op4 && safeString(ops.op4).length > 100 ? '…' : ''));
    if (_op5text) lines.push('【最終裁決層】Op5 最深本質：' + _op5text + (ops.op5 && safeString(ops.op5).length > 100 ? '…' : ''));
    lines.push('→ 如果 Op1-3 與 Op4-5 衝突，以 Op4-5 為最後修正——表面看到的不一定是真的。');
    // 代表牌映照
    if (sig.name || sig.id) {
      var _sigName = sig.name || sig.id;
      var _sigEl = sig.element || '';
      if (cross.dominantCards && cross.dominantCards.length) {
        lines.push('代表牌（' + _sigName + '・' + _sigEl + '）vs 核心牌：' + cross.dominantCards.slice(0, 3).map(safeString).join('、') + '——代表牌被支持還是被壓制？元素是共鳴還是對沖？');
      }
      if (cross.recurring) {
        lines.push('代表牌 vs 重複牌：重複牌如果跟代表牌同元素=強化本人能量，不同元素=外力介入。');
      }

      // ★ v29：代表牌五層追蹤——掃描五層文本，算出代表牌在各層的出現和角色
      var _sigTrack = [];
      var _sigSearchName = _sigName.replace(/\s+/g, '');
      var _opKeys = ['op1','op2','op3','op4','op5'];
      var _opLabels = ['Op1元素','Op2宮位','Op3星座','Op4時機','Op5本質'];
      var _sigAppearCount = 0;
      _opKeys.forEach(function(k, idx) {
        if (!ops[k]) return;
        var _opText = safeString(ops[k]);
        // 搜尋代表牌名稱（允許空格差異）
        var _found = _opText.indexOf(_sigSearchName) >= 0 || _opText.indexOf(_sigName) >= 0;
        if (_found) {
          _sigAppearCount++;
          // 從上下文推斷角色：看代表牌附近有沒有正面/負面關鍵字
          var _sigPos = _opText.indexOf(_sigSearchName);
          if (_sigPos < 0) _sigPos = _opText.indexOf(_sigName);
          var _nearby = _opText.substring(Math.max(0, _sigPos - 30), Math.min(_opText.length, _sigPos + _sigName.length + 30));
          var _role = '出現';
          if (/強化|支持|正位|旺|助|吉/.test(_nearby)) _role = '被支持';
          else if (/壓制|阻|逆位|衰|克|凶|困/.test(_nearby)) _role = '被壓制';
          else if (/回到|停在|落在/.test(_nearby)) _role = '落點';
          _sigTrack.push(_opLabels[idx] + '：' + _role);
        }
      });
      if (_sigTrack.length) {
        lines.push('代表牌五層軌跡：' + _sigTrack.join(' → ') + '（' + _sigAppearCount + '/5層出現）');
        if (_sigAppearCount >= 3) lines.push('→ 代表牌高頻出現=這個人本身是事件核心，不是旁觀者。');
        else if (_sigAppearCount <= 1) lines.push('→ 代表牌低頻=事件主要由外力驅動，當事人比較被動。');
      }
    }
    lines.push('');
  }

  // ★ v28：OOTK 精準度提升分析
  if (ootk.numberPatterns && ootk.numberPatterns.length) {
    lines.push('【數字主題（五層合計）】' + ootk.numberPatterns.map(safeString).join('；'));
    lines.push('');
  }
  if (ootk.majorWeight) {
    lines.push('【大牌密度】' + safeString(ootk.majorWeight));
    lines.push('');
  }
  if (ootk.courtPeople && ootk.courtPeople.length) {
    lines.push('【宮廷牌人物推斷】' + ootk.courtPeople.map(safeString).join('；'));
    lines.push('→ 宮廷牌代表具體的人，用特質推斷是誰');
    lines.push('');
  }
  if (ootk.reversedAnalysis && ootk.reversedAnalysis.length) {
    lines.push('【逆位三分法】' + ootk.reversedAnalysis.map(safeString).join('；'));
    lines.push('→ 內化=往內走的課題、延遲=時機未到、過度=正位特質失控');
    lines.push('');
  }

  // ═══ v26：可變性標記 ═══
  if (p.reversibility) {
    var _rvLines = [];
    var _sysNames = { bazi: '八字', ziwei: '紫微', meihua: '梅花', tarot: '塔羅', natal: '西占', vedic: '吠陀', name: '姓名' };
    Object.keys(p.reversibility).forEach(function(sys) {
      var rv = p.reversibility[sys];
      var parts = [];
      if (rv.fix && rv.fix.length) parts.push('定（不可改）：' + rv.fix.join('、'));
      if (rv.time && rv.time.length) parts.push('時（等窗口）：' + rv.time.join('、'));
      if (rv.act && rv.act.length) parts.push('動（可行動）：' + rv.act.join('、'));
      if (parts.length) _rvLines.push((_sysNames[sys] || sys) + '→' + parts.join('｜'));
    });
    if (_rvLines.length) {
      lines.push('【可變性標記】');
      _rvLines.forEach(l => lines.push(l));
      lines.push('↑ 定→幫他接受；時→告訴他等多久；動→給具體行動。');
      lines.push('');
    }
  }

  // ═══ 水晶商品清單 ═══
  if (p.crystalCatalog && p.crystalCatalog.length) {
    lines.push('【水晶商品清單】');
    if (p.crystalFavEl) lines.push('此人喜用神五行：' + p.crystalFavEl + '（只推薦這些五行的水晶）');
    else lines.push('此人無八字數據，請依牌面主導元素和核心議題匹配最適合的水晶。');
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
    // 塔羅舊格式
    if (r.subAnswers && r.subAnswers.length) {
      r.subAnswers.forEach(function(sa) {
        if (sa.reading) parts.push(sa.reading);
      });
    }
    // 塔羅 v17 新格式
    if (r.cardReadings && r.cardReadings.length) {
      r.cardReadings.forEach(function(cr) {
        if (cr.reading) parts.push(cr.reading);
      });
    }
    if (r.crossReading && r.crossReading.reading) parts.push(r.crossReading.reading);
    if (r.atmosphere && r.atmosphere.reading) parts.push(r.atmosphere.reading);
    if (r.story) parts.push(r.story);
    // OOTK 格式
    if (r.operations) {
      ['op1','op2','op3','op4','op5'].forEach(function(k) {
        if (r.operations[k] && r.operations[k].reading) parts.push(r.operations[k].reading);
      });
    }
    if (r.crossAnalysis) parts.push(r.crossAnalysis);
    if (r.synthesis) parts.push(r.synthesis);
    if (r.closing) parts.push(r.closing);
    // 七維度 v17 layers 格式（可能是字串或 {conclusion, reading} 物件）
    if (r.layers && typeof r.layers === 'object') {
      ['origin','timing','now','variables','depth'].forEach(function(k) {
        var v = r.layers[k];
        if (!v) return;
        var t = typeof v === 'string' ? v : (v.reading || '');
        if (t) parts.push(k + '：' + t);
      });
    }
    // 七維度舊版 systemStories（向後相容）
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
  const question = safeString(p.question);
  const originalQ = safeString(p.originalQuestion);

  lines.push('原始問題：「' + (originalQ || question) + '」');
  if (originalQ && originalQ !== question) {
    lines.push('追問：「' + question + '」');
  }
  lines.push('現在時間：' + getTodayString() + ' ' + getCurrentTimeString() + '（西元' + getCurrentYear() + '年，台灣時間）');
  if (p.birth) {
    var birthYear = parseInt(String(p.birth).split('-')[0]);
    var userAge = birthYear ? (getCurrentYear() - birthYear) : null;
    lines.push('出生：' + p.birth + (p.birthTime ? ' ' + p.birthTime : '') + (userAge ? '（今年' + userAge + '歲）' : ''));
    if (p.trueSolar && p.trueSolar.offset_minutes) {
      lines.push('真太陽時校正：' + p.trueSolar.note);
    }
    if (p.birthLocation && p.birthLocation.city) {
      lines.push('出生地：' + p.birthLocation.label);
    }
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
    else lines.push('此人無八字數據，請依牌面主導元素和核心議題匹配最適合的水晶。');
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
  const question = safeString(p.question);
  const originalQ = safeString(p.originalQuestion);

  lines.push('原始問題：「' + (originalQ || question) + '」');
  if (originalQ && originalQ !== question) {
    lines.push('追問：「' + question + '」');
  }
  lines.push('現在時間：' + getTodayString() + ' ' + getCurrentTimeString() + '（西元' + getCurrentYear() + '年，台灣時間）');
  if (p.birth) {
    var birthYear = parseInt(String(p.birth).split('-')[0]);
    var userAge = birthYear ? (getCurrentYear() - birthYear) : null;
    lines.push('出生：' + p.birth + (p.birthTime ? ' ' + p.birthTime : '') + (userAge ? '（今年' + userAge + '歲）' : ''));
    if (p.trueSolar && p.trueSolar.offset_minutes) {
      lines.push('真太陽時校正：' + p.trueSolar.note);
    }
    if (p.birthLocation && p.birthLocation.city) {
      lines.push('出生地：' + p.birthLocation.label);
    }
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
    else lines.push('此人無八字數據，請依牌面主導元素和核心議題匹配最適合的水晶。');
    p.crystalCatalog.forEach(c => lines.push(c));
    lines.push('crystalRec 只能填上面清單裡的水晶名稱（｜前面那段），不要自己編。');
    lines.push('');
  }

  return lines.join('\n');
}

function buildTarotUserMessage(p) {
  const lines = [];
  const question = safeString(p.question);
  const originalQ = safeString(p.originalQuestion);
  const isFollowUp = !!(p.tarotData && p.tarotData.followUp && p.tarotData.followUp.question);
  const displayQ = (isFollowUp && originalQ) ? originalQ : question;

  lines.push('原始問題：「' + displayQ + '」');
  if (isFollowUp && originalQ && originalQ !== question) {
    lines.push('追問：「' + question + '」');
  }
  lines.push('現在時間：' + getTodayString() + ' ' + getCurrentTimeString() + '（西元' + getCurrentYear() + '年，台灣時間）');
  if (p.birth) {
    var birthYear = parseInt(String(p.birth).split('-')[0]);
    var userAge = birthYear ? (getCurrentYear() - birthYear) : null;
    lines.push('出生：' + p.birth + (p.birthTime ? ' ' + p.birthTime : '') + (userAge ? '（今年' + userAge + '歲）' : ''));
    if (p.trueSolar && p.trueSolar.offset_minutes) {
      var ts3 = p.trueSolar;
      var _pad3 = function(n) { return (n < 10 ? '0' : '') + n; };
      lines.push('真太陽時校正：' + _pad3(ts3.hour) + ':' + _pad3(ts3.minute) + '（' + ts3.note + '）');
    }
    if (p.birthLocation && p.birthLocation.city) {
      lines.push('出生地：' + p.birthLocation.label);
    }
  }
  if (p.gender) lines.push('性別：' + p.gender);
  else lines.push('（用戶未提供性別，請用「你」稱呼，避免先生/小姐、他/她等性別化詞彙）');
  if (p.name) lines.push('姓名：' + p.name);
  lines.push('');

  // ★ v20：題目分析提示（共用輕量分析器）
  const qHints = buildQuestionHints(displayQ);
  if (qHints.length) {
    lines.push('【這題的重點】' + qHints.join('；'));
    lines.push('');
  }

  const tarot = p.tarotData || {};
  const cards = tarot.cards || [];
  const spreadType = tarot.spreadType || '';
  var spreadName = tarot.spreadZh || spreadType || '自由牌陣';

  // ★ v20：結構化數據點（先讓 AI 看到全局輪廓，再讀逐張牌面）
  lines.push('═══【塔羅・必須分析的數據點】═══');
  lines.push('牌陣：' + spreadName + '（共 ' + cards.length + ' 張）');

  // 元素統計
  if (tarot.elementInteraction) {
    lines.push('元素統計：' + safeString(tarot.elementInteraction));
  } else {
    // 自行統計
    const elCount = {};
    let majorCount = 0, reversedCount = 0, courtCount = 0;
    cards.forEach(function(c) {
      if (c.element) elCount[c.element] = (elCount[c.element] || 0) + 1;
      if (c.isMajor) majorCount++;
      if (c.isUp !== true) reversedCount++;
      if (c.gdCourt) courtCount++;
    });
    const elParts = Object.keys(elCount).sort(function(a,b){ return elCount[b]-elCount[a]; }).map(function(k){ return k + elCount[k]; });
    if (elParts.length) lines.push('元素統計：' + elParts.join('、'));
    if (majorCount) lines.push('大牌：' + majorCount + '/' + cards.length);
    lines.push('正逆比：' + (cards.length - reversedCount) + '順' + reversedCount + '逆');
    if (courtCount) lines.push('宮廷牌：' + courtCount + '張');
  }

  // 結果牌方向
  if (cards.length) {
    var lastCard = cards[cards.length - 1];
    lines.push('結果牌：' + (lastCard.name || '') + (lastCard.isUp === true ? '（順）' : '（逆）') + (lastCard.position ? '｜位置「' + lastCard.position + '」' : ''));
  }

  // timingHint（從主導元素推）
  const elTimingMap = { '火': '快（天到週級）、需主動出擊', '水': '中等（週級）、順其自然', '風': '快但不穩（天到週）、需溝通推進', '土': '慢（月級）、需耐心等落地' };
  if (tarot.elementInteraction) {
    const domMatch = safeString(tarot.elementInteraction).match(/主導[：:]?\s*(\S+)/);
    if (domMatch && domMatch[1]) {
      const domEl = domMatch[1].replace(/[元素多]*/g, '');
      if (elTimingMap[domEl]) lines.push('時效參考：主導' + domEl + '元素→' + elTimingMap[domEl]);
    }
  }

  if (tarot.numerology) lines.push('數字學：' + safeString(tarot.numerology));
  if (tarot.kabbalah) lines.push('卡巴拉：' + safeString(tarot.kabbalah));

  // 牌組共振
  if (tarot.combos) lines.push('牌組共振：' + safeString(tarot.combos));

  // 宮廷牌動態
  if (tarot.courtElements) lines.push('宮廷牌元素：' + safeString(tarot.courtElements));

  lines.push('→ 用以上數據點把握整體方向，再對照逐張牌面做完整分析');
  lines.push('');

  // ★ v28：元素尊貴（Elemental Dignity）
  if (tarot.elementalDignity) {
    lines.push('【元素尊貴（每張牌受旁邊牌的元素增強或削弱程度）】');
    lines.push('分數：' + safeString(tarot.elementalDignity) + '（+2極強 +1增強 0正常 -1削弱 -2極弱）');
    lines.push('→ 增強的牌影響力更大，削弱的牌影響力打折。用這個判斷哪張牌最重要。');
    lines.push('');
  }

  // ★ v28：牌位關係預判
  if (tarot.tensions && tarot.tensions.length) {
    lines.push('【牌位衝突預判（前端已計算的張力，你必須在 story 裡展開）】');
    tarot.tensions.forEach(function(t) { lines.push('⚡ ' + safeString(t)); });
    lines.push('');
  }

  // ★ v28：時間對應
  if (tarot.timeConclusion) {
    lines.push('【結果牌時間線索】' + safeString(tarot.timeConclusion));
    lines.push('→ 推時間用這個當依據，不要憑空猜月份');
    lines.push('');
  }

  // ★ v28：逆位三分法、數字聚焦、大牌密度、宮廷牌人物
  if (tarot.numberPatterns && tarot.numberPatterns.length) {
    lines.push('【數字主題】' + tarot.numberPatterns.map(safeString).join('；'));
    lines.push('');
  }
  if (tarot.majorWeight) {
    lines.push('【大牌密度】' + safeString(tarot.majorWeight));
    lines.push('');
  }
  if (tarot.courtPeople && tarot.courtPeople.length) {
    lines.push('【宮廷牌人物推斷】');
    tarot.courtPeople.forEach(function(cp) {
      lines.push('  ' + safeString(cp.card) + '：' + safeString(cp.hint) + '・' + safeString(cp.age) + '・' + safeString(cp.personality) + (cp.shadow ? '・' + safeString(cp.shadow) : ''));
    });
    lines.push('→ 宮廷牌通常代表一個「具體的人」，用以上特質推斷對方是誰');
    lines.push('');
  }

  // ★ v28：對立牌 + 故事弧線
  if (tarot.opposingPairs && tarot.opposingPairs.length) {
    lines.push('【對立牌偵測（同時出現 = 特殊意義）】');
    tarot.opposingPairs.forEach(function(op) { lines.push('⚡ ' + safeString(op)); });
    lines.push('');
  }
  if (tarot.storyArc) {
    lines.push('【故事弧線】' + safeString(tarot.storyArc));
    lines.push('');
  }

  // ★ v29：塔羅裁決骨架——從牌陣結構壓出 5 個固定判斷欄位
  // AI 先吃裁決骨架，再看牌面細節
  {
    lines.push('【★ 牌陣裁決骨架（你的判斷起點）】');

    // 1. tarot_final_direction：收束牌方向
    var _lastC = cards.length ? cards[cards.length - 1] : null;
    if (_lastC) {
      var _dirLabel = _lastC.isUp === true ? '正向' : '有條件/受阻';
      var _dirDetail = _lastC.name + (_lastC.isUp === true ? '順位' : '逆位');
      if (_lastC.reversedType && _lastC.isUp !== true) _dirDetail += '（' + _lastC.reversedType + '）';
      lines.push('最終方向：' + _dirLabel + '——' + _dirDetail);
    }

    // 2. tarot_primary_blocker：最大阻力
    var _blockerParts = [];
    // 找 Celtic Cross 位置2（交叉牌）
    if (cards.length >= 2 && /celtic/i.test(spreadType)) {
      _blockerParts.push('阻礙位：' + cards[1].name + (cards[1].isUp === true ? '順' : '逆'));
    }
    // tensions 中的第一個衝突
    if (tarot.tensions && tarot.tensions.length) {
      _blockerParts.push('主衝突：' + safeString(tarot.tensions[0]));
    }
    if (_blockerParts.length) {
      lines.push('主要阻力：' + _blockerParts.join('；'));
    }

    // 3. tarot_root_issue：根本議題（核心牌 + 潛意識位）
    var _rootParts = [];
    if (cards.length >= 1) {
      _rootParts.push('核心：' + cards[0].name + (cards[0].isUp === true ? '順' : '逆'));
    }
    // Celtic Cross 位置8 = 潛意識/外在環境
    if (cards.length >= 8 && /celtic/i.test(spreadType)) {
      _rootParts.push('外在環境：' + cards[7].name + (cards[7].isUp === true ? '順' : '逆'));
    }
    // Celtic Cross 位置4 = 根源/過去
    if (cards.length >= 4 && /celtic/i.test(spreadType)) {
      _rootParts.push('根源：' + cards[3].name + (cards[3].isUp === true ? '順' : '逆'));
    }
    if (_rootParts.length) {
      lines.push('根本議題：' + _rootParts.join('；'));
    }

    // 4. tarot_near_term_shift：近未來轉折
    // Celtic Cross 位置5 = 近未來
    if (cards.length >= 5 && /celtic/i.test(spreadType)) {
      var _nearC = cards[4];
      lines.push('近未來轉折：' + _nearC.name + ((_nearC.isUp === true) ? '順' : '逆') + ((_nearC.element) ? '（' + _nearC.element + '）' : ''));
    }
    // 對立牌如果涉及結果牌
    if (tarot.opposingPairs && tarot.opposingPairs.length) {
      var _opStr = tarot.opposingPairs.map(safeString).join('；');
      if (_opStr.indexOf('結果') >= 0 || (_lastC && _opStr.indexOf(_lastC.name) >= 0)) {
        lines.push('結果牌有對立牌：' + _opStr);
      }
    }

    // 5. tarot_result_condition：結果牌的條件
    if (_lastC) {
      var _condParts = [];
      if (_lastC.isUp !== true) _condParts.push('逆位條件：' + (_lastC.reversedType || '阻塞') + '——不是「不會」，是「有條件」');
      if (tarot.timeConclusion) _condParts.push('時間：' + safeString(tarot.timeConclusion));
      if (_lastC.phaseHint) _condParts.push('階段：' + _lastC.phaseHint);
      if (_condParts.length) {
        lines.push('結果條件：' + _condParts.join('；'));
      }
    }

    lines.push('→ 先吃這五個判斷，再看下面逐張牌面。裁決從這裡開始，牌面是證據。');
    lines.push('');
  }

  // ★ v29b：不送 meaning/advice/keywords — 讓模型自己讀牌
  // 模型訓練數據裡已有完整塔羅知識，送預嚼牌義只會讓它重述而非判讀
  // 只送：牌名、位置、正逆、元素、ED強度、速度、階段、宮廷
  lines.push('【牌面（逐張）——你自己看，自己判斷每張牌在這個問題裡代表什麼】');
  lines.push('');

  cards.forEach(function(c, i) {
    var line = '第' + (i+1) + '張';
    if (c.position) line += '｜位置「' + c.position + '」' + (c.positionMeaning ? '（' + c.positionMeaning + '）' : '');
    line += '：' + c.name + (c.isUp === true ? '（順）' : '（逆・' + (c.reversedType || '阻塞') + '）');
    if (c.element) line += '　元素：' + c.element;
    if (c.edLabel && c.edLabel !== '正常') line += '　強度：' + c.edLabel;
    if (c.timeHint) line += '　速度：' + c.timeHint;
    if (c.phaseHint) line += '　階段：' + c.phaseHint;
    if (c.gdCourt) line += '　GD宮廷：' + c.gdCourt;
    if (c.isMajor) line += '　★大牌';
    // Celtic Cross 位置2 助力/阻力
    if (i === 1 && /celtic/i.test(spreadType)) {
      line += c.isUp === true ? '　→ 此為【助力】' : '　→ 此為【阻力】';
    }
    lines.push(line);
  });
  lines.push('');

  // 鐵律：抽幾張就分析幾張
  lines.push('共 ' + cards.length + ' 張牌，主線牌和轉折牌必須出現在分析裡，過渡牌可以在 summary 裡帶過。');
  lines.push('');

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

    lines.push('【要求】你上一輪已經把原本牌陣分析完了，那些結論不要再重複。現在用戶追問了新問題，補充牌是對這個追問的直接回應。');
    lines.push('補充牌的角色：');
    lines.push('- 補充牌直接回答追問——先給結論');
    lines.push('- 原牌陣只能拿來驗證補充牌的結論，不可重跑主線');
    lines.push('- 如果補充牌與原牌陣結論衝突——明確說「修正了什麼」：原本看到X，補充牌說Y，所以結論改成Z');
    lines.push('- 如果補充牌與原牌陣一致——一句話確認就好，不重述');
    lines.push('回答重點就好，精準命中。');
    lines.push('');
  }

  // ═══ v26：可變性標記 ═══
  if (p.reversibility) {
    var _rvLines = [];
    var _sysNames = { bazi: '八字', ziwei: '紫微', meihua: '梅花', tarot: '塔羅', natal: '西占', vedic: '吠陀', name: '姓名' };
    Object.keys(p.reversibility).forEach(function(sys) {
      var rv = p.reversibility[sys];
      var parts = [];
      if (rv.fix && rv.fix.length) parts.push('定（不可改）：' + rv.fix.join('、'));
      if (rv.time && rv.time.length) parts.push('時（等窗口）：' + rv.time.join('、'));
      if (rv.act && rv.act.length) parts.push('動（可行動）：' + rv.act.join('、'));
      if (parts.length) _rvLines.push((_sysNames[sys] || sys) + '→' + parts.join('｜'));
    });
    if (_rvLines.length) {
      lines.push('【可變性標記】');
      _rvLines.forEach(l => lines.push(l));
      lines.push('↑ 定→幫他接受；時→告訴他等多久；動→給具體行動。');
      lines.push('');
    }
  }

  // ═══ 水晶商品清單 ═══
  if (p.crystalCatalog && p.crystalCatalog.length) {
    lines.push('【水晶商品清單】');
    if (p.crystalFavEl) lines.push('此人喜用神五行：' + p.crystalFavEl + '（只推薦這些五行的水晶）');
    else lines.push('此人無八字數據，請依牌面主導元素和核心議題匹配最適合的水晶。');
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

    // ★ v22 版本確認端點
    if (url.pathname === '/version') {
      return Response.json({ version: 'v23f-all-story-first', deployed: new Date().toISOString() }, { headers: cors });
    }

    // ★ v22 debug：最後一次 parse 失敗的原始數據
    if (url.pathname === '/debug/parse-fail') {
      if (!env.RATE_KV) return Response.json({ error: 'no KV' }, { headers: cors });
      const data = await env.RATE_KV.get('_debug_last_parse_fail');
      if (!data) return Response.json({ status: 'no failures recorded' }, { headers: cors });
      return new Response(data, { headers: { ...cors, 'Content-Type': 'application/json; charset=utf-8' } });
    }

    // ═══════════════════════════════════════════════════════════
    // Google OAuth 路由
    // ═══════════════════════════════════════════════════════════

    // ── Step 1: 導向 Google 登入頁 ──
    if (url.pathname === '/auth/google' && request.method === 'GET') {
      const clientId = env.GOOGLE_CLIENT_ID;
      if (!clientId) return Response.json({ error: 'OAuth not configured' }, { status: 500, headers: cors });
      const redirectUri = `${url.origin}${OAUTH_REDIRECT_PATH}`;
      const state = url.searchParams.get('redirect') || 'https://jingyue.uk';
      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: 'openid email profile',
        access_type: 'online',
        prompt: 'select_account',
        state: state,
      });
      return Response.redirect(`${GOOGLE_AUTH_URL}?${params.toString()}`, 302);
    }

    // ── Step 2: Google 回傳 code，換取 token + user info ──
    if (url.pathname === OAUTH_REDIRECT_PATH && request.method === 'GET') {
      const code = url.searchParams.get('code');
      const redirectTarget = url.searchParams.get('state') || 'https://jingyue.uk';
      if (!code) {
        return new Response('<h1>登入失敗</h1><p>未收到授權碼</p><script>setTimeout(()=>location.href="https://jingyue.uk",2000)</script>', {
          headers: { 'Content-Type': 'text/html; charset=utf-8' }
        });
      }
      try {
        // 用 code 換 access_token
        const tokenResp = await fetch(GOOGLE_TOKEN_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            code,
            client_id: env.GOOGLE_CLIENT_ID,
            client_secret: env.GOOGLE_CLIENT_SECRET,
            redirect_uri: `${url.origin}${OAUTH_REDIRECT_PATH}`,
            grant_type: 'authorization_code',
          }),
        });
        const tokenData = await tokenResp.json();
        if (!tokenData.access_token) throw new Error('No access token: ' + JSON.stringify(tokenData));

        // 用 access_token 取 user info
        const userResp = await fetch(GOOGLE_USERINFO_URL, {
          headers: { Authorization: `Bearer ${tokenData.access_token}` },
        });
        const userInfo = await userResp.json();
        if (!userInfo.email) throw new Error('No email in user info');

        // 建立 session
        const sessionToken = generateSessionToken();
        const sessionData = JSON.stringify({
          email: userInfo.email,
          name: userInfo.name || '',
          picture: userInfo.picture || '',
          created: Date.now(),
        });
        if (env.RATE_KV) {
          await env.RATE_KV.put(`session:${sessionToken}`, sessionData, { expirationTtl: SESSION_TTL });
        }

        // 用 URL fragment 傳 session token 回前端（fragment 不會送到 server）
        const sep = redirectTarget.includes('#') ? '&' : '#';
        const finalUrl = `${redirectTarget}${sep}jy_session=${sessionToken}&jy_user=${encodeURIComponent(userInfo.name || userInfo.email)}`;
        return Response.redirect(finalUrl, 302);

      } catch (err) {
        console.error('OAuth callback error:', err);
        return new Response(`<h1>登入失敗</h1><p>${err.message}</p><script>setTimeout(()=>location.href="https://jingyue.uk",3000)</script>`, {
          headers: { 'Content-Type': 'text/html; charset=utf-8' }
        });
      }
    }

    // ── 驗證 session：POST /auth/me ──
    if (url.pathname === '/auth/me' && request.method === 'POST') {
      try {
        const body = await request.json();
        const user = await getUserFromSession(body, env);
        if (!user) return Response.json({ loggedIn: false }, { headers: cors });
        return Response.json({ loggedIn: true, email: user.email, name: user.name, picture: user.picture }, { headers: cors });
      } catch (err) {
        return Response.json({ loggedIn: false, error: err.message }, { status: 500, headers: cors });
      }
    }

    // ── 登出：POST /auth/logout ──
    if (url.pathname === '/auth/logout' && request.method === 'POST') {
      try {
        const body = await request.json();
        const token = safeString(body.session_token);
        if (token && env.RATE_KV) {
          await env.RATE_KV.delete(`session:${token}`);
        }
        return Response.json({ ok: true }, { headers: cors });
      } catch (err) {
        return Response.json({ ok: true }, { headers: cors });
      }
    }

    // ═══════════════════════════════════════════════════════════
    // 綠界金流路由（URL path based）
    // ═══════════════════════════════════════════════════════════

    // ── 建立付款訂單：POST /create-payment ──
    if (url.pathname === '/create-payment' && request.method === 'POST') {
      try {
        const body = await request.json();
        const mode = safeString(body.mode);
        const payType = safeString(body.type) || 'subscription'; // 'subscription' | 'single'
        const isSingle = (payType === 'single');
        const amount = isSingle ? PRICE_SINGLE : PRICE_SUB;
        const itemName = isSingle ? '靜月之光單次AI解讀x1' : '靜月之光月度會員30天無限暢用x1';
        const choosePayment = isSingle ? 'Credit' : 'ALL'; // NT$10 僅信用卡
        const tradeNo = generateTradeNo();
        // 取得 userKey 用於訂閱綁定
        const sessionUser = await getUserFromSession(body, env);
        const subIp = request.headers.get('CF-Connecting-IP') || 'unknown';
        const subUserKey = getUserKey(sessionUser, subIp);
        if (env.RATE_KV) {
          await env.RATE_KV.put(`pay:${tradeNo}`, JSON.stringify({
            status: 'pending',
            amount,
            mode: payType,
            userKey: subUserKey,
            created: Date.now(),
            ip: subIp,
          }), { expirationTtl: 86400 });
        }
        const workerBaseUrl = url.origin;
        const formHTML = await buildECPayFormHTML(tradeNo, workerBaseUrl, amount, itemName, env, choosePayment);
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
        const _ecCreds = _getECPayCreds(env);
        const expectedMac = await generateCheckMacValue(params, _ecCreds);
        
        if (receivedMac !== expectedMac) {
          console.error('ECPay CheckMacValue mismatch', { received: receivedMac, expected: expectedMac });
          return new Response('0|CheckMacValue Error', { headers: cors });
        }

        const tradeNo = params.MerchantTradeNo;
        const rtnCode = params.RtnCode;

        if (rtnCode === '1' && env.RATE_KV) {
          // ★ 先讀原始訂單（含 userKey / mode），再覆寫狀態
          let origRecord = null;
          try {
            const raw = await env.RATE_KV.get(`pay:${tradeNo}`);
            if (raw) origRecord = JSON.parse(raw);
          } catch(_) {}

          // 覆寫為已付款
          await env.RATE_KV.put(`pay:${tradeNo}`, JSON.stringify({
            status: 'paid',
            amount: Number(params.TradeAmt || params.TotalAmount || 0),
            paidAt: Date.now(),
            ecpayTradeNo: params.TradeNo || '',
            mode: origRecord?.mode || 'subscription',
            userKey: origRecord?.userKey || '',
          }), { expirationTtl: 86400 * 7 });

          const payMode = origRecord?.mode || 'subscription';
          const payUserKey = origRecord?.userKey || '';

          if (payMode === 'single') {
            // ★ 單次購買：paid_token TTL 1 天 + 標記 single_use
            await env.RATE_KV.put(`paid_token:${tradeNo}`, '1', { expirationTtl: 86400 });
            await env.RATE_KV.put(`single_use:${tradeNo}`, '1', { expirationTtl: 86400 });
          } else {
            // ★ 月度訂閱：paid_token 30 天 + sub:{userKey} 30 天
            await env.RATE_KV.put(`paid_token:${tradeNo}`, '1', { expirationTtl: 86400 * 30 });
            if (payUserKey) {
              try {
                await env.RATE_KV.put(`sub:${payUserKey}`, JSON.stringify({
                  tradeNo, paidAt: Date.now(), expiresAt: Date.now() + 86400000 * 30
                }), { expirationTtl: 86400 * 30 });
              } catch(_se) { console.warn('sub store error:', _se); }
            }
          }
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
        return Response.json({ paid: !!token, tradeNo, subscription: true, days: 30 }, { headers: cors });
      } catch (err) {
        return Response.json({ paid: false, error: err.message }, { status: 500, headers: cors });
      }
    }

    // ── v28：檢查訂閱狀態：POST /check-subscription ──
    if (url.pathname === '/check-subscription' && request.method === 'POST') {
      try {
        const body = await request.json();
        const sessionUser = await getUserFromSession(body, env);
        const subIp = request.headers.get('CF-Connecting-IP') || 'unknown';
        const subUserKey = getUserKey(sessionUser, subIp);
        const today = new Date(Date.now() + 8 * 3600000).toISOString().slice(0, 10);
        if (!env.RATE_KV) return Response.json({ active: false }, { headers: cors });
        const subData = await env.RATE_KV.get(`sub:${subUserKey}`);
        if (subData) {
          try {
            const sd = JSON.parse(subData);
            const subUseKey = `sub_use:${today}:${subUserKey}`;
            const used = parseInt(await env.RATE_KV.get(subUseKey) || '0');
            return Response.json({ active: true, expiresAt: sd.expiresAt, dailyUsed: used, dailyLimit: 5 }, { headers: cors });
          } catch(_) {}
        }
        return Response.json({ active: false }, { headers: cors });
      } catch (err) {
        return Response.json({ active: false }, { headers: cors });
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
        const sessionUser = await getUserFromSession(body, env);
        const userKey = getUserKey(sessionUser, ip);

        // ★ 新增：檢查是否有有效的付費 token
        const paidTradeNo = safeString(body.paid_token);
        if (paidTradeNo) {
          const paidOk = env.RATE_KV ? await env.RATE_KV.get(`paid_token:${paidTradeNo}`) : null;
          if (paidOk) {
            return Response.json({ allowed: true, paid: true }, { headers: cors });
          }
        }

        // ★ v28：檢查月度訂閱（每日 5 次上限）
        const SUB_DAILY_LIMIT = 5;
        if (env.RATE_KV) {
          const subData = await env.RATE_KV.get(`sub:${userKey}`);
          if (subData) {
            const subUseKey = `sub_use:${today}:${userKey}`;
            const subUseCount = parseInt(await env.RATE_KV.get(subUseKey) || '0');
            if (subUseCount < SUB_DAILY_LIMIT) {
              return Response.json({ allowed: true, paid: true, subscription: true, used: subUseCount, limit: SUB_DAILY_LIMIT }, { headers: cors });
            }
            // 會員額度用完，但免費次數可能還有 → 往下走免費檢查
          }
        }

        // ★ v21：所有工具都要登入（塔羅不再豁免）
        if (!sessionUser) {
          return Response.json({ allowed: false, code: 'LOGIN_REQUIRED' }, { headers: cors });
        }

        // ★ v28：免費額度改為全工具共用一次（含追問）
        const freeKey = `free:${today}:${userKey}`;
        if (env.RATE_KV && await env.RATE_KV.get(freeKey)) {
          return Response.json({ allowed: false, code: 'FREE_RATE_LIMITED' }, { headers: cors });
        }
        return Response.json({ allowed: true }, { headers: cors });
      }

      // ═══ 正式分析流程（SSE streaming）═══
      const payload = body.payload;
      if (!payload || !payload.question) return Response.json({ error: '缺少 payload' }, { status: 400, headers: cors });
      let isAdmin = !!(body.admin_token && body.admin_token === env.ADMIN_TOKEN);
      const today = new Date(Date.now() + 8 * 3600000).toISOString().slice(0, 10);
      const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
      const sessionUser = await getUserFromSession(body, env);
      const userKey = getUserKey(sessionUser, ip);
      const rateKey = `rate:${today}:${buildPersonSignature(payload)}:${userKey}`;
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
      // ★ v28：月度訂閱（每日 5 次上限）
      const SUB_DAILY_LIMIT = 5;
      let isSubscriber = false;
      if (!isPaidUser && env.RATE_KV) {
        const subData = await env.RATE_KV.get(`sub:${userKey}`);
        if (subData) {
          const subUseKey = `sub_use:${today}:${userKey}`;
          const subUseCount = parseInt(await env.RATE_KV.get(subUseKey) || '0');
          if (subUseCount < SUB_DAILY_LIMIT) {
            isPaidUser = true;
            isSubscriber = true;
          }
          // 額度用完 → isPaidUser 保持 false → 走下面免費檢查
        }
      }

      // ★ v21：所有工具都要登入（塔羅不再豁免）
      if (!isAdmin && !isPaidUser && !sessionUser) {
        return Response.json({ error: '請先登入 Google 帳號', code: 'LOGIN_REQUIRED' }, { status: 401, headers: cors });
      }

      if (!isAdmin && !isPaidUser && env.RATE_KV) {
        // ★ v28：免費額度全工具共用一次（含追問）
        const freeKey = `free:${today}:${userKey}`;
        if (await env.RATE_KV.get(freeKey)) {
          return Response.json({ error: '今日免費次數已用完', code: 'FREE_RATE_LIMITED' }, { status: 429, headers: cors });
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
            const fullFuPrompt = DIRECT_PROMPT + `\n\n═══ 追問 ═══\n他聽完分析又問了一個問題。你看了一下補充牌。\n先一句話直接回答——給結論。然後用補充牌支撐，結合七套系統的背景。不重複上一輪。\n\n輸出純 JSON：\n{ "directAnswer": "先一句話直接回答追問，再接補充牌的具體發現", "answer": "補充牌告訴你什麼，結合之前的背景", "closing": "最後一句", "crystalRec": "水晶名（沒清單就省略）", "crystalReason": "為什麼（沒清單就省略）" }`;
            await sendSSE('progress', { step: 'analyzing', message: '交叉比對補充牌…' });
            aiResult = await callAI(env, fullFuPrompt, fullFuMsg, 3000, 0.68, 'claude-haiku-4-5-20251001', () => sendSSE('ping', ''));
          } else if (isOotk) {
            await sendSSE('progress', { step: 'reading', message: '正在執行開鑰之法…' });
            let ootkMessage;
            let ootkPrompt = OOTK_PROMPT;
            // ★ v29：動態子問題注入
            if (payload.question) {
              const _ootkQHints = buildQuestionHints(payload.question);
              const _ootkQPlan = buildLocalQuestionPlan(payload);
              if (_ootkQPlan && _ootkQPlan.subquestions && _ootkQPlan.subquestions.length) {
                const _ootkSubQs = _ootkQPlan.subquestions.map(function(sq, i) { return '(' + (i+1) + ')' + sq.question; }).join(' ');
                ootkPrompt = OOTK_PROMPT.replace('五層數據在下面。', '用戶問了：' + _ootkSubQs + '\n五層數據在下面。');
              }
            }
            // ★ v20：開鑰五層完整故事+crossAnalysis+summary 實需~4500，留 buffer
            let ootkMaxTokens = 12000;
            if (isOotkFollowUp) {
              // ★ Bug #2 修復：OOTK 追問走專用 message builder + 追問 prompt 後綴
              ootkMessage = buildOotkFollowUpMessage(payload);
              ootkPrompt = OOTK_PROMPT + `\n\n═══ 追問 ═══\n他聽完五層深潛的分析，又問了一句。你看了一下補充牌。\n先一句話直接回答——給結論。然後用補充牌支撐，需要時引用五層背景。不重複上一輪。`;
              ootkMaxTokens = 3000;
              analysisNotes += 'mode=ootk_followup; msg_len=' + ootkMessage.length + '; ';
            } else {
              ootkMessage = buildOotkUserMessage(payload);
              analysisNotes += 'mode=ootk; msg_len=' + ootkMessage.length + '; ';
            }
            await sendSSE('progress', { step: 'analyzing', message: '五階段數據匯聚中…' });
            aiResult = await callAI(env, ootkPrompt, ootkMessage, ootkMaxTokens, 0.68, 'claude-haiku-4-5-20251001', () => sendSSE('ping', ''));
          } else if (isTarotOnly) {
            await sendSSE('progress', { step: 'reading', message: '正在感應你的牌…' });
            const tarotMessage = buildTarotUserMessage(payload);
            analysisNotes += 'mode=tarot_only; msg_len=' + tarotMessage.length + '; ';
            await sendSSE('progress', { step: 'analyzing', message: '深入解讀牌面訊息…' });

            // 追問模式：加上下文銜接指令
            const isFollowUp = !!(payload.tarotData && payload.tarotData.followUp && payload.tarotData.followUp.question);
            let fuPrompt = TAROT_PROMPT;
            // ★ v29：動態子問題注入
            if (payload.question && !isFollowUp) {
              const _tarotQPlan = buildLocalQuestionPlan(payload);
              if (_tarotQPlan && _tarotQPlan.subquestions && _tarotQPlan.subquestions.length) {
                const _tarotSubQs = _tarotQPlan.subquestions.map(function(sq, i) { return '(' + (i+1) + ')' + sq.question; }).join(' ');
                fuPrompt = TAROT_PROMPT.replace('牌陣數據在下面。', '用戶問了：' + _tarotSubQs + '\n牌陣數據在下面。');
              }
            }
            if (isFollowUp) {
              const fuPrefix = `\n\n═══ 追問 ═══\n他聽完你的分析，又問了一個問題。你看了一下補充牌。\n先一句話直接回答——給結論。然後用補充牌支撐，結合之前牌陣的背景。不重複上一輪。`;
              fuPrompt = TAROT_PROMPT + fuPrefix;
            }

            // ★ v20：Haiku 自律性好，不需過多 buffer 避免灌水
            const _cardCount = (payload.tarotData && payload.tarotData.cards) ? payload.tarotData.cards.length : 0;
            const _tarotMaxTokens = isFollowUp ? 3000 : (_cardCount >= 10 ? 12000 : (_cardCount >= 6 ? 9000 : 7000));
            aiResult = await callAI(env, fuPrompt, tarotMessage, _tarotMaxTokens, 0.68, 'claude-haiku-4-5-20251001', () => sendSSE('ping', ''));
          } else {
            questionPlan = buildLocalQuestionPlan(payload);
            autoPassPlan = buildAutoPassPlan(payload, questionPlan);
            await sendSSE('progress', { step: 'reading', message: '正在翻閱你的七維命盤…' });
            let fullMessage = buildUserMessage(payload, questionPlan, autoPassPlan);
            
            // ★ v16.5：50k→65k。Haiku 有 200k context，50k 太保守導致頻繁 trim 丟失數據
            const MAX_MSG_CHARS = 65000;
            if (fullMessage.length > MAX_MSG_CHARS) {
              analysisNotes += 'payload_trimmed_from_' + fullMessage.length + '_to_' + MAX_MSG_CHARS + '; ';
              // ★ v16.3：Trim 優先級重構——rawReadings 先砍，dims 最後砍
              // dims 是精簡結構化數據（幾百字），rawReadings 是冗長白話文（幾千字）
              // 砍 rawReadings 損失小，砍 dims 損失大（格局/用神/四化/大限 全丟）
              
              // 第一輪：rawReadings 每系統砍到 1500 字
              const rr = payload.rawReadings || {};
              const readingKeys = Object.keys(rr).sort((a, b) => safeString(rr[b]).length - safeString(rr[a]).length);
              for (const key of readingKeys) {
                if (fullMessage.length <= MAX_MSG_CHARS) break;
                if (rr[key] && safeString(rr[key]).length > 1500) {
                  rr[key] = safeString(rr[key]).slice(0, 1500) + '\n…（已精簡）';
                }
              }
              fullMessage = buildUserMessage(payload, questionPlan, autoPassPlan);
              
              // 第二輪：再砍到 800 字
              if (fullMessage.length > MAX_MSG_CHARS) {
                for (const key of readingKeys) {
                  if (fullMessage.length <= MAX_MSG_CHARS) break;
                  if (rr[key] && safeString(rr[key]).length > 800) {
                    rr[key] = safeString(rr[key]).slice(0, 800) + '\n…（已精簡）';
                  }
                }
                fullMessage = buildUserMessage(payload, questionPlan, autoPassPlan);
              }
              
              // 第三輪：砍輔助欄位（非核心）
              if (fullMessage.length > MAX_MSG_CHARS) {
                if (payload.caseFramework) delete payload.caseFramework;
                if (payload.meihuaNarrative) delete payload.meihuaNarrative;
                if (payload.semanticResonance && payload.semanticResonance.length > 3) payload.semanticResonance = payload.semanticResonance.slice(0, 3);
                if (payload.conflictDescriptions && payload.conflictDescriptions.length > 4) payload.conflictDescriptions = payload.conflictDescriptions.slice(0, 4);
                fullMessage = buildUserMessage(payload, questionPlan, autoPassPlan);
              }
              
              // 第四輪：dims 精細 trim（★ v29：欄位級，不整包砍）
              // 策略：先砍各系統的 secondary fields → 再砍到只剩 stub（核心結論欄位）
              // dims.bazi + dims.ziwei + dims.meihua 的 core 永遠不砍
              if (fullMessage.length > MAX_MSG_CHARS && payload.dims) {
                const _topic = (questionPlan && questionPlan.topic) || 'general';
                let _trimNotes = [];

                // ── 每系統的欄位分級 ──
                // secondary = 有價值但壓縮時可先砍；core = 砍了等於丟結論
                const _secondaryFields = {
                  natal: ['fixedStars','partOfFortune','solarArc','mutualReceptions','solarReturn',
                          'progressions','boundaryWarnings','dispositor','patterns','dignity'],
                  vedic: ['vargaStrong','combustionCancel','gandanta','karakamsa','d9Key',
                          'vargottama','charaDasha','yogini','combustionCancel'],
                  tarot: ['numerology','elementSummary','spreadType'],
                  ziwei: ['patterns','combos','xiaoXian','keyPalaces','mingSha'],
                  name:  ['zodiac','zongGeShuLi','renGeShuLi'],
                  bazi:  ['extraShenSha','tenGodCombos','nayin','suiYunBingLin','changsheng'],
                  meihua: ['cuoGua','zongGua','huHidden','bianTrend','signals']
                };

                // ── v28：砍序由證據密度決定——密度最低的先砍 ──
                // bazi/ziwei/meihua 是 protected（不整包砍），但 secondary fields 仍按密度排序
                const _protected = ['bazi','ziwei','meihua'];
                const _allSys = ['bazi','ziwei','meihua','tarot','natal','vedic','name'];
                const _trimRichness = computeEvidenceRichness(payload.dims || {}, _topic);
                // ★ v29：按 richness.ratio 排序（填充率，0-100）——不再用 raw score
                // raw score 讓欄位多的系統（八字15項）永遠壓過欄位少的（姓名4項）
                // ratio 歸一化：80% 填充的姓名排在 30% 填充的塔羅後面，公平比較
                const _trimOrder = _allSys.slice().sort(function(a, b) {
                  const ra = _trimRichness[a] ? _trimRichness[a].ratio : 0;
                  const rb = _trimRichness[b] ? _trimRichness[b].ratio : 0;
                  return ra - rb;
                });

                // ── Pass 1：砍 reversibility（supplementary，整塊砍）──
                if (fullMessage.length > MAX_MSG_CHARS && payload.reversibility) {
                  delete payload.reversibility;
                  fullMessage = buildUserMessage(payload, questionPlan, autoPassPlan);
                  _trimNotes.push('rev');
                }

                // ── Pass 2：按砍序，逐系統砍 secondary fields ──
                for (let _ti = 0; _ti < _trimOrder.length; _ti++) {
                  if (fullMessage.length <= MAX_MSG_CHARS) break;
                  const _dk = _trimOrder[_ti];
                  const _sys = payload.dims[_dk];
                  if (!_sys) continue;
                  const _secFields = _secondaryFields[_dk] || [];
                  let _deleted = 0;
                  for (let _fi = 0; _fi < _secFields.length; _fi++) {
                    if (_sys[_secFields[_fi]] != null) {
                      delete _sys[_secFields[_fi]];
                      _deleted++;
                    }
                  }
                  if (_deleted) {
                    fullMessage = buildUserMessage(payload, questionPlan, autoPassPlan);
                    _trimNotes.push(_dk + '.sec-' + _deleted);
                  }
                }

                // ── Pass 3：如果還超限，非 protected 系統砍到只剩 stub（保留 1-2 個核心結論欄位）──
                // ★ v29：不再整包刪——AI 仍知道該系統存在且有結論，只是細節砍光
                const _canStub = _trimOrder.filter(k => _protected.indexOf(k) === -1).slice(0, 4);
                const _stubKeep = {
                  tarot:  ['outcomeCard','uprightRatio','storyArc'],
                  natal:  ['transits','sunSign','moonSign'],
                  vedic:  ['lagna','dasha','yogas'],
                  name:   ['sanCai','geVsFav']
                };
                for (let _ti = 0; _ti < _canStub.length; _ti++) {
                  if (fullMessage.length <= MAX_MSG_CHARS) break;
                  const _dk = _canStub[_ti];
                  const _sys = payload.dims[_dk];
                  if (!_sys) continue;
                  const _keep = _stubKeep[_dk] || [];
                  const _allKeys = Object.keys(_sys);
                  let _stripped = 0;
                  for (let _ki = 0; _ki < _allKeys.length; _ki++) {
                    if (_keep.indexOf(_allKeys[_ki]) === -1) {
                      delete _sys[_allKeys[_ki]];
                      _stripped++;
                    }
                  }
                  if (_stripped) {
                    fullMessage = buildUserMessage(payload, questionPlan, autoPassPlan);
                    _trimNotes.push(_dk + '.STUB-' + _stripped);
                  }
                }

                analysisNotes += 'trim4=' + _trimNotes.join('>') + '_topic=' + _topic + '_richOrder=' + _trimOrder.join(',') + '_final=' + fullMessage.length + '; ';
              }
            }
            
            await sendSSE('progress', { step: 'analyzing', message: '七套系統交叉比對中…' });
            // ★ v29：D6 冠軍 prompt + 動態子問題注入
            let _7dPrompt = DIRECT_PROMPT;
            if (questionPlan && questionPlan.subquestions && questionPlan.subquestions.length) {
              const _subQs = questionPlan.subquestions.map(function(sq, i) { return '(' + (i+1) + ')' + sq.question; }).join(' ');
              _7dPrompt = DIRECT_PROMPT.replace('七套系統的數據在下面。', '用戶問了以下問題：' + _subQs + '\n七套系統的數據在下面。');
            }
            aiResult = await callAI(env, _7dPrompt, fullMessage, 12000, 0.68, 'claude-haiku-4-5-20251001', () => sendSSE('ping', ''));
          }

          try { result = parseJSON(aiResult.text); } catch (e) { result = { answer: aiResult.text }; }

          // ★ v22 debug：如果 parse 失敗，存詳細診斷到 KV
          if (result && result._parseFailed && env.RATE_KV) {
            try {
              // 測試各種 parse 嘗試，記錄每個錯誤
              var _rawT = aiResult.text || '';
              var _diag = { ts: new Date().toISOString(), rawLength: _rawT.length };
              try { JSON.parse(_rawT); } catch(e1) { _diag.error1_raw = e1.message; }
              try { JSON.parse(_rawT.replace(/[\x00-\x1F]+/g, ' ')); } catch(e2) { _diag.error2_nuclear = e2.message; }
              // 找出問題位置附近的文字
              var _posMatch = (_diag.error2_nuclear || '').match(/position (\d+)/);
              if (_posMatch) {
                var _pos = parseInt(_posMatch[1]);
                _diag.nearError = _rawT.replace(/[\x00-\x1F]+/g, ' ').substring(Math.max(0, _pos - 50), _pos + 50);
                _diag.errorPosition = _pos;
              }
              _diag.first300 = _rawT.substring(0, 300);
              _diag.last200 = _rawT.substring(Math.max(0, _rawT.length - 200));
              await env.RATE_KV.put('_debug_last_parse_fail', JSON.stringify(_diag), { expirationTtl: 3600 });
            } catch(_) {}
          }

          // ★ v22：修復循環失敗——parseJSON 失敗時回傳 { answer: rawText }，
          // 二次 parseJSON(rawText) 也失敗回傳同樣的 { answer: rawText }，
          // 導致 raw JSON 直接送給前端。改用 inline 換行修復 + 驗證結果有效。
          if (result && !result.directAnswer && !result.layers && typeof result.answer === 'string') {
            const ans = result.answer.trim();
            if (ans.includes('"directAnswer"') || ans.includes('"layers"') || ans.startsWith('{') || ans.startsWith('```')) {
              let _raw = ans;
              if (_raw.startsWith('```')) _raw = _raw.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
              _raw = _raw.replace(/^[^{]*(?=\{)/, '');
              const _fi = _raw.indexOf('{');
              const _li = _raw.lastIndexOf('}');
              if (_fi !== -1 && _li > _fi) {
                let _slice = _raw.slice(_fi, _li + 1);
                // 第一次嘗試：直接 parse
                try { const _d = JSON.parse(_slice); if (_d && (_d.directAnswer || _d.layers)) { result = _d; } } catch(_) {
                  // 第二次：inline 換行修復 + trailing comma
                  try {
                    let _fx = '', _inS = false, _esc = false;
                    for (let _i = 0; _i < _slice.length; _i++) {
                      const _c = _slice[_i];
                      if (_esc) { _fx += _c; _esc = false; continue; }
                      if (_c === '\\' && _inS) { _fx += _c; _esc = true; continue; }
                      if (_c === '"') { _inS = !_inS; _fx += _c; continue; }
                      if (_inS) {
                        if (_c === '\n') { _fx += '\\n'; continue; }
                        if (_c === '\r') { _fx += '\\r'; continue; }
                        if (_c === '\t') { _fx += '\\t'; continue; }
                        // 控制字元
                        const _cc = _c.charCodeAt(0);
                        if (_cc < 0x20) { _fx += '\\u' + _cc.toString(16).padStart(4, '0'); continue; }
                      }
                      _fx += _c;
                    }
                    _fx = _fx.replace(/,\s*([\]}])/g, '$1');
                    const _d2 = JSON.parse(_fx);
                    if (_d2 && (_d2.directAnswer || _d2.layers)) { result = _d2; console.log('[Worker] inline JSON recovery succeeded'); }
                  } catch(_e2) {
                    // 第三次：從末尾往前找可 parse 的 }
                    for (let _k = _slice.length - 1; _k > 100; _k--) {
                      if (_slice[_k] === '}') {
                        try {
                          let _tr = _fixJsonStringNewlines(_slice.slice(0, _k + 1)).replace(/,\s*([\]}])/g, '$1');
                          const _d3 = JSON.parse(_tr);
                          if (_d3 && (_d3.directAnswer || _d3.layers)) { result = _d3; console.log('[Worker] truncated JSON recovery at', _k); break; }
                        } catch(_) {}
                      }
                    }
                  }
                }
              }
            }
          }

          if (!result.closing && result.oneliner) result.closing = result.oneliner;
          if (!result.closing && result.summary) result.closing = result.summary;
          // 向後相容：reading → answer
          if (!result.answer && result.reading) {
            result.answer = result.reading;
          }
          // 向後相容：story → answer（塔羅 v17 新結構）
          if (!result.answer && result.story) {
            result.answer = result.story;
          }
          // 向後相容：如果 AI 還是回了舊的 5 欄位結構
          if (!result.answer && result.structure) {
            result.answer = [result.structure, result.event, result.timing, result.action, result.hidden].filter(Boolean).join('\n\n');
          }

          // ═══ Rate limit 寫入 ═══
          // ★ v28：免費額度全工具共用一次
          if (!isAdmin && !isPaidUser && env.RATE_KV) {
            const freeKey = `free:${today}:${userKey}`;
            await env.RATE_KV.put(freeKey, '1', { expirationTtl: 86400 });
          }

          // ★ v28：訂閱會員每日計數器 +1
          if (isSubscriber && env.RATE_KV) {
            const subUseKey = `sub_use:${today}:${userKey}`;
            const cur = parseInt(await env.RATE_KV.get(subUseKey) || '0');
            await env.RATE_KV.put(subUseKey, String(cur + 1), { expirationTtl: 86400 });
          }

          // ★ v29：單次購買 — 用完即刪，一次性
          if (paidTradeNo && env.RATE_KV) {
            try {
              const singleFlag = await env.RATE_KV.get(`single_use:${paidTradeNo}`);
              if (singleFlag) {
                await env.RATE_KV.delete(`paid_token:${paidTradeNo}`);
                await env.RATE_KV.delete(`single_use:${paidTradeNo}`);
              }
            } catch(_sd) { console.warn('single_use cleanup error:', _sd); }
          }

          const _resultMode = isFullFollowUpMode ? 'full_followup' : (isOotk ? 'ootk' : (isTarotOnly ? 'tarot_only' : 'full'));
          const totalUsage = isAdmin ? {
            input_tokens: aiResult?.usage?.input_tokens || 0,
            output_tokens: aiResult?.usage?.output_tokens || 0,
            model: 'haiku',
            mode: _resultMode,
            autoPassPlan,
          } : undefined;

          // ★ v22 核彈：送出前最後檢查——如果 result 仍是 { answer: rawJSON }，強制修復
          if (result && !result.directAnswer && !result.layers && typeof result.answer === 'string' && result.answer.includes('"directAnswer"')) {
            try {
              // 核彈手段：把所有換行/tab 替成空格，犧牲格式但保證 parse
              const _nuke = result.answer.replace(/[\x00-\x1F]+/g, ' ').replace(/\s{2,}/g, ' ');
              const _nuked = JSON.parse(_nuke);
              if (_nuked && (_nuked.directAnswer || _nuked.layers)) {
                result = _nuked;
                console.log('[Worker] NUCLEAR JSON recovery succeeded');
              }
            } catch(_ne) {
              console.warn('[Worker] nuclear recovery also failed, sending raw');
            }
          }

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
