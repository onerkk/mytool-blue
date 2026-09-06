/*! Reading mode, immutable draw orientation and presentation. 2026-09-06 */
(function(root){
  'use strict';
  var RWS='rws_reversals',GD='gd_book_t',requested=RWS;
  var nativeGD=['ootk','fifteen_card','mathers_21','mathers_horseshoe'];
  function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function currentSpread(){return typeof getCurrentSpread==='function'?getCurrentSpread():((root.S||{}).tarot||{}).spreadType||'five_card';}
  function currentCards(){return typeof drawnCards!=='undefined'?drawnCards:(((root.S||{}).tarot||{}).drawn||[]);}
  function mode(spread,cards){
    if(nativeGD.indexOf(spread)>=0)return GD;
    if(cards&&cards.length&&cards[0].readingMode)return cards[0].readingMode;
    return requested;
  }
  function orientation(spread,rng){return mode(spread)===GD || (rng||root._secRand||Math.random)()>=0.5;}
  function apply(card,isUp,spread,chosenMode){
    var m=chosenMode||mode(spread);
    card.readingMode=m;card.sourceProfile=m;
    if(m===RWS){
      var original=card._legacyGoldenDawnBackup||card;
      card.up=original.up||'';card.rv=original.rv||'';card.kwUp=original.kwUp||'';card.kwRv=original.kwRv||'';
      card.isUp=isUp!==false;card.direction=card.isUp?'正位':'逆位';
      card.orientationPolicy='upright_reversed';
      delete card.gd;delete card.gdIllDignified;
    }else{
      if(root.JYGoldenDawn)root.JYGoldenDawn.annotate(card);
      card.isUp=true;card.direction='正向・元素尊貴';card.orientationPolicy='elemental_dignities';
    }
    return card;
  }
  function label(card){return card&&card.readingMode===RWS?(card.isUp===false?'逆位 ↓':'正位 ↑'):'正向・Book T';}
  function imageStyle(card){return card&&card.readingMode===RWS&&card.isUp===false?'transform:rotate(180deg);':'';}
  function meaning(card){
    // These are existing site keywords, not an asserted answer to the question.
    var original=card._legacyGoldenDawnBackup||card;
    return (card.isUp===false?original.rv:original.up)||'依本次牌位、牌面方向與全盤關係解讀';
  }
  function face(card){
    var img=typeof getTarotCardImage==='function'?getTarotCardImage(card):'';
    return '<button type="button" class="jy-card-face" data-jy-preview="'+Number(card.id)+'" aria-label="放大 '+esc(card.n)+'，'+esc(label(card))+'">'+
      (img?'<img src="'+esc(img)+'" class="tc-img" alt="'+esc(card.n+'・'+label(card))+'" loading="eager" style="'+imageStyle(card)+'">':'')+
      '<span class="tc-name">'+esc(card.n)+'</span><span class="tc-dir '+(card.isUp===false?'rv':'up')+'">'+label(card)+'</span></button>';
  }
  function stats(cards){
    var suits={major:0,wand:0,cup:0,sword:0,pent:0},rv=0,courts=0;
    cards.forEach(function(c){if(suits[c.suit]!=null)suits[c.suit]++;if(c.isUp===false)rv++;if(/king|queen|knight|page/.test(c.rank||''))courts++;});
    return {total:cards.length,suitCounts:suits,majorCount:suits.major,courtCount:courts,upCount:cards.length-rv,rvCount:rv,upRatio:cards.length?Math.round((cards.length-rv)/cards.length*100):0,rvRatio:cards.length?Math.round(rv/cards.length*100):0,insights:[],sourceProfile:RWS};
  }
  function statsHTML(cards){var s=stats(cards);return '<div class="jy-reading-summary"><b>RWS 塔羅・正逆位</b><p>正位 '+s.upCount+' 張　／　逆位 '+s.rvCount+' 張</p><p>點牌面可放大。正逆位需結合牌位與整體牌組解讀。</p></div>';}
  function resultHTML(cards,def){
    var h=statsHTML(cards);
    cards.forEach(function(c,i){var pos=def&&def.positions&&def.positions[i]||{};h+='<article class="jy-reading-result"><div class="jy-reading-face">'+face(c)+'</div><div><b>'+(i+1)+'. '+esc(pos.name||c.pos)+'</b><p>'+esc(pos.zh||'')+'</p><p>'+esc(c.n)+'・'+esc(label(c))+'</p><small>牌義參考：'+esc(meaning(c))+'</small></div></article>';});
    return h+'<button type="button" class="btn btn-outline" onclick="_tarotShare()">分享這次牌陣</button>';
  }
  function payload(ta,question,drawn,spread,plan,def){
    var s=stats(drawn);
    return {mode:'tarot_only',question:question,focusType:((root.S||{}).form||{}).type||'general',tarotData:{
      spreadType:spread,spreadZh:(def&&def.zh)||plan.label||spread,readingMode:RWS,sourceProfile:RWS,
      methodPlan:plan,sourceContract:{id:RWS,label:'Rider–Waite–Smith・正逆位',reversalPolicy:'每張牌依發牌時記錄的正位／逆位解讀；逆位可呈現內在化、受阻、延遲、過度或不足，依問題與牌組選擇最有支持的讀法。'},
      cards:drawn.map(function(c,i){var slot=(plan.slots||[])[i]||{},pos=((def||{}).positions||[])[i]||{};return {
        id:c.id,name:c.n||c.name||'',isUp:c.isUp!==false,direction:c.isUp===false?'逆位':'正位',sourceProfile:RWS,
        position:slot.label||pos.name||c.pos||('位置'+(i+1)),positionMeaning:slot.label||pos.zh||c.pos||'',
        suit:c.suit,rank:c.rank||'',image:typeof getTarotCardImage==='function'?getTarotCardImage(c):'',
        // Core facts only: AI uses its own RWS knowledge, without legacy Book T meanings.
        slotKind:slot.slotKind||'semantic_position'
      };}),preStats:{upCount:s.upCount,reversedCount:s.rvCount,suitCounts:s.suitCounts}
    }};
  }
  function promptHead(){return [
    '【任務】你是一位資深 Rider–Waite–Smith 塔羅讀牌者。運用你自身完整的塔羅知識，依本次實際牌名、正逆位、牌位、問題情境與全盤關係，完成深入的綜合解讀。',
    '牌面為本站藝術詮釋，採 RWS 讀法；不能假設藝術圖像包含原版 Waite 牌圖的每個細節。',
    '【讀法】先掌握核心局勢，再分析形成原因、助力與阻力、行動選擇、條件延續下的發展。對照相關牌位中的支持與矛盾，說明哪些因素更有份量，以及什麼現實訊號會改變主判。',
    '逆位依牌本性與上下文判斷內在化、受阻、延遲、過量或不足等可能；不把所有逆位視為壞事，也不機械反轉正位牌義。橫放的交叉牌仍以資料記錄的正逆位為準。',
    '【輸出】使用繁體中文，開頭直接回應原問句。接著以具體牌名與牌位支持判斷，解釋關鍵牌組如何互相影響、最值得考慮的替代解讀、可行的下一步及可觀察的驗證訊號。每個子題都要回應；深入來自比較與整合，避免逐張堆疊字典或重複結論。',
    '對尚未發生的事給出有條件的傾向，區分當事人已提供的事實與象徵推測；涉及他人內心、年齡或應期時，說明資料實際支持的範圍。只拿到牌名而看不到牌圖時，勿聲稱已檢視本次圖像細節。'
  ].join('\n');}
  function formatData(td,rec){
    var L=['牌陣：'+td.spreadZh+'（'+td.cards.length+' 張）','讀牌體系：Rider–Waite–Smith・使用正逆位','下列牌名、順序與方向為本次實際抽牌紀錄：'];
    td.cards.forEach(function(c,i){L.push((i+1)+'. '+c.position+'：'+c.name+'【'+c.direction+'】');});
    var s=td.preStats||{};L.push('正位 '+s.upCount+' 張；逆位 '+s.reversedCount+' 張。這是抽牌統計，不換算事件機率。');
    L.push('【可推薦庫存品項】'+(rec&&rec.allowedItems&&rec.allowedItems.length?rec.allowedItems.join('、'):'無'));
    return L.join('\n');
  }
  function guide(td){
    var p=td.methodPlan||{},L=['◆ 本次方法資料','依每個牌位的名稱與問題讀牌，將單張意義連成整體判斷。'];
    (p.slots||[]).forEach(function(s,i){if(td.cards[i])L.push((i+1)+'. '+(s.label||td.cards[i].position));});
    (p.compatibilityEdges||[]).forEach(function(edge){if(Array.isArray(edge))L.push('對照：'+edge.map(function(i){return (i+1)+'. '+((td.cards[i]||{}).position||'');}).join(' ↔ '));});
    L.push('時間位置表示相對階段；牌數、牌號與朝向本身不提供精確曆日或人數。');return L.join('\n');
  }
  function syncControls(){
    var host=root.document.getElementById('tarot-reading-controls');if(!host)return;
    var sid=currentSpread(),cards=currentCards(),fixed=nativeGD.indexOf(sid)>=0;
    var selector=host.querySelector('select');
    if(!selector){host.innerHTML='<label for="tarot-reading-mode">讀牌方式</label><select id="tarot-reading-mode"><option value="rws_reversals">RWS 塔羅・正位與逆位</option><option value="gd_book_t">Golden Dawn・元素尊貴</option></select><p id="tarot-reading-help"></p>';selector=host.querySelector('select');selector.addEventListener('change',function(){
      if(currentCards().length){syncControls();return;}
      requested=selector.value===GD?GD:RWS;
      if(root.S&&root.S.tarot)root.S.tarot.readingMode=requested;
      syncControls();
    });}
    selector.value=mode(sid,cards);selector.disabled=fixed||cards.length>0;
    host.querySelector('p').textContent=fixed?'本牌陣依 Golden Dawn 程序，採正向牌面與元素尊貴判讀。':cards.length?'本輪方式已確認。點牌面可放大查看方向與牌位。':'先選方式，再洗牌、選牌。本站藝術牌面翻開後明示正位／逆位；點牌可放大。';
  }
  function preview(id){
    var card=currentCards().find(function(c){return c.id===id;});if(!card||!root.JY_PICKER)return;
    var dialog=root.document.createElement('dialog');
    dialog.innerHTML='<section class="jy-card-preview" aria-label="牌面詳情"><h2>'+esc(card.n)+'・'+esc(label(card))+'</h2><p>'+esc(card.pos||'')+'</p><div class="jy-card-preview-body"><img src="'+esc(getTarotCardImage(card))+'" alt="'+esc(card.n+' '+label(card))+'" style="'+imageStyle(card)+'"></div><button type="button">關閉牌面</button></section>';
    var close=root.JY_PICKER.mount(dialog,'.jy-card-preview-body',function(){close();});dialog.querySelector('button').onclick=close;
  }
  root.document.addEventListener('click',function(e){var button=e.target.closest&&e.target.closest('[data-jy-preview]');if(button){e.preventDefault();preview(Number(button.dataset.jyPreview));}});
  root.JYTarotReading={version:'1.0.0',RWS:RWS,GD:GD,mode:mode,orientation:orientation,apply:apply,label:label,imageStyle:imageStyle,face:face,meaning:meaning,stats:stats,statsHTML:statsHTML,payload:payload,promptHead:promptHead,formatData:formatData,guide:guide,resultHTML:resultHTML,syncControls:syncControls};
})(window);
