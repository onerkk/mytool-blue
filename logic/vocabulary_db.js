/**
 * 詞彙資料庫：依問題類型與結果象徵對應的豐富詞彙
 * 供融合引擎、評分引擎、直接答案生成使用
 * 詞彙來源：八字、梅花易數、塔羅、紫微斗數、姓名學等命理術語與白話說法
 */
(function (global) {
  'use strict';

  /** 問題類型 → 主題詞彙（白話、可讀） */
  var SUBJECT_BY_TYPE = {
    finance: [
      '本月收入與財運', '正財偏財', '投資理財', '財富累積', '財務狀況',
      '賺錢能力', '收入來源', '理財水平', '金錢緣份', '收支平衡'
    ],
    career: [
      '事業與工作發展', '職涯方向', '升遷機會', '工作表現', '職業適性',
      '領導能力', '氣度抱負', '事業運勢', '工作變動', '職場人際'
    ],
    relationship: [
      '感情與姻緣', '人際關係', '伴侶緣分', '桃花運勢', '溝通互動',
      '感情發展', '緣分深淺', '人際助力', '貴人運', '真誠連結'
    ],
    love: [
      '感情與姻緣', '愛情發展', '伴侶選擇', '復合機會', '表達心意',
      '價值觀契合', '關係穩定', '緣分重整', '感情轉型'
    ],
    health: [
      '健康狀況', '身心狀態', '體質調養', '作息飲食', '康復進度',
      '活力能量', '身心平衡', '療程成效', '預防保健'
    ],
    family: [
      '家庭與居住', '家人關係', '不動產', '居家環境', '家庭根基',
      '購屋置產', '家庭和諧', '家人溝通', '田宅運勢'
    ],
    general: [
      '您問的這件事', '整體運勢', '當下狀況', '發展方向', '時機成熟度'
    ]
  };

  /** 結論傾向（有利／中性／不利）→ 豐富說法 */
  var CONCLUSION_PHRASES = {
    favorable: [
      '整體偏有利', '有機會達標', '運勢偏旺', '得令順遂', '可積極爭取',
      '把握時機', '順勢而為', '宜把握', '有達標空間', '旺相有氣'
    ],
    neutral: [
      '屬中性', '可先準備', '留意時機', '穩健評估', '順勢觀察',
      '平穩發展', '中性偏可行', '有達標空間', '需留意條件', '時機未至'
    ],
    unfavorable: [
      '偏有阻力', '保守為宜', '休囚偏弱', '需謹慎', '多數維度偏弱',
      '宜穩健準備', '勿過度擴張', '謹慎決策', '阻力較大', '需多準備'
    ],
    strongUnfavorable: [
      '阻力較大', '先釐清阻礙', '休囚不得時', '宜保守', '暫緩行動',
      '多做準備', '釐清來源', '審慎評估', '不宜躁進'
    ]
  };

  /** 影響因子描述詞彙（有利／中性／不利）→ 依方法分 */
  var FACTOR_DESCRIPTORS = {
    bazi: {
      favorable: ['流年得令', '喜用相合', '身強有根', '大運扶助', '五行流通', '旺相得氣'],
      neutral: ['流年中性', '喜忌平衡', '身強弱適中', '大運平穩', '五行尚可'],
      unfavorable: ['流年忌神', '喜用受剋', '身弱無扶', '大運不利', '五行受阻', '休囚偏弱']
    },
    meihua: {
      favorable: ['用生體吉', '體用比和', '卦象利財', '卦象利事業', '卦象利感情', '事可成'],
      neutral: ['卦象平穩', '體用平衡', '順勢而為', '需付出', '謹慎為上'],
      unfavorable: ['用剋體凶', '體生用耗', '卦象提示阻礙', '需謹慎', '勿過度擴張']
    },
    tarot: {
      favorable: ['牌陣利財', '牌陣利事業', '牌陣利感情', '象徵豐盛', '象徵完成', '凱爾特十字有利'],
      neutral: ['牌陣中性', '需評估', '留意時機', '牌義尚可'],
      unfavorable: ['牌陣提示阻力', '象徵束縛', '象徵轉型', '凱爾特十字偏弱', '需留意']
    },
    ziwei: {
      favorable: ['財帛宮旺', '官祿宮有主星', '星曜得地', '廟旺有氣', '宮位吉利'],
      neutral: ['宮位尚可', '星曜平穩', '供參考'],
      unfavorable: ['財帛宮無主星', '官祿宮偏弱', '星曜陷地', '宮位休囚', '需結合大限']
    },
    nameology: {
      favorable: ['數理吉', '人格總格利財', '三才相生', '五行得助', '吉數對應'],
      neutral: ['數理尚可', '五行平衡', '供綜合參考'],
      unfavorable: ['數理偏弱', '五行受阻', '吉數未顯', '需結合八字']
    }
  };

  /** 建議詞彙（依類型與傾向） */
  var SUGGESTION_PHRASES = {
    finance: {
      favorable: ['把握投資時機', '可謹慎理財', '開源節流並進', '穩健累積', '正財為主'],
      neutral: ['評估現況再行動', '勿過度擴張', '保守理財', '建立預備金', '分散風險'],
      unfavorable: ['保守理財', '避免高槓桿', '檢視支出', '延後大額決策', '穩健為上']
    },
    career: {
      favorable: ['把握近期表現', '加強專業', '主動爭取', '建立人脈', '展現能力'],
      neutral: ['沉潛進修', '檢視現職', '留意時機', '穩紮穩打', '觀望後動'],
      unfavorable: ['保守評估', '避免衝動離職', '檢視阻礙', '多做準備', '謹慎為上']
    },
    relationship: {
      favorable: ['主動表達', '創造話題', '真誠溝通', '觀察反應', '把握緣分'],
      neutral: ['釐清需求', '給彼此空間', '勿過度解讀', '順其自然'],
      unfavorable: ['先釐清再決定', '避免情緒化', '注意界線', '謹慎溝通']
    },
    love: {
      favorable: ['主動表達心意', '創造共同回憶', '適時調整節奏', '珍惜緣分'],
      neutral: ['釐清真實需求', '給彼此空間', '觀察互動', '順勢發展'],
      unfavorable: ['勿情緒化決策', '釐清阻礙', '給彼此時間', '謹慎評估']
    },
    health: {
      favorable: ['規律作息', '適度運動', '依醫囑追蹤', '身心平衡'],
      neutral: ['規律調養', '留意身體訊號', '適度休息', '預防為上'],
      unfavorable: ['及早就醫', '規律作息', '避免過勞', '依醫囑治療']
    },
    family: {
      favorable: ['傾聽家人', '包容溝通', '共同決策', '和諧為上'],
      neutral: ['傾聽需求', '避免衝動', '尋求共識', '耐心溝通'],
      unfavorable: ['避免氣頭決策', '尋求客觀意見', '釐清爭議', '冷靜溝通']
    },
    general: {
      favorable: ['把握時機', '積極行動', '設定目標', '穩健執行'],
      neutral: ['依狀況判斷', '留意時機', '拆解步驟', '定期檢視'],
      unfavorable: ['釐清阻礙', '保守評估', '多做準備', '審慎決策']
    }
  };

  /** 結論開頭詞彙（多維度交叉） */
  var CONCLUSION_OPENERS = {
    favorable: [
      '以八字、梅花、塔羅、紫微等多維象徵交叉來看',
      '多維象徵（八字／梅花／塔羅／紫微）綜合評估',
      '從各維度象徵綜合看',
      '各系統交叉驗證顯示'
    ],
    neutral: [
      '多維象徵綜合評估',
      '從各維度象徵綜合看',
      '八字、梅花、塔羅、紫微交叉顯示',
      '綜合各維度象徵'
    ],
    unfavorable: [
      '多維交叉顯示',
      '各維度象徵顯示',
      '從八字、梅花、塔羅、紫微綜合看',
      '多維象徵交叉驗證'
    ]
  };

  /** 結論結尾詞彙（行動建議） */
  var CONCLUSION_TAILS = {
    favorable: [
      '建議把握時機、積極行動。',
      '有達標空間，可積極爭取。',
      '宜把握有利時機、穩健執行。'
    ],
    neutral: [
      '可先準備、留意時機再行動。',
      '需留意條件是否齊備、時機是否成熟。',
      '穩健準備、順勢而為。'
    ],
    unfavorable: [
      '建議保守評估、多做準備再決策。',
      '宜穩健準備、留意時機再行動。',
      '先釐清阻礙來源再行動。'
    ]
  };

  /** 依種子取一（陣列）— 同問題同結果得同一詞彙 */
  function pick(arr, seed) {
    if (!arr || !arr.length) return '';
    var idx = 0;
    if (typeof seed === 'number' && Number.isFinite(seed)) idx = Math.abs(Math.floor(seed)) % arr.length;
    else if (seed != null) idx = (String(seed).split('').reduce(function (a, c) { return a + c.charCodeAt(0); }, 0)) % arr.length;
    return arr[idx];
  }

  /** 依問題類型取主題詞（seed 可用 question 或 probVal） */
  function getSubject(type, seed) {
    var arr = SUBJECT_BY_TYPE[type] || SUBJECT_BY_TYPE.general;
    return pick(arr, seed);
  }

  /** 依傾向取結論短語 */
  function getConclusionPhrase(tendency, seed) {
    var arr = CONCLUSION_PHRASES[tendency] || CONCLUSION_PHRASES.neutral;
    return pick(arr, seed);
  }

  /** 依方法與傾向取因子描述 */
  function getFactorDescriptor(method, tendency, seed) {
    var m = FACTOR_DESCRIPTORS[method];
    if (!m) return '';
    var arr = m[tendency] || m.neutral;
    return pick(arr, seed);
  }

  /** 依類型與傾向取建議 */
  function getSuggestionPhrase(type, tendency, seed) {
    var t = SUGGESTION_PHRASES[type] || SUGGESTION_PHRASES.general;
    if (!t) return '';
    var arr = t[tendency] || t.neutral;
    return pick(arr, seed);
  }

  /** 依傾向取結論開頭 */
  function getConclusionOpener(tendency, seed) {
    var arr = CONCLUSION_OPENERS[tendency] || CONCLUSION_OPENERS.neutral;
    return pick(arr, seed);
  }

  /** 依傾向取結論結尾 */
  function getConclusionTail(tendency, seed) {
    var arr = CONCLUSION_TAILS[tendency] || CONCLUSION_TAILS.neutral;
    return pick(arr, seed);
  }

  var api = {
    getSubject: getSubject,
    getConclusionPhrase: getConclusionPhrase,
    getFactorDescriptor: getFactorDescriptor,
    getSuggestionPhrase: getSuggestionPhrase,
    getConclusionOpener: getConclusionOpener,
    getConclusionTail: getConclusionTail,
    SUBJECT_BY_TYPE: SUBJECT_BY_TYPE,
    CONCLUSION_PHRASES: CONCLUSION_PHRASES,
    FACTOR_DESCRIPTORS: FACTOR_DESCRIPTORS,
    SUGGESTION_PHRASES: SUGGESTION_PHRASES
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    global.VocabularyDB = api;
  }
})(typeof window !== 'undefined' ? window : this);
