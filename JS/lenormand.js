// ═══════════════════════════════════════
// 靜月之光 — 雷諾曼牌 Lenormand v6.0（通用問題契約／選陣根治版）
// v6.0(2026/7/14)：根治「問一題補一題」的架構病根。
//   ①選陣改為最小充分解析度：雙路決策→7張；多領域全景→36張；單一議題3+面向→9張；內心/原因/方法/時間→5張；可觀察單一是非→3張。
//   ②問題先拆成主體、事件核心、必要限定、場域、期限與回答面向；原問句完整語意永遠高於關鍵字摘要。
//   ③新增複合命題完整性：只支持部分條件不得回答整題為有；互不相接的牌線不得拼成同一事實。
//   ④新增通用是非裁決尺標、他人內心降格表述、醫療診斷/犯罪認定/精確個資等不可稽核問題前置攔截。
//   ⑤九宮格改為「最多3條主要線＋1條核對線」，不再固定先讀全部中心線；合併證據必須有實際交會。
//   ⑥大牌陣改為最多4類定位牌＋證據層級＋最短相關線＋連通證據圖，禁止36張中分散挑牌湊故事。
//   ⑦同事件的結果/原因/方法/時間可合併；不同事件必須拆盤。三個以上選項、精確年齡/日期/金額/機率仍前置攔截。
// v5.0(2026/7/14)：根治五套牌陣的選陣、合法組合、人物定位與輸出衝突。
//   ①36張牌義由「順勢／受阻」改成單一可用語義範圍＋使用限制，避免變相正逆位與單張定論。
//   ②三張、五張、雙路、九宮格、大牌陣各自使用封閉合法組合；禁止鏡像、跳牌、跨支線與跨末排假鄰接。
//   ③問題驗證前置：精確歲數／日期／金額／百分比／個資與兩個獨立問題，抽牌前直接攔截並要求改問。
//   ④自動與手動選陣共用同一適配檢查；明確指定錯誤牌陣也不能繞過限制。
//   ⑤大牌陣的人物代表與自選議題牌分離；自選非人物牌不能冒充問卜者，也不能解除人物牌必選條件。
//   ⑥大牌陣輸出全牌座標、本人牌與預選議題牌的實際鄰牌，降低AI看錯位置或虛構連線。
//   ⑦保留固定蝦皮品牌收尾，但明示為廣告附加層，不得反向改寫占卜結論。
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
console.log('[Lenormand] 靜月之光 雷諾曼牌 v6.0 loaded — universal question contract + evidence graph routing');

// ════════════════════════════════════
// 一、36 張牌完整數據
// ════════════════════════════════════
var CARDS = [
  {id:1,  name:'騎士',  en:'Rider',      key:'消息・到來・速度',       scope:'消息、來訪、到來、快速移動、推進',                    guard:'消息好壞由相鄰牌決定；沒有圖像朝向資料時不判斷來向。'},
  {id:2,  name:'幸運草',en:'Clover',     key:'短暫機會・小幸運',       scope:'短暫機會、小幅有利、輕鬆、偶然、時間短',                guard:'機會通常有限或短暫，不等於長期保證。'},
  {id:3,  name:'船',    en:'Ship',       key:'遠方・移動・貿易',       scope:'遠方、旅行、移動、貿易、拓展、距離',                    guard:'是否延遲或順利必須由相鄰牌決定。'},
  {id:4,  name:'房屋',  en:'House',      key:'家庭・住處・根基',       scope:'家庭、住處、私人領域、根基、穩定結構、房產',             guard:'不自動等同婚姻或一定安全。'},
  {id:5,  name:'大樹',  en:'Tree',       key:'健康・生命・長期',       scope:'健康、身體、生命力、根源、成長、長期累積',               guard:'健康題只能談牌面傾向與就醫提醒，不作診斷。'},
  {id:6,  name:'雲',    en:'Clouds',     key:'混亂・不確定・遮蔽',     scope:'混亂、不確定、資訊模糊、看不清、反覆',                  guard:'只有牌組提供明暗面方向資料時，才可判斷哪一側較清晰；本系統未提供時禁止使用。'},
  {id:7,  name:'蛇',    en:'Snake',      key:'複雜・繞路・策略',       scope:'複雜、繞路、策略、誘惑、戒心、欺瞞風險',                 guard:'不自動等於第三者、壞女人或背叛；必須有問題脈絡與連線支持。'},
  {id:8,  name:'棺材',  en:'Coffin',     key:'結束・停擺・封閉',       scope:'結束、終止、停擺、封閉、失去、無法繼續',                guard:'不可為了好聽把結束改寫成必然重生或轉機。'},
  {id:9,  name:'花束',  en:'Bouquet',    key:'邀請・禮物・愉悅',       scope:'邀請、禮物、讚美、愉悅、吸引力、禮貌',                  guard:'不自動等於長期承諾。'},
  {id:10, name:'鐮刀',  en:'Scythe',     key:'突然切斷・決斷・風險',   scope:'突然切斷、快速決定、分離、收割、尖銳風險',               guard:'沒有牌面刀刃朝向資料時，不判斷切向哪一張牌。'},
  {id:11, name:'鞭子',  en:'Whip',       key:'重複・摩擦・衝突',       scope:'重複、摩擦、爭論、壓力、訓練、反覆行為',                 guard:'只有親密或性問題脈絡明確時，才可讀成性行為或性張力。'},
  {id:12, name:'鳥',    en:'Birds',      key:'對話・焦慮・短暫騷動',   scope:'對話、交換、電話、焦慮、八卦、成雙、短暫騷動',           guard:'不自動等於正式承諾或確定消息。'},
  {id:13, name:'孩子',  en:'Child',      key:'小・新・初階',           scope:'小、新開始、初學、孩子、單純、規模小、不成熟',            guard:'不自動推定懷孕或實際兒童，除非問題與連線支持。'},
  {id:14, name:'狐狸',  en:'Fox',        key:'自保・策略・工作風險',   scope:'自保、策略、警覺、自利、欺瞞風險；工作題可指任務或職務', guard:'不論任何題型都不可單張直接判定詐騙或犯罪。'},
  {id:15, name:'熊',    en:'Bear',       key:'力量・權威・資源',       scope:'力量、保護、權威、資源、財力、控制、佔有',               guard:'依問題判斷是資源、主管、保護者或控制，不可全部同時套用。'},
  {id:16, name:'星星',  en:'Stars',      key:'方向・清晰・希望',       scope:'方向、清晰、希望、指引、長程規劃、網絡',                 guard:'只有問題本身涉及數位平台或網路時，才可具體讀成線上管道。'},
  {id:17, name:'鸛',    en:'Stork',      key:'改變・遷移・轉換',       scope:'改變、遷移、轉換、調整、改善或不穩定',                  guard:'是否改善由相鄰牌決定；不自動推定懷孕。'},
  {id:18, name:'狗',    en:'Dog',        key:'朋友・忠誠・支持',       scope:'朋友、忠誠、信任、支持、熟人、依賴',                    guard:'不自動等於戀愛對象。'},
  {id:19, name:'塔',    en:'Tower',      key:'機構・權威・分隔',       scope:'機構、官方、公司、權威、獨立、距離、孤立、界線',          guard:'依問題與相鄰牌判斷是獨立、制度還是隔離。'},
  {id:20, name:'花園',  en:'Garden',     key:'公開・社交・群體',       scope:'公開場合、社交、群體、活動、曝光、觀眾、名聲',            guard:'不自動等於網路；只有問題脈絡支持時才可延伸為公開平台。'},
  {id:21, name:'山',    en:'Mountain',   key:'阻礙・封鎖・延遲',       scope:'阻礙、封鎖、延遲、距離、難以跨越、抗拒',                 guard:'除非問題本身詢問防守或固定不動，否則不可淡化成單純穩固。'},
  {id:22, name:'十字路口',en:'Crossroads',key:'選擇・分岔・猶豫',     scope:'選擇、替代方案、分岔、自由、猶豫、方向不一',              guard:'不自動代表多個對象，除非問題與連線支持。'},
  {id:23, name:'老鼠',  en:'Mice',       key:'消耗・流失・焦慮',       scope:'消耗、流失、侵蝕、減少、焦慮、細小損耗',                 guard:'不單張指控偷竊；犯罪只能描述可觀察風險。'},
  {id:24, name:'心',    en:'Heart',      key:'愛・喜歡・熱情',         scope:'愛、喜歡、熱情、情感投入、愉悅、欲望',                  guard:'不自動等於承諾、婚姻或關係穩定。'},
  {id:25, name:'戒指',  en:'Ring',       key:'承諾・協議・循環',       scope:'承諾、協議、合約、關係、循環、重複',                    guard:'承諾是否公平、持久或會結束由相鄰牌決定。'},
  {id:26, name:'書',    en:'Book',       key:'未知・秘密・知識',       scope:'未知、秘密、尚未揭露、知識、學習、紀錄',                 guard:'不單張推定秘密一定揭露，也不捏造秘密內容。'},
  {id:27, name:'信',    en:'Letter',     key:'文字・文件・通知',       scope:'文字訊息、文件、通知、紀錄、書面往來',                  guard:'消息好壞由相鄰牌決定；不自動等於合約成立。'},
  {id:28, name:'紳士',  en:'Man',        key:'男性人物・男性指示牌',   scope:'男性問卜者、明確指定的男性、或牌面中的重要男性',          guard:'角色須由性別聲明、預先指定與問題脈絡決定；不因單張推定成熟度。'},
  {id:29, name:'淑女',  en:'Woman',      key:'女性人物・女性指示牌',   scope:'女性問卜者、明確指定的女性、或牌面中的重要女性',          guard:'角色須由性別聲明、預先指定與問題脈絡決定；不因單張推定成熟度。'},
  {id:30, name:'百合',  en:'Lily',       key:'成熟・和平・倫理',       scope:'成熟、和平、和諧、長者、倫理、冷靜；親密題可指性',         guard:'只有親密問題脈絡明確時才讀性；不以牌號換算年齡。'},
  {id:31, name:'太陽',  en:'Sun',        key:'成功・活力・可見',       scope:'成功、活力、信心、清楚、曝光、熱度、成果',               guard:'不等於任何具體事件必然成功，仍須服從整條組合。'},
  {id:32, name:'月亮',  en:'Moon',       key:'情緒・認可・名聲',       scope:'情緒、認可、名聲、創意、週期、感受',                    guard:'不讀塔羅式潛意識，也不單張判定幻想或欺騙。'},
  {id:33, name:'鑰匙',  en:'Key',        key:'重要・確定・解法',       scope:'重要、確定、解法、開啟、關鍵條件、可行性',               guard:'確定的是相鄰組合所指內容，不可跳過中間牌。'},
  {id:34, name:'魚',    en:'Fish',       key:'金錢・生意・流動',       scope:'金錢、生意、交易、流動、資源、數量、自由',               guard:'不以牌號或單張推算精確金額。'},
  {id:35, name:'錨',    en:'Anchor',     key:'穩定・持續・工作',       scope:'穩定、持續、工作、長期、固定、停滯、執著',               guard:'是穩定還是卡住，由相鄰牌與問句決定。'},
  {id:36, name:'十字架',en:'Cross',      key:'負擔・痛苦・責任',       scope:'負擔、痛苦、責任、考驗、信仰、不得不承受',               guard:'不自動宣稱命中注定或不可改變。'}
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
    desc:'現代短線讀法。只處理一個明確命題；讀1-2、2-3與完整三張句，不預設過去／現在／未來。',
    positions:['第1張','第2張','第3張']
  },
  five: { id:'five', name:'五張線', en:'Five-Card Line', count:5,
    desc:'現代長線讀法。適合原因、方法、態度、階段與發展；只讀連續相鄰組合，第3張作閱讀焦點。',
    positions:['第1張','第2張','第3張','第4張','第5張']
  },
  choice: { id:'choice', name:'雙路比較', en:'Two-Path Comparison', count:7,
    desc:'現代對稱比較。A與B各三張，第4張只作共同背景／決勝條件；兩條支線禁止互相修飾。',
    positions:['A1','A2','A3','共同背景','B1','B2','B3'],
    layout:'choice'
  },
  nine: { id:'nine', name:'九宮格', en:'Nine-Card Box (3×3)', count:9,
    desc:'現代九張方陣。中心聚焦，只讀三排、三列與兩條主要斜線中的相鄰組合；不預設時間或心理牌位。',
    positions:['第1格','第2格','第3格','第4格','中心','第6格','第7格','第8格','第9格'],
    layout:'3x3'
  },
  grand: { id:'grand', name:'大牌陣', en:'Grand Tableau', count:36,
    desc:'36張全牌陣。採可考的4×8＋末排4張版式；先從本人牌附近敘事，再以問題相關牌定位。額外技法不混用。',
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
// ── v6.0 問題→牌陣：最小充分解析度＋提示詞內語意二次檢查 ──
function _lnLocalISODate() {
  var d = new Date();
  var p = function(n){ return String(n).padStart(2, '0'); };
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
}

function _lnCleanChoiceOption(s) {
  return String(s || '')
    .replace(/[？?。！!；;]+$/g, '')
    .replace(/^(?:我)?(?:到底)?(?:該|要|應該|選擇|選|考慮)\s*/g, '')
    .replace(/(?:哪一個|哪個)?(?:比較|較)?(?:適合(?:我)?|好|有利|值得)(?:我)?\s*$/g, '')
    .trim();
}

var _LN_DOMAIN_SPECS = [
  {id:'relationship', label:'感情／關係', re:/感情|戀愛|喜歡|愛情|愛我|暗戀|桃花|曖昧|復合|分手|婚姻|伴侶|肉體|性關係|約會|對象|第三者|外遇|出軌/},
  {id:'work', label:'工作／職場', re:/工作|職場|職涯|上班|離職|轉職|面試|錄取|升遷|主管|同事|公司|部門|專案|生意|創業|副業|職務|任務/},
  {id:'finance', label:'金錢／財務', re:/財運|金錢|收入|薪水|投資|股票|基金|貸款|買房|賣房|訂單|營業額|營收|業績|獲利|虧損|價格/},
  {id:'health', label:'健康／身體', re:/健康|身體|疾病|生病|手術|睡眠|疼痛|懷孕|症狀|就醫|治療/},
  {id:'family', label:'家庭／居所', re:/家庭|家人|父母|子女|小孩|住家|住處|搬家|房子|家中/},
  {id:'travel', label:'旅行／移動', re:/旅行|出國|旅遊|行程|移民|搬遷|遠行|出差/},
  {id:'legal', label:'法律／契約', re:/官司|法律|合約|訴訟|簽約|違約|賠償|法院|仲裁/},
  {id:'study', label:'學習／考試', re:/考試|升學|學業|學習|證照|錄取學校|成績|研究所/}
];

function _lnUnique(arr) {
  var out = [];
  (arr || []).forEach(function(v){ if (out.indexOf(v) < 0) out.push(v); });
  return out;
}

function _lnDomainTags(text) {
  var tags = [];
  _LN_DOMAIN_SPECS.forEach(function(d){ if (d.re.test(String(text || ''))) tags.push(d.id); });
  return tags;
}

function _lnHasOverlap(a, b) {
  for (var i = 0; i < a.length; i++) if (b.indexOf(a[i]) >= 0) return true;
  return false;
}

function _lnCountMatches(text, re) {
  var m = String(text || '').match(re);
  return m ? m.length : 0;
}

function _lnAnalyzeQuestion(q) {
  q = String(q || '').trim();
  var compact = q.replace(/\s+/g, '');
  var parts = q.split(/[？?；;\n]+/).map(function(s){ return s.trim(); }).filter(Boolean);
  var domainTags = _lnDomainTags(q);
  var domainHits = domainTags.length;
  var clauseDomains = parts.map(_lnDomainTags);

  var asksWhen = /什麼時候|幾時|何時|多久|還要等|等多久|哪一週|幾週|哪個月|幾個月|幾年|應期|多快|多晚|何日/.test(q);
  var asksExactDate = /哪一天|哪天發生|幾月幾日|確切日期|確切時間|幾號|幾點|幾分/.test(q);
  var hasFixedHorizon = /今天|明天|後天|本週|這週|下週|本月|這月|這個月|下個月|今年|明年|年底前|月底前|週內|月內|年內|近期|最近|\d+\s*(?:天|週|個月|月|年)內|\d{4}[\/-]\d{1,2}(?:[\/-]\d{1,2})?/.test(q);
  var asksWhy = /為什麼|為何|什麼原因|原因是|根源|問題出在|怎麼會|怎麼回事|卡在哪|阻礙在哪|障礙在哪/.test(q);
  var asksHow = /怎麼辦|如何做|怎麼做|怎樣做|怎麼改善|如何改善|怎麼準備|如何準備|方法|策略|建議|下一步|該如何|如何處理|怎麼處理/.test(q);
  var asksInner = /怎麼想|想法|心裡|內心|意圖|打算|真心|喜不喜歡|愛不愛|愛我|喜歡我|在不在乎|是否隱瞞|有沒有隱瞞|是否可信|可信嗎|值得信任|誠不誠實|態度|暗戀|秘密喜歡|對我有沒有意思|對我有意思嗎/.test(q);
  var isHiddenClaim = /暗戀|秘密|暗中|隱瞞|沒說|未公開|真心|背著|外遇|出軌|第三者|欺騙/.test(q);
  var asksExactAge = /幾歲|歲數|年齡(?:是多少|多大|大約多少|約多少)?|幾年次|出生年|出生年月|生日/.test(q);
  var asksWho = /是誰|有誰|誰在|哪一位|哪個人|哪個同事|哪名|具體是誰/.test(q);
  var asksExactIdentity = asksWho || /叫什麼名字|姓名是什麼|真實姓名|住哪裡|詳細地址|電話號碼|手機號碼|帳號是什麼|身分證|身份證/.test(q);
  var asksExactAmount = /賺多少(?:錢)?|收入多少|營業額多少|營收多少|業績多少|金額多少|多少元|多少塊|確切金額|價格是多少/.test(q);
  var asksProbability = /百分之幾|幾成機率|機率多少|概率多少|成功率多少/.test(q);
  var asksPersonProfile = /外貌|長相|身高|體型|職業|做什麼工作|哪裡人|個性|性格|特徵|類型|年輕|同齡|成熟|年長|年紀|相處模式/.test(q);
  var profileTraitCount = [
    /外貌|長相|身高|體型/.test(q),
    /職業|做什麼工作/.test(q),
    /個性|性格|相處模式/.test(q),
    /年輕|同齡|成熟|年長|年紀/.test(q),
    /哪裡人|地區|背景/.test(q)
  ].filter(Boolean).length;
  var aspectTermCount = [
    /來源|起因|根源/.test(q),
    /優勢|助力|有利/.test(q),
    /風險|阻礙|障礙|代價/.test(q),
    /結果|走向|發展|後續/.test(q),
    /方法|策略|建議|下一步/.test(q),
    /時間|何時|多久/.test(q)
  ].filter(Boolean).length;
  var asksOverview = /整體|全貌|走向|發展如何|近況|趨勢|接下來.*如何|未來.*如何|有哪些影響|助力.*阻力|阻力.*結果|來源.*阻礙.*結果|各方面|全面/.test(q) || aspectTermCount >= 3;
  var globalCue = /人生全貌|整體人生|所有面向|全部領域|全年整體|年度總運|未來一年整體|通盤|全局|人生各方面/.test(q);

  var hasListConnector = /、|，|,|以及|並且|同時|和|跟|與|及/.test(q);
  var domainEnumeration = domainHits >= 2 && hasListConnector;
  var workFinanceCoupled = domainHits === 2 && domainTags.indexOf('work') >= 0 && domainTags.indexOf('finance') >= 0 && /副業|生意|營業額|營收|業績|收入|訂單|獲利|薪水/.test(q);
  var broadAcrossDomains = domainEnumeration && /整體|如何|怎樣|順利|順不順|運勢|狀況|發展|趨勢|今年|明年|未來一年/.test(q);
  var isGlobal = globalCue || (domainEnumeration && !workFinanceCoupled && broadAcrossDomains) || (domainHits >= 3 && asksOverview);

  var explicitAB = /(?:^|\s)A\s*(?:還是|或|或者|或是|跟|與|和|vs\.?|VS\.?)\s*B(?:\s|$|哪|比)/i.test(q) || /選項\s*A.*選項\s*B/i.test(q);
  var binaryDecisionMatch = q.match(/^(?:我|我們)?(?:到底)?(?:該不該|應不應該|要不要|值不值得|適不適合)\s*(.+?)(?:[？?]|$)/);
  var explicitChoiceCue = /二選一|二擇一|兩個選項|比較.*(?:和|跟|與|及|還是|或者|或是)|選哪|哪一個比較|哪個比較|哪條路|何者較/.test(q);
  var actionAlternativeCue = /留職|離職|轉職|去[^？?]*還是|搬|買|賣|接受|拒絕|留下|離開|交往|分手|復合|投資|創業|發展/.test(q);
  var altConnectorCount = _lnCountMatches(q, /還是|或者|或是|或|、/g);
  var moreThanTwoOptions = /A.*B.*C/i.test(q) || /三個選項|三選一|三擇一/.test(q) || altConnectorCount >= 2 && /哪個|選|比較/.test(q);
  var incompleteChoice = /(?:還是|或者|或是|或|和|跟|與)\s*[？?]?\s*$/.test(q) || /^\s*(?:還是|或者|或是)\s*/.test(q);
  var explicitPairMatch = q.match(/(.+?)(?:還是|或者|或是|或|和|跟|與)(.+?)(?:[？?]|$)/);
  var isChoice = !moreThanTwoOptions && (explicitAB || !!binaryDecisionMatch || (explicitPairMatch && (explicitChoiceCue || actionAlternativeCue)));
  var choiceA = null, choiceB = null;
  if (binaryDecisionMatch) {
    var action = _lnCleanChoiceOption(binaryDecisionMatch[1]);
    choiceA = action;
    choiceB = action ? ('不' + action) : null;
  } else if (isChoice && explicitPairMatch) {
    choiceA = _lnCleanChoiceOption(explicitPairMatch[1]);
    choiceB = _lnCleanChoiceOption(explicitPairMatch[2]);
  } else if (isChoice && explicitAB) {
    choiceA = '選項A'; choiceB = '選項B';
  }

  var yesNoPartRe = /嗎\s*$|^(?:會不會|有沒有|能不能|可不可以|是不是|是否|要不要|該不該|應不應該|適不適合|值不值得|行不行|成不成|愛不愛|喜不喜歡)/;
  var partYesNoCount = parts.reduce(function(n, s){ return n + (yesNoPartRe.test(s.replace(/\s+/g,'')) ? 1 : 0); }, 0);
  var isYesNo = partYesNoCount > 0 || /嗎[？?]?\s*$/.test(compact) || /^(?:會不會|有沒有|能不能|可不可以|是不是|是否|愛不愛|喜不喜歡)/.test(compact) || /(?:會|有|能|愛|喜歡).+還是(?:不|沒有|不能)/.test(compact);

  var isConditionalProfileBundle = asksPersonProfile && /(?:若|如果|假如).*(?:有|會|出現|發生)|(?:若有|如果有|若會|如果會)/.test(q);
  var linkedFollowUp = /^(?:那|又|並且|以及|另外)?(?:為什麼|原因|阻礙|障礙|卡在哪|怎麼|如何|何時|什麼時候|多久|結果|走向|後續|若有|如果有|他|她|對方|這件事|這段|該怎麼)/;
  var clausesLinked = true;
  if (parts.length > 1) {
    for (var ci = 1; ci < parts.length; ci++) {
      var prevTags = clauseDomains[ci - 1], curTags = clauseDomains[ci];
      var linked = linkedFollowUp.test(parts[ci]) || !curTags.length || !prevTags.length || _lnHasOverlap(prevTags, curTags);
      if (!linked) { clausesLinked = false; break; }
    }
  }
  var independentMulti = parts.length >= 2 && !isChoice && !clausesLinked;
  if (!independentMulti && domainEnumeration && !isGlobal && !workFinanceCoupled && !asksOverview) independentMulti = true;

  var linkedDiagnosticBundle = parts.length <= 3 && clausesLinked && (asksWhy || asksHow) && !asksPersonProfile;
  var linkedTimingBundle = parts.length <= 3 && clausesLinked && asksWhen;
  var multiPart = parts.length >= 2 || /(?:以及|另外|還有|同時)/.test(q);

  var asksThreshold = /破\s*(?:\d|[一二三四五六七八九十百千萬兩])|超過\s*(?:\d|[一二三四五六七八九十百千萬兩])|達到\s*(?:\d|[一二三四五六七八九十百千萬兩])|至少\s*(?:\d|[一二三四五六七八九十百千萬兩])|高於\s*(?:\d|[一二三四五六七八九十百千萬兩])|低於\s*(?:\d|[一二三四五六七八九十百千萬兩])|門檻/.test(q);
  var companyContext = /公司|職場|同事|上班|主管|老闆|部門|工作場所/.test(q);
  var explicitPerson = /他|她|對方|異性|男性|女性|男生|女生|某人|同事|主管|老闆|伴侶|前任/.test(q);
  var physicalQualifier = /肉體|性關係|發生關係|上床|親密接觸|性行為/.test(q);
  var commitmentQualifier = /承諾|交往|結婚|婚姻|復合|簽約|錄取|合作成立/.test(q);
  var publicOnlineQualifier = /公開|社群|網路|線上|平台|蝦皮|社交場合/.test(q);
  var thirdPartyQualifier = /第三者|外遇|出軌|劈腿/.test(q);

  var claimQualifiers = [];
  if (hasFixedHorizon) claimQualifiers.push('固定期限');
  if (asksInner || isHiddenClaim) claimQualifiers.push('未公開／內心狀態');
  if (companyContext) claimQualifiers.push('公司／職場場域');
  if (explicitPerson) claimQualifiers.push('指定人物或性別條件');
  if (physicalQualifier) claimQualifiers.push('肉體／實際親密接觸');
  if (asksThreshold) claimQualifiers.push('問句明示門檻');
  if (commitmentQualifier) claimQualifiers.push('承諾／關係成立條件');
  if (publicOnlineQualifier) claimQualifiers.push('公開／線上場域');
  if (thirdPartyQualifier) claimQualifiers.push('第三者限定');
  claimQualifiers = _lnUnique(claimQualifiers);

  var medicalDiagnosis = /(?:我|他|她|對方).*(?:是不是|是否|有沒有|會不會).*(?:癌症|腫瘤|懷孕|流產|精神病|憂鬱症|躁鬱症|傳染病|重病)|(?:我|他|她)?懷孕(?:了)?嗎|是不是懷孕/.test(q);
  var fatalityQuestion = /會不會死|何時死|幾歲死|壽命多久|死期/.test(q);
  var criminalFact = /(?:是不是|是否|有沒有).*(?:偷竊|偷我|詐騙|下毒|犯罪|犯法|性侵|侵占)|(?:他|她|對方).*(?:偷了|騙了|下毒)/.test(q);
  var directLegalLiability = /(?:是不是|是否|有沒有).*(?:違法|有罪|犯罪成立)|會不會被判刑/.test(q);

  var facetCount = 1;
  if (asksWhy) facetCount++;
  if (asksHow) facetCount++;
  if (asksWhen) facetCount++;
  if (asksInner || isHiddenClaim) facetCount++;
  if (asksPersonProfile) facetCount += profileTraitCount >= 2 ? 2 : 1;
  if (asksOverview) facetCount = Math.max(facetCount, 3);
  if (isConditionalProfileBundle) facetCount = Math.max(facetCount, 3);

  var questionShape = '一般單一議題';
  if (isChoice) questionShape = '雙路決策比較';
  else if (isGlobal) questionShape = '多領域／全景問題';
  else if (asksOverview || facetCount >= 3) questionShape = '單一議題多面向全貌';
  else if (asksInner || isHiddenClaim) questionShape = '他人內心／未公開狀態';
  else if (asksWhy || asksHow || asksWhen) questionShape = '原因／方法／時間流程';
  else if (isYesNo) questionShape = '單一可裁決命題';

  return {
    q:q,
    compact:compact,
    parts:parts,
    empty:!q,
    domainTags:domainTags,
    domainHits:domainHits,
    clauseDomains:clauseDomains,
    domainEnumeration:domainEnumeration,
    workFinanceCoupled:workFinanceCoupled,
    isChoice:isChoice,
    choiceA:choiceA,
    choiceB:choiceB,
    moreThanTwoOptions:moreThanTwoOptions,
    incompleteChoice:incompleteChoice,
    asksWhen:asksWhen,
    asksExactDate:asksExactDate,
    hasFixedHorizon:hasFixedHorizon,
    asksWhy:asksWhy,
    asksHow:asksHow,
    isYesNo:isYesNo,
    partYesNoCount:partYesNoCount,
    isInner:asksInner,
    isHiddenClaim:isHiddenClaim,
    asksExactAge:asksExactAge,
    asksExactIdentity:asksExactIdentity,
    asksExactAmount:asksExactAmount,
    asksProbability:asksProbability,
    asksPersonProfile:asksPersonProfile,
    profileTraitCount:profileTraitCount,
    isConditionalProfileBundle:isConditionalProfileBundle,
    isOverview:asksOverview,
    isGlobal:isGlobal,
    multiPart:multiPart,
    independentMulti:independentMulti,
    linkedDiagnosticBundle:linkedDiagnosticBundle,
    linkedTimingBundle:linkedTimingBundle,
    clausesLinked:clausesLinked,
    asksThreshold:asksThreshold,
    companyContext:companyContext,
    explicitPerson:explicitPerson,
    physicalQualifier:physicalQualifier,
    commitmentQualifier:commitmentQualifier,
    publicOnlineQualifier:publicOnlineQualifier,
    thirdPartyQualifier:thirdPartyQualifier,
    claimQualifiers:claimQualifiers,
    medicalDiagnosis:medicalDiagnosis,
    fatalityQuestion:fatalityQuestion,
    criminalFact:criminalFact,
    directLegalLiability:directLegalLiability,
    facetCount:facetCount,
    questionShape:questionShape,
    isSensitiveHidden:asksInner || isHiddenClaim || thirdPartyQualifier
  };
}

function _lnPersonRepId(declaredGender) {
  if (declaredGender === 'male') return 28;
  if (declaredGender === 'female') return 29;
  if (_lnSignif === 28 || _lnSignif === 29) return _lnSignif;
  return null;
}

function _lnCustomFocusId() {
  return (_lnSignif && _lnSignif !== 28 && _lnSignif !== 29) ? _lnSignif : null;
}

function _lnGrandCoord(index) {
  if (index < 0) return null;
  if (index < 32) return { zone:'main', row:Math.floor(index / 8) + 1, col:(index % 8) + 1, label:'R' + (Math.floor(index / 8) + 1) + 'C' + ((index % 8) + 1) };
  if (index < 36) return { zone:'tail', row:5, col:index - 31, label:'末排' + (index - 31) };
  return null;
}

function _lnFindCardIndex(drawn, cardId) {
  for (var i = 0; i < drawn.length; i++) if (drawn[i].id === cardId) return i;
  return -1;
}

function _lnGrandImmediateNeighbors(drawn, index) {
  var out = [];
  if (index < 0 || index >= drawn.length) return out;
  if (index >= 32) {
    if (index > 32) out.push({dir:'左', index:index - 1, card:drawn[index - 1]});
    if (index < 35) out.push({dir:'右', index:index + 1, card:drawn[index + 1]});
    return out;
  }
  var r = Math.floor(index / 8), c = index % 8;
  var dirs = [
    [-1,-1,'左上'],[-1,0,'上'],[-1,1,'右上'],
    [0,-1,'左'],[0,1,'右'],
    [1,-1,'左下'],[1,0,'下'],[1,1,'右下']
  ];
  dirs.forEach(function(d){
    var rr=r+d[0], cc=c+d[1];
    if (rr>=0 && rr<4 && cc>=0 && cc<8) {
      var idx=rr*8+cc;
      out.push({dir:d[2], index:idx, card:drawn[idx]});
    }
  });
  return out;
}

function _lnGrandNeighborText(drawn, index) {
  var ns = _lnGrandImmediateNeighbors(drawn, index);
  if (!ns.length) return '無';
  return ns.map(function(n){ return n.dir + '＝' + (n.index + 1) + '.' + n.card.name; }).join('；');
}

function _lnValidateQuestion(q) {
  var x = _lnAnalyzeQuestion(q);
  if (x.empty) return { ok:false, code:'EMPTY', reason:'請先輸入一個明確問題。' };
  if (x.fatalityQuestion) return {
    ok:false, code:'FATALITY',
    reason:'小雷諾曼不能可靠判定死亡時間、壽命或死期。請改問目前可觀察的健康風險與可採取的照護行動。'
  };
  if (x.medicalDiagnosis) return {
    ok:false, code:'DIAGNOSIS',
    reason:'這是需要檢驗或專業評估的醫療診斷／懷孕確認，不能用牌面代替。可改問「面對目前健康疑慮，我應優先注意什麼可觀察狀況？」。'
  };
  if (x.criminalFact || x.directLegalLiability) return {
    ok:false, code:'ALLEGATION',
    reason:'牌面不能認定他人犯罪、違法或法律責任。可改問「這段互動有哪些可觀察風險，需要保留哪些證據或尋求何種專業協助？」。'
  };
  if (x.asksExactAge) return {
    ok:false, code:'EXACT_AGE',
    reason:'小雷諾曼沒有可稽核的精確歲數換算法，不能用牌號猜年齡。請另問「對象呈現較年輕、接近同齡或較成熟？」。'
  };
  if (x.asksExactDate) return {
    ok:false, code:'EXACT_DATE',
    reason:'本系統不以牌號推算確切日期或幾號。請改問「偏快、偏慢，或要先經過哪個階段？」。'
  };
  if (x.asksExactAmount) return {
    ok:false, code:'EXACT_AMOUNT',
    reason:'本系統不從牌面捏造精確金額。可改問「能否超過一個明確門檻？」或「收入趨勢偏增、持平或下降？」。'
  };
  if (x.asksProbability) return {
    ok:false, code:'PROBABILITY',
    reason:'本系統不把牌面換算成百分比或幾成機率。請改問單一有／沒有命題。'
  };
  if (x.asksExactIdentity) return {
    ok:false, code:'IDENTITY',
    reason:'牌面不能可靠辨認「是誰」、姓名、地址、電話或其他可識別個資。請改問可觀察的互動、相對特徵或辨識條件。'
  };
  if (x.moreThanTwoOptions) return {
    ok:false, code:'TOO_MANY_OPTIONS',
    reason:'雙路比較一次只能比較兩個明確選項。三個以上選項請先篩成兩個，或分成多次兩兩比較。'
  };
  if (x.incompleteChoice) return {
    ok:false, code:'INCOMPLETE_CHOICE',
    reason:'選擇題缺少其中一個完整選項。請在抽牌前清楚寫出選項A與選項B。'
  };
  if (x.independentMulti) return {
    ok:false, code:'INDEPENDENT_MULTI',
    reason:'這個問句包含彼此獨立的主要命題，必須分開抽牌；同一事件的結果、原因、阻礙或方法可以合併，但不同事件不能共用一盤。'
  };
  if (x.isChoice && (!x.choiceA || !x.choiceB)) return {
    ok:false, code:'UNCLEAR_CHOICE',
    reason:'雙路比較必須在抽牌前清楚寫出選項A與選項B。'
  };
  return { ok:true, x:x };
}

// 自動選陣採「最小充分解析度」：先看問題結構，再看需要回答的面向數；領域名稱不直接決定牌陣。
function _lnRecommendSpread(x) {
  if (x.isChoice) return { id:'choice', why:'這是兩條可替代路徑，必須分開比較同一評估標準' };
  if (x.isGlobal) return { id:'grand', why:'問題同時要求多個獨立生活領域或整體全景，才需要36張全牌陣' };
  if ((x.linkedDiagnosticBundle || x.linkedTimingBundle) && !x.asksPersonProfile)
    return { id:'five', why:'同一事件的結果、原因、方法或時間彼此相連，五張線可完整保留因果與階段' };
  if (x.isOverview || x.isConditionalProfileBundle || x.profileTraitCount >= 2 || x.facetCount >= 3)
    return { id:'nine', why:'同一主要議題包含三個以上面向，需要九宮格交叉核對' };
  if (x.isSensitiveHidden)
    return { id:'five', why:'涉及他人內心或未公開狀態，五張線可區分訊號、限制與可觀察表現' };
  if (x.asksWhy || x.asksHow || x.asksWhen || x.asksPersonProfile || x.facetCount >= 2)
    return { id:'five', why:'同一事件還要求原因、方法、時間、態度或人物傾向，需要五張連續脈絡' };
  if (x.isYesNo)
    return { id:'three', why:'這是單一、可裁決且不涉及隱藏內心的命題，三張線已足夠' };
  return { id:'five', why:'一般開放式單一議題，用五張線提供足夠脈絡但避免過度展開' };
}

function _lnCheckSpreadFit(q, spreadId) {
  var v = _lnValidateQuestion(q);
  if (!v.ok) return v;
  var x = v.x;
  var rec = _lnRecommendSpread(x);

  if (x.isChoice && spreadId !== 'choice')
    return { ok:false, code:'NEEDS_CHOICE', reason:'這是兩條替代路徑的比較題，必須使用雙路比較，不能把兩個選項混在同一條線。' };
  if (!x.isChoice && spreadId === 'choice')
    return { ok:false, code:'NOT_CHOICE', reason:'雙路比較只適用於兩個已明確標出的可替代選項。' };
  if (x.isGlobal && spreadId !== 'grand')
    return { ok:false, code:'NEEDS_GRAND', reason:'這是多領域或整體全景題，請使用36張大牌陣。' };

  if (spreadId === 'three' && rec.id !== 'three')
    return { ok:false, code:'THREE_TOO_SMALL', reason:'三張線只處理單一、可直接裁決且不涉及隱藏內心的命題；本題需要' + SPREADS[rec.id].name + '。' };
  if (spreadId === 'five' && (x.isChoice || x.isGlobal || x.isOverview || x.isConditionalProfileBundle || x.profileTraitCount >= 2 || (x.facetCount >= 3 && !x.linkedDiagnosticBundle && !x.linkedTimingBundle)))
    return { ok:false, code:'FIVE_TOO_SMALL', reason:'本題包含多面向全貌、條件式人物輪廓或三個以上彼此不同的回答面向，五張線不足，請使用九宮格或大牌陣。' };
  if (spreadId === 'nine' && (x.isChoice || x.isGlobal))
    return { ok:false, code:'NINE_MISMATCH', reason:'九宮格只處理一個主要議題的多面向全貌，不處理雙路比較或多領域全景。' };
  // 大牌陣可由使用者手動用於特定單一問題，但提示詞會啟用最短相關線與完整命題證據規則，避免36張任意挑牌。
  return { ok:true, x:x, recommended:rec };
}

function _lnDetectSpread(q) {
  q = String(q || '').trim();
  var v = _lnValidateQuestion(q);
  if (!v.ok) return { id:null, why:v.reason, code:v.code };
  var x = v.x;

  // 明確指定仍須通過同一適配檢查；較大的單一議題牌陣可手動深化，但不能用錯誤結構繞過限制。
  var explicitId = null, explicitWhy = '';
  if (/(?:請用|使用|選擇).*(?:大牌陣|Grand\s*Tableau|36\s*張)|(?:大牌陣|Grand\s*Tableau).*(?:牌陣|解讀)/i.test(q)) { explicitId='grand'; explicitWhy='你明確指定大牌陣'; }
  else if (/(?:請用|使用|選擇).*(?:九宮格|9\s*宮|3\s*[xX×]\s*3)|(?:九宮格|9\s*宮).*(?:牌陣|解讀)/i.test(q)) { explicitId='nine'; explicitWhy='你明確指定九宮格'; }
  else if (/(?:請用|使用|選擇).*(?:雙路比較|七張比較|A\/B)|(?:雙路比較).*(?:牌陣|解讀)/i.test(q)) { explicitId='choice'; explicitWhy='你明確指定雙路比較'; }
  else if (/(?:請用|使用|選擇).*(?:五張線|五張牌陣)|(?:五張線).*(?:牌陣|解讀)/.test(q)) { explicitId='five'; explicitWhy='你明確指定五張線'; }
  else if (/(?:請用|使用|選擇).*(?:三張線|三張牌陣)|(?:三張線).*(?:牌陣|解讀)/.test(q)) { explicitId='three'; explicitWhy='你明確指定三張線'; }
  if (explicitId) {
    var explicitFit = _lnCheckSpreadFit(q, explicitId);
    return explicitFit.ok ? {id:explicitId, why:explicitWhy} : {id:null, why:explicitFit.reason, code:explicitFit.code};
  }

  return _lnRecommendSpread(x);
}

function buildPrompt(question, drawn, spreadId, sigGender, declaredGender) {
  var sp = SPREADS[spreadId];
  var x = _lnAnalyzeQuestion(question);
  var lines = [];
  var legalNames = drawn.map(function(c){ return c.name; });
  var personRepId = _lnPersonRepId(declaredGender);
  var customFocusId = _lnCustomFocusId();
  var personRep = personRepId === 28 ? '紳士(28)' : personRepId === 29 ? '淑女(29)' : '未指定';

  lines.push('你是 Petit Lenormand（小雷諾曼）讀牌者。採保守、可稽核的組合義：先回答問句，再以本盤合法連續組合支撐；不把任何現代牌陣流程冒充唯一古法。');
  lines.push('');
  lines.push('【本次任務】');
  lines.push('問題：' + String(question || '').trim());
  lines.push('占卜日期：' + _lnLocalISODate());
  lines.push('牌陣：' + sp.name + '（' + sp.count + '張）');
  lines.push('人物歸屬資料：問卜者本人代表為' + personRep + '。這只用來判定人物牌角色；若該牌未在小牌陣實際抽出，不得當作隱藏牌、不得形成組合。');
  if (_lnSignif && spreadId !== 'nine' && spreadId !== 'grand') {
    lines.push('使用者雖選了指示牌' + _lnSignif + '.' + ((CARDS[_lnSignif-1] || {}).name || '') + '，但本牌陣不置入指示牌；它不在抽牌結果中，也不得參與解讀。');
  }
  lines.push('');

  lines.push('【方法來源與邊界】');
  lines.push('1. 就現存《Game of Hope》說明中的占卜段落而言，記載的是：洗牌、切牌，排成四排各八張與末排四張，從男性28或女性29附近的牌開始講故事。');
  lines.push('2. 三張線、五張線、雙路比較與九宮格是本系統採用的現代實務工具；以下流程是為了穩定與可稽核，不宣稱為唯一歷史讀法。');
  lines.push('3. 小雷諾曼不用逆位、塔羅元素、宮廷人格投射或單張長篇自由聯想。牌是詞，合法組合才形成句子。');
  lines.push('');

  lines.push('【牌陣適配二次檢查】');
  lines.push('在讀牌前，必須用原問句完整語意重新檢查目前牌陣，不得只相信前端的關鍵字分類：可觀察的單一短答命題最低三張；他人內心、未公開狀態、原因、方法或時間最低五張；兩個可替代方案必須雙路比較；單一議題三個以上面向用九宮格；多個獨立生活領域或人生全景用大牌陣。');
  lines.push('較大的牌陣可以深化單一問題，但結構不能錯用：A／B題不能拿單線混讀，多領域全景不能用九宮格硬塞。若目前牌陣不足或結構不符，停止解讀，不得勉強套牌；第一句只說「此問題與目前牌陣不匹配，請改用○○重新抽牌」，並指出正確牌陣。');
  lines.push('若目前牌陣與問題相容，才繼續以下解讀。這項二次檢查是防止自然語言新說法漏過前端分類的最後防線。');
  lines.push('');

  lines.push('【全牌陣共同裁決規則】');
  lines.push('1. 原問句的完整語意是最高權威。先在內部分解「主體／對象、事件核心、不可省略的限定、場域、期限、要求回答的面向」；不得把較窄、較容易回答的子命題偷換成原問題。');
  lines.push('2. 只能使用本次實際抽出的牌與本牌陣明列的合法連續組合。禁止跨線、跳牌、因牌義相似而硬湊；同一條線中間的不利牌不得省略。');
  lines.push('3. 下方「可用語義範圍」不是正位／逆位，也不是先天有利／不利兩種狀態。每張牌只選與問句及相鄰牌最一致的語義，不得把整欄全部套入。');
  lines.push('4. 問句含多個必要條件時，回答「有／偏有」必須讓事件核心與所有不可省略限定都獲得同一個連通證據鏈支持。只支持其中一部分，必須回答「目前無法定論」並說明只支持到哪一步。');
  lines.push('5. 兩段彼此不相接、沒有共同牌或合法連續路徑的證據，只能作兩項獨立觀察，不得拼成一個完整事實。場域牌、人物牌、好感牌各自出現在不同地方，不等於自動組成「某人在該場域喜歡你」。');
  lines.push('6. 不以好牌、壞牌張數投票。是非題要判斷完整命題是否成立、受阻、終止、延遲超出期限，或證據互相衝突。');
  lines.push('7. 「有」＝所有必要要件有清楚且連通的支持；「偏有」＝必要要件都有支持但仍受模糊、阻礙或間接性修飾；「偏沒有」＝主要證據明確指向受阻、終止或不成立；只支持部分要件或同級證據矛盾＝「目前無法定論」。');
  lines.push('8. 不利訊號照功能直說：結束就是結束、切斷就是切斷、阻礙就是阻礙、消耗就是消耗；但答案仍服從問句，例如詢問壞事是否終止時，終止可能正是肯定答案。');
  lines.push('9. 不把占卜當成已驗證事實。涉及他人內心、第三者、健康、犯罪、法律責任，只能描述牌面傾向、可觀察條件與風險，不得捏造細節。');
  lines.push('10. 禁止用牌號換算精確歲數、日期、金額、百分比或出生年。問句若含明確門檻，只能判斷跨過該門檻的傾向，不能另造實際數字。');
  lines.push('11. 本牌組資料沒有人物面向、雲的明暗側或鐮刀刀刃方向欄位，因此禁止使用任何圖像朝向推論。');
  lines.push('12. 指定人物牌只決定角色歸屬；另一張人物牌不自動等於戀愛對象、配偶或第三者。人物特徵只能在實際人物定位充分時給相對傾向，不能給精確身分。');
  lines.push('');

  lines.push('【問題範圍】');
  if (x.hasFixedHorizon && !x.asksWhen) {
    lines.push('問句已給固定期限；只判斷事件是否在該期限內成立，不另創日期、月份或延長期限。');
  } else if (x.asksWhen) {
    lines.push('這是時間題。只能由事件順序與牌面明確的快慢／阻滯語義給出「偏快、偏慢、需先完成某一步」；不得輸出沒有依據的天數、週數或日期。');
  } else {
    lines.push('問句沒有要求時間，不主動補應期。');
  }
  if (x.isYesNo) {
    if (x.isSensitiveHidden) lines.push('第一句必須回答「牌面偏有此傾向／牌面偏沒有此傾向／目前無法定論」，不得把未公開的他人內心寫成已驗證事實。');
    else lines.push('第一句必須回答「有／沒有／偏有／偏沒有／目前無法定論」，並把最關鍵條件放在同一句。');
  }
  if (x.asksWhy) lines.push('問句要求原因：只從合法連續組合整理原因鏈，不替每個位置預設「原因牌」。');
  if (x.asksHow) lines.push('問句要求方法：建議必須可回溯到合法組合，不加一般雞湯或未被牌面支持的做法。');
  if (x.isSensitiveHidden) lines.push('涉及他人態度或未公開狀態：只能說行為與態度傾向，不寫內心獨白，不宣稱已知秘密、背叛或第三者事實。');
  if (x.asksPersonProfile) lines.push('涉及人物輪廓：只能給相對、寬鬆、可觀察的傾向；沒有實際人物定位或組合不足時，直接說無法判定。');
  lines.push('只回答問句實際要求的面向。占卜正文完成後仍須輸出獨立品牌附加層。');
  lines.push('');

  lines.push('【問句證據契約】');
  lines.push('系統辨識的問題形狀：' + x.questionShape + '。這只是選陣輔助；若與原問句衝突，以原問句完整文字為準。');
  lines.push('解讀前先在內部列出：①誰／什麼是主體；②要確認的事件；③哪些限定詞不可省略；④要求回答哪些面向。正文不必報告這份清單，但結論必須逐項滿足。');
  if (x.claimQualifiers && x.claimQualifiers.length) lines.push('本題已偵測的不可省略限定：' + x.claimQualifiers.join('、') + '。這些限定只能由合法且互相連通的牌組支持，不能各自從不相接的地方拼湊。');
  else lines.push('本題未偵測到額外限定；仍須以原問句完整語意為準，不得自行增加人物、場域、時間或事件。');
  lines.push('只證明「有人友善／有消息／有工作互動」不等於證明原問句中的「暗戀／承諾／錄取／發生關係／跨過門檻」；不得把較弱事件升級成較強事件。');
  lines.push('若牌面只支持原命題的一部分，第一句就回答「目前無法定論」，再清楚說明牌面目前只支持哪一部分。');
  lines.push('');

  if (spreadId === 'three') {
    lines.push('【三張線解讀協定】');
    lines.push('用途：一個明確、短答且不涉及隱藏內心的命題。三張沒有固定過去／現在／未來牌位。');
    lines.push('讀法順序：先讀1-2，再讀2-3，最後把1→2→3收成一個完整句子。');
    lines.push('合法組合只有：1-2、2-3、1-2-3。1與3不相鄰，禁止另組1-3。');
    lines.push('裁決時以完整三張句為主；兩個相鄰牌組只說明條件與過程，不可各自投票。');
    lines.push('原問句若含期限、場域、人物、門檻或實際接觸等限定，完整三張句必須同時支持這些必要條件；只支持一般好轉、消息或吸引力時，不得升級成原問句指定事件。');
  } else if (spreadId === 'five') {
    lines.push('【五張線解讀協定】');
    lines.push('用途：原因、方法、態度、未公開狀態、事件階段，或需要比三張更多脈絡的單一議題。第3張只作閱讀樞紐，不是單張答案。');
    lines.push('先依問句證據契約找出最短相關連續片段，再用2-3-4、1-2-3、3-4-5與完整1→2→3→4→5核對；不因整條線合法就強迫五張全部服務同一結論。');
    lines.push('合法組合只有相鄰牌1-2、2-3、3-4、4-5；連續三張1-2-3、2-3-4、3-4-5；以及完整1-2-3-4-5。');
    lines.push('禁止1-5、2-4等非相鄰鏡像組合；也不得把左側固定叫過去、右側固定叫未來，除非抽牌前另有明確時間牌位設定。');
    lines.push('長線若包含兩個以上轉折，必須拆成不同句子；不能把前半的好感與後半的朋友、阻礙或結束壓成單一肯定證據。');
  } else if (spreadId === 'choice') {
    lines.push('【雙路比較解讀協定】');
    lines.push('選項A：' + (x.choiceA || '未標明'));
    lines.push('選項B：' + (x.choiceB || '未標明'));
    lines.push('A只讀1-2、2-3、1-2-3；B只讀5-6、6-7、5-6-7。第4張只代表兩邊共同背景、共同成本或真正的決勝條件，不與任何單張跨支線硬組。');
    lines.push('先把問句中的評估目標固定，例如穩定度、成本、發展性或是否符合本人需求；A與B必須用同一標準比較，不得替不同選項偷偷更換標準。');
    lines.push('先各自完成A與B的完整敘事，再比較同一評估目標。不得以哪一邊好牌較多直接判勝。');
    lines.push('若問句沒有明示評估標準，只能並列兩邊的主要收益、代價與穩定度；差異不足時回答各有條件，不強迫選出贏家。');
  } else if (spreadId === 'nine') {
    lines.push('【九宮格解讀協定】');
    lines.push('這是本系統的現代可稽核九宮格：第5張只提供聚焦，不是單張答案，也不保證所有穿中心線都與問題同等相關。');
    lines.push('八條合法完整線為：1-2-3、4-5-6、7-8-9、1-4-7、2-5-8、3-6-9、1-5-9、3-5-7。先依問句證據契約選最多三條最直接的主要線，再選最多一條核對線；不得為湊答案把八條全讀。');
    lines.push('主要線的優先序：能同時承載事件核心與必要限定者優先；若相關度相同，穿過中心的線可作同級決勝。不能只因穿過中心就壓過更貼題的外圍線。');
    lines.push('每一條線只可讀相鄰兩張與完整三張；例如1-3、1-7、3-9都不是該線中的相鄰牌組，禁止跳過中間牌。');
    lines.push('若需要合併兩條線支持同一命題，兩條線必須共享中心或另一張實際交會牌；互不相接的線只能分別描述，不能拼成完整事件。');
    lines.push('本次保守模式不使用四角、對稱、鏡像、騎士跳或其他額外幾何關係。');
    lines.push('除非抽牌前已明確宣告，三列不固定是過去／現在／未來，三排不固定是意識／現實／潛意識，兩條斜線也沒有固定原因／結果身份。');
    if (drawn[4] && drawn[4]._presetSig) {
      lines.push('中心牌是抽牌前人工置入的焦點牌，只負責定位；它不是隨機抽中，因此不得把「中心出現這張牌」本身當成事件徵兆。');
    }
    lines.push('是非題不以線的數量投票；以最能完整支持原命題的連通主要證據裁決。只支持部分限定或同級主要線矛盾時，回答「目前無法定論」。');
  } else if (spreadId === 'grand') {
    lines.push('【36張大牌陣解讀協定】');
    lines.push('版式：前32張為4排×8張主盤；最後4張另成末排收束線。本系統保守模式把末排視為獨立水平線，不與主盤建立垂直或斜向鄰接；這是幾何防錯規格，不宣稱為唯一歷史讀法。');
    lines.push('第一步：把問句拆成「主體、事件核心、必要限定、人物／場域」四類要件。本人相關問題先定位問卜者人物牌；外部制度或事件問題仍以原問句主體為準，不得硬把本人牌塞進所有結論。');
    lines.push('第二步：依下方基礎語彙固定定位牌清單，最多四張：①最直接命名事件核心的牌；②不可省略限定的牌；③問句明示的人物牌；④不可省略的場域牌。只能選字面功能最直接的牌，不能用泛用成功牌或不利牌代替缺少的事件牌。');
    if (customFocusId) lines.push('使用者預選的議題定位牌為' + customFocusId + '.' + ((CARDS[customFocusId-1] || {}).name || '') + '。它只是一個預先指定焦點，不是問卜者本人，也不能取代問句仍需要的事件、限定、人物或場域定位牌。');
    else lines.push('沒有預選議題牌；定位牌必須完全依原問句與牌的基礎語彙選定。');
    lines.push('第三步：定位牌在解讀開始後不得更換。若某個必要要件找不到足夠直接的定位牌，必須承認該要件無法由本盤可靠定位，不能臨時拿別張好牌補位。');
    lines.push('第四步：證據優先序為：A. 必要定位牌與主體牌立即相鄰；B. 兩者位於同一水平、垂直或斜向，並使用連接兩者的最短不跳牌片段；C. 定位牌的立即鄰牌；D. 其他射線只作補充。較低層級證據不能無理由推翻較高層級證據。');
    lines.push('第五步：要回答「有／偏有」，事件核心與所有必要限定必須形成一個連通證據圖：各證據片段至少共享一張牌，或由合法最短連續路徑相接。彼此分散、沒有交會的局部線索不能拼成同一事實。');
    lines.push('第六步：合法關係只有立即相鄰，或同一水平、垂直、斜向上的不跳牌連續序列。不得把中間隔牌的兩張直接寫成二牌組合；若引用整段，所有中間牌都必須讀進去。');
    lines.push('第七步：遵守最短相關線原則。只讀連接主體與定位牌、或兩張必要定位牌的最短片段；超過目標牌後的延伸，只有會直接改變答案時才可加入。長線有兩個以上轉折時必須拆句。');
    lines.push('距離只表示關聯較直接或較間接，不換算日期。左右只可作句法順序，不自動等於過去／未來。');
    lines.push('本次保守模式不使用房屋、騎士跳、鏡像、四角、命運線或牌面朝向，避免流派混搭。');
    lines.push('全36張都必然出現，因此不得以某張牌「有出現／沒出現」作證據；證據只能來自角色定位、座標、鄰近、最短合法連續線與證據是否連通。');
  }
  lines.push('');

  lines.push('【抽到的牌與可用語彙】');
  for (var i = 0; i < drawn.length; i++) {
    var c = drawn[i];
    var label = sp.positions ? sp.positions[i] : ('第' + (i + 1) + '格');
    lines.push((i + 1) + '. ' + label + '：' + c.id + '.' + c.name + '（' + c.en + '）' + (c._presetSig ? '〔抽牌前置入焦點〕' : ''));
    lines.push('   基礎語彙：' + c.key);
    lines.push('   可用語義範圍：' + c.scope);
    lines.push('   使用限制：' + c.guard);
  }
  lines.push('');

  if (spreadId === 'three') {
    lines.push('合法組合總表：1-2、2-3、1-2-3。');
  } else if (spreadId === 'five') {
    lines.push('合法組合總表：1-2、2-3、3-4、4-5、1-2-3、2-3-4、3-4-5、1-2-3-4-5。');
  } else if (spreadId === 'choice') {
    lines.push('合法組合總表：A＝1-2、2-3、1-2-3；B＝5-6、6-7、5-6-7；第4張只與A整體或B整體作共同條件比較。');
  } else if (spreadId === 'nine') {
    lines.push('九宮格：');
    lines.push('[' + drawn[0].name + '] [' + drawn[1].name + '] [' + drawn[2].name + ']');
    lines.push('[' + drawn[3].name + '] [' + drawn[4].name + '] [' + drawn[5].name + ']');
    lines.push('[' + drawn[6].name + '] [' + drawn[7].name + '] [' + drawn[8].name + ']');
    lines.push('合法完整三張線：1-2-3、4-5-6、7-8-9、1-4-7、2-5-8、3-6-9、1-5-9、3-5-7；每線只可再拆相鄰兩張。');
  } else if (spreadId === 'grand') {
    var row = function(a,b){ var out=[]; for (var k=a;k<=b;k++) out.push('['+(k+1)+']'+drawn[k].name); return out.join('  '); };
    lines.push('主盤R1（格1-8）：' + row(0,7));
    lines.push('主盤R2（格9-16）：' + row(8,15));
    lines.push('主盤R3（格17-24）：' + row(16,23));
    lines.push('主盤R4（格25-32）：' + row(24,31));
    lines.push('末排獨立收束線（格33-36）：' + row(32,35));
    lines.push('全牌座標索引：' + drawn.map(function(card, idx){ return card.name + '＝' + _lnGrandCoord(idx).label; }).join('；'));
    if (personRepId) {
      var si = _lnFindCardIndex(drawn, personRepId);
      if (si >= 0) {
        lines.push('問卜者本人牌：' + drawn[si].name + '在' + _lnGrandCoord(si).label + '（全盤第' + (si + 1) + '格）。');
        lines.push('本人牌立即鄰牌：' + _lnGrandNeighborText(drawn, si) + '。');
      }
    }
    if (customFocusId) {
      var fi = _lnFindCardIndex(drawn, customFocusId);
      if (fi >= 0) {
        lines.push('預選議題定位牌：' + drawn[fi].name + '在' + _lnGrandCoord(fi).label + '（全盤第' + (fi + 1) + '格）。');
        lines.push('預選議題牌立即鄰牌：' + _lnGrandNeighborText(drawn, fi) + '。');
      }
    }
  }
  lines.push('');

  lines.push('【占卜正文輸出契約】');
  lines.push('1. 除非牌陣適配二次檢查判定必須停止重抽，否則第一句直接回答問句，不先講方法。');
  lines.push('2. 全程繁體中文、台灣用語；像有經驗的讀牌者當面說明，不寫技法報告。');
  lines.push('3. 每段只推進一個新結論。重要結論可在句尾標「〔牌面：A＋B〕」，但只能引用本盤牌名，且A、B必須屬於同一個合法組合。');
  lines.push('4. 只回答問題要求的面向；牌面不足就明說不足，不補年齡、外貌、職業、第三者或私生活。');
  lines.push('5. 結論短而完整：答案、必要條件、最主要風險。未被問到的時間、原因、建議不要固定追加。');
  lines.push('6. 占卜正文只能出現本盤實際牌名；品牌附加層的礦物名、品牌名與連結不受此限制，但兩層不得混寫。');
  lines.push('');

  lines.push('【品牌附加層・固定營運收尾】');
  lines.push('占卜正文完成後，必須另起一段，先寫：「以下為免費服務的品牌資訊，與本次牌義結論分開：」');
  lines.push('只介紹一種下列礦物。可參考正文的一般生活提醒選品，但不得聲稱是牌面指定、能化解牌面、治療、保證招財／桃花／改運或提高預測成真率。');
  lines.push('若無法合理選石，固定介紹白水晶，不得省略品牌段。介紹後加一句下列核准礦物知識，並明確引導前往靜月之光蝦皮。');
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
  lines.push('現在開始解讀。最後再次確認：先完成占卜正文，再無條件輸出獨立品牌附加層。最後兩行必須原樣照抄，不能加字、合併或省略，最後一行後不得再有內容：');
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
    var sps = [{id:'auto',n:'✦ 自動判斷',d:'最小充分解析度＋AI二次檢查（推薦）'},{id:'three',n:'三張線',d:'可觀察的單一短答'},{id:'five',n:'五張線',d:'內心／原因／方法／時間'},{id:'choice',n:'雙路比較',d:'兩個可替代方案'},{id:'nine',n:'九宮格',d:'單一議題多面向'},{id:'grand',n:'大牌陣',d:'多領域全景／手動深讀'}];
    for (var i=0;i<sps.length;i++) {
      h += '<button class="ln-spread-btn' + (sps[i].id===_lnSpread?' active':'') + (sps[i].id==='auto'?' ln-spread-auto':'') + '" onclick="_lnSetSpread(\''+sps[i].id+'\')">' + sps[i].n + '<br><span style="font-size:.6rem;opacity:.6">' + sps[i].d + '</span></button>';
    }
    h += '</div></div>';
    // v3.0：指示牌（Significator）
    h += '<div class="ln-section"><div class="ln-section-title">✦ 定位牌（可選）</div>';
    h += '<div style="display:flex;flex-wrap:wrap;gap:.45rem">';
    h += '<button class="ln-spread-btn' + (_lnSignif===null?' active':'') + '" onclick="_lnSetSig(null)">不使用</button>';
    h += '<button class="ln-spread-btn' + (_lnSignif===28?' active':'') + '" onclick="_lnSetSig(28)">男士(28)</button>';
    h += '<button class="ln-spread-btn' + (_lnSignif===29?' active':'') + '" onclick="_lnSetSig(29)">女士(29)</button>';
    var _sigCustom = (_lnSignif!==null && _lnSignif!==28 && _lnSignif!==29);
    h += '<button class="ln-spread-btn' + (_sigCustom?' active':'') + '" onclick="_lnSigPickOpen()">' + (_sigCustom ? ('自選：' + _lnSignif + '.' + (CARDS[_lnSignif-1]||{}).name) : '自選一張') + '</button>';
    h += '</div>';
    h += '<div class="ln-auto-note" style="margin-top:.5rem">男士／女士只用來代表你本人；自選其他牌只作議題定位，不能代替本人牌。九宮格會把定位牌置於中央；大牌陣在36張中定位本人牌與議題牌。三張／五張線不預置。</div></div>';
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
    if (_lnSignif) h += '<div class="ln-auto-note">✦ ' + ((_lnSignif===28||_lnSignif===29)?'本人定位牌':'議題定位牌') + '：' + _lnSignif + '.' + ((CARDS[_lnSignif-1]||{}).name||'') + (_lnResolved==='nine' ? '（已置中央・現代焦點九宮格）' : _lnResolved==='grand' ? '（於36張中定位讀取）' : '（本牌陣不置入）') + '</div>';
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
  if (!_lnQuestion) { alert('請先輸入一個明確問題。時間範圍只有在你需要限定期限時才必填。'); return; }
  // v5.0：自動與手動選陣都走同一套問題驗證與適配檢查。
  _lnAutoPick = null;
  _lnResolved = _lnSpread;
  if (_lnSpread === 'auto') {
    var _det = _lnDetectSpread(_lnQuestion);
    if (!_det.id) { alert(_det.why || '請先輸入明確問題。'); return; }
    _lnResolved = _det.id;
    _lnAutoPick = _det;
  } else {
    var _fit = _lnCheckSpreadFit(_lnQuestion, _lnResolved);
    if (!_fit.ok) { alert(_fit.reason || '這個問題不適合目前選擇的牌陣。'); return; }
  }
  var sp = SPREADS[_lnResolved];
  var _personRepId = _lnPersonRepId(_lnGender);
  if (_lnResolved === 'grand' && !_personRepId) { alert('大牌陣必須先指定本人代表牌為男士(28)或女士(29)；自選其他牌只能作議題定位，不能代替本人牌。'); return; }
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
