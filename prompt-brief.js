// BEGIN GENERATED SINGLE PASTE RUNTIME
/* Canonical reading-message compiler. The full native computation stays in the
 * packet/JSON. Delivery is a bounded, self-contained reading projection, never
 * a substring of the old export and never a multi-message protocol. */
(function(root){
  'use strict';
  const VERSION='20261027orthodox78',LIMIT=12000,BYTES=28000;
  if(root.JYSinglePaste?.version===VERSION)return;
  const A=x=>Array.isArray(x)?x:[],P=(x,keys)=>Object.fromEntries(keys.filter(k=>x&&x[k]!==undefined).map(k=>[k,x[k]]));
  const keys=['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Rahu','Ketu','Uranus','Neptune','Pluto','NorthNode','SouthNode'];
  const planets=['日','月','水','金','火','木','土','羅','計','天王','海王','冥王','北交','南交'];
  const signs=['牡羊','金牛','雙子','巨蟹','獅子','處女','天秤','天蠍','射手','摩羯','水瓶','雙魚'];
  const names={bazi:'八字',ziwei:'紫微斗數',vedic:'印度占星',astro:'西洋占星',liuren:'大六壬',liuyao:'六爻',yijing:'易經',meihua:'梅花易數',name:'姓名學',compat:'合盤',personality:'五軸人格',tarot:'塔羅',lenormand:'雷諾曼',ootk:'五輪塔羅',oracle:'籤詩'};
  const zh=x=>planets[keys.indexOf(x)]||x;
  const num=x=>typeof x==='number'&&Number.isFinite(x)?Math.round(x*10000)/10000:x;
  const chars=x=>Array.from(String(x)).length;
  const bytes=x=>typeof TextEncoder==='function'?new TextEncoder().encode(String(x)).length:unescape(encodeURIComponent(String(x))).length;
  const json=x=>JSON.stringify(x,(_,v)=>typeof v==='number'?num(v):v);
  function txt(v){if(v==null)return '未定';if(v===true)return '是';if(v===false)return '否';if(typeof v==='number')return String(num(v));if(typeof v==='string')return v;if(Array.isArray(v))return v.map(txt).join('、');return typeof readable==='function'?'（'+readable(v,2)+'）':json(v);}
  function stamp(x){if(x==null)return '未定';const d=new Date(x);return Number.isFinite(+d)?d.toISOString().replace('.000Z','Z'):String(x);}
  const interval=x=>x?stamp(x.start??x.startsAt)+'→'+stamp(x.endExclusive??x.end??x.endsAt):'未定';
  const state=x=>x==null?'?':x?1:0;
  const hasData=x=>x!==null&&x!==undefined&&x!==''&&(!Array.isArray(x)||x.length>0)&&(!(typeof x==='object'&&!Array.isArray(x))||Object.keys(x).length>0);
  const affirmative=x=>x===true||['established','structural','conditional','variant-structure','matched','timing-supported','weakened','undetermined'].includes(x);
  const guides={
    bazi:'依子平正統推演：先定四柱與節令，看日主得令、得地、得勢，通根與透藏；以月令取格，審格局成敗與救應；依《子平真詮》順逆取用、《滴天髓》論衰旺、《窮通寶鑑》論調候，定喜用忌神。行運以大運管十年、流年管一年，看運歲干支對原局與格局的生剋合沖、成格破格，判吉凶與程度；應年取流年觸發之字，應月取流月。六親依《三命通會》論六親：男命以財為妻、官殺為子，女命以官殺為夫、食傷為子；妻看日支（夫妻宮），子女兼看時柱（子女宮），子數依子星在時支的十二長生與子息歌。神煞作參考。',
    ziwei:'依紫微斗數正統推演：以命宮、身宮與原題所屬宮位為主，合看三方四正與對宮；論主星廟旺利陷、輔佐與煞曜、生年四化，再看宮干飛化與自化。行運以大限十年、流年一年疊宮，看大限與流年四化入題宮及沖照，判吉凶、程度與應期。六親看對應宮位（夫妻、子女、父母、兄弟、交友）的主星、四化與三方四正。',
    vedic:'依帕拉薩拉（BPHS）正統推演：以上升與原題所屬宮位為主，看宮主落宮、尊貴、合相與相位，以 D9 驗證強弱，專項看相關分盤；以維姆紹塔里大運的主運、副運、次副運主星所掌宮位與其本命狀態論事情何時發生，再以土星、木星行運過題宮及從月亮起算的位置印證。六親看對應宮位、宮主與自然代表星：子女看五宮、木星與 D7，配偶看七宮、金星與 D9，父親看九宮與太陽，母親看四宮與月亮。',
    astro:'依傳統占星正統推演：本命看原題所屬宮位的宮頭星座、宮主星落宮與本質尊貴、宮內行星與相位；時機以行運、二次推運、太陽回歸與年度小限論，外行星與土星、木星過題宮或觸及宮主為應期。卜卦盤依卜卦規則看問卜者與所問事之宮主是否入相成事。六親看對應宮位與宮主：子女五宮，配偶七宮，父母十宮與四宮，手足三宮。',
    liuren:'依大六壬正統推演：排天地盤、四課、三傳與天將，依課體（賊剋、比用、涉害、遙剋、昴星、別責、八專、伏吟、返吟）定發用；以日干為己、日支為彼，論干支上神、三傳生剋遞進、天將吉凶、旺相休囚與空亡，判事情的起頭、過程與結果；應期取三傳與用神所在之支，及沖合空填之日。',
    liuyao:'依京房納甲及《增刪卜易》《卜筮正宗》正統推演：依原題取用神，世爻為己、應爻為彼；論用神旺衰（月建、日辰的生剋沖合）、動變（化進化退、回頭生剋）、原神忌神仇神、飛伏、旬空月破、六沖六合與三合局，判吉凶與程度；應期依用神旺衰、動靜、空破、合沖之正統取法定出。',
    yijing:'依朱子《易學啟蒙》考變占法推演：依本次變爻數取占辭（本卦卦辭、本卦變爻辭、之卦卦辭或之卦不變爻辭），參合彖傳、象傳與爻位，判現在的處境與進退之道。',
    meihua:'依邵雍《梅花易數》正統推演：動爻所在之卦為用、不動之卦為體，論本卦體用生剋與當令旺衰，互卦看過程，變卦看結局，參看動爻爻辭與卦象取象；應期依卦氣、體用之數與事情遲速定出。',
    name:'依姓名學正統推演：先看音、形、義與使用場合，再論五格數理、三才配置、生肖與生辰喜用、姓名卦；比較多個名字時用同一版本與筆畫依據。',
    compat:'依子平合婚正統推演：先各自定命局格局與喜用，再看雙方日柱干支的合沖、夫妻宮互動、彼此五行對對方喜忌的補益或剋洩，以及雙方大運流年是否同步，論相處、互補與時機。',
    personality:'依本站五軸生日模型的各軸輸入，講他的做事方式、長處與容易卡住的地方。',
    tarot:'依偉特（RWS）正統推演：依本次牌陣每個牌位的意義讀該位置的牌（正逆位依實際記錄），再依牌陣的讀法鏈把牌串成完整敘事；參看大牌、花色元素、數字與宮廷牌在整組中的比重，判吉凶、程度與建議；時間依花色與數字的傳統對應。Book T 牌組依金色黎明的元素尊貴讀。',
    lenormand:'依雷諾曼正統推演：依本次牌陣的幾何（線陣的前後、九宮與大牌陣的房屋、近遠、鏡像、騎士步與對角）把相鄰牌組合成句，以代表牌與題目主題牌為中心；快慢依牌的性質與距離判斷。',
    ootk:'依金色黎明 Book T 開鑰之法正統推演：不讀正逆位，牌力由相鄰牌的元素尊貴決定；五輪依序以代表牌所落之堆（第一輪四字母堆）、宮（第二輪十二宮）、星座（第三輪）、三十六牌環（第四輪，依原稿以計數與 1↔36 配對推演，不換算旬或日期）、質點（第五輪生命之樹），連同整條計數路徑與配對敘事，讀出事情的現況、發展、處境、推演與結局，最後合成結論。',
    mathers:'依 Mathers《The Tarot》(1888) 原書推演：依該書的發牌與配對程序（第一法馬蹄依 A、C、E 組讀組內故事與首尾配對；第三法 66 張依大圓與代表牌），每張牌依本次正逆位取原書牌義，把組內與配對串成完整敘事，判吉凶、程度與建議。',
    oracle:'依籤詩正統推演：先讀籤詩原文與典故，再依籤解與各事項附記（求財、婚姻、功名、疾病等）對應原題作答。'
  };;
  const rules=[
    '用繁體中文，以看盤多年的命理師身分，當面對本人說。第一句直接回答原題（會不會、偏向怎樣、程度如何），再把依據講成他生活裡的樣子，最後給一個具體可做的下一步。白話連貫成段，術語要用時當場用一句話說明；不用報告體、粗體小標，也不逐條念資料。原題問幾件事就答幾件。',
    '依下面的「本法正統取法」完整推演：先依該法傳統程序定盤，再依原題取用，判吉凶、程度與應期；每個判斷都要能回到盤面上的依據。',
    '本次是獨立的一次解讀：只用本次原題與下列實算資料，不補造盤面沒有的資料；不要使用、參考或推演任何過往對話、聊天紀錄、平台記憶、使用者個人檔案或先前解讀的內容，即使你看得到這些記憶也當作不存在，原題沒寫的人物背景、經歷、關係與先前結論一律視為未知。醫療、法律、財務的決定要配合實際狀況與專業意見。'
  ].join('\n');
  const footer='[靜月之光蝦皮賣場](https://shopee.tw/a50h95648d?tab=shop)\n願你諸事順遂。';
  const closingReminder='【下筆前最後確認】第一句直接回答；依本法正統取法推演，判斷都回到盤面依據；白話成段。收尾依序：一句提醒、手鍊段（只推一款）、最後原樣兩行連結。';
  const commercial='解讀與行動都講完後，才接這一段。先一句提醒：以上屬傳統象徵解讀，供參考，不保證事件；醫療、法律、財務決定要配合實際資料與專業意見。\n接著用二到四句自然接續（不另起標題，不用我會選擇、這不是因為等自我解說開頭），推薦本人佩戴的一款手鍊：先點出本次解讀裡最需要照顧的一件事（例如把話說清楚、穩住別衝動、收心專注、給自己安全感、重新提起行動），再從靜月之光常備品類挑最貼那件事的材質或設計，說明它是提醒自己的象徵，連回剛才講的下一步。品類參考（傳統象徵對應，不是療效）：安穩護持—黑曜石、茶晶、黑碧璽、天鐵、龍宮舍利；開口表達、把話說清—海藍寶、青金石、藍紋瑪瑙；感情柔軟、善待自己—粉晶、草莓晶、摩根石；清明決斷、靜心—白水晶、紫水晶、拉長石；行動力與財務推進—黃水晶、綠幽靈、鈦晶、虎眼石；轉換與放下—煙晶、月光石。只挑一款，理由必須來自本次一項有效發現，不先選商品再反推；不宣稱礦物療效、改運、復合或收益，不造庫存、價格、產地、成分與認證，不加重凶象促購。預算吃緊或不想買時，先用現有物件承載同一提醒。最後自然邀請到靜月之光挑相應設計；無有效盤面或程序停止時不做命理選材。\n'+closingReminder+'\n全文最後兩行原樣輸出：\n'+footer;
  function compactObject(v){
    if(Array.isArray(v))return v.map(compactObject);
    if(!v||typeof v!=='object')return v;
    const skip=new Set(['schema','version','sourceAudit','sourceSHA256','sourceSha256','sourceTextSHA256','retrieved','license','policy','disclaimer','scope','encoding','model','basis','note','notes','predictionValidated']);
    return Object.fromEntries(Object.entries(v).filter(([k,z])=>!skip.has(k)&&z!==undefined).map(([k,z])=>[k,compactObject(z)]));
  }
  function briefChecks(rows){return A(rows).filter(p=>affirmative(p.status)||p.established===true||p.matched===true||p.selected===true).map(p=>({name:p.name||p.id,status:p.status??p.established??p.matched,conditions:compactObject(p.conditions||p.checks||[]),missing:p.missing}));}
  function row(cols){return cols.map(x=>x==null?'?':txt(x)).join('/');}
  const nak=n=>n&&n.name?String(n.name).replace(/\s+/g,'')+(n.pada?n.pada:'')+(n.lord?'('+zh(n.lord)+')':''):undefined;
  const NAKS=['Ashwini','Bharani','Krittika','Rohini','Mrigashira','Ardra','Punarvasu','Pushya','Ashlesha','Magha','PurvaPhalguni','UttaraPhalguni','Hasta','Chitra','Swati','Vishakha','Anuradha','Jyeshtha','Mula','PurvaAshadha','UttaraAshadha','Shravana','Dhanishta','Shatabhisha','PurvaBhadrapada','UttaraBhadrapada','Revati'],NAKLORD=['計','金','日','月','火','羅','木','土','水'];
  const nakOf=lon=>{if(!Number.isFinite(lon))return null;const w=360/27,i=Math.floor((((lon%360)+360)%360)/w);return NAKS[i]+(Math.floor(((((lon%360)+360)%360)-i*w)/(w/4))+1)+'('+NAKLORD[i%9]+')';};
  const dig=d=>d&&typeof d==='object'?(d.status||d.name||(typeof readable==='function'?readable(d,2):json(d))):d;
  function planetRows(ps,full=true){return Object.entries(ps||{}).map(([k,p])=>row([zh(k),p.signName||signs[p.sign],p.degree??(Number.isFinite(p.longitude)?p.longitude%30:null),p.house,p.retrograde?'逆':'順',full?dig(p.dignity):undefined,full&&p.solar?(['Sun','Rahu','Ketu','NorthNode','SouthNode'].includes(k)||p.solar.combust==null?'距日'+num(p.solar.separationDegrees)+'（燃燒不適用）':'距日'+num(p.solar.separationDegrees)+'燃燒'+txt(p.solar.combust)):undefined,full&&p.nakshatra?nak(p.nakshatra):undefined].filter(x=>x!==undefined))).join('\n');}
  function aspectRows(as){return A(as).map(p=>row([zh(p.a||p.from),zh(p.b||p.to),p.name||p.angle||p.step,p.orb??p.strength,p.phase??p.toHouse,p.toPlanets?.map(zh),p.utc].filter(x=>x!==undefined))).join(';');}
  function period(p){return p&&Object.keys(p).length?zh(typeof p.lord==='number'?signs[p.lord]:p.lord)+' '+interval(p):'未定';}
  function periods(d){if(!d)return '未提供';return [d.system||d.profile||'運期',...['maha','antar','pratyantar'].filter(k=>d.current?.[k]).map(k=>k+'='+period(d.current[k])),...A(d.periods).map(p=>period(p)+(p.children?.length?'('+p.children.map(period).join(';')+')':''))].join('\n');}
  function gua(g){return g?{number:g.number,name:g.fullName||g.name||g.n,lines:g.lines,palace:g.palace}:null;}
  function calendar(c){return P(c,['wall','instant','timezoneOffset','dayBoundaryMode','year','month','day','hour','monthBranch','voidBranches','dayGanzhi','engine','precision']);}
  /* ── 唯一出口的中文化：所有區段的資料（物件、陣列、字串）都經過這裡，鍵名與英文列舉值查同一份對照表；
     純英文的引擎技術附註不送給 AI。新增欄位若漏翻，tests/prompt-zh-lint-20261023.cjs 會失敗。 ── */
  const ZH={"status":"狀態","label":"名稱","name":"名稱","type":"類型","kind":"類別","mode":"模式","role":"角色","domainNotes":"事項附註","premises":"成立前提","reading":"解讀","sourceNote":"版本說明","storyStatus":"典故狀態","storyTitles":"典故","summary":"摘要","startUtc8":"起（UTC+8）","endExclusiveUtc8":"迄（UTC+8，不含）","with":"且","not":"不","in":"在","of":"的","and":"與","to":"到","not-in-favorable-house":"不在有利宮","favorable-house-unobstructed":"有利宮且未受阻","favorable-house-obstructed":"有利宮但受阻","supported-with-pressure":"有撐但有壓","clash-with-support":"沖但有扶","not-performed":"未執行","procedure":"程序","mathers_continuous":"Mathers 連續計數法","countRule":"計數規則","bindings":"預先綁定","procedureProfile":"程序版本","confirmedBeforeDeal":"發牌前已確認","countDirection":"計數方向","right":"右","left":"左","deal_order":"發牌順序","op3Policy":"第三輪政策","strict_inherit_proceed_as_before":"嚴格沿用前一輪做法","courtMapping":"宮廷牌對應","expectedPile":"預期堆","primaryHouse":"主宮","cognateHouse":"同類宮","expectedSign":"預期星座","expectedSephirah":"預期質點","fire":"火堆","water":"水堆","air":"風堆","earth":"土堆","two":"雙牌","three":"三張線","five":"五張線","seven":"七張線","choice":"雙路比較","grand":"大牌陣（4×8＋4）","grand_nines":"大牌陣（4×9）","branches":"多子題分線","entity":"對象","op1":"第一輪","op2":"第二輪","op3":"第三輪","op4":"第四輪","op5":"第五輪","default60-calendar-days":"未給期限，站內預設六十天","question-year":"依原題年份","question-explicit-domain":"依原題明示類別","within-symbolic-month":"象徵月內","within-symbolic-year":"象徵年內","within-xun":"旬內","multiple":"多個","wealth":"財務","stage":"階段","phase":"階段","love":"感情","career":"事業","health":"健康","spiritual":"靈性","relationship":"關係","study":"學業","legal":"法律","finance":"財務","enumeration_guidance":"列舉指引","threshold_verification":"門檻核對","relative_timing":"相對時間","focused":"聚焦","deep":"深入","original_request":"原始請求","needs_revision":"需要修訂","review":"檢查","revision":"修訂","compare":"比較","comparison":"比較","yesno":"是否","direction":"方向","advice":"建議","enumeration":"列舉","reason":"原因","person":"人物","location":"地點","choice":"選擇","state":"現況","realization":"會不會成","bounded_outcome":"結果範圍","trajectory":"後續走向","attention_focus":"注意重點","amount":"數量","count":"數量","rate":"比率","business":"生意","move":"遷移","timing":"時間","cause":"成因","outcome":"結果","obstacle":"阻礙","enabler":"助力","antecedent":"既有影響","timeline":"時間段","environment":"環境","person_aggregate":"對方","person_known":"已知對方","synthesis":"總結","interaction_force":"交叉力量","development":"走向","structural_depth":"結構深度","hidden":"隱藏","external":"外部","pattern":"模式","single_complex":"單一複雜題","deep_overview":"整體深入","earthIndex":"地盤序","earthElement":"地盤五行","sky":"天盤","skyIndex":"天盤序","skyElement":"天盤五行","distinctions":"區分","check":"核對","lexicalUncertainty":"用詞不確定","not-established":"未成立","branchIndex":"地支序","generalIndex":"天將序","generalShort":"天將簡稱","stemIndex":"天干序","elementIndex":"五行序","source":"來源","sources":"來源","note":"備註","notes":"備註","reason":"原因","message":"訊息","method":"方法","policy":"政策","profile":"版本設定","version":"版本","versions":"各版本","value":"值","values":"各值","data":"資料","index":"序","number":"號","position":"位置","positions":"位置","side":"側","text":"原文","line":"爻","lines":"各爻","item":"項目","finding":"所見","support":"支持","caution":"提醒","cautions":"提醒","evidence":"依據","conditions":"條件","criteria":"判準","limits":"限制","errors":"錯誤","warnings":"警示","missing":"缺漏","unavailable":"無法提供","provisional":"暫定","computation":"計算","integrity":"完整性","complete":"完整","partial":"部分","unknown":"未知","none":"無","null":"未定","undefined":"未定","QUERY_EVENT":"原題主事件","CROSS_CHART_DISTRIBUTION_ONLY":"只作跨盤五行分布參考，不論成化","LEGACY_UNVERIFIED":"舊版（來源未核）","MIDNIGHT_00":"午夜00:00換日","ZI_HOUR_23":"23時子初換日","SAME_MONTH":"閏月整月作本月","SPLIT_AT_15":"閏月十五日後作次月","CDI_125":"三才125組（CDI版）","LINGZHAO_125":"三才125組（靈兆版）","IZTRO_261":"iztro 2.6.1四化表","DONGHAI_60_WITH_XIANGSHAN_5_POEM":"東海六十籤附香山五首籤詩","true":"是","false":"否","default":"預設","primary":"主","main":"主","alternative":"替代","alternatives":"候選","alternate":"替代","candidate":"候選","candidates":"候選","selected":"已選","selection":"取用","selections":"取用","target":"目標","targets":"目標","placements":"落位","focus":"焦點","scope":"範圍","topic":"題目類別","question":"問題","input":"輸入","output":"輸出","raw":"原始","model":"模型","module":"模組","system":"系統","schema":"格式","delivery":"交付方式","single":"單則","calculated":"已算","verified":"已核","recorded":"已記錄","established":"成立","structural":"結構成立","insufficient":"資料不足","matched":"符合","unique":"唯一","eligible":"適用","ineligible":"不適用","available":"可用","supported":"有撐","unsupported":"沒撐","obstructed":"受阻","unobstructed":"未受阻","incomplete":"未完成","completed":"已完成","notCompleted":"未完成","unresolved":"未決","unconfirmed":"未確認","explicit":"明示","given":"已給","named":"具名","historical":"史上","residual":"殘留","tied":"並列","winner":"勝出","tier":"等級","benefic":"吉","malefic":"凶","natal":"本命","native":"原生","universal":"通用","personal":"個人","baseline":"原名","baseline_field":"原名欄位","time":"時間","date":"日期","dates":"日期","day":"日","days":"日","month":"月","monthly":"每月","year":"年","years":"年","hour":"時","utc":"世界時","instant":"時刻","start":"起","end":"迄","startDate":"起日","endDate":"迄日","endDateInclusive":"迄日（含）","endExclusive":"迄（不含）","endExclusiveUtc":"迄（世界時，不含）","startUtc":"起（世界時）","originalStartDate":"原起日","window":"區間","interval":"區間","calendarDays":"天數","inspected":"已檢查日數","timezone":"時區","timezoneOffset":"時區差","displayTimezone":"顯示時區","timeBasis":"時間基準","reference":"參照","referenceInstant":"參照時刻","referenceUTC":"參照世界時","referenceJieDate":"參照節氣時刻","birthInstant":"出生時刻","civil":"民用時間","clock":"時鐘","calendar":"曆法","seasonal":"季節","dayBoundaryMode":"換日方式","annualBoundary":"換年依據","trueSolarTimeApplied":"已用真太陽時","sixty":"六十","part":"段","gender":"性別","male":"男","female":"女","qiyun":"起運","startAgeText":"起運歲數","direction":"方向","backward":"逆行","forward":"順行","commander":"人元司令","gan":"天干","zhi":"地支","ganzhi":"干支","elapsedDaysAfterJie":"交節後天數","pillar":"柱","pillars":"四柱","stem":"天干","branch":"地支","branches":"地支","hidden":"藏干","tenGod":"十神","element":"五行","elements":"五行","strength":"強弱","roots":"根","rootKind":"根的類型","kongwang":"空亡","changsheng":"長生","dayMaster":"日主","dayMasters":"日主","favorable":"喜","unfavorable":"忌","mainQi":"本氣","transformationStatus":"化合狀態","clash":"沖","combine":"合","harm":"害","destruction":"破","same":"伏吟","punishes":"刑出","punishedBy":"被刑","clashedBy":"被沖","yang":"陽","classicalAdjudication":"古法裁決","classicalBalance":"古法平衡","schoolCompletion":"流派完成度","luckTimingProvisionalA":"甲方運限暫定","luckTimingProvisionalB":"乙方運限暫定","unknownTimeA":"甲方時辰未知","unknownTimeB":"乙方時辰未知","hourRelationsExcluded":"時柱關係不計","aDayPillar":"甲方日柱","bDayPillar":"乙方日柱","aToB":"甲對乙","bToA":"乙對甲","aViewsB":"甲看乙","bViewsA":"乙看甲","roleA":"甲方角色","roleB":"乙方角色","currentA":"甲方現運","currentB":"乙方現運","spousePalace":"夫妻宮","stemRelation":"天干關係","branchRelations":"地支關係","relation":"關係","relations":"關係","control":"剋","controlled":"被剋","scenario":"情境","participants":"人物","kinship":"六親","transmission":"傳","transmissions":"三傳","edges":"走向","edgeLegend":"圖例","ganUpper":"干上神","zhiUpper":"支上神","ganToZhi":"日干對日支","scales":"取期規則","topicRules":"分類占法","interpretationScope":"解讀範圍","readingScope":"讀法範圍","void":"旬空","empty":"旬空","combinations":"合局","transformations":"化合","activePositions":"動位","assessmentLine":"評估爻位","changed":"變卦","original":"本卦","hexagram":"卦","judgment":"卦辭","image":"象辭","greatImage":"大象","lineImages":"小象","tuan":"彖辭","movingLine":"動爻","nameGua":"姓名卦","analysis":"分析","structure":"結構","spread":"牌陣","drawProcedure":"抽牌程序","eventGroups":"事件分組","eventId":"事件代號","sourceProfile":"牌義版本","rws_reversals":"偉特正逆位","commonContext":"共同背景","activeCards":"牌序","countingPath":"計數路徑","keyCards":"關鍵牌","pairs":"配對","significator":"代表牌","poem":"籤詩","cast":"起卦","groups":"組","surname":"姓氏","purpose":"用途","strokeBasis":"筆畫依據","kangxi":"康熙","modern":"現代","sancaiProfile":"三才版本","sanCai":"三才","configuration":"配置","readingConfirmation":"讀音確認","toneSequence":"聲調","grids":"五格","yinYang":"陰陽","differences":"差異","alternateBasis":"替代依據","char":"字","candidateNames":"候選名","nameIndex":"名序","zodiac":"生肖","chartPurpose":"盤的用途","chartType":"盤類型","houseSystem":"宮制","orbs":"容許度","minorOrbs":"次要相位容許度","angle":"角度","angles":"四角","aspect":"相位","aspects":"相位","angleAspects":"四角相位","overlay":"疊盤","orb":"容許度","symbol":"符號","cusps":"宮頭","obliquity":"黃赤交角","ramc":"赤經天頂","positionPolicy":"入宮規則","latitude":"緯度","longitude":"經度","location":"地點","sign":"星座","signName":"星座","house":"宮","degree":"度","planets":"行星","lord":"宮主","lagna":"上升","annualLagna":"年度上升","muntha":"年度穆塔","fromAnnualLagna":"從年度上升起算","yearLord":"年主","yearHouse":"年度宮","yearOfLife":"歲次","dasha":"大運","maha":"主運","antar":"副運","pratyantar":"次副運","vimshottari":"毗紹塔里大運","ashtottari":"阿什托塔里大運","profileDependent":"視版本而定","applicability":"適用性","rahuKendraTrineFromLagnaLord":"羅睺在上升主星角宮或三方","dayKrishnaOrNightShukla":"日生虧月或夜生盈月","nakshatra":"月宿","bphs":"帕拉薩拉經典","calculations":"計算","moolatrikona":"根本三方","exalted":"入廟","debilitated":"落陷","neutral":"中性","friend":"友宮","enemy":"敵宮","own":"自宮","node":"交點","kendra":"角宮","dispositor":"定位星","mean":"平均","lahiri":"拉希里歲差","whole":"整宮","polarity":"極性","nature":"性質","loss":"損","marriage":"婚姻","storage":"儲存","translation":"譯法","title":"標題","key":"鍵","uncertainty":"不確定性","pressure":"有壓","harmless":"無害","initial":"初","general":"一般","domain":"領域","tarot":"塔羅","lenormand":"雷諾曼","ootk":"開鑰之法","oracle":"靈籤","bazi":"八字","ziwei":"紫微","vedic":"印度占星","astro":"西洋占星","liuyao":"六爻","liuren":"六壬","meihua":"梅花","yijing":"易經","compat":"合盤","personality":"五軸","nine":"九","remain":"保留","grave":"墓","variants":"異派","separately":"另行","ageEnd":"迄歲","ageStart":"起歲","caveat":"附註","computed":"已算","conditional":"有條件","dignities":"尊貴","from":"自","mutual":"互","outside":"範圍外","relative":"相對","rule":"規則","use":"用"};
  const URL_RE=/https?:\/\/\S+/g,CODE_RE=/(?<![A-Za-z0-9-])[a-z][A-Za-z0-9_]{2,}(?:-[A-Za-z0-9_]+)*(?![A-Za-z0-9])/g;
  // 牌陣代號一律查引擎自己的方法登記（名稱以引擎為準），不在這裡另抄一份。
  const methodLabel=w=>{const m=root.JYTarotFoundation?.METHODS?.[w];return m&&m.label?m.label:null;};
  // 同一個英文字在不同方法裡意思不同時，以方法專屬對照優先（例：zodiac 在占星是黃道、在姓名學是生肖）。
  const ZH_BY_METHOD={astro:{zodiac:'黃道',sign:'星座',house:'宮'},vedic:{zodiac:'黃道'},name:{zodiac:'生肖'},bazi:{sign:'記號'},liuren:{earth:'地盤',sky:'天盤',general:'天將'}};
  const PLANET_ZH={Sun:'太陽',Moon:'月亮',Mercury:'水星',Venus:'金星',Mars:'火星',Jupiter:'木星',Saturn:'土星',Rahu:'羅睺',Ketu:'計都',Uranus:'天王星',Neptune:'海王星',Pluto:'冥王星',NorthNode:'北交點',SouthNode:'南交點'};
  let zhMethod='';
  const zhWord=w=>{const o=ZH_BY_METHOD[zhMethod];if(o&&Object.prototype.hasOwnProperty.call(o,w))return o[w];return Object.prototype.hasOwnProperty.call(ZH,w)?ZH[w]:methodLabel(w)||w;};
  function zhText(str){
    str=String(str);
    if(!/[\u3400-\u9fff]/.test(str)&&str.trim().split(/\s+/).filter(w=>/[A-Za-z]{2,}/.test(w)).length>=4&&!URL_RE.test(str)){URL_RE.lastIndex=0;return '（引擎技術附註略）';}
    URL_RE.lastIndex=0;
    const parts=str.split(/(https?:\/\/\S+)/);
    const tr=w=>{const o=ZH_BY_METHOD[zhMethod];return o&&Object.prototype.hasOwnProperty.call(o,w)?o[w]:null;};
    const tr2=w=>tr(w)||(Object.prototype.hasOwnProperty.call(ZH,w)?ZH[w]:methodLabel(w)?methodLabel(w):/-/.test(w)?w.split('-').map(x=>Object.prototype.hasOwnProperty.call(ZH,x)?ZH[x]:x).join(''):w);
    // 每一段非網址文字各自翻譯與清除殘留代號；網址段原樣保留（先前整段清除會把網址裡的英文字刪掉）。
    const fix=seg=>seg.replace(/(?<![A-Za-z0-9_])[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)+(?![A-Za-z0-9_])/g,w=>Object.prototype.hasOwnProperty.call(ZH,w)?ZH[w]:w).replace(/(?<![A-Za-z0-9-])[a-z][A-Za-z0-9_]*(?:-[A-Za-z0-9_]+)*(?![A-Za-z0-9])/g,w=>w==='to'?'到':w.length<3&&!/-/.test(w)?w:tr2(w)).replace(/(?<![A-Za-z])(Sun|Moon|Mercury|Venus|Mars|Jupiter|Saturn|Rahu|Ketu|Uranus|Neptune|Pluto|NorthNode|SouthNode)(?![A-Za-z])/g,w=>PLANET_ZH[w]).replace(CODE_RE,'').replace(/[：；、／]\s*(?=[；、／）\n]|$)/g,'').replace(/（\s*）/g,'').replace(/[ \t]{2,}/g,' ');
    return parts.map((seg,i)=>i%2?seg:fix(seg)).join('');
  }
  // 站內免責附註（不是古籍原文）在出口逐句移除，事實部分保留；古籍、規則區與正統取法不經過這裡。
  const DISCLAIMER=/事件保證|不保證|不等於(?:生活)?事件|不等於已|不當(?:獨立|事件)|不得單憑|不能斷言|不能換算|不能由理論|不能挑未列|不作額外吉凶依據|不能凌駕|不以符號保證|不代表雙方已有|須與現實處境合參|不能只取其中|不能當独立票數|不預測胎兒性別/;
  function stripDisclaimers(str){return String(str).split('\n').map(line=>line.split(/(?<=[；。])/).filter(cl=>!DISCLAIMER.test(cl)).join('').replace(/[；，]\s*$/,'')).filter((l,i,arr)=>l.trim()||!arr[i]).join('\n');}
  function zhScalar(v){if(v===true)return '是';if(v===false)return '否';if(v===null||v===undefined)return '未定';if(typeof v==='number')return String(num(v));return zhText(v);}
  function readable(v,depth){
    depth=depth||0;
    if(v===null||typeof v!=='object')return zhScalar(v);
    if(Array.isArray(v)){
      const items=v.filter(x=>hasData(x));
      if(items.every(x=>x===null||typeof x!=='object'))return items.map(zhScalar).filter(x=>String(x).trim()).join('、');
      if(items.every(Array.isArray))return items.map(r=>r.map(x=>x!==null&&typeof x==='object'?readable(x,depth+2):zhScalar(x)).join('／')).join(depth?'；':'\n');
      return items.map(x=>readable(x,depth+1)).join(depth?'；':'\n');
    }
    const parts=Object.entries(v).filter(([k,x])=>hasData(x)&&k!=='id').map(([k,x])=>{const r=readable(x,depth+1),nested=x!==null&&typeof x==='object'&&!Array.isArray(x);if(!String(r).trim())return '';const lab=zhWord(k)!==k?zhWord(k):zhText(k);return (lab?lab+'：':'')+(nested&&depth>0?'（'+r+'）':nested?'\n'+r.split('\n').map(l=>'  '+l).join('\n'):r);});
    return parts.filter(Boolean).join(depth?'；':'\n');
  }
  // 子平論子息：照正統順序寫成句子（子星→落位→時柱子女宮→生扶制剋→已成立作用→古訣子數→運限觸動）。
  function renderChildren(ch){
    const PL={year:'年',month:'月',day:'日',hour:'時'},QI={main:'本氣',middle:'中氣',residual:'餘氣'};
    const pos=x=>PL[x.pillar]+(x.visible?'干':'支')+x.stem+x.god+(x.visible?'（透）':'（藏，'+(QI[x.qi]||'')+'）');
    const rel=r=>[r.clash&&'沖',r.harm&&'害',r.combine&&'合',r.destruction&&'破'].filter(Boolean).join('、');
    const L=[];
    A(ch.branches).forEach(br=>{
      L.push((br.gender==='male'?'男命':'女命')+'子星：'+(br.gender==='male'?'剋日干者（官殺）':'日干所生者（食傷）')+'，五行'+br.targetElement+'，陽干'+br.targetYang+'（依《三命通會》卷七論六親）');
      if(A(br.placements).length)L.push('子星落位：'+br.placements.map(pos).join('、')+'；透'+(br.visibleCount??0)+'、有根'+(br.rootCount??0)+(br.monthlyMainMatches?'；月令本氣即子星':''));
      if(A(br.supporters).length)L.push('生扶子星：'+br.supporters.map(pos).join('、'));
      if(A(br.controllers).length)L.push('制剋子星：'+br.controllers.map(pos).join('、')+(A(br.controlCandidates).length?'（'+br.controlCandidates.map(cc=>cc.stems+(cc.samePillar?'同柱':'隔'+cc.distance+'位')).join('、')+'；實際力量依季節、透藏、全局制化與救應判）':''));
      const est=A(br.actualMechanisms).filter(m=>m.status==='established'||m.status==='structural').map(m=>m.name);if(est.length)L.push('已成立作用：'+est.join('、'));
      const ct=br.count;if(ct&&ct.stage)L.push('古訣子數：子星陽干'+ct.targetYang+'在時支為「'+ct.stage+'」；'+A(ct.tables).map(t=>({yuanhai:'《淵海子平》子息歌',['ziping-xu']:'《子平真詮評註》'}[t.profile]||t.profile)+'數'+(t.rawNumber??'—')+(t.historicalRetainedNumber!=null?'、養位留'+t.historicalRetainedNumber:'')).join('；')+'（古訣數指男孩或生養之數，非今生親生總數）');
      const lk=A(br.luck).filter(d=>d.targetStem||A(d.targetHidden).length||d.controllerStem||d.supportStem||rel(d.hourRelations||{})).map(d=>d.gz+'運（'+d.ageStart+'–'+d.ageEnd+'歲'+(d.isCurrent?'，當期':'')+'）：'+[d.targetStem&&'子星透干',A(d.targetHidden).length&&'子星藏支',d.supportStem&&'生扶子星',d.controllerStem&&'制剋子星',rel(d.hourRelations||{})&&'與時支'+rel(d.hourRelations)].filter(Boolean).join('、'));
      if(lk.length)L.push('大運觸動：'+lk.join('；'));
      const an=A(br.annuals).filter(y=>y.targetStem||A(y.targetHidden).length||rel(y.hourRelations||{})).map(y=>y.year+y.gz+'：'+[y.targetStem&&'子星透干',A(y.targetHidden).length&&'子星藏支',rel(y.hourRelations||{})&&'與時支'+rel(y.hourRelations)].filter(Boolean).join('、'));
      if(an.length)L.push('流年觸動：'+an.join('；'));
    });
    const h=ch.hour;if(h)L.push('時柱（子女宮）：'+h.gan+h.zhi+(A(h.relations).filter(r=>rel(r)).length?'；與'+h.relations.filter(r=>rel(r)).map(r=>PL[r.from]+'支'+r.branches+rel(r)).join('、'):'；與年月日支無沖害合破'));
    if(A(ch.sourceVariants).length)L.push('版本差異：'+ch.sourceVariants.join('；'));
    return L.join('\n');
  }
  function createContext(e,data){
    const b=[],prefix=e.label?e.label+' · ':'';
    const section=label=>data.sections.find(s=>s.label===prefix+label)?.data;
    const displayPrefix=e.label&&data.sourceCoverage?.requestedRecords>1?e.label+'／':'';
    const add=(label,v,priority=0)=>{zhMethod=e.method;if(hasData(v))b.push({label:displayPrefix+label,value:/規則來源/.test(label)?(typeof v==='string'?v:json(v)):stripDisclaimers(typeof v==='string'?zhText(v):readable(v)),priority,method:e.method});};
    return {e,data,b,section,add,c:e.chart,a:e.analysis};
  }
  function bazi(ctx){const{c,a,section:s,add}=ctx,core=s('四柱、節令與換日依據')||s('時辰未知的三柱')||{},st=s('旺衰、格局與制化')||{};
    add('定盤設定',{gender:core.gender||c.gender||null,calendar:P(c.calculationPolicy,['birthInstant','dayBoundaryMode','annualBoundary','trueSolarTimeApplied','timezoneOffset','referenceInstant']),qiyun:a.coverage?.provisional?null:P(c.qiyun,['startAgeText','startUtc','direction','referenceJieDate']),commander:P(c.renyuan,['gan','elapsedDaysAfterJie']),unknown:!!a.coverage?.provisional});
    add('四柱：柱/干支/十神/藏干十神氣/長生/納音',A(core.pillars||a.pillars).map(p=>row([p.label,(p.gan||'')+(p.zhi||''),p.god,A(p.hidden).map(h=>h.stem+h.god+'('+h.qi+')'),p.lifeStage,p.nayin])).join('\n'));
    if(a.coverage?.provisional)return;
    const gz=x=>x&&x.gan?x.gan+x.zhi+(x.nayin?'('+x.nayin+')':''):null,kw=core.kongwang||c.kongwang;
    add('命宮胎元身宮與旬空',[gz(core.mingGong||c.mingGong)&&'命宮'+gz(core.mingGong||c.mingGong),gz(core.taiYuan||c.taiYuan)&&'胎元'+gz(core.taiYuan||c.taiYuan),gz(core.shenGong||c.shenGong)&&'身宮'+gz(core.shenGong||c.shenGong),kw?.day&&'日柱旬空'+A(kw.day).join(''),kw?.year&&'年柱旬空'+A(kw.year).join('')].filter(Boolean).join('；'));
    add('神煞落柱：名/柱/字/查法（輔助象義，先論格局喜忌）',A(core.extraShenSha||c.extraShenSha).map(p=>row([p.name,p.pillar,p.char,p.base])).join(';'),1);
    {const sa=st.strengthAssessment||{},PL={year:'年柱',month:'月柱',day:'日柱',hour:'時柱'},pl=x=>PL[x]||x;
      const L=['強弱：'+(sa.level||'')+(sa.integratedDirection?'（'+sa.integratedDirection+'）':'')+(sa.monthSupportClass?'，月令'+sa.monthSupportClass:'')+(sa.lean?'；站內傾向'+sa.lean.direction+'（'+A(sa.lean.basis).join('、')+'）—'+sa.lean.usage:'')+(sa.conflict?'；衝突：'+sa.conflictReason:'')];
      if(A(c.tongGen?.list).length)L.push('通根：'+c.tongGen.list.join('、'));
      A(c.branchInteractions).forEach(b=>L.push('地支'+b.type+'：'+A(b.branches).join('')+'（'+A(b.pillars).map(pl).join('、')+'）'+(b.resultElement?'→'+b.resultElement:'')+(b.transformationStatus?'，'+b.transformationStatus:'')+(b.effect?'—'+b.effect:'')));
      A(c.functionalAssessment?.combinations).forEach(x=>L.push('天干合：'+pl(x.a)+'與'+pl(x.b)+(x.stems?'（'+x.stems+'）':'')+(x.daySelf?'，日主自合':'')+(x.adjacent?'，相鄰':'，不相鄰')+(x.competition?'，爭合':'')+(x.transformationCertified?'，成化':x.removalCertified?'，合去':'，合而不化')));
      const fy=c.fuyiAssessment||{};if(fy.map)L.push('扶抑標記：'+Object.entries(fy.map).map(([k,v])=>k+v).join('、')+(fy.conclusion?'—'+fy.conclusion:''));
      A(fy.mechanisms).forEach(m=>L.push('通路'+(m.type||'')+'：'+(m.action||'')+(A(m.evidence).length?'（'+m.evidence.join('、')+'）':'')+(m.status?'；'+m.status:'')));
      const ms=st.classical?.monthSelection;if(ms)L.push('取格：月令取'+(ms.selectedStem||'')+(ms.selectedGod||'')+'為'+(ms.selectedPattern||'')+'格'+(A(ms.candidates).length?'；候選：'+ms.candidates.map(v=>v.stem+v.god+(v.mainQi?'（本氣）':'')+(A(v.exposed).length?'透'+v.exposed.map(z=>pl(z.pillar)).join('、'):'未透')).join('、'):''));
      add('根氣與制化（引擎已寫成句）',L.join('\n'));}
    const cl=st.classical,pat=cl?.monthSelection?.selectedPattern,dmEl=c.dmEl||({甲:'木',乙:'木',丙:'火',丁:'火',戊:'土',己:'土',庚:'金',辛:'金',壬:'水',癸:'水'})[c.dm];
    if(pat&&dmEl){const SG={木:'火',火:'土',土:'金',金:'水',水:'木'},KG={木:'土',火:'金',土:'水',金:'木',水:'火'},inv=m=>Object.keys(m).find(k=>m[k]===dmEl),E={比劫:dmEl,食傷:SG[dmEl],財:KG[dmEl],官殺:inv(KG),印:inv(SG)},f=k=>k+'('+E[k]+')';
      const R={正官:['官喜透財以相生、生印以護官；評注：傷官為忌','喜'+f('財')+'、'+f('印')+'；忌傷官('+(()=>{const G='甲乙丙丁戊己庚辛壬癸',i=G.indexOf(c.dm);return i<0?E.食傷:G.split('').find((g,j)=>({0:'木',1:'木',2:'火',3:'火',4:'土',5:'土',6:'金',7:'金',8:'水',9:'水'})[j]===E.食傷&&j%2!==i%2)+E.食傷;})()+'，同五行的食神不在此列)'],財:['財喜食神以相生、生官以護財','喜'+f('食傷')+'、'+f('官殺')],印:['印喜官殺以相生、劫財以護印','喜'+f('官殺')+'、'+f('比劫')],食神:['食喜身旺以相生、生財以護食','喜'+f('比劫')+'、'+f('財')],七殺:['七殺喜食傷以制伏，忌財印以資扶','喜'+f('食傷')+'；忌'+f('財')+'、'+f('印')],傷官:['傷官喜配印以制伏、生財以化傷','喜'+f('印')+'、'+f('財')],陽刃:['陽刃喜官殺以制伏，忌官殺之俱無','喜'+f('官殺')],建祿月劫:['月劫透官以制伏，用財而透食以化劫','喜'+f('官殺')+'；或'+f('財')+'配'+f('食傷')]}[pat];
      const mz=(A(core.pillars||a.pillars).find(p=>/月/.test(p.label||''))||{}).zhi||'',urgent=/[亥子丑]/.test(mz)&&/[金水]/.test(dmEl)?'冬令金水，太寒，調候為急':/[巳午未]/.test(mz)&&/[木火]/.test(dmEl)?'夏令木火，太燥，調候為急':'不屬冬令金水或夏令木火，依評注調候不為急，以月令格局為主、調候為輔';
      if(R)add('月令格局順逆用法（子平真詮論用神原則換成本盤五行；仍須合調候與成敗救應才定喜忌）',pat+'格：'+R[0]+'。本盤即'+R[1]+'。'+dmEl+'日生'+mz+'月：'+urgent+'。',1);}
    {const ST={'not-present':'無','present':'有','structural-candidate':'輕重看位置','needs-judgment':'要你判'};const KW={formation:'成格條件',failure:'破格',taboo:'所忌',rescue:'救應'};
      add('取格成立與破救（引擎已寫成句）',A(cl?.patterns).filter(p=>p.selected).map(p=>p.name+'格：'+['formation','failure','taboo','rescue'].map(k=>KW[k]+'—'+(A(p[k]).map(r=>r.name+'('+(r.value===true?'有':r.value===false?'無':'?')+(r.status&&ST[r.status]&&ST[r.status]!=='有'&&ST[r.status]!=='無'?'，'+ST[r.status]:'')+')').join('、')||'無')).join('；')).join('\n'),1);}
    const y=s('大運與所問年度');if(y){const decades=A(y.decades).filter(d=>y.range?.all||y.range?.requestedDecades||d.isCurrent||A(y.annualSegments).some(v=>v.dayun===d.gz));add('所問區間大運',decades.map(d=>row([d.gz,d.ageStart+'–'+d.ageEnd+'歲',interval(d.window),d.isCurrent?'當期':''])).join('\n'));const dc=new Map();A(y.annualSegments).forEach(v=>{if(!dc.has(v.dayun))dc.set(v.dayun,A(v.connections).filter(z=>z.from==='大運'));});const PLN={year:'年柱',month:'月柱',day:'日柱',hour:'時柱'},BR={combine:'六合',clash:'六沖',harm:'六害',same:'伏吟',punish:'相刑',destroy:'相破',triple:'三合',directional:'三會'},brw=x=>A(Array.isArray(x)?x:String(x||'').split(/[,、]/).filter(Boolean)).map(v=>BR[v]||v).join('、'),yn=x=>x===true||x==='是'?'是':'',conn=z=>(PLN[z.to]||z.to)+'：干'+(z.stemRelation||'無')+(yn(z.stemCombination)?'、干合':'')+(brw(z.branchRelations)?'、支'+brw(z.branchRelations):'')+(yn(z.repeatedPillar)?'、重柱':'');add('各大運對四柱作用（干生剋以大運為主詞）',[...dc].map(([k,rs])=>k+'：'+rs.map(conn).join('；')).join('\n'));add('所問流年：年/大運/流年/十神/區間/對原局作用',A(y.annualSegments).map(v=>row([v.year,v.dayun,v.annual,v.god,interval(v.window),A(v.connections).filter(z=>z.from!=='大運').map(conn).join('；')])).join('\n'));add('年度缺項',y.missingYears);const ss=[...A(y.decades).filter(d=>A(d.shensha).length&&decades.includes(d)).map(d=>'大運'+d.gz+':'+d.shensha.join('、')),...A(y.annualSegments).filter(v=>A(v.shensha).length).map(v=>v.year+v.annual+':'+v.shensha.join('、'))];add('所問運歲引動神煞與旬空（輔助）',[...new Set(ss)].join('\n'),1);const ly=core.liuNianPeriod?.year||c.liuNianPeriod?.year;add('流月'+(ly?'（'+ly+'年，立春換年、各節換月）':'')+'：月/干支/干十神/支十神/站內扶抑標記（中和盤全標平，依你定的喜忌重判）/日支沖/日支合',A(y.liuYue||c.liuYue).map(p=>row([p.monthName||p.month,p.gz,p.god||'',p.zGod||'',p.label,p.isChong?'沖':'',p.isHe?'合':''])).join(';'),2);}
    const child=s('子女議題實算與數量假定');if(child)add('子女（論子息）實算',renderChildren(child));
    const qt=s('調候與本月原文條件');add('調候取用前提（引擎已寫成句）',[...A(qt?.stems).map(x=>x.stem+(x.element?'（'+x.element+'）':'')+'：'+(x.status||'')+(A(x.exposed).length?'，透於'+x.exposed.join('、'):'')+(A(x.hidden).length?'，藏於'+x.hidden.join('、'):'')+(A(x.roots).length?'，根在'+x.roots.join('、'):'')+(A(x.constraints).length?'，限制：'+x.constraints.join('、'):'')+(x.usableAutomatically?'，可直接取用':A(x.exposed).length?(A(x.roots).length?'，透干有根，調候可用':'，透而無根，調候力弱'):A(x.hidden).length?'，藏而未透，調候力弱，待運歲引出':'，原局缺此字，調候要靠運歲補')),qt?.conclusion?'結論：'+qt.conclusion:''].filter(Boolean).join('\n'));add('當月調候原文',A(qt?.classicalClauses?.sourceParagraphs).map(p=>p.text).join('\n'),2);
  }
  function ziwei(ctx){const{c,a,section:s,add}=ctx,core=s('本命十二宮与指定四化');if(!core){add('時辰未定',s('出生輸入與未定盤界線'));return;}
    {const b=core.birthInput||{},l=core.birthLunar||{},po=core.calculationPolicy||{};add('出生與政策（引擎已寫成句）','出生 '+(b.civilDate||'')+' '+(b.civilTime||'')+(b.gender?'（'+(b.gender==='male'?'男':'女')+'命）':'')+'，'+(b.hourBranch||'')+'時'+(b.trueSolarTime?'，已用真太陽時':'，民用時')+'；農曆'+(l.year||'')+'年'+(l.isLeap?'閏':'')+(l.month||'')+'月'+(l.day||'')+'日；'+(core.wuxingJu?['','水二局','木三局','金四局','土五局','火六局'][core.wuxingJu]||('五行局'+core.wuxingJu):'')+'；政策：'+(po.yearDivide==='normal'?'立春換年':'農曆換年')+'、'+(po.ageDivide==='normal'?'虛歲':'周歲')+'、四化表'+(po.sihuaProfile||'')+'、參照年'+(po.referenceHoroscopeYear||''));}
    if(core.mingZhu||core.laiYin)add('命主身主與來因宮',[core.mingZhu&&'命主'+core.mingZhu,core.shenZhu&&'身主'+core.shenZhu,core.laiYin&&'來因宮'+core.laiYin.name+'（'+(core.laiYin.gan||'')+(core.laiYin.branch||'')+'，宮干同生年干）'].filter(Boolean).join('；'),1);
    add('十二宮：宮名/干支/身宮/全部星曜與亮度（*主星）',A(core.palaces).map(p=>row([p.name,(p.gan||'')+p.branch,p.isShen?'身':'',A(p.stars).map(st=>{const bright=root.getStarBright?.(st.name,'子丑寅卯辰巳午未申酉戌亥'.indexOf(p.branch));return (st.type==='major'?'*':'')+st.name+(bright?.label?'['+bright.label+']':'')+(st.hua?'['+st.hua+']':'');})])).join('\n'));
    add('生年四化：星/化/宮',A(core.sihua).map(p=>row([p.star,p.hua,p.palace])).join(';'));
    add('自化：宮/星/化/方向/來源',A(core.selfHua).map(p=>row([p.palace,p.star,p.type,p.direction,p.from])).join(';'));
    add('宮干飛化：來源/來源支/星/化/去向/去向支/自化/向心',A(core.northern?.flights).map(f=>row([f.from||f.sourcePalace,f.fromBranch,f.star,f.kind,f.to||f.targetPalace,f.toBranch,f.self,f.centripetal])).join(';'));
    function layer(p){if(!p)return '';return row([p.layer||'大限',p.year??p.ageStart,p.month??p.ageEnd,p.gz||(p.gan||'')+(p.branch||''),p.mingBranch||p.branch,p.context?.age??p.age,p.decadeCandidates?.map(d=>d.ageStart+'–'+d.ageEnd+'歲'),A(p.hua).map(h=>(h.star||'')+(h.hua||'')+'→'+(h.palaceBranch||h.branch||''))]);}
    add('運限表欄序','層/年或起歲/月或迄歲/干支/命宮地支/虛歲/生日跨限候選/四化星→地支。各層宮職以該層命宮重標。');
    const l=s('運限疊宮')||{};add('大限',A(l.decades).map(layer).join('\n'));add('當期與所問流年：年/干支/命支/虛歲/生日跨限候選/四化→地支/小限宮',[l.annual,...A(s('明示年度流年'))].filter(Boolean).map(p=>row([p.year,p.gz,p.mingBranch,p.context?.age??p.age??'',A(p.decadeCandidates).map(d=>d.ageStart+'–'+d.ageEnd+'歲'),A(p.hua).map(h=>(h.star||'')+(h.hua||'')+'→'+(h.palaceBranch||h.branch||'')),p.minor?.palace?p.minor.palace+p.minor.branch:''])).join('\n'));A(s('明示年度流月')).forEach((y,yi)=>add(y.year+'年流月：月/干支/流月命支/四化→地支',A(y.months).map(m=>row([m.month,m.gz,m.mingBranch,A(m.hua).map(h=>(h.star||'')+(h.hua||'')+'→'+(h.palaceBranch||h.branch||''))])).join('\n'),2+yi));add('全部已算流月',A(l.months).map(p=>A(p.segments).length?p.segments.map(z=>interval({start:z.startsAt,end:z.endsAt})+' '+layer(z)).join('\n'):layer(p)).join('\n'),1);add('目前日小限',compactObject({minor:a.currentMinor,daily:l.daily,hourly:l.hourly}),4);add('年度缺項',s('流年輸出範圍')?.missingYears);
    {const pats=A(s('格局條件核對')?.patterns);add('實際格局與轉象（引擎已寫成句）',[...pats.map(p=>p.name+'：'+(p.status==='structural'?'結構成立':p.status==='variant-structure'?'變體成立':p.status||'')+(A(p.conditions).length?'（'+p.conditions.map(c0=>c0.label+(c0.passed?'✓':'✗')).join('、')+'）':'')),...A(core.northern?.transitions).map(t=>'轉象：'+(t.incoming?.from||'')+'宮'+(t.incoming?.star||'')+'化'+(t.incoming?.kind||'')+'飛入'+(t.incoming?.to||'')+'宮，遇生年'+(t.birthTransformation?.star||'')+(t.birthTransformation?.hua||'')+'→依「'+(t.rule||'')+'」規則，飛化改讀成生年那一化的同類象'+(t.sourceSection?'（'+t.sourceSection+'）':''))].join('\n'),2);}
  }
  function vedic(ctx){const{c,a,section:s,add}=ctx,core=s('D1九曜與掌宮相位')||{};
    const vi=core.input||c.input||{},vp=core.policy||c.policy||{},vl=core.lagna||{};
    add('定盤：出生UTC/參照UTC/緯經/民用日期時間時區/歲長/歲差制與度/交點/宮制/上升座度/時辰未知',row([stamp(vi.utc),stamp(vi.reference),[vi.latitude,vi.longitude],vi.civil?[vi.civil.date,vi.civil.time,vi.civil.timezone]:null,vi.yearDays,vp.ayanamsa,vp.ayanamsaDegrees,vp.node,vp.houses,[vl.sign,vl.degree],!!a.coverage?.provisional]));
    add('D1：曜/星座/度/宮/順逆/尊貴/近日/星宿與分段(宿主)',planetRows(core.planets||c.planets));
    const pc=core.panchanga||c.panchanga,lm=pc?.limbs||{},kr=A(core.karakas||c.karakas);
    add('上升月宿、五支曆、角色星',['上升星宿'+(nakOf(vl.longitude)||'?'),pc?'五支曆：'+[lm.tithi?.name&&((lm.tithi.paksha||'')+' '+lm.tithi.name).trim(),lm.nakshatra?.name&&'月宿'+String(lm.nakshatra.name).replace(/\s+/g,'')+(lm.nakshatra.pada||''),lm.yoga?.name&&'Yoga '+lm.yoga.name,lm.karana?.name&&'Karana '+lm.karana.name].filter(Boolean).join('、'):null,kr.length?'角色星：'+kr.map(k=>k.role+zh(k.planet)+(k.tied?'(同度待核)':'')).join(' '):null].filter(Boolean).join('\n'),1);
    add('十二宮：宮/座/主/主落宮/占曜/受照/SAV',A(core.houses).map(h=>row([h.house,h.signName||signs[h.sign],zh(h.lord),h.lordHouse,A(h.occupants).map(zh),A(h.aspectedBy).map(zh),h.sav])).join('\n'));
    add('星座相位與定位（座序0牡羊；行星相位已逐宮列於受照欄）',A(core.aspects?.rasi).map(p=>zh(p.from)+'→'+A(p.toSigns).join(',')).join(';')+'\n同座距角='+A(core.aspects?.conjunctions).map(p=>A(p.planets).map(zh).join('–')+':'+num(p.separation)).join(';')+'\n定位鏈='+A(core.dispositors).map(p=>A(p.chain).map(zh).join('→')).join(';'));
    add('20分盤：D/升座；九曜座依日月水金火木土羅計，0牡羊起',A(s('二十分盤')).map(v=>row([v.division,v.lagna?.sign,keys.slice(0,9).map(k=>v.planets?.[k]?.sign)])).join('\n'));
    const str=s('六力與Bhava力量');add('力量（不是吉凶）：曜/總/門檻/足額/Ishta/Kashta',A(str?.strength?.planets).map(p=>row([zh(p.planet),p.totalVirupas,p.minimumVirupas,p.meetsMinimum,p.ishtaKashta?.ishta,p.ishtaKashta?.kashta])).join('\n'));add('十二宮力',A(str?.bhavaStrength?.houses).map(p=>[p.house,num(p.totalVirupas)]));
    const y=s('格局與落陷抵消')||{},formed=briefChecks([...(y.yogas||[]),...A(y.specialRules?.checks),...A(y.additional?.checks)]);
    add('實際成立項：名稱/狀態（同源只列一次）',[...new Map(formed.map(p=>[p.name+'|'+p.status,row([p.name,p.status])])).values()].join(';'));
    add('落陷救應：曜/是否抵消/實際規則與通過值（仍保留原強弱及近日）',A(y.additional?.neechabhanga).filter(p=>p.debilitated).map(p=>row([zh(p.planet),p.structuralCancellation,A(p.conditions).map(z=>[z.id,z.passed])])).join('\n'));
    const ds=s('所問運期與行運')||{};add('主運、副運、次副運及所問區間',periods(ds.vimshottari));
    {const PL=core.planets||c.planets||{},ma=PL.Mars,ju=PL.Jupiter,ve=PL.Venus,mo=PL.Moon,from=r=>Number.isInteger(r)&&ma?((ma.sign-r+12)%12)+1:null,hit=[1,2,4,7,8,12];
      if(ma){const refs=[['上升',vl.sign],['月亮',mo?.sign],['金星',ve?.sign]].map(([n,s])=>[n,from(s)]).filter(([,h])=>h),on=refs.filter(([,h])=>hit.includes(h)),jA=ju?((ma.sign-ju.sign+12)%12)+1:null;
        add('火星婚姻位置（流行判法：火星落上升、月亮、金星起算第1、2、4、7、8、12宮；各派分級與豁免不同）',refs.map(([n,h])=>n+'起第'+h+'宮').join('、')+'；'+(on.length?'落在'+on.map(([n])=>n).join('、')+'起算的位置':'三處都不在這些位置')+'。可減輕的條件：'+([[0,7,9].includes(ma.sign)?'火星在本垣或擢升':null,jA&&[1,5,7,9].includes(jA)?'木星同座或照到火星':null].filter(Boolean).join('、')||'本盤沒有常見的入廟或木星照應')+'；雙方都有時傳統視為相抵。',1);}}
    const ap=a.applicability?.dashaSelection||{};add('多運法適用性',{primary:ap.primary,eligible:A(ap.eligibleSupporting).map(k=>[k,ap.systems?.[k]?.status,A(ap.systems?.[k]?.currentLords).map(zh)]),profileDependent:A(ap.profileDependent).map(k=>[k,ap.systems?.[k]?.profiles?.map(p=>[p.id,p.status])]),unknown:ap.conditionUnknown});
    add('當期次副運明細',A(ds.vimshottari?.current?.pratyantars).map(period).join('\n'),1);
    const ts=Array.isArray(ds.transits)?ds.transits:Object.entries(ds.transits?.planets||c.transits?.planets||{}).map(([planet,p])=>({planet,...p}));
    add('已算行運：曜/座/度/順逆/月宮/升宮/BAV/SAV',ts.map(p=>row([zh(p.planet),p.signName||signs[p.sign],p.degree,p.retrograde==null?null:p.retrograde?'逆':'順',p.fromMoon,p.fromLagna,p.bav,p.sav])).join('\n'));
    const sat=ts.find(p=>p.planet==='Saturn'),jup=ts.find(p=>p.planet==='Jupiter');
    if(sat?.fromMoon)add('土星與木星對出生月亮（行運常用判讀）','土星在月亮起算第'+sat.fromMoon+'宮'+({12:'：七年半考驗期第一段（Sade Sati 起）',1:'：七年半考驗期第二段（壓在月亮上，最重）',2:'：七年半考驗期第三段（收尾）',4:'：月亮第四宮土星（Kantaka／Ardhashtama，家宅與心安）',8:'：月亮第八宮土星（Ashtama，突變與暗中阻礙）'}[sat.fromMoon]||'：不在七年半與第四、八宮週期')+(jup?.fromMoon?'；木星在月亮起算第'+jup.fromMoon+'宮'+([2,5,7,9,11].includes(jup.fromMoon)?'（傳統有利位，仍看阻擋表）':'（非傳統有利位）'):''),1);
    const tr=s('行運逐項核算');add('行運阻擋：曜/月宮/有利/阻宮/阻曜/狀態',A(tr?.vedha).map(p=>row([zh(p.planet),p.fromMoon,p.auspiciousHouse,p.vedhaHouse,A(p.blockers).map(zh),p.status])).join('\n'),1);
    const av=s('八分法所有分盤');add('AV原表：D/SAV/BAV日/月/水/金/火/木/土；SAV逗號分隔，BAV各12個位數逐字對牡羊至雙魚',Object.entries(av?.vargas||{}).map(([d,v])=>'D'+d+'/'+v.sav.join(',')+'/'+keys.slice(0,7).map(k=>A(v.bav?.[k]).join('')).join('/')).join('\n'));
    const t=s('本次歲時完整核算');if(t){add('本次年度範圍',{status:t.status,window:t.window,muntha:t.muntha,yearLord:P(t.ruleLedger?.yearLord,['status','winner','alternatives','tier']),annualLagna:t.annual?.lagna});add('年度星位',planetRows(t.annual?.planets,false),2);add('當期月與細段',[t.currentMonth,t.currentSixtyHour].filter(Boolean).map(p=>({kind:p.kind,window:p.window,lagna:p.chart?.lagna,planets:planetRows(p.chart?.planets,false),lord:P(p.monthLord||p.ruleLedger?.yearLord,['status','winner','alternatives','tier'])})),4);}
    const sc=s('Sudarsana三重年運月運細運');add('三重年運',{status:sc?.status,yearOfLife:sc?.yearOfLife,yearHouse:sc?.yearHouse,window:sc?.window,limits:sc?.limits},4);
    {const SIGN=['牡羊','金牛','雙子','巨蟹','獅子','處女','天秤','天蠍','射手','摩羯','水瓶','雙魚'],AN={AL:'上升象（AL）',UL:'婚姻象（UL）'};
      const vg=s('Jaimini與特殊點')?.vargas||{};
      add('Arudha 象點（Jaimini；依 PVR 算法）',Object.entries(vg).map(([d,v])=>{const ar=v.arudhas||{};
        const bh=A(ar.bhava).map(r=>(AN[r.name]||r.name+'（第'+r.house+'宮象）')+'在'+(SIGN[r.sign]||'?')+'（宮主'+zh(r.lordSelection?.winner||'')+(r.exception?'，例外規則':'')+'）').join('；');
        const gr=A(ar.graha).map(r=>zh(r.planet)+'象在'+(SIGN[r.sign]||'?')+(r.exception?'（例外規則）':'')).join('；');
        return 'D'+d+'：'+bh+(gr?'\nD'+d+'行星象：'+gr:'');}).join('\n'),5);}
  }
  function astro(ctx){const{c,a,section:s,add}=ctx,core=s('本次用途、完整星位與宮位')||{};
    add('輸入與宮制',{input:core.input,policy:P(core.policy,['zodiac','houseSystem','chartType','node','orbs','minorOrbs']),unknown:!!a.coverage?.provisional});
    const lt=core.lots;if(lt?.fortune)add('福點與精神點（Lot of Fortune／Spirit）',['福點','精神點'].map((n,i)=>{const x=i?lt.spirit:lt.fortune;return n+'在'+x.signName+num(x.degree)+'度第'+x.house+'宮，主星'+zh(x.lord)+'（'+x.formula+'）';}).join('；')+'。福點看身體與財物際遇，精神點看心志與作為。',1);
    const pf=core.profection;if(pf)add('年度小限（整宮制）','滿'+pf.age+'歲：小限到第'+pf.house+'宮'+pf.signName+'，年主星'+zh(pf.lord)+(pf.lordNatal?'（本命在'+pf.lordNatal.signName+'第'+pf.lordNatal.house+'宮）':'')+'；'+interval(pf.window)+'。年主星的行運、相位與回歸盤狀態是這一年的主軸。');add('全部星位：曜/座/度/宮/順逆/尊貴',planetRows(core.planets));add('宮頭與四角',compactObject(core.houses));add('本命相位',aspectRows(core.aspects));
    {const DW={sign:'入廟',exaltation:'擢升',triplicity:'三分主',term:'界主',face:'面主'},dw=l=>A(l).map(k=>DW[k]||k).join('、');
      const ed=core.essentialDignities||{},sol=A(core.specialConditions?.solar||core.conditions?.solar),solOf=k=>sol.find(x=>x.planet===k),SOL={cazimi:'日心（被太陽抱住，傳統反而視為有力）',combust:'燃燒（被太陽燒掉，弱）','under-beams':'日光下（偏弱）',clear:''};
      const rows=A(ed.planets).map(p=>zh(p.planet)+'：'+(A(p.held).length?'持有'+dw(p.held):'無本質尊貴')+(p.detriment?'、失勢':'')+(p.fall?'、落陷':'')+(p.peregrine?'、游離（沒根，靠接納）':'')+(solOf(p.planet)&&SOL[solOf(p.planet).state]?'、'+SOL[solOf(p.planet).state]:'')+'；所在度數由'+zh(p.signLord)+'（座）'+(p.exaltationLord?'、'+zh(p.exaltationLord)+'（擢）':'')+'、'+zh(p.triplicityLord)+'（三分）、'+zh(p.termLord)+'（界）、'+zh(p.faceLord)+'（面）管');
      const mut=A(ed.mutualHosting).map(m=>zh(m.a?.host)+'與'+zh(m.b?.host)+'互容（'+dw(m.b?.dignities)+'／'+dw(m.a?.dignities)+'）—兩顆星互相有辦法，問題能互相解');
      add('尊貴與接納（引擎已寫成句）',[(core.sect?.name?'盤別：'+core.sect.name+'；':'')+'盤主星'+zh(core.chartRuler||''),...rows,...(mut.length?['互容：'+mut.join('；')]:[])].join('\n'));}
    {const sc=core.specialConditions||{},sh=core.chartShapes||{},SOL={cazimi:'日心（有力）',combust:'燃燒（弱）','under-beams':'日光下（偏弱）',clear:'日光外'};
      add('形狀與特殊條件（引擎已寫成句）',[A(core.patterns).length?'相位圖形：'+core.patterns.map(p=>(p.name||p.type||'')+(A(p.planets).length?'（'+p.planets.map(zh).join('、')+'）':'')).join('、'):'相位圖形：無',A(sh.matched).length?'盤形：'+sh.matched.map(m=>m.name+'—'+(m.condition||'')).join('；')+(sh.largestEmptyGap?'；最大空區在'+zh(sh.largestEmptyGap.after)+'到'+zh(sh.largestEmptyGap.before)+'之間（'+Math.round(sh.largestEmptyGap.degrees)+'度）':''):'',A(sc.unaspected).length?'無相位行星：'+sc.unaspected.map(zh).join('、'):'',A(sc.outOfSign).length?'跨座相位：'+sc.outOfSign.map(a=>zh(a.a)+a.name+zh(a.b)).join('、'):'',A(sc.nearStations).length?'近停滯：'+sc.nearStations.map(zh).join('、'):'',A(sc.solar).length?'與太陽的關係：'+sc.solar.map(x=>zh(x.planet)+SOL[x.state]||x.state).join('、'):''].filter(Boolean).join('\n'),2);}
    const future=s('實算行運次限與回歸')||{};for(const [k,p0]of Object.entries(future)){if(!p0)continue;const ov=A(p0.natalHouseOverlay),p=ov.length&&ov[0].progressedHouse===undefined&&p0.planets?{...p0,natalHouseOverlay:[],planets:Object.fromEntries(Object.entries(p0.planets).map(([pk,pv])=>[pk,{...pv,house:ov.find(v=>v.planet===pk)?.natalHouse??pv.house}]))}:p0;const kn=({transits:'行運',progressions:'次限推運',returnAnalysis:'太陽回歸'})[k]||k;add(kn+'時點與相位',{utc:p.utc,referenceUTC:p.referenceUTC,purpose:p.purpose,aspects:aspectRows(p.aspects),angleAspects:aspectRows(p.angleAspects),overlay:Array.isArray(p.natalOverlay)&&p.natalOverlay[0]?.a?aspectRows(p.natalOverlay):A(p.natalHouseOverlay||p.natalOverlay).map(v=>[zh(v.planet),v.progressedHouse,v.natalHouse])});add(kn+'星位'+(k==='transits'?'（宮欄＝落在本命第幾宮）':''),planetRows(p.planets,false),k==='transits'?1:2);}
    const h=(s('問事及搬遷')||{}).horary;if(h){add('卜卦取用',{significators:h.significators,selectedHouse:h.selectedHouse,querent:h.querent,quesited:h.quesited,moon:compactObject(h.moon),orbPolicy:h.orbPolicy});add('傳光集光及受阻',compactObject({translation:h.translationChecks||h.translationCandidates,collection:h.collectionChecks||h.collectionCandidates,denials:h.denialChecks||h.perfectionAndInterference,light:h.lightChecks}),1);add('卜卦實際時序',compactObject(h.timeline),3);}
  }
  function liuren(ctx){const{c,a,section:s,add}=ctx,core=s('天地盤、四課三傳與時令')||{};
    const clock=core.clock,method=core.method;
    {const t=core.time||{},pp=t.pillars||{};add('日時與取課（引擎已寫成句）',['占時：'+(t.civilDate||'')+' '+(t.civilTime||'')+(t.timezoneOffset!=null?'（UTC'+(t.timezoneOffset>=0?'+':'')+t.timezoneOffset+'）':'')+'，四柱'+['year','month','day','hour'].map(k=>pp[k]?pp[k].gan+pp[k].zhi:'').join(' ')+(t.previousQi?'；節氣在'+t.previousQi.name+'後、'+(t.nextQi?.name||'')+'前':''),'日干'+(core.day?.gan||'')+'（'+(core.day?.element||'')+'，寄宮'+(core.day?.residence||'')+'）、日支'+(core.day?.zhi||'')+'；月將'+(core.monthGeneral?.branch||'')+(core.monthGeneral?.name?'（'+core.monthGeneral.name+'）':'')+'；時支'+(core.hourBranch||'')+'；'+(core.daytime?'晝占':'夜占')+'；貴人'+(core.noble?.branch||'')+(core.noble?.direction?'、'+core.noble.direction:'')+'；旬首'+(core.xun?.head||'')+'，旬空'+A(core.xun?.empty).join(''),'取課：'+(method?.gate||'')+'→'+(method?.type||'')+(A(method?.selectedCourses).length?'（取第'+method.selectedCourses.join('、')+'課）':'')+(A(method?.trace).length?'；程序：'+method.trace.map(x=>x.step).join('→'):''),clock?('時制：'+(clock.trueSolarTimeApplied?'已用真太陽時':'民用時辰')+(clock.astronomy?.status==='coordinates-unavailable'?'（未提供座標）':'')):'',A(core.participants).length?'人物：'+core.participants.map(x=>x.label+'＝'+(x.source||'未提供')).join('、'):''].filter(Boolean).join('\n'));}
    const pos=p=>{const x=p.assessment||{};return [p.index??p.role??'',p.earth,p.sky||p.upper||p.branch,p.lower,p.general,p.kinship,state(p.empty),p.hiddenStem,x.season,state(x.monthlyBroken),x.dayRelation,x.generalRelation,x.groundRelation,state(x.innerBattle),state(x.outerBattle),Object.entries(x.dayLinks||{}).filter(([,v])=>v).map(([k])=>k)];};
    add('天地盤：序/地/天/下/將/六親/空/遁干/季/破/日/將/地生剋/內戰/外戰/日支關係（1是0否?未知）',A(core.plate).map(p=>row(pos(p))).join('\n'));add('四課（同欄序）',A(core.courses).map(p=>row(pos(p))).join('\n'));add('三傳（同欄序）',A(core.transmissions).map(p=>row(pos(p))).join('\n'));add('生剋方向與干支',{edges:A(core.edges).map(p=>[p.from,p.to,p.branches,p.relation,p.links]),ganUpper:core.ganZhi?.ganUpper?.branch,zhiUpper:core.ganZhi?.zhiUpper?.branch,ganToZhi:core.ganZhi?.ganToZhi,edgeLegend:'from→to；punishes是前者刑後者、punishedBy是被後者刑；五行比和不能消除刑沖。'});
    const topics=s('分類問事與處境線索')||a.topicRules;
    add('問事取用與可核線索',A(topics?.checks).map(p=>({...P(p,['id','topic','status','source','readingScope']),evidence:
      p.id==='work-self-environment'?{selfCourse:1,environmentCourse:3,transmissions:'完整三傳及有向作用見上表'}:
      p.id==='initial-void'?{transmission:1,empty:p.evidence?.empty}:p.evidence})));
    const cl=s('六十四課三值判定');
    add('成立或未決課體：課/狀態/版本條件/缺項（1真0假?未定）',A(cl?.checks).filter(p=>p.status!=='not-established'&&p.established!==false).map(p=>row([p.name,p.status,A(p.variants).map(v=>[v.name,state(v.value),A(v.conditions).map(x=>[x.condition,state(x.value)])]),p.missing])).join('\n'));
    const tm=s('取用與候選日實算');add('取用與候選範圍',{selection:{mode:tm?.selection?.mode,status:tm?.selection?.status,targets:A(tm?.selection?.targets).map(p=>({kinship:p.kinship,role:p.role,placements:A(p.placements).map(v=>[v.role,v.branch||v.upper,v.earth]),transmissions:A(p.transmissions).map(v=>[v.role,v.branch])}))},window:tm?.window,status:tm?.status,candidates:tm?.candidateCount,inspected:tm?.inspectedDayCount,scales:compactObject(tm?.scales)});add('實際命中神煞',A(s('神煞實際命中與不足')?.active).map(p=>P(p,['name','location','hits'])),3);
  }
  function liuyao(ctx){const{section:s,add}=ctx,core=s('完整起卦與六爻')||{},v=s('完整作用網路與讀法')||{};
    {const cal=core.calendar||{},og=core.original||{},cg=core.changed||{};add('起卦與六爻（引擎已寫成句）',[cal.wall?'起卦 '+cal.wall:'',[cal.year,cal.month,cal.day,cal.hour].filter(Boolean).length?'四柱／日辰 '+[cal.year,cal.month,cal.day,cal.hour].filter(Boolean).join(' '):'',cal.monthBranch?'月建'+cal.monthBranch:'',A(cal.voidBranches).length?'旬空'+cal.voidBranches.join(''):''].filter(Boolean).join('，')+'；六爻值（初→上）'+A(core.values).join(',')+'，動爻'+(A(core.movingPositions).length?core.movingPositions.join('、'):'無')+'；本卦'+(og.name||'')+(og.palace?'（'+og.palace.name+'宮'+(og.palace.element||'')+'、'+(og.palace.generation||'')+'，世'+og.palace.shi+'應'+og.palace.ying+'）':'')+(core.hasChange===false||(cg.name&&cg.name===og.name&&!A(core.movingPositions).length)?'，六爻皆靜':(cg.name?'→變卦'+cg.name:'')));}
    const st=core.structures,kind=(c6,h6)=>c6?'六沖':h6?'六合':'非沖非合';if(st)add('六沖六合卦（內外三對爻支全沖或全合）','本卦'+kind(st.sixClash,st.sixCombine)+(A(core.movingPositions).length?'，變卦'+kind(st.changedSixClash,st.changedSixCombine)+(st.sixCombine&&st.changedSixClash?'（合變沖：先聚後散）':st.sixClash&&st.changedSixCombine?'（沖變合：先散後聚）':''):'，無動爻')+'。沖主散、急、難久，合主聚、成、拖延；仍以用神旺衰與動變為主。');
    {const stTxt=st=>{st=st||{};const b=[];if(st.void)b.push('旬空');if(st.monthBroken)b.push('月破');if(st.monthSame)b.push('月建同氣');if(st.monthCombine)b.push('月合');if(st.daySame)b.push('日辰同氣');if(st.dayClash)b.push('日沖');if(st.dayCombine)b.push('日合');return b.join('、')||'無空破合沖';};
      add('六爻（每爻一句：位・干支・六親・世應・六神；月日狀態；動變；伏神）',A(core.lines).map(p=>p.label+(p.role?'（'+p.role+'）':'')+'：'+(p.stem||'')+p.branch+p.relative+'乘'+p.spirit+'，'+(p.valueName||'')+'；'+stTxt(p.states)+(p.changed?'；動化'+p.changed.relative+p.changed.branch+(p.transition?.returnLabel?'（'+p.transition.returnLabel+(p.transition.advance?'、進神':p.transition.retreat?'、退神':'')+'）':'')+'，變爻'+stTxt(p.changed.states):'；靜')+(p.hidden?'；伏'+(p.hidden.relative||'')+(p.hidden.branch||''):'')).join('\n'));}
    add('事情取用（評估爻位指同位全部爻狀態，伏神另列）',A(v.targets).map(p=>({role:p.role,relative:p.relative,status:p.status,selection:p.selection,candidates:A(p.candidates).map(z=>({position:z.position,hidden:z.hidden,branch:z.branch,...(JSON.stringify(z.assessment)===JSON.stringify(A(v.lines).find(l=>l.position===z.position))?{assessmentLine:z.position}:{assessment:compactObject(z.assessment)})})),alternatives:compactObject(p.calendarAlternatives)})));
    add('全部爻狀態：位/季/月/日/強度/日沖/可用/生扶動爻/障礙/空/墓/長生',A(v.lines).map(p=>row([p.position,p.season?.label,p.monthInfluence,p.dayInfluence,p.strength,p.dayEffect,p.availability,p.supportingMovingPositions,p.obstacles,p.voidStatus,p.tombStatus,p.lifeStages])).join('\n'));
    add('全部作用方向：事情/目標位/作用爻位/六親/作用/動靜/可用/障礙',A(v.influences).flatMap(p=>A(p.candidates).flatMap(z=>A(z.network).map(n=>row([p.role,z.position,n.position,n.relative,n.function,n.movement,n.availability,n.obstacles])))).join('\n'));
    add('動變與合沖',compactObject({combinations:v.combinations,transformations:v.transformations}),1);
    add('應期範圍',P(v.timing,['status','window']));
  }
  function yijing(ctx){const{section:s,add}=ctx,core=s('完整起卦與六爻')||{},v=s('完整作用網路與讀法')||{};
    {const cal=core.calendar||{},og=core.original||{},cg=core.changed||{};add('起卦記錄（引擎已寫成句）',[cal.wall?'起卦 '+cal.wall:'',[cal.year,cal.month,cal.day,cal.hour].filter(Boolean).length?'四柱／日辰 '+[cal.year,cal.month,cal.day,cal.hour].filter(Boolean).join(' '):'',cal.monthBranch?'月建'+cal.monthBranch:'',A(cal.voidBranches).length?'旬空'+cal.voidBranches.join(''):''].filter(Boolean).join('，')+'；六爻值（初→上）'+A(core.values).join(',')+'，動爻'+(A(core.movingPositions).length?core.movingPositions.join('、'):'無')+'；本卦'+(og.name||'')+(og.palace?'（'+og.palace.name+'宮'+(og.palace.element||'')+'、'+(og.palace.generation||'')+'，世'+og.palace.shi+'應'+og.palace.ying+'）':'')+(core.hasChange===false||(cg.name&&cg.name===og.name&&!A(core.movingPositions).length)?'，六爻皆靜':(cg.name?'→變卦'+cg.name:'')));}
    add('本次擇辭主參（完整原文）',{policy:v.reading?.policy,rule:v.reading?.rule,selections:v.reading?.selections});
    for(const [key,title]of [['originalText','本卦'],['changedText','之卦']]){const p=v[key];if(p)add(title+'原文',P(p,['number','name','judgment','lines','use','image']));}
    add('彖象與所選原文對讀',compactObject({original:P(v.expositions?.original,['tuan','greatImage','lineImages','wenyan','useImage']),changed:P(v.expositions?.changed,['tuan','greatImage','lineImages','wenyan','useImage']),selected:v.expositions?.selectedCompanions}));
    add('互錯綜（只補充卦形）',Object.entries(v.complementaryViews||{}).map(([side,p])=>(side==='original'?'本卦':'之卦')+'：互卦'+(p.mutual?.hexagram?.name||'?')+'、綜卦'+(p.overturned?.hexagram?.name||'?')+'、錯卦'+(p.opposite?.hexagram?.name||'?')).join('；'));
  }
  function meihua(ctx){const{c,section:s,add}=ctx,m=s('本互變與起卦輸入')||c,tri=x=>x&&x.name?x.name+(x.nat||'')+'('+(x.el||'')+')':null,hx=x=>x?(x.n||'')+(x.j?'：'+x.j:''):null;add('起卦與本互變',{上卦:tri(c.up),下卦:tri(c.lo),動爻:c.dong,體卦:tri(c.tiG),用卦:tri(c.yoG),起卦時點:c.castContext?.timestamp,本卦:hx(c.ben),互卦:hx(c.hu),變卦:hx(c.bian),互卦取法:c.nuclear?.exception?c.nuclear.note:undefined});
    if(m.movingLine)add('本卦動爻爻辭（原典：成卦先看爻辭；以時間數字起的先天卦以體用為主、爻辭參照）',m.movingLine.hexagram+m.movingLine.label+'：'+m.movingLine.text);{const WS={旺:'當令最強',相:'有力',休:'退氣',囚:'受困',死:'無力'};add('原體四階段實際作用（引擎已寫成句）',A(s('原體四階段作用')).map(st=>st.label+'：'+A(st.evidence).map(ev=>'體'+ev.bodyElement+'對用'+ev.useElement+ev.relation+'；體在'+(ev.bodySeason?.monthZhi||'')+'月'+(WS[ev.bodySeason?.level]||ev.bodySeason?.level||'')+'、用'+(WS[ev.useSeason?.level]||ev.useSeason?.level||'')).join('；')).join('\n'));}
    const an=c.analysis||{},nb=an.narrativeBlocks||{},yq=c.yingQi||an.yingQi||{},tm=c.timing||an.timingFull||{},rk=c.risk||{},st=c.strategy||{};
    const WS={旺:'當令最強',相:'有力',休:'退氣',囚:'受困',死:'無力'};
    const L=[];
    if(an.tiYong)L.push('體用：'+an.tiYong.rel+'（'+(an.tiYong.judge||'')+'）—'+(an.tiYong.desc||'')+'；體卦'+(an.wangShuai?.ti?.level?WS[an.wangShuai.ti.level]||an.wangShuai.ti.level:'')+'、用卦'+(an.wangShuai?.yo?.level?WS[an.wangShuai.yo.level]||an.wangShuai.yo.level:'')+'（本節令'+(an.wangShuai?.ti?.monthZhi||'')+'月）');
    if(nb.situation)L.push('處境：'+nb.situation);if(nb.coreTension)L.push('張力：'+nb.coreTension);if(nb.trend)L.push('走向：'+nb.trend);if(nb.risk&&nb.risk!==nb.trend)L.push('風險：'+nb.risk);
    if(an.eventNature)L.push('事情的性質（本卦五行取象）：'+(an.eventNature.label||'')+'—'+A(an.eventNature.events).join('、')+'；節奏'+(an.eventNature.speed||'')+(an.eventNature.timing?'；對應季節候選：'+an.eventNature.timing:''));
    if(tm.label||tm.windowLabel)L.push('應期：'+(tm.label||tm.windowLabel||'')+(tm.label&&(tm.range||tm.windowLabel)?'（'+(tm.range||tm.windowLabel)+'）':'')+(tm.note?'；'+tm.note:''));
    if(yq.jiTxt||yq.layerTxt)L.push('應期候選（卦氣）：'+[yq.layerTxt,yq.jiTxt,yq.baiTxt].filter(Boolean).join('；'));
    if(A(st.advice).length)L.push('站內策略傾向：'+st.advice.join('、')+'（'+({wait:'先等',push:'可推',hold:'守住',retreat:'退一步'}[st.mode]||'')+'）');
    if(A(rk.points).length)L.push('風險提醒：'+rk.points.join('；'));
    add('進退與時間界線（引擎已寫成句）',L.join('\n'));}
  function name(ctx){const{section:s,add}=ctx,core=s('原名與候選、拆分及比較條件')||{};add('比較條件',P(core,['surname','purpose','baseline','candidateNames','criteria']));
    const grids=g=>({status:g?.status,grids:A(g?.grids).map(v=>[v.role,v.num,v.formula,v.originalNumerology?.theme,v.originalNumerology?.tone,v.originalNumerology?.summary,v.commonModernTable?.level]),sanCai:{configuration:g?.sanCai?.configuration,profile:g?.sanCai?.profile,versions:A(g?.sanCai?.versions).map(v=>[v.profile,v.level]),relations:g?.sanCai?.relations},yinYang:g?.yinYang?.sequence});
    A(s('所有姓名實算')).forEach(p=>{add(p.name+'字音形義：字/採筆畫/康熙/現代/候選讀音/字義/部首/字根',A(p.characters).map(v=>row([v.char,v.stroke,v.kangxi,v.modern,v.readings,v.meaning,v.radical,v.roots])).join('\n'));add(p.name+'主讀數理（五格欄序：格/數/公式/原著主題/傾向/摘要/通行版）',{role:p.comparisonRole,strokeBasis:p.inputPolicy?.strokeBasis,sancaiProfile:p.inputPolicy?.sancaiProfile,readingConfirmation:p.phonetic?.resolution?.confirmedReading,toneSequence:p.phonetic?.toneSequence,warnings:p.phonetic?.warnings,...grids(p.fiveGrids)});add(p.name+'筆畫異讀敏感性',{differences:p.strokeSensitivity?.differences,alternateBasis:p.strokeSensitivity?.alternateBasis,alternate:p.strokeSensitivity?.alternateFiveGrids?{grids:A(p.strokeSensitivity.alternateFiveGrids.grids).map(g=>[g.role,g.num,g.formula,g.originalNumerology?.theme,g.originalNumerology?.tone]),sanCai:{configuration:p.strokeSensitivity.alternateFiveGrids.sanCai?.configuration,versions:A(p.strokeSensitivity.alternateFiveGrids.sanCai?.versions).map(v=>[v.profile,v.level])},yinYang:p.strokeSensitivity.alternateFiveGrids.yinYang?.sequence}:null});add(p.name+'其他方法狀態',{zodiac:P(p.zodiac,['status','reason']),bazi:P(p.bazi,['status','reason']),nameGua:p.nameGua?{status:p.nameGua.status,movingLine:p.nameGua.movingLine,original:P(p.nameGua.original,['name','judgment','line']),changed:P(p.nameGua.changed,['name','judgment'])}:null});});
    add('方法矩陣',compactObject(s('比較方向與方法矩陣')),4);
  }
  function compat(ctx){const{section:s,add}=ctx,c=s('雙方及雙向原盤作用')||{};
    // 紫微雙向與八字雙向形狀不同：紫微交給專屬寫入器，避免整包宮位星曜與逐條投射被當成必要資料。
    if(A(c.personA?.palaces).length&&(c.projectionGroups||c.overlays))return compatZiwei(ctx,c);
    add('雙方角色與精度',{scenario:c.scenario,uncertainty:c.uncertainty});
    add('出生時間核對',compactObject(c.birthTimeAudit),3);
    for(const k of ['personA','personB']){const p=c[k];if(!p)continue;add((k==='personA'?'甲方':'乙方')+'原局',{...P(p,['name','gender','pillars','dayMaster','strength','favorable','unfavorable','uncertainty','birthInput','birthLunar','sihua']),kongwang:p.auxiliary?.kongwang||undefined,palaces:p.palaces?A(p.palaces).map(v=>P(v,['name','branch','stars'])):undefined,roots:A(p.functionalAssessment?.rootContext).filter(v=>v.hasRoot&&v.stem===p.dayMaster).map(v=>({stem:v.stem,roots:A(v.roots).map(z=>P(z,['pillar','branch','stem','mainQi','rootKind','clashedBy']))})),seasonal:P(p.seasonalAssessment,['conclusion'])});}
    add('雙向十神：對方柱/天干/十神/藏干',Object.entries(c.directionalTenGods||{}).map(([k,vs])=>k+':'+A(vs).map(v=>row([v.partnerPillar,v.partnerStem,v.tenGod,v.hidden])).join(';')).join('\n'));
    add('雙方日主與夫妻宮',{dayMasters:c.dayMasters,spousePalace:c.spousePalace});
    const SR={generate:'甲生乙',receive:'乙生甲',control:'甲剋乙',controlled:'乙剋甲',same:'同五行'},PL={year:'年',month:'月',day:'日',hour:'時'};
    add('跨盤天干作用：甲柱/乙柱/甲干/乙干/作用',A(c.stemRelations).map(v=>row([PL[v.aPillar]||v.aPillar,PL[v.bPillar]||v.bPillar,v.aStem,v.bStem,v.typeCode==='STEM_COMBINATION'?'五合(化'+(v.candidateElement||'?')+'候選，未必成化)':v.type==='同干'?'同干':(SR[v.relation]||v.relation)])).join('\n'));
    if(c.elementComplement)add('五行互補（站內相對權重，偏強五行是否落在對方喜忌）',{甲偏強:c.elementComplement.dominantA,乙偏強:c.elementComplement.dominantB,乙可助甲:c.elementComplement.partnerMaySupportA,甲可助乙:c.elementComplement.partnerMaySupportB,乙加重甲負擔:c.elementComplement.partnerMayLoadA,甲加重乙負擔:c.elementComplement.partnerMayLoadB},1);
    add('跨盤地支作用：類型/甲柱/乙柱/甲支/乙支/成化狀態',A(c.branchRelations).map(v=>row([v.type,v.aPillar,v.bPillar,v.aBranch,v.bBranch,v.transformationStatus])).join('\n'));
    add('跨盤三合三會與其他組合',{groups:A(c.groupRelations).map(v=>P(v,['type','branches','element','participants','transformationStatus','interpretationScope'])),overlays:compactObject(c.overlays),directions:compactObject(c.directions),projectionGroups:compactObject(c.projectionGroups)},2);
    const sy=c.luckSynchronization;const periods=p=>A(p?.segments).length?p.segments:[p].filter(Boolean);const annual=p=>periods(p).map(v=>[v.dayun,v.gz||v.annual,v.god,interval(v.window),v.connections?v.connections.map(z=>[z.from,z.to,z.stemRelation,z.stemCombination,z.branchRelations]):[v.level,A(v.events).join('；')].filter(Boolean)]);
    const now=Date.now(),years=A(sy?.years),live=years.filter(v=>!v.window?.endExclusive||Date.parse(v.window.endExclusive)>now),near=new Set((live.length?live:years).slice(0,3));
    const yr=v=>({year:v.year,window:interval(v.window),a:annual(v.a),b:annual(v.b)});
    add('同步運限（目前起三年）',{currentA:P(sy?.aCurrent,['gz','ageStart','ageEnd','window']),currentB:P(sy?.bCurrent,['gz','ageStart','ageEnd','window']),years:years.filter(v=>near.has(v)).map(yr)});
    add('同步運限（其他年份）',{years:years.filter(v=>!near.has(v)).map(yr)},2);
    add('紫微雙向運限',compactObject(c.timeline),2);
  }
  function compatZiwei(ctx,c){const{add}=ctx;
    const MAIN=new Set(['major','sha','lucky']),hua=h=>String(h||'').replace('化','');
    const star=x=>x.name+(x.brightness||'')+(x.natalHua?hua(x.natalHua):'');
    const focus=new Set(A(c.focusPalaces));
    add('紫微雙方角色與精度',{scenario:c.scenarioId,focusPalaces:c.focusPalaces,policy:c.policy,unavailable:c.unavailable});
    add('紫微出生時間核對',compactObject(c.birthTimeAudit),3);
    for(const [k,tag] of [['personA','甲'],['personB','乙']]){const p=c[k];if(!p)continue;
      const head={yearGanZhi:(p.yearStem||'')+(p.yearBranch||''),wuxingJu:p.wuxingJu,mingZhu:p.mingZhu,shenZhu:p.shenZhu,currentAge:p.currentAge,natalSihua:A(p.natalTransformations).map(t=>t.star+hua(t.hua)+'→'+t.targetPalace).join('、')};
      Object.keys(head).forEach(x=>{if(head[x]===''||head[x]==null)delete head[x];});
      add('紫微'+tag+'方本命：宮/支/干/主星與煞曜（亮度、生年四化）',(Object.keys(head).length?readable(head)+'\n':'')+A(p.palaces).map(v=>row([v.name+(v.isMing?'(命)':'')+(v.isShen?'(身)':''),v.branch,v.gan,A(v.stars).filter(x=>MAIN.has(x.type)).map(star).join(' ')||'空宮'])).join('\n'));
      const cur=A(p.decades).find(d=>d.isCurrent)||A(p.decades).find(d=>p.currentAge>=d.ageStart&&p.currentAge<=d.ageEnd);
      if(cur)add('紫微'+tag+'方目前大限',{age:cur.ageStart+'–'+cur.ageEnd,ganZhi:(cur.gan||'')+(cur.branch||''),natalPalace:cur.palaceName,sihua:A(cur.transformations||cur.sihua).map(t=>t.star+hua(t.hua)+'→'+(t.targetPalace||t.natalPalace||'')).join('、')||undefined});
      add('紫微'+tag+'方輔佐雜曜',A(p.palaces).map(v=>v.name+':'+A(v.stars).filter(x=>!MAIN.has(x.type)).map(x=>x.name).join(' ')).join('\n'),4);
      add('紫微'+tag+'方宮干飛化與自化',compactObject({palaceFlights:p.palaceFlights,selfTransformations:p.selfTransformations}),3);
      add('紫微'+tag+'方三方四正、格局與來因',compactObject({sanFangSiZheng:p.sanFangSiZheng,patternAssessment:p.patternAssessment,laiYin:p.laiYin}),4);
    }
    add('紫微宮位疊合：地支/甲方宮/乙方宮',A(c.overlays).map(v=>row([v.branch,v.aPalace+(v.aBody?'(身)':''),v.bPalace+(v.bBody?'(身)':'')])).join('\n'));
    const pg=A(c.projectionGroups),hit=v=>focus.has(v.targetPalace)||v.targetPalace==='命宮';
    const line=v=>row([v.sourcePerson+'→'+v.targetPerson,v.stem,v.star+hua(v.hua),v.targetPalace,v.targetBranch,A(v.origins).map(o=>o.palace||'生年').join('+'),v.independentCount]);
    add('紫微跨盤四化投射・題目主宮（方向/干/星化/落宮/支/來源/獨立次數；跨盤引動參照，非受方自身四化）',pg.filter(hit).map(line).join('\n'));
    add('紫微跨盤四化投射・其他宮位',pg.filter(v=>!hit(v)).map(line).join('\n'),2);
    add('紫微雙向運限',compactObject(c.timeline),2);
  }
  function personality(ctx){const{section:s,add}=ctx;const p=s('五軸實算與模型界線')||{};add('模型及五軸（本地模型，不是臨床量表）',[(p.name?'型別：'+p.name+(p.code?'（'+p.code+'）':''):''),A(p.axes).length?'五軸：'+p.axes.map(a=>(a.left||'')+'／'+(a.right||'')+'→偏'+(a.rightSelected?a.right:a.left)+(a.evidence?'（'+a.evidence+'）':'')).join('；'):'',A(p.traits).length?'特質：'+p.traits.map(t=>t.name||t.label||t).join('、'):'',A(p.strengths).length?'長處：'+p.strengths.map(t=>t.name||t.label||t).join('、'):'',A(p.watch).length?'要注意：'+p.watch.map(t=>t.name||t.label||t).join('、'):''].filter(Boolean).join('\n'));}
  function cards(ctx){const{c,a,e,section:s,add}=ctx,d=s('本次完整操作與牌籤作用')||a.methodData||{};
    if(e.method==='oracle'){add('籤詩與本次版本',P(d,['number','ganzhi','poem','source','profile','sourceNote','reading','storyTitles','storyStatus']));{const TAG={supportive:'有利',caution:'要小心',conditional:'有條件',negative:'不利',delay:'要等',waiting:'要等',late:'偏晚',early:'偏早',neutral:'平'};const cats=A(d.categories).filter(x=>x.present!==false);
      add('事項附記（籤文各事項的傾向；附記優先於整首吉意）',cats.map(x=>x.name+'：'+(A(x.textFeatureTags).map(t=>TAG[t]||'').filter(Boolean).join('、')||'有附記')+(A(x.traditionalTimingTokens).length?'（時間字：'+x.traditionalTimingTokens.join('、')+'）':'')).join('；'),2);}return;}
    if(e.method==='ootk'){
      const dict=new Map();for(const op of A(d.operations)){const o=op.data||op;for(const card of [...A(o.activeCards),...A(o.openingCards).map(p=>p.card)])if(card&&card.id!=null&&!dict.has(card.id))dict.set(card.id,card);}
      const id=x=>x&&typeof x==='object'?x.id:x==null?'?':[...dict.values()].find(p=>p.name===x)?.id??x;
      const direction=x=>({right:'右',left:'左',deal_order:'序'})[x]??x;
      const relation=x=>({weaken:'弱',friendly:'友',strengthen:'強',neutral:'中'})[x]??x;
      const dignity=p=>row([id(p.card),p.pile||'',relation(p.relation)||'',id(p.leftCard),relation(p.leftDignity)||'',id(p.rightCard),relation(p.rightDignity)||'',state(p.fullDignity),state(p.neutralizedByContraryFlanks)]);
      add('程序、代表牌及預先綁定',{status:d.status,completed:d.completed,notCompleted:d.notCompleted,significator:d.significator,integrity:P(d.integrity,['status','errors','missing']),procedure:d.context?.procedureProfile,countRule:d.context?.countRule,bindings:d.context?.predeclaredBindings,courtMapping:d.context?.sourceContract?.courtMapping});
      add('Book T核心義：牌號/牌名/元素/計數值/原典核心（每張只列一次）',[...dict.values()].sort((a,b)=>a.id-b.id).map(p=>row([p.id,p.name,p.element,p.countValue,p.coreMeaning||p.bookTTitle||'本次未提供原典牌義'])).join('\n'));
      const name=x=>{const o=typeof x==='object'&&x?x:dict.get(typeof x==='number'?x:Number(x))||[...dict.values()].find(p=>p.name===x);return o?o.name:String(x??'?');};
      const core=x=>{const o=typeof x==='object'&&x?x:dict.get(typeof x==='number'?x:Number(x))||[...dict.values()].find(p=>p.name===x);return o&&(o.coreMeaning||o.bookTTitle)?String(o.coreMeaning||o.bookTTitle).split(/[；;。]/)[0]:'';};
      const relWord=x=>({weaken:'削弱',friendly:'友善',strengthen:'增強',neutral:'中性'})[x]||x||'未記錄';
      const pileWord=x=>({fire:'火堆（事業、行動）',water:'水堆（感情、關係）',air:'風堆（思考、口舌、是非）',earth:'土堆（金錢、物質、實際事務）'})[x]||x;
      const sig=d.significator,sigId=sig&&sig.id,b=d.context?.predeclaredBindings||{},opNames={op1:'第一輪（當下狀態）',op2:'第二輪（展開與推進）',op3:'第三輪（心裡的想法與處境）',op4:'第四輪（時間與轉折）',op5:'第五輪（結局）'};
      const pathIds=new Map();const cid_=x=>typeof x==='object'&&x?x.id:x;
      A(d.operations).forEach(op=>{const o=op.data||op;const key=op.operation;const L=[];
        if(!op.valid){add((opNames[key]||key)+'：未完成或無效，不補造',o.abandonReason||'程序未成立');return;}
        if(op.abandoned){add((opNames[key]||key)+'：已放棄，不補造',o.abandonReason||'');return;}
        const dom=o.domainMeaning||o.sephirahMeaning;const where=o.activePile??o.activeHouse??o.activeSign??o.activeSephirah;
        if(key==='op1'){const match=b.expectedPile&&where?(b.expectedPile===where):null;L.push('代表牌'+name(sigId)+'落在'+pileWord(where)+(match===true?'，即問題所屬之堆':match===false?'；問題所屬為'+pileWord(b.expectedPile):''));}
        else if(key==='op2'){L.push('代表牌落第'+where+'宮'+(dom?'（'+dom+'）':'')+(b.primaryHouse&&Number(where)!==Number(b.primaryHouse)?'；問題所屬為第'+b.primaryHouse+'宮':'，即問題所屬之宮'));}
        else if(key==='op3'){L.push('代表牌落'+where+(dom?'（'+dom+'）':'')+(b.expectedSign&&String(where)!==String(b.expectedSign)?'；問題所屬星座為'+b.expectedSign:''));}
        else if(key==='op4'){L.push('三十六牌環，代表牌在第'+(o.sigPosition??'?')+'位');}
        else if(key==='op5'){L.push('結局落'+where+(dom?'（'+dom+'）':''));}
        if(A(o.openingCards).length)L.push('四堆翻面初示牌：'+o.openingCards.map(pc=>pileWord(pc.pile).split('（')[0]+' '+name(cid_(pc.card))+(pc.pileDignity?.relation?'（'+relWord(pc.pileDignity.relation)+'）':'')).join('、')+'');
        const path=A(o.countingPath||o.countingSteps||o.counting);const cards=A(o.activeCards);
        if(path.length){const chain=path.map(st=>{const cid=st.cardId??st.id;const c0=cards.find(x=>x.id===cid)||dict.get(cid);const inv=c0&&(c0.ootkInverted===true||c0.physicalOrientation==='inverted');if(cid!=null){if(!pathIds.has(cid))pathIds.set(cid,new Set());pathIds.get(cid).add(key);}return name(cid)+(core(cid)?'＝'+core(cid):'');});L.push('計數路徑：'+chain.join(' → '));}
        const pairs=A(o.pairs||o.pairing);const sp=pairs.find(pr=>cid_(pr.left)===sigId||cid_(pr.right)===sigId||name(cid_(pr.left))===name(sigId)||name(cid_(pr.right))===name(sigId));
        if(sp){const l=cid_(sp.left),r=cid_(sp.right);const other=(l===sigId||name(l)===name(sigId))?r:l;L.push('代表牌與'+name(other)+'配對（'+relWord(sp.dignity)+'）'+(core(other)?'：'+name(other)+'＝'+core(other):''));}
        const dg=A(o.dignities||o.elementalDignities).find(x=>cid_(x.card)===sigId||name(cid_(x.card))===name(sigId));
        if(dg){const lc=cid_(dg.leftCard),rc=cid_(dg.rightCard);L.push('代表牌兩側：'+(lc!=null?name(lc)+'（'+relWord(dg.leftDignity)+'）':'無')+'、'+(rc!=null?name(rc)+'（'+relWord(dg.rightDignity)+'）':'無')+(dg.neutralizedByContraryFlanks===true?'，兩側相反':dg.fullDignity===true?'，兩側同性':''));}
        const orient=()=>'';
        if(cards.length)L.push('牌序（'+cards.length+'張，完整）：'+cards.map(pc=>name(pc.id)+orient(pc)).join('、'));
        const others=pairs.filter(pr=>pr!==sp).map(pr=>name(cid_(pr.left))+'＋'+name(cid_(pr.right))+'（'+relWord(pr.dignity)+'）');
        if(others.length)L.push('其餘配對（'+others.length+'組）：'+others.join('、'));
        const pathSet=new Set(path.map(st=>st.cardId??st.id));const dgs=A(o.dignities||o.elementalDignities).filter(x=>x!==dg&&pathSet.has(cid_(x.card)));
        if(dgs.length)L.push('路徑牌尊貴：'+dgs.map(x=>name(cid_(x.card))+'—左'+(cid_(x.leftCard)!=null?name(cid_(x.leftCard))+relWord(x.leftDignity):'無')+'、右'+(cid_(x.rightCard)!=null?name(cid_(x.rightCard))+relWord(x.rightDignity):'無')+(x.neutralizedByContraryFlanks===true?'（抵銷）':'')).join('；'));
        add(opNames[key]||key,L.join('\n'));
      });
      const recur=[...pathIds].filter(([cid,ops])=>ops.size>=2&&cid!==sigId).map(([cid,ops])=>name(cid)+'（'+[...ops].map(k=>k.replace('op','第')+'輪').join('、')+'）'+(core(cid)?'＝'+core(cid):''));
      if(recur.length)add('跨輪重現的牌（出現兩輪以上）',recur.join('\n'));
      return;
    }
    add('牌陣與程序',{method:c.methodPlan?.method||c.methodPlan?.id||c.tarotData?.methodPlan?.id,sourceProfile:c.sourceProfile||c.tarotData?.sourceProfile,spread:c.spreadType||c.spread||c.lenormandData?.spreadType||c.tarotData?.spreadZh||c.tarotData?.spreadType,drawProcedure:d.drawProcedure,eventGroups:d.eventGroups,commonContext:d.commonContext});
    const ln=e.method==='lenormand';// 雷諾曼沒有逆位，不印「方向?」讓AI誤以為缺資料
    add(ln?'全部牌序：位置/牌號/牌名/含義/人物事件綁定（雷諾曼不分正逆）':'全部牌序：位置/牌號/牌名/方向/含義/人物事件綁定',A(d.records).map(p=>row(ln?[p.position||p.index,p.id,p.name,p.keywords||p.meaning,p.binding]:[p.position||p.index,p.id,p.name,p.direction,p.keywords||p.meaning,p.binding])).join('\n'));
    if(!ln&&A(d.records).length){const R=A(d.records),SU=[['wand','權杖','火'],['cup','聖杯','水'],['sword','寶劍','風'],['pent','錢幣','土']],majors=R.filter(r=>r.suit==='major'),rev=R.filter(r=>r.direction==='逆位'),miss=SU.filter(([k])=>!R.some(r=>r.suit===k)).map(([,n,el])=>n+'('+el+')'),at=ix=>A(ix).map(i=>R[i-1]?.position).filter(Boolean).join('、');
      add('整組牌結構（數量本身就是讀牌線索）',['大牌'+majors.length+'/'+R.length+'張'+(majors.length?'（'+majors.map(r=>r.position).join('、')+'）':''),'花色：'+SU.map(([k,n,el])=>n+'('+el+')'+R.filter(r=>r.suit===k).length).join(' ')+(miss.length&&R.length>=5?'；缺'+miss.join('、'):''),R.some(r=>r.direction==='正位'||r.direction==='逆位')?'逆位'+rev.length+'張':null,A(d.courtPositions).length?'宮廷牌在：'+at(d.courtPositions):'沒有宮廷牌',A(d.rankEchoes).length?'重複數字：'+d.rankEchoes.map(x=>(({ace:'王牌',page:'侍者',knight:'騎士',queen:'皇后',king:'國王'})[x.rank]||x.rank)+'（'+at(x.positions)+'）').join('；'):null].filter(Boolean).join('；'));
      const mt=R.filter(r=>r.meaning);if(mt.length)add(mt.some(r=>r.meaningTopic==='Mathers原義')?'牌義（Mathers《The Tarot》1888 原書；依牌位與原題情境轉述）':'RWS牌義（Waite《塔羅圖解》原典；依牌位與原題情境轉述）',mt.map(r=>r.position+'｜'+r.name+r.direction+(r.meaningTopic?'〔'+r.meaningTopic+'〕':'')+'：'+r.meaning).join('\n'),1);}
    if(e.method==='tarot'&&A(d.records).length){
      // 牌陣結構由引擎的方法登記（牌位權責＋依賴鏈）寫成句子；不靠牌位名稱猜。
      const plan=c.methodPlan||c.tarotData?.methodPlan||null,R=A(d.records),slots=A(plan?.slots),deps=A(plan?.dependencies);
      const AUTH={state:'現況',cause:'成因',enabler:'助力（推動這件事的力量）',obstacle:'阻礙',advice:'建議／介入',outcome:'結果',antecedent:'既有影響（過去）',timeline:'時間段',stage:'階段',environment:'環境／他人',person_aggregate:'對方',comparison:'比較路',domain:'生活領域',structural:'結構層',synthesis:'總結',interaction_force:'交叉力量',development:'走向',cause_action:'成因與行動'};
      const nm=i=>R[i]?(R[i].name+(R[i].direction||'')):'?',lab=i=>slots[i]?.label||R[i]?.position||('第'+(i+1)+'張');
      const normA=a=>/outcome/.test(String(a||''))?'outcome':/antecedent|receding|prior|past/.test(String(a||''))?'antecedent':/^person/.test(String(a||''))?'person_aggregate':String(a||'structural');
      const byAuth={};slots.forEach((sl,i)=>{if(!R[i])return;const a=normA(sl.authority||sl.role);(byAuth[a]=byAuth[a]||[]).push(lab(i)+'＝'+nm(i));});
      const order=['state','person_aggregate','cause','enabler','antecedent','obstacle','interaction_force','environment','advice','timeline','stage','development','comparison','outcome','domain','structural','synthesis'];
      const unmapped=[...new Set(slots.map(sl=>normA(sl.authority||sl.role)).filter(a=>!AUTH[a]))];if(unmapped.length)order.push(...unmapped);
      const lines=order.filter(a=>byAuth[a]).map(a=>(AUTH[a]||a)+'：'+byAuth[a].join('；'));
      const mid=String(c.methodPlan?.id||c.tarotData?.methodPlan?.id||c.spreadType||'');
      const chainNote={celtic_cross:['交叉：第一張被第二張橫壓，先講核心被什麼牽制','縱軸：根基→核心→可能成形，是這件事從底到頂的結構','橫軸：身後→核心→身前，是時間流向','杖列：本人、環境、希望或恐懼、結果，由下往上讀成結論','希望或恐懼對著結果看：期待的和會發生的是不是同一件'],cross:['交叉：核心被阻礙牽制','過去→核心→未來是時間流','建議要對著交叉的阻礙講'],five_card:['成因→現況→阻礙是為什麼卡','介入→阻礙→現況→結果是怎麼解'],three_card:['基礎→現況→結果一條線'],timeline:['五段依序，轉折在中間，最後一段是落點，不換算日期'],either_or:['A路：背景→A狀態→A走向','B路：背景→B狀態→B走向，同一標準比較'],relationship:['你→對方→關係本身','限制對著關係本身','介入→限制→關係→走向'],horseshoe:['過去→現在→隱藏影響是起點','他人→阻礙是外力','建議→他人→阻礙→結果是解法到落點'],tree_of_life:['右柱（慈悲）：智慧、慈悲、勝利','左柱（嚴厲）：理解、嚴厲、榮耀','中柱：王冠→美→基礎→結果，中柱是主線'],zodiac:['對宮成對：一宮對七宮、二對八、三對九、四對十、五對十一、六對十二；先讀題目所在的宮與它的對宮，再總結'],minor_arcana:['成因→現況→阻礙','環境→資源→介入→結果'],fifteen_card:['中列三張是核心','四組各三張：自然走向、替代走向、決策依據、不可控條件'],mathers_21:['三列各七張，由右到左讀成三段敘事'],mathers_horseshoe:['三組馬蹄，由右到左先成連貫答案，再首尾配對'],year_review:['前三張回顧，後五張展望，不是八個月份'],monthly:['十二張各一個月，第十三張總結'],multi_option:['每個選項各三張：現況、限制、走向，同一尺度比較'],multi_question:['每個子題五張各自成句，不互借牌位']}[mid]||[];
      const chains=deps.map((g,k)=>(chainNote[k]?chainNote[k]+'：':'')+g.map(i=>lab(i)+'（'+nm(i)+'）').join('→'));
      if(lines.length||chains.length)add('牌陣結構讀法（引擎依方法登記寫成；先讀鏈，再讀單張）',lines.concat(chains.length?['讀法鏈：\n'+chains.join('\n')]:[]).join('\n'));
    }
    if(e.method==='lenormand'&&A(d.records).length===9&&String(c.spreadType||c.lenormandData?.spreadType)==='nine'){const N=i=>d.records[i-1]?.name,g=ix=>ix.map(N).join('、');add('九宮格讀法（中心是核心；左欄已發生、中欄現在、右欄將來；上列想法意識、中列現實、下列潛在根基；四角是框住整件事的條件）','中心：'+N(5)+'；四角：'+g([1,3,7,9])+'；左欄：'+g([1,4,7])+'；中欄：'+g([2,5,8])+'；右欄：'+g([3,6,9])+'；上列：'+g([1,2,3])+'；下列：'+g([7,8,9])+'；兩條對角：'+g([1,5,9])+'／'+g([3,5,7]));}
    if(e.method==='lenormand'&&d.tableau){const tb=d.tableau,q=String(ctx.data.question||''),cellOf=id=>A(tb.cells).find(x=>x.id===id),dist=(a,b)=>{const x=cellOf(a),y=cellOf(b);return x&&y&&typeof x.row==='number'&&typeof y.row==='number'?Math.max(Math.abs(x.row-y.row),Math.abs(x.col-y.col)):null;};
      const topic=[[/感情|戀|恋|喜歡|喜欢|復合|复合|曖昧|婚|對象|对象|伴侶|伴侣|桃花|交往|分手/,[24,25]],[/工作|事業|事业|職|职|面試|升遷|老闆|同事|公司|創業/,[35,14,19]],[/錢|钱|財|财|收入|投資|投资|生意|薪|賣場|副業|網拍|經營|開店|客人|訂單|營收|電商|店/,[34,15,3,20]],[/健康|身體|身体|病|手術/,[5,8]],[/家|房|搬家|住/,[4]],[/消息|聯絡|联络|訊息|回覆|回复/,[27,1,12]]].filter(([re])=>re.test(q)).flatMap(([,ids])=>ids);
      add('指示牌九宮格與主題牌距離（左已發生、右將來、上想法、下潛在根基；距離1為貼身）',A(tb.significators).map(s=>s.name+'('+s.id+')在第'+s.position+'格（第'+s.row+'列第'+s.col+'欄）：'+Object.entries(s.around).map(([k,v])=>k+v).join('、')+([...new Set(topic)].length?'；主題牌距離：'+[...new Set(topic)].map(id=>{const c=cellOf(id),d0=dist(s.id,id);return c?c.name+(d0==null?'在尾排':d0):null;}).filter(Boolean).join('、'):'')).join('\n')+(A(tb.significators).length?'':'本盤無紳士／淑女牌'));
      add('大牌陣宮位：格/宮名/落入的牌（自宮：'+(A(tb.ownHouses).join('、')||'無')+'；四角：'+A(tb.corners).join('、')+'）',A(tb.houses).map(h=>h.house+h.houseName+'宮:'+h.card).join(' '),1);}
    if(e.method==='lenormand'){
      const R=A(d.records),N=i=>R[i-1]?.name||('第'+i+'張'),g=c.declaredGender||d.declaredGender,pr=c.personRep||d.personRep,cf=c.customFocus||d.customFocus;
      const inSpread=id=>R.find(r=>r.id===id);
      add('代表牌規則（引擎依性別聲明決定，不由牌面推）',(pr?'本人='+pr.name+'（'+pr.basis+'）'+(inSpread(pr.id)?'，在'+ (inSpread(pr.id).position||'第'+(R.indexOf(inSpread(pr.id))+1)+'張')+'；它周圍的牌是他現在的處境':'，本次未抽到，整個牌陣直接當成他的事來讀'):(g?'已聲明性別但無對應代表牌':'未聲明性別：紳士／淑女出現時只是牌面裡的一位男性／女性人物，不自動當本人'))+(cf?'；另指定焦點牌'+cf.name+'（代表本題那件事）'+(inSpread(cf.id)?'在'+(inSpread(cf.id).position||''):'未抽到'):'')+(R.some(r=>(r.id===28||r.id===29)&&!(pr&&pr.id===r.id))?'；牌面上另有'+R.filter(r=>(r.id===28||r.id===29)&&!(pr&&pr.id===r.id)).map(r=>r.name).join('、')+'：是別人（主管、同事、對象或家人），依題目決定是誰，不當本人':''));
      const paths=A(d.paths),mirror=A(d.mirror),knights=A(d.knights),spread=String(c.spreadType||d.spreadType||''),md=c.methodData||d.methodData||{};
      const pairNames=list=>list.map(m=>N(m.a)+'↔'+N(m.b)).join('、');
      if(spread==='two'&&R.length===2){add('雙牌讀法（引擎幾何）','主題'+N(1)+'，修飾'+N(2)+'：第二張形容第一張，讀成一句「'+N(1)+'，而且是'+N(2)+'那種」；沒有中心、沒有鏡像，不要讀成線。');}
      else if(spread==='choice'&&R.length===7){add('雙路比較讀法（引擎幾何）','A路：'+[1,2,3].map(N).join('→')+'；共同背景：'+N(4)+'；B路：'+[5,6,7].map(N).join('→')+'。兩路各自先讀成一句，共同背景同時套在兩路上，再用同一個標準比較；分線不跨接，A3與B1不相鄰。'+(pr&&inSpread(pr.id)?'本人'+pr.name+'落在'+inSpread(pr.id).position+'：只表示他的心思現在站在那一路，不代表那一路結果較好。':''));}
      else if(spread==='branches'&&A(md.branches).length){const br=A(md.branches);add('分線讀法（引擎幾何，每路獨立）',br.map((b,i)=>'第'+(i+1)+'路「'+(b.entity||b.question||'')+'」：'+[1,2,3].map(j=>N(i*3+j)).join('→')+'—單獨讀成一句').join('\n')+'\n路與路之間不相鄰、不比牌面吉凶總數；逐路答完原句的每個子題，再講共同條件。');}
      else if(spread==='nine'&&R.length===9){add('九宮格鏡像與騎士步（引擎幾何）','鏡像成對（隔著中心對照）：'+pairNames(mirror)+'；騎士步（隔格相望，較遠的影響）：'+pairNames(knights)+'。先讀中心與四正，再用鏡像補因果，騎士步只在改變結論時用。');}
      else if(d.tableau&&R.length===36){const rowLen=spread==='grand_nines'?9:8,rows=[];for(let r=0;r<4;r++)rows.push(R.slice(r*rowLen,r*rowLen+rowLen).map(x=>x.name).join('→'));const tail=rowLen===8?R.slice(32,36).map(x=>x.name).join('→'):'';
        const sigRec=pr&&inSpread(pr.id);let sigGeo='';if(sigRec){const idx=R.indexOf(sigRec);if(idx<32||rowLen===9){const r=Math.floor(idx/rowLen),cc=idx%rowLen;const col=[];for(let k=0;k<4;k++)col.push(R[k*rowLen+cc]?.name);const dg1=[],dg2=[];for(let k=-3;k<=3;k++){const rr=r+k,c1=cc+k,c2=cc-k;if(rr>=0&&rr<4&&c1>=0&&c1<rowLen)dg1.push(R[rr*rowLen+c1].name);if(rr>=0&&rr<4&&c2>=0&&c2<rowLen)dg2.push(R[rr*rowLen+c2].name);}
          const mr=mirror.filter(m=>m.a===idx+1||m.b===idx+1).map(m=>N(m.a===idx+1?m.b:m.a)),kn=knights.filter(m=>m.a===idx+1||m.b===idx+1).map(m=>N(m.a===idx+1?m.b:m.a));
          sigGeo='\n本人'+pr.name+'所在橫列：'+rows[r]+'；直欄：'+col.filter(Boolean).join('→')+'；兩條斜線：'+dg1.join('→')+'／'+dg2.join('→')+(mr.length?'；鏡像牌：'+mr.join('、'):'')+(kn.length?'；騎士步牌：'+kn.join('、'):'')+'。橫列是他這段時間的主線，左邊已發生、右邊將發生；直欄上面是他想的、下面是壓在底下的。';}
          else sigGeo='\n本人'+pr.name+'落在尾排（第'+(idx-31)+'張）：尾排是整件事的結語，不與主盤連線。';}
        add('大牌陣四列與尾排（引擎幾何；每列由左到右就是時間順序）',rows.map((x,i)=>'第'+(i+1)+'列：'+x).join('\n')+(tail?'\n尾排（結語，獨立讀）：'+tail:'')+sigGeo+'\n其他牌的橫直斜線同理用它的列欄取，不從牌號算。');}
      else if(paths.length===1&&R.length>=3){const mid=Math.ceil(R.length/2);add('線陣讀法（引擎幾何）','整條線：'+paths[0].map(N).join('→')+'；中心'+N(mid)+'是這件事的核心，左邊'+paths[0].slice(0,mid-1).map(N).join('、')+'是已經在發生或推著它的，右邊'+paths[0].slice(mid).map(N).join('、')+'是它接下來的走向。相鄰兩張連成一句：'+paths[0].slice(0,-1).map((p,i)=>N(p)+'＋'+N(paths[0][i+1])).join('、')+(mirror.length?'。鏡像成對（繞中心對照，常是因果或一體兩面）：'+pairNames(mirror):'')+'。先把整條讀成一句話，再回頭看哪一段對本題最重。');}
      else {add('合法全線',d.paths);add('鏡像及騎士步',P(d,['mirror','knights']),3);}
    }
    else add('實際牌陣特殊作用',compactObject(d.methodData),1);
  }
  /* 本題焦點層與邊界層已移除：解讀依各法正統取法與完整實算資料推演，不另加站內判斷規則。 */
  const writers={bazi,ziwei,vedic,astro,liuren,liuyao,yijing,meihua,name,compat,personality,tarot:cards,lenormand:cards,ootk:cards,oracle:cards};
  const plans=new Map();
  function compile(entries,data){
    const safe=root.JYReadingWorkflow?.careContext?.(data.question,data.notes)?.level==='safety-first';
    const header=['【一次貼上・完整解讀提示詞】',json({schema:'jy.native-analysis/1',method:data.method,delivery:'single-message',build:VERSION}),'【原問題】\n'+JSON.stringify(data.question),hasData(data.notes)?'【本次補充】\n'+JSON.stringify(data.notes):'', '【解讀與查證規則】\n'+rules,
      '【資料閱讀方式】\n以下是本次實算資料。表格依標題欄序還原，?是未定；不需要附件。'].filter(Boolean);
    const blocks=[];const add=(label,v,priority=0)=>{zhMethod=data.method;if(hasData(v))blocks.push({label,value:typeof v==='string'?zhText(v):readable(v),priority,method:'shared'});};
    const tasks=data.requestCoverage?.[0]?.coverage?.requirements?.tasks;if(A(tasks).length>1){const GW={general:'這個子題本身',direction:'方向／會不會',compare:'比較',comparison:'比較',timing:'時間',amount:'數量金額',count:'數量',rate:'比率',state:'現況',yesno:'是否',reason:'原因',cause:'原因',person:'人物',enumeration:'列出有哪些',advice:'該怎麼做',choice:'選哪一個',location:'在哪裡',vocation:'適合做什麼'},OW0=root.JYTarotFoundation?.OBSERVABLES||{},OW=Object.assign({state:'現況',realization:'會不會成',bounded_outcome:'結果落在哪個範圍',trajectory:'後續走向',timing:'時間',amount:'數量',comparison:'比較',person:'對方',reason:'原因',enumeration:'逐項列出',attention_focus:'最該注意什麼'},OW0),zhOnly=v=>/[A-Za-z]/.test(String(v||''))?null:v;add('原句子題核對（每一題都要各自答）',tasks.map((t,i)=>'子題'+(i+1)+'：原句第'+(A(t.sourceSpan)[0]??'?')+'–'+(A(t.sourceSpan)[1]??'?')+'字，要答的是'+(GW[t.goal]||zhOnly(t.goal)||'這個子題本身')+(A(t.requiredObservables).map(x=>OW[x]||zhOnly(x)).filter(Boolean).length?'，要講到'+t.requiredObservables.map(x=>OW[x]||zhOnly(x)).filter(Boolean).join('、'):'')+(A(t.measurement).length?'，量化條件：'+t.measurement.join('、'):'')).join('\n'));}
    const situation=root.JYReadingWorkflow?.situation?.(data.question,data.notes)||data.requestCoverage?.[0]?.coverage?.situation;
    const situationText=root.JYReadingWorkflow?.situationPrompt?.(situation);
    if(A(data.failures).length)add('未納入的紀錄',data.failures.map(f=>P(f,['sourceEntryIndex','label','method','status','reason','errorCode'])));
    for(const e of entries){const ctx=createContext(e,data);const isMathers=e.method==='tarot'&&/^mathers_/.test(String(e.chart?.tarotData?.spreadType||e.chart?.spreadType||e.chart?.methodId||''));
      ctx.add('本法正統取法（'+(isMathers?'Mathers 塔羅':(names[e.method]||e.method))+'）',(isMathers?guides.mathers:guides[e.method])||'依本法正統程序推演。');
      const contextReading=e.analysis.depthContract?.requestCoverage?.caseBasis?.contextReading;
      (writers[e.method]||cards)(ctx);
      const a=e.analysis;ctx.add('資料完整度',{provisional:!!a.coverage?.provisional,computation:P(a.computationAudit,['status']),inputLimits:a.coverage?.limitations});
      ctx.add('逐項作用與相反依據',A(a.items).map(p=>({item:p.label,finding:p.summary,support:p.support,caution:p.caution})),6);
      const sources=[...new Set(A(a.sources).map(x=>x.url).filter(Boolean))];ctx.add('規則來源（網址不等於本輪已讀）',sources.join('\n'),3);blocks.push(...ctx.b);
    }
    const end='【讀完資料再提醒一次】只依本則訊息的原題與實算資料，不用任何過往對話或記憶；依本法正統取法推演，先定答案與程度，再用白話講出依據。\n\n【成稿收尾】\n'+(safe?'原題明示眼前安全風險，先給安全支持；本題暫停手鍊、導購與賣場收尾，不用命理承諾安全。':commercial);
    const render=bs=>header.join('\n\n')+'\n\n'+bs.map(b=>'【'+b.label+'】\n'+b.value).join('\n\n')+'\n【資料結束】\n\n'+end;
    const fit=t=>chars(t)<=LIMIT&&bytes(t)<=BYTES;
    const core=blocks.filter(b=>b.priority===0),selected=new Set(core),optionalCount=new Set(blocks.filter(b=>b.priority>0).map(b=>b.label)).size,essential=render(core).replace('\n【資料結束】',optionalCount?'\n【未展開細表】另有'+optionalCount+'項旁系細表未展開（完整清單在本工具）。\n【資料結束】':'\n【資料結束】');
    if(!fit(essential)){const error=new Error('本次原題與必要資料共有'+chars(essential)+'字，超過單次貼上預算；內容未截斷，也不會分段複製。請縮小一次要求的年度或比較份數後重新產生。');error.code='SINGLE_PROMPT_CORE_OVER_BUDGET';error.characters=chars(essential);error.utf8Bytes=bytes(essential);error.blocks=core.map(b=>({label:b.label,characters:chars(b.value)}));error.limits={characters:LIMIT,utf8Bytes:BYTES};throw error;}
    // Fill optional blocks in priority order while always counting the scope
    // receipt of whatever is still not expanded. A second pass retries blocks
    // skipped early (the receipt only shrinks as blocks are added), so removing
    // or skipping a large block never strands smaller ones that would fit.
    const receiptOf=pend=>pend.length?'【未展開細表】'+[...new Set(pend.map(b=>b.label))].join('、')+'；不據此精斷。':'';
    const build=()=>{const kept=blocks.filter(b=>selected.has(b)),pend=blocks.filter(b=>!selected.has(b)),body=render(kept),put=r=>body.replace('\n【資料結束】',r?'\n'+r+'\n【資料結束】':'\n【資料結束】'),full=put(receiptOf(pend));return fit(full)||!pend.length?full:put('【未展開細表】另有'+new Set(pend.map(b=>b.label)).size+'項旁系細表未展開（完整清單在本工具）；不據此精斷。');};
    const optional=blocks.filter(b=>b.priority>0).sort((a,b)=>a.priority-b.priority);
    for(let pass=0;pass<2;pass++)for(const b of optional){if(selected.has(b))continue;selected.add(b);if(!fit(build()))selected.delete(b);}
    const kept=blocks.filter(b=>selected.has(b)),pending=blocks.filter(b=>!selected.has(b));
    let result=build();
    if(!fit(result)){const error=new Error('單次貼上範圍說明超過長度預算；未複製不完整資料。');error.code='SINGLE_PROMPT_SCOPE_OVER_BUDGET';throw error;}
    const plan={version:VERSION,mode:'single-message',limits:{characters:LIMIT,utf8Bytes:BYTES},characters:chars(result),utf8Bytes:bytes(result),coreBlocks:core.map(b=>b.label),includedBlocks:kept.map(b=>b.label),notExpanded:pending.map(b=>b.label),completeCore:true,originalQuestionPreserved:true,sourceChartMutated:false,usesReferences:false,requiresAttachment:false,guaranteedExternalPlatformLimit:false};
    plans.set(result,plan);if(plans.size>40)plans.delete(plans.keys().next().value);return result;
  }
  root.JYSinglePaste=Object.freeze({version:VERSION,limits:{characters:LIMIT,utf8Bytes:BYTES},compile,get:text=>plans.get(String(text))||null,chars,bytes,guides});
})(typeof window==='undefined'?globalThis:window);
// END GENERATED SINGLE PASTE RUNTIME
/* Reading text is composed by the shared, bounded single-message compiler. */
(function(root){
  'use strict';
  const text=v=>typeof v==='string'?v:JSON.stringify(v,(_,x)=>typeof x==='number'&&Number.isFinite(x)?Math.round(x*10000)/10000:x);
  root.JYPromptBrief=Object.freeze({version:'20261015brief27',render:(entries,data)=>root.JYSinglePaste.compile(entries,data),text});
})(typeof window==='undefined'?globalThis:window);
