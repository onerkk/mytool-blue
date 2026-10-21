# astronomy-engine 2.1.19 · 原生語法建置（20261021walk32）

- 來源：npm `astronomy-engine@2.1.19` 官方套件內 `astronomy.browser.js`（未經 Closure Compiler 降級），sha256 a2cfab19cab1a15843e4c8cc7410b6cbaafd0907122a8698c25d63d00c2774e4
- 壓縮：terser 5（--ecma 2017 --compress --mangle，保留 MIT 授權註解），輸出 sha256 d6f56ddcc8718f4682fa8495f1a4e7567ec8ee62623b06b3ad224108fe057cc6
- 原因：先前使用的官方 `astronomy.browser.min.js` 由 Closure Compiler 降級成 ES5，每個迴圈都經過 $jscomp.makeIterator 相容層。CPU 剖析顯示印度占星排盤 51 秒取樣中有 27 秒耗在這層。
- 驗證：同一輸入下印度占星 16.1 秒 → 4.2 秒、西洋占星 0.50 → 0.13 秒；印度與西洋完整輸出 JSON（11,067,198 bytes）與原建置逐位元組相同。版本號與原始碼未變，只是不同建置格式。
