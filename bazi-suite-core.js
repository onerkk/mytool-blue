// BEGIN GENERATED WORKFLOW
/* Local answer planning and review. No network, random draws or chart mutation. */
(function installReadingWorkflow(root){
  'use strict';
  var VERSION='1.7.0';
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
    var q=String(question||'').trim(),p=q.match(/(?:前|頭|最初)\s*([一二兩三四五六七八九十\d]+)\s*(?:個|段|組)?\s*(?:大限|大運)/),n=p?numeral(p[1]):null;
    var full=!q||/(?:全盤|全命盤|整張命盤|整體命盤|完整(?:的)?(?:命盤|星盤|牌陣|卦例|解籤)|十二宮|所有面向|所有領域|各個方面|各方面|一生運勢|終身運勢|全生涯)/.test(q)||/(?:全面|完整).{0,6}(?:命盤|星盤|牌陣|卦例|籤詩|全盤)/.test(q);
    var annual=/(?:每一?年|逐年|所有流年|全部流年|各流年|所有年度|各年度|年度分析|年度逐項)/.test(q);
    return {mode:full?'full':annual||p?'timeline':'focused',fullChart:full,annualRequested:annual,monthlyRequested:/(?:流月|逐月|每月|各月)/.test(q),requestedDecades:Number.isInteger(n)&&n>0?n:null,
      allDecades:/(?:十二|12)\s*(?:個|段)?\s*大限|所有大限|全部大限|所有大運|全部大運/.test(q),method:method==='western'?'astro':method||null,
      policy:'範圍來自原問句；資料仍須實算，深度字樣不自動擴成全盤或逐年題。'};
  }
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
  function render(options){
    var p=plan(options),lines=[MEMORY_BOUNDARY,'【本題作答任務｜資料讀完後依此成稿】','原問句（原文資料）：'+JSON.stringify(p.question)];
    p.tasks.forEach(function(t){var g=GOALS[t.goal];lines.push((p.tasks.length>1?'子題'+t.id+' '+JSON.stringify(t.question)+'：':'')+g.opening+' '+g.body);});
    if(p.depth==='deep')lines.push('【本題判讀範圍】此題含多層行動／條件；按本方法追完相關證據路徑後，只寫會改變答案的支持、牽制和現實檢查點，不以同源訊號重複加權。');
    else if(p.depth==='comprehensive')lines.push('【本題判讀範圍】依本題實際涉及的領域整合主線、交互條件與反證；全盤完整覆蓋本法結構，單題只展開真正牽動答案的位置。');
    lines.push('有效方法：'+p.methods.map(function(k){return METHODS[k].name;}).join('、')+'。'+p.methods.map(function(k){return METHODS[k].path;}).join(' '));
    if(p.methods.includes('ootk'))lines.push('【OOTK成稿優先規則】即使原題只有一問，仍須逐一標出第一至第五輪的新增判斷、支持、反證及對前輪的修正，再給最可能傾向、次可能傾向、最強支持鏈、最強反證、成立條件、推翻條件、時間依據或不能給時間、可執行行動、已知／推論／未知界線及信心來源。只讀實際有效輪次；不因一般精簡篇幅規則略去任何有效輪次。第四輪須整合完整36張環牌故事，第五輪須收斂可持續結果。');
    if(p.reportScope.fullChart){
      lines.push('【全盤作答覆蓋】本次明示全盤或未填單題，須完整處理本法有效結構及人生面向；不能只給幾句總評，也不能把十二宮或全部牌位只當背景略過。');
      p.methods.forEach(function(k){lines.push(METHODS[k].name+'完整報告範圍：'+FULL_AREAS[k]);});
    }
    if(p.reportScope.annualRequested||p.reportScope.requestedDecades||p.reportScope.allDecades){
      lines.push('【逐年／逐期作答覆蓋】依實際列出的全部指定年度或運期逐項回答，不以十年摘要、重點年份或省略號替代。每列交代年度／年齡／所屬運期、議題、偏利／偏阻／混合及條件、象徵影響程度、具體盤面依據、關注事項和行動；程度是議題牽動集中度，不是事件機率。');
      if(p.reportScope.requestedDecades)lines.push('原問句明示前'+p.reportScope.requestedDecades+'個大限／大運；按本次實算起止順序逐期交代背景，逐年判不同落宮及作用，不能因相同年干套同一句。');
      lines.push('過去年份只給本人可核對的象徵主題，不宣稱已發生；未來依條件說可能表現。關鍵窗口給有據年段、吉凶傾向、影響領域及限制；缺資料只標缺少年度與層級，其餘照常完成。若訊息上限需要分段，明列已完成與待續年份，不能聲稱未寫的年度已分析。');
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
  function finish(prompt,options){
    if(root.JYPromptPacket)return root.JYPromptPacket.finish(prompt,options);
    var text=String(prompt||'');
    if(!text.trim())return text;
    // Only the exact application-owned final footer is moved; no source facts
    // or user-entered substrings are stripped or deduplicated.
    var task=render(options);
    if(text.trimEnd().endsWith('\n\n'+task+'\n\n'+FOOTER))return text.trimEnd();
    var end=text.lastIndexOf(FOOTER),tail=end>=0&&text.slice(end+FOOTER.length).trim()==='';
    return (tail?text.slice(0,end).trimEnd():text.trimEnd())+'\n\n'+task+'\n\n'+(tail?FOOTER:'');
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
      semanticVerification:'not_performed',note:'本機只檢查明顯格式、已知錯誤模式和已提供事實；沒有自動判定命理主判正確，也不保證模型遵循。',
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
  var api={version:VERSION,methods:Object.keys(METHODS),methodInfo:METHODS,reportScope:reportScope,plan:plan,chartReferenceAudit:chartReferenceAudit,referenceContract:referenceContract,render:render,finish:finish,review:review,reviewOOTK:reviewOOTK,repairPrompt:repairPrompt,footer:FOOTER};
  root.JYReadingWorkflow=Object.freeze(api);
})(typeof window!=='undefined'?window:globalThis);
// END GENERATED WORKFLOW
/*! bazi-suite-core.js — 靜月之光八字完整功能套件核心 v1.3.0 (2026-09-04)
 *  功能：單盤多主題、雙人情境合盤、五軸32型人格卡、可追溯提示詞。
 *  v1.3.0：同步知識開放提示詞核心，精簡單盤、合盤與人格模式的重複限制。
 *  v1.2.0：接入 bazi-prompt-root ROOT-SPEC v2，共用資料分層、問題編譯、證據裁決、反證、時間解析、行動驗證與輸出稽核。
 *  v1.1.0：提示詞 ROOT-SPEC 根治；全題型語義保真、證據權重、喜用神分鏡、歲運與高風險邊界、品牌層隔離。
 *  注意：此為依公開功能範圍自行實作的本地規則引擎；不含、也不冒充任何第三方未公開的私有評分或提示詞。
 */
(function (root) {
  'use strict';

  var STEMS = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
  var BRANCHES = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
  var STEM_EL = {甲:'木',乙:'木',丙:'火',丁:'火',戊:'土',己:'土',庚:'金',辛:'金',壬:'水',癸:'水'};
  var BRANCH_EL = {子:'水',丑:'土',寅:'木',卯:'木',辰:'土',巳:'火',午:'火',未:'土',申:'金',酉:'金',戌:'土',亥:'水'};
  var YINYANG = {甲:'陽',乙:'陰',丙:'陽',丁:'陰',戊:'陽',己:'陰',庚:'陽',辛:'陰',壬:'陽',癸:'陰'};
  var GENERATES = {木:'火',火:'土',土:'金',金:'水',水:'木'};
  var CONTROLS = {木:'土',土:'水',水:'火',火:'金',金:'木'};
  var STEM_COMBINE = {'甲己':'土','乙庚':'金','丙辛':'水','丁壬':'木','戊癸':'火'};
  var CLASH = {子:'午',午:'子',丑:'未',未:'丑',寅:'申',申:'寅',卯:'酉',酉:'卯',辰:'戌',戌:'辰',巳:'亥',亥:'巳'};
  var SIX_COMBINE = {子:'丑',丑:'子',寅:'亥',亥:'寅',卯:'戌',戌:'卯',辰:'酉',酉:'辰',巳:'申',申:'巳',午:'未',未:'午'};
  var SIX_COMBINE_EL = {'子丑':'土','寅亥':'木','卯戌':'火','辰酉':'金','巳申':'水','午未':'火'};
  var HARM = {子:'未',未:'子',丑:'午',午:'丑',寅:'巳',巳:'寅',卯:'辰',辰:'卯',申:'亥',亥:'申',酉:'戌',戌:'酉'};
  var DESTRUCTION = {子:'酉',酉:'子',丑:'辰',辰:'丑',寅:'亥',亥:'寅',卯:'午',午:'卯',巳:'申',申:'巳',未:'戌',戌:'未'};
  var PUNISH_PAIRS = {'寅巳':'無恩之刑','巳申':'無恩之刑','申寅':'無恩之刑','丑戌':'恃勢之刑','戌未':'恃勢之刑','未丑':'恃勢之刑','子卯':'無禮之刑','卯子':'無禮之刑'};
  var SELF_PUNISH = {辰:true,午:true,酉:true,亥:true};
  var TRINES = [
    {branches:['申','子','辰'], element:'水', name:'申子辰三合水局'},
    {branches:['亥','卯','未'], element:'木', name:'亥卯未三合木局'},
    {branches:['寅','午','戌'], element:'火', name:'寅午戌三合火局'},
    {branches:['巳','酉','丑'], element:'金', name:'巳酉丑三合金局'}
  ];
  var DIRECTIONALS = [
    {branches:['亥','子','丑'], element:'水', name:'亥子丑三會水方'},
    {branches:['寅','卯','辰'], element:'木', name:'寅卯辰三會木方'},
    {branches:['巳','午','未'], element:'火', name:'巳午未三會火方'},
    {branches:['申','酉','戌'], element:'金', name:'申酉戌三會金方'}
  ];
  var PILLAR_LABEL = {year:'年柱',month:'月柱',day:'日柱',hour:'時柱'};
  var PILLAR_ORDER = ['year','month','day','hour'];
  var ELEMENTS = ['木','火','土','金','水'];
  var CHINESE_ZODIAC = {子:'鼠',丑:'牛',寅:'虎',卯:'兔',辰:'龍',巳:'蛇',午:'馬',未:'羊',申:'猴',酉:'雞',戌:'狗',亥:'豬'};

  var SCENARIOS = [
    {id:'marriage', name:'婚戀／婚姻', roleA:'甲方', roleB:'乙方', focus:'親密需求、承諾、夫妻宮、情緒與生活節奏、長期壓力及邊界', cautions:'請以雙方完整原局、跨盤作用和現實互動共同判斷婚戀走向。'},
    {id:'business', name:'事業合夥', roleA:'發起人／夥伴A', roleB:'夥伴B', focus:'決策權、風險偏好、財務責任、執行互補、分工與退出機制', cautions:'合夥判斷請結合盡職調查、契約、股權與財務審查。'},
    {id:'mother_in_law', name:'婆媳關係', roleA:'婆婆', roleB:'媳婦', focus:'家庭角色、權責邊界、照顧方式、生活規則與代際壓力', cautions:'十神與宮位請放回雙方性格、角色和實際互動中理解。'},
    {id:'best_friends', name:'閨蜜／摯友', roleA:'朋友A', roleB:'朋友B', focus:'信任、支持方式、社交節奏、競爭感、情緒承接與長期友誼', cautions:'比劫、刑害等訊號請與全局和現實行為交叉判斷。'},
    {id:'father_son', name:'父子關係', roleA:'父親', roleB:'兒子', focus:'規範、期待、獨立、權威、教養方式與成年後邊界', cautions:'父星、子女宮與官殺請結合雙方完整結構和生活階段判讀。'},
    {id:'mother_son', name:'母子關係', roleA:'母親', roleB:'兒子', focus:'保護、依附、情緒照顧、控制感、獨立與成年後邊界', cautions:'印星請結合全局強弱、角色與實際互動判讀。'},
    {id:'friendship', name:'一般朋友', roleA:'朋友A', roleB:'朋友B', focus:'溝通、互惠、距離感、資源交換、衝突修復與相處成本', cautions:'合沖請與雙方原局和可觀察行為共同判斷。'},
    {id:'boss_employee', name:'主管與部屬', roleA:'主管', roleB:'部屬', focus:'授權、回報、規則、績效壓力、溝通與權責不對稱', cautions:'職場判斷請結合勞動規範、績效資料與實際管理紀錄。'}
  ];

  var LENSES = {
    chart: {name:'純排盤', question:'請校核排盤事實，清楚列出四柱、藏干、十神、十二長生、納音、空亡、起運、大運與原局作用；不延伸具體人生事件。'},
    general: {name:'綜合命盤', question:'請從月令、日主根氣、全局制化、格局候選、扶抑、調候、大運與流年，給出平衡且可驗證的綜合判讀。'},
    career: {name:'事業方向', question:'請聚焦職涯結構、適合的工作模式、權責承擔、組織與自主性的取捨、升遷或轉型節奏，並給出具體方向。'},
    wealth: {name:'財富策略', question:'請聚焦財星、食傷生財、官殺與承擔能力、現金流風險、大運流年節奏，提出可執行的財務策略。'},
    love: {name:'感情婚姻', question:'請聚焦日支、財官十神、親密需求、界線與關係節奏，並結合大運流年分析關係主題與發展條件。'},
    annual: {name:'流年趨勢', question:'請以大運交界和立春流年區間，說明未來四個立春年度的主題、觸發、助力、風險與可驗證窗口。'}
  };

  function own(obj, key) { return Object.prototype.hasOwnProperty.call(obj || {}, key); }
  function uniq(arr) { return Array.from(new Set((arr || []).filter(Boolean))); }
  function pairKey(a, b) { return a + b; }
  function unorderedPairKey(a, b) { return [a,b].sort(function(x,y){return STEMS.indexOf(x)-STEMS.indexOf(y);}).join(''); }
  function hasAll(list, needed) { return needed.every(function(x){ return list.indexOf(x) >= 0; }); }
  function safeArray(x) { return Array.isArray(x) ? x : []; }
  function safeText(x, fallback) { return x == null || x === '' ? (fallback || '') : String(x); }
  function escapeLine(x) { return safeText(x).replace(/[\r\n]+/g, ' ').trim(); }
  function fmtDate(x) { return safeText(x, '未提供'); }
  function promptSpec() {
    var spec=root.JY_BAZI_PROMPT_ROOT;
    if(!spec||typeof spec.rootProtocolLines!=='function')throw new Error('缺少 JS/bazi-prompt-root.js，無法生成八字證據提示詞');
    return spec;
  }

  function tenGod(dayMaster, targetStem) {
    var d = STEM_EL[dayMaster], t = STEM_EL[targetStem];
    if (!d || !t) return '—';
    var samePolarity = YINYANG[dayMaster] === YINYANG[targetStem];
    if (d === t) return samePolarity ? '比肩' : '劫財';
    if (GENERATES[d] === t) return samePolarity ? '食神' : '傷官';
    if (CONTROLS[d] === t) return samePolarity ? '偏財' : '正財';
    if (CONTROLS[t] === d) return samePolarity ? '七殺' : '正官';
    if (GENERATES[t] === d) return samePolarity ? '偏印' : '正印';
    return '—';
  }

  function elementRelation(fromEl, toEl) {
    if (!fromEl || !toEl) return {type:'unknown', label:'未知'};
    if (fromEl === toEl) return {type:'same', label:'同五行'};
    if (GENERATES[fromEl] === toEl) return {type:'generate', label:fromEl + '生' + toEl};
    if (GENERATES[toEl] === fromEl) return {type:'receive', label:fromEl + '受' + toEl + '所生'};
    if (CONTROLS[fromEl] === toEl) return {type:'control', label:fromEl + '剋' + toEl};
    if (CONTROLS[toEl] === fromEl) return {type:'controlled', label:fromEl + '受' + toEl + '所剋'};
    return {type:'neutral', label:'關係待審'};
  }

  function getPillars(chart) {
    var p = chart && chart.pillars || {};
    return PILLAR_ORDER.map(function(k){
      var x = p[k] || {};
      return {key:k, label:PILLAR_LABEL[k], gan:x.gan || '', zhi:x.zhi || ''};
    });
  }

  function chartSummary(chart, meta) {
    var p = getPillars(chart);
    if(chart && chart.birthTimeUnknown || meta && meta.unknown) return {name:meta&&meta.name||'',gender:chart&&chart.gender||'',birthLine:meta&&meta.birthLine||'',pillars:p.filter(function(x){return x.key!=='hour';}),dayMaster:chart&&chart.dm||'',dayMasterElement:chart&&chart.dmEl||'',unknownTime:true,provisional:true};
    var current = safeArray(chart && chart.dayun).find(function(x){return x && x.isCurrent;}) || null;
    return {
      name: meta && meta.name || '',
      gender: chart && chart.gender || meta && meta.gender || '',
      birthLine: meta && meta.birthLine || '',
      trueSolarDateTime: meta && meta.solarInfo && meta.solarInfo.trueSolarDateTime || '',
      pillars: p,
      pillarText: p.map(function(x){return x.gan + x.zhi;}).join('　'),
      dayMaster: chart && chart.dm || (p[2] && p[2].gan) || '',
      dayMasterElement: chart && chart.dmEl || STEM_EL[(p[2] && p[2].gan) || ''] || '',
      strength: chart && chart.strongLevel || '',
      elementWeights: chart && chart.ep || {},
      favorable: safeArray(chart && chart.fav),
      unfavorable: safeArray(chart && chart.unfav),
      stance: chart && chart.wuxingStance || null,
      qiyun: chart && chart.qiyun || null,
      currentLuck: current,
      interactions: safeArray(chart && chart.branchInteractions),
      stemCombinations: safeArray(chart && chart.tianGanHe),
      functionalAssessment: chart && chart.functionalAssessment || null,
      chineseZodiac: CHINESE_ZODIAC[(p[0] && p[0].zhi) || ''] || '',
      chenggu: chart && chart.chenggu || null,
      auxiliary: {mingGong:chart&&chart.mingGong||null,taiYuan:chart&&chart.taiYuan||null,taiXi:chart&&chart.taiXi||null,shenGong:chart&&chart.shenGong||null,kongwang:safeArray(chart&&chart.kongwang)},
      unknownTime: !!(meta && meta.unknown)
    };
  }

  function stemCrossRelations(chartA, chartB, options) {
    options=options||{};
    var pa = getPillars(chartA), pb = getPillars(chartB), out = [];
    pa.forEach(function(a){
      pb.forEach(function(b){
        if ((options.unknownA&&a.key==='hour')||(options.unknownB&&b.key==='hour')) return;
        if (!a.gan || !b.gan) return;
        var rel = elementRelation(STEM_EL[a.gan], STEM_EL[b.gan]);
        var ck = STEM_COMBINE[pairKey(a.gan,b.gan)] || STEM_COMBINE[pairKey(b.gan,a.gan)] || null;
        var same = a.gan === b.gan;
        if (ck) {
          out.push({type:'天干五合', typeCode:'STEM_COMBINATION', aPillar:a.key, bPillar:b.key, aStem:a.gan, bStem:b.gan, candidateElement:ck, transformationStatus:'待審', description:'A'+a.label+a.gan+'與B'+b.label+b.gan+'構成天干五合，傳統化神候選'+ck+'；只確認配對，不直接判定合化。'});
        } else if (same || rel.type !== 'neutral') {
          out.push({type:same?'同干':'天干生剋', typeCode:same?'SAME_STEM':'STEM_ELEMENT_RELATION', aPillar:a.key, bPillar:b.key, aStem:a.gan, bStem:b.gan, relation:rel.type, description:'A'+a.label+a.gan+'與B'+b.label+b.gan+'：'+rel.label+'。'});
        }
      });
    });
    return out;
  }

  function branchPairRelation(a, b) {
    var rels = [];
    if (BRANCHES.indexOf(a)<0 || BRANCHES.indexOf(b)<0) return rels;
    if (a === b) {
      rels.push({type:'同支重疊', typeCode:'SAME_BRANCH', description:a+a+'同支重疊；表示相同主題容易被彼此放大，吉凶另審。'});
      if (SELF_PUNISH[a]) rels.push({type:'自刑候選', typeCode:'SELF_PUNISHMENT', description:a+a+'符合傳統自刑配對；不得直接推成心理或疾病結論。'});
    }
    if (CLASH[a] === b) rels.push({type:'六沖', typeCode:'CLASH', description:a+b+'六沖；先視為節奏、立場或生活方式的對立／變動訊號。'});
    if (SIX_COMBINE[a] === b) {
      var k = [a,b].sort(function(x,y){return BRANCHES.indexOf(x)-BRANCHES.indexOf(y);}).join('');
      var el = SIX_COMBINE_EL[k] || SIX_COMBINE_EL[a+b] || SIX_COMBINE_EL[b+a] || null;
      rels.push({type:'六合', typeCode:'SIX_COMBINATION', candidateElement:el, transformationStatus:'待審', description:a+b+'六合'+(el?'，傳統化神候選'+el:'')+'；配對存在不等於已合化，也可能呈現牽連或合絆。'});
    }
    if (HARM[a] === b) rels.push({type:'六害', typeCode:'HARM', description:a+b+'六害；先列為隱性牽制或期待落差的查表關係，強弱與吉凶另審。'});
    if (DESTRUCTION[a] === b) rels.push({type:'相破', typeCode:'DESTRUCTION', description:a+b+'相破；作為關係不穩或磨損的參考級訊號，不單獨定論。'});
    // Detect the pair in either display order; retain the traditional directed
    // edge separately. Swapping two people must not lose a relationship.
    var directed=PUNISH_PAIRS[a+b]?a+b:PUNISH_PAIRS[b+a]?b+a:null;
    if (directed) rels.push({type:'相刑', typeCode:'PUNISHMENT', traditionalDirection:directed, strengthClass:/子|卯/.test(directed)?'pair':'partial', description:a+b+'相刑（'+PUNISH_PAIRS[directed]+(/子|卯/.test(directed)?'':'，三刑未全')+'）；配對與傳統方向分列，不因A／B排序漏列，也不當成誰傷害誰。'});
    if(a!==b)TRINES.forEach(function(g){
      if(g.branches.indexOf(a)<0||g.branches.indexOf(b)<0)return;
      var mid=g.branches[1],hasMid=a===mid||b===mid;
      rels.push({type:hasMid?'半合':'拱合',typeCode:hasMid?'HALF_TRINE':'ARCH_TRINE',candidateElement:g.element,
        missingBranches:g.branches.filter(function(z){return z!==a&&z!==b;}),transformationStatus:'待審',interpretationScope:'CROSS_CHART_DISTRIBUTION_ONLY',
        description:a+b+(hasMid?'半合':'拱合')+g.element+'；'+(hasMid?'含中神的兩支配對，仍非完整三合局':'缺中神的虛拱參照')+'。跨盤不視為合化，也不能直接等同感情融洽。'});
    });
    return rels;
  }

  function branchCrossRelations(chartA, chartB, options) {
    options=options||{};
    var pa = getPillars(chartA), pb = getPillars(chartB), out = [];
    pa.forEach(function(a){
      pb.forEach(function(b){
        if ((options.unknownA&&a.key==='hour')||(options.unknownB&&b.key==='hour')) return;
        if (!a.zhi || !b.zhi) return;
        branchPairRelation(a.zhi,b.zhi).forEach(function(r){
          out.push(Object.assign({}, r, {
            aPillar:a.key, bPillar:b.key, aBranch:a.zhi, bBranch:b.zhi,
            description:'A'+a.label+a.zhi+'與B'+b.label+b.zhi+'：'+r.description
          }));
        });
      });
    });
    return out;
  }

  function crossGroupRelations(chartA, chartB, options) {
    options=options||{};
    var pa = getPillars(chartA), pb = getPillars(chartB);
    var all = pa.filter(function(x){return !(options.unknownA&&x.key==='hour');}).map(function(x){return {side:'A',pillar:x.key,branch:x.zhi};}).concat(pb.filter(function(x){return !(options.unknownB&&x.key==='hour');}).map(function(x){return {side:'B',pillar:x.key,branch:x.zhi};}));
    var branches = all.map(function(x){return x.branch;});
    var out = [];
    TRINES.concat(DIRECTIONALS).forEach(function(g, idx){
      if (!hasAll(branches,g.branches)) return;
      var participants = all.filter(function(x){return g.branches.indexOf(x.branch)>=0;});
      if (!participants.some(function(x){return x.side==='A';}) || !participants.some(function(x){return x.side==='B';})) return;
      out.push({
        type:idx<TRINES.length?'跨盤三合':'跨盤三會',
        typeCode:idx<TRINES.length?'CROSS_TRINE':'CROSS_DIRECTIONAL',
        branches:g.branches.slice(), element:g.element,
        participants:participants,
        transformationStatus:'待審',interpretationScope:'CROSS_CHART_DISTRIBUTION_ONLY',
        description:g.name+'所需三支分布於兩盤；這是跨盤分布參照，不是任何一方原局成局，不合併月令或五行力量。各自原局的成化另審。'
      });
    });
    return out;
  }

  function directionalTenGods(observerChart, partnerChart, options) {
    options=options||{};
    var dm = observerChart && observerChart.dm || (observerChart && observerChart.pillars && observerChart.pillars.day && observerChart.pillars.day.gan) || '';
    var hidden = partnerChart && partnerChart.cangGan || {};
    return getPillars(partnerChart).filter(function(p){return !(options.partnerUnknown&&p.key==='hour');}).map(function(p){
      var hs=safeArray(hidden[p.key]).map(function(stem){return {stem:stem,tenGod:tenGod(dm,stem)};});
      return {partnerPillar:p.key, partnerStem:p.gan, tenGod:tenGod(dm,p.gan), hidden:hs, description:'對命主'+dm+'而言，對方'+p.label+p.gan+'映射為'+tenGod(dm,p.gan)+(hs.length?'；該支藏干映射 '+hs.map(function(x){return x.stem+'＝'+x.tenGod;}).join('、'):'')+'。'};
    });
  }

  function elementComplement(chartA, chartB) {
    var epA = chartA && chartA.ep || {}, epB = chartB && chartB.ep || {};
    var favA = (chartA && chartA.wuxingStance && chartA.wuxingStance.xi) || safeArray(chartA && chartA.fav);
    var favB = (chartB && chartB.wuxingStance && chartB.wuxingStance.xi) || safeArray(chartB && chartB.fav);
    var jiA = (chartA && chartA.wuxingStance && chartA.wuxingStance.ji) || safeArray(chartA && chartA.unfav);
    var jiB = (chartB && chartB.wuxingStance && chartB.wuxingStance.ji) || safeArray(chartB && chartB.unfav);
    var dominantA = ELEMENTS.filter(function(e){return Number(epA[e]||0)>=25;});
    var dominantB = ELEMENTS.filter(function(e){return Number(epB[e]||0)>=25;});
    var supportA = dominantB.filter(function(e){return favA.indexOf(e)>=0;});
    var supportB = dominantA.filter(function(e){return favB.indexOf(e)>=0;});
    var loadA = dominantB.filter(function(e){return jiA.indexOf(e)>=0;});
    var loadB = dominantA.filter(function(e){return jiB.indexOf(e)>=0;});
    return {
      dominantA:dominantA, dominantB:dominantB,
      partnerMaySupportA:supportA, partnerMaySupportB:supportB,
      partnerMayLoadA:loadA, partnerMayLoadB:loadB,
      selectionRule:'僅將本系統相對權重達25%以上者列為偏強五行候選。',
      caveat:'此處只比較本系統的相對五行權重與扶抑候選，不代表對方本人等同某五行，也不能單獨定合不合。'
    };
  }

  function currentAndAnnual(chart,scope) {
    var dayun=safeArray(chart && chart.dayun),current = dayun.find(function(x){return x && x.isCurrent;}) || null;
    var ref=Number(chart&&chart._referenceTimestamp);
    var nowYear=referenceBaziYear(chart), byYear={};
    scopedDayun(chart,scope).forEach(function(d){safeArray(d&&d.liuNian).forEach(function(y){
      if(!y)return;
      if(scope ? scope.mode!=='all'&&(y.year<scope.start||y.year>scope.end) : y.year<nowYear-1||y.year>nowYear+4)return;
      if(!byYear[y.year])byYear[y.year]=Object.assign({},y,{dayun:d.gz,segments:[]});
      var group=byYear[y.year],segment=Object.assign({dayun:d.gz},y);
      if(!group.segments.some(function(s){return s.dayun===segment.dayun&&s.periodStart===segment.periodStart;}))group.segments.push(segment);
    });});
    Object.keys(byYear).forEach(function(y){var g=byYear[y];g.segments.sort(function(a,b){return String(a.periodStart).localeCompare(String(b.periodStart));});if(g.segments.length>1)g.level='交運分段，須分別判讀';});
    var annual=Object.keys(byYear).map(Number).sort().map(function(y){return byYear[y];});
    return {currentLuck:current, annual:annual};
  }

  function luckSynchronization(chartA, chartB,scope) {
    var a = currentAndAnnual(chartA,scope), b = currentAndAnnual(chartB,scope), years = uniq(a.annual.map(function(x){return x.year;}).concat(b.annual.map(function(x){return x.year;}))).sort();
    return {
      aCurrent:a.currentLuck, bCurrent:b.currentLuck,
      years:years.map(function(y){
        var ay=a.annual.find(function(x){return x.year===y;})||null;
        var by=b.annual.find(function(x){return x.year===y;})||null;
        if(ay&&by&&JSON.stringify(ay.annualWindow)!==JSON.stringify(by.annualWindow))throw new Error('雙方立春年度瞬間不一致，請重新排盤。');
        return {year:y,window:(ay||by).annualWindow,a:ay,b:by,note:'以共同 UTC 立春區間比較；交運年各自保留分段。真太陽時的鐘面讀數可不同，不代表節氣發生於不同瞬間。'};
      })
    };
  }

  function spousePalaceRelation(chartA, chartB) {
    var a = chartA && chartA.pillars && chartA.pillars.day || {}, b = chartB && chartB.pillars && chartB.pillars.day || {};
    return {
      aDayPillar:(a.gan||'')+(a.zhi||''), bDayPillar:(b.gan||'')+(b.zhi||''),
      stemRelation:elementRelation(STEM_EL[a.gan],STEM_EL[b.gan]),
      branchRelations:branchPairRelation(a.zhi,b.zhi),
      caveat:'日柱與日支是合盤重點之一，但不能凌駕兩張完整命局、角色情境及現實相處。'
    };
  }

  function getScenario(id) { return SCENARIOS.find(function(x){return x.id===id;}) || SCENARIOS[0]; }

  function buildCompatibility(chartA, chartB, options) {
    options = options || {};
    if (!chartA || !chartB) throw new Error('合盤需要兩張完整命盤');
    verifiedBirthFacts(chartA,options.metaA);verifiedBirthFacts(chartB,options.metaB);
    if(chartA.calculationPolicy.referenceInstant!==chartB.calculationPolicy.referenceInstant)throw new Error('雙方八字參考時刻不一致，請重新排盤。');
    var scenario = getScenario(options.scenarioId || 'marriage');
    var unknownA=!!(options.metaA&&options.metaA.unknown), unknownB=!!(options.metaB&&options.metaB.unknown);
    var relationOptions={unknownA:unknownA,unknownB:unknownB};
    var stems = stemCrossRelations(chartA,chartB,relationOptions);
    var branches = branchCrossRelations(chartA,chartB,relationOptions);
    var groups = crossGroupRelations(chartA,chartB,relationOptions);
    var tensionTypes = {CLASH:true,HARM:true,DESTRUCTION:true,PUNISHMENT:true,SELF_PUNISHMENT:true};
    var supportTypes = {STEM_COMBINATION:true,SIX_COMBINATION:true,CROSS_TRINE:true,CROSS_DIRECTIONAL:true};
    var tension = branches.filter(function(x){return tensionTypes[x.typeCode];});
    var support = stems.concat(branches).concat(groups).filter(function(x){return supportTypes[x.typeCode];});
    var signal = support.length && tension.length ? '支持與張力並存' : support.length ? '支持／牽連訊號較多' : tension.length ? '磨合與邊界議題較多' : '明顯配對訊號較少，需回到十神與現實互動';
    return {
      version:'1.6.0', scenario:scenario,
      personA:chartSummary(chartA,options.metaA||{}),
      personB:chartSummary(chartB,options.metaB||{}),
      dayMasters:{aToB:elementRelation(chartA.dmEl||STEM_EL[chartA.dm],chartB.dmEl||STEM_EL[chartB.dm]), bToA:elementRelation(chartB.dmEl||STEM_EL[chartB.dm],chartA.dmEl||STEM_EL[chartA.dm])},
      spousePalace:spousePalaceRelation(chartA,chartB),
      directionalTenGods:{aViewsB:directionalTenGods(chartA,chartB,{partnerUnknown:unknownB}),bViewsA:directionalTenGods(chartB,chartA,{partnerUnknown:unknownA})},
      stemRelations:stems, branchRelations:branches, groupRelations:groups,
      elementComplement:(unknownA||unknownB)?{partnerMaySupportA:[],partnerMaySupportB:[],partnerMayLoadA:[],partnerMayLoadB:[],caveat:'時辰未知，喜忌與五行互補尚未定；保留三柱的跨盤互動。',provisional:true}:elementComplement(chartA,chartB),
      luckSynchronization:(unknownA||unknownB)?{aCurrent:null,bCurrent:null,years:[],provisional:true}:luckSynchronization(chartA,chartB),
      evidenceSummary:{signal:signal,supportCount:support.length,tensionCount:tension.length,neutralRule:'數量只作資料整理，不是配對分數或成功機率。'},
      uncertainty:{unknownTimeA:unknownA,unknownTimeB:unknownB,hourRelationsExcluded:unknownA||unknownB,luckTimingProvisionalA:unknownA,luckTimingProvisionalB:unknownB,note:(unknownA||unknownB)?'未知時辰一方的時柱跨盤關係已排除；其精確起運、喜忌互補與歲運同步不作定論，已排除相關模型結果。':'雙方時辰已提供，仍須以出生資料準確性為前提。'},
      policy:{scenarioAware:true,roleAware:true,noSingleScore:true,noAutomaticTransformation:true,noDeterministicEvents:true,excludeUnknownHourRelations:true}
    };
  }

  function pillarFactLines(chart, unknown) {
    var P = chart && chart.pillars || {}, gods=chart&&chart.gods||{}, cang=chart&&chart.cangGan||{}, cs=chart&&chart.cs||{}, ny=chart&&chart.nayinAll||{};
    return PILLAR_ORDER.filter(function(k){return !(unknown && k==='hour');}).map(function(k){
      var p=P[k]||{}, g=gods[k]||{};
      return '・'+PILLAR_LABEL[k]+'：'+(p.gan||'')+(p.zhi||'')+'；天干十神 '+safeText(g.gan,'—')+'；藏干 '+safeArray(cang[k]).join('、')+'（'+safeArray(g.zhi).join('、')+'）；十二長生 '+safeText(cs[k],'—')+'；納音 '+safeText(ny[k],'—');
    });
  }

  function verifiedBirthFacts(chart,meta){
    if(!root.BAZI_CORE||typeof root.BAZI_CORE.birthFacts!=='function')throw new Error('時間核對元件版本不足，請重新整理後排盤。');
    return root.BAZI_CORE.birthFacts(chart,meta);
  }
  function birthFactLines(chart,meta){
    var f=verifiedBirthFacts(chart,meta);
    return ['【已核對的八字計算事實】',
      '原始民用：'+f.civilDateTime+'（'+(f.timezoneId||'UTC偏移 '+f.timezoneOffset)+'）；出生瞬間 UTC：'+(f.birthInstant||'時辰未知')+'。',
      '八字排盤時間：'+(f.chartDateTime||'時辰未知')+'；基準 '+f.chartTimeBasis+'；換日 '+f.dayBoundaryMode+'；時支 '+(f.hourBranch||'未定')+'。',
      '已核對四柱：'+f.pillars.map(function(p){return PILLAR_LABEL[p.key]+p.gz;}).join('、')+'。',
      '透干：'+f.exposedStems.map(function(g){return PILLAR_LABEL[g.pillar]+g.stem+'('+g.tenGod+')';}).join('、')+'；僅藏支而未透干：'+(f.hiddenOnlyStems.join('、')||'無')+'。',f.rule].join('\n');
  }
  function referenceBaziYear(chart){
    var instant=chart&&chart.calculationPolicy&&chart.calculationPolicy.referenceInstant;
    if(!instant||!root.BAZI_CORE)throw new Error('流年參考瞬間缺漏，請重新排盤。');
    return root.BAZI_CORE.getYearGanZhiAt(instant).year;
  }
  function periodLabel(period){return root.BAZI_CORE.periodLabel(period);}

  function interactionLines(chart) {
    var out = safeArray(chart && chart.branchInteractions).map(function(x){return '・'+safeText(x.type)+'：'+safeText(x.desc||x.description)+'；'+safeText(x.effect);});
    safeArray(chart && chart.tianGanHe).forEach(function(x){out.push('・天干五合：'+safeText(x.zh||x.pair)+'；合化狀態 '+safeText(x.transformationStatus,'待審'));});
    return out.length ? out : ['・未偵測到需特別列出的原局干支作用。'];
  }

  function luckLines(chart, limit) {
    return safeArray(chart && chart.dayun).filter(function(x){return x.gz && x.gz!=='小運';}).slice(0,limit||10).map(function(x){
      return '・'+x.gz+'：'+periodLabel(x)+'；干十神 '+safeText(x.god,'—')+'；支本氣十神 '+safeText(x.zGod,'—')+(x.isCurrent?' ★現行':'');
    });
  }

  function annualLines(chart, count) {
    var ref=Number(chart&&chart._referenceTimestamp), civilYear=Number.isFinite(ref)?new Date(ref).getUTCFullYear():new Date().getFullYear();
    var nowYear=referenceBaziYear(chart), byYear={};
    safeArray(chart&&chart.dayun).forEach(function(d){safeArray(d&&d.liuNian).forEach(function(y){if(y&&y.year>=nowYear){var group=byYear[y.year]||(byYear[y.year]=[]);if(!group.some(function(x){return x.dayun===d.gz&&x.periodStart===y.periodStart;}))group.push(Object.assign({dayun:d.gz},y));}});});
    return Object.keys(byYear).map(Number).sort().slice(0,count||5).map(function(year){return byYear[year].sort(function(a,b){return String(a.periodStart).localeCompare(String(b.periodStart));}).map(function(x){return '・'+year+' '+safeText(x.gz)+'（大運 '+safeText(x.dayun)+'；模型 '+safeText(x.level,'未標記')+'；區間 '+periodLabel(x)+'；干十神 '+safeText(x.god,'未列')+'）';}).join('\n');});
  }

  function modelLines(chart, compact) {
    var ep=chart&&chart.ep||{}, stance=chart&&chart.wuxingStance||{}, th=chart&&chart.tiaohou||{};
    function modelText(value){return value&&typeof value==='object'?JSON.stringify(value):safeText(value,'未提供');}
    var ge=chart&&chart.zhengGe;
    if(ge){ge={geName:ge.geName,isSpecial:!!ge.isSpecial,patternType:ge.patternType||null,patternTenGod:ge.patternTenGod||null,patternStem:ge.patternStem||null,geGod:ge.geGod,geGan:ge.geGan,touChu:ge.touChu,benQiGod:ge.benQiGod,monthMainQiStem:ge.monthMainQiStem||null,monthMainQiTenGod:ge.monthMainQiTenGod||null};}
    return [
      '日主 '+safeText(chart&&chart.dm)+'（'+safeText(chart&&chart.dmEl)+'），本系統旺衰候選：'+safeText(chart&&chart.strongLevel,'未判定')+'；自黨相對分 '+safeText(chart&&chart.selfPts,'—')+'。',
      '五行相對權重：'+ELEMENTS.map(function(e){return e+safeText(ep[e],0)+'%';}).join('、')+'。此為本模型內比較，不是古籍固定比例或科學測量。',
      '扶抑立場：'+safeText(stance.summary, '喜候選 '+safeArray(chart&&chart.fav).join('、')+'；忌候選 '+safeArray(chart&&chart.unfav).join('、'))+'。',
      '月令格局候選：'+modelText(ge)+'。特殊格局的格局核心與月支本氣十神已分欄；一般格局的格神、相神與成敗救應仍須回到透藏根氣。touChu 為空時不能宣稱月令藏干已透。格局用神與扶抑用神分義。',
      '官殺辨析：'+modelText(chart&&chart.guanShaMix)+'。',
      '核心扶抑與調候：'+(typeof root.baziCoreAnalysisLines==='function'?root.baziCoreAnalysisLines(chart).join('\n'):modelText(chart&&chart.fuyiAssessment))+'。',
      '合化判別：'+(typeof root.baziHuaQiLines==='function'?root.baziHuaQiLines(chart).join('\n'):modelText(chart&&chart.huaQiAssessments))+'。',
      '病藥模型：'+modelText(chart&&chart.medicineGod)+'；通關模型：'+modelText(chart&&chart.relayGod)+'。未提供的模型不可補造。',
      '調候鏡頭：候選五行 '+safeArray(th.need).join('、')+'；'+safeText(th.detail)+(th.sourceUrl?'；校對來源 '+th.sourceUrl:'')+'。調候與扶抑分開，不自動互相覆蓋。',
      '已計算特殊規則：'+specialRuleText(chart&&chart.specialRuleAssessment,compact)+'。',
      '其他特殊格局待判資料：'+(safeArray(chart&&chart.specialStructureCandidates).length?safeArray(chart.specialStructureCandidates).map(function(x){return modelText(x);}).join('、'):'無；以月令一般格局為主')+'。'
    ];
  }

  function specialRuleText(a,compact){
    if(!a)return '未提供';
    var selected=(a.rules||[]).filter(function(r){return !compact||r.status!=='not-established';});
    var sources=[],scopes=[],rows=selected.map(function(r){
      if(r.source&&sources.indexOf(r.source)<0)sources.push(r.source);if(r.scope&&scopes.indexOf(r.scope)<0)scopes.push(r.scope);
      return r.id+' '+r.name+'｜'+r.status+'｜'+(r.checks||[]).map(function(c){return (c.passed===true?'✓':c.passed===false?'×':'?')+c.condition+(c.evidence&&c.evidence.length?'（'+c.evidence.map(function(v){return v&&typeof v==='object'?JSON.stringify(v):String(v);}).join('、')+'）':'');}).join('；')+
        (r.scope?'；範圍'+(scopes.indexOf(r.scope)+1):'')+(r.variant?'；異說：'+r.variant:'');
    });
    // matched repeats whole rule objects; their IDs retain the relationship.
    return [a.version+'；'+a.policy,'命中：'+(a.matched||[]).map(function(r){return r.id;}).join('、'),a.ordinaryUsePolicy,rows.join('\n'),scopes.map(function(v,i){return '範圍'+(i+1)+'：'+v;}).join('\n'),compact?'未成立格局 '+(a.rules.length-selected.length)+' 項不展開；完整檢核保留在原始資料，未列者不可當作成立。':'','合化完整核對見上方「合化判別」，不重複列出同一份資料。','來源：'+sources.join('；')].filter(Boolean).join('\n');
  }

  function promptScope(question,referenceYear){
    var q=root.JY_READING_QUALITY;
    return q&&q.timeScope?q.timeScope(question,referenceYear):{mode:'range',start:referenceYear,end:referenceYear+3};
  }
  function scopedDayun(chart,scope){var all=safeArray(chart&&chart.dayun).filter(function(d){return d.gz&&d.gz!=='小運';});return scope&&scope.requestedDecades?all.slice(0,scope.requestedDecades):all;}
  function selectedAnnuals(chart,scope){
    var out=[];
    scopedDayun(chart,scope).forEach(function(d){safeArray(d.liuNian).forEach(function(y){
      if(scope.mode!=='all'&&(y.year<scope.start||y.year>scope.end))return;
      if(!out.some(function(x){return x.year===y.year&&x.dayun===d.gz&&x.periodStart===y.periodStart;}))out.push(Object.assign({dayun:d.gz},y));
    });});
    return out.sort(function(a,b){return a.year-b.year||String(a.periodStart).localeCompare(String(b.periodStart));});
  }
  function buildChartDataBlock(chart, meta, options) {
    meta=meta||{};
    options=options||{};
    var report=root.JY_READING_QUALITY&&root.JY_READING_QUALITY.reportScope?root.JY_READING_QUALITY.reportScope(options.question,'bazi'):root.JYReadingWorkflow.reportScope(options.question,'bazi');
    options=Object.assign({},options,{compact:!!options.compact||report.annualRequested||!!report.requestedDecades||report.allDecades});
    var verified=birthFactLines(chart,meta);
    if (meta.unknown) return [globalThis.JYNativeAnalysis&&chart&&chart.pillars?globalThis.JYNativeAnalysis.prompt('bazi',chart,options.question,{unknown:!!meta.unknown,supplement:!!options.nativeSupplement,seasonalAlreadyListed:!meta.unknown&&!!chart.structureFacts&&!!chart.seasonalAssessment}):'',
      '【A. 三柱資料：時辰未知】',
      verified,
      '命主：'+escapeLine(meta.name||'未具名')+'・'+escapeLine(meta.birthLine||'出生日期未標示'),
      pillarFactLines(chart,true).join('\n'),
      '午時是暫排值，已排除時柱及其衍生模型、命宮、神煞和精確交運時間。請以三柱作有限分析；喜忌格局、合盤五行互補與人格卡若依賴暫排全盤，只列為待校時候選。',
      '日期若接近節氣或換日邊界，年月日柱也可能需要出生時間才能確認。'
    ].join('\n');
    var current=safeArray(chart&&chart.dayun).find(function(x){return x&&x.isCurrent;});
    var scope=options.scope||promptScope(options.question,referenceBaziYear(chart));
    var chosen=options.compact?selectedAnnuals(chart,scope):[];
    var decades=options.compact?scopedDayun(chart,scope).filter(function(d){return scope.mode==='all'||d.isCurrent||chosen.some(function(y){return y.dayun===d.gz;});}):[];
    return [globalThis.JYNativeAnalysis&&chart&&chart.pillars?globalThis.JYNativeAnalysis.prompt('bazi',chart,options.question,{unknown:!!meta.unknown,supplement:!!options.nativeSupplement,seasonalAlreadyListed:!meta.unknown&&!!chart.structureFacts&&!!chart.seasonalAssessment}):'',
      '【A. 排盤與曆法資料】',
      verified,
      '命主：'+escapeLine(meta.name||'未具名')+'・'+escapeLine(meta.genderLabel||chart&&chart.gender||'')+'・'+escapeLine(meta.birthLine||'出生資料未標示'),
      meta.solarInfo&&meta.solarInfo.trueSolarDateTime?'民用出生時間校正為真太陽時：'+meta.solarInfo.trueSolarDateTime+'；經度 '+safeText(meta.longitude)+'°；時區 '+safeText(meta.timezoneId||meta.solarInfo.timezoneId)+'。':'真太陽時資料未提供。',
      '出生瞬間（UTC）：'+safeText(chart&&chart.calculationPolicy&&chart.calculationPolicy.birthInstant,'未提供')+'；年、月柱在 UTC+8 核對節氣，日、時柱依本盤牆鐘；起運採分鐘折算法。',
      '排盤政策：換日 '+safeText(chart&&chart.calculationPolicy&&chart.calculationPolicy.dayBoundaryMode)+'；流年以立春為界；大運採半開區間 [起點,下一起點)。',
      meta.unknown?'時辰未知：目前以暫定時刻排盤，時柱、神煞、子女晚景象義及精確起運的把握度較低。':'',
      pillarFactLines(chart).join('\n'),
      (meta.unknown?'・暫定起運（以12:00暫排，精確交運把握度較低）：':'・起運：')+safeText(chart&&chart.qiyun&&chart.qiyun.startAgeText)+'；交運點 '+safeText(chart&&chart.qiyun&&(chart.qiyun.startUtc8||chart.qiyun.startDate))+'（UTC+8 民用時間）'+'；順逆 '+safeText(chart&&chart.qiyun&&chart.qiyun.direction)+'。',
      '・輔助資料：生肖 '+safeText(CHINESE_ZODIAC[chart&&chart.pillars&&chart.pillars.year&&chart.pillars.year.zhi],'—')+'；空亡 '+(chart&&chart.kongwang&&!Array.isArray(chart.kongwang)?'年柱 '+safeArray(chart.kongwang.year).join('、')+'；日柱 '+safeArray(chart.kongwang.day).join('、'):(safeArray(chart&&chart.kongwang).join('、')||'—'))+'；命宮 '+safeText(chart&&chart.mingGong&&(chart.mingGong.gan+chart.mingGong.zhi),'—')+'；胎元 '+safeText(chart&&chart.taiYuan&&(chart.taiYuan.gan+chart.taiYuan.zhi),'—')+'；八字重量 '+safeText(chart&&chart.chenggu&&chart.chenggu.display,'未計得')+'。稱骨、命宮、胎元、納音與神煞可作輔助視角，主判仍綜合月令與全局生剋。',
      '【原局干支作用——由核心唯一計算】',
      interactionLines(chart).join('\n'),
      '判讀提示：配對存在後仍需審成化條件；沖刑害破的方向結合所動之柱、十神、喜忌與歲運。',
      '【B. 前端流派模型（供交叉核對）】',
      modelLines(chart,options.compact).join('\n'),
      '【大運資料】',
      options.compact?'本題實算覆蓋：大運 '+decades.length+' 段；年度分段 '+chosen.length+' 列；年度 '+uniq(chosen.map(function(y){return y.year;})).length+' 年'+(scope.requestedDecades?'；原題要求前'+scope.requestedDecades+'個大運':'')+'。':'',
      scope.requestedDecades&&scope.requestedDecades>scopedDayun(chart,scope).length?'【未取得資料】本次只實算'+scopedDayun(chart,scope).length+'個大運，不可補造未算區間。':'',
      options.compact?decades.map(function(d){return '・'+d.gz+'：'+periodLabel(d)+'；干十神 '+d.god+'；支本氣十神 '+d.zGod+(d.isCurrent?' ★現行':'');}).join('\n'):luckLines(chart,10).join('\n'),
      current?'現行大運：'+current.gz+'，'+periodLabel(current)+'。':'現行大運未能判定。',
      options.compact?'【本題立春年度】':'【近五個立春年度】',
      options.compact?(chosen.map(function(x){return '・'+x.year+' '+x.gz+'（大運 '+x.dayun+'；區間 '+periodLabel(x)+'；干十神 '+safeText(x.god,'未列')+'）';}).join('\n')||'所問年度超出本次已算資料，不能補造運限。'):annualLines(chart,5).join('\n')||'・近年流年資料未能取得。',
      '流年與大運等級只能當本模型內相對排序；刑沖合害只列觸發，不自動加減分。',
      '神煞只作末位輔助：'+safeArray(chart&&chart.shensha).join('、')+'。'
    ].filter(Boolean).join('\n');
  }

  function universalQuestionRootLines() {
    return promptSpec().rootProtocolLines();
  }

  function universalJudgmentRuleLines(mode) {
    var spec=promptSpec();
    return spec.universalRulesLines().concat(spec.domainRouterLines(mode||'single'));
  }

  function baziBrandTailLines(mode) {
    return promptSpec().brandTailLines(mode);
  }

  function buildSinglePrompt(lensId, chart, meta, userQuestion) {
    if(globalThis.JYPromptPacket)return globalThis.JYPromptPacket.build('bazi',chart,userQuestion||'請完整分析本次八字',{unknown:!!meta.unknown,topic:lensId,meta:meta});
    var lens=LENSES[lensId]||LENSES.general;
    return globalThis.JYReadingWorkflow.finish([
      '【角色】',
      promptSpec().roleText('single'),
      '【分析模式】'+lens.name,
      lens.question,
      '【使用者問題】',
      escapeLine(userQuestion||lens.question)
    ].concat(
      universalQuestionRootLines(),
      [buildChartDataBlock(chart,meta,{compact:lensId!=='chart',question:userQuestion||lens.question}),'【判讀規範】'],
      universalJudgmentRuleLines(lensId==='chart'?'chart':'single'),
      promptSpec().lensGuideLines(lensId),
      promptSpec().answerContractLines(lensId==='chart'?'chart':'single'),
      [
        '分析模式補充：純排盤模式聚焦資料校核；原局題以長期結構為主；歲運題引用資料中的交界；多選題使用一致標準比較。'
      ],
      baziBrandTailLines(lensId==='chart'?'chart':'single')
    ).join('\n\n'),{method:'bazi',question:userQuestion||lens.question});
  }

  function relationFacts(comp) {
    var s=comp.scenario;
    var lines=[];
    lines.push('情境：'+s.name+'；角色A＝'+s.roleA+'；角色B＝'+s.roleB+'。');
    lines.push('情境焦點：'+s.focus+'。');
    lines.push('日主五行互動：A→B '+comp.dayMasters.aToB.label+'；B→A '+comp.dayMasters.bToA.label+'。這是元素定義，不是誰付出、誰接受或誰更愛；方向不同時須分開解讀。');
    lines.push('日柱／夫妻宮：A '+comp.spousePalace.aDayPillar+'；B '+comp.spousePalace.bDayPillar+'；日干 '+comp.spousePalace.stemRelation.label+'。');
    safeArray(comp.spousePalace.branchRelations).forEach(function(x){lines.push('・日支作用：'+x.description);});
    safeArray(comp.stemRelations).filter(function(x){return x.typeCode==='STEM_COMBINATION'||(x.aPillar==='day'&&x.bPillar==='day');}).forEach(function(x){lines.push('・'+x.description);});
    safeArray(comp.branchRelations).forEach(function(x){lines.push('・'+x.description);});
    safeArray(comp.groupRelations).forEach(function(x){lines.push('・'+x.description);});
    if (!comp.branchRelations.length&&!comp.groupRelations.length) lines.push('・跨盤地支未偵測到需特別列出的合沖刑害破；不代表關係一定平淡或合適。');
    var c=comp.elementComplement;
    if(c.provisional){lines.push(c.caveat);return lines;}
    lines.push('五行互補候選：B較強五行中落入A喜候選＝'+(c.partnerMaySupportA.join('、')||'無明顯項')+'；A較強五行中落入B喜候選＝'+(c.partnerMaySupportB.join('、')||'無明顯項')+'。');
    lines.push('五行負荷候選：B較強五行中落入A忌候選＝'+(c.partnerMayLoadA.join('、')||'無明顯項')+'；A較強五行中落入B忌候選＝'+(c.partnerMayLoadB.join('、')||'無明顯項')+'。');
    lines.push(c.caveat);
    lines.push('跨盤資料不按吉凶筆數成判：先看各自全局、日支及切題作用；同一柱位配對的沖刑合破是同組關係，不能各算一份獨立證據。');
    return lines;
  }

  function buildCompatibilityDataBlock(comp,options) {
    options=options||{};
    var scope=promptScope(options.question,referenceBaziYear(comp._chartA));
    // Select from actual calculated years, not the default six-year UI preview.
    var sync=options.compact&&!comp.luckSynchronization.provisional?luckSynchronization(comp._chartA,comp._chartB,scope):comp.luckSynchronization;
    function window(w){if(!w)return null;return {start:w.startUtc8,endExclusive:w.endExclusiveUtc8,timeBasis:'UTC+08:00',interval:'[start,end)'};}
    function luck(d){if(!d)return null;return {gz:d.gz,ageStart:d.ageStart,ageEnd:d.ageEnd,window:window(d.window)};}
    function annual(d){if(!d)return null;return {gz:d.gz,
      segments:safeArray(d.segments).map(function(s){return {dayun:s.dayun,window:window(s.window)};})};}
    return ['【A方八字】',buildChartDataBlock(comp._chartA||{},comp._metaA||{},options),
      '【B方八字】',buildChartDataBlock(comp._chartB||{},comp._metaB||{},options),
      '【八字跨盤事實與候選模型】',relationFacts(comp).join('\n'),
      '【雙向十神映射】','aViewsB／bViewsA 是以該方日主計算的符號對照，並非任何人的主觀想法。七殺與正官皆須判實際制化，不能按名稱定壓力或信任。',JSON.stringify(comp.directionalTenGods),
      '【八字歲運同步】',JSON.stringify({aCurrent:luck(sync.aCurrent),bCurrent:luck(sync.bCurrent),
        timeRule:'所有區間為共同 UTC+8 民用時間；各方 segments 為與大運相交後的區間，不是不同的立春。',
        years:sync.years.map(function(x){return {year:x.year,annualWindow:window(x.window),a:annual(x.a),b:annual(x.b)};})}),
      '資料界線：'+comp.uncertainty.note].join('\n\n');
  }

  function buildCompatibilityPrompt(comp, userQuestion) {
    if(globalThis.JYPromptPacket)return globalThis.JYPromptPacket.build('compat',comp,userQuestion||'請完整分析双方支持與磨合');
    var s=comp.scenario;
    return globalThis.JYReadingWorkflow.finish([
      '【角色】',
      promptSpec().roleText('compatibility'),
      '【合盤情境】',
      s.name+'；A為'+s.roleA+'，B為'+s.roleB+'。請依此情境理解雙方角色、權責與互動方式。',
      '【使用者問題】',
      escapeLine(userQuestion||'請分析雙方在此情境下的契合、摩擦、溝通、長期壓力、支持方式、節奏與邊界。')
    ].concat(
      universalQuestionRootLines('compatibility'),
      [
        '【A方命盤】',
        buildChartDataBlock(comp._chartA||{},comp._metaA||{},{compact:true,question:userQuestion}),
        '【B方命盤】',
        buildChartDataBlock(comp._chartB||{},comp._metaB||{},{compact:true,question:userQuestion}),
        '【跨盤事實與模型整理】',
        relationFacts(comp).join('\n'),
        globalThis.JYNativeAnalysis?globalThis.JYNativeAnalysis.prompt('compat',comp,userQuestion):'',
        '資料可信度：'+safeText(comp.uncertainty&&comp.uncertainty.note,'未標示')+'。',
        '【雙向十神映射】',
        'A看B：'+comp.directionalTenGods.aViewsB.map(function(x){return PILLAR_LABEL[x.partnerPillar]+x.partnerStem+'＝'+x.tenGod+(x.hidden&&x.hidden.length?'（藏干 '+x.hidden.map(function(h){return h.stem+'＝'+h.tenGod;}).join('、')+'）':'');}).join('；')+'。',
        'B看A：'+comp.directionalTenGods.bViewsA.map(function(x){return PILLAR_LABEL[x.partnerPillar]+x.partnerStem+'＝'+x.tenGod+(x.hidden&&x.hidden.length?'（藏干 '+x.hidden.map(function(h){return h.stem+'＝'+h.tenGod;}).join('、')+'）':'');}).join('；')+'。',
        '十神映射有方向性；同一人對A與B可能呈現不同角色感受。',
        '【運勢同步】',
        'A現行大運：'+(comp.luckSynchronization.aCurrent?comp.luckSynchronization.aCurrent.gz+'（'+periodLabel(comp.luckSynchronization.aCurrent)+'）':'未判定')+'。',
        'B現行大運：'+(comp.luckSynchronization.bCurrent?comp.luckSynchronization.bCurrent.gz+'（'+periodLabel(comp.luckSynchronization.bCurrent)+'）':'未判定')+'。',
        comp.luckSynchronization.years.map(function(x){return '・'+x.year+'：A '+(x.a?x.a.gz+'／'+x.a.level:'無資料')+'；B '+(x.b?x.b.gz+'／'+x.b.level:'無資料')+'。';}).join('\n'),
        '【判讀規範】'
      ],
      universalJudgmentRuleLines('compatibility'),
      promptSpec().scenarioGuideLines(s.id),
      promptSpec().answerContractLines('compatibility'),
      [
        '合盤方法：先分析兩人各自原局，再讀A→B與B→A的十神方向、跨盤干支作用和歲運同步。',
        '回答請分清A方、B方與共同關係層，說明吸引、支持、摩擦、權責／界線、溝通修復、長期壓力、時間節奏與可執行協議。',
        '支持與張力的筆數只用來整理線索，不是配對分數。請依雙方全局與現實互動判斷；未知時辰已排除的喜忌、時柱與運勢同步不得補回。'+s.cautions
      ],
      baziBrandTailLines('compatibility')
    ).join('\n\n'),{methods:['compat','bazi'],question:userQuestion});
  }

  var PERSONALITY_CORES = [
    '靜域觀察者','深林規劃者','獨立鍛造者','邊界守望者',
    '明場推進者','群島協作者','破浪實作者','星火領航者'
  ];
  var PERSONALITY_VARIANTS = ['穩態版','流變版','共振版','破局版'];

  function godCounts(chart) {
    var out={比肩:0,劫財:0,食神:0,傷官:0,偏財:0,正財:0,七殺:0,正官:0,偏印:0,正印:0};
    var g=chart&&chart.gods||{};
    PILLAR_ORDER.forEach(function(k){
      var x=g[k]||{};
      if (own(out,x.gan)) out[x.gan]++;
      safeArray(x.zhi).forEach(function(v){if(own(out,v))out[v]++;});
    });
    return out;
  }

  function personalityAxes(chart) {
    var gc=godCounts(chart), p=getPillars(chart), yin=0,yang=0;
    p.forEach(function(x){if(YINYANG[x.gan]==='陽')yang++;else if(YINYANG[x.gan]==='陰')yin++;});
    var outward=(gc.食神+gc.傷官+gc.偏財+gc.正財), inward=(gc.偏印+gc.正印+gc.比肩+gc.劫財);
    var structured=(gc.正官+gc.七殺+gc.正印+gc.偏印), free=(gc.食神+gc.傷官+gc.比肩+gc.劫財);
    var relational=(gc.正財+gc.偏財+gc.正官+gc.正印+gc.比肩), selfLed=(gc.劫財+gc.傷官+gc.七殺+gc.偏印);
    var resilient=!!(chart&&(chart.strong===true||['中和','偏強','身強','太強'].indexOf(chart.strongLevel)>=0));
    var adaptive=yin>yang || safeArray(chart&&chart.branchInteractions).length>=2;
    return [
      {key:'energy',left:'內省',right:'外放',rightSelected:outward>inward,inputs:{outward:outward,inward:inward,comparison:'>'},evidence:'輸出／財星訊號 '+outward+'，印比訊號 '+inward},
      {key:'order',left:'自主',right:'秩序',rightSelected:structured>=free,inputs:{structured:structured,free:free,comparison:'>='},evidence:'官印訊號 '+structured+'，食傷比劫訊號 '+free},
      {key:'relation',left:'獨行',right:'協作',rightSelected:relational>selfLed,inputs:{relational:relational,selfLed:selfLed,comparison:'>'},evidence:'關係導向訊號 '+relational+'，自我驅動訊號 '+selfLed},
      {key:'pressure',left:'敏感',right:'韌行',rightSelected:resilient,inputs:{strong:chart.strong,strongLevel:chart.strongLevel,acceptedLevels:['中和','偏強','身強','太強']},evidence:'旺衰候選 '+safeText(chart&&chart.strongLevel,'未判定')},
      {key:'rhythm',left:'穩態',right:'變通',rightSelected:adaptive,inputs:{yin:yin,yang:yang,branchInteractions:safeArray(chart.branchInteractions).length,operator:'yin>yang OR branchInteractions>=2'},evidence:'陰干數 '+yin+'、陽干數 '+yang+'；原局作用 '+safeArray(chart&&chart.branchInteractions).length+' 項'}
    ];
  }

  function buildPersonality(chart, meta) {
    if(meta && meta.unknown) return {
      system:'靜月五軸人格',version:'1.1.0',independent:true,provisional:true,
      disclaimer:'出生時辰未知，五軸人格類型尚未確定。可先以三柱及實際行為整理問題，確認時辰後再檢視完整模型。這不是心理測驗或科學診斷。',
      index:null,code:'未定',name:'時辰待確認',traits:[],axes:[],strengths:[],
      watch:['暫排時柱可能改變十神比例與旺衰，不能據此貼上固定人格標籤。'],chart:chartSummary(chart,meta),
      natalEvidence:buildChartDataBlock(chart,meta,{compact:true,question:'原局人格與壓力反應'})
    };
    var axes=personalityAxes(chart), bits=axes.map(function(x){return x.rightSelected?1:0;}), idx=bits.reduce(function(a,b){return (a<<1)|b;},0);
    var coreIdx=(bits[0]<<2)|(bits[1]<<1)|bits[2], variantIdx=(bits[3]<<1)|bits[4];
    var code=(bits[0]?'E':'I')+(bits[1]?'S':'F')+(bits[2]?'C':'A')+(bits[3]?'T':'V')+(bits[4]?'M':'P');
    var traits=axes.map(function(x){return x.rightSelected?x.right:x.left;});
    var name=PERSONALITY_CORES[coreIdx]+'・'+PERSONALITY_VARIANTS[variantIdx];
    var strengths=[]; var watch=[];
    if(bits[0]) strengths.push('較容易把想法推到外部世界'); else strengths.push('擅長先觀察、整理再回應');
    if(bits[1]) strengths.push('重視規則、品質與可預期性'); else strengths.push('能自行定義方法並保持彈性');
    if(bits[2]) strengths.push('較會讀取互動與合作需求'); else strengths.push('獨立判斷與自我驅動較鮮明');
    if(bits[3]) strengths.push('承壓時較能維持推進'); else watch.push('高壓下可能需要更多恢復與安全邊界');
    if(bits[4]) strengths.push('面對變動時切換速度較快'); else strengths.push('能透過固定節奏累積成果');
    if(bits[0]&&bits[2]) watch.push('外部承諾過多時，可能分散自己的節奏');
    if(!bits[0]&&!bits[2]) watch.push('過度獨自消化時，需求可能不易被他人看見');
    if(bits[1]&&!bits[4]) watch.push('規則與穩定偏好過強時，可能降低試錯速度');
    if(!bits[1]&&bits[4]) watch.push('彈性很高時，需要額外建立收尾與紀錄機制');
    return {
      system:'靜月五軸人格', version:'1.0.0', independent:true,
      disclaimer:'此為本地自建的生日人格翻譯工具，不是 OpenFate BZTI，也未使用其未公開演算法。結果屬傳統命理語言的輕量自我觀察，不是心理測驗或科學診斷。',
      index:idx, code:code, name:name, traits:traits, axes:axes,
      modelInputs:{godCounts:godCounts(chart),pillars:getPillars(chart),strong:chart.strong,strongLevel:chart.strongLevel,branchInteractions:safeArray(chart.branchInteractions)},
      strengths:uniq(strengths), watch:uniq(watch),
      chart:chartSummary(chart,meta||{}),
      natalEvidence:buildChartDataBlock(chart,meta||{},{compact:true,question:'原局人格與壓力反應'})
    };
  }

  function buildPersonalityPrompt(personality, userQuestion) {
    if(globalThis.JYPromptPacket)return globalThis.JYPromptPacket.build('personality',personality,userQuestion||'如何理解自己的行為與壓力反應？');
    if(personality.provisional) return globalThis.JYReadingWorkflow.finish([
      '【角色】'+promptSpec().roleText('personality'),
      '【使用者問題】'+escapeLine(userQuestion||'如何理解自己的行為與壓力反應？'),
      personality.disclaimer,
      '【三柱參考】'+safeArray(personality.chart&&personality.chart.pillars).map(function(x){return x.label+' '+x.gan+x.zhi;}).join('；'),
      personality.natalEvidence||'',
      '先依三柱可支持的結構與當事人已提供的具體行為分析；將可觀察的傾向、反例與待確認部分說清楚。節氣或換日附近的三柱仍需核對。'
    ].concat(universalQuestionRootLines('personality'),universalJudgmentRuleLines('personality'),promptSpec().answerContractLines('personality'),baziBrandTailLines('personality')).join('\n\n'),{method:'personality',question:userQuestion});
    return globalThis.JYReadingWorkflow.finish([
      '【角色】'+promptSpec().roleText('personality'),
      '【系統聲明】'+personality.disclaimer,
      '【使用者問題】'+escapeLine(userQuestion||'請用易懂、可驗證、不貼死標籤的方式解讀這張人格卡。')
    ].concat(
      universalQuestionRootLines('personality'),
      [
        '【人格原局依據】',personality.natalEvidence||'舊人格紀錄未保存完整原局；先依已保留資料分析，完整制化需重新排盤。',
        globalThis.JYNativeAnalysis?globalThis.JYNativeAnalysis.prompt('personality',personality,userQuestion):'',
        '【人格卡】',
        personality.name+'｜代碼 '+personality.code+'｜五軸：'+personality.traits.join('／'),
        personality.axes.map(function(x){return '・'+x.left+'／'+x.right+'：選擇 '+(x.rightSelected?x.right:x.left)+'；依據 '+x.evidence+'。';}).join('\n'),
        '優勢候選：'+personality.strengths.join('；')+'。',
        '留意點：'+(personality.watch.join('；')||'無單一固定弱點，仍需看情境')+'。',
        '【分析重點】',
        '1. 第一段直接回答問題，再說明人格特質的正向表現、壓力表現與轉化方式。',
        '2. 每個主要特質請附可觀察行為、可能反例，以及會改變表現的情境。',
        '3. 問職涯、關係或壓力時，將人格卡與完整八字及現實資料交叉分析。'
      ],
      universalJudgmentRuleLines('personality'),
      promptSpec().answerContractLines('personality'),
      [
        '人格輸出補充：聚焦最有根據的特質，交代適用情境、優勢、風險、反例與可執行調整。'
      ],
      baziBrandTailLines('personality')
    ).join('\n\n'),{method:'personality',question:userQuestion});
  }

  function normalizeBaziString(input) {
    var chars=String(input||'').replace(/[\s,，、/|｜·・._-]+/g,'');
    if(chars.length!==8) throw new Error('四柱請輸入8個干支字，例如：戊寅己未己卯辛未');
    var pillars=[];
    for(var i=0;i<8;i+=2){
      var gan=chars.charAt(i),zhi=chars.charAt(i+1);
      if(STEMS.indexOf(gan)<0||BRANCHES.indexOf(zhi)<0) throw new Error('第'+(i/2+1)+'柱不是有效干支：'+gan+zhi);
      pillars.push(gan+zhi);
    }
    return {normalized:pillars.join(' '),compact:pillars.join(''),pillars:pillars};
  }

  function chartPillarStrings(fact) {
    if(!fact||!fact.pillars)return [];
    return PILLAR_ORDER.map(function(k){var x=fact.pillars[k]||{};return (x.gan||'')+(x.zhi||'');});
  }

  function samePrefix(got,target,count) {
    for(var i=0;i<count;i++)if(got[i]!==target[i])return false;
    return true;
  }

  function reverseHourRange(hour) {
    if(hour===23)return '23:00–23:59';
    if(hour===0)return '00:00–00:59';
    return String(hour).padStart(2,'0')+':00–'+String(hour+1).padStart(2,'0')+':59';
  }

  function reverseBaziToSolarTimes(options) {
    options=options||{};
    if(!root.BaziCalendarCore||!root.BaziCalendarCore.hasEngine()) throw new Error('缺少 lunar-javascript 曆法引擎');
    var parsed=normalizeBaziString(options.bazi), target=parsed.pillars;
    var startYear=Math.trunc(Number(options.startYear)),endYear=Math.trunc(Number(options.endYear==null?new Date().getFullYear():options.endYear));
    var limit=Math.max(1,Math.min(200,Math.trunc(Number(options.limit)||50)));
    var mode=options.dayBoundaryMode==='MIDNIGHT_00'?'MIDNIGHT_00':'ZI_HOUR_23';
    if(!Number.isFinite(startYear)||!Number.isFinite(endYear)||startYear<1||endYear<startYear)throw new Error('反查年份範圍無效');
    if(endYear-startYear>300)throw new Error('一次反查最多301個公曆年份，請縮小範圍');
    var calculate=root.BaziCalendarCore.calculateChart, candidateYears=[];
    for(var y=startYear;y<=endYear;y++){
      var jan=chartPillarStrings(calculate({year:y,month:1,day:15,hour:12,minute:0,second:0,dayBoundaryMode:mode}));
      var jul=chartPillarStrings(calculate({year:y,month:7,day:1,hour:12,minute:0,second:0,dayBoundaryMode:mode}));
      if((jan[0]===target[0]||jul[0]===target[0])&&candidateYears.indexOf(y)<0)candidateYears.push(y);
    }
    var matches=[],seen={},hours=[0,1,3,5,7,9,11,13,15,17,19,21];
    function exact(y,m,d,h){
      var fact=calculate({year:y,month:m,day:d,hour:h,minute:0,second:0,dayBoundaryMode:mode}),got=chartPillarStrings(fact);
      if(got.join('')!==target.join(''))return;
      var key=y+'-'+m+'-'+d+' '+h;
      if(seen[key])return;seen[key]=true;
      matches.push({year:y,month:m,day:d,hour:h,minute:0,datetime:y+'-'+String(m).padStart(2,'0')+'-'+String(d).padStart(2,'0')+' '+String(h).padStart(2,'0')+':00:00',hourRange:reverseHourRange(h),pillars:got.join(' '),dayBoundaryMode:mode,clockTimeOnly:true});
    }
    outer:for(var yi=0;yi<candidateYears.length;yi++){
      var year=candidateYears[yi],date=new Date(Date.UTC(year,0,1));
      while(date.getUTCFullYear()===year){
        var m=date.getUTCMonth()+1,d=date.getUTCDate();
        var at0=chartPillarStrings(calculate({year:year,month:m,day:d,hour:0,minute:0,second:0,dayBoundaryMode:mode}));
        var at12=chartPillarStrings(calculate({year:year,month:m,day:d,hour:12,minute:0,second:0,dayBoundaryMode:mode}));
        if(samePrefix(at0,target,3)||samePrefix(at12,target,3)){
          for(var hi=0;hi<hours.length;hi++){exact(year,m,d,hours[hi]);if(matches.length>=limit)break outer;}
        }
        exact(year,m,d,23);if(matches.length>=limit)break outer;
        date.setUTCDate(date.getUTCDate()+1);
      }
    }
    return {query:parsed.normalized,startYear:startYear,endYear:endYear,dayBoundaryMode:mode,limit:limit,matches:matches,note:'此反查只用民用鐘錶時間的四柱作候選搜尋；最終必須帶入出生城市經度、IANA時區與真太陽時重新排盤。時辰範圍內若跨節氣，仍需逐分鐘複核。'};
  }

  function reverseBaziToSolarTimesAsync(options,onProgress) {
    // 先以 Promise 讓 UI 有機會更新「運算中」；核心演算法已用年柱週期縮小候選年。
    return new Promise(function(resolve,reject){setTimeout(function(){try{onProgress&&onProgress({stage:'searching'});var r=reverseBaziToSolarTimes(options);onProgress&&onProgress({stage:'done',matches:r.matches.length});resolve(r);}catch(e){reject(e);}},20);});
  }

  function attachCompatibilityPrivate(comp, chartA, chartB, metaA, metaB) {
    Object.defineProperties(comp,{
      _chartA:{value:chartA,enumerable:false}, _chartB:{value:chartB,enumerable:false},
      _metaA:{value:metaA||{},enumerable:false}, _metaB:{value:metaB||{},enumerable:false}
    });
    return comp;
  }

  function createCompatibility(chartA, chartB, options) {
    options=options||{};
    return attachCompatibilityPrivate(buildCompatibility(chartA,chartB,options),chartA,chartB,options.metaA,options.metaB);
  }

  root.BaziSuiteCore = {
    version:'1.6.0',
    scenarios:SCENARIOS.slice(), lenses:Object.assign({},LENSES),
    constants:{stems:STEMS.slice(),branches:BRANCHES.slice(),stemElements:Object.assign({},STEM_EL),branchElements:Object.assign({},BRANCH_EL)},
    tenGod:tenGod, elementRelation:elementRelation, chartSummary:chartSummary,
    stemCrossRelations:stemCrossRelations, branchCrossRelations:branchCrossRelations, crossGroupRelations:crossGroupRelations,
    directionalTenGods:directionalTenGods, elementComplement:elementComplement, luckSynchronization:luckSynchronization,
    createCompatibility:createCompatibility, buildCompatibilityPrompt:buildCompatibilityPrompt,buildCompatibilityDataBlock:buildCompatibilityDataBlock,
    buildChartDataBlock:buildChartDataBlock, buildSinglePrompt:buildSinglePrompt,
    verifiedBirthFacts:verifiedBirthFacts,birthFactLines:birthFactLines,periodLabel:periodLabel,referenceBaziYear:referenceBaziYear,promptScope:promptScope,
    buildPersonality:buildPersonality, buildPersonalityPrompt:buildPersonalityPrompt,
    normalizeBaziString:normalizeBaziString, reverseBaziToSolarTimes:reverseBaziToSolarTimes, reverseBaziToSolarTimesAsync:reverseBaziToSolarTimesAsync,
    policy:{trueSolarTimePreferred:true,defaultDayBoundaryMode:'ZI_HOUR_23',annualBoundary:'LI_CHUN',luckInterval:'[start,end)',reverseLookupClockTimeOnly:true},
    personalityCatalog:(function(){var out=[];for(var i=0;i<32;i++){var c=PERSONALITY_CORES[(i>>2)&7]+'・'+PERSONALITY_VARIANTS[i&3];out.push({index:i,name:c});}return out;})()
  };
})(typeof window !== 'undefined' ? window : globalThis);
