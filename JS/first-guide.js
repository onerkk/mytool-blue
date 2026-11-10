/* 靜月之光・第一次使用指引 v1（2026-11-12）
 * 1) 首次進站：四步動畫說明整個流程（選方式 → 寫問題／資料 → 看盤面 → 複製提示詞貼到 AI）。
 * 2) 第一次看到「複製提示詞」按鈕：光圈＋提示泡泡指給使用者看。
 * 3) 複製按鈕在畫面下方時：浮動按鈕告訴他在下面，點了帶過去。（複製後的下一步說明沿用結果頁原有的。）
 * 左下角「?」說明鈕改開這份新指引（舊教學內容已過時）。
 * 只用 transform／opacity 動畫；尊重 prefers-reduced-motion；全部狀態存在 localStorage，讀寫失敗不影響使用。
 */
(function(){
  'use strict';
  if(window._jyFirstGuideLoaded)return;window._jyFirstGuideLoaded=true;
  var K_SEEN='_jy_first_guide_v1',K_COACH='_jy_copy_coach_v1';
  function get(k){try{return localStorage.getItem(k);}catch(_){return null;}}
  function set(k,v){try{localStorage.setItem(k,v);}catch(_){}}
  function el(tag,cls,html){var e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e;}

  var css=el('style');css.id='jy-fg-style';
  css.textContent=[
    '.jy-fg{position:fixed;inset:0;z-index:2147483000;display:flex;align-items:flex-end;justify-content:center;background:rgba(4,5,10,.72);opacity:0;transition:opacity .35s;pointer-events:none;-webkit-tap-highlight-color:transparent}',
    '.jy-fg.on{opacity:1;pointer-events:auto}',
    '.jy-fg-sheet{width:100%;max-width:460px;background:linear-gradient(180deg,#141624,#0b0c14);border:1px solid rgba(212,175,55,.28);border-bottom:0;border-radius:22px 22px 0 0;padding:18px 20px calc(18px + env(safe-area-inset-bottom));transform:translateY(40px);transition:transform .45s cubic-bezier(.16,1,.3,1);box-shadow:0 -18px 60px rgba(0,0,0,.6);color:#e9e6dc;font-family:inherit}',
    '.jy-fg.on .jy-fg-sheet{transform:none}',
    '.jy-fg-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:6px}',
    '.jy-fg-kicker{font-size:.84rem;letter-spacing:.12em;color:#e7c966;font-weight:600}',
    '.jy-fg-skip{background:none;border:0;color:rgba(233,230,220,.55);font-size:.82rem;padding:8px 4px;cursor:pointer}',
    '.jy-fg-stage{position:relative;height:150px;margin:6px 0 10px;border-radius:16px;background:radial-gradient(120% 90% at 50% 0%,rgba(212,175,55,.12),rgba(255,255,255,.02) 60%);border:1px solid rgba(255,255,255,.06);overflow:hidden}',
    '.jy-fg-scene{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;opacity:0;transform:translateX(24px);transition:opacity .4s,transform .45s cubic-bezier(.16,1,.3,1)}',
    '.jy-fg-scene.cur{opacity:1;transform:none}',
    '.jy-fg-h{font-size:1.12rem;font-weight:700;color:#f4e7bd;margin:2px 0 6px;line-height:1.4}',
    '.jy-fg-p{font-size:.9rem;line-height:1.7;color:rgba(233,230,220,.86);min-height:4.6em;margin:0}',
    '.jy-fg-p b{color:#f4e7bd;font-weight:600}',
    '.jy-fg-dots{display:flex;gap:6px;justify-content:center;margin:12px 0}',
    '.jy-fg-dots i{width:7px;height:7px;border-radius:50%;background:rgba(255,255,255,.18);transition:all .3s}',
    '.jy-fg-dots i.cur{width:20px;border-radius:4px;background:#d4af37}',
    '.jy-fg-btn{display:block;width:100%;padding:14px;border-radius:14px;border:0;background:linear-gradient(135deg,#f1dfa6,#c79f45);color:#1b1505;font-size:1rem;font-weight:700;letter-spacing:.04em;cursor:pointer}',
    '.jy-fg-btn:active{transform:scale(.98)}',
    /* 場景小元件 */
    '.fg-cards{display:flex;gap:8px}.fg-card{width:54px;height:70px;border-radius:9px;background:rgba(255,255,255,.05);border:1px solid rgba(212,175,55,.3);display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:.66rem;color:#e9e6dc;gap:4px}',
    '.fg-card span{font-size:1.25rem}.fg-card.pick{animation:fgPick 2.4s ease-in-out infinite}',
    '@keyframes fgPick{0%,35%,100%{transform:none;box-shadow:none}50%,80%{transform:translateY(-8px) scale(1.06);box-shadow:0 8px 24px rgba(212,175,55,.35);border-color:#f1dfa6}}',
    '.fg-finger{position:absolute;font-size:1.7rem;animation:fgTap 2.4s ease-in-out infinite;pointer-events:none}',
    '@keyframes fgTap{0%,20%{transform:translate(46px,54px);opacity:0}40%{transform:translate(8px,30px);opacity:1}50%{transform:translate(8px,30px) scale(.86)}60%,80%{transform:translate(8px,30px);opacity:1}100%{transform:translate(8px,30px);opacity:0}}',
    '.fg-input{width:78%;border-radius:12px;border:1px solid rgba(212,175,55,.35);background:rgba(0,0,0,.35);padding:12px 14px;font-size:.88rem;color:#f4e7bd;white-space:nowrap;overflow:hidden}',
    '.fg-type{display:inline-block;overflow:hidden;white-space:nowrap;vertical-align:bottom;width:0;animation:fgType 3.2s steps(11) infinite}',
    '@keyframes fgType{0%,8%{width:0}60%,100%{width:11em}}',
    '.fg-caret{display:inline-block;width:2px;height:1em;background:#d4af37;vertical-align:-2px;animation:fgBlink .8s steps(1) infinite}@keyframes fgBlink{50%{opacity:0}}',
    '.fg-board{width:80%;display:grid;gap:7px}.fg-row{height:14px;border-radius:7px;background:rgba(255,255,255,.08);transform-origin:left;animation:fgRow 3s ease-in-out infinite}',
    '.fg-row.k{background:linear-gradient(90deg,rgba(212,175,55,.75),rgba(212,175,55,.2));height:22px}.fg-row:nth-child(2){width:86%;animation-delay:.2s}.fg-row:nth-child(3){width:70%;animation-delay:.4s}.fg-row:nth-child(4){width:78%;animation-delay:.6s}',
    '@keyframes fgRow{0%,10%{transform:scaleX(0);opacity:0}35%,100%{transform:scaleX(1);opacity:1}}',
    '.fg-flow{display:flex;align-items:center;gap:10px;font-size:.74rem;color:#e9e6dc}.fg-chip{padding:10px 12px;border-radius:12px;border:1px solid rgba(212,175,55,.4);background:rgba(212,175,55,.1);text-align:center;line-height:1.4}',
    '.fg-chip.a{animation:fgPulse 2.6s ease-in-out infinite}.fg-chip.b{animation:fgPulse 2.6s ease-in-out .85s infinite}.fg-chip.c{animation:fgPulse 2.6s ease-in-out 1.7s infinite}',
    '@keyframes fgPulse{0%,60%,100%{transform:none;box-shadow:none}20%{transform:scale(1.09);box-shadow:0 0 0 6px rgba(212,175,55,.16)}}',
    '.fg-arrow{color:#d4af37;font-size:1rem}',
    /* 複製按鈕提示 */
    '.jy-coach-ring{position:fixed;z-index:2147482990;border-radius:16px;border:2px solid #f1dfa6;pointer-events:none;animation:jyCoach 1.5s ease-out infinite}',
    '@keyframes jyCoach{0%{box-shadow:0 0 0 0 rgba(241,223,166,.55)}100%{box-shadow:0 0 0 16px rgba(241,223,166,0)}}',
    '.jy-coach-tip{position:fixed;z-index:2147482991;max-width:300px;background:#f4e7bd;color:#1b1505;border-radius:12px;padding:10px 12px;font-size:.84rem;line-height:1.55;box-shadow:0 10px 30px rgba(0,0,0,.5);opacity:0;transform:translateY(6px);transition:all .3s}',
    '.jy-coach-tip.on{opacity:1;transform:none}.jy-coach-tip b{font-weight:700}.jy-coach-tip button{margin-top:6px;background:#1b1505;color:#f4e7bd;border:0;border-radius:8px;padding:6px 12px;font-size:.78rem;cursor:pointer}',
    '.jy-coach-pill{position:fixed;left:50%;bottom:calc(18px + env(safe-area-inset-bottom));transform:translate(-50%,20px);z-index:2147482989;background:linear-gradient(135deg,#f1dfa6,#c79f45);color:#1b1505;border:0;border-radius:999px;padding:12px 20px;font-size:.92rem;font-weight:700;box-shadow:0 10px 30px rgba(0,0,0,.55);opacity:0;transition:all .35s;cursor:pointer;white-space:nowrap}',
    '.jy-coach-pill.on{opacity:1;transform:translate(-50%,0);animation:jyPill 1.8s ease-in-out infinite}@keyframes jyPill{0%,100%{transform:translate(-50%,0)}50%{transform:translate(-50%,-5px)}}',
    '@media (prefers-reduced-motion:reduce){.jy-fg *,.jy-coach-ring,.jy-coach-pill{animation:none!important;transition:none!important}.fg-type{width:11em}.fg-row{transform:none;opacity:1}}'
  ].join('');
  document.head.appendChild(css);

  var STEPS=[
    {h:'一、選一種你想用的方式',p:'首頁有塔羅、八字、紫微等十多種。<b>不知道選哪個</b>，就按最上面的金色按鈕，從塔羅開始。',
     s:'<div class="fg-cards"><div class="fg-card pick"><span>🃏</span>塔羅</div><div class="fg-card"><span>☯</span>八字</div><div class="fg-card"><span>✦</span>紫微</div><div class="fg-card"><span>🌙</span>靈籤</div></div><div class="fg-finger">👆</div>'},
    {h:'二、寫下你想問的事',p:'問題寫得<b>越具體越好</b>，像是「他最近變冷淡，我該主動聯絡嗎？」。八字、紫微這類要另外填出生資料，照畫面一步一步做就好。',
     s:'<div class="fg-input"><span class="fg-type">我該主動聯絡他嗎？</span><span class="fg-caret"></span></div>'},
    {h:'三、看排出來的盤面',p:'抽完牌或排好盤，畫面會先給你<b>重點</b>，往下滑是細節。看不懂沒關係，真正的白話解讀在下一步。',
     s:'<div class="fg-board"><div class="fg-row k"></div><div class="fg-row"></div><div class="fg-row"></div><div class="fg-row"></div></div>'},
    {h:'四、複製提示詞，貼給 AI',p:'按<b>「複製提示詞」</b>，打開你平常用的 ChatGPT、Gemini 或 Claude，<b>貼上、送出</b>，就會得到完整的白話解讀和建議。全程免費。',
     s:'<div class="fg-flow"><div class="fg-chip a">複製<br>提示詞</div><span class="fg-arrow">→</span><div class="fg-chip b">打開<br>AI</div><span class="fg-arrow">→</span><div class="fg-chip c">貼上<br>送出</div></div>'}
  ];
  var wrap=null,idx=0;
  function render(){
    var scenes=wrap.querySelectorAll('.jy-fg-scene'),dots=wrap.querySelectorAll('.jy-fg-dots i');
    for(var i=0;i<scenes.length;i++){scenes[i].classList.toggle('cur',i===idx);dots[i].classList.toggle('cur',i===idx);}
    wrap.querySelector('.jy-fg-h').textContent=STEPS[idx].h;
    wrap.querySelector('.jy-fg-p').innerHTML=STEPS[idx].p;
    wrap.querySelector('.jy-fg-btn').textContent=idx===STEPS.length-1?'我知道了，開始':'下一步';
  }
  function close(){if(!wrap)return;wrap.classList.remove('on');set(K_SEEN,'1');var w=wrap;wrap=null;setTimeout(function(){if(w.parentNode)w.parentNode.removeChild(w);},400);}
  function open(){
    if(wrap)return;idx=0;
    wrap=el('div','jy-fg');wrap.setAttribute('role','dialog');wrap.setAttribute('aria-label','第一次使用說明');
    wrap.innerHTML='<div class="jy-fg-sheet"><div class="jy-fg-top"><span class="jy-fg-kicker">第一次來？三十秒看懂</span><button type="button" class="jy-fg-skip">略過</button></div>'+
      '<div class="jy-fg-stage">'+STEPS.map(function(s){return '<div class="jy-fg-scene">'+s.s+'</div>';}).join('')+'</div>'+
      '<h3 class="jy-fg-h"></h3><p class="jy-fg-p"></p><div class="jy-fg-dots">'+STEPS.map(function(){return '<i></i>';}).join('')+'</div>'+
      '<button type="button" class="jy-fg-btn"></button></div>';
    document.body.appendChild(wrap);render();
    requestAnimationFrame(function(){requestAnimationFrame(function(){if(wrap)wrap.classList.add('on');});});
    wrap.querySelector('.jy-fg-skip').addEventListener('click',close);
    wrap.querySelector('.jy-fg-btn').addEventListener('click',function(){if(idx<STEPS.length-1){idx++;render();}else close();});
    wrap.addEventListener('click',function(e){if(e.target===wrap)close();});
    var x0=null;var stage=wrap.querySelector('.jy-fg-sheet');
    stage.addEventListener('touchstart',function(e){x0=e.touches[0].clientX;},{passive:true});
    stage.addEventListener('touchend',function(e){if(x0==null)return;var dx=e.changedTouches[0].clientX-x0;x0=null;if(Math.abs(dx)<50)return;if(dx<0&&idx<STEPS.length-1){idx++;render();}else if(dx>0&&idx>0){idx--;render();}},{passive:true});
  }
  // ── 漏填欄位：框起來並捲到眼前（各工具驗證失敗時呼叫 window.jyMarkField(欄位或 id)）──
  window.jyMarkField=function(x){
    try{
      var el=typeof x==='string'?document.getElementById(x):x;if(!el)return;
      var t=el;
      if(t.type==='hidden'||t.offsetParent===null){
        t=null;var id=el.id||'';
        var cand=id?document.querySelector('[data-target="'+id+'"],[data-input="'+id+'"],[aria-controls="'+id+'"],label[for="'+id+'"]'):null;
        if(cand&&cand.offsetParent!==null)t=cand;
        var p=el.parentElement,depth=0;
        while(!t&&p&&depth<4){var b=p.querySelector('button,select,input:not([type=hidden]),textarea');if(b&&b.offsetParent!==null&&p.querySelectorAll('button,select,input:not([type=hidden]),textarea').length<=3){t=b;break;}if(p.offsetParent!==null&&depth>=1){t=p;break;}p=p.parentElement;depth++;}
      }
      if(!t)return;
      t.style.outline='2px solid #e8a33c';t.style.outlineOffset='3px';t.style.boxShadow='0 0 0 6px rgba(232,163,60,.18)';
      setTimeout(function(){try{t.scrollIntoView({behavior:'smooth',block:'center'});}catch(_){}},350);
      var clear=function(){t.style.outline='';t.style.outlineOffset='';t.style.boxShadow='';t.removeEventListener('click',clear);t.removeEventListener('input',clear);};
      t.addEventListener('click',clear);t.addEventListener('input',clear);setTimeout(clear,12000);
    }catch(_){}
  };
  window._jyFirstGuide=open;
  // 「?」說明鈕與舊入口一律開新指引
  window._showGuide=open;

  function introBusy(){var i=document.getElementById('jy-cinematic-intro');if(!i)return false;var s=getComputedStyle(i);return s.display!=='none'&&s.visibility!=='hidden'&&parseFloat(s.opacity||'1')>0.05&&i.getBoundingClientRect().height>40;}
  function maybeOpen(tries){
    if(get(K_SEEN))return;
    if(document.hidden||introBusy()||document.querySelector('.jy-gov.v')){if(tries<60)setTimeout(function(){maybeOpen(tries+1);},1000);return;}
    open();
  }
  // 首頁放一個隨時可重看的入口（原本的「?」說明鈕早已停用，看過一次就找不到說明了）。
  function addReopen(){
    if(document.querySelector('.jy-fg-reopen'))return;
    var anchor=document.querySelector('#home-cta-btn');if(!anchor||!anchor.parentNode)return;
    var link=document.querySelector('.at-text-link');
    var b=el('button','jy-fg-reopen','第一次用？30 秒看懂怎麼玩');b.type='button';
    b.style.cssText='display:block;margin:10px auto 0;background:none;border:0;color:#e7c966;font-size:.86rem;letter-spacing:.04em;text-decoration:underline;text-underline-offset:4px;padding:8px 10px;cursor:pointer';
    b.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();open();});
    var host=(link&&link.parentNode)||anchor.parentNode;
    if(link&&link.nextSibling)host.insertBefore(b,link.nextSibling);else host.appendChild(b);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(addReopen,800);});else setTimeout(addReopen,800);
  window.addEventListener('load',function(){setTimeout(addReopen,1500);});
  if(document.readyState==='complete')setTimeout(function(){maybeOpen(0);},1400);
  else window.addEventListener('load',function(){setTimeout(function(){maybeOpen(0);},1400);});

  // ── 複製提示詞按鈕：第一次出現時指給使用者看 ──
  function isCopyBtn(b){if(b.closest&&b.closest('.jy-coach-pill,.jy-coach-tip,.jy-fg'))return false;var t=(b.innerText||b.textContent||'').replace(/\s/g,'');return /複製/.test(t)&&/(提示詞|AI|解讀|解籤)/.test(t)&&!/診斷|手動|查看|無法/.test(t)&&t.length<=24;}
  function visible(b){var r=b.getBoundingClientRect();return r.width>40&&r.height>20&&r.top>60&&r.bottom<innerHeight-10;}
  // 六壬、姓名等工具的房間層級比任何 z-index 都高（最上層的固定層／dialog），提示放在 body 會被蓋住；所以放進按鈕所在的最外層固定容器裡。
  function hostOf(b){var h=null,n=b&&b.parentElement;while(n&&n!==document.body&&n!==document.documentElement){var tag=n.tagName,cs=null;try{cs=getComputedStyle(n);}catch(_){}if((tag==='DIALOG'&&n.open)||n.hasAttribute('popover')||(cs&&cs.position==='fixed'))h=n;n=n.parentElement;}return h||document.body;}
  var ring=null,tip=null,target=null;
  function clearCoach(done){if(ring&&ring.parentNode)ring.parentNode.removeChild(ring);if(tip&&tip.parentNode)tip.parentNode.removeChild(tip);ring=tip=target=null;if(done)set(K_COACH,'1');}
  function place(){if(!target||!target.isConnected||!visible(target)){clearCoach(false);return;}var r=target.getBoundingClientRect();
    ring.style.cssText='left:'+(r.left-5)+'px;top:'+(r.top-5)+'px;width:'+(r.width+10)+'px;height:'+(r.height+10)+'px';
    var w=Math.min(300,innerWidth-24),left=Math.max(12,Math.min(innerWidth-w-12,r.left+r.width/2-w/2));tip.style.width=w+'px';tip.style.left=left+'px';
    var th=tip.offsetHeight||90;tip.style.top=(r.top-th-14>70?r.top-th-14:r.bottom+14)+'px';}
  function coach(b){
    if(get(K_COACH)||target||wrap)return;target=b;
    ring=el('div','jy-coach-ring');tip=el('div','jy-coach-tip','<b>最後一步在這裡</b><br>按這顆複製，再貼到 ChatGPT、Gemini 或 Claude 送出，就能看到完整的白話解讀。<br><button type="button">知道了</button>');
    var host=hostOf(b);host.appendChild(ring);host.appendChild(tip);place();if(!tip)return;requestAnimationFrame(function(){if(tip)tip.classList.add('on');});
    tip.querySelector('button').addEventListener('click',function(){clearCoach(true);});
  }
  // 複製按鈕常在結果頁下方兩三個畫面：還沒滑到時，先用浮動按鈕告訴他在下面，點了直接帶過去。
  var pill=null;
  function hidePill(){if(pill&&pill.parentNode)pill.parentNode.removeChild(pill);pill=null;}
  function showPill(b){if(pill)return;pill=el('button','jy-coach-pill','複製提示詞在下面，帶我過去 ↓');pill.type='button';hostOf(b).appendChild(pill);requestAnimationFrame(function(){if(pill)pill.classList.add('on');});
    pill.addEventListener('click',function(){hidePill();try{b.scrollIntoView({block:'center',behavior:'smooth'});}catch(_){b.scrollIntoView();}setTimeout(queue,700);});}
  var scanT=null;
  function scan(){scanT=null;if(wrap)return;if(target){place();return;}if(get(K_COACH)){hidePill();return;}
    var bs=document.querySelectorAll('button,a,[role=button]'),below=null;
    for(var i=0;i<bs.length;i++){if(!isCopyBtn(bs[i]))continue;var r=bs[i].getBoundingClientRect();if(r.width<40||r.height<20)continue;if(visible(bs[i])){hidePill();coach(bs[i]);return;}if(r.top>=innerHeight-10&&!below)below=bs[i];}
    if(below)showPill(below);else hidePill();}
  function queue(){if(!scanT)scanT=setTimeout(scan,350);}
  try{new MutationObserver(queue).observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['class','style']});}catch(_){}
  // 八字、紫微等工具是在自己的捲動容器裡捲，scroll 不會冒泡到 window，所以用 capture 收。
  document.addEventListener('scroll',queue,{passive:true,capture:true});window.addEventListener('resize',queue);

  // 按下複製後的「下一步」說明，結果頁原本就有（提示詞已複製・接下來三步），這裡不重複顯示。
  document.addEventListener('click',function(e){
    var b=e.target&&e.target.closest?e.target.closest('button,a,[role=button]'):null;if(!b||!isCopyBtn(b))return;
    clearCoach(true);hidePill();
  },true);
})();
