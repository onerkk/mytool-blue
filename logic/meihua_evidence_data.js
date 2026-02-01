/**
 * 梅花易數證據資料：單一卦象（水地比）的 intent_text + slotTags / timeTags
 * 供 EvidenceNormalizer 產出 supports / timeTags 對齊問句的 mustAnswer 與 timeHorizon
 */
(function (global) {
  'use strict';

  /** 水地比：示範用卦象，依意圖分段的文案與標籤 */
  var MEIHUA_INTENT_EVIDENCE = {
    /** 卦名 → 依 intent 的文案陣列，每段含 slotTags、timeTags */
    '水地比': {
      wealth: [
        { text: '本卦水地比，體用比和，卦象利財。本月營收有機會達標，宜穩健鋪陳再衝量。', slotTags: ['營收', '破萬', '業績', '訂單', '銷售', '副業'], timeTags: ['this_month', 'this_week'] },
        { text: '變卦水地比，象徵聚集與合作。副業／銷售本月能否破萬，需看投放與成本控制。', slotTags: ['破萬', '副業', '銷售', '投放', '成本'], timeTags: ['this_month'] },
        { text: '體用比和，財運平穩。收入破萬、業績達標需結合時機與執行力。', slotTags: ['破萬', '收入', '業績', '達標'], timeTags: ['this_month', '1_year'] }
      ],
      love: [
        { text: '本卦水地比，卦象利感情，體用比和。緣分可期，宜把握時機表達。', slotTags: ['感情', '緣分', '復合', '告白'], timeTags: ['this_month', 'this_week'] },
        { text: '水地比象徵親附與和諧，感情發展偏向穩定，可真誠溝通。', slotTags: ['感情', '發展', '溝通'], timeTags: ['this_month'] }
      ],
      career: [
        { text: '本卦水地比，卦象利事業，體用比和。工作與合作可積極爭取，留意時機。', slotTags: ['工作', '事業', '升遷', '合作', '面試'], timeTags: ['this_month', 'this_week'] },
        { text: '變卦比和，職涯發展平穩。訂單、客戶與專案需穩紮穩打。', slotTags: ['訂單', '客戶', '專案', '業績'], timeTags: ['this_month'] }
      ],
      health: [
        { text: '水地比卦象平穩，健康宜規律調養，留意身心平衡。', slotTags: ['健康', '身體', '調養'], timeTags: ['this_month', '1_year'] }
      ],
      relationship: [
        { text: '卦象利人際，體用比和。貴人與同事關係可望和諧，宜真誠溝通。', slotTags: ['人際', '貴人', '同事', '溝通'], timeTags: ['this_week', 'this_month'] }
      ],
      general: [
        { text: '本卦水地比，體用比和，卦象尚可，順勢而為。', slotTags: [], timeTags: ['this_month'] }
      ]
    },
    /** 坤為地：常用卦，補一組 wealth / 本月 */
    '坤為地': {
      wealth: [
        { text: '坤為地卦象厚載，本月營收與業績宜穩健經營，破萬需時機與執行。', slotTags: ['營收', '業績', '破萬', '本月'], timeTags: ['this_month'] }
      ],
      love: [
        { text: '坤為地象徵包容，感情宜傾聽與包容，順勢發展。', slotTags: ['感情', '緣分'], timeTags: ['this_month'] }
      ],
      career: [
        { text: '坤卦利穩健，事業與工作宜穩紮穩打，留意訂單與客戶。', slotTags: ['事業', '工作', '訂單', '客戶'], timeTags: ['this_month'] }
      ],
      health: [{ text: '坤卦平穩，健康宜規律調養。', slotTags: ['健康'], timeTags: ['this_month'] }],
      relationship: [{ text: '坤卦利人際和諧，宜真誠溝通。', slotTags: ['人際'], timeTags: ['this_week'] }],
      general: [{ text: '坤為地，卦象平穩，順勢而為。', slotTags: [], timeTags: ['this_month'] }]
    }
  };

  /**
   * 依卦名與 intent 取得證據段落（含 slotTags、timeTags）
   * @param {string} guaName - 卦名（如 水地比、坤為地）
   * @param {string} intent - love|money|career|health|relationship|other
   * @returns {Array<{text, slotTags, timeTags}>}
   */
  function getMeihuaIntentTexts(guaName, intent) {
    var key = String(guaName || '').replace(/為|卦/g, '').trim() || '水地比';
    var map = MEIHUA_INTENT_EVIDENCE[key] || MEIHUA_INTENT_EVIDENCE['水地比'];
    var intentKey = intent === 'money' ? 'wealth' : (intent || 'general');
    return map[intentKey] || map.general || [];
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MEIHUA_INTENT_EVIDENCE: MEIHUA_INTENT_EVIDENCE, getMeihuaIntentTexts: getMeihuaIntentTexts };
  } else {
    global.MeihuaEvidenceData = {
      MEIHUA_INTENT_EVIDENCE: MEIHUA_INTENT_EVIDENCE,
      getMeihuaIntentTexts: getMeihuaIntentTexts
    };
  }
})(typeof window !== 'undefined' ? window : this);
