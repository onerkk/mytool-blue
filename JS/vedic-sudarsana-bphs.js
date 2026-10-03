/* BPHS English edition 3.11, 28.7–10 and 74.7–28, named D1 profile.
 * Separate from PVR31's twenty-varga clock. Literal loss of nature is not
 * silently converted to opposite polarity; ambiguity has computed variants. */
(function(root){'use strict';
 const VERSION='20261004sudarsana-bphs2',SOURCE='https://vedic-astro.s3.amazonaws.com/books/bhrihat_parasara_hora_shastra.pdf',SAPTA=[1,2,3,7,9,12,30],K=['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn'],ALL=K.concat('Rahu','Ketu'),mod=n=>(n%12+12)%12;
 const POINTS={exalted:60,moolatrikona:45,own:30,'great-friend':22,friend:15,neutral:8,enemy:4,'great-enemy':2,debilitated:0};
 function natural(chart){
  const p=chart.planets,phase=root.JYVedic.norm(p.Moon.longitude-p.Sun.longitude),waxing=phase>0&&phase<180,main={Sun:'malefic',Moon:waxing?'benefic':'malefic',Mars:'malefic',Mercury:'benefic',Jupiter:'benefic',Venus:'benefic',Saturn:'malefic',Rahu:'malefic',Ketu:'malefic'};
  const companions=ALL.filter(k=>k!=='Mercury'&&p[k].sign===p.Mercury.sign),malefics=companions.filter(k=>main[k]==='malefic');if(malefics.length)main.Mercury='malefic';
  const commentary={...main},aspects=root.JYVedic.aspects(p,null).graha;if(!waxing&&(ALL.some(k=>k!=='Moon'&&main[k]==='benefic'&&p[k].sign===p.Moon.sign)||aspects.some(a=>a.toSign===p.Moon.sign&&main[a.from]==='benefic')))commentary.Moon='benefic';
  if(!waxing&&p.Mercury.sign===p.Moon.sign&&!companions.some(k=>k!=='Moon'&&main[k]==='malefic')){commentary.Moon='benefic';commentary.Mercury='benefic';}
  return {profile:'BPHS3.11-literal',phase,waxing,main,mercuryCompanions:companions,mercuryMaleficCompanions:malefics,commentaryVariant:{profile:'Santhanam-addition-after3.11',natures:commentary,policy:'衰月遇吉照／同水星的英譯註補另列，不冒充本節原句。'}};
 }
 function vargaPhala(chart){
  const E=root.JYVedic,relations=chart.relationships||E.relationships(chart.planets),rows=[];
  for(const d of SAPTA){const v=chart.vargas[d];if(!v)continue;const p=root.JYVedicCompletion.projectedPlanets(chart,v);
   for(const k of K){const x=p[k],lord=E.LORDS[x.sign],dignity=E.dignity(k,x.longitude);let category=dignity.status;
    if(!['exalted','moolatrikona','own','debilitated'].includes(category)){const r=relations.find(q=>q.from===k&&q.to===lord);category=r?['great-enemy','enemy','neutral','friend','great-friend'][r.compound+2]:lord===k?'own':null;}
    const base=POINTS[category],factor=d===1?1:0.5,subha=Number.isFinite(base)?base*factor:null,asubha=subha===null?null:(60-base)*factor,nature=['exalted','moolatrikona','own','great-friend','friend'].includes(category)?'benefic':category==='neutral'?'neutral':['enemy','great-enemy','debilitated'].includes(category)?'malefic':'undetermined';
    rows.push({planet:k,division:d,sign:x.sign,degree:x.degree,lord,category,subha,asubha,factor,nature});
   }
  }
  return {profile:'BPHS28.7–10-SAPTA-PHALA',divisions:SAPTA,rows,planets:K.map(k=>{const r=rows.filter(p=>p.planet===k);return {planet:k,good:r.filter(p=>p.nature==='benefic').length,bad:r.filter(p=>p.nature==='malefic').length,neutral:r.filter(p=>p.nature==='neutral').length,unknown:r.filter(p=>p.nature==='undetermined').length,complete:r.length===7&&r.every(p=>p.nature!=='undetermined')};}),policy:'BPHS28九檔Subha：60/45/30/22/15/8/4/2/0；Asubha=60−Subha；非D1二者折半。前五檔吉、第六中性、末三凶。本次D1合成友敵套入七盤；每盤度數由實際分盤段內投影，非單用D1本質強位。交點無七分盤分數。'};
 }
 function adjustNature(nature,p,variant='literal-loss'){
  if(!p?.complete)return {nature:'undetermined',changed:false,reason:'missing-sapta-classification'};
  const loss=nature==='benefic'&&p.bad>p.good||nature==='malefic'&&p.good>p.bad;
  return {nature:loss?(variant==='polarity-reversal'?(nature==='benefic'?'malefic':'benefic'):'neutral'):nature,changed:loss,reason:loss?'opposing-varga-majority':'natural-nature-retained'};
 }
 function resolveInfluence(influences,metric='party-sum'){
  if(!['party-sum','strongest-member'].includes(metric))throw Error('未定義的同數比強取法');
  const good=influences.filter(p=>p.nature==='benefic'),bad=influences.filter(p=>p.nature==='malefic'),unknown=influences.filter(p=>!['benefic','malefic','neutral'].includes(p.nature));
  const base={good:good.map(p=>p.planet),bad:bad.map(p=>p.planet),neutral:influences.filter(p=>p.nature==='neutral').map(p=>p.planet),unknown:unknown.map(p=>p.planet),metric};
  if(unknown.length)return {...base,assessment:'undetermined',reason:'unknown-nature'};
  if(good.length!==bad.length)return {...base,assessment:good.length>bad.length?'favorable':'adverse',reason:'majority-count'};
  if(!good.length)return {...base,assessment:'neutral',reason:'no-polarity-influence'};
  if(good.concat(bad).some(p=>!Number.isFinite(p.strength)))return {...base,assessment:'undetermined',reason:'equal-count-missing-raw-bala'};
  const agg=xs=>metric==='party-sum'?xs.reduce((n,p)=>n+p.strength,0):Math.max(...xs.map(p=>p.strength)),goodStrength=agg(good),badStrength=agg(bad),delta=goodStrength-badStrength;
  return {...base,goodStrength,badStrength,assessment:Math.abs(delta)<1e-8?'mixed':delta>0?'favorable':'adverse',reason:Math.abs(delta)<1e-8?'equal-count-equal-strength':'equal-count-raw-bala'};
 }
 function entryContext(chart){
  if(chart.input?.unknownTime||!chart.lagna)return {status:'insufficient-data',missing:['confirmed-birth-time'],utc:chart.input?.utc};
  const n=natural(chart),phala=vargaPhala(chart),strength=root.JYVedicStrength.compute(chart,{school:'bphs'}),states=Object.fromEntries(ALL.map(k=>{const row=phala.planets.find(p=>p.planet===k);return [k,{natural:n.main[k],commentary:K.includes(k)?adjustNature(n.commentaryVariant.natures[k],row):{nature:n.commentaryVariant.natures[k],changed:false,reason:'node-has-no-sapta-phala'},literal:K.includes(k)?adjustNature(n.main[k],row):{nature:n.main[k],changed:false,reason:'node-has-no-sapta-phala'},polarity:K.includes(k)?adjustNature(n.main[k],row,'polarity-reversal'):{nature:n.main[k],changed:false,reason:'node-has-no-sapta-phala'}}];}));
  return {status:'calculated',utc:chart.input.utc||chart.utc,positions:Object.fromEntries(ALL.map(k=>[k,{sign:chart.planets[k].sign,longitude:chart.planets[k].longitude,degree:chart.planets[k].degree}])),lagna:chart.lagna,natural:n,phala,strength,states};
 }
 function wheel(natal,context,referenceSign,reference='Lagna'){
  const houses=[];if(context.status!=='calculated'||referenceSign==null)return {status:'insufficient-data',reference,referenceSign,houses};
  const E=root.JYVedic,p=context.positions,aspects=E.aspects(p,referenceSign).graha,bala=Object.fromEntries((context.strength?.planets||[]).map(z=>[z.planet,z.totalVirupas]));
  for(let h=1;h<=12;h++){
   const sign=mod(referenceSign+h-1),lord=E.LORDS[sign],occupants=ALL.filter(k=>p[k].sign===sign),aspectors=[...new Set(aspects.filter(a=>a.toSign===sign).map(a=>a.from))],lordSupport=p[lord].sign===sign||aspectors.includes(lord),mode=occupants.length?'occupants':aspectors.length?'aspects':'lord',active=mode==='occupants'?occupants:mode==='aspects'?aspectors:[lord];
   function factors(variant,ownOverride=true){return active.map(k=>{let nature=context.states[k][variant==='polarity-reversal'?'polarity':variant==='commentary'?'commentary':'literal'].nature;const own=ownOverride&&lordSupport&&k===lord;if(own)nature='benefic';const sunException=h===1&&k==='Sun',exaltedException=nature==='malefic'&&E.dignity(k,p[k].longitude).exaltedSign;if(sunException)nature='benefic';else if(exaltedException)nature='neutral';return {planet:k,nature,strength:bala[k]??null,ownLordException:own,sunException,exaltedException};});}
   const mainFactors=factors('literal-loss'),commentaryFactors=factors('commentary'),polarityFactors=factors('polarity-reversal'),commentaryResolution=resolveInfluence(commentaryFactors),resolution=resolveInfluence(mainFactors),polarityVariant=resolveInfluence(factors('polarity-reversal')),naturalOnlyVariant=resolveInfluence(factors('literal-loss',false)),strongestVariant=resolveInfluence(mainFactors,'strongest-member');
   const placementsFor=key=>occupants.map(k=>{const nature=context.states[k][key].nature,rule=nature==='benefic'?[6,12].includes(h)?'adverse':'favorable':nature==='malefic'?[3,6,11].includes(h)?'favorable':'adverse':'undetermined',soleNode=occupants.length===1&&['Rahu','Ketu'].includes(k),bav=natal.ashtakavarga?.bav?.[k]?.[p[k].sign]??null,avAssessment=bav===null?'unavailable':bav>4?'favorable':bav<4?'adverse':'mixed',assessment=soleNode?'adverse':rule;return {planet:k,nature,house:h,sign:p[k].sign,assessment,generalAssessment:rule,soleNode,natalBav:bav,avAssessment,avAgreement:bav===null?'unavailable':avAssessment==='mixed'?'mixed':avAssessment===assessment?'convergent':'divergent'};});
   const placements=placementsFor('literal');
   houses.push({house:h,sign,lord,occupants,aspectors,mode,lordSupport,lordNatureOverride:lordSupport&&active.includes(lord),factors:mainFactors,...resolution,variants:{polarityReversal:{...polarityVariant,factors:polarityFactors,periodPlacements:placementsFor('polarity')},naturalOnly:naturalOnlyVariant,strongestMember:strongestVariant,commentary:{...commentaryResolution,factors:commentaryFactors,periodPlacements:placementsFor('commentary')}},periodPlacements:placements,natalSav:natal.ashtakavarga?.sav?.[sign]??null});
  }
  return {status:'calculated',reference,referenceSign,houses};
 }
 function readings(natal,context,signs,references=['Lagna','Moon','Sun']){return Object.fromEntries(references.map(k=>[k,wheel(natal,context,signs[k],k)]));}
 function compute(natal,sc,tajaka=natal.tajaka){
  if(sc?.status!=='calculated'||natal.input.unknownTime||!natal.lagna)return {version:VERSION,status:'insufficient-data',missing:['calculated-confirmed-time-sudarsana'],entries:{}};
  const d=sc.vargas[1],refs=d.bphsApplicability.references,entries={},input=[['natal',natal,d.anchors,null],['annual',tajaka.annual,d.current.annual.signs,d.current.annual.window],['monthly',tajaka.currentMonth?.chart,d.current.monthly?.signs,d.current.monthly?.window],['sixtyHour',tajaka.currentSixtyHour?.chart,d.current.sixtyHour?.signs,d.current.sixtyHour?.window]];
  for(const [kind,chart,signs,window]of input)if(chart&&signs){const context=entryContext(chart);entries[kind]={kind,window,signs,context,readings:readings(natal,context,signs,refs)};}
  return {version:VERSION,status:'calculated',profile:'BPHS74-D1-LITERAL-LOSS-WITH-VARIANTS',source:SOURCE,references:refs,entries,nominalClockAudit:{profile:'BPHS74-LITERAL-DURATION-CONSISTENCY',assumptions:{nominalMonthDays:30,ghatikaMinutes:24},literal:{pratyantarDays:2,vidasaGhatikas:12},arithmetic:{twelvePratyantarDays:24,unallocatedDaysIn30DayMonth:6,twelveVidasaHours:57.6,pratyantarHours:48,vidasaExcessHours:9.6},status:'literal-tiers-do-not-partition-each-other',policy:'實算所讀英譯的兩層長度：12×2日不填滿30日，12×12ghatika亦大於2日；這是原文時計歧義，不能把數字偷偷改為2.5日或把PVR真實太陽角度時計改名成BPHS固定日數。'},policy:{scope:'BPHS74的D1三輪／同座只讀上升政策。PVR31的20分盤三參照另保留完整，不冒稱BPHS本文也明定20盤輪法。',nature:'BPHS3.11主文自然性；BPHS28七盤前五吉、第六中、末三凶；BPHS74較多對方分盤令本性喪失取中性，改極性另算變體。',strength:'每次真實ENTRY獨立重算具名BPHS六力原始Virupa；等數主取兩方總量，最強單星變體另算；不用Raman門檻百分比相加。交點缺原始力時保留未定。',priority:'占宮優先、無占宮看相位、兩者皆無看宮主；本宮主占照作局部吉助例外，不全局改自然性。',period:'期間通則與本宮判斷分列；獨羅計害宮例外保留。',ashtakavarga:'本命D1BAV/SAV核对；>4/4/<4數值來自PVR25.5，不杜撰成BPHS74數值門檻。',clock:'沿既有PVR實際太陽回歸、30°月及2.5°段時鐘；BPHS兩日／12ghatika名義分段未強造相同曆法。'},sourceAudit:[{issue:'BPHS74本性喪失是否逆轉極性',selected:'literal-loss中性',alternative:'polarity-reversal整輪實算'},{issue:'等數較強未指定逐星最大或兩方和',selected:'party-sum原始Virupa',alternative:'strongest-member整輪實算'},{issue:'本宮主吉助與自然凶照兩句的優先',selected:'本宮主占照局部優先',alternative:'natural-only整輪另算'},{issue:'名義兩日及12ghatika與PVR真實太陽度時鐘不能混同',selected:'PVR時計另具名',alternative:'未選名義曆法不冒稱已完成'}],limits:['未選BPHS名義日細分曆法、其他全部歷史Dasha/Yoga仍不是本模組已完成範圍。']};
 }
 function toText(b,format=x=>JSON.stringify(x)){
  if(!b||b.status!=='calculated')return format(b||{status:'module-unavailable'});
  const pc={Sun:'日',Moon:'月',Mars:'火',Mercury:'水',Jupiter:'木',Venus:'金',Saturn:'土',Rahu:'羅',Ketu:'計'},abbr=k=>pc[k]||k,code={favorable:'C',adverse:'N',neutral:'U',mixed:'M',undetermined:'E',unavailable:'?'},nc={benefic:'b',malefic:'m',neutral:'u',undetermined:'?'},out=['BPHS三輪實算：'+b.profile+'；參照='+b.references.join(','),'判斷碼C支持/N受阻/U中性/M同強混合/E未定；自然性b吉/m凶/u中性/?未定。數字為Virupa，不是比例或事件概率。','七盤順序D1/2/3/7/9/12/30；每列曜:座,度,座主,類別,Subha,Asubha,倍率,吉凶；非D1折半。'];
  for(const [kind,e]of Object.entries(b.entries)){const c=e.context;out.push('層='+kind+' UTC='+c.utc+' 窗='+format(e.window)+' 參照座='+format(e.signs));out.push('自然性與註補='+format(c.natural));out.push('七盤Phala='+K.map(k=>abbr(k)+':'+c.phala.rows.filter(z=>z.planet===k).map(z=>[z.sign,Number(z.degree.toFixed(4)),abbr(z.lord),z.category,z.subha,z.asubha,z.factor,nc[z.nature]].join(',')).join('/')).join(';'));out.push('吉凶中數及本性='+format(c.phala.planets)+';'+format(c.states));out.push('BPHS六力(曜/總/位置方向時間動力自然照射)='+c.strength.planets.map(p=>abbr(p.planet)+'/'+(p.totalVirupas===null?'?':Number(p.totalVirupas.toFixed(4)))+'/'+['sthana','dig','kala','cheshta','naisargika','drik'].map(k=>p[k].virupas===null?'?':Number(p[k].virupas.toFixed(4))).join(',')).join(';')+'；完整='+c.strength.complete);
   out.push('註補期間作用(參照/宮/曜/性質/主判/期間判/BAV)='+Object.entries(e.readings).map(([r,w])=>r+':'+w.houses.map(h=>h.house+'/'+h.variants.commentary.factors.map(p=>abbr(p.planet)+nc[p.nature]).join(',')+'/'+code[h.variants.commentary.assessment]+'/'+h.variants.commentary.periodPlacements.map(p=>abbr(p.planet)+code[p.assessment]+','+(p.natalBav??'?')).join(':')).join(';')).join('\n'));
   out.push('各參照宮：宮/座/主/占曜/照曜/作用優先/主占照/主例外/主判/逆轉判/无主例外判/最強判/註補判/吉凶中未定曜/吉凶力/各占曜期間判與BAV核對/SAV');
   for(const [ref,r]of Object.entries(e.readings))out.push(ref+'='+r.houses.map(h=>[h.house,h.sign,abbr(h.lord),h.occupants.map(abbr).join(''),h.aspectors.map(abbr).join(''),h.mode,+h.lordSupport,+h.lordNatureOverride,code[h.assessment],code[h.variants.polarityReversal.assessment],code[h.variants.naturalOnly.assessment],code[h.variants.strongestMember.assessment],code[h.variants.commentary.assessment],[h.good,h.bad,h.neutral,h.unknown].map(xs=>xs.map(abbr).join('')).join(','),[h.goodStrength,h.badStrength].map(x=>x===undefined?'?':Number(x.toFixed(4))).join(','),h.periodPlacements.map(p=>abbr(p.planet)+':'+code[p.assessment]+','+code[p.generalAssessment]+','+(+p.soleNode)+','+(p.natalBav??'?')+','+code[p.avAssessment]+','+p.avAgreement).join(':'),h.natalSav??'?'].join('/')).join(';'));
  }
  out.push('名義時計算術核對='+format(b.nominalClockAudit));
  out.push('政策='+format(b.policy),'原典歧異='+format(b.sourceAudit),'未完成範圍='+format(b.limits));return out.join('\n');
 }
 root.JYVedicSudarsanaBPHS=Object.freeze({version:VERSION,compute,natural,vargaPhala,adjustNature,entryContext,resolveInfluence,wheel,readings,toText,points:POINTS});
})(typeof window==='undefined'?globalThis:window);
