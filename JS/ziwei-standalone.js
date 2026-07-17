/*! ziwei-standalone.js — 靜月之光 紫微斗數獨立流程  [v80.61]
 *  v80.61(2026/7/17)：真正根治手機選單機率性缺列——移除透明 fixed 疊層雙 RAF 顯示競態與巢狀捲動，改同步可見、visualViewport 實高、整張 sheet 捲動；日期改為明確六列七欄，並在字型／視窗穩定後校驗 6 列 42 格及強制重繪。
 *  v80.60(2026/7/17)：紫微提示詞 ROOT-SPEC 共用根治——三合主判與飛星／欽天輔助分層、問題保真、空宮／格局／四化／運限證據裁決、題型量測邊界、反證與可驗證行動、依問題自然導流的單一礦物品牌層。另修正資料標頭不再誤稱已作真太陽時校正，並將引擎格局／星系固定文案降為候選。
 *  v80.59(2026/7/17)：根治 Android／Samsung 底部選單偶發缺欄、缺列與空白重繪：補獨立 box-sizing、動態視窗高度、安全區、橫向防溢出、固定六週日曆；手機停用 transform＋backdrop-filter 疊層，改穩定淡入並以雙 requestAnimationFrame 開啟。
 *  v80.58(2026/6/12)：①題型判斷把「天命/人生方向/人生意義」明列綜合題（實測此類問題被當單一主題從簡：
 *    漏身宮、漏格局名、無吉凶影響度標記、只用單一流年）②深度要求1補「人生主軸題必讀身宮」（實測身宮坐
 *    福德與生年貪狼忌同宮——全盤最強天命訊號——輸出隻字未提）③修 v80.56 接縫贅語「語氣平實不推銷，語氣平實」
 *  v80.56(2026/6/12)：①空宮借星資料層直給（實測 AI 把財帛酉空宮借成夫妻武破；正統借星安宮只借對宮，
 *    酉應借卯福德紫貪——借宮運算不再留給模型）②鐵律⑦應期精確到「年」為止，禁編月份窗口（實測輸出
 *    「2026年5–8月」等月份，但資料區無流月資料＝硬編；待引擎實作斗君流月再開放）③蝦皮連結改「犧牲行」
 *    結構（網址倒數第二行＋固定收尾句墊後；實測紫微輸出 URL 尾又黏不可見字元，與梅花 v80.38 同款根治）
 *  v80.53(2026/6/10)：①廟旺改印全稱——原 slice(-1) 把「得地」截成「地」（AI 實測誤讀成弱、竄寫成落陷）、「不得地」截成「得」＝負級印成正級（UI 端同修）②化忌行標註「（沖對宮）」資料直給（AI 實測只讀坐宮漏讀沖宮）③鐵律②嚴禁盤外資訊（八字路徑已驗有效，紫微未設防實測全面復發：工廠/班別/商品全進來了）④⑤等級嚴禁改寫⑥四化層級不可錯置（實測把大限祿寫成化權）⑦選石嚴禁並列（實測又寫「天鐵或黑瑪瑙」）⑧清單補石項
 *  v80.52(2026/6/10)：完整性清單加「正文無指令字眼」（八字路徑實測模型把「語氣平實」唸給客人聽，同款收尾指令一律補防線）
 *  目的（歐那 2026/6/6）：
 *    1) 紫微斗數獨立入口不再借用七維表單與七維流程；只需出生年月日 + 時辰(可選) + 性別，「不需姓名」。
 *    2) 全新紫微專屬過場動畫（十二宮命盤天成），符合網頁金色/暗底風格，純 CSS/SVG，不需圖檔。
 *    3) 最後輸出「比文墨天機更深」的紫微斗數 AI 解讀提示詞：三方四正整合、四化飛星串連、格局判定、體用應期。
 *  資料來源：沿用既有 computeZiwei()（三合四化骨架）；本入口以時辰代表時排盤，未作出生地經度真太陽時校正。
 *  只需部署本檔 + ui.js + index.html（version bump）。
 */
(function () {
  'use strict';

  var DZ = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
  var GOLD = '#c9a84c';

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

  var _lastPrompt = '';
  var _zwGender = '';   // 自包覆輸入頁的性別選擇
  // v80.30 自訂選擇器狀態（寫回隱藏 zw-bd / zw-hh，_ziweiSubmit 沿用）
  var _zwSelDate = '';
  var _zwSelHH = '';
  var _zwLastChart = null;
  var _zwLastForm = null;

  // ════════════════════════════════════════════════════════
  //  CSS（命名空間 zw-*，自帶不依賴 style.css）
  // ════════════════════════════════════════════════════════
  function zwEnsureCSS() {
    if (document.getElementById('zw-standalone-css')) return;
    var st = document.createElement('style');
    st.id = 'zw-standalone-css';
    st.textContent = [
      // ── 過場動畫 ──
      '.zw-load{position:fixed;inset:0;z-index:3000;display:flex;flex-direction:column;align-items:center;justify-content:center;',
        'background:radial-gradient(120% 90% at 50% 28%,rgba(46,30,12,.55),rgba(13,8,5,.97) 62%,#0a0604 100%);overflow:hidden}',
      '.zw-load-stars{position:absolute;inset:0;pointer-events:none;overflow:hidden}',
      '.zw-load-stars i{position:absolute;bottom:-6%;width:2px;height:2px;border-radius:50%;background:rgba(212,175,55,.7);box-shadow:0 0 6px rgba(212,175,55,.6);',
        'animation:zwRise var(--d,5s) linear var(--dl,0s) infinite;opacity:0}',
      '@keyframes zwRise{0%{transform:translateY(0) scale(.6);opacity:0}12%{opacity:.9}88%{opacity:.7}100%{transform:translateY(-108vh) scale(1);opacity:0}}',
      // 命盤方陣
      '.zw-board{position:relative;width:min(340px,84vw);aspect-ratio:1;display:grid;grid-template-columns:repeat(4,1fr);grid-template-rows:repeat(4,1fr);gap:6px;',
        'padding:10px;border-radius:16px;border:1px solid rgba(212,175,55,.32);background:linear-gradient(150deg,rgba(212,175,55,.05),rgba(212,175,55,.012));',
        'box-shadow:0 0 50px rgba(212,175,55,.10),inset 0 0 26px rgba(0,0,0,.4);opacity:0;transform:scale(.92);animation:zwBoardIn .7s cubic-bezier(.16,1,.3,1) forwards}',
      '@keyframes zwBoardIn{to{opacity:1;transform:scale(1)}}',
      '.zw-cell{position:relative;border:1px solid rgba(212,175,55,.14);border-radius:8px;background:rgba(212,175,55,.018);display:flex;align-items:center;justify-content:center;',
        'font-family:"Noto Serif TC",serif;font-size:.62rem;color:rgba(212,175,55,.45);letter-spacing:.04em;opacity:0;transform:scale(.7);',
        'animation:zwCellIn .5s cubic-bezier(.16,1,.3,1) forwards;animation-delay:var(--cd,0s)}',
      '@keyframes zwCellIn{0%{opacity:0;transform:scale(.7)}60%{opacity:1}100%{opacity:1;transform:scale(1)}}',
      '.zw-cell.zw-ming{color:rgba(255,236,184,.95);border-color:rgba(212,175,55,.6);background:rgba(212,175,55,.10);box-shadow:0 0 16px rgba(212,175,55,.35)}',
      '.zw-cell.zw-ming::after{content:"";position:absolute;inset:-1px;border-radius:8px;border:1px solid rgba(255,236,184,.5);animation:zwMingPulse 1.8s ease-in-out infinite}',
      '@keyframes zwMingPulse{0%,100%{opacity:.25}50%{opacity:.9}}',
      '.zw-center{grid-column:2/4;grid-row:2/4;border-radius:10px;border:1px solid rgba(212,175,55,.22);background:radial-gradient(circle at 50% 45%,rgba(212,175,55,.10),rgba(212,175,55,.02));',
        'display:flex;align-items:center;justify-content:center;position:relative;overflow:visible}',
      '.zw-svg{position:absolute;inset:10px;width:calc(100% - 20px);height:calc(100% - 20px);pointer-events:none;overflow:visible}',
      '.zw-svg line{stroke:rgba(212,175,55,.55);stroke-width:1;stroke-dasharray:240;stroke-dashoffset:240;animation:zwDraw 1s ease forwards}',
      '@keyframes zwDraw{to{stroke-dashoffset:0}}',
      '.zw-ziwei{position:absolute;left:50%;top:-58%;transform:translate(-50%,0);font-size:2rem;color:#ffeab8;text-shadow:0 0 18px rgba(212,175,55,.9);opacity:0;',
        'animation:zwDrop 1.1s cubic-bezier(.5,0,.2,1) forwards}',
      '@keyframes zwDrop{0%{top:-58%;opacity:0;transform:translate(-50%,0) scale(.5)}60%{opacity:1}100%{top:50%;transform:translate(-50%,-50%) scale(1);opacity:1}}',
      '.zw-burst{position:absolute;left:50%;top:50%;width:10px;height:10px;border-radius:50%;transform:translate(-50%,-50%);background:radial-gradient(circle,rgba(255,236,184,.95),rgba(212,175,55,0));opacity:0}',
      '.zw-burst.go{animation:zwBurst .6s ease-out forwards}',
      '@keyframes zwBurst{0%{opacity:.95;width:10px;height:10px}100%{opacity:0;width:340px;height:340px}}',
      '.zw-load-status{margin-top:1.5rem;font-family:"Noto Serif TC",serif;font-size:1.05rem;font-weight:700;color:'+GOLD+';letter-spacing:.12em;text-shadow:0 2px 14px rgba(0,0,0,.6);transition:opacity .3s;min-height:1.4rem}',
      '.zw-load-sub{margin-top:.4rem;font-size:.74rem;color:rgba(212,175,55,.55);letter-spacing:.08em;transition:opacity .3s;min-height:1.1rem}',
      // ── 結果頁 ──
      '.zw-res{position:fixed;inset:0;z-index:2900;overflow-y:auto;-webkit-overflow-scrolling:touch;background:radial-gradient(120% 80% at 50% 0%,rgba(40,26,10,.5),#0c0805 60%,#090604 100%);padding:calc(14px + env(safe-area-inset-top,0)) 14px calc(34px + env(safe-area-inset-bottom,0))}',
      '.zw-res-inner{max-width:560px;margin:0 auto}',
      '.zw-res-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:.4rem}',
      '.zw-res-title{font-family:"Noto Serif TC",serif;font-size:1.18rem;font-weight:800;color:'+GOLD+';letter-spacing:.04em;display:flex;align-items:center;gap:8px}',
      '.zw-res-x{background:none;border:none;color:rgba(212,175,55,.6);font-size:1.7rem;line-height:1;cursor:pointer;padding:0 6px}',
      '.zw-meta{font-size:.72rem;color:rgba(200,190,170,.6);line-height:1.6;margin-bottom:.9rem}',
      // 命盤 grid（地支固定盤）
      '.zw-chart{display:grid;grid-template-columns:repeat(4,1fr);grid-template-rows:repeat(4,1fr);gap:5px;aspect-ratio:1;margin-bottom:1rem}',
      '.zw-pg{position:relative;border:1px solid rgba(212,175,55,.16);border-radius:9px;background:rgba(212,175,55,.022);padding:5px 5px 4px;display:flex;flex-direction:column;overflow:hidden;min-height:0}',
      '.zw-pg.ming{border-color:rgba(255,236,184,.55);background:rgba(212,175,55,.085);box-shadow:0 0 14px rgba(212,175,55,.18)}',
      '.zw-pg-stars{flex:1;display:flex;flex-wrap:wrap;gap:2px 4px;align-content:flex-start;font-family:"Noto Serif TC",serif;font-size:.62rem;line-height:1.2;color:rgba(255,236,184,.92)}',
      '.zw-pg-stars .sha{color:rgba(239,138,138,.85)}',
      '.zw-pg-stars .aux{color:rgba(160,200,255,.8)}',
      '.zw-pg-stars .hua{color:#0c0805;background:'+GOLD+';border-radius:3px;padding:0 2px;font-size:.52rem;font-weight:800;margin-left:1px;vertical-align:top}',
      '.zw-pg-stars .hua.ji{background:#ef8a8a;color:#2a0c0c}',
      '.zw-pg-foot{display:flex;justify-content:space-between;align-items:flex-end;margin-top:2px}',
      '.zw-pg-name{font-family:"Noto Serif TC",serif;font-size:.6rem;font-weight:700;color:rgba(212,175,55,.8)}',
      '.zw-pg-name .badge{font-size:.5rem;color:#0c0805;background:rgba(255,236,184,.9);border-radius:3px;padding:0 2px;margin-left:2px}',
      '.zw-pg-dz{font-size:.55rem;color:rgba(200,190,170,.45)}',
      '.zw-pg-center{grid-column:2/4;grid-row:2/4;border:1px solid rgba(212,175,55,.22);border-radius:11px;background:radial-gradient(circle at 50% 40%,rgba(212,175,55,.07),rgba(212,175,55,.012));',
        'display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:8px;gap:3px}',
      '.zw-pg-center b{font-family:"Noto Serif TC",serif;color:'+GOLD+';font-size:.82rem;letter-spacing:.05em}',
      '.zw-pg-center span{font-size:.62rem;color:rgba(200,190,170,.7);line-height:1.5}',
      // facts + 格局
      '.zw-facts{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-bottom:.9rem}',
      '.zw-fact{border:1px solid rgba(212,175,55,.12);border-radius:10px;background:rgba(212,175,55,.025);padding:.5rem .65rem}',
      '.zw-fact .k{font-size:.62rem;color:rgba(212,175,55,.6);margin-bottom:.15rem}',
      '.zw-fact .v{font-size:.8rem;color:rgba(255,236,184,.92);line-height:1.45;font-family:"Noto Serif TC",serif}',
      '.zw-chips{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:1.1rem}',
      '.zw-chip{font-size:.66rem;color:'+GOLD+';background:rgba(212,175,55,.1);border:1px solid rgba(212,175,55,.24);border-radius:999px;padding:3px 10px;font-family:"Noto Serif TC",serif}',
      '.zw-chip.warn{color:#ef9a9a;background:rgba(239,138,138,.08);border-color:rgba(239,138,138,.3)}',
      // AI 卡
      '.zw-ai{border:1px solid rgba(212,175,55,.2);border-radius:16px;background:linear-gradient(160deg,rgba(212,175,55,.06),rgba(212,175,55,.012));padding:1.1rem 1rem;text-align:center}',
      '.zw-ai-title{font-family:"Noto Serif TC",serif;font-size:1rem;font-weight:800;color:'+GOLD+';margin-bottom:.25rem}',
      '.zw-ai-desc{font-size:.72rem;color:rgba(200,190,170,.6);margin-bottom:.8rem;line-height:1.55}',
      '.zw-ai-copy{width:100%;padding:.85rem;border-radius:12px;border:1.5px solid rgba(212,175,55,.45);background:linear-gradient(135deg,rgba(212,175,55,.16),rgba(212,175,55,.05));',
        'color:#ffeab8;font-family:"Noto Serif TC",serif;font-size:.95rem;font-weight:700;letter-spacing:.06em;cursor:pointer;transition:all .25s}',
      '.zw-ai-copy:active{transform:scale(.98)}',
      '.zw-ai-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-top:.85rem}',
      '.zw-ai-sc{display:flex;flex-direction:column;align-items:center;gap:3px;padding:.5rem .2rem;border-radius:11px;border:1px solid rgba(255,255,255,.06);background:rgba(255,255,255,.02);cursor:pointer;transition:all .2s}',
      '.zw-ai-sc:active{transform:scale(.95)}',
      '.zw-ai-sc img{width:26px;height:26px;border-radius:7px}',
      '.zw-ai-sc span{font-size:.58rem;color:rgba(200,190,170,.75)}',
      '.zw-ai-foot{font-size:.64rem;color:rgba(200,190,170,.4);margin-top:.7rem;line-height:1.5}',
      '.zw-actions{display:flex;gap:10px;margin-top:1.1rem}',
      '.zw-btn{flex:1;padding:.75rem;border-radius:11px;border:1px solid rgba(212,175,55,.2);background:transparent;color:rgba(212,175,55,.75);font-size:.82rem;font-weight:600;cursor:pointer;font-family:inherit}',
      '.zw-res-foot{text-align:center;font-size:.66rem;color:rgba(160,152,128,.4);margin-top:1.3rem;line-height:1.6}',
      // ── 自包覆輸入頁（比照雷諾曼，自成一頁，不借用 step-0）──
      '.zw-in{position:fixed;inset:0;z-index:99999;overflow-y:auto;-webkit-overflow-scrolling:touch;background:#0a0a0f;font-family:"Noto Serif TC",Georgia,serif;color:#e8e0d0}',
      '.zw-in-wrap{max-width:480px;margin:0 auto;padding:1rem .8rem 3rem}',
      '.zw-in-back{color:rgba(232,224,208,.5);text-decoration:none;font-size:.82rem;display:inline-block;margin-bottom:.5rem;cursor:pointer}',
      '.zw-in-head{text-align:center;padding:1.5rem 0 1rem}',
      '.zw-in-head h1{font-size:1.5rem;color:'+GOLD+';letter-spacing:8px;margin-bottom:.3rem}',
      '.zw-in-head p{font-size:.75rem;color:rgba(232,224,208,.5);letter-spacing:2px}',
      '.zw-in-sec{background:#13131a;border:1px solid rgba(201,168,76,.15);border-radius:14px;padding:1.1rem;margin-bottom:.8rem}',
      '.zw-in-title{font-size:.82rem;color:'+GOLD+';margin-bottom:.7rem}',
      '.zw-in-q{width:100%;padding:.65rem;border-radius:10px;border:1px solid rgba(201,168,76,.3);background:rgba(255,255,255,.03);color:#e8e0d0;font-family:inherit;font-size:.85rem;resize:none;outline:none;line-height:1.6}',
      '.zw-in-q::placeholder{color:rgba(232,224,208,.4)}',
      '.zw-in-q:focus{border-color:rgba(201,168,76,.5)}',
      '.zw-in-field{margin-bottom:.7rem}',
      '.zw-in-label{font-size:.72rem;color:rgba(232,224,208,.55);margin-bottom:.3rem;display:block}',
      '.zw-in input[type=date],.zw-in select{width:100%;padding:.6rem;border-radius:10px;border:1px solid rgba(201,168,76,.3);background:rgba(255,255,255,.03);color:#e8e0d0;font-family:inherit;font-size:.9rem;outline:none}',
      '.zw-in input[type=date]:focus,.zw-in select:focus{border-color:rgba(201,168,76,.5)}',
      '.zw-in-pills{display:flex;gap:.5rem}',
      '.zw-in-pill{flex:1;padding:.6rem;border-radius:10px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.03);color:rgba(232,224,208,.55);text-align:center;cursor:pointer;font-family:inherit;font-size:.88rem;transition:all .2s}',
      '.zw-in-pill.active{border-color:rgba(201,168,76,.5);background:rgba(201,168,76,.08);color:'+GOLD+'}',
      '.zw-in-hint{font-size:.68rem;color:rgba(232,224,208,.4);margin-top:.5rem;line-height:1.6}',
      '.zw-in-go{display:block;width:100%;padding:.85rem;border-radius:12px;border:1.5px solid rgba(201,168,76,.5);background:linear-gradient(135deg,rgba(201,168,76,.12),rgba(201,168,76,.04));color:'+GOLD+';font-family:inherit;font-size:.95rem;font-weight:600;letter-spacing:4px;cursor:pointer;transition:all .3s;margin-top:.4rem}',
      '.zw-in-go:active{transform:scale(.97)}',
      // ── v80.30 自訂欄位 / 底部選擇器（zwx-）──
      '.zwx-field{width:100%;display:flex;align-items:center;justify-content:space-between;gap:.5rem;padding:.72rem .8rem;border-radius:10px;border:1px solid rgba(201,168,76,.3);background:rgba(255,255,255,.03);color:#e8e0d0;font-family:inherit;font-size:.92rem;cursor:pointer;transition:all .2s;text-align:left}',
      '.zwx-field:active{transform:scale(.985)}',
      '.zwx-field .ph{color:rgba(232,224,208,.4)}',
      '.zwx-field .val{color:#ffeab8}',
      '.zwx-field .chev{color:rgba(201,168,76,.7);font-size:.78rem;flex-shrink:0}',
      '.zwx-err{margin:.5rem 0 0;padding:.55rem .7rem;border-radius:10px;border:1px solid rgba(214,108,92,.55);background:rgba(214,108,92,.12);color:#f0c8be;font-size:.74rem;line-height:1.5;display:none}',
      '.zwx-err.show{display:block}',
      '.zwx-sheet-bd,.zwx-sheet-bd *{box-sizing:border-box}',
      '.zwx-sheet-bd{position:fixed;inset:0;width:100%;height:var(--jy-picker-vh,100vh);z-index:100002;background:rgba(0,0,0,.62);display:flex;align-items:flex-end;justify-content:center;overflow:hidden;overscroll-behavior:none;opacity:1;transition:none;padding-top:env(safe-area-inset-top);contain:none;content-visibility:visible}',
      '.zwx-sheet-bd.show{opacity:1}',
      '.zwx-sheet{width:100%;max-width:480px;max-height:calc(var(--jy-picker-vh,100vh) - env(safe-area-inset-top));display:block;overflow-x:hidden;overflow-y:auto;overscroll-behavior:contain;background:linear-gradient(180deg,#16161e,#0d0d13);border-radius:20px 20px 0 0;border:1px solid rgba(201,168,76,.25);border-bottom:none;box-shadow:0 -10px 50px rgba(0,0,0,.6),0 0 60px rgba(201,168,76,.05);padding:.9rem max(1rem,env(safe-area-inset-right)) calc(1.4rem + env(safe-area-inset-bottom)) max(1rem,env(safe-area-inset-left));opacity:1;transform:none;transition:none;font-family:"Noto Serif TC",serif;-webkit-overflow-scrolling:touch;contain:none;content-visibility:visible}',
      '.zwx-sheet-bd.show .zwx-sheet{opacity:1}',
      '#zwx-sbody{width:100%;min-width:0;min-height:0;overflow:visible;overscroll-behavior:auto;touch-action:auto;contain:none;content-visibility:visible}.zwx-cal-nav,.zwx-cal-table,.zwx-cal-head,.zwx-cal-row{width:100%;min-width:0}',
      '.zwx-grip{width:40px;height:4px;border-radius:2px;background:rgba(201,168,76,.4);margin:0 auto .7rem}',
      '.zwx-stitle{text-align:center;color:'+GOLD+';font-size:1.02rem;letter-spacing:3px;margin-bottom:.2rem}',
      '.zwx-ssub{text-align:center;color:rgba(232,224,208,.5);font-size:.7rem;margin-bottom:.9rem;min-height:1rem;line-height:1.5}',
      '.zwx-sfoot{flex:0 0 auto;display:grid;grid-template-columns:1fr 1.2fr;gap:.5rem;margin-top:.45rem;padding:.7rem 0 .1rem;background:linear-gradient(180deg,rgba(13,13,19,0),#0d0d13 30%)}',
      '.zwx-sbtn{padding:.72rem;border-radius:11px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.03);color:rgba(232,224,208,.6);font-family:inherit;font-size:.86rem;cursor:pointer;letter-spacing:2px}',
      '.zwx-sbtn.go{border-color:rgba(201,168,76,.55);background:linear-gradient(135deg,rgba(201,168,76,.18),rgba(201,168,76,.05));color:'+GOLD+';font-weight:600}',
      '.zwx-sbtn:active{transform:scale(.97)}',
      '.zwx-cal-nav{display:flex;align-items:center;justify-content:space-between;gap:.4rem;margin-bottom:.6rem}',
      '.zwx-cal-nav button{width:42px;height:42px;flex-shrink:0;border-radius:11px;border:1px solid rgba(201,168,76,.22);background:rgba(255,255,255,.03);color:'+GOLD+';font-size:1.2rem;cursor:pointer}',
      '.zwx-cal-nav button:active{transform:scale(.92)}',
      '.zwx-cal-ttl{flex:1;text-align:center;color:#ffeab8;font-size:.96rem;letter-spacing:1px;cursor:pointer;padding:.5rem;border-radius:9px}',
      '.zwx-cal-ttl:active{background:rgba(201,168,76,.08)}',
      '.zwx-cal-table{display:block;contain:none;content-visibility:visible}',
      '.zwx-cal-head,.zwx-cal-row{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));column-gap:.22rem;contain:none;content-visibility:visible}',
      '.zwx-cal-row{min-height:44px;align-items:center}',
      '.zwx-cal-wk{text-align:center;color:rgba(201,168,76,.55);font-size:.66rem;padding:.2rem 0}',
      '.zwx-cal-d{appearance:none;-webkit-appearance:none;border:0;background:transparent;padding:0;margin:0;min-width:0;width:100%;height:42px;display:flex;align-items:center;justify-content:center;border-radius:9px;color:rgba(232,224,208,.82);font-family:inherit;font-size:.88rem;line-height:1;cursor:pointer;contain:none;content-visibility:visible}',
      '.zwx-cal-d:active{background:rgba(201,168,76,.12)}',
      '.zwx-cal-d.sel{background:linear-gradient(135deg,#c9a84c,#a8863a);color:#1a140a;font-weight:700;box-shadow:0 0 14px rgba(201,168,76,.4)}',
      '.zwx-cal-d.empty{cursor:default}',
      '.zwx-pg{display:grid;gap:.4rem}',
      '.zwx-pg.y{grid-template-columns:repeat(4,1fr)}',
      '.zwx-pg.mo{grid-template-columns:repeat(3,1fr)}',
      '.zwx-cell{padding:.66rem .2rem;text-align:center;border-radius:10px;border:1px solid rgba(201,168,76,.18);background:rgba(255,255,255,.03);color:rgba(232,224,208,.82);font-size:.84rem;cursor:pointer}',
      '.zwx-cell.sel{background:linear-gradient(135deg,#c9a84c,#a8863a);color:#1a140a;font-weight:700}',
      '.zwx-cell:active{transform:scale(.95)}',
      '.zwx-yhead{display:flex;align-items:center;justify-content:space-between;margin-bottom:.6rem}',
      '.zwx-yhead button{width:40px;height:40px;border-radius:10px;border:1px solid rgba(201,168,76,.22);background:rgba(255,255,255,.03);color:'+GOLD+';font-size:1.1rem;cursor:pointer}',
      '.zwx-yhead span{color:#ffeab8;font-size:.9rem;letter-spacing:1px}',
      '.zwx-sc-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:.4rem}',
      '.zwx-sc{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.15rem;padding:.6rem .2rem;border-radius:11px;border:1px solid rgba(201,168,76,.18);background:rgba(255,255,255,.03);cursor:pointer}',
      '.zwx-sc b{color:#ffeab8;font-size:.92rem;font-weight:600}',
      '.zwx-sc i{color:rgba(232,224,208,.5);font-size:.64rem;font-style:normal;letter-spacing:.5px}',
      '.zwx-sc.sel{background:linear-gradient(135deg,#c9a84c,#a8863a);box-shadow:0 0 12px rgba(201,168,76,.35)}',
      '.zwx-sc.sel b{color:#1a140a}',
      '.zwx-sc.sel i{color:rgba(26,20,10,.7)}',
      '.zwx-sc:active{transform:scale(.94)}',
      '.zwx-sc.wide{grid-column:1/-1;flex-direction:row;gap:.5rem}',
      '.zw-in-foot{text-align:center;font-size:.6rem;color:rgba(232,224,208,.4);margin-top:1.5rem;letter-spacing:1px;line-height:1.8}',
      '@media(max-width:700px),(pointer:coarse){.zwx-sheet{backdrop-filter:none!important;-webkit-backdrop-filter:none!important;transform:none!important;transition:none!important}.zwx-sheet-bd{transition:none!important}.zwx-cal-head,.zwx-cal-row{column-gap:.12rem}.zwx-cal-d{font-size:.84rem}}',
      '@media(max-height:620px){.zwx-sheet{border-radius:16px 16px 0 0;padding-top:.55rem}.zwx-grip{margin-bottom:.45rem}.zwx-ssub{margin-bottom:.55rem}.zwx-cal-nav{margin-bottom:.3rem}.zwx-cal-nav button{height:38px}.zwx-cal-row{min-height:36px}.zwx-cal-d{height:34px}.zwx-sfoot{margin-top:.55rem}}',
      '@media(prefers-reduced-motion:reduce){.zwx-sheet-bd,.zwx-sheet{transition:none!important}}'
    ].join('');
    (document.head || document.documentElement).appendChild(st);
  // ═══ 鎏金夜祭 v2（2026/6/18）：主 CTA 採靜態鎏金底＋transform-only 獨立流光層，避免 Android/Samsung 對 background-position 動畫漏畫按鈕 ═══
  try{var _g2=document.createElement('style');_g2.setAttribute('data-jy-gilt2','ziwei');_g2.textContent='.zw-in-sec{background:linear-gradient(180deg,rgba(24,20,14,.78),rgba(14,12,9,.86));border:1px solid rgba(201,168,76,.2);border-radius:18px;box-shadow:0 18px 40px rgba(0,0,0,.45),inset 0 1px 0 rgba(245,231,184,.14);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px)}.zw-in-title{position:relative;padding-left:12px;letter-spacing:.08em;color:#e8d28a}.zw-in-title::before{content:"";position:absolute;left:0;top:50%;transform:translateY(-50%);width:3px;height:1.05em;border-radius:2px;background:rgba(156,130,222,.9);box-shadow:0 0 8px rgba(156,130,222,.9)}.zw-in-q,.zwx-field,.zw-in-sec input,.zw-in-sec select,.zw-in-sec textarea{background:rgba(8,7,5,.62);border:1px solid rgba(201,168,76,.26);border-radius:12px;color:#f2e9d6;transition:border-color .2s,box-shadow .2s}.zw-in-q:focus,.zwx-field:focus,.zw-in-sec input:focus,.zw-in-sec select:focus,.zw-in-sec textarea:focus{border-color:#e8d28a;box-shadow:0 0 0 3px rgba(201,168,76,.16);outline:none}.zw-in-pill,.zwx-sbtn,.zwx-cell{background:rgba(201,168,76,.06);border:1px solid rgba(201,168,76,.22);color:#d8c79a;border-radius:12px;transition:color .18s,background-color .18s,border-color .18s,box-shadow .18s,transform .18s}.zw-in-pill.active,.zw-in-pill.on,.zwx-sbtn.active,.zwx-cell.active,.zwx-cell.on{background:linear-gradient(135deg,#e8d28a,#c9a84c);color:#171208;border-color:transparent;box-shadow:0 6px 18px rgba(201,168,76,.28);font-weight:700}.zw-in-go{background:linear-gradient(135deg,#a98232 0%,#e8d28a 44%,#f5e7b8 58%,#c9a84c 100%);color:#171208;border:none;border-radius:14px;font-weight:800;letter-spacing:.14em;box-shadow:0 10px 26px rgba(201,168,76,.32),inset 0 1px 0 rgba(255,255,255,.35);position:relative;overflow:hidden;isolation:isolate}.zw-in-go::before{content:none;display:none}.zw-in-go:active{transform:translateY(1px)}.zw-in-back{color:rgba(232,210,138,.75)}.zw-in-back:hover{color:#f5e7b8}.zwx-sheet{background:rgba(16,13,10,.97);backdrop-filter:none;-webkit-backdrop-filter:none;border-top:1px solid rgba(201,168,76,.3);box-shadow:0 -18px 50px rgba(0,0,0,.6)}.zwx-grip{background:linear-gradient(90deg,#8a6d2f,#e8d28a,#8a6d2f);opacity:.85;border-radius:99px}.zw-ai{background:linear-gradient(180deg,rgba(24,20,14,.78),rgba(14,12,9,.86));border:1px solid rgba(201,168,76,.2);border-radius:18px;box-shadow:0 18px 40px rgba(0,0,0,.45),inset 0 1px 0 rgba(245,231,184,.14);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px)}.zwx-cal-d{border-radius:10px}.zwx-cal-d.active{background:linear-gradient(135deg,#e8d28a,#c9a84c);color:#171208;border-color:transparent;box-shadow:0 6px 18px rgba(201,168,76,.28);font-weight:700}.zw-board{border-color:rgba(201,168,76,.28)}@supports not (backdrop-filter:blur(1px)){[data-jy-view-ziwei]{}}.zw-in-go:focus-visible{outline:2px solid #e8d28a;outline-offset:2px}';document.head.appendChild(_g2);}catch(e){}
  }

  // ════════════════════════════════════════════════════════
  //  過場動畫
  // ════════════════════════════════════════════════════════
  // 12 宮繞方陣外圈的格位（row,col 於 4×4）+ 顯示用宮名（動畫順序，非命盤定位）
  var RING = [
    {r:1,c:1},{r:1,c:2},{r:1,c:3},{r:1,c:4},
    {r:2,c:4},{r:3,c:4},
    {r:4,c:4},{r:4,c:3},{r:4,c:2},{r:4,c:1},
    {r:3,c:1},{r:2,c:1}
  ];
  var RING_NAMES = ['命','財','官','遷','福','田','子','夫','兄','疾','友','父'];

  function showLoading(done) {
    zwEnsureCSS();
    var old = document.getElementById('zw-loading');
    if (old) old.remove();

    var ov = document.createElement('div');
    ov.className = 'zw-load';
    ov.id = 'zw-loading';

    var stars = '';
    for (var i = 0; i < 26; i++) {
      stars += '<i style="left:' + (Math.random()*100).toFixed(1) + '%;--d:' + (3.5+Math.random()*4).toFixed(1) + 's;--dl:' + (Math.random()*5).toFixed(1) + 's;' +
        (Math.random()>.7 ? 'width:3px;height:3px;' : '') + '"></i>';
    }

    var cells = '';
    for (var k = 0; k < 12; k++) {
      var p = RING[k];
      var isMing = (k === 0);
      cells += '<div class="zw-cell' + (isMing ? ' zw-ming' : '') + '" style="grid-row:' + p.r + ';grid-column:' + p.c + ';--cd:' + (0.5 + k*0.09).toFixed(2) + 's">' + RING_NAMES[k] + '</div>';
    }

    ov.innerHTML =
      '<div class="zw-load-stars">' + stars + '</div>' +
      '<div class="zw-board">' + cells +
        '<div class="zw-center">' +
          '<svg class="zw-svg" viewBox="0 0 100 100" preserveAspectRatio="none">' +
            '<line x1="50" y1="50" x2="50" y2="-46" style="animation-delay:1.5s"/>' +   // 對宮(遷移)
            '<line x1="50" y1="50" x2="-46" y2="96" style="animation-delay:1.7s"/>' +   // 三合(官祿)
            '<line x1="50" y1="50" x2="146" y2="96" style="animation-delay:1.9s"/>' +   // 三合(財帛)
          '</svg>' +
          '<div class="zw-ziwei" style="animation-delay:1.7s">✦</div>' +
          '<div class="zw-burst" id="zw-burst"></div>' +
        '</div>' +
      '</div>' +
      '<div class="zw-load-status" id="zw-load-status">定命宮・安身宮</div>' +
      '<div class="zw-load-sub" id="zw-load-sub">十二宮天成</div>';
    document.body.appendChild(ov);

    var steps = [
      ['定命宮・安身宮', '由生時逆推命宮'],
      ['起五行局', '納音定局數'],
      ['安紫微星系', '帝星領五曜入宮'],
      ['布天府星系', '府相同梁殺破狼歸位'],
      ['點生年四化', '祿權科忌定動線'],
      ['推大限流年', '體用相參定應期'],
      ['命盤天成', '三方四正照命']
    ];
    var TOTAL = 3400;
    var per = TOTAL / steps.length;
    steps.forEach(function (s, idx) {
      setTimeout(function () {
        var st = document.getElementById('zw-load-status');
        var sb = document.getElementById('zw-load-sub');
        if (st) { st.style.opacity = '0'; setTimeout(function(){ st.textContent = s[0]; st.style.opacity = '1'; }, 160); }
        if (sb) { sb.style.opacity = '0'; setTimeout(function(){ sb.textContent = s[1]; sb.style.opacity = '1'; }, 160); }
      }, idx * per);
    });

    setTimeout(function () { var b = document.getElementById('zw-burst'); if (b) b.classList.add('go'); }, 2700);

    setTimeout(function () {
      var o = document.getElementById('zw-loading');
      if (o) { o.style.transition = 'opacity .5s'; o.style.opacity = '0'; setTimeout(function(){ o.remove(); }, 500); }
      if (typeof done === 'function') done();
    }, TOTAL + 260);
  }

  // ════════════════════════════════════════════════════════
  //  小工具
  // ════════════════════════════════════════════════════════
  function brightOf(starName, branch) {
    try {
      if (typeof getStarBright === 'function') {
        var br = getStarBright(starName, DZ.indexOf(branch));
        if (br && br.label) return br.label;
      }
    } catch (e) {}
    return '';
  }
  function huaShort(h) { return h ? h.replace('化', '') : ''; }
  function esc(s){ return String(s == null ? '' : s).replace(/[&<>]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;'}[c]; }); }

  // 宮位星曜（依等級分類）
  function palaceStarParts(p) {
    var majors = [], aux = [], sha = [];
    (p.stars || []).forEach(function (s) {
      var tag = '';
      var br = brightOf(s.name, p.branch);
      if (br) tag = br; // 廟旺得利平陷
      var hua = s.hua ? '(' + huaShort(s.hua) + ')' : '';
      var _tg = tag === '不得' ? '不得地' : tag;  // v80.53 印全稱：slice(-1) 曾把「得地」截成「地」、「不得地」截成「得」（負級變正級）
      var label = s.name + (_tg ? '·' + _tg : '') + hua;
      if (s.type === 'major') majors.push(label);
      else if (s.type === 'sha') sha.push(s.name + hua);
      else aux.push(s.name + hua);
    });
    return { majors: majors, aux: aux, sha: sha };
  }

  // ════════════════════════════════════════════════════════
  //  命盤資料序列化（送進提示詞）
  // ════════════════════════════════════════════════════════
  function serializeChart(zw, form) {
    var L = [];
    var birth = (form && form.bdate) ? form.bdate : '';
    var btime = (form && form.btime) ? form.btime : (form && form.btimeUnknown ? '時辰未知(暫以午時)' : '');
    var gender = (form && form.gender === 'male') ? '男' : (form && form.gender === 'female') ? '女' : '';

    L.push('【基本資料】');
    L.push('出生(國曆；以時辰代表時排盤，未作出生地經度真太陽時校正)：' + birth + ' ' + btime + '　性別：' + gender);
    L.push('年干支：' + ((zw.yGan||'') + (zw.yZhi||'')) + '　五行局：' + ({2:'水二局',3:'木三局',4:'金四局',5:'土五局',6:'火六局'}[zw.wuxingJu]||zw.wuxingJu||'') + '　命主：' + (zw.mingZhu||'') + '　身主：' + (zw.shenZhu||'') + '　命宮天干：' + (zw.mingGan||''));

    // 命宮/身宮定位
    var palaces = zw.palaces || [];
    var ming = palaces[0];
    var shen = palaces.find(function(p){ return p.isShen; });
    if (ming) {
      var mp = palaceStarParts(ming);
      L.push('');
      L.push('【命宮】' + (ming.branch||'') + '宮　' + (mp.majors.length ? '主星：' + mp.majors.join('、') : '空宮(無主星，借對宮遷移星力)') +
        (mp.aux.length ? '　輔吉：' + mp.aux.join('、') : '') + (mp.sha.length ? '　煞：' + mp.sha.join('、') : ''));
    }
    if (shen) {
      L.push('【身宮】坐於「' + shen.name + '」(' + shen.branch + ')—一生後天用力與晚運落點在此。');
    }
    if (zw.laiYin) {
      L.push('【來因宮（欽天派輔助視角）】落「' + zw.laiYin.name + '」' + (zw.laiYin.name.slice(-1)==='宮'?'':'宮') + '(' + zw.laiYin.branch + '，宮干' + zw.laiYin.gan + ')—僅表示該流派所稱的生年四化發射源／課題視角，不是三合派共同定論，也不得單獨定事件。');
    }

    // v80.53 忌沖對宮標註：忌坐B宮同時沖B的對宮（坐宮受傷、對宮被沖）——AI 實測只讀坐宮，改資料直給
    var _OPP = {命宮:'遷移',遷移:'命宮',兄弟:'交友',交友:'兄弟',夫妻:'官祿',官祿:'夫妻',子女:'田宅',田宅:'子女',財帛:'福德',福德:'財帛',疾厄:'父母',父母:'疾厄'};
    function _oppPal(p){ p = String(p||'').replace(/宮$/,''); if (p === '命') p = '命宮'; return _OPP[p] || ''; }
    function _jiChong(p){ var o = _oppPal(p); return o ? '（沖' + o + '）' : ''; }

    // 生年四化
    if (zw.sihua && zw.sihua.length) {
      L.push('');
      L.push('【生年四化】(先天動線，最關鍵)');
      zw.sihua.forEach(function(h){ var _hs = huaShort(h.hua); L.push('・' + h.star + '化' + _hs + '　入「' + h.palace + '」宮' + (_hs === '忌' ? _jiChong(h.palace) : '')); });
    }
    // 自化（離心↓＝本宮宮干自化飛出；向心↑＝對宮飛入本宮）
    try {
      if (zw.selfHua) {
        var sh = [], _seen = {};
        if (Array.isArray(zw.selfHua)) {
          zw.selfHua.forEach(function(x){
            if (!x || !x.star) return;
            var pname = x.palace || '';
            if (pname && pname.charAt(pname.length-1) !== '宮') pname = pname + '宮';   // 修「命宮宮」重複
            var ht = huaShort(x.type || x.hua || x.label || '');                         // 引擎欄位是 .type
            var dir = x.direction === '↑' ? '向心↑（對宮飛入）' : (x.direction === '↓' ? '離心↓（飛出）' : '');
            var line = pname + x.star + '自化' + ht + (dir ? '，' + dir : '');
            var key = pname + '|' + x.star + '|' + ht + '|' + (x.direction || '');         // 去重
            if (_seen[key]) return; _seen[key] = 1;
            sh.push(line);
          });
        } else if (typeof zw.selfHua === 'object') {
          Object.keys(zw.selfHua).forEach(function(kk){ var v = zw.selfHua[kk]; if (v) sh.push(kk + '：' + (typeof v==='string'?v:JSON.stringify(v))); });
        }
        if (sh.length) { L.push(''); L.push('【自化（飛星派輔助視角）】(僅作功能外放／回收／反覆或不易固著的候選訊號；不得直接推成人品或既定事件)'); sh.forEach(function(s){ L.push('・' + s); }); }
      }
    } catch (e) {}

    // 飛宮四化（宮與宮的因果鏈）
    try {
      if (zw.feiGongHua && zw.feiGongHua.length) {
        L.push('');
        L.push('【飛宮四化（飛星／欽天派輔助視角）】(宮干四化的投射路徑；須與三方四正主線交叉驗證，不得與生年四化重複計票)');
        zw.feiGongHua.forEach(function (r) {
          function seg(o) { return (o && o.star) ? (o.star + '→' + o.to + (o.self ? '(自化)' : '')) : '—'; }
          L.push('・' + (r.palace.slice(-1) === '宮' ? r.palace : r.palace + '宮') + '(干' + r.gan + ')　祿:' + seg(r.lu) + '｜權:' + seg(r.quan) + '｜科:' + seg(r.ke) + '｜忌:' + seg(r.ji));
        });
        L.push('(輔助讀法：A宮「忌」入B宮，可列為A領域的執著／阻滯／代價投向B領域的候選機制；「祿」入可列為資源投向。標(自化)只表示該流派的外放／回收訊號。以上均須看星曜強弱、三方與運限，不可直接當因果事實。)');
      }
    } catch (e) {}

    // 十二宮全盤
    L.push('');
    L.push('【十二宮全盤】(每宮：地支｜主星含廟旺｜輔吉｜煞｜十二長生)');
    palaces.forEach(function(p, _pi){
      var pp = palaceStarParts(p);
      var _pn = (p.name && p.name.charAt(p.name.length-1)==='宮') ? p.name : (p.name + '宮'); // 修「命宮宮」重複
      // v80.56：空宮借星資料層直給——實測 AI 把財帛(酉)空宮借成「夫妻武曲破軍」（正統借星安宮＝借「對宮」，
      // 酉對卯應借福德紫貪）；借宮運算留給模型＝幻覺面，改預先算好注入
      var _emptyTxt = '空宮';
      if (!pp.majors.length) {
        var _op = palaces[(_pi + 6) % 12];
        var _ops = _op ? palaceStarParts(_op) : null;
        if (_ops && _ops.majors.length) {
          var _opn = (_op.name && _op.name.charAt(_op.name.length-1)==='宮') ? _op.name : (_op.name + '宮');
          _emptyTxt = '空宮〔借對宮' + _opn + '(' + _op.branch + ')：' + _ops.majors.join('、') + '〕';
        }
      }
      var seg = _pn + '(' + p.branch + ')：' +
        (pp.majors.length ? pp.majors.join('、') : _emptyTxt) +
        (pp.aux.length ? '｜吉:' + pp.aux.join('、') : '') +
        (pp.sha.length ? '｜煞:' + pp.sha.join('、') : '') +
        (p.changsheng ? '｜長生:' + p.changsheng : '');
      L.push('・' + seg);
    });

    // 格局
    if (zw.patterns && zw.patterns.length) {
      L.push('');
      L.push('【命盤格局候選】(引擎標記只供結構檢查；須再審主星強弱、三方吉煞、四化與破格，不可直接定命格高低)');
      zw.patterns.forEach(function(g){ L.push('・' + g.name + (g.level?'〔'+g.level+'〕':'') + '：' + (g.desc||'')); });
    }
    // 星系註記
    try {
      if (zw.starComboNotes && zw.starComboNotes.length) {
        L.push('');
        L.push('【星系組合候選】(只列同宮結構名稱，固定事件描述不作證據；請重新依本宮、三方、廟旺與運限裁決)');
        zw.starComboNotes.slice(0, 12).forEach(function(n){
          var raw = (typeof n === 'string' ? n : (n && n.text) || '');
          var nameOnly = raw.split('：')[0] || raw;
          if (nameOnly) L.push('・' + nameOnly);
        });
      }
    } catch (e) {}

    // 大限
    if (zw.daXian && zw.daXian.length) {
      var nowY = new Date().getFullYear();
      var age = null;
      // v80.48 治本：紫微大限以「虛歲」計（與引擎 isCurrent 同基準），不可用實歲，否則虛歲/實歲兩套
      //   基準各標一限造成「兩個◀現在」。虛歲 = 今年 - 出生年 + 1。
      try { var by = parseInt((form.bdate||'').slice(0,4)); if (by) age = nowY - by + 1; } catch(e){}
      var _hasCur = zw.daXian.some(function(d){ return d.isCurrent; }); // 引擎已標當前大限就以它為唯一準
      L.push('');
      L.push('【大限走勢】(本命為長期底色，大限為十年作用場域；〔吉凶〕與主題是引擎相對標記，不能直接代替具體星曜與四化分析；現行大限以 ◀現在 標示)');
      zw.daXian.forEach(function(dx){
        // 只標一個：優先信引擎 isCurrent；引擎全沒標時才用虛歲回推（同一基準，不混實歲、不 OR 兩套）
        var _isNow = _hasCur ? !!dx.isCurrent : (age != null && age >= dx.ageStart && age <= dx.ageEnd);
        var cur = _isNow ? ' ◀現在' : '';
        var huaTxt = (dx.hua && dx.hua.length) ? '　限內四化:' + dx.hua.map(function(h){var _hs=huaShort(h.hua);return h.star+'化'+_hs+'入'+h.palace+(_hs==='忌'?_jiChong(h.palace):'');}).join('、') : '';
        L.push('・' + dx.ageStart + '–' + dx.ageEnd + '歲　走「' + (dx.palaceName||dx.palace||'') + '」宮(' + (dx.branch||'') + ')' +
          (dx.level?'〔'+dx.level+'〕':'') + (dx.theme?'　主題:'+dx.theme:'') + huaTxt + cur);
      });
    }

    // 流年（今年＋未來3年，供「明年運勢」「未來三年哪一年」類問題比較）
    try {
      if (typeof zw.getLiuNianZw === 'function') {
        var ly0 = new Date().getFullYear();
        L.push('');
        L.push('【流年走勢 ' + ly0 + '–' + (ly0+3) + '】(每年只提供年度觸發：流年命宮落點與流年四化；沒有流月資料，不得細化月份或把年度引動寫成事件保證)');
        for (var yy = ly0; yy <= ly0 + 3; yy++) {
          var lnf = zw.getLiuNianZw(yy);
          if (!lnf) continue;
          var tag = (yy === ly0) ? '（今年）' : (yy === ly0 + 1) ? '（明年）' : '';
          L.push('・' + yy + tag + '　' + (lnf.gz || '') + '　命宮落「' + (lnf.mingPalace || '') + '」' +
            (lnf.focus ? '·' + lnf.focus : '') +
            ((lnf.hua && lnf.hua.length) ? '　四化:' + lnf.hua.map(function(h){var _hs=huaShort(h.hua);return h.star+'化'+_hs+'入'+h.palace+(_hs==='忌'?_jiChong(h.palace):'');}).join('、') : ''));
          if (yy === ly0 && lnf.notes && lnf.notes.length) lnf.notes.slice(0,3).forEach(function(n){ L.push('    - ' + n); });
        }
      }
    } catch (e) {}

    return L.join('\n');
  }

  // ════════════════════════════════════════════════════════
  //  深度提示詞（比文墨天機更深）
  // ════════════════════════════════════════════════════════
  // v80.60：紫微提示詞改由 ziwei-prompt-root.js 提供單一共用證據核心。
  // 不再在本檔維護題型補丁，避免三合、飛星、欽天與品牌規則各自漂移。
  function _zwPromptRootApi() {
    try {
      if (typeof window !== 'undefined' && window.JY_ZIWEI_PROMPT_ROOT) return window.JY_ZIWEI_PROMPT_ROOT;
      if (typeof globalThis !== 'undefined' && globalThis.JY_ZIWEI_PROMPT_ROOT) return globalThis.JY_ZIWEI_PROMPT_ROOT;
    } catch (e) {}
    return null;
  }

  var ZW_HEAD_FALLBACK =
    '你是資深紫微斗數證據整合者。第一句直接回答完整原問句，只依本次命盤資料，以題目主宮三方四正、主星組合、資料所列廟旺、生年四化、本命／大限／流年為主判；宮干飛化、自化與來因宮只作已標明流派的輔助驗證，不得混票。空宮借對宮只作定調，不等同原坐；單星、單煞、單一化忌或格局標籤不得直接定事件。盤面不能證明他人內心、疾病、犯罪、報酬或精確人物資料；沒有流月資料不得編月份。命理是傳統詮釋，不是科學預測。正文完成後才可自然推薦恰好一種礦物作穿搭與行動提醒，不得宣稱改運或療效。';

  var ZW_TAIL_FALLBACK =
    '請用繁體中文自然分段作答，不逐宮報盤、不列表格、不用粗體小標。每個主要結論附盤面依據、現實驗證點與停止／調整條件；主判與流派輔助有衝突時分開說明。最後只推薦一種礦物，明說沒有科學證據可保證改運、招財、桃花、護身或治療，並自然提到靜月之光蝦皮有相關選品。最後兩行固定為：\n[靜月之光蝦皮賣場](https://shopee.tw/a50h95648d?tab=shop)\n願你諸事順遂。';

  function _zwHeadText() {
    var api = _zwPromptRootApi();
    return (api && typeof api.composeHead === 'function') ? api.composeHead() : ZW_HEAD_FALLBACK;
  }

  function _zwTailText() {
    var api = _zwPromptRootApi();
    return (api && typeof api.composeTail === 'function') ? api.composeTail() : ZW_TAIL_FALLBACK;
  }

  function buildPrompt(zw, form) {
    var q = (form && form.question) ? form.question.trim() : '';
    var parts = [];
    parts.push(_zwHeadText());
    parts.push('\n────────────────────────────');
    parts.push('提問者的問題：' + (q || '(未填寫，請以命盤為主，分析命格、事業、財運、感情婚姻、健康風險與近年大限流年走勢)'));
    parts.push('────────────────────────────\n');
    parts.push(serializeChart(zw, form));
    parts.push('\n────────────────────────────\n');
    parts.push(_zwTailText());
    return parts.join('\n');
  }

  // ════════════════════════════════════════════════════════
  //  結果頁
  // ════════════════════════════════════════════════════════
  // 地支固定盤位置（4×4）
  var DZ_CELL = {
    '巳':{r:1,c:1},'午':{r:1,c:2},'未':{r:1,c:3},'申':{r:1,c:4},
    '酉':{r:2,c:4},'戌':{r:3,c:4},'亥':{r:4,c:4},'子':{r:4,c:3},
    '丑':{r:4,c:2},'寅':{r:4,c:1},'卯':{r:3,c:1},'辰':{r:2,c:1}
  };

  function renderChartGrid(zw) {
    var palaces = zw.palaces || [];
    var html = '<div class="zw-chart">';
    palaces.forEach(function(p){
      var cell = DZ_CELL[p.branch];
      if (!cell) return;
      var pp = palaceStarParts(p);
      var starHtml = '';
      (p.stars || []).forEach(function(s){
        if (s.type !== 'major') return;
        var br = brightOf(s.name, p.branch);
        var hua = s.hua ? '<span class="hua' + (s.hua==='化忌'?' ji':'') + '">' + huaShort(s.hua) + '</span>' : '';
        starHtml += '<span>' + esc(s.name) + (br?'<span style="opacity:.5;font-size:.5rem">' + (br==='不得'?'不得':br.slice(-1)) + '</span>':'') + hua + '</span>';
      });
      // 輔吉/煞（精簡，最多各3）
      var auxArr = (p.stars||[]).filter(function(s){ return s.type!=='major' && s.type!=='sha'; }).slice(0,3);
      var shaArr = (p.stars||[]).filter(function(s){ return s.type==='sha'; }).slice(0,3);
      auxArr.forEach(function(s){ starHtml += '<span class="aux">' + esc(s.name) + (s.hua?'<span class="hua' + (s.hua==='化忌'?' ji':'') + '">'+huaShort(s.hua)+'</span>':'') + '</span>'; });
      shaArr.forEach(function(s){ starHtml += '<span class="sha">' + esc(s.name) + '</span>'; });
      if (!starHtml) starHtml = '<span style="opacity:.4">空宮</span>';

      var badge = p.isMing ? '<span class="badge">命</span>' : (p.isShen ? '<span class="badge">身</span>' : '');
      html += '<div class="zw-pg' + (p.isMing?' ming':'') + '" style="grid-row:' + cell.r + ';grid-column:' + cell.c + '">' +
        '<div class="zw-pg-stars">' + starHtml + '</div>' +
        '<div class="zw-pg-foot"><span class="zw-pg-name">' + esc(p.name) + badge + '</span><span class="zw-pg-dz">' + esc(p.branch) + '</span></div>' +
        '</div>';
    });
    // 中宮
    var sihuaTxt = (zw.sihua||[]).map(function(h){ return h.star + huaShort(h.hua); }).join(' ');
    html += '<div class="zw-pg-center">' +
      '<b>' + esc((zw.yGan||'')+(zw.yZhi||'')) + '</b>' +
      '<span>' + esc(zw.wuxingJu||'') + '</span>' +
      '<span>命主 ' + esc(zw.mingZhu||'-') + '・身主 ' + esc(zw.shenZhu||'-') + '</span>' +
      (sihuaTxt ? '<span style="color:rgba(212,175,55,.7)">四化 ' + esc(sihuaTxt) + '</span>' : '') +
      '</div>';
    html += '</div>';
    return html;
  }

  // ════════════════════════════════════════════════════════
  //  自包覆輸入頁（比照雷諾曼，自成一頁、不借用 step-0、不需姓名）
  // ════════════════════════════════════════════════════════
  // 時辰 → 代表時（供 computeZiwei 由 solarHH 反推時辰）
  var SHICHEN = [
    {n:'子時 23–01', h:0},{n:'丑時 01–03', h:2},{n:'寅時 03–05', h:4},{n:'卯時 05–07', h:6},
    {n:'辰時 07–09', h:8},{n:'巳時 09–11', h:10},{n:'午時 11–13', h:12},{n:'未時 13–15', h:14},
    {n:'申時 15–17', h:16},{n:'酉時 17–19', h:18},{n:'戌時 19–21', h:20},{n:'亥時 21–23', h:22}
  ];

  function showInput() {
    zwEnsureCSS();
    var old = document.getElementById('zw-input'); if (old) old.remove();
    var oldR = document.getElementById('zw-result'); if (oldR) oldR.remove();
    _zwGender = ''; _zwSelDate = ''; _zwSelHH = '';
    var w = document.createElement('div');
    w.className = 'zw-in';
    w.id = 'zw-input';
    var hhOpts = '<option value="">選擇時辰</option>';
    for (var i=0;i<SHICHEN.length;i++) hhOpts += '<option value="'+SHICHEN[i].h+'">'+SHICHEN[i].n+'</option>';
    hhOpts += '<option value="unknown">不確定（暫以午時推算）</option>';
    w.innerHTML =
      '<div class="zw-in-wrap">' +
        '<a class="zw-in-back" onclick="_zwClose()">← 返回靜月之光</a>' +
        '<div class="zw-in-head"><h1>紫 微 斗 數</h1><p>三方四正 ・ 四化飛星 ・ 大限流年</p></div>' +
        '<div class="zw-in-sec"><div class="zw-in-title">✦ 你想問什麼？</div>' +
          '<textarea class="zw-in-q" id="zw-q" rows="2" maxlength="200" placeholder="問越具體越準——例如：今年適合換工作嗎？（留空＝整體命盤綜論）"></textarea></div>' +
        '<div class="zw-in-sec"><div class="zw-in-title">✦ 出生資料（國曆，不需姓名）</div>' +
          '<div class="zw-in-field"><label class="zw-in-label">國曆出生日期</label><button type="button" class="zwx-field" id="zwx-fld-date" onclick="_zwxOpenDate()">' + _zwDateInner() + '</button></div>' +
          '<div class="zw-in-field"><label class="zw-in-label">出生時辰</label><button type="button" class="zwx-field" id="zwx-fld-hh" onclick="_zwxOpenHH()">' + _zwHHInner() + '</button></div>' +
          '<input type="hidden" id="zw-bd" value="' + _zwSelDate + '">' +
          '<input type="hidden" id="zw-hh" value="' + _zwSelHH + '">' +
          '<div class="zw-in-field"><label class="zw-in-label">性別</label><div class="zw-in-pills">' +
            '<div class="zw-in-pill" id="zw-g-m" onclick="_zwSetGender(\'male\')">男</div>' +
            '<div class="zw-in-pill" id="zw-g-f" onclick="_zwSetGender(\'female\')">女</div>' +
          '</div></div>' +
          '<div class="zwx-err" id="zwx-err"></div>' +
          '<div class="zw-in-hint">紫微以時辰定盤，故只需到「時辰」即可；時辰不確定可選最後一項，命盤仍可成。</div>' +
        '</div>' +
        '<button class="zw-in-go" onclick="_ziweiSubmit()">✦ 起 盤 ✦</button>' +
        '<div class="zw-in-foot">靜月之光 ・ jingyue.uk<br>紫微斗數 ・ 命盤僅供參考</div>' +
      '</div>';
    document.body.appendChild(w);
    try { document.body.style.overflow = 'hidden'; } catch(e){} // 鎖背景捲動，避免抖動
    // 趁使用者填表時背景預載排盤引擎（idle 載入器可能還沒載到），按「起盤」時就緒
    try {
      if (typeof computeZiwei !== 'function' && typeof window._jyLazyScript === 'function') {
        window._jyLazyScript('JS/ziwei.js?v=20260609v80_50', null);
      }
    } catch(e){}
    w.scrollTop = 0;
  }

  function showResult(zw, form) {
    zwEnsureCSS();
    _zwLastChart = zw; _zwLastForm = form;
    _lastPrompt = buildPrompt(zw, form);

    var old = document.getElementById('zw-result');
    if (old) old.remove();
    var w = document.createElement('div');
    w.className = 'zw-res';
    w.id = 'zw-result';

    // facts
    var nowY = new Date().getFullYear();
    var curDx = null;
    try {
      curDx = (zw.daXian||[]).find(function(d){ return d.isCurrent; });
      if (!curDx) {
        var by = parseInt((form.bdate||'').slice(0,4)); var age = by ? nowY - by + 1 : null; // 虛歲（與引擎 isCurrent 同基準）
        if (age != null) curDx = (zw.daXian||[]).find(function(d){ return age>=d.ageStart && age<=d.ageEnd; });
      }
    } catch(e){}
    var ln = null;
    try { if (typeof zw.getLiuNianZw === 'function') ln = zw.getLiuNianZw(nowY); } catch(e){}

    var facts =
      fact('命主・身主', (zw.mingZhu||'-') + '　／　' + (zw.shenZhu||'-')) +
      fact('五行局', zw.wuxingJu || '-') +
      fact('生年四化', (zw.sihua||[]).map(function(h){return h.star+huaShort(h.hua);}).join('  ') || '-') +
      fact('現行大限', curDx ? (curDx.ageStart+'–'+curDx.ageEnd+'歲 走'+(curDx.palaceName||curDx.palace||'')+'宮') : '-') +
      fact('今年流年 '+nowY, ln ? ((ln.gz||'')+' 命宮落'+(ln.mingPalace||'')) : '-') +
      fact('命宮', (zw.palaces && zw.palaces[0]) ? ((zw.palaces[0].branch||'')+'宮 '+(palaceStarParts(zw.palaces[0]).majors.join('、')||'空宮')) : '-');

    // chips（格局）
    var chips = '';
    (zw.patterns||[]).slice(0,8).forEach(function(g){
      var warn = /凶|忌|煞|破|沖/.test((g.level||'')+(g.name||''));
      chips += '<span class="zw-chip' + (warn?' warn':'') + '">' + esc(g.name) + (g.level?'·'+g.level:'') + '</span>';
    });
    if (!chips) chips = '<span class="zw-chip" style="opacity:.6">無明顯特殊格局</span>';

    var aiSc = '';
    AI_LIST.forEach(function(ai){
      aiSc += '<button class="zw-ai-sc" onclick="_zwOpenAI(\'' + ai.id + '\',\'' + ai.url + '\',this)">' +
        '<img src="ai-icons/ai-' + ai.id + '.png" alt="' + ai.name + '" onerror="this.style.display=\'none\'"><span>' + ai.name + '</span></button>';
    });

    w.innerHTML =
      '<div class="zw-res-inner">' +
        '<div class="zw-res-head">' +
          '<div class="zw-res-title">🪐 紫微斗數命盤</div>' +
          '<button class="zw-res-x" onclick="_zwClose()" aria-label="關閉">×</button>' +
        '</div>' +
        '<div class="zw-meta">三合派四化骨架 ・ 已校正真太陽時 ・ 不需姓名</div>' +
        renderChartGrid(zw) +
        '<div class="zw-facts">' + facts + '</div>' +
        '<div class="zw-chips">' + chips + '</div>' +
        '<div class="zw-ai">' +
          '<div class="zw-ai-title">🌙 AI 深度解讀</div>' +
          '<div class="zw-ai-desc">已為你寫好一份比一般斗數軟體更深的解讀提示詞（含三方四正、四化飛星、大限流年）。輕觸複製，貼到任何 AI 對話送出即可。</div>' +
          '<button class="zw-ai-copy" onclick="_zwCopy()">✦ 一鍵複製紫微解讀提示詞 ✦</button>' +
          '<div class="zw-ai-grid">' + aiSc + '</div>' +
          '<div class="zw-ai-foot">點 AI 圖示 → 自動複製＋開啟 → 貼上送出</div>' +
        '</div>' +
        '<div class="zw-actions">' +
          '<button class="zw-btn" onclick="_ziweiShare()" style="background:linear-gradient(135deg,rgba(201,168,76,.18),rgba(201,168,76,.05));border-color:rgba(201,168,76,.5);color:#c9a84c">📤 生成分享卡</button>' +
          '<button class="zw-btn" onclick="_zwReset()">↺ 重新輸入生辰</button>' +
          '<button class="zw-btn" onclick="_zwClose()">⌂ 回首頁</button>' +
        '</div>' +
        '<div class="zw-res-foot">靜月之光 ・ jingyue.uk<br>紫微斗數 ・ 命盤僅供參考，不構成醫療、法律或財務建議</div>' +
      '</div>';
    document.body.appendChild(w);
    w.scrollTop = 0;
  }

  // fact helper（module scope，供 showResult 透過閉包使用）
  function fact(k, v) {
    return '<div class="zw-fact"><div class="k">' + esc(k) + '</div><div class="v">' + esc(v) + '</div></div>';
  }

  // ════════════════════════════════════════════════════════
  //  Orchestrator
  // ════════════════════════════════════════════════════════
  window._ziweiSubmit = function () {
    _zwxClearErr();
    var qEl = document.getElementById('zw-q');
    var question = qEl && qEl.value ? qEl.value.trim() : '';

    if (!_zwGender) { _zwxErr('請選擇性別'); return; }

    var bdEl = document.getElementById('zw-bd');
    var bd = bdEl && bdEl.value ? bdEl.value : '';
    var md = /^(\d{4})-(\d{2})-(\d{2})$/.exec(bd);
    if (!md) { _zwxErr('請選擇國曆出生日期'); return; }
    var y = +md[1], mo = +md[2], d = +md[3];

    var hhEl = document.getElementById('zw-hh');
    var hhVal = hhEl ? hhEl.value : '';
    var btimeUnknown = (hhVal === 'unknown' || hhVal === '');
    var hh = btimeUnknown ? 12 : parseInt(hhVal, 10);

    if (typeof computeZiwei !== 'function') { _zwxErr('排盤引擎仍在背景載入，請過幾秒再按一次「起盤」'); return; }

    var bdate = y + '-' + (mo < 10 ? '0' : '') + mo + '-' + (d < 10 ? '0' : '') + d;
    var btime = btimeUnknown ? '' : ((hh < 10 ? '0' : '') + hh + ':00');
    var form = { type:'general', question: question, gender: _zwGender, bdate: bdate, btime: btime, name:'', btimeUnknown: btimeUnknown };
    try { if (typeof S !== 'undefined') { S.form = form; S._tarotOnlyMode = false; S._autoMode = false; } } catch (e) {}

    // 廟旺全表校正：引擎內建 ZW_BRIGHTNESS 是「簡化」表，168 格中 129 格與正統不符。
    // 此處以開源 iztro（紫微研习社，與文墨天機／紫微全書一致）的權威亮度表整張覆蓋。
    // 索引子起：0子1丑2寅3卯4辰5巳6午7未8申9酉10戌11亥。對任何命盤生效，不動 2.7萬行大檔。
    try {
      if (typeof ZW_BRIGHTNESS !== 'undefined' && ZW_BRIGHTNESS) {
        var _BR = {
          '紫微':['平','廟','旺','旺','得地','旺','廟','廟','旺','旺','得地','旺'],
          '天機':['廟','陷','得地','旺','利','平','廟','陷','得地','旺','利','平'],
          '太陽':['陷','不得','旺','廟','旺','旺','旺','得地','得地','陷','不得','陷'],
          '武曲':['旺','廟','得地','利','廟','平','旺','廟','得地','利','廟','平'],
          '天同':['旺','不得','利','平','平','廟','陷','不得','旺','平','平','廟'],
          '廉貞':['平','利','廟','平','利','陷','平','利','廟','平','利','陷'],
          '天府':['廟','廟','廟','得地','廟','得地','旺','廟','得地','旺','廟','得地'],
          '太陰':['廟','廟','旺','陷','陷','陷','不得','不得','利','不得','旺','廟'],
          '貪狼':['旺','廟','平','利','廟','陷','旺','廟','平','利','廟','陷'],
          '巨門':['旺','不得','廟','廟','陷','旺','旺','不得','廟','廟','陷','旺'],
          '天相':['廟','廟','廟','陷','得地','得地','廟','得地','廟','陷','得地','得地'],
          '天梁':['廟','旺','廟','廟','廟','陷','廟','旺','陷','得地','廟','陷'],
          '七殺':['旺','廟','廟','旺','廟','平','旺','廟','廟','廟','廟','平'],
          '破軍':['廟','旺','得地','陷','旺','平','廟','旺','得地','陷','旺','平']
        };
        for (var _s in _BR) { ZW_BRIGHTNESS[_s] = _BR[_s]; }
      }
    } catch (e) {}
    // 紫微以時辰定盤：直接以時辰代表時排盤（無出生地經度校正，符合斗數慣例）
    // 保險：approxLunar 用 Lunar.Solar，而 lunar.js 把它掛在 window.Solar，故補上橋接。
    try { if (window.Solar && (!window.Lunar || !window.Lunar.Solar)) { if (!window.Lunar) window.Lunar = {}; window.Lunar.Solar = window.Solar; } } catch(e){}
    var zw = null;
    try {
      zw = computeZiwei(y, mo, d, hh, _zwGender);
      if (typeof S !== 'undefined') S.ziwei = zw;
    } catch (e) {
      console.error('[Ziwei] computeZiwei 失敗:', e);
      _zwxErr('排盤失敗：' + (e && e.message ? e.message : '請確認農曆轉換庫已載入後再試'));
      return;
    }
    if (!zw || !zw.palaces) {
      var _er = (typeof window !== 'undefined' && window._jyZiweiError) ? window._jyZiweiError : '';
      _zwxErr('排盤資料不完整，請重試' + (_er ? '（原因：' + _er + '）' : ''));
      return;
    }

    var inp = document.getElementById('zw-input'); if (inp) inp.style.display = 'none';
    showLoading(function () { showResult(zw, form); });
  };

  // ════════════════════════════════════════════════════════
  //  複製 / 開啟 AI / 重設 / 關閉
  // ════════════════════════════════════════════════════════
  window._ziweiShare = function () {
    if (!window.JYShareCard) { _zwxErr('分享元件載入中，請稍候再試一次'); return; }
    var zw = _zwLastChart || {}, form = _zwLastForm || {};
    var palaces = zw.palaces || [];
    function byBranch(br) { for (var i = 0; i < palaces.length; i++) { if (palaces[i].branch === br) return palaces[i]; } return { branch: br, name: '', stars: [] }; }
    function majors(p) { try { return palaceStarParts(p).majors.slice(0, 2).join(''); } catch (e) { return ''; } }
    var order = ['巳', '午', '未', '申', '辰', '酉', '卯', '戌', '寅', '丑', '子', '亥'];
    var cardP = order.map(function (br) {
      var p = byBranch(br), nm = p.name || '';
      if (nm && nm.charAt(nm.length - 1) !== '宮') nm += '宮';
      return { branch: br, name: nm, star: majors(p) };
    });
    var ming = palaces[0] || {};
    var juName = ({ 2: '水二局', 3: '木三局', 4: '金四局', 5: '土五局', 6: '火六局' })[zw.wuxingJu] || (zw.wuxingJu || '');
    var shen = null;
    for (var i = 0; i < palaces.length; i++) { if (palaces[i].isShen) { shen = palaces[i]; break; } }
    JYShareCard.open('ziwei', {
      question: form.question || '',
      palaces: cardP,
      ming: '命宮 ・ ' + (majors(ming) || '空宮'),
      info: juName + (shen ? ' ・ 身宮在' + (shen.name || '') : '')
    });
  };

  window._zwCopy = function () {
    if (!_lastPrompt) return;
    function ok(){
      var b = document.querySelector('.zw-ai-copy');
      if (b) { var o = b.innerHTML; b.innerHTML = '✓ 已複製！貼到 AI 送出即可'; b.style.borderColor = 'rgba(52,211,153,.6)'; setTimeout(function(){ b.innerHTML = o; b.style.borderColor = ''; }, 2500); }
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(_lastPrompt).then(ok, function(){ _fallbackCopy(_lastPrompt); ok(); });
    } else { _fallbackCopy(_lastPrompt); ok(); }
  };
  window._zwOpenAI = function (id, url, btn) {
    if (!_lastPrompt) { window.open(url, '_blank'); return; }
    function go(){ var s = btn && btn.querySelector('span'); var nm = s ? s.textContent : ''; if (s) s.textContent = '已複製！'; setTimeout(function(){ window.open(url, '_blank'); }, 280); setTimeout(function(){ if (s) s.textContent = nm; }, 2200); }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(_lastPrompt).then(go, function(){ _fallbackCopy(_lastPrompt); go(); });
    } else { _fallbackCopy(_lastPrompt); go(); }
  };
  function _fallbackCopy(text) {
    try { var ta = document.createElement('textarea'); ta.value = text; ta.style.cssText = 'position:fixed;left:-9999px'; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta); } catch (e) {}
  }
  window._zwSetGender = function (g) {
    _zwGender = g;
    var m = document.getElementById('zw-g-m'), f = document.getElementById('zw-g-f');
    if (m) m.classList.toggle('active', g === 'male');
    if (f) f.classList.toggle('active', g === 'female');
  };
  window._zwReset = function () {
    var r = document.getElementById('zw-result'); if (r) r.remove();
    showInput();
  };
  window._zwClose = function () {
    var r = document.getElementById('zw-result'); if (r) r.remove();
    var inp = document.getElementById('zw-input'); if (inp) inp.remove();
    try { document.body.style.overflow = ''; } catch(e){}
    try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch(e){ window.scrollTo(0,0); }
  };

  // 對外入口（首頁點「紫微斗數」→ ui.js _ziweiOpen 轉呼叫此函式，開啟自包覆乾淨頁）
  window._ziweiStandaloneOpen = showInput;

  // 對外（除錯/重用）
  window._ziweiBuildPrompt = buildPrompt;
  window._ziweiShowResult = showResult;
  window._ziweiShowLoading = showLoading;


  // ════════════════════════════════════════════════════════
  //  v80.30 自訂選擇器（日期 + 時辰）— 取代手機原生 UI
  //  寫回隱藏 zw-bd / zw-hh，_ziweiSubmit 完全沿用、引擎不動。
  //  紫微以時辰定盤：日期 1900–2100、時辰 12 格＋不確定，無出生地。
  // ════════════════════════════════════════════════════════
  var ZWK = ['日','一','二','三','四','五','六'];
  function _zwPad(n){ return (n<10?'0':'')+n; }
  function _zwDim(y,m){ return new Date(y, m, 0).getDate(); }
  function _zwFdow(y,m){ return new Date(y, m-1, 1).getDay(); }

  // ── 欄位顯示 ──
  function _zwDateInner(){
    if(!_zwSelDate) return '<span class="ph">請選擇出生日期</span><span class="chev">▾</span>';
    var p=_zwSelDate.split('-'), y=+p[0], m=+p[1], d=+p[2];
    var wk=ZWK[new Date(y,m-1,d).getDay()];
    return '<span class="val">'+y+' 年 '+m+' 月 '+d+' 日（週'+wk+'）</span><span class="chev">▾</span>';
  }
  function _zwHHInner(){
    if(_zwSelHH===''||_zwSelHH==null) return '<span class="ph">請選擇出生時辰</span><span class="chev">▾</span>';
    if(_zwSelHH==='unknown') return '<span class="val">不確定（午時推算）</span><span class="chev">▾</span>';
    var hh=parseInt(_zwSelHH,10), nm='';
    for(var i=0;i<SHICHEN.length;i++){ if(SHICHEN[i].h===hh){ nm=SHICHEN[i].n; break; } }
    return '<span class="val">'+(nm||(_zwPad(hh)+':00'))+'</span><span class="chev">▾</span>';
  }
  function _zwxSyncFields(){
    var a=document.getElementById('zwx-fld-date'); if(a) a.innerHTML=_zwDateInner();
    var b=document.getElementById('zwx-fld-hh'); if(b) b.innerHTML=_zwHHInner();
    var hb=document.getElementById('zw-bd'); if(hb) hb.value=_zwSelDate;
    var hh=document.getElementById('zw-hh'); if(hh) hh.value=_zwSelHH;
  }

  // ── 內嵌錯誤 ──
  function _zwxErr(msg){ var e=document.getElementById('zwx-err'); if(e){ e.textContent='⚠ '+msg; e.classList.add('show'); try{e.scrollIntoView({behavior:'smooth',block:'center'});}catch(x){} } else { try{alert(msg);}catch(z){} } }
  function _zwxClearErr(){ var e=document.getElementById('zwx-err'); if(e) e.classList.remove('show'); }

  // ── 底部 sheet ──
  var _zwxSheetType='', _zwxPrevBodyOverflow='', _zwxViewportOff=null, _zwxPaintTimers=[];
  function _zwxViewportHeight(){ var vv=window.visualViewport; return Math.max(320,Math.round((vv&&vv.height)||window.innerHeight||document.documentElement.clientHeight||640)); }
  function _zwxForcePaint(){
    var bd=document.getElementById('zwx-sheet-bd'); if(!bd) return;
    bd.style.setProperty('--jy-picker-vh',_zwxViewportHeight()+'px');
    var cal=bd.querySelector('.zwx-cal-table'); if(!cal) return;
    var rows=cal.querySelectorAll('.zwx-cal-row'), cells=cal.querySelectorAll('.zwx-cal-d');
    if(rows.length!==6||cells.length!==42){ if(_zwxSheetType==='date') _zwDpDay(); return; }
    cal.style.display='none'; void cal.offsetHeight; cal.style.display='block'; void cal.offsetHeight;
  }
  function _zwxBindViewport(bd){
    if(_zwxViewportOff){ try{_zwxViewportOff();}catch(e){} _zwxViewportOff=null; }
    function sync(){ if(bd&&bd.isConnected){ bd.style.setProperty('--jy-picker-vh',_zwxViewportHeight()+'px'); _zwxForcePaint(); } }
    var vv=window.visualViewport;
    window.addEventListener('resize',sync,{passive:true}); window.addEventListener('orientationchange',sync,{passive:true});
    if(vv){ vv.addEventListener('resize',sync,{passive:true}); vv.addEventListener('scroll',sync,{passive:true}); }
    _zwxViewportOff=function(){ window.removeEventListener('resize',sync); window.removeEventListener('orientationchange',sync); if(vv){vv.removeEventListener('resize',sync);vv.removeEventListener('scroll',sync);} };
    sync();
  }
  function _zwxSchedulePaint(){
    while(_zwxPaintTimers.length) clearTimeout(_zwxPaintTimers.pop());
    [0,60,220].forEach(function(ms){ _zwxPaintTimers.push(setTimeout(_zwxForcePaint,ms)); });
    try{ if(document.fonts&&document.fonts.ready) document.fonts.ready.then(_zwxForcePaint); }catch(e){}
  }
  function _zwxOpenSheet(title, sub, body, foot){
    _zwxCloseSheet(true);
    var bd=document.createElement('div'); bd.id='zwx-sheet-bd'; bd.className='zwx-sheet-bd show'; bd.setAttribute('role','presentation');
    bd.onclick=function(e){ if(e.target===bd) _zwxCloseSheet(); };
    bd.onkeydown=function(e){ if(e.key==='Escape') _zwxCloseSheet(); };
    bd.innerHTML='<div class="zwx-sheet" role="dialog" aria-modal="true" aria-label="'+title+'"><div class="zwx-grip"></div>'+
      '<div class="zwx-stitle">'+title+'</div>'+
      '<div class="zwx-ssub" id="zwx-ssub">'+(sub||'')+'</div>'+
      '<div id="zwx-sbody">'+body+'</div>'+
      (foot?'<div class="zwx-sfoot"><button class="zwx-sbtn" onclick="_zwxCancel()">取消</button><button class="zwx-sbtn go" onclick="_zwxConfirm()">確定</button></div>':'')+
      '</div>';
    _zwxPrevBodyOverflow=document.body.style.overflow; document.body.style.overflow='hidden';
    bd.style.setProperty('--jy-picker-vh',_zwxViewportHeight()+'px');
    document.body.appendChild(bd);
    _zwxBindViewport(bd); _zwxSchedulePaint();
  }
  function _zwxCloseSheet(immediate){
    var bd=document.getElementById('zwx-sheet-bd'); if(!bd) return;
    while(_zwxPaintTimers.length) clearTimeout(_zwxPaintTimers.pop());
    if(_zwxViewportOff){ try{_zwxViewportOff();}catch(e){} _zwxViewportOff=null; }
    if(bd.parentNode) bd.parentNode.removeChild(bd);
    document.body.style.overflow=_zwxPrevBodyOverflow;
  }
  function _zwxSub(t){ var s=document.getElementById('zwx-ssub'); if(s) s.innerHTML=t; }
  function _zwxBody(h){ var b=document.getElementById('zwx-sbody'); if(b){ b.innerHTML=h; b.scrollTop=0; _zwxSchedulePaint(); } }
  window._zwxCancel=function(){ _zwxCloseSheet(); };
  window._zwxConfirm=function(){
    if(_zwxSheetType==='date'){ _zwSelDate=_zwDpY+'-'+_zwPad(_zwDpM)+'-'+_zwPad(_zwDpD); }
    _zwxClearErr(); _zwxSyncFields(); _zwxCloseSheet();
  };

  // ── 日期選擇器（1900–2100）──
  var _zwDpY=1990,_zwDpM=1,_zwDpD=1,_zwDpDec=1984;
  window._zwxOpenDate=function(){
    _zwxSheetType='date';
    if(_zwSelDate){ var p=_zwSelDate.split('-'); _zwDpY=+p[0]; _zwDpM=+p[1]; _zwDpD=+p[2]; }
    else { _zwDpY=1990; _zwDpM=1; _zwDpD=1; }
    _zwxOpenSheet('出生日期','國曆，點上方年月可快速跳轉', '', true);
    _zwDpDay();
  };
  function _zwDpClamp(){ var dim=_zwDim(_zwDpY,_zwDpM); if(_zwDpD>dim) _zwDpD=dim; if(_zwDpD<1) _zwDpD=1; }
  function _zwDpDay(){
    _zwDpClamp();
    var h='<div class="zwx-cal-nav"><button type="button" onclick="_zwxDpNav(-1)">‹</button>'+ 
      '<div class="zwx-cal-ttl" onclick="_zwxDpMode(\'year\')">'+_zwDpY+' 年 '+_zwDpM+' 月 ▾</div>'+ 
      '<button type="button" onclick="_zwxDpNav(1)">›</button></div><div class="zwx-cal-table" role="grid"><div class="zwx-cal-head" role="row">';
    for(var w=0;w<7;w++) h+='<div class="zwx-cal-wk" role="columnheader">'+ZWK[w]+'</div>';
    h+='</div>';
    var fd=_zwFdow(_zwDpY,_zwDpM), dim=_zwDim(_zwDpY,_zwDpM), cells=[], i, day;
    for(i=0;i<42;i++){
      day=i-fd+1;
      if(day<1||day>dim) cells.push('<span class="zwx-cal-d empty" aria-hidden="true"></span>');
      else cells.push('<button type="button" class="zwx-cal-d'+(day===_zwDpD?' sel':'')+'" onclick="_zwxDpDay('+day+')">'+day+'</button>');
    }
    for(var r=0;r<6;r++) h+='<div class="zwx-cal-row" role="row">'+cells.slice(r*7,r*7+7).join('')+'</div>';
    h+='</div>'; _zwxBody(h); _zwxSub('點日期，或點上方年月快速跳轉');
  }
  function _zwDpYear(){
    var h='<div class="zwx-yhead"><button onclick="_zwxDpDec(-1)">‹</button><span>'+_zwDpDec+' – '+(_zwDpDec+11)+'</span><button onclick="_zwxDpDec(1)">›</button></div><div class="zwx-pg y">';
    for(var y=_zwDpDec;y<_zwDpDec+12;y++){ var dis=(y<1900||y>2100);
      h+='<div class="zwx-cell'+(y===_zwDpY?' sel':'')+'"'+(dis?' style="opacity:.3;pointer-events:none"':' onclick="_zwxDpYear('+y+')"')+'>'+y+'</div>'; }
    h+='</div>'; _zwxBody(h); _zwxSub('選擇年份');
  }
  function _zwDpMonth(){
    var h='<div class="zwx-pg mo">';
    for(var m=1;m<=12;m++) h+='<div class="zwx-cell'+(m===_zwDpM?' sel':'')+'" onclick="_zwxDpMonth('+m+')">'+m+' 月</div>';
    h+='</div>'; _zwxBody(h); _zwxSub('選擇月份（'+_zwDpY+' 年）');
  }
  window._zwxDpMode=function(mode){ if(mode==='year'){ _zwDpDec=Math.floor(_zwDpY/12)*12; if(_zwDpDec<1896)_zwDpDec=1896; _zwDpYear(); } else if(mode==='month'){ _zwDpMonth(); } else { _zwDpDay(); } };
  window._zwxDpNav=function(d){ _zwDpM+=d; if(_zwDpM>12){_zwDpM=1;_zwDpY++;} if(_zwDpM<1){_zwDpM=12;_zwDpY--;} if(_zwDpY<1900)_zwDpY=1900; if(_zwDpY>2100)_zwDpY=2100; _zwDpClamp(); _zwDpDay(); };
  window._zwxDpDec=function(d){ _zwDpDec+=d*12; if(_zwDpDec<1896)_zwDpDec=1896; if(_zwDpDec>2088)_zwDpDec=2088; _zwDpYear(); };
  window._zwxDpDay=function(d){ _zwDpD=d; _zwDpDay(); };
  window._zwxDpYear=function(y){ _zwDpY=y; _zwDpClamp(); _zwDpMonth(); };
  window._zwxDpMonth=function(m){ _zwDpM=m; _zwDpClamp(); _zwDpDay(); };

  // ── 時辰選擇器（單點即選；12 時辰＋不確定）──
  window._zwxOpenHH=function(){
    _zwxSheetType='hh';
    var h='<div class="zwx-sc-grid">';
    for(var i=0;i<SHICHEN.length;i++){
      var parts=SHICHEN[i].n.split(' ');
      h+='<div class="zwx-sc'+((''+SHICHEN[i].h)===(''+_zwSelHH)?' sel':'')+'" onclick="_zwxPickHH('+SHICHEN[i].h+')"><b>'+parts[0]+'</b><i>'+(parts[1]||'')+'</i></div>';
    }
    h+='<div class="zwx-sc wide'+(_zwSelHH==='unknown'?' sel':'')+'" onclick="_zwxPickHHU()"><b>不確定</b><i>暫以午時推算</i></div>';
    h+='</div>';
    _zwxOpenSheet('出生時辰','紫微以時辰定盤，不需到分', h, false);
  };
  window._zwxPickHH=function(h){ _zwSelHH=''+h; _zwxClearErr(); _zwxSyncFields(); _zwxCloseSheet(); };
  window._zwxPickHHU=function(){ _zwSelHH='unknown'; _zwxClearErr(); _zwxSyncFields(); _zwxCloseSheet(); };


})();
