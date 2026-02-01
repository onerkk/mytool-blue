/**
 * 塔羅牌依問題類型的正逆位解讀
 * 當有 type 覆寫時優先使用，否則回傳 null 由 TAROT_DATA 承接
 * 類型差異明顯：Death 事業=轉型/換跑道；愛情=關係結束/劇變
 */
(function (global) {
  'use strict';

  var TAROT_MEANINGS_BY_TYPE = {
    major_13: {
      love: { upright: '關係轉型、結束舊模式、緣分重整', reversed: '抗拒關係改變、僵持、無法放下' },
      career: { upright: '轉型、換跑道、結束舊職迎接新階段', reversed: '抗拒轉職、停滯、恐懼改變' },
      wealth: { upright: '財務重整、結清舊帳、新理財方式', reversed: '理財慣性難改、延遲決策' },
      health: { upright: '療程轉換、康復轉折點', reversed: '抗拒就醫、拖延治療' },
      general: { upright: '轉化、結束、重生、釋放', reversed: '抗拒改變、停滯、恐懼' }
    },
    major_16: {
      love: { upright: '關係劇變、真相揭露、可能分手或重新開始', reversed: '避免衝突爆發、壓抑情緒' },
      career: { upright: '突發變動、裁員或重組、突破瓶頸', reversed: '暫時避開危機、醞釀變動' },
      wealth: { upright: '突發破財或意外之財、投資劇變', reversed: '風險延後、謹慎為上' },
      health: { upright: '急症、手術、重大身體警訊', reversed: '避免惡化、及早預防' },
      general: { upright: '突然變化、破壞、啟示、覺醒', reversed: '避免災難、抗拒變化' }
    },
    major_6: {
      love: { upright: '愛情、選擇伴侶、價值觀契合', reversed: '價值觀衝突、錯誤選擇、分離' },
      career: { upright: '合作、結盟、選擇職涯方向', reversed: '合作破裂、決策失誤' },
      wealth: { upright: '投資抉擇、理財方向', reversed: '錯誤投資、決策搖擺' },
      health: { upright: '治療方式選擇、身心平衡', reversed: '選擇困難、延遲就醫' },
      general: { upright: '選擇、和諧、結合', reversed: '不協調、錯誤選擇' }
    },
    major_15: {
      love: { upright: '關係束縛、依賴、控制', reversed: '擺脫執念、關係解放' },
      career: { upright: '工作束縛、制度限制、加班文化', reversed: '突破限制、換環境' },
      wealth: { upright: '物質依賴、負債、過度消費', reversed: '理財覺醒、斷捨離' },
      health: { upright: '成癮、過勞、不良習慣', reversed: '戒除惡習、作息改善' },
      general: { upright: '束縛、誘惑、限制', reversed: '解放、打破束縛' }
    },
    major_19: {
      love: { upright: '感情明朗、喜悅、約會順利', reversed: '熱情消退、關係冷淡' },
      career: { upright: '事業成功、表現亮眼、升遷機會', reversed: '進展延遲、低調蟄伏' },
      wealth: { upright: '財運亨通、正財收入', reversed: '收入延遲、保守為宜' },
      health: { upright: '活力充沛、恢復良好', reversed: '體力不足、需休養' },
      general: { upright: '快樂、成功、活力', reversed: '過度樂觀、缺乏活力' }
    },
    major_21: {
      love: { upright: '關係圓滿、結婚、穩定', reversed: '關係未定、尚需時間' },
      career: { upright: '專案完成、階段性成就', reversed: '收尾延遲、尚未完成' },
      wealth: { upright: '理財目標達成、財務整合', reversed: '目標未達、持續累積' },
      health: { upright: '康復完成、身心整合', reversed: '療程未畢、持續調養' },
      general: { upright: '完成、成就、圓滿', reversed: '未完成、延遲' }
    },
    major_1: {
      love: { upright: '主動創造、表達心意', reversed: '缺乏誠意、隱瞞' },
      career: { upright: '展現能力、執行計劃', reversed: '空談不行動、方向錯誤' },
      wealth: { upright: '理財規劃、開源契機', reversed: '投資失誤' },
      health: { upright: '積極改善、能量充沛', reversed: '體力透支' },
      general: { upright: '創造、執行、專注', reversed: '意志薄弱' }
    },
    major_3: {
      love: { upright: '感情豐盛、母性能量、滋養', reversed: '過度依賴、停滯' },
      career: { upright: '創意發揮、豐收在望', reversed: '缺乏成長' },
      wealth: { upright: '財富累積、物質豐裕', reversed: '過度消費' },
      health: { upright: '身心滋養、康復佳', reversed: '需調養' },
      general: { upright: '豐盛、創造、滋養', reversed: '停滯' }
    },
    major_4: {
      love: { upright: '關係穩定、主導權', reversed: '過度控制、僵化' },
      career: { upright: '領導、秩序、升遷', reversed: '專制、權力鬥爭' },
      wealth: { upright: '穩健理財、掌控財務', reversed: '過度保守' },
      health: { upright: '規律作息、結構化管理', reversed: '忽略身體' },
      general: { upright: '權威、穩定、秩序', reversed: '僵化' }
    },
    major_5: {
      love: { upright: '傳統價值、承諾、儀式', reversed: '價值觀衝突' },
      career: { upright: '學習、師長指導、體制內發展', reversed: '抗拒傳統' },
      wealth: { upright: '保守理財、依循規則', reversed: '非傳統投資' },
      health: { upright: '依醫囑、傳統療法', reversed: '尋求非主流' },
      general: { upright: '傳統、學習、指引', reversed: '反叛' }
    },
    major_8: {
      love: { upright: '溫柔力量、耐心經營', reversed: '軟弱、缺乏自信' },
      career: { upright: '以柔克剛、毅力取勝', reversed: '放棄、失控' },
      wealth: { upright: '耐心累積、穩健成長', reversed: '衝動決策' },
      health: { upright: '內在力量、康復意志', reversed: '意志薄弱' },
      general: { upright: '內在力量、勇氣', reversed: '軟弱' }
    },
    major_9: {
      love: { upright: '獨處釐清、冷靜思考', reversed: '過度孤立' },
      career: { upright: '內省、尋求指引', reversed: '迷失方向' },
      wealth: { upright: '理性理財、低調累積', reversed: '逃避現實' },
      health: { upright: '身心調養、靜養', reversed: '忽略警訊' },
      general: { upright: '內省、智慧、獨處', reversed: '孤立' }
    },
    major_10: {
      love: { upright: '緣分轉折、關係變化', reversed: '逆勢、運氣不佳' },
      career: { upright: '時機轉換、機會來臨', reversed: '錯失良機' },
      wealth: { upright: '財運波動、轉機', reversed: '逆風' },
      health: { upright: '病情轉折、復原契機', reversed: '反覆' },
      general: { upright: '命運、循環、轉折', reversed: '逆勢' }
    },
    major_11: {
      love: { upright: '公平對待、理性選擇', reversed: '不公、失衡' },
      career: { upright: '公平競爭、法律正義', reversed: '不公義' },
      wealth: { upright: '收支平衡、合理分配', reversed: '失衡' },
      health: { upright: '尋求第二意見', reversed: '誤判' },
      general: { upright: '公正、平衡、抉擇', reversed: '不公' }
    },
    major_12: {
      love: { upright: '等待、換視角、暫緩', reversed: '拖延、逃避' },
      career: { upright: '暫時蟄伏、換角度看', reversed: '停滯不前' },
      wealth: { upright: '延遲決策、觀望', reversed: '錯失時機' },
      health: { upright: '耐心療養', reversed: '延誤治療' },
      general: { upright: '等待、換視角', reversed: '拖延' }
    },
    major_17: {
      love: { upright: '希望、信心、樂觀', reversed: '失望、悲觀' },
      career: { upright: '曙光在前、堅持', reversed: '看不到希望' },
      wealth: { upright: '財運有望、耐心等待', reversed: '信心不足' },
      health: { upright: '康復希望、積極', reversed: '消極' },
      general: { upright: '希望、靈感', reversed: '失望' }
    },
    major_18: {
      love: { upright: '直覺、潛藏情緒、曖昧', reversed: '幻覺、混亂' },
      career: { upright: '潛在變數、需釐清', reversed: '資訊不明' },
      wealth: { upright: '隱藏風險、謹慎', reversed: '盲目' },
      health: { upright: '身心連結、潛意識警訊', reversed: '忽略訊號' },
      general: { upright: '直覺、幻象、潛意識', reversed: '混亂' }
    },
    major_0: {
      love: { upright: '新戀情、勇敢告白、不設限', reversed: '衝動告白、不夠成熟' },
      career: { upright: '新職涯、創業、冒險嘗試', reversed: '缺乏規劃、魯莽決策' },
      wealth: { upright: '新投資、理財冒險', reversed: '盲目投資、風險過高' },
      health: { upright: '嘗試新療法、改變生活習慣', reversed: '忽視身體警訊' },
      general: { upright: '新的開始、冒險', reversed: '魯莽、缺乏計劃' }
    },
    major_7: {
      love: { upright: '主動追求、關係推進', reversed: '關係失控、溝通不良' },
      career: { upright: '衝刺業績、掌握主導權', reversed: '方向迷失、競爭失利' },
      wealth: { upright: '積極理財、投資獲利', reversed: '投資失利、過度冒險' },
      health: { upright: '積極治療、意志力康復', reversed: '體力透支、需放慢' },
      general: { upright: '意志力、勝利、前進', reversed: '缺乏控制、失敗' }
    },
    major_2: {
      love: { upright: '直覺、暗戀、未說出口', reversed: '秘密、壓抑情感' },
      career: { upright: '潛在機會、幕後運作', reversed: '資訊不足、決策搖擺' },
      wealth: { upright: '隱性財源、保守理財', reversed: '盲目投資、忽略風險' },
      health: { upright: '身心連結、直覺警訊', reversed: '忽視身體訊號' },
      general: { upright: '直覺、潛意識', reversed: '缺乏直覺' }
    },
    major_14: {
      love: { upright: '感情調和、耐心溝通', reversed: '爭吵、缺乏耐心' },
      career: { upright: '資源整合、協調合作', reversed: '團隊不和、過勞' },
      wealth: { upright: '收支平衡、理性消費', reversed: '揮霍或過度節省' },
      health: { upright: '養生、作息調和', reversed: '失衡、需調整' },
      general: { upright: '平衡、調和', reversed: '不平衡' }
    },
    major_20: {
      love: { upright: '關係重生、復合機會', reversed: '無法放下過去' },
      career: { upright: '職涯覺醒、轉型時機', reversed: '拒絕改變、故步自封' },
      wealth: { upright: '理財觀念重整', reversed: '重複錯誤決策' },
      health: { upright: '康復、覺醒', reversed: '延遲就醫' },
      general: { upright: '重生、覺醒', reversed: '缺乏自我覺察' }
    },
    pentacles_1: {
      love: { upright: '感情穩固、物質基礎', reversed: '經濟壓力影響感情' },
      career: { upright: '新機會、收入入帳', reversed: '機會延遲、需耐心' },
      wealth: { upright: '正財入門、理財良機', reversed: '錯失機會、謹慎為上' },
      health: { upright: '體力恢復、根基穩固', reversed: '需調養' },
      general: { upright: '新資源、實質收穫', reversed: '延遲' }
    },
    cups_1: {
      love: { upright: '新戀情、感情萌芽', reversed: '情感壓抑、需表達' },
      career: { upright: '創意靈感、人際和諧', reversed: '創意受阻' },
      wealth: { upright: '合作生財、感情投資', reversed: '人際影響財務' },
      health: { upright: '情緒療癒、心靈滋養', reversed: '情緒需關注' },
      general: { upright: '新開始、情感豐盛', reversed: '內在空虛' }
    },
    wands_1: {
      love: { upright: '主動追求、熱情萌芽', reversed: '熱情未發、需勇敢' },
      career: { upright: '新計劃、創業契機', reversed: '計劃延遲' },
      wealth: { upright: '積極開源、新財路', reversed: '衝動投資需謹慎' },
      health: { upright: '活力充沛、新鍛鍊', reversed: '體力待恢復' },
      general: { upright: '新動力、創意爆發', reversed: '動力不足' }
    },
    swords_1: {
      love: { upright: '釐清心意、坦誠溝通', reversed: '言語傷人、需謹慎' },
      career: { upright: '突破思維、決策果斷', reversed: '猶豫不決、需釐清' },
      wealth: { upright: '理性理財、切割不良', reversed: '衝動決策' },
      health: { upright: '心智清明、頭腦清晰', reversed: '思慮過度' },
      general: { upright: '真相揭曉、突破困境', reversed: '混亂、需冷靜' }
    }
  };

  function getMeaningByType(cardId, type, isReversed) {
    var override = TAROT_MEANINGS_BY_TYPE[cardId];
    if (!override) return null;
    var t = String(type || 'general').toLowerCase();
    var fallbacks = t === 'relationship' ? ['relationship', 'love', 'general'] : t === 'family' ? ['family', 'general', 'love'] : [t, 'general'];
    var typeData = null;
    for (var i = 0; i < fallbacks.length && !typeData; i++) typeData = override[fallbacks[i]] || null;
    if (!typeData) return null;
    return isReversed ? typeData.reversed : typeData.upright;
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TAROT_MEANINGS_BY_TYPE, getMeaningByType };
  } else {
    global.TAROT_MEANINGS_BY_TYPE = TAROT_MEANINGS_BY_TYPE;
    global.getTarotMeaningByType = getMeaningByType;
  }
})(typeof window !== 'undefined' ? window : this);
