/*! bazi-standalone.js — 靜月之光 八字命理獨立流程  [v80.29]
 *  歐那 2026/6/6：八字自成一頁、乾淨、不出現其他入口、有自己的過場動畫，組好提示詞複製去 AI。
 *  做法：完全比照 meihua-standalone.js / lenormand.js 的「自包覆獨立頁 + 複製提示詞」模式。
 *  引擎：直接呼叫既有全域 calcTrueSolarTime() + computeBazi() + enhanceBazi()，不重造排盤。
 *    - computeBazi / enhanceBazi 在 bazi.js / bazi_upgrade.js（含夜子時、節氣換月、窮通寶鑑調候、
 *      特殊格局從/化/專旺、得令得地得勢旺衰、扶抑+病藥+通關用神、大運順逆起運、神煞、刑沖合害…）。
 *    - 真太陽時由 calcTrueSolarTime（solar-location.js，含經度時差+均時差）校正後才餵 computeBazi。
 *  正統性全部來自引擎；本檔只負責「輸入生辰 → 排盤 → 把完整命盤組成正統提示詞」。
 *  只需部署本檔 + ui.js（_baziOpen 改接 window._baziStandaloneOpen）+ index.html（掛 script + 版本號）。
 */
(function () {
  'use strict';

  var GOLD = '#c9a84c';
  var SHOPEE = 'https://tw.shp.ee/2n5Mo2w';
  // 十天干（過場動畫的環）
  var TIANGAN = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
  // 年支 → 生肖
  var ZODIAC_ANIMAL = {子:'鼠',丑:'牛',寅:'虎',卯:'兔',辰:'龍',巳:'蛇',午:'馬',未:'羊',申:'猴',酉:'雞',戌:'狗',亥:'豬'};

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

  // 出生地 → 經度 / 時區（真太陽時校正用）；自包覆，不依賴 solar-location 的內部 CITIES 結構。
  var CITY = [
    {n:'台北', lng:121.56, tz:8}, {n:'新北', lng:121.46, tz:8}, {n:'桃園', lng:121.30, tz:8},
    {n:'台中', lng:120.68, tz:8}, {n:'台南', lng:120.21, tz:8}, {n:'高雄', lng:120.30, tz:8},
    {n:'基隆', lng:121.74, tz:8}, {n:'新竹', lng:120.97, tz:8}, {n:'苗栗', lng:120.82, tz:8},
    {n:'彰化', lng:120.54, tz:8}, {n:'南投', lng:120.68, tz:8}, {n:'雲林', lng:120.43, tz:8},
    {n:'嘉義', lng:120.45, tz:8}, {n:'屏東', lng:120.49, tz:8}, {n:'宜蘭', lng:121.75, tz:8},
    {n:'花蓮', lng:121.60, tz:8}, {n:'台東', lng:121.14, tz:8}, {n:'澎湖', lng:119.57, tz:8},
    {n:'金門', lng:118.32, tz:8}, {n:'馬祖', lng:119.95, tz:8},
    {n:'香港', lng:114.17, tz:8}, {n:'澳門', lng:113.54, tz:8}, {n:'新加坡', lng:103.82, tz:8},
    {n:'吉隆坡', lng:101.69, tz:8}, {n:'北京', lng:116.40, tz:8}, {n:'上海', lng:121.47, tz:8},
    {n:'廣州', lng:113.26, tz:8}, {n:'成都', lng:104.07, tz:8},
    {n:'東京', lng:139.69, tz:9}, {n:'首爾', lng:126.98, tz:9},
    {n:'洛杉磯', lng:-118.24, tz:-8}, {n:'舊金山', lng:-122.42, tz:-8}, {n:'溫哥華', lng:-123.12, tz:-8},
    {n:'紐約', lng:-74.01, tz:-5}, {n:'多倫多', lng:-79.38, tz:-5},
    {n:'倫敦', lng:-0.13, tz:0}, {n:'雪梨', lng:151.21, tz:11},
    {n:'其他／不確定（用 120°E 台灣標準時）', lng:120, tz:8}
  ];

  var _wrap = null;
  var _phase = 'input';      // input | result
  var _gender = 'male';      // male | female（大運順逆必需）
  var _bazi = null;          // computeBazi + enhanceBazi 結果
  var _meta = null;          // 排盤輸入摘要（真太陽時等）
  var _lastPrompt = '';

  // ════════════════════════════════════════════════════════
  //  容器 + CSS（命名空間 bzx-，自帶不依賴 style.css）
  // ════════════════════════════════════════════════════════
  function _getWrap() {
    if (_wrap) return _wrap;
    _wrap = document.createElement('div');
    _wrap.id = 'bzx-screen';
    _wrap.style.cssText = 'display:none;position:fixed;top:0;left:0;right:0;bottom:0;width:100%;height:100%;z-index:99999;overflow-y:auto;overflow-x:hidden;background:#0a0a0f;-webkit-overflow-scrolling:touch;';
    document.body.appendChild(_wrap);
    var css = document.createElement('style');
    css.textContent = [
      '#bzx-screen *{box-sizing:border-box}',
      '.bzx-container{max-width:480px;margin:0 auto;padding:1rem .8rem 3rem;font-family:"Noto Serif TC",Georgia,serif;color:#e8e0d0}',
      '.bzx-header{text-align:center;padding:1.5rem 0 1rem}',
      '.bzx-header h1{font-size:1.5rem;color:'+GOLD+';letter-spacing:8px;margin-bottom:.3rem}',
      '.bzx-header p{font-size:.75rem;color:rgba(232,224,208,.5);letter-spacing:2px}',
      '.bzx-back{color:rgba(232,224,208,.5);text-decoration:none;font-size:.82rem;display:inline-block;margin-bottom:.5rem;cursor:pointer}',
      '.bzx-section{background:#13131a;border:1px solid rgba(201,168,76,.15);border-radius:14px;padding:1.1rem;margin-bottom:.8rem}',
      '.bzx-section-title{font-size:.82rem;color:'+GOLD+';margin-bottom:.7rem}',
      '.bzx-label{font-size:.72rem;color:rgba(232,224,208,.55);margin:.2rem 0 .35rem;display:block}',
      // 性別
      '.bzx-gender{display:grid;grid-template-columns:1fr 1fr;gap:.4rem}',
      '.bzx-gbtn{padding:.6rem;border-radius:10px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.03);color:rgba(232,224,208,.55);cursor:pointer;font-family:inherit;font-size:.9rem;transition:all .2s}',
      '.bzx-gbtn.active{border-color:rgba(201,168,76,.5);background:rgba(201,168,76,.08);color:'+GOLD+'}',
      // 輸入
      '.bzx-input,.bzx-select{width:100%;padding:.62rem;border-radius:10px;border:1px solid rgba(201,168,76,.3);background:rgba(255,255,255,.03);color:#e8e0d0;font-family:inherit;font-size:.9rem;outline:none}',
      '.bzx-input:focus,.bzx-select:focus{border-color:rgba(201,168,76,.5);box-shadow:0 0 12px rgba(201,168,76,.1)}',
      '.bzx-select option{background:#13131a;color:#e8e0d0}',
      '.bzx-row2{display:grid;grid-template-columns:1fr auto;gap:.5rem;align-items:center}',
      '.bzx-chk{display:flex;align-items:center;gap:.35rem;font-size:.72rem;color:rgba(232,224,208,.6);white-space:nowrap;cursor:pointer}',
      '.bzx-chk input{accent-color:'+GOLD+';width:15px;height:15px}',
      '.bzx-q-input{width:100%;padding:.65rem;border-radius:10px;border:1px solid rgba(201,168,76,.3);background:rgba(255,255,255,.03);color:#e8e0d0;font-family:inherit;font-size:.85rem;resize:none;outline:none;line-height:1.6}',
      '.bzx-q-input::placeholder{color:rgba(232,224,208,.4)}',
      '.bzx-q-input:focus{border-color:rgba(201,168,76,.5)}',
      '.bzx-hint{font-size:.68rem;color:rgba(232,224,208,.42);margin-top:.55rem;line-height:1.6}',
      '.bzx-cast-btn{display:block;width:100%;padding:.85rem;border-radius:12px;border:1.5px solid rgba(201,168,76,.5);background:linear-gradient(135deg,rgba(201,168,76,.12),rgba(201,168,76,.04));color:'+GOLD+';font-family:inherit;font-size:.95rem;font-weight:600;letter-spacing:4px;cursor:pointer;transition:all .3s;margin-top:.4rem}',
      '.bzx-cast-btn:active{transform:scale(.97)}',
      // 四柱顯示
      '.bzx-pillars{display:grid;grid-template-columns:repeat(4,1fr);gap:.4rem;margin:.3rem 0 .2rem}',
      '.bzx-pil{border:1px solid rgba(201,168,76,.22);border-radius:12px;background:linear-gradient(145deg,rgba(30,25,15,.9),rgba(20,15,10,.95));padding:.55rem .25rem;text-align:center;animation:bzxIn .45s ease-out both}',
      '@keyframes bzxIn{from{opacity:0;transform:translateY(12px) scale(.92)}to{opacity:1;transform:none}}',
      '.bzx-pil .role{font-size:.58rem;color:rgba(232,224,208,.42);letter-spacing:1px}',
      '.bzx-pil .god{font-size:.6rem;color:'+GOLD+';min-height:.8rem;margin:.1rem 0}',
      '.bzx-pil .gz{font-size:1.5rem;color:#ffeab8;font-family:"Noto Serif TC",serif;line-height:1.25;margin:.05rem 0}',
      '.bzx-pil .cg{font-size:.56rem;color:rgba(232,224,208,.5);line-height:1.3;margin-top:.15rem;min-height:1.6rem}',
      '.bzx-summary{margin-top:.7rem;padding:.75rem .85rem;border-radius:11px;border:1px solid rgba(201,168,76,.2);background:rgba(201,168,76,.04);line-height:1.7}',
      '.bzx-summary .sline{font-size:.78rem;color:rgba(232,224,208,.7)}',
      '.bzx-summary .sline b{color:#ffeab8;font-weight:600}',
      '.bzx-summary .sgold{color:'+GOLD+'}',
      // AI 卡
      '.bzx-ai-card{background:linear-gradient(135deg,rgba(30,25,15,.95),rgba(20,15,8,.98));border:1px solid rgba(201,168,76,.3);border-radius:14px;padding:1rem;margin-top:1rem;text-align:center;animation:bzxIn .6s ease-out}',
      '.bzx-ai-title{font-size:.95rem;color:'+GOLD+';letter-spacing:3px;margin-bottom:.5rem}',
      '.bzx-ai-desc{font-size:.72rem;color:rgba(232,224,208,.5);line-height:1.6;margin-bottom:.7rem}',
      '.bzx-ai-copy-btn{display:block;width:100%;padding:.75rem;border-radius:12px;border:1.5px solid rgba(201,168,76,.5);background:linear-gradient(135deg,rgba(201,168,76,.12),rgba(201,168,76,.04));color:'+GOLD+';font-family:inherit;font-size:.88rem;font-weight:600;letter-spacing:3px;cursor:pointer;transition:all .3s;margin-bottom:.5rem}',
      '.bzx-ai-copy-btn:active{transform:scale(.97)}',
      '.bzx-ai-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:.3rem;margin:.5rem 0}',
      '.bzx-ai-sc{display:flex;flex-direction:column;align-items:center;gap:.2rem;padding:.35rem .1rem;border-radius:10px;border:1px solid rgba(255,255,255,.06);background:rgba(255,255,255,.02);cursor:pointer;transition:all .2s;font-family:inherit}',
      '.bzx-ai-sc:active{transform:scale(.91)}',
      '.bzx-ai-sc img{width:30px;height:30px;border-radius:8px}',
      '.bzx-ai-sc span{font-size:.55rem;color:rgba(232,224,208,.5);font-weight:600}',
      '.bzx-ai-foot{font-size:.6rem;color:rgba(232,224,208,.4);margin-top:.3rem;font-style:italic}',
      '.bzx-reset-btn{display:inline-block;padding:.45rem 1rem;border-radius:10px;border:1px solid rgba(255,255,255,.1);background:transparent;color:rgba(232,224,208,.5);cursor:pointer;font-family:inherit;font-size:.78rem;margin-top:.8rem}',
      '.bzx-footer{text-align:center;font-size:.6rem;color:rgba(232,224,208,.4);margin-top:1.5rem;letter-spacing:1px;line-height:1.8}',
      // ── 過場動畫（天干環 + 太極）──
      '.bzx-load{position:fixed;inset:0;z-index:100000;display:flex;flex-direction:column;align-items:center;justify-content:center;background:radial-gradient(120% 90% at 50% 30%,rgba(46,36,12,.5),rgba(12,9,5,.97) 62%,#0a0704 100%);overflow:hidden}',
      '.bzx-stars{position:absolute;inset:0;pointer-events:none;overflow:hidden}',
      '.bzx-stars i{position:absolute;bottom:-6%;width:2px;height:2px;border-radius:50%;background:rgba(212,175,55,.7);box-shadow:0 0 6px rgba(212,175,55,.6);animation:bzxRise var(--d,5s) linear var(--dl,0s) infinite;opacity:0}',
      '@keyframes bzxRise{0%{transform:translateY(0) scale(.6);opacity:0}12%{opacity:.9}88%{opacity:.7}100%{transform:translateY(-108vh) scale(1);opacity:0}}',
      '.bzx-ring{position:relative;width:min(310px,82vw);aspect-ratio:1;display:flex;align-items:center;justify-content:center;opacity:0;transform:scale(.9);animation:bzxRingIn .7s cubic-bezier(.16,1,.3,1) forwards}',
      '@keyframes bzxRingIn{to{opacity:1;transform:scale(1)}}',
      // 十天干環
      '.bzx-gan{position:absolute;left:50%;top:50%;font-size:1.45rem;color:rgba(212,175,55,.45);font-family:"Noto Serif TC",serif;transform:translate(-50%,-50%) rotate(var(--a)) translateY(calc(min(150px,40vw) * -1)) rotate(calc(var(--a) * -1)) scale(.6);opacity:0;animation:bzxGanIn .5s ease forwards;animation-delay:var(--td,0s);text-shadow:0 0 10px rgba(212,175,55,.4)}',
      '@keyframes bzxGanIn{to{opacity:1;transform:translate(-50%,-50%) rotate(var(--a)) translateY(calc(min(150px,40vw) * -1)) rotate(calc(var(--a) * -1)) scale(1)}}',
      // 中央太極
      '.bzx-taiji{width:96px;height:96px;border-radius:50%;position:relative;opacity:0;animation:bzxTaijiIn .9s ease .6s forwards,bzxSpin 7s linear 1.1s infinite;background:conic-gradient(from 0deg,#f4ecd6 0deg 180deg,#1a140a 180deg 360deg);box-shadow:0 0 40px rgba(212,175,55,.45),inset 0 0 20px rgba(0,0,0,.4)}',
      '@keyframes bzxTaijiIn{to{opacity:1}}',
      '@keyframes bzxSpin{to{transform:rotate(360deg)}}',
      '.bzx-taiji::before,.bzx-taiji::after{content:"";position:absolute;left:50%;width:48px;height:48px;border-radius:50%;transform:translateX(-50%)}',
      '.bzx-taiji::before{top:0;background:#f4ecd6}',
      '.bzx-taiji::after{bottom:0;background:#1a140a}',
      '.bzx-taiji span{position:absolute;left:50%;width:16px;height:16px;border-radius:50%;transform:translateX(-50%);z-index:2}',
      '.bzx-taiji span.y{top:16px;background:#1a140a}',
      '.bzx-taiji span.n{bottom:16px;background:#f4ecd6}',
      '.bzx-load-status{margin-top:1.6rem;font-family:"Noto Serif TC",serif;font-size:1.05rem;font-weight:700;color:'+GOLD+';letter-spacing:.12em;text-shadow:0 2px 14px rgba(0,0,0,.6);transition:opacity .3s;min-height:1.4rem;text-align:center}',
      '.bzx-load-sub{margin-top:.4rem;font-size:.74rem;color:rgba(212,175,55,.55);letter-spacing:.08em;transition:opacity .3s;min-height:1.1rem;text-align:center}'
    ].join('\n');
    document.head.appendChild(css);
    return _wrap;
  }

  // ════════════════════════════════════════════════════════
  //  畫面
  // ════════════════════════════════════════════════════════
  function _render() {
    var w = _getWrap();
    var h = '<div class="bzx-container">';
    h += '<a class="bzx-back" onclick="_baziClose()">← 返回靜月之光</a>';
    h += '<div class="bzx-header"><h1>八 字 命 理</h1><p>子平 ・ 四柱八字 ・ 真太陽時</p></div>';

    if (_phase === 'input') {
      h += '<div class="bzx-section"><div class="bzx-section-title">✦ 出生資料</div>';
      h += '<span class="bzx-label">性別（影響大運順逆，必填）</span>';
      h += '<div class="bzx-gender">';
      h += '<button class="bzx-gbtn' + (_gender==='male'?' active':'') + '" onclick="_baziSetGender(\'male\')">♂ 男</button>';
      h += '<button class="bzx-gbtn' + (_gender==='female'?' active':'') + '" onclick="_baziSetGender(\'female\')">♀ 女</button>';
      h += '</div>';
      h += '<span class="bzx-label" style="margin-top:.8rem">出生日期（國曆）</span>';
      h += '<input type="date" class="bzx-input" id="bzx-date" min="1920-01-01" max="2050-12-31">';
      h += '<span class="bzx-label" style="margin-top:.8rem">出生時間</span>';
      h += '<div class="bzx-row2"><input type="time" class="bzx-input" id="bzx-time">';
      h += '<label class="bzx-chk"><input type="checkbox" id="bzx-unknown" onchange="_baziToggleUnknown()">不知時辰</label></div>';
      h += '<span class="bzx-label" style="margin-top:.8rem">出生地點（真太陽時校正）</span>';
      h += '<select class="bzx-select" id="bzx-city">';
      for (var c=0;c<CITY.length;c++) h += '<option value="'+c+'"'+(c===0?' selected':'')+'>'+CITY[c].n+'</option>';
      h += '</select>';
      h += '<div class="bzx-hint">真太陽時＝鐘錶時間依出生地經度＋均時差校正，子平排盤以真太陽時為準。不知時辰會以午時暫排，時柱與時上判讀僅供參考。</div>';
      h += '</div>';

      h += '<div class="bzx-section"><div class="bzx-section-title">✦ 想問什麼？（選填）</div>';
      h += '<textarea class="bzx-q-input" id="bzx-q" rows="2" maxlength="200" placeholder="留空＝整體命格；或問具體事，如：今年事業能不能換跑道？"></textarea></div>';

      h += '<button class="bzx-cast-btn" onclick="_baziDoCast()">✦ 排 盤 ✦</button>';
    } else {
      h += _renderResult();
    }
    h += '<div class="bzx-footer">靜月之光 ・ jingyue.uk<br>八字命理 ・ 子平真詮 ・ 窮通寶鑑</div></div>';
    w.innerHTML = h;
  }

  function _renderResult() {
    var b = _bazi || {};
    var P = b.pillars || {};
    var G = b.gods || {};
    var CG = b.cangGan || {};
    var keys = ['year','month','day','hour'];
    var roles = {year:'年柱', month:'月柱', day:'日柱', hour:'時柱'};

    var h = '<div class="bzx-section"><div class="bzx-section-title">✦ 四柱八字</div><div class="bzx-pillars">';
    for (var i=0;i<keys.length;i++) {
      var k = keys[i], pil = P[k] || {}, gd = G[k] || {};
      var godTxt = (k==='day') ? '日主' : _fmt(gd.gan);
      var cg = Array.isArray(CG[k]) ? CG[k].join('') : '';
      h += '<div class="bzx-pil" style="animation-delay:'+(i*0.08)+'s">';
      h += '<div class="role">'+roles[k]+'</div>';
      h += '<div class="god">'+(godTxt||'')+'</div>';
      h += '<div class="gz">'+(pil.gan||'?')+'<br>'+(pil.zhi||'?')+'</div>';
      h += '<div class="cg">'+(cg?'藏 '+cg:'')+'</div>';
      h += '</div>';
    }
    h += '</div>';

    // 命格摘要
    var dm = b.dm||'', dmEl = b.dmEl||'';
    var geTxt = b.specialStructure ? (b.specialStructure.type||'特殊格局')
              : (b.zhengGe && b.zhengGe.geName ? b.zhengGe.geName : '');
    var favTxt = Array.isArray(b.fav)? b.fav.join('、') : '';
    var unfavTxt = Array.isArray(b.unfav)? b.unfav.join('、') : '';
    var curDy = _currentDayun(b);
    h += '<div class="bzx-summary">';
    h += '<div class="sline">日主 <b>'+dm+'</b>（'+dmEl+'行）・ <span class="sgold">'+(b.strongLevel||(b.strong?'身強':'身弱'))+'</span>'+(b.structType?'（'+b.structType+'）':'')+'</div>';
    if (geTxt) h += '<div class="sline">格局：<b>'+geTxt+'</b></div>';
    if (favTxt) h += '<div class="sline">用神：<span class="sgold">'+favTxt+'</span>'+(unfavTxt?' ・ 忌神：'+unfavTxt:'')+'</div>';
    if (b.tiaohou && b.tiaohou.need) h += '<div class="sline">調候：'+(b.tiaohou.need.join('、'))+'（'+(b.tiaohou.reason||'窮通寶鑑')+'）</div>';
    if (curDy) h += '<div class="sline">現行大運：<b>'+(curDy.gz||'')+'</b>'+((curDy.ageStart!=null)?'（'+curDy.ageStart+'～'+curDy.ageEnd+'歲）':'')+'</div>';
    if (_meta && _meta.solarNote) h += '<div class="sline" style="font-size:.68rem;opacity:.7">真太陽時'+_meta.solarNote+'</div>';
    h += '</div></div>';

    // AI 卡
    h += '<div class="bzx-ai-card"><div class="bzx-ai-title">🌙 AI 深度解讀</div>';
    h += '<div class="bzx-ai-desc">輕觸按鈕複製，貼到 AI 對話送出即可。提示詞已含完整命盤與斷法。</div>';
    h += '<button class="bzx-ai-copy-btn" onclick="_baziCopy()">✦ 一鍵複製八字提示詞 ✦</button>';
    h += '<div class="bzx-ai-grid">';
    for (var a=0;a<AI_LIST.length;a++) {
      var ai = AI_LIST[a];
      h += '<button class="bzx-ai-sc" onclick="_baziOpenAI(\''+ai.id+'\',\''+ai.url+'\',this)">';
      h += '<img src="ai-icons/ai-'+ai.id+'.png" alt="'+ai.name+'"><span>'+ai.name+'</span></button>';
    }
    h += '</div><div class="bzx-ai-foot">點擊 AI 按鈕 → 自動複製＋開啟 → 貼上送出</div></div>';
    h += '<div style="text-align:center"><button class="bzx-reset-btn" onclick="_baziReset()">↺ 重新排盤</button></div>';
    return h;
  }

  // ════════════════════════════════════════════════════════
  //  過場動畫（天干環 + 太極）
  // ════════════════════════════════════════════════════════
  function _showLoading(done) {
    var ov = document.createElement('div');
    ov.className = 'bzx-load';
    ov.id = 'bzx-loading';
    var stars = '';
    for (var i=0;i<24;i++) stars += '<i style="left:'+(Math.random()*100).toFixed(1)+'%;--d:'+(3.5+Math.random()*4).toFixed(1)+'s;--dl:'+(Math.random()*5).toFixed(1)+'s;'+(Math.random()>.7?'width:3px;height:3px;':'')+'"></i>';
    var gan = '';
    for (var k=0;k<10;k++) {
      gan += '<div class="bzx-gan" style="--a:'+(k*36)+'deg;--td:'+(0.65+k*0.08).toFixed(2)+'s">'+TIANGAN[k]+'</div>';
    }
    ov.innerHTML =
      '<div class="bzx-stars">'+stars+'</div>' +
      '<div class="bzx-ring">'+gan+
        '<div class="bzx-taiji"><span class="y"></span><span class="n"></span></div>' +
      '</div>' +
      '<div class="bzx-load-status" id="bzx-load-status">凝神靜氣・回到出生那一刻</div>' +
      '<div class="bzx-load-sub" id="bzx-load-sub">八字排盤</div>';
    document.body.appendChild(ov);

    var steps = [
      ['校真太陽時','以出生地經度＋均時差定真時'],
      ['排定四柱','年月日時，依節氣換月'],
      ['藏干透干','人元司令、十神成形'],
      ['權衡旺衰','得令得地得勢，定身強弱'],
      ['格局用神','扶抑／從化＋窮通寶鑑調候'],
      ['大運流年','順逆起運，運程展開']
    ];
    var TOTAL = 3000, per = TOTAL / steps.length;
    steps.forEach(function (s, idx) {
      setTimeout(function () {
        var st = document.getElementById('bzx-load-status'), sb = document.getElementById('bzx-load-sub');
        if (st) { st.style.opacity='0'; setTimeout(function(){ st.textContent=s[0]; st.style.opacity='1'; },150); }
        if (sb) { sb.style.opacity='0'; setTimeout(function(){ sb.textContent=s[1]; sb.style.opacity='1'; },150); }
      }, idx*per);
    });
    setTimeout(function () {
      var o = document.getElementById('bzx-loading');
      if (o) { o.style.transition='opacity .5s'; o.style.opacity='0'; setTimeout(function(){ o.remove(); },500); }
      if (typeof done === 'function') done();
    }, TOTAL + 240);
  }

  // ════════════════════════════════════════════════════════
  //  工具：防呆格式化（任何形狀都不渲染出 [object Object]/undefined）
  // ════════════════════════════════════════════════════════
  function _fmt(v) {
    if (v == null) return '';
    if (typeof v === 'string' || typeof v === 'number') return String(v);
    if (Array.isArray(v)) return v.map(_fmt).filter(Boolean).join('、');
    if (typeof v === 'object') {
      var pick = v.name || v.zh || v.desc || v.text || v.detail || v.label || v.gz || v.type || v.geName || v.note;
      if (pick) return String(pick);
      var parts = [];
      for (var key in v) { if (typeof v[key] === 'string' || typeof v[key] === 'number') parts.push(v[key]); }
      return parts.join(' ');
    }
    return '';
  }

  function _currentDayun(b) {
    if (!b || !Array.isArray(b.dayun)) return null;
    for (var i=0;i<b.dayun.length;i++) { if (b.dayun[i] && b.dayun[i].isCurrent) return b.dayun[i]; }
    return null;
  }

  // ════════════════════════════════════════════════════════
  //  buildBaziPrompt — 把完整命盤組成正統、夠深的提示詞
  // ════════════════════════════════════════════════════════
  function buildBaziPrompt(question, b, meta) {
    var L = [];
    var keys = ['year','month','day','hour'];
    var roleName = {year:'年柱', month:'月柱', day:'日柱', hour:'時柱'};
    var gongName = {year:'年柱（祖上・幼年・根基）', month:'月柱（父母・事業・青年・月令綱領）', day:'日柱（自己・配偶・中年）', hour:'時柱（子女・部屬・晚年）'};
    var P = b.pillars || {}, G = b.gods || {}, CG = b.cangGan || {}, CS = b.cs || {}, NY = b.nayinAll || {};

    L.push('你是一位浸淫子平八字二十年、講話直接見骨的命理師。有人把八字排好了，要你讀成他能用的判斷，不是把術語翻一遍。');
    L.push('');
    if (question) { L.push('問題：' + question); L.push(''); }
    else { L.push('（未指定問題：請依命盤給出整體命格主軸＋當前大運流年的通則判斷。）'); L.push(''); }

    // 命主基本
    var animal = (P.year && P.year.zhi && ZODIAC_ANIMAL[P.year.zhi]) ? ZODIAC_ANIMAL[P.year.zhi] : '';
    L.push('【命主】' + (b.gender === 'female' ? '女命' : '男命') + (animal ? '・屬' + animal : '') + (meta && meta.birthLine ? '・' + meta.birthLine : '') + (meta && meta.solarNote ? '（真太陽時' + meta.solarNote + '）' : ''));
    L.push('');

    // 四柱
    L.push('【四柱八字】');
    keys.forEach(function (k) {
      var pil = P[k] || {}, gd = G[k] || {};
      var ganGod = (k === 'day') ? '日主' : _fmt(gd.gan);
      var zhiGods = (gd.zhi && gd.zhi.length) ? _fmt(gd.zhi) : '';
      var cg = Array.isArray(CG[k]) ? CG[k].join('、') : '';
      L.push('・' + roleName[k] + '：' + (pil.gan || '') + (pil.zhi || '')
        + '　天干十神：' + (ganGod || '—')
        + '　藏干（人元）：' + (cg || '—') + (zhiGods ? '（' + zhiGods + '）' : '')
        + (CS[k] ? '　十二長生：' + _fmt(CS[k]) : '')
        + (NY[k] ? '　納音：' + _fmt(NY[k]) : ''));
    });
    if (b.renyuan) L.push('・人元司令（月令當令之氣）：' + _fmt(b.renyuan));
    var _kw = b.kongwang ? [].concat(b.kongwang.year || [], b.kongwang.day || []).filter(function (v, i, a) { return v && a.indexOf(v) === i; }) : [];
    if (_kw.length) L.push('・空亡：' + _kw.join('、'));
    var _gz = function (o) { return (o && (o.gan || o.zhi)) ? ((o.gan || '') + (o.zhi || '')) + (o.nayin ? '（' + o.nayin + '）' : '') : ''; };
    if (_gz(b.mingGong) || _gz(b.taiYuan)) L.push('・命宮：' + (_gz(b.mingGong) || '—') + (b.taiYuan ? '　胎元：' + _gz(b.taiYuan) : '') + (b.shenGong ? '　身宮：' + _gz(b.shenGong) : ''));
    L.push('六親宮位對照：' + gongName.year + '；' + gongName.month + '；' + gongName.day + '；' + gongName.hour + '。');
    L.push('');

    // 旺衰
    L.push('【日主旺衰】');
    L.push('日主 ' + (b.dm || '') + '（' + (b.dmEl || '') + '行），生於 ' + ((P.month && P.month.zhi) || '') + '月。');
    L.push('得令：' + (b.deLing ? '是（月令幫身）' : '否（失令）')
      + '　得地：' + (b.deDi ? '是（日支有根）' : '否')
      + '　得勢：' + (b.deShi ? '是（天干有比劫/印）' : '否') + '。');
    L.push('旺衰判定：' + (b.strongLevel || (b.strong ? '身強' : '身弱')) + (b.selfPts != null ? '（自黨分 ' + Math.round(b.selfPts) + '）' : '') + (b.isNeutral ? '——中和近界，用神宜靈活' : '') + '。');
    if (b.strengthNote) L.push('※ ' + b.strengthNote);
    else if (b.strengthConflict && b.strengthConflictReason) L.push('※ 旺衰須複核：' + b.strengthConflictReason + '（判吉凶時把這個不確定講出來，別硬定強弱）。');
    if (b.ep) {
      var epParts = ['木', '火', '土', '金', '水'].map(function (e) { return e + (b.ep[e] != null ? Math.round(b.ep[e]) + '%' : '—'); });
      L.push('五行佔比：' + epParts.join('、') + '。');
    }
    if (b.energyFlow && b.energyFlow.sortedPower) L.push('五行能量流：' + _fmt(b.energyFlow.sortedPower) + (b.energyFlow.breakPoint ? '；阻斷：' + _fmt(b.energyFlow.breakPoint) : '') + '。');
    L.push('');

    // 旺衰病象（母多滅子／殺重身輕…）— 旺衰落點，直接決定用神方向，最該講透
    if (Array.isArray(b.strengthPattern) && b.strengthPattern.length) {
      L.push('【旺衰病象（用神方向的關鍵，務必先講透）】');
      b.strengthPattern.forEach(function (s) { L.push('・' + s.zh); });
      L.push('');
    }

    // 格局
    L.push('【格局】');
    if (b.specialStructure) {
      var ss = b.specialStructure;
      L.push('★ 特殊格局：' + (ss.type || '') + '。' + (ss.desc || ''));
      L.push('此格喜：' + (Array.isArray(ss.favEls) ? ss.favEls.join('、') : '') + '；忌：' + (Array.isArray(ss.unfavEls) ? ss.unfavEls.join('、') : '') + (ss.huaEl ? '；化神五行：' + ss.huaEl : '') + '。');
      L.push('注意：從格/化氣格「順勢」為要——順用神則大吉，逆之（見破格五行）則大凶，比扶抑格更極端。先確認格局成立（無破格字）再論。');
    } else if (b.zhengGe && b.zhengGe.geName) {
      var zg = b.zhengGe;
      L.push('普通格局（扶抑法）：' + zg.geName + (zg.geGod ? '（格神：' + zg.geGod + '）' : '') + '。');
      if (zg.zh) L.push(zg.zh);
    } else {
      L.push('格局不顯（月令無明顯透出），以扶抑用神為主軸論。');
    }
    if (b.guanShaMix && b.guanShaMix.mixed) L.push(b.guanShaMix.zh);
    L.push('');

    // 用神喜忌（斷吉凶的綱）
    L.push('【用神喜忌（這是斷吉凶的綱，務必先定後論）】');
    L.push('用神（喜）：' + (Array.isArray(b.fav) ? b.fav.join('、') : '—') + '　忌神：' + (Array.isArray(b.unfav) ? b.unfav.join('、') : '—'));
    if (b.medicineGod) L.push('病藥用神：' + _fmt(b.medicineGod) + '（命局有病，此為藥）。');
    if (b.relayGod) L.push('通關用神：' + _fmt(b.relayGod) + '（兩氣相戰，此為和解）。');
    if (b.tiaohou && b.tiaohou.need && b.tiaohou.need.length) {
      L.push('調候用神（《窮通寶鑑》）：需 ' + b.tiaohou.need.join('、') + (b.tiaohou.avoid && b.tiaohou.avoid.length ? '；忌 ' + b.tiaohou.avoid.join('、') : '') + '。' + (b.tiaohou.reason || '') + '——' + (b.tiaohou.detail || ''));
      if (b.tiaohou.priority) L.push('調候優先級：' + b.tiaohou.priority + (/第一|輔助/.test(b.tiaohou.priority) ? '（寒燥命調候優先，用神再強也要先暖／先潤）' : '') + '。');
    } else {
      L.push('調候：本命寒燥不偏，調候五行不缺，以扶抑用神為主即可。');
    }
    if (b.wuxingStance) {
      L.push('五行喜忌全表（' + (b.specialStructure ? '從化格' : (b.strong ? '身強' : '身弱')) + '；判大運、流年都以此為準）：' + b.wuxingStance.summary + '。');
      if (b.wuxingStance.conflict && b.wuxingStance.role) {
        var rl = b.wuxingStance.role, byEl = {}; for (var rk in rl) byEl[rl[rk]] = rk;
        L.push('※ 旺衰在界線：若取身弱，用印（' + byEl['印'] + '）、比劫（' + byEl['比劫'] + '）扶身；若取偏強，則喜食傷（' + byEl['食傷'] + '）、財（' + byEl['財'] + '）、官殺（' + byEl['官殺'] + '）洩耗。兩向都先備著，以大運流年實際應驗校準，別硬定一邊。');
      }
    }
    L.push('');

    // 天干五合（含日主之合 → 合官/合財，重要斷語素材）
    if (Array.isArray(b.tianGanHe) && b.tianGanHe.length) {
      L.push('【天干五合】');
      b.tianGanHe.forEach(function (h) { L.push('・' + h.zh); });
      L.push('');
    }

    // 刑沖合害 + 六親
    var inter = [];
    if (b.branchInteractions) inter.push(_fmt(b.branchInteractions));
    if (b.hiddenInteractions && b.hiddenInteractions.length) inter.push(_fmt(b.hiddenInteractions));
    if (inter.length && inter.join('').trim()) {
      L.push('【刑沖合害・暗合拱沖】' + inter.filter(Boolean).join('；'));
      L.push('（沖到喜用為凶、沖到忌神反吉；合化要看化神是否得月令。落到上面的六親宮位看影響的是哪個人事領域。）');
      L.push('');
    }

    // 神煞（材料給全；鐵律仍要 AI 只挑相關者寫）
    var ssNames = [];
    if (Array.isArray(b.shensha)) ssNames = ssNames.concat(b.shensha);
    if (Array.isArray(b.extraShenSha)) ssNames = ssNames.concat(b.extraShenSha.map(function (s) { return (s && s.name) ? s.name : _fmt(s); }));
    ssNames = ssNames.filter(Boolean).filter(function (v, i, a) { return a.indexOf(v) === i; });
    if (ssNames.length) {
      L.push('【神煞（輔助；只挑與問題相關且有力者用，不要全列、不要嚇人）】');
      L.push('全部：' + ssNames.join('、') + '。');
      var ssDetail = (Array.isArray(b.extraShenSha) ? b.extraShenSha : []).map(function (s) { return (s && s.zh) ? '・' + s.zh : ''; }).filter(Boolean);
      if (ssDetail.length) L.push(ssDetail.join('\n'));
      L.push('');
    }

    // 十神組合
    if (Array.isArray(b.tenGodCombos) && b.tenGodCombos.length) {
      var combo = b.tenGodCombos.map(_fmt).filter(Boolean);
      if (combo.length) { L.push('【十神組合特徵】' + combo.join('；')); L.push(''); }
    }

    // 大運
    L.push('【大運】' + (b.qiyun && b.qiyun.startAge != null ? (b.gender === 'female' ? '女命' : '男命') + '，起運 ' + b.qiyun.startAge + ' 歲。' : '') + '排列順逆依年干陰陽×性別定（陽男陰女順排、陰男陽女逆排）。');
    if (Array.isArray(b.dayun)) {
      var lines = [];
      b.dayun.forEach(function (d) {
        if (!d || d.gz === '小運') return;
        var luck = d.luckLabel || '';
        var seg = (d.gz || '') + '（' + (d.ageStart != null ? d.ageStart + '–' + d.ageEnd + '歲' : '') + '）'
          + (d.god ? ' ' + d.god : '') + (luck ? '〔' + luck + '〕' : '') + (d.isCurrent ? ' ★現行' : '');
        lines.push(seg);
      });
      if (lines.length) L.push('大運序：' + lines.join('　'));
      var cur = _currentDayun(b);
      if (cur) {
        var curV = cur.luckByStance;
        L.push('現行大運 ' + (cur.gz || '') + (cur.luckLabel ? '〔' + cur.luckLabel + '〕' : '') + '：天干十神 ' + (cur.god || '—') + '（管前五年）、地支十神 ' + (cur.zGod || '—') + '（管後五年）。'
          + (curV ? '以喜忌論：前五年走' + curV.ganEl + '（' + curV.gan + '）、後五年走' + curV.zhiEl + '（' + curV.zhi + '）。' : ''));
        var ph = cur.phaseNow;
        if (ph) {
          var _lv = function (x) { return x === '順' ? '順（喜用到位）' : (x === '背' ? '背（忌神當道，不利）' : '平'); };
          L.push('★ 現在實際走到：【' + ph.half + '：' + ph.gz + '（' + ph.el + '，' + ph.god + '）】，當下運勢＝' + _lv(ph.luck) + '。這才是「現在」的運，不要用整步大運前後平均來判。'
            + '約至西元 ' + ph.untilYear + ' 年，' + (ph.nextGz ? '走完前半、轉入後五年 ' + ph.nextGz + '（' + ph.nextEl + '，' + _lv(ph.nextLuck) + '）' : '此大運交脫、換下一步') + '。');
        }
        L.push('（判斷現運吉凶：拿大運天干（前五年）、地支（後五年）的五行去比對上面的「五行喜忌全表」——走喜用則順、走忌神則背；再看大運是否沖合原局喜用。）');
      }
    }
    if (b.liuNianGZ) L.push('今年流年：' + _fmt(b.liuNianGZ) + (Array.isArray(b.liuYue) && b.liuYue.length ? '；流月重點：' + _fmt(b.liuYue) : '') + '。');
    if (b.suiYunBingLin) { var sybl = _fmt(b.suiYunBingLin); if (sybl) L.push('歲運併臨提醒：' + sybl + '。'); }
    L.push('');

    // 鐵律
    L.push('【斷命鐵律（違反就是失敗）】');
    L.push('①結論先行：第一句就正面回答他問的事（能不能／會不會／何時／往哪走）。沒指定問題就先用一句話點出命格主軸與當前運勢基調。');
    L.push('②先定旺衰格局、再論吉凶：先講身強／身弱（或從格／化氣），這決定用神方向；用神是綱——喜用到位＝吉，忌神當道＝凶。據實說，別只報十神名詞。');
    L.push('③調候疊加：寒燥命（冬生需火暖、夏生需水潤等）調候為第一優先，用神再強也要先解寒燥。已附《窮通寶鑑》調候，缺則直說缺什麼。');
    L.push('④大運流年要落地：用神／忌神對上大運、流年五行的生剋，定當下幾年的吉凶。講清楚現在這步運幫不幫、何時轉、為什麼是那時候，不要只說「會好」「快了」。');
    L.push('⑤神煞別亂套：神煞是輔助，只挑跟問題相關、且力量明顯者（如貴人、桃花、驛馬、羊刃）來點題，不要把十幾個神煞全背、更不要拿凶煞嚇人。');
    L.push('⑥刑沖合害看實質、落到六親宮位：沖喜用為凶、沖忌神反吉；合化要看化神是否得令。沖到哪一柱，就講那一柱對應的人事領域（年祖上根基／月父母事業／日自己配偶／時子女晚輩）。');
    L.push('⑦壞消息就是壞消息：忌神當道、用神被剋、大運走背——直接講不利在哪、會怎麼發生，並給「該補什麼五行、該主動做什麼」的具體方向，不可用「考驗／轉機／成長」帶過。');
    L.push('⑧挑最強訊號深挖：把「旺衰 → 用神 → 大運流年」這條主線講透，配合最關鍵的格局與一兩個神煞／刑沖，不要每個欄位蜻蜓點水。');
    L.push('⑨不要用粗體標題分類、不要逐柱逐欄報告，像跟人面對面講話一樣自然過渡。');
    L.push('⑩只依命盤與生剋推，不臆測他的心理動機、不反問他；盤上看不出來就說看不出來，不硬編。');
    L.push('');

    // 完整性清單
    L.push('【完整性清單（寫完前自我核對，但不要為湊字灌水）】');
    L.push('□ 第一句直接回答了問題　□ 先定旺衰格局、以用神為綱下了明確吉凶　□ 調候有疊進判斷');
    L.push('□ 大運流年落地（現在這步幫不幫、何時轉、為什麼）　□ 相關神煞／刑沖落到六親宮位　□ 不利處直說＋可行的補救（補什麼五行、做什麼）');
    L.push('');

    // 輸出格式 + 水晶收尾
    L.push('【輸出格式】');
    L.push('繁體中文，像命理師當面講話，不是分析報告。第一句給結論，之後一段段推進，每段帶新資訊、同一結論只講一次。不要列表格、不要粗體小標、不要逐柱報告。');
    L.push('收尾 2–3 句：依用神／喜神五行（缺什麼補什麼；若用神被剋，取能化解、生扶用神的五行），自然推薦一種適合隨身的水晶／能量石幫他補氣場（實務輔助、非八字原理），語氣平實不推銷，可輕附蝦皮去處 ' + SHOPEE + ' 。只講一種、只在最後。');

    return L.join('\n');
  }

  // ════════════════════════════════════════════════════════
  //  排盤（呼叫既有引擎，不重造）
  // ════════════════════════════════════════════════════════
  function _doCast() {
    var dateEl = document.getElementById('bzx-date');
    var timeEl = document.getElementById('bzx-time');
    var unknownEl = document.getElementById('bzx-unknown');
    var cityEl = document.getElementById('bzx-city');
    var qEl = document.getElementById('bzx-q');

    var dv = dateEl ? dateEl.value : '';
    if (!dv) { alert('請選擇出生日期（國曆）。'); return; }
    var dp = dv.split('-');
    var y = parseInt(dp[0], 10), m = parseInt(dp[1], 10), d = parseInt(dp[2], 10);
    if (!y || !m || !d) { alert('出生日期格式不正確。'); return; }
    if (y < 1920 || y > 2050) { alert('出生年需在 1920–2050 之間（排盤節氣表範圍）。'); return; }

    var unknown = unknownEl ? unknownEl.checked : false;
    var hh = 12, mm = 0;
    if (!unknown) {
      var tv = timeEl ? timeEl.value : '';
      if (!tv) { alert('請選擇出生時間，或勾選「不知時辰」。'); return; }
      var tp = tv.split(':');
      hh = parseInt(tp[0], 10); mm = parseInt(tp[1], 10);
      if (isNaN(hh) || isNaN(mm)) { alert('出生時間格式不正確。'); return; }
    }

    var ci = cityEl ? parseInt(cityEl.value, 10) : 0;
    var city = CITY[ci] || CITY[CITY.length - 1];
    var question = qEl ? qEl.value.trim() : '';

    if (typeof window.computeBazi !== 'function' && typeof computeBazi !== 'function') {
      // 引擎還沒背景載入完 → 即時補載 bazi.js / bazi_upgrade.js / solar-location.js 再排
      _ensureEngine(function (ok) {
        if (!ok) { alert('八字引擎載入失敗：請確認 JS/bazi.js、bazi_upgrade.js、solar-location.js 已上傳，並強制重新整理。'); return; }
        _castWith(y, m, d, hh, mm, unknown, city, question);
      });
      return;
    }
    _castWith(y, m, d, hh, mm, unknown, city, question);
  }

  // 確保排盤引擎已載入（缺則依序補載；通常進站 4 秒內已背景載入，這裡只是保險）
  function _ensureEngine(cb) {
    var need = [];
    if (typeof calcTrueSolarTime !== 'function') need.push('JS/solar-location.js');
    if (typeof computeBazi !== 'function') need.push('JS/bazi.js');
    if (typeof enhanceBazi !== 'function') need.push('JS/bazi_upgrade.js');
    if (!need.length) { cb(true); return; }
    if (typeof window._jyLazyScript !== 'function') { cb(typeof computeBazi === 'function'); return; }
    var idx = 0;
    (function next() {
      if (idx >= need.length) { cb(typeof computeBazi === 'function'); return; }
      window._jyLazyScript(need[idx++], function () { next(); });
    })();
  }

  // 真正執行：真太陽時校正 → computeBazi → enhanceBazi → buildBaziPrompt
  function _castWith(y, m, d, hh, mm, unknown, city, question) {
    _showLoading(function () {
      try {
        // 真太陽時校正（含經度時差＋均時差）→ 餵 computeBazi
        var sY = y, sM = m, sD = d, sHH = hh, sMM = mm, solarNote = '';
        if (typeof calcTrueSolarTime === 'function') {
          var si = calcTrueSolarTime(y, m, d, hh, mm, city.lng, city.tz);
          if (si) { sY = si.year; sM = si.month; sD = si.day; sHH = si.hour; sMM = si.minute; solarNote = si.note || ''; }
        }
        var bazi = computeBazi(sY, sM, sD, sHH, sMM, _gender);
        if (!bazi) { alert('排盤失敗，請確認出生資料後重試。'); return; }
        try { if (typeof enhanceBazi === 'function') enhanceBazi(bazi); } catch (e) { console.error('[bazi] enhance', e); }

        var pad = function (n) { return (n < 10 ? '0' : '') + n; };
        _meta = {
          gender: _gender,
          birthLine: '國曆 ' + y + '/' + pad(m) + '/' + pad(d) + (unknown ? '（時辰未知，以午時暫排）' : ' ' + pad(hh) + ':' + pad(mm)) + '・' + city.n.replace(/（.*/, ''),
          solarNote: solarNote,
          unknown: unknown
        };
        _bazi = bazi;
        _lastPrompt = buildBaziPrompt(question, bazi, _meta);
        _phase = 'result';
        _render();
        _getWrap().scrollTop = 0;
      } catch (e) {
        console.error('[bazi] cast error', e);
        alert('排盤計算發生問題，請重試或更換出生資料。');
      }
    });
  }

  // ════════════════════════════════════════════════════════
  //  複製 / 開 AI（比照梅花）
  // ════════════════════════════════════════════════════════
  function _fallbackCopy(text) {
    try { var ta = document.createElement('textarea'); ta.value = text; ta.style.cssText = 'position:fixed;left:-9999px'; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta); } catch (e) {}
  }

  // ════════════════════════════════════════════════════════
  //  Public API
  // ════════════════════════════════════════════════════════
  window._baziStandaloneOpen = function () {
    _phase = 'input'; _bazi = null; _meta = null; _lastPrompt = '';
    var w = _getWrap();
    w.style.display = 'block';
    try { document.body.style.overflow = 'hidden'; } catch (e) {}
    _render();
    w.scrollTop = 0;
  };
  window._baziClose = function () {
    var w = _getWrap();
    if (w) w.style.display = 'none';
    try { document.body.style.overflow = ''; } catch (e) {}
  };
  window._baziSetGender = function (g) {
    _gender = g;
    var btns = document.querySelectorAll('#bzx-screen .bzx-gbtn');
    if (btns && btns.length === 2) {
      btns[0].classList.toggle('active', g === 'male');
      btns[1].classList.toggle('active', g === 'female');
    }
  };
  window._baziToggleUnknown = function () {
    var u = document.getElementById('bzx-unknown'), t = document.getElementById('bzx-time');
    if (t) { t.disabled = !!(u && u.checked); t.style.opacity = (u && u.checked) ? '.4' : '1'; }
  };
  window._baziDoCast = function () { _doCast(); };
  window._baziCopy = function () {
    if (!_lastPrompt) return;
    var ok = function () {
      var btn = document.querySelector('#bzx-screen .bzx-ai-copy-btn');
      if (btn) { var o = btn.innerHTML; btn.innerHTML = '✓ 已複製！貼到 AI 送出即可'; setTimeout(function () { btn.innerHTML = o; }, 2500); }
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(_lastPrompt).then(ok, function () { _fallbackCopy(_lastPrompt); ok(); });
    } else { _fallbackCopy(_lastPrompt); ok(); }
  };
  window._baziOpenAI = function (id, url, btn) {
    var open = function () {
      var s = btn && btn.querySelector('span'); var nm = s ? s.textContent : '';
      if (s) s.textContent = '已複製！';
      setTimeout(function () { window.open(url, '_blank'); }, 280);
      setTimeout(function () { if (s) s.textContent = nm; }, 2000);
    };
    if (!_lastPrompt) { window.open(url, '_blank'); return; }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(_lastPrompt).then(open, function () { _fallbackCopy(_lastPrompt); open(); });
    } else { _fallbackCopy(_lastPrompt); open(); }
  };
  window._baziReset = function () {
    _phase = 'input';
    _render();
    _getWrap().scrollTop = 0;
  };

})();
