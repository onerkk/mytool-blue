'use strict';
const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('assert');
const root=path.resolve(__dirname,'..');let checks=0;
const ok=(v,msg)=>{assert.ok(v,msg);checks++;};
function load(file,ctx){vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),ctx,{filename:file});}
const ctx=vm.createContext({console,globalThis:null});ctx.globalThis=ctx;ctx.window=ctx;
load('native-depth-contract.js',ctx);
const C=ctx.JYNativeDepthContract;ok(C,'contract exported');ok(/^(?:20261004depth(?:12|13|14)|20261005depth15)$/.test(C.version),'contract version/backward compatible');
const methods=['bazi','ziwei','vedic','astro','liuren','liuyao','yijing','meihua','name','compat','personality','tarot','ootk','lenormand','oracle'];
ok(Object.keys(C.profiles).length===15,'15 profiles');
function put(o,p,v){const ks=p.split('.');let x=o;for(let i=0;i<ks.length-1;i++)x=x[ks[i]]??={};x[ks.at(-1)]=v;}
for(const m of methods){
  const p=C.profiles[m];ok(!!p,m+' profile');ok(p.required.length>=1,m+' required');ok(p.order.length>=3,m+' order');ok(p.forbidden.length>=1,m+' forbidden');
  const chart={},analysis={unavailable:[]};for(const [,pp] of p.required)put(analysis,pp,{present:true});
  const c=C.build(m,chart,analysis);ok(c.method===m,m+' method');ok(c.evidence.every(e=>e.available),m+' evidence available');ok(c.forbiddenShortcuts.length>=5,m+' shortcuts');ok(c.synthesisOrder.length===6,m+' synthesis');ok(c.missingRequiredEvidence.length===0,m+' no missing');
  const t=C.toPrompt(c);ok(t.includes('深度判讀契約'),m+' prompt header');ok(t.includes('禁止捷徑'),m+' prompt shortcuts');ok(t.includes('判讀順序'),m+' prompt order');
}
load('native-rule-sources.js',ctx);const S=ctx.JYNativeRuleSources;for(const id of ['iztroconfig','pvrofficial','swissapi','liuyao26','liuren3','horaryvocglossary']){ok(S.all().some(x=>x.id===id),id+' source');}
ok(S.forMethod('ziwei').some(x=>x.id==='iztroconfig'),'ziwei config source');ok(S.forMethod('vedic').some(x=>x.id==='pvrofficial'),'vedic official source');ok(S.forMethod('astro').some(x=>x.id==='swissapi'),'astro swiss api');ok(S.forMethod('liuyao').some(x=>x.id==='liuyao26'),'liuyao void source');ok(S.forMethod('liuren').some(x=>x.id==='liuren3'),'liuren category source');
const native=fs.readFileSync(path.join(root,'native-chart-analysis.js'),'utf8');ok(/VERSION='20261004native(?:12|13|14|15)'/.test(native),'native version/backward compatible');ok(native.includes('a.depthContract=root.JYNativeDepthContract.build'),'native contract bridge');
const brief=fs.readFileSync(path.join(root,'prompt-brief.js'),'utf8');ok(/version:'20261004brief(?:12|13|14|15)'/.test(brief),'brief version/backward compatible');ok(brief.includes("add(tag+'深度判讀契約'"),'brief contract output');
const packet=fs.readFileSync(path.join(root,'prompt-packet.js'),'utf8');ok(/VERSION='20261004prompt(?:12|13|14|15)'/.test(packet),'packet version/backward compatible');ok(packet.includes('若實算資料含 depthContract'),'packet fallback contract');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');const iDepth=html.indexOf('native-depth-contract.js'),iNative=html.indexOf('native-chart-analysis.js');ok(iDepth>0&&iNative>iDepth,'load depth before native');
for(const f of ['native-depth-contract.js','native-chart-analysis.js','native-rule-sources.js','prompt-brief.js','prompt-packet.js'])ok(fs.readFileSync(path.join(root,f),'utf8')===fs.readFileSync(path.join(root,'JS',f),'utf8'),'mirror '+f);

// Full integration: production fixture must load the contract before native analysis and the generated AI prompt must carry it.
const fixtures=require('./native-fixtures-20261003.cjs');
const env=fixtures.environment();
const examples=fixtures.examples(env.ctx);
env.load('prompt-brief');env.load('prompt-packet');
const bz=env.ctx.JYNativeAnalysis.analyze('bazi',examples.b);
ok(bz.depthContract&&/^(?:20261004depth(?:12|13|14)|20261005depth15)$/.test(bz.depthContract.version),'actual bazi analysis carries depth contract');
const bp=env.ctx.JYPromptPacket.build('bazi',examples.b,'我未來事業與財運如何？');
ok(/深度判讀契約 (?:20261004depth(?:12|13|14)|20261005depth15)/.test(bp),'actual bazi prompt carries depth contract');
ok(bp.includes('禁止捷徑'),'actual prompt carries forbidden shortcuts');
const vd=env.ctx.JYNativeAnalysis.analyze('vedic',examples.v);
ok(vd.depthContract&&vd.depthContract.profile.includes('Parashari'),'actual vedic analysis carries profile');
const vp=env.ctx.JYPromptPacket.build('vedic',examples.v,'未來五年事業何時有明顯轉折？');
ok(vp.includes('Vimshottari')&&vp.includes('applicability'),'actual vedic prompt carries dasha applicability order');
console.log(`R12 depth-contract checks: ${checks}/${checks} PASS`);
