/* R13 紫微流派配置層：依 iztro 官方公開配置模型分離四化/亮度/年界/晚子/安星算法。
 * 不把未公開河洛/欽天師承口訣冒充官方算法。 */
(function(root){'use strict';
 const VERSION='20261004ziwei-school13',SOURCE='https://docs.iztro.com/zh_TW/posts/config-n-plugin';
 const OPT={yearDivide:['normal','exact'],horoscopeDivide:['normal','exact'],ageDivide:['normal','birthday'],dayDivide:['forward','current'],algorithm:['default','zhongzhou']};
 const D={yearDivide:'normal',horoscopeDivide:'normal',ageDivide:'normal',dayDivide:'forward',algorithm:'default'};
 const A=x=>Array.isArray(x)?x:[],clone=x=>x==null?null:JSON.parse(JSON.stringify(x));
 function normalized(c,options={}){const cp=c?.calculationPolicy||{},src=options.ziweiConfig||cp.ziweiConfig||{};const out={};for(const k of Object.keys(OPT)){const v=src[k]??cp[k]??D[k];out[k]=OPT[k].includes(v)?v:D[k];}out.sihuaProfile=options.sihuaProfile||cp.sihuaProfile||c?.northern?.profile?.id||'IZTRO_261';return out;}
 function tableDiff(){const ps=root.JYZiweiCompletion?.profiles||{},ids=Object.keys(ps);const rows=[];for(let i=0;i<ids.length;i++)for(let j=i+1;j<ids.length;j++){const a=ps[ids[i]].table,b=ps[ids[j]].table;for(const g of Object.keys(a||{}))for(const h of ['祿','權','科','忌'])if(a[g]?.[h]!==b[g]?.[h])rows.push({profileA:ids[i],profileB:ids[j],stem:g,transform:h,a:a[g]?.[h],b:b[g]?.[h]});}return rows;}
 function compute(c,options={}){if(!c||!A(c.palaces).length)return {version:VERSION,status:'insufficient-data',missing:['十二宮'],source:SOURCE};const config=normalized(c,options),warnings=[];
  if(config.algorithm==='zhongzhou'&&!c.calculationPolicy?.algorithmApplied&&!c.calculationPolicy?.ziweiAlgorithm)warnings.push('要求中州派安星，但目前主盤未明示由中州派安星算法重排；不得只改解讀標籤。');
  const known=root.JYZiweiCompletion?.profiles||{},active=known[config.sihuaProfile]?{id:config.sihuaProfile,name:known[config.sihuaProfile].name,source:known[config.sihuaProfile].source}:config.sihuaProfile==='CUSTOM'?{id:'CUSTOM',name:'使用者自訂完整四化表'}:{id:config.sihuaProfile,status:'unknown-profile'};
  return {version:VERSION,status:warnings.length?'calculated-with-policy-warning':'calculated',config,activeFourTransformationProfile:active,profileDifferences:tableDiff(),officialOptions:{...OPT,defaults:D},chartBoundaryFacts:{birthInput:clone(c.birthInput),birthLunar:clone(c.birthLunar),referenceLunarYear:c.calculationPolicy?.referenceLunarYear||null},warnings,source:SOURCE,policy:'流派配置先決。不同四化表或安星算法各自成盤/成圖，不以多數決混算；中州派只有實際使用中州安星算法才可標為中州盤。',unavailable:['iztro 官方文件沒有公開「所有河洛/欽天師承」統一規則；無可靠公開公式者不偽造。']};}
 root.JYZiweiSchoolCompletion=Object.freeze({version:VERSION,compute,normalized,source:SOURCE});
})(typeof window==='undefined'?globalThis:window);
