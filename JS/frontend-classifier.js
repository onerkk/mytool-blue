// ═══════════════════════════════════════════════════════════════
// frontend-classifier.js  v69.2.0  (2026-05-07)
// ═══════════════════════════════════════════════════════════════
// 目的：把問題分類從 worker 後端搬到前端
//
// 兩段式分類：
//   ① 規則式正則分類（classifyFocusType）— 0 成本、< 1ms
//   ② 規則未命中 → Haiku 智能分類（classifyWithHaiku）— 走 worker 的 /classify endpoint
//
// 輸出：{ qType, qTypeSource, qTypeRaw }
//   qType        : 13 種分類之一 + 'general'
//   qTypeSource  : 'regex' | 'haiku' | 'fallback'
//   qTypeRaw     : Haiku 原始回傳（debug 用，regex 路徑為 null）
//
// 13 種 qType（與 worker.js refineFocusType 對齊，順序＝優先級）：
//   lifelesson / reconcile / thirdparty / karmic / spiritual /
//   timing / decision / love / career / wealth / health /
//   relationship / family / general
// ═══════════════════════════════════════════════════════════════

(function(global){
  'use strict';

  var WORKER_URL = global.AI_WORKER_URL || 'https://jy-ai-proxy.onerkk.workers.dev';

  // ─────────────────────────────────────────────────────────
  // ① 規則式分類（與 worker.js line 14489 refineFocusType 1:1 對齊）
  // ─────────────────────────────────────────────────────────
  function classifyFocusType(question, originalType) {
    var q = String(question || '').trim();
    if (!q) return { qType: originalType || 'general', qTypeSource: 'fallback', qTypeRaw: null };

    // 第一層：lifelesson — 跨多主題的最高優先級
    var isLifeLesson = /今生課題|這輩子.*學|這輩子.*功課|人生課題|人生使命|生命意義|我為什麼活|我的天命|我的使命|靈魂任務|此生.*目的|此生.*學|此生.*功課|為何而活|活著.*意義|人生.*目的|人生.*意義|生命.*功課|這一世.*學|轉世.*功課|靈魂藍圖|生命藍圖|為什麼.*一直|為什麼.*總是|為什麼.*老是|為何.*重複|一直遇到同樣|重複.*模式|靈魂.*功課|我的功課/.test(q);
    if (isLifeLesson) return { qType: 'lifelesson', qTypeSource: 'regex', qTypeRaw: null };

    // 第二層：reconcile（復合）
    var isReconcile = /復合|破鏡重圓|和好|挽回|再.*一次|回到我身邊|還會回來嗎|有.*機會.*回來|回到從前|機會.*回到|重修舊好|再續前緣|前任.*回來/.test(q);
    if (isReconcile) return { qType: 'reconcile', qTypeSource: 'regex', qTypeRaw: null };

    // 第三層：thirdparty（第三者/外遇）
    var isThirdParty = /第三者|小三|外遇|出軌|劈腿|偷吃|介入|插足|曖昧對象|備胎/.test(q);
    if (isThirdParty) return { qType: 'thirdparty', qTypeSource: 'regex', qTypeRaw: null };

    // 第四層：karmic（業力/前世）
    var isKarmic = /業力|前世.*緣|前世.*債|前世.*關係|累世|因果.*糾纏|孽緣|冤親|欠債|還債|宿世|前世.*我們|前世.*你我|前世.*他/.test(q);
    if (isKarmic) return { qType: 'karmic', qTypeSource: 'regex', qTypeRaw: null };

    // 第五層：spiritual（靈性/修行）
    if (/靈性|修行|靜心|冥想|高我|內在指引|覺醒|脈輪|頻率|振動|靈魂.*伴侶|雙生火焰|揚升|顯化|吸引力法則/.test(q)) {
      return { qType: 'spiritual', qTypeSource: 'regex', qTypeRaw: null };
    }

    // 第六層：timing（時間題）
    if (/什麼時候|幾月.*會|多久.*才|何時才|等多久|時機到了嗎|快了嗎|還要等多久|大概什麼時候|哪個月|哪一年/.test(q)) {
      return { qType: 'timing', qTypeSource: 'regex', qTypeRaw: null };
    }

    // 第七層：decision（決策題）
    if (/該選|要選|選A還是|二選一|還是.*還是|兩難|抉擇|取捨|猶豫不決|選哪個|該不該/.test(q)) {
      return { qType: 'decision', qTypeSource: 'regex', qTypeRaw: null };
    }

    // 既有六種主題（用戶手動選擇）
    if (originalType && originalType !== 'general') {
      return { qType: originalType, qTypeSource: 'regex', qTypeRaw: null };
    }

    // 第八層：general 內進一步偵測常見問題
    if (/感情|桃花|對象|伴侶|婚姻|戀愛|喜歡|愛情|另一半|正緣|分手|曖昧/.test(q)) return { qType: 'love', qTypeSource: 'regex', qTypeRaw: null };
    if (/工作|事業|職場|升遷|換工作|創業|面試|轉職/.test(q)) return { qType: 'career', qTypeSource: 'regex', qTypeRaw: null };
    if (/財運|投資|賺錢|收入|理財|股票|買房/.test(q)) return { qType: 'wealth', qTypeSource: 'regex', qTypeRaw: null };
    if (/健康|身體|生病|手術|養生/.test(q)) return { qType: 'health', qTypeSource: 'regex', qTypeRaw: null };
    if (/朋友|貴人|小人|人際|合夥|同事|社交/.test(q)) return { qType: 'relationship', qTypeSource: 'regex', qTypeRaw: null };
    if (/家人|父母|子女|手足|兄弟|姊妹|家庭|親子|家裡|爸媽|爸爸|媽媽/.test(q)) return { qType: 'family', qTypeSource: 'regex', qTypeRaw: null };

    // 規則完全沒命中 → 回傳 general，但標 source='unmatched'，呼叫端可選擇是否觸發 Haiku
    return { qType: originalType || 'general', qTypeSource: 'unmatched', qTypeRaw: null };
  }

  // ─────────────────────────────────────────────────────────
  // ② Haiku 4.5 智能分類（規則未命中時觸發）
  //    - 走 worker.js 的 POST /classify endpoint
  //    - 後端用 Haiku 4.5（或 admin 設定的其他模型）分類
  //    - 失敗時 fallback 'general'
  // ─────────────────────────────────────────────────────────
  async function classifyWithHaiku(question, sessionToken) {
    try {
      var resp = await fetch(WORKER_URL + '/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: String(question || ''),
          session_token: sessionToken || null
        })
      });
      if (!resp.ok) {
        return { qType: 'general', qTypeSource: 'fallback', qTypeRaw: null, error: 'http_' + resp.status };
      }
      var data = await resp.json();
      // 預期 worker 回 { qType: 'lifelesson', model: 'haiku-4.5', raw: '...' }
      var validTypes = ['lifelesson','reconcile','thirdparty','karmic','spiritual','timing','decision','love','career','wealth','health','relationship','family','general'];
      var qt = (data && validTypes.indexOf(data.qType) >= 0) ? data.qType : 'general';
      return {
        qType: qt,
        qTypeSource: 'haiku',
        qTypeRaw: data && data.raw ? data.raw : null,
        model: data && data.model ? data.model : null
      };
    } catch (e) {
      return { qType: 'general', qTypeSource: 'fallback', qTypeRaw: null, error: String(e && e.message || e) };
    }
  }

  // ─────────────────────────────────────────────────────────
  // ③ 統一入口：先正則，未命中再 Haiku
  // ─────────────────────────────────────────────────────────
  async function classify(question, originalType, sessionToken) {
    var rule = classifyFocusType(question, originalType);
    // 規則命中（regex / 用戶手動選的非 general）→ 直接回
    if (rule.qTypeSource === 'regex') return rule;
    // 規則未命中 → 觸發 Haiku 智能分類
    if (rule.qTypeSource === 'unmatched') {
      var ai = await classifyWithHaiku(question, sessionToken);
      return ai;
    }
    // fallback
    return rule;
  }

  // 匯出
  global.JyClassifier = {
    classify: classify,                     // 統一入口（async）
    classifyFocusType: classifyFocusType,   // 純規則（sync）
    classifyWithHaiku: classifyWithHaiku,   // 純 AI（async）
    VERSION: 'v69.2.0-2026-05-07'
  };

})(typeof window !== 'undefined' ? window : this);
