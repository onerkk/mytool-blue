/* iztro options are applied by computeZiwei, including the local boundary rules.
 * Applied chart policy is authoritative; read-time options cannot relabel a chart. */
(function(root){'use strict';
  const VERSION='20261004ziwei-school15',SOURCE='https://docs.iztro.com/zh_TW/posts/config-n-plugin';
  const OPT={yearDivide:['normal','exact'],horoscopeDivide:['normal','exact'],ageDivide:['normal','birthday'],dayDivide:['forward','current'],algorithm:['default','zhongzhou']};
  const D={yearDivide:'normal',horoscopeDivide:'normal',ageDivide:'normal',dayDivide:'forward',algorithm:'default'};
  const A=x=>Array.isArray(x)?x:[],clone=x=>x==null?null:JSON.parse(JSON.stringify(x));
  function normalized(c){
    const cp=c?.calculationPolicy||{},src=cp.ziweiConfig||{},out={};
    for(const k of Object.keys(OPT))out[k]=src[k]??cp[k]??null;
    out.sihuaProfile=cp.sihuaProfile||c?.northern?.profile?.id||null;
    return out;
  }
  function tableDiff(){
    const ps=root.JYZiweiCompletion?.profiles||{},ids=Object.keys(ps),rows=[];
    for(let i=0;i<ids.length;i++)for(let j=i+1;j<ids.length;j++){
      const a=ps[ids[i]].table,b=ps[ids[j]].table;
      for(const g of Object.keys(a||{}))for(const h of ['祿','權','科','忌'])if(a[g]?.[h]!==b[g]?.[h])
        rows.push({profileA:ids[i],profileB:ids[j],stem:g,transform:h,a:a[g]?.[h],b:b[g]?.[h]});
    }
    return rows;
  }
  function compute(c,options={}){
    if(!c||A(c.palaces).length!==12)return {version:VERSION,status:'insufficient-data',missing:['十二宮'],source:SOURCE};
    const config=normalized(c),requested={...options.ziweiConfig},warnings=[],mismatches=[],missing=[];
    for(const k of Object.keys(OPT))if(options[k]!==undefined)requested[k]=options[k];
    if(options.sihuaProfile!==undefined)requested.sihuaProfile=options.sihuaProfile;
    for(const [key,value] of Object.entries(requested)){
      if(!(key in config))continue;
      if(value!==config[key]){
        mismatches.push({key,requested:value,applied:config[key]});
        warnings.push('要求'+key+'='+value+'，本盤實際'+key+'='+config[key]+'；須由排盤引擎重排，不能只改解讀標籤。');
      }
    }
    for(const [key,choices] of Object.entries(OPT)){
      if(config[key]===null)missing.push('本盤'+key+'計算政策');
      else if(!choices.includes(config[key]))warnings.push('本盤'+key+'不是已知官方配置，保留原值待核對。');
    }
    const known=root.JYZiweiCompletion?.profiles||{},p=known[config.sihuaProfile];
    const active=p?{id:config.sihuaProfile,name:p.name,source:p.source}:config.sihuaProfile==='CUSTOM'?
      {id:'CUSTOM',name:'使用者自訂完整四化表'}:{id:config.sihuaProfile,status:'unknown-profile'};
    if(active.status==='unknown-profile')missing.push('本盤具名四化表來源');
    return {version:VERSION,status:missing.length?'insufficient-data':warnings.length?'calculated-with-policy-warning':'calculated',
      config,requestedConfig:requested,policyMismatches:mismatches,missing,activeFourTransformationProfile:active,
      profileDifferences:tableDiff(),officialOptions:{...OPT,defaults:D},
      localSupportedOptions:clone(OPT),
      chartBoundaryFacts:{birthInput:clone(c.birthInput),birthLunar:clone(c.birthLunar),referenceLunarYear:c.calculationPolicy?.referenceLunarYear??null},
      warnings,source:SOURCE,policy:'本盤已套用政策與上游官方能力分開；解讀時的要求不會改變星曜位置或已算四化。',
      boundaryRules:{year:c.calculationPolicy.yearBoundary,flowYear:c.calculationPolicy.flowStarYearBoundary,month:c.calculationPolicy.monthGzBoundary,age:c.calculationPolicy.ageMethod,birthday:c.calculationPolicy.birthdayBoundary,void:c.calculationPolicy.voidMethod},
      unavailable:['沒有可靠公開公式的河洛／欽天師承細則不偽造。']};
  }
  function forReading(value,options={}){if(!value||!options.policyAlreadyListed)return value;return {...value,chartBoundaryFacts:{reference:'本方前文 birthInput、birthLunar 與 calculationPolicy 保留完整原始出生及參考日期；此處不重貼相同資料。'}};}
  root.JYZiweiSchoolCompletion=Object.freeze({version:VERSION,compute,normalized,forReading,source:SOURCE});
})(typeof window==='undefined'?globalThis:window);
