# 靜月之前能量占卜儀 v2.0

Mobile-first 命理占卜系統，整合八字、梅花易數、塔羅牌與水晶建議。

## 資料擴充與網路來源

本系統使用**本地資料庫**。因瀏覽器 CORS 限制，前端無法直接從多數命理網站抓取資料。  
補全資料請參考 `docs/DATA_EXPANSION_GUIDE.md`，依參考來源手動整合至對應 JS 檔。

### 塔羅牌
- 牌義：編輯 `js/tarot-system.js` 的 `TAROT_DATA`
- 依類型正逆位解讀：編輯 `logic/tarot_meanings_by_type.js` 的 `TAROT_MEANINGS_BY_TYPE`
- 凱爾特十字位置：編輯 `logic/celtic_positions.js` 的 `CELTIC_POSITIONS`

### 八字
- 核心邏輯：`js/bazi-system.js`
- 類型建議模板：編輯 `logic/bazi_interpreter.js` 的 `TEMPLATES`

### 梅花易數
- 核心邏輯：`js/meihua-system.js`
- 體用／類型建議：編輯 `logic/meihua_rules.js` 的 `GUA_ADVICE_BY_TYPE`（含 love/career/wealth/health/relationship/family）

### 水晶建議
- 邏輯：`js/crystal-recommendation.js`
- 象徵→行為→喜忌：`logic/crystal_behavior_map.js` 的 `TAROT_TO_BEHAVIOR`、`MEIHUA_TO_BEHAVIOR`
- 對照表：`CRYSTAL_MAPPING`、`CATEGORY_FALLBACK`
- 輸出含：佩戴方式、注意事項、免責聲明

### 融合引擎
- `engine/fusionEngine.js`：機率彙總、直接答案、Top3 因子、3 條建議
- 問題類型對應 base rate：`BASE_RATE_BY_TYPE`
- 建議模板：`getSuggestionsByType` 內依 type 回傳

## PWA / 加入主畫面

- `manifest.json`：提供「加入主畫面」所需資訊（含 192/512 icon）
- `sw.js`：基礎 Service Worker，快取主頁與核心資源
- 以 HTTPS 部署後，iOS Safari、Android Chrome 可將應用加入主畫面

## 如何測試 iOS

1. **Safari**：以 HTTPS 部署後，在 iPhone Safari 開啟網址
2. **LINE WebView**：將連結貼到 LINE 聊天室，點擊在應用內瀏覽器開啟
3. **IG WebView**：在 IG 個人檔案連結填入網址，點擊連結開啟
4. **檢查項目**：
   - 底部是否被安全區（Safe Area）裁切
   - 文字是否提早換行或截斷
   - 浮動按鈕是否遮擋主要內容
   - 輸入框 focus 時是否造成頁面異常縮放（需 `font-size: 16px`）

## 流程

1. 資料輸入（含問題類型、諮詢問題、生辰、地區）
2. 梅花易數（起卦）
3. 塔羅牌（凱爾特十字抽牌）
4. 分析結果（答案、機率、拆解、處方）

## 無障礙（Accessibility）

- 跳至主要內容連結（Tab 鍵可見）
- 維度 Tab 支援鍵盤左右箭頭切換
- 按鈕與 Tab 具 `:focus-visible` 外框
- 維度區塊具 ARIA `role="tablist"` / `role="tab"` / `role="tabpanel"`

## SEO

- `robots.txt`：允許搜尋引擎索引，排除 utils、__pycache__
- `sitemap.xml`：範本檔，部署時請將 `loc` 改為實際網址後，在 robots.txt 加入 `Sitemap: https://你的網址/sitemap.xml`

## 技術

- 無外部 AI API
- 規則型（Pseudo-AI）解讀
- 資料與規則可擴充

## 其他

- `.gitignore`：排除 `__pycache__`、`venv`、IDE 設定等
- 列印：結果頁支援列印，自動隱藏導航與浮動按鈕
