/* R13 子平古法裁決：把既有可計算事實提升為「有來源、有限域」的質性裁決。
 * 只裁決已編碼規則，不把清濁/制化擴張成全古籍唯一結論。 */
(function(root){'use strict';
 const VERSION='20261004bazi-adjudication14';
 const SOURCES={renyuan:'https://zh.wikisource.org/zh-hant/三命通會/卷二#論人元司事',ditiansui:'https://zh.wikisource.org/zh-hant/滴天髓',ziping:'https://www.donglishuzhai.net/chapter/3719.html'};
 const A=x=>Array.isArray(x)?x:[],clone=x=>x==null?null:JSON.parse(JSON.stringify(x));
 function compute(c){
  if(!c||!c.pillars||!c.classicalAssessment||!c.functionalAssessment)return {version:VERSION,status:'insufficient-data',missing:['classicalAssessment','functionalAssessment'],sources:SOURCES};
  const fa=c.functionalAssessment,ca=c.classicalAssessment,selected=ca.selected||null;
  const controls=[];
  A(fa.orderedMechanisms).filter(r=>r.applicable===true).forEach(r=>A(r.pairs).forEach(p=>{
   const rooted=A(p.rooted);const order=p.sequence;let status='conditional';
   if(rooted.length===2&&rooted.every(Boolean)&&order==='source-rescue-order'&&!A(p.combinationConstraints).some(x=>['blocked-by-controller','nearer-rival-preempts'].includes(x.status)))status='rooted-ordered-candidate';
   else if(rooted.length===2&&rooted.every(v=>!v))status='not-effective';
   controls.push({rule:r.id,pattern:r.pattern,mechanism:r.mechanism,risk:r.risk,order,rooted,combinationConstraints:clone(p.combinationConstraints),status,scope:'僅裁決此《子平真詮》具名位置例的結構作用，不直接等於整格吉凶或富貴。'});
  }));
  A(fa.combinations).forEach(x=>{if(x.status==='structural-combination'||x.status==='day-self-combination')controls.push({rule:'stem-combination-'+x.stems,mechanism:'天干五合',status:x.transformationCertified?'transformation-certified':x.removalCertified?'removal-certified':'combination-only',evidence:clone(x),scope:'未同時通過成化/合去條件時，只承認有合，不把被合之神從全局刪除。'});});
  const quality=[];
  A(fa.pureMixed).filter(x=>x.match).forEach(x=>quality.push({rule:x.id,classification:x.classification,status:x.classification==='pure'?'clear-structural':'turbid-structural',mechanism:x.mechanism,evidence:clone(x),source:SOURCES.ziping}));
  A(fa.orderedMechanisms).filter(x=>x.applicable&&A(x.pairs).length).forEach(x=>A(x.pairs).forEach(p=>quality.push({rule:x.id,classification:p.sequence==='source-rescue-order'?'clear-structural':p.sequence==='reverse-order-needs-context'?'turbid-risk':'mixed',status:p.sequence==='source-rescue-order'?'clear-structural':p.sequence==='reverse-order-needs-context'?'turbid-risk':'mixed',mechanism:p.sequence==='source-rescue-order'?x.mechanism:x.risk,evidence:clone(p),source:SOURCES.ziping})));
  // 《滴天髓》明言清濁不限財官印綬，故沒有明確命中具名條件時不得硬判全局清或濁。
  const qualityStatus=quality.some(x=>x.status==='turbid-structural'||x.status==='turbid-risk')?'profile-turbid':quality.some(x=>x.status==='clear-structural')?'profile-clear':'unresolved-global';
  const specials=A(c.specialRuleAssessment?.rules),est=specials.filter(x=>x.status==='established'||x.status==='structural'),unresolved=specials.filter(x=>x.status==='unresolved');
  const hua=A(c.huaQiAssessments),huaEstablished=hua.filter(x=>['ESTABLISHED','established','certified'].includes(x.statusCode||x.status)),huaUnresolved=hua.filter(x=>['UNRESOLVED','unresolved'].includes(x.statusCode||x.status));
  const structureDecision={status:est.length===1&&!unresolved.length?'single-structural-candidate':est.length>1?'multiple-structural-candidates':est.length===0?'ordinary-pattern-default':'unresolved',established:clone(est),unresolved:clone(unresolved),huaEstablished:clone(huaEstablished),huaUnresolved:clone(huaUnresolved),policy:'特殊格與化氣僅在原模組的充分條件通過時升格；未通過不以五行百分比補成。'};
  return {version:VERSION,status:'calculated',seasonalCommander:clone(c.renyuan),selectedPattern:selected?{name:selected.name||selected.pattern||ca.monthSelection?.selectedPattern,status:selected.status||selected.assessment||'selected-pattern-with-conditions',formation:clone(selected.formation),failure:clone(selected.failure),taboo:clone(selected.taboo),rescue:clone(selected.rescue),checks:clone(selected.checks||selected.conditions||[])}:{name:ca.monthSelection?.selectedPattern||null,status:'selection-only'},effectiveControl:controls,classicalQuality:{status:qualityStatus,profile:'ZIPING_EXPLICIT_PURITY_ORDER + DITIANSUI_GLOBAL_CAUTION',checks:quality,globalVerdict:qualityStatus==='unresolved-global'?'未有足夠具名條件裁決全局清濁；不得用「元素單一/數量少」替代清濁。':qualityStatus,source:SOURCES.ditiansui},specialStructureDecision:structureDecision,sources:SOURCES,limits:['此模組完成的是已編碼《子平真詮》位置/純雜例與《滴天髓》可觀測前提；沒有明文可操作門檻的「精神、氣勢、理勢源流」仍保留質性判讀。','清濁不得由財官印數量或五行百分比直接推出。']};
 }
 function forReading(x,options={}){return x&&options.selectedAlreadyListed?{...x,selectedPattern:x.selectedPattern?{name:x.selectedPattern.name,status:x.selectedPattern.status,reference:'同份提示詞的classicalAssessment.selected／八格成敗救應已列出完整formation、failure、taboo與rescue，不重貼相同證據。'}:null}:x;}
 function toText(x,options){return x?JSON.stringify(forReading(x,options)):'未計算';}
 root.JYBaziAdjudication=Object.freeze({version:VERSION,compute,toText,forReading,sources:SOURCES});
})(typeof window==='undefined'?globalThis:window);
