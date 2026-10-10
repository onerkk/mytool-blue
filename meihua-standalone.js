// BEGIN GENERATED WORKFLOW
/* Local answer planning and review. No network, random draws or chart mutation. */
(function installReadingWorkflow(root){
  'use strict';
  var VERSION='1.8.0';
  // Reinstallation is stateless and keeps direct CommonJS imports usable even
  // after an embedded standalone copy has populated the global API.
  var FOOTER='[靜月之光蝦皮賣場](https://shopee.tw/a50h95648d?tab=shop)\n願你諸事順遂。';
  var METHODS={
    tarot:{name:'塔羅',basis:'實際牌位、方向及相互作用',path:'結果與阻礙先定方向，原因和行動位解釋怎樣改變條件；非時間牌位保留原功能。'},
    ootk:{name:'開鑰之法',basis:'五個完成輪次、代表牌落域、實際計數、配對與元素尊貴',path:'每一有效輪次都先對原題新增一個具體判斷，再標出支持、反證與對前輪的修正；五輪完成後收斂最可能方向、次可能方向、最強反證、改判條件與信心。第三方角色歸屬不足時降低確定度，但不把可讀的關係場訊號一併寫成未知。'},
    lenormand:{name:'雷諾曼',basis:'完整主線、實際相鄰、已指定人物與合法幾何',path:'先由完整牌句形成答案，再由相鄰承接找干預點；鏡像只補充尚未解答的部分。'},
    bazi:{name:'八字',basis:'四柱、月令、藏透根氣、生剋通路及實算歲運',path:'分開格局條件與承受力，找切題阻點及救應，再說明運歲增減了哪些條件。'},
    compat:{name:'合盤',basis:'各自原局、雙向作用與共同時間區間',path:'先各自成判，再辨支持與衝突如何互動；將最關鍵卡點轉成雙方各需承擔的一項協議。'},
    ziwei:{name:'紫微斗數',basis:'主宮星組、三方四正、四化來源及限年座標',path:'主宮讀做法，三合讀資源，對宮讀牽動；分開本命與限年，解釋收益、成本及調節通道。'},
    meihua:{name:'梅花易數',basis:'原體、用、節令、本互變與實際動爻',path:'體用定當前承擔，互卦定過程關卡，變卦看調整後條件；據此回答進退和第一步。'},
    liuyao:{name:'六爻',basis:'問題用神、世應、月日、旬空月破與有效動變',path:'追蹤生扶或克制能否送達用神，與世應承擔分開；找成事或解阻必須滿足的條件。'},
    yijing:{name:'易經',basis:'本次主讀與參讀原文、動爻及擇辭政策',path:'從原文處境、行為與結果的因果回答進退，說清轉折條件，將古義落到本題行動。'},
    oracle:{name:'靈籤',basis:'有效籤系、完整原詩及可靠典故',path:'全詩定進退，轉折句定前提，說清在等什麼或改什麼；以可觀察條件落實。'},
    astro:{name:'西洋占星',basis:'本題宮主、落宮、相位兩端與實算行運',path:'從宮主的事件路徑辨資源與代價，再比較相關星體的需求及當期承接。'},
    vedic:{name:'印度占星',basis:'D1宮主、有效分盤、尊貴受照與實算運期',path:'D1先成判，專題分盤查承接，大副運定位當期條件；相反訊號按各自層級取捨。'},
    name:{name:'姓名學',basis:'字形筆畫來源、字義讀音與同體系五格三才',path:'依實際用途比較名字的使用得失，數理象義與字義讀音分開，說清保留或調整哪個字。'},
    liuren:{name:'大六壬',basis:'天地盤、四課三傳、天將六親旬空、64課族與290具名神煞及實際年命',path:'干支兩端先辨人事，沿初中末傳追生克及空破能否承接；由實際命中找支持、阻點和可介入條件，不從課名直接斷事件。'},
    personality:{name:'人格',basis:'原始四柱與十神通路、模型摘要和本人經驗',path:'由有力結構提出行為假設，分長處與負荷代價，給可用實際經驗驗證的小練習。'}
  };
  var GOALS={
    help:{name:'做法／幫助',opening:'第一段直接給最值得先做的具體行動，以及為什麼先做；把開口方式或第一步說出來。',body:'後續各段說明：你可調整哪一環、對方或環境需配合什麼、什麼反應表示有效。'},
    compare:{name:'比較／決策',opening:'第一段依本題重點選出較支持的方案及代價；證據不能分高下時，明說決勝條件。',body:'用同一標準比較各方案，區分短期收益、持續成本與成立條件；保留原選項。'},
    timing:{name:'時機／發展',opening:'第一段先說可判的時間範圍與發展方向，或目前欠缺的必要條件。',body:'分開原局條件、當前觸發和可觀察進展；盤上時間分界與現實事件日期分開。'},
    enumeration:{name:'開放列舉／注意事項',opening:'第一段先回答原句要你列出的類別或注意事項，指出本方法能支持到哪一層。',body:'按盤面整理少數有依據的項目與它們的先後／作用；逐項說明實際含義、最大的限制和核實方式。只有原句另有明確的是非門檻時才附上是非判斷；資料不支持的精確項目直說缺口並給可行的查核步驟。'},
    explain:{name:'原因／結構',opening:'第一段直接點出最有依據的核心卡點及它如何影響原問題。',body:'追出支持如何傳到結果、哪一環被牽制、牽制如何形成或解除；把最強反證放回它實際限制的層次，並指出會改判的條件。'},
    direction:{name:'傾向／是否',opening:'第一段回答較支持的方向、程度及主要條件；能判傾向就不平均羅列所有可能。',body:'區分注意、意願、行動、承諾和持續的證據；不同層面不能互相代答。'},
    general:{name:'整體／開放題',opening:'第一段先整理本題最有影響的主軸與優先順序，讓使用者知道現在重點在哪。',body:'圍繞原問句展開，各子題先回答；全盤供判斷，只引用改變答案的關係。'}
  };
  function kinds(input){
    var a=Array.isArray(input)?input:[input||'tarot'];
    return Array.from(new Set(a.map(function(k){return k==='western'?'astro':k==='chart'?'bazi':k;}))).filter(function(k){return !!METHODS[k];});
  }
  function numeral(value){
    var s=String(value||'').replace(/兩/g,'二');if(/^\d+$/.test(s))return Number(s);
    var digits={零:0,一:1,二:2,三:3,四:4,五:5,六:6,七:7,八:8,九:9};
    if(s==='十')return 10;if(s.indexOf('十')>=0){var a=s.split('十');return (a[0]?digits[a[0]]:1)*10+(a[1]?digits[a[1]]:0);}return digits[s];
  }
  function reportScope(question,method){
    var q=String(question||'').trim().replace(/个/g,'個'),p=q.match(/(?:前|頭|最初)\s*([一二兩三四五六七八九十\d]+)\s*(?:個|段|組)?\s*(?:大限|大運)/),n=p?numeral(p[1]):null;
    var full=!q||/(?:全盤|全命盤|整張命盤|整體命盤|完整(?:的)?(?:命盤|星盤|牌陣|卦例|解籤)|十二宮|所有面向|所有領域|各個方面|各方面|一生運勢|終身運勢|全生涯)/.test(q)||/(?:全面|完整).{0,6}(?:命盤|星盤|牌陣|卦例|籤詩|全盤)/.test(q);
    var annual=/(?:每一?年|逐年|(?:所有|全部).{0,8}流年|各流年|所有年度|各年度|年度分析|年度逐項)/.test(q);
    return {mode:full?'full':annual||p?'timeline':'focused',fullChart:full,annualRequested:annual,monthlyRequested:/(?:流月|逐月|每月|各月)/.test(q),requestedDecades:Number.isInteger(n)&&n>0?n:null,
      allDecades:!n&&/(?:所有|全部|每步|每個|逐一|各個)\s*(?:大限|大運)|(?:分析|解讀|詳解|請看).{0,8}(?:十二|12)\s*(?:個|段)?\s*大限/.test(q),method:method==='western'?'astro':method||null,
      policy:'範圍來自原問句；資料仍須實算，深度字樣不自動擴成全盤或逐年題。'};
  }
  // BEGIN GENERATED WORKFLOW METHOD GUIDES
  var METHOD_GUIDES = {
  "tarot": [
    "【塔羅：牌位與組合】按本次原生牌陣判讀；獨立牌位、三牌組、連續牌列、分支、軸線與配對保留各自功能，不互換成固定時間線。",
    "RWS 使用實際正逆位及牌圖；Book T 使用本次對應與真正有序相鄰的元素尊貴，不混套固定逆位。逆位依位置和全局判受阻、內化、過度或鬆動，並非一律相反。",
    "全盤先形成主線，再找最能回答子題的牌位關係。結果與原因、阻礙、建議合讀；建議說明如何介入，不等於事情已發生。",
    "牌的本義由位置和組合限定；花色、元素與重複圖像只作背景，同一牌在多個關係出現不增加獨立證據。",
    "正文以關鍵組合承接答案，點出涉及的牌名、實際方向及位置即可；全盤檢視不等於每張都要各寫一段。",
    "把阻礙牌如何限制結果、建議牌如何改變條件連起來。若問題問能否發生事件，情緒牌只能支持感受層面，還須找行動與結果位置；不能用『有好感』替代『會主動交往』。有利牌與不利牌先判在說哪個層面，不以張數相抵。",
    "【塔羅判讀主線】先把結果／方向位與最直接的阻礙位合成一句答案，再用原因、當事人行動與環境牌追溯成因。若結果有利而行動不足，主判是具備條件但尚待落實；若意願有而承擔位受阻，回答卡在執行或現實門檻。由實際牌位區分是哪一層受阻，讓建議牌成為改變這一層的方法。",
    "對比方案時，各沿自己的投入、代價、發展及結果位完成一條路徑，再用原問題最在意的標準比較。矛盾牌先核先後、內外與人物歸屬：同一件事可能短期吸引、長期昂貴；說清你較支持哪一段選擇，以及哪個現實條件出現時應改判。",
    "【塔羅深入合讀】逐一核對全部實際牌位職責與正逆方向，形成完整牌陣的發展結構；需求、可採行動、環境、結果和阻礙各自成義，再串成結果能否落實的路徑。單張本義不能取代相鄰關係、核心牌與不同支線的共同作用。",
    "主線與子題逐一成判，區分情緒、意願、實際行動與持續；人物牌不自行指認身分。逆位綜合牌面、位置與全局，分辨內化、受阻、過度或鬆動，不能一律翻成相反。",
    "時間與影響程度來自實際時間位及發展順序；只有序列時給相對階段，不自造月份。每個關鍵轉折連同成立條件、支持牌位、最強反證及可採行動說明。"
  ],
  "ootk": [
    "【開鑰之法：依實際版本與完成紀錄】Mathers 原稿五次操作與 Liber LXXVIII 驗題版分開；Ace 計數、配對、第四輪起點及停止條件依本次版本，不互套。",
    "五次操作不是五個月份，而是五層閱讀。每一個完成且有效的操作都必須對原問題新增一個可辨識的判斷：先讀該輪代表牌落域，再讀合法計數故事、配對與元素尊貴，說明本輪最支持什麼、最強反證限制哪一層，以及它如何承接、修正或推翻上一輪。不得只列牌義或把五輪壓成一句總結。",
    "計數跳轉不當成元素相鄰；元素尊貴只用提供的有序相鄰線。配對、計數與落域若方向不同，先分辨它們是否在回答不同層次，例如注意／吸引、意願、行動、承諾、持續或結果，再判哪一層真正受阻。",
    "第一輪 mainLineValidation 未確認時，第一輪只能降為次級背景，不得拿來當高權重核心；第二至第五輪若已完成且有效仍須正常解讀，不能因此把整盤降成『無法回答』。",
    "問第三方怎麼看、是否喜歡、是否願意等主觀題時，沒有明確第三方代表牌綁定就不能寫成已證實內心；但『不能證實』不等於『不能判方向』。必須把五輪收斂成最可能的方向性模型：可歸屬的訊號寫成較支持的推論，無法歸屬者標成關係場／互動場訊號，並說清哪個現實條件可驗證或推翻。",
    "五輪完成後必須明確輸出：最可能方向、次可能方向、最強反證、會推翻主判的條件與信心來源。不能只說『存在情感／衝突／吸引議題』而不交代方向、程度與作用層次，也不能把未知角色歸屬擴大成整盤未知。",
    "只在紀錄明示中止、無效或資料損壞時停止；未完成操作不補成五輪結論。正文要把五層真正用來回答原題，不逐步重抄每次計數與配對。",
    "【開鑰判讀主線】五輪不是把同一句答案重講五次。第一輪建立當下基底，第二輪讀事情怎麼展開與互動，第三輪讀更深的結構門檻與承接條件，第四輪用三十六牌環抓累積張力與真正轉折，第五輪收束最終傾向與保留條件；仍以各輪實際落域為準，不把這些名稱硬套成固定事件。每輪都要回答「這一層讓原題多知道了什麼」。",
    "每輪先形成一個明確主判，再各找最強支持與最強反證，並寫出它對上一輪是延續、加強、削弱、轉向還是只補充另一層。重現牌只代表持續主題，不重複加票；真正轉折須由落域、計數、配對或元素尊貴的作用改變支持。",
    "五輪收斂時，不以「象徵不能證明事實」作為答案終點。先說盤面最支持哪個方向、程度到哪一層，再給次可能解釋與最強反證；第三方角色歸屬不足時降低歸屬信心，但保留關係場／互動場的方向性資訊。最後指出什麼現實行為或條件出現時應改判。",
    "【開鑰之法深入合參】按本次完成輪次逐輪讀代表牌落域、合法計數故事、配對及元素尊貴；每一輪都必須對原題新增一個不同層次的主判，再追各輪如何承接或改變條件。不能把尚未完成的操作補成結果，也不能把所有計數牌當成相鄰。",
    "逐輪至少交代：本輪最支持的方向、本輪最強反證／限制、它限制的是注意／感受／意願／行動／承諾／持續／結果中的哪一層，以及本輪對上一輪造成何種修正。若某輪只能讀關係場而不能歸屬到特定第三方，照樣保留該層資訊，不用『未知』把整輪刪掉。",
    "跨輪相反時先辨領域、角色、條件是否相同；同一命題仍衝突才保留未決部分。第一輪主線未確認時降權但不封鎖後四輪。全程核對停止紀錄、實際操作與牌組來源，重複牌只保留作用，不重複加權。",
    "完整五輪最後要形成一個資訊密度足夠的收斂：最可能方向、次可能方向、最強反證、成立條件、改判條件、信心來源與現實驗證點。『無法證實他人心意』只能作事實宣稱邊界，不能取代上述方向性判讀。五輪不硬配五個月；人物身分、事件次數及日期仍須有本法真實支持。"
  ],
  "lenormand": [
    "【雷諾曼：完整牌句】依原問題→相鄰牌→完整長線→實際位置選主義；相鄰 A→B 是主題與修飾的關係，加入C後重讀全句。中間牌要有實際功能，末牌與全線共同定落點；這些是判讀方法，正文直接說牌句在本題的意思。",
    "短線先讀相鄰組合再讀完整牌句。九宮格以中心及最切題的穿越線形成主判，外框、外圍線及鏡像只有提供新資訊時才補充。",
    "大牌陣先讀人物／主題近域與落宮，再延伸實際長線、距離、方向、鏡像及騎士步。遠距技巧不憑數量壓過近域主線，重複節點只算同一訊號。",
    "人物須有角色依據；月亮、蛇、狐狸等取義由組合限定，不由單牌認定第三者、職業、欺騙或私密事實。共同九宮格沒有獨立的人物支線時，只回答共同走向及個別未定部分。",
    "牌句最後要落到本題中的事、阻力與條件；同樣的魚、錨等符號在收入題與感情題不可照貼同一套文案。相鄰修飾是可採讀法，不把名詞加形容詞當唯一文法；先核全線語義是否連貫及是否遺漏轉折牌。",
    "【雷諾曼判讀主線】先把主題牌與相鄰牌組成一個具體生活句，再讓後續牌修改事情的方式、阻力和落點。以「誰的什麼事、透過什麼途徑、遇到哪個轉折」完成整條牌句；例如同一阻礙牌在開端可能限制起步，在收尾則可能限制完成，須由實際次序決定。",
    "九宮或大牌陣從本題人物／主題的核心線建立主判，再用落宮、近域與穿越線查原因及可用資源。兩方各有定位時分別說明靠近、投入與距離的條件；多條路線相反時，指出是各自立場不同、不同領域有代價，或主題仍被同一關鍵因素卡住。",
    "【雷諾曼深入牌句】讀完全部切題相鄰牌句和長線，保留中心、起訖與方向，辨人物近域、問題主線及方案分支的共同作用；牌的含義由句法與角色限定，不能挑幾張吉凶牌取代整條牌句。",
    "大牌陣依實際落宮和幾何讀近遠、行列及已採鏡像，分清人物、領域與環境；未指定人物不補指認，合法配對不可冒充相鄰。",
    "全盤逐重要區域及已知人物整理支持、阻力與發展；單題將相關牌組合成主判。時間只依實際牌陣及明列口徑，牌號或距離不自行換成確切天數。"
  ],
  "bazi": [
    "【八字：原局作用與歲運】核四柱、月令、藏透、根氣及曆法政策；月令取格後審成敗救應，身的承受力與格局成立分開。食神制殺、殺印相生等須有實際力量、位置和通路，不由名稱並存判成立。",
    "格局、扶抑、調候各解不同問題，取用以目前阻斷全局的因素定先後；通關須連接交戰兩端。五行百分比不是缺什麼補什麼，候選用神不是已定處方。",
    "合沖刑害先核成立，再分合絆、牽動、根損與成化；合化查季節、化神透根、爭合及阻隔，從格需核有效根氣和逆勢援助。",
    "十神與柱位依本題角色成義。大運改變階段背景，流年干支觸發原局；正文只用最切題的生剋作用及歲運變化說明主判，不重講全套格局推導。",
    "十神不是人格好壞分級，旺極等自動標籤與相對分不是原典定論。某行可洩身不等於任何數量都適合；土的燥濕、水火所處季節、透藏根氣及制合會改變效果。只說與答案有關的取用與作用，不能從『喜土』跳成理財可靠或佩戴土色必有益。",
    "《窮通寶鑑》120入口依本盤日干、節令月及實際透藏證據核對；合述季節保留合述。同一句有強弱、清濁、有效制化等待判條件時，不得把字面透藏符合寫成全條成立，或直接照搬原文富貴斷語。",
    "【八字判讀主線】先判月令格局需要哪些條件才能運作，再核日主是否承受得住，找出目前最先要處理的生剋阻點。官印能接續時，壓力可經由規範、學習或資源承接；食傷能生財時，表達或產出才有變現通路。每條路徑都以本盤透藏、根氣、位置及制合作依據，再落到原題中的能力、責任、資源與代價。",
    "歲運題要說出「新增什麼、牽動原局哪裡、原有制化能否接住」，比較進運前後可承擔的事如何改變。婚戀聚焦日支與關係角色、財務聚焦產出到所得再到保留、職涯聚焦能力到位置與權責。最後選一個最值得調整的環節，說清做何事會有幫助、在哪些條件下反會增加負擔。",
    "【八字深入全局】先核四柱、藏干、月令、節氣及交運政策，將日主承受力、格局需要和調候需求分開。根氣、透藏、生剋通路與合沖刑害共同成判，不以五行數量、單一十神或前端旺衰標籤下結論。",
    "格局須核月令立格、透藏與成敗救應；從格、化氣格審實際成立條件。扶抑、調候、通關與病藥並非同一取用理由，牴觸時交代先後和能改判的條件。",
    "學業、事業、財務、婚戀、家庭與生活負荷各自連回本局功能通路。財星只是資源議題，能否取得與留住須合日主承受、食傷輸出、官印制化及歲運。",
    "大運與流年逐段判新增干支如何引動原局、喜用能否承接及忌勢有無救應。交運年保留前後區間；逐年列運期、主題、偏利／偏阻／混合、象徵影響程度、盤面依據、條件與檢查點，不因相同年干重複套話。"
  ],
  "compat": [
    "【合盤：雙方原局與互動】各自核A、B原局、需要與承受力，再看A對B及B對A的作用；兩盤不合成八柱原局，對方某五行不是本人的補劑。",
    "婚戀、合夥、親子、主管部屬按原問題角色取象；先讀最影響本題的支持、衝突與調節通道。吸引、投入、承諾與長期維持分層判斷。",
    "各自歲運定位後才比較同一時段。正文直接回答關係主判，以具體雙向互動說明卡點與可試行的協議；不強制先輸出兩份完整命盤報告。",
    "日主相生不是付出方向，十神映射不是對方的心理報告；正官、食神不自動代表信任或善意，七殺不自動代表壓迫或不確定。不得由『木生火、受方忌木』直接得出『你越付出她越反感』。先核雙方完整原局、實際作用位置與相反通道，落到相處方式時明示為待核對的假設。",
    "日支彼此的關係與日支對另一方年月時支的關係要分開；同一對支的沖與刑不可當成兩個獨立問題。跨盤湊齊三合三會只列分布參照，不合成新的原局；合不保證有情，沖不保證決裂。雙方所有年干、宮干、限年四化保留來源，重複同干查表不增強結論。",
    "【合盤判讀主線】先從兩人各自原局建立與本題有關的需求假設與調節方式，再看跨盤哪一組作用讓兩人的方法接得上、哪一組讓付出難以被接收。分別回答A面對B要調整什麼、B面對A要承擔什麼；把日支互動、生活安排和外部責任分層，選真正改變關係品質的主因。",
    "結構性挑戰要落成一個可核對的循環：在什麼議題上，一方的做法可能引出另一方何種回應，回應又如何加重原問題。每個角色判讀各附其盤面依據；若只有象徵而無相處紀錄，就把循環當作供本人確認的情境。協議須同時容納兩方需求，寫清決策權、回應方式或時限，以及用什麼行為判斷改善。",
    "【合盤深入雙向判讀】先獨立讀A、B需要、能力與承受力，再核跨盤作用的來源、方向及實際角色。吸引、溝通、金錢分工、承諾與持續各自論證，不以元素相生或投影落夫妻代替對方心意。",
    "找最有力的互補如何被對方承接，以及最強反證限制意願、行動還是持續；同源合沖不重複加權。具體相處循環在沒有紀錄時只作待核對假設，轉成可試行的雙方協議。",
    "時機比較各自實算歲運的共同窗口，辨一方有機會而另一方未能承接的情況。資料單方、未知時辰或沒有互動背景的部分明示限制，不把未知視為必然不合。"
  ],
  "ziwei": [
    "【紫微：主宮星組與牽動】核命身、宮支、五行局、農曆與運限政策；按本題選主宮及實際三方四正。本命、大限、流年同名宮未必同一格。",
    "本宮主星組合連同廟旺、輔煞、三合資源及對宮牽制成判；空宮借對宮是參照，不改原盤。逐顆吉凶計票不能取代組合作用。",
    "四化保留星性與來源、落宮：生年、宮干、大限、流年各自定位，自化及來因宮依本次流派；祿忌或權忌同會不直接抵銷。",
    "疊宮保留本命與運限宮名，限年需有實算資料。正文只引用改變答案的宮組、四化或運限；全盤題才展開十二宮，不強制報每層飛化過程。",
    "逐筆核四化引用的來源方、層級、宮干、星曜、化象、受方和落宮。相同天干在生年與宮干重現不是兩份獨立證據；不同來源的化祿、化忌必須同時保留。命宮格局不能替代關係題的夫妻、福德與運限結構；化祿不證明本人目前有錢或對特定人願意付出。",
    "十干四化版本依本次選表，壬科左輔與天府不可混表。48宮干飛化及連續路徑是實際圖關係；楚天雲闊两轉象條件以生年為體，運層宮職重標不冒稱重配運干。尚未提供的口訣、案例人物私事不得補造。",
    "【紫微判讀主線】主宮回答事情怎麼運作，三合宮查可調用的資源，對宮查角色與環境的牽動；先讀主星搭配的共同作用，再看輔煞與廟旺如何改變做法的成本。關係題把夫妻的互動方式、福德的內在滿足、田宅的生活安排與官祿的責任牽動串起來，選其中最卡住的一環回答。",
    "四化依星性說清增加的是什麼、主導的是什麼、可疏解的是什麼、代價集中在哪裡；順著來源宮到落宮說明兩個領域怎麼牽連。大限改變焦點與可用資源，流年再指出本年何處被觸發。遇到祿忌同會時，回答取得某種好處需要付出什麼代價，以及現有輔助通道能處理多少。",
    "【紫微深入全盤與限流合參】核十二宮宮干地支、命身、主星同宮組合、主輔煞曜廟旺及空宮借對，再由各主宮實際三方四正與夾宮建立資源、需求、成本及制化通道；單星亮度、格名與吉凶計票不能代替組合作用。",
    "三合讀本命骨架；飛星追發射宮干→化曜→落宮→對宮牽動；欽天來因及向心／離心自化只按已採口徑解釋。河洛視角須有明列宮位數理與起例才具名推演；只有五行局不冒稱完成河洛專盤，不同派同源四化不當成多次驗證。",
    "全盤題完整展開十二宮，再整合健康生活安排、學業、事業、財務、人際家庭和婚姻感情。每宮說主星組合如何承接命身、三方資源、對宮牽動與關鍵四化。財帛空宮、福德對宮、本命三方及運限財官分層連接，不能只說靠人脈或有財庫。",
    "運限以本命、大限、流年三套座標合讀，保留本命與各層宮名，核四化、自化、流曜與同宮／對沖。小限、流月有實算資料才補充；原局資料的限流疊宮無不代表年度無疊宮。",
    "逐年題依每一指定大限與每一流年分別成判，列年度／虛歲／大限、議題、偏利或偏阻及條件、象徵影響程度、具體星組和四化依據、需注意的事與行動。相同年干在不同大限及落宮不能套同一句；關鍵窗口給有據年段、領域、反證，不自造已發生事件或月日。"
  ],
  "meihua": [
    "【梅花：體用與本互變】核起卦法、保存時間、上下卦及動爻；動爻所屬經卦為用，另一卦為體。互卦上下與變後用卦都對原體，原體不重新設立。",
    "用生體、體生用、體克用、用克體、比和，配起卦節令旺衰看助力、付出、掌握、約束與協力是否有力，不能只數吉凶。",
    "本卦讀局勢，互卦讀中間牽動，動爻與變卦讀關鍵轉折；爻辭、類象和實際外應依本次起法與情境。正文用改變答案的轉折串成故事，不固定分五段講卦理。",
    "應期須有明示方法與時間尺度；實務檢查日與預測分開。一卦的本互變不是不同方案的各自抽卦，也不是多份獨立證據。",
    "【梅花判讀主線】以體的節令力量看當事人能否承擔，以用對體的實際生克判外在事情如何作用；體克用偏向需要自己掌握，體生用偏向投入耗力，用生體偏向有助力，用克體偏向受約束，比和偏向可協力，成色再由旺衰與全卦修正。先給目前宜推進、調整或等待的主判。",
    "互卦找過程中哪一端增加支持或負擔，變後的用對原體則看關鍵轉折後條件改善還是加重。將本、互、變連成「起初可用條件—中途關卡—調整後方向」，再以切題爻辭或已提供外應定位做法，交代要先解決哪件現實事情。",
    "【梅花深入體用與動變】先核實際起卦、原體用、節令旺衰和動爻，再讀本卦、互卦、動變如何改變原條件；原體用角色不能在每一步任意交換。生剋是象徵作用，不是任何人的情緒或意願。",
    "分清體的承受、用的要求、互卦中間條件及變卦後續成本；生體也需能承接，克體須審旺衰及救應。全部相關卦氣先核完，再選真正改變答案的路徑。",
    "完整卦例按本、互、動、變回答全部子題，給進退與實務檢查點；應期須有明確起例和尺度。本次短期卦不擴成一生年表。"
  ],
  "liuyao": [
    "【六爻：納甲與用神】只依本次已保存的六次爻值、月建、日辰及換日政策判讀。初爻在下、上爻在上，可有零至六個動爻。核本卦八宮、世應、六親、六神、伏神；變爻六親仍以本卦卦宮五行為基準，不重新換宮取六親。",
    "先按原問題確定用神與角色；自動候選只是取用方向，不是已確認的人物。一卦中的世、應不憑空分配多位對象，也不把本卦和變卦當成兩個方案各自起卦。感情須依已知關係，不只按性別決定妻財或官鬼。",
    "明示性行為或多人親密情境時，分開判伴侶的意向、問卜者承擔、額外參與者、安排／行動與事件是否發生。僅有世應只能說已映射的雙方對接；不能自動擴成第三人支線，也不能由單一六親推定任何人的性意願或同意。未提供第三人的角色對應或本法有據的事件用神時，清楚標出尚未解析的那一層，不拿未定義的象徵補洞；現實中須逐人確認明確且可撤回的同意。",
    "月日生扶克洩、旬空、月破與動爻作用合看；月令／日辰關係須按來源方向解讀，『受生／受克』描述的是月日元素，不可倒讀成爻受生／受克。日沖只是一個客觀標記，須辨旺衰才判暗動或日破。六沖、六合、遊魂、歸魂、六神與某一六親不單獨決定成敗，不用吉凶分數冒充機率。",
    "先讀所選事情用神及其 influences.network：逐候選找出最有力的生扶與克制，再核月日、旬空、月破、旺衰和動靜。世應都相關時，說明同一爻如何分別作用於世與應；不可只報『元神／忌神』名目，也不可漏掉會改變主判的反向作用。靜爻仍按月日強弱與角色納入，不因靜止就略過。",
    "動爻才有直接動化作用；變爻只回作用於本位動爻，不能把變出的六親當成另一個已發生的人事或對方心念。之卦靜爻的納甲是背景，不是新增動爻。回頭生克、進退神與飛伏條件需落回用神的實際作用。三合須列出完整支組、動爻數及空破條件，依本法明示規則判為動局、靜背景或待條件，不把『三合』兩字直接當吉象。先說事情目前可不可行、卡在哪裡，再用最有影響的爻組說明，不逐列朗讀排盤表。",
    "應期須有用神、動靜、沖合與時間尺度的明確依據，保留條件；不由空亡或一個支位自造精確日期。六爻不套梅花體用，也不套周易按動爻數擇辭的方法。",
    "增刪第8章取用保留明列人物角色與作者案語；妹夫世、姑姨父母／兄弟的重義不可静默改成單一角色。應期月日以實際交節與00／23日界分段，不把交節當整日、也不把用神未定冒稱有唯一应期。",
    "【六爻判讀主線】先問用神能否得力：月日給它多少支持、元神的生扶能否送達、忌神有無有效克制，動變又把力量帶向哪裡。元神雖動而空破或化受制，援助可能難落實；忌神受制時，原本的阻力也可能鬆動。把這些實際作用連成成事路徑，指出最關鍵的一道門檻。",
    "世爻看自己在事件中的承擔與狀態，應爻按已知角色看對接條件；用神可成而世難承擔、世有力而用神受阻，是不同答案。若問題問時機，沿已算空破、動變、沖合的解決條件縮小時間；若問做法，優先提出能改善主阻點的安排，並列可觀察到的進展。",
    "【六爻深入作用網】核六爻、世應、實際問題用神及候選，再合月日旺衰、空破、靜動、變爻回作用、伏神及飛伏生剋；元忌仇神放回有效作用網，不單憑名稱定吉凶。",
    "分清生克沖合墓絕在本次是否有效，動化生克、進退反伏吟與合處逢沖等須核成立條件。多用神或角色不明時保留不同指向；世應只依問題角色解釋，不證明其他人的想法或同意。",
    "完整卦例涵蓋所有會改變主判的靜動爻、伏神及組合，再按子題總結。應期先說出空、解合、填實或沖開何者，再給已算候選時間；沒有候選日不自造日期，不把象徵當疾病。"
  ],
  "yijing": [
    "【易經：卦辭與爻辭】以已提供的本卦、之卦、動爻及本次擇辭政策為準；正文先用白話回答問題，再引用最能解釋處境、轉折與下一步的原文。原文照提供版本，不用記憶補寫或把白話改寫標成古文。",
    "本次採朱子《易學啟蒙・考變占》，三爻變並讀本、之卦卦辭，依已給定的前十主貞、後十主悔決定主次。四、五爻變所取的是之卦不變爻，不能誤讀成本卦該爻；乾坤六爻皆動用用九／用六，不能當成第七爻。遵守資料中已列明的主讀與參讀。",
    "本卦讀當下處境，動變與所選原文讀需調整的條件；之卦是變化後的參照，不直接保證未來發生。互、錯、綜卦若未提供，不自行補造為已起得的卦；不混入六爻納甲、世應或梅花體用規則。",
    "吉、凶、悔、吝、無咎、利貞要連同原文的前提與行為讀，不能只抽好聽字眼。三年、七日等經文數字先辨古義與象徵，不能直接成為現實日曆日期；疾病、婚姻、征伐等古語不作醫療指示或替他人表達同意。",
    "原朱子主讀不被互綜錯或納甲覆蓋；易傳使用本次64卦逐卦彖、大象、小象、用象與乾坤文言原文。互綜錯各有明列卦形與京房納甲，無月日六神資料不得自行补配。",
    "【易經判讀主線】先將主讀卦爻的處境、所處階段與勸告連成一個決策：現在應進、應守、應改方法，或先完成哪個條件。再看原文的因果次序，分清什麼做法導向吉、悔、吝或無咎，讓結論回答使用者真正要選的行動。",
    "本卦與之卦或主讀、參讀相反時，追問前提是否改變：現在合適的做法，到了另一階段可能需要收斂。把爻位的進程及經文中的人物職責翻成當事人在原題中的位置，說清何時堅持、何時轉向；以一項看得見的條件作為決策檢查點。",
    "【易經深入擇辭】核本卦、之卦、全部動爻及本次擇辭政策，保留主讀、參讀與原文來源；先讀古義、爻位與處境，再連到問題的角色、行動及條件，不只翻譯卦名吉凶。",
    "多爻動時遵循已採擇辭，不把全部爻辭硬拼成同一必然故事；主讀與參讀的張力交代限制。完整解卦逐子題給進退理由及可採取的第一步。",
    "經文的七日、三年等先按古義與情境解釋；時間只給資料支持的階段。具體事件、疾病、收入或年度人生表需要現實／運限資料，短期卦不冒充本命盤。"
  ],
  "oracle": [
    "【靈籤：全詩定調，關鍵句解題】核有效籤、籤系、籤號與完整原詩；先理解四句的背景、條件、轉折及收束，以全詩決定宜進、宜守、待條件或調整。",
    "正文先答原問題，再引用最能解釋答案的原句，把詩意直接放回使用者的處境；其餘詩句融入脈絡即可。明確要求逐句詳解時才逐句展開，不能只挑吉語忽略全詩前提。",
    "待、若、莫、且、終等語氣會限定轉機；等待須有對象與可觀察條件。季節詞先辨時令、典故或象徵，不逐句硬配公曆月份。",
    "原詩、廟方附記及可靠典故分清來源；典故比較處境和選擇，不把人物結局移植給求問者，不以籤號、五行、方位造日期或醫療判斷。",
    "【靈籤判讀主線】先用全詩回答「這件事眼前應採什麼態度與行動」，再找最有決定性的轉折句。前段若寫困境、後段寫開展，要把兩者之間的條件講清；勸等待時交代在等什麼，勸改變時交代改哪一環，讓求籤者得到實際方向。",
    "把詩中的人物、旅程、風雨或收成放回原問題的角色與過程。典故可幫助辨識選擇及代價，原詩的條件優先。結尾提出一個當下可做的準備，以及一個值得留意的轉機指標，讓答案有可檢查的落點。",
    "【靈籤深入全詩】按本次完整籤詩逐句讀起承轉合，核籤系、明列典故及處境；籤等不取代詩意，沒有可靠典故來源不編故事。句中角色與勸進、待時、調整條件放回原問句。",
    "支持與警示並存時，說明何種行為使條件轉好、何種選擇使阻力升高；全詩形成主線後回答所有子題，不把單句套所有人生領域。",
    "最後給當下第一步和轉機觀察指標。籤號不是月份，季節取象不保證發生日，不把靈籤當醫療或財務事實證明。"
  ],
  "astro": [
    "【西洋占星：相關宮主與相位】核黃道、宮制、時區、度數及容許度；本題宮位與宮主落座落宮、實際相位成主線。日月、上升與命主提供背景，不逐星背性格。",
    "相位看參與星、掌宮與環境；尊貴及角宮性是資源條件，順相位不等於已落實。未知時辰不定宮位、軸線與敏感時間點。",
    "本命、實際行運、次限、返照分層；時間窗口對應度數與有效資料。正文說清本題的需求、衝突及階段變化，只引用必要星盤結構。",
    "先核星盤用途；卜卦與事件的日期時間是問事／事件時刻，不能當出生時刻套終身性格和次限。迁居固定同一UTC與行星黃經重排宮位；卜卦用所選七曜光圈、接納、實際成相、換座轉向，結構候選不得直接當事件完成。",
    "【西洋占星判讀主線】先由本題宮位、宮主及其落宮建立事件路徑：事情從哪個領域發生，需依靠哪種資源或角色完成。再用宮主與日月、相關星體的相位辨認需求如何協調、在哪裡拉扯；定位星與接納關係說明可否取得支持。把相位的兩端都譯成可觀察的做法與代價。",
    "判機會時同看承接條件，判困難時同找可調用的資源。已算行運觸及哪顆本命星及其掌宮，便說明當期哪個生活議題被放大；有次限或返照時分清內在階段與年度情境。最後回答現在適合改變哪件事，以及何種現實進展才表示機會開始落實。",
    "【西洋占星深入整盤】核出生時間、時區、宮制、黃道及已算相位容許度；以日月上升和重要宮主建立主軸，合行星落宮尊貴、定位鏈、相位雙端及盤形。不能逐顆行星各寫性格套話。",
    "事業財務、婚戀、家庭、學習及生活負荷各有相關宮位與宮主的作用路徑；宮頭不精確時只保留受影響部分，不拿未知相位或宮位補故事。",
    "本命讀穩定需要，行運讀外部觸發，次限讀內在階段，返照讀觀察年情境；各層只用實算結果，單日時點不冒充全年精確日期。逐年只列有資料年份，未算的年段標缺口。"
  ],
  "vedic": [
    "【吠陀占星：D1與實算運期】核 ayanamsa、出生時間、上升、月亮星宿與分盤；本題宮主在D1的職責、落宮、尊貴與受照先成主線，自然吉凶不等於依上升定的功能吉凶。",
    "力量含擢升、本位、落陷、燃燒、逆行及關聯；Parashari 與 Rashi 相位各循明示體系。Yoga 核實際構成、力量和破壞條件，不能以名稱保證事件。",
    "Mahadasha／Antardasha 採月亮實算起訖，運主職責與相互關係讀當期主題；D9、D10等在相應領域檢查D1承接且保留時間敏感性。正文只講切題結構和運期轉折，不另寫格局驗算報告。",
    "17補充運期各有適用條件；只在本次所選方法與適用性下合讀，不以運期個數投票。16盤Arudha／Argala、8Karaka與Neechabhanga均對照實排；同度、等強或未知時計算標記未定時，不能挑一個候選冒稱唯一。若資料用位元遮罩或JSON Pointer，先依明列編碼還原。",
    "【印度占星判讀主線】由D1的主題宮、宮主及定位星建立可成事的通路，再以尊貴、受照、燃燒與關聯辨能力和代價。D9或D10等有效分盤檢查同一主題能否承接：本命有資源而專題條件弱時，重點在落實方式；兩層同向時，說明最適合把力量用在哪裡。",
    "當期大運主開啟它掌管與落入的領域，副運主決定這段事情透過什麼條件展開；兩主的相對位置、受照與定位關係解釋順阻。將本命可承擔的事、有效分盤及實算運期接成一條答案，指出此階段可推進的工作、關係或資源安排及相應成本。",
    "【印度占星深入原局與運期】核恒星黃道、歲差、宮制、月宿及D1；九曜的掌宮、落宮、尊貴、受照及功能吉凶合讀，Yoga須核完整條件與制化，不能逐星或按吉凶名單成判。",
    "分盤只在本次實算且出生精度足夠時使用，D9等依自己的角色合參，不能以分盤好壞覆蓋D1。各人生領域說明宮主如何承接資源及成本。",
    "Vimshottari大運、副運、次副運按實算起訖，讀運主掌宮落宮、兩主關係及分盤承接，再合實際行運。逐期或逐年給議題、象徵順阻程度、條件和行動；沒有行運快照的日期只用運期，不造精確入座時間。"
  ],
  "name": [
    "【姓名：字形與多派原生資料】先核明列姓／名、繁簡及異體字、民用生辰、筆畫來源與覆核。康熙部首還原、現代筆畫、數字按字形／數值是不同口徑；字表未知不以碼位、現代數或字形猜數。每字保留原數、來源與實際讀音，未確認的多音候選不當本人讀法。",
    "五格先核公式：單姓天格加1，複姓取姓總和；人格取姓末字與名首字；單名地格加1，多字名取名總和；外格天格＋地格−人格；總格全名總和。保留原數及81循環參照，虛數不當實際字的筆畫。",
    "五格81數理、三才五行與陰陽分開成判；五行按數尾、陰陽按奇偶，不冒稱字義五行或八字喜用。先讀天→人、人→地如何相生相剋及全名組合，再看數理主題，不把吉凶張數加成總分。姓名格位不指定年齡、婚姻次數、健康器官或事件。",
    "生肖形義只在明列完整出生日期與農曆年界實算時使用；八字年柱依立春，兩者不可混年。喜忌字根保留匹配來源、字位與覆蓋限制；同一字根不重複加權，部首參照不冒稱完整拆字。民俗牲畜、食物或栖息取象不移植為本人遭遇。",
    "八字用字只依本次實算四柱、月令根氣與原局取用，分扶抑、調候及成敗條件。沒有完整生時就保留缺口，不假設正午；不以生肖替代用神，不按五行數量補字。字義、字形及音韻五行多表不一，未明列所採字表不自造某字唯一五行。",
    "姓名易卦須保留選定起例、筆畫總數、上下卦、動爻、本卦與之卦及原文來源；本版姓數÷8上卦、名數÷8下卦、全名÷6動爻，餘0依8／6。這是固定姓名數理參照，不是對問題另起事件卦，不混入六爻納甲或冒稱河洛專盤；若本次無資料就不啟用。",
    "音形字義評估完整連讀、已確認音韻、字義聯想、書寫與辨識成本及本人期待；普通話候選不代替台語、客語、粵語。未提供的諧音、典故、家族字輩與他人評價只列待核，不捏造。來源英文釋義改寫成白話時標其參考性，不假裝教育部中文原文。",
    "比較候選以同姓、同生辰、同筆畫與同用途評估。若不同流派取捨衝突，指出它們各自支持什麼、代價在哪裡、哪個實際條件能改判；不平均各派吉凶、不把相同筆畫多次驗證。先按本人用途與實際使用成本定優先，数理不能保证人生結果。",
    "三才按本次CDI或靈昭125表；兩具名現代版本與未核實旧表保留來源差異，不冒稱熊崎原著。分類原詞与归一等级分開，不把同版多網站當獨立印證；兩網站25共吉不是四來源研究的23共識。",
    "【姓名判讀主線】先回答這個名字在本題用途上是否合適；比較候選時，分別看字義想表達的方向、叫讀是否順口、辨識與書寫成本，再看同一筆畫體系下五格三才的傳統象義。若數理與實際使用感受不一致，說清各自回答哪一層，再按使用者的目的定優先順序。",
    "建議須落到具體字、音或組合：保留什麼、調整什麼、理由及代價各是什麼。可用口頭自我介紹、電話報名或正式署名作試用，觀察辨識度與本人感受，再決定是否採用；改名題同時考慮既有認知與實際更換成本。",
    "【姓名深入取捨與多派合參】讀完所有有效姓名資料，逐字核讀音、字義、原筆畫與覆核，連到姓／名接合、五格角色、三才作用與全名辨識。只用本次算出的資料，不拿單個吉數、名字五行或生肖斷一生。",
    "全姓名題分開交代五格81主題、125三才與陰陽、音形字義、生肖形義、完整八字用字取向、姓名易卦；未啟用的方法標資料缺口，其餘照常深入。每派給最有力支持、牽制、成立條件與實際做法。河洛、奇門或其他姓名派需其專盤與起例，未提供不冒稱都完成。",
    "筆畫敏感度比較原口徑與另一口徑哪些字、格數、三才或卦象改變；人工覆核與來源值同时保留，另一口徑不沿用人工數假裝字典數。不把同源筆畫衍生五格、三才、姓名卦當三次獨立準確驗證。",
    "多名字題逐個用相同標準說適合用途、最強優勢與成本，再橫向比較、給具體保留／調整哪個字及決勝條件；沒有本人偏好時不強造絕對排名。改名、藝名、孩子取名另考慮證件、原有辨識、字輩與日常稱呼成本。",
    "姓名不能推某年事件、婚姻或子女人數、性行為、疾病、收入機率，也不保證改名改運。建議落到自我介紹、電話報名、正式署名與可讀性試用；若設定試用時間，那是實務檢查點，不是姓名應期。"
  ],
  "liuren": [
    "【大六壬：四課三傳與具名課體】只讀本次实际干支、月將加時、天地盤、四課、九宗門三傳、貴人天將、六親旬空及年命上神。干為人、支為事是本次選用的判讀參照，人物角色須回到原問題，不由將名猜身分。",
    "64課族的成立、不成立與資料不足分開；290條具名神煞先核所選原表與實際課傳年命命中，再讀生克、空破、內外戰和遞生互克。全盤有某支不等於該神煞發用，同源別名不增加独立證據；缺年命不得補算。",
    "十八日土旺／整月土旺依本次政策，日出日落須實際坐標；真太陽時只改本地排盤鐘，不移動原UTC交節。應期表是各日、各交節區間的規則條件，不保證事件發生；远期窗不能重造首次出原旬。",
    "【六壬判讀主線】先比較干支兩端及彼此上神，辨本題參與者如何承接事情；沿初中末傳追作用能否傳遞到落點。用實際六親、天將、空破與生克制化說明主因、阻點及可介入條件，課名和神煞名不直接當事件。",
    "【大六壬深入課傳】完整課盤保留十二天地盤位置、四課、三傳取傳過程、十二天將、旬空遁干、六親、月令、內外戰與實際傳間作用。逐課核上下生克與人事兩端，再按初中末的同一推演順序完成主判。",
    "64課族與290神煞只按本次明列取法計算；正文、訂訛與其他原表分列，神煞定位保留原干／干支及寄宮。只讀真正落四課三傳或年命上神的命中，結合用神旺衰和支持牽制，不以名稱吉凶投票。",
    "年命、虛歲行年及雙人課依實際輸入。出空填實或解合沖開先談條件；沒有實算候選日不給日曆應期。全盤與各子題分開辨意願、行動、落實及持續，結論給有據的改判條件與可採一步。"
  ],
  "personality": [
    "【人格卡：情境中的特質】回到實際四柱與十神作用；卡片名稱與分數是模型摘要，不是心理診斷。挑最影響本題的特質，說明優勢、壓力表現及可練習之處。",
    "矛盾特質可能分屬不同情境，與本人經驗不符時修正應用；正文形成連貫的人格主軸，不照卡片欄位逐項複誦。",
    "【人格判讀主線】從原局最有作用力的兩三條結構提出可觀察的行為假設，分清平常有資源時的長處、負荷升高時同一做法可能付出的代價。把印的吸收、食傷的表達、財的資源管理、官殺的規範要求、比劫的自主協作放回本盤實際制化，說明這些功能如何配合。",
    "同一特質在工作、親密關係或陌生環境可能表現不同；依原題選一個情境，指出觸發點、慣常反應與可練習的新反應。給一個短期可試的行為及核對指標，由實際經驗決定保留或修正哪個假設，讓人格卡幫助選擇而非只提供形容詞。",
    "【人格深入功能與情境】從原局功能通路讀決策、行動、學習、表達、資源管理與協作，分資源充足及壓力升高時同一特質的優勢與代價，不把前端類型標籤當成心理測驗或診斷。",
    "工作、親密關係及陌生環境的表現可不同，說明觸發條件、慣常反應及可練習替代做法，連到本人可核對的行為。",
    "提出可試練習和觀察指標，由本人經驗決定哪些解釋適用，不由人格卡預測職業成敗、他人評價或補造人生年表。"
  ]
};
  // END GENERATED WORKFLOW METHOD GUIDES
  var FULL_AREAS = {
  "liuren": "完整讀十二天地盤、四課、九宗門取傳、三傳的遞生互克、十二天將、六親旬空遁干、月令內外戰。64課族逐條成立／否／缺資料分開，290神煞只採實際課傳年命命中。同源別名不加票，雙人年命依明示輸入，應期沒有候選日實算不造日期；各子題交代最強支持、牽制、改判條件及可採行動。",
  "tarot": "【塔羅深入合讀】逐一核對全部實際牌位職責與正逆方向，形成完整牌陣的發展結構；需求、可採行動、環境、結果和阻礙各自成義，再串成結果能否落實的路徑。單張本義不能取代相鄰關係、核心牌與不同支線的共同作用。；主線與子題逐一成判，區分情緒、意願、實際行動與持續；人物牌不自行指認身分。逆位綜合牌面、位置與全局，分辨內化、受阻、過度或鬆動，不能一律翻成相反。；時間與影響程度來自實際時間位及發展順序；只有序列時給相對階段，不自造月份。每個關鍵轉折連同成立條件、支持牌位、最強反證及可採行動說明。",
  "ootk": "【開鑰之法五層深讀】依實際完成且有效的五次操作逐層回答原題，不把五輪當五個月份。第一輪建立當下基底，第二輪讀互動與發展機制，第三輪讀結構門檻與承接條件，第四輪從三十六牌環讀累積張力與轉折，第五輪收束最終傾向與保留條件；仍以每輪實際落域為準，不硬套固定事件。；每輪都必須新增一個具體判斷，交代最強支持、最強反證、限制的是注意／感受／意願／行動／承諾／持續／結果哪一層，以及本輪如何延續、加強、削弱、轉向或補充上一輪。不能只抄牌義、列程序或用一句『未知』代替整輪。；第一輪主線未確認時只降低第一輪權重，後四輪有效資料照常成判。問第三方看法或心意而缺少明確角色綁定時，不把象徵寫成已證實內心；但仍須輸出五輪最支持的方向性模型，把無法歸屬者標為關係場／互動場訊號。；五輪完成後必須收斂最可能方向、次可能方向、最強反證、成立條件、改判條件與信心來源，再給現實驗證點與行動。『無法證實』是事實宣稱邊界，不是停止回答的理由；人物身分、事件次數及日期仍不得補造。",
  "lenormand": "【雷諾曼深入牌句】讀完全部切題相鄰牌句和長線，保留中心、起訖與方向，辨人物近域、問題主線及方案分支的共同作用；牌的含義由句法與角色限定，不能挑幾張吉凶牌取代整條牌句。；大牌陣依實際落宮和幾何讀近遠、行列及已採鏡像，分清人物、領域與環境；未指定人物不補指認，合法配對不可冒充相鄰。；全盤逐重要區域及已知人物整理支持、阻力與發展；單題將相關牌組合成主判。時間只依實際牌陣及明列口徑，牌號或距離不自行換成確切天數。",
  "bazi": "【八字深入全局】先核四柱、藏干、月令、節氣及交運政策，將日主承受力、格局需要和調候需求分開。根氣、透藏、生剋通路與合沖刑害共同成判，不以五行數量、單一十神或前端旺衰標籤下結論。；格局須核月令立格、透藏與成敗救應；從格、化氣格審實際成立條件。扶抑、調候、通關與病藥並非同一取用理由，牴觸時交代先後和能改判的條件。；學業、事業、財務、婚戀、家庭與生活負荷各自連回本局功能通路。財星只是資源議題，能否取得與留住須合日主承受、食傷輸出、官印制化及歲運。；大運與流年逐段判新增干支如何引動原局、喜用能否承接及忌勢有無救應。交運年保留前後區間；逐年列運期、主題、偏利／偏阻／混合、象徵影響程度、盤面依據、條件與檢查點，不因相同年干重複套話。",
  "compat": "【合盤深入雙向判讀】先獨立讀A、B需要、能力與承受力，再核跨盤作用的來源、方向及實際角色。吸引、溝通、金錢分工、承諾與持續各自論證，不以元素相生或投影落夫妻代替對方心意。；找最有力的互補如何被對方承接，以及最強反證限制意願、行動還是持續；同源合沖不重複加權。具體相處循環在沒有紀錄時只作待核對假設，轉成可試行的雙方協議。；時機比較各自實算歲運的共同窗口，辨一方有機會而另一方未能承接的情況。資料單方、未知時辰或沒有互動背景的部分明示限制，不把未知視為必然不合。",
  "ziwei": "【紫微深入全盤與限流合參】核十二宮宮干地支、命身、主星同宮組合、主輔煞曜廟旺及空宮借對，再由各主宮實際三方四正與夾宮建立資源、需求、成本及制化通道；單星亮度、格名與吉凶計票不能代替組合作用。；三合讀本命骨架；飛星追發射宮干→化曜→落宮→對宮牽動；欽天來因及向心／離心自化只按已採口徑解釋。河洛視角須有明列宮位數理與起例才具名推演；只有五行局不冒稱完成河洛專盤，不同派同源四化不當成多次驗證。；全盤題完整展開十二宮，再整合健康生活安排、學業、事業、財務、人際家庭和婚姻感情。每宮說主星組合如何承接命身、三方資源、對宮牽動與關鍵四化。財帛空宮、福德對宮、本命三方及運限財官分層連接，不能只說靠人脈或有財庫。；運限以本命、大限、流年三套座標合讀，保留本命與各層宮名，核四化、自化、流曜與同宮／對沖。小限、流月有實算資料才補充；原局資料的限流疊宮無不代表年度無疊宮。；逐年題依每一指定大限與每一流年分別成判，列年度／虛歲／大限、議題、偏利或偏阻及條件、象徵影響程度、具體星組和四化依據、需注意的事與行動。相同年干在不同大限及落宮不能套同一句；關鍵窗口給有據年段、領域、反證，不自造已發生事件或月日。",
  "meihua": "【梅花深入體用與動變】先核實際起卦、原體用、節令旺衰和動爻，再讀本卦、互卦、動變如何改變原條件；原體用角色不能在每一步任意交換。生剋是象徵作用，不是任何人的情緒或意願。；分清體的承受、用的要求、互卦中間條件及變卦後續成本；生體也需能承接，克體須審旺衰及救應。全部相關卦氣先核完，再選真正改變答案的路徑。；完整卦例按本、互、動、變回答全部子題，給進退與實務檢查點；應期須有明確起例和尺度。本次短期卦不擴成一生年表。",
  "liuyao": "【六爻深入作用網】核六爻、世應、實際問題用神及候選，再合月日旺衰、空破、靜動、變爻回作用、伏神及飛伏生剋；元忌仇神放回有效作用網，不單憑名稱定吉凶。；分清生克沖合墓絕在本次是否有效，動化生克、進退反伏吟與合處逢沖等須核成立條件。多用神或角色不明時保留不同指向；世應只依問題角色解釋，不證明其他人的想法或同意。；完整卦例涵蓋所有會改變主判的靜動爻、伏神及組合，再按子題總結。應期先說出空、解合、填實或沖開何者，再給已算候選時間；沒有候選日不自造日期，不把象徵當疾病。",
  "yijing": "【易經深入擇辭】核本卦、之卦、全部動爻及本次擇辭政策，保留主讀、參讀與原文來源；先讀古義、爻位與處境，再連到問題的角色、行動及條件，不只翻譯卦名吉凶。；多爻動時遵循已採擇辭，不把全部爻辭硬拼成同一必然故事；主讀與參讀的張力交代限制。完整解卦逐子題給進退理由及可採取的第一步。；經文的七日、三年等先按古義與情境解釋；時間只給資料支持的階段。具體事件、疾病、收入或年度人生表需要現實／運限資料，短期卦不冒充本命盤。",
  "oracle": "【靈籤深入全詩】按本次完整籤詩逐句讀起承轉合，核籤系、明列典故及處境；籤等不取代詩意，沒有可靠典故來源不編故事。句中角色與勸進、待時、調整條件放回原問句。；支持與警示並存時，說明何種行為使條件轉好、何種選擇使阻力升高；全詩形成主線後回答所有子題，不把單句套所有人生領域。；最後給當下第一步和轉機觀察指標。籤號不是月份，季節取象不保證發生日，不把靈籤當醫療或財務事實證明。",
  "astro": "【西洋占星深入整盤】核出生時間、時區、宮制、黃道及已算相位容許度；以日月上升和重要宮主建立主軸，合行星落宮尊貴、定位鏈、相位雙端及盤形。不能逐顆行星各寫性格套話。；事業財務、婚戀、家庭、學習及生活負荷各有相關宮位與宮主的作用路徑；宮頭不精確時只保留受影響部分，不拿未知相位或宮位補故事。；本命讀穩定需要，行運讀外部觸發，次限讀內在階段，返照讀觀察年情境；各層只用實算結果，單日時點不冒充全年精確日期。逐年只列有資料年份，未算的年段標缺口。",
  "vedic": "【印度占星深入原局與運期】核恒星黃道、歲差、宮制、月宿及D1；九曜的掌宮、落宮、尊貴、受照及功能吉凶合讀，Yoga須核完整條件與制化，不能逐星或按吉凶名單成判。；分盤只在本次實算且出生精度足夠時使用，D9等依自己的角色合參，不能以分盤好壞覆蓋D1。各人生領域說明宮主如何承接資源及成本。；Vimshottari大運、副運、次副運按實算起訖，讀運主掌宮落宮、兩主關係及分盤承接，再合實際行運。逐期或逐年給議題、象徵順阻程度、條件和行動；沒有行運快照的日期只用運期，不造精確入座時間。",
  "name": "【姓名深入取捨與多派合參】讀完所有有效姓名資料，逐字核讀音、字義、原筆畫與覆核，連到姓／名接合、五格角色、三才作用與全名辨識。只用本次算出的資料，不拿單個吉數、名字五行或生肖斷一生。；全姓名題分開交代五格81主題、125三才與陰陽、音形字義、生肖形義、完整八字用字取向、姓名易卦；未啟用的方法標資料缺口，其餘照常深入。每派給最有力支持、牽制、成立條件與實際做法。河洛、奇門或其他姓名派需其專盤與起例，未提供不冒稱都完成。；筆畫敏感度比較原口徑與另一口徑哪些字、格數、三才或卦象改變；人工覆核與來源值同时保留，另一口徑不沿用人工數假裝字典數。不把同源筆畫衍生五格、三才、姓名卦當三次獨立準確驗證。；多名字題逐個用相同標準說適合用途、最強優勢與成本，再橫向比較、給具體保留／調整哪個字及決勝條件；沒有本人偏好時不強造絕對排名。改名、藝名、孩子取名另考慮證件、原有辨識、字輩與日常稱呼成本。；姓名不能推某年事件、婚姻或子女人數、性行為、疾病、收入機率，也不保證改名改運。建議落到自我介紹、電話報名、正式署名與可讀性試用；若設定試用時間，那是實務檢查點，不是姓名應期。",
  "personality": "【人格深入功能與情境】從原局功能通路讀決策、行動、學習、表達、資源管理與協作，分資源充足及壓力升高時同一特質的優勢與代價，不把前端類型標籤當成心理測驗或診斷。；工作、親密關係及陌生環境的表現可不同，說明觸發條件、慣常反應及可練習替代做法，連到本人可核對的行為。；提出可試練習和觀察指標，由本人經驗決定哪些解釋適用，不由人格卡預測職業成敗、他人評價或補造人生年表。"
};
  function goal(q,event){
    if((event&&event.queryOperator==='enumeration_guidance')||/(?:有哪些|哪幾(?:項|個|點|種)|哪些(?:項目|地方|方面|問題|原因|事項)|有什麼(?:問題|項目|地方|方面|事項).{0,12}(?:注意|留意|關注)?|有何(?:問題|項目|事項))/.test(q))return 'enumeration';
    if(/比較|哪個|哪一|何者|還是|二選|三選|選擇|該不該|要不要/.test(q))return 'compare';
    if(/如何|怎麼|怎樣|該怎|幫助|幫忙|做什麼|做甚麼|改善|修復|處理|應對/.test(q))return 'help';
    if(/何時|什麼時候|甚麼時候|多久|哪年|哪月|時機/.test(q))return 'timing';
    if(/為什麼|為何|原因|結構|卡點|挑戰|問題在哪/.test(q))return 'explain';
    if(/會不會|能不能|可不可以|是否|有沒有|能否|嗎|會否/.test(q))return 'direction';
    return 'general';
  }
  function compiler(){
    if(root.JYTarotFoundation&&typeof root.JYTarotFoundation.compileQuestion==='function')return root.JYTarotFoundation;
    if(typeof module==='object'&&module.exports){try{return require('./tarot-foundation.js');}catch(_e){}}
    return null;
  }
  function semanticModel(question,options){
    var F=compiler();if(!F)return {schema:'jy.question_model/1',status:'unavailable',sourceQuestion:question,events:[]};
    var compiled=F.compileQuestion(question,{referenceDate:options&&options.referenceDate,timezone:options&&options.timezone}),graph=compiled.queryGraph||{},rq=compiled.readingQuestion||{},language=rq.clauses||[],events=graph.events||[];
    var entities=Object.create(null);(graph.entities||[]).forEach(function(e){entities[e.id]=e.surface||e.source||e.id;});
    return {
      schema:'jy.question_model/1',status:graph.compilerStatus||'partial',sourceQuestion:String(question||''),
      queryIntent:{shape:compiled.features&&compiled.features.shape||null,dimensions:(compiled.requestedDimensions||[]).map(function(x){return {id:x.id,label:x.label,source:x.source};}),domains:(compiled.features&&compiled.features.domains||[]).slice(),explicitTime:(compiled.explicitScopes||[]).map(function(x){return {surface:x.surface,kind:x.kind,bounded:x.bounded,resolved:x.resolved&&x.resolved.label||null};}),operatorFocus:compiled.features&&compiled.features.enumeration?'enumeration_guidance':compiled.features&&compiled.features.causal?'cause_explanation':compiled.features&&compiled.features.timing?'relative_timing':compiled.features&&compiled.features.choice?'choice':compiled.features&&compiled.features.advice?'action_guidance':'',
      },
      events:events.map(function(e,i){
        var r=e.roles||{},f=e.languageFrame||language[i]||{},metricEntity=(graph.entities||[]).find(function(x){return x.id===r.subject;}),relation=(compiled.relations||[]).find(function(x){return (e.relationIds||[]).indexOf(x.id)>=0;})||null;
        return {id:e.id,source:e.surface,type:e.type,predicate:e.predicate,clauseRole:f.role||'',requester:entities[r.actor]||r.actor||'問卜者本人',eventActor:r.eventActor||null,grammaticalSubject:f.subjectRef||null,target:entities[r.target]||entities[r.subject]||f.targetRef||null,actionObject:r.actionObject||null,conditionalEntity:r.conditionalEntity||null,personBinding:r.personBinding||null,entityReference:r.entityReference||f.entityReference||null,attribute:r.attribute||'',attributeComparison:r.attributeComparison||null,dependsOn:(e.dependsOn||[]).slice(),
          actionSequence:(r.actionSequence||f.actionSequence||[]).slice(),willingness:r.willingness===true||f.willingness===true,explicitSexualAct:r.explicitSexualAct===true||f.explicitSexualAct===true,
          timingTarget:r.timingTarget||null,recurrenceCue:r.recurrenceCue||f.recurrenceCue||null,priorOccurrenceVerified:r.priorOccurrenceVerified===true,
          recurrenceContext:f.recurrenceContext||null,lexicalInterpretation:f.lexicalInterpretation||null,enumerationRequest:f.enumerationRequest||null,truthGate:r.truthGate===true||f.truthGate===true,requestedItems:r.requestedItems||f.enumerationRequest&&f.enumerationRequest.requestedItems||'',attentionFocus:r.attentionFocus||f.enumerationRequest&&f.enumerationRequest.attentionFocus||'',
          participants:(r.participants||f.participants||[]).map(function(p){return {surface:p.surface,role:p.role,source:p.source};}),
          metric:r.metric||relation&&relation.metric||'',metricKind:relation&&relation.metricKind||f.measurementGoal&&f.measurementGoal.metricKind||'',metricCadence:r.metricCadence||relation&&relation.metricPeriod||'',threshold:r.threshold?{surface:relation&&relation.thresholdSurface||'',value:relation&&relation.thresholdValue,operator:r.comparator||''}:null,
          comparison:r.leftOperand||r.rightOperand?{left:entities[r.leftOperand]||r.leftOperand,right:entities[r.rightOperand]||r.rightOperand,operator:r.comparator||'',criterion:r.attribute||''}:null,
          evaluation:r.evaluatedTarget?{evaluator:r.evaluator,target:r.evaluatedTarget,criterion:r.criterion}:f.evaluation?{evaluator:f.evaluation.evaluatorRef,target:f.evaluation.targetRef,criterion:f.evaluation.criterion}:null,
          modality:e.modality||'open',queryOperator:r.queryOperator||'',timeScope:(e.timeScope||[]).slice(),requiredObservables:(e.requiredObservables||[]).slice(),optionSet:{status:r.optionSetState||f.openChoiceSet&&f.openChoiceSet.status||'',object:r.recommendationTarget||f.openChoiceSet&&f.openChoiceSet.object||''},
          conditions:(f.conditions||[]).slice(),negations:(f.negations||[]).slice(),comparisonFrame:!!f.comparisonFrame,semanticDimensions:(f.dimensions||[]).slice(),semanticDomains:(f.domains||[]).slice(),temporal:{future:!!(f.temporal&&f.temporal.future),continuity:!!(f.temporal&&f.temporal.continuity),horizon:f.temporal&&f.temporal.horizon||null,actorBoundFutureEvent:!!f.actorBoundFutureEvent},
          sourceRoles:{grammaticalSubject:f.subjectRef||'',subject:metricEntity&&metricEntity.surface||r.eventActor||f.subjectRef||'',targetSurface:r.target?entities[r.target]||'':'',metric:r.metric||relation&&relation.metric||'',threshold:r.threshold||'',comparator:r.comparator||'',requestedAction:(r.requestedAction||[]).slice(),requestedItems:r.requestedItems||'',attentionFocus:r.attentionFocus||'',truthGate:r.truthGate===true,timingTarget:r.timingTarget||'',recurrenceCue:r.recurrenceCue||f.recurrenceCue||'',requiredDistinctions:(r.requiredDistinctions||[]).slice()},causalSituation:e.causalSituation||f.causalSituation||null};
      }),
      unresolved:{language:(rq.semantic&&rq.semantic.unresolved||[]).slice(),ambiguities:(rq.semantic&&rq.semantic.ambiguities||[]).slice(),assumptions:(graph.assumptions||[]).slice(),unsupportedDimensions:(graph.unsupportedDimensions||[]).slice(),decisionKind:rq.decisionKind||'none',notes:(rq.notes||[]).slice()},
      validation:graph.validation||null
    };
  }
  function plan(options){
    options=options||{};
    var q=String(options.question||'').trim(),ids=kinds(options.methods||options.method);
    var lifePurpose=/(?:今生|此生|一生|終身|人生|生命).{0,8}(?:使命|天職|課題|意義|目的)|(?:使命|天職|生命目的|人生目的|生命意義|人生意義|終身課題|一生課題)/.test(q);
    if(!ids.length)throw new Error('沒有有效的命理方法，無法整理本題');
    var model=semanticModel(q,options),report=reportScope(q,ids[0]);
    var disease=/躁鬱|双相|雙相|bipolar|憂鬱症|抑鬱症|精神疾病|思覺失調|糖尿病|癌症|癲癇|失智/i.test(q);
    var care=/幫助|幫忙|照顧|陪伴|怎麼辦|該如何|不穩定|發作|病情|治療|康復|症狀|停藥|減藥|換藥|就醫|生病|失眠|自傷|自殺/.test(q);
    var clinical=/(?:我|她|他|現任|伴侶|女友|男友|父|母|家人|朋友).{0,30}(?:停藥|減藥|換藥|就醫|病情|症狀|手術|治療)/.test(q);
    var health=(model.queryIntent&&model.queryIntent.domains||[]).indexOf('health')>=0||(disease&&care)||clinical||/自傷|自殺/.test(q);
    var domains=(model.queryIntent&&model.queryIntent.domains||[]).slice();
    if(health)domains.push('health');
    if(/投資|借貸|負債|股票|基金|財務|營業額|收入|財運|賺錢|副業|正職|本業/.test(q))domains.push('finance');
    if(/法律|官司|訴訟|離婚協議|提告|判刑|合約糾紛/.test(q))domains.push('legal');
    domains=Array.from(new Set(domains));
    var sentences=q.split(/[？?；;\n]+/).map(function(x){return x.trim();}).filter(Boolean);
    var tasks=(sentences.length?sentences:[q||'依本次有效資料分析主軸與可行方向']).map(function(text,i){var event=(model.events||[]).find(function(e){return String(e.source||'').replace(/[？?。；;]+$/,'').trim()===text;})||(model.events||[])[i];return {id:i+1,question:text,goal:goal(text,event)};});
    var broad=report.fullChart||report.annualRequested||report.requestedDecades||lifePurpose||/全盤|整體|完整分析|深入分析|深度分析|所有面向|年度運勢|今年運勢|長期走向|一生|終身/.test(q),
      complex=broad||tasks.length>1||ids.length>1||(model.events||[]).some(function(e){return (e.requiredObservables||[]).length>=3||(e.participants||[]).length>=2||(e.actionSequence||[]).length>=2||(e.conditions||[]).length>0||!!e.comparison||!!e.evaluation||!!e.causalSituation||e.metricCadence&&e.queryOperator==='relative_timing_to_threshold'||e.type==='recommendation_with_unprovided_options'||e.queryOperator==='enumeration_guidance';});
    var healthExam=domains.indexOf('health')>=0&&/(?:體檢|健檢|健康檢查|檢查報告|篩檢)/.test(q);
    return {version:VERSION,question:q,methods:ids,tasks:tasks,domains:domains,
      depth:broad?'comprehensive':complex?'deep':'focused',reportScope:report,
      questionModel:model,
      healthSupport:health&&/現任|女友|男友|伴侶|她|他|父|母|家人|朋友/.test(q),healthExam:healthExam,
      bipolarMention:disease&&/躁鬱|双相|雙相|bipolar/i.test(q),lifePurpose:lifePurpose,
      source:'原問句明示詞彙；只用來安排回答任務，不是排盤證據、診斷或對事件的判斷。'};
  }
  function chartReferenceAudit(options,chart){
    var p=plan(options),raw=chart&&(chart.tarotData||chart.lenormandData||chart),cards=raw&&(raw.cards||raw.drawn)||[],slots=raw&&raw.methodPlan&&raw.methodPlan.slots||[],F=compiler();
    if(!cards.length||!F)return null;
    var compiled=F.compileQuestion(p.question),branches=compiled.readingQuestion.branches,issues=[];
    cards.forEach(function(card,i){
      var b=card.binding||card.slotBinding||slots[i]&&slots[i].binding;if(!b)return;
      var branch=branches.find(function(x){return x.id===b.eventId;}),event=p.questionModel.events.find(function(x){return x.id===b.eventId;});
      var expected=branch&&branch.entity||event&&event.personBinding&&event.personBinding.surface||event&&event.grammaticalSubject,actual=b.entity||b.subjectRef;
      if(expected&&actual&&expected!==actual&&!/^(?:他|她|對方)$/.test(actual))issues.push({position:i+1,eventId:b.eventId,originalEntity:actual,correctedSameQuestionEntity:expected,question:branch&&branch.question||event&&event.source,status:'stale_reference_annotation'});
    });
    return {schema:'jy.cast-reference-audit/1',status:issues.length?'reference_annotation_needs_correction':'no_recorded_reference_conflict',issues:issues,cardSequencePreserved:true,positionAndOrientationPreserved:true,policy:'旧语义注记与原题冲突时按同一子题的人物共指纠正注记；卡片、方向、原牌位、原子题不改，不增删或重新抽牌。未知绑定保持未知。'};
  }
  function referenceContract(options){
    var p=plan(options),lines=[];
    var attributes=(p.questionModel.events||[]).filter(function(e){return e.type==='person_attribute_query';});
    if(attributes.length){
      lines.push('【人物與屬性綁定】'+JSON.stringify(attributes.map(function(e){return {query:e.source,attribute:e.attribute,person:e.personBinding,comparison:e.attributeComparison,dependsOn:e.dependsOn};})));
      lines.push('逐子題保留原人物及排除限制；非現任對象不得改綁現任。人物共指歧義明列候選；人物存在待判時，屬性回答也保留此前提。原題問幾歲就保留精確年齡需求，不擅改問相對年齡；資料未量測年齡時明說無法推出幾歲，牌號／宮廷牌不能換算年齡。相對年齡題保留比較基準與較年輕／同齡／較年長的原選項；本次證據不足就列不足，不造數字或生日。');
      lines.push('【同盤修正】人物解析、文字澄清及答案修訂只使用已提供的同一次牌／卦／命盤、牌位與方向；不得聲稱重新抽牌，不補造新牌、不改綁其他題的牌位。沒有專屬屬性牌位時只在原牌陣容許範圍交叉參看，標明未直接量測，不把一般牌位改名成年齡位。');
    }
    return lines.join('\n');
  }
  function methodGuide(method){
    var k=kinds(method)[0];if(!k)return '';
    var lines=['【'+METHODS[k].name+'完整判讀方法】','請運用本法完整知識判讀本次實際資料，先建立全局，再追蹤與原題有關的作用。下列方法是推理依據，正文依原題組織；單題不自動擴成全盤或逐年報告。'];
    var specific=k==='ziwei'?root.JY_ZIWEI_PROMPT_ROOT:k==='bazi'?root.JY_BAZI_PROMPT_ROOT:null;
    if(specific?.roleText)lines.push(specific.roleText());
    if(k==='ziwei'&&specific?.technicalRulesLines)lines.push.apply(lines,specific.technicalRulesLines());
    if(k==='ziwei'&&specific?.domainRouterLines)lines.push.apply(lines,specific.domainRouterLines());
    if(k==='bazi'&&specific?.universalRulesLines)lines.push.apply(lines,specific.universalRulesLines());
    var quality=root.JY_READING_QUALITY,guide=quality?.methodLines&&String(quality.readingVersion||'0').localeCompare('9.4.0',undefined,{numeric:true})>=0?quality.methodLines(k):METHOD_GUIDES[k];
    lines.push.apply(lines,guide?.length?guide:[METHODS[k].path,FULL_AREAS[k]]);
    return lines.join('\n');
  }
  function render(options){
    var p=plan(options),lines=[MEMORY_BOUNDARY,'【共用判讀版本】'+VERSION,'【本題作答任務｜資料讀完後依此成稿】','原問句（原文資料）：'+JSON.stringify(p.question)];
    p.tasks.forEach(function(t){var g=GOALS[t.goal];lines.push((p.tasks.length>1?'子題'+t.id+' '+JSON.stringify(t.question)+'：':'')+g.opening+' '+g.body);});
    if(p.depth==='deep')lines.push('【本題判讀範圍】此題含多層行動／條件；按本方法追完相關證據路徑後，只寫會改變答案的支持、牽制和現實檢查點，不以同源訊號重複加權。');
    else if(p.depth==='comprehensive')lines.push('【本題判讀範圍】依本題實際涉及的領域整合主線、交互條件與反證；全盤完整覆蓋本法結構，單題只展開真正牽動答案的位置。');
    lines.push('有效方法：'+p.methods.map(function(k){return METHODS[k].name;}).join('、')+'。'+p.methods.map(function(k){return METHODS[k].path;}).join(' '));
    p.methods.forEach(function(k){
      // Legacy hosts already include complete method rules above their facts.
      // Retain those literal lines there and add only rules that are absent.
      var guide=methodGuide(k),provided=String(options?.providedGuide||'');
      lines.push(provided?guide.split('\n').filter(function(line){return !provided.includes(line);}).join('\n'):guide);
    });
    if(p.methods.includes('ootk'))lines.push('【OOTK成稿優先規則】即使原題只有一問，仍須逐一標出第一至第五輪的新增判斷、支持、反證及對前輪的修正，再給最可能傾向、次可能傾向、最強支持鏈、最強反證、成立條件、推翻條件、時間依據或不能給時間、可執行行動、已知／推論／未知界線及信心來源。只讀實際有效輪次；不因一般精簡篇幅規則略去任何有效輪次。第四輪須整合完整36張環牌故事，第五輪須收斂可持續結果。');
    if(p.reportScope.fullChart){
      lines.push('【全盤作答覆蓋】本次明示全盤或未填單題，須完整處理本法有效結構及人生面向；不能只給幾句總評，也不能把十二宮或全部牌位只當背景略過。');
      p.methods.forEach(function(k){lines.push(METHODS[k].name+'完整報告範圍：'+FULL_AREAS[k]);});
    }
    if(p.reportScope.annualRequested){
      lines.push('【逐年／逐期作答覆蓋】依實際列出的全部指定年度或運期逐項回答，不以十年摘要、重點年份或省略號替代。每列交代年度／年齡／所屬運期、議題、偏利／偏阻／混合及條件、象徵影響程度、具體盤面依據、關注事項和行動；程度是議題牽動集中度，不是事件機率。');
      if(p.reportScope.requestedDecades)lines.push('原問句明示前'+p.reportScope.requestedDecades+'個大限／大運；按本次實算起止順序逐期交代背景，逐年判不同落宮及作用，不能因相同年干套同一句。');
      lines.push('過去年份只給本人可核對的象徵主題，不宣稱已發生；未來依條件說可能表現。關鍵窗口給有據年段、吉凶傾向、影響領域及限制；缺資料只標缺少年度與層級，其餘照常完成。若訊息上限需要分段，明列已完成與待續年份，不能聲稱未寫的年度已分析。');
    }else if(p.reportScope.requestedDecades||p.reportScope.allDecades){
      lines.push('【逐期作答覆蓋】按本次指定'+(p.reportScope.requestedDecades?'前'+p.reportScope.requestedDecades+'個':'全部')+'大限／大運的實算起止逐期比較，交代議題、支持、反證、條件與行動。此題未要求逐年，依原題的比較或階段需求成稿；不要自行增加逐年清單。');
    }
    lines.push('【重要結論的落地】結論連到本次具體位置／組合與作用，說明最強支持、主要牽制、兩者如何同時存在、改判條件及針對當事人的做法；各面向與關鍵窗口各有依據，不以同一組吉凶概括全部。');
    lines.push('正文完成後，在選品與固定收尾之前簡短提醒：上述分析僅供研究或娛樂用途，屬傳統象徵解釋，不保證事件發生；醫療、法律及財務決策須結合實際資料與專業意見。');
    if(p.lifePurpose)lines.push('【使命／終身課題題型】只能依本次方法與資料提出象徵性的長期主題、反覆面對的選擇、可培養的能力及可採取的現階段行動；不得宣稱唯一使命、命定職業、必然人生遭遇或未提供的年齡階段與過往經歷。若本次只是單次短期牌／卦，只回答它能支持的當前課題，不延伸成完整人生時間線；本命盤或運限資料也只能支持相應尺度的傾向，不能取代本人經驗與現實選擇。');
    lines.push('【語義模型｜由原問句解析，供核對而非取代原句】');
    lines.push(JSON.stringify(p.questionModel));
    var contract=referenceContract(options);if(contract)lines.push(contract);
    var causalEvent=(p.questionModel.events||[]).find(function(e){return !!e.causalSituation;}),incident=causalEvent&&causalEvent.causalSituation;
    if(incident){
      lines.push('【本題已報告的具體事故與因果層次】');
      if(incident.contextSurface)lines.push('使用者報告的情境：'+incident.contextSurface);
      if(incident.mechanismSurface)lines.push('使用者報告的直接機制：'+incident.mechanismSurface);
      if(incident.outcomeSurface)lines.push('使用者報告的實際損失／結果：'+incident.outcomeSurface);
      if(incident.amountSurface)lines.push('使用者報告的金額：'+incident.amountSurface);
      if(incident.userFramingSurface)lines.push('使用者提出的事件解讀：'+incident.userFramingSurface);
      lines.push('請先直接回答已知事件的直接原因，再用本法實際盤面分析使用者追問的象徵意義、助力或可採取行動。區分已陳述的物理機制、牌／卦的傳統象徵解釋與尚未證實的超自然因果；前後發生不自動等於前者造成後者。不得把原題改寫成泛泛的運勢問題。');
    }
    lines.push('語義模型是原句的核對輔助，不取代原句或盤面；若模型列出未核實預設或詞義候選，保留其狀態並按下方說明處理。');
    (p.questionModel.events||[]).filter(function(e){return !!e.lexicalInterpretation;}).forEach(function(e){
      var meaning=e.lexicalInterpretation,selected=meaning.selectedInterpretation&&meaning.selectedLabel;
      lines.push('【原句多義詞】「'+meaning.surface+'」有多種候選：'+meaning.candidates.map(function(c){return c.label+'（'+c.scope+'）';}).join('；')+'。'+(selected?'本次暫採「'+meaning.selectedLabel+'」（'+(meaning.selectionBasis||'上下文線索')+'；使用者尚未確認），正文需標示這是暫定讀法，並說明改採其他候選會改變答案的哪一層。':'上下文未能選定，本次須保留會實質改變答案的候選，逐一指出各自能判到哪裡；不可暗中選義。'));
    });
    (p.questionModel.events||[]).filter(function(e){return !!e.recurrenceContext;}).forEach(function(e){lines.push('【重現／延續措辭】原句「'+(e.recurrenceCue||e.recurrenceContext.surfaceCue)+'」可暗示同類經驗或機會曾存在，但目前未核實（priorOccurrenceVerified=false）。不可稱為已發生；若會改變答案，只能寫成提問者用語或明確標示的待確認前提。');});
    var timedAction=(p.questionModel.events||[]).find(function(e){return e.queryOperator==='relative_timing'&&(e.actionSequence||[]).length>0;});
    if(timedAction){
      var timingFocusLabel={willingness_onset:'意願何時形成',action_onset:'指定行動何時開始',invitation_onset:'邀約何時發出',event_occurrence:'明示事件何時發生'}[timedAction.timingTarget]||'明示行動的時間';
      lines.push('【明確行動的時間題】這題問的是「'+timingFocusLabel+'」：先直接給本方法實際支持的相對階段或時間範圍，再沿盤面說明從準備／意願到邀約安排、實際行動的承接與卡點。只在盤面提供日曆依據時才給日期；否則清楚說可判到哪個階段。');
      if(timedAction.explicitSexualAct)lines.push('【親密行動層次】分開對方意願、邀約／安排與實際性行為發生時間；對方位象徵不能替代當事人的明確、無壓力且可撤回的同意。依本次盤面回答已能支持的層次，沒有證據的層次直接指出缺口。');
    }
    var listed=(p.questionModel.events||[]).filter(function(e){return e.queryOperator==='enumeration_guidance';});
    listed.forEach(function(e){
      lines.push('【開放列舉題】原句要求列出「'+(e.requestedItems||'相關事項')+'」'+(e.attentionFocus?'，重點是「'+e.attentionFocus+'」':'')+'；這是待回答的項目清單，不可因句尾「嗎」改成只答是／否。'+(e.truthGate?'原句另有明示的成立與否門檻，需先逐項回應後再回答該門檻。':'本題沒有額外的是非門檻。')+'只列本次方法與實際資料能支撐的內容；若所問是方法無法識別的具體現實項目，明說界線，再給可直接查核的下一步。');
    });
    if(p.methods.length>1)lines.push('各法先獨立形成切題判斷，再說明一致或矛盾的原因；同源資料不作多數投票。');
    if(p.healthExam){
      lines.push('【健康檢查能力邊界】本題按原句暫解為「公司安排的員工健康檢查」；語義模型仍保留「公司經營／營運檢視」候選，正文須說明這是依「體檢／要我注意」的暫定判讀，不能把它寫成已確認事實。命理不能推斷會查出什麼病、哪個器官有問題、實際檢查項目、數值或報告結果；不得把牌／卦轉寫成健康警訊清單。直接回答能判到的態度或準備方向；實務上先看公司或診所的正式檢查通知與禁食／用藥說明，拿到報告後向醫療人員核對異常項目。若使用者其實問公司營運，請回到原句候選改按工作／商業方法解讀。');
    }else if(p.domains.includes('health')){
      lines.push('本題有明示健康情境：先回答可以採取的照顧或求助行動，再以盤面反思溝通、負荷或選擇；醫療行動來自現實狀況與醫療資料，盤面不能確定病程、藥物或照顧者造成病情。');
      if(p.bipolarMention)lines.push('就使用者提到的躁鬱症提供照顧方向：若近期狀況改變，及早聯絡原精神科團隊；可詢問是否願意一起整理睡眠、服藥與行為變化。陪同回診、傾聽及照顧者休息是可做的事，藥物調整交由醫師。若疑似躁期、嚴重憂鬱或有即時傷害危險，需緊急專業評估，不能等固定聊天時段。這些是醫療指引的實務建議，不是從牌抽出的治療；急促消息或象徵速度不等於臨床快速循環。參考：NIMH https://www.nimh.nih.gov/health/publications/bipolar-disorder 及 NICE CG185 https://www.nice.org.uk/guidance/cg185/ （本地參考於2026-09-24核對；不宣稱接收提示詞的AI本輪已查網）。');
    }
    if(p.domains.includes('finance'))lines.push(incident?'本題提到財物損失，但語境不是賣場經營數據；按已報告的事故作答，不自行轉成收入、營業額或投資判斷。金額是使用者報告值，不是命理推算。':'財務部分先給本題經營／取捨方向，現實成敗再核對收入、成本、現金流和風險；沒有資料的數字不由象徵換算。');
    if(p.domains.includes('legal'))lines.push('法律部分分開盤面象義與實際程序；處理方式須核對文件、所在地規則及專業意見，不能由命理保證裁判結果。');
    return lines.join('\n');
  }
  var MEMORY_BOUNDARY='【本次資料與記憶邊界】本次只使用這份提示詞明列的原問題、排盤／抽取事實、條件與提問者本次提供的背景。不得引用、調用或暗中依賴帳號記憶、個人檔案、其他對話、先前占卜或先前生成的結論；不得用記憶補缺、推定人物身分、關係、事件或偏好。若本題需要舊資料，只有該資料在本提示詞中重列才可使用；未列明者一律視為未知，指出資料缺口，依本次資料回答。';
  var SHARED_JSON='【完整共用JSON字串｜讀取前還原】';
  function compactLegacyReferences(source){
    var text=String(source),counts=new Map(),definitions=[],index=new Map(),spans=[],stack=[],tokens=/"(?:[^"\\]|\\[\s\S])*"|[{}\[\]]/g;
    if(text.length<140000||text.includes(SHARED_JSON))return text;
    function candidate(start,end){var literal=text.slice(start,end);if(literal.length<160)return;try{JSON.parse(literal);}catch(_){return;}counts.set(literal,(counts.get(literal)||0)+1);spans.push({start:start,end:end,literal:literal});}
    for(var match of text.matchAll(tokens)){
      var token=match[0];if(token[0]==='"'){candidate(match.index,match.index+token.length);continue;}
      if(token==='{'||token==='[')stack.push({token:token,start:match.index});
      else{var open=stack.pop();if(open&&(open.token==='{'&&token==='}'||open.token==='['&&token===']'))candidate(open.start,match.index+1);else stack=[];}
    }
    var pieces=[],cursor=0;
    spans.sort(function(a,b){return a.start-b.start||b.end-a.end;}).forEach(function(span){
      if(span.start<cursor||counts.get(span.literal)<2)return;
      if(!index.has(span.literal)){var n=definitions.length+1,ref;do{ref='〔JY共用原文'+n+++'〕';}while(text.includes(ref)||definitions.some(function(d){return d.ref===ref;}));definitions.push({ref:ref,literal:span.literal});index.set(span.literal,JSON.stringify(ref));}
      pieces.push(text.slice(cursor,span.start),index.get(span.literal));cursor=span.end;
    });
    if(!definitions.length)return text;
    var encoded=pieces.join('')+text.slice(cursor)+'\n\n'+SHARED_JSON+'\n'+JSON.stringify(definitions);
    return encoded.length<text.length?encoded:text;
  }
  function expandLegacyReferences(source){
    var text=String(source),at=text.lastIndexOf('\n\n'+SHARED_JSON+'\n');if(at<0)return text;
    var start=at+SHARED_JSON.length+3,end=text.indexOf('\n',start),definitions;try{definitions=JSON.parse(text.slice(start,end<0?undefined:end));}catch(_){return text;}
    if(!Array.isArray(definitions)||!definitions.every(function(d){return d&&typeof d.ref==='string'&&typeof d.literal==='string';}))return text;
    var index=new Map(definitions.map(function(d){return [JSON.stringify(d.ref),d.literal];}));
    return text.slice(0,at).replace(/"(?:[^"\\]|\\[\s\S])*"/g,function(literal){return index.get(literal)||literal;})+(end<0?'':text.slice(end));
  }
  function finish(prompt,options){
    if(root.JYPromptPacket)return root.JYPromptPacket.finish(prompt,options);
    var text=String(prompt||'');
    if(!text.trim())return text;
    var current=plan(options),at=text.lastIndexOf('【共用判讀版本】'+VERSION),existing=at<0?'':text.slice(at);
    if(text.trimEnd().endsWith(FOOTER)&&existing.includes('原問句（原文資料）：'+JSON.stringify(current.question))&&existing.includes('有效方法：'+current.methods.map(function(k){return METHODS[k].name;}).join('、')+'。'))return text.trimEnd();
    // Only the exact application-owned final footer is moved; no source facts
    // or user-entered substrings are stripped or deduplicated.
    var task=render(Object.assign({},options,{providedGuide:text}));
    if(text.trimEnd().endsWith('\n\n'+task+'\n\n'+FOOTER))return text.trimEnd();
    var end=text.lastIndexOf(FOOTER),tail=end>=0&&text.slice(end+FOOTER.length).trim()==='';
    var body=tail?text.slice(0,end).trimEnd():text.trimEnd();
    return compactLegacyReferences(body)+'\n\n'+(body.length>=140000?'如資料含「'+SHARED_JSON+'」，先以每列literal原樣替換JSON內被引號包住的ref，再解析原盤；這是完整字串編碼，沒有刪除盤面事實。\n':'')+task+'\n\n'+(tail?FOOTER:'');
  }
  // This is a small, explicit copy of actual facts for answer verification.
  // It is never a new chart, a verdict, or a replacement for reading data.
  function factSnapshot(method,chart,analysis){
    var c=chart||{},a=analysis||{},copy=function(v){return v==null?null:JSON.parse(JSON.stringify(v));};
    var out={method:method,partial:!!a.coverage?.provisional};
    if(method==='bazi'){
      out.dayMaster=c.dm||c.dayMaster||null;
      out.pillars=Object.fromEntries(['year','month','day','hour'].filter(function(k){return c.pillars?.[k]&&!(k==='hour'&&out.partial);}).map(function(k){var p=c.pillars[k];return [k,typeof p==='string'?p:p.gan+p.zhi];}));
    }else if(method==='ziwei'){
      out.palaces=out.partial?[]:(c.palaces||[]).map(function(p){return {name:p.name,branch:p.branch,gan:p.gan,isShen:!!p.isShen,stars:(p.stars||[]).map(function(s){return {name:s.name,type:s.type};})};});
      out.sihua=copy(c.sihua||[]);out.selfHua=copy(c.selfHua||[]);
      out.decades=(c.daXian||[]).map(function(d){return {ageStart:d.ageStart,ageEnd:d.ageEnd,branch:d.branch,hua:copy(d.hua)};});
    }else if(method==='astro'||method==='vedic'){
      out.planets=Object.fromEntries(Object.entries(c.planets||{}).map(function(pair){var p=pair[1];return [pair[0],{sign:p.sign,signName:p.signName,house:p.house??null}];}));
      out.unknownTime=!!c.input?.unknownTime;
    }else if(method==='tarot'||method==='lenormand'){
      var d=c.tarotData||c;out.cards=(a.methodData?.records||d.cards||[]).map(function(p){return {name:p.name,id:p.id,position:p.position,direction:p.direction||null};});
    }else if(method==='liuyao'||method==='yijing'){
      out.movingPositions=(c.lines||[]).filter(function(l){return l.moving;}).map(function(l){return l.position;});
      out.original=copy(c.original);out.changed=copy(c.changed);
    }else if(method==='meihua'){
      out.body=copy(c.tiG);out.use=copy(c.yoG);out.movingPosition=c.dongYao??c.movingLine??null;
    }else if(method==='liuren'){
      out.transmissions=(c.transmissions||[]).map(function(t){return {branch:t.branch,general:t.general,kinship:t.kinship};});
    }else if(method==='name'){
      out.names=(c.names||[c]).filter(function(p){return p.name;}).map(function(p){return {name:p.name,grids:(p.fiveGrids?.grids||[]).map(function(g){return {role:g.role,num:g.num};})};});
    }else if(method==='compat'){
      out.people=['personA','personB'].filter(function(k){return c[k];}).map(function(k){return {label:k==='personA'?'A':'B',name:c[k].name||null,unknownTime:!!c[k].unknownTime};});
    }else if(method==='oracle'){
      out.number=c.n??c.number;out.poem=c.p??c.poem??a.methodData?.poem;
    }else if(method==='ootk'){
      out.completed=copy(a.methodData?.completed||[]);
    }else if(method==='personality'){
      out.code=c.code;out.axes=(c.axes||[]).map(function(p){return {left:p.left,right:p.right,rightSelected:p.rightSelected};});
    }
    return out;
  }
  function verificationFacts(entries,question,sections){
    var scope=reportScope(question,entries[0]?.method),years=[];
    (sections||[]).forEach(function(s){
      if(s.data?.requestedYears)years.push.apply(years,s.data.requestedYears);
      if(s.data?.annualSegments)years.push.apply(years,s.data.annualSegments.map(function(y){return y.year;}));
    });
    return {schema:'jy.reading-facts/1',version:VERSION,fullChart:scope.fullChart,
      annualRequested:scope.annualRequested,
      requiredYears:scope.annualRequested?Array.from(new Set(years)).sort(function(a,b){return a-b;}):[],
      charts:entries.map(function(e){return Object.assign({label:e.label||null},factSnapshot(e.method,e.chart,e.analysis));})};
  }
  function readVerificationFacts(options){
    var source=String(options.sourcePrompt||''),m=source.match(/【原盤事實核對】\s*\n([^\n]+)/);
    if(m){try{
      var parsed=JSON.parse(m[1]),valid=parsed.schema==='jy.reading-facts/1'&&Array.isArray(parsed.charts)&&parsed.charts.every(function(c){
        if(!c||typeof c!=='object'||!METHODS[c.method])return false;
        if(c.method==='bazi'&&(c.dayMaster!=null&&typeof c.dayMaster!=='string'||!c.pillars||typeof c.pillars!=='object'))return false;
        if(c.method==='ziwei'&&(!Array.isArray(c.palaces)||!c.palaces.every(function(p){return p&&typeof p.name==='string'&&/^(?:命|兄弟|夫妻|子女|財帛|疾厄|遷移|交友|官祿|田宅|福德|父母)宮?$/.test(p.name)&&Array.isArray(p.stars)&&p.stars.every(function(s){return s&&typeof s.name==='string';});})||!Array.isArray(c.sihua)||!c.sihua.every(function(h){return h&&typeof h.star==='string'&&typeof h.hua==='string';})))return false;
        return true;
      })&&Array.isArray(parsed.requiredYears)&&parsed.requiredYears.every(Number.isInteger);
      if(valid)return {facts:parsed,status:'available'};
    }catch(_){}return {facts:null,status:'invalid-source'};}
    var e=options.evidence||{};
    if(e.pillars||e.dayMaster)return {facts:{charts:[{method:'bazi',pillars:e.pillars||{},dayMaster:e.dayMaster}],requiredYears:e.requiredYears||[]},status:'available'};
    return {facts:null,status:'source-required'};
  }
  function reviewFacts(options,issue){
    var read=readVerificationFacts(options),facts=read.facts,answer=String(options.answer||''),checked=0;
    if(read.status==='invalid-source')issue('INVALID_FACT_SOURCE','error','原盤事實核對資料不完整或格式無效，請貼回完整原始提示詞。');
    if(!facts)return {status:read.status,checks:0};
    var bazi=facts.charts.filter(function(c){return c.method==='bazi'&&!c.label;}),ziwei=facts.charts.filter(function(c){return c.method==='ziwei'&&!c.label;});
    var sentences=answer.split(/[。！？!?\n]/),nonClaim=/(?:如果|假如|假設|假设|不是|並非|而非|錯寫|誤寫|誤稱|錯誤|錯盤|錯在|不能|不可|不得|不代表|不等於|例如|舉例|未抽到|未出現)/;
    function mismatch(code,actual,expected,s){checked++;if(actual!==expected)issue(code,'error','答案與原盤不一致：'+actual+'；原盤為'+expected+'。',s);}
    sentences.forEach(function(s){
      if(nonClaim.test(s))return;
      var relations=s.matchAll(/([木火土金水])(生|克)([木火土金水])/g);
      for(var r of relations){var table=r[2]==='生'?{木:'火',火:'土',土:'金',金:'水',水:'木'}:{木:'土',火:'金',土:'水',金:'木',水:'火'};mismatch('ELEMENT_RELATION_MISMATCH',r[0],r[1]+r[2]+table[r[1]],s);}
      if(bazi.length===1&&!/(?:大運|流年|流月|流日|流時|對方|另一人)/.test(s)){
        var b=bazi[0],dm=s.match(/(?:日主|日元)\s*(?:是|為|为|[:：=])\s*([甲乙丙丁戊己庚辛壬癸])/);
        if(dm&&b.dayMaster)mismatch('DAY_MASTER_MISMATCH',dm[1],b.dayMaster,s);
        for(var p of s.matchAll(/(年柱|月柱|日柱|時柱|时柱)\s*(?:是|為|为|[:：=])\s*([甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥])/g)){
          var key={年柱:'year',月柱:'month',日柱:'day',時柱:'hour',时柱:'hour'}[p[1]],expected=b.pillars?.[key];
          if(expected)mismatch('PILLAR_MISMATCH_'+key,p[2],typeof expected==='string'?expected:expected.gan+expected.zhi,s);
        }
      }
      if(ziwei.length===1&&!/(?:大限|流年|流月|流日|流時|借星|借對|借入|會照|三方|對宮|飛入)/.test(s)){
        var z=ziwei[0];
        (z.palaces||[]).forEach(function(p){
          var short=p.name.replace(/宮$/,''),re=new RegExp('(?:本命|原局|你的|命主的)?'+short+'宮(?:的)?(?:主星|坐星)\\s*(?:是|為|为|[:：=])\\s*([^，,；;。\\n]+)'),m=s.match(re);
          if(!m)return;var major=(p.stars||[]).filter(function(t){return t.type==='major';}).map(function(t){return t.name;}),known=['紫微','天機','太陽','武曲','天同','廉貞','天府','太陰','貪狼','巨門','天相','天梁','七殺','破軍'];
          known.filter(function(t){return m[1].includes(t);}).forEach(function(t){checked++;if(!major.includes(t))issue('NATAL_STAR_MISMATCH_'+short,'error','本命'+short+'宮主星引用錯誤：'+t+'；原盤為'+(major.join('、')||'主星空宮')+'。',s);});
        });
        (z.sihua||[]).forEach(function(h){var re=new RegExp('(?:生年.{0,4}'+h.star+'|'+h.star+'.{0,4}生年)(?:化)?([祿權科忌])'),m=s.match(re);if(m)mismatch('NATAL_HUA_MISMATCH_'+h.star,m[1],h.hua.replace('化',''),s);});
      }
    });
    if(facts.fullChart&&ziwei.length===1&&!ziwei[0].partial){
      var missing=(ziwei[0].palaces||[]).filter(function(p){return !answer.includes(p.name.replace(/宮$/,'')+'宮');}).map(function(p){return p.name;});
      if(missing.length)issue('PALACE_COVERAGE','revision','全盤報告尚未逐宮涵蓋：'+missing.join('、')+'。');
    }
    if(facts.requiredYears?.length){
      var missingYears=facts.requiredYears.filter(function(y){return !new RegExp('(?:^|\\n)[\\s|#•・*\\-]*(?:[0-9]+[.)]\\s*)?'+y+'(?:年|[\\s|（(])').test(answer);});
      if(missingYears.length)issue('YEAR_COVERAGE','revision','逐年報告缺少獨立年度列：'+missingYears.join('、')+'；原題範圍不得以十年摘要替代。');
    }
    return {status:'explicit-facts-checked',checks:checked,scope:'只核可辨識的明示原盤事實、生克與作答覆蓋；不是完整語義裁決或預測命中驗證。'};
  }
  function reviewOOTK(options){
    var source=String(options.sourcePrompt||''),answer=String(options.answer||''),issues=[];
    function issue(code,message){issues.push({code:code,severity:'revision',message:message,excerpt:''});}
    var marker=source.match(/【OOTK成稿契約】\s*\n([^\n]+)/),contract=options.ootkContract||null;
    if(!contract&&marker)try{contract=JSON.parse(marker[1]);}catch(_){}
    if(!contract){issue('OOTK_SOURCE_REQUIRED','需要本次完整OOTK原始提示詞，才能核對有效輪次及成稿內容。');return issues;}
    var expected=contract.expectedLayers||[],blocks=[];
    if(!expected.length){if(/(?:牌面顯示|盤面最支持|盤面較支持|最終會|必然)/.test(answer))issue('OOTK_STOPPED_CAST_INTERPRETED','本次沒有有效可讀輪次，不能從無效牌面形成方向性占斷。');return issues;}
    var heading=/^[ \t]*(?:#{1,6}\s*)?(?:[-*+]\s+|[一二三四五\d]+[.)、]\s*)?(?:\*\*)?(?:【)?(?:第([一二三四五1-5])(?:輪|層|次操作)|op([1-5]))/gmi,match;
    while((match=heading.exec(answer))){var numeral=match[1]||match[2],index='一二三四五'.indexOf(numeral)+1;if(!index)index=Number(numeral);blocks.push({operation:'op'+index,start:match.index,end:heading.lastIndex});}
    expected.forEach(function(key){
      var at=blocks.findIndex(p=>p.operation===key);
      if(at<0){issue('OOTK_LAYER_MISSING_'+key,'缺少'+key+'的獨立逐層判讀；須交代新增判斷、支持、反證及對前輪的修正。');return;}
      var block=answer.slice(blocks[at].end,at+1<blocks.length?blocks[at+1].start:answer.length);
      var anchor=(contract.evidenceAnchors||[]).find(p=>p.operation===key),normalized=block.replace(/[\s\p{P}]/gu,'');
      function mentioned(name){return name&&name!=='未記錄'&&normalized.includes(String(name).replace(/[\s\p{P}]/gu,''));}
      if(anchor){
        var named=(anchor.cards||[]).filter(mentioned),available=(anchor.cards||[]).filter(n=>n&&n!=='未記錄');
        if(new Set(named).size<Math.min(2,new Set(available).size))issue('OOTK_LAYER_ANCHOR_'+key,key+'只有抽象證據名稱，須引用本輪實際牌與作用關係，不能以「計數支持」替代盤面分析。');
        if(anchor.significator&&anchor.significator!=='未記錄'&&!mentioned(anchor.significator)&&!/(?:代表牌|significator)/i.test(block))issue('OOTK_SIGNIFICATOR_'+key,key+'忽略了代表牌在本輪的狀態及作用。');
        if(key==='op4'){
          var countNames=(anchor.countingCards||[]).filter(n=>n&&n!=='未記錄');
          if(countNames.filter(mentioned).length<Math.min(3,countNames.length))issue('OOTK_RING_COUNT_ANCHORS','第四輪未引用足夠的實際計數節點形成故事；不能只選一兩張關係牌。');
          if((anchor.pairs||[]).length&&!(anchor.pairs||[]).some(p=>p.every(mentioned)))issue('OOTK_RING_PAIR_ANCHOR','第四輪沒有使用任何完整的實際配對，須比較配對故事與計數主線。');
        }
      }
      if(!/(?:依據|支持|計數|配對|尊貴|落宮|落域|牌鏈|牌組|生命樹|環牌)/.test(block))issue('OOTK_LAYER_EVIDENCE_'+key,key+'未交代可核對的本輪結構依據。');
      if(!/(?:反證|限制|牽制|阻力|但|然而|不足)/.test(block))issue('OOTK_LAYER_COUNTER_'+key,key+'未說明本輪最強反證或限制。');
      if(key!=='op1'&&!/(?:前輪|前一|上一|承接|延續|加強|削弱|轉向|推翻|修正|收斂)/.test(block))issue('OOTK_LAYER_CHANGE_'+key,key+'未說明如何承接或修正前輪。');
      if(key==='op4'&&(!/(?:環牌|36|三十六)/.test(block)||!/(?:計數|牌鏈)/.test(block)||!/配對/.test(block)||!/(?:尊貴|元素)/.test(block)||!/(?:多數|同階)/.test(block)))issue('OOTK_RING_STORY','第四輪須交代完整環牌主線、計數、配對、尊貴及多數觀察如何共同形成故事。');
      if(key==='op5'&&!/(?:收斂|最終|結果|持續)/.test(block))issue('OOTK_RESULT_CONVERGENCE','第五輪尚未形成結果收斂或持續條件。');
    });
    var normalizedBlocks=blocks.filter(p=>expected.includes(p.operation)).map(function(p,i){var next=blocks.find(b=>b.start>p.start);return answer.slice(p.end,next?next.start:answer.length).replace(/[\s\p{P}]/gu,'');});
    if(normalizedBlocks.some(function(text,i){return text&&normalizedBlocks.indexOf(text)<i;}))issue('OOTK_REPEATED_LAYER','多輪內容完全重複，須說明不同輪次的實際新增作用或前輪被推翻的理由。');
    var first=answer.split(/\n\s*\n/)[0]||'';
    if(/(?:無法|不能).{0,18}(?:知道|證實|判斷|回答)|心意未知|只能.{0,15}現實/.test(first)&&!/(?:較支持|最支持|最可能|盤面傾向|盤面較|偏向|兩種方向|相持)/.test(first))issue('OOTK_SAFETY_ONLY','主答案只交代未知或不能證實，須先回答盤面最支持的方向性推論。');
    if(expected.length===5){
      for(const [code,re,label]of [
        ['MOST_LIKELY',/最可能|最支持|主判|主要傾向/,'最可能傾向'],['ALTERNATIVE',/次可能|次要傾向|替代解釋|另一種解釋/,'次可能傾向'],
        ['SUPPORT',/最強支持|支持鏈/,'最強支持鏈'],['COUNTER',/最強反證/,'最強反證'],['CONDITION',/成立條件/,'成立條件'],
        ['FALSIFIER',/推翻條件|改判條件|會推翻|應改判/,'推翻條件'],['TIME',/時間|時窗|曆日|應期/,'時間依據或不能給時間的界線'],
        ['ACTION',/行動|下一步|建議先|可執行/,'可執行行動'],['BOUNDARY',/已知.*推論.*未知|盤面事實|事實與推論/,'已知、推論與未知界線'],['CONFIDENCE',/信心|置信|確定度/,'信心来源']
      ])if(!re.test(answer))issue('OOTK_'+code+'_MISSING','缺少'+label+'。');
    }
    if(/(?:第一|第二|第三|第四|第五)(?:輪|層).{0,15}(?:等於|就是|代表|＝).{0,10}(?:下個月|[一二三四五]月)/.test(answer))issue('OOTK_FALSE_CALENDAR','五輪被硬套成固定月份，須改用程序層次。');
    if(/女祭司.{0,20}(?:所以|因此|代表).{0,18}(?:無法回答|停止分析|不再判讀)/.test(answer))issue('OOTK_PRIESTESS_STOP','女祭司被用來終止判讀，須整合第五輪其他有效作用。');
    answer.split(/[。！？\n]/).forEach(function(sentence){if(!/(?:不能|不得|不代表|並非|不是|未必|不一定)/.test(sentence)&&/(?:她|他|對方|主管).{0,12}(?:一定|肯定|必然).{0,12}(?:喜歡|愛你|討厭|想要|想跟|願意|看不起|欣賞)/.test(sentence))issue('OOTK_SYMBOL_AS_FACT','第三方心意被宣稱為確定事實，須改成有五輪依據的方向性推論。');});
    if(/(?:physicalOrientation|ootkInverted|significatorInverted).{0,30}(?:三個|三項|兩個).{0,10}(?:負面|反證)/.test(answer))issue('OOTK_ALIAS_DOUBLE_WEIGHT','同一朝向別名被重複作負面反證。');
    return issues;
  }
  function review(options){
    options=options||{};
    var p=plan(options),answer=String(options.answer||'').trim(),evidence=options.evidence||{},issues=[];
    function issue(code,severity,message,excerpt){if(!issues.some(function(i){return i.code===code;}))issues.push({code:code,severity:severity,message:message,excerpt:excerpt||''});}
    if(!answer){issue('EMPTY_ANSWER','error','請貼上實際答案。');return {version:VERSION,status:'needs_revision',issues:issues,semanticVerification:'not_performed'};}
    var factVerification=reviewFacts(options,issue);
    var paragraphs=answer.split(/\n\s*\n/).filter(Boolean),first=paragraphs[0],sentences=answer.match(/[^。！？!?\n]+[。！？!?]?/g)||[];
    if(/(?:先看|先核|鏡射|鏡像|\d\s*[↔→]\s*\d|中心.{0,8}(?:位置|牌)|本次牌陣)/.test(first)&&!/(?:你可以先|建議你先|優先.{0,12}(?:做|聯絡|安排|確認))/.test(first))issue('METHOD_FIRST','revision','開頭以技法說明代替答案；先寫本題主判或第一步。',first);
    var methodStarts=paragraphs.filter(function(x){return /^(?:先看|再看|接著看|開頭的|牌面上|鏡射|鏡像|中心牌|第[一二三四五六七八九十\d]+[張宮爻])/.test(x);}).length;
    if(methodStarts>=3)issue('METHOD_TOUR','revision','多段按技法或位置報盤；改成每段先解答，再提供必要依據。');
    function affirmative(s){return !/(?:不能|不可|不代表|不等於|無法|沒有證據|並非|不是|不得|不應|不宜|未必)/.test(s);}
    sentences.forEach(function(s){
      if(affirmative(s)&&/(?:你們的|你們之間的|你的|對話).{0,35}(?:確實|本來就|正是|造成|導致|放大器)/.test(s)&&!/(?:如果|假如|若|可能|你提到|你描述)/.test(s))issue('UNSUPPORTED_CAUSAL_STORY','review','這句把未提供的互動或因果寫成事實；請對照使用者原文核實。',s);
      if(affirmative(s)&&/(?:騎士|鳥|雲|星曜|星盤|牌面|命盤|八字|卦象).{0,65}(?:符合|代表|顯示|證明|就是).{0,60}(?:躁鬱|快速循環|疾病|發病|病情|情緒變化)/.test(s))issue('SYMBOL_AS_CLINICAL_EVIDENCE','error','象徵被當作病情或臨床現象的證據；改以實際症狀與專業評估處理。',s);
      if(affirmative(s)&&/(?:唯一|真正).{0,30}(?:資源|關鍵).{0,20}(?:你|自己)|(?:你|自己).{0,25}唯一.{0,15}(?:資源|關鍵)/.test(s))issue('SOLE_RESPONSIBILITY','review','唯一責任或資源的說法缺少依據；確認是否排除了醫療或其他支持。',s);
      if(affirmative(s)&&/木生火|乙生丁/.test(s)&&/天生|付出|添柴|反感|壓力/.test(s))issue('ELEMENT_AS_RELATIONSHIP_FACT','error','日主相生被直接換成付出或感受；回到兩方原局與現實互動。',s);
      if(affirmative(s)&&/(?:化祿|合局|六合|正官|食神).{0,20}(?:證明|一定|必然).{0,20}(?:愛|願意|忠誠|信任|結婚)/.test(s))issue('SYMBOL_AS_PERSONAL_FACT','error','吉象不能證明特定人的意願或忠誠，須重做相關結論。',s);
      if(affirmative(s)&&/(?:機率|概率|成功率|準確率).{0,12}\d+(?:\.\d+)?\s*[%％]/.test(s))issue('INVENTED_PROBABILITY','review','請核對此機率的資料與算法，不能由吉凶計票產生。',s);
    });
    if(p.domains.includes('health')&&p.bipolarMention){
      if(!/(?:精神科|醫師|醫療團隊|治療團隊|回診)/.test(answer))issue('CLINICAL_SUPPORT_MISSING','revision','明示病情改變的照顧題，需交代如何聯絡原精神科或治療團隊。');
      if(/(?:如果|若|等).{0,100}(?:更明顯|失控|惡化|無效).{0,130}(?:精神科|醫療|治療|專業評估)/s.test(answer)&&!/(?:及早|儘早|盡早|現在|先).{0,22}(?:聯絡|聯繫|回診|就醫)/.test(answer))issue('CARE_DELAY','error','求助被放在失控或日常溝通無效之後；病情改變應及早聯絡治療團隊。');
    }
    if(p.methods.includes('lenormand')&&Array.isArray(evidence.cards)){
      var names=evidence.cards.map(function(c){return typeof c==='string'?c:c.name;});
      var all=['騎士','幸運草','船','房屋','樹','雲','蛇','棺材','花束','鐮刀','鞭子','鳥','小孩','狐狸','熊','星星','鸛','狗','塔','花園','山','道路','老鼠','心','戒指','書','信','紳士','淑女','百合','太陽','月亮','鑰匙','魚','錨','十字架'];
      var missing=all.filter(function(n){return !names.includes(n)&&new RegExp(n+'(?:牌|→|↔)|(?:→|↔)'+n).test(answer);});
      if(missing.length)issue('CARD_NOT_IN_CAST','error','答案引用了未出現在本次牌面的牌：'+missing.join('、'));
      if(evidence.spread==='five'&&!names.every(function(n){return answer.includes(n);}))issue('LINE_MEMBER_OMITTED','review','五張線有牌未被點出；核對全線主判是否仍有處理該牌作用，不要求逐張各寫一段。');
    }
    if(evidence.birthTimeUnknown===true&&/(?:你的|命主)(?:上升|命宮|身宮).{0,8}(?:在|是|為)/.test(answer))issue('UNKNOWN_TIME_ANGLE','error','未知時辰卻使用確定上升／命身宮；須核對來源。');
    if(evidence.status==='stopped'&&/(?:牌面顯示|結果牌|最終會|必然)/.test(answer))issue('STOPPED_CAST_INTERPRETED','error','未完成的程序被當成有效事件占斷。');
    if(p.methods.includes('ootk')&&evidence.status!=='stopped')reviewOOTK(options).forEach(function(i){issue(i.code,i.severity,i.message,i.excerpt);});
    if(!answer.includes(FOOTER))issue('SHOP_FOOTER','revision','補回指定可點擊賣場連結與祝福，保持最後兩行。');
    else if(!answer.endsWith(FOOTER))issue('SHOP_ORDER','revision','將連結與祝福放在整篇最後兩行。');
    if(evidence.status!=='stopped'&&evidence.valid!==false){
      var prose=answer.split(FOOTER).join('');
      if(!/(?:白水晶|粉晶|紫水晶|黃水晶|茶晶|綠幽靈|髮晶|黑曜石|月光石|海藍寶|瑪瑙|虎眼石|青金石|天鐵|龍宮舍利|(?:素色|黑色|白色|綠色|藍色|編繩|木珠).{0,35}手鍊)/.test(prose)||!/手鍊/.test(prose))issue('BRACELET_SELECTION_MISSING','revision','補上一款具體手鍊及佩戴者，引用本題有效盤面並連到可行行動；不能只寫一般水晶提醒。');
      if(!/(?:靜月之光|蝦皮|賣場).{0,35}(?:挑|選|找|看看|逛)|(?:挑選|選購|看看|找找).{0,35}(?:靜月之光|蝦皮|賣場)/.test(prose))issue('SHOP_INVITATION_MISSING','revision','選品理由之後補自然邀請到指定賣場挑選相應設計，不捏造庫存或价格。');
    }
    if(/(?:黑曜石|茶晶|白水晶|粉晶|紫水晶|黃水晶).{0,6}或.{0,6}(?:黑曜石|茶晶|白水晶|粉晶|紫水晶|黃水晶)/.test(answer))issue('UNSELECTED_PRODUCT','revision','尚未選出一個主項；說明佩戴者、單一設計及它提醒的行動。');
    if(/手鍊|水晶|黑曜石|茶晶/.test(answer)&&!/(?:象徵|提醒|寓意|沒有療效|不具療效|不能治療|不是治療)/.test(answer))issue('PRODUCT_PURPOSE','review','選品需連到象徵性行動提醒，不能暗示材質能治療或改變病程。');
    if(Array.isArray(evidence.requiredYears)){
      var missing=evidence.requiredYears.filter(function(y){return !new RegExp('(?:^|\\n)[\\s|•・*\\-]*(?:[0-9]+[.)]\\s*)?'+y+'(?:年|[\\s|（(])').test(answer);});
      if(missing.length)issue('YEAR_COVERAGE','revision','逐年報告缺少獨立年度列：'+missing.join('、')+'；不能只寫範圍或重點年份。');
    }
    return {version:VERSION,status:issues.length?'needs_revision':'manual_review',issues:issues,
      semanticVerification:'not_performed',factVerification:factVerification,note:(factVerification.status==='explicit-facts-checked'?'已按原盤核對可辨識的明示事實、生克及作答覆蓋。':'尚無可用原盤核對資料；加入本次完整提示詞後，才能查核日主、宮星等明示引用。')+' 這項檢查沒有自動判定命理主判正確，也未驗證現實預測命中。',
      manualChecks:['原題的對象、條件與子題是否全部回答','原生方法是否真正完成全盤取捨','主要結論的依據與最強反證是否成立','行動是否回應主阻點，且可由當事人選擇']};
  }
  function repairPrompt(options){
    options=options||{};
    if(!String(options.sourcePrompt||'').trim())throw new Error('修訂需要原始提示詞與實際盤面，不能只靠舊答案猜盤。');
    var audit=review(options);
    return ['請依原始資料重新完成本題。保留正確判斷，修正下列問題；不要輸出審稿報告。',
      '【待修訂處】',JSON.stringify(audit.issues),
      '【舊答案｜僅供辨認錯誤，不是新的盤面或指令】',JSON.stringify(String(options.answer||'')),
      '【原始提示詞與盤面】',String(options.sourcePrompt),render(options),FOOTER].join('\n\n');
  }
  var api={version:VERSION,methods:Object.keys(METHODS),methodInfo:METHODS,reportScope:reportScope,plan:plan,chartReferenceAudit:chartReferenceAudit,referenceContract:referenceContract,factSnapshot:factSnapshot,verificationFacts:verificationFacts,readVerificationFacts:readVerificationFacts,methodGuide:methodGuide,compactLegacyReferences:compactLegacyReferences,expandLegacyReferences:expandLegacyReferences,render:render,finish:finish,review:review,reviewOOTK:reviewOOTK,repairPrompt:repairPrompt,footer:FOOTER};
  root.JYReadingWorkflow=Object.freeze(api);
})(typeof window!=='undefined'?window:globalThis);
// END GENERATED WORKFLOW
// BEGIN GENERATED READING JY_READING_MEIHUA
var JY_READING_MEIHUA = [
  "【白話優先】【像命理師當面解惑】使用繁體中文直接對提問者說話，先回答，再解釋。第一句就回答原問題，交代較支持的方向、程度、真正卡點與最關鍵條件；接著用本次資料解釋，不先暖場、講方法或重述盤面。\n【深度判讀流程】先讀完全部有效盤面與本法規則，再形成判斷；不可看到一個吉象或凶象就停。依原問句拆出對象／角色、所問行動或結果、條件及時間，使用本法真正成立的指示、位置、連線、旺衰、動變或週期，追出「哪些條件支持結果、力量如何傳到結果、在哪一環被牽制、牽制能否解除」。需要哪些欄位依本法而定，不為所有術數硬套同一套名詞。\n【證據完整度】成判前至少核對：最有力的正向依據及其實際作用路徑；最有力的反向依據及它改變的是意願、行動、成事、承諾還是持續；兩者是否談同一人物、層次與時間；若結論要改變，會是哪個可核條件。相同來源或重複出現的訊號只算一次，背景訊號不冒充當期觸發，方法規則不冒充本次證據。依據相持時只保留真正未定的一層，不把已能判斷的部分一起說成模糊。替代讀法只在會實質改變答案時提出。\n【分清層次】好感／情緒、意願、同意、決定、實際行動、事件發生、承諾與持續不能互相代答；多方情境逐一確認角色，沒有角色依據的對象保留未指認。問題若涉及親密互動，盤面不代替任何人的明確、無壓力且可撤回的同意。具體情境未由使用者提供時，以「若實際出現…」作核對，不能寫成已發生。\n【深度來自完整推理，不靠字數】先用本法核完所有與原題有關的實際位置、組合、旺衰、動變、週期或來源，再挑出會改變答案的訊號。把證據連成清楚路徑：什麼支持結果、力量如何傳遞、在哪一環受阻、哪個條件能解除或加重阻礙；說明最強反證限制的是哪一層。若某環節沒有資料，指出缺口及其影響，不用泛泛術語填補。只輸出整理後的判斷與可核理由，不展示隱藏思考過程。\n【篇幅由問題決定】單一問題可直截回答；有多個角色、條件、時間層、比較方案或盤面矛盾時，補足各自會改變主判的分析，數量依本題需要。不要為了縮短漏掉必要因果，也不要為了顯得深入而抄盤、堆術語或重複同一訊號。每段都要增加新的判斷、證據作用或現實做法。\n【列舉題與詞義分流】『有哪些／哪幾項／有什麼問題要注意』是開放列舉，即使句尾有『嗎』也先回答使用者要知道的類別；只有原句明確提出會不會、有沒有、是否等門檻時，才另加是非判斷。若詞義候選會改變答案，查看語義模型的候選、選取依據與未確認狀態：可按清楚的上下文作暫定解讀，但必須標出仍待確認之處；上下文不足時保留兩種實質不同的答案，不可暗中選一種或停在抽象的不確定。\n【題目能力邊界】先辨認使用者真正要的事實層與方法能支持的層次。若方法不能回答精確的現實項目，就明說缺少哪種資料，再回答最近的可用問題與下一個核實步驟；不得以更多術語或牌數填補缺口。健康檢查題尤其不能由命理推斷疾病、器官、實際檢查項目、異常數值或報告結果；可給檢查前核對官方指示、取得並詢問正式報告等具體步驟。\n把可核對的排盤／抽取事實、傳統方法的解釋、對個案的推論分清楚；背景、當期觸發、條件走向分層。象徵不證明病情、他人心念或事件；醫療、法律、財務行動另依現實資料與專業依據。沒有資料支持的機率、確切事件或精確日期不可自造。\n答案要落到現實：方法題給可直接採取的第一步，結構題指出關鍵循環，決策題用相同標準，時間題只給本方法支持的精度；具體指出什麼行為／條件會支持、削弱或改變判斷，並收尾給可執行做法或觀察指標，以及可觀察的驗證訊號或檢查點。若自行設定追蹤期限，須明說那是實務檢查點，不是術數推得的日期。\n命理判斷是依本次方法和資料形成的象徵性推論，不能保證客觀準確；信心描述證據的集中度與限制，不換算成事件機率。主觀滿意回饋只代表使用感受，不能單獨驗證預測。",
  "【方法參考：供判讀，不是正文清單】只啟用本次有資料的方法；輸出依上述規則，方法說明不另設回答格式。",
  "【梅花：體用與本互變】核起卦法、保存時間、上下卦及動爻；動爻所屬經卦為用，另一卦為體。互卦上下與變後用卦都對原體，原體不重新設立。",
  "用生體、體生用、體克用、用克體、比和，配起卦節令旺衰看助力、付出、掌握、約束與協力是否有力，不能只數吉凶。",
  "本卦讀局勢，互卦讀中間牽動，動爻與變卦讀關鍵轉折；爻辭、類象和實際外應依本次起法與情境。正文用改變答案的轉折串成故事，不固定分五段講卦理。",
  "應期須有明示方法與時間尺度；實務檢查日與預測分開。一卦的本互變不是不同方案的各自抽卦，也不是多份獨立證據。",
  "【梅花判讀主線】以體的節令力量看當事人能否承擔，以用對體的實際生克判外在事情如何作用；體克用偏向需要自己掌握，體生用偏向投入耗力，用生體偏向有助力，用克體偏向受約束，比和偏向可協力，成色再由旺衰與全卦修正。先給目前宜推進、調整或等待的主判。",
  "互卦找過程中哪一端增加支持或負擔，變後的用對原體則看關鍵轉折後條件改善還是加重。將本、互、變連成「起初可用條件—中途關卡—調整後方向」，再以切題爻辭或已提供外應定位做法，交代要先解決哪件現實事情。",
  "【梅花深入體用與動變】先核實際起卦、原體用、節令旺衰和動爻，再讀本卦、互卦、動變如何改變原條件；原體用角色不能在每一步任意交換。生剋是象徵作用，不是任何人的情緒或意願。",
  "分清體的承受、用的要求、互卦中間條件及變卦後續成本；生體也需能承接，克體須審旺衰及救應。全部相關卦氣先核完，再選真正改變答案的路徑。",
  "完整卦例按本、互、動、變回答全部子題，給進退與實務檢查點；應期須有明確起例和尺度。本次短期卦不擴成一生年表。"
];
// END GENERATED READING JY_READING_MEIHUA
// BEGIN GENERATED RECOMMENDATION JY_REC_MEIHUA
var JY_REC_MEIHUA = "【本題延伸手鍊建議】有效解讀完成後須接上本段。手鍊建議放在分析與行動之後，以一小段自然對話推薦一款具體手鍊，說清佩戴者、材質或設計，理由須引用本次一項有效盤面發現，連到提問者真正面對的需要與可採取的行動；選品規則不得影響前面的占卜判斷，不先選商品再反推需求，不承諾療效、改運、復合等結果。不可為導購加重凶象、製造恐懼。命理取象不代表礦物有療效。不把五行／星盤象徵說成身體實際缺少某種礦物。若無材質或偏好依據，明說是象徵性提醒，不捏造使用者偏好；不捏造商品庫存、價格、成分、產地或認證。若提問者提到預算吃緊或暫不想購買，先用現有物件承載同一提醒。依上述理由自然邀請到靜月之光蝦皮賣場挑選相應設計，不可只說「挑喜歡的水晶」。全文最後兩行實際輸出指定賣場連結與祝福。無有效盤面或程序停止時說明缺項，不做命理選材。\n【本法選材提醒】\n梅花：依本互變、體用與旺衰連到本次應對；不把卦象當成終身八字喜忌。";
// END GENERATED RECOMMENDATION JY_REC_MEIHUA
/*! meihua-standalone.js — 靜月之光 梅花易數獨立流程  [v3.0.0]
 *  v3.0.0(2026/9/4)：提示詞保留本互變、體用旺衰、動爻、類象與應期資料，改由 AI 自身易學知識綜合判讀。
 *  v80.39(2026/6/12)：分享卡補爻線——payload 加 lines（本卦＝下上卦 li 串接、互卦取2-4/3-5爻、
 *    變卦＝動爻翻轉，與 calcMH 同式）與 dong；配合 share-card v2.2 直繪六爻卦象。
 *  v80.38(2026/6/12 歐那)：實測第二輪回饋三項根治——
 *    ①蝦皮連結改「犧牲行」結構：網址倒數第二行、最後固定一句收尾話墊後。兩輪實測輸出末端都黏不可見
 *      Unicode（U+2060 等），文獻證實為 AI 生成/渲染/剪貼簿管線副產物、提示詞原理上攔不住；雜訊永遠黏在
 *      輸出最末端，故網址不可當末行——收尾句當犧牲行吃掉雜訊，網址行保持乾淨可點。
 *    ②生剋力道：體克用/體生用補「用旺衰」雙向分支（鐵律③明言體用都要看，原版這兩支只看體；
 *      本輪實測「體囚剋用旺」只標出體弱、漏了用旺加重費勁）。
 *    ③動爻爻位參考行（《繫辭傳下》：初難知/二多譽/三多凶/四多懼/五多功/上易知）——實測輸出
 *      跳過動爻層位不讀，根因是資料區沒給；資料直給＋鐵律⑧納入主線。
 *  v80.37(2026/6/12 歐那)：應期正統化＋體用原文定性——
 *    ①應期參考《占卦訣》：先核實本卦中是否實見生體或克體三爻，再列相應卦氣候選；不直接換算現實日期。
 *      分開給最近窗，另給「用近／互中／變遠」層次；廢除「用卦五行→季節」應期法（非原典，僅保留為事情節奏參考）。
 *    ②鐵律②吉凶定性對齊《體用總訣》原文：體剋用＝諸事吉（原「小吉」會系統性壓低吉度）、用剋體＝諸事凶、
 *      體生用＝耗失之患、用生體＝進益之喜、比和＝百事順遂；鐵律⑦改吃資料區吉應／敗應、禁自創應期算法。
 *    ③生剋力道行中性化：移除「該收手別再貼」等預下結論句（曾與變卦轉好行互相打架），結論統一由鐵律合成。
 *    ④蝦皮連結改「獨立成行＋末字雙保險」（實測輸出曾在網址後黏不可見字元致連結失效；複製模式無法程式後處理，僅能強化指令）。
 *  v80.34(2026/6/10)：防線統一——⑩補盤外資訊禁令、選石補嚴禁並列（與八字/紫微同步，紫微未設防實測曾全面復發）
 *  v80.33(2026/6/10)：①互卦對體生剋資料行（體用總訣「他卦者，謂用互變也」——原本只給互卦名、要 AI 自己算，這次實測就漏了）②最近應期窗（斷占總訣寅卯木…辰戌丑未土，節氣近似換月）③完整性清單加「正文無指令字眼」④fallback 註解誠實化
 *  歐那 2026/6/6：梅花要跟雷諾曼一樣，自成一頁、乾淨、不出現其他入口、無多餘說明，並有自己的過場動畫。
 *  做法：完全比照 lenormand.js 的「自包覆獨立頁 + 組好提示詞複製去 AI」模式。
 *  引擎：直接呼叫既有全域 calcMH()（meihua_upgrade.js 已載入），不重造起卦邏輯。
 *  起卦法：時間起卦（預設，需 Lunar.Solar）／數字起卦（報上下數，加當下時辰定動爻）。
 *  只需部署本檔 + ui.js（_meihuaOpen 改接本檔）+ index.html（掛 script + 版本號）。
 */
(function () {
  'use strict';

  var GOLD = '#c9a84c';
  // 八卦顯示（先天序 1乾…8坤 對應 calcMH gByN）；符號供過場動畫用
  var BAGUA_SYM = ['☰','☱','☲','☳','☴','☵','☶','☷'];
  var BAGUA_NAME = ['乾','兌','離','震','巽','坎','艮','坤'];

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

  // 用神（用卦）五行 → 事情節奏（v80.37 正統化：只定快慢性質、不再給應期月份——
  // 應期月份照《占卦訣》「事應於生體卦氣之日、敗於剋體卦氣之日」另行計算）
  var WX_TIMING = {
    木:'事情走「成長／推進」的節奏，速度中快',
    火:'事情走「曝光／情緒／主動」的節奏，速度快',
    土:'事情走「穩定／拖延／承擔」的節奏，速度慢',
    金:'事情走「決斷／切割／壓力」的節奏，速度中等',
    水:'事情走「流動／變數／等待」的節奏，速度慢'
  };

  var _mhWrap = null;
  var _mhPhase = 'input';   // input | result
  var _mhMethod = 'time';   // time | num | char
  var _mhQuestion = '';
  var _mhUpNum = '';        // 數字起卦：上數
  var _mhLoNum = '';        // 數字起卦：下數
  var _mhText = '';         // 漢字起卦：中文字
  var _mhResult = null;     // calcMH 回傳
  var _lastPrompt = '';
  var _castEpoch = 0;

  // ════════════════════════════════════════════════════════
  //  容器 + CSS（命名空間 mhx-，自帶不依賴 style.css）
  // ════════════════════════════════════════════════════════
  function _getWrap() {
    if (_mhWrap) return _mhWrap;
    _mhWrap = document.createElement('div');
    _mhWrap.id = 'mhx-screen';
    _mhWrap.style.cssText = 'display:none;position:fixed;top:0;left:0;right:0;bottom:0;width:100%;height:100%;z-index:99999;overflow-y:auto;overflow-x:hidden;background:#0a0a0f;-webkit-overflow-scrolling:touch;';
    document.body.appendChild(_mhWrap);
    var css = document.createElement('style');
    css.textContent = [
      '#mhx-screen *{box-sizing:border-box}',
      '.mhx-container{max-width:480px;margin:0 auto;padding:1rem .8rem 3rem;font-family:"Noto Serif TC",Georgia,serif;color:#e8e0d0}',
      '.mhx-header{text-align:center;padding:1.5rem 0 1rem}',
      '.mhx-header h1{font-size:1.5rem;color:'+GOLD+';letter-spacing:8px;margin-bottom:.3rem}',
      '.mhx-header p{font-size:.75rem;color:rgba(232,224,208,.5);letter-spacing:2px}',
      '.mhx-back{color:rgba(232,224,208,.5);text-decoration:none;font-size:.82rem;display:inline-block;margin-bottom:.5rem;cursor:pointer}',
      '.mhx-section{background:#13131a;border:1px solid rgba(201,168,76,.15);border-radius:14px;padding:1.1rem;margin-bottom:.8rem}',
      '.mhx-section-title{font-size:.82rem;color:'+GOLD+';margin-bottom:.7rem}',
      '.mhx-q-input{width:100%;padding:.65rem;border-radius:10px;border:1px solid rgba(201,168,76,.3);background:rgba(255,255,255,.03);color:#e8e0d0;font-family:inherit;font-size:.85rem;resize:none;outline:none;line-height:1.6}',
      '.mhx-q-input::placeholder{color:rgba(232,224,208,.4)}',
      '.mhx-q-input:focus{border-color:rgba(201,168,76,.5);box-shadow:0 0 12px rgba(201,168,76,.1)}',
      '.mhx-method-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:.4rem}',
      '.mhx-method-btn{padding:.6rem .4rem;border-radius:10px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.03);color:rgba(232,224,208,.5);cursor:pointer;transition:all .2s;text-align:center;font-family:inherit;font-size:.82rem}',
      '.mhx-method-btn.active{border-color:rgba(201,168,76,.5);background:rgba(201,168,76,.08);color:'+GOLD+'}',
      '.mhx-num-row{display:grid;grid-template-columns:1fr 1fr;gap:.5rem;margin-top:.7rem}',
      '.mhx-num-row input{width:100%;padding:.6rem;border-radius:10px;border:1px solid rgba(201,168,76,.3);background:rgba(255,255,255,.03);color:#e8e0d0;font-family:inherit;font-size:.95rem;text-align:center;outline:none}',
      '.mhx-num-row input:focus{border-color:rgba(201,168,76,.5)}',
      '.mhx-char-row{margin-top:.7rem}',
      '.mhx-char-row input{width:100%;padding:.6rem;border-radius:10px;border:1px solid rgba(201,168,76,.3);background:rgba(255,255,255,.03);color:#e8e0d0;font-family:inherit;font-size:1rem;text-align:center;outline:none;letter-spacing:2px}',
      '.mhx-char-row input:focus{border-color:rgba(201,168,76,.5)}',
      '.mhx-hint{font-size:.7rem;color:rgba(232,224,208,.45);margin-top:.6rem;line-height:1.6;text-align:center}',
      '.mhx-cast-btn{display:block;width:100%;padding:.85rem;border-radius:12px;border:1.5px solid rgba(201,168,76,.5);background:linear-gradient(135deg,rgba(201,168,76,.12),rgba(201,168,76,.04));color:'+GOLD+';font-family:inherit;font-size:.95rem;font-weight:600;letter-spacing:4px;cursor:pointer;transition:all .3s;margin-top:.8rem}',
      '.mhx-cast-btn:active{transform:scale(.97)}',
      // 卦象顯示
      '.mhx-gua-row{display:grid;grid-template-columns:repeat(3,1fr);gap:.5rem;margin:.4rem 0 .2rem}',
      '.mhx-gua{border:1px solid rgba(201,168,76,.22);border-radius:12px;background:linear-gradient(145deg,rgba(30,25,15,.9),rgba(20,15,10,.95));padding:.6rem .35rem;text-align:center;animation:mhxIn .45s ease-out both}',
      '@keyframes mhxIn{from{opacity:0;transform:translateY(12px) scale(.92)}to{opacity:1;transform:none}}',
      '.mhx-gua .role{font-size:.6rem;color:rgba(232,224,208,.45);letter-spacing:1px}',
      '.mhx-gua .gname{font-size:1.05rem;color:#ffeab8;font-family:"Noto Serif TC",serif;margin:.15rem 0 .05rem;line-height:1.2}',
      '.mhx-gua .gel{font-size:.62rem;color:'+GOLD+'}',
      '.mhx-ty{margin-top:.7rem;padding:.7rem .8rem;border-radius:11px;border:1px solid rgba(201,168,76,.2);background:rgba(201,168,76,.04);text-align:center}',
      '.mhx-ty .rel{font-family:"Noto Serif TC",serif;font-size:1rem;color:'+GOLD+';letter-spacing:2px}',
      '.mhx-ty .luck{display:inline-block;margin-left:.4rem;font-size:.72rem;padding:1px 8px;border-radius:999px;background:rgba(201,168,76,.15);color:#ffeab8}',
      '.mhx-ty .luck.bad{background:rgba(239,138,138,.14);color:#ef9a9a}',
      '.mhx-ty .desc{font-size:.74rem;color:rgba(232,224,208,.6);margin-top:.35rem;line-height:1.55}',
      '.mhx-dong{text-align:center;font-size:.7rem;color:rgba(232,224,208,.5);margin-top:.5rem}',
      // AI 卡（比照雷諾曼）
      '.mhx-ai-card{background:linear-gradient(135deg,rgba(30,25,15,.95),rgba(20,15,8,.98));border:1px solid rgba(201,168,76,.3);border-radius:14px;padding:1rem;margin-top:1rem;text-align:center;animation:mhxIn .6s ease-out}',
      '.mhx-ai-title{font-size:.95rem;color:'+GOLD+';letter-spacing:3px;margin-bottom:.5rem}',
      '.mhx-ai-desc{font-size:.72rem;color:rgba(232,224,208,.5);line-height:1.6;margin-bottom:.7rem}',
      '.mhx-ai-copy-btn{display:block;width:100%;padding:.75rem;border-radius:12px;border:1.5px solid rgba(201,168,76,.5);background:linear-gradient(135deg,rgba(201,168,76,.12),rgba(201,168,76,.04));color:'+GOLD+';font-family:inherit;font-size:.88rem;font-weight:600;letter-spacing:3px;cursor:pointer;transition:all .3s;margin-bottom:.5rem}',
      '.mhx-ai-copy-btn:active{transform:scale(.97)}',
      '.mhx-ai-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:.3rem;margin:.5rem 0}',
      '.mhx-ai-sc{display:flex;flex-direction:column;align-items:center;gap:.2rem;padding:.35rem .1rem;border-radius:10px;border:1px solid rgba(255,255,255,.06);background:rgba(255,255,255,.02);cursor:pointer;transition:all .2s;font-family:inherit}',
      '.mhx-ai-sc:active{transform:scale(.91)}',
      '.mhx-ai-sc img{width:30px;height:30px;border-radius:8px}',
      '.mhx-ai-sc span{font-size:.55rem;color:rgba(232,224,208,.5);font-weight:600}',
      '.mhx-ai-foot{font-size:.6rem;color:rgba(232,224,208,.4);margin-top:.3rem;font-style:italic}',
      '.mhx-reset-btn{display:inline-block;padding:.45rem 1rem;border-radius:10px;border:1px solid rgba(255,255,255,.1);background:transparent;color:rgba(232,224,208,.5);cursor:pointer;font-family:inherit;font-size:.78rem;margin-top:.8rem}',
      '.mhx-footer{text-align:center;font-size:.6rem;color:rgba(232,224,208,.4);margin-top:1.5rem;letter-spacing:1px;line-height:1.8}',
      // ── 起卦過場動畫 ──
      '.mhx-load{position:fixed;inset:0;z-index:100000;display:flex;flex-direction:column;align-items:center;justify-content:center;background:radial-gradient(120% 90% at 50% 30%,rgba(46,36,12,.5),rgba(12,9,5,.97) 62%,#0a0704 100%);overflow:hidden}',
      '.mhx-stars{position:absolute;inset:0;pointer-events:none;overflow:hidden}',
      '.mhx-stars i{position:absolute;bottom:-6%;width:2px;height:2px;border-radius:50%;background:rgba(212,175,55,.7);box-shadow:0 0 6px rgba(212,175,55,.6);animation:mhxRise var(--d,5s) linear var(--dl,0s) infinite;opacity:0}',
      '@keyframes mhxRise{0%{transform:translateY(0) scale(.6);opacity:0}12%{opacity:.9}88%{opacity:.7}100%{transform:translateY(-108vh) scale(1);opacity:0}}',
      '.mhx-ring{position:relative;width:min(300px,80vw);aspect-ratio:1;display:flex;align-items:center;justify-content:center;opacity:0;transform:scale(.9);animation:mhxRingIn .7s cubic-bezier(.16,1,.3,1) forwards}',
      '@keyframes mhxRingIn{to{opacity:1;transform:scale(1)}}',
      // 八卦環的八個符號
      '.mhx-tri{position:absolute;left:50%;top:50%;font-size:1.5rem;color:rgba(212,175,55,.4);font-family:serif;transform:translate(-50%,-50%) rotate(var(--a)) translateY(calc(min(150px,40vw) * -1)) rotate(calc(var(--a) * -1)) scale(.6);opacity:0;animation:mhxTri .5s ease forwards;animation-delay:var(--td,0s);text-shadow:0 0 10px rgba(212,175,55,.4)}',
      '@keyframes mhxTri{to{opacity:1;transform:translate(-50%,-50%) rotate(var(--a)) translateY(calc(min(150px,40vw) * -1)) rotate(calc(var(--a) * -1)) scale(1)}}',
      // 中央太極
      '.mhx-taiji{width:96px;height:96px;border-radius:50%;position:relative;opacity:0;animation:mhxTaijiIn .9s ease .6s forwards,mhxSpin 7s linear 1.1s infinite;background:conic-gradient(from 0deg,#f4ecd6 0deg 180deg,#1a140a 180deg 360deg);box-shadow:0 0 40px rgba(212,175,55,.45),inset 0 0 20px rgba(0,0,0,.4)}',
      '@keyframes mhxTaijiIn{to{opacity:1}}',
      '@keyframes mhxSpin{to{transform:rotate(360deg)}}',
      '.mhx-taiji::before,.mhx-taiji::after{content:"";position:absolute;left:50%;width:48px;height:48px;border-radius:50%;transform:translateX(-50%)}',
      '.mhx-taiji::before{top:0;background:#f4ecd6}',
      '.mhx-taiji::after{bottom:0;background:#1a140a}',
      '.mhx-taiji span{position:absolute;left:50%;width:16px;height:16px;border-radius:50%;transform:translateX(-50%);z-index:2}',
      '.mhx-taiji span.y{top:16px;background:#1a140a}',
      '.mhx-taiji span.n{bottom:16px;background:#f4ecd6}',
      '.mhx-load-status{margin-top:1.6rem;font-family:"Noto Serif TC",serif;font-size:1.05rem;font-weight:700;color:'+GOLD+';letter-spacing:.12em;text-shadow:0 2px 14px rgba(0,0,0,.6);transition:opacity .3s;min-height:1.4rem;text-align:center}',
      '.mhx-load-sub{margin-top:.4rem;font-size:.74rem;color:rgba(212,175,55,.55);letter-spacing:.08em;transition:opacity .3s;min-height:1.1rem;text-align:center}'
    ].join('\n');
    document.head.appendChild(css);
  // ═══ 鎏金夜祭 v2（2026/6/18）：主 CTA 採靜態鎏金底＋transform-only 獨立流光層，避免 Android/Samsung 對 background-position 動畫漏畫按鈕 ═══
  try{var _g2=document.createElement('style');_g2.setAttribute('data-jy-gilt2','meihua');_g2.textContent='.mhx-section{background:linear-gradient(180deg,rgba(24,20,14,.78),rgba(14,12,9,.86));border:1px solid rgba(201,168,76,.2);border-radius:18px;box-shadow:0 18px 40px rgba(0,0,0,.45),inset 0 1px 0 rgba(245,231,184,.14);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px)}.mhx-section-title{position:relative;padding-left:12px;letter-spacing:.08em;color:#e8d28a}.mhx-section-title::before{content:"";position:absolute;left:0;top:50%;transform:translateY(-50%);width:3px;height:1.05em;border-radius:2px;background:rgba(154,184,122,.9);box-shadow:0 0 8px rgba(154,184,122,.9)}.mhx-q-input,.mhx-section input,.mhx-section select,.mhx-section textarea{background:rgba(8,7,5,.62);border:1px solid rgba(201,168,76,.26);border-radius:12px;color:#f2e9d6;transition:border-color .2s,box-shadow .2s}.mhx-q-input:focus,.mhx-section input:focus,.mhx-section select:focus,.mhx-section textarea:focus{border-color:#e8d28a;box-shadow:0 0 0 3px rgba(201,168,76,.16);outline:none}.mhx-method-btn{background:rgba(201,168,76,.06);border:1px solid rgba(201,168,76,.22);color:#d8c79a;border-radius:12px;transition:color .18s,background-color .18s,border-color .18s,box-shadow .18s,transform .18s}.mhx-method-btn.active{background:linear-gradient(135deg,#e8d28a,#c9a84c);color:#171208;border-color:transparent;box-shadow:0 6px 18px rgba(201,168,76,.28);font-weight:700}.mhx-cast-btn{background:linear-gradient(135deg,#a98232 0%,#e8d28a 44%,#f5e7b8 58%,#c9a84c 100%);color:#171208;border:none;border-radius:14px;font-weight:800;letter-spacing:.14em;box-shadow:0 10px 26px rgba(201,168,76,.32),inset 0 1px 0 rgba(255,255,255,.35);position:relative;overflow:hidden;isolation:isolate}.mhx-cast-btn::before{content:none;display:none}.mhx-cast-btn:active{transform:translateY(1px)}.mhx-reset-btn{background:transparent;border:1px solid rgba(201,168,76,.34);color:#cdb87f;border-radius:12px}.mhx-back{color:rgba(232,210,138,.75)}.mhx-back:hover{color:#f5e7b8}.mhx-ai-card{background:linear-gradient(180deg,rgba(24,20,14,.78),rgba(14,12,9,.86));border:1px solid rgba(201,168,76,.2);border-radius:18px;box-shadow:0 18px 40px rgba(0,0,0,.45),inset 0 1px 0 rgba(245,231,184,.14);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px)}@supports not (backdrop-filter:blur(1px)){[data-jy-view-meihua]{}}.mhx-cast-btn:focus-visible{outline:2px solid #e8d28a;outline-offset:2px}';document.head.appendChild(_g2);}catch(e){}
    return _mhWrap;
  }

  // ════════════════════════════════════════════════════════
  //  畫面
  // ════════════════════════════════════════════════════════
  function _render() {
    var w = _getWrap();
    var savedScroll=w.getAttribute('data-flow-view')===_mhPhase?w.scrollTop:0;w.setAttribute('data-flow-view',_mhPhase);
    var h = '<div class="mhx-container">';
    h += '<nav class="at-room-nav" aria-label="頁面導覽"><button type="button" class="at-back mhx-back" onclick="' + (_mhPhase === 'input' ? '_meihuaClose()' : '_mhReset()') + '">← ' + (_mhPhase === 'input' ? '返回首頁' : '返回修改') + '</button>' + (_mhPhase !== 'input' ? '<button type="button" class="at-home-link" onclick="_meihuaClose()">首頁</button>' : '') + '<a class="at-room-shop" href="https://shopee.tw/a50h95648d?tab=shop" target="_blank" rel="noopener noreferrer">蝦皮選物 <span aria-hidden="true">↗</span></a></nav>';
    h += '<div class="mhx-header at-tool-header"><span class="at-art" data-art="meihua" aria-hidden="true"></span><div><span class="at-eyebrow">PLUM BLOSSOM I CHING</span><h1>梅花易數</h1><p>從本、互、變三象，梳理事情的進退。</p></div></div>';

    if (_mhPhase === 'input') {
      h += '<div class="at-flow-guide" aria-label="探索流程"><span><b>01</b> 整理問題</span><span><b>02</b> 選擇方式起卦</span><span><b>03</b> 探索解讀</span></div>';
      h += '<div class="mhx-section"><div class="mhx-section-title">✦ 你想問什麼？</div>';
      h += '<textarea class="mhx-q-input" id="mhx-q" aria-label="梅花易數想釐清的問題" rows="2" maxlength="200" placeholder="例如：這個案子推得動嗎？目前卡在哪一步？">' + _mhEscape(_mhQuestion) + '</textarea></div>';

      h += '<div class="mhx-section"><div class="mhx-section-title">✦ 起卦方式</div><div class="mhx-method-grid">';
      h += '<button class="mhx-method-btn' + (_mhMethod==='time'?' active':'') + '" onclick="_mhSetMethod(\'time\')">時間起卦<br><span style="font-size:.58rem;opacity:.6">以當下時間</span></button>';
      h += '<button class="mhx-method-btn' + (_mhMethod==='num'?' active':'') + '" onclick="_mhSetMethod(\'num\')">數字起卦<br><span style="font-size:.58rem;opacity:.6">報上下兩數</span></button>';
      h += '<button class="mhx-method-btn' + (_mhMethod==='char'?' active':'') + '" onclick="_mhSetMethod(\'char\')">漢字起卦<br><span style="font-size:.58rem;opacity:.6">中文字筆畫</span></button>';
      h += '</div>';
      if (_mhMethod === 'num') {
        h += '<div class="mhx-num-row"><input type="number" inputmode="numeric" id="mhx-up" aria-label="起卦上數" min="1" placeholder="上數" value="'+(_mhUpNum||'')+'"><input type="number" inputmode="numeric" id="mhx-lo" aria-label="起卦下數" min="1" placeholder="下數" value="'+(_mhLoNum||'')+'"></div>';
        h += '<div class="mhx-hint">心中默念所問，隨意各報一數（如 8、25），動爻以當下時辰定。</div>';
      } else if (_mhMethod === 'char') {
        h += '<div class="mhx-char-row"><input type="text" id="mhx-text" aria-label="起卦漢字" maxlength="20" placeholder="輸入中文字（如：問前途）" value="'+_mhEscape(_mhText)+'"></div>';
        h += '<div class="mhx-hint">心中默念所問，輸入中文字，以本站繁體筆畫法起卦：一字以筆畫為上卦、筆畫加時辰為下卦；二字各為上下卦，多字前少後多分上下卦，動爻再加時辰定。本法是現代延伸，非原典一字拆字法。</div>';
      } else {
        h += '<div class="mhx-hint">以此刻年月日時自動起卦（先天卦數＋時辰定動爻）。</div>';
      }
      h += '</div>';
      h += '<button class="mhx-cast-btn" onclick="_mhDoCast()">✦ 起 卦 ✦</button>';
    } else {
      var mh = _mhResult;
      if (_mhQuestion) h += '<div class="at-result-question"><span>你想釐清的事</span><p>' + _mhEscape(_mhQuestion) + '</p></div>';
      h += '<div class="mhx-section"><div class="mhx-section-title">✦ 卦象</div>';
      h += '<div class="mhx-gua-row">';
      h += _guaCell('本卦', mh.ben && mh.ben.n, (mh.up&&mh.up.el)+'／'+(mh.lo&&mh.lo.el));
      h += _guaCell('互卦', mh.hu && mh.hu.n, '過程線索');
      h += _guaCell('變卦', mh.bian && mh.bian.n, '後續趨勢');
      h += '</div>';
      h += '<div class="mhx-ty"><span class="rel">' + (mh.ty?mh.ty.r:'—') + '</span>';
      h += '<span class="luck">體用初判</span>';
      h += '<div class="desc">' + _mhEscape(_mhRelationNote(mh.ty && mh.ty.r)) + '</div></div>';
      h += '<div class="mhx-dong">體卦 ' + (mh.tiG?_mhEscape(mh.tiG.name||mh.tiG.n)+'（'+mh.tiG.el+'）':'') + ' ・ 用卦 ' + (mh.yoG?_mhEscape(mh.yoG.name||mh.yoG.n)+'（'+mh.yoG.el+'）':'') + ' ・ 動爻第 ' + (mh.dong||'?') + ' 爻</div>';
      h += '<div class="at-reading-note"><strong>把卦象放回你的問題</strong><p>體用先看助力與消耗；再合看時令旺衰、互卦的過程與變卦的後續。若訊號不同，先辨認條件如何改變，再決定下一步。</p></div>';
      h += '</div>';

      h += '<div class="mhx-ai-card"><div class="mhx-ai-title">🌙 AI 深度解讀</div>';
      h += '<div class="mhx-ai-desc">複製本次問題與卦象，貼到 AI 對話送出。提示詞會引導逐層解讀，整理你可採取的行動與需要觀察的變化。</div>';
      h += '<button class="mhx-ai-copy-btn" onclick="_mhCopy()">✦ 一鍵複製占卦提示詞 ✦</button>';
      h += '<div class="mhx-ai-grid">';
      for (var a=0;a<AI_LIST.length;a++) {
        var ai = AI_LIST[a];
        h += '<button class="mhx-ai-sc" onclick="_mhOpenAI(\''+ai.id+'\',\''+ai.url+'\',this)">';
        h += '<img src="ai-icons/ai-'+ai.id+'.png" alt="'+ai.name+'"><span>'+ai.name+'</span></button>';
      }
      h += '</div><div class="mhx-ai-foot">點擊 AI 按鈕 → 自動複製＋開啟 → 貼上送出</div></div>';
      h += '<div style="text-align:center;margin-top:.2rem"><button type="button" class="at-share-button" onclick="_meihuaShare()" style="padding:.72rem 1.5rem;border-radius:12px;border:1px solid rgba(201,168,76,.5);background:linear-gradient(135deg,rgba(201,168,76,.18),rgba(201,168,76,.05));color:#c9a84c;font-family:inherit;font-size:.92rem;font-weight:600;letter-spacing:1px;cursor:pointer">\uD83D\uDCE4 \u751F\u6210\u5206\u4EAB\u5361</button></div>';
      h += '<div style="text-align:center"><button class="mhx-reset-btn" onclick="_mhReset()">↺ 重新起卦</button></div>';
    }
    h += '<div class="mhx-footer">靜月之光 ・ jingyue.uk<br>梅花易數 ・ 體用占</div></div>';
    if(window.JYNativeAnalysis&&_mhPhase==='result'&&_mhResult)h+=window.JYNativeAnalysis.render('meihua',_mhResult);
    w.innerHTML = h;
    if (window.JY_ATELIER) window.JY_ATELIER.enhance(w);
    if (window.JYExperience && _mhResult && w.querySelector('.mhx-gua-row')) window.JYExperience.mountMeihua(w,_mhResult);
    w.scrollTop=savedScroll;
  }

  function _mhEscape(value) { return String(value||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }

  // Reader-facing paraphrases; raw engine relations remain intact in the prompt.
  // 梅花易數卷二：體用總訣、人事占、卦斷遺論。A single relation is not a final verdict.
  function _mhRelationNote(relation) {
    return {
      '比和': '體與用同五行，可先留意協調與共同基礎；是否能推進，仍看旺衰與互變。',
      '用生體': '用卦生助體卦，可先找出可運用的支持；也要確認助力能否持續、如何落實。',
      '體生用': '體卦向用卦付出，可先檢視投入與消耗；釐清能承擔的範圍及預期回應。',
      '用克體': '用卦對體卦形成制約，可先辨認壓力來源；把可調整的條件與暫時限制分開。',
      '體克用': '體卦對用卦具有制約方向，可先找出能主動調整的環節；實際掌握度仍看體卦強弱。'
    }[relation] || '體用關係尚待確認，請合看完整卦象與當下情境。';
  }

  function _guaCell(role, name, sub) {
    return '<div class="mhx-gua"><div class="role">' + role + '</div><div class="gname">' + (name||'？') + '</div><div class="gel">' + (sub||'') + '</div></div>';
  }

  // ════════════════════════════════════════════════════════
  //  起卦過場動畫（太極 + 八卦環）
  // ════════════════════════════════════════════════════════
  function _showLoading(done) {
    if (window.JYRitual) return window.JYRitual.play('meihua', {
      onComplete: done,
      onCancel: function(){}
    });
    if (typeof done === 'function') done();
  }

  // ════════════════════════════════════════════════════════
  //  起卦計算（呼叫全域 calcMH，不重造）
  // ════════════════════════════════════════════════════════
  function _shichen() {
    var nh = new Date().getHours();
    return Math.floor(((nh + 1) % 24) / 2) + 1; // 1=子…
  }

  function _castNumbers() {
    var now = new Date(), sc = Math.floor((now.getHours()+1)%24/2)+1;
    var context={method:_mhMethod,timestamp:now.toISOString(),localDate:now.getFullYear()+'-'+(now.getMonth()+1)+'-'+now.getDate(),utcOffsetMinutes:-now.getTimezoneOffset(),shichen:sc};
    if (_mhMethod === 'num') {
      var u = Number(_mhUpNum), l = Number(_mhLoNum);
      if (!Number.isSafeInteger(u) || !Number.isSafeInteger(l) || u < 1 || l < 1 || !Number.isSafeInteger(u+l+sc)) { alert('請各報一個可精確計算的正整數（上數、下數），不要輸入小數或文字。'); return null; }
      var up = u % 8 || 8, lo = l % 8 || 8, dong = (u + l + sc) % 6 || 6;
      context.upperNumber=u;context.lowerNumber=l;context.policy='報數加時法：上下數各除8取餘，動爻用上下原數加時辰除6；整除取8或6。';
      return { up: up, lo: lo, dong: dong, context:context };
    }
    // 時間起卦：需農曆換算。lunar-javascript 把 Solar 掛在 window.Solar（非 Lunar.Solar），兩者皆接受。
    var SolarLib = (window.Lunar && window.Lunar.Solar) || window.Solar;
    if (!SolarLib || typeof SolarLib.fromYmd !== 'function') {
      alert('時間起卦需要精準農曆換算尚未就緒，請改用「數字起卦」。');
      return null;
    }
    try {
      var solar = SolarLib.fromYmd(now.getFullYear(), now.getMonth()+1, now.getDate());
      var lunar = solar.getLunar();
      var lY = lunar.getYear(), lM = lunar.getMonth(), lD = lunar.getDay();
      var yzhi = ((lY - 4) % 12 + 12) % 12 + 1;
      var base = yzhi + Math.abs(lM) + lD;
      var up = base % 8 || 8, lo = (base + sc) % 8 || 8, dong = (base + sc) % 6 || 6;
      context.lunar={year:lY,month:lM,day:lD,yearBranchNumber:yzhi};
      context.policy='年月日時法：年支數＋農曆月日取上卦，再加時辰取下卦與動爻；閏月沿用本月數，採本地民用日期，未校正真太陽時。';
      return { up: up, lo: lo, dong: dong, context:context };
    } catch (e) {
      alert('起卦失敗，請改用「數字起卦」。');
      return null;
    }
  }

  // ── 漢字起卦：筆畫資料庫（自架 cnchar，避免外部 CDN 風險；只在用到時載入一次）──
  var _cncharReady = false, _cncharLoading = false, _cncharCbs = [];
  function _loadCnchar(cb) {
    if (_cncharReady) { cb(true); return; }
    _cncharCbs.push(cb);
    if (_cncharLoading) return;
    _cncharLoading = true;
    var V = '?v=20260606v80_20';
    function flush(ok){ _cncharLoading = false; _cncharReady = ok; _cncharCbs.forEach(function(f){ f(ok); }); _cncharCbs = []; }
    function fail(){ flush(false); }
    function register(){
      try { if (window.cnchar && window.cncharTrad && typeof window.cnchar.use === 'function') window.cnchar.use(window.cncharTrad); } catch (e) {}
      flush(!!(window.cnchar && typeof window.cnchar.stroke === 'function'));
    }
    function inject(src, ok, err){ var s = document.createElement('script'); s.src = src; s.async = true; s.onload = ok; s.onerror = err; document.body.appendChild(s); }
    function loadTrad(){ if (window.cncharTrad) { register(); } else { inject('JS/cnchar.trad.min.js' + V, register, fail); } }
    if (window.cnchar && window.cnchar.stroke) { loadTrad(); }
    else { inject('JS/cnchar.min.js' + V, loadTrad, fail); }   // 先載基礎，再載繁體筆畫，全自架可快取
  }

  // 漢字起卦（字占）：依先天卦數，以「繁體筆畫」起卦。async：用到時才載入筆畫庫。
  function _castChar(cb) {
    var raw = (_mhText || '').trim();
    var chars = raw.match(/[\u4e00-\u9fa5\u3400-\u4dbf]/g); // 只取中文字（含擴展A）
    if (!chars || !chars.length) { alert('請先輸入中文字（漢字起卦）。'); cb(null); return; }
    var now = new Date(), sc = Math.floor((now.getHours()+1)%24/2)+1;
    function compute() {
      try {
        if (!window.cnchar || typeof window.cnchar.stroke !== 'function') return null;
        var arr = window.cnchar.stroke(chars.join(''), 'array'); // 每字繁體筆畫（已註冊 cncharTrad）
        if (!arr || arr.length!==chars.length || arr.some(function(n){return !Number.isSafeInteger(n)||n<=0;})) return null;
        var total = 0; for (var i=0;i<arr.length;i++) total += arr[i];
        if (!total) return null;
        var up, lo;
        if (arr.length === 1) {
          // 一字難分：以筆畫為上卦，筆畫＋時辰為下卦（本站一字加時變體）
          up = arr[0] % 8 || 8;
          lo = (arr[0] + sc) % 8 || 8;
        } else {
          // 多字：字數均分，少一字為上卦、多一字為下卦（前半上、後半下）
          var upCount = Math.floor(arr.length / 2);
          var upSum = 0, loSum = 0;
          for (var j=0;j<arr.length;j++){ if (j < upCount) upSum += (arr[j]||0); else loSum += (arr[j]||0); }
          up = upSum % 8 || 8;
          lo = loSum % 8 || 8;
        }
        var dong = (total + sc) % 6 || 6; // 動爻：總筆畫加時辰
        return { up: up, lo: lo, dong: dong, context:{method:'char',timestamp:now.toISOString(),utcOffsetMinutes:-now.getTimezoneOffset(),shichen:sc,characters:chars.join(''),strokes:arr.slice(),totalStrokes:total,policy:arr.length===1?'本站一字加時變體：筆畫取上卦、筆畫加時辰取下卦和動爻；不冒充原書的一字左右拆字法。':'本站多字筆畫法：前少後多分上下卦，總筆畫加時辰取動爻；以本次 cnchar 繁體筆畫為準，不混稱康熙筆畫。'} };
      } catch (e) { return null; }
    }
    _loadCnchar(function(ok){
      if (!ok) { alert('漢字起卦所需的筆畫資料庫載入失敗，請改用「時間起卦」或「數字起卦」。'); cb(null); return; }
      var r = compute();
      if (!r) { alert('漢字筆畫解析失敗，請改用時間或數字起卦。'); cb(null); return; }
      cb(r);
    });
  }

  // ════════════════════════════════════════════════════════
  //  提示詞（組好複製去 AI；遵循 ai-divination 鐵律）
  // ════════════════════════════════════════════════════════
  // 八卦萬物類象（說卦＋梅花斷例常用；推具體人事物）
  var GUA_XIANG = {
    '乾':'天、君、父、長輩官貴、頭、剛健、金玉珠寶、圓、西北',
    '兌':'澤、少女、口舌言談、喜悅、毀折缺損、巫醫、飲食、西',
    '離':'火、日、中女、文書契約、光明美麗、心目、電、分離、南',
    '震':'雷、長男、動、足、驚恐、車馬、急躁、生發、東',
    '巽':'風、長女、入、生意利市、繩直、進退不定、草木、東南',
    '坎':'水、中男、險陷、盜、暗昧、耳、智謀、勞苦、北',
    '艮':'山、少男、停止阻隔、手、徑路、穩重保守、東北',
    '坤':'地、母、眾人、順從、腹、方、柔弱吝嗇、布帛田土、西南'
  };

  function _mhTrig(g){ return g ? ((g.name||'') + (g.nat?('('+g.nat+')'):'') + (g.el?('·'+g.el):'')) : '？'; }

  // v3：只提示問題焦點，讓 AI 依卦象與自身知識自行完成判讀。
  function _mhQuestionContract(question) {
    var q = String(question || '').trim();
    var L = ['【本題焦點】'];
    if (!q) {
      L.push('問卜者未填明確問題，請解讀本卦的一般局勢、發展變化、提醒與可採取方向。');
      return L.join('\n');
    }
    L.push('請完整回答原問句，保留其中的對象、條件、比較與期限。');
    var yesno = /會不會|能不能|可不可以|是否|是不是|有沒有|嗎[？?]?\s*$/.test(q);
    var timing = /何時|什麼時候|多久|幾天|幾週|幾月|哪一年|時間|近期|本月|今年|明年/.test(q);
    var choice = /還是|二選一|比較|該選|選擇|(?:方案|選項)\s*[ABＡＢ]/i.test(q);
    var cause = /為什麼|為何|原因|怎麼會|根源/.test(q);
    var action = /怎麼做|怎麼辦|如何|建議|方法|策略|該不該|要不要/.test(q);
    var mind = /愛不愛|愛上|喜歡|想我|想念|在想|心裡|真心|感情|關係|復合|曖昧|桃花/.test(q);
    var lost = /不見|遺失|掉了|找得到|在哪裡|位置|失物|走失/.test(q);
    var exact = /幾個|幾位|多少|百分比|幾成|機率|金額|價位|幾歲|年齡|姓名|名字|身分|職業|長相|外貌|號碼|彩票|樂透/.test(q);
    var high = /疾病|症狀|癌|懷孕|手術|藥|醫療|官司|法律|犯罪|報警|投資|股票|期貨|加密貨幣|借貸|債務|自殺|傷害/.test(q);
    var allegation = /外遇|偷吃|劈腿|偷竊|下毒|陷害|詐騙|兇手|性侵|跟蹤|犯罪/.test(q);
    var liveFact = /天氣|氣溫|降雨|颱風|地震|航班|班機|股價|匯率|價格|法規|選舉|比賽|比分|開獎/.test(q);
    if (yesno) L.push('這是是非題：開頭先給「偏會／偏不會／有條件」的傾向與把握度，再說明關鍵條件。');
    if (timing) L.push('這題要求時間：結合卦氣、體用旺衰、本互變與資料所列應期，說明較可能的先後與窗口。');
    if (choice) L.push('這是比較題，但本次只起一卦。先從本互變辨認共同條件，再比較各行動是否符合；不能把本卦當 A、變卦當 B，冒充兩次獨立占測。');
    if (cause) L.push('這題要求原因：用本卦看現況、互卦看過程、動爻看觸發，整理主因與暗線。');
    if (action) L.push('這題要求做法：將最關鍵的阻力或轉機轉成具體可執行建議。');
    if (mind) L.push('涉及感情或他人想法：解讀互動傾向、投入、顧慮與後續發展，並提示可用哪些現實行為驗證。');
    if (lost) L.push('涉及失物／位置：綜合八卦方位、場域與物象，給優先搜索區域、物件特徵與順序。');
    if (exact) L.push('涉及數量、身分、金額、年齡或機率時，沒有可查的數值依據就明說無法測得；不得把猜測改寫成範圍或百分比。仍可解讀與問題相關的處境、條件與行動。');
    if (high || allegation || liveFact) L.push('若問題牽涉醫療、法律、投資、安全、指控或即時資料，請把卦象判斷和需要現實查證的部分分開說明。');
    return L.join('\n');
  }

  function buildMeihuaPrompt(question, mh) {
    if(!mh||!mh.up||!mh.lo||!Number.isInteger(mh.dong)||mh.dong<1||mh.dong>6||!mh.ben||!mh.hu||!mh.bian||!mh.tiG||!mh.yoG)throw new Error('梅花卦盤資料不完整');
    if(window.JYPromptPacket)return window.JYPromptPacket.build('meihua',mh,question||'請依本次梅花卦分析');
    var castDate=mh.castContext&&mh.castContext.timestamp?new Date(mh.castContext.timestamp):null;
    if(castDate&&!Number.isFinite(castDate.getTime()))throw new Error('起卦時間資料無效');
    var seasonDate=castDate||new Date(), seasonPrecision='未確認';
    var tiName = (mh.tiG && mh.tiG.name) || '', yoName = (mh.yoG && mh.yoG.name) || '';
    var tiEl = mh.tiG && mh.tiG.el, yoEl = mh.yoG && mh.yoG.el;
    var timing = WX_TIMING[yoEl] || '節奏依用卦五行性質判';
    var luck = mh.ty ? mh.ty.f : '';
    // ── 旺衰（旺相休囚死）：體、用、變後用 都要算，生剋力道才準（天花板在材料）──
    //    優先用既有引擎 getMhWangShuai（v80.16 起含節氣判月＋四季月土旺），失敗才退國曆近似簡表；同一函數對任一五行通用。
    function _wsLevelOf(el) {
      if (!el) return '';
      try { if (typeof getMhWangShuai === 'function') { var r = getMhWangShuai(el,seasonDate); if (r && r.level) {seasonPrecision=r.precision||'未標示算法精度';return r.level;} } } catch (e) {}
      seasonPrecision='公曆季節近似備援，節令交界不作精細旺衰判斷';
      var _m = seasonDate.getMonth() + 1, _sea;
      if (_m>=2 && _m<=4) _sea='spring'; else if (_m>=5 && _m<=7) _sea='summer';
      else if (_m>=8 && _m<=10) _sea='autumn'; else _sea='winter';
      var _T = { spring:{木:'旺',火:'相',水:'休',金:'囚',土:'死'}, summer:{火:'旺',土:'相',木:'休',水:'囚',金:'死'}, autumn:{金:'旺',水:'相',土:'休',火:'囚',木:'死'}, winter:{水:'旺',木:'相',金:'休',土:'囚',火:'死'} };
      return (_T[_sea] && _T[_sea][el]) || '平';
    }
    var wsLevel = _wsLevelOf(tiEl);   // 體卦旺衰
    var yoWs    = _wsLevelOf(yoEl);   // 用卦旺衰
    var _wsNoteMap = {
      '旺':'當令最旺、力足', '相':'受令神所生、次旺偏有力', '休':'洩氣於令神、力退',
      '囚':'克令神反受牽制、力弱', '死':'被當令之氣所克、最弱', '平':'不逢令、力道持平'
    };
    var wsNote = ({
      '旺':'體當令最旺、力足——吉更實，逢凶也扛得住。',
      '相':'體受令神所生、次旺，偏有力。',
      '休':'體生令神而洩氣、力退——吉要打折，別高估後勁。',
      '囚':'體克令神反被牽制、力弱——推得吃力。',
      '死':'體被當令之氣所克、最弱——凶上加凶，吉也難落實。',
      '平':'體不逢令，力道持平。'
    })[wsLevel] || '';
    // 生剋力道：把「體旺衰＋用旺衰」合參，定生剋的真實輕重——
    //   剋體之卦（用）休囚死則克無力、凶大減；用旺相則凶不可當；受剋方（體）旺則能扛。
    var _rank = { '旺':4, '相':3, '平':2, '休':1, '囚':0, '死':0 };
    function _forceNote(relName, tw, yw) {
      relName = (relName || '').replace('剋', '克');
      var ts = (_rank[tw]!=null ? _rank[tw] : 2), ys = (_rank[yw]!=null ? _rank[yw] : 2);
      var tiStrong = ts>=3, tiWeak = ts<=1, yoStrong = ys>=3, yoWeak = ys<=1;
      if (relName==='用克體') {
        if (yoWeak && tiStrong) return '用衰體旺——克你的力道其實很弱、你站得住，這個「凶」要大打折扣，別當成困難重重。';
        if (yoStrong && tiWeak) return '用旺體弱——克力強、受傷重，這個凶要當真。';
        if (yoStrong && tiStrong) return '雙方都旺——硬碰硬，受阻但你頂得住，要主動出力才壓得下。';
        if (yoWeak && tiWeak) return '雙方都弱——事不成氣候，拖著沒力、難有結果。';
        return '克力中等——受點阻，程度中等。';
      }
      if (relName==='體生用') {
        if (tiWeak && yoStrong) return '體弱生旺用——旺者奪氣，洩耗最重、得不償失之象。';
        if (tiStrong && yoWeak) return '體旺生衰用——洩得起且洩耗有限，付出有本錢，但仍是你在貼。';
        if (tiStrong) return '體旺——洩得起，付出有本錢，但仍是你在貼、被牽著走。';
        if (tiWeak) return '體弱還在洩——越給越虛，洩耗偏重、得不償失之象。';
        return '在洩耗——付出與回收要算清楚，別無底線投入。';
      }
      if (relName==='體克用') {
        if (tiWeak && yoStrong) return '體弱剋旺用——有主動處理之象，但自身力弱、外在條件強，不能只因體剋用便斷吉或保證成功；先審承受力與本互變。';
        if (tiStrong && yoWeak) return '體旺剋衰用——壓得輕鬆、最易成。';
        if (tiStrong) return '體旺——你壓得住、可成，主動推進就行。';
        if (tiWeak) return '體弱想掌控——吉意仍在，但力道不足，成得很費勁。';
        return '掌控力中等——可成但需出力。';
      }
      if (relName==='用生體') {
        if (yoStrong) return '用旺生體——外助強而實，貴人／環境有力，借得上力。';
        if (yoWeak) return '用衰生體——象徵支持條件偏弱；是否真有外援仍待現實確認。';
        return '外助中等——有幫襯，仍要自己接得住。';
      }
      if (relName==='比和') {
        if (tiStrong || yoStrong) return '同氣且有力——順而能成，但同質性高、突破有限。';
        if (tiWeak && yoWeak) return '同氣但都弱——順是順卻沒力，難有大進展。';
        return '同氣相順——事順，突破有限。';
      }
      return '';
    }

    // 變卦體用（結局對體）：動爻必在「用卦」，故體不變、用變；翻動爻所在爻得變後用卦
    var bianTy = null, yoBianName = '', yoBianEl = '';
    try {
      if (mh.yoG && mh.yoG.li && typeof gByL === 'function' && typeof tiYong === 'function') {
        var _yl = mh.yoG.li.slice();
        var _idx = (mh.dong <= 3) ? (mh.dong - 1) : (mh.dong - 4); // 動爻在用卦內的爻位
        if (_idx >= 0 && _idx <= 2) {
          _yl[_idx] = _yl[_idx] ? 0 : 1;
          var _yb = gByL(_yl[0], _yl[1], _yl[2]);
          if (_yb) { yoBianName = _yb.name || ''; yoBianEl = _yb.el || ''; bianTy = tiYong(tiEl, _yb.el); }
        }
      }
    } catch (e) {}

    var L = [];
    L.push('你是一位資深梅花易數占者。請運用你自身完整的易學、體用、生剋、卦氣、類象與應期知識，綜合本次卦象資料，以白話直接回答問題，讓結論有具體依據。');
    L.push('');
    L.push('問題：' + (question || '（未填）'));
    L.push('');
    L.push('動爻自下而上計數；依本次體用、卦氣與本互變共同判斷。生剋類型是傳統象義，不能單獨證明有人暗助、阻擋或注定成敗。卦數與旬、季節象徵不是已驗證的日期或現實數量。');
    L.push(_mhQuestionContract(question));
    L.push('');
    L.push('【卦象資料】');
    L.push('互卦政策：下互取二三四爻，上互取三四五爻；乾坤採《互卦起例》「互其變卦」，先翻本次動爻再取互卦。文字筆畫取數為現代延伸，並非原典四至十字按平上去入取數的復刻。');
    L.push('起卦依據：'+(mh.castContext?JSON.stringify(mh.castContext):'舊資料未保存起卦時間與原始取數；當下旺衰只作匯出時參考，不能追認為起卦時令。'));
    L.push('旺衰算法：'+seasonPrecision+'。');
    if(mh.lo.li&&mh.up.li)L.push('本卦六爻（自下而上，1陽0陰）：'+mh.lo.li.concat(mh.up.li).join('、')+'；只翻轉第'+mh.dong+'爻生成變卦。');
    L.push('判讀順序：先核對取數與體用，再以本卦定背景、互卦觀察內部過程、變後用卦對原體卦看條件變化；用卦含動爻，體卦是不動的另一個三爻卦。比較生剋方向與雙方旺衰，不只計算吉凶數量。');
    L.push('每個主判指出本互變的具體卦名、生剋關係與動爻位置，再說明對原問題的含義、反向訊號和可觀察條件。錯綜及爻辭屬補充鏡頭，不取代體用；本法只有一動爻，不擅自套用六爻納甲世應與多爻變占規則。');
    L.push('原典參考：《梅花易數》卷一、卷二 https://www.eee-learning.com/book/4080 、 https://www.eee-learning.com/book/4085 。本次公式變體已另行標示；書目不代表 AI 已即時查網。');
    L.push('本卦：' + (mh.ben && mh.ben.n) + '（上卦' + _mhTrig(mh.up) + '，下卦' + _mhTrig(mh.lo) + '）—— 事情的當前定性。');
    L.push('互卦：' + (mh.hu && mh.hu.n) + ' —— 發展過程、可供思考的內在結構與中間變數（尚待現實核對）。');
    // v80.33 互卦對體生剋（《體用總訣》「宜受他卦之生，不宜受他卦之剋。他卦者，謂用互變也」——資料直給，不靠 AI 自己算）
    try {
      if (mh.lo && mh.lo.li && mh.up && mh.up.li && typeof gByL === 'function' && tiEl) {
        var _SH = (typeof SHENG !== 'undefined') ? SHENG : {木:'火',火:'土',土:'金',金:'水',水:'木'};
        var _KEm = (typeof KE !== 'undefined') ? KE : {木:'土',土:'水',水:'火',火:'金',金:'木'};
        var _six = [mh.lo.li[0], mh.lo.li[1], mh.lo.li[2], mh.up.li[0], mh.up.li[1], mh.up.li[2]];
        var _nuclear=mhNuclearContext(mh);
        var _huLo = _nuclear.lower;
        var _huUp = _nuclear.upper;
        var _hrel = function (g) {
          if (!g || !g.el) return '';
          if (g.el === tiEl) return (g.name||'') + '（' + g.el + '）與體比和＝過程有同氣相助';
          if (_SH[g.el] === tiEl) return (g.name||'') + '（' + g.el + '）生體＝過程中可能存在支持條件，不能據此認定有人暗助';
          if (_SH[tiEl] === g.el) return (g.name||'') + '（' + g.el + '）受體生＝過程在洩耗你';
          if (_KEm[g.el] === tiEl) return (g.name||'') + '（' + g.el + '）剋體＝可檢視過程的外部限制，不證明特定人物阻撓';
          if (_KEm[tiEl] === g.el) return (g.name||'') + '（' + g.el + '）受體剋＝過程可控但費力';
          return '';
        };
        var _hl = _hrel(_huLo), _hu2 = _hrel(_huUp);
        if (_hl || _hu2) L.push('互卦對體生剋（過程在幫你還是扯你）：互上' + (_hu2 || '—') + '；互下' + (_hl || '—') + '。');
      }
    } catch (e) {}
    L.push('變卦：' + (mh.bian && mh.bian.n) + ' —— 若照目前走向，可能的後續走向，仍會隨條件與行動改變。');
    var _cuo = (typeof mhCuoGua === 'function') ? mhCuoGua(mh) : null;
    var _zong = (typeof mhZongGua === 'function') ? mhZongGua(mh) : null;
    if (_cuo) L.push('錯卦（上' + _cuo.up + '下' + _cuo.lo + '）—— 事情的反面、你沒看到的相反可能與潛在反作用力；若這一面反而有利，提醒當事人可能看錯方向或另有轉圜。');
    if (_zong) L.push('綜卦：' + (_zong.isSelf ? '與本卦相同 —— 正反看都一樣，此卦上下倒置後結構相同；僅是卦形對稱，不代表事情無法改變' : ('上' + _zong.up + '下' + _zong.lo + ' —— 把局面整個倒過來、站對方／對立位置看到的另一種樣貌，可輔助觀察換位後的立場或事情循環另一端，但不能單憑此卦斷定對方內心')) + '。');
    L.push('體卦：' + _mhTrig(mh.tiG) + ' —— 問卜者自身／所問之主體。體宜旺、宜被生。');
    L.push('用卦：' + _mhTrig(mh.yoG) + ' —— 所問之事／外在環境／對方。');
    L.push('本卦體用關係：' + (mh.ty && mh.ty.r) + '；未加旺衰的傳統分類為「' + luck + '」，不是事件結論。實際傾向須以下方體用旺衰及本互變綜合校準。');
    L.push('生剋力道（體用旺衰合參、定輕重）：' + _forceNote(mh.ty && mh.ty.r, wsLevel, yoWs));
    if (bianTy) {
      L.push('變卦體用關係（結局）：體仍為' + tiName + '（' + tiEl + '），用變為' + yoBianName + '（' + yoBianEl + '）→ ' + bianTy.r + '（' + bianTy.f + '）。變後用「' + yoBianName + '」當下旺衰為「' + _wsLevelOf(yoBianEl) + '」。生剋力道：' + _forceNote(bianTy.r, wsLevel, _wsLevelOf(yoBianEl)) + ' 拿它跟本卦體用比：同向＝維持，轉壞＝越走越不利，轉好＝漸入佳境。');
    }
    L.push('動爻：第 ' + mh.dong + ' 爻動（變卦由此而生，是事情變化的關鍵點）。');
    // v80.38 動爻爻位層次（《繫辭傳下》：其初難知、其上易知；二多譽、四多懼、三多凶、五多功）
    var _YAO_POS = {
      1:'初爻＝事之始、根基層，方向未定（其初難知）——變化發生在起步與底層條件',
      2:'二爻＝內部核心、得中之位，多獲助與稱譽（二多譽）——變化發生在內部主力與核心本身',
      3:'三爻＝內外交界、進退尷尬之位，多波折（三多凶）——變化發生在轉換與銜接處',
      4:'四爻＝近事之外場、伴君之位，多戒懼（四多懼）——變化發生在對外接口與關鍵他方',
      5:'五爻＝主導尊位、事之高峰（五多功）——變化發生在主導權與大局層',
      6:'上爻＝事之末、過極之位，局面將收（其上易知）——變化發生在收尾與規則層，過頭則散'
    };
    if (_YAO_POS[mh.dong]) L.push('動爻爻位參考：' + _YAO_POS[mh.dong] + '。把它跟變卦合著讀，點出變化具體落在事情的哪一層。');
    L.push('體卦旺衰：' + tiName + '（' + tiEl + '）當下時令為「' + wsLevel + '」——' + wsNote);
    L.push('用卦旺衰：' + yoName + '（' + yoEl + '）當下時令為「' + yoWs + '」——用' + (_wsNoteMap[yoWs] || '') + '；用代表所問之事或外部條件，它與體的生剋比和及雙方旺衰共同決定作用力度。');
    L.push('事情節奏參考（用卦五行性質，只定快慢、不定應期月份）：用卦五行為「' + yoEl + '」，' + timing + '。');
    // 應期只提供可追溯的傳統卦氣候選，不用今日日期加固定節氣日製造「最近幾個月」的假精確。
    try {
      if (mh.yingQi) {
        L.push('應期資料層級：' + (mh.yingQi.precision || '傳統卦氣候選') + '。');
        if (mh.yingQi.jiTxt) L.push('・吉應候選：' + mh.yingQi.jiTxt + '。');
        if (mh.yingQi.baiTxt) L.push('・不利候選：' + mh.yingQi.baiTxt + '。');
        if (mh.yingQi.layerTxt) L.push('・遠近層次：' + mh.yingQi.layerTxt + '。');
      } else {
        L.push('應期資料：本盤沒有曆法換算結果。可說明本互變的過程層次，不把三卦硬配三段時間，也不報精確日期。');
      }
    } catch (e) {}
    // 選品置於完整解讀後，由生活情境承接，不把體用當成補五行處方。
    L.push('【八卦類象（推具體人事物，只取與問題相關的，不要全列）】');
    L.push('體卦 ' + tiName + '：' + (GUA_XIANG[tiName] || ''));
    L.push('用卦 ' + yoName + '：' + (GUA_XIANG[yoName] || ''));
    L.push('其餘速查（推互卦、變卦的人事物用）：乾＝' + GUA_XIANG['乾'] + '；兌＝' + GUA_XIANG['兌'] + '；離＝' + GUA_XIANG['離'] + '；震＝' + GUA_XIANG['震'] + '；巽＝' + GUA_XIANG['巽'] + '；坎＝' + GUA_XIANG['坎'] + '；艮＝' + GUA_XIANG['艮'] + '；坤＝' + GUA_XIANG['坤'] + '。');
    L.push('類象請與問題、本互變、體用和動爻交叉使用，挑選真正相關且可驗證的線索。');
    L.push('');
    L.push("互卦不只抄卦名：分上互與下互的五行，分別與原體卦比較生剋，再看互卦之間是否制約本卦的助力或阻力。變後體仍取原體，動爻所在的用卦改變；不為求吉而交換體用。");
    L.push("天時、尋物、感情、求財等題有各自取象方式；先看原問題需要何種現象，再用本互變與旺衰交叉選象。無現場外應資料時明說未用外應，不編造聽到、看到或感應到的徵兆。");
    L.push("本吉變受制時說清有利條件為何可能耗損，本受制變得助時說清轉機依賴什麼；體用屬主從與作用比喻，不能用體克用鼓勵控制伴侶或他人。");
    L.push("同一動爻形成變卦，因此動爻與變卦不是兩份獨立佐證。卦數、動爻、月份符號可作傳統取象的候選，但未經日曆推導與現實資料支持時不能報確切日期。");
    var _readingQuality=window.JY_READING_QUALITY;
    // 舊頁面可能快取到舊版共用規則：即使介面同名，也不可把舊寫作契約混回新提示詞。
    // 按能力及最低相容版本挑選，不鎖死 6.0.0，以免往後相容版本退回備援。
    var _qualityCurrent=false;
    try {
      var _v=String(_readingQuality&&_readingQuality.readingVersion||'').split('.').map(Number);
      _qualityCurrent=!!(_readingQuality&&_v.length===3&&_v.every(Number.isInteger)&&
        (_v[0]>=8)&&typeof _readingQuality.lines==='function'&&
        typeof _readingQuality.methodKinds==='function'&&_readingQuality.methodKinds().includes('meihua'));
    } catch(e) { _qualityCurrent=false; }
    L=L.concat(_qualityCurrent?_readingQuality.lines('meihua'):JY_READING_MEIHUA);
    L.push('【判讀方法】');
    L.push('判讀參考：體用與旺衰定主調，本互變、動爻核轉折；錯綜卦與類象只有改變答案時才補充。');
    L.push('2. 體用基本關係可依《梅花易數》傳統語義理解，再按雙方旺衰、動爻和變卦校準實際力度：');
    L.push('　・用生體＝有進益之喜：外力來助。');
    L.push('　・比和＝百事順遂：同氣相順，但突破幅度另看旺衰。');
    L.push('　・體剋用＝主動在體、較有掌控；體弱剋旺用時落實較費力。');
    L.push('　・體生用＝有耗失之患：體在洩耗，先看投入是否值得。');
    L.push('　・用剋體＝外力制約、阻力較明顯；用衰時影響減輕，用旺體弱時較重。');
    L.push('3. 訊號衝突時給出主判與牽制，說明哪些現實條件會讓結果轉強、轉弱或改變；具象線索只採資料與情境支持的部分，不為生動而補造人物、場所或事件。');
    L.push('4. 題目問時間時，結合用近、互中、變遠、五行卦氣與盤內應期資料；時間精度請與資料相稱。');
    L.push('取互版本：本站純乾／純坤採《梅花易數・互卦起例》記載的「乾坤無互，互其變卦」支線，先翻本次動爻、再由變卦的2–4與3–5爻取互；其他卦直接由本卦取互。以實際排出的互卦判讀，不暗中更換算法。');
    // 解讀規則 6.0.0 與選品規則 4.3.0 各自版本化；舊選品檔可能仍帶新版
    // readingVersion，不能因此接受它的過時 recommendationText。
    var _recommendationCurrent=false;
    try {
      var _rv=String(_readingQuality&&_readingQuality.version||'').split('.').map(Number);
      _recommendationCurrent=!!(_qualityCurrent&&_rv.length===3&&_rv.every(Number.isInteger)&&
        (_rv[0]>4||_rv[0]===4&&(_rv[1]>=6))&&
        typeof _readingQuality.recommendationText==='function');
    } catch(e) { _recommendationCurrent=false; }
    L.push(_recommendationCurrent?_readingQuality.recommendationText('meihua'):JY_REC_MEIHUA);
    if(window.JYNativeAnalysis)L.push(window.JYNativeAnalysis.prompt('meihua',mh,question));
    L.push('最後保留以下兩行：');
    L.push('[靜月之光蝦皮賣場](https://shopee.tw/a50h95648d?tab=shop)');
    L.push('願你諸事順遂。');
    return globalThis.JYReadingWorkflow.finish(L.join('\n'),{method:'meihua',question:question});
  }

  // ════════════════════════════════════════════════════════
  //  Public API
  // ════════════════════════════════════════════════════════
  window._meihuaShare = function () {
    if (!window.JYShareCard) { alert('\u5206\u4EAB\u5143\u4EF6\u8F09\u5165\u4E2D\uFF0C\u8ACB\u7A0D\u5019\u518D\u8A66'); return; }
    var mh = _mhResult || {};
    var concl = (mh.ty ? (mh.ty.r + '\uFF08' + mh.ty.f + '\uFF09\u30FB' + mh.ty.d) : '') + (mh.dong ? ' \u30FB \u52D5\u723B\u7B2C' + mh.dong + '\u723B' : '');
    // v80.39：補爻線資料——share-card v2.2 起直繪六爻卦象（陽實陰斷、動爻高亮）。
    //   本卦＝下卦.li＋上卦.li（由下而上）；互卦取 2-4/3-5 爻；變卦＝本卦動爻翻轉（與 calcMH 同式推導）
    var benL = (mh.lo && mh.lo.li && mh.up && mh.up.li) ? mh.lo.li.concat(mh.up.li) : null;
    var huL = null, biL = null;
    if (benL) {
      huL = mhNuclearContext(mh).lines.slice();
      biL = benL.slice(); if (mh.dong) biL[mh.dong - 1] = biL[mh.dong - 1] ? 0 : 1;
    }
    JYShareCard.open('meihua', {
      cardTitle: '\u6211\u7684\u5366\u8C61',
      spread: '\u6885\u82B1\u6613\u6578 \u30FB \u9AD4\u7528\u5360',
      question: _mhQuestion || '',
      cards: [
        { name: (mh.ben && mh.ben.n) || '', pos: '\u672C\u5366', lines: benL, dong: mh.dong },
        { name: (mh.hu && mh.hu.n) || '', pos: '\u4E92\u5366', lines: huL },
        { name: (mh.bian && mh.bian.n) || '', pos: '\u8B8A\u5366', lines: biL, dong: mh.dong }
      ],
      conclusion: concl
    });
  };

  window._meihuaStandaloneOpen = function () {
    _mhPhase = 'input'; _mhQuestion = ''; _mhMethod = 'time';
    _mhUpNum = ''; _mhLoNum = ''; _mhText = ''; _mhResult = null; _lastPrompt = '';
    var w = _getWrap();
    w.style.display = 'block';
    try { document.body.style.overflow = 'hidden'; } catch(e){} // 鎖背景捲動，避免固定層與底頁互搶造成抖動
    _render();
    w.scrollTop = 0;
  };
  window._meihuaClose = function () {
    _castEpoch++;
    if(window.JYRitual)window.JYRitual.cancel('meihua');
    var w = _getWrap();
    if (w) w.style.display = 'none';
    try { document.body.style.overflow = ''; } catch(e){}
  
    if (window.JY_ATELIER) window.JY_ATELIER.restoreEntrance();
  };
  window._mhSetMethod = function (m) {
    var qEl = document.getElementById('mhx-q'); if (qEl) _mhQuestion = qEl.value;
    var uEl = document.getElementById('mhx-up'); if (uEl) _mhUpNum = uEl.value;
    var lEl = document.getElementById('mhx-lo'); if (lEl) _mhLoNum = lEl.value;
    var tEl = document.getElementById('mhx-text'); if (tEl) _mhText = tEl.value;
    _mhMethod = m;
    _render();
  };
  function _finishCast(nums) {
    _showLoading(function () {
      try {
        _mhResult = calcMH(nums.up, nums.lo, nums.dong, nums.context);
        _lastPrompt = buildMeihuaPrompt(_mhQuestion, _mhResult);
        _mhPhase = 'result';
        _render();
        _getWrap().scrollTop = 0;
      } catch (e) {
        console.error('[meihua] cast error', e);
        alert('起卦計算發生問題，請重試或改用另一種起卦方式。');
      }
    });
  }
  window._mhDoCast = function () {
    if(window.JYRitual && window.JYRitual.isActive())return;
    var epoch=++_castEpoch;
    var qEl = document.getElementById('mhx-q'); _mhQuestion = qEl ? qEl.value.trim() : '';
    var uEl = document.getElementById('mhx-up'); if (uEl) _mhUpNum = uEl.value;
    var lEl = document.getElementById('mhx-lo'); if (lEl) _mhLoNum = lEl.value;
    var tEl = document.getElementById('mhx-text'); if (tEl) _mhText = tEl.value;
    if (typeof calcMH !== 'function') { alert('梅花引擎尚未載入，請重新整理頁面。'); return; }
    if (_mhMethod === 'char') {
      _castChar(function (nums) { if (epoch===_castEpoch && nums) _finishCast(nums); });
    } else {
      var nums = _castNumbers();
      if (!nums) return;
      _finishCast(nums);
    }
  };
  window._mhCopy = function () {
    if (!_lastPrompt) return;
    var ok = function () {
      var btn = document.querySelector('.mhx-ai-copy-btn');
      if (btn) { var o = btn.innerHTML; btn.innerHTML = '✓ 已複製！貼到 AI 送出即可'; btn.style.borderColor = 'rgba(52,211,153,.5)'; setTimeout(function(){ btn.innerHTML = o; btn.style.borderColor = ''; }, 2500); }
    };
    if (window.JYPromptPacket || (navigator.clipboard && navigator.clipboard.writeText)) {
      (window.JYPromptPacket?window.JYPromptPacket.copy(_lastPrompt):navigator.clipboard.writeText(_lastPrompt)).then(ok, function(){ _fallbackCopy(_lastPrompt); ok(); });
    } else { _fallbackCopy(_lastPrompt); ok(); }
  };
  window._mhOpenAI = function (id, url, btn) {
    var open = function () {
      var s = btn && btn.querySelector('span'); var nm = s ? s.textContent : '';
      if (s) s.textContent = '已複製！';
      setTimeout(function(){ window.open(url, '_blank'); }, 280);
      setTimeout(function(){ if (s) s.textContent = nm; }, 2000);
    };
    if (!_lastPrompt) { window.open(url, '_blank'); return; }
    if (window.JYPromptPacket || (navigator.clipboard && navigator.clipboard.writeText)) {
      (window.JYPromptPacket?window.JYPromptPacket.copy(_lastPrompt):navigator.clipboard.writeText(_lastPrompt)).then(open, function(){ _fallbackCopy(_lastPrompt); open(); });
    } else { _fallbackCopy(_lastPrompt); open(); }
  };
  window._mhReset = function () {
    _mhPhase = 'input';
    _render();
    _getWrap().scrollTop = 0;
  };

  function _fallbackCopy(text) {
    try { var ta = document.createElement('textarea'); ta.value = text; ta.style.cssText = 'position:fixed;left:-9999px'; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta); } catch (e) {}
  }

})();
