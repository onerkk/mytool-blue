# 通用八字吉凶判斷引擎

## 架構

| 模組 | 函數 | 說明 |
|------|------|------|
| Module 1 | `calculateBodyStrength(chart)` | 旺衰計算：得令 40% + 得地 30% + 得勢 30% |
| Module 2 | `getElementPreferences(strength, dayMasterElement)` | 喜忌神動態選擇：五行偏好分數 -20 ~ +20 |
| Module 3 & 4 | `evaluatePillar(pillar, preferences)` | 吉凶量化：`Score = Stem*0.4 + Branch*0.6` → 判語 |

## 輸入格式

```javascript
var chart = {
  year: { gan: '癸', zhi: '亥' },
  month: { gan: '庚', zhi: '申' },
  day:  { gan: '乙', zhi: '酉' },
  hour: { gan: '癸', zhi: '未' }
};
```

## 使用範例

```javascript
// 1. 計算身強弱
var bs = FortuneJudgmentEngine.calculateBodyStrength(chart);
// => { strength: 'Weak', score: 35, breakdown: { deLing: 0, deDi: 15, deShi: 20 } }

// 2. 取得五行偏好
var prefs = FortuneJudgmentEngine.getElementPreferences(bs.strength, '木');
// => { 木: 10, 火: -5, 土: -10, 金: -20, 水: 20 }

// 3. 評估大運／流年柱
var result = FortuneJudgmentEngine.evaluatePillar({ gan: '庚', zhi: '申' }, prefs);
// => { score: -20, judgment: '大凶', color: 'red' }

// 便捷：一步到位
var out = FortuneJudgmentEngine.evaluatePillarFromChart(chart, { gan: '乙', zhi: '卯' });
// => { score: 16, judgment: '大吉', color: 'green', strength: 'Weak', preferences: {...} }
```

## 吉凶對照表

| 分數範圍 | 判語 | 顏色 |
|----------|------|------|
| > +12 | 大吉 | green |
| +1 ~ +12 | 吉 | teal |
| -5 ~ 0 | 平 | gray |
| -12 ~ -6 | 凶 | orange |
| < -12 | 大凶 | red |

## 驗證範例（規格書）

- **案例**：身弱乙木，目標庚申（金金）
- **邏輯**：金為官殺（忌神主），分數 -20
- **計算**：(-20 × 0.4) + (-20 × 0.6) = -20
- **結果**：大凶 ✓
