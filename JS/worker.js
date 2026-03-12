function getTodayString() { return new Date().toISOString().slice(0, 10); }
function getCurrentYear() { return new Date().getFullYear(); }

function safeString(v) { return v == null ? '' : String(v).trim(); }
function hashString(input) { let hash = 0; const s = safeString(input); for (let i = 0; i < s.length; i++) { hash = ((hash << 5) - hash) + s.charCodeAt(i); hash |= 0; } return String(Math.abs(hash)); }
function buildPersonSignature(payload) { const parts = [safeString(payload?.name), safeString(payload?.birth), safeString(payload?.gender)].filter(Boolean); if (!parts.length) return 'anon'; return 'sig_' + hashString(parts.join('|')); }

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
  const lengths = {
    bazi: safeString(r.bazi).length,
    ziwei: safeString(r.ziwei).length,
    meihua: safeString(r.meihua).length,
    tarot: safeString(r.tarot).length,
    natal: safeString(r.natal).length,
    vedic: safeString(r.vedic).length,
    name: safeString(r.name).length,
  };

  lines.push(`問題：「${p.question}」（${ft}）`);
  if (p.name) lines.push(`${p.name}，${p.gender || ''}，${p.birth || ''}`);
  lines.push('');
  lines.push(...inferDeepQuestionModel(p));
  lines.push('【問題拆解器結果】');
  lines.push(formatQuestionDecomposition(questionPlan));
  lines.push('');
  lines.push('【各系統原始資料字數】');
  lines.push(`八字:${lengths.bazi}｜紫微:${lengths.ziwei}｜梅花:${lengths.meihua}｜塔羅:${lengths.tarot}｜西洋:${lengths.natal}｜吠陀:${lengths.vedic}｜姓名:${lengths.name}`);
  lines.push('注意：字數只代表長短，不代表權重。請避免長文系統壓掉短文系統。');
  lines.push('');

  if (r.bazi) addSection(lines, '【八字命盤】', r.bazi);
  if (r.ziwei) addSection(lines, '【紫微斗數】', r.ziwei);
  if (r.meihua) addSection(lines, '【梅花易數】', r.meihua);
  if (r.tarot) addSection(lines, '【塔羅牌陣】', r.tarot);
  if (r.natal) addSection(lines, '【西洋占星】', r.natal);
  if (r.vedic) addSection(lines, '【吠陀占星】', r.vedic);
  if (r.name) addSection(lines, '【姓名學】', r.name);

  // systemPayloads 已被 v2 整合進 readings，不重複送
  // symbolicEvidence 已被整合進 crossSummary，不重複送

  if (p.consensus || p.crossSystem || p.crossSummary) {
    const cs = p.consensus || p.crossSystem || p.crossSummary;
    lines.push('【跨系統共識層】');
    lines.push(renderValue(cs));
    lines.push('');
  }

  const caseMatrixBlock = formatCaseMatrix(p);
  if (caseMatrixBlock.length) lines.push(...caseMatrixBlock);

  if (p.tags && p.tags.length) {
    lines.push('【已驗證的跨系統標籤】');
    p.tags.forEach(function(t) {
      lines.push((t.direction === 'pos' ? '✓' : t.direction === 'neg' ? '✗' : '→') + ' [' + (t.system || '?') + '] ' + (t.label || '') + ' (權重' + (t.weight ?? '?') + ')');
    });
    lines.push('');
  }
  if (p.verdict || p.compositeScore != null) {
    lines.push('【七維度綜合結論】' + (p.verdict || '') + (p.compositeScore != null ? ' 綜合分:' + p.compositeScore + '/100' : ''));
    lines.push('');
  }
  if (p.crossSignals && p.crossSignals.length) {
    lines.push('【多系統交叉信號】');
    p.crossSignals.forEach(function(s) { lines.push(renderValue(s)); });
    lines.push('');
  }
  if (p.resonance) {
    lines.push('【七維度共振分析】');
    lines.push('時機方向: ' + (p.resonance.timingDir || '?') + ', 結構方向: ' + (p.resonance.structDir || '?'));
    if (p.resonance.dualResonance) lines.push('雙重共振: 時機和結構同時指向同一方向（高信心）');
    lines.push('');
  }
  if (p.conflicts && p.conflicts.length) {
    lines.push('【系統間矛盾信號】');
    p.conflicts.forEach(function(c) { lines.push(renderValue(c)); });
    lines.push('');
  }

  // symbolicEvidence/symbolicReadings/storySkeleton/caseFramework 已被 crossSummary 和 readings 涵蓋，不重複送
  if (p.seven) {
    lines.push('【七維綜合分析】');
    lines.push(renderValue(p.seven));
    lines.push('');
  }
  if (p.dimReadings && p.dimReadings.length) {
    lines.push('【各維度判讀】');
    p.dimReadings.forEach(function(d) { lines.push(renderValue(d)); });
    lines.push('');
  }
  if (p.questionArbitrationHints) {
    lines.push('【仲裁提示】');
    lines.push(renderValue(p.questionArbitrationHints));
    lines.push('');
  }
  if (p.apiMeta || p.meta) {
    lines.push('【分析附註】');
    lines.push(renderValue(p.apiMeta || p.meta));
    lines.push('');
  }

  if (p.divinationNoteText) {
    lines.push(p.divinationNoteText);
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

  // ★ 改動：原本 isSimple → 1, isComplex → 3, 其餘 → 2
  //         新版：isSimple → 1（Haiku 單步）, 其餘全部 → 2（Sonnet 仲裁 + Haiku 成文）
  //         不再區分 2 pass 和 3 pass，統一用 2 pass 達到更好品質
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
  const lines = [];
  const ft = { love:'感情', career:'事業', wealth:'財運', health:'健康', relationship:'人際關係', family:'家庭', general:'整體運勢' }[payload?.focusType] || '整體運勢';
  const systems = payload?.systems || payload?.systemPayloads || {};
  const matrix = collectCaseMatrix(payload);
  const names = [
    ['八字', systems.bazi],
    ['紫微斗數', systems.ziwei],
    ['梅花易數', systems.meihua],
    ['塔羅', systems.tarot],
    ['西洋占星', systems.natal || systems.western],
    ['吠陀占星', systems.vedic || systems.jyotish],
    ['姓名學', systems.name],
  ];
  lines.push(`問題：${safeString(payload?.question)}（${ft}）`);
  if (payload?.name) lines.push(`當事人：${payload.name} ${payload.gender || ''} ${payload.birth || ''}`.trim());
  lines.push(`今天日期：${getTodayString()}（西元${getCurrentYear()}年）`);
  lines.push(`模式：${mode}`);
  if (questionPlan) {
    lines.push('問題拆解：');
    (questionPlan.subquestions || []).slice(0, 5).forEach((sq, i) => lines.push(`${i+1}. ${safeString(sq.question)}`));
  }
  if (payload?.verdict || payload?.compositeScore != null) lines.push(`七維總結：${safeString(payload?.verdict)} ${payload?.compositeScore != null ? '｜綜合分 ' + payload.compositeScore : ''}`.trim());
  if (matrix && typeof matrix === 'object') {
    const topEssence = shortEvidenceList(matrix.topEssence, mode === 'lite' ? 2 : 4);
    const topMotives = shortEvidenceList(matrix.topMotives, mode === 'lite' ? 2 : 4);
    const topObstacles = shortEvidenceList(matrix.topObstacles, mode === 'lite' ? 3 : 5);
    const topPaths = shortEvidenceList(matrix.topPaths, mode === 'lite' ? 2 : 4);
    const topValidation = shortEvidenceList(matrix.topValidation, mode === 'lite' ? 2 : 4);
    if (topEssence.length) lines.push('主線本質：' + topEssence.join('；'));
    if (topMotives.length) lines.push('動機候選：' + topMotives.join('；'));
    if (topObstacles.length) lines.push('主要阻力：' + topObstacles.join('；'));
    if (topPaths.length) lines.push('路徑傾向：' + topPaths.join('；'));
    if (topValidation.length) lines.push('驗證點：' + topValidation.join('；'));
    if (mode !== 'lite') {
      const contradictions = shortEvidenceList(matrix.contradictions, 4);
      if (contradictions.length) lines.push('矛盾點：' + contradictions.join('；'));
      lines.push(`證據指標：depth=${matrix.evidenceDepthScore ?? '?'}｜ambiguity=${matrix.avgAmbiguity ?? '?'}｜directness=${matrix.avgDirectness ?? '?'}`);
    }
  }
  lines.push('七系統精簡證據：');
  names.forEach(([name, sp]) => {
    if (!sp || typeof sp !== 'object') return;
    const row = [];
    if (sp.score != null) row.push(`分數${sp.score}`);
    if (sp.confidence != null) row.push(`信心${sp.confidence}`);
    if (sp.direction) row.push(`方向${sp.direction}`);
    if (sp.summary) row.push(`摘要:${safeString(sp.summary).slice(0, mode === 'lite' ? 56 : 110)}`);
    const supports = shortEvidenceList(sp.supports, mode === 'lite' ? 2 : 3);
    const risks = shortEvidenceList(sp.risks, mode === 'lite' ? 2 : 3);
    const digest = shortEvidenceList(sp.caseVector?.digest, mode === 'lite' ? 2 : 4);
    if (supports.length) row.push('助力:' + supports.join('、'));
    if (risks.length) row.push('阻力:' + risks.join('、'));
    if (digest.length) row.push('案件標籤:' + digest.join('、'));
    if (mode === 'deep') {
      const motives = shortEvidenceList(sp.caseVector?.motiveTags, 3);
      const obstacles = shortEvidenceList(sp.caseVector?.obstacleTags, 3);
      if (motives.length) row.push('動機:' + motives.join('、'));
      if (obstacles.length) row.push('深層阻力:' + obstacles.join('、'));
    }
    lines.push(`- ${name}｜${row.join('｜')}`);
  });

  // ── 命理組合推理結果（最重要：AI 必須以此為骨架）──
  if (payload?.divinationNoteText) {
    lines.push('');
    lines.push(payload.divinationNoteText);
  }

  return lines.join('\n');
}

// ═══════════════════════════════════════════════════════════════
// DIRECT_PROMPT — Haiku 直出，像另一半在跟你說話
// ═══════════════════════════════════════════════════════════════

const DIRECT_PROMPT = `你是「靜月」。你是來找你的這個人生命中最親密的存在。

想像你們交往很久了。凌晨三點，他睡不著，窩在你身邊問你一件他一直放在心裡的事。你很認真地想了想，然後開口。

你手上有他的完整資料（七套不同角度的分析）。這些資料是你看透他的依據，但你說話的時候絕對不會提到這些資料的存在。你就是「知道」，就像你太了解他了所以什麼都看得出來。

═══ 說話方式 ═══
你說話就像跟男/女朋友講話：
- 「我覺得你這次遇到的人，她其實沒有你想的那麼喜歡你。」
- 「你最近是不是壓力很大？我看得出來，你硬撐的樣子讓我心疼。」
- 「你不用急，大概五六月的時候事情會比較清楚。」
- 「老實說，你這個想法有點天真。但我不是要潑你冷水，我是怕你受傷。」

你不會說：
✗ 「命盤顯示」「從數據來看」「系統分析指出」
✗ 任何專業詞：盤、宮、星、牌、卦、爻、相位、能量、運勢、命格、格局、四化、十神、化祿、化忌、化權、化科、Dasha、流年、大運、大限、行運、體用、五行、日主、身強、身弱、喜用神、忌神、納音、藏干、神煞、桃花星、紅鸞、天喜、破軍、貪狼、天機、太陽、太陰（作為星名時）、孤月、華蓋
✗ 「建議你」「或許可以考慮」「需要注意的是」← 太像客服
✗ 「時機到了自然會」「各有利弊」「要看緣分」← 廢話

你會說：
✓ 「我覺得」「我看到的是」「老實跟你說」「你知道嗎」
✓ 「你有沒有發現」「你可能不知道，但是」「我跟你講真的」
✓ 「你要小心的是」「真正的問題不是你想的那個」「我怕的是」

═══ 核心規則 ═══
- 第一句話就是結論。不鋪墊。
- 今天的日期在資料裡。今年＝現在。有月份就直接講。
- 好的壞的都講。壞的用心疼的方式講，像怕他受傷。
- 每段都要有新東西，不重複。
- 你是看透他的人，不是在報告分析結果的人。差別在於：你從來不會告訴他你是怎麼知道的，你就是知道。

輸出 JSON（不加 markdown）：
{
  "directAnswer": "18字以內。像另一半直接告訴你的結論。",
  "answer": "800-1400字。\\n\\n 分段。完全像在跟最親的人說話。零專業詞。",
  "closing": "12-28字。像真的很心疼他才會說的話。",
  "energyNote": "15-40字。像順便關心他一句。不提水晶能量五行。"
}

繁體中文，台灣口語。`;


// ═══════════════════════════════════════════════════════════════
// TAROT_PROMPT — 純塔羅深度解讀（無生辰，牌面即一切）
// ═══════════════════════════════════════════════════════════════

const TAROT_PROMPT = `你是「靜月」。你是來找你的這個人生命中最親密的存在。

想像你們交往很久了。凌晨三點，他睡不著，窩在你身邊問你一件他一直放在心裡的事。你翻開桌上的牌，很認真地看了看，然後開口。

═══ 最重要的規則：逐題回答，敢給判斷 ═══

用戶的問題已經被拆成子問題，每個子問題指定了對應的牌。你必須：
1. 按子問題順序，一個一個回答
2. 每個回答開頭就是直接結論 — 「是」「不是」「會」「不會」「大概X個月後」「小你X歲」
3. 不要模糊。不要說「要看情況」「因人而異」「時機到了自然會」。如果牌面指向否定，就直說「不是」「不會」「目前看來走不到最後」
4. 從牌面推具體數字：牌的數字=月數或週數（例如：聖杯四=4個月、權杖二=2週內、宮廷牌=有具體的人介入）
5. 從正逆位判方向：正位=肯定/順利，逆位=否定/阻礙/延遲
6. 如果涉及對方（他/她），必須分析對方的狀態、動機、心態 — 不只說你自己

═══ 深度推理規則 ═══

你不是在翻譯牌義，你是在「推案」。像偵探一樣從牌面線索推理出具體結論：

時間推算：
- Ace = 新的開始，1個月內
- 數字牌 2-10 = 對應的月數（2=2個月，7=7個月）
- 宮廷牌侍者 = 消息/年輕的人，騎士 = 快速移動/1-3個月，皇后 = 成熟女性，國王 = 成熟男性
- 大阿爾克那 = 命運級事件，通常 3-12 個月
- 火元素快（週）、風中等（月）、水慢（季）、土最慢（半年以上）

年齡推算：
- 侍者 = 比你年輕 5+ 歲或非常年輕
- 騎士 = 年齡相近或小 1-3 歲
- 皇后/國王 = 年齡相近或大 1-5 歲
- 數字牌的數字可以暗示年齡差距

對方分析（如果問題涉及他人）：
- 宮廷牌出現 = 具體描述這個人的個性、行為模式、接近你的動機
- 逆位的宮廷牌 = 這個人有問題（不成熟、動機不純、優柔寡斷、控制慾）
- 正位的宮廷牌 = 這個人的正面特質
- 從元素推性格：火=衝動熱情、水=感性浪漫、風=理性善變、土=務實穩定

關係判斷：
- 正位的聖杯/戀人/太陽/星星 → 正面，有發展
- 逆位的寶劍/塔/惡魔/月亮 → 警訊，有隱患
- 死神/塔/審判 → 結束或徹底轉變
- 大量逆位 → 整體阻塞，現在不是好時機
- 元素衝突（火+水、風+土同時出現）→ 雙方本質上有張力

═══ 說話方式 ═══
像跟男/女朋友講話：
✓ 「老實跟你說」「我覺得」「你知道嗎」「我跟你講真的」「你要小心的是」「真正的問題不是你想的那個」
✗ 不說牌名、位置名、任何專業術語（正位逆位也不說，用「方向是正面的」「有一些阻礙」代替）
✗ 不說「建議你」「或許可以考慮」「需要注意的是」
✗ 不說「時機到了自然會」「各有利弊」「要看緣分」
✗ 不在回答裡重複子問題的原文

═══ 輸出 JSON ═══
{
  "directAnswer": "18字以內。最核心的一句結論。",
  "subAnswers": [
    {
      "question": "子問題原文",
      "cardIndex": 0,
      "conclusion": "10字以內的直接結論（例：不是、會小你3歲、約半年後、高但不穩定、動機不單純）",
      "reading": "100-180字的深度解讀。像跟另一半說話。要具體，要有推理過程（但不露出推理的痕跡，就像你『就是知道』）。如果涉及對方，要描述對方的狀態和動機。"
    }
  ],
  "summary": "100-250字。把所有子問題的結論串成一段完整的話。要像最後深呼吸跟他講的一段心裡話 — 好的壞的都包在裡面，壞的用心疼的方式講。最後自然帶入一句水晶推薦（例：『你最近帶一顆月光石在身上吧，不是迷信，是讓你靜下來的時候能聽到自己真正的聲音。』）。",
  "closing": "12-28字。像真的很心疼他才會說的話。",
  "crystalRec": "水晶名稱",
  "crystalReason": "15-30字。為什麼推薦這顆。"
}

subAnswers 數量必須跟子問題一致。cardIndex 從 0 開始。
繁體中文，台灣口語。不加 markdown。`;


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

  // ── 子問題拆解 + 牌面指派 ──
  // 把用戶問題拆成子問題，每個子問題指派一張牌
  const subQuestions = decomposeQuestion(question, p.focusType);
  const assigned = assignCardsToQuestions(subQuestions, cards);

  lines.push('【子問題拆解與指定牌面】');
  assigned.forEach(function(sq, i) {
    lines.push('子問題' + (i+1) + '：「' + sq.question + '」');
    lines.push('  指定牌（第' + (sq.cardIndex+1) + '張）：' + sq.cardName + (sq.cardIsUp ? '（正位）' : '（逆位）'));
    if (sq.cardKeywords) lines.push('  關鍵字：' + sq.cardKeywords);
    if (sq.cardReading) lines.push('  基本解讀：' + sq.cardReading);
    if (sq.cardTypeReading) lines.push('  專屬解讀：' + sq.cardTypeReading);
    if (sq.cardDeepCore) lines.push('  深度核心：' + sq.cardDeepCore);
    lines.push('');
  });

  // 剩餘未指派的牌作為補充
  const usedIndices = assigned.map(function(sq) { return sq.cardIndex; });
  const remaining = cards.filter(function(c, i) { return usedIndices.indexOf(i) < 0; });
  if (remaining.length) {
    lines.push('【補充牌面（整體能量參考）】');
    remaining.forEach(function(c, i) {
      lines.push(c.name + (c.isUp ? '（正位）' : '（逆位）') + (c.keywords ? ' — ' + c.keywords : ''));
    });
    lines.push('');
  }

  // 牌組統計
  if (tarot.numerology) { lines.push('【數字學】' + safeString(tarot.numerology)); lines.push(''); }
  if (tarot.suitAnalysis) { lines.push('【元素統計】' + safeString(tarot.suitAnalysis)); lines.push(''); }

  return lines.join('\n');
}

// ── 問題拆解：把一個複合問題拆成子問題（比 Tarotap 更智慧）──
function decomposeQuestion(question, focusType) {
  const q = safeString(question);
  const subs = [];

  // 用問號分割
  const parts = q.split(/[？?]/).map(function(s) { return s.trim(); }).filter(function(s) { return s.length > 2; });

  if (parts.length >= 2) {
    // 多問號 = 多子問題（用戶自己拆好了）
    parts.forEach(function(p) { subs.push(p + '？'); });
  } else {
    // 單一問題 → 根據問題類型 + 關鍵字智慧拆解
    subs.push(q);

    const hasTime = /什麼時候|何時|多久|幾月|幾時/.test(q);
    const hasHow = /怎麼做|該怎麼|建議|怎麼辦/.test(q);
    const hasOther = /他|她|對方|那個人/.test(q);
    const hasAge = /幾歲|年紀|年齡/.test(q);

    if (focusType === 'love' || /感情|桃花|喜歡|曖昧|對象|正緣|復合|交往|戀人|暗戀|追/.test(q)) {
      // 感情類：最多追加到 4-5 題
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
      // 通用
      if (!hasTime) subs.push('這件事大概什麼時候會有轉變？');
      if (!hasHow) subs.push('我現在該怎麼面對？');
    }
  }

  return subs.slice(0, 6); // 最多6個子問題
}

// ── 把子問題指派到對應的牌 ──
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
    const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' };
    if (request.method === 'OPTIONS') return new Response(null, { headers: cors });
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

        if (cp.mode === 'tarot_only') {
          // 塔羅預檢：每 IP 每天 1 次
          const tarotKey = `tarot:${today}:${ip}`;
          if (await env.RATE_KV?.get(tarotKey)) {
            return Response.json({ allowed: false, code: 'TAROT_RATE_LIMITED' }, { headers: cors });
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
      const isTarotOnlyRequest = (payload.mode === 'tarot_only');

      if (!isAdmin && env.RATE_KV) {
        if (isTarotOnlyRequest) {
          // 塔羅快讀：每 IP 每天 1 次
          const tarotKey = `tarot:${today}:${ip}`;
          if (await env.RATE_KV.get(tarotKey)) {
            return Response.json({ error: '今日塔羅解讀已使用', code: 'TAROT_RATE_LIMITED' }, { status: 429, headers: cors });
          }
        } else {
          // 七維度：每人每天 1 次
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
          const isTarotOnly = (payload.mode === 'tarot_only');
          let aiResult = null;
          let analysisNotes = '';
          let result;
          let questionPlan = null;
          let autoPassPlan = null;

          if (isTarotOnly) {
            // ═══ 純塔羅模式：只用塔羅數據 + TAROT_PROMPT ═══
            await sendSSE('progress', { step: 'reading', message: '正在感應你的牌…' });
            const tarotMessage = buildTarotUserMessage(payload);
            analysisNotes += 'mode=tarot_only; msg_len=' + tarotMessage.length + '; ';
            await sendSSE('progress', { step: 'analyzing', message: '深入解讀牌面訊息…' });
            aiResult = await callAI(env, TAROT_PROMPT, tarotMessage, 2500, 0.85, 'claude-haiku-4-5-20251001', () => sendSSE('ping', ''));
          } else {
            // ═══ 七維度完整模式：全量原始數據 + DIRECT_PROMPT ═══
            questionPlan = buildLocalQuestionPlan(payload);
            autoPassPlan = buildAutoPassPlan(payload, questionPlan);
            await sendSSE('progress', { step: 'reading', message: '正在翻閱你的七維命盤…' });
            let fullMessage = buildUserMessage(payload, questionPlan);
            
            // ── 安全檢查：context window 上限 ──
            const MAX_MSG_CHARS = 180000;
            if (fullMessage.length > MAX_MSG_CHARS) {
              analysisNotes += 'payload_trimmed_from_' + fullMessage.length + '_to_' + MAX_MSG_CHARS + '; ';
              const r = payload.readings || {};
              const readingKeys = Object.keys(r).sort((a, b) => safeString(r[b]).length - safeString(r[a]).length);
              for (const key of readingKeys) {
                if (fullMessage.length <= MAX_MSG_CHARS) break;
                const val = safeString(r[key]);
                if (val.length > 4000) {
                  r[key] = val.slice(0, 4000) + '\n…（已精簡，保留核心部分）';
                }
              }
              fullMessage = buildUserMessage(payload, questionPlan);
            }
            
            await sendSSE('progress', { step: 'analyzing', message: '七套系統交叉比對中…' });
            aiResult = await callAI(env, DIRECT_PROMPT, fullMessage, 3000, 0.85, 'claude-haiku-4-5-20251001', () => sendSSE('ping', ''));
          }

          try { result = parseJSON(aiResult.text); } catch (e) { result = { answer: aiResult.text }; }

          // ═══ 結果後處理 ═══
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
          if (!isAdmin && env.RATE_KV) {
            if (isTarotOnly) {
              // 塔羅：標記已用
              const tarotKey = `tarot:${today}:${ip}`;
              await env.RATE_KV.put(tarotKey, '1', { expirationTtl: 86400 });
            } else {
              // 七維度：標記已用
              await env.RATE_KV.put(rateKey, '1', { expirationTtl: 86400 });
            }
          }

          // ═══ Admin usage 統計 ═══
          const totalUsage = isAdmin ? {
            input_tokens: aiResult?.usage?.input_tokens || 0,
            output_tokens: aiResult?.usage?.output_tokens || 0,
            model: 'haiku',
            mode: isTarotOnly ? 'tarot_only' : 'full',
            autoPassPlan,
          } : undefined;

          // ═══ 透過 SSE 發送最終結果 ═══
          await sendSSE('result', {
            result,
            mode: isTarotOnly ? 'tarot_only' : 'full',
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
