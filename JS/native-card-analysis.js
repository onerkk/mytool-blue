(function(root){
  'use strict';
  const arr=x=>Array.isArray(x)?x:[],copy=x=>x==null?null:JSON.parse(JSON.stringify(x));
  function tarot(raw){
    const d=raw.tarotData||raw,cards=arr(d.cards),rws=d.sourceProfile==='rws_reversals'||d.readingMode==='rws_reversals';
    if(!cards.length||new Set(cards.map(c=>c.id)).size!==cards.length||cards.some(c=>!Number.isInteger(c.id)||c.id<0||c.id>77))throw Error('塔羅發牌紀錄缺漏、重複或牌號無效。');
    const register=arr(typeof TAROT==='undefined'?root.TAROT:TAROT);
    const records=cards.map((c,i)=>{const p=register.find(x=>x.id===c.id),slot=arr(d.methodPlan?.slots)[i]||{};if(rws&&!p)throw Error('RWS牌義表沒有此牌。');return {index:i+1,id:c.id,name:c.name||c.n,position:c.position||c.pos||slot.label||'位置'+(i+1),direction:rws?(c.isUp===true?'正位':c.isUp===false?'逆位':'方向未記錄'):'Book T，不套RWS逆位',keywords:rws&&typeof c.isUp==='boolean'?String(c.isUp?p.kwUp:p.kwRv).split('·'):[],binding:copy(c.binding||c.slotBinding||slot.binding),suit:c.suit||p?.suit,rank:c.rank||p?.rank,number:p?.num};});
    const groups={},ranks={};for(const r of records){const k=r.binding?.eventId||'QUERY_EVENT';(groups[k]||(groups[k]=[])).push(r.index);if(r.suit!=='major')(ranks[r.rank]||(ranks[r.rank]=[])).push(r.index);}
    return {records,eventGroups:Object.entries(groups).map(([eventId,positions])=>({eventId,positions})),rankEchoes:Object.entries(ranks).filter(([,p])=>p.length>1).map(([rank,positions])=>({rank,positions})),majorPositions:records.filter(r=>r.suit==='major').map(r=>r.index),courtPositions:records.filter(r=>['page','knight','queen','king'].includes(r.rank)).map(r=>r.index),methodData:copy(d.methodData),drawProcedure:copy(d.drawProcedure),policy:'逐張實際牌位、方向與議題綁定；關鍵詞不是成功率或他人心意的證明。'};
  }
  function lenormand(raw){
    const d=raw.lenormandData||raw,cards=arr(d.cards||d.drawn),ids=cards.map(c=>c.id??c.n);
    if(!cards.length||new Set(ids).size!==cards.length||ids.some(x=>!Number.isInteger(x)||x<1||x>36))throw Error('雷諾曼牌面缺漏、重複或牌號無效。');
    if(d.expectedCount!=null&&d.expectedCount!==cards.length)throw Error('實際牌數與牌陣不一致。');
    const records=cards.map((c,i)=>({index:i+1,id:ids[i],name:c.name||c.zh||c.n,position:copy(c.position||c.pos),meaning:copy(c.meaning||c.keywords||c.kw||c.k),guard:c.guard||null}));
    const spread=d.spreadType||d.spread,paths=[],mirror=[],knights=[],neighbors=[];
    const layoutCounts={two:2,three:3,five:5,seven:7,choice:7,nine:9,grand:36,grand_nines:36};
    if(spread!=='branches'&&(!Object.hasOwn(layoutCounts,spread)||cards.length!==layoutCounts[spread]))throw Error('實際牌數與具名雷諾曼牌陣不一致。');
    if(['two','three','five','seven'].includes(spread)){paths.push(records.map(r=>r.index));for(let i=0;i<Math.floor(records.length/2);i++)mirror.push({a:i+1,b:records.length-i,axis:'line'});}
    else if(spread==='choice')paths.push([1,2,3],[5,6,7]);
    else if(spread==='branches'){if(records.length%3)throw Error('分線牌陣沒有完整的三張分線。');for(let i=0;i<records.length;i+=3)paths.push([i+1,i+2,i+3]);}
    else if(['nine','grand','grand_nines'].includes(spread)){
      const w=spread==='nine'?3:spread==='grand'?8:9,h=spread==='nine'?3:4,n=w*h;
      if(records.length!==(spread==='grand'?36:n))throw Error('格狀牌陣未完整發牌。');
      const at=(r,c)=>r>=0&&r<h&&c>=0&&c<w?r*w+c+1:null;
      for(let i=0;i<n;i++){
        const r=Math.floor(i/w),c=i%w,p=i+1;
        for(const [dr,dc]of [[0,1],[1,0],[1,1],[1,-1]]){if(at(r-dr,c-dc))continue;const line=[];for(let y=r,x=c,q;(q=at(y,x));y+=dr,x+=dc)line.push(q);if(line.length>1)paths.push(line);}
        for(const [y,x,axis]of [[r,w-1-c,'horizontal'],[h-1-r,c,'vertical']]){const q=at(y,x);if(p<q)mirror.push({a:p,b:q,axis});}
        for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){const q=at(r+dr,c+dc);if((dr||dc)&&q&&p<q)neighbors.push({a:p,b:q});}
        for(const [dr,dc]of [[1,2],[1,-2],[-1,2],[-1,-2],[2,1],[2,-1],[-2,1],[-2,-1]]){const q=at(r+dr,c+dc);if(q&&p<q)knights.push({a:p,b:q});}
      }
      if(spread==='grand'){paths.push([33,34,35,36]);mirror.push({a:33,b:36,axis:'tail'},{a:34,b:35,axis:'tail'});neighbors.push({a:33,b:34},{a:34,b:35},{a:35,b:36});}
    }else throw Error('沒有明列合法雷諾曼布局。');
    const adjacent=[],segments=[];paths.forEach((p,branch)=>{for(let i=0;i<p.length-1;i++){const key=p[i]+'/'+p[i+1];if(!adjacent.some(x=>x.key===key))adjacent.push({key,from:p[i],to:p[i+1]});for(let j=i+2;j<=p.length;j++)segments.push({path:branch+1,positions:p.slice(i,j),cards:p.slice(i,j).map(k=>records[k-1].name)});}});
    return {records,paths,adjacent,segments,mirror,knights,neighbors,commonContext:spread==='choice'?4:null,methodData:copy(d.methodData||d.nativeMethodData),geometry:copy(d.geometry),policy:'本布局實算全部合法連續片段、鏡像、鄰接與騎士步；8×4主盤與尾排分開，不跨接選項分線。'};
  }
  function ootk(raw){const d=raw.ootkData||raw,ops=d.operations||{},operations=Object.keys(ops).map(operation=>({operation,valid:ops[operation].valid,abandoned:!!ops[operation].abandoned,data:copy(ops[operation])}));return {status:operations.length?'recorded':'not-started',operations,completed:operations.filter(x=>x.valid===true&&!x.abandoned).map(x=>x.operation),notCompleted:operations.filter(x=>x.valid!==true||x.abandoned).map(x=>x.operation),policy:'未完成、無效與放棄的輪次不冒稱已完成；不代做使用者尚未操作的輪次。'};}
  function oracle(p){
    if(!p||!Number.isInteger(p.n)||!p.g||typeof p.p!=='string'||!p.sourceUrl)throw Error('籤詩原文、版本或出處缺漏。');
    const r=root.JYOracleRegister&&root.JYOracleRegister.get(p.n),normalize=s=>s.replace(/[\s，。；]/g,'');
    if(!r)throw Error('本籤的逐首覆核資料未載入。');
    if(p.g!==r.ganzhi||normalize(p.p)!==normalize(r.canonicalPoem)||p.sourceUrl!==r.poemSource)throw Error('籤號、干支、原詩或來源與本版不符，不套用同號解說。');
    return {number:p.n,ganzhi:p.g,poem:p.p,source:p.sourceUrl,sourceNote:p.sourceNote,version:root.JYOracleRegister.version,profile:root.JYOracleRegister.profile,lines:p.p.split(/[\n，。；]/).map(x=>x.trim()).filter(Boolean).map((text,i)=>({index:i+1,text,conditionWords:Array.from(text.matchAll(/若|如|待|須|莫|勿|免|且|但|方|到|逢/g)).map(x=>({word:x[0],offset:x.index}))})),reading:{direction:r.direction,summary:r.summary,premises:r.premises,domainNotes:r.domainNotes},categories:r.categories,storyTitles:r.storyTitles,storyStatus:r.storyStatus,supplementSource:r.supplementSource,sourceAudit:r.sourceAudit,sourceSHA256:r.sourceSHA256,policy:root.JYOracleRegister.policy};
  }
  root.JYNativeCards=Object.freeze({tarot,lenormand,ootk,oracle});
})(typeof window==='undefined'?globalThis:window);
