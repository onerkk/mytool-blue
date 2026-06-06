/*! meihua-standalone.js — 靜月之光 梅花易數獨立流程  [v80.17]
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
  var _mhMethod = 'time';   // time | num
  var _mhQuestion = '';
  var _mhUpNum = '';        // 數字起卦：上數
  var _mhLoNum = '';        // 數字起卦：下數
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
      '.mhx-method-grid{display:grid;grid-template-columns:1fr 1fr;gap:.45rem}',
      '.mhx-method-btn{padding:.6rem .4rem;border-radius:10px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.03);color:rgba(232,224,208,.5);cursor:pointer;transition:all .2s;text-align:center;font-family:inherit;font-size:.82rem}',
      '.mhx-method-btn.active{border-color:rgba(201,168,76,.5);background:rgba(201,168,76,.08);color:'+GOLD+'}',
      '.mhx-num-row{display:grid;grid-template-columns:1fr 1fr;gap:.5rem;margin-top:.7rem}',
      '.mhx-num-row input{width:100%;padding:.6rem;border-radius:10px;border:1px solid rgba(201,168,76,.3);background:rgba(255,255,255,.03);color:#e8e0d0;font-family:inherit;font-size:.95rem;text-align:center;outline:none}',
      '.mhx-num-row input:focus{border-color:rgba(201,168,76,.5)}',
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
      h += '<button class="mhx-method-btn' + (_mhMethod==='time'?' active':'') + '" onclick="_mhSetMethod(\'time\')">時間起卦<br><span style="font-size:.6rem;opacity:.6">以當下時間</span></button>';
      h += '<button class="mhx-method-btn' + (_mhMethod==='num'?' active':'') + '" onclick="_mhSetMethod(\'num\')">數字起卦<br><span style="font-size:.6rem;opacity:.6">報上下兩數</span></button>';
      h += '</div>';
      if (_mhMethod === 'num') {
        h += '<div class="mhx-num-row"><input type="number" inputmode="numeric" id="mhx-up" min="1" placeholder="上數" value="'+(_mhUpNum||'')+'"><input type="number" inputmode="numeric" id="mhx-lo" min="1" placeholder="下數" value="'+(_mhLoNum||'')+'"></div>';
        h += '<div class="mhx-hint">心中默念所問，隨意各報一數（如 8、25），動爻以當下時辰定。</div>';
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

  // ════════════════════════════════════════════════════════
  //  提示詞（組好複製去 AI；遵循 ai-divination 鐵律）
  // ════════════════════════════════════════════════════════
  function buildMeihuaPrompt(question, mh) {
    var yoEl = mh.yoG && mh.yoG.el;
    var timing = WX_TIMING[yoEl] || '依用卦五行對應的季節月份';
    var luck = mh.ty ? mh.ty.f : '';
    var verdictHint =
      (luck === '大吉' || luck === '吉') ? '卦象偏向「可行／有利」' :
      (luck === '凶' || luck === '小凶') ? '卦象偏向「不利／受阻」——這是壞消息，要直說，不可包裝成轉機' :
      (luck === '平' || luck === '比和') ? '卦象偏向「平穩／拉鋸，無突破」' : '依體用生剋據實判斷';

    var L = [];
    L.push('你是一個用了二十年梅花易數、講話直接不繞圈的占者。有人剛為一個問題起了卦，要你把卦讀成他能用的判斷，不是把卦辭翻譯一遍。');
    L.push('');
    L.push('問題：' + (question || '（未填，請依卦象給出最可能的主題與通則判斷）'));
    L.push('');
    L.push('【卦象資料】');
    L.push('本卦：' + (mh.ben && mh.ben.n) + '（上卦' + (mh.up&&mh.up.n) + '·' + (mh.up&&mh.up.el) + '，下卦' + (mh.lo&&mh.lo.n) + '·' + (mh.lo&&mh.lo.el) + '）—— 代表事情的當前定性。');
    L.push('互卦：' + (mh.hu && mh.hu.n) + ' —— 代表發展過程、當事人沒看到的隱情與中間變數。');
    L.push('變卦：' + (mh.bian && mh.bian.n) + ' —— 代表若照目前走向，最後的結局。');
    L.push('體卦：' + (mh.tiG && mh.tiG.n) + '（' + (mh.tiG && mh.tiG.el) + '），代表問卜者自身／所問之主體。');
    L.push('用卦：' + (mh.yoG && mh.yoG.n) + '（' + (mh.yoG && mh.yoG.el) + '），代表所問之事／外在環境。');
    L.push('體用關係：' + (mh.ty && mh.ty.r) + '（' + luck + '）。' + (mh.ty && mh.ty.d));
    L.push('動爻：第 ' + mh.dong + ' 爻動（變卦由此而來）。');
    L.push('應期參考：用卦五行為「' + yoEl + '」，' + timing + '。');
    L.push('');
    L.push('【怎麼讀（鐵律，違反就是失敗）】');
    L.push('①結論先行：第一句就正面回答他問的問題（能不能／會不會／往哪個方向）。本卦定基調，' + verdictHint + '。');
    L.push('②吉凶以體用生剋為核心：用生體／用克體是外力助你或阻你；體生用是你在耗；體克用是你費力可控；比和是順但無突破。據實說，別只報關係名詞。');
    L.push('③三象要串成一條線，不要逐卦分段：本卦（現在是什麼局）→ 互卦（過程藏了什麼、誰在暗中推或擋）→ 變卦（照這樣走會收在哪）。');
    L.push('④壞消息就是壞消息：用克體、體生用、變卦轉壞，直接講不利在哪、會怎麼發生，並給「要主動做什麼才能扭」的具體方向，不可用「考驗／轉機」帶過。');
    L.push('⑤應期要落地：用卦五行對應的季節/月份就是事情的時間節奏，講清楚什麼時候會動、為什麼是那時候。');
    L.push('⑥不要用粗體標題分類，不要「本卦：…互卦：…」這種排版；像跟人講話一樣自然過渡。');
    L.push('⑦只根據卦象講，不要臆測他的心理動機，不要反問他問題。');
    return L.join('\n');
  }

  // ════════════════════════════════════════════════════════
  //  Public API
  // ════════════════════════════════════════════════════════
  window._meihuaStandaloneOpen = function () {
    _mhPhase = 'input'; _mhQuestion = ''; _mhMethod = 'time';
    _mhUpNum = ''; _mhLoNum = ''; _mhResult = null; _lastPrompt = '';
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
    _mhMethod = m;
    _render();
  };
  window._mhDoCast = function () {
    var qEl = document.getElementById('mhx-q'); _mhQuestion = qEl ? qEl.value.trim() : '';
    var uEl = document.getElementById('mhx-up'); if (uEl) _mhUpNum = uEl.value;
    var lEl = document.getElementById('mhx-lo'); if (lEl) _mhLoNum = lEl.value;
    if (typeof calcMH !== 'function') { alert('梅花引擎尚未載入，請重新整理頁面。'); return; }
    var nums = _castNumbers();
    if (!nums) return;
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
