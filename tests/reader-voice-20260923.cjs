'use strict';
const assert = require('node:assert/strict');
const quality = require('../JS/reading-quality.js');

const expected = [
  'tarot', 'ootk', 'lenormand', 'bazi', 'compat', 'ziwei', 'meihua',
  'liuyao', 'yijing', 'oracle', 'astro', 'vedic', 'name', 'liuren', 'personality'
];

assert.equal(quality.readingVersion, '9.4.0');
assert.deepEqual(quality.methodKinds(), expected, 'all active divination methods use the shared answer contract');

const answerStyle = quality.plainText();
for (const phrase of [
  '像命理師當面解惑',
  '第一句就回答原問題',
  '深度判讀流程',
  '最有力的正向依據',
  '【深度來自完整推理，不靠字數】',
  '【篇幅由問題決定】',
  '力量如何傳到結果',
  '最強反證限制的是哪一層',
  '可執行做法或觀察指標',
  '明確、無壓力且可撤回的同意',
  '把可核對的排盤／抽取事實、傳統方法的解釋、對個案的推論分清楚'
]) assert(answerStyle.includes(phrase), `shared answer style: ${phrase}`);
assert(!answerStyle.includes('約3～6組真正獨立'), 'analysis depth is based on relevant evidence, not a fixed evidence count');
assert(!answerStyle.includes('5～8段'), 'response length follows the question instead of a fixed paragraph count');

for (const kind of expected) {
  const lines = quality.lines(kind);
  assert.equal(lines[0], answerStyle, `${kind} places the answer contract before technical reading rules`);
  assert(quality.methodLines(kind).length >= 2, `${kind} retains method-specific interpretation depth`);
  assert(quality.lines(kind).join('\n').includes('證據完整度'), `${kind} carries the evidence audit into the actual method prompt`);
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

assert(answerStyle.length > 900 && answerStyle.length < 1600, 'shared answer contract must carry a complete depth checklist without becoming a method textbook');
console.log('reader voice: all 15 methods keep native depth, evidence-linked answers and a grounded bracelet close');
