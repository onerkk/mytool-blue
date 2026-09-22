/* One public method catalogue for homepage entrances and invitation cards. */
(function(root){
  'use strict';
  // route, number, introduction, label, question, detail, share renderer
  root.JYMethodCatalog=Object.freeze([
    ['tarot','01','此刻的選擇','塔羅快讀','下一步，我可以怎麼走？','不用出生資料','tarot'],
    ['ootk','02','深入事件脈絡','開鑰之法','這件事背後，還有什麼線索？','78 張完整牌組','ootk'],
    ['lenormand','03','生活裡的線索','雷諾曼','把零散線索，連成一個故事。','依問題選牌陣','lenormand'],
    ['bazi','04','自己的生命節奏','八字命理','看見特質，也看見適合的步調。','需要出生資料','bazi'],
    ['compat','05','兩個人的相處','八字與紫微斗數合盤','我們如何理解與支持彼此？','四柱・十二宮・雙向合參','baziCompatibility'],
    ['ziwei','06','人生的不同面向','紫微斗數','從十二宮，認識人生的選擇。','需要日期時辰','ziwei'],
    ['meihua','07','變化中的方向','梅花易數','進一步，還是先停下來看清楚？','時間・數字・漢字','meihua'],
    ['oracle','08','給心一份安定','靜月靈籤','靜心求籤，讀一段此刻的提醒。','六十甲子靈籤','oracle'],
    ['vedic','09','九曜與生命節奏','印度占星','本命、分盤與運期，照見方向。','十六分盤・三層運期','vedic'],
    ['western','10','星辰與你的軌道','西洋占星','從星位與宮位，理解自己與時間。','本命・行運・次限・回歸','western'],
    ['liuyao','11','問一事，觀其變','六爻占卜','六次擲錢，靜看事情如何推進。','納甲・世應・月日・動變','liuyao'],
    ['yijing','12','進退之間的智慧','易經占卜','在古老卦辭裡，讀懂此刻的分寸。','六十四卦・卦爻辭・變占','yijing']
  ].map(Object.freeze));
})(globalThis);
