/*! Jingyue · 大衍蓍草 / 1.0.0
 * 50 stalks, one set aside; three changes per line, hanging one EVERY change.
 * Source: 朱熹《易學啟蒙・明蓍策》, 性理大全書卷16.
 * Digital sampling: four remainder classes equiprobable, then a valid split
 * within that class. This reproduces the classical 1:5:7:3 outcome model;
 * it does not claim that every possible hand split is equally likely.
 */
(function(root){
  'use strict';
  var POLICY='dayan-remainder-4-v1';
  function freeze(v){if(v&&typeof v==='object'){Object.keys(v).forEach(function(k){freeze(v[k]);});Object.freeze(v);}return v;}
  function int(n){
    if(!root.crypto||!root.crypto.getRandomValues)throw new Error('此瀏覽器無法安全揲蓍，請改用手動記卦。');
    var a=new Uint32Array(1),limit=4294967296-4294967296%n;
    do{root.crypto.getRandomValues(a);}while(a[0]>=limit);
    return a[0]%n;
  }
  function split(total,left){
    if(!Number.isInteger(total)||![49,44,40,36,32].includes(total)||!Number.isInteger(left)||left<1||left>total-2)throw new Error('揲蓍分策紀錄無效');
    var right=total-left,hang=1,l=left%4||4,r=(right-hang)%4||4,removed=hang+l+r,remaining=total-removed;
    if(!(total===49?[5,9]:[4,8]).includes(removed))throw new Error('揲蓍餘策不合');
    return freeze({total:total,left:left,right:right,hang:hang,leftRemainder:l,rightRemainder:r,removed:removed,remaining:remaining});
  }
  function change(total){
    var residue=int(4)+1,choices=[];
    // Keep both hands nonempty after hanging one. Class sampling, not cut sampling.
    for(var left=1;left<=total-2;left++)if((left%4||4)===residue)choices.push(left);
    if(!choices.length)throw new Error('蓍策數目無效');
    return split(total,choices[int(choices.length)]);
  }
  function record(changes){
    if(!Array.isArray(changes)||changes.length!==3)throw new Error('一爻須完整三變');
    var total=49;
    var checked=changes.map(function(v){var s=split(total,v.left);Object.keys(s).forEach(function(k){if(s[k]!==v[k])throw new Error('揲蓍紀錄與餘策不一致');});total=s.remaining;return s;});
    var value=total/4;if(![6,7,8,9].includes(value))throw new Error('三變爻值無效');
    return freeze({policy:POLICY,changes:checked,value:value});
  }
  function cast(){var changes=[],total=49;for(var i=0;i<3;i++){var s=change(total);changes.push(s);total=s.remaining;}return record(changes);}
  function validate(r,value){if(!r||r.policy!==POLICY)throw new Error('蓍草取樣政策不符');var expected=record(r.changes);if(expected.value!==r.value||r.value!==value)throw new Error('揲蓍紀錄與爻值不一致');return true;}
  root.JYYarrowCore=Object.freeze({version:'1.0.0',policy:POLICY,split:split,change:change,record:record,cast:cast,validate:validate});
})(typeof window!=='undefined'?window:globalThis);
