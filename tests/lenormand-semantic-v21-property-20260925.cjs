'use strict';
const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('assert');
const root=path.join(__dirname,'..'),sourcePath=path.join(root,'JS','lenormand.js');
let code=fs.readFileSync(sourcePath,'utf8');
code=code.replace(/\}\)\(\);\s*$/, `window.__lnV21Test={analyze:_lnAnalyzeQuestion,detect:_lnDetectSpread,review:_lnReviewAnswerGranularity,validate:_lnValidateQuestion,shared:analyzeReadingQuestion,classify:classifyDecisionQuestion,cards:CARDS};})();`);
function stubNode(){return {style:{},appendChild(){},remove(){},setAttribute(){},getAttribute(){return null},querySelector(){return null},focus(){},select(){},setSelectionRange(){},innerHTML:'',textContent:'',isConnected:true,parentNode:null};}
const sandbox={console:{log(){},warn(){},error:console.error},window:{crypto:require('crypto').webcrypto,isSecureContext:true,addEventListener(){},JYShareCard:null},document:{createElement:stubNode,body:{appendChild(){}},head:{appendChild(){}},getElementById(){return null},querySelector(){return null},execCommand(){return true},referrer:''},navigator:{clipboard:{writeText(){return Promise.resolve()}}},localStorage:{getItem(){return null},setItem(){},removeItem(){}},sessionStorage:{getItem(){return null},setItem(){}},location:{search:''},alert(){},setTimeout(){},Promise,Uint32Array,Date,Math};
sandbox.window.window=sandbox.window;vm.createContext(sandbox);vm.runInContext(code,sandbox);const api=sandbox.window.__lnV21Test;
let checks=0;function ok(name,cond,detail=''){checks++;try{assert.ok(cond,detail)}catch(e){console.error('FAIL',name,detail);throw e}}
function sig(q){const a=api.analyze(q),s=a.questionPlan.semantic;return JSON.stringify({mode:a.questionPlan.mode,dims:s.topology.dimensions.slice().sort(),domains:s.topology.domains.slice().sort(),edges:s.graph.edges.map(e=>e.type).sort(),yes:a.isYesNo,hidden:a.hiddenStateClaim,future:a.futureActionClaim,spread:api.detect(q).id});}

// 1) Metamorphic invariance: politeness, spacing and punctuation must not change semantic topology.
const bases=[
  '今天統一發票會中多少',
  '公司有人暗戀我嗎？之後會告白嗎？',
  '為什麼生意卡住？我該怎麼改善？',
  '明天會收到通知嗎？',
  '我該升主管還是繼續當作業員？',
  '她喜歡我嗎？之後會主動聯絡嗎？',
  '這份工作何時會有結果？',
  '對方大概是什麼類型的人？'
];
for(const b of bases){
  const s0=sig(b);
  const vars=['請問'+b,'我想問，'+b,b.replace(/？/g,'?'),b.replace(/\s+/g,''),'  '+b+'  '];
  for(const v of vars)ok('metamorphic:'+b+' <= '+v,sig(v)===s0,`${s0} != ${sig(v)}`);
}

// 2) Time anchors never imply daily-reflection routing for concrete events.
const anchors=['今天','明天','後天','本週','下週','本月','下個月','今年','明年','年底前'];
const events=['會收到通知嗎','會通過審核嗎','會有結果嗎','能完成嗎','會成交嗎'];
for(const t of anchors)for(const e of events){const q=t+e,a=api.analyze(q);ok('time-anchor-not-daily:'+q,a.questionPlan.daily===false);ok('generic-outcome-three:'+q,api.detect(q).id==='three',api.detect(q).id);}

// 3) Amount grammar: many surface variants collapse to the same amount/occurrence semantics.
const moneySubjects=['統一發票','發票','抽獎','彩券','威力彩','大樂透'];
const amountForms=['會中多少','能中多少','可以中多少','可能中多少','會拿到多少錢','能得到多少獎金'];
for(const subj of moneySubjects)for(const form of amountForms){const q='今天'+subj+form,a=api.analyze(q);ok('amount:'+q,a.asksExactAmount===true);ok('amount-gate:'+q,a.capability.occurrenceGate===true,JSON.stringify(a.capability));ok('amount-resolution:'+q,a.capability.resolution==='qualitative_band');ok('amount-route:'+q,api.detect(q).id==='three',api.detect(q).id);}

// 4) Unit controls measurement type even in money context.
const countUnits=['張','次','筆','份','件'];
for(const u of countUnits){const q='今天統一發票會中多少'+u,a=api.analyze(q);ok('count:'+q,a.asksExactCount===true);ok('count-not-amount:'+q,a.asksExactAmount===false,JSON.stringify(a.questionPlan.semantic));}

// 5) Open-class yes/no: unseen predicates still route by grammar, not topic keyword tables.
const openPredicates=['方案甲會過關嗎','這件安排會落實嗎','明天會出現轉折嗎','這個流程能跑完嗎','對方會改口嗎','事情會定案嗎','申請會被接受嗎','機器會恢復嗎'];
for(const q of openPredicates){const a=api.analyze(q);ok('open-yesno:'+q,a.isYesNo===true,JSON.stringify(a.questionPlan.semantic));ok('open-route:'+q,api.detect(q).id==='three',api.detect(q).id);}

// 6) Compositional dependency: private state -> future action with omitted subject stays one chain.
const subjects=['她','他','女同事','同事','有人'];
const states=['喜歡我','欣賞我','在乎我','對我有好感','對我有意思','暗戀我','信任我'];
const actions=['告白','表白','主動聯絡我','追求我','約我','坦白心意'];
const cont=['未來','之後','接下來','往後'];
for(const s of subjects)for(const st of states)for(const a of actions){
  const q=`${s}${st}嗎？${cont[(states.indexOf(st)+actions.indexOf(a))%cont.length]}會${a}嗎？`,x=api.analyze(q);
  ok('dep-single:'+q,x.questionPlan.mode==='single',JSON.stringify(x.questionPlan));
  ok('dep-gate:'+q,x.dependencyGate===true,JSON.stringify(x.dependencyEdges));
  ok('dep-edge:'+q,x.dependencyEdges.some(e=>e.type==='hidden_state_to_future_action_same_actor'));
  ok('dep-seven:'+q,api.detect(q).id==='seven',api.detect(q).id);
}

// 7) A real topic switch must break inheritance.
const switches=[
  ['她喜歡我嗎？','明年工作會升遷嗎？'],
  ['有人暗戀我嗎？','今年財運如何？'],
  ['同事欣賞我嗎？','家人健康如何？'],
  ['他信任我嗎？','下個月考試結果如何？']
];
for(const [a,b] of switches){const q=a+b,x=api.analyze(q);ok('topic-switch:'+q,x.questionPlan.mode==='multi_question'&&x.dependencyGate===false,JSON.stringify(x.questionPlan));}

// 8) Diagnostic bundles remain one event and route to context-rich five-card line.
const roots=['生意卡住','合作沒進展','工作一直不順','計畫延遲','事情反覆失敗'];
for(const r of roots){
  const qs=[`為什麼${r}？我該怎麼改善？`,`我想知道${r}的原因，接下來怎麼做？`];
  for(const q of qs){const x=api.analyze(q);ok('diagnostic-single:'+q,x.questionPlan.mode==='single',JSON.stringify(x.questionPlan));ok('diagnostic-five:'+q,api.detect(q).id==='five',api.detect(q).id);}
}

// 9) Daily reflection is structural and distinct from event questions.
for(const q of ['今天有什麼提醒','今日整體運勢','每日指引','日常提醒']){const x=api.analyze(q);ok('daily:'+q,x.questionPlan.daily===true);ok('daily-two:'+q,api.detect(q).id==='two',api.detect(q).id);}

// 10) Post-answer precision audit remains method-level, not prompt wording.
for(const [q,answer,codeExpected] of [
  ['今天統一發票會中多少','你會中200元。','EXACT_AMOUNT_OVERREACH'],
  ['今天統一發票會中多少張','你會中3張。','EXACT_COUNT_OVERREACH'],
  ['成功率多少','大約70%。','EXACT_PROBABILITY_OVERREACH']
]){const r=api.review(q,answer);ok('review:'+q,r.ok===false&&r.issues.some(i=>i.code===codeExpected),JSON.stringify(r));}

// 11) Fuzzed formatting: insert benign spaces around punctuation and keep the same topology.
const fuzzBases=['她喜歡我嗎？之後會告白嗎？','今天統一發票會中多少','為什麼工作卡住？我該怎麼改善？'];
for(const b of fuzzBases){const s0=sig(b);for(let i=0;i<100;i++){let v=b.replace(/？/g,i%2?' ? ':'？').replace(/，/g,i%3?', ':'，');if(i%4===0)v='請問 '+v;if(i%5===0)v=v+' ';ok('fuzz:'+i+':'+b,sig(v)===s0,`${s0} != ${sig(v)}`);}}


// 12) Coordinated actors are parsed compositionally; objects mentioned in the predicate do not become extra branches.
const actorPairs=[['同事','女友閨蜜'],['小美','小雅'],['主管A','主管B'],['朋友甲','朋友乙']];
const connectors=['與','和','跟','及'], distributives=['各自','分別'];
for(const [a,b] of actorPairs)for(const c of connectors)for(const d of distributives){const q=`${a}${c}${b}${d}對我有好感嗎？`,x=api.shared(q);ok('coord-mode:'+q,x.mode==='multi_question',JSON.stringify(x));ok('coord-count:'+q,x.branches.length===2,JSON.stringify(x.branches));ok('coord-labels:'+q,x.branches[0].entity===a&&x.branches[1].entity===b,JSON.stringify(x.branches));}

// 13) Same-role labels and arbitrary names remain distinct subjects across clauses.
for(const [a,b] of [['同事甲','同事乙'],['客戶A','客戶B'],['主管一','主管二'],['小美','小雅']]){
  const q=`${a}有好感嗎？${b}會主動嗎？`,x=api.shared(q);ok('labels-multi:'+q,x.mode==='multi_question',JSON.stringify(x));ok('labels-two:'+q,x.branches.length===2,JSON.stringify(x.branches));
}

// 14) Shared actor/domain is not enough to merge independent propositions; only a semantic dependency may join them.
for(const q of ['她會結婚嗎？她會搬家嗎？','工作會升遷嗎？工作會調職嗎？','女友願意結婚嗎？女友願意搬家嗎？']){const x=api.shared(q);ok('independent-propositions:'+q,x.mode==='multi_question',JSON.stringify(x));}
for(const q of ['她喜歡我嗎？之後會告白嗎？','工作能順利嗎？何時？有什麼阻礙？','她喜歡我嗎？為什麼？我該怎麼做？']){const x=api.shared(q);ok('dependent-chain:'+q,x.mode==='single',JSON.stringify(x));ok('dependent-edge:'+q,x.dependencies.length>=1,JSON.stringify(x.dependencies));}

// 15)「如何」is disambiguated: descriptive state questions are outcomes; procedural constructions are advice.
for(const q of ['財運如何？','考試結果如何？','工作狀況如何？','感情發展如何？']){const x=api.shared(q);ok('how-state-no-advice:'+q,!x.semantic.topology.dimensions.includes('advice'),JSON.stringify(x.semantic));}
for(const q of ['我該如何改善工作？','如何升遷？','要怎麼處理合作問題？','可以如何推進計畫？']){const x=api.shared(q);ok('how-procedure-advice:'+q,x.semantic.topology.dimensions.includes('advice'),JSON.stringify(x.semantic));}

// 16) More than six independent branches fail closed rather than silently merging or truncating.
for(const q of ['同事甲好嗎？同事乙好嗎？前任好嗎？女友好嗎？主管好嗎？客戶好嗎？朋友好嗎？','A：一；B：二；C：三；D：四；E：五；F：六；G：七？']){const x=api.shared(q);ok('overflow-not-ready:'+q,x.ready===false,JSON.stringify(x));}

// 17) Ambiguous pronoun coreference fails closed; uniquely resolvable pronouns remain usable.
for(const q of ['小美和小雅會參加嗎？她之後會聯絡我嗎？','兩位同事會來嗎？她之後會告白嗎？']){const x=api.shared(q);ok('ambiguous-coref-status:'+q,x.semantic.status==='ambiguous'||x.ready===false,JSON.stringify(x));}
for(const q of ['我和女友會結婚嗎？她之後會搬家嗎？','女同事喜歡我嗎？她之後會告白嗎？']){const x=api.shared(q);ok('resolvable-coref:'+q,x.semantic.status!=='ambiguous'&&x.ready===true,JSON.stringify(x));}

// 18) Measurement ontology remains stable under paraphrase and unit substitution.
const amountStems=['會中多少','能拿多少錢','可得多少獎金','會拿到多少'];
for(const subj of ['發票','彩券','抽獎'])for(const stem of amountStems){const q=`${subj}${stem}？`,x=api.analyze(q);ok('measure-amount:'+q,x.asksExactAmount&&!x.asksExactCount,JSON.stringify(x.capability));}
for(const unit of ['張','次','筆','份','件','個']){const q=`發票會中多少${unit}？`,x=api.analyze(q);ok('measure-count:'+q,x.asksExactCount&&!x.asksExactAmount,JSON.stringify(x.capability));}

// 19) Deterministic stability: repeated compilation of the same question is byte-equivalent.
for(const q of bases.concat(['同事與女友閨蜜各自有交往機會嗎？','她喜歡我嗎？為什麼？我該怎麼做？','今天統一發票會中多少'])){const a=JSON.stringify(api.shared(q));for(let i=0;i<20;i++)ok('deterministic:'+i+':'+q,JSON.stringify(api.shared(q))===a);}

console.log(`Lenormand semantic v21 property/metamorphic suite: ${checks} checks PASS`);

// 20) Decision grammar is type-stable: actor, options and route are independent fields.
const decisionActors=['我','我們'];
const decisionPairs=[['留下','離職'],['接受A公司','留在B公司'],['去台北','去高雄'],['買iPhone','買Samsung']];
for(const actor of decisionActors)for(const [l,r] of decisionPairs){
  const q=`${actor}應該${l}還是${r}？`,x=api.analyze(q),sem=x.questionPlan.semantic;
  ok('decision-binary:'+q,x.isChoice===true&&x.questionPlan.mode==='binary',JSON.stringify(x.questionPlan));
  ok('decision-options:'+q,x.choiceA&&x.choiceB,JSON.stringify([x.choiceA,x.choiceB]));
  ok('decision-subject:'+q,sem.clauses[0].subjectRef===actor,JSON.stringify(sem.clauses[0]));
  ok('decision-route:'+q,api.detect(q).id==='choice',api.detect(q).id);
}

// 21) Same-event competing explanations are hypotheses, never user action choices.
for(const q of ['她是不是很忙還是沒興趣？','她喜歡我還是只是禮貌？','他是觀望還是不想繼續？','對方是在生氣還是在隱瞞？']){
  const x=api.analyze(q);
  ok('hypothesis-kind:'+q,x.hypothesisChoice===true&&x.isChoice===false,JSON.stringify(x.questionPlan));
  ok('hypothesis-route:'+q,api.detect(q).id==='five',api.detect(q).id);
}

// 22) Positive-vs-negative wording is one outcome proposition, not a hypothesis pair.
for(const q of ['他會聯絡還是不聯絡？','她喜歡我還是不喜歡我？','這件事能成功還是不能成功？']){
  const d=api.classify(q),x=api.analyze(q);
  ok('polarity-kind:'+q,d.kind==='outcome_polarity',JSON.stringify(d));
  ok('polarity-not-choice:'+q,!x.isChoice&&!x.hypothesisChoice,JSON.stringify(x));
  const expected=x.isInner?'five':'three';
  ok('polarity-route:'+q,api.detect(q).id===expected,api.detect(q).id);
}

// 23) Metalinguistic correction removes the rejected question from active semantics.
for(const q of ['不是在問何時復合，而是他為什麼不回訊息？','並非想問多少錢，而是這件事會不會成交？','不想問誰喜歡我，而是我該怎麼改善人際？']){
  const x=api.analyze(q),n=x.questionPlan.normalizedQuestion;
  ok('correction-ready:'+q,x.questionPlan.ready===true,JSON.stringify(x.questionPlan));
  ok('correction-no-rejected-timing:'+q,!(/何時復合/.test(n)),n);
}
const corrected=api.analyze('不是在問何時復合，而是他為什麼不回訊息？');
ok('correction-role',corrected.asksWhy===true&&corrected.asksWhen===false,JSON.stringify(corrected));
ok('correction-route',api.detect('不是在問何時復合，而是他為什麼不回訊息？').id==='five');

// 24) Materially incomplete input fails closed instead of silently inventing branches.
for(const q of ['我應該留下還是？','A：留職；B：？','我要二選一']){
  const r=api.detect(q);
  ok('fail-closed-incomplete:'+q,r.id===null,JSON.stringify(r));
}

// 25) Semantic IR invariants hold across a generated corpus.
const genSubjects=['我','她','他','女同事','主管A','客戶B'];
const genEvents=['會聯絡嗎','會回覆嗎','會成交嗎','會改變嗎','會接受嗎','會出現轉折嗎'];
const genTimes=['','今天','明天','下週','下個月'];
for(const s of genSubjects)for(const e of genEvents)for(const t of genTimes){
  const q=`${t}${s}${e}？`,p=api.shared(q),sem=p.semantic;
  ok('ir-ready:'+q,p.ready===true,JSON.stringify(p));
  ok('ir-one-component:'+q,sem.topology.componentCount===1,JSON.stringify(sem.topology));
  ok('ir-node-clause-count:'+q,sem.graph.nodes.length===sem.clauses.length,JSON.stringify(sem.graph));
  ok('ir-route-exists:'+q,!!api.detect(q).id,JSON.stringify(api.detect(q)));
}

// 26) The 36-card method facts remain structural invariants, not question heuristics.
ok('deck-36',api.cards.length===36);
ok('deck-unique-id',new Set(api.cards.map(c=>c.id)).size===36);
ok('deck-contiguous-id',api.cards.every((c,i)=>c.id===i+1));

console.log(`Lenormand semantic v21 extended suite total: ${checks} checks PASS`);
