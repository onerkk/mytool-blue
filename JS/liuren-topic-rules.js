/* R13 六壬大全卷三分類占法：只在題目命中且必要盤面資料存在時啟動。 */
(function(root){'use strict';
 const VERSION='20261004liuren-topic13',SOURCE='https://zh.wikisource.org/zh-hant/六壬大全/3';
 const A=x=>Array.isArray(x)?x:[],clone=x=>x==null?null:JSON.parse(JSON.stringify(x));
 function topic(q){q=String(q||'');const out=[];if(/財|錢|钱|收入|利潤|利润|買賣|买卖|交易|求財|求财/.test(q))out.push('wealth');if(/行人|回來|回来|歸來|归来|失聯|失联|人在何方|何時回|何时回/.test(q))out.push('traveler');if(/病|疾病|康復|康复|住院|症狀|症状/.test(q))out.push('illness');if(/空亡|虛假|虚假|落空|能不能成|是否成/.test(q))out.push('void-general');return [...new Set(out)];}
 function compute(r,question){if(!r||!A(r.transmissions).length)return {version:VERSION,status:'insufficient-data',missing:['三傳'],source:SOURCE};const ts=topic(question||r.question),first=r.transmissions[0],checks=[];
  if(first.empty)checks.push({id:'initial-void',topic:'void-general',status:'matched',evidence:{first:clone(first)},readingScope:'空亡發用：喜憂俱不成；久病/新病及求謀過旬的分支只在相應題型另啟用。'});
  if(ts.includes('wealth')){const dayWealth=A(r.plate).filter(x=>x.kinship==='妻財');checks.push({id:'wealth-placements',topic:'wealth',status:dayWealth.length?'calculated':'not-found',evidence:clone(dayWealth),readingScope:'財類只列妻財實際落點、發用空亡與克應候選；不由「見財」直接保證得財。'});if(first.empty)checks.push({id:'wealth-void',topic:'wealth',status:'matched',evidence:clone(first),readingScope:'《六壬大全》明列天地上下空亡，財物占尤須保守。'});}
  if(ts.includes('illness'))checks.push({id:'illness-void-age',topic:'illness',status:first.empty?'matched':'not-matched',requires:['新病/久病的現實病程'],missing:['使用者未提供病程長短時，不得替代醫療診斷，也不得套「久病凶/新病安」'],evidence:clone(first),readingScope:'古籍病占僅作傳統占法；不可當醫療結論。'});
  if(ts.includes('traveler')){const hasYearFate=!!(r.participants&&Object.values(r.participants).some(x=>x&&x.yearFate));checks.push({id:'traveler-year-location',topic:'traveler',status:hasYearFate?'eligible':'missing-required-input',requires:['行人行年/年命'],evidence:clone(r.participants),readingScope:'原文以行人年上定位；缺行年時不得用三傳任意替代其方位。'});}
  return {version:VERSION,status:'calculated',topics:ts,checks:checks.filter(x=>ts.includes(x.topic)||x.topic==='void-general'),source:SOURCE,policy:'分類占法是附加條件帳；先讀四課三傳九宗門，再按題型啟用。缺年命、病程等原文前提時明列缺項，不由AI猜。'};}
 root.JYLiurenTopicRules=Object.freeze({version:VERSION,compute,source:SOURCE});
})(typeof window==='undefined'?globalThis:window);
