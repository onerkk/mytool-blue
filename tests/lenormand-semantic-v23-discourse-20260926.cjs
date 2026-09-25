'use strict';
const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('assert');
const root=path.join(__dirname,'..'),sourcePath=path.join(root,'JS','lenormand.js');
let code=fs.readFileSync(sourcePath,'utf8');
code=code.replace(/\}\)\(\);\s*$/,`window.__lnV23Test={analyze:_lnAnalyzeQuestion,detect:_lnDetectSpread,instantiate:_lnBuildSpreadDef,review:_lnReviewAnswerGranularity,shared:analyzeReadingQuestion,classify:classifyDecisionQuestion};})();`);
function stubNode(){return {style:{},appendChild(){},remove(){},setAttribute(){},getAttribute(){return null},querySelector(){return null},focus(){},select(){},setSelectionRange(){},innerHTML:'',textContent:'',isConnected:true,parentNode:null};}
const sandbox={console:{log(){},warn(){},error:console.error},window:{crypto:require('crypto').webcrypto,isSecureContext:true,addEventListener(){},JYShareCard:null},document:{createElement:stubNode,body:{appendChild(){}},head:{appendChild(){}},getElementById(){return null},querySelector(){return null},execCommand(){return true},referrer:''},navigator:{clipboard:{writeText(){return Promise.resolve()}}},localStorage:{getItem(){return null},setItem(){},removeItem(){}},sessionStorage:{getItem(){return null},setItem(){}},location:{search:''},alert(){},setTimeout(){},Promise,Uint32Array,Date,Math};
sandbox.window.window=sandbox.window;vm.createContext(sandbox);vm.runInContext(code,sandbox);const api=sandbox.window.__lnV23Test;
let checks=0;function ok(name,cond,detail=''){checks++;try{assert.ok(cond,detail)}catch(e){console.error('FAIL',name,detail);throw e}}
function plan(q){return api.shared(q)}
function sig(q){const p=plan(q),s=p.semantic;return JSON.stringify({mode:p.mode,branches:p.branches.map(b=>b.question),q:s.topology.questionCount,c:s.topology.contextCount,e:s.topology.exampleCount,deps:p.dependencies.map(x=>x.type),links:p.discourseLinks.map(x=>x.type),actors:p.branches.map(b=>b.entity)});}

// A. Root regression: reported question + example + proposition coreference + independent future action.
{
 const q='女友跟我愛愛時，問我可以叫我其他稱號嗎？例如大哥 大叔。這是因為她需要性幻想嗎？那未來是否會同意一起3p，兩女一男。';
 const p=plan(q),a=api.analyze(q),f=p.clauses;
 ok('root-v4',p.version==='4.0.0'&&p.semantic.version==='4.0.0',JSON.stringify(p));
 ok('root-two-real-questions',p.semantic.topology.questionCount===2,JSON.stringify(p.semantic.topology));
 ok('root-context-count',p.semantic.topology.contextCount===1,JSON.stringify(p.semantic.topology));
 ok('root-example-count',p.semantic.topology.exampleCount===1,JSON.stringify(p.semantic.topology));
 ok('root-first-reported-context',f[0].illocution==='context'&&f[0].reportedSpeech&&f[0].reportedSpeech.speakerRef==='女友'&&f[0].reportedSpeech.addresseeRef==='我',JSON.stringify(f[0]));
 ok('root-example-not-branch',f[1].illocution==='example'&&f[1].exampleRef==='C1',JSON.stringify(f[1]));
 ok('root-proposition-coref',f[2].propositionRef==='C1'&&f[2].causalHypothesis===true,JSON.stringify(f[2]));
 ok('root-pronoun-resolved',f[2].subjectRef==='女友'&&f[3].subjectRef==='女友',JSON.stringify(f));
 ok('root-objects-separated',f[2].objectRef==='性幻想'&&/3p/i.test(f[3].objectRef||''),JSON.stringify(f));
 ok('root-no-false-dependency',p.dependencies.length===0&&a.dependencyGate===false,JSON.stringify(p.dependencies));
 ok('root-independent-branches',p.mode==='multi_question'&&p.branches.length===2,JSON.stringify(p.branches));
 ok('root-branch1',p.branches[0].question.includes('性幻想'),JSON.stringify(p.branches));
 ok('root-branch2',/3p/i.test(p.branches[1].question),JSON.stringify(p.branches));
 ok('root-route-branches',api.detect(q).id==='branches',JSON.stringify(api.detect(q)));
 const spread=api.instantiate('branches',q);
 ok('root-six-cards',spread.count===6&&spread.branches.length===2,JSON.stringify(spread));
 ok('root-distinct-position-labels',spread.positions[0]!==spread.positions[3]&&spread.positions[0].includes('性幻想')&&/3p/i.test(spread.positions[3]),JSON.stringify(spread.positions));
 ok('root-capability-multi',a.capability.intent==='multi_question'&&a.capability.resolution==='per_branch_symbolic',JSON.stringify(a.capability));
}

// B. A reported yes/no sentence is context, not automatically the user's question.
for(const [q,ctxFrag,qFrag] of [
 ['女友問我可以叫別的稱號嗎？這代表她喜歡角色扮演嗎？','叫別的稱號','角色扮演'],
 ['客戶問我可不可以延後交貨？這是因為他還沒準備好嗎？','延後交貨','準備好'],
 ['主管問我願不願意接新工作？這代表他想培養我嗎？','接新工作','培養我'],
 ['朋友問我能不能一起旅行？這是因為她想跟我單獨相處嗎？','一起旅行','單獨相處']
]){
 const p=plan(q),f=p.clauses;
 ok('reported-context:'+q,f[0].illocution==='context'&&!!f[0].reportedSpeech,JSON.stringify(f));
 ok('reported-one-query:'+q,p.semantic.topology.questionCount===1&&p.branches.length===1,JSON.stringify(p));
 ok('reported-content:'+q,(f[0].reportedSpeech.content||'').includes(ctxFrag),JSON.stringify(f[0].reportedSpeech));
 ok('reported-query-kept:'+q,p.branches[0].question.includes(qFrag),JSON.stringify(p.branches));
}

// C. Examples/appositions never consume their own reading line.
for(const q of [
 '她說想換個稱呼。例如老師、學長。這表示她想玩角色扮演嗎？',
 '廠商提供幾種補償方案。例如退貨、換貨、折價。哪一種處理方向較有利？',
 '主管提到可能調整工作。例如換線、換班。這代表我近期會被調動嗎？'
]){
 const p=plan(q);
 ok('example-detected:'+q,p.semantic.topology.exampleCount===1,JSON.stringify(p.semantic.topology));
 ok('example-not-branch:'+q,p.branches.every(b=>!/^例如|^比如|^譬如/.test(b.question)),JSON.stringify(p.branches));
}

// D. Proposition anaphora is not entity anaphora.
for(const q of [
 '他突然不回訊息了。這是因為他生氣嗎？',
 '公司把我的工作內容改了。這代表之後還會再調整嗎？',
 '廠商連續兩次延遲出貨。這是因為產能不足嗎？'
]){
 const p=plan(q),qs=p.clauses.filter(f=>f.isQuestion);
 ok('proposition-ref:'+q,qs[0]&&!!qs[0].propositionRef,JSON.stringify(p.clauses));
 ok('proposition-not-subject:'+q,!/^(這|那)$/.test(qs[0].subjectRef||''),JSON.stringify(qs[0]));
}

// E. Same actor alone does not create a logical dependency if explicit objects differ.
for(const q of [
 '她需要更多安全感嗎？未來會同意搬家嗎？',
 '他喜歡目前工作嗎？之後會買新車嗎？',
 '女友想要角色幻想嗎？未來會同意一起3P嗎？'
]){
 const p=plan(q),a=api.analyze(q);
 ok('same-actor-independent:'+q,p.mode==='multi_question'&&p.branches.length===2,JSON.stringify(p));
 ok('same-actor-no-dep:'+q,p.dependencies.length===0&&a.dependencyGate===false,JSON.stringify(p.dependencies));
}

// F. Missing object in a later action can inherit the prior participant and form a real state->action chain.
for(const q of [
 '她喜歡我嗎？之後會告白嗎？',
 '他對我有好感嗎？未來會主動追求嗎？',
 '公司有人女生暗戀我嗎？未來會告白嗎？'
]){
 const p=plan(q),a=api.analyze(q);
 ok('state-action-single:'+q,p.mode==='single',JSON.stringify(p));
 ok('state-action-dep:'+q,p.dependencies.some(e=>e.type==='hidden_state_to_future_action_same_actor')&&a.dependencyGate===true,JSON.stringify(p.dependencies));
 ok('state-action-seven:'+q,api.detect(q).id==='seven',JSON.stringify(api.detect(q)));
}

// G. External pronouns are valid deictic entities; absence of an antecedent in the text is not a parser failure.
for(const q of ['她會聯絡我嗎？','他會升遷嗎？','對方會回覆嗎？']){
 const p=plan(q),f=p.clauses[0];
 ok('external-pronoun-ready:'+q,p.ready===true,JSON.stringify(p));
 ok('external-pronoun-kept:'+q,!!f.subjectRef&&f.subjectSource==='explicit',JSON.stringify(f));
 ok('external-pronoun-route:'+q,!!api.detect(q).id,JSON.stringify(api.detect(q)));
}

// H. Context and observed facts do not become branches.
for(const q of [
 '昨天她主動找我聊天。她是不是對我有好感？未來會約我出去嗎？',
 '廠商這兩批都有延遲。我還值得長期配合嗎？',
 '主管今天叫我進辦公室。他是不是想調整我的職務？'
]){
 const p=plan(q);
 ok('context-not-branch:'+q,p.branches.every(b=>!/昨天她主動|這兩批都有延遲|今天叫我進辦公室/.test(b.question)),JSON.stringify(p.branches));
}

// I. Existing frame-semantic evaluation behavior remains intact.
for(const [q,target,facets,route] of [
 ['我現在進貨的廠商值得長期配合嗎？','廠商',[],'five'],
 ['這個廠商可靠嗎？交期穩定嗎？品質值得信任嗎？價格合理嗎？','廠商',['交期','品質','價格'],'nine'],
 ['這份工作值得做嗎？薪資合理嗎？工時穩定嗎？發展性好嗎？','工作',['薪資','工時','發展性'],'nine']
]){
 const p=plan(q),t=p.semantic.topology;
 ok('eval-target:'+q,t.targets.includes(target),JSON.stringify(t));
 ok('eval-facets:'+q,facets.every(x=>t.facets.includes(x)),JSON.stringify(t));
 ok('eval-route:'+q,api.detect(q).id===route,JSON.stringify(api.detect(q)));
}

// J. Best-effort graph: underspecified open questions are not hard-blocked by the semantic parser.
for(const q of ['值得嗎？','可靠嗎？','她到底怎麼想？']){
 const p=plan(q),d=api.detect(q);
 ok('best-effort-ready:'+q,p.ready===true,JSON.stringify(p));
 ok('best-effort-not-hard-blocked:'+q,!!d.id,JSON.stringify(d));
}

// K. No arbitrary six-branch ceiling: dynamic independent-line spread scales with parsed branches.
{
 const q='工作會加薪嗎？感情會穩定嗎？財運會改善嗎？家人會支持嗎？考試會通過嗎？旅行會順利嗎？訂單會增加嗎？搬家會成功嗎？';
 const p=plan(q),d=api.detect(q);
 ok('eight-questions',p.branches.length===8,JSON.stringify(p.branches));
 ok('eight-route-branches',d.id==='branches',JSON.stringify(d));
 const sp=api.instantiate('branches',q);ok('eight-lines-24cards',sp.count===24&&sp.positions.length===24,JSON.stringify(sp));
}

// L. No arbitrary branch-count cap; only the physical 36-card deck invariant remains.
{
 const q12=Array.from({length:12},(_,i)=>`人物${i+1}會支持嗎？`).join('');
 const p12=plan(q12),d12=api.detect(q12),sp12=api.instantiate('branches',q12);
 ok('twelve-branches-kept',p12.branches.length===12,JSON.stringify(p12.branches));
 ok('twelve-branches-36cards',d12.id==='branches'&&sp12.count===36,JSON.stringify({d12,sp12:sp12.count}));
 const q13=Array.from({length:13},(_,i)=>`人物${i+1}會支持嗎？`).join('');
 const p13=plan(q13),d13=api.detect(q13);
 ok('thirteen-semantics-not-truncated',p13.branches.length===13,JSON.stringify(p13.branches));
 ok('thirteen-deck-capacity-only',d13.id===null&&d13.code==='DECK_CAPACITY',JSON.stringify(d13));
}

// M. Metamorphic: punctuation/fullwidth/polite wrappers must preserve discourse topology.

const base='女友問我可以叫別的稱號嗎？例如大哥、大叔。這是因為她需要角色幻想嗎？那未來是否會同意一起3P？';
const baseSig=sig(base);
for(const q of [
 '請問，'+base,
 base.replace(/？/g,'?'),
 base.replace(/。/g,'；'),
 '  '+base+'  ',
 base.replace('例如大哥、大叔','比如大哥、大叔')
])ok('metamorphic-root:'+q,sig(q)===baseSig,`${baseSig} != ${sig(q)}`);

// M. Property corpus: contexts/examples + two independent questions remain 2 branches under arbitrary nouns.
const actors=['女友','男友','同事','主管','客戶','朋友'];
const examples=['稱號A 稱號B','方案A 方案B','做法A 做法B','地點A 地點B'];
const states=['需要更多安全感','偏好不同角色','想要更多變化','擔心目前安排'];
const actions=['同意新方案','接受調整','參與活動','嘗試新安排'];
for(const actor of actors)for(const ex of examples)for(let i=0;i<states.length;i++){
 const q=`${actor}問我可以換個方式嗎？例如${ex}。這是因為${actor}${states[i]}嗎？那未來會${actions[(i+1)%actions.length]}嗎？`;
 const p=plan(q);
 ok('property-2q:'+actor+ex+i,p.semantic.topology.questionCount===2&&p.branches.length===2,JSON.stringify(p));
 ok('property-no-dep:'+actor+ex+i,p.dependencies.length===0,JSON.stringify(p.dependencies));
 ok('property-example:'+actor+ex+i,p.semantic.topology.exampleCount===1,JSON.stringify(p.semantic.topology));
}

// N. Legacy exact amount/count and direct outcome behavior still work.
for(const q of ['今天統一發票會中多少','今天統一發票會中多少張','他會聯絡還是不聯絡？']){
 const a=api.analyze(q);ok('legacy-route:'+q,!!api.detect(q).id,JSON.stringify(api.detect(q)));ok('legacy-ready:'+q,a.questionPlan.ready===true,JSON.stringify(a.questionPlan));
}
ok('legacy-amount',api.analyze('今天統一發票會中多少').asksExactAmount===true);
ok('legacy-count',api.analyze('今天統一發票會中多少張').asksExactCount===true);
ok('polarity-three',api.detect('他會聯絡還是不聯絡？').id==='three',JSON.stringify(api.detect('他會聯絡還是不聯絡？')));

// O. Speech verbs used as ordinary predicates are not misclassified as reported speech.
for(const q of ['他會回覆嗎？','她會回答嗎？','對方會說嗎？']){
 const p=plan(q),f=p.clauses[0];
 ok('speech-predicate-question:'+q,f.isQuestion===true&&!f.reportedSpeech,JSON.stringify(f));
 ok('speech-predicate-three:'+q,api.detect(q).id==='three',JSON.stringify(api.detect(q)));
}

// P. Generated/shared source integrity and version wiring.

ok('planner-sync-lenormand',fs.readFileSync(path.join(root,'JS','lenormand.js'),'utf8').includes(fs.readFileSync(path.join(root,'JS','shared','question-planner.js'),'utf8').trim()));
ok('planner-sync-tarot',fs.readFileSync(path.join(root,'JS','tarot-foundation.js'),'utf8').includes(fs.readFileSync(path.join(root,'JS','shared','question-planner.js'),'utf8').trim()));
ok('root-copy-sync',fs.readFileSync(path.join(root,'lenormand.js'),'utf8')===fs.readFileSync(sourcePath,'utf8'));
const index=fs.readFileSync(path.join(root,'index.html'),'utf8');ok('cache-v23',index.includes('JS/lenormand.js?v=20260926ln23'));ok('api-v23',sandbox.window.JYLenormand&&sandbox.window.JYLenormand.version==='23.0.0');

console.log(`Lenormand v23 discourse-semantic suite: ${checks} checks PASS`);
