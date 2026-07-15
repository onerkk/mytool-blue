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
    baseMeaning: `來源釋義${i+1}，僅供素材`
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
      decanSign: i===4 ? '天秤' : '',
      decanRange: i===4 ? '0°–10°' : '',
      decanDateRange: i===4 ? '資料提供的旬位日期' : ''
    };
  }
  return {sourceProfile:'gd_book_t', operations};
}

function capMap(contract) {
  return Object.fromEntries(contract.capabilityMatrix.map(x => [x.dimensionId, x]));
}

function exportPromptFor(spreadId, question='這件事會如何發展？') {
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
  }else{
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

test('原問句編譯保留比較雙方、門檻、模態與成功定義', () => {
  const q = E.compileQuestion('我副業能成功超過正職收入嗎？');
  const ids = q.requestedDimensions.map(x=>x.id);
  ['event_or_state','existence','value_attribute','event_realization','modality','comparison','relative_order','threshold_crossing'].forEach(id=>assert(ids.includes(id), id));
  assert.strictEqual(q.relations.length, 1);
  assert.strictEqual(q.relations[0].left, '副業收入');
  assert.strictEqual(q.relations[0].right, '正職收入');
  assert.strictEqual(q.relations[0].operator, 'gt');
  assert(q.semanticObligations.some(x=>x.type==='success_definition'));
});

test('時間範圍與人物屬性不會吞掉存在與事件落實需求', () => {
  const q = E.compileQuestion('我今年有肉體桃花嗎？可能幾歲？');
  const ids = q.requestedDimensions.map(x=>x.id);
  ['event_or_state','existence','event_realization','exact_age','time_scope','modality'].forEach(id=>assert(ids.includes(id), id));
  assert.deepStrictEqual(q.explicitScopes, ['今年']);
});

test('問句句法可泛化出未列題材的事件模態與數量存在邊界', () => {
  const future = E.compileQuestion('會有職場異性跟我告白嗎？');
  const fids = future.requestedDimensions.map(x=>x.id);
  ['existence','event_realization','modality'].forEach(id=>assert(fids.includes(id), id));
  const count = E.compileQuestion('我在公司有幾個異性喜歡我');
  const cids = count.requestedDimensions.map(x=>x.id);
  ['cardinality','existence','event_realization'].forEach(id=>assert(cids.includes(id), id));
});

test('多子句比較不會只保留第一個門檻', () => {
  const q = E.compileQuestion('副業收入會超過正職收入嗎？成本會低於預算嗎？');
  assert.strictEqual(q.relations.length, 2);
  assert.deepStrictEqual(q.relations.map(r=>r.operator), ['gt','lt']);
  assert(q.semanticObligations.filter(x=>x.type==='relation_preservation').length === 2);
});

test('凱爾特十字不能把單一情勢網絡冒充雙收入比較通道', () => {
  const c = E.compileReadingSpec({question:'我副業能成功超過正職收入嗎？',spreadId:'celtic_cross',cards:cards(10)});
  assert.strictEqual(c.validation.ok, true, c.validation.errors.join(','));
  const m = capMap(c);
  assert.strictEqual(m.relative_order.canAnswer, false);
  assert.strictEqual(m.threshold_crossing.canAnswer, false);
  assert(m.threshold_crossing.reason.includes('單一情勢網絡'));
  assert.strictEqual(m.value_attribute.canAnswer, true);
});

test('二選一牌陣提供獨立分支比較，但仍不生成精確金額', () => {
  const c = E.compileReadingSpec({question:'A方案收入會超過B方案收入嗎？',spreadId:'either_or',cards:cards(5)});
  const m = capMap(c);
  assert.strictEqual(m.relative_order.canAnswer, true);
  assert.strictEqual(m.relative_order.precheckStatus, '有獨立比較通道');
  assert.strictEqual(m.threshold_crossing.canAnswer, null);
  assert.strictEqual(m.exact_value, undefined);
});

test('凱爾特十字完整網絡是依賴圖，不是N01到N10線性路徑', () => {
  const c = E.compileReadingSpec({question:'這件事如何發展？',spreadId:'celtic_cross',cards:cards(10)});
  const u = c.evidenceGraph.evidenceUnits.find(x=>x.type==='dependency_network');
  assert(u);
  assert.strictEqual(u.topology, 'nonlinear_dependency_network');
  assert.strictEqual(u.nodes.length, 0);
  assert.strictEqual(u.dependsOn.length, 5);
  assert.strictEqual(u.claimPolicy, 'synthesis_only');
  assert.strictEqual(c.evidenceGraph.nodes[1].authority, 'interaction_force');
  assert(c.evidenceGraph.nodes[1].authorityRule.includes('助力、阻力、催化、代價或混合作用'));
});

test('牌義資料被拆成候選語義與來源釋義，不是預先事件句', () => {
  const c = E.compileReadingSpec({question:'結果？',spreadId:'three_card',cards:[
    {name:'太陽',position:'起點',isUp:true,keywords:'清楚・成功',baseMeaning:'突然看見機會，應該把握'},
    {name:'月亮',position:'發展',isUp:true,keywords:'模糊・隱藏',baseMeaning:'事情尚未明朗'},
    {name:'世界',position:'收束',isUp:true,keywords:'完成・整合',baseMeaning:'一個循環收束'}
  ]});
  const n = c.evidenceGraph.nodes[0];
  assert.deepStrictEqual(n.semanticCandidates, ['清楚','成功']);
  assert.strictEqual(n.sourceGloss, '突然看見機會，應該把握');
  const p = E.renderPromptContract(c);
  assert(p.includes('牌義候選素材（不是已成立事件句）'));
  assert(p.includes('來源釋義=突然看見機會，應該把握'));
  assert(p.includes('牌義資料是候選語義原子與來源釋義，不是已成立的事件句'));
});

test('所有牌陣都由同一契約編譯器建立合法方法拓撲', () => {
  for (const [id,spec] of Object.entries(E.METHOD_SPECS)) {
    const input = {question:'這件事會如何發展？',spreadId:id};
    if (id === 'ootk') input.ootkData = ootkData();
    else input.cards = cards(spec.expectedCardCount, id+'牌');
    const c = E.compileReadingSpec(input);
    assert.strictEqual(c.validation.ok, true, `${id}: ${c.validation.errors.join(',')}`);
    assert.strictEqual(c.method.id, id);
    assert(c.method.topology && c.method.topology.kind, id);
    assert(c.evidenceGraph.evidenceUnits.length > 0, id);
  }
});

test('開鑰五次操作先各自形成階段摘要，再由階段網絡整合', () => {
  const c = E.compileReadingSpec({question:'今年結果與時間？',spreadId:'ootk',ootkData:ootkData()});
  assert.strictEqual(c.validation.ok, true, c.validation.errors.join(','));
  const units = c.evidenceGraph.evidenceUnits;
  const summaries = units.filter(u=>u.type==='operation_stage_summary');
  assert.strictEqual(summaries.length, 5);
  summaries.forEach((u,i)=>{
    assert.strictEqual(u.nodes.length, 0);
    assert(u.dependsOn.length >= 3, `op${i+1}`);
    assert.strictEqual(u.claimPolicy, 'synthesis_only');
  });
  const cross = units.find(u=>u.type==='cross_operation_stage_network');
  assert(cross);
  assert.strictEqual(cross.nodes.length, 0);
  assert.strictEqual(cross.dependsOn.length, 5);
  assert(cross.dependsOn.every(id=>summaries.some(s=>s.id===id)));
});

test('答案稽核攔截重新定義成功與無比較通道的肯定門檻', () => {
  const c = E.compileReadingSpec({question:'我副業能成功超過正職收入嗎？',spreadId:'celtic_cross',cards:[
    {name:'塔',position:'核心',keywords:'崩塌・清場',baseMeaning:'結構改變'},
    {name:'寶劍十',position:'交叉',keywords:'低點・恢復',baseMeaning:'恢復'},
    {name:'寶劍六',position:'上方',keywords:'過渡',baseMeaning:'移動'},
    {name:'審判',position:'根基',keywords:'召喚',baseMeaning:'重新評估'},
    {name:'金幣騎士',position:'過去',keywords:'穩定',baseMeaning:'慢'},
    {name:'權杖八',position:'未來',keywords:'加速',baseMeaning:'快'},
    {name:'金幣十',position:'本人',keywords:'長期',baseMeaning:'累積'},
    {name:'聖杯七',position:'環境',keywords:'選擇',baseMeaning:'多選項'},
    {name:'聖杯十',position:'希望恐懼',keywords:'完整',baseMeaning:'理想'},
    {name:'金幣王牌',position:'結果',keywords:'新機會',baseMeaning:'起點'}
  ]});
  const r1 = E.validateAnswer('如果成功是指能產生收入，會成功。——金幣王牌', c);
  assert.strictEqual(r1.ok, false);
  assert(r1.violations.some(x=>x.includes('重新定義')));
  const r2 = E.validateAnswer('你的副業傾向會超過正職收入。——金幣王牌', c);
  assert.strictEqual(r2.ok, false);
  assert(r2.violations.some(x=>x.includes('沒有獨立比較通道')));
  const r3 = E.validateAnswer('目前不能確認副業收入會超過正職收入；牌面只支持副業出現新的收入起點。——金幣王牌', c);
  assert.strictEqual(r3.ok, true, r3.violations.join(','));
});

test('所有塔羅牌陣與開鑰之法都能匯出同一根契約且保留各自拓撲', () => {
  for(const id of Object.keys(E.METHOD_SPECS)){
    const prompt=exportPromptFor(id);
    assert(prompt.includes('ROOT-SPEC v91'), id);
    assert(prompt.includes('合法證據單位：'), id);
    assert(prompt.includes('牌義候選素材（不是已成立事件句）'), id);
    assert(prompt.includes('完整事件的強度不得高於最弱的必要語義成分'), id);
    if(id==='ootk'){
      assert(prompt.includes('operation_stage_summary'));
      assert(prompt.includes('cross_operation_stage_network'));
    }else{
      assert(prompt.includes('拓撲='+E.METHOD_SPECS[id].topology.kind), id);
    }
  }
});

test('ROOT-SPEC v91提示包含原句關係、語義義務、量測邊界與非線性拓撲', () => {
  const c = E.compileReadingSpec({question:'我副業能成功超過正職收入嗎？',spreadId:'celtic_cross',cards:cards(10)});
  const p = E.renderPromptContract(c);
  ['ROOT-SPEC v91','原句關係：','語義義務：','副業收入 超過 正職收入','門檻跨越＝未直接量測','topology=nonlinear_dependency_network','dependsOn=','不得重新定義「成功」'].forEach(x=>assert(p.includes(x),x));
  assert(!p.includes('N01 → N02 → N03 → N04 → N05 → N06 → N07 → N08 → N09 → N10'));
});

test('index 依正確順序載入v91語義引擎與提示詞', () => {
  const html = fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
  const sem = html.indexOf('JS/tarot-semantic-engine.js?v=20260715v91_0');
  const ai = html.indexOf('JS/ai-analysis.js?v=20260715v91_0');
  const pe = html.indexOf('JS/prompt-export.js?v=20260715v91_0');
  assert(sem > 0 && sem < ai && ai < pe);
});

test('提示詞匯出使用v91契約與候選語義素材', () => {
  const semanticCode = fs.readFileSync(path.join(ROOT,'JS','tarot-semantic-engine.js'),'utf8');
  const promptCode = fs.readFileSync(path.join(ROOT,'JS','prompt-export.js'),'utf8');
  const payload = {
    mode:'tarot_only', question:'我副業能成功超過正職收入嗎？',
    tarotData:{spreadType:'celtic_cross',spreadZh:'凱爾特十字',sourceProfile:'modern_rws',cards:cards(10),summary:'7正3逆'}
  };
  const sandbox={console,Date,Set,Map,JSON,Math,setTimeout,clearTimeout};
  sandbox.window=sandbox; sandbox.globalThis=sandbox;
  sandbox.S={form:{question:payload.question},tarot:{spreadType:'celtic_cross'}};
  sandbox.document={getElementById:()=>null,createElement:()=>({style:{},setAttribute(){},appendChild(){},select(){},focus(){}}),body:{appendChild(){},removeChild(){}}};
  sandbox.navigator={};
  sandbox._buildTarotOnlyPayload=()=>payload;
  vm.createContext(sandbox);
  vm.runInContext(semanticCode,sandbox,{filename:'tarot-semantic-engine.js'});
  payload.semanticContract=sandbox.JYTarotSemanticEngine.compileReadingSpec({question:payload.question,spreadId:'celtic_cross',cards:payload.tarotData.cards,sourceProfile:'modern_rws'});
  payload.tarotData.semanticContract=payload.semanticContract;
  vm.runInContext(promptCode,sandbox,{filename:'prompt-export.js'});
  const out=sandbox.JY_buildExportPrompt('tarot');
  assert(out.includes('ROOT-SPEC v91'));
  assert(out.includes('副業收入 超過 正職收入'));
  assert(out.includes('候選語義原子'));
  assert(out.includes('synthesis_only 單位只能綜合 dependsOn'));
  assert(!out.includes('若「成功」是指'));
});

console.log(`\n${passed} v91 root architecture tests passed`);
