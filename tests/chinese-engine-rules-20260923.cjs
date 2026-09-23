'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {environment}=require('./dom-fixture.cjs');
const root=path.resolve(__dirname,'..');
const {ctx:c}=environment();
c.console={log(){},warn(){},error(){}};
c.Image=function(){return c.document.createElement('img');};
function source(name){return fs.readFileSync(path.join(root,'JS',name+'.js'),'utf8');}
for(const name of ['vendor/lunar','bazi-calendar-core','solar-location','bazi','bazi_upgrade','picker-core','tarot-foundation','golden-dawn-tarot','tarot','tarot-reading','tarot_upgrade','meihua_upgrade','meihua_output_layer','meihua_upgrade2','reading-quality','liuyao-core','yijing-data','yijing-core','gua-prompt'])vm.runInContext(source(name),c,{filename:name});
let standalone=source('meihua-standalone');
assert(/\}\)\(\);\s*$/.test(standalone));
standalone=standalone.replace(/\}\)\(\);\s*$/,'window.__chineseTestMeihuaPrompt=buildMeihuaPrompt;})();');
vm.runInContext(standalone,c,{filename:'meihua-standalone'});
const L=c.JYLiuyaoCore;
const byName={};for(let code=0;code<64;code++){const h=L.hexagram(code);byName[h.name]=h;}
function cast(name,calendar,focus,question,timeWindow){return L.calculate({values:byName[name].lines.map(v=>v?7:8),calendar,focus,question,timeWindow});}

// The named examples here are actual original six lines, not synthetic rule calls.
const hidden=cast('姤',{day:'甲子',monthBranch:'寅'},'妻財','求財');
const target=hidden.interpretation.targets[0];
assert.equal(target.status,'hidden-only');
assert.equal(target.selection,null);
assert.equal(target.candidates[0].position,2);
assert.equal(target.candidates[0].flightRelation,'生');
assert(target.candidates[0].flightAssessment.support.includes('飛神生伏神'));
assert.deepEqual(JSON.parse(JSON.stringify(target.calendarAlternatives)),[{source:'月建',branch:'寅'}]);
const restrained=cast('遯',{day:'甲午',monthBranch:'辰'},'子孫','子孫問題').interpretation.targets[0].candidates[0];
assert(restrained.flightAssessment.cautions.some(x=>x.includes('飛神克伏神')));
assert(restrained.flightAssessment.cautions.some(x=>x.includes('伏神遇月日克沖')));
assert(!restrained.flightAssessment.policy.includes('必凶'));

const feb1=L.calendar({year:2026,month:2,day:1,hour:12,timezoneOffset:8});
const monthly=cast('革',feb1,'官鬼','這個月工作進展如何',{start:'2026-02-01',end:'2026-02-08'});
const changeDays=monthly.interpretation.timing.candidates.filter(x=>x.triggers.some(t=>t.reasons.includes('首次進入新節令月'))).map(x=>x.date);
assert.deepEqual(Array.from(changeDays),['2026-02-04']);
assert(monthly.interpretation.timing.candidates.every(x=>x.date==='2026-02-04'||!x.triggers.some(t=>t.reasons.includes('首次進入新節令月'))));
const afterTransition=cast('革',feb1,'官鬼','下個月工作進展如何',{start:'2026-03-01',end:'2026-03-05'});
assert(!afterTransition.interpretation.timing.candidates.some(x=>x.triggers.some(t=>t.reasons.includes('首次進入新節令月'))),
  '視窗第一天已過交節時，不可虛構首次進入新節令月');

const season={Date};vm.createContext(season);vm.runInContext(source('meihua_upgrade2'),season);
// Force the documented approximate branch by excluding the calendar library.
const instant=new Date('2026-02-03T20:00:00Z');
assert.equal(season.mhMonthContextFromDate(instant).monthZhi,'寅');
assert.equal(season.mhMonthContextFromDate(instant).precision,'approximate-jie-day-fallback');
assert.throws(()=>season.mhMonthContextFromDate(new Date(NaN)));
const deep=season.mhTiYongDeep({tiG:{el:'木'},yoG:{el:'火'},ty:{r:'體生用'}},instant);
assert.equal(deep.tiWS.precision,'approximate-jie-day-fallback');
assert.throws(()=>season.mhPreciseWangShuai('木',0));
assert.throws(()=>season.mhPreciseWangShuai('木',13));
const preciseBackup=c.mhPreciseWangShuai;c.mhPreciseWangShuai=null;
assert.equal(c.getMhWangShuai('木',instant).season,'spring');
c.mhPreciseWangShuai=preciseBackup;
season.mhRelation=(a,b)=>a==='木'&&b==='火'?'A生B':'比和';
const external=season.mhExternalSigns({tiG:{el:'木'}},'看到火光');
assert.equal(external[0].relation,'A生B');
assert.equal(external[0].bodyElement,'木');
assert.equal(external[0].matchesBenGua,null);

const quality=c.JY_READING_QUALITY;
const versionCast=c.calcMH(1,1,1,{timestamp:'2026-02-03T20:00:00Z'});
const currentPrompt=c.__chineseTestMeihuaPrompt('工作如何？',versionCast);
assert(currentPrompt.includes(quality.plainText()));
for(const stale of [undefined,{...quality,readingVersion:'5.0.0',lines:()=>['STALE_READING'],methodKinds:()=>['meihua'],recommendationText:()=> 'STALE_READING'}]){
  c.JY_READING_QUALITY=stale;
  const fallback=c.__chineseTestMeihuaPrompt('工作如何？',versionCast);
  assert(!fallback.includes('STALE_READING'));
  assert(fallback.includes(quality.plainText()));
}
for(const oldRecommendation of ['4.0.0','4.1.0','4.2.0']){
  c.JY_READING_QUALITY={...quality,version:oldRecommendation,recommendationText:()=> 'STALE_RECOMMENDATION'};
  const fallback=c.__chineseTestMeihuaPrompt('工作如何？',versionCast);
  assert(!fallback.includes('STALE_RECOMMENDATION'));
  assert(fallback.includes('【本題延伸手鍊建議】'));
  assert.equal(fallback,currentPrompt);
}
c.JY_READING_QUALITY={...quality,readingVersion:'9.0.0',lines:k=>['FUTURE_QUALITY_'+k],methodKinds:()=>['meihua','liuyao','yijing'],recommendationEnding:()=> 'FUTURE_END',recommendationText:()=> 'FUTURE_REC'};
for(const engine of [L,c.JYYijingCore]){
  const fact=engine.calculate({values:[7,7,7,7,7,7],calendar:feb1,question:'工作如何'}),prompt=c.JYGuaPrompt.build(fact);
  assert(prompt.includes('FUTURE_QUALITY_'+fact.system));
  assert(prompt.includes('FUTURE_END'));
}
for(const fact of [hidden,c.JYYijingCore.calculate({values:[7,7,7,7,7,7],question:'工作如何'})]){
  const prompt=c.JYGuaPrompt.build(fact);
  assert(prompt.includes('保存時間：未提供'));
  assert(!prompt.includes('undefined'));
}
const mh=c.calcMH(1,1,1,{timestamp:'2026-02-03T20:00:00Z'});
const p=c.__chineseTestMeihuaPrompt('工作如何？',mh);
assert(p.includes('FUTURE_QUALITY_meihua'));
assert(p.includes('FUTURE_REC'));
assert(p.includes('乾坤無互，互其變卦'));
assert(!p.includes('本站純乾／純坤仍依本卦'));
// Every trigram pair × moving position. Classical body/use is a symbolic
// relation to the matter, never an observation of another person's mind.
const directions=new Set();
let noSupport=0,noChallenge=0,bothDirections=0;
for(let upper=1;upper<=8;upper++)for(let lower=1;lower<=8;lower++)for(let moving=1;moving<=6;moving++){
  const cast=c.calcMH(upper,lower,moving,{timestamp:'2026-09-22T04:00:00Z'});
  const analysis=c.analyzeMeihua(cast,'love');
  directions.add(cast.ty.r);
  assert.equal(analysis.trend.scope,'symbolic-condition');
  const reading=c.buildMeihuaOutput(cast,'love');
  const qi=reading.yingQi;
  assert.equal(qi.sources.length,4);
  assert.equal(qi.supportSources.length,qi.sources.filter(s=>s.element===qi.shengEl).length);
  assert.equal(qi.challengeSources.length,qi.sources.filter(s=>s.element===qi.keEl).length);
  if(!qi.supportSources.length){ noSupport++;assert(qi.jiTxt.includes('暫無生體卦氣候選'));assert(!qi.jiTxt.includes('當令於')); }
  if(!qi.challengeSources.length){ noChallenge++;assert(qi.baiTxt.includes('暫無克體卦氣候選'));assert(!qi.baiTxt.includes('當令於')); }
  if(qi.supportSources.length&&qi.challengeSources.length){ bothDirections++;assert(qi.layerTxt.includes('同見生體與克體')); }
  const body=[reading.summary,reading.shortVerdict,reading.analysis.narrative,reading.analysis.signals.join('；'),reading.strategy.advice.join('；'),reading.tags.map(t=>t.label).join('；')].join('\n');
  for(const unsupported of ['對方有主動意願','雙方有意願','對方有好感','你是被追的那個','曖昧升溫','有桃花但不穩','第三方因素','有人在背後幫你'])assert(!body.includes(unsupported),`${upper}/${lower}/${moving}: ${unsupported}`);
}
assert.equal(directions.size,5);
assert(noSupport>0&&noChallenge>0&&bothDirections>0);
assert.equal(c._mhBianTrend('無','地天泰').type,'待合參');
assert.equal(c._mhBianTrend('無','天地否').type,'待合參');
const cautionCast=c.calcMH(1,2,4,{timestamp:'2026-09-22T04:00:00Z'});
const healthReading=c.buildMeihuaOutput(cautionCast,'health');
assert.equal(healthReading.risk.level,'unknown');
assert.equal(healthReading.risk.precision,'not-clinical');
assert(!healthReading.tags.some(tag=>['當下不利','情緒干擾'].includes(tag.label)));
assert(source('meihua-standalone').includes('本法是現代延伸，非原典一字拆字法'));
c.JY_READING_QUALITY=quality;
console.log('Chinese engines: hidden focus, calendar timing, Meihua season and 384 symbolic reading regressions passed.');
