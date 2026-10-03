# R8 累積更新與完整專案

完整專案：mytool-full-project-20261003.zip，解壓使用mytool-blue-master目錄。
已有原專案：mytool-engines-20261003-r8.zip全部合併覆蓋原根目錄；這是對20261002原始專案的累積更新，含前輪修補。
Android選mytool-engines-20261003-r8.zip.down下載，刪除檔名最後.down再解壓；内容與.zip完全相同。

快取jy-main-v117，計算/提示詞20261003native8/20261003prompt8，介面20261003ritual8。尚未部署線上網站。
預設直接複製完整純文字，訊息拒收時依段號貼齊同份正文，無須上傳附件或付費AI。
修復完整提示詞的具體手鍊推薦與蝦皮導流、抽牌後可見控制列與快取返回，新增20盤Sudarsana三重運期實算。

逐方法能力及尚缺：docs/native-engine-status-20261003.md。
本輪來源成功/失敗與新算法：docs/engine-source-review-20261003-r8.md。
機器可讀範圍：docs/native-scope-20261003.json與data/engine-rule-coverage.json。
完整性：docs/release-files-20261003-r8.json、docs/release-integrity-20261003-r8.json。
歷史報告不代表R8現況，不宣稱所有歷史門派及質性細則已全部自動化。

驗算：npm run test:native、npm run test:completion、npm run test:prompt-budget、npm run test:r7、npm run test:r8。
共用正文檢查：node scripts/sync-recommendation-guides.cjs --check。
瀏覽器查核需Playwright及Chromium；獨立天文驗算需pyswisseph。
