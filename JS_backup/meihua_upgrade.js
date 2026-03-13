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
  if(KE[ti]===yo)return{r:'體克用',f:'小吉',d:'可掌控局面，但需費力。'};
  return{r:'—',f:'平',d:''};
}

// ═══ 月令旺衰 ═══
function getMhWangShuai(el, month){
  if(!el||!month) return {level:'平',score:0};
  const m=typeof month==='number'?month:(new Date()).getMonth()+1;
  let season;
  if([1,2,3].includes(m)) season='spring';
  else if([4,5,6].includes(m)) season='summer';
  else if([7,8,9].includes(m)) season='autumn';
  else season='winter';
  if([3,6,9,12].includes(m)) season='earth';
  const table={
    spring:{木:'旺',火:'相',土:'死',金:'囚',水:'休'},
    summer:{火:'旺',土:'相',金:'死',水:'囚',木:'休'},
    autumn:{金:'旺',水:'相',木:'死',火:'囚',土:'休'},
    winter:{水:'旺',木:'相',火:'死',土:'囚',金:'休'},
    earth:{土:'旺',金:'相',水:'死',木:'囚',火:'休'}
  };
  const levelScore={旺:3,相:1,休:0,囚:-1,死:-2};
  const level=table[season][el]||'平';
  return {level, score:levelScore[level]||0, season};
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
function calcMH(un,ln,dy){
  const up=gByN(un),lo=gByN(ln),dong=((dy-1)%6)+1;
  const ben=g64(up.n, lo.n);
  const benL=[...lo.li,...up.li];
  const huLo=gByL(benL[1],benL[2],benL[3]);
  const huUp=gByL(benL[2],benL[3],benL[4]);
  const hu=g64(huUp.n, huLo.n);
  const biL=[...benL]; biL[dong-1]=biL[dong-1]?0:1;
  const biLo=gByL(biL[0],biL[1],biL[2]);
  const biUp=gByL(biL[3],biL[4],biL[5]);
  const bian=g64(biUp.n, biLo.n);
  const tiG=dong<=3?up:lo, yoG=dong<=3?lo:up;
  const ty=tiYong(tiG.el,yoG.el);
  return{up,lo,dong,ben,hu,bian,tiG,yoG,ty};
}

// ═══════════════════════════════════════════════════════════════
// 五行事件映射（供所有層使用）
// ═══════════════════════════════════════════════════════════════
const MH_WX_EVENT={
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
  if(huRel==='B剋A') return {cat:'外部壓制',desc:'有你看不到的外在力量在壓著這件事'};
  if(huRel==='A生B') return {cat:'自耗',desc:'你自己的行動在消耗你的資源'};
  if(huRel==='B生A') return {cat:'暗中有助',desc:'有隱藏的支援或機緣在默默推進'};
  if(huRel==='比和') return {cat:'拉鋸',desc:'雙方勢均力敵，過程平穩但沒突破'};
  if(huRel==='A剋B') return {cat:'可控',desc:'你能壓制過程中的變數'};
  return {cat:'變數',desc:'中間過程有未知因素'};
}

// ═══ 變卦走向分類 ═══
function _mhBianTrend(bianRel, bianName){
  if(bianRel==='B生A') return {type:'好轉',desc:'最終有轉好的跡象，但需要走過過程'};
  if(bianRel==='B剋A') return {type:'惡化',desc:'若照目前走，結局不樂觀，需要主動介入'};
  if(bianRel==='比和') return {type:'平穩',desc:'結果不差不好，維持現狀'};
  if(bianRel==='A生B') return {type:'拖延',desc:'你一直付出但結局拖著，消耗型走向'};
  if(bianRel==='A剋B') return {type:'另有出口',desc:'你能主動扭轉，但需要刻意改變策略'};
  // fallback from gua name
  if(bianName&&(bianName.includes('泰')||bianName.includes('晉')||bianName.includes('大有'))) return {type:'好轉',desc:'變卦卦象偏順，終有轉機'};
  if(bianName&&(bianName.includes('否')||bianName.includes('剝')||bianName.includes('困'))) return {type:'惡化',desc:'變卦卦象偏困，需謹慎'};
  return {type:'反覆',desc:'結果不確定，可能在好壞之間反覆'};
}

// ═══ 動爻階段意義 ═══
function _mhDongStage(dong){
  const map={
    1:{stage:'起步',meaning:'事情剛起心動念，還在醞釀',主動:'你內心萌動但未行動',穩定:'低',節奏:'快'},
    2:{stage:'成形',meaning:'已有初步條件，正在具體化',主動:'條件在聚攏',穩定:'低中',節奏:'快中'},
    3:{stage:'卡關',meaning:'執行層卡住，有摩擦或溝通問題',主動:'主動推進中遇到阻力',穩定:'中',節奏:'中'},
    4:{stage:'轉折',meaning:'來到關鍵轉折點，走向即將確立',主動:'外部介入，被動轉折',穩定:'中高',節奏:'中'},
    5:{stage:'成熟',meaning:'關鍵決策層，資源/權力/主事者在動',主動:'主導者出手',穩定:'高',節奏:'慢'},
    6:{stage:'收尾',meaning:'事情接近結局，可能有翻盤',主動:'最後機會窗口',穩定:'高',節奏:'慢或急收'}
  };
  return map[dong]||map[1];
}

// ═══ 體用語義轉換 ═══
function _mhTySemantics(rel){
  const map={
    '用生體':{主動:'被動',我方:'受益',對方:'主動付出或扶持你',控制:'對方可控，對你有利',勢力:'對方強，但友善'},
    '比和':  {主動:'雙向',我方:'平衡',對方:'勢均力敵',控制:'雙方都有影響力',勢力:'相當'},
    '體克用':{主動:'主動',我方:'主導',對方:'你能壓制',控制:'你掌控，但費力',勢力:'我方略強'},
    '體生用':{主動:'主動但耗損',我方:'付出方',對方:'受益方',控制:'你主動但不受控',勢力:'對方受你資助'},
    '用克體':{主動:'被動',我方:'受壓',對方:'主動壓制你',控制:'對方掌控',勢力:'對方強且不友善'}
  };
  return map[rel]||{主動:'不明',我方:'觀察中',對方:'不確定',控制:'待觀察',勢力:'不明'};
}

// ═══ 月令 → 時機語義 ═══
function _mhTimingSemantics(tiWS, yoWS){
  if(tiWS.level==='旺'||tiWS.level==='相'){
    return {stance:'快攻',desc:'當下時機站在你這邊，適合積極推進'};
  }
  if(yoWS.level==='旺'&&(tiWS.level==='囚'||tiWS.level==='死')){
    return {stance:'退守',desc:'對方/環境當令，你的能量偏弱，不適合正面衝突'};
  }
  if(tiWS.level==='囚'||tiWS.level==='死'){
    return {stance:'暫停',desc:'你的能量受制，強行推進消耗大，建議先等待'};
  }
  if(yoWS.level==='旺'){
    return {stance:'慢推',desc:'環境力量大，順勢而為，不可硬推'};
  }
  return {stance:'觀望',desc:'目前氣場普通，不急著動'};
}

// ═══ 應期推算 ═══
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
    label='很快'; range='1～7天'; note='卦氣旺，動得快，不要等';
  } else if(total>=1){
    label='短期'; range='1～4週'; note='有動力但需走過過程';
  } else if(total>=-1){
    label='稍晚'; range='1～3個月'; note='過程中有等待，別催';
  } else if(total>=-2){
    label='拖延型'; range='3個月以上'; note='體用阻滯，推進困難，需等條件改變';
  } else {
    label='反覆型'; range='時間不定，可能走走停停'; note='五行不和，容易反覆';
  }

  // 類型微調
  if(type==='love'&&tiRel==='用克體') note='感情受壓，對方或外界阻力大，應期延後';
  if(type==='wealth'&&dongEl==='水') note='財水流動慢，等待冬季或水相月';
  if(type==='health') note='身體恢復視調養而定，不以卦論速';

  return {label, range, note, score:total};
}

// ═══ 類型專用信號與建議 ═══
function _mhTypeAnalysis(type, rel, tiEl, yoEl, dong, dongStage, huHidden, bianTrend, tiWS){
  const organMap={木:'肝膽／神經',火:'心臟／血液',土:'脾胃／消化',金:'肺／皮膚',水:'腎／泌尿'};
  let focus='', blockSource='', mainRisk='', actionCore=[], signals=[];

  if(type==='love'){
    // 誰主動
    if(rel==='用生體') signals.push('對方有主動意願，你是被追的那個');
    if(rel==='體生用') signals.push('你付出多，對方接受，但能量不對等');
    if(rel==='用克體') signals.push('感情有外在阻力，可能是第三者、家人反對或現實障礙');
    if(rel==='體克用') signals.push('你佔主導，但太強勢容易讓對方壓力大');
    if(rel==='比和') signals.push('雙方勢均力敵，都有意願，看誰先開口');
    // 階段
    if(dong<=2) focus='感覺剛開始萌芽，還在醞釀期';
    else if(dong<=4) focus='關係來到互動關鍵期，近期有機會升溫或明朗';
    else if(dong===5) focus='有人要做決定了，走向即將確立';
    else focus='這段感情走到了一個結尾或轉捩點';
    // 阻礙來源
    if(huHidden.cat==='外部壓制') blockSource='阻礙來自外部（距離、時機、他人）';
    else if(huHidden.cat==='自耗') blockSource='阻礙來自你自己的猶豫或過度付出';
    else if(huHidden.cat==='拉鋸') blockSource='雙方都在等對方先動';
    else blockSource=huHidden.desc;
    mainRisk=bianTrend.type==='惡化'?'若不積極，可能錯過窗口或漸行漸遠':bianTrend.type==='好轉'?'有轉機，但需要你主動創造條件':'結果可能停滯反覆，需要打破慣性';
    if(rel==='用生體') actionCore=['對方有好感，你可以適度回應','不要太主動，讓對方保持靠近的動力','把握近期的互動機會'];
    else if(rel==='體生用') actionCore=['減少主動付出，觀察對方有無回應','給自己設一個期限，不要無限投入','試著讓對方來找你'];
    else if(rel==='用克體') actionCore=['先理解外在阻礙是什麼','不要用情緒硬衝，找側面切入點','考慮這段關係的長期可行性'];
    else if(rel==='體克用') actionCore=['你有主導權，但保留空間給對方','主動但不急，給對方呼吸空間','適度示弱更有吸引力'];
    else actionCore=['維持自然互動，不刻意推進','觀察對方行動再決定','順其自然，不強求時間點'];

  } else if(type==='career'){
    if(dongStage.stage==='成熟'||dongStage.stage==='收尾') focus='職涯走到決策節點，升遷或去留快有結論';
    else if(dongStage.stage==='卡關'||dongStage.stage==='轉折') focus='現在是執行層卡點，人際或流程有摩擦';
    else focus='職場環境有變動，目前在起步或成形期';
    if(rel==='用克體') {
      signals.push('職場壓力大，有被上面打壓或架空的跡象');
      blockSource='制度或上位者在限制你';
    } else if(rel==='體生用') {
      signals.push('你付出很多但職場回報不符預期');
      blockSource='付出與回報不對等的結構問題';
    } else if(rel==='用生體') {
      signals.push('有貴人或資源正在支持你，把握機會');
      blockSource='暫無明顯阻礙';
    } else if(rel==='體克用') {
      signals.push('你有能力主導，但需要克服一些阻力才能推進');
      blockSource='阻力存在但可克服';
    }
    // 卡在哪裡
    if(huHidden.cat==='外部壓制') blockSource+='（外部結構在壓）';
    else if(huHidden.cat==='自耗') blockSource+='（你的能量在內耗）';
    mainRisk=bianTrend.type==='惡化'?'若不改變策略，現況會繼續惡化，考慮備選方案':'走向相對明朗，但需要主動把握時機';
    if(rel==='用生體') actionCore=['有貴人運，多跟主管或關鍵人物互動','把握目前的支持，趁勢推進','不要浪費好時機，主動提案'];
    else if(rel==='體生用') actionCore=['你投入太多，先評估投入是否值得','找機會談你的貢獻和期望','如果長期如此，考慮換環境'];
    else if(rel==='用克體') actionCore=['先自保，不要正面衝突','以退為進，找側門','悄悄準備備選方案'];
    else if(rel==='體克用') actionCore=['你有能力，主動爭取機會','展現成果，讓上面看到','但別太強勢引起反彈'];
    else actionCore=['保持現狀觀察','等更明確的信號再動','不急著做大決定'];

  } else if(type==='wealth'){
    // 財的性質
    const wealthType = rel==='用生體'?'偏財／意外收入機會' : rel==='體生用'?'花費大於收入' : rel==='用克體'?'風險財（行情壓著你走）' : rel==='體克用'?'正財（可主動掌控）' : '平穩型';
    signals.push('財運型態：'+wealthType);
    if(rel==='用生體') focus='有財主動來找你，注意把握，但不要因此冒進';
    else if(rel==='體生用') focus='支出大於收入，錢往外流，先止血';
    else if(rel==='用克體') focus='行情或支出在壓著你，有破財風險';
    else if(rel==='體克用') focus='你可以主動催財，但別過度自信';
    else focus='財務平穩，無大起伏';
    blockSource=huHidden.desc+'（財務的隱性風險：'+{外部壓制:'市場或外力壓力',自耗:'自己的花費或決策失誤',暗中有助:'有人在背後幫你',拉鋸:'入出相抵',可控:'你能掌握風險',變數:'不確定性高'}[huHidden.cat]||'待觀察'+')';
    mainRisk=bianTrend.type==='惡化'?'財務走向不樂觀，不宜冒進，先穩現金流':bianTrend.type==='好轉'?'財運有望好轉，但注意不可貪':'財務結果反覆，保守為主';
    if(rel==='用生體') actionCore=['有入帳機會，但不要因此冒險加碼','控制預算，把多餘的存起來','偏財可小試，不要押大'];
    else if(rel==='體生用') actionCore=['支出大於收入，先止血','砍掉不必要的消費','不要借錢投資'];
    else if(rel==='用克體') actionCore=['保守為主，不宜冒險','把現金流穩住','不要追高或情緒操作'];
    else if(rel==='體克用') actionCore=['可以主動理財，設好停損','適度投資，不要全押','保持定期檢視'];
    else actionCore=['維持現狀','記帳控制支出','不做大動作'];

  } else if(type==='health'){
    const tiOrgan=organMap[tiEl]||'整體';
    const yoOrgan=organMap[yoEl]||'';
    // 壓力型態
    if(rel==='用克體') {
      signals.push('外在壓力消耗體能，注意'+tiOrgan);
      focus='壓力型消耗，身體在被外在事務透支';
    } else if(rel==='體生用') {
      signals.push('你付出過多，體力內耗，注意休息');
      focus='消耗型體質，能量外流';
    } else if(tiWS.level==='死'||tiWS.level==='囚') {
      signals.push('月令不利，免疫力可能偏低');
      focus='當季氣場對你的五行不利，抵抗力偏弱';
    } else {
      focus='身體整體狀況中等，無明顯大問題';
    }
    blockSource=huHidden.cat==='外部壓制'?'壓力來源是外在環境（工作/人際）':huHidden.cat==='自耗'?'是自己的生活習慣在消耗身體':huHidden.desc;
    mainRisk='⚠ 健康僅供參考，不構成醫療建議。若持續不適請就醫。';
    actionCore=['規律作息是最基本的','注意'+tiOrgan+'方面','情緒壓力大時身體最先反應，留意情緒出口','若持續有症狀，請找醫師確認'];

  } else if(type==='relationship'){
    if(rel==='用生體') { signals.push('對方目前對你有利，有誠意'); focus='對方主動靠近，合作或互動有好基礎'; }
    else if(rel==='用克體') { signals.push('對方比你強勢，注意被主導'); focus='對方佔優勢，需要守住自己的底線'; }
    else if(rel==='體克用') { signals.push('你有談判優勢，但別壓太緊'); focus='你在主導位，可以開條件'; }
    else if(rel==='體生用') { signals.push('你付出比較多，對方受益'); focus='你在貢獻，但對方不一定感激'; }
    else { signals.push('雙方勢均力敵，互相觀察中'); focus='目前是觀察期，誰先出牌誰先虧'; }
    blockSource=huHidden.desc;
    mainRisk=bianTrend.type==='惡化'?'若不設條款保護自己，後期可能吃虧':'走向尚可，但維持關係需要持續管理';
    if(rel==='用生體') actionCore=['對方有利於你，但留退出機制','合作可以，但要有書面條款','不要因太順就放鬆警覺'];
    else if(rel==='用克體') actionCore=['先穩住底線','不要急著簽約或承諾','加保護條款，留書面記錄'];
    else if(rel==='體克用') actionCore=['你有優勢，但適度讓利','以長期關係為目標','不要壓榨對方'];
    else actionCore=['觀察對方真實意圖','不要先開牌','保持彈性和距離'];

  } else if(type==='family'){
    if(rel==='體生用') { signals.push('你在持續付出，但家人可能感受不到'); focus='你是家裡的給予者，但關係不一定對等'; }
    else if(rel==='用克體') { signals.push('家庭壓力在消耗你，有積怨或壓抑'); focus='家庭環境在消耗你的能量'; }
    else if(rel==='用生體') { signals.push('家庭有支持力量，有人在幫你'); focus='家人是你目前的後盾'; }
    else { focus='家庭關係平穩，日常互動中'; }
    if(dong===5) signals.push('長輩或主要決策者有動態，注意他們的狀態');
    blockSource=huHidden.cat==='外部壓制'?'外部壓力（經濟/社會）轉嫁到家庭':huHidden.cat==='自耗'?'家庭內部消耗（積怨或溝通問題）':huHidden.desc;
    mainRisk=bianTrend.type==='惡化'?'家庭矛盾可能積累到爆發，趁早溝通':bianTrend.type==='好轉'?'有緩和的可能，把握溝通時機':'反覆型，短期難以根本改善';
    if(rel==='用克體') actionCore=['先保護自己的情緒空間','換個溝通方式，不要硬碰','設定合理界線'];
    else if(rel==='體生用') actionCore=['減少無條件付出','讓家人承擔自己的責任','把能量也留給自己'];
    else actionCore=['主動溝通但不說教','找合適時機談','一次只處理一件事'];

  } else {
    focus='事情目前處於'+dongStage.stage+'階段';
    blockSource=huHidden.desc;
    mainRisk=bianTrend.desc;
    if(rel==='用生體') actionCore=['有外力助你，主動配合推進','不要浪費目前的好勢'];
    else if(rel==='用克體') actionCore=['外在阻力大，不要強推','等待時機或換策略'];
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
  const now=new Date();
  const curMonth=now.getMonth()+1;

  // ── 基礎層 ──
  const rel=mh.ty.r||'—';
  const tyScore={大吉:25,吉:15,小吉:6,平:0,小凶:-10,凶:-22};
  let score=40+(tyScore[mh.ty.f]||0);

  // ── 月令旺衰 ──
  const tiWS=getMhWangShuai(tiEl, curMonth);
  const yoWS=getMhWangShuai(yoEl, curMonth);
  score+=tiWS.score*3;

  // ── 互卦五行 ──
  let huLoG=null, huUpG=null, huTiRel='無', huYoRel='無';
  const benLines=mh.ben?[...mh.lo.li,...mh.up.li]:null;
  if(benLines){
    huLoG=gByL(benLines[1],benLines[2],benLines[3]);
    huUpG=gByL(benLines[2],benLines[3],benLines[4]);
    if(huLoG&&huUpG){
      huTiRel=mhRelation(tiEl, huLoG.el);
      huYoRel=mhRelation(tiEl, huUpG.el);
    }
  }
  // 互卦得分（取最有利那個）
  const huRelPrimary=[huTiRel,huYoRel].includes('B生A')?'B生A':
    [huTiRel,huYoRel].includes('B剋A')?'B剋A':
    [huTiRel,huYoRel].includes('比和')?'比和':
    [huTiRel,huYoRel].includes('A生B')?'A生B':'A剋B';
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
  const bianRelPrimary=[bianTiRel,bianYoRel].includes('B生A')?'B生A':
    [bianTiRel,bianYoRel].includes('B剋A')?'B剋A':
    [bianTiRel,bianYoRel].includes('比和')?'比和':
    [bianTiRel,bianYoRel].includes('A生B')?'A生B':'A剋B';
  score+={'B生A':8,'比和':2,'A剋B':1,'A生B':-3,'B剋A':-8}[bianRelPrimary]||0;

  // ── 動爻爻辭加分 ──
  if(mh.ben&&mh.dong&&typeof getYaoCi==='function'){
    const yc=getYaoCi(mh.ben.n, mh.dong);
    if(yc&&!yc.includes('擴充中')){
      if(yc.includes('元吉')||yc.includes('大吉')) score+=3;
      else if(yc.includes('吉')) score+=1;
      if(yc.includes('凶')) score-=3;
      if(yc.includes('厲')) score-=1;
    }
  }
  score=Math.max(10,Math.min(90,score));

  // ── 六大判斷層輸出 ──
  const dongStage=_mhDongStage(dong);
  const tySemantics=_mhTySemantics(rel);
  const dongEl=(dong<=3)?mh.lo.el:mh.up.el;
  const dongSide=(dong>3)?'體卦（你在改變）':'用卦（外在變化）';
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
    (huRelPrimary==='B生A'&&bianRelPrimary==='B生A')?'根因和走向一致偏好，準度較高':
    (huRelPrimary==='B剋A'&&bianRelPrimary==='B剋A')?'根因和走向一致偏差，情況需認真應對':
    '根因和走向有出入，代表你的做法可以改變結果';

  // ── narrativeBlocks ──
  const narrativeBlocks={
    situation: `目前狀況：「${mh.ben&&mh.ben.n||''}」，卦性為「${guaType}」。` +
      `你（${tiName}${tiEl}）與環境（${yoName}${yoEl}）的關係是「${rel}」——${tySemantics.我方}，${tySemantics.對方}。` +
      (tiWS.level!=='平'?`當月你的能量${tiWS.level}（${tiWS.level==='旺'||tiWS.level==='相'?'有利':'不利'}）。`:''),

    coreTension: `核心矛盾：動爻落在第${dong}爻，處於「${dongStage.stage}」階段——${dongStage.meaning}。` +
      `變化來自${dongSide}。互卦「${mh.hu&&mh.hu.n||''}」揭示：${huHidden.desc}。`,

    trend: `發展走向：互卦透露「${huHidden.cat}」，` +
      `最終變卦「${mh.bian&&mh.bian.n||''}」顯示走向「${bianTrend.type}」——${bianTrend.desc}。` +
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
    narrative: Object.values(narrativeBlocks).join(' '),
    tiYong:{rel, judge:mh.ty.f, desc:mh.ty.d, tiEl, yoEl, tiName, yoName},
    dongYao:{pos:dong, inTi:(dong>3), desc:dongStage.meaning, stage:dongStage},
    wangShuai:{ti:tiWS, yo:yoWS},
    huGua:{
      rel:`互卦上${huUpG?huUpG.name:'?'}(${huUpG?huUpG.el:'?'})/下${huLoG?huLoG.name:'?'}(${huLoG?huLoG.el:'?'})`,
      tiRel:huTiRel+'/'+huYoRel,
      effect:huEffect
    },
    bianGua:{
      rel:`變卦上${biUpG?biUpG.name:'?'}(${biUpG?biUpG.el:'?'})/下${biLoG?biLoG.name:'?'}(${biLoG?biLoG.el:'?'})`,
      tiRel:bianTiRel+'/'+bianYoRel,
      effect:bianEffect
    },
    signals:typeAnalysis.signals,
    timing:timingObj,

    // 新增完整結構
    dir: score>=65?'吉':score>=50?'小吉':score>=38?'平':score>=28?'小凶':'凶',
    confidence: (Math.abs(score-50)>20)?'高':'中',
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
    '用生體':'可行（外力助你）',
    '比和':'可行（內外一致）',
    '體克用':'可行但費力（你能掌控）',
    '體生用':'可但辛苦（付出多回收慢）',
    '用克體':'不利（外在壓力大）'
  }[rel]||'觀望';

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
