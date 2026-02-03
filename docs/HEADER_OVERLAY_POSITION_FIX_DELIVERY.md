# Header/Overlay 定位與層級修正交付

## 現象（依截圖）

- 在流程後段或按了生成/複製摘要後，上方按鈕列（上一步/複製摘要/生成完整報告/重新開始）變成漂浮在畫面中間。
- 背後仍是首頁輸入欄位，被疊層/定位錯誤的工具列覆蓋，造成「UI 跑掉像回首頁」。

---

## Root Cause（推定）

1. **D) 單頁切換時舊頁 toolbar 殘留**  
   切換到 input-section 時，result-section 未強制 `display: none`（或被其他 CSS 覆寫），導致結果頁的按鈕列仍留在 DOM 上層、視覺上像蓋住首頁。

2. **A/B) 定位與父層影響**  
   工具列容器若曾為 `position: fixed/absolute` 或父層有 `transform/filter/backdrop-filter`，在 Android/iOS 上 fixed 會相對於該父層，造成「漂浮」感。本專案已將工具列改為 **position: relative**，且結果頁工具列位於 `#result-section` 內，隨 section 一起隱藏。

3. **C) 步驟隱藏不夠強**  
   僅依賴 `.section.active` 的 display 可能被其他樣式覆寫，需搭配 `style.display = 'none' !important` 與 `data-active` 雙重保險。

---

## 修正內容

### STEP 1｜工具列 DOM 與 Debug

- **HTML**：結果頁按鈕列最外層加上唯一 id：`<div id="topActionBar" class="section-actions result-step-toolbar" ...>`。
- **Debug（?debug=1）**：`scroll-debug.js` 新增 `logTopActionBar()`，於 init 與每次 `showSection` 後執行，在 console 印出：
  - `position`, `top`, `left`, `transform`, `zIndex`, `width`, `height`, `display`
  - `getBoundingClientRect()`
  - `offsetParent`、`transformedParent`（第一個具 transform/filter/perspective 的父層）。

### STEP 2｜禁止漂浮：工具列改為標準流

- **採用：position: relative（非 fixed）**  
  工具列位於結果頁內容**下方**，不需 sticky 貼頂，故使用 **relative** 維持正常流，不脫離文件流、不受父層 transform 影響。
- **CSS**：`#topActionBar`、`#result-section .section-actions`、`.result-step-toolbar` 一律：
  - `position: relative !important`
  - `z-index: 50`
  - `background: rgba(26, 21, 32, 0.98)`
  - `width: 100%`、`box-sizing: border-box`

### STEP 3｜切換步驟時工具列不殘留

- **showSection(sectionId)**：
  - 遍歷所有 `.section`：`style.display = 'none' !important`、`style.pointer-events = 'none' !important`、`data-active="false"`。
  - 僅目標 section：`style.display = 'block' !important`、移除 pointer-events、`data-active="true"`、`.active`。
- **CSS 保險**：`.section[data-active="false"]`、`.section:not(.active)` 設 `display: none !important`、`pointer-events: none !important`。
- **DOMContentLoaded**：依現有 `.active` 同步各 section 的 `data-active` 與 `display`，確保首屏只有一個步驟顯示。

### STEP 4｜Scroll/定位不互相干擾

- **根容器**：body、#page-scroll 未使用 `transform`，僅在 main.css 註明「禁止 transform 以免 fixed 參考系漂移」。
- **Scroll 策略**：維持既有（body 或 #page-scroll 主容器捲動），工具列在 `#result-section` 內，隨 section 隱藏/顯示，不另做 fixed 貼頂。

---

## 變更檔案清單

| 檔案 | 變更 |
|------|------|
| **index.html** | 結果頁按鈕列外層加上 `id="topActionBar"`、`class="result-step-toolbar"`、`role="toolbar"`。 |
| **css/main.css** | `#topActionBar` / `#result-section .section-actions` 明確 `position: relative !important`、z-index: 50、背景；新增 `.section[data-active="false"]`、`.section:not(.active)` 強制隱藏與 pointer-events；根容器註解禁止 transform。 |
| **js/main.js** | `showSection` 改為 `setProperty('display', …, 'important')` 與 `pointer-events`、`data-active`；DOMContentLoaded 同步各 section 的 data-active 與 display；showSection 後呼叫 `__logTopActionBar`（若存在）。 |
| **js/scroll-debug.js** | 新增 `logTopActionBar()`（computed style、getBoundingClientRect、offsetParent、transformedParent）；debug=1 時暴露 `window.__logTopActionBar` 並在 init 與 step 切換後執行。 |
| **docs/HEADER_OVERLAY_POSITION_FIX_DELIVERY.md** | 本交付說明。 |

---

## 最終採用

- **工具列定位**：**position: relative**（標準流，不採用 fixed；工具列在結果頁底部，無需 sticky 貼頂）。
- **步驟顯示**：單一實例/單一狀態，非當前步驟一律 `display: none !important` + `pointer-events: none !important` + `data-active="false"`。

---

## 驗收建議

1. 首頁輸入 → 生成完整報告 → 進入結果頁：工具列在結果區塊底部，不漂到中間。
2. 結果頁「複製摘要」「重新開始」來回切換約 10 次：回首頁後無殘留工具列，首頁內容不被遮住。
3. 工具列不覆蓋內容、內容可點；Samsung/OPPO/iOS 行為一致。
4. `?debug=1` 時 console 可看到 `[TOP_ACTION_BAR]` 與 `transformedParent`，確認無父層 transform 影響。
