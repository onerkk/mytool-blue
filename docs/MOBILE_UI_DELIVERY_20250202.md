# 手機版 UI 與塔羅參與判斷 — 改動交付（2025-02-02）

## 0) 定位結果（避免修錯檔）

### 全文搜尋結果

| 搜尋字串 | 所在檔案與行區段 |
|----------|------------------|
| **蝦皮逛逛、賣貨便** | `index.html` 58-62（nav `.shop-btn`）、68-76（`.floating-btn`）、908-915（`.rec-btn` 區塊）；`js/main.js` 292；`css/result-section-override.css` 28 |
| **未參與判斷** | `js/explainability-layer.js` 268（`evidenceListForDisplay.push('未參與判斷的項目：' + ...)`）；`js/crystal-advice-synthesizer.js` 74, 88-90 |
| **直接回答** | `js/explainability-layer.js` 3, 168-201, 234；`js/answer-synthesizer.js` 4, 91-101；`engine/fusionEngine.js` 323；`js/main.js` 495, 3685, 4142, 5000, 5016；`index.html` 664（`<h4>直接回答</h4>`）；`css/responsive.css` 2253 |
| **綜合分析結果、個人資料** | `index.html` 103（`#input-section` 內 `<h2>個人資料輸入</h2>`）、652（`#result-section` 內 `<h2>綜合分析結果</h2>`） |

### 實際控制手機版的 CSS 檔與生效 selector

| 檔案 | 手機寬度下生效的 selector（摘要） |
|------|-----------------------------------|
| **css/responsive.css** | `@media (max-width: 768px)`、`@media (max-width: 480px)` 內：`.section`、`#result-section`、`.nav-shop-buttons`、`.shop-btn`、`.floating-btn`、`.form-row`、`.direct-answer` 等 |
| **css/main.css** | `@media (max-width: 768px)`（約 4299 行）、`@media (max-width: 480px)`（約 4362 行）：`.nav-shop-buttons`、`.shop-btn`、`.recommendation-buttons`、`.floating-btn` |
| **css/result-section-override.css** | `@media (max-width: 768px)`：`#result-section` 的 padding、safe-area |
| **css/mobile-fix.css** | `@media (max-width: 768px)`、`@media (max-width: 480px)`：與 responsive/result-section 同步（section clamp、#result-section padding/safe-area、.dayun-timeline touch-action、480px 蝦皮/賣貨便左右排） |
| **css/ios-fixes.css** | iOS 相關修正 |

---

## 修改檔案清單（逐檔）與改動摘要

### 1) 手機版「蝦皮逛逛 / 賣貨便」改為左右排

| 檔案 | 改動摘要 |
|------|----------|
| **css/main.css** | `@media (max-width: 480px)`：`.nav-shop-buttons` 改為 `flex-direction: row !important`、`flex-wrap: nowrap`、`gap: 0.5rem`；`.nav-shop-buttons .shop-btn` 改為 `flex: 1 1 0`、`min-width: 0`、`white-space: nowrap`、`text-overflow: ellipsis`；`.recommendation-buttons` 改為 `grid-template-columns: repeat(2, 1fr)`；`.rec-btn` 加 `min-width: 0`，`.rec-btn .btn-title` 加 `white-space: nowrap; overflow: hidden; text-overflow: ellipsis`。 |

**Before→After**：原本 480px 下 `.nav-shop-buttons` 為 `flex-direction: column`、`.recommendation-buttons` 在 768px 為 `grid-template-columns: 1fr`；改為 480px 下兩顆按鈕左右並排、等寬約 50%、不換行，結果頁推薦區蝦皮/賣貨便同一行。

---

### 2) 「分析結果」與「個人資料」中間空白縮小

| 檔案 | 改動摘要 |
|------|----------|
| **css/responsive.css** | `@media (max-width: 480px)`：`.section` 改為 `padding: clamp(12px, 2.5vw, 18px)`、`margin-bottom: clamp(12px, 2.5vw, 18px)`，取代固定 0.75rem/1rem。 |
| **css/result-section-override.css** | `#result-section` 的 `padding` 改為 `clamp(12px, 2.5vw, 18px)`；768px 下同樣使用 clamp，避免 48/64px 大空白。 |
| **css/mobile-fix.css** | 手機同步：768px 下 `.section`、`#result-section` 改為 clamp 與 safe-area；480px 下同值 + 蝦皮/賣貨便左右排、`#result-section` 底部 `max(100px, 80px + env(safe-area-inset-bottom))`。 |

**Before→After**：section 間距由固定 rem 改為 clamp(12px, 2.5vw, 18px)，手機不再出現「空半頁」。

---

### 3) 系統敘述太長：手機預設簡化，細節可展開

| 檔案 | 改動摘要 |
|------|----------|
| **index.html** | 「直接回答」區塊的 `<p class="answer-text">` 加 class `answer-text-summary`；「影響因子」區塊改為 `<details class="details-expand details-factors" id="details-factors"><summary class="details-summary" id="factors-summary">…</summary><ul id="answer-factors-list"></ul></details>`；「3 條關鍵建議」改為 `<details class="details-expand details-suggestions" id="details-suggestions"><summary id="suggestions-summary">…</summary><ol id="answer-suggestions-list"></ol></details>`。 |
| **css/result-section-override.css** | 新增 `.details-expand`、`.details-summary` 樣式；`@media (max-width: 768px)` 下 `.answer-text-summary` 使用 `-webkit-line-clamp: 4` 限制行數。 |
| **js/main.js** | 在 `renderProbabilityDashboard` 內：填入影響因子後，設定 `factors-summary` 為前兩條因子摘要 +「…（點擊展開完整）」；新增 `syncDetailsOpen()`：`window.innerWidth > 768` 時對 `#details-factors`、`#details-suggestions` 設 `open`，否則移除 `open`；初次呼叫並綁定 `window.addEventListener('resize', syncDetailsOpen)`。 |

**Before→After**：影響因子／建議由整段列表改為 details/summary；手機預設收合（無 `open`），桌機由 JS 設 `open`；第一屏可見答案、機率與重點建議。

---

### 4) 「直接回答」白話 + 少術語 + 原因一句

| 檔案 | 改動摘要 |
|------|----------|
| **js/explainability-layer.js** | `buildDirectAnswerPlain`：結論一句（有機會/宜保守/偏有阻力等）+ 原因一句（白話，如「今年運勢對你壓力較大、助力有限」「今年運勢對你有助益」）；移除「日主偏弱」「喜X、忌Y」「身強可任財官」等術語；輸出格式改為 `直接回答：{結論} 原因：{原因}。（整體機率約 X%）`。 |

**Before→After**：原本「八字因為日主偏弱，流年又剋日主、生扶不足，所以…」改為「有機會但不穩定，宜小步試。 原因：今年運勢對你壓力較大、助力有限。（整體機率約 X%）」；術語僅保留於「展開詳解」區塊。

---

### 5) 修正「跨系統證據：塔羅牌未參與判斷」錯誤標示

| 檔案 | 改動摘要 |
|------|----------|
| **js/explainability-layer.js** | `buildAll` 內塔羅判斷改為：先算 `tarotParticipated = fusionData.tarot && (hasCards || hasAnalysis)`，其中 `hasCards = Array.isArray(cards) && cards.length > 0`，`hasAnalysis = analysis && (positions.length > 0 || overall != null || overallProbability != null || fortuneScore != null)`；若 `tarotParticipated` 為 true，則呼叫 `buildTarotExplainability`，有 `text` 則推「塔羅：…」，否則推「塔羅：抽牌已完成，詳解載入中。」；僅在 `!tarotParticipated` 時才 `missing.push('塔羅')`。 |

**Before→After**：原本僅以 `fusionData.tarot && (fusionData.tarot.analysis \|\| fusionData.tarot.cards)` 且 `buildTarotExplainability` 有回傳 `text` 才視為參與，否則一律「未參與」；改為只要抽牌完成且結果物件存在（有 cards 或 analysis 任一可辨識資料）即視為已參與，缺詳解時顯示「抽牌已完成，詳解載入中」而不歸入 missing。

---

### 6) 影片中 UI 跑掉：viewport / overflow 修正

| 檔案 | 改動摘要 |
|------|----------|
| **css/main.css** | 全站：`html { overflow-x: hidden }`；`html, body` 加 `overflow-x: hidden !important`；`#page-scroll.page-scroll` 的 `height` 改為 `100dvh` + `100vh` fallback；`body` 的 `min-height` 改為 `100dvh` + `100vh` fallback。 |
| **css/responsive.css** | `@media (max-width: 480px)`：`#result-section` 的 `padding-bottom` 改為 `max(100px, env(safe-area-inset-bottom, 0) + 80px)`；新增 `.dayun-timeline { touch-action: pan-x; -webkit-overflow-scrolling: touch }`；`.floating-buttons` 的 `bottom`/`right` 改為 `max(15px, calc(15px + env(safe-area-inset-bottom, 0)))` 等，避免 FAB 被 safe-area 裁掉。 |
| **css/mobile-fix.css** | 手機同步：768px 下 `#result-section` 的 padding 改為 clamp、padding-bottom 改為 `max(150px, 150px + env(safe-area-inset-bottom))`；新增 `.dayun-timeline { touch-action: pan-x }`；480px 區塊新增 section/result-section clamp、nav-shop-buttons 左右排、recommendation-buttons 兩欄、result-section 底部 safe-area。 |

**Before→After**：全站避免橫向溢出；主要捲動區與 body 使用 100dvh（+ 100vh fallback）減少地址列伸縮造成的跳動；浮動按鈕與結果區底部使用 safe-area inset；大運流年橫向滑動用 pan-x，不吃掉垂直滑動。

---

## 驗收方式

| 項目 | 裝置/瀏覽器 | 頁面/操作 | 預期行為 |
|------|-------------|----------|----------|
| **1) 蝦皮/賣貨便左右排** | Android Chrome、Samsung Internet，寬度 ≤480px | 頂部 nav、結果頁推薦區 | 兩顆按鈕左右並排、等寬約 50%、不換行；橫豎切換不跑版；與浮動 FAB 共存不擋內容。 |
| **2) 區塊間距** | 手機 | 結果頁上下滑動、個人資料與綜合分析結果之間 | 區塊間距為 clamp 型、無「空半頁」；無 100vh/min-height:100vh 造成的大塊空白。 |
| **3) 摘要+展開** | 手機、桌機 | 結果頁「直接回答」「影響因子」「3 條建議」 | 手機第一屏可見答案、機率、重點建議；影響因子/建議為 details，手機預設收合、桌機預設展開；橫豎切換後 details 的 open 狀態依寬度更新。 |
| **4) 直接回答** | 任意 | 結果頁「直接回答」區 | 結論一句（能/不能、偏高/偏低、有機會但條件）+ 原因一句（白話）；無身強身弱、喜忌神、體用、四化等術語。 |
| **5) 塔羅參與** | 任意 | 完成塔羅抽牌後進入結果頁 | 「塔羅」一律顯示參與，且能列出至少 1 個塔羅證據點；若缺詳解則顯示「塔羅：抽牌已完成，詳解載入中。」；僅未抽牌/無資料時才出現「未參與判斷的項目：塔羅」。 |
| **6) viewport/overflow** | Android Chrome、Samsung Internet | 全站捲動、結果頁、大運流年橫滑、浮動按鈕 | 無橫向溢出、不卡不跳；浮動按鈕不被 safe-area 裁掉；大運流年可橫滑、垂直滑動正常。 |

**Fallback/相容性**：`100dvh` 不支援的瀏覽器會使用 `100vh`；Samsung Internet 與 Chrome 均以 `env(safe-area-inset-*)` 與 `touch-action: pan-y` / `pan-x` 處理安全區域與手勢，避免鎖住捲動。
