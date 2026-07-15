'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const E = require(path.join(ROOT, 'JS', 'tarot-semantic-engine.js'));
let passed = 0;
function test(name, fn) {
  try { fn(); passed += 1; console.log('✓', name); }
  catch (err) { console.error('✗', name); throw err; }
}
function cards(n, prefix='牌') {
  return Array.from({length:n}, (_,i) => ({
    name: `${prefix}${i+1}`,
    position: `位置${i+1}`,
    isUp: i % 3 !== 1,
    keywords: `語義甲${i+1}・語義乙${i+1}`,
    baseMeaning: `來源釋義${i+1}，僅供拆解`
  }));
}
function ootkData() {
  const operations = {};
  for (let i=1;i<=5;i++) {
    operations['op'+i] = {
      activePile: i===1 ? '火元素堆' : '',
      activeHouse: i===2 ? 7 : '',
      activeSign: i===3 ? '天秤' : '',
      activeSephirah: i===5 ? 'Tiphareth' : '',
      countingPath: [
        {cardName: i%2 ? '太陽' : '月亮', title:'明確・顯現'},
        {cardName: i%2 ? '聖杯二' : '寶劍三', title:'連結・分離'}
      ],
      pairs: [{left:{name:'魔術師',title:'意志'}, right:{name:'女祭司',title:'隱而未明'}}],
      dignities:[{card:'太陽',score:1}],
      decanSign: i===4 ? '天秤' : '',
      decanRange: i===4 ? '0°–10°' : '',
      decanDateRange: i===4 ? '資料提供的旬位日期' : ''
    };
  }
  return {sourceProfile:'gd_book_t', significator:{name:'皇帝'}, operations};
}
function exportPrompt(spreadId, question='這個前所未見的複合條件，在指定範圍內是否成立？') {
  const semanticCode = fs.readFileSync(path.join(ROOT,'JS','tarot-semantic-engine.js'),'utf8');
  const promptCode = fs.readFileSync(path.join(ROOT,'JS','prompt-export.js'),'utf8');
  const sandbox={console,Date,Set,Map,JSON,Math,setTimeout,clearTimeout};
  sandbox.window=sandbox; sandbox.globalThis=sandbox;
  sandbox.S={form:{question},tarot:{spreadType:spreadId}};
  sandbox.document={getElementById:()=>null,createElement:()=>({style:{},setAttribute(){},appendChild(){},select(){},focus(){}}),body:{appendChild(){},removeChild(){}}};
  sandbox.navigator={};
  vm.createContext(sandbox);
  vm.runInContext(semanticCode,sandbox,{filename:'tarot-semantic-engine.js'});
  const engine=sandbox.JYTarotSemanticEngine;
  if(spreadId==='ootk'){
    const payload={mode:'ootk',question,ootkData:ootkData()};
    payload.semanticContract=engine.compileReadingSpec({question,spreadId:'ootk',sourceProfile:'gd_book_t',ootkData:payload.ootkData});
    payload.ootkData.semanticContract=payload.semanticContract;
    sandbox._buildOOTKPayload=()=>payload;
  } else {
    const spec=engine.METHOD_SPECS[spreadId];
    const sourceProfile=engine.resolveSemanticProfile(spreadId,{});
    const cs=cards(spec.expectedCardCount,spreadId+'牌');
    const payload={mode:'tarot_only',question,tarotData:{spreadType:spreadId,spreadZh:spec.label,sourceProfile,cards:cs,summary:'測試'}};
    payload.semanticContract=engine.compileReadingSpec({question,spreadId,cards:cs,sourceProfile});
    payload.tarotData.semanticContract=payload.semanticContract;
    sandbox._buildTarotOnlyPayload=()=>payload;
  }
  vm.runInContext(promptCode,sandbox,{filename:'prompt-export.js'});
  return sandbox.JY_buildExportPrompt(spreadId==='ootk'?'ootk':'tarot');
}

test('v92 使用型別化查詢與證據共指 schema', () => {
  assert.strictEqual(E.VERSION, '92.0.0');
  assert.strictEqual(E.SCHEMA, 'jy.tarot.semantic-contract/3');
  const c=E.compileReadingSpec({question:'X在Y條件下能否導致Z？',spreadId:'three_card',cards:cards(3)});
  assert.strictEqual(c.validation.ok,true,c.validation.errors.join(','));
  assert.strictEqual(c.question.queryGraph.schema,'typed_query_graph/1');
  assert(c.question.queryGraph.atomizationRequirement.includes('不得只保留整句'));
  assert.strictEqual(c.adjudication.executionPlan.passes.length,6);
  assert(c.claimSchema.required.includes('eventId'));
  assert(c.claimSchema.required.includes('entityBindings'));
  assert(c.claimSchema.required.includes('joinTrace'));
});

test('原句未知題材仍完整保留並要求模型細粒度原子化', () => {
  const q=E.compileQuestion('當Ω在甲域經過β後，除了丙以外的δ是否仍保持ζ？');
  assert(q.queryGraph.events.some(e=>e.surface.includes('Ω在甲域經過β後')));
  assert(q.queryGraph.constraints.some(c=>c.type==='exclusion' && c.text.includes('丙')));
  assert(q.queryGraph.completionRules.some(x=>x.includes('每個會改變答案真值')));
  assert(q.queryGraph.validationRules.roundTrip);
  assert(q.queryGraph.validationRules.deletionSensitivity);
  assert(q.queryGraph.validationRules.noAddedPremise);
});

test('排除條件不會被誤綁為已知關係對象', () => {
  assert.strictEqual(E.inferExplicitCounterpartBinding('今年會有非現任的異性跟我告白嗎？'),false);
  assert.strictEqual(E.inferExplicitCounterpartBinding('我和現任的關係如何？'),true);
  const unknown=E.compileReadingSpec({question:'公司有人喜歡我嗎？',spreadId:'relationship',cards:cards(6)});
  assert.strictEqual(unknown.evidenceGraph.nodes[1].authority,'person_aggregate');
  const known=E.compileReadingSpec({question:'我和現任的關係如何？',spreadId:'relationship',cards:cards(6)});
  assert.strictEqual(known.evidenceGraph.nodes[1].authority,'person_known');
});

test('所有牌陣節點與證據單位都有綁定與合成契約', () => {
  for (const [id,spec] of Object.entries(E.METHOD_SPECS)) {
    const input={question:'在既定條件下，這件事會如何形成、受阻並收束？',spreadId:id};
    if(id==='ootk') input.ootkData=ootkData(); else input.cards=cards(spec.expectedCardCount,id+'牌');
    const c=E.compileReadingSpec(input);
    assert.strictEqual(c.validation.ok,true,`${id}: ${c.validation.errors.join(',')}`);
    assert(c.method.observationModel,id);
    c.evidenceGraph.nodes.forEach(n=>assert(n.bindingPolicy,`${id}/${n.id}`));
    c.evidenceGraph.evidenceUnits.forEach(u=>assert(u.joinPolicy,`${id}/${u.id}`));
  }
});

test('非線性方法保留依賴圖，綜合單位不含直接牌序', () => {
  const c=E.compileReadingSpec({question:'這件事如何收束？',spreadId:'celtic_cross',cards:cards(10)});
  const u=c.evidenceGraph.evidenceUnits.find(x=>x.type==='dependency_network');
  assert(u);
  assert.strictEqual(u.claimPolicy,'synthesis_only');
  assert.strictEqual(u.nodes.length,0);
  assert.strictEqual(u.dependsOn.length,5);
  assert(u.joinPolicy.synthesisJoin.includes('dependsOn'));
});

test('黃道第十三張只有綜合權限，不可單獨製造結果', () => {
  const c=E.compileReadingSpec({question:'今年會有非現任的異性跟我告白嗎？',spreadId:'zodiac',cards:cards(13),sourceProfile:'modern_rws_gd_structure'});
  const n13=c.evidenceGraph.nodes[12];
  assert.strictEqual(n13.authority,'synthesis');
  assert(n13.bindingPolicy.cannotEstablish.includes('new_event'));
  const ds=c.evidenceGraph.evidenceUnits.find(u=>u.type==='domain_synthesis');
  assert(ds && ds.claimPolicy==='synthesis_only');
  assert.strictEqual(ds.nodes.length,0);
  assert.strictEqual(ds.dependsOn.length,2);
});

test('比較與精確量測必須由方法通道支援', () => {
  const c=E.compileReadingSpec({question:'副業收入能超過正職收入嗎？',spreadId:'celtic_cross',cards:cards(10)});
  const map=Object.fromEntries(c.capabilityMatrix.map(x=>[x.dimensionId,x]));
  assert.strictEqual(map.threshold_crossing.canAnswer,false);
  assert(map.threshold_crossing.reason.includes('獨立且同尺度'));
  const e=E.compileReadingSpec({question:'A方案是否優於B方案？',spreadId:'either_or',cards:cards(5)});
  const em=Object.fromEntries(e.capabilityMatrix.map(x=>[x.dimensionId,x]));
  if(em.comparison) assert.notStrictEqual(em.comparison.canAnswer,false);
});

test('開鑰五次操作固定為同一 QUERY_EVENT 的階段摘要', () => {
  const c=E.compileReadingSpec({question:'這件事最終會如何？',spreadId:'ootk',ootkData:ootkData()});
  assert.strictEqual(c.validation.ok,true,c.validation.errors.join(','));
  const sums=c.evidenceGraph.evidenceUnits.filter(u=>u.type==='operation_stage_summary');
  assert.strictEqual(sums.length,5);
  const functions=['opening_and_present_condition','development_through_houses','continuing_development_through_signs','near_term_decan_development_and_time_anchor','termination_through_tree_of_life'];
  sums.forEach((u,i)=>{
    assert.strictEqual(u.eventBinding,'QUERY_EVENT_ONLY');
    assert.strictEqual(u.stageFunction,functions[i]);
    assert.strictEqual(u.nodes.length,0);
    assert(u.dependsOn.some(id=>c.evidenceGraph.evidenceUnits.find(x=>x.id===id && x.type==='operation_validity')));
  });
  const cross=c.evidenceGraph.evidenceUnits.find(u=>u.type==='cross_operation_stage_network');
  assert(cross && cross.nodes.length===0);
  assert(cross.dependsOn.every(id=>sums.some(s=>s.id===id)));
});

test('所有一般牌陣與開鑰都能匯出同一 v92 根程序並保留各自方法', () => {
  for(const id of Object.keys(E.METHOD_SPECS)){
    const p=exportPrompt(id,'在原句所有限定下，這個複合事件是否成立並如何發展？');
    assert(p.includes('ROOT-SPEC v92'),id);
    assert(p.includes('合法證據單位：'),id);
    assert(p.includes('細粒度原子化'),id);
    assert(p.includes('GraphBinder') || p.includes('P3_BIND'),id);
    assert(p.includes('語義飽和帳本'),id);
    assert(p.includes(E.METHOD_SPECS[id].label),id);
  }
});

test('提示詞要求六階段、共指、替代解讀與反向稽核', () => {
  const p=exportPrompt('zodiac','今年會有非現任的異性跟我告白嗎？');
  ['ROOT-SPEC v92','QuestionCompiler','EvidenceInterpreter','GraphBinder','Adjudicator','SaturationReviewer','AnswerVerifier','細粒度原子化','實體／事件同一性','最強替代解讀','語義飽和帳本'].forEach(x=>assert(p.includes(x),x));
  ['缺聖杯＝','權杖國王通常已婚','告白必須出現','先把「支持」與「反對」的牌各清點一次'].forEach(x=>assert(!p.includes(x),x));
});

test('開鑰提示詞禁止跨操作拼牌並保留程序有效性', () => {
  const p=exportPrompt('ootk','在原句全部限定下，這件事最後是否成立？');
  ['ROOT-SPEC v92','QUERY_EVENT','operation_stage_summary','cross_operation_stage_network','適配失敗、重試、中止或降權','第四次操作'].forEach(x=>assert(p.includes(x),x));
  assert(p.includes('不能直接把不同操作中的牌拼成新牌句'));
});

test('答案驗證攔截無量測人數，但不阻斷其餘定性解讀', () => {
  const c=E.compileReadingSpec({question:'公司有幾個人喜歡我？',spreadId:'relationship',cards:cards(6)});
  const bad=E.validateAnswer('有三個人喜歡你。——牌1',c);
  assert.strictEqual(bad.ok,false);
  assert(bad.violations.some(x=>x.includes('未量測人數')));
  const ok=E.validateAnswer('牌面無法提供精確人數；其餘互動訊號仍可依關係結構定性說明。——牌1',c);
  assert.strictEqual(ok.ok,true,ok.violations.join(','));
});

console.log(`\n${passed} v92 root compiler tests passed`);
