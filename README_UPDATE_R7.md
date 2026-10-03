# R7 更新包

完整專案：mytool-full-project-20261003.zip，解壓後使用mytool-blue-master目錄。
已有原專案：mytool-engines-20261003-r7.zip中的全部檔案合併覆蓋原專案根目錄；保留其餘素材。這是對20261002原始專案的累積更新，含前輪修補，不是只對R6的差異。
Android若檔名變成.zip.down，刪除最後.down，保留.zip後解壓。

快取版本jy-main-v116，計算／提示詞版本20261003native7／20261003prompt7。尚未部署線上網站。
使用者直接複製完整純文字提示詞；訊息拒收時用同份正文的編號純文字段，不要求付費AI或附件。

現況及界線：docs/native-engine-status-20261003.md。
來源對照：docs/engine-source-review-20261003-r7.md。
完整規則登錄：docs/native-scope-20261003.json及data/engine-rule-coverage.json。
歷史報告不代表R7現況；未選流派、原文質性語義及來源空欄沒有冒稱全數實作。

驗算：npm run test:native、npm run test:completion、npm run test:prompt-budget、npm run test:r7。
瀏覽器查核需Playwright及Chromium；獨立天文查核需pyswisseph。
