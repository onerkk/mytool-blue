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
        '雷諾曼牌 Lenormand v6.0',
        '共用判讀公式核心重構',
        'site_lenormand_canonical_formula_v1',
        'site_petit_lenormand_v8_0_canonical_formula',
        'evidence_ledger counting="one_physical_pair_one_vote"',
        'dependent_claim_reference_only',
        'distinct_uid_per_required_gate',
        'function compileFormulaClaimPlan',
        'function collectApprovedEvidenceLedger',
        'function claimEvidenceUids',
        'function assignGlobalEvidenceUids',
        'function buildGlobalEvidenceLedger',
        'function enforceGlobalClaimEvidenceUniqueness',
        'direct_adjacency',
        'contiguous_three_card_window',
        'context_window',
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
        '<claim_evidence counting="shared_reference_does_not_add_confidence">',
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
        '蛇、魚與鞭子均不能單獨建立性結論',
        '<age_rules enabled="false">',
        "key:'結束・終止・封閉'",
        "key:'負擔・考驗・難卸壓力'",
        "pos:'暫時不明、判斷需保留'",
        "pos:'阻礙存在、進展延遲、難以跨越'",
        "pos:'持續耗損、逐步減少'",
        "pos:'負擔、考驗、難卸責任'"
      ],
      mustNot: [
        'site_petit_lenormand_v7_5_atomic_evidence',
        'var QUESTION_SCHEMAS =',
        'directPairs=directPairs.slice(0,24)',
        '<selected_context',
        '<approved_evidence_scope rule="only_claim_linked">',
        '<core_clusters confidence_counting="one_per_cluster">',
        '<relevant_houses context_only="true">',
        '<modern_context certainty_effect="none">',
        '<thematic_repetitions scope="approved_local_context">',
        'valid_segments列的是最大直線',
        "key:'結束・轉化・終止'",
        "key:'負擔・命運・考驗'",
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

    // ⑦雷諾曼 v6.0 共用公式／全題證據帳本／階層命題根治
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
      function buildEntries(question, draw){
        var geom=ln.buildGrandGeometry(draw),items=ln.splitQuestionSegments(question);
        var entries=items.filter(function(x){return x.type!=='comparison_suitability';}).map(function(item){return {item:item,packet:ln.buildEvidencePacket(geom,item,'male')};});
        ln.assignGlobalEvidenceUids(entries);ln.enforceGlobalClaimEvidenceUniqueness(entries,'male');
        return entries;
      }
      function linkedStructures(packet){
        var out=[];
        (packet.claimPlan.claimEvidence||[]).forEach(function(link){
          (link.clusters||[]).forEach(function(cid){
            var c=(packet.clusters||[]).filter(function(z){return z.id===cid;})[0];
            if(c&&c.structures&&c.structures[0])out.push(c.structures[0]);
          });
        });
        return out;
      }
      function compoundGateInvariant(entry){
        var formula=ln.propositionFormulas[entry.item.type],plan=entry.packet.claimPlan;
        if(!formula||!plan.gateResults)return true;
        var success=plan.status===formula.success.status;
        if(!success)return true;
        var uids=[];
        return (formula.required||[]).every(function(g){
          var ids=plan.gateResults[g]||[];
          if(ids.length!==1)return false;
          var c=(entry.packet.clusters||[]).filter(function(z){return z.id===ids[0];})[0];
          if(!c||!c.structures||!c.structures[0]||c.structures[0].kind!=='adjacency')return false;
          var uid=c.structures[0].evidenceUid;
          if(uids.indexOf(uid)>-1)return false;
          uids.push(uid);return true;
        });
      }
      function ledgerIds(prompt){return Array.prototype.map.call(prompt.matchAll(/<evidence id="(E\d+)"/g),function(m){return m[1];});}

      var sexSplit=ln.splitQuestionSegments('今年有非現任的肉體桃花嗎？她幾歲？');
      env.report('⑦雷諾曼路由','肉體桃花拆成桃花、感官成分、事件與年齡限制四命題',
        sexSplit.length===4&&sexSplit.map(function(x){return x.type;}).join(',')==='attraction_opportunity,sexual_component,sexual_event,unsupported_age',JSON.stringify(sexSplit));
      var moneySplit=ln.splitQuestionSegments('我副業什麼時候才能成功 讓我負債完全清空 有正資產');
      env.report('⑦雷諾曼路由','成功、清債、正資產、時間互不代證',
        moneySplit.map(function(x){return x.type;}).join(',')==='business_success,debt_clearance,positive_net_worth,timing',JSON.stringify(moneySplit));
      env.report('⑦雷諾曼路由','工作適配與升遷保持獨立命題',
        ln.splitQuestionSegments('我適合目前的工作嗎？會升遷嗎？').map(function(x){return x.type;}).join(',')==='career_fit,career_promotion','');
      env.report('⑦雷諾曼路由','人生迷茫使用 life_guidance，不落入 general',
        ln.splitQuestionSegments('我對人生有些迷茫 請給我建議')[0].type==='life_guidance','');
      var cmp=ln.detectComparisonQuestion('我搭配手鍊要選自己喜歡的還是依八字五行？');
      env.report('⑦雷諾曼比較','還是語型進入抽牌前對稱比較',!!cmp&&cmp.options.length===2,JSON.stringify(cmp));

      var cf=ln.canonicalFormula;
      env.report('⑦雷諾曼核心公式','唯一信心單位為直接相鄰，三張窗僅作不加權語境',
        cf.evidenceUnit==='direct_adjacency'&&cf.contextUnit==='contiguous_three_card_window'&&String(cf.confidenceRule).indexOf('one_physical_unit_one_vote')>-1,JSON.stringify(cf));
      var formulas=ln.propositionFormulas,formulaKeys=Object.keys(formulas);
      var formulaShapeOk=formulaKeys.every(function(type){
        var f=formulas[type];
        return f.required&&f.required.length&&f.success&&f.fail&&f.boundary&&f.required.every(function(g){return f.gates[g]&&f.gates[g].directOnly===true;});
      });
      env.report('⑦雷諾曼核心公式','所有可判命題都以宣告式 gate 定義成功、失敗、邊界與直接證據',formulaShapeOk,'types='+formulaKeys.length);
      var singleSourceOk=formulaKeys.every(function(type){
        var profile=ln.buildQuestionFocusProfile({type:type,types:[type],targetScope:'unspecified'},'male');
        var f=formulas[type],roles={querent:28,counterpart:29},needed=[];
        Object.keys(f.gates||{}).forEach(function(g){
          function expand(vals){(vals||[]).forEach(function(v){
            if(typeof v==='number')needed.push(v);
            else if(v==='$Q')needed.push(28);
            else if(v==='$C')needed.push(29);
            else if(v==='$P')needed=needed.concat([28,29]);
            else if(ln.formulaGroups[v])needed=needed.concat(ln.formulaGroups[v]);
          });}
          expand(f.gates[g].left);expand(f.gates[g].right);
        });
        needed=Array.from(new Set(needed));
        return needed.every(function(id){return profile.all.indexOf(id)>-1;});
      });
      env.report('⑦雷諾曼單一語義來源','取證池由同一份 proposition gate 自動展開，不依賴第二套題型牌表',singleSourceOk,'types='+formulaKeys.length);

      var baseDraw=idsToDraw([30,27,34,26,28,17,36,22,33,3,9,18,24,4,8,7,23,19,21,11,14,25,29,5,6,20,10,35,13,1,15,16,2,12,32,31]);
      var matrixQuestions=[
        '今年有非現任的肉體桃花嗎？她幾歲？','我副業什麼時候才能成功 讓我負債完全清空 有正資產',
        '我對人生有些迷茫 請給我建議','我適合目前的工作嗎？會升遷嗎？',
        '現任對我有真心嗎？未來會長久嗎？','我最近會收到他的訊息嗎？','近期適合旅行嗎？','我身體為何一直發炎 長痘痘'
      ];
      var matrixEntries=[];matrixQuestions.forEach(function(q){matrixEntries=matrixEntries.concat(buildEntries(q,baseDraw));});
      env.report('⑦雷諾曼證據包','所有矩陣命題皆通過 packet validation',matrixEntries.every(function(e){return e.packet.validation&&e.packet.validation.ok;}),JSON.stringify(matrixEntries.map(function(e){return [e.item.type,e.packet.validation];})).slice(0,500));
      env.report('⑦雷諾曼原子證據','每個 C 只含一個物理結構，核准主張只引用直接相鄰牌對',
        matrixEntries.every(function(e){return (e.packet.clusters||[]).every(function(c){return c.refs.length===1&&c.structures.length===1;})&&linkedStructures(e.packet).every(function(st){return st.kind==='adjacency';});}),'');
      env.report('⑦雷諾曼複合門檻','事件／結果成功時每個 required gate 使用不同 evidence_uid',matrixEntries.every(compoundGateInvariant),'');
      env.report('⑦雷諾曼限制題','時間、年齡、醫療病因皆為零牌面證據',matrixEntries.filter(function(e){return ['timing','unsupported_age','health_medical_cause'].indexOf(e.item.type)>-1;}).every(function(e){return e.packet.structures.length===0;}),'');

      var targetedDraw=idsToDraw([28,24,2,3,4,5,6,7,30,29,1,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,25,26,27,31,32,33,34,35,36]);
      var sexEntries=buildEntries('今年有非現任的肉體桃花嗎？她幾歲？',targetedDraw);
      var byType={};sexEntries.forEach(function(e){byType[e.item.type]=e;});
      env.report('⑦雷諾曼階層一致','性事件成立時，桃花與感官成分也各自成立，不再出現高階成立、低階失敗',
        byType.sexual_event.packet.claimPlan.status==='sexual_event_possible'&&byType.attraction_opportunity.packet.claimPlan.status==='attraction_possible'&&byType.sexual_component.packet.claimPlan.status==='sexual_component_supported',
        JSON.stringify({a:byType.attraction_opportunity.packet.claimPlan.status,c:byType.sexual_component.packet.claimPlan.status,e:byType.sexual_event.packet.claimPlan.status}));
      var sexPrompt=ln.buildPrompt('今年有非現任的肉體桃花嗎？她幾歲？',targetedDraw,'grand',null,'male');
      var eids=ledgerIds(sexPrompt);
      env.report('⑦雷諾曼證據帳本','同一實體牌對只在 evidence_ledger 登錄一次，可被相依命題引用但不重複加權',
        eids.length===new Set(eids).size&&sexPrompt.indexOf('reuse="dependent_claim_reference_only"')>-1&&sexPrompt.indexOf('shared_reference_does_not_add_confidence')>-1,JSON.stringify(eids));
      env.report('⑦雷諾曼提示詞降噪','runtime 不輸出 selected_context、長線S、房屋、鏡像、騎士跳或C資料牆',
        sexPrompt.indexOf('<selected_context')===-1&&sexPrompt.indexOf('<core_clusters')===-1&&!/\nS\d+ uid=/.test(sexPrompt)&&sexPrompt.indexOf('<relevant_houses')===-1&&sexPrompt.length<12000,'len='+sexPrompt.length);

      var geom=ln.buildGrandGeometry(baseDraw);
      function makePacket(type, pairs){
        var structures=pairs.map(function(ids,idx){var ps=ids.map(function(id,j){return {slot:idx*3+j+1,card:ln.cards[id-1]};});return {id:'D'+(idx+1),kind:'adjacency',positions:ps,cardIds:ids.slice(),evidenceUid:'T'+(idx+1)};});
        var clusters=structures.map(function(st,idx){return {id:'C'+(idx+1),refs:[st.id],structures:[st],cardIds:st.cardIds.slice(),polarity:'neutral',confidenceEligible:true};});
        return {question:{id:'t',type:type,types:[type],targetScope:'hypothetical_noncurrent_counterpart'},structures:structures,directPairs:structures.map(function(st){return {positions:st.positions};}),segments:[],clusters:clusters,modernContext:{mirrors:[],knightMoves:[],intersections:[]}};
      }
      env.report('⑦雷諾曼反例','紳士＋蛇只有誘惑修飾，不能建立性成分',ln.buildClaimPlan(makePacket('sexual_component',[[28,7]]),'male').status==='sexual_theme_unassigned','');
      env.report('⑦雷諾曼反例','紳士＋魚不能單獨判副業成功',ln.buildClaimPlan(makePacket('business_success',[[28,34]]),'male').status==='business_link_without_outcome','');
      env.report('⑦雷諾曼反例','熊＋鐮刀只能支持切減，不等於負債歸零',ln.buildClaimPlan(makePacket('debt_clearance',[[15,10]]),'male').status==='debt_cut_only','');
      env.report('⑦雷諾曼反例','收入／財務連結不能單獨證明正資產',ln.buildClaimPlan(makePacket('positive_net_worth',[[28,34]]),'male').status==='positive_net_worth_insufficient','');

      var randomizedOk=true,randomDetail='',promptChecks=0;
      for(var seed=1;seed<=120&&randomizedOk;seed++){
        var draw=seededShuffle(seed),entries=[];
        matrixQuestions.forEach(function(q){entries=entries.concat(buildEntries(q,draw));});
        randomizedOk=entries.every(function(e){return e.packet.validation&&e.packet.validation.ok&&linkedStructures(e.packet).every(function(st){return st.kind==='adjacency';})&&compoundGateInvariant(e);});
        var map={};entries.forEach(function(e){map[e.item.type]=e;});
        if(map.sexual_event&&map.sexual_event.packet.claimPlan.status==='sexual_event_possible')randomizedOk=map.sexual_component.packet.claimPlan.status==='sexual_component_supported'&&map.attraction_opportunity.packet.claimPlan.status==='attraction_possible';
        if(seed<=20){
          var pmt=ln.buildPrompt(matrixQuestions[seed%matrixQuestions.length],draw,'grand',null,'male'),ids=ledgerIds(pmt);promptChecks++;
          randomizedOk=randomizedOk&&ids.length===new Set(ids).size&&pmt.indexOf('<selected_context')===-1&&!/\nS\d+ uid=/.test(pmt)&&pmt.length<12000;
        }
        if(!randomizedOk)randomDetail='seed='+seed;
      }
      env.report('⑦雷諾曼排列不變量','120組決定性洗牌皆符合原子證據、複合門檻、階層一致與提示詞帳本唯一性',randomizedOk,randomDetail+' promptChecks='+promptChecks);

      var cmpPrompt=ln.buildPrompt('我搭配手鍊要選自己喜歡的還是依八字五行？',targetedDraw.slice(0,9),'nine',null,'male');
      env.report('⑦雷諾曼比較守門','比較題只使用抽牌前對稱九宮格，不使用Grand Tableau帳本',cmpPrompt.indexOf('site_symmetric_nine_comparison')>-1&&cmpPrompt.indexOf('<evidence_ledger')===-1&&cmpPrompt.indexOf('不得將選項名稱映射成同名牌')>-1,'len='+cmpPrompt.length);
      env.report('⑦雷諾曼推薦','水晶推薦仍在正文後依核准主張選擇，沒有吻合可不推薦',sexPrompt.indexOf('<stone_recommendation mode="select_after_interpretation"')>-1&&sexPrompt.indexOf('<stone_text>')===-1&&sexPrompt.indexOf('若都不吻合')>-1,'');
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
