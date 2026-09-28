靜月之光｜命理儀式手機按鈕顯示修復

修復範圍
- 所有使用 JYRitual 共用儀式的入口：塔羅、雷諾曼、八字、合盤、紫微、梅花、靈籤、開鑰、印度占星。
- 舞台在手機直向、短視窗與安全區環境下不再把繼續／跳過按鈕擠出可視範圍。
- 舞台內容保留自然捲動；操作列移至儀式視窗的共用固定區，避開場景格與對話卡的裁切。
- 更新服務工作者版本，讓舊快取裝置載入新樣式。

套用方式
- 將壓縮檔內檔案覆蓋到同名路徑；新增檔案放到指定資料夾。
- 清除舊網站快取或重新載入後，所有共用儀式入口會使用同一修復。

驗證
- npm run test:ritual
- npm run test:story
- npm run test:flow
- npm run test:flow-polish
- npm run test:immersive
- npm run test:ui
- npm run test:depth
- npm run test:craft && npm run test:ootk
- Playwright／Android 實機渲染未能執行：此工作區沒有可啟動的 Chromium 瀏覽器。回歸測試驗證了 DOM 結構、樣式語法、安全區固定操作列及各儀式入口。
