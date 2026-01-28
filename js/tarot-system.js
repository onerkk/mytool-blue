// 金色黎明塔羅牌義資料庫 v2.0 (修正版)
// 包含五行對應、正逆位意義、凱爾特十字位置意義

const TAROT_DATA = {
    // 大阿爾克那 (Major Arcana)
    major_0: {
        name: "愚者 (The Fool)",
        nameEn: "The Fool",
        element: "風", // 風對應木（修正：風屬木，非金）
        upright: "新的開始、冒險精神、純真、自由、無限可能",
        reversed: "魯莽、缺乏計劃、不負責任、過於天真",
        meaning: "代表新的旅程和無限潛能，象徵純真與冒險",
        celticMeaning: "新的開始，未知的旅程，信任命運"
    },
    major_1: {
        name: "魔術師 (The Magician)",
        nameEn: "The Magician",
        element: "火",
        upright: "意志力、創造力、行動力、專注、技能",
        reversed: "缺乏方向、意志薄弱、欺騙、濫用權力",
        meaning: "擁有將想法化為現實的能力，代表行動與創造",
        celticMeaning: "掌握工具，創造現實"
    },
    major_2: {
        name: "女祭司 (The High Priestess)",
        nameEn: "High Priestess",
        element: "水", // 修正：增加詳細牌義
        upright: "直覺、潛意識、神秘、內在智慧、靜默",
        reversed: "缺乏直覺、秘密、壓抑、內在混亂",
        meaning: "連結潛意識與直覺，代表內在的智慧與神秘",
        celticMeaning: "隱藏的真相，潛意識的智慧"
    },
    major_3: {
        name: "皇后 (The Empress)",
        nameEn: "The Empress",
        element: "土",
        upright: "豐盛、母性、創造力、自然、滋養",
        reversed: "依賴、過度保護、缺乏成長、停滯",
        meaning: "代表豐盛與創造力，象徵母性與自然的滋養",
        celticMeaning: "豐盛與創造，自然的恩典"
    },
    major_4: {
        name: "皇帝 (The Emperor)",
        nameEn: "The Emperor",
        element: "火", // 修正：皇帝屬火，與皇后相對
        upright: "權威、結構、穩定、領導、秩序",
        reversed: "專制、僵化、缺乏紀律、權力濫用",
        meaning: "代表權威與秩序，象徵結構化的領導",
        celticMeaning: "權威與控制，建立秩序"
    },
    major_5: {
        name: "教皇 (The Hierophant)",
        nameEn: "The Hierophant",
        element: "土", // 修正：與傳統對應
        upright: "傳統、靈性指導、學習、儀式、信仰",
        reversed: "反叛、非傳統、缺乏指導、靈性空虛",
        meaning: "代表傳統與靈性指導，象徵學習與信仰",
        celticMeaning: "傳統與教導，精神指引"
    },
    major_6: {
        name: "戀人 (The Lovers)",
        nameEn: "The Lovers",
        element: "風", // 風對應木
        upright: "愛情、選擇、和諧、結合、價值觀",
        reversed: "不協調、錯誤選擇、價值觀衝突、分離",
        meaning: "代表愛情與選擇，象徵和諧的結合",
        celticMeaning: "選擇與關係，價值觀的考驗"
    },
    major_7: {
        name: "戰車 (The Chariot)",
        nameEn: "The Chariot",
        element: "水", // 修正：巨蟹座屬水
        upright: "意志力、勝利、控制、決心、前進",
        reversed: "缺乏控制、失敗、方向迷失、衝突",
        meaning: "代表意志力與勝利，象徵控制與前進",
        celticMeaning: "勝利與控制，前進的動力"
    },
    major_8: {
        name: "力量 (Strength)",
        nameEn: "Strength",
        element: "火", // 修正：獅子座屬火
        upright: "內在力量、耐心、控制、勇氣、溫柔",
        reversed: "軟弱、缺乏自信、失控、過度依賴",
        meaning: "代表內在力量與耐心，象徵溫柔的勇氣",
        celticMeaning: "內在力量，溫柔的控制"
    },
    major_9: {
        name: "隱者 (The Hermit)",
        nameEn: "The Hermit",
        element: "土", // 修正：處女座屬土
        upright: "內省、尋求真理、孤獨、指導、智慧",
        reversed: "孤立、迷失、缺乏方向、拒絕幫助",
        meaning: "代表內省與尋求真理，象徵智慧的指引",
        celticMeaning: "內省與指引，尋找真理"
    },
    major_10: {
        name: "命運之輪 (Wheel of Fortune)",
        nameEn: "Wheel of Fortune",
        element: "火", // 修正：木星屬火（擴展）
        upright: "命運、循環、變化、機會、轉折",
        reversed: "壞運、缺乏控制、抗拒變化、停滯",
        meaning: "代表命運的循環與變化，象徵機會與轉折",
        celticMeaning: "命運的轉折，機會來臨"
    },
    major_11: {
        name: "正義 (Justice)",
        nameEn: "Justice",
        element: "風", // 天秤座屬風
        upright: "正義、平衡、因果、責任、公平",
        reversed: "不公、不平衡、缺乏責任、偏見",
        meaning: "代表正義與平衡，象徵因果與責任",
        celticMeaning: "平衡與公正，因果報應"
    },
    major_12: {
        name: "倒吊人 (The Hanged Man)",
        nameEn: "The Hanged Man",
        element: "水", // 水元素
        upright: "犧牲、等待、新視角、放下、接受",
        reversed: "拖延、抗拒、不必要的犧牲、停滯",
        meaning: "代表犧牲與等待，象徵新視角與接受",
        celticMeaning: "等待與犧牲，不同的視角"
    },
    major_13: {
        name: "死神 (Death)",
        nameEn: "Death",
        element: "水", // 天蠍座屬水
        upright: "轉化、結束、重生、釋放、改變",
        reversed: "抗拒改變、停滯、恐懼、無法放下",
        meaning: "代表轉化與結束，象徵重生與改變",
        celticMeaning: "結束與轉化，必要的改變"
    },
    major_14: {
        name: "節制 (Temperance)",
        nameEn: "Temperance",
        element: "火", // 射手座屬火
        upright: "平衡、調和、耐心、節制、融合",
        reversed: "不平衡、過度、缺乏耐心、衝突",
        meaning: "代表平衡與調和，象徵耐心與融合",
        celticMeaning: "平衡與調和，融合對立"
    },
    major_15: {
        name: "惡魔 (The Devil)",
        nameEn: "The Devil",
        element: "土", // 摩羯座屬土
        upright: "束縛、物質主義、誘惑、依賴、限制",
        reversed: "解放、打破束縛、克服誘惑、自由",
        meaning: "代表束縛與誘惑，象徵物質主義的限制",
        celticMeaning: "束縛與執著，物質的限制"
    },
    major_16: {
        name: "塔 (The Tower)",
        nameEn: "The Tower",
        element: "火", // 火星屬火
        upright: "突然變化、破壞、啟示、解放、覺醒",
        reversed: "避免災難、抗拒變化、壓抑、內在破壞",
        meaning: "代表突然的變化與破壞，象徵啟示與覺醒",
        celticMeaning: "突變與破壞，真相的揭露"
    },
    major_17: {
        name: "星星 (The Star)",
        nameEn: "The Star",
        element: "風", // 水瓶座屬風
        upright: "希望、靈感、平靜、指引、療癒",
        reversed: "絕望、缺乏信心、失去方向、停滯",
        meaning: "代表希望與靈感，象徵平靜與指引",
        celticMeaning: "希望與指引，靈感的啟發"
    },
    major_18: {
        name: "月亮 (The Moon)",
        nameEn: "The Moon",
        element: "水", // 雙魚座屬水
        upright: "幻覺、恐懼、潛意識、直覺、不確定",
        reversed: "釋放恐懼、清晰、理解、內在平靜",
        meaning: "代表幻覺與恐懼，象徵潛意識與直覺",
        celticMeaning: "潛意識與恐懼，隱藏的真相"
    },
    major_19: {
        name: "太陽 (The Sun)",
        nameEn: "The Sun",
        element: "火", // 太陽屬火
        upright: "快樂、成功、活力、樂觀、啟蒙",
        reversed: "過度樂觀、缺乏活力、內在陰影、延遲",
        meaning: "代表快樂與成功，象徵活力與樂觀",
        celticMeaning: "成功與快樂，真理的光芒"
    },
    major_20: {
        name: "審判 (Judgment)",
        nameEn: "Judgment",
        element: "火", // 火元素
        upright: "重生、覺醒、判斷、寬恕、新開始",
        reversed: "缺乏自我覺察、嚴苛判斷、無法放下過去",
        meaning: "代表重生與覺醒，象徵判斷與寬恕",
        celticMeaning: "重生與覺醒，最後的審判"
    },
    major_21: {
        name: "世界 (The Universe)",
        nameEn: "The World",
        element: "土", // 土星屬土
        upright: "完成、成就、整合、圓滿、新循環",
        reversed: "未完成、缺乏閉合、停滯、延遲",
        meaning: "代表完成與成就，象徵整合與圓滿",
        celticMeaning: "完成與成就，循環的結束"
    },
    
    // 小阿爾克那 - 權杖 (Wands) - 火元素
    wands_1: { 
        name: "權杖 Ace", 
        nameEn: "Ace of Wands", 
        element: "火", 
        upright: "新計劃、靈感、創造力、熱情、新開始", 
        reversed: "缺乏方向、失去靈感、延遲、機會錯失",
        celticMeaning: "新的開始，創造力的爆發"
    },
    wands_2: { 
        name: "權杖二", 
        nameEn: "Two of Wands", 
        element: "火", 
        upright: "計劃、未來展望、個人權力、決策", 
        reversed: "缺乏計劃、恐懼未知、缺乏方向、猶豫",
        celticMeaning: "計劃與展望，權力的掌握"
    },
    wands_3: { 
        name: "權杖三", 
        nameEn: "Three of Wands", 
        element: "火", 
        upright: "探索、擴展、遠見、領導、合作", 
        reversed: "缺乏遠見、延遲、限制、孤立",
        celticMeaning: "探索與遠見，合作的開始"
    },
    wands_4: { 
        name: "權杖四", 
        nameEn: "Four of Wands", 
        element: "火", 
        upright: "慶祝、和諧、穩定、成就、家庭", 
        reversed: "缺乏和諧、不穩定、慶祝延遲、家庭問題",
        celticMeaning: "穩定與慶祝，家庭的和諧"
    },
    wands_5: { 
        name: "權杖五", 
        nameEn: "Five of Wands", 
        element: "火", 
        upright: "衝突、競爭、挑戰、分歧、成長", 
        reversed: "避免衝突、內在衝突、解決分歧、逃避",
        celticMeaning: "衝突與競爭，成長的挑戰"
    },
    wands_6: { 
        name: "權杖六", 
        nameEn: "Six of Wands", 
        element: "火", 
        upright: "勝利、成功、認可、自信、榮譽", 
        reversed: "缺乏認可、失敗、缺乏自信、嫉妒",
        celticMeaning: "勝利與認可，成功的回報"
    },
    wands_7: { 
        name: "權杖七", 
        nameEn: "Seven of Wands", 
        element: "火", 
        upright: "挑戰、防禦、堅持、競爭、勇氣", 
        reversed: "放棄、缺乏自信、過度防禦、妥協",
        celticMeaning: "堅持與挑戰，勇敢的防守"
    },
    wands_8: { 
        name: "權杖八", 
        nameEn: "Eight of Wands", 
        element: "火", 
        upright: "快速行動、進展、消息、速度、旅行", 
        reversed: "延遲、缺乏進展、匆忙決定、混亂",
        celticMeaning: "快速進展，消息的傳遞"
    },
    wands_9: { 
        name: "權杖九", 
        nameEn: "Nine of Wands", 
        element: "火", 
        upright: "韌性、堅持、最後努力、防禦、經驗", 
        reversed: "疲憊、放棄、防禦過度、脆弱",
        celticMeaning: "堅持與防禦，經驗的積累"
    },
    wands_10: { 
        name: "權杖十", 
        nameEn: "Ten of Wands", 
        element: "火", 
        upright: "負擔、責任、過度工作、壓力、完成", 
        reversed: "釋放負擔、委派、缺乏責任、解脫",
        celticMeaning: "負擔與責任，最後的階段"
    },
    wands_11: { 
        name: "權杖侍者", 
        nameEn: "Princess of Wands", 
        element: "火", 
        upright: "探索、熱情、新開始、創造力、消息", 
        reversed: "缺乏熱情、延遲、創造力受阻、消極",
        celticMeaning: "探索與熱情，新消息的到來"
    },
    wands_12: { 
        name: "權杖騎士", 
        nameEn: "Prince of Wands", 
        element: "火", 
        upright: "行動、冒險、衝動、熱情、出發", 
        reversed: "缺乏方向、魯莽、過度衝動、延遲",
        celticMeaning: "行動與冒險，熱情的追求"
    },
    wands_13: { 
        name: "權杖皇后", 
        nameEn: "Queen of Wands", 
        element: "火", 
        upright: "自信、獨立、熱情、創造力、領導", 
        reversed: "缺乏自信、依賴、失去熱情、控制欲",
        celticMeaning: "自信與領導，創造力的展現"
    },
    wands_14: { 
        name: "權杖國王", 
        nameEn: "King of Wands", 
        element: "火", 
        upright: "領導、遠見、企業家精神、魅力、權威", 
        reversed: "專制、缺乏遠見、過度自信、濫用權力",
        celticMeaning: "領導與權威，遠見的實現"
    },
    
    // 小阿爾克那 - 聖杯 (Cups) - 水元素
    cups_1: { 
        name: "聖杯 Ace", 
        nameEn: "Ace of Cups", 
        element: "水", 
        upright: "新感情、直覺、情感開始、愛、靈感", 
        reversed: "情感阻塞、缺乏愛、直覺關閉、空虛",
        celticMeaning: "情感的開始，愛的湧現"
    },
    cups_2: { 
        name: "聖杯二", 
        nameEn: "Two of Cups", 
        element: "水", 
        upright: "夥伴關係、結合、和諧、愛情、合作", 
        reversed: "不平衡、分離、缺乏和諧、衝突",
        celticMeaning: "和諧的關係，情感的結合"
    },
    cups_3: { 
        name: "聖杯三", 
        nameEn: "Three of Cups", 
        element: "水", 
        upright: "友誼、慶祝、社交、快樂、豐盛", 
        reversed: "過度社交、孤立、缺乏慶祝、嫉妒",
        celticMeaning: "慶祝與友誼，情感的分享"
    },
    cups_4: { 
        name: "聖杯四", 
        nameEn: "Four of Cups", 
        element: "水", 
        upright: "冥想、內省、錯過機會、不滿、等待", 
        reversed: "接受機會、缺乏內省、行動、覺醒",
        celticMeaning: "內省與等待，機會的評估"
    },
    cups_5: { 
        name: "聖杯五", 
        nameEn: "Five of Cups", 
        element: "水", 
        upright: "失落、悲傷、失望、專注負面、悔恨", 
        reversed: "接受、向前看、找到希望、寬恕",
        celticMeaning: "失落與悲傷，情感的療癒"
    },
    cups_6: { 
        name: "聖杯六", 
        nameEn: "Six of Cups", 
        element: "水", 
        upright: "懷舊、童年、純真、給予、回憶", 
        reversed: "活在過去、缺乏成長、拒絕給予、依賴",
        celticMeaning: "懷舊與純真，過去的禮物"
    },
    cups_7: { 
        name: "聖杯七", 
        nameEn: "Seven of Cups", 
        element: "水", 
        upright: "選擇、幻想、選項、白日夢、願望", 
        reversed: "缺乏選擇、清晰、決定、現實",
        celticMeaning: "選擇與幻想，願望的實現"
    },
    cups_8: { 
        name: "聖杯八", 
        nameEn: "Eight of Cups", 
        element: "水", 
        upright: "放棄、追尋、離開、內在探索、成長", 
        reversed: "避免放棄、停滯、恐懼離開、滿足",
        celticMeaning: "追尋與離開，內在的旅程"
    },
    cups_9: { 
        name: "聖杯九", 
        nameEn: "Nine of Cups", 
        element: "水", 
        upright: "滿足、願望實現、快樂、滿足、享受", 
        reversed: "缺乏滿足、未實現願望、不快樂、貪婪",
        celticMeaning: "滿足與實現，願望的達成"
    },
    cups_10: { 
        name: "聖杯十", 
        nameEn: "Ten of Cups", 
        element: "水", 
        upright: "和諧、家庭、快樂、圓滿、幸福", 
        reversed: "缺乏和諧、家庭衝突、不快樂、分裂",
        celticMeaning: "家庭和諧，情感的圓滿"
    },
    cups_11: { 
        name: "聖杯侍者", 
        nameEn: "Princess of Cups", 
        element: "水", 
        upright: "創意、直覺、情感開始、敏感、夢想", 
        reversed: "情感阻塞、缺乏創意、過度敏感、幻想",
        celticMeaning: "創意與夢想，情感的萌芽"
    },
    cups_12: { 
        name: "聖杯騎士", 
        nameEn: "Prince of Cups", 
        element: "水", 
        upright: "浪漫、魅力、創意、情感、追求", 
        reversed: "情感不成熟、缺乏魅力、幻想、欺騙",
        celticMeaning: "浪漫與追求，情感的旅程"
    },
    cups_13: { 
        name: "聖杯皇后", 
        nameEn: "Queen of Cups", 
        element: "水", 
        upright: "同情、直覺、情感、滋養、智慧", 
        reversed: "情感不平衡、缺乏同情、壓抑、控制",
        celticMeaning: "情感智慧，直覺的引導"
    },
    cups_14: { 
        name: "聖杯國王", 
        nameEn: "King of Cups", 
        element: "水", 
        upright: "情感平衡、同情、控制、智慧、成熟", 
        reversed: "情感不平衡、缺乏控制、冷漠、情緒化",
        celticMeaning: "情感控制，成熟的愛"
    },
    
    // 小阿爾克那 - 寶劍 (Swords) - 風元素
    swords_1: { 
        name: "寶劍 Ace", 
        nameEn: "Ace of Swords", 
        element: "風", // 修正：風元素（對應木）
        upright: "新想法、清晰、真理、突破、勝利", 
        reversed: "混亂、缺乏清晰、錯誤想法、欺騙",
        celticMeaning: "新的想法，真理的突破"
    },
    swords_2: { 
        name: "寶劍二", 
        nameEn: "Two of Swords", 
        element: "風", 
        upright: "困難選擇、僵局、平衡、防禦", 
        reversed: "缺乏選擇、不平衡、決定、釋放",
        celticMeaning: "選擇的僵局，內在的平衡"
    },
    swords_3: { 
        name: "寶劍三", 
        nameEn: "Three of Swords", 
        element: "風", 
        upright: "心碎、悲傷、痛苦、分離、背叛", 
        reversed: "療癒、釋放痛苦、接受、寬恕",
        celticMeaning: "心碎與分離，情感的傷害"
    },
    swords_4: { 
        name: "寶劍四", 
        nameEn: "Four of Swords", 
        element: "風", 
        upright: "休息、冥想、恢復、和平、療癒", 
        reversed: "缺乏休息、疲憊、恢復延遲、逃避",
        celticMeaning: "休息與恢復，內在的和平"
    },
    swords_5: { 
        name: "寶劍五", 
        nameEn: "Five of Swords", 
        element: "風", 
        upright: "衝突、競爭、不公、損失、自私", 
        reversed: "解決衝突、和解、恢復、妥協",
        celticMeaning: "衝突與競爭，暫時的勝利"
    },
    swords_6: { 
        name: "寶劍六", 
        nameEn: "Six of Swords", 
        element: "風", 
        upright: "過渡、離開、改變、前進、療癒", 
        reversed: "無法離開、停滯、抗拒改變、困擾",
        celticMeaning: "過渡與離開，療癒的旅程"
    },
    swords_7: { 
        name: "寶劍七", 
        nameEn: "Seven of Swords", 
        element: "風", 
        upright: "欺騙、策略、偷竊、秘密、逃避", 
        reversed: "誠實、缺乏策略、揭露、面對",
        celticMeaning: "策略與欺騙，隱藏的行動"
    },
    swords_8: { 
        name: "寶劍八", 
        nameEn: "Eight of Swords", 
        element: "風", 
        upright: "限制、束縛、自我限制、恐懼、無助", 
        reversed: "解放、打破限制、自由、勇氣",
        celticMeaning: "限制與束縛，自我設限"
    },
    swords_9: { 
        name: "寶劍九", 
        nameEn: "Nine of Swords", 
        element: "風", 
        upright: "焦慮、噩夢、恐懼、擔憂、失眠", 
        reversed: "釋放恐懼、希望、平靜、面對",
        celticMeaning: "焦慮與恐懼，內在的折磨"
    },
    swords_10: { 
        name: "寶劍十", 
        nameEn: "Ten of Swords", 
        element: "風", 
        upright: "背叛、結束、底點、釋放、轉折", 
        reversed: "恢復、新開始、避免背叛、療癒",
        celticMeaning: "結束與背叛，黑暗中的曙光"
    },
    swords_11: { 
        name: "寶劍侍者", 
        nameEn: "Princess of Swords", 
        element: "風", 
        upright: "新想法、好奇心、學習、溝通、警覺", 
        reversed: "缺乏想法、溝通問題、學習受阻、粗心",
        celticMeaning: "學習與溝通，新的訊息"
    },
    swords_12: { 
        name: "寶劍騎士", 
        nameEn: "Prince of Swords", 
        element: "風", 
        upright: "行動、衝動、缺乏方向、思想、迅速", 
        reversed: "缺乏行動、過度思考、延遲、猶豫",
        celticMeaning: "迅速行動，思想的衝動"
    },
    swords_13: { 
        name: "寶劍皇后", 
        nameEn: "Queen of Swords", 
        element: "風", 
        upright: "清晰、獨立、直接、真理、智慧", 
        reversed: "過度批判、缺乏同情、冷酷、孤立",
        celticMeaning: "清晰與真理，智慧的判斷"
    },
    swords_14: { 
        name: "寶劍國王", 
        nameEn: "King of Swords", 
        element: "風", 
        upright: "權威、真理、清晰、公正、邏輯", 
        reversed: "濫用權力、不公、缺乏清晰、冷酷",
        celticMeaning: "權威與公正，邏輯的統治"
    },
    
    // 小阿爾克那 - 錢幣 (Pentacles) - 土元素
    pentacles_1: { 
        name: "錢幣 Ace", 
        nameEn: "Ace of Pentacles", 
        element: "土", 
        upright: "新機會、物質開始、潛力、繁榮", 
        reversed: "錯過機會、缺乏潛力、物質問題、浪費",
        celticMeaning: "新的物質機會，財富的開始"
    },
    pentacles_2: { 
        name: "錢幣二", 
        nameEn: "Two of Pentacles", 
        element: "土", 
        upright: "平衡、優先順序、適應、資源管理", 
        reversed: "不平衡、缺乏優先順序、過度負擔、混亂",
        celticMeaning: "平衡與適應，資源的調配"
    },
    pentacles_3: { 
        name: "錢幣三", 
        nameEn: "Three of Pentacles", 
        element: "土", 
        upright: "團隊合作、學習、協作、技能發展", 
        reversed: "缺乏合作、缺乏學習、孤立、失敗",
        celticMeaning: "合作與技能，團隊的成功"
    },
    pentacles_4: { 
        name: "錢幣四", 
        nameEn: "Four of Pentacles", 
        element: "土", 
        upright: "安全、控制、節儉、保存、穩定", 
        reversed: "缺乏安全、過度控制、浪費、恐懼失去",
        celticMeaning: "安全與控制，財富的保存"
    },
    pentacles_5: { 
        name: "錢幣五", 
        nameEn: "Five of Pentacles", 
        element: "土", 
        upright: "缺乏、貧困、孤立、困難、疾病", 
        reversed: "恢復、找到支持、改善、希望",
        celticMeaning: "貧困與孤立，物質的缺乏"
    },
    pentacles_6: { 
        name: "錢幣六", 
        nameEn: "Six of Pentacles", 
        element: "土", 
        upright: "給予、分享、慷慨、平衡、慈善", 
        reversed: "缺乏慷慨、不平衡、自私、依賴",
        celticMeaning: "慷慨與分享，財富的流動"
    },
    pentacles_7: { 
        name: "錢幣七", 
        nameEn: "Seven of Pentacles", 
        element: "土", 
        upright: "耐心、評估、長期投資、成長、等待", 
        reversed: "缺乏耐心、缺乏評估、短期思考、失望",
        celticMeaning: "耐心等待，投資的回報"
    },
    pentacles_8: { 
        name: "錢幣八", 
        nameEn: "Eight of Pentacles", 
        element: "土", 
        upright: "技能、專注、品質、努力、學習", 
        reversed: "缺乏技能、缺乏專注、匆忙、粗心",
        celticMeaning: "技能與努力，專業的成長"
    },
    pentacles_9: { 
        name: "錢幣九", 
        nameEn: "Nine of Pentacles", 
        element: "土", 
        upright: "獨立、財務安全、自給自足、享受", 
        reversed: "缺乏獨立、財務不安全、依賴、虛榮",
        celticMeaning: "獨立與享受，自給自足"
    },
    pentacles_10: { 
        name: "錢幣十", 
        nameEn: "Ten of Pentacles", 
        element: "土", 
        upright: "財富、家庭、長期安全、遺產、傳統", 
        reversed: "財務問題、家庭衝突、缺乏安全、分裂",
        celticMeaning: "財富與傳統，家庭的傳承"
    },
    pentacles_11: { 
        name: "錢幣侍者", 
        nameEn: "Princess of Pentacles", 
        element: "土", 
        upright: "新機會、學習、務實、勤奮、潛力", 
        reversed: "缺乏機會、缺乏學習、不務實、懶惰",
        celticMeaning: "學習與機會，務實的開始"
    },
    pentacles_12: { 
        name: "錢幣騎士", 
        nameEn: "Prince of Pentacles", 
        element: "土", 
        upright: "效率、實用、責任、進步、可靠", 
        reversed: "缺乏效率、不實用、缺乏責任、拖延",
        celticMeaning: "責任與進步，可靠的執行"
    },
    pentacles_13: { 
        name: "錢幣皇后", 
        nameEn: "Queen of Pentacles", 
        element: "土", 
        upright: "實用、滋養、財務安全、慷慨、舒適", 
        reversed: "缺乏實用、缺乏滋養、財務不安全、貪婪",
        celticMeaning: "滋養與舒適，務實的關懷"
    },
    pentacles_14: { 
        name: "錢幣國王", 
        nameEn: "King of Pentacles", 
        element: "土", 
        upright: "財務安全、實用、慷慨、商業、成功", 
        reversed: "財務不安全、缺乏實用、貪婪、失敗",
        celticMeaning: "成功與財富，商業的智慧"
    }
};

// 五行對應關係（修正版）
const ELEMENT_MAP = {
    "火": ["火"],         // 塔羅：權杖，五行：火
    "水": ["水"],         // 塔羅：聖杯，五行：水
    "風": ["木"],         // 塔羅：寶劍（風）對應五行：木（修正：風屬木，非金）
    "土": ["土"],         // 塔羅：錢幣，五行：土
    // 以下為五行補全
    "金": ["金"],         // 五行中的金（塔羅中沒有直接對應）
    "木": ["木"]          // 五行中的木
};

// 五行相生相剋關係（完整版）
const ELEMENT_RELATIONS = {
    // 相生：木生火、火生土、土生金、金生水、水生木
    generate: { 
        "木": "火", 
        "火": "土", 
        "土": "金", 
        "金": "水", 
        "水": "木" 
    },
    // 相剋：木剋土、土剋水、水剋火、火剋金、金剋木
    overcome: { 
        "木": "土", 
        "土": "水", 
        "水": "火", 
        "火": "金", 
        "金": "木" 
    },
    // 相洩：被生者洩生者
    drain: {
        "火": "木", // 火被木生，木洩火
        "土": "火",
        "金": "土", 
        "水": "金",
        "木": "水"
    },
    // 反剋：被剋者反剋
    counter: {
        "土": "木", // 土被木剋，木反剋土
        "水": "土",
        "火": "水",
        "金": "火",
        "木": "金"
    }
};

// 塔羅牌陣位置意義（凱爾特十字）
const CELTIC_POSITIONS = {
    1: {
        name: "核心現況",
        meaning: "當前問題的核心，當事人的基本狀態",
        element: "風", // 對應木
        advice: "正視當前處境，了解問題本質"
    },
    2: {
        name: "橫跨的挑戰",
        meaning: "橫跨在問題上的影響力，可能是幫助也可能是阻礙",
        element: "水",
        advice: "面對挑戰，尋找跨越的方法"
    },
    3: {
        name: "潛意識根源",
        meaning: "問題的潛意識根源，深層的動機或恐懼",
        element: "水",
        advice: "探索內心深處，了解真正動機"
    },
    4: {
        name: "過去",
        meaning: "最近發生的重要事件，正在消退但仍有影響力",
        element: "土",
        advice: "放下過去，從經驗中學習"
    },
    5: {
        name: "顯意識目標",
        meaning: "當事人意識中的目標和期望",
        element: "火",
        advice: "明確目標，聚焦努力方向"
    },
    6: {
        name: "未來",
        meaning: "不久的將來可能發展的方向",
        element: "風", // 對應木
        advice: "準備迎接變化，積極規劃未來"
    },
    7: {
        name: "自我",
        meaning: "當事人的自我認知和態度",
        element: "火",
        advice: "了解自我，調整心態"
    },
    8: {
        name: "環境",
        meaning: "外部環境和他人的影響",
        element: "土",
        advice: "適應環境，善用外部資源"
    },
    9: {
        name: "希望與恐懼",
        meaning: "當事人的希望、恐懼和內在矛盾",
        element: "水",
        advice: "面對恐懼，保持希望"
    },
    10: {
        name: "最終結果",
        meaning: "基於當前軌跡的最終結果",
        element: "土",
        advice: "接受結果，從中學習成長"
    }
};

// 塔羅牌查詢輔助函數
function getTarotCardById(id) {
    // 支援多種ID格式：major_0, wands_1, swords_1等
    return TAROT_DATA[id] || null;
}

function getTarotCardByName(name) {
    // 通過中文名稱查找
    for (const key in TAROT_DATA) {
        if (TAROT_DATA[key].name.includes(name)) {
            return TAROT_DATA[key];
        }
    }
    return null;
}

// 五行分析輔助函數
function analyzeTarotElements(cards) {
    const elementCount = {
        "火": 0,
        "水": 0,
        "風": 0,
        "土": 0
    };
    
    cards.forEach(card => {
        if (card && card.element) {
            elementCount[card.element] = (elementCount[card.element] || 0) + 1;
        }
    });
    
    return elementCount;
}

// 塔羅元素轉五行元素
function tarotElementToWuxing(tarotElement) {
    return ELEMENT_MAP[tarotElement] ? ELEMENT_MAP[tarotElement][0] : null;
}

// 塔羅牌解讀生成器
function generateTarotReading(cards, positions = CELTIC_POSITIONS) {
    let reading = "";
    
    cards.forEach((card, index) => {
        const position = positions[index + 1];
        if (card && position) {
            reading += `**${index + 1}. ${position.name}**\n`;
            reading += `牌：${card.name} ${card.element ? `(${card.element})` : ''}\n`;
            reading += `位置意義：${position.meaning}\n`;
            reading += `牌義：${card.upright || card.meaning}\n`;
            if (card.reversed) {
                reading += `逆位提示：${card.reversed}\n`;
            }
            reading += `建議：${position.advice}\n\n`;
        }
    });
    
    return reading;
}

// 匯出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        TAROT_DATA,
        ELEMENT_MAP,
        ELEMENT_RELATIONS,
        CELTIC_POSITIONS,
        getTarotCardById,
        getTarotCardByName,
        analyzeTarotElements,
        tarotElementToWuxing,
        generateTarotReading
    };
}
