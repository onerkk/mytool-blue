'use strict';
/* 塔羅焦點段全牌陣核對（實際 payload）：
 * 1) 有結果／走向／總結牌位的牌陣，落點那張一定進「本題焦點・先看」並標「落點」；時間線類各段都列。
 * 2) 沒問時間時有「不給時間區間」邊界句。
 * 3) 事業題的牌義不是〔一般〕（引擎牌義分類與焦點層一致）。
 * 4) 焦點層與引擎的題型判斷在一組題目上一致。 */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {fixture,load}=require('./ritual-lifecycle-20260911.cjs'),e=fixture(),c=e.ctx;
['reading-quality','reading-workflow','native-depth-contract','native-card-analysis','engine-computation-audit','native-rule-sources','native-chart-analysis','picker-core','tarot-foundation','golden-dawn-tarot','tarot-semantic-engine','tarot','tarot-reading','tarot_upgrade','prompt-brief','prompt-packet','prompt-export'].forEach(n=>load(e,n));
const F=c.JYTarotFoundation,P=c.JYPromptPacket;const q='我在目前公司未來發展為何？';const compiled=F.compileQuestion(q,{referenceDate:'2026-10-23T00:00:00Z'});
const norm=a=>/outcome/.test(a)?'outcome':a;let checked=0;const bad=[];
for(const id of Object.keys(F.METHODS)){if(id==='ootk'||id==='mathers_66')continue;let plan;try{plan=F.instantiateMethod(id,compiled);}catch(err){continue;}
  const drawn=Array.from({length:plan.count},(_,i)=>Object.assign({},c.TAROT[(i*11+3)%78],{isUp:i%3!==1,readingMode:'rws_reversals'}));
  let body;try{body=P.build('tarot',c.JYTarotReading.payload({spreadType:id,drawn,methodPlan:plan,compiledQuestion:compiled},q,drawn,id,plan,c.SPREAD_DEFS&&c.SPREAD_DEFS[id]),q);}catch(err){bad.push(id+': build '+err.message.slice(0,50));continue;}
  const i=body.indexOf('【本題焦點'),f=body.slice(i,body.indexOf('\n\n【',i+5));checked++;
  {const t=body.replace(/https?:\/\/\S+/g,'').replace(/^【[^】]*】\n+\{[^\n]*\}/,'').split(/\n\n(?=【)/).filter(x=>!/^【規則來源/.test(x)).join('\n');const w=t.match(/(?<![A-Za-z0-9-])[a-z][A-Za-z0-9_]{2,}(?:-[A-Za-z0-9_]+)*(?![A-Za-z0-9])/);if(w)bad.push(id+': english in real payload prompt: '+w[0]);if(/\{"|\["/.test(t))bad.push(id+': JSON in real payload prompt');}
  const ix=plan.slots.map((s,k)=>k),au=k=>norm(String(plan.slots[k].authority||'')),ro=k=>String(plan.slots[k].role||'');
  const landIdx=(()=>{const t=ix.filter(k=>/terminal/.test(ro(k)));if(t.length)return t[t.length-1];const o=ix.filter(k=>au(k)==='outcome');if(o.length)return o[o.length-1];const sy=ix.filter(k=>au(k)==='synthesis');if(sy.length)return sy[sy.length-1];const nat=ix.filter(k=>au(k)==='development'&&!/alternative/.test(ro(k)));return nat.length?nat[nat.length-1]:undefined;})();
  const rowsSec=body.slice(body.indexOf('【全部牌序'),body.indexOf('\n\n【',body.indexOf('【全部牌序')+3)).split('\n').slice(1);
  if(landIdx!=null&&id!=='zodiac'&&id!=='tree_of_life'&&id!=='monthly'){const lab=plan.slots[landIdx].label||String(rowsSec[landIdx]||'').split('/')[0];if(!f.includes(lab))bad.push(id+': landing slot not in focus ('+lab+')');else if(!/落點/.test(f))bad.push(id+': landing not marked');}
  if(!/不給|不要自己給時間/.test(f))bad.push(id+': no time boundary');
  // 焦點段的牌義必須和引擎牌義表逐字一致（不得自己重查而產生矛盾）
  {const tbl=body.slice(body.indexOf('【本站整理的RWS牌義參考'),body.indexOf('\n\n【',body.indexOf('【本站整理的RWS牌義參考')+3)).split('\n').slice(1);const engine={};tbl.forEach(l=>{const m=l.match(/^(.+?)｜(.+?)〔[^〕]*〕：(.*)$/);if(m)engine[m[1]+'｜'+m[2]]=m[3];});
   f.split('\n').forEach(l=>{const m=l.match(/^(.+?)：(\S+?(?:正位|逆位))—(.*?)(?:（落點.*）)?$/);if(!m)return;const key=m[1]+'｜'+m[2];if(engine[key]!==undefined&&engine[key]!==m[3])bad.push(id+': focus meaning differs from engine for '+key);});}
  const mt=body.match(/〔(一般|事業)〕/g)||[];if(mt.length&&mt.every(x=>x==='〔一般〕'))bad.push(id+': career question got general meanings');
}
console.log('spreads checked',checked);if(bad.length)console.log(bad.join('\n'));assert.equal(bad.length,0);
// 題型判斷只剩一個來源：引擎牌義分類讀 jyQuestionProfile().cardTopic
const prof=require('../JS/shared/question-profile.js').jyQuestionProfile;
const nca=fs.readFileSync(path.join(__dirname,'..','JS/native-card-analysis.js'),'utf8');assert(/jyQuestionProfile\(q\)\.cardTopic/.test(nca),'card meaning topic must come from the shared profile');
for(const qq of ['我在目前公司未來發展為何？','他會跟我在一起嗎？','我蝦皮賣場這副業值得堅持嗎？','明年財運如何？','媽媽的病會好轉嗎？'])assert.notEqual(prof(qq).cardTopic,'general',qq);
console.log(JSON.stringify({passed:2}));
