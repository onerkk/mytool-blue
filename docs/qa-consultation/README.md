# 重跑十五個配對個案

[逐案對照與統計](model-review.md) · [三十份原始模型輸出，含達到長度上限的回答](model-pairs.json)

基準版為 `8cbccec0e507966dd12dfd369ab02bb61be64836`，新版首答為 `fa4f769962db1cfab7a14d342fa8d7536f1f6d05`。兩個目錄各放一份待測版本及專案本來使用的 Node 依賴。推論使用 Node 24、`node-llama-cpp@3.14.1`（llama.cpp b6843），以及 Unsloth 的 Qwen3-1.7B Q4_K_M GGUF。本次權重的 SHA-256 為 `b139949c5bd74937ad8ed8c8cf3d9ffb1e99c866c823204dc42c0d91fa181897`。

在含有下列腳本的目錄執行，將路徑改成自己環境中的實際位置。`RUNTIME` 是安裝 `node-llama-cpp` 的 npm 專案目錄。GGUF 和推論套件自備，執行腳本無需金鑰或連線。

```sh
node cases.cjs "$OLD_CHECKOUT" old-output
node cases.cjs "$NEW_CHECKOUT" new-output
node infer.mjs "$RUNTIME" "$GGUF" old-output/*.prompt.txt
node infer.mjs "$RUNTIME" "$GGUF" new-output/*.prompt.txt
node bundle.mjs old-output new-output transcripts.json "$(git -C "$OLD_CHECKOUT" rev-parse HEAD)" "$(git -C "$NEW_CHECKOUT" rev-parse HEAD)" "$RUNTIME" "$GGUF"
```

`cases.cjs` 呼叫網站單次貼上匯出器，每種方法都附一個不同的生活問題和提問者自述。輸入是固定案例，讀書會、合唱團和工作情境均為合成測例。五輪開鑰使用已存的完整實盤，合盤使用實際 UI 的既有雙盤形狀。每一對的方法、排盤、問題和補充條件一致。本次由 AI 依 `rubric.json` 的逐案判準核對盤上依據、使用者處境、做法與捏造錯誤。原文與判準可供其他讀者獨立覆核。

`infer.mjs` 每份輸入建立獨立對話，完整保留原始盤表、抽牌順序等原文與網站本身的寫作要求，只在結尾加入 Qwen `/no_think`。溫度 `0.7`、top-p `0.8`、top-k `20`、min-p `0`、種子 `42`、最多 `1600` 個輸出 token。每輪依實際輸入長度配置上下文，保留模板及輸出餘量。GGUF、Node 套件版本、處理器與編譯實作會影響逐字重現性。`.meta.json` 記錄停止原因、實際讀寫 token 與時間，`.reply.txt` 是完整可見回覆，`.partial` 是串流工作檔。報告對照的是這批模型回答與固定個案，沒有後續真實事件資料。

逐案的 `promptSha256` 對照網站原始匯出，不含推論時才加入的 `/no_think`。`replySha256` 對照 JSON 內未經潤飾的 `reply`。每份輸出只移去寫檔器額外加的一個換行，保留模型本身的換行。機械可重算的指標在 `measures`，語義判準另列於對照報告。

封存時從指定的推論套件讀取版本，對實際權重檔重新計算 SHA-256。省略選填的版本或檔案時，相應欄位留空，逐題提示詞與回答仍可用各自的雜湊核對。
