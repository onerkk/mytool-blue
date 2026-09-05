import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const read=f=>readFileSync(new URL('../'+f,import.meta.url),'utf8');
const load=async f=>(await import('data:text/javascript;base64,'+Buffer.from(read(f)).toString('base64'))).onRequest;
const counter=await load('functions/api/pulse.js'),ai=await load('functions/api/ai.js');
const originalFetch=globalThis.fetch,originalError=console.error;
let n=0;async function test(name,fn){await fn();n++;console.log('✓ '+name);}
function req(action,method='GET',headers={}){return new Request('https://jingyue.uk/api/pulse'+(method==='GET'?'?action='+action:''),{method,headers:{Origin:'https://jingyue.uk',...headers},...(method==='POST'?{body:JSON.stringify({action})}:{})});}
try{
  console.error=()=>{};
  await test('Counter rejects false zero, unsafe integers and inconsistent totals',async()=>{
    for(const value of [null,'',false,-1,1.2,'bad','1.5',9007199254740992]){globalThis.fetch=async()=>Response.json({total:value,today:0});assert.equal((await counter({request:req('get')})).status,502);}
    globalThis.fetch=async()=>Response.json({total:3,today:4});assert.equal((await counter({request:req('get')})).status,502);
  });
  await test('Counter reset requires POST and the configured admin token',async()=>{
    let calls=0;globalThis.fetch=async()=>{calls++;return Response.json({total:0,today:0});};
    assert.equal((await counter({request:req('reset')})).status,405);assert.equal((await counter({request:req('reset','POST')})).status,403);
    assert.equal((await counter({request:req('reset','POST',{Authorization:'Bearer wrong'}),env:{COUNTER_ADMIN_TOKEN:'test-only'}})).status,403);assert.equal(calls,0);
    assert.equal((await counter({request:req('reset','POST',{Authorization:'Bearer test-only'}),env:{COUNTER_ADMIN_TOKEN:'test-only'}})).status,200);assert.equal(calls,1);
  });
  await test('Legacy empty reset response is followed by read-only verification',async()=>{
    const calls=[];globalThis.fetch=async url=>{const action=new URL(url).searchParams.get('action');calls.push(action);return Response.json(action==='reset'?{}:{total:12,today:2});};
    const r=await counter({request:req('reset','POST',{Authorization:'Bearer test-only'}),env:{ADMIN_TOKEN:'test-only'}});assert.deepEqual(await r.json(),{total:12,today:2});assert.deepEqual(calls,['reset','get']);
  });
  const source=read('JS/ui.js'),start=source.indexOf('const CTR_ENDPOINT'),end=source.indexOf('// ── 計數 +1',start);
  const ui={window:{location:{hostname:'jingyue.uk'}},AbortController,setTimeout,clearTimeout,Date,fetch:null};vm.createContext(ui);vm.runInContext(source.slice(start,end),ui);
  await test('Browser counter read falls back after blocked requests and static HTML responses',async()=>{
    for(const fail of [()=>{throw new TypeError('Failed to fetch');},()=>new Response('<html>static page</html>')]){let calls=0;ui.fetch=async()=>++calls===1?fail():Response.json({total:9,today:1});const r=await ui._gasCall('get');assert.equal(r.total,9);assert.equal(calls,2);}
  });
  await test('Browser counter never retries an uncertain write or fabricates zero',async()=>{
    for(const fail of [()=>{throw new TypeError('Failed to fetch');},()=>new Response('failure',{status:502}),()=>Response.json({total:null})]){let calls=0;ui.fetch=async()=>{calls++;return fail();};assert.equal(await ui._gasCall('increment'),null);assert.equal(calls,1);}
    for(const value of [null,'',false,2.2,-1])assert.equal(ui._normalizeCounterData({total:value,today:0},'get'),null);
  });
  let writes=0;const env={ANTHROPIC_API_KEY:'test-only',RATE_KV:{async get(){return null;},async put(){writes++;}}};
  function air(body,origin='https://jingyue.uk'){return new Request('https://jingyue.uk/api/ai',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify(body)});}
  await test('AI endpoint rejects fake origins, invalid input and empty admin configuration',async()=>{
    assert.equal((await ai({request:air({payload:{question:'工作？'}},'https://jingyue.uk.evil.example'),env})).status,403);
    assert.equal((await ai({request:air({payload:{question:'工作？'}}),env:{}})).status,503);
    assert.equal((await ai({request:air(null),env})).status,400);assert.equal((await ai({request:air({payload:{question:[]}}),env})).status,400);
  });
  await test('Malformed or incomplete AI outputs are failures and do not consume quota',async()=>{
    for(const output of ['not JSON','{}','[]','null','{"answer":""}','{"answer":"回答","timing":42}']){globalThis.fetch=async()=>Response.json({content:[{type:'text',text:output}]});assert.equal((await ai({request:air({payload:{question:'工作？'}}),env})).status,502);}
    assert.equal(writes,0);
    globalThis.fetch=async()=>Response.json({stop_reason:'max_tokens',content:[{type:'text',text:'{"answer":"截短"}'}]});assert.equal((await ai({request:air({payload:{question:'工作？'}}),env})).status,502);assert.equal(writes,0);
  });
  await test('Valid AI answer preserves methods and consumes one quota entry',async()=>{
    let sent;globalThis.fetch=async(url,init)=>{sent=JSON.parse(init.body);return Response.json({content:[{type:'text',text:'{"answer":"分析依據","action":null}'}]});};
    const r=await ai({request:air({payload:{question:'工作？'}}),env});assert.equal(r.status,200);assert.equal(writes,1);assert.equal((await r.json()).isAdmin,false);for(const x of ['西洋占星','吠陀','姓名學','未知時辰','個案資料'])assert(sent.system.includes(x));
  });
  console.log('api-failure-regression: '+n+' groups passed (mocked upstream; no live mutations)');
}finally{globalThis.fetch=originalFetch;console.error=originalError;}
