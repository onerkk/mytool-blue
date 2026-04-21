// ═══════════════════════════════════════════════════════════════
// tarot.js — 靜月之光模組化拆分
// ═══════════════════════════════════════════════════════════════

// ── Meihua Yishu: 64 gua + calc + analysis + story (lines 5270-5991) ──
/* =============================================================
   梅花易數 MEIHUA YISHU — 完整64卦
   ============================================================= */
var BG=[
  {name:'乾',sym:'☰',nat:'天',el:'金',n:1,li:[1,1,1]},
  {name:'兌',sym:'☱',nat:'澤',el:'金',n:2,li:[1,1,0]},
  {name:'離',sym:'☲',nat:'火',el:'火',n:3,li:[1,0,1]},
  {name:'震',sym:'☳',nat:'雷',el:'木',n:4,li:[1,0,0]},
  {name:'巽',sym:'☴',nat:'風',el:'木',n:5,li:[0,1,1]},
  {name:'坎',sym:'☵',nat:'水',el:'水',n:6,li:[0,1,0]},
  {name:'艮',sym:'☶',nat:'山',el:'土',n:7,li:[0,0,1]},
  {name:'坤',sym:'☷',nat:'地',el:'土',n:8,li:[0,0,0]}
];
var G64={
'11':{n:'乾為天',u:'䷀',j:'元亨利貞。',m:'剛健中正，萬事亨通，戒驕傲。'},
'12':{n:'天澤履',u:'䷉',j:'履虍尾，不咥人，亨。',m:'小心謹慎前行，合禮則吉。'},
'13':{n:'天火同人',u:'䷌',j:'同人于重，亨。',m:'志同道合者聚集，利涉大川。'},
'14':{n:'天雷無妄',u:'䷘',j:'元亨利貞。',m:'至誠無妄，順天而行。'},
'15':{n:'天風姤',u:'䷫',j:'女壯，勿用取女。',m:'偶然相遇，不可急進。'},
'16':{n:'天水訟',u:'䷅',j:'有孚，窒。',m:'爭訟之象，宜和解退讓。'},
'17':{n:'天山遁',u:'䷠',j:'亨，小利貞。',m:'退避保身，以退為進。'},
'18':{n:'天地否',u:'䷋',j:'否之匪人。',m:'閉塞不通，守靜待時。'},
'21':{n:'澤天夬',u:'䷪',j:'揚于王庭。',m:'決斷果敢，以剛決柔。'},
'22':{n:'兌為澤',u:'䷹',j:'亨，利貞。',m:'喜悅交流，言語得宜。'},
'23':{n:'澤火革',u:'䷰',j:'己日乃孚。',m:'變革除舊，時機成熟方可行。'},
'24':{n:'澤雷隨',u:'䷐',j:'元亨利貞，無咎。',m:'順勢而行，隨機應變。'},
'25':{n:'澤風大過',u:'䷛',j:'棟撓，利有攸往。',m:'力量過大，需謹慎。'},
'26':{n:'澤水困',u:'䷮',j:'亨，貞，大人吉。',m:'困境中堅守正道，終將通達。'},
'27':{n:'澤山咸',u:'䷞',j:'亨，利貞。',m:'感應之道，心意相通。'},
'28':{n:'澤地萃',u:'䷬',j:'亨，王假有廟。',m:'聚集匯萃，利見大人。'},
'31':{n:'火天大有',u:'䷍',j:'元亨。',m:'豐收大有，光明正大。'},
'32':{n:'火澤睽',u:'䷥',j:'小事吉。',m:'乖離背反，求同存異。'},
'33':{n:'離為火',u:'䷝',j:'利貞，亨。',m:'光明附麗，依附正道。'},
'34':{n:'火雷噬嗑',u:'䷔',j:'亨，利用獄。',m:'明辨是非，果斷處理。'},
'35':{n:'火風鼎',u:'䷱',j:'元吉，亨。',m:'鼎新除舊，變革創新。'},
'36':{n:'火水未濟',u:'䷿',j:'亨，小狐汔濟。',m:'尚未完成，仍需努力。'},
'37':{n:'火山旅',u:'䷷',j:'小亨。',m:'客居在外，謹慎處世。'},
'38':{n:'火地晉',u:'䷢',j:'康侯用錫馬蕃庶。',m:'光明上進，步步晉升。'},
'41':{n:'雷天大壯',u:'䷡',j:'利貞。',m:'氣勢壯盛，守正方吉。'},
'42':{n:'雷澤歸妹',u:'䷵',j:'征凶，無攸利。',m:'安分守己，不可妄動。'},
'43':{n:'雷火豐',u:'䷶',j:'亨，王假之。',m:'豐盛之時，居安思危。'},
'44':{n:'震為雷',u:'䷲',j:'亨。',m:'震動奮發，先驚後喜。'},
'45':{n:'雷風恆',u:'䷟',j:'亨，無咎，利貞。',m:'恆久不變，守持正道。'},
'46':{n:'雷水解',u:'䷧',j:'利西南。',m:'危難解除，宜速行動。'},
'47':{n:'雷山小過',u:'䷽',j:'亨，利貞。',m:'小有遍越，微調行事。'},
'48':{n:'雷地豫',u:'䷏',j:'利建侯行師。',m:'歡樂豫悅，準備充分。'},
'51':{n:'風天小畜',u:'䷈',j:'亨，密雲不雨。',m:'力量不足，暫時蓄積。'},
'52':{n:'風澤中孚',u:'䷼',j:'豚魚吉。',m:'誠信為本，信則靈驗。'},
'53':{n:'風火家人',u:'䷤',j:'利女貞。',m:'家道昌明，各安其位。'},
'54':{n:'風雷益',u:'䷩',j:'利有攸往。',m:'損上益下，利於進取。'},
'55':{n:'巽為風',u:'䷸',j:'小亨，利有攸往。',m:'柔順漸進，以退為進。'},
'56':{n:'風水渙',u:'䷺',j:'亨，王假有廟。',m:'離散渙散，需凝聚人心。'},
'57':{n:'風山漸',u:'䷴',j:'女歸吉，利貞。',m:'循序漸進，穩步前行。'},
'58':{n:'風地觀',u:'䷓',j:'盥而不薦。',m:'觀察審視，以身作則。'},
'61':{n:'水天需',u:'䷄',j:'有孚，光亨。',m:'等待時機，耐心守候。'},
'62':{n:'水澤節',u:'䷻',j:'亨，苦節不可貞。',m:'適度節制，不可過度。'},
'63':{n:'水火既濟',u:'䷾',j:'亨小，利貞。',m:'事已成，居安思危。'},
'64':{n:'水雷屯',u:'䷂',j:'元亨利貞。',m:'創始之難，堅持終有成。'},
'65':{n:'水風井',u:'䷯',j:'改邑不改井。',m:'養民之源，不可荒廢。'},
'66':{n:'坎為水',u:'䷜',j:'有孚，維心亨。',m:'重重險難，以信心行險。'},
'67':{n:'水山蹇',u:'䷦',j:'利西南。',m:'前路艱險，退守反省。'},
'68':{n:'水地比',u:'䷇',j:'吉，卟筮元永貞。',m:'親附比和，團結互助。'},
'71':{n:'山天大畜',u:'䷙',j:'利貞，不家食吉。',m:'蓄積力量，博積薄發。'},
'72':{n:'山澤損',u:'䷨',j:'有孚，元吉。',m:'減損自己，利益他人。'},
'73':{n:'山火賁',u:'䷕',j:'亨，小利有攸往。',m:'文飾外表，不忘本質。'},
'74':{n:'山雷頤',u:'䷚',j:'貞吉，觀頤。',m:'養生之道，慍言節食。'},
'75':{n:'山風蠱',u:'䷑',j:'元亨，利涉大川。',m:'整治腐敗，撥亂反正。'},
'76':{n:'山水蒙',u:'䷃',j:'亨，匪我求童蒙。',m:'啟蒙之初，虛心學習。'},
'77':{n:'艮為山',u:'䷳',j:'艮其背，不獲其身。',m:'適可而止，靜止守分。'},
'78':{n:'山地剝',u:'䷖',j:'不利有攸往。',m:'衰落剝蝕，靜待復甦。'},
'81':{n:'地天泰',u:'䷊',j:'小往大來，吉亨。',m:'通泰和順，萬事亨通。'},
'82':{n:'地澤臨',u:'䷒',j:'元亨利貞。',m:'居高臨下，教化萬民。'},
'83':{n:'地火明夷',u:'䷣',j:'利艱貞。',m:'光明受傷，韜光養晦。'},
'84':{n:'地雷復',u:'䷗',j:'亨，出入無疾。',m:'一陽復始，否極泰來。'},
'85':{n:'地風升',u:'䷭',j:'元亨。',m:'逐步上升，積小成大。'},
'86':{n:'地水師',u:'䷆',j:'貞，丈人吉。',m:'統率眾人，以正為要。'},
'87':{n:'地山謙',u:'䷍',j:'亨，君子有終。',m:'謙虛自牧，吉無不利。'},
'88':{n:'坤為地',u:'䷁',j:'元亨，利牝馬之貞。',m:'柔順承載，博德包容。'}
};

var gByN = function(n){return BG[((n-1)%8+8)%8]};
var g64 = function(un,ln){return G64[''+un+ln]||{n:'未知',u:'?',j:'',m:''}};
var gByL = function(l1,l2,l3){return BG.find(function(g){return g.li[0]===l1&&g.li[1]===l2&&g.li[2]===l3})||BG[7]};

// ═══ calcMH（核心起卦計算）═══
var calcMH = function(un,ln,dy){
  var up=gByN(un),lo=gByN(ln),dong=((dy-1)%6)+1;
  var ben=g64(up.n, lo.n);
  var benL=lo.li.concat(up.li);
  var huLo=gByL(benL[1],benL[2],benL[3]);
  var huUp=gByL(benL[2],benL[3],benL[4]);
  var hu=g64(huUp.n, huLo.n);
  var biL=benL.slice(); biL[dong-1]=biL[dong-1]?0:1;
  var biLo=gByL(biL[0],biL[1],biL[2]);
  var biUp=gByL(biL[3],biL[4],biL[5]);
  var bian=g64(biUp.n, biLo.n);
  var tiG=dong<=3?up:lo, yoG=dong<=3?lo:up;
  var ty=tiYong(tiG.el,yoG.el);
  var mh={up:up,lo:lo,dong:dong,ben:ben,hu:hu,bian:bian,tiG:tiG,yoG:yoG,ty:ty};
  try{ if(typeof buildMeihuaOutput==='function') buildMeihuaOutput(mh,'general'); }catch(e){}
  return mh;
}

function tiYong(ti,yo){
  if(ti===yo)return{r:'比和',f:'吉',d:'體用相同，事情順利。'};
  if(SHENG[yo]===ti)return{r:'用生體',f:'大吉',d:'外力助益，事半功倍。'};
  if(SHENG[ti]===yo)return{r:'體生用',f:'小凶',d:'耗費精力，付出多回報少。'};
  if(KE[yo]===ti)return{r:'用克體',f:'凶',d:'外力阻礙，困難重重。'};
  if(KE[ti]===yo)return{r:'體克用',f:'小吉',d:'可掌控局面，但需費力。'};
  return{r:'—',f:'平',d:''};
}

/* ═══ 梅花易數深度分析引擎 ═══
   體用關係 + 互卦過程 + 變卦走向 + 動爻 + 卦象五行生剋 */

// ═══ 月令五行旺衰表 ═══
// 春(1-3月)木旺火相土死金囚水休 | 夏(4-6月)火旺土相金死水囚木休
// 秋(7-9月)金旺水相木死火囚土休 | 冬(10-12月)水旺木相火死土囚金休
// 四季末(3,6,9,12月末18天)土旺金相水死木囚火休
function getMhWangShuai(el, month){
  if(!el) return {level:'平',score:0};
  // ── 依節氣近似日判定當前月支所屬季節 ──
  // 節氣邊界日（每月「節」的平均日期，誤差±1天）
  // 小寒~6, 立春~4, 驚蟄~6, 清明~5, 立夏~6, 芒種~6,
  // 小暑~7, 立秋~8, 白露~8, 寒露~8, 立冬~7, 大雪~7
  var now = new Date();
  var m = typeof month==='number' ? month : (now.getMonth()+1);
  var d = now.getDate();
  var JIE_DAY = {1:6,2:4,3:6,4:5,5:6,6:6,7:7,8:8,9:8,10:8,11:7,12:7};
  // 節後 = 進入新月支；節前 = 仍在上一月支
  // 月支→季節：寅卯=春, 辰=土, 巳午=夏, 未=土, 申酉=秋, 戌=土, 亥子=冬, 丑=土
  var SEASON_AFTER  = {1:'earth',2:'spring',3:'spring',4:'earth',5:'summer',6:'summer',
                       7:'earth',8:'autumn',9:'autumn',10:'earth',11:'winter',12:'winter'};
  var SEASON_BEFORE = {1:'winter',2:'earth',3:'spring',4:'spring',5:'earth',6:'summer',
                       7:'summer',8:'earth',9:'autumn',10:'autumn',11:'earth',12:'winter'};
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
  return {level:level, score:levelScore[level]||0, season:season};
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


function renderYaoLines(lines, dong){
  let html='<div class="yao-visual">';
  for(let i=5;i>=0;i--){
    const isYang=lines[i]===1;
    const isDong=dong&&(i+1)===dong;
    html+=`<div class="yao-row${isDong?' yao-dong':''}" title="${isDong?'◀ 動爻':'第'+(i+1)+'爻'}">`;
    if(isYang) html+=`<div style="width:100%;height:4px;background:${isDong?'#e8c968':'rgba(255,255,255,0.7)'}"></div>`;
    else html+=`<div style="width:42%;height:4px;background:${isDong?'#e8c968':'rgba(255,255,255,0.7)'}"></div><div style="width:12%"></div><div style="width:42%;height:4px;background:${isDong?'#e8c968':'rgba(255,255,255,0.7)'}"></div>`;
    if(isDong) html+=`<span style="color:#e8c968;font-size:0.6rem;margin-left:4px">◀</span>`;
    html+=`</div>`;
  }
  html+='</div>';
  return html;
}

function showMH(r){
  S.meihua=r;
  // 六爻圖 + 卦名
  const benL2=[...r.lo.li,...r.up.li];
  const bianL2=[...benL2]; bianL2[r.dong-1]=bianL2[r.dong-1]?0:1;
  const huL2=[benL2[1],benL2[2],benL2[3],benL2[2],benL2[3],benL2[4]];
  document.getElementById('mh-ben-s').innerHTML=typeof renderYaoLines==='function'?renderYaoLines(benL2,r.dong):r.ben.u;
  document.getElementById('mh-ben-n').textContent=r.ben.n;
  document.getElementById('mh-hu-s').innerHTML=typeof renderYaoLines==='function'?renderYaoLines(huL2):r.hu.u;
  document.getElementById('mh-hu-n').textContent=r.hu.n;
  document.getElementById('mh-bian-s').innerHTML=typeof renderYaoLines==='function'?renderYaoLines(bianL2):r.bian.u;
  document.getElementById('mh-bian-n').textContent=r.bian.n;
  document.getElementById('mh-detail').innerHTML=`
    <p><strong>體卦：</strong>${r.tiG.name}（${r.tiG.el}）｜<strong>用卦：</strong>${r.yoG.name}（${r.yoG.el}）</p>
    <p><strong>體用：</strong><span class="tag tag-gold">${r.ty.r}</span> <span class="tag ${r.ty.f.includes('吉')?'tag-green':'tag-red'}">${r.ty.f}</span></p>
    <p class="mt-sm">${r.ty.d}</p><div class="divider"></div>
    <p><strong>卦辭：</strong>${r.ben.j}</p><p><strong>解讀：</strong>${r.ben.m}</p>
    <p><strong>動爻：</strong>第 ${r.dong} 爻</p><p class="mt-sm"><strong>變卦：</strong>${r.bian.m}</p>`;
  document.getElementById('mh-result').classList.remove('hidden');
  // 梅花起卦完成 → 自動滾動到「下一步：塔羅牌」按鈕
  setTimeout(function(){ var act=document.querySelector('#step-1 .actions'); if(act) act.scrollIntoView({behavior:'smooth',block:'center'}); }, 350);
  // 起卦成功後鎖定所有起卦按鈕
  lockMhButtons();
}
function lockMhButtons(){
  document.querySelectorAll('#mhf-time .btn, #mhf-number .btn, #mhf-char .btn, #mhf-random .btn').forEach(btn=>{
    btn.disabled=true;btn.style.opacity='0.4';btn.style.cursor='not-allowed';
  });
  const wrap=document.querySelector('#step-1 .card');
  if(wrap&&!wrap.querySelector('.mh-lock-hint')){
    const hint=document.createElement('div');
    hint.className='mh-lock-hint';
    hint.style.cssText='text-align:center;margin-top:8px;font-size:.72rem;color:var(--c-gold);opacity:.7';
    hint.innerHTML='<i class="fas fa-lock" style="margin-right:4px"></i>卦象已定，不可重複起卦';
    wrap.appendChild(hint);
  }
}

/* 漢字筆畫數（簡表） */
var BIHUA_MAP={'愛':13,'情':12,'錢':16,'財':10,'工':3,'作':7,'事':8,'業':13,'健':11,'康':11,'家':10,'庭':10,'人':2,'際':19,'運':16,'勢':13,'感':13,'婚':11,'姻':9,'學':16,'習':11,'考':6,'試':13,'升':4,'職':18,'轉':18,'天':4,'地':6,'水':4,'火':4,'木':4,'金':8,'土':3,'日':4,'月':4,'年':6,'明':8,'光':6,'華':14,'國':11,'德':15,'仁':4,'義':13,'禮':18,'信':9,'智':12,'勇':9,'忠':8,'孝':7,'志':7,'剛':10,'強':12,'建':9,'文':4,'武':8,'大':3,'小':3,'上':3,'下':3,'中':4,'高':10,'遠':17,'近':11,'安':6,'危':6,'吉':6,'凶':4,'福':14,'壽':14,'喜':12,'樂':15,'和':8,'順':12,'利':7,'祥':11,'瑞':14,'道':16,'昌':8,'盛':12,'榮':14,'富':12,'貴':12,'平':5,'春':9,'夏':10,'秋':9,'冬':5,'東':8,'西':6,'南':9,'北':5,'成':7,'功':5,'心':4,'思':9,'想':13,'意':13,'恩':10,'慈':13,'善':12,'美':9,'真':10,'靜':16,'淨':12,'清':12,'雲':12,'風':9,'雨':8,'雪':11,'花':10,'草':10,'樹':16,'海':11,'山':3,'河':9,'江':7,'湖':13,'龍':16,'鳳':14,'虎':8,'鶴':21,'馬':10,'牛':4,'羊':6,'鼠':13,'兔':8,'蛇':11,'猴':12,'雞':18,'狗':9,'豬':16};
/* ═══ 康熙字典姓名學筆畫系統（部首還原版）═══
 * 核心原則：姓名學的筆畫以康熙字典為準，部首必須「還原」為原字形。
 * 例如：氵→水(4畫)、忄→心(4畫)、艹→艸(6畫)、辶→辵(7畫)
 * 阝左(阜部)→8畫、阝右(邑部)→7畫
 */

// ═══ 部首還原映射：簡化部首 → 原字形筆畫差 ═══
// 格式：{ 簡化部首實際筆畫: 還原後筆畫 } → 差值 = 還原-實際
// 但我們直接在字表裡標記康熙筆畫，所以這個映射用於 fallback
var KANGXI_RADICAL_DIFF = {
  // 部首名, 簡化筆畫, 康熙原字筆畫, 差值
  '氵': {orig:'水', diff:1},  // 3畫→4畫 +1
  '忄': {orig:'心', diff:1},  // 3畫→4畫 +1
  '扌': {orig:'手', diff:1},  // 3畫→4畫 +1
  '犭': {orig:'犬', diff:1},  // 3畫→4畫 +1
  '艹': {orig:'艸', diff:3},  // 3畫→6畫 +3（最大地雷！）
  '衤': {orig:'衣', diff:1},  // 5畫→6畫 +1
  '礻': {orig:'示', diff:1},  // 4畫→5畫 +1
  '辶': {orig:'辵', diff:4},  // 3畫→7畫 +4
  '阝左': {orig:'阜', diff:5}, // 3畫→8畫 +5
  '阝右': {orig:'邑', diff:4}, // 3畫→7畫 +4
  '王旁': {orig:'玉', diff:1}, // 4畫→5畫 +1
  '月肉': {orig:'肉', diff:2}, // 4畫→6畫 +2
};

// 數字強制筆畫（姓名學特規：一律按數值算）
var NUM_STROKES = {'一':1,'二':2,'三':3,'四':4,'五':5,'六':6,'七':7,'八':8,'九':9,'十':10,'百':6,'千':3,'萬':15};

function kangxiStroke(ch){
  // 1. 數字強制規則
  if(NUM_STROKES[ch] !== undefined) return NUM_STROKES[ch];
  // 2. 硬編碼字表（最高優先，已手動校對）
  if(STROKE_OVERRIDE[ch]) return STROKE_OVERRIDE[ch];
  // 3. BIHUA_MAP 輔助
  if(BIHUA_MAP[ch]) return BIHUA_MAP[ch];
  // 4. CJK fallback（不精確！筆劃可能錯誤，僅防 crash）
  const code=ch.charCodeAt(0);
  if(code>=0x4E00&&code<=0x9FFF){
    console.warn('[姓名學] 字「'+ch+'」不在康熙字典表中，筆劃為估計值，可能影響五格結果');
    var o=code-0x4E00,t=0x9FFF-0x4E00;
    return Math.round(4+(o/t)*16);
  }
  console.warn('[姓名學] 字「'+ch+'」無法取得筆劃');
  return 10;
}

function bihua(ch){return kangxiStroke(ch)}

function setMhMethod(m){
  ['time','number','char','random'].forEach(id=>{
    document.getElementById('mhf-'+id).classList.toggle('hidden',id!==m);
    const btn=document.getElementById('mh-m-'+id);
    if(id===m){btn.classList.remove('btn-outline');btn.classList.add('btn-tab-active')}
    else{btn.classList.add('btn-outline');btn.classList.remove('btn-tab-active')}
  });
}

/* ═══ 梅花起卦鎖定：同次占問只能起一次卦 ═══ */
function showMhLockedMsg(){
  const el=document.getElementById('mh-detail');
  if(el&&!el.querySelector('.mh-locked-msg')){
    const msg=document.createElement('div');
    msg.className='mh-locked-msg energy-locked-badge';
    msg.style.marginTop='12px';
    msg.innerHTML='<i class="fas fa-lock"></i> 卦象已定 — 同一問題不可重複起卦，心誠則靈';
    el.appendChild(msg);
  }
  const resultEl=document.getElementById('mh-result');
  if(resultEl){
    resultEl.style.transition='box-shadow .3s';
    resultEl.style.boxShadow='0 0 20px rgba(212,175,55,.4)';
    setTimeout(()=>{resultEl.style.boxShadow='';},1500);
  }
}

function calcMhTime(){
  if(S.meihua && !S._isAdmin){showMhLockedMsg();return;}
  if(S.meihua && S._isAdmin){ S.meihua=null; console.log('[管理員] 重置梅花，允許重新起卦'); }
  const now=new Date();
  const y=now.getFullYear(),mo=now.getMonth()+1,d=now.getDate();
  const h=now.getHours(),mi=now.getMinutes(),sec=now.getSeconds();

  // 正統梅花時間起卦（簡化版）
  // 先轉農曆（使用lunar-javascript庫）
  let lunarY=y, lunarM=mo, lunarD=d;
  try {
    if(typeof Lunar!=='undefined'&&Lunar.Solar){
      const solar=Lunar.Solar.fromYmd(y,mo,d);
      const lunar=solar.getLunar();
      lunarY=lunar.getYear(); lunarM=lunar.getMonth(); lunarD=lunar.getDay();
    }
  } catch(e){}

  // 年地支數（子1丑2...亥12）
  const yzhi=((lunarY-4)%12+12)%12+1;
  // 時辰（子1丑2...亥12）
  const shichen=Math.floor(((h+1)%24)/2)+1;

  // 上卦 = (年支+農曆月+農曆日) % 8
  const upNum=(yzhi+lunarM+lunarD)%8||8;
  // 下卦 = (年支+農曆月+農曆日+時辰) % 8
  const loNum=(yzhi+lunarM+lunarD+shichen)%8||8;
  // 動爻 = (年支+農曆月+農曆日+時辰) % 6
  const dongNum=(yzhi+lunarM+lunarD+shichen)%6||6;

  // 顯示起卦時間資訊
  const info=document.getElementById('mh-detail');

  showMH(calcMH(upNum,loNum,dongNum));

  // 在結果下追加起卦資訊
  if(info){
    const extra=document.createElement('div');
    extra.className='mt-sm text-xs text-dim';
    extra.innerHTML=`<p>起卦時間：${y}/${mo}/${d} ${h}:${String(mi).padStart(2,'0')} ｜ 農曆：${lunarM}月${lunarD}日 ｜ 時辰：第${shichen}辰</p>
      <p>上卦數：${upNum}(${['坤','乾','兌','離','震','巽','坎','艮'][upNum-1]||'?'}) ｜ 下卦數：${loNum}(${['坤','乾','兌','離','震','巽','坎','艮'][loNum-1]||'?'}) ｜ 動爻：${dongNum}</p>`;
    info.appendChild(extra);
  }
}
function calcMhNumber(){
  if(S.meihua && !S._isAdmin){showMhLockedMsg();return;}
  if(S.meihua && S._isAdmin){ S.meihua=null; console.log('[管理員] 重置梅花，允許重新起卦'); }
  const n1=parseInt(document.getElementById('mh-n1').value)||1;
  const n2=parseInt(document.getElementById('mh-n2').value)||1;
  const n3=parseInt(document.getElementById('mh-n3').value)||1;
  showMH(calcMH(n1,n2,Math.min(6,Math.max(1,n3))));
}
function calcMhChar(){
  if(S.meihua && !S._isAdmin){showMhLockedMsg();return;}
  const ch=document.getElementById('mh-char').value.trim();
  if(!ch){alert('請輸入漢字');return}
  const chars=[...ch];
  let un,ln,dy;
  if(chars.length===1){un=bihua(chars[0]);ln=un;dy=(un*2)%6||6}
  else if(chars.length===2){un=bihua(chars[0]);ln=bihua(chars[1]);dy=(un+ln)%6||6}
  else{un=bihua(chars[0])+bihua(chars[1]);ln=bihua(chars[chars.length-1]);dy=(un+ln)%6||6}
  showMH(calcMH(un,ln,dy));
}
function calcMhRandom(){
  if(S.meihua){showMhLockedMsg();return;}
  showMH(calcMH(Math.ceil(Math.random()*8),Math.ceil(Math.random()*8),Math.ceil(Math.random()*6)));
}

// ── Tarot deck + analysis + story + draw UI (lines 5992-6570) ──
/* =============================================================
   塔羅牌 TAROT — 22大牌 + 凱爾特十字牌陣
   ============================================================= */
var TAROT=[
  // ═══ 大阿爾克那 Major Arcana ═══
  {id:0,  suit:'major',rank:0,  num:0,  n:'愚者',    el:'風', astro:'天王星',
   kwUp:'自由·冒險·新旅程', kwRv:'魯莽·失根·逃避',
   up:'充滿無限可能，勇敢踏出第一步，新旅程即將展開。',
   rv:'魯莽行事，缺乏計畫，需要停下來想清楚再走。',
   loveUp:'新的戀情正在萌芽，充滿未知的吸引力，享受這段不設框架的相遇。',loveRv:'不願定義關係，逃避承諾，關係停在模糊曖昧而無法往前。',
   careerUp:'勇於嘗試新領域，跳槽或創業的衝動可能成真，打破框架反而打開機會。',careerRv:'衝動跳槽沒有規劃，頻繁換工作難以累積，缺乏職涯方向感。',
   wealthUp:'意外的收入管道出現，偶然的機遇帶來財富，但需把握。',wealthRv:'衝動消費，財務缺乏規劃，容易因為隨興而破財。',
   healthUp:'精力充沛，精神狀態自由輕盈，不受拘束的生活方式帶來活力。',healthRv:'忽視身體警訊，作息不規律，用隨性逃避健康管理。',
   adviceUp:'放膽去嘗試，不要被「應該怎樣」綁住，新旅程值得出發。',adviceRv:'停下來做基本功課再走，衝動不等於勇氣。',
   spiritualUp:'新的靈魂課題開始，帶著初心進入未知的修行領域，前世的包袱在這一世被放下。',spiritualRv:'逃避靈魂的功課，用「自由」當藉口拒絕成長，靈性上的停滯。'},
  {id:1,  suit:'major',rank:1,  num:1,  n:'魔術師',  el:'水星',astro:'水星',
   kwUp:'能力·意志·創造', kwRv:'欺騙·花言巧語·才能未展',
   up:'擁有成功所需的一切資源，現在就是出手的時機。',
   rv:'才能未發揮，或有欺騙自己和他人的跡象。',
   loveUp:'你有能力主動出擊，魅力和溝通力讓你在感情中佔優勢。',loveRv:'用花言巧語偽裝真心，或被對方的花言巧語迷惑。',
   careerUp:'能力全面展現，掌握所有需要的工具，是啟動重要計畫的好時機。',careerRv:'光說不練，才能沒有落地，或用技巧掩蓋不足。',
   wealthUp:'靠真本事賺到的錢，投資判斷精準，財務能力強。',wealthRv:'被詐騙或落入投資陷阱，資訊不對等導致損失。',
   healthUp:'身心協調，有辦法用意志力和知識積極管理健康。',healthRv:'覺得自己撐得住而忽視問題，需要誠實面對身體狀況。',
   adviceUp:'拿出你真正的本事，所有工具都在你手上，現在就用。',adviceRv:'先確認資訊是否正確，不要只靠表演走過場。',
   spiritualUp:'你有能力創造自己的實相，意識和意志是你最強的靈性工具。',spiritualRv:'用靈性知識操控他人，或才能未用在正途，靈性上的自欺。'},
  {id:2,  suit:'major',rank:2,  num:2,  n:'女祭司',  el:'水', astro:'月亮',
   kwUp:'直覺·秘密·等待', kwRv:'封閉·隱瞞·迴避',
   up:'傾聽直覺，靜待時機，答案在你內心深處。',
   rv:'過於封閉，忽視內心聲音，或刻意迴避要面對的事。',
   loveUp:'對方有好感但還沒說出口，需要耐心等待，不要急著要答案。',loveRv:'感情中有隱瞞，或你自己不願面對內心真實的感受。',
   careerUp:'適合觀察和研究的時期，不要急著決定，靜待更多資訊浮現。',careerRv:'職場中有人在暗中操作，資訊不透明，要小心。',
   wealthUp:'保守觀望才是明智之舉，不是出手的時機，耐心等待。',wealthRv:'財務上有隱藏的風險尚未浮現，不要輕易相信表面數字。',
   healthUp:'心理和情緒健康需要重視，傾聽身體給你的細微訊號。',healthRv:'壓抑情緒導致身心失調，逃避的問題最終還是要面對。',
   adviceUp:'相信你的直覺，保持耐心，不是所有事都需要立刻有答案。',adviceRv:'打開心房，你一直在迴避的那件事，是時候面對了。',
   spiritualUp:'直覺是你的靈性指南針，靜下來就能聽到內在的聲音，答案一直都在。',spiritualRv:'切斷了跟直覺的連結，外在噪音蓋過了內在智慧。'},
  {id:3,  suit:'major',rank:3,  num:3,  n:'皇后',    el:'土', astro:'金星',
   kwUp:'豐盛·滋養·創造力', kwRv:'放縱·依賴·失去自我',
   up:'豐收與滋養，創造力旺盛，好好享受這個成熟的時期。',
   rv:'依賴他人，過度放縱，或用付出換取被需要的感覺。',
   loveUp:'關係進入溫暖甜蜜的豐收期，可能有喜訊，感情滋養雙方。',loveRv:'在感情中失去自我，過度遷就讓你慢慢消耗掉自己。',
   careerUp:'創意能量爆發，適合藝術、行銷、設計類工作，成果豐碩。',careerRv:'怠惰享樂影響產出，工作中缺乏動力和專注。',
   wealthUp:'財務豐收期，被動收入增加，付出有回報。',wealthRv:'享受優先於儲蓄，花費超過收入，財務漸漸失衡。',
   healthUp:'身體狀態好，適合調養和滋補，女性健康議題有好轉。',healthRv:'飲食不節制，過度安逸，需注意體重和消化系統。',
   adviceUp:'好好享受成果，同時也要記得給自己補充能量，分享豐盛。',adviceRv:'重新設定界線，你不需要靠過度付出來證明自己的價值。',
   spiritualUp:'透過創造和滋養完成靈魂課題，你的存在本身就是一種療癒力。',spiritualRv:'靈性上的匱乏感，覺得自己不值得被愛，需要回到自我滋養。'},
  {id:4,  suit:'major',rank:4,  num:4,  n:'皇帝',    el:'火', astro:'牡羊座',
   kwUp:'秩序·掌控·穩定', kwRv:'獨裁·僵化·控制欲',
   up:'掌控局面，建立秩序，以紀律和決策力推動事情。',
   rv:'控制欲強，過於僵化，需要學會放手和信任。',
   loveUp:'關係中建立穩定的承諾和安全感，有保護欲和責任感。',loveRv:'控制欲過強讓對方窒息，或在感情中缺乏彈性和溫柔。',
   careerUp:'適合領導和管理角色，組織架構清晰，升遷有望。',careerRv:'管控過度，放不了手，讓團隊缺乏空間，效率反而下降。',
   wealthUp:'財務管理有方，資產穩健增值，保守但可靠的策略奏效。',wealthRv:'投資決策過於僵化，錯失新趨勢，需要適度開放思維。',
   healthUp:'自律的生活習慣帶來穩健的體質，紀律是最好的健康管理。',healthRv:'壓力長期積累，需注意心血管、肩頸和高壓症狀。',
   adviceUp:'立好規矩，嚴格執行，現在需要的是結構和決策。',adviceRv:'學會放手，不是所有事都需要你來決定，信任他人。',
   spiritualUp:'靈魂在學習建立秩序和邊界，結構是靈性成長的地基不是牢籠。',spiritualRv:'靈性上的控制慾，用規則和教條綁住自己或他人的成長。'},
  {id:5,  suit:'major',rank:5,  num:5,  n:'教皇',    el:'土', astro:'金牛座',
   kwUp:'傳統·智慧·正道', kwRv:'教條·框架·保守',
   up:'遵循正道，尋求智者指引，體制內的智慧是你的資產。',
   rv:'教條主義，不知變通，被「應該」綁住走不出去。',
   loveUp:'穩定的承諾型關係，可能與傳統、家庭或宗教背景有關。',loveRv:'道德或傳統觀念讓感情無法自由發展，框架太緊。',
   careerUp:'在大組織中發展，拜師學藝有回報，走正統路線有優勢。',careerRv:'職場文化壓抑創意，需要突破框架，別讓規矩綁死你。',
   wealthUp:'穩健保守的理財方式，按部就班累積比冒進更有效。',wealthRv:'太保守錯失機會，或被既有的財務觀念限制了發展。',
   healthUp:'傳統調養方式有效，身心靈整合的健康方法值得嘗試。',healthRv:'忽視身體警訊，或過度執著於某種健康教條。',
   adviceUp:'找一個真正有經驗的人請教，不要自己硬撐，借鑑前人智慧。',adviceRv:'走出自己的路，別讓應該綁住你，傳統不是唯一的答案。',
   spiritualUp:'跟隨內在傳承的智慧，導師會出現，或你本身就是別人的引路人。',spiritualRv:'盲從外在的靈性權威，需要找到自己的道路而非照搬別人的。'},
  {id:6,  suit:'major',rank:6,  num:6,  n:'戀人',    el:'風', astro:'雙子座',
   kwUp:'選擇·真愛·連結', kwRv:'猶豫·衝突·三角關係',
   up:'重要的選擇時刻到來，不只是感情，是整個價值觀的抉擇。',
   rv:'猶豫不決，害怕選擇就意味著失去，導致兩頭落空。',
   loveUp:'真愛降臨或關係進入更深層次的連結，重要的感情抉擇到來。',loveRv:'三角關係或在兩個對象間猶豫不決，價值觀衝突讓感情停滯。',
   careerUp:'找到與你價值觀一致的團隊或事業，職涯出現重要選擇。',careerRv:'職涯選擇讓你左右為難，或和合作夥伴理念不合。',
   wealthUp:'合夥投資前提是理念一致，重要財務決定前需要審慎評估。',wealthRv:'因為價值觀不合導致財務糾紛，合夥關係出問題。',
   healthUp:'身心找到和諧平衡，對健康生活方式做出積極的選擇。',healthRv:'內心衝突影響身體，生活習慣的取捨讓你消耗過大。',
   adviceUp:'跟著你的心走，但確認那是真愛而不是慾望或恐懼驅動的選擇。',adviceRv:'先釐清你真正要什麼，不然遲遲無法做決定只會兩邊都輸。',
   spiritualUp:'靈魂層級的選擇，這個決定會影響你整條修行路徑的方向。',spiritualRv:'在靈性道路上逃避選擇，或內在價值觀正在經歷衝突和重整。'},
  {id:7,  suit:'major',rank:7,  num:7,  n:'戰車',    el:'水', astro:'巨蟹座',
   kwUp:'意志·勝利·前進', kwRv:'失控·方向不明·強硬',
   up:'靠意志力和決心衝過難關，不是靠運氣而是靠行動力。',
   rv:'失去方向，意志力用在錯誤地方，需要重新定位目標。',
   loveUp:'主動追求有成效，感情快速推進，靠決心和行動贏得對方。',loveRv:'感情中太強勢控制，或雙方方向不一致讓關係失衡。',
   careerUp:'勢如破竹地推進工作目標，執行力強，升遷或業績突破在望。',careerRv:'工作方向不明，忙碌卻沒有成果，需要重新校準目標。',
   wealthUp:'積極理財獲利，投資判斷準確，快速推進的財務計畫有效。',wealthRv:'投資方向錯誤，急於求成導致資金流失，需要停下來重新評估。',
   healthUp:'積極的態度和運動習慣讓身體狀態變好，意志力支撐健康管理。',healthRv:'過度勞累，用意志力透支身體，身體在罷工前你要先注意。',
   adviceUp:'現在就衝，機會不等人，用你的執行力把事情完成。',adviceRv:'先停下來重新校準方向，跑得快但跑錯方向是沒用的。',
   spiritualUp:'靈魂的意志力正在推動你前進，克服內在的矛盾往更高層次走。',spiritualRv:'靈性上的強迫和急躁，用蠻力推不動的事情需要換方式。'},
  {id:8,  suit:'major',rank:8,  num:8,  n:'力量',    el:'火', astro:'獅子座',
   kwUp:'勇氣·耐心·以柔克剛', kwRv:'自我懷疑·恐懼·衝動',
   up:'真正的力量來自內在的平靜和耐心，以柔克剛才是正道。',
   rv:'內在力量不足，被恐懼和衝動控制，需要重新找到自信。',
   loveUp:'以包容和理解經營感情，以柔克剛，溫柔而堅定地靠近對方。',loveRv:'缺乏自信，在感情中過於退縮，或無法設立自己的界線。',
   careerUp:'用耐心和智慧處理棘手的職場問題，靠實力而非蠻力贏得尊重。',careerRv:'自信不足，不敢爭取應得的，或用情緒取代理性判斷。',
   wealthUp:'長期穩健投資策略比短線操作更適合，耐心等待複利效果。',wealthRv:'因恐懼而不敢做出必要的財務決策，錯失機會。',
   healthUp:'身心強韌，即使面對挑戰也有很好的恢復力，精神力量是關鍵。',healthRv:'精神力量不足，容易被壓力擊垮，需要補充心理能量。',
   adviceUp:'溫柔但堅定地堅持，不要急，你比你以為的更強大。',adviceRv:'找回你的自信，你的力量不在蠻力，在於你的沉穩和耐心。',
   spiritualUp:'用柔軟和耐心馴服內在的野獸，真正的靈性力量來自接納不是壓制。',spiritualRv:'壓抑內在的陰暗面，靈性繞道——覺得自己已經超越了但其實沒有。'},
  {id:9,  suit:'major',rank:9,  num:9,  n:'隱者',    el:'土', astro:'處女座',
   kwUp:'獨處·反省·智慧', kwRv:'孤立·逃避·封閉',
   up:'獨處反省，尋找內在智慧，答案在安靜中浮現。',
   rv:'過度孤立，逃避現實，用獨處迴避本來應該面對的問題。',
   loveUp:'需要獨處思考感情，不要急著定義關係，給自己和對方空間。',loveRv:'在感情中過度封閉，讓對方感覺被拒絕和排斥。',
   careerUp:'獨立作業效率最高，深度研究和專業精進有突破。',careerRv:'與團隊脫節，孤立自己，被邊緣化而不自知。',
   wealthUp:'保守觀望是明智的，不要受市場熱度影響，靜待時機。',wealthRv:'與市場和資訊脫節，錯過重要訊號，需要主動出來連結。',
   healthUp:'靜養修復是最好的療法，減少社交消耗，讓身心充電。',healthRv:'孤獨導致情緒低落，長期封閉影響心理健康，需要尋求連結。',
   adviceUp:'給自己安靜的時間，在獨處中找到真正的答案，然後再行動。',adviceRv:'獨處夠了，是時候帶著你學到的東西重新走入世界。',
   spiritualUp:'獨處是你現在最重要的功課，往內走才能找到你要的答案。',spiritualRv:'用隔離偽裝成修行，逃避人群不等於靈性提升。'},
  {id:10, suit:'major',rank:10, num:10, n:'命運之輪', el:'火', astro:'木星',
   kwUp:'轉機·命運·週期', kwRv:'逆風·停滯·抗拒',
   up:'命運轉折點到來，好運在轉，順勢而為把握機會。',
   rv:'逆風期，但輪子會轉，守住實力等待時機。',
   loveUp:'緣分來了，命中注定的相遇或感情轉折點到來，把握住。',loveRv:'感情遇到循環性的障礙，相同問題反覆出現，需要打破模式。',
   careerUp:'事業的重要轉折點，順勢而為就能上去，機會正在轉向你。',careerRv:'事業低谷期，但這是週期性的，守住不要擴張，等輪子轉回來。',
   wealthUp:'財運轉好，投資時機到，乘勢而上可以有好的回報。',wealthRv:'財運下滑，這段時間守住現有資產，不宜冒險擴張。',
   healthUp:'身體好轉的週期來了，堅持保養習慣，順勢而行。',healthRv:'舊疾可能復發或體能有波動，這是週期性的，耐心調養。',
   adviceUp:'這是你的時機，大膽順勢而為，不要因為猶豫錯過轉折點。',adviceRv:'低谷期低頭走，保存實力等翻盤，這段時間不要亂動。',
   spiritualUp:'業力循環的轉折點，前世種的因正在結果，順應比抗拒更有智慧。',spiritualRv:'抗拒命運的安排，同樣的課題反覆出現是因為你還沒學會。'},
  {id:11, suit:'major',rank:11, num:11, n:'正義',     el:'風', astro:'天秤座',
   kwUp:'公正·因果·平衡', kwRv:'不公·偏見·逃避責任',
   up:'公正的結果即將到來，因果報應，做對的事結果自然好。',
   rv:'不公正的狀況或者你自己在逃避應該承擔的後果。',
   loveUp:'感情需要公平對待彼此，公正的態度讓關係更穩固。',loveRv:'感情中有人在逃避責任或不公平地要求對方。',
   careerUp:'努力會得到公正的評價，職場付出有應得的回報和認可。',careerRv:'職場有不公平的待遇，需要據理力爭，否則只會越來越吃虧。',
   wealthUp:'投資回報與努力成正比，付出多少就得到多少。',wealthRv:'財務糾紛或不合理的損失，需要積極處理，不能默默承受。',
   healthUp:'找到真正的病因，對症下藥，身體問題有清楚的根源可循。',healthRv:'誤診或忽略根本原因，治標不治本，問題反覆出現。',
   adviceUp:'做對的事，堅守公正的原則，結果會反映你的選擇。',adviceRv:'面對你一直在逃避的責任和後果，拖越久代價越大。',
   spiritualUp:'因果法則正在運作，這一世經歷的每件事都有前世的根源。',spiritualRv:'業力的清算還沒完成，逃避責任只會讓課題在下一輪更重。'},
  {id:12, suit:'major',rank:12, num:12, n:'吊人',     el:'水', astro:'海王星',
   kwUp:'犧牲·換角度·等待', kwRv:'無意義犧牲·拖延·被困',
   up:'換角度看問題，暫時的犧牲帶來更大的收穫，等待有其價值。',
   rv:'不必要的犧牲，拖延決定，需要採取行動而非繼續懸吊。',
   loveUp:'為感情做出必要的犧牲，換個角度看對方的行為，有價值的等待。',loveRv:'在感情中做出不值得的犧牲，對方不知道你的付出有多少。',
   careerUp:'暫時忍耐和觀察是有回報的，等待期中積累的能量終將爆發。',careerRv:'工作毫無進展，原地空轉，需要採取行動而非繼續被動等待。',
   wealthUp:'投資需要等待，暫時看不到回報但別急著放棄，耐心是關鍵。',wealthRv:'金錢被凍住，流動性出問題，需要想辦法解套。',
   healthUp:'暫停高強度活動，充分休息是為了走更遠，這段時間好好養。',healthRv:'因為拖延就醫讓問題惡化，不能再拖了。',
   adviceUp:'放下執念，退一步反而能看清楚，這段等待是有意義的。',adviceRv:'停止無意義的等待，你需要行動，不是繼續懸在那裡。',
   spiritualUp:'靈魂選擇的犧牲，放棄眼前的是為了換取更高的理解和視角。',spiritualRv:'白白受苦沒有從中學到東西，犧牲變成了自我折磨。'},
  {id:13, suit:'major',rank:13, num:13, n:'死神',     el:'水', astro:'天蠍座',
   kwUp:'結束·轉化·新生', kwRv:'抗拒·停滯·恐懼改變',
   up:'舊的結束是新的開始，必要的終結給你空間往前走。',
   rv:'抗拒改變，死抓著過去，停滯在一個已經需要結束的地方。',
   loveUp:'舊的感情模式必須結束，才能迎來更成熟的愛，讓舊的死去。',loveRv:'走不出舊愛，或死死抓住已經不適合的關係，新的進不來。',
   careerUp:'職涯重大轉型是必要的，破釜沉舟，結束一個舊階段進入新的。',careerRv:'想轉職但害怕，一直拖著，什麼都沒有改變。',
   wealthUp:'舊的收入模式結束，新的財源開啟，止損並轉向。',wealthRv:'不願止損，繼續投入已經沒有希望的地方，損失持續擴大。',
   healthUp:'舊的不良習慣必須根除，根本性改變才能讓身體真正好轉。',healthRv:'不願改變生活方式，健康問題持續惡化，需要決心做出改變。',
   adviceUp:'勇敢斷捨離，該結束的事情不結束，新的就進不來。',adviceRv:'你在害怕什麼？那個你一直不肯結束的，早就該讓它結束了。',
   spiritualUp:'靈魂蛻變的必經之路，舊的自己必須死去新的才能誕生，這個過程很痛但不可避免。',spiritualRv:'拖著不願放手，靈魂已經準備好往前走但你的頭腦還在抓著過去。'},
  {id:14, suit:'major',rank:14, num:14, n:'節制',     el:'火', astro:'射手座',
   kwUp:'平衡·整合·中庸', kwRv:'失衡·過度·極端',
   up:'保持中庸，調和各方，平衡是前進的基礎。',
   rv:'失衡，走極端，缺乏自制，過與不及都是問題。',
   loveUp:'感情中找到平衡點，互相配合調整，關係在中庸中穩定成長。',loveRv:'付出嚴重不對等，一方長期在忍耐，失衡狀態需要正視。',
   careerUp:'工作與生活找到平衡，跨領域整合有好成果，穩定推進中。',careerRv:'工作和生活嚴重失衡，或什麼都想要結果樣樣都沒做好。',
   wealthUp:'收支平衡，理性理財，不極端不冒進，穩健積累是王道。',wealthRv:'花得比賺的多，或為了賺錢犧牲了太多其他重要的事。',
   healthUp:'身心靈達到一個平衡的狀態，適度的作息帶來穩定的健康。',healthRv:'作息嚴重失調，生活中某個方面過度而另一個方面嚴重缺乏。',
   adviceUp:'凡事求中庸，找到那個平衡點，過猶不及都要避免。',adviceRv:'先穩住最失衡的那一塊，才有辦法往前推進。',
   spiritualUp:'靈性上的平衡和調和，不同面向的自己正在整合成一個完整的存在。',spiritualRv:'靈性上的極端——要麼全然出世要麼完全入世，需要找到中間的路。'},
  {id:15, suit:'major',rank:15, num:15, n:'惡魔',     el:'土', astro:'摩羯座',
   kwUp:'執念·物欲·面對陰影', kwRv:'解脫·突破枷鎖·覺醒',
   up:'面對你的陰暗面——慾望、執念、依賴，承認才是解脫的第一步。',
   rv:'掙脫束縛，重獲自由，不再被某種執念或依賴控制。',
   loveUp:'關係中有強烈的吸引力但伴隨著控制或依賴，需要分清愛和執著。',loveRv:'看清不健康的關係模式，開始從依賴或控制中解脫。',
   careerUp:'為了職涯目標而做出某種妥協，但要清楚那條底線在哪裡。',careerRv:'從有毒的職場環境或不健康的工作關係中解脫出來。',
   wealthUp:'被金錢或物質慾望牽著走，要小心誘人的高風險機會。',wealthRv:'不再被金錢和物質慾望控制，重新定義真正的豐盛。',
   healthUp:'上癮行為（手機、飲酒、過勞）正在消耗健康，需要正視。',healthRv:'成功戒斷或走出不健康的行為循環，身心開始真正恢復。',
   adviceUp:'承認你被什麼綁住了，誠實面對才是解脫的開始。',adviceRv:'你已經知道該離開了，別讓恐懼把你拉回去，走就對了。',
   spiritualUp:'面對和承認自己的慾望和陰暗面是靈性成長的關鍵一步。',spiritualRv:'開始掙脫長期綁住你的模式，覺醒的第一步是看見自己的鎖鏈。'},
  {id:16, suit:'major',rank:16, num:16, n:'塔',       el:'火', astro:'火星',
   kwUp:'突破·崩塌·清場', kwRv:'危機延後·假象·積累',
   up:'突然改變，舊結構崩塌，雖然劇烈但這是清場重建的機會。',
   rv:'危機被延後，假象還在維持，但問題沒有消失，遲早爆發。',
   loveUp:'感情中的謊言或假象被戳破，雖然痛苦，但這是必要的清場。',loveRv:'勉強維持的關係正在搖搖欲墜，問題遲早還是要面對。',
   careerUp:'組織重整或被裁員，雖然震驚但也是重新開始的機會。',careerRv:'工作環境中的問題越積越嚴重，危機被延後但沒有消失。',
   wealthUp:'重大財務衝擊，但觸底後可以重建，先止血再重來。',wealthRv:'財務危機被暫時壓住，根本問題沒解決，遲早還是會爆。',
   healthUp:'突發的健康問題需要立即正視和處理，不能再拖了。',healthRv:'身體已經在發出強烈警告，你還在忽視，不能再等了。',
   adviceUp:'接受這個崩塌，它是在幫你清場，舊的去了新的才來得及。',adviceRv:'那棟搖搖欲墜的塔，與其等它倒，不如你自己先主動拆了它。',
   spiritualUp:'靈魂的覺醒衝擊，你以為牢固的信念正在被打碎，破碎之後才能重建真實的自己。',spiritualRv:'崩塌還在進行中但你已經開始看見廢墟下面的光。'},
  {id:17, suit:'major',rank:17, num:17, n:'星星',     el:'風', astro:'水瓶座',
   kwUp:'希望·療癒·靈感', kwRv:'失望·失去信心·迷茫',
   up:'暴風雨後的希望之光，療癒正在發生，方向是對的。',
   rv:'短暫失去信心，但希望沒有消失，只是需要等一等。',
   loveUp:'感情中重新燃起希望，心靈層面的連結加深，美好的可能性在浮現。',loveRv:'對感情失去信心，希望破滅，但這只是暫時的低谷。',
   careerUp:'新的職涯方向浮現，靈感帶來機會，方向感回來了。',careerRv:'職涯迷茫，找不到方向，需要耐心等待靈感的到來。',
   wealthUp:'長期投資開始看到回報，財務狀況在漸漸好轉的軌道上。',wealthRv:'財務希望暫時落空，需要重新規劃，但不要放棄。',
   healthUp:'身心正在療癒中，一點一點好轉，這段時間的保養很重要。',healthRv:'療癒效果比預期慢，但不要放棄，方向是對的。',
   adviceUp:'保持希望，你走的方向是對的，繼續走下去就會看到光。',adviceRv:'允許自己在低潮中休息，然後重新找到那顆屬於你的星。',
   spiritualUp:'療癒正在發生，你被宇宙引導著，保持信心，黑暗之後的光是真實的。',spiritualRv:'失去了跟宇宙的連結感，需要重新找到你的北極星。'},
  {id:18, suit:'major',rank:18, num:18, n:'月亮',     el:'水', astro:'雙魚座',
   kwUp:'直覺·恐懼·迷霧', kwRv:'真相顯現·迷霧散去·清醒',
   up:'迷霧中前行，恐懼和不確定感很強，直覺是你唯一的嚮導。',
   rv:'迷霧散去，真相大白，現在可以看得更清楚做出判斷。',
   loveUp:'感情中有隱瞞或不確定性，需要勇氣看清楚，別讓恐懼主導判斷。',loveRv:'感情中的迷霧開始消散，真實狀況即將浮現。',
   careerUp:'職場中有潛規則或隱藏的變數，需要提高警覺，別被表面欺騙。',careerRv:'職場的真實狀況終於清楚，可以做出更準確的判斷了。',
   wealthUp:'財務上有隱藏的風險，不要被表面數字迷惑，要深入查清楚。',wealthRv:'投資的真實狀況開始清晰，可以做出更理性的決策了。',
   healthUp:'心理健康和情緒需要特別關注，焦慮和失眠是身體在發出警訊。',healthRv:'心理壓力開始得到釋放，迷霧散去讓身心狀態好轉。',
   adviceUp:'相信你的直覺，但不要讓恐懼控制決策，在不確定中保持清醒。',adviceRv:'真相已經在眼前了，接受它，不管是好是壞都比待在迷霧中好。',
   spiritualUp:'潛意識的恐懼是你現在最大的靈性功課，穿越幻覺才能看到真相。',spiritualRv:'幻覺正在消散，你開始分得清哪些恐懼是真的哪些是投射。'},
  {id:19, suit:'major',rank:19, num:19, n:'太陽',     el:'火', astro:'太陽',
   kwUp:'喜悅·成功·光明', kwRv:'短暫陰霾·信心稍弱·延遲',
   up:'一切光明正大，喜悅成功，這是最好的時期，盡情享受。',
   rv:'短暫的陰霾，但光明還在，這只是暫時的，很快就會好。',
   loveUp:'感情光明正大，甜蜜幸福，一切都在最好的狀態，享受這段關係。',loveRv:'感情有小陰霾，短暫的不愉快或溝通問題，但根本是好的。',
   careerUp:'事業巔峰期，被看見被認可，成果昭然，值得驕傲的時刻。',careerRv:'成功稍有延遲，但方向和努力都是對的，不要因此氣餒。',
   wealthUp:'財運亨通，投資獲利，錢財方面一切光明，充分享受豐收。',wealthRv:'財運稍有延遲，但方向是對的，不要因為暫時的挫折放棄。',
   healthUp:'身體狀況極佳，精力旺盛，是最好的身心狀態。',healthRv:'需要多曬太陽多運動，精神上需要一點刺激和陽光。',
   adviceUp:'放心去做，現在是你的主場，盡情發揮你的光芒。',adviceRv:'暫時的陰霾不代表失敗，保持信心，太陽還是在的。',
   spiritualUp:'靈魂的喜悅和真實自我正在閃耀，你活在對的路上。',spiritualRv:'內在的光被遮蔽了，需要回到最單純的快樂重新連結。'},
  {id:20, suit:'major',rank:20, num:20, n:'審判',     el:'火', astro:'冥王星',
   kwUp:'覺醒·重生·使命', kwRv:'拒絕成長·逃避召喚·停滯',
   up:'靈魂覺醒，重新評估一切，這是人生2.0版本啟動的時刻。',
   rv:'拒絕成長，逃避靈魂的召喚，錯過蛻變的機會。',
   loveUp:'感情進入更成熟的階段，靈魂層面的真正連結，關係升華。',loveRv:'不願在感情中成長，讓關係停在一個不再健康的舊模式裡。',
   careerUp:'職涯重新定位，找到真正的使命，是重大轉型的好時機。',careerRv:'不敢真正轉型，錯過職涯升級的機會，被舊有模式困住。',
   wealthUp:'財務觀念徹底升級，找到更符合你真正價值觀的理財方式。',wealthRv:'舊的理財方式需要改變，但你不肯，繼續用無效的方式運作。',
   healthUp:'找到身體問題的根本解方，舊的不良習慣真正被根除。',healthRv:'不願改變根本的生活方式，健康問題反覆出現沒有真正解決。',
   adviceUp:'聽從內心深處真正的呼喚，這個蛻變是必要的，勇敢去做。',adviceRv:'你知道需要改變，再不行動窗口就要關了，現在就開始。',
   spiritualUp:'靈魂的召喚正在響起，你被要求做出重大覺醒的決定，這不是選擇題是命題。',spiritualRv:'聽到了召喚但拒絕回應，靈魂在等你準備好。'},
  {id:21, suit:'major',rank:21, num:21, n:'世界',     el:'土', astro:'土星',
   kwUp:'圓滿·完成·整合', kwRv:'未竟·完美主義·差一步',
   up:'達成目標，圓滿完成，一個完整的循環結束，好好慶祝。',
   rv:'還差最後一步，或完美主義讓你無法真正收尾和前進。',
   loveUp:'感情走到圓滿的階段，或準備好進入更深的承諾，完整而美好。',loveRv:'感情差一步到位，最後那塊拼圖還沒找到，需要最後的努力。',
   careerUp:'事業目標達成，階段性的重大成功，值得好好慶祝。',careerRv:'工作成果總差一點完美，或完美主義阻礙你真正完成和交付。',
   wealthUp:'財務目標達成，豐收期，一個財務周期完美地畫下句點。',wealthRv:'差一步達成財務目標，需要最後的堅持和行動。',
   healthUp:'身心俱佳，達到最好的狀態，這是完整健康的象徵。',healthRv:'治療還需要一段時間才能完全痊癒，不要急著認為已經好了。',
   adviceUp:'好好慶祝這個圓滿，然後準備好迎接下一個旅程的開始。',adviceRv:'找出那最後一塊拼圖，補上它，不要讓完美主義阻礙你收尾。',
   spiritualUp:'這一輪的靈魂課題圓滿完成，你準備好進入下一個層次了。',spiritualRv:'差最後一步就能完成這個靈性週期，別在終點前放棄。'},
  // ═══ 小阿爾克那 — 權杖 Wands ═══
  {id:22, suit:'wand', rank:'ace',    num:1,  n:'權杖王牌', el:'火', astro:'火象星座',
   kwUp:'啟動·熱情·創造力', kwRv:'阻滯·受壓·起點受阻',
   up:'新計畫啟動，創造力迸發，充滿行動的能量。',
   rv:'延遲，猶豫不決，起點能量受阻。',
   loveUp:'全新的愛情火花，強烈的吸引力，充滿激情的開始。',loveRv:'激情沒有燒起來，感情啟動受阻，時機還未成熟。',
   careerUp:'全新的事業機會，創業或新專案的啟動，衝勁十足。',careerRv:'計畫一直開始不了，能量受阻，需要找到突破點。',
   wealthUp:'新的財務機會出現，積極的開始帶來好的財務能量。',wealthRv:'財務機會被錯失或延誤，缺乏行動力把握機會。',
   healthUp:'精力充沛，活力重啟，是開始新運動習慣的好時機。',healthRv:'精力被壓抑，啟動困難，需要重新點燃動力。',
   adviceUp:'現在就啟動，機會就在這裡，不要讓它溜走。',adviceRv:'找到真正的動力來源，沒有內在的火就點不起來。'},
  {id:23, suit:'wand', rank:'2',      num:2,  n:'權杖二',   el:'火', astro:'火象星座',
   kwUp:'規劃·遠見·等待時機', kwRv:'恐懼·原地踏步·缺乏遠見',
   up:'計畫中，等待時機，視野開闊準備擴展。',
   rv:'恐懼改變，缺乏遠見，原地踏步。',
   loveUp:'感情在規劃中，對未來有期待，但還在等待合適的時機。',loveRv:'對感情的未來感到恐懼，不敢往前走。',
   careerUp:'事業計畫進行中，正在評估機會，視野開闊。',careerRv:'原地踏步，不敢邁出擴展的步伐。',
   wealthUp:'財務計畫中，在等待最好的投資時機。',wealthRv:'因恐懼而無法做出財務決定。',
   healthUp:'開始規劃更好的健康生活方式，方向清楚。',healthRv:'計畫了很多但沒有執行，只停留在想像。',
   adviceUp:'計畫已經夠了，評估清楚就要踏出那一步。',adviceRv:'你的恐懼比實際的風險大，先動再說。'},
  {id:24, suit:'wand', rank:'3',      num:3,  n:'權杖三',   el:'火', astro:'火象星座',
   kwUp:'拓展·合作·視野', kwRv:'受阻·根基不穩·急進',
   up:'拓展視野，合作順利，計畫往外推進中。',
   rv:'缺乏遠見，計畫受阻，拓展不如預期。',
   loveUp:'感情進入擴展期，關係視野開闊，有更多可能性。',loveRv:'感情遠距或分歧，計畫無法順利推進。',
   careerUp:'事業拓展順利，合作機會到來，正在把計畫往外推。',careerRv:'事業擴展遇阻，合作計畫出問題。',
   wealthUp:'財務擴展，多元化投資時機，視野打開新機會。',wealthRv:'財務計畫受阻，擴展太急，根基不穩。',
   healthUp:'健康管理方法多元化，嘗試新的養生方式有效果。',healthRv:'養生計畫沒有堅持，缺乏遠見導致反彈。',
   adviceUp:'把已有的計畫往外擴展，合作和眼光是關鍵。',adviceRv:'放慢腳步，把根基穩固再往外擴，欲速不達。'},
  {id:25, suit:'wand', rank:'4',      num:4,  n:'權杖四',   el:'火', astro:'火象星座',
   kwUp:'慶祝·穩定·歸屬感', kwRv:'不安定·缺乏基礎·動盪',
   up:'慶祝成就，和諧穩定，達到一個重要的休息點。',
   rv:'不安定，缺乏歸屬感，基礎搖晃。',
   loveUp:'感情達到穩定和慶祝的階段，可能有里程碑（如求婚或同居）。',loveRv:'感情穩定性出問題，缺乏歸屬感或家庭基礎不穩。',
   careerUp:'事業有重要里程碑，團隊合作達成成果，值得慶祝。',careerRv:'職場穩定性受到挑戰，工作環境不安定。',
   wealthUp:'財務穩定，有值得慶祝的財務里程碑達成。',wealthRv:'財務基礎不穩，穩定性受到威脅。',
   healthUp:'健康狀況穩定，達到一個好的平衡，值得維持。',healthRv:'健康平衡被打破，需要重建穩定的生活基礎。',
   adviceUp:'好好慶祝這個穩定，同時也繼續鞏固它。',adviceRv:'先建立穩定的基礎，再往外擴展，根基比速度重要。'},
  {id:26, suit:'wand', rank:'5',      num:5,  n:'權杖五',   el:'火', astro:'火象星座',
   kwUp:'競爭·衝突·磨練', kwRv:'逃避·內耗·衝突壓抑',
   up:'競爭激烈，需要堅持立場，面對挑戰不退縮。',
   rv:'逃避衝突，內耗，問題沒有被直接處理。',
   loveUp:'感情中有競爭或爭吵，需要堅持自己的立場但也要學習溝通。',loveRv:'逃避感情中的衝突，內耗嚴重，問題沒有被解決。',
   careerUp:'職場競爭激烈，需要用實力站穩立場，不要退縮。',careerRv:'逃避職場競爭，用消極態度應對，反而讓問題更嚴重。',
   wealthUp:'財務上有競爭壓力，需要積極應對，守住自己的立場。',wealthRv:'財務糾紛內耗，逃避問題讓損失持續擴大。',
   healthUp:'身體在對抗某種挑戰，需要積極面對而非逃避。',healthRv:'逃避健康問題，內耗讓身體更難恢復。',
   adviceUp:'站穩你的立場，競爭和摩擦是成長的一部分。',adviceRv:'面對那個你一直在逃避的衝突，逃只是讓它越積越大。'},
  {id:27, suit:'wand', rank:'6',      num:6,  n:'權杖六',   el:'火', astro:'火象星座',
   kwUp:'勝利·認可·成功', kwRv:'自負·缺乏認可·傲慢',
   up:'勝利與認可，公開成功，努力得到應有的回報。',
   rv:'自負，缺乏認可，努力沒有被看見或珍惜。',
   loveUp:'感情中獲得公開的認可，關係走向更明確和光明正大的階段。',loveRv:'感情缺乏認可或在關係中感到不被重視。',
   careerUp:'職場的努力獲得公開認可，升遷或獎勵到來，勝利時刻。',careerRv:'努力沒有被認可，或自負讓你失去應有的成果。',
   wealthUp:'財務上有明顯的勝利和認可，投資獲利被印證。',wealthRv:'財務成果缺乏認可，或傲慢導致財務判斷失誤。',
   healthUp:'健康努力得到回報，顯著的好轉讓你信心大增。',healthRv:'健康改善缺乏持續，一點成果就鬆懈導致退步。',
   adviceUp:'享受這個應得的認可，同時保持謙遜繼續前進。',adviceRv:'放下需要被認可的執著，做該做的事，結果自然來。'},
  {id:28, suit:'wand', rank:'7',      num:7,  n:'權杖七',   el:'火', astro:'火象星座',
   kwUp:'堅守·抵禦·立場', kwRv:'壓力·退縮·力不從心',
   up:'堅守立場，面對挑戰，用勇氣和意志力守住陣地。',
   rv:'力不從心，被壓倒，需要重新評估是否值得繼續堅持。',
   loveUp:'在感情中守住自己的立場，不被外界壓力左右，堅定你的選擇。',loveRv:'在感情壓力下節節退縮，被外界影響而失去立場。',
   careerUp:'在職場壓力下仍然堅守陣地，捍衛你的工作成果。',careerRv:'被職場壓力壓倒，力不從心，考慮是否需要重新評估。',
   wealthUp:'在財務壓力下堅守原則，不為外界雜音改變既定策略。',wealthRv:'財務決策被外界壓力左右，失去立場。',
   healthUp:'在健康挑戰中持續堅持，守住你的健康管理原則。',healthRv:'健康管理的堅持被外界因素干擾，難以維持。',
   adviceUp:'守住你的立場，這場堅持是值得的，不要被外界的雜音動搖。',adviceRv:'評估一下，這個陣地真的值得拼死堅守嗎？有時候策略性撤退更聰明。'},
  {id:29, suit:'wand', rank:'8',      num:8,  n:'權杖八',   el:'火', astro:'火象星座',
   kwUp:'快速·訊息·加速', kwRv:'延遲·急躁·阻礙',
   up:'快速發展，消息到來，事情加速推進的好時機。',
   rv:'延遲，急躁反而造成更多問題，需要耐心。',
   loveUp:'感情快速推進，訊息來往密集，事情加速發展。',loveRv:'感情訊息傳遞受阻，等待中出現延遲和誤解。',
   careerUp:'工作快速推進，事情加速，消息和機會快速到來。',careerRv:'計畫延遲，急躁反而拖慢進度，需要耐心。',
   wealthUp:'財務快速流動，交易或投資進展迅速。',wealthRv:'財務決策過於急躁，衝動行事造成損失。',
   healthUp:'身體恢復快速，積極處理健康問題有效果。',healthRv:'健康管理過度急躁，欲速則不達。',
   adviceUp:'事情在加速，跟上節奏，這是快速行動的時機。',adviceRv:'慢下來，急躁是這段時間最大的敵人，穩步才能到達目的地。'},
  {id:30, suit:'wand', rank:'9',      num:9,  n:'權杖九',   el:'火', astro:'火象星座',
   kwUp:'堅韌·防衛·疲憊中堅持', kwRv:'固執·耗盡·疲憊',
   up:'堅持到底，即使疲憊也守住最後防線，快到頭了。',
   rv:'疲憊加固執，需要找到一個出口，而不是繼續硬撐。',
   loveUp:'感情中雖然疲憊仍然堅持，守住最後一道防線，堅韌可貴。',loveRv:'感情上疲憊到固執，不願接受任何改變或妥協。',
   careerUp:'事業上處於最後的堅持階段，堅持住就能看到突破。',careerRv:'工作上過於固執，疲憊的固執讓你錯過了更好的方向。',
   wealthUp:'財務上持續守住，在艱難中堅持理性判斷。',wealthRv:'固執堅持一個已經不合適的財務策略，需要調整。',
   healthUp:'身體已經在挑戰極限，但仍在堅持，注意不要耗盡。',healthRv:'疲憊的身體需要真正的休息，固執地繼續只會更糟。',
   adviceUp:'再堅持一下，你快到終點了，這個堅持是值得的。',adviceRv:'固執不是堅強，學會彈性調整，疲憊的身心需要真正的休息。'},
  {id:31, suit:'wand', rank:'10',     num:10, n:'權杖十',   el:'火', astro:'火象星座',
   kwUp:'重擔·責任·堅持', kwRv:'超載·委派·放下',
   up:'責任沉重，堅持前行，快到了，不要在終點前放棄。',
   rv:'放下重擔，學會委派，不是所有事都非你扛不可。',
   loveUp:'感情中承擔了太多，沉重的責任壓著這段關係，需要重新分配。',loveRv:'感情中的重擔壓得你喘不過氣，需要說出來並請求幫助。',
   careerUp:'工作責任沉重，承擔了很多，但仍在前進，終點不遠。',careerRv:'工作重擔壓垮，需要放下一些、委派他人，否則會崩潰。',
   wealthUp:'財務壓力很大，但你在負重前行，堅持會看到出口。',wealthRv:'財務重擔已經超過承受範圍，需要尋求幫助或減輕負擔。',
   healthUp:'健康方面承受了很大的壓力，需要有意識地減輕負荷。',healthRv:'身體已經在超載狀態，必須立刻放下一些，照顧自己。',
   adviceUp:'你已經快到了，再撐一下，但也要學會在適當時機交棒。',adviceRv:'你不需要一個人扛所有東西，開口請求幫助不是軟弱。'},
  {id:32, suit:'wand', rank:'page',   num:11, n:'權杖侍者', el:'火', astro:'火象星座',
   kwUp:'好奇·探索·新消息', kwRv:'不切實際·衝動·缺乏規劃',
   up:'好消息，新冒險，充滿活力的新開始。',
   rv:'不切實際的計畫，需要在執行前做更多準備。',
   loveUp:'感情中有令人興奮的新消息，也許是告白或新的追求者。',loveRv:'感情消息讓你過於興奮，計畫不切實際。',
   careerUp:'職涯上有令人期待的新機會，好消息要來了。',careerRv:'對職涯計畫過於理想化，缺乏實際的規劃和基礎。',
   wealthUp:'財務上有新的機會訊號到來，值得關注。',wealthRv:'財務計畫不切實際，需要更多實際評估。',
   healthUp:'有新的健康方法值得嘗試，充滿探索的能量。',healthRv:'健康計畫太理想化，執行層面需要更務實。',
   adviceUp:'把握這股新鮮的能量，但也要有基本的計畫。',adviceRv:'熱情很好，但先把計畫落地再出發，衝動行事會摔跤。'},
  {id:33, suit:'wand', rank:'knight', num:12, n:'權杖騎士', el:'火', astro:'火象星座',
   kwUp:'行動·熱情·衝刺', kwRv:'衝動·魯莽·無計畫',
   up:'行動力強，追求熱情，全力以赴地推進。',
   rv:'衝動，魯莽，缺乏深思熟慮的計畫。',
   loveUp:'感情中充滿激情和衝勁，熱烈地追求，行動力強。',loveRv:'感情中過於衝動，沒有考慮後果的魯莽行動讓對方不安。',
   careerUp:'職場上行動力強，熱情地推進計畫，全力衝刺。',careerRv:'衝動魯莽的職場決策，缺乏深思熟慮造成問題。',
   wealthUp:'財務上積極行動，快速出手把握機會。',wealthRv:'財務上衝動行事，沒有充分評估就出手造成損失。',
   healthUp:'積極採取行動改善健康，充滿能量和動力。',healthRv:'過於衝動的運動或生活改變，沒有循序漸進讓身體受傷。',
   adviceUp:'你的行動力是最大的資產，現在就衝。',adviceRv:'放慢一秒，想清楚再動，衝動是你最大的敵人。'},
  {id:34, suit:'wand', rank:'queen',  num:13, n:'權杖皇后', el:'火', astro:'火象星座',
   kwUp:'自信·魅力·領導', kwRv:'嫉妒·自我中心·消耗',
   up:'自信、魅力，激勵他人，充滿正面能量。',
   rv:'嫉妒，自我中心，能量用錯方向。',
   loveUp:'感情中充滿自信和魅力，你的熱情和活力吸引對方。',loveRv:'感情中嫉妒心重或以自我為中心，讓對方感到窒息。',
   careerUp:'職場上散發自信和魅力，激勵團隊，成果顯著。',careerRv:'職場嫉妒或自我中心讓你失去盟友。',
   wealthUp:'財務上充滿自信，吸引財富的能量很強。',wealthRv:'財務上因嫉妒或自私而做出糟糕的決策。',
   healthUp:'充滿活力和能量，自信的態度帶來好的身心狀態。',healthRv:'自我消耗過大，需要補充能量，不要燃燒過快。',
   adviceUp:'你的魅力和熱情是最大的禮物，大方地分享給周圍的人。',adviceRv:'把注意力從別人身上移回來，專注在自己的成長。'},
  {id:35, suit:'wand', rank:'king',   num:14, n:'權杖國王', el:'火', astro:'火象星座',
   kwUp:'遠見·領導力·激勵', kwRv:'傲慢·嚴苛·獨斷',
   up:'領導力強，願景宏大，成熟的行動型領導者。',
   rv:'傲慢，嚴苛，需要學會柔軟和傾聽。',
   loveUp:'感情中是成熟有魅力的領導者，給對方安全感和方向感。',loveRv:'感情中傲慢或嚴苛，讓對方感到壓力而非支持。',
   careerUp:'職場上是有遠見的領導者，激勵團隊達成重大成果。',careerRv:'管理風格傲慢或嚴苛，讓團隊士氣低落。',
   wealthUp:'財務上有清晰的遠見和計畫，是成功的資金領導者。',wealthRv:'財務上過度控制或傲慢，錯失合作機會。',
   healthUp:'以強大的意志力管理健康，是自律的健康領導者。',healthRv:'用意志力壓制身體而非傾聽，需要更多彈性。',
   adviceUp:'你的領導力和遠見是珍貴的，用它來服務和激勵而非控制。',adviceRv:'柔化你的管理方式，傾聽比指揮更有力量。'},
  // ═══ 小阿爾克那 — 聖杯 Cups ═══
  {id:36, suit:'cup',  rank:'ace',    num:1,  n:'聖杯王牌', el:'水', astro:'水象星座',
   kwUp:'新感情·直覺·情感充沛', kwRv:'封閉·壓抑情感·錯失連結',
   up:'新感情開始，情感充沛，深度連結的可能性打開。',
   rv:'感情封閉，錯失情感機會，心門未開。',
   loveUp:'新感情的萌芽，純粹的愛，充滿深度的情感連結即將開始。',loveRv:'感情機會被錯失，情感封閉讓你無法接受愛的降臨。',
   careerUp:'工作中充滿熱情，對職業的深層召喚，找到有意義的工作。',careerRv:'工作缺乏熱情，不知道自己真正想要什麼。',
   wealthUp:'財務上有直覺性的好機會，相信感受去把握。',wealthRv:'財務上的直覺感受被壓制，錯過好的機會。',
   healthUp:'情緒和心理健康開啟新頁，情感的療癒開始。',healthRv:'情感封閉影響健康，需要打開心扉讓療癒發生。',
   adviceUp:'打開你的心，讓愛和情感的可能性流進來。',adviceRv:'你的防衛心阻礙了你真正渴望的連結，試著打開一點。'},
  {id:37, suit:'cup',  rank:'2',      num:2,  n:'聖杯二',   el:'水', astro:'水象星座',
   kwUp:'連結·吸引·對等', kwRv:'失衡·溝通不良·裂縫',
   up:'伴侶關係，相互吸引，對等的連結，感情和諧。',
   rv:'失衡，溝通不良，連結出現問題。',
   loveUp:'兩人之間的深度連結和相互吸引，感情對等，關係在最好的地方。',loveRv:'感情失衡，溝通不良，雙方的連結出現裂縫。',
   careerUp:'重要的合作關係建立，共同目標讓雙方攜手前進。',careerRv:'合作關係出現裂縫，溝通問題影響合作效率。',
   wealthUp:'財務合作關係良好，共同投資或業務夥伴關係穩固。',wealthRv:'財務合作出現問題，夥伴之間缺乏信任或溝通。',
   healthUp:'身心協調，情感和理性找到平衡，整體狀態好。',healthRv:'身心不協調，情緒問題影響身體健康。',
   adviceUp:'珍惜這個對等的連結，給予對方你渴望得到的那種對待。',adviceRv:'溝通才能修復裂縫，說出你的感受，聽對方的聲音。'},
  {id:38, suit:'cup',  rank:'3',      num:3,  n:'聖杯三',   el:'水', astro:'水象星座',
   kwUp:'友誼·慶祝·社群', kwRv:'過度放縱·八卦·小圈圈',
   up:'歡慶友誼，社交活動，集體喜悅的能量。',
   rv:'過度放縱，孤立，或社交關係帶來負面影響。',
   loveUp:'愛情中有朋友的支持，社交帶來感情機會。',loveRv:'過度放縱社交生活影響感情，或社交圈帶來感情摩擦。',
   careerUp:'團隊合作氛圍好，慶祝共同成就，職場關係融洽。',careerRv:'職場八卦或小圈圈影響工作氛圍。',
   wealthUp:'財務上有好友或社群的支持，集體帶來機會。',wealthRv:'社交消費過度，或因聚會而有非理性的財務支出。',
   healthUp:'社交和友誼對健康有正面影響，愉快的社交活動。',healthRv:'社交過度消耗能量，放縱帶來健康問題。',
   adviceUp:'享受這段集體喜悅，友誼和社群是珍貴的力量來源。',adviceRv:'控制社交的量，不要讓聚會和放縱消耗掉你的核心能量。'},
  {id:39, suit:'cup',  rank:'4',      num:4,  n:'聖杯四',   el:'水', astro:'水象星座',
   kwUp:'不滿·機會在眼前·反思', kwRv:'重新審視·看見可能性·覺察',
   up:'對現狀不滿，錯失機會，需要打開眼睛看清楚。',
   rv:'重新審視，發現之前沒看見的新可能性。',
   loveUp:'對現有的感情不滿足，可能有另一個機會出現但你沒注意到。',loveRv:'重新審視感情，看見了之前忽略的可能性。',
   careerUp:'對工作不滿但沒有行動，有機會在眼前卻沒有看見。',careerRv:'從不滿中找到動力，重新發現工作中被忽視的機會。',
   wealthUp:'對財務現狀不滿，卻沒有看見眼前的機會。',wealthRv:'重新評估財務，發現之前沒注意到的機會。',
   healthUp:'對健康狀態不滿足但缺乏行動，陷入消極的等待。',healthRv:'從不滿中找到改善的動力，採取行動。',
   adviceUp:'那個你一直覺得不夠好的，也許其實就夠了，停止抱怨開始感恩。',adviceRv:'你已經準備好重新看待一切了，新的可能性就在你面前。'},
  {id:40, suit:'cup',  rank:'5',      num:5,  n:'聖杯五',   el:'水', astro:'水象星座',
   kwUp:'失落·悲傷·仍有剩餘', kwRv:'走出悲傷·接受·繼續',
   up:'失落與悲傷，但仍有希望，不要只聚焦在失去的那部分。',
   rv:'走出悲傷，接受現實，帶著傷口往前走。',
   loveUp:'感情中有失去和悲傷，但還有一些值得珍惜的留下，不要只看失去的。',loveRv:'從感情的失落中走出來，接受現實，找到前進的力量。',
   careerUp:'職場失望或失去，悲傷是正常的，但仍有資源可用。',careerRv:'走出職場的失落，以新的眼光重新出發。',
   wealthUp:'財務損失帶來悲傷，但還有剩餘的資源，先穩住情緒再規劃。',wealthRv:'從財務損失的悲傷中走出來，找到重建的力量。',
   healthUp:'在某種失去或損失中感到悲傷，這是正常的情緒需要被允許。',healthRv:'情感的悲傷開始療癒，慢慢重新站起來。',
   adviceUp:'讓自己悲傷，但不要忘記看那兩個還站著的杯子，生命還在。',adviceRv:'悲傷已經夠了，現在是時候帶著這個經驗繼續走了。'},
  {id:41, suit:'cup',  rank:'6',      num:6,  n:'聖杯六',   el:'水', astro:'水象星座',
   kwUp:'懷舊·童年·溫暖記憶', kwRv:'活在過去·無法前進·留戀',
   up:'懷舊，童年回憶，過去的溫暖指引未來的方向。',
   rv:'活在過去，無法前進，被舊日記憶困住。',
   loveUp:'舊愛重現或懷念過去的美好，感情中有溫柔的回憶感。',loveRv:'活在過去的感情記憶中，無法真正向前走。',
   careerUp:'舊的職涯經驗有新的應用，或熟悉的領域帶來新機會。',careerRv:'困在過去的工作模式或舊有環境，無法創新前進。',
   wealthUp:'舊有的財務方法再次有效，或過去的人脈帶來機會。',wealthRv:'固守舊有財務觀念，無法適應新的財務環境。',
   healthUp:'傳統的療癒方法有效，或找回曾經讓你健康的生活習慣。',healthRv:'沉溺在過去的健康狀態比較，無法面對當下現實。',
   adviceUp:'讓過去的溫暖滋養你，但要帶著它往前走，不是停在那裡。',adviceRv:'過去是美好的，但你的生命在現在，該往前了。'},
  {id:42, suit:'cup',  rank:'7',      num:7,  n:'聖杯七',   el:'水', astro:'水象星座',
   kwUp:'幻想·選擇·分辨', kwRv:'落地·做決定·面對現實',
   up:'太多選擇，需要分辨幻象，找到真正可行的那條路。',
   rv:'做出決定，面對現實，幻象已經夠了。',
   loveUp:'感情中有太多幻想和選擇，需要落地分辨什麼是真實可行的。',loveRv:'從感情的幻想中清醒，做出真實的選擇。',
   careerUp:'職涯有太多可能性讓你難以選擇，需要找到最重要的那個。',careerRv:'從職涯幻想中落地，做出切實的決定。',
   wealthUp:'財務上有太多看似誘人的選項，小心辨別幻象和真實機會。',wealthRv:'財務幻想破滅，回到現實做出理性的財務規劃。',
   healthUp:'健康上有太多建議和方法，需要找到真正適合自己的。',healthRv:'從健康幻想落地，執行真正可行的健康計畫。',
   adviceUp:'用你的直覺辨別，哪個是真正可行的，哪個只是讓你舒服的幻象。',adviceRv:'夢做夠了，現在是時候醒來做決定了。'},
  {id:43, suit:'cup',  rank:'8',      num:8,  n:'聖杯八',   el:'水', astro:'水象星座',
   kwUp:'離開·追尋更深·放棄舊有', kwRv:'恐懼改變·困在舒適圈·逃避',
   up:'離開不再適合的，尋找更深的東西，這個離開需要勇氣。',
   rv:'恐懼改變，留在舒適區，但那個舒適早已不真實。',
   loveUp:'離開一段不再適合的感情，雖然難過但你知道必須繼續走。',loveRv:'困在不再適合的感情中，恐懼讓你留在舒適圈而不前進。',
   careerUp:'放棄一個不再有意義的工作，尋找更深的職涯意義。',careerRv:'知道工作不適合了卻不敢離開，被安全感綁住。',
   wealthUp:'果斷撤出不再有前景的投資，尋找更有意義的財務方向。',wealthRv:'不敢撤出正在虧損的投資，被沉沒成本綁住。',
   healthUp:'願意放棄舊有的不健康習慣，尋求更深層的健康轉變。',healthRv:'不敢改變已有的生活模式，留在熟悉但有害的舒適區。',
   adviceUp:'勇敢離開，你知道那個地方不是你最終的去處，帶著你學到的走。',adviceRv:'你早就知道該走了，是什麼讓你還留在那裡？面對那個恐懼。'},
  {id:44, suit:'cup',  rank:'9',      num:9,  n:'聖杯九',   el:'水', astro:'水象星座',
   kwUp:'願望實現·滿足·豐盛', kwRv:'物質主義·空洞·不滿足',
   up:'願望實現，滿足感，這是你努力應得的結果。',
   rv:'不滿，物質主義，表面有了但內心還是空的。',
   loveUp:'情感願望實現，關係圓滿，對感情感到由衷的滿足。',loveRv:'感情表面滿足但內心有所不足，或以物質取代真正情感。',
   careerUp:'職涯上感到真正的滿足，工作帶給你成就感。',careerRv:'職涯上的滿足感虛假，表面光鮮但內心空洞。',
   wealthUp:'財務上感到充實，物質條件讓你感到滿足。',wealthRv:'物質主義作為滿足感的來源，但真正的需要沒有被填滿。',
   healthUp:'身心狀態令人滿意，充實感讓健康也跟著好轉。',healthRv:'用物質滿足彌補身心缺乏，治標不治本。',
   adviceUp:'好好享受這個你應得的滿足，感恩讓豐盛繼續流動。',adviceRv:'找出真正讓你滿足的是什麼，物質是手段不是終點。'},
  {id:45, suit:'cup',  rank:'10',     num:10, n:'聖杯十',   el:'水', astro:'水象星座',
   kwUp:'圓滿·家庭幸福·情感完整', kwRv:'家庭不和·表象·裂縫',
   up:'情感圓滿，家庭幸福，達到情感上最完整的狀態。',
   rv:'家庭問題，不和諧，表面美好下有需要被處理的問題。',
   loveUp:'情感圓滿，家庭幸福，感情達到最完整的狀態。',loveRv:'家庭問題或感情不和諧，表面美好但有裂縫。',
   careerUp:'工作和家庭達到平衡，職涯帶來真正的生活滿足。',careerRv:'工作影響家庭和諧，生活失衡需要調整。',
   wealthUp:'家庭財務穩定，長期積累帶來的豐盛和幸福。',wealthRv:'家庭財務問題，錢的問題影響家庭和諧。',
   healthUp:'家庭支持是最好的健康基礎，愛的環境讓人充滿活力。',healthRv:'家庭不和諧對健康有負面影響，需要修復家庭環境。',
   adviceUp:'好好珍惜這個情感的圓滿，用感恩和愛繼續維持這個美好。',adviceRv:'家庭問題需要被正視，表面的和諧不等於真正的幸福。'},
  {id:46, suit:'cup',  rank:'page',   num:11, n:'聖杯侍者', el:'水', astro:'水象星座',
   kwUp:'浪漫訊息·直覺·情感萌芽', kwRv:'情緒不穩·不成熟·幻想',
   up:'浪漫訊息，直覺發展，情感上的新開始。',
   rv:'情緒不穩，不成熟的情感表現。',
   loveUp:'浪漫的消息，感情中有令人心動的訊號，新的情感可能性。',loveRv:'情感訊號不穩定，感情上不成熟的對象或行為。',
   careerUp:'創意靈感的訊息，有感性的新機會到來。',careerRv:'職涯上不成熟的判斷，情緒影響理性思考。',
   wealthUp:'直覺性的財務訊號，要注意但也值得評估。',wealthRv:'財務上衝動行事，情緒化決策造成損失。',
   healthUp:'身體有細微的訊號在傳達，值得傾聽。',healthRv:'情緒不穩定影響健康，需要先穩定情緒。',
   adviceUp:'相信那個直覺，那個訊號是真的，值得去回應。',adviceRv:'先穩定你的情緒，然後再做任何情感決定。'},
  {id:47, suit:'cup',  rank:'knight', num:12, n:'聖杯騎士', el:'水', astro:'水象星座',
   kwUp:'浪漫·深情·為愛行動', kwRv:'情緒化·不切實際·衝動',
   up:'浪漫追求者，感性行動，以情感驅動的能量。',
   rv:'情緒化，不切實際，感性超越了理性。',
   loveUp:'充滿浪漫和深情的追求者，感性又行動力強，為愛奔赴。',loveRv:'情緒化和不切實際的追求，感性讓他做出不理性的選擇。',
   careerUp:'以熱情和創意為職涯動力，感性地推動工作。',careerRv:'情緒化的工作態度影響績效，需要更多理性的規劃。',
   wealthUp:'直覺性地把握財務機會，感性而聰明的財務行動。',wealthRv:'財務上的情緒化決策，不切實際的期待造成損失。',
   healthUp:'充滿情感的療癒方式，心情好了身體也跟著好。',healthRv:'情緒化讓健康管理失去一致性，時好時壞。',
   adviceUp:'讓你的深情引導行動，但也要保持清醒的判斷。',adviceRv:'感性是你的天賦，但先用理性確認方向再行動。'},
  {id:48, suit:'cup',  rank:'queen',  num:13, n:'聖杯皇后', el:'水', astro:'水象星座',
   kwUp:'慈愛·直覺·情感豐富', kwRv:'情緒化·過度付出·情感操控',
   up:'慈愛，情感豐富，直覺強，以愛和直覺引導一切。',
   rv:'情緒化，過度付出，需要照顧好自己才能照顧他人。',
   loveUp:'慈愛、情感豐富，以無條件的愛滋養感情，直覺極強。',loveRv:'情緒化，過度付出，以情感控制對方。',
   careerUp:'以直覺和情感智慧處理工作，對人有深刻的洞察力。',careerRv:'情緒化影響工作判斷，過度付出導致身心耗竭。',
   wealthUp:'直覺性地把握財務機會，以情感智慧管理財務。',wealthRv:'情緒化的財務決策，或過度慷慨導致自己財務受損。',
   healthUp:'情感健康是身體健康的基礎，內心充滿愛讓你充滿活力。',healthRv:'情緒化讓身體承受過多壓力，需要更好地管理情緒。',
   adviceUp:'你的愛和直覺是最大的禮物，大方地給出，也記得留一些給自己。',adviceRv:'先把自己的杯子裝滿，空的杯子倒不出東西給別人。'},
  {id:49, suit:'cup',  rank:'king',   num:14, n:'聖杯國王', el:'水', astro:'水象星座',
   kwUp:'情感成熟·智慧·慷慨', kwRv:'情感壓抑·操控·失衡',
   up:'情感成熟，慷慨智慧，以情感智慧引領一切。',
   rv:'情感壓抑，操控，情緒和理性之間失去平衡。',
   loveUp:'情感成熟，慷慨有智慧，是感情中穩定而有深度的伴侶。',loveRv:'情感壓抑，用理性控制感情，或在關係中操控他人情緒。',
   careerUp:'以情感智慧和成熟度帶領職場，受人尊重的情感型領導。',careerRv:'情感壓抑讓工作缺乏人性化，或情緒不受控影響決策。',
   wealthUp:'以情感智慧做財務決策，慷慨但不失理性的財務管理。',wealthRv:'情感操控財務，或情緒化讓財務管理失去一貫性。',
   healthUp:'情感健康和身體健康兼顧，成熟的自我照顧。',healthRv:'情感壓抑影響健康，需要找到適當的情緒出口。',
   adviceUp:'你的情感智慧是你最大的資產，用它來建立真誠的連結。',adviceRv:'你壓抑的情感最終會找出路，最好是你主動面對它。'},
  // ═══ 小阿爾克那 — 寶劍 Swords ═══
  {id:50, suit:'sword',rank:'ace',    num:1,  n:'寶劍王牌', el:'風', astro:'風象星座',
   kwUp:'真相·突破·清晰', kwRv:'混亂·錯誤判斷·思緒不清',
   up:'真相與突破，清晰的新想法，切穿混亂的力量。',
   rv:'混亂思緒，錯誤判斷，需要重新整理思維。',
   loveUp:'感情中需要真相和清晰，直接面對關係的核心問題。',loveRv:'感情中思緒混亂，需要先理清自己的想法再行動。',
   careerUp:'職涯上有突破性的新想法，清晰的思維帶來新方向。',careerRv:'思緒混亂影響職涯判斷，需要清空雜念重新思考。',
   wealthUp:'財務上有清晰的突破口，以理性思維把握機會。',wealthRv:'財務思路不清，錯誤判斷帶來損失。',
   healthUp:'清晰地理解健康狀況，理性地找到解決方案。',healthRv:'對健康問題思緒混亂，需要尋求專業清晰的診斷。',
   adviceUp:'說出那個真相，清晰才能帶來改變，不要繞圈子。',adviceRv:'先把自己的思緒理清，混亂的腦袋做不出好決定。'},
  {id:51, suit:'sword',rank:'2',      num:2,  n:'寶劍二',   el:'風', astro:'風象星座',
   kwUp:'抉擇·平衡·暫停', kwRv:'資訊過載·逃避·拖延',
   up:'抉擇困難，需要平衡思考，先求穩定再行動。',
   rv:'資訊過載，逃避決定，拖著不決定也是一種決定。',
   loveUp:'感情中面臨困難的選擇，需要在平衡中找到答案。',loveRv:'感情問題的資訊過載讓你無法做決定，需要抽離。',
   careerUp:'職涯抉擇困難，需要平衡各方因素仔細思考。',careerRv:'工作資訊太多反而讓你更難做決定，需要斷捨離。',
   wealthUp:'財務決策需要仔細衡量各方面，不要急著做決定。',wealthRv:'財務決策被過多資訊淹沒，逃避只讓問題更複雜。',
   healthUp:'需要在多種健康方案中做出平衡的選擇。',healthRv:'健康上的決定被過多選項和資訊淹沒，需要簡化。',
   adviceUp:'把所有因素列出來，客觀衡量，然後做出你能承擔的選擇。',adviceRv:'停止蒐集資訊，你已經有足夠的資訊了，是時候決定了。'},
  {id:52, suit:'sword',rank:'3',      num:3,  n:'寶劍三',   el:'風', astro:'風象星座',
   kwUp:'心碎·悲痛·傷口', kwRv:'療癒·走出傷痛·復原',
   up:'心碎，悲痛，傷需要先被承認才能療癒。',
   rv:'走出傷痛，開始復原，傷口在癒合中。',
   loveUp:'感情中的痛苦和心碎，需要允許自己悲傷才能開始療癒。',loveRv:'從感情的傷痛中慢慢走出來，傷口在癒合中。',
   careerUp:'職涯上的背叛或失望帶來痛苦，這個傷需要被承認。',careerRv:'職場傷痛開始療癒，從痛苦中找到成長的力量。',
   wealthUp:'財務損失帶來心痛，允許自己面對這個痛苦。',wealthRv:'從財務損失的傷痛中慢慢走出來，開始療癒和重建。',
   healthUp:'情緒上的痛苦影響身體，需要承認並面對這個傷。',healthRv:'情緒和心理的傷痛開始療癒，身心狀態在改善。',
   adviceUp:'讓自己好好哭一場，壓抑傷痛只會讓傷更深，先承認再療癒。',adviceRv:'傷口已經在癒合了，繼續照顧自己，你會好起來的。'},
  {id:53, suit:'sword',rank:'4',      num:4,  n:'寶劍四',   el:'風', astro:'風象星座',
   kwUp:'靜養·休息·恢復', kwRv:'焦躁·強迫·無法真正休息',
   up:'休息恢復，靜養，讓自己真正充電再出發。',
   rv:'焦躁不安，不願休息，或休息了也無法真正放鬆。',
   loveUp:'感情需要暫時的休息和靜養，給彼此空間讓關係重新充電。',loveRv:'感情中的休息期已經夠了，焦躁不安讓你難以真正靜下來。',
   careerUp:'職場需要充電，適當的休息讓你之後更有效率。',careerRv:'無法真正休息，焦躁讓你即使在休息也無法恢復。',
   wealthUp:'財務策略暫時按兵不動，觀察等待是對的。',wealthRv:'財務上的焦躁讓你無法有效地等待或計畫。',
   healthUp:'身體需要靜養和休息，這段時間讓自己真正停下來。',healthRv:'身體需要休息但你靜不下來，焦躁讓恢復更慢。',
   adviceUp:'真正地休息，讓自己充電，接下來的行動需要你有滿格的能量。',adviceRv:'你的身心都在叫你停下來，聽一聽，真正的靜下來。'},
  {id:54, suit:'sword',rank:'5',      num:5,  n:'寶劍五',   el:'風', astro:'風象星座',
   kwUp:'衝突·失敗·代價', kwRv:'和解·學習·放下爭勝',
   up:'衝突與失敗，需要用正確的方式面對，自私行為代價高。',
   rv:'和解，學會認輸，從衝突中找到成長的機會。',
   loveUp:'感情中有衝突和傷害，需要正視問題而非假裝沒事。',loveRv:'從感情衝突中願意和解，學習從失敗的互動中成長。',
   careerUp:'職場衝突或不道德的競爭，需要選擇正確的方式應對。',careerRv:'職場衝突後的和解，從失敗中學習，不重蹈覆轍。',
   wealthUp:'財務競爭中有不公平或衝突，需要謹慎應對。',wealthRv:'財務衝突後學習和解，從損失中獲得教訓。',
   healthUp:'身體中的衝突需要正面對抗才能解決。',healthRv:'身體的衝突開始緩解，和解和恢復中。',
   adviceUp:'面對衝突，但用正確的方式，贏了一場架可能輸了整個關係。',adviceRv:'放下需要贏的執著，和解才能讓事情真正往前走。'},
  {id:55, suit:'sword',rank:'6',      num:6,  n:'寶劍六',   el:'風', astro:'風象星座',
   kwUp:'過渡·離開·往更好', kwRv:'困住·出走受阻·停滯',
   up:'離開困境，過渡期，往更平靜的方向移動。',
   rv:'困住，無法離開，出走的能量被阻礙。',
   loveUp:'離開困難的感情環境，進入過渡期，往更好的方向走。',loveRv:'知道應該離開但無法邁出那一步，被困住出不去。',
   careerUp:'從困難的工作環境過渡到更好的地方，轉換期。',careerRv:'想換工作或轉換環境但卡住了，出走的路被堵住。',
   wealthUp:'財務上的轉移和過渡，從困境往較好的地方移動。',wealthRv:'財務上被困在困境中，出路被阻礙。',
   healthUp:'從健康困境中慢慢走出，康復的過渡期。',healthRv:'健康問題讓你無法真正走出困境，被困在原地。',
   adviceUp:'已經在走了，繼續走，過渡期雖然不舒服但你在往更好的地方去。',adviceRv:'找到那個阻止你離開的真正原因，解決它才能真正動起來。'},
  {id:56, suit:'sword',rank:'7',      num:7,  n:'寶劍七',   el:'風', astro:'風象星座',
   kwUp:'策略·謹慎·注意欺騙', kwRv:'真相揭露·良心·誠實',
   up:'策略行動，需要謹慎，注意欺騙和被欺騙的可能性。',
   rv:'真相揭露，良心不安，誠實才是最終的解答。',
   loveUp:'感情中需要策略性地處理，有時需要保留一些不說，但誠實仍是基礎。',loveRv:'感情中的不誠實被發現，或良心不安讓你主動承認。',
   careerUp:'職場中需要策略性行動，但要注意界線不踰越道德。',careerRv:'職場上的不道德行為被揭露，或自己的良心讓你選擇誠實。',
   wealthUp:'財務上需要謹慎策略，有人可能在欺騙你，要注意。',wealthRv:'財務欺騙被揭穿，或你自己選擇誠實面對問題。',
   healthUp:'健康問題需要謹慎的策略，不要一次解決所有問題。',healthRv:'對健康狀況的逃避被面對，誠實地正視問題。',
   adviceUp:'策略是必要的，但確認你的策略在道德範圍內，謊言最終都會被揭穿。',adviceRv:'說出那個你一直壓著的真相，誠實雖然難，但值得。'},
  {id:57, suit:'sword',rank:'8',      num:8,  n:'寶劍八',   el:'風', astro:'風象星座',
   kwUp:'自我設限·思維困境·心造', kwRv:'解脫·突破·看清',
   up:'自我限制，困境是心造，改變思維才能改變現實。',
   rv:'解脫束縛，看清真相，思維突破帶來真正的自由。',
   loveUp:'感情中被自己的恐懼和思維困住，限制來自內心而非外在。',loveRv:'看清感情中的自我設限，開始突破內心的框架。',
   careerUp:'職涯上的困境更多是思維上的限制，改變想法才能改變處境。',careerRv:'開始看清職涯上的自我設限，突破思維找到新方向。',
   wealthUp:'財務上的困境很大程度是思維設限造成的，需要改變觀念。',wealthRv:'財務思維的突破，看清自我設限開始採取行動。',
   healthUp:'心理和思維上的限制影響健康，很多困境是心造的。',healthRv:'心理設限開始解除，看清自己才能真正改善健康。',
   adviceUp:'那個籠子的門是開著的，是你自己不走出去，改變你的思維。',adviceRv:'你已經開始看見了，繼續往前走，思維的突破是真正的解放。'},
  {id:58, suit:'sword',rank:'9',      num:9,  n:'寶劍九',   el:'風', astro:'風象星座',
   kwUp:'焦慮·恐懼·失眠', kwRv:'面對恐懼·緩解·找到出路',
   up:'焦慮、恐懼、失眠，需要面對那些在深夜困擾你的念頭。',
   rv:'面對恐懼，走出焦慮，慢慢找到應對的方式。',
   loveUp:'對感情的焦慮和恐懼讓你夜不能寐，需要面對那些恐懼。',loveRv:'感情焦慮開始減少，從恐懼中找到應對的力量。',
   careerUp:'職涯上的焦慮和恐懼影響睡眠和日常，需要正視。',careerRv:'職涯焦慮開始緩解，找到面對壓力的方式。',
   wealthUp:'財務焦慮嚴重影響生活質量，需要積極面對而非逃避。',wealthRv:'財務焦慮開始可以被管理，從恐懼中找到應對策略。',
   healthUp:'焦慮和精神壓力嚴重影響健康，這是最需要處理的問題。',healthRv:'心理焦慮開始減輕，身心狀態慢慢好轉。',
   adviceUp:'那些在深夜嚇你的念頭，白天的時候直接面對它們，陽光下它們沒那麼可怕。',adviceRv:'焦慮在減少，繼續面對而非逃避，你比你想的更有能力應對。'},
  {id:59, suit:'sword',rank:'10',     num:10, n:'寶劍十',   el:'風', astro:'風象星座',
   kwUp:'觸底·結束·放下', kwRv:'最壞已過·恢復·重建',
   up:'結束與放下，觸底，最痛的時候，但之後只有往上。',
   rv:'最壞已過，開始恢復，往上走的時候到了。',
   loveUp:'感情到達最低點，結束和放下，雖然痛苦但觸底後開始反彈。',loveRv:'感情最壞的已經過去，開始慢慢恢復。',
   careerUp:'職涯觸底，可能是被解雇或重大挫敗，但觸底後只能往上。',careerRv:'職涯最艱難的時期已過，恢復期開始。',
   wealthUp:'財務觸底，嚴重的損失，但這是最低點，之後可以重建。',wealthRv:'財務最壞的已經過去，謹慎開始重建。',
   healthUp:'健康觸底，需要完全的休息和療癒，不能再耗下去。',healthRv:'健康最壞的已過，慢慢恢復中，繼續配合療癒。',
   adviceUp:'觸底了，放下吧，保留你的能量用於重建，不要繼續在廢墟上耗。',adviceRv:'最難的過了，相信這個恢復的過程，你走在回來的路上。'},
  {id:60, suit:'sword',rank:'page',   num:11, n:'寶劍侍者', el:'風', astro:'風象星座',
   kwUp:'好奇·探索·觀察', kwRv:'八卦·冷漠·不成熟',
   up:'好奇心，新想法，開放地學習和探索。',
   rv:'八卦，冷漠，好奇心用在了不健康的方向。',
   loveUp:'感情中充滿好奇和探索，願意了解更多關於對方。',loveRv:'在感情中八卦或偷窺，不健康的好奇心。',
   careerUp:'職涯上充滿求知慾，學習新事物為工作帶來新鮮感。',careerRv:'職場中八卦過多，冷漠或不成熟的態度。',
   wealthUp:'積極學習財務知識，好奇心驅動財務知識的增長。',wealthRv:'財務上的不成熟，或因為好奇而做出衝動決定。',
   healthUp:'對健康知識充滿好奇，積極學習更多健康資訊。',healthRv:'對健康過度八卦或焦慮，冷漠地忽視真正的需要。',
   adviceUp:'帶著好奇心去探索，學習和發現是這個階段的關鍵。',adviceRv:'把你的好奇心從八卦轉向真正有價值的學習。'},
  {id:61, suit:'sword',rank:'knight', num:12, n:'寶劍騎士', el:'風', astro:'風象星座',
   kwUp:'清晰·快速·行動', kwRv:'衝動·傷人·缺乏同理',
   up:'思路清晰，快速行動，高效率地推進。',
   rv:'衝動發言，缺乏同理，快而不準確。',
   loveUp:'感情中思路清晰，直接表達想法，以行動推進感情。',loveRv:'感情中衝動發言，不考慮對方感受直接傷害對方。',
   careerUp:'職場上思路清晰，快速行動，有效率地推進工作。',careerRv:'職場上衝動發言，缺乏同理心傷害同事關係。',
   wealthUp:'財務決策快速清晰，以行動力把握時機。',wealthRv:'財務上衝動行事，沒有考慮周全就快速出手。',
   healthUp:'清晰地認識健康問題，快速採取行動改善。',healthRv:'衝動的健康決定，沒有充分評估就行動。',
   adviceUp:'你的速度和清晰是優勢，在行動前快速確認方向是對的。',adviceRv:'快一秒讓你說了不該說的，先思考再開口。'},
  {id:62, suit:'sword',rank:'queen',  num:13, n:'寶劍皇后', el:'風', astro:'風象星座',
   kwUp:'獨立·真相·智慧', kwRv:'冷酷·疏離·過於理性',
   up:'獨立思考，追求真相，以智慧和判斷力著稱。',
   rv:'過於冷漠，人際中缺乏溫度，讓人難以靠近。',
   loveUp:'感情中保持獨立思考，不被情緒左右，以智慧面對感情真相。',loveRv:'感情中過於冷漠，用理性切斷情感，讓對方感到疏離。',
   careerUp:'職場中獨立思考，追求真相，以智慧和判斷力著稱。',careerRv:'過於冷酷的職場態度，缺乏人性讓合作困難。',
   wealthUp:'財務上以清醒的頭腦做判斷，不被情緒影響。',wealthRv:'財務上過於冷酷，失去人性化的考量導致機會流失。',
   healthUp:'客觀地評估健康狀況，以清醒的判斷找到解決方案。',healthRv:'過於理性忽略情感對健康的影響。',
   adviceUp:'你的清醒和智慧是寶貴的，用真相服務自己和身邊的人。',adviceRv:'你的理性是優點，但偶爾讓自己有情感，那也是智慧的一部分。'},
  {id:63, suit:'sword',rank:'king',   num:14, n:'寶劍國王', el:'風', astro:'風象星座',
   kwUp:'公正·權威·理性', kwRv:'獨裁·冷酷·強硬',
   up:'理性權威，公正判斷，以清晰和規則著稱。',
   rv:'獨裁，冷酷無情，理性用錯了地方。',
   loveUp:'感情中是理性公正的成熟者，以清晰的判斷維護關係的健康。',loveRv:'感情中獨裁冷酷，用權威壓制對方，缺乏溫柔。',
   careerUp:'職場上的理性權威，以公正的判斷力著稱，受人尊重。',careerRv:'職場獨裁，用冷酷的方式管理，讓人感到恐懼而非敬重。',
   wealthUp:'財務上的理性決策者，公正客觀，有效率地管理財務。',wealthRv:'財務上獨裁自以為是，拒絕聽取他人建議導致錯誤。',
   healthUp:'以理性和公正的方式管理健康，清晰評估健康狀況。',healthRv:'用冷酷的方式對待身體，缺乏對自己的溫柔和照顧。',
   adviceUp:'你的公正和理性是最大的貢獻，繼續以清醒的眼光帶領。',adviceRv:'加一點溫柔和人性，純粹的冷酷判斷長期下來讓人疏遠你。'},
  // ═══ 小阿爾克那 — 金幣 Pentacles ═══
  {id:64, suit:'pent', rank:'ace',    num:1,  n:'金幣王牌', el:'土', astro:'土象星座',
   kwUp:'新機會·物質·豐盛開始', kwRv:'錯失良機·貪婪·機會受阻',
   up:'新財務機會，物質豐盛的開始，把握實際的機會。',
   rv:'因貪婪或疏忽錯失財務機會，物質方面的新開始受阻。',
   loveUp:'感情有穩固的物質和現實基礎，關係有具體的承諾和行動。',loveRv:'感情缺乏穩定的現實基礎，或物質條件影響感情發展。',
   careerUp:'新的財務機會或工作機會到來，物質上的好開始。',careerRv:'財務機會被錯失，或貪婪讓你錯失了真正好的機會。',
   wealthUp:'新的財務機會，把握這個實際的機會起點。',wealthRv:'因貪婪或疏忽錯失財務機會，物質方面的新開始受阻。',
   healthUp:'身體健康有了新的良好開始，物質條件支持健康生活。',healthRv:'健康的物質基礎不足，缺乏維持健康的資源。',
   adviceUp:'這個物質機會是真實的，用行動把握它，不要只是想想。',adviceRv:'不要讓貪婪讓你錯失真正好的機會，分辨真實和幻象。'},
  {id:65, suit:'pent', rank:'2',      num:2,  n:'金幣二',   el:'土', astro:'土象星座',
   kwUp:'平衡·彈性·多工', kwRv:'失衡·優先順序混亂·超載',
   up:'平衡，適應變化，靈活地在多重需求中找到均衡。',
   rv:'失衡，優先順序混亂，需要重新排列和取捨。',
   loveUp:'在感情和生活其他方面之間找到平衡，靈活應對多方需求。',loveRv:'感情和生活其他方面失衡，優先順序混亂讓兩邊都受影響。',
   careerUp:'在多個工作項目之間靈活切換，平衡多重職場需求。',careerRv:'多工失衡，優先順序混亂，工作效率下降。',
   wealthUp:'在收入和支出之間靈活地找到平衡，有效管理財務流動。',wealthRv:'財務失衡，入不敷出，或優先順序混亂導致財務混亂。',
   healthUp:'在工作生活和健康之間找到平衡，靈活調整。',healthRv:'生活失衡影響健康，優先順序需要重新排列。',
   adviceUp:'你有能力找到那個平衡點，靈活調整是你的優勢。',adviceRv:'你沒辦法同時做好所有事，先決定什麼最重要，其他的等等。'},
  {id:66, suit:'pent', rank:'3',      num:3,  n:'金幣三',   el:'土', astro:'土象星座',
   kwUp:'合作·精進·技藝', kwRv:'缺乏協作·敷衍·品質不佳',
   up:'團隊合作，技能提升，努力精進有回報。',
   rv:'缺乏協作，品質不佳，精進受阻。',
   loveUp:'感情建立在扎實的基礎上，共同努力讓關係更加穩固。',loveRv:'感情缺乏協作，各做各的讓關係失去共同成長的力量。',
   careerUp:'團隊合作順暢，技能提升有成效，工藝和精進有回報。',careerRv:'缺乏協作，工作品質不佳，技能發展受阻。',
   wealthUp:'以精實的工作和技能賺取財富，努力帶來實際回報。',wealthRv:'工作品質不足影響收入，技能不夠無法達到財務目標。',
   healthUp:'規律地精進健康習慣，與醫療或健康夥伴合作有效。',healthRv:'健康習慣缺乏一致性，與健康顧問合作不順利。',
   adviceUp:'持續精進你的技能，好的合作關係讓你的努力加倍。',adviceRv:'找到好的合作夥伴，或提升工作的品質，才能看到真正的成果。'},
  {id:67, suit:'pent', rank:'4',      num:4,  n:'金幣四',   el:'土', astro:'土象星座',
   kwUp:'守財·安全感·保護', kwRv:'吝嗇·恐懼失去·緊握',
   up:'守財有道，安全感強，保守的財務策略穩健。',
   rv:'過度吝嗇，恐懼失去讓你錯失成長的機會。',
   loveUp:'在感情中有安全感，對這段關係有保護意識，愛護你擁有的。',loveRv:'過度緊握讓感情窒息，或對物質安全感的執著影響關係。',
   careerUp:'穩健地守住現有的職涯成果，不冒險但穩健。',careerRv:'對職涯資源過度保守，吝嗇影響了成長和機會。',
   wealthUp:'守財有道，安全感強，保守的財務策略穩健。',wealthRv:'過度吝嗇，恐懼失去讓你錯失成長的機會。',
   healthUp:'保護現有的健康成果，維持好不容易建立的健康習慣。',healthRv:'對健康過度執著和控制，反而帶來焦慮。',
   adviceUp:'保護你已有的是對的，但也要留些空間給成長。',adviceRv:'適度的安全感是好的，但過度緊握只會讓你失去更多。'},
  {id:68, suit:'pent', rank:'5',      num:5,  n:'金幣五',   el:'土', astro:'土象星座',
   kwUp:'困難·匱乏·需要援助', kwRv:'走出困境·援助·好轉',
   up:'困難時期，物質匱乏，需要尋求幫助，不要羞於求援。',
   rv:'走出困境，援助到來，困難的時期正在結束。',
   loveUp:'感情中遭遇物質或情感的匱乏，雙方都在困難中，需要互相扶持。',loveRv:'從感情的困難期走出，援助到來，情感和物質都開始好轉。',
   careerUp:'職涯困難時期，物質和支持都感到匱乏，需要尋求幫助。',careerRv:'職涯困難期結束，援助到來，開始走出困境。',
   wealthUp:'財務困難，物質匱乏，需要尋求幫助和資源。',wealthRv:'財務困境開始解除，援助和機會到來。',
   healthUp:'健康困難時期，缺乏資源和支持，需要主動尋求幫助。',healthRv:'健康困難期開始好轉，援助和治療開始有效。',
   adviceUp:'困難時期開口求援不是弱點，主動尋求幫助是智慧。',adviceRv:'最難的已經過去，援助在來的路上，繼續撐住。'},
  {id:69, suit:'pent', rank:'6',      num:6,  n:'金幣六',   el:'土', astro:'土象星座',
   kwUp:'慷慨·施與受·平衡', kwRv:'不對等·債務·單方面',
   up:'施與受的財務平衡，慷慨且合理地管理財富。',
   rv:'財務上嚴重失衡，債務問題，或給出去遠多於得到。',
   loveUp:'感情中施與受的平衡良好，彼此慷慨且公平地對待。',loveRv:'感情中嚴重不平衡，一方給得多另一方幾乎不回報。',
   careerUp:'職場上慷慨地分享資源和知識，付出和回報成正比。',careerRv:'職場中付出和回報嚴重不對等，或有債務和義務糾纏。',
   wealthUp:'施與受的財務平衡，慷慨且合理地管理財富。',wealthRv:'財務上嚴重失衡，債務問題，或給出去遠多於得到。',
   healthUp:'身體給予和接受能量達到平衡，健康管理中有良好的互動。',healthRv:'健康上過度付出而不懂得接受照顧，身心失衡。',
   adviceUp:'你的慷慨是美德，同時也要確保你值得的也有回來給你。',adviceRv:'重新評估付出和回報的比例，不對等的關係需要被正視。'},
  {id:70, suit:'pent', rank:'7',      num:7,  n:'金幣七',   el:'土', astro:'土象星座',
   kwUp:'耐心·積累·等待收穫', kwRv:'急躁·缺乏耐心·功虧一簣',
   up:'耐心等待收獲，長期的積累正在進行，成果就要來了。',
   rv:'急躁，缺乏耐心，急於求成可能讓長期努力付之東流。',
   loveUp:'感情需要耐心等待，現在播下的種子未來會有豐收。',loveRv:'對感情結果缺乏耐心，急躁讓你做出倉促的決定。',
   careerUp:'職涯長期投資正在積累，耐心等待成果顯現。',careerRv:'對職涯成果缺乏耐心，急於求成讓努力前功盡棄。',
   wealthUp:'長期投資在積累中，耐心等待是正確的策略。',wealthRv:'財務上急於求成，缺乏耐心讓長期布局功虧一簣。',
   healthUp:'健康的改善需要時間，持續努力一定會有成果。',healthRv:'健康改善缺乏耐心，急於看到結果讓你放棄正確的方法。',
   adviceUp:'繼續播種，繼續等待，你在做的事情是值得的，成果需要時間。',adviceRv:'你的等待還沒完，不要在快到了的時候放棄，再耐心一點。'},
  {id:71, suit:'pent', rank:'8',      num:8,  n:'金幣八',   el:'土', astro:'土象星座',
   kwUp:'精進·投入·工匠精神', kwRv:'敷衍·缺乏熱情·平庸',
   up:'精進技藝，專注投入，細心做好每件事。',
   rv:'缺乏熱情，敷衍了事，不用心的結果就是平庸。',
   loveUp:'在感情中精心投入，細心經營，把關係當作精品一樣打磨。',loveRv:'在感情中敷衍了事，缺乏真誠的投入讓關係失去光澤。',
   careerUp:'精進技藝，專注投入，職人精神帶來真正的成就。',careerRv:'對工作缺乏熱情，敷衍了事讓技能無法提升。',
   wealthUp:'以精進的技能賺取財富，投入多少就得到多少。',wealthRv:'財務上的敷衍了事，缺乏真正投入讓財務難以成長。',
   healthUp:'認真精進健康管理，細心對待自己的身體。',healthRv:'健康管理敷衍，缺乏真正的投入讓健康難以改善。',
   adviceUp:'繼續這份精進的心，真正的卓越來自於細心和投入。',adviceRv:'對你做的事重新燃起熱情，敷衍帶不到你想去的地方。'},
  {id:72, suit:'pent', rank:'9',      num:9,  n:'金幣九',   el:'土', astro:'土象星座',
   kwUp:'豐收·自足·獨立', kwRv:'過度自足·孤立·拒絕幫助',
   up:'豐收，自給自足，靠自己達到充實的狀態。',
   rv:'過度自足，財務風險，獨立到拒絕必要的幫助。',
   loveUp:'感情中有充分的自主性，不依賴對方也能自給自足，健康的獨立。',loveRv:'過度自足到不願意在感情中依賴，失去親密感。',
   careerUp:'職涯上豐收，靠自己的努力達到自給自足，成就獨立。',careerRv:'過度自足讓你拒絕合作或幫助，孤軍奮戰有財務風險。',
   wealthUp:'財務豐收，自給自足，靠自己的努力達到財務獨立。',wealthRv:'過度自足帶來財務風險，孤立的財務策略有盲點。',
   healthUp:'健康上達到充實自足的狀態，自我照顧有道。',healthRv:'過度自足到拒絕尋求健康幫助，忽視重要的健康訊號。',
   adviceUp:'享受這份自給自足，同時記得和周圍的人分享你的豐盛。',adviceRv:'獨立是優點，但偶爾讓別人進來也是一種豐盛。'},
  {id:73, suit:'pent', rank:'10',     num:10, n:'金幣十',   el:'土', astro:'土象星座',
   kwUp:'家族財富·傳承·長久穩定', kwRv:'家庭財務問題·遺留問題',
   up:'家族財富，長久穩定，多代積累帶來的豐盛。',
   rv:'家庭財務問題，長期穩定性受到挑戰。',
   loveUp:'感情走向長期穩定的承諾，家庭式的愛和財務基礎都很穩固。',loveRv:'家庭財務問題影響感情，或感情中的長期穩定性出問題。',
   careerUp:'職涯達到長期穩定，可能是家族企業或長期的機構性工作。',careerRv:'職涯的長期穩定性受到挑戰，遺留問題影響當下。',
   wealthUp:'家族財富，長久穩定的財務，多代積累的豐盛。',wealthRv:'家庭財務問題，可能是遺留問題或繼承糾紛。',
   healthUp:'長期穩定的健康管理有效，家族健康傳統值得繼承。',healthRv:'家族性的健康問題需要注意，遺傳因素需要考量。',
   adviceUp:'珍惜這個長期積累的豐盛，用智慧守護和傳承下去。',adviceRv:'面對家族中積累已久的問題，長期拖延讓它越來越複雜。'},
  {id:74, suit:'pent', rank:'page',   num:11, n:'金幣侍者', el:'土', astro:'土象星座',
   kwUp:'學習·務實·目標', kwRv:'缺乏方向·浪費·不務實',
   up:'學習機會，務實目標，用行動落實你的計畫。',
   rv:'缺乏方向，浪費資源，不夠務實讓計畫停留在想像。',
   loveUp:'感情上有務實的新開始，以實際行動表達愛意。',loveRv:'感情上缺乏方向，不切實際的期待讓關係原地踏步。',
   careerUp:'學習和發展的好時機，務實地追求職涯目標。',careerRv:'職涯缺乏方向，學習機會被浪費，不夠務實。',
   wealthUp:'有財務學習機會，務實地追求財務目標。',wealthRv:'財務上缺乏方向，學習機會被浪費，不夠務實。',
   healthUp:'開始學習更好的健康習慣，務實地執行健康計畫。',healthRv:'健康計畫缺乏方向，不務實導致計畫難以執行。',
   adviceUp:'學習和行動並進，務實地一步一步往前走。',adviceRv:'把計畫從腦子裡拿出來執行，光想不做是沒有用的。'},
  {id:75, suit:'pent', rank:'knight', num:12, n:'金幣騎士', el:'土', astro:'土象星座',
   kwUp:'穩健·可靠·效率', kwRv:'固執·保守·停滯',
   up:'穩健前進，有效率，可靠的行動方式。',
   rv:'固執，過度保守，不願改變導致停滯。',
   loveUp:'感情中穩健前進，可靠地一步一步加深關係，不急不緩。',loveRv:'感情中過於固執或保守，不願意改變導致關係停滯。',
   careerUp:'職場上穩健前進，效率高且可靠，慢而穩的方式帶來成果。',careerRv:'職場中過於保守，固執地守舊導致錯失進步機會。',
   wealthUp:'財務上穩健前進，效率高且謹慎，可靠的財務策略。',wealthRv:'財務上過於保守，固執地不願改變帶來機會損失。',
   healthUp:'健康管理穩健前進，有效率且持續，慢而穩的方式最可靠。',healthRv:'健康上過於保守，固執地不接受新方法。',
   adviceUp:'繼續這份穩健，你的可靠性是你最大的資產。',adviceRv:'偶爾嘗試新方法，固執不是原則，適度的靈活讓你走得更遠。'},
  {id:76, suit:'pent', rank:'queen',  num:13, n:'金幣皇后', el:'土', astro:'土象星座',
   kwUp:'富足·安全·務實', kwRv:'不安全感·物質執著·焦慮',
   up:'富足，安全，實際，帶來真實的豐盛和穩定。',
   rv:'不安全感，過度物質，失去生活的其他維度。',
   loveUp:'感情中帶來安全感和豐盛，是實際可靠且溫暖的伴侶。',loveRv:'對感情缺乏安全感，過度執著物質讓感情失去溫度。',
   careerUp:'職場上以務實和豐盛著稱，能創造穩固的職業成果。',careerRv:'過度在意物質和安全感，讓職涯陷入不必要的焦慮。',
   wealthUp:'財務上富足安全，實際可靠的財富積累方式。',wealthRv:'對財務不安全感過重，過度物質化讓你失去生活的其他意義。',
   healthUp:'實際可靠的健康管理，讓身體感到安全和豐盛。',healthRv:'對健康的不安全感讓你過度焦慮，需要更平衡的健康觀。',
   adviceUp:'你帶來的安全感和豐盛是真正的禮物，繼續用務實的愛照顧周圍的人。',adviceRv:'真正的豐盛不只是物質，讓你的安全感有更廣闊的基礎。'},
  {id:77, suit:'pent', rank:'king',   num:14, n:'金幣國王', el:'土', astro:'土象星座',
   kwUp:'財務成功·責任·領導', kwRv:'貪婪·控制·物慾',
   up:'財務成功，領導力，以責任和可靠性著稱的成熟者。',
   rv:'貪婪，過度控制，財務能力用錯了方向。',
   loveUp:'感情中是穩固可靠的夥伴，以財務能力和責任感支持關係。',loveRv:'感情中貪婪或過度控制，讓伴侶感到窒息而非安全。',
   careerUp:'職場上的財務領導者，以可靠的成果和判斷力著稱。',careerRv:'職場上過度貪婪或控制，讓合作關係出現問題。',
   wealthUp:'財務成功的領導者，以精準的判斷力和責任感管理財富。',wealthRv:'貪婪讓財務決策走偏，過度控制財務讓資金無法流動。',
   healthUp:'以務實可靠的方式管理健康，長期穩健的健康策略。',healthRv:'過度執著於物質安全，忽視了健康其他層面的需求。',
   adviceUp:'你的財務智慧和可靠性是真正的禮物，用它來服務而非控制。',adviceRv:'財富是工具不是目的，過度執著於控制只會帶來孤立。'}
];

// ═══ v28：78 張牌面場景描述 — AI 用來映射用戶處境 ═══
(function(){
var SC={
0:'懸崖邊的年輕人，一腳踏入虛空，小狗在旁邊叫，他頭也不回',
1:'桌上四件工具齊備，他一手指天一手指地，像在說：我準備好了',
2:'兩根柱子之間靜坐的女人，膝上攤著一本沒翻開的書，她知道但不說',
3:'花園裡被果實環繞的女人，手撫著肚子，萬物因她而生長',
4:'石頭王座上全副武裝的男人，四隻公羊頭刻在椅背，他不動就是力量',
5:'兩個人跪在高座前聽訓，穿法袍的人舉起手指——規則比你大',
6:'天使看著下方的一男一女，他們面對彼此但還沒碰到手',
7:'黑白兩隻獸拉著戰車，上面的人不拉韁繩——他靠意志在控制方向',
8:'女人溫柔地按住獅子的嘴，不是壓制，是馴服——真正的力量是溫柔的',
9:'山頂上的老人提著一盞燈，照亮的不是路而是腳下這一步',
10:'巨輪在轉，頂上的人馬上要被甩下去，底下的人正在爬上來',
11:'一手天秤一手劍，眼睛直視前方——她不看你的感受，她看事實',
12:'一個人倒掛在樹上，但臉上發光——他放棄了掙扎，反而看見了什麼',
13:'骷髏騎士騎黑馬走過，前方有人倒下有人跪，但遠處有日出',
14:'天使一腳踩水一腳踩地，兩個杯之間的水來回流——不急，在調配',
15:'巨大的惡魔下面，一男一女脖子上掛著鏈子——但鏈子很鬆，他們可以自己拿掉',
16:'閃電劈中塔頂，兩個人正在墜落——不是結束，是你一直逃避的那件事炸開了',
17:'裸身的女人跪在水邊，一手把水倒回池裡一手倒在地上——她在滋養，不在收穫',
18:'兩隻狗對著月亮叫，一條路在中間蜿蜒消失——你看不清前面，但路在',
19:'小孩騎在白馬上笑，背後是巨大的太陽——最簡單的快樂，沒有條件的',
20:'天使吹號角，棺材裡的人站起來張開雙手——過去的結束了，你可以重新開始',
21:'花環裡面跳舞的人，四角各有一個守護——你已經走完一整圈了',
22:'雲中伸出的手握著一根發芽的棍——給你一個新的開始，接不接看你',
23:'站在城牆上的人手持地球看遠方——你有兩條路，選了一條就回不去',
24:'背對你看著海面的人，三根杖插在身後——你在等，等一個你不確定會不會來的東西',
25:'四根杖搭成門，門下兩人在慶祝——你穩下來了，這是你建起來的東西',
26:'五個人各拿一根杖亂打——不是生死之戰，是搶位置、搶話語權的混亂',
27:'騎馬的人頭戴花冠被歡呼——你贏了這一局，但別忘了是誰在推你',
28:'一個人站在高處拿杖頂住下面六根杖——你在撐，一個人頂著所有壓力',
29:'八根杖從天上飛過來快到地面——事情加速了，你來不及想就要接',
30:'受傷的人扶著杖防守，身後八根杖排成牆——你已經很累了但還沒放手',
31:'扛著十根杖的人彎著腰走向城鎮——你把所有責任都扛在自己身上',
32:'年輕人好奇地看著杖頂端冒出的嫩葉——剛開始，什麼都新鮮',
33:'騎馬全速衝刺的騎士，杖前傾像長矛——他不想等，他要現在就出發',
34:'手持向日葵和杖的女人，黑貓在腳邊——她溫暖但有主見，不好惹',
35:'王座上的國王握著杖，斗篷上繡著火蜥蜴——他有能力也有脾氣',
36:'雲中伸出手托著溢出來的杯，鴿子銜著聖餅飛來——情感上新的可能，滿出來的那種',
37:'一男一女舉杯面對面，中間有翅膀的獅子頭——你們之間有東西在流動',
38:'三個女人舉杯跳舞——你們之間有值得慶祝的事，不要只看問題',
39:'坐在樹下的人看著面前三個杯，視而不見——你擁有的比你以為的多，但你在看別的',
40:'穿黑斗篷的人看著三個翻倒的杯——你在為失去的難過，但身後還有兩個是好的',
41:'花園裡小孩把花遞給另一個小孩，六個杯裡插滿花——回到最單純的時候，那個記憶在保護你',
42:'七個杯浮在雲裡，裝著城堡、珠寶、蛇、面具——每一個都很誘人，但沒有一個是真的',
43:'月光下一個人默默走開，身後八個杯排成一列——你心裡已經決定了，只是還沒跟別人說',
44:'雙手抱胸的人坐在那裡笑，身後架上九個杯——你值得對現在的自己滿意',
45:'彩虹下一家人手牽手，十個杯在天空排成弧——這就是完整，不多不少',
46:'年輕人盯著杯裡游出的魚，若有所思——有個感覺還不確定是什麼，但它是真的',
47:'騎馬緩行的騎士穩穩端著杯——他不急，因為他知道急了會灑',
48:'水邊的女人注視手中的杯——她看得很深，感受力強到有時候是負擔',
49:'海面浮台上的國王手持大杯，身邊有魚跳——他的情感很深但他不表露',
50:'雲中伸出手握著一把劍，劍尖頂著金冠——清醒的真相，可能會痛',
51:'蒙眼的女人雙手各持一劍交叉胸前——你不想看，因為看了就要選',
52:'三把劍刺穿一顆紅心，外面在下雨——心痛是真的，但不是永遠的',
53:'雙手合十躺在石棺上，三把劍掛在牆上——你需要停下來，不是放棄而是恢復',
54:'一人撿走地上的劍得意地看著，兩人低頭走開——有人贏了但贏得不光彩',
55:'小船載著母子過河，六把劍立在船上——你在離開一個地方，帶著傷但在走',
56:'一個人偷偷搬走五把劍，回頭看營地——你覺得需要用策略，但代價是信任',
57:'被綁住蒙眼的人站在八把劍中間——你覺得被困住了但其實綁你的不是別人',
58:'坐在床上雙手掩面的人，牆上九把劍——凌晨三點的焦慮，想太多睡不著',
59:'趴在地上的人背上十把劍——到底了，最壞的已經發生了，但你還在',
60:'年輕人單手舉劍看天，風吹亂頭髮——準備好了但還不知道要面對什麼',
61:'全速衝刺的騎士劍高舉——他不考慮後果，先衝再說',
62:'一手持劍一手伸出的女王，雲遮住半邊天——她看穿了你，但她願不願意講是另一回事',
63:'正面端坐的國王直視你持劍——他的判斷不帶感情，公正但冷',
64:'雲中伸出手托著一個金幣，下面花園盛開——物質上新的機會，種子剛落地',
65:'一個人雙手各持一個金幣像在雜耍，遠處有船——你在兩件事之間來回，怕顧不了',
66:'教堂裡三個人看著藍圖一起工作——合作，但各有分工，重點是做出來',
67:'一個人抱著金幣蹲在地上，頭頂一個腳下兩個——你抓得很緊因為你怕失去',
68:'暴風雪裡兩個衣衫襤褸的人走過教堂窗下——最難的時候，但幫助其實就在旁邊',
69:'拿天秤秤金幣的人分給跪著的人——你在決定給多少、留多少',
70:'靠在鋤頭上的農夫看著灌木上的果實——你已經種下了，現在只能等它長',
71:'工匠在桌前認真刻金幣，完成的掛在旁邊——一件一件做，急不得',
72:'花園裡的貴婦被葡萄藤環繞，鳥停在手上——你有足夠了，享受吧',
73:'大家族在拱門下，老人身邊有狗和小孩——這不是一個人的成功，是傳承',
74:'年輕人雙手捧著金幣端詳，站在綠地上——認真學習，還在摸索但態度對了',
75:'騎黑馬不動的騎士手持金幣審視——他不急著動，他在等最好的時機才出手',
76:'坐在花園的女王膝上放著大金幣——她什麼都有但她不炫耀，因為安全感是內在的',
77:'葡萄藤王座上的國王身邊堆滿金幣——他不需要再證明什麼，他就是結果本身'
};
TAROT.forEach(function(c){ if(SC[c.id]!=null) c.sc=SC[c.id]; });
})();

// ===== [UPGRADE: TAROT DEEP ANALYSIS START] =====

// ═══════════════════════════════════════════════════════════════
// 一、升級塔羅牌資料結構 — 22 大牌完整擴充 + 小牌 fallback
// ═══════════════════════════════════════════════════════════════

var TAROT_DEEP = {};

// ── 22 張大牌完整擴充 ──
TAROT_DEEP[0] = { // 愚者
  coreUp:'純粹的起始能量，不帶框架的可能性',coreRv:'逃避現實的衝動，偽裝的天真',
  psycheUp:'內心渴望自由與冒險，不怕未知',psycheRv:'用「隨性」掩蓋害怕負責的焦慮',
  eventUp:'突然的旅行、跳槽、搬家；意料之外的轉折',eventRv:'草率決定導致損失，忽視警示信號',
  loveUp:'新鮮的吸引力，還沒定義的關係，享受曖昧',loveRv:'不願承諾，逃避關係定義',
  careerUp:'新領域嘗試，創業衝動，不按牌理出牌反而成功',careerRv:'頻繁跳槽沒累積，缺乏職涯規劃',
  wealthUp:'意外之財或新收入管道出現',wealthRv:'衝動消費，財務上冒險過頭',
  healthUp:'精力充沛但容易忽略細節',healthRv:'忽視身體警訊，作息不規律',
  adviceUp:'放膽去做，但至少帶一張地圖',adviceRv:'停下來想清楚再走，別用衝動代替勇氣',
  riskUp:'過度樂觀低估困難',riskRv:'真的在懸崖邊了還不自知',
  timeUp:'快，說走就走',timeRv:'反覆，走走停停沒方向',
  personUp:'天真有魅力的冒險者',personRv:'不可靠的空想家'
};
TAROT_DEEP[1] = { // 魔術師
  coreUp:'你已經擁有所有需要的工具，問題只在於要不要動手',coreRv:'有能力但沒發揮，或者在用能力操控別人',
  psycheUp:'高度自信，相信自己能創造結果',psycheRv:'自我懷疑與自我欺騙並存',
  eventUp:'談判成功、簽約、啟動計畫的時機',eventRv:'被騙、資訊不對稱、溝通失誤',
  loveUp:'主動出擊有魅力，能說服對方',loveRv:'花言巧語、不誠實的追求者',
  careerUp:'全能型表現，獨立完成重要專案',careerRv:'光說不練，技術未到位就吹牛',
  wealthUp:'靠實力賺錢，投資判斷精準',wealthRv:'被詐騙或投資陷阱',
  healthUp:'身心協調，自我調節能力強',healthRv:'忽視健康問題，覺得自己撐得住',
  adviceUp:'拿出你的本事，現在就是時候',adviceRv:'先確認資訊是否正確，別被表象誤導',
  riskUp:'過於自信導致疏忽',riskRv:'被人利用而不自覺',
  timeUp:'快速推進，效率高',timeRv:'延遲，因為準備不足',
  personUp:'聰明能幹的操盤手',personRv:'油嘴滑舌的投機者'
};
TAROT_DEEP[2] = { // 女祭司
  coreUp:'答案在你內心深處，不需要外求',coreRv:'直覺被理性壓制，或刻意忽略內在聲音',
  psycheUp:'敏銳的第六感，潛意識正在給你訊號',psycheRv:'封閉內心，不願面對深層感受',
  eventUp:'等待中的消息即將明朗，但不是現在',eventRv:'秘密被揭發，隱藏的事情浮出水面',
  loveUp:'對方有好感但還沒說出口，需要耐心',loveRv:'對方在隱瞞什麼，或你自己不願面對真實感受',
  careerUp:'適合觀察與研究，不急著下決定',careerRv:'資訊不透明，有人在暗中操作',
  wealthUp:'耐心等待好時機，不要急進',wealthRv:'財務上有隱藏的風險沒被發現',
  healthUp:'需要關注情緒和心理健康',healthRv:'壓抑情緒導致身心失調',
  adviceUp:'相信你的直覺，保持耐心',adviceRv:'打開心房，面對你一直在迴避的事',
  riskUp:'等太久錯過時機',riskRv:'自我欺騙，不願看清現實',
  timeUp:'慢，需要等待時機成熟',timeRv:'延遲，但原因來自你自己的封閉',
  personUp:'直覺敏銳的智者',personRv:'冷漠疏離的旁觀者'
};
TAROT_DEEP[3] = { // 皇后
  coreUp:'豐盛、滋養與創造力的巔峰',coreRv:'過度付出到失去自我，或缺乏自我照顧',
  psycheUp:'溫暖充實，享受當下的狀態',psycheRv:'情感依賴，用付出換取被需要感',
  eventUp:'收穫期到來，計畫開花結果',eventRv:'停滯不前，過度放縱影響進展',
  loveUp:'關係進入穩定甜蜜期，可能有好消息',loveRv:'在關係中失去自我，過度遷就對方',
  careerUp:'創意爆發期，適合藝術設計類發展',careerRv:'工作上缺乏動力，享樂主義影響表現',
  wealthUp:'財務豐收，被動收入增長',wealthRv:'花費過度，享受先於儲蓄',
  healthUp:'身體狀態好，適合備孕或調養',healthRv:'飲食不節制，需注意體重和消化',
  adviceUp:'好好享受成果，同時記得分享',adviceRv:'重新找回自我邊界，不是所有事都該你扛',
  riskUp:'安逸導致怠惰',riskRv:'被情感綁架，做不理性的決定',
  timeUp:'自然成熟的節奏，不急',timeRv:'因為不願行動而拖延',
  personUp:'溫暖大方的照顧者',personRv:'控制欲強的「為你好」型人物'
};
TAROT_DEEP[4] = { // 皇帝
  coreUp:'你需要紀律、結構和明確的規劃來穩住局面',coreRv:'過度控制或結構崩塌，規則不再有效',
  psycheUp:'理性掌控、有安全感、清楚目標',psycheRv:'內心焦慮失控，用權威掩蓋恐懼',
  eventUp:'升遷、取得主導權、談判勝出',eventRv:'權力鬥爭失利，被上級壓制',
  loveUp:'關係中建立穩定承諾和安全感',loveRv:'太霸道讓對方窒息，缺乏柔軟度',
  careerUp:'適合領導和管理角色，組織架構清晰',careerRv:'管太多、放不了手，團隊被壓得喘不過氣',
  wealthUp:'財務管理有方，資產穩健增值',wealthRv:'投資決策太僵化，錯失新趨勢',
  healthUp:'自律的生活習慣帶來好體質',healthRv:'壓力太大，需注意心血管和肩頸',
  adviceUp:'立好規矩，然後嚴格執行',adviceRv:'學會放手和信任，不是所有事都得你來決定',
  riskUp:'變成獨裁者而不自知',riskRv:'失去控制權後的崩潰',
  timeUp:'按計畫推進，不快不慢',timeRv:'因為僵化而延遲調整',
  personUp:'可靠有擔當的領導者',personRv:'高壓獨斷的控制狂'
};
TAROT_DEEP[5] = { // 教皇
  coreUp:'體制內的智慧、遵循已驗證的路徑',coreRv:'教條束縛，需要打破常規',
  psycheUp:'尋求指引和歸屬感，願意聽從建議',psycheRv:'盲從權威或反叛一切規範',
  eventUp:'向專家請教、進修學習、加入組織或社群',eventRv:'與體制衝突、被傳統規則卡住',
  loveUp:'穩定的承諾型關係，可能與宗教或家庭傳統有關',loveRv:'道德束縛讓感情無法自由表達',
  careerUp:'適合在大組織發展，拜師學藝有回報',careerRv:'職場文化壓抑創意，需要突破框架',
  wealthUp:'穩健保守的理財方式更適合你',wealthRv:'太保守錯失機會，需要適度冒險',
  healthUp:'身心靈整合的養生方式有效',healthRv:'忽視身體在意精神修行，或反之',
  adviceUp:'找一個有經驗的人請教，不要自己硬撐',adviceRv:'別被「應該怎樣」綁住，走出自己的路',
  riskUp:'太依賴他人意見失去主見',riskRv:'過度叛逆反而繞遠路',
  timeUp:'按部就班，循序漸進',timeRv:'卡在觀念轉換上而延誤',
  personUp:'值得信賴的導師或前輩',personRv:'說教又迂腐的老古板'
};
TAROT_DEEP[6] = { // 戀人
  coreUp:'重要的選擇來了——不只是愛情，是價值觀的抉擇',coreRv:'價值觀衝突讓你無法做出決定',
  psycheUp:'渴望深度連結，願意為了愛做出取捨',psycheRv:'害怕選擇就意味著失去，所以拖延',
  eventUp:'告白、結婚、重大合作簽約',eventRv:'分手、拆夥、核心價值不合導致決裂',
  loveUp:'真愛降臨或關係進入更深層次',loveRv:'三角關係或無法在兩個對象間選擇',
  careerUp:'找到與你價值觀一致的團隊或事業',careerRv:'職涯選擇讓你左右為難',
  wealthUp:'合夥投資可行，前提是理念一致',wealthRv:'因為價值觀不合導致金錢糾紛',
  healthUp:'身心和諧，找到適合自己的養生方式',healthRv:'內心衝突影響身體，需要做出取捨',
  adviceUp:'跟著你的心走，但確認那是愛不是慾',adviceRv:'先釐清你真正要什麼，再做選擇',
  riskUp:'因為感情影響判斷',riskRv:'猶豫太久兩邊都失去',
  timeUp:'關鍵時刻，需要立刻決定',timeRv:'因為無法決定而反覆拖延',
  personUp:'與你靈魂契合的人',personRv:'讓你陷入選擇困難的對象'
};
TAROT_DEEP[7] = { // 戰車
  coreUp:'靠意志力硬衝過關，不是靠運氣而是靠決心',coreRv:'失去方向感，意志力用錯地方',
  psycheUp:'鬥志高昂，非贏不可的決心',psycheRv:'外強中乾，控制不住自己的情緒',
  eventUp:'順利推進計畫、考試通過、搬遷成功',eventRv:'計畫失控、方向迷失、進退兩難',
  loveUp:'主動追求成功，感情快速推進',loveRv:'感情中太強勢，或方向不一致',
  careerUp:'勢如破竹地完成目標，升遷在望',careerRv:'工作方向不明，忙但沒成果',
  wealthUp:'積極理財獲利，投資判斷準確',wealthRv:'方向錯誤導致資金流失',
  healthUp:'運動和積極態度讓身體變好',healthRv:'過度勞累，身體被意志力透支',
  adviceUp:'現在就衝，猶豫就輸了',adviceRv:'先停下來重新校準方向，不是跑得快就有用',
  riskUp:'用蠻力代替策略',riskRv:'失控後的連環崩塌',
  timeUp:'快速推進，短期見效',timeRv:'因為失控而時程全亂',
  personUp:'有決心有執行力的戰士',personRv:'橫衝直撞不看路的莽夫'
};
TAROT_DEEP[8] = { // 力量
  coreUp:'真正的力量來自內在的平靜和耐心',coreRv:'內在力量不足，被恐懼和衝動控制',
  psycheUp:'溫柔而堅定，知道該在什麼時候出手',psycheRv:'自我懷疑侵蝕信心，無法面對挑戰',
  eventUp:'用智慧而非蠻力解決困難，化敵為友',eventRv:'壓不住場面，內在焦慮外溢',
  loveUp:'用包容和理解經營關係，以柔克剛',loveRv:'缺乏安全感，在關係中退縮',
  careerUp:'耐心處理棘手問題，贏得尊重',careerRv:'缺乏自信，不敢爭取應得的',
  wealthUp:'長期穩健投資勝過短線操作',wealthRv:'因為恐懼而不敢投資',
  healthUp:'身心強韌，恢復力好',healthRv:'精神力不足，容易被壓力擊垮',
  adviceUp:'溫柔但堅定地堅持，急不來',adviceRv:'找回你的自信，你比你以為的更強',
  riskUp:'太耐心等待反而錯過時機',riskRv:'崩潰時的反彈傷人傷己',
  timeUp:'穩定持續，不急但有進展',timeRv:'因自信不足而停滯',
  personUp:'有智慧的柔軟強者',personRv:'外表堅強但內心脆弱的人'
};
TAROT_DEEP[9] = { // 隱者
  coreUp:'你需要獨處來找到答案，外界的聲音太吵',coreRv:'孤立過頭失去連結，或用孤獨逃避面對',
  psycheUp:'深度內省中，離答案很近了',psycheRv:'害怕孤獨但又不願開放自己',
  eventUp:'休息、退修、獨立研究有突破',eventRv:'被社會孤立、被遺忘、脫節',
  loveUp:'需要空間思考感情，暫時不要急',loveRv:'在感情中過度封閉，對方感覺被拒絕',
  careerUp:'獨立作業效率最高，專業研究有成果',careerRv:'與團隊脫節，被邊緣化',
  wealthUp:'保守觀望是明智之舉',wealthRv:'與市場脫節，錯失資訊',
  healthUp:'靜養修復，減少社交消耗',healthRv:'孤獨導致情緒低落，注意心理健康',
  adviceUp:'給自己安靜的時間，答案在獨處中浮現',adviceRv:'獨處夠了，是時候重新連結',
  riskUp:'隱退太久錯過機會',riskRv:'用孤獨懲罰自己',
  timeUp:'慢，需要沉澱',timeRv:'拖延，因為不願面對',
  personUp:'有深度的思考者',personRv:'退縮到角落的逃避者'
};
TAROT_DEEP[10] = { // 命運之輪
  coreUp:'命運的齒輪轉動中，順勢而為就好',coreRv:'逆風期，但記住輪子會轉回來',
  psycheUp:'接受無常，相信命運的安排',psycheRv:'覺得倒楣、抱怨運氣差',
  eventUp:'轉折點到來，升遷搬遷轉型等大變動',eventRv:'計畫被打亂，突發狀況打斷節奏',
  loveUp:'緣分到了，命中注定的相遇',loveRv:'感情遇到瓶頸，需要耐心等待轉機',
  careerUp:'事業轉折點，把握機會就上去了',careerRv:'事業低谷，但不會永遠',
  wealthUp:'財運轉好，投資時機到',wealthRv:'財運下滑，守住不要擴張',
  healthUp:'身體好轉期，堅持保養',healthRv:'舊疾復發或體能下降，但可控',
  adviceUp:'大膽順勢而為，這是你的時機',adviceRv:'低谷期就低頭走，保存實力等翻盤',
  riskUp:'好運不會永遠，別得意忘形',riskRv:'因為悲觀放棄在黎明前',
  timeUp:'變化快速，抓住就是你的',timeRv:'暫時停滯，但周期會轉',
  personUp:'幸運兒',personRv:'暫時走背運的人'
};
TAROT_DEEP[11] = { // 正義
  coreUp:'因果報應、公正的結果即將到來',coreRv:'不公平的待遇，或你自己在逃避後果',
  psycheUp:'清楚是非對錯，準備好接受真相',psycheRv:'內心有愧，知道自己做了不該做的',
  eventUp:'法律訴訟有利、合約簽訂、公正的裁決',eventRv:'吃虧、被冤枉、合約糾紛',
  loveUp:'感情中需要公平對待彼此',loveRv:'感情中有人在逃避責任',
  careerUp:'努力被公正評價，該升的會升',careerRv:'職場不公，需要據理力爭',
  wealthUp:'投資回報與努力成正比',wealthRv:'財務糾紛或不合理的損失',
  healthUp:'找到病因，對症下藥',healthRv:'誤診或忽略根本原因',
  adviceUp:'做對的事，結果自然來',adviceRv:'面對你一直在迴避的後果',
  riskUp:'太堅持原則變成不近人情',riskRv:'不願承認錯誤導致更大損失',
  timeUp:'結果明確，不拖泥帶水',timeRv:'拖延是因為不願面對真相',
  personUp:'公正客觀的裁判者',personRv:'逃避責任的人'
};
TAROT_DEEP[12] = { // 吊人
  coreUp:'需要暫停、犧牲小我、換個角度看世界',coreRv:'無意義的犧牲，拖延不決',
  psycheUp:'臣服的智慧——不是放棄而是換視角',psycheRv:'覺得自己是受害者，陷入自憐',
  eventUp:'等待期、投入期，眼前沒進展但在積蓄能量',eventRv:'一直拖延不做決定，原地空轉',
  loveUp:'為感情做出犧牲是值得的，但要有底線',loveRv:'不值得的犧牲，對方不知道你的付出',
  careerUp:'暫時忍耐會有回報，轉換思維找到新方向',careerRv:'工作毫無進展，但你也沒在找出路',
  wealthUp:'投資需要時間，現在看不到回報但別急',wealthRv:'金錢被拖住，流動性出問題',
  healthUp:'暫停高強度活動，休息是為了走更遠',healthRv:'因為拖延就醫導致問題惡化',
  adviceUp:'放下執念，退一步海闊天空',adviceRv:'停止無意義的等待，該行動了',
  riskUp:'犧牲過度失去自我',riskRv:'拖延到問題不可收拾',
  timeUp:'延遲，但有價值的等待',timeRv:'無盡的拖延，沒有出口',
  personUp:'願意為大局犧牲的理想主義者',personRv:'逃避現實的拖延症患者'
};
TAROT_DEEP[13] = { // 死神
  coreUp:'一個階段徹底結束，為新的開始騰出空間',coreRv:'死死抓住過去不放，新的進不來',
  psycheUp:'已經準備好放手，接受轉變',psycheRv:'恐懼改變，明知要走卻不敢',
  eventUp:'離職、分手、搬家、結束長期項目——痛但必要',eventRv:'該結束的不結束，耗在那裡',
  loveUp:'舊的感情模式死去，重生為更成熟的愛',loveRv:'分不了的手，走不出的舊愛',
  careerUp:'職涯重大轉型，破釜沉舟',careerRv:'想轉職但害怕，結果什麼都沒改變',
  wealthUp:'舊的收入來源結束，新的財源開啟',wealthRv:'不願止損，繼續投資已經沒希望的項目',
  healthUp:'舊的不良習慣被根除，身體重啟',healthRv:'不願改變生活方式，健康持續惡化',
  adviceUp:'勇敢斷捨離，結束才能重生',adviceRv:'你在害怕什麼？那個東西早就該結束了',
  riskUp:'結束得太徹底燒了橋',riskRv:'拖到腐爛才不得不面對',
  timeUp:'快速而決絕的轉變',timeRv:'漫長的抗拒期，最終還是得面對',
  personUp:'帶來轉機的終結者',personRv:'活在過去的人'
};
TAROT_DEEP[14] = { // 節制
  coreUp:'調和、中庸、平衡各方力量',coreRv:'失衡，走極端，缺乏自制',
  psycheUp:'內心平和，知道如何取捨',psycheRv:'情緒失控或過度壓抑，找不到中間值',
  eventUp:'協調成功、跨部門合作順利、找到妥協點',eventRv:'各方失衡導致衝突升級',
  loveUp:'關係中找到平衡，互相遷就配合',loveRv:'付出不對等，一方總在忍耐',
  careerUp:'工作與生活平衡，跨領域整合有成果',careerRv:'什麼都想要結果什麼都做不好',
  wealthUp:'收支平衡，理性理財',wealthRv:'花得比賺的多，或賺錢犧牲太多',
  healthUp:'身心靈達到平衡狀態',healthRv:'作息失調，需要重新建立規律',
  adviceUp:'凡事求中庸，過與不及都不好',adviceRv:'先穩住最失衡的那一塊',
  riskUp:'太追求平衡變成鄉愿',riskRv:'失控時的反彈很劇烈',
  timeUp:'穩定推進，不急不緩',timeRv:'因為失衡而時快時慢',
  personUp:'和平的協調者',personRv:'搖擺不定的人'
};
TAROT_DEEP[15] = { // 惡魔
  coreUp:'面對你的陰暗面——慾望、執念、依賴',coreRv:'掙脫束縛，重獲自由',
  psycheUp:'被某種執念控制但不自覺',psycheRv:'覺醒了，開始掙脫枷鎖',
  eventUp:'不健康的合約或關係讓你動彈不得',eventRv:'解約、脫離有害環境、戒掉壞習慣',
  loveUp:'慾望驅動的關係，激情但不健康',loveRv:'終於看清不健康的關係模式',
  careerUp:'被工作/金錢綁架，賣命式投入',careerRv:'離開有毒的職場環境',
  wealthUp:'為錢出賣靈魂的誘惑',wealthRv:'不再被金錢控制，重新定義價值',
  healthUp:'上癮行為（煙酒手機賭博）影響健康',healthRv:'成功戒斷或走出不健康循環',
  adviceUp:'承認你被什麼綁住了，才能開始解脫',adviceRv:'你已經知道該離開了，去做就對了',
  riskUp:'沉溺太深無法自拔',riskRv:'脫離後的空虛感讓你又回去',
  timeUp:'陷入循環，時間感扭曲',timeRv:'斷開的瞬間，時間重新流動',
  personUp:'誘惑者或讓你上癮的人',personRv:'幫你醒過來的人'
};
TAROT_DEEP[16] = { // 塔
  coreUp:'無法預防的崩塌——但舊的不去新的不來',coreRv:'險些崩塌但化解了，或拒絕面對已經搖搖欲墜的結構',
  psycheUp:'震驚但也有如釋重負的感覺',psycheRv:'恐懼崩潰，用盡全力維持假象',
  eventUp:'突然失業、分手、搬家、爆料——劇烈變動',eventRv:'危機被延後但沒消失，遲早還是要面對',
  loveUp:'感情中的謊言或假象被戳破',loveRv:'勉強維持的關係在搖搖欲墜',
  careerUp:'組織重整、被裁員、但給你重新開始的機會',careerRv:'明知組織有問題但不願面對',
  wealthUp:'重大財務損失，但觸底後可以重建',wealthRv:'財務危機被暫時壓住但根本問題沒解決',
  healthUp:'突發健康問題需要立即處理',healthRv:'身體已經在警告你了，不要忽視',
  adviceUp:'接受這個崩塌，它是在幫你清場',adviceRv:'那棟搖搖欲墜的塔，不如你自己先拆了它',
  riskUp:'在混亂中做出後悔的決定',riskRv:'繼續撐只會讓崩塌更劇烈',
  timeUp:'突然而猛烈，毫無預警',timeRv:'拖延崩塌的時間點，但擋不住',
  personUp:'帶來劇變的人或事件',personRv:'一直在維持假象的人'
};
TAROT_DEEP[17] = { // 星星
  coreUp:'暴風雨過後的希望之光，療癒正在發生',coreRv:'失去信心，看不到希望',
  psycheUp:'內心平靜，重新連結上希望和方向',psycheRv:'對未來感到絕望，覺得一切沒有意義',
  eventUp:'康復、和解、收到好消息、靈感湧現',eventRv:'希望落空，期待的事情沒有發生',
  loveUp:'感情中重新燃起希望，心靈連結深化',loveRv:'對感情失去信心',
  careerUp:'新的職涯方向出現，靈感帶來機會',careerRv:'職涯迷茫期，找不到方向',
  wealthUp:'長期投資開始看到回報',wealthRv:'財務希望破滅，需要重新規劃',
  healthUp:'身心療癒中，漸入佳境',healthRv:'治療效果不如預期，但不要放棄',
  adviceUp:'保持希望，你走的方向是對的',adviceRv:'允許自己脆弱，然後重新找到那顆星',
  riskUp:'太樂觀忽略現實細節',riskRv:'悲觀到不願行動',
  timeUp:'慢慢好轉中，持續即可',timeRv:'復原需要比預期更長的時間',
  personUp:'帶來希望和療癒的人',personRv:'讓你失望的人'
};
TAROT_DEEP[18] = { // 月亮
  coreUp:'迷霧中前行，直覺是你唯一的嚮導',coreRv:'迷霧散去，看清楚了',
  psycheUp:'恐懼和不安都是幻覺，但感覺很真實',psycheRv:'終於分清現實和幻想',
  eventUp:'被欺騙、資訊不透明、隱藏的敵人',eventRv:'真相大白，謊言被揭穿',
  loveUp:'感情中有隱瞞或不確定性，需要勇氣面對',loveRv:'看清對方的真面目',
  careerUp:'職場有潛規則或隱藏的變數',careerRv:'終於看清職場真相',
  wealthUp:'財務上有隱藏的風險，不要被表象迷惑',wealthRv:'看清投資的真實狀況',
  healthUp:'心理健康需要特別關注，失眠焦慮',healthRv:'心理壓力開始釋放',
  adviceUp:'相信你的直覺，但不要被恐懼控制',adviceRv:'真相已經在眼前了，接受它',
  riskUp:'被幻覺和恐懼控制做出錯誤判斷',riskRv:'看清真相後的打擊',
  timeUp:'不確定性高，時間感模糊',timeRv:'迷霧散去後節奏回歸正常',
  personUp:'不可信任的人，或正在焦慮的你自己',personRv:'揭開面紗的真相揭露者'
};
TAROT_DEEP[19] = { // 太陽
  coreUp:'一切明朗化，成功與喜悅的能量',coreRv:'光芒暫時被遮住，但不會太久',
  psycheUp:'自信滿溢，充滿正面能量',psycheRv:'短暫的自我懷疑，但底子是好的',
  eventUp:'考試通過、升遷、表白成功、好消息到來',eventRv:'好消息延遲到來，但不是不來',
  loveUp:'感情光明正大，甜蜜幸福',loveRv:'感情有小陰霾但會過去',
  careerUp:'事業巔峰期，被看見被認可',careerRv:'成功來得慢一些但不會缺席',
  wealthUp:'財運亨通，投資獲利',wealthRv:'財運稍有延遲但方向正確',
  healthUp:'身體狀況極佳，精力旺盛',healthRv:'需要多曬太陽多運動，別窩著',
  adviceUp:'放心去做，現在是你的主場',adviceRv:'陰霾是暫時的，保持信心',
  riskUp:'太順利導致疏忽',riskRv:'因小挫折過度反應',
  timeUp:'快速明確，陽光普照',timeRv:'稍有延遲但光明可期',
  personUp:'帶來歡樂和成功的人',personRv:'暫時消沉但本質積極的人'
};
TAROT_DEEP[20] = { // 審判
  coreUp:'靈魂的覺醒，重新評估過去的一切',coreRv:'拒絕成長，逃避靈魂的召喚',
  psycheUp:'深度的自我反省帶來蛻變',psycheRv:'知道該改變但不願意',
  eventUp:'被召喚做出重大改變，人生的2.0版本啟動',eventRv:'錯過了蛻變的機會窗口',
  loveUp:'感情進入更成熟的階段，靈魂層面的連結',loveRv:'不願成長讓感情退化',
  careerUp:'職涯重新定位，找到真正的使命',careerRv:'不敢轉型，錯過升級機會',
  wealthUp:'財務觀念徹底升級',wealthRv:'舊的理財方式需要改變但你不肯',
  healthUp:'舊疾痊癒或找到根本解方',healthRv:'不願改變導致健康問題重複',
  adviceUp:'聽從內心深處的呼喚，勇敢蛻變',adviceRv:'再不改變就來不及了',
  riskUp:'過度自省變成自我苛責',riskRv:'錯過覺醒的時機',
  timeUp:'關鍵轉折點，現在就是',timeRv:'窗口正在關閉',
  personUp:'帶來覺醒的催化者',personRv:'拒絕改變的舊我'
};
TAROT_DEEP[21] = { // 世界
  coreUp:'完成、圓滿、一個完整的循環結束',coreRv:'還差最後一步，或無法放下去進入下一個循環',
  psycheUp:'深度的成就感和圓滿感',psycheRv:'覺得自己永遠都不夠好',
  eventUp:'畢業、完成大項目、達成人生目標',eventRv:'最後衝刺的卡關，功虧一簣',
  loveUp:'感情走到圓滿，或預備好進入下一階段',loveRv:'感情差一步到位但卡住了',
  careerUp:'事業目標達成，階段性成功',careerRv:'工作總是差一點完美',
  wealthUp:'財務目標達成，豐收期',wealthRv:'差一步達標，需要最後的堅持',
  healthUp:'身心俱佳，最好的狀態',healthRv:'治療還需要一段時間才能痊癒',
  adviceUp:'好好慶祝，然後準備迎接下一個旅程',adviceRv:'找出那最後一塊拼圖，補上它',
  riskUp:'完成後的空虛感',riskRv:'完美主義阻礙你收尾',
  timeUp:'完成，到了收尾的時刻',timeRv:'快了但還沒完全到位',
  personUp:'功成名就的人',personRv:'差一步到位的人'
};

// ── 小牌 fallback 生成系統 ──
function _getMinorDeep(card){
  if(TAROT_DEEP[card.id]) return TAROT_DEEP[card.id];
  const id=card.id;
  if(id<22) return {}; // should not happen
  const suitIdx=Math.floor((id-22)/14);
  const rank=(id-22)%14; // 0=Ace, 1-9=numbered, 10=Page, 11=Knight, 12=Queen, 13=King
  const suits=['權杖','聖杯','寶劍','金幣'];
  const suitEl=['火','水','風','土'];
  const suitTheme={
    0:{core:'行動/意志/熱情/創造',psyche:'衝勁',event:'新計畫',love:'主動追求',career:'創業衝刺',wealth:'積極投資',health:'運動活力',time:'快速'},
    1:{core:'情感/直覺/關係/潛意識',psyche:'感受',event:'情感事件',love:'心靈連結',career:'人際合作',wealth:'直覺判斷',health:'情緒調節',time:'隨緣'},
    2:{core:'思維/衝突/真相/壓力',psyche:'焦慮',event:'衝突決斷',love:'溝通問題',career:'競爭壓力',wealth:'風險判斷',health:'壓力管理',time:'急迫'},
    3:{core:'物質/現實/穩定/資源',psyche:'安全感',event:'財務變動',love:'物質基礎',career:'穩定發展',wealth:'實際收支',health:'身體保養',time:'穩步'}
  };
  const st=suitTheme[suitIdx];
  const isCourt=rank>=10;
  const courtType={10:'學習者',11:'行動者',12:'滋養者',13:'掌權者'};
  const numEnergy={0:'起始',1:'選擇',2:'成長',3:'穩定',4:'衝突',5:'勝利',6:'堅守',7:'速度',8:'堅持',9:'完成'};

  if(isCourt){
    const ct=courtType[rank];
    return {
      coreUp:st.core+'領域的'+ct+'，成熟且主動',coreRv:st.core+'領域的'+ct+'，不成熟或被動',
      psycheUp:'以'+st.psyche+'驅動的'+ct+'心態',psycheRv:st.psyche+'失控的'+ct,
      eventUp:st.event+'中出現'+ct+'型人物',eventRv:st.event+'中的'+ct+'帶來問題',
      loveUp:st.love+'中遇到'+ct+'型對象',loveRv:st.love+'中的'+ct+'造成困擾',
      careerUp:st.career+'中有'+ct+'型的關鍵人物',careerRv:st.career+'中的'+ct+'成為障礙',
      wealthUp:st.wealth+'中得到'+ct+'型人物幫助',wealthRv:st.wealth+'上遇到不靠譜的'+ct,
      healthUp:'身心狀態偏向'+st.health+'的積極面',healthRv:st.health+'層面需要他人協助',
      adviceUp:'學習這位'+ct+'的長處',adviceRv:'警惕這位'+ct+'的弱點',
      riskUp:'過度依賴'+ct+'的角色',riskRv:ct+'帶來的負面影響',
      timeUp:st.time,timeRv:st.time+'但受阻',
      personUp:suits[suitIdx]+'系的成熟'+ct,personRv:suits[suitIdx]+'系的不成熟'+ct
    };
  } else {
    const ne=numEnergy[rank]||'過程';
    return {
      coreUp:st.core+'的'+ne+'能量正在展開',coreRv:st.core+'的'+ne+'能量受阻或扭曲',
      psycheUp:'內心處於'+st.psyche+'的'+ne+'階段',psycheRv:st.psyche+'的'+ne+'感受被壓抑',
      eventUp:st.event+'進入'+ne+'階段',eventRv:st.event+'的'+ne+'進程受阻',
      loveUp:st.love+'進入'+ne+'階段',loveRv:st.love+'在'+ne+'環節卡住',
      careerUp:st.career+'到了'+ne+'時期',careerRv:st.career+'的'+ne+'受阻',
      wealthUp:st.wealth+'進入'+ne+'階段',wealthRv:st.wealth+'的'+ne+'受阻',
      healthUp:st.health+'正在'+ne+'中',healthRv:st.health+'的'+ne+'受阻',
      adviceUp:'把握'+ne+'的能量往前走',adviceRv:'解決'+ne+'環節的阻礙',
      riskUp:'在'+ne+'階段停留太久',riskRv:ne+'失敗帶來的退行',
      timeUp:st.time,timeRv:st.time+'但受阻',
      personUp:suits[suitIdx]+'系的'+ne+'角色',personRv:suits[suitIdx]+'系的受挫'+ne+'者'
    };
  }
}

// 取得深度資料（優先用手寫、fallback 用生成）
function getTarotDeep(card){
  return TAROT_DEEP[card.id] || _getMinorDeep(card);
}

// ══════════════════════════════════════════════════════════════════
// 問題類型牌意切換函式
// getTarotTypeMeaning(id, isUp, type) → string
// ══════════════════════════════════════════════════════════════════
function getTarotTypeMeaning(id, isUp, type){
  var card = TAROT[id];
  if(!card) return '';
  var t = type || 'general';
  if(isUp){
    if(t==='love'      && card.loveUp)     return card.loveUp;
    if(t==='career'    && card.careerUp)   return card.careerUp;
    if(t==='wealth'    && card.wealthUp)   return card.wealthUp;
    if(t==='health'    && card.healthUp)   return card.healthUp;
    if(t==='relationship' && card.loveUp)  return card.loveUp;
    if(t==='family'    && card.loveUp)     return card.loveUp;
    return card.up || '';
  } else {
    if(t==='love'      && card.loveRv)     return card.loveRv;
    if(t==='career'    && card.careerRv)   return card.careerRv;
    if(t==='wealth'    && card.wealthRv)   return card.wealthRv;
    if(t==='health'    && card.healthRv)   return card.healthRv;
    if(t==='relationship' && card.loveRv)  return card.loveRv;
    if(t==='family'    && card.loveRv)     return card.loveRv;
    return card.rv || '';
  }
}

// ══════════════════════════════════════════════════════════════════
// 塔羅統計分析函式
// buildTarotStats(drawn) → object
// ══════════════════════════════════════════════════════════════════
function buildTarotStats(drawn){
  if(!drawn||!drawn.length) return {};
  var d = drawn.slice(0,(S.tarot&&S.tarot.spreadDef&&S.tarot.spreadDef.count)||drawn.length);
  var total = d.length;

  // 花色分類
  var suits = {major:[], wand:[], cup:[], sword:[], pent:[]};
  var upCount = 0, rvCount = 0;
  var courtCount = 0;
  var numGroups = {}; // num → count

  d.forEach(function(c){
    var s = c.suit || (c.id<=21?'major': c.id<=35?'wand': c.id<=49?'cup': c.id<=63?'sword':'pent');
    suits[s].push(c);
    if(c.isUp) upCount++; else rvCount++;
    var rank = (c.id-22)%14;
    if(c.id>=22 && rank>=10) courtCount++;
    var num = c.num || (c.id<=21? c.id : (c.id-22)%14+1);
    numGroups[num] = (numGroups[num]||0)+1;
  });

  // 主導花色
  var suitCounts = {major:suits.major.length, wand:suits.wand.length, cup:suits.cup.length, sword:suits.sword.length, pent:suits.pent.length};
  var dominantSuit = Object.keys(suitCounts).reduce(function(a,b){return suitCounts[a]>=suitCounts[b]?a:b});

  // 數字群聚
  var numCluster = Object.keys(numGroups).filter(function(k){return numGroups[k]>=2;}).map(function(k){return {num:k,count:numGroups[k]};});

  // 核心牌(pos 0)與結果牌(pos 9)關係
  var coreCard = d[0], outcomeCard = d[9];
  var coreOutcomeRel = '';
  if(coreCard && outcomeCard){
    var bothMajor = coreCard.id<=21 && outcomeCard.id<=21;
    var sameSuit = coreCard.suit && outcomeCard.suit && coreCard.suit===outcomeCard.suit;
    var corePos = coreCard.isUp, outcomePos = outcomeCard.isUp;
    if(bothMajor) coreOutcomeRel = '大牌對大牌，命運層級的議題';
    else if(sameSuit) coreOutcomeRel = '同花色延伸，能量一脈相承';
    else if(corePos && outcomePos) coreOutcomeRel = '核心與結果同為正位，整體走向順暢';
    else if(!corePos && !outcomePos) coreOutcomeRel = '核心與結果同為逆位，阻礙貫穿全局';
    else if(!corePos && outcomePos) coreOutcomeRel = '從困境出發，結果有所突破';
    else coreOutcomeRel = '開頭順暢，後段出現阻力';
  }

  // 產生文字洞見
  var suitNameMap = {major:'大牌',wand:'權杖',cup:'聖杯',sword:'寶劍',pent:'金幣'};
  var insights = [];

  // 大牌比例
  var majorRatio = suits.major.length / total;
  if(majorRatio >= 0.5) insights.push('大牌出現 '+suits.major.length+' 張（'+Math.round(majorRatio*100)+'%），命運層級的力量主導全局，事件有超出個人意志的結構性因素。');
  else if(majorRatio >= 0.3) insights.push('大牌出現 '+suits.major.length+' 張，有重要的命運節點在這個議題上運作。');

  // 小牌比例洞見
  var minorRatio = 1 - majorRatio;
  if(minorRatio >= 0.8) insights.push('小牌為主（'+Math.round(minorRatio*100)+'%），這是日常生活層面的議題，靠實際行動和選擇就能改變。');

  // 主導花色
  if(suitCounts[dominantSuit] >= 4 && dominantSuit !== 'major'){
    var suitThemes = {wand:'行動力和熱情主導，靠意志和衝勁推動事情。',cup:'情感和直覺主導，感受和關係是核心。',sword:'思維和壓力主導，需先清理頭腦才能前進。',pent:'現實和物質主導，財務和穩定是決定性因素。'};
    insights.push(suitNameMap[dominantSuit]+'佔主導（'+suitCounts[dominantSuit]+'張），'+suitThemes[dominantSuit]);
  } else if(suitCounts[dominantSuit] >= 3 && dominantSuit !== 'major'){
    insights.push(suitNameMap[dominantSuit]+'有 '+suitCounts[dominantSuit]+' 張，在此次牌局中份量最重。');
  }

  // 宮廷牌比例
  if(courtCount >= 3) insights.push('宮廷牌 '+courtCount+' 張，局面中有多位關鍵人物在發揮影響，人際因素舉足輕重。');
  else if(courtCount >= 2) insights.push('宮廷牌 '+courtCount+' 張，有重要人物在這個議題中扮演關鍵角色。');

  // 正逆位比例
  var rvRatio = rvCount / total;
  if(rvRatio >= 0.7) insights.push('逆位佔 '+Math.round(rvRatio*100)+'%，整體能量受阻，內在阻礙和外在困難同時存在。');
  else if(rvRatio >= 0.5) insights.push('逆位過半，需要特別留意內在的阻礙和未解決的課題。');
  else if(rvRatio <= 0.2) insights.push('正位為主，能量流動順暢，整體走向積極。');

  // 數字群聚
  numCluster.forEach(function(nc){
    var numMeaning = {'1':'起始與創造能量重複出現，新的開端正在積累力量。','2':'選擇和平衡的課題反覆浮現，需要做出關鍵決定。','3':'成長和表達的主題貫穿全局。','4':'穩定和建設的需求是核心議題。','5':'衝突和挑戰是這個議題的主調，需要積極面對。','6':'和諧和回饋的主題在此次牌局中突出。','7':'評估和反思的能量在此反覆出現。','8':'推進和轉型的力量在積累。','9':'接近完成，但還需要最後的堅持。','10':'完成和轉化的能量在此循環。'};
    if(numMeaning[nc.num]) insights.push('數字 '+nc.num+' 出現 '+nc.count+' 次——'+numMeaning[nc.num]);
  });

  return {
    total: total,
    upCount: upCount,
    rvCount: rvCount,
    upRatio: Math.round(upCount/total*100),
    rvRatio: Math.round(rvCount/total*100),
    majorCount: suits.major.length,
    minorCount: total - suits.major.length,
    majorRatio: Math.round(majorRatio*100),
    suitCounts: suitCounts,
    dominantSuit: dominantSuit,
    dominantSuitName: suitNameMap[dominantSuit],
    courtCount: courtCount,
    numGroups: numGroups,
    numCluster: numCluster,
    coreCard: coreCard,
    outcomeCard: outcomeCard,
    coreOutcomeRel: coreOutcomeRel,
    insights: insights,
    suits: suits
  };
}

// ══════════════════════════════════════════════════════════════════
// 統計 HTML 渲染（供結果頁使用）
// buildTarotStatsHtml(drawn) → HTML string
// ══════════════════════════════════════════════════════════════════
function buildTarotStatsHtml(drawn){
  var s = buildTarotStats(drawn);
  if(!s || !s.total) return '';
  var G = 'var(--c-gold,#d4af37)';
  var html = '<div style="margin-bottom:20px">';
  html += '<div style="font-size:0.78rem;color:'+G+';font-weight:700;letter-spacing:.08em;margin-bottom:10px">📊 牌局統計分析</div>';

  // 比例條
  html += '<div style="margin-bottom:12px">';
  html += '<div style="display:flex;gap:8px;margin-bottom:6px;font-size:0.72rem;color:var(--c-text-dim,#9b8b6b)">';
  html += '<span>大牌 '+s.majorCount+'張 ('+s.majorRatio+'%)</span>';
  html += '<span>•</span><span>正位 '+s.upCount+'張 ('+s.upRatio+'%)</span>';
  html += '<span>•</span><span>宮廷 '+s.courtCount+'張</span>';
  html += '</div>';

  // 花色分布條
  var suitColors = {major:'#d4af37',wand:'#e05c2f',cup:'#4a90d9',sword:'#a0a0b8',pent:'#5aaa7a'};
  var suitNames  = {major:'大',wand:'杖',cup:'杯',sword:'劍',pent:'幣'};
  html += '<div style="display:flex;height:6px;border-radius:3px;overflow:hidden;margin-bottom:6px">';
  ['major','wand','cup','sword','pent'].forEach(function(suit){
    var pct = s.suitCounts[suit]/s.total*100;
    if(pct>0) html += '<div style="width:'+pct+'%;background:'+suitColors[suit]+'"></div>';
  });
  html += '</div>';
  html += '<div style="display:flex;gap:8px;font-size:0.68rem;color:var(--c-text-dim)">';
  ['major','wand','cup','sword','pent'].forEach(function(suit){
    if(s.suitCounts[suit]>0) html += '<span style="color:'+suitColors[suit]+'">'+suitNames[suit]+' '+s.suitCounts[suit]+'</span>';
  });
  html += '</div>';
  html += '</div>';

  // 洞見列表
  if(s.insights.length){
    html += '<div style="font-size:0.78rem;line-height:1.7">';
    s.insights.forEach(function(insight){
      html += '<div style="margin-bottom:5px;padding-left:10px;border-left:2px solid rgba(212,175,55,.3)">'+insight+'</div>';
    });
    html += '</div>';
  }

  // 核心牌與結果牌關係
  if(s.coreOutcomeRel){
    html += '<div style="margin-top:8px;font-size:0.76rem;color:var(--c-text-dim);padding:6px 10px;background:rgba(212,175,55,.05);border-radius:6px">';
    html += '⚡ 核心與結果：'+s.coreOutcomeRel;
    html += '</div>';
  }

  html += '</div>';
  return html;
}

// ══════════════════════════════════════════════════════════════════
// 凱爾特十字核心分析函式（十位置完整版）
// analyzeCelticCross(drawn, type) → object
// ══════════════════════════════════════════════════════════════════
function analyzeCelticCross(drawn, type){
  if(!drawn||drawn.length<3) return null;
  var d = drawn.slice(0,(S.tarot&&S.tarot.spreadDef&&S.tarot.spreadDef.count)||drawn.length);
  var t = type || 'general';

  function _meaning(i){
    var c = d[i];
    return getTarotTypeMeaning(c.id, c.isUp, t) || (c.isUp ? c.up : c.rv) || '';
  }
  function _ref(i){ return d[i].n + (d[i].isUp?'（正）':'（逆）'); }

  var positions = [
    {label:'現況核心',     role:'present',   desc:'你現在這件事的核心狀態', card:d[0], meaning:_meaning(0)},
    {label:'挑戰阻礙',     role:'obstacle',  desc:'橫在中間的阻礙或衝突',   card:d[1], meaning:_meaning(1)},
    {label:'潛意識根源',   role:'root',      desc:'深層動機或無意識基礎',   card:d[2], meaning:_meaning(2)},
    {label:'過去基礎',     role:'past',      desc:'影響現在的過去事件',     card:d[3], meaning:_meaning(3)},
    {label:'顯意識目標',   role:'crown',     desc:'你意識到的目標或期望',   card:d[4], meaning:_meaning(4)},
    {label:'近期發展',     role:'near',      desc:'即將發生的近期走向',     card:d[5], meaning:_meaning(5)},
    {label:'自身狀態',     role:'self',      desc:'你目前的內在狀態',       card:d[6], meaning:_meaning(6)},
    {label:'外在環境',     role:'environ',   desc:'周圍環境和他人的影響',   card:d[7], meaning:_meaning(7)},
    {label:'希望與恐懼',   role:'hope_fear', desc:'你既期待又害怕的事',     card:d[8], meaning:_meaning(8)},
    {label:'最終結果',     role:'outcome',   desc:'整體趨勢指向的結果',     card:d[9], meaning:_meaning(9)}
  ];

  // 核心局勢評估
  var coreIsUp = d[0].isUp, obstacleIsUp = d[1].isUp, outcomeIsUp = d[9].isUp;
  var overallTone = '';
  if(coreIsUp && outcomeIsUp) overallTone = '整體局勢順暢，核心能量和最終走向都指向積極發展。';
  else if(!coreIsUp && outcomeIsUp) overallTone = '雖然現況有困難，但整體走向最終有所突破。';
  else if(coreIsUp && !outcomeIsUp) overallTone = '現況尚好，但前方有阻礙，需要留意轉折。';
  else overallTone = '現況和結果都面臨挑戰，需要積極干預改變走向。';

  // 事件推進邏輯
  var progression = '由' + _ref(3) + '（過去）出發，' +
    '現況呈現' + _ref(0) + '，' +
    '近期走向' + _ref(5) + '，' +
    '最終指向' + _ref(9) + '。';

  // 主要阻礙
  var mainObstacle = _ref(1) + '是此刻最主要的阻礙。' + _meaning(1);

  // 內在心理狀態
  var innerState = '你的意識目標是' + _ref(4) + '（' + _meaning(4) + '），' +
    '但潛意識根源是' + _ref(2) + '（' + _meaning(2) + '）。' +
    '自身狀態呈現' + _ref(6) + '。';

  // 外在環境判讀
  var outerState = '外在環境的影響是' + _ref(7) + '（' + _meaning(7) + '）。' +
    '你對此事既有希望也有恐懼，主要集中在' + _ref(8) + '的能量上。';

  // 結果傾向
  var resultTendency = '最終結果牌為' + _ref(9) + '。' + _meaning(9);

  // 行動建議（來自近期發展 + 自身 + 結果）
  var actionAdvice = '';
  var dp9 = getTarotDeep(d[9]);
  if(dp9 && dp9.adviceUp && d[9].isUp) actionAdvice = dp9.adviceUp;
  else if(dp9 && dp9.adviceRv && !d[9].isUp) actionAdvice = dp9.adviceRv;
  else actionAdvice = d[9].isUp ? (TAROT[d[9].id].adviceUp||'') : (TAROT[d[9].id].adviceRv||'');
  if(!actionAdvice) actionAdvice = '根據結果牌' + _ref(9) + '的能量，順應其方向行事。';

  return {
    positions: positions,
    stats: buildTarotStats(drawn),
    overallTone: overallTone,
    progression: progression,
    mainObstacle: mainObstacle,
    innerState: innerState,
    outerState: outerState,
    resultTendency: resultTendency,
    actionAdvice: actionAdvice,
    coreCard: d[0],
    outcomeCard: d[9]
  };
}

// ═══════════════════════════════════════════════════════════════
// 二、位置語義層（凱爾特十字深度版）
// ═══════════════════════════════════════════════════════════════

var TAROT_POS_META = {
  0: {
    label:'現況核心',baseMeaning:'你現在整件事的核心狀態',
    layer:'核心',
    love:'這段感情目前的核心能量是什麼',
    career:'你事業上目前最核心的狀態',
    wealth:'你財務面目前的核心狀態',
    health:'你目前身心的核心狀態',
    general:'你目前面對的核心局勢'
  },
  1: {
    label:'阻礙／交叉',baseMeaning:'正在阻礙你或交叉影響你的力量',
    layer:'阻礙',
    love:'阻礙這段感情發展的關鍵因素',
    career:'卡住你事業進展的障礙',
    wealth:'阻礙你財運的癥結',
    health:'影響你健康的關鍵阻礙',
    general:'橫亙在你面前的核心阻力'
  },
  2: {
    label:'深層根因',baseMeaning:'推動這件事發展的底層力量或根本原因',
    layer:'根因',
    love:'這段感情走到今天的根本原因',
    career:'你走到這個職涯節點的深層驅動力',
    wealth:'你財務狀況的根本成因',
    health:'你健康問題的深層根源',
    general:'造成目前局面的根本原因'
  },
  3: {
    label:'近期過去',baseMeaning:'剛剛發生的、影響目前局面的事件或狀態',
    layer:'過去',
    love:'最近感情上發生了什麼影響現在',
    career:'最近工作上發生了什麼影響現在',
    wealth:'最近財務上發生了什麼',
    health:'最近健康上的變化',
    general:'最近發生了什麼導致現在的局面'
  },
  4: {
    label:'顯性目標',baseMeaning:'你意識層面認為自己想要的、正在追求的',
    layer:'意識',
    love:'你意識上覺得自己在感情上想要什麼',
    career:'你表面上的職涯目標',
    wealth:'你認為自己在追求的財務目標',
    health:'你覺得自己想達到的健康目標',
    general:'你意識層面在追求什麼'
  },
  5: {
    label:'近期走向',baseMeaning:'接下來最可能進入的能量或事件',
    layer:'未來',
    love:'感情接下來最可能的走向',
    career:'事業近期最可能的發展',
    wealth:'財務近期最可能出現的變化',
    health:'健康近期的走勢',
    general:'接下來最可能發生的事'
  },
  6: {
    label:'你的位置',baseMeaning:'你自己的態度、心理狀態、扮演的角色',
    layer:'自我',
    love:'你在這段感情中的態度和角色',
    career:'你自己對工作的態度和投入',
    wealth:'你的理財心態和態度',
    health:'你對自己健康的態度',
    general:'你自己在這件事中的態度'
  },
  7: {
    label:'外界／環境',baseMeaning:'外在環境、他人、對方的影響',
    layer:'外在',
    love:'對方或關係中其他人對這段感情的影響',
    career:'主管、同事、組織文化、市場環境的影響',
    wealth:'市場環境、外部經濟、資源來源的影響',
    health:'生活環境、外在壓力對你健康的影響',
    general:'外在環境和他人對你的影響'
  },
  8: {
    label:'希望與恐懼',baseMeaning:'你內心最深處的期待或最害怕的事',
    layer:'潛意識',
    love:'你對這段感情最深的期待或最害怕的事',
    career:'你對事業最深的期待或恐懼',
    wealth:'你對財務最深的期待或恐懼',
    health:'你對健康最擔心的事',
    general:'你內心最深處的期待或恐懼'
  },
  9: {
    label:'結果趨勢',baseMeaning:'按照目前軌道推演的最終走向',
    layer:'結果',
    love:'這段感情按目前軌道的最終走向',
    career:'你事業按目前方向的最終走向',
    wealth:'你財務狀況的最終趨勢',
    health:'你健康狀況的最終走向',
    general:'這件事按照目前軌道的最終走向'
  }
};


// ═══════════════════════════════════════════════════════════════
// 三、牌間互動規則引擎（每條規則可追溯到牌位×牌×欄位）
// ═══════════════════════════════════════════════════════════════

function analyzeTarotInteractions(drawn, type){
  if(!drawn||drawn.length<3) return null;
  const d=drawn.slice(0,(S.tarot&&S.tarot.spreadDef&&S.tarot.spreadDef.count)||drawn.length);
  const t=type||'general';
  const result={};

  // ── helpers ──
  function _cat(c){
    if(c.id<=21) return 'major';
    if(c.id<=35) return 'wand';
    if(c.id<=49) return 'cup';
    if(c.id<=63) return 'sword';
    return 'pent';
  }
  function _isCourt(c){ var m=c.id>=22?(c.id-22)%14:-1; return m>=10&&m<=13; }
  function _courtRank(c){ if(!_isCourt(c)) return -1; return (c.id-22)%14; }
  // 取元素（用 GD_ELEMENT_MAP 若可用，否則 fallback）
  function _el(c){ return (typeof GD_ELEMENT_MAP!=='undefined'&&GD_ELEMENT_MAP[c.el])?GD_ELEMENT_MAP[c.el]:(c.el==='火'?'fire':c.el==='水'?'water':c.el==='風'?'air':c.el==='土'?'earth':'neutral'); }
  // 元素關係：1=友好, -1=敵對, 0.5=弱友好, 0=中性
  function _elRel(a,b){
    if(a===b) return {score:1,label:'同元素共鳴'};
    if((a==='fire'&&b==='water')||(a==='water'&&b==='fire')) return {score:-1,label:'水火相沖'};
    if((a==='air'&&b==='earth')||(a==='earth'&&b==='air')) return {score:-1,label:'風土相沖'};
    if((a==='fire'&&b==='air')||(a==='air'&&b==='fire')) return {score:0.5,label:'火風相助'};
    if((a==='water'&&b==='earth')||(a==='earth'&&b==='water')) return {score:0.5,label:'水土相助'};
    return {score:0,label:'元素中性'};
  }
  function _dp(c){ return getTarotDeep(c); }
  function _tf(){ return t==='love'?'love':t==='career'?'career':t==='wealth'?'wealth':t==='health'?'health':'core'; }
  var tf=_tf();
  // 取牌的指定欄位值（已考慮正逆）
  function _fld(c,field){ var dp=_dp(c); return c.isUp?(dp[field+'Up']||''):(dp[field+'Rv']||''); }

  // ════════════════════════════════════════
  // 規則 1：核心牌(0) vs 結果牌(9)
  // 依據：pos[0].isUp, pos[9].isUp, 元素關係, timeUp/Rv
  // ════════════════════════════════════════
  var core=d[0], outcome=d[9];
  var coreEl=_el(core), outEl=_el(outcome);
  var elCoreOut=_elRel(coreEl, outEl);
  var coreTime=_fld(core,'time'), outTime=_fld(outcome,'time');
  var bothUp=core.isUp&&outcome.isUp, bothRv=!core.isUp&&!outcome.isUp;
  var coreUpOutRv=core.isUp&&!outcome.isUp, coreRvOutUp=!core.isUp&&outcome.isUp;

  var cvo={signal:'',desc:'',elNote:'',timeNote:'',trace:[]};
  if(bothUp){
    cvo.signal='同向正面';
    cvo.desc='pos[0]'+core.n+'正位 + pos[9]'+outcome.n+'正位：事情按軌道正面發展';
  } else if(bothRv){
    cvo.signal='同向負面';
    cvo.desc='pos[0]'+core.n+'逆位 + pos[9]'+outcome.n+'逆位：起點和終點都卡住，需要根本性調整';
  } else if(coreUpOutRv){
    cvo.signal='後期走偏';
    cvo.desc='pos[0]正位但pos[9]逆位：起手不錯但後期脫軌';
  } else {
    cvo.signal='否極泰來';
    cvo.desc='pos[0]逆位但pos[9]正位：現在卡住但後續有翻轉空間';
  }
  // 元素交叉
  if(elCoreOut.score===-1) cvo.elNote='核心牌('+core.n+'/'+core.el+')與結果牌('+outcome.n+'/'+outcome.el+')元素'+elCoreOut.label+'——過程中有根本性的張力需要調和';
  else if(elCoreOut.score===1) cvo.elNote='核心牌與結果牌同元素（'+core.el+'）——能量連貫，走勢一致';
  else if(elCoreOut.score===0.5) cvo.elNote='核心牌與結果牌元素'+elCoreOut.label+'——有助力但不是完全同頻';
  // 時間交叉
  if(coreTime&&outTime) cvo.timeNote='核心節奏「'+coreTime+'」→ 結果節奏「'+outTime+'」';
  cvo.trace=['規則1:pos[0]'+core.n+'('+core.el+','+(core.isUp?'正':'逆')+') vs pos[9]'+outcome.n+'('+outcome.el+','+(outcome.isUp?'正':'逆')+'), 元素'+elCoreOut.label+'('+elCoreOut.score+')'];
  result.coreVsOutcome=cvo;

  // ════════════════════════════════════════
  // 規則 2：阻礙牌(1) — 阻礙類型判定
  // 依據：pos[1] 花色/大牌分類 + obDeep.psycheUp/Rv + obDeep.eventUp/Rv + 元素 vs 核心牌元素
  // ════════════════════════════════════════
  var ob=d[1];
  var obDeep=_dp(ob);
  var obCat=_cat(ob);
  var obEl=_el(ob);
  var elObCore=_elRel(obEl, coreEl);

  // 阻礙類型：花色決定主分類，大牌用 id 分類
  var obstacleType='';
  if(obCat==='cup') obstacleType='情感心理';
  else if(obCat==='pent') obstacleType='現實資源';
  else if(obCat==='sword') obstacleType='思維衝突';
  else if(obCat==='wand') obstacleType='行動方向';
  else if(obCat==='major'){
    // 大牌細分
    if([2,8,9,12,18].includes(ob.id)) obstacleType='內在心理';
    else if([4,11,15,21].includes(ob.id)) obstacleType='結構/權力';
    else if([10,14,20].includes(ob.id)) obstacleType='時機/命運';
    else if([6,7].includes(ob.id)) obstacleType='選擇/方向';
    else if([1,5].includes(ob.id)) obstacleType='溝通/認知';
    else if([13,16].includes(ob.id)) obstacleType='劇變/終結';
    else if([3,17,19].includes(ob.id)) obstacleType='過度/失衡';
    else obstacleType='結構性阻力';
  }
  // 宮廷牌疊加：如果阻礙牌是宮廷牌 → 一定有人為因素
  if(_isCourt(ob)) obstacleType='人為阻礙（'+obstacleType+'）';

  // 阻礙的具體內容：取 eventUp/Rv（外在事件層）和 psycheUp/Rv（心理層）
  var obEvent=_fld(ob,'event');
  var obPsyche=_fld(ob,'psyche');
  var obCore=_fld(ob,'core');

  // 阻礙牌 vs 核心牌元素關係
  var obElNote='';
  if(elObCore.score===-1) obElNote='阻礙牌('+ob.el+')與核心牌('+core.el+')'+elObCore.label+'——這是根本性的衝突，不是小摩擦';
  else if(elObCore.score===1) obElNote='阻礙牌與核心牌同元素——阻礙來自你自身同類的能量過剩或失控';
  else if(elObCore.score===0.5) obElNote='阻礙牌與核心牌元素弱相助——阻礙不算劇烈，有調和空間';

  result.obstacleNature={
    type:obstacleType,
    card:ob.n, dir:ob.isUp?'正':'逆', el:ob.el,
    coreDesc:obCore, eventDesc:obEvent, psycheDesc:obPsyche,
    elVsCore:obElNote, elRelScore:elObCore.score,
    trace:['規則2:pos[1]'+ob.n+'('+obCat+','+ob.el+','+(ob.isUp?'正':'逆')+') 類型='+obstacleType+', vs core元素='+elObCore.label]
  };

  // ════════════════════════════════════════
  // 規則 3：根因牌(2) vs 顯性目標牌(4)
  // 依據：元素關係 + 正逆位方向 + psycheUp/Rv 欄位對比
  // ════════════════════════════════════════
  var root=d[2], crown=d[4];
  var rootEl=_el(root), crownEl=_el(crown);
  var elRootCrown=_elRel(rootEl, crownEl);
  var rootPsyche=_fld(root,'psyche');
  var crownPsyche=_fld(crown,'psyche');

  var rvg={signal:'',desc:'',elNote:'',psycheContrast:'',trace:[]};
  // 三層判定：方向+元素+深層欄位
  var dirMatch=root.isUp===crown.isUp;
  var elMatch=elRootCrown.score>=0.5;
  if(dirMatch&&elMatch){
    rvg.signal='一致';
    rvg.desc='根因('+root.n+')和目標('+crown.n+')方向一致、元素'+elRootCrown.label+'——你清楚自己在做什麼';
  } else if(!dirMatch&&elRootCrown.score===-1){
    rvg.signal='嚴重衝突';
    rvg.desc='根因('+root.n+(root.isUp?'正':'逆')+')與目標('+crown.n+(crown.isUp?'正':'逆')+')方向相反且元素'+elRootCrown.label+'——你嘴上追求的和內心驅動力完全矛盾';
  } else if(!dirMatch){
    rvg.signal='衝突';
    rvg.desc='根因('+root.n+')與目標('+crown.n+')正逆相反——表面想要的和底層需求不同';
  } else {
    rvg.signal='有差異';
    rvg.desc='根因與目標方向相同但元素不同（'+root.el+' vs '+crown.el+'）——策略需要微調';
  }
  rvg.elNote='根因元素('+root.el+') vs 目標元素('+crown.el+'): '+elRootCrown.label;
  if(rootPsyche&&crownPsyche) rvg.psycheContrast='底層心理：「'+rootPsyche+'」 ↔ 意識追求：「'+crownPsyche+'」';
  rvg.trace=['規則3:pos[2]'+root.n+'('+root.el+','+(root.isUp?'正':'逆')+') vs pos[4]'+crown.n+'('+crown.el+','+(crown.isUp?'正':'逆')+'), 元素'+elRootCrown.label+', psyche對比'];
  result.rootVsGoal=rvg;

  // ════════════════════════════════════════
  // 規則 4：自身(6) vs 外界(7)
  // 依據：正逆位 + 元素關係 + personUp/Rv + psycheUp/Rv + 宮廷牌角色
  // ════════════════════════════════════════
  var self=d[6], env=d[7];
  var selfEl=_el(self), envEl=_el(env);
  var elSelfEnv=_elRel(selfEl, envEl);
  var selfPerson=_fld(self,'person');
  var envPerson=_fld(env,'person');
  var selfPsyche=_fld(self,'psyche');
  var envEvent=_fld(env,'event');

  var sve={signal:'',desc:'',elNote:'',personNote:'',trace:[]};
  // 四格+元素交叉
  if(self.isUp&&env.isUp){
    sve.signal='同頻';
    sve.desc='你('+self.n+'正位)和'+(t==='love'?'對方':'外界')+'('+env.n+'正位)都在正向狀態';
  } else if(!self.isUp&&!env.isUp){
    sve.signal='雙方都退';
    sve.desc='你('+self.n+'逆位)和'+(t==='love'?'對方':'外界')+'('+env.n+'逆位)都在退縮——僵局';
  } else if(self.isUp&&!env.isUp){
    sve.signal='你主動外界不配合';
    sve.desc='你('+self.n+'正位)準備好了，但'+(t==='love'?'對方':'外界')+'('+env.n+'逆位)不配合';
  } else {
    sve.signal='外界催你沒準備好';
    sve.desc=(t==='love'?'對方':'外界')+'('+env.n+'正位)在推進，你('+self.n+'逆位)還沒準備好';
  }
  // 元素
  if(elSelfEnv.score===-1) sve.elNote='你('+self.el+')和'+(t==='love'?'對方':'外界')+'('+env.el+')元素'+elSelfEnv.label+'——根本頻率不合，需要找到共通語言';
  else if(elSelfEnv.score===1) sve.elNote='你和'+(t==='love'?'對方':'外界')+'同元素('+self.el+')——天然合拍';
  else if(elSelfEnv.score===0.5) sve.elNote='你('+self.el+')和'+(t==='love'?'對方':'外界')+'('+env.el+')'+elSelfEnv.label+'——可以配合但需要溝通';
  // person 欄位交叉
  if(selfPerson&&envPerson) sve.personNote='你的角色：「'+selfPerson+'」｜'+(t==='love'?'對方':'外界')+'角色：「'+envPerson+'」';
  // 宮廷牌
  var selfCourt=_isCourt(self)?{rank:_courtRank(self),cat:_cat(self)}:null;
  var envCourt=_isCourt(env)?{rank:_courtRank(env),cat:_cat(env)}:null;
  sve.trace=['規則4:pos[6]'+self.n+'('+self.el+','+(self.isUp?'正':'逆')+') vs pos[7]'+env.n+'('+env.el+','+(env.isUp?'正':'逆')+'), 元素'+elSelfEnv.label];
  result.selfVsExternal=sve;
  result.selfVsExternal.selfCourt=selfCourt;
  result.selfVsExternal.envCourt=envCourt;

  // ════════════════════════════════════════
  // 規則 5：希望恐懼(8) vs 結果(9)
  // 依據：正逆位 + psycheUp/Rv 欄位 + 元素關係
  // ════════════════════════════════════════
  var hf=d[8];
  var hfEl=_el(hf);
  var elHfOut=_elRel(hfEl, outEl);
  var hfPsyche=_fld(hf,'psyche');
  var hfRisk=_fld(hf,'risk');

  var hfo={signal:'',desc:'',psycheNote:'',riskNote:'',trace:[]};
  if(!hf.isUp&&!outcome.isUp){
    hfo.signal='恐懼成真';
    hfo.desc='pos[8]'+hf.n+'逆位（你害怕的）+ pos[9]'+outcome.n+'逆位（結果）方向一致——恐懼有被兌現的傾向';
  } else if(hf.isUp&&outcome.isUp){
    hfo.signal='希望接近';
    hfo.desc='pos[8]'+hf.n+'正位（你期盼的）+ pos[9]'+outcome.n+'正位——方向一致，期望有望實現';
  } else if(hf.isUp&&!outcome.isUp){
    hfo.signal='期望落差';
    hfo.desc='你期望('+hf.n+'正位)的方向好，但結果('+outcome.n+'逆位)沒到位——差距在過程中';
  } else {
    hfo.signal='多慮';
    hfo.desc='你擔心的('+hf.n+'逆位)沒成真，結果('+outcome.n+'正位)比你想的好';
  }
  if(hfPsyche) hfo.psycheNote='你內心深處的狀態：「'+hfPsyche+'」';
  if(hfRisk) hfo.riskNote='潛在盲點：「'+hfRisk+'」';
  if(elHfOut.score===-1) hfo.desc+='。而且希望恐懼牌('+hf.el+')和結果牌('+outcome.el+')'+elHfOut.label+'——情緒和結果不在同一個能量頻道';
  hfo.trace=['規則5:pos[8]'+hf.n+'('+hf.el+','+(hf.isUp?'正':'逆')+') vs pos[9]'+outcome.n+'('+outcome.el+','+(outcome.isUp?'正':'逆')+'), 元素'+elHfOut.label];
  result.hopeFearVsOutcome=hfo;

  // ════════════════════════════════════════
  // 規則 6：大牌權重
  // 依據：id<=21 計數 + 落在哪些位置
  // ════════════════════════════════════════
  var majorCount=0, majorPos=[], majorNames=[];
  d.forEach(function(c,i){ if(c.id<=21){ majorCount++; majorPos.push(i); majorNames.push(c.n); }});
  var majorAtKey=majorPos.some(function(p){return p===0||p===1||p===2||p===9;});
  var maw={level:'',desc:'',count:majorCount,positions:majorPos,names:majorNames,atKey:majorAtKey};
  if(majorCount>=5) maw.level='高';
  else if(majorCount>=3) maw.level='中';
  else maw.level='低';
  maw.desc='大牌'+majorCount+'張'+(majorNames.length?'（'+majorNames.join('、')+'）':'')+'，落在位置['+majorPos.join(',')+']';
  if(majorAtKey) maw.desc+='——關鍵位有大牌，影響力強';
  maw.trace=['規則6:大牌'+majorCount+'張, 位置='+majorPos.join(',')];
  result.majorArcanaWeight=maw;

  // ════════════════════════════════════════
  // 規則 7：花色分布
  // 依據：各花色計數 + 落在哪些位置 + 失衡時用該花色主題解讀
  // ════════════════════════════════════════
  var sc={wand:0,cup:0,sword:0,pent:0};
  var sp={wand:[],cup:[],sword:[],pent:[]};
  var sn={wand:[],cup:[],sword:[],pent:[]};
  d.forEach(function(c,i){
    if(c.id>21){
      var cat=_cat(c);
      sc[cat]++; sp[cat].push(i); sn[cat].push(c.n);
    }
  });
  var suitTheme={
    wand:{name:'權杖',el:'火',theme:'行動/衝勁/意志',excess:'衝動冒進、三分鐘熱度',lack:'缺乏執行力'},
    cup:{name:'聖杯',el:'水',theme:'情感/直覺/關係',excess:'情緒化決策、過度感性',lack:'缺乏情感連結'},
    sword:{name:'寶劍',el:'風',theme:'思維/壓力/衝突',excess:'過度焦慮、言語傷人',lack:'缺乏理性分析'},
    pent:{name:'金幣',el:'土',theme:'物質/資源/穩定',excess:'過度保守、只看現實',lack:'缺乏物質基礎'}
  };
  var dominant=Object.keys(sc).reduce(function(a,b){return sc[a]>=sc[b]?a:b;});
  var missing=Object.keys(sc).filter(function(k){return sc[k]===0;});
  var sb={counts:sc,positions:sp,names:sn};
  if(sc[dominant]>=3){
    var st=suitTheme[dominant];
    sb.dominant=st.name;
    sb.desc=st.name+'出現'+sc[dominant]+'張（'+sn[dominant].join('、')+'）在位置['+sp[dominant].join(',')+']——'+st.theme+'主導這件事';
    sb.risk=st.excess;
  } else {
    sb.dominant='均衡';
    sb.desc='花色分布均衡，沒有單一能量主導';
    sb.risk='';
  }
  if(missing.length){
    sb.missing=missing.map(function(k){return suitTheme[k].name;});
    sb.missingNote='缺少'+sb.missing.join('、')+'能量——'+missing.map(function(k){return suitTheme[k].lack;}).join('；');
  }
  sb.trace=['規則7:權杖'+sc.wand+'聖杯'+sc.cup+'寶劍'+sc.sword+'金幣'+sc.pent];
  result.suitBalance=sb;

  // ════════════════════════════════════════
  // 規則 8：宮廷牌人物化
  // 依據：courtRank + 花色 + personUp/Rv + 落在哪個位置 → 用 TAROT_POS_META 判角色
  // ════════════════════════════════════════
  var courtRankLabel={10:'侍者(學習期)',11:'騎士(行動期)',12:'皇后(成熟期)',13:'國王(掌權期)'};
  var courtSuitLabel={wand:'火象/直覺行動',cup:'水象/感性情緒',sword:'風象/理性分析',pent:'土象/務實穩健'};
  var courts=[];
  d.forEach(function(c,i){
    if(_isCourt(c)){
      var rank=_courtRank(c);
      var cat=_cat(c);
      var person=_fld(c,'person');
      var posRole=(typeof TAROT_POS_META!=='undefined')?TAROT_POS_META[i].label:'位置'+i;
      courts.push({
        pos:i, posRole:posRole,
        card:c.n, dir:c.isUp?'正':'逆',
        rankLabel:courtRankLabel[rank]||'',
        suitLabel:courtSuitLabel[cat]||'',
        maturity:c.isUp?'成熟/正向':'不成熟/扭曲',
        active:c.isUp?'主動':'被動',
        personDesc:person||''
      });
    }
  });
  var ccp={count:courts.length, cards:courts};
  if(courts.length>=3) ccp.desc='宮廷牌'+courts.length+'張——人事因素高度主導';
  else if(courts.length>=1) ccp.desc='有宮廷牌出現，特定人物在影響';
  else ccp.desc='無宮廷牌——偏狀態和能量面，不是人的問題';
  // 人物摘要（每張宮廷牌的具體角色）
  ccp.profiles=courts.map(function(ct){
    return '【'+ct.posRole+'】'+ct.card+'('+ct.dir+') = '+ct.suitLabel+'的'+ct.rankLabel+'，'+(ct.maturity)+(ct.personDesc?'：「'+ct.personDesc+'」':'');
  });
  ccp.trace=['規則8:宮廷牌'+courts.length+'張, 位置='+courts.map(function(c){return c.pos;}).join(',')];
  result.courtCardProfile=ccp;

  // ════════════════════════════════════════
  // 規則 9：正逆位壓力
  // 依據：各位置正逆計數 + 逆位落在哪些關鍵位 + 逆位牌的 riskUp/Rv 欄位
  // ════════════════════════════════════════
  var upCount=0, rvPositions=[], rvRisks=[];
  d.forEach(function(c,i){
    if(c.isUp) upCount++;
    else {
      rvPositions.push(i);
      var risk=_fld(c,'risk');
      if(risk) rvRisks.push('pos['+i+']'+c.n+'：'+risk);
    }
  });
  var rvCount=10-upCount;
  var rvAtKey=rvPositions.filter(function(p){return p===0||p===1||p===9;});
  var rp={upCount:upCount, rvCount:rvCount, rvPositions:rvPositions, rvAtKey:rvAtKey, rvRisks:rvRisks};

  var rpDesc='正位'+upCount+'張/逆位'+rvCount+'張';
  if(rvCount>=7) rpDesc+='——逆位壓倒性多，整體能量嚴重受阻';
  else if(rvCount>=5) rpDesc+='——逆位偏多，有明顯的卡頓';
  else if(upCount>=8) rpDesc+='——正位主導，能量流暢';
  else rpDesc+='——正逆各半，關鍵看逆位落在哪';
  if(rvAtKey.length){
    rpDesc+='。逆位落在關鍵位['+rvAtKey.join(',')+']';
    if(rvAtKey.includes(9)&&rvCount<=3) rpDesc+='——前面順但結尾要注意';
    if(rvAtKey.includes(0)&&upCount>=7) rpDesc+='——表面順但根基有問題';
  }
  rp.desc=rpDesc;
  rp.trace=['規則9:正'+upCount+'逆'+rvCount+', 逆位在pos='+rvPositions.join(',')];
  result.reversalPressure=rp;

  // ════════════════════════════════════════
  // 規則 10：時間感判讀
  // 依據：pos[3] pos[5] pos[9] 的 timeUp/Rv + 快/慢牌 id 清單 + 正逆位
  // ════════════════════════════════════════
  var past=d[3], near=d[5];
  var pastTime=_fld(past,'time'), nearTime=_fld(near,'time'), outTimeVal=_fld(outcome,'time');
  var timeDetails=[];
  if(pastTime) timeDetails.push({pos:3,card:past.n,val:pastTime});
  if(nearTime) timeDetails.push({pos:5,card:near.n,val:nearTime});
  if(outTimeVal) timeDetails.push({pos:9,card:outcome.n,val:outTimeVal});

  var fastIds=[7,10,19,22,29,33]; // 戰車、命運之輪、太陽、權杖Ace、權杖八、權杖騎士
  var slowIds=[2,9,12,14,67,70,75]; // 女祭司、隱者、吊人、節制、金幣四、金幣七、金幣騎士
  var repeatIds=[10,18,65]; // 命運之輪逆、月亮、金幣二 → 反覆
  var fastInSpread=[], slowInSpread=[], repeatInSpread=[];
  d.forEach(function(c,i){
    if(fastIds.includes(c.id)&&c.isUp) fastInSpread.push({pos:i,card:c.n});
    if(slowIds.includes(c.id)) slowInSpread.push({pos:i,card:c.n,isUp:c.isUp});
    if(repeatIds.includes(c.id)&&!c.isUp) repeatInSpread.push({pos:i,card:c.n});
  });

  var timingOverall='';
  if(fastInSpread.length>=2&&slowInSpread.length===0) timingOverall='快速推進（快牌：'+fastInSpread.map(function(f){return f.card+'@pos['+f.pos+']';}).join('、')+')';
  else if(slowInSpread.length>=2&&fastInSpread.length===0) timingOverall='明顯延遲（慢牌：'+slowInSpread.map(function(s){return s.card+'@pos['+s.pos+']';}).join('、')+')';
  else if(fastInSpread.length&&slowInSpread.length) timingOverall='分階段推進——快牌('+fastInSpread.map(function(f){return f.card;}).join(',')+')和慢牌('+slowInSpread.map(function(s){return s.card;}).join(',')+')並存';
  else if(repeatInSpread.length) timingOverall='有反覆跡象（'+repeatInSpread.map(function(r){return r.card+'逆位';}).join('、')+')';
  else timingOverall='節奏中等，按正常步調';
  if(!near.isUp&&!outcome.isUp) timingOverall+='，pos[5]和pos[9]都逆位暗示延遲';

  result.timingSignal={overall:timingOverall, details:timeDetails, fast:fastInSpread, slow:slowInSpread, repeat:repeatInSpread,
    trace:['規則10:快牌'+fastInSpread.length+'張,慢牌'+slowInSpread.length+'張,反覆'+repeatInSpread.length+'張, timeFields='+timeDetails.map(function(t){return 'pos['+t.pos+']「'+t.val+'」';}).join(',')]};

  // ════════════════════════════════════════
  // 衝突/支持旗標 + narrative tags + storyAxis
  // 每個 flag 都指向具體的規則編號
  // ════════════════════════════════════════
  var conflictFlags=[], supportFlags=[], narrativeTags=[];

  if(rvg.signal==='衝突'||rvg.signal==='嚴重衝突') conflictFlags.push('規則3:內外不一致('+root.n+' vs '+crown.n+')');
  if(sve.signal==='雙方都退') conflictFlags.push('規則4:雙方僵持('+self.n+'逆+'+env.n+'逆)');
  if(hfo.signal==='恐懼成真') conflictFlags.push('規則5:恐懼兌現('+hf.n+'逆→'+outcome.n+'逆)');
  if(rvCount>=6) conflictFlags.push('規則9:逆位'+rvCount+'張能量嚴重受阻');
  if(obstacleType.includes('人為')) conflictFlags.push('規則2+8:人為阻礙('+ob.n+')');
  if(elObCore.score===-1) conflictFlags.push('規則2:阻礙與核心元素相沖('+ob.el+' vs '+core.el+')');

  if(cvo.signal==='同向正面') supportFlags.push('規則1:整體正向('+core.n+'正+'+outcome.n+'正)');
  if(sve.signal==='同頻') supportFlags.push('規則4:內外同頻('+self.n+'正+'+env.n+'正)');
  if(hfo.signal==='希望接近') supportFlags.push('規則5:心想事成('+hf.n+'正+'+outcome.n+'正)');
  if(upCount>=7) supportFlags.push('規則9:能量順暢(正位'+upCount+'張)');
  if(elCoreOut.score>=0.5) supportFlags.push('規則1:核心與結果元素'+elCoreOut.label);

  if(majorCount>=5) narrativeTags.push('大牌過半');
  if(courts.length>=3) narrativeTags.push('人事主導');
  if(sc[dominant]>=3) narrativeTags.push(suitTheme[dominant].name+'主場');
  if(rvCount>=6) narrativeTags.push('內耗嚴重');
  else if(upCount>=8) narrativeTags.push('能量順暢');
  if(sve.signal==='你主動外界不配合') narrativeTags.push('己動彼靜');
  else if(sve.signal==='外界催你沒準備好') narrativeTags.push('外催內怯');
  if(slowInSpread.length>=2) narrativeTags.push('有拖延');
  if(fastInSpread.length&&slowInSpread.length) narrativeTags.push('分階段');
  if(cvo.signal==='否極泰來') narrativeTags.push('先苦後甜');
  if(cvo.signal==='後期走偏') narrativeTags.push('先甜後苦');
  if(sb.missing&&sb.missing.length) narrativeTags.push('缺'+sb.missing.join(''));

  result.conflictFlags=conflictFlags;
  result.supportFlags=supportFlags;
  result.finalNarrativeTags=narrativeTags;

  var storyAxis='';
  if(supportFlags.length>conflictFlags.length) storyAxis='支持力量('+supportFlags.length+')多於衝突('+conflictFlags.length+')，整體偏正面';
  else if(conflictFlags.length>supportFlags.length) storyAxis='衝突('+conflictFlags.length+')多於支持('+supportFlags.length+')，挑戰不少但每個衝突都指向具體行動方向';
  else storyAxis='正反力量拉扯（各'+supportFlags.length+'項），結果取決於你接下來怎麼做';
  result.storyAxis=storyAxis;

  return result;
}


// ═══════════════════════════════════════════════════════════════
// 四、塔羅深度總報告（每段對應規則×牌位×欄位）
// ═══════════════════════════════════════════════════════════════

function buildTarotDeepReport(drawn, type){
  if(!drawn||drawn.length<3) return '';
  var d=drawn.slice(0,(S.tarot&&S.tarot.spreadDef&&S.tarot.spreadDef.count)||drawn.length);
  var t=type||'general';
  var inter=analyzeTarotInteractions(drawn, t);
  if(!inter) return '';
  var posMeta=TAROT_POS_META;

  // helpers
  function _ref(i){ return '【'+d[i].n+(d[i].isUp?'正位':'逆位')+'】'; }
  function _dp(c){ return getTarotDeep(c); }
  var tf=t==='love'?'love':t==='career'?'career':t==='wealth'?'wealth':t==='health'?'health':'core';
  function _fld(i,field){ var dp=_dp(d[i]); return d[i].isUp?(dp[field+'Up']||d[i].up||''):(dp[field+'Rv']||d[i].rv||''); }
  function _posCtx(i){ return posMeta[i][t]||posMeta[i].general; }

  var html='';
  var S='style="margin-bottom:16px;padding:12px 14px;background:rgba(212,175,55,0.03);border-radius:8px;border-left:3px solid var(--c-gold,#d4af37);line-height:1.7;font-size:0.88rem"';
  var T='style="font-size:0.95rem;font-weight:700;color:var(--c-gold,#d4af37);margin-bottom:6px"';
  var D='style="font-size:0.78rem;color:var(--c-text-dim,#9b8b6b);line-height:1.5;margin-top:4px"';
  var R='style="font-size:0.68rem;opacity:0.35;margin-top:2px"'; // trace line

  // ══════════════════════════
  // 1. 一句總判 — 來自 storyAxis（conflictFlags vs supportFlags 計數）
  // ══════════════════════════
  html+='<div '+S+'>';
  html+='<div '+T+'>🔮 總判</div>';
  html+='<div style="font-size:1rem;font-weight:600;color:var(--c-text,#e8d5b5)">'+inter.storyAxis+'</div>';
  if(inter.finalNarrativeTags.length) html+='<div style="margin-top:6px">'+inter.finalNarrativeTags.map(function(tag){return '<span class="tag tag-gold" style="font-size:0.72rem;margin-right:4px">'+tag+'</span>';}).join('')+'</div>';
  // trace
  html+='<div '+R+'>依據：支持('+inter.supportFlags.length+') vs 衝突('+inter.conflictFlags.length+')</div>';
  html+='</div>';

  // ══════════════════════════
  // 2. 核心局面 — 規則1(coreVsOutcome) + 規則3(rootVsGoal)
  //    讀取欄位：pos[0].{tf}Up/Rv, pos[2].psycheUp/Rv, pos[4].psycheUp/Rv
  //    交叉判讀：規則3的元素關係 + psyche欄位對比
  // ══════════════════════════
  html+='<div '+S+'>';
  html+='<div '+T+'>🎯 核心局面</div>';
  // pos[0]: 用 type-specific 欄位
  html+=_ref(0)+'——'+_posCtx(0)+'：'+_fld(0,tf);
  // pos[2]: 用 psyche 欄位（根因的心理層）
  html+='<br>底層驅動力'+_ref(2)+'（'+_posCtx(2)+'）——你內心真正在推動的：'+_fld(2,'psyche');
  // pos[4]: 用 psyche 欄位（意識目標的心理層）
  html+='<br>你意識上追求的'+_ref(4)+'（'+_posCtx(4)+'）：'+_fld(4,'psyche');
  // 規則3交叉：元素+psyche對比
  html+='<div '+D+'>'+inter.rootVsGoal.desc+'</div>';
  if(inter.rootVsGoal.elNote) html+='<div '+D+'>'+inter.rootVsGoal.elNote+'</div>';
  if(inter.rootVsGoal.psycheContrast) html+='<div '+D+'>'+inter.rootVsGoal.psycheContrast+'</div>';
  html+='<div '+R+'>'+inter.rootVsGoal.trace[0]+'</div>';
  html+='</div>';

  // ══════════════════════════
  // 3. 真正阻礙 — 規則2(obstacleNature)
  //    讀取欄位：pos[1].coreUp/Rv（本質）+ eventUp/Rv（外在事件）+ psycheUp/Rv（心理層）
  //    交叉：阻礙牌元素 vs 核心牌元素（elVsCore）
  //    串接：阻礙類型 → 條件連結 pos[6] 或 pos[7]
  // ══════════════════════════
  html+='<div '+S+'>';
  html+='<div '+T+'>🚧 真正阻礙</div>';
  html+=_ref(1)+'——阻礙類型：<strong>'+inter.obstacleNature.type+'</strong>';
  // 三層：core → event → psyche
  if(inter.obstacleNature.coreDesc) html+='<br>本質：'+inter.obstacleNature.coreDesc;
  if(inter.obstacleNature.eventDesc) html+='<br>具體表現：'+inter.obstacleNature.eventDesc;
  if(inter.obstacleNature.psycheDesc) html+='<br>心理層面：'+inter.obstacleNature.psycheDesc;
  // 元素交叉
  if(inter.obstacleNature.elVsCore) html+='<div '+D+'>'+inter.obstacleNature.elVsCore+'</div>';
  // 條件串接：阻礙類型 → 連到 pos[6] 或 pos[7]
  var obType=inter.obstacleNature.type;
  if(obType.includes('人為')||obType==='思維衝突'||obType==='溝通/認知'){
    html+='<div '+D+'>呼應'+(t==='love'?'對方':'外界')+'位置'+_ref(7)+'（'+_posCtx(7)+'）：'+_fld(7,'event')+'</div>';
  }
  if(obType==='情感心理'||obType==='內在心理'||obType==='選擇/方向'){
    html+='<div '+D+'>呼應你自身'+_ref(6)+'（'+_posCtx(6)+'）：'+_fld(6,'psyche')+'</div>';
  }
  html+='<div '+R+'>'+inter.obstacleNature.trace[0]+'</div>';
  html+='</div>';

  // ══════════════════════════
  // 4. 你 vs 對方/外界 — 規則4(selfVsExternal)
  //    讀取欄位：pos[6].{tf}Up/Rv, pos[7].{tf}Up/Rv, pos[6].personUp/Rv, pos[7].personUp/Rv
  //    交叉：元素關係 + 宮廷牌角色（規則8）
  // ══════════════════════════
  html+='<div '+S+'>';
  html+='<div '+T+'>'+(t==='love'?'💕 你和對方':'⚖️ 你和外界')+'</div>';
  html+='你的位置'+_ref(6)+'：'+_fld(6,tf);
  html+='<br>'+(t==='love'?'對方/關係環境':'外界/環境')+''+_ref(7)+'：'+_fld(7,tf);
  // person 欄位
  if(inter.selfVsExternal.personNote) html+='<div '+D+'>'+inter.selfVsExternal.personNote+'</div>';
  // 元素交叉
  if(inter.selfVsExternal.elNote) html+='<div '+D+'>'+inter.selfVsExternal.elNote+'</div>';
  // 宮廷牌角色（規則8 中落在 pos 6 或 7 的）
  inter.courtCardProfile.cards.forEach(function(ct){
    if(ct.pos===6||ct.pos===7){
      html+='<div '+D+'>'+(ct.pos===7?(t==='love'?'對方':'外界')+'人物：':'你扮演的角色：')+'<strong>'+ct.suitLabel+'・'+ct.rankLabel+'</strong>（'+ct.maturity+'/'+(ct.active)+'）'+(ct.personDesc?'——「'+ct.personDesc+'」':'')+'</div>';
    }
  });
  // 規則4 結論
  html+='<div '+D+'>'+inter.selfVsExternal.desc+'</div>';
  html+='<div '+R+'>'+inter.selfVsExternal.trace[0]+'</div>';
  html+='</div>';

  // ══════════════════════════
  // 5. 近期走勢 — 規則1(coreVsOutcome) + 規則10(timingSignal)
  //    讀取欄位：pos[3].eventUp/Rv, pos[5].eventUp/Rv, pos[9].{tf}Up/Rv
  //    交叉：pos[3]→pos[5]→pos[9] 的 timeUp/Rv 做時間推進
  //    交叉：規則1 的元素關係 + 核心vs結果走向
  // ══════════════════════════
  html+='<div '+S+'>';
  html+='<div '+T+'>📅 近期走勢</div>';
  html+='近期過去'+_ref(3)+'：'+_fld(3,'event');
  html+='<br>→ 接下來'+_ref(5)+'：'+_fld(5,'event');
  html+='<br>→ 最終走向'+_ref(9)+'：'+_fld(9,tf);
  // 規則1：核心vs結果元素交叉
  if(inter.coreVsOutcome.elNote) html+='<div '+D+'>'+inter.coreVsOutcome.elNote+'</div>';
  // 規則10：時間場的具體牌
  html+='<div '+D+'>⏱ '+inter.timingSignal.overall+'</div>';
  // 時間欄位細節
  inter.timingSignal.details.forEach(function(td){
    html+='<div '+D+'>pos['+td.pos+']'+td.card+'時間感：「'+td.val+'」</div>';
  });
  // 規則1 走向結論
  html+='<div '+D+'>'+inter.coreVsOutcome.desc+'</div>';
  if(inter.coreVsOutcome.timeNote) html+='<div '+D+'>'+inter.coreVsOutcome.timeNote+'</div>';
  html+='<div '+R+'>'+inter.coreVsOutcome.trace[0]+' | '+inter.timingSignal.trace[0]+'</div>';
  html+='</div>';

  // ══════════════════════════
  // 6. 情緒盲點 — 規則5(hopeFearVsOutcome)
  //    讀取欄位：pos[8].psycheUp/Rv, pos[8].riskUp/Rv
  //    交叉：規則5 元素關係 + psyche + risk
  // ══════════════════════════
  html+='<div '+S+'>';
  html+='<div '+T+'>🪞 情緒盲點</div>';
  html+=_ref(8)+'——'+_posCtx(8)+'：'+_fld(8,'psyche');
  // risk 欄位
  var hfRisk=_fld(8,'risk');
  if(hfRisk) html+='<br>盲點風險：'+hfRisk;
  html+='<div '+D+'>'+inter.hopeFearVsOutcome.desc+'</div>';
  if(inter.hopeFearVsOutcome.psycheNote) html+='<div '+D+'>'+inter.hopeFearVsOutcome.psycheNote+'</div>';
  html+='<div '+R+'>'+inter.hopeFearVsOutcome.trace[0]+'</div>';
  html+='</div>';

  // ══════════════════════════
  // 7. 結果怎麼看 — 規則1(coreVsOutcome.signal) + 規則9(reversalPressure)
  //    讀取欄位：pos[9].{tf}Up/Rv, pos[9].adviceUp/Rv
  //    逆轉點：根據 signal 指向具體牌位
  // ══════════════════════════
  html+='<div '+S+'>';
  html+='<div '+T+'>🏁 最終結果怎麼看</div>';
  html+=_ref(9)+'——'+_fld(9,tf);
  var outAdvice=_fld(9,'advice');
  if(outAdvice) html+='<br>結果牌的建議：'+outAdvice;
  html+='<br><span style="font-size:0.82rem;opacity:0.7">結果不是宿命，是照目前軌道推演。</span>';
  // 逆轉點（根據規則1的signal，指向具體牌位和欄位）
  if(inter.coreVsOutcome.signal==='後期走偏'){
    html+='<br>⚠ 脫軌風險來自：'+_ref(1)+'（阻礙：'+_fld(1,'event')+'）和'+_ref(5)+'（近期走向：'+_fld(5,'event')+'）——處理好這兩個議題，結果會不同。';
  } else if(inter.coreVsOutcome.signal==='否極泰來'){
    html+='<br>✦ 翻轉關鍵在'+_ref(5)+'（近期走向：'+_fld(5,'event')+'）——接下來是轉折點。';
  } else if(inter.coreVsOutcome.signal==='同向負面'){
    html+='<br>⚠ 改變結果需要從'+_ref(2)+'（根因：'+_fld(2,'psyche')+'）和'+_ref(6)+'（你的位置：'+_fld(6,'psyche')+'）下手。';
  }
  // 規則9：逆位風險清單（每張逆位的 risk 欄位）
  if(inter.reversalPressure.rvRisks.length){
    html+='<div '+D+'>逆位牌風險：<br>'+inter.reversalPressure.rvRisks.slice(0,3).join('<br>')+'</div>';
  }
  html+='<div '+R+'>'+inter.reversalPressure.trace[0]+'</div>';
  html+='</div>';

  // ══════════════════════════
  // 8. 行動建議 — 每條都回扣到規則# + 牌位 + adviceUp/Rv 欄位
  // ══════════════════════════
  html+='<div '+S+'>';
  html+='<div '+T+'>🎯 行動建議</div>';
  var advices=[];
  // (a) 阻礙牌的 advice 欄位 → 規則2
  var obAdv=_fld(1,'advice');
  if(obAdv) advices.push({text:'針對阻礙('+inter.obstacleNature.type+')'+_ref(1)+'：'+obAdv, rule:'規則2'});
  // (b) selfVsExternal 信號 → 規則4 + pos[6] advice
  var selfAdv=_fld(6,'advice');
  if(inter.selfVsExternal.signal==='你主動外界不配合'&&selfAdv){
    advices.push({text:'你準備好了但外界不配合——'+selfAdv, rule:'規則4+pos[6]'});
  } else if(inter.selfVsExternal.signal==='外界催你沒準備好'&&selfAdv){
    advices.push({text:'外界在催但你沒準備好——'+selfAdv, rule:'規則4+pos[6]'});
  } else if(inter.selfVsExternal.signal==='雙方都退'){
    advices.push({text:'僵持中需要有一方先動——你能做的：'+selfAdv, rule:'規則4+pos[6]'});
  }
  // (c) 花色風險 → 規則7
  if(inter.suitBalance.risk){
    advices.push({text:'注意'+inter.suitBalance.dominant+'能量過剩：'+inter.suitBalance.risk, rule:'規則7'});
  }
  if(inter.suitBalance.missingNote){
    advices.push({text:inter.suitBalance.missingNote, rule:'規則7'});
  }
  // (d) 近期走向的 advice 欄位 → pos[5]
  var nearAdv=_fld(5,'advice');
  if(nearAdv) advices.push({text:'近期方向'+_ref(5)+'：'+nearAdv, rule:'pos[5].advice'});
  // 去重 + 限制 4 條
  var seen={};
  advices=advices.filter(function(a){if(seen[a.text])return false;seen[a.text]=1;return true;}).slice(0,4);
  advices.forEach(function(a){
    html+='<div style="margin-bottom:6px;padding-left:12px;border-left:2px solid var(--c-gold,#d4af37)">'+a.text+'</div>';
    html+='<div '+R+'>'+a.rule+'</div>';
  });
  if(t==='wealth') html+='<div style="font-size:0.75rem;opacity:0.5;margin-top:6px">⚠ 僅作參考，不構成投資建議</div>';
  if(t==='health') html+='<div style="font-size:0.75rem;opacity:0.5;margin-top:6px">⚠ 此分析僅為能量狀態指引，實際身體狀況與醫療決策請以專業醫師診斷為主。</div>';
  html+='</div>';

  // ══════════════════════════
  // 9. 結構標籤 — 規則6(大牌) + 規則7(花色) + 規則8(宮廷牌) + 規則9(逆位)
  // ══════════════════════════
  html+='<div style="margin-top:8px;display:flex;flex-wrap:wrap;gap:4px">';
  html+='<span class="tag" style="font-size:0.7rem;background:rgba(212,175,55,0.1);color:var(--c-gold)">大牌'+inter.majorArcanaWeight.count+'張</span>';
  html+='<span class="tag" style="font-size:0.7rem;background:rgba(212,175,55,0.1);color:var(--c-gold)">逆位'+inter.reversalPressure.rvCount+'張</span>';
  if(inter.courtCardProfile.count) html+='<span class="tag" style="font-size:0.7rem;background:rgba(212,175,55,0.1);color:var(--c-gold)">宮廷牌'+inter.courtCardProfile.count+'張</span>';
  inter.finalNarrativeTags.forEach(function(tag){
    html+='<span class="tag" style="font-size:0.7rem;background:rgba(212,175,55,0.08);color:var(--c-text-dim)">'+tag+'</span>';
  });
  html+='</div>';

  // 宮廷牌人物檔案（規則8 profiles，只在有宮廷牌時顯示）
  if(inter.courtCardProfile.profiles.length){
    html+='<details style="margin-top:8px"><summary style="cursor:pointer;font-size:0.78rem;color:var(--c-text-dim)">👤 宮廷牌人物檔案（'+inter.courtCardProfile.count+'張）</summary>';
    html+='<div style="font-size:0.78rem;line-height:1.6;padding:6px 0">';
    inter.courtCardProfile.profiles.forEach(function(p){ html+='<div style="margin-bottom:4px">'+p+'</div>'; });
    html+='</div></details>';
  }

  return html;
}


// ═══════════════════════════════════════════════════════════════
// 六、分析摘要橋接（供 ai-analysis.js 引用）
// ═══════════════════════════════════════════════════════════════

function buildTarotAnalysisSummary(drawn, type){
  var inter=analyzeTarotInteractions(drawn, type);
  if(!inter) return null;
  var overallDir='neutral';
  if(inter.supportFlags.length>inter.conflictFlags.length) overallDir='positive';
  else if(inter.conflictFlags.length>inter.supportFlags.length) overallDir='negative';
  if(inter.coreVsOutcome.signal==='否極泰來') overallDir='reversible_positive';
  if(inter.coreVsOutcome.signal==='後期走偏') overallDir='reversible_negative';

  return {
    direction: overallDir,
    obstacleType: inter.obstacleNature.type,
    obstacleElVsCore: inter.obstacleNature.elRelScore,
    humanFactor: inter.courtCardProfile.count>=3?'high':inter.courtCardProfile.count>=1?'medium':'low',
    majorWeight: inter.majorArcanaWeight.level,
    majorCount: inter.majorArcanaWeight.count,
    timing: inter.timingSignal.overall,
    selfExternalSync: inter.selfVsExternal.signal,
    selfExternalElNote: inter.selfVsExternal.elNote||'',
    rootGoalSync: inter.rootVsGoal.signal,
    hopeFearSignal: inter.hopeFearVsOutcome.signal,
    narrativeTags: inter.finalNarrativeTags,
    conflictFlags: inter.conflictFlags,
    supportFlags: inter.supportFlags,
    storyAxis: inter.storyAxis,
    reversalPressure: inter.reversalPressure.desc,
    suitDominant: inter.suitBalance.dominant,
    suitMissing: inter.suitBalance.missing||[],
    rvCount: inter.reversalPressure.rvCount,
    courtProfiles: inter.courtCardProfile.profiles||[]
  };
}

// ===== [UPGRADE: TAROT DEEP ANALYSIS END] =====


/* ═══════════════════════════════════════════════════════════════
   金色黎明（Golden Dawn）十字牌陣 — 標準化解讀系統 v2
   四大加權模組：元素尊卑 / 占星 / 宮廷牌 / 牌面結構
   核心規則：2(阻礙)/3(根因)/8(外界) 優先權最高
   ═══════════════════════════════════════════════════════════════ */

// ── 位置權重：2/3/8 最高 ──
var GD_POS_WEIGHT=[3,3.5,3.5,1.5,1.5,2.5,2,3.5,2,3.5];
var GD_POS_ROLE=['present','obstacle','root','past','crown','near','self','environ','hope_fear','outcome'];

// ── B-1. 元素尊卑（Elemental Dignities）──
var GD_ELEMENT_MAP={
  '火':'fire','水':'water','風':'air','土':'earth',
  '白羊':'fire','獅子':'fire','射手':'fire',
  '巨蟹':'water','天蠍':'water','雙魚':'water',
  '雙子':'air','天秤':'air','水瓶':'air',
  '金牛':'earth','處女':'earth','摩羯':'earth',
  '火星':'fire','太陽':'fire','月亮':'water','冥王星':'water',
  '水星':'air','天王星':'air','金星':'earth','土星':'earth','木星':'fire','海王星':'water'
};
function gdGetEl(card){return GD_ELEMENT_MAP[card.el]||'neutral';}
function gdED(a,b){
  if(a===b)return 1;
  if((a==='fire'&&b==='water')||(a==='water'&&b==='fire'))return -1;
  if((a==='air'&&b==='earth')||(a==='earth'&&b==='air'))return -1;
  if((a==='fire'&&b==='air')||(a==='air'&&b==='fire'))return 0.5;
  if((a==='water'&&b==='earth')||(a==='earth'&&b==='water'))return 0.5;
  return 0;
}
var GD_NEIGHBORS={0:[1,2],1:[0,2],2:[0,1],3:[0,5],4:[0,8],5:[0,3,9],6:[7],7:[6],8:[4,9],9:[5,8]};
function gdCalcED(drawn){
  return drawn.map((c,i)=>{
    const my=gdGetEl(c);let s=0;
    (GD_NEIGHBORS[i]||[]).forEach(j=>{if(drawn[j])s+=gdED(my,gdGetEl(drawn[j]));});
    return s;
  });
}

// ── B-2. 宮廷牌角色 ──
function gdIsCourt(c){const m=c.id>=22?(c.id-22)%14:-1;return m>=10&&m<=13;}
function gdCourtRole(c){
  if(!gdIsCourt(c))return null;
  const m=(c.id-22)%14;
  const r={10:'學習者/訊息者',11:'行動者/追求者',12:'滋養者/掌控者',13:'權威/決策者'};
  const s={fire:'行動型',water:'情感型',air:'思考型',earth:'務實型'};
  return(r[m]||'')+'・'+(s[gdGetEl(c)]||'');
}

// ── B-3. 牌面結構分析 ──
function gdStructure(drawn){
  const d=drawn.slice(0,(S.tarot&&S.tarot.spreadDef&&S.tarot.spreadDef.count)||drawn.length);
  let mj=0,wn=0,cp=0,sw=0,pn=0,ct=0;
  d.forEach(c=>{
    if(c.id<=21)mj++;else if(c.id<=35)wn++;else if(c.id<=49)cp++;else if(c.id<=63)sw++;else pn++;
    if(gdIsCourt(c))ct++;
  });
  const ins=[];
  if(mj>=5)ins.push('大牌過半 — 命運層級的議題');else if(mj>=3)ins.push('大牌偏多 — 有結構性因素影響');
  if(wn>=3)ins.push('權杖多 — 核心在行動/衝動');
  if(cp>=3)ins.push('聖杯多 — 核心在情緒/關係');
  if(sw>=3)ins.push('寶劍多 — 核心在壓力/衝突');
  if(pn>=3)ins.push('金幣多 — 核心在金錢/現實');
  if(ct>=3)ins.push('宮廷牌多 — 人際角色是關鍵');
  const up=d.filter(c=>c.isUp).length;
  if(up>=8)ins.push('正位牌佔多數 — 能量順暢');
  else if(up<=3)ins.push('逆位牌佔多數 — 內在阻力明顯');
  return{majorCount:mj,wandCount:wn,cupCount:cp,swordCount:sw,pentCount:pn,courtCount:ct,uprightCount:up,insights:ins};
}

// ── C. 主分析函數 ──
function analyzeTarotSpread(drawn, type){
  if(!drawn||drawn.length<3) return{score:50,insights:[],summary:'',keyCards:{},gdAnalysis:null};
  const d=drawn.slice(0,(S.tarot&&S.tarot.spreadDef&&S.tarot.spreadDef.count)||drawn.length);
  const keyCards={present:d[0],obstacle:d[1],root:d[2],past:d[3],crown:d[4],near:d[5],self:d[6],environ:d[7],hope_fear:d[8],outcome:d[9]};

  const edScores=gdCalcED(d);
  const structure=gdStructure(d);

  const CP={};
  // ── 大牌（0-21）──
  [0,1,3,4,6,7,8,10,14,17,19,21].forEach(id=>{CP[id]=1;});   // 正向
  [13,15,16,18].forEach(id=>{CP[id]=-1;});                     // 負向
  [2,5,9,11,12,20].forEach(id=>{CP[id]=0;});                   // 中性
  // ── 權杖（22-35）──
  [22,24,25,27,28,29,32,33,34,35].forEach(id=>{CP[id]=1;});
  [26,31].forEach(id=>{CP[id]=-1;});
  [23,30].forEach(id=>{CP[id]=0;});
  // ── 聖杯（36-49）──
  [36,37,38,44,45,46,47,48,49].forEach(id=>{CP[id]=1;});
  [40,42,43].forEach(id=>{CP[id]=-1;});
  [39,41].forEach(id=>{CP[id]=0;});
  // ── 寶劍（50-63）──
  [50].forEach(id=>{CP[id]=1;});
  [52,54,55,57,58,59].forEach(id=>{CP[id]=-1;});
  [51,53,56,60,61,62,63].forEach(id=>{CP[id]=0;});
  // ── 金幣（64-77）──
  [64,66,71,72,73,74,75,76,77].forEach(id=>{CP[id]=1;});
  [68].forEach(id=>{CP[id]=-1;});
  [65,67,69,70].forEach(id=>{CP[id]=0;});

  let totalScore=0;
  const insights=[];

  d.forEach((c,i)=>{
    const w=GD_POS_WEIGHT[i];
    const pol=CP[c.id]||0;
    const ed=edScores[i]||0;
    let cs=0;
    if(c.isUp){cs=pol>=0?(1+pol*0.5):(-0.5);}
    else{if(pol>0)cs=-0.3;if(pol<0)cs=0.4;if(pol===0)cs=-0.5;}
    cs+=ed*0.3;
    totalScore+=cs*w;

    if(w>=2.5){
      const meaning=typeof getTarotTypeMeaning==='function'?getTarotTypeMeaning(c.id,c.isUp,type):(c.isUp?c.up:c.rv);
      insights.push({pos:CELTIC_POS[i],card:c.n,dir:c.isUp?'正位':'逆位',meaning:meaning||'',score:cs*w,role:GD_POS_ROLE[i],edScore:ed,court:gdCourtRole(c)});
    }
  });

  const score=Math.max(10,Math.min(90,Math.round(50+totalScore*2.2)));
  const _gtm=typeof getTarotTypeMeaning==='function'?getTarotTypeMeaning:function(id,up){return '';};
  const obM=_gtm(d[1].id,d[1].isUp,type)||(d[1].isUp?d[1].up:d[1].rv);
  const rootM=_gtm(d[2].id,d[2].isUp,type)||(d[2].isUp?d[2].up:d[2].rv);
  const envM=_gtm(d[7].id,d[7].isUp,type)||(d[7].isUp?d[7].up:d[7].rv);
  const outM=_gtm(d[9].id,d[9].isUp,type)||(d[9].isUp?d[9].up:d[9].rv);

  let summary='';
  if(d[9].isUp&&(CP[d[9].id]||0)>=0)summary+='整體走向正面。';
  else if(!d[9].isUp&&(CP[d[9].id]||0)<=0)summary+='需要特別留意風險。';
  else summary+='走向尚有變數。';

  return{score,insights,summary,keyCards,totalScore,
    gdAnalysis:{edScores,structure,courtRoles:d.map(c=>gdCourtRole(c)),
    priorityCards:{obstacle:obM,root:rootM,environ:envM,outcome:outM}}};
}

// ── D. 六大項目固定五段輸出 v2.0 — 引用牌名+花色能量+宮廷牌人物
function generateTarotStory(type,drawn){
  if(!drawn||drawn.length<3)return '';
  const d=drawn;
  function _m(i){const c=d[i];if(!c)return '';const tm=typeof getTarotTypeMeaning==='function'?getTarotTypeMeaning(c.id,c.isUp,type):null;return (tm||(c.isUp?c.up:c.rv)||'').replace(/[。．.，,]+$/,'');}
  function _s(s,n){return (s||'').replace(/[。．.，,]+$/,'').substring(0,n||30);}

  // ── 花色能量分析 ──
  const sc={wand:0,cup:0,sword:0,pent:0,major:0};
  const sn={wand:[],cup:[],sword:[],pent:[],major:[]};
  d.forEach(c=>{
    if(c.id<=21){sc.major++;sn.major.push(c.n);}
    else if(c.id<=35){sc.wand++;sn.wand.push(c.n);}
    else if(c.id<=49){sc.cup++;sn.cup.push(c.n);}
    else if(c.id<=63){sc.sword++;sn.sword.push(c.n);}
    else{sc.pent++;sn.pent.push(c.n);}
  });
  let suitInsight='';
  if(sc.wand>=3) suitInsight='⚡ 權杖主場（'+sn.wand.slice(0,3).join('、')+'）：行動力和意志力是關鍵，這件事要靠衝勁推動。';
  else if(sc.cup>=3) suitInsight='💧 聖杯主場（'+sn.cup.slice(0,3).join('、')+'）：情感才是核心，理性分析在這裡沒有直覺重要。';
  else if(sc.sword>=3) suitInsight='🌪 寶劍主場（'+sn.sword.slice(0,3).join('、')+'）：思緒與壓力主導，要先清理頭腦的戰場才能前進。';
  else if(sc.pent>=3) suitInsight='🌿 金幣主場（'+sn.pent.slice(0,3).join('、')+'）：現實條件和物質面是決定因素，別只靠情感判斷。';
  else if(sc.major>=5) suitInsight='✦ 大牌過半（'+sn.major.slice(0,3).join('、')+'…）：命運層級的議題，有更大的力量在運作。';
  else if(sc.major>=3) suitInsight='✦ 大牌'+sc.major+'張（'+sn.major.slice(0,2).join('、')+'…）：這件事有超出日常的結構性因素，不只是表面問題。';

  const struct=gdStructure(d);
  const ob=_m(1),root=_m(2),env=_m(7),self=_m(6),near=_m(5),out=_m(9);
  const envCt=typeof gdCourtRole==='function'?gdCourtRole(d[7]):null;
  const outUp=d[9].isUp;

  const _cardRef=(i)=>`【${d[i].n}${d[i].isUp?'正位':'逆位'}】`;

  let conclusion='',reasons=[],nearEvent='',actions=[],trend='';

  if(type==='love'){
    conclusion=outUp&&d[0].isUp?'牌面整體指向可成局，感情有推進可能':outUp||d[5].isUp?'有機會但要有耐心，不是現在就能到位':'目前牌面不建議急著投入，先觀察再說';
    reasons=[_cardRef(1)+' 卡點：'+_s(ob,30),_cardRef(2)+' 真正的原因：'+_s(root,30),_cardRef(7)+' 對方/外在'+(envCt?'（'+envCt+'）':'')+' ：'+_s(env,30)];
    nearEvent=_cardRef(5)+' 近期動向：'+near;
    actions=[_cardRef(6)+' 你的狀態：'+_s(self,30),d[5].isUp?_cardRef(5)+' 現在可以主動一點，但不要急':'先給空間觀察，不要強迫進度',d[8].isUp?_cardRef(8)+' 內心的期待是對的，跟著感覺走':'先處理內心的恐懼和不安再行動'];
    trend=outUp?_cardRef(9)+' 感情能量向上：'+out:_cardRef(9)+' 感情目前有停滯：'+out;
  } else if(type==='career'){
    conclusion=outUp&&d[0].isUp?'適合行動，條件到位了':outUp||d[5].isUp?'先準備好再出手，窗口在近期':'不建議大動作，先穩住觀察';
    reasons=[_cardRef(1)+' 主要障礙：'+_s(ob,30),_cardRef(2)+' 真正驅動你的：'+_s(root,30),_cardRef(7)+' 外部環境/職場氛圍：'+_s(env,30)];
    nearEvent=_cardRef(5)+' 近期機會窗口：'+near;
    actions=[_cardRef(6)+' 你自身的狀態：'+_s(self,30),d[5].isUp?'近期有窗口，'+_cardRef(5)+'準備好就出手':'先穩住，'+_cardRef(5)+'顯示時機還不夠成熟',d[8].isUp?_cardRef(8)+' 方向是對的，繼續':'放下對失敗的恐懼，那是阻礙你行動的最大卡點'];
    trend=outUp?_cardRef(9)+' 事業走向：'+out:_cardRef(9)+' 有風險要注意：'+out;
  } else if(type==='wealth'){
    conclusion=outUp&&d[0].isUp?'正財運有利，可以行動':d[5].isUp?'短期有機會，但要謹慎控制':'守財為主，這段時間不適合冒進';
    reasons=[_cardRef(1)+' 財務卡點：'+_s(ob,30),_cardRef(2)+' 投資心態/金錢觀：'+_s(root,30),_cardRef(7)+' 市場/外部環境：'+_s(env,30)];
    nearEvent=_cardRef(5)+' 近期財運動向：'+near;
    actions=[_cardRef(6)+' 你的理財態度：'+_s(self,30),d[5].isUp?'近期有機會，'+_cardRef(5)+'但控制好預算和風險敞口':'先止損止血，'+_cardRef(5)+'顯示時機未到',d[8].isUp?_cardRef(8)+' 別被FOMO驅動':'控制恐懼，不要情緒化決策'];
    trend=outUp?_cardRef(9)+' 財運趨勢：'+out:_cardRef(9)+' 保守應對：'+out;
  } else if(type==='health'){
    conclusion=outUp?'整體能量好轉，好好配合':d[5].isUp?'需要主動調整作息和心態':'建議儘快認真面對，不要拖';
    reasons=[_cardRef(1)+' 健康卡點/障礙：'+_s(ob,30),_cardRef(2)+' 壓力根源：'+_s(root,30),_cardRef(7)+' 環境/外在因素：'+_s(env,30)];
    nearEvent=_cardRef(5)+' 近期身心動向：'+near;
    actions=[_cardRef(6)+' 你能做的：'+_s(self,30),d[5].isUp?_cardRef(5)+' 正在恢復，配合休息效果會加倍':'症狀可能反覆，規律作息是關鍵，不要等感覺好了就放棄','若持續不適請就醫，牌只是能量參考'];
    trend=outUp?_cardRef(9)+' 趨勢好轉：'+out:_cardRef(9)+' 需積極處理：'+out;
  } else if(type==='relationship'){
    conclusion=outUp&&d[0].isUp?'可以合作，條件到位':outUp?'可以，但要加一些條件和邊界':'目前不建議深入，有風險';
    reasons=[_cardRef(1)+' 主要問題：'+_s(ob,30),_cardRef(2)+' 對方真正的動機：'+_s(root,30),_cardRef(7)+' 關鍵人物/外部'+(envCt?'（'+envCt+'）':'')+' ：'+_s(env,30)];
    nearEvent=_cardRef(5)+' 近期動向：'+near;
    actions=[_cardRef(6)+' 你的定位：'+_s(self,30),d[5].isUp?'談判窗口在近期，'+_cardRef(5)+'準備好就出手':'先觀察對方真正的意圖，'+_cardRef(5)+'顯示還不是時候',d[8].isUp?_cardRef(8)+' 堅持底線':'別因怕撕破臉而讓步太多'];
    trend=outUp?_cardRef(9)+' 合作方向：'+out:_cardRef(9)+' 有風險：'+out;
  } else if(type==='family'){
    conclusion=outUp?'關係可以修復，有希望':d[5].isUp?'需要主動溝通，窗口快來了':'需要時間和距離，強求沒用';
    reasons=[_cardRef(1)+' 衝突點：'+_s(ob,30),_cardRef(2)+' 情緒核心：'+_s(root,30),_cardRef(7)+' 家人的影響：'+_s(env,30)];
    nearEvent=_cardRef(5)+' 近期家庭動向：'+near;
    actions=[_cardRef(6)+' 你扮演的角色：'+_s(self,30),d[5].isUp?_cardRef(5)+' 近期有修復窗口，可以先開口':'先給彼此空間，不要逼對方現在就和解',d[8].isUp?_cardRef(8)+' 期盼被理解的方向是對的':'先放下一定要被理解的執念，給時間'];
    trend=outUp?_cardRef(9)+' 家庭走向：'+out:_cardRef(9)+' 需要更多耐心：'+out;
  } else {
    conclusion=outUp?'整體能量正面':d[5].isUp?'有機會但需要努力':'建議謹慎，先觀察';
    reasons=[_cardRef(1)+' 卡點：'+_s(ob,30),_cardRef(2)+' 根本原因：'+_s(root,30),_cardRef(7)+' 外在環境：'+_s(env,30)];
    nearEvent=_cardRef(5)+' 近期走向：'+near;
    actions=[_cardRef(6)+' 你的狀態：'+_s(self,30),d[5].isUp?_cardRef(5)+' 近期有正面發展，把握機會':_cardRef(5)+' 近期需要穩住，先守後攻',d[8].isUp?_cardRef(8)+' 信任自己的方向':'先處理內心的不安，不然行動也無力'];
    trend=outUp?_cardRef(9)+' 趨勢正面：'+out:_cardRef(9)+' 需調整策略：'+out;
  }

  let s='<strong>牌面結論：'+conclusion+'</strong>';
  const futM=_s(_m(5),20), resM=_s(_m(9),20);
  s+='<br><br>🔗 <strong>因果脈絡：</strong>';
  s+=_cardRef(0)+'（'+_s(_m(0),20)+'）是你目前的處境，';
  s+='被'+_cardRef(1)+'（'+_s(ob,18)+'）橫在中間；';
  s+=d[5].isUp?'只要順著'+_cardRef(5)+'的能量（'+futM+'）向前推進，':'正視'+_cardRef(5)+'帶來的課題（'+futM+'），';
  s+=d[9].isUp?'最終將迎來'+_cardRef(9)+'的正面結局（'+resM+'）。':'結果'+_cardRef(9)+'仍需更多調整（'+resM+'）。';
  s+='<br><br>📌 <strong>關鍵原因：</strong>';
  reasons.forEach(r=>{s+='<br>• '+r;});
  s+='<br><br>📅 <strong>近期走向：</strong>'+nearEvent;
  s+='<br><br>🎯 <strong>你該做什麼：</strong>';
  actions.forEach(a=>{s+='<br>• '+a;});
  s+='<br><br>📈 <strong>結果趨勢：</strong>'+trend;
  if(suitInsight) s+='<br><br><span style="font-size:.82rem;color:var(--c-text-dim)">'+suitInsight+'</span>';
  if(struct.insights.length>0) s+='<br><span style="font-size:.82rem;color:var(--c-text-dim)">✦ '+struct.insights[0]+'</span>';
  if(type==='wealth') s+='<br><span style="font-size:.78rem;color:var(--c-text-muted)">⚠ 僅作參考，不構成投資建議</span>';
  if(type==='health') s+='<br><span style="font-size:.78rem;color:var(--c-text-muted)">⚠ 此分析僅為能量狀態指引，實際身體狀況與醫療決策請以專業醫師診斷為主。</span>';
  return s;
}


var CELTIC_POS=['現況核心','阻礙／交叉因素','根因／底層動機','已發生／近期過去','顯性目標／意識層','近期走向','你的位置','外界／環境','希望與恐懼','結果／趨勢'];

let drawnCards=[];
let deckShuffled=[];
let pickAnimating=false;

/* ═══ 塔羅鎖定顯示：同一天同人同問題，牌陣已定 ═══ */
function showTarotLocked(){
  // 填入凱爾特十字牌位
  const chosen=document.getElementById('t-chosen');
  const posLabels=CELTIC_POS;
  chosen.innerHTML=`
    <div class="celtic-cross">
      <div class="tarot-chosen-slot cc-5 filled" id="t-slot-4"><span class="slot-num">5</span></div>
      <div class="tarot-chosen-slot cc-4 filled" id="t-slot-3"><span class="slot-num">4</span></div>
      <div class="tarot-chosen-slot cc-1 filled" id="t-slot-0"><span class="slot-num">1</span></div>
      <div class="tarot-chosen-slot cc-2 filled" id="t-slot-1"><span class="slot-num">2</span></div>
      <div class="tarot-chosen-slot cc-6 filled" id="t-slot-5"><span class="slot-num">6</span></div>
      <div class="tarot-chosen-slot cc-3 filled" id="t-slot-2"><span class="slot-num">3</span></div>
    </div>
    <div class="celtic-staff">
      <div class="tarot-chosen-slot filled" id="t-slot-9"><span class="slot-num">10</span></div>
      <div class="tarot-chosen-slot filled" id="t-slot-8"><span class="slot-num">9</span></div>
      <div class="tarot-chosen-slot filled" id="t-slot-7"><span class="slot-num">8</span></div>
      <div class="tarot-chosen-slot filled" id="t-slot-6"><span class="slot-num">7</span></div>
    </div>`;
  // 顯示已抽到的牌面
  drawnCards.forEach((c,i)=>{
    const slotEl=document.getElementById('t-slot-'+i);
    if(!slotEl)return;
    const isCelticCross = (S.tarot && S.tarot.spreadType === 'celtic_cross');
    const isCard2 = (i === 1 && isCelticCross);
    const imgSrc=typeof getTarotCardImage==='function'?getTarotCardImage(c):'';
    slotEl.innerHTML=`<div class="tarot-reveal flipping" style="${isCard2?'transform:rotate(-90deg)':''}">
      <div class="tarot-reveal-inner">
        <div class="tarot-reveal-back"></div>
        <div class="tarot-reveal-front">
          ${imgSrc?`<img src="${imgSrc}" class="tc-img" style="${c.isUp?'':'transform:rotate(180deg)'}">`:``}
          <span class="tc-name" style="${c.isUp?'':'transform:rotate(180deg)'}">${c.n}</span>
          <span class="tc-dir ${c.isUp?'up':'rv'}">${c.isUp?'順位':'逆位'}</span>
        </div>
      </div>
    </div>${!isCard2?'<span class="slot-label">'+(c.pos||posLabels[i])+'</span>':''}`;
  });
  // 隱藏牌堆，顯示鎖定訊息
  const deckEl=document.getElementById('t-deck');
  deckEl.innerHTML='<div class="energy-locked-badge" style="margin:1rem auto;text-align:center"><i class="fas fa-lock"></i> 牌陣已定 — 同日同問題不可重複抽牌，心誠則靈</div>';
  // 隱藏抽牌提示
  const hint=document.getElementById('pick-hint');
  if(hint) hint.style.display='none';
  // 啟用分析按鈕
  const btn=document.getElementById('btn-analyze');
  if(btn) btn.disabled=false;
  // 更新計數
  const countEl=document.getElementById('t-remain-picked');
  var _tc = (S.tarot && S.tarot.spreadDef && S.tarot.spreadDef.count) ? S.tarot.spreadDef.count : 10; if(countEl) countEl.textContent=String(_tc);
  // 顯示展開區
  S.tarot.drawn=drawnCards;
  S.tarot.spread=drawnCards;
  showSpread();
}

// ═══════════════════════════════════════════════════════════════
// 3D 雙排塔羅牌堆 — 對向漂移 + 弧形透視 + 粒子選牌
// ═══════════════════════════════════════════════════════════════
var _deck3dRAF=null, _deck3dPaused=false;
var _deck3dTopOff=0, _deck3dBotOff=0;
var _deck3dDragging=false, _deck3dVelX=0;
var _deck3dReducedMotion=window.matchMedia&&window.matchMedia('(prefers-reduced-motion:reduce)').matches;

function initTarotDeck(){
  // ═══ 塔羅鎖定 ═══
  var _maxC=(S.tarot&&S.tarot.spreadDef&&S.tarot.spreadDef.count)||10;
  if(drawnCards.length>=_maxC && !S._isAdmin){ showTarotLocked(); return; }
  if(drawnCards.length>=_maxC && S._isAdmin){ drawnCards=[]; console.log('[管理員] 重置塔羅牌'); }

  // ═══ 洗牌 ═══
  if(S._isAdmin){
    deckShuffled=[...TAROT].sort(function(){return Math.random()-0.5});
  } else if(S.form&&S.form.bdate&&S.form.gender&&S.form.type){
    var _rng=makeSeededRng(S.form.bdate,S.form.gender,S.form.type,S.form.question);
    deckShuffled=seededShuffle(TAROT,_rng);
  } else {
    deckShuffled=[...TAROT].sort(function(){return Math.random()-0.5});
  }
  drawnCards=[];
  pickAnimating=false;

  // ═══ 牌位區（凱爾特十字）═══
  var chosen=document.getElementById('t-chosen');
  var posLabels=CELTIC_POS;
  chosen.innerHTML=
    '<div class="celtic-cross">'+
      '<div class="tarot-chosen-slot cc-5" id="t-slot-4"><span class="slot-num">5</span><span class="slot-label">'+posLabels[4]+'</span></div>'+
      '<div class="tarot-chosen-slot cc-4" id="t-slot-3"><span class="slot-num">4</span><span class="slot-label">'+posLabels[3]+'</span></div>'+
      '<div class="tarot-chosen-slot cc-1" id="t-slot-0"><span class="slot-num">1</span><span class="slot-label">'+posLabels[0]+'</span></div>'+
      '<div class="tarot-chosen-slot cc-2" id="t-slot-1"><span class="slot-num">2</span><span class="slot-label">'+posLabels[1]+'</span></div>'+
      '<div class="tarot-chosen-slot cc-6" id="t-slot-5"><span class="slot-num">6</span><span class="slot-label">'+posLabels[5]+'</span></div>'+
      '<div class="tarot-chosen-slot cc-3" id="t-slot-2"><span class="slot-num">3</span><span class="slot-label">'+posLabels[2]+'</span></div>'+
    '</div>'+
    '<div class="celtic-staff">'+
      '<div class="tarot-chosen-slot" id="t-slot-9"><span class="slot-num">10</span><span class="slot-label">'+posLabels[9]+'</span></div>'+
      '<div class="tarot-chosen-slot" id="t-slot-8"><span class="slot-num">9</span><span class="slot-label">'+posLabels[8]+'</span></div>'+
      '<div class="tarot-chosen-slot" id="t-slot-7"><span class="slot-num">8</span><span class="slot-label">'+posLabels[7]+'</span></div>'+
      '<div class="tarot-chosen-slot" id="t-slot-6"><span class="slot-num">7</span><span class="slot-label">'+posLabels[6]+'</span></div>'+
    '</div>';

  // ═══ 3D 雙排牌堆（牌面朝上 + 背景輪播）═══
  var deckEl=document.getElementById('t-deck');
  var half=Math.ceil(deckShuffled.length/2);
  var topHtml='', botHtml='';

  for(var i=0;i<half;i++){
    var d=(i*0.13).toFixed(2);
    var imgUrl=(typeof getTarotCardImage==='function')?getTarotCardImage(deckShuffled[i]):'';
    var faceCss=imgUrl?'background-image:url('+imgUrl+')':'background:#1a1a2e';
    topHtml+='<div class="tarot-deck-card" data-idx="'+i+'" style="--float-delay:'+d+'s"><div class="tarot-deck-card-inner"><div class="tdc-face" style="'+faceCss+'"></div><div class="tdc-back"></div></div></div>';
  }
  for(var i=half;i<deckShuffled.length;i++){
    var d=((i-half)*0.13).toFixed(2);
    var imgUrl=(typeof getTarotCardImage==='function')?getTarotCardImage(deckShuffled[i]):'';
    var faceCss=imgUrl?'background-image:url('+imgUrl+')':'background:#1a1a2e';
    botHtml+='<div class="tarot-deck-card" data-idx="'+i+'" style="--float-delay:'+d+'s"><div class="tarot-deck-card-inner"><div class="tdc-face" style="'+faceCss+'"></div><div class="tdc-back"></div></div></div>';
  }

  // 背景輪播 + 雙份牌（無縫循環）
  deckEl.className='tarot-3d-stage';
  var bgHtml='<div class="tarot-stage-bg">';
  for(var b=1;b<=6;b++) bgHtml+='<div class="tarot-stage-bg-img" style="background-image:url(\'img/tarot-bg-'+b+'.jpg\')"></div>';
  bgHtml+='</div>';
  deckEl.innerHTML=bgHtml+
    '<div class="tarot-3d-row tarot-3d-top" id="t-row-top">'+topHtml+topHtml+'</div>'+
    '<div class="tarot-3d-row tarot-3d-bot" id="t-row-bot">'+botHtml+botHtml+'</div>';

  // 綁定桌面點擊（保留，桌面版沒問題）
  deckEl.querySelectorAll('.tarot-deck-card').forEach(function(el){
    el.addEventListener('click',function(){ pickCard(parseInt(el.dataset.idx),el); });
  });

  // ★ v28：3D 透視觸控修復——在 stage 容器層級捕獲 touch，手動找最近的牌
  // 3D perspective+rotateX 讓瀏覽器的 hit-test 偏移，所以不能依賴個別牌的 touch 事件
  (function(){
    var _stgTouchMoved = false;
    deckEl.addEventListener('touchstart', function(){ _stgTouchMoved = false; }, {passive:true});
    deckEl.addEventListener('touchmove', function(){ _stgTouchMoved = true; }, {passive:true});
    deckEl.addEventListener('touchend', function(e){
      if (_stgTouchMoved) return;
      var touch = e.changedTouches && e.changedTouches[0];
      if (!touch) return;
      var tx = touch.clientX, ty = touch.clientY;
      // 遍歷所有未選牌，找觸控點最近的那張
      var best = null, bestDist = 999999;
      deckEl.querySelectorAll('.tarot-deck-card:not(.picked)').forEach(function(card){
        var r = card.getBoundingClientRect();
        // 擴大判定範圍（上下左右各 12px）
        var cx = r.left + r.width/2;
        var cy = r.top + r.height/2;
        var dx = tx - cx, dy = ty - cy;
        var dist = Math.sqrt(dx*dx + dy*dy);
        // 只接受在牌面視覺範圍 + 20px 容差內的
        if (tx >= r.left - 20 && tx <= r.right + 20 && ty >= r.top - 20 && ty <= r.bottom + 20) {
          if (dist < bestDist) { bestDist = dist; best = card; }
        }
      });
      if (best) {
        e.preventDefault();
        pickCard(parseInt(best.dataset.idx), best);
      }
    });
  })();

  // 啟動 3D 自動漂移
  _startDeck3D(half, deckShuffled.length-half);

  document.getElementById('t-remain-picked').textContent='0';
  document.getElementById('btn-analyze').disabled=true;

  // ★ v28：洗牌機制 — 先展示牌面，洗牌後才能選牌
  window._deckIsShuffled = false;

  // 隱藏選牌提示，改顯示「欣賞牌面」
  var pickHint = document.getElementById('pick-hint');
  if (pickHint) pickHint.innerHTML = '✨ 滑動欣賞 78 張牌面 ✨';

  // 隱藏快速全抽按鈕
  var autoDrawBtn = document.querySelector('#step-2 .btn-outline');
  if (autoDrawBtn) autoDrawBtn.style.display = 'none';

  // 插入洗牌按鈕
  var shuffleWrap = document.querySelector('#step-2 .text-center');
  if (shuffleWrap) {
    var sfBtn = document.createElement('button');
    sfBtn.className = 'jy-shuffle-btn';
    sfBtn.id = 'jy-shuffle-btn';
    sfBtn.innerHTML = '🌀 洗牌・開始選牌';
    shuffleWrap.insertBefore(sfBtn, shuffleWrap.firstChild);

    sfBtn.addEventListener('click', function() {
      if (window._deckIsShuffled) return;
      sfBtn.style.pointerEvents = 'none';
      sfBtn.innerHTML = '✦ 洗牌中⋯';

      var topRow = document.getElementById('t-row-top');
      var botRow = document.getElementById('t-row-bot');
      var cardW = 76;
      var half = Math.ceil(deckShuffled.length / 2);
      var _botLoopW = (deckShuffled.length - half) * cardW;
      var allCards = deckEl.querySelectorAll('.tarot-deck-card');

      // ═══ Phase 1：波浪翻面（face → back）═══
      var flipDelay = 0;
      allCards.forEach(function(card) {
        setTimeout(function() {
          card.classList.add('shuffling');
          setTimeout(function() {
            var face = card.querySelector('.tdc-face');
            var back = card.querySelector('.tdc-back');
            if (face) face.style.display = 'none';
            if (back) back.style.transform = 'none';
          }, 230);
        }, flipDelay);
        flipDelay += 18;
      });

      var t1 = flipDelay + 500;

      // ═══ Phase 2：聚攏（兩排滑向中央重疊）═══
      setTimeout(function() {
        // 停掉 RAF 漂移引擎
        if (_deck3dRAF) { cancelAnimationFrame(_deck3dRAF); _deck3dRAF = null; }

        // 金色光暈
        deckEl.classList.add('shuffling-glow');

        // 清個別牌 3D 效果
        allCards.forEach(function(card) {
          card.style.transform = '';
          card.style.visibility = '';
          card.classList.remove('shuffling', 'deck-center');
          var inner = card.firstElementChild;
          if (inner) { inner.style.filter = ''; inner.style.animation = 'none'; }
        });

        // 兩排向中心聚攏 + 攤平
        topRow.style.transition = 'transform .5s cubic-bezier(.4,0,.2,1)';
        botRow.style.transition = 'transform .5s cubic-bezier(.4,0,.2,1)';
        topRow.style.transform = 'translateX(' + _deck3dTopOff.toFixed(1) + 'px) translateY(52px) rotateX(0deg)';
        botRow.style.transform = 'translateX(' + (_deck3dBotOff - _botLoopW).toFixed(1) + 'px) translateY(-52px) rotateX(0deg)';
      }, t1);

      var t2 = t1 + 550;

      // ═══ Phase 3：Riffle 洗牌（交替跳動 ×3 輪）═══
      setTimeout(function() {
        topRow.style.transition = 'none';
        botRow.style.transition = 'none';

        var topCards = topRow.querySelectorAll('.tarot-deck-card');
        var botCards = botRow.querySelectorAll('.tarot-deck-card');

        for (var round = 0; round < 3; round++) {
          var rDelay = round * 300;
          [topCards, botCards].forEach(function(cards, rowIdx) {
            for (var i = 0; i < cards.length; i++) {
              (function(card, idx, rd) {
                setTimeout(function() {
                  // 交替上下跳 + 輕微隨機旋轉
                  var jitter = (idx % 2 === 0) ? -14 : 14;
                  var rot = (Math.random() - 0.5) * 6;
                  card.style.transition = 'transform .12s ease-out';
                  card.style.transform = 'translateY(' + jitter + 'px) rotate(' + rot.toFixed(1) + 'deg)';
                  setTimeout(function() {
                    card.style.transform = 'translateY(0) rotate(0deg)';
                  }, 120);
                }, rd + idx * 6);
              })(cards[i], i, rDelay);
            }
          });
        }

        // 中心粒子爆發
        var stageRect = deckEl.getBoundingClientRect();
        var cx = stageRect.left + stageRect.width / 2;
        var cy = stageRect.top + stageRect.height / 2;
        _spawnParticles(cx, cy, 18);
        setTimeout(function() { _spawnParticles(cx + 30, cy - 10, 12); }, 300);
        setTimeout(function() { _spawnParticles(cx - 25, cy + 15, 12); }, 600);
      }, t2);

      var t3 = t2 + 1000;

      // ═══ Phase 4：切牌（上排右移、下排左移再回）═══
      setTimeout(function() {
        var curTopX = _deck3dTopOff;
        var curBotX = _deck3dBotOff - _botLoopW;

        topRow.style.transition = 'transform .25s ease-in-out';
        botRow.style.transition = 'transform .25s ease-in-out';
        topRow.style.transform = 'translateX(' + (curTopX + 60).toFixed(1) + 'px) translateY(52px) rotateX(0deg)';
        botRow.style.transform = 'translateX(' + (curBotX - 60).toFixed(1) + 'px) translateY(-52px) rotateX(0deg)';

        setTimeout(function() {
          topRow.style.transform = 'translateX(' + curTopX.toFixed(1) + 'px) translateY(52px) rotateX(0deg)';
          botRow.style.transform = 'translateX(' + curBotX.toFixed(1) + 'px) translateY(-52px) rotateX(0deg)';
        }, 280);
      }, t3);

      var t4 = t3 + 600;

      // ═══ Phase 5：展開回位 ═══
      setTimeout(function() {
        // 移除金色光暈
        deckEl.classList.remove('shuffling-glow');
        // 清個別牌 transition
        allCards.forEach(function(card) {
          card.style.transition = '';
          card.style.transform = '';
        });

        // 排回原位（帶彈簧）
        topRow.style.transition = 'transform .5s cubic-bezier(.34,1.56,.64,1)';
        botRow.style.transition = 'transform .5s cubic-bezier(.34,1.56,.64,1)';
        topRow.style.transform = 'translateX(' + _deck3dTopOff.toFixed(1) + 'px) rotateX(8deg)';
        botRow.style.transform = 'translateX(' + (_deck3dBotOff - _botLoopW).toFixed(1) + 'px) rotateX(-6deg)';

        // 中央一次最終粒子
        var stageRect = deckEl.getBoundingClientRect();
        _spawnParticles(stageRect.left + stageRect.width / 2, stageRect.top + stageRect.height / 2, 24);

        setTimeout(function() {
          // 清 transition，恢復浮動動畫
          topRow.style.transition = '';
          botRow.style.transition = '';
          allCards.forEach(function(card) {
            var inner = card.firstElementChild;
            if (inner) inner.style.animation = '';
          });

          // 重啟 RAF 漂移引擎
          _startDeck3D(half, deckShuffled.length - half);

          // 啟用選牌
          window._deckIsShuffled = true;
          sfBtn.remove();
          if (autoDrawBtn) autoDrawBtn.style.display = '';
          if (pickHint) {
            var count = (S.tarot && S.tarot.spreadDef && S.tarot.spreadDef.count) || 10;
            pickHint.innerHTML = '觸碰任一張你有感覺的牌，選出 <span id="t-target-count">' + count + '</span> 張';
          }
        }, 600);
      }, t4);
    });
  }
}

// ═══ 3D 漂移引擎 ═══
function _startDeck3D(topCount,botCount){
  if(_deck3dRAF) cancelAnimationFrame(_deck3dRAF);
  var topRow=document.getElementById('t-row-top');
  var botRow=document.getElementById('t-row-bot');
  if(!topRow||!botRow) return;

  var cardW=76; // 72px card + 4px gap
  var topLoopW=topCount*cardW;
  var botLoopW=botCount*cardW;
  var speed=_deck3dReducedMotion?0:0.25;

  _deck3dTopOff=0;
  _deck3dBotOff=0;
  _deck3dPaused=false;
  _deck3dDragging=false;

  function tick(){
    if(!_deck3dPaused&&!_deck3dDragging){
      _deck3dTopOff-=speed;
      _deck3dBotOff+=speed;
    }
    // 循環
    if(_deck3dTopOff<=-topLoopW) _deck3dTopOff+=topLoopW;
    if(_deck3dTopOff>0) _deck3dTopOff-=topLoopW;
    if(_deck3dBotOff>=botLoopW) _deck3dBotOff-=botLoopW;
    if(_deck3dBotOff<0) _deck3dBotOff+=botLoopW;

    topRow.style.transform='translateX('+_deck3dTopOff.toFixed(1)+'px) rotateX(8deg)';
    botRow.style.transform='translateX('+(_deck3dBotOff-botLoopW).toFixed(1)+'px) rotateX(-6deg)';

    _update3DCards(topRow);
    _update3DCards(botRow);

    _deck3dRAF=requestAnimationFrame(tick);
  }
  tick();

  // ── 觸控拖曳 ──
  var stage=document.getElementById('t-deck');
  if(!stage) return;
  var lastX=0, resumeTimer=null;

  stage.addEventListener('touchstart',function(e){
    _deck3dDragging=true;
    _deck3dVelX=0;
    lastX=e.touches[0].clientX;
    if(resumeTimer) clearTimeout(resumeTimer);
  },{passive:true});

  stage.addEventListener('touchmove',function(e){
    if(!_deck3dDragging) return;
    var x=e.touches[0].clientX;
    var dx=x-lastX;
    _deck3dVelX=dx;
    lastX=x;
    _deck3dTopOff+=dx;
    _deck3dBotOff-=dx;
  },{passive:true});

  stage.addEventListener('touchend',function(){
    _deck3dDragging=false;
    // 慣性
    var mId=setInterval(function(){
      _deck3dVelX*=0.90;
      _deck3dTopOff+=_deck3dVelX;
      _deck3dBotOff-=_deck3dVelX;
      if(Math.abs(_deck3dVelX)<0.25) clearInterval(mId);
    },16);
    // 2秒後恢復自動漂移
    resumeTimer=setTimeout(function(){ _deck3dPaused=false; },2000);
  });
}

// ═══ 3D 透視計算 ═══
function _update3DCards(rowEl){
  var stage=rowEl.parentElement;
  if(!stage) return;
  var sR=stage.getBoundingClientRect();
  var centerX=sR.left+sR.width/2;
  var halfW=sR.width/2;
  if(halfW<1) return;

  for(var i=0,len=rowEl.children.length;i<len;i++){
    var card=rowEl.children[i];
    if(card.classList.contains('picked')||card.classList.contains('lifting')) continue;
    var cR=card.getBoundingClientRect();
    // 跳過畫面外的牌
    if(cR.right<sR.left-80||cR.left>sR.right+80){
      card.style.visibility='hidden'; continue;
    }
    card.style.visibility='';
    var dist=(cR.left+cR.width/2-centerX)/halfW; // -1..1
    var ad=Math.abs(dist);

    var rotY=dist*25;
    var sc=1-ad*0.2;
    var bright=1-ad*0.4;

    card.style.transform='rotateY('+rotY.toFixed(1)+'deg) scale('+Math.max(sc,0.7).toFixed(3)+')';
    var inner=card.firstElementChild;
    if(inner) inner.style.filter='brightness('+Math.max(bright,0.4).toFixed(2)+')';

    if(ad<0.13){
      if(!card.classList.contains('deck-center')) card.classList.add('deck-center');
    } else {
      if(card.classList.contains('deck-center')) card.classList.remove('deck-center');
    }
  }
}

// ═══ 快速全抽（串連式：前一張動畫完才抽下一張）═══
function autoDraw(){
  if(!deckShuffled.length) initTarotDeck();
  // ★ v28：如果還沒洗牌，先自動洗牌再全抽
  if (!window._deckIsShuffled) {
    var sfBtn = document.getElementById('jy-shuffle-btn');
    if (sfBtn) sfBtn.click();
    // 等洗牌完成後再自動抽
    setTimeout(function(){ autoDraw(); }, 5000);
    return;
  }
  var _tgt=(S.tarot&&S.tarot.spreadDef&&S.tarot.spreadDef.count)||10;
  if(drawnCards.length>=_tgt) return;

  var deckEl=document.getElementById('t-deck');
  if(!deckEl) return;
  var cards=deckEl.querySelectorAll('.tarot-deck-card:not(.picked)');
  if(!cards.length) return;

  // 去重：同 data-idx 只取第一個（因為有 clone）
  var seen={};
  var unique=[];
  for(var i=0;i<cards.length;i++){
    var idx=cards[i].dataset.idx;
    if(!seen[idx]){ seen[idx]=1; unique.push(cards[i]); }
  }
  var remaining=_tgt-drawnCards.length;
  var toPick=unique.slice(0,remaining);

  var step=0;
  function _next(){
    if(step>=toPick.length||drawnCards.length>=_tgt) return;
    if(pickAnimating){
      setTimeout(_next,80);
      return;
    }
    pickCard(parseInt(toPick[step].dataset.idx),toPick[step]);
    step++;
    setTimeout(_next,120);
  }
  _next();
}

// ═══ 金色粒子爆發 ═══
function _spawnParticles(cx,cy,count){
  if(_deck3dReducedMotion) return;
  for(var i=0;i<count;i++){
    var p=document.createElement('div');
    p.className='tarot-particle';
    var angle=(Math.PI*2/count)*i+(Math.random()-0.5)*0.6;
    var r=28+Math.random()*45;
    p.style.left=cx+'px';
    p.style.top=cy+'px';
    p.style.setProperty('--px',(Math.cos(angle)*r).toFixed(0)+'px');
    p.style.setProperty('--py',(Math.sin(angle)*r).toFixed(0)+'px');
    p.style.animationDelay=(Math.random()*0.12).toFixed(2)+'s';
    p.style.width=(3+Math.random()*4).toFixed(0)+'px';
    p.style.height=p.style.width;
    document.body.appendChild(p);
    setTimeout(function(el){return function(){el.remove()}}(p),750);
  }
}

// ═══ 選牌：升起 → 粒子 → 飛牌 → 翻牌 ═══
function pickCard(deckIdx,deckEl){
  // ★ v28：洗牌前不能選牌
  if (!window._deckIsShuffled) return;
  var _maxC=(S.tarot&&S.tarot.spreadDef&&S.tarot.spreadDef.count)||10;
  if(pickAnimating||drawnCards.length>=_maxC||deckEl.classList.contains('picked')) return;
  pickAnimating=true;

  var card=deckShuffled[deckIdx];

  // 正逆位（seeded）
  var isUp;
  if(S.form&&S.form.bdate&&S.form.gender&&S.form.type){
    var _r=makeSeededRng(S.form.bdate,S.form.gender,S.form.type,S.form.question);
    for(var _k=0;_k<=card.id;_k++) _r();
    isUp=_r()>=0.5;
  } else { isUp=Math.random()>=0.5; }

  var slotIdx=drawnCards.length;
  var pos=CELTIC_POS[slotIdx];

  // ── Phase 1: 升起 + 粒子 ──
  deckEl.classList.add('lifting');
  var deckRect=deckEl.getBoundingClientRect();
  var cx=deckRect.left+deckRect.width/2;
  var cy=deckRect.top+deckRect.height/2;
  _spawnParticles(cx,cy,11);

  // ── Phase 2: 標記所有同 idx 的 clone 為 picked，創建飛牌 ──
  setTimeout(function(){
    // 標記 picked（含 duplicate）
    var allDup=document.querySelectorAll('.tarot-deck-card[data-idx="'+deckIdx+'"]');
    for(var d=0;d<allDup.length;d++){
      allDup[d].classList.add('picked');
      allDup[d].classList.remove('lifting');
    }

    var slotEl=document.getElementById('t-slot-'+slotIdx);
    if(!slotEl){ pickAnimating=false; return; }
    var slotRect=slotEl.getBoundingClientRect();

    // 飛牌
    var fly=document.createElement('div');
    fly.className='tarot-fly-card';
    fly.style.left=deckRect.left+'px';
    fly.style.top=deckRect.top+'px';
    fly.style.width=deckRect.width+'px';
    fly.style.height=deckRect.height+'px';
    document.body.appendChild(fly);

    requestAnimationFrame(function(){
      fly.style.left=slotRect.left+'px';
      fly.style.top=slotRect.top+'px';
      fly.style.width=slotRect.width+'px';
      fly.style.height=slotRect.height+'px';
    });

    // ── Phase 3: 落定翻牌 ──
    setTimeout(function(){
      fly.remove();
      slotEl.classList.add('filled');
      var drawnCard={id:card.id,n:card.n,suit:card.suit,up:card.up,rv:card.rv,isUp:isUp,pos:pos};
      // 複製 card 的其他屬性
      for(var k in card){ if(!drawnCard.hasOwnProperty(k)) drawnCard[k]=card[k]; }

      var imgSrc=typeof getTarotCardImage==='function'?getTarotCardImage(drawnCard):'';
      var isCelticCross2=(S.tarot&&S.tarot.spreadType==='celtic_cross');
      var isCard2=(slotIdx===1&&isCelticCross2);

      slotEl.innerHTML='<div class="tarot-reveal" id="t-rev-'+slotIdx+'" style="'+(isCard2?'transform:rotate(-90deg)':'')+'">'+
        '<div class="tarot-reveal-inner">'+
          '<div class="tarot-reveal-back"></div>'+
          '<div class="tarot-reveal-front">'+
            (imgSrc?'<img src="'+imgSrc+'" class="tc-img" style="'+(isUp?'':'transform:rotate(180deg)')+'">':'')+
            '<span class="tc-name" style="'+(isUp?'':'transform:rotate(180deg)')+'">'+card.n+'</span>'+
            '<span class="tc-dir '+(isUp?'up':'rv')+'">'+(isUp?'順位':'逆位')+'</span>'+
          '</div>'+
        '</div>'+
      '</div>'+(!isCard2?'<span class="slot-label">'+pos+'</span>':'');

      // 翻牌
      setTimeout(function(){
        var rev=document.getElementById('t-rev-'+slotIdx);
        if(rev) rev.classList.add('flipping');
      },200);

      drawnCards.push(drawnCard);
      var pickedEl=document.getElementById('t-remain-picked');
      if(pickedEl) pickedEl.textContent=drawnCards.length;

      var _targetCount=(S.tarot&&S.tarot.spreadDef&&S.tarot.spreadDef.count)?S.tarot.spreadDef.count:10;
      var _btnAna=document.getElementById('btn-analyze');
      if(drawnCards.length>=3&&_btnAna&&_btnAna.disabled) _btnAna.disabled=false;

      if(drawnCards.length>=_targetCount){
        var hint=document.getElementById('pick-hint');
        if(hint) hint.style.display='none';
        S.tarot.drawn=drawnCards;
        S.tarot.spread=drawnCards;
        showSpread();
        // 停止 3D 漂移
        if(_deck3dRAF){ cancelAnimationFrame(_deck3dRAF); _deck3dRAF=null; }
        setTimeout(function(){ var act=document.querySelector('#step-2 .actions'); if(act) act.scrollIntoView({behavior:'smooth',block:'center'}); },600);
      } else if(drawnCards.length>=3){
        var _hint=document.getElementById('pick-hint');
        if(_hint){ _hint.textContent='已可分析，抽滿 '+_targetCount+' 張更準確'; _hint.style.display=''; }
      }

      pickAnimating=false;
    },580);
  },400);
}


/* Legacy compat: old t-hand and t-remain */
Object.defineProperty(document.getElementById('t-remain-picked')||document.createElement('span'),'__legacy',{get:function(){return drawnCards.length}});

// ===== [UPGRADE: showSpread DEEP VERSION] =====
function showSpread(){
  S.tarot.drawn=drawnCards;
  S.tarot.spread=drawnCards;
  document.getElementById('t-spread-sec').classList.remove('hidden');
  const el=document.getElementById('t-spread');
  el.innerHTML=drawnCards.map((c,i)=>{
    const imgSrc=typeof getTarotCardImage==='function'?getTarotCardImage(c):'';
    // 讀取 deep 欄位
    const dp=typeof getTarotDeep==='function'?getTarotDeep(c):{};
    const coreDesc=c.isUp?(dp.coreUp||''):(dp.coreRv||'');
    const adviceDesc=c.isUp?(dp.adviceUp||''):(dp.adviceRv||'');
    const posLabel=(typeof TAROT_POS_META!=='undefined'&&TAROT_POS_META[i])?TAROT_POS_META[i].label:(c.pos||'');
    return `
    <div class="card" style="padding:var(--sp-md);margin-bottom:var(--sp-sm)">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--sp-xs)">
        <span class="tag tag-gold">${i+1}. ${posLabel}</span>
        <span class="tag ${c.isUp?'tag-blue':'tag-red'}">${c.isUp?'順位':'逆位'}</span>
      </div>
      <div style="display:flex;gap:var(--sp-md);align-items:flex-start">
        ${imgSrc?`<img src="${imgSrc}" alt="${c.n}" class="tc-spread-img" style="width:72px;height:112px;border-radius:6px;flex-shrink:0;${c.isUp?'':'transform:rotate(180deg)'}">`:``}
        <div>
          <strong class="text-gold serif">${c.n}</strong>
          <p class="text-sm text-dim mt-sm">${c.isUp?c.up:c.rv}</p>
          ${coreDesc?`<p class="text-sm mt-sm" style="color:var(--c-gold-light,#d4af37);font-size:0.78rem">${coreDesc}</p>`:''}
          ${adviceDesc?`<p class="text-xs" style="opacity:0.6;margin-top:2px">💡 ${adviceDesc}</p>`:''}
        </div>
      </div>
    </div>`;
  }).join('');
}
// ===== [UPGRADE: showSpread DEEP VERSION END] =====

// ── Tarot type-specific meanings (getTarotTypeMeaning) (lines 6571-6920) ──
/* =============================================================
   RENDER FUNCTIONS — 結果頁渲染
   ============================================================= */
function showDim(id){
  document.querySelectorAll('.dim-tab').forEach((t,i)=>{
    const tabIds=['bazi','ziwei','natal','jyotish','meihua','tarot','name'];
    t.classList.toggle('active',tabIds[i]===id);
  });
  document.querySelectorAll('.dim-pane').forEach(p=>p.classList.toggle('active',p.id==='pane-'+id));
}

function renderBazi(){
  const b=S.bazi; if(!b)return;
  const p=b.pillars;
  const labels=['時柱','日柱','月柱','年柱'];
  const cols=['hour','day','month','year'];

  // ═══ 白話結論卡片（三段式）═══
  const curDy=b.dayun?b.dayun.find(d=>d.isCurrent):null;
  const thisYear=new Date().getFullYear();
  const curLn=curDy&&curDy.liuNian?curDy.liuNian.find(l=>l.year===thisYear):null;

  // 第一段：你是什麼類型的人
  const TYPE_MAP={
    '身強':b.dmEl==='木'?'你是行動派，自帶主見和執行力':b.dmEl==='火'?'你是熱情派，感染力強但容易衝動':b.dmEl==='土'?'你是穩重派，可靠踏實但有時固執':b.dmEl==='金'?'你是原則派，果斷有效率但容易硬碰硬':b.dmEl==='水'?'你是靈活派，適應力強但容易猶豫':'你扛得住壓力，適合主動出擊',
    '身弱':b.dmEl==='木'?'你偏敏感纖細，需要好的環境才能發揮':b.dmEl==='火'?'你的熱情需要被支持，不適合單打獨鬥':b.dmEl==='土'?'你需要穩定的後盾，單打獨鬥會吃力':b.dmEl==='金'?'你的原則性強但資源有限，需要借力':b.dmEl==='水'?'你的直覺敏銳但能量不足，需要團隊':''
  };
  const typeKey=b.specialStructure ? '從格' : (b.strong?'身強':'身弱');
  let personType;
  if(b.specialStructure){
    personType = b.specialStructure.desc.length > 40 
      ? b.specialStructure.desc.substring(0, b.specialStructure.desc.indexOf('。')+1) 
      : b.specialStructure.desc;
  } else {
    personType=TYPE_MAP[typeKey]||'日主'+b.dm+'（'+b.dmEl+'行）'+(b.strong?'，基礎條件不錯':'，需要借力使力');
  }

  // 第二段：現在在哪個階段
  let stageDesc='';
  if(curDy){
    const dyGod=curDy.god||'';
    const dyScore=curDy.score||0;
    const dyGZ=curDy.gz||'';
    if(dyScore>=3) stageDesc='你現在正處於上升期（大運'+dyGZ+'），外在環境支持你，是出手的好時機';
    else if(dyScore>=1) stageDesc='你現在運勢平穩偏好（大運'+dyGZ+'），穩步推進是最佳策略';
    else if(dyScore>=-1) stageDesc='你現在處於平穩期（大運'+dyGZ+'），不宜冒進但可以蓄力';
    else stageDesc='你現在外在環境壓力較大（大運'+dyGZ+'），建議守穩、不要硬拼';
  }

  // 第三段：未來3年趨勢
  let trendDesc='';
  if(curDy&&curDy.liuNian){
    const next3=curDy.liuNian.filter(l=>l.year>=thisYear&&l.year<=thisYear+2);
    const goodYrs=next3.filter(l=>(l.score||0)>=1);
    const badYrs=next3.filter(l=>(l.score||0)<=-1);
    if(goodYrs.length>=2) trendDesc='未來三年整體偏順，'+(goodYrs.map(l=>l.year+'年').join('、'))+'是出手好時機';
    else if(badYrs.length>=2) trendDesc='未來三年壓力偏大，建議以守代攻，蓄積實力等待轉機';
    else trendDesc='未來三年起伏交替，有好有壞，關鍵是把握好的年份、穩住差的年份';
  }

  let insightHtml=`<div class="insight-card">
    <div class="insight-title">🧭 你是什麼樣的人</div>
    <div class="insight-sub">${personType}</div>
  </div>`;
  if(stageDesc) insightHtml+=`<div class="insight-card" style="border-left-color:#60a5fa">
    <div class="insight-title" style="color:#60a5fa">📍 你現在在哪個階段</div>
    <div class="insight-sub">${stageDesc}</div>
  </div>`;
  if(trendDesc) insightHtml+=`<div class="insight-card" style="border-left-color:#a78bfa">
    <div class="insight-title" style="color:#a78bfa">📈 未來3年趨勢</div>
    <div class="insight-sub">${trendDesc}</div>
  </div>`;

  // ═══ 專業命盤（摺疊）═══
  // 四柱表格
  let html='<div class="bazi-grid">';
  html+=cols.map((_,i)=>`<div class="bazi-cell header">${labels[i]}</div>`).join('');
  html+=cols.map(c=>{
    const g=p[c].gan;
    return`<div class="bazi-cell"><span class="gz">${g}</span><span class="el-tag el-${WX_G[g]||''}">${WX_G[g]||''}</span><div class="gz-sub">${c==='day'?'日主':(b.gods[c]?b.gods[c].gan:'—')}</div></div>`;
  }).join('');
  html+=cols.map(c=>{
    const z=p[c].zhi;
    const selfSit=changSheng(p[c].gan,z)||'—';
    return`<div class="bazi-cell"><span class="gz">${z}</span><span class="el-tag el-${WX_Z[z]||''}">${WX_Z[z]||''}</span><div class="gz-sub">${b.cs[c]||'—'}</div><div class="gz-sub" style="font-size:0.6rem;opacity:0.5">坐${selfSit}</div></div>`;
  }).join('');
  html+=cols.map(c=>{
    const cg=b.cangGan[c]||[];
    return`<div class="bazi-cell"><div class="gz-sub">藏干</div>${cg.map(g=>`<span class="el-tag el-${WX_G[g]}" style="margin:1px">${g}</span>`).join('')}</div>`;
  }).join('');
  html+='</div>';

  html+=`<p class="text-sm text-dim mt-sm">納音：${b.nayin} ｜ <span style="color:${(b.capacity||0)>=50?'#4ade80':(b.capacity||0)>=30?'#fbbf24':'#f87171'}">${b.structType||('身'+(b.strong?'強':'弱'))}</span> ｜ 日主：${b.dm}（${b.dmEl}）</p>`;

  // 特殊格局提示
  if(b.specialStructure){
    html+=`<div style="margin-top:6px;padding:8px 12px;background:rgba(212,175,55,0.08);border-left:3px solid var(--c-gold);border-radius:0 6px 6px 0;font-size:0.85rem;line-height:1.6"><strong style="color:var(--c-gold)">⚡ ${b.specialStructure.type}</strong><br>${b.specialStructure.desc}<br><span class="text-dim" style="font-size:0.78rem">喜：${b.fav.join('、')}行 ｜ 忌：${b.unfav.join('、')}行</span></div>`;
  }

  // 地支合沖刑害顯示
  if(b.branchInteractions && b.branchInteractions.length){
    var _biHtml = b.branchInteractions.map(function(bi){
      var color = bi.score > 0 ? '#4ade80' : bi.score < 0 ? '#f87171' : bi.isXing ? '#fbbf24' : '#94a3b8';
      var icon = bi.score > 0 ? '🔗' : bi.score < 0 ? '⚡' : bi.isXing ? '⚠️' : '🔄';
      return '<span style="display:inline-block;margin:2px 4px;padding:2px 8px;border-radius:12px;font-size:0.75rem;background:rgba('+( bi.score>0?'74,222,128':bi.score<0?'248,113,113':bi.isXing?'251,191,36':'148,163,184')+',0.12);color:'+color+'">'+icon+' '+bi.desc+'</span>';
    }).join('');
    html+='<div style="margin-top:6px">'+_biHtml+'</div>';
  }

  if(b.zodiac||b.xingxiu){
    let astroHtml='<p class="text-xs text-dim">';
    if(b.zodiac) astroHtml+=`${b.zodiac.sym} ${b.zodiac.name}（${b.zodiac.el}象）`;
    if(b.zodiac&&b.xingxiu) astroHtml+=' ｜ ';
    if(b.xingxiu) astroHtml+=`${b.xingxiu.group}·${b.xingxiu.name}宿（${b.xingxiu.animal}·${b.xingxiu.planet}）`;
    astroHtml+='</p>';
    html+=astroHtml;
  }

  // 命宮胎元
  if(b.mingGong||b.taiYuan||b.taiXi||b.shenGong){
    let gongHtml='<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:4px;margin-top:8px;text-align:center;font-size:0.78rem">';
    [{label:'命宮',d:b.mingGong},{label:'身宮',d:b.shenGong},{label:'胎元',d:b.taiYuan},{label:'胎息',d:b.taiXi}].forEach(g=>{
      if(g.d) gongHtml+=`<div style="background:rgba(212,175,55,.06);border:1px solid rgba(212,175,55,.15);border-radius:8px;padding:6px 4px"><div style="font-size:0.65rem;opacity:0.5">${g.label}</div><div style="font-weight:700;font-size:1rem;color:var(--c-gold)">${g.d.gan}${g.d.zhi}</div><div style="font-size:0.6rem;opacity:0.45">${g.d.nayin||''}</div></div>`;
    });
    gongHtml+='</div>';
    html+=gongHtml;
  }

  // 組裝：白話結論 + 四柱命盤 + 專業細節摺疊
  let proDetail='';
  if(b.nayinAll) proDetail+=`<p class="text-xs text-dim">四柱納音：${['year','month','day','hour'].map(c=>'<span style="opacity:0.7">'+(b.nayinAll[c]||'—')+'</span>').join(' · ')}</p>`;
  if(b.jqInfo){
    const jq=b.jqInfo;
    proDetail+=`<p class="text-xs text-dim">節氣：${jq.jieName} ${jq.jieMonth}/${jq.jieDay} ${jq.jieHour}:${String(jq.jieMinute).padStart(2,'0')} → 節後${jq.daysAfterJie}天`;
    if(b.renyuan) proDetail+=` ｜ 人元司令：<span style="color:var(--c-gold)">${b.renyuan.gan}${b.renyuan.el}用事</span>（${b.renyuan.name}）`;
    proDetail+=`</p>`;
  }
  if(b.kongwang) proDetail+=`<p class="text-xs text-dim">空亡：年柱【${b.kongwang.year.join('')}】 日柱【${b.kongwang.day.join('')}】</p>`;
  if(b.tianYunEl) proDetail+=`<p class="text-xs text-dim">天運五行：<span class="el-tag el-${b.tianYunEl}">${b.tianYunEl}</span>（${b.nayin}）</p>`;
  proDetail+=`<p class="text-xs text-dim">得令：${b.deLing?'✓':'✗'}(${b.dmMonthState||'—'}) ｜ 得地：${b.deDi?'✓':'✗'} ｜ 得勢：${b.deShi?'✓':'✗'} ｜ 同黨${b.selfRatio||0}%</p>`;
  proDetail+=`<p class="text-xs text-dim">五行(60分)：`;
  for(const el of ['金','木','水','火','土']){
    const score=Math.round(b.ec[el]);
    let godDetail='';
    if(b.godBreakdown&&b.godBreakdown[el]){
      const entries=Object.entries(b.godBreakdown[el]).filter(([g,pp])=>pp>0).map(([g,pp])=>g+pp);
      if(entries.length) godDetail='('+entries.join(' ')+')';
    }
    proDetail+=`<span class="el-tag el-${el}" style="margin:1px;font-size:0.7rem">${el}${score}</span>`;
    if(godDetail) proDetail+=`<span style="font-size:0.6rem;opacity:0.5">${godDetail}</span> `;
  }
  proDetail+=`</p>`;
  proDetail+=`<p class="text-xs text-dim">喜用神：<span class="text-success">${b.fav.join('、')}</span> ｜ 忌神：<span class="text-danger">${b.unfav.join('、')}</span></p>`;
  if(b.chenggu) proDetail+=`<p class="text-xs text-dim">⚖️ 稱骨：${b.chenggu.display}（${b.chenggu.level}）</p>`;

  document.getElementById('d-bazi').innerHTML=(window.__plainHtml ? window.__plainHtml(insightHtml+html+`<details class="pro-detail"><summary>🔍 展開底層資料（季節節點・五行背景・細節分數）</summary><div style="padding:8px 0">${proDetail}</div></details>`) : insightHtml+html+`<details class="pro-detail"><summary>🔍 展開底層資料（季節節點・五行背景・細節分數）</summary><div style="padding:8px 0">${proDetail}</div></details>`);

  // 五行柱狀圖 (60分制，含月令旺衰)
  const els=['金','木','水','火','土'];
  const colors={金:'var(--el-metal)',木:'var(--el-wood)',水:'var(--el-water)',火:'var(--el-fire)',土:'var(--el-earth)'};
  const WX_STATE={};
  for(const e of els){
    const mzEl=WX_Z[p.month.zhi];
    if(e===mzEl) WX_STATE[e]='旺';
    else if(SHENG[e]===mzEl) WX_STATE[e]='休';
    else if(SHENG[mzEl]===e) WX_STATE[e]='相';
    else if(KE[e]===mzEl) WX_STATE[e]='囚';
    else if(KE[mzEl]===e) WX_STATE[e]='死';
    else WX_STATE[e]='休';
  }
  document.getElementById('d-elbar').innerHTML='<div class="el-bar">'+els.map(e=>{
    const score=Math.round(b.ec[e]);
    return`<div class="el-row"><span class="el-lbl" style="color:${colors[e]}">${e}<span style="font-size:0.7rem;opacity:0.7"> ${WX_STATE[e]}</span></span>
    <div class="el-track"><div class="el-fill" style="width:${Math.round(score/60*100)}%;background:${colors[e]}"></div></div>
    <span class="el-val">${score}</span></div>`;
  }).join('')+'</div>';

  // 十神 - 白話版
  const GOD_EXPLAIN = {
    '日主':'你自己','正印':'長輩庇護','偏印':'獨特天賦','比肩':'同伴助力','劫財':'競爭壓力',
    '食神':'才華展現','傷官':'叛逆創意','正財':'穩定收入','偏財':'意外之財',
    '正官':'規矩壓力','七殺':'強大挑戰'
  };

  document.getElementById('d-gods').innerHTML=`
    <div class="bazi-grid" style="margin:0">
      ${cols.map((_,i)=>`<div class="bazi-cell header">${labels[i]}</div>`).join('')}
      ${cols.map(c=>{
        const god = b.gods[c].gan;
        const explain = GOD_EXPLAIN[god]||'';
        return `<div class="bazi-cell"><strong>${god}</strong>${explain?`<div style="font-size:0.5rem;margin-top:2px;opacity:0.5">${explain}</div>`:''}</div>`;
      }).join('')}
      ${cols.map(c=>`<div class="bazi-cell">${(b.gods[c].zhi||[]).map(z=>{const ex=GOD_EXPLAIN[z]||'';return z;}).join('<br>')}</div>`).join('')}
    </div>`;

  // 藏干 - 白話版（含對命主的實際影響）
  const CG_ROLE = {
    '比肩':'跟你同類型的夥伴能量','劫財':'競爭對手的能量',
    '食神':'才華與創造力','傷官':'叛逆與表現慾',
    '正財':'穩定收入','偏財':'意外之財',
    '正官':'紀律與壓力','七殺':'強大的外部壓力',
    '正印':'長輩庇護','偏印':'獨特的學習天賦'
  };
  // 根據身強弱 + 十神角色，給出「這對你好不好」的白話判斷
  function cangGanImpact(god, strong, fav, unfav, el, gEl){
    // 用神/忌神判斷
    const isFav = fav.includes(gEl);
    const isUnfav = unfav.includes(gEl);
    // 十神分組
    const isHelp = ['比肩','劫財'].includes(god);  // 幫身
    const isPrint = ['正印','偏印'].includes(god);  // 生身
    const isOutput = ['食神','傷官'].includes(god); // 洩身
    const isWealth = ['正財','偏財'].includes(god); // 耗身
    const isOfficial = ['正官','七殺'].includes(god); // 剋身

    if(!strong){ // 身弱
      if(isHelp) return '💪 幫你撐腰的力量，對你有利';
      if(isPrint) return '🛡️ 保護你的能量，讓你站穩';
      if(isOutput) return '⚡ 會消耗你的精力，別過度展現';
      if(isWealth) return '💰 錢財機會在，但你目前扛不動太多';
      if(isOfficial) return god==='七殺'?'⚠️ 壓力來源，需要有人幫你擋':'📋 規矩束縛多，量力而為';
    } else { // 身旺
      if(isHelp) return '⚡ 能量已經夠了，多了反而爭搶資源';
      if(isPrint) return '🔄 保護過多反而讓你懶散，需要適度放手';
      if(isOutput) return '🌟 幫你釋放多餘能量，有利展現才華';
      if(isWealth) return '💰 能抓住的財富機會，可以主動出擊';
      if(isOfficial) return god==='七殺'?'🔥 有壓力但你扛得住，可以轉化為動力':'📋 適度約束對你反而好';
    }
    return '';
  }
  const PILLAR_LABEL = {'hour':'時柱（你的晚年和子女）','day':'日柱（你自己）','month':'月柱（你的事業和父母）','year':'年柱（你的祖上和早年）'};
  document.getElementById('d-canggan').innerHTML=cols.map(c=>{
    const cg=b.cangGan[c]||[];
    if(!cg.length) return '';
    const pillarDesc = PILLAR_LABEL[c] || c;
    const items = cg.map(g=>{
      const god = tenGod(b.dm,g);
      const gEl = WX_G[g];
      const role = CG_ROLE[god]||god;
      const impact = cangGanImpact(god, b.strong, b.fav||[], b.unfav||[], b.dmEl, gEl);
      return `<span style="display:block;margin:2px 0">${g}（${gEl}行）— ${role}${impact?'<br><span style="opacity:0.7;font-size:0.78rem;padding-left:1em">'+impact+'</span>':''}</span>`;
    }).join('');
    return`<p style="margin-bottom:10px"><strong>${pillarDesc}（${p[c].zhi}）</strong><br><span class="text-dim">${items}</span></p>`;
  }).join('');

  // ═══ 日主強度條 + 結構判定（白話版）═══
  const _cap = b.capacity || b.bearingCapacity || 0;
  const _capPct = Math.max(0, Math.min(100, _cap));
  const _capColor = b.strong ? '#4ade80' : '#fbbf24';

  // ═══ 能量流向 ═══
  const _flow = b.energyFlow || {};
  
  // ═══ 貼身影響 ═══
  const _proxNotes = b.proximityNotes || [];

  const _strongExplain = b.specialStructure
    ? b.specialStructure.desc
    : b.strong
    ? '你的命盤能量充足，自身力量強，適合主動出擊。需要用喜用神來疏導多餘的能量。'
    : '你的命盤中自身能量不足，需要外在助力。喜用神能幫你補充力量，讓你站穩腳步。';

  document.getElementById('d-xiyong').innerHTML=`
    <div style="margin-bottom:1rem">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.3rem">
        <strong style="font-size:0.85rem">你的命盤能量：${_cap} / 100</strong>
        <span style="font-size:0.75rem;color:${_capColor};font-weight:600">${b.strong ? '身強' : '身弱'}</span>
      </div>
      <div style="font-size:0.65rem;opacity:0.5;margin-bottom:4px">這個分數代表你天生自帶的能量有多少（月令＋得地＋得勢＋五行比例），數字越高代表自身越強</div>
      <div style="background:rgba(255,255,255,0.08);border-radius:6px;height:12px;overflow:hidden;position:relative">
        <div style="width:${_capPct}%;height:100%;background:${_capColor};border-radius:6px;transition:width 0.6s"></div>
        <div style="position:absolute;top:0;left:50%;width:2px;height:100%;background:rgba(255,255,255,0.3)" title="身弱/身強分界(50)"></div>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:0.6rem;opacity:0.4;margin-top:2px">
        <span>身弱 (&lt;50)</span><span>身強 (≥50)</span>
      </div>
      <div style="font-size:0.7rem;margin-top:6px;color:var(--c-text-dim);line-height:1.5">${_strongExplain}</div>
    </div>

    <div style="margin-bottom:1rem">
      <strong style="font-size:0.85rem">結構判定：</strong>
      <span style="color:${_capColor};font-weight:600">${b.strong ? '身強' : '身弱'}（${_cap}分）</span>
    </div>

    ${_flow.mainFlow ? `<div style="margin-bottom:1rem;padding:0.5rem;background:rgba(255,255,255,0.03);border-radius:8px;border:1px solid rgba(255,255,255,0.06)">
      <strong style="font-size:0.8rem">能量流向：</strong>
      <span style="font-size:0.85rem;color:var(--c-gold,#d4af37)">${_flow.mainFlow}</span>
      ${_flow.breakPoint && _flow.breakPoint !== '無明顯阻斷' ? `<br><span style="font-size:0.75rem;color:#f87171">⚡ 阻斷點：${_flow.breakPoint}</span>` : ''}
      ${_flow.sortedPower ? `<br><span style="font-size:0.7rem;opacity:0.5">${_flow.sortedPower}</span>` : ''}
    </div>` : ''}

    ${_proxNotes.length ? `<div style="margin-bottom:1rem;padding:0.4rem 0.6rem;background:rgba(248,113,113,0.08);border-radius:6px;border-left:3px solid #f87171">
      <strong style="font-size:0.75rem;color:#f87171">⚠ 貼身影響：</strong>
      ${_proxNotes.map(n => `<div style="font-size:0.72rem;opacity:0.8;margin-top:2px">• ${n}</div>`).join('')}
    </div>` : ''}

    <p><strong>喜用神：</strong>${b.fav.map(e=>`<span class="tag tag-green">${e}</span>`).join(' ')}</p>
    <p class="mt-sm"><strong>忌　神：</strong>${b.unfav.map(e=>`<span class="tag tag-red">${e}</span>`).join(' ')}</p>
    ${b.tiaohou ? `<p class="mt-sm" style="font-size:0.78rem;opacity:0.7"><strong>調候：</strong>${b.tiaohou.reason} — ${b.tiaohou.needReason}</p>` : ''}
    ${b.shensha.length?`<details style="margin-top:0.5rem" open><summary style="cursor:pointer;font-size:0.78rem;opacity:0.6">神煞（${b.shensha.length}個）— 點擊看說明</summary><div class="mt-sm" style="font-size:0.75rem;line-height:1.6">${b.shensha.map(s=>{const GOOD_SS=['天乙貴人','天德貴人','月德貴人','天德合','月德合','文昌','學堂','詞館','國印貴人','福星貴人','天上三奇','地下三奇','人中三奇','金輿','天廚','將星','驛馬','桃花','紅鸞','天喜'];const isGood=GOOD_SS.includes(s);const SS_DESC={'天乙貴人':'最重要的貴人星。一生中容易遇到願意幫助你的人，遇難時總有人伸出援手，逢凶化吉能力強。','天德貴人':'天降福德之星。天生有化解災禍的能力，即使遭遇困境也能轉危為安，一生平安順遂的機率高。','月德貴人':'月柱帶來的福德。做事容易得到他人善意回應，人緣好，貴人運穩定持續。','天德合':'天德貴人的合星，效果類似但稍弱。仍然具有逢凶化吉的能量，遇到問題時有人暗中相助。','月德合':'月德貴人的合星。人際關係中容易獲得善意，做事有潤滑劑般的順暢感。','文昌':'學業與考試的吉星。頭腦聰明、記憶力好，讀書考試有天分，適合走學術或文職路線。','學堂':'讀書學習的福地。求學過程順利，吸收知識的能力強，適合終身學習和進修。','詞館':'文筆與口才之星。表達能力突出，寫作和演說有天賦，適合從事文字或溝通相關工作。','國印貴人':'官場和體制的吉星。適合在公家機關、大企業等組織內發展，容易獲得長官賞識和提拔。','福星貴人':'天生帶福氣之星。生活中常有意想不到的好運和福報，即使不特別努力也不會太差。','天上三奇':'四柱天干中有甲戊庚順排，為最貴的三奇格。命主聰明過人，有非凡的際遇和機緣。','地下三奇':'四柱天干中有乙丙丁順排。才華出眾，人生中有奇特的發展機會，貴人運佳。','人中三奇':'四柱天干中有壬癸辛順排。智慧型的三奇，思維獨特，適合研究和創新領域。','金輿':'出行和座駕之星。一生出行安全，容易擁有好的交通工具，也代表生活品質較好。','天廚':'食祿之星。一生不愁吃穿，飲食方面有福氣，也適合從事餐飲、食品相關行業。','將星':'領導和權力之星。天生有統帥的氣質和能力，適合帶領團隊，事業上容易居於主導地位。','驛馬':'遷移和變動之星。一生中變動多，適合從事需要出差或流動性高的工作，也代表有出國機會。','桃花':'異性緣和人緣之星。外表有魅力或氣質吸引人，異性緣好，但也要注意感情上的分寸。','紅鸞':'婚姻和喜事之星。代表姻緣到來或有喜慶之事，未婚者容易遇到對象，已婚者感情升溫。','天喜':'喜慶之星。生活中容易遇到開心的事，心情愉悅，也代表可能有添丁或喜事。','華蓋':'孤高聰明之星。思想深沉、悟性高，適合宗教哲學或藝術創作，但個性較孤僻，人際關係上需要主動。','羊刃':'剛烈果斷之星。個性強硬、做事有魄力，但脾氣急躁容易衝動。事業上可以化煞為權，但感情上容易起衝突。','劫煞':'突發變故之星。人生中容易遇到突然的變動或損失，但也代表有在逆境中翻盤的能力。行事需謹慎提防。','亡神':'暗耗之星。容易在不知不覺中損失錢財或機會，做決定前要多想多查證，避免被蒙蔽。','災煞':'災厄警示之星。提醒注意意外和災禍，尤其是交通和健康方面。保持警覺心、遠離危險環境。','六厄':'小困難之星。生活中容易遇到瑣碎的阻礙和麻煩事，雖然不大但會消耗精力，需要耐心處理。','孤辰':'孤獨之星（男性影響較大）。個性獨立但容易感到寂寞，感情上不太主動，需要刻意經營人際關係。','寡宿':'孤獨之星（女性影響較大）。內心世界豐富但不善表達，容易在感情上錯過機會，建議多參加社交活動。','空亡':'虛空之星。某些方面的能量被「架空」，努力可能事倍功半。但空亡也有「置之死地而後生」的意味。','血刃':'血光之星。提醒注意外傷、手術或出血相關的健康問題，日常生活中小心利器和交通安全。','紅艷煞':'魅力與誘惑之星。異性緣極強、外表或氣質有吸引力，但感情上容易遇到複雜狀況或爛桃花。','陰陽差錯':'婚姻曲折之星。感情和婚姻的道路比較曲折，可能經歷波折才找到對的人，但最終的姻緣往往不凡。','十惡大敗':'元氣受損之星。先天福報稍弱，做事需要比別人多付出努力，但只要踏實肯幹，反而能激發潛力。','白虎':'兇險之星。當年或當運需注意健康和安全，可能有意外事故或手術的風險，定期體檢是好習慣。','天狗':'口舌是非之星。容易捲入是非口角或法律糾紛，說話做事要謹慎，避免得罪小人。','弔客':'喪氣之星。可能遭遇親友的不幸消息或自身運勢低落的時期，保持平常心，多陪伴家人。','喪門':'哀傷之星。與弔客類似，提醒關注家中長輩健康，也要注意自己的情緒管理。','勾煞':'纏繞之星。容易遇到糾纏不清的人事物，特別是法律訴訟或債務問題，簽約做事要格外小心。','絞煞':'糾結之星。人際關係中容易有糾葛，可能被人牽扯進不必要的麻煩，保持界線感很重要。'};const desc=SS_DESC[s]||'';return `<div class="ss-item" style="display:inline-block;margin:2px" onclick="this.querySelector('.ss-tip').classList.toggle('ss-show')"><span class="tag ${isGood?'tag-green':'tag-red'}" style="font-size:0.72rem;cursor:pointer;${isGood?'':'opacity:0.75'}">${isGood?'✦':'✧'} ${s} <i class="fas fa-info-circle" style="font-size:0.6rem;opacity:0.4"></i></span><div class="ss-tip" style="display:none;margin:4px 0 8px;padding:8px 10px;border-radius:8px;font-size:0.73rem;line-height:1.6;background:${isGood?'rgba(76,175,80,.08)':'rgba(239,83,80,.08)'};border-left:3px solid ${isGood?'rgba(76,175,80,.5)':'rgba(239,83,80,.4)'};color:var(--c-text)">${desc}</div></div>`}).join('')}</div></details>`:''}`;


  // 起運資訊
  if(b.qiyun){
    const qy=b.qiyun;
    document.getElementById('d-qiyun').innerHTML=`<span style="color:var(--c-gold,#d4af37)">⏳ ${qy.startAge}歲起運</span><span style="opacity:0.6">（小運1~${qy.smallEnd}｜實歲${qy.age}歲${qy.months>0?'又'+qy.months+'個月':''}）</span>`;
  }
  // 大運
  document.getElementById('d-dayun').innerHTML='<div class="dayun-tl">'+b.dayun.map(d=>{
    // 用 score 決定顏色，不依賴 level 文字
    const s=d.score||0;
    const lvClass=s>=6?'lv-dj':s>=3?'lv-zj':s>=1?'lv-xj':s>=-1?'lv-p':s>=-3?'lv-xk':s>=-6?'lv-zk':'lv-dk';
    const gzColor=s>=6?'#4ade80':s>=3?'#60a5fa':s>=1?'var(--c-gold,#d4af37)':s>=-1?'var(--c-text,#e8d5b5)':s>=-3?'#fbbf24':s>=-6?'#f87171':'#ef4444';
    const notesTip=d.notes&&d.notes.length?d.notes.slice(0,4).join('；'):'';
    return`<div class="dy-item dy-${lvClass} ${d.isCurrent?'current':''}" title="${notesTip}">
      <span class="dy-gz" style="color:${gzColor}">${d.gz}</span>
      <span class="dy-age">${d.ageStart}-${d.ageEnd}歲</span>
      <span style="font-size:0.55rem;opacity:0.45;display:block">${b._birthYear?''+(b._birthYear+d.ageStart)+'~'+(b._birthYear+d.ageEnd):''}</span>
      <span class="dy-lv ${lvClass}">${d.level}</span>
      <div class="gz-sub">${typeof godLabel==='function'?godLabel(d.god):d.god}</div>
      ${d.ganScore!==undefined?'<div style="font-size:0.6rem;opacity:0.5;margin-top:2px">干'+(d.ganScore>0?'<span style="color:#4ade80">↑</span>':'<span style="color:#f87171">↓</span>')+' 支'+(d.zhiScore>0?'<span style="color:#4ade80">↑</span>':'<span style="color:#f87171">↓</span>')+'</div>':''}</div>`
  }).join('')+'</div>';
  // 當前大運流年詳情（精簡版：只顯示今年前後3年，其餘收折）
  const curDy2=b.dayun?b.dayun.find(d=>d.isCurrent):null;
  if(curDy2&&curDy2.liuNian){
    const _cy=new Date().getFullYear();
    const _ci=curDy2.liuNian.findIndex(ln=>ln.year===_cy);
    const _vs=Math.max(0,(_ci<0?0:_ci)-2);
    const _ve=Math.min(curDy2.liuNian.length-1,(_ci<0?4:_ci)+2);
    let lnHtml='<details style="margin-top:0.8rem"><summary style="cursor:pointer;font-size:0.85rem;color:var(--c-gold,#d4af37)">📅 當前大運'+curDy2.gz+'（'+curDy2.level+'）流年明細</summary><div style="padding:0.5rem;font-size:0.82rem;line-height:1.6">';
    if(curDy2.notes&&curDy2.notes.length) lnHtml+='<p style="margin-bottom:0.5rem;color:var(--c-gold)">大運特徵：'+curDy2.notes.slice(0,4).join('、')+'</p>';
    lnHtml+='<table style="width:100%;border-collapse:collapse;font-size:0.78rem"><tr style="opacity:0.6"><th>年份</th><th>干支</th><th>主題</th><th>吉凶</th><th>重點提示</th></tr>';
    if(_vs>0) lnHtml+=`<tr><td colspan="5" style="text-align:center;padding:3px"><button onclick="this.closest('table').querySelectorAll('.ln-old-rows').forEach(r=>r.style.display='');this.style.display='none'" style="font-size:.68rem;color:var(--c-gold);background:none;border:1px solid var(--c-gold);border-radius:10px;padding:1px 8px;cursor:pointer">▲ 顯示更早 ${_vs} 年</button></td></tr>`;
    curDy2.liuNian.forEach((ln,i)=>{
      const ls=ln.score||0;
      const isGood=ls>=1;const isBad=ls<=-1;
      const color=isGood?'#4caf50':isBad?'#f44336':'#999';
      const rowBg=isGood?'rgba(74,222,128,.06)':isBad?'rgba(248,113,113,.06)':'transparent';
      const note=ln.notes&&ln.notes.length?ln.notes[0]:'—';
      const isCur=ln.year===_cy;
      const curStyle=isCur?'background:rgba(212,175,55,0.15);font-weight:bold;':'';
      const hidden=(i<_vs||i>_ve);
      lnHtml+=`<tr class="${hidden?'ln-old-rows':''}" style="${hidden?'display:none;':''}${curStyle||(rowBg?'background:'+rowBg+';':'')}border-bottom:1px solid rgba(255,255,255,.05)"><td>${ln.year}${isCur?' ◀':''}</td><td>${ln.gz}</td><td>${typeof godLabel==='function'?godLabel(ln.god):ln.god}</td><td style="color:${color};font-weight:600">${ln.level}</td><td style="font-size:0.72rem;opacity:0.8">${note}</td></tr>`;
    });
    if(_ve<curDy2.liuNian.length-1) lnHtml+=`<tr><td colspan="5" style="text-align:center;padding:3px"><button onclick="this.closest('table').querySelectorAll('.ln-old-rows').forEach(r=>r.style.display='');this.style.display='none'" style="font-size:.68rem;color:var(--c-gold);background:none;border:1px solid var(--c-gold);border-radius:10px;padding:1px 8px;cursor:pointer">▼ 顯示更多 ${curDy2.liuNian.length-1-_ve} 年</button></td></tr>`;
    lnHtml+='</table></div></details>';
    document.getElementById('d-dayun').innerHTML+=lnHtml;
  }
}


// ===== [PATCH v1: CELTIC_POSITIONS alias + detectTarotCombos] =====

// ── 補丁1：CELTIC_POSITIONS 別名（spec 要求的名稱，指向現有 TAROT_POS_META）──
// 現有系統用 TAROT_POS_META，這裡建立同義別名供外部引用
var CELTIC_POSITIONS = [
  {id:1,key:'present',    name:'現況',    meaning:'事情目前的核心狀態'},
  {id:2,key:'challenge',  name:'阻礙',    meaning:'目前最大的阻力、卡點或對沖力量'},
  {id:3,key:'subconscious',name:'潛意識', meaning:'內在真正驅動這件事的深層因素'},
  {id:4,key:'past',       name:'過去',    meaning:'已經發生且仍在影響現在的背景'},
  {id:5,key:'nearFuture', name:'近期',    meaning:'短期內最可能出現的發展'},
  {id:6,key:'self',       name:'自身',    meaning:'提問者目前的主觀狀態與行動模式'},
  {id:7,key:'environment',name:'環境',    meaning:'外部局勢、對方、社會環境或他人因素'},
  {id:8,key:'hopeFear',   name:'希望恐懼',meaning:'內心期待與焦慮交織的區域'},
  {id:9,key:'outlook',    name:'未來',    meaning:'中期趨勢與走向'},
  {id:10,key:'outcome',   name:'結果',    meaning:'若照目前路徑延續，最可能的結局'}
];

// ── 補丁2：detectTarotCombos — 高價值牌組組合偵測 ──
// 輸入：drawn（10張牌陣列），輸出：[{type, level, message, cards}]
function detectTarotCombos(drawn) {
  if (!drawn || drawn.length < 3) return [];
  var combos = [];
  var ids = drawn.map(function(c){ return c.id; });
  var names = drawn.map(function(c){ return c.n; });

  // ── helper：檢查特定名稱是否存在於牌陣中 ──
  function has(name) { return names.indexOf(name) !== -1; }
  function hasId(id) { return ids.indexOf(id) !== -1; }
  function cardRef(name) {
    var idx = names.indexOf(name);
    if (idx === -1) return name;
    return name + (drawn[idx].isUp ? '正位' : '逆位');
  }

  // ═══ 【轉變組】═══
  if (has('死神') && has('塔')) {
    combos.push({
      type: 'transform', level: 'high',
      cards: [cardRef('死神'), cardRef('塔')],
      message: '死神＋塔同現：這是雙重強制清場。不是你主動要改變，是事情本身逼著你必須清掉舊的結構。痛苦但通常是真正轉型的開始。'
    });
  }
  if (has('死神') && has('審判')) {
    combos.push({
      type: 'transform', level: 'high',
      cards: [cardRef('死神'), cardRef('審判')],
      message: '死神＋審判：結束一個週期並重新評估自己的路徑。不是失敗，是一個章節的完結和下一個章節的召喚。'
    });
  }
  if (has('塔') && has('星星')) {
    combos.push({
      type: 'transform', level: 'medium',
      cards: [cardRef('塔'), cardRef('星星')],
      message: '塔＋星星：崩塌之後有光。破壞性事件之後往往是希望和重建的契機，但需要先走過最難的那段。'
    });
  }
  if (has('吊人') && has('隱者')) {
    combos.push({
      type: 'transform', level: 'medium',
      cards: [cardRef('吊人'), cardRef('隱者')],
      message: '吊人＋隱者：暫停與內省的組合。兩張牌都指向「先停下來搞清楚自己在哪裡」，強迫你去面對一些平時逃避的東西。'
    });
  }

  // ═══ 【感情組】═══
  if (has('戀人') && has('惡魔')) {
    var loverUp = drawn[names.indexOf('戀人')].isUp;
    var devilUp = drawn[names.indexOf('惡魔')].isUp;
    combos.push({
      type: 'love', level: 'high',
      cards: [cardRef('戀人'), cardRef('惡魔')],
      message: '戀人＋惡魔：' + (loverUp && !devilUp
        ? '有真實的吸引力，但惡魔逆位暗示你們正在從某種依賴或迷戀中慢慢解脫，關係在轉型。'
        : devilUp
        ? '這段關係有強烈的吸引力，但惡魔正位暗示其中有依賴、佔有或無法說出口的執著在綁住你們，要分清是愛還是上癮。'
        : '選擇與誘惑並存，需要問清楚自己真正想要的是什麼樣的關係。')
    });
  }
  if (has('皇后') && has('皇帝')) {
    combos.push({
      type: 'love', level: 'medium',
      cards: [cardRef('皇后'), cardRef('皇帝')],
      message: '皇后＋皇帝：兩種成熟能量的結合，暗示關係有穩定發展的潛力，或者你們之間的陰性和陽性能量需要找到平衡點。'
    });
  }
  if (has('女祭司') && has('月亮')) {
    combos.push({
      type: 'love', level: 'medium',
      cards: [cardRef('女祭司'), cardRef('月亮')],
      message: '女祭司＋月亮：有很多東西沒有說出來，對方有隱藏的部分，或者你自己也沒想清楚真正的感受。現在不適合強求答案，但也不能一直模糊下去。'
    });
  }

  // ═══ 【成功組】═══
  if (has('太陽') && has('世界')) {
    combos.push({
      type: 'success', level: 'high',
      cards: [cardRef('太陽'), cardRef('世界')],
      message: '太陽＋世界：最強的正面組合之一。成功、完成、光明正大的結果。牌陣裡同時出現這兩張，成功的能量很集中。'
    });
  }
  if (has('魔術師') && has('戰車')) {
    combos.push({
      type: 'success', level: 'high',
      cards: [cardRef('魔術師'), cardRef('戰車')],
      message: '魔術師＋戰車：能力加上執行力。你有工具，也有意志力去推動它，這是真正能動的組合，不只是空有想法。'
    });
  }
  if (has('星星') && has('太陽')) {
    combos.push({
      type: 'success', level: 'medium',
      cards: [cardRef('星星'), cardRef('太陽')],
      message: '星星＋太陽：希望加上實現，從期盼走向落地。事情不只是有可能，而是真的在往好的方向走。'
    });
  }

  // ═══ 【壓力/幻象組】═══
  if (has('月亮') && has('惡魔')) {
    combos.push({
      type: 'illusion', level: 'high',
      cards: [cardRef('月亮'), cardRef('惡魔')],
      message: '月亮＋惡魔：迷霧加上執著的組合。你可能在一個你看不清楚的狀況裡還帶著強烈的依附感，這讓判斷更容易失真。需要刻意拉開距離看清楚。'
    });
  }
  if (has('塔') && has('月亮')) {
    combos.push({
      type: 'illusion', level: 'high',
      cards: [cardRef('塔'), cardRef('月亮')],
      message: '塔＋月亮：突然的變化加上混亂迷霧。不只是事情在崩，你還看不清楚事情的全貌，這是牌局裡資訊最不透明的組合，需要格外謹慎。'
    });
  }

  return combos;
}

// ── 補丁3：getComboWarningsHtml — 將 detectTarotCombos 結果轉為 HTML 供顯示 ──
function getComboWarningsHtml(drawn) {
  var combos = detectTarotCombos(drawn);
  if (!combos.length) return '';
  var typeColor = {
    transform: { color: '#a78bfa', icon: '🔄' },
    love:      { color: '#f9a8d4', icon: '💕' },
    success:   { color: '#86efac', icon: '✨' },
    illusion:  { color: '#fbbf24', icon: '⚠️' }
  };
  var html = '<div style="margin-top:8px">';
  html += '<div style="font-size:0.75rem;color:var(--c-text-dim);margin-bottom:4px">🃏 特殊牌組組合</div>';
  combos.forEach(function(c) {
    var tc = typeColor[c.type] || { color: 'var(--c-gold)', icon: '🔮' };
    html += '<div style="margin-bottom:6px;padding:6px 10px;background:rgba(255,255,255,0.02);border-left:2px solid ' + tc.color + ';border-radius:4px">';
    html += '<div style="font-size:0.72rem;color:' + tc.color + ';margin-bottom:2px">' + tc.icon + ' ' + c.cards.join(' ＋ ') + '</div>';
    html += '<div style="font-size:0.82rem;color:var(--c-text);line-height:1.6">' + c.message + '</div>';
    html += '</div>';
  });
  html += '</div>';
  return html;
}

// ===== [PATCH v1 END] =====

// ═══════════════════════════════════════════════════════════════
// 梅花易數升級引擎 v3 (merged from meihua_upgrade.js)
// ═══════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════
// 梅花易數核心升級 v3 — 替換區塊（tarot.js 第 90 行起至第 533 行）
// 保留：BG、G64、gByN、g64、gByL 不動
// 替換：tiYong → getMhWangShuai → mhRelation → calcMH → analyzeMeihua → generateMeihuaStory
// ═══════════════════════════════════════════════════════════════

// ═══ 五行生剋常數（若原本已定義則跳過）═══
// SHENG/KE 應已在 bazi.js 或頁面全域定義，此處只作防呆
// SHENG/KE 已在 bazi.js 中以 const 宣告，此處不再重複宣告
// （防呆移除：避免 var 與 const 衝突導致整個腳本無法載入）

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
  if(!el) return {level:'平',score:0};
  // ── 依節氣近似日判定當前月支所屬季節 ──
  var now = new Date();
  var m = typeof month==='number' ? month : (now.getMonth()+1);
  var d = now.getDate();
  var JIE_DAY = {1:6,2:4,3:6,4:5,5:6,6:6,7:7,8:8,9:8,10:8,11:7,12:7};
  var SEASON_AFTER  = {1:'earth',2:'spring',3:'spring',4:'earth',5:'summer',6:'summer',
                       7:'earth',8:'autumn',9:'autumn',10:'earth',11:'winter',12:'winter'};
  var SEASON_BEFORE = {1:'winter',2:'earth',3:'spring',4:'spring',5:'earth',6:'summer',
                       7:'summer',8:'earth',9:'autumn',10:'autumn',11:'earth',12:'winter'};
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
  return {level:level, score:levelScore[level]||0, season:season};
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
// ═══════════════════════════════════════════════════════════════
// 五行事件映射（供所有層使用）
// ═══════════════════════════════════════════════════════════════
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

// ═══ 應期三法交集（v55：讓 AI 不自算月份）═══
// 三法：數字法（體+用先天數）、卦氣法（動爻五行旺相月）、爻位法（動爻位置）
// 回傳: { numMethod, qiMethod, yaoMethod, intersection, confidence, reasoning }
// 依賴: MH_WANGSHUAI_PRECISE (來自 meihua_upgrade2.js，typeof 防呆已處理)
function _mhTimingTriple(mh, dongEl, curMonth){
  if(!mh || !mh.tiG || !mh.yoG) return null;

  var tiN = mh.tiG.n || 0;
  var yoN = mh.yoG.n || 0;
  var dong = mh.dong || 0;
  var now = new Date();
  var cy = now.getFullYear();
  var cm = curMonth || (now.getMonth() + 1);

  // ── 法1：數字法（體數+用數）──
  var numSum = tiN + yoN;
  function addMonths(y, m, delta){
    var total = (y * 12 + (m - 1)) + delta;
    return { y: Math.floor(total / 12), m: (total % 12) + 1 };
  }
  var farEnd = addMonths(cy, cm, numSum);
  var numMethodDesc = '先天數 ' + tiN + '+' + yoN + '=' + numSum +
                      '（近:' + numSum + '天內／遠:約 ' +
                      cy + '年' + cm + '月–' + farEnd.y + '年' + farEnd.m + '月）';

  // ── 法2：卦氣法（動爻五行得旺、相的月份）──
  var monthZhiMap = ['寅','卯','辰','巳','午','未','申','酉','戌','亥','子','丑'];
  function monthToZhi(m){ return monthZhiMap[(m - 1 + 12) % 12]; }
  var wangTable = (typeof MH_WANGSHUAI_PRECISE !== 'undefined') ?
                  MH_WANGSHUAI_PRECISE[dongEl] : null;
  var wangMonths = [];
  var xiangMonths = [];
  if(wangTable){
    for(var m = 1; m <= 12; m++){
      var zhi = monthToZhi(m);
      var mult = wangTable[zhi] || 1.0;
      if(mult >= 1.5) wangMonths.push(m);
      else if(mult >= 1.2) xiangMonths.push(m);
    }
  }

  function fmt(m){
    if(m <= 12) return cy + '年' + m + '月';
    var y = cy + Math.floor((m - 1) / 12);
    var mm = ((m - 1) % 12) + 1;
    return y + '年' + mm + '月';
  }

  function findNextSpan(monthList, fromMonth){
    if(!monthList || !monthList.length) return null;
    var future = monthList.filter(function(m){ return m >= fromMonth; });
    var toUse = future.length ? future : monthList.map(function(m){ return m + 12; });
    toUse.sort(function(a,b){ return a-b; });
    var start = toUse[0], end = toUse[0];
    for(var i = 1; i < toUse.length; i++){
      if(toUse[i] === end + 1){ end = toUse[i]; }
      else break;
    }
    return { start: start, end: end, desc: fmt(start) + (end !== start ? '–' + fmt(end) : '') };
  }

  var wangSpan = findNextSpan(wangMonths, cm);
  var xiangSpan = findNextSpan(xiangMonths, cm);
  var qiSpan = wangSpan || xiangSpan;
  var qiMethodDesc;
  if(dongEl){
    var qiParts = ['動爻五行「' + dongEl + '」得令'];
    if(wangSpan) qiParts.push('【旺】' + wangSpan.desc + '（最應期）');
    if(xiangSpan) qiParts.push('【相】' + xiangSpan.desc + '（次應期）');
    if(!wangSpan && !xiangSpan) qiParts.push('無明確旺相期');
    qiMethodDesc = qiParts.join('；');
  } else {
    qiMethodDesc = '動爻五行未知';
  }

  // ── 法3：爻位法（動爻位置=應期倍數）──
  var yaoEnd = addMonths(cy, cm, dong);
  var yaoMethodDesc = '動爻第' + dong + '爻（近:' + dong + '天／遠:' +
                      cy + '年' + cm + '月–' + yaoEnd.y + '年' + yaoEnd.m + '月）';

  // ── 取交集 ──
  var intersection = null;
  var confidence = '中';
  var reasoning = '';

  if(qiSpan){
    var yaoTargetMonth = cm + dong;
    if(yaoTargetMonth > 12) yaoTargetMonth -= 12;
    var qiStart = qiSpan.start > 12 ? qiSpan.start - 12 : qiSpan.start;
    var qiEnd = qiSpan.end > 12 ? qiSpan.end - 12 : qiSpan.end;

    var yaoHits = (yaoTargetMonth >= qiStart && yaoTargetMonth <= qiEnd) ||
                  (qiStart > qiEnd && (yaoTargetMonth >= qiStart || yaoTargetMonth <= qiEnd));
    var numTargetMonth = cm + numSum;
    while(numTargetMonth > 12) numTargetMonth -= 12;
    var numHits = (numTargetMonth >= qiStart && numTargetMonth <= qiEnd) ||
                  (qiStart > qiEnd && (numTargetMonth >= qiStart || numTargetMonth <= qiEnd));

    intersection = qiSpan.desc;
    if(yaoHits && numHits){
      confidence = '高';
      reasoning = '三法收斂到卦氣窗口';
    } else if(yaoHits || numHits){
      confidence = '中高';
      reasoning = '卦氣+' + (yaoHits ? '爻位' : '數字') + '兩法交集';
    } else {
      confidence = '中';
      reasoning = '以卦氣法為主（最精確），但其他兩法指向不同時間';
    }
  } else {
    intersection = cy + '年' + cm + '月–' + yaoEnd.y + '年' + yaoEnd.m + '月內（爻位法）';
    confidence = '低';
    reasoning = '卦氣法無明確窗口，回退爻位法';
  }

  return {
    numMethod: numMethodDesc,
    qiMethod: qiMethodDesc,
    yaoMethod: yaoMethodDesc,
    intersection: intersection,
    confidence: confidence,
    reasoning: reasoning
  };
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
    timingTriple: (function(){
      try { return _mhTimingTriple(mh, dongEl, curMonth); }
      catch(e){ return null; }
    })(),
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

// ═══════════════════════════════════════════════════════════════
// 梅花輸出層 v1 (merged from meihua_output_layer.js)
// ═══════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════
// 梅花輸出層 v1 — 新增區塊
// ───────────────────────────────────────────────────────────────
// 插入位置：tarot.js 內，在 generateMeihuaStory 函式 } 結束之後、
//           renderYaoLines 函式之前。
// 本區塊全部為新增函式，不替換現有程式碼。
//
// 另外：請將 tarot.js 原本 calcMH 函式（第99-114行）
// 替換為本文末的【calcMH 升級版】。
// ═══════════════════════════════════════════════════════════════


// ─────────────────────────────────────────────────────────────────
// 【新增1】buildMeihuaTags — 標準化 tags 系統
// 每個 tag: { label, dir, weight, confidence, source }
// ─────────────────────────────────────────────────────────────────
function buildMeihuaTags(mh, type, analysis) {
  if (!mh || !analysis) return [];
  var tags = [];
  var rel       = (mh.ty && mh.ty.r) || '—';
  var judge     = (mh.ty && mh.ty.f) || '平';
  var dong      = mh.dong || 1;
  var score     = analysis.score || 40;
  var tiWS      = (analysis.wangShuai && analysis.wangShuai.ti) || { level: '平', score: 0 };
  var yoWS      = (analysis.wangShuai && analysis.wangShuai.yo) || { level: '平', score: 0 };
  var bianTrend = analysis.trend  || { type: '反覆' };
  var huHidden  = (analysis.structure && analysis.structure.huGua && analysis.structure.huGua.hidden)
                  || { cat: '變數', desc: '' };
  var dongStage = analysis.dongYaoFull || { stage: '起步' };
  var timingObj = analysis.timingFull  || { label: '短期', score: 0 };
  var benName   = (mh.ben  && mh.ben.n)  || '';
  var bianName  = (mh.bian && mh.bian.n) || '';
  var tiEl      = (mh.tiG  && mh.tiG.el) || '';
  var yoEl      = (mh.yoG  && mh.yoG.el) || '';
  var dongEl    = (dong <= 3) ? ((mh.lo && mh.lo.el) || '') : ((mh.up && mh.up.el) || '');
  var t         = type || 'general';

  function pt(label, dir, weight, confidence, source) {
    tags.push({ label: label, dir: dir, weight: weight, confidence: confidence, source: source });
  }

  // ── 1. 方向類（source: tiYong + bian）──
  var dirMap = {
    '用生體': { label: '推進',     dir: 'positive', w: 8 },
    '比和':   { label: '有機會',   dir: 'positive', w: 6 },
    '體克用': { label: '推進',     dir: 'positive', w: 5 },
    '體生用': { label: '停滯',     dir: 'neutral',  w: 4 },
    '用克體': { label: '不宜妄動', dir: 'negative', w: 8 }
  };
  var de = dirMap[rel] || { label: '觀望', dir: 'neutral', w: 3 };
  pt(de.label, de.dir, de.w,
    (judge === '大吉' || judge === '凶') ? '高' : '中', 'tiYong');

  // 變卦走向補充
  var bianDirMap = {
    '好轉':    { label: '好轉',    dir: 'positive', w: 7 },
    '惡化':    { label: '惡化',    dir: 'negative', w: 7 },
    '拖延':    { label: '拖延',    dir: 'negative', w: 5 },
    '反覆':    { label: '反覆',    dir: 'neutral',  w: 4 },
    '平穩':    { label: '停滯',    dir: 'neutral',  w: 3 },
    '另有出口':{ label: '有機會',  dir: 'positive', w: 5 }
  };
  var bdt = bianDirMap[bianTrend.type];
  if (bdt) pt(bdt.label, bdt.dir, bdt.w, '中', 'bian');

  // 先吉後阻 / 先難後易
  if (huHidden.cat === '暗中有助' && (bianTrend.type === '惡化' || bianTrend.type === '拖延'))
    pt('先吉後阻', 'negative', 6, '中', 'hu');
  else if (huHidden.cat === '外部壓制' && (bianTrend.type === '好轉' || bianTrend.type === '另有出口'))
    pt('先難後易', 'positive', 6, '中', 'hu');

  // ── 2. 主客類（source: tiYong + hu）──
  var subjectMap = {
    '體克用': { label: '我方主動',   dir: 'positive', w: 7 },
    '用生體': { label: '對方主導',   dir: 'neutral',  w: 6 },
    '用克體': { label: '外部壓制',   dir: 'negative', w: 8 },
    '體生用': { label: '自耗',       dir: 'negative', w: 5 },
    '比和':   { label: '拉鋸',       dir: 'neutral',  w: 4 }
  };
  var se = subjectMap[rel];
  if (se) pt(se.label, se.dir, se.w, '高', 'tiYong');

  if (huHidden.cat === '外部壓制') pt('外部壓制', 'negative', 5, '中', 'hu');
  if (huHidden.cat === '自耗')     pt('自耗',     'negative', 4, '中', 'hu');
  if (huHidden.cat === '可控')     pt('可控局面', 'positive', 4, '中', 'hu');

  // ── 3. 障礙類（source: hu + ben + season + dong）──
  var obstacleMap = {
    '外部壓制': '外力阻礙',
    '自耗':     '情緒干擾',
    '拉鋸':     '溝通不順',
    '變數':     '隱情未明'
  };
  var obs = obstacleMap[huHidden.cat];
  if (obs) pt(obs, 'negative', 4, '中', 'hu');

  if (tiWS.level === '死' || tiWS.level === '囚') {
    pt('時機未到', 'negative', 5, '高', 'season');
    pt('當下不利', 'negative', 4, '高', 'season');
  }
  if (yoWS.level === '旺' && (tiWS.level === '死' || tiWS.level === '囚'))
    pt('現實壓力', 'negative', 5, '中', 'season');

  var benObstacles = {
    '訟': '溝通不順', '困': '現實壓力', '蹇': '外力阻礙',
    '否': '外力阻礙', '剝': '現實壓力', '蒙': '隱情未明',
    '睽': '溝通不順', '旅': '第三方因素', '遁': '隱情未明'
  };
  var benObs = Object.keys(benObstacles).filter(function(k){ return benName.indexOf(k) !== -1; })[0];
  if (benObs) pt(benObstacles[benObs], 'negative', 4, '中', 'ben');

  if (dong === 3 || dong === 4) pt('溝通不順', 'negative', 3, '低', 'dong');

  // ── 4. 時間類（source: dong + season + bian）──
  var tSpeed = timingObj.score || 0;
  if      (tSpeed >= 2)  pt('短期有動', 'positive', 6, '高', 'dong');
  else if (tSpeed <= -2) pt('短期無動', 'negative', 6, '高', 'dong');
  else                   pt('短期有動', 'neutral',  3, '低', 'dong');

  if (timingObj.label === '拖延型') pt('延後有利', 'neutral',  4, '中', 'bian');
  if (timingObj.label === '反覆型') pt('反覆',     'negative', 5, '中', 'bian');
  if (tiWS.level === '死' || tiWS.level === '囚')
    pt('當下不利', 'negative', 5, '高', 'season');

  // ── 5. 類型專屬標籤（source: tiYong + bian + hu + dong + ben）──
  if (t === 'love') {
    if (rel === '用生體' && dong >= 3 && dong <= 4)
      pt('曖昧升溫', 'positive', 7, '中', 'tiYong');
    if (rel === '比和' || huHidden.cat === '拉鋸')
      pt('對方觀望', 'neutral', 5, '中', 'hu');
    if (rel === '體生用' && bianTrend.type === '好轉')
      pt('有互動但難落實', 'neutral', 5, '中', 'tiYong');
    if (bianTrend.type === '反覆' || timingObj.label === '反覆型')
      pt('關係反覆', 'negative', 6, '中', 'bian');
    if (rel === '用生體' && (bianTrend.type === '惡化' || bianTrend.type === '拖延'))
      pt('有桃花但不穩', 'neutral', 6, '中', 'bian');
    if (benName.indexOf('旅') !== -1 || benName.indexOf('姤') !== -1 || bianName.indexOf('睽') !== -1)
      pt('第三方因素', 'negative', 5, '中', 'ben');

  } else if (t === 'career') {
    if (rel === '用克體')
      pt('上位壓力', 'negative', 7, '高', 'tiYong');
    if (tiWS.level === '死' || tiWS.level === '囚')
      pt('制度卡住', 'negative', 5, '中', 'season');
    if (huHidden.cat === '外部壓制' && bianTrend.type === '好轉')
      pt('先卡後動', 'positive', 6, '中', 'hu');
    if (rel === '用生體' || rel === '體克用')
      pt('適合轉動', 'positive', 5, '中', 'tiYong');
    if (rel === '用克體' || rel === '體生用')
      pt('適合先守', 'neutral', 5, '中', 'tiYong');

  } else if (t === 'wealth') {
    if (rel === '用生體')
      pt('偏財虛', 'neutral', 4, '中', 'tiYong');
    if (rel === '體克用' || rel === '比和')
      pt('正財穩', 'positive', 5, '中', 'tiYong');
    if (rel === '體生用' || rel === '用克體')
      pt('財來財去', 'negative', 6, '中', 'tiYong');
    if (rel === '用克體' || bianTrend.type === '惡化')
      pt('不宜冒進', 'negative', 7, '高', 'bian');

  } else if (t === 'health') {
    if (rel === '用克體' || tiWS.level === '死')
      pt('現實壓力', 'negative', 5, '中', 'tiYong');
    if (tiWS.level === '囚' || tiWS.level === '死')
      pt('當下不利', 'negative', 5, '高', 'season');
    if (huHidden.cat === '自耗')
      pt('情緒干擾', 'negative', 4, '中', 'hu');

  } else if (t === 'relationship') {
    if (rel === '用克體')
      pt('外力阻礙', 'negative', 6, '高', 'tiYong');
    if (rel === '體克用')
      pt('我方主動', 'positive', 5, '中', 'tiYong');
    if (benName.indexOf('訟') !== -1 || bianName.indexOf('訟') !== -1)
      pt('溝通不順', 'negative', 6, '中', 'ben');

  } else if (t === 'family') {
    if (rel === '體生用')
      pt('自耗', 'negative', 5, '中', 'tiYong');
    if (dong === 5)
      pt('第三方因素', 'neutral', 4, '低', 'dong');
    if (bianTrend.type === '好轉')
      pt('延後有利', 'positive', 5, '中', 'bian');
  }

  // ── 去重（同 label 只保留 weight 最高者），按 weight 降冪 ──
  var seen = {};
  return tags.filter(function(tag) {
    if (seen[tag.label] === undefined || seen[tag.label] < tag.weight) {
      seen[tag.label] = tag.weight;
      return true;
    }
    return false;
  }).sort(function(a, b) { return b.weight - a.weight; });
}


// ─────────────────────────────────────────────────────────────────
// 【新增2】buildMeihuaSummary — summary / shortVerdict / decisionHint
// ─────────────────────────────────────────────────────────────────
function buildMeihuaSummary(mh, type, analysis) {
  if (!mh || !analysis) return { summary: '', shortVerdict: '', decisionHint: 'now-wait' };

  var rel       = (mh.ty && mh.ty.r) || '—';
  var dong      = mh.dong || 1;
  var tiWS      = (analysis.wangShuai && analysis.wangShuai.ti) || { level: '平' };
  var bianTrend = analysis.trend  || { type: '反覆' };
  var huHidden  = (analysis.structure && analysis.structure.huGua && analysis.structure.huGua.hidden)
                  || { cat: '變數' };
  var dongStage = analysis.dongYaoFull || { stage: '起步' };
  var timingObj = analysis.timingFull  || { label: '短期', score: 0 };
  var benName   = (mh.ben && mh.ben.n) || '';
  var t         = type || 'general';

  var isGood    = rel === '用生體' || rel === '體克用' || rel === '比和';
  var isBad     = rel === '用克體' || rel === '體生用';
  var isQuick   = timingObj.label === '很快' || timingObj.label === '短期';
  var isSlow    = timingObj.label === '拖延型' || timingObj.label === '反覆型';
  var bGood     = bianTrend.type === '好轉' || bianTrend.type === '另有出口';
  var bBad      = bianTrend.type === '惡化';
  var bRepeats  = bianTrend.type === '反覆';
  var seasonBad = tiWS.level === '死' || tiWS.level === '囚';

  // ── shortVerdict ──
  var shortVerdict = '';
  if      (isGood && isQuick && bGood)         shortVerdict = '短期有動，方向正確，可以推進';
  else if (isGood && isQuick && bRepeats)       shortVerdict = '短期有動，但進展不穩，別過度期待';
  else if (isGood && isSlow)                    shortVerdict = '事情有機會，但需等條件成熟';
  else if (isGood && bBad)                      shortVerdict = '現在看起來順，但走向不樂觀，要留後路';
  else if (isBad  && isQuick && bGood)          shortVerdict = '現在有阻力，但後續有轉機';
  else if (isBad  && bBad)                      shortVerdict = '局面受阻，短期難以改變，先退守';
  else if (isBad  && seasonBad)                 shortVerdict = '時機與局面都不利，不宜強推';
  else if (bRepeats)                            shortVerdict = '結果反覆，不穩定，觀察為主';
  else if (seasonBad && isGood)                 shortVerdict = '局面可以，但當下時機偏弱，慢慢來';
  else if (seasonBad)                           shortVerdict = '時機不對，暫時按兵不動';
  else if (isGood)                              shortVerdict = '局面對你有利，可以主動推進';
  else                                          shortVerdict = '局面暫時受阻，宜觀望';

  // ── summary ──
  var relLabel = {
    '用生體': '外力助你', '比和': '勢均力敵',
    '體克用': '你可主導', '體生用': '你在付出', '用克體': '外在壓制'
  }[rel] || '局勢不明';

  var typeFocusMap = {
    love: '感情', career: '工作', wealth: '財運',
    health: '身體', relationship: '人際', family: '家庭', general: '事情'
  };
  var focusWord = typeFocusMap[t] || '事情';
  var tiWsLabel = (tiWS.level === '旺' || tiWS.level === '相') ? '，當下月令有利' :
                  (tiWS.level === '死' || tiWS.level === '囚') ? '，當下月令不利' : '';

  var summary = focusWord + '目前「' + benName + '」，' +
    '體用：' + relLabel + '，動爻第' + dong + '爻（' + (dongStage.stage||'起步') + '階段），' +
    '走向偏「' + (bianTrend.type||'反覆') + '」' + tiWsLabel + '。' + shortVerdict;

  // ── decisionHint ──
  var decisionHint = 'now-wait';
  if      (rel === '用生體' && bGood && isQuick)   decisionHint = 'now-push';
  else if (rel === '比和'   && bGood)               decisionHint = 'now-push';
  else if (rel === '體克用' && bGood)               decisionHint = 'now-push';
  else if (rel === '用生體' && isSlow)              decisionHint = 'delayed-opportunity';
  else if (rel === '體克用' && isSlow)              decisionHint = 'delayed-opportunity';
  else if (isGood && bRepeats)                      decisionHint = 'unstable-progress';
  else if (rel === '體生用' && bGood)               decisionHint = 'now-hold';
  else if (rel === '體生用' && !bGood)              decisionHint = 'now-wait';
  else if (rel === '用克體' && bGood)               decisionHint = 'now-hold';
  else if (rel === '用克體' && !bGood)              decisionHint = 'now-withdraw';
  else if (seasonBad && !isGood)                    decisionHint = 'now-withdraw';
  else if (isSlow || seasonBad)                     decisionHint = 'delayed-opportunity';
  else if (bRepeats)                                decisionHint = 'unstable-progress';

  return { summary: summary, shortVerdict: shortVerdict, decisionHint: decisionHint };
}


// ─────────────────────────────────────────────────────────────────
// 【新增3】buildMeihuaTiming — 標準化 timing 物件
// ─────────────────────────────────────────────────────────────────
function buildMeihuaTiming(mh, type, analysis) {
  if (!mh || !analysis) {
    return { speed: 'normal', windowLabel: '1-4週', windowDays: [7,28], tendency: 'delayed', note: '資料不足，暫以短期估算' };
  }

  var timingObj = analysis.timingFull  || { label: '短期', score: 0 };
  var tiWS      = (analysis.wangShuai && analysis.wangShuai.ti) || { level: '平' };
  var bianTrend = analysis.trend || { type: '反覆' };

  var speedMap = {
    '很快':   'fast',
    '短期':   'normal',
    '稍晚':   'delayed',
    '拖延型': 'delayed',
    '反覆型': 'unstable'
  };
  var speed = speedMap[timingObj.label] || 'normal';

  var windowData = {
    '很快':   { label: '1-7天',     days: [1, 7] },
    '短期':   { label: '1-4週',     days: [7, 28] },
    '稍晚':   { label: '1-3個月',   days: [28, 90] },
    '拖延型': { label: '3個月以上', days: [90, 180] },
    '反覆型': { label: '時機未定',  days: null }
  };
  var wd = windowData[timingObj.label] || { label: '1-4週', days: [7, 28] };

  var tendency = 'delayed';
  if      (speed === 'fast')     tendency = 'quick-hit';
  else if (speed === 'normal')   tendency = 'quick-hit';
  else if (speed === 'unstable') tendency = 'repeated';
  else if (bianTrend.type === '惡化') tendency = 'blocked';
  else                           tendency = 'delayed';

  var note = timingObj.note || '';
  if (!note) {
    if      (speed === 'fast')     note = '卦氣活躍，近期很快有動靜，不要錯過';
    else if (speed === 'normal')   note = '有進展，但不是馬上，保持耐心推進';
    else if (speed === 'unstable') note = '時間不定，可能走走停停，準備好長期應對';
    else                           note = '需要等待條件改變，不宜強催';
  }
  if (tiWS.level === '旺' || tiWS.level === '相') note += '（月令有利，時機靠近）';
  else if (tiWS.level === '死' || tiWS.level === '囚') note += '（月令不利，應期可能再延後）';

  return {
    speed:       speed,
    windowLabel: wd.label,
    windowDays:  wd.days,
    tendency:    tendency,
    note:        note
  };
}


// ─────────────────────────────────────────────────────────────────
// 【新增4】buildMeihuaRisk / buildMeihuaStrategy
// ─────────────────────────────────────────────────────────────────
function buildMeihuaRisk(mh, type, analysis) {
  if (!mh || !analysis) return { level: 'mid', points: [] };

  var rel       = (mh.ty && mh.ty.r) || '—';
  var tiWS      = (analysis.wangShuai && analysis.wangShuai.ti) || { level: '平' };
  var huHidden  = (analysis.structure && analysis.structure.huGua && analysis.structure.huGua.hidden)
                  || { cat: '變數' };
  var bianTrend = analysis.trend || { type: '反覆' };
  var points    = [];
  var t         = type || 'general';

  var riskScore = 0;
  if (rel === '用克體')              riskScore += 3;
  if (rel === '體生用')              riskScore += 1;
  if (tiWS.level === '死')           riskScore += 2;
  if (tiWS.level === '囚')           riskScore += 1;
  if (bianTrend.type === '惡化')     riskScore += 2;
  if (bianTrend.type === '反覆')     riskScore += 1;
  if (huHidden.cat === '外部壓制')   riskScore += 1;
  if (huHidden.cat === '自耗')       riskScore += 1;

  var level = riskScore >= 5 ? 'high' : riskScore >= 2 ? 'mid' : 'low';

  if (rel === '用克體')
    points.push('外在壓力明顯，有被壓制或阻礙的風險');
  if (rel === '體生用')
    points.push('你持續付出，回報不明確，能量有消耗過度的風險');
  if (tiWS.level === '死' || tiWS.level === '囚')
    points.push('月令對你不利，當下動作容易事倍功半');
  if (bianTrend.type === '惡化')
    points.push('若不調整策略，走向會繼續惡化');
  if (bianTrend.type === '反覆')
    points.push('結果容易反覆，需防情緒性決策');
  if (huHidden.cat === '外部壓制')
    points.push('有看不到的外力在壓著這件事，注意隱性阻礙');
  if (huHidden.cat === '自耗')
    points.push('內耗風險高，注意不要因猶豫焦慮消耗自己');

  if (t === 'wealth' && (rel === '用克體' || bianTrend.type === '惡化'))
    points.push('財務有風險，不宜冒進或過度槓桿');
  if (t === 'health' && (tiWS.level === '死' || tiWS.level === '囚'))
    points.push('身體能量偏弱，注意免疫力和慢性消耗');
  if (t === 'love' && (bianTrend.type === '反覆' || rel === '用克體'))
    points.push('感情有反覆或外力阻礙的風險，注意自我保護');

  if (points.length === 0) points.push('整體風險偏低，保持現有方向即可');

  return { level: level, points: points };
}

function buildMeihuaStrategy(mh, type, analysis, decisionHint) {
  if (!mh || !analysis) return { mode: 'observe', advice: [] };

  var rel          = (mh.ty && mh.ty.r) || '—';
  var actionAdvice = analysis.actionAdvice || [];
  var hint         = decisionHint || 'now-wait';

  var modeMap = {
    'now-push':           'push',
    'now-wait':           'wait',
    'now-hold':           'stabilize',
    'now-withdraw':       'retreat',
    'delayed-opportunity':'wait',
    'unstable-progress':  'observe'
  };
  var mode = modeMap[hint] || 'observe';

  var advice = actionAdvice.length
    ? actionAdvice.slice()
    : ['維持現狀，觀察局勢變化', '不急著做大決定', '等待更明確的訊號'];

  var modeHint = {
    push:      '時機對你有利，主動出擊效果最好',
    wait:      '等待比強推效果更好，耐心是關鍵',
    stabilize: '守住現有局面，避免不必要的消耗',
    retreat:   '先退一步，保護好自己再說',
    observe:   '先觀察清楚再決定，不要被情緒帶著走'
  }[mode];
  if (modeHint && advice.indexOf(modeHint) === -1) advice.push(modeHint);

  return { mode: mode, advice: advice };
}


// ─────────────────────────────────────────────────────────────────
// 【新增5】buildMeihuaOutput — 主整合入口
// 呼叫：buildMeihuaOutput(mh, type)
// 自動把所有輸出掛回 mh 本體，確保 S.meihua.tags 等可直接存取。
// ─────────────────────────────────────────────────────────────────
function buildMeihuaOutput(mh, type) {
  if (!mh) return null;

  var t = type || 'general';

  // 1. 核心分析
  var analysis = analyzeMeihua(mh, t);

  // 2. 各輸出層
  var tags       = buildMeihuaTags(mh, t, analysis);
  var summaryObj = buildMeihuaSummary(mh, t, analysis);
  var timing     = buildMeihuaTiming(mh, t, analysis);
  var risk       = buildMeihuaRisk(mh, t, analysis);
  var strategy   = buildMeihuaStrategy(mh, t, analysis, summaryObj.decisionHint);

  // 3. 組裝
  var output = {
    analysis:     analysis,
    tags:         tags,
    summary:      summaryObj.summary,
    shortVerdict: summaryObj.shortVerdict,
    decisionHint: summaryObj.decisionHint,
    timing:       timing,
    risk:         risk,
    strategy:     strategy,
    score:        analysis.score,
    dir:          analysis.dir,
    phase:        analysis.phase,
    narrativeBlocks: analysis.narrativeBlocks
  };

  // 4. 掛回 mh 本體（保持相容性）
  mh.analysis     = analysis;
  mh.tags         = tags;
  mh.summary      = summaryObj.summary;
  mh.shortVerdict = summaryObj.shortVerdict;
  mh.decisionHint = summaryObj.decisionHint;
  mh.timing       = timing;
  mh.risk         = risk;
  mh.strategy     = strategy;

  return output;
}


// （calcMH 已移至檔案頂部，gByL 之後）
