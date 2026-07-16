const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const standalone = fs.readFileSync(path.join(root, 'JS', 'meihua-standalone.js'), 'utf8');
const fallback = fs.readFileSync(path.join(root, 'meihua-standalone.js'), 'utf8');
const core = fs.readFileSync(path.join(root, 'JS', 'meihua_upgrade.js'), 'utf8');
const exportJs = fs.readFileSync(path.join(root, 'JS', 'prompt-export.js'), 'utf8');
const upgrade2 = fs.readFileSync(path.join(root, 'JS', 'meihua_upgrade2.js'), 'utf8');
let failed = 0;
function check(name, cond) {
  if (cond) console.log('PASS', name);
  else { console.error('FAIL', name); failed++; }
}
check('active and fallback prompts are identical', standalone === fallback);
check('question contract present', standalone.includes('本題回答契約（優先於通用格式，不得改寫原問句）'));
check('no invented topic when question empty', standalone.includes('不得自行編造人物、事件或生活領域'));
check('third-party mind boundary present', standalone.includes('不得宣稱已客觀讀到對方秘密心理'));
check('lost-object search boundary present', standalone.includes('優先搜索區域與順序'));
check('high-stakes boundary present', standalone.includes('不能取代專業判斷'));
check('accusation boundary present', standalone.includes('卦象不能作為認定他人違法或不忠的證據'));
check('live factual data boundary present', standalone.includes('不得冒充天氣、價格、法規、航班、賽果或開獎的官方資料'));
check('evidence hierarchy present', standalone.includes('證據優先序固定'));
check('conflict adjudication present', standalone.includes('遇到訊號衝突，不准平均成模糊話'));
check('deterministic single stone plan present', standalone.includes('品牌收尾指定（不得影響前面斷卦）'));
check('exact shop tail instruction present', standalone.includes('[靜月之光蝦皮賣場](https://shopee.tw/a50h95648d?tab=shop)'));
check('core ti-ke-yong is 吉 not 小吉', core.includes("r:'體克用',f:'吉'") && !core.includes("r:'體克用',f:'小吉'"));
check('deep verdict preserves 吉 for ti-ke-yong', upgrade2.includes('吉但落實度低：體克用仍屬諸事吉') && !upgrade2.includes('平偏吉：體克用') && !upgrade2.includes('小吉：體克用'));
check('export path has universal meihua engine', exportJs.includes('【角色——梅花易數事件判讀者】'));
check('export path includes meihua brand fragment', exportJs.includes('FRAG_CRYSTAL_MEIHUA') && exportJs.includes("tool === 'meihua' ? FRAG_CRYSTAL_MEIHUA"));
check('brand cannot affect divination', exportJs.includes('占斷完成後才執行，不得反向影響結論'));
process.exitCode = failed ? 1 : 0;
