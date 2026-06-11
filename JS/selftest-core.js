// ═══════════════════════════════════════════════════════════════════
// 靜月之光占卜 · 全路徑自動檢測核心 v1 (2026/6/11 v85.3 基準)
// 設計目的：根治「每輪解讀踩到一個新 bug」的被動修法——
//   一次驗證：①部署完整性（線上檔案是否為最新版的字串簽名）
//             ②資料表完整性（78 張牌義、Mathers 表、數字學表）
//             ③引擎行為不變量（數字學、 多領域守門、提示詞組裝 13 種牌陣 × 4 工具）
//   sandbox（Node）與瀏覽器自檢頁共用本檔；env 介面隔離環境差異。
// env = { getText(fname)->Promise<string>, buildPrompt(tool)|null, evalGlobal(code)|null, report(group,name,pass,detail) }
// ═══════════════════════════════════════════════════════════════════
(function (root) {
  'use strict';

  // ── 字串簽名表：必含＝最新版證據；必不含＝舊版/已根治字串復活偵測 ──
  var SIGNATURES = {
    'tarot_upgrade.js': {
      must: [
        '二十/審判數',                                    // v85 數字學 11-21 補表
        'if (finalNum === 22) finalNum = 0',              // v85 22→0 愚者
        '加總後化約至0-21對應大牌',                        // v85 描述同步
        "if (S.form && S.form.domains && S.form.domains.length > 1) ftKey = ''" // v85.3 結果頁守門
      ],
      mustNot: [
        '逐牌先化約再加總（宮廷牌計侍1騎2后3王4，非各牌面號直加）' // 舊描述
      ]
    },
    'ai-analysis.js': {
      must: [
        '由全盤牌義裁決，不可未讀牌就下定論',               // v85 張力去結論化
        '小牌按面號（10保留為命運數）',                     // v85 數字學描述同步
        '實務常讀作「過多/過早」'                           // v85 阻礙位事實化
      ],
      mustNot: [
        '這件事本身方向有問題',
        '阻力是「太多」而非「不夠」',
        '核心牌逆但結果牌順→現在卡但最終會通'
      ]
    },
    'tarot.js': {
      must: [
        '主導權多在人為選擇',                               // v85 洞察事實化
        'S.form.domains && S.form.domains.length > 1'       // v85.3 牌義守門
      ],
      mustNot: [
        '靠實際行動和選擇就能改變',
        '內在阻礙和外在困難同時存在',
        '能量流動順暢，整體走向積極'
      ]
    },
    'prompt-export.js': {
      must: [
        '【礦物事實錨點',                                   // v85.2
        '它是金屬不是玻璃',                                 // v85.2 天鐵防呆
        '就不算崩解訊號',                                   // v85.2 崩解以牌義判
        '極小盤（四花色牌總數≤3',                           // v85.3
        'slice(0, 3)',                                      // v85.3 三領域提示
        '【多領域優先序】',                                 // v85.1
        '【輸出載體——硬規則】',                             // v85
        'FRAG_CRYSTAL_ZIWEI',                               // v85 紫微專屬
        '正位與逆位皆同）採現代 RWS 通行義',                 // v85 學理鎖定
        '必須轉成至少一條由該牌推出的具體行動'               // v85.1 建議位契約
      ],
      mustNot: [
        '約一成以下或 0～1 張且總數≥10',                    // 舊能量石判定
        '逆位採現代通行的「削弱／受阻／內化」邏輯（業界慣例，與 Waite 1888' // 舊學理鎖定
      ]
    },
    'ui.js': {
      must: ['S.form.domains'],                             // v85.3
      mustNot: []
    }
  };

  var SPREAD_IDS = ['three_card','five_card','cross','either_or','timeline','relationship',
                    'celtic_cross','mathers_21','mathers_horseshoe','fifteen_card',
                    'tree_of_life','zodiac','minor_arcana'];

  // 每個工具提示詞必含的共同骨架
  var PROMPT_COMMON = ['本次問題鎖定','【輸出載體——硬規則】','交稿前檢查'];
  var PROMPT_TAROT_EXTRA = ['【學理鎖定】','【礦物事實錨點','極小盤（四花色牌總數≤3'];
  // 舊字串絕不可出現在任何組裝結果
  var PROMPT_BLACKLIST = ['這件事本身方向有問題','約一成以下或 0～1 張且總數≥10',
                          '逆位採現代通行的「削弱／受阻／內化」邏輯（業界慣例，與 Waite 1888'];

  function runStatic(env, done) {
    var files = Object.keys(SIGNATURES);
    var pending = files.length;
    files.forEach(function (f) {
      env.getText(f).then(function (txt) {
        var sig = SIGNATURES[f];
        sig.must.forEach(function (m) {
          env.report('①部署簽名', f + ' 必含「' + m.slice(0, 18) + '…」', txt.indexOf(m) > -1, txt.indexOf(m) > -1 ? '' : '線上檔案不是最新版或上傳失敗');
        });
        sig.mustNot.forEach(function (m) {
          env.report('①部署簽名', f + ' 必不含舊字串「' + m.slice(0, 14) + '…」', txt.indexOf(m) === -1, txt.indexOf(m) === -1 ? '' : '舊版字串仍在線上');
        });
        // 資料表完整性（正則靜態掃描，免執行）
        if (f === 'tarot_upgrade.js') {
          var a = txt.indexOf('var MATHERS_1888_MEANINGS = {');
          var b = txt.indexOf('};', a);
          var entries = a > -1 ? (txt.slice(a, b).match(/up:'[^']+',\s*rv:'[^']+'/g) || []) : [];
          env.report('②資料表', 'Mathers 1888 表 78 張且 up/rv 非空', entries.length === 78, '實得 ' + entries.length);
          var numKeys = (txt.match(/^\s+(\d+):\s*\{zh:'/gm) || []).length;
          env.report('②資料表', '數字學意義表涵蓋 0–21（22 鍵）', numKeys >= 22, '實得 ' + numKeys + ' 鍵');
        }
        if (f === 'tarot.js') {
          var names = (txt.match(/n:'[^']+'/g) || []).length;
          env.report('②資料表', 'TAROT 牌名條目 ≥78', names >= 78, '實得 ' + names);
          var upMiss = /up:''|rv:''/.test(txt);
          env.report('②資料表', '通用 up/rv 牌義無空字串', !upMiss, upMiss ? '存在空牌義' : '');
        }
        if (--pending === 0 && done) done();
      }).catch(function (e) {
        env.report('①部署簽名', f + ' 讀取', false, String(e).slice(0, 80));
        if (--pending === 0 && done) done();
      });
    });
  }

  function runBehavior(env) {
    // ③數字學全域不變量（需 evalGlobal 已載入 tarotNumerologyAnalysis）
    if (typeof env.numerology === 'function') {
      var bad = [];
      for (var id = 0; id < 78; id++) {
        var r = env.numerology([{ id: id }]);
        if (!r || typeof r.finalNum !== 'number' || r.finalNum < 0 || r.finalNum > 21 || !r.finalMeaning) bad.push('單張#' + id);
      }
      for (var k = 0; k < 300; k++) { // 決定性偽隨機組合
        var n = 3 + (k % 13), draw = [];
        for (var j = 0; j < n; j++) draw.push({ id: (k * 7 + j * 11 + 13) % 78 });
        var r2 = env.numerology(draw);
        if (!r2 || r2.finalNum < 0 || r2.finalNum > 21 || !r2.finalMeaning) bad.push('組合#' + k);
      }
      env.report('③數字學', '78 單張＋300 組合：finalNum∈0–21 且意義非空', bad.length === 0, bad.slice(0, 5).join(','));
      var spot = env.numerology([{ id: 31 }, { id: 14 }, { id: 23 }, { id: 46 }, { id: 65 }]);
      env.report('③數字學', '已知盤驗算＝20 審判數', spot.finalNum === 20 && /總結算/.test(spot.finalMeaning || ''), JSON.stringify({ n: spot.finalNum, m: (spot.finalMeaning || '').slice(0, 10) }));
    }
    // ④多領域牌義守門（需 env.typeMeaning）
    if (typeof env.typeMeaning === 'function') {
      var multi = env.typeMeaning({ domains: ['love', 'money', 'health'] }, 15, true, 'love');
      env.report('④多領域守門', '多領域→中性牌義（不得是感情版）', multi.indexOf('關係中') === -1, multi.slice(0, 16));
      var single = env.typeMeaning({ domains: ['love'] }, 15, true, 'love');
      env.report('④多領域守門', '單領域→感情牌義保留', single.indexOf('關係中') === 0, single.slice(0, 16));
      var manual = env.typeMeaning({}, 15, true, 'love');
      env.report('④多領域守門', '手動選類型（無 domains）不受影響', manual.indexOf('關係中') === 0, manual.slice(0, 16));
    }
    // ⑤提示詞組裝：13 牌陣 × tarot ＋ ootk/ziwei/meihua
    if (typeof env.buildPrompt === 'function') {
      SPREAD_IDS.forEach(function (sid) {
        var p = '';
        try { p = env.buildPrompt('tarot', sid, ['love', 'money', 'health']); } catch (e) { p = ''; }
        var ok = !!p && p.indexOf('本次牌陣：') > -1;
        PROMPT_COMMON.concat(PROMPT_TAROT_EXTRA).forEach(function (m) { ok = ok && p.indexOf(m) > -1; });
        PROMPT_BLACKLIST.forEach(function (m) { ok = ok && p.indexOf(m) === -1; });
        env.report('⑤提示詞組裝', 'tarot/' + sid + ' 骨架完整且無舊字串', ok, ok ? '' : '缺片段或舊字串復活 len=' + p.length);
      });
      var p3 = env.buildPrompt('tarot', 'three_card', ['love', 'money', 'health']);
      env.report('⑤提示詞組裝', '三領域→三段提示＋優先序裁決', p3.indexOf('感情/關係——') > -1 && p3.indexOf('財運/財務——') > -1 && p3.indexOf('健康——') > -1 && p3.indexOf('【多領域優先序】') > -1, '');
      ['ootk', 'ziwei', 'meihua'].forEach(function (tool) {
        var p = '';
        try { p = env.buildPrompt(tool, 'three_card', ['money']); } catch (e) { p = ''; }
        var ok = !!p && PROMPT_COMMON.every(function (m) { return p.indexOf(m) > -1; }) && PROMPT_BLACKLIST.every(function (m) { return p.indexOf(m) === -1; });
        if (tool === 'ziwei') ok = ok && p.indexOf('紫微盤不做元素統計') > -1 && p.indexOf('極小盤（四花色牌總數≤3') === -1;
        if (tool === 'meihua') ok = ok && p.indexOf('能量石') === -1;
        if (tool === 'ootk') ok = ok && p.indexOf('【礦物事實錨點') > -1;
        env.report('⑤提示詞組裝', tool + ' 專屬規則正確', ok, ok ? '' : 'len=' + p.length);
      });
    }
  }

  root.JY_SELFTEST = { SIGNATURES: SIGNATURES, SPREAD_IDS: SPREAD_IDS, runStatic: runStatic, runBehavior: runBehavior };
})(typeof window !== 'undefined' ? window : globalThis);
