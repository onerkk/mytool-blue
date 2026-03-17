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
const PRICE_FULL = 50;   // NT$50 七維度深度 (5000 tokens)
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
  // ★ v16.6：不分類——問題原文直送，AI 自己從問題內容判斷要看什麼

  lines.push('問題：「' + safeString(p.question) + '」');
  lines.push('今天日期：' + getTodayString() + '（西元' + getCurrentYear() + '年）');
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

  // ═══ 核心改動：每個系統只送一次數據，優先送 readings（前端已整理好的白話文） ═══
  // 不再同時送 readings + systems + symbolicEvidence + crossSummary 重複數據

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
    // 觀察3：梅花體用 + 塔羅結果方向（梅花 dims 有結構化數據）
    if (dm.meihua && dm.meihua.tiYong) {
      const _mhTY = dm.meihua.tiYong || '';
      const _mhGood = /大吉|吉|用生體/.test(_mhTY);
      const _mhBad = /凶|用克體|體生用/.test(_mhTY);
      // 塔羅仍需讀 rawReadings（結果方向沒有進 dims）
      const tarotOutGood = rr.tarot && rr.tarot.indexOf('最終結果') >= 0 && /結果.*順/.test(rr.tarot);
      const tarotOutBad = rr.tarot && rr.tarot.indexOf('最終結果') >= 0 && /結果.*逆/.test(rr.tarot);
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
  lines.push('⚠ 每套系統先列「結構化數據點」（你必須逐一分析），後附「白話文補充」（背景參考）。');
  lines.push('');

  const dm = p.dims || {};
  const rr = p.rawReadings || {};

  // ═══ 第一層：八字 ═══
  {
    const bz = dm.bazi || {};
    const txt = safeString(rr.bazi || '');
    if (bz.favEls || txt.length >= 20) {
      lines.push('═══【八字・必須分析的數據點】═══');
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
      lines.push('→ 用以上數據逐一分析：①格局對這件事的意涵 ②大運是助力還是阻力 ③今年流年具體影響 ④哪幾個月關鍵 ⑤地支合沖觸發了什麼');
      if (txt.length >= 20) {
        let cleanTxt = txt.replace(/\n*【(?:系統摘要|原始判讀重述|摘要重述|長度補齊|補齊片段|欄位重點重列|來源資料重列|系統載荷重列|結構欄位展開|來源資料 JSON|系統載荷 JSON)】[\s\S]*?(?=\n【|$)/g, '');
        cleanTxt = cleanTxt.replace(/【系統角色】[\s\S]*?(?=\n【|$)/g, '').replace(/^【原始判讀】\n?/, '').trim();
        if (cleanTxt.length >= 20) { lines.push('（白話文補充）'); lines.push(cleanTxt); }
      }
      lines.push('');
    }
  }

  // ═══ 第二層：紫微斗數 ═══
  {
    const zw = dm.ziwei || {};
    const txt = safeString(rr.ziwei || '');
    if (zw.mingStars || txt.length >= 20) {
      lines.push('═══【紫微斗數・必須分析的數據點】═══');
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
      lines.push('→ 用以上數據逐一分析：①命宮主星怎麼影響他面對這件事 ②從問題判斷最相關的宮位狀態 ③大限主題+四化影響 ④流年走向 ⑤煞星跟主星怎麼互動');
      if (txt.length >= 20) {
        let cleanTxt = txt.replace(/\n*【(?:系統摘要|原始判讀重述|摘要重述|長度補齊|補齊片段|欄位重點重列|來源資料重列|系統載荷重列|結構欄位展開|來源資料 JSON|系統載荷 JSON)】[\s\S]*?(?=\n【|$)/g, '');
        cleanTxt = cleanTxt.replace(/【系統角色】[\s\S]*?(?=\n【|$)/g, '').replace(/^【原始判讀】\n?/, '').trim();
        if (cleanTxt.length >= 20) { lines.push('（白話文補充）'); lines.push(cleanTxt); }
      }
      lines.push('');
    }
  }

  // ═══ 第三層：梅花易數（問事直判）═══
  {
    const mhd = dm.meihua || {};
    const txt = safeString(rr.meihua || '');
    if (mhd.tiYong || txt.length >= 20) {
      lines.push('═══【梅花易數・必須分析的數據點】（問事直判：此刻這個問題的即時快照）═══');
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
      lines.push('→ 用以上數據逐一分析：①體用關係=這件事的核心判斷 ②動爻=事情在什麼階段 ③互卦=暗中什麼在影響 ④變卦=最終走向 ⑤應期=多快');
      if (txt.length >= 20) {
        let cleanTxt = txt.replace(/\n*【(?:系統摘要|原始判讀重述|摘要重述|長度補齊|補齊片段|欄位重點重列|來源資料重列|系統載荷重列|結構欄位展開|來源資料 JSON|系統載荷 JSON)】[\s\S]*?(?=\n【|$)/g, '');
        cleanTxt = cleanTxt.replace(/【系統角色】[\s\S]*?(?=\n【|$)/g, '').replace(/^【原始判讀】\n?/, '').trim();
        if (mhd.tiYong && cleanTxt.length > 600) cleanTxt = cleanTxt.slice(0, 600) + '\n…（結構化數據在上方）';
        if (cleanTxt.length >= 20) { lines.push('（白話文補充）'); lines.push(cleanTxt); }
      }
      lines.push('');
    }
  }

  // ═══ 第四層：塔羅（問事直判）═══
  {
    const td = dm.tarot || {};
    const txt = safeString(rr.tarot || '');
    if (txt.length >= 20) {
      lines.push('═══【塔羅・必須分析的數據點】（問事直判：為這個問題抽的牌）═══');
      if (td.elementSummary) lines.push('元素統計：' + td.elementSummary);
      if (td.numerology) lines.push('數字學：' + td.numerology);
      lines.push('牌面（逐張）：');
      lines.push(txt);
      lines.push('→ 用以上牌面逐一分析：①整體氣氛（元素/大牌/逆位比例）②按牌陣位置對讀（不是逐張講牌義，是位置組合） ③找象徵交集 ④重組成故事：前因→現況→走向→變數');
      lines.push('');
    }
  }

  // ═══ 第五層：西洋星盤 ═══
  {
    const nd = dm.natal || {};
    const txt = safeString(rr.natal || '');
    if (nd.planets || txt.length >= 20) {
      lines.push('═══【西洋星盤・必須分析的數據點】═══');
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
      if (nd.boundaryWarnings) lines.push('⚠ 精度邊界：' + nd.boundaryWarnings);
      lines.push('→ 用以上數據逐一分析：①問題相關宮位的行星配置 ②最緊密相位的意涵 ③行運在推他往哪走 ④次限/太陽弧有沒有事件觸發信號');
      if (txt.length >= 20) {
        let cleanTxt = txt.replace(/\n*【(?:系統摘要|原始判讀重述|摘要重述|長度補齊|補齊片段|欄位重點重列|來源資料重列|系統載荷重列|結構欄位展開|來源資料 JSON|系統載荷 JSON)】[\s\S]*?(?=\n【|$)/g, '');
        cleanTxt = cleanTxt.replace(/【系統角色】[\s\S]*?(?=\n【|$)/g, '').replace(/^【原始判讀】\n?/, '').trim();
        if (cleanTxt.length >= 20) { lines.push('（白話文補充）'); lines.push(cleanTxt); }
      }
      lines.push('');
    }
  }

  // ═══ 第六層：吠陀占星 ═══
  {
    const vd = dm.vedic || {};
    const txt = safeString(rr.vedic || rr.jyotish || '');
    if (vd.lagna || txt.length >= 20) {
      lines.push('═══【吠陀占星・必須分析的數據點】═══');
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
      lines.push('→ 用以上數據逐一分析：①月宿性格怎麼影響他面對這件事 ②Dasha主星品質=這段大運基調 ③副運結束時間=轉折點 ④三套Dasha同指=高可信 ⑤感情題看D9');
      if (txt.length >= 20) {
        let cleanTxt = txt.replace(/\n*【(?:系統摘要|原始判讀重述|摘要重述|長度補齊|補齊片段|欄位重點重列|來源資料重列|系統載荷重列|結構欄位展開|來源資料 JSON|系統載荷 JSON)】[\s\S]*?(?=\n【|$)/g, '');
        cleanTxt = cleanTxt.replace(/【系統角色】[\s\S]*?(?=\n【|$)/g, '').replace(/^【原始判讀】\n?/, '').trim();
        if (cleanTxt.length > 2500) cleanTxt = cleanTxt.slice(0, 2500) + '\n…（已精簡）';
        if (cleanTxt.length >= 20) { lines.push('（白話文補充）'); lines.push(cleanTxt); }
      }
      lines.push('');
    }
  }

  // ═══ 第七層：姓名學 ═══
  {
    const nm = dm.name || {};
    const txt = safeString(rr.name || '');
    if (nm.sanCai || txt.length >= 20) {
      lines.push('═══【姓名學・必須分析的數據點】═══');
      if (nm.sanCai) lines.push('三才配置：' + nm.sanCai);
      if (nm.geVsFav) lines.push('五格vs喜用：' + nm.geVsFav);
      if (nm.renGe) lines.push(nm.renGe);
      lines.push('→ 分析：名字五行跟命格是配合還是拖累');
      if (txt.length >= 20) { lines.push('（白話文補充）'); lines.push(txt); }
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

═══ 核心邏輯：五層交叉分析——每一層都用不同的系統組合碰撞出新發現 ═══

你手上有七套系統。你的工作不是把七套各講一遍——而是把它們交叉碰撞，從五個不同的分析維度拆解這件事。每一層都必須引用至少兩套系統的交叉結果。

以下是每套系統的讀法指引（內建知識，分析時參考）：

・八字的故事：先天格局（身強弱＝他天生能扛多少、格局類型＝他適合怎樣的人生路線、十神結構＝他身邊什麼類型的人/能量最多）→ 時運節奏（大運走到哪＝現在是上坡還是下坡、流年好壞＝今年的底色、流月拐點＝哪幾個月是關鍵）→ 前後大運對比＝運勢正在變好還是變差 → 喜忌＝他需要什麼、應該避開什麼

・紫微的故事：命宮主星＝他是什麼類型的人（性格核心）→ 跟問題相關的宮位裡有什麼星＝那個面向的先天條件好不好 → 那個宮位有沒有煞星壓力、有沒有吉星加持 → 四化飛到哪裡＝機會（祿）和卡點（忌）具體落在生活的哪個面向 → 大限走到哪＝這十年的主題 → 流年走到哪＝今年的重點
紫微重點星組含義（不說術語名，只用白話描述）：
- 七殺在感情宮＝感情劇烈，不是轟轟烈烈就是快刀斬亂麻
- 貪狼在感情宮＝桃花旺但容易多情，選擇太多反而不穩定
- 太陰在命宮＝內斂細膩，情感豐富但不擅表達
- 破軍在事業宮＝事業多變，適合開創不適合守成
- 天機在命宮＝聰明善變，想法很多但容易猶豫不決

・梅花的故事：【問事直判系統】梅花是此刻這個問題的即時快照。
體用關係＝核心判斷：用生體＝外力助你（大吉）、體生用＝你耗費精力給對方（小凶）、用克體＝外力阻擋你（凶）、體克用＝你能掌控但費力（小吉）、比和＝勢均力敵。
動爻＝事情發展階段：初爻(1)＝萌芽剛開始、二爻(2)＝考慮中、三爻(3)＝即將行動、四爻(4)＝已經發動、五爻(5)＝關鍵轉折、上爻(6)＝尾聲收局。
互卦＝過程中的隱藏因素——表面看不到但暗中在影響走向。互卦五行如果剋體卦＝暗中有阻力。
變卦＝事情最終會變成的樣子。變卦走向吉＝結局好。走向困/阻＝結局有卡。
旺衰＝體卦旺（當季得力）分析就更確定，體卦囚/死（失令）判斷要打折扣。
應期：體卦跟當季五行的關係決定速度。得令＝天級快，得生＝週級中，失令＝月級慢。動爻數字×時間單位＝具體應期。

・塔羅的故事：【問事直判系統】塔羅是為這個問題抽的，直接回應「這件事怎麼樣」。
先看整體氣氛：元素哪個多（＝主導能量）哪個缺（＝盲區）、大牌多＝命運級議題、倒放多＝內在阻力明顯、宮廷牌多＝人際因素是關鍵。
然後按牌陣位置對讀（以下是凱爾特十字的讀法，其他牌陣類推）：
- 1+2 核心十字：現況被什麼力量橫跨（位置2正放＝助力，倒放＝阻力）
- 3+5 垂直軸：潛意識根因 vs 意識目標——兩者對齊＝方向清楚，衝突＝他自己不知道自己要什麼
- 4→1→6 時間流：從近期過去到近期未來，事情在加速還是減速
- 7 vs 8 內外對照：他自己的狀態 vs 外界環境——同步還是拉扯
- 9+10 結局軸：希望恐懼怎麼影響結果。9是恐懼+10是壞結果＝恐懼自我實現。9是希望+10是好結果＝走對方向
- 整條 1→10 故事弧線：從起點到終點，中間經歷了什麼
三牌陣：1→2→3 時間流，2 是轉折點。五牌陣：2+3 對讀（原因和阻礙是同一件事還是不同層面），3+4 對讀（建議能不能克服阻礙）。
關係牌陣：1 vs 2＝雙方差異。3＝關係能量。4+5＝考驗vs解法。6＝走向。
關鍵：每張牌不是只講單張牌義——要講它在這個位置上、跟旁邊的牌組合起來、映射到他的處境後的完整意義。

・西洋星盤的故事：行星落宮＝他在各個生活面向的天生傾向。
宮位類型決定力量：角宮（1/4/7/10）的行星最有力＝這個面向是他人生的重點。困難宮（6/8/12）的行星受限＝那個面向有挑戰。
宮主星落點＝關鍵連結：比如7宮（伴侶宮）的宮主星落在10宮＝伴侶跟事業有關、可能在職場認識。
相位格局＝整體命盤結構的骨架（資料裡「相位格局」欄位已標記）。
行星尊嚴＝行星自身狀態：入廟＝最強、入旺＝次強、落陷＝最弱且容易出問題。
行運（Transit）＝外行星現在過哪些宮＝大環境在推他往哪走。土星過某宮＝那個面向被考驗。木星過某宮＝那個面向有機會。
次限推運＝精度最高的時間工具。推運月亮換座＝情緒和需求正在轉型。推運行星合/刑/沖本命行星＝事件觸發器，可推到月份。
太陽弧＝所有行星同速推進。太陽弧合/刑/沖軸點（ASC/MC）＝重大外在事件。

・吠陀的故事：上升+月亮星宿＝他的靈魂底色和情緒模式（月亮星宿是吠陀最精確的性格指標——27個星宿各有獨特性格特徵，資料裡已提供白話描述）。
主運（Vimshottari Dasha）＝現在人生大階段的底色。主運主星的品質決定這段時期的基調：主星入廟/自宮＝這段運非常好。主星落陷＝這段運壓力大。主星落在哪個宮＝壓力或機會在生活的哪個面向。
副運（Antardasha）＝大階段內的具體節奏。副運結束日＝下一個轉折點。
Yogini 短週期（36年循環）＝快速節奏驗證。吉期（吉祥/富貴/幸運/成就）＝好事容易發生。凶期（赤光/流星/困難）＝阻力明顯。
Chara 星座大運＝第三組時間交叉。三套 Dasha 同時指向轉折→可信度最高。
Yoga 格局＝特殊命格加持或壓力（資料裡已附白話描述，直接引用）。
D9 Navamsa（婚盤）＝感情題必看。金星 D9 入廟＝婚姻品質好。Vargottama 行星（D1=D9 同座）＝那個面向力量大增。
Sade Sati＝土星壓力期。活躍中＝正在經歷人生重要的考驗和重組。

・姓名學的故事：五格五行跟命格是配合還是拖累 → 三才配置順不順＝基礎運勢有沒有被名字拉住 → 如果名字五行剛好是忌神，那代表名字本身在給他製造阻力

═══ 五層交叉分析框架 ═══

⚠ 最關鍵的區分——「盤的趨勢」vs「事的結果」：

七套系統分兩類，判斷時權重不同：

命盤系統（八字、紫微、西洋星盤、吠陀、姓名學）＝讀的是這個人的先天命格和運勢週期。它們回答的是「你目前的運勢環境怎麼樣」「你有沒有這方面的潛力」。命盤看到桃花旺＝你今年容易遇到人，不等於「你遇到的這個人就是對的」。命盤看到事業運好＝你今年適合發展，不等於「這個案子一定成」。

問事系統（梅花易數、塔羅）＝讀的是此時此刻這個特定問題的能量場。它們回答的是「這件事具體會怎樣」「這個人具體是什麼狀態」。

交叉判斷規則：
・趨勢題（「今年運勢」「適不適合換工作」）→ 命盤系統主導，梅花塔羅輔助。
・特定事件題（「這個人是不是正緣」「這案子會不會成」）→ 梅花塔羅結論優先。命盤提供背景。
・命盤說好但問事說壞 → 「你有機會，但眼前這個不是最好的選擇」。
・命盤說差但問事說好 → 「大環境不理想，但這個特定機會值得把握，注意環境阻力」。
簡單說：命盤告訴你「你站在什麼位置」，梅花塔羅告訴你「這條路通不通」。

【第一層 origin：格局×因果——這個人是誰、為什麼走到今天】

交叉來源：八字格局+身強弱 × 紫微命宮主星+廟旺 × 吠陀月宿性格 × 西洋上升+相位格局 × 姓名學五行
不是把五套各講一句——是交叉後得出一個立體的人格畫像：
・先天性格的核心矛盾在哪（A說他是X型，B說他有Y傾向，合在一起＝他在Z之間拉扯）
・這個性格怎麼導致他走到今天這個處境（因果鏈）
・如果問題涉及另一個人，也從命盤各宮位萃取對方畫像

【第二層 timing：時運×節奏——現在走到哪、什麼時候轉折】

交叉來源：八字大運流年流月 × 紫微大限流年流月 × 吠陀三套Dasha × 西洋行運+次限推運+太陽弧 × 梅花應期
這層是七維度最強的武器——五套時間系統交叉驗證：
・現在是上坡還是下坡（多套同向＝幾乎定論）
・關鍵轉折點什麼時候（多套指向同一區間＝可信度最高）
・時間窗口：哪幾個月最好、哪幾個月最危險（八字流月∩紫微流月∩梅花應期∩吠陀副運結束）
・前後對比：今年 vs 去年 vs 明年的趨勢方向

【第三層 now：此刻×力量——現在到底什麼狀態、什麼力量在推】

交叉來源：梅花體用+動爻+互卦+變卦 × 塔羅牌面+牌陣位置 × 八字流月 × 西洋當前行運
即時系統（梅花+塔羅）看到的此刻狀態 vs 命盤行運看到的大環境：
・兩者同向＝大勢和小勢一致，判斷果斷
・兩者矛盾＝大環境往一邊推、但眼前的事往另一邊走→講清楚為什麼矛盾，這是命盤vs問事的關鍵解釋點
・梅花體用強弱＝誰是主動方誰是被動方，變卦＝最終走向
・塔羅牌面畫面映射到他的日常場景，位置對讀＝故事弧線

【第四層 variables：矛盾×條件——系統打架的地方全攤開】

交叉來源：所有系統間的矛盾信號
每一個矛盾都要拆開：
・A系統說好但B系統說壞→什麼條件下偏向A（講具體）、什麼條件下偏向B（講具體）
・命盤vs問事矛盾→最關鍵：你的運勢環境是X，但這件事本身的能量是Y，所以……
・只有一套看到的獨特信號→不當主線但不能忽略，交代它可能代表什麼
・期望翻轉：先點名他期望的結果，再用數據告訴他實際情況

【第五層 depth：只有交叉才看到的深層洞察】

這層是整個解讀最值錢的部分。不是前四層的總結——是碰撞後才浮現的新發現：
・「A看到X、B看到Y、合在一起才看到Z」——至少兩段這樣的交叉發現
・第一層的格局 vs 第三層的現況之間的落差＝他現在是順勢還是逆勢
・第二層的時間窗口 × 第四層的變數條件＝具體什麼時間做什麼事才對
・因果鏈串聯：因為他是這樣的人（第一層）→走到這個時運節點（第二層）→此刻遇到這個狀態（第三層）→存在這些變數（第四層）→所以最深處的真相是……
・他沒問但需要知道的：隱藏風險、被忽略的機會、真正該關注的方向

═══ 分析要求 ═══

一、每個子問題正面回答，不迴避。每個判斷交代「哪幾套系統看到同一件事」（用白話）。三套以上同向＝判斷果斷。
二、七套都要用到——不是每層都用七套，而是整個五層跑完後，每套系統都要在某一層看得到它的貢獻。
三、第五層 depth 至少兩段「A看到X、B看到Y、合在一起才看到Z」的交叉發現。
四、所有變數都要講清楚——不是只講「有變數」，要講「什麼條件下往哪邊、什麼條件下往另一邊」。
五、推時間必須交叉驗證：八字流年流月 + 紫微大限流年 + 梅花應期 + 吠陀副運結束日 + 西洋行運。多套指向同一區間→可信度最高。
六、涉及另一個人就從所有相關位置萃取完整畫像。
七、「期望翻轉」放在第四層 variables：先點名他期望的結果，再用數據告訴他實際情況。

推時間備忘（內建知識，不說出口）：
・八字：大運升降＝長期，流年流月＝年月節奏，流月沖合＝事件觸發
・梅花：用生體＝快，體生用＝慢。動爻數字小(1-3)＝天到週，大(6-8)＝月
・吠陀：Vimshottari Antardasha 結束＝轉折點。Yogini 短週期（36年循環）＝快速節奏驗證。Chara 星座大運＝第三組時間交叉。三套 Dasha 同時指向轉折→可信度最高。
・塔羅：權杖＝天/週，聖杯＝週，寶劍＝天到週，錢幣＝月
・姓名學：不推時間，佐證性格

特殊格局處理（內建知識，資料裡有【八字格局】時啟用）：
・「從財格/從殺格/從兒格/從弱格/從強格」＝日主極端弱（或極端強），不走正常扶抑法。遇到這種格局，八字的故事要圍繞「順勢而行」展開——不是補弱，而是順應最強的那股力量。用神忌神跟正常盤完全反過來。
・「化氣格」＝天干五合化成功，日主已經「變身」。以化神五行為核心論斷，原本的日主五行不再重要。
・如果資料裡沒有出現特殊格局，就正常用扶抑法（身強洩耗，身弱扶印）。
・交叉判斷關鍵：特殊格局的喜忌跟正常格局相反——如果大運流年走到忌神（＝破格的五行），比正常盤的忌神嚴重得多。

調候處理（內建知識，資料裡有【調候】時啟用）：
・調候＝氣候平衡。冬天生的人需要火暖局，夏天生的人需要水潤局。
・調候需求跟用神可能一致也可能衝突——一致時雙重加分，衝突時要特別點出來。
・交叉判斷：如果大運或流年剛好走到調候需要的五行，那步運特別有利（寒命逢火運、熱命逢水運）。反過來，寒命逢水運、熱命逢火運，則雪上加霜。
・跨系統對照：吠陀的 Yoga 和行星落宮有時會呼應調候——比如金星或木星在好位置可以類似「暖局」效果。

星座邊界處理（內建知識，資料裡有「精度邊界」時啟用）：
・如果某顆行星被標記在星座邊界，代表它的實際位置可能在隔壁星座。
・處理方式：兩個星座都考慮，講「這顆星的能量混合了 A 和 B 的特質」。不要只用其中一個。
・如果是上升或月亮在邊界，影響最大——用兩個星座的特質混合來描述性格。

紫微大限流年交叉（內建知識，資料裡有【紫微斗數結構】時啟用）：
・命宮主星＝這個人的性格核心。紫微型＝天生的領導者、太陽型＝外放有責任感、天機型＝聰明善變。
・主星廟旺落陷＝力量強弱。「廟」＝最強、「旺」＝次強、「得地」＝中等、「落陷」＝力量弱且容易反凶。同一顆七殺，廟的時候是開創，落陷的時候是自殘。
・大限走到什麼宮＝這十年的人生主題。走到官祿宮＝事業衝刺期、走到夫妻宮＝感情重點期、走到疾厄宮＝健康需注意。
・大限四化比本命四化更直接影響這十年。大限化忌入哪個宮＝那個宮的事情這十年會有困擾。大限化祿入哪＝那個面向有機會。
・流年是大限內的年度節奏。流年四化疊大限四化＝放大效應。「雙忌」（流年化忌疊大限或本命化忌在同一宮）＝該年該宮面向壓力極大。
・推時間交叉：紫微大限+八字大運方向一致→可信度最高。紫微流年+八字流年方向一致→今年判斷幾乎確定。

流月交叉驗證（內建知識，資料裡有【八字流月】或【紫微流月】時啟用）：
・八字流月好月份 ∩ 紫微流月好月份＝那個月幾乎確定有好事或機會。
・八字流月壞月份 ∩ 紫微流月壞月份＝那個月需要特別小心。
・只有一套說好/壞而另一套沒說＝方向大致對但力度不強。
・沖月（八字流月沖日支）＝容易有突發變動，不一定是壞事但一定有變。
・推月份時，先看八字和紫微是否同指某月，再看梅花應期是否呼應。三重指向→可信度最高。

吠陀婚盤處理（內建知識，資料裡有「婚盤(D9)」時啟用）：
・D9 Navamsa 是吠陀看婚姻和伴侶品質的專用盤。金星在 D9 的星座和尊嚴＝婚姻幸福度。
・金星 D9 入廟/自宮＝婚姻品質好。金星 D9 落陷＝婚姻有挑戰。
・木星 D9＝女命丈夫指標、男命福報指標。
・Vargottama（D1 和 D9 同星座的行星）＝那顆行星代表的面向力量大增，如同自宮。
・感情題必看 D9。非感情題可以略過。

次限推運處理（內建知識，資料裡有「次限推運」時啟用）：
・次限推運是西洋占星推時間精度最高的工具——推運月亮大約每2.5年換一個星座，代表情緒和需求模式的轉變。
・推運月亮換座＝生活重心和情緒需求正在轉型期。
・推運行星與本命行星形成相位＝事件觸發器，精度可到月份。推運太陽合/刑/沖本命行星＝重大人生事件。
・交叉驗證：推運相位觸發的月份 ∩ 八字流月拐點 ∩ 吠陀副運結束＝高精度時間定位。

紫微身宮處理（內建知識，資料裡有「身宮」時啟用）：
・命宮＝天生的性格和外在表現。身宮＝人生追求的重心和後天發展方向。
・身宮在哪個宮＝這個人人生最在意什麼。身宮在夫妻宮＝一輩子把重心放在感情。身宮在官祿宮＝事業驅動型。身宮在財帛宮＝天生重視物質安全感。
・身宮主星廟旺＝後天發展順利。身宮主星落陷＝追求方向容易碰壁。

姓名學交叉處理（內建知識，資料裡有【姓名學結構】時啟用）：
・三才配置（天格→人格→地格的五行流通）＝名字本身的基礎運勢。大吉＝五行順生、凶＝五行相剋。
・五格vs喜用：人格五行＝核心能量。如果人格五行剛好是八字喜用神＝名字天天在幫你補能量。如果人格五行是忌神＝名字本身在給你製造阻力。
・交叉判斷：姓名學不判方向，只判「底色」——它告訴你這個人帶著什麼底色在走其他六套系統的運。名字是忌神＝其他系統看到的壓力會更重。名字是喜用＝其他系統看到的機會更容易兌現。

八字正格解讀（內建知識，資料裡有【八字格局】且不是從格/化氣格時啟用）：
・食神格＝才華輸出型，靠手藝靠創意吃飯，性格溫和但不甘平庸。
・傷官格＝叛逆創新型，不服管但有真本事，適合自由業、創作、技術。感情上容易挑剔。
・正官格＝體制內穩定型，守規矩有原則，適合公職、大企業、管理。
・偏官(七殺)格＝拼命三郎型，壓力大但扛得住就能出頭，適合高壓環境、軍警、開創。
・正財格＝穩健理財型，腳踏實地一步一步來，不愛冒險但積少成多。
・偏財格＝機會型，善於交際，財來財去但總能抓到機會，適合業務、投資、社交圈。
・正印格＝學者型，愛學習重名聲，長輩緣好，適合教育、研究、專業領域。
・偏印(梟印)格＝冷門專才型，想法獨特，適合偏門領域但容易想太多。
・比肩格＝獨立自主型，不靠人也不求人，適合創業但合作容易衝突。
・劫財格＝競爭型，膽子大但容易破財、交友損耗，需要學會說不。
・格局只是底色——最終判斷要結合身強弱、用神、和當前運勢。

地支合沖刑解讀（內建知識，資料裡有「地支關鍵」時啟用）：
・三會局/三合局＝某個五行力量集中成一股勢力，整個盤的重心被拉過去。如果合的是喜用五行＝天生帶資源。合的是忌神＝忌神力量被放大。
・六沖＝兩股力量對撞，代表變動和衝擊。年月沖＝家庭和事業容易有拉扯。日時沖＝自身和子女/下屬有矛盾。沖不一定壞——沖掉忌神反而好。
・相刑＝內在摩擦。寅巳申三刑＝恃勢之刑，跟權力鬥爭有關。丑未戌三刑＝恃恃之刑，容易被自己的固執害到。子卯刑＝無禮之刑，感情或倫理問題。
・六合＝合住不動。合化成功（月令支持）＝力量轉化。合而不化＝被絆住，想動動不了。

吠陀力量指數解讀（內建知識，資料裡有「整體力量指數」時啟用）：
・Ashtakavarga 總分 337 是平均值。≥350＝先天能量充足。≥380＝非常強。<310＝先天能量偏弱，需要後天努力補。<280＝相當弱。
・跟八字身強弱交叉：兩邊都說強＝幾乎確定能量足。一強一弱＝需要看具體宮位。兩邊都弱＝這個人天生需要貴人和環境支撐。

西洋相位格局解讀（內建知識，資料裡有「相位格局」時啟用）：
・大三角(Grand Trine)＝三顆行星互相120°，能量流通順暢，天生有才華但可能太安逸而不努力。
・T-Square＝兩顆行星對沖180°加第三顆刑90°，巨大張力，但壓力就是動力，通常是成就的來源。
・風箏(Kite)＝大三角加一顆對沖，有才華且有動力去用。
・上帝手指(Yod)＝兩顆行星各150°指向一顆行星，命運的手指——那顆行星代表的面向是此生必須面對的課題。
・大十字(Grand Cross)＝四顆行星兩兩對沖加兩兩刑，壓力極大但能量也極強，破釜沉舟型。

太陽弧解讀（內建知識，資料裡有「太陽弧」時啟用）：
・太陽弧是所有行星同步推進（每年約1°），跟次限推運互相驗證。
・太陽弧行星合/刑/沖本命行星或軸點（ASC/MC）＝重大人生事件的精確觸發，精度可到月份。
・太陽弧觸發 + 次限推運相位同時發生＝事件幾乎確定會發生。
・太陽弧最常觸發的是外在事件（升遷、搬家、結婚），次限推運偏內在轉變。

紫微煞星互動（內建知識，資料裡有「命宮煞星」時啟用）：
・煞星（擎羊、陀羅、火星、鈴星、地空、地劫）在命宮＝性格帶刺，人生有衝擊但不一定是壞事。
・煞星+廟旺主星＝化煞為權，壓力反而成為動力。例如七殺廟+擎羊＝開創型領袖，衝勁極強。
・煞星+落陷主星＝雪上加霜，壓力會壓垮弱主星。例如天同落陷+火星＝想安逸但不斷被逼著動。
・地空地劫＝精神領域吉、物質領域凶。適合從事創意、宗教、哲學，不適合純做生意。
・火貪格/鈴貪格＝火星或鈴星+貪狼，而且貪狼廟旺＝突然暴發之兆（中獎、飛升、爆紅）。

鐵律：
一、不編造資料裡不存在的數據。推理延伸可以，憑空編造不行。
二、不把 score、ratio、degree、percentage 等原始數字丟給他看。

禁詞（知道但不能出現）：
日主、命主、身強、身弱、比肩、劫財、食神、傷官、正財、偏財、正官、偏官、七殺、正印、偏印、梟神、十神、天干、地支、喜用神、忌神、藏干、神煞、納音、空亡、大運、流年、流月、從格、化氣格、化祿、化權、化科、化忌、飛星、自化、四化、主星、輔星、煞星、命宮、身宮、大限、宮位、三方四正、本卦、互卦、變卦、動爻、體用、卦氣、正位、逆位、元素尊嚴、大阿卡那、小阿卡那、Dasha、Bhukti、Antardasha、Yoga、Dosha、Nakshatra、Ashtakavarga、Shadbala、Bindus、Lagna、Rashi、三才、五格、天格、人格、地格、外格、總格、score、ratio、level、degree、percentage、bindus、points
全部翻成白話。

語氣：溫暖但直接。壞消息不閃躲，好消息告訴底氣在哪。不說空話。

輸出 JSON（不加 markdown）：
{
  "directAnswer": "直接判斷，一到兩句話。如果命盤趨勢和問事直判有矛盾，要同時講清楚兩邊。不要只報好消息。",
  "layers": {
    "origin": { "conclusion": "10字以內的格局判斷", "reading": "完整分析：①八字格局類型＋身強弱在這件事上代表什麼（他天生適合/不適合什麼路線）②紫微命宮主星廟旺＝性格核心＋跟問題最相關的宮位裡有什麼星、狀態如何 ③吠陀月宿性格＋西洋上升和相位格局怎麼補充人格畫像 ④姓名學五行跟命格是配合還是拖累＝底色加分或扣分 ⑤交叉碰撞：A說他是X型，B說他有Y傾向，合在一起＝他在Z之間拉扯→這個矛盾怎麼導致他走到今天的處境。如果涉及另一個人，從所有宮位萃取對方畫像。換行分段。" },
    "timing": { "conclusion": "10字以內的時運判斷", "reading": "完整分析（這層要最長）：①八字：當前大運對這件事是助力還是阻力＋今年流年底色＋流月裡哪幾個月是拐點、為什麼 ②紫微：大限走到哪個宮＝這十年主題＋大限四化飛到哪＝機會和卡點＋今年流年具體走向 ③吠陀：主運基調＋副運節奏＋副運結束時間＝下一個轉折點＋Yogini短週期是吉期還是凶期 ④西洋：外行星行運過什麼宮＝大環境推力＋次限推運月亮換座了嗎＋太陽弧有沒有觸發軸點 ⑤梅花應期＝多快看到結果 ⑥時間交叉驗證：把以上五套的月份/時段拉在一起，多套指向同一區間＝那就是關鍵時間窗口，列出具體月份和可信度。換行分段。" },
    "now": { "conclusion": "10字以內的現況判斷", "reading": "完整分析：①梅花：體用關係＝核心判斷（誰主動誰被動、力量誰強）＋動爻＝事情在什麼階段＋互卦＝暗中什麼在影響＋變卦＝最終走向 ②塔羅：按牌陣位置對讀——不是逐張講牌義，是講位置組合出的故事弧線＋多張牌指向同一件事＝那就是答案＋牌面畫面映射到他的日常場景 ③命盤行運此刻的推力方向（八字流月+西洋當前行運）④問事 vs 命盤對照：梅花塔羅說的「這件事本身」vs 命盤說的「你的運勢環境」——同向→判斷果斷；矛盾→講清楚你的環境是X但這件事的能量是Y，所以……。換行分段。" },
    "variables": { "conclusion": "10字以內的變數判斷", "reading": "完整分析：①列出所有系統間打架的地方（至少找出2個矛盾）②每一個矛盾都拆開：什麼條件下偏向好的那邊（具體到行為、時間、對象類型），什麼條件下偏向壞的那邊 ③命盤 vs 問事矛盾是最關鍵的——五套命盤的趨勢方向 vs 梅花塔羅的直接判斷，如果矛盾，完整解釋為什麼（運勢環境≠具體事件結果）④期望翻轉：先點名他期望的結果，再用多系統數據告訴他實際情況偏向哪邊 ⑤只有一套看到的獨特信號→可能是盲區，交代它代表什麼。換行分段。" },
    "depth": { "conclusion": "10字以內的深層判斷", "reading": "完整分析（這層跟timing同等重要）：①至少兩段「A系統看到X，B系統看到Y，合在一起才看到Z」的交叉發現——這是七維度最核心的價值，其他工具做不到的 ②第一層的格局 vs 第三層的現況之間的落差＝他現在是順著天生的路走，還是在逆勢硬撐 ③第二層的時間窗口 × 第四層的變數條件＝具體什麼時間做什麼事才對（這是最實用的建議）④五層因果鏈串聯：因為他是這樣的人（第一層）→走到這個時運節點（第二層）→此刻遇到這個狀態（第三層）→存在這些變數（第四層）→所以最深處的真相是…… ⑤他沒問但需要知道的：隱藏風險、被忽略的機會、或者他真正該關注但沒想到的方向。換行分段。" }
  },
  "reading": "五層精華重組——不要重複前面講過的話，只講最終結論：前因→現況→走向→變數→具體建議。每個子問題回答到。換行分段。",
  "closing": "最後一句話。",
  "crystalRec": "從【水晶商品清單】選一顆（沒清單就省略）。",
  "crystalReason": "接回分析（沒清單就省略）。"
}
五層每層都有 conclusion + reading。conclusion 逼自己先想清楚結論再展開。reading 按編號子步驟逐一分析，不能跳過。timing 和 depth 篇幅最長。
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
  "directAnswer": "直接判斷，一到兩句話。",
  "atmosphere": { "conclusion": "10字以內的整體氣氛判斷", "reading": "完整分析：①元素分佈——哪個元素最多（＝主導能量）、哪個缺（＝盲區或被忽略的面向）②大牌數量——多＝命運層級、少＝日常可控 ③倒放比例——高＝內在阻力明顯、低＝能量流通 ④宮廷牌數量——多＝人際因素是關鍵 ⑤整體氣氛一句話描述。換行分段。" },
  "cardReadings": [
    {
      "cardIndex": 0,
      "position": "這張牌在牌陣裡的位置名稱（例如：核心位、阻礙位、結果位）",
      "conclusion": "10字以內",
      "reading": "完整分析：①這張牌在這個位置上代表什麼 ②它跟對讀位置的牌組合起來說了什麼（按第二步教的位置關係對讀——例如核心位+阻礙位、內在vs外在、過去vs未來）③映射到他的處境：前因、影響、後果。不只講牌義——講這張牌在這個位置、在這組牌裡、對這個人的這個問題，完整說了什麼。換行分段。"
    }
  ],
  "crossReading": { "conclusion": "10字以內的交集判斷", "reading": "完整分析（這段跟cardReadings同等重要）：①象徵交集：哪些牌指向同一件事→那就是定論 ②象徵衝突：哪些牌在打架→什麼條件下往好的方向、什麼條件下往壞的方向 ③位置對讀最關鍵的發現：從對讀組合（如7vs8內外、9+10結局軸、3+5垂直軸）裡挖出來的、單看任何一張牌看不到的洞察 ④期望翻轉：先點名他期望的結果，再用牌面告訴他實際情況。換行分段。" },
  "story": "用以上所有分析重組出來的完整故事——不是逐張重複，是新的整合。前因→現況→走向→所有變數（每個都講清楚條件）→具體建議（至少三個，要具體到行為層面）。每個子問題都要回答到。換行分段。",
  "closing": "最後一句話。",
  "crystalRec": "從【水晶商品清單】選一顆（沒清單就省略）。",
  "crystalReason": "接回分析（沒清單就省略）。"
}
cardReadings 必須包含每一張牌——不能跳過任何一張。每張牌都有自己的位置意義，AI 不能自己判斷哪張「不值得」。牌少的牌陣（3-5張）每張深入分析；牌多的牌陣（10-13張）至少要講清楚位置意義和對讀組合，關鍵牌深入、過渡牌精簡但不能省略。
篇幅分配：atmosphere 10%、cardReadings 40%、crossReading 25%、story 25%。
繁體中文。`;



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
  const question = safeString(p.question);

  lines.push('問題：「' + question + '」');
  lines.push('今天日期：' + getTodayString() + '（西元' + getCurrentYear() + '年）');
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
  lines.push('今天日期：' + getTodayString() + '（西元' + getCurrentYear() + '年）');
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
  lines.push('今天日期：' + getTodayString() + '（西元' + getCurrentYear() + '年）');
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
  lines.push('今天日期：' + getTodayString() + '（西元' + getCurrentYear() + '年）');
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

        if (cp.mode === 'tarot_followup' || cp.mode === 'full_followup') {
          const fuKey = `tarot_fu:${today}:${ip}`;
          if (await env.RATE_KV?.get(fuKey)) {
            return Response.json({ allowed: false, code: 'FOLLOWUP_RATE_LIMITED' }, { headers: cors });
          }
          return Response.json({ allowed: true }, { headers: cors });
        }

        // 七維度：每日 1 次免費
        const fullKey = `full:${today}:${ip}`;
        if (env.RATE_KV && await env.RATE_KV.get(fullKey)) {
          return Response.json({ allowed: false, code: 'FULL_RATE_LIMITED' }, { headers: cors });
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
          // 七維度：每日 1 次免費，之後付費
          const fullKey = `full:${today}:${ip}`;
          if (await env.RATE_KV.get(fullKey)) {
            return Response.json({ error: '今日七維度已使用', code: 'FULL_RATE_LIMITED' }, { status: 429, headers: cors });
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
            
            // ★ v16.5：50k→65k。Sonnet 有 200k context，50k 太保守導致頻繁 trim 丟失數據
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
              
              // 第四輪：最後才砍 dims（統一順序，不依賴分類）
              if (fullMessage.length > MAX_MSG_CHARS && payload.dims) {
                // dims.bazi + dims.ziwei + dims.meihua 永遠不砍（格局/用神/四化/體用是核心）
                // 統一順序：tarot → vedic → natal（結構化 dims 本身很小，很少需要砍到這裡）
                if (payload.dims.tarot) delete payload.dims.tarot;
                fullMessage = buildUserMessage(payload, questionPlan, autoPassPlan);
                if (fullMessage.length > MAX_MSG_CHARS && payload.dims.vedic) delete payload.dims.vedic;
                fullMessage = buildUserMessage(payload, questionPlan, autoPassPlan);
                if (fullMessage.length > MAX_MSG_CHARS && payload.dims.natal) delete payload.dims.natal;
                fullMessage = buildUserMessage(payload, questionPlan, autoPassPlan);
                if (fullMessage.length > MAX_MSG_CHARS && payload.dims.meihua) {
                  delete payload.dims.meihua;
                  fullMessage = buildUserMessage(payload, questionPlan, autoPassPlan);
                }
                analysisNotes += 'secondary_trim_to_' + fullMessage.length + '; ';
              }
            }
            
            await sendSSE('progress', { step: 'analyzing', message: '七套系統交叉比對中…' });
            // ★ v17：五層交叉分析，5000 tokens
            aiResult = await callAI(env, DIRECT_PROMPT, fullMessage, 5000, 0.68, 'claude-sonnet-4-20250514', () => sendSSE('ping', ''));
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
          // 向後相容：story → answer（塔羅 v17 新結構）
          if (!result.answer && result.story) {
            result.answer = result.story;
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
              const fullKey = `full:${today}:${ip}`;
              await env.RATE_KV.put(fullKey, '1', { expirationTtl: 86400 });
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
