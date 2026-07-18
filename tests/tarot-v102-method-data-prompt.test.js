'use strict';
const assert=require('assert');
const fs=require('fs');
const path=require('path');
const vm=require('vm');
const cp=require('child_process');
const ROOT=path.resolve(__dirname,'..');
const F=require(path.join(ROOT,'JS/tarot-foundation.js'));
const E=require(path.join(ROOT,'JS/tarot-semantic-engine.js'));
let passed=0;
function test(name,fn){try{fn();passed++;console.log('✓',name);}catch(e){console.error('✗',name,'\n ',e.stack||e);process.exitCode=1;}}
function mkPlan(id,q='今年有肉體桃花的機率有多高'){return F.instantiateMethod(id,F.compileQuestion(q,{referenceDate:'2026-07-18'}));}
function cardsFor(plan){const n=['寶劍四','聖杯七','審判','金幣皇后','聖杯五','太陽','世界'];return plan.slots.map((slot,i)=>({name:n[i%n.length],positionMeaning:slot.label||'',sourceCore:'Book T核心義',sourceGloss:'Book T核心義',element:['風','水','火','土'][i%4]}));}
function prompt(id,q='今年有肉體桃花的機率有多高'){
  const plan=mkPlan(id,q),cards=cardsFor(plan);
  const payload={mode:'tarot',methodPlan:plan,tarotData:{spreadType:id,spreadZh:plan.label,methodPlan:plan,cards},shopRecommendation:{sourceFile:'靜月之光_庫存_20260717.xlsx',allowedItems:['粉晶手排／10mm／手圍16cm']}};
  const ctx={console,window:null,self:null,globalThis:null,S:{form:{question:q}},navigator:{clipboard:{writeText:()=>Promise.resolve()}},setTimeout,clearTimeout,Date,JSON,Math,RegExp,String,Number,Array,Object,Error,Promise,document:{getElementById:()=>null,querySelector:()=>null,createElement:()=>({style:{},setAttribute(){},appendChild(){},select(){},querySelectorAll(){return[];}}),body:{appendChild(){},removeChild(){}},execCommand(){return true;}},JYTarotFoundation:F,JYTarotSemanticEngine:E,_buildTarotOnlyPayload:()=>payload};
  ctx.window=ctx;ctx.self=ctx;ctx.globalThis=ctx;vm.createContext(ctx);vm.runInContext(fs.readFileSync(path.join(ROOT,'JS/prompt-export.js'),'utf8'),ctx);return ctx.JY_buildExportPrompt('tarot');
}

test('foundation upgraded to method-data schema',()=>{assert.equal(F.VERSION,'102.0.0');assert.equal(F.SCHEMA,'jy.tarot.foundation/6');assert.deepEqual(F.validateMethodRegistry(),{ok:true,errors:[]});});
test('export prompt no longer exposes query graph, ROOT-SPEC, capability gate or claim ledger',()=>{const p=prompt('five_card');['ROOT-SPEC','型別化查詢圖','觀測能力預檢','裁決閘門','命題帳本','語義飽和帳本','合法證據單位'].forEach(x=>assert(!p.includes(x),x));});
test('prompt tells AI to analyze and uses method data as context rather than a prewritten verdict',()=>{const p=prompt('five_card');assert(p.includes('請以你本身的分析能力解讀本盤'));assert(p.includes('提供閱讀上下文，不替 AI 預判答案'));assert(p.includes('方法資料是閱讀上下文，不是預先寫好的答案'));});
test('five-card network is rendered as named relations, never a fake 2→1→3→4→5 chain',()=>{const p=prompt('five_card');assert(p.includes('形成機制影響現況'));assert(p.includes('主要限制與現況互相作用'));assert(p.includes('前述條件共同限定結果'));assert(!p.includes('第2張「聖杯七」 → 第1張「寶劍四」 → 第3張「審判」 → 第4張「金幣皇后」 → 第5張「聖杯五」'));});
test('Mathers methods remain sequence methods without fake semantic positions',()=>{const p=prompt('mathers_horseshoe','現任是正緣嗎？');assert(p.includes('有序牌列成員'));assert(p.includes('序號只標示順序與配對'));assert(p.includes('A、C、E沒有原典授權的過去／現在／未來或最終結果身份'));assert(!p.includes('先在此牌位權限內成義'));});
test('prompt preserves Book T, true adjacency and natural recommendation ending',()=>{const p=prompt('relationship','現任是正緣嗎？');assert(p.includes('Golden Dawn《Book T／Liber T》'));assert(p.includes('真正有序相鄰線'));assert(p.includes('延伸選品'));assert(p.includes('先用一句承接使用者這次真正問的事'));});
test('changed JS syntax is valid',()=>{['tarot-foundation.js','prompt-export.js','ai-analysis.js'].forEach(f=>cp.execFileSync(process.execPath,['--check',path.join(ROOT,'JS',f)],{stdio:'pipe'}));});
if(!process.exitCode)console.log(`\n${passed} tests passed.`);
