# 靜月之光 · Moon Atelier 卡片重製

版本：20260911cards1 / 分享引擎 3.0.0 / 快取 v61。
本包只含本次變更檔，接續 2026-09-10 已交付的命理提示詞修正版。

## 套用

保留網站備份，將 ZIP 內檔案依相對路徑覆蓋至專案根目錄。若尚未套用上一份 20260910 提示詞更新，請先套用上一包，再覆蓋本包。
部署後開啟 `preview-share.html`，可預覽十類卡片，以及雷諾曼五種、塔羅不同張數的版面；原網站的分享按鈕已接到新引擎。預覽頁使用標示為「設計示意」的範例，正式結果使用本次抽牌／排盤資料。

## 設計與實作

- 十類卡片：邀請、塔羅、開鑰、雷諾曼、八字、八字合盤、五軸人格、紫微、梅花、靈籤。
- 邀請卡使用金屬弦月、星環與懸浮牌背主視覺；其餘各類有獨立主色、圖騰、浮雕邊緣、陰影與資訊層次。
- 分享引擎以 1080 × 1350 邏輯版面繪製，正式輸出 2160 × 2700 PNG。既有實際牌圖完整等比顯示，不裁切圖面。
- 雷諾曼三／五張保持線讀；雙路比較分 A1–3、共同4、B5–7；九宮格維持3×3；大牌陣維持4×8＋獨立4張。塔羅結果卡以完整牌序展示，並明示非重新配置占卜牌位。
- RWS 保留實際逆位與牌圖旋轉；Book T 不代入逆位字典。分享不修改原始抽牌資料。
- 梅花保留六爻由下而上的位置與動爻；靈籤四句按右至左直書，保留完整原文。
- 八字／紫微等無結果時明示尚無資料，移除舊版自動代入範例命盤的行為。
- 長問題或過長摘要在圖片中明示省略，完整問題及提示詞不被修改。
- 分享窗有高清下載、系統分享、隱藏問題／姓名／出生文字、Escape 關閉、焦點限制與返回；取消系統分享不會擅自觸發下載。
- 首頁邀請入口同步重製；預覽頁舊的 `share-card.js` 路徑已修正。
- 主視覺約 178 KB，只在固定素材中使用。使用者生成分享卡不會增加 AI API 呼叫。

## 驗證與限制

正式 package.json 測試共11套均通過，明細見 validation.json 與 test-results.txt。新增分享測試10組，覆蓋正逆位、資料不變、張數與幾何、缺資料、長文字及全部60首籤詩。

另外以實際 Canvas API 渲染十類卡片及13個牌陣變體，檢查文字界線、圖片數量、2倍尺寸與成品外觀；十張成品的 QR 資料均辨讀為 `https://jingyue.uk`。QR 來源亦與上一版完全相同。

**沒有完成真實手機／瀏覽器操作實測。** 預覽瀏覽器阻擋本地 file URL，本次依限制停止該路徑，改用本機 Canvas 渲染及程式驗證。這不等於已驗證 Android／iOS 的系統分享或部署後效果，亦未發布網站。預覽 PNG 的中文字體採驗證環境可用的 Droid Sans Fallback；網站優先使用既有 Noto Serif TC／Noto Sans TC，字型觀感可能略有差異。

曾額外執行未列入正式測試指令的歷史 `tests/bazi-suite-regression.cjs`，該檔仍有失敗：未載入新版八字提示詞模組，並檢查舊版號及舊CSS字串。本次未修改該歷史測試或八字核心，不將它算作通過；其分享入口檢查已通過，新版八字方法測試在正式測試中通過。

## 主視覺製作紀錄

使用內建 imagegen 模式。專案素材：`assets/share/moon-atelier-20260911.webp`，由生成 PNG 轉為 WebP，構圖不變。下列為實際生成提示詞；字體、QR、牌位、占卜內容均由程式另行繪製。

Use case: stylized-concept. Project asset: a premium 3D hero artwork for 靜月之光, a Traditional Chinese divination website's invitation card. Generate one image in a wide 3:2 composition, no writing or typography anywhere. An exquisite large sculptural crescent moon in brushed champagne gold and luminous ivory, suspended inside a tilted thin astrolabe ring, with exactly three levitating dark indigo tarot-card backs fanned gracefully in the foreground. The card backs have refined embossed circular moon/constellation ornament, beveled gold edges, real thickness. Base: small elliptical obsidian plinth, subtle reflection. A few tiny floating gold particles, soft rich teal/indigo aurora haze behind, beautiful warm edge lighting and cool cinematic fill, physically believable metal, highly refined luxury fragrance campaign / museum object render. The moon is the main focal point, large and memorable. Backdrop completely uninterrupted very dark blue-black (#090f19), softly vignetted. All objects safely inside the middle 80%, gentle negative space at the edges for blending into a programmed canvas. Sophisticated editorial quiet luxury, magnificent three-dimensional form, dramatic but controlled highlights. No hands, people, letters, numbers, logos, watermark, QR codes, fake UI, or text. This is only decorative imagery; the application will draw the exact Chinese headings, live readings and QR separately.
