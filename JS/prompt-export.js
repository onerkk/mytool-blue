/*! prompt-export.js — 靜月之光 Golden Dawn Book T 提示詞匯出引擎 [v95.0]
 *  v95.0（Golden Dawn Book T 單一來源＋型別化證據驗證 2026/7/17）：
 *    1) 原句先建立型別化查詢圖並細分所有會改變答案真值的語義原子；不靠題材詞庫決定問題內容。
 *    2) 每個合法證據單位先產生候選命題，再以 eventId／entityBindings／roleBindings／joinTrace 驗證同一人物與同一事件。
 *    3) 六階段管線：QuestionCompiler→EvidenceInterpreter→GraphBinder→Adjudicator→SaturationReviewer→AnswerVerifier；正文不得新增未驗證推論。
 *    4) 所有牌陣保留各自拓撲；開鑰五次操作只以 QUERY_EVENT 階段摘要承接，禁止跨操作拼牌。
 *  v89.0（塔羅觀測能力＋證據矩陣根治 2026/7/15）：
 *    1) 在解牌前建立「原問句資訊需求 × 牌陣可觀測通道」；牌陣不足以直接量測的維度不再被硬猜，也不妨礙其餘可回答部分深讀。
 *    2) 一般牌陣資料改送Golden Dawn Book T中性結構，不再依感情／工作／財運題材預先改寫牌義；移除會先替模型下結論的故事弧、固定對立牌、組合文案與洞察摘要。
 *    3) 所有牌陣共用「需求建模→觀測映射→牌位命題→結構合成→證據矩陣→反證→答案」；張數只決定觀測幾何，內容量只看有效命題。
 *    4) 開鑰之法固定Book T五次操作、Ace計數與代表牌固有朝向，並將計數值明確限定為路徑導航而非現實數量。
 *  v88.0（塔羅全牌陣語義證明引擎 2026/7/15）：
 *    1) 以「完整問題命題→牌位節點→合法互動圖→候選命題→蘊涵強度→反證競爭→語義飽和」取代題型補丁。
 *    2) 十四種一般牌陣逐一建立正向合成順序；牌數只決定幾何，正文長短只由有效命題量決定。
 *    3) 關係牌陣把牌位當觀察鏡頭，不再由未知的「對方位」反推人物存在；自動選陣同步區分已知對象與未知人物事件。
 *    4) 開鑰之法依 Book T 五次操作原文重建：各次獨立洗牌、落點、完整計數故事、兩側配對、適配與中止、階段整合。
 *  v87.0（塔羅全系統語義引擎根治 2026/7/15）：
 *    1) 拆除題材關鍵字牌義、花色缺席公式、吉凶票數與「每張牌都必須在正文點名」等結果導向規則。
 *    2) 所有牌陣改共用：問題完整命題→牌位鏡頭→候選命題→結構合成→完整命題裁決→反證校準→語義飽和。
 *    3) 牌陣模組只定義位置與合法互動，不預設未知人物／事件存在；篇幅只由有效命題量決定。
 *    4) 開鑰之法重建為 Book T 五次操作的階段性閱讀，恢復適配／中止邏輯；現代隱藏牌觀察降為可選次證。
 *    5) 圖像、花色、元素、數字、占星與宮廷牌只作有來源的校正，不可替代牌位主命題。
 *  v86.26（死碼陷阱拆除 2026/6/12）：TPL.ziwei 整段移除——全站零呼叫者（塔羅走 _jyTarotCopyMode、
 *    開鑰走 JY_renderExportPrompt('ootk')、紫微走 ziwei-standalone），且 formatZiweiData 從未定義、
 *    規則停在舊版無近期根治；留著＝未來接錯線必當機＋輸出退化的雙重陷阱。
 *  v86.20（收束犧牲行全站統一 2026/6/12）：FRAG_CRYSTAL（塔羅/紫微兩處）蝦皮連結自「獨立成行末行」改
 *    「犧牲行」結構——網址倒數第二行、最後固定「願你諸事順遂。」墊後；多輪實測末行版仍被管線黏不可見字元。
 *  v86.12（梅花應期正統化＋體用原文定性 2026/6/12 歐那）：
 *    1) formatMeihuaData 注入正統應期——《梅花易數·占卦訣》：「事應於生體卦氣之日、敗於剋體卦氣之日」，
 *       輔以「用卦近期、互卦中期、變卦遠期」分層；資料由 meihua_output_layer.js v2 buildMeihuaYingQi 計算（mh.yingQi）。
 *       根治原本只有 mh.timing 天數窗、無原典應期依據的問題；明令禁止 AI 自創「用卦五行→季節」法（非原典斷法）。
 *    2) formatMeihuaData 加「體用原典定性」行——對齊《體用總訣》原文：體克用＝諸事吉（非「小吉」）、
 *       用克體＝諸事凶、體生用＝耗失之患、用生體＝進益之喜、比和＝百事順遂；剋/克字形相容。
 *    3) TPL.meihua 讀卦流程④與輸出要求改吃資料區吉應／敗應；FRAG_RECENCY_MEIHUA 檢查表同步加項。
 *    4) 標頭版號自陳舊的 [v80.60] 對齊 index 變更主線（至 v86_11）推進為 v86.12。
 *    配套部署：meihua_output_layer.js v2、meihua_upgrade2.js v2（旺衰表規則生成＋節氣月支＋tiYongDeep 根修）。
 *  v80.60（凱爾特十字三組對照等量 + 收尾連結＝全文末字）：
 *    1) celtic_cross 鐵律補「三組對照分量必須對等」——實測輸出「身後vs身前」常比另兩組薄，明定每組都要點名兩張牌、講出張力。
 *    2) FRAG_CRYSTAL 蝦皮連結改「URL＝整份輸出最後一個字、後不接任何字元」——根治輸出尾端黏句號/雜字導致連結變醜或點不動。
 *       同款收尾規則同步進 lenormand.js / oracle.js / meihua-standalone.js / ziwei-standalone.js / bazi-standalone.js（六檔一致）。
 *  v80.59（總覽／流年題框架・解矛盾指令）：
 *    detectFocus 新增 isOverview（整體運勢／流年／運程／運勢如何…）。塔羅路徑：當是總覽題且無特定領域時，
 *    改推「跨領域通盤、鎖定最強 2-3 領域」框架，取代原本為窄問題設計的「禁止擴寫成通盤論述」——
 *    那句對「今年整體運勢」這種題目字面自相矛盾（題目本來就要通盤）。仍保留時間範圍邊界（限今年、不擴成人生課題）。
 *    與既有 noQ 路徑「以最集中花色鎖定領域」同源；標準年運讀法本就跨 love/career/finance/health（來源：tarot.com、horoscope.com 年運讀法）。
 *  v80.58（財運機率題誠實化・搭配 tarot_upgrade money 詞庫補洞）：
 *    1) DOMAIN_HINT.wealth + DOMAIN_HINT_MATHERS.wealth 加「純機率開獎題」框架：統一發票／樂透／刮刮樂／賭
 *       塔羅只給狀態與傾向、非隨機開獎保證；講 forecast 不斷 prediction，禁「必中／必不中／訊號不成立」；
 *       金額門檻（過萬）牌面對不上就說沒給。明標為現代實務 forecast≠prediction 框架、非古典原典
 *       （來源：truetarottales forecast vs prediction、herorise/EBR「勿期待塔羅預測樂透」共識）。
 *    2) 搭配 tarot_upgrade.js v80.58：money 詞庫補「統一發票／中獎／獎金／對獎／刮刮樂／開獎」——
 *       原本這類題漏判財運、wealth 提示不注入，故 AI 把隨機開獎武斷講成「過萬訊號不成立」。
 *  v80.57（宮廷牌年齡誠實化・根治捏造精確歲數）：
 *    mathers_21 + horseshoe 宮廷牌註修正：補回膚色對照（mathers_21 原缺）；明定「牌階只給成熟度、不給歲數」
 *    （侍者＝年少、騎士＝青年、皇后/國王＝成年/成熟），被問「她幾歲」只能答成熟度層級＋膚色，
 *    禁止硬報「約30～36歲」這類數字年齡帶。依 Mathers 原文（sacred-texts mtar03）court card 只給
 *    youth/girl/man/woman＋complexion、無任何數字；現代慣例亦僅「成熟≈30+且極有彈性」，不支持精確帶。
 *  v80.56（能量石綁花色數據 + mathers_21 補回 Mathers「看鄰牌」規則）：
 *    1) FRAG_CRYSTAL：選石改綁資料區花色實際張數（最多＝過盛、最少＝匱乏）；四花色相差 ≤1（如 5/4/4/4）
 *       一律判「大致均衡」、不准硬扣失衡，改挑呼應「問題＋結論」的石；理由必須對得上數字或結論。
 *       根治「不管實際張數一律推紫水晶」的預設答案（鐵則同步改）。
 *    2) mathers_21 讀法區塊補回「部分牌看鄰牌」規則（權杖騎士＝下一張的離開、聖杯七／聖杯騎士／聖杯四
 *       須與鄰牌合讀）——Mathers/Etteilla 原典明文（sacred-texts mtar03）；horseshoe 區塊本有、第二法漏掉。
 *  v80.55（Mathers 時間誠實化・根治編造月份）：
 *    mathers_21 與 mathers_horseshoe 兩條讀法區塊的「時間」規則改成常駐版——
 *    過去「禁編月份」只寫在 buildFocusLock 的 f.timing 分支，問題不含時間字時不注入，
 *    但通則又一律要求「時間窗口」→ AI 被逼編出「1～2個月」這種無牌面錨點的時間。
 *    現在改為：無明確時序牌就老實說「給不出月份」，禁所有「近期/快了/順其自然/1～2個月」式時間語。
 *    （此區塊每次該牌陣必注入，不再依賴 f.timing；f.timing 分支保留作 recency 強化。）
 *  v80.0（全牌陣文獻邊界重校 + 嚴格讀法修正）：
 *    1) 逐一區分：原典/可查文獻牌陣、傳統系統應用、現代實務牌陣。
 *    2) 凱爾特十字位置改回 Waite 原文骨架：上方/腳下/身後/身前，不再把第5位硬稱顯性目標。
 *    3) Fifteen-Card 改稱 Thoth/GD 風格十五張；標示來源為 Thoth 牌 LWB（自述為開鑰之法簡化版/The English Spread），不冒充 Book T 原始開鑰。
 *    4) Mathers First Method 改按原文完整 A/C/E 三組 horseshoe（26+17+11=54張）解讀。
 *    5) 現代牌陣全部維持可用，但不得稱古典正統或官方原法。
 *  v79.0（原典文獻鎖定 + 反幻覺修正）：
 *    1) 全工具改以「原典/可查文獻」標示，不把現代實務包裝成古典正統。
 *    2) 開鑰 recency 檢查改白話，不再要求硬湊跨層重複牌。
 *    3) 雷諾曼禁止引用本盤外牌名做反證，年齡/人物訊號不足時直接說不足。
 *    4) 所有輸出維持命理師/占卜師對提問者口吻，技法只作內部檢查。
 *  v78.0（正統性總修正）：
 *    1) 塔羅：明確區分古典正統牌陣與現代牌陣；所有後世牌陣只保留布局拓撲，牌義固定Golden Dawn Book T。
 *    2) 開鑰：保留 Golden Dawn Book T 五次操作內部必查，但輸出改為命理師口吻，不再把技術清單當正文。
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
 *    並輕附蝦皮去處（水晶/天鐵/龍宮舍利 https://shopee.tw/a50h95648d?tab=shop）。鐵則：只一種、只一次、貼結論、
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
 *       開鑰第四次操作為三十六牌環，不產生月份。）
 *  v72.0（對權威來源查證 + 補完 v71 只做一半的開鑰結構化）：
 *  v72.0（對權威來源查證 + 補完 v71 只做一半的開鑰結構化）：
 *    G. 開鑰資料區真正結構化：每層改為 Sig落點／本層活躍牌／Counting 走過（依序+走幾步）／
 *       Pairing 配對（#1最直接）／元素尊嚴 分行，鏡像 head 要求的輸出；op-specific 欄位
 *       （宮/星座/旬/質點）用 safeText 保底不漏。（依 tarot_upgrade.js 實際欄位寫，非臆測）
 *    H. 計數值一致性：依 Golden Dawn《Book T》原文確認——
 *       引擎依本次 Book T 資料設定採 Ace＝11；前端直接提供計數路徑，AI 不另算
 *       count 5（GD）分支對照，解除原 head「5或11」與引擎的矛盾。
 *    （查證結論：head 計數值表、大牌三分類、36 旬 Decan 經核對皆正確，未改。）
 *    ⚠ 待你定奪：GD 原規「逆位宮廷牌→counting 反向 180°」，本引擎採「方向只由 Sig 面向決定、
 *       途中不反向」（modern 簡化；後世資料另有不同做法，本系統不採）——無共識，未動引擎。
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
    // v86.26 拆除 TPL.ziwei 死碼：全站零呼叫者、formatZiweiData 從未定義（接線即 ReferenceError），
    //   且其規則停在舊版（無⑦年級限制/借星/身宮主軸）＝未來接錯線的陷阱。紫微提示詞唯一真相來源＝ziwei-standalone.js
    meihua: {
      label: '梅花易數',
      head: "【人設——資深梅花易數解卦者，對問卜者說話】\n你是以《梅花易數》體用、卦氣、動爻、互卦、變卦、外應為核心的解卦者。你已經拿到前端起好的本卦、互卦、變卦、動爻、體用資料；現在只輸出問卜者需要的答案，不寫教科書。\n・第一句直接回答問卜者問題，不鋪墊。\n・每個結論都要回扣本盤資料：本卦、互卦、變卦、動爻、體卦、用卦、五行生剋、旺衰、外應或卦象。\n・沒有卦面支撐就說「此卦資料不足以定論」，不可硬編。\n・梅花易數可判趨勢、阻力、應期與行動方向，不可替代醫療、法律、投資決策。\n\n【正統性邊界——必須誠實】\n本工具以梅花易數常用結構為準：先看本卦定事情本質，互卦看中間過程與內在機制，變卦看結果走向，動爻看變化觸發點，體用看我方與外界的生剋關係。\n可用技法：體用生剋、八卦萬物類象、五行旺衰、動爻、互卦、變卦、卦氣、外應、時空取象。\n不同傳承對外應、卦氣權重有差異；資料區未明列的外應，不要假裝已經看到。\n不可把塔羅、開鑰、七維命盤、姓名學、星盤內容混入本次判斷。\n\n【讀卦內部流程——每步都要查，但正文不要逐條教學】\n1. 先看本卦，定此事的本質與目前局勢。\n2. 再看體用：體為問卜者或我方，用為對方、事情、環境；看生我、我生、剋我、我剋、比和。\n3. 看互卦：判中途過程、暗線與卡點。\n4. 看變卦與動爻：判轉折、結果與變化方向。應期依正統：事應於生體卦氣之時、敗於剋體卦氣之時（資料區已算好吉應／敗應之期，直接採用並說明理由，不可自創應期算法、不可用「用卦五行對應季節」斷應期）。\n5. 看八卦類象與五行：用於人物、場域、方位、時間、情緒與事件性質，不可超出卦面硬推。\n\n【輸出要求】\n・第一句直接回答問題。\n・正文必須包含：答案強弱、卦象依據、阻礙、轉折點、應期（照資料區吉應／敗應之期講並給理由）、24 小時內可做的事、可驗證信號。\n・重要判斷用「——本卦／互卦／變卦／動爻／體用」自然附出處。\n・不要逐格報告，不要把八卦萬物類象列成百科；只講與問題有關的部分。\n・壞消息直接講，風險與限制要清楚。\n・最後提醒：本分析限研究與娛樂參考，不作人生重大決策唯一依據。",
      dataHeader: "九、以下是前端已起好的梅花易數卦盤資料",
      tail: "請依以上梅花易數卦盤資料，用繁體中文寫一份完整、深入、可驗證的梅花易數解讀。必須直接回答問卜者問題，再用本卦、互卦、變卦、動爻、體用與五行生剋說清楚原因；不可混入塔羅、開鑰、七維命盤或姓名學；不可把沒有提供的外應硬編成事實。"
    },
    tarot: {
      label: '塔羅快讀',
      head: "【角色——Golden Dawn《Book T》塔羅證據整合者】\n你只使用 Hermetic Order of the Golden Dawn《Book T／Liber T》的塔羅象徵與占卜規則。牌陣可以是後世布局，但牌義來源、宮廷牌功能、數字牌稱號、卡巴拉世界／質點、占星分度與元素尊貴一律以 Book T 為核心。不得混入 Waite 1910 固定正逆位字典、Rider-Waite 圖像故事、Crowley／Thoth 專屬泰勒瑪詮釋或其他牌系關鍵字。\n\n【ROOT-SPEC——只在內部執行】\n一、完整保留原問句的主體、對象、事件、否定、條件、比較、期限與成立門檻；多子題依原順序全部回答。\n二、每張牌先按牌位權限形成候選命題，再依實際相鄰牌判元素尊貴：同花色強化；權杖與聖杯、寶劍與金幣互相削弱；其餘友善。強弱只修正牌本性，不把吉牌自動變凶，也不以吉凶票數表決。\n三、一般牌陣不使用固定正逆位。牌面強弱由 Book T 核心義、位置、相鄰元素、卡巴拉位階、占星對應及牌陣拓撲共同裁決。牌陣位置不是人物、數量或日期的自動證明。\n四、宮廷牌依 Book T 分層：Princes／Queens多數情況可指與事情相關的人；Knights／Lords有時表示事情或消息的到來／離去；Princesses可指意見、想法或計畫。網站牌面標籤固定映射為國王＝Book T Knight／Lord（火）、皇后＝Queen（水）、騎士＝Prince（風）、侍者＝Princess（土）。只有原問句、牌位及至少一條獨立證據完成共指時，才能具體化為某人，不得硬編年齡、外貌、職業或內心。\n五、Book T 的花色多數、三張／四張同階只作第二層結構觀察，不得凌駕牌位或把牌張數換成現實數量、機率、日期與金額。\n六、先形成主判，再找最大反證與最強替代解讀。完整答案的把握不得高於最弱必要條件；未量測只限制該部分，不得把其餘有效訊號一併抹除。\n七、時間只能依牌陣明示的相對時間位置或資料區可回溯的時間通道回答；沒有明示時間錨時只能說近期、後續或結果階段，不得自行編月份、日期或年數。\n八、財務、醫療、法律、犯罪、投資與人身安全問題，塔羅只提供象徵性風險與行動優先順序，不能取代帳目、合約、檢查、證據或專業意見。\n九、每項主要建議都要連成：牌面證據→可能機制→低風險可逆行動→可觀察驗證點→停止／調整條件。現實資料與牌面衝突時，以現實資料優先。\n十、交稿前逐句核對：只引用本盤合法牌名；不新增牌面未支持的身分、事件、精確數字或日期；不輸出內部帳本與規則。\n\n【輸出】\n第一句直接回答完整問題。其後只保留真正會改變判斷的3至7個結構命題，依「主判→形成機制→反證／限制→相對時間（題目需要時）→行動→驗證與停止條件」自然推進。不要逐張翻譯、不要教技法、不要把後世牌陣冒充 Book T 原創。",
      dataHeader: '十、以下是排好的牌陣資料',
      tail: "請依本次 Golden Dawn《Book T》牌陣資料完成解讀。先回答完整原問句，再以牌位權限、Book T 核心義、相鄰元素尊貴、卡巴拉／占星對應與牌陣拓撲形成主判；處理最大反證、量測邊界、可執行行動、驗證點與停止條件。不得使用固定正逆位、Waite 或 Thoth 專屬牌義，也不得編造日期、金額、機率、人物身分或未抽到的牌。"
    },
    ootk: {
      label: '開鑰之法',
      head: "【角色——Golden Dawn《Book T》Opening of the Key 證據整合者】\n你只使用《Book T／Liber T》所載的代表牌、五次操作、計數、配對與元素尊貴。不得混入 Waite 固定正逆位、Crowley／Thoth 專屬牌義、PHB 現代擴充、跨操作重複牌投票、虛構十分度應期或其他手稿版本的混合規則。\n\n【程序不變量——只在內部執行】\n一、完整保留原問句；先確認本次程序是否已被 Book T 規則停止。若已停止，第一句直接說本次開鑰無法形成有效完整答案，並只說明停止原因與可重新占問的方式；不得解讀未生成的後續操作。\n二、第一次操作描述問卜當下情勢。代表牌所在 YHVH 堆須能正確辨識問題大類；若不符，依資料狀態停止。計數故事描述事情開端，配對故事補足細節。\n三、第二次操作描述問題發展。占卜前選定主宮及相近宮；兩者皆未找到代表牌時停止。第三次操作描述進一步發展，先選定適當黃道星座堆並照前法讀取。\n四、第四次操作只讀代表牌後方三十六張所成的環、計數故事及1↔36、2↔35的配對故事，權限是倒數階段；它不是日期或月份量測器。\n五、第五次操作為最終結果，將牌發成生命樹十堆。代表牌未落在預期位置不必然使占卜失效，但會降低該位置與原問句的直接綁定強度。\n六、計數方向依代表牌圖像固有朝向，不依正逆位；計數包含起算牌。Knights／Queens／Princes計4，Princesses計7，Aces計11，小牌依牌號，大牌依元素／行星／黃道分別計3／9／12。計數值只導航牌序，不能換算日期、金額、人數或機率。\n七、每次操作先獨立形成「落點→計數故事→配對細節→元素尊貴」的階段命題，再依第一至第五次的明示功能綜合。不得把不同操作的牌直接拼成不存在的新牌句，也不得因同牌重複而加票。\n八、元素尊貴依 Book T：同花色強化；權杖與聖杯、寶劍與金幣互相削弱；其餘友善。強弱修正牌義，不以正逆位字典裁決。\n九、先形成主判，再找最大反證與最強替代解讀；每項建議要有現實驗證點與停止條件。高風險問題以現實證據和專業意見優先。\n十、交稿前逐句反查，只引用本盤實際牌與落點，不輸出程序帳本，不編造月份、人物身分或精確結果。\n\n【輸出】\n第一句回答完整原問句；若程序已停止，先明確說不能有效裁決。有效時依五次操作的權限自然說明當下、發展、進一步發展、倒數階段與最終收束，只展開真正影響答案的計數／配對結構。",
      dataHeader: '六、以下是排好的五次操作資料',
      tail: "請依 Golden Dawn《Book T》開鑰之法資料完成解讀。先檢查程序是否中止；中止後不得解讀不存在的操作。若有效，依每次操作的落點、完整計數路徑、配對與元素尊貴形成階段命題，再按五次操作權限綜合；不得混入固定正逆位、Waite／Thoth牌義、PHB擴充、跨層投票或自創應期。"
    }
  };

  // ═══ v74 牌陣讀法動態注入 ═══
  // 原本 12 種全塞 head (~800 tok)，改為依當次牌陣只注入對應的 1 種 (~100 tok)。
  // 省 ~700 tok/call，Opus 4.7 $5/M input 下有意義。
  var SPREAD_METHODS = {
      "_default": "本次牌陣依前端提供的位置與順序建立互動圖。每張牌先在自己的位置形成命題，再依實際相鄰、對照、路徑、軸線或分支合成；所有位置與合法互動均須內部處理。正文只呈現能為原問句增加不同內容的有效命題，篇幅不依張數決定。",
      "three_card": "本次牌陣：三牌陣（3張現代布局；牌義統一依Golden Dawn Book T）。把三個位置視為一個最小語義圖：先讓每張牌依前端位置功能成句，再讀1↔2、2↔3及1→2→3整體如何互相改寫。若位置是過去／現在／未來，讀成階段流；若位置是原因／現況／結果或其他功能，依實際名稱重建作用鏈。三張全部處理；只要形成不同的結果、原因、條件、轉折、限制或可行方向，就完整輸出。",
      "five_card": "本次牌陣：五牌陣（5張現代布局；牌義統一依Golden Dawn Book T）。以現況為中心，原因說明其形成，阻礙說明何處改變進程，建議是可介入的作用，結果是前四張共同導向的收束。依序建立原因→現況、現況↔阻礙、建議如何作用於阻礙與結果、以及完整五張因果網；結果位不能脫離形成機制單獨定案。五張全部處理，正文依有效命題量展開。",
      "cross": "本次牌陣：十字牌陣（5張現代布局；牌義統一依Golden Dawn Book T）。核心牌定義本題目前的主要狀態，阻礙牌與核心形成最直接的拉扯；過去說明拉扯如何形成，未來顯示在現有機制下的發展，建議說明可介入哪個節點。先讀核心↔阻礙，再讀過去→核心→未來，最後把建議接回整體因果鏈。五個位置共同形成裁決，不讓阻礙或建議單獨代替結果。",
      "either_or": "本次牌陣：二選一牌陣（5張現代決策布局；牌義統一依Golden Dawn Book T）。第1張先定義問卜者的需求與比較基準；A路由1→2→4形成完整路徑，B路由1→3→5形成完整路徑。兩路必須用同一標準比較實際形成的推進方式、代價、風險、可持續性與落點；不得跨路拼牌。若兩路各有成立條件，就逐項說明，不為了給單一答案而抹掉差異。",
      "timeline": "本次牌陣：時間線牌陣（5張現代布局；牌義統一依Golden Dawn Book T）。把五張讀成根源→近期狀態→轉折→轉折後發展→收束的連續事件鏈；每一張都要說明如何改寫前一階段。位置表示先後而非等距日曆時間。先完成事件進程，資料區若未明示可回溯的時間尺度，只能給相對階段與觸發條件；不得用牌號、元素或占星對應自行換算日期。",
      "relationship": "本次牌陣：關係牌陣（6張現代雙人布局；牌義統一依Golden Dawn Book T）。六個觀測通道是你、對方或對方作用、關係現況、挑戰、可介入點與短期走向。已知對象時可建立雙方對照；未知對象時，對方位是聚合的條件性角色通道，只描述若有此作用會呈現什麼，不證明人物存在，也不代表一人或人數上限。先比較雙方作用如何形成現況，再讀挑戰如何改變進程、建議可介入何處、走向如何收束。它直接量測的是一組關係結構，不直接枚舉未知人群；數量問題只有出現彼此獨立且可區分的多個實體證據群時才能定性談單一或多個。六個位置全部處理，完整事件必須由角色、關係性質、行動內容與走向共同支持。",
      "celtic_cross": "本次牌陣：凱爾特十字布局（10張，布局本身不是Book T原創；牌義與強弱全部使用Golden Dawn Book T）。以第1張現況與第2張橫跨力量為核心交叉；第3張上方可成形與第4張腳下根基互相校正，第5張身後與第6張身前形成時間轉換，第7張本人與第8張環境形成主客對照，第9張只描述希望／恐懼，第10張是前述結構共同導向的最終將至。先完成四組對照，再追蹤它們如何匯入第10張；所有位置都要內部使用，但正文按獨立命題整合，不逐位念牌。",
      "tree_of_life": "本次牌陣：生命之樹（10張，Hermetic Qabalah塔羅應用）。每個質點先依其功能形成命題，再讀右柱的擴張、左柱的界定、中柱的整合，以及Kether→Tiphareth→Yesod→Malkuth由源頭到落地的主軸；Chokmah↔Binah、Chesed↔Geburah、Netzach↔Hod作成對校正，Tiphareth負責整合。質點是作用鏡頭而非固定吉凶。十個質點全部處理，正文只輸出真正增加原問句內容的結構命題。",
      "zodiac": "本次牌陣：黃道十二宮（12+1張，占星宮位塔羅應用）。每張牌先在其宮位領域形成命題；再讀與原問句直接相關的宮位、其對宮、同一角宮／續宮／果宮節奏及第13張全盤主旋律如何互相校正。若原問句是年度或多領域全景，十二宮都要各自形成可用結論；若是聚焦題，十二宮仍全部內部檢查，但正文只保留能直接補充核心事件的宮位命題。第13張只統整，不覆蓋各宮差異。",
      "minor_arcana": "本次牌陣：小阿卡那專題牌陣（7張現代布局，只用56張小牌；牌義統一依Golden Dawn Book T）。依現狀→原因→挑戰建立問題機制，再把周圍人物與本人資源接入，判斷建議行動如何改變結果。小牌聚焦日常可觀察的互動、資源、流程與階段，不因缺少大牌就降低事件重要性。七個位置全部處理，正文依有效命題輸出。",
      "fifteen_card": "本次牌陣：十五張英式布局（Golden Dawn衍生布局；不得冒充Book T開鑰原法，牌義與元素尊貴統一使用Book T）。先讀五個三牌組：2–1–3為問卜者與問題核心，4–8–12為自然發展，13–9–5為替代行動路徑，6–10–14為心理與決策依據，7–11–15為不可控外在條件。每組以中牌為主題、兩側牌用元素關係與牌義校正，再比較自然路徑、替代路徑、決策層與外在條件如何共同改寫核心。十五張全部處理，正文按各三牌組真正新增的命題與路徑差異整合。",
      "mathers_21": "本次牌陣：二十一張Mathers衍生布局。布局順序可保留，但牌義只用Golden Dawn Book T，不使用Etteilla或固定正逆義；把三排各自從代表牌一側由右往左讀成三段連續故事；再讀1↔21、2↔20直到10↔12的首尾配對，第11張作中心校正。原典沒有替三排指定過去／現在／未來，不自行添加。每排的局部牌義由整排故事改寫，配對補充跨段呼應；二十一張全部內部處理，正文只保留能改變原問句答案的排內命題、配對與中心作用。",
      "mathers_horseshoe": "本次牌陣：Mathers衍生完整馬蹄布局。布局程序可保留，所有牌義與強弱統一依Golden Dawn Book T；依原法先把A組26張由右往左讀成第一個連續答案，再讀A1↔A26至A13↔A14；C組17張與E組11張依同樣方式各自成句、配對並處理中心單張。A、C、E是三個依次閱讀的證據群，F組24張不進入解讀。先讓三組各自完整，再比較後組如何補充、修正或限定前組；全部牌內部處理，正文按有效命題整合，不逐張抄寫五十四張。",
      "horseshoe": "本次牌陣：七張馬蹄形（現代布局；牌義統一依Golden Dawn Book T）。先讀過去→現在→隱藏影響形成目前局勢，再讀建議如何作用於他人態度與阻礙，最後由前六張共同導向結果。隱藏影響是尚未看清的作用，不自動等於秘密人物；他人態度只有在身分可可靠對應時才描述特定人。七張全部處理，正文按有效命題輸出。"
  };


  // ═══ v89 問題需求 × 牌陣觀測能力編譯器 ═══
  // 它不指定牌義，只把使用者要求的資訊形式與牌陣能量測的通道交給 AI。
  function _getSpreadId() {
    try {
      var S = (typeof window !== 'undefined' && window.S) ? window.S : null;
      if (!S) try { S = (0, eval)('typeof S !== "undefined" ? S : null'); } catch(e){}
      var t = (S && S.tarot) || {};
      return t.spreadType || (typeof getCurrentSpread === 'function' ? getCurrentSpread() : '') || '_default';
    } catch(e) { return '_default'; }
  }

  function analyzeInformationDemands(q) {
    var x = String(q || '');
    var out = [];
    function add(id, label) { if (!out.some(function(v){ return v.id === id; })) out.push({ id:id, label:label }); }
    if (/幾個|幾位|多少(?:人|個|位|次|張)|人數|數量/.test(x)) add('cardinality','數量／基數');
    if (/多少錢|金額|價位|薪水|收入|成本|獲利|百分比|幾成|機率/.test(x)) add('quantity','數值／程度');
    if (/誰|哪(?:一)?個人|哪(?:一)?位|姓名|名字|身分|是什麼人/.test(x)) add('identity','人物身分');
    if (/幾歲|年齡|外貌|長相|身高|體重|職業|星座|生肖/.test(x)) add('attribute','人物屬性');
    if (/什麼時候|何時|幾時|多久|幾天|幾週|幾月|哪一年|時間/.test(x)) add('timing','時間');
    if (/為什麼|為何|原因|根源|怎麼會/.test(x)) add('cause','原因／機制');
    if (/怎麼做|怎麼辦|如何|建議|方法|策略|該怎麼/.test(x)) add('guidance','方法／建議');
    if (/還是|或者|二選一|哪個(?:較|更|好|適合)|比較/.test(x)) add('comparison','比較／選擇');
    if (/未來|走向|結果|會變成|發展|最後|結局|之後/.test(x)) add('trajectory','發展／結果');
    if (/有沒有|是否|會不會|是不是|能不能|可不可以|嗎[？?]?\s*$/.test(x)) add('existence','存在／成立與否');
    if (!out.length) add('state','狀態／趨勢');
    return out;
  }

  var SPREAD_CAPABILITIES = {
    _default: '直接觀測：前端明示的各牌位與其合法互動。可推論：由多個一致位置形成的狀態、機制與結果。未直接量測：沒有專屬通道的精確數量、身分與日期。',
    three_card: '直接觀測：三個明示位置及兩個相鄰關係、完整三張結構。擅長單一命題的狀態、作用與收束。三個位置不是三個人物或三個時間單位；除非位置本身明示，不能拿來計數或換算日期。',
    five_card: '直接觀測：現況、形成原因、阻礙、可介入作用與結果之間的事件機制。可深讀是否成立、如何發生與主要條件；不以五張牌當作五個人物、五次或五個時間單位。',
    cross: '直接觀測：核心狀態與阻礙的拉扯、形成背景、發展與可介入點。適合診斷衝突機制；不直接枚舉未知人群或量測精確數量。',
    either_or: '直接觀測：兩條彼此分離的選項路徑與共同比較基準。可比較相對適配、代價與落點；不能把路徑牌號換算成機率或金額。',
    timeline: '直接觀測：事件的相對先後、轉折、快慢與收束。牌面的占星／十分度對應不等於本次事件的公曆日期；只有前端另行提供明確牌陣時間跨度或外部日曆錨時才可細化。五個階段不是固定五天或五月。',
    relationship: '直接觀測：一組你—對方／對方作用—關係的互動結構、阻礙、介入點與走向。已知對象可做雙方對照；未知對象時「對方」是聚合角色通道，不證明人物存在、不等於一人、也不構成人數上限。此牌陣不直接枚舉未知人群。',
    celtic_cross: '直接觀測：單一情勢的核心、交叉力量、根基、時間轉換、本人、環境、期待與結果。能建立多層因果網；十張不是十個人物或十個月，精確數量仍需獨立實體證據。',
    tree_of_life: '直接觀測：同一問題在十個質點與三柱／中軸中的作用層次。適合結構與內外機制；質點不等於現實人數或固定時間單位。',
    zodiac: '直接觀測：十二個生活領域及全盤主旋律。可區分領域，不自動區分同一領域中的多個未知人物；宮位數也不是事件數量。',
    minor_arcana: '直接觀測：日常互動、流程、資源、阻礙、可介入點與結果。七個位置不等於七個實體；數量與身分須由彼此獨立證據承載。',
    fifteen_card: '直接觀測：五個三牌組的核心、自然發展、替代路徑、決策依據與不可控條件。能比較多層作用；三牌組與牌數不作現實計數。',
    mathers_21: '直接觀測：三排連續故事、首尾配對與中心校正。能深描歷程與相互呼應；二十一張與配對數不是人數、日期或機率。',
    mathers_horseshoe: '直接觀測：A、C、E三個大型證據群的連續故事與配對。能提供廣泛情勢與反證；牌組大小不是現實數量，F組不進入解讀。',
    horseshoe: '直接觀測：過去、現在、隱藏作用、建議、他人／環境、阻礙與結果。未知的他人位是作用通道，不直接證明特定人物或數量。',
    ootk: '直接觀測：Book T 五次操作中實際完成的落點、完整計數故事、配對、元素尊貴與階段發展。計數值與步數只用於導航牌序，不量測現實人數、金額、年齡或日期；第四次操作是代表牌後方三十六張的環，不是旬位或公曆應期。程序若依 Book T 中止，未完成操作沒有觀測權限。'
  };

  function buildEvidenceCapabilityBlock(q, tool, rawPayload) {
    if (tool !== 'tarot' && tool !== 'ootk') return '';
    try {
      var E = (typeof window !== 'undefined') ? window.JYTarotSemanticEngine : null;
      if (!E || typeof E.renderPromptContract !== 'function') {
        return '【系統錯誤】塔羅語義編譯器未載入；不得在缺少方法規格與合法證據圖時生成解讀。';
      }
      var obj = rawPayload || {};
      var contract = obj.semanticContract ||
        (obj.tarotData && obj.tarotData.semanticContract) ||
        (obj.ootkData && obj.ootkData.semanticContract) || null;
      if (!contract && typeof E.compileReadingSpec === 'function') {
        if (tool === 'ootk') {
          contract = E.compileReadingSpec({
            question: q,
            spreadId: 'ootk',
            sourceProfile: 'gd_book_t',
            ootkData: obj.ootkData || obj
          });
        } else {
          var td = obj.tarotData || obj;
          contract = E.compileReadingSpec({
            question: q,
            spreadId: td.spreadType || _getSpreadId(),
            cards: td.cards || [],
            sourceProfile: 'gd_book_t',
            waitePure: false,
            knownCounterpart: (typeof E.inferExplicitCounterpartBinding === 'function' ? E.inferExplicitCounterpartBinding(q) : false)
          });
        }
      }
      if (!contract || (contract.validation && contract.validation.ok === false)) {
        return '【系統錯誤】問題—方法—證據契約未通過驗證；不得以自由聯想替代。';
      }
      return E.renderPromptContract(contract);
    } catch (e) {
      return '【系統錯誤】問題—方法—證據契約建立失敗：' + (e && e.message ? e.message : e);
    }
  }

  function getSpreadMethod(q) {
    try {
      var S = (typeof window!=='undefined' && window.S) ? window.S : null;
      if (!S) try { S = (0, eval)('typeof S !== "undefined" ? S : null'); } catch(e){}
      var t = (S && S.tarot) || {};
      var id = t.spreadType || (typeof getCurrentSpread === 'function' ? getCurrentSpread() : '');
      if (id && SPREAD_METHODS[id]) {
        var _m = SPREAD_METHODS[id];
        return _m;
      }
    } catch(e){}
    return SPREAD_METHODS['_default'];
  }

  // Golden Dawn Book T 只把現有牌圖當辨識載體；圖像敘事不得取代 Book T 對應與元素尊貴。
  function getImageryReq() {
    return '牌圖只用於辨識本次實際牌與宮廷牌固有朝向；不得用Rider-Waite場景故事、人物視線或後世圖像關鍵字取代Golden Dawn Book T牌義。';
  }

  // 全站塔羅來源固定為 Golden Dawn Book T；舊版來源切換旗標永久關閉。
  function _isWaitePure() { return false; }

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

  // v95：原句先編譯成型別化查詢圖；不靠題材詞庫決定問題內容。
  function buildRootQuestionLock(question, tool) {
    if (tool !== 'tarot' && tool !== 'ootk') return buildFocusLock(question, tool);
    return [
      BAR,
      '◆ 原問句保真與型別化原子化（最高優先）',
      BAR,
      '原問句：' + question,
      '先把原句拆成所有會改變答案真值的必要原子：主體、對象／場域、事件或狀態、意圖、行為、結果、否定／排除、身分／關係、比較／門檻、模態、明示期限與其他實質限定。不得用問題分類或牌陣名稱替代自然語言分析。',
      '完成後用查詢圖重建原句，並逐一刪除必要原子測試：重建句與原句必須雙向相容；刪除任何必要原子都應改變原句真值條件。未通過時先修正查詢圖，不得開始讀牌。',
      '答案長短只由不同且可回溯的有效命題數量決定；不能因牌少預設短答，也不能因牌多逐張灌水。'
    ].join('\n');
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
    var isTiming   = has(/什麼時候|何時|幾月|幾號|幾點|多久|多快|近期|這(週|個禮拜)|這個月|這月|本月|下個月|今年|明年|今晚|今天|明天|後天|這幾天|最近(會|能)|還要多久/);
    var isUrgent   = has(/今晚|今天|等等|待會|這幾(個)?小時|24小時|馬上|立刻|這一兩天|此刻/);
    var isYesNo    = has(/嗎[？?]?\s*$|會不會|是不是|有沒有|能不能|可不可以|是否|對不對|對嗎|好不好|行不行/);
    var isProb     = has(/機率|百分比|幾成|幾%|多少%|多少趴|可能性(有)?多(大|高|少)|機會(有)?多(大|高)/); // v85.4 機率題形態
    var isDecision = has(/該不該|要不要|該(選|留|走|分|放棄|繼續)|選.{0,6}還是|.{1,6}還是.{1,6}[好嗎？?]|哪個(好|對|適合)|哪一個|值不值得|值得嗎|適合嗎|留還是走|分還是不分/);
    var isPortrait = has(/對方是(誰|什麼)|他是(誰|什麼樣)|她是(誰|什麼樣)|(他|她|對方).{0,4}(在想|怎麼想|想我|想念|想不想我|愛不愛我|還想|還愛|過得|好不好)|什麼樣的人|對方(的)?(個性|長相|職業)|他喜(不喜)?歡我|她喜(不喜)?歡我/);
    var isOverview = has(/整體運勢|流年|運程|綜合運勢|全年運|今年運勢|本年運勢|這個月運勢|運勢(如何|怎樣|好不好|為何|好嗎|是什麼)|今年.{0,3}(整體|大方向)|大方向(如何|為何)/); // v80.59：偵測「整體運勢／流年」總覽題（本來就該跨領域通盤）

    return { noQ: noQ, raw: s, domains: domains, timing: isTiming, urgent: isUrgent, yesno: isYesNo, prob: isProb, decision: isDecision, portrait: isPortrait, overview: isOverview };
  }

  // 題材關鍵字牌義與固定花色路由已於 v87.0 移除；題目由統一語義引擎自行建模。

  // ── 注入片段：只補共用證據與來源邊界──
  // ① 嚴格不確定判準：防 AI 把「訊號弱」當偷懶藉口
  var FRAG_UNCERTAINTY_TAROT = "\n【證據完成度檢查】\n在說「不確定／訊號不足」前，先確認每個位置、Book T核心義、相鄰元素尊貴、牌陣互動、完整命題與反證均已處理。若完整問題證據不足，但較弱子命題成立，必須先回答完整問題，再說明牌面實際支持到哪一層；不得因無法確認完整事件而丟掉其餘有效資訊。\n";
  var FRAG_UNCERTAINTY_OOTK = "\n【證據完成度檢查】\n在說某階段或整體訊號不足前，先確認本次依Book T實際完成的操作、適配結果、落點、完整計數路徑、配對、元素尊貴與階段整合均已處理；程序已中止時不得假裝後續操作存在。若完整問題不能定論，仍須分層說明五次操作能確認的子命題、限制與觸發條件。\n";
  var FRAG_UNCERTAINTY_MEIHUA =
    '\n【說「訊號弱」前的硬檢查】\n「弱」不是偷懶的避難所。要說某一項訊號不足，先確認：本卦、互卦、變卦、動爻、體用、生剋、旺衰與問題焦點都已對照過。全部看過仍沒有指向，才能說卦面不足；正文用白話說明，不要只丟不確定三個字。\n';
  var FRAG_SOURCELOCK_MEIHUA =
    '\n【學理鎖定】只用三種知識：①本次梅花易數卦盤實際資料 ②梅花易數常用正統技法（本卦、互卦、變卦、動爻、體用、五行生剋、旺衰、八卦萬物類象、外應）③已明示為現代實務的輸出框架。禁止：混入塔羅／開鑰／七維命盤／姓名學、把沒有提供的外應當成已知、把心理學雞湯包裝成術數結論。若只是實務判斷，要說「實務上我會這樣看」，不要說成原典必然。\n';
  var FRAG_RECENCY_MEIHUA =
    '\n' + BAR + '\n交稿前檢查（後半段最容易破功）\n' + BAR +
    '\n□ 第一段已直接回答問題 □ 本卦／互卦／變卦／動爻／體用都已檢查 □ 沒有混入塔羅、開鑰、七維或姓名學 □ 沒把沒有提供的外應硬編成事實 □ 有說明阻礙、24小時行動、可驗證信號 □ 應期照資料區吉應／敗應講、沒有自創應期算法 □ 壞消息沒有包裝 □ 最後有研究娛樂提醒\n';

  // ② 學理鎖定：擋掉網紅/心理學/雞湯，逼回正統
  var FRAG_SOURCELOCK = "\n【學理來源鎖定・Golden Dawn Book T】\n全站塔羅與開鑰之法只使用Hermetic Order of the Golden Dawn《Book T／Liber T》：小牌稱號與占星分度、宮廷牌YHVH／元素層級、卡巴拉世界與質點、相鄰元素尊貴、花色／同階多數，以及Book T五次Opening of the Key程序。不得混入Waite 1910固定正逆位字典、RWS圖像敘事、Crowley／Thoth泰勒瑪專屬改寫、PHB現代擴充或Etteilla牌義。後世牌陣只保留布局拓撲，不改變牌義來源，也不得冒充Book T原創。\n";
  var FRAG_SOURCELOCK_TAROT = FRAG_SOURCELOCK;
  var FRAG_SOURCELOCK_TAROT_WAITE = FRAG_SOURCELOCK;
  // ③ 交稿前 recency 檢查：模型最常在後半段破功，放最後一段（recency 最強）
  function buildRecencyTarot() { return "\n────────────────────────────\n交稿前語義稽核\n────────────────────────────\n□ 已逐字保留原句比較雙方、關係、門檻、模態與期限 □ 已分開精確值、範圍、相對排序、門檻跨越、趨勢與穩定度 □ 第一個裁決沒有重新定義成功或只回答較弱子命題 □ synthesis_only 單位只綜合 dependsOn 命題、未線性化依賴圖 □ 牌義來源釋義沒有被直接複製成事件結論 □ 情境例子已標成可能表現、沒有冒充事實 □ 每個位置與合法互動均已處理 □ 未由牌張數、牌號、宮廷牌數或聚合角色位換算數量 □ 全盤已完成反證競爭與語義飽和 □ 時間、人物與數字均可溯源 □ 只引用本盤合法牌名 □ 品牌收尾沒有反向影響牌義\n"; }
  var FRAG_RECENCY_OOTK = "\n────────────────────────────\n交稿前語義稽核\n────────────────────────────\n□ 已逐項回答原問句的資訊需求並建立證據矩陣 □ 五次操作均已依Book T階段功能處理 □ 已採用資料區的適配、重試與中止結果 □ 每次操作均由落點、完整計數故事、兩側配對與牌力形成階段命題 □ 計數值、步數、落堆張數沒有被換算成現實數量 □ 代表牌反覆出現沒有被當成訊號 □ 不同操作沒有拼成假連線 □ 第一次至第五次已形成發展序列並裁決完整命題 □ 現代附加觀察只作次證、沒有凌駕Book T程序 □ 時間只在資料可靠且問題需要時輸出 □ 所有不同有效命題已呈現、同義者已合併 □ 篇幅由有效命題決定 □ 只引用本盤實際牌與落點 □ 品牌收尾沒有反向影響牌義\n";

  // ④ 收尾能量石（v73.1 歐那）：把賣場自然融進解讀結論，不是廣告區塊。
  //    元素一律綁「牌面」（火水風土＝權杖聖杯聖杯寶劍金幣／開鑰 Op1 YHVH 堆），
  //    不碰八字五行命盤——故塔羅與開鑰共用，且不破壞開鑰「不引命盤」的純粹性。
  //    放在 t.tail 之後、recency 檢查之前（緊貼結論、但不搶最後品管位）。
  // v84_audit5(2026/6/10)：防線統一——輸出要求補盤外資訊禁令＋指令回聲禁令、FRAG_CRYSTAL 補嚴禁並列（六系統同步）
  var FRAG_CRYSTAL = "\n【品牌附加層——占卜完全結束後才執行】\n本段不得反向影響牌義、裁決或建議。另起一段，只介紹一種可隨身配戴的礦物：先依原問句的真實生活情境與自然配戴場合，再看色系、透明度、光澤及材質感選品。資料區的花色分布只可作視覺色調的次要靈感，不得解釋成問卜者「缺某元素」、具有某種人格或必須補某種功能。\n工作／生意／金錢情境可從黃水晶、虎眼石、綠幽靈選一種；關係／社交可從粉晶、草莓晶、月光石選一種；決策／轉換／移動可從茶晶、拉長石、黑曜石選一種；溝通／學習／書面往來可從海藍寶、藍紋瑪瑙、紫水晶選一種；沒有清楚關聯時選白水晶。牌面呈現重大崩解也不能宣稱礦物能化解，只能依沉穩、低調或耐用的視覺與配戴需求選品。\n推薦限2至3句：說明它為何適合這次生活情境或穿搭，再加入一項下列礦物事實，最後自然引導前往靜月之光蝦皮。禁止宣稱治療、護身、辟邪、安神、補元素、提升能力、保證招財／桃花／改運或提高占卜成真率；民俗象徵不得寫成客觀功效。不得使用優惠、特價、限時、下單、搶購、快買等推銷字眼。\n\n【礦物事實錨點】\n白水晶／紫水晶／黃水晶／茶晶／粉晶屬石英家族，主要成分為二氧化矽、三方晶系、硬度7；紫水晶含鐵並受天然輻照致色，黃水晶由鐵致色，茶晶含鋁並受天然輻射呈煙色，粉晶多呈霧狀半透明、全透明極少。草莓晶為石英內含纖鐵礦或赤鐵礦片狀包體。紅瑪瑙／藍紋瑪瑙／紅碧玉屬隱晶質石英；瑪瑙可看天然色帶層次，紅碧玉通常不透明並由鐵氧化物致色。月光石由正長石與鈉長石交層形成暈彩。拉長石屬斜長石、三斜晶系，挑選可看變彩面積。太陽石內含赤鐵礦或銅片而出現砂金閃光。海藍寶屬綠柱石族、六方晶系，由鐵致色。黑曜石是火山玻璃、非晶質，常見貝殼狀斷口。黑碧璽屬電氣石族、三方晶系，柱面常見縱紋。紫龍晶為紫色纖維狀、具絲絹光澤，產於俄羅斯查拉河流域。虎眼石是石英交代石棉假象，呈絲絹貓眼光。綠幽靈是白水晶內含綠泥石包體。葡萄石為斜方晶系，常呈葡萄狀集合體。天鐵是鎳鐵隕石，屬鐵鎳金屬、等軸晶系；表面常見氣印，切磨酸蝕後可見魏德曼花紋，它是金屬而不是含氣泡的天然玻璃。龍宮舍利是市場名稱，成因與成分說法不一，只能描述珠體圓整、皮殼天然完整、結構緻密等外觀挑選標準。\n最後兩行必須原樣輸出，倒數第二行只能放連結，最後一行之後不得再有內容：\n[靜月之光蝦皮賣場](https://shopee.tw/a50h95648d?tab=shop)\n願你諸事順遂。\n";

  // ④b 紫微專用能量石（v85 歐那 2026/6/11）：根治紫微被注入塔羅版規則的錯位——
  //    紫微資料區沒有「花色分布」，舊版會逼 AI 對不存在的數據瞎掰。
  //    紫微選石只綁「這次問題＋結論」，不冒充紫微原典、不碰命盤五行喜忌（命盤喜忌屬八字層，避免兩套系統打架）。
  var FRAG_CRYSTAL_ZIWEI =
    '\n【收尾・能量石（最後 2-3 句自然帶出，禁推銷腔）】\n' +
    '整份解讀寫完後輕收一個尾，挑一種可隨身能量石。紫微盤不做元素統計，選石只綁「這次問題＋這次結論」：結論要的是判斷清明＝白水晶／紫水晶；情感受傷要復原＝粉晶／月光石；要行動力與底氣＝紅瑪瑙／太陽石；要守財落地＝黃水晶／虎眼石；要擋小人穩心神＝黑曜石／黑碧璽；盤面以沖破、煞星密集為主＝天鐵（辟邪定志）或龍宮舍利（護身安神）。\n' +
    '寫法：你是「靜月之光」解讀者，對客人順口多聊一句，不是廣告；不必自報身分，直接講。只挑一種、只講一次（嚴禁「或」「這類」並列第二種）、貼著這次結論說清「為什麼對你是它」，並帶一句這顆石本身的礦物知識——這句只能取自下方【礦物事實錨點】改寫，不得自行編造。能量石是品牌實務輔助，不屬紫微原典。最後兩行固定照此收束：倒數第二行只放這一個 Markdown 連結、原樣照抄（含中括號與小括號）：[靜月之光蝦皮賣場](https://shopee.tw/a50h95648d?tab=shop) （該行不得有這個連結以外的任何文字或空白；嚴禁把網址裸貼成純文字——裸的長網址會被渲染管線插入看不見的字元而點不動，Markdown 連結的網址收在小括號裡、畫面只顯示中文字，不會被動到）；最後一行固定輸出「願你諸事順遂。」六個字作結，之後不再輸出任何內容。兩行缺一不可、順序不可顛倒（網址行被任何字元黏到就點不動，所以網址行上下都要乾淨）。\n' +
    '\n【礦物事實錨點——礦物知識句只能取自此表改寫，不得自行外加成因、成分或產地】\n' +
    '石英家族（白水晶/紫水晶/黃水晶/茶晶/粉晶/草莓晶）＝二氧化矽、三方晶系、硬度7：紫水晶含鐵經天然輻照致色；黃水晶鐵致色；茶晶含鋁受天然輻射呈煙色；粉晶多霧狀半透、全透極少；草莓晶＝內含纖鐵礦/赤鐵礦片狀包體。玉髓類（紅瑪瑙/藍紋瑪瑙/紅碧玉）＝隱晶質石英：瑪瑙看天然色帶層次；紅碧玉不透明、鐵氧化物致色。長石族：月光石＝正長石與鈉長石交層生暈彩，看暈彩乾淨度與內含物；拉長石＝斜長石、三斜晶系、看變彩面積；太陽石＝內含赤鐵礦/銅片生砂金閃光。海藍寶＝綠柱石族、六方晶系、鐵致色。黑曜石＝火山玻璃、非晶質、貝殼狀斷口。黑碧璽＝電氣石族、三方晶系、柱面縱紋。紫龍晶＝紫色纖維狀絲絹光澤、產俄羅斯查拉河流域。虎眼石＝石英交代石棉假象、絲絹貓眼光。綠幽靈＝白水晶內含綠泥石包體。葡萄石＝斜方晶系、常呈葡萄狀集合體。天鐵＝鎳鐵隕石（鐵鎳金屬、等軸晶系）：表面常見氣印、切磨酸蝕後現魏德曼花紋；它是金屬不是玻璃——含氣泡的天然玻璃是似曜岩（俗稱玻璃隕石），兩者是不同東西、嚴禁混述。龍宮舍利＝市場名稱、成因與成分說法不一：礦物句只談外觀挑選（珠體圓整、皮殼天然完整、結構緻密），不得宣稱地質成因。\n' +
    '禁止：每盤都推同一顆石、理由與本盤結論無關、照抄固定模板句，以及「優惠／特價／限時／下單／搶購／快買」等字眼。\n';

  // ⑥ 通用溯源鐵律（v85.5 歐那 2026/6/11）：根治「無出處具體數字」整類病——
  //   時間天數(v84前)、機率百分比(v85.4)、金額、年齡都是同一類：AI 為顯精準而編造盤面推不出的數字。
  //   逐題型補規則永遠補不完；改立通用原則罩住整個類別，題型專屬規則只保留「怎麼推」的方法細節。
  var FRAG_TRACE =
    '\n【通用溯源鐵律——適用全文每一句】\n正文中出現的每一個數字與具體事實——天數、週數、月份、百分比、幾成、金額、價位、年齡、體重、次數、人數、距離、人物外貌、身分、地點細節——都必須能指出是由哪張牌（或本盤資料區哪個欄位）推出來的。推不出來＝直接老實說「牌面給不出這個數字／細節」，改給方向與強弱即可。嚴禁為了顯得精準而編造任何數字或具象；老實說推不出，比編一個漂亮數字正統得多。\n';

  // ⑤ 輸出載體（v85 歐那 2026/6/11）：根治外部 AI 介面把解讀包進文件/畫布容器，
  //    導致第一句在容器外重複出現、結尾網址掉到容器外並黏上不可見字元（U+2060/亂碼）連結失效。
  //    所有工具共用，注入在 recency 檢查之前。
  var FRAG_PLAINTEXT =
    '\n【輸出載體——硬規則】\n整份解讀必須直接輸出為單一純文字回覆：不得建立或使用任何文件、畫布、卡片、Canvas、Artifact 之類的容器，不得輸出「:::」「```」等容器或圍欄語法，不得把全文或第一句複製成容器外的預覽，也不得在正文結束後追加任何說明、署名或符號。\n';

  // ── 組裝「本次問題鎖定」區塊（放在提示詞最前面，primacy 最強）──
  //    ★ v70.4(歐那 2026/5/29)：分工具。塔羅快讀＝yes/no 直答導向；
  //      開鑰之法＝深度拆解導向（絕不能用塔羅的「給是非、禁止擴寫」框架，那會直接掐死開鑰的五層拆解本質）。
  function buildFocusLock(q, tool) {
    var f = detectFocus(q);
    var L = [];
    L.push(BAR);
    L.push('◆ 本次問題保真（最高優先）');
    L.push(BAR);

    if (tool === 'meihua') {
      if (f.noQ) {
        L.push('問卜者沒有填寫明確問題；依卦盤收斂出最有證據的一個核心議題，不跨系統亂掃。');
      } else {
        L.push('原問句：' + f.raw);
        L.push('完整保留原問句的主體、事件、場域、期限與限定；第一句直接回答，再用本卦、互卦、變卦、動爻與體用說明。');
      }
      return L.join('\n') + '\n';
    }

    if (f.noQ) {
      L.push('問卜者沒有填寫明確問題。先從整個牌陣反推證據最集中的核心命題，再只回答該命題；不得依花色公式自行指定生活領域。');
      return L.join('\n') + '\n';
    }

    L.push('原問句：' + f.raw);
    L.push('先在內部建立完整命題與資訊需求：誰／什麼是主體、對象或場域、要判斷何種事件或狀態、成立到什麼程度才算回答，以及使用者要求的是存在、程度、數量、身分、原因、比較、時間、發展、結果或建議中的哪些維度。不要以問題分類或牌陣名稱改寫它。');

    if (tool === 'ootk') {
      L.push('回答方式：先用五次操作共同裁決完整問題，再依階段呈現當下、發展、進一步發展、接近結果前的情節與最終收束。若原方法的適配資料要求中止，先誠實說明，不以「隱藏議題」繞過。');
      if (f.yesno) L.push('這是是非命題：第一句給明確傾向；後文仍要完整呈現五次操作所形成的條件、反證與發展過程。');
    } else {
      if (f.yesno) L.push('這是是非命題：第一句直接裁決原問句完整事件。先確認完整命題的每個必要語義條件是否由同一結構或彼此一致的證據承載；只成立部分條件時，先回答完整問題，再說明牌面實際支持到哪一層。');
      if (f.decision) L.push('這是比較／決策命題：先從原問句建立同一比較標準，再分別評估各選項；不能以不同標準使某一路看起來較好。');
      if (f.prob) L.push('這是機率傾向題：牌面只給相對強弱，不編造百分比或幾成；第一句給清楚傾向並說明證據完成度。');
      if (f.timing) L.push('問題涉及時間：只有本盤資料提供可回溯的時間錨時才給日期或範圍；否則給快慢、先後與觸發條件。');
      if (f.portrait) L.push('問題涉及人物資訊：只有牌位、宮廷牌與全盤關係能可靠綁定時才描述人物；不得由未知對方位反推人物一定存在。');
      if (f.overview) L.push('這是全景題：依牌面有效命題呈現所有真正形成的領域；強領域深讀、同義者整合，不預設固定領域清單。');
    }
    L.push('內容長短只由本盤能形成多少個不同且可回溯的有效命題決定，與牌陣張數無關。');
    return L.join('\n') + '\n';
  }

  // ── 梅花：結構化物件 → 正統解卦資料區 ──
  function formatMeihuaData(mh) {
    var L = [];
    function g(path, fb) {
      try {
        var cur = mh;
        path.split('.').forEach(function(k){ cur = cur && cur[k]; });
        return (cur === undefined || cur === null || cur === '') ? (fb || '') : cur;
      } catch(e) { return fb || ''; }
    }
    L.push('問卜資料：');
    L.push('本卦：' + g('ben.n','') + (g('ben.u','') ? ' ' + g('ben.u','') : ''));
    L.push('互卦：' + g('hu.n','') + (g('hu.u','') ? ' ' + g('hu.u','') : ''));
    L.push('變卦：' + g('bian.n','') + (g('bian.u','') ? ' ' + g('bian.u','') : ''));
    L.push('動爻：第 ' + (mh.dong || '') + ' 爻');
    L.push('上卦：' + g('up.name','') + '（' + g('up.el','') + '）｜下卦：' + g('lo.name','') + '（' + g('lo.el','') + '）');
    L.push('體卦：' + g('tiG.name','') + '（' + g('tiG.el','') + '）｜用卦：' + g('yoG.name','') + '（' + g('yoG.el','') + '）');
    L.push('體用關係：' + g('ty.r','') + '｜吉凶傾向：' + g('ty.f','') + '｜說明：' + g('ty.d',''));
    // v86.12 正統定性（《梅花易數·體用總訣》原文語彙：吉凶以此為綱、旺衰定輕重；剋/克皆相容）
    var _tyOrth = {
      '用生體': '用生體＝有進益之喜（吉）',
      '體生用': '體生用＝有耗失之患（洩耗）',
      '體克用': '體克用＝諸事吉——成在我方主動，剋出仍須出力',
      '用克體': '用克體＝諸事凶——受制受阻',
      '比和':   '比和＝百事順遂'
    };
    var _tyr = String(g('ty.r','')).replace(/剋/g, '克');
    if (_tyOrth[_tyr]) L.push('體用原典定性（吉凶以此為綱，輕重再依體用旺衰增減）：' + _tyOrth[_tyr]);
    if (g('ben.j','')) L.push('本卦卦辭：' + g('ben.j',''));
    if (g('ben.m','')) L.push('本卦解讀：' + g('ben.m',''));
    if (g('bian.m','')) L.push('變卦解讀：' + g('bian.m',''));
    L.push('');
    L.push('前端輸出層（已由卦象資料整理，請直接採用，不要自行重算）：');
    if (mh.shortVerdict) L.push('・短判：' + mh.shortVerdict);
    if (mh.summary) L.push('・摘要：' + mh.summary);
    if (mh.decisionHint) L.push('・行動提示：' + mh.decisionHint);
    if (mh.timing) L.push('・時間節奏：' + safeText(mh.timing));
    // v86.12 正統應期（《占卦訣》：事應於生體卦氣之日、敗於剋體卦氣之日）——由 meihua_output_layer.js v2 buildMeihuaYingQi 提供
    if (mh.yingQi && mh.yingQi.jiTxt) {
      L.push('・應期（正統斷法，吉敗分開看，照用、不可自創算法）：');
      L.push('　吉應之期：' + mh.yingQi.jiTxt);
      L.push('　敗應之期：' + mh.yingQi.baiTxt);
      L.push('　遠近層次：' + (mh.yingQi.layerTxt || '用卦主近期之應、互卦主中期之應、變卦主遠期之應'));
    }
    if (mh.risk) L.push('・風險：' + safeText(mh.risk));
    if (mh.strategy) L.push('・策略：' + safeText(mh.strategy));
    if (mh.tags) L.push('・標籤：' + safeText(mh.tags));
    if (mh.analysis) L.push('・分析物件：' + safeText(mh.analysis));
    return L.join('\n');
  }

  // ── 取排盤資料塊（沿用現有 builder，只匯出 Golden Dawn Book T 核心資料）──
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
    L.push('牌陣：' + (td.spreadZh || td.spreadType || '未指定') + '（' + cards.length + '張）');
    L.push('唯一牌義來源：Golden Dawn《Book T／Liber T》〔gd_book_t〕');
    L.push('方向政策：一般牌陣不使用 Waite 固定正逆位；強弱由牌位與相鄰元素尊貴裁決。');
    if (td.sourceContract) L.push('來源契約：' + safeText(td.sourceContract));
    L.push('');
    L.push('抽到的牌：');
    cards.forEach(function(c,i){
      var pos = c.positionMeaning || c.position || ('位置'+(i+1));
      var line = (i+1)+'. '+pos+'：'+(c.name||'?');
      if (c.bookTTitle) line += '〔'+c.bookTTitle+'〕';
      if (c.element) line += '｜元素：'+c.element;
      if (c.sephirah || c.world) line += '｜卡巴拉：'+[c.sephirah,c.world].filter(Boolean).join('／');
      if (c.correspondence) line += '｜對應：'+c.correspondence;
      line += '｜Book T核心義：'+(c.baseMeaning||c.sourceGloss||'依位置與相鄰牌裁決');
      if (c.elementalDignity) {
        var d=c.elementalDignity;
        line += '｜元素尊貴：'+(d.state||'mixed')+(d.reading?'；本位讀法：'+d.reading:'');
      }
      if (c.courtPolicy) line += '｜宮廷牌限制：'+c.courtPolicy;
      L.push(line);
    });
    var legal=cards.map(function(c){return c.name;}).filter(Boolean);
    if (legal.length){L.push('');L.push('【合法牌名】'+legal.join('、'));}
    if (td.preStats && td.preStats.observations && td.preStats.observations.length) {
      L.push('【Book T多數／同階觀察】'+td.preStats.observations.join('；'));
    }
    if (td.elementalDignityGroups && td.elementalDignityGroups.length) {
      var dgLines=[];
      td.elementalDignityGroups.forEach(function(g){
        (g.links||[]).forEach(function(link){
          var rel=link.relation||{};
          dgLines.push((link.fromName||('位置'+(link.from+1)))+' ↔ '+(link.toName||('位置'+(link.to+1)))+'：'+(rel.label||rel.code||'未定'));
        });
      });
      if(dgLines.length)L.push('【Book T拓撲相鄰元素尊貴】'+dgLines.join('；'));
    }
    if (td.treePillars) L.push('【生命之樹牌陣結構】'+safeText(td.treePillars));
    var qTime=/什麼時候|何時|幾時|多久|幾天|幾週|幾月|哪一年|時間/.test(getQuestion());
    if (qTime) {
      if (td.timeConclusion) L.push('【時間通道】'+safeText(td.timeConclusion)+'；只能採資料明示的相對時序，不得另換算日期。');
      else L.push('【時間邊界】本次資料沒有可回溯的曆日量測通道，只能回答牌位所示的相對階段。');
    }
    return L.join('\n');
  }

  // ── 開鑰之法：結構化物件 → 五次操作完整文字 + 補充觀察 ──
  function formatOOTKData(result) {
    var od=(result&&result.ootkData)||{};
    var ops=od.operations||{};
    var sig=od.significator||{};
    var L=[];
    L.push('方法：Golden Dawn《Book T／Liber T》Opening of the Key 五次操作');
    L.push('唯一牌義來源：gd_book_t；不使用固定正逆位、Waite／Thoth專屬牌義、PHB擴充或自創應期。');
    L.push('代表牌：'+(sig.name||sig.n||safeText(sig)||'未提供'));
    if(od.procedureStatus){
      L.push('程序狀態：'+safeText(od.procedureStatus));
      if(od.procedureStatus.abandoned) L.push('【硬限制】程序已於'+od.procedureStatus.abandonedAt+'停止；不得解讀未生成的後續操作。');
    }
    if(od.validityPolicy)L.push('程序規則：'+od.validityPolicy);
    L.push('');
    var labels={op1:'第一次操作・當下情勢',op2:'第二次操作・問題發展',op3:'第三次操作・進一步發展',op4:'第四次操作・倒數階段（三十六牌環）',op5:'第五次操作・最終結果（生命之樹）'};
    function cn(c){return c?(c.name||c.n||'?'):'?';}
    ['op1','op2','op3','op4','op5'].forEach(function(k){
      var o=ops[k];if(!o)return;
      L.push('────────────────────────');
      L.push('【'+labels[k]+'】');
      if(o.abandoned)L.push('狀態：依Book T停止——'+(o.abandonReason||''));
      if(o.activePile)L.push('代表牌落堆：'+o.activePile+(o.domainMeaning?'（'+o.domainMeaning+'）':''));
      if(o.activeHouse)L.push('代表牌落宮：第'+o.activeHouse+'宮'+(o.domainMeaning?'（'+o.domainMeaning+'）':''));
      if(o.activeSign)L.push('代表牌落星座堆：'+o.activeSign);
      if(o.activeSephirah)L.push('代表牌落生命樹：'+o.activeSephirah+(o.sephirahZh?'（'+o.sephirahZh+'）':'')+(o.sephirahMeaning?'——'+o.sephirahMeaning:''));
      if(o.ringSize)L.push('三十六牌環：'+o.ringSize+'張；本操作不量測日期或月份。');
      if(o.activeCards&&o.activeCards.length)L.push('活躍牌：'+o.activeCards.map(function(c){return cn(c)+(c.bookTTitle?'〔'+c.bookTTitle+'〕':'');}).join('、'));
      if(o.countingPath&&o.countingPath.length)L.push('計數故事（依序）：'+o.countingPath.map(function(s){return (s.cardName||'?')+'〔計'+s.countValue+'〕';}).join(' → '));
      if(o.ringCountingPath&&o.ringCountingPath.length&&o.ringCountingPath!==o.countingPath)L.push('環形計數：'+o.ringCountingPath.map(function(s){return (s.cardName||'?')+'〔計'+s.countValue+'〕';}).join(' → '));
      var pairs=(o.ringPairing&&o.ringPairing.length)?o.ringPairing:o.pairs;
      if(pairs&&pairs.length)L.push('配對故事（由近到遠）：'+pairs.map(function(pr,i){return '#'+(i+1)+' '+cn(pr.left)+(pr.right?'↔'+cn(pr.right):'')+(pr.dignity?'〔'+pr.dignity+'〕':'');}).join('；'));
      if(o.dignities&&o.dignities.length)L.push('元素尊貴：'+safeText(o.dignities));
      if(o.bookTMajorities&&o.bookTMajorities.observations&&o.bookTMajorities.observations.length)L.push('Book T多數／同階觀察：'+o.bookTMajorities.observations.join('；'));
      if(o.expectationNote)L.push('位置適配：'+o.expectationNote);
    });
    var seen={};
    Object.keys(ops).forEach(function(k){(ops[k].activeCards||[]).forEach(function(c){if(c&&c.name)seen[c.name]=1;});});
    if(sig.name)seen[sig.name]=1;
    var legal=Object.keys(seen);
    if(legal.length){L.push('');L.push('【合法牌名】'+legal.join('、'));}
    L.push('【數字邊界】計數值只導航牌序，不代表日期、金額、年齡、人數或機率。');
    return L.join('\n');
  }

  // ── 取排盤資料塊（沿用現有 builder，只匯出 Golden Dawn Book T 核心資料）──
  function getPayloadObject(tool) {
    try {
      var obj = null;
      function _callBuilder(name) {
        try { var fn = (0, eval)('typeof ' + name + ' === "function" ? ' + name + ' : null'); if (fn) return fn(); } catch (e) {}
        try { if (typeof window !== 'undefined' && typeof window[name] === 'function') return window[name](); } catch (e) {}
        return null;
      }
      if (tool === 'ootk') obj = _callBuilder('_buildOOTKPayload');
      else if (tool === 'ziwei') obj = (typeof window !== 'undefined' && window.S && window.S.ziwei) ? window.S.ziwei : null;
      else if (tool === 'meihua') obj = (typeof window !== 'undefined' && window.S && window.S.meihua) ? window.S.meihua : null;
      else obj = _callBuilder('_buildTarotOnlyPayload');
      return obj;
    } catch (e) { return null; }
  }

  function formatPayloadObject(tool, obj) {
    if (!obj) {
      if (tool === 'ziwei') return '（找不到紫微命盤資料，請先完成出生資料排盤）';
      if (tool === 'meihua') return '（找不到梅花易數卦盤資料，請先完成起卦）';
      return '（找不到排盤資料，請先完成抽牌／排盤）';
    }
    if (typeof obj === 'string') return obj;
    if (tool === 'meihua') return formatMeihuaData(obj);
    if (obj.mode === 'ootk' || obj.ootkData) return formatOOTKData(obj);
    return formatTarotData(obj);
  }

  function getPayload(tool) {
    try { return formatPayloadObject(tool, getPayloadObject(tool)); }
    catch (e) { return '（排盤資料組裝失敗：' + (e && e.message ? e.message : e) + '）'; }
  }

  // ── 組成完整可複製提示詞 ──
  function buildPrompt(tool) {
    var t = TPL[tool];
    if (!t) return '';
    var question = getQuestion();
    var rawPayload = getPayloadObject(tool);
    var payload = formatPayloadObject(tool, rawPayload);
    var isRootTarot = (tool === 'tarot' || tool === 'ootk');
    var sourceLock = tool === 'meihua' ? FRAG_SOURCELOCK_MEIHUA : (isRootTarot ? '' : FRAG_SOURCELOCK);
    var uncertainty = tool === 'meihua' ? FRAG_UNCERTAINTY_MEIHUA : (isRootTarot ? '' : FRAG_UNCERTAINTY_TAROT);
    var recency = tool === 'meihua' ? FRAG_RECENCY_MEIHUA : (isRootTarot ? '' : buildRecencyTarot());
    return [
      buildRootQuestionLock(question, tool),
      t.head.replace('{{IMAGERY_REQ}}', (tool === 'tarot' ? getImageryReq() : '')),
      buildEvidenceCapabilityBlock(question, tool, rawPayload),
      sourceLock,
      uncertainty,
      '',
      BAR,
      t.dataHeader,
      BAR,
      '',
      '問卜者的問題：',
      question,
      '',
      (tool === 'ootk' ? '占卜日期：' + new Date().toISOString().slice(0, 10) + '\n' : ''),
      payload,
      '',
      t.tail,
      (tool === 'meihua' ? '' : (tool === 'ziwei' ? FRAG_CRYSTAL_ZIWEI : FRAG_CRYSTAL)),
      FRAG_TRACE,
      FRAG_PLAINTEXT,
      recency
    ].filter(function(x){ return x !== ''; }).join('\n');
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
      '.jy-ex-srcwrap{position:relative;z-index:1;display:flex;gap:.4rem;justify-content:center;align-items:center;flex-wrap:wrap;font-size:.74rem;color:rgba(232,220,200,.66);margin:0 auto 1rem}',
      '.jy-src-btn{font-family:inherit;font-size:.74rem;padding:.32rem .72rem;border-radius:999px;border:1px solid rgba(212,175,55,.35);background:rgba(255,255,255,.03);color:rgba(240,230,210,.72);cursor:pointer;transition:all .15s}',
      '.jy-src-btn.on{background:linear-gradient(135deg,#f6e29a,#c9a23f);color:#231406;border-color:transparent;font-weight:700}',
      '.jy-ex-btn{position:relative;z-index:1;display:block;width:100%;max-width:340px;margin:0 auto;padding:1rem 1.2rem;border:none;border-radius:14px;cursor:pointer;',
        'font-family:inherit;font-size:1rem;font-weight:800;letter-spacing:.05em;color:#231406;overflow:hidden;',
        'background:linear-gradient(135deg,#f6e29a 0%,#e3c25e 45%,#c9a23f 100%);',
        'box-shadow:0 10px 30px rgba(201,162,63,.4),inset 0 1px 0 rgba(255,255,255,.5);transition:transform .15s,box-shadow .2s}',
      '.jy-ex-btn:hover{transform:translateY(-2px);box-shadow:0 14px 38px rgba(201,162,63,.55),inset 0 1px 0 rgba(255,255,255,.6)}',
      '.jy-ex-btn:active{transform:translateY(0)}',
      '.jy-ex-btn::after{content:none;display:none}',
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
    var emblem = (tool === 'ootk') ? '🗝️' : (tool === 'ziwei' ? '🪐' : (tool === 'meihua' ? '☯️' : '🔮'));

    // 全站固定單一牌義來源，移除舊版RWS／Waite切換，避免同一牌陣因入口不同而漂移。
    var toggleHTML = (tool === 'tarot' || tool === 'ootk')
      ? '<div class="jy-ex-srcwrap">牌義來源：<span class="jy-src-btn on" aria-label="Golden Dawn Book T">Golden Dawn Book T</span></div>'
      : '';

    var card = document.createElement('div');
    card.className = 'jy-ex-card';
    card.innerHTML =
      '<div class="jy-ex-stars">' + starsHTML() + '</div>' +
      '<div class="jy-ex-emblem">' + emblem + '</div>' +
      '<div class="jy-ex-title">' + t.label + '・占卜提示詞已備妥</div>' +
      '<div class="jy-ex-sub">輕觸下方按鈕複製，貼到任何 AI 對話（<b>ChatGPT・Claude・Gemini・Grok</b>）送出，' +
        '即可得到一份完整深入的命理解讀。<br>提示詞已封入本次工具所需的正統技法與排盤資料，無需再多做說明。</div>' +
      toggleHTML +
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

    // 牌義來源固定為 Golden Dawn Book T，無切換入口。

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

  // 紫微斗數複製入口：由首頁紫微流程完成排盤後呼叫
  window._jyZiweiCopyMode = function () {
    var w = document.getElementById('d-ziwei-reading') || document.getElementById('ai-deep-result') || document.getElementById('step-3');
    if (!w) return;
    try { window._jyActiveResultMode = 'ziwei'; } catch (e) {}
    render('ziwei', w);
  };

  // 梅花易數複製入口：由首頁梅花獨立流程呼叫
  window._jyMeihuaCopyMode = function () {
    var w = document.getElementById('mh-export-wrap') || document.getElementById('mh-result') || document.getElementById('step-1');
    if (!w) return;
    try { window._jyActiveResultMode = 'meihua'; } catch (e) {}
    render('meihua', w);
  };

  // 開鑰之法：複製模式由 tarot_upgrade.js 的 _triggerOOTKAI 源頭早退處理
  //   （該函數會在抽完牌後直接呼叫 JY_renderExportPrompt('ootk', wrap)）
  //   此處不再覆寫 window._ootkTriggerAI——因為 startOOTK 每次抽牌會動態重設它，覆寫擋不住。

})();
