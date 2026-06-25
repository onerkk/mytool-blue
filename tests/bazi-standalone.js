// v80.50(2026/6/25)：提示詞明示刑沖合害不參與自動吉凶加減分，與底層預測評分政策一致。
// v80.49(2026/6/25)：出生城市經度與 solar-location 統一；真太陽時提示改為本系統政策，不冒充所有流派唯一標準。
/*! bazi-standalone.js — 靜月之光 八字命理獨立流程  [v80.51]
 *  v80.47(2026/6/25)：前端可選 23:00 子初／00:00 午夜換日；提示詞揭露固定偏移與 DST 重疊／缺口限制。
 *  v80.46(2026/6/25)：地支事實層移除分數；旺衰病象不再自動翻轉五行立場；提示詞標示扶抑基準與候選模型。
 *  v80.45(2026/6/25)：特殊格局改列候選、不自動覆蓋喜忌；未知時辰明確降級；結果頁顯示精確交運日期。
 *  v80.44(2026/6/25)：提示詞事實/模型分層；刪除提示詞二次排盤；精確真太陽時、起運與大運日期；合化/吉凶不得無條件斷定；海外 IANA 時區/DST。
 *  v80.43(2026/6/12)：原局作用全表系統性補齊（沖/六合/三刑含自刑/相破參考級/三合三會全局，全部上網核實
 *    後依正統表直給＋宮位落點＋保守去重）；流年對原局補 害/自刑/子卯刑 標記（沖合由流年重評層處理不重列）。
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
 *  排盤事實來自引擎；本檔負責輸入、結果呈現與提示詞分層，不自行二次排盤。
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
    {n:'台北', lng:121.56, tz:8}, {n:'新北', lng:121.47, tz:8}, {n:'桃園', lng:121.30, tz:8},
    {n:'台中', lng:120.68, tz:8}, {n:'台南', lng:120.23, tz:8}, {n:'高雄', lng:120.31, tz:8},
    {n:'基隆', lng:121.74, tz:8}, {n:'新竹', lng:120.97, tz:8}, {n:'苗栗', lng:120.82, tz:8},
    {n:'彰化', lng:120.54, tz:8}, {n:'南投', lng:120.69, tz:8}, {n:'雲林', lng:120.53, tz:8},
    {n:'嘉義', lng:120.45, tz:8}, {n:'屏東', lng:120.49, tz:8}, {n:'宜蘭', lng:121.75, tz:8},
    {n:'花蓮', lng:121.60, tz:8}, {n:'台東', lng:121.14, tz:8}, {n:'澎湖', lng:119.56, tz:8},
    {n:'金門', lng:118.32, tz:8}, {n:'馬祖', lng:119.94, tz:8},
    {n:'香港', lng:114.17, tz:8}, {n:'澳門', lng:113.54, tz:8}, {n:'新加坡', lng:103.85, tz:8},
    {n:'吉隆坡', lng:101.69, tz:8}, {n:'北京', lng:116.41, tz:8}, {n:'上海', lng:121.47, tz:8},
    {n:'廣州', lng:113.26, tz:8}, {n:'成都', lng:104.07, tz:8},
    {n:'東京', lng:139.69, tz:9}, {n:'首爾', lng:126.98, tz:9},
    {n:'洛杉磯', lng:-118.24, tz:-8}, {n:'舊金山', lng:-122.42, tz:-8}, {n:'溫哥華', lng:-123.12, tz:-8},
    {n:'紐約', lng:-74.01, tz:-5}, {n:'多倫多', lng:-79.38, tz:-5},
    {n:'倫敦', lng:-0.13, tz:0}, {n:'雪梨', lng:151.21, tz:10},
    {n:'其他／不確定（用 120°E 台灣標準時）', lng:120, tz:8}
  ];

  var CITY_TZID = {
    '台北':'Asia/Taipei','新北':'Asia/Taipei','桃園':'Asia/Taipei','台中':'Asia/Taipei','台南':'Asia/Taipei','高雄':'Asia/Taipei','基隆':'Asia/Taipei','新竹':'Asia/Taipei','苗栗':'Asia/Taipei','彰化':'Asia/Taipei','南投':'Asia/Taipei','雲林':'Asia/Taipei','嘉義':'Asia/Taipei','屏東':'Asia/Taipei','宜蘭':'Asia/Taipei','花蓮':'Asia/Taipei','台東':'Asia/Taipei','澎湖':'Asia/Taipei','金門':'Asia/Taipei','馬祖':'Asia/Taipei',
    '香港':'Asia/Hong_Kong','澳門':'Asia/Macau','新加坡':'Asia/Singapore','吉隆坡':'Asia/Kuala_Lumpur','北京':'Asia/Shanghai','上海':'Asia/Shanghai','廣州':'Asia/Shanghai','成都':'Asia/Shanghai','東京':'Asia/Tokyo','首爾':'Asia/Seoul','洛杉磯':'America/Los_Angeles','舊金山':'America/Los_Angeles','溫哥華':'America/Vancouver','紐約':'America/New_York','多倫多':'America/Toronto','倫敦':'Europe/London','雪梨':'Australia/Sydney'
  };
  CITY.forEach(function(c){c.tzid=CITY_TZID[c.n]||null;});

  var _wrap = null;
  var _phase = 'input';      // input | result
  var _gender = 'male';      // male | female（大運順逆必需）
  var _dayBoundaryMode = 'ZI_HOUR_23'; // 23:00 子初換日；可切換午夜換日流派
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
      '.bzx-suite-entry{margin:.75rem auto 0;display:inline-flex;align-items:center;justify-content:center;gap:.35rem;padding:.55rem .9rem;border-radius:999px;border:1px solid rgba(201,168,76,.28);background:rgba(201,168,76,.07);color:#d8c79a;font-family:inherit;font-size:.72rem;letter-spacing:.08em;cursor:pointer;transition:border-color .18s,background-color .18s,color .18s,transform .18s}',
      '.bzx-suite-entry:active{transform:scale(.97);background:rgba(201,168,76,.14);color:#f5e7b8;border-color:rgba(201,168,76,.5)}',
      '.bzx-back{color:rgba(232,224,208,.5);text-decoration:none;font-size:.82rem;display:inline-block;margin-bottom:.5rem;cursor:pointer}',
      '.bzx-section{background:#13131a;border:1px solid rgba(201,168,76,.15);border-radius:14px;padding:1.1rem;margin-bottom:.8rem}',
      '.bzx-section-title{font-size:.82rem;color:'+GOLD+';margin-bottom:.7rem}',
      '.bzx-label{font-size:.72rem;color:rgba(232,224,208,.55);margin:.2rem 0 .35rem;display:block}',
      // 性別
      '.bzx-gender{display:grid;grid-template-columns:1fr 1fr;gap:.4rem}',
      '.bzx-gbtn,.bzx-dbtn{padding:.6rem;border-radius:10px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.03);color:rgba(232,224,208,.55);cursor:pointer;font-family:inherit;font-size:.9rem;transition:all .2s}',
      '.bzx-gbtn.active,.bzx-dbtn.active{border-color:rgba(201,168,76,.5);background:rgba(201,168,76,.08);color:'+GOLD+'}',
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
  // ═══ 鎏金夜祭 v2（2026/6/18）：主 CTA 採靜態鎏金底＋transform-only 獨立流光層，避免 Android/Samsung 對 background-position 動畫漏畫按鈕 ═══
  try{var _g2=document.createElement('style');_g2.setAttribute('data-jy-gilt2','bazi');_g2.textContent='.bzx-section{background:linear-gradient(180deg,rgba(24,20,14,.78),rgba(14,12,9,.86));border:1px solid rgba(201,168,76,.2);border-radius:18px;box-shadow:0 18px 40px rgba(0,0,0,.45),inset 0 1px 0 rgba(245,231,184,.14);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px)}.bzx-section-title{position:relative;padding-left:12px;letter-spacing:.08em;color:#e8d28a}.bzx-section-title::before{content:"";position:absolute;left:0;top:50%;transform:translateY(-50%);width:3px;height:1.05em;border-radius:2px;background:rgba(201,168,76,.95);box-shadow:0 0 8px rgba(201,168,76,.95)}.bzx-input,.bzx-select,.bzx-q-input,.bzx-field input,.bzx-field select,.bzx-field textarea{background:rgba(8,7,5,.62);border:1px solid rgba(201,168,76,.26);border-radius:12px;color:#f2e9d6;transition:border-color .2s,box-shadow .2s}.bzx-input:focus,.bzx-select:focus,.bzx-q-input:focus,.bzx-field input:focus,.bzx-field select:focus,.bzx-field textarea:focus{border-color:#e8d28a;box-shadow:0 0 0 3px rgba(201,168,76,.16);outline:none}.bzx-gbtn,.bzx-dbtn,.bzx-sheet-btn,.bzx-loc-chip,.bzx-pick-cell{background:rgba(201,168,76,.06);border:1px solid rgba(201,168,76,.22);color:#d8c79a;border-radius:12px;transition:color .18s,background-color .18s,border-color .18s,box-shadow .18s,transform .18s}.bzx-gbtn.active,.bzx-dbtn.active,.bzx-sheet-btn.active,.bzx-loc-chip.active,.bzx-pick-cell.active,.bzx-pick-cell.on{background:linear-gradient(135deg,#e8d28a,#c9a84c);color:#171208;border-color:transparent;box-shadow:0 6px 18px rgba(201,168,76,.28);font-weight:700}.bzx-cast-btn{background:linear-gradient(135deg,#a98232 0%,#e8d28a 44%,#f5e7b8 58%,#c9a84c 100%);color:#171208;border:none;border-radius:14px;font-weight:800;letter-spacing:.14em;box-shadow:0 10px 26px rgba(201,168,76,.32),inset 0 1px 0 rgba(255,255,255,.35);position:relative;overflow:hidden;isolation:isolate}.bzx-cast-btn::before{content:none;display:none}.bzx-cast-btn:active{transform:translateY(1px)}.bzx-reset-btn{background:transparent;border:1px solid rgba(201,168,76,.34);color:#cdb87f;border-radius:12px}.bzx-back{color:rgba(232,210,138,.75);transition:color .2s}.bzx-back:active,.bzx-back:hover{color:#f5e7b8}.bzx-sheet{background:rgba(16,13,10,.93);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);border-top:1px solid rgba(201,168,76,.3);box-shadow:0 -18px 50px rgba(0,0,0,.6)}.bzx-sheet-grip{background:linear-gradient(90deg,#8a6d2f,#e8d28a,#8a6d2f);opacity:.85;border-radius:99px}.bzx-ai-card{background:linear-gradient(180deg,rgba(24,20,14,.78),rgba(14,12,9,.86));border:1px solid rgba(201,168,76,.2);border-radius:18px;box-shadow:0 18px 40px rgba(0,0,0,.45),inset 0 1px 0 rgba(245,231,184,.14);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px)}.bzx-cal-d{border-radius:10px;transition:all .15s}.bzx-cal-d.active{background:linear-gradient(135deg,#e8d28a,#c9a84c);color:#171208;border-color:transparent;box-shadow:0 6px 18px rgba(201,168,76,.28);font-weight:700}@supports not (backdrop-filter:blur(1px)){[data-jy-view-bazi]{}}.bzx-cast-btn:focus-visible{outline:2px solid #e8d28a;outline-offset:2px}';document.head.appendChild(_g2);}catch(e){}
    return _wrap;
  }

  // ════════════════════════════════════════════════════════
  //  畫面
  // ════════════════════════════════════════════════════════
  function _render() {
    var w = _getWrap();
    var h = '<div class="bzx-container">';
    h += '<a class="bzx-back" onclick="_baziClose()">← 返回靜月之光</a>';
    h += '<div class="bzx-header"><h1>八 字 命 理</h1><p>子平 ・ 四柱八字 ・ 真太陽時</p><button type="button" class="bzx-suite-entry" onclick="_baziOpenFullSuite()">合盤・人格・曆法工具</button></div>';

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
      h += '<span class="bzx-label" style="margin-top:.8rem">子時換日口徑</span>';
      h += '<div class="bzx-gender">';
      h += '<button type="button" class="bzx-dbtn' + (_dayBoundaryMode==='ZI_HOUR_23'?' active':'') + '" onclick="_baziSetDayBoundary(\'ZI_HOUR_23\')">23:00 子初換日</button>';
      h += '<button type="button" class="bzx-dbtn' + (_dayBoundaryMode==='MIDNIGHT_00'?' active':'') + '" onclick="_baziSetDayBoundary(\'MIDNIGHT_00\')">00:00 午夜換日</button>';
      h += '</div>';
      h += '<div class="bzx-hint" style="margin-top:.35rem">兩派只會影響 23:00–23:59 出生者；不確定時保留預設「23:00 子初換日」，並在解讀時揭露口徑。</div>';
      h += '<span class="bzx-label" style="margin-top:.8rem">出生地點（真太陽時校正）</span>';
      h += '<button type="button" class="bzx-field" id="bzx-fld-city" onclick="_bzxOpenCity()">' + _cityInner() + '</button>';
      // 隱藏狀態欄位：_doCast 沿用原讀取邏輯，不動引擎
      h += '<input type="hidden" id="bzx-date" value="' + _selDate + '">';
      h += '<input type="hidden" id="bzx-time" value="' + _selTime + '">';
      h += '<input type="checkbox" id="bzx-unknown" style="display:none"' + (_selUnknown ? ' checked' : '') + '>';
      h += '<input type="hidden" id="bzx-city" value="' + _selCity + '">';
      h += '<div class="bzx-err" id="bzx-err"></div>';
      h += '<div class="bzx-hint">本系統採真太陽時：鐘錶時間依出生地經度、均時差與 DST 校正。不同流派可能採民用時間；接近換日、節氣或時辰邊界時，應同時保留排盤政策。不知時辰會以午時暫排，時柱與時上判讀僅供參考。</div>';
      h += '</div>';

      h += '<div class="bzx-section"><div class="bzx-section-title">✦ 想問什麼？（選填）</div>';
      h += '<textarea class="bzx-q-input" id="bzx-q" rows="2" maxlength="200" placeholder="留空＝整體命格；或問具體事，如：今年事業能不能換跑道？"></textarea></div>';

      h += '<button class="bzx-cast-btn" onclick="_baziDoCast()">✦ 排 盤 ✦</button>';
    } else {
      h += _renderResult();
    }
    h += '<div class="bzx-footer">靜月之光 ・ jingyue.uk<br>八字命理 ・ 子平法 ・ 調候參考</div></div>';
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
              : (Array.isArray(b.specialStructureCandidates) && b.specialStructureCandidates.length ? b.specialStructureCandidates[0].type+'（待覆核）' : (b.zhengGe && b.zhengGe.geName ? b.zhengGe.geName : ''));
    var favTxt = Array.isArray(b.fav)? b.fav.join('、') : '';
    var unfavTxt = Array.isArray(b.unfav)? b.unfav.join('、') : '';
    var curDy = _currentDayun(b);
    h += '<div class="bzx-summary">';
    h += '<div class="sline">日主 <b>'+dm+'</b>（'+dmEl+'行）・ <span class="sgold">'+(b.strongLevel||(b.strong?'身強':'身弱'))+'</span>'+(b.structType?'（'+b.structType+'）':'')+'</div>';
    if (geTxt) h += '<div class="sline">格局：<b>'+geTxt+'</b></div>';
    if (favTxt) h += '<div class="sline">用神候選：<span class="sgold">'+favTxt+'</span>'+(unfavTxt?' ・ 忌神候選：'+unfavTxt:'')+'</div>';
    if (b.tiaohou && b.tiaohou.need) h += '<div class="sline">調候：'+(b.tiaohou.need.join('、'))+'（'+(b.tiaohou.reason||'窮通寶鑑')+'）</div>';
    if (curDy) h += '<div class="sline">現行大運：<b>'+(curDy.gz||'')+'</b>'+((curDy.startDate&&curDy.endDateExclusive)?'（'+curDy.startDate+' ～ '+curDy.endDateExclusive+'）':((curDy.ageStart!=null)?'（'+curDy.ageStart+'～'+curDy.ageEnd+'歲）':''))+'</div>';
    if (_meta && _meta.solarNote) h += '<div class="sline" style="font-size:.68rem;opacity:.7">真太陽時'+_meta.solarNote+'</div>';
    h += '</div></div>';

    // AI 卡
    h += '<div class="bzx-ai-card"><div class="bzx-ai-title">🌙 AI 深度解讀</div>';
    h += '<div class="bzx-ai-desc">輕觸按鈕複製，貼到 AI 對話送出即可。提示詞已含排盤事實、模型限制與判讀規範。</div>';
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
      ['格局候選','扶抑／調候／特殊格局分層複核'],
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
  //  buildBaziPrompt — 把排盤事實與流派模型分層組成完整提示詞
  // ════════════════════════════════════════════════════════
  function buildBaziPrompt(question, b, meta) {
    var L=[], P=b.pillars||{}, G=b.gods||{}, CG=b.cangGan||{}, CS=b.cs||{}, NY=b.nayinAll||{};
    var keys=['year','month','day','hour'];
    var role={year:'年柱',month:'月柱',day:'日柱',hour:'時柱'};
    var palace={year:'祖上、家族根基、幼年環境',month:'父母、成長環境、事業平台',day:'本人、配偶與親密關係',hour:'子女、部屬、晚景與成果'};
    var pad=function(n){return String(n).padStart(2,'0');};
    var fmtDate=function(x){return x?String(x):'—';};
    var animal=(P.year&&ZODIAC_ANIMAL[P.year.zhi])||'';
    var policy=b.calculationPolicy||{};

    L.push('【角色】');
    L.push('你是熟悉子平法、節氣曆法與不同命理流派的資深八字分析者。先直接回答問題，再交代盤面依據。命理是傳統詮釋體系，不是科學預測；不得把推論寫成確定會發生的事。');
    L.push('');
    L.push('【使用者問題】');
    L.push(question||'未指定單一問題：請分析命格主軸、目前大運與未來三年的主要趨勢。');
    L.push('');

    L.push('【A. 排盤事實層——可以重算核對，不得擅自改柱】');
    L.push('命主：'+(b.gender==='female'?'女命':'男命')+(animal?'・屬'+animal:'')+(meta&&meta.birthLine?'・'+meta.birthLine:''));
    if(meta&&meta.solarInfo){
      var si=meta.solarInfo;
      L.push('民用出生時間校正為真太陽時：'+(si.trueSolarDateTime||'—')+'；經度 '+(meta&&meta.longitude!=null?Number(meta.longitude).toFixed(2)+'°':'未提供')+'；經度修正 '+Number(si.longitudeCorrectionMinutes||0).toFixed(2)+' 分、均時差 '+Number(si.equationOfTimeMinutes||0).toFixed(2)+' 分、DST '+Number(si.dstOffsetMinutes||0)+' 分；時區 '+(si.timezoneId||'固定UTC偏移')+'。');
      if(si.timezoneSource==='fixed-offset')L.push('時區限制：本次只有固定 UTC 偏移，無法驗證出生地歷史 DST／時區變更；若接近時辰、換日或節氣邊界，須補 IANA 時區後重排。');
      if(si.civilTimeStatus==='ambiguous-earlier')L.push('DST 重疊警告：該民用時間對應兩個瞬間，本次採較早一次；須確認出生證明記錄採哪一個偏移。');
      if(si.civilTimeStatus==='nonexistent-compatible')L.push('DST 缺口警告：輸入的民用時間在該地不存在，本次採相容解析；不得用此結果下邊界性結論。');
    }else if(meta&&meta.solarNote){L.push('真太陽時：'+meta.solarNote+'。');}
    L.push('排盤政策：曆法引擎 '+(policy.calendarEngine||'備援演算法')+(policy.calendarEngineVersion?' '+policy.calendarEngineVersion:'')+'；精度 '+(policy.calendarPrecision||'未標示')+'；換日 '+(policy.dayBoundaryLabel||'未標示')+'；流年以'+(policy.annualBoundary||'立春')+'為界；大運採半開區間 [起點,下一起點)；目前運勢比較基準 '+(policy.referenceTimeBasis||'未標示')+'。');
    if(policy.calendarFallback)L.push('警告：本次未使用精確曆法引擎，結果屬備援近似；遇節氣、23時或交運邊界不得下精確結論。');
    if(meta&&meta.unknown)L.push('重大限制：出生時辰未知，目前以午時暫排。時柱、時柱十神與藏干、命宮／胎息類資料、部分神煞、真太陽時細節及精確起運時刻均屬低信度；回答不得把這些欄位當成定論，並應優先使用年、月、日三柱可支持的內容。');
    keys.forEach(function(k){
      var p=P[k]||{}, gd=G[k]||{}, cg=Array.isArray(CG[k])?CG[k]:[];
      var zgs=Array.isArray(gd.zhi)?gd.zhi:[];
      L.push('・'+role[k]+'：'+(p.gan||'')+(p.zhi||'')+'；天干十神 '+(k==='day'?'日主':(_fmt(gd.gan)||'—'))+'；藏干 '+(cg.join('、')||'—')+(zgs.length?'（'+zgs.join('、')+'）':'')+(CS[k]?'；十二長生 '+_fmt(CS[k]):'')+(NY[k]?'；納音 '+_fmt(NY[k]):''));
    });
    if(b.renyuan)L.push('・人元司令：'+_fmt(b.renyuan)+'（輔助月令用事，不改變月柱）。');
    if(b.kongwang){var kw=[].concat(b.kongwang.year||[],b.kongwang.day||[]).filter(function(v,i,a){return v&&a.indexOf(v)===i;});if(kw.length)L.push('・空亡：'+kw.join('、')+'。');}
    if(b.qiyun){L.push('・起運：'+(b.qiyun.startAgeText||'—')+'；交運點 '+fmtDate(b.qiyun.startDate)+'；順逆 '+(b.qiyun.direction==='forward'?'順行':'逆行')+'；取'+(b.qiyun.referenceJie||'節')+' '+fmtDate(b.qiyun.referenceJieDate)+'；精度 '+(b.qiyun.precision||'未標示')+'。');}
    L.push('四柱宮位只作傳統象義定位：年柱＝'+palace.year+'；月柱＝'+palace.month+'；日柱＝'+palace.day+'；時柱＝'+palace.hour+'。不可把宮位象義直接當成已發生事件。');
    L.push('');

    L.push('【原局干支作用——由核心唯一計算】');
    var interactions=[];
    (b.branchInteractions||[]).forEach(function(x){
      if(!x)return; interactions.push('・'+(x.type||x.typeCode||'作用')+'：'+(x.desc||((x.branches||[]).join('')))+(x.effect?'；'+x.effect:'')+(x.typeCode==='COMBINATION_2'?'；僅代表六合配對，是否合化待審':''));
    });
    (b.hiddenInteractions||[]).forEach(function(x){if(x&&x.zh)interactions.push('・暗合參考：'+x.zh+'（暗合屬輔助，不可壓過明見刑沖合害）。');});
    if(b.hiddenInteractionPolicy&&!b.hiddenInteractionPolicy.enabled)L.push('暗合政策：'+b.hiddenInteractionPolicy.reason);
    if(interactions.length)L.push(interactions.join('\n'));else L.push('原局未檢出需特別列示的明顯刑沖合害破、三合三會或半合拱合。');
    L.push('判讀限制：配對存在≠必然成化；合化須另審月令、透干、引化、同黨、沖破與全局氣勢。沖、刑、害、破也不自動等於凶，須看所動之柱、十神、喜忌與歲運是否引發。');
    L.push('');

    L.push('【B. 流派模型層——必須標成判斷，不得冒充客觀數值】');
    L.push('日主 '+(b.dm||'')+'（'+(b.dmEl||'')+'），生於'+((P.month&&P.month.zhi)||'')+'月；得令 '+(b.deLing?'是':'否')+'、日支坐根 '+(b.deDi?'是':'否')+'、天干助勢 '+(b.deShi?'是':'否')+'。');
    if(b.tongGen&&b.tongGen.zh)L.push('通根：'+b.tongGen.zh+'。');
    L.push('本系統旺衰模型判為：'+(b.strongLevel||(b.strong?'身強':'身弱'))+(b.selfPts!=null?'；自黨相對分 '+Math.round(b.selfPts):'')+(b.strengthConflict?'；存在邊界/矛盾，必須提供替代判法':'')+'。');
    if(b.strengthNote)L.push('旺衰複核提示：'+b.strengthNote);
    if(b.strengthAssessment&&b.strengthAssessment.disclaimer)L.push('旺衰模型限制：'+b.strengthAssessment.disclaimer);
    if(b.ep){L.push('五行相對權重（僅供本模型內比較，不是古籍固定比例）：'+['木','火','土','金','水'].map(function(e){return e+Math.round(b.ep[e]||0)+'%';}).join('、')+'。');}
    if(b.specialStructure){L.push('特殊格局已確認候選：'+(b.specialStructure.type||'')+'；'+(b.specialStructure.desc||'')+'。仍須檢查根氣、破格字與逆勢。');}
    if(Array.isArray(b.specialStructureCandidates)&&b.specialStructureCandidates.length){
      L.push('特殊格局待審候選：'+b.specialStructureCandidates.map(function(c){return (c.type||'候選')+'；支持：'+((c.evidence||[]).join('、')||'—')+'；阻礙：'+((c.blockingEvidence||[]).join('、')||'未列')+'；尚須檢查：'+((c.requiredChecks||[]).join('、')||'—');}).join('｜')+'。這些候選不自動覆蓋扶抑喜忌。');
    }
    if(!b.specialStructure&&b.zhengGe&&b.zhengGe.geName){L.push('月令取格候選：'+b.zhengGe.geName+(b.zhengGe.geGod?'（格神 '+b.zhengGe.geGod+'）':'')+'。取格是觀察框架，不可單獨代替旺衰、調候與全局生剋。');}
    if(b.guanShaMix&&b.guanShaMix.zh)L.push('官殺辨析：'+b.guanShaMix.zh);
    if(Array.isArray(b.strengthPattern)&&b.strengthPattern.length)L.push('旺衰結構候選標記：'+b.strengthPattern.map(function(x){return (x.type||'未命名')+(x.el?'（'+(Array.isArray(x.el)?x.el.join('、'):x.el)+'）':'');}).join('、')+'。這些只列候選證據，需由月令、根氣、透干與制化重新論證，不自動改寫喜忌，也不得直接推成人生事件。');
    L.push('扶抑喜用候選：'+(Array.isArray(b.fav)&&b.fav.length?b.fav.join('、'):'—')+'；忌神候選：'+(Array.isArray(b.unfav)&&b.unfav.length?b.unfav.join('、'):'—')+'。');
    if(b.wuxingStance&&b.wuxingStance.summary)L.push('本系統扶抑基準五行立場：'+b.wuxingStance.summary+'。若不同流派取用相反，必須把爭點與會翻盤的條件說明，不可假裝只有一種答案。');
    if(b.tiaohou&&b.tiaohou.need&&b.tiaohou.need.length)L.push('調候候選：需 '+b.tiaohou.need.join('、')+(b.tiaohou.avoid&&b.tiaohou.avoid.length?'；避 '+b.tiaohou.avoid.join('、'):'')+'；理由 '+(b.tiaohou.reason||'')+' '+(b.tiaohou.detail||'')+'；急迫度 '+(b.tiaohou.priority||'未標示')+'。'+(b.tiaohou.sourcePolicy||'調候為傳統季節象義')+'。'+(b.tiaohou.integrationNote||'調候與扶抑分開判讀。'));
    if(b.medicineGod)L.push('病藥模型：'+_fmt(b.medicineGod)+'。');
    if(b.relayGod)L.push('通關模型：'+_fmt(b.relayGod)+'。');
    L.push(policy.relativeWeightDisclaimer||'以上旺衰、五行比例與吉凶分數均為相對模型，不是客觀測量。');
    L.push('');

    L.push('【大運與流年資料】');
    if(Array.isArray(b.dayun)){
      b.dayun.filter(function(d){return d&&d.gz&&d.gz!=='小運';}).forEach(function(d){
        L.push('・'+d.gz+'：'+fmtDate(d.startDate)+' ～ '+fmtDate(d.endDateExclusive)+'（終點不含）'+(d.god?'；干十神 '+d.god:'')+(d.zGod?'；支本氣十神 '+d.zGod:'')+(d.luckLabel?'；模型標記 '+d.luckLabel:'')+(d.isCurrent?' ★現行':''));
      });
    }
    var cur=_currentDayun(b);
    if(cur){
      L.push('現行大運：'+cur.gz+'，'+fmtDate(cur.startDate)+' 起，至 '+fmtDate(cur.endDateExclusive)+' 交下一運。');
      if(cur.phaseNow)L.push('常用前後段觀察：目前為'+cur.phaseNow.half+'，觀察重點 '+cur.phaseNow.gz+'（'+cur.phaseNow.el+'、'+cur.phaseNow.god+'），至 '+fmtDate(cur.phaseNow.untilDate)+'；但'+cur.phaseNow.disclaimer);
      if(cur.phaseNow&&cur.phaseNow.nextDaYun)L.push('下一步大運：'+cur.phaseNow.nextDaYun.gz+'（模型標記 '+(cur.phaseNow.nextDaYun.luckLabel||'—')+'）。');
    }
    if(b.liuNianGZ)L.push('目前流年：'+b.liuNianGZ+'（以立春為年界；對應年份 '+((b.liuNianPeriod&&b.liuNianPeriod.year)||'—')+'）。');
    var refYear=(b.liuNianPeriod&&b.liuNianPeriod.year)||new Date(isFinite(b._referenceTimestamp)?b._referenceTimestamp:Date.now()).getUTCFullYear();
    var future=[];
    (b.dayun||[]).forEach(function(d){(d&&d.liuNian||[]).forEach(function(x){if(x&&x.year>=refYear&&x.year<=refYear+3&&!future.some(function(y){return y.year===x.year;}))future.push(x);});});
    future.sort(function(a,c){return a.year-c.year;});
    if(future.length)L.push('近四個立春年度：'+future.map(function(x){return x.year+' '+x.gz+'（模型 '+(x.level||'未評')+'；區間 '+x.periodStart+' ～ '+x.periodEndExclusive+'）';}).join('；')+'。');
    L.push('流年與大運的「吉凶等級」只能當相對排序。刑沖合害、三合三會只列觸發，不參與自動加減分；不得從分數直接編造百分比、必然事件、特定月份、金額、對象年齡或疾病。');
    L.push('');

    var ss=[];
    (b.shensha||[]).forEach(function(x){var t=x&&x.name?x.name:_fmt(x);if(t&&ss.indexOf(t)<0)ss.push(t);});
    (b.extraShenSha||[]).forEach(function(x){var t=x&&x.name?x.name:_fmt(x);if(t&&ss.indexOf(t)<0)ss.push(t);});
    if(ss.length){L.push('【神煞資料（末位輔助）】');L.push(ss.join('、')+'。神煞不能單獨定吉凶、婚姻、疾病或生死，只能在干支生剋已有同向訊號時補充。');L.push('');}

    L.push('【判讀規範】');
    L.push('1. 第一段先給問題的明確結論，但使用「較可能、傾向、條件是」等符合證據強度的措辭；盤面無法支持就直說看不出。');
    L.push('2. 推理順序：月令與日主根氣 → 全局生剋制化 → 格局是否成立 → 扶抑與調候是否一致 → 原局刑沖合害 → 大運精確交界 → 流年引動。不得只數五行，也不得只背格局名稱。');
    L.push('3. 旺衰與用神如處臨界或流派可爭，至少列出主判、替代判法、兩者在現實應驗上的可區分條件。不要用事後發生的任何事都能解釋的話術。');
    L.push('4. 六合、天干五合、三合三會只先說「有合局/配對條件」；未完成成化審查前禁止寫「已化成某五行」。半合、拱合力量低於完整成局。');
    L.push('5. 沖刑害破先講引動、對立、牽制或不穩，再根據所動五行與宮位判方向；禁止「沖忌必吉、沖喜必凶」的一刀切。');
    L.push('6. 大運干支十年均作用。「前五年偏干、後五年偏支」只可作側重觀察，不可說前段地支完全不管、後段天干完全失效。所有換運時間以資料中的精確日期為準。');
    L.push('7. 調候、扶抑、格局、病藥、通關是不同分析鏡頭。結論衝突時說明採用哪一套、為何，不能偷換標準。');
    L.push('8. 神煞、納音、命宮、胎元、稱骨等不得凌駕四柱月令與生剋；與主線無關時可以不講。');
    L.push('9. 不引用本提示詞以外的個人背景、記憶或對話資訊；不臆測具體職業、人物、私生活與已發生事件。');
    L.push('10. 財務、健康、法律等高風險事項只能給一般風險提醒，不可用命盤代替專業判斷。');
    L.push('');

    L.push('【輸出要求】');
    L.push('繁體中文。第一句直接回答，之後用自然段說明最關鍵的3–5個盤面依據、時間界線、風險與可行行動。不要把整份資料逐欄複誦，不要裝作百分之百確定。');
    L.push('最後可推薦至多一種水晶作為穿搭或文化象徵；必須明說沒有證據可保證改運、招財或治療，不得把礦石當成命理處方。');
    L.push('倒數第二行只輸出：[靜月之光蝦皮賣場](https://shopee.tw/a50h95648d?tab=shop)');
    L.push('最後一行只輸出：願你諸事順遂。');
    return L.join('\n');
  }
  window.buildBaziPrompt = buildBaziPrompt;

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
    if (y < 1900 || y > 2100) { _bzxErr('出生年需在 1900–2100 之間'); return; }

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
    if (typeof window.Solar === 'undefined') need.push('JS/vendor/lunar.js');
    if (typeof window.BaziCalendarCore === 'undefined') need.push('JS/bazi-calendar-core.js');
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
          var si = calcTrueSolarTime(y, m, d, hh, mm, city.lng, city.tz, city.tzid);
          if (si) { sY = si.year; sM = si.month; sD = si.day; sHH = si.hour; sMM = si.minute; solarNote = si.note || ''; }
        }
        var bazi = computeBazi(sY, sM, sD, sHH, sMM, _gender, {second:(si&&si.second)||0,trueSolarTimeApplied:!!si,timezoneId:city.tzid||null,timezoneOffset:city.tz,longitude:city.lng,dayBoundaryMode:_dayBoundaryMode});
        if (!bazi) { _bzxErr('排盤失敗，請確認出生資料後重試'); return; }
        try { if (typeof enhanceBazi === 'function') enhanceBazi(bazi); } catch (e) { console.error('[bazi] enhance', e); }

        var pad = function (n) { return (n < 10 ? '0' : '') + n; };
        _meta = {
          gender: _gender,
          question: question,
          birthLine: '國曆 ' + y + '/' + pad(m) + '/' + pad(d) + (unknown ? '（時辰未知，以午時暫排）' : ' ' + pad(hh) + ':' + pad(mm)) + '・' + city.n.replace(/（.*/, ''),
          solarNote: solarNote,
          solarInfo: (typeof si !== 'undefined' ? si : null),
          timezoneId: city.tzid || null,
          longitude: city.lng,
          timezoneOffset: city.tz,
          unknown: unknown,
          dayBoundaryMode: _dayBoundaryMode
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
      dayun: cur ? ((cur.gz || '') + (cur.startDate && cur.endDateExclusive ? '（' + cur.startDate + '～' + cur.endDateExclusive + '）' : (cur.ageStart != null ? '（' + cur.ageStart + '～' + cur.ageEnd + '歲）' : ''))) : ''
    });
  };

  window._baziOpenFullSuite = function () {
    if (typeof window._baziFullSuiteOpen !== 'function') {
      _bzxErr('完整八字功能仍在載入，請稍候再試一次');
      return;
    }
    var w = _getWrap();
    if (w) w.style.display = 'none';
    try { document.body.style.overflow = ''; } catch (e) {}
    window._baziFullSuiteOpen();
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
  window._baziSetDayBoundary = function (mode) {
    _dayBoundaryMode = mode === 'MIDNIGHT_00' ? 'MIDNIGHT_00' : 'ZI_HOUR_23';
    var btns = document.querySelectorAll('#bzx-screen .bzx-dbtn');
    if (btns && btns.length === 2) {
      btns[0].classList.toggle('active', _dayBoundaryMode === 'ZI_HOUR_23');
      btns[1].classList.toggle('active', _dayBoundaryMode === 'MIDNIGHT_00');
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
