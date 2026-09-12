// Canonical source, embedded in both independent readers by build-decision-parser.cjs.
// This is a conservative language parser, not a claim that keywords understand every question.
function classifyDecisionQuestion(question) {
  var raw = String(question || '').trim();
  function result(kind, left, right, reason) {
    return {kind:kind, left:left || null, right:right || null, source:raw, reason:reason || ''};
  }
  function clean(value, first) {
    var s = String(value || '').trim().replace(/^[，,：:\s]+|[，,。？?！!；;\s]+$/g, '');
    s = s.replace(/(?:[，,]\s*)?(?:哪一個|哪個|何者)(?:比較|較|更)?(?:適合(?:我|我們)?|好|有利|可行|值得).*$/, '');
    s = s.replace(/(?:比較|較|更)(?:適合(?:我|我們)?|好|有利|可行|值得)(?:嗎|呢)?$/, '').replace(/[嗎呢]$/, '').trim();
    if (first) {
      s = s.replace(/^(?:請幫我|請問|請|幫我|我想知道|我想問|想問|我想|想)(?:比較)?\s*/, '').replace(/^比較\s*/, '');
      s = s.replace(/^(?:我|我們)(?:和|跟|與).{1,16}?(?:應該|該|要選|選擇|考慮)\s*/, '');
      s = s.replace(/^(?:我|我們)?(?:到底)?(?:應該|該|可以|要選|要|選擇|選|考慮)\s*/, '');
      s = s.replace(/^(?:我|我們)(?=留|接受|拒絕|全職|兼職|辭|離|搬|轉|去|繼續|開始)/, '');
    }
    return s.replace(/^[，,\s]+|[，,\s]+$/g, '');
  }
  if (!raw) return result('none');
  // Labels and their time qualifiers are part of the user's options. Do not strip dates/durations.
  if (/\bA(?:\s*[：:.、]|\s+)[\s\S]+\bB(?:\s*[：:.、]|\s+)[\s\S]+\bC(?:\s*[：:.、]|\s+)/i.test(raw) || /(?:三|四|五|3|4|5)(?:個|家|種)?(?:選項|方案)|三選一|三擇一|四選一/.test(raw)) return result('multiple', null, null, '超過兩個方案，不能套成只有 A、B 的牌位。');
  if(/(?:^|[，,：:\s])A(?:\s*[：:.、]|\s+)[\s\S]*B\s*[：:.、]\s*[？?]?\s*$/i.test(raw))return result('incomplete');
  var labelled = raw.match(/(?:^|[，,：:\s])A(?:\s*[：:.、]\s*|\s+)([\s\S]+?)\s*(?:還是|或者|或是|或|與|和|跟|vs\.?|versus)?\s*B(?:\s*[：:.、]\s*|\s+)([\s\S]+?)(?:[。！？?]|$)/i);
  if (labelled && !/^(?:還是|或者|或是|或|or|vs\.?)\s*$/i.test(labelled[1].trim())) {
    var la = clean(labelled[1].replace(/(?:還是|或者|或是|或|與|和|跟|vs\.?)\s*$/i, ''), false), lb = clean(labelled[2], false);
    return la && lb ? result('binary', la, lb, '使用原文明確標示的 A、B 方案。') : result('incomplete');
  }
  var q = raw.split(/[？?！!。；;\n]/)[0].trim();
  var connector = /還是|或者|或是|或(?!許)|\bor\b|\bversus\b|\bvs\.?\b/ig;
  var matches = [], m;
  while ((m = connector.exec(q))) matches.push({at:m.index, value:m[0]});
  var decisionCue = /(?:我|我們)(?:(?:和|跟|與).{1,16})?(?:到底)?(?:該|應該|可以|要|想選|選|考慮)|^(?:該|應該|要|選|考慮)|二選一|二擇一|兩個選項|請比較|(?:哪一個|哪個|何者)(?:比較|較|更)?(?:適合|好|有利|可行)|(?:該|應該)選|比較.{1,50}(?:適合|有利)/.test(q);
  if (matches.length > 1 && decisionCue) return result('multiple', null, null, '原文有三個以上選項，先整理共同條件，不能假造第三條路的牌位。');
  var takeOrWait = !matches.length && q.match(/^(?:請問|我想知道|想問)?(?:我|我們)?(?:到底)?(?:該不該|要不要|應不應該)\s*(.+?)(?:[，,]|$)/);
  if (takeOrWait) {
    var action = clean(takeOrWait[1], false);
    return action ? result('binary', action, '暫不採取「' + action + '」，維持目前安排', '比較採取這個行動與暫不採取，沒有新增其他方案。') : result('incomplete');
  }
  var left = '', right = '';
  if (matches.length === 1) {
    left = clean(q.slice(0, matches[0].at), true); right = clean(q.slice(matches[0].at + matches[0].value.length), false);
    if (!left || !right) return result('incomplete', left, right, '請把另一個方案補齊，才能分別安排兩路牌位。');
    if (decisionCue && /[、]/.test(left + right)) return result('multiple');
    if (decisionCue && /(?:選|考慮)[^，,]+[，,][^，,]+$/.test(q.slice(0, matches[0].at).replace(/[，,\s]+$/, ''))) return result('multiple');
    // 「她還是喜歡我嗎」means "still", not A=her, B=likes me.
    if (/^(?:他|她|你|我|它|對方|我們|他們|她們)(?:現在|最近|今年|明年)?$/.test(left)) return result('none', null, null, '「還是」在這裡表示仍然如此，不是兩個方案。');
    var actionStart = /^(?:先|暫時|繼續|直接|主動|全職|兼職|留在|留下|留職|離職|離開|辭職|轉職|接受|拒絕|搬到|搬去|搬家|移居|買|賣|租|投資|創業|接案|加入|報名|就讀|讀|念|告白|分手|復合|維持|放棄|聯絡|等待|去|不去|不買|不賣|不投資|暫不|跟.{1,12}告白)/;
    var labels = /^[AB甲乙](?:公司|方案|選項)?$/i.test(left) && /^[AB甲乙](?:公司|方案|選項)?$/i.test(right);
    var hypothesis = /^(?:只是|僅僅|單純)|禮貌|客氣|沒興趣|不喜歡|不愛|挑戰|變糟|失敗|生氣|隱瞞/.test(right) || /(?:會|能|是|喜歡|愛我|機會|變好|上漲|下跌)/.test(left);
    if (!decisionCue && !labels && !(actionStart.test(left) && actionStart.test(right))) return result(hypothesis ? 'hypotheses' : 'ambiguous', null, null, '這是在詢問狀況或不同解釋；沒有確認是命主可選的兩個行動。');
    return result('binary', left, right, '先比較兩個原文方案各自的條件與走向，再看共同限制。');
  }
  // 「跟」can be inside an action. Use it as a separator only for an explicit comparison.
  var comparison = q.match(/^(?:請)?(?:幫我)?比較\s*(.+?)(?:與|和|跟)\s*(.+?)(?:[，,]\s*)?(?:哪個|哪一個|何者)(?:比較|較|更)?(?:適合|好|有利|可行)/) || q.match(/^(.+?)(?:與|和|跟)\s*(.+?)(?:[，,]\s*)?(?:哪個|哪一個|何者)(?:比較|較|更)?(?:適合|好|有利|可行)/);
  if (comparison) {
    left = clean(comparison[1], true); right = clean(comparison[2], false);
    if (left && right && !/^(?:我|我們|他|她|你)$/.test(left)) return result('binary', left, right, '按原問句的比較對象安排 A、B 牌位。');
  }
  if (/(?:還是|或者|或是|或)\s*$/.test(q)) return result('incomplete');
  if (/(?:要|該|應該)?選哪(?:一個|個)?[呢嗎]?$|^(?:我要|我該|我應該|請)?二選一$/.test(q)) return result('incomplete');
  return result('none');
}
if (typeof module === 'object' && module.exports) module.exports = classifyDecisionQuestion;
