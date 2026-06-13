/*! bazi-standalone.js — 靜月之光 八字命理獨立流程  [v80.41]
 *  v80.43(2026/6/12)：原局作用全表系統性補齊（沖/六合/三刑含自刑/相破參考級/三合三會全局，全部上網核實
 *    後依正統表直給＋宮位落點＋保守去重）；流年對原局補 害/自刑/子卯刑 標記（沖合由流年重評層處理不重列）。
 *    待 bazi.js 上傳後根治：亥未誤標「半合」（正統：無子午卯酉中神只能稱拱，引擎現重複計算且名詞錯）
 *  v80.42(2026/6/12)：六害補算資料層直給——引擎作用表未含「害」，實測本盤申亥害（年亥月申，《三命通會》
 *    「申亥相害，恃臨官競嫉才能爭進相害」）漏列，競品有列而我們沒有。六害全表：子未丑午寅巳卯辰申亥酉戌；
 *    寅巳標注刑在其中以刑論為主；已含去重防護（引擎日後補害不會重複列）
 *  v80.41(2026/6/12)：①伏吟標記根修——_fuyin 把 pillars[k]（{gan,zhi} 物件）當字串用，String() 成
 *    '[object Object]' 永不匹配＋try/catch 吞錯＝v80.38 起伏吟從未印出（2028戊申撞月柱申、2029己酉撞
 *    日柱酉實測全漏）②收束連結改 Markdown 格式 [靜月之光蝦皮賣場](URL)——犧牲行實測雜訊仍直接插在裸長
 *    網址旁（管線對長URL插零寬字元處理換行），畫面不再出現裸網址＝無處可插；href 收在括號內渲染後不受影響
 *  v80.40(2026/6/12)：蝦皮連結改「犧牲行」結構（網址倒數第二行＋固定收尾句「願你諸事順遂。」墊後）——
 *    多輪實測各工具輸出 URL 尾端黏不可見 Unicode（AI 管線副產物、指令攔不住），雜訊永遠黏輸出最末端，
 *    故網址不可當末行；與 meihua v80.38／ziwei v80.56 同款，全站六提示詞收束統一
 *  v80.38(2026/6/10)：流年伏吟／轉趾煞資料行（今年＋未來三年）——實測 2029 己酉撞日柱乙酉，AI 只能寫「酉又貼近日支」講不出伏吟；文獻《三命通會》轉趾煞、《命理正宗》反吟伏吟。標記克制：附圖例言明吉凶仍以分數為準
 *  v80.36(2026/6/10)：①「未來三年流年」資料行（含空亡標記）——問「何時」類題目原本 2027 起為空白，AI 只能說守到交脫；流年分數已經 v80.32 全表重評（土年不再漏判）②下一步大運若連走多步喜用，直接印「連走約N年」（AI 連兩輪不聚合二十年窗口，改資料層直給）
 *  v80.35(2026/6/10)：流年支落空亡直接標記於資料行（AI 連兩輪漏判流年午空亡，鐵律⑪指令層不夠、改資料層給）・完整性清單加「正文無指令字眼」（修 instruction echo「語氣平實不多說」漏進正文）
 *  v80.34(2026/6/10)：身宮移除(非子平概念)・得地標籤誠實化＋通根明細・官透殺藏變體輸出・鐵律④下一步大運／⑩禁盤外資訊・選石單一強化・完整性清單補項・交脫後下一步大運資料化
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
  var SHOPEE = 'https://shopee.tw/a50h95648d?tab=shop';
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
  // v80.30 自訂選擇器選取狀態（寫回同名隱藏欄位供 _doCast 沿用）
  var _selDate = '';
  var _selTime = '';
  var _selCity = '';
  var _selUnknown = false;

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
      '.bzx-load-sub{margin-top:.4rem;font-size:.74rem;color:rgba(212,175,55,.55);letter-spacing:.08em;transition:opacity .3s;min-height:1.1rem;text-align:center}',
      // ── v80.30 自訂欄位（取代原生 input/select）──
      '.bzx-field{width:100%;display:flex;align-items:center;justify-content:space-between;gap:.5rem;padding:.72rem .8rem;border-radius:10px;border:1px solid rgba(201,168,76,.3);background:rgba(255,255,255,.03);color:#e8e0d0;font-family:inherit;font-size:.92rem;cursor:pointer;transition:all .2s;text-align:left}',
      '.bzx-field:active{transform:scale(.985)}',
      '.bzx-field.dim{opacity:.5}',
      '.bzx-field .ph{color:rgba(232,224,208,.4)}',
      '.bzx-field .val{color:#ffeab8}',
      '.bzx-field .chev{color:rgba(201,168,76,.7);font-size:.78rem;flex-shrink:0}',
      // 內嵌錯誤（取代 alert）
      '.bzx-err{margin:.6rem 0 0;padding:.55rem .7rem;border-radius:10px;border:1px solid rgba(214,108,92,.55);background:rgba(214,108,92,.12);color:#f0c8be;font-size:.74rem;line-height:1.5;display:none}',
      '.bzx-err.show{display:block;animation:bzxIn .3s ease-out}',
      // 底部選擇器 sheet
      '.bzx-sheet-bd{position:fixed;inset:0;z-index:100002;background:rgba(0,0,0,.62);display:flex;align-items:flex-end;justify-content:center;opacity:0;transition:opacity .25s}',
      '.bzx-sheet-bd.show{opacity:1}',
      '.bzx-sheet{width:100%;max-width:480px;max-height:84vh;overflow-y:auto;background:linear-gradient(180deg,#16161e,#0d0d13);border-radius:20px 20px 0 0;border:1px solid rgba(201,168,76,.25);border-bottom:none;box-shadow:0 -10px 50px rgba(0,0,0,.6),0 0 60px rgba(201,168,76,.05);padding:.9rem 1rem 1.4rem;transform:translateY(101%);transition:transform .32s cubic-bezier(.16,1,.3,1);font-family:"Noto Serif TC",serif;-webkit-overflow-scrolling:touch}',
      '.bzx-sheet-bd.show .bzx-sheet{transform:translateY(0)}',
      '.bzx-sheet-grip{width:40px;height:4px;border-radius:2px;background:rgba(201,168,76,.4);margin:0 auto .7rem}',
      '.bzx-sheet-title{text-align:center;color:'+GOLD+';font-size:1.02rem;letter-spacing:3px;margin-bottom:.2rem}',
      '.bzx-sheet-sub{text-align:center;color:rgba(232,224,208,.5);font-size:.7rem;margin-bottom:.9rem;min-height:1rem;line-height:1.5}',
      '.bzx-sheet-foot{display:grid;grid-template-columns:1fr 1.2fr;gap:.5rem;margin-top:1.1rem}',
      '.bzx-sheet-btn{padding:.72rem;border-radius:11px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.03);color:rgba(232,224,208,.6);font-family:inherit;font-size:.86rem;cursor:pointer;letter-spacing:2px}',
      '.bzx-sheet-btn.go{border-color:rgba(201,168,76,.55);background:linear-gradient(135deg,rgba(201,168,76,.18),rgba(201,168,76,.05));color:'+GOLD+';font-weight:600}',
      '.bzx-sheet-btn:active{transform:scale(.97)}',
      // 日曆
      '.bzx-cal-nav{display:flex;align-items:center;justify-content:space-between;gap:.4rem;margin-bottom:.6rem}',
      '.bzx-cal-nav button{width:42px;height:42px;flex-shrink:0;border-radius:11px;border:1px solid rgba(201,168,76,.22);background:rgba(255,255,255,.03);color:'+GOLD+';font-size:1.2rem;cursor:pointer}',
      '.bzx-cal-nav button:active{transform:scale(.92)}',
      '.bzx-cal-ttl{flex:1;text-align:center;color:#ffeab8;font-size:.96rem;letter-spacing:1px;cursor:pointer;padding:.5rem;border-radius:9px}',
      '.bzx-cal-ttl:active{background:rgba(201,168,76,.08)}',
      '.bzx-cal-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:.22rem}',
      '.bzx-cal-wk{text-align:center;color:rgba(201,168,76,.55);font-size:.66rem;padding:.2rem 0}',
      '.bzx-cal-d{aspect-ratio:1;display:flex;align-items:center;justify-content:center;border-radius:9px;color:rgba(232,224,208,.82);font-size:.88rem;cursor:pointer}',
      '.bzx-cal-d:active{background:rgba(201,168,76,.12)}',
      '.bzx-cal-d.sel{background:linear-gradient(135deg,#c9a84c,#a8863a);color:#1a140a;font-weight:700;box-shadow:0 0 14px rgba(201,168,76,.4)}',
      '.bzx-cal-d.empty{cursor:default}',
      // 年/月快選
      '.bzx-pick-grid{display:grid;gap:.4rem}',
      '.bzx-pick-grid.y{grid-template-columns:repeat(4,1fr)}',
      '.bzx-pick-grid.mo{grid-template-columns:repeat(3,1fr)}',
      '.bzx-pick-cell{padding:.66rem .2rem;text-align:center;border-radius:10px;border:1px solid rgba(201,168,76,.18);background:rgba(255,255,255,.03);color:rgba(232,224,208,.82);font-size:.84rem;cursor:pointer}',
      '.bzx-pick-cell.sel{background:linear-gradient(135deg,#c9a84c,#a8863a);color:#1a140a;font-weight:700}',
      '.bzx-pick-cell:active{transform:scale(.95)}',
      '.bzx-yhead{display:flex;align-items:center;justify-content:space-between;margin-bottom:.6rem}',
      '.bzx-yhead button{width:40px;height:40px;border-radius:10px;border:1px solid rgba(201,168,76,.22);background:rgba(255,255,255,.03);color:'+GOLD+';font-size:1.1rem;cursor:pointer}',
      '.bzx-yhead span{color:#ffeab8;font-size:.9rem;letter-spacing:1px}',
      // 時間
      '.bzx-time-big{text-align:center;color:#ffeab8;font-size:2.1rem;letter-spacing:3px;margin:.1rem 0 .1rem;font-family:"Noto Serif TC",serif}',
      '.bzx-time-sc{text-align:center;color:'+GOLD+';font-size:.8rem;letter-spacing:1px;margin-bottom:1rem;min-height:1rem}',
      '.bzx-hour-grid{display:grid;grid-template-columns:repeat(6,1fr);gap:.3rem;margin-bottom:1rem}',
      '.bzx-hour{padding:.55rem 0;text-align:center;border-radius:9px;border:1px solid rgba(201,168,76,.18);background:rgba(255,255,255,.03);color:rgba(232,224,208,.82);font-size:.84rem;cursor:pointer}',
      '.bzx-hour.sel{background:linear-gradient(135deg,#c9a84c,#a8863a);color:#1a140a;font-weight:700;box-shadow:0 0 12px rgba(201,168,76,.35)}',
      '.bzx-hour:active{transform:scale(.92)}',
      '.bzx-min-row{display:flex;align-items:center;justify-content:center;gap:.5rem}',
      '.bzx-min-step{min-width:50px;height:50px;border-radius:12px;border:1px solid rgba(201,168,76,.28);background:rgba(255,255,255,.03);color:'+GOLD+';font-size:1rem;cursor:pointer}',
      '.bzx-min-step:active{transform:scale(.9)}',
      '.bzx-min-val{min-width:92px;text-align:center;color:#ffeab8;font-size:1.5rem;letter-spacing:1px}',
      // v80.44：分鐘改為「十位＋個位」直接點選（取代 ±1/±5 步進，設任意分 ≤2 下到位；真太陽時/夜子時需要精確到分）
      '.bzx-min-cap{text-align:center;color:'+GOLD+';font-size:.74rem;letter-spacing:1px;margin:.2rem 0 .5rem;opacity:.9}',
      '.bzx-min-grid{display:grid;gap:.3rem;margin-bottom:.4rem}',
      '.bzx-min-grid.tens{grid-template-columns:repeat(6,1fr)}',
      '.bzx-min-grid.ones{grid-template-columns:repeat(10,1fr)}',
      '.bzx-min-cell{padding:.5rem 0;text-align:center;border-radius:9px;border:1px solid rgba(201,168,76,.18);background:rgba(255,255,255,.03);color:rgba(232,224,208,.82);font-size:.82rem;cursor:pointer}',
      '.bzx-min-cell.o{font-size:.78rem;padding:.45rem 0}',
      '.bzx-min-cell.sel{background:linear-gradient(135deg,#c9a84c,#a8863a);color:#1a140a;font-weight:700;box-shadow:0 0 12px rgba(201,168,76,.35)}',
      '.bzx-min-cell:active{transform:scale(.9)}',
      '.bzx-unknown-row{display:flex;align-items:center;justify-content:center;margin-top:.9rem;padding-top:.8rem;border-top:1px solid rgba(201,168,76,.12)}',
      '.bzx-unknown-row label{display:flex;align-items:center;gap:.45rem;color:rgba(232,224,208,.65);font-size:.76rem;cursor:pointer}',
      '.bzx-unknown-row input{accent-color:'+GOLD+';width:16px;height:16px}',
      // 地點
      '.bzx-loc-group{margin-bottom:.8rem}',
      '.bzx-loc-gt{color:rgba(201,168,76,.6);font-size:.68rem;letter-spacing:1.5px;margin-bottom:.4rem}',
      '.bzx-loc-chips{display:grid;grid-template-columns:repeat(4,1fr);gap:.35rem}',
      '.bzx-loc-chip{padding:.58rem .2rem;text-align:center;border-radius:9px;border:1px solid rgba(201,168,76,.16);background:rgba(255,255,255,.03);color:rgba(232,224,208,.82);font-size:.74rem;cursor:pointer;line-height:1.2}',
      '.bzx-loc-chip.sel{background:linear-gradient(135deg,#c9a84c,#a8863a);color:#1a140a;font-weight:700;box-shadow:0 0 12px rgba(201,168,76,.3)}',
      '.bzx-loc-chip:active{transform:scale(.92)}'
    ].join('\n');
    document.head.appendChild(css);
  // ═══ 鎏金夜祭 v2（2026/6/10）：視圖升級層——第二樣式表 append-only，同表後者勝、整段可刪回退；流光動畫引用 style.css v81.0 全域 keyframes（jyGiltFlow），快取舊版時退化為靜態鎏金，無害 ═══
  try{var _g2=document.createElement('style');_g2.setAttribute('data-jy-gilt2','bazi');_g2.textContent='.bzx-section{background:linear-gradient(180deg,rgba(24,20,14,.78),rgba(14,12,9,.86));border:1px solid rgba(201,168,76,.2);border-radius:18px;box-shadow:0 18px 40px rgba(0,0,0,.45),inset 0 1px 0 rgba(245,231,184,.14);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px)}.bzx-section-title{position:relative;padding-left:12px;letter-spacing:.08em;color:#e8d28a}.bzx-section-title::before{content:"";position:absolute;left:0;top:50%;transform:translateY(-50%);width:3px;height:1.05em;border-radius:2px;background:rgba(201,168,76,.95);box-shadow:0 0 8px rgba(201,168,76,.95)}.bzx-input,.bzx-select,.bzx-q-input,.bzx-field input,.bzx-field select,.bzx-field textarea{background:rgba(8,7,5,.62);border:1px solid rgba(201,168,76,.26);border-radius:12px;color:#f2e9d6;transition:border-color .2s,box-shadow .2s}.bzx-input:focus,.bzx-select:focus,.bzx-q-input:focus,.bzx-field input:focus,.bzx-field select:focus,.bzx-field textarea:focus{border-color:#e8d28a;box-shadow:0 0 0 3px rgba(201,168,76,.16);outline:none}.bzx-gbtn,.bzx-sheet-btn,.bzx-loc-chip,.bzx-pick-cell{background:rgba(201,168,76,.06);border:1px solid rgba(201,168,76,.22);color:#d8c79a;border-radius:12px;transition:all .18s}.bzx-gbtn.active,.bzx-sheet-btn.active,.bzx-loc-chip.active,.bzx-pick-cell.active,.bzx-pick-cell.on{background:linear-gradient(135deg,#e8d28a,#c9a84c);color:#171208;border-color:transparent;box-shadow:0 6px 18px rgba(201,168,76,.28);font-weight:700}.bzx-cast-btn{background:linear-gradient(110deg,#8a6d2f,#e8d28a 28%,#c9a84c 52%,#f5e7b8 74%,#8a6d2f);background-size:220% 100%;animation:jyGiltFlow 5.5s linear infinite;color:#171208;border:none;border-radius:14px;font-weight:800;letter-spacing:.14em;box-shadow:0 10px 26px rgba(201,168,76,.32),inset 0 1px 0 rgba(255,255,255,.35)}.bzx-cast-btn:active{transform:translateY(1px)}.bzx-reset-btn{background:transparent;border:1px solid rgba(201,168,76,.34);color:#cdb87f;border-radius:12px}.bzx-back{color:rgba(232,210,138,.75);transition:color .2s}.bzx-back:active,.bzx-back:hover{color:#f5e7b8}.bzx-sheet{background:rgba(16,13,10,.93);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);border-top:1px solid rgba(201,168,76,.3);box-shadow:0 -18px 50px rgba(0,0,0,.6)}.bzx-sheet-grip{background:linear-gradient(90deg,#8a6d2f,#e8d28a,#8a6d2f);opacity:.85;border-radius:99px}.bzx-ai-card{background:linear-gradient(180deg,rgba(24,20,14,.78),rgba(14,12,9,.86));border:1px solid rgba(201,168,76,.2);border-radius:18px;box-shadow:0 18px 40px rgba(0,0,0,.45),inset 0 1px 0 rgba(245,231,184,.14);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px)}.bzx-cal-d{border-radius:10px;transition:all .15s}.bzx-cal-d.active{background:linear-gradient(135deg,#e8d28a,#c9a84c);color:#171208;border-color:transparent;box-shadow:0 6px 18px rgba(201,168,76,.28);font-weight:700}@media (prefers-reduced-motion:reduce){.bzx-cast-btn{animation:none}}@supports not (backdrop-filter:blur(1px)){[data-jy-view-bazi]{}}.bzx-cast-btn:focus-visible{outline:2px solid #e8d28a;outline-offset:2px}';document.head.appendChild(_g2);}catch(e){}
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
      h += '<button type="button" class="bzx-field" id="bzx-fld-date" onclick="_bzxOpenDate()">' + _dateInner() + '</button>';
      h += '<span class="bzx-label" style="margin-top:.8rem">出生時間</span>';
      h += '<button type="button" class="bzx-field' + (_selUnknown ? ' dim' : '') + '" id="bzx-fld-time" onclick="_bzxOpenTime()">' + _timeInner() + '</button>';
      h += '<span class="bzx-label" style="margin-top:.8rem">出生地點（真太陽時校正）</span>';
      h += '<button type="button" class="bzx-field" id="bzx-fld-city" onclick="_bzxOpenCity()">' + _cityInner() + '</button>';
      // 隱藏狀態欄位：_doCast 沿用原讀取邏輯，不動引擎
      h += '<input type="hidden" id="bzx-date" value="' + _selDate + '">';
      h += '<input type="hidden" id="bzx-time" value="' + _selTime + '">';
      h += '<input type="checkbox" id="bzx-unknown" style="display:none"' + (_selUnknown ? ' checked' : '') + '>';
      h += '<input type="hidden" id="bzx-city" value="' + _selCity + '">';
      h += '<div class="bzx-err" id="bzx-err"></div>';
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
    h += '<div style="text-align:center;margin-top:.2rem"><button onclick="_baziShare()" style="padding:.72rem 1.5rem;border-radius:12px;border:1px solid rgba(201,168,76,.5);background:linear-gradient(135deg,rgba(201,168,76,.18),rgba(201,168,76,.05));color:#c9a84c;font-family:inherit;font-size:.92rem;font-weight:600;letter-spacing:1px;cursor:pointer">📤 生成分享卡</button></div>';
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

  // v80.47：病藥／通關用神的「藥」也要做飽和／忌神／官殺檢查——
  //   引擎挑藥時可能挑到「能洩病但本命已飽和」或「是日主官殺」的五行
  //   （例：殺重身弱，藥取洩＝水，但水已32%、是閒神/印，補水反水多木漂），與用神(火木)打架。
  //   此函式回傳一句校正註，讓 AI 不把已飽和／忌神／官殺的藥當喜用外補，改走用神那條藥路。
  function _elxNote(el, b) {
    if (!el || !b) return '';
    var ep = b.ep || {}, unfav = Array.isArray(b.unfav) ? b.unfav : [], fav = Array.isArray(b.fav) ? b.fav : [];
    var keMe = ({ '木': '金', '火': '水', '土': '木', '金': '火', '水': '土' })[b.dmEl];
    var weak = !b.specialStructure && !b.strong;
    var pct = (ep[el] != null) ? Math.round(ep[el]) : null;
    var favTxt = fav.length ? '；命局真正要補的是用神【' + fav.join('、') + '】那一路（同樣能解此病）' : '';
    if (unfav.indexOf(el) >= 0) return '（注意：' + el + '已列忌神，不宜外補' + favTxt + '）';
    if (pct != null && pct >= 22) return '（注意：' + el + '命局已自帶約' + pct + '%、近飽和，毋須外補' + favTxt + '）';
    if (weak && el === keMe) return '（注意：' + el + '對日主是官殺、剋身，身弱補它＝補七殺，只可少量、不可當喜用' + favTxt + '）';
    if (fav.indexOf(el) >= 0) return '（此藥與用神同向，宜補）';
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
    if (_gz(b.mingGong) || _gz(b.taiYuan)) L.push('・命宮：' + (_gz(b.mingGong) || '—') + (b.taiYuan ? '　胎元：' + _gz(b.taiYuan) : ''));
    L.push('六親宮位對照：' + gongName.year + '；' + gongName.month + '；' + gongName.day + '；' + gongName.hour + '。');
    L.push('');

    // 旺衰
    L.push('【日主旺衰】');
    L.push('日主 ' + (b.dm || '') + '（' + (b.dmEl || '') + '行），生於 ' + ((P.month && P.month.zhi) || '') + '月。');
    L.push('得令：' + (b.deLing ? '是（月令幫身）' : '否（失令）')
      + '　得地（日支坐根）：' + (b.deDi ? '是' : '否')
      + '　得勢：' + (b.deShi ? '是（天干有比劫/印）' : '否') + '。');
    if (b.tongGen && b.tongGen.zh) L.push('通根明細（日主' + (b.dmEl || '') + '之根）：' + b.tongGen.zh + '。');
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
      L.push('注意：從格／化氣格／專旺格等特殊格局「順勢」為要——順用神（順其旺神／化神）則大吉，逆之（見破格、剋洩旺神的五行）則大凶，比扶抑格更極端。先確認格局成立（無破格字、根氣是否真的全順）再論；若有一字破格，立刻回到扶抑法論，不可硬套從化。');
    } else if (b.zhengGe && b.zhengGe.geName) {
      var zg = b.zhengGe;
      L.push('普通格局（扶抑法）：' + zg.geName + (zg.geGod ? '（格神：' + zg.geGod + '）' : '') + '。');
      if (zg.zh) L.push(zg.zh);
      L.push('（注意：上面這句格局喜忌是該格的「經典通則」，多以身旺為前提講；本命實際用神一律以下方【用神喜忌】＋【日主旺衰】為準。若通則與本命旺衰相反——例如建祿／月劫格通則說「不喜比劫」，但本命身弱反以比劫幫身為用——以旺衰用神為準，格局通則只作參考，不可拿通則去否定用神，也不可因為通則跟用神打架就閃避不提格局。）');
    } else {
      L.push('格局不顯（月令無明顯透出），以扶抑用神為主軸論。');
    }
    if (b.guanShaMix && b.guanShaMix.zh) L.push(b.guanShaMix.zh);
    L.push('');

    // 用神喜忌（斷吉凶的綱）
    L.push('【用神喜忌（這是斷吉凶的綱，務必先定後論）】');
    L.push('用神（喜）：' + (Array.isArray(b.fav) ? b.fav.join('、') : '—') + '　忌神：' + (Array.isArray(b.unfav) ? b.unfav.join('、') : '—'));
    if (b.medicineGod) L.push('病藥用神：' + _fmt(b.medicineGod) + '（命局有病，此為藥）。' + (b.medicineGod.drug ? _elxNote(b.medicineGod.drug, b) : ''));
    if (b.relayGod) L.push('通關用神：' + _fmt(b.relayGod) + '（兩氣相戰，此為和解）。' + (b.relayGod.relay ? _elxNote(b.relayGod.relay, b) : ''));
    if (b.tiaohou && b.tiaohou.need && b.tiaohou.need.length) {
      // v80.46：調候五行逐一定性，一次消除三種矛盾——
      //   (a)「需水卻又忌多水/水多木漂」：該五行本命已過旺或已列忌神 → 標「已足，不補」
      //   (b)「真正要補 vs 調候不缺」：引擎 priority 判『不缺/參考』時，不准說「真正要補」，改「參考即可」
      //   (c)「扶抑 vs 調候」：調候五行剛好是日主官殺(剋身)且身弱 → 只可少量調節，不可當喜用多補
      var _ep = b.ep || {}, _unfav = Array.isArray(b.unfav) ? b.unfav : [], _fav = Array.isArray(b.fav) ? b.fav : [];
      var _thRef = /不缺|參考/.test(b.tiaohou.priority || '');
      var _keMe = ({ '木': '金', '火': '水', '土': '木', '金': '火', '水': '土' })[b.dmEl];
      var _weak = !b.specialStructure && !b.strong;
      var _needTxt = b.tiaohou.need.map(function (el) {
        var pct = (_ep[el] != null) ? Math.round(_ep[el]) : null;
        if (_unfav.indexOf(el) >= 0) return el + '（本命已過旺、已列忌神→已足，不可再補）';
        if (pct != null && pct >= 22) return el + '（本命已充足約' + pct + '%→不需再補）';
        if (_weak && el === _keMe) return el + '（此為日主官殺、剋身，身弱只可少量降燥／調節作息，不可當喜用多補）';
        if (_fav.indexOf(el) >= 0) return el + (_thRef ? '（與用神同向、可補；惟調候本命不缺，不必特意催）' : '（真正要補，且與用神同向）');
        return el + (_thRef ? '（《窮通寶鑑》理論值，本命不缺，參考即可）' : '（可補，潤／疏調候）');
      });
      L.push('調候用神（《窮通寶鑑》）：' + _needTxt.join('、') + (b.tiaohou.avoid && b.tiaohou.avoid.length ? '；忌 ' + b.tiaohou.avoid.join('、') : '') + '。' + (b.tiaohou.reason || '') + '——' + (b.tiaohou.detail || ''));
      if (b.tiaohou.priority) L.push('調候優先級：' + b.tiaohou.priority + (/第一|輔助/.test(b.tiaohou.priority) ? '（寒燥命調候優先，用神再強也要先暖／先潤；但上面標「已足／不需補／官殺」的五行視為已滿足或不可多補）' : '') + '。');
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
    // v80.42：六害補算（資料層直給）——引擎 branchInteractions 未含「害」，實測本盤申亥害（年亥月申）漏列。
    //   六害表《三命通會》：子未、丑午、寅巳、卯辰、申亥、酉戌（寅巳刑在其中、以刑論為主）；
    //   害主暗中相害、暗耗牽制、祸起不經意處、不利六親。
    try {
      var _haiTbl = { '子未':1,'未子':1,'丑午':1,'午丑':1,'寅巳':2,'巳寅':2,'卯辰':1,'辰卯':1,'申亥':1,'亥申':1,'酉戌':1,'戌酉':1 };
      var _hgN = { year:'年支', month:'月支', day:'日支', hour:'時支' };
      var _ks = ['year','month','day','hour'];
      var _joined = inter.join('');
      var _haiOut = [];
      for (var _a = 0; _a < 4; _a++) for (var _b2 = _a + 1; _b2 < 4; _b2++) {
        var _pa = (b.pillars || {})[_ks[_a]], _pb = (b.pillars || {})[_ks[_b2]];
        var _za = _pa ? (typeof _pa === 'string' ? _pa.charAt(1) : (_pa.zhi || '')) : '';
        var _zb = _pb ? (typeof _pb === 'string' ? _pb.charAt(1) : (_pb.zhi || '')) : '';
        var _t = _za && _zb ? _haiTbl[_za + _zb] : 0;
        if (_t && _joined.indexOf(_za + ' 害 ') < 0 && _joined.indexOf(_zb + ' 害 ') < 0) {
          _haiOut.push(_hgN[_ks[_a]] + _za + ' 害 ' + _hgN[_ks[_b2]] + _zb + '：暗中相害、暗耗牽制、禍起不經意處、不利該兩柱六親' + (_t === 2 ? '（寅巳刑在其中，以刑論為主）' : ''));
        }
      }
      if (_haiOut.length) inter.push(_haiOut.join('、'));

      // v80.43：原局作用全表補齊（沖/合/刑/破/三合三會全局）——系統性盤點發現引擎作用表僅部分覆蓋。
      //   正統依據（已逐項上網核實）：六沖子午丑未寅申卯酉辰戌巳亥；六合子丑寅亥卯戌辰酉巳申午未；
      //   三刑＝寅巳申（恃勢）、丑戌未（無恩）、子卯（無禮）、辰午酉亥自刑；相破子酉卯午辰丑戌未寅亥巳申（參考級）；
      //   三合申子辰/巳酉丑/寅午戌/亥卯未、三會寅卯辰/巳午未/申酉戌/亥子丑（三支全才列，半合拱合由引擎層處理）。
      //   去重保守原則：引擎文字已含該對地支＋該關係字者跳過。
      var _zArr = [], _zRole = [];
      _ks.forEach(function (k) {
        var _p = (b.pillars || {})[k];
        var _z = _p ? (typeof _p === 'string' ? _p.charAt(1) : (_p.zhi || '')) : '';
        if (_z) { _zArr.push(_z); _zRole.push(_hgN[k]); }
      });
      function _hasRel(za, zb, word) {
        // 引擎文字格式不定（「子午沖」「子沖月支午」「年支子 沖 …午」皆可能）——以「支＋關係字」鄰接式比對
        if (_joined.indexOf(za + zb) >= 0 || _joined.indexOf(zb + za) >= 0) return _joined.indexOf(word) >= 0;
        var _w = [za + word, word + za, zb + word, word + zb, za + ' ' + word, zb + ' ' + word, word + ' ' + za, word + ' ' + zb];
        for (var _q = 0; _q < _w.length; _q++) { if (_joined.indexOf(_w[_q]) >= 0) return true; }
        return false;
      }
      var _CHONG = { '子午':1,'午子':1,'丑未':1,'未丑':1,'寅申':1,'申寅':1,'卯酉':1,'酉卯':1,'辰戌':1,'戌辰':1,'巳亥':1,'亥巳':1 };
      var _LIUHE = { '子丑':1,'丑子':1,'寅亥':1,'亥寅':1,'卯戌':1,'戌卯':1,'辰酉':1,'酉辰':1,'巳申':1,'申巳':1,'午未':1,'未午':1 };
      var _PO = { '子酉':1,'酉子':1,'卯午':1,'午卯':1,'辰丑':1,'丑辰':1,'戌未':1,'未戌':1,'寅亥':1,'亥寅':1,'巳申':1,'申巳':1 };
      var _XING2 = { '子卯':'無禮之刑','卯子':'無禮之刑' };
      var _SELF = { '辰':1,'午':1,'酉':1,'亥':1 };
      var _addOut = [];
      var _i2, _j2;
      for (_i2 = 0; _i2 < _zArr.length; _i2++) for (_j2 = _i2 + 1; _j2 < _zArr.length; _j2++) {
        var _A = _zArr[_i2], _B = _zArr[_j2], _AB = _A + _B;
        if (_CHONG[_AB] && !_hasRel(_A, _B, '沖')) _addOut.push(_zRole[_i2] + _A + ' 沖 ' + _zRole[_j2] + _B + '：對立變動，動搖兩柱所主之人事');
        if (_LIUHE[_AB] && !_hasRel(_A, _B, '合')) _addOut.push(_zRole[_i2] + _A + ' 六合 ' + _zRole[_j2] + _B + '：合絆牽繫（能否合化須化神得月令，未化只論絆）');
        if (_XING2[_AB] && !_hasRel(_A, _B, '刑')) _addOut.push(_zRole[_i2] + _A + ' 刑 ' + _zRole[_j2] + _B + '：' + _XING2[_AB] + '，禮數情分相傷');
        if (_A === _B && _SELF[_A] && !_hasRel(_A, _B, '自刑')) _addOut.push(_zRole[_i2] + '與' + _zRole[_j2] + _A + _A + ' 自刑：自我糾結損耗、自己跟自己過不去');
        if (_PO[_AB] && !_hasRel(_A, _B, '破') && !_LIUHE[_AB]) _addOut.push(_zRole[_i2] + _A + ' 破 ' + _zRole[_j2] + _B + '：相破主損壞耗散（古法參考級、權重低，不可單獨論凶）');
      }
      // 三刑組與三合三會全局（看整體四支）
      var _zSet = {};
      _zArr.forEach(function (z) { _zSet[z] = (_zSet[z] || 0) + 1; });
      [['寅','巳','申','恃勢之刑'], ['丑','戌','未','無恩之刑']].forEach(function (g) {
        if (_zSet[g[0]] && _zSet[g[1]] && _zSet[g[2]] && _joined.indexOf('三刑') < 0) _addOut.push(g[0] + g[1] + g[2] + ' 三刑全（' + g[3] + '）：明爭暗鬥、刑傷波折，落柱看傷及何親');
      });
      [['申','子','辰','水'], ['巳','酉','丑','金'], ['寅','午','戌','火'], ['亥','卯','未','木']].forEach(function (g) {
        if (_zSet[g[0]] && _zSet[g[1]] && _zSet[g[2]] && _joined.indexOf('三合' + g[3]) < 0) _addOut.push(g[0] + g[1] + g[2] + ' 三合' + g[3] + '局全：' + g[3] + '氣凝聚成局，依' + g[3] + '之喜忌定吉凶');
      });
      [['寅','卯','辰','木'], ['巳','午','未','火'], ['申','酉','戌','金'], ['亥','子','丑','水']].forEach(function (g) {
        if (_zSet[g[0]] && _zSet[g[1]] && _zSet[g[2]] && _joined.indexOf('三會' + g[3]) < 0) _addOut.push(g[0] + g[1] + g[2] + ' 三會' + g[3] + '方全：' + g[3] + '氣會方成勢、力大於三合，依' + g[3] + '之喜忌定吉凶');
      });
      if (_addOut.length) inter.push(_addOut.join('、'));
    } catch (e) {}
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
            + '約至西元 ' + ph.untilYear + ' 年，' + (ph.nextGz ? '走完前半、轉入後五年 ' + ph.nextGz + '（' + ph.nextEl + '，' + _lv(ph.nextLuck) + '）' : '此大運交脫、換下一步' + (ph.nextDaYun ? '：' + ph.nextDaYun.gz + '〔' + (ph.nextDaYun.luckLabel || '') + '〕' + (ph.nextDaYun.run && ph.nextDaYun.run.gzList ? '——其後' + ph.nextDaYun.run.gzList.slice(1).map(function(g){return g + '〔吉〕';}).join('、') + '同向接續，喜用大運連走約 ' + ph.nextDaYun.run.years + ' 年' : '') : '')) + '。');
        }
        L.push('（判斷現運吉凶：拿大運天干（前五年）、地支（後五年）的五行去比對上面的「五行喜忌全表」——走喜用則順、走忌神則背；再看大運是否沖合原局喜用。）');
      }
    }
    // v80.38：伏吟／轉趾煞標記（文獻：干支相同為伏吟、支同為地支伏吟，查法以年日柱為重——《三命通會》
    //   「日時干支與流年干支同，為轉趾煞，輕則遠遷重則毀屋破財」。徵象＝重複/反復/舊事重演：伏忌加倍、
    //   伏喜成雙。流年支撞原局本就常見，標記克制、吉凶仍以分數為準，AI 不得拿伏吟單獨嚇人。）
    var _fyGong = { year: '祖上根基', month: '父母事業', day: '自己配偶', hour: '子女晚輩晚年' };
    var _fuyin = function (gz) {
      try {
        gz = String(gz || ''); var _z2 = gz.charAt(1); if (!_z2) return '';
        var _mk = [];
        ['year', 'month', 'day', 'hour'].forEach(function (k) {
          // v80.41 根修：pillars[k] 是 {gan,zhi} 物件不是字串——String() 成 '[object Object]' 永不匹配，
          //   try/catch 又吞錯＝伏吟標記自 v80.38 上線起從未印出（實測 2028戊申撞月柱申、2029己酉撞日柱酉全漏）
          var _po = (b.pillars || {})[k];
          var pg = _po ? (typeof _po === 'string' ? _po : ((_po.gan || '') + (_po.zhi || ''))) : '';
          if (!pg || pg.length < 2) return;
          if (pg === gz) _mk.push('與' + roleName[k] + '干支全同・伏吟並臨' + ((k === 'day' || k === 'hour') ? '（轉趾煞）' : '') + '〔' + _fyGong[k] + '〕');
          else if (pg.charAt(1) === _z2) _mk.push('與' + roleName[k] + '地支伏吟〔' + _fyGong[k] + '〕');
          // v80.43：流年對原局 害／自刑／子卯刑 標記（沖合已由流年重評層處理，不重列）
          var _nz = pg.charAt(1);
          var _fyHai = { '子未':1,'未子':1,'丑午':1,'午丑':1,'寅巳':1,'巳寅':1,'卯辰':1,'辰卯':1,'申亥':1,'亥申':1,'酉戌':1,'戌酉':1 };
          if (_nz && _fyHai[_z2 + _nz]) _mk.push('害' + roleName[k] + _nz + '〔' + _fyGong[k] + '〕暗耗牽制');
          if (_nz && _nz === _z2 && { '辰':1,'午':1,'酉':1,'亥':1 }[_z2]) _mk.push('與' + roleName[k] + _z2 + _z2 + '自刑〔' + _fyGong[k] + '〕自我糾結損耗');
          if (_nz && ((_z2 === '子' && _nz === '卯') || (_z2 === '卯' && _nz === '子'))) _mk.push('刑' + roleName[k] + _nz + '〔' + _fyGong[k] + '〕無禮之刑');
        });
        return _mk.length ? '，' + _mk.join('、') : '';
      } catch (e) { return ''; }
    };
    if (b.liuNianGZ) {
      var _lnZhi = String(b.liuNianGZ).charAt(1);
      var _lnKong = _kw.indexOf(_lnZhi) >= 0 ? '（注意：流年支' + _lnZhi + '正落空亡——今年屬' + _lnZhi + '的機會「整年」帶虛象，不只流月；須與流月空亡同組一致處理）' : '';
      L.push('今年流年：' + _fmt(b.liuNianGZ) + _lnKong + _fuyin(b.liuNianGZ) + (Array.isArray(b.liuYue) && b.liuYue.length ? '；流月重點：' + _fmt(b.liuYue) : '') + '。');
      // v80.36：未來三年流年（問「何時」類題的資料面；分數已 v80.32 全表重評）
      try {
        var _nowY = new Date().getFullYear(), _fut = [];
        (b.dayun || []).forEach(function (d) { (d && d.liuNian || []).forEach(function (ln) { if (ln && ln.year > _nowY && ln.year <= _nowY + 3) _fut.push(ln); }); });
        _fut.sort(function (x, y) { return x.year - y.year; });
        if (_fut.length) {
          var _hasFy = false;
          var _futTxt = _fut.map(function (ln) {
            var _z = String(ln.gz || '').charAt(1);
            var _fy = _fuyin(ln.gz); if (_fy) _hasFy = true;
            return ln.year + ' ' + ln.gz + '（' + (ln.level || '') + (_kw.indexOf(_z) >= 0 ? '，' + _z + '支落空亡・虛象' : '') + _fy + '）';
          }).join('、');
          L.push('未來三年流年：' + _futTxt + '。' + (_hasFy ? '（伏吟＝流年干支與原局某柱重逢，主該宮位之事重複、反復、舊事重演——落忌神年壓力加倍、落喜用年喜事成雙；干支全同於日時柱為轉趾煞，主遷動破耗。流年支撞原局本屬常見，伏吟只作宮位與性質的修飾，吉凶仍以前列吉凶等級為準，不可單拿伏吟誇大成災。）' : ''));
        }
      } catch (e) {}
    }
    if (b.suiYunBingLin) { var sybl = _fmt(b.suiYunBingLin); if (sybl) L.push('歲運併臨提醒：' + sybl + '。'); }
    L.push('');

    // 鐵律
    L.push('【斷命鐵律（違反就是失敗）】');
    L.push('①結論先行：第一句就正面回答他問的事（能不能／會不會／何時／往哪走）。沒指定問題就先用一句話點出命格主軸與當前運勢基調。');
    L.push('②先定旺衰格局、再論吉凶：先講身強／身弱（或從格／化氣），這決定用神方向；用神是綱——喜用到位＝吉，忌神當道＝凶。據實說，別只報十神名詞。');
    L.push('③調候疊加：寒燥命（冬生需火暖、夏生需水潤等）調候為第一優先，用神再強也要先解寒燥。已附《窮通寶鑑》調候。但一切以上方調候欄的逐字標註為準：標「已足／已過旺／不需補」的五行不可再當喜用（例如水多木漂卻說要補水、火炎土燥卻說要補火，都是錯）；標「是日主官殺、剋身」的（如身弱補水＝補七殺）只可少量降燥／調節作息、不可當喜用多補——扶抑與調候對同一五行衝突時，以扶身為主、調候為輔；只把標「真正要補／與用神同向」的拿來補。');
    L.push('④大運流年要落地：用神／忌神對上大運、流年五行的生剋，定當下幾年的吉凶。講清楚現在這步運幫不幫、何時轉、為什麼是那時候，不要只說「會好」「快了」。現行大運交脫後「下一步大運」是順是背必須點名——若忌運將盡、接著連走喜用，翻身窗口從何時開始要明講（問事業、財運、去留尤其不可漏）。');
    L.push('⑤神煞別亂套：神煞是輔助，只挑跟問題相關、且力量明顯者（如貴人、桃花、驛馬、羊刃）來點題，不要把十幾個神煞全背、更不要拿凶煞嚇人。');
    L.push('⑥刑沖合害看實質、落到六親宮位：沖喜用為凶、沖忌神反吉；合化要看化神是否得令。沖到哪一柱，就講那一柱對應的人事領域（年祖上根基／月父母事業／日自己配偶／時子女晚輩）。');
    L.push('⑦壞消息就是壞消息：忌神當道、用神被剋、大運走背——直接講不利在哪、會怎麼發生，並給「該補什麼五行、該主動做什麼」的具體方向，不可用「考驗／轉機／成長」帶過。');
    L.push('⑧挑最強訊號深挖：把「旺衰 → 用神 → 大運流年」這條主線講透，配合最關鍵的格局與一兩個神煞／刑沖，不要每個欄位蜻蜓點水。');
    L.push('⑨不要用粗體標題分類、不要逐柱逐欄報告，像跟人面對面講話一樣自然過渡。');
    L.push('⑩只依命盤與生剋推，不臆測他的心理動機、不反問他；盤上看不出來就說看不出來，不硬編。也嚴禁引用命盤之外你自以為知道的當事人資訊（職業、班別、副業、生活細節等）——即使對話上下文或你的記憶裡有，一律不得寫進來；所有具象都必須從本盤十神生剋推出。');
    L.push('⑪盤上已給的特殊訊號要落地、要前後一致，不可只報名詞或挑著用：（空亡）若用神／喜用五行、或對他有利的流年流月，正落在上方「空亡」欄列出的地支，要點出「機會偏虛、容易先以代理／暫代／口頭出現、不一定馬上落定、或延遲」；而且同一組空亡要一致處理——不可只講某個月落空亡、卻漏掉另一個同樣空亡的月（例如午、未都空亡，就不能只講未、不講午）。（格局病）官殺混雜／傷官見官／比劫奪財／梟印奪食等，要翻成人事具象（官殺混雜＝多頭馬車、上司口徑不一、考核標準不一、是非口舌多；比劫奪財＝同輩搶利、合夥易破財；梟印奪食＝才華被壓、表現出不來），不可只丟四個字的名詞。');
    L.push('');

    // 完整性清單
    L.push('【完整性清單（寫完前自我核對，但不要為湊字灌水）】');
    L.push('□ 第一句直接回答了問題　□ 先定旺衰格局、以用神為綱下了明確吉凶　□ 調候有疊進判斷');
    L.push('□ 大運流年落地（現在這步幫不幫、何時轉、為什麼）　□ 相關神煞／刑沖落到六親宮位　□ 不利處直說＋可行的補救（補什麼五行、做什麼）');
    L.push('□ 空亡落到用神／流年流月時有點出虛象、且同組空亡前後一致　□ 官殺混雜等格局病有翻成人事具象、不只報名詞　□ 有定格局、且格局通則與用神方向不衝突（衝突時以用神為準、不閃避格局）　□ 調候／病藥／通關標註一致：沒把「已飽和／已過旺／官殺／忌神」的五行當喜用補（不與「已足／不缺」自相矛盾）　□ 有點名下一步大運順背與翻身窗口　□ 能量石只寫一種、且取「與用神同向＋調候」那行五行　□ 正文沒有出現任何指令字眼（「語氣平實」「只講一種」「鐵律」「清單」「提示詞」等）——這些指令是給你的，不是讀給客人聽的');
    L.push('');

    // 輸出格式 + 水晶收尾
    L.push('【輸出格式】');
    L.push('繁體中文，像命理師當面講話，不是分析報告。第一句給結論，之後一段段推進，每段帶新資訊、同一結論只講一次。不要列表格、不要粗體小標、不要逐柱報告。');
    L.push('收尾 2–3 句，自然推薦一種適合隨身的水晶／能量石（實務輔助、非八字原理），語氣平實不推銷。選石鐵則：以【用神／喜神】五行為主；若某五行能調候卻是日主的官殺或忌神（如身弱補水＝補七殺），不可選它當主石；最佳是選「同時服務扶抑用神＋調候」的那個五行（即上方調候欄標『與用神同向』者）。主石只准寫出「一種」石頭的名字——嚴禁「或」「這類」「例如A、B」式並列第二種；領頭那顆必須是該五行之石，不可改用其他喜神行代打。只講一種、只在最後。');
    L.push('最後兩行固定照此收束：倒數第二行只放這一個 Markdown 連結、原樣照抄（含中括號與小括號）：[靜月之光蝦皮賣場](https://shopee.tw/a50h95648d?tab=shop) （該行不得有這個連結以外的任何文字或空白；嚴禁把網址裸貼成純文字——裸的長網址會被渲染管線插入看不見的字元而點不動，Markdown 連結的網址收在小括號裡、畫面只顯示中文字，不會被動到）；最後一行固定輸出「願你諸事順遂。」六個字作結，之後不再輸出任何內容。兩行缺一不可、順序不可顛倒（網址行被任何字元黏到就點不動，所以網址行上下都要乾淨）。'); // v80.40 犧牲行：與梅花/紫微同款根治 URL 尾黏不可見字元

    return L.join('\n');
  }

  // ════════════════════════════════════════════════════════
  //  排盤（呼叫既有引擎，不重造）
  // ════════════════════════════════════════════════════════
  function _doCast() {
    _bzxClearErr();
    var dateEl = document.getElementById('bzx-date');
    var timeEl = document.getElementById('bzx-time');
    var unknownEl = document.getElementById('bzx-unknown');
    var cityEl = document.getElementById('bzx-city');
    var qEl = document.getElementById('bzx-q');

    var dv = dateEl ? dateEl.value : '';
    if (!dv) { _bzxErr('請選擇出生日期（國曆）'); return; }
    var dp = dv.split('-');
    var y = parseInt(dp[0], 10), m = parseInt(dp[1], 10), d = parseInt(dp[2], 10);
    if (!y || !m || !d) { _bzxErr('出生日期格式不正確'); return; }
    if (y < 1920 || y > 2050) { _bzxErr('出生年需在 1920–2050 之間（排盤節氣表範圍）'); return; }

    var unknown = unknownEl ? unknownEl.checked : false;
    var hh = 12, mm = 0;
    if (!unknown) {
      var tv = timeEl ? timeEl.value : '';
      if (!tv) { _bzxErr('請選擇出生時間，或勾選「不知時辰」'); return; }
      var tp = tv.split(':');
      hh = parseInt(tp[0], 10); mm = parseInt(tp[1], 10);
      if (isNaN(hh) || isNaN(mm)) { _bzxErr('出生時間格式不正確'); return; }
    }

    if (!cityEl || cityEl.value === '') { _bzxErr('請選擇出生地點'); return; }
    var ci = parseInt(cityEl.value, 10);
    var city = CITY[ci] || CITY[CITY.length - 1];
    var question = qEl ? qEl.value.trim() : '';

    if (typeof window.computeBazi !== 'function' && typeof computeBazi !== 'function') {
      // 引擎還沒背景載入完 → 即時補載 bazi.js / bazi_upgrade.js / solar-location.js 再排
      _ensureEngine(function (ok) {
        if (!ok) { _bzxErr('八字引擎載入失敗：請確認 JS/bazi.js、bazi_upgrade.js、solar-location.js 已上傳並強制重新整理'); return; }
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
        if (!bazi) { _bzxErr('排盤失敗，請確認出生資料後重試'); return; }
        try { if (typeof enhanceBazi === 'function') enhanceBazi(bazi); } catch (e) { console.error('[bazi] enhance', e); }

        var pad = function (n) { return (n < 10 ? '0' : '') + n; };
        _meta = {
          gender: _gender,
          question: question,
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
        _bzxErr('排盤計算發生問題，請重試或更換出生資料');
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
  window._baziShare = function () {
    if (!window.JYShareCard) { _bzxErr('分享元件載入中，請稍候再試一次'); return; }
    var b = _bazi || {}, P = b.pillars || {};
    function pil(k, label) { var p = P[k] || {}; return { label: label, gan: p.gan || '', zhi: p.zhi || '' }; }
    var cur = _currentDayun(b);
    var dm = (b.dm || '') + (b.dmEl ? '（' + b.dmEl + '行）' : '') + ' ・ ' + (b.strongLevel || (b.strong ? '身強' : '身弱'));
    JYShareCard.open('bazi', {
      question: (_meta && _meta.question) || '',
      pillars: [pil('year', '年柱'), pil('month', '月柱'), pil('day', '日柱'), pil('hour', '時柱')],
      dayMaster: dm,
      yongShen: Array.isArray(b.fav) ? b.fav.join('、') : '',
      dayun: cur ? ((cur.gz || '') + (cur.ageStart != null ? '（' + cur.ageStart + '～' + cur.ageEnd + '歲）' : '')) : ''
    });
  };

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


  // ════════════════════════════════════════════════════════
  //  v80.30 自訂選擇器（日期 / 時間 / 地點）— 取代手機原生 UI
  //  全部寫回隱藏欄位 bzx-date / bzx-time / bzx-unknown / bzx-city，
  //  _doCast 與引擎、buildBaziPrompt 完全沿用、不動。
  // ════════════════════════════════════════════════════════
  var WK = ['日','一','二','三','四','五','六'];
  var SC_N = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
  var SC_R = ['23–01','01–03','03–05','05–07','07–09','09–11','11–13','13–15','15–17','17–19','19–21','21–23'];
  var CITY_GROUPS = [
    {g:'北部', idx:[0,1,6,2,7,14]},
    {g:'中部', idx:[3,8,9,10,11]},
    {g:'南部', idx:[4,5,12,13]},
    {g:'東部', idx:[15,16]},
    {g:'離島', idx:[17,18,19]},
    {g:'港澳・中國・星馬', idx:[20,21,22,23,24,25,26,27]},
    {g:'日韓', idx:[28,29]},
    {g:'歐美・澳洲', idx:[30,31,32,33,34,35,36]},
    {g:'其他', idx:[37]}
  ];

  function _pad2(n){ return (n<10?'0':'')+n; }
  function _daysInMonth(y,m){ return new Date(y, m, 0).getDate(); }
  function _firstDow(y,m){ return new Date(y, m-1, 1).getDay(); }
  function _scIdx(hh){ return Math.floor(((hh+1)%24)/2); }
  function _shichen(hh){ var i=_scIdx(hh); return SC_N[i]+'時 ('+SC_R[i]+')'; }
  function _shichenShort(hh){ return SC_N[_scIdx(hh)]+'時'; }
  function _cityShort(i){ return (CITY[i]?CITY[i].n:'').replace(/[／（(].*$/,''); }

  // ── 欄位顯示 ──
  function _dateInner(){
    if(!_selDate) return '<span class="ph">請選擇出生日期</span><span class="chev">▾</span>';
    var p=_selDate.split('-'), y=+p[0], m=+p[1], d=+p[2];
    var wk=WK[new Date(y,m-1,d).getDay()];
    return '<span class="val">'+y+' 年 '+m+' 月 '+d+' 日（週'+wk+'）</span><span class="chev">▾</span>';
  }
  function _timeInner(){
    if(_selUnknown) return '<span class="val">不知時辰（午時暫排）</span><span class="chev">▾</span>';
    if(!_selTime) return '<span class="ph">請選擇出生時間</span><span class="chev">▾</span>';
    var hh=parseInt(_selTime.split(':')[0],10);
    return '<span class="val">'+_selTime+'　'+_shichenShort(hh)+'</span><span class="chev">▾</span>';
  }
  function _cityInner(){
    if(_selCity===''||_selCity==null) return '<span class="ph">請選擇出生地點</span><span class="chev">▾</span>';
    return '<span class="val">'+_cityShort(parseInt(_selCity,10))+'</span><span class="chev">▾</span>';
  }
  function _bzxSyncFields(){
    var a=document.getElementById('bzx-fld-date'); if(a) a.innerHTML=_dateInner();
    var b=document.getElementById('bzx-fld-time'); if(b){ b.innerHTML=_timeInner(); b.classList.toggle('dim',!!_selUnknown); }
    var c=document.getElementById('bzx-fld-city'); if(c) c.innerHTML=_cityInner();
    var hd=document.getElementById('bzx-date'); if(hd) hd.value=_selDate;
    var ht=document.getElementById('bzx-time'); if(ht) ht.value=_selTime;
    var hu=document.getElementById('bzx-unknown'); if(hu) hu.checked=!!_selUnknown;
    var hc=document.getElementById('bzx-city'); if(hc) hc.value=_selCity;
  }

  // ── 內嵌錯誤（取代 alert）──
  function _bzxErr(msg){ var e=document.getElementById('bzx-err'); if(e){ e.textContent='⚠ '+msg; e.classList.add('show'); try{e.scrollIntoView({behavior:'smooth',block:'center'});}catch(x){} } else { try{alert(msg);}catch(z){} } }
  function _bzxClearErr(){ var e=document.getElementById('bzx-err'); if(e) e.classList.remove('show'); }

  // ── 底部 sheet 基礎 ──
  var _sheetType='';
  function _openSheet(title, sub, body, foot){
    _closeSheet(true);
    var bd=document.createElement('div'); bd.id='bzx-sheet-bd'; bd.className='bzx-sheet-bd';
    bd.onclick=function(e){ if(e.target===bd) _closeSheet(); };
    bd.innerHTML='<div class="bzx-sheet" id="bzx-sheet"><div class="bzx-sheet-grip"></div>'+
      '<div class="bzx-sheet-title">'+title+'</div>'+
      '<div class="bzx-sheet-sub" id="bzx-sheet-sub">'+(sub||'')+'</div>'+
      '<div id="bzx-sheet-body">'+body+'</div>'+
      (foot?'<div class="bzx-sheet-foot"><button class="bzx-sheet-btn" onclick="_bzxSheetCancel()">取消</button><button class="bzx-sheet-btn go" onclick="_bzxSheetConfirm()">確定</button></div>':'')+
      '</div>';
    document.body.appendChild(bd);
    void bd.offsetWidth; bd.classList.add('show');
  }
  function _closeSheet(immediate){
    var bd=document.getElementById('bzx-sheet-bd'); if(!bd) return;
    if(immediate){ if(bd.parentNode) bd.parentNode.removeChild(bd); return; }
    bd.classList.remove('show');
    setTimeout(function(){ if(bd&&bd.parentNode) bd.parentNode.removeChild(bd); },320);
  }
  function _setSub(t){ var s=document.getElementById('bzx-sheet-sub'); if(s) s.innerHTML=t; }
  function _setBody(h){ var b=document.getElementById('bzx-sheet-body'); if(b) b.innerHTML=h; }
  window._bzxSheetCancel=function(){ _closeSheet(); };
  window._bzxSheetConfirm=function(){
    if(_sheetType==='date'){
      _selDate=_dpY+'-'+_pad2(_dpM)+'-'+_pad2(_dpD);
    } else if(_sheetType==='time'){
      if(_tpUnknown){ _selUnknown=true; _selTime=''; }
      else { _selUnknown=false; _selTime=_pad2(_tpH)+':'+_pad2(_tpM); }
    }
    _bzxClearErr(); _bzxSyncFields(); _closeSheet();
  };

  // ── 日期選擇器 ──
  var _dpY=1990,_dpM=1,_dpD=1,_dpMode='day',_dpDec=1988;
  window._bzxOpenDate=function(){
    _sheetType='date';
    if(_selDate){ var p=_selDate.split('-'); _dpY=+p[0]; _dpM=+p[1]; _dpD=+p[2]; }
    else { _dpY=1990; _dpM=1; _dpD=1; }
    _dpMode='day';
    _openSheet('出生日期','國曆，點上方年月可快速跳轉', '', true);
    _dpRenderDay();
  };
  function _dpClampDay(){ var dim=_daysInMonth(_dpY,_dpM); if(_dpD>dim) _dpD=dim; if(_dpD<1) _dpD=1; }
  function _dpRenderDay(){
    _dpClampDay();
    var h='<div class="bzx-cal-nav"><button onclick="_bzxDpNav(-1)">‹</button>'+
      '<div class="bzx-cal-ttl" onclick="_bzxDpMode(\'year\')">'+_dpY+' 年 '+_dpM+' 月 ▾</div>'+
      '<button onclick="_bzxDpNav(1)">›</button></div><div class="bzx-cal-grid">';
    for(var w=0;w<7;w++) h+='<div class="bzx-cal-wk">'+WK[w]+'</div>';
    var fd=_firstDow(_dpY,_dpM), dim=_daysInMonth(_dpY,_dpM), i;
    for(i=0;i<fd;i++) h+='<div class="bzx-cal-d empty"></div>';
    for(i=1;i<=dim;i++) h+='<div class="bzx-cal-d'+(i===_dpD?' sel':'')+'" onclick="_bzxDpPickDay('+i+')">'+i+'</div>';
    h+='</div>'; _setBody(h); _setSub('點日期，或點上方年月快速跳轉');
  }
  function _dpRenderYear(){
    var h='<div class="bzx-yhead"><button onclick="_bzxDpDec(-1)">‹</button><span>'+_dpDec+' – '+(_dpDec+11)+'</span><button onclick="_bzxDpDec(1)">›</button></div><div class="bzx-pick-grid y">';
    for(var y=_dpDec;y<_dpDec+12;y++){ var dis=(y<1920||y>2050);
      h+='<div class="bzx-pick-cell'+(y===_dpY?' sel':'')+'"'+(dis?' style="opacity:.3;pointer-events:none"':' onclick="_bzxDpPickYear('+y+')"')+'>'+y+'</div>'; }
    h+='</div>'; _setBody(h); _setSub('選擇年份');
  }
  function _dpRenderMonth(){
    var h='<div class="bzx-pick-grid mo">';
    for(var m=1;m<=12;m++) h+='<div class="bzx-pick-cell'+(m===_dpM?' sel':'')+'" onclick="_bzxDpPickMonth('+m+')">'+m+' 月</div>';
    h+='</div>'; _setBody(h); _setSub('選擇月份（'+_dpY+' 年）');
  }
  window._bzxDpMode=function(mode){ _dpMode=mode; if(mode==='year'){ _dpDec=Math.floor(_dpY/12)*12; if(_dpDec<1920)_dpDec=1920; _dpRenderYear(); } else if(mode==='month'){ _dpRenderMonth(); } else { _dpRenderDay(); } };
  window._bzxDpNav=function(d){ _dpM+=d; if(_dpM>12){_dpM=1;_dpY++;} if(_dpM<1){_dpM=12;_dpY--;} if(_dpY<1920)_dpY=1920; if(_dpY>2050)_dpY=2050; _dpClampDay(); _dpRenderDay(); };
  window._bzxDpDec=function(d){ _dpDec+=d*12; if(_dpDec<1920)_dpDec=1920; if(_dpDec>2040)_dpDec=2040; _dpRenderYear(); };
  window._bzxDpPickDay=function(d){ _dpD=d; _dpRenderDay(); };
  window._bzxDpPickYear=function(y){ _dpY=y; _dpClampDay(); _dpRenderMonth(); };
  window._bzxDpPickMonth=function(m){ _dpM=m; _dpClampDay(); _dpRenderDay(); };

  // ── 時間選擇器 ──
  var _tpH=12,_tpM=0,_tpUnknown=false;
  window._bzxOpenTime=function(){
    _sheetType='time';
    if(_selUnknown){ _tpUnknown=true; _tpH=12; _tpM=0; }
    else if(_selTime){ var p=_selTime.split(':'); _tpH=+p[0]; _tpM=+p[1]; _tpUnknown=false; }
    else { _tpH=12; _tpM=0; _tpUnknown=false; }
    _openSheet('出生時間','真太陽時校正需精確到分', _tpBody(), true);
  };
  function _tpBody(){
    var u=_tpUnknown, dim=u?' style="opacity:.35;pointer-events:none"':'';
    var h='<div class="bzx-time-big">'+(u?'—— ：——':(_pad2(_tpH)+'：'+_pad2(_tpM)))+'</div>';
    h+='<div class="bzx-time-sc">'+(u?'時辰未知，將以午時（11–13）暫排，時柱僅供參考':_shichen(_tpH))+'</div>';
    h+='<div class="bzx-hour-grid"'+dim+'>';
    for(var x=0;x<24;x++) h+='<div class="bzx-hour'+(x===_tpH?' sel':'')+'" onclick="_bzxTpHour('+x+')">'+_pad2(x)+'</div>';
    h+='</div>';
    h+='<div class="bzx-min-cap"'+dim+'>分（先點十位，再點個位）</div>';
    h+='<div class="bzx-min-grid tens"'+dim+'>';
    for(var mt=0;mt<6;mt++) h+='<div class="bzx-min-cell'+(Math.floor(_tpM/10)===mt?' sel':'')+'" onclick="_bzxTpMinTens('+mt+')">'+_pad2(mt*10)+'</div>';
    h+='</div>';
    h+='<div class="bzx-min-grid ones"'+dim+'>';
    for(var mo=0;mo<10;mo++) h+='<div class="bzx-min-cell o'+((_tpM%10)===mo?' sel':'')+'" onclick="_bzxTpMinOnes('+mo+')">'+mo+'</div>';
    h+='</div>';
    h+='<div class="bzx-unknown-row"><label><input type="checkbox" '+(u?'checked':'')+' onchange="_bzxTpUnk()">不知時辰（以午時暫排，時柱僅供參考）</label></div>';
    return h;
  }
  window._bzxTpHour=function(h){ _tpH=h; _setBody(_tpBody()); };
  window._bzxTpMin=function(d){ _tpM=(_tpM+d+60)%60; _setBody(_tpBody()); };
  // v80.44：十位／個位直接點選分鐘（任意分 ≤2 下到位）
  window._bzxTpMinTens=function(t){ _tpM=t*10+(_tpM%10); if(_tpM>59)_tpM=59; _setBody(_tpBody()); };
  window._bzxTpMinOnes=function(o){ _tpM=Math.floor(_tpM/10)*10+o; if(_tpM>59)_tpM=59; _setBody(_tpBody()); };
  window._bzxTpUnk=function(){ _tpUnknown=!_tpUnknown; _setBody(_tpBody()); };

  // ── 地點選擇器（單點即選＋關閉）──
  window._bzxOpenCity=function(){
    _sheetType='city';
    var h='';
    for(var gi=0;gi<CITY_GROUPS.length;gi++){ var grp=CITY_GROUPS[gi];
      h+='<div class="bzx-loc-group"><div class="bzx-loc-gt">'+grp.g+'</div><div class="bzx-loc-chips">';
      for(var j=0;j<grp.idx.length;j++){ var ix=grp.idx[j];
        h+='<div class="bzx-loc-chip'+((''+ix)===(''+_selCity)?' sel':'')+'" onclick="_bzxPickCity('+ix+')">'+_cityShort(ix)+'</div>'; }
      h+='</div></div>';
    }
    _openSheet('出生地點','真太陽時校正用，依出生地經度', h, false);
  };
  window._bzxPickCity=function(i){ _selCity=''+i; _bzxClearErr(); _bzxSyncFields(); _closeSheet(); };


})();
