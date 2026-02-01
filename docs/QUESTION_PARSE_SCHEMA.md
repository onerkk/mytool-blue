# 問題解析結構化 Schema

`js/question-parser.js` 的 `parseQuestion(text)` 會產出下列結構化結果，供融合引擎、評分與回扣句使用。

## 輸出格式

```json
{
  "raw": "原始輸入字串",
  "clean": "正規化後字串（去多餘空白）",
  "intent": "love|money|career|health|decision|timing|relationship|other",
  "askType": "yesno|probability|timing|choice|howto|diagnosis",
  "timeHorizon": "today|this_week|this_month|3_months|6_months|1_year|unknown",
  "subject": ["me","someone","company","customer","ex","unknown"],
  "keySlots": {
    "target": "目標（如：收入、業績、感情）",
    "metric": "指標（如：compare、threshold）",
    "threshold": "門檻描述（如：破萬）",
    "constraints": []
  },
  "keywords": ["從 KEYWORDS 比對出的關鍵詞"],
  "mustAnswer": ["答案必須回應的短句或門檻"],
  "type": "probability|general",
  "category": "finance|career|health|relationship|family|general",
  "timeframe": { "currentMonth", "currentYear", "nearTerm", ... }
}
```

## 欄位說明

| 欄位 | 說明 |
|------|------|
| **intent** | 意圖：感情(love)、金錢(money)、事業(career)、健康(health)、決策(decision)、時機(timing)、人際(relationship)、其他(other)。會對應到下游 `category`（如 love→relationship）。 |
| **askType** | 問法：是非(yesno)、機率(probability)、時機(timing)、選擇(choice)、如何(howto)、診斷(diagnosis)。 |
| **timeHorizon** | 時間範圍：今天、本週、本月、三個月、半年、一年、未知。 |
| **subject** | 主體：我(me)、他人(someone)、公司(company)、客戶(customer)、前任(ex)，可多選。 |
| **keySlots** | 目標／指標／門檻，供後續回扣句或評分對齊（如「破萬」「比上月高」）。 |
| **mustAnswer** | 從問句抽出的「必須回答」的焦點（如「會比上月高嗎」「破萬」）。 |

## 相容性

- **category**、**type**、**timeframe**、**keywords**、**raw** 維持與既有邏輯一致，`getCategory`、`FusionEngine.getQuestionType`、`probability-pipeline` 等仍可直接使用。
- **intent** 與 **category** 的對照表為 `INTENT_TO_CATEGORY`（見 `question-parser.js`），下游可依 **intent** 做更細的文案或權重。

## 擴充建議

- 新增意圖：在 `detectIntent()` 內加關鍵字或正則，並在 `INTENT_TO_CATEGORY` 補對應的 category。
- 新增 askType：在 `detectAskType()` 內加句型。
- 擴充 keySlots：在 `extractKeySlots()` 內加目標／門檻／條件的擷取規則。
