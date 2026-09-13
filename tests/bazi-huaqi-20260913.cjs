'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const {ctx}=require('./dom-fixture.cjs').environment();
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
ctx.console={log(){},warn(){},error(){}};
for(const f of ['JS/reading-quality.js','JS/vendor/lunar.js','JS/bazi-calendar-core.js','JS/solar-location.js','JS/bazi.js','JS/bazi_upgrade.js','JS/bazi-prompt-root.js','JS/bazi-suite-core.js'])vm.runInContext(read(f),ctx,{filename:f});
const standalone=read('JS/bazi-standalone.js');assert(/\}\)\(\);\s*$/.test(standalone));
vm.runInContext(standalone.replace(/\}\)\(\);\s*$/,'window.__huaTest={prompt:buildBaziPrompt,render:function(b,meta){_bazi=b;_meta=meta||{};return _renderResult();}};})();'),ctx);
function pillars(text){return Object.fromEntries(text.split(' ').map((p,i)=>[['year','month','day','hour'][i],{gan:p[0],zhi:p[1]}]));}
function plain(x){return JSON.parse(JSON.stringify(x));}
let passed=0;function test(name,fn){try{fn();passed++;console.log('PASS '+name);}catch(e){process.exitCode=1;console.error('FAIL '+name+'\n'+e.stack);}}
const solar=ctx.calcTrueSolarTime(1983,8,25,14,55,120.23,8,'Asia/Taipei');
const chart=ctx.computeBazi(solar.year,solar.month,solar.day,solar.hour,solar.minute,'male',{second:solar.second,birthInstant:solar.utcTimestamp,timezoneOffset:8,timezoneId:'Asia/Taipei',trueSolarTimeApplied:true,longitude:120.23,referenceDate:'2026-09-13T04:00:00Z'});ctx.enhanceBazi(chart);
test('Reported birth chart retains two wood roots and two exposed yin-water supports',()=>{
 assert.deepEqual(plain(chart.pillars),pillars('癸亥 庚申 乙酉 癸未'));
 const a=chart.huaQiAssessments[0];assert.equal(a.statusCode,'ORDINARY_PREFERRED');assert.equal(a.status,'本盤不採真化金格');
 assert.deepEqual(plain(a.dayMasterRoots.map(r=>r.branch+r.stem)),['亥甲','未乙']);
 assert.deepEqual(plain(a.printedSupport.map(r=>r.position+r.stem+r.god)),['年干癸偏印','時干癸偏印']);
 assert.deepEqual(plain(a.supportRoots.map(r=>r.branch+r.stem)),['亥壬','申壬']);
 assert.equal(chart.zhengGe.geName,'正官格');assert.equal(chart.zhengGe.touChu,'庚');
 assert.equal(chart.specialStructure,null);assert.equal(chart.specialStructureCandidates.length,0);
});
test('A root alone does not reject Ren Tieqiao true-transformation examples',()=>{
 // Independently transcribed from 滴天髓闡微「化象」. UNRESOLVED is deliberate:
 // this bounded rule must not overrule the author's full analysis by root presence.
 for(const text of ['乙丑 甲申 甲辰 己巳','戊辰 壬戌 甲辰 己巳','己卯 丁卯 壬午 甲辰']){
  const a=ctx.assessBaziHuaQi(pillars(text))[0];assert(a,text);assert.equal(a.statusCode,'UNRESOLVED',text);
 }
});
test('Potentially constrained support and full branch groups remain explicit open questions',()=>{
 const constrained=ctx.assessBaziHuaQi(pillars('戊辰 壬戌 甲辰 己巳'))[0];
 assert(constrained.printedSupport.some(x=>x.adjacentConstraint));assert(constrained.requiredChecks.some(x=>x.includes('緊貼合制')));
 // Synthetic relation fixture, not a historical birth chart or automatic wood conversion.
 const grouped=ctx.assessBaziHuaQi(pillars('癸亥 庚卯 乙未 癸亥'))[0];
 assert.equal(grouped.statusCode,'UNRESOLVED');assert(grouped.checks.completeBranchGroups.includes('亥卯未'));
 assert(grouped.requiredChecks.some(x=>x.includes('不等於根已消失')));
});
test('Same-element day master, missing pillars and non-combinations cannot become false rejections',()=>{
 const same=ctx.assessBaziHuaQi(pillars('戊申 乙丑 庚午 辛巳'))[0];
 assert.equal(same.targetElement,'金');assert.equal(same.statusCode,'UNRESOLVED');
 assert(same.requiredChecks.some(x=>x.includes('化神與日主同五行')));
 assert.equal(ctx.assessBaziHuaQi(pillars('癸亥 辛酉 乙酉 癸未')).length,0);
 assert.equal(ctx.assessBaziHuaQi({day:{gan:'乙',zhi:'酉'}}).length,0);
 assert.equal(ctx.assessBaziHuaQi({...pillars('癸亥 庚申 乙酉 癸未'),day:{gan:'toString',zhi:'酉'}}).length,0);
});
test('Displayed month structure and expanded reasons use the same actual assessment',()=>{
 const html=ctx.__huaTest.render(chart,{});assert(html.includes('月令取格：<b>正官格</b>'));
 for(const text of ['月支申藏庚透干','本盤不採真化金格','年支亥藏甲','時支未藏乙','年干癸為偏印','時干癸為偏印'])assert(html.includes(text),text);
 assert(!html.includes('取格候選：'));assert(!html.includes('化氣格候選'));
 const un=ctx.__huaTest.render(chart,{unknown:true});assert(!un.includes('本盤不採真化金格'));assert(!un.includes('時支未藏乙'));
});
test('Single, complete-suite and unknown-time exports preserve their actual scope',()=>{
 const one=ctx.__huaTest.prompt('為何本盤不按化金格？',chart,{});
 const suite=ctx.BaziSuiteCore.buildSinglePrompt('general',chart,{},'為何本盤不按化金格？');
 for(const prompt of [one,suite])for(const text of ['本盤不採真化金格','年支亥藏甲','時支未藏乙','JY_ROOTED_SUPPORT_ORDINARY_FIRST_V1'])assert(prompt.includes(text),text);
 for(const prompt of [ctx.__huaTest.prompt('取格',chart,{unknown:true}),ctx.BaziSuiteCore.buildSinglePrompt('general',chart,{unknown:true},'取格')])assert(!prompt.includes('本盤不採真化金格'));
 if(process.env.JY_HUAQI_OUTPUT){fs.mkdirSync(process.env.JY_HUAQI_OUTPUT,{recursive:true});fs.writeFileSync(path.join(process.env.JY_HUAQI_OUTPUT,'bazi-prompt.txt'),one);fs.writeFileSync(path.join(process.env.JY_HUAQI_OUTPUT,'assessment.json'),JSON.stringify({pillars:chart.pillars,monthStructure:chart.zhengGe,huaQiAssessments:chart.huaQiAssessments},null,2));}
});
test('Actual composite API adapter forwards both the month structure and the full assessment',()=>{
 const src=read('JS/ai-analysis.js'),a=src.indexOf('// ═══ 4. 八字更多細節'),b=src.indexOf('// ═══ 5.',a);assert(a>0&&b>a);
 ctx.S.bazi=chart;ctx.p={dims:{}};vm.runInContext(src.slice(a,b),ctx,{filename:'actual-bazi-composite-adapter'});
 assert.equal(ctx.p.dims.bazi.geJu,'正官格');assert.equal(ctx.p.dims.bazi.monthStructure.exposedStem,'庚');
 assert.deepEqual(plain(ctx.p.dims.bazi.huaQiAssessments),plain(chart.huaQiAssessments));
 assert.equal(ctx.p.dims.bazi.specialStructureCandidates.length,0);
});
console.log('Huaqi regression groups passed: '+passed);
