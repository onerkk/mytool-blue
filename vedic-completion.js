/* Deterministic additional Jyotisha calculations. No generated interpretations.
 * P.V.R. Narasimha Rao, Vedic Astrology: An Integrated Approach, ch.4,5,9–11,15,17–24.
 * BPHS ch.31 and 46; Mantreswara, Phaladeepika 7.26–30.
 * Every school choice and unresolved tie is exported with the actual calculation.
 */
(function(root){
  'use strict';
  const VERSION='20261003-completion1',DAY=86400000,EPS=1e-9;
  const K=['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn','Rahu','Ketu'],SEVEN=K.slice(0,7);
  const L=['Mars','Venus','Mercury','Moon','Sun','Mercury','Venus','Mars','Jupiter','Saturn','Saturn','Jupiter'];
  const EX={Sun:0,Moon:1,Mars:9,Mercury:5,Jupiter:3,Venus:11,Saturn:6,Rahu:2,Ketu:8};
  const DEEP={Sun:10,Moon:33,Mars:298,Mercury:165,Jupiter:95,Venus:357,Saturn:200};
  const OWN={Sun:[4],Moon:[3],Mars:[0,7],Mercury:[2,5],Jupiter:[8,11],Venus:[1,6],Saturn:[9,10],Rahu:[10],Ketu:[7]};
  const ODD_FOOT=[0,1,2,6,7,8],KENDRA=[1,4,7,10],TRINE=[1,5,9],UPACHAYA=[3,6,10,11];
  const PVR='https://www.vedicastrologer.org/articles/vedic_astro_textbook.pdf';
  const PHALA='https://www.siva.sh/phaladeepika/7/26-30';
  const mod=(x,n=12)=>((x%n)+n)%n,norm=x=>mod(x,360),house=(sign,origin)=>mod(sign-origin)+1;
  const all=xs=>xs.includes(false)?false:xs.includes(null)?null:true,any=xs=>xs.includes(true)?true:xs.includes(null)?null:false;
  const unique=xs=>[...new Set(xs)],iso=x=>new Date(x).toISOString();
  const exalted=(p,k)=>p[k].sign===EX[k],debilitated=(p,k)=>p[k].sign===mod(EX[k]+6);
  const advanced=(p,k)=>['Rahu','Ketu'].includes(k)?30-p[k].degree:p[k].degree;
  function rasiAspect(a,b){return a!==b&&(a%3===2?b%3===2:a%3===0?b%3===1&&b!==mod(a+1):b%3===0&&b!==mod(a-1));}
  function grahaAspect(p,k,sign){return (k==='Rahu'||k==='Ketu')?false:([7].concat(k==='Mars'?[4,8]:k==='Jupiter'?[5,9]:k==='Saturn'?[3,10]:[])).includes(house(sign,p[k].sign));}
  function rawLength(p,sign,lord){const direction=ODD_FOOT.includes(sign)?1:-1,steps=mod(direction*(p[lord].sign-sign)),base=steps||12,rawCorrection=exalted(p,lord)?1:debilitated(p,lord)?-1:0,correction=steps===0?0:rawCorrection;return {sign,lord,direction,steps,base,correction,years:base+correction,literalAdditiveYears:base+rawCorrection,ownSignPriority:steps===0,sourceAudit:steps===0&&rawCorrection?'Own sign stays12 per Narayan Iyer2001 explicit note (Mercury Virgo). PVR18 prose additive reading gives13; both recorded.':'PVR18.2.2'};}
  function decide(candidates,criteria){
    const trace=[];for(const [key,values] of criteria){trace.push({key,values});if(values[0]!==values[1]&&Math.abs(values[0]-values[1])>EPS)return {winner:candidates[values[0]>values[1]?0:1],status:'decided',decisive:key,trace};}
    return {winner:null,status:'unresolved-tie',alternatives:candidates.slice(),trace};
  }
  function coLord(p,sign,purpose='dasha'){
    if(sign!==7&&sign!==10)return {winner:L[sign],status:'single-lord',trace:[]};
    const pair=sign===7?['Mars','Ketu']:['Saturn','Rahu'],inOwn=pair.map(k=>p[k].sign===sign);
    if(inOwn[0]!==inOwn[1])return {winner:pair[inOwn[0]?1:0],status:'decided',decisive:'only-one-in-own-rasi-use-other',trace:[{key:'inOwnRasi',values:inOwn}]};
    const roles=k=>['Jupiter','Mercury',L[p[k].sign]].filter(q=>q!==k&&(p[q].sign===p[k].sign||rasiAspect(p[q].sign,p[k].sign))).length;
    return decide(pair,[['companions',pair.map(k=>K.filter(q=>q!==k&&p[q].sign===p[k].sign).length)],['jupiter-mercury-dispositor-roles',pair.map(roles)],['exaltation',pair.map(k=>+exalted(p,k))],['dual-fixed-movable',pair.map(k=>p[k].sign%3)],
      [purpose==='dasha'?'dasha-length':'degree-advancement',pair.map(k=>purpose==='dasha'?rawLength(p,sign,k).years:advanced(p,k))]]);
  }
  function strongerRasi(p,a,b,purpose='dasha'){
    const ca=coLord(p,a,purpose),cb=coLord(p,b,purpose),lords=[ca.winner,cb.winner];
    const count=s=>K.filter(k=>p[k].sign===s).length;
    const roles=(s,l)=>l==null?null:['Jupiter','Mercury',l].filter(k=>p[k].sign===s||rasiAspect(p[k].sign,s)).length;
    const criteria=[['occupants',[count(a),count(b)]]];
    if(lords.some(l=>l==null)){const first=decide([a,b],criteria);return first.winner!=null?{...first,lords:[ca,cb]}:{winner:null,status:'unresolved-colord',alternatives:[a,b],lords:[ca,cb],trace:first.trace};}
    criteria.push(['jupiter-mercury-lord-roles',[roles(a,lords[0]),roles(b,lords[1])]],['exalted-occupant',[a,b].map(s=>+K.some(k=>p[k].sign===s&&exalted(p,k)))],['lord-opposite-parity',[a,b].map((s,i)=>+(s%2!==p[lords[i]].sign%2))],['dual-fixed-movable',[a%3,b%3]],['lord-degree-advancement',lords.map(k=>advanced(p,k))]);
    return {...decide([a,b],criteria),lords:[ca,cb]};
  }
  function arudhaSign(origin,destination){const steps=mod(destination-origin);let sign=mod(origin+2*steps);const exception=[0,6].includes(mod(sign-origin));if(exception)sign=mod(sign+9);return {origin,destination,steps,sign,exception};}
  function arudhas(p,lagna){
    const bhava=lagna==null?[]:Array.from({length:12},(_,i)=>{const origin=mod(lagna+i),lord=coLord(p,origin,'arudha');return {house:i+1,name:i===0?'AL':i===11?'UL':'A'+(i+1),lordSelection:lord,...(lord.winner?arudhaSign(origin,p[lord.winner].sign):{sign:null,status:lord.status})};});
    const graha=K.map(k=>{const owned=OWN[k],selection=owned.length===1?{winner:owned[0],status:'single-sign',trace:[]}:strongerRasi(p,owned[0],owned[1],'arudha');return {planet:k,ownedSignSelection:selection,...(selection.winner!=null?arudhaSign(p[k].sign,selection.winner):{sign:null,status:selection.status})};});
    return {profile:'PVR-9.2-9.5-15.5',bhava,graha};
  }
  function argala(p,lagna,natures){
    function target(sign,key){
      const direction=p.Ketu.sign===sign?-1:1,at=h=>K.filter(k=>p[k].sign===mod(sign+direction*(h-1)));
      const channels=[[2,12],[4,10],[11,3],[5,9]].map(([h,b])=>{const contributors=at(h),blockers=at(b),vipareeta=b===3&&blockers.filter(k=>natures[k]==='malefic').length>=3;
        const countDecision=!contributors.length?'absent':!blockers.length||vipareeta?'unobstructed':contributors.length>blockers.length?'argala-count-dominates':contributors.length<blockers.length?'obstruction-count-dominates':'equal-count-strength-review';
        return {argalaHouse:h,obstructionHouse:b,contributors,blockers,vipareeta,countDecision,quarterCounterpairs:contributors.flatMap(a=>blockers.filter(z=>Math.floor(p[a].degree/7.5)+Math.floor(p[z].degree/7.5)===3).map(z=>({argala:a,obstructor:z}))),nature:contributors.map(k=>({planet:k,nature:natures[k]}))};});
      return {key,sign,direction,channels,thirdMalefics:at(3).filter(k=>natures[k]==='malefic')};
    }
    return {profile:'PVR-10.5–10.7-with-BPHS31-three-malefics',policy:'四對來源與阻擋完整列出；同數不捏造強弱總分。Ketu所在座反算；三凶曜門檻及四分段相抵另依BPHS31具名列出。宮位與行星引用本分盤同座的完整sign ledger，避免重複。',signs:Array.from({length:12},(_,s)=>target(s,'sign-'+s)),houses:lagna==null?[]:Array.from({length:12},(_,i)=>({house:i+1,sign:mod(lagna+i),ledger:'sign-'+mod(lagna+i)})),planets:K.map(k=>({planet:k,sign:p[k].sign,ledger:'sign-'+p[k].sign}))};
  }
  function children(parent,order,weights){let cursor=parent.start;const total=order.reduce((n,k)=>n+weights[k],0);return order.map((lord,i)=>{const end=i===order.length-1?parent.end:Math.round(cursor+(parent.end-parent.start)*weights[lord]/total),row={lord,start:cursor,end};cursor=end;return row;});}
  function current(periods,birth,reference,childFn){const md=reference>=birth?periods.find(p=>p.end>reference&&p.start<=reference):null,ad=md?.children?.find(p=>p.end>reference&&p.start<=reference)||null,pds=ad&&childFn?childFn(ad):[];return md?{maha:md,antar:ad,pratyantar:pds.find(p=>p.start<=reference&&p.end>reference)||null,pratyantars:pds}:null;}
  function planetaryDasha(chart,system,order,weights,firstIndex,fraction,childStartsNext=false){
    if(chart.input.unknownTime)return {system,status:'insufficient-data',missing:['confirmed-birth-time'],periods:[],current:null};
    const birth=Date.parse(chart.input.utc),reference=Date.parse(chart.input.reference),unit=chart.input.yearDays*DAY,first=order[firstIndex],cycleYears=Object.values(weights).reduce((n,v)=>n+v,0);
    const childFn=p=>{const i=order.indexOf(p.lord);return children(p,order.map((_,j)=>order[mod(i+j+(childStartsNext?1:0),order.length)]),weights);};
    let cursor=Math.round(birth-fraction*weights[first]*unit);const periods=[];
    const cycles=Math.max(2,Math.ceil((Math.max(reference,birth)+5*unit-cursor)/(cycleYears*unit)));
    for(let i=0;i<order.length*cycles;i++){const lord=order[mod(firstIndex+i,order.length)],end=Math.round(cursor+weights[lord]*unit),row={lord,years:weights[lord],start:cursor,end,visibleStart:Math.max(birth,cursor)};row.children=childFn(row);periods.push(row);cursor=end;}
    return {system,status:'calculated',cycleYears,yearDays:chart.input.yearDays,birth,reference,elapsedFraction:fraction,firstLord:first,balanceYears:(periods[0].end-birth)/unit,periods,current:current(periods,birth,reference,childFn),boundaryPolicy:'UTC [start,end); full first-period start retained, not a truncated antardasa anchor'};
  }
  function ashtottari(chart){
    const order=['Sun','Moon','Mars','Mercury','Saturn','Jupiter','Rahu','Venus'],weights={Sun:6,Moon:15,Mars:8,Mercury:17,Saturn:10,Jupiter:19,Rahu:12,Venus:21};
    const arcs=[[200/3,120],[120,160],[160,640/3],[640/3,760/3],[760/3,880/3],[880/3,1000/3],[1000/3,1160/3],[80/3,200/3]];
    const moon=chart.planets.Moon.longitude,index=arcs.findIndex(([a,b])=>(moon<a?moon+360:moon)>=a&&(moon<a?moon+360:moon)<b),[start,end]=arcs[index],unwrapped=moon<start?moon+360:moon;
    const l=chart.lagna?.sign,lord=l==null?null:L[l],rahu=chart.planets.Rahu,krishna=norm(moon-chart.planets.Sun.longitude)>=180,day=chart.strength?.clock?.segment?.daytime;
    return {...planetaryDasha(chart,'Ashtottari/PVR17-uniform-arcs',order,weights,index,(unwrapped-start)/(end-start),true),arc:{start,end,moon:unwrapped},antardasaPolicy:'NEXT planet after maha lord; maha itself last. PVR17.2, not Vimshottari order.',applicability:{universal:true,rahuKendraTrineFromLagnaLord:l==null?null:rahu.sign!==l&&[1,4,5,7,9,10].includes(house(rahu.sign,chart.planets[lord].sign)),dayKrishnaOrNightShukla:day==null?null:day?krishna:!krishna},sourceAudit:'PVR Table39 uniform lunar arcs differ from BPHS46 Abhijit 28-nakshatra division; this profile does not silently combine them.'};
  }
  function yogini(chart){
    const order=['Moon','Sun','Jupiter','Mars','Mercury','Saturn','Venus','Rahu'],weights={Moon:1,Sun:2,Jupiter:3,Mars:4,Mercury:5,Saturn:6,Venus:7,Rahu:8};
    const nak=chart.planets.Moon.nakshatra;return {...planetaryDasha(chart,'Yogini/BPHS46',order,weights,mod(nak.index+3,8),nak.fraction),names:['Mangala','Pingala','Dhanya','Bhramari','Bhadrika','Ulka','Siddha','Sankata']};
  }
  function conditionalNakshatraDasas(chart){
    const n=chart.planets.Moon.nakshatra,lagna=chart.lagna?.sign??null,day=chart.strength?.clock?.segment?.daytime,krishna=norm(chart.planets.Moon.longitude-chart.planets.Sun.longitude)>=180,hora=chart.vargas[2].lagna?.sign??null;
    const specs=[
      ['Shodashottari',['Sun','Mars','Jupiter','Saturn','Ketu','Moon','Mercury','Venus'],[11,12,13,14,15,16,17,18],mod(n.index-7,27)+1,lagna==null?null:hora===3&&krishna||hora===4&&!krishna],
      ['Dwadashottari',['Sun','Jupiter','Ketu','Mercury','Rahu','Mars','Saturn','Moon'],[7,9,11,13,15,17,19,21],mod(26-n.index,27)+1,lagna==null?null:L[chart.vargas[9].lagna.sign]==='Venus'],
      ['Panchottari',['Sun','Mercury','Saturn','Mars','Venus','Moon','Jupiter'],[12,13,14,15,16,17,18],mod(n.index-16,27)+1,lagna==null?null:lagna===3&&chart.vargas[12].lagna.sign===3],
      ['Shatabdika',['Sun','Moon','Venus','Mercury','Jupiter','Mars','Saturn'],[5,5,10,10,20,20,30],mod(n.index-26,27)+1,lagna==null?null:lagna===chart.vargas[9].lagna.sign],
      ['ChaturashitiSama',SEVEN,[12,12,12,12,12,12,12],mod(n.index-14,27)+1,lagna==null?null:chart.planets[L[mod(lagna+9)]].house===10],
      ['DwisaptatiSama',SEVEN.concat('Rahu'),[9,9,9,9,9,9,9,9],mod(n.index-18,27)+1,lagna==null?null:[1,7].includes(chart.planets[L[lagna]].house)],
      ['ShatTrimshatSama',['Moon','Sun','Jupiter','Mars','Mercury','Saturn','Venus','Rahu'],[1,2,3,4,5,6,7,8],mod(n.index-21,27)+1,day==null||hora==null?null:day?hora===4:hora===3]
    ];
    const out=Object.fromEntries(specs.map(([name,order,years,count,applicability])=>{const weights=Object.fromEntries(order.map((k,i)=>[k,years[i]]));return [name,{...planetaryDasha(chart,name+'/BPHS46.23–43-BPHS51',order,weights,mod(count-1,order.length),n.fraction),nakshatraCount:count,applicability,antardasaPolicy:'BPHS51 proportional, first antardasa = maha lord'}];}));
    out.Shodashottari.applicabilityAlternative=day==null?null:day?krishna:!krishna;
    // Keep the genuinely different 28-nakshatra rule alongside PVR uniform arcs.
    const slots=Array.from({length:27},(_,i)=>({nakshatra:i,start:i*40/3,end:(i+1)*40/3}));slots[20].end=830/3;slots[21].start=280+8/9;slots.splice(21,0,{nakshatra:'Abhijit',start:830/3,end:280+8/9});
    const order=['Sun','Moon','Mars','Mercury','Saturn','Jupiter','Rahu','Venus'],sizes=[4,3,4,3,4,3,4,3],weights={Sun:6,Moon:15,Mars:8,Mercury:17,Saturn:10,Jupiter:19,Rahu:12,Venus:21},rotated=slots.slice(5).concat(slots.slice(0,5));let group=0,offset=0;
    const x=chart.planets.Moon.longitude,slot=rotated.findIndex(s=>x>=s.start&&x<s.end);while(slot>=offset+sizes[group])offset+=sizes[group++];const s=rotated[slot],fraction=(slot-offset+(x-s.start)/(s.end-s.start))/sizes[group];
    out.Ashtottari28={...planetaryDasha(chart,'Ashtottari/BPHS46-Abhijit28-BPHS51',order,weights,group,fraction),birthSlot:s,withinGroup:slot-offset,groupSize:sizes[group],applicability:ashtottari(chart).applicability.rahuKendraTrineFromLagnaLord,sourceAudit:'28 unequal lunar slots, equal period-share per slot within each lord group; differs from PVR uniform longitude arcs and NEXT-lord antardasas. Both fully calculated and kept distinct.'};
    return out;
  }
  const KC_S=[0,1,2,3,4,5,6,7,8,9,10,11,7,6,5,3,4,2,1,0,11,10,9,8],KC_A=[8,9,10,11,0,1,2,4,3,5,6,7,11,10,9,8,7,6,5,4,3,2,1,0];
  const KC_Y=[7,16,9,21,5,9,16,7,10,4,4,10],KC_S1=[0,2,6,8,12,14,18,20,24,26],KC_S2=[1,7,13,19,25],KC_A1=[3,9,15,21];
  function kalachakra(chart){
    if(chart.input.unknownTime)return {system:'Kalachakra/BPHS46-PVR24',status:'insufficient-data',periods:[],current:null};
    const n=chart.planets.Moon.nakshatra,savya=KC_S1.includes(n.index)||KC_S2.includes(n.index),subgroup=savya?(KC_S1.includes(n.index)?1:2):(KC_A1.includes(n.index)?1:2),basis=savya?KC_S:KC_A,padaOffset=mod((subgroup-1)*36+(n.pada-1)*9,24),padaSigns=Array.from({length:9},(_,i)=>basis[mod(padaOffset+i,24)]);
    const fraction=mod(n.fraction*4,1),paramayush=padaSigns.reduce((v,s)=>v+KC_Y[s],0);let elapsed=fraction*paramayush,firstSlot=0;while(firstSlot<8&&elapsed>=KC_Y[padaSigns[firstSlot]]-EPS){elapsed-=KC_Y[padaSigns[firstSlot++]];}
    const birth=Date.parse(chart.input.utc),reference=Date.parse(chart.input.reference),unit=chart.input.yearDays*DAY,startSlot=mod(padaOffset+firstSlot,24);let cursor=Math.round(birth-elapsed*unit);const periods=[];
    const childFn=(p,slot)=>{const seq=Array.from({length:9},(_,i)=>basis[mod(slot+i,24)]),w=Object.fromEntries(KC_Y.map((v,i)=>[i,v]));return children(p,seq,w).map((row,i)=>({...row,slot:mod(slot+i,24)}));};
    // Nine original mahadasas; additional repeats are explicitly an extension.
    for(let i=0;i<24;i++){const slot=mod(startSlot+i,24),lord=basis[slot],end=Math.round(cursor+KC_Y[lord]*unit),p={lord,slot,years:KC_Y[lord],start:cursor,end,visibleStart:Math.max(cursor,birth),originalNine:i<9};p.children=childFn(p,slot);periods.push(p);cursor=end;}
    return {system:'Kalachakra/BPHS46-PVR24',status:'calculated',savya,subgroup,nakshatra:n.index,pada:n.pada,padaSigns,paramayush,padaFraction:fraction,elapsedPadaYears:fraction*paramayush,deha:savya?padaSigns[0]:padaSigns[8],jeeva:savya?padaSigns[8]:padaSigns[0],basis,yearDays:chart.input.yearDays,birth,reference,balanceYears:(periods[0].end-birth)/unit,periods,current:current(periods,birth,reference,p=>childFn(p,p.slot)),gati:periods.slice(1).map((p,i)=>{const a=periods[i].lord,b=p.lord;return {from:a,to:b,type:[[5,3],[4,2],[3,5],[2,4]].some(([x,y])=>x===a&&y===b)?'Manduki':[[4,3],[3,4]].some(([x,y])=>x===a&&y===b)?'Markati':[4,8].includes(mod(b-a))?'Simhavalokana':'regular'};}),sourceAudit:'BPHS46.57–69 assigns Revati to Savya1 and UttaraBhadrapada to Savya2. PVR Tables44–45 omit UttaraBhadrapada and place Revati in Savya2; resolved using the explicit BPHS list, and disclosed rather than guessed.'};
  }
  function narayanaOrder(p,seed,direction){
    const d=direction??(ODD_FOOT.includes(mod(seed+8))?1:-1),sat=p.Saturn.sign===seed,ketu=p.Ketu.sign===seed;
    const effective=sat?1:ketu?-d:d,offsets=sat||seed%3===0?Array.from({length:12},(_,i)=>i):seed%3===1?Array.from({length:12},(_,i)=>mod(i*5)):[0,4,8,9,1,5,6,10,2,3,7,11];
    return {order:offsets.map(x=>mod(seed+effective*x)),direction:effective,baseDirection:d,exception:sat?'Saturn-regular-forward':ketu?'Ketu-reverse':null,bothSaturnKetu:sat&&ketu,priority:'Saturn first, then Ketu; explicit PVR18/19 procedural order'};
  }
  function antardasaSeed(p,sign){const selection=strongerRasi(p,sign,mod(sign+6)),seed=selection.winner;if(seed==null)return {selection,status:'unresolved-tie',order:[]};const colord=coLord(p,seed),lord=colord.winner,positions=lord?[p[lord].sign]:unique((colord.alternatives||[]).map(k=>p[k].sign));if(positions.length!==1)return {selection,colord,status:'unresolved-colord',order:[]};const start=positions[0],base=start%2===0?1:-1,direction=p.Saturn.sign===seed?1:p.Ketu.sign===seed?-base:base;return {selection,colord,seed,start,direction,equivalentPosition:!lord,order:Array.from({length:12},(_,i)=>mod(start+i*direction)),status:'calculated'};}
  function rasiDasha(chart,p,lagna,system='Narayana',sreeLongitude=null){
    const lengths=Array.from({length:12},(_,sign)=>{const selection=coLord(p,sign),alternatives=selection.winner?[]:(selection.alternatives||[]).map(k=>rawLength(p,sign,k)),sameDuration=alternatives.length&&unique(alternatives.map(r=>r.years)).length===1,detail=selection.winner?rawLength(p,sign,selection.winner):sameDuration?{years:alternatives[0].years,equivalentForDuration:true,alternativeDetails:alternatives}:null;return {sign,selection,...detail};});
    if(chart.input.unknownTime||lagna==null)return {system,status:'insufficient-data',lengths,periods:[],current:null};
    let selection,seed,progression,balanceFraction=1;
    if(system==='Sudasa'){seed=Math.floor(norm(sreeLongitude)/30);selection={winner:seed,status:'SreeLagna'};progression={order:[0,3,6,9,1,4,7,10,2,5,8,11].map(x=>mod(seed+(seed%2===0?1:-1)*x)),direction:seed%2===0?1:-1};balanceFraction=1-mod(sreeLongitude,30)/30;}
    else if(system==='Drigdasa'){seed=mod(lagna+8);selection={winner:seed,status:'ninth-house'};progression={order:[8,9,10].flatMap(o=>{const start=mod(lagna+o),direction=ODD_FOOT.includes(start)?1:-1;return Array.from({length:12},(_,i)=>mod(start+i*direction)).filter(s=>s===start||rasiAspect(start,s));})};}
    else {selection=strongerRasi(p,system==='NiryaanaShoola'?mod(lagna+1):lagna,system==='NiryaanaShoola'?mod(lagna+7):mod(lagna+6));seed=selection.winner;
      if(seed!=null){if(system==='Narayana')progression=narayanaOrder(p,seed);else if(system==='LagnaKendradi'){const base=lagna%2===0?1:-1,direction=p.Saturn.sign===seed?1:p.Ketu.sign===seed?-base:base;progression={order:[0,3,6,9,1,4,7,10,2,5,8,11].map(x=>mod(seed+direction*x)),direction};}
      else progression={order:Array.from({length:12},(_,i)=>mod(seed+i*(system==='NiryaanaShoola'&&seed%2? -1:1)))};}}
    if(!progression||lengths.some(r=>r.years==null)&&!['Shoola','NiryaanaShoola'].includes(system))return {system,status:'unresolved-tie',selection,lengths,periods:[],current:null};
    const birth=Date.parse(chart.input.utc),reference=Date.parse(chart.input.reference),unit=chart.input.yearDays*DAY,years=sign=>system==='Shoola'?9:system==='NiryaanaShoola'?[7,8,9][sign%3]:lengths[sign].years;
    const firstYears=years(progression.order[0]);let cursor=Math.round(birth-firstYears*(1-balanceFraction)*unit);const periods=[];
    const secondCycle=!['Drigdasa','Shoola','NiryaanaShoola'].includes(system);
    for(let i=0;i<(secondCycle?24:12);i++){const lord=progression.order[i%12],duration=i>=12?12-years(lord):years(lord);if(duration<0)throw Error('Invalid rasi dasa duration');const end=Math.round(cursor+duration*unit),pRow={lord,years:duration,start:cursor,end,visibleStart:Math.max(birth,cursor),cycle:i<12?1:2,zeroDuration:duration===0};
      let ad=system==='Shoola'?{selection:strongerRasi(p,lord,mod(lord+6))}:antardasaSeed(p,lord);if(system==='Shoola'&&ad.selection.winner!=null)ad={...ad,order:Array.from({length:12},(_,j)=>mod(ad.selection.winner+j)),status:'calculated'};
      pRow.antardasaCalculation=ad;pRow.children=duration&&ad.order?.length?children(pRow,ad.order,Object.fromEntries(ad.order.map(s=>[s,1]))):[];periods.push(pRow);cursor=end;}
    return {system,profile:'PVR-CH'+({Narayana:18,LagnaKendradi:19,Sudasa:20,Drigdasa:21,NiryaanaShoola:22,Shoola:23}[system]),status:periods.some(p=>p.years>0&&!p.children.length)?'partial-antardasa-tie':'calculated',selection,seed,progression,lengths,balanceFraction,yearDays:chart.input.yearDays,birth,reference,balanceYears:(periods[0].end-birth)/unit,periods,current:current(periods,birth,reference),policy:system==='NiryaanaShoola'?'大運原文；副運為PVR明示建議採Narayana法。只輸出傳統時間模型，不能作死亡日期或醫療判定。':'依具名運期公式計算；運期分界不是現實事件保證日期。'};
  }
  function projectedPlanets(chart,v){return Object.fromEntries(K.map(k=>{const p=chart.planets[k],d=v.division,scaled=mod(p.degree*d,30);let degree=d===1?p.degree:scaled;if(d===30){const ends=p.sign%2===0?[5,10,18,25,30]:[5,12,20,25,30],i=ends.findIndex(e=>p.degree<e),start=i?ends[i-1]:0;degree=(p.degree-start)/(ends[i]-start)*30;}return [k,{sign:v.planets[k].sign,degree,longitude:v.planets[k].sign*30+degree}];}));}
  function charaKarakas(chart){
    const ps=chart.planets,roles=['AK','AmK','BK','MK','PiK','PK','GK','DK'],rank=K.filter(k=>k!=='Ketu').map(k=>({planet:k,advancement:advanced(ps,k),degree:ps[k].degree})).sort((a,b)=>b.advancement-a.advancement);
    const rows=rank.map(row=>{const indices=rank.flatMap((q,j)=>Math.abs(q.advancement-row.advancement)<EPS?[j]:[]);return {...row,role:indices.length===1?roles[indices[0]]:null,possibleRoles:indices.map(j=>roles[j]),possibleRanks:indices.map(j=>j+1),tied:indices.length>1};}),ak=rows.filter(r=>r.possibleRoles.includes('AK'));
    return {profile:'eight-karakas-Rahu-reversed-no-Ketu',rank:rows,karakamsa:chart.input.unknownTime||ak.length!==1?null:chart.vargas[9].planets[ak[0].planet].sign,karakamsaCandidates:chart.input.unknownTime?[]:ak.map(r=>({planet:r.planet,sign:chart.vargas[9].planets[r.planet].sign})),note:'七與八Karaka並存；八Karaka增加父親PiK。同度組列出所有角色及Karakamsa候選，不暗用列序裁決。'};
  }
  function specialPoints(chart){
    const sun=chart.planets.Sun.longitude,dh=norm(sun+400/3),vy=norm(-dh),pa=norm(vy+180),ind=norm(-pa),upagrahas={Dhuma:dh,Vyatipaata:vy,Parivesha:pa,Indrachaapa:ind,Upaketu:norm(ind+50/3)};
    const clock=chart.strength?.clock,segment=clock?.segment,previousRise=clock?.previousRise,confirmed=!chart.input.unknownTime,E=root.JYVedic;
    const result={source:PVR,upagrahas:Object.fromEntries(Object.entries(upagrahas).map(([k,x])=>[k,{...E.placement(x),status:confirmed?'calculated':'provisional-midday-anchor'}])),specialLagnas:{},dayNightParts:[],sourceAudit:[{item:'BhavaLagna',chosen:'definition:1degree/4minutes',conflict:'PVR5.2 step(3) and Example7 use 1degree/minute, inconsistent with its introductory definition; BL follows the explicit 4-minute definition.'}]};
    if(confirmed&&chart.lagna){const fraction=chart.planets.Moon.nakshatra.fraction,SL=norm(chart.lagna.longitude+fraction*360);result.specialLagnas.SreeLagna={...E.placement(SL),fraction,rotation:fraction*360,status:'calculated'};}
    if(!confirmed||!previousRise||!segment){result.status='partial';result.missing=['confirmed-birth-clock-and-actual-sunrise/sunset'];return result;}
    const rise=Date.parse(previousRise),elapsedMinutes=(Date.parse(chart.input.utc)-rise)/60000,sunAtRise=E.astronomy(new Date(rise),chart.input.latitude,chart.input.longitude,chart.input.ayanamsa).planets.Sun.sidereal;
    for(const [name,rate] of [['BhavaLagna',0.25],['HoraLagna',0.5],['GhatiLagna',1.25]])result.specialLagnas[name]={...E.placement(sunAtRise+elapsedMinutes*rate),elapsedMinutes,degreesPerMinute:rate,sunAtRise,sunriseUTC:previousRise,status:'calculated'};
    const weekOrder=['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn'],dayIndex=weekOrder.indexOf(clock.dayLord),first=segment.daytime?dayIndex:mod(dayIndex+4,7),eight=weekOrder.concat(null),firstIndex=eight.indexOf(weekOrder[first]),start=Date.parse(segment.start),part=(Date.parse(segment.end)-start)/8;
    result.dayNightParts=Array.from({length:8},(_,i)=>({part:i+1,lord:eight[mod(firstIndex+i,8)],start:iso(start+i*part),endExclusive:iso(start+(i+1)*part)}));
    for(const [name,lord,offset] of [['Kaala','Sun',0.5],['Mrityu','Mars',0.5],['Arthaprahaara','Mercury',0.5],['Yamaghantaka','Jupiter',0.5],['Gulika','Saturn',0.5],['Maandi','Saturn',0]]){const i=result.dayNightParts.findIndex(p=>p.lord===lord),time=start+(i+offset)*part,longitude=E.astronomy(new Date(time),chart.input.latitude,chart.input.longitude,chart.input.ayanamsa).ascendant;result.upagrahas[name]={...E.placement(longitude),ruler:lord,part:i+1,fraction:offset,utc:iso(time),status:'calculated'};}
    result.status='calculated';return result;
  }
  function additionalYogas(chart){
    const p=chart.planets,asc=chart.lagna?.sign??null,E=root.JYVedic,nature=E.naturalNatures(p),good=SEVEN.filter(k=>nature[k]==='benefic'),bad=K.filter(k=>nature[k]==='malefic'),h=k=>p[k].house,lord=h=>asc==null?null:L[mod(asc+h-1)],same=(a,b)=>p[a].sign===p[b].sign,relative=(a,b)=>house(p[a].sign,p[b].sign),kendra=(a,b)=>KENDRA.includes(relative(a,b)),own=k=>OWN[k].includes(p[k].sign),well=k=>own(k)||exalted(p,k),checks=[];
    const strength=k=>chart.strength?.complete?!!chart.strength.planets.find(r=>r.planet===k)?.meetsMinimum:null;
    const B=hs=>hs.every(x=>good.some(k=>h(k)===x)),M=hs=>hs.every(x=>bad.some(k=>h(k)===x)),onlyBenefic=hs=>!K.some(k=>hs.includes(h(k))&&nature[k]!=='benefic'),hasBenefic=hs=>good.some(k=>hs.includes(h(k))),trine=k=>TRINE.includes(h(k)),angle=k=>KENDRA.includes(h(k)),ex=k=>exalted(p,k),deep=k=>DEEP[k]!=null&&Math.abs(E.diff(p[k].longitude,DEEP[k]))<EPS;
    function add(id,condition,planets,rule,extra={}){const row={id,name:id,status:condition===null?'insufficient-data':condition?'structural':'not-established',established:condition,planets:unique(planets.filter(Boolean)),rule,source:PVR,chapter:'11.6',...extra};row.evidence=row.planets.map(k=>({planet:k,sign:p[k].sign,house:h(k),dignity:p[k].dignity,solar:p[k].solar,strength:chart.strength?.planets.find(r=>r.planet===k)?.relativeStrength??null}));checks.push(row);return row;}
    add('GuruMangala',[1,7].includes(relative('Jupiter','Mars')),['Jupiter','Mars'],'Jupiter and Mars same or opposite signs');
    add('Trilochana',new Set(['Sun','Moon','Mars'].map(k=>p[k].sign)).size===3&&['Moon','Mars'].every(k=>[5,9].includes(relative(k,'Sun'))),['Sun','Moon','Mars'],'Sun, Moon and Mars occupy three distinct mutual trines');
    add('Vasumati-Moon',good.every(k=>UPACHAYA.includes(relative(k,'Moon'))),good,'All natural benefics in upachayas from Moon; full-strength and absence of malefics are separate modifiers');
    if(asc==null){for(const id of ['Amala','Parvata','Kaahala','Chaamara','Sankha','Bheri','Mridanga','Sreenaatha','Matsya','Koorma','Khadga','Kusuma','Kalaanidhi','Kalpadruma','Lagnaadhi','Hari','Hara','Brahma','Vishnu','Siva','Gouri','Chandikaa','Lakshmi','Saarada','Bhaarathi','Saraswathi','Amsaavatara','Devendra','Indra','Ravi','Kulavardhana','Vasumati-Lagna','Gandharva','Go','Vidyut','Pushkala','Makuta','Jaya'])add(id,null,[],'Requires confirmed lagna and house lords');}
    else{
      const l1=lord(1),l2=lord(2),l4=lord(4),l5=lord(5),l6=lord(6),l7=lord(7),l9=lord(9),l10=lord(10),l11=lord(11),d9=k=>L[chart.vargas[9].planets[k].sign];
      add('Amala',(hasBenefic([10])&&onlyBenefic([10]))||good.some(k=>relative(k,'Moon')===10)&&!K.some(k=>relative(k,'Moon')===10&&nature[k]!=='benefic'),good,'Only benefic occupant(s) in tenth from lagna or Moon; at least one required');
      add('Parvata',hasBenefic(KENDRA)&&onlyBenefic(KENDRA)&&onlyBenefic([7,8]),good,'Occupied quadrants contain only benefics; seventh/eighth empty or benefic');
      add('Kaahala',any([all([kendra(l4,'Jupiter'),strength(l1)]),well(l4)&&same(l4,l10)]),[l4,l1,l10,'Jupiter'],'Fourth lord and Jupiter mutual quadrants with strong lagna lord, OR fourth lord own/exalted and joined by tenth lord');
      add('Chaamara',any([ex(l1)&&angle(l1)&&grahaAspect(p,'Jupiter',p[l1].sign),[7,9,10].some(x=>good.filter(k=>h(k)===x).length>=2)]),[l1,'Jupiter',...good],'Exalted angular lagna lord aspected by Jupiter OR two benefics together in seventh/ninth/tenth');
      add('Sankha',any([all([strength(l1),kendra(l5,l6)]),all([same(l1,l10),p[l1].sign%3===0,strength(l9)])]),[l1,l5,l6,l9,l10],'Lagna lord strong and fifth/sixth lords mutual quadrants OR first/tenth lords together in movable sign and ninth lord strong');
      add('Bheri',all([strength(l9),any([[1,2,7,12].every(x=>K.some(k=>h(k)===x)),kendra('Jupiter','Venus')&&kendra('Jupiter',l1)&&kendra('Venus',l1)])]),[l9,l1,'Jupiter','Venus'],'Strong ninth lord; occupied first/second/seventh/twelfth OR Jupiter/Venus/lagna lord mutual quadrants');
      add('Mridanga',all([strength(l1),SEVEN.some(k=>well(k)&&(angle(k)||trine(k)))]),[l1,...SEVEN.filter(k=>well(k)&&(angle(k)||trine(k)))],'Own/exalted planet(s) in quadrant/trine and strong lagna lord; occupied witnesses retained');
      add('Sreenaatha',h(l7)===10&&ex(l7)&&same(l10,l9),[l7,l10,l9],'Seventh lord exalted in tenth; ninth/tenth lords together');
      add('Matsya',B([1,9])&&K.some(k=>h(k)===5)&&M([4,8]),K,'Benefics in first/ninth, planet in fifth, malefics fourth/eighth');
      add('Koorma',B([5,6,7])&&good.filter(k=>[5,6,7].includes(h(k))).every(k=>well(k)||p[k].dignity.status==='friend')&&M([1,3,11])&&bad.filter(k=>[1,3,11].includes(h(k))).every(well),K,'Benefics fifth/sixth/seventh own/exalt/friend and malefics first/third/eleventh own/exalt');
      add('Khadga',h(l2)===9&&h(l9)===2&&(angle(l1)||trine(l1)),[l2,l9,l1],'Second lord ninth, ninth lord second, lagna lord quadrant/trine');
      add('Kusuma',asc%3===1&&angle('Venus')&&trine('Moon')&&good.some(k=>k!=='Moon'&&same(k,'Moon'))&&h('Saturn')===10,['Venus','Moon','Saturn'],'Fixed lagna; Venus angular; Moon in trine with benefic; Saturn tenth');
      add('Kalaanidhi',[2,5].includes(h('Jupiter'))&&['Mercury','Venus'].every(k=>same(k,'Jupiter')||grahaAspect(p,k,p.Jupiter.sign)),['Jupiter','Mercury','Venus'],'Jupiter second/fifth and separately joined or aspected by both Mercury and Venus');
      const d=L[p[l1].sign],dd=L[p[d].sign],dn=d9(d),four=unique([l1,d,dd,dn]);
      add('Kalpadruma',four.every(k=>angle(k)||trine(k)||ex(k)),four,'Lagna lord, its dispositor, that dispositor in D1, and its D9 dispositor each angular/trinal/exalted in D1',{chain:[l1,d,dd,dn],navamsaConfirmation:four.map(k=>({planet:k,sign:chart.vargas[9].planets[k].sign,house:chart.vargas[9].planets[k].house}))});
      add('Lagnaadhi',B([7,8])&&onlyBenefic([7,8])&&!bad.some(k=>[mod(asc+6),mod(asc+7)].some(s=>grahaAspect(p,k,s))),good,'Benefics seventh and eighth; no malefic occupation or full planetary aspect there');
      add('Hari',[2,12,8].every(x=>good.some(k=>relative(k,l2)===x)),[l2,...good],'Benefics in second/twelfth/eighth from second lord');
      add('Hara',[4,9,8].every(x=>good.some(k=>relative(k,l7)===x)),[l7,...good],'Benefics fourth/ninth/eighth from seventh lord');
      add('Brahma',any([[4,10,11].every(x=>good.some(k=>relative(k,l1)===x)),kendra('Jupiter',l9)&&kendra('Venus',l11)&&(kendra('Mercury',l1)||kendra('Mercury',l10))]),[l1,l9,l10,l11,...good],'Benefics fourth/tenth/eleventh from lagna lord OR Jupiter/Venus/Mercury angular to ninth/eleventh/first-or-tenth lords');
      add('Vishnu',[l9,l10,d9(l9)].every(k=>h(k)===2),[l9,l10,d9(l9)],'Ninth/tenth lords and ninth-lord D9 dispositor all in D1 second');
      add('Siva',h(l5)===9&&h(l9)===10&&h(l10)===5,[l5,l9,l10],'Fifth lord ninth; ninth lord tenth; tenth lord fifth');
      add('Gouri',h(d9(l10))===10&&ex(d9(l10))&&same(d9(l10),l1),[l1,d9(l10)],'Tenth-lord D9 dispositor exalted in D1 tenth, with lagna lord');
      add('Chandikaa',asc%3===1&&grahaAspect(p,l6,asc)&&same('Sun',d9(l6))&&same('Sun',d9(l9)),['Sun',l6,d9(l6),d9(l9)],'Fixed lagna aspected by sixth lord; Sun with D9 dispositors of sixth/ninth lords');
      add('Lakshmi',all([well(l9),angle(l9),strength(l1)]),[l9,l1],'Ninth lord own/exalted in quadrant; lagna lord strong');
      add('Saarada',all([h(l10)===5,angle('Mercury'),p.Sun.sign===4,strength('Sun'),any([['Mercury','Jupiter'].some(k=>TRINE.includes(relative(k,'Moon')))]),h('Mars')===11]),[l10,'Mercury','Sun','Jupiter','Moon','Mars'],'Tenth lord fifth; Mercury quadrant; strong Sun Leo; Mercury/Jupiter trine from Moon; Mars eleventh');
      add('Bhaarathi',[l2,l5,l11].some(k=>ex(d9(k))&&same(d9(k),l9)),[l2,l5,l11,l9,...[l2,l5,l11].map(d9)],'Exalted D9 dispositor of second/fifth/eleventh lord joins ninth lord');
      add('Saraswathi',['Mercury','Jupiter','Venus'].every(k=>[1,2,4,5,7,9,10].includes(h(k)))&&(well('Jupiter')||p.Jupiter.dignity.status==='friend'),['Mercury','Jupiter','Venus'],'Mercury/Jupiter/Venus each quadrant/trine/second and Jupiter own/exalt/friend');
      add('Amsaavatara',angle('Jupiter')&&angle('Venus')&&angle('Saturn')&&ex('Saturn'),['Jupiter','Venus','Saturn'],'Jupiter, Venus and exalted Saturn in quadrants');
      add('Devendra',asc%3===1&&h(l2)===10&&h(l10)===2&&h(l1)===11&&h(l11)===1,[l2,l10,l1,l11],'Fixed lagna with second/tenth and first/eleventh exchanges');
      add('Indra',h(l5)===11&&h(l11)===5&&h('Moon')===5,[l5,l11,'Moon'],'Fifth/eleventh exchange; Moon fifth');
      add('Ravi',h('Sun')===10&&h(l10)===3&&same(l10,'Saturn'),['Sun',l10,'Saturn'],'Sun tenth; tenth lord third with Saturn');
      add('Kulavardhana',SEVEN.every(k=>h(k)===5||relative(k,'Moon')===5||relative(k,'Sun')===5),SEVEN,'Seven classical planets each in fifth from lagna/Moon/Sun; nodes excluded explicitly');
      add('Vasumati-Lagna',good.every(k=>UPACHAYA.includes(h(k))),good,'All natural benefics in upachayas from lagna',{fullModifiers:{noMalefics:!bad.some(k=>UPACHAYA.includes(h(k))),allBeneficsStrong:all(good.map(strength))}});
      add('Gandharva',all([[3,7,11].includes(h(l10)),same(l1,'Jupiter')||grahaAspect(p,'Jupiter',p[l1].sign),ex('Sun'),strength('Sun'),h('Moon')===9]),[l10,l1,'Jupiter','Sun','Moon'],'Tenth lord trine from seventh; lagna lord joined/aspected Jupiter; strong exalted Sun; Moon ninth');
      add('Go',all([p.Jupiter.dignity.status==='moolatrikona',strength('Jupiter'),same(l2,'Jupiter'),ex(l1)]),['Jupiter',l2,l1],'Strong Jupiter in moolatrikona with second lord; lagna lord exalted');
      add('Vidyut',deep(l11)&&same(l11,'Venus')&&kendra(l11,l1),[l11,'Venus',l1],'Eleventh lord at exact deep exaltation with Venus, angular from lagna lord',{deepExaltationToleranceDegrees:EPS});
      const md=L[p.Moon.sign],greatFriend=chart.relationships.find(r=>r.from===md&&r.to===L[p[md].sign])?.compound===2;
      add('Pushkala',same(l1,'Moon')&&(angle(md)||greatFriend)&&grahaAspect(p,md,asc)&&K.some(k=>h(k)===1),[l1,'Moon',md],'Lagna lord with Moon; Moon dispositor quadrant/great-friend, aspects lagna; lagna occupied');
      add('Makuta',relative('Jupiter',l9)===9&&good.some(k=>relative(k,'Jupiter')===9)&&h('Saturn')===10,['Jupiter',l9,'Saturn',...good],'Jupiter ninth from ninth lord, benefic ninth from Jupiter, Saturn tenth');
      add('Jaya',deep(l10)&&debilitated(p,l6),[l10,l6],'Tenth lord at exact deep exaltation; sixth lord debilitated',{deepExaltationToleranceDegrees:EPS});
    }
    const neechabhanga=SEVEN.map(k=>{const d=p[k].dignity.debilitated,dl=L[p[k].sign],el=L[EX[k]],fromMoon=[dl,el].map(l=>({lord:l,house:relative(l,'Moon'),passed:kendra(l,'Moon')})),fromLagna=[dl,el].map(l=>({lord:l,house:h(l),passed:asc==null?null:angle(l)}));
      const conditions=[{id:'Phala7.26/29',passed:!d?false:any(fromMoon.concat(fromLagna).map(x=>x.passed)),evidence:{fromMoon,fromLagna}},{id:'Phala7.27-mutual-kendra-translation',passed:d&&kendra(dl,el),evidence:{lords:[dl,el],relativeHouse:relative(dl,el)}},{id:'Phala7.28-dispositor-aspect',passed:d&&grahaAspect(p,dl,p[k].sign),evidence:{lord:dl,aspect:grahaAspect(p,dl,p[k].sign),auspiciousHouseModifier:asc==null?null:![6,8,12].includes(h(k))}},{id:'Phala7.30-lagna-kendra',passed:!d?false:asc==null?null:[dl,el].some(angle),evidence:{fromLagna}}];
      return {planet:k,debilitated:d,debilitationLord:dl,exaltationLord:el,conditions,structuralCancellation:any(conditions.map(c=>c.passed)),source:PHALA,sourceAudit:'7.27 mutual-kendra is the siva.sh/Kapoor translation; Sanskrit alternative is preserved as lord-kendra checks in 7.26/29/30. Repeated verses are aliases, not independent votes. 7.28 Sanskrit states dispositor aspect generally; this record only applies it to an actually debilitated planet.',retainedConditions:{debilitation:p[k].dignity,combust:p[k].solar.combust,strength:chart.strength?.planets.find(r=>r.planet===k)||null}};});
    return {profile:'PVR-11.6-additional-and-PHALA7.26–30',checks,matched:checks.filter(r=>r.established),neechabhanga,strengthPolicy:'The word strong is operationalised by the selected complete seven-planet Shadbala minimum, recorded as relativeStrength. This is an explicit engine criterion, not claimed to be the sole classical interpretation.'};
  }
  function compute(chart){
    const points=specialPoints(chart),E=root.JYVedic,natures=E.naturalNatures(chart.planets),vargas={};
    for(const [d,v] of Object.entries(chart.vargas)){const p=projectedPlanets(chart,v),lagna=v.lagna?.sign??null;vargas[d]={division:+d,degreePolicy:+d===30?'linear-degree-within-unequal-D30-segment':'fractional-degree-within-varga-part',arudhas:arudhas(p,lagna),argala:argala(p,lagna,natures),coLords:[7,10].map(s=>({sign:s,dasha:coLord(p,s,'dasha'),arudha:coLord(p,s,'arudha')}))};
      if(+d===1)vargas[d].narayana=rasiDasha(chart,p,lagna);
      else{const seedHouse=mod(+d-1)+1,seedSign=chart.lagna?mod(chart.lagna.sign+seedHouse-1):null,selection=seedSign==null?null:coLord(chart.planets,seedSign,'dasha'),seedPlanet=selection?.winner,seedLagna=seedPlanet?p[seedPlanet].sign:null;
        vargas[d].narayana={...rasiDasha(chart,p,seedLagna),vargaSeed:{seedHouse,seedSign,selection,seedPlanet,seedLagna},policy:'PVR18.5: lord of Dn seed house in D1, then its actual Dn sign as virtual lagna. Dn ascendant is not substituted.'};}}
    const ps=chart.planets,lagna=chart.lagna?.sign??null;
    return {version:VERSION,source:PVR,status:chart.input.unknownTime?'partial-input':'calculated',specialPoints:points,eightKarakas:charaKarakas(chart),vargas,yogas:additionalYogas(chart),dashas:{ashtottari:ashtottari(chart),yogini:yogini(chart),kalachakra:kalachakra(chart),narayana:vargas[1].narayana,lagnaKendradi:rasiDasha(chart,ps,lagna,'LagnaKendradi'),sudasa:rasiDasha(chart,ps,lagna,'Sudasa',points.specialLagnas.SreeLagna?.longitude),drigdasa:rasiDasha(chart,ps,lagna,'Drigdasa'),niryaanaShoola:rasiDasha(chart,ps,lagna,'NiryaanaShoola'),shoola:rasiDasha(chart,ps,lagna,'Shoola'),...conditionalNakshatraDasas(chart)},policy:'Each computed school remains a separate model. Repeated/alias rules do not add votes. The additional dasha reference is the actual requested UTC observation instant; missing birth time withholds timelines, lagna and house claims.'};
  }
  function promptSnapshot(advanced){
    if(!advanced)return {status:'module-unavailable'};
    const dasha=d=>({system:d.system,status:d.status,profile:d.profile,yearDays:d.yearDays,balanceYears:d.balanceYears,applicability:d.applicability,applicabilityAlternative:d.applicabilityAlternative,sourceAudit:d.sourceAudit,seed:d.seed,selection:d.selection,progression:d.progression,paramayush:d.paramayush,deha:d.deha,jeeva:d.jeeva,
      periodTupleColumns:['lord','years','startUTCms','endExclusiveUTCms','cycle','zeroDuration'],periods:d.periods.map(p=>[p.lord,p.years,p.start,p.end,p.cycle??null,p.zeroDuration??false]),current:d.current?{maha:{lord:d.current.maha.lord,start:d.current.maha.start,endExclusive:d.current.maha.end,antardasaCalculation:d.current.maha.antardasaCalculation},antar:d.current.antar,pratyantar:d.current.pratyantar,antardasas:d.current.maha.children}:null});
    return {version:advanced.version,status:advanced.status,specialPoints:advanced.specialPoints,eightKarakas:advanced.eightKarakas,yogas:{profile:advanced.yogas.profile,matched:advanced.yogas.matched,otherChecks:advanced.yogas.checks.filter(r=>!r.established).map(r=>({id:r.id,status:r.status,established:r.established})),neechabhanga:advanced.yogas.neechabhanga,strengthPolicy:advanced.yogas.strengthPolicy},dashas:Object.fromEntries(Object.entries(advanced.dashas).map(([k,d])=>[k,dasha(d)])),
      vargas:Object.fromEntries(Object.entries(advanced.vargas).map(([k,v])=>[k,{division:v.division,arudhas:{bhava:v.arudhas.bhava.map(a=>({house:a.house,name:a.name,sign:a.sign,origin:a.origin,destination:a.destination,steps:a.steps,exception:a.exception,lord:a.lordSelection.winner,status:a.lordSelection.status,decisive:a.lordSelection.decisive})),graha:v.arudhas.graha.map(a=>({planet:a.planet,sign:a.sign,ownedSign:a.ownedSignSelection.winner,status:a.ownedSignSelection.status,decisive:a.ownedSignSelection.decisive}))},coLords:v.coLords,argala:{profile:v.argala.profile,signs:v.argala.signs.map(s=>({sign:s.sign,direction:s.direction,channelTupleColumns:['argalaHouse','obstructionHouse','contributors','blockers','vipareeta','countDecision','quarterCounterpairs'],thirdMalefics:s.thirdMalefics,channels:s.channels.filter(c=>c.contributors.length||c.blockers.length).map(c=>[c.argalaHouse,c.obstructionHouse,c.contributors,c.blockers,c.vipareeta,c.countDecision,c.quarterCounterpairs])})),houses:v.argala.houses,planets:v.argala.planets},narayana:dasha(v.narayana)}])),
      exportPolicy:'Every computed major-period boundary, all currently active antardasas, all16 arudha/Argala/colord results, every Yoga status and all special points are present. All historical/future minor-period intervals and every unsuccessful rule predicate remain in full chart JSON/data(); they are not omitted algorithms.'};
  }
  root.JYVedicCompletion=Object.freeze({version:VERSION,compute,promptSnapshot,rasiAspect,coLord,strongerRasi,rawLength,arudhaSign,arudhas,argala,planetaryDasha,ashtottari,yogini,conditionalNakshatraDasas,kalachakra,narayanaOrder,antardasaSeed,rasiDasha,specialPoints,additionalYogas,charaKarakas,projectedPlanets});
})(typeof globalThis!=='undefined'?globalThis:this);
