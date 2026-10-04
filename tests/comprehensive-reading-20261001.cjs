'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
let passed=0;
function test(name,fn){fn();passed++;console.log('PASS '+name);}
function runtime(){
 const el=()=>({style:{},appendChild(){},setAttribute(){},remove(){},querySelector(){return null;}});
 const r={console:{log(){},warn(){},error(){}},document:{getElementById(){return null;},createElement:el,body:el(),head:el(),addEventListener(){}},location:{hostname:'localhost'}};
 r.window=r;r.globalThis=r;
 const exec=s=>new Function('window','globalThis','document','location','console','module','define','setTimeout','clearTimeout',s).call(r,r,r,r.document,r.location,r.console,undefined,undefined,()=>0,()=>{});
 for(const p of ['JS/tarot-foundation.js','JS/reading-quality.js','JS/reading-workflow.js'])exec(read(p));
 return {r,exec};
}
const env=runtime(),r=env.r,ai=read('JS/ai-analysis.js'),bz=read('JS/bazi.js'),zw=read('JS/ziwei.js');
const b=ai.indexOf('const ZW_BRIGHTNESS'),e=ai.indexOf('\n};',b)+3;
const deps=bz.slice(bz.indexOf('const TG='),bz.indexOf('// ── 地支六沖'))+
 ai.slice(ai.indexOf('function getStarBright('),ai.indexOf('// ═══ 宮位吉凶綜合分析函數',ai.indexOf('function getStarBright(')))+
 ai.slice(ai.indexOf('const SIHUA_TABLE'),ai.indexOf('// ── Tag engines'))+ai.slice(b,e);
const engine=env.exec(read('JS/vendor/lunar.js')+'\nvar Solar=window.Solar,Lunar=window.Lunar;\n'+read('JS/solar-location.js')+'\n'+deps+'\n'+zw.slice(0,zw.indexOf('// ── renderZiwei'))+'\n'+read('JS/relationship-core.js')+'\nreturn {computeZiwei:computeZiwei,getStarBright:getStarBright};');
env.exec(read('JS/ziwei-prompt-root.js'));
new Function('window','globalThis','document','console','getStarBright','module',read('JS/ziwei-standalone.js')).call(r,r,r,r.document,r.console,engine.getStarBright,undefined);
const Q=r.JY_READING_QUALITY,W=r.JYReadingWorkflow,referenceDate='2026-09-30T18:34:12.889Z';
const options={civilTime:'14:55',timezoneId:'Asia/Taipei',timezoneOffset:8,referenceDate};
const chart=engine.computeZiwei(1983,8,25,14,'male',options);assert(chart,r._jyZiweiError);
const before=JSON.stringify(chart);
test('15 native methods and full/focused/period scope',()=>{
 assert.equal(Q.readingVersion,'9.3.0');assert.equal(Q.methodKinds().length,15);
 for(const k of Q.methodKinds()){assert(Q.methodLines(k).some(x=>x.startsWith('【')&&x.includes('深入')),k+' native depth');assert(W.render({method:k,question:'完整分析命盤所有面向'}).includes('完整報告範圍'));}
 assert.equal(Q.reportScope('全面分析我的財運').fullChart,false);assert.equal(Q.reportScope('完整星盤').fullChart,true);
 assert.equal(Q.reportScope('前八個大限所有流年').requestedDecades,8);assert.equal(Q.reportScope('全部12個大限所有流年').allDecades,true);
 assert.deepEqual(Q.timeScope('我現在不太想跟人相處 這樣會影響我未來財運嗎？',2026),{mode:'range',start:2026,end:2029});
 assert.deepEqual(Q.timeScope('未來二十年',2026),{mode:'range',start:2026,end:2045});
});
test('Birth minute precision and native lunar chart stay intact',()=>{
 assert.equal(chart.birthInput.civilTime,'14:55');assert.equal(chart.currentAge,44);
 assert.equal(chart.lunar.month,7);assert.equal(chart.lunar.day,17);assert.equal(chart.calculationPolicy.trueSolarTime,false);
 assert.equal(chart.palaces.find(p=>p.isMing).branch,'丑');assert.equal(chart.palaces.find(p=>p.isShen).name,'福德');assert.equal(chart.daXian.length,12);
});
test('First eight decades cover every year from 1986 through 2065',()=>{
 const t=r.JYZiweiData.timeline(chart,{question:'完整分析十二宮，前八個大限的所有流年'});
 assert.equal(t.decades.length,8);assert.equal(t.annual.length,80);assert.equal(t.firstYear,1986);assert.equal(t.lastYear,2065);assert.deepEqual(t.missingYears,[]);
 t.annual.forEach((a,i)=>{assert.equal(a.year,1986+i);assert.equal(a.age,a.year-1983+1);assert.equal(a.decadeIndex,Math.floor(i/10)+1);assert.equal(a.hua.length,4);assert.equal(a.flowStars.length,11);assert.deepEqual(a.flowStars.map(s=>s.star),['祿存','擎羊','陀羅','天魁','天鉞','天馬','文昌','文曲','紅鸞','天喜','年解']);assert(a.flowStars.every(s=>s.policy==='IZTRO_261'&&s.layer==='流年'));assert.equal(a.palaces.length,12);for(const k of ['score','notes','focus','level'])assert(!Object.hasOwn(a,k));});
 const y=t.annual.find(a=>a.year===2026);assert.equal(y.mingPalace,'交友');assert.equal(y.hua.find(h=>h.hua==='化忌').star,'廉貞');assert.equal(y.palaces.find(p=>p.name==='財帛').natalPalace,'父母');
});
test('120-year and 55-year reports are complete; focused questions remain short',()=>{
 const all=r.JYZiweiData.timeline(chart,{question:'全部十二個大限的所有流年'});assert.equal(all.annual.length,120);assert.equal(all.lastYear,2105);
 const long=r.JYZiweiData.timeline(chart,{question:'逐年分析2026至2080年'});assert.equal(long.annual.length,55);assert.equal(long.annual.at(-1).year,2080);
 const single=r.JYZiweiData.timeline(chart,{question:'我現在不太想跟人相處 這樣會影響我未來財運嗎？'});assert.equal(single.decades.length,1);assert.equal(single.annual.length,4);
});
test('Missing years, prebirth years and monthly failures remain explicit',()=>{
 const t=r.JYZiweiData.timeline(Object.assign({},chart,{getLiuNianZw:y=>y===2028?null:chart.getLiuNianZw(y)}),{question:'逐年分析2026至2029年'});assert.equal(t.annual.length,3);assert.deepEqual(t.missingYears,[2028]);
 const pre=r.JYZiweiData.timeline(chart,{question:'逐年分析1980至1984年'});assert.deepEqual(pre.preBirthYears,[1980,1981,1982]);assert.equal(pre.annual.length,2);
 const bad=r.JYZiweiData.timeline(chart,{question:'逐年分析1800至1805年'});assert.equal(bad.annual.length,0);assert(bad.warnings.join('').includes('1900–2300'));
 const month=r.JYZiweiData.timeline(chart,{question:'2026年逐月分析'});assert.equal(month.months.length,12);
 const failed=r.JYZiweiData.timeline(Object.assign({},chart,{getLiuYueZw(){throw Error('unavailable');}}),{question:'2026年逐月分析'});assert.equal(failed.annual.length,1);assert.deepEqual(failed.missingYears,[]);assert.deepEqual(failed.missingMonthYears,[2026]);
});
test('Empty-palace borrowing uses branches and never mutates the chart',()=>{
 const text=r.JYZiweiData.serialize(Object.assign({},chart,{palaces:chart.palaces.slice().reverse()}),{bdate:'1983-08-25',btime:'14:55',gender:'male',question:'未來財運如何？'});
 const wealth=text.split('\n').find(x=>x.startsWith('・財帛宮(酉)')&&x.includes('空宮'));assert(wealth&&wealth.includes('福德宮(卯)')&&wealth.includes('紫微')&&wealth.includes('貪狼'),wealth);assert.equal(JSON.stringify(chart),before);
});
test('Full prompt retains every year, memory boundary, native depth and one final footer',()=>{
 const question='完整分析命盤十二宮，前八個大限的所有流年',prompt=r._ziweiBuildPrompt(chart,{bdate:'1983-08-25',btime:'14:55',gender:'male',question});
 for(let y=1986;y<=2065;y++)assert(new RegExp('^・'+y+'(?:（(?:現行|下一)農曆年度）)?／','m').test(prompt),'year '+y);
 for(const s of ['"annualCount":80','【紫微深入全盤與限流合參】','【全盤作答覆蓋】','象徵影響程度','不得引用、調用或暗中依賴帳號記憶','僅供研究或娛樂用途'])assert(prompt.includes(s),s);
 assert.equal(prompt.split(W.footer).length-1,1);assert(prompt.endsWith(W.footer));assert.equal(W.finish(prompt,{method:'ziwei',question}),prompt);
 const saved=r.JY_READING_QUALITY;r.JY_READING_QUALITY=Object.assign({},saved,{readingVersion:'8.3.0',lines:()=>['STALE_READING']});assert(!r._ziweiBuildPrompt(chart,{question}).includes('STALE_READING'));r.JY_READING_QUALITY=saved;
});
test('Coverage review requires a separate row for each supplied year',()=>{
 const answer='較支持有條件的穩定。\n2026年：先確認現金流。\n2028年：保留協作。\n'+W.footer;
 const options={method:'ziwei',question:'逐年分析2026至2028年',answer,evidence:{requiredYears:[2026,2027,2028]}};
 assert(W.review(options).issues.some(x=>x.code==='YEAR_COVERAGE'&&x.message.includes('2027')));
 assert(!W.review({...options,answer:answer.replace('\n2028','\n2027年：核對條件。\n2028')}).issues.some(x=>x.code==='YEAR_COVERAGE'));
});
test('Bazi requests retain complete eight-cycle annual segments in pure-chart mode',()=>{
 const env=runtime(),b=env.r;const engine=env.exec(read('JS/vendor/lunar.js')+'\nvar Solar=window.Solar,Lunar=window.Lunar;\n'+read('JS/bazi-calendar-core.js')+'\n'+read('JS/bazi.js')+'\nreturn {computeBazi:computeBazi};');env.exec(read('JS/bazi-prompt-root.js'));env.exec(read('JS/bazi-suite-core.js'));
 const chart=engine.computeBazi(1983,8,25,14,55,'male',{timezoneId:'Asia/Taipei',timezoneOffset:8,referenceDate,trueSolarTimeApplied:false});
 const ds=chart.dayun.filter(d=>d.gz&&d.gz!=='小運'),annual=ds.slice(0,8).flatMap(d=>d.liuNian);
 const text=b.BaziSuiteCore.buildChartDataBlock(chart,{}, {question:'前八個大運的所有流年',compact:false});assert(text.includes('大運 8 段'));assert.equal((text.match(/^・\d{4} /gm)||[]).length,annual.length);for(const y of new Set(annual.map(a=>a.year)))assert(new RegExp('^・'+y+' ','m').test(text));assert(!text.includes('・'+ds[8].gz+'：'));
 const prompt=b.BaziSuiteCore.buildSinglePrompt('chart',chart,{},'完整分析命盤，前八個大運的所有流年');assert(prompt.includes('【逐年／逐期作答覆蓋】'));assert(prompt.includes('年度分段 '+annual.length+' 列'));assert(prompt.endsWith(W.footer));
});
test('Joint Ziwei timelines retain the full interval and mark the not-yet-born party',()=>{
 const b=engine.computeZiwei(1994,6,20,0,'female',{civilTime:'00:00',timezoneId:'Asia/Taipei',timezoneOffset:8,referenceDate});assert(b);
 const pair=r.JYRelationshipCore.createZiweiPair(chart,b,{question:'前八個大限的所有流年'});
 const first=Math.min(1983+chart.daXian[0].ageStart-1,1994+b.daXian[0].ageStart-1),last=Math.max(1983+chart.daXian[7].ageEnd-1,1994+b.daXian[7].ageEnd-1);
 assert.equal(pair.timeline.length,last-first+1);assert(pair.timeline.length>80);assert(pair.timeline.some(y=>y.year<1994&&y.b.available===false));assert(pair.timeline.every(y=>!y.b||y.b.available===false||y.b.nominalAge>=1));
});
console.log('Comprehensive reading: '+passed+' groups passed; 15 methods, native 80/120-year Ziwei exports, Bazi segments and joint timelines.');
