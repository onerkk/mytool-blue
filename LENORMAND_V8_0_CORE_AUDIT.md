# Petit Lenormand v8.0 固定公式核心稽核

更新日期：2026-06-19  
網站版本：v88.6  
引擎版本：Lenormand v6.0 / method profile `site_petit_lenormand_v8_0_canonical_formula`

## 結論

本次不是再替某一種問題增加例外，而是移除舊引擎的「每題各自取證、各自分簇、各自補限制」流程，改成全題型共用同一條可測試管線：

> 問題拆成命題 → 命題套用 declarative gates → 從同一公式自動生成取證池 → 只讀直接相鄰原子牌對 → 每個 required gate 使用不同物理證據 → 程式生成 claim plan → LLM 僅轉寫核准主張

這是一套本站明示、可回歸測試的工程公式，不宣稱是歷史說明書或任何國際組織認證的唯一「現代正統公式」。

## 一、史料能證明與不能證明的範圍

### 可直接核實

英國博物館館藏 `1896,0501.495` 記錄《Das Spiel der Hofnung》為完整 36 張牌，並附一份 4 頁印刷說明。館藏頁：

- https://www.britishmuseum.org/collection/object/P_1896-0501-495

保存說明書的英譯資料記載占卜排列可採四排各八張、第五排四張，男性由 28 號人物牌、女性由 29 號人物牌開始，圍繞人物牌附近的牌敘述。該英譯不是博物館官方逐字轉錄，因此本站只把它當作保存文本的翻譯參考，不把後世附加技法冒充原文。

### 不能宣稱為歷史官方公式

下列方法沒有由英國博物館館藏頁證明為原始說明書的固定算法：

- 八方相鄰的精確幾何定義
- 房屋、鏡像、騎士跳
- D／S／C 命名
- 證據分數、certainty cap
- 桃花、財務、升遷、性事件等現代命題門檻
- 水晶推薦

因此新版把它們明確標成本站工程規約。

## 二、固定公式

### 1. 唯一信心證據單位

- **直接相鄰牌對**是唯一能提高結論強度的證據。
- 每一個物理牌對建立一個原子 C。
- 不再把同一核心牌周圍多個牌對合併成一個超大 C。
- 同一物理牌對全題只登錄一次、只算一票。
- 相依命題可引用同一證據，但重複引用不增加信心。

網站對「附近」採明示的八方相鄰工程定義。這是為了讓程式可重現，不宣稱原始說明書已規定八方幾何。

### 2. 三張窗只作語境

- 只建立連續三張的 context window。
- context window 不進入 `claim_evidence`。
- 不可單獨建立人物意圖、事件、時間、因果或結果。
- 不輸出長線、鏡像、騎士跳、房屋與交會資料牆給 LLM。

### 3. 命題 gate

所有可判命題都以資料方式宣告：

- `required`：成立所需 gate
- `gates`：每個 gate 的左右牌組與角色
- `success`：全部 required gates 成立時的最大結論
- `partial`：只成立部分 gate 時的降級結論
- `fail`：門檻不足時的結論
- `risk`：獨立限制證據
- `boundary`：無論牌面如何都不能越過的邊界

編譯器對所有題型使用同一算法，不再為某一道自然語言問題新增判讀分支。

### 4. 單一語義來源

舊版同時維護：

1. 題型 core／support 牌表
2. proposition gate 牌表

兩份資料一旦不同步，就會發生「公式需要某張牌，但取證池根本沒把它取進來」的錯誤。新版已刪除第二份題型取證表，取證池直接由同一份 proposition gate 展開。

### 5. 不在 gate 前截斷證據

舊版會先把直接牌對截斷為 24 組，再判斷 gate，可能在牌對較多時提前刪掉真正需要的證據。新版保留所有合法直接相鄰牌對，最後才由 gate 選出最小充分證據。

### 6. 複合結果必須使用不同證據

事件或結果型命題的每一個 required gate，必須由不同 `evidence_uid` 支持。例如：

- 肉體事件：桃花核心＋感官成分＋接觸落實，三個不同直接牌對
- 副業成功：商業連結＋成功／成長結果，兩個不同直接牌對
- 清償負債：資源改善＋債務壓力終止／切減，兩個不同直接牌對
- 正資產：資源成長＋穩定，兩個不同直接牌對
- 升遷：職務變動＋權威／正式確認，兩個不同直接牌對

一張牌或一個牌對不能同時假裝完成多個 gate。

### 7. 階層命題不倒掛

桃花、感官成分、肉體事件採階層式但獨立的命題：

- 桃花成立不等於性成分成立。
- 性成分成立不等於事件成立。
- 性事件若成立，其桃花與感官必要 gate 必須也各自成立。
- 同一底層牌對可被上位命題引用，但 evidence ledger 只計一次。

這修正了舊「證據獨占」可能造成的低階失敗、高階反而成立問題。

### 8. 人物歸屬

- 人物主張必須讓人物牌與被主張的主題出現在同一直接牌對。
- `hypothetical` 人物牌永遠不能證明真人已出現。
- 對方意圖類命題必須是 identified 對象；否則直接 fail closed。
- 人物牌與遠方主題在同一直線上，不等於互有意圖或事件已發生。

### 9. fail-closed

以下題目沒有獨立規則時，使用零牌面證據：

- 具體時間
- 數字年齡／年齡區間
- 醫學病因、診斷、藥效與治療結果

不以牌號、座標、房屋或方向換算。

## 三、LLM 提示詞架構

新版 runtime prompt 只保留：

1. 最高規則
2. 公式契約
3. propositions
4. 全題唯一 evidence ledger
5. 每題 claim plan 與 evidence references
6. 實際使用牌的必要詞典
7. 輸出契約

移除：

- 未核准的完整牌陣
- selected context 資料牆
- core clusters 資料牆
- 長線 S
- 房屋、鏡像、騎士跳、交會
- 重複的題型牌表
- 同一句限制在多個區塊反覆出現

OpenAI 官方建議用明確的指令層級、Markdown／XML 劃分邏輯邊界，並以 evals 反覆驗證；OpenAI 也提醒 reasoning model 適合直接、清楚的提示，不需要要求模型輸出逐步思考。Google 官方建議將複雜工作拆成較小元件，以提高可控性、除錯性與準確度。Anthropic 官方則明確指出，並非所有失敗都應繼續加長提示詞，應先定義成功標準與可實證的評估。

官方技術來源：

- https://developers.openai.com/api/docs/guides/prompt-engineering
- https://developers.openai.com/api/docs/guides/reasoning-best-practices
- https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/prompts/break-down-prompts
- https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview

## 四、驗證結果

### 專屬行為測試

- 雷諾曼共用核心行為測試：22／22 通過
- 測試內容包含：
  - 命題路由
  - declarative gate 完整性
  - 取證池由 gate 自動生成
  - 原子牌對
  - required gates 的 UID 獨立
  - 時間／年齡／醫療零證據
  - 性命題階層一致
  - evidence ledger 唯一性
  - 提示詞降噪
  - 比較題對稱守門
  - 水晶推薦候選制

### 壓力測試

以 1,000 組決定性洗牌、8 類問題矩陣測試：

- 總 evidence packets：17,000
- 實際組裝 prompts：2,000
- packet validation 失敗：0
- 非直接牌對進入 claim evidence：0
- 複合 gate 重複使用同一 UID：0
- 性命題階層倒掛：0
- evidence ledger 重複登錄：0
- claim 引用不存在的 evidence：0
- 舊 selected context／core cluster／長線資料洩漏：0
- 超過 12,000 字元：0
- 最大 prompt：9,924 字元

## 五、變動檔案

- `JS/lenormand.js`
- `JS/selftest-core.js`
- `index.html`
- `LENORMAND_V8_0_CORE_AUDIT.md`

## 六、限制

這套公式能根治的是：同一類錯誤因取證、分簇、主張門檻與提示詞資料流不一致而反覆出現。

它不能把占卜變成可由官方科學驗證的預測工具，也不能製造不存在的「全球唯一現代正統 Lenormand 公式」。本站能做到的是把歷史可核實部分與現代工程規約分開，並讓規約固定、透明、可測試、可回歸。
