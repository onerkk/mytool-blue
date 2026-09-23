'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {environment}=require('./dom-fixture.cjs');
const ctx=environment().ctx;
const base=path.resolve(__dirname,'..');
for(const source of ['vendor/lunar','bazi-calendar-core','solar-location','bazi','bazi_upgrade','tarot','ziwei']){
  vm.runInContext(fs.readFileSync(path.join(base,'JS',source+'.js'),'utf8'),ctx,{filename:source+'.js'});
}
const dz='子丑寅卯辰巳午未申酉戌亥';
const names=['命宮','兄弟','夫妻','子女','財帛','疾厄','遷移','交友','官祿','田宅','福德','父母'];
function chart(branch='子'){
  return names.map((name,i)=>({name,branch:dz[(dz.indexOf(branch)-i+12)%12],stars:[]}));
}
function add(palaces,place,name,hua=null){
  const p=palaces.find(x=>x.name===place||x.branch===place);
  assert(p,'missing palace '+place);
  p.stars.push({name,type:['天同','太陰','天相','破軍','貪狼','太陽'].includes(name)?'major':'minor',hua});
  return palaces;
}
function hit(palaces,id){return ctx.assessZiweiPatterns(palaces).patterns.find(x=>x.id===id);}
function title(g,m,d,h){return {year:{gan:g[0],zhi:g[1]},month:{gan:m[0],zhi:m[1]},day:{gan:d[0],zhi:d[1]},hour:{gan:h[0],zhi:h[1]}};}
function month(g,m,d,h){return ctx.baziDetectZhengGe({dm:d[0],pillars:title(g,m,d,h)});}

// Official pattern catalogue: https://iztro.com/zh_TW/learn/pattern
{
  const z=add(chart('午'),'命宮','擎羊');
  assert.equal(hit(z,'horse-arrow'),undefined,'午命一羊不等於馬頭帶箭');
  add(z,'命宮','天同');add(z,'命宮','太陰');
  assert(hit(z,'horse-arrow'),'天同太陰與擎羊同在午命');
  const borrowed=add(chart('午'),'命宮','擎羊');add(borrowed,'遷移','天同');add(borrowed,'遷移','太陰');
  assert(hit(borrowed,'horse-arrow'),'空命借對宮天同太陰');
  add(borrowed,'命宮','破軍');
  assert.equal(hit(borrowed,'horse-arrow'),undefined,'有主星不可以冒稱空命借星');
  const side=add(chart('午'),'命宮','擎羊');add(side,'命宮','貪狼','化祿');
  assert(!hit(side,'horse-arrow') && hit(side,'horse-arrow-greedy'),'貪狼化祿單列旁格');
  side.find(p=>p.name==='命宮').stars.find(s=>s.name==='貪狼').hua=null;
  assert(!hit(side,'horse-arrow-greedy'));
}
{
  const life=add(chart('子'),'命宮','天同');add(life,'命宮','太陰');
  assert(hit(life,'moon-sea-life')&&!hit(life,'moon-sea-home'));
  const home=add(chart('酉'),'子','天同');add(home,'子','太陰');
  assert(hit(home,'moon-sea-home')&&!hit(home,'moon-sea-life'));
  home.find(p=>p.branch==='子').stars[0].name='破軍';
  assert(!hit(home,'moon-sea-home'));
  const hero=add(chart('午'),'命宮','破軍');assert(hit(hero,'hero-temple'));
  assert(!hit(add(chart('酉'),'命宮','破軍'),'hero-temple'));
}
{
  const z=add(chart('子'),'命宮','祿存');add(z,'丑','太陽','化祿');
  assert(hit(z,'bright-hidden-fortune'),'六合暗合宮與命宮各一種祿');
  const reverse=add(chart('子'),'命宮','太陽','化祿');add(reverse,'丑','祿存');
  assert(hit(reverse,'bright-hidden-fortune'),'兩種祿在兩宮反向亦成立');
  reverse.find(p=>p.branch==='丑').stars.pop();add(reverse,'午','祿存');
  assert(!hit(reverse,'bright-hidden-fortune'),'對宮祿存不等於暗祿');
  const two=add(chart('子'),'命宮','祿存');add(two,'命宮','太陽','化祿');
  add(two,'命宮','地空');assert(hit(two,'two-hoods'));
  two.find(p=>p.name==='命宮').stars.pop();add(two,'丑','地空');
  assert(!hit(two,'two-hoods'),'空星會命不能代替同宮');
  const seal=add(chart('子'),'命宮','天相');add(seal,'命宮','天馬');add(seal,'命宮','祿存');
  assert(hit(seal,'luma-seal'));
  assert(hit(seal,'luma-together'));
  seal.find(p=>p.name==='命宮').stars.pop();add(seal,'午','祿存');
  assert(!hit(seal,'luma-seal'),'分宮會祿不等於三曜同宮');
  assert(!hit(seal,'luma-together'),'分宮會祿不等於祿馬交馳同宮');
  const pair=add(chart('子'),'命宮','祿存');add(pair,'午','太陽','化祿');
  assert(hit(pair,'fortune-pair'),'對拱祿存及生年化祿');
  pair.find(p=>p.branch==='午').stars.pop();add(pair,'寅','太陽','化祿');
  assert(!hit(pair,'fortune-pair'),'三方會祿但不對拱不叫祿合鴛鴦');
  const aides=add(chart('子'),'命宮','左輔');add(aides,'命宮','右弼');
  assert(hit(aides,'aides-together'));
  aides.find(p=>p.name==='命宮').stars.pop();add(aides,'午','右弼');
  assert(!hit(aides,'aides-together'),'同宮不應由分宮會照代替');
  const body=chart('子');body.find(p=>p.name==='夫妻').isShen=true;
  add(body,'夫妻','左輔');add(body,'夫妻','右弼');
  assert.equal(hit(body,'aides-together').palaces[0],'夫妻','身宮版本按實際宮位');
  const assists=add(chart('子'),'命宮','紫微');add(assists,'官祿','左輔');add(assists,'財帛','右弼');
  assert(hit(assists,'assists-purple'));
  assists.find(p=>p.name==='財帛').stars.pop();
  assert(!hit(assists,'assists-purple'),'缺一曜不成立輔弼拱主');
}

// 月令格 / 用神成敗救應：《子平真詮》https://www.donglishuzhai.net/chapter/3758.html
{
  const lu=month('壬午','甲寅','甲辰','庚戌');assert.equal(lu.geName,'建祿格');
  assert(!/根基穩固|自力更生|顯貴/.test(lu.zh));
  const ren=month('壬午','甲卯','甲辰','庚戌');assert.equal(ren.geName,'月刃格');
  assert(!/剛愎自用|性格剛強/.test(ren.zh));
  const earth=month('壬子','戊辰','戊戌','庚申');
  assert(!earth.geName.includes('建祿')&&earth.geName.includes('比肩月令'));
  const earthRob=month('壬子','己未','戊戌','庚申');
  assert(!earthRob.geName.includes('建祿')&&earthRob.geName.includes('月劫'));
  const explicit=month('甲子','壬申','庚辰','壬午');
  assert.equal(explicit.geName,'建祿格');
  assert.equal(explicit.touChu,'壬');
  assert.equal(explicit.geGod,'食神','明透格神按實際藏干而不是一律比劫');
}
{
  const cooccurrence={dm:'甲',gods:{year:'食神',month:'七殺'},pillars:title('丙子','庚酉','甲戌','丁丑')};
  assert.deepEqual(Array.from(ctx.baziTenGodCombinations(cooccurrence)),[],'並存兩個十神不等於作用線');
  const pillars=title('庚寅','丙寅','甲申','庚午');
  const rules=ctx.assessBaziSpecialRules(pillars);
  const source=rules.rules.find(x=>x.id==='food-kill');
  assert.equal(source.status,'structural');
  const positive=ctx.baziTenGodCombinations({dm:'甲',pillars,specialRuleAssessment:rules});
  const foodKill=positive.find(x=>x.name==='食神制殺');
  assert(foodKill && foodKill.checks.length===2);
  assert.equal(foodKill.status,'作用入口');
  assert(!/大富大貴|高管|財來財去|收入豐厚/.test(JSON.stringify(positive)));
  const broken=title('庚子','丙寅','甲寅','庚午');
  const brokenRules=ctx.assessBaziSpecialRules(broken);
  assert.equal(brokenRules.rules.find(x=>x.id==='food-kill').status,'not-established');
  assert(!ctx.baziTenGodCombinations({dm:'甲',pillars:broken,specialRuleAssessment:brokenRules}).some(x=>x.name==='食神制殺'),'有食神七殺而七殺無根不輸出作用入口');
}
{
  const dragon=ctx.analyzeZodiacName('陳江',1988,{date:'1988-08-25'});
  assert.equal(dragon.zodiac,'龍');
  const water=dragon.positions.flatMap(p=>p.charResults.flatMap(r=>r.hits)).find(h=>h.matchedRoots.includes('氵'));
  assert(water && water.reason.includes('形義派'));
  assert(!/大富大貴|受傷|必定|注定/.test(JSON.stringify(dragon)));
  assert(dragon.scorePolicy.includes('不是事件機率'));
  assert.equal(ctx.analyzeZodiacName('陳江',1988,{date:'1988-02-30'}),null,'無效日期不得算生肖');
  const sacrifice=ctx.analyzeZodiacName('陳大',1983,{date:'1983-08-25'});
  assert(sacrifice.isSacrifice && sacrifice.overallLevel.includes('候選'));
  assert(!/內心承受極大壓力|常為他人犧牲/.test(sacrifice.sacrificeNote));
  const clash=ctx.analyzeZodiacName('陳達',1983,{date:'1983-08-25'});
  assert(clash.isSnakePigClash && clash.clashNote.includes('達'));
  assert(!/血光意外|犯小人/.test(clash.clashNote));
  ctx.S={bazi:{fav:['火'],tiaohou:{need:['火']}}};
  const compared=ctx.analyzeZodiacName('陳明',1983,{date:'1983-08-25'});
  assert.equal(compared.baziOverride,false,'生肖字根不能從標籤猜五行覆寫八字');
  assert(!/以毒攻毒|精準補足/.test(JSON.stringify(compared)));
}
{
  const node=ctx.document.createElement('section');
  node.setAttribute('id','r-crystal');ctx.document.body.appendChild(node);
  // 舊橋接誤以為 analyzeFullCrystal 會給 r.tianTie；真實回傳沒有，畫面原本會中斷。
  ctx.analyzeFullCrystal=()=>({roles:{金:{role:'忌神',pct:28}},basic:{}});
  const metal=ctx.evaluateTianTie({fav:['金'],unfav:['水'],ep:{金:2}},null);
  assert.equal(metal.score,null,'未知道實物與使用條件時不虛構適配百分比');
  assert(metal.reason.includes('鎳過敏'));
  const html=ctx.renderCrystalExpanded({fav:['金'],unfav:['土'],ep:{金:2}},'wealth');
  assert.equal(node.innerHTML,html,'實際 DOM 端到端渲染');
  assert(html.includes('黃水晶'),'八字忌土不能冒作材質禁忌而刪掉瀏覽選項');
  assert(!/undefined|NaN|適配度|紫微驗證|左手進能量|忌神.*必須避免|招財|辟邪|助眠|療癒/.test(html));
  assert(ctx.renderCrystalExpanded(null,'unknown').includes('飾品設計參考'),'無八字資料仍能渲染');
  assert(ctx.renderCrystalExpanded({fav:['constructor']},'__proto__').includes('飾品設計參考'),'原型鍵不能誤當作可推薦的色系或題型');
  const catalogue=vm.runInContext('Object.values(CRYSTAL_DB).flat()',ctx);
  assert(!/招財|護身|辟邪|療癒|助眠|絕對禁止|磁場強|提升投資眼光/.test(JSON.stringify(catalogue)));
  assert(catalogue.every(c=>['木','火','土','金','水'].includes(c.el)));
}
{
  const jy={lagna:{idx:0},currentMD:{zh:'金星運',lord:'Venus'},
    planets:{Venus:{dignity:'exalted',bhava:7},Moon:{dignity:'own',bhava:1}},
    shadbala:{Mars:{ratio:1.1}},functionalNature:{Mercury:{type:'benefic',label:'功能吉星'},Venus:{type:'benefic',label:'功能吉星'},Saturn:{type:'malefic',dangerToStrengthen:true,label:'功能凶星'}},
    effectiveStrength:{Mercury:{effective:0.6},Venus:{effective:0.4},Saturn:{effective:0.3}}};
  const bz={dm:'甲',dmEl:'木',strong:false,shensha:['桃花'],dayun:[{gan:'乙',zhi:'未',level:'吉旺',isCurrent:true}]};
  const zi={palaces:[{name:'夫妻',stars:[{name:'天府',type:'major'}]}]};
  const cv=ctx.jyCrossValidation(jy,bz,zi,'love');
  assert(cv.signals.length>=3 && cv.signals.every(s=>s.weight===0));
  assert.equal(cv.agreements,null);
  assert.equal(cv.consensus,'各體系分別解讀');
  assert(!/多系統認證|高度一致|雙系統確認|好時機|需要水晶|感情基礎良好/.test(cv.summary));
  assert.equal(ctx.jyRemedySuggestions(jy,'love').length,0,'非選材題不自行輸出寶石處方');
  const gem=ctx.jyRemedySuggestions(jy,'gemstone');
  assert(gem.some(x=>x.planet==='Mercury' && x.gem==='傳統對應：祖母綠'));
  assert(gem.every(x=>x.policy==='CULTURAL_REFERENCE_ONLY' && !x.day && !x.dangerIfStrengthened));
  assert(!/綠碧璽|太陽石|最佳佩戴日|補強有效力量/.test(JSON.stringify(gem)));
}
console.log('PASS birth audit: Ziwei geometry and Bazi month/interaction assertions');
