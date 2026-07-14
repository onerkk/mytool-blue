// ═══════════════════════════════════════
// 靜月之光 — 雷諾曼牌 Lenormand v4.1（保守正統＋固定品牌收尾）
// v4.1(2026/7/14)：根治免費占卜的蝦皮導流被提示詞自行禁止。
//   ①占卜正文與品牌附加層明確分離：前者只依牌面回答，後者固定營運收尾，不冒充雷諾曼原典。
//   ②移除「禁止商品／賣場連結」衝突句；改為每次解讀完成後無條件輸出品牌附加層。
//   ③牌名白名單、只答問句、牌面不足等限制只約束占卜正文，不得拿來刪除礦物名、品牌句與蝦皮連結。
//   ④固定 Markdown 連結置於倒數第二行，最後一行固定祝福；在提示詞末端再次複述，降低模型漏輸出。
//   ⑤配石只作象徵性品牌建議，不宣稱治療或保證招財、桃花、改運；礦物知識限核准錨點。
// v4.0(2026/7/14)：讀法與選陣架構重整。
//   ①歷史層與現代實務分離：可考原始說明只支持 36 張 4×8+4、由問卜者人物牌附近起讀；
//     三張、五張、九宮格與比較陣明標為現代實務，不再冒稱單一古法。
//   ②自動選陣只看問題形狀與所需解析度，不再因「感情／工作／財運」領域直接升九宮格；
//     A/B 題改用雙路比較，短是非題一律三張，因果／方法／何時用五張，單一領域全貌用九張，
//     多領域／人生或年度全景才用大牌陣。移除字數與問號數量觸發大牌陣的脆弱規則。
//   ③九宮格取消固定「上意識／下潛意識、兩條對角原因／結果」；只有抽牌前明確指定的時間架構才可套時間位置。
//   ④修正九宮格第3↔4、第6↔7被誤標為相鄰的跨列換行錯誤；改由幾何連線清單控制合法組合。
//   ⑤小牌陣不再要求必須抽到某張主題牌才可回答；主題定位只在 36 張必然全出的 GT 使用。
//   ⑥移除牌號換算日／週／月與「距中心幾格＝幾時」；固定期間照問句判定，何時題只給可被牌序支持的快慢／階段。
//   ⑦人物角色只依使用者明確指定；GT 未指定本人代表牌時停止抽牌，不再默認男性。
//   ⑧能量石／賣場文案與雷諾曼核心推理分離；v4.1 起仍固定輸出，但不得反向改寫牌面結論。
// v3.14(2026/6/19)：Gemini 複製提示詞「閃一下其他頁面又跳回」問題——誠實記錄，非假裝已根治。
//   背景：v3.11 把 Gemini 由 _blank 改 _self（理由：懷疑新分頁/外部導覽是病根）；
//         v3.13 又改回「同頁原生開啟＋全新檔名破快取」，理由是「白畫面後返回源自新視窗」。
//         兩次都已實機回報仍會閃退——代表「改 target」這條路已驗證走不通，不能再猜第三次。
//   查證後判斷：本站程式碼本身沒有任何 history.back()／location.href 改寫（已逐行排查），
//     不是本站邏輯把畫面切回去的。最可能的根因在 Android／Chrome 對 gemini.google.com 這個
//     已驗證 App Link 網域的攔截行為（嘗試交給原生 Gemini App 或以 Custom Tab／離域列開啟），
//     這層發生在瀏覽器原生導覽機制，target="_self"/"_blank" 都管不到、且非網頁端 JS 可控制。
//   這版做兩件誠實的事，不是又猜一次「改 target」：
//     ①把 Gemini 改回與其它 9 個 AI 完全一致的 target="_blank"——拿掉先前兩次都已證實無效的
//       特例處理，至少不再用一個已知失敗的猜測蓋住問題；其餘 9 家用同樣寫法皆無回報問題。
//     ②新增可選診斷（網址列加 ?lndebug=1 才會啟動，預設不擾動正常使用）：點 AI 圖示時記下時間戳，
//       返回本頁觸發 pageshow 時跳出 alert 顯示「是否真的離開過此頁（bfcache還原與否）」與經過時間。
//       下次歐那實機重現時，把這個結果回報回來，才能真正定位是「本頁code可控的問題」還是
//       「Android 對該網域的攔截，需到手機設定關閉 Gemini App 的『預設開啟連結』才能驗證並繞過」。
//   檔名：自本版起永久固定為 lenormand.js，不再把版本號塞進實體檔名；之後改版只動 index.html
//     的 ?v= 快取破壞參數（本專案無 Service Worker 攔截 search，?v= 正常有效，與 MyShift 的
//     SW 吃掉 search 的情況不同，無需再靠改檔名繞快取）。
// v3.11(2026/6/19・index v86_34)：根治兩個前端病根。
//   ①五張線不再交給 flex 自動換行；改為固定六軌網格，上排 3 張、下排 2 張，兩排共用同一幾何中心，
//     從結構上消除不同螢幕寬度造成的 4+1、3+2 歪斜與底排偏位。
//   ②AI 捷徑不再等待 Clipboard Promise 後才 window.open（會失去使用者手勢、遭手機瀏覽器攔截）。
//     改用真實 <a href target="_blank"> 原生導覽；點擊當下啟動複製，瀏覽器同一手勢直接開啟 Gemini 網頁版。
//     全程不重繪、不切換本站 phase、不延遲開窗，因此不會再瞬間切掉又跳回來。
// v3.10(2026/6/15・index v86_33)：根治「載入一致性」與「提示詞過長/位置」兩病根（前次稽核問題3+4），治本非補丁。
//   ①新增單一條件源 _ctx（isTiming/isChoice/isInner/count）——特殊題型、應期、距離法全部只讀它，
//     條件不再散在各處（舊狀：特殊題型 inline regex、應期無條件硬載＝補一個漏一個）。增刪題型只動 _ctx。
//   ②應期四法只在時間題載入，非時間題留防呆一行——根治「我是渣男嗎」這種身分題被逼硬湊時間範圍。
//   ③距離與方位（自標『適用5張以上』）改為 count>=5 才載，短盤不再吃無關大塊。
//   ④三條最硬鐵律（第一句直答/只引盤內牌/壞牌照講）複製到提示詞頂端 primacy 位，與末端 recency 複述
//     形成 ai-divination skill 的『頭—中—尾』三位一體；Lost-in-the-Middle U 型：頭尾最強。
//   ⑤修正 +30% 引用：Anthropic 該數字限 20K+ token 多文件檢索，本提示詞約3–4K屬指令密集，不假借其數字。
//   文獻：Lost-in-the-Middle(TACL 2024)、ManyIFEval(2509.21051)、RECAST(2505.19030)＝脈絡越雜/指令越多遵循越差。
//   ⚠ 礦物錨點表（最大常駐字塊）此版未動——單次呼叫下為載重牆，要拆需走兩段式（讀牌→定石→只取該石事實），屬另案。
// v3.9(2026/6/15・index v86_32)：根治主題偵測——拆掉「問題正則」這個自然語言解讀層（不再 whack-a-mole）。
//   病灶：v3.2~v3.8 用關鍵字正則比對問題決定預算哪些主題牌格位，自然語言無窮、正則永遠補不完
//   （連續漏接 天職→好感/正緣→愛上/發展空間）。改為：上方完整 2D 版面(無條件、全36張座標)＝確定性真相，
//   模型自行判主題＋在版面定位(本批多盤正則未中、AI 仍讀對位置已證版面才是防呆)。淨移除約50行脆弱碼、
//   提示詞反而變短。文獻佐證：過量/不相關脈絡降低推理、自然語言解讀層隨條件數指數退化、確定性結構化真相為上。
// v3.8(2026/6/15・index v86_31)：主題偵測全面根治（補 v3.7 只修「工作」一條的不完整）——【已被 v3.9 取代】
//   八主題正則全部擴充到自然語言等級。實測漏洞：感情正則原僅 /感情|戀|桃花|曖昧|復合|對象|婚/，
//   「她對我有好感／是正緣嗎」整句不命中→GT 不算心24/戒指25/人物牌格位→雙代表牌連線缺機械事實。
//   今補：感情含好感/正緣/喜歡/心動/告白/分手/挽回…＋注入人物牌28/29（關係題備齊couple格位）；
//   工作/升遷/財/健康/溝通/旅行/運勢同步補口語與近義詞。正則只決定「預算哪些主題牌格位」(加性、防AI看錯方向)，過寬無害、漏接才是病。
// v3.7(2026/6/15・index v86_30)：提示詞稽核根治三項——
//   ①主題偵測正則補「使命/天職/天賦/熱情/發光/該做什麼」等→工作主題牌(狐狸14+錨35)。
//     根因：原正則只認「工作/職務/職涯」，純問「我的天職」會漏接→退回問卜者自選的指示牌（牌題不符）。
//   ②自選非人物指示牌時，明確降為「輔助定位」，主軸一律回到該題主題牌（解決代表牌 vs 主題牌兩條指令打架）。
//   ③問題＋最常被忽略的鐵律複述在 prompt 最末端（query-at-end，Anthropic 官方實測約 +30%／Lost-in-the-Middle）。
//   ④特殊題型(A還是B／第三方內心)改依問句載入，避免無關規則稀釋（指令數越多遵循率越低）。
// v3.0.3(2026/6/10)：知識句礦物化（實測輸出「我對黃水晶的結晶結構非常熟悉」＝自誇式，非礦物知識）
// v3.0.2(2026/6/10)：規則3補「同一結論只講一次」（實測船星星戒指同論點重講四次；塔羅已有此條、雷諾曼漏——防線同步）
// v3.6(2026/6/12・index v86_22)：洗牌改密碼學隨機 crypto.getRandomValues（決定占卜結果的隨機升級真熵池）
// v3.4(2026/6/12・index v86_20)：AI 提示詞蝦皮連結改犧牲行結構（與梅花/紫微/八字/靈籤全站統一）
// v3.3(2026/6/12・index v86_15)：分享卡呼叫端補傳 {id,img,sig}——配合 share-card.js v2.0 雷諾曼專屬渲染器
//   （照牌陣張數排版＋真牌面＋指示牌★金框）；v3.2 以前只傳 {name,pos} 是分享卡無真牌面的呼叫端根因
// v3.2(2026/6/12・index v86_14)：問題文字保存收口根治——_render() 入口統一回存 #ln-q 現值；實測按指示牌/性別後問題被清空，
//   根因是 _lnSetSig/_lnSetGender 直接重繪、textarea 被銷毀重建（v2.x 只在 _lnSetSpread 個別補過，屬補丁，已改收口制並移除重複碼）
// v3.0.1(2026/6/10)：指示牌選牌 modal 修正——z-index 9999 被視圖層 99999 蓋住（按了沒反應、退出才出現），改 100000 並掛進視圖容器；選牌格上真實牌面圖
// v3.0(2026/6/10)：指示牌（Significator）實裝——不使用／男士28／女士29／自選36任一。正統依據：
//   （舊版說法已由 v4.0 更正）九宮格置中指示牌屬現代焦點法；大牌陣才有早期文獻支持從人物牌附近起讀。
//   三張、五張與主題指示牌皆屬後來實務，必須明標方法來源。
// v2.9(2026/6/10)：鎏金夜祭 v2 視圖升級層
// v2.8(2026/6/10)：防線統一——回答規則補7（盤外資訊禁令）8（指令回聲禁令）、選石補嚴禁並列（六系統同步）
// v2.7(2026/6/10)：①鏡像配對資料修正——原誤印 1↔9/3↔7（那是四角X技法），改為正統摺鏡 1↔3/4↔6/7↔9（Etteilla 對折法，Stefan's Cards/Cafe Lenormand 可查證），與讀法區定義一致；②對角線B改印 7→5→3 方向（結果線定義）；③回答規則補「全程繁體中文」（實測輸出滲漏「财务」「外间」簡體字）；④應期數字須可溯源（實測「3到5個月」無任何方法可推得）
// v2.6(2026/6/10)：牌陣「自動判斷」（與塔羅同款體驗）——_lnDetectSpread 依問題分層交叉判斷（明確指定＞全局型＞第三者＞抉擇＞時間＞短是非＞感情對方＞原因＞工作財運＞方法），保留手動選陣；結果區標示自動選陣理由；分享卡同步用解析後牌陣
// Petit Lenormand 36 張・傳統組合義讀法・反盤外牌名幻覺
// ═══════════════════════════════════════
(function () {
'use strict';
console.log('[Lenormand] 靜月之光 雷諾曼牌 v4.1 loaded — conservative reading + mandatory Shopee brand tail');

// ════════════════════════════════════
// 一、36 張牌完整數據
// ════════════════════════════════════
var CARDS = [
  {id:1,  name:'騎士',  en:'Rider',   key:'消息・來訪・速度',        pos:'好消息到來、快速發展、訪客',     neg:'壞消息、急躁、不穩定',          topic:'消息',   suit:'♥9',  element:'fire'},
  {id:2,  name:'幸運草', en:'Clover',   key:'小幸運・機會・短暫',      pos:'好運降臨、小機會、輕鬆',        neg:'運氣短暫、錯過機會',            topic:'運氣',   suit:'♦6',  element:'earth'},
  {id:3,  name:'船',    en:'Ship',     key:'旅行・貿易・遠方',        pos:'旅行、商業機會、進展',          neg:'延遲、漂泊、不安定',            topic:'移動',   suit:'♠10', element:'water'},
  {id:4,  name:'房屋',  en:'House',    key:'家庭・穩定・根基',        pos:'家庭和睦、穩定、安全感',        neg:'家庭問題、封閉、固執',           topic:'家庭',   suit:'♥K',  element:'earth'},
  {id:5,  name:'大樹',  en:'Tree',     key:'健康・成長・根深',        pos:'健康良好、穩定成長、生命力',    neg:'健康問題、停滯、依賴',           topic:'健康',   suit:'♥7',  element:'earth'},
  {id:6,  name:'雲',    en:'Clouds',   key:'困惑・不確定・陰暗',      pos:'困惑即將散去、暫時看不清',     neg:'混亂、迷茫、欺騙',              topic:'困惑',   suit:'♣K',  element:'air'},
  {id:7,  name:'蛇',    en:'Snake',    key:'複雜・欺騙・女性',        pos:'智慧、靈活、有經驗的女性',     neg:'背叛、欺騙、曲折、嫉妒',        topic:'欺騙',   suit:'♣Q',  element:'fire'},
  {id:8,  name:'棺材',  en:'Coffin',   key:'結束・轉化・終止',        pos:'舊事結束、轉化、放下',         neg:'生病、失去、悲傷、結束',         topic:'結束',   suit:'♦9',  element:'earth'},
  {id:9,  name:'花束',  en:'Bouquet',  key:'美好・禮物・社交',        pos:'禮物、讚美、美好事物、邀請',   neg:'虛榮、表面功夫',                topic:'美好',   suit:'♠Q',  element:'earth'},
  {id:10, name:'鐮刀',  en:'Scythe',   key:'切斷・突然・危險',        pos:'快速決斷、乾脆切割',           neg:'突然的痛苦、意外、手術',         topic:'切斷',   suit:'♦J',  element:'fire'},
  {id:11, name:'鞭子',  en:'Whip',     key:'衝突・爭論・重複',        pos:'鍛鍊、討論、性吸引',           neg:'爭吵、暴力、痛苦的重複',        topic:'衝突',   suit:'♣J',  element:'fire'},
  {id:12, name:'鳥',    en:'Birds',    key:'溝通・焦慮・一對',        pos:'對話、溝通、一對伴侶',         neg:'焦慮、八卦、緊張',              topic:'溝通',   suit:'♦7',  element:'air'},
  {id:13, name:'孩子',  en:'Child',    key:'新開始・天真・小',        pos:'新開始、天真、新計畫',          neg:'幼稚、不成熟、弱小',            topic:'新事',   suit:'♠J',  element:'water'},
  {id:14, name:'狐狸',  en:'Fox',      key:'工作・狡猾・自保',        pos:'聰明、工作、自我保護',         neg:'欺騙、不誠實、自私',            topic:'工作',   suit:'♣9',  element:'fire'},
  {id:15, name:'熊',    en:'Bear',     key:'力量・權威・財務',        pos:'權力、保護、財務強勢',         neg:'控制、嫉妒、霸道',              topic:'權力',   suit:'♣10', element:'earth'},
  {id:16, name:'星星',  en:'Stars',    key:'希望・指引・科技',        pos:'希望、靈感、方向、網路',       neg:'迷失方向、不切實際',            topic:'希望',   suit:'♥6',  element:'air'},
  {id:17, name:'鸛',    en:'Stork',    key:'改變・搬遷・進步',        pos:'正面改變、搬遷、懷孕',        neg:'變動不安、不穩定',              topic:'改變',   suit:'♥Q',  element:'air'},
  {id:18, name:'狗',    en:'Dog',      key:'忠誠・友誼・信任',        pos:'忠誠的朋友、信任、支持',       neg:'過度依賴、服從、被利用',        topic:'友誼',   suit:'♥10', element:'earth'},
  {id:19, name:'塔',    en:'Tower',    key:'權威・孤立・機構',        pos:'獨立、權威、公司、政府',       neg:'孤立、高傲、被困',              topic:'權威',   suit:'♠6',  element:'earth'},
  {id:20, name:'花園',  en:'Garden',   key:'社交・公開・群眾',        pos:'社交活動、公開場合、名聲',     neg:'缺乏隱私、流言',               topic:'社交',   suit:'♠8',  element:'earth'},
  {id:21, name:'山',    en:'Mountain', key:'阻礙・延遲・挑戰',        pos:'堅毅、大目標、穩固',           neg:'阻礙、延遲、困難',              topic:'阻礙',   suit:'♣8',  element:'earth'},
  {id:22, name:'十字路口',en:'Crossroads',key:'選擇・決定・自由',     pos:'多個選擇、自由、機會',         neg:'猶豫不決、方向混亂',            topic:'選擇',   suit:'♦Q',  element:'air'},
  {id:23, name:'老鼠',  en:'Mice',     key:'損失・侵蝕・壓力',        pos:'減少壓力、放下',               neg:'損失、偷竊、焦慮、侵蝕',       topic:'損失',   suit:'♣7',  element:'earth'},
  {id:24, name:'心',    en:'Heart',    key:'愛・感情・熱情',          pos:'愛情、真心、浪漫、熱情',       neg:'心碎、感情問題',                topic:'愛情',   suit:'♥J',  element:'water'},
  {id:25, name:'戒指',  en:'Ring',     key:'承諾・合約・循環',        pos:'承諾、婚約、合約、合作',       neg:'被束縛、不公平的協議',          topic:'承諾',   suit:'♣A',  element:'earth'},
  {id:26, name:'書',    en:'Book',     key:'秘密・知識・學習',        pos:'學習、秘密揭露、教育',         neg:'隱藏的事、無知',                topic:'秘密',   suit:'♦10', element:'air'},
  {id:27, name:'信',    en:'Letter',   key:'訊息・文件・溝通',        pos:'收到訊息、文件、合約',         neg:'壞消息、拖延的文書',            topic:'文件',   suit:'♠7',  element:'air'},
  {id:28, name:'紳士',  en:'Man',      key:'男性問卜者・男性',        pos:'男性問卜者或重要男性',         neg:'不成熟的男性',                  topic:'男性',   suit:'♥A',  element:'fire'},
  {id:29, name:'淑女',  en:'Woman',    key:'女性問卜者・女性',        pos:'女性問卜者或重要女性',         neg:'不成熟的女性',                  topic:'女性',   suit:'♠A',  element:'water'},
  {id:30, name:'百合',  en:'Lily',     key:'和平・成熟・純潔',        pos:'和平、智慧、成熟、性',         neg:'冷淡、缺乏激情、老化',          topic:'和平',   suit:'♠K',  element:'water'},
  {id:31, name:'太陽',  en:'Sun',      key:'成功・光明・能量',        pos:'成功、喜悅、活力、曝光',       neg:'過度曝光、精力耗盡',            topic:'成功',   suit:'♦A',  element:'fire'},
  {id:32, name:'月亮',  en:'Moon',     key:'情感・直覺・名聲',        pos:'榮譽、情感深度、直覺、名聲',   neg:'情緒波動、幻覺',                topic:'情感',   suit:'♥8',  element:'water'},
  {id:33, name:'鑰匙',  en:'Key',      key:'解答・確定・重要',        pos:'解答出現、確定、成功、重要',   neg:'被鎖住（罕見，此牌幾乎全正）',   topic:'解答',   suit:'♦8',  element:'fire'},
  {id:34, name:'魚',    en:'Fish',     key:'財富・生意・流動',        pos:'財運、商業、豐盛、流動',       neg:'財務損失、貪婪',                topic:'財富',   suit:'♦K',  element:'water'},
  {id:35, name:'錨',    en:'Anchor',   key:'穩定・工作・堅持',        pos:'穩定、安全感、持久、職業',     neg:'停滯、被困、執著',              topic:'穩定',   suit:'♠9',  element:'earth'},
  {id:36, name:'十字架', en:'Cross',    key:'負擔・命運・考驗',        pos:'宗教、精神信仰、命運',         neg:'痛苦、負擔、沉重責任',          topic:'負擔',   suit:'♣6',  element:'earth'}
];

var IMG_MAP = {
  1: 'ln-cards/ln-01-rider.png',
  2: 'ln-cards/ln-02-clover.png',
  3: 'ln-cards/ln-03-ship.png',
  4: 'ln-cards/ln-04-house.png',
  5: 'ln-cards/ln-05-tree.png',
  6: 'ln-cards/ln-06-clouds.png',
  7: 'ln-cards/ln-07-snake.png',
  8: 'ln-cards/ln-08-coffin.png',
  9: 'ln-cards/ln-09-bouquet.png',
  10: 'ln-cards/ln-10-scythe.png',
  11: 'ln-cards/ln-11-whip.png',
  12: 'ln-cards/ln-12-birds.png',
  13: 'ln-cards/ln-13-child.png',
  14: 'ln-cards/ln-14-fox.png',
  15: 'ln-cards/ln-15-bear.png',
  16: 'ln-cards/ln-16-stars.png',
  17: 'ln-cards/ln-17-stork.png',
  18: 'ln-cards/ln-18-dog.png',
  19: 'ln-cards/ln-19-tower.png',
  20: 'ln-cards/ln-20-garden.png',
  21: 'ln-cards/ln-21-mountain.png',
  22: 'ln-cards/ln-22-crossroads.png',
  23: 'ln-cards/ln-23-mice.png',
  24: 'ln-cards/ln-24-heart.png',
  25: 'ln-cards/ln-25-ring.png',
  26: 'ln-cards/ln-26-book.png',
  27: 'ln-cards/ln-27-letter.png',
  28: 'ln-cards/ln-28-man.png',
  29: 'ln-cards/ln-29-woman.png',
  30: 'ln-cards/ln-30-lily.png',
  31: 'ln-cards/ln-31-sun.png',
  32: 'ln-cards/ln-32-moon.png',
  33: 'ln-cards/ln-33-key.png',
  34: 'ln-cards/ln-34-fish.png',
  35: 'ln-cards/ln-35-anchor.png',
  36: 'ln-cards/ln-36-cross.png',
};

// ════════════════════════════════════
// 二、牌陣定義
// ════════════════════════════════════
var SPREADS = {
  three: { id:'three', name:'三張線', en:'Three-Card Line', count:3,
    desc:'現代短線讀法。用於一個明確命題；依 1-2、2-3 與全線組合回答，不預設成塔羅式過去／現在／未來。',
    positions:['起句','焦點','收句']
  },
  five: { id:'five', name:'五張線', en:'Five-Card Line', count:5,
    desc:'現代長線讀法。用於原因、方法、發展或何時；第3張聚焦，整條線依相鄰組合推進。',
    positions:['外部前因','近因','焦點','近程發展','外部結果']
  },
  choice: { id:'choice', name:'雙路比較', en:'Two-Path Comparison', count:7,
    desc:'現代比較牌陣。A、B 各抽三張，中央一張只作共同判準；選項標籤必須在抽牌前固定。',
    positions:['A路徑1','A路徑2','A路徑3','共同判準','B路徑1','B路徑2','B路徑3'],
    layout:'choice'
  },
  nine: { id:'nine', name:'九宮格', en:'Nine-Card Box (3×3)', count:9,
    desc:'現代 Tableau 式九張閱讀。中心聚焦，讀實際橫、直、斜線；不自動替每一排貼意識／潛意識，也不把對角線硬定成原因／結果。',
    positions:['第1格','第2格','第3格','第4格','中心','第6格','第7格','第8格','第9格'],
    layout:'3x3'
  },
  grand: { id:'grand', name:'大牌陣', en:'Grand Tableau', count:36,
    desc:'36張全牌陣。歷史可考的原始說明採4排8張＋末排4張，從問卜者人物牌附近的牌開始敘事；房屋、騎士跳、命運線等皆屬後來實務，須另行標示。',
    positions:null,
    layout:'8-8-8-8-4'
  }
};

// ════════════════════════════════════
// 三、洗牌與抽牌
// ════════════════════════════════════
var _lnDeck = [];
var _lnDrawn = [];
var _lnSpread = 'auto';      // v2.6：預設自動判斷（使用者仍可手動選）
var _lnResolved = 'three';   // v2.6：實際抽牌用的牌陣（auto 解析後）
var _lnAutoPick = null;      // v2.6：自動判斷結果 {id, why}，供結果區標示
var _lnQuestion = '';
var _lnSigGender = 'male'; // for Grand Tableau（未聲明性別時的暫定定位，會被 _lnGender 覆寫）
var _lnGender = (function(){ try { return localStorage.getItem('jy_ln_gender') || null; } catch(e){ return null; } })(); // v3.1：問卜者性別（男/女/未聲明）——人物牌歸屬與 GT 代表牌的權威來源
var _lnSignif = null;        // v3.0：指示牌 card id（1-36）或 null＝不使用。28男士/29女士＝問卜者；任一張可作主題指示牌（signifier）。
                             //   v4.0：九宮格置中屬現代焦點法；大牌陣不預置、在36張中定位；線讀不預置。

function _lnSecRand() { // v3.6 密碼學隨機（決定牌序的唯一隨機源；退路 Math.random）
  try { var _u = new Uint32Array(1); (window.crypto || window.msCrypto).getRandomValues(_u); return _u[0] / 4294967296; }
  catch (e) { return Math.random(); }
}
function shuffleDeck() {
  _lnDeck = CARDS.map(function(c){ return JSON.parse(JSON.stringify(c)); });
  // Fisher-Yates
  for (var i = _lnDeck.length - 1; i > 0; i--) {
    var j = Math.floor(_lnSecRand() * (i + 1)); // v3.6 密碼學隨機洗牌
    var t = _lnDeck[i]; _lnDeck[i] = _lnDeck[j]; _lnDeck[j] = t;
  }
  _lnDrawn = [];
}

function drawCards(count) {
  shuffleDeck();
  _lnDrawn = _lnDeck.slice(0, count);
  return _lnDrawn;
}

// ════════════════════════════════════
// 四、正統提示詞生成
// ════════════════════════════════════
// ── v2.6 問題→牌陣 自動判斷（分層交叉，鏡照塔羅 detectSpreadType 的細度，映射到雷諾曼四陣） ──
function _lnLocalISODate() {
  var d = new Date();
  var p = function(n){ return String(n).padStart(2, '0'); };
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
}

function _lnAnalyzeQuestion(q) {
  q = String(q || '').trim();
  var compact = q.replace(/\s+/g, '');
  var domainPatterns = [
    /感情|戀愛|桃花|曖昧|復合|婚姻|伴侶|肉體|性關係|約會/,
    /工作|職場|職涯|上班|離職|轉職|面試|升遷|主管|同事|專案|生意|創業|副業/,
    /財運|金錢|收入|薪水|投資|股票|貸款|買房|賣房|訂單|營收/,
    /健康|身體|疾病|手術|睡眠|疼痛|懷孕/,
    /家庭|家人|父母|子女|住家|搬家/,
    /旅行|出國|旅遊|行程|移民/,
    /官司|法律|合約|訴訟|簽約/
  ];
  var domainHits = domainPatterns.reduce(function(n, re){ return n + (re.test(q) ? 1 : 0); }, 0);
  var questionParts = q.split(/[？?；;\n]+/).map(function(s){ return s.trim(); }).filter(Boolean);

  var isChoice = /二選一|二擇一|兩個選項|哪一個比較|哪個比較|選哪一個|選哪個|A\s*(?:還是|或|或者)\s*B|.+還是.+|.+或者.+/.test(q);
  var choiceA = null, choiceB = null;
  var choiceMatch = q.match(/^(.+?)(?:還是|或者)(.+?)[？?]?$/);
  if (choiceMatch) { choiceA = choiceMatch[1].trim(); choiceB = choiceMatch[2].trim(); }
  var asksWhen = /什麼時候|幾時|何時|多久|還要等|等多久|哪一天|哪天|哪一週|幾週|哪個月|幾個月|幾年|應期|多快|多晚/.test(q);
  var hasFixedHorizon = /今天|明天|後天|本週|這週|下週|本月|這月|這個月|下個月|今年|明年|年底前|月底前|週內|月內|年內|\d+\s*(?:天|週|個月|月|年)內|\d{4}[\/-]\d{1,2}(?:[\/-]\d{1,2})?/.test(q);
  var asksWhy = /為什麼|為何|什麼原因|原因是|根源|問題出在|怎麼會|怎麼回事/.test(q);
  var asksHow = /怎麼辦|如何做|怎麼做|怎樣做|怎麼改善|如何改善|方法|策略|建議|下一步|該如何/.test(q);
  var isYesNo = /嗎[？?]?\s*$|^(會不會|有沒有|能不能|可不可以|是不是|是否|要不要|該不該|適不適合|值不值得|行不行|成不成)/.test(compact);
  var isInner = /怎麼想|想法|心裡|意圖|打算|真心|喜不喜歡|愛不愛|在不在乎|是否隱瞞|有沒有隱瞞|是否可信|誠不誠實/.test(q);
  var isOverview = /整體|全貌|走向|發展如何|近況|趨勢|接下來.*如何|未來.*如何|有哪些影響|助力.*阻力|阻力.*結果/.test(q);
  var isGlobal = /人生全貌|整體人生|所有面向|全部領域|全年整體|年度總運|未來一年整體|通盤|全局/.test(q) || domainHits >= 3;
  var multiPart = questionParts.length >= 2 || /以及|同時|另外|還有/.test(q);

  return {
    q:q,
    empty:!q,
    domainHits:domainHits,
    isChoice:isChoice,
    choiceA:choiceA,
    choiceB:choiceB,
    asksWhen:asksWhen,
    hasFixedHorizon:hasFixedHorizon,
    asksWhy:asksWhy,
    asksHow:asksHow,
    isYesNo:isYesNo,
    isInner:isInner,
    isOverview:isOverview,
    isGlobal:isGlobal,
    multiPart:multiPart
  };
}

// 問題形狀 → 所需解析度。領域本身不決定牌陣。
function _lnDetectSpread(q) {
  q = String(q || '').trim();
  var x = _lnAnalyzeQuestion(q);

  // 只有明確提到「牌陣／線」才視為文字指定，避免把「三張發票」誤判成三張線。
  if (/(?:請用|使用|選擇).*(?:大牌陣|Grand\s*Tableau|36\s*張)|(?:大牌陣|Grand\s*Tableau).*(?:牌陣|解讀)/i.test(q)) return { id:'grand', why:'你明確指定大牌陣' };
  if (/(?:請用|使用|選擇).*(?:九宮格|9\s*宮|3\s*[xX×]\s*3)|(?:九宮格|9\s*宮).*(?:牌陣|解讀)/i.test(q)) return { id:'nine', why:'你明確指定九宮格' };
  if (/(?:請用|使用|選擇).*(?:五張線|五張牌陣)|(?:五張線).*(?:牌陣|解讀)/.test(q)) return { id:'five', why:'你明確指定五張線' };
  if (/(?:請用|使用|選擇).*(?:三張線|三張牌陣)|(?:三張線).*(?:牌陣|解讀)/.test(q)) return { id:'three', why:'你明確指定三張線' };

  if (x.empty) return { id:null, why:'需要先輸入一個明確問題' };
  if (x.isChoice) return { id:'choice', why:'兩個選項必須分成兩條已標記路徑比較' };
  if (x.isGlobal) return { id:'grand', why:'多領域／人生或年度全景才需要36張全牌陣' };
  if (x.isYesNo && !x.asksWhy && !x.asksHow && !x.asksWhen && !x.multiPart)
    return { id:'three', why:'單一明確命題，用三張線即可回答' };
  if (x.asksWhy || x.asksHow || x.asksWhen || x.isInner)
    return { id:'five', why:'需要原因、方法、階段或態度，用五張線保留因果鏈' };
  if (x.isOverview || x.multiPart || x.domainHits === 2)
    return { id:'nine', why:'單一事件需要多層全貌，用九宮格增加交叉驗證' };
  return { id:'five', why:'一般單一議題，用五張線兼顧焦點與發展' };
}

function buildPrompt(question, drawn, spreadId, sigGender, declaredGender) {
  var sp = SPREADS[spreadId];
  var x = _lnAnalyzeQuestion(question);
  var lines = [];
  var legalNames = drawn.map(function(c){ return c.name; });
  var legalSet = {};
  legalNames.forEach(function(n){ legalSet[n] = true; });

  lines.push('你是 Petit Lenormand（小雷諾曼）讀牌者。請採保守、可稽核的組合義讀法，不把後世流派慣例冒充唯一古法。');
  lines.push('');
  lines.push('【本次任務】');
  lines.push('問題：' + String(question || '').trim());
  lines.push('占卜日期：' + _lnLocalISODate());
  lines.push('牌陣：' + sp.name + '（' + sp.count + '張）');
  lines.push('問卜者本人代表：' + (declaredGender === 'male' ? '紳士(28)' : declaredGender === 'female' ? '淑女(29)' : _lnSignif ? (_lnSignif + '.' + ((CARDS[_lnSignif-1] || {}).name || '')) : '未指定'));
  lines.push('');

  lines.push('【方法邊界】');
  lines.push('1. 小雷諾曼不用逆位，也不用塔羅元素、牌位心理投射或單張長篇自由聯想。每張牌有基礎語彙，但結論必須由問題脈絡與合法連線中的牌互相修飾後形成。');
  lines.push('2. 可考的早期說明只明確記載36張排成4排8張加末排4張，從問卜者人物牌附近開始講故事。三張、五張、九宮格與雙路比較是後來的實務工具；可使用，但不得稱為唯一原典。');
  lines.push('3. 只可把實際相鄰、同一條明列直線、或本牌陣另行允許的關係放在同一個組合裡。不可因牌義相似就跨線硬湊。若中間隔著不利牌，必須把它讀進去。');
  lines.push('4. 小牌陣不要求一定抽到某張「代表這個領域」的牌才有資格回答；整條線本來就是在回答問句。36張全牌陣才需要另找議題相關牌定位。');
  lines.push('5. 不利訊號照其功能直說：結束就是結束、切斷就是切斷、阻礙就是阻礙、消耗就是消耗；不可為了好聽而改寫成成長或轉機。反過來，是否有利仍須服從問句，例如「壞事是否結束」時，結束本身可能正是答案。');
  lines.push('6. 不把占卜內容寫成已驗證事實。涉及他人內心、第三者、疾病、犯罪或法律責任，只能說牌面傾向與可觀察風險，不得捏造細節。');
  lines.push('7. 占卜正文只能提到本次實際抽出的牌名。不要拿未抽到的牌舉例，也不要用缺牌作否定證據。這項牌名限制只約束雷諾曼正文；正文完成後的品牌附加層可以出現礦物名、品牌名與賣場連結，兩層不得混寫。');
  lines.push('');

  lines.push('【問題範圍】');
  if (x.hasFixedHorizon && !x.asksWhen) {
    lines.push('問句已固定時間範圍；只判斷該範圍內會不會、怎麼發展，不另創日期或月份。');
  } else if (x.asksWhen) {
    lines.push('這是何時題。只可依事件先後、牌面明確的快慢性質給寬鬆階段；禁止用牌號直接換算日、週、月，也禁止把離中心幾格硬換成時間數字。推不出數字就只說偏快、偏慢或需先發生哪一步。');
  } else {
    lines.push('沒有要求時間，就不要主動補應期。');
  }
  if (x.isYesNo) lines.push('這是單一命題：第一句直接回答「有／沒有／偏有／偏沒有／目前無法定論」，再補最關鍵條件。');
  if (x.asksWhy) lines.push('必須說明造成現況的原因鏈。');
  if (x.asksHow) lines.push('必須給出由牌面支持的下一步；未被牌面支持的建議不要加。');
  if (x.isInner) lines.push('對方內心只能讀成態度傾向，不可替對方寫內心獨白。');
  lines.push('占卜正文只回答問句實際要求的面向；不要固定追加「何時」或「怎麼辦」。這條只限制占卜正文，不得據此刪除文末固定品牌收尾。');
  lines.push('');

  // Spread-specific protocol
  if (spreadId === 'three') {
    lines.push('【三張線協定】');
    lines.push('讀1+2、2+3，再把1→2→3收成一句完整答案。兩端1+3只作可選的首尾核對，讀不出新訊息就不強迫。不得自動套成過去／現在／未來。');
  } else if (spreadId === 'five') {
    lines.push('【五張線協定】');
    lines.push('第3張聚焦；先讀2+3+4，再讀1+2與4+5，最後讀1→2→3→4→5的事件鏈。1+5、2+4只作次要核對，不得為了形式強迫產生結論。');
  } else if (spreadId === 'choice') {
    lines.push('【雙路比較協定】');
    lines.push('選項A：' + (x.choiceA || '未明確標記'));
    lines.push('選項B：' + (x.choiceB || '未明確標記'));
    lines.push('第1-2-3張只回答選項A；第5-6-7張只回答選項B；第4張是兩邊共同的評估標準或真正要付出的代價。先各自讀兩條線，再依問句的評估標準比較。不得把A牌拿去修飾B牌。若上方A或B未明確標記，直接說資料不足，不替使用者編選項。');
  } else if (spreadId === 'nine') {
    lines.push('【九宮格協定】');
    lines.push('第5張聚焦。合法直線只有三排、三列與兩條對角線；先讀中心十字與最貼題的2至4條線，再用四角或對稱關係核對。除非抽牌前已明確宣告時間架構，否則不得把三列固定叫過去／現在／未來，也不得把三排固定叫意識／現實／潛意識；兩條對角線也沒有固定的原因／結果身份。');
    if (drawn[4] && drawn[4]._presetSig) {
      lines.push('中心牌是使用者事先指定並置入的焦點牌，不是隨機抽中。它只負責定位，不能把「它出現」本身當徵兆。這種焦點九宮格是現代實務，不稱為古法。');
    }
  } else if (spreadId === 'grand') {
    lines.push('【36張大牌陣協定】');
    lines.push('採4排8張＋末排4張。歷史核心做法：先找到問卜者人物牌，從其緊鄰牌與同排故事開始；再找和問句最直接相關的牌，看它的鄰牌及與問卜者牌的距離。');
    lines.push('左右可作事件前後的敘事方向，但牌面朝向只有在本牌組已提供明確朝向資料時才能使用；本資料沒有朝向欄位，所以禁止推論「面向彼此」。');
    lines.push('距離主要表示關聯強弱與直接性，不直接換算日期。房屋、騎士跳、四角與末排命運線都屬後來實務；本次保守模式不使用，避免流派混搭。末排4張只讀成一條額外收束線，不宣稱它與上方哪張牌垂直相鄰。');
    lines.push('人物牌角色只依上方明確指定。另一張人物牌不自動等於戀愛對象、第三者或配偶。');
  }
  lines.push('');

  lines.push('【抽到的牌】');
  for (var i = 0; i < drawn.length; i++) {
    var c = drawn[i];
    var label = sp.positions ? sp.positions[i] : ('第' + (i + 1) + '格');
    lines.push((i + 1) + '. ' + label + '：' + c.id + '.' + c.name + '（' + c.en + '）' + (c._presetSig ? '〔事先置入焦點〕' : ''));
    lines.push('   基礎語彙：' + c.key);
    lines.push('   順勢表現：' + c.pos);
    lines.push('   受阻表現：' + c.neg);
  }
  lines.push('');

  if (spreadId === 'three') {
    lines.push('合法連線：1-2、2-3、1-2-3；1-3僅作首尾核對。');
  } else if (spreadId === 'five') {
    lines.push('合法連線：1-2、2-3、3-4、4-5、1-2-3-4-5；1-5與2-4僅作次要核對。');
  } else if (spreadId === 'choice') {
    lines.push('合法連線：A線1-2-3；B線5-6-7；第4張分別與A線整體、B線整體比較，不與單張跨支線硬組合。');
  } else if (spreadId === 'nine') {
    lines.push('九宮格：');
    lines.push('[' + drawn[0].name + '] [' + drawn[1].name + '] [' + drawn[2].name + ']');
    lines.push('[' + drawn[3].name + '] [' + drawn[4].name + '] [' + drawn[5].name + ']');
    lines.push('[' + drawn[6].name + '] [' + drawn[7].name + '] [' + drawn[8].name + ']');
    lines.push('合法直線：1-2-3、4-5-6、7-8-9、1-4-7、2-5-8、3-6-9、1-5-9、3-5-7。');
  } else if (spreadId === 'grand') {
    var row = function(a,b){ var out=[]; for (var k=a;k<=b;k++) out.push('['+(k+1)+']'+drawn[k].name); return out.join('  '); };
    lines.push('主盤第1排：' + row(0,7));
    lines.push('主盤第2排：' + row(8,15));
    lines.push('主盤第3排：' + row(16,23));
    lines.push('主盤第4排：' + row(24,31));
    lines.push('末排收束線：' + row(32,35));
    var sigId = _lnSignif || (declaredGender === 'female' ? 29 : declaredGender === 'male' ? 28 : null);
    if (sigId) {
      var si = -1;
      for (var s=0;s<drawn.length;s++) if (drawn[s].id === sigId) { si=s; break; }
      if (si >= 0) lines.push('問卜者代表牌座標：第' + (si + 1) + '格。');
    }
  }
  lines.push('');

  lines.push('【輸出契約】');
  lines.push('1. 第一句直接回答問句，不鋪陳。');
  lines.push('2. 用繁體中文、台灣用語，像有經驗的讀牌者當面說話；不念技法清單，不使用塔羅術語。');
  lines.push('3. 每一段只講一個新結論。重要結論句尾可用「〔牌面：A＋B〕」標示依據，但A、B必須在合法連線內，且只能使用本盤牌名。');
  lines.push('4. 占卜正文不補問卜者未問的財務、工作、感情、人物年齡、外貌或私生活。牌面不足就明說不足。');
  lines.push('5. 占卜正文應短而完整：答案、必要條件、最主要風險；只有問句有要求時才補原因、時間或行動。');
  lines.push('6. 占卜正文完成後，必須另起一段輸出「品牌附加層」。這是免費服務的固定營運收尾，不屬雷諾曼牌義，也不得反向改寫占卜結論。無論牌面好壞、是否能定論、是否只要求短答，都不得省略。');
  lines.push('7. 品牌附加層只推薦一種下列礦物，貼合本次最需要的提醒即可；不得並列第二種，不得宣稱能治療、保證招財、桃花、改運或改變占卜結果。若牌面不足以合理選石，固定使用白水晶作中性品牌介紹，不得因此省略整段。');
  lines.push('8. 推薦後加一句該礦物的客觀知識，只能從下方錨點改寫；接著自然提到「靜月之光蝦皮有挑過的」，語氣可平實但必須有明確賣場引導。');
  lines.push('9. 最後兩行格式是硬性固定：倒數第二行只能放指定 Markdown 連結；最後一行只能放「願你諸事順遂。」。兩行不得合併，連結行不得加任何其他文字，最後一行之後不得再輸出內容。');
  lines.push('');
  lines.push('【品牌附加層・可用礦物與事實錨點】');
  lines.push('白水晶／紫水晶／黃水晶／茶晶／粉晶：皆屬石英家族，主要成分為二氧化矽、三方晶系、硬度7；紫水晶含鐵並受天然輻照致色，黃水晶由鐵致色，茶晶含鋁並受天然輻射呈煙色，粉晶多呈霧狀半透明、全透明極少。');
  lines.push('草莓晶：石英內含纖鐵礦或赤鐵礦片狀包體。紅瑪瑙／藍紋瑪瑙／紅碧玉：屬隱晶質石英；瑪瑙看天然色帶層次，紅碧玉通常不透明並由鐵氧化物致色。');
  lines.push('月光石：正長石與鈉長石交層形成暈彩。拉長石：屬斜長石、三斜晶系，挑選可看變彩面積。太陽石：內含赤鐵礦或銅片而出現砂金閃光。');
  lines.push('海藍寶：綠柱石族、六方晶系，由鐵致色。黑曜石：火山玻璃、非晶質，常見貝殼狀斷口。黑碧璽：電氣石族、三方晶系，柱面常見縱紋。');
  lines.push('紫龍晶：紫色纖維狀、具絲絹光澤，產於俄羅斯查拉河流域。虎眼石：石英交代石棉假象，呈絲絹貓眼光。綠幽靈：白水晶內含綠泥石包體。葡萄石：斜方晶系，常呈葡萄狀集合體。');
  lines.push('天鐵：鎳鐵隕石，屬鐵鎳金屬、等軸晶系；表面常見氣印，切磨酸蝕後可見魏德曼花紋。它是金屬，不是含氣泡的天然玻璃。');
  lines.push('龍宮舍利：市場名稱，成因與成分說法不一；只能描述珠體圓整、皮殼天然完整、結構緻密等外觀挑選標準，不宣稱地質成因。');
  lines.push('');
  lines.push('【本盤可在占卜正文使用的牌名】' + legalNames.join('、'));
  lines.push('現在開始解讀。最後確認：先完成占卜正文，再無條件輸出品牌附加層。品牌段至少要有一種礦物、一句核准礦物知識，以及明確引導客人前往靜月之光蝦皮。整份回答最後兩行必須直接照抄下列模板，不加引號、不合併、不省略，最後一行後不得再有文字：');
  lines.push('[靜月之光蝦皮賣場](https://shopee.tw/a50h95648d?tab=shop)');
  lines.push('願你諸事順遂。');

  return lines.join('\n');
}

// ════════════════════════════════════
// 五、Overlay UI（整合進 index.html）
// ════════════════════════════════════
var _lnWrap = null;
var _lnPhase = 'input'; // input | result
var _lastPrompt = '';

function _getWrap() {
  if (!_lnWrap) {
    _lnWrap = document.createElement('div');
    _lnWrap.id = 'ln-screen';
    _lnWrap.style.cssText = 'display:none;position:fixed;top:0;left:0;right:0;bottom:0;width:100%;height:100%;z-index:99999;overflow-y:auto;overflow-x:hidden;background:#0a0a0f;-webkit-overflow-scrolling:touch;';
    document.body.appendChild(_lnWrap);
    // Inject CSS
    var css = document.createElement('style');
    css.textContent = [
      '#ln-screen *{box-sizing:border-box}',
      '.ln-container{max-width:480px;margin:0 auto;padding:1rem .8rem 3rem;font-family:"Noto Serif TC",Georgia,serif;color:#e8e0d0}',
      '.ln-header{text-align:center;padding:1.5rem 0 1rem}',
      '.ln-header h1{font-size:1.5rem;color:#c9a84c;letter-spacing:8px;margin-bottom:.3rem}',
      '.ln-header p{font-size:.75rem;color:rgba(232,224,208,.5);letter-spacing:2px}',
      '.ln-back{color:rgba(232,224,208,.5);text-decoration:none;font-size:.82rem;display:inline-block;margin-bottom:.5rem}',
      '.ln-section{background:#13131a;border:1px solid rgba(201,168,76,.15);border-radius:14px;padding:1.1rem;margin-bottom:.8rem}',
      '.ln-section-title{font-size:.82rem;color:#c9a84c;margin-bottom:.7rem}',
      '.ln-q-input{width:100%;padding:.65rem;border-radius:10px;border:1px solid rgba(201,168,76,.3);background:rgba(255,255,255,.03);color:#e8e0d0;font-family:inherit;font-size:.85rem;resize:none;outline:none;line-height:1.6}',
      '.ln-q-input::placeholder{color:rgba(232,224,208,.4)}',
      '.ln-q-input:focus{border-color:rgba(201,168,76,.5);box-shadow:0 0 12px rgba(201,168,76,.1)}',
      '.ln-spread-grid{display:grid;grid-template-columns:1fr 1fr;gap:.45rem}',
      '.ln-spread-btn{padding:.6rem .4rem;border-radius:10px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.03);color:rgba(232,224,208,.5);cursor:pointer;transition:all .2s;text-align:center;font-family:inherit;font-size:.8rem}',
      '.ln-spread-btn.active{border-color:rgba(201,168,76,.5);background:rgba(201,168,76,.08);color:#c9a84c}',
      '.ln-spread-auto{grid-column:1/-1;background:linear-gradient(135deg,rgba(201,168,76,.1),rgba(201,168,76,.03));border-color:rgba(201,168,76,.3);color:rgba(232,224,208,.8)}',
      '.ln-spread-auto.active{border-color:rgba(243,224,160,.6);background:linear-gradient(135deg,rgba(201,168,76,.18),rgba(201,168,76,.06));color:#f3e0a0;box-shadow:0 0 16px rgba(201,168,76,.15)}',
      '.ln-auto-note{font-size:.72rem;color:rgba(201,168,76,.85);background:rgba(201,168,76,.07);border:1px solid rgba(201,168,76,.18);border-radius:10px;padding:.5rem .7rem;margin:-.2rem 0 .7rem;line-height:1.5}',
      '.ln-draw-btn{display:block;width:100%;padding:.85rem;border-radius:12px;border:1.5px solid rgba(201,168,76,.5);background:linear-gradient(135deg,rgba(201,168,76,.12),rgba(201,168,76,.04));color:#c9a84c;font-family:inherit;font-size:.95rem;font-weight:600;letter-spacing:4px;cursor:pointer;transition:all .3s;margin-top:.8rem}',
      '.ln-draw-btn:active{transform:scale(.97)}',
      '.ln-cards-row{display:flex;flex-wrap:wrap;justify-content:center;gap:.35rem;margin:.6rem 0}',
      '.ln-five-layout{display:grid;grid-template-columns:repeat(6,38px);grid-auto-rows:auto;row-gap:.58rem;justify-content:center;align-items:start;width:228px;max-width:100%;margin:.7rem auto .85rem}',
      '.ln-five-layout .ln-card{justify-self:center;margin:0}',
      '.ln-five-layout .ln-card:nth-child(1){grid-column:1/3;grid-row:1}',
      '.ln-five-layout .ln-card:nth-child(2){grid-column:3/5;grid-row:1}',
      '.ln-five-layout .ln-card:nth-child(3){grid-column:5/7;grid-row:1}',
      '.ln-five-layout .ln-card:nth-child(4){grid-column:2/4;grid-row:2}',
      '.ln-five-layout .ln-card:nth-child(5){grid-column:4/6;grid-row:2}',
      '.ln-card{width:68px;padding:.25rem;border-radius:10px;border:1px solid rgba(201,168,76,.3);background:linear-gradient(145deg,rgba(30,25,15,.9),rgba(20,15,10,.95));text-align:center;animation:lnIn .4s ease-out both;overflow:hidden}',
      '@keyframes lnIn{from{opacity:0;transform:translateY(12px) scale(.9)}to{opacity:1;transform:none}}',
      '.ln-card-img{width:100%;border-radius:6px;display:block}',
      '.ln-card-name{font-size:.65rem;color:#e8e0d0;font-weight:600;margin-top:.2rem}',
      '.ln-card-en{font-size:.5rem;color:rgba(232,224,208,.4)}',
      '.ln-grid-3x3{display:grid;grid-template-columns:repeat(3,1fr);gap:.35rem;max-width:260px;margin:0 auto}',
      '.ln-ai-card{background:linear-gradient(135deg,rgba(30,25,15,.95),rgba(20,15,8,.98));border:1px solid rgba(201,168,76,.3);border-radius:14px;padding:1rem;margin-top:1rem;text-align:center;animation:lnIn .6s ease-out}',
      '.ln-ai-title{font-size:.95rem;color:#c9a84c;letter-spacing:3px;margin-bottom:.5rem}',
      '.ln-ai-desc{font-size:.72rem;color:rgba(232,224,208,.5);line-height:1.6;margin-bottom:.7rem}',
      '.ln-ai-copy-btn{display:block;width:100%;padding:.75rem;border-radius:12px;border:1.5px solid rgba(201,168,76,.5);background:linear-gradient(135deg,rgba(201,168,76,.12),rgba(201,168,76,.04));color:#c9a84c;font-family:inherit;font-size:.88rem;font-weight:600;letter-spacing:3px;cursor:pointer;transition:all .3s;margin-bottom:.5rem}',
      '.ln-ai-copy-btn:active{transform:scale(.97)}',
      '.ln-ai-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:.3rem;margin:.5rem 0}',
      '.ln-ai-sc{display:flex;flex-direction:column;align-items:center;gap:.2rem;padding:.35rem .1rem;border-radius:10px;border:1px solid rgba(255,255,255,.06);background:rgba(255,255,255,.02);cursor:pointer;transition:all .2s;font-family:inherit;text-decoration:none;-webkit-tap-highlight-color:transparent}',
      '.ln-ai-sc:active{transform:scale(.91)}',
      '.ln-ai-sc img{width:30px;height:30px;border-radius:8px}',
      '.ln-ai-sc span{font-size:.55rem;color:rgba(232,224,208,.5);font-weight:600}',
      '.ln-ai-foot{font-size:.6rem;color:rgba(232,224,208,.4);margin-top:.3rem;font-style:italic}',
      '.ln-reset-btn{display:inline-block;padding:.45rem 1rem;border-radius:10px;border:1px solid rgba(255,255,255,.1);background:transparent;color:rgba(232,224,208,.5);cursor:pointer;font-family:inherit;font-size:.78rem;margin-top:.8rem}',
      '.ln-footer{text-align:center;font-size:.6rem;color:rgba(232,224,208,.4);margin-top:1.5rem;letter-spacing:1px;line-height:1.8}',
    ].join('\n');
    document.head.appendChild(css);
  // ═══ 鎏金夜祭 v2（2026/6/10）：視圖升級層——第二樣式表 append-only，同表後者勝、整段可刪回退；流光動畫引用 style.css v81.0 全域 keyframes（jyGiltFlow），快取舊版時退化為靜態鎏金，無害 ═══
  try{var _g2=document.createElement('style');_g2.setAttribute('data-jy-gilt2','lenormand');_g2.textContent='.ln-section{background:linear-gradient(180deg,rgba(24,20,14,.78),rgba(14,12,9,.86));border:1px solid rgba(201,168,76,.2);border-radius:18px;box-shadow:0 18px 40px rgba(0,0,0,.45),inset 0 1px 0 rgba(245,231,184,.14);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px)}.ln-section-title{position:relative;padding-left:12px;letter-spacing:.08em;color:#e8d28a}.ln-section-title::before{content:"";position:absolute;left:0;top:50%;transform:translateY(-50%);width:3px;height:1.05em;border-radius:2px;background:rgba(226,232,240,.85);box-shadow:0 0 8px rgba(226,232,240,.85)}.ln-q-input{background:rgba(8,7,5,.62);border:1px solid rgba(201,168,76,.26);border-radius:12px;color:#f2e9d6;transition:border-color .2s,box-shadow .2s}.ln-q-input:focus{border-color:#e8d28a;box-shadow:0 0 0 3px rgba(201,168,76,.16);outline:none}.ln-spread-btn{background:rgba(201,168,76,.06);border:1px solid rgba(201,168,76,.22);color:#d8c79a;border-radius:12px;transition:all .18s}.ln-spread-btn.active{background:linear-gradient(135deg,#e8d28a,#c9a84c);color:#171208;border-color:transparent;box-shadow:0 6px 18px rgba(201,168,76,.28);font-weight:700}.ln-spread-auto{border:1px solid rgba(232,210,138,.55);box-shadow:0 0 0 1px rgba(201,168,76,.18),0 8px 22px rgba(201,168,76,.16);border-radius:14px}.ln-draw-btn{background:linear-gradient(110deg,#8a6d2f,#e8d28a 28%,#c9a84c 52%,#f5e7b8 74%,#8a6d2f);background-size:220% 100%;animation:jyGiltFlow 5.5s linear infinite;color:#171208;border:none;border-radius:14px;font-weight:800;letter-spacing:.14em;box-shadow:0 10px 26px rgba(201,168,76,.32),inset 0 1px 0 rgba(255,255,255,.35)}.ln-draw-btn:active{transform:translateY(1px)}.ln-reset-btn{background:transparent;border:1px solid rgba(201,168,76,.34);color:#cdb87f;border-radius:12px}.ln-back{color:rgba(232,210,138,.75)}.ln-back:hover{color:#f5e7b8}.ln-card{background:linear-gradient(180deg,rgba(26,24,20,.9),rgba(15,13,10,.94));border:1px solid rgba(226,232,240,.16);border-radius:12px;box-shadow:0 10px 26px rgba(0,0,0,.5),inset 0 1px 0 rgba(245,231,184,.1)}.ln-grid-3x3{gap:10px}.ln-ai-card{background:linear-gradient(180deg,rgba(24,20,14,.78),rgba(14,12,9,.86));border:1px solid rgba(201,168,76,.2);border-radius:18px;box-shadow:0 18px 40px rgba(0,0,0,.45),inset 0 1px 0 rgba(245,231,184,.14);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px)}@media (prefers-reduced-motion:reduce){.ln-draw-btn{animation:none}}@supports not (backdrop-filter:blur(1px)){[data-jy-view-lenormand]{}}.ln-draw-btn:focus-visible{outline:2px solid #e8d28a;outline-offset:2px}';document.head.appendChild(_g2);}catch(e){}
  }
  return _lnWrap;
}

var AI_LIST = [
  {id:'chatgpt',name:'ChatGPT',url:'https://chatgpt.com/'},
  {id:'claude',name:'Claude',url:'https://claude.ai/new'},
  {id:'gemini',name:'Gemini',url:'https://gemini.google.com/app?hl=zh-TW'},
  {id:'grok',name:'Grok',url:'https://grok.x.ai/'},
  {id:'deepseek',name:'DeepSeek',url:'https://chat.deepseek.com/'},
  {id:'kimi',name:'Kimi',url:'https://kimi.moonshot.cn/'},
  {id:'doubao',name:'豆包',url:'https://www.doubao.com/'},
  {id:'metaai',name:'Meta AI',url:'https://www.meta.ai/'},
  {id:'copilot',name:'Copilot',url:'https://copilot.microsoft.com/'},
  {id:'perplexity',name:'Perplexity',url:'https://www.perplexity.ai/'}
];

function _render() {
  // v3.2 根治：重繪會銷毀並重建 textarea——任何觸發 _render 的按鈕（牌陣/指示牌/性別/未來新增）
  //   都曾或將把使用者打到一半的問題刷掉。收口在唯一入口：重建前先把現值回存 _lnQuestion，
  //   不再要求每個按鈕各自記得先存（v2.x 只有 _lnSetSpread 有存，_lnSetSig/_lnSetGender 漏了＝實測問題被清空的根因）。
  var _qNow = document.getElementById('ln-q');
  if (_qNow) _lnQuestion = _qNow.value;
  var w = _getWrap();
  var h = '<div class="ln-container">';
  h += '<a href="javascript:void(0)" class="ln-back" onclick="_lenormandClose()">← 返回靜月之光</a>';
  h += '<div class="ln-header"><h1>雷 諾 曼</h1><p>Petit Lenormand ・ 36 張</p></div>';

  if (_lnPhase === 'input') {
    // Question
    h += '<div class="ln-section"><div class="ln-section-title">✦ 你想問什麼？</div>';
    h += '<textarea class="ln-q-input" id="ln-q" rows="2" maxlength="200" placeholder="問越具體越準——例如：這份工作值得繼續嗎？">' + (_lnQuestion||'') + '</textarea></div>';
    // Spread
    h += '<div class="ln-section"><div class="ln-section-title">✦ 選擇牌陣</div><div class="ln-spread-grid">';
    var sps = [{id:'auto',n:'✦ 自動判斷',d:'依問題形狀與所需解析度選陣（推薦）'},{id:'three',n:'三張線',d:'快速是非題'},{id:'five',n:'五張線',d:'原因／方法／何時'},{id:'choice',n:'雙路比較',d:'A/B各三張'},{id:'nine',n:'九宮格',d:'單一議題全貌'},{id:'grand',n:'大牌陣',d:'全36張完整牌陣'}];
    for (var i=0;i<sps.length;i++) {
      h += '<button class="ln-spread-btn' + (sps[i].id===_lnSpread?' active':'') + (sps[i].id==='auto'?' ln-spread-auto':'') + '" onclick="_lnSetSpread(\''+sps[i].id+'\')">' + sps[i].n + '<br><span style="font-size:.6rem;opacity:.6">' + sps[i].d + '</span></button>';
    }
    h += '</div></div>';
    // v3.0：指示牌（Significator）
    h += '<div class="ln-section"><div class="ln-section-title">✦ 指示牌（代表你的牌，可選）</div>';
    h += '<div style="display:flex;flex-wrap:wrap;gap:.45rem">';
    h += '<button class="ln-spread-btn' + (_lnSignif===null?' active':'') + '" onclick="_lnSetSig(null)">不使用</button>';
    h += '<button class="ln-spread-btn' + (_lnSignif===28?' active':'') + '" onclick="_lnSetSig(28)">男士(28)</button>';
    h += '<button class="ln-spread-btn' + (_lnSignif===29?' active':'') + '" onclick="_lnSetSig(29)">女士(29)</button>';
    var _sigCustom = (_lnSignif!==null && _lnSignif!==28 && _lnSignif!==29);
    h += '<button class="ln-spread-btn' + (_sigCustom?' active':'') + '" onclick="_lnSigPickOpen()">' + (_sigCustom ? ('自選：' + _lnSignif + '.' + (CARDS[_lnSignif-1]||{}).name) : '自選一張') + '</button>';
    h += '</div>';
    h += '<div class="ln-auto-note" style="margin-top:.5rem">男士／女士代表你本人；自選任一張可作主題定位（如問財選魚34、問感情選心24）。九宮格可把指示牌置於中央，形成「現代焦點九宮格」；大牌陣會在36張中定位。三張／五張線不預置。</div></div>';
    // v3.1：性別聲明（人物牌歸屬與 GT 代表牌的權威來源；可不選）
    h += '<div class="ln-section"><div class="ln-section-title">✦ 你的性別（可選——抽到淑女/紳士時歸屬會更準）</div>';
    h += '<div style="display:flex;flex-wrap:wrap;gap:.45rem">';
    h += '<button class="ln-spread-btn' + (_lnGender===null?' active':'') + '" onclick="_lnSetGender(null)">不指定</button>';
    h += '<button class="ln-spread-btn' + (_lnGender==='male'?' active':'') + '" onclick="_lnSetGender(\'male\')">男</button>';
    h += '<button class="ln-spread-btn' + (_lnGender==='female'?' active':'') + '" onclick="_lnSetGender(\'female\')">女</button>';
    h += '</div></div>';
    h += '<button class="ln-draw-btn" onclick="_lnDoDraw()">✦ 抽 牌 ✦</button>';
  } else {
    // Results
    var sp = SPREADS[_lnResolved];
    h += '<div class="ln-section"><div class="ln-section-title">✦ ' + sp.name + '（' + sp.count + ' 張）</div>';
    if (_lnAutoPick) h += '<div class="ln-auto-note">✦ 自動判斷：' + _lnAutoPick.why + '</div>';
    if (_lnSignif) h += '<div class="ln-auto-note">✦ 指示牌：' + _lnSignif + '.' + ((CARDS[_lnSignif-1]||{}).name||'') + (_lnResolved==='nine' ? '（已置中央・現代焦點九宮格）' : _lnResolved==='grand' ? '（於36張中定位讀取）' : '（問題焦點）') + '</div>';
    if (_lnResolved === 'nine') {
      h += '<div class="ln-grid-3x3">';
    } else if (_lnResolved === 'choice') {
      h += '<div class="ln-choice-layout" style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;align-items:start">';
    } else if (_lnResolved === 'five') {
      // v3.11：固定 3+2 幾何網格。不可再交給 flex 依螢幕寬度自行換行，否則會出現 4+1 或底排偏斜。
      h += '<div class="ln-five-layout" role="group" aria-label="五張線：上排三張，下排兩張">';
    } else {
      h += '<div class="ln-cards-row">';
    }
    for (var j=0;j<_lnDrawn.length;j++) {
      var c = _lnDrawn[j];
      var imgSrc = IMG_MAP[c.id] || '';
      var _choicePos = ''; if (_lnResolved === 'choice') { if (j === 3) _choicePos='grid-column:2;grid-row:2;'; else if (j >= 4) _choicePos='grid-column:'+(j-3)+';grid-row:3;'; }
      h += '<div class="ln-card" style="'+_choicePos+'animation-delay:'+j*0.05+'s">' + (c._presetSig ? '<div style="font-size:.6rem;color:#e8d28a;letter-spacing:.12em;margin-bottom:2px">★ 指示牌</div>' : '');
      if (imgSrc) h += '<img class="ln-card-img" src="'+imgSrc+'" alt="'+c.name+'">';
      h += '<div class="ln-card-name">' + c.id + '. ' + c.name + '</div>';
      h += '<div class="ln-card-en">' + c.en + '</div></div>';
    }
    h += '</div></div>';

    // AI card
    h += '<div class="ln-ai-card"><div class="ln-ai-title">🌙 AI 深度解讀</div>';
    h += '<div class="ln-ai-desc">點擊 AI 圖示會先複製提示詞，再於新分頁直接開啟該 AI 網頁版。</div>';
    h += '<button class="ln-ai-copy-btn" onclick="_lnCopy()">✦ 一鍵複製占卜提示詞 ✦</button>';
    h += '<div class="ln-ai-grid">';
    for (var a=0;a<AI_LIST.length;a++) {
      var ai = AI_LIST[a];
      // v3.14：Gemini 改回與其它 9 個 AI 一致的 target="_blank"——v3.11/v3.13 兩次的特例（_self、
      // 同頁開啟）都已實機驗證無法解決閃退問題，繼續猜 target 不是根治，先回到唯一沒人回報過問題的寫法。
      h += '<a class="ln-ai-sc" href="'+ai.url+'" target="_blank" rel="external noopener noreferrer" onpointerdown="_lnPrimeAICopy(event,this)" onclick="_lnPrimeAICopy(event,this)" aria-label="複製提示詞並開啟 '+ai.name+' 網頁版">';
      h += '<img src="ai-icons/ai-'+ai.id+'.png" alt="'+ai.name+'">';
      h += '<span>'+ai.name+'</span></a>';
    }
    h += '</div></div>';
    h += '<div style="text-align:center;margin-top:.2rem"><button onclick="_lenormandShare()" style="padding:.72rem 1.5rem;border-radius:12px;border:1px solid rgba(201,168,76,.5);background:linear-gradient(135deg,rgba(201,168,76,.18),rgba(201,168,76,.05));color:#c9a84c;font-family:inherit;font-size:.92rem;font-weight:600;letter-spacing:1px;cursor:pointer">\uD83D\uDCE4 \u751F\u6210\u5206\u4EAB\u5361</button></div>';
    h += '<div style="text-align:center"><button class="ln-reset-btn" onclick="_lnReset()">↺ 重新抽牌</button></div>';
  }
  h += '<div class="ln-footer">靜月之光 ・ jingyue.uk<br>Petit Lenormand 雷諾曼牌</div></div>';
  w.innerHTML = h;
}

// ════ Public API ════
window._lenormandOpen = function() {
  _lnPhase = 'input';
  _lnQuestion = '';
  _lnSpread = 'auto';
  _lnResolved = 'three';
  _lnAutoPick = null;
  _lnDrawn = [];
  _lastPrompt = '';
  var w = _getWrap();
  w.style.display = 'block';
  _render();
  w.scrollTop = 0;
};

window._lenormandShare = function() {
  if (!window.JYShareCard) { alert('\u5206\u4EAB\u5143\u4EF6\u8F09\u5165\u4E2D\uFF0C\u8ACB\u7A0D\u5019\u518D\u8A66'); return; }
  var sp = SPREADS[_lnResolved] || {};
  var pos = sp.positions || [];
  var cards = (_lnDrawn || []).map(function(c, i) {
    var pl = (pos[i] || ('\u7B2C' + (i + 1) + '\u5F35'));
    pl = String(pl).split('/').pop();
    // v3.3：補傳 id/img/sig——share-card v2.0 起依牌陣張數排版並繪真牌面（img 同源資產、畫布無汙染）
    return { id: c.id, name: c.name || '', pos: pl, img: (typeof IMG_MAP !== 'undefined' && IMG_MAP[c.id]) || '', sig: !!c._presetSig };
  });
  JYShareCard.open('lenormand', {
    cardTitle: '\u6211\u7684\u96F7\u8AFE\u66FC',
    spread: (sp.name || '\u96F7\u8AFE\u66FC') + (sp.count ? '\uFF08' + sp.count + '\u5F35\uFF09' : ''),
    question: _lnQuestion || '',
    cards: cards
  });
};

window._lenormandClose = function() {
  var w = _getWrap();
  w.style.display = 'none';
};

window._lnSetSpread = function(id) {
  // v3.2：問題文字回存已收口至 _render() 入口，這裡不再各自處理
  _lnSpread = id;
  _render();
};

window._lnDoDraw = function() {
  var qEl = document.getElementById('ln-q');
  _lnQuestion = qEl ? qEl.value.trim() : '';
  if (!_lnQuestion) { alert('請先輸入一個明確問題與時間範圍。'); return; }
  // v4.0：auto 解析（手動選陣則原樣使用）
  _lnAutoPick = null;
  _lnResolved = _lnSpread;
  if (_lnSpread === 'auto') {
    var _det = _lnDetectSpread(_lnQuestion);
    if (!_det.id) { alert(_det.why || '請先輸入明確問題。'); return; }
    _lnResolved = _det.id;
    _lnAutoPick = _det;
  }
  var sp = SPREADS[_lnResolved];
  if (_lnResolved === 'grand' && !_lnSignif && !_lnGender) { alert('大牌陣必須先指定本人代表牌（男士或女士），不可由系統默認。'); return; }
  // v4.0：九宮格＋指示牌＝現代焦點九宮格；池先移除指示牌避免重複
  if (_lnResolved === 'nine' && _lnSignif) {
    shuffleDeck();
    _lnDeck = _lnDeck.filter(function (c) { return c.id !== _lnSignif; });
    var _sigCard = JSON.parse(JSON.stringify(CARDS[_lnSignif - 1]));
    _sigCard._presetSig = true;
    _lnDrawn = _lnDeck.slice(0, 8);
    _lnDrawn.splice(4, 0, _sigCard);
  } else {
    drawCards(sp.count);
  }
  if (_lnGender) _lnSigGender = _lnGender; // v3.1：聲明性別優先
  _lastPrompt = buildPrompt(_lnQuestion, _lnDrawn, _lnResolved, _lnSigGender, _lnGender);
  _lnPhase = 'result';
  _render();
  _getWrap().scrollTop = 0;
};

// v3.0：指示牌選擇
window._lnSetGender = function (g) {
  _lnGender = g;
  try { if (g) localStorage.setItem('jy_ln_gender', g); else localStorage.removeItem('jy_ln_gender'); } catch (e) {}
  _lnSigGender = g || null;
  _render();
};
window._lnSetSig = function (id) {
  _lnSignif = id;
  if (id === null && !_lnGender) _lnSigGender = null;
  if (id === 28) { _lnSigGender = 'male'; _lnGender = 'male'; try { localStorage.setItem('jy_ln_gender', 'male'); } catch (e) {} }
  if (id === 29) { _lnSigGender = 'female'; _lnGender = 'female'; try { localStorage.setItem('jy_ln_gender', 'female'); } catch (e) {} }
  var ov = document.getElementById('ln-sig-ov'); if (ov) ov.remove();
  _render();
};
window._lnSigPickOpen = function () {
  // v3.0.1：①modal 改掛進視圖容器且 z-index 100000——原掛 body z-index 9999 被 ln-screen(99999) 蓋住，
  //   實測「按了沒反應、退出畫面才跑出來」；②選牌格上真實牌面圖（IMG_MAP），無圖時退回純文字。
  var _old = document.getElementById('ln-sig-ov'); if (_old) _old.remove();
  var ov = document.createElement('div'); ov.id = 'ln-sig-ov';
  ov.style.cssText = 'position:fixed;inset:0;z-index:100000;background:rgba(8,7,5,.86);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;padding:14px';
  var bx = '<div style="max-width:560px;width:100%;max-height:82vh;overflow:auto;background:rgba(20,17,12,.97);border:1px solid rgba(201,168,76,.35);border-radius:18px;padding:14px;box-shadow:0 24px 60px rgba(0,0,0,.6)">';
  bx += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;position:sticky;top:-14px;background:rgba(20,17,12,.97);padding:6px 0;z-index:2"><b style="color:#e8d28a;letter-spacing:.1em">選擇指示牌</b><button onclick="document.getElementById(\'ln-sig-ov\').remove()" style="background:none;border:none;color:#cdb87f;font-size:1.25rem;cursor:pointer;padding:4px 8px">✕</button></div>';
  bx += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:9px">';
  for (var i = 0; i < CARDS.length; i++) {
    var c = CARDS[i];
    var _on = (_lnSignif === c.id);
    var _img = (typeof IMG_MAP !== 'undefined' && IMG_MAP[c.id]) ? IMG_MAP[c.id] : '';
    bx += '<button onclick="_lnSetSig(' + c.id + ')" style="padding:.45rem .3rem .55rem;border-radius:12px;border:1.5px solid rgba(201,168,76,' + (_on ? '.85' : '.25') + ');background:rgba(201,168,76,' + (_on ? '.14' : '.04') + ');color:#e9dec0;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:6px' + (_on ? ';box-shadow:0 0 0 1px rgba(201,168,76,.3),0 6px 16px rgba(201,168,76,.18)' : '') + '">';
    if (_img) bx += '<img src="' + _img + '" alt="' + c.name + '" loading="lazy" style="width:100%;aspect-ratio:2/3;object-fit:cover;border-radius:8px;display:block">';
    bx += '<span style="font-size:.78rem;line-height:1.2">' + c.id + '. ' + c.name + '</span></button>';
  }
  bx += '</div></div>'; ov.innerHTML = bx;
  ov.onclick = function (e) { if (e.target === ov) ov.remove(); };
  (_getWrap() || document.body).appendChild(ov);
};

// v3.14：可選診斷——預設完全不啟動，不影響任何正常使用者。網址列加上 ?lndebug=1 才會生效。
// 用途：下次歐那實機重現「點 Gemini 閃一下其他頁面又跳回」時，回到本頁會跳出 alert，
//   標示 (a) pageshow.persisted（true＝瀏覽器真的離開過、靠 bfcache 瞬間還原，屬本頁可診斷範圍）
//   (b) 距離點擊的毫秒數。若 persisted 為 false 或事件根本沒觸發，代表文件其實沒被瀏覽器卸載過，
//   就更指向 Android 對 gemini.google.com 的 App Link/Intent 攔截（非本頁 JS 可控，需在手機
//   設定關閉 Gemini App 的「預設開啟連結」來驗證並繞過）。看到結果後判斷下一步，不在這裡先猜答案。
var _lnDebug = false;
try { _lnDebug = /(^|[?&])lndebug=1(&|$)/.test(location.search || ''); } catch (e) {}
if (_lnDebug) {
  try {
    window.addEventListener('pageshow', function (ev) {
      var lastClick = Number(sessionStorage.getItem('jy_ln_dbg_click') || 0);
      var delta = lastClick ? (Date.now() - lastClick) : null;
      if (delta !== null && delta >= 0 && delta < 20000) {
        alert('[lndebug] 返回本頁\nbfcache 還原(persisted)：' + ev.persisted +
          '\n距上次點 AI 圖示：' + delta + 'ms\ndocument.referrer：' + (document.referrer || '(無)'));
      }
    });
  } catch (e) {}
}

// v3.11：剪貼簿唯一入口。Clipboard API 在安全來源優先；舊瀏覽器才使用同步 textarea 後備。
// 注意：AI 網頁導覽由真實 <a href> 的預設行為負責，這裡絕不 window.open、location.href 或 _render。
function _lnLegacyCopy(text) {
  var ta = null;
  try {
    ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.setAttribute('aria-hidden', 'true');
    ta.style.cssText = 'position:fixed;top:0;left:-9999px;width:1px;height:1px;opacity:0;font-size:16px;pointer-events:none';
    document.body.appendChild(ta);
    try { ta.focus({ preventScroll: true }); } catch (_focusErr) { ta.focus(); }
    ta.select();
    ta.setSelectionRange(0, ta.value.length);
    return !!document.execCommand('copy');
  } catch (e) {
    return false;
  } finally {
    if (ta && ta.parentNode) ta.parentNode.removeChild(ta);
  }
}

function _lnWriteClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      return navigator.clipboard.writeText(text).then(function () { return true; }).catch(function () {
        return _lnLegacyCopy(text);
      });
    } catch (e) {}
  }
  return Promise.resolve(_lnLegacyCopy(text));
}

window._lnCopy = function() {
  if (!_lastPrompt) return false;
  var btn = document.querySelector('.ln-ai-copy-btn');
  var original = btn ? btn.innerHTML : '';
  _lnWriteClipboard(_lastPrompt).then(function(ok){
    if (!btn) return;
    btn.innerHTML = ok ? '✓ 已複製！貼到 AI 送出即可' : '複製失敗，請長按提示詞複製';
    btn.style.borderColor = ok ? 'rgba(52,211,153,.5)' : 'rgba(248,113,113,.65)';
    setTimeout(function(){
      if (!btn.isConnected) return;
      btn.innerHTML = original;
      btn.style.borderColor = '';
    }, 2500);
  });
  return false;
};

window._lnPrimeAICopy = function(ev, link) {
  if (!_lastPrompt || !link) return;

  // v3.14：診斷時間戳，僅 ?lndebug=1 時寫入，供 pageshow 比對「點擊到返回」經過多久。
  if (_lnDebug) { try { sessionStorage.setItem('jy_ln_dbg_click', String(Date.now())); } catch (e) {} }

  // pointerdown 與 click 會連續觸發，短時間只複製一次。
  var now = Date.now();
  var last = Number(link.getAttribute('data-ln-copy-at') || 0);
  if (now - last < 700) return;
  link.setAttribute('data-ln-copy-at', String(now));

  // 僅同步複製。禁止 preventDefault／stopPropagation／return false；
  // 連結導覽完全由真實 <a href> 的瀏覽器預設行為執行。
  var copied = _lnLegacyCopy(_lastPrompt);
  if (!copied && navigator.clipboard && window.isSecureContext) {
    try { navigator.clipboard.writeText(_lastPrompt).catch(function(){}); } catch (e) {}
  }

  var label = link.querySelector('span');
  if (label && copied) {
    var original = link.getAttribute('data-ln-label') || label.textContent;
    link.setAttribute('data-ln-label', original);
    label.textContent = '已複製';
    setTimeout(function(){ if (label.isConnected) label.textContent = original; }, 1800);
  }
};
window._lnReset = function() {
  _lnPhase = 'input';
  _render();
  _getWrap().scrollTop = 0;
};

})();
