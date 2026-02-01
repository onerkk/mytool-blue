# 資料擴充指南

本系統使用**本地資料庫**，所有八字、梅花、塔羅、姓名學資料皆儲存於專案內 JS 檔。  
若需補全或更新資料，可依本指南整合網路參考來源至本地。

## 為何不自動抓取網路？

- **CORS 限制**：瀏覽器禁止前端直接向多數網站發送跨域請求，多數命理網站無法直接抓取
- **著作權**：大量擷取他人網站內容需注意授權
- **穩定性**：本地資料不受網路斷線影響，載入速度快

## 擴充流程

1. **尋找參考來源**（可參考下方清單）
2. **整理成 JSON/JS 結構**
3. **手動或透過腳本**寫入對應資料檔
4. **測試**：確認 UI 與邏輯正常

## 建議參考來源

### 八字
- 易兌、萬年曆等排盤系統（對照喜用神、神煞、大運）
- 干支五行對照表、十神表
- 節氣時間表（可用 `lunar-javascript` 等套件）

### 梅花易數
- 易經六十四卦卦名、卦辭、象辭
- 梅花易數體用生克規則
- 周易天地、維基文庫等

### 塔羅
- 78 張塔羅牌正逆位牌義（愛情、事業、財運、健康、綜合）
- 金色黎明對應、凱爾特十字位置
- 可參考：jasiyu.com、tarnote.com、moritarot.com 等整理後納入本地

### 姓名學
- 康熙字典筆畫、五行對應
- 81 數理吉凶表
- 三才五格配置規則

## 對應檔案

| 系統   | 主要資料檔                    |
|--------|-------------------------------|
| 八字   | `js/bazi-system.js`、`js/auxiliary-data.js` |
| 梅花   | `js/meihua-system.js`、`logic/meihua_rules.js` |
| 塔羅   | `js/tarot-system.js`、`logic/tarot_meanings_by_type.js` |
| 姓名學 | `js/nameology-system.js`      |
| 水晶   | `js/crystal-recommendation.js`、`logic/crystal_behavior_map.js` |

## 問題與答案對應／詞彙庫擴充（改善「問題與答案對不上」）

- **回扣句（extractEchoPhrase）**：`engine/fusionEngine.js` 內依問題關鍵字決定答案主語（如「今年健康狀況」「副業／本月銷售能否破萬」）。可從網路或書籍整理「問句類型 → 回扣用語」對照表，手動補入 `extractEchoPhrase` 的 if 條件與回傳值。
- **詞彙庫**：`logic/vocabulary_db.js` 的 `SUBJECT_BY_TYPE`、`CONCLUSION_PHRASES`、`CONCLUSION_TAILS`、`SUGGESTION_PHRASES` 可依題型擴充。若後端或建置腳本能抓取授權來源（命理文章、問答範例），可產出 JSON 再手動或腳本合併進上述結構，以改善答案與問題的對應感。

## 未來：後端資料擴充

若架設後端伺服器，可實作：
- 定期從授權來源抓取資料
- 寫入本地 JSON/DB
- 前端透過 API 取得最新資料
- 或建置時透過 Node 腳本抓取後打包進前端
