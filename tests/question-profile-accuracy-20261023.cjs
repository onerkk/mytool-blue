'use strict';
/* 題目輪廓準確率：領域與第三人各自 ≥ 95%。低於門檻代表詞族漏了，要改 JS/shared/question-profile.js 的詞族，不是改這裡的答案。 */
const assert=require('assert/strict');const L=require('./fixtures/question-labels-20261023.cjs');const {jyQuestionProfile:P}=require('../JS/shared/question-profile.js');
let d=0,t=0;const miss=[];for(const [q,dom,tp] of L){const p=P(q);if(p.domain===dom)d++;else miss.push('領域 '+p.domain+'≠'+dom+'：'+q);if(p.asks.thirdPerson===tp)t++;else miss.push('第三人 '+p.asks.thirdPerson+'≠'+tp+'：'+q);}
console.log('domain '+d+'/'+L.length+', thirdPerson '+t+'/'+L.length);miss.forEach(m=>console.log(m));
assert(d/L.length>=.95&&t/L.length>=.95);console.log(JSON.stringify({passed:1}));
