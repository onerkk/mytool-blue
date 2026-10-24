# 已退役的測試

這些測試在原始上傳版本就已失敗，檢查的是已被取代的舊設計，保留原檔以供查閱，不再執行：

- `lenormand-v4-routing.test.js`：雷諾曼 v4 架構的契約（品牌層、主題牌閘門、身體牌白名單等）。v19–v23 已全面取代，現行 `npm run test:lenormand` 全數通過。
- `prompt-integrity-20261010.cjs`：檢查舊版提示詞版面（「本題作答任務」標題、站內規則逐行）。提示詞已改為「本法正統取法＋完整實算資料」，現行契約見 `tests/orthodox-prompt-contract-20261023.cjs`。

`reading-depth-20260912.cjs` 中檢查站內規則文字的那段斷言同理移除，該檔其餘檢查保留。
