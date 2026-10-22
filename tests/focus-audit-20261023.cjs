'use strict';
/* 焦點層全面體檢：15 種方法 × 6 種題型，核對這幾輪實測找出的缺陷類型。失敗列出方法／題型／缺哪一類。 */
const assert=require('node:assert/strict');
const {environment,examples}=require('./native-fixtures-20261003.cjs');
const env=environment(),c=env.ctx;['tarot-foundation','prompt-brief','prompt-packet'].forEach(env.load);const x=examples(c),P=c.JYPromptPacket;
const Q={career:'目前的工作適合我嗎？',love:'他會跟我在一起嗎？',wealth:'明年財運會變好嗎？',timing:'我什麼時候會換工作？',amount:'下個月業績能做到多少？',third:'公司的女同事喜歡我嗎？',decision:'我該不該離職？',health:'媽媽的病會好轉嗎？',year:'2028年我適合創業嗎？',two:'我會升遷嗎？薪水會漲嗎？',rebound:'我們會復合嗎？',business:'我蝦皮水晶賣場這副業該一直堅持嗎？'};
const CHART=['bazi','ziwei','vedic','astro'],CARD=['tarot','lenormand','ootk'],GUA=['liuyao','liuren','meihua','yijing'],OTHER=['name','compat','personality','oracle'];
const NO_PAST=[...CARD,...GUA,'oracle','name','personality'];
const problems=[];let checked=0;
function focusOf(body){const i=body.indexOf('【本題焦點');if(i<0)return null;const j=body.indexOf('\n\n【',i+5);return body.slice(i,j<0?undefined:j);}
for(const [method,chart] of Object.entries(x.charts)){
  for(const [type,q] of Object.entries(Q)){
    let body;try{body=P.build(method,chart,q);}catch(e){problems.push([method,type,'build error: '+e.message.slice(0,60)]);continue;}
    checked++;const f=focusOf(body);if(!f){problems.push([method,type,'no focus block']);continue;}
    const bad=m=>problems.push([method,type,m]);
    const clean=f.split('\n').filter(l=>!l.startsWith('已成立的格')&&!l.startsWith('比較對象')).join('\n');
    if(/[A-Za-z]{4,}/.test(clean.replace(/Ace|Book T|CDI|LINGZHAO|LEGACY|UNVERIFIED/g,'')))bad('english residue: '+clean.match(/[A-Za-z]{4,}/)[0]);
    if(/\{"/.test(f))bad('json residue');
    if(!/本題（/.test(f)&&!['personality','ootk'].includes(method))bad('no domain label');
    if(type==='timing'&&!/時間|時機|應期|週期|換手|區間/.test(f))bad('timing question but no timing rule');
    if(type==='amount'&&!/量化題/.test(f))bad('amount rule missing');
    if(CHART.includes(method)){if(!/撐得住|偏弱|偏穩|撐不起|底子|強的|磨|普通|中和|身強|身弱|全年最重/.test(f))bad('no strength verdict');if(!/過去三年回看/.test(f))bad('no look-back');}
    if(NO_PAST.includes(method)&&/過去三年回看/.test(f))bad('look-back on method without time axis');
    if(method==='tarot'&&!/過去位|沒有過去位/.test(f))bad('tarot past rule missing');
    if(['tarot'].includes(method)&&type==='third'&&!/對方/.test(f))bad('third person not handled');
    if(method==='name'&&type!=='career'&&!/沒有時間軸|不是改名題/.test(f))bad('name scope line missing');
    if(method==='personality'&&!/不推事件|不是心理測驗/.test(f))bad('personality scope missing');
    if(['liuyao','liuren'].includes(method)&&!/用神/.test(f))bad('no use-god');
    if(method==='meihua'&&!/三段讀法|時間規則/.test(f))bad('meihua stages/timing rule missing');
    if(method==='yijing'&&!/擇辭|卦辭/.test(f))bad('yijing selection missing');
    if(method==='lenormand'&&!/代表牌規則/.test(body))bad('lenormand significator section missing');
    if(['bazi','ziwei','vedic','astro'].includes(method)&&type==='love'&&!/夫妻|7宮|伴侶/.test(f))bad('love question but no partner palace/house');
    if(/undefined|NaN|\?宮|\?（/.test(f))bad('undefined/NaN in focus');
    if(type==='year'&&CHART.includes(method)&&!/2028/.test(f))bad('named year not in focus');
    if(type==='business'&&!/生意／副業/.test(f)&&!['ootk','personality'].includes(method))bad('business question not labeled as business');
    if(type==='business'&&method==='lenormand'&&!/魚|船|熊|牌3/.test(f))bad('business question but no money card');
    if(type==='business'&&['bazi'].includes(method)&&!/正財|偏財|食神|傷官/.test(f))bad('business question but no wealth gods');
    if(type==='two'&&!/原句子題核對（每一題都要各自答）/.test(body)&&!/子題/.test(body))bad('two sub-questions not listed in Chinese');
    if(type==='health'&&CHART.includes(method)&&!/疾厄|6宮|1宮|健康|身體|官殺|七殺|正官|日主/.test(f))bad('health question but no health palace/house');
    if(type==='rebound'&&['bazi','ziwei','vedic','astro'].includes(method)&&!/夫妻|7宮|伴侶/.test(f))bad('rebound is a love question but no partner palace');
  }
}
console.log('checked',checked,'problems',problems.length);problems.forEach(p=>console.log(p.join(' | ')));
assert.equal(problems.length,0,'focus audit found problems');console.log(JSON.stringify({passed:checked}));
