#!/usr/bin/env node
'use strict';
const assert=require('assert');
const fs=require('fs');
const path=require('path');
const vm=require('vm');
const ROOT=path.resolve(__dirname,'..');
let passed=0;
function test(name,fn){try{fn();passed++;console.log('✓ '+name);}catch(e){console.error('✗ '+name+'\n'+(e.stack||e));process.exitCode=1;}}
function fakeElement(){return {style:{},dataset:{},className:'',classList:{add(){},remove(){},toggle(){},contains(){return false;}},appendChild(){},remove(){},setAttribute(){},getAttribute(){return null;},addEventListener(){},querySelector(){return null;},querySelectorAll(){return[];},closest(){return null;},innerHTML:'',textContent:'',value:'',checked:false,disabled:false,parentNode:null};}
function ctx(){const body=fakeElement(),doc={body,head:fakeElement(),createElement(){let x=fakeElement();x.parentNode=body;return x;},getElementById(){return null;},addEventListener(){},querySelector(){return null;},querySelectorAll(){return[];}};const c={console:{log(){},warn(){},error:console.error},Date,Math,Intl,TextEncoder,TextDecoder,setTimeout,clearTimeout,setInterval,clearInterval,document:doc,navigator:{clipboard:{writeText:async()=>{}}},location:{hostname:'localhost',href:'http://localhost/'},localStorage:{getItem(){return null;},setItem(){},removeItem(){}},alert(){},confirm(){return true;},open(){return null;},requestIdleCallback(fn){fn();},performance:{now:()=>0},Blob,URL};c.window=c;c.global=c;vm.createContext(c);return c;}
function load(){const c=ctx();for(const f of ['JS/vendor/lunar.js','JS/bazi-calendar-core.js','JS/solar-location.js','JS/bazi.js','JS/bazi_upgrade.js','JS/bazi-suite-core.js'])vm.runInContext(fs.readFileSync(path.join(ROOT,f),'utf8'),c,{filename:f});return c;}
function chart(c,input){const s=c.calcTrueSolarTime(input.y,input.m,input.d,input.h,input.mi,input.lng,input.tz,input.tzid);const b=c.computeBazi(s.year,s.month,s.day,s.hour,s.minute,input.gender,{second:s.second,trueSolarTimeApplied:true,timezoneId:input.tzid,timezoneOffset:input.tz,longitude:input.lng,referenceDate:'2026-06-26T00:00:00Z'});c.enhanceBazi(b);return {chart:b,meta:{name:input.name,genderLabel:input.gender==='male'?'男命':'女命',birthLine:`國曆 ${input.y}/${input.m}/${input.d} ${input.h}:${String(input.mi).padStart(2,'0')}・${input.city}`,solarInfo:s,longitude:input.lng,timezoneId:input.tzid}};}
const c=load();
const A=chart(c,{name:'A',y:1983,m:8,d:25,h:14,mi:55,lng:120.23,tz:8,tzid:'Asia/Taipei',city:'台南',gender:'male'});
const B=chart(c,{name:'B',y:1994,m:6,d:20,h:0,mi:0,lng:120.54,tz:8,tzid:'Asia/Taipei',city:'彰化',gender:'female'});

test('公開情境功能完整列出八種且角色不同',()=>{
  const xs=c.BaziSuiteCore.scenarios;
  assert.strictEqual(xs.length,8);
  assert.strictEqual(JSON.stringify(Array.from(xs,x=>x.id)),JSON.stringify(['marriage','business','mother_in_law','best_friends','father_son','mother_son','friendship','boss_employee']));
  assert(xs.every(x=>x.roleA&&x.roleB&&x.focus&&x.cautions));
});

test('單盤提供六種分析入口',()=>{
  assert.strictEqual(JSON.stringify(Array.from(Object.keys(c.BaziSuiteCore.lenses))),JSON.stringify(['chart','general','career','wealth','love','annual']));
});

test('雙向十神映射不可互換',()=>{
  const aViews=c.BaziSuiteCore.directionalTenGods(A.chart,B.chart);
  const bViews=c.BaziSuiteCore.directionalTenGods(B.chart,A.chart);
  assert.strictEqual(aViews.length,4);assert.strictEqual(bViews.length,4);
  assert.notDeepStrictEqual(aViews.map(x=>x.tenGod),bViews.map(x=>x.tenGod));
});

test('合盤同時輸出日主、日柱、跨盤、五行互補與歲運同步',()=>{
  const comp=c.BaziSuiteCore.createCompatibility(A.chart,B.chart,{scenarioId:'marriage',metaA:A.meta,metaB:B.meta});
  assert(comp.dayMasters.aToB.label);
  assert(comp.spousePalace.aDayPillar&&comp.spousePalace.bDayPillar);
  assert(Array.isArray(comp.stemRelations)&&Array.isArray(comp.branchRelations)&&Array.isArray(comp.groupRelations));
  assert(comp.directionalTenGods.aViewsB.length===4&&comp.directionalTenGods.bViewsA.length===4);
  assert(comp.elementComplement.caveat.includes('不能單獨定合不合'));
  assert(comp.luckSynchronization.aCurrent&&comp.luckSynchronization.bCurrent);
  assert.strictEqual(comp.policy.noSingleScore,true);
  assert.strictEqual(comp.policy.noAutomaticTransformation,true);
});

test('合盤提示詞依角色情境切換並含兩張完整資料',()=>{
  const comp=c.BaziSuiteCore.createCompatibility(A.chart,B.chart,{scenarioId:'business',metaA:A.meta,metaB:B.meta});
  const p=c.BaziSuiteCore.buildCompatibilityPrompt(comp,'適合共同創業嗎？');
  assert(p.includes('事業合夥'));
  assert(p.includes('發起人／夥伴A'));
  assert(p.includes('夥伴B'));
  assert(p.includes(A.chart.pillars.day.gan+A.chart.pillars.day.zhi));
  assert(p.includes(B.chart.pillars.day.gan+B.chart.pillars.day.zhi));
  assert(p.includes('不提供單一配對分數'));
  assert(p.includes('命盤不能代替盡職調查'));
  assert(p.includes('A看B'));
  assert(p.includes('B看A'));
});

test('六合五合與三合三會只列候選不宣告成化',()=>{
  const comp=c.BaziSuiteCore.createCompatibility(A.chart,B.chart,{scenarioId:'marriage',metaA:A.meta,metaB:B.meta});
  const all=comp.stemRelations.concat(comp.branchRelations,comp.groupRelations);
  const transformations=all.filter(x=>/COMBINATION|TRINE|DIRECTIONAL/.test(x.typeCode||''));
  assert(transformations.every(x=>x.transformationStatus==='待審'||x.transformationStatus===undefined));
  assert(all.every(x=>!/（已合化|判定已合化|確定合化|成功合化）/.test(String(x.description||''))));
});

test('六種單盤提示詞各自載入正確分析範圍',()=>{
  const expected={chart:'不延伸具體人生事件',general:'綜合判讀',career:'職涯結構',wealth:'現金流風險',love:'親密需求',annual:'未來四個立春年度'};
  Object.keys(expected).forEach(id=>{const p=c.BaziSuiteCore.buildSinglePrompt(id,A.chart,A.meta,'測試');assert(p.includes(expected[id]),id);assert(p.includes('排盤事實層'));assert(p.includes('流派模型層'));});
});

test('五軸人格固定產生32個唯一類型且相同命盤可重現',()=>{
  const catalog=c.BaziSuiteCore.personalityCatalog;
  assert.strictEqual(catalog.length,32);
  assert.strictEqual(new Set(catalog.map(x=>x.name)).size,32);
  const x=c.BaziSuiteCore.buildPersonality(A.chart,A.meta),y=c.BaziSuiteCore.buildPersonality(A.chart,A.meta);
  assert.strictEqual(x.code,y.code);assert.strictEqual(x.name,y.name);assert.strictEqual(x.axes.length,5);
  assert(x.disclaimer.includes('不是 OpenFate BZTI'));
  assert(x.disclaimer.includes('未公開演算法'));
});

test('人格提示詞禁止心理診斷與貼死標籤',()=>{
  const x=c.BaziSuiteCore.buildPersonality(A.chart,A.meta),p=c.BaziSuiteCore.buildPersonalityPrompt(x,'工作壓力下如何反應？');
  assert(p.includes('不得把人格卡寫成疾病'));
  assert(p.includes('支持或推翻'));
});

test('城市時區表公開給完整套件，海外可用IANA/DST',()=>{
  assert(c.BIRTH_CITY_TIMEZONE_IDS);
  assert.strictEqual(c.BIRTH_CITY_TIMEZONE_IDS['紐約'],'America/New_York');
  assert.strictEqual(c.BIRTH_CITY_TIMEZONE_IDS['雪梨'],'Australia/Sydney');
});

test('首頁保留原版UI為預設並另接完整套件',()=>{
  const html=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
  const ui=fs.readFileSync(path.join(ROOT,'JS/bazi-suite.js'),'utf8');
  assert(html.includes('JS/bazi-suite-core.js?v=20260626v1_0_0'));
  assert(html.includes('JS/bazi-suite.js?v=20260626v1_1_0'));
  assert(ui.includes('window._baziLegacyStandaloneOpen=legacyOpen'));
  assert(ui.includes('window._baziFullSuiteOpen=open'));
  assert(ui.includes('window._baziStandaloneOpen=legacyOpen || open'));
  assert(!ui.includes('window._baziStandaloneOpen=open;'));
  const legacy=fs.readFileSync(path.join(ROOT,'JS/bazi-standalone.js'),'utf8');
  assert(legacy.includes('合盤・人格・曆法工具'));
  assert(legacy.includes('window._baziOpenFullSuite'));
  assert(legacy.includes('window._baziFullSuiteOpen'));

  assert(ui.includes('localStorage'));
  assert(ui.includes('列印／存 PDF'));
});

test('核心與UI JavaScript語法可由Node解析',()=>{
  for(const f of ['JS/bazi-suite-core.js','JS/bazi-suite.js','JS/solar-location.js']){
    const {spawnSync}=require('child_process');const r=spawnSync(process.execPath,['--check',path.join(ROOT,f)],{encoding:'utf8'});assert.strictEqual(r.status,0,r.stderr);
  }
});

test('四柱反查可找回已知公曆候選並明示必須真太陽時複核',()=>{
  const r=c.BaziSuiteCore.reverseBaziToSolarTimes({bazi:'癸亥 庚申 乙酉 癸未',startYear:1983,endYear:1983,dayBoundaryMode:'MIDNIGHT_00',limit:20});
  assert.strictEqual(r.query,'癸亥 庚申 乙酉 癸未');
  assert(r.matches.some(x=>x.datetime==='1983-08-25 13:00:00'));
  assert(r.note.includes('真太陽時重新排盤'));
  assert(r.matches.every(x=>x.clockTimeOnly===true));
});

test('四柱反查拒絕格式錯誤與過大年份範圍',()=>{
  assert.throws(()=>c.BaziSuiteCore.reverseBaziToSolarTimes({bazi:'錯誤',startYear:1983,endYear:1983}),/四柱請輸入8個干支字/);
  assert.throws(()=>c.BaziSuiteCore.reverseBaziToSolarTimes({bazi:'癸亥庚申乙酉癸未',startYear:1700,endYear:2101}),/最多301個公曆年份/);
});

test('公開排盤政策含真太陽時、子初換日、立春與半開大運區間',()=>{
  const p=c.BaziSuiteCore.policy;
  assert.strictEqual(p.trueSolarTimePreferred,true);
  assert.strictEqual(p.defaultDayBoundaryMode,'ZI_HOUR_23');
  assert.strictEqual(p.annualBoundary,'LI_CHUN');
  assert.strictEqual(p.luckInterval,'[start,end)');
  assert.strictEqual(p.reverseLookupClockTimeOnly,true);
});

test('完整UI含曆法工具、真太陽時與四柱反查入口',()=>{
  const ui=fs.readFileSync(path.join(ROOT,'JS/bazi-suite.js'),'utf8');
  assert(ui.includes("['tools','工具']"));
  assert(ui.includes('data-act="calc-solar"'));
  assert(ui.includes('data-act="reverse-bazi"'));
  assert(ui.includes('四柱反查公曆候選'));
  assert(ui.includes("r.inputCivilDateTime=date+' '"));
});


test('排盤顯示可重算的生肖與八字重量，並將稱骨降為末位輔助',()=>{
  assert(A.chart.chenggu&&A.chart.chenggu.display==='三兩二錢');
  const sum=c.BaziSuiteCore.chartSummary(A.chart,A.meta);
  assert.strictEqual(sum.chineseZodiac,'豬');
  assert.strictEqual(sum.chenggu.display,'三兩二錢');
  const p=c.BaziSuiteCore.buildSinglePrompt('chart',A.chart,A.meta,'只校核排盤');
  assert(p.includes('八字重量 三兩二錢'));
  assert(p.includes('稱骨、命宮、胎元、納音與神煞只列末位輔助'));
});


test('未知時辰合盤會排除時柱跨盤訊號並把精確歲運降級',()=>{
  const metaA=Object.assign({},A.meta,{unknown:true});
  const comp=c.BaziSuiteCore.createCompatibility(A.chart,B.chart,{scenarioId:'marriage',metaA:metaA,metaB:B.meta});
  assert.strictEqual(comp.uncertainty.unknownTimeA,true);
  assert.strictEqual(comp.uncertainty.hourRelationsExcluded,true);
  assert(comp.stemRelations.every(x=>x.aPillar!=='hour'));
  assert(comp.branchRelations.every(x=>x.aPillar!=='hour'));
  assert(comp.groupRelations.every(x=>!x.participants.some(p=>p.side==='A'&&p.pillar==='hour')));
  assert.strictEqual(comp.directionalTenGods.bViewsA.length,3);
  const p=c.BaziSuiteCore.buildCompatibilityPrompt(comp,'測試未知時辰');
  assert(p.includes('未知時辰一方的時柱跨盤關係已排除'));
});


test('單盤、合盤與人格都能生成圖片分享卡，並保留十個AI入口',()=>{
  const ui=fs.readFileSync(path.join(ROOT,'JS/bazi-suite.js'),'utf8');
  const share=fs.readFileSync(path.join(ROOT,'JS/share-card.js'),'utf8');
  assert(ui.includes("JYShareCard.open('bazi'"));
  assert(ui.includes("JYShareCard.open('baziCompatibility'"));
  assert(ui.includes("JYShareCard.open('baziPersonality'"));
  assert(share.includes('function renderBaziPersonality'));
  assert(share.includes('function renderBaziCompatibility'));
  ['ChatGPT','Gemini','Claude','Grok','DeepSeek','Kimi','豆包','Meta AI','Copilot','Perplexity'].forEach(x=>assert(ui.includes("['"+x+"'"),x));
});


test('完整套件的日期時間地點全部使用站內自訂UI，不再觸發手機原生日曆',()=>{
  const ui=fs.readFileSync(path.join(ROOT,'JS/bazi-suite.js'),'utf8');
  assert(!ui.includes('type="date"'));
  assert(!ui.includes('type="time"'));
  assert(ui.includes('data-picker="date"'));
  assert(ui.includes('data-picker="time"'));
  assert(ui.includes('data-picker="location"'));
  assert(ui.includes('bzs-picker-sheet'));
  assert(ui.includes('bzs-loc-chip'));
  assert(ui.includes("dateField('u','民用日期')"));
  assert(ui.includes("locationFields('u','地點（真太陽時校正）')"));
});

test('單人合盤人格與工具共用同一套自訂出生資料元件',()=>{
  const ui=fs.readFileSync(path.join(ROOT,'JS/bazi-suite.js'),'utf8');
  assert(ui.includes("personForm('s'"));
  assert(ui.includes("personForm('a'"));
  assert(ui.includes("personForm('b'"));
  assert(ui.includes("personForm('p'"));
  assert(ui.includes("function dateField(prefix,label)"));
  assert(ui.includes("function timeField(prefix,label,allowUnknown,defaultTime)"));
  assert(ui.includes("function locationFields(prefix,label)"));
  assert(ui.includes("version:'1.1.0'"));
});

if(process.exitCode){console.error(`\n${passed} tests passed before failure(s).`);process.exit(process.exitCode);}console.log(`\nAll ${passed} Bazi suite regression tests passed.`);
