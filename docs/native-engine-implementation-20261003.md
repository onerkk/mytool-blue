# 15項命理引擎 R4：計算、文獻與驗證

版本：20261003native4；提示詞指引9.3.0；快取jy-main-v113。

本次已整合並實際驗證15個入口的排盤／抽取、原生作用資料、完整JSON下載与提示詞。這份報告**沒有宣稱所有古籍條款、全部流派或所有缺項均已完成**。所採用算法可追溯與重算，仍有下列明列未實作規則；完整排盤也不等於AI解讀必然零錯誤。

## 實際操作驗證

手機390px和桌面1280px各測15個具名入口；另測姓名兩版125表、紫微壬科天府、西洋Regiomontanus卜卦10宮與倫敦迁居。每個入口都實際產生計算、原生資料、提示詞與JSON下載。沒有呼叫遠端AI代替排盤。

靈籤自動測試使用固定uint32原始隨機輸入，經正式fallback拒絕抽樣及筊杯解釋程序產生第17籤／三聖筊；未注入結果物件。其他隨機抽牌使用瀏覽器隨機源。這是可重複的流程驗證，不是抽樣分布或預測效力試驗。

| 入口 | 本版實際計算與資料 | 手機／桌面 |
|---|---|---|
| 八字 | 四柱藏干十神、月令司事、八格成敗救應、外格、大運流年、120窮通入口原文與字面前提 | 通過 |
| 紫微 | 十二宮安星、五層運限及12流月、兩版40項四化、48飛化與48路徑、18星及兩具名河洛轉象 | 通過 |
| 西洋占星 | 十行星交點、四角五宮制、尊貴格局、次限回歸、迁居、卜卦宮主与成相／換座／轉向時序 | 通過 |
| 印度占星 | 16分盤、Vimshottari三级運期、17補充運期、六力及宮力、16盤八分/Pinda、Arudha/Argala、41補充Yoga及Neechabhanga | 通過 |
| 六壬 | 九宗門四課三傳天將、64課族、290神煞、18日土旺／整月政策、天文晝夜、真太陽時及交節应期 | 通過 |
| 六爻 | 八宮納甲、世應伏神六親六神、月日空破墓、動變元忌仇、原典取用與交節應期 | 通過 |
| 易經 | 64卦384爻、朱子0–6動爻選讀、彖象文言、本之互綜錯與纳甲 | 通過 |
| 梅花 | 時間／報數／漢字起卦、體用、本互變、季節與來源政策 | 通過 |
| 姓名 | 字形筆畫、五格81原典循環、兩份125三才表、原名與所有候選完整比較及出生八字 | 通過 |
| 雙人合盤 | 兩人完整八字与紫微、雙向十神／飛化、跨柱关系及同期運限 | 通過 |
| 人格 | 完整出生基礎與本站五軸32型模型及逐軸來源 | 通過 |
| 塔羅 | 實際正逆位、牌位、主題支線、BookT元素關係、Mathers各選定布局 | 通過 |
| 雷諾曼 | 合法牌句、九宮格與兩大牌陣、落宮長線、近域、鏡像、騎士步與宮鏈 | 通過 |
| 開鑰 | Mathers／Liber78具名程序、五輪實際計數、配對、元素尊貴与停止紀錄 | 通過 |
| 靈籤 | 60首原詩、29事項欄、逐籤校勘与配籤名稱；數位抽取及三聖筊流程 | 通過 |

## 驗算證據

- 原有78個獨立回歸命令全部通過；另有9組原生計算測試87個檢查組及5組補充測試57個檢查組通過。數字是各測試的檢查組數，不能當成57種原典全部規則已完成。
- 易經4096本卦／之卦組合与386小象／用象；兩版250三才項；兩版80四化項及作者具名部分盤例；PVR原教材例6、10、30、59、80、95、96逐項核對。
- 獨立Swiss數值核對Regiomontanus五地60宮頭。卜卦15個成相時刻最大角度差0.005009度、時刻差262.24秒；海平面六壬日出日落樣例差約2秒。數學求根的0.5秒容差不是星曆或事件秒級精度。
- 印度占星提示詞16盤PAV位元編碼与JSON Pointer均做還原比對；資料可重建。完整原始JSON保留全部運期、原典檢核與中間項。提示詞只列當前活躍子運，歷史／未來子運與失敗檢核明細另在完整JSON；未輸出明細不代表算法未計算，也不能把未成立規則當成立。
- 八字同一窮通句若包含「強弱、清濁、得所、有效制化」等詞，保留待判條件，不把字面透藏符合直接宣布原文全條成立。

## 仍然明列的邊界

- 八字：窮通原文強弱、清濁、得所、有效制化等完整語義未全部自動裁決；各句保留原文與未定条件。
- 八字：未採用的其他外格與人元司事異派。
- 紫微：其他未選四化表及本文以外北派河洛口訣；沒有宣稱全部門派秘訣均已實作。
- 西洋：未將全部歷史月亮空亡定義及六種古典阻止類型語義自動裁決；候選紀錄不是完整卜卦判斷法。
- 印度：PVR515頁與BPHS全部歷史Dasha／Yoga條款未逐條全數實作，採本版具名17補充運期與41Yoga。
- 印度：等強／同度規則沒有唯一解時保留候選，未任選結果。
- 六壬：未選用的其他神煞及占類細則；具名來源歧異保留。
- 六爻：未選用的其他神煞与取用門派細則。
- 易經：未選用的其他漢易與變占規則；本版納甲不在無月日輸入時添造六神。
- 姓名：舊LEGACY_UNVERIFIED125表未當熊崎原文核實；1931原書為1000式，不能冒造原著125表。
- 姓名：所選來源以外姓名學門派。
- 塔羅：Mathers1888第三法後段大圓重排句序有歧義，本站尚未完整復刻；已算66張初次布局与另抽2張意外牌。
- 雷諾曼：歷史出版版本未全部考證。
- 靈籤：其他廟宇版本；配籤故事史實未逐項独立考證。

此外，未知時辰、未提供坐標、未定用神與原文缺欄屬資料／來源條件，不能靠猜補成完整定盤。原廟頁有5個事項缺欄，JSON明列present:false；配籤名稱已校對，不代表配籤故事史實已全部考證。原文版本差異分表保留，不能把多個網站轉錄同一版本算成多份獨立證據。

## 可重建與檔案使用

完整包保留原專案全部834檔及原有素材，新增修補、資料、測試与報告。解壓後使用專案根目錄的index.html；如瀏覽器限制file路徑載入，可在電腦專案目錄以 `python -m http.server 8000` 啟動並開啟localhost:8000。API服務与原專案部署設定须照原環境啟用；本次未代為發布網站。

差異包只適合覆蓋原專案，不是獨立完整網站。Android若下載檔名變成`.zip.down`，請把最後的`.down`移除，保留`.zip`再解壓；不要以程式碼編輯器開啟壓縮檔。

資料重建：`node scripts/build-completion-data.cjs --check`；提示詞同步：`node scripts/sync-recommendation-guides.cjs --check`。補充測試：`npm run test:completion`；原生測試：`npm run test:native`。瀏覽器測試位於tests/native-*-entry-browser-20261003.cjs，使用本地檔案路由與已安裝Playwright／Chromium。

機器可讀範圍表：docs/native-scope-20261003.json；各套驗證明細：docs/*validation-20261003*.json；獨立卜卦誤差：docs/western-horary-independent-20261003.json。

## 55筆具名來源索引

- [沈孝瞻《子平真詮》](https://www.donglishuzhai.net/chapter/3721.html)：月令、用神與位置先後；不是全部古籍格局已完成。
- [《子平真詮》論用神成敗救應](https://www.donglishuzhai.net/chapter/3722.html)：八格成敗帶忌救應條件矩陣；權輕權重與有效制化另審。
- [《三命通會》卷二論人元司事](https://zh.wikisource.org/zh-hant/三命通會/卷二)：正文5/5/20、7/23、7/5/18表；同章異表、墓氣與藏干不混換。
- [iztro 作者運限文件](https://iztro.com/zh_TW/posts/horoscope)：十二宮與流運定位；不同流派的四化、閏月、換日政策分開。
- [Don Cross：Astronomy Engine](https://github.com/cosinekitty/astronomy)：地心視位置與獨立星曆比較。
- [Swiss Ephemeris Programmer Manual](https://www.astro.com/swisseph/swephprg.htm)：獨立星曆、宫位數值覆核；沒有納入 Swiss 程式庫。
- [Deborah Houlding：Essential Dignity Tables](https://www.skyscript.co.uk/essential_dignities.html)：七曜五項尊貴；Ptolemaic、Egyptian界表分開，作者例題獨立驗算。
- [Deborah Houlding：House Ruler](https://www.skyscript.co.uk/glossary/house-ruler/)：傳統七曜宮主、落宮與相位。
- [Skyscript：Returns](https://www.skyscript.co.uk/glossary/R)：太陽回到本命黃經，已開始年度與未開始年度分開。
- [P. V. R. Narasimha Rao：Vedic Astrology, An Integrated Approach](https://vedicastrologer.org/articles/vedic_astro_textbook.pdf)：第1章五支曆角度與日出日界、第12章八分PAV/BAV/SAV、十六分盤、兩階段消減與Pinda；Parashari分盤相位運期及15.4行星狀態；不是515頁全部規則都實作的宣稱。
- [Varahamihira《Brihat Jataka》英譯第IX章](https://upload.wikimedia.org/wikipedia/commons/c/c2/The_Brihat_jataka_%28IA_brihatjataka00varaiala%29.pdf)：p162共主座一有曜一無曜等值清無曜座；本版Trikona仍採PVR，不混入本英譯兩零清第三座。
- [Astrodienst 次限宮位說明](https://www.astro.com/faq/fq_fh_owtype_e.htm)：Naibod均日弧加出生RAMC及ARMC361實際次限恆星時分列；重算角點與12宮。
- [iztro v2.6.1作者流曜程式](https://github.com/SylarLong/iztro/blob/v2.6.1/src/star/horoscopeStar.ts)：五層魁鉞昌曲祿羊陀馬鸞喜獨立安星；流年另加年解，位置表依同版location.ts；舊七八十星政策保留。
- [《六壬大全》畢法賦](https://zh.wikisource.org/zh/六壬大全_(四庫全書本)/卷09)：三傳遞生互克、旬空與各方向條件。
- [《六壬大全》卷十殃咎課](https://zh.wikisource.org/zh-hant/六壬大全/10)：神克將內戰、將克神外戰。
- [《六壬指南注解》神煞賦前篇](https://shuyuan.zhiming.life/read/六壬指南注解/30)：歲神、月神方圖及正二至臘月表；具名異表與錯字另稽核。
- [《六壬指南注解》神煞賦中篇](https://shuyuan.zhiming.life/read/六壬指南注解/31)：月神順逆四组三合與十二位、旬神及干支神的實際定位。
- [《六壬指南注解》神煞賦後篇及庄氏辨訛](https://shuyuan.zhiming.life/read/六壬指南注解/32)：日干支神、官鬼及天目等辨訛；定位與四課三傳年命上神實際命中分列。
- [《六壬大全》卷五出軍凶日](https://zh.wikisource.org/zh-hant/六壬大全/5)：罪至正午至十二巳完整月序；第十月辰，具名另表解決《指南》轉錄胡字。
- [《增刪卜易》元神忌神](https://zh.wikisource.org/zh-hant/增刪卜易/10)：用神、元忌仇、月日動變與生克有效條件。
- [王弼、孔穎達《周易正義》](https://zh.wikisource.org/zh-hant/周易正義/06旅)：當位、中、應、乘承；不直接換算吉凶票數。
- [朱熹《易學啟蒙》](https://zh.wikisource.org/zh-hant/易學啟蒙)：考變占與0至6動爻擇辭。
- [《梅花易數》卷一至卷三](https://zh.wikisource.org/zh-hant/梅花易數/卷一)：卦數、體用、互變與純乾坤例外；外應未提供不編造。
- [A. E. Waite：The Pictorial Key to the Tarot](https://sacred-texts.com/tarot/pkt/pkt0301.htm)：既有RWS關鍵詞為現代摘要，不是原著逐字翻譯。
- [Liber LXXVIII／Book T](https://sacred-texts.com/oto/lib78.htm)：五輪操作與元素尊貴；不用RWS逆位覆蓋。
- [S. L. MacGregor Mathers：The Tarot (1888)](https://sacred-texts.com/tarot/mathers/mtar04.htm)：原稿操作口徑與後來Book T分開。
- [James R. Eads：Green Glyphs Lenormand / Grand Tableau](https://prismavisions.com/pages/lenormand-the-grand-tableau)：4×9布局；本站8×4＋4政策另列，幾何依本次布局實算。
- [東海龍門天聖宮六十甲子籤](https://donghaimazu.com/post/fortune-sticks/fs01/)：60首詩、29事項欄、配籤名稱與逐首摘要；第5首詩採香山財神廟原文校勘，解說採正確fs05-2，來源混段與缺欄明列。
- [北港朝天宮靈籤程序](https://www.matsu.org.tw/?act=menuinfo&ml_id=20240116003)：程序參考；每首詩使用自己的sourceUrl與版本。
- [Unicode UAX #38：Unihan Database](https://www.unicode.org/reports/tr38/)：字庫字段；現代筆畫不冒稱康熙姓名筆畫。
- [教育部異體字字典](https://dict.variants.moe.edu.tw/)：字形、字義、讀音覆核。
- [BPHS 第27章](https://vedic-astro.s3.amazonaws.com/books/bhrihat_parasara_hora_shastra.pdf)：Santanam英譯六力公式；與Raman月相、動力、照射等差異明列。
- [B. V. Raman《Graha and Bhava Balas》](https://studylib.net/doc/28274582/bhava-and-graha-balas-b.v.raman-1996)：七曜六力全部分項；第IX章十二Bhava方向／宮主／照射、九曜宮界比例及例59；第十二宮印表總分與分項不符，保留計算與印誤稽核。
- [熊崎健翁《熊崎式姓名學大奧義 地之卷》1931](https://dl.ndl.go.jp/pid/1104862/1/7)：正文4–5頁核對超81循環；不是81條斷語全表已核對。
- [熊崎健翁《運に乗る法》1935](https://dl.ndl.go.jp/pid/1094933/1/25)：正文46–54頁81數全表與循環逐頁覆核；保留正負條件，現代簡表與編輯練習分開。
- [《六壬大全》課經卷七](https://zh.wikisource.org/zh-hant/六壬大全/7)：九宗門與三光三陽三奇六儀時泰龍德。
- [《六壬大全》課經卷八](https://zh.wikisource.org/zh-hant/六壬大全/8)：官爵至閉口；行年丙寅順壬申逆及德孕旺孕算例。
- [《六壬大全》課經卷九](https://zh.wikisource.org/zh-hant/六壬大全/9)：遊子至災厄；古法月宿、四立四離、迍福逐條条件。
- [《六壬大全》課經卷十](https://zh.wikisource.org/zh-hant/六壬大全/10)：殃咎至物類；間傳24型及無祿絕嗣、雜狀物類分族。
- [熊崎健翁《姓名の神秘》國會圖書館書目](https://ndlsearch.ndl.go.jp/books/R100000039-I2971289)：書目核對不等於取得全文或逐條覆核81數。
- [《窮通寶鑑》十干十二月](https://zh.wikisource.org/wiki/窮通寶鑑)：120入口615段；合月原文保留合月，不把強弱清濁的質性條件冒稱全文語义判定。
- [iztro2.6.1十干四化表](https://iztro.com/zh_TW/learn/mutagen)：10×4；壬科左輔，實際作用於生年、五層運限及宮干飛化。
- [星格所引《紫微斗數全書》四化表](https://xingge.tw/zh-hant/learn/c4-birth-year)：具名10×4壬科天府版本；不是本次取得古籍原圖的宣稱。
- [楚天雲闊2018北派河洛自化體系實例](https://fengshui-magazine.com.hk/No.251-May18/A208.htm)：18星、48圖路、六對宮、祿忌4+1／權科2+3，四D–E與五A–B兩轉象規則；二C與後文宮職歧異保留。
- [Mantreswara《Phaladeepika》7.26–30](https://www.siva.sh/phaladeepika/7/26-30)：7曜4項Neechabhanga條件；力量門檻與互居角宮版本具名。
- [PVR教材第4、5、9–11、15、17–24章](https://www.vedicastrologer.org/articles/vedic_astro_textbook.pdf)：17補充Dasha、16盤Arudha／Argala、8Karaka、41Yoga與特殊點；Tables40/44/45與Examples6/10/30/59/80/95/96核對。
- [《選擇紀要》上編引神樞經](https://zh.wikisource.org/wiki/選擇紀要/上編)：四立前十八日UTC實際邊界，與整月土旺分開。
- [《增刪卜易》第8章用神](https://zh.wikisource.org/w/index.php?title=增刪卜易/8&oldid=2100700)：女婿醫藥父母文契與妹夫世；姑姨重義保留候選。
- [《周易》64卦彖象文言逐卦頁](https://zh.wikisource.org/wiki/周易/乾)：64彖、64大象、384小象、2用象與乾坤文言；各卦來源修訂與雜湊列於資料集。
- [CDI公開三才表五頁](http://www.cdi.org.tw/name/n-3-wood.html)：木火土金水各25，金頁採gold；125項不是熊崎原文。
- [靈昭道苑公開三才表](https://www.356.com.tw/teaching/?parent_id=1274)：完整125項與CDI版本分開，不把網站同版重複計票。
- [陶宏麟2018姓名筆劃數吉凶與運勢](https://econ.ntu.edu.tw/ter/new/data/new/TER47-3/TER473-4.pdf)：表4分類總數獨立核對；研究4來源共識23與本次2網站共25不可混稱。
- [Deborah Houlding行星光圈表](https://www.skyscript.co.uk/aspectorbs.html)：兩具名行星光圈取半；傳統相位和現代容許度分開。
- [Deborah Houlding月亮空亡的定義](https://www.skyscript.co.uk/voc.html)：換座前精確成相與現正入相兩種政策分列；不是全歷史空亡定義自動化。
- [Skyscript Reception](https://www.skyscript.co.uk/glossary/reception/)：主星接納來客方向，實際尊貴位置与古典相位條件。
