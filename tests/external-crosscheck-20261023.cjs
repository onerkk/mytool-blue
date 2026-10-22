'use strict';
/* 20261023 外部對照回歸：
 * 1) 節氣：lunar.js 主引擎 vs 香港天文台 2026 中氣 PDF、日本國立天文台 2026 曆要項（官方）。
 * 2) 四柱：computeBazi vs 獨立算法（儒略日日柱 + 天文太陽黃經定月／年），兩種子時換日政策。
 * 3) 命宮中氣：改走曆法引擎後與備援分鐘表結論一致。
 * 4) 中和帶傾向欄、流月十神、本題焦點層：十五種方法的貼上提示詞都有焦點段，且不含英文鍵名殘留。
 * 可選：本機裝有 iztro 時，隨機 40 盤紫微與 iztro 對照（未裝則略過，不當失敗）。
 * 這些是計算與資料契約的核對，不代表預測準確。 */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {environment,examples}=require('./native-fixtures-20261003.cjs');
const env=environment(),c=env.ctx;['tarot-foundation','prompt-brief','prompt-packet'].forEach(env.load);
let passed=0;function test(name,fn){fn();passed++;console.log('PASS '+name);}
const TG='甲乙丙丁戊己庚辛壬癸',DZ='子丑寅卯辰巳午未申酉戌亥';
const A=c.Astronomy;assert(A&&typeof A.SearchSunLongitude==='function','vendored astronomy-engine');
function term(year,lon){for(let off=0;off<365;off+=20){const t=A.SearchSunLongitude(lon,new A.AstroTime(new Date(Date.UTC(year,0,1)+off*86400e3)),25);if(t)return t.date.getTime();}return NaN;}
test('2026 official solar terms (HKO/NAO) within 1 minute of the calendar engine',()=>{
  const official={小寒:'01-05 16:23',大寒:'01-20 09:45',立春:'02-04 04:02',雨水:'02-18 23:52',驚蟄:'03-05 21:59',春分:'03-20 22:46',清明:'04-05 02:40',穀雨:'04-20 09:39',立夏:'05-05 19:49',芒種:'06-05 23:48',夏至:'06-21 16:25',小暑:'07-07 09:57',大暑:'07-23 03:13',立秋:'08-07 19:43',處暑:'08-23 10:19',白露:'09-07 22:41',秋分:'09-23 08:05',霜降:'10-23 17:38',小雪:'11-22 15:23',冬至:'12-22 04:50'};
  const tbl=c.Solar.fromYmd(2026,6,1).getLunar().getJieQiTable();
  const norm=k=>k.replace('惊蛰','驚蟄').replace('芒种','芒種').replace('谷雨','穀雨').replace('处暑','處暑').replace('小满','小滿').replace('DONG_ZHI','冬至');
  let checked=0;
  for(const [name,hm] of Object.entries(official)){const key=Object.keys(tbl).find(k=>norm(k)===name&&String(tbl[k].toYmdHms()).startsWith('2026'));assert(key,'engine has '+name);
    const eng=Date.parse(tbl[key].toYmdHms().replace(' ','T')+'+08:00'),off=Date.UTC(2026,+hm.slice(0,2)-1,+hm.slice(3,5),+hm.slice(6,8),+hm.slice(9,11))-8*3600e3;
    assert(Math.abs(eng-off)<=60e3,name+' engine '+tbl[key].toYmdHms()+' vs official '+hm);checked++;}
  assert.equal(checked,20);
});
function jdn(y,m,d){const a=Math.floor((14-m)/12),yy=y+4800-a,mm=m+12*a-3;return d+Math.floor((153*mm+2)/5)+365*yy+Math.floor(yy/4)-Math.floor(yy/100)+Math.floor(yy/400)-32045;}
function dayGZ(y,m,d){const i=((jdn(y,m,d)+49)%60+60)%60;return TG[i%10]+DZ[i%12];}
function indep(utc,policy){const lon=A.SunPosition(new Date(utc)).elon,w=new Date(utc+8*3600e3),y=w.getUTCFullYear(),m=w.getUTCMonth()+1,d=w.getUTCDate(),h=w.getUTCHours();
  let yr=y;if(m<=2&&lon<315)yr=y-1;const mIdx=Math.floor(((lon-315+360)%360)/30),yG=((yr-4)%10+10)%10,mG=TG[((((yG%5)*2+2)%10)+mIdx)%10];
  let dd=new Date(Date.UTC(y,m-1,d));if(policy==='ZI_HOUR_23'&&h>=23)dd=new Date(dd.getTime()+86400e3);const dGZ=dayGZ(dd.getUTCFullYear(),dd.getUTCMonth()+1,dd.getUTCDate());
  const hZi=Math.floor(((h+1)%24)/2)%12,hG=TG[((TG.indexOf(dGZ[0])%5)*2+hZi)%10];return [TG[yG]+DZ[((yr-4)%12+12)%12],mG+DZ[(2+mIdx)%12],dGZ,hG+DZ[hZi]].join(' ');}
test('independent JDN + solar-longitude pillars agree with computeBazi at term boundaries and in both day-boundary policies',()=>{
  assert.equal(dayGZ(2000,1,1),'戊午');assert.equal(dayGZ(1983,8,25),'乙酉');
  const cases=[];for(const y of [1984,2026]){for(const lon of [315,345,45,135,225]){const t=term(y,lon);for(const off of [-60e3,60e3])cases.push(t+off);}}
  cases.push(Date.UTC(2026,9,23,15,30)-8*3600e3,Date.UTC(1999,11,31,15,30)-8*3600e3);
  let n=0;for(const utc of cases)for(const policy of ['ZI_HOUR_23','MIDNIGHT_00']){const w=new Date(utc+8*3600e3);
    const ch=c.computeBazi(w.getUTCFullYear(),w.getUTCMonth()+1,w.getUTCDate(),w.getUTCHours(),w.getUTCMinutes(),'male',{second:w.getUTCSeconds(),timezoneOffset:8,dayBoundaryMode:policy});
    const got=['year','month','day','hour'].map(k=>ch.pillars[k].gan+ch.pillars[k].zhi).join(' ');assert.equal(got,indep(utc,policy),w.toISOString()+' '+policy);n++;}
  assert.equal(n,cases.length*2);
});
test('ming-gong zhongqi now follows the calendar engine and keeps the fallback-table result',()=>{
  const b=c.computeBazi(1983,8,25,14,55,'male',{timezoneOffset:8});assert.equal(b.mingGong.gan+b.mingGong.zhi,'乙丑');
  const b2=c.computeBazi(2026,10,23,17,40,'female',{timezoneOffset:8});assert(TG.includes(b2.mingGong.gan)&&DZ.includes(b2.mingGong.zhi));
});
test('neutral charts carry an explicit, reasoned lean and monthly rows carry ten gods',()=>{
  const b=c.computeBazi(1983,8,25,14,55,'male',{timezoneOffset:8});c.enhanceBazi(b);
  assert.equal(b.isNeutral,true);assert.equal(b.strengthAssessment.lean.direction,'中和偏弱');assert(b.strengthAssessment.lean.basis.some(x=>x.startsWith('失令')));
  assert.deepEqual(JSON.parse(JSON.stringify(b.wuxingStance.map)),{木:'平',火:'平',土:'平',金:'平',水:'平'});
  const strong=c.computeBazi(1990,5,15,14,30,'male',{timezoneOffset:8});assert.equal(strong.strengthAssessment.lean,null);
  assert.equal(b.liuYue[0].god,'正官');assert.equal(b.liuYue[0].zGod,'劫財');
});
test('every method delivers a question-focus block, no English keys leak into it, and budgets hold',()=>{
  const x=examples(c),P=c.JYPromptPacket;const q='我目前薪水不高，想半年內轉職，該先留在原公司累積還是現在就走？';
  for(const [method,chart] of Object.entries(x.charts)){const body=P.build(method,chart,q),p=P.get(body);
    assert(body.includes('【本題焦點'),method);const seg=body.split('【本題焦點')[1].split('\n\n【')[0];
    const segNoNames=seg.split('\n').filter(l=>!l.startsWith('已成立的格')).join('\n').replace(/Ace|Book T/g,'');assert(!/[A-Za-z]{4,}/.test(segNoNames),method+' english key in focus: '+segNoNames.match(/[A-Za-z]{4,}/));
    assert(body.includes('【讀完資料再提醒一次】'));assert(P.chars(body)<=11000&&P.utf8(body)<=26000,method);
    if(method==='bazi'){assert(seg.includes('傷官撞正官'));assert(seg.includes('過去三年回看'));assert(seg.includes('2023癸卯'));}
    if(method==='ziwei'){assert(seg.includes('官祿（巳）'));assert(seg.includes('流年命宮走本命'));}
    if(method==='vedic')assert(seg.includes('主運'));if(method==='astro')assert(seg.includes('行運'));}
});
test('optional: iztro cross-check when installed',()=>{
  let iz=null;try{iz=require('iztro');}catch(e){console.log('  (iztro not installed; skipped)');return;}
  const {astro}=iz;astro.config({yearDivide:'normal',horoscopeDivide:'normal'});let seed=7;const rnd=(a,b)=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return a+seed%(b-a+1);};
  for(let k=0;k<40;k++){const y=rnd(1940,2020),m=rnd(1,12),d=rnd(1,28),h=rnd(0,23),g=k%2?'male':'female';const z=c.computeZiwei(y,m,d,h,g,{minute:30,yearDivide:'normal',horoscopeDivide:'normal'});if(!z)continue;
    const ref=astro.bySolar(y+'-'+m+'-'+d,Math.floor(((h+1)%24)/2)%12,g,false,'zh-TW');
    assert.equal(z.palaces.find(p=>p.isMing).branch,ref.palaces.find(p=>p.name==='命宮').earthlyBranch);
    for(const rp of ref.palaces){const a=z.palaces.find(q=>q.branch===rp.earthlyBranch);for(const s of [...rp.majorStars,...rp.minorStars])assert(a.stars.some(x=>x.name===s.name),y+'-'+m+'-'+d+' '+s.name);}}
});
console.log(JSON.stringify({passed}));
