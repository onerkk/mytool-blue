/*! tarot-inventory.js — generated from 靜月之光_庫存_20260717.xlsx
 * 僅提供實際正庫存品項給塔羅推薦器；不含網址、功效或價格。
 */
(function(root){
  'use strict';
  var VERSION='2026.07.17';
  var SOURCE_FILE='__SOURCE_FILE__';
  var catalog=__CATALOG_JSON__;

  var RULES={
    business:[/綠幽靈|黃水晶|金髮晶|鈦晶|金太陽|虎眼|東陵玉|抹茶幽靈|黃鐵礦/],
    relationship:[/粉晶|草莓晶|草苺晶|月光石|摩根石|紅紋石|薔薇石|石榴石|紫牙烏/],
    decision:[/茶晶|黑曜|天鐵|隕石|彼得石|藍虎眼|堇青石/],
    communication:[/海藍寶|青晶石|紫水晶|堇青石|天河石|藍彼得/],
    general:[/白水晶|白幽靈|葡萄石/]
  };
  function text(v){return v==null?'':String(v);}
  function contexts(question,domains){
    var q=text(question), ds=(domains||[]).slice(), out=[];
    if(ds.some(function(x){return /career|finance|business/.test(x);})||/工作|事業|副業|生意|賣場|金錢|財運|收入|營業額|營收|利潤|投資/.test(q))out.push('business');
    if(ds.some(function(x){return /relationship/.test(x);})||/感情|關係|戀愛|婚姻|桃花|伴侶|前任|社交/.test(q))out.push('relationship');
    if(ds.some(function(x){return /travel/.test(x);})||/選擇|決定|轉換|轉職|離職|搬家|移動|旅行|出國|二選一|還是/.test(q))out.push('decision');
    if(ds.some(function(x){return /study/.test(x);})||/溝通|學習|考試|書面|合約|文件|談判|表達/.test(q))out.push('communication');
    if(!out.length)out.push('general');
    return out;
  }
  function wearableScore(item){
    var n=item.name;
    var score=0;
    if(item.wrist!=null)score+=5;
    if(/手鍊|手排|設計款|對鍊/.test(n))score+=3;
    if(/項鍊/.test(n))score+=1;
    if(/貔貅|鳳凰|吊墜|墜|球|原礦|擺件/.test(n))score-=3;
    score+=Math.min(Number(item.qty)||0,5)*0.15;
    return score;
  }
  function matchRule(item,context){
    return (RULES[context]||[]).some(function(re){return re.test(item.name);});
  }
  function recommendCandidates(question,domains,limit){
    var cs=contexts(question,domains), max=Math.max(1,Number(limit)||6);
    var ranked=catalog.filter(function(x){return Number(x.qty)>0;}).map(function(item){
      var score=wearableScore(item), matched=false;
      cs.forEach(function(c,i){if(matchRule(item,c)){score+=18-i*2;matched=true;}});
      if(!matched&&matchRule(item,'general'))score+=4;
      return {item:item,score:score,matched:matched};
    }).sort(function(a,b){return b.score-a.score||b.item.qty-a.item.qty||a.item.displayName.localeCompare(b.item.displayName,'zh-Hant');});
    var matched=ranked.filter(function(x){return x.matched;});
    var source=matched.length?matched:ranked, seen=Object.create(null), diverse=[];
    source.forEach(function(x){
      var key=x.item.name;
      if(seen[key])return;
      seen[key]=1;
      diverse.push(x);
    });
    return diverse.slice(0,max).map(function(x){return x.item.displayName;});
  }
  function recommend(question,domains){
    var list=recommendCandidates(question,domains,1);
    return list.length?list[0]:'';
  }
  root.JYShopInventory={
    VERSION:VERSION,SOURCE_FILE:SOURCE_FILE,catalog:catalog,
    contexts:contexts,recommendCandidates:recommendCandidates,recommend:recommend
  };
})(typeof globalThis!=='undefined'?globalThis:(typeof window!=='undefined'?window:this));
