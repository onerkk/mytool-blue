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
        "if (S.form && S.form.domains && S.form.domains.length > 1) ftKey = ''", // v85.3 結果頁守門
        '_pickBySeed'                                       // v86 路由池輪替
      ],
      mustNot: [
        '逐牌先化約再加總（宮廷牌計侍1騎2后3王4，非各牌面號直加）' // 舊描述
      ]
    },
    'ai-analysis.js': {
      must: [
        '不自動等於有新人物出現',                             // v86.1 宮廷結果位事實化措辭

        '由全盤牌義裁決，不可未讀牌就下定論',               // v85 張力去結論化
        '小牌按面號（10保留為命運數）',                     // v85 數字學描述同步
        '實務常讀作「過多/過早」'                           // v85 阻礙位事實化
      ],
      mustNot: [
        '最終出現的人',                                      // 舊誘導措辭（第三者題遞刀）
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
        '必須轉成至少一條由該牌推出的具體行動',             // v85.1 建議位契約
        '嚴禁輸出任何百分比、幾成、小數或區間數字',  // v85.4 機率題規則
        '【通用溯源鐵律——適用全文每一句】',                // v85.5 無出處數字整類根治
        '給不出牌面的選項不准排名',                          // v86.1 決策排序逐項溯源契約
        '漏點任何一宮＝破功',                                // v86.2 黃道每宮點名
        '不可用「偏少／略缺／偏弱」',                         // v86.2 能量石均衡防繞行
        '一張不漏＝破功',                                    // v86.3 GD15 每張點名
        '每張牌名在正文至少出現一次',                         // v86.3 M21 成句全覆蓋
        '▲▼正逆符號只是資料標記'                              // v86.4 清單去符號註記
      ],
      mustNot: [
        '約一成以下或 0～1 張且總數≥10',                    // 舊能量石判定
        '逆位採現代通行的「削弱／受阻／內化」邏輯（業界慣例，與 Waite 1888' // 舊學理鎖定
      ]
    },
    'ui.js': {
      must: ['S.form.domains'],                             // v85.3
      mustNot: []
    },
    'spread-picker.js': {
      must: ['錢包找得回來嗎'],                              // v86 決策導向說明（例句）
      mustNot: ['代表牌在右、三排七']                          // 舊技法導向說明
    },
    'ink-flow.js': {
      must: [
        '墨流 ink-flow v1.1',                                 // v86.10 面板內掛載模式
        '面板內掛載',                                          // v86.10 模式證據
        'window.JY_INK'                                       // API 掛載
      ],
      mustNot: [
        '墨流 ink-flow v1.0'                                   // 舊版（首頁全域層）未換偵測
      ]
    },
    'lenormand.js': {
      must: [
        '雷諾曼牌 Lenormand v5.4',
        '人生建議命題／核准證據視圖／提示詞收斂根治',
        'attraction_opportunity',
        'sexual_component',
        'sexual_event',
        'unsupported_age',
        'health_medical_cause',
        'health_symbolic_context',
        'comparison_suitability',
        'business_success',
        'debt_clearance',
        'positive_net_worth',
        'life_guidance',
        'timing_rules_not_enabled',
        'function assignGlobalEvidenceUids',
        'function rankAndLimitClusterIds',
        'function modernThemeAllowedForType',
        '<claim_evidence>',
        '<approved_evidence_scope rule="only_claim_linked">',
        'basis="rule_limit"',
        '<timing_rules enabled="false"',
        'function detectComparisonQuestion',
        'function resolveSpreadForQuestion',
        'function buildComparisonNinePacket',
        'function buildEvidenceAwareAnalysisRequirements',
        'function buildApprovedEvidenceView',
        'function buildStoneRecommendationCandidates',
        'site_symmetric_nine_comparison',
        'site_petit_lenormand_v7_4_approved_evidence',
        '本站受控的現代工作詞典',
        '不得自行延伸成清庫存、投廣告、調價格、追毛利',
        '<stone_recommendation mode="select_after_interpretation"',
        '若都不吻合',
        '選項名稱只是標籤',
        'hypothetical_noncurrent_counterpart',
        'function expandSegmentToQuestions',
        'function buildClusters',
        'function validateEvidencePacket',
        'function failClosedPacket',
        '<approved_claims>',
        '<forbidden_claims>',
        '<core_clusters confidence_counting="one_per_cluster">',
        '<selected_context certainty_effect="none" scope="approved_clusters_only">',
        '<packet_validation status="',
        '魚不得轉義為性慾',
        '鞭子不得轉義為性行為',
        '吸引不等於性成分，性成分不等於事件',
        '<age_rules enabled="false">',
        'personStatusForScope(item.targetScope)',
        "key:'結束・終止・封閉'",
        "key:'負擔・考驗・難卸壓力'",
        "pos:'暫時不明、判斷需保留'",
        "pos:'阻礙存在、進展延遲、難以跨越'",
        "pos:'持續耗損、逐步減少'",
        "pos:'負擔、考驗、難卸責任'"
      ],
      mustNot: [
        '雷諾曼牌 Lenormand v5.3',
        'site_petit_lenormand_v7_3_evidence_lineage',
        '雷諾曼牌 Lenormand v5.2',
        'site_petit_lenormand_v7_2_evidence_first',
        '<relevant_houses context_only="true">',
        '雷諾曼牌 Lenormand v5.1',
        '雷諾曼牌 Lenormand v5.0',
        '雷諾曼牌 Lenormand v4.5',
        'site_petit_lenormand_v6_deep',
        'types="general" target_scope="current_partner"',
        '<modern_context certainty_effect="none">',
        '<thematic_repetitions scope="approved_local_context">',
        'valid_segments列的是最大直線',
        'current_or_primary_counterpart',
        "key:'結束・轉化・終止'",
        "key:'負擔・命運・考驗'",
        '末排四張依本站約定只作獨立總結',
        '不建立與第四排的上下相鄰',
        "pos:'困惑即將散去、暫時看不清'",
        "pos:'堅毅、大目標、穩固'",
        "pos:'減少壓力、放下'",
        "pos:'宗教、精神信仰、承擔考驗'",
        '<stone_text>'
      ]
    }  };

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
    // ⑥牌陣路由覆蓋（v86）：13 種牌陣各有代表句可達；深度池可重現且落在池內
    if (typeof env.route === 'function') {
      var EXPECT = [
        ['這件事會成嗎？', 'three_card'],
        ['我該怎麼提升業績？', 'five_card'],
        ['我跟他會復合嗎？', 'relationship'],
        ['該留下還是離職？', 'either_or'],
        ['什麼時候會有結果？', 'timeline'],
        ['我陷入瓶頸了怎麼辦？', 'cross'],
        ['為什麼我總是遇到同一種人？', 'tree_of_life'],
        ['我今年的整體運勢如何？', 'zodiac'],
        ['錢包不見了找得回來嗎？', 'minor_arcana'],
        ['幫我看看感情和工作整體狀況', 'fifteen_card'],
        ['這段關係的來龍去脈是什麼？', 'mathers_21'],
        ['我和他之間怎麼回事？接下來呢？會穩定嗎？', 'celtic_cross'],
        ['把我的人生全部攤開看一次最完整的', 'mathers_horseshoe']
      ];
      EXPECT.forEach(function (pair) {
        var got = '';
        try { got = env.route(pair[0]); } catch (e) { got = 'ERR'; }
        env.report('⑥路由覆蓋', pair[1] + ' 可達（' + pair[0].slice(0, 12) + '…）', got === pair[1], '實得 ' + got);
      });
      var POOL = ['celtic_cross', 'fifteen_card', 'mathers_21'];
      var p1 = env.route('最近運勢如何？'), p2 = env.route('最近運勢如何？');
      env.report('⑥路由覆蓋', '深度池：口語概覽落在池內', POOL.indexOf(p1) > -1, '實得 ' + p1);
      env.report('⑥路由覆蓋', '深度池：同題可重現', p1 === p2, p1 + ' vs ' + p2);
    }

    // ⑦雷諾曼 v5.4 人生建議命題／核准證據視圖／提示詞收斂根治
    var ln = env.lenormandTest || root.__JY_LN_TEST__;
    if (ln && typeof ln.inferQuestionDimensions === 'function') {
      var qSex = ln.inferQuestionDimensions('今年有非現任的肉體桃花嗎？');
      env.report('⑦雷諾曼路由', '非現任肉體桃花→桃花／性成分／事件三命題＋非現任假設對象',
        qSex.types.indexOf('attraction_opportunity') > -1 &&
        qSex.types.indexOf('sexual_component') > -1 &&
        qSex.types.indexOf('sexual_event') > -1 &&
        qSex.targetScope === 'hypothetical_noncurrent_counterpart', JSON.stringify(qSex));

      var sexSplit = ln.splitQuestionSegments('今年有非現任的肉體桃花嗎？她幾歲？');
      env.report('⑦雷諾曼路由', '複合題拆成桃花、性成分、事件、不可驗證年齡四 proposition',
        sexSplit.length === 4 &&
        sexSplit[0].type === 'attraction_opportunity' &&
        sexSplit[1].type === 'sexual_component' &&
        sexSplit[2].type === 'sexual_event' &&
        sexSplit[3].type === 'unsupported_age', JSON.stringify(sexSplit));
      env.report('⑦雷諾曼路由', '使用者的「今年」只作問題範圍，不啟用時間推算',
        !!sexSplit[0].timeScope && sexSplit[0].timeScope.raw === '今年', JSON.stringify(sexSplit[0].timeScope));

      var qAge = ln.inferQuestionDimensions('未來會有25歲上下跟我交往嗎？');
      env.report('⑦雷諾曼路由', '未來交往＋25歲→關係命題＋年齡限制，不誤判當下意圖',
        qAge.types.indexOf('relationship_future') > -1 && qAge.types.indexOf('relationship_intent') === -1 &&
        qAge.targetScope === 'unknown_future_counterpart' && qAge.qualifiers[0] && qAge.qualifiers[0].raw === '25歲上下', JSON.stringify(qAge));

      var qHealth = ln.splitQuestionSegments('我身體為何一直發炎 長痘痘');
      env.report('⑦雷諾曼路由', '醫療原因與健康象徵狀態分成兩個 proposition',
        qHealth.length === 2 && qHealth[0].type === 'health_medical_cause' && qHealth[1].type === 'health_symbolic_context', JSON.stringify(qHealth));

      var qCareer = ln.splitQuestionSegments('正職工作適合我嗎？未來我還會升遷嗎？');
      env.report('⑦雷諾曼路由', '工作適配與升遷保持獨立命題',
        qCareer.length === 2 && qCareer[0].type === 'career_fit' && qCareer[1].type === 'career_promotion', JSON.stringify(qCareer));

      var qCompare = ln.splitQuestionSegments('金太陽跟黑靈骨龍宮舍利 那個更適合我配戴');
      env.report('⑦雷諾曼比較路由', '二選一配戴題抽出兩個選項並進入 comparison_suitability',
        qCompare.length === 1 && qCompare[0].type === 'comparison_suitability' &&
        qCompare[0].options && qCompare[0].options[0] === '金太陽' && qCompare[0].options[1] === '黑靈骨龍宮舍利', JSON.stringify(qCompare));
      var cmpAlt = ln.detectComparisonQuestion('月光石還是紫水晶比較適合我');
      env.report('⑦雷諾曼比較路由', '還是／比較適合語型可穩定抽取選項',
        !!cmpAlt && cmpAlt.options[0] === '月光石' && cmpAlt.options[1] === '紫水晶', JSON.stringify(cmpAlt));
      var cmpPrinciple = ln.detectComparisonQuestion('我搭配手鍊 是要搭配自己喜歡的 還是要看八字5行？');
      env.report('⑦雷諾曼比較路由', '自然語句「喜好還是八字五行」正規化為兩個明確選項',
        !!cmpPrinciple && cmpPrinciple.options[0] === '自己喜歡的款式' && cmpPrinciple.options[1] === '依八字五行搭配' && cmpPrinciple.criterion === '手鍊搭配原則', JSON.stringify(cmpPrinciple));
      var notComparison = ln.detectComparisonQuestion('我喜歡水晶和手鍊');
      env.report('⑦雷諾曼比較路由', '一般並列句不誤判成比較題', notComparison === null, JSON.stringify(notComparison));

      var cmpResolved = ln.resolveSpreadForQuestion('金太陽跟黑靈骨龍宮舍利 那個更適合我配戴','grand');
      env.report('⑦雷諾曼比較路由', '比較題即使手動選大牌陣仍強制使用對稱九宮格',
        cmpResolved.id === 'nine' && cmpResolved.forced === true, JSON.stringify(cmpResolved));
      var normalResolved = ln.resolveSpreadForQuestion('正職工作適合我嗎','grand');
      env.report('⑦雷諾曼比較路由', '非比較題保留使用者手動牌陣',
        normalResolved.id === 'grand' && normalResolved.forced === false, JSON.stringify(normalResolved));

      if (typeof ln.buildPrompt === 'function' && ln.cards) {
        var ids = [30,27,34,26,28,17,36,22,33,3,9,18,24,4,8,7,23,19,21,11,14,25,29,5,6,20,10,35,13,1,15,16,2,12,32,31];
        var draw = ids.map(function(id){ return ln.cards[id - 1]; });
        var cmpDraw = [31,8,24,35,33,21,6,4,30].map(function(id){ return ln.cards[id - 1]; });
        var cmpPacket = ln.buildComparisonNinePacket(qCompare[0], cmpDraw);
        env.report('⑦雷諾曼比較證據', 'A／B 使用對稱三位置，中央三張只作共同軸',
          cmpPacket.validation.ok && cmpPacket.optionA.positions.length === 3 && cmpPacket.optionB.positions.length === 3 && cmpPacket.shared.positions.length === 3,
          JSON.stringify({a:cmpPacket.optionA.band,b:cmpPacket.optionB.band,cap:cmpPacket.claimPlan.certaintyCap}));
        env.report('⑦雷諾曼比較證據', '相同九張牌不因選項名稱含太陽而改變程式結論',
          (function(){
            var q2=ln.splitQuestionSegments('白水晶跟黑曜石 哪個更適合我配戴')[0];
            var p2=ln.buildComparisonNinePacket(q2,cmpDraw);
            return p2.claimPlan.status===cmpPacket.claimPlan.status && p2.claimPlan.certaintyCap===cmpPacket.claimPlan.certaintyCap;
          })(), '');
        var cmpPrompt = ln.buildPrompt('金太陽跟黑靈骨龍宮舍利 那個更適合我配戴', cmpDraw, 'nine', null, 'male');
        env.report('⑦雷諾曼比較提示詞', '比較提示含預先分配、名稱非牌義、A/B對稱與程式結論上限',
          cmpPrompt.indexOf('site_symmetric_nine_comparison') > -1 &&
          cmpPrompt.indexOf('選項名稱只是標籤') > -1 &&
          cmpPrompt.indexOf('O-A1') > -1 && cmpPrompt.indexOf('O-B1') > -1 &&
          cmpPrompt.indexOf('X-C2 決策核心') > -1 &&
          cmpPrompt.indexOf('不得將選項名稱映射成同名牌') > -1,
          'len='+cmpPrompt.length);
        env.report('⑦雷諾曼比較提示詞', '比較題不產生 Grand Tableau D/S/C 證據牆',
          cmpPrompt.indexOf('<evidence_catalog>') === -1 && cmpPrompt.indexOf('<core_clusters') === -1 && cmpPrompt.length < 8000,
          'len='+cmpPrompt.length);
        env.report('⑦雷諾曼推薦', '結尾改為解讀後選擇候選，不再寫死 stone_text／白水晶',
          cmpPrompt.indexOf('<stone_recommendation mode="select_after_interpretation"') > -1 &&
          cmpPrompt.indexOf('<stone_text>') === -1 && cmpPrompt.indexOf('若都不吻合') > -1,
          '');
        var choiceCandidates = ln.buildStoneRecommendationCandidates('我搭配手鍊 是要搭配自己喜歡的 還是要看八字五行？', ln.splitQuestionSegments('我搭配手鍊 是要搭配自己喜歡的 還是要看八字五行？'), []);
        var businessCandidates = ln.buildStoneRecommendationCandidates('我的副業賣場該怎麼提升業績？', ln.splitQuestionSegments('我的副業賣場該怎麼提升業績？'), []);
        env.report('⑦雷諾曼推薦', '問題方向不同會召回對應候選，候選排列不作推薦順位',
          choiceCandidates.some(function(x){return x.name === '紫水晶';}) && businessCandidates.some(function(x){return x.name === '黃水晶';}),
          JSON.stringify({choice:choiceCandidates,business:businessCandidates}));
        var invalidCmpPrompt = ln.buildPrompt('金太陽跟黑靈骨龍宮舍利 那個更適合我配戴', draw, 'grand', null, 'male');
        env.report('⑦雷諾曼比較守門', '未使用對稱九宮格時 fail-closed，不事後挑牌比較',
          invalidCmpPrompt.indexOf('comparison_requires_symmetric_nine') > -1 && invalidCmpPrompt.indexOf('任何選項優劣結論') > -1 && invalidCmpPrompt.indexOf('<evidence_catalog>') === -1,
          '');
        var geom = ln.buildGrandGeometry(draw);

        var lifeQuestion = '我對人生有些迷茫 請給我建議';
        var lifeProps = ln.splitQuestionSegments(lifeQuestion);
        env.report('⑦雷諾曼人生建議路由', '人生迷茫／請給建議獨立進入 life_guidance，不再落入泛用 general',
          lifeProps.length === 1 && lifeProps[0].type === 'life_guidance', JSON.stringify(lifeProps));
        var lifePacket = ln.buildEvidencePacket(geom, lifeProps[0], 'male');
        env.report('⑦雷諾曼人生建議門檻', '人生建議使用分項核准主張，不再由單一通用 A1 包辦所有結論',
          lifePacket.validation && lifePacket.validation.ok && lifePacket.claimPlan.status !== 'model_evaluate' &&
          (lifePacket.claimPlan.approvedClaims || []).length >= 3 &&
          (lifePacket.claimPlan.approvedClaims || []).every(function(c){ return String(c).indexOf('依核心證據與反證') === -1; }),
          JSON.stringify(lifePacket.claimPlan));
        var lifeUsed = {};
        var lifeLinksOk = (lifePacket.claimPlan.claimEvidence || []).every(function(link){
          return (link.clusters || []).length <= 2 && (link.clusters || []).every(function(cid){
            if (lifeUsed[cid]) return false;
            lifeUsed[cid] = true;
            return true;
          });
        });
        env.report('⑦雷諾曼人生建議血緣', '每項主張最多兩個 C，且不同主張不重複使用同一 C', lifeLinksOk,
          JSON.stringify(lifePacket.claimPlan.claimEvidence));
        var lifeView = ln.buildApprovedEvidenceView(lifePacket);
        var lifeApprovedIds = {};
        (lifeView.clusters || []).forEach(function(c){ lifeApprovedIds[c.id] = true; });
        var lifeViewRefsOk = (lifeView.structures || []).every(function(st){
          return (lifeView.clusters || []).some(function(c){ return (c.refs || []).indexOf(st.id) > -1; });
        });
        env.report('⑦雷諾曼核准證據視圖', 'runtime 只保留 claim_evidence 真正引用的 C／D／S',
          lifeViewRefsOk && (lifeView.clusters || []).length === Object.keys(lifeUsed).length &&
          (lifeView.structures || []).length <= lifePacket.structures.length,
          JSON.stringify({all:lifePacket.structures.length,approved:lifeView.structures.length,clusters:Object.keys(lifeApprovedIds)}));
        var lifePrompt = ln.buildPrompt(lifeQuestion, draw, 'grand', null, 'male');
        env.report('⑦雷諾曼人生建議提示詞', 'v7.4 只輸出核准證據並封鎖未核准脈絡偷渡',
          lifePrompt.indexOf('site_petit_lenormand_v7_4_approved_evidence') > -1 &&
          lifePrompt.indexOf('type="life_guidance"') > -1 &&
          lifePrompt.indexOf('<approved_evidence_scope rule="only_claim_linked">') > -1 &&
          lifePrompt.indexOf('<selected_context certainty_effect="none" scope="approved_clusters_only">') > -1 &&
          lifePrompt.indexOf('N-P') === -1 && lifePrompt.indexOf('N-T') === -1 &&
          lifePrompt.indexOf('M1 ') === -1 && lifePrompt.indexOf('K1 ') === -1 &&
          lifePrompt.indexOf('I1 ') === -1 && lifePrompt.indexOf('F-corners') === -1,
          'len=' + lifePrompt.length);
        env.report('⑦雷諾曼人生建議提示詞', '人生建議不載入無關財務範例或自行生成具體處置',
          lifePrompt.indexOf('收入或副業成功不等於') === -1 &&
          lifePrompt.indexOf('清庫存') === -1 && lifePrompt.indexOf('投廣告') === -1 &&
          lifePrompt.indexOf('不得自行指定職業、離職、分手、搬家、期限或唯一使命') > -1 &&
          lifePrompt.length < 8000,
          'len=' + lifePrompt.length);
        var lifeCandidates = ln.buildStoneRecommendationCandidates(lifeQuestion, lifeProps, [{item:lifeProps[0],packet:lifePacket}]);
        env.report('⑦雷諾曼人生建議推薦', '水晶候選只讀核准證據，方向題可召回紫水晶但不固定推薦',
          lifeCandidates.some(function(x){return x.name === '紫水晶';}) &&
          lifePrompt.indexOf('<stone_text>') === -1 && lifePrompt.indexOf('候選按名稱排列，不是推薦順位') > -1,
          JSON.stringify(lifeCandidates));

        var packets = sexSplit.map(function(q){ return ln.buildEvidencePacket(geom, q, 'male'); });

        env.report('⑦雷諾曼證據包', '每個 packet 通過程式驗證',
          packets.every(function(p){ return p.validation && p.validation.ok; }), JSON.stringify(packets.map(function(p){ return p.validation; })));
        env.report('⑦雷諾曼證據包', '年齡 packet fail-closed：零牌面證據',
          packets[3].structures.length === 0 && packets[3].clusters.length === 0 && packets[3].claimPlan.status === 'unsupported_age', JSON.stringify(packets[3].claimPlan));
        env.report('⑦雷諾曼證據包', '命題專屬分簇不再把全部 D/S 合成單一 C',
          packets[0].clusters.length > 1 && packets[0].clusters.length < packets[0].structures.length, 'clusters=' + packets[0].clusters.length + ', structures=' + packets[0].structures.length);
        env.report('⑦雷諾曼證據包', '現代脈絡已去重並限制數量',
          packets.slice(0,3).every(function(p){ return p.modernContext.mirrors.length <= 3 && p.modernContext.knightMoves.length <= 3 && p.modernContext.intersections.length <= 2; }), '');

        var allRefsOk = packets.slice(0,3).every(function(p){
          var counts = {};
          p.clusters.forEach(function(c){ c.refs.forEach(function(r){ counts[r] = (counts[r] || 0) + 1; }); });
          return p.structures.every(function(st){ return counts[st.id] === 1; });
        });
        env.report('⑦雷諾曼證據包', '每個 D/S 恰好歸屬一個 C，不重複計分', allRefsOk, '');
        var analysisReq = ln.buildEvidenceAwareAnalysisRequirements(packets[0]);
        env.report('⑦雷諾曼深度契約', '段落上限依命題與實際C極性啟用，不再固定強迫全部展開',
          analysisReq.paragraphMax >= analysisReq.paragraphMin &&
          ['required','insufficient_or_omit'].indexOf(analysisReq.favorable) > -1 &&
          ['required','omit_if_absent'].indexOf(analysisReq.risk) > -1,
          JSON.stringify(analysisReq));

        var moneyQuestion = '我副業什麼時候才能成功 讓我負債完全清空 有正資產';
        var moneyProps = ln.splitQuestionSegments(moneyQuestion);
        env.report('⑦雷諾曼財務命題', '成功、清債、正資產、時間拆成四個獨立 proposition',
          moneyProps.length === 4 && moneyProps[0].type === 'business_success' && moneyProps[1].type === 'debt_clearance' && moneyProps[2].type === 'positive_net_worth' && moneyProps[3].type === 'timing',
          JSON.stringify(moneyProps.map(function(x){return x.type;})));
        var moneyEntries = moneyProps.map(function(item){return {item:item,packet:ln.buildEvidencePacket(geom,item,'male')};});
        ln.assignGlobalEvidenceUids(moneyEntries);
        var timePacket = moneyEntries[3].packet;
        env.report('⑦雷諾曼時間守門', '未啟用時間規則時為空證據包且禁止猜日期',
          timePacket.structures.length === 0 && timePacket.claimPlan.status === 'timing_rules_not_enabled' && timePacket.claimPlan.certaintyCap === '不足以判定具體時間',
          JSON.stringify(timePacket.claimPlan));
        env.report('⑦雷諾曼財務門檻', '商業成功、清債、正資產各有獨立 claim_plan，不再落入通用 model_evaluate',
          moneyEntries.slice(0,3).every(function(e){return e.packet.claimPlan.status !== 'model_evaluate';}) &&
          moneyEntries[0].packet.claimPlan.forbiddenClaims.some(function(x){return x.indexOf('清償負債') > -1;}) &&
          moneyEntries[1].packet.claimPlan.forbiddenClaims.some(function(x){return x.indexOf('副業成功') > -1;}) &&
          moneyEntries[2].packet.claimPlan.forbiddenClaims.some(function(x){return x.indexOf('清債等於正資產') > -1;}),
          JSON.stringify(moneyEntries.slice(0,3).map(function(e){return e.packet.claimPlan.status;})));
        function makeGatePacket(type, cardIds, polarity) {
          var positions = cardIds.map(function(id, idx){ return {slot:idx + 1, card:ln.cards[id - 1]}; });
          var structure = {id:'D1', kind:'adjacency', positions:positions, cardIds:cardIds.slice()};
          return {
            question:{type:type, types:[type]},
            structures:[structure], directPairs:[], segments:[],
            clusters:[{id:'C1', polarity:polarity || 'neutral', structures:[structure], refs:['D1']}]
          };
        }
        var businessLinkOnly = ln.buildClaimPlan(makeGatePacket('business_success',[28,34],'neutral'),'male');
        env.report('⑦雷諾曼財務反例', '紳士＋魚只證明副業／財務連結，不得升格為成功',
          businessLinkOnly.status === 'business_link_without_outcome' && businessLinkOnly.certaintyCap.indexOf('成功結果不足') > -1,
          JSON.stringify(businessLinkOnly));
        var debtCutOnly = ln.buildClaimPlan(makeGatePacket('debt_clearance',[15,10],'mixed'),'male');
        env.report('⑦雷諾曼財務反例', '熊＋鐮刀只支持切減壓力，不得升格為負債歸零',
          debtCutOnly.status === 'debt_cut_only' && debtCutOnly.certaintyCap.indexOf('不足以確認清空') > -1,
          JSON.stringify(debtCutOnly));
        var netWorthLinkOnly = ln.buildClaimPlan(makeGatePacket('positive_net_worth',[28,34],'neutral'),'male');
        env.report('⑦雷諾曼財務反例', '收入／財務連結不足以證明正資產',
          netWorthLinkOnly.status === 'positive_net_worth_insufficient' && netWorthLinkOnly.certaintyCap === '不足以確認正資產',
          JSON.stringify(netWorthLinkOnly));
        env.report('⑦雷諾曼證據最小化', '財務複合結論只連到最小充分C集合，避免同現象多線段灌票',
          moneyEntries.slice(0,3).every(function(e){return (e.packet.claimPlan.claimEvidence||[]).every(function(link){return (link.clusters||[]).length <= 2;});}),
          JSON.stringify(moneyEntries.slice(0,3).map(function(e){return e.packet.claimPlan.claimEvidence;})));
        env.report('⑦雷諾曼脈絡相關性', '商業／財務 selected_context 不輸出情感主題干擾結論',
          moneyEntries.slice(0,3).every(function(e){return !(e.packet.modernContext.clusterThemes||[]).some(function(t){return t.id==='relationship_bond'||t.id==='sexual_sensual';});}),
          JSON.stringify(moneyEntries.slice(0,3).map(function(e){return e.packet.modernContext.clusterThemes;})));
        var uidByKey = {};
        moneyEntries.forEach(function(e){e.packet.structures.forEach(function(st){var key=(st.kind==='adjacency'?'D:':'S:')+st.positions.map(function(p){return p.slot;}).sort(function(a,b){return a-b;}).join('-');if(uidByKey[key]&&uidByKey[key]!==st.evidenceUid)uidByKey[key]='MISMATCH';else uidByKey[key]=st.evidenceUid;});});
        env.report('⑦雷諾曼證據血緣', '跨命題相同實體結構共用 evidence_uid',
          Object.keys(uidByKey).every(function(k){return uidByKey[k]!=='MISMATCH';}), JSON.stringify(uidByKey).slice(0,220));
        var moneyPrompt = ln.buildPrompt(moneyQuestion, draw, 'grand', null, 'male');
        env.report('⑦雷諾曼提示詞', 'v7.4 含四命題、claim_evidence、核准證據範圍與時間守門',
          moneyPrompt.indexOf('site_petit_lenormand_v7_4_approved_evidence') > -1 &&
          moneyPrompt.indexOf('type="debt_clearance"') > -1 && moneyPrompt.indexOf('type="positive_net_worth"') > -1 &&
          moneyPrompt.indexOf('<claim_evidence>') > -1 && moneyPrompt.indexOf('basis="rule_limit"') > -1 && moneyPrompt.indexOf('<timing_rules enabled="false"') > -1 &&
          moneyPrompt.indexOf('本站受控的現代工作詞典') > -1 && moneyPrompt.indexOf('不得自行延伸成清庫存、投廣告、調價格、追毛利') > -1 &&
          moneyPrompt.indexOf('<relevant_houses') === -1,
          'len='+moneyPrompt.length);

        var lp = ln.buildPrompt('今年有非現任的肉體桃花嗎？她幾歲？', draw, 'grand', null, 'male');
        env.report('⑦雷諾曼提示詞', 'v7.4 提示詞含命題、人物狀態、批准主張與核准證據範圍',
          lp.indexOf('site_petit_lenormand_v7_4_approved_evidence') > -1 &&
          lp.indexOf('type="attraction_opportunity"') > -1 &&
          lp.indexOf('type="sexual_component"') > -1 &&
          lp.indexOf('type="sexual_event"') > -1 &&
          lp.indexOf('type="unsupported_age"') > -1 &&
          lp.indexOf('status="hypothetical"') > -1 &&
          (lp.match(/packet_validation status="pass"/g) || []).length === 4 &&
          lp.indexOf('<approved_claims>') > -1 && lp.indexOf('<forbidden_claims>') > -1, 'len=' + lp.length);
        env.report('⑦雷諾曼提示詞', '性命題邊界鎖定：魚與鞭子不得越權轉義',
          lp.indexOf('魚不得轉義為性慾') > -1 && lp.indexOf('鞭子不得轉義為性行為') > -1 &&
          lp.indexOf('吸引不等於性成分，性成分不等於事件') > -1, '');
        var ageStart = lp.indexOf('<evidence_packet proposition_id="q2"');
        var ageEnd = lp.indexOf('</evidence_packet>', ageStart);
        var ageBlock = ageStart > -1 && ageEnd > ageStart ? lp.slice(ageStart, ageEnd) : '';
        env.report('⑦雷諾曼提示詞', '不可驗證年齡不生成 evidence_catalog／現代脈絡',
          ageBlock.indexOf('<evidence_catalog>') === -1 && ageBlock.indexOf('<selected_context') === -1 && ageBlock.indexOf('unsupported_age') > -1, ageBlock.slice(0,120));
        env.report('⑦雷諾曼提示詞', '提示詞移除全量技法資料牆並控制長度',
          lp.length < 14000 && lp.indexOf('<modern_context certainty_effect="none">') === -1 && lp.indexOf('<thematic_repetitions scope="approved_local_context">') === -1,
          'len=' + lp.length);
        env.report('⑦雷諾曼提示詞', '品牌連結為完整 Markdown，沒有裸文字缺網址',
          lp.indexOf('[靜月之光蝦皮賣場](https://shopee.tw/a50h95648d?tab=shop)') > -1, '');

        var hp = ln.buildPrompt('我身體為何一直發炎 長痘痘', draw, 'grand', null, 'male');
        env.report('⑦雷諾曼提示詞', '健康病因採空證據限制，另保留象徵性深讀',
          hp.indexOf('type="health_medical_cause"') > -1 && hp.indexOf('type="health_symbolic_context"') > -1 && hp.indexOf('status="medical_limit"') > -1,
          '');
      }
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
