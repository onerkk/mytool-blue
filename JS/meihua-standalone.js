/*! meihua-standalone.js — 靜月之光 梅花易數獨立流程  [v80.41]
 *  v80.39(2026/6/12)：分享卡補爻線——payload 加 lines（本卦＝下上卦 li 串接、互卦取2-4/3-5爻、
 *    變卦＝動爻翻轉，與 calcMH 同式）與 dong；配合 share-card v2.2 直繪六爻卦象。
 *  v80.38(2026/6/12 歐那)：實測第二輪回饋三項根治——
 *    ①蝦皮連結改「犧牲行」結構：網址倒數第二行、最後固定一句收尾話墊後。兩輪實測輸出末端都黏不可見
 *      Unicode（U+2060 等），文獻證實為 AI 生成/渲染/剪貼簿管線副產物、提示詞原理上攔不住；雜訊永遠黏在
 *      輸出最末端，故網址不可當末行——收尾句當犧牲行吃掉雜訊，網址行保持乾淨可點。
 *    ②生剋力道：體克用/體生用補「用旺衰」雙向分支（鐵律③明言體用都要看，原版這兩支只看體；
 *      本輪實測「體囚剋用旺」只標出體弱、漏了用旺加重費勁）。
 *    ③動爻爻位參考行（《繫辭傳下》：初難知/二多譽/三多凶/四多懼/五多功/上易知）——實測輸出
 *      跳過動爻層位不讀，根因是資料區沒給；資料直給＋鐵律⑧納入主線。
 *  v80.37(2026/6/12 歐那)：應期正統化＋體用原文定性——
 *    ①應期改《占卦訣》原典斷法：「事應於生體卦氣之日、敗於剋體卦氣之日」，吉應（生體＋體旺之氣）／敗應（剋體之氣）
 *      分開給最近窗，另給「用近／互中／變遠」層次；廢除「用卦五行→季節」應期法（非原典，僅保留為事情節奏參考）。
 *    ②鐵律②吉凶定性對齊《體用總訣》原文：體剋用＝諸事吉（原「小吉」會系統性壓低吉度）、用剋體＝諸事凶、
 *      體生用＝耗失之患、用生體＝進益之喜、比和＝百事順遂；鐵律⑦改吃資料區吉應／敗應、禁自創應期算法。
 *    ③生剋力道行中性化：移除「該收手別再貼」等預下結論句（曾與變卦轉好行互相打架），結論統一由鐵律合成。
 *    ④蝦皮連結改「獨立成行＋末字雙保險」（實測輸出曾在網址後黏不可見字元致連結失效；複製模式無法程式後處理，僅能強化指令）。
 *  v80.34(2026/6/10)：防線統一——⑩補盤外資訊禁令、選石補嚴禁並列（與八字/紫微同步，紫微未設防實測曾全面復發）
 *  v80.33(2026/6/10)：①互卦對體生剋資料行（體用總訣「他卦者，謂用互變也」——原本只給互卦名、要 AI 自己算，這次實測就漏了）②最近應期窗（斷占總訣寅卯木…辰戌丑未土，節氣近似換月）③完整性清單加「正文無指令字眼」④fallback 註解誠實化
 *  歐那 2026/6/6：梅花要跟雷諾曼一樣，自成一頁、乾淨、不出現其他入口、無多餘說明，並有自己的過場動畫。
 *  做法：完全比照 lenormand.js 的「自包覆獨立頁 + 組好提示詞複製去 AI」模式。
 *  引擎：直接呼叫既有全域 calcMH()（meihua_upgrade.js 已載入），不重造起卦邏輯。
 *  起卦法：時間起卦（預設，需 Lunar.Solar）／數字起卦（報上下數，加當下時辰定動爻）。
 *  只需部署本檔 + ui.js（_meihuaOpen 改接本檔）+ index.html（掛 script + 版本號）。
 */
(function () {
  'use strict';

  var GOLD = '#c9a84c';
  // 八卦顯示（先天序 1乾…8坤 對應 calcMH gByN）；符號供過場動畫用
  var BAGUA_SYM = ['☰','☱','☲','☳','☴','☵','☶','☷'];
  var BAGUA_NAME = ['乾','兌','離','震','巽','坎','艮','坤'];

  var AI_LIST = [
    {id:'chatgpt',name:'ChatGPT',url:'https://chatgpt.com/'},
    {id:'claude',name:'Claude',url:'https://claude.ai/new'},
    {id:'gemini',name:'Gemini',url:'https://gemini.google.com/app'},
    {id:'grok',name:'Grok',url:'https://grok.x.ai/'},
    {id:'deepseek',name:'DeepSeek',url:'https://chat.deepseek.com/'},
    {id:'kimi',name:'Kimi',url:'https://kimi.moonshot.cn/'},
    {id:'doubao',name:'豆包',url:'https://www.doubao.com/'},
    {id:'metaai',name:'Meta AI',url:'https://www.meta.ai/'},
    {id:'copilot',name:'Copilot',url:'https://copilot.microsoft.com/'},
    {id:'perplexity',name:'Perplexity',url:'https://www.perplexity.ai/'}
  ];

  // 用神（用卦）五行 → 事情節奏（v80.37 正統化：只定快慢性質、不再給應期月份——
  // 應期月份照《占卦訣》「事應於生體卦氣之日、敗於剋體卦氣之日」另行計算）
  var WX_TIMING = {
    木:'事情走「成長／推進」的節奏，速度中快',
    火:'事情走「曝光／情緒／主動」的節奏，速度快',
    土:'事情走「穩定／拖延／承擔」的節奏，速度慢',
    金:'事情走「決斷／切割／壓力」的節奏，速度中等',
    水:'事情走「流動／變數／等待」的節奏，速度慢'
  };

  var _mhWrap = null;
  var _mhPhase = 'input';   // input | result
  var _mhMethod = 'time';   // time | num | char
  var _mhQuestion = '';
  var _mhUpNum = '';        // 數字起卦：上數
  var _mhLoNum = '';        // 數字起卦：下數
  var _mhText = '';         // 漢字起卦：中文字
  var _mhResult = null;     // calcMH 回傳
  var _lastPrompt = '';

  // ════════════════════════════════════════════════════════
  //  容器 + CSS（命名空間 mhx-，自帶不依賴 style.css）
  // ════════════════════════════════════════════════════════
  function _getWrap() {
    if (_mhWrap) return _mhWrap;
    _mhWrap = document.createElement('div');
    _mhWrap.id = 'mhx-screen';
    _mhWrap.style.cssText = 'display:none;position:fixed;top:0;left:0;right:0;bottom:0;width:100%;height:100%;z-index:99999;overflow-y:auto;overflow-x:hidden;background:#0a0a0f;-webkit-overflow-scrolling:touch;';
    document.body.appendChild(_mhWrap);
    var css = document.createElement('style');
    css.textContent = [
      '#mhx-screen *{box-sizing:border-box}',
      '.mhx-container{max-width:480px;margin:0 auto;padding:1rem .8rem 3rem;font-family:"Noto Serif TC",Georgia,serif;color:#e8e0d0}',
      '.mhx-header{text-align:center;padding:1.5rem 0 1rem}',
      '.mhx-header h1{font-size:1.5rem;color:'+GOLD+';letter-spacing:8px;margin-bottom:.3rem}',
      '.mhx-header p{font-size:.75rem;color:rgba(232,224,208,.5);letter-spacing:2px}',
      '.mhx-back{color:rgba(232,224,208,.5);text-decoration:none;font-size:.82rem;display:inline-block;margin-bottom:.5rem;cursor:pointer}',
      '.mhx-section{background:#13131a;border:1px solid rgba(201,168,76,.15);border-radius:14px;padding:1.1rem;margin-bottom:.8rem}',
      '.mhx-section-title{font-size:.82rem;color:'+GOLD+';margin-bottom:.7rem}',
      '.mhx-q-input{width:100%;padding:.65rem;border-radius:10px;border:1px solid rgba(201,168,76,.3);background:rgba(255,255,255,.03);color:#e8e0d0;font-family:inherit;font-size:.85rem;resize:none;outline:none;line-height:1.6}',
      '.mhx-q-input::placeholder{color:rgba(232,224,208,.4)}',
      '.mhx-q-input:focus{border-color:rgba(201,168,76,.5);box-shadow:0 0 12px rgba(201,168,76,.1)}',
      '.mhx-method-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:.4rem}',
      '.mhx-method-btn{padding:.6rem .4rem;border-radius:10px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.03);color:rgba(232,224,208,.5);cursor:pointer;transition:all .2s;text-align:center;font-family:inherit;font-size:.82rem}',
      '.mhx-method-btn.active{border-color:rgba(201,168,76,.5);background:rgba(201,168,76,.08);color:'+GOLD+'}',
      '.mhx-num-row{display:grid;grid-template-columns:1fr 1fr;gap:.5rem;margin-top:.7rem}',
      '.mhx-num-row input{width:100%;padding:.6rem;border-radius:10px;border:1px solid rgba(201,168,76,.3);background:rgba(255,255,255,.03);color:#e8e0d0;font-family:inherit;font-size:.95rem;text-align:center;outline:none}',
      '.mhx-num-row input:focus{border-color:rgba(201,168,76,.5)}',
      '.mhx-char-row{margin-top:.7rem}',
      '.mhx-char-row input{width:100%;padding:.6rem;border-radius:10px;border:1px solid rgba(201,168,76,.3);background:rgba(255,255,255,.03);color:#e8e0d0;font-family:inherit;font-size:1rem;text-align:center;outline:none;letter-spacing:2px}',
      '.mhx-char-row input:focus{border-color:rgba(201,168,76,.5)}',
      '.mhx-hint{font-size:.7rem;color:rgba(232,224,208,.45);margin-top:.6rem;line-height:1.6;text-align:center}',
      '.mhx-cast-btn{display:block;width:100%;padding:.85rem;border-radius:12px;border:1.5px solid rgba(201,168,76,.5);background:linear-gradient(135deg,rgba(201,168,76,.12),rgba(201,168,76,.04));color:'+GOLD+';font-family:inherit;font-size:.95rem;font-weight:600;letter-spacing:4px;cursor:pointer;transition:all .3s;margin-top:.8rem}',
      '.mhx-cast-btn:active{transform:scale(.97)}',
      // 卦象顯示
      '.mhx-gua-row{display:grid;grid-template-columns:repeat(3,1fr);gap:.5rem;margin:.4rem 0 .2rem}',
      '.mhx-gua{border:1px solid rgba(201,168,76,.22);border-radius:12px;background:linear-gradient(145deg,rgba(30,25,15,.9),rgba(20,15,10,.95));padding:.6rem .35rem;text-align:center;animation:mhxIn .45s ease-out both}',
      '@keyframes mhxIn{from{opacity:0;transform:translateY(12px) scale(.92)}to{opacity:1;transform:none}}',
      '.mhx-gua .role{font-size:.6rem;color:rgba(232,224,208,.45);letter-spacing:1px}',
      '.mhx-gua .gname{font-size:1.05rem;color:#ffeab8;font-family:"Noto Serif TC",serif;margin:.15rem 0 .05rem;line-height:1.2}',
      '.mhx-gua .gel{font-size:.62rem;color:'+GOLD+'}',
      '.mhx-ty{margin-top:.7rem;padding:.7rem .8rem;border-radius:11px;border:1px solid rgba(201,168,76,.2);background:rgba(201,168,76,.04);text-align:center}',
      '.mhx-ty .rel{font-family:"Noto Serif TC",serif;font-size:1rem;color:'+GOLD+';letter-spacing:2px}',
      '.mhx-ty .luck{display:inline-block;margin-left:.4rem;font-size:.72rem;padding:1px 8px;border-radius:999px;background:rgba(201,168,76,.15);color:#ffeab8}',
      '.mhx-ty .luck.bad{background:rgba(239,138,138,.14);color:#ef9a9a}',
      '.mhx-ty .desc{font-size:.74rem;color:rgba(232,224,208,.6);margin-top:.35rem;line-height:1.55}',
      '.mhx-dong{text-align:center;font-size:.7rem;color:rgba(232,224,208,.5);margin-top:.5rem}',
      // AI 卡（比照雷諾曼）
      '.mhx-ai-card{background:linear-gradient(135deg,rgba(30,25,15,.95),rgba(20,15,8,.98));border:1px solid rgba(201,168,76,.3);border-radius:14px;padding:1rem;margin-top:1rem;text-align:center;animation:mhxIn .6s ease-out}',
      '.mhx-ai-title{font-size:.95rem;color:'+GOLD+';letter-spacing:3px;margin-bottom:.5rem}',
      '.mhx-ai-desc{font-size:.72rem;color:rgba(232,224,208,.5);line-height:1.6;margin-bottom:.7rem}',
      '.mhx-ai-copy-btn{display:block;width:100%;padding:.75rem;border-radius:12px;border:1.5px solid rgba(201,168,76,.5);background:linear-gradient(135deg,rgba(201,168,76,.12),rgba(201,168,76,.04));color:'+GOLD+';font-family:inherit;font-size:.88rem;font-weight:600;letter-spacing:3px;cursor:pointer;transition:all .3s;margin-bottom:.5rem}',
      '.mhx-ai-copy-btn:active{transform:scale(.97)}',
      '.mhx-ai-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:.3rem;margin:.5rem 0}',
      '.mhx-ai-sc{display:flex;flex-direction:column;align-items:center;gap:.2rem;padding:.35rem .1rem;border-radius:10px;border:1px solid rgba(255,255,255,.06);background:rgba(255,255,255,.02);cursor:pointer;transition:all .2s;font-family:inherit}',
      '.mhx-ai-sc:active{transform:scale(.91)}',
      '.mhx-ai-sc img{width:30px;height:30px;border-radius:8px}',
      '.mhx-ai-sc span{font-size:.55rem;color:rgba(232,224,208,.5);font-weight:600}',
      '.mhx-ai-foot{font-size:.6rem;color:rgba(232,224,208,.4);margin-top:.3rem;font-style:italic}',
      '.mhx-reset-btn{display:inline-block;padding:.45rem 1rem;border-radius:10px;border:1px solid rgba(255,255,255,.1);background:transparent;color:rgba(232,224,208,.5);cursor:pointer;font-family:inherit;font-size:.78rem;margin-top:.8rem}',
      '.mhx-footer{text-align:center;font-size:.6rem;color:rgba(232,224,208,.4);margin-top:1.5rem;letter-spacing:1px;line-height:1.8}',
      // ── 起卦過場動畫 ──
      '.mhx-load{position:fixed;inset:0;z-index:100000;display:flex;flex-direction:column;align-items:center;justify-content:center;background:radial-gradient(120% 90% at 50% 30%,rgba(46,36,12,.5),rgba(12,9,5,.97) 62%,#0a0704 100%);overflow:hidden}',
      '.mhx-stars{position:absolute;inset:0;pointer-events:none;overflow:hidden}',
      '.mhx-stars i{position:absolute;bottom:-6%;width:2px;height:2px;border-radius:50%;background:rgba(212,175,55,.7);box-shadow:0 0 6px rgba(212,175,55,.6);animation:mhxRise var(--d,5s) linear var(--dl,0s) infinite;opacity:0}',
      '@keyframes mhxRise{0%{transform:translateY(0) scale(.6);opacity:0}12%{opacity:.9}88%{opacity:.7}100%{transform:translateY(-108vh) scale(1);opacity:0}}',
      '.mhx-ring{position:relative;width:min(300px,80vw);aspect-ratio:1;display:flex;align-items:center;justify-content:center;opacity:0;transform:scale(.9);animation:mhxRingIn .7s cubic-bezier(.16,1,.3,1) forwards}',
      '@keyframes mhxRingIn{to{opacity:1;transform:scale(1)}}',
      // 八卦環的八個符號
      '.mhx-tri{position:absolute;left:50%;top:50%;font-size:1.5rem;color:rgba(212,175,55,.4);font-family:serif;transform:translate(-50%,-50%) rotate(var(--a)) translateY(calc(min(150px,40vw) * -1)) rotate(calc(var(--a) * -1)) scale(.6);opacity:0;animation:mhxTri .5s ease forwards;animation-delay:var(--td,0s);text-shadow:0 0 10px rgba(212,175,55,.4)}',
      '@keyframes mhxTri{to{opacity:1;transform:translate(-50%,-50%) rotate(var(--a)) translateY(calc(min(150px,40vw) * -1)) rotate(calc(var(--a) * -1)) scale(1)}}',
      // 中央太極
      '.mhx-taiji{width:96px;height:96px;border-radius:50%;position:relative;opacity:0;animation:mhxTaijiIn .9s ease .6s forwards,mhxSpin 7s linear 1.1s infinite;background:conic-gradient(from 0deg,#f4ecd6 0deg 180deg,#1a140a 180deg 360deg);box-shadow:0 0 40px rgba(212,175,55,.45),inset 0 0 20px rgba(0,0,0,.4)}',
      '@keyframes mhxTaijiIn{to{opacity:1}}',
      '@keyframes mhxSpin{to{transform:rotate(360deg)}}',
      '.mhx-taiji::before,.mhx-taiji::after{content:"";position:absolute;left:50%;width:48px;height:48px;border-radius:50%;transform:translateX(-50%)}',
      '.mhx-taiji::before{top:0;background:#f4ecd6}',
      '.mhx-taiji::after{bottom:0;background:#1a140a}',
      '.mhx-taiji span{position:absolute;left:50%;width:16px;height:16px;border-radius:50%;transform:translateX(-50%);z-index:2}',
      '.mhx-taiji span.y{top:16px;background:#1a140a}',
      '.mhx-taiji span.n{bottom:16px;background:#f4ecd6}',
      '.mhx-load-status{margin-top:1.6rem;font-family:"Noto Serif TC",serif;font-size:1.05rem;font-weight:700;color:'+GOLD+';letter-spacing:.12em;text-shadow:0 2px 14px rgba(0,0,0,.6);transition:opacity .3s;min-height:1.4rem;text-align:center}',
      '.mhx-load-sub{margin-top:.4rem;font-size:.74rem;color:rgba(212,175,55,.55);letter-spacing:.08em;transition:opacity .3s;min-height:1.1rem;text-align:center}'
    ].join('\n');
    document.head.appendChild(css);
  // ═══ 鎏金夜祭 v2（2026/6/18）：主 CTA 採靜態鎏金底＋transform-only 獨立流光層，避免 Android/Samsung 對 background-position 動畫漏畫按鈕 ═══
  try{var _g2=document.createElement('style');_g2.setAttribute('data-jy-gilt2','meihua');_g2.textContent='.mhx-section{background:linear-gradient(180deg,rgba(24,20,14,.78),rgba(14,12,9,.86));border:1px solid rgba(201,168,76,.2);border-radius:18px;box-shadow:0 18px 40px rgba(0,0,0,.45),inset 0 1px 0 rgba(245,231,184,.14);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px)}.mhx-section-title{position:relative;padding-left:12px;letter-spacing:.08em;color:#e8d28a}.mhx-section-title::before{content:"";position:absolute;left:0;top:50%;transform:translateY(-50%);width:3px;height:1.05em;border-radius:2px;background:rgba(154,184,122,.9);box-shadow:0 0 8px rgba(154,184,122,.9)}.mhx-q-input,.mhx-section input,.mhx-section select,.mhx-section textarea{background:rgba(8,7,5,.62);border:1px solid rgba(201,168,76,.26);border-radius:12px;color:#f2e9d6;transition:border-color .2s,box-shadow .2s}.mhx-q-input:focus,.mhx-section input:focus,.mhx-section select:focus,.mhx-section textarea:focus{border-color:#e8d28a;box-shadow:0 0 0 3px rgba(201,168,76,.16);outline:none}.mhx-method-btn{background:rgba(201,168,76,.06);border:1px solid rgba(201,168,76,.22);color:#d8c79a;border-radius:12px;transition:color .18s,background-color .18s,border-color .18s,box-shadow .18s,transform .18s}.mhx-method-btn.active{background:linear-gradient(135deg,#e8d28a,#c9a84c);color:#171208;border-color:transparent;box-shadow:0 6px 18px rgba(201,168,76,.28);font-weight:700}.mhx-cast-btn{background:linear-gradient(135deg,#a98232 0%,#e8d28a 44%,#f5e7b8 58%,#c9a84c 100%);color:#171208;border:none;border-radius:14px;font-weight:800;letter-spacing:.14em;box-shadow:0 10px 26px rgba(201,168,76,.32),inset 0 1px 0 rgba(255,255,255,.35);position:relative;overflow:hidden;isolation:isolate}.mhx-cast-btn::before{content:none;display:none}.mhx-cast-btn:active{transform:translateY(1px)}.mhx-reset-btn{background:transparent;border:1px solid rgba(201,168,76,.34);color:#cdb87f;border-radius:12px}.mhx-back{color:rgba(232,210,138,.75)}.mhx-back:hover{color:#f5e7b8}.mhx-ai-card{background:linear-gradient(180deg,rgba(24,20,14,.78),rgba(14,12,9,.86));border:1px solid rgba(201,168,76,.2);border-radius:18px;box-shadow:0 18px 40px rgba(0,0,0,.45),inset 0 1px 0 rgba(245,231,184,.14);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px)}@supports not (backdrop-filter:blur(1px)){[data-jy-view-meihua]{}}.mhx-cast-btn:focus-visible{outline:2px solid #e8d28a;outline-offset:2px}';document.head.appendChild(_g2);}catch(e){}
    return _mhWrap;
  }

  // ════════════════════════════════════════════════════════
  //  畫面
  // ════════════════════════════════════════════════════════
  function _render() {
    var w = _getWrap();
    var h = '<div class="mhx-container">';
    h += '<a class="mhx-back" onclick="_meihuaClose()">← 返回靜月之光</a>';
    h += '<div class="mhx-header"><h1>梅 花 易 數</h1><p>體用五行 ・ 本互變三象</p></div>';

    if (_mhPhase === 'input') {
      h += '<div class="mhx-section"><div class="mhx-section-title">✦ 你想問什麼？</div>';
      h += '<textarea class="mhx-q-input" id="mhx-q" rows="2" maxlength="200" placeholder="問越具體越準——例如：這個案子推得動嗎？">' + (_mhQuestion||'') + '</textarea></div>';

      h += '<div class="mhx-section"><div class="mhx-section-title">✦ 起卦方式</div><div class="mhx-method-grid">';
      h += '<button class="mhx-method-btn' + (_mhMethod==='time'?' active':'') + '" onclick="_mhSetMethod(\'time\')">時間起卦<br><span style="font-size:.58rem;opacity:.6">以當下時間</span></button>';
      h += '<button class="mhx-method-btn' + (_mhMethod==='num'?' active':'') + '" onclick="_mhSetMethod(\'num\')">數字起卦<br><span style="font-size:.58rem;opacity:.6">報上下兩數</span></button>';
      h += '<button class="mhx-method-btn' + (_mhMethod==='char'?' active':'') + '" onclick="_mhSetMethod(\'char\')">漢字起卦<br><span style="font-size:.58rem;opacity:.6">中文字筆畫</span></button>';
      h += '</div>';
      if (_mhMethod === 'num') {
        h += '<div class="mhx-num-row"><input type="number" inputmode="numeric" id="mhx-up" min="1" placeholder="上數" value="'+(_mhUpNum||'')+'"><input type="number" inputmode="numeric" id="mhx-lo" min="1" placeholder="下數" value="'+(_mhLoNum||'')+'"></div>';
        h += '<div class="mhx-hint">心中默念所問，隨意各報一數（如 8、25），動爻以當下時辰定。</div>';
      } else if (_mhMethod === 'char') {
        h += '<div class="mhx-char-row"><input type="text" id="mhx-text" maxlength="20" placeholder="輸入中文字（如：問前途）" value="'+(_mhText||'').replace(/"/g,'&quot;')+'"></div>';
        h += '<div class="mhx-hint">心中默念所問，輸入一句中文字，依先天卦數以筆畫起卦：一字以筆畫分上下、二字各為上下卦、多字前半為上後半為下，動爻加時辰定。</div>';
      } else {
        h += '<div class="mhx-hint">以此刻年月日時自動起卦（先天卦數＋時辰定動爻）。</div>';
      }
      h += '</div>';
      h += '<button class="mhx-cast-btn" onclick="_mhDoCast()">✦ 起 卦 ✦</button>';
    } else {
      var mh = _mhResult;
      h += '<div class="mhx-section"><div class="mhx-section-title">✦ 卦象</div>';
      h += '<div class="mhx-gua-row">';
      h += _guaCell('本卦', mh.ben && mh.ben.n, (mh.up&&mh.up.el)+'／'+(mh.lo&&mh.lo.el));
      h += _guaCell('互卦', mh.hu && mh.hu.n, '過程');
      h += _guaCell('變卦', mh.bian && mh.bian.n, '結局');
      h += '</div>';
      var bad = (mh.ty && (mh.ty.f==='凶' || mh.ty.f==='小凶'));
      h += '<div class="mhx-ty"><span class="rel">' + (mh.ty?mh.ty.r:'—') + '</span>';
      h += '<span class="luck' + (bad?' bad':'') + '">' + (mh.ty?mh.ty.f:'') + '</span>';
      h += '<div class="desc">' + (mh.ty?mh.ty.d:'') + '</div></div>';
      h += '<div class="mhx-dong">體卦 ' + (mh.tiG?mh.tiG.n+'（'+mh.tiG.el+'）':'') + ' ・ 用卦 ' + (mh.yoG?mh.yoG.n+'（'+mh.yoG.el+'）':'') + ' ・ 動爻第 ' + (mh.dong||'?') + ' 爻</div>';
      h += '</div>';

      h += '<div class="mhx-ai-card"><div class="mhx-ai-title">🌙 AI 深度解讀</div>';
      h += '<div class="mhx-ai-desc">輕觸按鈕複製，貼到 AI 對話送出即可。</div>';
      h += '<button class="mhx-ai-copy-btn" onclick="_mhCopy()">✦ 一鍵複製占卦提示詞 ✦</button>';
      h += '<div class="mhx-ai-grid">';
      for (var a=0;a<AI_LIST.length;a++) {
        var ai = AI_LIST[a];
        h += '<button class="mhx-ai-sc" onclick="_mhOpenAI(\''+ai.id+'\',\''+ai.url+'\',this)">';
        h += '<img src="ai-icons/ai-'+ai.id+'.png" alt="'+ai.name+'"><span>'+ai.name+'</span></button>';
      }
      h += '</div><div class="mhx-ai-foot">點擊 AI 按鈕 → 自動複製＋開啟 → 貼上送出</div></div>';
      h += '<div style="text-align:center;margin-top:.2rem"><button onclick="_meihuaShare()" style="padding:.72rem 1.5rem;border-radius:12px;border:1px solid rgba(201,168,76,.5);background:linear-gradient(135deg,rgba(201,168,76,.18),rgba(201,168,76,.05));color:#c9a84c;font-family:inherit;font-size:.92rem;font-weight:600;letter-spacing:1px;cursor:pointer">\uD83D\uDCE4 \u751F\u6210\u5206\u4EAB\u5361</button></div>';
      h += '<div style="text-align:center"><button class="mhx-reset-btn" onclick="_mhReset()">↺ 重新起卦</button></div>';
    }
    h += '<div class="mhx-footer">靜月之光 ・ jingyue.uk<br>梅花易數 ・ 體用占</div></div>';
    w.innerHTML = h;
  }

  function _guaCell(role, name, sub) {
    return '<div class="mhx-gua"><div class="role">' + role + '</div><div class="gname">' + (name||'？') + '</div><div class="gel">' + (sub||'') + '</div></div>';
  }

  // ════════════════════════════════════════════════════════
  //  起卦過場動畫（太極 + 八卦環）
  // ════════════════════════════════════════════════════════
  function _showLoading(done) {
    var ov = document.createElement('div');
    ov.className = 'mhx-load';
    ov.id = 'mhx-loading';
    var stars = '';
    for (var i=0;i<24;i++) stars += '<i style="left:'+(Math.random()*100).toFixed(1)+'%;--d:'+(3.5+Math.random()*4).toFixed(1)+'s;--dl:'+(Math.random()*5).toFixed(1)+'s;'+(Math.random()>.7?'width:3px;height:3px;':'')+'"></i>';
    var tri = '';
    for (var k=0;k<8;k++) {
      tri += '<div class="mhx-tri" style="--a:'+(k*45)+'deg;--td:'+(0.7+k*0.1).toFixed(2)+'s">'+BAGUA_SYM[k]+'</div>';
    }
    ov.innerHTML =
      '<div class="mhx-stars">'+stars+'</div>' +
      '<div class="mhx-ring">'+tri+
        '<div class="mhx-taiji"><span class="y"></span><span class="n"></span></div>' +
      '</div>' +
      '<div class="mhx-load-status" id="mhx-load-status">心誠則靈・默念所問</div>' +
      '<div class="mhx-load-sub" id="mhx-load-sub">梅花易數起卦</div>';
    document.body.appendChild(ov);

    var steps = [
      ['取數成卦','以時／數定上下二卦'],
      ['上下既成','本卦立，定體用之分'],
      ['二三四五','互卦現，看過程隱情'],
      ['動爻一變','變卦成，推結局走向'],
      ['體用相參','五行生剋定吉凶'],
      ['卦象已成','體用判，應期在五行']
    ];
    var TOTAL = 3000, per = TOTAL / steps.length;
    steps.forEach(function (s, idx) {
      setTimeout(function () {
        var st = document.getElementById('mhx-load-status'), sb = document.getElementById('mhx-load-sub');
        if (st) { st.style.opacity='0'; setTimeout(function(){ st.textContent=s[0]; st.style.opacity='1'; },150); }
        if (sb) { sb.style.opacity='0'; setTimeout(function(){ sb.textContent=s[1]; sb.style.opacity='1'; },150); }
      }, idx*per);
    });
    setTimeout(function () {
      var o = document.getElementById('mhx-loading');
      if (o) { o.style.transition='opacity .5s'; o.style.opacity='0'; setTimeout(function(){ o.remove(); },500); }
      if (typeof done === 'function') done();
    }, TOTAL + 240);
  }

  // ════════════════════════════════════════════════════════
  //  起卦計算（呼叫全域 calcMH，不重造）
  // ════════════════════════════════════════════════════════
  function _shichen() {
    var nh = new Date().getHours();
    return Math.floor(((nh + 1) % 24) / 2) + 1; // 1=子…
  }

  function _castNumbers() {
    var sc = _shichen();
    if (_mhMethod === 'num') {
      var u = parseInt(_mhUpNum, 10), l = parseInt(_mhLoNum, 10);
      if (!u || !l || u < 1 || l < 1) { alert('請各報一個正整數（上數、下數）'); return null; }
      var up = u % 8 || 8, lo = l % 8 || 8, dong = (u + l + sc) % 6 || 6;
      return { up: up, lo: lo, dong: dong };
    }
    // 時間起卦：需農曆換算。lunar-javascript 把 Solar 掛在 window.Solar（非 Lunar.Solar），兩者皆接受。
    var SolarLib = (window.Lunar && window.Lunar.Solar) || window.Solar;
    if (!SolarLib || typeof SolarLib.fromYmd !== 'function') {
      alert('時間起卦需要精準農曆換算尚未就緒，請改用「數字起卦」。');
      return null;
    }
    try {
      var now = new Date();
      var solar = SolarLib.fromYmd(now.getFullYear(), now.getMonth()+1, now.getDate());
      var lunar = solar.getLunar();
      var lY = lunar.getYear(), lM = lunar.getMonth(), lD = lunar.getDay();
      var yzhi = ((lY - 4) % 12 + 12) % 12 + 1;
      var base = yzhi + Math.abs(lM) + lD;
      var up = base % 8 || 8, lo = (base + sc) % 8 || 8, dong = (base + sc) % 6 || 6;
      return { up: up, lo: lo, dong: dong };
    } catch (e) {
      alert('起卦失敗，請改用「數字起卦」。');
      return null;
    }
  }

  // ── 漢字起卦：筆畫資料庫（自架 cnchar，避免外部 CDN 風險；只在用到時載入一次）──
  var _cncharReady = false, _cncharLoading = false, _cncharCbs = [];
  function _loadCnchar(cb) {
    if (_cncharReady) { cb(true); return; }
    _cncharCbs.push(cb);
    if (_cncharLoading) return;
    _cncharLoading = true;
    var V = '?v=20260606v80_20';
    function flush(ok){ _cncharLoading = false; _cncharReady = ok; _cncharCbs.forEach(function(f){ f(ok); }); _cncharCbs = []; }
    function fail(){ flush(false); }
    function register(){
      try { if (window.cnchar && window.cncharTrad && typeof window.cnchar.use === 'function') window.cnchar.use(window.cncharTrad); } catch (e) {}
      flush(!!(window.cnchar && typeof window.cnchar.stroke === 'function'));
    }
    function inject(src, ok, err){ var s = document.createElement('script'); s.src = src; s.async = true; s.onload = ok; s.onerror = err; document.body.appendChild(s); }
    function loadTrad(){ if (window.cncharTrad) { register(); } else { inject('JS/cnchar.trad.min.js' + V, register, fail); } }
    if (window.cnchar && window.cnchar.stroke) { loadTrad(); }
    else { inject('JS/cnchar.min.js' + V, loadTrad, fail); }   // 先載基礎，再載繁體筆畫，全自架可快取
  }

  // 漢字起卦（字占）：依先天卦數，以「繁體筆畫」起卦。async：用到時才載入筆畫庫。
  function _castChar(cb) {
    var raw = (_mhText || '').trim();
    var chars = raw.match(/[\u4e00-\u9fa5\u3400-\u4dbf]/g); // 只取中文字（含擴展A）
    if (!chars || !chars.length) { alert('請先輸入中文字（漢字起卦）。'); cb(null); return; }
    var sc = _shichen();
    function compute() {
      try {
        if (!window.cnchar || typeof window.cnchar.stroke !== 'function') return null;
        var arr = window.cnchar.stroke(chars.join(''), 'array'); // 每字繁體筆畫（已註冊 cncharTrad）
        if (!arr || !arr.length) return null;
        var total = 0; for (var i=0;i<arr.length;i++) total += (arr[i] || 0);
        if (!total) return null;
        var up, lo;
        if (arr.length === 1) {
          // 一字難分：以筆畫為上卦，筆畫＋時辰為下卦（邵雍一字加時法）
          up = arr[0] % 8 || 8;
          lo = (arr[0] + sc) % 8 || 8;
        } else {
          // 多字：字數均分，少一字為上卦、多一字為下卦（前半上、後半下）
          var upCount = Math.floor(arr.length / 2);
          var upSum = 0, loSum = 0;
          for (var j=0;j<arr.length;j++){ if (j < upCount) upSum += (arr[j]||0); else loSum += (arr[j]||0); }
          up = upSum % 8 || 8;
          lo = loSum % 8 || 8;
        }
        var dong = (total + sc) % 6 || 6; // 動爻：總筆畫加時辰
        return { up: up, lo: lo, dong: dong };
      } catch (e) { return null; }
    }
    _loadCnchar(function(ok){
      if (!ok) { alert('漢字起卦所需的筆畫資料庫載入失敗，請改用「時間起卦」或「數字起卦」。'); cb(null); return; }
      var r = compute();
      if (!r) { alert('漢字筆畫解析失敗，請改用時間或數字起卦。'); cb(null); return; }
      cb(r);
    });
  }

  // ════════════════════════════════════════════════════════
  //  提示詞（組好複製去 AI；遵循 ai-divination 鐵律）
  // ════════════════════════════════════════════════════════
  // 八卦萬物類象（說卦＋梅花斷例常用；推具體人事物）
  var GUA_XIANG = {
    '乾':'天、君、父、長輩官貴、頭、剛健、金玉珠寶、圓、西北',
    '兌':'澤、少女、口舌言談、喜悅、毀折缺損、巫醫、飲食、西',
    '離':'火、日、中女、文書契約、光明美麗、心目、電、分離、南',
    '震':'雷、長男、動、足、驚恐、車馬、急躁、生發、東',
    '巽':'風、長女、入、生意利市、繩直、進退不定、草木、東南',
    '坎':'水、中男、險陷、盜、暗昧、耳、智謀、勞苦、北',
    '艮':'山、少男、停止阻隔、手、徑路、穩重保守、東北',
    '坤':'地、母、眾人、順從、腹、方、柔弱吝嗇、布帛田土、西南'
  };

  function _mhTrig(g){ return g ? ((g.name||'') + (g.nat?('('+g.nat+')'):'') + (g.el?('·'+g.el):'')) : '？'; }

  // v80.41：問題保真路由。只限定「答案要回答什麼」，不替卦象預寫吉凶。
  function _mhQuestionContract(question) {
    var q = String(question || '').trim();
    var L = ['【本題回答契約（優先於通用格式，不得改寫原問句）】'];
    if (!q) {
      L.push('問卜者沒有填寫明確問題：不得自行編造人物、事件或生活領域；只能說明本卦所示的一般局勢、可觀察變化與使用限制。');
      return L.join('\n');
    }
    L.push('完整保留原問句的主體、對象、事件、否定、比較、期限、場域與成立門檻；第一句必須回答同一個問題，不能偷換成較容易回答的版本。');
    var yesno = /會不會|能不能|可不可以|是否|是不是|有沒有|嗎[？?]?\s*$/.test(q);
    var timing = /何時|什麼時候|多久|幾天|幾週|幾月|哪一年|時間|近期|本月|今年|明年/.test(q);
    var choice = /還是|二選一|哪個|哪一個|比較|該選|選擇/.test(q);
    var cause = /為什麼|為何|原因|怎麼會|根源/.test(q);
    var action = /怎麼做|怎麼辦|如何|建議|方法|策略|該不該|要不要/.test(q);
    var mind = /愛不愛|愛上|喜歡|想我|想念|在想|心裡|真心|感情|關係|復合|曖昧|桃花/.test(q);
    var lost = /不見|遺失|掉了|找得到|在哪裡|位置|失物|走失/.test(q);
    var exact = /幾個|幾位|多少|百分比|幾成|機率|金額|價位|幾歲|年齡|姓名|名字|身分|職業|長相|外貌|號碼|彩票|樂透/.test(q);
    var high = /疾病|症狀|癌|懷孕|手術|藥|醫療|官司|法律|犯罪|報警|投資|股票|期貨|加密貨幣|借貸|債務|自殺|傷害/.test(q);
    var allegation = /外遇|偷吃|劈腿|偷竊|下毒|陷害|詐騙|兇手|性侵|跟蹤|犯罪/.test(q);
    var liveFact = /天氣|氣溫|降雨|颱風|地震|航班|班機|股價|匯率|價格|法規|選舉|比賽|比分|開獎/.test(q);
    if (yesno) L.push('這是成立與否的命題：第一句給「偏會／偏不會／有條件才會」之一，並標明把握度強、中、弱；不可把短暫訊號直接等同最終成立。');
    if (timing) L.push('這題要求時間：只准使用資料區已給的吉應、敗應與近中遠層次；沒有可靠時間窗就直說卦面不能精確到日期，不得另造天數或月份。');
    if (choice) L.push('這是比較題：用同一標準分別評估每個明示選項；若一卦不足以同時量測多個選項，先判目前主線，再明說比較限制，不得硬湊勝負。');
    if (cause) L.push('這題要求原因：把原因分成當前主因、過程暗線與觸發點，分別落回本卦、互卦與動爻，不以類象故事取代因果。');
    if (action) L.push('這題要求做法：建議必須直接對應最強阻力或最可控節點，給一至三個可執行動作與停止條件，不講空泛心靈話。');
    if (mind) L.push('涉及他人感情或內心：只能判互動趨勢、投入程度、界線與可觀察行為；不得宣稱已客觀讀到對方秘密心理，也不得把禮貌、順從或單次互動直接斷成愛意。');
    if (lost) L.push('涉及失物／位置：依八卦方位、場域與物象給「優先搜索區域與順序」，不可保證精確地址或把類象說成已親眼看見。');
    if (exact) L.push('涉及數量、身分、金額、年齡、機率或號碼：卦象沒有獨立量測通道就不得編造精確值；改答相對強弱、範圍層級或可驗證特徵。');
    if (high) L.push('涉及醫療、法律、犯罪、投資或人身安全：只提供象徵性趨勢與風險提醒，不能取代專業判斷；不得給診斷、保證勝訴、報酬承諾或危險指示。');
    if (allegation) L.push('涉及外遇、詐騙、偷竊、傷害或其他指控：卦象不能作為認定他人違法或不忠的證據；只能說疑點、風險與應查證的現實信號。');
    if (liveFact) L.push('涉及可即時查證的現實資料：卦象只能補充象徵性趨勢，不得冒充天氣、價格、法規、航班、賽果或開獎的官方資料。');
    return L.join('\n');
  }

  function buildMeihuaPrompt(question, mh) {
    var tiName = (mh.tiG && mh.tiG.name) || '', yoName = (mh.yoG && mh.yoG.name) || '';
    var tiEl = mh.tiG && mh.tiG.el, yoEl = mh.yoG && mh.yoG.el;
    var timing = WX_TIMING[yoEl] || '節奏依用卦五行性質判';
    var luck = mh.ty ? mh.ty.f : '';
    // ── 旺衰（旺相休囚死）：體、用、變後用 都要算，生剋力道才準（天花板在材料）──
    //    優先用既有引擎 getMhWangShuai（v80.16 起含節氣判月＋四季月土旺），失敗才退國曆近似簡表；同一函數對任一五行通用。
    function _wsLevelOf(el) {
      if (!el) return '';
      try { if (typeof getMhWangShuai === 'function') { var r = getMhWangShuai(el); if (r && r.level) return r.level; } } catch (e) {}
      var _m = new Date().getMonth() + 1, _sea;
      if (_m>=2 && _m<=4) _sea='spring'; else if (_m>=5 && _m<=7) _sea='summer';
      else if (_m>=8 && _m<=10) _sea='autumn'; else _sea='winter';
      var _T = { spring:{木:'旺',火:'相',水:'休',金:'囚',土:'死'}, summer:{火:'旺',土:'相',木:'休',水:'囚',金:'死'}, autumn:{金:'旺',水:'相',土:'休',火:'囚',木:'死'}, winter:{水:'旺',木:'相',金:'休',土:'囚',火:'死'} };
      return (_T[_sea] && _T[_sea][el]) || '平';
    }
    var wsLevel = _wsLevelOf(tiEl);   // 體卦旺衰
    var yoWs    = _wsLevelOf(yoEl);   // 用卦旺衰
    var _wsNoteMap = {
      '旺':'當令最旺、力足', '相':'受令神所生、次旺偏有力', '休':'洩氣於令神、力退',
      '囚':'克令神反受牽制、力弱', '死':'被當令之氣所克、最弱', '平':'不逢令、力道持平'
    };
    var wsNote = ({
      '旺':'體當令最旺、力足——吉更實，逢凶也扛得住。',
      '相':'體受令神所生、次旺，偏有力。',
      '休':'體生令神而洩氣、力退——吉要打折，別高估後勁。',
      '囚':'體克令神反被牽制、力弱——推得吃力。',
      '死':'體被當令之氣所克、最弱——凶上加凶，吉也難落實。',
      '平':'體不逢令，力道持平。'
    })[wsLevel] || '';
    // 生剋力道：把「體旺衰＋用旺衰」合參，定生剋的真實輕重——
    //   剋體之卦（用）休囚死則克無力、凶大減；用旺相則凶不可當；受剋方（體）旺則能扛。
    var _rank = { '旺':4, '相':3, '平':2, '休':1, '囚':0, '死':0 };
    function _forceNote(relName, tw, yw) {
      relName = (relName || '').replace('剋', '克');
      var ts = (_rank[tw]!=null ? _rank[tw] : 2), ys = (_rank[yw]!=null ? _rank[yw] : 2);
      var tiStrong = ts>=3, tiWeak = ts<=1, yoStrong = ys>=3, yoWeak = ys<=1;
      if (relName==='用克體') {
        if (yoWeak && tiStrong) return '用衰體旺——克你的力道其實很弱、你站得住，這個「凶」要大打折扣，別當成困難重重。';
        if (yoStrong && tiWeak) return '用旺體弱——克力強、受傷重，這個凶要當真。';
        if (yoStrong && tiStrong) return '雙方都旺——硬碰硬，受阻但你頂得住，要主動出力才壓得下。';
        if (yoWeak && tiWeak) return '雙方都弱——事不成氣候，拖著沒力、難有結果。';
        return '克力中等——受點阻，程度中等。';
      }
      if (relName==='體生用') {
        if (tiWeak && yoStrong) return '體弱生旺用——旺者奪氣，洩耗最重、得不償失之象。';
        if (tiStrong && yoWeak) return '體旺生衰用——洩得起且洩耗有限，付出有本錢，但仍是你在貼。';
        if (tiStrong) return '體旺——洩得起，付出有本錢，但仍是你在貼、被牽著走。';
        if (tiWeak) return '體弱還在洩——越給越虛，洩耗偏重、得不償失之象。';
        return '在洩耗——付出與回收要算清楚，別無底線投入。';
      }
      if (relName==='體克用') {
        if (tiWeak && yoStrong) return '體弱剋旺用——原局仍屬諸事吉，但落實度最低；主動權名義在你，實際推動最費力。';
        if (tiStrong && yoWeak) return '體旺剋衰用——壓得輕鬆、最易成。';
        if (tiStrong) return '體旺——你壓得住、可成，主動推進就行。';
        if (tiWeak) return '體弱想掌控——吉意仍在，但力道不足，成得很費勁。';
        return '掌控力中等——可成但需出力。';
      }
      if (relName==='用生體') {
        if (yoStrong) return '用旺生體——外助強而實，貴人／環境有力，借得上力。';
        if (yoWeak) return '用衰生體——有幫手但力道有限，別全靠外援。';
        return '外助中等——有幫襯，仍要自己接得住。';
      }
      if (relName==='比和') {
        if (tiStrong || yoStrong) return '同氣且有力——順而能成，但同質性高、突破有限。';
        if (tiWeak && yoWeak) return '同氣但都弱——順是順卻沒力，難有大進展。';
        return '同氣相順——事順，突破有限。';
      }
      return '';
    }

    // 變卦體用（結局對體）：動爻必在「用卦」，故體不變、用變；翻動爻所在爻得變後用卦
    var bianTy = null, yoBianName = '', yoBianEl = '';
    try {
      if (mh.yoG && mh.yoG.li && typeof gByL === 'function' && typeof tiYong === 'function') {
        var _yl = mh.yoG.li.slice();
        var _idx = (mh.dong <= 3) ? (mh.dong - 1) : (mh.dong - 4); // 動爻在用卦內的爻位
        if (_idx >= 0 && _idx <= 2) {
          _yl[_idx] = _yl[_idx] ? 0 : 1;
          var _yb = gByL(_yl[0], _yl[1], _yl[2]);
          if (_yb) { yoBianName = _yb.name || ''; yoBianEl = _yb.el || ''; bianTy = tiYong(tiEl, _yb.el); }
        }
      }
    } catch (e) {}

    var L = [];
    L.push('你是一位用了二十年梅花易數、講話直接不繞圈的占者。有人剛為一件事起了卦，要你把卦讀成他能用的判斷，而不是把卦辭翻譯一遍。');
    L.push('');
    L.push('問題：' + (question || '（未填）'));
    L.push('');
    L.push(_mhQuestionContract(question));
    L.push('');
    L.push('【卦象資料】');
    L.push('本卦：' + (mh.ben && mh.ben.n) + '（上卦' + _mhTrig(mh.up) + '，下卦' + _mhTrig(mh.lo) + '）—— 事情的當前定性。');
    L.push('互卦：' + (mh.hu && mh.hu.n) + ' —— 發展過程、當事人沒看到的隱情與中間變數。');
    // v80.33 互卦對體生剋（《體用總訣》「宜受他卦之生，不宜受他卦之剋。他卦者，謂用互變也」——資料直給，不靠 AI 自己算）
    try {
      if (mh.lo && mh.lo.li && mh.up && mh.up.li && typeof gByL === 'function' && tiEl) {
        var _SH = (typeof SHENG !== 'undefined') ? SHENG : {木:'火',火:'土',土:'金',金:'水',水:'木'};
        var _KEm = (typeof KE !== 'undefined') ? KE : {木:'土',土:'水',水:'火',火:'金',金:'木'};
        var _six = [mh.lo.li[0], mh.lo.li[1], mh.lo.li[2], mh.up.li[0], mh.up.li[1], mh.up.li[2]];
        var _huLo = gByL(_six[1], _six[2], _six[3]);
        var _huUp = gByL(_six[2], _six[3], _six[4]);
        var _hrel = function (g) {
          if (!g || !g.el) return '';
          if (g.el === tiEl) return (g.name||'') + '（' + g.el + '）與體比和＝過程有同氣相助';
          if (_SH[g.el] === tiEl) return (g.name||'') + '（' + g.el + '）生體＝過程有暗助推力';
          if (_SH[tiEl] === g.el) return (g.name||'') + '（' + g.el + '）受體生＝過程在洩耗你';
          if (_KEm[g.el] === tiEl) return (g.name||'') + '（' + g.el + '）剋體＝過程有人事在擋';
          if (_KEm[tiEl] === g.el) return (g.name||'') + '（' + g.el + '）受體剋＝過程可控但費力';
          return '';
        };
        var _hl = _hrel(_huLo), _hu2 = _hrel(_huUp);
        if (_hl || _hu2) L.push('互卦對體生剋（過程在幫你還是扯你）：互上' + (_hu2 || '—') + '；互下' + (_hl || '—') + '。');
      }
    } catch (e) {}
    L.push('變卦：' + (mh.bian && mh.bian.n) + ' —— 若照目前走向，事情最後的結局。');
    var _cuo = (typeof mhCuoGua === 'function') ? mhCuoGua(mh) : null;
    var _zong = (typeof mhZongGua === 'function') ? mhZongGua(mh) : null;
    if (_cuo) L.push('錯卦（上' + _cuo.up + '下' + _cuo.lo + '）—— 事情的反面、你沒看到的相反可能與潛在反作用力；若這一面反而有利，提醒當事人可能看錯方向或另有轉圜。');
    if (_zong) L.push('綜卦：' + (_zong.isSelf ? '與本卦相同 —— 正反看都一樣，事情沒有迴旋餘地、難以換角度' : ('上' + _zong.up + '下' + _zong.lo + ' —— 把局面整個倒過來、站對方／對立位置看到的另一種樣貌，可輔助觀察換位後的立場或事情循環另一端，但不能單憑此卦斷定對方內心')) + '。');
    L.push('體卦：' + _mhTrig(mh.tiG) + ' —— 問卜者自身／所問之主體。體宜旺、宜被生。');
    L.push('用卦：' + _mhTrig(mh.yoG) + ' —— 所問之事／外在環境／對方。');
    L.push('本卦體用關係：' + (mh.ty && mh.ty.r) + '（' + luck + '）。' + (mh.ty && mh.ty.d));
    L.push('生剋力道（體用旺衰合參、定輕重）：' + _forceNote(mh.ty && mh.ty.r, wsLevel, yoWs));
    if (bianTy) {
      L.push('變卦體用關係（結局）：體仍為' + tiName + '（' + tiEl + '），用變為' + yoBianName + '（' + yoBianEl + '）→ ' + bianTy.r + '（' + bianTy.f + '）。變後用「' + yoBianName + '」當下旺衰為「' + _wsLevelOf(yoBianEl) + '」。生剋力道：' + _forceNote(bianTy.r, wsLevel, _wsLevelOf(yoBianEl)) + ' 拿它跟本卦體用比：同向＝維持，轉壞＝越走越不利，轉好＝漸入佳境。');
    }
    L.push('動爻：第 ' + mh.dong + ' 爻動（變卦由此而生，是事情變化的關鍵點）。');
    // v80.38 動爻爻位層次（《繫辭傳下》：其初難知、其上易知；二多譽、四多懼、三多凶、五多功）
    var _YAO_POS = {
      1:'初爻＝事之始、根基層，方向未定（其初難知）——變化發生在起步與底層條件',
      2:'二爻＝內部核心、得中之位，多獲助與稱譽（二多譽）——變化發生在內部主力與核心本身',
      3:'三爻＝內外交界、進退尷尬之位，多波折（三多凶）——變化發生在轉換與銜接處',
      4:'四爻＝近事之外場、伴君之位，多戒懼（四多懼）——變化發生在對外接口與關鍵他方',
      5:'五爻＝主導尊位、事之高峰（五多功）——變化發生在主導權與大局層',
      6:'上爻＝事之末、過極之位，局面將收（其上易知）——變化發生在收尾與規則層，過頭則散'
    };
    if (_YAO_POS[mh.dong]) L.push('動爻爻位參考：' + _YAO_POS[mh.dong] + '。把它跟變卦合著讀，點出變化具體落在事情的哪一層。');
    L.push('體卦旺衰：' + tiName + '（' + tiEl + '）當下時令為「' + wsLevel + '」——' + wsNote);
    L.push('用卦旺衰：' + yoName + '（' + yoEl + '）當下時令為「' + yoWs + '」——用' + (_wsNoteMap[yoWs] || '') + '；用是剋體／受體生剋的一方，它的旺衰直接決定上面「生剋力道」的輕重。');
    L.push('事情節奏參考（用卦五行性質，只定快慢、不定應期月份）：用卦五行為「' + yoEl + '」，' + timing + '。');
    // v80.37 正統應期（《梅花易數·占卦訣》：「看卦中有生體之卦，則事應於生體卦氣之日；有剋體之卦，則事敗於剋體卦氣之日」
    //   ——吉應看生體＋體旺之氣、敗應看剋體之氣，吉敗分開；節氣近似換月、誤差一兩天。
    //   取代 v80.33「用卦五行→季節」法（該法非原典應期斷法，原典中用卦只主近期之應的層次）。
    try {
      var _nd = new Date(), _gm = _nd.getMonth() + 1, _gd = _nd.getDate();
      var _JD = {1:6,2:4,3:6,4:5,5:6,6:6,7:7,8:8,9:8,10:8,11:7,12:7};
      var _lunAfter = {1:12,2:1,3:2,4:3,5:4,6:5,7:6,8:7,9:8,10:9,11:10,12:11};
      var _cur = (_gd >= (_JD[_gm]||6)) ? _lunAfter[_gm] : (_lunAfter[_gm] === 1 ? 12 : _lunAfter[_gm] - 1);
      var _SETS = {木:[1,2], 火:[4,5], 土:[3,6,9,12], 金:[7,8], 水:[10,11]};
      var _TXT  = {木:'寅卯月（農曆正、二月）', 火:'巳午月（農曆四、五月）', 土:'辰未戌丑月（農曆三、六、九、十二月）', 金:'申酉月（農曆七、八月）', 水:'亥子月（農曆十、十一月）'};
      var _SM = {金:'土', 木:'水', 水:'金', 火:'木', 土:'火'}; // 生我者
      var _KM = {金:'火', 木:'金', 水:'土', 火:'水', 土:'木'}; // 剋我者
      var _nearWin = function (set) {
        if (!set) return null;
        for (var k = 0; k < 12; k++) {
          var mm = ((_cur - 1 + k) % 12) + 1;
          if (set.indexOf(mm) >= 0) return { m: mm, k: k, zhi: '寅卯辰巳午未申酉戌亥子丑'.charAt(mm - 1) };
        }
        return null;
      };
      var _winTxt = function (w) {
        if (!w) return '';
        return w.k === 0 ? '本月（農曆' + w.m + '月・' + w.zhi + '月）即在窗內' : '農曆' + w.m + '月（' + w.zhi + '月），距今約 ' + w.k + ' 個月';
      };
      if (tiEl && _SM[tiEl]) {
        var _shEl = _SM[tiEl], _keEl2 = _KM[tiEl];
        var _jiWin  = _nearWin((_SETS[_shEl] || []).concat(_SETS[tiEl] || []));
        var _baiWin = _nearWin(_SETS[_keEl2]);
        L.push('應期（本系統採用《占卦訣》的生體／剋體卦氣法；依節氣換月、前後誤差一兩天）：');
        L.push('・吉應之期：生體之氣為「' + _shEl + '」，當令於' + _TXT[_shEl] + '；體旺之氣（' + tiEl + '）當令於' + _TXT[tiEl] + '。最近吉應窗：' + _winTxt(_jiWin) + '。');
        L.push('・敗應之期：剋體之氣為「' + _keEl2 + '」，當令於' + _TXT[_keEl2] + '。最近敗應窗：' + _winTxt(_baiWin) + '。');
        L.push('・遠近層次：用卦主近期之應、互卦主中期之應、變卦主遠期之應。');
      }
    } catch (e) {}
    // 品牌收尾選石：先由卦內需求機械決定，避免每次都推同一顆或由 AI 任意編功效。
    var _shengWo = {木:'水', 火:'木', 土:'火', 金:'土', 水:'金'};
    var _relNorm = String((mh.ty && mh.ty.r) || '').replace(/剋/g, '克');
    var _needSupport = (wsLevel === '休' || wsLevel === '囚' || wsLevel === '死' || _relNorm === '用克體' || _relNorm === '體生用');
    var _supportEl = _needSupport ? (_shengWo[tiEl] || tiEl) : tiEl;
    var _stoneMap = {
      水:{name:'海藍寶', fact:'海藍寶屬綠柱石族、六方晶系，主要由鐵致色。'},
      木:{name:'綠幽靈', fact:'綠幽靈是石英內含綠泥石等綠色包體所形成的景觀。'},
      火:{name:'紫水晶', fact:'紫水晶屬石英家族，主要成分為二氧化矽，硬度為莫氏7。'},
      土:{name:'虎眼石', fact:'虎眼石以絲絹狀貓眼光帶為主要外觀特徵，選購可看光帶是否集中。'},
      金:{name:'白水晶', fact:'白水晶屬石英家族，主要成分為二氧化矽，硬度為莫氏7。'}
    };
    var _stonePlan = _stoneMap[_supportEl] || _stoneMap[tiEl] || _stoneMap.金;
    L.push('品牌收尾指定（不得影響前面斷卦）：本次只推薦「' + _stonePlan.name + '」；取象需求為「' + _supportEl + '」，屬品牌實務的五行色象搭配，不是《梅花易數》原理，也不代表礦物具有改運功效。可用礦物事實：' + _stonePlan.fact);
    L.push('');
    L.push('【八卦類象（推具體人事物，只取與問題相關的，不要全列）】');
    L.push('體卦 ' + tiName + '：' + (GUA_XIANG[tiName] || ''));
    L.push('用卦 ' + yoName + '：' + (GUA_XIANG[yoName] || ''));
    L.push('其餘速查（推互卦、變卦的人事物用）：乾＝' + GUA_XIANG['乾'] + '；兌＝' + GUA_XIANG['兌'] + '；離＝' + GUA_XIANG['離'] + '；震＝' + GUA_XIANG['震'] + '；巽＝' + GUA_XIANG['巽'] + '；坎＝' + GUA_XIANG['坎'] + '；艮＝' + GUA_XIANG['艮'] + '；坤＝' + GUA_XIANG['坤'] + '。');
    L.push('（類象只用來推「象」；不可從某一卦直接斷定當事人的婚姻、生死、有無對象等卦上未明示的事實。）');
    L.push('');
    L.push('【判讀規則（依序執行，後項不得推翻前項）】');
    L.push('①先回答完整原問句：第一句直接裁決，不鋪陳、不改寫成立門檻。結論強度分為強／中／弱；弱不是含糊，而是明說「目前偏向什麼、缺哪個條件」。');
    L.push('②證據優先序固定：原問句語義 → 本卦體用生剋 → 體用旺衰力道 → 動爻與爻位 → 本卦、互卦、變卦的事件線 → 應期 → 錯綜與類象。後面的象只能補充或校正，不能反過來壓過體用主線。');
    L.push('③體用定性照《梅花易數·體用總訣》語彙，旺衰只決定力度與落實度，不得偷改吉凶種類：');
    L.push('　・用生體＝有進益之喜：外力來助。');
    L.push('　・比和＝百事順遂：同氣相順，但突破幅度另看旺衰。');
    L.push('　・體剋用＝諸事吉：主動在體、可成；體弱剋旺用時是吉意難落實，不得改判成凶，也不得吹成輕鬆必成。');
    L.push('　・體生用＝有耗失之患：體在洩耗，先看投入是否值得。');
    L.push('　・用剋體＝諸事凶：受制受阻；用衰則凶減，用旺體弱才是重凶。');
    L.push('④遇到訊號衝突，不准平均成模糊話：先指出最高權重訊號給主結論，再說哪個次級訊號限制它，最後列出「什麼可觀察條件出現時，結論會轉強或轉弱」。');
    L.push('⑤本卦、互卦、變卦要串成因果與時間線：現在是什麼局 → 中途誰或什麼機制推拉 → 動爻在哪一層觸發 → 按目前走勢收在哪。不得逐卦翻譯卦名或重複同一結論。');
    L.push('⑥動爻必須連爻位層次一起讀，說清變化落在根基、內部核心、銜接、外部接口、主導權或收尾哪一層；再用變卦判轉順、轉逆或只是換形式。');
    L.push('⑦類象只用於產生可核對的候選線索：人物類型、場合、方位、物件特徵、互動方式。每個具象都要用「較像／優先留意／可對照」表達，不得把單一類象斷成已知事實。');
    L.push('⑧錯卦與綜卦只在能解決主線矛盾時使用：錯卦看被忽略的反作用；綜卦看換位後的局面。不得單憑綜卦宣稱知道對方真正心理。');
    L.push('⑨應期只照資料區：吉事看生體、體旺之氣；不利看剋體之氣；用近、互中、變遠。月份是窗口，不是保證日；若題目沒有問時間，也只講最有用的一個轉折窗，避免堆月份。');
    L.push('⑩每個建議必須能直接處理卦中最強阻力，並附一個可驗證信號與一個停止／轉向條件。禁止「順其自然、相信自己、這是成長」等空話。');
    L.push('⑪不得引用本卦資料之外的對話記憶、個資、職業、商品或生活細節；不得捏造外應、人物身分、精確數字、心理動機、醫療診斷、法律結果或投資報酬。看不出來就明說看不出來。');
    L.push('⑫品牌收尾與占斷完全隔離：先把答案、理由、時機、行動與限制全部說完，最後才依「品牌收尾指定」自然帶出一種礦物；推薦不得反向證明卦象，也不得宣稱能讓對方愛上、保證成事、治療、護身、招財或改運。');
    L.push('');
    L.push('【交稿前核對】');
    L.push('□ 第一個句子回答的是原問句本身　□ 主結論由體用＋旺衰＋動爻共同支撐　□ 本互變已串成一條事件線　□ 衝突訊號已分主次而非模糊折衷');
    L.push('□ 應期只採資料區　□ 具象皆可核對且未冒充事實　□ 有具體行動、驗證信號與停止條件　□ 沒有盤外個資與虛構精確值　□ 品牌段未影響裁決');
    L.push('');
    L.push('【輸出格式】');
    L.push('繁體中文，像資深占者當面說話。第一句直接回答；其後每段只增加一項新資訊，依「判斷 → 原因 → 過程／轉折 → 時間 → 行動與驗證」自然推進。不要表格、不要粗體小標、不要逐卦報告、不要輸出規則或自我檢查。');
    L.push('最後另起一小段，限 2–3 句，只使用資料區指定的那一種礦物名稱。第一句把它連回本次實際需要穩住的行動或節奏；第二句可改寫指定的礦物事實，並明說它只是隨身提醒與品牌實務搭配，不是改變他人意志或保證結果的工具。語氣自然，不用優惠、限時、下單、搶購等字眼。');
    L.push('最後兩行固定照此收束，兩行之外不得再有任何內容：');
    L.push('[靜月之光蝦皮賣場](https://shopee.tw/a50h95648d?tab=shop)');
    L.push('願你諸事順遂。');
    return L.join('\n');
  }

  // ════════════════════════════════════════════════════════
  //  Public API
  // ════════════════════════════════════════════════════════
  window._meihuaShare = function () {
    if (!window.JYShareCard) { alert('\u5206\u4EAB\u5143\u4EF6\u8F09\u5165\u4E2D\uFF0C\u8ACB\u7A0D\u5019\u518D\u8A66'); return; }
    var mh = _mhResult || {};
    var concl = (mh.ty ? (mh.ty.r + '\uFF08' + mh.ty.f + '\uFF09\u30FB' + mh.ty.d) : '') + (mh.dong ? ' \u30FB \u52D5\u723B\u7B2C' + mh.dong + '\u723B' : '');
    // v80.39：補爻線資料——share-card v2.2 起直繪六爻卦象（陽實陰斷、動爻高亮）。
    //   本卦＝下卦.li＋上卦.li（由下而上）；互卦取 2-4/3-5 爻；變卦＝本卦動爻翻轉（與 calcMH 同式推導）
    var benL = (mh.lo && mh.lo.li && mh.up && mh.up.li) ? mh.lo.li.concat(mh.up.li) : null;
    var huL = null, biL = null;
    if (benL) {
      huL = [benL[1], benL[2], benL[3], benL[2], benL[3], benL[4]];
      biL = benL.slice(); if (mh.dong) biL[mh.dong - 1] = biL[mh.dong - 1] ? 0 : 1;
    }
    JYShareCard.open('meihua', {
      cardTitle: '\u6211\u7684\u5366\u8C61',
      spread: '\u6885\u82B1\u6613\u6578 \u30FB \u9AD4\u7528\u5360',
      question: _mhQuestion || '',
      cards: [
        { name: (mh.ben && mh.ben.n) || '', pos: '\u672C\u5366', lines: benL, dong: mh.dong },
        { name: (mh.hu && mh.hu.n) || '', pos: '\u4E92\u5366', lines: huL },
        { name: (mh.bian && mh.bian.n) || '', pos: '\u8B8A\u5366', lines: biL, dong: mh.dong }
      ],
      conclusion: concl
    });
  };

  window._meihuaStandaloneOpen = function () {
    _mhPhase = 'input'; _mhQuestion = ''; _mhMethod = 'time';
    _mhUpNum = ''; _mhLoNum = ''; _mhText = ''; _mhResult = null; _lastPrompt = '';
    var w = _getWrap();
    w.style.display = 'block';
    try { document.body.style.overflow = 'hidden'; } catch(e){} // 鎖背景捲動，避免固定層與底頁互搶造成抖動
    _render();
    w.scrollTop = 0;
  };
  window._meihuaClose = function () {
    var w = _getWrap();
    if (w) w.style.display = 'none';
    try { document.body.style.overflow = ''; } catch(e){}
  };
  window._mhSetMethod = function (m) {
    var qEl = document.getElementById('mhx-q'); if (qEl) _mhQuestion = qEl.value;
    var uEl = document.getElementById('mhx-up'); if (uEl) _mhUpNum = uEl.value;
    var lEl = document.getElementById('mhx-lo'); if (lEl) _mhLoNum = lEl.value;
    var tEl = document.getElementById('mhx-text'); if (tEl) _mhText = tEl.value;
    _mhMethod = m;
    _render();
  };
  function _finishCast(nums) {
    _showLoading(function () {
      try {
        _mhResult = calcMH(nums.up, nums.lo, nums.dong);
        _lastPrompt = buildMeihuaPrompt(_mhQuestion, _mhResult);
        _mhPhase = 'result';
        _render();
        _getWrap().scrollTop = 0;
      } catch (e) {
        console.error('[meihua] cast error', e);
        alert('起卦計算發生問題，請重試或改用另一種起卦方式。');
      }
    });
  }
  window._mhDoCast = function () {
    var qEl = document.getElementById('mhx-q'); _mhQuestion = qEl ? qEl.value.trim() : '';
    var uEl = document.getElementById('mhx-up'); if (uEl) _mhUpNum = uEl.value;
    var lEl = document.getElementById('mhx-lo'); if (lEl) _mhLoNum = lEl.value;
    var tEl = document.getElementById('mhx-text'); if (tEl) _mhText = tEl.value;
    if (typeof calcMH !== 'function') { alert('梅花引擎尚未載入，請重新整理頁面。'); return; }
    if (_mhMethod === 'char') {
      _castChar(function (nums) { if (nums) _finishCast(nums); });
    } else {
      var nums = _castNumbers();
      if (!nums) return;
      _finishCast(nums);
    }
  };
  window._mhCopy = function () {
    if (!_lastPrompt) return;
    var ok = function () {
      var btn = document.querySelector('.mhx-ai-copy-btn');
      if (btn) { var o = btn.innerHTML; btn.innerHTML = '✓ 已複製！貼到 AI 送出即可'; btn.style.borderColor = 'rgba(52,211,153,.5)'; setTimeout(function(){ btn.innerHTML = o; btn.style.borderColor = ''; }, 2500); }
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(_lastPrompt).then(ok, function(){ _fallbackCopy(_lastPrompt); ok(); });
    } else { _fallbackCopy(_lastPrompt); ok(); }
  };
  window._mhOpenAI = function (id, url, btn) {
    var open = function () {
      var s = btn && btn.querySelector('span'); var nm = s ? s.textContent : '';
      if (s) s.textContent = '已複製！';
      setTimeout(function(){ window.open(url, '_blank'); }, 280);
      setTimeout(function(){ if (s) s.textContent = nm; }, 2000);
    };
    if (!_lastPrompt) { window.open(url, '_blank'); return; }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(_lastPrompt).then(open, function(){ _fallbackCopy(_lastPrompt); open(); });
    } else { _fallbackCopy(_lastPrompt); open(); }
  };
  window._mhReset = function () {
    _mhPhase = 'input';
    _render();
    _getWrap().scrollTop = 0;
  };

  function _fallbackCopy(text) {
    try { var ta = document.createElement('textarea'); ta.value = text; ta.style.cssText = 'position:fixed;left:-9999px'; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta); } catch (e) {}
  }

})();
