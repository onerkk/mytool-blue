# R11 本次文獻核對與實作

本次實際重新開啟、核對下列兩份命理原典／作者教材的指定段落，並把可觀察的算法加入引擎。累積來源仍為 70 筆；沒有把既有清單冒稱本次重新讀完 70 本全文，也沒有宣稱所有歷史流派已全部實作。

| 文獻 | 本次核對範圍 | 實際新增計算與驗證 |
|---|---|---|
| [《窮通寶鑑》維基文庫校錄](https://zh.wikisource.org/zh-hant/%E7%A9%B7%E9%80%9A%E5%AE%9D%E9%89%B4) | 癸水五月、癸水八月、壬水十一月的透干數量、隔位與時干條件 | 「二壬一庚同透」分別計數，不能只測存在；丙辛隔位核對實際柱距；丁出時干核對時柱，不能借年干丁代替。120 個日干月令入口的條文帳沿用同一算法；其餘符合明示字面語法的數量、指定年月日時柱條件也逐條計算。強弱清濁、有效制化與原文人生斷語沒有因此變成確定結論。 |
| [P. V. R. Narasimha Rao, Vedic Astrology: An Integrated Approach](https://vedicastrologer.org/articles/vedic_astro_textbook.pdf) | 第 4.3 節與註 9，第 5.2–5.4 節，Examples 7–9、Exercise 8 | Bhava 引言每 4 分鐘 1 度與程序／印例每分鐘 1 度的矛盾分成兩個可計算模型；Hora、Ghati 分別使用各自速率。Kaala 等時刻副星的段中點與註腳段起點分算，Maandi 保持土星段起點。所有特殊點按既有 20 個分盤取法實排星座及宮位；未知出生時刻不造補。 |

Bhava 的矛盾保留在 `sourceAudit`。Example 7 的兩個結果均計算，不能改教材數字湊成同一結果。Examples 8、9 和跨午夜 Exercise 8 用獨立算術核對；實際盤的副星時刻另以真實日出日落及該時刻上升點核對。

特殊點完整資料含 4 個所選 Lagna、4 個公式模型、11 個 Upagraha，以及兩個時刻口徑各 6 點，共 31 點位組 × 20 分盤 = 620 格。重複點位是明示模型對照，不是 31 個不同天體，也不是多份獨立證據。提示詞以可還原矩陣保留全部 620 格，測試解碼器逐欄比較原值。

人物指向的程式修正另外參考 [AMR 官方標註規範](https://github.com/amrisi/amr-guidelines/blob/master/amr.md) 的角色、極性與指向概念。這是工程參考，不列為新增命理文獻，也沒有宣稱實作完整 AMR 或通用語言理解。

可重現證據：`tests/engine-and-reference-r11-20261004.cjs`、`docs/engine-and-reference-validation-20261004-r11.json`、兩個寬度的 `docs/question-reference-browser-20261004-r11-*.json`。前版各方法的其他来源與限制沿用 R10 報告，最新版本來源清單見 `engine-source-catalog-20261004-r11.json`。
