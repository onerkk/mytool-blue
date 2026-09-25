'use strict';
// Golden Dawn / Mathers Opening of the Key source-fidelity regressions.
// Runtime only: no prompt wording assertions and no external AI calls.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {fixture,load}=require('./ritual-lifecycle-20260911.cjs');
const ROOT=path.resolve(__dirname,'..');
const read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
const plain=x=>JSON.parse(JSON.stringify(x));

function environment(){
  const e=fixture();
  e.ctx.console={log(){},warn(){},error(){}};
  ['reading-quality','picker-core','tarot-foundation','golden-dawn-tarot','tarot-semantic-engine','tarot','tarot-reading'].forEach(f=>load(e,f));
  vm.runInContext(read('JS/tarot_upgrade.js'),e.ctx);
  e.ctx.__deck=vm.runInContext('TAROT',e.ctx);
  return e;
}
function by(e,suit,rank){
  const c=e.ctx.__deck.find(x=>x.suit===suit&&String(x.rank)===String(rank));
  assert(c,`missing ${suit}/${rank}`); return c;
}
let passed=0;
function test(name,fn){fn();passed++;console.log('PASS '+name);}

test('majority means unique preponderance/plurality, not an impossible >50% threshold',()=>{
  const e=environment();
  let id=1000;
  const cards=[];
  for(let i=0;i<12;i++)cards.push({id:id++,suit:'major',rank:'major'});
  for(const [suit,n] of [['wand',7],['cup',7],['sword',5],['pent',6]]) for(let i=0;i<n;i++) cards.push({id:id++,suit,rank:String((i%9)+2),num:(i%9)+2});
  assert.equal(cards.length,37);
  const m=plain(e.ctx.JYGoldenDawn.majorityObservations(cards));
  assert.equal(m.dominantClass,'keys');
  assert.equal(m.dominantClassCount,12);
  assert(m.observations.some(x=>x.includes('大牌多數')));
});

test('fourth operation majority/set observation includes the central significator',()=>{
  const e=environment();
  const pages=e.ctx.__deck.filter(c=>c.rank==='page');
  assert.equal(pages.length,4);
  const sig=pages[0], others=pages.slice(1);
  const rest=e.ctx.__deck.filter(c=>!pages.some(p=>p.id===c.id));
  // Significator first, all other Pages inside the following 36-card ring.
  const deck=[sig].concat(others,rest);
  assert.equal(deck.length,78); assert.equal(new Set(deck.map(c=>c.id)).size,78);
  const op=plain(e.ctx.ootkOp4(deck,sig.id,'mathers_continuous'));
  assert.equal(op.activeCards.length,37);
  assert.equal(op.ringCards.length,36);
  assert.equal(op.bookTMajorities.rankCounts.page,4);
  assert(op.bookTMajorities.observations.some(x=>x.includes('四張 Princesses／Pages')));
});

test('horseshoe end cards wrap to the opposite end for elemental dignity',()=>{
  const e=environment();
  const first=by(e,'wand','2'), middle=by(e,'cup','2'), last=by(e,'sword','2');
  const d=plain(e.ctx.ootkDignities([{card:first,position:0}],[first,middle,last],'horseshoe'))[0];
  assert.equal(d.leftCard,last.n||last.name);
  assert.equal(d.rightCard,middle.n||middle.name);
  assert.equal(d.fullDignity,true);
  assert.equal(d.basis,'actual_horseshoe_order');
});

test('first-operation opening cards are judged against their YHVH pile elements',()=>{
  const e=environment();
  assert.equal(e.ctx.ootkOpeningPileDignity('fire',by(e,'wand','2')).relation,'strengthen');
  assert.equal(e.ctx.ootkOpeningPileDignity('air',by(e,'pent','2')).relation,'weaken');
  assert.equal(e.ctx.ootkOpeningPileDignity('earth',by(e,'cup','2')).relation,'friendly');
  const sig=by(e,'wand','page');
  const op=plain(e.ctx.ootkOp1(e.ctx.__deck.map(c=>({...c,ootkInverted:false,isUp:true})),sig.id,'mathers_continuous'));
  assert.equal(op.openingCards.length,4);
  assert.equal(op.openingDignities.length,4);
  assert(op.openingCards.every(x=>x.pileDignity&&x.pileDignity.basis==='YHVH_pile_element'));
});

test('physical inversion flips court facing/count direction without changing card meaning',()=>{
  const e=environment();
  const base=by(e,'wand','king');
  const upright={...base,ootkInverted:false};
  const inverted={...base,ootkInverted:true};
  const d1=e.ctx.ootkGetCountDirection(upright), d2=e.ctx.ootkGetCountDirection(inverted);
  assert.equal(d2,-d1);
  const f1=e.ctx.ootkGetPhysicalFacing(upright), f2=e.ctx.ootkGetPhysicalFacing(inverted);
  assert(['left','right'].includes(f1));
  assert.equal(f2,f1==='left'?'right':'left');
  assert.equal(e.ctx.JYGoldenDawn.profile(upright).core,e.ctx.JYGoldenDawn.profile(inverted).core);
});

test('Mathers counting still uses Ace=5 while the alternate Liber profile retains its own rule',()=>{
  const e=environment();
  const cards=[by(e,'wand','ace'),by(e,'wand','2'),by(e,'cup','2'),by(e,'sword','2'),by(e,'pent','2')].map(c=>({...c,ootkInverted:false,isUp:true}));
  const m=plain(e.ctx.ootkCounting(cards,0,'mathers_continuous',1));
  const l=plain(e.ctx.ootkCounting(cards,0,'liber78_validation',1));
  assert.equal(m.path[0].countValue,5);
  assert.equal(l.path[0].countValue,11);
});

console.log(`ootk-source-fidelity-20260925: ${passed} groups passed.`);
