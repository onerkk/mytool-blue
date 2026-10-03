/* 紫微：具名十干四化版本、完整48宮干飛化定向圖，以及楚天雲闊2018兩則明列轉象條件。
 * 數、宮、星、化是實際結構；未把短文案例冒稱全部河洛門派秘訣。 */
(function(root){'use strict';
 const G=Array.from('甲乙丙丁戊己庚辛壬癸'),Z=Array.from('子丑寅卯辰巳午未申酉戌亥'),H=['祿','權','科','忌'],keys=['lu','quan','ke','ji'];
 const rows=[['廉貞','破軍','武曲','太陽'],['天機','天梁','紫微','太陰'],['天同','天機','文昌','廉貞'],['太陰','天同','天機','巨門'],['貪狼','太陰','右弼','天機'],['武曲','貪狼','天梁','文曲'],['太陽','武曲','太陰','天同'],['巨門','太陽','文曲','文昌'],['天梁','紫微','左輔','武曲'],['破軍','巨門','太陰','貪狼']];
 const stars=['紫微','天機','太陽','武曲','天同','廉貞','天府','太陰','貪狼','巨門','天相','天梁','七殺','破軍','左輔','右弼','文昌','文曲'];
 const SOURCE='https://fengshui-magazine.com.hk/No.251-May18/A208.htm',table=r=>Object.fromEntries(G.map((g,i)=>[g,Object.fromEntries(H.map((h,j)=>[h,r[i][j]]))]));
 const profiles={IZTRO_261:{name:'iztro2.6.1／現代壬科左輔表',source:'https://iztro.com/zh_TW/learn/mutagen',table:table(rows)},QUANSHU_XINGGE:{name:'星格所引全書卷二表（壬科天府）',source:'https://xingge.tw/zh-hant/learn/c4-birth-year',table:table(rows.map((r,i)=>i===8?[r[0],r[1],'天府',r[3]]:r))}};
 function resolve(input){const id=input.sihuaProfile||'IZTRO_261';if(id==='CUSTOM'){const r=input.sihuaCustom,label=String(input.sihuaCustomLabel||'').trim(),source=String(input.sihuaCustomSource||'').trim();if(!label||!source||!r||!G.every(g=>r[g]&&H.every(h=>stars.includes(r[g][h]))&&new Set(H.map(h=>r[g][h])).size===4))throw Error('自訂四化須提供具名來源及完整十干祿權科忌表，每干四星不得重複');return {id,name:label,source,table:JSON.parse(JSON.stringify(r)),sourceStatus:'user-supplied-not-independently-verified'};}if(!profiles[id])throw Error('未支援的紫微四化版本');return {id,...profiles[id],sourceStatus:'identified-published-table'};}
 function graph(c,mapping=c.palaces,transformations=c.sihua){
  const chosen=resolve(c.birthInput||c.calculationPolicy||{}),pByBranch=Object.fromEntries(mapping.map(p=>[p.branch,p])),natal=Object.fromEntries(c.palaces.map(p=>[p.branch,p])),find=s=>c.palaces.find(p=>p.stars.some(x=>x.name===s));
  const nodes=mapping.map(p=>({palace:p.name,branch:p.branch,gan:natal[p.branch].gan,natalPalace:natal[p.branch].name})),node=b=>nodes.find(p=>p.branch===b);
  const flights=nodes.flatMap(p=>H.map(h=>{const s=chosen.table[p.gan][h],to=find(s);if(!to)throw Error('四化星未安入十二宮：'+s);return {from:p.palace,fromBranch:p.branch,gan:p.gan,kind:h,star:s,to:pByBranch[to.branch].name,toBranch:to.branch,self:to.branch===p.branch,centripetal:((Z.indexOf(to.branch)-Z.indexOf(p.branch)+12)%12)===6};}));
  const paths=flights.map(f=>{const steps=[],seen=new Set();let edge=f;while(edge&&!seen.has(edge.fromBranch)){seen.add(edge.fromBranch);steps.push(flights.indexOf(edge));edge=flights.find(e=>e.fromBranch===edge.toBranch&&e.kind===f.kind);}return {origin:f.from,originBranch:f.fromBranch,kind:f.kind,steps,stepReference:'flights[] indices',termination:edge?'cycle':'unplaced',cycleAt:edge?edge.fromBranch:null,policy:'同類四化連續有向路徑；不是未經證明的事件因果'};});
  const pairs=[['祿','忌',4,1],['權','科',2,3]].map(([a,b,x,y])=>({group:a+b,numbers:[x,y],sum:x+y,placements:[a,b].map(h=>{const t=transformations.find(t=>String(t.hua||t.type||'').replace('化','')===h);return t?{kind:h,star:t.star,palace:t.palace||null,branch:t.palaceBranch||find(t.star)?.branch}:null;})}));
  const transitions=[];
  for(const f of flights.filter(f=>f.centripetal)){
   const overlap=c.sihua.filter(t=>(t.palaceBranch||find(t.star)?.branch)===f.toBranch);
   for(const t of overlap){const natalH=String(t.hua||t.type||'').replace('化','');if(!H.includes(natalH))continue;
    const opposing=flights.find(e=>e.fromBranch===f.fromBranch&&e.kind===natalH);
    transitions.push({rule:'向心遇生年轉同類象',incoming:f,birthTransformation:t,transferred:opposing,source:SOURCE,sourceSection:'四D–E向心忌遇生年權則轉權',applicability:'source-general-rule',layerScope:mapping===c.palaces?'natal':'natal-rules-with-period-palace-overlay'});
    if(f.kind==='祿'&&natalH==='祿'){const ji=c.sihua.find(t=>String(t.hua||t.type||'').replace('化','')==='忌'),place=ji&&find(ji.star),second=place&&flights.find(e=>e.fromBranch===place.branch&&e.kind==='忌');if(second)transitions.push({rule:'祿又祿則忌又忌',incoming:f,birthLu:t,birthJi:ji,transferred:second,source:SOURCE,sourceSection:'五A–B向心祿遇生年祿、聯動生年忌宮再飛忌',layerScope:mapping===c.palaces?'natal':'natal-rules-with-period-palace-overlay'});}
   }
  }
  return {version:'20261003ziwei-completion1',profile:chosen.id,palaceStemBasis:'原局宮干；運層只重標宮職，運層四化另記，不冒稱已用運干重配12宮干',tableSource:chosen.source,starPlacements:stars.map(s=>{const p=find(s);return {star:s,branch:p?.branch||null,palace:p?pByBranch[p.branch].name:null};}),flights,paths,opposingAxes:nodes.filter(p=>Z.indexOf(p.branch)<6).map(p=>({first:p,second:node(Z[(Z.indexOf(p.branch)+6)%12])})),symbolPairs:pairs,transitions,sourceAudit:{source:SOURCE,sourceTransformingStars:15,selectedTransformingStars:new Set(Object.values(chosen.table).flatMap(r=>Object.values(r))).size,sourceProfileCompatible:chosen.table['壬']['科']==='左輔',textualVariant:{section:'二C／四C、四E、五B',detail:'本文二C稱貪狼權在財帛，後文明列卯福德；驗算採後文具名位置，保留原文歧異。'},difference:chosen.table['壬']['科']==='天府'?'作者本文不化天府；所選全書引表化天府，兩份政策不能冒稱一致':null,scope:'作者文中明列的18星、祿忌／權科分組、向心遇生年轉同類與祿又祿忌又忌。定向圖為可核對數學資料，其他門派未公布的轉象口訣不據此造規則。'}};
 }
 root.JYZiweiCompletion=Object.freeze({version:'20261003ziwei-completion1',resolve,graph,profiles});
})(typeof window==='undefined'?globalThis:window);
