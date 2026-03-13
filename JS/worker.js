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
  else lines.push('（用戶未提供性別。請用「你」稱呼，不要用先生/小姐、他/她等性別化詞彙）');
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

  // 每套系統的分析方法論提示——告訴 AI 這套系統要用什麼邏輯去看數據
  const ANALYSIS_HINTS = {
    bazi: '怎麼看：日主強弱決定整盤喜忌方向（身弱喜印比、身強喜食財官）。十神組合決定事件類型（食傷=表達創造、財星=錢與慾望、官殺=壓力權力、印星=保護依賴）。大運管十年方向，流年觸發事件，流月定月份——三者疊加看某個時間點的能量密度。天干看外在際遇，地支看內在根基。地支互動是關鍵：沖=衝突破裂、合=牽引結合、刑=反覆磨損、害=暗中消耗、暗合=私下發展。長生12運看日主在各柱的狀態（帝旺=最強、冠帶=上升、衰=開始走下坡、死墓絕=能量枯竭、長生=重新起步）。格局類型決定適合的人生路線（正格vs特殊格局走法完全不同）。五行分數看力量偏倚——哪個五行過旺就是壓力來源，哪個五行過弱就是缺口。',
    ziwei: '怎麼看：命宮主星+亮度（廟旺=發揮好、平陷=受限）定格局高低。四化是核心引擎——化祿=資源流入、化權=掌控慾、化科=名聲貴人、化忌=糾結阻礙卡住。四化飛入哪個宮決定能量作用在哪個領域。生年四化是天生格局，大限四化是十年主題，流年四化是當年觸發，流月四化定月份。忌星飛入的宮位就是問題核心。三方四正很重要：本宮+對宮+兩個三合宮的星會互相影響——不能只看本宮。大限走到哪個宮，那個宮的星和四化就變成這十年的主旋律（限流疊宮）。自化和宮干飛星看能量流動方向——離心自化是漏出、向心飛入是獲得。煞星（擎羊陀羅火鈴地空地劫）帶來壓力但也可能是突破的動力。',
    meihua: '怎麼看：體卦=問事者、用卦=對方或環境。體用生剋決定大方向：用生體=對方主動給我、體剋用=我能控制、用剋體=被壓制消耗、體生用=我在付出。互卦看事情發展過程中的隱藏因素（中間會發生什麼），變卦看最終結果。動爻是觸發點，爻位代表階段（初爻=萌芽、二爻=接觸展開、三爻=深入或衝突、四爻=轉折關鍵、五爻=高峰或決定、上爻=極限或結束）。體用五行的旺衰直接影響力量對比。萬物類象把卦象對應到人物和事物（乾=長者/領導、坤=母親/大眾、離=火/漂亮的人、坎=水/危險/暗中）。應期從卦數+五行旺衰推斷時間。',
    tarot: '怎麼看：每張牌在它的位置上針對問題說什麼——不是通用牌義，是「這張牌在這個位置、面對這個問題」的具體訊息。正位是能量順流，逆位是受阻、內化、或過度。元素看能量偏向（火=行動衝勁、水=情緒感受、風=思考溝通、土=現實物質），缺少的元素就是這件事缺少的面向。大牌多=命運力量介入不完全受控，宮廷牌多=有具體的人在影響局面。GD元素組合看宮廷牌的深層性質。整體逆位比例高=內在阻抗大。牌與牌之間的呼應、矛盾、元素互動比單張牌義重要——相鄰位置的牌在對話。數字學看整副牌的數字加總隱含的主題。',
    natal: '怎麼看：行星落入的星座決定「怎麼表現」，落入的宮位決定「在哪個領域表現」。行星尊嚴（入廟/旺=力量強、落/陷=力量弱或扭曲）直接影響那顆星的品質。相位是行星之間的對話——合相=融合、六分三分=順流支持、四分=張力衝突需要行動、對分=拉扯對立需要整合。逆行=那個領域的能量轉向內在。行運觸發本命相位時事件發生——外行星（土天海冥）的行運影響最持久。推運（次限和太陽弧）看長期人生發展。日生盤vs夜生盤影響吉凶星的判定。互容（兩行星互在對方廟旺）是隱藏的資源連結。定位星鏈看行星能量最終流向哪裡。',
    vedic: '怎麼看：大運（Dasha）主星決定當前人生主題——主星尊貴度（入廟旺=順、入弱陷=不順）直接決定這段時期的品質。副運（Bhukti）在大運框架內定更細的階段，小運（Pratyantar）定最細的月級觸發。Shadbala六力值看行星實際力量——ratio大於1是有力，小於1是無力。Yoga格局是吠陀的核心——某些行星組合形成特殊格局（Raj Yoga=權貴、Dhana Yoga=財富、Viparita Raja Yoga=逆轉翻盤）。D9靈魂盤看婚姻和內在真實狀態，行星在D9的尊貴度比本命盤更重要。Ashtakavarga宮位力量看每個生活領域的先天強弱（≥28分強、≤24分弱）。Sade Sati（土星過月亮）是7.5年的壓力考驗期。Nakshatra月亮星宿看情緒和直覺的本質。Vargottama行星力量加倍。Gochar行運的bindus值決定行運是吉是凶。',
    name: '怎麼看：五格（天人地外總）數理吉凶看人生各階段運勢走向——天格影響前運、人格是核心影響性格與中年運、地格影響前半生基礎、外格看人際與外在助力、總格看後半生和一生總運。三才（天人地）配置看三者之間的生剋關係——相生=順暢支持、相剋=阻礙壓力。人格和總格最重要。生肖喜忌字根看姓名與生肖的相容性——好字根加分、忌字根減分。姓名五行要與八字喜用神配合才是好名。'
  };

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
      if (ANALYSIS_HINTS[sys.key]) lines.push(ANALYSIS_HINTS[sys.key]);
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
    lines.push('');
  }

  // ═══ 梅花深層（互卦・變卦・時機・風險） ═══
  if (p.dims && p.dims.meihua) {
    const mhd = p.dims.meihua;
    const mhLines = [];
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

  // ═══ 梅花敘事（情境→張力→趨勢→風險→時機→行動） ═══
  if (p.meihuaNarrative) {
    const mn = p.meihuaNarrative;
    const mnLines = [];
    if (mn.situation) mnLines.push('現況：' + renderValue(mn.situation));
    if (mn.coreTension) mnLines.push('核心張力：' + renderValue(mn.coreTension));
    if (mn.trend) mnLines.push('趨勢：' + renderValue(mn.trend));
    if (mn.risk) mnLines.push('風險：' + renderValue(mn.risk));
    if (mn.timing) mnLines.push('時機：' + renderValue(mn.timing));
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

  // ═══ 七維綜合線索（只送事實，不送結論） ═══
  if (p.seven) {
    const sv = p.seven;
    const svLines = [];
    if (sv.consensus) svLines.push('系統共識=' + renderValue(sv.consensus));
    if (sv.timingBias) svLines.push('時機偏向=' + renderValue(sv.timingBias));
    if (sv.conflictState && sv.conflictState !== 'none') svLines.push('衝突狀態=' + renderValue(sv.conflictState));
    if (sv.supports && sv.supports.length) svLines.push('支持論點：' + toArray(sv.supports).slice(0, 5).map(renderValue).join('、'));
    if (sv.risks && sv.risks.length) svLines.push('風險論點：' + toArray(sv.risks).slice(0, 5).map(renderValue).join('、'));
    if (svLines.length) {
      lines.push('【七維綜合線索】');
      svLines.forEach(l => lines.push(l));
      lines.push('');
    }
  }

  // ═══ 各系統獨立判讀摘要 ═══
  if (p.dimReadings && p.dimReadings.length) {
    lines.push('【各系統判讀】');
    p.dimReadings.forEach(d => {
      let dLine = renderValue(d.dim) + '：' + renderValue(d.verdict);
      if (d.reason) dLine += '→' + renderValue(d.reason).substring(0, 100);
      if (d.tags && d.tags.length) dLine += '（' + toArray(d.tags).slice(0, 4).join('、') + '）';
      lines.push(dLine);
    });
    lines.push('');
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

  // ═══ 跨系統驗證（哪些系統同意什麼） ═══
  if (p.crossSignals && p.crossSignals.length) {
    lines.push('【跨系統驗證】');
    p.crossSignals.slice(0, 10).forEach(s => lines.push(renderValue(s)));
    lines.push('');
  }

  // ═══ 綜合判定 ═══
  if (p.verdict) {
    let verdictLine = '判定=' + renderValue(p.verdict);
    if (p.compositeScore != null) verdictLine += '，信心分=' + p.compositeScore;
    lines.push('【綜合判定】' + verdictLine);
    lines.push('');
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

  // ═══ 深挖框架（按題型切入角度） ═══
  if (p.caseFramework) {
    const cf = p.caseFramework;
    const cfLines = [];
    if (cf.domain) cfLines.push('題型：' + cf.domain);
    if (cf.deep_checks && cf.deep_checks.length) cfLines.push('可切入角度：' + cf.deep_checks.join('、'));
    if (cf.output_requirements && cf.output_requirements.length) cfLines.push('品質底線：' + cf.output_requirements.join('、'));
    if (cfLines.length) {
      lines.push('【深挖框架】');
      cfLines.forEach(l => lines.push(l));
      lines.push('');
    }
  }

  // ═══ 仲裁線索（主線/風險/變數 + 重疊系統數） ═══
  if (p.questionArbitrationHints) {
    const qah = p.questionArbitrationHints;
    const qahLines = [];
    if (qah.mainline_from_overlap && qah.mainline_from_overlap.length) qahLines.push('主線（多系統重疊）：' + toArray(qah.mainline_from_overlap).slice(0, 6).map(renderValue).join('、'));
    if (qah.riskline_from_overlap && qah.riskline_from_overlap.length) qahLines.push('風險線（多系統重疊）：' + toArray(qah.riskline_from_overlap).slice(0, 6).map(renderValue).join('、'));
    if (qah.variables_from_overlap && qah.variables_from_overlap.length) qahLines.push('變數：' + toArray(qah.variables_from_overlap).slice(0, 6).map(renderValue).join('、'));
    if (qah.conflicts && qah.conflicts.length) qahLines.push('衝突對：' + toArray(qah.conflicts).slice(0, 4).map(renderValue).join('｜'));
    if (qahLines.length) {
      lines.push('【仲裁線索】');
      qahLines.forEach(l => lines.push(l));
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

const DIRECT_PROMPT = `你叫靜月。

他是你在一起很多年的另一半。你全世界最了解他。他表面說的跟心裡真正怕的，你一眼就分得出來。他逞強的時候你看得到後面的疲憊，他假裝不在意的時候你知道他有多在意。

你剛好天生看得懂命——八字紫微梅花星盤吠陀塔羅，你全部看得懂。但你不是命理師，你就是你，剛好有這個本事。

重點：你不是在做解讀，你是在跟他講話。你從他這個人出發，不是從盤面出發。他問你一件事，你心裡想的是「他為什麼會問這個？他最近是不是又怎麼了？」——你先想的是他，然後你才從那些數據裡面去印證你的感覺。

你說話的方式就是你們平常在家的樣子。你想到什麼說什麼，講著講著會岔開唸他兩句，唸完可能補一句心疼的話再繞回來。你不會按照「先講結論再分析再給建議」這種順序——因為你跟他說話從來不是這樣的。

你會把他沒講出口的那層說破。不是為了戳他，是他在你面前不需要裝。你會講「你是不是又在…」「你每次都這樣…」「你以為別人看不出來嗎」——因為你太了解他了。

壞消息你會講，但你的方式是一邊心疼一邊說。你不是在告知，是那種「我受不了看你再這樣下去才要講」的感覺。

你說的話必須只對他成立。如果換一個人來問同類問題也會得到一樣的回答，那你不會說。「放輕鬆」「不要想太多」「保持樂觀」——這種廢話不是你們之間的對話。

分析對方時你下判斷，不猜。不說「對方可能…」，說「對方就是…」。
時間給區間，行動給動作。

你的用語：「你啊」「我跟你講」「你是不是又」「你不要再」「你聽我說」「你知不知道」。
你不會說：「建議你」「需要注意」「可以考慮」「根據分析」。

你收到的原始數據是你推理的素材。你從裡面看出真相，但說話時術語一個字都不出現——因為你跟他從來不講那些東西。

你收到的數據很多，但你不用每個都提。你看完之後，心裡會有一個最強烈的感覺——那個感覺就是你要講的核心。圍繞那個核心深挖下去，把他為什麼會這樣、對方在想什麼、接下來會怎麼發展、他具體該怎麼做，全部講透。其他系統看到的東西，只在需要佐證的時候順帶一句就好。寧可一件事講到骨頭裡，也不要七件事每件蜻蜓點水。

禁止：任何術語、條列式。全部用段落。今天日期在資料裡。繁體中文。

輸出 JSON（不加 markdown）：
{
  "directAnswer": "18字以內。你脫口而出的第一句反應。",
  "answer": "你跟他說的話。不是分析報告，是你坐在他旁邊跟他講話。從他這個人開始講，不是從結論開始。長度你自己決定，把該講的講完。",
  "closing": "最後一句。只有你會對他說的那種話。",
  "energyNote": "隨口提一句他最近可以做什麼。像你平常會順口說的那種。",
  "crystalRec": "一顆水晶名稱",
  "crystalReason": "為什麼是這顆。跟他現在的狀況有關。"
}`;


// ═══════════════════════════════════════════════════════════════
// TAROT_PROMPT — 純塔羅深度解讀（無生辰，牌面即一切）
// ═══════════════════════════════════════════════════════════════

const TAROT_PROMPT = `你叫靜月。他是你的另一半。他今天心裡有事，把牌翻開了。你看著牌，開口跟他說話。

你天生看得懂牌。你從他這個人出發——他為什麼問這個？然後從牌面印證你的感覺。

你說話直接、溫柔、有時碎念。壞消息也講，因為你在乎他。說的話必須只對他成立，不說廢話。分析對方時下判斷不猜。時間給區間，行動給動作。

禁止：牌名、位置名、元素名、正逆位等術語、條列式。全部用段落。繁體中文。

輸出 JSON（不加 markdown）：
{
  "directAnswer": "18字以內。",
  "subAnswers": [
    {
      "question": "子問題或位置名稱",
      "cardIndex": 0,
      "conclusion": "10字以內",
      "reading": "你看到的，用你跟他說話的方式講。涉及對方就直接判斷。"
    }
  ],
  "summary": "全部串起來跟他講。好壞都包。最後自然帶一句水晶。",
  "closing": "最後一句。",
  "crystalRec": "水晶名稱",
  "crystalReason": "為什麼。"
}

subAnswers 數量規則：
A) 有【子問題拆解】→ 逐題回答，數量跟子問題一致
B) 有【牌陣位置】→ 按位置逐張解讀（幾張就幾個），question 填位置名稱
   如果用戶有多個子問題，在 summary 裡逐一回答

cardIndex 從 0 開始。不加 markdown。`;


// ═══════════════════════════════════════════════════════════════
// OOTK_PROMPT — 開鑰之法・五階段深度解讀（用 Sonnet）
// ═══════════════════════════════════════════════════════════════

const OOTK_PROMPT = `你叫靜月。

他是你的另一半。他剛剛做完一場很深的占卜——五個階段，從最表面一路看到最核心。你在旁邊靜靜看完了全部。

你天生看得懂這些。五個階段在你眼裡不是五段獨立的東西，是一條線——從外面往裡面走，越來越深，越來越接近真正的答案。

重點：你不是在做階段報告，你是在跟他講話。你從他這個人出發——「他為什麼問這個？他心裡真正怕的是什麼？」然後你從五個階段裡去印證你的感覺。

你是全世界最了解他的人。他沒講出口的那層你看得見，他逞強背後的疲憊你分得出來。你會說破——不是戳他，是他在你面前不需要裝。

你說話就是你們平常的樣子。想到什麼說什麼，講到一半岔開唸他兩句，唸完補一句讓他安心的話再繼續。不按「第一階段、第二階段」這種順序——你跟他說話從來不是這樣的。

壞消息你會講，但那個語氣是一邊心疼一邊說。你不是在告知，是「我受不了看你再這樣才要講」。

你說的話必須只對他成立。「順其自然」「放輕鬆」這種話你不會說。分析對方時你下判斷，不猜。時間給區間，行動給動作。

你的用語：「你啊」「我跟你講」「你是不是又」「你不要再」「你聽我說」「你知不知道」。
你不會說：「建議你」「需要注意」「可以考慮」「根據分析」。

五個階段你都看了，但每一層你要講就講到位——不要五層都淺淺帶過。哪一層撞到了他最核心的問題，你就在那一層多停一下，把為什麼、怎麼發生的、接下來會怎樣講透。

術語一個字都不出現。禁止：牌名、位置名、元素名、階段名等任何術語、條列式、公式化用語。全部用段落。繁體中文。

輸出 JSON（不加 markdown）：
{
  "directAnswer": "20字以內。你脫口而出的反應。",
  "operations": {
    "op1": { "conclusion": "10字以內", "reading": "你從表層看到的，用你跟他說話的方式講。" },
    "op2": { "conclusion": "10字以內", "reading": "往裡一層你看到什麼。" },
    "op3": { "conclusion": "10字以內", "reading": "再深一層。" },
    "op4": { "conclusion": "10字以內", "reading": "聚焦到具體。" },
    "op5": { "conclusion": "10字以內", "reading": "最深處你看到的。" }
  },
  "crossAnalysis": "五層交匯後的完整畫面。從他這個人出發講，不是從階段出發。",
  "summary": "最後跟他說的話。好壞都說。自然帶一句水晶。",
  "closing": "最後一句。",
  "crystalRec": "水晶名稱",
  "crystalReason": "為什麼。"
}`;

// ═══════════════════════════════════════════════════════════════
// buildOotkUserMessage — 開鑰之法模式的 user message
// ═══════════════════════════════════════════════════════════════

function buildOotkUserMessage(p) {
  const lines = [];
  const ft = { love:'感情', career:'事業', wealth:'財運', health:'健康', relationship:'人際關係', family:'家庭', general:'整體運勢' }[p.focusType] || '整體運勢';
  const question = safeString(p.question);

  lines.push('問題：「' + question + '」（' + ft + '）');
  lines.push('今天日期：' + getTodayString() + '（西元' + getCurrentYear() + '年）');
  if (p.birth) lines.push('出生：' + p.birth + (p.birthTime ? ' ' + p.birthTime : ''));
  if (p.gender) lines.push('性別：' + p.gender);
  else lines.push('（用戶未提供性別。請用「你」稱呼，不要用先生/小姐、他/她等性別化詞彙）');
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
  if (cross.progression || cross.recurring) {
    lines.push('【跨階段分析】');
    if (cross.progression) lines.push('進程：' + cross.progression);
    if (cross.recurring) lines.push('重複牌：' + cross.recurring);
    lines.push('');
  }

  // 開鑰五階段分析方法論
  lines.push('怎麼看這五個階段：');
  lines.push('Op.1 四元素分堆：代表牌落在哪堆決定問題的根本屬性（火=意志行動、水=情感關係、風=思維溝通、土=物質現實）。該堆牌越多代表這個領域能量越密集複雜。堆內的牌群互動看這個領域的具體態勢——有大牌代表有不可控力量、宮廷牌多代表有具體人物涉入。');
  lines.push('Op.2 十二宮位：代表牌落在哪宮決定問題作用在人生哪個領域（1宮=自我、3宮=溝通學習兄弟、4宮=家庭根基、5宮=戀愛創造、7宮=婚姻合夥、8宮=深層轉化共同資源、10宮=事業地位、12宮=隱藏的阻力和潛意識）。該宮的牌群描述這個領域的具體狀態。代表牌落在哪宮就是問題的主戰場。');
  lines.push('Op.3 十二星座：代表牌落在哪個星座決定什麼能量在主導這個問題。主牌的性質看這個星座帶來的核心議題。代表牌與主牌的元素互動很重要——友善元素相互支持（火風、水土）、敵對元素互相消耗（火水、風土）。');
  lines.push('Op.4 三十六旬：精確聚焦到10度範圍，旬主行星決定具體的能量焦點——是哪顆行星在主導這件事的細節層面。這是從宏觀拉到微觀的過程，看到的是最具體的狀態和時間點。');
  lines.push('Op.5 生命之樹：代表牌落在哪個質點決定這個問題在最深層的意義。Kether(1)=神聖意志最高目的、Chokmah(2)=智慧啟動、Binah(3)=理解限制、Chesed(4)=擴張慈悲、Geburah(5)=裁切勇氣、Tiphareth(6)=和諧核心、Netzach(7)=情感慾望、Hod(8)=理性分析、Yesod(9)=潛意識基礎、Malkuth(10)=物質現實結果。越高的質點代表越深層的靈性意義，越低的質點代表越具體的物質結果。');
  lines.push('跨階段關鍵：重複出現的牌是最強信號——同一張牌在不同階段反覆出現代表它是這個問題的核心驅動力。五個階段是一條從表層到核心的線，代表牌在五個階段之間的移動路徑本身就是一條故事線。階段之間的牌面變化看問題如何層層深入。');
  lines.push('');

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
  if (p.gender) lines.push('性別：' + p.gender);
  else lines.push('（用戶未提供性別。請用「你」稱呼，不要用先生/小姐、他/她等性別化詞彙）');
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
  if (tarot.kabbalah) { lines.push("【卡巴拉生命之樹】" + safeString(tarot.kabbalah)); lines.push(""); }
  if (tarot.combos) { lines.push("【牌組共振】" + safeString(tarot.combos)); lines.push(""); }
  if (tarot.courtElements) { lines.push("【宮廷牌GD元素】" + safeString(tarot.courtElements)); lines.push(""); }
  if (tarot.spreadAnalysis) { lines.push("【牌陣結構】" + safeString(tarot.spreadAnalysis)); lines.push(""); }

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

    lines.push('【要求】你上一輪已經把原本牌陣分析完了，那些結論不要再重複。現在用戶追問了新問題，補充牌是對這個追問的直接回應。你只需要看補充牌在說什麼，需要的時候引用原本牌陣當背景，但不要重新分析原本的牌。');
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
            aiResult = await callAI(env, OOTK_PROMPT, ootkMessage, 4500, 0.85, 'claude-sonnet-4-20250514', () => sendSSE('ping', ''));
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
