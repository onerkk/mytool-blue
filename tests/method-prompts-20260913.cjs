'use strict';
// The same builders used by the UI, with explicit synthetic casts.
const fs=require('node:fs'),path=require('node:path'),Module=require('node:module');
const filename=path.join(__dirname,'divination-audit-20260908.cjs');
const append=String.raw`
test('All 36 Lenormand cards retain their identity and gain contextual combination roles',()=>{
 const all=l.__lnAudit.cards,prompt=l.__lnAudit.build('目前生活各領域如何相互影響？',all,'grand');
 assert.equal((prompt.match(/組合用法：/g)||[]).length,36);
 all.forEach(card=>assert(prompt.includes(card.id+'.'+card.name)));
});
test('House-Key-Moon retains the exact question/order and asks for a reasoned answer without prescribing relationship status',()=>{
 const cards=[4,33,32].map(id=>l.__lnAudit.cards.find(card=>card.id===id));
 const prompt=l.__lnAudit.build('公司異性女工程師她單身嗎？',cards,'three');
 assert(prompt.includes('公司異性女工程師她單身嗎？'));assert(prompt.includes('1.房屋→2.鑰匙→3.月亮'));
 for(const text of ['充分解釋','相鄰 A→B','中間牌要有實際功能','部分現代讀法','該作者頁面採9×4'])assert(prompt.includes(text),text);
 assert(!prompt.includes('不讀塔羅式潛意識'));assert(!/偏向非單身|偏向單身|非單身的可能性/.test(prompt));
 if(process.env.JY_METHOD_OUTPUT){fs.mkdirSync(process.env.JY_METHOD_OUTPUT,{recursive:true});fs.writeFileSync(path.join(process.env.JY_METHOD_OUTPUT,'09-house-key-moon-prompt.txt'),prompt);}
});
test('RWS and Book T actually send their native method guide and preserve the cast',()=>{
 for(const mode of ['rws_reversals','gd_book_t']){const r=draw('five_card',mode),before=JSON.stringify(r.payload.tarotData);assert(r.payload.readingGuide.methods.tarot.length>=5);assert(r.prompt.includes('充分解釋'));assert(r.prompt.includes('建議說明如何介入'));assert.equal(JSON.stringify(r.payload.tarotData),before);}
});
test('Completed Key exports its own procedural guide with full counting/pairing distinctions',()=>{
 const before=c.Math.random;c.Math.random=()=>0.999999;
 try{c._ootkResults=c.ootkRunFull(35,'如何改善工作溝通？',{confirmedBeforeDeal:true,countDirection:'right',expectedPile:'water',primaryHouse:12,cognateHouse:7,expectedSign:11,expectedSephirah:5});}finally{c.Math.random=before;}
 const p=c._buildOOTKPayload(),prompt=c.JY_buildExportPrompt('ootk',p);assert(p.readingGuide.methods.ootk.length>=5);assert(prompt.includes('配對與計數若相反'));assert(prompt.includes('計數跳轉不當成元素相鄰'));
});
`;
const m=new Module(filename,module);m.filename=filename;m.paths=Module._nodeModulePaths(__dirname);m._compile(fs.readFileSync(filename,'utf8')+append,filename);
