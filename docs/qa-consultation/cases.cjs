'use strict';
const fs = require('node:fs');
const path = require('node:path');
const [repoArg, outArg] = process.argv.slice(2);
if (!repoArg || !outArg) throw new Error('node cases.cjs <repo> <output-directory>');
const root = path.resolve(repoArg), out = path.resolve(outArg);
fs.mkdirSync(out, { recursive: true });
const { environment, examples } = require(path.join(root, 'tests/native-fixtures-20261003.cjs'));
const env = environment(), c = env.ctx;
['tarot-foundation','golden-dawn-tarot','prompt-brief','prompt-packet'].forEach(env.load);
const x = examples(c);
const items = {
  bazi: ['我做設備維修，該接下教新人的差事嗎？我的顧慮會在什麼情形下比較小？','主管只答應每週騰出兩小時，其餘維修工單仍由我負責。'],
  ziwei: ['原部門還是轉調？我晚上要接爸爸回家，該先看哪個條件？','原部門已確認固定日班。新部門還沒提供輪班時段，也還沒開出薪資。'],
  astro: ['主管要我從畫設計圖改去面對客戶，我在意的是能不能保留創作時間；怎麼談這次調職？','現在每週有兩個上午畫圖，新職務只口頭答應可以兼顧。'],
  vedic: ['我在倉庫輪班，想白天帶實習生；從職業相關的分盤看，該怎麼試？','主管讓我先試帶兩週，轉日班還沒有定案。'],
  liuren: ['我想約合作方試做小量包裝。十月八日至十五日，盤上哪兩個候選日值得聯絡？請各配對原來的觸發條件。','對方只說可以收提案，還沒同意試單。'],
  liuyao: ['客戶簽收我的印刷品，尾款仍沒到。二爻的伏財受月日怎麼生剋？我催款前要看什麼？','對方還沒告訴我款項匯出的日期。'],
  yijing: ['社區菜園要我接每週的統籌，我最多只能去隔週。卦裡哪一段最能說明我該怎麼答覆？','夥伴尚未找到替班人。'],
  meihua: ['老師問我能不能週末先帶一場陶藝體驗。我擔心備料費，怎麼從這一卦看這一步？','工作室可借場地，材料要我先墊，報名還沒截止。'],
  name: ['陳弘林和陳沐洪，哪個更適合我在讀書會自我介紹時用？我在意第一次聽就能寫對。','原名陳政軒，還沒有人替我試聽這兩個名字。'],
  compat: ['我和伴侶合租，我想先訂固定家務表，對方想輪流認領，我們怎麼試一個雙方都能改的辦法？','我負責倒垃圾，對方固定採買，洗碗一直沒有分清楚。'],
  personality: ['下班前同事臨時改稿，我當場沒開口，回家一直想。我在下一次會議可以怎麼做？','我習慣會前寫好重點，這次更動沒有先通知。'],
  tarot: ['朋友邀我把做麵包變成週末攤位。這兩張牌怎麼讀我第一步該試什麼？','朋友能借攤位一個早上，我還沒算過每條麵包的成本。'],
  lenormand: ['我在等市集主辦回覆，攤位報名只差一封信；照這三張的順序，信來之前我能做什麼？','主辦已收件，尚未確認錄取；我只有這週能準備價目表。'],
  ootk: ['我想爭取工作坊主講，已試講一次。這次開鑰的第一輪能怎樣讀到我的處境？','主辦還沒選定講師，只請我把試講稿寄過去。'],
  oracle: ['我們的社區合唱團只剩一次排練，下場演出要先練齊舊歌，還是冒險排新曲？籤裡哪一句跟這件事貼近？','舊歌大家都會唱；新歌目前只練了半首。']
};
const charts = { ...x.charts };
charts.liuren = c.JYLiurenCore.calculate({ question: items.liuren[0], date:'2026-10-01', time:'22:06', timeWindow:{startDate:'2026-10-08',endDate:'2026-10-15'} });
charts.liuyao = c.JYLiuyaoCore.calculate({ question: items.liuyao[0], focus:'妻財', calendar:{day:'壬子',monthBranch:'亥'}, values:[8,7,7,7,7,7] });
charts.yijing = c.JYYijingCore.calculate({ values:[7,6,9,6,8,8], question:items.yijing[0] });
charts.lenormand = { spreadType:'three', expectedCount:3, cards:[{id:27,name:'信'},{id:21,name:'山'},{id:33,name:'鑰匙'}] };
charts.ootk = JSON.parse(fs.readFileSync(path.join(root,'docs/qa-single-paste27/ootk-fixture.json'),'utf8'));
charts.ootk.question = items.ootk[0];
charts.compat = JSON.parse(fs.readFileSync(path.join(root,'tests/fixtures/compat-real-ui-20261021.json'),'utf8')).list[0].chart;
charts.name = c.JYNameEngine.compare({ surname:'陳', candidates:['弘林','沐洪'], baselineName:'陳政軒', question:items.name[0] });
for (const [method,[question,knownFacts]] of Object.entries(items)) {
  const body = c.JYPromptPacket.build(method, charts[method], question, {knownFacts});
  if (!body.includes(question) || !body.includes(knownFacts.split('。')[0])) throw new Error(method+' lost question/notes');
  fs.writeFileSync(path.join(out,method+'.prompt.txt'),body);
  fs.writeFileSync(path.join(out,method+'.case.json'),JSON.stringify({method,question,knownFacts},null,2)+'\n');
  console.log(method,body.length,Buffer.byteLength(body));
}
