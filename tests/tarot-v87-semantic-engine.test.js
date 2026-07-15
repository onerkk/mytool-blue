'use strict';

const fs = require('fs');
const vm = require('vm');
const path = require('path');

const sourcePath = path.join(__dirname, '..', 'JS', 'prompt-export.js');
const source = fs.readFileSync(sourcePath, 'utf8');

let failed = 0;
let passed = 0;
function check(name, condition, detail = '') {
  if (!condition) {
    failed++;
    console.error(`FAIL: ${name}${detail ? ' — ' + detail : ''}`);
  } else {
    passed++;
  }
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
    spreadType: 'relationship',
    spreadZh: '關係牌陣',
    cards: [
      { positionMeaning: '你', name: '金幣九', isUp: true, keywords: '自足', meaning: '獨立' },
      { positionMeaning: '對方', name: '聖杯五', isUp: false, keywords: '接受', meaning: '走出失落' },
      { positionMeaning: '現況', name: '聖杯七', isUp: true, keywords: '選擇', meaning: '分辨' },
      { positionMeaning: '挑戰', name: '皇帝', isUp: false, keywords: '僵化', meaning: '控制' },
      { positionMeaning: '建議', name: '死神', isUp: true, keywords: '轉化', meaning: '結束舊模式' },
      { positionMeaning: '走向', name: '寶劍騎士', isUp: true, keywords: '直接', meaning: '快速行動' }
    ],
    summary: '4正2逆',
    elementInteraction: '主導水；缺火',
    timeConclusion: '寶劍騎士：快'
  }
};

const ootkPayload = {
  mode: 'ootk',
  ootkData: {
    significator: { name: '魔術師' },
    operations: {
      op1: { activePile: 'fire', activeCards: [{ name: '魔術師' }, { name: '權杖三' }], countingPath: [{ cardName: '權杖三', countValue: 3 }], pairs: [] },
      op2: { activeHouse: 10, activeCards: [{ name: '魔術師' }, { name: '皇帝' }], countingPath: [{ cardName: '皇帝', countValue: 4 }], pairs: [] },
      op3: { activeSign: '摩羯座', activeCards: [{ name: '魔術師' }, { name: '圓盤八' }], countingPath: [{ cardName: '圓盤八', countValue: 8 }], pairs: [] },
      op4: { decanSign: '摩羯座', decanRange: '10°–20°', decanPlanet: '火星', decanDateRange: '一月上旬', activeCards: [{ name: '魔術師' }, { name: '圓盤三' }], countingPath: [{ cardName: '圓盤三', countValue: 3 }], pairs: [] },
      op5: { activeSephirah: 'Tiphereth', sephirahZh: '美', activeCards: [{ name: '魔術師' }, { name: '太陽' }], countingPath: [{ cardName: '太陽', countValue: 19 }], pairs: [] }
    },
    crossAnalysis: {}
  }
};

const sandbox = {
  console,
  Date,
  Math,
  Promise,
  setTimeout() {},
  clearTimeout() {},
  navigator: { clipboard: { writeText() { return Promise.resolve(); } } },
  document: {
    getElementById() { return null; },
    createElement: nodeStub,
    body: { appendChild() {}, removeChild() {} },
    head: { appendChild() {} },
    execCommand() { return true; }
  },
  window: {
    S: { form: { q: '會有職場異性跟我告白嗎？' }, tarot: { spreadType: 'relationship' } },
    JY_WAITE_PURE: false,
    _buildTarotOnlyPayload() { return tarotPayload; },
    _buildOOTKPayload() { return ootkPayload; },
    addEventListener() {},
    open() {},
    scrollTo() {}
  }
};
sandbox.window.window = sandbox.window;
vm.createContext(sandbox);
vm.runInContext(source, sandbox);

const tarotPrompt = sandbox.window.JY_buildExportPrompt('tarot');
const ootkPrompt = sandbox.window.JY_buildExportPrompt('ootk');

// Unified engine, not domain patches.
check('tarot prompt builds', typeof tarotPrompt === 'string' && tarotPrompt.length > 1000);
check('ootk prompt builds', typeof ootkPrompt === 'string' && ootkPrompt.length > 1000);
check('full proposition engine', tarotPrompt.includes('完整命題裁決'));
check('position is a lens, not fact', tarotPrompt.includes('牌位名稱是觀察問題的鏡頭，不是事實宣告'));
check('unknown relationship counterpart is conditional', tarotPrompt.includes('若問的是尚未確定存在的對象或未來人物'));
check('subclaim cannot replace event', tarotPrompt.includes('較弱子命題'));
check('length driven by effective propositions', tarotPrompt.includes('答案長短只由有效命題數量決定'));
check('imagery is optional and material', source.includes('圖像細節只有在它實際改變命題時才寫入，不設固定張數'));
check('no love suit formula', !source.includes('缺聖杯＝'));
check('no support/opposition card voting instruction', !source.includes('先把「支持」與「反對」的牌各清點一次'));
check('no forced two-image quota', !source.includes('至少自然帶到 2 張 RWS'));
check('no fixed all-card-name output quota', !source.includes('每張牌都要在正文點到名'));
check('suit counts do not define domain', tarotPrompt.includes('不能由某花色多寡直接指定題目領域'));

const spreadExpectations = {
  three_card: '三張全部處理',
  five_card: '五張全部內部處理',
  cross: '五個位置共同形成完整命題',
  either_or: '同一組比較標準',
  timeline: '事件階段',
  relationship: '不能反過來證明有人存在',
  celtic_cross: '第9位只校正主觀期待與擔憂',
  tree_of_life: '所有質點內部處理',
  zodiac: '正文不強迫十二段',
  minor_arcana: '正文按有效命題輸出',
  fifteen_card: '不為湊完整而逐張點名',
  mathers_21: '正文不強迫每張牌名逐一出現',
  mathers_horseshoe: '正文按有效命題整合'
};
for (const [spreadId, phrase] of Object.entries(spreadExpectations)) {
  sandbox.window.S.tarot.spreadType = spreadId;
  const prompt = sandbox.window.JY_buildExportPrompt('tarot');
  check(`spread module ${spreadId}`, prompt.includes(phrase), phrase);
}
sandbox.window.S.tarot.spreadType = 'relationship';

// OOTK uses Book T staged reasoning and restores validity boundary.
check('ootk five stage functions', ootkPrompt.includes('第一次操作說明占卜當下的情勢') && ootkPrompt.includes('第五次說明最終結果'));
check('ootk full counting path', ootkPrompt.includes('完整計數路徑要讀成過程'));
check('ootk pairing integrated', ootkPrompt.includes('代表牌兩側向外的配對'));
check('ootk suitability/abandon restored', ootkPrompt.includes('適配與中止——依原方法誠實處理'));
check('ootk does not turn mismatch into hidden truth', ootkPrompt.includes('不把落錯堆、落錯宮或落錯星座自動改稱「真正隱藏議題」'));
check('ootk no fake second validation', ootkPrompt.includes('不得假稱已完成第二次適配驗證'));
check('significator repeat is mechanism', ootkPrompt.includes('代表牌每次操作都會出現，是選堆機制'));
check('Source of Nile is secondary', ootkPrompt.includes('只能作現代實務的次級觀察'));
check('ootk output length semantic', ootkPrompt.includes('篇幅由有效命題數量決定'));

// Brand layer is separated from divination and does not claim effects.
sandbox.window.JY_WAITE_PURE = true;
const waitePrompt = sandbox.window.JY_buildExportPrompt('tarot');
check('pure Waite does not mix GD', waitePrompt.includes('不要疊加Golden Dawn元素尊嚴'));
sandbox.window.JY_WAITE_PURE = false;

check('brand cannot affect reading', tarotPrompt.includes('本段不得反向影響牌義、裁決或建議'));
check('brand no elemental deficiency claim', tarotPrompt.includes('不得解釋成問卜者「缺某元素」'));
check('fixed shop ending preserved', tarotPrompt.includes('[靜月之光蝦皮賣場](https://shopee.tw/a50h95648d?tab=shop)\n願你諸事順遂。'));

if (failed) {
  console.error(`\n${failed} failed, ${passed} passed`);
  process.exit(1);
}
console.log(`${passed} passed`);
