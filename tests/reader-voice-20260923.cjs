'use strict';
const assert = require('node:assert/strict');
const quality = require('../JS/reading-quality.js');

const expected = [
  'tarot', 'ootk', 'lenormand', 'bazi', 'compat', 'ziwei', 'meihua',
  'liuyao', 'yijing', 'oracle', 'astro', 'vedic', 'name', 'personality'
];

assert.equal(quality.readingVersion, '6.3.0');
assert.deepEqual(quality.methodKinds(), expected, 'all active divination methods use the shared answer contract');

const answerStyle = quality.plainText();
for (const phrase of [
  '像命理師當面解惑',
  '先答原問題',
  '4～6段自然段落',
  '2～4組最有解釋力',
  '如何落到原問題',
  '交代最重要的牽制或相反訊號',
  '同一訊號若對不同人物或方向作用相反，要分開說清',
  '可執行做法或觀察指標',
  '每位參與者明確、無壓力且可撤回的同意',
  '把可核對的排盤／抽取事實、傳統方法的解釋、對個案的推論分清楚'
]) assert(answerStyle.includes(phrase), `shared answer style: ${phrase}`);

for (const kind of expected) {
  const lines = quality.lines(kind);
  assert.equal(lines[0], answerStyle, `${kind} places the answer contract before technical reading rules`);
  assert(quality.methodLines(kind).length >= 2, `${kind} retains method-specific interpretation depth`);
  assert(quality.lines(kind).join('\n').includes('主判前核對'), `${kind} carries the evidence audit into the actual method prompt`);
  const payload = quality.payloadGuide([kind]);
  assert.equal(payload.answerStyle, answerStyle, `${kind} API payload uses the same answer style`);
  assert(payload.methods[kind].length >= 2, `${kind} API payload retains its method guide`);
  const recommendation = quality.recommendationText(kind);
  assert(recommendation.includes('【本題延伸手鍊建議】'), `${kind} includes the bracelet recommendation`);
  assert(recommendation.includes('本次一項有效盤面發現'), `${kind} ties the recommendation to this reading`);
  assert(recommendation.includes('【本法選材提醒】'), `${kind} keeps its own selection guard`);
  assert(!recommendation.includes('材質參考：'), `${kind} avoids the generic material encyclopedia`);
  const ending = quality.recommendationEnding(kind);
  assert.equal(ending.split('https://shopee.tw/a50h95648d?tab=shop').length - 1, 1, `${kind} keeps one shop link`);
  assert(ending.endsWith('願你諸事順遂。'), `${kind} keeps the blessing after the link`);
}

const liuyaoGuide = quality.methodLines('liuyao').join('\n');
for (const phrase of [
  'influences.network', '世與應', '月令／日辰關係須按來源方向解讀',
  '變出的六親當成另一個已發生的人事或對方心念', '完整支組、動爻數及空破條件'
]) assert(liuyaoGuide.includes(phrase), `six-line reading safeguard: ${phrase}`);

assert(answerStyle.length < 700, 'shared answer contract stays focused while asking for evidence-linked depth');
console.log('reader voice: all 14 methods keep native depth, evidence-linked answers and a grounded bracelet close');
