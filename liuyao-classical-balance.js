/* 增刪卜易: use the SAME candidate, states and effective movement ledger as
 * liuyao-core. Hidden spirits must not inherit the flying line's transformation. */
(function(root){'use strict';
  const VERSION='20261004liuyao-balance14',SOURCE='https://zh.wikisource.org/zh-hant/增刪卜易';
  const A=x=>Array.isArray(x)?x:[],clone=x=>x==null?null:JSON.parse(JSON.stringify(x));
  const elements=['木','火','土','金','水'];
  function relation(from,to){const i=elements.indexOf(from),j=elements.indexOf(to);return i<0||j<0?null:['比和','生','克','受克','受生'][(j-i+5)%5];}
  function direction(r){return r==='生'||r==='比和'?'support':r==='克'?'control':r==='受生'?'drain':r==='受克'?'target-controls-source':'unknown';}
  function compute(c){
    if(!c?.interpretation)return {version:VERSION,status:'insufficient-data',missing:['interpretation'],source:SOURCE};
    const assessments=A(c.interpretation.lines),targets=[];
    for(const t of A(c.interpretation.targets)){
      const networkTarget=A(c.interpretation.influences).find(x=>x.role===t.role&&x.relative===t.relative&&x.priority===t.priority);
      const candidates=A(t.candidates).map(cand=>{
        const flying=A(c.lines).find(x=>x.position===cand.position),native=cand.hidden?flying?.hidden:flying;
        const states=cand.states||native?.states||{},a=cand.assessment||{},forces=[];
        for(const source of ['month','day']){
          const rel=states[source+'Relation']??(source==='month'?a.season?.relation:null);
          forces.push({source,direction:direction(rel),relation:rel??null,
            raw:source==='month'?a.monthInfluence||null:a.dayInfluence||null,
            state:{same:states[source+'Same']??null,clash:source==='month'?states.monthBroken??null:states.dayClash??null,
              combine:states[source+'Combine']??null,void:states.void??null},
            scope:cand.hidden?'伏神本身月日作用':'本爻月日作用'});
        }
        const network=A(networkTarget?.candidates).find(x=>x.position===cand.position&&!!x.hidden===!!cand.hidden&&x.branch===cand.branch);
        for(const edge of A(network?.network)){
          if(!['明動','暗動'].includes(edge.movement)||!cand.hidden&&edge.position===cand.position)continue;
          const sourceLine=A(c.lines).find(x=>x.position===edge.position),sourceAssessment=assessments.find(x=>x.position===edge.position);
          const rel=relation(sourceLine?.element,cand.element||native?.element),d=direction(rel);
          if(!['support','control'].includes(d))continue;
          const conditional=edge.availability!=='available'||edge.transition?.returnRelation==='克';
          forces.push({source:'moving-line',direction:d,position:edge.position,branch:sourceLine?.branch,
            movement:edge.movement,function:edge.function,relation:rel,effectStatus:conditional?'conditional':'effective',
            availability:edge.availability,obstacles:clone(sourceAssessment?.obstacles||edge.obstacles||[]),
            transformation:clone(edge.transition)});
        }
        if(!cand.hidden&&flying?.moving&&flying.transition){
          const rel=flying.transition.returnRelation;
          forces.push({source:'transformation',direction:direction(rel),relation:rel,raw:clone(flying.transition)});
          if(flying.transition.advance||flying.transition.retreat)forces.push({source:flying.transition.advance?'advance':'retreat',
            direction:'conditional',raw:clone(flying.transition),policy:'進退不是獨立吉凶，須依用元忌仇與可用性判讀。'});
        }
        const flight=cand.hidden?clone(cand.flightAssessment):null;
        if(cand.hidden)forces.push({source:'flying-hidden-gate',direction:'conditional',raw:flight,
          flightRelation:cand.flightRelation??native?.flightRelation??null,
          policy:'飛伏出伏門檻必須先核；飛神的動化不當作伏神自身動化。'});
        const availability=cand.hidden?(flight?.status||'unknown'):(a.availability||'unknown');
        const support=forces.filter(x=>x.direction==='support'&&x.effectStatus!=='conditional');
        const control=forces.filter(x=>x.direction==='control'&&x.effectStatus!=='conditional');
        const gated=cand.hidden&&['blocked','blocked-with-support'].includes(availability);
        const status=gated?'hidden-blocked':availability==='impaired'||availability==='unavailable'?'impaired':
          support.length&&control.length?'mixed-review':support.length?'support-only':control.length?'control-only':'unresolved';
        return {position:cand.position,branch:cand.branch,hidden:!!cand.hidden,availability,forces,flightAssessment:flight,
          supportCount:support.length,controlCount:control.length,status,
          policy:'來源數僅描述作用種類，不加權決定旺衰；先判月日、空破、動變有效性及伏神出伏，再比較生克。'};
      });
      targets.push({role:t.role,relative:t.relative,priority:t.priority,candidates});
    }
    return {version:VERSION,status:'calculated',targets,source:SOURCE,
      policy:'月日、有效明暗動、回頭生克與飛伏門檻分列；空破與進退均為條件，不作數量投票。'};
  }
  root.JYLiuyaoClassicalBalance=Object.freeze({version:VERSION,compute,source:SOURCE});
})(typeof window==='undefined'?globalThis:window);
