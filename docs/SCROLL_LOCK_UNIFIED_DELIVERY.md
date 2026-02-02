# 捲動鎖定一次到位修復（跨裝置 iOS / Samsung / OPPO）

## 問題與目標
- **問題**：同站在不同裝置會「突然不能滑動」（iOS / Samsung / OPPO 皆曾發生），屬 Scroll Lock / Touch 阻擋 / 容器 overflow 錯置。
- **目標**：單一滾動容器 + 集中式 scrollLockManager + overlay pointer-events 管控 + 無裝置專用 hack；Modal 開啟可鎖背景、關閉必恢復。

---

## 修改檔案一覽

| 類型 | 檔案 | 變更摘要 |
|------|------|----------|
| **新增** | `js/scrollLockManager.js` | 集中式 lockScroll / unlockScroll，計數器、iOS 捲動恢復、getState |
| **新增** | `js/scroll-debug.js` | ?debug=1 時 SCROLL_DEBUG()、Debug Overlay、forceUnlock、執行捲動驗收 |
| **修改** | `index.html` | 移除 Samsung 專用 script；加入 --vh、scrollLockManager.js、scroll-debug.js |
| **修改** | `js/main.js` | DOMContentLoaded 改為 forceUnlock；custom-order 開/關改用 scrollLockManager；global-loading-overlay 顯示/隱藏時 lock/unlock；debugScroll 改呼叫 SCROLL_DEBUG |
| **修改** | `css/main.css` | 移除 body.custom-modal-open #page-scroll overflow:hidden；overlay 隱藏時 pointer-events:none + visibility:hidden；modal.active 時 pointer-events:auto；html/body 加入 --vh fallback |
| **修改** | `css/responsive.css` | 移除 html.samsung-scroll-fix 整段（改為註解說明） |

---

## scrollLockManager 檔案位置與 API

- **位置**：`js/scrollLockManager.js`（須在 main.js 之前載入）
- **API**：
  - `scrollLockManager.lockScroll()`：鎖定背景捲動（modal/loading 開啟時呼叫）
  - `scrollLockManager.unlockScroll()`：解除鎖定（關閉時必呼叫）
  - `scrollLockManager.getState()`：回傳 { lockCount, htmlOverflow, bodyOverflow, bodyPosition, overlays, activeModalCount, ... }
  - `scrollLockManager.forceUnlock()`：強制 lockCount=0 並恢復 body 樣式（用於清除殘留）
- **規則**：禁止在專案其他處直接寫 `document.body.style.overflow='hidden'`，一律透過 scrollLockManager。

---

## 關鍵搜尋點（原本可能鎖住/擋住的地方）

- **body overflow**：已移除各處直接改 body.style.overflow；僅在 `main.js` DOMContentLoaded 做一次清除並改為 `scrollLockManager.forceUnlock()`。
- **Samsung 專用**：`index.html` 內「三星單指捲動」inline script 已移除；`responsive.css` 內 `html.samsung-scroll-fix` / `body` / `#page-scroll` 的 overflow:hidden 與 100vh 捲動容器已移除，改為全站 **body 滾動**。
- **Modal 鎖定**：`body.custom-modal-open #page-scroll { overflow: hidden }` 已移除，改由 scrollLockManager 鎖 body（position:fixed + top:-scrollY 於 iOS/Android）。
- **Overlay 觸控**：`.global-loading-overlay[hidden]` 與 `.custom-order-modal:not(.active)` / `.card-interpretation-modal:not(.active)` 設為 `pointer-events:none`、`visibility:hidden`，避免透明覆蓋攔截 touch。

---

## 驗收方式（?debug=1）

1. 開啟 `?debug=1` 或 `?debug=scroll`，會出現底部 Debug Overlay 與按鈕。
2. **SCROLL_DEBUG()**：點按鈕或於 console 執行 `SCROLL_DEBUG()`，會輸出目前 html/body overflow、lockCount、overlays、isTouchBlocked 等。
3. **forceUnlock**：若頁面被鎖住，點「forceUnlock」可強制恢復捲動。
4. **執行捲動驗收**：點「執行捲動驗收」會跑 5 項檢查（首頁可捲、開 modal 鎖定、關 modal 恢復、快速 10 次無殘留、實機驗證提示），結果會印在 console 並更新 overlay。

**硬性規則**：任何時候只要頁面不可滑，都應能在 SCROLL_DEBUG 看到是哪個 overlay 或 lockCount 造成，並可透過 `scrollLockManager.forceUnlock()` 或正常關閉 modal 恢復。

---

## Viewport 與 safe-area

- **--vh**：`index.html` 內已加 `setVh()`，`document.documentElement.style.setProperty('--vh', ...)`，resize/orientationchange 時更新。
- **CSS**：`html`/`body` 使用 `min-height: 100vh`、`min-height: calc(var(--vh, 1vh) * 100)`、`min-height: 100dvh`。
- **iOS safe-area**：沿用 `ios-fixes.css` 與既有 `env(safe-area-inset-*)`、`viewport-fit=cover`。
