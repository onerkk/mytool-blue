# 大運起運與日柱曆法架構

## 1. 起運算法（精確 + 虛歲對齊）

### 換算率
- 3 日 = 1 歲
- 1 日 = 4 月
- 1 時辰 = 10 天

### 時間差計算
1. 出生時刻與相關節氣（順行取下一節，逆行取上一節）的毫秒差
2. 轉為天數：`totalDays = diffMs / (24*60*60*1000)`
3. 採用 precise 時辰：依出生時辰內比例加入/扣除時辰折算天數
4. `solarSpanYears = totalDays / 3`

### 虛歲對齊規則
- `startAgeXuSui = Math.ceil(solarSpanYears) + 1`
- 第一柱起始年齡以虛歲顯示
- 範例：1983-08-25，距立秋約 17.4 天 → 5.8 年 → 虛歲 7 歲起運

### 輸出格式
- `solar_span_str`: "5歲8個月"
- `start_age_detail`: "5歲8個月（虛歲7歲起運）"
- 年齡區間：7–16歲、17–26歲、…

## 2. 日柱曆法模式

### 標準模式
- 基準日：1900-01-31
- `ganZhiNumber = (31 + dayDiff) % 60`

### 盲派/易兌模式（預設）
- `DAY_PILLAR_OFFSET = 10`
- `ganZhiNumber = (31 + dayDiff + 10) % 60`
- 1983-08-25 → 乙酉

### 切換方式
```javascript
window.BAZI_DAY_PILLAR_MODE = 'standard';  // 使用標準萬年曆
window.BAZI_DAY_PILLAR_OFFSET = 0;         // 或直接設偏移為 0
```

## 3. 輔助函數

```javascript
// 時間差(分鐘) → 起運字串與虛歲
DaYunCalculator.timeDeltaToQiYun(diffMinutes, useXuSui)
// 回傳: { solarSpanYears, years, months, spanStr, xuSui }
```
