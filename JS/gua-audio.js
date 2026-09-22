/*! Legacy coin API, backed by the shared recorded-file mixer. */
(function(root){
 'use strict';
 function f(){if(!root.JYFoley)throw new Error('實錄音效尚未載入');return root.JYFoley;}
 root.JYGuaAudio=Object.freeze({unlock:function(){f().setEnabled(true);return f().unlock(['coins']);},preview:function(){return f().play('coins',{scope:'gua-liuyao',volume:.7});},toss:function(){[0,1,2].forEach(function(i){f().play('coins',{scope:'gua-liuyao',delay:.99+i*.07,volume:.6,throttle:0});});},stop:function(){f().stop('gua-liuyao');f().stop('gua-yijing');},status:function(){var s=f().status();return {loaded:s.loaded.includes('coins'),duration:s.durations.coins||0,active:s.active,state:s.state};}});
})(window);
