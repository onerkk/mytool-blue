// ═══════════════════════════════════════
// 靜月之光 — 雷諾曼牌 Lenormand v11.0（五牌陣完整覆蓋解讀引擎）
// v11.0(2026/7/15)：根治「只讀主線／固定段落數」造成任何牌陣漏讀的問題。
//   ①完整解讀改採 coverage-first：先覆蓋本牌陣所有合法組合，再把每組標記為獨立新資訊、同義佐證、矛盾／轉折或與問句無關；所有與問句相關且不重複的內容都必須輸出。
//   ②完整不再等於固定篇幅，也不等於枚舉牌義字典；輸出長度由合法組合實際產生的「不同資訊量」決定，禁止因牌陣小而省略可成立的細節，也禁止因牌陣大而硬湊無關故事。
//   ③三張線逐一覆蓋3組；五張線補齊兩個四張連續窗，完整覆蓋10組；雙路各自完整覆蓋並以共同牌逐路校正；九宮格完整掃描16組相鄰對＋8條完整線。
//   ④大牌陣先掃描30條主盤合法直線內的所有連續子段，再依問句建立主體場、事件場、連接場與交會場；任何提供不同相關資訊的線都要呈現，不能只讀本人附近或兩條主線。
//   ⑤移除各牌陣固定段落上限與「通常幾段」壓縮指令，改為覆蓋稽核：每一個相關合法組合都必須在正文中被呈現、合併為同義佐證，或明確判定不能支持結論。
// v10.0(2026/7/15)：把提示詞由「限制清單」重構為五牌陣共用的完整判讀方法。
//   ①共同流程改為：問句建模→語義部件→牌面承載點→相鄰造句→長線合成→交會整合→證據飽和→結論校準。
//   ②新增牌間語法：相鄰牌如何互相限定、中間牌如何作橋、長線如何以滑動片段合成、交會線如何共享樞紐但不硬轉彎。
//   ③五種牌陣改採不同分析深度，不再用同一個「最少充分證據」把九宮格與36張大牌陣壓縮成三張線長度。
//   ④大牌陣採主體場→事件場→直接連線→交會射線→支持/阻礙→獨立收束線的漸進式擴張；新增全盤合法直線索引與本人穿越線，降低幾何誤判。
//   ⑤正文輸出依牌陣容量分級；大牌陣聚焦題須完整交代多個不同證據層，全景題則逐領域分區，不要求硬念36張也不允許只讀兩條線。
// v9.0(2026/7/15)：根治五種牌陣在不同問法下被前端關鍵字牽著走的問題。
//   ①所有牌陣共用同一回答契約：AI先依原問句判定主體、命題、範圍與回答形式，再依牌陣幾何取證。
//   ②前端分析只用於抽牌前的結構選陣與安全攔截，不再把「暗戀、內心、秘密」等內容詞直接升級牌陣或寫進正文結論。
//   ③手動選陣只阻擋真正幾何錯配；三張線可處理單一原因、方法、時間或態度題，但會遵守較低解析度上限。
//   ④三張、五張、雙路、九宮格與大牌陣各自採封閉閱讀順序、合法連線與證據優先級，避免跳牌、跨線、全盤撿牌或好壞票選。
//   ⑤品牌層改以「生活情境→配戴場合→色系／質感」選一種礦物，僅作風格呼應，保留客觀礦物知識與固定蝦皮收尾。
// v7.0(2026/7/14)：移除題型補丁式解讀，改成少數上位原則。
//   ①前端只處理牌陣「結構」：單線、雙路、多面向、全景；不再把偵測到的題目詞彙寫成牌義結論條件。
//   ②提示詞不再列舉暗戀、肉體、錄取、成交等事件強度範例，也不輸出程式猜出的限定清單；完整自然語意交由AI判讀。
//   ③已知期限、人物與場域和「要由牌證明的事件」分離；AI依原問句判斷哪些是背景範圍、哪些才是待證命題。
//   ④所有牌陣共用最小充分證據原則：只用合法連續組合、保留中間牌、禁止投票與跨線拼故事；其餘語義由AI依組合決定。
//   ⑤九宮格不硬限固定線數；只要求選擇回答所需的最少相關線。大牌陣不硬訂定位牌類別與張數，改為先固定最少必要定位牌。
//   ⑥手動較大牌陣可深化單一問題；只有分支結構、多領域全景或明顯多面向不足時才硬性阻擋，避免規則凌駕語意。
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
console.log('[Lenormand] 靜月之光 雷諾曼牌 v11.0 loaded — full legal-combination coverage engine');

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
    desc:'現代短線讀法。處理一個聚焦命題；完整覆蓋兩組相鄰對與三張全句，呈現所有不同且相關的細節。',
    positions:['第1張','第2張','第3張']
  },
  five: { id:'five', name:'五張線', en:'Five-Card Line', count:5,
    desc:'現代長線讀法。處理需要因果、階段或條件脈絡的單一議題；完整覆蓋10組連續片段，第3張作閱讀樞紐。',
    positions:['第1張','第2張','第3張','第4張','第5張']
  },
  choice: { id:'choice', name:'雙路比較', en:'Two-Path Comparison', count:7,
    desc:'現代對稱比較。A與B各自完整覆蓋三張線，第4張逐路校正共同背景／決勝條件；兩條支線禁止互相拼接。',
    positions:['A1','A2','A3','共同背景','B1','B2','B3'],
    layout:'choice'
  },
  nine: { id:'nine', name:'九宮格', en:'Nine-Card Box (3×3)', count:9,
    desc:'現代九張方陣。處理同一議題的多個面向；完整覆蓋16組相鄰對與8條合法橫、直、斜線，不預設牌位角色。',
    positions:['第1格','第2格','第3格','第4格','中心','第6格','第7格','第8格','第9格'],
    layout:'3x3'
  },
  grand: { id:'grand', name:'大牌陣', en:'Grand Tableau', count:36,
    desc:'36張全牌陣。採4×8＋末排4張版式；掃描全部合法直線與連續子段，再以本人／事件定位整合所有相關資訊。額外技法不混用。',
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
// ── v7.0 問題→牌陣：只判斷結構與解析度，語義交由AI ──
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

function _lnCountMatches(text, re) {
  var m = String(text || '').match(re);
  return m ? m.length : 0;
}

function _lnAnalyzeQuestion(q) {
  q = String(q || '').trim();
  var compact = q.replace(/\s+/g, '');
  var parts = q.split(/[？?；;\n]+/).map(function(s){ return s.trim(); }).filter(Boolean);

  // 只辨識「問句幾何與安全邊界」。內容詞不直接決定牌義、答案或牌陣大小。
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

  // 「單一議題多面向」只在問句明確要求多個不同面向時成立；單純問發展、走向或整體結果仍是單一開放題。
  var aspectFlags = [
    /來源|起因|根源/.test(q),
    /優勢|助力|有利條件/.test(q),
    /風險|阻礙|障礙|代價/.test(q),
    /結果|結局|後續結果/.test(q),
    /方法|策略|建議|下一步/.test(q),
    /時間|何時|多久/.test(q)
  ];
  var aspectTermCount = aspectFlags.filter(Boolean).length;
  var explicitMultiAspect = /多面向|各面向|全面分析|完整分析|優勢.*(?:風險|阻礙|結果)|風險.*(?:優勢|結果|方法)|來源.*(?:阻礙|結果)|阻礙.*(?:結果|方法)|助力.*阻力|阻力.*結果/.test(q) || aspectTermCount >= 3;

  // 多領域全景：必須是多個彼此可獨立回答的生活主題，或明確要求人生／年度全景。
  var globalCue = /人生全貌|整體人生|所有面向|全部領域|全年整體|年度總運|未來一年整體|通盤|全局|人生各方面/.test(q);
  var listConnectorCount = _lnCountMatches(q, /、|以及|並且|同時|和|跟|與|及/g);
  var looksLikePersonPair = /^(?:我|你|他|她|我們|你們|他們|她們)(?:和|跟|與)/.test(compact);
  var panoramaCue = /整體|各方面|全部|都|年度|全年|運勢|狀況|變化|趨勢|順利/.test(q);
  var likelyDomainList = !looksLikePersonPair && listConnectorCount >= 1 && panoramaCue && !explicitMultiAspect && profileTraitCount < 2;
  var isGlobal = globalCue || likelyDomainList;

  // 雙路只接受兩個可替代方案；「我和他」等人物連接不是選項。
  var explicitAB = /(?:^|\s)A\s*(?:還是|或|或者|或是|跟|與|和|vs\.?|VS\.?)\s*B(?:\s|$|哪|比)/i.test(q) || /選項\s*A.*選項\s*B/i.test(q);
  var binaryDecisionMatch = q.match(/^(?:我|我們)?(?:到底)?(?:該不該|應不應該|要不要|值不值得|適不適合)\s*(.+?)(?:[？?]|$)/);
  var explicitChoiceCue = /二選一|二擇一|兩個選項|比較.*(?:和|跟|與|及|還是|或者|或是)|選哪|哪一個比較|哪個比較|哪條路|何者較/.test(q);
  var actionAlternativeCue = /留職|離職|轉職|去[^？?]*還是|搬|買|賣|接受|拒絕|留下|離開|交往|分手|復合|投資|創業|發展/.test(q);
  var altConnectorCount = _lnCountMatches(q, /還是|或者|或是|或|、/g);
  var moreThanTwoOptions = /A.*B.*C/i.test(q) || /三個選項|三選一|三擇一/.test(q) || (altConnectorCount >= 2 && /哪個|選|比較/.test(q));
  var incompleteChoice = /(?:還是|或者|或是|或|和|跟|與)\s*[？?]?\s*$/.test(q) || /^\s*(?:還是|或者|或是)\s*/.test(q);
  var explicitPairMatch = q.match(/(.+?)(?:還是|或者|或是|或|和|跟|與)(.+?)(?:[？?]|$)/);
  var isChoice = !moreThanTwoOptions && (explicitAB || !!binaryDecisionMatch || (!looksLikePersonPair && explicitPairMatch && (explicitChoiceCue || actionAlternativeCue)));
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
  var partYesNoCount = parts.reduce(function(n, part){ return n + (yesNoPartRe.test(part.replace(/\s+/g,'')) ? 1 : 0); }, 0);
  var isYesNo = partYesNoCount > 0 || /嗎[？?]?\s*$/.test(compact) || /^(?:會不會|有沒有|能不能|可不可以|是不是|是否|愛不愛|喜不喜歡)/.test(compact) || /(?:會|有|能|愛|喜歡).+還是(?:不|沒有|不能)/.test(compact);

  var isConditionalProfileBundle = asksPersonProfile && /(?:若|如果|假如).*(?:有|會|出現|發生)|(?:若有|如果有|若會|如果會)/.test(q);
  var linkedFollowUp = /^(?:那|又|並且|以及|另外)?(?:為什麼|原因|阻礙|障礙|卡在哪|怎麼|如何|何時|什麼時候|多久|結果|走向|後續|若有|如果有|他|她|對方|這件事|這段|該怎麼)/;
  var clausesLinked = true;
  if (parts.length > 1) {
    for (var ci = 1; ci < parts.length; ci++) {
      if (!linkedFollowUp.test(parts[ci])) { clausesLinked = false; break; }
    }
  }
  var independentMulti = parts.length >= 2 && !isChoice && !clausesLinked;
  var linkedDiagnosticBundle = parts.length <= 3 && clausesLinked && (asksWhy || asksHow) && !asksPersonProfile;
  var linkedTimingBundle = parts.length <= 3 && clausesLinked && asksWhen;
  var multiPart = parts.length >= 2 || /(?:以及|另外|還有|同時)/.test(q);
  var asksThreshold = /破\s*(?:\d|[一二三四五六七八九十百千萬兩])|超過\s*(?:\d|[一二三四五六七八九十百千萬兩])|達到\s*(?:\d|[一二三四五六七八九十百千萬兩])|至少\s*(?:\d|[一二三四五六七八九十百千萬兩])|高於\s*(?:\d|[一二三四五六七八九十百千萬兩])|低於\s*(?:\d|[一二三四五六七八九十百千萬兩])|門檻/.test(q);

  var medicalDiagnosis = /(?:我|他|她|對方).*(?:是不是|是否|有沒有|會不會).*(?:癌症|腫瘤|懷孕|流產|精神病|憂鬱症|躁鬱症|傳染病|重病)|(?:我|他|她)?懷孕(?:了)?嗎|是不是懷孕/.test(q);
  var fatalityQuestion = /會不會死|何時死|幾歲死|壽命多久|死期/.test(q);
  var criminalFact = /(?:是不是|是否|有沒有).*(?:偷竊|偷我|詐騙|下毒|犯罪|犯法|性侵|侵占)|(?:他|她|對方).*(?:偷了|騙了|下毒)/.test(q);
  var directLegalLiability = /(?:是不是|是否|有沒有).*(?:違法|有罪|犯罪成立)|會不會被判刑/.test(q);

  // 面向數只計算原問句明示要求的回答工作，不把「暗戀／秘密／內心」當成額外面向。
  var facetCount = 1;
  if (asksWhy) facetCount++;
  if (asksHow) facetCount++;
  if (asksWhen) facetCount++;
  if (asksPersonProfile) facetCount += profileTraitCount >= 2 ? 2 : 1;
  if (explicitMultiAspect) facetCount = Math.max(facetCount, 3);
  if (isConditionalProfileBundle) facetCount = Math.max(facetCount, 3);

  var questionShape = '一般單一議題';
  if (isChoice) questionShape = '雙路決策比較';
  else if (isGlobal) questionShape = '多領域／全景問題';
  else if (explicitMultiAspect || facetCount >= 3) questionShape = '單一議題多面向全貌';
  else if (asksWhy || asksHow || asksWhen || asksPersonProfile || facetCount >= 2) questionShape = '需要脈絡的單一議題';
  else if (isYesNo) questionShape = '單一可裁決命題';

  return {
    q:q, compact:compact, parts:parts, empty:!q,
    isChoice:isChoice, choiceA:choiceA, choiceB:choiceB,
    moreThanTwoOptions:moreThanTwoOptions, incompleteChoice:incompleteChoice,
    asksWhen:asksWhen, asksExactDate:asksExactDate, hasFixedHorizon:hasFixedHorizon,
    asksWhy:asksWhy, asksHow:asksHow, isYesNo:isYesNo, partYesNoCount:partYesNoCount,
    isInner:asksInner, isHiddenClaim:isHiddenClaim,
    asksExactAge:asksExactAge, asksExactIdentity:asksExactIdentity,
    asksExactAmount:asksExactAmount, asksProbability:asksProbability,
    asksPersonProfile:asksPersonProfile, profileTraitCount:profileTraitCount,
    isConditionalProfileBundle:isConditionalProfileBundle,
    isOverview:explicitMultiAspect, isGlobal:isGlobal, multiPart:multiPart,
    independentMulti:independentMulti, linkedDiagnosticBundle:linkedDiagnosticBundle,
    linkedTimingBundle:linkedTimingBundle, clausesLinked:clausesLinked,
    asksThreshold:asksThreshold,
    medicalDiagnosis:medicalDiagnosis, fatalityQuestion:fatalityQuestion,
    criminalFact:criminalFact, directLegalLiability:directLegalLiability,
    facetCount:facetCount, questionShape:questionShape,
    isSensitiveHidden:asksInner || isHiddenClaim
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


// v10：36張主盤的完整合法直線清單。只產生水平、垂直與兩組斜線；末排另作獨立水平線。
function _lnGrandStraightLines() {
  var out = [], r, c, indices;
  for (r = 0; r < 4; r++) {
    indices = [];
    for (c = 0; c < 8; c++) indices.push(r * 8 + c);
    out.push({ label:'水平R' + (r + 1), indices:indices });
  }
  for (c = 0; c < 8; c++) {
    indices = [];
    for (r = 0; r < 4; r++) indices.push(r * 8 + c);
    out.push({ label:'垂直C' + (c + 1), indices:indices });
  }
  // 左上→右下：由頂列與左列作起點，長度至少2。
  for (c = 0; c < 8; c++) {
    indices = [];
    for (r = 0; r < 4 && c + r < 8; r++) indices.push(r * 8 + (c + r));
    if (indices.length >= 2) out.push({ label:'斜↘起R1C' + (c + 1), indices:indices });
  }
  for (r = 1; r < 4; r++) {
    indices = [];
    for (c = 0; r + c < 4 && c < 8; c++) indices.push((r + c) * 8 + c);
    if (indices.length >= 2) out.push({ label:'斜↘起R' + (r + 1) + 'C1', indices:indices });
  }
  // 右上→左下：由頂列與右列作起點，長度至少2。
  for (c = 0; c < 8; c++) {
    indices = [];
    for (r = 0; r < 4 && c - r >= 0; r++) indices.push(r * 8 + (c - r));
    if (indices.length >= 2) out.push({ label:'斜↙起R1C' + (c + 1), indices:indices });
  }
  for (r = 1; r < 4; r++) {
    indices = [];
    for (c = 7; r + (7 - c) < 4 && c >= 0; c--) indices.push((r + (7 - c)) * 8 + c);
    if (indices.length >= 2) out.push({ label:'斜↙起R' + (r + 1) + 'C8', indices:indices });
  }
  return out;
}

function _lnGrandLineText(drawn, line) {
  return line.indices.map(function(idx){ return (idx + 1) + '.' + drawn[idx].name; }).join('→');
}

function _lnContiguousSegmentCount(indices) {
  var n = (indices || []).length;
  return n > 1 ? (n * (n - 1)) / 2 : 0;
}

function _lnGrandMainSegmentCount() {
  return _lnGrandStraightLines().reduce(function(total, line){
    return total + _lnContiguousSegmentCount(line.indices);
  }, 0);
}

function _lnGrandLinesThroughText(drawn, index) {
  if (index < 0 || index >= 32) return '不在主盤，無主盤穿越線';
  var hits = _lnGrandStraightLines().filter(function(line){ return line.indices.indexOf(index) >= 0; });
  return hits.map(function(line){ return line.label + '＝' + _lnGrandLineText(drawn, line); }).join('；');
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

// 自動選陣採「最小充分解析度」：只依幾何與回答面向數選陣，題材內容不直接升級牌陣。
function _lnRecommendSpread(x) {
  if (x.isChoice) return { id:'choice', why:'問題包含兩個可替代方案，需要分成A／B兩條獨立支線比較' };
  if (x.isGlobal) return { id:'grand', why:'問題同時涵蓋多個獨立生活領域或要求全景，需使用36張大牌陣' };
  if (x.isOverview || x.isConditionalProfileBundle || x.profileTraitCount >= 2 || x.facetCount >= 3)
    return { id:'nine', why:'同一議題明確要求三個以上面向，需要九宮格以多條合法交會線回答' };
  if (x.asksWhy || x.asksHow || x.asksWhen || x.asksPersonProfile || x.facetCount >= 2)
    return { id:'five', why:'同一事件需要原因、方法、時間、人物輪廓或階段脈絡，五張線較完整' };
  if (x.isYesNo)
    return { id:'three', why:'這是單一可裁決命題，三張線足以給出結論、條件與主要風險' };
  return { id:'five', why:'這是單一開放題，五張線能保留必要脈絡而不過度展開' };
}

function _lnCheckSpreadFit(q, spreadId) {
  var v = _lnValidateQuestion(q);
  if (!v.ok) return v;
  var x = v.x;
  var rec = _lnRecommendSpread(x);

  // 手動選陣只阻擋真正的幾何錯配；內容詞、敏感題材或單一原因／方法／時間題不構成錯配。
  if (x.isChoice && spreadId !== 'choice')
    return { ok:false, code:'NEEDS_CHOICE', reason:'這是兩條互斥或可替代路徑，必須使用雙路比較，不能把A／B塞進同一條線或同一張網格。' };
  if (!x.isChoice && spreadId === 'choice')
    return { ok:false, code:'NOT_CHOICE', reason:'雙路比較需要兩個在抽牌前已明確寫出的替代選項。' };
  if (x.isGlobal && spreadId !== 'grand')
    return { ok:false, code:'NEEDS_GRAND', reason:'這是多領域或人生全景題，小牌陣無法讓各領域各自定位，請使用36張大牌陣。' };
  if (spreadId === 'three' && (x.isOverview || x.profileTraitCount >= 2 || x.facetCount >= 3))
    return { ok:false, code:'THREE_TOO_SMALL', reason:'本題明確要求多個不同面向，三張線只能穩定回答一個核心命題；請使用' + SPREADS[rec.id].name + '。' };
  if (spreadId === 'five' && (x.isOverview || x.profileTraitCount >= 2 || x.facetCount >= 3) && !x.linkedDiagnosticBundle && !x.linkedTimingBundle)
    return { ok:false, code:'FIVE_TOO_SMALL', reason:'本題要求同一議題的多面向全貌，五張線解析度不足，請使用九宮格。' };
  if (spreadId === 'nine' && (x.isChoice || x.isGlobal))
    return { ok:false, code:'NINE_MISMATCH', reason:'九宮格只處理同一議題的多面向；雙路選擇用雙路比較，多領域全景用大牌陣。' };
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

  lines.push('你是 Petit Lenormand（小雷諾曼）讀牌者。你的工作不是套用關鍵字或固定事件表，而是先理解原問句，完整掃描本牌陣全部合法組合，把相鄰牌與連續片段合成自然語句，再呈現所有與問題相關且不重複的解讀。只輸出最後解讀，不展示內部分析步驟。');
  lines.push('');
  lines.push('【本次任務】');
  lines.push('問題：' + String(question || '').trim());
  lines.push('占卜日期：' + _lnLocalISODate());
  lines.push('牌陣：' + sp.name + '（' + sp.count + '張）');
  lines.push('人物歸屬：問卜者本人代表為' + personRep + '。人物資料只用於判定實際抽出的人物牌角色；未抽出時不是隱藏牌，也不得形成組合。');
  if (_lnSignif && spreadId !== 'nine' && spreadId !== 'grand') {
    lines.push('使用者雖選了指示牌' + _lnSignif + '.' + ((CARDS[_lnSignif-1] || {}).name || '') + '，但本牌陣未置入該牌；不得把它加入解讀。');
  }
  lines.push('');

  lines.push('【完整覆蓋判讀法：從問句到全部相關牌句（不要輸出此過程）】');
  lines.push('完整解讀的定義：不是把每張牌的所有字典意思全部列出，而是先逐一覆蓋本牌陣全部合法組合，再輸出其中所有與原問句有關、能形成不同資訊、且有合法牌句支撐的解讀。不得因篇幅、預設段落數或先得到答案，就停止閱讀後續合法組合。');
  lines.push('1. 問句定錨：先用自然語意辨認主體、核心事件或狀態、對象／場所、成立方式、已知限定，以及使用者要的是裁決、原因、方法、時間、比較、人物輪廓或全貌。前端分類、題材關鍵字與牌陣名稱不能替代原問句。');
  lines.push('2. 建立語義部件：把完整問句拆成真正不可缺少的部件，並區分「問句已給定的背景」與「需要由牌面回答的部分」。複合事件要保留其各個必要成分，但不得套固定事件對照表。');
  lines.push('3. 建立合法組合清冊：依本牌陣幾何，先列出全部合法相鄰對、全部合法連續片段、全部完整線，以及網格中的實際交會。這份清冊是閱讀範圍；未完成清冊覆蓋前，不得因已找到一條看似足夠的答案而停止。');
  lines.push('4. 逐對造句：每一組相鄰牌都先形成短語。前牌提出主題、人物、狀態或動作，後牌補出內容、方向、方式、程度、條件、阻礙、轉折或落點；再反向檢查後牌如何重新限定前牌，保留最符合原問句與整條線的一個主要句義。');
  lines.push('5. 逐段合成：從兩張開始，依序讀三張、四張直到完整線。每增加一張，都要說明新牌如何改變前一段，而不是重新從頭列單張牌義。中間牌是橋樑、轉折或作用機制，不能跳過中間牌直接連兩端。');
  lines.push('6. 全線定句：完整線負責說明一段事件如何開始、經過何種機制、最後落到何種狀態。短片段補充全線中的局部作用；若短片段與全線看似不同，先判斷它是條件、階段、內外層或轉折，不得用短片段任意推翻完整線。');
  lines.push('7. 交會整合：兩條線只有在共享同一張實際牌時才能互相補充。先讓兩條線各自成句，再說共享牌如何使兩句形成同一機制、不同面向或互相牽制；不得把轉彎路徑寫成一條不存在的連續組合。');
  lines.push('8. 完整性分類：對清冊中的每個合法組合，在內部標記為①提供新的相關資訊；②與其他組合同義但形成佐證；③形成反向條件、矛盾或轉折；④確實與原問句無關；⑤語義不足，不能支持斷語。第①與第③必須輸出，第②可合併但要保留其加強或核對作用，第④與第⑤不能拿來編故事。');
  lines.push('9. 衝突校準：不同合法組合若出現拉扯，先檢查是否分屬不同階段、人物、作用層、條件或可觀察程度；只有在同一命題、同一層級且無法調和時，才回答不確定。不能以好壞牌數量投票。');
  lines.push('10. 敘事輸出：先直接回答原問句，再依資訊層次完整呈現所有不重複的相關發現，例如核心走向、形成機制、互動方式、助力、阻礙、轉折、可觀察表現與收束。輸出長度由不同資訊量決定，不由牌陣名稱或固定段落數決定。');
  lines.push('');

  lines.push('【牌間關聯與句法】');
  lines.push('1. 單張牌只是詞；相鄰兩張才開始形成短語，三張以上才顯示作用過程。不得把單張牌義直接升格為完整事件。');
  lines.push('2. 相鄰關係具有方向性，也具有互相限定性：先按閱讀方向造句，再檢查後牌是否改變前牌的性質、強度或結果。');
  lines.push('3. 連續片段採巢狀合成：先讀相鄰對，再讀包含它們的三張窗、四張窗與完整線。較長片段不是較短片段的簡單相加，而是對其重新定義。');
  lines.push('4. 每個組合至少檢查四件事：它在說誰／什麼、發生何種作用、這個作用如何被相鄰牌改變、最後落到何種可觀察層級。');
  lines.push('5. 強烈牌只改變它實際所在的片段；不能跨過中間牌吞掉整條線。正向牌不能抹去合法片段中的阻礙、消耗、封閉或結束。');
  lines.push('6. 同一資訊由多條相交線或同一定位牌的不同合法線重複出現時，應呈現為交叉佐證；分散且不相接的相似牌義不能拼成同一事實。');
  lines.push('7. 完整呈現不等於重複。若多個組合說的是同一件事，整合成一個結論並列出不同證據；若它們增加了條件、階段、方式或風險，就必須分開說明。');
  lines.push('');

  lines.push('【回答契約】');
  lines.push('1. 是非題第一句用「有／沒有／偏有／偏沒有／目前無法定論」直接回答，並帶出最關鍵條件；涉及他人未公開內心時，用「牌面偏有此傾向／牌面偏沒有此傾向／目前無法定論」。');
  lines.push('2. 原問句若問原因、方法、時間、趨勢、人物輪廓、比較或多面向，第一句直接回答該要求，不強行改寫成是非題。時間只可說偏快、偏慢、先後階段或問句既定期限內的傾向。');
  lines.push('3. 問句若含牌面無法可靠確認的客觀限定，例如精確年齡、日期、金額、身分或他人未公開事實，將「可由牌面回答的核心」與「無法確認的限定」分層說明，不因其中一項未知而模糊其餘可判斷內容。');
  lines.push('4. 雙路比較第一句說「A較合適／B較合適／兩者各有條件／目前無法分出高下」，並依原問句建立同一比較標準。');
  lines.push('5. 不擴寫與核心問題無關的其他生活領域、第三者私生活或盤外背景；但凡合法組合直接補充核心事件的原因、形成方式、助力、阻礙、轉折、表現與收束，即使問句沒有逐項點名，也必須完整呈現。');
  lines.push('');

  lines.push('【共同方法邊界】');
  lines.push('1. 三張線、五張線、雙路比較與九宮格是本系統採用的現代實務工具；不宣稱為唯一古法。');
  lines.push('2. 不用逆位、塔羅元素、宮廷人格投射、單張長篇自由聯想或牌號數字占算。沒有圖像方向資料時，不使用人物面向、雲的明暗側或鐮刀刀刃方向。');
  lines.push('3. 對健康、犯罪、法律責任、他人內心與可識別個資，只描述牌面傾向、可觀察風險與資訊邊界，不寫成已查證事實或替代專業判定。');
  lines.push('4. 指定人物牌只處理角色歸屬；未實際抽出時不是隱藏牌，也不能形成組合。');
  lines.push('');

  if (spreadId === 'three') {
    lines.push('【本牌陣完整覆蓋法：三張線】');
    lines.push('功能：用一條三張連續句回答聚焦命題；沒有固定過去／現在／未來牌位。牌少不代表只給一句結論，三個合法組合都必須被讀完。');
    lines.push('覆蓋順序：①讀1-2，形成第一個局部作用；②讀2-3，形成第二個局部作用；③判定第2張如何承接、轉換、阻礙、放大、削弱或落實前後兩段；④讀1→2→3完整句，說明兩個局部作用如何組成同一事件；⑤檢查1-2與2-3是否各自增加不同條件、方式、風險或表現，凡有新增資訊都要呈現。');
    lines.push('合法清冊共3組：1-2、2-3、1-2-3。三組都必須完成；1與3不相鄰，禁止另組1-3。');
    lines.push('輸出原則：先用完整三張句裁決，再把兩個相鄰短語帶出的不同細節完整補上。若三組只形成同一資訊，可整合成一段；若各自形成不同條件或轉折，就分段說明，不設固定篇幅。');
  } else if (spreadId === 'five') {
    lines.push('【本牌陣完整覆蓋法：五張線】');
    lines.push('功能：完整呈現單一議題的進入、核心機制、轉折、延伸與落點。第3張是中心樞紐，但不能只讀中心三張而忽略其他連續片段。');
    lines.push('覆蓋順序：①先讀4組相鄰對：1-2、2-3、3-4、4-5；②再讀3組三張窗：1-2-3、2-3-4、3-4-5；③再讀2組四張窗：1-2-3-4、2-3-4-5；④最後讀1-2-3-4-5完整線；⑤比較各層片段，辨認哪些是背景、核心作用、轉折、持續條件與最後落點。');
    lines.push('合法清冊共10組：1-2、2-3、3-4、4-5；1-2-3、2-3-4、3-4-5；1-2-3-4、2-3-4-5；1-2-3-4-5。任何一組若提供不同的相關資訊，都必須輸出；禁止跳牌、鏡像硬組或只讀中心三張。');
    lines.push('輸出原則：依事件脈絡組織，不照清冊逐條報數。完整交代事件如何進入、中心如何運作、哪裡發生轉折、左右兩側如何互相改寫，以及整條線最後形成何種結果；不設固定段落上限。');
  } else if (spreadId === 'choice') {
    lines.push('【本牌陣完整覆蓋法：雙路比較】');
    lines.push('選項A：' + (x.choiceA || '未標明；請依原問句辨認'));
    lines.push('選項B：' + (x.choiceB || '未標明；請依原問句辨認'));
    lines.push('功能：在同一評估標準下，完整比較兩條互斥或可替代路徑。A與B各自是一條三張線，第4張是兩路共同面對的背景、門檻或決勝條件。');
    lines.push('覆蓋順序：①先從原問句建立共同標準；②完整讀A路的1-2、2-3、1-2-3；③完整讀B路的5-6、6-7、5-6-7；④分別整理每一路的起點、運作方式、助力、代價、風險、可持續性與落點；⑤讓第4張分別作用於A整條與B整條，說明同一共同條件如何對兩路造成不同影響；⑥以同一標準逐項比較，再形成總裁決。');
    lines.push('合法清冊：A共3組、B共3組，另有「第4張→A完整支線」與「第4張→B完整支線」兩個整體校正層。第4張不與支線單張另組，A與B也不能跨支線拼接。');
    lines.push('輸出原則：A與B各自所有不同資訊都要呈現，再逐項比較；不能只說哪一路好，也不能因已選出勝方就省略另一條路的條件與代價。若各自適合不同前提，明確列出分歧，不強迫唯一贏家。');
  } else if (spreadId === 'nine') {
    lines.push('【本牌陣完整覆蓋法：九宮格】');
    lines.push('功能：從同一議題的多條交會線建立完整全貌。第5張是語意中心，但完整性來自16組相鄰對與8條完整線的全部覆蓋，不是只選一兩條中心線。');
    lines.push('第一層｜16組相鄰對全部讀完：1-2、2-3、4-5、5-6、7-8、8-9、1-4、4-7、2-5、5-8、3-6、6-9、1-5、5-9、3-5、5-7。每一對先形成局部作用，標記它增加的是來源、狀態、方式、阻礙、轉折、表現或落點。');
    lines.push('第二層｜8條完整線全部讀完：1-2-3、4-5-6、7-8-9、1-4-7、2-5-8、3-6-9、1-5-9、3-5-7。先讀四條穿過中心的主句，再讀四條外圍線；外圍線不是次要而可省略，只要它對原問句形成不同資訊，就必須呈現。');
    lines.push('第三層｜交會整合：逐一檢查各線共享的中心、角牌與邊牌，說明它們是互相支持、形成不同階段、增加條件，還是彼此牽制。兩條線必須先各自成句，禁止轉彎硬接。');
    lines.push('合法清冊共24組：16組相鄰對＋8條完整線。全部必須完成覆蓋；輸出時可把同義組合合併，但所有不同面向、不同條件與矛盾都要保留。');
    lines.push('輸出原則：先回答核心，再按實際形成的面向完整分段，例如核心狀態、形成來源、外在表現、互動機制、助力、阻礙、轉折與收束。段落數由24組產生的不同資訊決定，不設上限，也不為湊字逐線抄牌義。');
    if (drawn[4] && drawn[4]._presetSig) lines.push('中心牌是抽牌前置入的焦點，只負責定位；被置中本身不是隨機徵兆，但它與16組相鄰對及8條完整線的關係仍須全部覆蓋。');
  } else if (spreadId === 'grand') {
    lines.push('【本牌陣完整覆蓋法：36張大牌陣】');
    lines.push('版式：前32張為4排×8張主盤；最後4張是獨立水平收束線，不與主盤建立假想垂直或斜向鄰接。36張不是只看本人牌附近，也不是把36張各自講一次；正確做法是掃描全部合法直線與其連續子段，再把所有與原問句有關的不同資訊整合成關係網。');
    lines.push('階段一｜建立問題地圖：依原問句固定本人或其他主體牌，並為核心事件的每個必要語義部件固定最直接的定位牌。建立「主體—事件—對象／場所—表現方式—結果／限定」地圖，不因牌面好壞、距離遠近或先看到的結果更換定位。');
    lines.push('階段二｜全盤合法線掃描：主盤30條合法最大直線都要讀取。對每條線，先讀全部相鄰對，再依序讀所有三張窗、四張窗……直到整條線；任何連續子段皆合法，跳牌皆不合法。每條線都要在內部標記它是否提供新的相關資訊、同義佐證、反向條件、與問句無關或不足以定論。');
    lines.push('階段三｜主體場完整覆蓋：讀主體牌全部立即鄰牌、所有穿越主體的完整線，以及這些線內所有包含主體的連續片段。分別交代主體目前承受的直接作用、周邊人物／制度／環境、可觀察狀態與較大的事件脈絡。');
    lines.push('階段四｜事件場完整覆蓋：每一張事件定位牌都採相同程序，完整讀其鄰域、穿越線與包含它的所有連續片段。複合事件的各部件必須分別成立，再檢查是否能合成完整事件；不能用情感牌代替表達、用消息牌代替結果、或用場所牌代替事件本身。');
    lines.push('階段五｜直接連接與交會場：若定位牌在同一直線，讀兩者間最短連續片段、包含兩者的所有較長連續窗，以及該整線的前後環境。若不在同一直線，分別完成各自證據場，再讀實際共享牌的交會線；共享牌只連接兩個已成立的句子，不能製造轉彎組合。');
    lines.push('階段六｜全盤擴張：完成主體與事件核心後，回到其餘合法線，收錄所有能直接補充本題之形成原因、互動方式、人物或制度作用、助力、阻礙、延遲、轉折、公開程度、穩定度與可觀察結果的不同資訊。不能因它不在本人附近就省略，也不能因它與核心無關而硬套。');
    lines.push('階段七｜交叉核對與衝突：同一主題若由不同相交線重複出現，呈現為交叉佐證；若支持與阻礙並存，分清它們作用於哪個階段、條件或表現層，再說明最終強度。不得用正負牌數量投票，也不得只保留較順耳的一邊。');
    lines.push('階段八｜末排完整收束：末排33-34、34-35、35-36、33-34-35、34-35-36、33-34-35-36全部讀完，形成獨立收束層。它可補充整體沉澱、延續、未明與關係成熟度，但不能假裝與主盤垂直或斜向相鄰。');
    lines.push('階段九｜覆蓋稽核後輸出：聚焦題要輸出全盤中所有不同且相關的發現，而不只主體場與兩條主線；多領域全景題則為每個領域完整覆蓋其定位場、連接場、助阻與收束。只有同義內容可以合併，任何新增條件、機制、矛盾或結果層都不得省略。');
    if (customFocusId) lines.push('使用者預選焦點為' + customFocusId + '.' + ((CARDS[customFocusId-1] || {}).name || '') + '；它是額外議題入口，不是本人，也不取代依原問句選出的其他必要定位牌。');
    else lines.push('本盤沒有預選議題焦點；由原問句自然語意選出必要定位牌，但仍須先完成30條主盤合法直線的全盤掃描。');
    lines.push('距離只表示關聯直接或間接，不換算時間；左右只作句法順序，不自動代表過去或未來。全36張必然出現，不能以某牌有無出現作證據。');
    lines.push('本系統不使用房屋、騎士跳、鏡像、四角、命運線或牌面朝向；完整性只能來自實際鄰域、全部合法連續片段、完整直線與真實交會。');
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
    lines.push('合法組合總表（共10組）：1-2、2-3、3-4、4-5；1-2-3、2-3-4、3-4-5；1-2-3-4、2-3-4-5；1-2-3-4-5。');
  } else if (spreadId === 'choice') {
    lines.push('合法組合總表：A＝1-2、2-3、1-2-3；B＝5-6、6-7、5-6-7；第4張只作用於A完整支線與B完整支線的共同條件。');
  } else if (spreadId === 'nine') {
    lines.push('九宮格：');
    lines.push('[' + drawn[0].name + '] [' + drawn[1].name + '] [' + drawn[2].name + ']');
    lines.push('[' + drawn[3].name + '] [' + drawn[4].name + '] [' + drawn[5].name + ']');
    lines.push('[' + drawn[6].name + '] [' + drawn[7].name + '] [' + drawn[8].name + ']');
    lines.push('合法相鄰對（共16組）：1-2、2-3、4-5、5-6、7-8、8-9、1-4、4-7、2-5、5-8、3-6、6-9、1-5、5-9、3-5、5-7。');
    lines.push('合法完整線（共8組）：1-2-3、4-5-6、7-8-9、1-4-7、2-5-8、3-6-9、1-5-9、3-5-7。');
  } else if (spreadId === 'grand') {
    var row = function(a,b){ var out=[]; for (var k=a;k<=b;k++) out.push('['+(k+1)+']'+drawn[k].name); return out.join('  '); };
    lines.push('主盤R1（格1-8）：' + row(0,7));
    lines.push('主盤R2（格9-16）：' + row(8,15));
    lines.push('主盤R3（格17-24）：' + row(16,23));
    lines.push('主盤R4（格25-32）：' + row(24,31));
    lines.push('末排獨立收束線（格33-36）：' + row(32,35));
    lines.push('全牌座標索引：' + drawn.map(function(card, idx){ return card.name + '＝' + _lnGrandCoord(idx).label; }).join('；'));
    lines.push('主盤全部合法最大直線索引（共' + _lnGrandStraightLines().length + '條；其內共有' + _lnGrandMainSegmentCount() + '個兩張以上連續子段，必須由兩張逐步讀到整線）：');
    _lnGrandStraightLines().forEach(function(line){ lines.push(line.label + '：' + _lnGrandLineText(drawn, line)); });
    lines.push('末排合法組合：33-34、34-35、35-36、33-34-35、34-35-36、33-34-35-36；完整牌序＝33.' + drawn[32].name + '→34.' + drawn[33].name + '→35.' + drawn[34].name + '→36.' + drawn[35].name + '。');
    if (personRepId) {
      var si = _lnFindCardIndex(drawn, personRepId);
      if (si >= 0) {
        lines.push('問卜者本人牌：' + drawn[si].name + '在' + _lnGrandCoord(si).label + '（全盤第' + (si + 1) + '格）。');
        lines.push('本人牌全部立即鄰牌：' + _lnGrandNeighborText(drawn, si) + '。');
        lines.push('本人牌全部穿越線：' + _lnGrandLinesThroughText(drawn, si) + '。');
      }
    }
    if (customFocusId) {
      var fi = _lnFindCardIndex(drawn, customFocusId);
      if (fi >= 0) {
        lines.push('預選議題定位牌：' + drawn[fi].name + '在' + _lnGrandCoord(fi).label + '（全盤第' + (fi + 1) + '格）。');
        lines.push('預選議題牌全部立即鄰牌：' + _lnGrandNeighborText(drawn, fi) + '。');
        lines.push('預選議題牌全部穿越線：' + _lnGrandLinesThroughText(drawn, fi) + '。');
      }
    }
  }
  lines.push('');

  lines.push('【占卜正文的完整呈現方式】');
  lines.push('1. 第一段第一句依「回答契約」直接回答原問句，不先講方法、牌陣、牌義清單或規則。');
  lines.push('2. 全程繁體中文、台灣用語，像有經驗的讀牌者當面說明。不要展示內部清冊、逐牌字典或定位選擇過程，但正文必須反映清冊中所有不同且相關的資訊。');
  lines.push('3. 先給核心裁決，再按自然層次完整展開：事件主軸、形成方式、條件、互動／傳達、助力、阻礙、轉折、可觀察表現與收束。只有牌面實際形成的層次才寫，不固定套標題，也不因問句簡短就省略相關細節。');
  lines.push('4. 不設字數、段落數或牌陣篇幅上限。三張線也要覆蓋全部3組，五張線覆蓋全部10組，雙路覆蓋兩路與共同校正，九宮格覆蓋全部24組，大牌陣覆蓋所有相關合法連續子段。篇幅只由不同資訊量決定。');
  lines.push('5. 同義證據可以合併成一個結論，但要說明它受到哪些合法組合交叉支持；新增的條件、階段、機制、矛盾、風險或結果層不得以「避免重複」為由刪除。');
  lines.push('6. 每個重要結論必須在句尾標「〔牌面：A＋B＋C〕」，只能引用本盤實際牌名，且每一組所列牌必須屬於同一合法連續組合；整合兩條相交線時分別列出兩組牌面，不把轉彎路徑寫成一組。');
  lines.push('7. 完成正文前做一次覆蓋稽核：確認所有合法組合都已被內部判讀；所有不同且相關的發現都已輸出；同義者已合併；無關或不足者沒有被拿來編造。');
  lines.push('8. 牌面不足時明確說明哪一部分可判斷、哪一部分無法確認；不補盤外人物、事件、精確個資或無關私生活。');
  lines.push('9. 占卜正文只能出現本盤實際牌名；品牌附加層的礦物名、品牌名與連結不受此限制，兩層不得混寫。');
  lines.push('');

  lines.push('【品牌附加層（與占卜正文分離）】');
  lines.push('占卜正文完成後必須另起一段，第一行原樣寫：「以下為免費服務的品牌資訊，與本次牌義結論分開：」');
  lines.push('只介紹一種礦物，並依固定三步選品：①從原問句辨認實際生活情境；②判斷最自然的配戴場合與色系／質感；③在下列情境索引中選一種，再用正文的一個核心生活主題作風格上的呼應。這是營運推薦，不是牌面指定。');
  lines.push('情境索引只作風格選品：工作／生意／金錢場合可選黃水晶、虎眼石、綠幽靈；關係／社交可選粉晶、草莓晶、月光石；決策／轉換／移動可選茶晶、拉長石、黑曜石；溝通／學習／書面往來可選海藍寶、藍紋瑪瑙、紫水晶；沒有清楚關聯時固定白水晶。');
  lines.push('推薦段限2至3句：先說明與問題生活情境、穿搭或視覺質感的關聯，再加入一項下列核准礦物知識，最後自然引導前往靜月之光蝦皮。');
  lines.push('禁止宣稱礦物是牌面指定、能化解牌面、治療、保護、穩定情緒、提升能力、保證招財／桃花／改運或提高預測成真率；不得把象徵、能量或民俗說法寫成客觀功效。');
  lines.push('');
  lines.push('【品牌可用礦物與事實錨點】');
  lines.push('白水晶／紫水晶／黃水晶／茶晶／粉晶：皆屬石英家族，主要成分為二氧化矽、三方晶系、硬度7；紫水晶含鐵並受天然輻照致色，黃水晶由鐵致色，茶晶含鋁並受天然輻射呈煙色，粉晶多呈霧狀半透明、全透明極少。');
  lines.push('草莓晶：石英內含纖鐵礦或赤鐵礦片狀包體。紅瑪瑙／藍紋瑪瑙／紅碧玉：屬隱晶質石英；瑪瑙看天然色帶層次，紅碧玉通常不透明並由鐵氧化物致色。');
  lines.push('月光石：正長石與鈉長石交層形成暈彩。拉長石：屬斜長石、三斜晶系，挑選可看變彩面積。太陽石：內含赤鐵礦或銅片而出現砂金閃光。');
  lines.push('海藍寶：綠柱石族、六方晶系，由鐵致色。黑曜石：火山玻璃、非晶質，常見貝殼狀斷口。黑碧璽：電氣石族、三方晶系，柱面常見縱紋。');
  lines.push('紫龍晶：紫色纖維狀、具絲絹光澤，產於俄羅斯查拉河流域。虎眼石：石英交代石棉假象，呈絲絹貓眼光。綠幽靈：白水晶內含綠泥石包體。葡萄石：斜方晶系，常呈葡萄狀集合體。');
  lines.push('天鐵：鎳鐵隕石，屬鐵鎳金屬、等軸晶系；表面常見氣印，切磨酸蝕後可見魏德曼花紋。它是金屬，不是含氣泡的天然玻璃。');
  lines.push('龍宮舍利：市場名稱，成因與成分說法不一；只能描述珠體圓整、皮殼天然完整、結構緻密等外觀挑選標準，不宣稱地質成因。');
  lines.push('');

  lines.push('【本盤可在占卜正文使用的牌名】' + legalNames.join('、'));
  lines.push('現在開始解讀。先完成占卜正文，再無條件輸出獨立品牌附加層。最後兩行必須原樣照抄，不能加字、合併或省略，最後一行後不得再有內容：');
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
    var sps = [{id:'auto',n:'✦ 自動判斷',d:'依問句幾何選最小充分牌陣（推薦）'},{id:'three',n:'三張線',d:'單一聚焦命題'},{id:'five',n:'五張線',d:'單一議題脈絡'},{id:'choice',n:'雙路比較',d:'兩個可替代方案'},{id:'nine',n:'九宮格',d:'同一議題多面向'},{id:'grand',n:'大牌陣',d:'多領域全景／手動深讀'}];
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
