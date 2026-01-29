# 概率流程架構（問題 → 解析 → 方法選擇 → 平行分析 → 概率整合 → 輸出）

## 流程概覽

```
問題輸入 → 問題解析 → 方法選擇 → 平行分析 → 概率整合 → 結果輸出
```

1. **問題輸入**：用戶問題文字（如「這月收入會比上月高嗎？」）
2. **問題解析**：`parseQuestion(text)` → 類型、分類、時間範圍、關鍵詞
3. **方法選擇**：`selectMethods(parsed)` → 依分類決定啟用 八字 / 姓名學 / 梅花易數 / 塔羅
4. **平行分析**：各方法 `analyze(question, context)` → `{ probability, confidence, symbols, reasoning, rawResult }`
5. **概率整合**：`integrate(results)` → 加權綜合概率、明細、解釋
6. **結果輸出**：`run(questionText, context)` → `output`

## 模組與腳本

| 檔案 | 說明 |
|------|------|
| `question-parser.js` | `parseQuestion(text)`：類型（probability/general）、分類（finance/career/health/relationship）、時間範圍、關鍵詞 |
| `method-selector.js` | `selectMethods(parsed)`：回傳 `{ bazi, nameology, meihua, tarot }` 布林值 |
| `probability-calculators.js` | `BaziProbabilityCalculator`、`NameologyProbabilityCalculator`、`PlumBlossomProbabilityCalculator`、`CelticCrossProbabilityCalculator`，各自 `analyze(question, context)` |
| `probability-integration.js` | `integrateProbabilities(results, opts)`：依 confidence × reliability 加權，產出 `overall`、`breakdown`、`explanation` |
| `probability-pipeline.js` | `runProbabilityPipeline(questionText, context)`、`runProbabilityPipelineFromPage()` |

## Context 格式

```js
{
  birth_datetime: '1983-08-25T14:55:00',  // 或 birthDate
  gender: 'male' | 'female',
  name: '中文姓名',
  birthYear: 1983,           // 選填，姓名學生肖用
  cards: [                   // 選填，塔羅凱爾特十字 10 張
    { id: 'major_1', name: '魔術師', isReversed: false }
  ],
  useSolarTime: true,
  longitude: 120.2
}
```

## 使用方式

### 程式呼叫

```js
var result = runProbabilityPipeline('這月收入會比上月高嗎？', {
  birth_datetime: '1983-08-25T14:55:00',
  gender: 'male',
  name: '王小明',
  birthYear: 1983,
  cards: []  // 無塔羅則跳過塔羅
});

console.log(result.output.overallPercent);   // 綜合機率 0–100
console.log(result.output.breakdown);        // 各方法明細
console.log(result.output.explanation);      // 文字解釋
```

### 從頁面表單執行

在分析頁載入後，表單與塔羅抽牌等齊備時：

```js
var result = runProbabilityPipelineFromPage();
if (result && result.output) {
  // 使用 result.output.overallPercent, .breakdown, .explanation
}
```

`runFromPage` 會從 `#question`、`#name`、`#birth-date`、`#birth-time`、`input[name="gender"]:checked` 以及 `TarotModule.drawnCards`（若有）組出 `context`，再呼叫 `run`。

## 各方法概率與置信度

- **八字**：五行、喜忌、身強弱 → 依分類 focus 加減分；confidence 依八字完整性。
- **姓名學**：五格、81 數理、分類吉數（財運/事業等）→ 依數理與 `overallScore` 映射；confidence 固定 0.7。
- **梅花易數**：隨機起卦 → 本卦吉凶 + 體用生克調整 → 映射區間；confidence 0.75。
- **塔羅**：凱爾特十字 10 張 → 牌義關鍵字、位置權重（必要時 Golden Dawn 分析）→ 加權機率；confidence 0.65+。

整合時權重 = `confidence × reliability`（各方法 reliability 見 `probability-integration.js`）。

## 依分類的方法選擇

- **finance / career / relationship**：四種方法皆啟用。
- **health**：關閉姓名學，其餘啟用。
- **general**：四種皆啟用。

## 腳本載入順序

`question-parser`、`method-selector`、`probability-calculators`、`probability-integration`、`probability-pipeline` 須於 `bazi-system`、`nameology-system`、`meihua-system`、`tarot-system` / `tarot-golden-dawn-system` 之後，`main.js` 之前。
