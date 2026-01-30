# 桌面與手機同步說明（網頁與手機同步更新）

## 原則
- **網頁有變、手機也要變。** 修改樣式時，若會影響手機版，請同步更新手機用 CSS。
- **邏輯單一來源**：結果區內容（八字、梅花、塔羅、姓名學、交叉驗證）均由 `main.js` 等共用模組渲染，**同一份程式碼同時服務網頁與手機**，改一處即同步，無需分開維護。
- **手機版沒更新時**：多為瀏覽器快取。請 (1) 重新整理頁面（必要時「強制重新載入」／清除快取），或 (2) 部署後使用 `index.html` 內建的 `?v=3.3` 快取破壞參數（發版時可改版號如 `?v=3.4`）讓手機載入最新 JS/CSS。

## 大運流年（dayun）
- **桌面：** `css/main.css` — `.dayun-quality`、`.dayun-fortune-type` 系列
- **手機同步：**
  - `css/mobile-fix.css` — `@media (max-width: 768px)` 內「大運流年手機同步」區塊
  - `css/responsive.css` — `@media (max-width: 768px)` 內「大運流年手機同步」區塊
- **更新時：** 改完 main.css 的 dayun 顏色／對比後，請把相同規則複製到上述兩檔的手機區塊，並加上 `!important` 以確保手機套用。

## 十二長生 UI
- **桌面：** `css/main.css` — `.longevity-group`、`.longevity-grid`、`.longevity-item`、`.longevity-pillar-name`、`.longevity-value`（四柱網格卡片，與十神分析一致）。
- **手機同步：** `css/mobile-fix.css` — `@media (max-width: 768px)` 內「十二長生手機同步」區塊；`css/main.css` 內 768px 媒體查詢亦有對應縮小。
- **更新時：** 若調整十二長生卡片樣式，請同步上述兩處。

## 其他需同步的區塊
若新增或修改「結果區 (#result-section)」內、且同時影響手機版顯示的樣式，請一併檢查：
- `css/mobile-fix.css`（768px 以下）
- `css/responsive.css`（768px / 480px 區塊）

## 姓名學內容同步（網頁版／手機版）
- **單一來源**：姓名學結果由 `main.js` 的 `displayNameResult()` 渲染（五格、三才配置、八字聯動、建議、重要說明）。三才配置解讀僅顯示一則（優先 `sancaiTrait`，避免與 config 的 description 重複）。
- **四維度分頁與報告**：分頁切換與報告生成均在 `main.js` 中處理；點擊「姓名學」分頁時直接顯示 `displayNameResult()` 的內容，**網頁與手機同步更新**，無需另做手機版邏輯。

## 發版時讓手機同步（必做）
- 每次部署新程式後，請將 `index.html` 中所有 `?v=3.x` 改為新版號（例如 `?v=3.3`），否則手機可能繼續使用舊快取的 JS/CSS，導致「手機未同步」。
- 使用者若仍看到舊版：請在手機瀏覽器使用「強制重新載入」或清除該站快取後再開。
