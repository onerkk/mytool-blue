'use strict';
/* 姓名學、大六壬補上分享卡：按鈕在結果頁、分享卡模組有對應畫法與主題，且分享卡讀取的引擎欄位在實際結果中存在。 */
const assert=require('assert/strict'),fs=require('fs'),path=require('path'),vm=require('vm');const ROOT=path.resolve(__dirname,'..');const R=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
const sc=R('JS/share-card.js');assert(/var RENDER=\{name:renderName,liuren:renderLiuren,/.test(sc));assert(/name:\{name:'姓名學'/.test(sc)&&/liuren:\{name:'大六壬'/.test(sc));
const nm=R('JS/name-standalone.js');assert(nm.includes('data-nm-action="share"')&&nm.includes("action==='share')share()")&&nm.includes("JYShareCard.open('name'"));
const lr=R('JS/liuren-room.js');assert(lr.includes('data-lr-action="share"')&&lr.includes("action==='share')shareCard()")&&lr.includes("JYShareCard.open('liuren'"));
// Liuren engine fields read by the card
Object.assign(globalThis,require('../JS/vendor/lunar.js'));vm.runInThisContext(R('JS/bazi-calendar-core.js'),{filename:'bazi-calendar-core.js'});
const r=require('../JS/liuren-core.js').calculate({date:'2026-10-01',time:'22:06',timezoneOffset:8});
for(const k of ['year','month','day','hour'])assert(r.time.pillars[k].gan&&r.time.pillars[k].zhi);assert(r.monthGeneral.branch);
assert.equal(r.courses.length,4);r.courses.forEach(k=>assert(k.upper&&k.lower&&k.general));assert.equal(r.transmissions.length,3);r.transmissions.forEach(t=>assert(t.role&&t.branch&&t.general&&t.kinship&&typeof t.empty==='boolean'));
assert(r.method.gate&&r.method.type);assert(Array.isArray(r.xun.empty));
// Name engine fields read by the card
const ctx={console,Math,JSON,Date,Set,Map,Array,Object,String,Number,RegExp,Error,parseInt,parseFloat,isNaN,Promise,setTimeout,clearTimeout};ctx.window=ctx;ctx.globalThis=ctx;ctx.self=ctx;vm.createContext(ctx);
vm.runInContext(R('JS/vendor/lunar.js'),ctx);for(const f of ['name-data','name-sancai','name-engine'])vm.runInContext(R('JS/'+f+'.js'),ctx,{filename:f});
const n=ctx.JYNameEngine.analyze({surname:'陳',given:'弘林',birthDate:'1983-08-25',birthTime:'14:55',purpose:'personal'});
assert(n.characters.every(c=>c.char&&Number.isFinite(c.stroke)));assert.equal(n.fiveGrids.grids.length,5);n.fiveGrids.grids.forEach(g=>assert(g.role&&Number.isFinite(g.num)&&g.element&&g.level));
assert(n.fiveGrids.sanCai.configuration&&n.fiveGrids.sanCai.level);assert.equal(n.zodiac.status,'complete');assert(n.zodiac.zodiac);
console.log(JSON.stringify({passed:4}));
