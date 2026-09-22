'use strict';
// Independent classical fixtures + exhaustive 4^6 states. No network required.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..'),ctx={console,Date,Uint8Array,crypto:require('node:crypto').webcrypto};
vm.createContext(ctx);
function load(name){vm.runInContext(fs.readFileSync(path.join(root,'JS',name+'.js'),'utf8'),ctx,{filename:name});}
['vendor/lunar','bazi-calendar-core','liuyao-core','yijing-data','yijing-core','reading-quality','gua-prompt'].forEach(load);
const L=ctx.JYLiuyaoCore,Y=ctx.JYYijingCore,plain=x=>JSON.parse(JSON.stringify(x));
const date={day:'甲子',monthBranch:'辰'},calc=v=>L.calculate({values:v,calendar:date}),yi=v=>Y.calculate({values:v});
let passed=0;function test(name,fn){fn();passed++;console.log('✓ '+name);}
const byName={};for(let code=0;code<64;code++){let h=L.hexagram(code);byName[h.name]=h;}
function values(name,moves=[]){return byName[name].lines.map((yang,i)=>moves.includes(i+1)?(yang?9:6):(yang?7:8));}
test('八宮全圖：64 卦歸宮、世應、遊魂歸魂；八宮均不重複',()=>{
  const families={乾:'乾 姤 遯 否 觀 剝 晉 大有',兌:'兌 困 萃 咸 蹇 謙 小過 歸妹',離:'離 旅 鼎 未濟 蒙 渙 訟 同人',震:'震 豫 解 恆 升 井 大過 隨',巽:'巽 小畜 家人 益 無妄 噬嗑 頤 蠱',坎:'坎 節 屯 既濟 革 豐 明夷 師',艮:'艮 賁 大畜 損 睽 履 中孚 漸',坤:'坤 復 臨 泰 大壯 夬 需 比'};
  let seen=[];for(const [palace,names] of Object.entries(families))names.split(' ').forEach((n,i)=>{let h=byName[n];assert(h,n);assert.equal(h.palace.name,palace,n);assert.equal(h.palace.shi,[6,1,2,3,4,5,4,3][i],n);assert.equal(Math.abs(h.palace.shi-h.palace.ying),3);if(i===6)assert.equal(h.palace.generation,'遊魂');if(i===7)assert.equal(h.palace.generation,'歸魂');seen.push(h.number);});
  assert.equal(new Set(seen).size,64);assert.equal(byName['乾'].code,63);assert.equal(byName['坤'].code,0);assert.equal(byName['既濟'].code,21);assert.equal(byName['未濟'].code,42);
});
test('渾天甲子：八純卦納甲、陰陽順序及六神起例',()=>{
  const fixtures={乾:['甲甲甲壬壬壬','子寅辰午申戌'],坤:['乙乙乙癸癸癸','未巳卯丑亥酉'],震:['庚庚庚庚庚庚','子寅辰午申戌'],巽:['辛辛辛辛辛辛','丑亥酉未巳卯'],坎:['戊戊戊戊戊戊','寅辰午申戌子'],離:['己己己己己己','卯丑亥酉未巳'],艮:['丙丙丙丙丙丙','辰午申戌子寅'],兌:['丁丁丁丁丁丁','巳卯丑亥酉未']};
  for(const [name,[stems,branches]]of Object.entries(fixtures)){let ls=L.najia(byName[name].code);assert.equal(ls.map(l=>l.stem).join(''),stems);assert.equal(ls.map(l=>l.branch).join(''),branches);}
  ['青龍','青龍','朱雀','朱雀','勾陳','螣蛇','白虎','白虎','玄武','玄武'].forEach((spirit,i)=>{let r=L.calculate({values:values('乾'),calendar:{day:'甲乙丙丁戊己庚辛壬癸'[i]+'子丑寅卯辰巳午未申酉'[i],monthBranch:'辰'}});assert.equal(r.lines[0].spirit,spirit);assert.equal(new Set(r.lines.map(l=>l.spirit)).size,6);});
});
test('古例：需之訟、夬之姤的變爻六親均沿用坤宮土',()=>{
  const a=calc([9,7,9,6,7,6]);assert.equal(a.original.name,'需');assert.equal(a.changed.name,'訟');assert.equal(a.original.palace.name,'坤');assert.equal(a.changed.palace.name,'離');
  assert.deepEqual(plain(a.lines.map(l=>l.relative)),['妻財','官鬼','兄弟','子孫','兄弟','妻財']);
  const b=calc([9,7,7,7,7,6]);assert.equal(b.original.name,'夬');assert.equal(b.changed.name,'姤');assert.equal(b.changed.palace.name,'乾');
  assert.equal(b.lines[0].changed.branch,'丑');assert.equal(b.lines[0].changed.relative,'兄弟');assert.equal(b.lines[5].changed.relative,'兄弟');assert.equal(b.lines[1].changed.active,false);assert.equal(b.lines[1].transition,null);
  const c=calc(values('姤'));assert.equal(c.lines[1].hidden.relative,'妻財');assert.equal(c.lines[1].hidden.branch,'寅');assert.equal(c.lines.filter(l=>l.hidden).length,1);
});
test('六沖十卦、六合八卦；日沖不直接定暗動或日破',()=>{
  let clash=[],combine=[];for(const name of Object.keys(byName)){let r=calc(values(name));if(r.structures.sixClash)clash.push(name);if(r.structures.sixCombine)combine.push(name);assert(!('darkMove' in r.lines[0].states));}
  assert.deepEqual(clash.sort(),'乾 坤 震 巽 坎 離 艮 兌 無妄 大壯'.split(' ').sort());
  assert.deepEqual(combine.sort(),'否 泰 節 旅 賁 復 困 豫'.split(' ').sort());
  assert.equal(calc(values('乾')).lines[3].states.dayClash,true);
});
test('三錢八種結果為 1:3:3:1；缺少安全亂數直接停止',()=>{
  let count=[0,0,0,0];for(let bits=0;bits<8;bits++)count[L.fromCoins([0,1,2].map(i=>bits>>i&1?'back':'front'))-6]++;
  assert.deepEqual(count,[1,3,3,1]);assert.equal(L.fromCoins(['back','back','back']),9);assert.equal(L.fromCoins(['front','front','front']),6);
  const prior=ctx.crypto;ctx.crypto={getRandomValues:a=>a.set([0,1,255])};assert.deepEqual(plain(L.toss()),{coins:['front','back','back'],value:8});ctx.crypto=null;assert.throws(()=>L.toss());ctx.crypto=prior;
});
test('4096 組：本變卦逐爻互換、所有動爻保留、擇辭與原文完全相符',()=>{
  const counts=Array(7).fill(0);
  for(let n=0;n<4096;n++){
    const v=Array.from({length:6},(_,i)=>6+((n>>(i*2))&3)),l=calc(v),y=yi(v),moving=v.flatMap((x,i)=>x===6||x===9?[i+1]:[]),still=[1,2,3,4,5,6].filter(p=>!moving.includes(p));
    counts[moving.length]++;assert.deepEqual(plain(l.movingPositions),moving);assert.deepEqual(plain(y.original),plain(l.original));assert.deepEqual(plain(y.changed),plain(l.changed));
    v.forEach((x,i)=>{assert.equal(l.original.lines[i],x%2);assert.equal(l.changed.lines[i],moving.includes(i+1)?1-x%2:x%2);assert.equal(l.lines[i].changed.active,moving.includes(i+1));});
    let s=y.reading.selections;
    if(moving.length===0){assert.equal(s[0].side,'original');assert.equal(s[0].kind,'judgment');}
    if(moving.length===1){assert.equal(s[0].position,moving[0]);assert.equal(s[0].side,'original');}
    if(moving.length===2){assert.deepEqual(plain(s.map(v=>v.position)),[moving[1],moving[0]]);assert(s.every(v=>v.side==='original'));}
    if(moving.length===3){assert.equal(s.length,2);assert.equal(s[0].side,moving.includes(1)?'original':'changed');assert(s.every(v=>v.kind==='judgment'));}
    if(moving.length===4){assert.deepEqual(plain(s.map(v=>v.position)),still);assert(s.every(v=>v.side==='changed'));}
    if(moving.length===5){assert.equal(s[0].position,still[0]);assert.equal(s[0].side,'changed');}
    if(moving.length===6){assert.equal(s[0].kind,[1,2].includes(y.original.number)?'use':'judgment');if(s[0].kind==='judgment')assert.equal(s[0].side,'changed');}
    for(const p of s){let text=Y.textFor(p.number);assert.equal(p.text,p.kind==='line'?text.lines[p.position-1].text:p.kind==='use'?text.use.text:text.judgment);assert(p.source&&p.revision);}
    assert(Object.isFrozen(l.lines[0]));assert(Object.isFrozen(y.reading.selections));
  }
  assert.deepEqual(counts,[64,384,960,1280,960,384,64]);
});
test('朱子考變占原例：一爻、五爻、三爻前後十及乾坤二用',()=>{
  for(const [name,moves,to]of [['屯',[1],'比'],['乾',[2],'同人'],['大有',[3],'睽'],['觀',[4],'否'],['坤',[5],'比'],['歸妹',[6],'睽']]){let r=yi(values(name,moves));assert.equal(r.changed.name,to);assert.equal(r.reading.selections[0].number,byName[name].number);}
  let r=yi(values('艮',[1,3,4,5,6]));assert.equal(r.changed.name,'隨');assert.equal(r.reading.selections[0].label,'六二');assert.equal(r.reading.selections[0].text,'系小子，失丈夫。');
  for(const [name,moves,to,side]of [['乾',[1,2,3],'否','original'],['乾',[1,5,6],'恆','original'],['乾',[2,3,4],'益','changed'],['乾',[4,5,6],'泰','changed'],['坤',[1,2,3],'泰','original'],['坤',[1,5,6],'益','original'],['坤',[2,3,4],'恆','changed'],['坤',[4,5,6],'否','changed']]){r=yi(values(name,moves));assert.equal(r.changed.name,to);assert.equal(r.reading.selections[0].side,side);}
  assert.equal(yi([9,9,9,9,9,9]).reading.selections[0].label,'用九');assert.equal(yi([6,6,6,6,6,6]).reading.selections[0].label,'用六');
});
test('六十日旬空循環，午夜與子初換日，指定時區不隨電腦時區漂移',()=>{
  const G='甲乙丙丁戊己庚辛壬癸',Z='子丑寅卯辰巳午未申酉戌亥',expected=['戌亥','申酉','午未','辰巳','寅卯','子丑'];
  for(let i=0;i<60;i++)assert.equal(L.voidBranches(G[i%10]+Z[i%12]).join(''),expected[Math.floor(i/10)]);
  let base={year:2000,month:1,day:7,hour:23,minute:30,second:0,timezoneOffset:8};
  const mid=L.calendar(base),zi=L.calendar({...base,dayBoundaryMode:'ZI_HOUR_23'});assert.equal(mid.day,'甲子');assert.equal(zi.day,'乙丑');assert.equal(mid.hour,'甲子');assert.equal(zi.hour,'丙子');
  const utc=L.calendar({...base,hour:15,timezoneOffset:0});assert.equal(utc.instant,mid.instant);assert.equal(utc.month,mid.month);
  assert.equal(L.calendar({...base,birthInstant:0}).instant,mid.instant);
});
test('香港天文台 2026 節令日期；同一瞬間跨時區與交節前後一秒',()=>{
  const table=ctx.Solar.fromYmd(2026,6,15).getLunar().getJieQiTable();
  const fixture={小寒:['01-05','丑'],立春:['02-04','寅'],驚蟄:['03-05','卯'],清明:['04-05','辰'],立夏:['05-05','巳'],芒種:['06-05','午'],小暑:['07-07','未'],立秋:['08-07','申'],白露:['09-07','酉'],寒露:['10-08','戌'],立冬:['11-07','亥'],大雪:['12-07','子']};
  for(const [name,[day,branch]]of Object.entries(fixture)){
    const simplified=name.replace('驚','惊').replace('蟄','蛰').replace('種','种'),s=table[simplified]||table[name];assert(s,name);assert.equal(s.toYmd().slice(5),day,name);
    const time=Date.parse(s.toYmdHms().replace(' ','T')+'+08:00');const a=L.calendar(L.localTimeAt(time-1000,8)),b=L.calendar(L.localTimeAt(time,8)),c=L.calendar(L.localTimeAt(time,0));assert.notEqual(a.monthBranch,b.monthBranch,name);assert.equal(b.monthBranch,branch);assert.equal(c.month,b.month);assert.equal(c.instant,b.instant);
  }
});
test('無效日期、爻值、擲錢紀錄、時差不靜默補算',()=>{
  for(const v of [[],[7,7,7,7,7],[7,7,7,7,7,10],['7',7,7,7,7,7]]){assert.throws(()=>calc(v));assert.throws(()=>yi(v));}
  assert.throws(()=>L.fromCoins(['front','back']));assert.throws(()=>L.voidBranches('甲丑'));
  for(const extra of [{month:2,day:30},{timezoneOffset:15},{timezoneOffset:8.1},{dayBoundaryMode:'OTHER'},{year:1899}])assert.throws(()=>L.calendar({year:2026,month:9,day:22,...extra}));
  for(const engine of [L,Y])assert.throws(()=>engine.calculate({values:[7,7,7,7,7,7],calendar:date,method:'coins',records:Array(6).fill({coins:['front','front','front'],value:6})}));
});
test('解讀提示詞使用同一答案優先規則、精確事實與最後選品；獨立備援一致',()=>{
  const calendar=L.calendar({year:2026,month:9,day:22,hour:12,timezoneOffset:8});
  for(const engine of [L,Y]){
    const r=engine.calculate({values:[9,7,9,6,7,6],calendar,question:'工作是否值得推進？'}),a=ctx.JYGuaPrompt.build(r),quality=ctx.JY_READING_QUALITY;
    assert(a.includes('工作是否值得推進？'));assert(a.includes('先回答，再解釋'));assert(a.indexOf('【本次')<a.lastIndexOf('靜月之光蝦皮賣場'));assert(!a.includes('undefined'));
    ctx.JY_READING_QUALITY=null;assert.equal(ctx.JYGuaPrompt.build(r),a);ctx.JY_READING_QUALITY=quality;
    if(r.system==='yijing'){assert(!a.includes('【六爻排盤'));r.reading.selections.forEach(s=>assert(a.includes(s.text)));}else assert(a.includes('之卦同位背景'));
  }
});
console.log('gua-engine: '+passed+' groups passed, including all 4096 casts.');
