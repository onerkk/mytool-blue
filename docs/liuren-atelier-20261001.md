# 大六壬・天時之境 — 20261002atelier2

姓名學與大六壬在首頁最後一排左右並列，統一為上方的直式卡片樣式。大六壬使用獨立立體課盤；既有六爻、易經和姓名學六種分析角度保留。

## 操作與畫面

- 金銅／青綠式盤；圓盤、清晰方盤可互切，十二地盤、天盤與天將均出自本課計算。
- 立體盤可單指或滑鼠拖曳，有慣性；雙指可斜看／縮放，並支援分層、歸正、滑桿、方向鍵與左右按鈕。盤內手勢轉盤，盤外正常垂直捲動。
- 點選宮位、四課或三傳，對應宮位會標示；檢視區交代上下生剋、六親、遁干與旬空。
- 可重播「定地盤→轉天盤→布天將→起四課→取三傳」。跳過動畫、減少動態偏好與關閉取消皆保留同一課的計算資料。
- 「起課脈絡」說明取法；「閱讀・筆記」保存本次明示觀察。「存盤圖」輸出1200×1260 PNG；該頁亦可另存SVG。盤圖輸出歸正圓盤，完整問題與取法資料另在JSON中。
- 「匯出資料」輸出完整JSON、筆記與提示詞。「複製完整提示詞」可交給慣用AI解讀；本頁不傳送問題到外部AI，也不預寫吉凶答案。
- 對話框採背景inert、Tab焦點循環、Esc關閉及原入口焦點還原。文字輸入以跳脫後的內容呈現。

## 原生排盤

`JS/liuren-core.js` 使用本地 `lunar-javascript 1.7.7` 與既有曆法事實層；輸出 `jy.liuren/1`。

| 資料 | 本版口徑 |
| --- | --- |
| 月將 | 依起課瞬間的上一中氣換將；不是農曆月序或節換將。手動覆核值與自動值同時保留。 |
| 年月柱 | 起課瞬間轉UTC+8核對節氣。 |
| 日時柱 | 指定民用日期、時間與UTC時差。預設00:00換日，可選23:00子初；晚子時時干一起按該政策計算。 |
| 正時／活時 | 正時由民用時辰取支；活時可明示占時支，原民用四柱另保留。 |
| 晝夜貴人 | 自動卯至申為晝、酉至寅為夜；可明示晝／夜。採甲戊庚牛羊、乙己鼠猴、丙丁豬雞、辛馬虎、壬癸蛇兔。 |
| 九宗門 | 賊剋、比用、涉害、遙剋、昴星、別責、八專、伏吟、返吟；依本版先後次序取三傳。 |
| 涉害 | 歷歸本家，計地支與寄干；先深度，再孟、仲；同類候選依四課順序，最後陽干上／陰支上。 |
| 其他事實 | 十二天將及順逆、四課、三傳、旬首旬空、遁干、六親、日馬日祿、進退連茹與三合傳標記。 |

不同六壬派法可能另採貴人表、晝夜、涉害與換日口徑。`calculationPolicy` 明列本版選擇與算法來源，不宣稱唯一正統。

尚未實算六十四課體全表、全部神煞、本命行年、真太陽時、天文日出日落及應期候選日。這些缺口在畫面、資料與提示詞內明示，不用其他術數補造。

## 提示詞

`JS/liuren-prompt.js` 合併共用判讀品質規則與六壬專屬判讀：完整保留十二宮、四課三傳、取法紀錄、起課設定及原問題。要求類神、天將與課傳合讀，區分支持、牽制與現實成立條件；不把課名、六合或旬空直接翻成必然事件。資料、筆記與指令分開；不使用其他對話或帳號記憶。研究／娛樂提醒與固定賣場祝福一併保留。

## 核對與測試

獨立Python參考：<https://github.com/d1210182010/daliuren-web-engine>，MIT，固定修訂 `d5cb9a79ebe2c368ead76319ad37bac1e8096d22`；`shipan.py` blob `4ad0c57a1508c42b801d2608da0205e9397c1657`。授權與改作說明見 `data/liuren/REFERENCE-LICENSE.txt`。

`tests/fixtures/liuren-720-reference.json` 由該Python實作產生，未由待測JavaScript自產預期值。60甲子日×12天地盤偏移共720課；分晝、夜合計1440組比對三傳及十二天將，覆蓋全部九宗門。這驗證所採排盤口徑的一致性，不驗證事件預測，也不等於各流派均同意此取法。

示範時間2026-10-01 22:06（UTC+8）得到丙午、丁酉、戊申、癸亥，辰月將，卯→申→丑三傳。另驗證中氣交接前後一秒、跨年、跨時區同瞬間、子初／午夜換日、手動覆核與錯誤輸入。

瀏覽器測試採320、390、768、1440px：跨欄入口、完整起課、圓／方盤、課傳定位、旋轉不改原課、筆記、提示詞、PNG／SVG／JSON匯出、跳過及取消動畫、關閉後焦點還原、輸入跳脫與資源完整性。測試以本地檔案供給正式頁面資源；不依賴線上服務回應。

```sh
npm run test:liuren
npm run test:liuren:browser
npm run test:ui
npm run test:cards
npm run test:name
```

瀏覽器測試需要Playwright及Chromium；可用環境變數 `JY_CHROMIUM` 指定瀏覽器執行檔，`JY_LIUREN_REVIEW` 指定截圖／報告目錄。本次未更動既有依賴，也未把測試瀏覽器打包到網站。

## 更新包

ZIP保留原相對目錄，解壓後覆蓋專案根目錄再依原流程部署。以GitHub現有版本 `5aeab7b51876b40359a5a991252b80e044cefa75` 為基線，只含本次變更；不包含整份專案、依賴、測試截圖或舊的62檔更新包。部署後服務工作者快取版本改為 `jy-main-v107`。

此版完成上述範圍的新增與本地驗證，尚未替你推送GitHub或部署到正式網站。


## 20261002atelier2：入口與立體互動更新

- 姓名學與大六壬使用首頁同一套直式卡片，在最後一排左右並列；手機兩欄、桌面各占半排，圖像、說明與底欄保持一致。
- 新增本地按需載入的 Three.js 銅玉式盤：實體盤緣、刻度、地盤、天盤與天將層，標字沿實算課盤映射。布盤依定地盤、轉天盤、布天將、起四課、取三傳逐步演示，可跳過或重播。
- 單指拖曳旋轉並有慣性；點支以立體射線定位原生地盤，雙指可斜看及縮放，雙點／Home／歸正重設視角。選四課或三傳會高亮相應宮位；分層觀盤與循三傳光軌可獨立操作。
- 旋轉、手勢、分層及循傳皆屬視覺操作，完全不更動排盤、四課、三傳、天將與旬空。JSON／PNG／SVG／完整提示詞維持原生資料與原有匯出功能。
- 立體元件下載失敗、WebGL 不可用或繪圖情境丟失時，改用可點選與旋轉的 SVG；方盤及完整資料持續可用。離開畫面停止動態，關閉頁面釋放畫布、觀察器、材質、紋理與動畫。減少動態偏好直接呈現完整課盤。
- 本次未改動姓名學或大六壬計算政策與解讀提示詞，也未更換其他術數引擎。

### 重建與驗證

`npm run build:liuren-scene` 重建 `JS/liuren-scene.js`；網站直接使用已打包的腳本，不需安裝 Three.js 即可部署。

`npm run test:liuren` 核對 720 課與時間／設定邊界；`npm run test:liuren:browser` 涵蓋 320、390、768、1440px 排版、真實 CDP 觸控、立體定位、分層、布盤、循傳、降級與匯出。另以 `npm run test:name`、`npm run test:name:browser` 與 `npm run test:ui` 核對姓名學和首頁既有流程。


## Three.js r186 授權

立體課盤的打包腳本使用 Three.js r186；以下保留該版本完整 MIT 授權。來源：https://github.com/mrdoob/three.js/blob/r186/LICENSE

```text
The MIT License

Copyright © 2010-2026 three.js authors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
```
