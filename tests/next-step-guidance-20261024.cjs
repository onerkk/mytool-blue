'use strict';
/* 結果頁一打開就知道下一步：分頁式結果頁（吠陀、西洋）在分頁上方有「下一步」條——複製提示詞主鍵、切到解讀分頁、AI 連結與看得見的狀態；
 * 複製回饋同時寫到條上（解讀分頁可能隱藏）；大六壬的複製在常駐底列；單頁式方法的複製鍵不藏在折疊區。 */
const assert=require('assert/strict'),fs=require('fs'),path=require('path');const ROOT=path.resolve(__dirname,'..');const R=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
for(const [f,p,tabs] of [['JS/vedic-standalone.js','vd','<nav class="vd-tabs"'],['JS/western-standalone.js','wx','<nav class="wx-tabs"']]){
  const s=R(f),bar=s.indexOf('<div class="'+p+'-next"'),nav=s.indexOf(tabs);
  assert(bar>0&&bar<nav,p+': next-step bar sits above the tabs');const seg=s.slice(bar,nav);
  assert(/\(\\?'copy\\?'/.test(seg),p+': bar has the copy action');assert(seg.includes('data-'+p+'-tab="reading"'),p+': bar can open the reading tab');
  assert(seg.includes('id="'+p+'-next-status"'),p+': bar has its own visible status');assert(seg.includes('chatgpt.com')&&seg.includes('claude.ai')&&seg.includes('gemini.google.com'),p+': bar links to AI');
  assert(s.includes("$('"+p+"-next-status')"),p+': copy feedback is written to the bar');
}
assert(R('JS/liuren-room.js').includes('data-lr-action="copy"'),'liuren keeps copy in the persistent footer');
for(const f of ['JS/bazi-standalone.js','JS/ziwei-standalone.js','JS/meihua-standalone.js','JS/lenormand.js','JS/oracle.js','JS/gua-room.js','JS/bazi-suite.js']){
  const s=R(f),m=s.search(/ai-copy-btn" onclick|class="zw-ai-copy"|複製解讀提示詞 <span|複製完整提示詞<\/button>/);assert(m>0,f+' copy found');const before=s.slice(Math.max(0,m-2500),m);
  assert(!(before.lastIndexOf('<details')>before.lastIndexOf('</details>')),f+': copy is not inside a collapsed section');
}
console.log(JSON.stringify({passed:3}));
