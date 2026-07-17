/*! golden-dawn-tarot.js — Golden Dawn Book T unified tarot core v3.0.0
 * Single source of truth for every tarot layout and Opening of the Key.
 * Interpretation source: Golden Dawn Book T / Liber T.
 * Physical orientation is not a fixed Waite-style reversed dictionary.
 */
(function(root){
  'use strict';
  if (!root || root.JYGoldenDawn) return;

  var VERSION = '3.0.0';
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

  // Legacy modernized pip table removed in v2.0.0.

  // Source-faithful Book T meanings.  The older PIPS table is retained only for
  // backward-compatible field names; profile() reads this canonical table.
  // Each entry is [Book T title, source core, constructive expression,
  // adverse/limited expression].  The last two fields are dignity-conditioned
  // paraphrases, not fixed upright/reversed meanings.
  var BOOK_T_PIPS = {
    wand: {
      1:['火之力的根源','自然的火之根本力量：力量、衝勢、活力與能量；其作用依問題性質而定。','自然力量集中，能啟動、推進或創造。','力量過烈、迅速耗散，或欠缺能承接它的形式。'],
      2:['統御之主','力量、統御與公正秩序的和諧；亦含勇猛、野心、敏感、躁動與不寬恕。','權威、勇氣與決斷形成有效主導。','統御轉為報復、強硬、動盪或頑固。'],
      3:['既成力量之主','力量已建立，願望開始實現；勞作完成，經爭鬥後成功，亦伴隨驕傲與自我主張。','既有力量穩固，工作可完成並見成果。','驕傲、傲慢或粗魯的自我主張破壞成果。'],
      4:['完成工作之主','經困難與勞作建成之事達到完成；勞後休息、安排、機巧與完成的成功。','工作完成、秩序建立，能在成果上休整。','過度焦慮與倉促使行動不穩，或以表面完成掩蓋不可靠。'],
      5:['爭鬥之主','激烈衝突與大膽；魯莽、殘酷、暴力、慾望、揮霍或慷慨，須依尊貴裁決。','競爭中的膽量與投入可被導向有用行動。','衝突失控，魯莽、殘酷或耗散擴大。'],
      6:['勝利之主','爭鬥後的勝利；由勞動取得的愛與愉悅，謹慎、社交與避免衝突；亦可能因成功而驕矜。','努力後取得勝利、收益與承認。','因財富或成功而傲慢，勝利被自滿削弱。'],
      7:['勇氣之主','可能的勝利取決於所用的能量與勇氣；有阻礙、困難與爭執，也可在小事上獲勝。','在阻力中持續投入，勇氣足以爭取可能勝利。','能量不足、爭執與虛張聲勢使可能勝利流失。'],
      8:['迅捷之主','力量施加過快過猛，迅速但很快耗盡；亦指迅捷、膽量、訊息與行動。','快速傳遞、消息與行動能在短程內推進。','過猛、短促、不持久，或迅速行動帶來壓迫與失信。'],
      9:['巨大力量之主','巨大而穩定、難以撼動的力量；成功伴隨鬥爭與能量，勝利前有憂懼。','持續力量、恢復力與成功能承受阻力。','固執、難以駕馭或因戒備與外觀而僵化。'],
      10:['壓迫之主','殘酷且壓迫性的力量，常被用於物質與自利目的；也可能因最初自私而遭遇過強反對與失敗。','良好尊貴時可表現為慷慨、無私與自我犧牲。','壓迫、惡意、報復、不義，或負荷與阻力使事情失敗。']
    },
    cup: {
      1:['水之力的根源','水的根本力量：生育、產出、美、愉悅與幸福。','感受與滋養形成產出、愉悅與美。','情感與享樂缺乏容器，產出被氾濫或依附稀釋。'],
      2:['愛之主','陰陽力量結合的和諧；愛、婚姻、愉悅與細膩，失勢時可成愚行、放蕩與浪費。','互惠、愛與結合形成可持續的和諧。','關係中的愚行、耗散或享樂失度。'],
      3:['豐盛之主','豐盛、充足、成功、愉悅、感官享受、被動成功與好運；亦含親切與慷慨。','資源與情感充足，分享、款待與愉悅增加。','被動享受、感官放縱或富足缺乏方向。'],
      4:['混合歡樂之主','成功或愉悅接近尾聲；幸福進入停滯期，可能延續也可能不延續，且愉悅中帶有不適。','已有愉悅可暫時維持，但需辨識其限制。','停滯、被動與愉悅中的代價使成功走向結束。'],
      5:['歡樂損失之主','愉悅的死亡或終止；對原本期待帶來快樂之事感到失望、悲傷與損失，且麻煩可由意外來源出現。','承認愉悅已結束，辨認失望與意外損失的來源。','背叛、欺瞞、惡意與未預期的憂患擴大。'],
      6:['歡樂之主','穩定增加、收益與愉悅的開端，但仍只是開始；亦可能因不當自我主張與虛榮引起衝突。','願望、幸福、成功或享受開始增長。','自負、忘恩或過早自滿使初步愉悅轉為爭執。'],
      7:['幻象成功之主','可能勝利被人的懈怠抵銷；表面勝利時出現欺瞞，承諾不履行，初步成功未被追進。','辨認表面成功與真實成果的差距，及時續進。','幻想、錯誤、虛假承諾與放縱使成功無法保留。'],
      8:['放棄成功之主','短暫成功而沒有後續結果；所得很快被放下，興趣衰退、漂移與不穩定。','停止無後續價值的成功，承認興趣已下降。','得到即棄、惰性與不穩使成果無法延續。'],
      9:['物質幸福之主','愉悅與幸福幾乎完整實現，願望達成；亦可能自誇、虛榮、過度談論自己。','願望與可感受的幸福得到充分實現。','自滿、虛榮或過度自我假定損害幸福。'],
      10:['圓滿成功之主','受上方啟發而形成持久成功與幸福；事情安定、完整好運，亦含平靜、調停、慷慨或浪費。','成功與幸福得到持久安定，群體可共享成果。','放蕩、浪費或過度享樂侵蝕已完成的好運。']
    },
    sword: {
      1:['風之力的根源','被召喚的巨大力量，可為善或惡；亦是旋轉之力、困難中形成的力量，以及維持神聖權威的正義。','力量被正確召喚，用於裁決、澄清與穿越困難。','召喚成為憤怒、懲罰、苦難或破壞性的權力。'],
      2:['恢復和平之主','同一性質中的矛盾特徵；苦難中生出力量，痛苦後有愉悅；安排、休戰與和平恢復，但關係仍有張力。','衝突獲得安排與休戰，公平與互助可恢復秩序。','和解不完整、反覆冒犯、缺乏分寸或真假混雜。'],
      3:['悲傷之主','破裂、中斷、分離、爭吵、挑撥、悲傷與眼淚；亦可能保有誠信或某些愉悅，依尊貴而定。','誠實面對分裂與悲傷，守住承諾與交易誠信。','挑撥、欺語、爭端與自利使分離加劇。'],
      4:['爭鬥休息之主','悲傷後的休息、戰爭後的和平；焦慮放鬆、安靜、休整與充足，皆在爭鬥之後。','爭鬥後得以休息、恢復並轉好。','休息只是暫停，未處理的爭鬥仍限制穩定。'],
      5:['失敗之主','競爭已結束並判定對問卜者不利；失敗、焦慮、麻煩與損失，亦含惡意、誹謗與不可靠。','明確認出已敗的競爭，停止讓損失擴大。','惡意、報復、搬弄與持續爭鬥加深失敗。'],
      6:['贏得成功之主','經焦慮與麻煩後取得成功；亦含勞動、耐心、自尊、支配與旅程。','耐心與工作使局勢在困難後成功。','自負、支配或過度在意形象削弱所得。'],
      7:['不穩定努力之主','只有部分成功；勝利在握時因未繼續努力而退讓，性格搖擺、不可靠，也可能窺探或洩露祕密。','承認成果尚不完整，持續最後一段努力。','在將得之際放棄、搖擺、失信或洩密，令成果流失。'],
      8:['縮短力量之主','把過多力量用於小事，因過度注意細節而犧牲主要與重要之處；細節耐心與其他方面混亂並存。','細節上的耐心與技巧被限制在適當範圍內。','狹隘、瑣碎、支配性，或智慧被用在小而不值得之事。'],
      9:['絕望與殘酷之主','絕望、殘酷、無情、惡意、痛苦、缺乏、損失與壓迫；亦可能依尊貴表現為服從、忠誠、耐心與無私。','在痛苦中仍維持耐心、忠誠與無私，避免殘酷擴大。','絕望、殘酷、謊言與壓迫直接主導局面。'],
      10:['毀滅之主','失去紀律的交戰力量，造成完全瓦解與失敗；所有計畫與工程遭到毀壞。','唯一建設性方向是承認既有計畫已被破壞並停止擴大損失。','全面破壞、失敗、敗北與中斷成為收束。']
    },
    pent: {
      1:['土之力的根源','一切意義上的物質性，兼具善惡與幻象性；涉及物質收益、勞動、力量與財富。','物質、工作與資源形成可使用的收益。','對物質形式的迷執、幻象或代價遮蔽真實效益。'],
      2:['和諧變化之主','得失、強弱與工作狀態交替；管理得當可幸運，但也有反覆、不可靠與矛盾。','以審慎管理維持變動中的周轉與和諧。','搖擺、不一致與管理失誤使得失反覆。'],
      3:['物質工作之主','建造、創作與物質事物的實現及增加；商業交易、職位、受薪工作與建立中的事務。','工作、建造與商業技能形成實際增加。','狹隘、自利或追逐不可能之事偏離可建立的工作。'],
      4:['世俗權力之主','確定的物質收益、地位、統御與世俗權力已完成，但不再通向更遠；有秩序卻欠缺進取與原創。','收益、影響與資源獲得保護和秩序。','貪求、猜疑、不滿與缺乏進取使完成停滯。'],
      5:['物質困難之主','金錢或地位損失，物質事務的麻煩、勞動與焦慮；有時可在艱苦工作後取回金錢。','承認物質缺口，以嚴謹工作與實際知識爭取恢復。','職業或金錢損失、貧困與焦慮形成直接壓力。'],
      6:['物質成功之主','物質事業中的成功與收益；權力、影響、地位與治理，良好尊貴時慷慨而公正。','商業繁榮、物質成功與公平運用資源。','因過量而傲慢、炫富或揮霍。'],
      7:['未完成成功之主','成功的承諾未實現；看似有前景的財運落空，少量孤立收益沒有後續果實，常是多勞少得。','及早辨認不會結果的承諾，重新評估投入。','希望破滅、無利投機、沉重投入只換得微小且孤立的收益。'],
      8:['謹慎之主','在小事上過度謹慎而犧牲大局；小額現金收益、勤勞、栽培與囤積，但缺乏進取。','技巧、勤勞與謹慎能帶來小額、可驗證的收益。','斤斤計較、囤積、過度細節化與缺乏進取使大局受損。'],
      9:['物質收益之主','物質收益完全實現：財富、繼承與物品增加；亦可能貪求、囤藏，甚至偷盜與欺詐，須依尊貴裁決。','物質收益、資產增加與成果實現。','貪求、囤積或不正手段污染收益。'],
      10:['財富之主','物質收益與財運完成，到達成功頂點但不再通向更遠；可能伴隨沉重、怠惰或部分損失。','財富與金錢交易達到完成和頂點。','停滯、沉重、怠惰或高點後的部分損失。']
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
      knight:{title:'Prince of the Chariot of the Waters',core:'本性細微、強烈、狡黠而有藝術性，外表平靜；能成為善或惡的強大力量，且容易受表面權力與智慧吸引。',well:'細微、藝術而強韌，能把平靜外表下的強烈力量導向建設性成果。',ill:'極端冷酷、無情、狡詐，或把情感與才智用於惡意目的。'},
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


  // Book T's divinatory role priority, with an application-level grounding
  // safeguard.  The priority comes from Book T; the prohibition on inventing
  // identity, age, appearance or occupation is an app evidence rule.
  var COURT_ROLE_PRIORITY = {
    king:['事情、影響或消息的到來／離去','人物（需由問題與位置完成共指）'],
    queen:['與事情相關的人物','其花色的承接與實現作用'],
    knight:['與事情相關的人物','其花色的組織與實現作用'],
    page:['意見、思想或計畫','人物（需另有共指證據）']
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
      return {sourceId:SOURCE_ID,sourceLabel:SOURCE_LABEL,name:card.n,kind:'major',element:mc.element || card.el || '',bookTTitle:mc.title || '',letter:mc.letter || '',path:mc.path || null,astro:mc.astro || '',countValue:mc.count || 0,sourceCore:m[0],contextualGloss:m[0],core:m[0],well:m[1],ill:m[2],correspondence:corr,candidates:[mc.title||'',m[0],m[1],m[2]].filter(Boolean)};
    }
    var num = rankNumber(card);
    if (num && num <= 10 && BOOK_T_PIPS[card.suit] && BOOK_T_PIPS[card.suit][num]) {
      var p = BOOK_T_PIPS[card.suit][num];
      return {sourceId:SOURCE_ID,sourceLabel:SOURCE_LABEL,name:card.n,kind:num===1?'ace':'pip',suit:card.suit,element:ELEMENT[card.suit],number:num,bookTTitle:p[0],sourceCore:p[1],contextualGloss:p[1],core:p[1],well:p[2],ill:p[3],sephirah:SEPHIRAH[num] || '',world:WORLD[card.suit] || '',decan:astro.decan,dateRange:astro.date,correspondence:astro.raw,candidates:[p[0],p[1],p[2],p[3]]};
    }
    var c = COURT[card.rank] || COURT.page;
    var exact = (COURT_BOOK_T[card.suit] || {})[card.rank] || null;
    var sf = COURT_SUIT[card.suit] || ['該花色的功能。','該花色受阻。'];
    var title = exact ? exact.title : c.gdTitle;
    var core = exact ? exact.core : (c.well + ' 本花色主題為' + sf[0]);
    var well = exact ? exact.well : (c.well + ' ' + sf[0]);
    var ill = exact ? exact.ill : (c.ill + ' ' + sf[1]);
    return {sourceId:SOURCE_ID,sourceLabel:SOURCE_LABEL,name:card.n,kind:'court',suit:card.suit,element:ELEMENT[card.suit],rank:card.rank,bookTTitle:title,layer:c.layer,sourceCore:core,contextualGloss:core,core:core,well:well,ill:ill,rolePriority:(COURT_ROLE_PRIORITY[card.rank]||[]).slice(),groundingRule:'不得僅憑宮廷牌具體化未知人物；身分、年齡、外貌與職業須有原問句或獨立證據。',correspondence:astro.raw,candidates:[title,c.layer,core,well,ill]};
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
  // Interpretation dependency edges and Book T dignity lines are distinct.
  // A modern spread may define causal/semantic links, but those links do not
  // automatically become Book T's physical "cards next to it on either side".
  function range(a,b){var out=[];for(var i=a;i<b;i++)out.push(i);return out;}
  function foundation(){ return root && root.JYTarotFoundation ? root.JYTarotFoundation : null; }
  function spreadDependencyGroups(spreadId,count){
    var f=foundation();
    if(f&&typeof f.getDependencyGroups==='function')return f.getDependencyGroups(spreadId,count);
    return count>0?[range(0,count)]:[];
  }
  function spreadDignityLines(spreadId,count){
    var f=foundation();
    if(f&&typeof f.getDignityLines==='function')return f.getDignityLines(spreadId,count);
    return [];
  }
  function spreadCompatibilityEdges(spreadId){
    var f=foundation();
    if(f&&typeof f.getCompatibilityEdges==='function')return f.getCompatibilityEdges(spreadId);
    return [];
  }
  // Backward compatibility: spreadGroups now means interpretation topology,
  // not Book T dignity adjacency.
  function spreadGroups(spreadId,count){return spreadDependencyGroups(spreadId,count);}
  function lineContexts(spreadId,count,index){
    var contexts=[];
    spreadDignityLines(spreadId,count).forEach(function(line,li){
      var at=line.indexOf(index);if(at<0)return;
      var n=[];if(at>0)n.push(line[at-1]);if(at<line.length-1)n.push(line[at+1]);
      contexts.push({lineIndex:li,line:line.slice(),position:at,neighbors:n,full:n.length===2});
    });
    return contexts;
  }
  function evaluateRelations(card,cards,ids,p){
    var rels=ids.map(function(i){return {index:i,card:cards[i],relation:relation(card,cards[i])};});
    var flank=rels.length===2?relation(cards[rels[0].index],cards[rels[1].index]):null;
    var neutralized=!!(flank&&flank.code==='weaken');
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
    return {state:state,score:score,relations:rels,flanking:flank,neutralizedByContraryFlanks:neutralized,reading:state==='well_dignified'?p.well:(state==='ill_dignified'?p.ill:p.core)};
  }
  function dignityContext(cards,index,spreadId){
    cards=cards||[];var card=cards[index],p=profile(card);if(!p)return null;
    var contexts=lineContexts(spreadId,cards.length,index);
    var full=contexts.filter(function(c){return c.full;}).map(function(c){return Object.assign({basis:'ordered_flanking_line'},c,evaluateRelations(card,cards,c.neighbors,p));});
    var one=contexts.filter(function(c){return !c.full&&c.neighbors.length;}).map(function(c){return Object.assign({basis:'one_sided_local_compatibility'},c,evaluateRelations(card,cards,c.neighbors,p));});
    var edges=spreadCompatibilityEdges(spreadId).filter(function(e){return e[0]===index||e[1]===index;}).map(function(e){var other=e[0]===index?e[1]:e[0];return {index:other,card:cards[other],relation:relation(card,cards[other]),basis:'declared_interaction_compatibility'};});
    if(full.length===1){var r=full[0];r.spreadId=spreadId||'';r.topologyBound=true;r.fullDignity=true;r.localCompatibility=one;r.interactionCompatibility=edges;return r;}
    if(full.length>1)return {state:'multi_line',score:null,reading:p.core,spreadId:spreadId||'',topologyBound:true,fullDignity:true,lineReadings:full,localCompatibility:one,interactionCompatibility:edges,relations:[]};
    if(one.length){
      var only=one[0];
      var localState=only.state==='ill_dignified'?'locally_weakened':(only.state==='well_dignified'||only.state==='supported'?'locally_supported':'local_mixed');
      return {state:localState,score:only.score,reading:p.core,spreadId:spreadId||'',topologyBound:true,fullDignity:false,localCompatibility:one,interactionCompatibility:edges,relations:only.relations};
    }
    if(edges.length)return {state:'interaction_only',score:null,reading:p.core,spreadId:spreadId||'',topologyBound:true,fullDignity:false,localCompatibility:[],interactionCompatibility:edges,relations:edges};
    return {state:'unlinked',score:0,relations:[],reading:p.core,spreadId:spreadId||'',topologyBound:!!spreadId,fullDignity:false};
  }
  function spreadDignityGroups(cards,spreadId){
    cards=cards||[];
    return spreadDignityLines(spreadId,cards.length).map(function(line,gi){
      var links=[];for(var i=0;i<line.length-1;i++){var a=line[i],b=line[i+1];if(cards[a]&&cards[b])links.push({from:a,to:b,fromName:cards[a].n||cards[a].name||'',toName:cards[b].n||cards[b].name||'',relation:relation(cards[a],cards[b]),basis:'ordered_contiguous_line'});}
      return {group:gi+1,indices:line.slice(),links:links,basis:'book_t_ordered_line'};
    });
  }
  function spreadInteractionGroups(cards,spreadId){
    cards=cards||[];
    return spreadDependencyGroups(spreadId,cards.length).map(function(group,gi){
      return {group:gi+1,indices:group.slice(),basis:'spread_interpretive_dependency_not_book_t_dignity'};
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
    card.rv='';
    card.kwUp=p.bookTTitle||p.core;
    card.kwRv='';
    card.gdIllDignified=p.ill;
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
    meaningOrder:['Book T 原典核心義','牌陣位置權限','實際有序相鄰線的元素尊貴','卡巴拉位階／世界','占星分度','牌陣依賴拓撲（不冒充 Book T 相鄰）'],
    reversalPolicy:'不使用 Waite 固定正逆字典；一般牌陣牌面統一正向，強弱由元素尊貴、位置與方法結構裁決。',
    spreadPolicy:'牌陣是觀測布局；後世牌陣的因果／語義連線不自動等於 Book T 左右相鄰。只有明示有序連續線才套用完整元素尊貴；其他連線只讀互動相容性。',
    timingPolicy:'只有牌陣明示的相對時間位置或前端提供的外部日曆錨，才能回答時序；牌面占星對應與第四次操作三十六牌環都不是日期換算器。',
    courtMapping:'現有牌圖 King=Book T Knight/Lord（火/Yod）；Queen=Queen（水/Heh）；Knight=Prince（風/Vau）；Page=Princess（土/末Heh）。角色優先序依 Book T，具體人物身分另受應用程式證據綁定限制。',
    openingOfKey:'第四次操作為代表牌後方三十六張牌環及1↔36配對，不作三十六旬、月份或日期推算。'
  };}

  var api={
    version:VERSION,foundationVersion:(foundation()&&foundation().VERSION)||'',sourceId:SOURCE_ID,sourceLabel:SOURCE_LABEL,
    profile:profile,annotate:annotate,annotateDeck:annotateDeck,normalizeDraw:normalizeDraw,
    relation:relation,dignityContext:dignityContext,spreadDignityGroups:spreadDignityGroups,spreadInteractionGroups:spreadInteractionGroups,spreadDignityLines:spreadDignityLines,spreadDependencyGroups:spreadDependencyGroups,spreadCompatibilityEdges:spreadCompatibilityEdges,spreadGroups:spreadGroups,countValue:countValue,majorityObservations:majorityObservations,sourceContract:sourceContract,
    forceUpright:function(){return true;},
    majorCorrespondences:MAJOR_CORR,courtBookT:COURT_BOOK_T,courtRolePriority:COURT_ROLE_PRIORITY,canonicalPips:BOOK_T_PIPS,
    elements:ELEMENT,englishElements:EN_ELEMENT,suits:SUIT_ZH
  };
  root.JY_GOLDEN_DAWN_MODE=true;
  root.JY_GD_NO_FIXED_REVERSALS=true;
  root.JYGoldenDawn=api;
  try { if (root.TAROT) annotateDeck(root.TAROT); } catch(e) {}
})(typeof window!=='undefined'?window:globalThis);



