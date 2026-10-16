/* 六壬大全卷三分類占。Consume liuren-core's actual annual() participant schema. */
(function(root){'use strict';
  const VERSION='20261016case28',SOURCE='https://zh.wikisource.org/zh-hant/六壬大全/3';
  const A=x=>Array.isArray(x)?x:[],clone=x=>x==null?null:JSON.parse(JSON.stringify(x));
  const B=Array.from('子丑寅卯辰巳午未申酉戌亥');
  function topic(q){
    const out=[];q=String(q||'');
    if(/財|錢|钱|收入|利潤|利润|買賣|买卖|交易|求財|求财/.test(q))out.push('wealth');
    if(/行人|回來|回来|歸來|归来|失聯|失联|人在何方|何時回|何时回/.test(q))out.push('traveler');
    if(/病|疾病|康復|康复|住院|症狀|症状/.test(q))out.push('illness');
    if(/空亡|虛假|虚假|落空|能不能成|是否成/.test(q))out.push('void-general');
    const work=root.JYReadingWorkflow?.situation?.(q)?.workDecision??/上班|值班|輪班|交接|代班|出勤|調班/.test(q);
    if(work)out.push('work-obligations');
    return [...new Set(out)];
  }
  function compute(r,question){
    if(!r||A(r.transmissions).length!==3)return {version:VERSION,status:'insufficient-data',missing:['完整三傳'],source:SOURCE};
    const ts=topic(question??r.question),first=r.transmissions[0],checks=[];
    if(first.empty)checks.push({id:'initial-void',topic:'void-general',status:'matched',evidence:clone(first),
      readingScope:'發用旬空是傳統條件；須合讀填實、出旬及原題喜憂，不能斷言現實結果已落空。'});
    if(ts.includes('work-obligations')){
      const ref='https://zh.wikisource.org/zh-hant/六壬大全/7',brief=p=>p?{branch:p.branch,earth:p.earth,kinship:p.kinship,general:p.general,empty:p.empty}:null;
      const constraint=r.transmissions.every(p=>p.kinship==='官鬼'),relations={子:'卯',丑:'戌',寅:'巳',卯:'子',辰:'辰',巳:'申',午:'午',未:'丑',申:'寅',酉:'酉',戌:'未',亥:'亥'};
      const edges=[[0,1],[1,2],[2,0]].map(([a,b])=>({from:r.transmissions[a].branch,to:r.transmissions[b].branch,punishes:relations[r.transmissions[a].branch]===r.transmissions[b].branch}));
      checks.push({id:'work-self-environment',topic:'work-obligations',status:'calculated',source:ref,
        evidence:{self:brief(r.courses[0]),environment:brief(r.courses[2]),transmissions:r.transmissions.map(brief),edges},
        readingScope:'干與支兩端先分讀；工作情境是現代問事應用，不宣稱古籍有排班公式。支不固定等於同事，天空天將也不等於旬空或現實無人。'});
      checks.push({id:'work-constraint-chain',topic:'work-obligations',status:constraint?'matched':'not-matched',source:ref,
        evidence:{allTransmissionsConstrainDay:constraint,branches:r.transmissions.map(p=>p.branch),initialVoid:!!first.empty,season:r.seasonal?.states||null},
        readingScope:constraint?'可合讀為職責／約束反覆牽動的象徵線索，須比較本人低落與外在任務兩種解釋；初空、旺衰及救應都保留。可核問是否替補或交接未到位，不能推出有人請假、人數或一定停工。':'未成立三傳皆官鬼；不得為配合工作題硬寫壓力鏈或人力不足。'});
    }
    if(ts.includes('wealth')){
      const places=A(r.plate).filter(x=>x.kinship==='妻財');
      checks.push({id:'wealth-placements',topic:'wealth',status:places.length?'calculated':'not-found',evidence:clone(places),
        readingScope:'妻財實際落點、旬空與生克條件；見財不保證得財。'});
      // The cited rule concerns BOTH heaven and earth being void, not merely first.empty.
      const empty=A(r.xun?.empty),both=places.filter(x=>empty.includes(x.earth)&&empty.includes(x.sky||x.branch));
      checks.push({id:'wealth-void',topic:'wealth',status:both.length?'matched':'not-matched',evidence:clone(both),
        conditions:{heavenAndEarthBothVoid:true,emptyBranches:clone(empty)},
        readingScope:'卷三財物占天地上下俱空條件；與一般發用旬空分列，不把單邊空亡冒充雙空。'});
    }
    if(ts.includes('illness'))checks.push({id:'illness-void-age',topic:'illness',status:'missing-required-input',
      requires:['新病／久病的實際病程'],missing:['本引擎未收病程長短，不能自行套新病／久病分支'],
      evidence:{initialVoid:!!first.empty},readingScope:'病占傳統條件不作醫療診斷或預測死亡。'});
    if(ts.includes('traveler')){
      const participants=A(r.participants),known=participants.filter(p=>B.includes(p.annualBranch));
      const locations=known.map(p=>({label:p.label,annualBranch:p.annualBranch,natalBranch:p.natalBranch,
        upper:clone(A(r.plate).find(x=>x.earth===p.annualBranch)),
        annualLocatedOn:clone(A(r.plate).find(x=>(x.sky||x.branch)===p.annualBranch)),source:p.source}));
      checks.push({id:'traveler-year-location',topic:'traveler',status:locations.length?'calculated':'missing-required-input',
        requires:['所問行人的行年及人物歸屬'],missing:locations.length>1?['多位行年不得擅自選成行人；須按原題人物核對']:
          locations.length?[]:['行人行年；僅有本命地支不能代替行年'],evidence:locations,
        readingScope:'行年地盤上的上神與行年天盤所臨地盤分列；不把年命或三傳替代原文行年。'});
    }
    return {version:VERSION,status:'calculated',topics:ts,checks:checks.filter(x=>ts.includes(x.topic)||x.topic==='void-general'),source:SOURCE,
      policy:'先讀四課三傳九宗門，分類條件後置；未知病程、人物與行年不由AI猜。'};
  }
  root.JYLiurenTopicRules=Object.freeze({version:VERSION,compute,source:SOURCE});
})(typeof window==='undefined'?globalThis:window);
