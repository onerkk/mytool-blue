/* Preserve the actual horary rule IDs, profiles and censored time windows. */
(function(root){'use strict';
  const VERSION='20261004western-tradition14';
  const SOURCES={voc:'https://www.skyscript.co.uk/voc.html',perfection:'https://www.skyscript.co.uk/tobyn3.html',swiss:'https://www.astro.com/swisseph/swephprg.htm'};
  const A=x=>Array.isArray(x)?x:[],clone=x=>x==null?null:JSON.parse(JSON.stringify(x));
  function compute(c){
    if(!c?.horary||c.horary.status!=='calculated')return {version:VERSION,
      status:c?.input?.chartPurpose==='horary'?'insufficient-horary':'not-horary',sources:SOURCES};
    const h=c.horary,profiles=A(h.moon?.wholeSignCycle?.profiles).map(p=>clone(p));
    const denial=A(h.denialChecks?.rows).flatMap(r=>A(r.checks).map(x=>({pair:clone(r.pair),angle:r.angle,
      orientation:clone(r.orientation),perfection:clone(r.perfection),window:clone(r.window),
      type:x.id||x.type,status:x.status,matched:x.matched??null,profile:x.profile||null,
      conditions:clone(x.conditions),evidence:clone(x.evidence),
      remaining:clone(x.qualitativeRemaining||x.remaining||x.unavailable||[])})));
    const known=profiles.length>0&&profiles.every(x=>typeof x.void==='boolean');
    const consensus=!profiles.length?'unavailable':!known?'undetermined':
      profiles.every(x=>x.void===profiles[0].void)?profiles[0].void:'definition-dependent';
    const light=h.lightChecks?clone(h.lightChecks):{status:'module-not-loaded'};
    const missing=[];
    if(!profiles.length)missing.push('月亮全座VOC條件模型');
    if(h.denialChecks?.status!=='calculated')missing.push('受阻規則元件');
    if(light.status!=='calculated')missing.push('傳光／集光規則元件');
    return {version:VERSION,status:missing.length?'insufficient-horary':'calculated',missing,
      voidOfCourse:{profiles,consensus,policy:'不同定義及未知結果分開；全部未知不當作一致已確認。'},
      perfection:{denialChecks:denial,denialStatus:h.denialChecks?.status||'module-not-loaded',
        denialUnavailable:clone(h.denialChecks?.unavailable||[]),lightChecks:light,
        policy:'每組入相的具名形式、條件、質性缺項與有限時窗完整保留；規則重疊不加票。'},
      astronomyAudit:{inputUTC:c.input.utc,latitude:c.input.latitude,longitude:c.input.longitude,
        houseSystem:c.policy?.houseSystem,source:SOURCES.swiss,
        note:'本站採Astronomy Engine；Swiss官方規格是參考文獻，不冒稱每張盤已通過Swiss獨立數值驗證。'},sources:SOURCES};
  }
  root.JYWesternTraditionProfile=Object.freeze({version:VERSION,compute,sources:SOURCES});
})(typeof window==='undefined'?globalThis:window);
