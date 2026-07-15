/*! prompt-export.js — 靜月之光 前端提示詞匯出引擎  [v87.0]
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
      head: "【角色——塔羅語義解讀者】\n你要把原問句、牌陣位置、正逆位、牌義資料、圖像與牌間關係整合成可回溯的答案。不要以題材關鍵字、固定花色公式、吉凶票數或單張牌義替問題下定義；任何結論都必須由「這張牌在這個位置如何與其他牌共同回答原問句」形成。\n\n【統一語義產出流程——內部完成，不輸出步驟】\n1. 問題保真：先用自然語言重述使用者真正要確認的完整命題，保留主體、對象／場域、事件、成立尺度、期限與所有實質限定。口語概念依上下文拆成可觀察層次，但不要套固定事件表。\n2. 牌陣對齊：牌位名稱是觀察問題的鏡頭，不是事實宣告。「對方位」只有在問題已有可辨識對象時才描述該人；若對象尚未確定，該位置只能條件式描述「若有此人／此作用存在，牌面呈現何種狀態」，不能反過來證明人物存在。結果、建議、阻礙等位置同理，只回答其功能。\n3. 牌位命題：對每張「牌＋位置＋正逆」先產生數個合理句義，再以原問句、相鄰位置、牌陣結構及全盤敘事淘汰不一致者。正位與逆位依本次資料指定的牌義系統讀，不把逆位一律心理化或美化。\n4. 結構合成：依牌陣模組比較、串接或交叉校正各位置。長結構會重新定義局部牌義；局部牌只補原因、條件、表現或轉折，不能脫離位置被升級成更強事件。\n5. 完整命題裁決：區分「原問句完整命題」與牌面只支持的較弱子命題。好感不自動等於告白，責任增加不自動等於正式升遷，直接談話不自動等於戀愛表態；這些只是示範語義層級，不是事件對照表。只有完整命題所需的作用在同一結構或一致證據中成立，才可對完整問題給肯定傾向；否則先裁決完整問題，再說明牌面實際支持到哪一層。\n6. 全盤競爭與反證：把所有位置命題放入同一語義網，主動尋找能削弱、限定或改寫核心結論的牌。支持與反對不是清點票數，而要看各牌所在位置、作用階段、強度與結果權重。保留能解釋更多本盤資料、依賴更少盤外假設、具體程度與證據相稱的解讀。\n7. 輔助資料校正：花色、元素互動、數字、大牌比例、宮廷牌、占星時間與圖像只作輔助。某花色缺席不等於相應功能不存在；功能可由其他牌與位置承載。宮廷牌可表示人物或行動風格，只有身分能可靠對應時才推人物。圖像細節只有在它實際改變命題時才寫入，不設固定張數。\n8. 語義飽和：每個位置與合法互動都必須在內部處理；凡能增加新的結果、原因、條件、角色作用、阻礙、轉折、穩定度或可觀察訊號，就納入正文。同義者整合，無關或證據不足者不編故事。答案長短只由有效命題數量決定，不由牌數決定。\n9. 現實轉譯：在主要解讀後，只提出由已成立命題直接推導、可觀察或可執行的方向。建議不能替代預測，也不能用空泛鼓勵補足缺失證據。\n\n【來源與系統邊界】\n先辨認本次牌義來源與牌陣傳承。現代 RWS 以資料區的現代通行正逆義及 PCS 圖像為主；純 Waite、Mathers 1888、Thoth／Golden Dawn 方法依各自資料區與牌陣模組，不混用彼此不相容的牌義。現代實務牌陣可嚴格分析，但不冒充唯一古法。\n\n【最後解讀】\n第一句直接回答完整原問句。若問題含數個實質層次，逐層裁決：能判斷的明說，不能由本盤確認的限定分開說明。正文依語義關係自然展開，不逐格報告、不教技法；每個重要判斷自然附本盤牌名作證。時間只有在問題要求且資料提供可回溯錨點時才給；否則只說快慢、階段或觸發條件。人物身分、年齡、外貌、金額、日期與其他具體事實沒有可靠牌面來源時不捏造。壞消息照牌面說，不把阻礙美化成必然轉機，也不把單一凶牌擴大成全局終局。",
      dataHeader: '十、以下是排好的牌陣資料',
      tail: '請依以上原問句、牌陣位置、牌義來源與本盤資料，使用統一語義產出流程完成解讀。先裁決完整問題，再呈現所有不同且可回溯的有效命題；不要依牌數決定篇幅，不要逐格報告，不要把較弱子命題升格成完整事件。只引用本盤合法牌名。'
    },
    ootk: {
      label: '開鑰之法',
      head: "【角色——開鑰之法語義解讀者】\n你要依 Golden Dawn《Book T》五次操作的結構，把每次操作讀成一個階段，再整合成對原問句的完整答案。不要把五次操作當五份重複報告，也不要以代表牌必然反覆出現、單一落點、單張終點牌或現代附加指標取代完整程序。\n\n【五次操作的階段功能】\n第一次操作說明占卜當下的情勢與事情如何開始；第二次說明其發展；第三次說明更進一步的發展；第四次說明接近結果前的關鍵情節與節奏；第五次說明最終結果。每次操作都使用重新洗牌後的獨立牌序，因此先讓各次操作自行成句，再依階段先後整合，不能把不同操作的牌硬接成同一條路徑。\n\n【每次操作的完整閱讀】\n1. 先讀代表牌落入的堆、宮、星座、旬或生命之樹質點，判斷該階段從哪個場域與功能觀看問題。\n2. 從代表牌起算的完整計數路徑要讀成過程：每一站如何延續、改變、阻礙或落實前一站，不能只取終點。\n3. 代表牌兩側向外的配對要各自成句，判斷兩股力量如何支持、削弱或牽制本階段主線；元素關係只校正牌力，不代替牌義。\n4. 再把落點、計數過程與配對整合成該次操作的階段命題，並區分它直接回答完整問題，還是只提供子命題、條件、風險或可觀察表現。\n\n【適配與中止——依原方法誠實處理】\n第一次操作的元素堆、第二次操作預先選定的適當宮位及其相應宮位、第三次操作的星座檢查，應以資料區已提供的適配／有效性結果為準。若原方法判定該次占卜不適配或應中止，就如實說明，不把落錯堆、落錯宮或落錯星座自動改稱「真正隱藏議題」以繼續強斷。第五次操作的質點不一致本身不必然使占卜失效，依資料區與原方法處理。\n\n【全局整合】\n1. 代表牌每次操作都會出現，是選堆機制，不是跨層重複訊號。\n2. 各次操作先按自身完整資料成句，再比較哪些主題被後續階段延續、放大、修正或終止。跨操作重複牌只在確實改變整體命題時作佐證，不強求重複。\n3. 對原問句建立完整命題與較弱子命題。先確認五次操作合起來支持到哪個層級，再裁決完整問題；不能因某一層有好牌或凶牌就跳級。\n4. 主動尋找反證與限制，依它作用的階段與位置校準結論，不作吉凶票數統計。\n5. 第四次操作提供的旬或日期只有在資料區完整、與事件進程相容且原問句需要時間時才轉成時間窗口；優先說明觸發條件與先後，不為了精準硬湊日期。\n6. Unaspected／Source of the Nile 等資料若有提供，只能作現代實務的次級觀察；不是《Book T》每次操作的必備核心，也不能凌駕落點、完整計數與配對。\n7. 完整度以語義飽和為準：五次操作全部完成內部閱讀，所有能新增答案內容的有效命題都要輸出；同義者合併。篇幅由有效命題數量決定，不因五次操作固定寫五段，也不因資料多而灌水。\n\n【最後解讀】\n第一句直接回答原問句；其後把五次操作整合成自然敘事，交代事情目前如何開始、如何發展、關鍵轉折、主要助阻、接近結果前的條件與最終收束。只引用本盤實際牌與落點。技術術語留在內部，正文用白話。能由牌面確認的說清楚，不能確認的限制分開說明；不要把占卜寫成不可改變的命運。最後可加入由已成立機制直接推導的可觀察或可執行方向。",
      dataHeader: '六、以下是排好的五次操作資料',
      tail: '請依以上五次操作資料，先確認原方法的適配／有效性，再讓每次操作各自形成階段命題，最後依第一次至第五次的發展次序整合。第一句直接回答完整原問句；所有能增加答案內容的命題都要呈現，同義者合併。不要把代表牌反覆出現、單一落點或現代附加指標當成核心答案。只引用本盤實際牌與落點。'
    }
  };

  // ═══ v74 牌陣讀法動態注入 ═══
  // 原本 12 種全塞 head (~800 tok)，改為依當次牌陣只注入對應的 1 種 (~100 tok)。
  // 省 ~700 tok/call，Opus 4.7 $5/M input 下有意義。
  var SPREAD_METHODS = {
    "_default": "本次牌陣依前端提供的位置與順序閱讀。先讓每張牌在其位置形成命題，再依實際位置關係整合。所有位置都要在內部處理；正文只輸出能為原問句增加不同內容的命題，篇幅不依張數決定。",
    "three_card": "本次牌陣：三牌陣（3張，現代實務）。三張形成一個最小事件結構；位置名稱若由前端提供就依其功能讀，沒有固定位置時依問題自然形成一條完整句。先讀各張在位置上的命題，再讀1↔2、2↔3及三張整體如何互相改寫。三張全部處理，但不因牌少壓縮：任何不同的結果、原因、條件、轉折或建議都要呈現。",
    "five_card": "本次牌陣：五牌陣（5張，現代實務）。依前端位置把五張建成一個因果與條件網：現況、形成原因、阻礙、可採取作用與結果彼此校正。結果位不單獨定案，必須說明前面機制如何導向它；建議位只轉譯成由該牌直接支持的行動。五張全部內部處理，正文按有效命題輸出。",
    "cross": "本次牌陣：十字牌陣（5張，現代實務）。以核心與橫跨／阻礙力量的關係為主軸，再由根源、發展與建議校正。不要把一張「阻礙牌」自動當否定，也不要讓建議牌代替結果；讓五個位置共同形成完整命題。",
    "either_or": "本次牌陣：二選一牌陣（5張，現代決策工具）。先從問句建立同一組比較標準，再分別讓A路與B路形成完整命題，包含推進方式、代價、風險、可持續性與結果；只比較牌面實際形成的層次。不得跨路拼牌，也不得用不同標準偏袒一路。若牌面不能分出高下，就說明各自成立條件。",
    "timeline": "本次牌陣：時間線牌陣（5張，現代實務）。位置表示事件階段，不保證等距日曆時間。先形成「根源→近期作用→轉折→後續發展→收束」的過程，再找觸發條件、加速或延遲來源。只有資料區有可靠時間錨且問題需要時，才換算日期；否則給先後、快慢與條件。",
    "relationship": "本次牌陣：關係牌陣（6張，現代雙人對比工具）。依「你／對方或對方作用／關係現況／挑戰／建議／走向」建立關係網。若原問句已有可辨識對象，對方位描述該人；若問的是尚未確定存在的對象或未來人物，對方位只能條件式描述可能的對方作用，不能反過來證明有人存在。走向只表示此結構的短期演變，完整事件仍須由感情性質、行動內容與結果共同支持。六個位置全部內部處理，正文不逐格報告。",
    "celtic_cross": "本次牌陣：Waite凱爾特十字（10張）。依Waite位置骨架讀：現況、橫跨力量、上方可成形、腳下根基、身後、身前、本人、環境、希望／恐懼、最終將至。先讓每個位置成命題，再比較上方↔根基、身後↔身前、本人↔環境，最後以第10位收束但不脫離前九位機制。第9位只校正主觀期待與擔憂，不當客觀結果。十張全部內部處理，正文只保留獨立有效命題。",
    "tree_of_life": "本次牌陣：生命之樹（10張，Hermetic Qabalah結構的塔羅應用）。依十個質點的功能、三柱平衡及中軸由源頭到落地的路徑整合；質點是功能鏡頭，不是固定吉凶。先讀各質點命題，再看右柱擴張、左柱形塑與中柱整合如何互相調節，以及Kether→Tiphareth→Yesod→Malkuth如何落實。所有質點內部處理，正文不必為湊數逐點念牌。",
    "zodiac": "本次牌陣：黃道十二宮（12+1張，占星宮位的塔羅應用）。每宮先在其生活領域形成命題，再依原問句選出直接相關宮、其對宮、宮主題之間的支持與牽制；第13張只作全盤主旋律。十二宮全部內部處理，但正文不強迫十二段或每張牌名都出現：只輸出與原問句相關、能增加答案內容的宮位命題；若題目本來是全景運勢，才完整呈現各領域。",
    "minor_arcana": "本次牌陣：小阿卡那專題牌陣（7張，現代實務）。聚焦可觀察的日常事件、資源、互動與階段變化；不因缺少大牌就判斷事情不重要，也不套宿命語氣。依位置網絡讓七張共同形成結果、機制與可行方向，所有位置內部處理，正文按有效命題輸出。",
    "fifteen_card": "本次牌陣：Thoth／Golden Dawn風格十五張（開鑰簡化實務）。五組三張各自以中牌為主題、兩側牌校正其力量與表現，再比較核心、本能路徑、替代路徑、決策層與外在／命運條件如何整合。此法不套RWS逆位邏輯。十五張全部內部處理，但不為湊完整而逐張點名；正文只呈現各三牌組真正新增的命題與路徑比較。",
    "mathers_21": "本次牌陣：Mathers 1888第二法二十一張。依資料區的Mathers／Etteilla正逆義，三排各自按原排牌方向讀成連續敘事，再讀1↔21至10↔12的首尾配對，第11張單獨校正中心。三排沒有原典固定的過去／現在／未來位置義，不自行添加。二十一張全部內部處理；正文不強迫每張牌名逐一出現，只保留能改變答案的排內句、配對與中心命題。",
    "mathers_horseshoe": "本次牌陣：Mathers 1888第一法完整horseshoe（A／C／E三組）。依資料區的Mathers／Etteilla牌義與各組原定閱讀順序，先讓每組完整成句，再讀組內首尾配對與居中作用，最後比較三組如何共同回答原問句。逆位依原方法資料讀，不混入RWS場景。全部牌內部處理；正文按有效命題整合，不逐張抄寫五十四張。",
    "horseshoe": "本次牌陣：馬蹄牌陣。依前端提供的七個位置功能建立事件弧，讓根源、現況、隱性作用、阻礙、環境、建議與結果互相校正；不要把位置名稱當固定事件事實。七張全部內部處理，正文只輸出新增答案內容。"
  };

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

  // ★ 圖像要求隨牌陣切換：RWS 系牌陣讀 PCS 場景圖；Mathers（基於 Marseille，小牌無場景圖）禁止描述 RWS 畫面
  function getImageryReq() {
    try {
      var S = (typeof window!=='undefined' && window.S) ? window.S : null;
      if (!S) try { S = (0, eval)('typeof S !== "undefined" ? S : null'); } catch(e){}
      var t = (S && S.tarot) || {};
      var id = t.spreadType || (typeof getCurrentSpread === 'function' ? getCurrentSpread() : '');
      if (id === 'mathers_horseshoe' || id === 'mathers_21') {
        return '本法依資料區的Mathers／Etteilla牌義與牌序合成，不描述RWS／PCS小牌場景。圖像不是固定輸出項目。';
      }
    } catch(e){}
    return 'RWS／PCS圖像只在人物姿態、視線、背景或物件確實改變本題命題時才自然引用；沒有新增判斷就不為湊數描述。';
  }

  // ★ 純-Waite 模式旗標（由匯出卡「牌義來源」切換鈕設定；預設關＝現代 RWS）。
  //   只作用在 RWS 牌陣：開啟時牌義改用 Waite《Pictorial Key》原典正/逆義，並關掉 GD 元素尊嚴/旬/卡巴拉疊層。
  function _isWaitePure() {
    try { return (typeof window !== 'undefined') && window.JY_WAITE_PURE === true; } catch (e) { return false; }
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
  var FRAG_UNCERTAINTY_TAROT = "\n【證據完成度檢查】\n在說「不確定／訊號不足」前，先確認每個位置、正逆位、牌陣互動、完整命題與反證均已處理。若完整問題證據不足，但較弱子命題成立，必須先回答完整問題，再說明牌面實際支持到哪一層；不得因無法確認完整事件而丟掉其餘有效資訊。\n";
  var FRAG_UNCERTAINTY_OOTK = "\n【證據完成度檢查】\n在說某階段或整體訊號不足前，先確認五次操作的適配結果、落點、完整計數路徑、配對與階段整合均已處理。若完整問題不能定論，仍須分層說明五次操作能確認的子命題、限制與觸發條件。\n";
  var FRAG_UNCERTAINTY_MEIHUA =
    '\n【說「訊號弱」前的硬檢查】\n「弱」不是偷懶的避難所。要說某一項訊號不足，先確認：本卦、互卦、變卦、動爻、體用、生剋、旺衰與問題焦點都已對照過。全部看過仍沒有指向，才能說卦面不足；正文用白話說明，不要只丟不確定三個字。\n';
  var FRAG_SOURCELOCK_MEIHUA =
    '\n【學理鎖定】只用三種知識：①本次梅花易數卦盤實際資料 ②梅花易數常用正統技法（本卦、互卦、變卦、動爻、體用、五行生剋、旺衰、八卦萬物類象、外應）③已明示為現代實務的輸出框架。禁止：混入塔羅／開鑰／七維命盤／姓名學、把沒有提供的外應當成已知、把心理學雞湯包裝成術數結論。若只是實務判斷，要說「實務上我會這樣看」，不要說成原典必然。\n';
  var FRAG_RECENCY_MEIHUA =
    '\n' + BAR + '\n交稿前檢查（後半段最容易破功）\n' + BAR +
    '\n□ 第一段已直接回答問題 □ 本卦／互卦／變卦／動爻／體用都已檢查 □ 沒有混入塔羅、開鑰、七維或姓名學 □ 沒把沒有提供的外應硬編成事實 □ 有說明阻礙、24小時行動、可驗證信號 □ 應期照資料區吉應／敗應講、沒有自創應期算法 □ 壞消息沒有包裝 □ 最後有研究娛樂提醒\n';

  // ② 學理鎖定：擋掉網紅/心理學/雞湯，逼回正統
  var FRAG_SOURCELOCK = "\n【學理來源鎖定】\n只使用本盤資料與本次明示的牌義系統。開鑰之法以Golden Dawn《Book T》的五次操作骨架為主，Crowley／Thoth與現代研究只在資料區明示時作補充；不把現代附加法冒充原典，也不混入RWS逆位心理化。原典沒有規定的部分可作實務推論，但要保持證據強度，不說成唯一正統。\n";
  var FRAG_SOURCELOCK_TAROT = "\n【學理來源鎖定・現代RWS】\n本次採資料區提供的現代RWS通行正逆義，以Pamela Colman Smith圖像作有關聯的敘事輔助；Golden Dawn／Book T元素與占星資料只作次級校正。不要把現代通行義冒充Waite 1910逐字原義，也不要使用與本盤資料衝突的網路固定牌義、心理雞湯或題材公式。\n";
  var FRAG_SOURCELOCK_TAROT_WAITE = "\n【學理來源鎖定・純Waite】\n本次只採資料區提供的A.E. Waite《The Pictorial Key to the Tarot》正位與逆位占義；PCS圖像只輔助該原義，不以現代RWS關鍵字改寫。不要疊加Golden Dawn元素尊嚴、旬、卡巴拉或現代逆位心理學。牌在位置中的句法仍須由原問句與全盤結構形成，不把原書單張詞義直接升格成完整事件。\n";
  // ③ 交稿前 recency 檢查：模型最常在後半段破功，放最後一段（recency 最強）
  function buildRecencyTarot() { return "\n────────────────────────────\n交稿前語義稽核\n────────────────────────────\n□ 已回答原問句完整命題，而非只回答較弱子命題 □ 每個位置與牌陣要求的互動均已內部處理 □ 牌位沒有被當成未知人物或事件存在的證明 □ 結果、阻礙、建議與環境依各自功能整合，未作吉凶票數 □ 花色、元素、數字、圖像與宮廷牌只作校正 □ 所有不同且相關的有效命題已輸出，同義內容已合併 □ 篇幅由有效命題決定，不由牌數決定 □ 時間、人物與數字均可溯源 □ 只引用本盤合法牌名 □ 品牌收尾沒有反向影響牌義\n"; }
  var FRAG_RECENCY_OOTK = "\n────────────────────────────\n交稿前語義稽核\n────────────────────────────\n□ 五次操作均已按各自階段功能處理 □ 已依資料區核對原方法的適配／中止結果 □ 每次操作均整合落點、完整計數路徑與配對，不只取終點 □ 代表牌反覆出現沒有被當成訊號 □ 不同操作沒有拼成假連線 □ 第一次至第五次已形成發展序列並裁決完整命題 □ 現代隱藏牌觀察只作次證、沒有凌駕Book T程序 □ 時間只在資料可靠且問題需要時輸出 □ 所有不同有效命題已呈現，同義者合併 □ 篇幅由有效命題決定 □ 只引用本盤實際牌與落點 □ 品牌收尾沒有反向影響牌義\n";

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
    L.push('先在內部建立完整命題：誰／什麼是主體、對象或場域、要判斷何種事件或狀態、成立到什麼程度才算回答，以及有哪些不可省略的限定。不要以問題分類或牌陣名稱改寫它。');

    if (tool === 'ootk') {
      L.push('回答方式：先用五次操作共同裁決完整問題，再依階段呈現當下、發展、進一步發展、接近結果前的情節與最終收束。若原方法的適配資料要求中止，先誠實說明，不以「隱藏議題」繞過。');
      if (f.yesno) L.push('這是是非命題：第一句給明確傾向；後文仍要完整呈現五次操作所形成的條件、反證與發展過程。');
    } else {
      if (f.yesno) L.push('這是是非命題：第一句直接裁決原問句完整事件，不得用較弱子命題代替。例如牌面只支持關注、溝通或責任時，必須另外判斷它是否足以推出原問句所問的完整行動或結果。');
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
    // ★ B（純考據 Mathers）：mathers_21 / mathers_horseshoe 兩法改用 Mathers 1888 原典牌義，
    //   並關掉所有非 Mathers 的 GD/現代分析層（元素尊嚴宮廷、卡巴拉、Decan 時間、對立牌、數字學…）。
    var _isMathers = (td.spreadType === 'mathers_horseshoe' || td.spreadType === 'mathers_21');
    var _isWaite = !_isMathers && _isWaitePure();   // 純-Waite 模式只作用在 RWS 牌陣（不覆蓋 Mathers）
    var _pureSrc = _isMathers || _isWaite;           // 任一純原典模式：關掉現代 GD 疊層（元素尊嚴/旬/卡巴拉/對立牌…）
    cards.forEach(function (c, i) {
      var pos = c.positionMeaning || c.position || ('位置' + (i + 1));
      var ln = (i + 1) + '. ' + pos + '：' + (c.name || '');
      if (_isMathers) {
        // Mathers 1888 原典義（Etteilla 系）：「→」後面就是該牌正/逆位的原典含義，直接照讀
        var _mm = c.isUp ? (c.mathersUp || '') : (c.mathersRv || '');
        if (_mm) ln += ' → ' + _mm;
      } else if (_isWaite) {
        // 純-Waite 模式：「→」後面是 Waite《Pictorial Key》原典正/逆義，直接照讀，不疊 keywords/GD 宮廷
        var _wm = c.isUp ? (c.waiteUp || '') : (c.waiteRv || '');
        if (_wm) ln += ' → ' + _wm;
      } else {
        if (c.keywords) ln += '〔' + c.keywords + '〕';
        if (c.meaning) ln += ' → ' + c.meaning;
        // ★ 根治宮廷牌矛盾：移除 inline GD 宮廷義。那是 Book T「well-dignified」特質、不吃逆位，
        //   貼在逆位宮廷牌上會與該牌逆位關鍵字＋反位感知的「宮廷人物（td.courtPeople）」那行互相打架。
        //   GD 的「ill-dignified」≠牌面逆位，RWS 逆位牌本就不適用 GD 宮廷法。人物一律由 td.courtPeople 統一供應。
      }
      L.push(ln);
    });
    // ★ 花色分布（suit clustering — 某花色佔多＝該領域訊號強，技術庫強訊號）
    var _suit = { 火: 0, 水: 0, 風: 0, 土: 0, 大牌: 0 };
    cards.forEach(function (c) {
      var n = c.name || '';
      if (/權杖|火杖|杖/.test(n)) _suit.火++;
      else if (/聖杯|杯/.test(n)) _suit.水++;
      else if (/寶劍|劍/.test(n)) _suit.風++;
      else if (/錢幣|金幣|星幣|圓盤|錢/.test(n)) _suit.土++;
      else _suit.大牌++;
    });
    if (cards.length) {
      L.push('');
      L.push('花色分布（結構統計，只用來觀察全盤表達方式與重複功能；不能由某花色多寡直接指定題目領域，缺席也不代表相應功能不存在）：火(權杖)' + _suit.火 + '・水(聖杯)' + _suit.水 + '・風(寶劍)' + _suit.風 + '・土(錢幣)' + _suit.土 + '・大牌' + _suit.大牌);
    }
    // ★ 合法牌名清單（禁幻覺——複製模式沒有後端機械審計，用清單替代）
    var _legal = cards.map(function (c) { return c.name; }).filter(Boolean);
    if (_legal.length) { L.push(''); L.push('【本次合法牌名清單（你只能引用這些牌，清單外的牌一律不可出現；▲▼正逆符號只是資料標記——正文引用時只寫牌名本身，不得帶「▲」「▼」「正位」「逆位」前綴）】'); L.push('  ' + _legal.join('、')); }
    var extra = [];
    function add(label, val) { if (val !== null && val !== undefined && val !== '' && !(val.length === 0)) { var s = safeText(val); if (s) extra.push(label + '：' + s); } }
    // 正逆統計、大牌比重 為事實計數（花色分布已於上方輸出），與 Mathers 相容，兩類牌陣都送
    add('正逆位參考', td.summary);
    add('大牌比重', td.majorWeight);
    add('三柱分佈（生命之樹核心讀法，最優先用）', td.treePillars);
    if (!_pureSrc) {
      // ↓ GD/現代分析層：Mathers 1888 與 Waite 原典占卜篇都不使用這些，純原典模式一律不送
      //   （同時根治 P2：GD 元素尊嚴宮廷與反位制宮廷打架的問題）
      add('元素尊嚴（逐張受鄰牌元素增減的強度分，順序同上牌序；正=被鄰牌助旺、負=被鄰牌削弱、0=中性或夾於對立元素間不受影響——只作內部輕重輔助，不可壓過位置與正逆位，正文禁用此術語）', td.elementalDignity);
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
      add('牌面張力（機械統計提示，只標出「哪裡有張力要處理」；張力的成因與裁決一律以位置牌義為準，與你讀出的牌義衝突時以牌義為準）', td.tensions);
      if (td.preStats && td.preStats.insights) add('前端洞察（全盤比例統計，僅供對照；與位置牌義衝突時以牌義為準）', td.preStats.insights);
    }
    if (extra.length) {
      L.push('');
      L.push(_pureSrc
        ? '── 以下為本盤事實統計，請【直接採用】，不要自行重算 ──'
        : '── 以下數據已由排盤系統精算完成，請【直接採用】，不要自行重算。尤其元素尊嚴、Decan 日期、數字模式是機械運算結果，重算只會出錯——你的工作是「解讀」這些既定數據，不是重算 ──');
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
    L.push('適配判斷說明：請直接以原問句完整語意，對照每次操作的實際落點判斷是否符合Book T／Mathers方法；前端題材分類不作裁決。若資料沒有第二次重發結果，不得假稱已完成第二次適配驗證。');
    if (sigFacing) L.push(sigFacing);
    L.push('');
    var opLabels = {
      op1: 'Op1 四元素堆（YHVH）——當下處境',
      op2: 'Op2 十二宮——問題的展開',
      op3: 'Op3 十二星座——進一步展開（內在驅力）',
      op4: 'Op4 三十六旬——倒數階段（時機節奏）',
      op5: 'Op5 生命之樹——最終結果'
    };
    // ★ 把每層真正結構化（鏡像 head 要的 Sig落點/Counting/Pairing/Dignities），
    //   op-specific 欄位（宮/星座/旬/質點，名稱不一）用 safeText 保底，絕不漏資料。
    function cn(c) { return c ? (c.n || c.name || '?') : '?'; } // ★ v76：OOTK 不標逆位
    var PILE = { fire: 'Yod 火堆（主動、推進與工作功能）', water: 'Heh 水堆（感受、關係與接受功能）', air: 'Vau 風堆（思考、衝突與變動功能）', earth: 'Heh-final 土堆（物質、資源與落實功能）' };
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
      if (o.dignities) { var _dg = safeText(o.dignities); if (_dg) L.push('元素尊嚴（逐張受鄰牌元素增減的強度分；正=被鄰牌助旺、負=被鄰牌削弱、0=中性——只作內部輕重判斷，正文禁用此術語）：' + _dg); }
      // ★ v75.2：Op4 預算公曆日期，明確顯示，AI 不需再自己換算
      if (o.decanDateRange) L.push('聚焦旬：' + (o.decanSign||'') + ' ' + (o.decanRange||'') + ' → 公曆約 ' + o.decanDateRange + '（旬主星：' + (o.decanPlanet||'') + '）');
      // op-specific 落點與其餘欄位（宮位/星座/旬/質點及其含義，名稱不一，safeText 保底）
      var _rest = {}, _skip = { piles: 1, activePile: 1, meaning: 1, activeCards: 1, sigIndex: 1, keyCards: 1, countingPath: 1, mq_countingPath: 1, pairs: 1, dignities: 1, decanSign: 1, decanRange: 1, decanPlanet: 1, decanDateRange: 1, expectedPiles: 1, expectedHouses: 1, expectedSigns: 1, expectedSephiroth: 1, abandonTriggered: 1, abandonReason: 1, weakSignalWarning: 1, weakSignalReason: 1, sephExpectationMet: 1, sephExpectationNote: 1, firstAttemptPile: 1, firstAttemptHouse: 1, firstAttemptSign: 1, attempt: 1 };
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
      } else if (tool === 'ziwei') {
        obj = (typeof window !== 'undefined' && window.S && window.S.ziwei) ? window.S.ziwei : null;
      } else if (tool === 'meihua') {
        obj = (typeof window !== 'undefined' && window.S && window.S.meihua) ? window.S.meihua : null;
      } else {
        obj = _callBuilder('_buildTarotOnlyPayload');
      }
      if (!obj) {
        if (tool === 'ziwei') return '（找不到紫微命盤資料，請先完成出生資料排盤）';
        if (tool === 'meihua') return '（找不到梅花易數卦盤資料，請先完成起卦）';
        return '（找不到排盤資料，請先完成抽牌／排盤）';
      }
      if (typeof obj === 'string') return obj; // 防呆：萬一回傳字串
      // v86.26：ziwei 分支隨 TPL.ziwei 一併拆除（formatZiweiData 從未存在；紫微走 ziwei-standalone）
      if (tool === 'meihua') return formatMeihuaData(obj);
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
      (tool === 'tarot' ? ('\n【本次牌陣專屬讀法——最優先，與後面所有通則衝突時一律以這段為準】\n' + getSpreadMethod(question)) : ''),
      (tool === 'meihua' ? FRAG_SOURCELOCK_MEIHUA
        : tool === 'tarot' ? (_isWaitePure() ? FRAG_SOURCELOCK_TAROT_WAITE : FRAG_SOURCELOCK_TAROT)
        : FRAG_SOURCELOCK),
      t.head
        .replace('{{IMAGERY_REQ}}', (tool === 'tarot' ? getImageryReq() : '')),
      (tool === 'ootk' ? FRAG_UNCERTAINTY_OOTK : (tool === 'meihua' ? FRAG_UNCERTAINTY_MEIHUA : FRAG_UNCERTAINTY_TAROT)),
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
      (tool === 'meihua' ? '' : (tool === 'ziwei' ? FRAG_CRYSTAL_ZIWEI : FRAG_CRYSTAL)),
      FRAG_TRACE,
      FRAG_PLAINTEXT,
      (tool === 'ootk' ? FRAG_RECENCY_OOTK : (tool === 'meihua' ? FRAG_RECENCY_MEIHUA : buildRecencyTarot()))
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

    // ★ 純-Waite 切換鈕：僅塔羅且非 Mathers 牌陣時顯示（手機可點，預設＝現代 RWS）
    var _spId = '';
    try { var _SR = (typeof window!=='undefined' && window.S) ? window.S : null; if (!_SR) try { _SR = (0, eval)('typeof S !== "undefined" ? S : null'); } catch(e){} _spId = (_SR && _SR.tarot && _SR.tarot.spreadType) || ''; } catch(e){}
    var _showWaiteToggle = (tool === 'tarot') && _spId !== 'mathers_21' && _spId !== 'mathers_horseshoe';
    var _waiteOn = _isWaitePure();
    var toggleHTML = _showWaiteToggle
      ? ('<div class="jy-ex-srcwrap">牌義來源：' +
         '<button type="button" class="jy-src-btn' + (!_waiteOn ? ' on' : '') + '" data-src="modern">現代 RWS</button>' +
         '<button type="button" class="jy-src-btn' + (_waiteOn ? ' on' : '') + '" data-src="waite">Waite 原典</button>' +
         '</div>')
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

    // ★ 純-Waite 切換鈕事件：切換旗標後重渲染（卡牌已在抽牌時掛 waiteUp/waiteRv，故只需重建提示詞，不用重抽）
    var srcBtns = card.querySelectorAll('.jy-src-btn');
    for (var bi = 0; bi < srcBtns.length; bi++) {
      (function (sb) {
        sb.addEventListener('click', function () {
          try { window.JY_WAITE_PURE = (sb.getAttribute('data-src') === 'waite'); } catch (e) {}
          render(tool, el);
        });
      })(srcBtns[bi]);
    }

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
