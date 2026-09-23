'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {environment}=require('./dom-fixture.cjs');
const env=environment(), c=env.ctx, root=path.resolve(__dirname,'..');
let outbound=0;
c.fetch=async()=>{outbound++;throw Error('Unexpected network request');};
c.Image=function(){return c.document.createElement('img');};
c.console={log(){},warn(){},error(){}};
const modules=['vendor/lunar','bazi-calendar-core','solar-location','bazi','bazi_upgrade','picker-core','tarot-foundation','golden-dawn-tarot','tarot','tarot-reading','tarot_upgrade','meihua_upgrade','meihua_output_layer','meihua_upgrade2','reading-quality','ai-analysis','ziwei','ziwei-prompt-root','ziwei-standalone','bazi-prompt-root','bazi-standalone','bazi-suite-core','prompt-export'];
for(const name of modules)vm.runInContext(fs.readFileSync(path.join(root,'JS',name+'.js'),'utf8'),c,{filename:name});
function check(name,fn){try{fn();console.log('PASS '+name);}catch(error){process.exitCode=1;console.error('FAIL '+name+'\n'+error.stack);}}
check('Store links and dynamic prices cannot be presented as verified',()=>{
  const samples=c.smartRecommend({fav:['火'],unfav:['水']},'health',6);
  const other=c.smartRecommend({fav:['水'],unfav:['火']},'wealth',6);
  assert.deepEqual(Array.from(samples,p=>p.n),Array.from(other,p=>p.n));
  assert(samples.length>0);
  for(const item of samples){assert.equal(item.price,undefined);assert(!/招財|療效|辟邪|醫治|現貨/.test(item.d||''));}
  const fromBazi=c._jyPickStones({fav:['火'],unfav:['水']});
  const fromTarot=c._jyPickStonesFromTarot();
  assert.deepEqual(Array.from(fromBazi,x=>x.prod.n),Array.from(fromTarot,x=>x.prod.n));
  assert(fromBazi.every(x=>x.reason.includes('賣場頁確認')));
  assert.equal(c._jyShopLink('javascript:alert(1)'),'https://shopee.tw/a50h95648d?tab=shop');
  assert.equal(c._jyShopLink('https://shopee.tw.evil.example/item'),'https://shopee.tw/a50h95648d?tab=shop');
  assert.equal(outbound,0);
});
check('Product cards render price and inventory verification without promises',()=>{
  const host=env.doc.body.appendChild(env.doc.createElement('div'));host.id='r-crystal';
  c.renderProductCrystal({fav:['火'],unfav:['水']},'health');
  function contents(node){return [node.textContent||'',...node.children.flatMap(contents)].join(' ');}
  const t=contents(host);
  assert.match(t,/價格、現貨及材質請以賣場頁為準/);
  assert(!/NT\$\s*\d|保證招財|佩戴就有效|靈擺實測/.test(t));
  assert(host.children.length>1);
  assert.equal(outbound,0);
});
check('Legacy stone panel is a neutral style sample without efficacy or old prices',()=>{
  c.S.bazi={fav:['火'],unfav:['水']};
  const html=c._renderCrystalPrescriptionHTML('粉晶手鏈','可以治病');
  assert.match(html,/價格、材質、尺寸及庫存請到賣場頁核對/);
  assert(!/可以治病|主石補最缺|護身石擋|NT\$\s*\d|靈擺實測/.test(html));
  assert.match(html,/https:\/\/shopee\.tw/);
  assert.equal(outbound,0);
});
check('Sacrifice and clash labels never change name score or predict incidents',()=>{
  const baseline={zodiac:'豬',overallLevel:'平',totalLike:0,totalDislike:0};
  const loaded={...baseline,overallLevel:'犧牲格',isSacrifice:true,isSnakePigClash:true,totalDislike:9,warnings:['會出意外'],sacrificeNote:'注定辛苦',clashNote:'會有小人'};
  const a=c.analyzeNameQuestion(null,baseline,{type:'career'});
  const b=c.analyzeNameQuestion(null,loaded,{type:'career'});
  assert.equal(a.score,b.score);
  assert.equal(b.score,50);
  assert(!/會有小人|會出意外|注定辛苦|付出多回報少/.test(b.verdictFull));
  assert.match(b.yesNoAnswer,/無法判定/);
  c.S.nameResult=null;c.S.zodiacNameResult=loaded;
  const speech=c.talkName('career');
  assert.match(speech,/流派標記/);
  assert(!/會有小人|注定辛苦|注意人際衝突和意外/.test(speech));
  assert.equal(outbound,0);
});
