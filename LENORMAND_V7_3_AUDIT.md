# Petit Lenormand v7.3 根治稽核報告

日期：2026-06-19  
範圍：`JS/lenormand.js`、`JS/selftest-core.js`、`index.html`  
案例：**「我副業什麼時候才能成功，讓我負債完全清空，有正資產」**

## 一、稽核結論

原 v7.2 提示詞比早期版本更受控，但這個案例仍有結構性錯誤，不能只靠增加一句禁語修補：

1. **命題拆分不完整**：程式只產生「副業成功」與泛用「財務」兩題，把「負債歸零」「正資產」「何時」混在同一文字裡。這使模型可用成功證據代替清債證據，也可把清債與正資產合併成同一強度。
2. **時間不是獨立判定**：使用者明確問「什麼時候」，但舊流程只把時間掛在其他命題上。輸出雖說無法判定日期，仍容易使用「先……才……」「接著」「轉折」等未授權的先後／因果語言。
3. **claim_plan 過度寬鬆**：`business_success` 與 `finance` 都落入通用 `model_evaluate`，沒有定義成功、完全清債、正資產各自需要什麼證據。
4. **證據簇有語意合併偏差**：舊分簇可因同屬「工作／財務」主題，把不同焦點位置的結構併在一起；同一物理牌對也可能在不同命題被當成全新信心來源。
5. **selected_context 不夠乾淨**：標示 `novelty_filtered=true`，但仍可能重複核心 D／S 所含位置、輸出互為反向的騎士跳，或在財務題出現情感主題，造成模型誤把背景脈絡升級成主張。
6. **AI 成品有越權內容**：原回答中的「集中有效商品、切除長期耗損品項、固定追蹤毛利與成交來源」「網路銷售」等，並非 approved claims、牌義字典或證據封包核准的內容；屬於把象徵牌義改寫成具體營運顧問建議。
7. **第一句未依命題逐一回答**：原回答將「負債完全清空」與「正資產」合併處理，沒有維持兩項結果各自的證據門檻。
8. **水晶推薦仍可能受題目類別牽引**：雖已移除固定白水晶，但若只因題目含商業／財務就選黃水晶，仍不是真正依正文主結論選擇。

本次不是加關鍵字補丁，而是重建「命題編譯 → 專屬證據門檻 → 最小充分證據血緣 → 受控提示詞 → 回歸測試」主流程。

---

## 二、可核實的歷史基線與本站規約邊界

### 2.1 一手館藏可確認的內容

大英博物館館藏編號 `1896,0501.495` 記載《Das Spiel der Hofnung》為完整 **36 張**牌組，並附有 **4 頁印刷說明**。館藏資料可確認牌組、出版資訊與說明書存在，但沒有替現代網站的 D／S／C、鏡像、騎士跳、房屋計分或結論門檻背書。

來源：
- British Museum, *Das Spiel der Hofnung*, museum no. 1896,0501.495  
  https://www.britishmuseum.org/collection/object/P_1896-0501-495

### 2.2 保存說明書的占卜排法

現存 4 頁說明書的英譯本在最後一頁記載：洗混 36 張後，排成 **前四排各 8 張、第五排 4 張**；女性由第 29 張附近開始敘述，男性由第 28 張附近開始敘述。

這能支持本站把 **4×8+4** 與 **人物牌附近閱讀**稱為保存至今的說明書傳統。它不能證明：

- 任意兩張相鄰牌必然構成因果；
- 完整線段必然表示時間或發展方向；
- 房屋、鏡像、騎士跳有單一官方讀法；
- 分簇、門檻、權重或 certainty cap 是歷史原規則；
- 任何現代牌義字典是唯一「正統」。

來源：
- Steph Myriel Es-Tragon, *Game of Hope Translation*（英譯本，第 4 頁）  
  https://www.divinemuses.net/uploads/2/1/6/1/2161377/gameofhope.pdf

### 2.3 本次採取的正確標示

新版明示三層：

1. **館藏事實**：36 張牌與 4 頁說明書。
2. **保存說明書傳統**：4×8+4、由 28／29 附近敘述。
3. **本站現代工程規約**：approved dictionary、D／S／C、房屋、鏡像、騎士跳、分簇、門檻、計分與 certainty cap。

因此不再使用「每一步都是唯一現代正統」這種無法由一手資料證明的宣稱。能核實的部分明確標示來源；本站自行設計的部分明確標示為規約。

---

## 三、官方提示工程文件核對

### 3.1 關鍵規則前置

OpenAI 官方建議把指令放在提示詞前方，並用清楚分隔符區分指令與資料；也建議明確描述結果、長度與格式。新版把不可越權的規則放在最前方，再放 XML 化資料封包與輸出契約。

來源：
- OpenAI, *Best practices for prompt engineering with the OpenAI API*  
  https://help.openai.com/en/articles/6654000-best-practices-for-prompt-engineering-with-openai-api
- OpenAI API, *Prompt engineering*  
  https://developers.openai.com/api/docs/guides/prompt-engineering

### 3.2 明確資料邊界與一致結構

Anthropic 官方文件建議使用清楚、直接、具體的指示；複雜提示可使用一致、描述性的 XML 標籤，並在有自然階層時巢狀化。新版以 `reading_request`、`evidence_packet`、`claim_plan`、`claim_evidence`、`selected_context`、`presentation_footer` 分離不同權限的資料。

來源：
- Anthropic, *Prompting best practices*  
  https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices

### 3.3 複雜提示拆分與一致格式

Google Gemini 官方提示設計文件建議：複雜提示應拆成較簡單元件，採一致結構，優先放置關鍵限制，並明確控制輸出冗長度。新版不再讓單一泛用 finance 命題承擔成功、清債、正資產與時間四種結果，而是先由程式拆成四個封包。

來源：
- Google AI for Developers, *Prompt design strategies*  
  https://ai.google.dev/gemini-api/docs/prompting-strategies

### 3.4 評測而非只靠目測

OpenAI 官方文件建議固定模型版本並建立 evals，以便在提示或模型版本變更時監控行為。Anthropic 也把明確成功條件與可實證測試列為提示工程前提。因此新版把本案例加入自動化回歸測試，不以「看起來有改」作為完成標準。

來源：
- OpenAI API, *Prompt engineering*  
  https://developers.openai.com/api/docs/guides/prompt-engineering
- Anthropic, *Prompt engineering overview*  
  https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview

---

## 四、根治修改

### 4.1 命題編譯器

輸入：

> 我副業什麼時候才能成功，讓我負債完全清空，有正資產

現在固定拆成：

1. `business_success`：副業是否具備可持續成功條件。
2. `debt_clearance`：負債是否能完全清償歸零。
3. `positive_net_worth`：是否能達到資產大於負債。
4. `timing`：上述結果的具體時間是否可判定。

四題互不借證，第一句必須依序回答四題。

### 4.2 時間 fail-closed

本站目前沒有啟用時間／應期規則，所以 `timing` 命題：

- 不建立焦點牌；
- 不產生 D／S／C；
- `claim_evidence` 標示 `basis="rule_limit"`；
- 禁止牌號、座標、房屋、線段或方向換算年月日；
- 禁止把靜態結構寫成「先、接著、最後、才會」。

這不是「牌面顯示時間不明」，而是方法本身沒有提供可驗證的時間規則。

### 4.3 成功、清債、正資產各自門檻

- **副業成功**：商業焦點必須與成功／成長／開展支持形成核心結構；只有魚、狐狸、錨或「有收入」不能等於成功。
- **完全清債**：必須同時存在資源改善與債務壓力終止／切減兩類支持；單獨出現熊、魚、鐮刀或副業成功都不能等於負債歸零。
- **正資產**：必須有資源成長與穩定支持；清債、收入或成功任一項都不能單獨替代「資產大於負債」。

每項 approved claim 只連到最小充分的 C 集合，最多兩個代表簇，避免同一現象因牌對與長線同時出現而灌高信心。

### 4.4 證據血緣

- 每個實體 D／S 產生跨命題共用的 `evidence_uid`。
- 同一實體結構即使同時服務多個 proposition，也不能被當成多份獨立信心。
- AI 只能引用 `claim_evidence` 指定的 C 建立該主張。
- 沒有指定 C 的限制型主張只可依 `rule_limit` 輸出。

### 4.5 selected_context 去重

新版：

- 移除已被 D／S 覆蓋的位置；
- 鏡像與騎士跳採無向去重，A↔B 不再同時輸出 B↔A；
- 每類脈絡設上限；
- 財務與商業命題不再輸出「情感／承諾」或「性／感官」等題外主題；
- selected_context 仍不得新增主張或提高 certainty。

### 4.6 禁止把牌義變成營運顧問指令

新增正面範例與局部 forbidden claims：

- 可以寫「工作／資源／穩定結構受到阻礙」。
- 不可以自行寫成「清庫存、投廣告、調價格、追毛利、提高客單價、改成交來源」。

除非這些內容已由其他非占卜資料明確提供，否則它們不是牌面證據。

### 4.7 水晶推薦與正文對齊

候選仍由問題與核心證據召回，但最終選擇改為：

1. 先完成正文。
2. 找出正文最主要的 approved claim。
3. 只有 symbolic direction 能直接對應該主張時才可推薦。
4. 不能只因題目是商業／財務就自動選黃水晶。
5. 若主結論以阻礙、損耗、切斷或負擔為主，先比對界線／限制方向。
6. 無真正吻合者輸出「本題不強行推薦水晶。」

礦物事實與象徵方向維持分離：

- GIA：黃水晶是石英，化學成分 SiO₂，莫氏硬度 7。  
  https://www.gia.edu/jp/gem-education/gem-encyclopedia/gem-encyclopedia/citrine
- GIA：虎眼石的貓眼光帶由定向纖維狀礦物包裹體形成。  
  https://www.gia.edu/gems-gemology/summer-2025-phenomenal-gemstones
- USGS：黑曜石是快速冷卻、富矽流紋質熔岩形成的天然火山玻璃。  
  https://www.usgs.gov/observatories/yvo/news/yellowstones-tool-making-lava-flows

---

## 五、原 AI 成品逐項判定

| 項目 | 判定 | 原因 |
|---|---|---|
| 副業具有成功條件 | 部分可保留 | 有正向核心結構時可在 certainty cap 內表達，但不能延伸成必然成功。 |
| 負債歸零與正資產合併回答 | 錯誤 | 兩者是不同結果，證據門檻不同。 |
| 無法判定具體時間 | 結論正確、流程不完整 | 舊版沒有獨立 timing packet；新版改為 rule-limit 空證據包。 |
| 「先停止損耗，才有條件……」 | 錯誤 | 未啟用時間／因果規則，不能把靜態結構寫成先後流程。 |
| 「集中有效商品、切除品項、追蹤毛利」 | 越權 | 不是 approved claim、牌義或證據封包內容。 |
| 「跨區交易或網路銷售」 | 越權 | 船只核准為旅行／貿易／遠方，不能自行具體化成特定通路。 |
| 黃水晶推薦 | 不能單憑舊輸出確認 | 必須先判定正文最主要 approved claim，而非只看題目屬商業。 |
| 分析深度 | 表面足夠、證據紀律不足 | 段落多不等於深度；真正深度應是每項主張有獨立門檻、反證與未知邊界。 |

---

## 六、驗證結果

### 已通過

- `JS/lenormand.js` JavaScript 語法檢查：通過。
- `JS/selftest-core.js` JavaScript 語法檢查：通過。
- 雷諾曼行為回歸：**41／41 通過**。
- 本案例：正確拆成四個 proposition。
- timing packet：0 個 D／S／C，狀態為 `timing_rules_not_enabled`。
- business／debt_clearance／positive_net_worth：皆使用專屬 claim plan，未落入通用 `model_evaluate`。
- 每項財務複合主張：claim evidence 最多連到兩個最小充分 C。
- 跨命題相同物理 D／S：共用 evidence UID。
- 財務 selected context：不再輸出情感／性主題。
- 樣本提示詞長度：約 **12,326 字元**，低於既有 14,000 字元回歸上限。
- 動態水晶候選：使用本題與核心 evidence packet，不讀大牌陣全部 36 張作固定召回。

### 全站靜態測試的誠實狀態

全站靜態簽名測試結果為 **121 通過、2 失敗**。兩項失敗都來自未修改的 `ink-flow.js` 舊基線缺少 `v1.1／面板內掛載` 字串，與本次雷諾曼修改無關。因此本報告不宣稱「全站 123／123 全過」，只宣稱雷諾曼相關測試全部通過。

---

## 七、變動檔案

1. `JS/lenormand.js`
2. `JS/selftest-core.js`
3. `index.html`
4. `LENORMAND_V7_3_AUDIT.md`

