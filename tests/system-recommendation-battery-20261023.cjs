'use strict';
/* 跨方法推薦回歸：依題目性質推薦命理工具，30 題各列可接受的第一名；門檻 27/30。 */
const assert=require('node:assert/strict');const F=require('../JS/tarot-foundation.js');
const B=[
['目前的工作適合我嗎？',['bazi','ziwei']],['我蝦皮水晶賣場這副業該一直堅持嗎？',['bazi','ziwei','meihua']],['他會回我訊息嗎？',['liuyao','lenormand','liuren']],['他喜歡我嗎？',['tarot','liuyao']],['我們會復合嗎？',['tarot','liuyao']],
['留在A公司還是去B公司？',['tarot','lenormand']],['明年財運如何？',['bazi','ziwei']],['今年整體運勢？',['bazi','ziwei','astro','vedic']],['這個月會收到包裹嗎？',['liuyao','lenormand','liuren']],['給我今天的提醒',['oracle']],
['媽媽的病會好嗎？',['liuyao','bazi']],['改名字會比較好嗎？',['name']],['我和男友合不合？',['compat']],['我該怎麼跟主管溝通？',['tarot','yijing']],['為什麼我一直換工作？',['bazi','tarot']],
['下週面試會順利嗎？',['liuyao','lenormand','liuren']],['什麼時候會遇到正緣？',['bazi','ziwei','liuyao']],['我的人生方向是什麼？',['bazi','ziwei','astro','vedic']],['這筆投資能不能做？',['liuyao','meihua','bazi','tarot']],['我該不該離職？',['tarot','meihua','yijing','bazi']],
['我們之間的問題出在哪？',['tarot','yijing']],['錢包掉了找得回來嗎？',['liuyao','liuren','lenormand']],['公司的女同事喜歡我嗎？',['tarot','liuyao']],['我適合創業嗎？',['bazi','ziwei']],['哪一年適合買房？',['bazi','ziwei']],
['這段婚姻還有救嗎？',['tarot','liuyao','compat']],['我該怎麼面對這個困境？',['yijing','tarot','oracle']],['幫我看看我的個性',['bazi','ziwei','astro','vedic']],['下個月業績能達標嗎？',['liuyao','lenormand','liuren']],['我今年會升遷嗎？',['bazi','ziwei','liuyao']]];
let ok=0;const bad=[];for(const [q,exp] of B){const r=F.recommendSystem(q);if(exp.includes(r.system))ok++;else bad.push(r.system+' 期望'+exp.join('/')+' ← '+q+'（'+r.reason+'）');}
console.log('system recommendation '+ok+'/'+B.length);if(bad.length)console.log(bad.join('\n'));assert(ok>=27);console.log(JSON.stringify({passed:1}));
