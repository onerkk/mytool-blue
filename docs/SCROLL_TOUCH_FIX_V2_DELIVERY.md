# 捲動／觸控修正 v2 交付（Samsung 左右邊緣偶爾能滑）

## 目標摘要

1. 任意位置（中央、左右邊）都能穩定上下滑。
2. 只允許在必要小區域（拖曳牌卡／動畫）阻擋觸控，且可逆。
3. 確認唯一 scroll container 策略（body 或 main 擇一，全站一致）。

---

## STEP 1｜事件攔截稽核結果

### 1-1 全專案搜尋結果

| 搜尋項目 | 結果 |
|----------|------|
| `addEventListener('touchmove'` | **無** |
| `addEventListener('pointermove'` | **無** |
| `addEventListener('wheel'` | **無**（僅 scoring-engine 內牌名 "wheel"） |
| `preventDefault()` | 僅用於 **click / submit / keydown**（main.js），**未用於 touchmove/pointermove/wheel** |
| `{ passive: false }` | **無** |

**結論：沒有任何綁在 document/window/body 的 touchmove/pointermove 在做 preventDefault，故「全域事件攔截」不是目前程式碼的阻擋來源。**

### 1-2 條件式阻擋

- 未發現需改的「全域 touchmove/pointermove preventDefault」。
- 若日後在拖曳牌卡等區域加入 touchmove preventDefault，請遵守：
  - 僅在 `isDragging === true` 或 `.tarot-drag-area` 等特定區域內才呼叫 `preventDefault()`。
  - 該 listener 須使用 `{ passive: false }`，且不得對整個頁面長駐阻擋。

### 1-3 Debug log（`?debug=1`）

- 已加入被動稽核：首次 touchmove/pointermove 時會 log 一次  
  `[BLOCK_SCROLL] { reason: 'audit', event, target, isDragging: false, isModalOpen, preventDefaultCalled: false }`  
  用以確認本 app 未在這些事件上呼叫 preventDefault。

---

## STEP 2｜Scroll Container 統一

### 2-1 採用策略：**方案 A（body 滾）**

- **html**：`overflow-x: hidden`，`min-height: 100vh/100dvh`，不常駐 `overflow-y: hidden`。
- **body**：`overflow-y: auto`、`touch-action: pan-y`、`-webkit-overflow-scrolling: touch`；鎖定時才由 `scrollLockManager` 設 `overflow: hidden`（及行動裝置上 `position: fixed`），解鎖即還原。
- **#page-scroll**：`overflow-y: visible`，捲動由 body 負責，避免雙層捲動／無法滑動。
- 其他容器不得常駐 `overflow: hidden` 導致整頁鎖死。

### 2-2 Scroll 診斷（`?debug=1`）

- `SCROLL_DEBUG()` 會輸出 **`[SCROLL_STATE]`**，內容包含：
  - **body**：`overflow`, `position`, `h` (clientHeight), `sh` (scrollHeight), `canScroll`
  - **main**（#page-scroll 或 .main-container）：`overflow`, `h`, `sh`, `canScroll`
- 驗收要求：至少一個容器 `sh > h` 且 `overflow-y` 為 `auto` 或 `scroll`，才能滾動。

---

## STEP 3｜覆蓋層／按鈕列檢查

### 3-1 elementFromPoint 掃描（`?debug=1`）

- 診斷面板按鈕 **「elementFromPoint 掃描」** 會執行：
  - `probe(0.5, 0.5)` 中央
  - `probe(0.02, 0.5)` 左側
  - `probe(0.98, 0.5)` 右側
- 結果輸出為 **`[ELEMENT_FROM_POINT]`** 陣列，每點含：`position`, `tag`, `id`, `class`, `positionFixed`, `overlayLike`。
- **驗收**：中央點不應長期落在覆蓋層（如 fixed/overlay/fab 等）上；若中央常為 overlay，表示仍有攔截層需改為 `pointer-events: none` 或 `display: none`。

### 3-2 Overlay / 按鈕列規則

- **global-loading-overlay[hidden]**：已設 `display: none !important`、`pointer-events: none !important`。
- **custom-order-modal / card-interpretation-modal 未開啟時**：`.custom-order-modal:not(.active)`、`.card-interpretation-modal:not(.active)` 已設 `pointer-events: none !important`、`visibility: hidden`。
- **浮動按鈕列**：`.floating-buttons` 容器改為 **pointer-events: none**，其內 `.floating-btn, a, button` 為 **pointer-events: auto**，縮小 hitbox，避免擋住中央滑動；`ensureFloatingButtonsVisible()` 已同步改為容器 `pointer-events: none`、子按鈕 `pointer-events: auto`。

---

## STEP 4｜驗收與交付摘要

### 原本可能造成「碰運氣能滑」的來源（推論）

1. **scrollLockManager 鎖定殘留**  
   - 行動裝置上會設 `body` 的 `overflow: hidden` 與 `position: fixed`；若 `unlockScroll` 少呼叫（或 lock/unlock 次數不一致），會導致鎖定殘留，出現「有時可滑、有時不可」。
   - **已做**：DOMContentLoaded 時 `forceUnlock()` + 清除 body 相關 style；modal/overlay 關閉路徑一律呼叫 `unlockScroll`；牌義 modal 關閉時補上 `unlockScroll`。

2. **浮動按鈕列整塊可點**  
   - 固定區塊若未設 `pointer-events: none`，可能攔截中央觸控。
   - **已做**：浮動按鈕列改為容器 `pointer-events: none`、按鈕 `pointer-events: auto`。

3. **透明覆蓋層**  
   - 隱藏時若僅 `opacity: 0` 而未 `pointer-events: none` 或 `display: none`，仍會攔截。
   - **已做**：overlay 與未開啟的 modal 皆已依 STEP 3 規則處理。

### 最終採用的 scroll container 策略

- **方案 A：body 滾**（全站一致，見 STEP 2）。

### elementFromPoint 掃描結果說明

- 請在實機或模擬器加上 **`?debug=1`**，點擊診斷面板上的 **「elementFromPoint 掃描」**。
- 查看 console 的 **`[ELEMENT_FROM_POINT]`**：中央 (0.5, 0.5) 應為主要內容節點（如 `MAIN`、`DIV` 等），而非 overlay/modal/fab；若為後者，表示該處仍有覆蓋需再調整 pointer-events 或 display。

### 建議手動驗收

- 手指從**中央**上下滑：連續約 10 次皆可滑。
- **左右邊緣**上下滑：也應可滑（非碰運氣）。
- 開啟分類選單／modal：背景鎖定；關閉後立即恢復捲動。
- 拖曳／洗牌區：僅在拖曳時禁止頁面滾動，離開即恢復（若日後實作拖曳，請依 STEP 1-2 規則限定阻擋範圍）。

---

## 變更檔案一覽

| 檔案 | 變更摘要 |
|------|----------|
| `js/scrollLockManager.js` | getState 增加 body/main 的 scrollHeight、clientHeight、mainOverflowY，供 SCROLL_STATE 診斷 |
| `js/scroll-debug.js` | 新增 [SCROLL_STATE]、runElementFromPointProbe、[BLOCK_SCROLL] 稽核 log、elementFromPoint 按鈕、被動 touchmove/pointermove 監聽（debug=1） |
| `css/main.css` | 方案 A 註解；.floating-buttons 改 pointer-events:none，.floating-btn/a/button 改 pointer-events:auto |
| `js/main.js` | ensureFloatingButtonsVisible 改為容器 none、按鈕 auto；initCardInterpretationModalClose 牌義 modal 關閉時 unlockScroll |
| `docs/SCROLL_TOUCH_FIX_V2_DELIVERY.md` | 本交付說明 |
