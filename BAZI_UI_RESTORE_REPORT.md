# 八字 UI 恢復修正報告

## 根因

`JS/bazi-suite.js` 在載入最後把 `window._baziStandaloneOpen` 改指向新套件畫面，導致原本 `bazi-standalone.js` 的自訂日期、時間與出生地點選擇器不再被開啟。新畫面使用 HTML 原生 `input type="date"`／`input type="time"`，因此 Android／Samsung 會顯示系統日曆與時間選擇器。

## 修正

- 原版 `bazi-standalone.js` 再次成為八字主入口。
- 原本的自訂日期、時間、地點 UI 完整保留。
- 完整套件改由 `window._baziFullSuiteOpen()` 獨立開啟。
- 原版頁面新增「合盤・人格・曆法工具」次要按鈕，功能沒有移除。
- 完整套件內的返回按鈕改為「返回原版單盤」。
- 更新腳本版本參數，避免瀏覽器繼續使用舊檔。

## 變更檔案

- `index.html`
- `JS/bazi-standalone.js`
- `JS/bazi-suite.js`
- `tests/bazi-suite-browser-smoke.html`
