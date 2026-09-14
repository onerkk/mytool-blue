# 驗證結果

已完成 2026-09-14 版本的數值、整合與瀏覽器驗證。

| 測試命令 | 結果 |
| --- | --- |
| `npm run test:western` | 11 組通過；167 組獨立星位／宮制參考、5 組回歸／次限參考 |
| `npm run test:vedic` | 14 組通過 |
| `npm run test:vedic-design` | 13 組通過 |
| `npm run test:vedic-palace` | 6 組通過 |
| `npm run test:ui` | 7 組通過，包含新增第十個入口的實際路由 |
| `npm run test:output-consistency` | 9 組通過，涵蓋八字、紫微、梅花、塔羅與停止的開鑰資料一致性 |

整合時發現主目錄與 `JS/` 內有兩份 Service Worker；本輪已同步兩份為 v82。原首頁測試只預期九個入口，已加入西洋入口及對應呼叫驗證，改為十個入口。不是移除這些測試。

瀏覽器使用 Chromium，390 × 844 行動尺寸與觸控事件，另驗證 1440 × 1000 桌面尺寸。這是瀏覽器模擬與軟體 WebGL，沒有聲稱在實體 Android／iPhone 上量過幀率。

通過項目：自訂日期／時間選擇、台南城市搜尋與選取、3D 葉片展開及鏡頭流程、觸控轉動、四個分頁、星體／宮位互動、提示詞複製、動畫前後命盤相同、取消與略過、WebGL context loss 後靜態恢復、減少動態、時間不詳、頁面捲動、返回與印度占星城市選單。

頁面 JavaScript 錯誤為 0；西洋新增資產缺失為 0。原首頁仍有三個既有分享背景圖路徑 404（`share-bg-tarot.png`、`share-bg-ootk.png`、`share-bg-general.png`）；它們不是本輪引入，故未寫成全站零缺圖。

星穹場景檢查：12 個星座銘牌、10 顆定位星飾、8 片機械葉片，正常實際 WebGL 路徑及失效回復皆通過。首輪畫面檢視後降低金屬過曝，將面盤材質保留深藍原色，並新增可點選的行星按鈕列。

機器結果見同目錄 `western-numerical-results.json` 及 `western-browser-results.json`。最終版本過场另有約 12 秒實際瀏覽器畫面記錄用於檢查，未將該軟體渲染速度當成裝置效能保證。
