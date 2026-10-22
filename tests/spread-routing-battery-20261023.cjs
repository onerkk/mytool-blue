'use strict';
/* 20261023 自動選陣回歸：60 題（40 題開發集＋20 題保留集），每題列出塔羅與雷諾曼可接受的牌陣。
 * 「該不該／要不要＋單一行動」依站內既有設計視為兩路（採取／暫不採取）比較，故 either_or／choice 列為可接受。
 * 門檻：塔羅 ≥ 57/60、雷諾曼 ≥ 57/60；低於門檻即失敗並列出錯題。 */
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');const root=path.resolve(__dirname,'..');
const F=require('../JS/tarot-foundation.js');const B=require('./fixtures/spread-routing-battery-20261023.cjs');
function stubNode(){return {style:{},appendChild(){},remove(){},setAttribute(){},getAttribute(){return null;},querySelector(){return null;},focus(){},select(){},setSelectionRange(){},innerHTML:'',textContent:'',isConnected:true,parentNode:null};}
const sb={console:{log(){},warn(){},error:console.error},window:{crypto:require('crypto').webcrypto,isSecureContext:true,addEventListener(){},JYShareCard:null},document:{createElement:stubNode,body:{appendChild(){}},head:{appendChild(){}},getElementById(){return null;},querySelector(){return null;},execCommand(){return true;},referrer:''},navigator:{clipboard:{writeText(){return Promise.resolve();}}},localStorage:{getItem(){return null;},setItem(){},removeItem(){}},sessionStorage:{getItem(){return null;},setItem(){}},location:{search:''},alert(){},setTimeout(){},Promise,Uint32Array,Date,Math,JSON,Object,Array,Number,String,RegExp,Map,Set,Error,Intl};sb.self=sb.window;vm.createContext(sb);
const code=fs.readFileSync(path.join(root,'JS/lenormand.js'),'utf8').replace(/\}\)\(\);\s*$/,'window.__T={detect:_lnDetectSpread};})();');
vm.runInContext(code,sb,{filename:'lenormand.js'});const LN=sb.window.__T;
let tOk=0,lOk=0;const bad=[];
for (const row of B){const q=row[0],tExp=row[1],lExp=row[2];let t=null,l=null;
  try{t=F.routeQuestion(q,{type:'general',referenceDate:'2026-10-23T00:00:00Z'}).spreadId;}catch(e){t='ERR';}
  try{l=LN.detect(q).id;}catch(e){l='ERR';}
  const to=tExp.includes(t),lo=lExp.includes(l);if(to)tOk++;if(lo)lOk++;
  if(!to||!lo)bad.push((to?'':'塔羅='+t+' 期望'+tExp.join('/')+'；')+(lo?'':'雷諾曼='+l+' 期望'+lExp.join('/')+'；')+' ← '+q);}
console.log('tarot '+tOk+'/'+B.length+', lenormand '+lOk+'/'+B.length);if(bad.length)console.log(bad.join('\n'));
assert(tOk>=57,'tarot routing below threshold');assert(lOk>=57,'lenormand routing below threshold');
console.log(JSON.stringify({passed:2}));
