# 複製摘要/生成完整報告/重新開始 漂浮修復交付

## PHASE A｜Debug 探針（已實作）

### A1) DOM 掃描（debug=1 啟用）

- 掃描整個 DOM，找出包含文字：「複製摘要」、「生成完整報告」、「重新開始」。
- 對每個命中的「toolbar 根」（`#quick-action-bar` / `#topActionBar` / `.section-actions`）輸出：
  1. `outerHTML`（截短 300 字）
  2. `element.className` / `id`
  3. `getComputedStyle`: `position` / `top` / `left` / `transform` / `zIndex`
  4. 往上 6 層 parent：每層 `tag#id.class` + 是否有 `transform` / `filter` / `backdrop-filter`
  5. 同一文字命中數量：`含「複製摘要」的節點數`、`toolbar 根數`、`可見 toolbar 數`

### A2) 視覺標記（debug=1）

- 命中的 toolbar 根：`outline: 2px solid red`
- 左上角插入 badge：`DOM_INDEX / position / zIndex`

### A3) 掃描時機

- 頁面 **load 完**：`scanQuickActionBar('load')`
- **DOMContentLoaded**：`scanQuickActionBar('DOMContentLoaded')`
- **showSection** 每次呼叫後：`scanQuickActionBar('showSection:' + sectionId)`
- 按 **重新開始** 前：`scanQuickActionBar('start-over:before')`；reset 後：`scanQuickActionBar('reset')`
- 按 **生成完整報告**：`scanQuickActionBar('generate-report')`

**Console 證據**：觀察 `[QUICK_ACTION_BAR_SCAN]` 的 `toolbar 根數`、`可見 toolbar 數` 在不同 trigger 下是否由 1 變 2/3，即可判斷是哪個事件造成重複或殘留。

---

## PHASE B｜一次修到位

### B1) 單例

- 工具列唯一 root：`<div id="quick-action-bar">`（由原 `#topActionBar` 改名）。
- 每次 **showSection** 開頭：`querySelectorAll('[id="quick-action-bar"]')`，若 `length > 1` 則從 DOM 移除多餘節點，只保留第一個。

### B2) 僅在分析結果 step 顯示

- 工具列位於 `#result-section` 內；非 result 時 `showSection` 會將所有 `.section` 設 `display: none !important`，故 `#result-section` 隱藏時工具列一併隱藏。
- CSS：`.section[data-active="false"]`、`.section:not(.active)` 設 `display: none !important`、`pointer-events: none !important`，避免殘留吃事件。

### B3) 切頁先清空

- **showSection** 流程：先移除重複的 `#quick-action-bar`（若有），再將所有 `.section` 設 `display: none` / `pointer-events: none`，僅目標 section `display: block`。
- 未使用 `innerHTML +=` 疊加；工具列為靜態 HTML 單一實例，無動態 append 造成重複。

### B4) 定位穩定

- **採用：position: sticky; bottom: 12px**
- `#quick-action-bar`（及 `#result-section .section-actions`）：
  - `position: sticky !important; bottom: 12px !important`
  - `top: auto !important; left: auto !important; right: auto !important`（禁止置中）
  - 不設 `top: 50%` 或僅靠 `align-items: center` 造成畫面中央漂浮。

### B5) 根治 fixed 漂移

- 全站註解：body / `#page-scroll` 禁止 `transform`，以免 fixed 參考系漂移。
- `transform` / `filter` 僅用於局部（如 .logo、body::after 動畫），未包住整個 app 根容器。

---

## PHASE C｜驗收標準

### C1) 非分析結果 step

- DOM 搜尋「複製摘要」：節點可存在（在隱藏 section 內），但**可見 toolbar 數**須為 **0**（`verifyQuickActionBarCount()` 或 scan 的 `visibleToolbarCount === 0`）。

### C2) 分析結果頁

- 可見 toolbar 數須為 **1**。
- 捲動時工具列以 **sticky 貼底**（bottom: 12px），不跑到畫面中間。

### C3) 按「重新開始」後

- 切到 input-section，`#result-section` 隱藏，可見 toolbar 數回到 **0**，無殘留漂浮 UI。

### 驗收函式（debug=1 時可用）

- `verifyQuickActionBarCount()`：依目前是否在 result-section 檢查可見 toolbar 數應為 1 或 0，並在 console 印 PASS/FAIL。

---

## 修改檔案清單

| 檔案 | 變更 |
|------|------|
| **index.html** | 工具列外層 id 改為 `quick-action-bar`（原 topActionBar）。 |
| **js/main.js** | 新增 `scanQuickActionBar(trigger)`、`verifyQuickActionBarCount()`；showSection 開頭移除重複 `#quick-action-bar`；showSection/reset 後及 load/DOMContentLoaded/生成報告/重新開始 時呼叫 scan；對外暴露 `window.scanQuickActionBar`、`window.verifyQuickActionBarCount`。 |
| **css/main.css** | `#quick-action-bar` / 結果頁 .section-actions：`position: sticky; bottom: 12px`；補 `top/left/right: auto` 禁止置中；backdrop-filter。 |
| **js/scroll-debug.js** | `logTopActionBar` 改為查 `#quick-action-bar` 或 `#topActionBar`。 |
| **docs/QUICK_ACTION_BAR_FIX_DELIVERY.md** | 本交付說明。 |

---

## Console log 證據使用方式

1. 加上 **?debug=1** 進入頁面。
2. 依序操作：首頁 → 下一步 → … → 結果頁 → 複製摘要 → 重新開始 → 再進結果頁。
3. 看每次 `[QUICK_ACTION_BAR_SCAN]` 的：
   - `trigger`
   - `含「複製摘要」的節點數`
   - `toolbar 根數`
   - `可見 toolbar 數`
4. 若某個 trigger 後 `toolbar 根數` 或 `可見 toolbar 數` 變為 2 以上，即為該事件導致重複/殘留，再依 B1/B2/B3 對應收斂為單例且僅在 result step 顯示。
