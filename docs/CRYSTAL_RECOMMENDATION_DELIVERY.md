# 水晶建議配置重構交付摘要

## 0. 目標輸出格式（已實作）

「水晶建議配置」區塊：每顆水晶一張卡片，每張卡片包含：

- **推薦結論**：強推/可選/不建議 + 一句話理由  
- **跨系統證據**：八字/紫微/梅花/塔羅/姓名學至少命中 2 個系統（缺資料時標註「缺…資料」）  
- **配戴方式**：左手/右手、手鍊/項鍊、白天/晚上、工作/睡覺等（依該水晶 `wear` 與風險調整）  
- **注意事項**：至少 2 點，取自該水晶 `cautions`/`contraindications`，非統一模板  
- **替代方案**：同意圖、較低強度 1～2 顆  

嚴禁：同一套配戴/注意事項套用所有水晶、跨 intent 禁止詞（如財運題出現桃花/復合）。

---

## 1. 修改檔案清單與改動摘要

| 檔案 | 改動摘要 |
|------|----------|
| **data/crystals_kb.js** | 新增。Crystal Knowledge Base：20+ 顆水晶結構化（id, name, elements, intents, intensity, wear, cautions, contraindications, synergy, evidenceMap）。 |
| **js/crystal-evidence-normalizer.js** | 新增。Multi-System Evidence Normalizer：fusionData（八字/紫微/梅花/塔羅/姓名學）→ 標準 evidence items（system, signal, direction, strength, tags, timeHorizon）與 missing[]。 |
| **js/crystal-recommender.js** | 新增。Crystal Scoring & Selection：scoreCrystal(crystal, evidence, parsedQuestion)、意圖加權、強度控管、選 Top N + 備選。 |
| **js/crystal-advice-synthesizer.js** | 新增。Per-Crystal Explanation Generator：每顆專屬卡片（conclusion, evidenceText, wearText, cautionsText, alternatives）；證據不足時補「缺完整命理資料」；注意事項以「。」分隔以利測試辨識 2 點以上。 |
| **js/crystal-output-guard.js** | 新增。Anti-Generic Guard：FORBIDDEN_BY_INTENT、checkGeneric（配戴/注意事項重複率）、guardOffTopic、stripOffTopicText。 |
| **js/crystal-recommendation.js** | 修改。新增 getCrystalRecommendationCards()，串接 KB → Normalizer → Recommender → Synthesizer → OutputGuard；保留原 getCrystalRecommendation 相容。 |
| **index.html** | 修改。水晶區塊改為 crystal-cards-container 動態卡片；新增 ?test=crystal 時載入 tests/crystal_recommendation_tests.js 並顯示 PASS/FAIL 區塊。 |
| **js/main.js** | 修改。開運配戴建議改為呼叫 getCrystalRecommendationCards，渲染每顆卡片（badges、推薦結論、跨系統證據、配戴方式、注意事項、替代方案）；無卡片時隱藏新區塊、顯示舊版。 |
| **css/main.css** | 修改。新增 .crystal-cards-container、.crystal-card、.crystal-card-header、.crystal-badge、.crystal-card-section 等樣式。 |
| **tests/crystal_recommendation_tests.js** | 新增。17 題測試（財運/感情/健康/事業/決策/時機）；檢查：每顆卡片跨系統證據≥2 或含「缺」、注意事項至少 2 點、配戴/注意事項非 70% 模板化、無跨 intent 禁止詞。?test=crystal 時自動執行，結果寫入 window.crystalRecommendationTestResult 並在頁尾顯示。 |

---

## 2. 測試方式

- **瀏覽器**：開啟 `index.html?test=crystal`，載入完成後：
  - **Console**：輸出「水晶建議測試 通過 X / 17」及失敗清單（前 5 題）。
  - **頁面**：頁尾固定區塊顯示 PASS/FAIL 統計與失敗（前 5）摘要。
  - **程式**：`window.crystalRecommendationTestResult` 含 `{ total, passed, failed, failures[] }`。

---

## 3. 測試 PASS/FAIL 數字與前 5 個失敗案例

測試需在瀏覽器執行，實際數字以您本機開啟 `index.html?test=crystal` 後之 Console 與 `window.crystalRecommendationTestResult` 為準。

- **預期**：在 fusionData 全為空物件、僅依 KB + 問題意圖選品與 synthesizer 產出下，多數題目應通過（證據欄會出現「缺完整命理資料」、注意事項至少 2 點、配戴依水晶而異、無跨 intent 詞）。
- **若出現失敗**，常見原因：
  1. **跨系統證據不足或未標註缺失**：evidenceText 未含至少 2 個系統名且未含「缺」→ 已透過 synthesizer 在證據不足時補「缺完整命理資料」緩解。
  2. **注意事項不足 2 點**：該水晶 cautions 僅 1 條且 fallback 未補足 → synthesizer 已對單一 caution 補 contraindications 或強度/睡覺提醒。
  3. **配戴/注意事項模板化**：多張卡片配戴或注意事項文字 70% 以上相同 → 需 KB 內 wear/cautions 更多差異化。
  4. **文案含跨 intent 禁止詞**：財運題出現桃花/復合等 → OutputGuard 應已 strip；若仍出現可加強 FORBIDDEN_BY_INTENT 或 strip 邏輯。

**前 5 個失敗案例格式（由測試輸出）**：  
每筆為 `{ q: "問題", reason: "失敗原因", output: "第一張卡片水晶名" }`，失敗原因為上述之一或組合。

---

## 4. 限制與備註

- 未使用任何外部 AI/API，僅規則、資料表、加權與模板。
- 缺資料時仍可推薦，證據欄會標註「缺…資料」或「缺完整命理資料」。
- 強度≥4 且證據不足時，recommender 會降權並可標 riskFlags，synthesizer 會加「建議短時段或搭配白水晶」等配戴提醒。
