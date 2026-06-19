# Petit Lenormand v7.5 性題證據歸屬與提示詞根治稽核

日期：2026-06-19  
基線：v88.4／Lenormand v5.4／Prompt profile v7.4  
修正版：v88.5／Lenormand v5.5／Prompt profile `site_petit_lenormand_v7_5_atomic_evidence`

## 一、結論

原 v7.4 已正確拆開「桃花機會、性／感官成分、實際肉體事件、不可驗證年齡」，但仍沒有真正完成證據隔離。最嚴重的錯誤不是文筆，而是底層資料契約：

1. `29.淑女`為 hypothetical 方法焦點，卻可能因「淑女＋太陽」被寫成真人正在注意問卜者。
2. 「紳士＋蛇」可直接讓 `sexual_component` 成立，等於把蛇固定當成性牌，並把問卜者自身結構錯誤歸屬給尚未證實的非現任桃花。
3. attraction、sexual_component、sexual_event 可重複使用相同物理 D／S；同一 `evidence_uid` 雖有標號，仍可跨命題灌票。
4. 同一 C 可同時被正向主張與風險主張引用；`claim_evidence` 形式存在，但沒有實質獨占。
5. 長線只要包含焦點牌便可能建立關係，未限制焦點間距，會把題外中間牌與遠端人物硬連成吸引或事件。
6. 性事件門檻可把不同位置的性提示與關係提示事後拼接，沒有要求兩者指向同一人物／關係焦點。

因此，原 AI 回答中「今年較有肉體／性吸引傾向」證據不足；「不足以判定實際發生肉體關係」與「無 age_rules 無法判年齡」則方向正確。

## 二、原 AI 解讀逐項檢查

### 1. 「今年有非現任桃花或被注意的機會」

部分可保留，但必須降格並限制語意。

- `time_scope=今年`來自使用者問題，只能原樣限定評估範圍；它不是牌面應期規則，不能推算月份、先後或日期。
- hypothetical `29.淑女`只是一個未確認對象焦點。「淑女＋太陽」可以描述該焦點周圍有正向／可見性符號，不能寫成某位真人已經出現或正在注意問卜者。
- 桃花主張若要高於純主題背景，必須同時具有「人物焦點連結」與「直接吸引支持」，而且兩者不得重複使用相同物理證據。

### 2. 「較有肉體／性吸引傾向」

原結論不成立，已根治。

- 英國博物館館藏可核實的是《Das Spiel der Hofnung》完整36張牌與4頁印刷說明；館藏資料沒有把蛇定義成固定性牌。
- 保存較早牌義的資料把百合重點放在德行、成熟、和平；部分現代作者才延伸為性、感官享受。另一套現代資料又主要把百合讀成和平、德行與成熟，顯示現代牌義本身並不單一。
- 因此新版明示：百合是「本站可選的現代感官提示」；蛇只作誘惑、複雜、欺瞞或第三方風險修飾，不能單獨建立性成分。
- 「紳士＋蛇」只能說問卜者附近存在誘惑／複雜主題，不能推導「該假設桃花對問卜者有性吸引」。

### 3. 「不足以判定實際發生肉體關係」

原方向正確，但舊門檻仍不夠嚴格。

新版要求：

- 至少一組 `event_support`：感官焦點與同一 hypothetical counterpart／接觸標記在限定距離內相連。
- 另有獨立 `relation_support`：人物或關係落實結構。
- 兩組支持不得共用同一 C 或相同 `evidence_uid`。
- 不能把牌陣不同位置的百合、蛇、戒指、心、騎士等事後拼成性事件。

只要缺少上述任何一層，結論固定為「不足以判定實際發生」。

### 4. 年齡

原回答正確。`age_rules=false` 時：

- 不生成牌面證據包。
- 不以牌號、孩子、百合、大樹、人物牌或房屋側推年齡。
- 只回答無法驗證數字年齡或區間。

### 5. 水晶推薦

本次沒有恢復固定推薦。推薦仍在正文完成後，以最主要 approved claim 為唯一基準；若主結論是限制、切斷、負擔或風險，可召回黑曜石，但候選順序不是推薦順位，沒有直接吻合者必須不推薦。

## 三、根治架構

### A. 原子證據角色

attraction、sexual_component、sexual_event 的每個 D／S 先分配一個角色，再分簇：

- `person_bridge`
- `attraction_support`
- `attraction_context`
- `sexual_support`
- `sexual_modifier_only`
- `event_support`
- `relation_support`
- `risk`
- `context`

正向、修飾、關係落實與風險不再因共享同一核心牌而塞入同一 C。

### B. 焦點間距

新增 `structureMinIndexDistance` 與 `structureHasNearCards`：

- 直接牌對自然距離為1。
- 線段中的焦點必須在限定距離內才可支撐主張。
- 例如「心→狐狸→魚→淑女」因心與淑女相距過遠，只能是背景，不能當直接吸引支持。

### C. 主張內獨占

`reserveClusterIds`確保：

- 每項主張最多2個C。
- 同一 packet 內，不同主張不能重複使用同一 C。
- 風險主張不能重新拿正向主張的 C 灌票。

### D. 全題 evidence_uid 獨占

新增 `enforceGlobalClaimEvidenceUniqueness`：

- 先為跨命題同一物理 D／S 指派相同 `evidence_uid`。
- 再依命題專屬性、證據角色與主張用途分配唯一所有權。
- 同一 `evidence_uid`只能出現在全題一項核准主張中。
- 若主要主張失去全部有效證據，程式直接降級 claim status／certainty cap，不讓模型自行補證。

### E. 提示詞收斂

性題 runtime prompt 現在只輸出：

1. 最高規則與時間範圍限制。
2. 性題專用邊界。
3. proposition、人物狀態與 decision boundary。
4. approved claims 與其唯一 claim evidence。
5. 核准 C／D／S。
6. 必要的工作詞典與輸出契約。

性題不再輸出 `selected_context` 主題摘要，避免同一內容以 T 再說一次。目標案例提示詞為10,320字元、7個核准C、10個核准D／S，且10個 `evidence_uid`全部唯一。

## 四、提示工程依據

### OpenAI 官方

OpenAI Prompt Engineering 文件指出：生成具有非決定性，複雜正式應用應固定模型版本，並建立測試與評估套件監控提示行為。這次因此沒有只加一條禁令，而是把反例寫入可重跑測試。

- https://developers.openai.com/api/docs/guides/prompt-engineering

### Anthropic 官方

Anthropic 建議以一致且具描述性的 XML 標籤分隔指令、背景、範例與變數，並以貼近真實用途、涵蓋邊界案例的範例提高一致性。新版保留 XML 資料契約，但移除未核准的重複脈絡。

- https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices

### Google Cloud 官方

Google 的提示健康檢查要求清楚具體、避免未定義術語、冗長與無關指令，並建議拆解複雜任務、明定輸出格式。新版把「桃花／性成分／事件／年齡」拆成獨立命題與門檻，不讓一個泛用提示同時完成全部判斷。

- https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/prompts/prompt-design-strategies

## 五、雷諾曼史料與「現代正統」界線

### 可由機構核實的內容

英國博物館館藏頁可核實：

- 作品名稱為《Das Spiel der Hofnung》。
- 是完整36張牌。
- 隨附4頁印刷說明。

- https://www.britishmuseum.org/collection/object/P_1896-0501-495

### 不能冒充官方的內容

沒有找到一個博物館、標準組織或監管機構，能認證以下規則為「唯一現代正統」：

- 蛇固定等於性。
- 百合固定等於性。
- D／S／C、房屋、鏡像、騎士跳、門檻、計分、certainty cap。

可查的現代資料彼此存在差異：

- 保存較早牌義的整理把百合的核心放在德行、成熟、和平，並指出「性」是部分現代讀者的延伸。
  - https://www.lenormandreader.com/blog/lenormand-mute-cards-part-1-the-lily
- Labyrinthos明確把百合列為感官／性與德行兩面並存。
  - https://labyrinthos.co/blogs/lenormand-cards/the-lily-lenormand-card-meaning-and-combinations
- Phuture Me則主要把百合列為長者、和平、寧靜、德行，百合＋蛇偏向誘惑擾亂和諧。
  - https://phuture.me/lenormand-card-30-lily

因此 v7.5 不宣稱性牌義是歷史原義或唯一標準，而是把百合標為本站可選的現代情境提示，並採較保守的證據門檻。

## 六、測試結果

### 語法

- `JS/lenormand.js`：通過 `node --check`
- `JS/selftest-core.js`：通過 `node --check`

### 行為與靜態測試

- 雷諾曼行為測試：54／54 通過。
- 全站靜態／資料／雷諾曼測試：187／189 通過。
- 剩餘2項失敗均為本次未修改的 `ink-flow.js` 舊簽名：缺少「墨流 ink-flow v1.1」與「面板內掛載」。未宣稱全站完全通過。

### 新增性題反例

- 紳士＋蛇不得建立性吸引。
- 百合＋花束可作本站感官提示。
- 百合＋棺材改列風險，不得當正向支持。
- 遠距「心→狐狸→魚→淑女」不得作人物吸引支持。
- 只有 event_support、缺少獨立 relation_support 時，事件仍不足。
- 全題 claim evidence 的 `evidence_uid`不可重複。
- 性題提示詞不輸出 `selected_context`。

### 隨機排列不變量

以250組決定性洗牌測試同一複合問題：

- 0次例外。
- 0次 `evidence_uid`重複。
- 0次 packet validation 失敗。
- 0次性題 `selected_context`洩漏。
- 0次提示詞超過12,000字元。

## 七、變動檔案

- `JS/lenormand.js`
- `JS/selftest-core.js`
- `index.html`
- `LENORMAND_V7_5_AUDIT.md`
