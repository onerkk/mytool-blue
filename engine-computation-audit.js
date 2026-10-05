/* Independent arithmetic and structural invariants on the actual engine output.
 * A valid record is not a claim that all schools or predictions are complete.
 * Invalid records stop export; unknown inputs and unfinished procedures stay partial. */
(function(root){'use strict';
 const VERSION='20261005audit3',G=Array.from('甲乙丙丁戊己庚辛壬癸'),B=Array.from('子丑寅卯辰巳午未申酉戌亥'),K=['year','month','day','hour'],A=x=>Array.isArray(x)?x:[],mod=(v,n)=>(v%n+n)%n;
 const H={子:'癸',丑:'己癸辛',寅:'甲丙戊',卯:'乙',辰:'戊乙癸',巳:'丙戊庚',午:'丁己',未:'己丁乙',申:'庚壬戊',酉:'辛',戌:'戊辛丁',亥:'壬甲'};
 const PV=['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn','Rahu','Ketu'],PW=['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto'];
 const methods=['bazi','ziwei','astro','vedic','liuren','liuyao','yijing','meihua','name','compat','personality','tarot','lenormand','ootk','oracle'];
 function inspect(kind,c,a,options={}){
  if(!methods.includes(kind))throw Error('沒有此計算查核接口');
  const checks=[],missing=[],check=(id,ok,evidence)=>checks.push({id,passed:!!ok,evidence}),partial=(id,reason)=>missing.push({id,reason});
  const eq=(x,y)=>JSON.stringify(x)===JSON.stringify(y),sameSet=(x,y)=>x.length===y.length&&new Set(x).size===x.length&&x.every(v=>y.includes(v)),degree=v=>Number.isFinite(v)&&v>=0&&v<360;
  function planets(p,keys,prefix){check(prefix+'-planet-set',keys.every(k=>p&&p[k]),keys);for(const k of keys){const z=p?.[k];if(!z)continue;check(prefix+'-'+k+'-longitude',degree(z.longitude),z.longitude);if(z.sign!==undefined)check(prefix+'-'+k+'-sign',z.sign===Math.floor(z.longitude/30),[z.sign,z.longitude]);if(z.degree!==undefined)check(prefix+'-'+k+'-degree',Number.isFinite(z.degree)&&Math.abs(z.degree-mod(z.longitude,30))<1e-6,[z.degree,z.longitude]);}}
  function six(){const values=A(c.values),positions=A(c.lines).map(l=>l.position);check('six-values',values.length===6&&values.every(v=>[6,7,8,9].includes(v)),values);check('six-line-positions',sameSet(positions,[1,2,3,4,5,6]),positions);if(values.length!==6)return;const old=values.map(v=>v%2),changed=values.map(v=>v===6?1:v===9?0:v%2),moving=values.flatMap((v,i)=>v===6||v===9?[i+1]:[]);check('original-lines',eq(A(c.original?.lines).map(Number),old),old);check('changed-lines',eq(A(c.changed?.lines).map(Number),changed),changed);check('moving-positions',eq(A(c.movingPositions),moving),moving);for(const [side,bits]of [['original',old],['changed',changed]])check(side+'-binary-code',c[side]?.code===bits.reduce((n,v,i)=>n+v*2**i,0),c[side]?.code);}
  if(kind==='bazi'){
   const unknown=!!(options.unknown||c.birthTimeUnknown),keys=unknown?K.slice(0,3):K;
   for(const k of keys){const p=c.pillars?.[k];check(k+'-ganzhi',G.includes(p?.gan)&&B.includes(p?.zhi),p&&p.gan+p.zhi);}
   check('day-master-consistency',c.dm===c.pillars?.day?.gan,c.dm);
   check('native-pillar-count',a.pillars?.length===keys.length,a.pillars?.length);
   for(const p of A(a.pillars))check(p.pillar+'-hidden-stems',eq(A(p.hidden).map(h=>h.stem),Array.from(H[p.zhi]||'')),p.zhi);
   if(unknown)partial('birth-hour','出生時辰未知；只有三柱可確認，完整旺衰與交運不作定盤');
   else {if(!c.classicalAssessment)partial('classical','成敗救應元件未計算');if(!c.functionalAssessment)partial('functional','根氣與位置作用元件未計算');if(!c.seasonalAssessment)partial('seasonal','調候作用元件未計算');
    for(const y of A(a.annualSegments))check('annual-window-'+y.year+'-'+y.decadeIndex,Number.isFinite(Date.parse(y.window?.start))&&Date.parse(y.window?.endExclusive)>Date.parse(y.window?.start),y.window);
   }
  }else if(kind==='ziwei'){
   if(a.coverage?.provisional){check('no-provisional-palaces',a.coverage.palaces===0,a.coverage.palaces);partial('birth-hour','出生時辰未知，十二宮與運限尚未定盤');}
   else {check('twelve-unique-palaces',sameSet(A(c.palaces).map(p=>p.branch),B),A(c.palaces).map(p=>p.branch));const major=A(c.palaces).flatMap(p=>A(p.stars).filter(s=>s.type==='major').map(s=>s.name));check('fourteen-major-stars',major.length===14&&new Set(major).size===14,major);check('forty-eight-flights',A(c.calculatedFacts?.palaceFlights).length===48,A(c.calculatedFacts?.palaceFlights).length);check('twelve-months',A(a.layers?.months).length===12,A(a.layers?.months).length);}
  }else if(kind==='astro'){
   planets(c.planets,PW,'western');check('opposite-nodes',degree(c.planets?.Rahu?.longitude??c.planets?.NorthNode?.longitude)&&Math.abs(mod((c.planets?.Ketu?.longitude??c.planets?.SouthNode?.longitude)-(c.planets?.Rahu?.longitude??c.planets?.NorthNode?.longitude),360)-180)<1e-6,null);
   if(c.houses){const cusps=A(c.houses.cusps);check('twelve-cusps',cusps.length===12&&cusps.every(degree),cusps);for(const [k,p]of Object.entries(c.planets)){check('house-'+k,Number.isInteger(p.house)&&p.house>=1&&p.house<=12,p.house);if(cusps.length===12&&cusps.every(degree)){const house=cusps.findIndex((z,i)=>mod(p.longitude-z,360)<mod(cusps[(i+1)%12]-z,360))+1;check('cusp-placement-'+k,p.house===house,[p.house,house]);}}}
   else partial('houses','出生時刻未知或所選宮制在此地點無可用解；只讀星位');
  }else if(kind==='vedic'){
   planets(c.planets,PV,'vedic');check('opposite-nodes',Math.abs(mod(c.planets.Ketu.longitude-c.planets.Rahu.longitude,360)-180)<1e-6,null);
   const divisions=Object.keys(c.vargas||{}).map(Number);check('twenty-selected-vargas',sameSet(divisions,[1,2,3,4,5,6,7,8,9,10,11,12,16,20,24,27,30,40,45,60]),divisions);
   for(const [d,v]of Object.entries(c.vargas||{})){check('D'+d+'-nine-signs',PV.every(k=>Number.isInteger(v.planets?.[k]?.sign)&&v.planets[k].sign>=0&&v.planets[k].sign<12),d);}
   if(c.input?.unknownTime){check('unknown-no-houses',!c.lagna&&A(c.houses).length===0,null);partial('birth-hour','出生時刻未知，分盤上升、六力與確定運期不可定盤');}
   else {check('twelve-houses',A(c.houses).length===12,A(c.houses).length);if(c.lagna)for(const k of PV)check('vedic-house-'+k,c.planets[k].house===mod(c.planets[k].sign-c.lagna.sign,12)+1,c.planets[k].house);if(c.strength){check('seven-shadbala-planets',A(c.strength.planets).length===7,c.strength.planets.length);for(const p of c.strength.planets){const parts=['sthana','dig','kala','cheshta','naisargika','drik'].map(k=>p[k]?.virupas);if(parts.every(Number.isFinite))check('shadbala-sum-'+p.planet,Number.isFinite(p.totalVirupas)&&Math.abs(parts.reduce((n,z)=>n+z,0)-p.totalVirupas)<1e-5,p.totalVirupas);else partial('strength-'+p.planet,'天文或力度所需資料未齊，不能用零補值');}}
    if(c.sudarsana?.status==='calculated')check('twenty-sudarsana-vargas',Object.keys(c.sudarsana.vargas).length===20,Object.keys(c.sudarsana.vargas).length);
    const special=c.advanced?.specialPoints;
    if(special?.status==='calculated'){
      const rates={BhavaDefinition:.25,BhavaPrintedProcedure:1,Hora:.5,Ghati:1.25};
      for(const [k,rate]of Object.entries(rates)){
        const p=special.specialLagnaVariants?.[k];
        check('special-lagna-'+k,!!p&&degree(p.longitude)&&Math.abs(p.longitude-mod(p.sunAtRise+p.elapsedMinutes*rate,360))<1e-7,p&&[p.longitude,p.sunAtRise,p.elapsedMinutes,rate]);
      }
      for(const [model,v]of Object.entries(special.upagrahaVariants||{}))for(const [k,p]of Object.entries(v.points||{})){
        const part=special.dayNightParts?.[p.part-1],offset=model==='PVR_PART_BEGINNING_FOOTNOTE'||k==='Maandi'?0:.5;
        check('upagraha-clock-'+model+'-'+k,!!part&&Math.abs(Date.parse(p.utc)-Date.parse(part.start)-(Date.parse(part.endExclusive)-Date.parse(part.start))*offset)<2&&p.fraction===offset,[p.utc,p.part,p.fraction]);
        check('upagraha-position-'+model+'-'+k,degree(p.longitude)&&p.sign===Math.floor(p.longitude/30),[p.longitude,p.sign]);
      }
      check('special-point-varga-coverage',Object.keys(special.specialPointVargas?.specialLagnas||{}).length===20,Object.keys(special.specialPointVargas?.specialLagnas||{}).length);
    }
   }
  }else if(kind==='liuren'){
   check('twelve-earth-positions',sameSet(A(c.plate).map(p=>p.earth),B),null);check('twelve-sky-positions',sameSet(A(c.plate).map(p=>p.sky),B),null);check('twelve-generals',new Set(A(c.plate).map(p=>p.generalIndex)).size===12,null);check('four-courses',A(c.courses).length===4,c.courses?.length);check('three-transmissions',A(c.transmissions).length===3,c.transmissions?.length);
   for(const p of A(c.plate))check('rotation-'+p.earth,mod(B.indexOf(p.sky)-B.indexOf(p.earth),12)===mod(c.rotation,12),[p.earth,p.sky,c.rotation]);
   if(!c.classAnalysis)partial('classes','六十四課族元件未計算');if(!c.shensha)partial('shensha','所選神煞元件未計算');
  }else if(kind==='liuyao'||kind==='yijing')six();
  else if(kind==='meihua'){
   check('moving-line-range',Number.isInteger(c.dong)&&c.dong>=1&&c.dong<=6,c.dong);check('two-trigram-lines',A(c.up?.li).length===3&&A(c.lo?.li).length===3&&c.up.li.concat(c.lo.li).every(v=>v===0||v===1),null);
   if(c.dong>=1&&c.dong<=6){const body=c.dong<=3?c.up:c.lo,use=c.dong<=3?c.lo:c.up;check('unchanged-body',c.tiG?.n===body?.n,[c.tiG?.n,body?.n]);check('moving-use',c.yoG?.n===use?.n,[c.yoG?.n,use?.n]);}
   if(!c.castContext?.timestamp)partial('cast-time','沒有實際起卦瞬間，不能確認時令');
  }else if(kind==='name'){
   const names=A(c.names).length?c.names:[c];for(const p of names){const chars=Array.from(p.name||''),facts=A(p.characters);check(p.name+'-character-order',eq(facts.map(f=>f.char),chars),facts.map(f=>f.char));const count=Array.from(p.surname||'').length,s=facts.slice(0,count).map(f=>f.stroke),g=facts.slice(count).map(f=>f.stroke);if(!count||!g.length){check('explicit-name-split',false,p.name);continue;}
    if(!s.concat(g).every(n=>Number.isInteger(n)&&n>0)){partial('strokes-'+p.name,'尚有未覆核筆畫，不能完成五格與三才');continue;}const sum=v=>v.reduce((n,z)=>n+z,0),total=sum(s)+sum(g),expected={'天格':sum(s)+(s.length===1?1:0),'人格':s.at(-1)+g[0],'地格':sum(g)+(g.length===1?1:0),'外格':total-s.at(-1)-g[0]+(s.length===1?1:0)+(g.length===1?1:0),'總格':total};
    const rows=A(p.fiveGrids?.grids);check(p.name+'-five-grid-roles',sameSet(rows.map(r=>r.role),Object.keys(expected)),rows.map(r=>r.role));for(const r of rows)check(p.name+'-'+r.role,r.num===expected[r.role],[r.num,expected[r.role]]);
   }
  }else if(kind==='compat'){
   if(c.dayMasters){check('two-independent-persons',!!c.personA&&!!c.personB,null);for(const k of ['personA','personB']){const p=c[k];check(k+'-pillar-count',A(p?.pillars).length===(p?.unknownTime?3:4),p?.pillars?.length);if(p?.unknownTime)partial(k+'-hour','此方只有三柱，完整合盤条件不能定盤');}}
   else {if(!c.personA||!c.personB)partial('pair-hours','至少一方出生時辰未定，部分疊宮與飛化不可計算');check('no-combined-person',!c.dayMasters,null);}
  }else if(kind==='personality'){
   if(c.provisional)partial('birth-hour','三柱參考不構成確定的五軸類型');else {check('five-unique-axes',A(c.axes).length===5&&new Set(c.axes.map(p=>p.key)).size===5,null);check('binary-type-index',Number.isInteger(c.index)&&c.index>=0&&c.index<32,c.index);check('axis-type-index',c.index===A(c.axes).reduce((n,p,i)=>n+(p.rightSelected?2**(4-i):0),0),c.index);}
  }else if(kind==='tarot'){
   const d=c.tarotData||c,rows=A(d.cards);check('unique-real-card-ids',rows.length>0&&new Set(rows.map(p=>p.id)).size===rows.length&&rows.every(p=>Number.isInteger(p.id)&&p.id>=0&&p.id<=77),null);if(d.methodPlan?.slots)check('spread-card-count',rows.length===d.methodPlan.slots.length,[rows.length,d.methodPlan.slots.length]);if(d.sourceProfile==='rws_reversals'||d.readingMode==='rws_reversals')for(const [i,p]of rows.entries())if(typeof p.isUp!=='boolean')partial('orientation-'+i,'此牌未記錄正逆位，不套入逆位判讀');
  }else if(kind==='lenormand'){
   const d=c.lenormandData||c,rows=A(d.cards||d.drawn),counts={two:2,three:3,five:5,seven:7,choice:7,nine:9,grand:36,grand_nines:36},s=d.spreadType||d.spread;check('known-layout',s==='branches'||Number.isInteger(counts[s]),s);check('layout-count',s==='branches'?rows.length>0&&rows.length%3===0:rows.length===counts[s],[s,rows.length]);
  }else if(kind==='ootk'){
   const d=a.methodData,valid=A(d.completed);check('known-operation-keys',A(d.operations).every(p=>/^op[1-5]$/.test(p.operation)),A(d.operations).map(p=>p.operation));if(valid.length!==5)partial('operations','本次已完成 '+valid.length+'／5 輪；未做或放棄的輪次不補造');
   if(d.integrity){check('ootk-reading-data-consistent',!d.integrity.errors.length,d.integrity.errors);d.integrity.missing.forEach((reason,i)=>partial('ootk-reading-field-'+i,reason));}
  }else if(kind==='oracle'){
   check('source-edition-matched',a.coverage.editionMatched===true,a.coverage.editionMatched);check('twenty-nine-categories',A(a.methodData.categories).length===29,A(a.methodData.categories).length);
  }
  return {schema:'jy.computation-audit/1',version:VERSION,method:kind,status:checks.some(c=>!c.passed)?'invalid':missing.length?'partial':'verified',checks,missing,scope:'核對本次實算的算術、結構與輸入範圍；不是所有歷史門派、全句質性或事件準確率的完整性宣稱'};
 }
 function summary(r){return {status:r.status,passedChecks:r.checks.filter(p=>p.passed).length,totalChecks:r.checks.length,missing:r.missing,scope:r.scope};}
 function ensure(kind,c,a,options){const r=inspect(kind,c,a,options);if(r.status==='invalid'){const e=new Error('排盤資料查核失敗：'+r.checks.filter(p=>!p.passed).map(p=>p.id).join('、'));e.code='CHART_COMPUTATION_INVALID';e.audit=r;throw e;}return r;}
 root.JYEngineComputationAudit=Object.freeze({version:VERSION,methods,inspect,ensure,summary});
})(typeof window==='undefined'?globalThis:window);
