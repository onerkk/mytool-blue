/* PVR ch.17: alternative applicability rules are separate models.
 * A calculated timeline is not proof that a conditional dasha applies.
 * Yoga structure, strength and PRIMARY timing remain separate dimensions. */
(function(root){'use strict';
  const VERSION='20261004vedic-applicability14';
  const SOURCE='https://www.vedicastrologer.org/articles/vedic_astro_textbook.pdf';
  const A=x=>Array.isArray(x)?x:[],clone=x=>x==null?null:JSON.parse(JSON.stringify(x));
  const finite=Number.isFinite;
  const GENERAL=new Set(['yogini','kalachakra','narayana','lagnaKendradi','sudasa','drigdasa','niryaanaShoola','shoola']);
  function currentLords(d){
    return [...new Set(['maha','antar','pratyantar'].map(k=>d?.current?.[k]?.lord).filter(x=>typeof x==='string'))];
  }
  function applicability(d,key){
    if(!d)return {status:'not-computed',profiles:[]};
    if(/insufficient|unavailable|unresolved/.test(d.status||''))return {status:'ineligible',profiles:[],reason:d.status};
    const test=(id,value)=>({id,value:value===true?true:value===false?false:null,
      status:value===true?'eligible':value===false?'ineligible':'unknown'});
    const v=d.applicability,profiles=[];
    if(v&&typeof v==='object'){
      // PVR17.2.3 offers three DIFFERENT views, not an AND/OR vote.
      for(const [id,value] of Object.entries(v))if(typeof value==='boolean'||value==null)profiles.push(test(id,value));
    }else if(typeof v==='boolean'||v==='applicable'||v==='not-applicable')profiles.push(test('default',v===true||v==='applicable'));
    else if(v===null)profiles.push(test('default',null));
    if(d.applicabilityAlternative!==undefined)profiles.push(test('alternative',d.applicabilityAlternative));
    if(profiles.length)return {status:profiles.length===1?profiles[0].status:'profile-dependent',profiles,
      reason:'每一具名適用條件獨立保留；不同版本不互相覆蓋。'};
    return {status:GENERAL.has(key)?'comparison-only':'computed-condition-unknown',profiles:[],
      reason:GENERAL.has(key)?'已計算的獨立運法；按該運法框架另讀，不改寫Vimshottari主判。':'引擎未提供適用條件，不能拿計算成功代替條件成立。'};
  }
  function strengthMap(c){
    const out={};
    for(const p of A(c.strength?.planets)){
      if(p.complete===false||p.kala?.complete===false)continue;
      const ratio=finite(p.relativeStrength)?p.relativeStrength:
        finite(p.totalVirupas)&&finite(p.minimumVirupas)&&p.minimumVirupas>0?p.totalVirupas/p.minimumVirupas:null;
      // Virupa/Rupa totals cannot be compared with the dimensionless minimum ratio 1.
      if(finite(ratio)&&ratio>=0)out[p.planet]=ratio;
    }
    return out;
  }
  function yogaActivation(c,systems){
    const sm=strengthMap(c),primary=new Set(currentLords(c.dasha));
    const rows=[...A(c.yogas).map(y=>({y,layer:'primary'})),
      ...A(c.advanced?.yogas?.checks||c.advanced?.yogas?.matched).map(y=>({y,layer:'additional'}))];
    return rows.map(({y,layer},index)=>{
      const planets=[...new Set(A(y.planets))],ratios=planets.map(planet=>({planet,ratio:sm[planet]??null}));
      const structural=y.established===false||y.status==='not-established'?false:
        y.established===true||y.status==='structural'?true:null;
      const timingLords=planets.filter(p=>primary.has(p)),known=ratios.filter(p=>finite(p.ratio));
      const weak=known.some(p=>p.ratio<1),complete=ratios.length>0&&known.length===ratios.length;
      const supportingTiming=[];
      for(const [key,sys] of Object.entries(systems)){
        if(key==='vimshottari')continue;
        for(const profile of sys.profiles.filter(p=>p.status==='eligible')){
          const lords=sys.currentLords.filter(p=>planets.includes(p));
          if(lords.length)supportingTiming.push({system:key,profile:profile.id,lords,
            scope:'獨立條件運模型，不能使主運未啟動的Yoga變成主運已啟動。'});
        }
      }
      const status=structural===false?'not-established':structural===null?'undetermined':
        weak?'weakened':timingLords.length?'timing-supported':'structural-only';
      return {id:y.id||y.name||'yoga-'+index,name:y.name||y.id,ruleLayer:layer,status,
        structural,planets,strengthValues:known.map(p=>p.ratio),strengthByPlanet:ratios,
        strengthComplete:complete,primaryTiming:timingLords.length>0,timingLords,
        supportingTiming,source:y.source||c.advanced?.yogas?.profile||SOURCE,
        policy:'結構、完整六力比例、主運觸及與獨立條件運旁證分列；同源同名規則不重複計票，運主觸及不是現實事件保證。'};
    });
  }
  function compute(c){
    if(!c||!c.dasha)return {version:VERSION,status:'insufficient-data',missing:['Vimshottari'],source:SOURCE};
    const systems={vimshottari:{system:'Vimshottari',status:c.dasha.current?'primary-general':'no-current-period',
      currentLords:currentLords(c.dasha),profiles:[],reason:'本引擎主運時間模型；當前區間不存在時不造運主。'}};
    for(const [key,d] of Object.entries(c.advanced?.dashas||{}))systems[key]={system:d.system||key,
      ...applicability(d,key),applicability:clone(d.applicability),applicabilityAlternative:clone(d.applicabilityAlternative),
      currentLords:currentLords(d),sourceAudit:clone(d.sourceAudit)};
    const eligible=Object.entries(systems).filter(([key,s])=>key!=='vimshottari'&&s.status==='eligible').map(([key])=>key);
    const unknown=Object.entries(systems).filter(([,s])=>s.status==='computed-condition-unknown'||s.status==='unknown').map(([key])=>key);
    const profileDependent=Object.entries(systems).filter(([,s])=>s.status==='profile-dependent').map(([key])=>key);
    const j=c.advanced?{eightKarakas:clone(c.advanced.eightKarakas),d1Arudha:clone(c.advanced.vargas?.['1']?.arudhas),
      d1Argala:clone(c.advanced.vargas?.['1']?.argala),narayana:clone(c.advanced.dashas?.narayana),
      policy:'Jaimini的Chara Karaka/Arudha/Argala/Narayana只在同一框架合讀，不拿Parashari Yoga票數加總。'}:null;
    return {version:VERSION,status:c.input?.unknownTime?'insufficient-data':'calculated',missing:c.input?.unknownTime?['confirmed-birth-time']:[],
      dashaSelection:{primary:'vimshottari',eligibleSupporting:eligible,conditionUnknown:unknown,profileDependent,systems,
        policy:'條件不成立或未知者不提供有效旁證；有多個版本者保留具名條件，不擅選版本。'},
      yogaActivation:yogaActivation(c,systems),jaimini:j,source:SOURCE,
      limits:['只對本引擎已實算運法及格局做路由與條件核對，未宣稱列盡印度占星各地方傳承。']};
  }
  root.JYVedicApplicability=Object.freeze({version:VERSION,compute,source:SOURCE});
})(typeof window==='undefined'?globalThis:window);
