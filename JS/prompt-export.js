/*! prompt-export.js — 靜月之光 前端提示詞匯出引擎  [v80.0]
 *  v80.0（全牌陣文獻邊界重校 + 嚴格讀法修正）：
 *    1) 逐一區分：原典/可查文獻牌陣、傳統系統應用、現代實務牌陣。
 *    2) 凱爾特十字位置改回 Waite 原文骨架：上方/腳下/身後/身前，不再把第5位硬稱顯性目標。
 *    3) Fifteen-Card 改稱 Thoth/GD 風格十五張；標示來源為 Thoth LWB / Robert Wang lineage，不冒充 Book T 原始開鑰。
 *    4) Mathers First Method 改按原文完整 A/C/E 三組 horseshoe（26+17+11=54張）解讀。
 *    5) 現代牌陣全部維持可用，但不得稱古典正統或官方原法。
 *  v79.0（原典文獻鎖定 + 反幻覺修正）：
 *    1) 全工具改以「原典/可查文獻」標示，不把現代實務包裝成古典正統。
 *    2) 開鑰 recency 檢查改白話，不再要求硬湊跨層重複牌。
 *    3) 雷諾曼禁止引用本盤外牌名做反證，年齡/人物訊號不足時直接說不足。
 *    4) 所有輸出維持命理師/占卜師對提問者口吻，技法只作內部檢查。
 *  v78.0（正統性總修正）：
 *    1) 塔羅：明確區分古典正統牌陣與現代牌陣；所有現代牌陣只宣稱「以 RWS/GD 技法正統分析」。
 *    2) 開鑰：保留 Crowley/Book T 五次操作內部必查，但輸出改為命理師口吻，不再把技術清單當正文。
 *    3) 二選一牌陣修正為實際 5 張，避免提示詞 7 張與前端抽牌 5 張矛盾。
 *    4) 雷諾曼/靈籤：修正人設與輸出規則，區分正統讀法與品牌收尾。
 *  v75.0（塔羅 prompt v2 深度優化 + 開鑰分析深度補強）：
 *    塔羅 head 全面精簡：砍裝飾符號（══ → markdown #）、合併重複指令、移除 800 字限制。
 *    新增「三層因果鏈」（每個結論必須有牌面證據→機制→影響）。
 *    新增「數據層強制覆蓋」8 項清單（正逆比/元素主導/敘事弧/尊嚴互動/宮廷/時間/鑰匙/信號）。
 *    開鑰：精簡鐵律加 Unaspected 每層必做、元素尊嚴至少 2 層展開、禁粗體標題。
 *    跨層重複牌加硬要求至少 2 組。深層拆解必須從落點推不能只換說法。
 *    兩工具 recency 檢查清單全面更新。token 節省約 30%。
 *  v73.1（收尾能量石・賣場自然融入）：新增 FRAG_CRYSTAL，注入 buildPrompt 於 t.tail 與 recency 檢查之間。
 *    指示外部 AI 在解讀全部寫完後，用最後 2-3 句把「牌面主導/匱乏元素」對應一種隨身能量石做輕收尾，
 *    並輕附蝦皮去處（水晶/天鐵/龍宮舍利 https://tw.shp.ee/9UHEJTp4）。鐵則：只一種、只一次、貼結論、
 *    禁優惠/限時/下單等推銷字、牌面沉重時定位為「陪你穩住」。元素綁牌面（火水風土）不綁命盤，
 *    故塔羅+開鑰共用且不破壞開鑰「不引命盤」純粹性。塔羅 head/開鑰 head 一字未動。
 *    ⚠ 只需重新部署 prompt-export.js；index.html 把本檔 ?v= 由 v73_0 bump 成 v73_1。
 *  v73.0（提示詞精簡，深度不變——解決 ChatGPT「訊息太長」）：
 *    I. 兩個 head 大幅精簡：塔羅 10885→6911 字、開鑰 10247→5982 字（總 prompt 12000+→約 8300）。
 *       原則：深度條目一條不刪（22大牌/40小牌/16宮廷正逆義、Decan表、鑰匙五模式、五層拆解、
 *       14禁詞、五鐵律、自我檢查全留），只砍三類肥肉：
 *       ①算法教學（計數步驟/count值表/旬主星教學）——前端引擎已算好填進資料區，AI 不需重學；
 *       ②同一規則在「任務/方法/檢查」重複三次→併一次；③冗詞與過度舉例。
 *    （查證確認：塔羅 timeConclusion 未含 Decan 日期，故塔羅保留 36 旬對照表；
 *       開鑰 Op4 已算好旬位/旬主星/月份，故開鑰移除旬主星教學僅留解讀重點。）
 *  v72.0（對權威來源查證 + 補完 v71 只做一半的開鑰結構化）：
 *  v72.0（對權威來源查證 + 補完 v71 只做一半的開鑰結構化）：
 *    G. 開鑰資料區真正結構化：每層改為 Sig落點／本層活躍牌／Counting 走過（依序+走幾步）／
 *       Pairing 配對（#1最直接）／元素尊嚴 分行，鏡像 head 要求的輸出；op-specific 欄位
 *       （宮/星座/旬/質點）用 safeText 保底不漏。（依 tarot_upgrade.js 實際欄位寫，非臆測）
 *    H. 計數值一致性：查證 PHB《The Tarot and the Magus》/ Crowley / Tarot Elements 後確認——
 *       引擎 Aces 採 count 11（Crowley·Liber 78），資料區明確註記、並依 PHB 慣例開放 AI 另算
 *       count 5（GD）分支對照，解除原 head「5或11」與引擎的矛盾。
 *    （查證結論：head 計數值表、大牌三分類、36 旬 Decan 經核對皆正確，未改。）
 *    ⚠ 待你定奪：GD 原規「逆位宮廷牌→counting 反向 180°」，本引擎採「方向只由 Sig 面向決定、
 *       途中不反向」（modern 簡化；PHB 等亦有人逆位即反向）——無共識，未動引擎。
 *  v71.0（外科手術接全集，head 與風格一字未動，全走 composition + 資料層）：
 *    A. 資料層治本：塔羅/開鑰資料區由「供參考、自行驗證」改「已精算、直接採用、勿重算」
 *       （尤其開鑰 counting 自算極易出錯，準確度最大槓桿）。
 *    B. 禁幻覺：兩工具資料區加「本次合法牌名清單」（替代複製模式失去的後端機械審計）。
 *    C. 注入 FRAG_SOURCELOCK（學理鎖定）/ FRAG_UNCERTAINTY（嚴格不確定判準）/
 *       FRAG_RECENCY_*（交稿前 recency 檢查，防後半段破功）。
 *    D. DOMAIN_HINT 加「✗ 不要主看」；新增 OOTK_ROUTING（Sig 應落堆/Op2 宮/Op4 旬主星）。
 *    E. buildFocusLock 加 window.JY_QUERENT 年齡/性別鉤子（無資料也不會壞）。
 *    F. 兩 tail 補「可驗證信號＋只引用盤上牌」。
 *  v70.1：新增 detectFocus()+buildFocusLock() 注入「本次問題鎖定」；修 getQuestion() DOM 後備 id。
 *  ⚠ 只需重新部署本檔；index.html 記得 bump ?v= 快取版本。
 *  注意：head（TPL.tarot/ootk）長字串維持你原本內容，未改；要改模板仍請改來源後重新產生。
 */
(function () {
  'use strict';

  var BAR = "────────────────────────────";

  var TPL = {
    tarot: {
      label: '塔羅快讀',
      head:  "【人設——專業塔羅師，對提問者說話】\n你是面對面替客人解牌的塔羅師。你已經在內部看完牌陣、位置、正逆位、RWS 圖像、牌與牌之間的互動；現在輸出時只說提問者需要的答案。\n・第一句直接回答問題：會/不會/不一定但傾向、何時、對象或行動。\n・你可以在內部使用正統技法，但不要把技法當課程講給客人聽。\n・每個判斷都要有牌面依據；沒有牌面就說「訊號不足」，不要硬編。\n・語氣像有經驗的命理師：清楚、直接、壞消息不包裝，不講心靈雞湯。\n\n【正統性邊界——必須誠實】\n本工具同時有三類牌陣：\n1. 古典/原典文獻牌陣：Waite 凱爾特十字、Waite 四十二張替代法、Waite 三十五張補充法、Mathers 二十一張、Mathers 第一法 horseshoe、Mathers 六十六張第三法、開鑰之法（Book T）。\n2. 可查傳承/系統應用：Thoth/GD 風格十五張、生命之樹、黃道十二宮、小阿卡那專題、大阿卡那二十二路徑。\n3. 現代實務牌陣：一張牌、三牌、五牌、七張馬蹄形、十字、二選一、時間線、關係牌陣。\n現代牌陣不可說成古典原典；它們的正統性來自你使用 RWS 圖像、Waite 牌義、Golden Dawn/Book T 元素與占星對應做嚴格分析。\n\n【禁語——不要出現在正文】\n不要寫「元素尊嚴、well-dignified、ill-dignified、Card Counting、Triad、Decan、數據層、三層因果鏈、位置1/位置2」。\n可以白話說：「這張牌被旁邊的牌壓住」「這兩張牌互相拉扯」「時間落在六月上旬」「這不是穩定關係的牌」。\n不要逐張報義，不要把每個位置列成表格；所有位置都要用上，但要串成一段針對問題的故事。\n\n【讀牌內部流程——每步都要查，但不用逐條輸出】\n1. 先確認本次牌陣名稱、張數、位置意義與正統性類型。\n2. 先看最終走向/結果牌定大方向，再回頭看現況、阻礙、建議與對方/環境。\n3. RWS 牌陣以位置意義＋正逆位＋圖像敘事為主；元素互動只作輔助，不可壓過位置與正逆位。\n4. Thoth/GD 風格十五張與開鑰類方法不用 RWS 逆位邏輯；以 Golden Dawn/Book T 的元素、配對與三張組合為主。Mathers 1888 兩種方法則照原文允許逆位。\n5. 感情題核心看情感連結與行動慾；金幣在感情題讀現實條件、見面穩定度、身分牽扯，不讀財運。\n6. 涉第三人時，先看對方位與宮廷牌；沒有足夠宮廷牌，不硬推年齡、外貌或身分。\n7. 時間必須由牌面推：資料區時間、GD 占星日期、元素速度、小牌數字階段或大牌事件速度；不可只說「近期」。\n\n【輸出要求】\n・第一句只回答問題，不鋪墊。\n・正文必須包含：為什麼、對方/環境狀態、阻礙、時間窗口、24 小時內可做的事、可驗證信號。\n・至少自然帶到 2 張 RWS 圖像細節，例如人物朝向、姿態、背景、水、山、雲、城牆、光線；不要列清單。\n・每個重要判斷用「——牌名」自然附出處，不標正逆符號。\n・只引用本盤合法牌名清單內的牌；若某訊號不足，說「本盤沒有足夠牌面支撐」，不得引用清單外的牌名做反證。\n・同一結論只講一次；後面每段都要推進新資訊。\n・能量石收尾是品牌實務輔助，不屬塔羅原典；只能在最後 2-3 句自然帶出一種，不可推銷腔。",
      dataHeader: "十、以下是排好的牌陣資料",
      tail:  "請依以上牌面，用繁體中文寫一份完整塔羅解讀。先直接回答問卜者的每一個問題，再用牌面證據說清為什麼；不要逐格報告，不要教技法。必須涵蓋：答案強弱、關鍵牌面證據、阻礙、時間窗口、24 小時內可做動作、可驗證信號。只引用本盤合法牌名清單內的牌。"
    },
    ootk: {
      label: '開鑰之法',
      head:  "【人設——正統開鑰解讀者，對提問者說話】\n你是受 Golden Dawn / Crowley 開鑰之法訓練的解讀者，但現在不是寫論文，是對客人說結果。\n・你內部必須照五次操作逐層檢查；輸出時用白話講「我看到什麼、答案是什麼、時間在哪、你能怎麼做」。\n・不要把開鑰術語堆給客人。客人要的是答案、原因、風險與可驗證信號。\n・壞消息直接講；塔就是崩、死神就是結束，不能包裝成漂亮話。\n\n【正統性邊界——必須誠實】\n本系統以 Golden Dawn《Book T》「A Method of Divination by the Tarot」五次操作為骨架，採 Book T/Thoth 系統的元素、星座、行星、三十六旬與生命之樹對應。\n正統骨架包含：四元素堆、十二宮、十二星座、三十六旬、生命之樹、從主牌起算、兩側配對、元素強弱判斷。\n現代實務擴充包含：不中斷占卜而把非預期落點讀成真實場域、隱藏推力觀察、問題四層拆解、24 小時行動、能量石收尾。這些可以用，但不能包裝成 Crowley 原典。\n開鑰正統不以逆位定吉凶；資料區正逆位與中文義只能作現代輔助，主判斷仍以落點、牌串、配對與元素強弱為準。\n\n【禁語——不要出現在正文】\n不要寫 Op1/Op2/Op3/Op4/Op5、Sig、Significator、Counting、Pairing、Unaspected、元素尊嚴、well-dignified、ill-dignified、風堆/水堆/火堆/土堆、第X宮。\n可以白話改成：「整體處境」「感情那塊」「工作那塊」「內在動力」「時間層」「最深層」「主牌」「牌面走到」「兩側互相照應」「被壓住/被放大」。\n\n【內部五層必查——但輸出要整合】\n每一層都必須查五件事：主牌落點、主導花色、牌面主線、兩側互補、元素強弱與隱藏推力。\n強層深講，弱層一句帶過；但不能沒看就說弱。\n同一張非主牌在多層出現時可作輔助訊號；若沒有明顯重複，明說沒有，不硬湊。\n主牌每層必出現，永遠不能拿來當跨層重複訊號。\n\n【輸出要求】\n・第一句直接回答提問者問題。\n・正文用命理師口吻串成完整答案，不逐層報告，不寫技術清單。\n・必須交代：答案強弱、真實場域、對方/事件狀態、主要阻力、具體時間錨、今天能做的事、可驗證信號。\n・若現代擴充影響判斷，要自然說「這是實務上我會這樣看」，不要說成原典硬規則。\n・每個重要判斷用「——牌名/落點」自然附出處，不引用本盤沒有的牌。\n・能量石收尾是品牌實務輔助，不屬開鑰原典；只在最後自然帶一種。",
      dataHeader: "六、以下是排好的五次操作資料",
      tail:  "請依以上五次操作資料，用繁體中文寫一份完整、有深度的開鑰之法解讀。內部必須完成五層正統檢查，但正文要像命理師對提問者說話：先直接回答問題，再整合五層訊息說明答案、時間、阻力、對方/事件狀態與可行動作。不要逐層報技術流程，不要硬湊跨層重複。只引用本盤實際出現的牌與落點。"
    }
  };

  // ═══ v74 牌陣讀法動態注入 ═══
  // 原本 12 種全塞 head (~800 tok)，改為依當次牌陣只注入對應的 1 種 (~100 tok)。
  // 省 ~700 tok/call，Opus 4.7 $5/M input 下有意義。
  var SPREAD_METHODS = {
    three_card: "本次牌陣：三牌陣（3 張）\n【排法出處】三張線有近代塔羅文獻脈絡；過去/現在/未來是現代普及版，不能宣稱唯一古典原法。\n讀法：三張連成一個故事，現在位是焦點，未來位定短期走向。問題若不是時間題，就改讀成原因→現況→結果。",
    five_card: "本次牌陣：五牌陣（5 張）\n【排法出處】現代實務牌陣，無單一古典文獻；用 RWS 位置義、正逆位、圖像敘事與 Golden Dawn 元素互動做嚴格分析。\n讀法：現況→原因→阻礙→建議→結果。結果定走向，建議位給行動。5 個位置都要用到，但輸出串成故事。",
    cross: "本次牌陣：十字牌陣（5 張）\n【排法出處】現代簡易十字，非凱爾特十字，無單一古典文獻；用 RWS 位置義、正逆位、圖像敘事與 Golden Dawn 元素互動做嚴格分析。\n讀法：核心/阻礙/過去/未來/建議。核心 vs 阻礙是主軸，未來定短期走向，建議給行動。",
    either_or: "本次牌陣：二選一牌陣（5 張）\n【排法出處】現代決策牌陣，無單一古典文獻；用 RWS 位置義、正逆位、圖像敘事與 Golden Dawn 元素互動做嚴格分析。\n讀法：你目前狀態＋A 選項＋B 選項＋A 結果＋B 結果。必須明確比較 A/B 哪條更有利，不能兩邊都好。\n⚠ 5 個位置每個都要讀到：你要什麼、A 會怎樣、B 會怎樣、A 結果、B 結果；最後給單一建議。",
    timeline: "本次牌陣：時間線牌陣（5 張）\n【排法出處】現代時序牌陣；時間推斷技法可採 Golden Dawn 占星日期、元素速度、小牌數字階段。\n讀法：過去根源→近期→轉折點→發展→最終結果。轉折點是時間題重點，必須給具體時間錨。",
    relationship: "本次牌陣：關係牌陣（6 張）\n【排法出處】現代雙人對比牌陣，無單一古典文獻；用 RWS 位置義、正逆位、圖像敘事與 Golden Dawn 元素互動做嚴格分析。\n讀法：你/對方/關係現狀/挑戰/建議/走向。雙方狀態要正面對比；挑戰是最大阻力；走向定短期發展。\n⚠ 6 個位置每個都要讀到，但輸出要串成關係故事，不要逐格報告。",
    celtic_cross: "本次牌陣：Waite 凱爾特十字（10 張）\n【排法出處】A.E. Waite《Pictorial Key to the Tarot》(1910/1911) Part III §7：An Ancient Celtic Method of Divination。古典文獻牌陣。\n讀法照 Waite 骨架：1現況核心、2橫跨此事的力量、3上方/可能成形、4腳下/根基、5身後/正在離開、6身前/即將到來、7本人、8家宅/環境、9希望或恐懼、10最終將至。交叉牌不是固定「逆位才阻力」；它是橫跨現況的力量，依牌性與全局判斷是阻礙或輔助。\n⚠ 凱爾特十字鐵律：10 個位置每個都要用到，但不要逐格報告。必查三組：3上方 vs 4腳下＝理想/表層與根基的落差；5身後 vs 6身前＝正在離開與即將發生；7本人 vs 8環境＝自己立場與外界條件。9 位只能讀希望/恐懼，不可硬當結果。10 位才是收束。",
    tree_of_life: "本次牌陣：生命之樹（10 張）\n【排法出處】Hermetic Qabalah／Golden Dawn 生命之樹結構應用；十個質點骨架有神秘學傳承，但「每質點抽一張」是塔羅實務應用，不是單一官方原典牌陣。\n讀法：先看三柱與上下流動，再看 Tiphereth 核心與 Malkuth 落地。10 個質點都要用到，弱質點一句帶過；不得把此牌陣說成 Waite 或 Book T 原文牌陣。",
    zodiac: "本次牌陣：黃道十二宮（12+1 張）\n【排法出處】占星十二宮位系統正統；塔羅逐宮抽牌屬占星塔羅整合應用，無單一古典塔羅原典。\n讀法：12 宮逐宮掃描，與問題直接相關的宮位深挖，其餘一句帶過；第13張只作總結主旋律，不可壓過相關宮位。宮位含義照正統占星，不可自由改名。",
    minor_arcana: "本次牌陣：小阿卡那專題牌陣（7 張）\n【排法出處】現代小牌專題牌陣；不是古典原典。嚴格性來自只用 56 張小牌，並以 Golden Dawn 小牌占星/元素、花色義、數字階段與具體生活事件判斷。\n讀法：聚焦日常可改變事件；結果位定走向，建議位給行動；不可把大牌式宿命語氣套進小牌專題。",
    fifteen_card: "本次牌陣：Thoth/GD 風格十五張（15 張）\n【排法出處】可查傳承主要見 Thoth Tarot LWB 與 Robert Wang 系統介紹；常被稱 Golden Dawn / Thoth 15-card spread，但我沒有找到它是《Book T》原始開鑰正文的證據。不可稱「Book T 原典牌陣」或「唯一 GD 官方牌陣」。\n讀法：5 組三張；每組以中牌為主、兩側牌用元素強弱修飾。核心三張定本質；自然路徑 vs 替代路徑必須比較；決策層看心理依據；命運線看不可控因素。此法不用 RWS 逆位邏輯；資料區全為正位是正常，不要找逆位。",
    mathers_21: "本次牌陣：Mathers 第二法二十一張（21 張）\n【排法出處】S.L. MacGregor Mathers《The Tarot》(1888) Methods of Divination 第二法。古典文獻牌陣。\n讀法照 Mathers 原文：代表牌放最右，21 張排成三排七張、由右到左置於代表牌左側。每排從代表牌旁邊開始，由右往左讀成一個連貫句子；再配對 1↔21、2↔20、3↔19、4↔18、5↔17、6↔16、7↔15、8↔14、9↔13、10↔12；第11張居中單獨讀。\n⚠ 此法原文要求洗牌時讓部分牌倒置，所以逆位要照牌義讀；不要改成開鑰那種純元素尊嚴。三排沒有固定過去/現在/未來指派，不能硬套時間軸。至少抓 3 組最關鍵配對說因果。",
    mathers_horseshoe: "本次牌陣：Mathers 第一法完整 horseshoe（54 張：A=26、C=17、E=11）\n【排法出處】S.L. MacGregor Mathers《The Tarot》(1888) Methods of Divination 第一法。原文先分出 A/C/E 三組，F=24 張棄用；A、C、E 分別排成 horseshoe，由右到左讀，再首尾配對。古典文獻牌陣。\n讀法：A 組 26 張＝第一組；C 組 17 張＝第二組；E 組 11 張＝第三組。每組先由右到左串成連貫答案，再做首尾配對：A 組 1↔26 到 13↔14；C 組 1↔17 到第9張居中；E 組 1↔11 到第6張居中。\n⚠ 不可只讀 26 張 A 組；不可逐張流水帳；每組要先成句，再用最關鍵配對給裁決。此法原文允許逆位，逆位照逆位義讀。"
  };
  SPREAD_METHODS['_default'] = "本次牌陣：見資料區標示。讀法：完全照資料區每個位置的意義讀，至少抓出核心位、阻礙位、收束位三個錨來組敘事。";

  // v80.11：補齊新增牌陣的專屬正統性邊界與讀法。
  SPREAD_METHODS.one_card = "本次牌陣：一張牌（1 張）\n【排法出處】現代實務快問牌陣，無單一古典原典；嚴格性來自只回答單一焦點，不擴寫成通盤。\n讀法：只抓一個裁決點。第一句直接回答；若牌面訊號不足，明說只能給方向，不硬推時間、人物、年齡或細節。";
  SPREAD_METHODS.horseshoe = "本次牌陣：七張馬蹄形（7 張）\n【排法出處】現代常用實務牌陣；與 Mathers 第一法 horseshoe 不是同一法，不可混稱古典原典。\n讀法：過去→現在→隱藏影響→建議態度→外界/阻礙→下一步行動→結果。要先找第3張隱藏因素與第5張阻礙，再用第6張給行動。";
  SPREAD_METHODS.major_arcana_22 = "本次牌陣：大阿卡那二十二路徑（22 張）\n【排法出處】Hermetic Qabalah/Golden Dawn 路徑對應的塔羅實務應用；22 張大牌與希伯來字母/生命之樹路徑有傳承脈絡，但這不是 Waite 或 Book T 明列的標準問事牌陣。\n讀法：只用大阿卡那，不讀小事細節；看靈魂骨架、命運階段、關鍵轉折。必須先抓出最強的 3 條路徑，再回到問題本身，不可把 22 張逐張流水帳。";
  SPREAD_METHODS.waite_42 = "本次牌陣：Waite Alternative Method 四十二張（42 張）\n【排法出處】A.E. Waite《Pictorial Key to the Tarot》Part III §8 Alternative Method。古典文獻牌陣，適合沒有明確問題或問人生大勢。\n讀法：六排七張，每排連成一條線。六排依序看人格/環境、家宅、希望與恐懼、預期、意外、總結。不要把它硬套成凱爾特十字；它是通盤掃描法。";
  SPREAD_METHODS.waite_35 = "本次牌陣：Waite 三十五張補充法（35 張）\n【排法出處】A.E. Waite《Pictorial Key to the Tarot》Part III §9 Method of Reading by Means of Thirty-Five Cards。古典文獻牌陣，用於前一盤仍有疑義時補判。\n讀法：五排七張；重點不是重新開一個人生大盤，而是釐清前盤疑點。輸出要先指出『哪個疑點被澄清』，再說補充結論。";
  SPREAD_METHODS.mathers_66 = "本次牌陣：Mathers 第三法六十六張（66 張）\n【排法出處】S.L. MacGregor Mathers《The Tarot》(1888) Methods of Divination 第三法。古典文獻牌陣。\n讀法：以代表牌為中心，取 66 張分成過去、現在、未來三大組。先看現在組定主裁決，再用過去組找成因，用未來組看結果。此法大型且重，禁止逐張講完；每組抓主線、阻力、收束即可。";

  function getSpreadMethod() {
    try {
      var S = (typeof window!=='undefined' && window.S) ? window.S : null;
      if (!S) try { S = (0, eval)('typeof S !== "undefined" ? S : null'); } catch(e){}
      var t = (S && S.tarot) || {};
      var id = t.spreadType || (typeof getCurrentSpread === 'function' ? getCurrentSpread() : '');
      if (id && SPREAD_METHODS[id]) {
        var method = SPREAD_METHODS[id];
        // v80.11：把自動選牌陣的原因、旗標、替代牌陣一併交給 AI，避免自動化只知道牌陣名稱卻不知道為何選它。
        try {
          var d = (t && t.spreadDecision) || ((typeof window !== 'undefined') ? window._lastSpreadDecision : null);
          if (d && d.selected === id && d.reason) {
            method += '\n\n【自動牌陣判斷細節】';
            method += '\n選用原因：' + d.reason;
            method += '\n問題長度/問號：' + (d.length || 0) + '字 / ' + (d.qMarks || 0) + '個問號';
            method += '\n來源分級：' + (d.sourceLevel || '未標示');
            method += '\n判斷旗標：' + (d.flags ? Object.keys(d.flags).filter(function(k){return d.flags[k];}).join('、') : '無');
            if (d.alternatives && d.alternatives.length) {
              method += '\n可替代牌陣：' + d.alternatives.map(function(a){ return a.zh + '（' + a.why + '）'; }).join('；');
            }
            method += '\n路由版本：' + (d.version || '');
          }
        } catch(e) {}
        return method;
      }
    } catch(e){}
    return SPREAD_METHODS['_default'];
  }


  // ── 取問卜者問題（多來源防呆）──
  function getQuestion() {
    try {
      var S = (typeof window!=='undefined' && window.S) ? window.S : (typeof self!=='undefined' && self.S) ? self.S : null;
      // ★ 修：S 是 bazi.js 的頂層 const，不掛 window。用 Function 取全域裸 S。
      if (!S || !S.form) { try { S = (0, eval)('typeof S !== "undefined" ? S : null'); } catch(e){} }
      S = S || {};
      var f = S.form || {};
      var q = f.q || f.question || f.text || S.q || S.question || '';
      if (q && String(q).trim()) return String(q).trim();
    } catch (e) {}
    // DOM 後備（★ v70.1 修：補上實際存在的 f-question / f2-question，原本那組 id 都不存在於現行 DOM）
    var ids = ['f-question', 'f2-question', 'tarot-question', 'ootk-question', 'question-input', 'q-input', 'userQuestion'];
    for (var i = 0; i < ids.length; i++) {
      var el = document.getElementById(ids[i]);
      if (el && el.value && el.value.trim()) return el.value.trim();
    }
    return '（問卜者未填寫明確問題，請依牌面給通盤解讀）';
  }

  // ── 問題分類引擎（v70.1 治本：補回 v70 改純前端複製後掉的 focusType 分類）──
  //    純前端、零 API、零 worker。只做「這次問的是什麼性質的問題」，
  //    結果用來在提示詞最前面注入「本次問題鎖定」——讓 AI 聚焦，不再把單一問題擴寫成通盤運勢。
  function detectFocus(q) {
    var s = String(q || '');
    var noQ = !s || /未填寫明確問題/.test(s);
    var has = function (re) { return re.test(s); };

    // 領域：★ v70.7 根治——改讀單一權威分類器 window.JY_classifyDomains（與開鑰 detectQuestionType 同源，
    //   不再各自維護詞庫、不再各說各話）。統一 enum → 鎖定區 5 類映射(secret 併入 love，family/study/friend 鎖定區不細分故略)。
    var _map5 = { love: 'love', secret: 'love', money: 'wealth', work: 'career', health: 'health', spiritual: 'spiritual' };
    var _rawHits = (typeof window !== 'undefined' && window.JY_classifyDomains) ? window.JY_classifyDomains(s) : [];
    var domains = [];
    _rawHits.forEach(function (h) { var m = _map5[h]; if (m && domains.indexOf(m) < 0) domains.push(m); });

    // 形態
    var isTiming   = has(/什麼時候|何時|幾月|幾號|幾點|多久|多快|近期|這(週|個禮拜)|這個月|下個月|今年|明年|今晚|今天|明天|後天|這幾天|最近(會|能)|還要多久/);
    var isUrgent   = has(/今晚|今天|等等|待會|這幾(個)?小時|24小時|馬上|立刻|這一兩天|此刻/);
    var isYesNo    = has(/嗎[？?]?\s*$|會不會|是不是|有沒有|能不能|可不可以|是否|對不對|對嗎|好不好|行不行/);
    var isDecision = has(/該不該|要不要|該(選|留|走|分|放棄|繼續)|選.{0,6}還是|.{1,6}還是.{1,6}[好嗎？?]|哪個(好|對|適合)|哪一個|值不值得|值得嗎|適合嗎|留還是走|分還是不分/);
    var isPortrait = has(/對方是(誰|什麼)|他是(誰|什麼樣)|她是(誰|什麼樣)|(他|她|對方).{0,4}(在想|怎麼想|想我|想念|想不想我|愛不愛我|還想|還愛|過得|好不好)|什麼樣的人|對方(的)?(個性|長相|職業)|他喜(不喜)?歡我|她喜(不喜)?歡我/);

    return { noQ: noQ, raw: s, domains: domains, timing: isTiming, urgent: isUrgent, yesno: isYesNo, decision: isDecision, portrait: isPortrait };
  }

  var DOMAIN_HINT = {
    love:    '感情/關係——核心看聖杯（情感連結）與權杖（行動慾）。缺聖杯＝可能是「想要」不是「愛」；缺權杖＝對方沒主動能量。✗ 別把金幣多讀成財運、權杖多讀成工作。涉及第三人先查有沒有宮廷牌再推畫像。',
    career:  '事業/工作——核心看權杖（熱情驅動）與金幣（落不落地）。缺權杖＝缺動力；多金幣＝跟錢/實務綁定。✗ 別把聖杯多讀成「同事感情好」。若同時出現寶劍九/十/塔＝身心扛不住，推進要降速。',
    wealth:  '財運/財務——核心看金幣＋數字階段（金幣三穩步、五破財、十圓滿）。缺金幣＝想法不踏實。✗ 別把聖杯多讀成人脈財。是非題給「會不會進帳/虧損」的明確方向；被問到具體金額而牌面無對應＝老實說「方向是X，但這個數字牌面沒給」。',
    health:  '健康——牌面只給「狀態與節奏」的象徵訊號，不做醫療診斷。寶劍多＝思維過載/焦慮、金幣弱＝身體根基。✗ 不給病名。誠實說塔羅看不到具體病灶。',
    spiritual:'靈性/課題——靈性層的話必須有牌面出處（如「審判正＝這段業力正在結」），不可用靈性詞解釋靈性詞，不造神。大牌≥4＝強業力訊號。'
  };

  // ── 開鑰：問題領域 → Sig 應落堆 / Op2 應落宮 / Op4 旬主星（落點對不對＝對應 vs 揭示真實場域的判準）──
  var OOTK_ROUTING = {
    love:    'Sig 應落水堆（聖杯）＝感情場域對應；Op2 應落 5/7 宮；Op4 旬主星＝金星/月亮＝對應準確。落火/土/風堆＝揭示真實場域（對方來自工作圈/物質圈/紛爭，不是浪漫場合）。',
    career:  'Sig 應落火堆（權杖）＝事業場域；Op2 應落 10 宮；Op4 旬主星＝太陽/木星/水星（名望/擴張/契約）。',
    wealth:  'Sig 應落土堆（金幣）＝物質財富場域；Op2 應落 2/8 宮；Op4 旬主星＝金星/木星（財富擴張）。被問具體金額而落點無對應＝講形式不保證數字。',
    health:  'Sig 落水堆過多＝情緒影響身體；Op2 應落 6/8/12 宮；Op4 旬主星＝土星/火星（慢性/急症）。只給方向時段、不診斷病名。',
    spiritual:'★ Op5 生命之樹質點＝此題核心答案（其他題 Op5 是收束層，此題直接是答案）；五層花色集中度＝靈魂目前最強的能量類型。'
  };

  // ── 注入片段(治本式接全集，避免堆 prompt：只補既有 head 沒有的高槓桿規則)──
  // ① 嚴格不確定判準：防 AI 把「訊號弱」當偷懶藉口
  var FRAG_UNCERTAINTY_TAROT =
    '\n【說「訊號弱」前的硬檢查】\n「弱」不是偷懶的避難所。要說某題訊號弱，先確認：每張牌的牌陣位置、正逆狀態、同題相關的牌與牌互動、花色/數字/人物線索都已對照過。全部看過仍沒有指向，才能說訊號不足；並用白話說「這盤沒有足夠牌面支撐」，不要只丟不確定三個字。\n';
  var FRAG_UNCERTAINTY_OOTK =
    '\n【說「訊號弱」前的硬檢查】\n「弱」不是偷懶的避難所。要說某一層或某個子問題訊號弱，先確認：主牌落點、牌面走向、兩側呼應、元素強弱與隱藏推力都已看過。全部看過仍沒有指向，才能說訊號不足；正文用白話說明，不要輸出技術流程。\n';
  // ② 學理鎖定：擋掉網紅/心理學/雞湯，逼回正統
  var FRAG_SOURCELOCK =
    '\n【學理鎖定】只用三種知識：①本盤實際數據 ②可查原典/文獻（Waite《Pictorial Key》、Golden Dawn/Book T、Mathers、Crowley《Book of Thoth》）③已明示為現代實務的輸出框架。禁止：把現代實務包裝成古典原典、現代網紅塔羅詮釋、把心理學框架硬套（「逆位＝陰影面需療癒」）、靈性雞湯、無牌面支撐的道德勸說。若原典沒有明說，要用「實務上我會這樣看」而不是「正統必然」。\n';
  // ③ 交稿前 recency 檢查：模型最常在後半段破功，放最後一段（recency 最強）
  var FRAG_RECENCY_TAROT =
    '\n' + BAR + '\n交稿前檢查（後半段最容易破功）\n' + BAR +
    '\n□ 牌陣張數與位置讀對 □ 每個位置都已用於回答問題但未逐格報告 □ 只引用本盤合法牌名 □ 壞消息沒有包裝 □ 第一段已直接回答問題 □ 有說明原因、阻礙、時間、24小時行動、可驗證信號 □ 人物/年齡/外貌只在牌面足夠時才推 □ 不把現代牌陣說成古典原典 □ 不重複同一結論 □ 能量石只作品牌收尾且不冒充原典\n';
  var FRAG_RECENCY_OOTK =
    '\n' + BAR + '\n交稿前檢查（後半段最容易破功）\n' + BAR +
    '\n□ 五層內部檢查都已完成 □ 正文沒有輸出 Op/Sig/Counting/Pairing 等術語 □ 沒把主牌每層必出現當重複訊號 □ 沒硬湊跨層重複牌 □ 沒用正逆位取代開鑰主判斷 □ 有具體時間錨 □ 有說明真實場域、阻力、行動、可驗證信號 □ 現代實務擴充有誠實標示，不冒充 Crowley 原典 □ 只引用本盤實際出現的牌與落點 □ 能量石只作品牌收尾且不冒充原典\n';

  // ④ 收尾能量石（v73.1 歐那）：把賣場自然融進解讀結論，不是廣告區塊。
  //    元素一律綁「牌面」（火水風土＝權杖聖杯聖杯寶劍金幣／開鑰 Op1 YHVH 堆），
  //    不碰八字五行命盤——故塔羅與開鑰共用，且不破壞開鑰「不引命盤」的純粹性。
  //    放在 t.tail 之後、recency 檢查之前（緊貼結論、但不搶最後品管位）。
  var FRAG_CRYSTAL =
    '\n【收尾・能量石（自然帶出，禁推銷腔）】\n' +
    '整份解讀寫完後，用最後 2-3 句輕收一個尾：先判斷這次牌面「最關鍵的一個元素失衡」——是某元素缺得最明顯，還是某元素過盛在添亂——再對應一種可隨身的能量石，當成支持這股能量的小提醒。\n' +
    '元素對照（缺的補、過盛的衡，挑一種）：火（權杖）不足→紅瑪瑙/太陽石/紅碧玉；火過盛躁進→黑曜石/黑碧璽。水（聖杯）不足→粉晶/草莓晶/月光石；水過盛情緒淹沒→拉長石/海藍寶。風（寶劍）不足→白水晶/海藍寶/藍紋瑪瑙；風過盛心緒亂→紫水晶/紫龍晶。土（金幣）不足→黃水晶/茶晶/虎眼石；土過盛僵固→綠幽靈/葡萄石。若牌面以寶劍密集／塔／惡魔等衝突崩解為主→天鐵（辟邪定志）或龍宮舍利（護身安神）。\n' +
    '鐵則：只挑一種、只講一次、貼著這次結論說清「為什麼對你是它」。全程禁「優惠／特價／限時／下單／搶購／快買」。若牌面沉重，語氣穩重，把石頭定位成「陪你穩住」。\n' +
    '\n收尾寫法規則——每次必須不同，禁止複製貼上：\n' +
    '・你是「靜月之光」的塔羅解讀者，對問卜者（客人）說話。不是在給店主經營建議。\n' +
    '・⚠ 禁止出現「你蝦皮可以放」「你的賣場適合上架」「給需要的人看」這類對店主說話的語氣。你就是店主，你在對客人推薦。\n' +
    '・結尾必須像解讀者順口多聊一句，不是廣告區塊。每次用不同的切入角度。\n' +
    '・加一句你為什麼懂這顆石頭的「知識句」，讓人覺得你挑貨有標準。\n' +
    '・蝦皮連結放在最後，用自然語氣帶過。\n' +
    '\n✗ 錯誤（每次複製貼上同一句）：\n' +
    '「想入手的話，我蝦皮〈靜月之光〉有水晶・天鐵・龍宮舍利 https://tw.shp.ee/9UHEJTp4」\n' +
    '→ 這句看第二次就知道是模板，信任感歸零。\n' +
    '\n✓ 正確（每次不同、有知識、有理由）：\n' +
    '例1（推紫水晶）：「這盤風氣太躁，我自己會挑巴西料、色深透光的紫水晶壓場，戴著讓腦袋先安靜再做判斷。我蝦皮有挑過的 → https://tw.shp.ee/9UHEJTp4」\n' +
    '例2（推黑曜石）：「火逆位這麼密集，黑曜石比粉晶實際——它不催桃花，是幫你擋掉衝動決定。要挑的話認墨西哥料，光澤對、能量沉。靜月之光有 → https://tw.shp.ee/9UHEJTp4」\n' +
    '例3（推茶晶）：「缺土缺得厲害，茶晶是最直接的落地石，不花俏但管用。我會挑煙色自然、不染色的巴西茶晶。蝦皮靜月之光找得到 → https://tw.shp.ee/9UHEJTp4」\n' +
    '例4（推天鐵）：「塔＋惡魔這種盤面，水晶不夠，天鐵比較對。俄羅斯坎皮諾隕鐵，幾十億年前的東西，辟邪定志不是說說。我蝦皮有現貨 → https://tw.shp.ee/9UHEJTp4」\n' +
    '→ 每句都不同、都有一個「為什麼我挑這個」的知識點、連結自然帶入。\n';

  // ── 組裝「本次問題鎖定」區塊（放在提示詞最前面，primacy 最強）──
  //    ★ v70.4(歐那 2026/5/29)：分工具。塔羅快讀＝yes/no 直答導向；
  //      開鑰之法＝深度拆解導向（絕不能用塔羅的「給是非、禁止擴寫」框架，那會直接掐死開鑰的五層拆解本質）。
  function buildFocusLock(q, tool) {
    var f = detectFocus(q);
    var L = [];
    L.push(BAR);
    L.push('◆ 本次問題鎖定（最高優先，先讀這段再讀下面的技法）');
    L.push(BAR);
    try { var _Q = (typeof window !== 'undefined') && window.JY_QUERENT; if (_Q && (_Q.age || _Q.gender)) L.push('【問卜者本人】' + [(_Q.gender || ''), (_Q.age ? ('約' + _Q.age + '歲') : '')].filter(Boolean).join('、') + '——宮廷牌年齡段以此為基準推（問卜者年長＝騎士多為晚輩/下屬；年輕＝皇后國王多為長輩）。'); } catch (e) {}

    // ── 開鑰之法：深度拆解導向（不走塔羅的 yes/no 框架）──
    if (tool === 'ootk') {
      if (f.noQ) {
        L.push('問卜者沒有填寫明確問題。');
        L.push('→ 依五次操作的落點與 counting／pairing，從牌面反推這次最該被回答的核心議題，做完整的五層拆解；不要七個領域亂掃。');
        return L.join('\n') + '\n';
      }
      L.push('問卜者問的是：' + f.raw);
      var domZh = f.domains.length ? ({ love: '感情／情慾', career: '事業／工作', wealth: '財運', health: '健康', spiritual: '靈性' })[f.domains[0]] : '';
      if (domZh) {
        var fieldNote = (f.domains.indexOf('love') >= 0 && /同事|公司|主管|老闆|職場/.test(f.raw))
          ? '（對象來自工作場域——場域只是「在哪認識」，不改變這是情慾／感情題的本質）' : '';
        L.push('問題領域：' + domZh + fieldNote + '。');
      }
      if (f.domains.length && OOTK_ROUTING[f.domains[0]]) L.push('・落點對應判準：' + OOTK_ROUTING[f.domains[0]]);
      L.push('這是開鑰之法，不是塔羅快讀——不要停在表層「會／不會」就結束。開鑰的價值是拆穿問題背後真正在問什麼、卡在哪、重複過幾次、現在能做什麼：');
      L.push('・開頭可用一兩句點出表層傾向，但重點往下拆，務必完成「問題四層拆解」（表層／深層／重複模式／鑰匙行動，全部只從牌面落點推、不做性格診斷）。深層問題要從牌面推這題背後真正在問的——例如問「對方想不想」常是在問「我在這段關係裡的位置」「我是否渴望被這個人慾望」，不要套通則。');
      L.push('・Sig 落在任何元素堆／宮位／星座／質點，都讀成「揭示真實場域」、對準問題給洞察，不是失敗、不是 abandon。例：落水堆＝這件事對你是情感投射；落第 1 宮＝核心其實在你自己（你的吸引力、你的慾望、你怎麼看自己），不只在對方。');
      if (f.portrait || f.domains.indexOf('love') >= 0) {
        L.push('・問的是對方意圖／狀態→用第十一節五次操作內部交叉推「對方目前狀態＋兩人能量距離」，給得出畫像就給，不要只丟一個是非。');
      }
      return L.join('\n') + '\n';
    }

    // ── 塔羅快讀：yes/no 直答導向 ──
    if (f.noQ) {
      L.push('問卜者沒有填寫明確問題。');
      L.push('→ 不要七個領域都掃一遍。先看花色集中：聖杯多＝感情、權杖多＝事業/行動、金幣多＝財務、寶劍多＝思考/衝突；以最集中的花色鎖定「一個」最可能的領域，針對它給通盤，其餘略過。');
      return L.join('\n') + '\n';
    }

    L.push('問卜者問的是：' + f.raw);

    // 形態（決定回答骨架）
    var shape = [];
    if (f.yesno)    shape.push('是非題');
    if (f.decision) shape.push('決策題');
    if (f.timing)   shape.push('時間題');
    if (f.portrait) shape.push('對方畫像題');
    if (f.domains.length) shape.push(({love:'感情',career:'事業',wealth:'財運',health:'健康',spiritual:'靈性'})[f.domains[0]] + '題');
    if (shape.length) L.push('問題性質：' + shape.join('＋') + (f.urgent ? '＋極短時間窗' : '') + '。');

    L.push('回答要求：');
    L.push('・第一句就直接回答「' + f.raw + '」這個問題本身，不要鋪墊、不要先講方法。只圍繞這個問題答，禁止擴寫成「你們長期走向」「你的人生課題」這類通盤論述。');

    if (f.yesno)    L.push('・是非題：第一句給「會／不會／是／不是／不一定（但傾向X）」。逆位/凶牌不要硬讀成正面。');
    if (f.decision) L.push('・決策題：兩個選項各給支持證據，比完之後明確推一個，不要兩邊都好。');
    if (f.timing) {
      L.push('・時間題：必須給「為什麼是這個時間」。用花色速度收斂——權杖（火）最快、寶劍（風）次快但偏衝突、聖杯（水）中等、金幣（土）最慢；或用小牌 Decan 日期、大牌時間含義。要說出從哪張牌推。禁止「近期/快了/順其自然」這種沒錨點的話。');
      if (f.urgent) L.push('・這是「' + (/今晚/.test(f.raw) ? '今晚' : /今天/.test(f.raw) ? '今天' : '這一兩天') + '」的極短窗：直接收斂到當下能不能成。土系牌多＝慢/今晚不太可能；火系牌多＝當下就有動能。據此給明確傾向。');
    }
    if (f.portrait) L.push('・對方畫像題：先檢查牌陣有沒有宮廷牌——有才推年齡/外型，沒有就誠實說「牌面沒有人物牌，無法推年齡」，不要憑空編「她35歲/姓黃/金融業」。');

    f.domains.slice(0, 2).forEach(function (d) { if (DOMAIN_HINT[d]) L.push('・' + DOMAIN_HINT[d]); });

    return L.join('\n') + '\n';
  }

  // ── 取排盤資料塊（沿用現有 builder，已含全部 GD/Mathers/Crowley/PHB 運算）──
  // ── 防呆字串化：任何型別都轉成乾淨文字，杜絕 [object Object] ──
  function safeText(v) {
    if (v === null || v === undefined) return '';
    var t = typeof v;
    if (t === 'string' || t === 'number' || t === 'boolean') return String(v);
    if (Array.isArray(v)) {
      return v.map(function (item) {
        if (item === null || item === undefined) return '';
        var it = typeof item;
        if (it === 'string' || it === 'number' || it === 'boolean') return String(item);
        if (it === 'object') {
          if (item.meaning && (item.a || item.b)) return (item.a || '') + '↔' + (item.b || '') + '：' + item.meaning;
          if (item.message) return ((item.cards && item.cards.join) ? item.cards.join('×') + '——' : '') + item.message;
          if (item.name && item.meaning) return item.name + '：' + item.meaning;
          if (item.cardName) return item.cardName + (item.sephirotZh ? '→' + item.sephirotZh : '');
          return Object.keys(item).map(function (k) {
            var x = item[k];
            return (typeof x === 'string' || typeof x === 'number') ? String(x) : '';
          }).filter(Boolean).join(' ');
        }
        return '';
      }).filter(Boolean).join('；');
    }
    if (t === 'object') {
      if (v.meaning) return String(v.meaning);
      return Object.keys(v).map(function (k) {
        var s = safeText(v[k]);
        return s ? (k + '：' + s) : '';
      }).filter(Boolean).join('｜');
    }
    return '';
  }

  // ── 塔羅：結構化物件 → 模板要的逐張牌文字 + 預運算數據 ──
  function formatTarotData(result) {
    var td = (result && result.tarotData) || {};
    var cards = td.cards || [];
    var L = [];
    L.push('牌陣類型與各位置：');
    L.push((td.spreadZh || td.spreadType || '未指定牌陣') + '（共 ' + cards.length + ' 張）');
    L.push('');
    L.push('抽到的牌（逐張，含位置／牌名／正逆位）：');
    cards.forEach(function (c, i) {
      var pos = c.positionMeaning || c.position || ('位置' + (i + 1));
      var ln = (i + 1) + '. ' + pos + '：' + (c.name || '');
      if (c.keywords) ln += '〔' + c.keywords + '〕';
      if (c.meaning) ln += ' → ' + c.meaning;
      if (c.gdCourtAnalysis) { var g = safeText(c.gdCourtAnalysis); if (g) ln += '｜宮廷牌：' + g; }
      L.push(ln);
    });
    // ★ 合法牌名清單（禁幻覺——複製模式沒有後端機械審計，用清單替代）
    var _legal = cards.map(function (c) { return c.name; }).filter(Boolean);
    if (_legal.length) { L.push(''); L.push('【本次合法牌名清單（你只能引用這些牌，清單外的牌一律不可出現）】'); L.push('  ' + _legal.join('、')); }
    var extra = [];
    function add(label, val) { if (val !== null && val !== undefined && val !== '' && !(val.length === 0)) { var s = safeText(val); if (s) extra.push(label + '：' + s); } }
    add('正逆位參考', td.summary);
    add('大牌比重', td.majorWeight);
    add('元素尊嚴', td.elementalDignity);
    add('元素互動', td.elementInteraction);
    add('對立牌組', td.opposingPairs);
    // ★ v75.5：storyArc 移除——不屬於任何正統塔羅讀法，改由 AI 看核心牌→收束牌自行判斷敘事方向
    // add('故事弧線', td.storyArc);
    add('特殊牌組合', td.combos);
    add('數字模式', td.numberPatterns);
    add('時間推斷', td.timeConclusion);
    add('宮廷人物', td.courtPeople);
    add('數字學', td.numerology);
    add('卡巴拉對應', td.kabbalah);
    add('牌面張力', td.tensions);
    if (td.preStats && td.preStats.insights) add('前端洞察', td.preStats.insights);
    if (extra.length) {
      L.push('');
      L.push('── 以下數據已由排盤系統精算完成，請【直接採用】，不要自行重算。尤其元素尊嚴、Decan 日期、數字模式是機械運算結果，重算只會出錯——你的工作是「解讀」這些既定數據，不是重算 ──');
      extra.forEach(function (e) { L.push('・' + e); });
    }
    return L.join('\n');
  }

  // ── 開鑰之法：結構化物件 → 五次操作完整文字 + 補充觀察 ──
  function formatOOTKData(result) {
    var od = (result && result.ootkData) || {};
    var ops = od.operations || {};
    var ca = od.crossAnalysis || {};
    var sig = od.significator || {};
    var L = [];
    L.push('── 以下五次操作資料（含 counting／pairing／dignities 計算）已由排盤系統精算完成，請【直接採用】。計數路徑、配對、元素尊嚴都已算好——不要自己重數、重排或重算位置（Book T counting 自己算極易出錯）；你的工作是依這些既定結果做解讀。【計數值】本引擎 Aces 採 count 11（Crowley·Liber 78）；如 Paul Hughes-Barlow 慣例，你可另提 count 5（GD：四元素＋乙太）的分支作對照，但上述路徑是 11 版，不要拿 5 去否定它 ──');
    L.push('');
    var sigName = sig.n || sig.name || (typeof sig === 'string' ? sig : '');
    var sigPrefix = '';  // ★ v76：OOTK 不標正逆位
    var sigFacing = (sig.isUp === true) ? '面向解讀：代表牌面右——counting 向右走,重心傾向未來' : (sig.isUp === false ? '面向解讀：代表牌面左——counting 向左走,注意力傾向過去' : '');
    L.push('代表牌（Significator）：' + (sigName || safeText(sig) || '（未提供）'));
    if (sigFacing) L.push(sigFacing);
    L.push('');
    var opLabels = {
      op1: 'Op1 四元素堆（YHVH）——當下處境',
      op2: 'Op2 十二宮——問題的展開',
      op3: 'Op3 十二星座——進一步展開（內在驅力）',
      op4: 'Op4 三十六旬——倒數階段（時機節奏）',
      op5: 'Op5 生命之樹——最終結果（靈魂本質）'
    };
    // ★ 把每層真正結構化（鏡像 head 要的 Sig落點/Counting/Pairing/Dignities），
    //   op-specific 欄位（宮/星座/旬/質點，名稱不一）用 safeText 保底，絕不漏資料。
    function cn(c) { return c ? (c.n || c.name || '?') : '?'; } // ★ v76：OOTK 不標逆位
    var PILE = { fire: '火堆 Yod（工作/事業）', water: '水堆 Heh（感情/快樂）', air: '風堆 Vau（衝突/損失/思維）', earth: '土堆 Heh-final（金錢/物質）' };
    // ── 精簡：引擎把整個 Op 分析當長字串傳來；剝掉每層重複 5 次的方法論講稿＋Mathers 1888 字典＋裝飾線，只留實際牌面/路徑/配對/落點 ──
    function _slimOp(s) {
      if (typeof s !== 'string') return safeText(s);
      return s
        // ── 額外鷹架（每 Op 重複、且 head 已涵蓋，砍掉不損牌義／路徑／尊嚴）──
        .replace(/[^\n]*盤面揭示・真實場域（[^）]*）/g, '')
        .replace(/【本 Op Narrative Pairs[\s\S]*?(?=\n+[━【★]|$)/g, '')
        .replace(/（配對是從代表牌兩側對稱展開[\s\S]*?）/g, '')
        .replace(/【Op4 雙版本對照】[\s\S]*?鏡像細節」。/g, '')
        .replace(/（Mathers：[^（）]*）/g, '')
        // ── v74.1 清理：截斷的方向尊嚴 JSON、孤兒 📍、與 Thoth 鎖矛盾的 Waite 挑版本提示 ──
        .replace(/【本 Op 宮廷牌面向互動[\s\S]*$/g, '')
        .replace(/\n[ \t]*\u{1F4CD}[ \t]*(?=\n)/gu, '')
        .replace(/★ AI 提示:Waite 與 Crowley[\s\S]*?並列。/g, '')
        // ── v74.2：Op4 同數字組／主導花色 砂 Waite 欄，只留 Crowley（呼應 head 的 Thoth 鎖）──
        .replace(/\n[ \t]*\[Waite 1910\][^\n]*/g, '')
        .replace(/Mathers 1888:[^\/\n]*\/ *(?=Crowley Liber 78)/g, '')
        .replace(/Waite 1910 vs /g, '')
        .replace(/ 雙版本/g, '')
        .replace(/（v63 正統 Book T：[\s\S]*?結論牌」。）/g, '')
        .replace(/（★ Mathers 原文：[\s\S]*?本身的能量。）/g, '')
        .replace(/★ 本 Op 為[\s\S]*?排名。/g, '')
        .replace(/Mathers 原文:「Pair[\s\S]*?不跨 Op 比較。/g, '')
        .replace(/Sig\([^)]*\)兩次都落[\s\S]*?照常進行。/g, '')
        .replace(/AI 必讀:[\s\S]*?(?:照常給答案。|當讀盤失敗。|不可給強斷言。)/g, '')
        .replace(/Op\d+ 預期觀察[\s\S]*?分開看。」/g, '')
        .replace(/把這個落堆讀成[\s\S]*?照常給答案。/g, '')
        .replace(/不要寫「[^」]*」「?[^」]*」?，?也?不要把它當讀盤失敗。/g, '')
        .replace(/【Mathers 1888:[^】]*】/g, '')
        .replace(/【GD:[^】]*】/g, '')
        .replace(/【(?:well|ill) 含義:[^】]*】/g, '')
        .replace(/[━]{6,}/g, '')
        .replace(/[ \t]+\n/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
    }
    ['op1', 'op2', 'op3', 'op4', 'op5'].forEach(function (k) {
      if (!ops[k]) return;
      var o = ops[k];
      L.push('────────────────────────');
      L.push('【' + opLabels[k] + '】');
      if (typeof o === 'string') { var _s = _slimOp(o); if (_s) L.push(_s); L.push(''); return; }
      if (o.activePile) L.push('Sig 落點/活躍堆：' + (PILE[o.activePile] || o.activePile) + (o.meaning ? '（' + o.meaning + '）' : ''));
      if (o.activeCards && o.activeCards.length) L.push('本層活躍牌：' + o.activeCards.map(cn).join('、'));
      if (o.countingPath && o.countingPath.length) L.push('Counting 走過（依序，方向已定，勿重數）：' + o.countingPath.map(function (p) { return (p.cardName || '?') + '〔走' + p.countValue + '〕'; }).join(' → '));
      if (o.mq_countingPath && o.mq_countingPath.length) L.push('Op4 環形 Counting（順發牌方向，1↔36 時序）：' + o.mq_countingPath.map(function (p) { return (p.cardName || '?') + '〔走' + p.countValue + '〕'; }).join(' → '));
      if (o.pairs && o.pairs.length) L.push('Pairing 配對（Sig 兩側往外，#1 最直接）：' + o.pairs.map(function (pr, i) { if (!pr || pr.single || !pr.right) return '#' + (i + 1) + ' 單張殘餘:' + cn(pr && pr.left); return '#' + (i + 1) + ' ' + cn(pr.left) + '↔' + cn(pr.right) + (pr.dignity ? '〔' + safeText(pr.dignity) + '〕' : ''); }).join('；'));
      if (o.dignities) { var _dg = safeText(o.dignities); if (_dg) L.push('元素尊嚴：' + _dg); }
      // ★ v75.2：Op4 預算公曆日期，明確顯示，AI 不需再自己換算
      if (o.decanDateRange) L.push('聚焦旬：' + (o.decanSign||'') + ' ' + (o.decanRange||'') + ' → 公曆約 ' + o.decanDateRange + '（旬主星：' + (o.decanPlanet||'') + '）');
      // op-specific 落點與其餘欄位（宮位/星座/旬/質點及其含義，名稱不一，safeText 保底）
      var _rest = {}, _skip = { piles: 1, activePile: 1, meaning: 1, activeCards: 1, sigIndex: 1, keyCards: 1, countingPath: 1, mq_countingPath: 1, pairs: 1, dignities: 1, decanSign: 1, decanRange: 1, decanPlanet: 1, decanDateRange: 1 };
      Object.keys(o).forEach(function (kk) { if (!_skip[kk]) _rest[kk] = o[kk]; });
      var _rs = safeText(_rest); if (_rs) L.push('本層落點與其他：' + _rs);
      L.push('');
    });
    var obs = [];
    function addO(label, val) { if (val !== null && val !== undefined && val !== '' && !(val.length === 0)) { var s = safeText(val); if (s) obs.push(label + '：' + s); } }
    addO('Unaspected Cards（各層隱藏推力，單層內判斷）', ca.unaspectedCards);
    addO('宮廷人物', od.courtPeople);
    addO('大牌比重', od.majorWeight);
    addO('數字模式', od.numberPatterns);
    addO('可解度閘門', ca.divinationValidity || od.divinationValidity);
    if (obs.length) {
      L.push('── 五次操作的補充觀察數據（皆為單層內判斷，勿跨層彙整成綜合訊號）──');
      obs.forEach(function (o) { L.push('・' + o); });
    }
    // ★ 合法牌名清單（禁幻覺）— 盡力從各 Op 蒐集實際出現的牌名
    try {
      var _seen = {};
      (function harvest(o) {
        if (!o) return;
        if (Array.isArray(o)) { o.forEach(harvest); return; }
        if (typeof o === 'string') {
          // 字串型 op（引擎預格式化）：用正則抽「正位/逆位 <牌名>」
          var _re = /[正逆]位\s+([^\s〔（()→↔，。\n]{2,5})/g, _m;
          while ((_m = _re.exec(o))) { _seen[_m[1]] = 1; }
          return;
        }
        if (typeof o === 'object') {
          var nm = o.n || o.name || o.cardStr || o.cardName;
          if (nm && typeof nm === 'string' && nm.length <= 8) _seen[nm] = 1;
          Object.keys(o).forEach(function (k) { harvest(o[k]); });
        }
      })(ops);
      if (sigName) _seen[sigName] = 1;
      var _lg = Object.keys(_seen);
      L.push('');
      if (_lg.length > 1) { L.push('【本次合法牌名清單（只能引用本盤實際出現的牌，清單外一律不可出現）】'); L.push('  ' + _lg.join('、')); }
      else { L.push('【禁幻覺】只能引用本盤五次操作資料區實際出現的牌（活躍堆／counting／pairing 列出的都算），清單外的牌一律不可出現。'); }
    } catch (e) { L.push(''); L.push('【禁幻覺】只能引用本盤資料區實際出現的牌，清單外的牌一律不可出現。'); }
    return L.join('\n');
  }

  // ── 取排盤資料塊（沿用現有 builder，已含全部 GD/Mathers/Crowley/PHB 運算）──
  function getPayload(tool) {
    try {
      var obj = null;
      // ★ 修：builder 是頂層 function 宣告，裸名優先、window 後備、最後 eval 取全域
      function _callBuilder(name) {
        try { var fn = (0, eval)('typeof ' + name + ' === "function" ? ' + name + ' : null'); if (fn) return fn(); } catch (e) {}
        try { if (typeof window !== 'undefined' && typeof window[name] === 'function') return window[name](); } catch (e) {}
        return null;
      }
      if (tool === 'ootk') {
        obj = _callBuilder('_buildOOTKPayload');
      } else {
        obj = _callBuilder('_buildTarotOnlyPayload');
      }
      if (!obj) return '（找不到排盤資料，請先完成抽牌／排盤）';
      if (typeof obj === 'string') return obj; // 防呆：萬一回傳字串
      if (obj.mode === 'ootk' || obj.ootkData) return formatOOTKData(obj);
      return formatTarotData(obj);
    } catch (e) {
      return '（排盤資料組裝失敗：' + (e && e.message ? e.message : e) + '）';
    }
  }

  // ── 組成完整可複製提示詞 ──
  function buildPrompt(tool) {
    var t = TPL[tool];
    if (!t) return '';
    var question = getQuestion();
    var payload = getPayload(tool);
    var focusLock = buildFocusLock(question, tool); // ★ v70.4：分工具——開鑰走深度拆解、塔羅走 yes/no 直答
    return [
      focusLock,
      FRAG_SOURCELOCK,
      t.head.replace('{{SPREAD_READING_METHOD}}', (tool === 'tarot' ? getSpreadMethod() : '')),
      (tool === 'ootk' ? FRAG_UNCERTAINTY_OOTK : FRAG_UNCERTAINTY_TAROT),
      '',
      BAR,
      t.dataHeader,
      BAR,
      '',
      '問卜者的問題：',
      question,
      '',
      // ★ v75.2：注入今天日期，讓 AI 能正確錨定 Op4 時機
      (tool === 'ootk' ? '占卜日期：' + new Date().toISOString().slice(0, 10) + '\n' : ''),
      payload,
      '',
      t.tail,
      FRAG_CRYSTAL,
      (tool === 'ootk' ? FRAG_RECENCY_OOTK : FRAG_RECENCY_TAROT)
    ].join('\n');
  }
  window.JY_buildExportPrompt = buildPrompt;

  // ── 複製到剪貼簿（含 fallback）──
  function copyText(text, btn) {
    function done(ok) {
      if (!btn) return;
      var old = btn.getAttribute('data-old') || btn.textContent;
      btn.setAttribute('data-old', old);
      btn.textContent = ok ? '✓ 已複製到剪貼簿' : '✗ 複製失敗，請手動全選';
      btn.disabled = false;
      setTimeout(function () { btn.textContent = old; }, 2200);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { done(true); }, function () { fallback(); });
    } else { fallback(); }
    function fallback() {
      try {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.style.cssText = 'position:fixed;left:-9999px;top:0;';
        document.body.appendChild(ta);
        ta.focus(); ta.select();
        var ok = document.execCommand('copy');
        document.body.removeChild(ta);
        done(ok);
      } catch (e) { done(false); }
    }
  }

  // ── 渲染複製 UI 到指定容器 ──
  //    mount 可為 DOM element 或 id 字串；tool = 'tarot' | 'ootk'
  // ── 一次性注入儀式卡樣式 ──
  function ensureFx() {
    if (document.getElementById('jy-export-fx')) return;
    var st = document.createElement('style');
    st.id = 'jy-export-fx';
    st.textContent = [
      '@keyframes jyExHalo{0%,100%{opacity:.5;transform:scale(1)}50%{opacity:.95;transform:scale(1.08)}}',
      '@keyframes jyExStar{0%{transform:translateY(0) scale(1);opacity:0}15%{opacity:.9}85%{opacity:.7}100%{transform:translateY(-46px) scale(.4);opacity:0}}',
      '@keyframes jyExSheen{0%{transform:translateX(-130%)}60%,100%{transform:translateX(130%)}}',
      '@keyframes jyExRise{0%{opacity:0;transform:translateY(14px)}100%{opacity:1;transform:translateY(0)}}',
      '@keyframes jyExRing{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}',
      '.jy-ex-card{position:relative;overflow:hidden;max-width:560px;margin:1.1rem auto;padding:2.1rem 1.5rem 1.7rem;border-radius:22px;',
        'background:radial-gradient(135% 120% at 50% -10%,rgba(60,42,12,.55),rgba(16,12,8,.96) 62%);',
        'border:1px solid rgba(212,175,55,.32);box-shadow:0 18px 50px rgba(0,0,0,.5),inset 0 1px 0 rgba(255,236,184,.12);',
        'animation:jyExRise .6s ease-out both}',
      '.jy-ex-card::before{content:"";position:absolute;top:-90px;left:50%;width:280px;height:280px;margin-left:-140px;border-radius:50%;',
        'background:radial-gradient(circle,rgba(233,207,110,.28),rgba(233,207,110,0) 70%);animation:jyExHalo 5s ease-in-out infinite;pointer-events:none}',
      '.jy-ex-stars{position:absolute;inset:0;pointer-events:none;overflow:hidden}',
      '.jy-ex-stars i{position:absolute;bottom:18%;width:3px;height:3px;border-radius:50%;background:rgba(255,236,184,.9);box-shadow:0 0 6px rgba(255,236,184,.7);animation:jyExStar linear infinite}',
      '.jy-ex-emblem{position:relative;width:62px;height:62px;margin:0 auto .9rem;display:flex;align-items:center;justify-content:center;font-size:1.7rem;z-index:1}',
      '.jy-ex-emblem::after{content:"";position:absolute;inset:-7px;border-radius:50%;border:1px dashed rgba(212,175,55,.45);animation:jyExRing 18s linear infinite}',
      '.jy-ex-title{position:relative;z-index:1;text-align:center;font-family:var(--f-display,"Noto Serif TC",serif);font-size:1.16rem;font-weight:700;letter-spacing:.04em;color:#f0d98a;margin-bottom:.5rem;text-shadow:0 2px 14px rgba(0,0,0,.6)}',
      '.jy-ex-sub{position:relative;z-index:1;text-align:center;font-size:.82rem;line-height:1.78;color:rgba(232,220,200,.72);max-width:430px;margin:0 auto 1.4rem}',
      '.jy-ex-sub b{color:#e9cf6e;font-weight:600}',
      '.jy-ex-btn{position:relative;z-index:1;display:block;width:100%;max-width:340px;margin:0 auto;padding:1rem 1.2rem;border:none;border-radius:14px;cursor:pointer;',
        'font-family:inherit;font-size:1rem;font-weight:800;letter-spacing:.05em;color:#231406;overflow:hidden;',
        'background:linear-gradient(135deg,#f6e29a 0%,#e3c25e 45%,#c9a23f 100%);',
        'box-shadow:0 10px 30px rgba(201,162,63,.4),inset 0 1px 0 rgba(255,255,255,.5);transition:transform .15s,box-shadow .2s}',
      '.jy-ex-btn:hover{transform:translateY(-2px);box-shadow:0 14px 38px rgba(201,162,63,.55),inset 0 1px 0 rgba(255,255,255,.6)}',
      '.jy-ex-btn:active{transform:translateY(0)}',
      '.jy-ex-btn::after{content:"";position:absolute;top:0;left:0;width:55%;height:100%;background:linear-gradient(100deg,transparent,rgba(255,255,255,.7),transparent);transform:translateX(-130%);animation:jyExSheen 3.6s ease-in-out infinite}',
      '.jy-ex-foot{position:relative;z-index:1;text-align:center;font-size:.7rem;color:rgba(212,175,55,.5);margin-top:.95rem;letter-spacing:.03em}',
      /* v76: AI shortcut buttons */
      '.jy-ex-ai-grid{position:relative;z-index:1;display:grid;grid-template-columns:repeat(5,1fr);gap:.4rem;max-width:420px;margin:.9rem auto 0}',
      '.jy-ai-shortcut{display:flex;flex-direction:column;align-items:center;gap:.25rem;padding:.45rem .15rem;border-radius:12px;border:1px solid rgba(255,255,255,.06);background:rgba(255,255,255,.02);cursor:pointer;transition:all .2s;font-family:inherit}',
      '.jy-ai-shortcut:active{transform:scale(.91);background:rgba(255,255,255,.07)}',
      '.jy-ai-icon{width:36px;height:36px;border-radius:10px;object-fit:cover}',
      '.jy-ai-name{font-size:.62rem;font-weight:600;color:rgba(240,230,210,.65);letter-spacing:.01em;white-space:nowrap}'
    ].join('');
    document.head.appendChild(st);
  }

  function starsHTML() {
    var lefts = [8, 20, 33, 46, 58, 70, 82, 92, 27, 64];
    var s = '';
    for (var i = 0; i < lefts.length; i++) {
      var dur = (3.4 + (i % 5) * 0.6).toFixed(1);
      var delay = ((i * 0.5) % 4).toFixed(1);
      var sz = (i % 3 === 0) ? 4 : 3;
      s += '<i style="left:' + lefts[i] + '%;width:' + sz + 'px;height:' + sz + 'px;animation-duration:' + dur + 's;animation-delay:' + delay + 's"></i>';
    }
    return s;
  }

  // ── 渲染華麗儀式複製卡（不顯示提示詞文字，只留複製按鈕＋說明）──
  function render(tool, mount) {
    var el = (typeof mount === 'string') ? document.getElementById(mount) : mount;
    if (!el) { console.warn('[prompt-export] 找不到掛載容器'); return; }
    ensureFx();
    var t = TPL[tool] || { label: '命理' };
    var prompt = buildPrompt(tool);
    var emblem = (tool === 'ootk') ? '🗝️' : '🔮';

    var card = document.createElement('div');
    card.className = 'jy-ex-card';
    card.innerHTML =
      '<div class="jy-ex-stars">' + starsHTML() + '</div>' +
      '<div class="jy-ex-emblem">' + emblem + '</div>' +
      '<div class="jy-ex-title">' + t.label + '・占卜提示詞已備妥</div>' +
      '<div class="jy-ex-sub">輕觸下方按鈕複製，貼到任何 AI 對話（<b>ChatGPT・Claude・Gemini・Grok</b>）送出，' +
        '即可得到一份完整深入的命理解讀。<br>提示詞已封入全套占卜技法與你此刻的牌面，無需再多做說明。</div>' +
      '<button type="button" class="jy-ex-btn">✦ 一鍵複製占卜提示詞 ✦</button>' +
      '<div class="jy-ex-ai-grid">' +
        '<button type="button" class="jy-ai-shortcut" data-ai="chatgpt"><img class="jy-ai-icon" src="ai-icons/ai-chatgpt.png" alt="ChatGPT"><span class="jy-ai-name">ChatGPT</span></button>' +
        '<button type="button" class="jy-ai-shortcut" data-ai="claude"><img class="jy-ai-icon" src="ai-icons/ai-claude.png" alt="Claude"><span class="jy-ai-name">Claude</span></button>' +
        '<button type="button" class="jy-ai-shortcut" data-ai="gemini"><img class="jy-ai-icon" src="ai-icons/ai-gemini.png" alt="Gemini"><span class="jy-ai-name">Gemini</span></button>' +
        '<button type="button" class="jy-ai-shortcut" data-ai="grok"><img class="jy-ai-icon" src="ai-icons/ai-grok.png" alt="Grok"><span class="jy-ai-name">Grok</span></button>' +
        '<button type="button" class="jy-ai-shortcut" data-ai="deepseek"><img class="jy-ai-icon" src="ai-icons/ai-deepseek.png" alt="DeepSeek"><span class="jy-ai-name">DeepSeek</span></button>' +
        '<button type="button" class="jy-ai-shortcut" data-ai="kimi"><img class="jy-ai-icon" src="ai-icons/ai-kimi.png" alt="Kimi"><span class="jy-ai-name">Kimi</span></button>' +
        '<button type="button" class="jy-ai-shortcut" data-ai="doubao"><img class="jy-ai-icon" src="ai-icons/ai-doubao.png" alt="豆包"><span class="jy-ai-name">豆包</span></button>' +
        '<button type="button" class="jy-ai-shortcut" data-ai="metaai"><img class="jy-ai-icon" src="ai-icons/ai-metaai.png" alt="Meta AI"><span class="jy-ai-name">Meta AI</span></button>' +
        '<button type="button" class="jy-ai-shortcut" data-ai="copilot"><img class="jy-ai-icon" src="ai-icons/ai-copilot.png" alt="Copilot"><span class="jy-ai-name">Copilot</span></button>' +
        '<button type="button" class="jy-ai-shortcut" data-ai="perplexity"><img class="jy-ai-icon" src="ai-icons/ai-perplexity.png" alt="Perplexity"><span class="jy-ai-name">Perplexity</span></button>' +
      '</div>' +
      '<div class="jy-ex-foot">點擊 AI 按鈕 → 自動複製＋開啟對話 → 貼上送出</div>';

    var btn = card.querySelector('.jy-ex-btn');
    btn.addEventListener('click', function () { copyText(prompt, btn); });

    // ★ v76：AI 快捷鍵 — 複製＋開啟對應 AI
    var aiUrls = {
      chatgpt: 'https://chatgpt.com/',
      claude: 'https://claude.ai/new',
      gemini: 'https://gemini.google.com/app',
      grok: 'https://grok.x.ai/',
      deepseek: 'https://chat.deepseek.com/',
      kimi: 'https://kimi.moonshot.cn/',
      doubao: 'https://www.doubao.com/',
      metaai: 'https://www.meta.ai/',
      copilot: 'https://copilot.microsoft.com/',
      perplexity: 'https://www.perplexity.ai/'
    };
    var aiNames = {chatgpt:'ChatGPT',claude:'Claude',gemini:'Gemini',grok:'Grok',deepseek:'DeepSeek',kimi:'Kimi',doubao:'豆包',metaai:'Meta AI',copilot:'Copilot',perplexity:'Perplexity'};
    var shortcuts = card.querySelectorAll('.jy-ai-shortcut');
    for (var si = 0; si < shortcuts.length; si++) {
      (function(sbtn) {
        sbtn.addEventListener('click', function() {
          var ai = sbtn.getAttribute('data-ai');
          try {
            navigator.clipboard.writeText(prompt).then(function() {
              sbtn.querySelector('.jy-ai-name').textContent = '已複製！';
              setTimeout(function() { window.open(aiUrls[ai], '_blank'); }, 300);
              setTimeout(function() {
                sbtn.querySelector('.jy-ai-name').textContent = aiNames[ai] || ai;
              }, 2000);
            });
          } catch(e) {
            var ta = document.createElement('textarea'); ta.value = prompt;
            ta.style.cssText = 'position:fixed;left:-9999px';
            document.body.appendChild(ta); ta.select(); document.execCommand('copy');
            document.body.removeChild(ta);
            window.open(aiUrls[ai], '_blank');
          }
        });
      })(shortcuts[si]);
    }

    el.innerHTML = '';
    el.appendChild(card);
    try { window.scrollTo({ top: 0, behavior: 'instant' }); } catch (e) {}
  }
  window.JY_renderExportPrompt = render;

  // ════════════════════════════════════════
  //  複製模式接線（無 worker / 無 API / 無付費）
  //  注意：prompt-export.js 必須在 tarot.js 之後載入，OOTK 覆寫才會生效
  // ════════════════════════════════════════

  // 塔羅複製入口：由 ai-analysis.js 的 _triggerTarotAI 早退呼叫
  window._jyTarotCopyMode = function () {
    var w = document.getElementById('tarot-ai-wrap');
    if (!w) return;
    w.style.display = '';
    try { var ow = document.getElementById('ootk-ai-wrap'); if (ow) ow.style.display = 'none'; } catch (e) {}
    try { window._jyActiveResultMode = 'tarot'; } catch (e) {}
    try { window._jyResultModes = window._jyResultModes || {}; window._jyResultModes.tarot = true; if (typeof _refreshAllNavs === 'function') _refreshAllNavs('tarot'); } catch (e) {}
    render('tarot', w);
  };

  // 開鑰之法：複製模式由 tarot_upgrade.js 的 _triggerOOTKAI 源頭早退處理
  //   （該函數會在抽完牌後直接呼叫 JY_renderExportPrompt('ootk', wrap)）
  //   此處不再覆寫 window._ootkTriggerAI——因為 startOOTK 每次抽牌會動態重設它，覆寫擋不住。

})();
