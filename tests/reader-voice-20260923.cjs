'use strict';
const assert = require('node:assert/strict');
const quality = require('../JS/reading-quality.js');

const expected = [
  'tarot', 'ootk', 'lenormand', 'bazi', 'compat', 'ziwei', 'meihua',
  'liuyao', 'yijing', 'oracle', 'astro', 'vedic', 'name', 'personality'
];

assert.equal(quality.readingVersion, '6.1.0');
assert.deepEqual(quality.methodKinds(), expected, 'all active divination methods use the shared answer contract');

const answerStyle = quality.plainText();
for (const phrase of [
  '像命理師當面解惑',
  '第一段先回答原問題',
  '是非題先給主判',
  '比較題先說較支持哪一方',
  '多個子題逐一作答',
  '不寫成技術報告或固定檢核表'
]) assert(answerStyle.includes(phrase), `shared answer style: ${phrase}`);

for (const kind of expected) {
  const lines = quality.lines(kind);
  assert.equal(lines[0], answerStyle, `${kind} places the answer contract before technical reading rules`);
  assert(quality.methodLines(kind).length >= 2, `${kind} retains method-specific interpretation depth`);
  const payload = quality.payloadGuide([kind]);
  assert.equal(payload.answerStyle, answerStyle, `${kind} API payload uses the same answer style`);
  assert(payload.methods[kind].length >= 2, `${kind} API payload retains its method guide`);
  assert(quality.recommendationText(kind).includes('【最後成稿提醒】'), `${kind} repeats the direct-answer priority at the end`);
}

assert(answerStyle.length < 800, 'shared voice instructions stay concise beside detailed method rules');
console.log('reader voice: all 14 methods keep native depth and share a concise answer-first output contract');
