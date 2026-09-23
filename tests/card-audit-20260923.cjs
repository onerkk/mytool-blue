'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {fixture}=require('./ritual-lifecycle-20260911.cjs');
const root=path.resolve(__dirname,'..');
const F=require(path.join(root,'JS/tarot-foundation.js'));
let checks=0;

function read(file){return fs.readFileSync(path.join(root,file),'utf8');}
function oracle(){
  const e=fixture(),records=Object.create(null);
  e.ctx.localStorage={
    getItem(key){return Object.hasOwn(records,key)?records[key]:null;},
    setItem(key,value){records[key]=String(value);this[key]=String(value);},
    removeItem(key){delete records[key];delete this[key];}
  };
  let deleted=0,posted=0;
  e.ctx.navigator.serviceWorker={getRegistrations(){deleted++;return Promise.resolve([]);}};
  e.ctx.caches={keys(){deleted++;return Promise.resolve([]);}};
  e.ctx.fetch=()=>{posted++;throw Error('Unexpected network call in prompt-only oracle');};
  const hook=`window.__audit={
    prepare:function(n,q){_poem=P[n-1];_qText=q;_qType=null;_holy=3;_phase='drawn';_getWrap().style.display='block';},
    confirm:function(){window._oracleViewPoem();},
    today:_oracleHasDrawnToday,
    same:function(q){return _oracleCheckLock(null,q);},
    reset:function(){window._oracleReset();},
    pending:function(q,n){_oracleSavePendingLock(null,q,n);},
    state:function(){return {number:_poem&&_poem.n,holy:_holy,question:_qText};}
  };})();`;
  vm.runInContext(read('JS/oracle.js').replace(/\}\)\(\);\s*$/,hook),e.ctx,{filename:'JS/oracle.js'});
  return {e,records,api:e.ctx.__audit,network:()=>({deleted,posted})};
}

// This test passes production methods real A/B/C questions, including a tail question,
// then checks the same branches are bound before drawing in both card readers.
for(const [q,expected] of [
  ['A：留在華新；B：轉職；C：專心經營蝦皮；這三種方案哪個好？',['留在華新','轉職','專心經營蝦皮']],
  ['方案是留在華新、轉職還是創業？',['留在華新','轉職','創業']],
  ['我可以從A、B、C三家公司中選擇哪一家？',['A','B','C']]
]){
  const plan=F.analyzeReadingQuestion(q),route=F.routeQuestion(q);
  assert.deepEqual(plan.options,expected);
  assert.equal(plan.mode,'multi_option');
  assert.equal(route.spreadId,'multi_option');
  assert.equal(route.methodPlan.count,9);
  assert.equal(route.methodPlan.branches.length,3);
  checks++;
}
assert.equal(F.analyzeReadingQuestion('他還是喜歡我嗎？').mode,'single');
assert.equal(F.analyzeReadingQuestion('留職還是離職？').mode,'binary');
assert.equal(F.routeQuestion('我有三個選擇，請幫我看').ready,false,'Unnamed options must be clarified before drawing');
checks++;

const lnCode=read('JS/lenormand.js').replace(/\}\)\(\);\s*$/,
  'window.__cardAudit={analyze:analyzeReadingQuestion,detect:_lnDetectSpread,plan:_lnBuildSpreadDef};})();');
const ln={console:{log(){}},window:{crypto:require('node:crypto').webcrypto,addEventListener(){}},
  document:{createElement(){return {setAttribute(){},appendChild(){}};},head:{appendChild(){}},getElementById(){return null;}},
  localStorage:{getItem(){return null;}},setTimeout(){},Math,Date,Uint32Array};
ln.window.window=ln.window;vm.createContext(ln);vm.runInContext(lnCode,ln);
for(const q of ['A：留在華新；B：轉職；C：創業；哪個好？','方案是留職、轉職還是創業？']){
  const route=ln.window.__cardAudit.detect(q),plan=ln.window.__cardAudit.plan(route.id,q);
  assert.equal(route.id,'branches');assert.equal(plan.branches.length,3);
  assert.equal(plan.count,9);assert.equal(plan.positions.length,9);
  checks++;
}

const o=oracle();
assert.deepEqual(o.network(),{deleted:0,posted:0});
assert.equal(o.api.today(),null);
o.api.pending('工作調整',12);
assert.equal(o.api.today(),null,'A pending lot is not a confirmed result');
o.api.prepare(12,'工作調整');o.api.confirm();
assert.equal(o.api.today().poemN,12,'Confirmation with optional question category persists');
assert.equal(o.api.same('工作調整').poemN,12);
assert(!Object.keys(o.records).some(key=>key.startsWith('oracle_pending:')));
o.api.reset();
assert.equal(o.api.same('工作調整').poemN,12,'Reset does not erase confirmed history');
assert.deepEqual(o.network(),{deleted:0,posted:0});
checks++;

for(const file of ['JS/shared/decision-parser.js','JS/shared/question-planner.js','JS/tarot-foundation.js','JS/lenormand.js','JS/oracle.js']){
  require('node:child_process').execFileSync(process.execPath,['--check',path.join(root,file)]);
}
console.log('card-audit: '+checks+' real routing and completed oracle flow checks passed.');
