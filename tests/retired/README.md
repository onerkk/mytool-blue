# 已退役的測試

這些測試在原始上傳版本就已失敗，檢查的是已被取代的舊設計，保留原檔以供查閱，不再執行：

- `lenormand-v4-routing.test.js`：雷諾曼 v4 架構的契約（品牌層、主題牌閘門、身體牌白名單等）。v19–v23 已全面取代，現行 `npm run test:lenormand` 全數通過。
- `prompt-integrity-20261010.cjs`：檢查舊版提示詞版面（「本題作答任務」標題、站內規則逐行）。提示詞已改為「本法正統取法＋完整實算資料」，現行契約見 `tests/orthodox-prompt-contract-20261023.cjs`。

- `lenormand-v7-principle-engine.test.js`：雷諾曼 v7 時期的提示詞範本逐字檢查（「雷諾曼語義產出引擎」等站內規則文字，原始上傳即失敗，已被正統取法取代）。其中仍有效的選陣規則——三個以上方案「每個方案各一條同結構牌線並列比較」（實務通行做法；九宮格為單一處境的肖像牌陣，不用於多選項比較）——已移入 `tests/fixtures/spread-routing-battery-20261023.cjs`。

`reading-depth-20260912.cjs` 中檢查站內規則文字的那段斷言同理移除，該檔其餘檢查保留。
