'use strict';
/* 正統解讀契約：50 種問法 × 15 種方法，每份提示詞都要有「本法正統取法」，規則只剩三條（口吻、正統推演、誠實與安全），
 * 不得出現站內自訂的焦點層、邊界層或題型限制句，資料全中文、無 JSON、無 undefined。 */
const assert=require('assert/strict');const {environment,examples}=require('./native-fixtures-20261003.cjs');
const env=environment(),c=env.ctx;['tarot-foundation','prompt-brief','prompt-packet'].forEach(env.load);const x=examples(c),P=c.JYPromptPacket;
const Q=require('./fixtures/question-corpus-20261023.cjs');const bad=[];let n=0;
const FORBIDDEN=/本題焦點|本題邊界|能回答：|不能做：|量化題|看不到命定|不斷定某個人|沒問時間|回看資料|五輪時間規則|答案以這張為準|吉凶傾向/;
for(const q of Q)for(const [m,chart] of Object.entries(x.charts)){let b;try{b=P.build(m,chart,q);}catch(e){if(/超過單次貼上預算/.test(e.message))continue;bad.push(m+'｜'+q+'｜build '+e.message.slice(0,40));continue;}n++;
  if(!/【本法正統取法（[^）]+）】\n依/.test(b))bad.push(m+'｜'+q+'｜no orthodox procedure');
  const rules=(b.split('【解讀與查證規則】\n')[1]||'').split('\n\n【')[0].split('\n');if(rules.length!==3)bad.push(m+'｜rules '+rules.length);
  const f=b.match(FORBIDDEN);if(f)bad.push(m+'｜'+q+'｜site rule present: '+f[0]);
  const t=b.replace(/https?:\/\/\S+/g,'').replace(/^【[^】]*】\n+\{[^\n]*\}/,'').split(/\n\n(?=【)/).filter(s=>!/^【規則來源/.test(s)).join('\n');
  const w=t.match(/(?<![A-Za-z0-9-])[a-z][A-Za-z0-9_]{2,}(?:-[A-Za-z0-9_]+)*(?![A-Za-z0-9])/);if(w)bad.push(m+'｜'+q+'｜english '+w[0]);
  if(/\{"|\["/.test(t))bad.push(m+'｜'+q+'｜JSON');if(/undefined|NaN/.test(t))bad.push(m+'｜'+q+'｜undefined');}
// 引擎算好的正統分析不得看題型才交付：八字子息分析在任何問題下都要送到
{const bz=P.build('bazi',x.charts.bazi,'目前的工作適合我嗎？');if(!bz.includes('【子女（論子息）實算】'))bad.push('bazi｜children analysis gated by question');}
// 可讀性：任何資料段不得被攤平成大量無標籤值
for(const [m,chart] of Object.entries(x.charts)){let b;try{b=P.build(m,chart,'我今生有幾個兒女？');}catch(e){continue;}for(const sec of b.split(/\n\n(?=【)/)){const title=(sec.match(/^【([^】]*)】/)||[])[1]||'';if(/規則|取法|成稿|一次貼上|原問題|資料閱讀|讀完資料/.test(title))continue;const segs=sec.slice(title.length+2).split(/[；\n]/).map(z=>z.trim()).filter(Boolean);if(segs.length<8)continue;const bare=segs.filter(z=>/^(是|否|未定|男|女|[0-9.]+)$/.test(z)).length;if(bare/segs.length>0.12)bad.push(m+'｜'+title.slice(0,24)+'｜unreadable flattening '+bare+'/'+segs.length);}}
// 資料段不得夾帶站內解讀句或免責語；網址不得被截壞
{const GLOSS=/不在狀態|停在哪張|只能給季節感|不當結論|用來補路徑|力度要打折|人被綁住|自己一個人運作|力道打折|力道特別強|事情不如他想的那樣|推進力來自|嘴上問的|身邊的力量在|事件保證|不能換算|不能挑未列|不作額外吉凶依據/;
 const fs=require('fs');const o=JSON.parse(fs.readFileSync(require('path').join(__dirname,'..','docs/qa-single-paste27/ootk-fixture.json'),'utf8'));
 const all=Object.entries(x.charts).map(([m,ch])=>{try{return [m,P.build(m,ch,'目前的工作適合我嗎？')];}catch(e){return null;}}).filter(Boolean).concat([['ootk-real',P.build('ootk',o,o.question)]]);
 for(const [m,b] of all){for(const sec of b.split(/\n\n(?=【)/)){const title=(sec.match(/^【([^】]*)】/)||[])[1]||'';if(/規則|取法|成稿|一次貼上|原問題|資料閱讀|讀完資料|規則來源/.test(title))continue;const g=sec.match(GLOSS);if(g)bad.push(m+'｜'+title.slice(0,20)+'｜site gloss: '+g[0]);if(/(?<!https?):\/\/|\/\/zh\.\./.test(sec))bad.push(m+'｜'+title.slice(0,20)+'｜broken URL');}}}
console.log('builds',n,'problems',bad.length);bad.slice(0,15).forEach(x=>console.log(x));assert.equal(bad.length,0);console.log(JSON.stringify({passed:1}));
