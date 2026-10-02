(function(root){
  'use strict';
  const records=[
    ['ziping','沈孝瞻《子平真詮》','原典校錄','https://www.donglishuzhai.net/chapter/3721.html','月令、用神與位置先後；不是全部古籍格局已完成'],
    ['ziwei','iztro 作者運限文件','作者文件／原始碼','https://iztro.com/zh_TW/posts/horoscope','十二宮與流運定位；不同流派的四化、閏月、換日政策分開'],
    ['astronomy','Don Cross：Astronomy Engine','作者原始碼','https://github.com/cosinekitty/astronomy','地心視位置與獨立星曆比較'],
    ['swiss','Swiss Ephemeris Programmer Manual','資料發布者文件','https://www.astro.com/swisseph/swephprg.htm','獨立星曆、宫位數值覆核；沒有納入 Swiss 程式庫'],
    ['dignity','Deborah Houlding：Essential Dignity Tables','作者方法與原表','https://www.skyscript.co.uk/essential_dignities.html','七曜五項尊貴；Ptolemaic、Egyptian界表分開，作者例題獨立驗算'],
    ['ruler','Deborah Houlding：House Ruler','作者方法說明','https://www.skyscript.co.uk/glossary/house-ruler/','傳統七曜宮主、落宮與相位'],
    ['return','Skyscript：Returns','作者方法說明','https://www.skyscript.co.uk/glossary/R','太陽回到本命黃經，已開始年度與未開始年度分開'],
    ['pvr','P. V. R. Narasimha Rao：Vedic Astrology, An Integrated Approach','作者教材','https://vedicastrologer.org/articles/vedic_astro_textbook.pdf','Parashari 分盤、相位、運期、15.4.1–15.4.2 行星狀態；未完成完整六力'],
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
    ['oracle','北港朝天宮靈籤程序','廟方資料','https://www.matsu.org.tw/?act=menuinfo&ml_id=20240116003','程序參考；每首詩使用自己的sourceUrl與版本'],
    ['unihan','Unicode UAX #38：Unihan Database','資料發布者規格','https://www.unicode.org/reports/tr38/','字庫字段；現代筆畫不冒稱康熙姓名筆畫'],
    ['moe','教育部異體字字典','字典發布者','https://dict.variants.moe.edu.tw/','字形、字義、讀音覆核'],
    ['bphs','BPHS 第27章','原典英譯文本','https://vedic-astro.s3.amazonaws.com/books/bhrihat_parasara_hora_shastra.pdf','三個力度完整分量與月相子項；沒有六力總分'],
    ['raman','B. V. Raman《Graha and Bhava Balas》','作者教材文本','https://studylib.net/doc/28274582/bhava-and-graha-balas-b.v.raman-1996','七分盤與十度分組取法；文本識別錯誤不盲採'],
    ['kumazaki1931','熊崎健翁《熊崎式姓名學大奧義 地之卷》1931','國會圖書館原圖','https://dl.ndl.go.jp/pid/1104862/1/7','正文4–5頁核對超81循環；不是81條斷語全表已核對'],
    ['namebook','熊崎健翁《姓名の神秘》國會圖書館書目','原著書目','https://ndlsearch.ndl.go.jp/books/R100000039-I2971289','書目核對不等於取得全文或逐條覆核81數']
  ].map(([id,title,type,url,scope])=>({id,title,type,url,scope,checkedAt:'2026-10-02'}));
  const methods={bazi:['ziping'],ziwei:['ziwei'],astro:['astronomy','swiss','ruler','return','dignity'],vedic:['astronomy','swiss','pvr','bphs','raman'],liuren:['liuren','battle'],liuyao:['liuyao'],yijing:['yijing','yizhu'],meihua:['meihua'],name:['unihan','moe','namebook','kumazaki1931'],compat:['ziping','ziwei'],personality:['ziping'],tarot:['waite','bookt','mathers'],ootk:['bookt','mathers'],lenormand:['lenormand'],oracle:['oracle']};
  root.JYNativeRuleSources=Object.freeze({all:()=>records.map(x=>({...x})),forMethod:k=>records.filter(x=>(methods[k]||[]).includes(x.id)).map(x=>({...x}))});
})(typeof window==='undefined'?globalThis:window);
