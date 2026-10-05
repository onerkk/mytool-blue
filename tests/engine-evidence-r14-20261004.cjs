'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const f=require('./native-fixtures-20261003.cjs'),e=f.environment(),c=e.ctx;
e.load('prompt-brief');e.load('prompt-packet');
let checks=0;
const ok=(v,label)=>{assert.ok(v,label);checks++;};
const eq=(a,b,label)=>{assert.deepEqual(JSON.parse(JSON.stringify(a)),JSON.parse(JSON.stringify(b)),label);checks++;};
const copy=x=>JSON.parse(JSON.stringify(x));
const current=lord=>({maha:{lord},antar:{lord},pratyantar:{lord}});

// The old activation ledger incorrectly used ineligible/unknown timelines as primary support.
const vc={input:{unknownTime:false},dasha:{current:current('Moon')},
  strength:{planets:[{planet:'Mars',totalVirupas:300,minimumVirupas:360},{planet:'Venus',totalRupas:6}]},
  yogas:[{id:'core-case',name:'核心格局',status:'structural',planets:['Mercury']}],
  advanced:{yogas:{checks:[{id:'weak-case',status:'structural',planets:['Mars']},
    {id:'raw-unit-case',status:'structural',planets:['Venus']},
    {id:'false-case',status:'not-established',established:false,planets:['Moon']}]},dashas:{
      Dwadashottari:{status:'calculated',applicability:false,current:current('Mars')},
      unknown:{status:'calculated',current:current('Mercury')},
      conditional:{status:'calculated',applicability:true,current:current('Venus')},
      Shodashottari:{status:'calculated',applicability:false,applicabilityAlternative:true,current:current('Mars')},
      ashtottari:{status:'calculated',applicability:{universal:true,rahuKendraTrineFromLagnaLord:false,dayKrishnaOrNightShukla:null},current:current('Mercury')}
  }}};
const va=c.JYVedicApplicability.compute(vc),by=id=>va.yogaActivation.find(x=>x.id===id);
eq(by('weak-case').timingLords,[],'ineligible Mars is not a Vimshottari lord');
eq(by('weak-case').status,'weakened','300/360 ratio preserves weakness');
eq(by('core-case').status,'structural-only','unknown model cannot activate primary Yoga');
ok(by('core-case'),'primary Yoga list is included');
eq(by('raw-unit-case').strengthValues,[],'Rupa total is not a dimensionless ratio');
ok(!by('raw-unit-case').primaryTiming,'eligible independent model does not overwrite primary timing');
eq(by('raw-unit-case').supportingTiming.map(x=>x.system),['conditional'],'eligible model is recorded separately');
eq(by('false-case').status,'not-established','timing cannot establish a failed Yoga');
eq(va.dashaSelection.systems.Shodashottari.status,'profile-dependent','default and alternative are distinct');
eq(va.dashaSelection.systems.ashtottari.profiles.map(x=>x.value),[true,false,null],'three PVR alternatives stay three-valued');
ok(!va.dashaSelection.eligibleSupporting.includes('Dwadashottari'),'failed condition excluded');

// A hidden spirit's calendar states differ from the flying line's, and it has no own transformation.
const ly={lines:[{position:1,element:'火',states:{monthRelation:'克',dayRelation:'克'},moving:true,
  transition:{returnRelation:'克',advance:true},hidden:{branch:'卯',element:'木',states:{monthRelation:'生',dayRelation:'比和'}}},
  {position:2,branch:'酉',element:'金',moving:true,states:{}}],interpretation:{lines:[{position:2,availability:'available',obstacles:[]}],
  targets:[{role:'事情用神',relative:'妻財',priority:'primary',candidates:[{position:1,branch:'卯',element:'木',hidden:true,
    states:{monthRelation:'生',dayRelation:'比和'},flightAssessment:{status:'blocked-with-support',gates:[{status:'blocking'}]}}]}],
  influences:[{role:'事情用神',relative:'妻財',priority:'primary',candidates:[{position:1,branch:'卯',hidden:true,
    network:[{position:2,movement:'明動',availability:'available',function:'忌神',obstacles:[]}]}]}]}};
const lc=c.JYLiuyaoClassicalBalance.compute(ly).targets[0].candidates[0];
eq(lc.forces.filter(x=>['month','day'].includes(x.source)).map(x=>x.direction),['support','support'],'hidden candidate uses its own states');
ok(!lc.forces.some(x=>x.source==='transformation'||x.source==='advance'),'flying transformation cannot attach to hidden spirit');
eq(lc.status,'hidden-blocked','calendar support cannot remove a flying-hidden gate');
ok(lc.forces.some(x=>x.source==='moving-line'&&x.direction==='control'),'effective moving control is included');

// Preserve real rule IDs, conditions, remaining judgment and finite windows in horary export.
const hc={input:{utc:'2026-10-04T04:00:00Z',chartPurpose:'horary'},policy:{houseSystem:'R'},horary:{status:'calculated',
  moon:{wholeSignCycle:{profiles:[{id:'one',void:null},{id:'two',void:null}]}},
  lightChecks:{status:'calculated',translations:[]},denialChecks:{status:'calculated',rows:[{pair:['Moon','Venus'],angle:120,
    window:{censored:true},checks:[{id:'prohibition',profile:'LILLY',status:'undetermined',matched:false,
      conditions:{firstContact:true},evidence:{utc:'2026-10-05T04:00:00Z'},qualitativeRemaining:['第三者現實角色'] }]}]}}};
const hp=c.JYWesternTraditionProfile.compute(hc),hr=hp.perfection.denialChecks[0];
eq(hr.type,'prohibition','actual id survives adapter');eq(hr.conditions,{firstContact:true},'rule conditions retained');
eq(hr.remaining,['第三者現實角色'],'qualitative remaining field retained');ok(hr.window.censored,'finite search window retained');
eq(hp.voidOfCourse.consensus,'undetermined','all unknown VOC values are not confirmed consensus');
const mh=copy(hc);delete mh.horary.lightChecks;eq(c.JYWesternTraditionProfile.compute(mh).status,'insufficient-horary','missing module cannot become calculated evidence');

// No unsupported read-time option may silently relabel an already calculated chart.
const zc={palaces:Array.from({length:12},()=>({})),calculationPolicy:{yearDivide:'normal',horoscopeDivide:'normal',ageDivide:'normal',dayDivide:'current',algorithm:'default',sihuaProfile:'IZTRO_261'}};
const za=c.JYZiweiSchoolCompletion.compute(zc,{ziweiConfig:{algorithm:'zhongzhou',yearDivide:'exact'},sihuaProfile:'QUANSHU'});
eq(za.config.algorithm,'default','actual star algorithm remains authoritative');eq(za.config.sihuaProfile,'IZTRO_261','actual four transformations remain authoritative');
eq(za.policyMismatches.length,3,'every requested mismatch is disclosed');
const zdepth=c.JYNativeDepthContract.build('ziwei',zc,{schoolCompletion:za});
ok(zdepth.evidence.find(x=>x.path==='schoolCompletion').status==='policy-mismatch','policy mismatch is not complete evidence');

// Original source demands 行年; natalBranch alone is not the same input.
const lr={question:'行人何時回來？',transmissions:[{empty:false},{},{}],xun:{empty:['子','丑']},
  plate:[{earth:'寅',sky:'午',branch:'午'},{earth:'子',sky:'寅',branch:'寅',kinship:'妻財'}],
  participants:[{label:'行人',annualBranch:'寅',natalBranch:'亥'}]};
const tr=c.JYLiurenTopicRules.compute(lr).checks.find(x=>x.id==='traveler-year-location');
eq(tr.status,'calculated','provided annualBranch is read');eq(tr.evidence[0].upper.sky,'午','year upper follows real plate');
eq(tr.evidence[0].annualLocatedOn.earth,'子','annual heaven branch location remains distinct');
const nl=copy(lr);delete nl.participants[0].annualBranch;
eq(c.JYLiurenTopicRules.compute(nl).checks.find(x=>x.id==='traveler-year-location').status,'missing-required-input','natal branch cannot substitute for annual branch');
const wl=copy(lr);wl.transmissions[0].empty=true;wl.plate=[{earth:'寅',sky:'子',branch:'子',kinship:'妻財'}];
eq(c.JYLiurenTopicRules.compute(wl,'求財').checks.find(x=>x.id==='wealth-void').status,'not-matched','one-sided void is not heaven-earth double void');
wl.plate[0].earth='丑';eq(c.JYLiurenTopicRules.compute(wl,'求財').checks.find(x=>x.id==='wealth-void').status,'matched','actual double void is detected');

// Exact applicability/status tests prevent unrelated printed examples and negated status from becoming verdicts.
const bc={pillars:{},classicalAssessment:{monthSelection:{},selected:{name:'正官',formation:[{value:true}],failure:[],rescue:[],assessment:'結構候選'}},
  functionalAssessment:{orderedMechanisms:[{id:'wrong-example',applicable:false,pairs:[{rooted:[true,true],sequence:'source-rescue-order'}]}],combinations:[],pureMixed:[]},
  huaQiAssessments:[{status:'not-established'},{statusCode:'NOT_ESTABLISHED'},{status:'uncertified'}]};
const ba=c.JYBaziAdjudication.compute(bc);eq(ba.effectiveControl,[],'unmatched original example is not effective control');
eq(ba.specialStructureDecision.huaEstablished,[],'negative status does not match positive substring');
eq(ba.selectedPattern.formation,[{value:true}],'actual selected pattern condition rows retained');
const incomplete=c.JYNativeDepthContract.build('vedic',{input:{unknownTime:true}},
  {items:[{}],strength:{complete:false,status:'insufficient-data',planets:[{}]},activation:[{}],vargas:[{}],bhavaStrength:{complete:false},ashtakavarga:{},applicability:{status:'insufficient-data'}});
ok(incomplete.missingRequiredEvidence.includes('六力'),'partial object does not prove complete strength');
ok(incomplete.missingRequiredEvidence.includes('D1宮主與落宮'),'unknown time does not prove D1 houses');
ok(!incomplete.allSchoolsComplete,'no claim of all schools being complete');
eq(c.JYNativeDepthContract.summary(incomplete).status,'partial-reading','supplement retains partial status');
eq(c.JYNativeDepthContract.summary(incomplete).missing,incomplete.evidence.filter(x=>!x.available).map(({label,status,reason})=>({label,status,reason})),'supplement retains every missing-evidence reason');

// Integration: every production method produces the new data-only and contradiction contract.
const x=f.examples(c);
// Scoped exports refer to an identical selected matrix while retaining all eight complete patterns.
const originalClassical=JSON.stringify(x.b.classicalAssessment),raw=JSON.parse(c.JYNativeAnalysis.prompt('bazi',x.b,x.q,{supplement:true}).split('\n')[1]);
function restore(v){
 if(!v||typeof v!=='object')return v;
 if(v.$ref){let target=raw;for(const key of v.$ref.slice(2).split('/'))target=target[key.replace(/~1/g,'/').replace(/~0/g,'~')];assert(target!==undefined,'supplement reference resolves');return restore(target);}
 if(Array.isArray(v))return v.map(restore);
 if(v.$table){const rows=restore(v.rows),columns=restore(v.$table);return rows.map(row=>Object.fromEntries(columns.map((key,i)=>[key,row[i]])));}
 return Object.fromEntries(Object.entries(v).map(([key,value])=>[key,restore(value)]));
}
const exportedClassical=restore(raw).classicalAssessment;
eq(exportedClassical.patterns,x.b.classicalAssessment.patterns,'all selected and unselected classical evidence survives table/reference export');
eq(exportedClassical.selected.name,x.b.classicalAssessment.selected.name,'selected pattern identity survives without a second matrix');
ok(exportedClassical.selected.reference.includes('classicalAssessment.patterns 第'),'selected matrix has an explicit in-document reference');
eq(JSON.stringify(x.b.classicalAssessment),originalClassical,'export reference does not alter original chart data');
const savedAdjudicator=c.JYBaziAdjudication,savedDepth=c.JYNativeDepthContract;
try{
 const {forReading,...olderAdjudicator}=savedAdjudicator,{summary,...olderDepth}=savedDepth;
 c.JYBaziAdjudication=olderAdjudicator;c.JYNativeDepthContract=olderDepth;
 ok(c.JYNativeAnalysis.prompt('bazi',x.b,x.q,{supplement:true}).includes('jy.native-analysis/1'),'new supplement safely falls back with older helper exports');
 ok(c.JYPromptPacket.build('bazi',x.b,x.q).includes('八格成敗救應'),'new brief safely falls back with older adjudicator');
}finally{c.JYBaziAdjudication=savedAdjudicator;c.JYNativeDepthContract=savedDepth;}
for(const [method,chart]of Object.entries(x.charts)){
 const before=JSON.stringify(chart),q=method==='name'?'這些名字如何比較？':x.q;
 const analysis=c.JYNativeAnalysis.analyze(method,chart,{question:q});
 ok(analysis.computationAudit.status!=='invalid',method+' arithmetic/structural audit');
 const prompt=c.JYPromptPacket.build(method,chart,q,{notes:'只採本次資料'});
 ok(prompt.includes('不使用帳號記憶'),method+' memory isolation survives actual brief path');
 ok(prompt.includes('最強反證')&&prompt.includes('本次具名方法'),method+' scoped synthesis instruction');
 ok(/2026100[45]depth(?:14|15)/.test(prompt),method+' depth contract is delivered');
 ok(prompt.includes('shopee.tw/a50h95648d'),method+' relevant shop ending remains');
 eq(JSON.stringify(chart),before,method+' analysis/export do not mutate the chart');
}
const vactual=c.JYVedicApplicability.compute(x.v);
ok(vactual.yogaActivation.length>=x.v.yogas.length,'primary Yoga family is present in actual ledger');
for(const y of vactual.yogaActivation)for(const s of y.supportingTiming){
 const profile=vactual.dashaSelection.systems[s.system].profiles.find(p=>p.id===s.profile);
 ok(profile?.value===true,'all real supporting models satisfy their own profile');
}
for(const file of ['bazi-adjudication','ziwei-school-completion','vedic-applicability','liuren-topic-rules','liuyao-classical-balance','western-tradition-profile','native-depth-contract','native-chart-analysis','prompt-brief','prompt-packet'])
 eq(fs.readFileSync(path.join(__dirname,'..',file+'.js'),'utf8'),fs.readFileSync(path.join(__dirname,'../JS',file+'.js'),'utf8'),'root/JS mirrored '+file);
console.log(`R14 evidence regressions: ${checks}/${checks} PASS`);
