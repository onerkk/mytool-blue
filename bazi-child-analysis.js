/* Children: sourced structural evidence and provisional historical count rules.
 * No re-casting, gender inference, fertility diagnosis or empirical probability. */
(function(root){
  'use strict';
  const VERSION='20261014children24',G=[...'甲乙丙丁戊己庚辛壬癸'],B=[...'子丑寅卯辰巳午未申酉戌亥'],E=[...'木火土金水'];
  const K=['year','month','day','hour'],H={子:['癸'],丑:['己','癸','辛'],寅:['甲','丙','戊'],卯:['乙'],辰:['戊','乙','癸'],巳:['丙','戊','庚'],午:['丁','己'],未:['己','丁','乙'],申:['庚','壬','戊'],酉:['辛'],戌:['戊','辛','丁'],亥:['壬','甲']};
  const STAGES=['長生','沐浴','冠帶','臨官','帝旺','衰','病','死','墓','絕','胎','養'],START={甲:11,丙:2,戊:2,庚:5,壬:8};
  const SOURCES=[
    {id:'children-sanmings',title:'《三命通會》卷七·論六親',url:'https://zh.wikisource.org/zh-hant/三命通會/卷七',scope:'男取克干、女取干生；時位、全局生扶制約及運勢；取法不是事件驗證'},
    {id:'children-yuanhai',title:'《淵海子平》論子息',url:'https://zh.wikisource.org/zh-hant/淵海子平#論子息',scope:'中和與太過不及限制、原局未見仍查行運；數量及女命男女角色的版本歧異保留'},
    {id:'children-ziping-xu',title:'沈孝瞻原著／徐樂吾《子平真詮評註》論妻子',url:'https://ncc.com.tw/fate/paleo/bg/bg_034.htm',scope:'陽干順行長生假定數；再參時干喜忌與成敗救應，原註反對拘執數量口訣'}
  ];
  const arr=v=>Array.isArray(v)?v:[],mod=n=>(n%12+12)%12,el=s=>E[Math.floor(G.indexOf(s)/2)];
  function god(dm,s){const a=G.indexOf(dm),b=G.indexOf(s),n=(Math.floor(b/2)-Math.floor(a/2)+5)%5;return [['比肩','劫財'],['食神','傷官'],['偏財','正財'],['七殺','正官'],['偏印','正印']][n][(a-b+10)%2];}
  function gender(v){return /^(male|男|男性|男命)$/i.test(String(v||''))?'male':/^(female|女|女性|女命)$/i.test(String(v||''))?'female':null;}
  function childQuestion(q){return /子女|子嗣|親生|生育|備孕|懷孕|生孩子|生小孩|(?:孩子|小孩).{0,10}(?:幾|多少|生|緣|有|健康|相處)/.test(String(q||''));}
  function links(a,b){const pair=(xs)=>xs.some(x=>x===a+b||x===b+a);return {clash:pair(['子午','丑未','寅申','卯酉','辰戌','巳亥']),harm:pair(['子未','丑午','寅巳','卯辰','申亥','酉戌']),combine:pair(['子丑','寅亥','卯戌','辰酉','巳申','午未']),destruction:pair(['子酉','丑辰','寅亥','卯午','巳申','未戌'])};}
  function validPillar(p){return G.includes(p?.gan)&&B.includes(p?.zhi);}
  function stage(stem,branch){if(!(stem in START)||!B.includes(branch))return null;return STAGES[mod(B.indexOf(branch)-START[stem])];}
  function placements(c,dm,keys){return keys.flatMap(k=>{
    const p=c.pillars[k],row=(s,visible,qi)=>({id:k+(visible?'-stem':'-hidden-'+s),pillar:k,branch:p.zhi,stem:s,element:el(s),god:god(dm,s),visible,qi});
    return (k==='day'?[]:[row(p.gan,true,null)]).concat(H[p.zhi].map((s,i)=>row(s,false,i===0?'main':'residual')));
  });}
  // Original poems mix sons, births and historical survival wording. Preserve
  // those units; never silently rename their number as total biological children.
  function countEntry(profile,s){
    const base={長生:4,沐浴:2,冠帶:3,臨官:3,帝旺:5,衰:2,病:1,死:0,墓:null,絕:1,胎:null,養:3};
    if(profile==='yuanhai'&&s==='長生')base.長生=7;
    return {stage:s,rawNumber:base[s]??null,historicalRetainedNumber:s==='養'?(profile==='yuanhai'?2:1):null,
      quantityKind:'historical-son-count-or-mixed-birth-survival',modernBiologicalTotal:null,
      adjustments:s==='長生'?['中旬與司令退氣條件另核，不自動減半']:[],
      ruleSourceId:profile==='yuanhai'?'children-yuanhai':'children-ziping-xu'};
  }
  function compute(c,options={}){
    const p=c?.pillars||{},dm=c?.dm||p.day?.gan,unknown=!!(options.unknown||c?.birthTimeUnknown),keys=K.filter(k=>k!=='hour'||!unknown).filter(k=>validPillar(p[k]));
    if(!G.includes(dm)||!keys.includes('day'))return {schema:'jy.bazi-children/1',version:VERSION,status:'missing-day-master',requested:childQuestion(options.question),evidence:[],limits:['缺可確認日柱；不能套子女取法'],sources:SOURCES};
    const rows=placements(c,dm,keys),inputGender=gender(c.gender),hourKnown=!unknown&&keys.includes('hour'),di=Math.floor(G.indexOf(dm)/2),variants=inputGender?[inputGender]:['male','female'];
    const hourRelations=hourKnown?keys.filter(k=>k!=='hour').map(k=>({from:k,to:'hour',branches:p[k].zhi+p.hour.zhi,...links(p[k].zhi,p.hour.zhi)})):[];
    const allRelations=[];for(let i=0;i<keys.length;i++)for(let j=i+1;j<keys.length;j++)allRelations.push({from:keys[i],to:keys[j],branches:p[keys[i]].zhi+p[keys[j]].zhi,...links(p[keys[i]].zhi,p[keys[j]].zhi)});
    const branches=variants.map(g=>{
      const targetElement=E[(di+(g==='male'?3:1))%5],targetYang=G[E.indexOf(targetElement)*2],hits=rows.filter(x=>x.element===targetElement),roots=hits.filter(x=>!x.visible),visible=hits.filter(x=>x.visible),monthMain=el(H[p.month?.zhi]?.[0]);
      const condition=g==='male'?'本次明示男命取法：官殺合看':'本次明示女命取法：食傷合看';
      const supportElement=E[(E.indexOf(targetElement)+4)%5],controllerElement=E[(E.indexOf(targetElement)+3)%5],supporters=rows.filter(x=>x.element===supportElement),controllers=rows.filter(x=>x.element===controllerElement);
      const constraints=controllers.flatMap(a=>hits.map(b=>({from:a.id,to:b.id,stems:a.stem+b.stem,samePillar:a.pillar===b.pillar,distance:Math.abs(K.indexOf(a.pillar)-K.indexOf(b.pillar)),status:'structural-control-candidate',effective:null,needs:['實際季節力量','位置與透藏','全局制化及救應']})));
      const countStage=hourKnown?stage(targetYang,p.hour.zhi):null;
      const tables=g==='male'&&countStage?['ziping-xu','yuanhai'].map(profile=>({profile,...countEntry(profile,countStage)})):[];
      const count={status:g==='female'?'no-registered-female-count-formula':!hourKnown?'hour-unconfirmed':'provisional-traditional-estimate',targetYang,stage:countStage,tables,
        agreement:tables.length?tables.every(x=>x.rawNumber===tables[0].rawNumber&&x.historicalRetainedNumber===tables[0].historicalRetainedNumber):null,agreementIsNotIndependentEvidence:true,
        unresolved:['全局輕重與喜忌修正未量化','古訣的男孩／生養數不等於今生全部親生子女人數'],finalBiologicalTotal:null,
        readingRule:g==='male'?'初查數可作具名古法的象徵假定，需合全盤後才談偏多偏少；不能當已定人數，也不能直接合併男女人數。初查零不單獨斷無子或生殖能力，仍追其他位置與已算運勢。':'女命先讀實際食傷、時位與運勢；本包未註冊女命數量公式，不借用男命口訣硬給人數。'};
      const luck=(hourKnown?arr(c.dayun):[]).filter(d=>typeof d.gz==='string'&&G.includes(d.gz[0])&&B.includes(d.gz[1])).map(d=>({gz:d.gz,isCurrent:!!d.isCurrent,window:d.window||null,ageStart:d.ageStart,ageEnd:d.ageEnd,
        targetStem:el(d.gz[0])===targetElement,targetHidden:H[d.gz[1]].filter(s=>el(s)===targetElement),controllerStem:el(d.gz[0])===controllerElement,supportStem:el(d.gz[0])===supportElement,
        hourRelations:hourKnown?links(d.gz[1],p.hour.zhi):null,role:'stage-background-not-birth-promise'}));
      const annuals=(hourKnown?arr(c.dayun):[]).flatMap(d=>arr(d.liuNian).map(y=>({year:y.year,gz:y.gz,dayun:d.gz,window:y.window||null,targetStem:el(y.gz?.[0])===targetElement,targetHidden:H[y.gz?.[1]]?.filter(s=>el(s)===targetElement)||[],hourRelations:hourKnown?links(y.gz?.[1],p.hour.zhi):null,role:'symbolic-activation-not-conception-or-delivery-date'})));
      return {gender:g,status:inputGender?'selected-input':'conditional-not-selected',ruleSourceIds:['children-sanmings','children-yuanhai'],condition,targetElement,targetYang,
        placements:hits,visibleCount:visible.length,rootCount:roots.length,monthlyMain:monthMain,monthlyMainMatches:monthMain===targetElement,
        supporters,controllers,controlCandidates:constraints,actualMechanisms:arr(c.specialRuleAssessment?.rules).filter(x=>/食|梟|官|殺/.test(String(x.name||''))).map(x=>({id:x.id,name:x.name,status:x.status,conditions:x.conditions||null})),
        evidenceDirection:hits.length?(visible.length&&roots.length?'visible-and-rooted-child-symbols':'child-symbols-present'):luck.some(x=>x.targetStem||x.targetHidden.length)?'absent-natal-check-luck':'no-natal-child-symbols-found',
        evidenceMeaning:'方向只描述本次子女象徵的出現與位置；不是生殖能力、必生孩子或已有人數。',count,luck,annuals,
        synthesisChecks:['子女訊號與時位合讀，核相反作用是否有效','自身中和不能直接換成只生一至兩人','不按訊號出現個數當孩子人數','時位有支持不能單獨斷子女必孝順、供養或晚年依靠','原局未見不得斷終身無子，已算運勢仍須追完']};
    });
    return {schema:'jy.bazi-children/1',version:VERSION,status:keys.length===4?'structural-analysis-complete':'partial-structural-analysis',requested:childQuestion(options.question),question:String(options.question||''),
      query:{lifetime:/今生|此生|一生|終身/.test(options.question||''),biologicalOnly:/親生/.test(options.question||''),countRequested:/幾個|幾名|幾位|多少|數量|人數/.test(options.question||''),additional:/再生|再有|還會有|還有幾/.test(options.question||'')},
      inputGender:inputGender||'unprovided',genderSource:inputGender?'chart.gender-explicit-input':'not-inferred-from-luck-direction',hourKnown,
      hour:hourKnown?{...p.hour,relations:hourRelations}:null,actualBranchPairs:allRelations,branches,
      countCapability:{precision:'not-finalized',symbolic:'registered-rule-hypotheses-and-qualitative-synthesis',scope:'只限制精確終身總數，不停止子女主題分析'},
      sourceVariants:['《淵海》長生數七與《真詮評註》數四不同，養位留二與留一不同；不能當独立票數','《淵海》六親段與論子息段的女命男女角色相反；本包合看食傷，不預測胎兒性別'],
      limits:[...(!inputGender?['性別未明列：兩條件支線不得平均成相同數字']:[]),...(!hourKnown?['時位未確認：不套其數量、作用或精確交運']:[]),'缺少已生子女與生育規劃，不能把總數寫成還能再生幾人','傳統數量是象徵假定，不是已驗證事件或醫學檢查'],sources:SOURCES,predictionValidated:false};
  }
  function forReading(v,years){if(!v)return null;return {...v,branches:arr(v.branches).map(b=>({...b,annuals:arr(b.annuals).filter(y=>!years||years.includes(y.year))}))};}
  root.JYBaziChildren=Object.freeze({version:VERSION,compute,forReading,stage,countEntry,childQuestion,sources:SOURCES});
  if(typeof module!=='undefined'&&module.exports)module.exports=root.JYBaziChildren;
})(typeof window==='undefined'?globalThis:window);
