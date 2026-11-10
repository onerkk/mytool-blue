// ═══════════════════════════════════════════════════════════════
// guide.js v20260330 — 使用教學 overlay + 提問品質 modal
// JS_backup/ → obfuscate → JS/
// 載入順序：ui.js 之後
// ═══════════════════════════════════════════════════════════════
(function(){
'use strict';

// ★ Bug AN 修補:重複載入保護
//   guide.js 不小心被載入兩次(SPA 行為 / import 衝突)會導致:
//     - wrap('submitWithTool') 跑兩次 → window.submitWithTool 被多層 wrap
//     - help button 跑兩次(已被 Bug AM 擋掉,但 CSS / 教學 timer 仍會重複)
//   修法:檢查 window._jyGuideLoaded flag,已載入就 return
if(window._jyGuideLoaded)return;
window._jyGuideLoaded=true;

// ── CSS ──
var css=document.createElement('style');
css.textContent='\
.jy-gov{position:fixed;inset:0;z-index:9999;background:rgba(5,5,8,.92);backdrop-filter:blur(16px);overflow-y:auto;overflow-x:hidden;opacity:0;transition:opacity .4s;pointer-events:none;-webkit-overflow-scrolling:touch}\
.jy-gov.v{opacity:1;pointer-events:auto}\
.jy-gov *{box-sizing:border-box}\
.jy-g-inner{max-width:440px;margin:0 auto;padding:1rem}\
.jy-g-hdr{text-align:center;padding:1.5rem 0 .8rem}\
.jy-g-hdr .mn{font-size:2.2rem;animation:jyFl 4s ease-in-out infinite}\
@keyframes jyFl{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}\
.jy-g-hdr h1{font-size:1.15rem;color:#c9a84c;letter-spacing:.05em;margin:.3rem 0 .2rem;font-family:"Noto Serif TC",serif}\
.jy-g-hdr p{font-size:.72rem;color:rgba(228,228,231,.4);line-height:1.5}\
.jy-g-close{position:fixed;top:12px;right:16px;z-index:10001;width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.08);color:rgba(228,228,231,.6);font-size:1.1rem;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s}\
.jy-g-close:hover{background:rgba(255,255,255,.12);color:#c9a84c}\
.jy-ss{opacity:0;transform:translateY(30px);transition:all .5s cubic-bezier(.16,1,.3,1);margin-bottom:1.5rem}\
.jy-ss.vis{opacity:1;transform:none}\
.jy-sh{display:flex;align-items:center;gap:.6rem;margin-bottom:.8rem}\
.jy-sn{min-width:30px;height:30px;border-radius:50%;background:rgba(201,168,76,.1);border:1.5px solid rgba(201,168,76,.35);display:flex;align-items:center;justify-content:center;font-size:.75rem;color:#c9a84c;font-weight:700;flex-shrink:0}\
.jy-si h3{font-size:.88rem;color:#e4e4e7;margin:0 0 .12rem;font-weight:600}\
.jy-si p{font-size:.7rem;color:rgba(228,228,231,.4);line-height:1.4;margin:0}\
.jy-pw{position:relative;margin:0 auto;max-width:300px}\
.jy-ph{position:relative;background:#1a1a1d;border-radius:26px;border:3px solid #2a2a2e;box-shadow:0 14px 50px rgba(0,0,0,.5),0 0 40px rgba(201,168,76,.04);overflow:hidden;padding:26px 7px 10px}\
.jy-pn{position:absolute;top:0;left:50%;transform:translateX(-50%);width:90px;height:20px;background:#1a1a1d;border-radius:0 0 10px 10px;z-index:5}\
.jy-pn::after{content:"";position:absolute;top:6px;left:50%;transform:translateX(-50%);width:32px;height:3px;background:#333;border-radius:2px}\
.jy-scr{border-radius:18px;overflow:hidden;background:#09090b;max-height:440px;overflow-y:auto}\
.jy-scr::-webkit-scrollbar{width:2px}.jy-scr::-webkit-scrollbar-thumb{background:rgba(201,168,76,.12);border-radius:1px}\
.jy-tip{margin-top:.7rem;padding:.6rem .8rem;background:rgba(12,12,15,.95);border:1.5px solid rgba(201,168,76,.3);border-radius:10px;display:flex;align-items:flex-start;gap:.5rem;box-shadow:0 4px 16px rgba(0,0,0,.3);animation:jyTp 2.5s ease-in-out infinite}\
@keyframes jyTp{0%,100%{border-color:rgba(201,168,76,.3)}50%{border-color:rgba(201,168,76,.5)}}\
.jy-tip .ic{font-size:1rem;flex-shrink:0;margin-top:1px}\
.jy-tip .tx{font-size:.72rem;color:#e4e4e7;line-height:1.55;font-weight:600}\
.jy-tip .tx small{display:block;font-size:.6rem;color:rgba(228,228,231,.4);font-weight:400;margin-top:2px}\
.jy-arr{position:absolute;z-index:10;width:0;height:0;border-left:8px solid transparent;border-right:8px solid transparent;border-top:12px solid #c9a84c;filter:drop-shadow(0 2px 6px rgba(201,168,76,.3));animation:jyAr 1.2s ease-in-out infinite}\
@keyframes jyAr{0%,100%{transform:translateY(0)}50%{transform:translateY(5px)}}\
.jy-fgr{position:absolute;z-index:12;font-size:1.4rem;animation:jyFg 2s ease-in-out infinite;filter:drop-shadow(0 3px 8px rgba(0,0,0,.4))}\
@keyframes jyFg{0%,100%{transform:scale(1);opacity:.85}15%{transform:scale(.82);opacity:1}30%{transform:scale(1);opacity:.85}}\
.mn-nav{display:flex;align-items:center;justify-content:space-between;padding:7px 10px;background:rgba(9,9,11,.9)}\
.mn-nav .b{font-size:.6rem;color:#c9a84c;font-weight:600;display:flex;align-items:center;gap:3px}\
.mn-nav .s{font-size:.48rem;color:rgba(228,228,231,.4);border:1px solid rgba(255,255,255,.05);border-radius:5px;padding:1px 5px}\
.mn-hero{text-align:center;padding:18px 12px 10px;background:radial-gradient(ellipse at 50% 30%,rgba(80,60,160,.07),transparent 70%)}\
.mn-hero .mi{width:40px;height:40px;margin:0 auto 6px;border-radius:50%;background:radial-gradient(circle,rgba(201,168,76,.18),transparent);display:flex;align-items:center;justify-content:center;font-size:1.1rem}\
.mn-hero h2{font-size:.95rem;color:#e4e4e7;letter-spacing:.06em;margin-bottom:3px}\
.mn-hero .sub{font-size:.52rem;color:rgba(228,228,231,.4)}\
.mn-cta{display:block;width:80%;margin:8px auto 0;padding:8px;border-radius:22px;background:linear-gradient(135deg,#c9a84c,#b89530);color:#0a0a0c;font-size:.78rem;font-weight:700;text-align:center;border:none}\
.mn-qq{display:flex;flex-wrap:wrap;gap:3px;justify-content:center;margin-top:8px;padding:0 6px}\
.mn-qb{padding:3px 8px;border-radius:14px;border:1px solid rgba(201,168,76,.18);background:rgba(201,168,76,.03);font-size:.46rem;color:#c9a84c}\
.mn-cd{background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.05);border-radius:8px;padding:8px 10px;margin:5px 8px}\
.mn-ct{font-size:.55rem;color:#c9a84c;font-weight:600;margin-bottom:4px}\
.mn-inp{background:rgba(0,0,0,.28);border:1px solid rgba(255,255,255,.08);border-radius:6px;padding:6px 8px;font-size:.52rem;color:rgba(228,228,231,.5);width:100%}\
.mn-tl{background:rgba(255,255,255,.02);border:1px solid rgba(201,168,76,.12);border-radius:10px;padding:8px;margin:3px 8px;display:flex;align-items:center;gap:8px}\
.mn-tl.hi{border-color:rgba(201,168,76,.3)}\
.mn-tl .ico{width:30px;height:30px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:.85rem;background:rgba(201,168,76,.07);border:1px solid rgba(201,168,76,.12)}\
.mn-tl .nm{font-size:.62rem;color:#c9a84c;font-weight:700}\
.mn-tl .ds{font-size:.44rem;color:rgba(228,228,231,.4);line-height:1.35;margin-top:1px}\
.mn-tl .bg{font-size:.38rem;padding:1px 5px;border-radius:6px;background:rgba(76,175,80,.12);color:#66bb6a;margin-top:2px;display:inline-block}\
.mn-lb{font-size:.52rem;color:rgba(228,228,231,.5);margin:5px 0 2px;font-weight:600}\
.mn-pls{display:flex;gap:3px}\
.mn-pl{padding:4px 10px;border-radius:8px;font-size:.48rem;border:1px solid rgba(255,255,255,.08);color:rgba(228,228,231,.5)}\
.mn-pl.sl{border-color:rgba(201,168,76,.35);color:#c9a84c;background:rgba(201,168,76,.05)}\
.mn-rw{display:flex;gap:3px}\
.mn-rw .mn-inp{flex:1;text-align:center;padding:5px}\
.mn-wr{font-size:.42rem;color:#ef9a3c;background:rgba(239,154,60,.07);border:1px solid rgba(239,154,60,.12);border-radius:5px;padding:3px 6px;margin-top:3px;line-height:1.35}\
.mn-btn{display:block;width:calc(100% - 16px);margin:6px 8px;padding:8px;border-radius:10px;background:linear-gradient(135deg,#c9a84c,#a88832);color:#0a0a0c;text-align:center;font-size:.68rem;font-weight:700;border:none}\
.mn-sp{text-align:center;padding:6px 8px}\
.mn-sp .ht{font-size:.52rem;color:#c9a84c;animation:jyBr 2.5s ease-in-out infinite}\
@keyframes jyBr{0%,100%{opacity:.6}50%{opacity:1}}\
.mn-tcs{display:flex;gap:2px;justify-content:center;flex-wrap:wrap;margin:4px 0}\
.mn-tc{width:20px;height:30px;border-radius:2px;background:linear-gradient(135deg,rgba(201,168,76,.08),rgba(201,168,76,.03));border:1px solid rgba(201,168,76,.12)}\
.mn-tc.pk{background:linear-gradient(135deg,rgba(201,168,76,.3),rgba(201,168,76,.1));border-color:#c9a84c;transform:translateY(-2px);box-shadow:0 2px 8px rgba(201,168,76,.15)}\
.mn-ld{text-align:center;padding:14px}\
.mn-ld .av{width:90px;height:90px;margin:0 auto 6px;border-radius:10px;background:linear-gradient(135deg,rgba(201,168,76,.12),rgba(60,40,30,.3));display:flex;align-items:center;justify-content:center;font-size:2rem;box-shadow:0 6px 24px rgba(201,168,76,.08);animation:jyGl 3s ease-in-out infinite}\
@keyframes jyGl{0%,100%{box-shadow:0 6px 24px rgba(201,168,76,.08)}50%{box-shadow:0 6px 32px rgba(201,168,76,.2)}}\
.mn-ld .t{font-size:.6rem;color:#c9a84c;margin-top:3px}\
.mn-ld .s{font-size:.44rem;color:rgba(228,228,231,.4);margin-top:1px}\
.mn-res .ch{display:flex;gap:5px;margin-bottom:6px}\
.mn-res .av2{width:22px;height:22px;border-radius:50%;flex-shrink:0;background:linear-gradient(135deg,rgba(201,168,76,.2),rgba(201,168,76,.06))}\
.mn-res .bb{background:rgba(255,255,255,.025);border:1px solid rgba(255,255,255,.04);border-radius:0 8px 8px 8px;padding:6px 8px;flex:1}\
.mn-res .bb p{font-size:.44rem;color:rgba(228,228,231,.5);line-height:1.5}\
.mn-res .gd{color:#c9a84c;font-weight:600}\
.mn-res .sum{text-align:center;padding:5px;background:rgba(201,168,76,.03);border:1px solid rgba(201,168,76,.1);border-radius:8px;margin-bottom:6px}\
.mn-res .sum p{font-size:.52rem;color:#c9a84c;font-weight:700;line-height:1.5}\
.mn-fu{margin:5px 8px;padding:8px;border:1px solid rgba(201,168,76,.12);border-radius:10px;background:rgba(201,168,76,.02)}\
.mn-fu .ft{font-size:.52rem;color:#c9a84c;font-weight:700;margin-bottom:3px}\
.mn-fu .fd{font-size:.4rem;color:rgba(228,228,231,.4);margin-bottom:5px}\
.mn-fu .fb{float:right;padding:3px 8px;border-radius:6px;background:rgba(201,168,76,.08);border:1px solid rgba(201,168,76,.2);font-size:.44rem;color:#c9a84c;font-weight:600}\
.mn-cr{margin:5px 8px;padding:8px;border:1px solid rgba(201,168,76,.1);border-radius:10px}\
.mn-cr .ct{font-size:.52rem;color:#c9a84c;font-weight:700;margin-bottom:3px}\
.jy-div{width:36px;height:2px;background:rgba(201,168,76,.12);margin:1rem auto;border-radius:1px}\
.jy-cta{text-align:center;padding:1.5rem 1rem 2rem}\
.jy-cta .cb{display:inline-block;padding:.7rem 2rem;border-radius:12px;background:linear-gradient(135deg,#c9a84c,#a88832);color:#0a0a0c;font-size:.88rem;font-weight:700;text-decoration:none;cursor:pointer;border:none;font-family:"Noto Serif TC",serif;box-shadow:0 4px 20px rgba(201,168,76,.2);transition:all .25s}\
.jy-cta .cb:hover{transform:translateY(-2px);box-shadow:0 8px 28px rgba(201,168,76,.3)}\
.jy-hb{position:fixed;bottom:12px;left:12px;z-index:800;width:34px;height:34px;border-radius:50%;background:rgba(201,168,76,.08);border:1px solid rgba(201,168,76,.2);color:#c9a84c;font-size:.78rem;font-weight:700;cursor:pointer;transition:all .25s;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(6px)}\
.jy-hb:hover{background:rgba(201,168,76,.18);box-shadow:0 0 16px rgba(201,168,76,.12);transform:scale(1.08)}\
.jy-qov{position:fixed;inset:0;z-index:9998;background:rgba(5,5,8,.75);backdrop-filter:blur(10px);display:flex;align-items:center;justify-content:center;padding:1rem;opacity:0;transition:opacity .3s;pointer-events:none}\
.jy-qov.v{opacity:1;pointer-events:auto}\
.jy-qb{background:linear-gradient(160deg,#1c1c1f,#111113);border:1px solid rgba(201,168,76,.2);border-radius:12px;max-width:360px;width:100%;padding:1.2rem;box-shadow:0 16px 50px rgba(0,0,0,.5);animation:jyQin .3s cubic-bezier(.16,1,.3,1)}\
@keyframes jyQin{from{transform:translateY(20px) scale(.96);opacity:0}to{transform:none;opacity:1}}\
.jy-qb .qi{text-align:center;font-size:1.3rem;margin-bottom:.4rem}\
.jy-qb .qt{font-family:"Noto Serif TC",serif;font-size:.88rem;color:#dfc373;text-align:center;margin:0 0 .6rem}\
.jy-qb .qm{font-size:.78rem;color:rgba(228,228,231,.65);line-height:1.6;margin:0 0 1rem}\
.jy-qa{display:flex;gap:.5rem;justify-content:center}\
.jy-qa button{border-radius:8px;padding:.5rem 1rem;font-size:.78rem;font-weight:600;cursor:pointer;transition:all .2s;font-family:inherit}\
.jy-qc{background:rgba(201,168,76,.1);border:1px solid rgba(201,168,76,.25);color:#c9a84c}\
.jy-qc:hover{background:rgba(201,168,76,.18)}\
.jy-qe{background:linear-gradient(135deg,#c9a84c,#a88832);color:#0a0a0c;border:none}\
.jy-qe:hover{transform:translateY(-1px);box-shadow:0 3px 14px rgba(201,168,76,.2)}\
';
document.head.appendChild(css);

// ═══ Build Tutorial HTML ═══
// 2026-11-12：舊版使用教學（七維度、照片、站內解讀等已下架流程，約 28KB）已移除；
// 首次說明、複製提示與重看入口改由 first-guide.js 提供。這裡只留相容入口。
function showGuide(){ if(typeof window._jyFirstGuide==='function') window._jyFirstGuide(); }
function closeGuide(){}
window._showGuide=showGuide;
window._closeGuide=closeGuide;

// First visit
// ★ v73(歐那 2026/5/29)：關閉「首次進入自動彈出操作教學」。
//   原本首次無 _jy_guide_seen 就 600ms 後自動 showGuide()，現停用自動彈出。
//   教學本身保留——左下角 ? 按鈕仍可隨時手動開啟（見 _addHelpButton）。
//   （注意：此教學內容尚有「七套命理系統 / 七維度照片」等已下架字樣，待之後一併更新。）
// if(!localStorage.getItem('_jy_guide_seen')){
//   setTimeout(function(){showGuide()},600);
// }

// Help button
// ★ Bug WW 修補:body 可能還沒 ready(若 guide.js 放 <head>),加防呆
// ★ Bug AM 修補:檢查 .jy-hb 是否已存在,避免重複呼叫產生兩個按鈕
// ★ v74.1(歐那 2026/5/31)：左下角 ? 說明按鈕已移除，不再需要。
// function _addHelpButton(){ ... }
// _addHelpButton();

// ═══ Question Quality Modal ═══
var _qR=null;
function showQH(msg){
  return new Promise(function(resolve){
    // ★ Bug LL 修補:連點防護
    //   原本:_qR 是模組級變數,連續呼叫 showQH 會覆寫,第一次的 promise 永遠不 resolve
    //   情境:用戶連點兩次「直接送出」按鈕(第一次 modal 還在跑 await showQH)
    //         → 第二次 wrap 又呼叫 showQH → _qR 被覆寫 → 第一次的 promise 卡住
    //         → 導致 await 永遠不結束、後續 orig.apply 永遠不執行(用戶看 modal 關了卻無反應)
    //   修法:看到舊 _qR 還在,先 resolve(false)放掉舊 promise(視為「修改問題」放棄)
    if(_qR){
      try{_qR(false)}catch(_){}
      _qR=null;
    }
    _qR=resolve;
    var old=document.getElementById('jy-qov');if(old)old.parentNode.removeChild(old);
    var d=document.createElement('div');d.id='jy-qov';d.className='jy-qov';
    d.innerHTML='<div class="jy-qb"><div class="qi">\uD83C\uDF19</div><div class="qt">靜月的小建議</div><div class="qm">'+msg+'</div><div class="jy-qa"><button class="jy-qc" onclick="window._qA(true)">直接送出</button><button class="jy-qe" onclick="window._qA(false)">修改問題</button></div></div>';
    document.body.appendChild(d);
    requestAnimationFrame(function(){requestAnimationFrame(function(){d.classList.add('v')})});
  });
}
window._qA=function(go){
  var el=document.getElementById('jy-qov');if(el){el.classList.remove('v');setTimeout(function(){if(el.parentNode)el.parentNode.removeChild(el)},300)}
  // ★ Bug AH 修補:flag 在用戶真的回應(按按鈕)時才設
  //   原邏輯 line 428:flag 在 showQH 顯示前就設 → 用戶顯示後立刻刷新頁面(沒看到內容)
  //         → flag 已殘留 sessionStorage → 同分頁再提交差問題不會再提示
  //   修法:flag 移到 _qA(用戶按按鈕代表已看過提示)
  try{sessionStorage.setItem('_jy_q_hint_shown','1')}catch(_){}
  if(_qR){_qR(go);_qR=null}
};

// ═══ Wrap submits ═══
// ★ Bug JJ 修補:setInterval 加最大重試次數,避免找不到函式時永遠不釋放
//   雖然 ui.js 一定會有這兩個函式,但保險起見最多試 50 次(10 秒)後放棄
function wrap(fn){
  var attempts=0;
  var t=setInterval(function(){
    if(typeof window[fn]!=='function'){
      if(++attempts>=50){clearInterval(t);console.warn('[guide] wrap '+fn+' giveup after 10s')}
      return;
    }
    clearInterval(t);
    var orig=window[fn];
    window[fn]=async function(){
      var qEl=document.getElementById('f-question');
      var q=(qEl&&qEl.value)?qEl.value.trim():'';
      if(!q&&typeof window.selectedPresetQ==='string')q=window.selectedPresetQ.trim();
      if(!q){orig.apply(this,arguments);return}
      // ★ Bug II + AH 修補:flag 設在用戶按按鈕時(_qA 內),非顯示前
      //   Bug II 原邏輯:wrap 末尾無條件設 flag → 第二次品質差永遠不再攔截
      //   Bug AH 變體:flag 在 showQH 前就設 → 用戶顯示後刷新就錯失提示
      //   修法:wrap 不設 flag,只在 _qA 真實回應時設
      if(typeof _checkQuestionQuality==='function'&&!sessionStorage.getItem('_jy_q_hint_shown')){
        var hint=_checkQuestionQuality(q);
        if(hint){
          var go=await showQH(hint);
          if(!go){if(qEl){qEl.focus();qEl.select()}return}
        }
      }
      orig.apply(this,arguments);
    };
  },200);
}
wrap('submitWithTool');
wrap('submitTarotQuick');

})();
