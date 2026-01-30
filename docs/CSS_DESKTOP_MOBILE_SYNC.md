# 桌面與手機樣式同步說明

## 原則
**網頁有變、手機也要變。** 修改樣式時，若會影響手機版，請同步更新手機用 CSS。

## 大運流年（dayun）
- **桌面：** `css/main.css` — `.dayun-quality`、`.dayun-fortune-type` 系列
- **手機同步：**
  - `css/mobile-fix.css` — `@media (max-width: 768px)` 內「大運流年手機同步」區塊
  - `css/responsive.css` — `@media (max-width: 768px)` 內「大運流年手機同步」區塊
- **更新時：** 改完 main.css 的 dayun 顏色／對比後，請把相同規則複製到上述兩檔的手機區塊，並加上 `!important` 以確保手機套用。

## 其他需同步的區塊
若新增或修改「結果區 (#result-section)」內、且同時影響手機版顯示的樣式，請一併檢查：
- `css/mobile-fix.css`（768px 以下）
- `css/responsive.css`（768px / 480px 區塊）

## 姓名學內容同步（網頁版／手機版）
- **單一來源**：姓名學結果由 `main.js` 的 `displayNameResult()` 渲染（五格、三才、八字聯動、建議、重要說明）。
- **result-generator.js**：點擊「姓名學」分頁或生成報告時，若 `window.fortuneSystem.analysisResults.nameology` 存在，改為呼叫 `fortuneSystem.displayNameResult()`，不再使用舊版簡化模板，確保網頁版與手機版顯示一致。
