# Petit Lenormand v7.2 提示詞與解讀根治稽核

日期：2026-06-19  
範圍：`JS/lenormand.js`、`JS/selftest-core.js`、`index.html`

## 結論

原 v7.1 的主要問題不是「文字不夠深」，而是**問題路由錯誤**：

> 「我搭配手鍊，是要搭配自己喜歡的，還是要看八字五行？」

這是兩個選項的比較題，但舊解析器沒有把「還是」當作可獨立成立的替代連接詞，因此被編譯成一般題。一般題封包又沒有把任何牌預先、對稱地分配給「自己喜歡」與「八字五行」，模型卻仍被要求下結論，最後產生「偏向自己喜歡」的答案。該偏向**沒有選項專屬證據，屬於越權推論**，不是可靠的牌面比較。

v7.2 已把比較題改為抽牌前固定 A／B 左右欄的對稱九宮格；若沒有完成對稱分配，系統直接封閉為「無法公平比較」，不准模型事後挑牌替任一選項站隊。

## 「現代正統」的可核實邊界

雷諾曼沒有一個像軟體標準組織那樣，能對所有現代技法頒布「唯一官方正統」的權威機構。因此，本系統不再使用無法證明的「全部都是現代正統」說法，而改成三層來源標示：

1. **館藏可核實史料**：大英博物館館藏記錄可核實《Das Spiel der Hofnung》是一副完整 36 張牌，並附 4 頁印刷說明。
2. **保存說明書／後期傳統**：4×8+4 與人物牌附近敘事可在保存至今的說明文字與其翻譯中查到；它不是所有歷史版本唯一的排法，也不能自動證明房屋、鏡像、騎士跳、評分門檻等後來技法。
3. **本站現代規約**：D／S／C、命題專屬分簇、房屋、鏡像、騎士跳、脈絡去重、certainty cap、比較評分等，均明示為本站工程規約。它們可以追求一致、可測試與不越權，但不得冒充唯一歷史正統。

此分層比把所有技法統稱「正統」更準確，也避免模型把工程規則誤寫成史實。

## 官方提示工程文件對照

本次重構依照下列官方技術原則：

- OpenAI：把指令放在提示詞前端、用清楚分隔符隔開指令與資料、明確定義輸出格式，並以範例展示格式。
- Anthropic：固定模板與變數分離、使用 XML 標籤建立一致結構、以測試案例驗證提示詞版本。
- Google Gemini：關鍵限制前置、保持一致分隔格式、複雜提示拆成可管理元件、few-shot 範例保持一致，避免過多例子造成過度套型。

因此 v7.2 不再把同一限制分散重複於開頭、資料中與結尾，而採：

1. 執行優先順序
2. 少量邊界範例
3. 結構化 reading request／evidence packet
4. 依證據自動啟用的 analysis requirements
5. 單一輸出契約與交稿複核

這不是單純縮短字數，而是把「規則、證據、寫作要求、呈現格式」分離，降低規則互相覆蓋與模型為湊模板硬造內容的風險。

## 問題與根治修改

| 問題 | 舊行為 | 根因 | v7.2 根治 |
|---|---|---|---|
| 「還是」比較題誤判 | 落入 general | 比較解析只依部分選擇詞，未建立替代連接詞語法 | 新增替代連接詞解析、共用問句骨架清理、選項正規化 |
| 無 A／B 證據仍選邊 | 模型自行把牌義套到兩個概念 | 一般封包不含選項配置，但輸出要求仍逼模型選擇 | 比較題只能使用抽牌前對稱配置的 O／X；配置失敗即 fail-closed |
| 深度清單固定全寫 | 無反覆證據也寫反覆、無對立也硬寫矛盾 | 把「深度」誤等同固定段落數 | 程式先檢查獨立正向／負向 C、戒指／鞭子與正反並存，再啟用對應段落 |
| 同一限制多處重複 | 提示過長且容易局部衝突 | 規則、資料、格式未分層 | 改為優先規則→證據→動態分析契約→輸出 |
| 負面牌內部描述衝突 | 山可被寫成「穩固」、老鼠可被寫成「放下」、雲可預告散去 | `key` 與 `pos` 兩套文字互相衝突 | 雲、棺材、山、老鼠、十字架、鞭子統一回受控核心語義，禁止美化 |
| 結尾固定白水晶 | 問任何問題都出現白水晶 | footer 是靜態字串，不讀問題、牌與正文 | 先由問題／命題／實際牌面召回最多 3 個候選，再要求模型完成正文後依主結論選 1 個；不吻合就不推薦 |
| 象徵功效與礦物事實混寫 | 容易讓象徵說法看似科學結論 | 資料欄位未分層 | 候選分成 `symbolic_direction` 與 `mineral_fact`，並禁止醫療、改運或客觀能量效果宣稱 |
| 現代規約被寫成唯一正統 | 來源層級不清 | 史料與站內工程規則混在同一段 | 明確標示館藏史料、保存傳統、本站規約三層 |

## 動態水晶推薦設計

推薦流程現在是：

1. 依問題詞義與 proposition 類型召回方向，例如選擇／判斷、感情互動、商業資源、溝通確認、界線切斷、行動取捨。
2. 再依本次實際抽到的牌補充候選分數；這一步只決定「有哪些候選可考慮」，不直接決定最終推薦。
3. 模型先完成正文，確認本題最主要且可執行的結論。
4. 只能從候選中選擇與正文主結論真正吻合的一項；沒有吻合者，輸出「本題不強行推薦水晶。」
5. 礦物資料與象徵方向分開呈現。

目前候選礦物事實使用 GIA 與 USGS 可核實資料：紫水晶、粉晶、黃水晶屬石英；海藍寶屬綠柱石；虎眼石為具貓眼效應的石英材料；黑曜石為天然火山玻璃。這些資料只支持礦物學描述，不支持醫療、改運或能量效果。

## 分析深度評估

v7.1 的「核心、有利、阻礙、反覆、矛盾、實際表現、未知邊界」本身不是錯；錯在**每題都被要求完整寫滿**。沒有相應獨立證據時，固定展開只會增加幻覺與重複。

v7.2 改為證據驅動：

- 核心判斷與未知邊界：必寫。
- 有利因素：只有獨立正向 C 時必寫；沒有就明說不足或省略。
- 阻礙風險：只有負向或混合 C 時必寫。
- 反覆模式：只有戒指或鞭子進入批准結構時才寫。
- 正反矛盾：只有正向與負向／混合 C 並存時才寫。
- 可能表現：只准條件式描述，不得寫成事件已發生。

所以新版本的深度不是固定字數，而是「把有證據的面向寫完整，把沒有證據的面向封閉」。

## 對原 AI 解讀的判定

原回答第一句「較有傾向以自己真正喜歡、願意長期佩戴的手鍊為主」不成立，原因不是牌義一定相反，而是：

- 問題有兩個明確選項。
- 輸入封包是 general，不是 comparison packet。
- D／S／C 沒有任何一組被預先指定代表「喜歡」或「八字五行」。
- 因此，牌面只能描述問卜者在選擇、負擔、阻礙、判斷不清等整體狀態，不能公平比較兩個選項誰較適合。

正確處理應是重新用對稱比較陣抽牌；不能拿舊 general 封包補寫一個比較結論。

## 驗證項目

- JavaScript 語法檢查：`JS/lenormand.js` 通過。
- JavaScript 語法檢查：`JS/selftest-core.js` 通過。
- 雷諾曼部署簽名／舊字串回歸測試：58 項通過、0 項失敗。
- 雷諾曼行為測試：31 項通過、0 項失敗。
- 已驗證目標句可解析為：
  - A：自己喜歡的款式
  - B：依八字五行搭配
  - 比較準則：手鍊搭配原則
- 已驗證一般並列句「我喜歡水晶和手鍊」不會誤判為比較題。
- 已驗證動態水晶推薦會依問題方向改變，且提示詞不再含固定白水晶 footer。
- 已驗證目標比較題提示詞為 4,884 字元；複雜 GT 提示詞為 13,782 字元，仍低於既有 14,000 字元上限測試。

## 來源

### 官方提示工程文件

- OpenAI, Best practices for prompt engineering with the OpenAI API  
  https://help.openai.com/en/articles/6654000-best-practices-for-prompt-engineering-with-openai-api
- Anthropic, Prompting tools / prompt templates  
  https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-tools
- Google AI for Developers, Prompt design strategies  
  https://ai.google.dev/gemini-api/docs/prompting-strategies

### 歷史館藏與保存說明

- British Museum, *Das Spiel der Hofnung*, museum no. 1896,0501.495  
  https://www.britishmuseum.org/collection/object/P_1896-0501-495
- English translation of the preserved four-page instruction leaflet（獨立翻譯，非博物館官方技術規範）  
  https://www.divinemuses.net/uploads/2/1/6/1/2161377/gameofhope.pdf

### 礦物資料

- GIA Amethyst  
  https://www.gia.edu/gem-education/gem-encyclopedia/gem-encyclopedia/amethyst/gem-overview
- GIA Citrine  
  https://www.gia.edu/gem-education/gem-encyclopedia/gem-encyclopedia/citrine/gem-overview
- GIA Aquamarine  
  https://www.gia.edu/gem-education/gem-encyclopedia/gem-encyclopedia/aquamarine/gem-overview
- GIA Rose Quartz  
  https://www.gia.edu/gem-education/gem-encyclopedia/gem-encyclopedia/rosequartz/gem-overview
- GIA, Tiger’s-eye and Pietersite  
  https://www.gia.edu/gems-gemology/summer-2025-phenomenal-gemstones
- U.S. Geological Survey, Obsidian sample  
  https://www.usgs.gov/media/images/obsidian-sample-dense-volcanic-glass-rhyolite-composition

## 本次變動檔案

- `JS/lenormand.js`
- `JS/selftest-core.js`
- `index.html`
- `LENORMAND_V7_2_AUDIT.md`
