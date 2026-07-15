'use strict';

const fs = require('fs');
const vm = require('vm');
const path = require('path');

const root = path.join(__dirname, '..');
const promptSource = fs.readFileSync(path.join(root, 'JS', 'prompt-export.js'), 'utf8');
const aiSource = fs.readFileSync(path.join(root, 'JS', 'ai-analysis.js'), 'utf8');
const tarotUpgradeSource = fs.readFileSync(path.join(root, 'JS', 'tarot_upgrade.js'), 'utf8');

let failed = 0;
let passed = 0;
function check(name, condition, detail = '') {
  if (!condition) {
    failed++;
    console.error(`FAIL: ${name}${detail ? ' — ' + detail : ''}`);
  } else passed++;
}
function nodeStub() {
  return {
    value: '', style: {}, textContent: '', innerHTML: '', disabled: false,
    appendChild() {}, removeChild() {}, setAttribute() {}, getAttribute() { return null; },
    addEventListener() {}, querySelector() { return nodeStub(); }, querySelectorAll() { return []; },
    focus() {}, select() {}
  };
}

const tarotPayload = {
  tarotData: {
    spreadType: 'relationship', spreadZh: '關係牌陣',
    cards: [
      { positionMeaning: '你', name: '▼逆位 愚者', isUp: false, keywords: '魯莽·失根·逃避', baseMeaning: '魯莽、失根、逃避', meaning: '不願定義關係，逃避承諾' },
      { positionMeaning: '對方', name: '▼逆位 寶劍皇后', isUp: false, keywords: '冷酷·疏離', baseMeaning: '冷酷、疏離、過度理性', meaning: '有一位異性暗戀你' },
      { positionMeaning: '關係現況', name: '▲正位 聖杯八', isUp: true, keywords: '離開·追尋', baseMeaning: '離開、追尋更深、放棄舊有', meaning: '有人正在離開舊感情' },
      { positionMeaning: '挑戰', name: '▲正位 死神', isUp: true, keywords: '結束·轉化', baseMeaning: '結束、轉化、新階段', meaning: '一定重生' },
      { positionMeaning: '建議', name: '▲正位 女祭司', isUp: true, keywords: '觀察·隱而未明', baseMeaning: '觀察、沉默、未明', meaning: '對方有好感但還沒說出口' },
      { positionMeaning: '走向', name: '▲正位 隱者', isUp: true, keywords: '獨處·反省', baseMeaning: '獨處、反省、距離', meaning: '最多只有一個人' }
    ],
    summary: '4正2逆',
    majorWeight: '大牌佔67%——命運級事件',
    elementInteraction: '主導水；缺火、土',
    opposingPairs: ['固定組合答案'],
    combos: '先苦後甜',
    numerology: '8＝業力',
    timeConclusion: '隱者→關鍵轉折',
    courtPeople: '一名成熟女性',
    tensions: ['一定有對象'],
    preStats: { insights: ['個人能改變有限'] }
  }
};

const ootkPayload = {
  mode: 'ootk',
  ootkData: {
    significator: { name: '魔術師', isUp: false },
    operations: {
      op1: { stage: 1, activePile: 'fire', activeCards: [{ name: '魔術師', thothTitle: 'The Magus' }, { name: '權杖三', thothTitle: 'Virtue' }], countingPath: [{ cardName: '權杖三', countValue: 3, startDirection: 'right' }], pairs: [] },
      op2: { stage: 2, activeHouse: 10, activeCards: [{ name: '魔術師' }, { name: '皇帝' }], countingPath: [{ cardName: '皇帝', countValue: 4 }], pairs: [], attempt: 2, retryNote: '相應宮位重試' },
      op3: { stage: 3, activeSign: '摩羯座', activeCards: [{ name: '魔術師' }, { name: '圓盤八' }], countingPath: [{ cardName: '圓盤八', countValue: 8 }], pairs: [] },
      op4: { stage: 4, decanSign: '摩羯座', decanRange: '10°–20°', decanPlanet: '火星', decanDateRange: '一月上旬', activeCards: [{ name: '魔術師' }, { name: '圓盤三' }], countingPath: [{ cardName: '圓盤三', countValue: 3 }], pairs: [] },
      op5: { stage: 5, activeSephirah: 'Tiphereth', sephirahZh: '美', activeCards: [{ name: '魔術師' }, { name: '太陽' }], countingPath: [{ cardName: '太陽', countValue: 19 }], pairs: [], sephExpectationMet: false, sephExpectationNote: '未落預期質點' }
    },
    crossAnalysis: {},
    majorWeight: '命運級', numberPatterns: ['三張8'], courtPeople: ['某人']
  }
};

const sandbox = {
  console, Date, Math, Promise,
  setTimeout() {}, clearTimeout() {},
  navigator: { clipboard: { writeText() { return Promise.resolve(); } } },
  document: {
    getElementById() { return null; }, createElement: nodeStub,
    body: { appendChild() {}, removeChild() {} }, head: { appendChild() {} }, execCommand() { return true; }
  },
  window: {
    S: { form: { q: '我在公司有幾個異性喜歡我' }, tarot: { spreadType: 'relationship' } },
    JY_WAITE_PURE: false,
    _buildTarotOnlyPayload() { return tarotPayload; },
    _buildOOTKPayload() { return ootkPayload; },
    addEventListener() {}, open() {}, scrollTo() {}
  }
};
sandbox.window.window = sandbox.window;
vm.createContext(sandbox);
vm.runInContext(promptSource, sandbox);

function tarotPrompt(question, spread = 'relationship') {
  sandbox.window.S.form.q = question;
  sandbox.window.S.tarot.spreadType = spread;
  tarotPayload.tarotData.spreadType = spread;
  tarotPayload.tarotData.spreadZh = spread;
  return sandbox.window.JY_buildExportPrompt('tarot');
}

const countPrompt = tarotPrompt('我在公司有幾個異性喜歡我', 'relationship');
check('v89 header', promptSource.includes('[v89.0]'));
check('question demand model', countPrompt.includes('建立問題需求模型'));
check('spread observation model', countPrompt.includes('建立牌陣觀測模型'));
check('demand evidence matrix', countPrompt.includes('建立需求—證據矩陣'));
check('count dimension detected', countPrompt.includes('原問句要求的資訊維度：數量／基數'));
check('relationship counterpart is aggregate', countPrompt.includes('「對方」是聚合角色通道'));
check('aggregate slot is not one person or upper bound', countPrompt.includes('不等於一人、也不構成人數上限'));
check('quantity cannot be inferred from card count', countPrompt.includes('不得以牌張數、牌號、宮廷牌數或聚合角色位補造數量'));
check('unmeasured dimension does not cancel rest', countPrompt.includes('未量測的維度要誠實說明，但其餘有效資訊仍要完整解讀'));
check('neutral base meaning exported', countPrompt.includes('中性語義素材：冷酷·疏離') && countPrompt.includes('冷酷、疏離、過度理性'));
check('topic-routed meanings are not exported', !countPrompt.includes('有一位異性暗戀你') && !countPrompt.includes('對方有好感但還沒說出口') && !countPrompt.includes('最多只有一個人'));
check('pre-baked narrative layers are not exported', !countPrompt.includes('命運級事件') && !countPrompt.includes('8＝業力') && !countPrompt.includes('固定組合答案') && !countPrompt.includes('個人能改變有限'));
check('non-time question does not receive time conclusion', !countPrompt.includes('隱者→關鍵轉折'));

const timingPrompt = tarotPrompt('這件事什麼時候會有結果？', 'timeline');
check('timing dimension detected', timingPrompt.includes('時間'));
check('time capability distinguishes relative and exact', timingPrompt.includes('精確日期只在資料區有可回溯占星／旬位錨點時量測'));
check('time anchor included only when asked', timingPrompt.includes('可回溯時間錨點'));

const spreadExpectations = {
  three_card: ['三個明示位置', '不能拿來計數或換算日期'],
  five_card: ['現況、形成原因、阻礙', '不以五張牌當作五個人物'],
  cross: ['核心狀態與阻礙', '不直接枚舉未知人群'],
  either_or: ['兩條彼此分離的選項路徑', '不能把路徑牌號換算成機率或金額'],
  timeline: ['相對先後', '五個階段不是固定五天或五月'],
  relationship: ['聚合角色通道', '不構成人數上限'],
  celtic_cross: ['單一情勢的核心', '十張不是十個人物或十個月'],
  tree_of_life: ['十個質點', '質點不等於現實人數'],
  zodiac: ['十二個生活領域', '宮位數也不是事件數量'],
  minor_arcana: ['日常互動、流程', '七個位置不等於七個實體'],
  fifteen_card: ['五個三牌組', '牌數不作現實計數'],
  mathers_21: ['三排連續故事', '二十一張與配對數不是人數'],
  mathers_horseshoe: ['A、C、E三個大型證據群', '牌組大小不是現實數量'],
  horseshoe: ['過去、現在、隱藏作用', '不直接證明特定人物或數量']
};
for (const [spread, phrases] of Object.entries(spreadExpectations)) {
  const prompt = tarotPrompt('請完整分析目前情況', spread);
  for (const phrase of phrases) check(`capability ${spread}: ${phrase}`, prompt.includes(phrase));
}

sandbox.window.S.form.q = '我的事業最後會怎麼發展？';
const ootkPrompt = sandbox.window.JY_buildExportPrompt('ootk');
check('OOTK observation matrix', ootkPrompt.includes('問題需求與方法能力') && ootkPrompt.includes('證據矩陣'));
check('OOTK five stages', ootkPrompt.includes('第一次操作觀察當下情勢') && ootkPrompt.includes('第五次觀察最終結果'));
check('OOTK count is navigation not quantity', ootkPrompt.includes('計數值是牌序導航') && ootkPrompt.includes('不能被換算成現實人數'));
check('OOTK Book T ace count source', ootkPrompt.includes('依《Book T》計數值表採 Ace＝11'));
check('OOTK does not attribute ace count to Liber 78', !ootkPrompt.includes('Aces 採 count 11（Crowley·Liber 78）'));
check('OOTK no fake facing from reversal', !ootkPrompt.includes('重心傾向未來') && !ootkPrompt.includes('注意力傾向過去'));
check('OOTK structured active cards', ootkPrompt.includes('本層活躍牌（中性資料）'));
check('OOTK retry is preserved', ootkPrompt.includes('本層重試：第2次'));
check('OOTK op5 mismatch nuance', ootkPrompt.includes('依本法不自動使整次占卜失效'));
check('OOTK pre-baked major/court/number narratives removed', !ootkPrompt.includes('命運級') && !ootkPrompt.includes('三張8') && !ootkPrompt.includes('宮廷人物：某人'));

// Static data-pipeline checks: modern RWS and OOTK must remain neutral before the AI interprets them.
const tarotBuilderStart = aiSource.indexOf('function _buildTarotOnlyPayload()');
const tarotBuilderEnd = aiSource.indexOf('async function _triggerTarotAI()', tarotBuilderStart);
const tarotBuilder = aiSource.slice(tarotBuilderStart, tarotBuilderEnd);
check('AI payload uses neutral base meaning', tarotBuilder.includes('card.baseMeaning = isUp ? (c.up || \'\') : (c.rv || \'\')'));
check('AI payload no topic-specific love routing', !tarotBuilder.includes("if (_focusType === 'love'"));
check('AI payload suppresses fixed narratives', tarotBuilder.includes('opposingPairs = [];') && tarotBuilder.includes("numerologyText = '';"));
const ootkBuilderStart = aiSource.indexOf('function _buildOOTKPayload()');
const ootkBuilderEnd = aiSource.indexOf('// ── OOTK 結果渲染', ootkBuilderStart);
const ootkBuilder = aiSource.slice(ootkBuilderStart, ootkBuilderEnd);
check('OOTK payload is structured', ootkBuilder.includes('function _ootkOpPayload') && ootkBuilder.includes('operations: ops'));
check('OOTK payload no topic-routed cardStrFull', !ootkBuilder.includes('function cardStrFull'));
check('OOTK derived person/count narratives disabled', ootkBuilder.includes('numberPatterns: []') && ootkBuilder.includes('courtPeople: []'));

function extractFunction(source, name) {
  const start = source.indexOf(`function ${name}(`);
  if (start < 0) throw new Error(`missing ${name}`);
  const brace = source.indexOf('{', start);
  let depth = 0;
  for (let i = brace; i < source.length; i++) {
    if (source[i] === '{') depth++;
    else if (source[i] === '}') {
      depth--;
      if (depth === 0) return source.slice(start, i + 1);
    }
  }
  throw new Error(`unterminated ${name}`);
}
const routerSandbox = {};
vm.createContext(routerSandbox);
vm.runInContext(`${extractFunction(tarotUpgradeSource, 'detectSpreadType')}; this.detectSpreadType = detectSpreadType;`, routerSandbox);
const route = routerSandbox.detectSpreadType;
check('cardinality auto-route uses event spread', route('我在公司有幾個異性喜歡我', 'secret') === 'five_card', route('我在公司有幾個異性喜歡我', 'secret'));
check('known partner remains relationship', route('我跟現任的關係會怎樣？', 'love') === 'relationship', route('我跟現任的關係會怎樣？', 'love'));
check('timing remains timeline', route('什麼時候會有人聯絡我？', 'love') === 'timeline', route('什麼時候會有人聯絡我？', 'love'));
check('comparison remains either-or', route('留下還是離職？', 'work') === 'either_or', route('留下還是離職？', 'work'));

if (failed) {
  console.error(`\n${failed} failed, ${passed} passed`);
  process.exit(1);
}
console.log(`${passed} passed`);
