/*! golden-dawn-tarot.js — Golden Dawn Book T unified tarot core v1.4.0
 * Single source of truth for every tarot layout and Opening of the Key.
 * Interpretation source: Golden Dawn Book T / Liber T.
 * Physical orientation is not a fixed Waite-style reversed dictionary.
 */
(function(root){
  'use strict';
  if (!root || root.JYGoldenDawn) return;

  var VERSION = '1.4.0';
  var SOURCE_ID = 'gd_book_t';
  var SOURCE_LABEL = 'Golden Dawn《Book T／Liber T》';
  var ELEMENT = { wand:'火', cup:'水', sword:'風', pent:'土', major:'' };
  var EN_ELEMENT = { 火:'fire', 水:'water', 風:'air', 土:'earth' };
  var SUIT_ZH = { wand:'權杖', cup:'聖杯', sword:'寶劍', pent:'金幣' };

  var MAJOR = {
    '愚者':['靈性問題中表示觀念、思想、靈性與超越物質的衝動；物質問題中則可能表示愚行、怪異、失序或不切實際。','在靈性或創意題中，原初觀念能越過舊框架。','在物質與執行題中，缺乏現實承接，容易成為愚行或失序。'],
    '魔術師':['技藝、智慧、適應、手腕、機巧，以及被有意識運用的神秘智慧或力量。','技巧與資源能被準確調度，方法足以作用於現實。','技巧變成操弄、狡猾或只剩手段，目的與倫理失焦。'],
    '女祭司':['變化、交替、增減與波動；結果好壞高度依賴元素尊貴與相鄰牌。','能感知週期與隱藏變數，順應變化而調整。','反覆、忽增忽減或資訊未明，使事情難以穩定。'],
    '皇后':['美、幸福、愉悅與成功；失勢時可轉成奢華、放縱與耗散。','滋養、創造與關係資源能形成可享用的成果。','享樂、奢侈或過度舒適消耗原有成果。'],
    '皇帝':['戰爭、征服、勝利、爭鬥與野心。','有能力建立權威、突破阻力並取得主導。','野心演成衝突、壓制或代價過高的爭勝。'],
    '教皇':['神聖智慧的顯現、解釋與教導，以及被自願召喚的神秘力量。','方法、傳承或合格指導能讓原則落地。','教條、權威依賴或錯誤召喚取代親自判斷。'],
    '戀人':['被動或媒介性的靈感、動機力量與行動的啟動；不是固定的戀愛或二選一字典。','靈感找到載體，動機能推動實際行動。','受他人或環境牽動，動機混雜，行動缺乏自主中心。'],
    '戰車':['凱旋、勝利與健康，但其穩定性仍須由尊貴判斷。','不同動力被有效駕馭，推進與恢復力明顯。','勝利不穩、動力互相牽制，健康或進度容易反覆。'],
    '力量':['勇氣、力量、堅忍與力量付諸行動；亦可能表現為固執。','勇氣與耐力足以承壓並採取行動。','力量僵化成固執、逞強或無效對抗。'],
    '隱者':['來自高處的智慧、主動的神聖靈感，有時是突如其來的新流向。','退後辨識後獲得關鍵洞見，專業與內在指引可用。','孤立、過度抽離，或把偶發靈感誤當完整答案。'],
    '命運之輪':['有限度的好運與幸福，也可能出現因成功而陶醉。','外部週期帶來轉機，能在界線內獲益。','短暫幸運造成自滿，忽略週期仍會轉動。'],
    '正義':['永恆正義、力量被裁決所約束；可直接涉及法律、審判、規則與責任。','條件、責任與結果得到精確衡量，裁決可成立。','偏差、失衡或規則被扭曲，力量卡在爭議與判決。'],
    '吊人':['被迫的犧牲、懲罰、損失與非自願的受苦。','接受無法避免的代價，停止錯誤抵抗並重新定位。','無效犧牲、受困或持續付出卻沒有形成轉化。'],
    '死神':['時間、年齡與非自願的轉化；只有與特定強烈牌組合時才可指死亡或毀滅。','舊階段自然終止，轉化雖非自願但能完成。','抗拒時序與結束，使腐耗和失去延長。'],
    '節制':['力量的結合、實現與行動，其物質效果可好可壞，須看尊貴。','不同資源形成可運作的配方並產生實效。','混合失衡、互相稀釋，或行動產生不良物質後果。'],
    '惡魔':['物質性、物質力量、物質誘惑與執著／迷障。','能正視利益、慾望與現實束縛並加以駕馭。','依賴、執著、誘惑或物質鏈反過來控制行動。'],
    '塔':['野心、戰鬥、戰爭與勇氣；亦可能是破壞、危險、跌落與毀壞。','必要的破局與勇敢對抗能拆除失效支撐。','衝突、危險或崩解擴大，野心超過承載。'],
    '星星':['希望、信念與意外援助；另一面是夢幻與受騙的希望。','長程希望有現實支援，外援或信念能續航。','願景失焦、夢幻化或把不可靠承諾當成希望。'],
    '月亮':['不滿、主動改變，以及錯誤、謊言、虛假與欺瞞；此牌對尊貴極敏感。','不滿促使主動修正，能辨識隱藏錯誤。','資訊混亂、欺瞞、恐懼投射或錯誤改變方向。'],
    '太陽':['榮耀、收益與財富；在極差尊貴下可成傲慢、炫耀與虛榮。','成果可見、資源增加，局面明朗而有收穫。','過度自信、炫耀或曝光代價消耗成果。'],
    '審判':['最終決定、判決、宣判，以及在其所屬層面上不可再上訴的定案。','事情得到明確結論，責任與後續方向被確定。','拒絕面對定案、裁決延誤，或在錯誤層面過早封案。'],
    '世界':['問題本身、綜合、世界與王國；常代表實際題目，必須依陪伴牌決定性質。','不同部分完成整合，現實結構形成完整結果。','整體仍未整合，或把表面完成誤認為真正收束。']
  };


  // Golden Dawn Book T canonical trump correspondences.  The display deck keeps
  // its familiar Chinese names, while the interpretation layer uses Book T's
  // Hebrew-letter, path, elemental/planetary/zodiacal attributions.  No modern
  // outer-planet substitutions are admitted into this source profile.
  var MAJOR_CORR = {
    '愚者':{title:'The Spirit of Aether',letter:'Aleph',path:11,astro:'Air',element:'風',count:3},
    '魔術師':{title:'The Magus of Power',letter:'Beth',path:12,astro:'Mercury',element:'風',count:9},
    '女祭司':{title:'The Priestess of the Silver Star',letter:'Gimel',path:13,astro:'Moon',element:'水',count:9},
    '皇后':{title:'The Daughter of the Mighty Ones',letter:'Daleth',path:14,astro:'Venus',element:'土',count:9},
    '皇帝':{title:'The Son of the Morning, Chief among the Mighty',letter:'Heh',path:15,astro:'Aries',element:'火',count:12},
    '教皇':{title:'The Magus of the Eternal Gods',letter:'Vav',path:16,astro:'Taurus',element:'土',count:12},
    '戀人':{title:'The Children of the Voice; the Oracles of the Mighty Gods',letter:'Zayin',path:17,astro:'Gemini',element:'風',count:12},
    '戰車':{title:'The Child of the Powers of the Waters; the Lord of the Triumph of Light',letter:'Cheth',path:18,astro:'Cancer',element:'水',count:12},
    '力量':{title:'The Daughter of the Flaming Sword',letter:'Teth',path:19,astro:'Leo',element:'火',count:12},
    '隱者':{title:'The Magus of the Voice of Power; the Prophet of the Eternal',letter:'Yod',path:20,astro:'Virgo',element:'土',count:12},
    '命運之輪':{title:'The Lord of the Forces of Life',letter:'Kaph',path:21,astro:'Jupiter',element:'火',count:9},
    '正義':{title:'The Daughter of the Lords of Truth; the Ruler of the Balance',letter:'Lamed',path:22,astro:'Libra',element:'風',count:12},
    '吊人':{title:'The Spirit of the Mighty Waters',letter:'Mem',path:23,astro:'Water',element:'水',count:3},
    '死神':{title:'The Child of the Great Transformers; the Lord of the Gates of Death',letter:'Nun',path:24,astro:'Scorpio',element:'水',count:12},
    '節制':{title:'The Daughter of the Reconcilers; the Bringer-Forth of Life',letter:'Samekh',path:25,astro:'Sagittarius',element:'火',count:12},
    '惡魔':{title:'The Lord of the Gates of Matter; the Child of the Forces of Time',letter:'Ayin',path:26,astro:'Capricorn',element:'土',count:12},
    '塔':{title:'The Lord of the Hosts of the Mighty',letter:'Peh',path:27,astro:'Mars',element:'火',count:9},
    '星星':{title:'The Daughter of the Firmament; the Dweller between the Waters',letter:'Tzaddi',path:28,astro:'Aquarius',element:'風',count:12},
    '月亮':{title:'The Ruler of Flux and Reflux; the Child of the Sons of the Mighty',letter:'Qoph',path:29,astro:'Pisces',element:'水',count:12},
    '太陽':{title:'The Lord of the Fire of the World',letter:'Resh',path:30,astro:'Sun',element:'火',count:9},
    '審判':{title:'The Spirit of the Primal Fire',letter:'Shin',path:31,astro:'Spirit and Fire',element:'火',count:3},
    '世界':{title:'The Great One of the Night of Time',letter:'Tav',path:32,astro:'Earth and Saturn',element:'土',count:9}
  };

  var PIPS = {
    wand: {
      1:['火之力的根源','自然力、力量、衝勢、活力與能量；作用方式須依問題與尊貴裁決。','自然火力集中，能迅速啟動與創造。','力量失控、暴烈、耗散或缺乏承載。'],
      2:['統御之主','意志確立疆界、決策與主導權。','果斷、能控制局勢。','專橫、衝突、力量互不相讓。'],
      3:['既成力量之主','力量開始穩固並向外拓展。','遠見、合作、計畫進入可執行階段。','野心散漫、延誤、支援不足。'],
      4:['完成工作之主','火力形成穩定成果、休整與秩序。','完成、和諧、可享用成果。','穩定停滯、成果表面化或內部不合。'],
      5:['爭鬥之主','多股火力競逐，必須測試優先順序。','競爭激發能力、可藉衝突排序。','內耗、爭權、資源被無效消耗。'],
      6:['勝利之主','行動獲得承認，力量被群體接納。','勝利、進展、聲望。','虛榮、短暫勝利、認可不穩。'],
      7:['勇氣之主','在不利比例中維持立場與戰力。','勇敢、防守成功、壓力下仍能行動。','硬撐、寡不敵眾、消耗超過成果。'],
      8:['迅捷之主','能量高速傳遞，事件快速連動。','消息迅速、行動順暢、時機成熟。','倉促、失速、訊息錯位。'],
      9:['巨大力量之主','力量被集中保護並準備最後推進。','韌性、恢復、守住核心。','戒備過度、疲勞、力量封閉。'],
      10:['壓迫之主','火力過量而成負擔，責任壓縮自由。','承擔重大任務、可完成最後一段。','超載、權責失衡、壓力使系統崩解。']
    },
    cup: {
      1:['水之力的根源','生育力、產出、美、愉悅與幸福的原始水性力量。','滋養、感受與關係能形成豐富產出。','情感氾濫、依附、享樂或容器不足。'],
      2:['愛之主','兩股情感形成互惠、吸引與交換。','互相回應、和解、合作。','期待不對等、依賴或關係失衡。'],
      3:['豐盛之主','情感與資源在群體中增殖。','慶賀、共享、支持網絡。','放縱、表面和樂、界線模糊。'],
      4:['混合歡樂之主','已得滿足開始停滯，感受需要重新辨識。','安定、休息、享有既得成果。','厭倦、停滯、舒適使機會被忽略。'],
      5:['歡樂損失之主','期待受挫，情感容器出現缺口。','承認失落後可辨識仍保留的資源。','沉溺失望、關係破損、難以回收。'],
      6:['歡樂之主','過往善意、記憶與熟悉資源回流。','和解、善意、舊資源有用。','懷舊綁架現在、依賴過去。'],
      7:['幻象成功之主','選項繁多但實質不明，慾望投射成可能。','想像提供創意，但需篩選。','誘惑、虛假承諾、判斷失真。'],
      8:['放棄成功之主','已有成果失去生命力，需離開舊滿足。','主動退出失效局面、尋找更真實價值。','停留不甘、離開又回頭、能量耗散。'],
      9:['物質幸福之主','願望在可感受的現實中得到滿足。','享受、滿足、成果可用。','自滿、過度享樂、幸福缺乏深度。'],
      10:['圓滿成功之主','情感、家庭或群體資源形成完整循環。','長期和諧、共享成果、關係穩定。','理想化幸福、群體壓力或表面圓滿。']
    },
    sword: {
      1:['風之力的根源','被召喚的強大力量，可為善或惡；亦指旋轉之力、在困難中形成的力量與正義裁決。','意志與理性被正確召喚，能清楚裁決並穿越困難。','召喚失控、極端、懲罰性或以理性造成傷害。'],
      2:['恢復和平之主','相反意見暫時平衡，需維持清醒。','休戰、理性協調、暫時穩定。','壓抑衝突、猶豫、平衡脆弱。'],
      3:['悲傷之主','清楚看見分裂、損失與痛苦事實。','誠實面對痛點，切除幻想。','殘酷、傷害延長、思緒反覆刺痛。'],
      4:['爭鬥休息之主','思想暫停運作以恢復秩序。','休息、撤退、重新整理。','停滯、逃避、休息不足或過久。'],
      5:['失敗之主','策略與力量比例失衡，勝負帶有代價。','辨認不可打的戰並止損。','羞辱、報復、錯誤競爭持續。'],
      6:['贏得成功之主','理性方法帶領局勢離開混亂。','過渡、改善、技術性解法。','改善緩慢、舊問題隨行、方向不清。'],
      7:['不穩定努力之主','策略迂迴、成果不確定，需要審查資訊。','機智、低調行動、避開正面耗損。','欺瞞、漏洞、計畫無法持續。'],
      8:['縮短力量之主','認知與規則限制行動幅度。','接受邊界後聚焦可控部分。','自我束縛、資訊封閉、無效焦慮。'],
      9:['絕望與殘酷之主','思想轉向自我攻擊，壓力在夜間或內在放大。','看清恐懼來源並停止精神酷刑。','焦慮、罪惡感、殘酷判斷。'],
      10:['毀滅之主','思想結構走到極限，舊策略無法延續。','承認結束、停止無效系統。','崩潰、極端悲觀、破壞擴大。']
    },
    pent: {
      1:['土之力的根源','物質性本身及其正反面，涉及物質收益、勞動、力量與財富。','資源、工作與具體機會能形成可用成果。','物質幻象、貪著、資源閒置或形式大於效益。'],
      2:['和諧變化之主','資源在變動中維持循環與平衡。','彈性調度、周轉、兩端兼顧。','周轉失衡、反覆、成本吞噬成果。'],
      3:['物質工作之主','技藝、分工與實際建造成果。','專業合作、品質被看見。','低品質、協作失靈、做工無法變現。'],
      4:['世俗權力之主','資源被集中、保護與控制。','守成、邊界、資產穩定。','僵化、囤積、控制阻礙流動。'],
      5:['物質困難之主','現金、健康或基本安全受到壓迫。','承認缺口並尋求實際援助。','匱乏惡化、孤立、資源鏈中斷。'],
      6:['物質成功之主','資源交換達成比例，付出與回收較平衡。','收入、支持、公平分配。','依賴、分配不公、表面有進帳卻留不住。'],
      7:['未完成成功之主','投入已有成果但尚未達到預期回報。','評估、耐心、調整投入比例。','回報不足、沉沒成本、等待失去理由。'],
      8:['謹慎之主','重複技術、細節管理與可量化進步。','熟練、改善流程、穩定產出。','機械化、完美主義、努力方向錯誤。'],
      9:['物質收益之主','獨立資源、品質與累積成果可被享用。','收益、自治、穩健成果。','孤立、奢侈、收益依賴單一條件。'],
      10:['財富之主','資產、制度與長期累積形成完整基礎。','穩定財富、傳承、系統化成果。','結構沉重、家族或制度成本、資產不流動。']
    }
  };

  var COURT = {
    page: {
      gdTitle:'Princess／Knave・Earth of the Suit', layer:'土中之元素',
      well:'把該花色的力量具體化、承接、學習並形成可使用的結果。',
      ill:'力量尚未成熟、停留在表面，或被物質條件拖慢。'
    },
    knight: {
      gdTitle:'Prince・Air of the Suit', layer:'風中之元素',
      well:'規劃、傳遞、組織並推動該花色的力量。',
      ill:'思路或行動不穩，容易躁進、反覆或停在概念。'
    },
    queen: {
      gdTitle:'Queen・Water of the Suit', layer:'水中之元素',
      well:'接納、理解、孕育並調節該花色的力量。',
      ill:'過度吸收、情緒化、被動或界線不清。'
    },
    king: {
      gdTitle:'Knight／Lord・Fire of the Suit', layer:'火中之元素',
      well:'主動、創始、決斷並把該花色推向高強度表現。',
      ill:'專斷、過熱、急躁或力量快速耗盡。'
    }
  };

  var COURT_SUIT = {
    wand:['熱情、創造、領導與冒險。','驕傲、躁進、易燃易熄。'],
    cup:['感受、想像、關懷與關係。','情緒化、依附、逃避現實。'],
    sword:['理性、語言、策略與判斷。','冷酷、衝突、過度分析。'],
    pent:['實務、資源、身體與穩定。','遲滯、固著、物質掛帥。']
  };


  // Existing artwork uses King/Queen/Knight/Page labels.  Book T's elemental
  // hierarchy is therefore mapped explicitly: King→Knight/Lord (Fire),
  // Queen→Queen (Water), Knight→Prince (Air), Page→Princess (Earth).
  var COURT_BOOK_T = {
    wand:{
      king:{title:'Knight／Lord of the Flame and Lightning',core:'主動、慷慨、強烈而迅速，以純火力開創局面。',well:'勇敢、慷慨、果斷，能迅速帶動行動。',ill:'殘酷、偏狹、粗暴或只憑衝動。'},
      queen:{title:'Queen of the Thrones of Flame',core:'能調節強大火力，兼具吸引力、命令感與持續性。',well:'堅定、親切、有領導魅力，能使熱情持續。',ill:'固執、報復、專橫或情緒化支配。'},
      knight:{title:'Prince of the Chariot of Fire',core:'以思想和速度傳播火力，敏捷、激烈且富企圖。',well:'迅速、正直、慷慨而有高尚動機。',ill:'殘忍、不寬容、偏見或行動過火。'},
      page:{title:'Princess of the Shining Flame',core:'把火的勇氣、熱情與創造力帶入可見形式。',well:'明亮、勇敢、熱情，能以行動感染他人。',ill:'浮誇、戲劇化、反覆或熱度不穩。'}
    },
    cup:{
      king:{title:'Knight／Lord of the Waves and Waters',core:'情感優雅、詩性而具吸引力，平靜下仍有可被喚起的力量。',well:'有同理、想像與柔韌的推進力。',ill:'感官放縱、懶散、失信或情感漂移。'},
      queen:{title:'Queen of the Thrones of the Waters',core:'高度感受與想像，能反映並孕育周遭情緒。',well:'溫柔、富想像、善於理解與承接。',ill:'過度被環境影響、被動或界線鬆散。'},
      knight:{title:'Prince of the Chariot of the Waters',core:'外表平靜而內在強烈，兼具藝術感、策略與情緒推力。',well:'細膩、敏銳、富創意，能把感受化為策略。',ill:'操控、冷酷、迂迴或情緒手段化。'},
      page:{title:'Princess of the Waters',core:'以溫柔、詩意與關懷使情感具體化。',well:'親切、夢想豐富、富同情與美感。',ill:'自我中心、享樂或沉溺幻想。'}
    },
    sword:{
      king:{title:'Knight／Lord of the Winds and Breezes',core:'主動、聰敏、敏捷而強烈，以思想和語言快速切入。',well:'勇敢、機巧、技術純熟，能迅速裁決。',ill:'欺瞞、暴虐、狡猾或把智慧用於壓迫。'},
      queen:{title:'Queen of the Thrones of Air',core:'洞察敏銳、反應快速，能清楚辨識差異與矛盾。',well:'自信、精準、獨立，能直視事實。',ill:'殘酷、陰險、失信或以言語傷人。'},
      knight:{title:'Prince of the Chariot of the Winds',core:'建立觀念、設計與計畫，重視觀察、結構和推演。',well:'謹慎、周密、善於規劃與分析。',ill:'苛刻、算計、固執或因過度審慎而遲疑。'},
      page:{title:'Princess of the Rushing Winds',core:'把智慧、敏銳與技巧落到訊息、學習和具體判斷。',well:'聰慧、靈巧、警覺，能快速掌握細節。',ill:'輕浮、狡黠、好爭辯或資訊運用失當。'}
    },
    pent:{
      king:{title:'Knight／Lord of the Wide and Fertile Land',core:'勤勞、耐心、實際而重成果，以持續投入建立物質基礎。',well:'可靠、務實、能長期工作並穩定累積。',ill:'貪求、遲鈍、嫉妒或只剩物質佔有。'},
      queen:{title:'Queen of the Thrones of Earth',core:'兼具務實、魅力與多變感受，能照料並管理資源。',well:'慷慨、聰明、真誠，能使資源生長。',ill:'猶豫、任性、情緒與立場反覆。'},
      knight:{title:'Prince of the Chariot of Earth',core:'使物質增加、凝固與成形，重視程序、可靠與實作。',well:'穩定、可信、耐心，能把計畫落地。',ill:'自利、遲鈍、過度物質化或抗拒變化。'},
      page:{title:'Princess of the Echoing Hills',core:'以勤勉、細心和毅力承接物質世界的種子。',well:'慷慨、可靠、認真，能持續完成細節。',ill:'浪費、揮霍、缺乏紀律或只顧眼前。'}
    }
  };

  var SEPHIRAH = {1:'Kether',2:'Chokmah',3:'Binah',4:'Chesed',5:'Geburah',6:'Tiphareth',7:'Netzach',8:'Hod',9:'Yesod',10:'Malkuth'};
  var WORLD = {wand:'Atziluth',cup:'Briah',sword:'Yetzirah',pent:'Assiah'};

  function parseAstro(card) {
    var raw = card && card.astro ? String(card.astro) : '';
    var parts = raw.split('/').map(function(v){return v.trim();}).filter(Boolean);
    return { raw:raw, parts:parts, decan:parts[0] || '', date:parts[1] || '', qabalistic:parts[2] || '', title:parts[3] || '' };
  }
  function rankNumber(card){
    if (!card) return null;
    if (typeof card.num === 'number' && card.num >= 1 && card.num <= 10) return card.num;
    var n = parseInt(card.rank,10); return isFinite(n) ? n : null;
  }
  function profile(card) {
    if (!card) return null;
    var astro = parseAstro(card);
    if (card.suit === 'major') {
      var m = MAJOR[card.n] || ['此大牌的作用須依位置、占星與相鄰牌裁決。','力量能被建設性運用。','力量受阻、過度或失去承載。'];
      var mc = MAJOR_CORR[card.n] || {};
      var corr = [mc.title, mc.letter ? ('字母 '+mc.letter) : '', mc.path ? ('Path '+mc.path) : '', mc.astro || ''].filter(Boolean).join('／');
      return {sourceId:SOURCE_ID,sourceLabel:SOURCE_LABEL,name:card.n,kind:'major',element:mc.element || card.el || '',bookTTitle:mc.title || '',letter:mc.letter || '',path:mc.path || null,astro:mc.astro || '',countValue:mc.count || 0,core:m[0],well:m[1],ill:m[2],correspondence:corr,candidates:[mc.title||'',m[0],m[1],m[2]].filter(Boolean)};
    }
    var num = rankNumber(card);
    if (num && num <= 10 && PIPS[card.suit] && PIPS[card.suit][num]) {
      var p = PIPS[card.suit][num];
      return {sourceId:SOURCE_ID,sourceLabel:SOURCE_LABEL,name:card.n,kind:num===1?'ace':'pip',suit:card.suit,element:ELEMENT[card.suit],number:num,bookTTitle:p[0],core:p[1],well:p[2],ill:p[3],sephirah:SEPHIRAH[num] || '',world:WORLD[card.suit] || '',decan:astro.decan,dateRange:astro.date,correspondence:astro.raw,candidates:[p[0],p[1],p[2],p[3]]};
    }
    var c = COURT[card.rank] || COURT.page;
    var exact = (COURT_BOOK_T[card.suit] || {})[card.rank] || null;
    var sf = COURT_SUIT[card.suit] || ['該花色的功能。','該花色受阻。'];
    var title = exact ? exact.title : c.gdTitle;
    var core = exact ? exact.core : (c.well + ' 本花色主題為' + sf[0]);
    var well = exact ? exact.well : (c.well + ' ' + sf[0]);
    var ill = exact ? exact.ill : (c.ill + ' ' + sf[1]);
    return {sourceId:SOURCE_ID,sourceLabel:SOURCE_LABEL,name:card.n,kind:'court',suit:card.suit,element:ELEMENT[card.suit],rank:card.rank,bookTTitle:title,layer:c.layer,core:core,well:well,ill:ill,correspondence:astro.raw,candidates:[title,c.layer,core,well,ill]};
  }

  function relation(a,b){
    var pa = typeof a === 'string' ? null : profile(a);
    var pb = typeof b === 'string' ? null : profile(b);
    var ea = typeof a === 'string' ? a : (pa||{}).element;
    var eb = typeof b === 'string' ? b : (pb||{}).element;
    if (!ea || !eb) return {code:'neutral',label:'未定',effect:0};
    if (a && b && typeof a !== 'string' && typeof b !== 'string' && a.suit && a.suit === b.suit && a.suit !== 'major') return {code:'same_suit',label:'同花色強化',effect:2};
    if (ea === eb) return {code:'strengthen',label:'同元素強化',effect:1.5};
    if ((ea==='火'&&eb==='水')||(ea==='水'&&eb==='火')||(ea==='風'&&eb==='土')||(ea==='土'&&eb==='風')) return {code:'weaken',label:'敵對元素削弱',effect:-2};
    return {code:'support',label:'友善元素協調',effect:1};
  }
  // 每個牌陣先定義「哪些牌真的相鄰／同組」，避免把抽牌陣列順序誤當成
  // 物理相鄰。Book T 元素尊貴只作用於方法拓撲明示的牌組或直接鄰牌。
  function range(a,b){var out=[];for(var i=a;i<b;i++)out.push(i);return out;}
  function spreadGroups(spreadId,count){
    var id=spreadId||'';
    if(id==='three_card')return [[0,1,2]];
    if(id==='five_card')return [[1,0,2],[3,2,0,4]];
    if(id==='cross')return [[2,0,3],[4,0,1]];
    if(id==='either_or')return [[0,1,3],[0,2,4]];
    if(id==='relationship')return [[0,2,1],[4,3,2,5]];
    if(id==='timeline')return [[0,1,2,3,4]];
    if(id==='celtic_cross')return [[0,1],[2,3],[4,5],[6,7],[8,9]];
    if(id==='tree_of_life')return [[1,3,6],[2,4,7],[0,5,8,9]];
    if(id==='zodiac')return [[0,6],[1,7],[2,8],[3,9],[4,10],[5,11]];
    if(id==='minor_arcana')return [[1,0,2],[3,4,5,6]];
    if(id==='fifteen_card')return [[1,0,2],[3,7,11],[12,8,4],[5,9,13],[6,10,14]];
    if(id==='mathers_21')return [range(0,7),range(7,14),range(14,21)];
    if(id==='mathers_horseshoe')return [range(0,26),range(26,43),range(43,54)];
    if(id==='horseshoe')return [range(0,7)];
    if(id==='ootk')return [range(0,count||0)];
    return count>0?[range(0,count)]:[];
  }
  function topologyNeighbors(spreadId,count,index){
    var groups=spreadGroups(spreadId,count), found=[];
    groups.forEach(function(group){
      var at=group.indexOf(index);if(at<0)return;
      if(at>0&&found.indexOf(group[at-1])<0)found.push(group[at-1]);
      if(at<group.length-1&&found.indexOf(group[at+1])<0)found.push(group[at+1]);
    });
    return {groups:groups,neighbors:found};
  }
  function dignityContext(cards,index,spreadId){
    cards=cards||[];
    var card=cards[index],p=profile(card);
    if(!p)return null;
    var topo=topologyNeighbors(spreadId,cards.length,index);
    var ids=topo.neighbors;
    if(!ids.length)return {state:'unlinked',score:0,relations:[],reading:p.core,spreadId:spreadId||'',topologyBound:!!spreadId};
    var rels=ids.map(function(i){return {index:i,card:cards[i],relation:relation(card,cards[i])};});
    // 一張牌同時連到三個以上節點時，沒有單一「左右夾牌」可合法裁成一個尊貴等級；
    // 保留各邊關係，交由方法網絡逐邊解讀，不做平均投票。
    if(rels.length>2)return {state:'networked',score:null,relations:rels,reading:p.core,spreadId:spreadId||'',topologyBound:true};
    var flanking=rels.length===2?relation(cards[rels[0].index],cards[rels[1].index]):null;
    var neutralized=!!(flanking&&flanking.code==='weaken');
    var effects=rels.map(function(r){return r.relation.effect;});
    var score=neutralized?0:effects.reduce(function(a,b){return a+b;},0);
    var hasWeak=rels.some(function(r){return r.relation.code==='weaken';});
    var hasStrong=rels.some(function(r){return r.relation.code==='same_suit'||r.relation.code==='strengthen';});
    var hasSupport=rels.some(function(r){return r.relation.code==='support';});
    var state='mixed';
    if(neutralized)state='mixed';
    else if(hasWeak&&(hasStrong||hasSupport))state='mixed';
    else if(hasWeak)state='ill_dignified';
    else if(hasStrong||score>=2)state='well_dignified';
    else if(hasSupport)state='supported';
    var reading=state==='well_dignified'?p.well:(state==='ill_dignified'?p.ill:p.core);
    return {state:state,score:score,relations:rels,flanking:flanking,neutralizedByContraryFlanks:neutralized,reading:reading,spreadId:spreadId||'',topologyBound:!!spreadId};
  }
  function spreadDignityGroups(cards,spreadId){
    cards=cards||[];
    return spreadGroups(spreadId,cards.length).map(function(group,gi){
      var links=[];
      for(var i=0;i<group.length-1;i++){
        var a=group[i],b=group[i+1];
        if(cards[a]&&cards[b])links.push({from:a,to:b,fromName:cards[a].n||cards[a].name||'',toName:cards[b].n||cards[b].name||'',relation:relation(cards[a],cards[b])});
      }
      return {group:gi+1,indices:group.slice(),links:links};
    });
  }

  function annotate(card){
    if (!card) return card;
    var p=profile(card); if (!p) return card;
    if (!card._legacyGoldenDawnBackup) card._legacyGoldenDawnBackup={up:card.up,rv:card.rv,kwUp:card.kwUp,kwRv:card.kwRv,astro:card.astro,el:card.el};
    card.gd=p;
    if (p.kind==='major') { card.astro=p.correspondence; card.el=p.element; }
    card.sourceProfile=SOURCE_ID;
    card.up=p.core;
    card.rv=p.ill;
    card.kwUp=p.bookTTitle||p.core;
    card.kwRv='失勢：'+p.ill;
    return card;
  }
  function annotateDeck(deck){(deck||[]).forEach(annotate);return deck;}
  function normalizeDraw(cards){
    (cards||[]).forEach(function(c){if(c){annotate(c);c.isUp=true;c.direction='元素尊貴裁決';}});
    return cards;
  }
  function countValue(card){
    if(!card) return 0;
    if(card.suit==='major'){
      var mp=profile(card);
      return mp && mp.countValue ? mp.countValue : 0;
    }
    if(card.rank==='page') return 7;
    if(card.rank==='knight'||card.rank==='queen'||card.rank==='king') return 4;
    if(card.rank==='ace'||card.num===1) return 11;
    return card.num||parseInt(card.rank,10)||0;
  }
  function majorityObservations(cards){
    cards=(cards||[]).filter(Boolean);
    var suits={wand:0,cup:0,sword:0,pent:0}, ranks={}, keys=0,courts=0,aces=0;
    cards.forEach(function(c){
      if(c.suit==='major'){keys++;return;}
      if(suits[c.suit]!=null)suits[c.suit]++;
      var r=String(c.rank||c.num||'');
      ranks[r]=(ranks[r]||0)+1;
      if(r==='king'||r==='queen'||r==='knight'||r==='page')courts++;
      if(r==='ace'||c.num===1)aces++;
    });
    var observations=[];
    var maxSuit='',maxCount=0,ties=0;
    Object.keys(suits).forEach(function(k){if(suits[k]>maxCount){maxSuit=k;maxCount=suits[k];ties=1;}else if(suits[k]===maxCount&&maxCount>0){ties++;}});
    if(maxSuit&&ties===1&&maxCount>cards.length/2){
      var sm={wand:'權杖多數：能量、對抗或爭論成為主要背景。',cup:'聖杯多數：愉悅、宴樂或情感交換成為主要背景。',sword:'寶劍多數：麻煩、悲傷或衝突成為主要背景。',pent:'金幣多數：商業、金錢與財產成為主要背景。'};
      observations.push(sm[maxSuit]);
    }
    if(keys>cards.length/2)observations.push('大牌多數：有強於問卜者個人控制的力量。');
    if(courts>cards.length/2)observations.push('宮廷牌多數：社會互動或多人會面突出。');
    if(aces>cards.length/2)observations.push('Ace 多數：整體力量集中。');
    var map={
      ace:{4:'四張 Ace：強大力量。',3:'三張 Ace：財富或成功。'},
      king:{4:'四張 Knights／Kings：迅速。',3:'三張 Knights／Kings：意外會面或消息。'},
      queen:{4:'四張 Queens：權威與影響。',3:'三張 Queens：有力朋友。'},
      knight:{4:'四張 Princes／Knights：與重要人物會面。',3:'三張 Princes／Knights：地位與榮譽。'},
      page:{4:'四張 Princesses／Pages：新想法或計畫。',3:'三張 Princesses／Pages：年輕人的社交。'},
      '10':{4:'四張十：焦慮與責任。',3:'三張十：買賣與商業。'},
      '9':{4:'四張九：新增責任。',3:'三張九：大量往來。'},
      '8':{4:'四張八：大量消息。',3:'三張八：大量移動。'},
      '7':{4:'四張七：失望。',3:'三張七：協定與契約。'},
      '6':{4:'四張六：愉悅。',3:'三張六：收益與成功。'},
      '5':{4:'四張五：秩序與規律。',3:'三張五：爭吵與衝突。'},
      '4':{4:'四張四：休息與和平。',3:'三張四：勤勉。'},
      '3':{4:'四張三：決心。',3:'三張三：欺瞞。'},
      '2':{4:'四張二：會議與對話。',3:'三張二：重組或推薦。'}
    };
    Object.keys(ranks).forEach(function(r){var n=ranks[r],m=map[r]&&map[r][n];if(m)observations.push(m);});
    return {suitCounts:suits,keyCount:keys,courtCount:courts,aceCount:aces,rankCounts:ranks,observations:observations};
  }

  function sourceContract(){return {
    id:SOURCE_ID,label:SOURCE_LABEL,version:VERSION,
    meaningOrder:['Book T 核心義','牌陣位置權限','相鄰牌元素尊貴','卡巴拉位階／世界','占星分度','方法拓撲'],
    reversalPolicy:'不使用 Waite 固定正逆字典；一般牌陣牌面統一正向，強弱由元素尊貴、位置與方法結構裁決。',
    spreadPolicy:'牌陣是觀測布局；不把後世布局冒充 Book T 原創。',
    timingPolicy:'只有牌陣明示的相對時間位置或前端提供的外部日曆錨，才能回答時序；牌面占星對應與第四次操作三十六牌環都不是日期換算器。',
    courtMapping:'現有牌圖 King=Book T Knight/Lord（火/Yod）；Queen=Queen（水/Heh）；Knight=Prince（風/Vau）；Page=Princess（土/末Heh）。',
    openingOfKey:'第四次操作為代表牌後方三十六張牌環及1↔36配對，不作三十六旬、月份或日期推算。'
  };}

  var api={
    version:VERSION,sourceId:SOURCE_ID,sourceLabel:SOURCE_LABEL,
    profile:profile,annotate:annotate,annotateDeck:annotateDeck,normalizeDraw:normalizeDraw,
    relation:relation,dignityContext:dignityContext,spreadDignityGroups:spreadDignityGroups,spreadGroups:spreadGroups,countValue:countValue,majorityObservations:majorityObservations,sourceContract:sourceContract,
    forceUpright:function(){return true;},
    majorCorrespondences:MAJOR_CORR,courtBookT:COURT_BOOK_T,
    elements:ELEMENT,englishElements:EN_ELEMENT,suits:SUIT_ZH
  };
  root.JY_GOLDEN_DAWN_MODE=true;
  root.JY_GD_NO_FIXED_REVERSALS=true;
  root.JYGoldenDawn=api;
  try { if (root.TAROT) annotateDeck(root.TAROT); } catch(e) {}
})(typeof window!=='undefined'?window:globalThis);



