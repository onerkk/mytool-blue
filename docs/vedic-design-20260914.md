# 印度占星介面重設與核心覆核 — 2026-09-14

本輪接續 2026-09-13 的印度占星版本，重做出生資料輸入、命盤工作區及專屬過場，同時修正格局條件與時間敏感度。核對對象是**天文計算、曆時轉換、所選傳統方法與程式輸出的相符程度**；不是用程式測試證明現實事件必然發生。

## 介面如何改變

| 使用環節 | 新設計與實際行為 |
|---|---|
| 出生日期 | 自有曆法選擇器：四位西元年直接輸入、月份格、年份分頁及日期格。依公曆驗證閏年，不把不存在日期自動換成另一日；空值不預填成今天。 |
| 出生時間 | 自有 24 小時編輯器：大型時／分欄位與兩個獨立滾輪；可直接輸入、觸控滑動或用方向鍵。保留 00:00、23:59；時間不詳是另一個明確選項。 |
| 出生座標 | 地點與 IANA 時區同時設定；座標、出生時間誤差及夏令時間重複時段可以展開核對。不存在的夏令時間會提示修改，保留表單。 |
| 視覺語言 | 印度花瓣拱、幾何窗格、黃銅鑲邊、深藍底與象牙紙命盤。梵文字型隨網站提供，避免系統缺字。 |
| 命盤 | 北印度式固定宮位為預設，南印度式固定星座可切換。紙面呈現十二宮，細節留在選宮面板；本命、D9、D10 快捷切換，完整十六分盤仍可選。 |
| 九曜 | 九列對齊星位、度數、宮位及尊貴，選星再展開掌宮、月宿、定位星、相位、近日角距及 D9。格局條件與八分點表分開閱讀。 |
| 運期 | 當期 MD／AD／PD 摘要、完整大運選單、副運列表，以及所選副運自己的次副運。每一層使用實際父區間，沒有把所有副運都連到「當期」次副運。 |
| 解讀 | 題目、八種方向、深入提示詞與完整命盤下載集中在「解讀」分頁；修改問題不重新排盤。 |

操作鍵有按壓深度，分頁與內容展開有短過渡。日期格可用左右／上下鍵、Home／End、PageUp／PageDown，Shift 搭配翻頁鍵跨年；時間滾輪採單一焦點與方向鍵。取消／Escape 還原原值和焦點。相關鍵盤設計核對 [W3C APG Date Picker Dialog](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/)。

## 獨立的九曜過場

`JS/vedic-ritual.js` 與 `JS/vedic-scene-src.mjs` 是獨立播放器及 Three.js 場景，沒有呼叫其他命理的角色儀式播放器。

1. 先以 27 月宿與 108 刻度定位，亮起本命月亮實際所在月宿。
2. 九曜依原生恆星黃經出現在星環上，顯示本次月亮星座與月宿資料。
3. 黃銅星環後移，具厚度的北印度式命盤展開；九曜移至本命宮格，星座數字按實際上升排列。
4. 由使用者按鍵進入命盤。略過直接使用已算快照；返回保留出生資料。

演出約 10 秒，切到背景時暫停。減少動態模式直接呈現定格，WebGL 不可用或失去 context 時顯示同一印度窗格與本次資料，仍可繼續或返回。演出中的星環半徑、鏡頭、珠體與舞台光線屬呈現設計，不是天體實際尺度或另一份排盤。出生時間未知時不演示不存在的上升與宮位落點。

北式宮位與南式星座的方向，依作者書中 §1.3.4／Figure 1 核對；北式格內的 1–12 表示星座編號，選宮面板另外標出宮位。[P.V.R. Narasimha Rao，作者公開教科書](https://www.vedicastrologer.org/articles/vedic_astro_textbook.pdf)

## 核心修正：有條件地成立，不靠名稱套結論

### Gaja Kesari

舊版只要木星位於月亮第 1、4、7、10 座，就列為 Gaja Kesari。這個幾何關係本身不足以通過本版採用的完整條件。

本輪依同一作者 §11.7，逐項計算：月木角宮、自然吉曜同座或全照支持、木星未落陷、未進入燃燒角距、所在座非合成敵座。自然吉曜分類包含月相及水星同座關係；友敵判斷區分自然、暫時與合成層次。五項通過才使用格局名稱，否則顯示「月木角宮關係」，並直接列出哪項未通過。這是本版選用的完整月亮參照定義；其他流派的簡式、上升參照版本不暗中混入。[作者教科書 §3.2.2、§3.4、§11.7](https://www.vedicastrologer.org/articles/vedic_astro_textbook.pdf)

核對案例 `1983-08-25 14:55，Asia/Taipei，23.31 N / 120.31 E`：上升仍為射手、月亮仍為水瓶；月木角宮保留，**自然吉曜支持條件未通過**，因此不直接命名為完整象獅格局。星位沒有為配合新判定而調整。

### 近日燃燒角距

新增 `planet.solar`，保留實際角距、門檻、是否進入、接近分界與水／金星近留的提示。下表是 Drik Panchang 方法說明中的 Surya Siddhanta 角距慣例：

| 星體 | 順行門檻 | 逆行門檻 | 本輪實際查閱的技術說明 |
|---|---:|---:|---|
| 月亮 | 12° | 同門檻 | [Chandra Asta](https://www.drikpanchang.com/planet/asta/chandra-asta-date-time.html) |
| 火星 | 17° | 17° | [Mangal Asta](https://www.drikpanchang.com/planet/asta/mangal-asta-date-time.html) |
| 水星 | 14° | 12° | [Budha Asta](https://www.drikpanchang.com/planet/asta/budha-asta-date-time.html) |
| 木星 | 11° | 11° | [Guru Asta](https://www.drikpanchang.com/planet/asta/guru-asta-date-time.html) |
| 金星 | 10° | 8° | [Shukra Asta](https://www.drikpanchang.com/planet/asta/shukra-asta-date-time.html) |
| 土星 | 15° | 15° | [Shani Asta](https://www.drikpanchang.com/planet/asta/shani-asta-date-time.html) |

以黃經最短角距嚴格小於門檻判為進入；相等屬邊界外，距門檻一角分以內另標記核對。太陽自身及交點不套這張門檻表。**這不是當地可見性的偕日升落算法**；Drik Panchang 網站上依地點顯示的可見日期，不能直接拿來當本程式角距條件的測試答案。

行星每日速度改用出生時刻前後各 10 分鐘的中心差分：

`speed = shortestAngle(longitude(t + 10 min) − longitude(t − 10 min)) / (20 / 1440)`

藉此縮小順逆行與留附近的時間平均窗，再以既有 Swiss 參照速度逐顆比對。天文座標仍使用本地 [Astronomy Engine 2.1.19](https://github.com/cosinekitty/astronomy)；Swiss 是開發比對來源，設定參照 [Swiss Ephemeris 官方程式介面](https://www.astro.com/swisseph/swephprg.htm)。

### 出生時間誤差與運期

原版時間取樣只指出分盤、月宿是否變動。本輪讓每個取樣出生時刻重新計算月宿餘運，輸出第一大運結束的最小／最大取樣日期、第一運主集合、觀察日 MD／AD／PD 集合。±5 分鐘案例使用 21 個取樣點並包含兩端；這是實際取樣區間，不宣稱連續區間的嚴格數學上界。若跨月宿，日期範圍須和第一運主集合一起讀。

Vimshottari 的第一大運出生前已經過部分及所選年長繼續保留。時間誤差會傳到交運日期，正是需要另列這項資料的原因。[作者教科書 Chapter 16，出生餘運與出生時間敏感度](https://www.vedicastrologer.org/articles/vedic_astro_textbook.pdf)

另將 Paksha 用詞改為「白半月 Shukla（漸盈）／黑半月 Krishna（漸虧）」，避免把整段半月稱為上弦或下弦。度數顯示截取至角分，避免舊星座名稱旁因四捨五入出現 `30°00′`；原始計算角度不截斷。

## 提示詞與分析方式

八種方向仍由同一原生快照產生，按「主題宮與宮主 → 所在星座及定位星 → 有方向的相位／同座 → 專題分盤 → 大運、副運與次副運」整合。新增的 `solar`、`naturalNatures`、格局 `checks` 及 `sensitivity.dashaTiming` 都隨資料輸出。主判必須說清最支持的方向、作用機制及可採行動；具體反向條件用來解釋取捨。

提示詞仍明示各分盤採用的算法與參照上升。完整 Shadbala、所有 Jaimini 大運、所有格局與不同流派分盤並未因這次 UI 重設而變成已實作功能。既有計算範圍及上輪數值資料見 `docs/vedic-engine-20260913.md`；本次條件修正以上文為準。

## 驗證與可複查檔案

- `tests/vedic-engine-20260913.cjs`：既有 14 組核心測試；167 組標準盤、72 組高緯上升、6 組 Raman 參照，及分盤、月宿、歲差、時區、運期等規則。
- `tests/vedic-design-20260914.cjs`：新增 13 組；2,412 個月份結尾、1,440 個民用分鐘、燃燒角距與順逆行門檻、完整格局正反例、167 組速度、誤差傳到運期、三層運期父子關係及九曜 3D 原生座標。
- `tests/vedic-browser-20260914.cjs`：觸控瀏覽器操作、日期鍵盤、時間滾輪、十六分盤、四個分頁、副運對應次副運、取消／略過／減少動態、WebGL fallback、夏令時間錯誤恢復、未知時間及手機寬度。
- `review/vedic-design-20260914/`：實際測試結果、記錄及手機／桌面截圖；以結果檔為通過與否的證據。

速度對照最大誤差為水星約 **0.000444 度／日**，167 組中超出留判定帶的順逆行方向一致。星位參照的角秒誤差及測試清單存於結果 JSON，不把它換算成占卜成功率。

全站 `npm test` 完成，exit code 為 0；新增 13 組與既有 14 組印度占星測試全數通過。Chromium 153 以 390×844、320×740 觸控模擬及 1440×1000 桌面尺寸完成 25 項操作情境，沒有 JavaScript 例外或水平溢出。這不是實體 Samsung 或 Safari 測試。原始專案另有三張分享背景 PNG 缺檔請求，與本輪印度占星資產無關，完整保留於瀏覽器記錄。

瀏覽器測試可在安裝 Playwright 與 Chromium 後以 `node tests/vedic-browser-20260914.cjs` 執行；`JY_PLAYWRIGHT_MODULE` 可指定套件位置。審查環境另以 `JY_QA_RUNTIME` 指定 Chromium 執行環境、`JY_QA_SANS` 指定 Noto Sans TC 的 Fontsource 套件目錄，便於離線截圖。測試攔截外部 API，出生資料沒有送往外部 AI 或計數服務。

## 檔案與部署

CSS、picker、ritual、standalone 入口版本更新為 `20260914sanctum1`，核心 schema 為 `jy-vedic-1.1.0`，兩份 Service Worker 快取版本同步為 `jy-main-v80`。3D 原始碼與打包版一併保留，可用 `npm run build:vedic-scene` 重建（需 Three.js 與 Rolldown）。

`assets/fonts/noto-sans-devanagari-400.woff2` 採 Noto Sans Devanagari／SIL OFL，授權附在同目錄。這份 ZIP 應覆蓋在上一輪 2026-09-13 已更新版本，保留相對路徑。更新後重新載入頁面；所有圖式、動畫、複製及下載都共用該次計算快照。
