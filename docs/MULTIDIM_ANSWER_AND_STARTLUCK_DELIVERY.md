# 多維命理回答差異化 + 起運橫式 UI 交付說明

## 改動檔案清單

### 新增
- 無（邏輯與樣式均改在既有檔案）

### 修改
| 檔案 | 說明 |
|------|------|
| `logic/category_strategy.js` | 新增 `CATEGORY_KEYWORDS` 題型關鍵詞字典、`extractQuestionTokens()`；各題型新增 `templatePool`、`weights` 加入 ziwei/nameology |
| `engine/fusionEngine.js` | PHASE 0–2：questionTokens、probabilityBreakdown、evidenceUsed、debug log；單系統防呆（僅一系統→區間+建議補塔羅/梅花）；反單調（上次結論相似度>閾值則換模板）；姓名學/紫微權重納入 strategy |
| `js/main.js` | category 未選時顯示「請選擇問題類型」橫幅；單系統時顯示「證據不足」橫幅；起運區塊加上 class `startLuckInfo` |
| `index.html` | 新增 `#category-warning-banner` 區塊（結果頁直接回答上方） |
| `css/main.css` | `.category-warning-banner` 樣式；`.dayun-meta` / `.startLuckInfo` 起運橫式（writing-mode、flex、word-break） |
| `css/mobile-fix.css` | 起運橫式同步（.dayun-meta / .startLuckInfo） |
| `css/responsive.css` | 起運橫式同步（.dayun-meta / .startLuckInfo） |

---

## 驗收：三題測試（同一人資料）

**同一組八字／紫微／姓名／梅花／塔羅（若有）不變，僅改「問題類型」與「問題文本」。**

### 測試問句

1. **愛情**：今年桃花運勢如何  
2. **事業**：今年轉職／創業如何  
3. **財運**：今年收入與投資如何  

### 驗收標準

- **機率差異**：三者機率至少差 8%（例：愛情 52%、事業 45%、財運 48% 即合格）。  
- **Top3 因子**：至少 2/3 不同，且來源系統不同（八字／梅花／塔羅／紫微／姓名學）。  
- **Direct Answer 文案**：明顯不同，非只改幾個字（題型專屬 opener、mandatory 詞、建議池不同）。  
- **缺證據時**：若缺塔羅／梅花／紫微／姓名 evidence，必提示「缺少證據」並輸出區間（例：55%~70%）。  
- **單一系統時**：若僅引用八字一個系統，必顯示「證據不足」提示、機率改區間、建議補抽塔羅或起梅花卦。  

### 起運 UI 驗收

- Android Chrome / iOS Safari：大運區塊內「起運：X歲X個月（虛歲X歲起運）；大運順/逆行」為**橫式單行**顯示，不直式、不溢出、不截斷；窄螢幕可自動換行（word-break）。  

---

## Debug 模式（開發用）

- URL 加 `?debug=1` 可看到對齊管線 trace。  
- 生成結果前 console 會輸出：`category`、`questionText`、`questionTokens`、`evidenceUsed`、`selectedTemplateId`、`probabilityBreakdown`（base + 各系統加減分）。  

---

## 三題驗收簡表

| 項目 | 愛情 | 事業 | 財運 |
|------|------|------|------|
| 問句 | 今年桃花運勢如何 | 今年轉職／創業如何 | 今年收入與投資如何 |
| 機率（與另兩題差≥8%） | □ | □ | □ |
| Top3 因子 ≥2/3 不同且來源不同 | □ | □ | □ |
| Direct Answer 文案明顯不同 | □ | □ | □ |
| 缺證據時區間+提示 | □ | □ | □ |
