'use strict';

const fs = require('fs');
const vm = require('vm');
const path = require('path');
const assert = require('assert');

const root = path.join(__dirname, '..');
const sourcePath = path.join(root, 'JS', 'lenormand.js');
let code = fs.readFileSync(sourcePath, 'utf8');
code = code.replace(/\}\)\(\);\s*$/, `window.__lnV19Test={
  analyze:_lnAnalyzeQuestion,
  detect:_lnDetectSpread,
  recommend:_lnRecommendSpread,
  validate:_lnValidateQuestion,
  capability:_lnCapabilityProfile,
  review:_lnReviewAnswerGranularity,
  build:buildPrompt,
  cards:CARDS,
  classify:classifyDecisionQuestion,
  sharedAnalyze:analyzeReadingQuestion
};})();`);

function stubNode() {
  return {
    style:{}, appendChild(){}, remove(){}, setAttribute(){}, getAttribute(){return null;},
    querySelector(){return null;}, focus(){}, select(){}, setSelectionRange(){},
    innerHTML:'', textContent:'', isConnected:true, parentNode:null
  };
}

const sandbox = {
  console:{log(){},warn(){},error:console.error},
  window:{crypto:require('crypto').webcrypto,isSecureContext:true,addEventListener(){},JYShareCard:null},
  document:{createElement:stubNode,body:{appendChild(){}},head:{appendChild(){}},getElementById(){return null;},querySelector(){return null;},execCommand(){return true;},referrer:''},
  navigator:{clipboard:{writeText(){return Promise.resolve();}}},
  localStorage:{getItem(){return null;},setItem(){},removeItem(){}},
  sessionStorage:{getItem(){return null;},setItem(){}},
  location:{search:''}, alert(){}, setTimeout(){}, Promise, Uint32Array, Date, Math
};
sandbox.window.window=sandbox.window;
vm.createContext(sandbox);
vm.runInContext(code,sandbox);
const api=sandbox.window.__lnV19Test;

let pass=0;
function check(name, cond, detail='') {
  try { assert.ok(cond, detail); pass++; }
  catch (e) { console.error(`FAIL ${name}${detail?' — '+detail:''}`); throw e; }
}
function spread(q){return api.detect(q).id;}

// A. Exact-amount semantics: wording variants must resolve identically.
for (const q of [
  '今天我統一發票會中多少',
  '今天是9月25日統一發票開獎 我可以中多少?',
  '我今天中獎金額是多少',
  '這次獎金多少',
  '我這月營業額會是多少元',
  '今天統一發票我能拿到多少錢'
]) {
  const a=api.analyze(q);
  check(`amount detected: ${q}`, a.asksExactAmount===true, JSON.stringify(a.capability));
  check(`amount resolution band: ${q}`, a.capability.resolution==='qualitative_band', JSON.stringify(a.capability));
  check(`amount route not daily two-card: ${q}`, spread(q)!=='two', spread(q));
}

// B. Lottery amount is a compound event: occurrence first, magnitude second.
for (const q of ['今天我統一發票會中多少','今天是9月25日統一發票開獎 我可以中多少?']) {
  const a=api.analyze(q);
  check(`occurrence gate amount: ${q}`, a.asksOccurrenceThenAmount===true && a.capability.occurrenceGate===true, JSON.stringify(a.capability));
  check(`conditional amount intent: ${q}`, a.capability.intent==='conditional_amount', a.capability.intent);
}
const confirmed=api.analyze('我已經中獎，金額是多少');
check('confirmed occurrence skips occurrence gate', confirmed.asksExactAmount===true && confirmed.capability.occurrenceGate===false, JSON.stringify(confirmed.capability));

// C. Counts must not be misread as money amounts, and prospective counts use occurrence gate.
const count=api.analyze('今天我統一發票會中多少張');
check('count detected', count.asksExactCount===true, JSON.stringify(count));
check('count not amount', count.asksExactAmount===false, JSON.stringify(count));
check('prospective count occurrence gate', count.asksOccurrenceThenCount===true && count.capability.occurrenceGate===true, JSON.stringify(count.capability));
check('conditional count intent', count.capability.intent==='conditional_count', count.capability.intent);

// D. “今天” is only a time anchor unless the user explicitly asks for a daily reflection.
for (const q of ['今天有什麼提醒','今日運勢提醒','今天的日常指引']) {
  const a=api.analyze(q);
  check(`real daily reflection: ${q}`, a.questionPlan.daily===true, JSON.stringify(a.questionPlan));
  check(`daily reflection routes two: ${q}`, spread(q)==='two', spread(q));
}
for (const q of ['今天會收到通知嗎','今天我統一發票會中多少','今天這份工作會錄取嗎']) {
  const a=api.analyze(q);
  check(`concrete today event not daily: ${q}`, a.questionPlan.daily===false, JSON.stringify(a.questionPlan));
}

// E. Context routing for one event must stay one event.
check('why+how single issue -> five', spread('為什麼生意卡住？我該怎麼改善？')==='five', spread('為什麼生意卡住？我該怎麼改善？'));
check('result+obstacle linked -> five', spread('這份工作會錄取嗎？卡在哪裡？')==='five', spread('這份工作會錄取嗎？卡在哪裡？'));
check('hidden state -> five', spread('公司有異性暗戀我嗎？')==='five', spread('公司有異性暗戀我嗎？'));
check('simple positive-vs-negative outcome -> three', spread('他會聯絡還是不聯絡？')==='three', spread('他會聯絡還是不聯絡？'));
const linked=api.analyze('為什麼生意卡住？我該怎麼改善？');
check('why+how shape is contextual, not false multi-aspect', linked.questionShape==='需要脈絡的單一議題', linked.questionShape);

// F. Decision parser must handle natural Chinese shared-verb choices without corrupting hypotheses.
for (const q of ['工作還是創業比較好？','買iPhone還是Samsung？','去台北還是高雄發展？','留職還是離職？','我該升主管還是繼續當作業員？','A或B哪個比較好？']) {
  const d=api.classify(q);
  check(`binary choice: ${q}`, d.kind==='binary' && !!d.left && !!d.right, JSON.stringify(d));
}
const buy=api.classify('買iPhone還是Samsung？');
check('shared verb inherited on option B', /買/.test(buy.right) && /Samsung/i.test(buy.right), JSON.stringify(buy));
const geo=api.classify('去台北還是高雄發展？');
check('location choice inherited', /台北/.test(geo.left) && /高雄/.test(geo.right), JSON.stringify(geo));
check('hypothesis is not choice', api.classify('他會聯絡還是不聯絡？').kind!=='binary', JSON.stringify(api.classify('他會聯絡還是不聯絡？')));
check('還是 adverb is not choice', api.classify('他還是喜歡我嗎？').kind!=='binary', JSON.stringify(api.classify('他還是喜歡我嗎？')));
check('3-option question branches', api.sharedAnalyze('A、B、C三個方案哪個比較好？').mode==='multi_option', JSON.stringify(api.sharedAnalyze('A、B、C三個方案哪個比較好？')));

// G. Capability resolution is structured engine output rather than exact numeric invention.
const normal=api.analyze('我和主管目前關係如何');
check('ordinary query has no numeric capability restriction', normal.capability.exactNumericSupported===null, JSON.stringify(normal.capability));
const amount=api.analyze('今天我統一發票會中多少');
check('amount exact numeric unsupported by method layer', amount.capability.exactNumericSupported===false, JSON.stringify(amount.capability));
check('amount tasks ordered occurrence then band', amount.capability.tasks[0].includes('先判事件') && amount.capability.tasks[1].includes('相對幅度'), JSON.stringify(amount.capability.tasks));

// H. Post-answer engine audit catches over-precision without blocking qualitative output.
let r=api.review('今天我統一發票會中多少','你會中200元。');
check('review catches exact money overreach', r.ok===false && r.issues.some(x=>x.code==='EXACT_AMOUNT_OVERREACH'), JSON.stringify(r));
r=api.review('今天我統一發票會中多少','牌面偏向不中；若有收穫也偏小額。');
check('review allows qualitative amount band', r.ok===true, JSON.stringify(r));
r=api.review('成功率百分之幾？','成功率大約70%。');
check('review catches probability overreach', r.ok===false && r.issues.some(x=>x.code==='EXACT_PROBABILITY_OVERREACH'), JSON.stringify(r));
r=api.review('今天我統一發票會中多少張','我看會中3張。');
check('review catches exact count overreach', r.ok===false && r.issues.some(x=>x.code==='EXACT_COUNT_OVERREACH'), JSON.stringify(r));

// I. Prompt receives only structured engine analysis, not a newly-added prose prohibition.
const cards=[api.cards[2],api.cards[10],api.cards[33]];
const prompt=api.build('今天我統一發票會中多少',cards,'three',null,'male');
check('prompt exposes structured engine resolution', prompt.includes('引擎問題解析：') && prompt.includes('"resolution":"qualitative_band"'), 'engine metadata missing');
check('no hardcoded exact-amount prohibition added', !/禁止[^\n]{0,30}(?:精確金額|報金額)|不得[^\n]{0,30}(?:精確金額|報出.*元)/.test(prompt), 'found generic prompt restriction');

// J. Generated/shared source integrity and cache/version wiring.
check('root and JS lenormand identical', fs.readFileSync(path.join(root,'lenormand.js'),'utf8')===fs.readFileSync(sourcePath,'utf8'));
const index=fs.readFileSync(path.join(root,'index.html'),'utf8');
check('index loads v19 cache token', index.includes('JS/lenormand.js?v=20260925ln19'));
check('public API v19', sandbox.window.JYLenormand && sandbox.window.JYLenormand.version==='19.0.0', JSON.stringify(sandbox.window.JYLenormand&&sandbox.window.JYLenormand.version));

console.log(`Lenormand v19 engine rootfix: ${pass} checks PASS`);
