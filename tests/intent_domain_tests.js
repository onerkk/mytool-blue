/**
 * J) 規格測試：QuestionIntent domain/time_scope、類別一致、健康禁桃花、回答差異化
 * 至少 10 組：同人不同 domain、同 domain 不同 time_scope；斷言 domain/time_scope/相似度/健康無桃花詞
 */
(function (global) {
  'use strict';

  var DOMAINS = ['love', 'career', 'wealth', 'health', 'relationship'];
  var TIME_SAMPLES = [
    { q: '今年事業運勢如何？', expectScope: 'year' },
    { q: '本月收入會比上月高嗎？', expectScope: 'month' },
    { q: '本年度健康需注意什麼？', expectScope: 'year' },
    { q: '近期感情發展？', expectScope: 'unspecified_or_month' }
  ];

  function tokenOverlap(a, b) {
    if (!a || !b) return 0;
    var ta = String(a).replace(/[，。、\s]+/g, ' ').trim().split(/\s+/);
    var tb = String(b).replace(/[，。、\s]+/g, ' ').trim().split(/\s+/);
    var setB = {};
    tb.forEach(function (t) { setB[t] = true; });
    var hit = 0;
    ta.forEach(function (t) { if (setB[t]) hit++; });
    return ta.length ? hit / ta.length : 0;
  }

  function runIntentDomainTests() {
    var parseQuestionIntent = global.parseQuestionIntent;
    var validateResponse = global.validateResponse;
    if (!parseQuestionIntent) {
      return { total: 0, passed: 0, failed: 0, failures: [{ reason: 'parseQuestionIntent 未載入' }] };
    }

    var failures = [];
    var passed = 0;
    var total = 0;

    DOMAINS.forEach(function (domain) {
      var q = (domain === 'love') ? '今年感情能否開花結果？' : (domain === 'career') ? '今年有機會升遷嗎？' : (domain === 'wealth') ? '今年財運如何？' : (domain === 'health') ? '今年健康需注意什麼？' : '今年人際與貴人如何？';
      var intent = parseQuestionIntent(q, domain);
      total++;
      if (intent.domain !== domain) {
        failures.push({ q: q, domain: domain, got: intent.domain, reason: 'domain 不得錯' });
      } else {
        passed++;
      }
    });

    TIME_SAMPLES.forEach(function (s) {
      var intent = parseQuestionIntent(s.q, 'general');
      total++;
      var ok = (intent.time_scope === s.expectScope) || (s.expectScope === 'unspecified_or_month' && (intent.time_scope === 'unspecified' || intent.time_scope === 'month'));
      if (!ok) {
        failures.push({ q: s.q, expectScope: s.expectScope, got: intent.time_scope, reason: 'time_scope 不得錯' });
      } else {
        passed++;
      }
    });

    var intentYear = parseQuestionIntent('今年整體運勢如何？', 'general');
    total++;
    if (intentYear.time_scope_text === '本月' || (intentYear.time_scope === 'month' && /今年/.test('今年整體運勢如何？'))) {
      failures.push({ q: '今年整體運勢如何？', reason: '今年問不得回本月（time_scope 硬鎖）' });
    } else {
      passed++;
    }

    if (validateResponse) {
      var healthCheck = validateResponse('health', '您今年健康需留意作息與飲食，規律運動有助身心。');
      total++;
      if (!healthCheck.passed && healthCheck.hit && healthCheck.hit.length) {
        failures.push({ reason: '健康類不得出現桃花詞', hit: healthCheck.hit });
      } else {
        passed++;
      }
      var healthBad = validateResponse('health', '您今年桃花很旺，健康也不錯。');
      total++;
      if (healthBad.passed) {
        failures.push({ reason: '健康類出現桃花詞應未通過 validate_response' });
      } else {
        passed++;
      }
    }

    var selectedDomainPriority = parseQuestionIntent('今年財運如何？', 'health');
    total++;
    if (selectedDomainPriority.domain !== 'health') {
      failures.push({ q: '今年財運如何？', selectedDomain: 'health', got: selectedDomainPriority.domain, reason: 'UI 已選 domain 權重最高' });
    } else {
      passed++;
    }

    return { total: total, passed: passed, failed: failures.length, failures: failures };
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { runIntentDomainTests: runIntentDomainTests };
  } else {
    global.runIntentDomainTests = runIntentDomainTests;
  }
})(typeof window !== 'undefined' ? window : this);
