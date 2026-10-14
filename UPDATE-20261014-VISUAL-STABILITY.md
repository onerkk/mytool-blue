# 2026-10-14 牌陣顯示與閃爍修正

將 ZIP 內的檔案依原路徑覆蓋目前專案。新增的
`assets/cards/preview-20261014/` 資料夾請一併更新，更新後重新開啟網站。

## 這次修正

- 揭牌畫面的標題、背景角色、牌陣和說明分開排列。牌區高度依實際內容決定，不再受舊故事樣式的 210px 固定高度限制。
- 五張牌保留三張加兩張的位置；七張線、九宮格、選擇分支、兩種大牌陣保留各自排列與原牌序。塔羅的「全部揭開」顯示全部已抽出的牌。
- 牌面保持平面，不反覆套用立體翻轉、濾鏡或淡入。動畫字幕不再改變牌陣位置，卡片背景不隨長頁面縮放。
- 切換動態／靜態沿用同一個場景與畫布。視窗尺寸不變時不重設畫布；降低渲染解析度後立即重畫，避免短暫空白。
- 揭牌縮圖採用由原圖縮製的 384×576 預覽，完成解碼再顯示。預覽失敗會改載原圖；原圖也失敗時保留牌名及錯誤說明。
- 原牌圖、抽牌結果、牌序、正逆位、命理計算與提示詞維持原資料。
- 相關資源版本更新為 `20261014visual23`，兩份主站 Service Worker 同步至 `jy-main-v130`。

## 驗證方式與範圍

`tests/card-spread-browser-20261014.cjs` 已增加高度與遮擋檢查，不只檢查左右寬度。
`tests/ritual-visibility-browser-20261014.cjs` 額外檢查手機觸控與高 DPR、動畫中的牌面位置與像素、畫布是否沿用，以及慢速、失敗的圖片和樣式缺失。

檢查使用實際 Chromium、專案原始 HTML/CSS/JS 和本地牌圖。手機尺寸、觸控及高 DPR 是瀏覽器模擬；沒有實際操作使用者的 S25 Ultra，也不宣稱通過所有實體手機 GPU 認證。像素比較允許 8-bit 色階的 1 級渲染捨入差異；明顯變暗、空白、缺圖或位置移動仍會失敗。

## 查閱的技術文件

- [MDN：HTMLImageElement.decode()](https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/decode)：圖片完成解碼後再呈現。
- [MDN：ResizeObserver](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver)：觀察尺寸變更及避免反覆調整。
- [CSS 工作組：畫布在尺寸變更時的閃爍討論](https://github.com/w3c/csswg-drafts/issues/9717)：調整尺寸清除畫布後，需要在顯示前重畫。

實際通過的測試記錄見 `docs/visual-stability-validation-20261014.json`。
