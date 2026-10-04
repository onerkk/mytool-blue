'use strict';
const assert=require('node:assert'),fs=require('node:fs'),path=require('node:path');
const fixtures=require('./native-fixtures-20261003.cjs');
const root=path.resolve(__dirname,'..');let checks=0;
const ok=(v,msg)=>{assert.ok(v,msg);checks++;};
const eq=(a,b,msg)=>{assert.deepStrictEqual(a,b,msg);checks++;};
const env=fixtures.environment(),c=env.ctx,x=fixtures.examples(c);env.load('prompt-brief');env.load('prompt-packet');
const cases=[
 ['bazi',x.b,x.q,'classicalAdjudication','古法質性裁決'],
 ['ziwei',x.z,x.q,'schoolCompletion','流派配置稽核'],
 ['vedic',x.v,x.q,'applicability','多運法適用性與Yoga啟動'],
 ['liuren',x.l,'我今年求財何時有進帳？','topicRules','分類占法條件'],
 ['liuyao',x.six,'今年工作能順利嗎？','classicalBalance','增刪卜易作用平衡'],
 ['astro',x.w,x.q,'traditionProfile','傳統卜卦定義分流']
];
for(const [m,chart,q,key,label] of cases){
 const a=c.JYNativeAnalysis.analyze(m,chart,{question:q});
 ok(a[key],m+' '+key+' exists');
 if(m==='liuyao'){ok(a.depthContract.missingRequiredEvidence.includes('應期候選'),m+' symbolic calendar lacks an actual cast instant');}else ok(!a.depthContract.missingRequiredEvidence.length,m+' depth evidence complete');
 const p=c.JYPromptPacket.build(m,chart,q);
 ok(p.includes(label),m+' prompt carries '+label);
 ok(/20261004depth(?:13|14)/.test(p),m+' prompt carries depth13');
}
const bz=c.JYNativeAnalysis.analyze('bazi',x.b,{question:x.q});
eq(bz.classicalAdjudication.status,'calculated','bazi adjudication calculated');
ok(['profile-clear','profile-turbid','unresolved-global'].includes(bz.classicalAdjudication.classicalQuality.status),'bazi quality bounded');
ok(bz.classicalAdjudication.limits.some(s=>s.includes('清濁')),'bazi explicit global limit');
const zw=c.JYNativeAnalysis.analyze('ziwei',x.z,{question:x.q});
ok(zw.schoolCompletion.officialOptions.algorithm.includes('zhongzhou'),'ziwei official algorithm profile exposed');
ok(Array.isArray(zw.schoolCompletion.profileDifferences),'ziwei profile differences calculated');
const vd=c.JYNativeAnalysis.analyze('vedic',x.v,{question:x.q});
eq(vd.applicability.dashaSelection.primary,'vimshottari','vedic primary dasha separated');
ok(Array.isArray(vd.applicability.yogaActivation),'vedic yoga activation ledger');
ok(vd.applicability.jaimini&&vd.applicability.jaimini.policy.includes('不拿'),'vedic Jaimini non-voting policy');
const lr=c.JYNativeAnalysis.analyze('liuren',x.l,{question:'我今年求財何時有進帳？'});ok(lr.topicRules.topics.includes('wealth'),'liuren question routing reaches wealth rules');ok(lr.topicRules.checks.some(z=>z.topic==='wealth'),'liuren wealth checks calculated');
const ly=c.JYNativeAnalysis.analyze('liuyao',x.six,{question:'今年工作能順利嗎？'});eq(ly.classicalBalance.status,'calculated','liuyao balance calculated');ok(ly.classicalBalance.targets.length>0,'liuyao targets balanced');ok(ly.classicalBalance.targets.flatMap(t=>t.candidates).every(z=>z.forces.some(f=>f.source==='month')&&z.forces.some(f=>f.source==='day')),'liuyao month/day forces explicit');
const hor=c.JYWestern.compute({...x.input,utc:'2026-10-03T04:00:00Z',reference:'2026-10-03T04:00:00Z',chartPurpose:'horary',houseSystem:'R',horaryHouse:10,horaryDays:7});
const wa=c.JYNativeAnalysis.analyze('astro',hor,{question:'這件工作合作會成功嗎？'});eq(wa.traditionProfile.status,'calculated','horary profile calculated');ok(wa.traditionProfile.voidOfCourse.profiles.length>=2,'VOC definitions remain separate');ok(['definition-dependent',true,false].includes(wa.traditionProfile.voidOfCourse.consensus),'VOC consensus bounded');ok(wa.traditionProfile.astronomyAudit.note.includes('不冒稱'),'Swiss cross-check claim bounded');
const hp=c.JYPromptPacket.build('astro',hor,'這件工作合作會成功嗎？');ok(hp.includes('傳統卜卦定義分流'),'horary prompt carries profile');
const src=c.JYNativeRuleSources.all();for(const id of ['ditiansui','iztroconfig','pvrofficial','swissapi','liuyao26','liuren3','horaryvoid']){const r=src.find(x=>x.id===id);ok(r,id+' source exists');ok(['20261004native13','20261004native14'].includes(r.lastReviewedRelease),id+' R13 or later reviewed');}
for(const f of ['bazi-adjudication.js','ziwei-school-completion.js','vedic-applicability.js','liuren-topic-rules.js','liuyao-classical-balance.js','western-tradition-profile.js','native-depth-contract.js','native-chart-analysis.js','native-rule-sources.js','prompt-brief.js','prompt-packet.js'])ok(fs.readFileSync(path.join(root,f),'utf8')===fs.readFileSync(path.join(root,'JS',f),'utf8'),'mirror '+f);
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');for(const f of ['bazi-adjudication','ziwei-school-completion','vedic-applicability','liuren-topic-rules','liuyao-classical-balance','western-tradition-profile'])ok(html.includes('JS/'+f+'.js?v=20261004native14')||html.includes('JS/'+f+'.js?v=20261004native13'),'html loads '+f);ok(html.includes('prompt-brief.js?v=20261004brief14'),'brief cache version');ok(html.includes('prompt-packet.js?v=20261004prompt14'),'packet cache version');
console.log(`R13 core-completion checks: ${checks}/${checks} PASS`);
