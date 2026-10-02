(function(root){
  'use strict';
  const records=[
    ['ziping','沈孝瞻《子平真詮》','原典校錄','https://www.donglishuzhai.net/chapter/3721.html','月令、用神與位置先後；不是全部古籍格局已完成'],
    ['zipingrescue','《子平真詮》論用神成敗救應','原典校錄','https://www.donglishuzhai.net/chapter/3722.html','八格成敗帶忌救應條件矩陣；權輕權重與有效制化另審'],
    ['renyuan','《三命通會》卷二論人元司事','原典校錄','https://zh.wikisource.org/zh-hant/三命通會/卷二','正文5/5/20、7/23、7/5/18表；同章異表、墓氣與藏干不混換'],
    ['ziwei','iztro 作者運限文件','作者文件／原始碼','https://iztro.com/zh_TW/posts/horoscope','十二宮與流運定位；不同流派的四化、閏月、換日政策分開'],
    ['astronomy','Don Cross：Astronomy Engine','作者原始碼','https://github.com/cosinekitty/astronomy','地心視位置與獨立星曆比較'],
    ['swiss','Swiss Ephemeris Programmer Manual','資料發布者文件','https://www.astro.com/swisseph/swephprg.htm','獨立星曆、宫位數值覆核；沒有納入 Swiss 程式庫'],
    ['dignity','Deborah Houlding：Essential Dignity Tables','作者方法與原表','https://www.skyscript.co.uk/essential_dignities.html','七曜五項尊貴；Ptolemaic、Egyptian界表分開，作者例題獨立驗算'],
    ['ruler','Deborah Houlding：House Ruler','作者方法說明','https://www.skyscript.co.uk/glossary/house-ruler/','傳統七曜宮主、落宮與相位'],
    ['return','Skyscript：Returns','作者方法說明','https://www.skyscript.co.uk/glossary/R','太陽回到本命黃經，已開始年度與未開始年度分開'],
    ['pvr','P. V. R. Narasimha Rao：Vedic Astrology, An Integrated Approach','作者教材','https://vedicastrologer.org/articles/vedic_astro_textbook.pdf','Parashari 分盤、相位、運期、15.4.1–15.4.2 行星狀態；六力的流派與資料範圍另見 strengthLedger.policy'],
    ['progression','Astrodienst 次限宮位說明','計算法發布者','https://www.astro.com/faq/fq_fh_owtype_e.htm','Naibod均日弧加出生RAMC及ARMC361實際次限恆星時分列；重算角點與12宮'],
    ['zwflow','iztro v2.6.1作者流曜程式','作者技術原文','https://github.com/SylarLong/iztro/blob/v2.6.1/src/star/horoscopeStar.ts','五層魁鉞昌曲祿羊陀馬鸞喜獨立干支安星；既有七星八星政策保留'],
    ['liuren','《六壬大全》畢法賦','原典校錄','https://zh.wikisource.org/zh/六壬大全_(四庫全書本)/卷09','三傳遞生互克、旬空與各方向條件'],
    ['battle','《六壬大全》卷十殃咎課','原典校錄','https://zh.wikisource.org/zh-hant/六壬大全/10','神克將內戰、將克神外戰'],
    ['liuyao','《增刪卜易》元神忌神','原典校錄','https://zh.wikisource.org/zh-hant/增刪卜易/10','用神、元忌仇、月日動變與生克有效條件'],
    ['yijing','王弼、孔穎達《周易正義》','原典校錄','https://zh.wikisource.org/zh-hant/周易正義/06旅','當位、中、應、乘承；不直接換算吉凶票數'],
    ['yizhu','朱熹《易學啟蒙》','原典校錄','https://zh.wikisource.org/zh-hant/易學啟蒙','考變占與0至6動爻擇辭'],
    ['meihua','《梅花易數》卷一至卷三','原典校錄','https://zh.wikisource.org/zh-hant/梅花易數/卷一','卦數、體用、互變與純乾坤例外；外應未提供不編造'],
    ['waite','A. E. Waite：The Pictorial Key to the Tarot','作者原典','https://sacred-texts.com/tarot/pkt/pkt0301.htm','既有RWS關鍵詞為現代摘要，不是原著逐字翻譯'],
    ['bookt','Liber LXXVIII／Book T','原典','https://sacred-texts.com/oto/lib78.htm','五輪操作與元素尊貴；不用RWS逆位覆蓋'],
    ['mathers','S. L. MacGregor Mathers：The Tarot (1888)','作者原典','https://sacred-texts.com/tarot/mathers/mtar04.htm','原稿操作口徑與後來Book T分開'],
    ['lenormand','James R. Eads：Green Glyphs Lenormand / Grand Tableau','作者與出版者方法','https://prismavisions.com/pages/lenormand-the-grand-tableau','4×9布局；本站8×4＋4政策另列，幾何依本次布局實算'],
    ['oraclefull','東海龍門天聖宮六十甲子籤','廟方逐首全文','https://donghaimazu.com/post/fortune-sticks/fs01/','60首詩、29事項欄、配籤名稱與逐首摘要；第5首詩採香山財神廟原文校勘，解說採正確fs05-2，來源混段與缺欄明列'],
    ['oracle','北港朝天宮靈籤程序','廟方資料','https://www.matsu.org.tw/?act=menuinfo&ml_id=20240116003','程序參考；每首詩使用自己的sourceUrl與版本'],
    ['unihan','Unicode UAX #38：Unihan Database','資料發布者規格','https://www.unicode.org/reports/tr38/','字庫字段；現代筆畫不冒稱康熙姓名筆畫'],
    ['moe','教育部異體字字典','字典發布者','https://dict.variants.moe.edu.tw/','字形、字義、讀音覆核'],
    ['bphs','BPHS 第27章','原典英譯文本','https://vedic-astro.s3.amazonaws.com/books/bhrihat_parasara_hora_shastra.pdf','Santanam英譯六力公式；與Raman月相、動力、照射等差異明列'],
    ['raman','B. V. Raman《Graha and Bhava Balas》','作者教材文本','https://studylib.net/doc/28274582/bhava-and-graha-balas-b.v.raman-1996','七星六力全部分項、Ahargana、平行度動力、Sripathi方位、戰爭與照射算例；OCR衝突保留稽核'],
    ['kumazaki1931','熊崎健翁《熊崎式姓名學大奧義 地之卷》1931','國會圖書館原圖','https://dl.ndl.go.jp/pid/1104862/1/7','正文4–5頁核對超81循環；不是81條斷語全表已核對'],
    ['kumazaki1935','熊崎健翁《運に乗る法》1935','國會圖書館原圖','https://dl.ndl.go.jp/pid/1094933/1/25','正文46–54頁81數全表與循環逐頁覆核；保留正負條件，現代簡表與編輯練習分開'],
    ['liurenclasses7','《六壬大全》課經卷七','原典校錄','https://zh.wikisource.org/zh-hant/六壬大全/7','九宗門與三光三陽三奇六儀時泰龍德'],
    ['liurenclasses8','《六壬大全》課經卷八','原典校錄','https://zh.wikisource.org/zh-hant/六壬大全/8','官爵至閉口；行年丙寅順壬申逆及德孕旺孕算例'],
    ['liurenclasses9','《六壬大全》課經卷九','原典校錄','https://zh.wikisource.org/zh-hant/六壬大全/9','遊子至災厄；古法月宿、四立四離、迍福逐條条件'],
    ['liurenclasses10','《六壬大全》課經卷十','原典校錄','https://zh.wikisource.org/zh-hant/六壬大全/10','殃咎至物類；間傳24型及無祿絕嗣、雜狀物類分族'],
    ['namebook','熊崎健翁《姓名の神秘》國會圖書館書目','原著書目','https://ndlsearch.ndl.go.jp/books/R100000039-I2971289','書目核對不等於取得全文或逐條覆核81數']
  ].map(([id,title,type,url,scope])=>({id,title,type,url,scope,checkedAt:'2026-10-02'}));
  const methods={bazi:['ziping','zipingrescue','renyuan'],ziwei:['ziwei','zwflow'],astro:['astronomy','swiss','ruler','return','dignity','progression'],vedic:['astronomy','swiss','pvr','bphs','raman'],liuren:['liuren','battle','liurenclasses7','liurenclasses8','liurenclasses9','liurenclasses10'],liuyao:['liuyao'],yijing:['yijing','yizhu'],meihua:['meihua'],name:['unihan','moe','namebook','kumazaki1931','kumazaki1935'],compat:['ziping','ziwei'],personality:['ziping'],tarot:['waite','bookt','mathers'],ootk:['bookt','mathers'],lenormand:['lenormand'],oracle:['oracle','oraclefull']};
  root.JYNativeRuleSources=Object.freeze({all:()=>records.map(x=>({...x})),forMethod:k=>records.filter(x=>(methods[k]||[]).includes(x.id)).map(x=>({...x}))});
})(typeof window==='undefined'?globalThis:window);
