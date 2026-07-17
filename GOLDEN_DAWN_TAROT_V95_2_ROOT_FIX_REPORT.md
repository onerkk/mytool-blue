# Golden Dawn Tarot v95.2 根治報告

## 目標

將網站內一般塔羅、全部牌陣、分享／結果輸出、AI 提示詞與「開鑰之法」統一到 Hermetic Order of the Golden Dawn《Book T／Liber T》框架，移除執行期的 Waite 1910 固定正逆位牌義、Rider–Waite 圖像故事、Crowley／Thoth 專屬泰勒瑪詮釋與舊 OOTK 擴充詞典。

## 單一真相來源

新增 `JS/golden-dawn-tarot.js`，由 `window.JYGoldenDawn` 統一提供：

- 大阿爾克那的 Golden Dawn 對應與 Book T 核心義。
- 小阿爾克那二至十的 Book T 稱號、元素、占星分度與卡巴拉位置。
- 宮廷牌的 Book T 階級、YHVH／四元素映射及網站既有牌面標籤相容層。
- 相鄰牌元素尊貴規則、牌陣實際相鄰群組、Book T 計數值與多牌結構觀察。
- `sourceId = gd_book_t`，所有塔羅提示詞與語義引擎只讀取此來源。

## 一般牌陣

- 一般抽牌固定不使用物理正逆位；強弱由牌位權限、Book T 核心義、相鄰元素尊貴、卡巴拉／占星對應及牌陣拓撲裁決。
- 所有已知牌陣路由均改用 `gd_book_t`：三張、五張、十字、二選一、關係、時間軸、凱爾特十字、生命樹、黃道十二宮、小阿爾克那、十五張、Mathers 21、馬蹄與 OOTK。
- 不以吉凶票數、正逆位比例、花色缺席、牌號或宮廷牌數量換算人物、日期、金額、機率或事件。
- AI 主分析、跨系統分析、提示詞匯出、分享卡與 UI 顯示全部改讀同一 Golden Dawn 結構資料。

## 開鑰之法

依 Book T 契約重整五操作：

1. 第一操作：Yod／Heh／Vau／Heh-final 四堆，先確認題目所屬堆；錯堆即中止。
2. 第二操作：十二宮，發牌前指定主要宮位及可選同類宮位；未命中即中止。
3. 第三操作：十二星座，發牌前指定題目星座；未命中即中止。
4. 第四操作：將接續三十六張排成圓環並依 Book T 計數、敘事與配對。
5. 第五操作：生命樹十質點，發牌前指定預期質點；未命中記為警示，不強制宣告整次無效。

其他修正：

- 指示牌由使用者依人物性格／作用手動選擇，不再依出生、年齡、性別或外貌自動指定。
- 所有第一、二、三、五操作的目標均須在發牌前確認並鎖定，禁止看到牌後改選。
- 計數值統一：Knight／Queen／Prince = 4、Princess = 7、Ace = 11、數字牌依牌號、大牌依 3／9／12 分組。
- 舊 `ootkMathers1888Meanings` 與 `jyWaitePKTMeanings` 執行入口已清空，避免混入非單一來源牌義。

## 解讀與風險邊界

- 第一層先回答原問句全部必要子題，再建立主判、反證、最強替代解讀與可觀察驗證點。
- 沒有明示時間通道時，只能回答相對階段，不得自行編造月份、日期、年數或機率。
- 財務、醫療、法律、犯罪、投資與人身安全問題，只提供象徵性風險與低風險行動優先序；現實帳目、合約、證據與專業意見優先。
- 品牌礦物附加層仍在占卜完成後才執行，不可反向污染牌義。

## 變動檔案

- `index.html`
- `JS/golden-dawn-tarot.js`（新增）
- `JS/tarot.js`
- `JS/tarot_upgrade.js`
- `JS/tarot-semantic-engine.js`
- `JS/prompt-export.js`
- `JS/ai-analysis.js`
- `JS/ui.js`
- `JS/spread-picker.js`
- `JS/share-card.js`
- `JS/selftest-core.js`
- `tests/tarot-v95-golden-dawn-root.test.js`（新增）

## 驗證結果

- 上述全部 JavaScript 已通過 `node -c` 語法檢查。
- `tests/tarot-v95-golden-dawn-root.test.js`：PASS。
- 已檢查 Golden Dawn 核心載入順序、單一來源版本、全部牌陣 source profile、OOTK 發牌前綁定、舊牌義全域入口清空及 `tarot.js` 無重複核心。

## 來源

- Hermetic Order of the Golden Dawn, *Book T / Liber T – The Tarot*：
  https://benebellwen.com/wp-content/uploads/2013/02/mathers-and-felkin-golden-dawn-book-t-the-tarot-1888.pdf

