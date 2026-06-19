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
        '雷諾曼牌 Lenormand v10.0',
        '四牌陣統一編譯器核心重構',
        'site_lenormand_multispread_formula_v3',
        'site_petit_lenormand_v10_0_multispread_compiler',
        'direct_pair_weight_3',
        'contiguous_three_card_sentence_weight_2',
        'unique_support_risk_five_level',
        'select_top_unique_support_and_risk_with_overlap_discount',
        'spread_modes="three_five_nine_grand"',
        'one_physical_structure_one_entry',
        'function buildSpreadGeometry',
        'function compileLayeredClaimPlan',
        'function _lnSelectLayeredEvidence',
        'function _lnStructureScore',
        'action_effectiveness',
        'decision_suitability',
        'outcome_tendency',
        'risk_guidance',
        'attraction_opportunity',
        'sexual_component',
        'sexual_event',
        'business_success',
        'debt_clearance',
        'positive_net_worth',
        'life_guidance',
        'timing_rules_not_enabled',
        'unsupported_age',
        'health_medical_cause',
        'comparison_suitability',
        '<claim_evidence counting="same_structure_never_adds_weight_twice">',
        '<timing_rules enabled="false"',
        'function detectComparisonQuestion',
        'function buildComparisonNinePacket',
        'function buildApprovedEvidenceView',
        'function buildStoneRecommendationCandidates',
        'site_symmetric_nine_comparison',
        '本站受控的現代工作詞典',
        '<stone_recommendation mode="select_after_interpretation"',
        'hypothetical_noncurrent_counterpart',
        'function validateEvidencePacket',
        'function failClosedPacket',
        '魚不得轉義為性慾',
        '鞭子不得轉義為性行為',
        '<age_rules enabled="false">',
        "key:'結束・終止・封閉'",
        "key:'負擔・考驗・難卸壓力'"
      ],
      mustNot: [
        'site_petit_lenormand_v8_0_canonical_formula',
        'site_lenormand_canonical_formula_v1',
        'site_lenormand_layered_formula_v2',
        'site_petit_lenormand_v9_0_layered_composition',
        'direct_adjacency',
        'three_card_nonvoting',
        'distinct_uid_per_required_gate',
        'no_formula_for_proposition',
        '直接相鄰D是唯一可提高結論強度的證據',
        'var QUESTION_SCHEMAS =',
        'directPairs=directPairs.slice(0,24)',
        '<selected_context',
        '<core_clusters confidence_counting="one_per_cluster">',
        '<relevant_houses context_only="true">',
        '魚代表慾望',
        '鞭子代表性行為'
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

    // ⑦雷諾曼 v10.0 四牌陣統一編譯器／通用語義核心
    var ln = env.lenormandTest || root.__JY_LN_TEST__;
    if (ln && typeof ln.inferQuestionDimensions === 'function') {
      function idsToDraw(ids){ return ids.map(function(id){ return ln.cards[id - 1]; }); }
      function seededShuffle(seed){
        var ids=[]; for(var i=1;i<=36;i++)ids.push(i);
        var x=seed>>>0;
        function rnd(){x=(x*1664525+1013904223)>>>0;return x/4294967296;}
        for(var j=ids.length-1;j>0;j--){var k=Math.floor(rnd()*(j+1)),tmp=ids[j];ids[j]=ids[k];ids[k]=tmp;}
        return idsToDraw(ids);
      }
      function buildEntries(question, draw, spread){
        var geom=ln.buildSpreadGeometry(draw,spread||'grand'),items=ln.splitQuestionSegments(question);
        var entries=items.filter(function(x){return x.type!=='comparison_suitability';}).map(function(item){return {item:item,packet:ln.buildEvidencePacket(geom,item,'male')};});
        ln.assignGlobalEvidenceUids(entries);ln.enforceGlobalClaimEvidenceUniqueness(entries,'male');
        return entries;
      }
      function linkedStructures(packet){
        var out=[];
        (packet.claimPlan.claimEvidence||[]).forEach(function(link){(link.clusters||[]).forEach(function(cid){var c=(packet.clusters||[]).filter(function(z){return z.id===cid;})[0];if(c&&c.structures&&c.structures[0])out.push(c.structures[0]);});});
        return out;
      }
      function ledgerIds(prompt){return Array.prototype.map.call(prompt.matchAll(/<evidence id="(E\d+)"/g),function(m){return m[1];});}

      var campaign='這次我端午節 我副業蝦皮 下1千元廣告 並且辦折價活動 是否能順利帶起買氣？是否正確？';
      var campaignSplit=ln.splitQuestionSegments(campaign);
      env.report('⑦雷諾曼語義解析','短期行銷方案保留成效與適合度，不再改寫成長期副業成功／general',
        campaignSplit.map(function(x){return x.type;}).join(',')==='action_effectiveness,decision_suitability',JSON.stringify(campaignSplit));
      env.report('⑦雷諾曼時間範圍','端午節只作使用者明示範圍，不轉成應期',campaignSplit[0].timeScope&&campaignSplit[0].timeScope.raw==='端午節','');
      env.report('⑦雷諾曼通用判斷','只有「是否正確」也會進 decision_suitability，不再 no_formula 拒答',
        ln.splitQuestionSegments('是否正確？')[0].type==='decision_suitability','');
      env.report('⑦雷諾曼路由','成功、清債、正資產、時間仍維持獨立命題',
        ln.splitQuestionSegments('我副業什麼時候才能成功 讓我負債完全清空 有正資產').map(function(x){return x.type;}).join(',')==='business_success,debt_clearance,positive_net_worth,timing','');
      env.report('⑦雷諾曼路由','肉體桃花仍拆成桃花、感官、事件與年齡限制',
        ln.splitQuestionSegments('今年有非現任的肉體桃花嗎？她幾歲？').map(function(x){return x.type;}).join(',')==='attraction_opportunity,sexual_component,sexual_event,unsupported_age','');

      var cf=ln.canonicalFormula;
      env.report('⑦雷諾曼核心公式','牌對D權重3、三張S權重2、五級正反整合',
        cf.id==='site_lenormand_multispread_formula_v3'&&cf.evidenceUnits.direct_pair.weight===3&&cf.evidenceUnits.three_card_sentence.weight===2&&cf.conclusionScale.length===5,JSON.stringify(cf));
      env.report('⑦雷諾曼核心公式','不存在逐題 required gate 或 directOnly 公式',
        Object.keys(ln.propositionFormulas).every(function(k){var p=ln.propositionFormulas[k];return !p.required&&!p.gates;}),'profiles='+Object.keys(ln.propositionFormulas).length);

      function uniqueAdjCount(g){var seen={};(g.adjacency||[]).forEach(function(e){(e.neighbors||[]).forEach(function(n){var a=Math.min(e.position.slot,n.slot),b=Math.max(e.position.slot,n.slot);seen[a+'-'+b]=1;});});return Object.keys(seen).length;}
      var geo3=ln.buildSpreadGeometry(idsToDraw([36,14,8]),'three');
      var geo5=ln.buildSpreadGeometry(idsToDraw([34,23,33,31,35]),'five');
      var geo9=ln.buildSpreadGeometry(idsToDraw([24,12,6,18,25,21,32,35,36]),'nine');
      var geo36=ln.buildSpreadGeometry(seededShuffle(99),'grand');
      env.report('⑦雷諾曼四牌陣','三張幾何＝2牌對＋1完整短句',geo3.positions.length===3&&uniqueAdjCount(geo3)===2&&geo3.lines.length===1,'');
      env.report('⑦雷諾曼四牌陣','五張幾何＝4相鄰牌對＋3個滑動三張窗',geo5.positions.length===5&&uniqueAdjCount(geo5)===4&&ln.buildEvidencePacket(geo5,ln.splitQuestionSegments('我副業該怎麼調整？')[0],'male').segments.length===3,'');
      env.report('⑦雷諾曼四牌陣','九宮格＝中心焦點＋20相鄰關係＋8完整線',geo9.positions.length===9&&uniqueAdjCount(geo9)===20&&geo9.lines.length===8&&geo9.focusSlots[0]===5,'');
      env.report('⑦雷諾曼四牌陣','36張維持4×8+4與完整幾何',geo36.positions.length===36&&geo36.spreadId==='grand'&&geo36.lines.length>20,'lines='+geo36.lines.length);

      var daily='明天會一切順利嗎？需要注意什麼嗎？';
      var dailySplit=ln.splitQuestionSegments(daily);
      env.report('⑦雷諾曼語義解析','日常題拆成整體傾向＋風險提醒，並共享明天範圍',dailySplit.map(function(x){return x.type;}).join(',')==='outcome_tendency,risk_guidance'&&dailySplit.every(function(x){return x.timeScope&&x.timeScope.raw==='明天';}),JSON.stringify(dailySplit));
      var dailyPrompt=ln.buildPrompt(daily,idsToDraw([36,14,8]),'three',null,'male');
      env.report('⑦雷諾曼小牌陣編譯','三張牌自動產生claim_plan、D/S帳本與可解讀結論，不再只輸出drawn_cards',dailyPrompt.indexOf('outcome_tendency_strong_against')>-1&&dailyPrompt.indexOf('risk_guidance_strong_against')>-1&&dailyPrompt.indexOf('<claim_evidence')>-1&&dailyPrompt.indexOf('36.十字架 &amp; 14.狐狸')===-1,'len='+dailyPrompt.length);
      var prompt5=ln.buildPrompt('我這個月副業該怎麼調整？',idsToDraw([34,23,33,31,35]),'five',null,'male');
      var prompt9=ln.buildPrompt('現任對我是真心的嗎？這段關係會穩定嗎？',idsToDraw([24,12,6,18,25,21,32,35,36]),'nine',null,'male');
      var prompt36=ln.buildPrompt('我副業未來整體能不能做起來？',seededShuffle(101),'grand',null,'male');
      env.report('⑦雷諾曼深度契約','三／五／九／36張各有對應段落深度',dailyPrompt.indexOf('paragraph_range="2-3"')>-1&&prompt5.indexOf('paragraph_range="3-5"')>-1&&prompt9.indexOf('paragraph_range="3-6"')>-1&&prompt36.indexOf('paragraph_range="4-7"')>-1,'');
      env.report('⑦雷諾曼版面脈絡','五張含近身場與對稱組、九張含8線、36張含焦點鄰域與房屋脈絡',prompt5.indexOf('<balanced_pairs>')>-1&&((prompt9.match(/<layout_lines>/g)||[]).length>0)&&prompt36.indexOf('<focal_neighborhoods>')>-1&&prompt36.indexOf('<house_context>')>-1,'');

      var baseDraw=idsToDraw([30,27,34,26,28,17,36,22,33,3,9,18,24,4,8,7,23,19,21,11,14,25,29,5,6,20,10,35,13,1,15,16,2,12,32,31]);
      var questions=[campaign,'我對人生有些迷茫 請給我建議','今年有非現任的肉體桃花嗎？她幾歲？','我副業什麼時候才能成功 讓我負債完全清空 有正資產','現任對我有真心嗎？未來會長久嗎？','近期適合旅行嗎？','我最近會收到他的訊息嗎？','我身體為何一直發炎 長痘痘','這個方案對不對？'];
      var entries=[];questions.forEach(function(q){entries=entries.concat(buildEntries(q,baseDraw));});
      env.report('⑦雷諾曼證據包','所有通用命題皆通過 packet validation，且沒有 no_formula 狀態',
        entries.every(function(e){return e.packet.validation&&e.packet.validation.ok&&e.packet.claimPlan.status!=='no_formula_for_proposition';}),JSON.stringify(entries.map(function(e){return [e.item.type,e.packet.claimPlan.status,e.packet.validation.errors];})).slice(0,700));
      env.report('⑦雷諾曼原子證據','每個 C 只含一個D或S，核准證據不重複引用同一C',
        entries.every(function(e){var seen={};return (e.packet.clusters||[]).every(function(c){return c.refs.length===1&&c.structures.length===1;})&&(e.packet.claimPlan.claimEvidence||[]).every(function(link){return (link.clusters||[]).every(function(cid){if(seen[cid])return false;seen[cid]=true;return true;});});}),'');
      env.report('⑦雷諾曼分層證據','核准證據同時允許直接牌對D與連續三張S，且S不取代D',
        entries.some(function(e){return linkedStructures(e.packet).some(function(st){return st.kind==='adjacency';});})&&entries.some(function(e){return linkedStructures(e.packet).some(function(st){return st.kind==='context_window';});}),'');
      env.report('⑦雷諾曼限制題','時間、年齡、醫療病因仍為零牌面證據',entries.filter(function(e){return ['timing','unsupported_age','health_medical_cause'].indexOf(e.item.type)>-1;}).every(function(e){return e.packet.structures.length===0;}),'');

      var campaignEntries=buildEntries(campaign,baseDraw),campaignPlans={};campaignEntries.forEach(function(e){campaignPlans[e.item.type]=e.packet.claimPlan;});
      env.report('⑦雷諾曼不再拒答','行銷成效與做法適合度都輸出五級傾向，不是「不足以形成受控結論」',
        campaignPlans.action_effectiveness&&campaignPlans.decision_suitability&&/action_effectiveness_(?:strong_support|lean_support|mixed|lean_against|strong_against|insufficient)/.test(campaignPlans.action_effectiveness.status)&&/decision_suitability_(?:strong_support|lean_support|mixed|lean_against|strong_against|insufficient)/.test(campaignPlans.decision_suitability.status),JSON.stringify(campaignPlans));
      var campaignPrompt=ln.buildPrompt(campaign,baseDraw,'grand',null,'male'),eids=ledgerIds(campaignPrompt);
      env.report('⑦雷諾曼提示詞','runtime 使用 v10 四牌陣契約、D/S權重與唯一帳本',
        campaignPrompt.indexOf('site_petit_lenormand_v10_0_multispread_compiler')>-1&&campaignPrompt.indexOf('direct_pair_weight_3')>-1&&campaignPrompt.indexOf('three_card_sentence_weight_2')>-1&&eids.length===new Set(eids).size, 'len='+campaignPrompt.length);
      env.report('⑦雷諾曼提示詞','已移除 direct-only、required gate、no_formula 舊核心',
        campaignPrompt.indexOf('直接相鄰D是唯一')===-1&&campaignPrompt.indexOf('distinct_uid_per_required_gate')===-1&&campaignPrompt.indexOf('no_formula_for_proposition')===-1&&campaignPrompt.length<12000,'len='+campaignPrompt.length);

      var randomizedOk=true,detail='',sEvidence=0,maxLen=0,totalPrompts=0;
      var spreadCases=[['three',3],['five',5],['nine',9],['grand',36]];
      var stressQuestions=[daily,campaign,'我對人生有些迷茫 請給我建議','現任對我有真心嗎？未來會長久嗎？','我副業什麼時候才能成功 讓我負債完全清空 有正資產'];
      for(var seed=1;seed<=50&&randomizedOk;seed++){
        var full=seededShuffle(seed);
        for(var si=0;si<spreadCases.length&&randomizedOk;si++){
          var sid=spreadCases[si][0],cnt=spreadCases[si][1],draw=full.slice(0,cnt);
          for(var qi=0;qi<stressQuestions.length&&randomizedOk;qi++){
            var es=buildEntries(stressQuestions[qi],draw,sid);
            randomizedOk=es.every(function(e){
              if(!e.packet.validation||!e.packet.validation.ok||e.packet.claimPlan.status==='no_formula_for_proposition')return false;
              linkedStructures(e.packet).forEach(function(st){if(st.kind==='context_window')sEvidence++;});return true;
            });
            var pmt=ln.buildPrompt(stressQuestions[qi],draw,sid,null,'male'),ids=ledgerIds(pmt);totalPrompts++;maxLen=Math.max(maxLen,pmt.length);
            randomizedOk=randomizedOk&&ids.length===new Set(ids).size&&pmt.indexOf('missing_claim_plan')===-1&&pmt.length<12000;
          }
        }
        if(!randomizedOk)detail='seed='+seed;
      }
      env.report('⑦雷諾曼排列不變量','50組洗牌×4牌陣×5類問題皆可編譯、帳本唯一、提示詞均低於12000字元',randomizedOk,detail+' prompts='+totalPrompts+' S='+sEvidence+' maxLen='+maxLen);

      var cmp=ln.detectComparisonQuestion('我搭配手鍊要選自己喜歡的還是依八字五行？');
      var cmpPrompt=ln.buildPrompt('我搭配手鍊要選自己喜歡的還是依八字五行？',baseDraw.slice(0,9),'nine',null,'male');
      env.report('⑦雷諾曼比較','二選一仍使用抽牌前對稱九宮格',!!cmp&&cmpPrompt.indexOf('site_symmetric_nine_comparison')>-1&&cmpPrompt.indexOf('<evidence_ledger')===-1,'');
      env.report('⑦雷諾曼推薦','水晶推薦仍於正文後依主結論選擇，沒有吻合可不推薦',campaignPrompt.indexOf('<stone_recommendation mode="select_after_interpretation"')>-1&&campaignPrompt.indexOf('若都不吻合')>-1,'');
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
