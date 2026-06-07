/*! meihua-standalone.js — 靜月之光 梅花易數獨立流程  [v80.29]
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

  // 用神（用卦）五行 → 應期，供提示詞引用
  var WX_TIMING = {
    木:'春季或農曆一～三月，事情走「成長／推進」的節奏，速度中快',
    火:'夏季或農曆四～六月，事情走「曝光／情緒／主動」的節奏，速度快',
    土:'季末（農曆三、六、九、十二月），事情走「穩定／拖延／承擔」的節奏，速度慢',
    金:'秋季或農曆七～九月，事情走「決斷／切割／壓力」的節奏，速度中等',
    水:'冬季或農曆十～十二月，事情走「流動／變數／等待」的節奏，速度慢'
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
  function buildMeihuaPrompt(question, mh) {
    var tiName = (mh.tiG && mh.tiG.name) || '', yoName = (mh.yoG && mh.yoG.name) || '';
    var tiEl = mh.tiG && mh.tiG.el, yoEl = mh.yoG && mh.yoG.el;
    var timing = WX_TIMING[yoEl] || '依用卦五行對應的季節月份';
    var luck = mh.ty ? mh.ty.f : '';
    var verdictHint =
      luck==='大吉' ? '卦象偏向「有利、有外助」' :
      luck==='吉'   ? '卦象偏向「順、可行」' :
      luck==='小吉' ? '卦象偏向「可成，但要主動費力」' :
      luck==='小凶' ? '卦象偏向「不利、在耗你」——壞消息要直說' :
      luck==='凶'   ? '卦象偏向「受阻、不利」——壞消息要直說' :
      '依體用生剋據實判斷';

    // ── 旺衰（旺相休囚死）：體、用、變後用 都要算，生剋力道才準（天花板在材料）──
    //    優先用既有引擎 getMhWangShuai（含節氣判月），失敗才退節氣簡表；同一函數對任一五行通用。
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
        if (yoStrong && tiWeak) return '用旺體弱——克力強、受傷重，這個凶要當真，得正面處理不利、別硬撐。';
        if (yoStrong && tiStrong) return '雙方都旺——硬碰硬，受阻但你頂得住，要主動出力才壓得下。';
        if (yoWeak && tiWeak) return '雙方都弱——事不成氣候，拖著沒力、難有結果。';
        return '克力中等——受點阻、要主動化解，別硬扛。';
      }
      if (relName==='體生用') {
        if (tiStrong) return '體旺——洩得起，付出有本錢，但仍是你在貼、被牽著走。';
        if (tiWeak) return '體弱還在洩——越給越虛，很可能得不償失，該收手別再貼。';
        return '在洩耗——付出與回收要算清楚，別無底線投入。';
      }
      if (relName==='體克用') {
        if (tiStrong) return '體旺——你壓得住、可成，主動推進就行。';
        if (tiWeak) return '體弱想掌控——力道不足，成得很費勁，先把自己養旺。';
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
    L.push('問題：' + (question || '（未填，請依卦象給出最可能的主題與通則判斷）'));
    L.push('');
    L.push('【卦象資料】');
    L.push('本卦：' + (mh.ben && mh.ben.n) + '（上卦' + _mhTrig(mh.up) + '，下卦' + _mhTrig(mh.lo) + '）—— 事情的當前定性。');
    L.push('互卦：' + (mh.hu && mh.hu.n) + ' —— 發展過程、當事人沒看到的隱情與中間變數。');
    L.push('變卦：' + (mh.bian && mh.bian.n) + ' —— 若照目前走向，事情最後的結局。');
    var _cuo = (typeof mhCuoGua === 'function') ? mhCuoGua(mh) : null;
    var _zong = (typeof mhZongGua === 'function') ? mhZongGua(mh) : null;
    if (_cuo) L.push('錯卦（上' + _cuo.up + '下' + _cuo.lo + '）—— 事情的反面、你沒看到的相反可能與潛在反作用力；若這一面反而有利，提醒當事人可能看錯方向或另有轉圜。');
    if (_zong) L.push('綜卦：' + (_zong.isSelf ? '與本卦相同 —— 正反看都一樣，事情沒有迴旋餘地、難以換角度' : ('上' + _zong.up + '下' + _zong.lo + ' —— 把局面整個倒過來、站對方／對立位置看到的另一種樣貌，常顯示對方真正立場或事情循環的另一端')) + '。');
    L.push('體卦：' + _mhTrig(mh.tiG) + ' —— 問卜者自身／所問之主體。體宜旺、宜被生。');
    L.push('用卦：' + _mhTrig(mh.yoG) + ' —— 所問之事／外在環境／對方。');
    L.push('本卦體用關係：' + (mh.ty && mh.ty.r) + '（' + luck + '）。' + (mh.ty && mh.ty.d));
    L.push('生剋力道（體用旺衰合參、定輕重）：' + _forceNote(mh.ty && mh.ty.r, wsLevel, yoWs));
    if (bianTy) {
      L.push('變卦體用關係（結局）：體仍為' + tiName + '（' + tiEl + '），用變為' + yoBianName + '（' + yoBianEl + '）→ ' + bianTy.r + '（' + bianTy.f + '）。變後用「' + yoBianName + '」當下旺衰為「' + _wsLevelOf(yoBianEl) + '」。生剋力道：' + _forceNote(bianTy.r, wsLevel, _wsLevelOf(yoBianEl)) + ' 拿它跟本卦體用比：同向＝維持，轉壞＝越走越不利，轉好＝漸入佳境。');
    }
    L.push('動爻：第 ' + mh.dong + ' 爻動（變卦由此而生，是事情變化的關鍵點）。');
    L.push('體卦旺衰：' + tiName + '（' + tiEl + '）當下時令為「' + wsLevel + '」——' + wsNote);
    L.push('用卦旺衰：' + yoName + '（' + yoEl + '）當下時令為「' + yoWs + '」——用' + (_wsNoteMap[yoWs] || '') + '；用是剋體／受體生剋的一方，它的旺衰直接決定上面「生剋力道」的輕重。');
    L.push('應期參考：用卦五行為「' + yoEl + '」，' + timing + '。');
    L.push('');
    L.push('【八卦類象（推具體人事物，只取與問題相關的，不要全列）】');
    L.push('體卦 ' + tiName + '：' + (GUA_XIANG[tiName] || ''));
    L.push('用卦 ' + yoName + '：' + (GUA_XIANG[yoName] || ''));
    L.push('其餘速查（推互卦、變卦的人事物用）：乾＝' + GUA_XIANG['乾'] + '；兌＝' + GUA_XIANG['兌'] + '；離＝' + GUA_XIANG['離'] + '；震＝' + GUA_XIANG['震'] + '；巽＝' + GUA_XIANG['巽'] + '；坎＝' + GUA_XIANG['坎'] + '；艮＝' + GUA_XIANG['艮'] + '；坤＝' + GUA_XIANG['坤'] + '。');
    L.push('（類象只用來推「象」；不可從某一卦直接斷定當事人的婚姻、生死、有無對象等卦上未明示的事實。）');
    L.push('');
    L.push('【斷卦鐵律（違反就是失敗）】');
    L.push('①結論先行：第一句就正面回答他問的事（能不能／會不會／往哪走／何時）。本卦定方向（' + verdictHint + '），但實際輕重以「生剋力道」那行為準——用衰克體無力就別講成困難重重，用旺克體才當真。');
    L.push('②體用生剋是斷吉凶的核心，據實說、別只報關係名詞：');
    L.push('　・用生體＝大吉：外力、貴人、環境來幫你，事半功倍。');
    L.push('　・比和＝吉：同氣相順，事順但突破有限。');
    L.push('　・體剋用＝小吉：你能掌控、可成，但要主動出力、費些勁。');
    L.push('　・體生用＝洩耗：你在付出、被牽著走，耗神耗財，當心得不償失。');
    L.push('　・用剋體＝凶：受制、受阻、被壓——這是壞消息，講清楚不利在哪。');
    L.push('③旺衰定力度（體、用都要看）：同樣的生剋，要看雙方旺衰才知真實輕重——剋體之卦（用）若休囚死，克你無力、凶大減；用旺相則凶不可當。體自身乘旺則吉更實、逢凶能扛；體休囚死又被剋，凶上加凶。已附「生剋力道」一行，據它定輕重，別只照生剋名詞一律講「困難重重」或「大吉」。');
    L.push('④三象串成一條線、不要逐卦分段：本卦（現在是什麼局）→ 互卦（過程藏了什麼、誰在暗中推或擋；除了看象，也看互卦五行對體是生是剋——過程在幫你還是扯你）→ 變卦（照這樣走收在哪）。變卦體用若比本卦轉壞＝越走越不利，轉好＝漸入佳境。');
    L.push('⑤用類象推具體人事物：依體用互變各卦類象，推對方／貴人／小人是什麼樣的人、事情牽涉什麼物、什麼方位場合，讓他能對照確認；只取相關的象，不要全背。');
    L.push('⑥壞消息就是壞消息：用剋體、體生用、變卦轉壞，直接講不利、會怎麼發生，並給「要主動做什麼才可能扭」的具體方向，不可用「考驗／轉機／成長」帶過。');
    L.push('⑦應期要落地：用卦（連同變卦、動爻）五行對應的季節月份就是事情的時間節奏，講清楚大概何時會動、何時見分曉（給一個範圍，不要只說「快了」），並說出為什麼是那時候；若動爻／變卦顯示轉折，標出轉折大概落在哪段時間、是轉順還是轉逆。');
    L.push('⑧挑最強的訊號深挖：把「體用生剋＋動爻變化」這條主線講透，不要十二類象蜻蜓點水。');
    L.push('⑨不要用粗體標題分類、不要「本卦：…互卦：…」逐段排版，像跟人講話一樣自然過渡。');
    L.push('⑩只依卦象與生剋推，不臆測他的心理動機、不反問他；卦上看不出來就說看不出來，不硬編。');
    L.push('⑪錯綜兩卦補看全局（有助主線才用，不要硬湊）：錯卦＝事情的反面與被忽略的相反力量——若錯卦反而有利，要提醒他可能看錯方向、或事情有相反的轉圜；綜卦＝把局面倒過來、站對方／對立位置看，常顯示對方真正的立場或循環的另一端（綜卦與本卦相同＝正反一致、沒有迴旋餘地）。');
    L.push('');
    L.push('【完整性清單（寫完前自我核對，但不要為湊字灌水）】');
    L.push('□ 第一句直接回答了問題　□ 體用生剋＋體用雙方旺衰（生剋力道）下了輕重得當的吉凶　□ 本互變三象串成因果與時間軸');
    L.push('□ 用類象推了可對照的人事物　□ 應期（範圍＋為什麼，有轉折標順逆）　□ 錯綜補看了另一面／對方視角（若有助主線）　□ 不利處直說並給可行的主動方向');
    L.push('');
    L.push('【輸出格式】');
    L.push('繁體中文，像占者當面講話，不是分析報告。第一句給結論，之後一段段推進，每段帶新資訊、同一結論只講一次。不要列表格、不要粗體小標、不要逐卦報告。');
    L.push('收尾 2–3 句：依體卦五行喜忌（體弱宜補體之五行、體被剋宜取化解之五行），自然推薦一種適合隨身的水晶／能量石幫他穩住氣場（實務輔助、非梅花原理），語氣平實不推銷，可輕附蝦皮去處 https://tw.shp.ee/9UHEJTp4 。只講一種、只在最後。');
    return L.join('\n');
  }

  // ════════════════════════════════════════════════════════
  //  Public API
  // ════════════════════════════════════════════════════════
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
