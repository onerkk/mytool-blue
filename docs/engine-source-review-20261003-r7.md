# R7 技術文獻查核與實作對照

查核日期：2026-10-03。本頁記錄實際採用的文本及規則版本。來源登錄共63筆，完整名稱與連結在 native-scope-20261003.json；63筆不是「63本全文已逐條實作」，也不是世界所有命理流派的清單。

## 本輪新實作的直接依據

| 文獻 | 本輪讀取與定位 | 實作與查核 |
|---|---|---|
| 萬民英《三命通會》卷二〈論小運〉 | [卷二](https://zh.wikisource.org/zh-hant/三命通會/卷二)、[分章重印](https://www.laoziliao.net/gu/jie/info/13068) | 醉醒子時柱、年陰陽及男女順逆；古法男丙寅／女壬申另版，不混為同一政策。出生至起運前小運、立春逐年及原局作用已實算。 |
| S. L. MacGregor Mathers, The Tarot, 1888 | [原文第三法](https://sacred-texts.com/tarot/mathers/mtar04.htm) | 66張主盤、11張留牌、兩張意外牌；覆堆次序66/1、65/2…34/33，圓首33末66，S66及末輪配對。末輪文字歧義採具名重建政策，66張守恆、正逆位不變。 |
| Graeme Tobyn, Perfection and its denial, 2007 | 作者研究 [I](https://www.skyscript.co.uk/tobyn2.html)、[II](https://www.skyscript.co.uk/tobyn3.html) | 三型正式傳光、集光、接納、最後離相及首次入相；介入、換座、轉向逐時核對。空間距離按距精確成相的度數，等距合相優先；沒有唯一規則的其他等距維持未定。這是作者對古典文献的具名重建，未冒稱本次取得全部古籍原圖。 |
| P. V. R. Narasimha Rao, Vedic Astrology: An Integrated Approach | [作者公開515頁教材](https://www.vedicastrologer.org/articles/vedic_astro_textbook.pdf)，第6、25–30章及例13、15、18、118–121、表63、72、74、75 | 二十分盤新增D5、D6、D8、D11；Vedha、Tara、Murthi、Kakshya、Pinda；實際年度／月／2.5度太陽時窗，Harsha、36Sahams、歲月主、Panchavargeeya、Dwadasa、16Tajaka格局、三種年度主副運。 |
| Balabhadra, Hāyanaratna；Martin Gansten, 2020譯校 | [譯校目錄](https://www.wisdomlib.org/hinduism/book/hayanaratna-the-jewel-of-annual-astrology)、[2.4友敵表](https://www.wisdomlib.org/hinduism/book/hayanaratna-the-jewel-of-annual-astrology/d/doc1500895.html)、[2.5五種力量](https://www.wisdomlib.org/hinduism/book/hayanaratna-the-jewel-of-annual-astrology/d/doc1500896.html) | 常數2的Tājikasāra、Romaka三類、Muktāvali五類關係與倍率各自實算。保持原本不同版本，不套用本命自然友敵表代替歲時表。 |
| Swiss Ephemeris作者技術手冊 | [Programmer Manual](https://www.astro.com/swisseph/swephprg.htm) | 獨立驗算使用Swiss 2.10.03/Moshier及Lahiri；157個太陽交點與9個入座／Murthi參照均通過。生產網頁仍用原有Astronomy Engine，沒有偷偷把測試星曆當生產排盤。 |

PVR分盤例15中的D8水星印刷結果與同頁定義及列出的雙子10度運算不一致；引擎照明示規則推得天秤，保留差異，不反向硬改算法以配合排印。教材Tajaka的Naktha、Yamaya、Duhphali、Durupha定義與原例差異各列版本及證據，不合併為一項確定結論。年度運法的固定民用日與真實太陽度日亦分開。

## 其餘方法的來源與此次複查

| 方法 | 採用文本／作者資料 | 查核狀態與限制 |
|---|---|---|
| 八字原局 | [《子平真詮》成敗救應](https://www.donglishuzhai.net/chapter/3722.html)、三命通會人元司事、窮通寶鑑十干十二月 | 成敗救應章及三命卷二本輪重新讀取；窮通120入口／615段沿用已保存的校勘資料。窮通本輪網址未成功重讀，沒有冒稱本輪重新取得全文；質性語义待判仍保留。 |
| 紫微 | [iztro四化](https://iztro.com/zh_TW/learn/mutagen)、[作者v2.6.1流曜源碼](https://github.com/SylarLong/iztro/blob/v2.6.1/src/star/horoscopeStar.ts)、[楚天雲闊2018實例](https://fengshui-magazine.com.hk/No.251-May18/A208.htm) | 作者四化與2018河洛文本本輪成功重讀；選定40項表、流曜及轉象條件分版。其他秘訣不列為已實作。 |
| 六壬 | [《六壬大全》卷七](https://zh.wikisource.org/zh-hant/六壬大全/7)、[《六壬指南注解》神煞賦](https://shuyuan.zhiming.life/read/六壬指南注解/30) | 本輪重讀課經及神煞賦；原有64課族及290神煞登錄，未唯一成立條件為三值核對。其餘卷次校勘保留前輪來源記錄。 |
| 六爻 | [《增刪卜易》元忌仇](https://zh.wikisource.org/zh-hant/增刪卜易/10)、[用神章固定版本](https://zh.wikisource.org/w/index.php?title=增刪卜易/8&oldid=2100700) | 元忌仇本輪成功重讀；用神、月日、動變、伏飛與應期保留具名取法，多義親屬不選成唯一用神。 |
| 易經 | [《周易》逐卦彖象](https://zh.wikisource.org/wiki/周易/乾)、[《周易正義》](https://zh.wikisource.org/zh-hant/周易正義/06旅)、朱熹易學啟蒙變占 | 64卦／384爻及彖象文言使用既有完整校勘資料。易學啟蒙本輪網址讀取失敗，不把失敗算作重新查證；4096本變與0–6動爻原有驗證仍通過。 |
| 梅花 | [《梅花易數》卷一](https://zh.wikisource.org/zh-hant/梅花易數/卷一) | 本輪成功重讀；起卦、體用及本互變按原體政策。未提供外應不造資料。 |
| 姓名 | [Unicode UAX38](https://www.unicode.org/reports/tr38/)、[教育部異體字](https://dict.variants.moe.edu.tw/)、[1931熊崎原書](https://dl.ndl.go.jp/pid/1104862/1/7)、[1935原書](https://dl.ndl.go.jp/pid/1094933/1/25)、CDI及靈昭公開三才表 | Unicode本輪重讀；原書掃描及250三才條文沿用前輪校勘。1935網頁本輪未成功重讀；不把現代125表偽稱熊崎1931原著。 |
| 合盤 | 雙方原生八字、紫微所選同版本 | 雙向十神、跨柱關係、飛化、疊宮與同期運限由兩張真實原盘推得，沒有外加虛構的成功率。 |
| 人格 | 本站明示五軸32型映射 | 本站模型，不捏造古籍來源或心理效度。 |
| 塔羅／開鑰 | [Waite原文](https://sacred-texts.com/tarot/pkt/pkt0301.htm)、Mathers1888、[Liber LXXVIII](https://sacred-texts.com/oto/lib78.htm) | 三者本輪成功重讀；RWS正逆位、BookT元素尊貴與Mathers結構分開。開鑰未完成或放棄的輪次不補造結論。 |
| 雷諾曼 | [James R. Eads出版者牌陣指南](https://prismavisions.com/pages/lenormand-the-grand-tableau) | 本輪成功重讀；九宮與兩大牌陣的全部合法線、鏡像、騎士步及宮鏈實算，不聲稱所有歷史出版版已考證。 |
| 靈籤 | [東海龍門天聖宮原廟文本](https://donghaimazu.com/post/fortune-sticks/fs01/)、北港朝天宮程序 | 東海原廟本輪成功讀取；60首原詩與29事项索引校勘沿用。原廟5個空欄照實保留；故事名稱不等於故事史實皆已考證。 |

## 可重跑的證據

`npm run test:r7`：16組，包含原著手算例、明標合成的卜卦時序、實際星曆整合、20分盤及完整純文字。`scripts/verify-vedic-r7-swiss-20261003.py`：獨立166個時點，需安裝pyswisseph。其餘原生、補充、提示詞、78個回歸命令及手機／桌面入口的機器可讀報告位於docs。

文獻算式可核對與象徵解讀有效性是不同問題。本版保留支持、反證、來源歧異及未定條件；沒有把「測試通過」寫成「能證明終身感情或事件必然發生」。
