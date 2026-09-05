/*! prompt-export.js — 靜月之光塔羅／開鑰提示詞匯出引擎 [v103.0]
 *  v103.0（知識開放提示詞 2026/9/4）：保留原生牌陣方法與 Book T 資料，開放 AI 自身塔羅知識，移除重複禁令、稽核與微管理。
 *  v98.0（單一 Foundation 根架構 2026/7/17）：
 *    1) 問題編譯、選陣、牌位權限、依賴拓撲與 Book T 有序尊貴線改由同一資料源生成，移除跨檔重複判斷。
 *    2) 「為何」依語法區分定性描述與原因追問；年度總覽、比較、二選一、已知關係、時序、多領域與未知人物事件各有獨立型別。
 *    3) 過去位只具先前影響權限，未來位只具後續趨勢權限；除非位置明示，不得升格為根因或最終結果。
 *    4) 曆年詞由占卜日期解析成明示範圍，並保留原始表面詞與解析錨。
 *  v96.0（Book T 根治版：來源、方法、量測與開鑰程序分層 2026/7/17）：
 *    1) 將 Book T 牌義／宮廷牌功能／元素尊貴，與後世牌陣位置及自訂依賴拓撲徹底分離；不再把凱爾特等布局冒充原典相鄰法。
 *    2) 元素尊貴只有在明示有序牌線且具左右兩側牌時才成立完整裁決；單側僅作局部背景，交叉牌只算互動力。
 *    3) 比較門檻題可由同一 QUERY_EVENT 的結果通道作定性裁決，但金額、比例、機率與日期仍須外部量測錨。
 *    4) 開鑰計數改為起始牌算第一張，線性向外配對；第一操作主線須由問卜者確認契合，未確認前只標示暫定有效。
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
  // v102：提示詞改為「方法資料包」；移除查詢圖、能力閘門與命題帳本對外輸出，讓 AI 依正確方法自行分析。

  var BAR = "────────────────────────────";

  var TPL = {
    // v86.26 拆除 TPL.ziwei 死碼：全站零呼叫者、formatZiweiData 從未定義（接線即 ReferenceError），
    //   且其規則停在舊版（無⑦年級限制/借星/身宮主軸）＝未來接錯線的陷阱。紫微提示詞唯一真相來源＝ziwei-standalone.js
    meihua: {
      label: '梅花易數',
      head: [
        '【任務】',
        '你是一位資深梅花易數占者。請運用你自身完整的易學、體用、生剋、旺衰、動爻、卦氣、類象與應期知識，綜合本次起卦資料，直接、深入且精準地回答問題。',
        '',
        '【判讀方法】',
        '以本卦與體用定主調、旺衰定力度、動爻定觸發層，將本卦、互卦、動爻與變卦串成現況、過程、變化和結果；錯綜、卦辭與八卦類象可補充另一視角。',
        '訊號衝突時給出主判、牽制與會使結果改變的條件。題目問時間時，再結合用近、互中、變遠、五行卦氣及資料內應期。',
        '',
        '【輸出】',
        '使用繁體中文。第一句直接回答原問句，再依「關鍵卦理、發展與轉折、時機、可行建議與驗證」自然展開；重要判斷引用具體卦象資料。'
      ].join('\n'),
      dataHeader: "九、以下是前端已起好的梅花易數卦盤資料",
      tail: "請依以上卦盤與你自身的梅花易數知識完成綜合解讀，直接回答問題，說清本互變、動爻、體用旺衰、類象、時機與可行方向。"
    },
    tarot: {
      label: '塔羅快讀',
      head: [
        '【任務】',
        '你是一位資深塔羅讀牌者。請運用你自身完整的塔羅知識，綜合本次問題、牌位／序列、牌面、牌組互動、元素尊貴與全盤結構，直接、深入且精準地解讀。',
        '',
        '【牌義與方法】',
        '本次資料以 Hermetic Order of the Golden Dawn《Book T／Liber T》為主要牌義與占星、卡巴拉對應來源；你可運用自身可靠的塔羅與牌陣知識補充；圖像描述須來自本次實際牌圖。若參照其他體系，請標明差異，不把 Rider-Waite 固定正逆位牌義覆蓋本盤的 Book T 元素尊貴。',
        '',
        '先辨認本次方法屬於獨立牌位、三牌組、連續牌列、宮位／質點、軸線、分支或配對，再依資料區明示的原生順序綜合。位置名稱有語義時按位置讀；序列索引沒有獨立牌位意義時，只在整列前後文與原法配對中成義。',
        '元素尊貴以資料明示的真正有序相鄰線為主；其他配對、因果、對照、軸線與分支依各自語義整合。一般牌陣正向展示，牌的順暢、受阻或扭曲由牌本性、位置、相鄰牌與全盤共同判斷。',
        '',
        '【輸出】',
        '使用繁體中文。第一句直接回答原問句，再說清主判、關鍵牌組、不同訊號的支持或牽制、可能發展、時機與可行方向；重要判斷附具體牌名，避免逐張抄義。'
      ].join('\n'),
      dataHeader: '十、以下是排好的牌陣資料',
      tail: '請直接依上方「本次方法資料」與本盤牌面完成解讀。方法資料是閱讀上下文，不是預先寫好的答案；請自行綜合 Book T 牌義、牌位／序列、真正相鄰元素尊貴與全盤結構，回答原問句。'
    },
    ootk: {
      label: '開鑰之法',
      head: [
        '【任務】',
        '你是一位熟悉 Golden Dawn Opening of the Key 的資深塔羅讀牌者。請運用你自身完整的 Book T、計數、配對與元素尊貴知識，綜合本次實際完成的五次操作，直接、深入且精準地回答問題。',
        '',
        '【解讀方法】',
        '開鑰之法是五次相互承接的獨立操作。先讀每次操作的代表牌落點、計數故事、配對故事與元素尊貴，再依第一次至第五次的階段功能整合；若程序中止，就分析實際完成的部分與其意義。',
        '',
        '【輸出】',
        '使用繁體中文。第一句直接回答原問句，再依操作階段說清主線、支持、反證、發展、條件、行動與可驗證訊號；避免逐步抄錄所有牌。'
      ].join('\n'),
      dataHeader: '六、以下是排好的五次操作資料',
      tail: '請依資料區實際完成的 Opening of the Key 操作與你自身的 Golden Dawn 知識完成綜合解讀。'
    }
  };

  // ═══ v74 牌陣讀法動態注入 ═══
  // 原本 12 種全塞 head (~800 tok)，改為依當次牌陣只注入對應的 1 種 (~100 tok)。
  // 省 ~700 tok/call，Opus 4.7 $5/M input 下有意義。
  var SPREAD_METHODS = {
      "_default": "依前端提供的牌位、順序、相鄰、對照、軸線或分支，將每張牌放回整體結構解讀。",
      "three_card": "三牌陣：先依各牌位功能成句，再讀1↔2、2↔3與1→2→3的整體流向；牌位名稱決定它是時間、原因、現況、結果或其他作用。",
      "five_card": "五牌陣：以現況為中心，串聯原因、阻礙、建議與結果，說明前四張如何共同導向收束。",
      "cross": "十字牌陣：先讀核心與阻礙的拉扯，再串聯過去影響、後續發展與可介入建議。",
      "either_or": "二選一牌陣：第1張是需求與共同基準；A路1→2→4、B路1→3→5，使用一致標準比較發展、代價、風險與落點。",
      "timeline": "時間線牌陣：依根源→近期狀態→轉折→轉折後發展→收束串成連續事件鏈；牌位表示相對先後，日期精度另看本盤時間資料。",
      "relationship": "關係牌陣：綜合你、對方／對方作用、關係現況、挑戰、介入點與短期走向，分析雙方如何共同形成目前結構。",
      "celtic_cross": "凱爾特十字：以1現況與2交叉力量為核心，對照3可成形／4根基、5身後／6身前、7本人／8環境、9希望恐懼，最後綜合至10結果。",
      "tree_of_life": "生命之樹：讀每個質點功能、右柱擴張、左柱界定、中柱整合，以及Kether→Tiphareth→Yesod→Malkuth由源頭到落地的主軸與三組橫向配對。",
      "zodiac": "黃道十二宮：每張牌先在所屬宮位成義，再看題目相關宮位、對宮、角續果節奏及第13張全盤主旋律。",
      "minor_arcana": "小阿卡那專題：依現狀→原因→挑戰建立機制，再把周圍人物、本人資源、建議與結果串聯；聚焦日常互動、資源與流程。",
      "fifteen_card": "十五張英式布局：讀五個三牌組——2–1–3核心、4–8–12自然發展、13–9–5替代路徑、6–10–14決策依據、7–11–15外在條件，再比較五組如何互相改寫。",
      "mathers_21": "二十一張Mathers衍生布局：三排從代表牌一側由右往左讀成連續故事，再讀1↔21至10↔12的首尾配對，以第11張作中心校正。",
      "mathers_horseshoe": "Mathers完整馬蹄布局：A組26張、C組17張與E組11張各自依原順序成句、首尾配對並處理中心，再比較後組如何補充或修正前組；F組為未解讀餘牌。",
      "horseshoe": "七張馬蹄形：串聯過去、現在、隱藏影響、建議、他人／環境、阻礙與結果，說明各位置如何共同形成走向。"
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
    if (/多少錢|多少(?:薪水|收入|成本|獲利|營收)|(?:薪水|收入|成本|獲利|營收)(?:是多少|有多少|多少|金額)|具體(?:金額|數字|數值)|金額|價位|百分比|幾成|機率/.test(x)) add('quantity','數值／程度');
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

  // v102：查詢編譯只留在程式端做輸入整理，不再輸出給 AI，也不指揮解牌。
  function buildEvidenceCapabilityBlock() { return ''; }


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


  function buildSpreadReadingGuide(tool, rawPayload) {
    var obj=rawPayload||{};
    var td=obj.tarotData||{};
    var spreadId=tool==='ootk'?'ootk':(td.spreadType||obj.spreadId||_getSpreadId());
    var foundation=(typeof window!=='undefined'&&window.JYTarotFoundation)?window.JYTarotFoundation:null;
    var plan=obj.methodPlan||td.methodPlan||null;
    var protocol=(plan&&plan.protocol)||((foundation&&typeof foundation.getMethodProtocol==='function')?foundation.getMethodProtocol(spreadId):null);
    var cards=td.cards||obj.cards||[];
    var slots=(plan&&plan.slots)||[];
    var lines=[BAR,'◆ 本次方法資料（提供閱讀上下文，不替 AI 預判答案）',BAR];

    function cardName(index){var c=cards[index]||{};return c.name||c.cardName||('第'+(index+1)+'張');}
    function slotLabel(index){var c=cards[index]||{},slot=slots[index]||{};return slot.label||c.positionMeaning||c.position||('位置'+(index+1));}
    function cardRef(i){return '第'+(i+1)+'張「'+cardName(i)+'」';}
    function seq(indices){return (indices||[]).map(cardRef).join(' → ');}
    function members(indices){return (indices||[]).map(cardRef).join('、');}
    function pairSummary(pairs){
      if(!pairs||!pairs.length)return '';
      if(pairs.length<=5)return pairs.map(function(pair){return cardRef(pair[0])+' ↔ '+cardRef(pair[1]);}).join('；');
      var first=pairs[0],last=pairs[pairs.length-1];
      return cardRef(first[0])+' ↔ '+cardRef(first[1])+'，依序至 '+cardRef(last[0])+' ↔ '+cardRef(last[1]);
    }
    function endpoint(v){
      if(Array.isArray(v))return v.map(cardRef).join('＋');
      return cardRef(v);
    }

    if(!protocol){
      lines.push('前端未提供此方法手冊，請依已明示的牌位、序列與你自身對該牌陣的可靠知識解讀；不確定處請標明。');
      return lines.join('\n');
    }

    lines.push('方法：'+spreadId+'｜類型：'+protocol.kind+'｜單張性質：'+protocol.slotMode+'。');
    if(protocol.sourceNote)lines.push('來源定位：'+protocol.sourceNote+'。');
    lines.push('方法摘要：'+protocol.summary);
    lines.push('閱讀順序：'+(protocol.phases||[]).join(' → ')+'。');

    if(tool==='tarot'){
      lines.push('');
      if(protocol.slotMode==='semantic_position'||protocol.slotMode==='qabalistic_position'||protocol.slotMode==='domain_position'){
        lines.push('牌位與實際牌：');
        cards.forEach(function(card,i){lines.push('・'+cardRef(i)+'｜'+slotLabel(i));});
      }else if(protocol.slotMode==='triad_member'){
        lines.push('單張性質：本盤牌是三牌組成員，主要在組內互相定義。');
      }else if(protocol.slotMode==='sequence_member'){
        lines.push('單張性質：本盤牌是有序牌列成員，序號表示順序與配對。');
      }

      if(protocol.structures&&protocol.structures.length){
        lines.push('');
        lines.push('原生結構：');
        protocol.structures.forEach(function(st){
          var detail='';
          if(st.type==='semantic_pairing') detail=pairSummary(st.pairs);
          else if(st.type==='dependency_network'||st.type==='dyad'||st.type==='cross'||st.type==='synthesis'||st.type==='house_wheel') detail=members(st.indices);
          else if(st.indices&&st.indices.length) detail=seq(st.indices);
          lines.push('・'+st.label+'〔'+st.type+'〕'+(detail?'：'+detail:'')+'。'+(st.instruction||''));
          (st.links||[]).forEach(function(link){
            lines.push('　關係：'+endpoint(link.from)+(link.bidirectional?' ↔ ':' → ')+endpoint(link.to)+'｜'+link.relation+'。');
          });
        });
      }

      if(plan&&Array.isArray(plan.dignityLines)&&plan.dignityLines.length){
        lines.push('');
        lines.push('真正有序相鄰線（用於完整元素尊貴）：');
        plan.dignityLines.forEach(function(path,i){lines.push('・相鄰線'+(i+1)+'：'+seq(path));});
      }else{
        lines.push('真正有序相鄰線：本方法資料未聲明，可依牌陣原法判斷並標示依據。');
      }
      if(plan&&Array.isArray(plan.compatibilityEdges)&&plan.compatibilityEdges.length){
        lines.push('其他語義互動：');
        plan.compatibilityEdges.forEach(function(edge){lines.push('・'+members(edge));});
      }
    }else{
      lines.push('程序單位：每次操作各自包含落點、計數故事、配對故事與元素尊貴；若程序中止，整合已完成的部分。');
    }

    lines.push('');
    lines.push('綜合提示：依上述原生結構形成主判，遇到矛盾時比較整體支持與替代解讀；時間精度以牌位及本盤實際時間資料為準。');
    return lines.join('\n');
  }


  // 圖像與 Book T 對應可相互補充，資料來源不同時清楚標示視角。
  function getImageryReq() {
    return '可結合本次牌圖中的人物、方向、場景與象徵作補充，並與 Golden Dawn Book T 的牌義、占星對應和元素尊貴交叉分析；兩者不同時請標明視角。';
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
      '◆ 原問句',
      BAR,
      '原問句：' + question,
      '完整回答原問句中的對象、事件、條件、比較、期限與各子題，開頭先給核心結論。',
      '可運用你自身的塔羅與日常語義知識理解問題；具體程度與時間精度請和牌面、牌位及資料支持相稱。'
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
  // 精簡的不確定性提示：完整分析已知資料，並讓精度與證據相稱。
  var FRAG_UNCERTAINTY_TAROT = "\n【把握度】\n綜合牌位、牌義、相鄰互動、全盤結構與反證後再判斷；訊號不足時仍回答可判部分，並說明哪個條件尚不明確。\n";
  var FRAG_UNCERTAINTY_OOTK = "\n【把握度】\n綜合實際完成操作的落點、計數、配對、元素尊貴與階段發展；資料中止或訊號分歧時，分層說明可判部分。\n";
  var FRAG_UNCERTAINTY_MEIHUA =
    '\n【把握度】\n綜合本卦、互卦、變卦、動爻、體用與旺衰後判斷；訊號分歧時說明主判、牽制與轉變條件。\n';
  var FRAG_SOURCELOCK_MEIHUA =
    '\n【知識運用】\n請運用你自身完整的梅花易數知識，並以本次實際卦盤作個案依據；區分傳統卦理、類象推論與現實建議。\n';
  var FRAG_RECENCY_MEIHUA =
    '\n' + BAR + '\n完成前確認\n' + BAR +
    '\n答案已直接回應問題，關鍵判斷能回到本互變、動爻、體用旺衰或類象，且時間精度與本次資料相稱。\n';

  // ② 學理鎖定：擋掉網紅/心理學/雞湯，逼回正統
  var FRAG_SOURCELOCK = "\n【知識運用】\n本次資料以 Golden Dawn《Book T／Liber T》為主要技術底稿；可運用你自身可靠的塔羅知識補充，若不同體系的牌義或方法有差異，請清楚標明。\n";
  var FRAG_SOURCELOCK_TAROT = FRAG_SOURCELOCK;
  var FRAG_SOURCELOCK_TAROT_WAITE = FRAG_SOURCELOCK;
  // ③ 交稿前 recency 檢查：模型最常在後半段破功，放最後一段（recency 最強）
  function buildRecencyTarot() {
    return [
      '', BAR, '完成前確認', BAR,
      '答案已直接回應問題，關鍵判斷能回到本盤實際牌、牌位、牌組或方法結構，且具體程度與時間精度和資料相稱。'
    ].join('\n');
  }
  var FRAG_RECENCY_OOTK = [
    '',
    BAR,
    '完成前確認',
    BAR,
    '答案已直接回應問題，並以實際完成操作的落點、計數、配對、元素尊貴與階段發展支撐主判。'
  ].join('\n');


  // ④ 收尾能量石（v73.1 歐那）：把賣場自然融進解讀結論，不是廣告區塊。
  //    元素一律綁「牌面」（火水風土＝權杖聖杯聖杯寶劍金幣／開鑰 Op1 YHVH 堆），
  //    不碰八字五行命盤——故塔羅與開鑰共用，且不破壞開鑰「不引命盤」的純粹性。
  //    放在交稿核對之後，作為提示詞最後的輸出格式約束，確保賣場連結獨立收尾。
  // v84_audit5(2026/6/10)：防線統一——輸出要求補盤外資訊禁令＋指令回聲禁令、FRAG_CRYSTAL 補嚴禁並列（六系統同步）
  var FRAG_TAROT_INVENTORY = [
    '',
    '【延伸選品】',
    '正文完成後，從資料區【可推薦庫存品項】選一項，以一至兩句將本盤的實際提醒連到日常配戴情境；若沒有候選就寫「推薦品項：無可用庫存品項」。選品是生活延伸，不作為占卜證據或結果保證。',
    '',
    '延伸選品',
    '',
    '<一至兩句自然文案>',
    '',
    '推薦品項：<品項全名>',
    '',
    '[前往靜月之光蝦皮賣場](https://shopee.tw/a50h95648d?tab=shop)'
  ].join('\n');


  // ④b 紫微專用能量石（v85 歐那 2026/6/11）：根治紫微被注入塔羅版規則的錯位——
  //    紫微資料區沒有「花色分布」，舊版會逼 AI 對不存在的數據瞎掰。
  //    紫微選石只綁「這次問題＋結論」，不冒充紫微原典、不碰命盤五行喜忌（命盤喜忌屬八字層，避免兩套系統打架）。
  var FRAG_CRYSTAL_ZIWEI =
    '\n【延伸選品】\n正文完成後，可運用你自身可靠的礦物與配飾知識，依本題的生活情境自然推薦一種礦物／飾品材料，定位為象徵提醒、收藏或穿搭，不作為紫微判斷依據或結果保證。最後保留賣場連結與祝福語。\n';

  // ⑥ 通用溯源鐵律（v85.5 歐那 2026/6/11）：根治「無出處具體數字」整類病——
  //   時間天數(v84前)、機率百分比(v85.4)、金額、年齡都是同一類：AI 為顯精準而編造盤面推不出的數字。
  //   逐題型補規則永遠補不完；改立通用原則罩住整個類別，題型專屬規則只保留「怎麼推」的方法細節。
  var FRAG_TRACE =
    '\n【具體性】\n重要結論、數字、時間與人物描述請連回本盤的牌、牌位或資料；若只能判斷趨勢，就用相應的範圍與把握度表達。\n';

  // ⑤ 輸出載體（v85 歐那 2026/6/11）：根治外部 AI 介面把解讀包進文件/畫布容器，
  //    導致第一句在容器外重複出現、結尾網址掉到容器外並黏上不可見字元（U+2060/亂碼）連結失效。
  //    所有工具共用，注入在 recency 檢查之前。
  var FRAG_PLAINTEXT =
    '\n【輸出載體】\n直接輸出一則完整解讀即可，不使用程式碼區塊或額外文件容器。\n';

  // ── 組裝「本次問題鎖定」區塊（放在提示詞最前面，primacy 最強）──
  //    ★ v70.4(歐那 2026/5/29)：分工具。塔羅快讀＝yes/no 直答導向；
  //      開鑰之法＝深度拆解導向（絕不能用塔羅的「給是非、禁止擴寫」框架，那會直接掐死開鑰的五層拆解本質）。
  function buildFocusLock(q, tool) {
    var f = detectFocus(q);
    var L = [BAR, '◆ 本次問題', BAR];
    if (f.noQ) {
      L.push('問卜者未填明確問題，請依本次盤面給出整體主題、發展、提醒與可採取方向。');
      return L.join('\n') + '\n';
    }
    L.push('原問句：' + f.raw);
    L.push('請保留問題中的對象、事件、條件、比較、期限與各子題，開頭先回答核心問題。');
    if (tool === 'meihua') {
      L.push('用本卦、互卦、變卦、動爻、體用旺衰與類象說明判斷。');
      return L.join('\n') + '\n';
    }
    if (tool === 'ootk') {
      L.push('綜合實際完成的操作，依序呈現當下、發展、進一步發展、接近結果與收束。');
    } else {
      if (f.yesno) L.push('是非題請先給明確傾向，再說成立條件與反證。');
      if (f.decision) L.push('比較題請用一致標準分析各選項的助力、代價與走向。');
      if (f.prob) L.push('機率題以相對強弱與把握度表達，除非本盤另有可靠數值依據。');
      if (f.timing) L.push('時間題請說明相對先後、快慢、窗口及觸發條件；日期精度以本盤資料為準。');
      if (f.portrait) L.push('人物題請綜合相關牌位、宮廷牌、牌組與全盤關係，並提示可觀察特徵。');
      if (f.overview) L.push('全景題請呈現本盤真正突出的生活領域與主次脈絡。');
    }
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
    L.push('前端衍生摘要（供交叉參考，請以原始卦盤與你自身判讀為主）：');
    if (mh.shortVerdict) L.push('・短判：' + mh.shortVerdict);
    if (mh.summary) L.push('・摘要：' + mh.summary);
    if (mh.decisionHint) L.push('・行動提示：' + mh.decisionHint);
    if (mh.timing) L.push('・時間節奏：' + safeText(mh.timing));
    // v86.12 正統應期（《占卦訣》：事應於生體卦氣之日、敗於剋體卦氣之日）——由 meihua_output_layer.js v2 buildMeihuaYingQi 提供
    if (mh.yingQi && mh.yingQi.jiTxt) {
      L.push('・應期候選（依 precision 判斷可說到相對層次、卦氣候選或日曆時間）：');
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
    L.push('主要資料來源：Golden Dawn《Book T／Liber T》〔gd_book_t〕；可用你自身可靠的塔羅知識交叉補充並標明體系差異。');
    L.push('牌面方向：一般牌陣正向展示；元素尊貴以明示有序連續線為主，其他連線依其牌陣語義解讀。');
    L.push('');
    L.push('抽到的牌：');
    var methodPlan=td.methodPlan||null;
    cards.forEach(function(c,i){
      var slot=(methodPlan&&methodPlan.slots&&methodPlan.slots[i])||{};
      var pos = slot.label || c.positionMeaning || c.position || ('位置'+(i+1));
      var unitNote='';
      if(slot.slotKind==='sequence_member') unitNote='〔序列成員；無獨立牌位權限〕';
      else if(slot.slotKind==='triad_member') unitNote='〔三牌組成員；須在組內成義〕';
      var line = (i+1)+'. '+pos+unitNote+'：'+(c.name||'?');
      if (c.bookTTitle) line += '〔'+c.bookTTitle+'〕';
      if (c.element) line += '｜元素：'+c.element;
      if (c.sephirah || c.world) line += '｜卡巴拉：'+[c.sephirah,c.world].filter(Boolean).join('／');
      if (c.correspondence) line += '｜對應：'+c.correspondence;
      line += '｜Book T原典核心義：'+(c.sourceCore||c.baseMeaning||c.sourceGloss||'依位置與有序相鄰牌裁決');
      if (c.elementalDignity) {
        var d=c.elementalDignity;
        line += '｜元素尊貴：'+(d.state||'mixed')+(d.reading?'；本位讀法：'+d.reading:'');
      }
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
      if(dgLines.length)L.push('【Book T有序相鄰線元素尊貴】'+dgLines.join('；'));
    }
    if (td.treePillars) L.push('【生命之樹牌陣結構】'+safeText(td.treePillars));
    var qTime=/什麼時候|何時|幾時|多久|幾天|幾週|幾月|哪一年|時間/.test(getQuestion());
    if (qTime) {
      if (td.timeConclusion) L.push('【時間參考】'+safeText(td.timeConclusion)+'；請說明相對時序與可支持的精度。');
      else L.push('【時間參考】本次資料主要支持牌位所示的相對階段，精確曆日的把握度較低。');
    }
    var rec=(result&&result.shopRecommendation)||{};
    if(Array.isArray(rec.allowedItems)&&rec.allowedItems.length){
      L.push('【可推薦庫存品項】'+rec.allowedItems.join('、'));
      if(rec.sourceFile)L.push('【庫存來源】'+rec.sourceFile+'。');
    }else{
      L.push('【可推薦庫存品項】無');
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
    L.push('布局與主要程序來源：Golden Dawn《Book T／Liber T》Opening of the Key；請運用你自身可靠的 Golden Dawn 知識交叉分析。');
    L.push('代表牌：'+(sig.name||sig.n||safeText(sig)||'未提供'));
    if(od.predeclaredBindings)L.push('發牌前綁定：'+safeText(od.predeclaredBindings));
    if(od.procedureStatus){
      L.push('程序狀態：'+safeText(od.procedureStatus));
      if(od.procedureStatus.abandoned) L.push('程序於'+od.procedureStatus.abandonedAt+'停止，請整合此前已完成的操作。');
    }
    if(od.validityPolicy)L.push('程序規則：'+od.validityPolicy);
    if(od.divinationValidity)L.push('占卜有效性：'+safeText(od.divinationValidity));
    L.push('');
    var labels={op1:'第一次操作・當下情勢',op2:'第二次操作・問題發展',op3:'第三次操作・進一步發展',op4:'第四次操作・倒數階段（三十六牌環）',op5:'第五次操作・最終結果（生命之樹）'};
    function cn(c){return c?(c.name||c.n||'?'):'?';}
    ['op1','op2','op3','op4','op5'].forEach(function(k){
      var o=ops[k];if(!o)return;
      L.push('────────────────────────');
      L.push('【'+labels[k]+'】');
      if(o.abandoned)L.push('狀態：依Book T停止——'+(o.abandonReason||''));
      if(o.mainLineValidation)L.push('第一次操作主要線索確認：'+safeText(o.mainLineValidation));
      if(o.procedurePolicy)L.push('本次明示程序政策：'+o.procedurePolicy);
      if(o.activePile)L.push('代表牌落堆：'+o.activePile+(o.domainMeaning?'（'+o.domainMeaning+'）':''));
      if(o.activeHouse)L.push('代表牌落宮：第'+o.activeHouse+'宮'+(o.domainMeaning?'（'+o.domainMeaning+'）':''));
      if(o.activeSign)L.push('代表牌落星座堆：'+o.activeSign);
      if(o.activeSephirah)L.push('代表牌落生命樹：'+o.activeSephirah+(o.sephirahZh?'（'+o.sephirahZh+'）':'')+(o.sephirahMeaning?'——'+o.sephirahMeaning:''));
      if(o.ringSize)L.push('三十六牌環：'+o.ringSize+'張。');
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
    L.push('【計數說明】計數值用於導航牌序；現實時間與數量仍需其他牌面或資料支持。');
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
    var recency = tool === 'meihua' ? FRAG_RECENCY_MEIHUA : (tool === 'ootk' ? FRAG_RECENCY_OOTK : buildRecencyTarot());
    return [
      buildRootQuestionLock(question, tool),
      '先分清輸入的盤面事實、流派解釋與現實假設。可自由運用自身知識補充技法；若原始資料與摘要衝突，指出具體差異，以可核對的原始資料為先。結論要有支持、反向訊號與成立條件；象徵不等於事件證明，分數不等於成功機率。',
      '題目中的假設與已確認事實分開；例如問某人是否欺騙，先檢視支持與其他解釋，再提出可觀察的互動訊號。牌位、計數值和傳統對應不直接換算成中獎機率、精確年齡或日期。',
      t.head.replace('{{IMAGERY_REQ}}', (tool === 'tarot' ? getImageryReq() : '')),
      buildSpreadReadingGuide(tool, rawPayload),
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
      (tool === 'ziwei' ? FRAG_CRYSTAL_ZIWEI : ''),
      FRAG_TRACE,
      FRAG_PLAINTEXT,
      recency,
      (isRootTarot ? FRAG_TAROT_INVENTORY : '')
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
    ].join('\n');
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
