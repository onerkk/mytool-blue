# 答非所問：人際/客戶互動誤出桃花 — 意圖辨識與禁詞守門交付

## 現象與根因

- **現象**：問題「今年我在客戶之間會有互動嗎？」Direct Answer 卻輸出「以人際與貴人來看，『桃花運勢』目標不高…」
- **根因**：  
  1) getQuestionType 未將「客戶／互動」歸入 relationship，或 love 關鍵詞先命中。  
  2) getVocabSubject 對 relationship 未回傳「客戶互動與人際」，可能回傳含桃花語意。  
  3) 無意圖辨識與 category 決策，UI 選人際時仍可能走錯模板。  
  4) 無禁詞守門，人際類輸出不得出現桃花/感情詞。

---

## 已做修正

### PHASE 0：Debug log

- **`[INPUT]`**：`{ uiCategory, questionText }`（main.js 已有；fusionEngine 主路徑與 fallback 補齊）
- **`[INTENT]`**：`{ inferredCategory, matchedKeywords }`（意圖辨識結果）
- **`[ROUTE]`**：`{ finalCategoryUsed, templateId }`（最終使用的 category 與 template）
- **`[GUARD]`**：`{ forbiddenTermsHit, passed }`（禁詞命中與是否通過）

任一輸出若含「桃花」等禁詞，會 log 出 templateId 與 finalCategoryUsed，並觸發禁詞守門修正。

---

### PHASE 1：問題文本意圖辨識

- **inferCategoryFromQuestion(questionText)**（fusionEngine）  
  - 關鍵詞字典：LOVE_KEYWORDS、CAREER_KEYWORDS、WEALTH_KEYWORDS、HEALTH_KEYWORDS、SOCIAL_KEYWORDS（人際／貴人／客戶／交際／溝通／互動／客訴／關係維護）、FAMILY_KEYWORDS、GENERAL_KEYWORDS  
  - 權重計分：各類別命中數 → scores  
  - 輸出：`{ inferredCategory, matchedKeywords, scores }`

---

### PHASE 2：Category 決策規則

- **finalCategoryUsed** 預設為 **uiCategory**（UI 選的問題類型）。
- 若 **inferredCategory ≠ uiCategory** 且 **scores[inferredCategory] ≥ scores[uiCategory] + 2**：  
  - **自動修正**：`finalCategoryUsed = inferredCategory`  
  - 結果頁橫幅顯示：**「偵測到問題更符合【人際】方向，已自動以人際解讀。」**（fusionOut.autoCorrectNotice，main.js 顯示於 category-warning-banner）
- 禁止靜默 fallback 到 love/general；以「問題文本意圖」優先自動修正。

---

### PHASE 3：模板與禁詞守門

- **getQuestionType**：  
  - **relationship 優先於 love**：先檢查 人際／貴人／客戶／交際／溝通／互動／客訴／關係維護 → relationship，再檢查 桃花／感情／曖昧… → love。  
  - 「今年我在客戶之間會有互動嗎」→ **relationship**。
- **getVocabSubject**：  
  - 新增 **relationship** 分支：若問題含 客戶／互動／人際／貴人／溝通／交際 且**不含** 桃花／感情／曖昧 等 → 回傳「客戶互動與人際」；否則 relationship 回傳「人際與合作關係」，**禁止**回傳桃花運勢等語意。
- **RELATIONSHIP_TEMPLATE_POOL**（10 組）：  
  - 僅「客戶互動／人際溝通／合作關係」語意，**禁止**桃花／感情／緣分。  
  - **buildRelationshipConclusion(probVal, question, topFactors, synSuggestions)**：結論 + 可留意面向 + 3 條建議。
- **Forbidden Terms Guard**：  
  - **FORBIDDEN_WHEN_NOT_LOVE**：['桃花','曖昧','感情運','對象','復合','告白','戀愛','桃花運勢','姻緣','正緣']  
  - 當 **finalCategoryUsed !== 'love'** 時，Direct Answer 不得出現上述詞；若 **checkForbiddenTerms** 命中 → 視為 BUG，**立即**以同 category 備援模板重新生成（relationship 用 buildRelationshipConclusion），並 console.log 命中的禁詞與修正後 templateId。

---

### PHASE 4：Evidence 對應類型

- Top3 因子仍由 **probResult.factors**（computeProbability 依 data.questionType 與 strategy.topFactorKeys）產出；**finalCategoryUsed** 用於結論與模板選擇，確保人際類走 relationship 模板與 relationship 用語，不引用桃花專用句。

---

### PHASE 5：驗收測試

| # | 題型   | 問句                           | 要求 |
|---|--------|--------------------------------|------|
| 1 | 人際   | 今年我在客戶之間會有互動嗎？   | Direct Answer **不可**出現桃花/感情詞；**必**含客戶互動/合作/溝通/關係維護語意 + 3 條建議 |
| 2 | 愛情   | 今年桃花運勢如何？             | Direct Answer 為桃花/感情語意；templateId = love |
| 3 | 財運   | 今年財運如何？                 | Direct Answer 為財運/現金流語意；templateId = wealth |

- 1/2/3 的 **templateId 必不同**，Top3 因子來源依各題型策略。
- Console：人際題應見 `[INTENT] inferredCategory: 'relationship'`、`[ROUTE] finalCategoryUsed: 'relationship'`，且 **無** `[GUARD] forbiddenTermsHit` 命中（或命中後已修正）。

---

## 改動檔案清單

| 檔案 | 說明 |
|------|------|
| `engine/fusionEngine.js` | getQuestionType（relationship 優先、客戶/互動關鍵詞）；inferCategoryFromQuestion；FORBIDDEN_WHEN_NOT_LOVE、checkForbiddenTerms；RELATIONSHIP_TEMPLATE_POOL、buildRelationshipConclusion；category 決策（finalCategoryUsed、autoCorrectNotice）；主路徑與 fallback 之 [INPUT]/[INTENT]/[ROUTE]/[GUARD]；禁詞守門與重算結論 |
| `logic/category_strategy.js` | relationship：mandatoryPhrases/conclusionOpeners/suggestionPool/templatePool 改為客戶互動/合作關係；CATEGORY_KEYWORDS.relationship 加入 客戶/互動/交際/客訴/關係維護 |
| `js/main.js` | category-warning-banner 顯示 fusionOut.autoCorrectNotice |
| `docs/INTENT_ROUTE_FORBIDDEN_DELIVERY.md` | 本交付說明 |
