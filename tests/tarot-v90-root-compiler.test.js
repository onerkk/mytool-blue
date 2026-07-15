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
  assert.deepStrictEqual(q.explicitScopes, ['今年']);
  assert.strictEqual(q.originalQuestion, '我今年有肉體桃花嗎？可能幾歲？');
});

test('所有牌陣均由同一規格編譯器建立合法契約', () => {
  for (const [id,spec] of Object.entries(E.METHOD_SPECS)) {
    const input = {question:'這件事會如何發展？', spreadId:id};
    if (id === 'ootk') input.ootkData = ootkData();
    else input.cards = cards(spec.expectedCardCount);
    const c = E.compileReadingSpec(input);
    assert.strictEqual(c.validation.ok, true, `${id}: ${c.validation.errors.join(',')}`);
    assert.strictEqual(c.method.id, id);
    assert(c.evidenceGraph.evidenceUnits.length > 0, id);
    assert(c.claimSchema.required.includes('doesNotEstablish'));
    assert(c.adjudication.steps.length >= 5);
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
  assert.strictEqual(units.filter(u=>u.type==='center_card').length,2);
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
  assert.strictEqual(age.precheckStatus,'未直接量測');
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
  assert(units.some(u=>u.type==='op4_time_anchor' && Number(u.stage)===4));
  for (const u of units) {
    const ops = new Set((u.nodes||[]).map(id => c.evidenceGraph.nodes.find(n=>n.id===id).sourceOperation));
    assert(ops.size<=1, `跨操作直接連牌 ${u.id}`);
  }
  assert(c.evidenceGraph.legalSynthesisRule.includes('跨操作只能綜合階段命題'));
});

test('開鑰缺少一次操作會由契約驗證拒絕', () => {
  const d=ootkData(); delete d.operations.op5;
  const c=E.compileReadingSpec({question:'結果？',spreadId:'ootk',ootkData:d});
  assert.strictEqual(c.validation.ok,false);
  assert(c.validation.errors.some(x=>x.startsWith('ootk_operation_count_mismatch:')));
});

test('ROOT-SPEC 明示需求、單一來源、合法證據與裁決上限', () => {
  const c=E.compileReadingSpec({question:'我今年有肉體桃花嗎？可能幾歲？',spreadId:'mathers_horseshoe',cards:cards(54)});
  const p=E.renderPromptContract(c);
  ['ROOT-SPEC v90','需求維度：','牌義來源：Mathers 1888','本次只准使用這一個來源設定','合法證據單位：','內部命題帳本：','完整事件的結論強度不得高於最弱的必要語義成分'].forEach(x=>assert(p.includes(x),x));
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
  const sem=html.indexOf('JS/tarot-semantic-engine.js?v=20260715v90_0');
  const ai=html.indexOf('JS/ai-analysis.js?v=20260715v90_0');
  const pe=html.indexOf('JS/prompt-export.js?v=20260715v90_0');
  assert(sem>0 && sem<ai && ai<pe);
});

test('提示詞匯出實際使用同一份排盤契約，而非舊題型補丁', () => {
  const semanticCode=fs.readFileSync(path.join(ROOT,'JS','tarot-semantic-engine.js'),'utf8');
  const promptCode=fs.readFileSync(path.join(ROOT,'JS','prompt-export.js'),'utf8');
  const payload={
    mode:'tarot_only', question:'我今年有肉體桃花嗎？可能幾歲？',
    tarotData:{spreadType:'three_card',spreadZh:'三牌陣',sourceProfile:'modern_rws',cards:[
      {name:'太陽',position:'起點',positionMeaning:'起點',isUp:true,direction:'正位',baseMeaning:'清楚與成功'},
      {name:'月亮',position:'發展',positionMeaning:'發展',isUp:true,direction:'正位',baseMeaning:'模糊與不確定'},
      {name:'世界',position:'收束',positionMeaning:'收束',isUp:true,direction:'正位',baseMeaning:'完成'}
    ],summary:'3正0逆'}
  };
  const sandbox={console,Date,Set,Map,JSON,Math,setTimeout,clearTimeout};
  sandbox.window=sandbox; sandbox.globalThis=sandbox;
  sandbox.S={form:{question:payload.question},tarot:{spreadType:'three_card'}};
  sandbox.document={getElementById:()=>null,createElement:()=>({style:{},setAttribute(){},appendChild(){},select(){},focus(){}}),body:{appendChild(){},removeChild(){}}};
  sandbox.navigator={};
  sandbox._buildTarotOnlyPayload=()=>payload;
  vm.createContext(sandbox);
  vm.runInContext(semanticCode,sandbox,{filename:'tarot-semantic-engine.js'});
  payload.semanticContract=sandbox.JYTarotSemanticEngine.compileReadingSpec({question:payload.question,spreadId:'three_card',cards:payload.tarotData.cards,sourceProfile:'modern_rws'});
  payload.tarotData.semanticContract=payload.semanticContract;
  vm.runInContext(promptCode,sandbox,{filename:'prompt-export.js'});
  const out=sandbox.JY_buildExportPrompt('tarot');
  assert(out.includes('ROOT-SPEC v90'));
  assert(out.includes('E004｜adjacent_segment'));
  assert(out.includes('牌義來源：現代 RWS 通行義＋PCS 圖像〔modern_rws〕'));
  assert(!out.includes('【本次牌陣專屬讀法'));
  assert(!out.includes('缺聖杯＝'));
});


test('十四種塔羅牌陣的實際匯出提示均使用有效 ROOT-SPEC', () => {
  const semanticCode=fs.readFileSync(path.join(ROOT,'JS','tarot-semantic-engine.js'),'utf8');
  const promptCode=fs.readFileSync(path.join(ROOT,'JS','prompt-export.js'),'utf8');
  const sandbox={console,Date,Set,Map,JSON,Math,setTimeout,clearTimeout};
  sandbox.window=sandbox; sandbox.globalThis=sandbox;
  sandbox.S={form:{question:'這件事會如何發展？'},tarot:{spreadType:'three_card'}};
  sandbox.document={getElementById:()=>null,createElement:()=>({style:{},setAttribute(){},appendChild(){},select(){},focus(){}}),body:{appendChild(){},removeChild(){}}};
  sandbox.navigator={};
  let current=null;
  sandbox._buildTarotOnlyPayload=()=>current;
  vm.createContext(sandbox);
  vm.runInContext(semanticCode,sandbox,{filename:'tarot-semantic-engine.js'});
  vm.runInContext(promptCode,sandbox,{filename:'prompt-export.js'});
  for (const [id,spec] of Object.entries(sandbox.JYTarotSemanticEngine.METHOD_SPECS)) {
    if (id==='ootk') continue;
    const source=sandbox.JYTarotSemanticEngine.resolveSemanticProfile(id,{});
    const cs=cards(spec.expectedCardCount,id+'牌');
    current={mode:'tarot_only',question:sandbox.S.form.question,tarotData:{spreadType:id,spreadZh:spec.label,sourceProfile:source,cards:cs,summary:`${cs.length}正0逆`}};
    current.semanticContract=sandbox.JYTarotSemanticEngine.compileReadingSpec({question:current.question,spreadId:id,cards:cs,sourceProfile:source});
    current.tarotData.semanticContract=current.semanticContract;
    sandbox.S.tarot.spreadType=id;
    const out=sandbox.JY_buildExportPrompt('tarot');
    assert(!out.includes('【系統錯誤】'),id);
    assert(out.includes('ROOT-SPEC v90'),id);
    assert(out.includes(`方法：${spec.label}〔${id}〕`),id);
    assert(out.includes('合法證據單位：'),id);
  }
});

console.log(`\n${passed} tests passed`);
