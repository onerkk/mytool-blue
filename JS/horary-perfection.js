/* Named formal rules after Graeme Tobyn's author-published 2007 review.
 * Temporal geometry is computed; spatial medieval variants and event judgment
 * are explicitly separate. All dates are actual ephemeris timeline records. */
(function(root){'use strict';
 const ORDER=['Moon','Mercury','Venus','Sun','Mars','Jupiter','Saturn'];
 const sources={part1:'https://www.skyscript.co.uk/tobyn2.html',part2:'https://www.skyscript.co.uk/tobyn3.html'};
 const time=e=>Date.parse(e.utc),has=(e,k)=>e.a===k||e.b===k,both=(e,a,b)=>has(e,a)&&has(e,b),other=(e,k)=>e.a===k?e.b:e.a;
 function orientation(chart,p){
  const a=chart.planets[p.a],b=chart.planets[p.b],diff=root.JYWestern.diff;
  const separation=diff(b.longitude,a.longitude),target=p.angle===0?0:p.angle*(separation<0?-1:1),delta=diff(separation,target);
  const ca=delta*-a.speed,cb=delta*b.speed,closingA=ca<0,closingB=cb<0;
  let applicant=closingA&&!closingB?p.a:closingB&&!closingA?p.b:ORDER.indexOf(p.a)<ORDER.indexOf(p.b)?p.a:p.b;
  return {applicant,receiver:applicant===p.a?p.b:p.a,mutualApplication:closingA&&closingB,closingContributions:{[p.a]:ca,[p.b]:cb},policy:'依兩星各自對所選相位差的收近貢獻定發光方；互趨採傳統輕重次序，保留兩星收近數值'};
 }
 function evaluate(chart,pairs,timeline){
  const start=Date.parse(timeline.start),end=Date.parse(timeline.endExclusive),all=timeline.events.slice().sort((a,b)=>time(a)-time(b)),rows=[];
  const solar=root.JYWestern.solarConditions(chart.planets),hosting=chart.essentialDignities?.dignityHosting||[];
  for(const pair of pairs.filter(p=>p.phase==='入相')){
   const dir=orientation(chart,pair),A=dir.applicant,B=dir.receiver,exact=all.find(e=>time(e)>start&&both(e,A,B)&&e.angle===pair.angle)||null,stop=exact?time(exact):end;
   const before=e=>time(e)>start&&time(e)<stop,events=all.filter(before),changes=timeline.ingresses.filter(before),stations=timeline.stations.filter(before);
   const contact=k=>events.filter(e=>has(e,k)),pairAt=(a,b)=>pairs.find(p=>both(p,a,b));
   const checks=[],add=(id,profile,matched,evidence,conditions,qualitativeRemaining=[])=>{checks.push({id,profile,status:matched?'established':exact||['return-of-light'].includes(id)?'not-established':'undetermined',matched,evidence,conditions,qualitativeRemaining,scope:'具名形式前提；不等於現實事件成敗'});};
   const rx=stations.filter(e=>e.planet===A&&e.after==='retrograde'&&chart.planets[A].speed>=0);
   add('refranation','TOBYN_APPLICANT_TURNS_RX',rx.length>0,rx,{applicant:A,initialDirect:chart.planets[A].speed>=0,receiverStationDoesNotCount:true});
   const ev=changes.filter(e=>e.planet===B),strictEvasion=ev.map(e=>{const next=events.find(z=>time(z)>time(e)&&has(z,B)&&!has(z,A)),catchup=changes.find(z=>z.planet===A&&time(z)>time(e));return {ingress:e,receiverNextThirdAspect:next||null,beforeApplicantIngress:!!next&&(!catchup||time(next)<time(catchup))};});
   add('evasion','TOBYN_RECEIVER_INGRESS',ev.length>0,strictEvasion,{receiver:B,applicantIngressDoesNotCount:true,abuMasharAdditionalThirdContact:strictEvasion.some(e=>e.beforeApplicantIngress)});
   const prohibition=[],cuts=[],resistance=[];
   for(const C of ORDER.filter(k=>k!==A&&k!==B)){
    const toB=events.find(e=>both(e,C,B)),toA=events.find(e=>both(e,C,A)),cb=pairAt(C,B),ac=pairAt(A,C),path=contact(C),ca=chart.planets[C];
    if(toB&&cb?.phase==='入相'&&orientation(chart,cb).applicant===C&&ca.speed>0){
     const preceding=path.filter(e=>time(e)<time(toB));if(preceding.every(e=>has(e,A)))prohibition.push({interpositor:C,receiverContact:toB,priorApplicantContacts:preceding});
    }
    const retroIngress=changes.find(e=>e.planet===C&&!e.direct&&toB&&time(e)<time(toB));
    if(toB&&retroIngress&&!toA)cuts.push({type:'a-retrograde-next-sign-receiver-only',interpositor:C,ingress:retroIngress,contacts:[toB]});
    if(toB&&toA&&cb?.phase==='入相'&&orientation(chart,cb).receiver===C&&time(toB)<time(toA))cuts.push({type:'b-receiver-then-applicant-to-third',interpositor:C,contacts:[toB,toA]});
    if(toA&&contact(A)[0]===toA&&ac?.phase==='入相'&&orientation(chart,ac).applicant===A)cuts.push({type:'c-applicant-first-to-third',interpositor:C,contacts:[toA]});
    const turn=stations.find(e=>e.planet===C&&e.after==='retrograde');
    const intermediate=ORDER.indexOf(A)<ORDER.indexOf(C)&&ORDER.indexOf(C)<ORDER.indexOf(B),allowed=['Venus','Mars','Jupiter'].includes(C);
    if(allowed&&intermediate&&ca.speed>=0&&turn&&toB&&toA&&time(turn)<time(toB)&&time(toB)<time(toA)&&contact(A)[0]===toA){
     const afterTurn=path.filter(e=>time(e)>time(turn));if(afterTurn[0]===toB&&afterTurn[1]===toA)resistance.push({interpositor:C,station:turn,daysToStation:(time(turn)-start)/86400000,contacts:[toB,toA],traditionalHeaviness:[A,C,B]});
    }
   }
   add('prohibition','LILLY_TEMPORAL_FIRST_RECEIVER_CONTACT',prohibition.length>0,prohibition,{firstReceiverContactByThirdBeforeAB:true,thirdIsApplyingToReceiver:true,interveningThirdContactsAllowedOnlyToApplicant:true},['介入星所掌事情宮、接納及助阻角色須合判；不自動將暫緩視為永久失敗']);
   add('abscission','TOBYN_ABU_MASHAR_THREE_TEMPORAL_STRUCTURES',cuts.length>0,cuts,{types:['a-retrograde-next-sign-receiver-only','b-receiver-then-applicant-to-third','c-applicant-first-to-third']},['與集光或禁止可能重疊，依雙方接納及事情宮角色判作用；未合併古典空間等距版本']);
   add('contrariety','TOBYN_STRICT_INTERMEDIATE_STATION_EVENT_ORDER',resistance.length>0,resistance,{directAtChart:true,eligibleInterpositors:['Venus','Mars','Jupiter'],middleTraditionalHeaviness:true,afterRxFirstBThenA:true},['文獻「接近駐留」未給量化門檻，保留實際距駐留日數供判讀']);
   const weak=k=>({retrograde:chart.planets[k].retrograde===true,combust:solar.find(e=>e.planet===k)?.state==='combust',house:chart.planets[k].house}),wa=weak(A),wb=weak(B),follower=wa.retrograde&&wb.retrograde&&!wa.combust&&!wb.combust,host=hosting.filter(e=>[A,B].includes(e.host)&&[A,B].includes(e.guest)),cadent=h=>[3,6,9,12].includes(h);
   const returned=!follower&&(wa.retrograde||wb.retrograde||wa.combust||wb.combust),good=returned&&[1,2,4,5,7,8,10,11].includes(wa.house)&&[1,2,4,5,7,8,10,11].includes(wb.house)&&host.length>0,bad=returned&&(wa.retrograde||wa.combust)&&cadent(wa.house)&&[1,2,4,5,7,8,10,11].includes(wb.house);
   add('return-of-light','TOBYN_BIRUNI_WEAKNESS_AND_FOLLOWER_EXCEPTION',returned,{applicant:wa,receiver:wb,hosting:host.map(e=>({host:e.host,guest:e.guest,dignities:e.dignities})),followerException:follower,ameliorationPremises:good,corruptionPremises:bad},{combustionPolicy:'沿本盤Lilly角距政策；日心不當燃燒',twoRetrogradeWithoutCombustionIsFollower:true},['接納有無實際相位、尊貴強度及事情宮仍須判；良性／惡性前提不是成敗保證']);
   rows.push({pair:[pair.a,pair.b],angle:pair.angle,orientation:dir,perfection:exact,window:{start:timeline.start,endExclusive:timeline.endExclusive,censored:!exact},checks});
  }
  return {version:'20261003denial1',status:'calculated',profiles:'separate-named-temporal-rules',rows,sources,unavailable:['古典空間等距與相位階序版本未自動裁決','文獻未量化的近駐留程度與介入星現實助阻角色須判讀'],policy:'每組現正在入相的七曜相位逐項計算六類。窗內未找到成相且未見觸發時為undetermined，不能推成永不成相；重疊規則不加總吉凶票。'};
 }
 root.JYHoraryPerfection=Object.freeze({version:'20261003denial1',evaluate,orientation,sources});
})(typeof window==='undefined'?globalThis:window);
