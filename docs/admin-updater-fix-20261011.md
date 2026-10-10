# 更新工具 1.3：修正 GitHub 目錄驗證流程

## 先更新工具，再套用牌面包

舊更新器在送出更新時會讀取剛建立、尚未關聯提交的 Git tree；截圖中的 HTTP 422 出現在這個讀取階段。修正版移除這個依賴，改用完整 Git 目錄雜湊驗證。

舊工具目前無法完成這個流程，因此先手動更新工具一次：

1. 解壓縮本 ZIP，取出 `mytool-blue-master/admin/update.html`。
2. 開啟 [GitHub 的 admin 上傳頁](https://github.com/onerkk/mytool-blue/upload/master/admin)，上傳這個 `update.html`，覆蓋 `admin/update.html` 並提交。此步上傳 HTML 檔案。
3. 等待網站部署完成，開啟 [新版更新工具](https://jingyue.uk/admin/update.html?v=20261011updater13)。頁尾應顯示「更新工具 1.3」。
4. 再選取先前的 `mytool-blue-bright-cards-20261011-changed-files.zip`，檢查後送出更新。

本 ZIP 只含此次新增或修改的三個檔案：更新頁、回歸測試與本說明。測試及說明也可以一併合併回專案。

## 修正內容

- 用 UTF-8 位元組排序、目錄排序規則、Git 檔案模式及原始 20 位元組 SHA-1，依 Git tree 格式計算完整目錄雜湊。
- 比對目前網站的完整目錄，核對每個上傳批次的預期目錄 SHA 與 GitHub 建立結果；保留未修改的檔案、執行權限、連結與子模組。
- 完全核對後才建立提交，另檢查回傳的目錄與父提交；最後才以 `force: false` 更新分支。
- 保留分支版本變更、取消、二進位檔案雜湊及 token 隱藏檢查；更新內嵌 JavaScript 的 CSP 雜湊。

GitHub 官方文件說明，tree 的 `base_tree` 用於保留原目錄；建立 tree 之後，還需建立 commit 並更新 reference：

- https://docs.github.com/en/rest/git/trees
- https://docs.github.com/en/rest/git/commits

## 驗證結果與範圍

在模擬 API 拒絕讀取尚未提交目錄的情境中，舊版重現與截圖相同的 HTTP 422；新版完成更新流程。模擬情境用來重現失敗條件，並非對 GitHub 內部原因的直接觀測。

已使用真正的 `git mktree` 交叉驗證目錄雜湊，涵蓋空目錄、中文與 emoji 檔名、多層路徑、檔案／目錄排序、執行模式、連結及子模組。錯誤目錄、遺失既有檔案、錯誤父提交、取消及分支競態都會阻止分支更新。

另以實際的 38,544,398 位元組牌面 ZIP，驗證解壓縮、CRC、127 個變動檔案（含 114 張牌面）、二進位上傳與完整目錄雜湊流程。這些測試使用模擬 GitHub API；正式網站尚未由本次工作更新。

執行測試：

```sh
node tests/admin-updater-20260923.cjs
```

若要重跑實際 ZIP 測試，可另外設定 `JY_UPDATER_TEST_ZIP` 為該 ZIP 的路徑。測試使用 Node.js 24 與 Git。
