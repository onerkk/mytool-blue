# R8 技術文本搜尋、計算及來源差異

查核日期：2026-10-03。以下是本輪實際讀取的原典、作者資料與發布者文件；不是「所有命理文獻全文均已查完」。程式來源登錄64筆是累積記錄，不等於64本書逐條全部實作。前輪計算保留，本輪新增的是PVR第31章具名三重運期模型。

## 新算法直接依据

| 文本及連結 | 實際定位 | 計算／保留差異 |
|---|---|---|
| [P. V. R. Narasimha Rao, Vedic Astrology: An Integrated Approach，作者515頁PDF](https://www.vedicastrologer.org/articles/vedic_astro_textbook.pdf) | 第31.1–31.4節、已滿44歲及59歲例、例126/127；第25.5節BAV核對 | 年宮=已滿歲數mod12+1；出生上升、月、日參照依年/月/段各推宮。20盤×3層×3參照共180當期作用盤，以各時窗起始瞬間的實際九曜排盤。BAV以物理D1行運座核對本命Dn七曜BAV，與Dn投影落宮分開。 |
| [Brihat Parashara Hora Shastra英譯PDF](https://vedic-astro.s3.amazonaws.com/books/bhrihat_parasara_hora_shastra.pdf) | 第74章，尤其74.19–20與後段年/月/細運 | 上升、月、日必須各異座的適用限制另列；同座依該版退回Rasi Kundali，PVR仍保留三參照且不當三次獨立投票。兩日/12ghati名義段與真實2.5°太陽時窗分版。BPHS74七分盤性質逆轉及同強定主質性細則未完整自動裁決。 |

PVR31.4通則說自然吉曜除6/12皆利、凶曜3/6/11利；同節Rahu敘述與例126把兩交點11宮判利不完全相容。例127把Venus3宮列為不利，也與通則不同。引擎的sourceAudit及提示詞保留這些矛盾，沒有偷偷改公式讓例題表面一致。已滿44歲原例的第9宮及Scorpio/Libra/Pisces、59歲第12宮通過數值驗算；例126测试是明示的合成位置重建，沒有冒稱重新取得其歷史時刻星曆。

12月及144段都有連續、半開UTC起迄與三參照推宮；年度、當期月、當期段各算實際起始盤。非當期月份／細段由chartForPeriod按指定索引真正重算20分盤及作用資料，不宣稱已預算全部144張完整內盤。原書名義「60小時」不等於每段固定60民用小時。

## 各方法此次成功讀取的來源

| 方法 | 此次成功讀取的技術文本 | 此次範圍／既有計算 |
|---|---|---|
| 八字 | [子平真詮用神](https://www.donglishuzhai.net/chapter/3721.html)、[成敗救應](https://www.donglishuzhai.net/chapter/3722.html)、[三命通會四庫卷十](https://zh.wikisource.org/wiki/三命通會_(四庫全書本)/卷10) | 重新讀取原文。既有四柱、月令、八格63條及小運保留；窮通120入口615段沿用已存校勘，不宣稱本輪重新取得全部全文或把質性條件都自動化。 |
| 紫微 | [iztro作者運限文件](https://iztro.com/zh_TW/posts/horoscope) | 重新讀取作者運限結構；原有安星、五運層、兩四化表及河洛具名條件保留，不把本次文件讀取當全門派校勘。 |
| 西洋 | [Swiss技術手冊](https://www.astro.com/swisseph/swephprg.htm)、[Houlding尊貴表](https://www.skyscript.co.uk/essential_dignities.html)、[Tobyn傳光與受阻](https://www.skyscript.co.uk/tobyn2.html) | 本次重讀直接來源；五宮制、成相及六類具名受阻、三型傳光保留。同距非合相階序及現實介入者角色不假造唯一裁決。 |
| 印度 | 上列PVR作者教材及BPHS英譯 | 本輪新算Sudarsana；20分盤、17補充Dasha、六力、Bhava、AV/Pinda、Tajaka等前輪實算保留。未列歷史變體不混入。 |
| 六壬 | [六壬大全四庫卷九畢法賦](https://zh.wikisource.org/zh/六壬大全_(四庫全書本)/卷09) | 本次重讀遞生互克與條件；九宗門、64課族、290神煞、實際UTC交節及天文晝夜沿用已驗算原生模块。 |
| 六爻 | [增刪卜易元忌仇](https://zh.wikisource.org/zh-hant/增刪卜易/10) | 本次重讀；八宮納甲、用神角色、動變、月日與應期保留。多義親屬及未定用神不強選。 |
| 易經 | [周易正義旅](https://zh.wikisource.org/wiki/周易正義/06旅) | 本次成功讀取。完整64卦、384爻、彖象文言及4096本變使用既有校勘；朱子頁面此次失敗，另列如下。 |
| 梅花 | [梅花易數卷一](https://zh.wikisource.org/zh-hant/梅花易數/卷一) | 本次重讀起卦與體用；時間/報數/漢字及本互變沿用原體計算政策，未提供外應不補造。 |
| 姓名 | [Unicode UAX38](https://www.unicode.org/reports/tr38/)、[教育部異體字字典](https://dict.variants.moe.edu.tw/) | 成功重讀規格與字典頁。UAX38当前18.0不代表本專案字庫已換成18；資料仍以已釘選17.0及具名筆畫校對為準。康熙姓名筆畫不冒稱Unicode原欄。兩原書掃描此次失敗，既有81條及250三才的前輪校勘保留。 |
| 合盤 | 雙方八字／紫微所選上述原生算法 | 不需捏造一本獨立合盤總典；雙向十神、跨柱、疊宮及四化從雙方各自真實盤計算，不合成單人八柱。 |
| 人格 | 本站明示五軸32型映射及原生出生基礎 | 沒有虛構一項新古典來源；非經驗證心理測驗，未知鐘不造確定全型。 |
| 塔羅 | [Waite原著](https://sacred-texts.com/tarot/pkt/pkt0301.htm)、[Mathers1888第三法](https://sacred-texts.com/tarot/mathers/mtar04.htm)、[Liber78/BookT](https://sacred-texts.com/oto/lib78.htm) | 三者本次成功重讀。RWS、BookT、Mathers來源不互代；66張第三圈及32對/65單張保留具名重建。 |
| 開鑰 | 上列Liber78/BookT | 五輪完整本次計數、配對與元素尊貴保留；停止/未完成輪次不由AI補算或推結論。 |
| 雷諾曼 | [James R. Eads出版者大牌陣指南](https://prismavisions.com/pages/lenormand-the-grand-tableau) | 本次成功重讀。36牌本次記錄、九宮與兩種大牌陣全部合法線/鏡像/騎士步/宮鏈由引擎算，不宣稱全部歷史出版版都已考證。 |
| 靈籤 | [東海龍門天聖宮第一籤原廟全文](https://donghaimazu.com/post/fortune-sticks/fs01/)、[北港朝天宮程序](https://www.matsu.org.tw/?act=menuinfo&ml_id=20240116003) | 本次成功讀取原廟頁及程序；不是此次逐頁重新讀完60首。60原詩29事項沿用校勘，原廟空欄保留；三聖筊是本站選定程序。 |

## 此次讀取失敗與既有證據的分界

朱熹《易學啟蒙》zh-hant與wiki頁此次未成功讀取；1931熊崎原書NDL1104862及1935NDL1094933亦未成功重新讀取。這些失敗不計作新全文查證，不刪掉前輪保存、校勘及測試的原始資料。文獻全文取得、明確算式实现、質性裁決、現實预测效度是不同工作，本報告沒有互相替代。

## 可重跑的證據

`npm run test:r8`：12組算法/完整提示詞/推薦規則，加9方法介面恢復。`tests/ritual-navigation-browser-r8-20261003.cjs`：手機390與桌面1280各24案例，包含缺樣式、移除主題類別、WebGL不可用、模擬頁面快取往返及手動略過退出。這是瀏覽器與生命周期模擬，不稱真實Android裝置認證。15方法各19入口案例包含原生資料、JSON下載與文字複製；78原有回歸命令均通過，初失敗及重驗記錄保留。

`docs/native-scope-20261003.json`及`data/engine-rule-coverage.json`列逐方法實作及明確缺項。沒有全數自動裁決的質性條款不因提示詞寫了「完整」就變成已完成算法。
