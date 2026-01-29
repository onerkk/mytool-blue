/**
 * 方法選擇器
 * 依問題類型與分類，選擇合適的命理方法。
 * 八字：時間趨勢；姓名學：個人特質；梅花易數：具體事件；塔羅：短期預測。
 */
(function (global) {
  'use strict';

  /**
   * 依解析結果選擇要使用的方法
   * @param {Object} parsed - parseQuestion 的輸出
   * @returns {Object} { bazi, nameology, meihua, tarot }
   */
  function selectMethods(parsed) {
    var cat = (parsed && parsed.category) ? parsed.category : 'general';
    var bazi = true;
    var nameology = true;
    var meihua = true;
    var tarot = true;

    switch (cat) {
      case 'finance':
      case 'career':
      case 'relationship':
        break;
      case 'health':
        nameology = false;
        break;
      default:
        break;
    }

    return { bazi: !!bazi, nameology: !!nameology, meihua: !!meihua, tarot: !!tarot };
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { selectMethods: selectMethods };
  } else {
    global.selectMethods = selectMethods;
  }
})(typeof window !== 'undefined' ? window : this);
