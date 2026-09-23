'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {environment}=require('./dom-fixture.cjs');
const root=path.resolve(__dirname,'..'),env=environment(),c=env.ctx;
let outbound=0;
c.fetch=async()=>{outbound++;throw Error('Unexpected external request');};
c.console={log(){},warn(){},error(...args){throw Error(args.map(String).join(' '));}};
c.Image=function(){return c.document.createElement('img');};
env.Element.prototype.replaceChildren=function(...nodes){for(const child of this.children)child.parentNode=null;this.children=[];for(const node of nodes)this.appendChild(node);};
const modules=['vendor/lunar','bazi-calendar-core','solar-location','bazi','bazi_upgrade','picker-core','tarot-foundation','golden-dawn-tarot','tarot','tarot-reading','tarot_upgrade','meihua_upgrade','meihua_output_layer','meihua_upgrade2','reading-quality','ai-analysis','ziwei','ziwei-prompt-root','ziwei-standalone','bazi-prompt-root','bazi-standalone','bazi-suite-core','prompt-export'];
for(const name of modules)vm.runInContext(fs.readFileSync(path.join(root,'JS',name+'.js'),'utf8'),c,{filename:name});
vm.runInContext(fs.readFileSync(path.join(root,'JS/astro-bridge.js'),'utf8'),c,{filename:'astro-bridge'});
const form={name:'',bdate:'1983-08-25',btime:'14:55',gender:'male',type:'career',question:'工作為什麼卡住？'},referenceDate='2026-09-22T12:00:00Z';
const chart=c.enhanceBazi(c.computeBazi(1983,8,25,14,55,'male',{referenceDate}));
function clear(){c.S.form={...form};c.S.bazi=null;c.S.ziwei=null;c.S.meihua=null;c.S.tarot={};c.S.natal=null;c.S.jyotish=null;c.S.astroBundle=null;c.S.astroError=null;c.S.nameResult=null;c.S._uResult=null;c.S._dimResults=null;c.S._sevenSummary=null;}
function test(name,fn){try{const result=fn();if(result&&typeof result.then==='function')result.then(()=>console.log('PASS '+name),e=>{process.exitCode=1;console.error('FAIL '+name+'\n'+e.stack);});else console.log('PASS '+name);}catch(e){process.exitCode=1;console.error('FAIL '+name+'\n'+e.stack);}}
clear();
test('No chart yields no fabricated reading and no remote request',()=>{
 assert.equal(c.JY_buildFullExportPrompt(),'');
 const wrap=env.doc.body.appendChild(env.doc.createElement('div'));wrap.id='ai-deep-result';
 assert.equal(c.JY_renderFullExportPrompt(),'');assert.match(wrap.children[0].children[1].textContent,/沒有可核對|排盤/);
 assert.equal(outbound,0);
});
test('Single real Bazi chart produces a fully local answer-first prompt without running score fusion',()=>{
 clear();c.S.bazi=chart;
 const original=c.runAnalysisV2;c.runAnalysisV2=()=>{throw Error('Legacy score fusion was called');};
 const text=c.JY_renderFullExportPrompt();c.runAnalysisV2=original;
 assert.match(text,/工作為什麼卡住？/);assert.match(text,/【八字本次資料】/);
 assert.match(text,/【八字判讀要點】/);assert.match(text,/先回答，再解釋/);
 assert(!text.includes('【紫微斗數本次資料】'));
 assert(!/你有「被提拔、被重用」的命格|你的財運來源多元、社交能力強/.test(text));
 assert.equal(c.S._uResult,null);assert.equal(outbound,0);
});
test('A second completed chart is included without fabricating uncomputed methods',()=>{
 clear();c.S.bazi=chart;c.S.ziwei=c.computeZiwei(1983,8,25,14,'male',{referenceDate});
 const text=c.JY_buildFullExportPrompt();assert.match(text,/【紫微斗數本次資料】/);
 assert.match(text,/【紫微斗數判讀要點】/);assert.match(text,/【八字本次資料】/);
 assert(!text.includes('【印度占星本次資料】'));
 assert.equal(outbound,0);
});
test('Unknown birth hour excludes provisional hour from the exported chart',()=>{
 clear();c.S.bazi=chart;c.S.form={...form,btime:'',btimeUnknown:true,timePrecision:'unknown'};
 const text=c.JY_buildFullExportPrompt();
 assert.match(text,/出生時辰未知|BIRTH_TIME_UNKNOWN/);
 assert(!/四柱：.{0,60}時柱|fourPillars.{0,80}時:/i.test(text));
 assert(!/【西洋占星本次資料】|【印度占星本次資料】/.test(text));
 assert.equal(outbound,0);
});
test('Unknown birth hour does not present a provisional Ziwei chart as finished',()=>{
 clear();c.S.ziwei=c.computeZiwei(1983,8,25,14,'male',{referenceDate});
 c.S.form={...form,btime:'',btimeUnknown:true,timePrecision:'unknown'};
 assert.equal(c.JY_buildFullExportPrompt(),'');assert.equal(outbound,0);
});
test('Failed astrology reports status without a fabricated horoscope',()=>{
 clear();c.S.astroError='星曆載入失敗';
 assert.equal(c.JY_buildFullExportPrompt(),'');
 c.S.bazi=chart;
 const text=c.JY_buildFullExportPrompt();assert.match(text,/【八字本次資料】/);
 assert(!/【西洋占星本次資料】|【印度占星本次資料】/.test(text));
 assert.equal(outbound,0);
});
test('Stale native astrology is rejected when birth inputs change',()=>{
 clear();c.S.astroBundle={signature:'stale chart from other birth data'};
 c.S.natal={nativeAstro:{}};
 assert.equal(c.JY_buildFullExportPrompt(),'');assert.equal(outbound,0);
});
test('Mathers Third Method export reflects only the implemented 66-card arches and two separate surprises',()=>{
 const plan=c.JYTarotFoundation.instantiateMethod('mathers_66','最近如何前進？');
 const cards=Array.from({length:68},(_,i)=>({name:'示例牌 '+(i+1)}));
 const source={tarotData:{spreadType:'mathers_66',spreadZh:'Mathers 第三法',sourceProfile:'gd_book_t',cards,drawProcedure:{description:'依原書前段發牌',significator:{name:'皇后',policy:'本次記錄'},largeCircleImplemented:false},methodPlan:plan},methodPlan:plan};
 const text=c.JY_buildSpreadReadingGuide('tarot',source);
 assert.match(text,/第1–11與34–44張/);assert.match(text,/第23–33與56–66張/);
 assert.match(text,/第12–22與45–55張/);
 assert.match(text,/右意外牌 → 另置代表牌 → 左意外牌/);
 assert.match(text,/本站沒有模擬|未實作後段大圓/);
 const prompt=c.JY_buildExportPrompt('tarot',{...source,question:'最近如何前進？'});
 assert.match(prompt,/67\. .*〔保留牌另抽的意外結語；非主盤序列〕/);
 assert.match(prompt,/68\. .*〔保留牌另抽的意外結語；非主盤序列〕/);
 assert.equal(outbound,0);
});
test('The legacy Opus and tarot entry points stay local even with admin flags',async()=>{
 clear();c.S.bazi=chart;
 c._JY_ADMIN_TOKEN='legacy-admin-marker';
 const res=c._handleOpusClickForMode('full');assert.equal(typeof res.then,'function');await res;
 const popup=env.doc.getElementById('ai-deep-result');assert(popup&&popup.children.length);
 assert.equal(outbound,0);
});
