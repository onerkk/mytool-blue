# 問答同步、類別對應、時間尺度與架構升級交付說明

## 已落地項目

### A. 問題理解層（QuestionIntent）

- **`js/question-parser.js`**
  - 新增 `parseQuestionIntent(text, selectedDomain)`，輸出 **QuestionIntent**：
    - `domain`：與 UI 選單一致（love / career / wealth / health / relationship / family / general / other）
    - `time_scope`：day | week | month | year | lifetime | unspecified
    - `time_anchor`：{ year?, month? }（今年/本月/明年/2026 等）
    - `focus`：子類關鍵詞（如愛情→桃花、曖昧、復合…）
    - `question_type`：prediction | advice | risk | explanation
    - `keywords`：5～15 個 token
  - **硬規則**：傳入 `selectedDomain` 時權重最高；`time_scope` 由時間解析器與 guard 鎖定。

- **`logic/time_scope_parser.js`**
  - 「今年/今年度/本年度/整年度」→ 強制 `YEAR`，禁止回覆「本月」。
  - 新增 `toCanonicalTimeScope()`、`parseTimeAnchor()`，供 QuestionIntent 與 NLG 使用。

### E. 問答不同步修正（資料流校驗）

- **`js/main.js`（結果頁渲染前）**
  1. `selectedDomain` 寫入 `QuestionIntent.domain`：以 `parseQuestionIntent(question, selectedDomain)` 取得 intent，若 `intent.domain !== selectedDomain` 則顯示「類別不同步，請回報（debug id）」。
  2. `questionIntent` 傳入 `fusionData.questionIntent`，供下游使用。
  3. 最終輸出：`fusionOut.domain = selectedDomain`，若 `fusionOut.domain !== selectedDomain` 顯示錯誤。

- **`js/scoring-engine.js`**
  - `getCategory(questionText, category)`：當第二參數為 UI 選單值（love / wealth / family…）時，先經 `UI_DOMAIN_TO_CATEGORY` 轉成引擎內部 category（relationship / finance / family…），**UI 已選類別優先，不再被問題文字覆蓋**。

### F. 時間尺度精準化

- 已於 `time_scope_parser.js` 實作：今年/本年度/整年度→year；本月→month；明年→nextYear；近期→UNKNOWN 時依分類給預設（綜合→year，其餘→month），並可標註「時間未指定」。
- `answer-synthesizer.js` 繼續使用 `guardTimeScopeMismatch`，確保結論句不會把「今年」寫成「本月」。

### B/C. Evidence 與類別對應

- **`js/evidence-normalizer.js`**  
  正規化後的 evidence 補上：`domain`、`time_scope`、`signal`（positive/neutral/negative）、`tags`（來自 slotTags/keywords），與 QuestionIntent 對齊。

- **`logic/domain_symbol_mapping.js`**（C1）  
  各 domain 對應八字/紫微/塔羅/梅花/姓名學/稱骨的象徵與宮位；健康類無桃花詞；稱骨僅作背景（domain≠綜合時不作主證）。

### D. 字數與驗證

- **`js/answer-synthesizer.js`**  
  - 非「其他」類別若全文不足 220 字，自動補一句觀測指標說明。
  - 合成後以 `validateResponse(domain, fullText)` 檢查禁用詞，違規時 console.warn。

### G. 稱骨可追溯

- **`logic/chenggu.js`**  
  `calculateChenggu` / `calculateChengguFromSolar` 回傳值新增 **`debug`**：  
  `yearGanZhi`, `yearWeight`, `monthZhi`, `monthWeight`, `lunarDay`, `dayWeight`, `hourZhi`, `hourWeight`, `totalLiang`。  
  對照表仍來自 `js/auxiliary-data.js`（CHENGGU_YEAR/MONTH/DAY/HOUR/POEMS）。

### I. 詞彙與禁用詞

- **`lexicon/`**  
  - `avoid_list.json`：各 domain 禁用詞（健康禁桃花、財運禁病痛等）。
  - `domain_phrases.json`：各 domain 句型池。
  - `tags_to_phrases.json`：tag→描述語句。

- **`js/response-validator.js`**  
  `validateResponse(domain, text)` 依 `AVOID_BY_DOMAIN` 檢查，回傳 `{ passed, hit }`。  
  生成流程可於輸出前呼叫，若未通過可重生成或記錄。

### J. 自動化測試

- **`tests/intent_domain_tests.js`**  
  - 同人不同 domain（love/career/wealth/health/relationship）→ 斷言 `intent.domain === selectedDomain`。
  - 同 domain 不同 time_scope（今年/本月/近期）→ 斷言 `time_scope` 正確。
  - 「今年」問句不得出現「本月」。
  - 健康類：`validateResponse('health', …)` 含桃花詞時應未通過。
  - UI 已選 domain 權重最高（選健康、問財運→domain=health）。

- 使用方式：`index.html?test=intent`，結果在 `window.intentDomainTestResult`。

---

## 三大 Bug 對應

| Bug | 處理方式 |
|-----|----------|
| UI 類別沒進運算 → 健康/人際被答成桃花 | `getCategory(questionText, questionType)` 以 UI 值為優先，並用 `UI_DOMAIN_TO_CATEGORY` 對應；結果頁 E1 斷言確保 `response.domain === selectedDomain`。 |
| time_scope 沒硬鎖 → 今年問成本月 | `time_scope_parser` 正則鎖定「今年/今年度/本年度/整年度」→ YEAR；`guardTimeScopeMismatch` 在 synthesizer 與流程中強制修正。 |
| NLG 模板單一 → 不同問題答案像 | 已補 domain/evidence tags、字數下限、validate_response；後續可再接 lexicon 與 Response Blueprint 六段式組裝與 used_phrases 反重複。 |

---

## 建議後續

- 各系統（八字/紫微/梅花/塔羅/姓名/稱骨）若有獨立 `buildEvidence(domain, time_scope, …)`，可統一回傳 EvidenceItem（system, domain, time_scope, signal, confidence, tags, reason, actionable, risk, text_atoms）。
- Response Blueprint 六段式（結論摘要、多系統交叉證據、推動因子、可執行策略、風險與避坑、觀測指標）可接在 FusionEngine 或專用 NLG 模組，並用 `seed = hash(question + birth + time_scope)` 與 used_phrases cache 做反重複。
- 閏月：目前稱骨月支依節氣月；若需農曆閏月規則，可於 `chenggu.js` 或農曆庫中明確定義並在資料不足時禁用計算。
