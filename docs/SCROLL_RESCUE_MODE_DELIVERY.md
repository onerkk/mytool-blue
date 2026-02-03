# Scroll Rescue Mode 交付說明

## 目標

- **救火**：`?scrollfix=1` 或 `localStorage.scrollfix=1` 時，強制頁面可滑（中央／左右皆可）。
- **根因**：用 Rescue Mode 診斷鎖定 ROOT_CAUSE_A/B/C，並在正式模式修掉，不長期依賴 scrollfix。

---

## PHASE 1｜Scroll Rescue Mode（已完成）

### 啟用方式

- 網址：`?scrollfix=1`
- 或：`localStorage.setItem('scrollfix','1')` 後重新整理

### 啟用時行為

1. **A) 解除鎖滑 style/class**
   - `document.documentElement.style` / `document.body.style`：`overflow='auto'`, `position='static'`, `top='0'`, `width='auto'`
   - 移除 class：`no-scroll`, `scroll-lock`, `lock`, `modal-open`, `prevent-scroll`, `scroll-lock-active`, `custom-modal-open`（html 與 body）

2. **B) 注入強制 CSS**（`<style id="scroll-rescue-style">`）
   - `html, body`：`overflow-y:auto !important; height:auto !important; position:static !important; touch-action:pan-y !important`
   - `*`：`overscroll-behavior:auto !important`
   - `#app,.app,.main,.page,.content,#page-scroll,.page-scroll,.main-container`：`overflow:visible !important; height:auto !important; touch-action:pan-y !important`

3. **C) 禁止全域 preventDefault**
   - 包裝 `document.addEventListener`、`window.addEventListener`、`document.body.addEventListener`
   - 對 `touchmove` / `pointermove`：傳入的 handler 被包一層，在 rescue 下 `e.preventDefault` 改為 no-op，不阻擋捲動

4. **D) 解除透明覆蓋層**
   - 掃描所有 `position:fixed` 且覆蓋 >80% viewport 的元素
   - 排除：`.custom-order-modal.active`、`.card-interpretation-modal.active`、`#scroll-debug-overlay`、`#scroll-rescue-panel`
   - 其餘一律設 `el.style.pointerEvents='none'`

5. **scrollLockManager 在 rescue 下**
   - `lockScroll` 改為 no-op
   - `forceUnlock` 會執行 `applyUnlockStyles()`，確保解鎖

6. **Debug 面板（右上角）**
   - SCROLL_RESCUE: ON/off
   - html/body overflow、position
   - Fixed overlay（前 3 個 selector）
   - Touchmove on doc/body：是否有被攔截的 handler 數

---

## PHASE 2｜根因診斷（console 輸出）

Rescue 執行時會印出：

- **ROOT_CAUSE_A**：在 document/window/body 上註冊的 touchmove/pointermove（rescue 已攔截，避免 preventDefault）。若無則印「未偵測到」。
- **ROOT_CAUSE_B**：被設為 `pointer-events:none` 的全頁 fixed 覆蓋層（前 10 個 selector）。若無則印「未偵測到」。
- **ROOT_CAUSE_C**：body 的 overflow 或 position 被鎖定時，印出推論來源（例：`js/scrollLockManager.js` 的 `lockScroll()`）。若無則印「未偵測到」。

本專案目前已知：
- **ROOT_CAUSE_A**：未發現有在 document/window/body 綁 touchmove/pointermove 的程式碼。
- **ROOT_CAUSE_B**：可能為全版 fixed 覆蓋（如未正確隱藏的 overlay／floating 區）。已透過 rescue 掃描並設 pointer-events:none。
- **ROOT_CAUSE_C**：`js/scrollLockManager.js` 的 `lockScroll()` 在行動裝置會設 `body.style.overflow='hidden'`，且**原本**在 iOS/Android 都會設 `body.style.position='fixed'`，易導致整站無法滑。

---

## PHASE 3｜正式修復（不靠 scrollfix）

### 已做修改

1. **ROOT_CAUSE_C 對應**
   - **檔案**：`js/scrollLockManager.js`
   - **修改**：僅在 **iOS**（iPhone/iPad/iPod）使用 `body.style.position='fixed'`；**Android（Samsung/OPPO 等）** 僅使用 `overflow:hidden`，不再設 `position:fixed`。
   - **理由**：Android 上 body position:fixed 易造成觸控／捲動異常；改為只鎖 overflow 可減少「整站無法滑」且仍能鎖住背景捲動。

2. **ROOT_CAUSE_B 對應**（先前已做）
   - overlay／modal 未顯示時：`pointer-events:none` 或 `display:none`。
   - 浮動按鈕列：外層 `pointer-events:none`，按鈕 `pointer-events:auto`，縮小 hitbox。

3. **ROOT_CAUSE_A**
   - 未發現全域 touchmove/pointermove preventDefault，無需改動。

### 變更檔案一覽

| 檔案 | 變更 |
|------|------|
| `js/scroll-rescue.js` | **新增**：Rescue Mode 邏輯（A/B/C/D）、addEventListener 包裝、根因診斷、debug 面板 |
| `index.html` | 在腳本最前加入 `<script src="js/scroll-rescue.js?v=2.28"></script>` |
| `js/scrollLockManager.js` | lockScroll 僅在 iOS 設 `body.position='fixed'`；Android 僅設 `overflow:hidden` |
| `docs/SCROLL_RESCUE_MODE_DELIVERY.md` | 本交付說明 |

---

## PHASE 4｜驗收建議

1. **不加 scrollfix**
   - Samsung / OPPO / iOS：首頁與內頁皆可上下滑（中央、左右邊緣都試）。
2. **加 scrollfix**（`?scrollfix=1`）
   - 同上，且右上角顯示 SCROLL_RESCUE: ON；任何機型都應可滑。
3. **開關 modal 約 10 次**
   - 關閉後背景立即可滑，不再鎖死。
4. **抽牌／拖曳**
   - 僅牌區不捲動，其餘區域仍可捲動（若日後有拖曳，阻擋範圍僅限牌區）。

### 修復前後對照（Samsung 建議記錄）

- **修復前**：多機型整站無法滑或僅邊緣偶爾可滑。
- **修復後**：  
  - 正式模式（不加 scrollfix）：Samsung/OPPO 依賴「僅 overflow:hidden、不設 body position:fixed」應可正常滑。  
  - Rescue 模式（scrollfix=1）：強制可滑，作為保底。

---

## 根因摘要

| 根因 | 是否找到 | 處理方式 |
|------|----------|----------|
| **A** 全域 touchmove preventDefault | 未發現 | 無需改動；Rescue 有包裝 addEventListener 防呆 |
| **B** fixed overlay 吃事件 | 可能為全版 overlay／fab | Rescue 掃描並設 pointer-events:none；正式模式已縮小 fab hitbox |
| **C** html/body overflow 或 position 被鎖 | 是：scrollLockManager lockScroll | 正式修復：Android 不設 position:fixed，僅 overflow:hidden |
