# 大運流年精確計算架構

本專案依「大運流年精確計算架構」實作，模組與資料流如下。

## 核心模組

### 1. 真太陽時處理系統 `TrueSolarTimeCalculator`（`js/true-solar-time.js`）

- **地方平太陽時**：LMT = UTC + λ/15（λ 經度，小時）；台南 120.2°E → 8.013h。
- **時差方程**：E = 9.87·sin(2B) − 7.53·cos(B) − 1.5·sin(B)，B = 360°(N−81)/365，N 日序。
- **真太陽時**：真太陽時 = LMT + E（E 分鐘→小時）；八字排盤、起運計算以出生地真太陽時為準。
- **API**：`trueSolarTime(localDate, longitude, zoneOffsetHours)`、`equationOfTimeMinutes(date)`、`longitudeToHourOffset(longitude)`、`adjustSolarTermTime(utcDate, longitude)`（節氣 UTC→地方真太陽時）。

### 2. 節氣計算系統 `SolarTermCalculator`（`js/solar-term-calculator.js`）

- **十二節**（大運起運用）：只用 12「節」，不用中氣。順數至**下一個節**、逆數至**上一個節**（例：1983/8/25 逆行取 立秋 8/8 4:42，相隔約 17.4 天 → 17.4÷3 ≈ 5.8 歲，即約 5 歲 10 個月起運；絕不用處暑）。
- **API**：
  - `getTermsForYear(year)` → `{ name, date, utc? }[]` 依時間排序；同年 **TERM_DB 優先**（本地），僅 12 節。
  - `getTermDateTime(year, termName)` → `Date | null`
  - `getNearestSolarTerms(dateTime, direction)` → 前/後最近節氣；**跨年**：1 月逆行納入前一年、12 月順行納入次年。
  - `loadFromJson(obj)` 載入 `{ "年": { "節名": "YYYY-MM-DDTHH:mm:ssZ" } }` 格式。
  - `registerYear(year, entry)` 註冊某年節氣（TERM_DB）。
- **節氣資料**：`js/solar-terms-data.js` 提供 `SOLAR_TERMS_JSON`（1900、1982、1983 範例）；可擴充至 1900–2100。

### 3. 八字排盤核心 `BaziCalculator`（`js/bazi-system.js`）

- 年柱（立春為界）、月柱（節氣）、日柱、時柱、真太陽時校正。
- 大運計算優先委派給 `DaYunCalculator`；若不適用則走內建 `_calculateGreatFortuneLegacy`。

### 4. 大運計算引擎 `DaYunCalculator`（`js/dayun-calculator.js`）

- **起運歲數**（依架構**真實換算**，每人不同）：
  - 陽男陰女**順行**：順數至**下一個節**；陰男陽女**逆行**：逆數至**上一個節**（只用 12 節，不用中氣如處暑）；時間差精確到分鐘，除以 3 得歲數。
  - 換算：**天數 ÷ 3 = 起運歲**，**1 日 = 4 月**；可選時辰 precise、節氣 UTC→真太陽時（見 opts）。
  - **大運干支**：順/逆排皆從六十甲子取，不可出現無效組合（如 丙未）；從月柱順推或逆推一組為第一步。
- **第一步大運**：從 **floor(起運歲數)** 起，每步 10 年；起運 &lt; 3 天則 0 歲起。
- **真太陽時**：`opts: { longitude, zoneOffsetHours }` 時先轉真太陽時再算起運。
- **大運順逆**：年干陰陽 + 性別。
- **大運干支**：順排從月柱下一組、逆排從月柱上一組（六十甲子）；起運節氣存第一步 `solar_term`。
- **交接**：每步 10 年；`year_start` / `year_end` = 出生年 + 起運年齡 + 步數×10。
- **輸出**：
  - `dayunList.cycles[]` 每個 `DaYun`：`index`, `ganzhi`, `age_start`, `age_end`, `year_start`, `year_end`, `is_current`, `solar_term`。
  - `dayunList`：`start_age`, `start_age_detail`, `direction`, `cycles`。
  - 相容舊版 `greatFortune`：`fortunes`, `direction`, `startAge`, `exactStartAge`, `currentFortune` 等。

### 5. 流年計算模組 `LiuNianCalculator`（`js/liunian-calculator.js`）

- **流年**：`getYearGanZhi(year)` 逐年干支（簡化依公曆年）。
- **流月**：`getMonthGanZhi(year, month)` 五虎遁月、寅月=正月。
- **流日**：`getDayGanZhi(year, month, day)` 儒略日→六十甲子。
- **流時**：`getHourGanZhi(dayGan, hour)`、`getDayHourGanZhiList(dayGan)` 日上起時（五鼠遁）。

## 資料流

1. **輸入**：出生時間（公曆）、性別、四柱（來自 `BaziCalculator`）；可選真太陽時（經度）。
2. **節氣定位**：`SolarTermCalculator` 找前/後節，天數差 ÷3 → 起運歲月；每人不同。
3. **大運排列**：第一步從 floor(起運歲數) 起，每 10 年；順/逆排干支。
4. **輸出**：`greatFortune`（`fortunes`、`dayunList`）供 `renderDayun` 與分析使用。

## 特殊情況

- **起運 &lt; 3 天**：視為 0 歲起運，第一步大運 0–9。
- **節氣邊界**：以交節時刻為準；若僅日級資料則 0:00。1983 立秋 8/8 09:30 等見 TERM_DB。
- **無節氣資料年份**：回退為預設起運（5 歲 0 個月）與月柱順/逆排。

## 時辰系統 `ShiChenSystem` / `ShiChenConverter`（`js/shichen-system.js`）

- **時辰定義**：子 23–01、丑 1–3 … 亥 21–23（`SHICHEN_DEFINITION`、`SHICHEN_NAMES`）。
- **換算**：`getShiChenFromTime(hour, minute)` → `{ name, index, minutesInShiChen }`；`shiChenToDays(name, minutesInShiChen, method)`：
  - `standard`：每時辰固定 10 天（可依序號擴充）。
  - `precise`：時辰內比例 `(x/120)×10` 天。
  - `ziwei`：紫微流派係數，每時辰 9.6 天比例。

## 腳本載入順序

```
true-solar-time.js → solar-terms-data.js → solar-term-calculator.js → shichen-system.js → dayun-calculator.js → liunian-calculator.js → bazi-system.js → quality-mapper.js → main.js
```

## 擴充節氣資料

- **TERM_DB**：`[年][節名] = [月, 日, 時, 分]` 或 `registerYear`；同年優先於 JSON。
- **JSON**：`loadFromJson` 或 `SOLAR_TERMS_JSON`，格式 `{ "年": { "節名": "YYYY-MM-DDTHH:mm:ssZ" } }`（UTC）。可對接 1900–2100 精確節氣。

## 若需更精確排盤可提供的資料

- **節氣時刻表**：1900–2100、精確到秒（如 NASA JPL / 壽星萬年曆），擴充 `SOLAR_TERMS_JSON` 或 `loadFromJson`。
- **跨年節氣**：已支援 1 月逆行納入前一年、12 月順行納入次年。
- **真太陽時**：已實作；起運時若有經度，節氣 UTC 會經 `adjustSolarTermTime` 轉為地方真太陽時。
- **時辰換算**：`shichen-system` 與 `computeStartAge` 的 `opts.shiChenMethod`（`precise` / `standard`）可選用。
