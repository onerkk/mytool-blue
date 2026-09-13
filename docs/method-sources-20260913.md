# 提示詞與排盤方法查核紀錄

查核日期：2026-09-13。這份紀錄將網路文獻支持的規則、本站選擇的變體、程式測試及仍未驗證的部分分開記載。

這次修改的目標是讓讀者得到有主次的回答：先回答原問題，再充分說明牌義或星曜如何在實際位置中互相作用、為何採用這個主判、局勢如何發展，以及對應的行動。沒有設定統一短篇幅，也沒有要求每題硬湊一個相反答案。

## 方法來源與實作對照

| 查核項目 | 實際查閱的來源 | 在本次修改中的用途與範圍 |
| --- | --- | --- |
| 塔羅牌位如何改變牌義、組合成故事 | Joan Bunning：[Lesson 4](https://www.learntarot.com/less4.htm)、[Lesson 18](https://www.learntarot.com/less18.htm) | 重寫「牌義在牌位中做什麼」，從主軸、原因、阻力、建議到落點整合；方法程序另依本站每個牌陣的實際位置。 |
| RWS 逆位 | Joan Bunning：[Lesson 17](https://www.learntarot.com/less17.htm) | 保留核心議題，依情境選受阻、內化、程度、釋放等表現。這些是解讀選項，不是所有逆位的固定翻譯。 |
| 三張、選擇與關係牌陣 | Tina Gong：[三張布局](https://labyrinthos.co/blogs/learn-tarot-with-labyrinthos-academy/3-card-tarot-spreads-simple-tarot-spreads-organized-by-layout)、[五張決策](https://labyrinthos.co/blogs/learn-tarot-with-labyrinthos-academy/making-tough-choices-a-5-card-tarot-spread-for-decision-making)；Biddy Tarot：[關係檢視](https://biddytarot.com/blog/relationship-check-in-tarot-spread/) | 支持依角色、對照與因果組織牌位。本站自訂選擇、關係等布局有自己的槽位，不能宣稱和作者的每張位置相同。 |
| 凱爾特十字 | A. E. Waite：[原著方法](https://sacred-texts.com/tarot/pkt/pkt0307.htm)；Tina Gong：[現代布局說明](https://labyrinthos.co/blogs/learn-tarot-with-labyrinthos-academy/the-celtic-cross-tarot-spread-exploring-the-classic-10-card-tarot-spread) | 校對十個位置、內外因素與結果的關係；不同版本的位置編號與交叉牌處理以本盤已宣告設定為準。 |
| Mathers 的抽取、分堆與首尾配對 | S. L. MacGregor Mathers：[Methods of Divination](https://sacred-texts.com/tarot/mathers/mtar04.htm) | 保留 21 張與分堆讀法的實際發牌序及配對。原著分堆敘述的尾牌數量歧義由既有程式政策明示；本次沒有偷偷另換一套發牌。 |
| 開鑰之法、計數及元素尊貴 | [Book T／Liber LXXVIII](https://sacred-texts.com/oto/lib78.htm) | 分清實際左右鄰牌、計數跳轉及首尾配對；按完成且有效的操作綜合。強化牌的作用不等於一定有利，跨輪呼應不當獨立票數。 |
| 雷諾曼的組合句法 | Tina Gong：[Card Combinations](https://labyrinthos.co/blogs/learn-tarot-with-labyrinthos-academy/how-to-read-lenormand-card-combinations) | 以題目、相鄰修飾及整條線選義；新添 36 張牌各自的組合功能，屬本站編寫的應用指引，不是抄一份固定兩牌字典。 |
| 三張線與五／七張線、鏡像 | Tina Gong：[三張](https://labyrinthos.co/blogs/learn-tarot-with-labyrinthos-academy/how-to-read-three-card-lenormand-spreads)、[五／七張](https://labyrinthos.co/blogs/learn-tarot-with-labyrinthos-academy/how-to-read-five-card-and-seven-card-lenormand-spreads) | 相鄰片段先成句，再回讀全線；鏡像是補充關係。手機換行不會改變原始牌序。 |
| 九宮格 | Tina Gong：[Nine-card Portrait](https://labyrinthos.co/blogs/learn-tarot-with-labyrinthos-academy/how-to-read-nine-card-portrait-box-or-3x3-lenormand-spreads) | 查核中心、外框、橫直線的功能。本站議題軸、選擇分支與末排收束是明示變體。 |
| 大牌陣宮位與幾何 | 牌組作者 James R. Eads：[Grand Tableau](https://prismavisions.com/pages/lenormand-the-grand-tableau) | 作者頁採 **9×4**，本站採 **4×8＋4**。只引用相容的宮位、距離、騎士步等方法概念；具體鏡像、座標及合法連線一律由本站實際幾何輸出。 |
| 房屋、鑰匙、月亮的選義 | Tina Gong：[房屋](https://labyrinthos.co/blogs/lenormand-cards/the-house-lenormand-card-meaning-and-combinations)、[鑰匙](https://labyrinthos.co/blogs/lenormand-cards/the-key-lenormand-card-meaning-and-combinations)、[月亮](https://labyrinthos.co/blogs/lenormand-cards/the-moon-lenormand-card-meaning-and-combinations)；讀牌者 Layla：[Moon](https://www.lenormandreader.com/the-moon)、[Moon 方法討論](https://www.lenormandreader.com/blog/lenormand-mute-cards-part-4-the-moon) | 實際文獻存在差異：Labyrinthos 的月亮偏心理語彙，Layla 同時使用名譽、情感等層次。新版取消「潛意識讀法一律不行」的寫法，要求說明所用脈絡及組合支持。這些來源沒有證明「房屋→鑰匙→月亮」必然代表非單身。 |
| 八字月令、格局與成敗救應 | 《子平真詮》：[論用神](https://www.donglishuzhai.net/chapter/3721.html)、[論用神成敗救應](https://www.donglishuzhai.net/chapter/3722.html) | 先看月令、透藏、根氣與全局通路，再判成局與救應；官財印食殺傷等組合要解釋實際作用，不能只認出兩個十神名稱便認定成格。 |
| 格局、扶抑及調候如何合參 | 《子平真詮》：[論用神配氣候得失](https://www.donglishuzhai.net/chapter/3727.html) | 冬木、金水、夏木等例顯示氣候會改變同一結構的作用。新版要求比較阻斷全局的條件、安排取用先後，而非把幾份五行建議直接相加。 |
| 十干 × 十二節令月的季節取用參考 | 《窮通寶鑑》：[所校全文版本](https://www.ncc.com.tw/fate/paleo/bg/bg_11.htm)；[辛金篇交叉參考](https://www.8bei8.com/book/qiongtongbaojian_9.html) | 已讀所校全文並逐一整理 120 個入口。保留候選天干與分工，五行欄位由它們產生。遇原文合論一季、不逐月獨立立論的段落，明示依季節總論；這是條件摘要，不是典籍所有分支的完整推理引擎。 |
| 農曆日期與時刻 | 香港天文台：[2026 年對照表](https://www.hko.gov.hk/tc/gts/time/calendar/text/files/T2026c.txt)、[視太陽時](https://www.hko.gov.hk/tc/gts/time/basicterms-apparentsolartime.htm)；NOAA：[Solar Calculations](https://gml.noaa.gov/grad/solcalc/solareqns.PDF) | 支持公農曆日期、經度／時區／均時差分工。天文資料只驗算時間，不認證八字或紫微的事件預測。回歸另使用專案已有的香港天文台三年 36 個月首資料。 |
| 月時干支與起運接口 | 《三命通會》：[卷二](https://zh.wikisource.org/zh-hant/三命通會/卷二)；6tail：[lunar-javascript 作者原始碼入口](https://github.com/6tail/lunar-javascript/blob/master/lunar.js) | 配合本地固定版本 `JS/vendor/lunar.js` 及既有邊界測試核對；網頁原始碼顯示不完整，因此沒有將線上頁面當完整程式比對證明。未更新曆法依賴版本。 |
| 紫微安星、局數、斗君 | iztro 作者：[安星訣](https://iztro.com/zh_TW/learn/setup) | 核對所選安星與四化口徑，保留本次 calculationPolicy。回歸包含 150 個紫微定位格、144 個月時命身宮組合及既有輔星／廟旺資料。 |
| 三方四正與來因宮 | iztro 作者：[宮位](https://iztro.com/zh_TW/learn/palace) | 本宮、三合及對宮依地支定位。所選來因宮規則是宮干同生年干且排除子丑；修正 AI 資料接口誤把生年化祿落宮當來因宮的錯誤。 |
| 紫微四化與時間層 | iztro 作者：[四化](https://docs.iztro.com/zh_TW/learn/mutagen)、[運限](https://iztro.com/zh_TW/learn/horoscope) | 生年、宮干、大限、流年分層，並保留星性、來源、去向。新增各運限十二宮映射及本命／當期雙重宮名，補齊四化；小限改用引擎同一參照農曆年的虛歲。 |
| 梅花起卦、體用互變與取象 | 《梅花易數》：[卷一／起例](https://www.eee-learning.com/book/4080)、[體用生剋篇](https://www.quanxue.cn/qt_mingxiang/meihua/meihua05.html) | 核對卦數、動爻、上下卦、體用及互變，並按季節與取象說明作用。原文也要求通變與情理，不能機械套用某個物象或吉凶單詞。 |
| 靈籤原詩與版本 | 東海龍門天聖宮：[第一籤原詩與解說](https://donghaimazu.com/post/fortune-sticks/fs01/) | 區分原詩、廟方解說與後加標籤，依整首語勢、轉折和前提回應問題。這次重新核閱廟方示例；60 首版本完整性由現有固定資料與匯出測試檢查，未宣稱當天逐頁重新抓取 60 首。 |
| 西洋占星的度數、宮制與相位 | Astrodienst：[Swiss Ephemeris 技術文件](https://www.astro.com/swisseph/swephprg.htm)；Deborah Houlding：[相位的來源與用法](https://www.skyscript.co.uk/aspects.html) | 分清 UT／TT、熱帶／恆星黃道、宮制與容許度；結合行星職責、落宮及相位條件。三分不等於一定有利、四分也不等於必然失敗。這次重寫解讀工作流，沒有把本站原占星計算改成 Swiss Ephemeris。 |
| 吠陀運期、分盤與時間敏感性 | P. V. R. Narasimha Rao：[作者教材](https://www.vedicastrologer.org/articles/vedic_astro_textbook.pdf) | 查閱 Vimsottari 運期、D1／D9 的不同層次與時間敏感性。新版先定位本題宮主、本命條件及實際運期，再談分盤承接；不同相位與運期體系按輸入設定使用。 |
| 姓名筆畫與不同計算口徑 | 南山誠林：[字畫規則](https://www.seimeihandan.jp/jikaku) | 作者自己的規則顯示字形還原、部首及筆畫口徑須先說清。未把日本姓名學規則替換成本站的康熙／五格算法，也不把某派數理當通用事實。 |
| 合盤與人格卡 | 上述子平原局方法，加上本站雙向十神與情境模型 | 跨盤與人格類型是本站應用層。新版先讀兩個原局、明示 A 看 B／B 看 A，再按戀愛、合夥、親子等情境形成建議；不冒稱古籍原有本站的分數或 32 型卡片。 |

## 這次查核直接造成的修正

1. **八字季節參考資料有實際錯誤。** 舊表的一些五行欄位與文字互相矛盾，亦有生剋、墓庫及月份取用的錯寫。新版改為天干候選與條件同源，再生成五行集合；例如辛寅保留己土與壬水的不同作用，壬申與壬酉的入口分開。冬己的水多、土多、金多分支沒有被壓成一個無條件火元素答案。
2. **舊季節參考曾以五行低於 25% 才顯示，並產生急迫度。** 所查原文沒有這個比例門檻。現在完整顯示季節入口，由全局格局、根氣與制化合參；不自動改寫扶抑喜忌，也不藉此強推某類飾品。
3. **紫微運限資料不足以支持所要求的疊宮分析。** 現在大限、流年、流月都附十二宮地支對照；每條四化同時保留本命宮及當期宮名。星曜留在原本命盤，不移星造盤。
4. **綜合 AI 接口有紫微誤傳與漏傳。** 修正來因宮定義、農曆年前的流年參照、小限歲數；保留全部祿權科忌、完整飛化與月限資料，並以宮位物件身分取值。
5. **本地 AI 備用接口曾遺漏獨立牌面。** 塔羅與開鑰放在 `tarotData`、`ootkData`，舊接口只處理部分摘要。現在原始牌面、幾何、方向、停止狀態及方法資料包優先傳送，摘要排在後面。
6. **表達要求會壓縮分析。** 共用寫作層及獨立入口都改成主判、機制、取捨、發展、條件與行動，取消固定「一小段依據」及必須平排反向解讀的要求。API 回應上限由 4096 調至 8192 tokens，以容納完整分析。
7. **月亮的用法不宜假裝只有一派。** 取消過度概括的禁止句，明示所用牌義脈絡，讓題目及有效組合決定選義。

## 驗證的含義

測試證明的是已列條件下的算式、資料一致性、實際匯出與操作流程。它們不能證明所有命理判斷正確，不能把傳統象徵變成對某人的私生活調查，也沒有量得預測成功率。

「明確回答」的標準是有理由的主判與具體處理方向。強訊號要明確說出方向；資料本身不能區分兩種身分狀態時，則精確指出辨識缺口，再完成本盤仍能解釋的部分。不是所有問題都變成「皆有可能」，也不是所有是非題都必須硬選一邊。

網站外部 `jy-ai-proxy.onerkk.workers.dev` 的伺服器原始碼不在這份專案中。本次已更新前端送往它的方法資料包與本地 `functions/api/ai.js`，但未修改或部署該外部服務，也未以付費模型實際生成答案。測試紀錄中的模型回傳均明示為模擬。

部分舊來源 URL 本次沒有成功取得正文，例如 6tail 的 API 網頁、易學網卷二頁及 Astrodienst 部分入門頁；已另用成功取得的作者原碼入口、古籍轉錄與作者方法文交叉參考。沒有將載入失敗當成已完成查證。
