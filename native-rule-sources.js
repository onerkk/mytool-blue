(function(root){
  'use strict';
  const records=[
    ['zipingmonthly','子平真詮45 建祿月劫','原典校錄','https://www.donglishuzhai.net/chapter/3758.html','月令真實祿位、陽刃及本氣月劫分列；非比劫月不由次藏氣比劫透出冒充建祿月劫'],
    ['bphssudarsana','BPHS3/28/74 三輪作用與七盤Phala','原典英譯','https://vedic-astro.s3.amazonaws.com/books/bhrihat_parasara_hora_shastra.pdf','D1三輪、49七分盤分類、BPHS原始等數比強、本宮主例外；主文、極性與英譯註補四起始盤逐宮並算；名義2日/12ghatika細分算術不相容另列'],
    ['zipingcombine','子平真詮5 合而不合','原典校錄','https://www.donglishuzhai.net/chapter/3718.html','隔制、遠合、本身合、先合及爭合位置實算；不自動合去成化'],
    ['zipingroots','子平真詮6 得時不旺失時不弱','原典校錄','https://www.donglishuzhai.net/chapter/3719.html','十干四支同干／同五行根、重輕與陰長生類比分列'],
    ['zipingpurity','子平真詮11 用神純雜','原典校錄','https://www.donglishuzhai.net/chapter/3724.html','六具名月令互用結構；甲辰壬例保留文本歧異'],
    ['zipingorder','子平真詮20 生克先後','原典校錄','https://www.donglishuzhai.net/chapter/3733.html','四種先後、七明示位置例及兩個重建例；不偽造歷史生辰'],

    ['sudarsana','PVR第31章／BPHS第74章三重運期','作者原典教材／原典英譯','https://www.vedicastrologer.org/articles/vedic_astro_textbook.pdf','20分盤上升月日三參照、12月及144段、各次起始盤位和宮主相位、原生BAV核對；原例歧異及BPHS適用條件分列'],
    ['tajaka','PVR27–30與Balabhadra《Hayanaratna》2.4–5','作者原典教材／原典學術英譯','https://www.vedicastrologer.org/articles/vedic_astro_textbook.pdf','年度及当期月／60小時盤、Harsha／Pancha／Dwadasa、歳月主、36Sahams、16Yoga與3年度Dasha；三友敵版本與印例差異並列'],
    ['pvr20','PVR第6章20分盤','作者原典教材','https://www.vedicastrologer.org/articles/vedic_astro_textbook.pdf','D5／D6／D8／D11補入全部原生分盤作用；Example15的D8末句與推導不符採公式'],
    ['horarylight','GraemeTobyn2007傳光／集光與空間禁止','作者技術研究','https://www.skyscript.co.uk/tobyn2.html','最後分離及首次成相三傳光、集光接納、空間近度與同距合相優先；未解的同距非合相保留'],
    ['vedictransit','P.V.R. Narasimha Rao：Ch25–26行運','作者技術原文','https://www.vedicastrologer.org/articles/vedic_astro_textbook.pdf','Vedha與兩父子例外、入座時Murthi、27Tara及11特殊宿、PAV Kakshya、原BAV乘消減Pinda、20分盤雙向啟動'],
    ['xiaoyun','萬民英《三命通會》卷二·論小運','原典校錄','https://www.laoziliao.net/gu/jie/info/13068','醉醒子時柱起法與古法男丙寅／女壬申固定起式分列；立春歲界為本站曆法政策'],
    ['ziping','沈孝瞻《子平真詮》','原典校錄','https://www.donglishuzhai.net/chapter/3721.html','月令、用神與位置先後；不是全部古籍格局已完成'],
    ['zipingrescue','《子平真詮》論用神成敗救應','原典校錄','https://www.donglishuzhai.net/chapter/3722.html','八格成敗帶忌救應條件矩陣；權輕權重與有效制化另審'],
    ['renyuan','《三命通會》卷二論人元司事','原典校錄','https://zh.wikisource.org/zh-hant/三命通會/卷二','正文5/5/20、7/23、7/5/18表；同章異表、墓氣與藏干不混換'],
    ['ziwei','iztro 作者運限文件','作者文件／原始碼','https://iztro.com/zh_TW/posts/horoscope','十二宮與流運定位；不同流派的四化、閏月、換日政策分開'],
    ['astronomy','Don Cross：Astronomy Engine','作者原始碼','https://github.com/cosinekitty/astronomy','地心視位置與獨立星曆比較'],
    ['swiss','Swiss Ephemeris Programmer Manual','資料發布者文件','https://www.astro.com/swisseph/swephprg.htm','獨立星曆、宫位數值覆核；沒有納入 Swiss 程式庫'],
    ['dignity','Deborah Houlding：Essential Dignity Tables','作者方法與原表','https://www.skyscript.co.uk/essential_dignities.html','七曜五項尊貴；Ptolemaic、Egyptian界表分開，作者例題獨立驗算'],
    ['ruler','Deborah Houlding：House Ruler','作者方法說明','https://www.skyscript.co.uk/glossary/house-ruler/','傳統七曜宮主、落宮與相位'],
    ['return','Skyscript：Returns','作者方法說明','https://www.skyscript.co.uk/glossary/R','太陽回到本命黃經，已開始年度與未開始年度分開'],
    ['pvr','P. V. R. Narasimha Rao：Vedic Astrology, An Integrated Approach','作者教材','https://vedicastrologer.org/articles/vedic_astro_textbook.pdf','第1章五支曆角度與日出日界、第12章八分PAV/BAV/SAV、20分盤、兩階段消減與Pinda；Parashari分盤相位運期及15.4行星狀態；不是515頁全部規則都實作的宣稱'],
    ['brihatav','Varahamihira《Brihat Jataka》英譯第IX章','原典英譯原圖','https://upload.wikimedia.org/wikipedia/commons/c/c2/The_Brihat_jataka_%28IA_brihatjataka00varaiala%29.pdf','p162共主座一有曜一無曜等值清無曜座；本版Trikona仍採PVR，不混入本英譯兩零清第三座'],
    ['progression','Astrodienst 次限宮位說明','計算法發布者','https://www.astro.com/faq/fq_fh_owtype_e.htm','Naibod均日弧加出生RAMC及ARMC361實際次限恆星時分列；重算角點與12宮'],
    ['zwflow','iztro v2.6.1作者流曜程式','作者技術原文','https://github.com/SylarLong/iztro/blob/v2.6.1/src/star/horoscopeStar.ts','五層魁鉞昌曲祿羊陀馬鸞喜獨立安星；流年另加年解，位置表依同版location.ts；舊七八十星政策保留'],
    ['liuren','《六壬大全》畢法賦','原典校錄','https://zh.wikisource.org/zh/六壬大全_(四庫全書本)/卷09','三傳遞生互克、旬空與各方向條件'],
    ['battle','《六壬大全》卷十殃咎課','原典校錄','https://zh.wikisource.org/zh-hant/六壬大全/10','神克將內戰、將克神外戰'],
    ['liurenguide1','《六壬指南注解》神煞賦前篇','原典校錄','https://shuyuan.zhiming.life/read/六壬指南注解/30','歲神、月神方圖及正二至臘月表；具名異表與錯字另稽核'],
    ['liurenguide2','《六壬指南注解》神煞賦中篇','原典校錄','https://shuyuan.zhiming.life/read/六壬指南注解/31','月神順逆四组三合與十二位、旬神及干支神的實際定位'],
    ['liurenguide3','《六壬指南注解》神煞賦後篇及庄氏辨訛','原典校錄','https://shuyuan.zhiming.life/read/六壬指南注解/32','日干支神、官鬼及天目等辨訛；定位與四課三傳年命上神實際命中分列'],
    ['liurenzuizhi','《六壬大全》卷五出軍凶日','原典校錄','https://zh.wikisource.org/zh-hant/六壬大全/5','罪至正午至十二巳完整月序；第十月辰，具名另表解決《指南》轉錄胡字'],
    ['liuyao','《增刪卜易》元神忌神','原典校錄','https://zh.wikisource.org/zh-hant/增刪卜易/10','用神、元忌仇、月日動變與生克有效條件'],
    ['yijing','王弼、孔穎達《周易正義》','原典校錄','https://zh.wikisource.org/zh-hant/周易正義/06旅','當位、中、應、乘承；不直接換算吉凶票數'],
    ['yizhu','朱熹《易學啟蒙》','原典校錄','https://zh.wikisource.org/zh-hant/易學啟蒙','考變占與0至6動爻擇辭'],
    ['meihua','《梅花易數》卷一至卷三','原典校錄','https://zh.wikisource.org/zh-hant/梅花易數/卷一','卦數、體用、互變與純乾坤例外；外應未提供不編造'],
    ['waite','A. E. Waite：The Pictorial Key to the Tarot','作者原典','https://en.wikisource.org/wiki/The_Pictorial_Key_to_the_Tarot/Part_3','既有RWS關鍵詞為現代摘要，不是原著逐字翻譯'],
    ['bookt','Liber LXXVIII／Book T','原典','https://sacred-texts.com/oto/lib78.htm','五輪操作與元素尊貴；不用RWS逆位覆蓋'],
    ['mathers','S. L. MacGregor Mathers：The Tarot (1888)','作者原典','https://sacred-texts.com/tarot/mathers/mtar04.htm','原稿操作口徑與後來Book T分開'],
    ['lenormand','James R. Eads：Green Glyphs Lenormand / Grand Tableau','作者與出版者方法','https://prismavisions.com/pages/lenormand-the-grand-tableau','4×9布局；本站8×4＋4政策另列，幾何依本次布局實算'],
    ['oraclefull','東海龍門天聖宮六十甲子籤','廟方逐首全文','https://donghaimazu.com/post/fortune-sticks/fs01/','60首詩、29事項欄、配籤名稱與逐首摘要；第5首詩採香山財神廟原文校勘，解說採正確fs05-2，來源混段與缺欄明列'],
    ['oracle','北港朝天宮靈籤程序','廟方資料','https://www.matsu.org.tw/?act=menuinfo&ml_id=20240116003','程序參考；每首詩使用自己的sourceUrl與版本'],
    ['unihan','Unicode UAX #38：Unihan Database','資料發布者規格','https://www.unicode.org/reports/tr38/','字庫字段；現代筆畫不冒稱康熙姓名筆畫'],
    ['moe','教育部異體字字典','字典發布者','https://dict.variants.moe.edu.tw/','字形、字義、讀音覆核'],
    ['bphs','BPHS 第27章','原典英譯文本','https://vedic-astro.s3.amazonaws.com/books/bhrihat_parasara_hora_shastra.pdf','Santanam英譯六力公式；與Raman月相、動力、照射等差異明列'],
    ['raman','B. V. Raman《Graha and Bhava Balas》','作者教材文本','https://studylib.net/doc/28274582/bhava-and-graha-balas-b.v.raman-1996','七曜六力全部分項；第IX章十二Bhava方向／宮主／照射、九曜宮界比例及例59；第十二宮印表總分與分項不符，保留計算與印誤稽核'],
    ['kumazaki1931','熊崎健翁《熊崎式姓名學大奧義 地之卷》1931','國會圖書館原圖','https://dl.ndl.go.jp/pid/1104862/1/7','正文4–5頁核對超81循環；不是81條斷語全表已核對'],
    ['kumazaki1935','熊崎健翁《運に乗る法》1935','國會圖書館原圖','https://dl.ndl.go.jp/pid/1094933/1/25','正文46–54頁81數全表與循環逐頁覆核；保留正負條件，現代簡表與編輯練習分開'],
    ['liurenclasses7','《六壬大全》課經卷七','原典校錄','https://zh.wikisource.org/zh-hant/六壬大全/7','九宗門與三光三陽三奇六儀時泰龍德'],
    ['liurenclasses8','《六壬大全》課經卷八','原典校錄','https://zh.wikisource.org/zh-hant/六壬大全/8','官爵至閉口；行年丙寅順壬申逆及德孕旺孕算例'],
    ['liurenclasses9','《六壬大全》課經卷九','原典校錄','https://zh.wikisource.org/zh-hant/六壬大全/9','遊子至災厄；古法月宿、四立四離、迍福逐條条件'],
    ['liurenclasses10','《六壬大全》課經卷十','原典校錄','https://zh.wikisource.org/zh-hant/六壬大全/10','殃咎至物類；間傳24型及無祿絕嗣、雜狀物類分族'],
    ['namebook','熊崎健翁《姓名の神秘》國會圖書館書目','原著書目','https://ndlsearch.ndl.go.jp/books/R100000039-I2971289','書目核對不等於取得全文或逐條覆核81數'],
    ["qiongtong","《窮通寶鑑》十干十二月","原典校錄","https://zh.wikisource.org/wiki/窮通寶鑑","120入口615段引用、490不同來源段落；每段每句與或若分支保留，背景及未量化前提不冒稱全文語義判定"],
    ["sihuaiztro","iztro2.6.1十干四化表","作者發布表","https://iztro.com/zh_TW/learn/mutagen","10×4；壬科左輔，實際作用於生年、五層運限及宮干飛化"],
    ["sihuaquanshu","星格所引《紫微斗數全書》四化表","發布者引原文","https://xingge.tw/zh-hant/learn/c4-birth-year","具名10×4壬科天府版本；不是本次取得古籍原圖的宣稱"],
    ["zwheluo","楚天雲闊2018北派河洛自化體系實例","作者具名技術原文","https://fengshui-magazine.com.hk/No.251-May18/A208.htm","18星、48圖路、六對宮、祿忌4+1／權科2+3，四D–E與五A–B兩轉象規則；二C與後文宮職歧異保留"],
    ["phala","Mantreswara《Phaladeepika》7.26–30","原典梵文與英譯","https://www.siva.sh/phaladeepika/7/26-30","7曜4項Neechabhanga條件；力量門檻與互居角宮版本具名"],
    ["pvradvanced","PVR教材第4、5、9–11、15、17–24章","作者原典教材","https://www.vedicastrologer.org/articles/vedic_astro_textbook.pdf","17補充Dasha、20盤Arudha／Argala、8Karaka、41Yoga與特殊點；Tables40/44/45與Examples6/10/30/59/80/95/96核對"],
    ["earth18","《選擇紀要》上編引神樞經","原典校錄","https://zh.wikisource.org/wiki/選擇紀要/上編","四立前十八日UTC實際邊界，與整月土旺分開"],
    ["liuyaotarget","《增刪卜易》第8章用神","原典校錄","https://zh.wikisource.org/w/index.php?title=增刪卜易/8&oldid=2100700","女婿醫藥父母文契與妹夫世；姑姨重義保留候選"],
    ["yijingwings","《周易》64卦彖象文言逐卦頁","原典校錄","https://zh.wikisource.org/wiki/周易/乾","64彖、64大象、384小象、2用象與乾坤文言；各卦來源修訂與雜湊列於資料集"],
    ["sancaicdi","CDI公開三才表五頁","資料發布者原表","http://www.cdi.org.tw/name/n-3-wood.html","木火土金水各25，金頁採gold；125項不是熊崎原文"],
    ["sancai356","靈昭道苑公開三才表","資料發布者原表","https://www.356.com.tw/teaching/?parent_id=1274","完整125項與CDI版本分開，不把網站同版重複計票"],
    ["sancaistudy","陶宏麟2018姓名筆劃數吉凶與運勢","作者研究原文","https://econ.ntu.edu.tw/ter/new/data/new/TER47-3/TER473-4.pdf","表4分類總數獨立核對；研究4來源共識23與本次2網站共25不可混稱"],
    ["horaryorbs","Deborah Houlding行星光圈表","作者技術原文","https://www.skyscript.co.uk/aspectorbs.html","兩具名行星光圈取半；傳統相位和現代容許度分開"],
    ["horaryvoid","Deborah Houlding月亮空亡的定義","作者技術原文","https://www.skyscript.co.uk/voc.html","完整月亮入座至出座UTC時窗；五個具名操作化模型分列，保留光圈及精確版本；不是全歷史空亡定義的唯一復刻"],
    ["horaryreception","Skyscript Reception","作者技術原文","https://www.skyscript.co.uk/glossary/reception/","主星接納來客方向，實際尊貴位置与古典相位條件"],
    ["horarymoonentry","Deborah Houlding：When the Moon Translates Light or becomes Void","作者技術原文","https://www.skyscript.co.uk/moon2.html","Schoner具名解讀的換座前進入相位光圈；全座區間不受一般卜卦1日視窗截斷，與精確及全座合相模型分列；历史語义另列"]
    ,["horarydenials1","Graeme Tobyn：Perfection and its denial I (2007)","作者技術研究原文","https://www.skyscript.co.uk/tobyn2.html","轉逆、換座、Lilly時間序禁止及三類截光形式核對；空間等距版本不混算"]
    ,["horarydenials2","Graeme Tobyn：Perfection and its denial II (2007)","作者技術研究原文","https://www.skyscript.co.uk/tobyn3.html","嚴格中介輕重、駐留逆行B→A時序，返光燃燒／逆行與雙逆follower例外；近駐留質性及現實角色待判"]
    ,["ditiansui","《滴天髓》清濁／源流／通隔","原典校錄","https://zh.wikisource.org/wiki/滴天髓","清濁不以五行單一或財官印數量判；須看格局安頓、氣勢、阻隔及澄濁條件，故只對可觀測條件做有限域裁決"]
    ,["iztroconfig","iztro 官方配置與插件：流派四化／亮度可配置","作者官方開發文件","https://github.com/SylarLong/iztro-docs/blob/main/posts/config-n-plugin.md","確認不同流派四化與星曜亮度存在差異；本站必須將四化表綁定profile，不把多派表混成唯一版本"]
    ,["pvrofficial","P.V.R. Narasimha Rao 官方資源頁與教材","作者官方教材入口","https://www.vedicastrologer.org/articles/vedic_astro_textbook.pdf","作者公開Vedic Astrology: An Integrated Approach與研究文章；分盤、Dasha、Arudha/Argala等採具名方法，條件運法先核適用性"]
    ,["swissapi","Swiss Ephemeris 2.10 API Manual","資料發布者官方技術手冊","https://www.astro.com/swisseph-download/doc/swisseph.pdf","UT/TT、UTC轉換、行星與宮位API規格；本站以獨立算法／資料覆核，時間尺度不可混用"]
    ,["liuyao26","《增刪卜易》旬空章第二十六","原典校錄","https://zh.wikisource.org/zh-hant/增刪卜易/26","旺、動、生扶可構成空而不空；月破、真空等另判，避免見旬空即一律作廢"]
    ,["liuren3","《六壬大全》卷三分類占與空亡","原典校錄","https://zh.wikisource.org/zh-hant/六壬大全/3","行人、疾病、財與空亡等分類占法要求對應年命／用神條件；缺輸入時不得硬套"]
    ,["horaryvocglossary","Skyscript Void of Course glossary / Lilly definition","傳統占星技術說明","https://www.skyscript.co.uk/glossary/void-of-course/","Lilly式空亡重點在換座前是否立即進入另一相位影響；與現代精確相位定義分列"]

  ].map(([id,title,type,url,scope])=>({id,title,type,url,scope,checkedAt:["qiongtong", "sihuaiztro", "sihuaquanshu", "zwheluo", "phala", "pvradvanced", "earth18", "liuyaotarget", "yijingwings", "sancaicdi", "sancai356", "sancaistudy", "horaryorbs", "horaryvoid", "horaryreception", "horarymoonentry", "horarydenials1", "horarydenials2"].concat(['bphssudarsana','zipingcombine','zipingroots','zipingpurity','zipingorder','sudarsana','pvr','brihatav','zwflow','raman','liurenguide1','liurenguide2','liurenguide3','liurenzuizhi']).includes(id)?'2026-10-03':'2026-10-02'}));
  const r10Reviewed={"zipingmonthly":"第45章建祿月劫正文","zipingrescue":"第9章八格成敗救應正文","bphssudarsana":"英譯3.11、28.7–10、74.7–28指定段落","sihuaiztro":"十干四化表及六層說明","meihua":"卷一印本觀梅、牡丹與六字算例","liuyao":"第10章酉月辛亥兌之解算例及元忌神","liuren":"四庫卷九畢法遞生互克段","yijingwings":"乾卦彖象、用九及文言指定段","waite":"Part3取得正文；舊站頁取讀失敗後改用原著校錄","bookt":"五輪操作及計數規則原文段落","lenormand":"作者GrandTableau4x9、宮位及騎士步","oraclefull":"第1首詩與29事項欄","horaryvoid":"作者五種歷史VOC定義比較","horarymoonentry":"作者光圈及換座前成相解讀","unihan":"UAX38資料性質與字庫字段；不是康熙姓名筆畫"};
  records.forEach(r=>{if(r10Reviewed[r.id]){r.checkedAt="2026-10-03";r.lastReviewedRelease="20261004native10";r.r10ReviewScope=r10Reviewed[r.id];}});
  const r11Reviewed={qiongtong:'癸五月二壬一庚同透、癸八月丙辛隔位、壬十一月丁出時干；只補可觀察數量與位置，不宣稱全句質性已解',pvradvanced:'第4.3註9、第5.2-5.4與Examples7-9／Exercise8：BL矛盾雙模型、六時刻副星起點口徑及20分盤點位'};
  records.forEach(r=>{if(r11Reviewed[r.id]){r.checkedAt='2026-10-04';r.lastReviewedRelease='20261004native11';r.r11ReviewScope=r11Reviewed[r.id];}});

  const r12Reviewed={
    iztroconfig:'官方文件確認四化／亮度可配置，故新增流派profile隔離政策',
    pvrofficial:'作者官方資源頁確認教材與研究入口；多Dasha與分盤採具名方法，不多數投票',
    swissapi:'官方2.10 API手冊核對UT/TT、UTC轉換及宮位計算接口',
    liuyao26:'旬空章核對空而不空、月破與真空條件，禁止見空即廢',
    liuren3:'卷三行人／疾病／財／空亡分類條件，缺年命時保留不足',
    horaryvocglossary:'Lilly式VOC定義與本站其他VOC模型分列'
  };
  records.forEach(r=>{if(r12Reviewed[r.id]){r.checkedAt='2026-10-04';r.lastReviewedRelease='20261004native12';r.r12ReviewScope=r12Reviewed[r.id];}});
  const r13Reviewed={ditiansui:'清濁、源流、通隔原文：只把可觀測條件程式化，保留氣勢精神等質性前提',iztroconfig:'官方配置定義再次核對 yearDivide/horoscopeDivide/ageDivide/dayDivide/algorithm 與四化亮度差異',pvrofficial:'作者本人515頁教材核對20分盤、Yoga、Vimshottari/Ashtottari/Narayana/Kalachakra等章節與作者修訂警語',swissapi:'Swiss Ephemeris 2.10 programming interface核對UT與宮位/恆星黃道接口',liuyao:'《增刪卜易》序與全書核對用神→旬空月破→旺衰生克次序及進退有喜忌',liuyao26:'旬空章核對旺/動/日建動爻生扶之空而不空條件',liuren3:'卷三核對行人須年上、空亡發用、財物空亡等分類規則',horaryvoid:'Deborah Houlding VOC歷史定義分流，不合併為單一布林值'};
  records.forEach(r=>{if(r13Reviewed[r.id]){r.checkedAt='2026-10-04';r.lastReviewedRelease='20261004native13';r.r13ReviewScope=r13Reviewed[r.id];}});
  const methods={bazi:['zipingmonthly','zipingcombine','zipingroots','zipingpurity','zipingorder','ziping','zipingrescue','renyuan','qiongtong','xiaoyun','ditiansui'],ziwei:['ziwei','zwflow','sihuaiztro','sihuaquanshu','zwheluo','iztroconfig'],astro:['horarylight','astronomy','swiss','swissapi','ruler','return','dignity','progression','horaryorbs','horaryvoid','horaryvocglossary','horaryreception','horarymoonentry','horarydenials1','horarydenials2'],vedic:['bphssudarsana','sudarsana','tajaka','pvr20','vedictransit','astronomy','swiss','swissapi','pvr','pvrofficial','bphs','raman','brihatav','pvradvanced','phala'],liuren:['liuren','liuren3','battle','liurenclasses7','liurenclasses8','liurenclasses9','liurenclasses10','liurenguide1','liurenguide2','liurenguide3','liurenzuizhi','earth18','astronomy'],liuyao:['liuyao','liuyaotarget','liuyao26','renyuan'],yijing:['yijing','yizhu','yijingwings'],meihua:['meihua'],name:['unihan','moe','namebook','kumazaki1931','kumazaki1935','sancaicdi','sancai356','sancaistudy'],compat:['zipingmonthly','zipingcombine','zipingroots','zipingpurity','zipingorder','ziping','qiongtong','ziwei','sihuaiztro','sihuaquanshu'],personality:['ziping'],tarot:['waite','bookt','mathers'],ootk:['bookt','mathers'],lenormand:['lenormand'],oracle:['oracle','oraclefull']};
  root.JYNativeRuleSources=Object.freeze({all:()=>records.map(x=>({...x})),forMethod:k=>records.filter(x=>(methods[k]||[]).includes(x.id)).map(x=>({...x}))});
})(typeof window==='undefined'?globalThis:window);
