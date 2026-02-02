# 問不同問題回答一樣 + 起運上方橫向 — 修正交付

## BUG (1) 修正摘要

### 根因
- Direct Answer 主路徑使用 `ExplainabilityLayer.buildDirectAnswerPlain` 產出 bazi 通用文案，未依 `questionText` / `category` / `tokens` 選模板。
- 結論改為**題型驅動**：主路徑一律用 `buildConclusionByType(category, question, factors)` 組結論，bazi 原理僅作「原理參考」。

### 已做項目

1. **Debug log（dev 模式）**  
   在 `fusionEngine.generateDirectAnswer` 內（主路徑與 fallback）於生成結果前輸出：
   - `[QA]` → `{ category, questionText }`
   - `[TOKENS]` → `extractedTokens`（陣列）
   - `[EVIDENCE_USED]` → `evidenceUsedSystems`（bazi/meihua/tarot/ziwei/nameology）
   - `[TEMPLATE]` → `selectedTemplateId`（= category）
   - `[PROB_BREAKDOWN]` → `breakdown`（base + contributions）

2. **Category 必填、空則禁止生成**
   - Step1 已有「問題類型」必選（`validateAndRunStep1`）。
   - 結果頁：若 `userCategory` 為空，**不呼叫** `FusionEngine.generateDirectAnswer`，直接顯示「請選擇問題類型後再取得分析結果。」並顯示橫幅「請選擇問題類型」。

3. **extractQuestionTokens**
   - 已存在於 `logic/category_strategy.js`，依 category 字典（love/career/wealth/health/relationship/family/general）從 `questionText` 抽詞，回傳陣列，供模板與證據使用。

4. **結論題型驅動**
   - 主路徑：`fullText` 的 Direct Answer 段落改為 `buildConclusionByType(probVal, type, question, probResult.factors, probResult.difficultyLevel)`，不再用 `ExplainabilityLayer.buildDirectAnswerPlain` 的整段替換。
   - 反單調、證據不足區間、單系統防呆維持不變。

---

## BUG (2) 起運 UI 修正摘要

### 現象
- 起運資訊在 `dayun-timeline` 內第一個子元素，橫向捲動時呈左側一直條，視覺像直排。

### 已做項目

1. **DOM**
   - 在 `#dayun-container` 內、`<h4>大運流年</h4>` 下方、`#dayun-timeline` 上方新增：
   - `<div class="startLuckTop" id="dayun-start-luck-top" style="display:none;"></div>`

2. **渲染**
   - `renderDayun`：起運內容改寫入 `#dayun-start-luck-top`（`textContent`），有資料時顯示、無時 `display:none`。
   - `#dayun-timeline` 僅填入大運流年項目，**不再**包含起運 div。

3. **CSS**
   - `.startLuckTop`：  
     `width:100%`、`display:flex`、`align-items:center`、`justify-content:flex-start`、`gap:8px`、`padding:8px 10px`、`margin:8px 0 12px 0`、`border:1px solid rgba(255,215,0,0.35)`、`border-radius:10px`、`background:rgba(0,0,0,0.25)`、`font-size:14px`、`line-height:1.4`、`white-space:normal`、`overflow-wrap:anywhere`。  
   - 已同步至 `main.css`、`mobile-fix.css`、`responsive.css`。

### 驗收
- 起運資訊在卡片**上方**橫向一行顯示（例：起運：5歲8個月（虛歲7歲起運）；大運順行）。
- 左側不再出現直排起運字串。
- 小螢幕不破版、不截斷。

---

## Debug log 輸出範例

開啟結果頁並打開開發者工具 Console，應看到類似：

```
[QA] { category: "love", questionText: "今年桃花運勢如何" }
[TOKENS] ["桃花", "運勢"]
[EVIDENCE_USED] ["bazi", "meihua"]
[TEMPLATE] love
[PROB_BREAKDOWN] { base: 50, contributions: [{ system: "八字", score: 58, weight: 0.4, contribution: 23.2 }, { system: "梅花易數", score: 52, weight: 0.25, contribution: 13 }] }
```

若 `[TOKENS]` 為空、`[TEMPLATE]` 固定、`[EVIDENCE_USED]` 只有 bazi，代表問題未參與生成，需再查 category 傳遞與 evidence 來源。

---

## 三題驗收測試

**同一人資料**，依序輸入：

| # | 題型 | 問句 |
|---|------|------|
| 1 | 愛情 | 今年桃花運勢如何 |
| 2 | 事業 | 今年工作／創業發展如何 |
| 3 | 財運 | 今年財運與投資如何 |

**驗收標準：**
- 三題機率至少差 8%。
- Top3 因子至少 2/3 不同，且來源系統至少 2 個。
- Direct Answer 句型與內容明顯不同（不可只換少量詞）。

**建議：** 每題提交後截圖（含 Direct Answer、機率、影響因子），比對三張以確認差異。

---

## 改動檔案清單

| 檔案 | 說明 |
|------|------|
| `index.html` | 新增 `#dayun-start-luck-top` |
| `js/main.js` | 起運寫入 startLuckTop、timeline 不再含起運；category 為空時不呼叫 fusion、顯示請選擇問題類型 |
| `engine/fusionEngine.js` | [QA]/[TOKENS]/[EVIDENCE_USED]/[TEMPLATE]/[PROB_BREAKDOWN]；主路徑結論改 buildConclusionByType |
| `css/main.css` | `.startLuckTop` 樣式 |
| `css/mobile-fix.css` | `.startLuckTop` 手機同步 |
| `css/responsive.css` | `.startLuckTop` 響應同步 |
| `docs/QA_AND_STARTLUCK_FIX_DELIVERY.md` | 本交付說明 |
