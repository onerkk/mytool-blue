/**
 * 凱爾特十字 10 位置定義 - 依類型有關注點與權重
 * 供 tarot-golden-dawn-system 與 fusionEngine 使用
 */
(function (global) {
  'use strict';

  var CELTIC_POSITIONS = {
    1: {
      name: '核心現況',
      meaning: '當前問題的核心與現狀',
      weight: 0.15,
      focusByType: {
        love: '關係現狀、彼此心意',
        career: '工作現況、職場定位',
        wealth: '財務現狀、收入結構',
        health: '身體狀態、主要不適',
        general: '整體狀態、當下課題',
        relationship: '人際現況、互動模式',
        family: '家庭氛圍、成員關係',
        other: '問題核心'
      }
    },
    2: {
      name: '橫跨的挑戰',
      meaning: '阻礙或助力（主要影響）',
      weight: 0.12,
      focusByType: {
        love: '感情阻礙、溝通障礙',
        career: '職場挑戰、競爭或瓶頸',
        wealth: '理財障礙、開銷壓力',
        health: '病痛來源、惡化因素',
        general: '主要阻力或助力',
        relationship: '人際障礙、誤解來源',
        family: '家庭衝突、溝通困難',
        other: '主要影響'
      }
    },
    3: {
      name: '潛意識根源',
      meaning: '深層動機、潛藏因素',
      weight: 0.08,
      focusByType: {
        love: '內心渴望、隱藏恐懼',
        career: '職涯動機、未說出口的期待',
        wealth: '金錢觀、匱乏或豐盛信念',
        health: '身心連結、情緒影響',
        general: '潛意識驅力',
        relationship: '內在需求、投射',
        family: '原生影響、未解心結',
        other: '深層因素'
      }
    },
    4: {
      name: '過去',
      meaning: '近期過去的關鍵影響',
      weight: 0.06,
      focusByType: {
        love: '過去戀情、舊有模式',
        career: '過往決策、累積經驗',
        wealth: '過往理財、投資歷史',
        health: '病史、生活習慣',
        general: '近期關鍵事件',
        relationship: '過去人際經驗',
        family: '過往家庭事件',
        other: '過去影響'
      }
    },
    5: {
      name: '顯意識目標',
      meaning: '理想、期待、目標',
      weight: 0.08,
      focusByType: {
        love: '理想伴侶、關係期待',
        career: '職涯目標、成就渴望',
        wealth: '財務目標、理想生活',
        health: '健康目標、恢復期待',
        general: '顯意識目標',
        relationship: '人際期待、合作願景',
        family: '家庭願景、和諧期待',
        other: '顯意識目標'
      }
    },
    6: {
      name: '未來',
      meaning: '短期趨勢與走向',
      weight: 0.12,
      focusByType: {
        love: '關係發展、短期走向',
        career: '工作趨勢、近期機會',
        wealth: '短期財運、收入走向',
        health: '恢復趨勢、短期預後',
        general: '短期運勢',
        relationship: '人際發展',
        family: '家庭走向',
        other: '短期趨勢'
      }
    },
    7: {
      name: '自我',
      meaning: '你目前的態度與策略',
      weight: 0.10,
      focusByType: {
        love: '你在關係中的姿態',
        career: '工作態度、應對方式',
        wealth: '理財態度、風險偏好',
        health: '自我照顧、就醫態度',
        general: '個人態度與策略',
        relationship: '人際應對方式',
        family: '在家庭中的角色',
        other: '自我態度'
      }
    },
    8: {
      name: '環境/他人',
      meaning: '外在環境與他人因素',
      weight: 0.08,
      focusByType: {
        love: '對方態度、第三者影響',
        career: '上司同事、市場環境',
        wealth: '合作方、經濟環境',
        health: '醫療資源、身邊支持',
        general: '外在環境',
        relationship: '他人看法、社會氛圍',
        family: '家人態度、外在壓力',
        other: '環境與他人'
      }
    },
    9: {
      name: '希望/恐懼',
      meaning: '內在期待與擔憂',
      weight: 0.06,
      focusByType: {
        love: '對關係的期待與恐懼',
        career: '對成功的期待與焦慮',
        wealth: '對金錢的期待與不安',
        health: '對康復的期待與恐懼',
        general: '希望與恐懼',
        relationship: '人際期待與擔憂',
        family: '家庭期待與擔憂',
        other: '希望與恐懼'
      }
    },
    10: {
      name: '最終結果',
      meaning: '整體落點與結果傾向',
      weight: 0.25,
      focusByType: {
        love: '關係結果、感情歸宿',
        career: '事業結果、職涯落點',
        wealth: '財務結果、財富累積',
        health: '健康結果、恢復程度',
        general: '整體結果傾向',
        relationship: '人際結果',
        family: '家庭結果',
        other: '最終結果'
      }
    }
  };

  function getPosition(posNum, questionType) {
    var p = CELTIC_POSITIONS[posNum];
    if (!p) return null;
    var type = (questionType || 'general').toLowerCase();
    var focus = p.focusByType && p.focusByType[type] ? p.focusByType[type] : p.meaning;
    return { name: p.name, meaning: p.meaning, weight: p.weight, focus: focus };
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CELTIC_POSITIONS, getPosition };
  } else {
    global.CELTIC_POSITIONS = CELTIC_POSITIONS;
    global.getCelticPosition = getPosition;
  }
})(typeof window !== 'undefined' ? window : this);
