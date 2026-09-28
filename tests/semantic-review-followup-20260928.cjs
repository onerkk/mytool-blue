const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const workflow=require('../JS/reading-workflow.js');
const foundation=require('../JS/tarot-foundation.js');
const quality=require('../JS/reading-quality.js');

const question='今年我還會遇到肉體桃花嗎？';
const plan=workflow.plan({question,method:'tarot',referenceDate:'2026-09-28'});
const event=plan.questionModel.events[0];
assert.equal(event.grammaticalSubject,'我','年份與「還」不能被併入主詞');
assert.deepEqual(Array.from(event.timeScope),['今年']);
assert.equal(event.recurrenceCue,'還');
assert.equal(event.priorOccurrenceVerified,false,'語用暗示不是使用者確認的既往事實');
assert.equal(event.recurrenceContext.status,'linguistic_presupposition_unverified');
assert.equal(event.explicitSexualAct,false,'「肉體桃花」不能自動升格為已問實際性行為');
assert.deepEqual(Array.from(event.lexicalInterpretation.candidates,x=>x.id),[
  'physical_attraction_opportunity','sexual_contact_occurrence','casual_sexual_relationship'
]);
assert.equal(event.lexicalInterpretation.selectedInterpretation,'physical_attraction_opportunity');
assert.equal(event.lexicalInterpretation.userConfirmed,false);
assert.ok(plan.questionModel.unresolved.ambiguities.some(x=>x.type==='lexical_polysemy'));
const prompt=workflow.render({question,method:'tarot',referenceDate:'2026-09-28'});
assert.match(prompt,/本次暫採「帶有身體吸引／性張力的相遇或機會」/);
assert.match(prompt,/使用者尚未確認/);
assert.match(prompt,/priorOccurrenceVerified=false/);
assert.match(prompt,/不等於實際發生性行為/);

const explicitSex=workflow.plan({question:'女友什麼時候才會開始再約一個女的一起做愛',method:'yijing',referenceDate:'2026-09-28'}).questionModel.events[0];
assert.equal(explicitSex.grammaticalSubject,'女友');
assert.equal(explicitSex.explicitSexualAct,true);
assert.equal(explicitSex.recurrenceCue,'再');
assert.equal(explicitSex.recurrenceContext.status,'linguistic_presupposition_unverified','「再」也必須顯式標成未核實的重複前提');
assert.match(workflow.render({question:'女友什麼時候才會開始再約一個女的一起做愛',method:'yijing'}),/原句「再」可暗示/);

const celtic=foundation.getMethod('celtic_cross');
assert.deepEqual(Array.from(celtic.dignityLines),[],'凱爾特十字牌位語義不可誤作 Book T 元素尊貴相鄰線');
assert.ok(foundation.getMethodProtocol('celtic_cross').structures.every(x=>x.elementalDignity===false));
assert.equal(foundation.validateMethodRegistry().ok,true);
const centralPrompt=quality.lines('tarot').join('\n');
assert.equal((centralPrompt.match(/【白話優先】/g)||[]).length,1);
assert.equal((quality.recommendationPolicy(['tarot']).outputRule.match(/【本題延伸手鍊建議】/g)||[]).length,1);
assert.match(centralPrompt,/主觀滿意回饋只代表使用感受，不能單獨驗證預測/);

const followupSource=fs.readFileSync(require.resolve('../JS/forecast-review.js'),'utf8');
const stored=new Map();
const sandbox={localStorage:{getItem:k=>stored.get(k)||null,setItem:(k,v)=>stored.set(k,v)},Date,Math,JSON,Array,String,Object,Promise,CustomEvent:function(){}};
vm.runInNewContext(followupSource,sandbox);
const review=sandbox.JYForecastReview;
const rendered=review.renderControls({period:'今年',signal:'有身體吸引的相遇機會',confidence:'medium'},'tarot','今年我還會遇到肉體桃花嗎？');
assert.match(rendered,/type="date"/);
assert.match(rendered,/reading-review\.html#forecast-review/);
assert.doesNotMatch(rendered,/2026-12-31/,'回顧日不可由模型默認為占卜期限');
const record=review.add({question,method:'tarot',signal:'測試信號',period:'今年',confidence:'medium',dueDate:'2026-12-31'});
assert.ok(record&&record.id);
assert.equal(review.records()[0].status,'pending');
assert.equal(review.records()[0].dueDate,'2026-12-31');
assert.match(review.storage,/no upload or accuracy claim/);

const storySource=fs.readFileSync(require.resolve('../JS/ritual-story.js'),'utf8');
const indexSource=fs.readFileSync(require.resolve('../index.html'),'utf8');
assert.doesNotMatch(storySource,/JYHumanVoiceGuide|human-voice/,'不掛上無真人錄音的替代旁白介面');
assert.doesNotMatch(indexSource,/human-voice-guide|human-voice-audio-map/,'未交付真人錄音前，不顯示空殼音效功能');

const page=fs.readFileSync(require.resolve('../reading-review.html'),'utf8');
assert.match(page,/預測回顧（只存在此瀏覽器）/);
assert.match(page,/回顧日不是占卜算出的日期/);
assert.match(page,/forecast-review-export/);
console.log('semantic, structure, and forecast-review regressions passed');
