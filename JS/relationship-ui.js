/* Shared, code-native celestial instruments and inspectable Ziwei pair results. */
(function(root){
  'use strict';
  function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function instrument(side){
    var ticks='';
    for(var i=0;i<60;i++)ticks+='<path d="M100 '+(i%5===0?'9 V17':'11 V14')+'" transform="rotate('+(i*6)+' 100 100)"/>';
    return '<span class="pair-instrument pair-'+side+'" aria-hidden="true"><span class="pair-orbit pair-orbit-one"></span><span class="pair-orbit pair-orbit-two"></span><span class="pair-metal-ring"></span><svg class="pair-engraving" viewBox="0 0 200 200" fill="none">'+
      '<circle cx="100" cy="100" r="91"/><circle cx="100" cy="100" r="78"/><circle cx="100" cy="100" r="73" stroke-dasharray="1 5"/>'+ticks+
      '<path d="M100 0l7 10-7 10-7-10zm0 180 7 10-7 10-7-10zM0 100l10-7 10 7-10 7zm180 0 10-7 10 7-10 7zM36 36q24-5 21 21-26 3-21-21m128 0q5 24-21 21-3-26 21-21M36 164q-5-24 21-21 3 26-21 21m128 0q-24 5-21-21 26-3 21 21"/>'+
      '<path d="M60 103l24-29 35 10 26 40-41 22-44-43zM84 74l20 72 15-62M60 103l85 21" class="pair-constellation"/>'+
      '<g class="pair-stars"><circle cx="60" cy="103" r="2.6"/><circle cx="84" cy="74" r="3.1"/><circle cx="119" cy="84" r="2"/><circle cx="145" cy="124" r="3"/><circle cx="104" cy="146" r="2"/></g></svg>'+
      '<span class="pair-glass"></span><span class="pair-gem"></span><span class="pair-crown">✦</span><span class="pair-plinth"></span></span>';
  }
  function seal(label,i){
    return '<button type="button" class="jr-seal jr-pair-seal" data-seal-index="'+i+'" aria-pressed="false" aria-label="點亮'+esc(label)+'星儀">'+instrument(i?'b':'a')+
      '<span class="pair-nameplate"><span class="pair-person-label">'+esc(label)+'</span><small class="jr-seal-state">輕觸點亮</small></span></button>';
  }
  function person(f,id,name,focus){
    if(!f)return '<article class="pair-chart pair-'+id.toLowerCase()+'"><h3>'+id+' · '+esc(name)+'</h3><p>時辰尚未確認</p><p class="pair-caption">此方紫微未定盤；保留已知的八字三柱資料。</p></article>';
    function palaceSummary(p){return p.stars.filter(function(s){return s.type==='major';}).map(function(s){return s.name+(s.brightness?'・'+s.brightness:'');}).join('／')||'空宮・參照對宮';}
    var ming=f.palaces.find(function(p){return p.isMing;}),shen=f.palaces.find(function(p){return p.isShen;});
    return '<article class="pair-chart pair-'+id.toLowerCase()+'"><div class="pair-chart-heading"><span class="pair-initial">'+id+'</span><div><h3>'+esc(name)+'</h3><small>'+esc(f.birthInput.civilDate+' '+(f.birthInput.civilTime||f.birthInput.hourBranch+'時'))+'</small></div></div>'+
      '<div class="pair-natal-title"><small>命宮 · '+esc(ming.branch)+'</small><strong>'+esc(palaceSummary(ming))+'</strong><span>身宮 '+esc(shen.name+'・'+shen.branch)+'　'+f.wuxingJu+'局</span></div>'+
      '<div class="pair-palace-list">'+focus.map(function(n){var p=f.palaces.find(function(x){return x.name===n;}),sf=f.sanFangSiZheng.find(function(x){return x.palace===n;});
        return '<div><b>'+esc(n)+'<em>'+esc(p.gan+p.branch)+'</em></b><span>'+esc(palaceSummary(p))+'</span><small>三合 '+esc(sf.trines.map(function(t){return t.palace+'('+t.branch+')';}).join('、'))+' · 對宮 '+esc(sf.opposite.palace+'('+sf.opposite.branch+')')+'</small></div>';
      }).join('')+'</div><div class="pair-natal-hua">'+f.natalTransformations.map(function(h){return '<span>'+esc(h.star+h.hua)+'<small>生年 → '+esc(h.targetPalace)+'</small></span>';}).join('')+'</div></article>';
  }
  function periodCell(x){
    if(!x)return '未定盤';
    return '<b>'+esc(x.decade?x.decade.palaceName+'大限':'未入大限')+'</b><small>'+esc(x.decade?x.decade.ageStart+'–'+x.decade.ageEnd+'歲':'')+'</small><span>流年命 → '+esc(x.annual.mingPalace)+'('+esc(x.annual.mingBranch)+')</span>';
  }
  function results(pair,metaA,metaB){
    if(!pair)return '';
    var a=metaA.name||'甲方',b=metaB.name||'乙方';
    return '<section class="pair-result" id="pair-ziwei-result"><header class="pair-section-heading"><span>02 / TWELVE PALACES</span><h2>紫微斗數 · 雙星合參</h2><p>先看見各自的需要，再讀彼此的牽動。</p></header>'+
      (pair.unavailable.length?'<p class="bzs-note warning">'+esc(pair.unavailable.join('；'))+'。雙向紫微對照暫不推算。</p>':'')+
      '<div class="pair-chart-grid">'+person(pair.personA,'A',a,pair.focusPalaces)+person(pair.personB,'B',b,pair.focusPalaces)+'</div>'+
      (pair.directions.length?'<section class="bzs-card"><h3>雙向四化引動</h3><p>以對方生年干映射本人的星曜落宮，作為相處議題的參照；兩個方向分別閱讀。</p><div class="pair-directions">'+pair.directions.map(function(d){return '<article><h4>'+esc(d.sourcePerson==='A'?a+' → '+b:b+' → '+a)+'</h4>'+d.birthStemProjection.map(function(h){return '<div class="pair-flight"><b>'+esc(h.stem)+'干</b><span>'+esc(h.star+h.hua)+'</span><i>→</i><strong>'+esc(h.targetPerson+' '+h.targetPalace+'・'+h.targetBranch)+'</strong></div>';}).join('')+'</article>';}).join('')+'</div><p class="pair-caption">跨盤引動屬所選流派的參照，不會改寫任何一方的生年四化，也不代表對方已經產生特定感情或行為。</p></section>':'')+
      (pair.overlays.length?'<details class="bzs-card pair-details"><summary>十二宮同支對照<span>查看完整座標 ↗</span></summary><div class="pair-table-wrap"><table><thead><tr><th>地支</th><th>甲方宮位</th><th>乙方宮位</th></tr></thead><tbody>'+pair.overlays.map(function(o){return '<tr><td>'+esc(o.branch)+'</td><td>'+esc(o.aPalace+(o.aBody?'・身宮':''))+'</td><td>'+esc(o.bPalace+(o.bBody?'・身宮':''))+'</td></tr>';}).join('')+'</tbody></table></div><p class="pair-caption">相同地支只用來對齊命盤；不能直接轉成契合率。</p></details>':'')+
      (pair.timeline.length?'<section class="bzs-card"><h3>兩個人的時間軌道</h3><p>現行年度與未來三年，同時保留各自的大限和流年。</p><div class="pair-timeline">'+pair.timeline.map(function(t){return '<article><header><b>'+t.year+'</b><small>'+esc(t.window.start.slice(0,10))+' 起</small></header><div><small>甲方</small>'+periodCell(t.a)+'</div><div><small>乙方</small>'+periodCell(t.b)+'</div></article>';}).join('')+'</div><p class="pair-caption">紫微每年正月初一換年；八字以立春換年。解讀同一段期間時須各自核對。</p></section>':'')+
      '<details class="bzs-card pair-details"><summary>本次排盤依據<span>時間與方法 ↗</span></summary><p>紫微保留民用出生時分，午夜換日，閏月沿用本月；八字仍依各自地點校正真太陽時。</p><p>兩人的生年四化、宮干飛化、三方四正與年度運限均附在完整提示詞及 JSON 中。先分別成判，再比較支持與矛盾。</p></details></section>';
  }
  root.JYRelationshipUI=Object.freeze({instrument:instrument,seal:seal,results:results});
})(window);
