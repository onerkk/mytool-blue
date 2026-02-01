/**
 * 象徵 → 行為校準關鍵字 → 五行對應
 * (塔羅 + 梅花 + 紫微) → 行為關鍵字 → 與八字喜忌交叉驗證 → 多維度最適合推薦
 * 注意：非「五行缺什麼補什麼」，而是依據多維度命理象徵綜合搭配
 */
(function (global) {
  'use strict';

  /** 塔羅牌象徵 → 行為校準關鍵字 */
  var TAROT_TO_BEHAVIOR = {
    '死神': ['轉型', '放下', '重生'],
    '塔': ['突變', '覺醒', '突破'],
    '惡魔': ['界線', '斷捨離', '防內耗'],
    '倒吊人': ['等待', '換視角', '延遲決策'],
    '隱者': ['內省', '聚焦', '獨處'],
    '戰車': ['行動力', '衝刺', '堅持'],
    '愚者': ['冒險', '不設限', '新開始'],
    '魔術師': ['創造', '執行', '專注'],
    '節制': ['平衡', '調和', '耐心'],
    '月亮': ['直覺', '釐清幻象', '防內耗'],
    '戀人': ['選擇', '溝通', '價值觀'],
    '太陽': ['正向', '活力', '自信'],
    '世界': ['完成', '整合', '圓滿']
  };

  /** 梅花卦象 → 行為校準關鍵字 */
  var MEIHUA_TO_BEHAVIOR = {
    '乾': ['主動', '剛健', '領導'], '天': ['主動', '剛健'],
    '坤': ['包容', '穩定', '承接'], '地': ['包容', '穩定'],
    '坎': ['謹慎', '行險', '突破困境'], '水': ['流動', '智慧'],
    '離': ['光明', '依附', '熱情'], '火': ['熱情', '行動'],
    '震': ['行動', '果決', '突破'], '雷': ['行動', '突破'],
    '艮': ['止步', '沉潛', '界線'], '山': ['止步', '沉潛'],
    '巽': ['順勢', '柔進', '溝通'], '風': ['順勢', '柔進'],
    '兌': ['喜悅', '表達', '和諧'], '澤': ['喜悅', '溝通'],
    '困': ['耐心', '釐清', '防內耗'],
    '革': ['轉型', '改變', '突破'],
    '謙': ['低調', '內斂', '累積'],
    '泰': ['順暢', '把握', '行動'],
    '履': ['謹慎', '如履薄冰'],
    '晉': ['求進', '發展'],
    '咸': ['交感', '感應'],
    '家人': ['齊家', '和諧']
  };

  /** 紫微宮位／星曜 → 五行傾向（用於多維度綜合推薦） */
  var ZIWEI_TO_ELEMENT = {
    '財帛': '水', '官祿': '火', '夫妻': '水', '命宮': '土', '遷移': '金',
    '疾厄': '土', '子女': '水', '田宅': '土', '父母': '金', '福德': '火', '兄弟': '木', '僕役': '金',
    '紫微': '土', '天府': '土', '武曲': '金', '天同': '水', '廉貞': '火', '七殺': '金',
    '破軍': '水', '貪狼': '木', '太陽': '火', '巨門': '水', '天機': '木', '太陰': '水',
    '天梁': '土', '天相': '水'
  };

  /** 行為關鍵字 → 五行傾向（用於與喜忌校準） */
  var BEHAVIOR_TO_ELEMENT = {
    '行動力': '火', '衝刺': '火', '熱情': '火', '冒險': '火', '正向': '火', '活力': '火', '自信': '火', '光明': '火', '依附': '火',
    '內省': '水', '直覺': '水', '等待': '水', '流動': '水', '溝通': '水', '智慧': '水', '釐清幻象': '水', '釐清': '水',
    '聚焦': '木', '成長': '木', '創造': '木', '突破': '木', '主動': '木', '剛健': '木', '領導': '木', '果決': '木', '突破困境': '木', '求進': '木', '發展': '木',
    '穩定': '土', '包容': '土', '耐心': '土', '累積': '土', '完成': '土', '承接': '土', '調和': '土', '平衡': '土', '低調': '土', '內斂': '土', '整合': '土', '圓滿': '土', '齊家': '土', '和諧': '土',
    '界線': '金', '斷捨離': '金', '斬煞': '金', '防內耗': '金', '止步': '金', '沉潛': '金',
    '轉型': '水', '放下': '水', '重生': '水', '覺醒': '水', '順勢': '土', '柔進': '土', '喜悅': '火', '表達': '火', '交感': '火', '感應': '火'
  };

  function extractBehaviorsFromTarot(tarotResult) {
    var out = [];
    if (!tarotResult || !tarotResult.analysis || !tarotResult.analysis.positions) return out;
    var positions = tarotResult.analysis.positions;
    for (var i = 0; i < positions.length; i++) {
      var p = positions[i];
      var raw = (p.card || p.cardName || '') + '';
      var name = raw.replace(/\s*\([^)]*\)/g, '').trim();
      var cardName = name.split(/\s/)[0] || name;
      for (var k in TAROT_TO_BEHAVIOR) {
        if (cardName.indexOf(k) >= 0 || raw.indexOf(k) >= 0) {
          out = out.concat(TAROT_TO_BEHAVIOR[k]);
        }
      }
    }
    return out;
  }

  function extractBehaviorsFromMeihua(meihuaResult) {
    var out = [];
    if (!meihuaResult) return out;
    var benGua = meihuaResult.benGua;
    var bianGua = meihuaResult.bianGua || meihuaResult.changed;
    var benName = (typeof benGua === 'object' && benGua && benGua.name) ? benGua.name : String(meihuaResult.hexagramName || meihuaResult.name || '');
    var bianName = (typeof bianGua === 'object' && bianGua && bianGua.name) ? bianGua.name : '';
    var fullName = benName + (bianName ? ' ' + bianName : '');
    for (var k in MEIHUA_TO_BEHAVIOR) {
      if (fullName.indexOf(k) >= 0) out = out.concat(MEIHUA_TO_BEHAVIOR[k]);
    }
    return out;
  }

  function extractElementsFromZiwei(ziweiResult) {
    var elements = [];
    if (!ziweiResult || !ziweiResult.palaces) return elements;
    var catToPalace = { finance: '財帛', career: '官祿', relationship: '夫妻', love: '夫妻', health: '疾厄', family: '田宅', general: '命宮' };
    var palaces = ziweiResult.palaces;
    for (var i = 0; i < palaces.length; i++) {
      var p = palaces[i];
      var name = (p.name || '') + '';
      var el = ZIWEI_TO_ELEMENT[name];
      if (el) elements.push(el);
      var majors = p.majorStars || [];
      for (var j = 0; j < majors.length; j++) {
        var starName = (majors[j].name || '') + '';
        var starEl = ZIWEI_TO_ELEMENT[starName];
        if (starEl) elements.push(starEl);
      }
    }
    return elements;
  }

  /**
   * 彙總多維度象徵的元素建議（非單純五行缺補，而是綜合八字／梅花／塔羅／紫微）
   * @returns {{ bazi: string[], tarot: string[], meihua: string[], ziwei: string[], combined: string[], sources: string[] }}
   */
  function getMultiDimensionElements(tarotResult, meihuaResult, ziweiResult, favorableElements, questionType) {
    var baziEl = [];
    var fav = Array.isArray(favorableElements) ? favorableElements : (favorableElements ? [favorableElements] : []);
    if (fav.length) baziEl = fav.slice(0, 3);

    var tarotBehaviors = extractBehaviorsFromTarot(tarotResult);
    var tarotEl = [];
    for (var i = 0; i < tarotBehaviors.length; i++) {
      var el = BEHAVIOR_TO_ELEMENT[tarotBehaviors[i]];
      if (el) tarotEl.push(el);
    }

    var meihuaBehaviors = extractBehaviorsFromMeihua(meihuaResult);
    var meihuaEl = [];
    for (var j = 0; j < meihuaBehaviors.length; j++) {
      var me = BEHAVIOR_TO_ELEMENT[meihuaBehaviors[j]];
      if (me) meihuaEl.push(me);
    }

    var ziweiEl = extractElementsFromZiwei(ziweiResult);

    var catToPalace = { finance: '財帛', career: '官祿', relationship: '夫妻', love: '夫妻', health: '疾厄', family: '田宅' };
    var focusPalace = catToPalace[questionType || ''];
    if (focusPalace && ziweiResult && ziweiResult.palaces) {
      var palace = ziweiResult.palaces.filter(function (p) { return p.name === focusPalace; })[0];
      if (palace) {
        var pel = ZIWEI_TO_ELEMENT[focusPalace];
        if (pel) ziweiEl.unshift(pel);
      }
    }

    var vote = {};
    ['bazi', 'tarot', 'meihua', 'ziwei'].forEach(function (src) {
      var arr = src === 'bazi' ? baziEl : (src === 'tarot' ? tarotEl : (src === 'meihua' ? meihuaEl : ziweiEl));
      arr.forEach(function (e) { vote[e] = (vote[e] || 0) + 1; });
    });
    var combined = Object.keys(vote).sort(function (a, b) { return (vote[b] || 0) - (vote[a] || 0); });
    if (combined.length === 0 && baziEl.length) combined = baziEl;

    var sources = [];
    if (baziEl.length) sources.push('八字');
    if (tarotEl.length) sources.push('塔羅');
    if (meihuaEl.length) sources.push('梅花易數');
    if (ziweiEl.length) sources.push('紫微斗數');

    return { bazi: baziEl, tarot: tarotEl, meihua: meihuaEl, ziwei: ziweiEl, combined: combined, vote: vote, sources: sources };
  }

  /**
   * 彙總行為關鍵字，並回傳與喜用神相符的優先關鍵字
   */
  function getBehaviorKeywords(tarotResult, meihuaResult, favorableElements) {
    var all = [];
    all = all.concat(extractBehaviorsFromTarot(tarotResult));
    all = all.concat(extractBehaviorsFromMeihua(meihuaResult));
    var fav = Array.isArray(favorableElements) ? favorableElements : (favorableElements ? [favorableElements] : []);
    var unique = [];
    var seen = {};
    for (var i = 0; i < all.length; i++) {
      if (!seen[all[i]]) {
        seen[all[i]] = true;
        unique.push(all[i]);
      }
    }
    var withFav = [];
    var withoutFav = [];
    for (var j = 0; j < unique.length; j++) {
      var el = BEHAVIOR_TO_ELEMENT[unique[j]];
      if (el && fav.indexOf(el) >= 0) withFav.push(unique[j]);
      else withoutFav.push(unique[j]);
    }
    return { all: unique, favored: withFav, other: withoutFav };
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TAROT_TO_BEHAVIOR, MEIHUA_TO_BEHAVIOR, getBehaviorKeywords, getMultiDimensionElements };
  } else {
    global.CrystalBehaviorMap = {
      getBehaviorKeywords: getBehaviorKeywords,
      getMultiDimensionElements: getMultiDimensionElements
    };
  }
})(typeof window !== 'undefined' ? window : this);
