// ═══════════════════════════════════════════════════════════════
// guide.js v20260330 — 使用教學 overlay + 提問品質 modal
// JS_backup/ → obfuscate → JS/
// 載入順序：ui.js 之後
// ═══════════════════════════════════════════════════════════════
(function(){
'use strict';

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
function buildGuide(){
var h='';
h+='<div class="jy-gov" id="jy-gov"><button class="jy-g-close" id="jy-gc" onclick="window._closeGuide()">&times;</button><div class="jy-g-inner">';
h+='<div class="jy-g-hdr"><div class="mn">\uD83C\uDF19</div><h1>\u975C\u6708\u4E4B\u5149\u30FB\u64CD\u4F5C\u6559\u5B78</h1><p>\u8DDF\u8457\u6B65\u9A5F\u8D70\uFF0C\u4E00\u5206\u9418\u5B78\u6703\u4F7F\u7528</p></div>';

// Step 1: 首頁
h+='<div class="jy-ss" data-s>';
h+='<div class="jy-sh"><div class="jy-sn">1</div><div class="jy-si"><h3>進入首頁，點「開始解讀」</h3><p>或直接點快捷問題按鈕</p></div></div>';
h+='<div class="jy-pw"><div class="jy-ph"><div class="jy-pn"></div><div class="jy-scr">';
h+='<div class="mn-nav"><div class="b">\uD83C\uDF19 靜月之光</div><div class="s">\uD83D\uDED2 蝦皮</div></div>';
h+='<div class="mn-hero"><div class="mi">\uD83C\uDF19</div><h2>靜月之光</h2><div class="sub">你心裡的事，牌都知道</div><div class="sub" style="margin-top:2px">七套命理系統 × AI 深度交叉解讀</div>';
h+='<div class="mn-cta">開始解讀　→</div>';
h+='<div style="font-size:.44rem;color:rgba(228,228,231,.35);margin-top:5px">不用想，點了就問 ↓</div>';
h+='<div class="mn-qq"><div class="mn-qb">💕 他怎麼看我</div><div class="mn-qb">💼 工作該留嗎</div><div class="mn-qb">🌸 感情有機會嗎</div><div class="mn-qb">⚖️ 決定對嗎</div></div>';
h+='</div></div></div>';
h+='<div class="jy-arr" style="left:50%;bottom:120px;transform:translateX(-50%)"></div>';
h+='<div class="jy-fgr" style="left:48%;bottom:105px">👆</div>';
h+='</div>';
h+='<div class="jy-tip"><div class="ic">⚠️</div><div class="tx">點金色按鈕或直接點快捷問題<small>快捷問題會自動填入問題內容</small></div></div>';
h+='</div>';

// Step 2: 輸入問題+選工具
h+='<div class="jy-ss" data-s>';
h+='<div class="jy-sh"><div class="jy-sn">2</div><div class="jy-si"><h3>輸入問題，選填照片，選工具</h3><p>問題越具體越準，可上傳照片讓分析更深</p></div></div>';
h+='<div class="jy-pw"><div class="jy-ph"><div class="jy-pn"></div><div class="jy-scr">';
h+='<div class="mn-nav"><div class="b">\uD83C\uDF19 靜月之光</div><div class="s">\uD83D\uDED2 蝦皮</div></div>';
h+='<div class="mn-cd"><div class="mn-ct">❓ 你想問什麼？</div><div class="mn-inp" style="border-color:rgba(201,168,76,.18)">他為什麼最近不主動找我了？</div></div>';
h+='<div class="mn-cd" style="border-color:rgba(201,168,76,.15)"><div class="mn-ct">\uD83D\uDCF7 上傳照片（選填）・讓分析更深入</div>';
h+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:3px;margin-top:3px">';
h+='<div style="border:1px dashed rgba(201,168,76,.25);border-radius:6px;padding:5px;text-align:center"><div style="font-size:.7rem">\uD83E\uDDD1</div><div style="font-size:.44rem;color:#c9a84c">臉部照片</div><div style="font-size:.36rem;color:rgba(228,228,231,.35)">正面自拍・光線足</div></div>';
h+='<div style="border:1px dashed rgba(201,168,76,.25);border-radius:6px;padding:5px;text-align:center"><div style="font-size:.7rem">\u270B</div><div style="font-size:.44rem;color:#c9a84c">左手掌</div><div style="font-size:.36rem;color:rgba(228,228,231,.35)">手心朝上・張開</div></div>';
h+='<div style="border:1px dashed rgba(201,168,76,.25);border-radius:6px;padding:5px;text-align:center"><div style="font-size:.7rem">\u270B</div><div style="font-size:.44rem;color:#c9a84c">右手掌</div><div style="font-size:.36rem;color:rgba(228,228,231,.35)">手心朝上・張開</div></div>';
h+='<div style="border:1px dashed rgba(201,168,76,.25);border-radius:6px;padding:5px;text-align:center"><div style="font-size:.7rem">\uD83D\uDC8E</div><div style="font-size:.44rem;color:#c9a84c">水晶照片</div><div style="font-size:.36rem;color:rgba(228,228,231,.35)">拍你配戴的</div></div>';
h+='</div>';
h+='<div style="font-size:.36rem;color:rgba(228,228,231,.35);margin-top:3px;text-align:center">照片僅用於本次分析，不會儲存</div>';
h+='</div>';
h+='<div style="padding:2px 8px"><div style="font-size:.48rem;color:#c9a84c;margin-bottom:2px">\uD83D\uDD2E 選擇分析方式</div></div>';
h+='<div class="mn-tl hi"><div class="ico">⭐</div><div><div class="nm">塔羅快讀</div><div class="ds">一個問題，抽牌就有答案<br>不需任何資料・只要問題和選牌</div><div class="bg">免費體驗 1 次</div></div></div>';
h+='<div class="mn-tl"><div class="ico">🔑</div><div><div class="nm">開鑰之法</div><div class="ds">78 張牌五層深潛，問到根源<br>需出生資料・金色黎明最高階</div><div class="bg">免費體驗 1 次</div></div></div>';
h+='<div class="mn-tl"><div class="ico">🌙</div><div><div class="nm">七維度交叉分析</div><div class="ds">七套命理系統交叉比對<br>需出生資料・八字 紫微 梅花 塔羅 星盤 吠陀 姓名</div><div class="bg">免費體驗 1 次</div></div></div>';
h+='</div></div>';
h+='<div class="jy-arr" style="left:28%;top:300px"></div>';
h+='<div class="jy-fgr" style="left:24%;top:317px">👆</div>';
h+='</div>';
h+='<div class="jy-tip"><div class="ic">💡</div><div class="tx">照片是加分，不是必填<small>塔羅快讀完全不用填資料<br>上傳照片讓分析多一層參考，會員專屬</small></div></div>';
h+='</div>';

// Step 3: 填寫資料
h+='<div class="jy-ss" data-s>';
h+='<div class="jy-sh"><div class="jy-sn">3</div><div class="jy-si"><h3>填寫出生資料</h3><p>塔羅不需任何資料，七維／開鑰需要生辰</p></div></div>';
h+='<div class="jy-pw"><div class="jy-ph"><div class="jy-pn"></div><div class="jy-scr">';
h+='<div class="mn-nav"><div class="b">\uD83C\uDF19 靜月之光</div><div class="s">\uD83D\uDED2 蝦皮</div></div>';
h+='<div class="mn-cd"><div class="mn-ct">👤 出生資料</div>';
h+='<div class="mn-lb">性別 <span style="color:#ef5350">*</span></div>';
h+='<div class="mn-pls"><div class="mn-pl">♂ 男</div><div class="mn-pl sl">♀ 女</div><div class="mn-pl">不透露</div></div>';
h+='<div class="mn-lb">出生日期（國曆）<span style="color:#ef5350">*</span></div>';
h+='<div class="mn-rw"><div class="mn-inp">1995</div><div class="mn-inp">6 月</div><div class="mn-inp">15 日</div></div>';
h+='<div class="mn-lb">出生時間 <span style="font-size:.38rem;color:rgba(228,228,231,.35)">選填，強烈建議</span></div>';
h+='<div class="mn-rw"><div class="mn-inp">14 時</div><div class="mn-inp">30 分</div></div>';
h+='<div style="font-size:.4rem;color:rgba(228,228,231,.35);margin-top:2px">☐ 我不知道確切出生時間</div>';
h+='<div class="mn-wr">⚠ 沒填時間＝八字少一柱、紫微命宮可能排錯，準確度大幅下降。</div>';
h+='<div class="mn-lb">出生地點</div>';
h+='<div class="mn-rw"><div class="mn-inp">🇹🇼 台灣</div><div class="mn-inp">台北</div></div>';
h+='<div class="mn-lb">姓名 <span style="font-size:.38rem;color:rgba(228,228,231,.35)">用於姓名學分析</span></div>';
h+='<div class="mn-inp">（選填）</div>';
h+='</div></div></div></div>';
h+='<div class="jy-tip"><div class="ic">💡</div><div class="tx">塔羅快讀跳過這步，直接選牌<small>只有七維深度和開鑰之法需要填寫出生資料<br>不確定出生時間就勾「不知道」，也能算</small></div></div>';
h+='</div>';

// Step 4: 塔羅 Five-Card / 開鑰代表牌
h+='<div class="jy-ss" data-s>';
h+='<div class="jy-sh"><div class="jy-sn">4</div><div class="jy-si"><h3>選牌 / 按分析按鈕</h3><p>塔羅抽5張；開鑰選代表牌+洗牌分堆</p></div></div>';
h+='<div class="jy-pw"><div class="jy-ph"><div class="jy-pn"></div><div class="jy-scr">';
h+='<div class="mn-nav"><div class="b">\uD83C\uDF19 靜月之光</div><div class="s">\uD83D\uDED2 蝦皮</div></div>';
// 4a: 塔羅快讀 Five-Card Spread
h+='<div class="mn-sp"><div style="font-size:.58rem;color:#c9a84c;margin-bottom:2px">\u2605 Five-Card Spread（五牌陣）</div>';
h+='<div style="font-size:.38rem;color:rgba(228,228,231,.4);margin-bottom:2px">看現況＋原因＋阻礙＋建議＋結果</div>';
h+='<div style="font-size:.4rem;color:#c9a84c;margin-bottom:3px">觸碰任一張你有感覺的牌，選出 5 張</div>';
h+='<div style="font-size:.4rem;color:rgba(228,228,231,.5);margin-bottom:3px">已選 <span style="color:#c9a84c;font-weight:700">0</span> / 5 張</div>';
h+='<div style="display:flex;gap:3px;justify-content:center;margin:3px 0"><div class="mn-tc" style="width:20px;height:32px;border:1px dashed rgba(201,168,76,.22)"></div><div class="mn-tc" style="width:20px;height:32px;border:1px dashed rgba(201,168,76,.22)"></div><div class="mn-tc" style="width:20px;height:32px;border:1px dashed rgba(201,168,76,.22)"></div></div>';
h+='<div style="display:flex;gap:3px;justify-content:center"><div class="mn-tc" style="width:20px;height:32px;border:1px dashed rgba(201,168,76,.22)"></div><div class="mn-tc" style="width:20px;height:32px;border:1px dashed rgba(201,168,76,.22)"></div></div>';
h+='<div style="margin-top:4px;padding:3px 0;background:linear-gradient(180deg,transparent,rgba(60,40,100,.1));border-top:1px solid rgba(201,168,76,.08)">';
h+='<div style="display:flex;gap:1px;justify-content:center;overflow:hidden">';
h+='<div class="mn-tc pk" style="width:18px;height:28px"></div><div class="mn-tc pk" style="width:18px;height:28px"></div><div class="mn-tc pk" style="width:18px;height:28px"></div><div class="mn-tc pk" style="width:18px;height:28px"></div><div class="mn-tc pk" style="width:18px;height:28px"></div><div class="mn-tc pk" style="width:18px;height:28px"></div>';
h+='</div></div>';
h+='<div style="font-size:.36rem;color:rgba(228,228,231,.35);margin-top:2px">\u2190 左右滑動瀏覽牌面 \u2192</div>';
h+='</div>';
// 分隔線
h+='<div style="border-top:1px solid rgba(201,168,76,.1);margin:5px 8px"></div>';
// 4b: 開鑰 - 代表牌
h+='<div class="mn-sp"><div style="font-size:.55rem;color:#c9a84c;margin-bottom:2px">\u2726 開鑰之法 \u2726</div>';
h+='<div style="font-size:.38rem;color:rgba(228,228,231,.4);margin-bottom:3px">先選代表牌，再洗牌分四元素堆</div>';
h+='<div style="background:rgba(201,168,76,.04);border:1px solid rgba(201,168,76,.15);border-radius:6px;padding:4px;margin:2px 6px;display:flex;align-items:center;gap:5px;justify-content:center">';
h+='<div style="width:24px;height:36px;background:linear-gradient(135deg,rgba(201,168,76,.3),rgba(201,168,76,.1));border:1px solid rgba(201,168,76,.4);border-radius:2px"></div>';
h+='<div style="text-align:left"><div style="font-size:.42rem;color:#c9a84c;font-weight:700">金幣國王</div><div style="font-size:.32rem;color:rgba(228,228,231,.4)">根據星座推薦</div></div>';
h+='</div>';
h+='</div>';
h+='</div></div>';
h+='<div class="jy-fgr" style="left:45%;top:155px">\uD83D\uDC46</div>';
h+='</div>';
h+='<div class="jy-tip"><div class="ic">\uD83D\uDCA1</div><div class="tx">塔羅快讀抽 5 張；開鑰先選代表牌<small>塔羅五個位置：現況・原因・阻礙・建議・結果<br>開鑰根據星座推薦代表牌，或從 16 張宮廷牌自選</small></div></div>';
h+='</div>';

// Step 5: 等待
h+='<div class="jy-ss" data-s>';
h+='<div class="jy-sh"><div class="jy-sn">5</div><div class="jy-si"><h3>靜月為你解讀中⋯</h3><p>等待 10-30 秒，結果會自動出現</p></div></div>';
h+='<div class="jy-pw"><div class="jy-ph"><div class="jy-pn"></div><div class="jy-scr">';
h+='<div class="mn-nav"><div class="b">\uD83C\uDF19 靜月之光</div><div class="s">\uD83D\uDED2 蝦皮</div></div>';
h+='<div class="mn-ld"><div class="av">🌙</div><div class="t">靜月正在感應你的牌面⋯</div><div class="s">解讀每張牌的位置意義⋯</div></div>';
h+='<div class="mn-cd" style="margin-top:3px"><div style="font-size:.44rem;color:#c9a84c">你的牌面</div><div style="font-size:.4rem;color:rgba(228,228,231,.35);margin-top:1px">你問的是：「今年桃花運勢？」</div></div>';
h+='</div></div></div>';
h+='<div class="jy-tip"><div class="ic">⏳</div><div class="tx">耐心等候，靜月正在交叉比對<small>七維度分析約 20-30 秒<br>塔羅快讀約 10-15 秒</small></div></div>';
h+='</div>';

// Step 6: 結果
h+='<div class="jy-ss" data-s>';
h+='<div class="jy-sh"><div class="jy-sn">6</div><div class="jy-si"><h3>查看靜月的解讀結果</h3><p>摘要 → 完整解讀 → 牌面細節</p></div></div>';
h+='<div class="jy-pw"><div class="jy-ph"><div class="jy-pn"></div><div class="jy-scr">';
h+='<div class="mn-nav"><div class="b">\uD83C\uDF19 靜月之光</div><div class="s">\uD83D\uDED2 蝦皮</div></div>';
h+='<div class="mn-res" style="padding:6px 8px">';
h+='<div class="sum"><p>今年桃花有窗口，但不是現在。<br>三到五月之間主動出擊，時機最好。</p></div>';
h+='<div class="ch"><div class="av2"></div><div class="bb"><p>你的盤面先天感情緣分不差，但現在有個矛盾：你想要穩定，但對方還在觀望⋯⋯</p></div></div>';
h+='<div class="ch"><div class="av2"></div><div class="bb"><p>梅花的變卦顯示需主動出擊。結合八字流年，<span class="gd">三到五月</span>是你的行動窗口⋯⋯</p></div></div>';
h+='<div class="mn-cd" style="margin:3px 0"><div style="font-size:.44rem;color:rgba(228,228,231,.4)">📊 五層因果分析 <span style="float:right;color:#c9a84c;font-size:.4rem">點擊展開</span></div></div>';
h+='<div class="mn-cd" style="margin:3px 0"><div style="font-size:.44rem;color:rgba(228,228,231,.4)">💬 靜月完整解讀 <span style="float:right;color:rgba(228,228,231,.3);font-size:.4rem">627字</span></div></div>';
h+='</div></div></div></div>';
h+='<div class="jy-tip"><div class="ic">📖</div><div class="tx">點「展開」看完整分析<small>上方金色框是摘要結論<br>下方對話框是逐段詳細解讀</small></div></div>';
h+='</div>';

// Step 7: 追問
h+='<div class="jy-ss" data-s>';
h+='<div class="jy-sh"><div class="jy-sn">7</div><div class="jy-si"><h3>還想問更深？追問靜月</h3><p>輸入追問，補抽牌再問一次</p></div></div>';
h+='<div class="jy-pw"><div class="jy-ph"><div class="jy-pn"></div><div class="jy-scr">';
h+='<div class="mn-nav"><div class="b">\uD83C\uDF19 靜月之光</div><div class="s">\uD83D\uDED2 蝦皮</div></div>';
h+='<div class="mn-cr"><div class="ct">💎 靜月為你挑的石頭</div><div style="font-size:.4rem;color:rgba(228,228,231,.35)">根據牌面能量方向，這顆石頭可能適合你</div></div>';
h+='<div class="mn-fu"><div class="ft">🔑 還想問更深？補抽牌追問</div><div class="fd">追問問題，依問題類型自動決定補幾張牌，結合原本分析一起回答。</div>';
h+='<div class="mn-inp" style="border-color:rgba(201,168,76,.12);margin-bottom:3px">他到底是怎麼想的？</div>';
h+='<div class="fb">🔑 抽補充牌</div><div style="clear:both"></div></div>';
h+='<div style="text-align:center;padding:6px"><div style="font-size:.44rem;color:rgba(228,228,231,.4)">這次的分析對你有幫助嗎？</div>';
h+='<div style="display:flex;gap:6px;justify-content:center;margin-top:3px"><div style="padding:4px 14px;border:1px solid rgba(255,255,255,.05);border-radius:6px;font-size:.7rem">👍</div><div style="padding:4px 14px;border:1px solid rgba(255,255,255,.05);border-radius:6px;font-size:.7rem">👎</div></div></div>';
h+='</div></div>';
h+='<div class="jy-arr" style="right:34%;top:215px"></div>';
h+='<div class="jy-fgr" style="right:28%;top:232px">👆</div>';
h+='</div>';
// v52：動態讀 _JY_PRICING（ai-analysis.js 先載入，此處已可用；fallback 保底）
var _gP = (typeof window !== 'undefined' && window._JY_PRICING) || { SUB_STANDARD: 999, SUB_PREMIUM: 1999 };
h+='<div class="jy-tip"><div class="ic">⚠️</div><div class="tx">輸入追問，點「抽補充牌」<small>靜月會結合原本分析 + 新的補充牌一起回答<br>三套工具各免費體驗 1 次（含追問）<br>標準會員 NT$' + _gP.SUB_STANDARD + '/月 塔羅＋開鑰每日各 1 次、七維度每月 2 次<br>高級會員 NT$' + (_gP.SUB_PREMIUM||1999).toLocaleString() + '/月 塔羅＋開鑰每日各 2 次、七維度每月 5 次＋深度解析每月 1 次免費</small></div></div>';
h+='</div>';

// Step 8: 靜月靈籤（獨立功能）
h+='<div class="jy-ss" data-s>';
h+='<div class="jy-sh"><div class="jy-sn">8</div><div class="jy-si"><h3>另外，還有「靜月靈籤」</h3><p>傳統擲筊求籤・完全免費・不限次數</p></div></div>';
h+='<div class="jy-pw"><div class="jy-ph"><div class="jy-pn"></div><div class="jy-scr">';
h+='<div class="mn-nav"><div class="b">\uD83C\uDF19 靜月靈籤</div><div class="s">\uD83D\uDED2 蝦皮</div></div>';
h+='<div style="text-align:center;padding:10px 8px;background:radial-gradient(ellipse at 50% 40%,rgba(180,120,50,.12),transparent 70%)">';
h+='<div style="font-size:1.5rem;margin-bottom:3px">\uD83D\uDD4A\uFE0F</div>';
h+='<div style="font-size:.78rem;color:#c9a84c;font-weight:700;letter-spacing:.08em;margin-bottom:3px">靜月靈籤</div>';
h+='<div style="font-size:.5rem;color:rgba(228,228,231,.5)">六十甲子靈籤・神明指引</div>';
h+='</div>';
h+='<div style="padding:6px 10px">';
h+='<div style="font-size:.5rem;color:#c9a84c;margin-bottom:3px;font-weight:600">\uD83D\uDCDC 求籤五步驟</div>';
h+='<div style="font-size:.44rem;color:rgba(228,228,231,.55);line-height:1.55">';
h+='<div style="margin-bottom:2px">① 心中默唸本人姓名、住址及所求事項</div>';
h+='<div style="margin-bottom:2px">② 擲筊請示神明是否在位</div>';
h+='<div style="margin-bottom:2px">③ 聖筊=允許賜籤 → 搖籤筒抽籤</div>';
h+='<div style="margin-bottom:2px">④ 求得籤詩（第 X 籤）</div>';
h+='<div>⑤ 連擲 3 次聖筊，方能正式解籤</div>';
h+='</div>';
h+='</div>';
h+='<div style="margin:5px 10px;padding:6px;background:rgba(239,154,60,.06);border:1px solid rgba(239,154,60,.15);border-radius:6px">';
h+='<div style="font-size:.4rem;color:#ef9a3c;line-height:1.45">※ 一支籤僅求一件事項<br>※ 笑筊=神明笑而不答，請重新抽籤</div>';
h+='</div>';
h+='</div></div>';
h+='</div>';
h+='<div class="jy-tip"><div class="ic">\uD83C\uDF19</div><div class="tx">靈籤入口在首頁<small>不用填資料、不用選工具<br>就是傳統廟宇求籤的數位版<br>完全免費・不限次數</small></div></div>';
h+='</div>';

h+='<div class="jy-div"></div>';
h+='<div class="jy-cta"><div style="font-size:.8rem;color:#c9a84c;margin-bottom:.6rem">準備好了嗎？</div><button class="cb" onclick="window._closeGuide()">開始占卜 ✨</button><div style="font-size:.55rem;color:rgba(228,228,231,.35);margin-top:.6rem">左下角 ? 按鈕可以隨時重看教學</div></div>';
h+='</div></div>';
return h;
}

// ═══ Show / Close ═══
function showGuide(){
  var el=document.getElementById('jy-gov');
  if(!el){
    var d=document.createElement('div');
    d.innerHTML=buildGuide();
    document.body.appendChild(d.firstChild);
    el=document.getElementById('jy-gov');
    // Scroll reveal inside overlay
    var secs=el.querySelectorAll('[data-s]');
    var obs=new IntersectionObserver(function(entries){entries.forEach(function(e){if(e.isIntersecting)e.target.classList.add('vis')})},{root:el,threshold:0.12});
    secs.forEach(function(s){obs.observe(s)});
  }
  document.body.style.overflow='hidden';
  requestAnimationFrame(function(){requestAnimationFrame(function(){el.classList.add('v')})});
}
function closeGuide(){
  var el=document.getElementById('jy-gov');
  if(el){el.classList.remove('v');document.body.style.overflow='';setTimeout(function(){if(el.parentNode)el.parentNode.removeChild(el)},400)}
}
window._showGuide=showGuide;
window._closeGuide=closeGuide;

// First visit
if(!localStorage.getItem('_jy_guide_seen')){
  setTimeout(function(){showGuide();localStorage.setItem('_jy_guide_seen','1')},600);
}

// Help button
var hb=document.createElement('button');
hb.className='jy-hb';hb.textContent='?';hb.title='使用說明';hb.onclick=showGuide;
document.body.appendChild(hb);

// ═══ Question Quality Modal ═══
var _qR=null;
function showQH(msg){
  return new Promise(function(resolve){
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
  if(_qR){_qR(go);_qR=null}
};

// ═══ Wrap submits ═══
function wrap(fn){
  var t=setInterval(function(){
    if(typeof window[fn]!=='function')return;clearInterval(t);
    var orig=window[fn];
    window[fn]=async function(){
      var qEl=document.getElementById('f-question');
      var q=(qEl&&qEl.value)?qEl.value.trim():'';
      if(!q&&typeof window.selectedPresetQ==='string')q=window.selectedPresetQ.trim();
      if(!q){orig.apply(this,arguments);return}
      if(typeof _checkQuestionQuality==='function'&&!sessionStorage.getItem('_jy_q_hint_shown')){
        var hint=_checkQuestionQuality(q);
        if(hint){sessionStorage.setItem('_jy_q_hint_shown','1');var go=await showQH(hint);if(!go){if(qEl){qEl.focus();qEl.select()}return}}
      }
      sessionStorage.setItem('_jy_q_hint_shown','1');
      orig.apply(this,arguments);
    };
  },200);
}
wrap('submitWithTool');
wrap('submitTarotQuick');

})();
