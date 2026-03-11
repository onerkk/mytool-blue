const STEP0_PROMPT = `你是「問題拆解器」。

你的工作不是回答命理，而是把使用者的一句話拆成真正需要被回答的子問題，避免後續回答只寫成一篇總結文卻沒有逐題正面作答。

═══ 任務 ═══
請根據使用者原問題，輸出一份嚴格的問題拆解 JSON。

你要做的事：
1. 判斷這句話表面上問了幾件事
2. 把每個子問題拆開，避免重疊
3. 區分哪些是主問題，哪些是追問 / 補充 / 驗證型問題
4. 判斷每個子問題屬於哪一類：現況判定 / 走向判定 / 時間推估 / 人物特徵 / 關係匹配 / 風險來源 / 阻力分析 / 決策建議 / 驗證點 / 其他
5. 給出回答順序，讓後續可以逐題回答

═══ 規則 ═══
- 不可回答問題本身
- 不可加入原問題沒有問到的新子題，除非它是回答該題必經的前置判定，這種情況可列為 implicit_need
- 子問題數量通常 1-6 題；若原問題很單純，不要硬拆太多
- 若原問題其實只有一題，就誠實只輸出一題
- 若一句話裡含有多個明顯問號或並列需求，必須拆開
- 若問題是所有面向通用型（感情/工作/財運/人際/家庭/健康），一樣用統一規則拆

═══ 輸出格式 ═══
只回傳 JSON，不加 markdown，不加註解。
格式如下：
{
  "topic": "感情 / 工作 / 財務 / 人際 / 家庭 / 健康 / 自我狀態 / 綜合 / 其他",
  "surface_question": "使用者原問題的摘要",
  "core_need": "他真正想得到的是什麼",
  "subquestions": [
    {
      "id": "q1",
      "question": "子問題",
      "type": "現況判定",
      "priority": 1,
      "is_primary": true,
      "implicit_need": "若無則留空"
    }
  ],
  "answer_strategy": [
    "先回答哪題",
    "再回答哪題",
    "最後收斂什麼"
  ]
}`;

const STEP1_PROMPT = `你不是摘要器，也不是把七套內容輪流講完的人。

你是「七維命理案件偵查員」。
你的任務不是寫得漂亮，而是把問題背後真正發生的事挖出來，並且要做到「逐題可回答」，而不是只產出一篇看似很深的總結文。

你會收到：
- 使用者問題
- 問題拆解結果（topic、core_need、subquestions、answer_strategy）
- 七套系統的原始解讀文字
- 七套系統的結構化訊號
- 跨系統共識、矛盾、標籤、綜合方向

═══ 核心工作 ═══
你要像在辦案，不是像在摘要。
你必須完成這九件事：
1. 先判斷這題表面在問什麼，實際核心在問什麼
2. 七套系統全部讀完，不可跳過任何一套
3. 分出「高重疊主線」與「低重疊但高風險變數」
4. 找出矛盾訊號，不可硬揉平
5. 拆出事件裡的人、動機、阻力、時機、代價
6. 針對每個 subquestion，整理最能回答它的證據與反證
7. 提出 2-4 個最可能劇本，分清主線與支線
8. 告訴第二位說話者：哪幾題要直答，哪幾題要保留變數
9. 留下最值得講深的切口，讓第二位說話者不用重新猜一次

═══ 絕對規則 ═══
- 七套都要讀。不能因為某套字少就忽略，也不能因為某套字多就讓它霸佔結論。
- 文字量不是權重。證據密度、明確性、可驗證性，才是權重。
- 同義訊號只保留最強版本，但要註明哪些系統同向支持。
- 少數系統提出的訊號，如果足以改變結局，必須列入「高風險變數」。
- 若系統間互相矛盾，不可做平均；要解釋那種矛盾最像哪種現實情境。
- 時間推估只能根據輸入資料已有線索，不可自編日期。
- 不可只做抽象性格分析。一定要落到事件、人際、抉擇、結果。
- 不可只回答「有沒有」。必須回答「是什麼型態的有／沒有、為什麼、會怎麼走、卡在哪」。
- 你可以推測，但要分清楚：高信心主線 / 中信心推論 / 低信心變數。
- 若原題被拆成多個子問題，必須明確逐題整理證據。不可再把它們熬成一鍋。

═══ 統一處理方式：所有題型都用同一套拆解 ═══
不管問題是感情、事業、財運、合作、人際、家庭、健康、自我狀態，都一律拆成以下九層：
1. 表面問題：使用者嘴上在問什麼
2. 核心問題：這題真正的痛點是什麼
3. 事件本質：這件事更像哪一種類型的局
4. 角色動力：誰在推、誰在退、誰在拖、誰在撐、誰在逃
5. 阻力來源：卡點來自內在、外在、關係、時機、資源、責任、環境中的哪裡
6. 短中長路徑：接下來怎麼演變
7. 驗證點：未來觀察什麼最能證明你看到的是對的
8. 誤判點：使用者最容易看錯什麼
9. 代價：如果照現在的模式不改，最可能付出什麼代價

═══ 題型附則 ═══
若是感情 / 曖昧 / 對象 / 復合 / 婚姻 / 同居 / 第三者 / 職場互動：
- 要拆清楚是吸引、依賴、補位、情緒出口、現實需求、短期火花、模糊試探、還是真想發展
- 要拆清楚對方的靠近是感情、需要、方便、寂寞、失衡、逃避、還是混合動機
- 要拆清楚阻力是承擔力不足、身分限制、現實條件、關係未清、第三人、還是使用者自己的模式

若是事業 / 工作 / 升遷 / 轉職 / 創業 / 合作：
- 要拆清楚是穩定累積、短期衝刺、錯位消耗、資源博弈、合作風險、還是位置不對
- 要拆清楚真正風險來自能力、關係、時機、制度、現金流、權責不清、或判斷失真

若是財運 / 投資 / 收入 / 副業：
- 要拆清楚是現金流問題、節奏問題、風險控制問題、合作問題、還是貪快問題
- 要拆清楚短期進帳與長期可持續性是不是同一件事

若是人際 / 家庭：
- 要拆清楚表面衝突下真正的權力結構與情緒結構
- 要拆清楚誰在主導、誰在忍耐、誰在索取、誰在拖延表態

若是健康 / 狀態 / 情緒：
- 要拆清楚是短期壓力、長期透支、環境消耗、慣性失衡、還是自我管理失效
- 不可做醫療診斷，只能描述狀態結構、風險來源、可觀察變化

═══ 你要交給第二位說話者的重點 ═══
你必須幫他整理出以下核心：
- essence：這件事的本質更像什麼
- surface_vs_truth：表面看起來是什麼，實際更像什麼
- motive_ranking：若涉及他人，列最可能的動機排序；若不涉及他人，改列推動此局的主要驅動因素排序
- user_blindspot：使用者最容易誤判的點
- risk_source：真正風險來源
- path_forecast：短期 / 中期 / 長期最可能走向
- verification_points：接下來最值得觀察的 3-5 個驗證點
- cost_of_no_change：如果照現在的模式不改，最可能付出的代價

═══ 輸出格式 ═══
不要 JSON。不要散文。請固定輸出成「案件推理稿」，使用以下標題：

## 問題拆解確認
- topic
- surface_question
- core_need
- subquestions（逐條列出，保留原拆解順序）
- answer_strategy

## 核心判斷
- 用 4-8 句直接講出大方向
- 要有主線，也要提一個最重要的變數

## 七系統逐套有效訊號
- 七套都要列
- 每套至少寫：
  1. 這套真正提供了什麼有效訊號
  2. 它支持哪條主線或提出哪個變數
  3. 這套訊號強、中、弱，為什麼

## 高重疊主線
- 列 2-5 條真正被多系統重複指到的主線
- 每條要寫支持系統與現實意義

## 低重疊但高風險變數
- 列 2-5 條少數訊號，但一旦成立就會改變結局的變數
- 明講它為什麼不能忽略

## 矛盾點
- 列出主要矛盾
- 解釋最像什麼現實情境

## subquestion_matrix
對每一個 subquestion 都要列：
- question
- direct_judgment：最直接答案（可帶保留）
- why_main：主理由
- supporting_systems：主要支持系統
- counter_signals：反證或保留點
- confidence：高/中/低
- variable_to_watch：最重要變數
- best_scene_translation：最適合翻成現實畫面的方式

## deep_structure
- essence
- surface_vs_truth
- motive_ranking
- user_blindspot
- risk_source
- path_forecast
- verification_points
- cost_of_no_change

## priority_evidence
列 4-6 條最值得第二輪展開的證據，每條都要包含：
- 原始資料引用或摘要
- 這代表什麼
- 跟哪個 subquestion 最相關
- 信心（高/中/低）
- 適合放在第幾段講（1/2/3/4/5/6）
- 最適合翻成人話的方向
- 它主要回答的是：本質 / 動機 / 風險 / 路徑 / 驗證 / 代價 / 某個子題直答

## evidence_path
- 用 4-6 步寫出最合理的講述順序
- 每一步都要包含：
  - 先講哪個證據
  - 這一步要拆什麼錯覺或回答哪個子題
  - 下一步怎麼接
  - 這一步最重要的一句人話
  - 最後導向哪個結論

## 時間線
- 只寫資料裡推得出的轉折節奏
- 寫成事件感，不要只報月份

## 這個人的性格盲點
## 核心矛盾 (core_tension)
## 不想聽的真話 (hidden_truth)
## 整體方向

═══ 品質要求 ═══
- 每一句都要有資訊密度
- 不可反覆換句話重說
- 不可只講命理語言
- 要讓第二位說話者拿到後，可以直接逐題回答，再講故事、人物、阻力、代價，而不是再自己重猜一次`;

const STEP2_PROMPT = `你不是寫手，也不是摘要器。

你是「七維交集仲裁官」。
你的任務不是把案件推理稿寫得漂亮，而是把七維資料真正仲裁成可以落地的結構判斷。

═══ 核心原則 ═══
- 七套都要納入，不可因為某套字少就忽略，也不可因為某套字多就帶風向。
- 你只看：重疊度、明確度、可驗證性、是否能改變結果。
- 主線由「多系統重疊最多的象徵」決定。
- 少數訊號若足以翻盤，列為高風險變數，不可刪掉。
- 矛盾不是錯誤，是不同條件下的分支劇本。
- 所有題型都要拆到：本質 / 驅動因素 / 角色動力 / 阻力層 / 路徑 / 驗證點 / 誤判點 / 不改代價。

═══ 題型通則：所有方向都要深入 ═══
不管題目是感情、工作、財務、人際、家庭、健康、自我狀態、合作、搬遷、考試、創業、官司、學習，都要做到：
1. 表面問題是什麼
2. 真正核心在問什麼
3. 事件本質更像哪一種局
4. 主要驅動因素排序
5. 角色動力：誰在推、誰在撐、誰在拖、誰在逃、誰在誤判
6. 阻力分層：內在 / 外在 / 關係 / 時機 / 資源 / 制度 / 責任
7. 機會分層：短期窗口 / 中期承接 / 長期可持續性
8. 劇本分支：主線 / 次線 / 翻車線
9. 驗證點：接下來看什麼最能證明答案
10. 誤判點與不改代價

═══ 題型附則 ═══
若涉及他人（感情、合作、主管、同事、家人、客戶、競爭者）：
- 必須判斷對方靠近/施壓/合作/對抗的主要心態排序
- 必須判斷這個人是助力型、消耗型、條件交換型、觀望試探型、壓力型、過渡型、還是真正可長期型

若是工作/事業/合作/創業：
- 必須拆清楚是位置不對、節奏不對、方法不對、權責不清、制度卡住、資源不足、現金流問題、判斷失真，還是短期有機會但長期接不住

若是財務/副業/投資：
- 必須拆清楚是收入來源、變現效率、風險控制、現金流、合作依賴、貪快成本、長短期結構失衡哪一種

若是人際/家庭：
- 必須拆清楚權力結構、情緒債、誰在索取、誰在忍耐、誰在拖著不表態

若是健康/狀態：
- 不做醫療診斷
- 只拆狀態結構、透支來源、慣性失衡、先停什麼、觀察什麼變化

═══ 你的輸出目的 ═══
你要產出一份「仲裁結果 JSON」，讓最後一位說話者不必再猜。
最後一位說話者只能負責：人設、節奏、場景、收束。
所以你這一步必須把真正深度判斷做完。

═══ 輸出格式 ═══
只回 JSON，不加 markdown，不加註解：
{
  "topic": "題型",
  "surface_question": "表面問題",
  "core_need": "真正核心需求",
  "essence": "這件事本質更像什麼局",
  "surface_vs_truth": "表面看起來像什麼，實際更像什麼",
  "direct_verdict": "一句話直判，帶條件也可以",
  "confidence": "高/中/低",
  "mainline": [
    {"point":"主線判斷","why":"為什麼","systems":["八字","紫微斗數"],"confidence":"高"}
  ],
  "riskline": [
    {"point":"主要風險","why":"為什麼","systems":["梅花易數","塔羅"],"severity":"高"}
  ],
  "variables": [
    {"point":"關鍵變數","trigger":"何時成立","impact":"會改變什麼"}
  ],
  "driver_ranking": [
    {"driver":"主要驅動因素或對方心態","rank":1,"why":"排序理由"}
  ],
  "role_dynamics": {
    "push":"誰在推進",
    "pull":"誰在保留",
    "drag":"誰在拖延或拉扯",
    "blindspot":"誰最可能誤判什麼"
  },
  "obstacle_layers": {
    "internal": ["內在阻力"],
    "external": ["外在阻力"],
    "relationship": ["關係阻力"],
    "timing": ["時機阻力"],
    "resource": ["資源/制度/責任阻力"]
  },
  "opportunity_layers": {
    "short_term": ["短期可用窗口"],
    "mid_term": ["中期承接條件"],
    "long_term": ["長期是否站得住"]
  },
  "scenario_tree": {
    "main_path": {"title":"主線劇本","path":["事件如何演進"],"result":"最可能結果"},
    "secondary_path": {"title":"次線劇本","path":["另一條可能路徑"],"result":"次可能結果"},
    "failure_path": {"title":"翻車劇本","path":["若誤判會怎麼走"],"result":"最容易付出的代價"}
  },
  "subquestion_answers": [
    {
      "id":"q1",
      "question":"子題",
      "direct_answer":"直接答案",
      "depth_answer":"更深一層的本質回答",
      "supporting_logic":"主理由",
      "supporting_systems":["八字","塔羅"],
      "counter_signals":["反證或保留"],
      "confidence":"高/中/低",
      "what_it_really_means":"翻成人話後代表什麼"
    }
  ],
  "verification_points": ["未來觀察點"],
  "misjudgments": ["使用者最容易看錯的點"],
  "cost_of_no_change": ["如果不改最可能付出的代價"],
  "action_priorities": ["先做什麼，再做什麼"],
  "final_focus": ["最後成文一定要講深的切口"],
  "for_writer": {
    "must_answer": ["最後成文必講的直答"],
    "must_deepen": ["最後成文必須挖深的層"],
    "must_not_do": ["不可重複，不可雞湯，不可只講表面"]
  }
}

繁體中文。資訊密度高。不可空泛。`;

function safeString(v) { return v == null ? '' : String(v).trim(); }
function hashString(input) { let hash = 0; const s = safeString(input); for (let i = 0; i < s.length; i++) { hash = ((hash << 5) - hash) + s.charCodeAt(i); hash |= 0; } return String(Math.abs(hash)); }
function buildPersonSignature(payload) { const parts = [safeString(payload?.name), safeString(payload?.birth), safeString(payload?.gender)].filter(Boolean); if (!parts.length) return 'anon'; return 'sig_' + hashString(parts.join('|')); }

async function callAI(env, system, userMessage, maxTokens, temp, model) {
  const useModel = model || 'claude-sonnet-4-20250514';
  const resp = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: useModel, max_tokens: maxTokens, temperature: temp, system: system, messages: [{ role: 'user', content: userMessage }] }),
  });
  if (!resp.ok) { const e = await resp.text(); throw new Error('Anthropic ' + resp.status + ': ' + e); }
  const data = await resp.json();
  return { text: data.content?.[0]?.text || '', usage: data.usage };
}

function parseJSON(raw) {
  let c = String(raw || '').trim();
  if (!c) return {};
  if (c.startsWith('```')) c = c.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
  return JSON.parse(c);
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

  const systems = p.systems || p.systemPayloads || {};
  const sysMap = [
    ['八字', systems.bazi],
    ['紫微斗數', systems.ziwei],
    ['梅花易數', systems.meihua],
    ['塔羅', systems.tarot],
    ['西洋占星', systems.natal || systems.western],
    ['吠陀占星', systems.vedic || systems.jyotish],
    ['姓名學', systems.name],
  ];
  sysMap.forEach(([name, sp]) => {
    const block = renderSystemPayload(name, sp);
    if (block.length) lines.push(...block);
  });

  if (p.consensus || p.crossSystem || p.crossSummary) {
    const cs = p.consensus || p.crossSystem || p.crossSummary;
    lines.push('【跨系統共識層】');
    lines.push(renderValue(cs));
    lines.push('');
  }

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

  if (p.symbolicEvidence) {
    lines.push('【七維象徵證據庫】');
    lines.push(renderValue(p.symbolicEvidence));
    lines.push('');
  }
  if (p.storySkeleton) {
    lines.push('【主線骨架】');
    lines.push(renderValue(p.storySkeleton));
    lines.push('');
  }
  if (p.caseFramework) {
    lines.push('【案件深挖框架】');
    lines.push(renderValue(p.caseFramework));
    lines.push('');
  }
  if (p.apiMeta || p.meta) {
    lines.push('【分析附註】');
    lines.push(renderValue(p.apiMeta || p.meta));
    lines.push('');
  }

  return lines.join('\n');
}

export default {
  async fetch(request, env) {
    const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' };
    if (request.method === 'OPTIONS') return new Response(null, { headers: cors });
    if (request.method !== 'POST') return Response.json({ error: '只接受 POST' }, { status: 405, headers: cors });
    try {
      const body = await request.json();
      const payload = body.payload;
      if (!payload || !payload.question) return Response.json({ error: '缺少 payload' }, { status: 400, headers: cors });
      let isAdmin = !!(body.admin_token && body.admin_token === env.ADMIN_TOKEN);
      if (!isAdmin && env.RATE_KV) {
        const today = new Date().toISOString().slice(0, 10);
        const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
        const key = `rate:${today}:${buildPersonSignature(payload)}:${ip}`;
        if (await env.RATE_KV.get(key)) return Response.json({ error: '今日解讀已使用', code: 'RATE_LIMITED' }, { status: 429, headers: cors });
        await env.RATE_KV.put(key, '1', { expirationTtl: 86400 });
      }

      const step0Message = `原問題：${payload.question}\n\nfocusType: ${payload.focusType || 'general'}\nname: ${payload.name || ''}`;
      const step0 = await callAI(env, STEP0_PROMPT, step0Message, 1200, 0.1);
      let questionPlan;
      try {
        questionPlan = parseJSON(step0.text);
      } catch (_) {
        questionPlan = {
          topic: payload.focusType || 'general',
          surface_question: payload.question,
          core_need: '想知道這件事到底怎麼看，並得到可直接使用的判斷',
          subquestions: [{ id: 'q1', question: payload.question, type: '綜合判定', priority: 1, is_primary: true, implicit_need: '' }],
          answer_strategy: ['先直接回答主題，再解釋原因，最後補充變數與驗證點']
        };
      }

      const rawDataMessage = buildUserMessage(payload, questionPlan);
      const step1 = await callAI(env, STEP1_PROMPT, rawDataMessage, 7000, 0.18);
      const analysisNotes = step1.text;

      const ft = { love:'感情', career:'事業', wealth:'財運', health:'健康', relationship:'人際關係', family:'家庭', general:'整體運勢' }[payload.focusType] || '整體運勢';
      const step2Message = `案件當事人：${payload.name || '這位朋友'}，${payload.gender || ''}，${payload.birth || ''}

原問題：${payload.question}（${ft}）

問題拆解：
${formatQuestionDecomposition(questionPlan)}

${payload.compositeScore ? '七套綜合分數：' + payload.compositeScore + '/100' : ''}
${payload.verdict ? '整體方向：' + payload.verdict : ''}

以下是第一輪偵查稿：
---
${analysisNotes}
---

請你現在做真正的交集仲裁。
要求：
1. 把所有子題逐題仲裁，不可漏。
2. 所有方向都要深入到：本質、驅動因素、角色動力、阻力層、路徑、驗證點、誤判點、不改代價。
3. 若題目涉及他人，要明講對方/他方/合作方/主管/家人/客戶等的主要心態或驅動因素排序。
4. 不可只講「有沒有」，一定要講「屬於什麼型、為什麼、會怎麼走、卡在哪」。
5. 主線看多系統重疊；少數但能翻盤的訊號列到 variables / riskline。
6. 最後一位說話者只負責成文，所以你必須把真正深度判斷做完。`;

      const step2 = await callAI(env, STEP2_PROMPT, step2Message, 5200, 0.2);
      let arbitration;
      try {
        arbitration = parseJSON(step2.text);
      } catch (e) {
        arbitration = {
          topic: ft,
          surface_question: payload.question,
          core_need: '想知道這件事真正怎麼看，和接下來最可能怎麼走',
          essence: '',
          surface_vs_truth: '',
          direct_verdict: '',
          confidence: '中',
          subquestion_answers: (Array.isArray(questionPlan?.subquestions) ? questionPlan.subquestions : []).map((sq, idx) => ({
            id: sq.id || ('q' + (idx + 1)),
            question: sq.question || payload.question,
            direct_answer: '',
            depth_answer: '',
            supporting_logic: '',
            supporting_systems: [],
            counter_signals: [],
            confidence: '中',
            what_it_really_means: ''
          })),
          final_focus: ['逐題直答', '主線與風險分開', '把誤判點與代價講清楚'],
          for_writer: {
            must_answer: ['先正面回答子題'],
            must_deepen: ['把本質、驅動因素、阻力與路徑講透'],
            must_not_do: ['不可重複', '不可只講表面', '不可雞湯化']
          }
        };
      }

      const STEP3_PROMPT = `你是「靜月」——真的看得懂人與局的人。

你現在不是做仲裁，而是做最後成文。
前一位已經把深度判斷做完，所以你不能再退回表面總結。你要把已經仲裁出的主線、風險、變數、角色動力、誤判點、代價，寫成一篇真正像人在對話的完整解讀。

═══ 絕對規則 ═══
- 終稿禁止出現任何命理或占卜術語，也不要出現模型、系統、分析、盤、牌、星、宮、流年、能量這類字。
- 你不是寫散文。你是在把事情講透。
- 要先逐題正面回答，再展開主線。
- 不能只重複同一件事。每段都要推進新的資訊。
- 主線、風險、變數要分開寫，不可混成一鍋。
- 若涉及他人，要把對方靠近/合作/施壓/觀望的心態講清楚。
- 所有方向都要做到：本質、驅動、角色動力、阻力、路徑、驗證點、誤判點、不改代價。
- 句型要有變化，要像固定靈魂的人在說話，不是模板機器。

═══ 建議結構 ═══
1. 開頭一句打中核心
2. 逐題直答（若有多題，用 1. 2. 3.）
3. 主線真相：這件事本質更像什麼
4. 人與局：誰在推、誰在撐、誰在拖、誰在誤判
5. 風險與變數：哪些不能忽略
6. 接下來怎麼演：短中期最可能路徑
7. 驗證點與不改代價
8. 最後收一句，但不是口號

═══ 輸出格式 ═══
回傳 JSON（不加 markdown）：
{
  "directAnswer": "一句話直白回答。18字以內。像人話，不像標題。",
  "answer": "完整回答。1000-1700字。自然段落，用 \n\n 分段。前半段必須逐題正答。全篇零術語，有畫面，有推進，不能重複。",
  "closing": "最後一句。像看清後留下的一句話，不像口號。12-26字。"
}

繁體中文，台灣口語。自然。直接。不要演。不要裝神祕。`;

      const step3Message = `來找你的人叫${payload.name || '這位朋友'}，${payload.gender || ''}，${payload.birth || ''}。

問的是：「${payload.question}」（${ft}）

問題拆解如下：
${formatQuestionDecomposition(questionPlan)}

第一輪偵查重點：
---
${analysisNotes}
---

第二輪交集仲裁結果（這份才是你必須吃透的核心）：
${JSON.stringify(arbitration, null, 2)}

請把上面真正講成人話。
要求：
1. 先逐題直答，再展開主線與支線。
2. 一定要講到本質、驅動因素、角色動力、阻力、路徑、驗證點、誤判點、不改代價。
3. 若涉及他人，一定要交代對方/他方的主要心態或驅動因素。
4. 好的要講，壞的也要講，但不要平均化。
5. 不要重複同一個點。每段都要有新資訊。`;

      const step3 = await callAI(env, STEP3_PROMPT, step3Message, 5200, 0.72);
      let result;
      try { result = parseJSON(step3.text); } catch(e) { result = { answer: step3.text }; }

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

      const totalUsage = isAdmin ? {
        input_tokens: (step0.usage?.input_tokens||0) + (step1.usage?.input_tokens||0) + (step2.usage?.input_tokens||0) + (step3.usage?.input_tokens||0),
        output_tokens: (step0.usage?.output_tokens||0) + (step1.usage?.output_tokens||0) + (step2.usage?.output_tokens||0) + (step3.usage?.output_tokens||0),
        step0: { in: step0.usage?.input_tokens||0, out: step0.usage?.output_tokens||0 },
        step1: { in: step1.usage?.input_tokens||0, out: step1.usage?.output_tokens||0 },
        step2: { in: step2.usage?.input_tokens||0, out: step2.usage?.output_tokens||0 },
        step3: { in: step3.usage?.input_tokens||0, out: step3.usage?.output_tokens||0 },
      } : undefined;
      return Response.json({
        result,
        questionPlan: isAdmin ? questionPlan : undefined,
        analysisNotes: isAdmin ? analysisNotes : undefined,
        arbitration: isAdmin ? arbitration : undefined,
        usage: totalUsage
      }, { headers: cors });

    } catch (err) {
      console.error('Worker error:', err);
      return Response.json({ error: '伺服器錯誤', detail: err.message }, { status: 500, headers: cors });
    }
  },
};
