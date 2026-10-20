# 解讀口吻、賣場推薦、交接導引與立體層次根治 · 20261021depth29

這是變動檔案包。解壓後把 `mytool-blue-master/` 內的檔案覆蓋到既有專案相同路徑，重新整理網站即可。沒有刪檔，沒有重算任何盤、牌或籤。

## 根因與修法

### 1. 提示詞只改一個源頭，十五種工具一起到位
全站十五種工具（八字、紫微、印度占星、西洋占星、大六壬、六爻、易經、梅花、姓名、合盤、五軸、塔羅、雷諾曼、五輪、籤詩）的「複製提示詞」最後都走 `JYPromptPacket.build → JYSinglePaste.compile`。解讀口吻、深度要求與賣場段全部住在 `JS/prompt-single-paste.js`，由 sync 腳本內嵌進 `prompt-brief.js`、`prompt-packet.js` 與根目錄鏡像。本次只改這個源頭，再同步。

改了什麼：
- **像命理師當面講**：場景式人設（看盤二十年、對方坐在面前、沒學過命理），第一句就回答會不會／較可能怎樣／程度多少，再講原因、牽掛、代價與下一步。
- **白話鐵律**：正文不用術語、牌星名、干支；非提不可時當場一句生活話解釋。不用粗體小標、不分結論／證據／建議欄、不逐牌逐宮念、同一結論只講一次。
- **壞消息照講**：有溫度但不包裝，不用「有機會，看你主不主動」結案。
- **深度自查七項**（寫完前缺一項就補）：子題答案與程度、原因講成處境、能改／不能改、時間要有理由、一到三個月可觀察跡象、今天能做的一件事、最可能推翻判斷的情況。明示這是檢查不是目錄，不得照抄成條列。
- **賣場推薦真的接問題**：先點出本次解讀「最需要照顧的一件事」，再從靜月之光常備品類（附傳統象徵對應表：安穩護持／開口表達／感情柔軟／清明決斷／行動與財務／轉換放下）挑一款，連回剛講的下一步。原有紅線全部保留：不宣稱療效改運、不造庫存價格產地成分認證、不加重凶象促購、預算吃緊先用現有物件、安全情境整段暫停。
- **尾端最後確認**（recency 壓制）：第一句就回答、全文不用術語與粗體、壞消息照講、手鍊段要接本題。
- 雷諾曼牌序不再印「方向?」（雷諾曼本無正逆）。

交付預算由 8,000 字／20,000 bytes 調為 **9,000 字／22,000 bytes**。原因：新指令多約 650 字，而六壬、姓名、八十個逐年等重案原本只剩不到 400 字餘裕，不調就會報「超過預算」。9,000 字仍遠低於各免費 AI 的單則上限；相關測試斷言已同步，實機 393px 手機流程重新驗證。

### 2. 同步鏈斷裂修復（版本號連動）
- `scripts/sync-recommendation-guides.cjs --check` 原本失敗 18 檔：casework28 把「口吻與處境」只寫進內嵌區，沒寫進真正源頭 `JS/reading-quality.js`；跑官方 sync 會把它抹掉，不跑則 `functions/api/ai.js`、`prompt-export.js` 停在 depth26 舊守衛。本次把該段補回 `reading-quality.js`（recommendation 5.4.0／reading 16.1.0），`scripts/sync-casework28.cjs` 改成與官方 sync 相同的剝 `module.exports` 規則。現在兩支 `--check` 同時通過。
- `functions/api/ai.js` 與 `workers/ai-proxy.js` 同步到 depth28 契約與新賣場段。

### 3. 操作流程：複製之後要做什麼
原本十五個房間各自畫「複製提示詞」按鈕，複製成功後沒有任何地方告訴迷惑的人下一步。新增 `JS/reading-handoff.js`，只攔共用出口 `JYPromptPacket.copy`：複製成功後彈出底部三步卡——打開常用 AI → 長按貼上送出 → 讀完直接追問、沒答完怎麼回它。可勾「不再提醒」（本機記憶）。不碰任何工具的抽牌、排盤與剪貼簿內容。

### 4. 立體層次
新增 `CSS/depth-polish-20261021.css`，只疊一層：探索之門卡 3D 傾斜與光掃、主按鈕鍵帽下沉、選項鈕浮雕、AI 捷徑鍵感、牌卡厚度與傾斜、步驟印章感、統一金色焦點環。所有位移與光掃受 `prefers-reduced-motion` 與 `hover:hover` 保護，不覆寫各房間版面與顏色。

### 5. 版本連動
`index.html` 全部資源 `?v=20261021depth29`；`ui.js` 延遲載入版本同步；`sw.js`／`JS/sw.js` 快取 `jy-main-v136`。

## 驗證
- `node scripts/sync-recommendation-guides.cjs --check`、`node scripts/sync-casework28.cjs --check`：通過。
- `npm run test:single-paste`（23 組）、OOTK 32 組洗牌、三種 36 張布局、`tests/casework28.test.cjs`（15 組）、`tests/prompt-budget-20261003.cjs`、`tests/api-failure-regression.mjs`、`tests/divination-professional-20260910.cjs`、`tests/astro-bridge-20260922.cjs`：通過。
- `npm run test:single-paste:browser`（Playwright、393×852 手機、真實印度占星匯出、剪貼簿、下載、整合頁、重新整理還原）：7 組通過，延遲載入版本全為 depth29，無 page error。
- 另以 Playwright 實跑雷諾曼全流程（問題→三步→抽牌→儀式→結果→複製）：交接卡出現、剪貼簿為新版提示詞、首頁與房間截圖無破版。
- 對原版與本版逐一跑 `npm test` 全部 53 支子套件比對：本版沒有新增失敗；`test:special-rules` 由失敗轉通過。

## 老實交代
- 原版已有 22 支子套件失敗（釘死 workflow 2.5.0／reading 16.0.0／prompt26 等舊版本號，或 paste27 之前的舊標題格式），本次沒有重寫這些舊測試。
- 未登入外部 AI 實際送出評分，不保證免費 AI 的平台限制、答案品質或預測準確率；本次修正的是送出去的材料與指令。
- 賣場品類對應表是傳統象徵對應，提示詞內已標明「不是療效」。

## 日後修改
改 `JS/prompt-single-paste.js` 或 `JS/reading-quality.js` 後執行 `node scripts/sync-recommendation-guides.cjs`，再以 `--check` 與 `node scripts/sync-casework28.cjs --check` 確認；接著更新 `index.html` 的 `?v=`、`ui.js` 延遲載入版本與 `sw.js` 快取名。
