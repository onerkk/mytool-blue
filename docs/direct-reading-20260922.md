# 解讀提示詞修正：20260922direct1

問題來自輸出要求互相疊加：共用規則要求先回答，各功能卻又要求逐項展開、比較詞義與交代分析步驟；部分結尾還再次加強這些要求。選品規則及 API 的舊前端提示詞也會重複引入另一套寫法。

本版以 `JS/reading-quality.js` 作唯一正文規則來源。先回答原問題，接著只寫支撐答案的關鍵依據、實質阻力與行動條件。技法保留為判讀參考；預設不逐張、逐宮或逐句報告，不固定列替代解釋。要求詳解時仍可展開。靈籤先依完整原詩定調，再引用關鍵句；多人題未綁定個別牌位時，不硬分配人物或排名。

選品在正文完成後承接已說明的需要，不另開命理解讀，也不能回頭改寫主判。前端備援快照加入版本檢查，舊快取不得帶回上一版正文要求。

## 套用

ZIP 路徑對應專案根目錄，覆蓋同名檔案。保留新增的 `workers` 目錄。前端資源版本為 `20260922direct1`，Service Worker 快取為 `jy-main-v90`。

主站 `JS/ai-analysis.js` 仍呼叫 `https://jy-ai-proxy.onerkk.workers.dev`。因此，更新 GitHub／Pages 檔案只會更新前端與 Pages 備用 API，不會自動更新獨立 Worker。

`workers/ai-proxy.js` 是由本專案 `functions/api/ai.js` 產生、可獨立使用的 ES Module Worker，含相同提示詞及 JSON 回應介面。若要讓內建 AI 使用此版規則，還需將它部署至對應 Worker，並確認 `ANTHROPIC_API_KEY`、`ADMIN_TOKEN` 與 `RATE_KV` 綁定。此壓縮包沒有執行線上部署，也未讀取任何金鑰。

上傳的原始專案不含目前線上 Worker 原始碼；若它有另外的驗證、計費或路由功能，應將本版提示詞與個案資料組裝邏輯合併至既有 Worker，保留那些功能，不直接覆蓋。備用 API 與產生檔的行為已作離線一致性檢查，無法據此確認未知的線上版本。

## 維護與驗證

修改共用規則或 API 後執行：

```sh
node scripts/sync-recommendation-guides.cjs
node scripts/sync-recommendation-guides.cjs --check
node tests/direct-reading-20260922.cjs
```

產生檔包含各入口的備援快照、根目錄鏡像及 Worker，勿單獨手改。驗證涵蓋實際提示詞組裝、舊版／缺漏共用腳本的備援、原始牌序與籤詩保留，以及模擬 API 傳輸。這些檢查不等同已測試外部模型每次的實際解讀文風。
