# 已退役的測試

這些測試在原始上傳版本就已失敗，檢查的是已被取代的舊設計，保留原檔以供查閱，不再執行：

- `lenormand-v4-routing.test.js`：雷諾曼 v4 架構的契約（品牌層、主題牌閘門、身體牌白名單等）。v19–v23 已全面取代，現行 `npm run test:lenormand` 全數通過。
- `prompt-integrity-20261010.cjs`：檢查舊版提示詞版面（「本題作答任務」標題、站內規則逐行）。提示詞已改為「本法正統取法＋完整實算資料」，現行契約見 `tests/orthodox-prompt-contract-20261023.cjs`。

- `lenormand-v7-principle-engine.test.js`：雷諾曼 v7 時期的提示詞範本逐字檢查（「雷諾曼語義產出引擎」等站內規則文字，原始上傳即失敗，已被正統取法取代）。其中仍有效的選陣規則——三個以上方案「每個方案各一條同結構牌線並列比較」（實務通行做法；九宮格為單一處境的肖像牌陣，不用於多選項比較）——已移入 `tests/fixtures/spread-routing-battery-20261023.cjs`。

`reading-depth-20260912.cjs` 中檢查站內規則文字的那段斷言同理移除，該檔其餘檢查保留。

## 2026-10-28 追加停用

以下測試鎖定的是已被「本法正統取法」單次貼上提示詞取代的舊文案或舊格式（「第一句就回答原問題」、分段貼上 parts、本題焦點層、固定手鍊句型、「最強反證限制的是哪一層」等），原始上傳即失敗，不再執行：

- `reader-voice-20260923.cjs`、`counsel-voice-20261014.cjs`、`practitioner-narrative-20261014.cjs`、`plain-language-20261014.cjs`、`reading-depth-regression-20260927.cjs`、`reading-grounding-20260924.cjs`：舊口吻規則逐字檢查。
- `recommendation-20260914.cjs`、`ootk-flow-20260915.cjs`：舊手鍊推薦句型。
- `ootk-reading-pipeline-20261005.cjs`：分段貼上（parts）格式，現為單次貼上。
- `prompt-only-audit-20260923.cjs`、`reading-workflow-integration-20260924.cjs`：舊匯出路徑（未載入 prompt-packet 的 legacy 版面）。
- `focus-audit-20261023.cjs`：本題焦點層已依決定移除。

現行行為由 `tests/single-paste-*.cjs`、`tests/orthodox-prompt-contract-20261023.cjs`、`tests/prompt-budget-20261003.cjs`、`tests/mirror-parity-20261023.cjs` 保護。要恢復某項規則時，請在現行測試新增斷言，而不是直接搬回。

同日修正而非停用：版本號斷言改為「不低於」；`mobile-ritual-actions` 的快取名稱改認內容雜湊格式；`interaction-hotfix` 移除已刪的「驗證訊號」文案斷言；`dom-fixture` 補 `insertAdjacentElement`；`name-original` 字表雜湊更新為現行字表。
