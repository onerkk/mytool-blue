'use strict';
/* 題目輪廓單一來源：各使用檔嵌入的區塊與 JS/shared/question-profile.js 逐字一致；
 * 使用者不得自帶題型正規式（DOMAINS 表、asksTiming/asksAmount/asksVocation 正規式、牌義 topic 正規式）。 */
const fs=require('fs'),path=require('path'),assert=require('assert/strict');const root=path.resolve(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');const src=read('JS/shared/question-profile.js');
const block=src.slice(src.indexOf('// BEGIN SHARED QUESTION PROFILE'),src.indexOf('// END SHARED QUESTION PROFILE'));
const users=['JS/native-card-analysis.js','JS/tarot-foundation.js','JS/lenormand.js','JS/shared/question-planner.js','tarot-foundation.js','lenormand.js'];
for(const f of users){const s=read(f);assert(s.includes(block),f+' embeds a stale or missing question profile');}
const {jyQuestionProfile:P}=require('../JS/shared/question-profile.js');
const cases=[['我在目前公司未來發展為何？','career'],['公司異性女工程師未來會跟我交往嗎？','love'],['我蝦皮水晶賣場這副業該一直堅持嗎？','business'],['明年財運如何？','wealth'],['媽媽的病會好轉嗎？','health'],['錢包掉了找得回來嗎？','general'],['今年我有需要特別注意什麼嗎？','general']];
for(const [q,d] of cases)assert.equal(P(q).domain,d,q);
assert.equal(P('今年我有需要特別注意什麼嗎？').asks.timing,false);assert.equal(P('我什麼時候會換工作？').asks.timing,true);
console.log(JSON.stringify({embedded:users.length,passed:3}));
