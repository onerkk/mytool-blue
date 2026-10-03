/* Sudarsana Chakra: PVR ch31, with BPHS ch74 applicability kept separately.
 * Real solar-return/month/2.5-degree boundaries come from the Tajaka engine.
 * Natal reference signs advance; positions are taken from each ENTRY chart.
 * No event probabilities, life/death predictions or automatic gemstone choice.
 */
(function(root){
  'use strict';
  const VERSION='20261003sudarsana1',mod=n=>(n%12+12)%12;
  const SOURCE='https://www.vedicastrologer.org/articles/vedic_astro_textbook.pdf';
  const REFS=['Lagna','Moon','Sun'];
  function yearHouse(completedYears){
    if(!Number.isInteger(completedYears)||completedYears<0)throw Error('已滿歲數必須是非負整數');
    return mod(completedYears)+1;
  }
  function anchors(v){return {Lagna:v.lagna?.sign??null,Moon:v.planets.Moon.sign,Sun:v.planets.Sun.sign};}
  function periodSigns(a,offset){return Object.fromEntries(REFS.map(k=>[k,a[k]===null?null:mod(a[k]+offset)]));}
  function house(sign,lagna){return mod(sign-lagna)+1;}
  function generalPlacement(nature,h){
    if(nature==='benefic')return {assessment:[6,12].includes(h)?'adverse':'favorable',rule:'PVR31.4-benefic-except-6-12'};
    if(nature==='malefic')return {assessment:[3,6,11].includes(h)?'favorable':'adverse',rule:'PVR31.4-malefic-3-6-11'};
    return {assessment:'undetermined',rule:'nature-undetermined'};
  }
  function assess(natal,entry,division,sign){
    const E=root.JYVedic,v=entry.vargas[division];
    if(!v||sign===null)return {status:'insufficient-data',division,sign};
    const p=root.JYVedicCompletion.projectedPlanets(entry,v),natures=E.naturalNatures(entry.planets),av=natal.vargaAshtakavarga?.[division],aspect=E.aspects(p,sign);
    const placements=E.KEYS.map(k=>{
      const h=house(p[k].sign,sign),natural=natures[k],decision=generalPlacement(natural,h),avTransitSign=entry.planets[k].sign,bav=av?.bav?.[k]?.[avTransitSign]??null;
      const avAssessment=bav===null?'unavailable':bav>4?'favorable':bav<4?'adverse':'mixed';
      return {planet:k,sign:p[k].sign,house:h,nature:natural,...decision,
        variants:k==='Rahu'?[{profile:'PVR31.4-literal-Rahu-sentence',assessment:'adverse',rule:'Rahu sentence treats its occupied house as harmed'},{profile:'PVR31.4-Example126',assessment:h===11?'favorable':'not-covered-by-example',rule:'Published D24 example treats both nodes in the 11th as favorable'}]:[],
        avTransitSign,natalBav:bav,avAssessment,agreement:bav===null?'unavailable':avAssessment==='mixed'?'mixed':avAssessment===decision.assessment?'convergent':'divergent',
        entryStrength:entry.strength?.planets?.find(z=>z.planet===k)?.relativeStrength??null};
    });
    const houses=Array.from({length:12},(_,i)=>{
      const s=mod(sign+i),lord=E.LORDS[s],occupants=placements.filter(p=>p.sign===s),aspectors=aspect.graha.filter(p=>p.toSign===s).map(p=>p.from);
      return {house:i+1,sign:s,lord,occupants:occupants.map(p=>p.planet),aspectors,
        favorableOccupants:occupants.filter(p=>p.assessment==='favorable').map(p=>p.planet),adverseOccupants:occupants.filter(p=>p.assessment==='adverse').map(p=>p.planet),
        lordPlacement:placements.find(p=>p.planet===lord),natalSav:av?.sav?.[s]??null,
        noOccupantFallback:occupants.length?null:aspectors.length?'examine-aspects':'examine-house-lord'};
    });
    return {status:'calculated',division,sign,lord:E.LORDS[sign],entryUTC:entry.input?.utc||entry.utc,placements,houses,
      aspects:aspect,policy:'PVR31.4 general placement criteria and conflicting literal/example variants stay separate. PVR25.5 BAV looks up the natal Dn seven-planet table at the physical D1 transit sign at the ENTRY instant, not its Dn projection; >4/4/<4 are favorable/mixed/adverse. This uses a separate reference frame from SC Dn placements. SAV is shown without a new numeric forecast threshold. Neither count nor agreement is an event probability.'};
  }
  function entryReadings(natal,entry,signs,division){return Object.fromEntries(REFS.map(k=>[k,assess(natal,entry,division,signs[k])]));}
  function compute(natal,tajaka=natal.tajaka){
    if(natal.input.unknownTime||!natal.lagna)return {version:VERSION,status:'insufficient-data',missing:['confirmed-birth-time'],vargas:{},months:[],sixtyHours:[]};
    if(!tajaka||tajaka.status!=='calculated')return {version:VERSION,status:tajaka?.status||'module-unavailable',missing:['calculated-solar-return-entry-charts'],vargas:{},months:[],sixtyHours:[]};
    const age=tajaka.completedYears,yearOffset=yearHouse(age)-1,m=tajaka.currentMonth,s=tajaka.currentSixtyHour,vargas={};
    for(const [d,v]of Object.entries(natal.vargas)){
      const a=anchors(v),annualSigns=periodSigns(a,yearOffset),monthIndex=m?m.window.month-1:null,segmentPart=s?s.window.part-1:null,monthSigns=monthIndex===null?null:periodSigns(a,yearOffset+monthIndex),segmentSigns=segmentPart===null?null:periodSigns(a,yearOffset+s.window.month-1+segmentPart);
      const distinct=new Set(Object.values(a)).size===3;
      vargas[d]={division:+d,anchors:a,natalWheels:Object.fromEntries(REFS.map(k=>[k,Array.from({length:12},(_,i)=>({house:i+1,sign:mod(a[k]+i),lord:root.JYVedic.LORDS[mod(a[k]+i)],occupants:Object.keys(v.planets).filter(p=>v.planets[p].sign===mod(a[k]+i))}))])),
        bphsApplicability:{profile:'BPHS74.19-20',threeDistinctSigns:distinct,references:distinct?REFS:['Lagna'],decision:distinct?'three-wheel':'rasi-kundali-only',policy:'This BPHS condition is not substituted into PVR31; PVR retains all three, including shared signs, without treating aliases as independent votes.'},
        annualSigns,monthlySigns:tajaka.months.map(p=>periodSigns(a,yearOffset+p.month-1)),sixtyHourSigns:tajaka.sixtyHours.map(p=>periodSigns(a,yearOffset+p.month-1+p.part-1)),
        current:{annual:{window:tajaka.window,signs:annualSigns,readings:entryReadings(natal,tajaka.annual,annualSigns,+d)},
          monthly:m?{window:m.window,signs:monthSigns,readings:entryReadings(natal,m.chart,monthSigns,+d)}:null,
          sixtyHour:s?{window:s.window,signs:segmentSigns,readings:entryReadings(natal,s.chart,segmentSigns,+d)}:null}};
    }
    const out={version:VERSION,status:'calculated',profile:'PVR31-SUDARSANA-THREE-REFERENCES',source:SOURCE,completedYears:age,yearOfLife:age+1,yearHouse:yearOffset+1,window:tajaka.window,months:tajaka.months,sixtyHours:tajaka.sixtyHours,vargas,
      sourceAudit:[{source:'PVR31.4 / Example126',issue:'The categorical Rahu sentence conflicts with the example favorable placement of Rahu in the 11th; both evaluations are recorded.'},{source:'PVR31.4 / Example127',issue:'General benefic rule excludes only houses 6 and 12; Example127 calls Venus in the 3rd a failure. That outcome is not forced into the generic arithmetic.'},{source:'BPHS74.21-23 vs PVR31.3',issue:'BPHS nominal month/2-day/12-ghatika descriptions and PVR actual solar-return entry times differ. This model uses the named PVR solar clock; it does not call each 2.5-degree interval a fixed 60 hours.'}],
      policy:'All20 calculated vargas retain natal Lagna/Moon/Sun anchors, 12-house wheels, all12 monthly and144 subperiod signs, and all3 currently active ENTRY charts. No strongest-reference shortcut is silently selected. Future/past period charts are computed on request, not claimed precomputed.',
      limits:['BPHS74 D1 nature-loss, raw tied-strength, own-lord and alternate polarity calculations are separately recorded in bphs when its module is available; named clock variants remain explicit.','Other historical dasha/Yoga variants outside the named source profile remain outside this model.']};
    if(root.JYVedicSudarsanaBPHS)out.bphs=root.JYVedicSudarsanaBPHS.compute(natal,out,tajaka);
    return out;
    if(root.JYVedicSudarsanaBPHS)out.bphs=root.JYVedicSudarsanaBPHS.compute(natal,out,tajaka);
    return out;
  }
  function chartForPeriod(natal,sudarsana,kind,index){
    if(sudarsana.status!=='calculated')throw Error('本次三重運期未能完成計算');
    const list=kind==='monthly'?sudarsana.months:kind==='sixty-hour'?sudarsana.sixtyHours:null;
    if(!list||!Number.isInteger(index)||index<1||index>list.length)throw Error('請指定有效月序1–12或細段序1–144');
    const window=list[index-1],c=root.JYVedic.compute({...natal.input,utc:window.start,reference:window.start,civil:null,uncertaintyMinutes:0,transitRules:false,tajaka:false,sudarsana:false});
    const out={kind,window,chart:c,vargas:Object.fromEntries(Object.entries(sudarsana.vargas).map(([d,v])=>{const signs=(kind==='monthly'?v.monthlySigns:v.sixtyHourSigns)[index-1];return [d,{signs,readings:entryReadings(natal,c,signs,+d)}];}))};
    if(root.JYVedicSudarsanaBPHS){const v=out.vargas[1],context=root.JYVedicSudarsanaBPHS.entryContext(c);out.bphs={context,readings:root.JYVedicSudarsanaBPHS.readings(natal,context,v.signs,sudarsana.vargas[1].bphsApplicability.references)};}
    return out;
    if(root.JYVedicSudarsanaBPHS){const v=out.vargas[1],context=root.JYVedicSudarsanaBPHS.entryContext(c);out.bphs={context,readings:root.JYVedicSudarsanaBPHS.readings(natal,context,v.signs,sudarsana.vargas[1].bphsApplicability.references)};}
    return out;
  }
  root.JYVedicSudarsana=Object.freeze({version:VERSION,compute,chartForPeriod,yearHouse,anchors,periodSigns,generalPlacement,assess});
})(typeof window==='undefined'?globalThis:window);
