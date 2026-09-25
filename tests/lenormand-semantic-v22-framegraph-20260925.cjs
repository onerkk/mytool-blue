'use strict';
const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('assert');
const root=path.join(__dirname,'..'),sourcePath=path.join(root,'JS','lenormand.js');
let code=fs.readFileSync(sourcePath,'utf8');
code=code.replace(/\}\)\(\);\s*$/, `window.__lnV22Test={analyze:_lnAnalyzeQuestion,detect:_lnDetectSpread,review:_lnReviewAnswerGranularity,shared:analyzeReadingQuestion};})();`);
function stubNode(){return {style:{},appendChild(){},remove(){},setAttribute(){},getAttribute(){return null},querySelector(){return null},focus(){},select(){},setSelectionRange(){},innerHTML:'',textContent:'',isConnected:true,parentNode:null};}
const sandbox={console:{log(){},warn(){},error:console.error},window:{crypto:require('crypto').webcrypto,isSecureContext:true,addEventListener(){},JYShareCard:null},document:{createElement:stubNode,body:{appendChild(){}},head:{appendChild(){}},getElementById(){return null},querySelector(){return null},execCommand(){return true},referrer:''},navigator:{clipboard:{writeText(){return Promise.resolve()}}},localStorage:{getItem(){return null},setItem(){},removeItem(){}},sessionStorage:{getItem(){return null},setItem(){}},location:{search:''},alert(){},setTimeout(){},Promise,Uint32Array,Date,Math};
sandbox.window.window=sandbox.window;vm.createContext(sandbox);vm.runInContext(code,sandbox);const api=sandbox.window.__lnV22Test;
let checks=0;function ok(name,cond,detail=''){checks++;try{assert.ok(cond,detail)}catch(e){console.error('FAIL',name,detail);throw e}}
function sem(q){return api.shared(q).semantic;}
function first(q){return sem(q).clauses[0];}

// 1) Root case: evaluator, target, relation and long-term horizon are separate semantic roles.
{
  const q='我現在進貨的廠商值得長期配合嗎？',p=api.shared(q),f=p.semantic.clauses[0],t=p.semantic.topology,a=api.analyze(q);
  ok('root-ready',p.ready===true,JSON.stringify(p));
  ok('root-mode',p.mode==='single',p.mode);
  ok('root-evaluator',f.evaluatorRef==='我',JSON.stringify(f));
  ok('root-target',f.targetRef==='廠商',JSON.stringify(f));
  ok('root-relation',f.relationRef==='配合',JSON.stringify(f));
  ok('root-longterm',f.temporal.horizon==='long_term'&&f.temporal.continuity===true&&f.temporal.future===true,JSON.stringify(f.temporal));
  ok('root-domain',t.domains.includes('commerce'),JSON.stringify(t));
  ok('root-intent',a.capability.intent==='long_term_evaluation',JSON.stringify(a.capability));
  ok('root-spread',api.detect(q).id==='five',JSON.stringify(api.detect(q)));
}

// 2) Same target + multiple facets must remain one semantic component and route to 9-grid.
{
  const q='這個廠商可靠嗎？交期穩定嗎？品質值得信任嗎？價格合理嗎？',p=api.shared(q),s=p.semantic,t=s.topology;
  ok('facet-single',p.mode==='single',JSON.stringify(p));
  ok('facet-targets',JSON.stringify(t.targets)==='["廠商"]',JSON.stringify(t));
  ok('facet-list',JSON.stringify(t.facets)==='["交期","品質","價格"]',JSON.stringify(t));
  ok('facet-component',t.componentCount===1,JSON.stringify(t));
  ok('facet-edges',p.dependencies.filter(e=>e.type==='same_target_facet_bundle').length===3,JSON.stringify(p.dependencies));
  ok('facet-roles',s.clauses.every(f=>f.role==='evaluation'&&f.privateState===false),JSON.stringify(s.clauses));
  ok('facet-nine',api.detect(q).id==='nine',JSON.stringify(api.detect(q)));
}

// 3) Domain independence: unseen/open-class target nouns still parse by grammatical position, not domain keyword tables.
const genericTargets=['方案Z','服務X','設備甲','產品Q','課程B','房源C','合作案D','工具M','流程N','制度P'];
const relations=['投入','使用','維持','執行','採用','推進'];
for(let i=0;i<genericTargets.length;i++){
  const target=genericTargets[i],rel=relations[i%relations.length],q=`這個${target}值得長期${rel}嗎？`,f=first(q),p=api.shared(q);
  ok('generic-ready:'+q,p.ready===true,JSON.stringify(p));
  ok('generic-target:'+q,f.targetRef===target,JSON.stringify(f));
  ok('generic-relation:'+q,f.relationRef===rel,JSON.stringify(f));
  ok('generic-longterm:'+q,f.temporal.continuity===true,JSON.stringify(f.temporal));
}

// 4) Relative-clause heads: arbitrary descriptions before 的 must collapse to the head noun.
const relatives=[
  ['我目前使用的服務X','服務X','使用'],
  ['我正在測試的設備甲','設備甲','採用'],
  ['我們正在執行的方案Z','方案Z','推進'],
  ['我最近看的房源C','房源C','租']
];
for(const [np,head,rel] of relatives){const q=`${np}值得長期${rel}嗎？`,f=first(q);ok('relative-head:'+q,f.targetRef===head,JSON.stringify(f));}

// 5) Compatibility grammar in both word orders.
for(const [q,target,evalr] of [
  ['我適合這份工作嗎？','工作','我'],
  ['這份工作適合我嗎？','工作','我'],
  ['我適合這個方案Z嗎？','方案Z','我'],
  ['這個方案Z適合我嗎？','方案Z','我']
]){const f=first(q);ok('compat-target:'+q,f.targetRef===target,JSON.stringify(f));ok('compat-evaluator:'+q,f.evaluatorRef===evalr,JSON.stringify(f));ok('compat-simple-route:'+q,api.detect(q).id==='three',JSON.stringify(api.detect(q)));}

// 6) Facet attachment generalizes across domains and arbitrary property nouns.
const bundles=[
  ['這份工作值得做嗎？薪資合理嗎？工時穩定嗎？發展性好嗎？','工作',['薪資','工時','發展性']],
  ['這間房子值得租嗎？交通好嗎？租金合理嗎？隔音好嗎？','房子',['交通','租金','隔音']],
  ['這個服務X可靠嗎？速度穩定嗎？支援好嗎？費用合理嗎？','服務X',['速度','支援','費用']],
  ['這台設備甲值得買嗎？精度穩定嗎？維修好嗎？耗材合理嗎？','設備甲',['精度','維修','耗材']]
];
for(const [q,target,facets] of bundles){const p=api.shared(q),t=p.semantic.topology;ok('bundle-single:'+q,p.mode==='single',JSON.stringify(p));ok('bundle-target:'+q,t.targets.length===1&&t.targets[0]===target,JSON.stringify(t));ok('bundle-facets:'+q,JSON.stringify(t.facets)===JSON.stringify(facets),JSON.stringify(t.facets));ok('bundle-nine:'+q,api.detect(q).id==='nine',JSON.stringify(api.detect(q)));}

// 7) Explicit new entities are never silently demoted into facets.
for(const q of ['方案A可行嗎？方案B可靠嗎？','公司甲可靠嗎？公司乙穩定嗎？','設備A值得買嗎？設備B耐用嗎？']){
  const p=api.shared(q);ok('explicit-entity-multi:'+q,p.mode==='multi_question',JSON.stringify(p));ok('explicit-entity-components:'+q,p.semantic.topology.componentCount===2,JSON.stringify(p.semantic.topology));
}

// 8) Same entity is not enough to merge independent event propositions.
for(const q of ['這家公司會加薪嗎？這家公司會搬家嗎？','她會結婚嗎？她會搬家嗎？','這個方案會通過嗎？這個方案會延期嗎？']){
  const p=api.shared(q);ok('independent-same-entity:'+q,p.mode==='multi_question',JSON.stringify(p));
}

// 9) Materially underspecified evaluation fails closed instead of inventing an object.
for(const q of ['值得嗎？','可靠嗎？','適合長期嗎？']){
  const p=api.shared(q);ok('underspecified-not-ready:'+q,p.ready===false,JSON.stringify(p));ok('underspecified-code:'+q,p.contract.criticalIssues.some(x=>x.code==='UNRESOLVED_EVALUATION_TARGET'),JSON.stringify(p.contract));ok('underspecified-no-spread:'+q,api.detect(q).id===null,JSON.stringify(api.detect(q)));
}

// 10) Entity graph has typed edges and is not just a bag of labels.
{
  const p=api.shared('我現在進貨的廠商值得長期配合嗎？交期穩定嗎？品質值得信任嗎？'),g=p.semantic.graph;
  ok('graph-entity-node',g.entityNodes.some(n=>n.kind==='entity'&&n.label==='廠商'),JSON.stringify(g.entityNodes));
  ok('graph-evaluator-node',g.entityNodes.some(n=>n.kind==='evaluator'&&n.label==='我'),JSON.stringify(g.entityNodes));
  ok('graph-facet-node',g.entityNodes.some(n=>n.kind==='facet'&&n.label==='交期'),JSON.stringify(g.entityNodes));
  ok('graph-target-edge',g.relationEdges.some(e=>e.type==='targets'),JSON.stringify(g.relationEdges));
  ok('graph-facet-edge',g.relationEdges.some(e=>e.type==='facet_of'),JSON.stringify(g.relationEdges));
}

// 11) Metamorphic invariants: polite wrappers, punctuation and harmless time wording preserve roles.
const metamorphicBases=[
  '我現在進貨的廠商值得長期配合嗎？',
  '這份工作值得長期做嗎？',
  '這間房子適合長期住嗎？',
  '這個方案Z值得持續投入嗎？'
];
function signature(q){const p=api.shared(q),s=p.semantic,t=s.topology;return JSON.stringify({ready:p.ready,mode:p.mode,targets:t.targets,facets:t.facets,relations:t.relations,longTerm:t.longTerm,evaluation:t.evaluation,roles:s.clauses.map(f=>f.role)});}
for(const q of metamorphicBases){const base=signature(q);for(const v of ['請問'+q,'我想問，'+q,q.replace(/？/g,'?'),'  '+q+'  '])ok('metamorphic:'+q+' <= '+v,signature(v)===base,`${base} != ${signature(v)}`);}

// 12) Property corpus: arbitrary target/facet names remain stable under composition.
const targetCorpus=['對象甲','標的B','服務C','設備D','計畫E','職缺F','平台G','產品H'];
const facetCorpus=['成本','速度','耐用度','支援度','透明度','便利性','彈性','一致性'];
const evalTerms=['合理','穩定','可靠','好'];
for(const target of targetCorpus){
  const q0=`這個${target}值得長期使用嗎？`,f0=first(q0);ok('property-target:'+q0,f0.targetRef===target,JSON.stringify(f0));
  const f1=facetCorpus[checks%facetCorpus.length],f2=facetCorpus[(checks+3)%facetCorpus.length];
  const q=`這個${target}可靠嗎？${f1}${evalTerms[checks%evalTerms.length]}嗎？${f2}${evalTerms[(checks+1)%evalTerms.length]}嗎？`,p=api.shared(q),t=p.semantic.topology;
  ok('property-bundle-ready:'+q,p.ready===true,JSON.stringify(p));
  ok('property-bundle-target:'+q,t.targets.length===1&&t.targets[0]===target,JSON.stringify(t));
  ok('property-bundle-facets:'+q,t.facets.includes(f1)&&t.facets.includes(f2),JSON.stringify(t.facets));
}

// 13) Legacy dependency/measurement classes remain intact.
for(const q of ['公司有人暗戀我嗎？之後會告白嗎？','今天統一發票會中多少','為什麼生意卡住？我該怎麼改善？']){
  const a=api.analyze(q);ok('legacy-ready:'+q,a.questionPlan.ready===true,JSON.stringify(a.questionPlan));ok('legacy-route:'+q,!!api.detect(q).id,JSON.stringify(api.detect(q)));
}
ok('legacy-hidden-dep',api.analyze('公司有人暗戀我嗎？之後會告白嗎？').dependencyGate===true);
ok('legacy-amount',api.analyze('今天統一發票會中多少').asksExactAmount===true);
ok('legacy-review',api.review('今天統一發票會中多少','你會中200元。').ok===false);

console.log(`Lenormand semantic v22 frame-graph suite: ${checks} checks PASS`);
