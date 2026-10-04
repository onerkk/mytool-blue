'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const quality=require('../JS/reading-quality.js'),flow=require('../JS/reading-workflow.js');
const methods=quality.methodKinds();
function generatedValue(file,name,kind='READING'){
  const source=read(file),startMarker='// BEGIN GENERATED '+kind+' '+name+'\n',endMarker='\n// END GENERATED '+kind+' '+name;
  const start=source.indexOf(startMarker);assert(start>=0,file+' '+name+' start');
  const bodyStart=start+startMarker.length,end=source.indexOf(endMarker,bodyStart);assert(end>=0,file+' '+name+' end');
  const declaration=source.slice(bodyStart,end).trim().match(new RegExp('^var '+name+' = ([\\s\\S]+);$'));
  assert(declaration,file+' '+name+' declaration');return JSON.parse(declaration[1]);
}
function same(actual,expected,label){assert.equal(JSON.stringify(actual),JSON.stringify(expected),label);}
let passed=0;function test(name,fn){fn();passed++;console.log('PASS '+name);}

test('All active methods receive the full answer-first depth contract and native synthesis path',()=>{
  assert.equal(quality.readingVersion,'9.3.0');assert.deepEqual(methods,['tarot','ootk','lenormand','bazi','compat','ziwei','meihua','liuyao','yijing','oracle','astro','vedic','name','liuren','personality']);
  for(const method of methods){
    const lines=quality.lines(method).join('\n'),payload=quality.payloadGuide([method]);
    for(const phrase of ['第一句就回答原問題','深度判讀流程','證據完整度','最有力的反向依據','深度來自完整推理'])assert(lines.includes(phrase),method+' '+phrase);
    assert(!/(?:約|用)[0-9一二三四五六七八九十～至-]+(?:組|段|句)/.test(lines),method+' no fixed evidence or paragraph count');
    assert(lines.includes('【'+({tarot:'塔羅',ootk:'開鑰之法',lenormand:'雷諾曼',bazi:'八字',compat:'合盤',ziwei:'紫微',meihua:'梅花',liuyao:'六爻',yijing:'易經',oracle:'靈籤',astro:'西洋占星',vedic:'印度占星',name:'姓名',liuren:'六壬',personality:'人格'}[method])+'判讀主線】')||method==='ootk',method+' native synthesis');
    assert(payload.methods[method].length>=4,method+' payload depth');
  }
  const liuyao=quality.lines('liuyao').join('\n');assert(liuyao.includes('額外參與者'));assert(liuyao.includes('性意願或同意'));
});

test('Every generated prompt fallback matches the current shared contract',()=>{
  const v=kind=>quality.lines(kind);
  const checks=[
    ['JS/gua-prompt.js','JY_READING_GUA',{liuyao:v('liuyao'),yijing:v('yijing')}],
    ['JS/bazi-prompt-root.js','JY_READING_BAZI',{bazi:v('bazi'),compat:v('compat'),personality:quality.methodLines('personality')}],
    ['JS/ziwei-prompt-root.js','JY_READING_ZIWEI',v('ziwei')],
    ['JS/ziwei-standalone.js','JY_READING_ZIWEI_FALLBACK',v('ziwei').join('\n')],
    ['JS/western-prompt.js','JY_READING_WESTERN',v('astro').join('\n')],
    ['JS/vedic-prompt.js','JY_READING_VEDIC',v('vedic').join('\n')],
    ['JS/lenormand.js','JY_READING_LENORMAND',v('lenormand')],
    ['JS/meihua-standalone.js','JY_READING_MEIHUA',v('meihua')],
    ['JS/oracle.js','JY_READING_ORACLE',v('oracle')],
    ['JS/prompt-export.js','JY_READING_EXPORT',{tarot:v('tarot'),ootk:v('ootk'),meihua:v('meihua')}],
    ['JS/relationship-core.js','JY_READING_RELATIONSHIP',quality.lines('compat').concat(quality.methodLines('bazi'),quality.methodLines('ziwei')).join('\n')]
  ];
  for(const [file,name,expected]of checks)same(generatedValue(file,name),expected,file+' fallback');
});

test('Embedded workflow copies stay synchronized and adapt output depth to question scope',()=>{
  const canonical=read('JS/reading-workflow.js').replace(/^  if\(typeof module[^\n]+\n/m,'').trimEnd();
  for(const file of ['JS/ai-analysis.js','JS/bazi-suite-core.js','JS/gua-prompt.js','JS/lenormand.js','JS/meihua-standalone.js','JS/oracle.js','JS/prompt-export.js','JS/relationship-core.js','JS/vedic-prompt.js','JS/western-prompt.js','JS/ziwei-standalone.js']){
    const source=read(file),a='// BEGIN GENERATED WORKFLOW\n',b='\n// END GENERATED WORKFLOW',start=source.indexOf(a);assert(start>=0,file+' workflow start');const body=start+a.length,end=source.indexOf(b,body);assert(end>=0,file+' workflow end');assert.equal(source.slice(body,end),canonical,file+' workflow copy');
  }
  const sexual='現任會願意再約一個她認識的女性跟我一起做愛嗎？';
  const scoped=flow.render({method:'liuyao',question:sexual});assert(flow.plan({method:'liuyao',question:sexual}).depth==='deep');assert(scoped.includes('willingness_for_intimate_action'));assert(scoped.includes('participant_structure'));
  const broad=flow.render({methods:['bazi','ziwei'],question:'完整分析命盤今年所有面向'});assert(broad.includes('【語義模型｜由原問句解析'));
  assert(!/(?:約|用)[0-9一二三四五六七八九十～至-]+(?:組|段|句)/.test(scoped+broad));
});

console.log('reading depth regression: '+passed+' groups passed across '+methods.length+' methods and all prompt fallbacks.');
