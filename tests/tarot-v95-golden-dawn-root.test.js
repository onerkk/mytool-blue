'use strict';
const assert = require('assert');
const fs = require('fs');
const vm = require('vm');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
function read(rel){ return fs.readFileSync(path.join(ROOT, rel), 'utf8'); }

// 1. Unified Book T core loads and exposes the required source contract.
const sandbox = { console, globalThis:null };
sandbox.globalThis = sandbox;
vm.createContext(sandbox);
vm.runInContext(read('JS/golden-dawn-tarot.js'), sandbox, {filename:'golden-dawn-tarot.js'});
const gd = sandbox.JYGoldenDawn;
assert(gd, 'JYGoldenDawn must load');
assert.strictEqual(gd.sourceId, 'gd_book_t');
assert.strictEqual(gd.version, '1.4.0');
assert(/不使用 Waite 固定正逆/.test(gd.sourceContract().reversalPolicy));

// 2. Book T titles/correspondences and court mapping.
let p = gd.profile({n:'寶劍五', suit:'sword', num:5, rank:'5', astro:'金星水瓶'});
assert.strictEqual(p.bookTTitle, '失敗之主');
assert.strictEqual(p.element, '風');
p = gd.profile({n:'戀人', suit:'major'});
assert.strictEqual(p.astro, 'Gemini');
assert(/靈感/.test(p.core) && /行動/.test(p.core), 'Lovers must use Book T brief meaning, not RWS choice-only meaning');
p = gd.profile({n:'權杖國王', suit:'wand', rank:'king'});
assert(/Knight/.test(p.bookTTitle), 'Artwork King must map to Book T Knight/Lord');
p = gd.profile({n:'權杖騎士', suit:'wand', rank:'knight'});
assert(/Prince/.test(p.bookTTitle), 'Artwork Knight must map to Book T Prince');

// 3. Elemental dignities and count values.
assert.strictEqual(gd.relation({n:'權杖二',suit:'wand',num:2},{n:'聖杯二',suit:'cup',num:2}).code, 'weaken');
assert.strictEqual(gd.relation({n:'寶劍二',suit:'sword',num:2},{n:'金幣二',suit:'pent',num:2}).code, 'weaken');
assert.strictEqual(gd.relation({n:'權杖二',suit:'wand',num:2},{n:'寶劍二',suit:'sword',num:2}).code, 'support');
assert.strictEqual(gd.countValue({n:'聖杯王牌',suit:'cup',num:1,rank:'ace'}), 11);
assert.strictEqual(gd.countValue({n:'聖杯侍者',suit:'cup',rank:'page'}), 7);
assert.strictEqual(gd.countValue({n:'聖杯皇后',suit:'cup',rank:'queen'}), 4);
assert.strictEqual(gd.countValue({n:'太陽',suit:'major'}), 9);
assert.strictEqual(gd.countValue({n:'戀人',suit:'major'}), 12);
assert.strictEqual(gd.countValue({n:'吊人',suit:'major'}), 3);

// 4. All public spread profiles are source-locked to Book T.
const sem = read('JS/tarot-semantic-engine.js');
[
  'three_card','five_card','cross','either_or','relationship','timeline','celtic_cross',
  'tree_of_life','zodiac','minor_arcana','fifteen_card','mathers_21','mathers_horseshoe','horseshoe','ootk'
].forEach(id => assert(new RegExp("'"+id+"'[\\s\\S]{0,180}'gd_book_t'").test(sem), id+' must be gd_book_t'));
assert(/forbiddenMixes:\s*\['modern_rws',\s*'waite_1910',\s*'thoth_crowley'/.test(sem));

// 5. Runtime load order: the single core must load before all tarot consumers.
const index = read('index.html');
const order = [
  'JS/golden-dawn-tarot.js','JS/tarot.js','JS/tarot_upgrade.js','JS/tarot-semantic-engine.js','JS/ai-analysis.js','JS/prompt-export.js'
].map(s => index.indexOf(s));
order.forEach((n,i)=>assert(n>=0, order[i]+' missing'));
for(let i=1;i<order.length;i++) assert(order[i] > order[i-1], 'script load order is wrong');
assert(index.includes('20260717v95_2'));

// 6. OOTK requires immutable pre-deal binding; keyword classification is suggestion-only.
const upgrade = read('JS/tarot_upgrade.js');
['ootk-bind-pile','ootk-bind-house-primary','ootk-bind-house-cognate','ootk-bind-sign','ootk-bind-seph'].forEach(id=>assert(upgrade.includes(id), id+' missing'));
assert(/function runFullOOTK\(significatorId, questionText, predeclaredBindings\)/.test(upgrade));
assert(/bindingPolicy = 'confirmed_before_deal'/.test(upgrade));
assert(/abandonedAt = 'predeal_binding'/.test(upgrade));
assert(/var expectedPiles = \[bindings\.expectedPile\]/.test(upgrade));
assert(/var expectedHouses = \[bindings\.primaryHouse\]/.test(upgrade));
assert(/var expectedSigns = \[bindings\.expectedSign\]/.test(upgrade));
assert(/var expectedSephiroth = \[bindings\.expectedSephirah\]/.test(upgrade));
assert(/window\.ootkMathers1888Meanings = null/.test(upgrade));
assert(/window\.jyWaitePKTMeanings = null/.test(upgrade));
assert(/thirty-six|三十六/.test(upgrade));

// 7. AI payloads must no longer serialize physical upright/reversed labels as evidence.
const ai = read('JS/ai-analysis.js');
const tarotSync = ai.slice(ai.indexOf('// ═══ 4. 塔羅（Golden Dawn Book T 單一來源）'), ai.indexOf('// ═══ 5. 西洋占星'));
assert(tarotSync.includes('JYGoldenDawn'));
assert(!/[（(](順|逆|正位|逆位)[）)]/.test(tarotSync));
assert(!/missingElements|reversedRatio|numerology|detectTarotCombos/.test(tarotSync));
assert(ai.includes('未完成實體共指不得具體化為某一人物'));

// 8. Prompt source lock and high-risk/time boundaries.
const prompt = read('JS/prompt-export.js');
assert(prompt.includes('唯一牌義來源：Golden Dawn《Book T／Liber T》'));
assert(prompt.includes('不得混入 Waite 1910 固定正逆位字典'));
assert(prompt.includes('第三十六') === false, 'Do not invent a 36-unit time system');
assert(prompt.includes('第四次操作只讀代表牌後方三十六張'));
assert(prompt.includes('不能取代帳目、合約、檢查、證據或專業意見'));

// 9. tarot.js is a consumer, not a duplicate copy of the Book T source core.
const tarot = read('JS/tarot.js');
assert(!tarot.includes('unified tarot core v1.'));
assert(tarot.includes('Golden Dawn Book T 全站相容覆寫'));

console.log('tarot-v95-golden-dawn-root: PASS');
