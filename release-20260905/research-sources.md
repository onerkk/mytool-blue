# 線上參考核對（2026-09-05）

本次確實使用網路搜尋並閱讀下列公開資料，按內容選擇可用的設計。搜尋涵蓋多個術數與中英文關鍵字，但無法遍歷全網，更不能讀取各付費平台未公開的私有提示詞。以下社群提示詞與開源專案是設計參考，不是預測準確度的驗證報告；未整段抄入專案。

| 類別與來源 | 採用的方向／審查結果 |
| --- | --- |
| [TarotSeed 實際塔羅 system prompt](https://github.com/bzzzwa/TarotSeed/blob/main/tarot-reader-prompt.md) | 牌位、鄰牌與問題情境共同解讀；不把回應共鳴稱為準確度證明。未照搬逐步停等、拒答流程或改用它的 RWS 抽牌法。 |
| [八字解說提示詞](https://docsbot.ai/prompts/education/bazi-explanation) | 天干地支、十神、五行與四柱關係需有連貫解釋；它偏入門教學，不足以直接取代本案排盤核心。 |
| [紫微斗數分析提示詞](https://docsbot.ai/prompts/analysis/zi-wei-dou-shu-analysis) | 輸入出生資料，按宮位與星曜結構解讀；本案進一步以實際三方、四化與運限資料支撐，不讓模型憑空定盤。 |
| [吠陀 Kundli 分析提示詞](https://docsbot.ai/prompts/education/vedic-kundli-analysis) | 比對 D1、分盤與大運的分析面向。未直接照搬要求全部分盤的流程；出生時間及資料精度不足時，不能猜 D60 等高敏感資料。 |
| [梅花易數開源專案](https://github.com/muyen/meihua-yishu) | 查閱公開計算／解讀設計，區分起卦計算與語言分析。作者的預測表現敘述未採為本網站命中率證據。 |
| [梅花占卜開源技能](https://github.com/qiyan233/meihua-divination) | 實際問題與反思式解讀的設計参考；未把現代擴充當唯一傳統標準。 |
| [西洋占星 natal／transit 專案](https://github.com/vellum-ai/astrology-horoscope) | 星曆、黃道與宮位設定先於解讀；依已提供出生資料與度數分析，缺時刻時保持上升與宮位未定。 |
| [雷諾曼牌組閱讀教學](https://labyrinthos.co/blogs/learn-tarot-with-labyrinthos-academy/how-to-read-lenormand-card-combinations) | 牌組互相修飾並受情境影響。它是閱讀教學，沒有宣稱取得其私有 AI 提示詞。 |
| [Mingyu 多術數開源專案](https://github.com/Brhiza/mingyu) | 比對公開的多術數計算、資料與 AI 整合方式，作八字、紫微、梅花、雷諾曼、靈籤的架構參考。未宣稱取得商業平台後台提示詞。 |
| [YiSphere 多系統專案](https://github.com/0xfnzero/YiSphere) | 比對工具提供資料、模型綜合解釋的設計；多系統同向不當作独立實證。 |
| [公開中文占卜提示詞範例](https://gist.github.com/weihua-studio/d75d17cf23e202c7d8fa4b6d24ed2698) | 比對資料核對與分析面向；未採堆疊大師頭銜、無來源精確日期與全知式角色宣稱。 |
| [西方數字學商業報告提示詞](https://docsbot.ai/prompts/business/numerology-business-report) | 僅作數字學格式比較；不能替代中文姓名的字形、複姓及康熙筆畫，也不能與三才五格混算。此次未找到可核實為業界最佳的中文姓名學私有提示詞。 |

## 技術依據

- [MDN：showModal](https://developer.mozilla.org/en-US/docs/Web/API/HTMLDialogElement/showModal)：原生 modal 的最上層與背景 inert 行為，用於處理選擇器與既有高 z-index 遮罩的關係。
- [MDN：VisualViewport](https://developer.mozilla.org/en-US/docs/Web/API/VisualViewport)：可見高度、寬度與偏移，用於鍵盤、縮放及可見視窗變化。
- [Cloudflare Pages Functions 路由](https://developers.cloudflare.com/pages/functions/routing/)：functions 目錄對應 API 路徑；前端可載入不表示後端函式也已部署。

完整分析需要正確輸入、可核對的計算結果、術數內部一致的方法及現實驗證。搜尋更多提示詞不能取代這些條件。正式外部 Worker 尚缺原始碼，七維更新的適用範圍見 README。
