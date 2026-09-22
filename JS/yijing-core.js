/*! Zhouyi text reading · 1.0.0. Independent of Liuyao Na Jia interpretation.
 * Three-coin construction shares only the verified hexagram geometry.
 * Zhu Xi selection policy, including the ordered twenty three-change cases.
 * Sources, variant policy and attribution: docs/liuyao-20260922.md.
 */
(function(root){
  'use strict';
  function freeze(x){if(x&&typeof x==='object'&&!Object.isFrozen(x)){Object.keys(x).forEach(function(k){freeze(x[k]);});Object.freeze(x);}return x;}
  function textFor(number){var d=root.JYYijingData;if(!d||d.entries.length!==64)throw new Error('易經原文尚未載入，請稍後重試。');var e=d.entries[number-1];if(!e||e.number!==number||e.lines.length!==6)throw new Error('卦爻辭資料不完整');return e;}
  function calculate(input){
    input=input||{};var c=root.JYLiuyaoCore,values=input.values;
    if(!c)throw new Error('卦象元件尚未載入');
    if(!Array.isArray(values)||values.length!==6||values.some(function(v){return !Number.isInteger(v)||v<6||v>9;}))throw new Error('請由初爻至上爻完整記錄六爻。');
    var method=input.method||'manual',records=input.records||[];
    if(!['yarrow','coins','manual'].includes(method))throw new Error('起卦方式無效');
    if(method==='coins'&&(records.length!==6||records.some(function(r,i){return c.fromCoins(r.coins)!==values[i]||r.value!==values[i];})))throw new Error('擲錢紀錄與卦象不一致');
    if(method==='yarrow'){
      if(!root.JYYarrowCore||records.length!==6)throw new Error('須有六爻完整揲蓍紀錄');
      records.forEach(function(r,i){root.JYYarrowCore.validate(r,values[i]);});
    }
    var code=0,changedCode=0,moving=[],still=[];
    values.forEach(function(v,i){if(v%2)code|=1<<i;if(v===6||v===7)changedCode|=1<<i;(v===6||v===9?moving:still).push(i+1);});
    var original=c.hexagram(code),changed=c.hexagram(changedCode),base=textFor(original.number),to=textFor(changed.number),selections=[],rule='';
    function judgment(which,role){var d=which==='original'?base:to;selections.push({hexagram:d.name,number:d.number,side:which,kind:'judgment',position:null,label:'卦辭',text:d.judgment,role:role,source:d.source,revision:d.revision});}
    function line(which,p,role){var d=which==='original'?base:to,l=d.lines[p-1];selections.push({hexagram:d.name,number:d.number,side:which,kind:'line',position:p,label:l.label,text:l.text,role:role,source:d.source,revision:d.revision});}
    if(moving.length===0){rule='六爻皆靜，以本卦卦辭為主。';judgment('original','主讀');}
    else if(moving.length===1){rule='一爻動，以本卦該動爻爻辭為主。';line('original',moving[0],'主讀');}
    else if(moving.length===2){rule='兩爻動，讀本卦兩條動爻；較上方的爻為主。';line('original',moving[1],'主讀');line('original',moving[0],'參讀');}
    else if(moving.length===3){
      // 考變占二十卦按動爻由初向上列組合：前十含初爻，後十不含。
      // 乾前十首否末恆，後十首益末泰；坤前十首泰末益，後十首恆末否。
      var primary=moving[0]===1?'original':'changed';
      rule='三爻動，本、之卦卦辭並讀。本卦為貞，之卦為悔；本次屬'+(primary==='original'?'前十卦，主貞（本卦）。':'後十卦，主悔（之卦）。');
      judgment(primary,primary==='original'?'主讀・本卦貞':'主讀・之卦悔');judgment(primary==='original'?'changed':'original',primary==='original'?'參讀・之卦悔':'參讀・本卦貞');
    }
    else if(moving.length===4){rule='四爻動，讀之卦兩條不變爻；較下方的爻為主。';line('changed',still[0],'主讀');line('changed',still[1],'參讀');}
    else if(moving.length===5){rule='五爻動，以之卦唯一不變爻的爻辭為主。';line('changed',still[0],'主讀');}
    else if(original.number===1||original.number===2){rule='乾坤六爻皆動，分別用「用九」或「用六」。';selections.push({hexagram:base.name,number:base.number,side:'original',kind:'use',position:null,label:base.use.label,text:base.use.text,role:'主讀',source:base.source,revision:base.revision});}
    else{rule='六爻皆動，以之卦卦辭為主。';judgment('changed','主讀');}
    return freeze({version:'1.1.0',system:'yijing',method:method,question:String(input.question||'').trim(),calendar:JSON.parse(JSON.stringify(input.calendar||{})),
      values:values.slice(),records:JSON.parse(JSON.stringify(records)),original:original,changed:changed,hasChange:code!==changedCode,movingPositions:moving,
      lines:values.map(function(v,i){return {position:i+1,label:c.labels[i],value:v,yang:!!(v%2),moving:v===6||v===9,valueName:{6:'老陰',7:'少陽',8:'少陰',9:'老陽'}[v],marker:v===6?'×':v===9?'○':'',text:base.lines[i]};}),
      originalText:base,changedText:to,reading:{policy:'朱子《易學啟蒙・考變占》',rule:rule,selections:selections},
      policy:{lineOrder:'bottom-up',coinConvention:method==='coins'?'字面=2、背面=3；6老陰、7少陽、8少陰、9老陽':null,yarrowPolicy:method==='yarrow'?root.JYYarrowCore.policy:null,scope:'周易卦爻辭；不套用六爻納甲或梅花體用',sourceEdition:root.JYYijingData.edition,threeChanges:'三動爻位置由初向上列二十組合，前十主貞、後十主悔；兩卦皆讀'}});
  }
  root.JYYijingCore=Object.freeze({version:'1.1.0',calculate:calculate,textFor:textFor});
})(typeof window!=='undefined'?window:globalThis);
