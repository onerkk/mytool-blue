// ═══════════════════════════════════════════════════════════════
// 梅花易數核心升級 v3 — 替換區塊（tarot.js 第 90 行起至第 533 行）
// 保留：BG、G64、gByN、g64、gByL 不動
// 替換：tiYong → getMhWangShuai → mhRelation → calcMH → analyzeMeihua → generateMeihuaStory
// ═══════════════════════════════════════════════════════════════

// ═══ 五行生剋常數（若原本已定義則跳過）═══
// SHENG/KE 應已在 bazi.js 或頁面全域定義，此處只作防呆
if(typeof SHENG==='undefined') var SHENG={木:'火',火:'土',土:'金',金:'水',水:'木'};
if(typeof KE==='undefined')    var KE  ={木:'土',土:'水',水:'火',火:'金',金:'木'};

// ═══ 體用生剋判定 ═══
function tiYong(ti,yo){
  if(ti===yo)return{r:'比和',f:'吉',d:'體用相同，事情順利。'};
  if(SHENG[yo]===ti)return{r:'用生體',f:'大吉',d:'外力助益，事半功倍。'};
  if(SHENG[ti]===yo)return{r:'體生用',f:'小凶',d:'耗費精力，付出多回報少。'};
  if(KE[yo]===ti)return{r:'用克體',f:'凶',d:'外力阻礙，困難重重。'};
  if(KE[ti]===yo)return{r:'體克用',f:'吉',d:'諸事吉，主動在我；仍須依旺衰判斷實際落實度。'};
  return{r:'—',f:'平',d:''};
}

function mhReferenceDate(mh) {
  var stamp=mh&&mh.castContext&&mh.castContext.timestamp;
  var date=stamp?new Date(stamp):new Date();
  if(!Number.isFinite(date.getTime()))throw new Error('起卦時間格式錯誤，無法核對月令');
  return date;
}

// ═══ 月令旺衰 ═══
// v80.16(2026/6/10) 根治：原版 month 必填（standalone 只傳一參數→整體回「平」、力道全毀）、國曆月當季節（1月當春）、
// 土旺誤鍵國曆3/6/9/12（原意為農曆辰未戌丑）。三套同名實作分歧、誰後載入誰贏——統一改採 tarot.js 同款：
// 節氣近似日判月支＋四季月（辰未戌丑）土旺。《梅花易數·體用總訣》：「盛者…四季之月坤艮是也；衰者…四季之月坎是也」。
function getMhWangShuai(el, month){
  if(!el) return {level:'平',score:0};
  // upgrade2 載入後優先用實際「節」定位月支；固定日期表只作引擎缺席時的明示備援。
  if(typeof mhPreciseWangShuai==='function'){
    try{
      var precise=mhPreciseWangShuai(el, month instanceof Date ? month : new Date());
      var preciseScore={旺:3,相:1,休:0,囚:-1,死:-2}[precise.label]||0;
      return {level:precise.label,score:preciseScore,season:'jieqi',monthZhi:precise.monthZhi,precision:precise.precision||'unverified-season'};
    }catch(e){}
  }
  var now = month instanceof Date ? month : new Date();
  if(!Number.isFinite(now.getTime()))throw new Error('起卦時間無效，不能推算月令。');
  var wall = new Date(now.getTime()+8*60*60*1000);
  var m = typeof month==='number' ? month : (wall.getUTCMonth()+1);
  var d = wall.getUTCDate();
  var JIE_DAY = {1:6,2:4,3:6,4:5,5:6,6:6,7:7,8:8,9:8,10:8,11:7,12:7};
  var SEASON_AFTER  = {1:'earth',2:'spring',3:'spring',4:'earth',5:'summer',6:'summer',7:'earth',8:'autumn',9:'autumn',10:'earth',11:'winter',12:'winter'};
  var SEASON_BEFORE = {1:'winter',2:'earth',3:'spring',4:'spring',5:'earth',6:'summer',7:'summer',8:'earth',9:'autumn',10:'autumn',11:'earth',12:'winter'};
  var season = (d >= (JIE_DAY[m]||6)) ? SEASON_AFTER[m] : SEASON_BEFORE[m];
  var table={
    spring:{木:'旺',火:'相',土:'死',金:'囚',水:'休'},
    summer:{火:'旺',土:'相',金:'死',水:'囚',木:'休'},
    autumn:{金:'旺',水:'相',木:'死',火:'囚',土:'休'},
    winter:{水:'旺',木:'相',火:'死',土:'囚',金:'休'},
    earth:{土:'旺',金:'相',水:'死',木:'囚',火:'休'}
  };
  var levelScore={旺:3,相:1,休:0,囚:-1,死:-2};
  var level=table[season][el]||'平';
  return {level:level, score:levelScore[level]||0, season:season, precision:'approximate-jie-day-fallback'};
}

// ═══ 五行生剋關係判定 ═══
function mhRelation(elA, elB){
  if(elA===elB) return '比和';
  if(SHENG[elA]===elB) return 'A生B';
  if(SHENG[elB]===elA) return 'B生A';
  if(KE[elA]===elB) return 'A剋B';
  if(KE[elB]===elA) return 'B剋A';
  return '無';
}

// ═══ 起卦計算 ═══
// 《梅花易數》卷一互卦起例；乾坤採「互其變卦」支線。
function mhNuclearContext(mh){
  var original=mh.lo.li.concat(mh.up.li),bits=original.slice();
  var pure=bits.every(function(v){return v===bits[0];});
  if(pure)bits[mh.dong-1]=bits[mh.dong-1]?0:1;
  var lower=gByL(bits[1],bits[2],bits[3]),upper=gByL(bits[2],bits[3],bits[4]);
  return {lower:lower,upper:upper,lines:lower.li.concat(upper.li),hexagram:g64(upper.n,lower.n),
    exception:pure,reference:pure?'changed':'original',policy:'QIAN_KUN_CHANGED_NUCLEAR',
    source:'https://zh.wikisource.org/zh-hant/梅花易數/卷一',
    note:pure?'乾坤無互：本版改取變卦的二三四、三四五爻；不是多翻一爻。':'下互取二三四爻，上互取三四五爻。'};
}
function calcMH(un,ln,dy,castContext){
  if(![un,ln,dy].every(function(n){return Number.isInteger(n)&&n>0;}))throw new Error('卦數與動爻必須是正整數。');
  var up=gByN(un),lo=gByN(ln),dong=((dy-1)%6)+1;
  var ben=g64(up.n, lo.n);
  var benL=lo.li.concat(up.li);
  var nuclear=mhNuclearContext({lo:lo,up:up,dong:dong});
  var hu=nuclear.hexagram;
  var biL=benL.slice(); biL[dong-1]=biL[dong-1]?0:1;
  var biLo=gByL(biL[0],biL[1],biL[2]);
  var biUp=gByL(biL[3],biL[4],biL[5]);
  var bian=g64(biUp.n, biLo.n);
  var tiG=dong<=3?up:lo, yoG=dong<=3?lo:up;
  var ty=tiYong(tiG.el,yoG.el);
  var mh={up:up,lo:lo,dong:dong,ben:ben,hu:hu,nuclear:nuclear,bian:bian,tiG:tiG,yoG:yoG,ty:ty};
  mh.castContext=castContext?Object.assign({},castContext):{timestamp:new Date().toISOString(),method:'provided-trigrams',upperTrigram:up.n,lowerTrigram:lo.n,movingLine:dong};
  if(!Number.isFinite(Date.parse(mh.castContext.timestamp)))throw new Error('起卦時間格式無效。');
  // 自動掛輸出層（general 先跑，結果頁再用真實 type 覆蓋）
  try{ if(typeof buildMeihuaOutput==='function')buildMeihuaOutput(mh,'general'); }catch(e){}
  return mh;
}

// ═══════════════════════════════════════════════════════════════
// 五行事件映射（供所有層使用）
// ═══════════════════════════════════════════════════════════════
// tarot.js publishes the same shared table before this upgrade is loaded.
// A top-level const would reject the entire script before any function runs.
var MH_WX_EVENT={
  木:{label:'木',events:['成長','推進','發展','啟動','人際互動'],timing:'春季/1-3月',speed:'中快'},
  火:{label:'火',events:['曝光','情緒','主動','衝突','熱度'],timing:'夏季/4-6月',speed:'快'},
  土:{label:'土',events:['穩定','拖延','現實','承擔','阻滯'],timing:'季末/3,6,9,12月',speed:'慢'},
  金:{label:'金',events:['決斷','切割','壓力','規則','競爭'],timing:'秋季/7-9月',speed:'中'},
  水:{label:'水',events:['流動','變數','隱情','等待','資訊','距離'],timing:'冬季/10-12月',speed:'慢'}
};

// ═══ 卦型分類（本卦判性質）═══
function _mhGuaType(guaName, guaEl){
  const 進=['大壯','夬','大有','豐','益','震','巽','升','需','泰','晉'];
  const 退=['遁','否','剝','蒙','困','蹇','謙','旅','晦','艮'];
  const 守=['既濟','恆','節','中孚','家人','比','謙','艮為山'];
  const 變=['革','隨','豐','解','咸','損','益','渙'];
  const 困=['困','蹇','剝','坎','明夷','蒙','師'];
  const 阻=['訟','睽','小過','大過','否','剝'];
  const 聚=['萃','臨','大畜','頤','需'];
  const 散=['渙','旅','遯','漸','風水渙'];
  if(進.some(n=>guaName&&guaName.includes(n))) return '進';
  if(退.some(n=>guaName&&guaName.includes(n))) return '退';
  if(守.some(n=>guaName&&guaName.includes(n))) return '守';
  if(變.some(n=>guaName&&guaName.includes(n))) return '變';
  if(困.some(n=>guaName&&guaName.includes(n))) return '困';
  if(阻.some(n=>guaName&&guaName.includes(n))) return '阻';
  if(聚.some(n=>guaName&&guaName.includes(n))) return '聚';
  if(散.some(n=>guaName&&guaName.includes(n))) return '散';
  // fallback by 五行
  const elType={木:'進',火:'變',土:'守',金:'決',水:'流'};
  return elType[guaEl]||'觀';
}

// ═══ 互卦隱藏問題分類 ═══
function _mhHuHidden(huRel){
  if(huRel==='交錯')return {cat:'作用交錯',desc:'上互與下互對原體的生剋作用不同，須分開衡量助力、耗洩與牽制'};
  if(huRel==='B剋A') return {cat:'外部壓制',desc:'互卦有克體的壓力象，先核對實際阻礙來自哪裡'};
  if(huRel==='A生B') return {cat:'自耗',desc:'互卦顯示需由體方持續投入，留意投入與回應是否對等'};
  if(huRel==='B生A') return {cat:'暗中有助',desc:'互卦有生體的助力象；現實資源是否到位仍待確認'};
  if(huRel==='比和') return {cat:'拉鋸',desc:'互卦與原體同類，可能維持當前狀態；是否突破仍看實際互動'};
  if(huRel==='A剋B') return {cat:'可控',desc:'互卦有體方可介入調整的象，但不表示能控制他人'};
  return {cat:'變數',desc:'中間過程有未知因素'};
}

// ═══ 變卦走向分類 ═══
function _mhBianTrend(bianRel, bianName){
  // type 保留舊資料消費者相容；它表示變後用卦對原體的象義方向，不是事件預測。
  if(bianRel==='B生A') return {type:'好轉',scope:'symbolic-condition',desc:'變後用卦生體，後續若有實際回應或資源到位，較有改善空間'};
  if(bianRel==='B剋A') return {type:'惡化',scope:'symbolic-condition',desc:'變後用卦克體，後續可能增加壓力，需觀察阻力是否持續'};
  if(bianRel==='比和') return {type:'平穩',scope:'symbolic-condition',desc:'變後用卦與原體同類，傾向延續目前條件；現實結果仍待確認'};
  if(bianRel==='A生B') return {type:'拖延',scope:'symbolic-condition',desc:'變後用卦受原體所生，較需要持續投入；是否拖延須看實際進展'};
  if(bianRel==='A剋B') return {type:'另有出口',scope:'symbolic-condition',desc:'原體克變後用卦，提示可嘗試調整做法；不保證結果由你控制'};
  // 卦名本身不足以推導另一條已成立的走勢；沒有體用資料就保留未判定。
  return {type:'待合參',scope:'insufficient',desc:'缺少可核對的變後用卦對原體關係，暫不能判定變化方向'};
}

// ═══ 動爻階段意義 ═══
function _mhDongStage(dong){
  const map={
    1:{stage:'起步',meaning:'爻位象徵開端，現實是否啟動仍待確認',主動:'先核對意圖與起點',穩定:'未判定',節奏:'僅供取象'},
    2:{stage:'成形',meaning:'爻位象徵內部條件逐漸成形',主動:'核對可落實的條件',穩定:'未判定',節奏:'僅供取象'},
    3:{stage:'銜接',meaning:'爻位象徵內部與外部的銜接',主動:'核對實際銜接與溝通',穩定:'未判定',節奏:'僅供取象'},
    4:{stage:'轉折',meaning:'爻位象徵進入外部條件的調整',主動:'核對外部回應',穩定:'未判定',節奏:'僅供取象'},
    5:{stage:'決策',meaning:'爻位象徵決策層，不能推定有人已作決定',主動:'核對決策進度',穩定:'未判定',節奏:'僅供取象'},
    6:{stage:'收束',meaning:'爻位象徵收束與重新評估',主動:'回看目前結果與去留',穩定:'未判定',節奏:'僅供取象'}
  };
  return map[dong]||map[1];
}

// ═══ 體用語義轉換 ═══
function _mhTySemantics(rel){
  const map={
    '用生體':{主動:'待現實核對',我方:'有受助象',對方:'用卦生體，尚不能證明他人正在主動付出',控制:'需核對實際支援',勢力:'卦象偏有助'},
    '比和':  {主動:'待現實核對',我方:'同類相應象',對方:'體用同類，不代表雙方已有相同意願',控制:'需核對雙方行動',勢力:'卦象同類'},
    '體克用':{主動:'可嘗試介入',我方:'有主動處理象',對方:'體克用，不代表能壓制他人',控制:'結果仍依現實條件',勢力:'體方較有施力空間'},
    '體生用':{主動:'需持續投入',我方:'有投入象',對方:'用卦受體所生，不能證明對方有何態度',控制:'核對投入與回應',勢力:'可能較費力'},
    '用克體':{主動:'需留意阻力',我方:'有承壓象',對方:'用卦克體，不能推定對方正在打壓',控制:'先找實際阻力',勢力:'卦象偏受制'}
  };
  return map[rel]||{主動:'不明',我方:'觀察中',對方:'不確定',控制:'待觀察',勢力:'不明'};
}

// ═══ 月令 → 時機語義 ═══
function _mhTimingSemantics(tiWS, yoWS){
  if(tiWS.level==='旺'||tiWS.level==='相'){
    return {stance:'小步測試',desc:'體卦在本次節令較有力；可小步推進並核對現實條件'};
  }
  if(yoWS.level==='旺'&&(tiWS.level==='囚'||tiWS.level==='死')){
    return {stance:'先核對阻力',desc:'用卦節令較強、體卦較弱；先核對目前阻力，再決定如何推進'};
  }
  if(tiWS.level==='囚'||tiWS.level==='死'){
    return {stance:'保留餘裕',desc:'體卦節令較弱，可先保留資源並確認可行條件'};
  }
  if(yoWS.level==='旺'){
    return {stance:'分段推進',desc:'用卦節令較有力，適合按實際回應分段調整'};
  }
  return {stance:'依現實決定',desc:'卦氣沒有足以換算日曆時機的訊號，仍依實際條件決定'};
}

// ═══ 相對節奏判斷（不把卦象分數換算成日曆） ═══
function _mhTiming(dong, tiRel, dongEl, tiWS, type){
  // 動爻位置
  const dongSpeed = dong<=2?'快' : dong<=4?'中' : '慢';
  // 體用關係
  const relSpeed = {'用生體':'快','比和':'中','體克用':'中','體生用':'中慢','用克體':'慢'}[tiRel]||'中';
  // 五行速度
  const wxSpeed = {木:'中快',火:'快',土:'慢',金:'中',水:'慢'}[dongEl]||'中';
  // 旺衰
  const wsSpeed = tiWS.level==='旺'?'快' : (tiWS.level==='囚'||tiWS.level==='死')?'慢' : '中';

  // 綜合計算
  const speedScore = {快:1,中快:1,中:0,中慢:-1,慢:-1};
  const total = (speedScore[dongSpeed]||0)+(speedScore[relSpeed]||0)+(speedScore[wxSpeed]||0)+(speedScore[wsSpeed]||0);

  let label, range, note;
  if(total>=3){
    label='很快'; range='相對近期'; note='卦象節奏偏快，但不能由此換算天數或日期';
  } else if(total>=1){
    label='短期'; range='相對近期'; note='有動力但仍需走過盤面所示過程，不能換算週數';
  } else if(total>=-1){
    label='稍晚'; range='相對中期'; note='過程中有等待；只能判相對層次，不能換算月份';
  } else if(total>=-2){
    label='拖延型'; range='相對較遠'; note='體用阻滯，需等條件改變；不能由分數推算實際月數';
  } else {
    label='反覆型'; range='時間不定，可能走走停停'; note='五行不和，容易反覆';
  }

  // 類型微調
  if(type==='love'&&tiRel==='用克體') note='感情題見用克體的受制象，須核對真實阻力；不能據此宣稱對方態度或應期已延後';
  if(type==='wealth'&&dongEl==='水') note='財務節奏偏流動與反覆，須用現金流或成交等現實指標驗證；不得直接指定季節或月份';
  if(type==='health') note='身體恢復視調養而定，不以卦論速';

  return {label, range, note, score:total, precision:'relative-only'};
}

// ═══ 類型專用信號與建議 ═══
function _mhTypeAnalysis(type, rel, tiEl, yoEl, dong, dongStage, huHidden, bianTrend, tiWS){
  let focus='', blockSource='', mainRisk='', actionCore=[], signals=[];

  if(type==='love'){
    // 體用表示此次問事的作用方向；只有現實互動才能確認對方意願。
    if(rel==='用生體') signals.push('用卦生體偏有受助或回應的象，但不能單憑此卦認定對方主動或有好感');
    if(rel==='體生用') signals.push('體生用偏向需要你投入；對方是否接受仍看實際回應');
    if(rel==='用克體') signals.push('用卦克體偏有推進阻力；不能據此指認第三者或反對者');
    if(rel==='體克用') signals.push('體克用偏向你可調整互動方式；不能由此決定對方感受');
    if(rel==='比和') signals.push('體用比和偏有互動空間，但不足以認定雙方都有交往意願');
    if(dong<=2) focus='動爻在初、二，先看互動是否已有可持續的起點';
    else if(dong<=4) focus='動爻在三、四，重點在溝通與界線如何銜接';
    else if(dong===5) focus='動爻在五，重點在雙方是否明確表達想法';
    else focus='動爻在上，宜回看原有互動是否需要調整';
    if(huHidden.cat==='外部壓制') blockSource='互卦提示可能有壓力，具體原因須核對距離、時機與相處方式';
    else if(huHidden.cat==='自耗') blockSource='留意自己投入多少，以及對方是否有相應行動';
    else if(huHidden.cat==='拉鋸') blockSource='互卦偏向現有互動延續，先看是否有人實際推進';
    else blockSource=huHidden.desc;
    mainRisk=bianTrend.type==='惡化'?'變後用卦克體，若互動持續受阻，先確認對方的界線':bianTrend.type==='好轉'?'變後用卦生體，若對方也持續回應，可以循序靠近':'卦象仍需與現實互動合參，別憑猜測升級關係判斷';
    if(rel==='用生體') actionCore=['對方若持續主動延伸互動，可以自然回應','觀察是否只在工作之外也願意相處','有明確回應再考慮下一步'];
    else if(rel==='體生用') actionCore=['放慢單方面投入，觀察對方是否願意回應','對方的回應若長期不足，調整期待','有互相投入再評估關係'];
    else if(rel==='用克體') actionCore=['先核對實際卡點與對方界線','溝通時留意對方的回應','沒有明確意願就保持尊重'];
    else if(rel==='體克用') actionCore=['可主動提出一次自然邀約','給對方自由選擇的空間','依實際回應調整步調'];
    else actionCore=['維持自然互動','觀察雙方是否持續主動','再依現實訊號判斷是否往前'];

  } else if(type==='career'){
    if(dongStage.stage==='決策'||dongStage.stage==='收束') focus='爻位偏重決策與收束，先核對是否已到升遷或去留的實際節點';
    else if(dongStage.stage==='銜接'||dongStage.stage==='轉折') focus='爻位偏重銜接與調整，可檢查執行流程是否有卡點';
    else focus='爻位偏向建立條件，先確認工作計畫是否已具體啟動';
    if(rel==='用克體') {
      signals.push('用克體提示職場承壓，不能由卦象認定主管正在打壓或架空');
      blockSource='先核對工作職責、流程與可用資源中的限制';
    } else if(rel==='體生用') {
      signals.push('體生用偏向投入多，回報是否對等須核薪資、工作量與成果');
      blockSource='投入與回報是否對等，須由工作紀錄確認';
    } else if(rel==='用生體') {
      signals.push('用生體有資源可用的象，但仍須查是否有人、預算或制度支持');
      blockSource='看目前資源能否真正到位';
    } else if(rel==='體克用') {
      signals.push('體克用提示可主動處理問題；能否落實仍看權限與資源');
      blockSource='取得推進所需權限與資源';
    }
    // 卡在哪裡
    if(huHidden.cat==='外部壓制') blockSource+='（互卦有克體象，需確認實際來源）';
    else if(huHidden.cat==='自耗') blockSource+='（互卦有持續投入象，需確認實際成本）';
    mainRisk=bianTrend.type==='惡化'?'變後用卦克體，若現實阻力持續，先準備備選方案':'變後用卦顯示可調整的方向，仍須核對實際決策與進度';
    if(rel==='用生體') actionCore=['確認能支持你的人與資源','與關鍵決策者確認下一步','取得明確承諾後再投入更多'];
    else if(rel==='體生用') actionCore=['核對投入與回報是否對等','找機會談你的貢獻和期望','若長期不對等，再評估其他選項'];
    else if(rel==='用克體') actionCore=['先找實際阻力，不急於對人下判斷','對照可用資源和決策條件','阻力持續時再準備備選方案'];
    else if(rel==='體克用') actionCore=['提出可執行的方案與期限','以已有成果爭取授權','依實際反饋調整'];
    else actionCore=['保持現狀觀察','等更明確的信號再動','不急著做大決定'];

  } else if(type==='wealth'){
    const wealthType = rel==='用生體'?'生體助力' : rel==='體生用'?'投入與支出' : rel==='用克體'?'資源受制' : rel==='體克用'?'主動處理' : '條件相持';
    signals.push('財務卦象主題：'+wealthType+'；實際收入、支出和風險須依帳目確認');
    if(rel==='用生體') focus='卦象較有承接收入的助力，先核對已確認的訂單、應收款與到帳';
    else if(rel==='體生用') focus='卦象偏需投入，先核對實際支出與回報';
    else if(rel==='用克體') focus='卦象提示財務承壓，先檢查現金流與風險';
    else if(rel==='體克用') focus='卦象偏向可主動調整，先從可控制的成本著手';
    else focus='卦象條件相持，先核對本期財務數字';
    blockSource=huHidden.desc+'；具體金流仍以帳目為準';
    mainRisk=bianTrend.type==='惡化'?'變後用卦克體，若現金流持續吃緊，宜優先保留餘裕':bianTrend.type==='好轉'?'變後用卦生體，實際增收仍須有已完成交易支持':'卦象沒有提供可核對的收益數字，先看已發生的金流';
    if(rel==='用生體') actionCore=['核對已成交且確定可入帳的款項','預留必要開支','不要以卦象當作投資依據'];
    else if(rel==='體生用') actionCore=['列出實際支出與回收期限','刪除效益不明的成本','避免借款冒險'];
    else if(rel==='用克體') actionCore=['保守為主，不宜冒險','把現金流穩住','不要追高或情緒操作'];
    else if(rel==='體克用') actionCore=['先處理自己可調整的預算','設定可核對的財務目標','依真實數字定期檢視'];
    else actionCore=['維持現狀','記帳控制支出','不做大動作'];

  } else if(type==='health'){
    // 五行取象不能診斷器官、免疫能力或病程。
    if(rel==='用克體') {
      signals.push('卦象有承壓意象，身體症狀及原因須由實際檢查確認');
      focus='先留意是否有持續不適與實際壓力來源';
    } else if(rel==='體生用') {
      signals.push('卦象偏向投入多，不能據此判斷體質');
      focus='核對睡眠、作息與已出現的症狀';
    } else if(tiWS.level==='死'||tiWS.level==='囚') {
      signals.push('月令象徵體卦較弱，不能推成免疫力下降');
      focus='留意具體症狀，必要時詢問醫療專業人員';
    } else {
      focus='卦象不能判定健康檢查結果；以實際症狀與檢查為準';
    }
    blockSource=huHidden.desc;
    mainRisk='⚠ 健康僅供參考，不構成醫療建議。若持續不適請就醫。';
    actionCore=['記錄持續或惡化的症狀','照顧作息並核對壓力來源','有持續不適時請醫師評估'];

  } else if(type==='relationship'){
    if(rel==='用生體') { signals.push('用生體提示可尋找實際支持，不能據此認定對方有誠意'); focus='互動若有回應，可先核對可落實的合作條件'; }
    else if(rel==='用克體') { signals.push('用克體提示受制，不能由此判定對方在主導'); focus='確認彼此權責並保留必要界線'; }
    else if(rel==='體克用') { signals.push('體克用提示可主動協商，談判優勢須依實際籌碼'); focus='先提出明確條件並觀察回應'; }
    else if(rel==='體生用') { signals.push('體生用提示你可能需要投入，對方是否受益應看實際互動'); focus='把自己的投入與期待談清楚'; }
    else { signals.push('體用比和是同類作用，不能保證雙方立場一致'); focus='核對彼此已明確提出的條件'; }
    blockSource=huHidden.desc;
    mainRisk=bianTrend.type==='惡化'?'變後用卦克體，若實際條件對你不利，先談好保護條款':'卦象仍需對照彼此實際意願，重要約定宜說清楚';
    if(rel==='用生體') actionCore=['確認對方提供的實際資源','有合作意願再約定書面條件','預留調整與退出機制'];
    else if(rel==='用克體') actionCore=['先穩住底線','不要急著簽約或承諾','加保護條款，留書面記錄'];
    else if(rel==='體克用') actionCore=['用實際籌碼提出條件','兼顧雙方可以接受的安排','以明確條款降低誤解'];
    else actionCore=['觀察對方真實意圖','不要先開牌','保持彈性和距離'];

  } else if(type==='family'){
    if(rel==='體生用') { signals.push('體生用提示你可能持續投入；家人感受仍須溝通確認'); focus='核對自己投入與家人真實需求'; }
    else if(rel==='用克體') { signals.push('用克體提示壓力象，不能據此斷言家中有積怨'); focus='找出實際讓相處吃力的情境'; }
    else if(rel==='用生體') { signals.push('用生體提示可尋找支持；有沒有家人幫忙須核對'); focus='確認家庭目前有哪些可用的支持'; }
    else { focus='體用關係提示有調整空間，先了解目前相處狀況'; }
    if(dong===5) signals.push('五爻偏重決策層，但不證明長輩已有行動');
    blockSource=huHidden.desc;
    mainRisk=bianTrend.type==='惡化'?'若具體衝突持續，宜提早溝通並保留界線':bianTrend.type==='好轉'?'若彼此能回應，關係有緩和空間':'視實際相處調整溝通方式';
    if(rel==='用克體') actionCore=['先保護自己的情緒空間','換個溝通方式，不要硬碰','設定合理界線'];
    else if(rel==='體生用') actionCore=['減少無條件付出','讓家人承擔自己的責任','把能量也留給自己'];
    else actionCore=['主動溝通但不說教','找合適時機談','一次只處理一件事'];

  } else {
    focus='事情目前處於'+dongStage.stage+'階段';
    blockSource=huHidden.desc;
    mainRisk=bianTrend.desc;
    if(rel==='用生體') actionCore=['有受助象，先核實哪些資源真正可用','條件到位後小步推進'];
    else if(rel==='用克體') actionCore=['有承壓象，先核對阻力來源','依實際回應調整策略'];
    else actionCore=['觀察局勢','等更明確的訊號','不急著行動'];
    signals.push('問題類型：一般事項');
  }

  return {focus, blockSource, mainRisk, actionCore, signals};
}

// ═══ 完整梅花分析引擎 v3 ═══
function analyzeMeihua(mh, type){
  if(!mh) return {score:40, analysis:null};
  const tiEl=mh.tiG.el, yoEl=mh.yoG.el;
  const tiName=mh.tiG.name, yoName=mh.yoG.name;
  const dong=mh.dong||1;
  const now=mhReferenceDate(mh);

  // ── 基礎層 ──
  const rel=mh.ty.r||'—';
  const tyScore={大吉:25,吉:15,小吉:6,平:0,小凶:-10,凶:-22};
  let score=40+(tyScore[mh.ty.f]||0);

  // ── 月令旺衰 ──
  const tiWS=getMhWangShuai(tiEl, now);
  const yoWS=getMhWangShuai(yoEl, now);
  score+=tiWS.score*3;

  // ── 互卦五行 ──
  let huLoG=null, huUpG=null, huTiRel='無', huYoRel='無';
  const benLines=mh.ben?[...mh.lo.li,...mh.up.li]:null;
  if(benLines){
    const nuclear=mhNuclearContext(mh);
    huLoG=nuclear.lower;
    huUpG=nuclear.upper;
    if(huLoG&&huUpG){
      huTiRel=mhRelation(tiEl, huLoG.el);
      huYoRel=mhRelation(tiEl, huUpG.el);
    }
  }
  // 上下互均以原體為參照；作用不同時保留兩者，不固定挑較有利的一個。
  const huRelPrimary=huTiRel===huYoRel?huTiRel:'交錯';
  score+={'B生A':4,'比和':1,'A剋B':1,'A生B':-2,'B剋A':-4}[huRelPrimary]||0;

  // ── 變卦五行 ──
  let biLoG=null, biUpG=null, bianTiRel='無', bianYoRel='無';
  if(benLines){
    const biL=[...benLines]; biL[dong-1]=biL[dong-1]?0:1;
    biLoG=gByL(biL[0],biL[1],biL[2]);
    biUpG=gByL(biL[3],biL[4],biL[5]);
    if(biLoG&&biUpG){
      bianTiRel=mhRelation(tiEl, biLoG.el);
      bianYoRel=mhRelation(tiEl, biUpG.el);
    }
  }
  // 體為不動的三爻卦；變後只比較原體與變後用卦，不能用體比自己覆蓋結果。
  const bianRelPrimary=dong<=3?bianTiRel:bianYoRel;
  score+={'B生A':8,'比和':2,'A剋B':1,'A生B':-3,'B剋A':-8}[bianRelPrimary]||0;

  // 爻辭須連條件讀，不用「吉／凶」字串為幾何關係加減分。
  score=Math.max(10,Math.min(90,score));

  // ── 六大判斷層輸出 ──
  const dongStage=_mhDongStage(dong);
  const tySemantics=_mhTySemantics(rel);
  const dongEl=(dong<=3)?mh.lo.el:mh.up.el;
  const dongSide=(dong>3?'上卦':'下卦')+'，即本次用卦；原體保留在另一個不動的三爻卦';
  const huHidden=_mhHuHidden(huRelPrimary);
  const bianTrend=_mhBianTrend(bianRelPrimary, mh.bian&&mh.bian.n);
  const guaType=_mhGuaType(mh.ben&&mh.ben.n, mh.up&&mh.up.el);
  const timingObj=_mhTiming(dong, rel, dongEl, tiWS, type||'general');
  const timingSemantic=_mhTimingSemantics(tiWS, yoWS);
  const typeAnalysis=_mhTypeAnalysis(type||'general', rel, tiEl, yoEl, dong, dongStage, huHidden, bianTrend, tiWS);
  const wxEvent=MH_WX_EVENT[dongEl]||{events:['未知'],timing:'不定',speed:'中'};

  // ── 互卦 / 變卦 effect 文字（向下相容）──
  const huEffect=huHidden.desc;
  let bianEffect=bianTrend.desc;
  const consistency=
    (huRelPrimary==='B生A'&&bianRelPrimary==='B生A')?'互卦與變後用卦都有生體作用，繼續檢查旺衰及實際落實條件':
    (huRelPrimary==='B剋A'&&bianRelPrimary==='B剋A')?'互卦及變後用卦均有克體象，須對照實際阻力':
    huRelPrimary==='交錯'?'互卦作用交錯，須分別看助力能否承接、阻力如何影響變後用卦':'互卦與變後用卦的作用需分層合參，不能只取其中較有利的一項';

  // ── narrativeBlocks ──
  const narrativeBlocks={
    situation: `本卦「${mh.ben&&mh.ben.n||''}」取象為「${guaType}」。` +
      `原體（${tiName}${tiEl}）與用卦（${yoName}${yoEl}）呈「${rel}」——${tySemantics.我方}；${tySemantics.對方}。` +
      (tiWS.level!=='平'?`本次月令下體卦呈${tiWS.level}，這是卦氣條件，須與現實處境合參。`:''),

    coreTension: `關鍵轉折：動爻落在第${dong}爻，爻位取象為「${dongStage.stage}」——${dongStage.meaning}。` +
      `變化來自${dongSide}。互卦「${mh.hu&&mh.hu.n||''}」提示：${huHidden.desc}。`,

    trend: `後續條件：互卦有「${huHidden.cat}」的象，` +
      `變卦「${mh.bian&&mh.bian.n||''}」按變後用卦對原體取象為「${bianTrend.type}」——${bianTrend.desc}。` +
      `${consistency}。`,

    risk: typeAnalysis.mainRisk,

    action: `行動建議：\n${typeAnalysis.actionCore.map((a,i)=>`${i+1}. ${a}`).join('\n')}`,

    timing: `應期：${timingObj.label}（${timingObj.range}）。${timingObj.note}。` +
      `時機判斷：${timingSemantic.desc}（${timingSemantic.stance}）。`
  };

  // ── 回傳完整結構 ──
  return {
    // 向下相容欄位
    score,
    scorePolicy:'站內關係摘要指標，非原典分數、機率或精確結果；不按爻辭關鍵字計分',
    nuclear:mhNuclearContext(mh),
    narrative: Object.values(narrativeBlocks).join(' '),
    tiYong:{rel, judge:mh.ty.f, desc:mh.ty.d, tiEl, yoEl, tiName, yoName},
    dongYao:{pos:dong, inTi:false, inYong:true, side:dong>3?'upper':'lower', desc:dongStage.meaning, stage:dongStage},
    referenceTimestamp:now.toISOString(),
    wangShuai:{ti:tiWS, yo:yoWS},
    huGua:{
      rel:`互卦上${huUpG?huUpG.name:'?'}(${huUpG?huUpG.el:'?'})/下${huLoG?huLoG.name:'?'}(${huLoG?huLoG.el:'?'})`,
      tiRel:huTiRel+'/'+huYoRel,
      effect:huEffect, lowerRelation:huTiRel, upperRelation:huYoRel, primaryRelation:huRelPrimary
    },
    bianGua:{
      rel:`變卦上${biUpG?biUpG.name:'?'}(${biUpG?biUpG.el:'?'})/下${biLoG?biLoG.name:'?'}(${biLoG?biLoG.el:'?'})`,
      tiRel:bianTiRel+'/'+bianYoRel,
      effect:bianEffect, changedUseRelation:bianRelPrimary, comparisonPolicy:'ORIGINAL_BODY_VS_CHANGED_USE'
    },
    signals:typeAnalysis.signals,
    timing:timingObj,

    // 新增完整結構
    dir: score>=65?'吉':score>=50?'小吉':score>=38?'平':score>=28?'小凶':'凶',
    confidence: '未量化',
    phase: dongStage.stage,
    structure: {
      benGua:{name:mh.ben&&mh.ben.n, type:guaType, el:mh.up&&mh.up.el},
      huGua:{name:mh.hu&&mh.hu.n, hidden:huHidden},
      bianGua:{name:mh.bian&&mh.bian.n, trend:bianTrend}
    },
    tiYongFull: tySemantics,
    benGua:mh.ben,
    huGua2:mh.hu,
    bianGua2:mh.bian,
    dongYaoFull:dongStage,
    trend:bianTrend,
    risk:typeAnalysis.mainRisk,
    timingFull:timingObj,
    timingStance:timingSemantic,
    strategy:typeAnalysis.actionCore,
    people:typeAnalysis.signals,
    eventNature:wxEvent,
    actionAdvice:typeAnalysis.actionCore,
    narrativeBlocks,
    tags:[
      `體用:${rel}`,
      `吉凶:${mh.ty.f}`,
      `動爻:第${dong}爻`,
      `階段:${dongStage.stage}`,
      `走向:${bianTrend.type}`,
      `應期:${timingObj.label}`,
      `月令:${tiWS.level}`,
      `五行:${dongEl}`
    ]
  };
}

/* ═══ 梅花易數六大項目固定五段輸出（SOP v3）═══ */
function generateMeihuaStory(type, mh){
  if(!mh) return '';
  const a=analyzeMeihua(mh, type);
  if(!a) return '';
  const nb=a.narrativeBlocks;
  if(!nb) return '';

  const rel=mh.ty.r||'';
  const dong=mh.dong||1;
  const tiEl=mh.tiG?mh.tiG.el:'';

  // 主要結論一句話
  const tyConclusion={
    '用生體':'卦象較有助力，落實仍看現實回應',
    '比和':'卦象有同類相應，雙方條件仍需確認',
    '體克用':'卦象提示可主動調整，結果須看實際條件',
    '體生用':'卦象偏需付出，先核對投入與回報',
    '用克體':'卦象偏受制，先核對真正阻力'
  }[rel]||'卦象方向未明，先核對現實條件';

  let s='<strong>結論：'+tyConclusion+'</strong>';
  s+='<br><br>📌 <strong>現況：</strong>'+nb.situation;
  s+='<br><br>🔍 <strong>核心矛盾：</strong>'+nb.coreTension;
  s+='<br><br>📈 <strong>發展走向：</strong>'+nb.trend;
  if(nb.risk) s+='<br><br>⚠️ <strong>風險提醒：</strong>'+nb.risk;
  s+='<br><br>🎯 <strong>行動建議：</strong><br>'+a.actionAdvice.map(x=>'• '+x).join('<br>');
  s+='<br><br>⏳ <strong>應期：</strong>'+nb.timing;
  if(type==='wealth') s+='<br><span style="font-size:.78rem;color:var(--c-text-muted)">⚠ 僅作參考，不構成投資建議</span>';
  if(type==='health') s+='<br><span style="font-size:.78rem;color:var(--c-text-muted)">⚠ 健康資訊僅供參考，不構成醫療診斷</span>';
  return s;
}
