# 健康分類路由／模板選擇修正 — 交付說明

## 現象與根因

- **現象**：UI 已選「健康」、問題也在問健康，但 Direct Answer 仍輸出通用八字段落（「請見下方依據…日主乙木…喜神水木」）。
- **根因**：  
  1) 結論主段落曾與「依據」整段一起塞進 Direct Answer 區塊，導致日主/喜忌出現在直接回答裡。  
  2) 健康類別未走專用模板，未強制健康語意（風險面向 + 3 條建議）。

---

## 已做修正

### PHASE 0：Debug log 定位 category

- **`[INPUT]`**：在 main.js「使用者按生成／進結果頁」、組好 fusionData 後：`console.log('[INPUT]', { category: userCategory, questionText })`。
- **`[GEN_ENTER]`**：在 fusionEngine.generateDirectAnswer 入口：`console.log('[GEN_ENTER]', { category: categoryAtEnterNorm, questionText })`。
- **`[TEMPLATE_PICK]`**：在選完 template 後（主路徑與 fallback）：`console.log('[TEMPLATE_PICK]', { category, templateId })`。

**驗收**：選「健康」、問健康相關問題時，三處 category 皆應為 `health`；若任一处為 `undefined` 或 `general`，可依 log 定位是哪一層覆蓋。

---

### PHASE 1：category 傳遞與 guard

- **存讀一致**：category 來源為 `userData.questionType`（Step1 選的 value），HTML 選項為英文 enum：`love` / `career` / `wealth` / `health` / `general` / `relationship` / `family` / `other`。生成時以同一 key 傳入 fusion：`questionType: userCategory`。
- **normalizeCategory**：保留 `ALLOWED_CATEGORIES`，僅將 `finance`→`wealth`、`other`→`general`，其餘若在清單內則原樣回傳，**不**將 health 靜默改成 general。
- **Guard**：Step1 未選問題類型時，結果頁不呼叫 fusion、顯示「請選擇問題類型」；已有既有邏輯支援。

---

### PHASE 2：分類路由與健康專用模板

- **健康硬路由**：在 generateDirectAnswer 內，當 `categoryForLog === 'health'` 時，**一律**使用 `buildHealthConclusion(...)` 產出結論段落，**禁止**使用通用 `buildConclusionByType` 或任何會產出「日主／喜神／忌神」的通用模板。
- **healthTemplatePool**：在 fusionEngine 內新增 **HEALTH_TEMPLATE_POOL**（10 組），每組含：  
  - 一句結論（今年健康偏穩／有壓力／需保守／尚可等）  
  - 風險面向（如：作息、睡眠、腸胃、發炎、筋骨、身心、飲食、健檢等）  
  - 3 條可執行建議（作息／飲食／運動／健檢／壓力管理／就醫等）。  
- **buildHealthConclusion(probVal, question, topFactors, difficultyLevel, evidenceCount, synSuggestions)**：  
  - 依 seed 從 HEALTH_TEMPLATE_POOL 選一組。  
  - 輸出格式：`結論句 + 可留意面向：… + 建議：（1）…；（2）…；（3）…。`  
  - 若 `evidenceCount < 2`，前綴「多維證據不足（未抽塔羅或未起卦），以下為先天結構推估。」  
- **category_strategy.js**：health 的 `templatePool`、`suggestionPool` 已擴充，與上述健康專用邏輯一致。

---

### PHASE 3：健康專屬輸出結構

- **Direct Answer 固定結構**（僅健康類）：  
  - 一句結論：今年健康「偏穩／有壓力／需保守／尚可」等。  
  - Top2～3 風險面向：睡眠、腸胃、發炎、筋骨、身心、作息、飲食、健檢等。  
  - 3 條可執行建議：由 HEALTH_TEMPLATE_POOL 或 strategy.suggestionPool 提供。  
- **證據不足**：若 tarot/meihua 未提供，`evidenceCount < 2` 時，健康結論前加「多維證據不足…以下為先天結構推估」，並維持區間／降信心度邏輯（既有 fusion 機制）。

---

### PHASE 4：阻擋通用八字段落污染 Direct Answer

- **directAnswerParagraph**：fusionEngine 回傳欄位 **directAnswerParagraph**（僅結論段，不含「依據：…」及後續日主/喜忌）。  
- **main.js**：Direct Answer 區塊改為優先使用 **fusionOut.directAnswerParagraph**；若無則取 `displayConclusion.split(/\n\n依據：/)[0]`，避免「依據：八字：日主…喜神…忌神」出現在直接回答區。
- **健康白名單檢查**：當 `category === 'health'` 且 `directAnswerForDisplay` 內出現「請見下方依據」「依據：」「日主」「喜神」「忌神」時，視為 BUG，**強制**改用 `buildHealthConclusion(...)` 重新產出該段，不得輸出通用八字段落。
- **日主／喜忌**：僅出現在「依據區」或「八字拆解區」（principleRef／影響因子），**不得**出現在 Direct Answer 主段落。

---

## 改動檔案清單

| 檔案 | 說明 |
|------|------|
| `js/main.js` | [INPUT] log；Direct Answer 使用 `fusionOut.directAnswerParagraph`，無則依「依據：」切分 |
| `engine/fusionEngine.js` | [GEN_ENTER]/[TEMPLATE_PICK]；ALLOWED_CATEGORIES；buildHealthConclusion、HEALTH_TEMPLATE_POOL；health 硬路由；directAnswerParagraph 回傳；健康段落的通用八字段落偵測與替換 |
| `logic/category_strategy.js` | health.templatePool、suggestionPool 擴充 |
| `docs/HEALTH_CATEGORY_ROUTE_DELIVERY.md` | 本交付說明 |

---

## 快速驗收

**同一人資料，連續測：**

- **A) 選「健康」**：今年健康方面要注意什麼？  
  - **要求**：Direct Answer 必含「健康」結論句 + 風險面向（如作息／睡眠／腸胃／身心等）+ 3 條建議；**不得**出現「日主／喜神／忌神」或「請見下方依據」開頭。
- **B) 選「財運」**：今年財運要注意什麼？  
  - **要求**：Direct Answer 必含金錢／現金流／風險控管等語意；與 A 不得共用同一段通用開頭。

**Console**：選健康、問健康時，應看到 `[INPUT]` / `[GEN_ENTER]` / `[TEMPLATE_PICK]` 的 category 皆為 `health`，templateId 為 `health`。
