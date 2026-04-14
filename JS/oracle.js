/* ═══════════════════════════════════════════════════════
   oracle.js — 靜月靈籤（六十甲子靈籤）v4
   純前端，零API成本，IIFE自封裝
   圖片路徑: img/oracle/ 目錄
   v4 新增：允筊流程、廟宇背景、煙霧粒子、
   擲筊3階段動畫、香爐圖、完整29項籤解
   ═══════════════════════════════════════════════════════ */
;(function(){
'use strict';

var IMG = {
  deity:    'img/oracle/oracle-deity.png',
  pray:     'img/oracle/oracle-pray.png',
  qiantong: 'img/oracle/oracle-qiantong.png',
  cardBg:   'img/oracle/oracle-card-bg.png',
  smoke:    'img/oracle/oracle-smoke.png',
  jiaoFlat: 'img/oracle/jiao-flat.png',
  jiaoRound:'img/oracle/jiao-round.png',
  templeBg: 'img/oracle/oracle-temple-bg.jpg',
  incense:  'img/oracle/oracle-incense.png'
};

/* ── 60首籤詩 ── */
var P = [
{n:1,g:"甲子",p:"日出便見風雲散\n光明清淨照世間\n一向前途通大道\n萬事清吉保平安",s:"唐太宗坐享太平",t:"屬金利秋 宜其西方",r:"上上"},
{n:2,g:"甲寅",p:"於今此景正當時\n看看欲吐百花魁\n若能遇得春色到\n一洒清吉脫塵埃",s:"武則天賞花",t:"屬木利春 宜其東方",r:"上上"},
{n:3,g:"甲辰",p:"勸君把定心莫虛\n天註衣祿自有餘\n和合重重常吉慶\n時來終遇得明珠",s:"文王遇太公",t:"屬土利年 宜其中央",r:"上"},
{n:4,g:"甲午",p:"風恬浪靜可行舟\n恰是中秋月一輪\n凡事不須多憂慮\n福祿自有慶家門",s:"韓信功成封乞食",t:"屬火利夏 宜其南方",r:"上"},
{n:5,g:"甲申",p:"只恐前途命有變\n勸君作急可宜先\n且守長江無大事\n命逢太白守身邊",s:"劉智遠得岳母助",t:"屬金利秋 宜其西方",r:"中"},
{n:6,g:"甲戌",p:"風雲致雨落洋洋\n天災時氣必有傷\n命內此事難和合\n更逢一足出外鄉",s:"打虎遇兄弟",t:"屬土利年 宜其中央",r:"下"},
{n:7,g:"乙丑",p:"雲開月出正分明\n不須進退問前程\n婚姻皆由天註定\n和合清吉萬事成",s:"馮京三元及第",t:"屬金利秋 宜其西方",r:"上上"},
{n:8,g:"乙卯",p:"禾稻看看結成完\n此事必定兩相全\n回到家中寬心坐\n妻兒皷腹樂團圓",s:"隋唐演義",t:"屬木利春 宜其東方",r:"上"},
{n:9,g:"乙巳",p:"龍虎相隨在深山\n君爾何須背後看\n不知此去相愛愉\n他日與我卻無干",s:"瀟湘夜雨",t:"屬火利夏 宜其南方",r:"中下"},
{n:10,g:"乙未",p:"花開結子一半枯\n可惜今年汝虛度\n漸漸日落西山去\n勸君不用向前途",s:"失水龍魚",t:"屬土利年 宜其中央",r:"下"},
{n:11,g:"乙酉",p:"靈雞漸漸見分明\n凡事且看子丑寅\n雲開月出照天下\n郎君即便見太平",s:"書生聞雞起舞",t:"屬金利秋 宜其西方",r:"上"},
{n:12,g:"乙亥",p:"長江風浪漸漸靜\n于今得進可安寧\n必有貴人相扶助\n凶事脫出見太平",s:"蘇秦仕秦",t:"屬水利冬 宜其北方",r:"上"},
{n:13,g:"丙子",p:"命中正逢羅孛關\n用盡心機總未休\n作福問神難得過\n恰是行舟上高灘",s:"羅通拜帥",t:"屬火利夏 宜其南方",r:"下"},
{n:14,g:"丙寅",p:"財中漸漸見分明\n花開花謝結子成\n寬心且看月中桂\n郎君即便見太平",s:"孟嘗君招賢",t:"屬木利春 宜其東方",r:"上"},
{n:15,g:"丙辰",p:"八十原來是太公\n看看晚景遇文王\n目下緊事休相問\n勸君且守待運通",s:"姜太公渭水釣魚",t:"屬土利年 宜其中央",r:"中"},
{n:16,g:"丙午",p:"不須作福不須求\n用盡心機總未休\n陽世不知陰世事\n官法如爐不自由",s:"許仙鬧世",t:"屬火利夏 宜其南方",r:"下下"},
{n:17,g:"丙申",p:"舊恨重重未改為\n家中禍患不臨身\n須當謹防宜作福\n龍蛇交會得和合",s:"龍蛇相遇",t:"屬金利秋 宜其西方",r:"中"},
{n:18,g:"丙戌",p:"君問中間此言因\n看看祿馬拱前程\n若得貴人多得利\n和合自有兩分明",s:"邵良父子遇玉娘",t:"屬土利年 宜其中央",r:"上"},
{n:19,g:"丁丑",p:"富貴由命天註定\n心高必然誤君期\n不然且回依舊路\n雲開月出自分明",s:"陶淵明歸隱",t:"屬金利秋 宜其西方",r:"中"},
{n:20,g:"丁卯",p:"前途功名未得意\n只恐命內有交加\n兩家必定防損失\n勸君且退莫咨嗟",s:"薛仁貴投軍",t:"屬木利春 宜其東方",r:"下"},
{n:21,g:"丁巳",p:"十方佛法有靈通\n大難禍患不相同\n紅日當空常照耀\n還有貴人到家堂",s:"李太白醉草嚇蠻書",t:"屬火利夏 宜其南方",r:"上"},
{n:22,g:"丁未",p:"太公家業八十成\n月出光輝四海明\n命內自然逢大吉\n茅屋中間百事亨",s:"姜太公封相",t:"屬土利年 宜其中央",r:"上上"},
{n:23,g:"丁酉",p:"欲去長江水闊茫\n前途未遂運未通\n如今絲綸常在手\n只恐魚水不相逢",s:"大公釣魚未果",t:"屬金利秋 宜其西方",r:"中下"},
{n:24,g:"丁亥",p:"月出光輝四海明\n前途祿位見太平\n浮雲掃退終無事\n可保禍患不臨身",s:"薛平貴封王",t:"屬水利冬 宜其北方",r:"上"},
{n:25,g:"戊子",p:"總是前途莫心勞\n求神問聖枉是多\n但看雞犬日過後\n不須作福事如何",s:"呂蒙正趕齋",t:"屬火利夏 宜其南方",r:"中下"},
{n:26,g:"戊寅",p:"選出牡丹第一枝\n勸君折取莫遲疑\n世間若問相知處\n萬事逢春正及時",s:"楊六郎大破天門陣",t:"屬木利春 宜其東方",r:"上上"},
{n:27,g:"戊辰",p:"君爾寬心且自由\n門庭清吉家無憂\n財寶自然終吉利\n凡事無傷不用求",s:"劉備入益州",t:"屬土利年 宜其中央",r:"上"},
{n:28,g:"戊午",p:"於今莫作此當時\n虎落平陽被犬欺\n世間凡事何難定\n千山萬水也遲疑",s:"吳漢殺妻",t:"屬火利夏 宜其南方",r:"下"},
{n:29,g:"戊申",p:"枯木可惜未逢春\n如今反在暗中藏\n寬心且守風霜退\n還君依舊作乾坤",s:"蘇武牧羊",t:"屬金利秋 宜其西方",r:"中"},
{n:30,g:"戊戌",p:"漸漸看此月中和\n過後須防未得高\n改變顏色前途去\n凡事必定見重勞",s:"曹操招安",t:"屬土利年 宜其中央",r:"中下"},
{n:31,g:"己丑",p:"綠柳蒼蒼正當時\n任君此去作乾坤\n花果結實無殘謝\n福祿自有慶家門",s:"趙玄郎送京娘",t:"屬金利秋 宜其西方",r:"上"},
{n:32,g:"己卯",p:"龍虎相交在門前\n此事必定兩相連\n黃金忽然變成鐵\n何用作福問神仙",s:"劉備取西川",t:"屬木利春 宜其東方",r:"下"},
{n:33,g:"己巳",p:"欲去長江水闊茫\n行舟把定未遭風\n戶內用心再作福\n看看魚水得相逢",s:"鳳儀亭呂布戲貂蟬",t:"屬火利夏 宜其南方",r:"中"},
{n:34,g:"己未",p:"危險高山行過盡\n莫嫌此路有重重\n若見蘭桂漸漸發\n長蛇反轉變成龍",s:"李干戈求嗣",t:"屬土利年 宜其中央",r:"上"},
{n:35,g:"己酉",p:"此事何須用心機\n前途變怪自然知\n看看此去得和合\n漸漸脫出見太平",s:"貼金走路遇鬼",t:"屬金利秋 宜其西方",r:"中"},
{n:36,g:"己亥",p:"福如東海壽如山\n君爾何須嘆苦難\n命內自然逢大吉\n祈保分明自平安",s:"秦瓊賣馬",t:"屬水利冬 宜其北方",r:"上上"},
{n:37,g:"庚子",p:"運逢得意身顯變\n君爾身中皆有益\n一向前途無難事\n決意之中保清吉",s:"蔡君謨作陳三詩",t:"屬火利夏 宜其南方",r:"上"},
{n:38,g:"庚寅",p:"名顯有意在中央\n不須祈禱心自安\n看看早晚日過後\n即時得意在其間",s:"孔明入蜀",t:"屬木利春 宜其東方",r:"上"},
{n:39,g:"庚辰",p:"意中若問神仙路\n勸爾且退望高樓\n寬心且守寬心坐\n必然遇得貴人扶",s:"陶朱公範蠡",t:"屬土利年 宜其中央",r:"中"},
{n:40,g:"庚午",p:"平生富貴成祿位\n君家門戶定光輝\n此中必定無損失\n夫妻百歲喜相隨",s:"韓信登台封帥",t:"屬火利夏 宜其南方",r:"上上"},
{n:41,g:"庚申",p:"今行到此實難推\n歌歌暢飲自徘徊\n雞犬相聞消息近\n婚姻夙世結成雙",s:"孟姜女哭長城",t:"屬金利秋 宜其西方",r:"中"},
{n:42,g:"庚戌",p:"一重江水一重山\n誰知此去路又難\n任他改求終不過\n是非終久未得安",s:"伯夷叔齊餓首陽",t:"屬土利年 宜其中央",r:"下"},
{n:43,g:"辛丑",p:"一年作事急如飛\n君爾寬心莫遲疑\n貴人還在千里外\n音信月中漸漸知",s:"劉智遠投軍",t:"屬金利秋 宜其西方",r:"中"},
{n:44,g:"辛卯",p:"客到前途多得利\n君爾何故兩相疑\n雖是中間逢進退\n月出光輝得運時",s:"關羽千里尋兄",t:"屬木利春 宜其東方",r:"上"},
{n:45,g:"辛巳",p:"花開今已結成果\n富貴榮華終到老\n君子小人相會合\n萬事清吉莫煩惱",s:"柳毅傳書",t:"屬火利夏 宜其南方",r:"上上"},
{n:46,g:"辛未",p:"功名得意與君顯\n前途富貴喜安然\n若遇一輪明月照\n十五團圓光滿天",s:"二郎擔山趕太陽",t:"屬土利年 宜其中央",r:"上上"},
{n:47,g:"辛酉",p:"君爾何須問聖跡\n自己心中皆有益\n於今且看月中旬\n凶事脫出化成吉",s:"曹操煮酒論英雄",t:"屬金利秋 宜其西方",r:"中上"},
{n:48,g:"辛亥",p:"陽世作事未和同\n雲遮月色正朦朧\n心中意欲前途去\n只恐命內運未通",s:"出師未捷身先死",t:"屬水利冬 宜其北方",r:"下"},
{n:49,g:"壬子",p:"言語雖多不可從\n風雲靜處未行龍\n暗中終得明消息\n君爾何須問重重",s:"司馬昭之心",t:"屬火利夏 宜其南方",r:"中"},
{n:50,g:"壬寅",p:"佛前發誓無異心\n且看前途得好音\n此物原來本是鐵\n也能變化得成金",s:"鐵杵磨成繡花針",t:"屬木利春 宜其東方",r:"上"},
{n:51,g:"壬辰",p:"東西南北不堪行\n前途此事正可當\n勸君把定莫煩惱\n家門自有保安康",s:"荊軻刺秦王",t:"屬土利年 宜其中央",r:"中"},
{n:52,g:"壬午",p:"功名事業本由天\n不須掛念意懸懸\n若問中間遲與速\n風雲際會在眼前",s:"鐵拐李成仙",t:"屬火利夏 宜其南方",r:"上"},
{n:53,g:"壬申",p:"看君來問心中事\n積善之家慶有餘\n運亨財子雙雙至\n指日喜氣溢門閭",s:"孟母三遷",t:"屬金利秋 宜其西方",r:"上上"},
{n:54,g:"壬戌",p:"孤燈寂寂夜沉沉\n萬事清吉萬事成\n若逢陰中有善果\n燒得好香達神明",s:"呂洞賓修仙",t:"屬土利年 宜其中央",r:"中"},
{n:55,g:"癸丑",p:"須知進退總虛言\n看看發暗未必全\n珠玉深藏還未變\n心中但得枉徒然",s:"蘇東坡遭貶",t:"屬金利秋 宜其西方",r:"下"},
{n:56,g:"癸卯",p:"病中若得苦心勞\n到底完全總未遭\n去後不須回頭問\n心中事務盡消磨",s:"司馬遷著史記",t:"屬木利春 宜其東方",r:"中"},
{n:57,g:"癸巳",p:"勸君把定心莫虛\n前途清吉得運時\n到底中間無大事\n又遇神仙守安居",s:"八仙過海",t:"屬火利夏 宜其南方",r:"上"},
{n:58,g:"癸未",p:"蛇身意欲變成龍\n只恐命內運未通\n久病且作寬心坐\n言語雖多不可從",s:"包公審案",t:"屬土利年 宜其中央",r:"中下"},
{n:59,g:"癸酉",p:"有心作福莫遲疑\n求名清吉正當時\n此事必能成會合\n財寶自然喜相隨",s:"狄仁傑奉旨",t:"屬金利秋 宜其西方",r:"上"},
{n:60,g:"癸亥",p:"月出光輝本清吉\n浮雲總是蔽蔭色\n戶內用心再作福\n當官分理便有益",s:"趙匡胤登基",t:"屬水利冬 宜其北方",r:"中"}
];

var CN=["","一","二","三","四","五","六","七","八","九","十","十一","十二","十三","十四","十五","十六","十七","十八","十九","二十","二十一","二十二","二十三","二十四","二十五","二十六","二十七","二十八","二十九","三十","三十一","三十二","三十三","三十四","三十五","三十六","三十七","三十八","三十九","四十","四十一","四十二","四十三","四十四","四十五","四十六","四十七","四十八","四十九","五十","五十一","五十二","五十三","五十四","五十五","五十六","五十七","五十八","五十九","六十"];

/* ── 完整29項籤解 ── */
var KEYS=["凡事","作事","家事","家運","婚姻","求兒","六甲","求財","功名","歲君","治病","出外","經商","來人","行舟","移居","失物","求雨","官事","六畜","耕作","築室","墳墓","討海","作塭","魚苗","月令","尋人","遠信"];

var D={
1:{凡事:"大吉昌",作事:"難成，成者大吉",家事:"無憂",家運:"平安大吉",婚姻:"允成",求兒:"大吉",六甲:"頭胎男，二胎女",求財:"先大進，後小利",功名:"望後有成",歲君:"清吉",治病:"未日痊安",出外:"平安",經商:"如意",來人:"月光在",行舟:"有大財",移居:"得安",失物:"在東急尋能還",求雨:"尚未",官事:"理斷分明",六畜:"好",耕作:"甚得利",築室:"清吉光明",墳墓:"地穴大吉",討海:"漸漸得利",作塭:"大吉利",魚苗:"不畏",月令:"遂意",尋人:"得回",遠信:"速至"},
2:{凡事:"春天到",作事:"春成美，冬不佳",家事:"必得進益",家運:"福祉茂盛",婚姻:"永偕伉儷",求兒:"適宜",六甲:"生男",求財:"如泉湧",功名:"二次成，秋進連中",歲君:"中和",治病:"老不好，少平安",出外:"春夏好，秋冬呆",經商:"大吉利市",來人:"南方",行舟:"有大財",移居:"平平",失物:"謹尋在，遲者無",求雨:"甲子日得有",官事:"完局",六畜:"興旺大利",耕作:"春季如意",築室:"大吉",墳墓:"光前裕後",討海:"春有冬無",作塭:"可慶獲利",魚苗:"大利",月令:"不畏",尋人:"南方",遠信:"春天到"},
3:{凡事:"吉",作事:"二次成",家事:"餘興且喜",家運:"和氣，後得祥瑞",婚姻:"大吉",求兒:"吉",六甲:"先男後女",求財:"後遇貴人大興",功名:"後科連登",歲君:"安和",治病:"命不畏，平安",出外:"向南方遇貴人",經商:"先利平，後大財",來人:"立即到",行舟:"漸得大財",移居:"得安",失物:"月光必在",求雨:"過日自有",官事:"不畏，破財，完局",六畜:"可納",耕作:"下冬好",築室:"大吉",墳墓:"永裕後崑",討海:"晚有大利",作塭:"和者必獲厚利",魚苗:"後得大利",月令:"漸得春風",尋人:"得回",遠信:"守候佳音"},
4:{凡事:"成者大吉",作事:"有成",家事:"綿綿齊輝",家運:"大獲吉昌",婚姻:"和諧，月半成",求兒:"好",六甲:"先男後女",求財:"在家好，出外凶",功名:"顯祖榮宗",歲君:"平安",治病:"近日痊癒",出外:"求財求事如意",經商:"大吉利",來人:"即到",行舟:"風平，大吉",移居:"可慶",失物:"月光在",求雨:"月末即到",官事:"破財，求貴人解",六畜:"興盛",耕作:"有收",築室:"門庭興旺",墳墓:"可得瑞氣",討海:"有大財",作塭:"有望",魚苗:"月光好",月令:"好",尋人:"快遇",遠信:"遲到"},
5:{凡事:"待時機",作事:"顛倒，前凶後吉",家事:"有貴人，團圓",家運:"先被邪，後吉祥",婚姻:"多口舌，不吉",求兒:"不佳",六甲:"頭胎生女次生男",求財:"以待時來",功名:"必遇，防徼",歲君:"平安",治病:"月光癒，暗不吉",出外:"下半年好",經商:"先利，後遇貴人",來人:"遲後到",行舟:"出外有風波災",移居:"不好",失物:"謹尋在，遲即無",求雨:"朝夕即有",官事:"宜和拖尾",六畜:"不祥",耕作:"內有不足",築室:"不吉",墳墓:"先平後得佳氣",討海:"邪病先輕後好",作塭:"先難後得",魚苗:"先無後有",月令:"淡淡",尋人:"待慢",遠信:"必阻遲至"},
6:{凡事:"待望",作事:"不成局",家事:"家庭相爭",家運:"有怪必防",婚姻:"不宜",求兒:"不可",六甲:"男高貴，晚投枝",求財:"空有",功名:"難望",歲君:"破財，月令不吉",治病:"邪作病，險不吉",出外:"無貴人",經商:"財本耗散",來人:"月光即到",行舟:"不好",移居:"且慢",失物:"運如此，路難逢",求雨:"不到則久",官事:"了錢，拖尾",六畜:"不佳",耕作:"無收",築室:"犯凶星",墳墓:"地運不佳",討海:"邪祟不利",作塭:"失利",魚苗:"失利了錢",月令:"不遂",尋人:"遲遇",遠信:"無望"},
7:{凡事:"後成",作事:"月光成",家事:"冒險，平安",家運:"漸漸平安",婚姻:"月光成，暗不成",求兒:"好",六甲:"定必生女",求財:"有成",功名:"少有成，老無",歲君:"好",治病:"女平，男晚好",出外:"滿路異香",經商:"成者大吉",來人:"月中到",行舟:"須當先防",移居:"不吉",失物:"月光在，月暗無",求雨:"初無，月尾有",官事:"破財，完局",六畜:"興旺",耕作:"有收",築室:"月中好",墳墓:"地勢甚美",討海:"合和吉，不合凶",作塭:"須防風水",魚苗:"月中吉",月令:"淡淡",尋人:"月中遇",遠信:"可喜"},
8:{凡事:"和者得，不和失",作事:"先難後興",家事:"進益團美",家運:"平安",婚姻:"成，大吉，兩全其美",求兒:"吉",六甲:"先男後女",求財:"下半年好，家利",功名:"二次得進",歲君:"和氣",治病:"少不畏，老不好",出外:"不可",經商:"有利必得",來人:"速到",行舟:"得財",移居:"大吉",失物:"速尋必在",求雨:"月尾即有",官事:"二次完明，了財",六畜:"大吉",耕作:"下半年有收成",築室:"居中",墳墓:"地運有合",討海:"好",作塭:"允收",魚苗:"大利",月令:"破財，下年不畏",尋人:"速至",遠信:"速至"},
9:{凡事:"謹慎",作事:"守己安分",家事:"無有際會",家運:"有邪，難安",婚姻:"不可",求兒:"切要不可",六甲:"子媳虛",求財:"無益",功名:"不取",歲君:"不吉",治病:"運深危險",出外:"不可",經商:"了錢",來人:"未日到",行舟:"不美",移居:"不佳",失物:"難尋",求雨:"尚未，自有",官事:"不可，破財",六畜:"不可納",耕作:"無收，了工",築室:"且慢也可",墳墓:"地勢適當",討海:"有犯邪祟",作塭:"了工蝕本",魚苗:"了錢",月令:"破財有口舌",尋人:"漸回",遠信:"無望"},
10:{凡事:"拖尾，難解難脫",作事:"難成",家事:"恐防短壽",家運:"難安",婚姻:"不可，難成",求兒:"不可",六甲:"子媳難得",求財:"上半年空破財",功名:"枉費，難得",歲君:"不順",治病:"月半安，月尾死",出外:"不可",經商:"不好，了錢",來人:"月底間",行舟:"謹慎無害",移居:"不允",失物:"難尋",求雨:"朝夕即到",官事:"大了錢，不好",六畜:"不吉",耕作:"五分平平",築室:"有災星",墳墓:"地犯退敗，必遷",討海:"全無，不好",作塭:"無望，蝕本",魚苗:"得失",月令:"難通",尋人:"月尾回",遠信:"難至"},
11:{凡事:"作不和，子錢安",作事:"子丑寅日必成",家事:"平好",家運:"漸漸得居春風",婚姻:"終成",求兒:"可也",六甲:"先男，貴氣",求財:"漸漸有收",功名:"費了工，八月好",歲君:"順吉",治病:"大命不好，子丑寅日過不畏",出外:"子丑寅日可行",經商:"不利",來人:"近日到",行舟:"不可",移居:"平安",失物:"子丑寅日尋在",求雨:"近有",官事:"有人和吉，三月完局",六畜:"可納",耕作:"半收",築室:"好",墳墓:"平平",討海:"前呆后微",作塭:"小收微利",魚苗:"小利",月令:"不畏",尋人:"牛虎日",遠信:"牛虎日"},
12:{凡事:"月光好",作事:"進行有利",家事:"光耀門閭",家運:"漸安",婚姻:"可合成者吉",求兒:"吉",六甲:"先男高貴",求財:"好運，得意",功名:"難得",歲君:"順吉",治病:"月光好，老不痊",出外:"有貴人扶",經商:"大吉",來人:"近日到",行舟:"大吉",移居:"平正",失物:"急尋在，遲難尋",求雨:"遠",官事:"了錢，求貴人脫",六畜:"可納",耕作:"平平",築室:"慢即可",墳墓:"地勢有合",討海:"微利后有",作塭:"漸得如意",魚苗:"中有利",月令:"破財不遂",尋人:"近日",遠信:"速至"},
13:{凡事:"不吉",作事:"先難後興",家事:"門庭起風波",家運:"人不安，邪作祟",婚姻:"難合",求兒:"不可",六甲:"臨產危險",求財:"犯活鬼，下年無",功名:"費工，望後得進",歲君:"淡淡",治病:"犯太歲必死，未不畏",出外:"不可",經商:"失運",來人:"難望",行舟:"不順，失利",移居:"不可",失物:"錢難尋，未日在",求雨:"近日無",官事:"大呆",六畜:"不吉",耕作:"小收，不利",築室:"犯災星",墳墓:"地勢不吉",討海:"不好，無財，失利",作塭:"防風水，虧本",魚苗:"待機可以",月令:"正月至六月止",尋人:"難，免望",遠信:"音息魚沉"},
14:{凡事:"大吉",作事:"決意成功",家事:"光前裕后，可喜",家運:"平安",婚姻:"成好",求兒:"平正",六甲:"先男後女，富貴",求財:"月光進，漸暗少",功名:"可喜",歲君:"中和",治病:"險，月光過不畏",出外:"必得貴人",經商:"漸得",來人:"月尾到",行舟:"月圓過大吉",移居:"吉",失物:"西方尋",求雨:"月半無，月尾有",官事:"破財後，完明",六畜:"大吉",耕作:"早晚有收成",築室:"子孫永發其昌",墳墓:"得其地，後大吉",討海:"月光過，大吉",作塭:"先微，後有大利",魚苗:"大利",月令:"頭破錢，後如意",尋人:"月中至",遠信:"速至"},
15:{凡事:"守待運通",作事:"待時",家事:"中平",家運:"中平",婚姻:"待時",求兒:"待時",六甲:"生女",求財:"待時",功名:"晚成",歲君:"中平",治病:"緩癒",出外:"宜守",經商:"待運",來人:"遲到",行舟:"宜守",移居:"不宜",失物:"難尋",求雨:"遲",官事:"和",六畜:"中平",耕作:"半收",築室:"緩議",墳墓:"中平",討海:"宜守",作塭:"待時",魚苗:"中平",月令:"中平",尋人:"遲",遠信:"遲"},
16:{凡事:"不吉",作事:"枉費心機",家事:"不安",家運:"不安",婚姻:"不成",求兒:"不可",六甲:"難",求財:"無",功名:"無",歲君:"不吉",治病:"難癒",出外:"不利",經商:"不利",來人:"不到",行舟:"不利",移居:"不宜",失物:"無",求雨:"無",官事:"凶",六畜:"不利",耕作:"無收",築室:"不可",墳墓:"不吉",討海:"不利",作塭:"不利",魚苗:"不利",月令:"不吉",尋人:"難",遠信:"無"},
17:{凡事:"謹防宜作福",作事:"宜防",家事:"禍患須防",家運:"有禍患須防",婚姻:"龍蛇交會可合",求兒:"可",六甲:"生男",求財:"宜守",功名:"宜守",歲君:"中平",治病:"宜作福",出外:"謹慎",經商:"宜防",來人:"遲到",行舟:"謹慎",移居:"不宜",失物:"難尋",求雨:"遲",官事:"宜和",六畜:"中平",耕作:"中平",築室:"謹慎",墳墓:"中平",討海:"宜防",作塭:"謹慎",魚苗:"中平",月令:"中平",尋人:"遲",遠信:"遲"},
18:{凡事:"吉",作事:"有貴人",家事:"和合",家運:"和合",婚姻:"可成",求兒:"吉",六甲:"先男",求財:"有貴人得利",功名:"可期",歲君:"吉",治病:"可癒",出外:"吉",經商:"有利",來人:"即到",行舟:"順利",移居:"吉",失物:"可尋",求雨:"有",官事:"明",六畜:"可納",耕作:"有收",築室:"吉",墳墓:"吉",討海:"有利",作塭:"有利",魚苗:"有利",月令:"吉",尋人:"得遇",遠信:"即至"},
19:{凡事:"守舊",作事:"莫心高",家事:"中平",家運:"中平",婚姻:"天註定",求兒:"中平",六甲:"生女",求財:"勿貪",功名:"莫強求",歲君:"中平",治病:"漸癒",出外:"依舊路",經商:"守舊",來人:"遲到",行舟:"宜守",移居:"不宜",失物:"難尋",求雨:"遲",官事:"和",六畜:"中平",耕作:"中平",築室:"守舊",墳墓:"中平",討海:"中平",作塭:"守舊",魚苗:"中平",月令:"中平",尋人:"遲遇",遠信:"遲"},
20:{凡事:"不得意",作事:"防損",家事:"防損失",家運:"防損失",婚姻:"不利",求兒:"不佳",六甲:"難",求財:"損",功名:"未得意",歲君:"不順",治病:"延遲",出外:"不宜",經商:"防損",來人:"不到",行舟:"不利",移居:"不宜",失物:"難還",求雨:"遲",官事:"退讓",六畜:"不利",耕作:"半收",築室:"不宜",墳墓:"不利",討海:"不利",作塭:"防損",魚苗:"不利",月令:"不遂",尋人:"難遇",遠信:"遲"},
21:{凡事:"貴人扶持",作事:"和大吉",家事:"必得吉昌",家運:"必得吉昌",婚姻:"難成",求兒:"好",六甲:"先男",求財:"先無後有",功名:"望後科",歲君:"吉",治病:"大命險貴人扶",出外:"緩有貴人",經商:"先難後吉",來人:"近日到",行舟:"吉",移居:"吉",失物:"可在",求雨:"有",官事:"有貴人脫",六畜:"可納",耕作:"有收",築室:"吉",墳墓:"吉",討海:"漸有利",作塭:"先難後得",魚苗:"漸有利",月令:"先難後吉",尋人:"近日遇",遠信:"近日至"},
22:{凡事:"大吉",作事:"大成",家事:"百事亨",家運:"百事亨",婚姻:"大吉",求兒:"大吉",六甲:"先男，貴",求財:"大吉",功名:"大成",歲君:"大吉",治病:"可癒",出外:"吉",經商:"大利",來人:"即到",行舟:"大吉",移居:"大吉",失物:"可還",求雨:"即有",官事:"吉",六畜:"大利",耕作:"大收",築室:"大吉",墳墓:"大吉",討海:"大利",作塭:"大利",魚苗:"大利",月令:"大吉",尋人:"即遇",遠信:"即至"},
23:{凡事:"運未通",作事:"未遂",家事:"中下",家運:"中下",婚姻:"難合",求兒:"難",六甲:"生女",求財:"難得",功名:"未通",歲君:"中下",治病:"延遲",出外:"不利",經商:"不利",來人:"遲到",行舟:"不利",移居:"不宜",失物:"難還",求雨:"遲",官事:"不利",六畜:"中平",耕作:"半收",築室:"不宜",墳墓:"中平",討海:"不利",作塭:"不利",魚苗:"不利",月令:"中下",尋人:"難遇",遠信:"遲"},
24:{凡事:"平安",作事:"太平",家事:"禍患不臨",家運:"禍患不臨",婚姻:"可成",求兒:"吉",六甲:"先男",求財:"有",功名:"可見",歲君:"吉",治病:"可癒",出外:"平安",經商:"平穩",來人:"即到",行舟:"平安",移居:"吉",失物:"可還",求雨:"有",官事:"無事",六畜:"吉",耕作:"有收",築室:"吉",墳墓:"吉",討海:"平穩",作塭:"可得",魚苗:"有利",月令:"平安",尋人:"得遇",遠信:"即至"},
25:{凡事:"莫心勞",作事:"枉費",家事:"中下",家運:"中下",婚姻:"待時",求兒:"難",六甲:"生女",求財:"薄",功名:"難",歲君:"中下",治病:"待時",出外:"不宜急",經商:"小利",來人:"遲到",行舟:"不宜",移居:"不宜",失物:"難尋",求雨:"遲",官事:"和",六畜:"中平",耕作:"半收",築室:"不宜",墳墓:"中平",討海:"小利",作塭:"小利",魚苗:"小利",月令:"中下",尋人:"遲遇",遠信:"遲"},
26:{凡事:"大吉",作事:"莫遲疑",家事:"大吉",家運:"大吉",婚姻:"大吉",求兒:"大吉",六甲:"先男",求財:"大利",功名:"第一",歲君:"大吉",治病:"速癒",出外:"大吉",經商:"逢春及時",來人:"即到",行舟:"大吉",移居:"大吉",失物:"可還",求雨:"即有",官事:"吉",六畜:"大利",耕作:"大收",築室:"大吉",墳墓:"大吉",討海:"大利",作塭:"大利",魚苗:"大利",月令:"大吉",尋人:"即遇",遠信:"即至"},
27:{凡事:"無傷不用求",作事:"吉利",家事:"清吉無憂",家運:"清吉無憂",婚姻:"成",求兒:"吉",六甲:"先男",求財:"吉利",功名:"可成",歲君:"吉",治病:"可癒",出外:"平安",經商:"吉利",來人:"即到",行舟:"平安",移居:"吉",失物:"可還",求雨:"有",官事:"無傷",六畜:"可納",耕作:"有收",築室:"吉",墳墓:"吉",討海:"有利",作塭:"有利",魚苗:"有利",月令:"吉",尋人:"得遇",遠信:"即至"},
28:{凡事:"不吉",作事:"難定",家事:"虎落平陽",家運:"虎落平陽",婚姻:"不利",求兒:"難",六甲:"難",求財:"難",功名:"不利",歲君:"不順",治病:"難癒",出外:"遲疑",經商:"不利",來人:"遲到",行舟:"不利",移居:"不宜",失物:"難還",求雨:"遲",官事:"凶",六畜:"不利",耕作:"半收",築室:"不宜",墳墓:"不利",討海:"不利",作塭:"不利",魚苗:"不利",月令:"不順",尋人:"難遇",遠信:"遲"},
29:{凡事:"守待",作事:"暗中藏",家事:"待風霜退",家運:"待風霜退",婚姻:"待時",求兒:"待時",六甲:"生女",求財:"待時",功名:"待時",歲君:"中平",治病:"緩癒",出外:"宜守",經商:"待時",來人:"遲到",行舟:"宜守",移居:"不宜",失物:"難尋",求雨:"遲",官事:"宜守",六畜:"中平",耕作:"半收",築室:"緩議",墳墓:"中平",討海:"宜守",作塭:"待時",魚苗:"中平",月令:"中平",尋人:"遲遇",遠信:"遲"},
30:{凡事:"重勞",作事:"須防",家事:"中下",家運:"中下",婚姻:"待時",求兒:"難",六甲:"生女",求財:"防不得高",功名:"中平",歲君:"中下",治病:"反覆",出外:"有勞",經商:"防虧",來人:"遲到",行舟:"須防",移居:"不宜",失物:"難還",求雨:"遲",官事:"拖延",六畜:"中平",耕作:"半收",築室:"不宜",墳墓:"中平",討海:"不利",作塭:"防虧",魚苗:"中平",月令:"重勞",尋人:"遲遇",遠信:"遲"},
31:{凡事:"吉",作事:"正當時",家事:"慶家門",家運:"慶家門",婚姻:"吉",求兒:"吉",六甲:"先男",求財:"有",功名:"可成",歲君:"吉",治病:"可癒",出外:"吉",經商:"有利",來人:"即到",行舟:"平安",移居:"吉",失物:"可還",求雨:"有",官事:"吉",六畜:"可納",耕作:"有收",築室:"吉",墳墓:"吉",討海:"有利",作塭:"有利",魚苗:"有利",月令:"吉",尋人:"得遇",遠信:"即至"},
32:{凡事:"變卦",作事:"金變鐵",家事:"兩相連後凶",家運:"兩相連後凶",婚姻:"不吉",求兒:"難",六甲:"生女",求財:"先有後無",功名:"難",歲君:"不順",治病:"難癒",出外:"不利",經商:"先利後虧",來人:"遲到",行舟:"不利",移居:"不宜",失物:"難還",求雨:"遲",官事:"不利",六畜:"不利",耕作:"半收",築室:"不宜",墳墓:"不利",討海:"不利",作塭:"先利後虧",魚苗:"不利",月令:"不順",尋人:"難遇",遠信:"遲"},
33:{凡事:"中平",作事:"用心作福",家事:"中平",家運:"中平",婚姻:"可成",求兒:"可",六甲:"先男",求財:"漸有",功名:"中平",歲君:"中平",治病:"作福可癒",出外:"中平",經商:"穩中求利",來人:"月中到",行舟:"中平",移居:"中平",失物:"難尋",求雨:"遲",官事:"和",六畜:"中平",耕作:"半收",築室:"中平",墳墓:"中平",討海:"中平",作塭:"穩中求利",魚苗:"中平",月令:"中平",尋人:"月中遇",遠信:"月中至"},
34:{凡事:"先難後吉",作事:"由難轉好",家事:"漸發",家運:"漸發",婚姻:"可成",求兒:"吉",六甲:"先男",求財:"由難轉好",功名:"漸發",歲君:"漸佳",治病:"漸癒",出外:"先難後順",經商:"漸利",來人:"遲後到",行舟:"先難後順",移居:"可",失物:"可尋",求雨:"遲後有",官事:"先難後吉",六畜:"漸佳",耕作:"漸有收",築室:"漸佳",墳墓:"漸佳",討海:"先難後有",作塭:"漸利",魚苗:"漸利",月令:"先難後吉",尋人:"遲後遇",遠信:"遲後至"},
35:{凡事:"不須心機",作事:"自然知",家事:"漸太平",家運:"漸太平",婚姻:"和合",求兒:"可",六甲:"先男",求財:"漸有",功名:"可期",歲君:"中平",治病:"漸癒",出外:"漸順",經商:"漸利",來人:"近日到",行舟:"漸順",移居:"可",失物:"可尋",求雨:"有",官事:"脫出太平",六畜:"可納",耕作:"有收",築室:"漸佳",墳墓:"漸佳",討海:"漸利",作塭:"漸利",魚苗:"漸利",月令:"漸佳",尋人:"近日遇",遠信:"近日至"},
36:{凡事:"大吉",作事:"逢大吉",家事:"福壽",家運:"福壽",婚姻:"大吉",求兒:"大吉",六甲:"先男，貴",求財:"大吉",功名:"大成",歲君:"大吉",治病:"可癒",出外:"大吉",經商:"大利",來人:"即到",行舟:"大吉",移居:"大吉",失物:"可還",求雨:"即有",官事:"平安",六畜:"大利",耕作:"大收",築室:"大吉",墳墓:"大吉",討海:"大利",作塭:"大利",魚苗:"大利",月令:"大吉",尋人:"即遇",遠信:"即至"},
37:{凡事:"吉",作事:"得意",家事:"有益",家運:"有益",婚姻:"吉",求兒:"吉",六甲:"先男",求財:"吉",功名:"可成",歲君:"吉",治病:"可癒",出外:"吉",經商:"得意",來人:"即到",行舟:"平安",移居:"吉",失物:"可還",求雨:"有",官事:"清吉",六畜:"可納",耕作:"有收",築室:"吉",墳墓:"吉",討海:"有利",作塭:"有利",魚苗:"有利",月令:"吉",尋人:"得遇",遠信:"即至"},
38:{凡事:"吉",作事:"得意",家事:"心安",家運:"心安",婚姻:"吉",求兒:"吉",六甲:"先男",求財:"有",功名:"有成",歲君:"吉",治病:"可癒",出外:"吉",經商:"得意",來人:"即到",行舟:"平安",移居:"吉",失物:"可還",求雨:"有",官事:"吉",六畜:"可納",耕作:"有收",築室:"吉",墳墓:"吉",討海:"有利",作塭:"有利",魚苗:"有利",月令:"吉",尋人:"得遇",遠信:"即至"},
39:{凡事:"守待",作事:"退守",家事:"中平",家運:"中平",婚姻:"待時",求兒:"待時",六甲:"生女",求財:"宜守",功名:"待時",歲君:"中平",治病:"緩癒",出外:"宜守",經商:"宜守",來人:"遲到",行舟:"宜守",移居:"不宜",失物:"難尋",求雨:"遲",官事:"宜和",六畜:"中平",耕作:"半收",築室:"緩議",墳墓:"中平",討海:"宜守",作塭:"宜守",魚苗:"中平",月令:"中平",尋人:"遲遇",遠信:"遲"},
40:{凡事:"大吉",作事:"富貴",家事:"光輝",家運:"光輝",婚姻:"百歲相隨",求兒:"大吉",六甲:"先男，貴",求財:"大吉",功名:"大成",歲君:"大吉",治病:"可癒",出外:"大吉",經商:"大利",來人:"即到",行舟:"大吉",移居:"大吉",失物:"可還",求雨:"即有",官事:"吉",六畜:"大利",耕作:"大收",築室:"大吉",墳墓:"大吉",討海:"大利",作塭:"大利",魚苗:"大利",月令:"大吉",尋人:"即遇",遠信:"即至"},
41:{凡事:"中平",作事:"難推",家事:"中平",家運:"中平",婚姻:"夙世結成",求兒:"可",六甲:"先男",求財:"漸有",功名:"中平",歲君:"中平",治病:"緩癒",出外:"中平",經商:"小利",來人:"近日到",行舟:"中平",移居:"中平",失物:"可尋",求雨:"遲",官事:"和",六畜:"中平",耕作:"半收",築室:"中平",墳墓:"中平",討海:"小利",作塭:"小利",魚苗:"小利",月令:"中平",尋人:"近日遇",遠信:"近日至"},
42:{凡事:"不吉",作事:"路難",家事:"不安",家運:"不安",婚姻:"不利",求兒:"難",六甲:"難",求財:"難",功名:"難",歲君:"不順",治病:"難癒",出外:"不利",經商:"不利",來人:"遲到",行舟:"不利",移居:"不宜",失物:"難還",求雨:"遲",官事:"不利",六畜:"不利",耕作:"半收",築室:"不宜",墳墓:"不利",討海:"不利",作塭:"不利",魚苗:"不利",月令:"不順",尋人:"難遇",遠信:"遲"},
43:{凡事:"中平",作事:"急如飛",家事:"中平",家運:"中平",婚姻:"待時",求兒:"可",六甲:"先男",求財:"待月中",功名:"千里外",歲君:"中平",治病:"漸癒",出外:"有信",經商:"中平",來人:"月中到",行舟:"中平",移居:"中平",失物:"難尋",求雨:"遲",官事:"和",六畜:"中平",耕作:"半收",築室:"中平",墳墓:"中平",討海:"中平",作塭:"中平",魚苗:"中平",月令:"中平",尋人:"月中遇",遠信:"月中至"},
44:{凡事:"吉",作事:"多得利",家事:"漸好",家運:"漸好",婚姻:"可成",求兒:"吉",六甲:"先男",求財:"多得利",功名:"可期",歲君:"吉",治病:"可癒",出外:"吉",經商:"得利",來人:"即到",行舟:"平安",移居:"吉",失物:"可還",求雨:"有",官事:"得運",六畜:"可納",耕作:"有收",築室:"吉",墳墓:"吉",討海:"有利",作塭:"有利",魚苗:"有利",月令:"吉",尋人:"得遇",遠信:"即至"},
45:{凡事:"大吉",作事:"結成果",家事:"清吉",家運:"清吉",婚姻:"大吉",求兒:"大吉",六甲:"先男，貴",求財:"大吉",功名:"大成",歲君:"大吉",治病:"可癒",出外:"大吉",經商:"大利",來人:"即到",行舟:"大吉",移居:"大吉",失物:"可還",求雨:"即有",官事:"清吉",六畜:"大利",耕作:"大收",築室:"大吉",墳墓:"大吉",討海:"大利",作塭:"大利",魚苗:"大利",月令:"大吉",尋人:"即遇",遠信:"即至"},
46:{凡事:"大吉",作事:"功名得意",家事:"富貴安然",家運:"富貴安然",婚姻:"大吉團圓",求兒:"大吉",六甲:"先男，貴",求財:"大吉",功名:"大成",歲君:"大吉",治病:"可癒",出外:"大吉",經商:"大利",來人:"即到",行舟:"大吉",移居:"大吉",失物:"可還",求雨:"即有",官事:"吉",六畜:"大利",耕作:"大收",築室:"大吉",墳墓:"大吉",討海:"大利",作塭:"大利",魚苗:"大利",月令:"大吉",尋人:"即遇",遠信:"即至"},
47:{凡事:"中上",作事:"心中有益",家事:"漸吉",家運:"漸吉",婚姻:"可成",求兒:"可",六甲:"先男",求財:"有",功名:"可期",歲君:"中上",治病:"化吉",出外:"吉",經商:"有利",來人:"近日到",行舟:"平安",移居:"可",失物:"可尋",求雨:"有",官事:"化吉",六畜:"可納",耕作:"有收",築室:"漸佳",墳墓:"漸佳",討海:"有利",作塭:"有利",魚苗:"有利",月令:"中上",尋人:"近日遇",遠信:"近日至"},
48:{凡事:"不吉",作事:"運未通",家事:"朦朧",家運:"朦朧",婚姻:"不利",求兒:"難",六甲:"生女",求財:"難",功名:"運未通",歲君:"不順",治病:"難癒",出外:"不利",經商:"不利",來人:"遲到",行舟:"不利",移居:"不宜",失物:"難還",求雨:"遲",官事:"不利",六畜:"不利",耕作:"半收",築室:"不宜",墳墓:"不利",討海:"不利",作塭:"不利",魚苗:"不利",月令:"不順",尋人:"難遇",遠信:"遲"},
49:{凡事:"中平",作事:"暗中得明",家事:"中平",家運:"中平",婚姻:"待時",求兒:"可",六甲:"先男",求財:"暗中有",功名:"待時",歲君:"中平",治病:"緩癒",出外:"中平",經商:"小利",來人:"遲到",行舟:"中平",移居:"中平",失物:"可尋",求雨:"遲",官事:"和",六畜:"中平",耕作:"半收",築室:"中平",墳墓:"中平",討海:"小利",作塭:"小利",魚苗:"小利",月令:"中平",尋人:"遲遇",遠信:"遲"},
50:{凡事:"吉",作事:"鐵變成金",家事:"漸好",家運:"漸好",婚姻:"可成",求兒:"吉",六甲:"先男",求財:"漸有",功名:"可期",歲君:"吉",治病:"漸癒",出外:"有好音",經商:"漸利",來人:"近日到",行舟:"平安",移居:"可",失物:"可尋",求雨:"有",官事:"吉",六畜:"可納",耕作:"有收",築室:"漸佳",墳墓:"漸佳",討海:"漸利",作塭:"漸利",魚苗:"漸利",月令:"吉",尋人:"近日遇",遠信:"近日至"},
51:{凡事:"中平",作事:"可當",家事:"安康",家運:"安康",婚姻:"中平",求兒:"可",六甲:"先男",求財:"守本",功名:"中平",歲君:"中平",治病:"可癒",出外:"不堪行",經商:"守本",來人:"遲到",行舟:"中平",移居:"不宜",失物:"難尋",求雨:"遲",官事:"和",六畜:"中平",耕作:"半收",築室:"中平",墳墓:"中平",討海:"中平",作塭:"守本",魚苗:"中平",月令:"中平",尋人:"遲遇",遠信:"遲"},
52:{凡事:"吉",作事:"由天",家事:"吉",家運:"吉",婚姻:"可成",求兒:"吉",六甲:"先男",求財:"風雲際會",功名:"由天",歲君:"吉",治病:"可癒",出外:"吉",經商:"際會有利",來人:"即到",行舟:"平安",移居:"吉",失物:"可還",求雨:"有",官事:"吉",六畜:"可納",耕作:"有收",築室:"吉",墳墓:"吉",討海:"有利",作塭:"有利",魚苗:"有利",月令:"吉",尋人:"得遇",遠信:"即至"},
53:{凡事:"大吉",作事:"慶有餘",家事:"喜氣溢門",家運:"喜氣溢門",婚姻:"大吉",求兒:"大吉",六甲:"先男，貴",求財:"雙雙至",功名:"大成",歲君:"大吉",治病:"可癒",出外:"大吉",經商:"大利",來人:"即到",行舟:"大吉",移居:"大吉",失物:"可還",求雨:"即有",官事:"吉",六畜:"大利",耕作:"大收",築室:"大吉",墳墓:"大吉",討海:"大利",作塭:"大利",魚苗:"大利",月令:"大吉",尋人:"即遇",遠信:"即至"},
54:{凡事:"中平",作事:"清吉",家事:"中平",家運:"中平",婚姻:"中平",求兒:"可",六甲:"先男",求財:"作福可得",功名:"中平",歲君:"中平",治病:"作福可癒",出外:"平安",經商:"中平",來人:"遲到",行舟:"中平",移居:"中平",失物:"難尋",求雨:"遲",官事:"和",六畜:"中平",耕作:"半收",築室:"中平",墳墓:"中平",討海:"中平",作塭:"中平",魚苗:"中平",月令:"中平",尋人:"遲遇",遠信:"遲"},
55:{凡事:"不吉",作事:"虛言",家事:"暗未全",家運:"暗未全",婚姻:"難成",求兒:"難",六甲:"難",求財:"難",功名:"枉然",歲君:"不順",治病:"難癒",出外:"不利",經商:"不利",來人:"遲到",行舟:"不利",移居:"不宜",失物:"難還",求雨:"遲",官事:"不利",六畜:"不利",耕作:"半收",築室:"不宜",墳墓:"不利",討海:"不利",作塭:"不利",魚苗:"不利",月令:"不順",尋人:"難遇",遠信:"遲"},
56:{凡事:"中平",作事:"苦後消",家事:"中平",家運:"中平",婚姻:"中平",求兒:"可",六甲:"先男",求財:"苦中有",功名:"苦後成",歲君:"中平",治病:"緩癒",出外:"去後勿回頭",經商:"苦中求利",來人:"遲到",行舟:"中平",移居:"中平",失物:"難還",求雨:"遲",官事:"消磨",六畜:"中平",耕作:"半收",築室:"中平",墳墓:"中平",討海:"苦中求利",作塭:"苦中求利",魚苗:"中平",月令:"中平",尋人:"遲遇",遠信:"遲"},
57:{凡事:"吉",作事:"清吉",家事:"安居",家運:"安居",婚姻:"可成",求兒:"吉",六甲:"先男",求財:"有",功名:"得運",歲君:"吉",治病:"可癒",出外:"吉",經商:"清吉",來人:"即到",行舟:"平安",移居:"吉",失物:"可尋",求雨:"有",官事:"吉",六畜:"可納",耕作:"有收",築室:"吉",墳墓:"吉",討海:"有利",作塭:"有利",魚苗:"有利",月令:"吉",尋人:"得遇",遠信:"即至"},
58:{凡事:"中下",作事:"運未通",家事:"中下",家運:"中下",婚姻:"難成",求兒:"難",六甲:"生女",求財:"難",功名:"未通",歲君:"中下",治病:"久病宜寬心",出外:"不利",經商:"不利",來人:"遲到",行舟:"不利",移居:"不宜",失物:"難還",求雨:"遲",官事:"不利",六畜:"不利",耕作:"半收",築室:"不宜",墳墓:"不利",討海:"不利",作塭:"不利",魚苗:"不利",月令:"中下",尋人:"難遇",遠信:"遲"},
59:{凡事:"吉",作事:"莫遲疑",家事:"吉",家運:"吉",婚姻:"成會合",求兒:"吉",六甲:"先男",求財:"喜相隨",功名:"清吉",歲君:"吉",治病:"可癒",出外:"吉",經商:"有利",來人:"即到",行舟:"平安",移居:"吉",失物:"可還",求雨:"有",官事:"吉",六畜:"可納",耕作:"有收",築室:"吉",墳墓:"吉",討海:"有利",作塭:"有利",魚苗:"有利",月令:"吉",尋人:"得遇",遠信:"即至"},
60:{凡事:"中平",作事:"用心作福",家事:"中平",家運:"中平",婚姻:"中平",求兒:"可",六甲:"先男",求財:"作福有",功名:"分理有益",歲君:"中平",治病:"作福可癒",出外:"中平",經商:"中平",來人:"遲到",行舟:"中平",移居:"中平",失物:"難尋",求雨:"遲",官事:"分理有益",六畜:"中平",耕作:"半收",築室:"中平",墳墓:"中平",討海:"中平",作塭:"中平",魚苗:"中平",月令:"中平",尋人:"遲遇",遠信:"遲"}
};

/* ── 狀態 ── */
var _poem=null,_holy=0,_phase='intro',_throwResult=null,_prayTimer=null;
var _allowThrowResult=null; // 允筊結果

/* ── 音效 ── */
function _playThrow(){try{var c=new(window.AudioContext||window.webkitAudioContext)(),o=c.createOscillator(),g=c.createGain();o.connect(g);g.connect(c.destination);o.type='sine';o.frequency.value=800;g.gain.setValueAtTime(0.25,c.currentTime);g.gain.exponentialRampToValueAtTime(0.01,c.currentTime+0.25);o.start();o.stop(c.currentTime+0.25)}catch(e){}}
function _playHoly(){try{var c=new(window.AudioContext||window.webkitAudioContext)();[523,659,784].forEach(function(f,i){var o=c.createOscillator(),g=c.createGain();o.connect(g);g.connect(c.destination);o.type='sine';o.frequency.value=f;g.gain.setValueAtTime(0.15,c.currentTime+i*0.12);g.gain.exponentialRampToValueAtTime(0.01,c.currentTime+i*0.12+0.35);o.start(c.currentTime+i*0.12);o.stop(c.currentTime+i*0.12+0.35)})}catch(e){}}
function _playBell(){try{var c=new(window.AudioContext||window.webkitAudioContext)(),o=c.createOscillator(),g=c.createGain();o.connect(g);g.connect(c.destination);o.type='sine';o.frequency.value=440;g.gain.setValueAtTime(0.2,c.currentTime);g.gain.exponentialRampToValueAtTime(0.01,c.currentTime+0.8);o.start();o.stop(c.currentTime+0.8)}catch(e){}}

/* ── DOM helpers ── */
function $(id){return document.getElementById(id)}
function _rc(r){if(r.indexOf('上上')>=0)return{c:'#2ecc71',bg:'rgba(46,204,113,0.12)',bd:'rgba(46,204,113,0.35)'};if(r.indexOf('下下')>=0)return{c:'#e74c3c',bg:'rgba(231,76,60,0.12)',bd:'rgba(231,76,60,0.35)'};if(r.indexOf('上')>=0)return{c:'var(--c-gold,#c9a84c)',bg:'rgba(201,168,76,0.12)',bd:'rgba(201,168,76,0.35)'};if(r.indexOf('下')>=0)return{c:'#e74c3c',bg:'rgba(231,76,60,0.12)',bd:'rgba(231,76,60,0.35)'};return{c:'#95a5a6',bg:'rgba(149,165,166,0.12)',bd:'rgba(149,165,166,0.35)'}}
function _ji(type,cls){return'<img src="'+(type==='flat'?IMG.jiaoFlat:IMG.jiaoRound)+'" alt="" class="orc-jiao-img '+(cls||'')+'">';}

/* ── 粒子系統（煙霧飄動） ── */
function _spawnParticles(container){
  if(!container)return;
  var canvas=document.createElement('canvas');
  canvas.className='orc-particle-canvas';
  canvas.width=420;canvas.height=700;
  container.appendChild(canvas);
  var ctx=canvas.getContext('2d');
  var particles=[];
  for(var i=0;i<30;i++){
    particles.push({x:Math.random()*420,y:600+Math.random()*100,r:Math.random()*3+1,vy:-(Math.random()*0.5+0.2),vx:Math.sin(Math.random()*6.28)*0.3,a:Math.random()*0.3+0.05});
  }
  var _raf;
  function draw(){
    ctx.clearRect(0,0,420,700);
    for(var i=0;i<particles.length;i++){
      var p=particles[i];
      p.x+=p.vx+Math.sin(Date.now()*0.001+i)*0.15;
      p.y+=p.vy;
      if(p.y<-10){p.y=700;p.x=Math.random()*420;}
      ctx.beginPath();
      ctx.arc(p.x,p.y,p.r,0,6.28);
      ctx.fillStyle='rgba(201,168,76,'+p.a+')';
      ctx.fill();
    }
    _raf=requestAnimationFrame(draw);
  }
  draw();
  return function(){if(_raf)cancelAnimationFrame(_raf);if(canvas.parentNode)canvas.parentNode.removeChild(canvas);};
}
var _killParticles=null;

/* ── 主容器 ── */
var _wrap=null;
function _getWrap(){
  if(!_wrap){
    _wrap=document.createElement('div');
    _wrap.id='oracle-screen';
    _wrap.style.cssText='display:none;position:fixed;inset:0;z-index:9000;overflow-y:auto;background:#09090b;';
    document.body.appendChild(_wrap);
  }
  return _wrap;
}

/* ── 渲染 ── */
function _render(){
var w=_getWrap(),h='';
// 廟宇背景
h+='<div class="orc-temple-bg" style="background-image:url('+IMG.templeBg+')"></div>';
h+='<div class="orc-topbar"><button class="orc-back" onclick="_oracleClose()"><i class="fas fa-arrow-left"></i></button><span class="orc-topbar-title">靜月靈籤</span><span style="width:40px"></span></div>';
h+='<div class="orc-body">';

if(_phase==='intro'){
h+='<div class="orc-fade"><div class="orc-deity-wrap"><img src="'+IMG.deity+'" alt="靜月之神" class="orc-deity-img"></div><h2 class="orc-title">靜月靈籤</h2><p class="orc-subtitle">六十甲子靈籤 ・ 神明指引</p><div class="orc-divider"><span>✦</span></div><p class="orc-desc">心中默念所求之事<br>虔心稟告，靜候神明指引</p><p class="orc-note">先擲允筊確認神明在位<br>再求籤、連擲三聖筊方為確認</p><button class="orc-btn-primary" onclick="_oracleStartAllow()">虔心參拜</button><p class="orc-free-tag">✦ 免費使用 ・ 不限次數 ✦</p></div>';
}
else if(_phase==='allow_pray'){
// 允筊前的祈禱（含香爐）
h+='<div class="orc-fade orc-pray-phase"><img src="'+IMG.smoke+'" alt="" class="orc-smoke-bg orc-smoke-drift"><div class="orc-pray-content"><div class="orc-incense-wrap"><img src="'+IMG.incense+'" alt="香爐" class="orc-incense-img"></div><div class="orc-pray-icon"><img src="'+IMG.pray+'" alt="" class="orc-pray-img"></div><p class="orc-pray-text">虔心參拜中<span class="orc-dots"></span></p><p class="orc-note">請靜月之神降臨指引</p></div></div>';
}
else if(_phase==='allow_throw'){
h+='<div class="orc-fade"><div class="orc-card-info"><div class="orc-card-label">允筊確認</div><div class="orc-card-num" style="font-size:1.1rem">請問靜月之神是否在位？</div></div><div class="orc-throw-stage"><div class="orc-throw-jiao orc-throw-L"><img src="'+IMG.jiaoFlat+'" alt="" class="orc-jiao-img"></div><div class="orc-throw-jiao orc-throw-R"><img src="'+IMG.jiaoRound+'" alt="" class="orc-jiao-img"></div></div><p class="orc-pray-text">擲筊中...</p></div>';
}
else if(_phase==='allow_result'){
var alb=_allowThrowResult==='holy'?'聖筊':_allowThrowResult==='laugh'?'笑筊':'陰筊';
var aco=_allowThrowResult==='holy'?'var(--c-gold,#c9a84c)':_allowThrowResult==='laugh'?'#e67e22':'#7f8c8d';
var aj1=_allowThrowResult==='dark'?'round':'flat';
var aj2=_allowThrowResult==='holy'?'round':_allowThrowResult==='laugh'?'flat':'round';
h+='<div class="orc-fade"><div class="orc-card-info"><div class="orc-card-label">允筊確認</div><div class="orc-card-num" style="font-size:1.1rem">請問靜月之神是否在位？</div></div><div class="orc-result-badge" style="border-color:'+aco+'"><span style="color:'+aco+';font-size:1.6rem;font-weight:900;letter-spacing:4px">'+alb+'</span></div><div class="orc-jiao-wrap">'+_ji(aj1)+_ji(aj2)+'</div>';
if(_allowThrowResult==='holy'){
h+='<p style="font-size:.85rem;color:#2ecc71;margin:1rem 0;letter-spacing:2px">✦ 靜月之神已在位 ✦</p><button class="orc-btn-primary" onclick="_oracleStartPray()">開始求籤</button>';
}else{
var amsg=_allowThrowResult==='laugh'?'笑筊 — 神明尚未準備好，請再試一次':'陰筊 — 請靜心後再次參拜';
h+='<p style="font-size:.8rem;color:#e74c3c;margin-bottom:1rem">'+amsg+'</p><button class="orc-btn-outline" onclick="_oracleStartAllow()">重新參拜</button>';
}
h+='</div>';
}
else if(_phase==='praying'){
h+='<div class="orc-fade orc-pray-phase"><img src="'+IMG.smoke+'" alt="" class="orc-smoke-bg orc-smoke-drift"><div class="orc-pray-content"><div class="orc-pray-icon"><img src="'+IMG.pray+'" alt="" class="orc-pray-img"></div><p class="orc-pray-text">虔心求籤中<span class="orc-dots"></span></p><p class="orc-note">靜月之神正在為您挑選籤詩</p></div></div>';
}
else if(_phase==='drawn'){
h+='<div class="orc-fade"><div class="orc-qiantong-wrap"><img src="'+IMG.qiantong+'" alt="" class="orc-qiantong-img orc-qiantong-shake"></div><div class="orc-card-info"><div class="orc-card-label">求得籤詩</div><div class="orc-card-num">第'+CN[_poem.n]+'籤 '+_poem.g+'</div><div class="orc-card-need">您必須擲出 3 次聖筊，方能解籤</div></div><div class="orc-holy-count">'+_holy+' / 3 聖杯</div><button class="orc-btn-primary" onclick="_oracleThrow()">擲 筊</button></div>';
}
else if(_phase==='throwing'){
h+='<div class="orc-fade"><div class="orc-card-info"><div class="orc-card-num" style="font-size:1.1rem">第'+CN[_poem.n]+'籤 '+_poem.g+'</div></div><div class="orc-throw-stage"><div class="orc-throw-jiao orc-throw-L"><img src="'+IMG.jiaoFlat+'" alt="" class="orc-jiao-img"></div><div class="orc-throw-jiao orc-throw-R"><img src="'+IMG.jiaoRound+'" alt="" class="orc-jiao-img"></div></div><p class="orc-pray-text">擲筊中...</p></div>';
}
else if(_phase==='result'){
var lb=_throwResult==='holy'?'聖筊':_throwResult==='laugh'?'笑筊':'陰筊';
var co=_throwResult==='holy'?'var(--c-gold,#c9a84c)':_throwResult==='laugh'?'#e67e22':'#7f8c8d';
var j1=_throwResult==='dark'?'round':'flat';
var j2=_throwResult==='holy'?'round':_throwResult==='laugh'?'flat':'round';
h+='<div class="orc-fade"><div class="orc-card-info"><div class="orc-card-num" style="font-size:1.1rem">第'+CN[_poem.n]+'籤 '+_poem.g+'</div></div><div class="orc-result-badge" style="border-color:'+co+'"><span style="color:'+co+';font-size:1.6rem;font-weight:900;letter-spacing:4px">'+lb+'</span></div><div class="orc-jiao-wrap">'+_ji(j1)+_ji(j2)+'</div><div class="orc-holy-count">'+_holy+' / 3 聖杯</div>';
if(_throwResult==='holy'){h+='<button class="orc-btn-primary" onclick="_oracleContinue()">繼續擲筊</button>';}
else{var msg=_throwResult==='laugh'?'笑筊 — 神明笑而不答，請重新再問':'陰筊 — 神明未允，請重新求籤';h+='<p style="font-size:.8rem;color:#e74c3c;margin-bottom:1rem">'+msg+'</p><button class="orc-btn-outline" onclick="_oracleRedraw()">重新求籤</button>';}
h+='</div>';
}
else if(_phase==='poem'){
var rc=_rc(_poem.r),lines=_poem.p.split('\n'),ph='';
for(var i=0;i<lines.length;i++){ph+='<div class="orc-poem-line" style="animation-delay:'+(0.3+i*0.18)+'s">'+lines[i]+'</div>';}
h+='<div class="orc-fade"><div class="orc-confirm-badge">✦ 三聖杯確認 ✦</div><div class="orc-poem-card" style="background-image:url('+IMG.cardBg+')"><div class="orc-poem-card-inner"><div class="orc-poem-header">靜月之光 所賜靈籤</div><div class="orc-poem-num">第'+CN[_poem.n]+'籤</div><div class="orc-poem-gz">'+_poem.g+'</div><div class="orc-rank-badge" style="color:'+rc.c+';background:'+rc.bg+';border-color:'+rc.bd+'">'+_poem.r+'籤</div><div class="orc-poem-divider"></div><div class="orc-poem-text">'+ph+'</div><div class="orc-poem-divider"></div><div class="orc-poem-meta">典故：'+_poem.s+'</div><div class="orc-poem-meta">'+_poem.t+'</div>';
// 29項完整解說
var dd=D[_poem.n];
if(dd){
h+='<div class="orc-details-toggle" onclick="var g=this.nextElementSibling;g.style.display=g.style.display===\'none\'?\'grid\':\'none\';this.textContent=g.style.display===\'none\'?\'▼ 完整解籤（29項）\':\'▲ 收起解籤\'">▼ 完整解籤（29項）</div><div class="orc-details-grid" style="display:none">';
for(var k=0;k<KEYS.length;k++){
  if(dd[KEYS[k]]){
    h+='<div class="orc-detail-item"><span class="orc-detail-key">'+KEYS[k]+'</span><span class="orc-detail-val">'+dd[KEYS[k]]+'</span></div>';
  }
}
h+='</div>';
}
h+='</div></div><div style="display:flex;gap:.6rem;justify-content:center;flex-wrap:wrap;margin-top:1.2rem"><button class="orc-btn-outline" onclick="_oracleReset()">重新求籤</button><button class="orc-btn-outline" onclick="_oracleClose()">返回首頁</button></div><div class="orc-footer">靜月之光 ・ jingyue.uk<br>六十甲子靈籤</div></div>';
}
h+='</div>';w.innerHTML=h;

// 啟動粒子
if(_killParticles){_killParticles();_killParticles=null;}
var body=w.querySelector('.orc-body');
if(body && _phase!=='intro'){_killParticles=_spawnParticles(body);}
}

/* ── 允筊流程 ── */
window._oracleStartAllow=function(){
  _phase='allow_pray';_allowThrowResult=null;_render();
  var c=0;_prayTimer=setInterval(function(){
    c++;var d=_getWrap().querySelector('.orc-dots');
    if(d){var s='';for(var i=0;i<(c%4);i++)s+='．';d.textContent=s;}
    if(c>=8){clearInterval(_prayTimer);_prayTimer=null;_phase='allow_throw';_render();_playThrow();
      // 擲筊動畫
      setTimeout(function(){
        var r=Math.random();
        if(r<0.5)_allowThrowResult='holy';else if(r<0.75)_allowThrowResult='laugh';else _allowThrowResult='dark';
        // 落地
        var stage=_getWrap().querySelector('.orc-throw-stage');
        if(stage){
          var j1t=_allowThrowResult==='dark'?'round':'flat';
          var j2t=_allowThrowResult==='holy'?'round':_allowThrowResult==='laugh'?'flat':'round';
          var imgs=stage.querySelectorAll('.orc-jiao-img');
          if(imgs[0])imgs[0].src=(j1t==='flat'?IMG.jiaoFlat:IMG.jiaoRound);
          if(imgs[1])imgs[1].src=(j2t==='flat'?IMG.jiaoFlat:IMG.jiaoRound);
          var divs=stage.querySelectorAll('.orc-throw-jiao');
          if(divs[0]){divs[0].className='orc-throw-jiao orc-land-L';}
          if(divs[1]){divs[1].className='orc-throw-jiao orc-land-R';}
        }
        if(_allowThrowResult==='holy'){_playHoly();}
        setTimeout(function(){_phase='allow_result';_render();},1000);
      },1200);
    }
  },450);
};

/* ── 求籤流程 ── */
window._oracleStartPray=function(){_phase='praying';_holy=0;_throwResult=null;_render();_playBell();var c=0;_prayTimer=setInterval(function(){c++;var d=_getWrap().querySelector('.orc-dots');if(d){var s='';for(var i=0;i<(c%4);i++)s+='．';d.textContent=s;}if(c>=10){clearInterval(_prayTimer);_prayTimer=null;_poem=P[Math.floor(Math.random()*60)];_phase='drawn';_render();}},450);};

/* ── 擲筊（三聖杯確認） ── */
window._oracleThrow=function(){_phase='throwing';_render();_playThrow();
setTimeout(function(){
var r=Math.random();
if(r<0.5)_throwResult='holy';else if(r<0.75)_throwResult='laugh';else _throwResult='dark';
var stage=_getWrap().querySelector('.orc-throw-stage');
if(stage){
var j1=_throwResult==='dark'?'round':'flat';
var j2=_throwResult==='holy'?'round':_throwResult==='laugh'?'flat':'round';
var imgs=stage.querySelectorAll('.orc-jiao-img');
if(imgs[0])imgs[0].src=(j1==='flat'?IMG.jiaoFlat:IMG.jiaoRound);
if(imgs[1])imgs[1].src=(j2==='flat'?IMG.jiaoFlat:IMG.jiaoRound);
var divs=stage.querySelectorAll('.orc-throw-jiao');
if(divs[0]){divs[0].className='orc-throw-jiao orc-land-L';}
if(divs[1]){divs[1].className='orc-throw-jiao orc-land-R';}
}
if(_throwResult==='holy'){_playHoly();}
setTimeout(function(){
if(_throwResult==='holy'){_holy++;if(_holy>=3){_phase='poem';}else{_phase='result';}}
else{_holy=0;_phase='result';}
_render();
},1000);
},1200);};

/* ── 公開API ── */
window._oracleOpen=function(){_phase='intro';_poem=null;_holy=0;_throwResult=null;_allowThrowResult=null;var w=_getWrap();w.style.display='block';_render();var hk=$('hook-screen');if(hk)hk.style.display='none';document.body.style.overflow='hidden';};
window._oracleClose=function(){var w=_getWrap();w.style.display='none';document.body.style.overflow='';var hk=$('hook-screen');if(hk)hk.style.display='';if(_prayTimer){clearInterval(_prayTimer);_prayTimer=null;}if(_killParticles){_killParticles();_killParticles=null;}};
window._oracleContinue=function(){_throwResult=null;_phase='drawn';_render();};
window._oracleRedraw=function(){_holy=0;_throwResult=null;_oracleStartPray();};
window._oracleReset=function(){_phase='intro';_poem=null;_holy=0;_throwResult=null;_allowThrowResult=null;_render();};

/* ── CSS ── */
var css=document.createElement('style');
css.textContent='\
#oracle-screen{font-family:var(--f-display,"Noto Serif TC",serif)}\
.orc-temple-bg{position:fixed;inset:0;z-index:0;background-size:cover;background-position:center;opacity:.18;pointer-events:none}\
.orc-particle-canvas{position:absolute;top:0;left:50%;transform:translateX(-50%);width:420px;height:700px;pointer-events:none;z-index:0;opacity:.6}\
.orc-topbar{position:sticky;top:0;z-index:10;display:flex;align-items:center;justify-content:space-between;padding:.7rem 1rem;background:rgba(9,9,11,0.95);backdrop-filter:blur(12px);border-bottom:1px solid rgba(201,168,76,0.1)}\
.orc-back{background:none;border:none;color:var(--c-gold,#c9a84c);font-size:1.1rem;cursor:pointer;padding:.4rem;min-width:40px;min-height:40px;display:flex;align-items:center;justify-content:center}\
.orc-topbar-title{font-size:.9rem;color:var(--c-gold,#c9a84c);letter-spacing:4px;font-weight:600}\
.orc-body{max-width:420px;margin:0 auto;padding:1.5rem 1rem 3rem;text-align:center;position:relative;z-index:1}\
.orc-deity-wrap{width:180px;height:240px;margin:0 auto 1rem;border-radius:16px;overflow:hidden;box-shadow:0 0 50px rgba(201,168,76,0.2)}\
.orc-deity-img{width:100%;height:100%;object-fit:cover}\
.orc-title{font-size:2rem;font-weight:900;letter-spacing:8px;margin:0 0 .3rem;background:linear-gradient(180deg,#f5e6c8 0%,#c9a84c 50%,#8b6914 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent}\
.orc-subtitle{font-size:.78rem;color:var(--c-text-muted,#6b6355);letter-spacing:3px;margin:0 0 .8rem}\
.orc-divider{text-align:center;color:var(--c-gold,#c9a84c);font-size:.6rem;margin:.8rem 0;opacity:.5}\
.orc-desc{font-size:.88rem;line-height:1.8;color:var(--c-text-dim,rgba(228,228,231,0.6));margin-bottom:.3rem}\
.orc-note{font-size:.72rem;color:var(--c-text-muted,#6b6355);margin-bottom:1.5rem;line-height:1.6}\
.orc-free-tag{font-size:.68rem;color:var(--c-text-muted,#6b6355);margin-top:1rem;letter-spacing:2px;opacity:.6}\
.orc-btn-primary{background:linear-gradient(135deg,var(--c-gold,#c9a84c),#8b6914);color:#1a1020;border:none;padding:.85rem 2.8rem;border-radius:999px;font-size:1.05rem;font-weight:700;letter-spacing:6px;cursor:pointer;box-shadow:0 4px 18px rgba(201,168,76,0.3);transition:all .25s;font-family:inherit;min-height:48px}\
.orc-btn-primary:hover{filter:brightness(1.1);transform:translateY(-1px)}\
.orc-btn-primary:active{transform:translateY(0)}\
.orc-btn-outline{background:transparent;color:var(--c-text-muted,#8b7355);border:1px solid rgba(201,168,76,0.3);padding:.6rem 1.5rem;border-radius:999px;font-size:.82rem;letter-spacing:3px;cursor:pointer;transition:all .25s;font-family:inherit;min-height:44px}\
.orc-btn-outline:hover{color:var(--c-gold,#c9a84c);border-color:var(--c-gold,#c9a84c);background:rgba(201,168,76,0.06)}\
.orc-pray-phase{position:relative;min-height:60vh}\
.orc-smoke-bg{position:absolute;top:0;left:50%;transform:translateX(-50%);width:250px;height:auto;opacity:.25;pointer-events:none;z-index:0;mix-blend-mode:screen}\
.orc-smoke-drift{animation:orc-smoke-float 6s ease-in-out infinite}\
@keyframes orc-smoke-float{0%,100%{transform:translateX(-50%) translateY(0) scale(1);opacity:.2}50%{transform:translateX(-50%) translateY(-20px) scale(1.05);opacity:.3}}\
.orc-pray-content{position:relative;z-index:1}\
.orc-incense-wrap{width:120px;margin:1rem auto .5rem;position:relative}\
.orc-incense-img{width:100%;height:auto;filter:drop-shadow(0 4px 12px rgba(201,168,76,0.3));mix-blend-mode:screen}\
.orc-incense-wrap::before{content:"";position:absolute;top:-30px;left:50%;transform:translateX(-50%);width:40px;height:60px;background:linear-gradient(to top,rgba(201,168,76,0.15),transparent);border-radius:50%;animation:orc-incense-smoke 3s ease-in-out infinite;pointer-events:none}\
.orc-incense-wrap::after{content:"";position:absolute;top:-20px;left:45%;width:30px;height:50px;background:linear-gradient(to top,rgba(201,168,76,0.1),transparent);border-radius:50%;animation:orc-incense-smoke 3.5s ease-in-out infinite 0.5s;pointer-events:none}\
@keyframes orc-incense-smoke{0%,100%{transform:translateX(-50%) translateY(0) scaleX(1);opacity:.3}50%{transform:translateX(-50%) translateY(-25px) scaleX(1.4);opacity:.05}}\
.orc-pray-icon{width:120px;height:120px;margin:1rem auto 1rem;border-radius:50%;overflow:hidden;border:2px solid rgba(201,168,76,0.3);animation:orc-pulse 1.5s ease-in-out infinite}\
.orc-pray-img{width:100%;height:100%;object-fit:cover;mix-blend-mode:screen}\
.orc-pray-text{font-size:1.05rem;color:var(--c-gold,#c9a84c);letter-spacing:4px}\
.orc-qiantong-wrap{width:140px;margin:0 auto 1rem}\
.orc-qiantong-img{width:100%;height:auto;border-radius:8px;box-shadow:0 4px 20px rgba(0,0,0,0.4)}\
.orc-qiantong-shake{animation:orc-qshake 0.8s ease-in-out 2}\
@keyframes orc-qshake{0%,100%{transform:rotate(0)}15%{transform:rotate(-5deg)}30%{transform:rotate(5deg)}45%{transform:rotate(-3deg)}60%{transform:rotate(3deg)}75%{transform:rotate(-1deg)}90%{transform:rotate(1deg)}}\
.orc-card-info{background:rgba(201,168,76,0.06);border:1px solid rgba(201,168,76,0.2);border-radius:14px;padding:1.3rem 1rem;margin-bottom:1rem}\
.orc-card-label{font-size:.78rem;color:var(--c-text-muted,#8b7355);letter-spacing:3px;margin-bottom:.3rem}\
.orc-card-num{font-size:1.5rem;font-weight:700;letter-spacing:4px;background:linear-gradient(180deg,#f5e6c8,#c9a84c);-webkit-background-clip:text;-webkit-text-fill-color:transparent}\
.orc-card-need{font-size:.75rem;color:#e67e22;margin-top:.7rem;padding:.3rem .8rem;background:rgba(230,126,34,0.08);border-radius:20px;display:inline-block}\
.orc-holy-count{font-size:.82rem;color:var(--c-text-muted,#8b7355);margin-bottom:1rem}\
.orc-jiao-wrap{display:flex;justify-content:center;gap:1.2rem;margin:1rem 0}\
.orc-jiao-img{width:80px;height:80px;object-fit:contain;filter:drop-shadow(0 4px 8px rgba(0,0,0,0.4));mix-blend-mode:screen}\
.orc-throw-stage{display:flex;justify-content:center;gap:2rem;margin:1.5rem 0;height:200px;align-items:flex-end;position:relative}\
.orc-throw-jiao{width:80px;height:80px}\
.orc-throw-jiao .orc-jiao-img{width:100%;height:100%;object-fit:contain;filter:drop-shadow(0 4px 12px rgba(0,0,0,0.5));mix-blend-mode:screen}\
.orc-throw-L{animation:orc-flyL 1.2s cubic-bezier(0.2,0.8,0.3,1) forwards}\
.orc-throw-R{animation:orc-flyR 1.2s cubic-bezier(0.2,0.8,0.3,1) forwards;animation-delay:0.08s}\
.orc-land-L{animation:orc-landL 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards}\
.orc-land-R{animation:orc-landR 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards;animation-delay:0.1s}\
@keyframes orc-flyL{0%{transform:translateY(0) rotate(0);opacity:1}20%{transform:translateY(-120px) rotate(-40deg);opacity:1}50%{transform:translateY(-160px) rotate(-180deg);opacity:1}80%{transform:translateY(-100px) rotate(-300deg);opacity:1}100%{transform:translateY(-60px) rotate(-360deg);opacity:0.6}}\
@keyframes orc-flyR{0%{transform:translateY(0) rotate(0);opacity:1}20%{transform:translateY(-130px) rotate(50deg);opacity:1}50%{transform:translateY(-170px) rotate(200deg);opacity:1}80%{transform:translateY(-90px) rotate(320deg);opacity:1}100%{transform:translateY(-50px) rotate(380deg);opacity:0.6}}\
@keyframes orc-landL{0%{transform:translateY(-60px) rotate(-20deg);opacity:0}30%{transform:translateY(8px) rotate(5deg);opacity:1}60%{transform:translateY(-4px) rotate(-2deg);opacity:1}100%{transform:translateY(0) rotate(-8deg);opacity:1}}\
@keyframes orc-landR{0%{transform:translateY(-50px) rotate(20deg);opacity:0}30%{transform:translateY(8px) rotate(-5deg);opacity:1}60%{transform:translateY(-4px) rotate(2deg);opacity:1}100%{transform:translateY(0) rotate(10deg);opacity:1}}\
.orc-details-toggle{margin-top:.8rem;cursor:pointer;font-size:.78rem;color:var(--c-gold,#c9a84c);letter-spacing:2px;padding:.4rem .8rem;border:1px solid rgba(201,168,76,0.25);border-radius:20px;background:rgba(201,168,76,0.06);display:inline-block;transition:all .25s}\
.orc-details-toggle:hover{background:rgba(201,168,76,0.12);border-color:rgba(201,168,76,0.4)}\
.orc-details-grid{display:grid;grid-template-columns:1fr 1fr;gap:.4rem .8rem;text-align:left;margin-top:.8rem;font-size:.72rem;line-height:1.6}\
.orc-detail-item{display:flex;gap:.3rem}\
.orc-detail-key{color:var(--c-gold,#c9a84c);white-space:nowrap;min-width:2.8em}\
.orc-detail-val{color:var(--c-text-dim,rgba(228,228,231,0.6))}\
.orc-result-badge{width:80px;height:80px;margin:0 auto 1rem;border-radius:50%;border:2px solid;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,0.02)}\
.orc-confirm-badge{display:inline-block;padding:.25rem 1rem;margin-bottom:1rem;background:rgba(201,168,76,0.1);border-radius:20px;font-size:.75rem;color:var(--c-gold,#c9a84c);letter-spacing:2px}\
.orc-poem-card{border-radius:18px;overflow:hidden;background-size:cover;background-position:center;box-shadow:0 8px 36px rgba(201,168,76,0.1)}\
.orc-poem-card-inner{padding:1.8rem 1.2rem;background:rgba(9,9,11,0.82);backdrop-filter:blur(2px)}\
.orc-poem-header{font-size:.7rem;color:rgba(201,168,76,0.6);letter-spacing:4px;margin-bottom:.3rem}\
.orc-poem-num{font-size:1.5rem;font-weight:700;letter-spacing:6px;background:linear-gradient(180deg,#f5e6c8,#c9a84c);-webkit-background-clip:text;-webkit-text-fill-color:transparent}\
.orc-poem-gz{font-size:1rem;color:var(--c-text-muted,#8b7355);letter-spacing:3px;margin-bottom:.8rem}\
.orc-rank-badge{display:inline-block;padding:.2rem .8rem;margin-bottom:1rem;border:1px solid;border-radius:20px;font-size:.78rem;letter-spacing:3px}\
.orc-poem-divider{width:50px;height:1px;margin:.8rem auto;background:linear-gradient(90deg,transparent,var(--c-gold,#c9a84c),transparent)}\
.orc-poem-text{font-size:1.2rem;line-height:2.2;letter-spacing:4px;color:var(--c-text,#e4e4e7);font-weight:500}\
.orc-poem-line{animation:orc-fadeUp .6s ease both}\
.orc-poem-meta{font-size:.75rem;color:var(--c-text-muted,#8b7355);line-height:1.8}\
.orc-footer{margin-top:1.8rem;font-size:.65rem;color:rgba(228,228,231,0.2);letter-spacing:2px;line-height:1.8}\
.orc-fade{animation:orc-fadeUp .6s ease}\
@keyframes orc-fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}\
@keyframes orc-pulse{0%,100%{transform:scale(1);opacity:.75}50%{transform:scale(1.06);opacity:1}}\
';
document.head.appendChild(css);
console.log('[Oracle] 靜月靈籤 v4 loaded — 允筊+29項+粒子+廟宇背景');
})();
