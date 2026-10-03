/* Explicit primary-source placements. Symbols retain source/policy and actual
 * course/transmission/participant hits; a name alone never decides an event. */
(function(root){
  'use strict';
  const VERSION='20261003shensha1',Z=[...'子丑寅卯辰巳午未申酉戌亥'],G=[...'甲乙丙丁戊己庚辛壬癸'],JI=[2,4,5,7,5,7,8,10,11,1],GE=[0,0,1,1,2,2,3,3,4,4],ZE=[4,2,0,0,2,1,1,2,3,3,2,4];
  const mod=(n,k)=>(n%k+k)%k,rows=[],SOURCES={guide1:'https://shuyuan.zhiming.life/read/六壬指南注解/30',guide2:'https://shuyuan.zhiming.life/read/六壬指南注解/31',guide3:'https://shuyuan.zhiming.life/read/六壬指南注解/32',daquan:'https://zh.wikisource.org/zh-hant/六壬大全/1',daquan5:'https://zh.wikisource.org/zh-hant/六壬大全/5'};
  const chars=s=>[...s],cycle=(s,n=12)=>Array.from({length:n},(_,i)=>chars(s)[i%chars(s).length]),forward=(start,step=1)=>Array.from({length:12},(_,i)=>Z[mod(start+step*i,12)]),season=s=>chars(s).flatMap(x=>[x,x,x]);
  function add(names,basis,table,section='guide1',note=''){
    for(const name of names.split(' '))rows.push({id:basis+'-'+name,name,basis,table:table.slice(),source:SOURCES[section],section,rule:note||'依本表索引取實際定位，不以名稱替代盤面作用'});
  }
  // Twelve annual gods follow the source's relative positions; these are not
  // the twelve heavenly generals that already ride the sky plate.
  ['太歲','太陽','喪門','歲六合','歲官符','歲小耗','歲破','龍德','歲白虎','歲福德','弔客','病符'].forEach((name,offset)=>add(name,'yearBranch',forward(offset),'guide1','按太歲順行第'+offset+'支；與十二天將分列'));
  add('歲刑','yearBranch',chars('卯戌巳子辰申午丑寅酉未亥'));
  add('大將軍','yearBranch',chars('酉酉子子子卯卯卯午午午酉'));
  add('天庭','yearGan',chars('丑寅辰巳辰巳未申戌亥'));
  add('歲干死符','yearGan',chars('申申亥亥寅寅巳巳辰辰'));
  const triads=[[8,0,4],[5,9,1],[2,6,10],[11,3,7]],horse=chars('寅亥申巳寅亥申巳寅亥申巳');
  for(const basis of ['yearBranch','dayBranch']){
    for(const [name,table]of [['驛馬',horse],['華蓋',cycle('辰丑戌未')],['劫煞',cycle('巳寅亥申')],['災煞',cycle('午卯子酉')],['咸池',cycle('酉午卯子')],['四煞',cycle('未辰丑戌')],['亡神',cycle('亥申巳寅')]])add(name,basis,table,'guide3','按本層地支三合局定位；歲與日同名保留各自來源層');
  }
  // Month number is explicitly supplied by jie-month or lunar-month policy.
  for(const [names,start]of [
    ['月建 小時 天虎 木煞',2],['天龍 遊煞',3],['月天醫 雌虎 瘟煞 天巫',4],['厄煞 孝杖 月死神 電煞 火燭',5],
    ['死氣 月官符 孝服 謾語',6],['井煞 枯骨 月小耗 天印 天羊 福神',7],['月破 兵煞 月大耗 路神',8],
    ['書信 天機 天錢',9],['天書 天害 願神 月地醫',10],['飛魂 伏殃 天詔 病煞 兒煞',11],['生氣 雨煞',0],['血支 天坑 佛煞 天牛 墳墓',1]
  ])add(names,'month',forward(start),'guide1','正月起指定支，逐月順十二；條件性乘將別名不作獨立定位');
  for(const [names,start]of [
    ['神像 天豬 月建合神',11],['天鼠 天視',0],['天怪',1],['風煞',2],['燭命 憂焚',3],['厭對 血光',4],
    ['月害 陰空',5],['破器 化神 地咒',6],['陰奸 邪神',7],['天猴 風伯 天解',8],['軒轅 天雞',9],['天狗 四足 月厭 石煞 火光',10]
  ])add(names,'month',forward(start,-1),'guide2','正月起指定支，逐月逆十二；天解正申逆十二依訂訛，與《大全》隔月法分列');
  const backwardGroup=start=>Array.from({length:12},(_,i)=>Z[mod(start-3*(i%4),12)]),forwardGroup=start=>Array.from({length:12},(_,i)=>Z[mod(start+3*(i%4),12)]);
  for(const [names,start]of [
    ['月驛馬',8],['天鬼 天吏 長繩 天咒',9],['光影 黃幡 火怪',10],['天獄 墓門 天網 女災 雷煞 月劫煞',11],
    ['坑坎 山魈 月災煞 鏡煞 披麻',0],['五盜 小煞 天煞 迷惑 月煞',1],['天盜 雷公',2],['月桃花 月咸池 懸索 大時',3],
    ['邪鬼',4],['月亡神 遊禍',5],['月大煞 伏骨',6],['下喪 月鬼三合 穢煞 喪魄',7]
  ])add(names,'month',backwardGroup(start),'guide2','正五九同位，二六十同位，三七十一同位，四八十二同位，逆行三支；訂訛大煞午起逆四仲');
  for(const [names,start]of [
    ['驛合 天旺 成神',5],['天破',6],['香爐 月喪門 獄煞',7],['奸門',8],['天信',9],['反激',10],['陽煞',11],
    ['邪怪 天火 月雨師',0],['月奸',1],['釜神 產煞 天廁 奸私',2],['月盜神',3],['天械 上喪',4]
  ])add(names,'month',forwardGroup(start),'guide2','正五九同位等四組，順行三支');
  for(const [names,table]of [
    ['天喜 天耳','戌丑辰未'],['寡宿 三丘 關神 管神','丑辰未戌'],['皇書 戰雄 吏神','寅巳申亥'],['賊神 奸盜 轉煞 絲麻','卯午酉子'],
    ['浴盆 龍神','辰未戌丑'],['喝散 孤辰 梁神 鑰神','巳申寅亥'],['火鬼','午酉子卯'],['哭神 五墓 地獄','未戌丑辰'],['煞神 絕氣 戰雌','申亥寅巳'],['四廢 喪車','酉子卯午'],
    ['大德','午辰子寅'],['遊神','丑子亥戌'],['戲神','巳子酉辰'],['泰神','丑子戌亥'],['天車','巳辰未酉'],['死別','戌未辰丑'],['奸神','寅亥申巳'],['飛禍','申寅巳亥'],['時盜','巳卯酉子']
  ])add(names,'month',season(table),'guide1','按四時三個節月；喝散等巳申寅亥採本頁韻訣，不暗換《大全》異表');
  for(const [name,table]of [
    ['地解','申申酉酉戌戌亥亥午午未未'],['解神','申申戌戌子子寅寅辰辰午午'],['皇恩方圖','戌丑辰未酉卯子午寅巳申亥'],
    ['會神','未戌寅亥酉子丑午巳卯申辰'],['信神','申戌寅丑亥辰巳未巳未申戌'],['飛廉','戌巳午未申酉辰亥子丑寅卯'],
    ['往亡','寅巳申亥卯午酉子辰未戌丑'],['天賊','辰酉寅未子巳戌卯申丑午亥'],['五鬼','午辰寅酉卯申丑巳子亥未戌'],
    ['相負','亥亥丑丑卯卯巳巳未未酉酉'],['枉屈','巳巳未未酉酉亥亥丑丑卯卯'],['瓦煞','巳子丑寅卯辰亥午未申酉戌'],
    ['門煞方圖','戌酉辰卯戌酉辰卯戌酉戌亥'],['聖心','亥巳子午丑未寅申卯酉辰戌'],['玉宇','卯酉辰戌巳亥午子未丑申寅'],
    ['金堂','辰戌巳亥午子未丑申寅酉卯'],['受死','戌辰亥巳子午丑未寅申卯酉'],['血忌','丑未寅申卯酉辰戌巳亥午子'],
    ['月刑','巳子辰申午丑寅酉未亥卯戌']
  ])add(name,'month',chars(table),'guide1');
  add('月破碎','month',cycle('酉巳丑'));add('月白衣','month',cycle('未辰丑'));add('歸忌','month',cycle('丑寅子'));
  add('罪至','month',chars('午子未丑申寅酉卯戌辰亥巳'),'daquan5','《指南》轉錄第十月胡字保留稽核；本條明示採《大全》卷五出軍凶日完整月序，十月為辰，不以猜字代校勘');
  add('天馬','month',cycle('午申戌子寅辰'),'daquan','本欄單獨採《大全》天馬午起順六陽，來源明示；不以錯行月序表補猜');
  add('天財','month',cycle('辰午申戌子寅'),'guide2');add('天刑','month',cycle('寅辰午申戌子'),'guide2');add('怪煞','month',cycle('卯巳未酉亥丑'),'guide2');add('獸煞','month',cycle('戌子寅辰午申'),'guide2');
  add('天德','month',chars('丁申壬辛亥甲癸寅丙乙巳庚'),'guide1','坤申、乾亥、艮寅、巽巳；干神按十干寄宮投影，仍保留原干');
  add('月德','month',cycle('丙甲壬庚'),'guide1','原干丙甲壬庚與寄宮巳寅亥申分列');add('月德合','month',cycle('辛己丁乙'));
  add('天德合','month',['壬',null,'丁','丙',null,'己','戊',null,'辛','庚',null,'乙'],'guide1','只有干神有五合；四隅月份無天干合，不虛構一支');
  add('天赦','month',Array.from({length:12},(_,i)=>['戊寅','甲午','戊申','甲子'][Math.floor(i/3)]),'guide2','四時固定干支；需本日干支相同才成立，僅同支不當天赦日');
  add('天轉','month',Array.from({length:12},(_,i)=>['乙卯','丙午','辛酉','壬子'][Math.floor(i/3)]),'daquan','固定干支對應本日，保留同支定位與本日成立兩層');
  add('地轉','month',Array.from({length:12},(_,i)=>['辛卯','戊午','癸酉','丙子'][Math.floor(i/3)]),'daquan');
  add('天目','month',season('乙丁辛癸'),'guide3','採庄氏辨訛天目四季干神；寄宮辰未戌丑，與天耳分列');
  // Stem-based daily symbols use the source's explicit ten-entry tables.
  for(const [name,table]of [
    ['日德','寅申巳亥巳寅申巳亥巳'],['日合','未申戌亥丑寅辰巳未巳'],['日祿','寅卯巳午巳午申酉亥子'],
    ['日長生方圖','亥亥寅寅申申巳巳申申'],['恩赦','寅辰巳未巳未申戌亥丑'],['干奇','午巳辰卯寅丑未申酉戌'],
    ['日解','亥申未丑酉亥申未丑酉'],['日醫','卯亥丑未巳卯亥丑未巳'],['賢貴','丑申寅寅午丑申寅寅午'],
    ['福星','子丑子子未未丑丑巳巳'],['文星','亥亥寅寅午午巳巳申申'],['飛符','巳辰卯寅丑午未申酉戌'],
    ['遊都','丑子寅巳申丑子寅巳申'],['日賊','辰午申亥寅辰午申亥寅'],['日盜','子亥卯申巳子亥卯申巳'],
    ['日奸','亥酉辰申巳亥酉辰申巳'],['日淫','午午未未戌戌寅寅巳巳'],['日大煞','亥亥未未戌戌寅寅巳巳']
  ])add(name,'dayGan',chars(table),'guide3');
  const lu=chars('寅卯巳午巳午申酉亥子');add('羊刃','dayGan',lu.map(z=>Z[mod(Z.indexOf(z)+1,12)]),'guide3','祿前一位');add('飛刃','dayGan',lu.map(z=>Z[mod(Z.indexOf(z)+7,12)]),'guide3','羊刃對沖');
  add('魯都','dayGan',chars('丑子寅巳申丑子寅巳申').map(z=>Z[mod(Z.indexOf(z)+6,12)]),'guide3');
  for(const [name,table]of [
    ['支德','巳午未申酉戌亥子丑寅卯辰'],['支六合','丑子亥戌酉申未午巳辰卯寅'],['支儀','午巳辰卯寅丑未申酉戌亥子'],
    ['支破','酉辰亥午丑申卯戌巳子未寅'],['支刑','卯戌巳子辰申午丑寅酉未亥'],['支害','未午巳辰卯寅丑子亥戌酉申'],
    ['日死神','卯辰巳午未申酉戌亥子丑寅'],['日病符','亥子丑寅卯辰巳午未申酉戌'],['勾神','卯戌巳子未寅酉辰亥午丑申'],
    ['絞神','酉辰亥午丑申卯戌巳子未寅'],['雷電','辰辰未未戌戌丑丑寅寅卯卯'],['日雨師','申酉戌亥子丑寅卯辰巳午未'],
    ['晴朗','午未申酉戌亥子丑寅卯辰巳'],['白衣翰林','酉未巳卯丑亥酉未巳卯丑亥']
  ])add(name,'dayBranch',chars(table),'guide3');
  add('支破碎','dayBranch',cycle('巳丑酉'));add('支沖','dayBranch',forward(6),'guide3');
  add('支三合','dayBranch',Z.map((_,i)=>triads.find(t=>t.includes(i)).filter(b=>b!==i).map(b=>Z[b])),'guide3','同三合局其餘兩支，保留各支實際位置；不當完整三合成局');
  const graves=[7,10,4,1,4];add('日墓','dayGan',G.map((_,i)=>Z[graves[GE[i]]]),'guide3','此表取五行墓：木未、火戌、土水辰、金丑；與長生方圖土申生之爭分列');add('支墓','dayBranch',Z.map((_,i)=>Z[graves[ZE[i]]]),'guide3');
  add('日官','dayGan',G.map((_,i)=>Z.filter((z,b)=>mod(ZE[b]+2,5)===GE[i]&&b%2!==i%2)),'guide3','克我異陰陽為官，水干土官有兩支');
  add('日鬼','dayGan',G.map((_,i)=>Z.filter((z,b)=>mod(ZE[b]+2,5)===GE[i]&&b%2===i%2)),'guide3','克我同陰陽為鬼；各支實際旬空、將克、生制另審');
  add('支鬼','dayBranch',Z.map((_,i)=>Z.filter((z,b)=>mod(ZE[b]+2,5)===ZE[i]&&b%2===i%2)),'guide3');
  for(const [name,offset]of [['六儀',0],['旬乙盜神',1],['旬庚響動',6],['旬丁',3],['旬辛五亡',7],['旬癸閉口',9]])add(name,'xun',forward(offset),'guide2','實際旬首甲所在支加'+offset+'位；不是任意找同名神煞');
  add('三奇','xun',Z.map((_,i)=>[0,10].includes(i)?'丑':[6,8].includes(i)?'子':[2,4].includes(i)?'亥':null),'daquan','甲子／甲戌丑，甲申／甲午子，甲辰／甲寅亥；只用有效六旬');
  const audits=[
    {issue:'《指南》皇恩方圖與韻訣末四月及《大全》不同',selected:'皇恩方圖採戌丑辰未酉卯子午寅巳申亥；別表原位另列，不混入64課族《大全》算法',variants:{guideVerse:'戌丑辰未酉卯子午寅申巳亥',daquan:'戌丑辰未卯酉子午亥寅巳申'}},
    {issue:'《指南》門煞方圖與韻訣不一致',selected:'門煞方圖採完整十二欄，另列韻訣四組酉辰卯戌，不暗換'},
    {issue:'天馬／皇恩月序表轉錄行位不清',selected:'天馬單欄明示另採《大全》午順六陽；未將不清楚陰支行擅作皇恩'},
    {issue:'《指南》罪至第十月轉錄為胡，不是干支',selected:'另採《大全》卷五完整月序，十辰；原錯字保留，不宣稱已校改《指南》原图',raw:'午子未丑申寅酉卯戌胡亥巳',selectedTable:'午子未丑申寅酉卯戌辰亥巳',source:SOURCES.daquan5},
    {issue:'日長生方圖土申生，末段編者辨訂主張土干同火',selected:'日長生方圖保留原表；反對意見明示，不以另一版長生覆蓋'},
    {issue:'神煞名稱重複且同一原理可產生多個別名',selected:'按來源層和id保留；不能當獨立證據票数。只定位，不將名字直譯成疾病、災難或保證事件'}
  ];
  function target(value){
    if(value==null)return {original:null,branches:[],status:'not-applicable'};
    if(Array.isArray(value))return {original:value.slice(),branches:value.slice(),status:'calculated'};
    if(G.includes(value))return {original:value,type:'stem',branches:[Z[JI[G.indexOf(value)]]],status:'calculated'};
    if(Z.includes(value))return {original:value,type:'branch',branches:[value],status:'calculated'};
    if(value.length===2&&G.includes(value[0])&&Z.includes(value[1]))return {original:value,type:'ganzhi',branches:[value[1]],status:'calculated'};
    throw Error('神煞來源表定位無效：'+value);
  }
  function compute(chart,context={},options={}){
    if(!chart?.day||chart.plate?.length!==12||chart.courses?.length!==4||chart.transmissions?.length!==3)throw Error('神煞需要完整課盤');
    const monthPolicy=options.monthPolicy||'jie';if(!['jie','lunar'].includes(monthPolicy))throw Error('神煞月份取法無效');
    const yearGan=context.yearGan||chart.time?.pillars?.year?.gan,yearBranch=context.yearBranch||chart.time?.pillars?.year?.zhi,monthBranch=context.monthBranch||chart.time?.pillars?.month?.zhi;
    const month=monthPolicy==='jie'?(Z.includes(monthBranch)?mod(Z.indexOf(monthBranch)-2,12):null):(Number.isInteger(context.lunarMonth)&&Math.abs(context.lunarMonth)>=1&&Math.abs(context.lunarMonth)<=12?Math.abs(context.lunarMonth)-1:null);
    const indices={yearGan:G.indexOf(yearGan),yearBranch:Z.indexOf(yearBranch),dayGan:G.indexOf(chart.day.gan),dayBranch:Z.indexOf(chart.day.zhi),xun:Z.indexOf(chart.xun.head[1]),month};
    const needs={yearGan:'實際太歲年干',yearBranch:'實際太歲年支',month:monthPolicy==='jie'?'實際交節月建':'實際農曆月序'};
    const participants=(chart.participants||[]).flatMap((p,i)=>[['natal',p.natalBranch],['annual',p.branch]].filter(([,b])=>Z.includes(b)).map(([role,b])=>({person:i+1,role,earth:b,sky:chart.plate.find(q=>q.earth===b).sky})));
    const checks=rows.map(sourceRow=>{
      const r={...sourceRow,table:sourceRow.table.map(x=>Array.isArray(x)?x.slice():x)};
      const index=indices[r.basis],known=Number.isInteger(index)&&index>=0,indexLabel=r.basis==='month'?known?index+1:null:r.basis.includes('Gan')?G[index]||null:Z[index]||null;
      if(!known)return {...r,index:indexLabel,status:'insufficient-data',missing:[needs[r.basis]||r.basis],location:null,occurrences:[],hits:[]};
      let value=r.table[index];if(r.name==='瓦煞'&&!chart.day.yang)value=Z[mod(Z.indexOf(value)+6,12)];
      const location=target(value),occurrences=chart.plate.filter(p=>location.branches.includes(p.sky)).map(p=>({earth:p.earth,sky:p.sky,general:p.general,empty:p.empty,hiddenStem:p.hiddenStem})),hits=[];
      chart.courses.forEach((p,i)=>{if(location.branches.includes(p.upper))hits.push({scope:'course',role:i+1,branch:p.upper,general:p.general,empty:p.empty});});
      chart.transmissions.forEach(p=>{if(location.branches.includes(p.branch))hits.push({scope:'transmission',role:p.role,branch:p.branch,general:p.general,empty:p.empty});});
      participants.forEach(p=>{if(location.branches.includes(p.sky))hits.push({scope:'participant-upper',person:p.person,role:p.role,earth:p.earth,branch:p.sky});});
      return {...r,index:indexLabel,status:location.status,location,dayEstablished:location.type==='ganzhi'?chart.day.ganzhi===location.original:null,occurrences,hits};
    });
    const calculated=checks.filter(r=>r.status==='calculated'),missing=[...new Set(checks.flatMap(r=>r.missing||[]))];
    return {schema:'jy.liuren-shensha/1',version:VERSION,profile:'GUIDE_ZHUANG_EXPLICIT_WITH_NAMED_DAQUAN_FIELDS',complete:missing.length===0,counts:{rules:checks.length,calculated:calculated.length,insufficientData:checks.filter(r=>r.status==='insufficient-data').length,notApplicable:checks.filter(r=>r.status==='not-applicable').length,withActualHits:calculated.filter(r=>r.hits.length).length},checks,active:calculated.filter(r=>r.hits.length),missing,sourceAudit:audits,unresolvedSourceEntries:[],resolvedSourceEntries:[{name:'罪至',raw:'午子未丑申寅酉卯戌胡亥巳',selected:'午子未丑申寅酉卯戌辰亥巳',source:SOURCES.daquan5,reason:'另採具名完整原典月表；原闕誤仍保留'}],policy:{month:monthPolicy,monthMeaning:monthPolicy==='jie'?'正月寅，以實際節氣月建取月序；月將依中氣分開':'正月序1，閏月沿本月序，與中氣月將分開',year:'年干支採課盤已有的立春歲界，沒有資料不借現在年份',stemProjection:'原干保留，按甲寅乙辰丙戊巳丁己未庚申辛戌壬亥癸丑投影；不是虛構天盤干',activation:'全盤循環必有各支；只以實際四課、三傳、年命上神列hits，不把全盤有支當有效發用',classFamilies:'64課族維持已具名《大全》課經；本神煞資料的《指南》異表不反向改動課族',scope:'本模組明列的來源定位已逐項運算；不是百家神煞合并。源文本有闕誤者另列，不當輸入缺項'},sources:SOURCES};
  }
  root.JYLiurenShensha=Object.freeze({version:VERSION,compute,registry:()=>JSON.parse(JSON.stringify(rows)),sources:SOURCES});
})(typeof window==='undefined'?globalThis:window);
