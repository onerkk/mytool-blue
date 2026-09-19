# 八字與紫微斗數合盤更新 — 2026-09-19

此更新包僅包含新增與變更檔案。請解壓縮至原網站根目錄，依原路徑覆蓋；保留原有圖片、vendor 與其他未變更檔案。根目錄的三份 JS 副本已與 JS/ 版本同步，Service Worker 已更新為 v87。無須新增執行期套件。

## 排盤政策與資料

| 紫微政策 | 本站預設 |
| --- | --- |
| yearDivide / horoscopeDivide / ageDivide | normal：農曆正月初一換年與增虛歲 |
| dayDivide | current：23:00–23:59 屬民用當日，00:00 換日 |
| fixLeap | false：閏月整月沿用本月 |
| algorithm | default 安星框架，加上明列的本站覆蓋政策 |
| trueSolarTime | false：使用原始民用出生時分 |

本站為本地 iztro 型安星框架；上述 dayDivide、fixLeap 預設不同於 iztro 的 forward、true。單盤既有的 23 時換日與閏月十五日拆分選項仍可選，實際設定會隨盤送出。本站 23 時選項先推進完整民用日期，不宣稱跨月跨年時與 iztro forward 的所有細節等同。矛盾或未支援的政策會停止排盤。

- 出生日期、原始時分、時辰、代表時分開保存。14:55 不再被代表時 14:00 覆寫；只有時辰的資料不補造精確分鐘。
- 雙系統合盤的紫微固定採上表；八字仍依出生地校正真太陽時，保留所選八字換日政策。兩套資料分別標示。
- `calculatedFacts` 保存宮位、星曜、三方四正、四化來源與運限；`heuristics`、`candidateInterpretation` 分開。紫微單盤及綜合匯出的 AI 資料移除前端吉凶分數、等級與主題結論。
- 四化區分生年、宮干、大限、流年及跨盤來源；來因宮限定欽天體系。保留動態三方四正索引。
- 提示詞禁止從星曜／干支換算性伴侶、婚姻、子女、外遇次數，包括「不只一個」「很多個」等數量結論。

## 雙系統合盤

新增 JS/relationship-core.js、JS/relationship-ui.js 與 CSS/relationship.css。八種關係情境各有主宮與角色焦點；兩張紫微盤獨立起盤，提供十二宮同支對照、雙向生年干與情境主宮宮干映射、現行及未來三個農曆年度的各自大限／流年。每年重新選取適用大限，保留正月初一與八字立春邊界。

跨盤四化是明列的本站飛星合參口徑，不是 iztro 官方合盤 API 或各派共同算法；不改寫受方本命四化，不算契合率，不從引動直接認定對方心意或事件。時辰未知的一方不排紫微盤、不產生雙向紫微對照，八字僅使用已知三柱。

合盤提示詞同時包含兩人的八字、紫微及逐層比較規則，要求逐題回答、雙向說明、處理矛盾、交代時間條件及可執行的相處方法。文字提示詞精簡重複運限；JSON 保留完整計算資料。沿用網站原有的「複製提示詞至 AI」解讀流程。

甲乙介面改為紫晶／冰藍雙星儀、雕刻金屬環、切面寶石、立體底座與銘牌，支援點亮狀態、鍵盤焦點、減少動態效果與手機排版。表單、結果、入口名稱、分享卡同步更新。

## 驗證

- 160 張 iztro 2.5.8 固定對照盤：18,560 項比對通過。
- 1983-08-25 14:55 參考盤；1994-06-20 23:26 晚子時；14:59／15:01、22:59／23:01、午夜、閏月十五／十六日、農曆新年邊界。
- 合盤政策 10 組、核心引擎 10 組、輸出一致性 9 組、儀式生命週期 25 組、八字套件 21 組、分享卡 10 組及紫微提示詞規格測試通過。
- Chromium 138 獨立整合頁驗證：393px 手機點亮流程，320／360／1440px 排版無橫向溢出，取消、重新計算、未知時辰、JSON 下載、出生分鐘與時辰同步均通過，無頁面 JavaScript 錯誤。
- 瀏覽器驗證使用實際功能模組與樣式；原專案鎖網域模組未載入測試頁，也未修改其保護。未部署正式網站，未測試外部 AI 的實際回答或手機原生分享服務。

可重跑：

```sh
npm run test:relationship
npm run test:ziwei
npm run test:core-engines
npm run test:output-consistency
node tests/engine-fixes-20260912.cjs
node tests/ritual-lifecycle-20260911.cjs
node tests/bazi-suite-regression.cjs
node tests/share-card-20260911.cjs
```

計算一致性測試不等於事件預測的驗證。

政策來源：[iztro astro.ts](https://github.com/SylarLong/iztro/blob/main/src/astro/astro.ts)、[安星 location.ts](https://github.com/SylarLong/iztro/blob/main/src/star/location.ts)、[安星規則](https://iztro.com/zh_TW/learn/setup)。
