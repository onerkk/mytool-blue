# QA 對齊管線交付說明

## 修改檔案清單

| 檔案 | 改動摘要 |
|------|----------|
| **logic/meihua_evidence_data.js** | 新增。水地比／坤為地卦象依 intent（wealth/love/career/health/relationship/general）的 `intent_text` 陣列，每段含 `slotTags`（破萬、營收、訂單、銷售、副業等）與 `timeTags`（this_month/this_week/1_year），供 EvidenceNormalizer 做 supports/timeTags 對齊。 |
| **js/evidence-normalizer.js** | 新增。`normalizeEvidence(systemResult, parsedQuestion)`：統一八字／梅花／塔羅／姓名學輸出為 evidence items `{ system, claim, direction, confidence, timeTags, supports, slotTags }`。梅花使用 MeihuaEvidenceData.getMeihuaIntentTexts 取 slotTags/timeTags；supports 由 mustAnswer + slotTags 推斷。 |
| **js/evidence-selector.js** | 新增。`selectEvidence(parsedQuestion, evidenceItems)`：計分公式 `mustAnswerHit*6 + keywordHit*3 + timeMatch*4 - offTopicPenalty*10`；分數 < 8 回傳 `{ sufficient: false, message: '證據不足…' }`，AnswerSynthesizer 須輸出「需要補充資訊」。 |
| **js/answer-synthesizer.js** | 新增。`synthesize(parsedQuestion, selectionResult, probResult, options)`：固定四段—(1) 問題重述（mustAnswer 至少 70% 覆蓋）、(2) 直接回答（yesno→偏向能/不能；probability→%；timing→時間範圍）、(3) 依據（逐條 evidence）、(4) 行動建議（2～4 點，僅用 INTENT_SUGGESTIONS 該 intent，嚴禁跨域）。證據不足時直接回「需要補充資訊」。 |
| **js/alignment-guard.js** | 新增。`alignmentCheck(parsedQuestion, finalText)`：mustAnswer 覆蓋率 ≥ 70%（含 MUST_ANSWER_SYNONYMS 同義詞）；askType 必要輸出（yesno/probability/timing）須存在。不通過則 `rewriteToDirectAndEvidence` 只保留「直接回答 + 依據」。 |
| **engine/fusionEngine.js** | 修改。`generateDirectAnswer(data)` 優先走對齊管線：parseQuestion → 各系統 normalizeEvidence → selectEvidence → computeProbability → AnswerSynthesizer.synthesize → AlignmentGuard.alignmentCheck；結論用 passed ? fullText : rewritten。任一模組未載入或拋錯則回退至原 buildConclusionByType + factors + suggestions。回傳補上 probabilityValue。 |
| **index.html** | 修改。question-parser 提前至 vocabulary_db 之後；新增 logic/meihua_evidence_data.js、js/evidence-normalizer.js、js/evidence-selector.js、js/answer-synthesizer.js、js/alignment-guard.js 再載入 fusionEngine。並加 `?test=1` 時自動載入 tests/qa_alignment_tests.js 並執行 runQAAlignmentTests()，結果寫入 window.qaAlignmentTestResult。 |
| **tests/qa_alignment_tests.js** | 新增。24 條測試問題（含「副業營收能否破萬」「本月訂單是否比上月高」等）。每條：parseQuestion → 模擬 selectionResult/probResult → AnswerSynthesizer.synthesize → alignmentCheck；檢查 alignmentCheck 通過、askType 必要輸出存在、不得出現 CROSS_INTENT_KEYWORDS 跨域關鍵詞。結果 passed/failed 與失敗原因寫入 console 與回傳物件。 |

## 測試執行方式

- **瀏覽器**：開啟 `index.html?test=1`，載入完成後在 Console 查看輸出，或讀取 `window.qaAlignmentTestResult`（含 passed、failed、results 與各題失敗原因）。
- **手動**：在已載入完整頁面的 Console 執行 `runQAAlignmentTests()`。

## 預期通過／失敗與失敗原因

- **通過**：問題重述與直接回答涵蓋 mustAnswer、askType 為 yesno 時出現「偏向能/不能」或「%」、probability 時出現「%」、timing 時出現時間範圍；且答案未含該 intent 禁止的跨域關鍵詞（例：問財運不出現感情/健康）。
- **可能失敗**：
  1. **mustAnswer 覆蓋不足**：parseQuestion 抽出的 mustAnswer 與合成文案用字不完全一致（如只有「破萬」未出現「本月」），導致 coverage < 70%。可擴充 MUST_ANSWER_SYNONYMS 或放寬重述句必含 mustAnswer 的用詞。
  2. **askType 必要輸出缺失**：yesno 題若合成文案只寫「中性」未寫「偏向能/不能」或「%」，alignmentCheck 會標 missingAskType。需確保 buildDirectAnswer 在 askType=yesno 時一律輸出傾向或機率。
  3. **跨 intent 關鍵詞**：若建議或依據段落誤用他類詞彙（如財運題出現「桃花」），noCrossIntent 會失敗。需確保 INTENT_SUGGESTIONS 與證據文案僅用該 intent 詞庫。

（實際通過/失敗筆數以在您環境開啟 index.html?test=1 執行後之 console 與 window.qaAlignmentTestResult 為準。）
