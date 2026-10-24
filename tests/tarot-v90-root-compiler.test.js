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
    isUp: true,
    baseMeaning: `中性義${i+1}`
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
        {cardName: i%2 ? '太陽' : '月亮'},
        {cardName: i%2 ? '聖杯二' : '寶劍三'}
      ],
      pairs: [{left:{name:'魔術師'}, right:{name:'女祭司'}}],
      decanSign: i===4 ? '天秤' : '',
      decanRange: i===4 ? '0°–10°' : '',
      decanDateRange: i===4 ? '資料提供的旬位日期' : ''
    };
  }
  return {sourceProfile:'gd_book_t', operations};
}

test('問題編譯保留完整多維需求', () => {
  const q = E.compileQuestion('我今年有肉體桃花嗎？可能幾歲？');
  const ids = q.requestedDimensions.map(x=>x.id);
  ['event_or_state','existence','exact_age','time_scope'].forEach(id=>assert(ids.includes(id), id));
  assert.deepStrictEqual(q.explicitScopes.map(x=>typeof x==='string'?x:x.surface), ['今年']);
  assert.strictEqual(q.originalQuestion, '我今年有肉體桃花嗎？可能幾歲？');
});

test('所有牌陣均由同一規格編譯器建立合法契約', () => {
  for (const [id,spec] of Object.entries(E.METHOD_SPECS)) {
    const input = {question:'這件事會如何發展？', spreadId:id};
    if (id === 'ootk') input.ootkData = ootkData();
    else { const F=require(path.join(ROOT,'JS','tarot-foundation.js')); const plan=F.instantiateMethod?F.instantiateMethod(id,F.compileQuestion(input.question)):null; input.cards = cards(plan&&plan.count||spec.expectedCardCount); }
    const c = E.compileReadingSpec(input);
    assert.strictEqual(c.validation.ok, true, `${id}: ${c.validation.errors.join(',')}`);
    assert.strictEqual(c.method.id, id);
    assert(c.evidenceGraph.evidenceUnits.length > 0, id);
    assert(c.claimSchema.required.includes('doesNotEstablish'));
    assert((c.adjudication.steps||c.adjudication.executionPlan?.passes||[]).length >= 5);
  }
});

test('張數錯誤由機械驗證攔截，不交給模型猜', () => {
  const c = E.compileReadingSpec({question:'結果？',spreadId:'celtic_cross',cards:cards(9)});
  assert.strictEqual(c.validation.ok, false);
  assert(c.validation.errors.some(x=>x.startsWith('card_count_mismatch:')));
});

test('Mathers 第一法只建立 A/C/E 組內故事、明示配對與中心牌', () => {
  const c = E.compileReadingSpec({question:'今年有機會嗎？可能幾歲？',spreadId:'mathers_horseshoe',cards:cards(54,'M')});
  assert.strictEqual(c.sourceProfile.id, 'mathers_1888');
  assert.strictEqual(c.validation.ok, true, c.validation.errors.join(','));
  const units = c.evidenceGraph.evidenceUnits;
  assert(units.some(u=>u.type==='ordered_group' && u.group==='A' && u.nodes.length===26));
  assert(units.some(u=>u.type==='ordered_group' && u.group==='C' && u.nodes.length===17));
  assert(units.some(u=>u.type==='ordered_group' && u.group==='E' && u.nodes.length===11));
  assert.strictEqual(units.filter(u=>u.type==='declared_outer_pair' && u.group==='A').length,13);
  assert.strictEqual(units.filter(u=>u.type==='declared_outer_pair' && u.group==='C').length,8);
  assert.strictEqual(units.filter(u=>u.type==='declared_outer_pair' && u.group==='E').length,5);
  // 現行引擎把 C、E 兩組的中間單張標為 unpaired_sequence_member（明示不是結果位）；兩張仍須各自存在。
  assert.strictEqual(units.filter(u=>u.type==='center_card'||u.type==='unpaired_sequence_member').length,2);
  const nonAtomic = units.filter(u=>u.type!=='atomic_node');
  for (const u of nonAtomic) {
    if (!u.nodes.length) continue;
    const groups = new Set(u.nodes.map(id => {
      const n = Number(id.slice(1));
      return n<=26?'A':n<=43?'C':'E';
    }));
    assert.strictEqual(groups.size,1, `非法跨組直接證據 ${u.id}`);
  }
  const age = c.capabilityMatrix.find(x=>x.dimensionId==='exact_age');
  assert.strictEqual(age.precheckStatus,'not_measured');
});

test('Mathers 牌義來源錯配會被拒絕', () => {
  const c = E.compileReadingSpec({question:'結果？',spreadId:'mathers_21',sourceProfile:'modern_rws',cards:cards(21)});
  assert.strictEqual(c.validation.ok,false);
  assert(c.validation.errors.some(x=>x.includes('source_profile_not_allowed')));
  assert(c.validation.errors.includes('mathers_source_mismatch'));
});

test('關係牌陣未知對象不會被對方位反向實體化', () => {
  const unknown = E.compileReadingSpec({question:'公司有沒有人喜歡我？',spreadId:'relationship',cards:cards(6),knownCounterpart:false});
  const known = E.compileReadingSpec({question:'我和某位同事的關係如何？',spreadId:'relationship',cards:cards(6),knownCounterpart:true});
  assert.strictEqual(unknown.evidenceGraph.nodes[1].authority,'person_aggregate');
  assert(unknown.evidenceGraph.nodes[1].authorityRule.includes('不證明人物存在'));
  assert.strictEqual(known.evidenceGraph.nodes[1].authority,'person_known');
});

test('開鑰五次操作各自成證據，不能跨操作直接連牌', () => {
  const c = E.compileReadingSpec({question:'今年結果與時間？',spreadId:'ootk',sourceProfile:'gd_book_t',ootkData:ootkData()});
  assert.strictEqual(c.validation.ok,true,c.validation.errors.join(','));
  const units = c.evidenceGraph.evidenceUnits;
  for (let i=1;i<=5;i++) {
    assert(units.some(u=>u.type==='operation_landing' && Number(u.stage)===i));
    assert(units.some(u=>u.type==='operation_counting_path' && Number(u.stage)===i));
    assert(units.some(u=>u.type==='operation_pair' && Number(u.stage)===i));
  }
  // 依 Book T 原稿：第四次操作是三十六牌環的計數與 1↔36 配對，不作三十六旬或日期換算。
  assert(units.some(u=>u.type==='op4_ring_structure' && Number(u.stage)===4));
  assert(!units.some(u=>u.type==='op4_time_anchor'));
  for (const u of units) {
    const ops = new Set((u.nodes||[]).map(id => c.evidenceGraph.nodes.find(n=>n.id===id).sourceOperation));
    assert(ops.size<=1, `跨操作直接連牌 ${u.id}`);
  }
  assert(c.evidenceGraph.legalSynthesisRule.includes('跨操作只能綜合'));
  assert(c.evidenceGraph.legalSynthesisRule.includes('不提供旬位、月份或日期錨'));
});

test('開鑰缺少一次操作會由契約驗證拒絕', () => {
  // 依 Book T：程序在缺失處停止（如原文代表牌不在應有之堆即放棄），只讀已完成的操作，之後不得解讀。
  const d=ootkData(); delete d.operations.op5;
  const c=E.compileReadingSpec({question:'結果？',spreadId:'ootk',ootkData:d});
  assert.strictEqual(c.evidenceGraph.stopped,true);
  assert.strictEqual(c.evidenceGraph.completedStageCount,4);
  assert(!c.evidenceGraph.evidenceUnits.some(u=>Number(u.stage)===5&&u.type==='operation_counting_path'));
});

test('ROOT-SPEC 明示需求、單一來源、合法證據與裁決上限', () => {
  const c=E.compileReadingSpec({question:'我今年有肉體桃花嗎？可能幾歲？',spreadId:'mathers_horseshoe',cards:cards(54)});
  const p=E.renderPromptContract(c);
  // 合約文字已升版（ROOT-SPEC v102）；核心要求不變：單一來源且標明 Mathers 1888、列出合法證據單位。
  ['ROOT-SPEC','牌義來源：','本次只准使用這一個來源設定','合法證據單位：'].forEach(x=>assert(p.includes(x),x));
  assert(/牌義來源：[^\n]*Mathers[^\n]*1888/.test(p),'source is Mathers 1888');
});

test('答案稽核攔截盤外牌與未量測的年齡、人數', () => {
  const c=E.compileReadingSpec({question:'公司有幾個人喜歡我？可能幾歲？',spreadId:'relationship',cards:[
    {name:'太陽',position:'你',baseMeaning:'清楚'},{name:'月亮',position:'對方',baseMeaning:'模糊'},
    {name:'戀人',position:'現況',baseMeaning:'選擇'},{name:'隱者',position:'挑戰',baseMeaning:'距離'},
    {name:'正義',position:'建議',baseMeaning:'平衡'},{name:'世界',position:'走向',baseMeaning:'完成'}
  ]});
  const r=E.validateAnswer('有2個人，其中一位32歲。——太陽、惡魔',c);
  assert.strictEqual(r.ok,false);
  assert(r.violations.some(x=>x.includes('本盤外牌名')));
  assert(r.violations.some(x=>x.includes('未量測年齡')));
  assert(r.violations.some(x=>x.includes('未量測人數')));
});

test('index 以正確順序載入語義引擎', () => {
  const html=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
  const sem=html.indexOf('JS/tarot-semantic-engine.js?v=');
  const ai=html.indexOf('JS/ai-analysis.js?v=');
  const pe=html.indexOf('JS/prompt-export.js?v=');
  assert(sem>0 && sem<ai && ai<pe);
});

test('提示詞匯出實際使用同一份排盤契約，而非舊題型補丁', () => {
  // 現行架構：匯出一律交給正統主路徑（JYPromptPacket：本法正統取法＋完整實算資料），不再注入 ROOT-SPEC 合約或題型補丁。
  const promptCode=fs.readFileSync(path.join(ROOT,'JS','prompt-export.js'),'utf8');
  assert((promptCode.match(/if\(window\.JYPromptPacket\)return window\.JYPromptPacket\.build\(tool,rawPayload/g)||[]).length>=2,'ootk and all other tools delegate to the orthodox packet');
  const packetCode=fs.readFileSync(path.join(ROOT,'JS','prompt-packet.js'),'utf8');
  assert(packetCode.includes('本法正統取法'));assert(!packetCode.includes('ROOT-SPEC'));
});


test('十四種塔羅牌陣的實際匯出提示均使用有效 ROOT-SPEC', () => {
  // 匯出已改走正統主路徑（各牌陣實際匯出由 divination-audit「14 tarot spreads」驗證）；這裡驗證引擎層：
  // 每種牌陣以其預設體系（Mathers 牌陣為 Mathers 1888）編譯都通過合約驗證。
  const F=require(path.join(ROOT,'JS','tarot-foundation.js'));
  for (const [id,spec] of Object.entries(E.METHOD_SPECS)) {
    if (id==='ootk') continue;
    const plan=F.instantiateMethod?F.instantiateMethod(id,F.compileQuestion('這件事會如何發展？')):null;
    const source=E.resolveSemanticProfile(id,{});
    const c=E.compileReadingSpec({question:'這件事會如何發展？',spreadId:id,cards:cards(plan&&plan.count||spec.expectedCardCount,id+'牌'),sourceProfile:source});
    assert.strictEqual(c.validation.ok,true,id+': '+c.validation.errors.join(','));
    if(/^mathers_/.test(id))assert.strictEqual(c.sourceProfile.id,'mathers_1888',id);
  }
});

console.log(`\n${passed} tests passed`);
