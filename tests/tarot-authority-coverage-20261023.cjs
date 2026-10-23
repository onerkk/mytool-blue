'use strict';
/* 塔羅牌位角色覆蓋：23 種牌陣在多種題型下實例化後，所有牌位的 authority 都必須在提示詞的角色對照表裡（含正規化：*outcome→outcome、person*→person_aggregate）。
 * 另核：「今年／明年／某年」只是範圍，不得觸發「原題問時間」。 */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');const root=path.resolve(__dirname,'..');
const F=require('../JS/tarot-foundation.js');const src=fs.readFileSync(path.join(root,'JS/prompt-single-paste.js'),'utf8');
const AUTH=Object.keys(eval('('+src.match(/const AUTH=(\{[^;]*\});/)[1]+')'));
const norm=a=>/outcome/.test(a)?'outcome':/antecedent/.test(a)?'antecedent':/^person/.test(a)?'person_aggregate':a;
const Q=['今年我有需要特別注意什麼嗎？','他會跟我在一起嗎？','留在A公司還是去B公司？','我什麼時候換工作？','我和他、和她、和前任三個人該選誰？','爸爸、媽媽、弟弟今年各自如何？','回顧今年、展望明年'];
const missing=new Set();let n=0;
for(const id of Object.keys(F.METHODS)){if(id==='ootk')continue;for(const q of Q){let p;try{p=F.instantiateMethod(id,F.compileQuestion(q,{referenceDate:'2026-10-23'}));}catch(e){continue;}p.slots.forEach(s=>{n++;const a=norm(String(s.authority||''));if(!AUTH.includes(a))missing.add(id+':'+s.authority);});}}
assert.equal(missing.size,0,'unmapped tarot authorities: '+[...missing].join(', '));
const at=q=>require('../JS/shared/question-profile.js').jyQuestionProfile(q).asks.timing;
for(const q of ['今年我有需要特別注意什麼嗎？','明年財運如何？','2028年我適合創業嗎？'])assert.equal(at(q),false,q);
for(const q of ['我什麼時候會換工作？','哪一年適合買房？','要等多久？'])assert.equal(at(q),true,q);
console.log(JSON.stringify({slots:n,authorities:AUTH.length,passed:2}));
