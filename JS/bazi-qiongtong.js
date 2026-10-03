/* 原文条文的可觀察條件：透、藏、缺、支見、支局骨架、指定日／時。
 * 每一條保留上下文、否定／替代分支和未量化的質性條件，不由關鍵字宣布富貴。 */
(function(root){'use strict';
 const G='甲乙丙丁戊己庚辛壬癸',B='子丑寅卯辰巳午未申酉戌亥',E={甲:'木',乙:'木',丙:'火',丁:'火',戊:'土',己:'土',庚:'金',辛:'金',壬:'水',癸:'水'},MONTH='寅卯辰巳午未申酉戌亥子丑',bureau={木:['亥','卯','未'],火:['寅','午','戌'],金:['巳','酉','丑'],水:['申','子','辰']};
 function evaluate(facts){
  const data=root.JYQiongtongData;if(!data)throw Error('窮通條文資料未載入');const month=facts.hidden.find(x=>x.pillar==='month')?.branch,key=facts.dm+(MONTH.indexOf(month)+1),entry=data.entries[key];if(!entry)throw Error('缺少日干／月支對應原文');
  const ex=facts.stems.filter(x=>x.pillar!=='day'),hidden=facts.hidden,branches=Array.from(new Set(hidden.map(x=>x.branch))),stem=g=>({stem:g,exposed:ex.filter(x=>x.stem===g).map(x=>({pillar:x.pillar,label:x.label,constraints:x.constraints})),hidden:hidden.filter(x=>x.stem===g).map(x=>({pillar:x.pillar,branch:x.branch,label:x.label})),dayMaster:facts.dm===g}),all=Array.from(G).map(stem),seen=(g,mode)=>{const x=all[G.indexOf(g)];return mode==='exposed'?!!x.exposed.length:mode==='hidden'?!!x.hidden.length:!!(x.exposed.length||x.hidden.length);};
  const checks=[];
  for(const paragraph of entry.paragraphs){
   const sentences=paragraph.text.split(/[。；]/).filter(Boolean);
   sentences.forEach((text,i)=>{
    // Distinct 或 / 若 clauses are alternatives, never conjoined across sentences.
    const alternatives=text.split(/(?=或|若|如無|倘)/).filter(Boolean);
    alternatives.forEach((raw,j)=>{
     const conditions=[],spans=[],add=(id,satisfied,evidence,at,len)=>{conditions.push({id,satisfied,evidence});if(at!=null)spans.push([at,at+len]);};
     function scan(re,fn){let m;while((m=re.exec(raw)))fn(m);}
     scan(/(?:不透|無|全無|不見|乏)([甲乙丙丁戊己庚辛壬癸]{1,4})(?:[木火土金水])?(?:出干|出|透干|透)?/g,m=>{const exposed=/不透|出干|透|出$/.test(m[0]);add('absent-'+m[1],Array.from(m[1]).every(g=>!seen(g,exposed?'exposed':'any')),{phrase:m[0],scope:exposed?'visible-stems':'visible-and-hidden-stems'},m.index,m[0].length);});
     scan(/([甲乙丙丁戊己庚辛壬癸]{1,4})(?:[木火土金水])?(?:齊透天干|齊透|兩透|俱透|並透|同透|皆透|透出|透天干|透干|高透|出干|透|出)/g,m=>{if(spans.some(([a,b])=>m.index>=a&&m.index<b))return;add('exposed-'+m[1],Array.from(m[1]).every(g=>seen(g,'exposed')),{phrase:m[0],stems:Array.from(m[1]).map(stem)},m.index,m[0].length);});
     scan(/([甲乙丙丁戊己庚辛壬癸]{1,4})(?:[木火土金水])?(?:藏支下|藏支中|藏支|在支內|藏)/g,m=>{if(spans.some(([a,b])=>m.index>=a&&m.index<b))return;add('hidden-'+m[1],Array.from(m[1]).every(g=>seen(g,'hidden')),{phrase:m[0],stems:Array.from(m[1]).map(stem)},m.index,m[0].length);});
     scan(/(?:有|得|見)([甲乙丙丁戊己庚辛壬癸]{1,4})(?:[木火土金水])?/g,m=>{if(spans.some(([a,b])=>m.index>=a&&m.index<b))return;add('present-'+m[1],Array.from(m[1]).every(g=>seen(g,'any')),{phrase:m[0],stems:Array.from(m[1]).map(stem)},m.index,m[0].length);});
     scan(/([甲乙丙丁戊己庚辛壬癸])(?:[木火土金水])?(有根|無根|通根)/g,m=>{if(root.JYBaziFunctional){const pillars=Object.fromEntries(['year','month','day','hour'].map(k=>[k,{zhi:hidden.find(x=>x.pillar===k)?.branch}])),premise=root.JYBaziFunctional.rootPremise(m[1],pillars);add('root-'+m[1]+'-'+m[2],m[2]==='無根'?!premise.hasRoot:premise.hasRoot,{phrase:m[0],rootPremise:premise},m.index,m[0].length);}});
     scan(/支(?:見|有)([子丑寅卯辰巳午未申酉戌亥]{1,4})/g,m=>add('branches-'+m[1],Array.from(m[1]).every(b=>branches.includes(b)),{phrase:m[0],actual:branches},m.index,m[0].length));
     scan(/支(?:成|會)([木火金水])局/g,m=>{const needed=bureau[m[1]],members=needed.filter(b=>branches.includes(b));add('bureau-structure-'+m[1],members.length===3,{phrase:m[0],needed,present:members,policy:'只判三支骨架，不把成局成化有效性當作已確定'},m.index,m[0].length);});
     scan(/([甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥])日/g,m=>add('exact-day-'+m[1],facts.stems.some(x=>x.pillar==='day'&&x.stem===m[1][0])&&hidden.some(x=>x.pillar==='day'&&x.branch===m[1][1]),{phrase:m[0]},m.index,m[0].length));
     scan(/([甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥])時/g,m=>add('exact-hour-'+m[1],facts.stems.some(x=>x.pillar==='hour'&&x.stem===m[1][0])&&hidden.some(x=>x.pillar==='hour'&&x.branch===m[1][1]),{phrase:m[0]},m.index,m[0].length));
     const qualitative=Array.from(new Set(raw.match(/多|少|旺|弱|清|濁|純|得所|得地|有根|無根|制|化|合|隔位|相扶|運|陰德|風水|上半月|下半月|冬至|夏至|秋分|太過|過量|一派|一片|重重|不剋|無傷|不受|破格/g)||[]));
     checks.push({id:'QT-'+key+'-P'+paragraph.paragraph+'-'+i+'-'+j,sourceParagraph:paragraph.paragraph,sentence:i,alternative:j,clause:raw,conditions,machineTestable:conditions.length>0,observablePremises:conditions.length?conditions.every(c=>c.satisfied)?'present':'not-all-present':'no-literal-predicate',fullRuleStatus:qualitative.length?'requires-contextual-judgment':!conditions.length?'source-context-only':conditions.some(c=>!c.satisfied)?'observable-premises-absent':'observable-premises-present',qualitativeRequirements:qualitative,sourceOutcomeNotGuaranteed:true});
    });
   });
  }
  return {version:'20261004qiongtong3',profile:'WIKISOURCE_LITERAL_PREMISES_WITH_FULL_CONTEXT',dayStem:facts.dm,monthBranch:month,monthNumber:entry.monthNumber,sourceScope:entry.sourceScope,source:data.source,sourceParagraphs:entry.paragraphs,clauseCoverage:{paragraphs:entry.paragraphs.length,representedParagraphs:new Set(checks.map(p=>p.sourceParagraph)).size,totalClauses:checks.length,literalClauses:checks.filter(p=>p.machineTestable).length,contextOnlyClauses:checks.filter(p=>!p.machineTestable).length,qualitativeClauses:checks.filter(p=>p.qualitativeRequirements.length).length},contextEvidence:{elements:facts.elements||null,dayMasterRoots:facts.dayMasterRoots||null,branchLinks:facts.links||null,combinations:facts.combinations||null,adjacentGenerationPaths:facts.adjacentGenerationPaths||null,policy:'全部原句進入同一條文帳；没有字面謂詞的說明與未量化的質性仍參照原局，不以空條件視為成立。'},rootContext:root.JYBaziFunctional?Array.from(G).map(g=>{const p=root.JYBaziFunctional.rootPremise(g,Object.fromEntries(['year','month','day','hour'].map(k=>[k,{zhi:hidden.find(x=>x.pillar===k)?.branch}])));delete p.scope;return p;}):[],stems:all,branches,checks,stemEdges:facts.stemEdges||facts.stemRelations||[],policy:{roots:'四支實際藏干同五行根；字面有根無根可算，全句強弱制化仍需審核。',visible:'透／無另干不把日干本身當成額外一個透干；藏用既有四支全部藏干。四柱全局仍在原排盤列出。',conditions:'每段每句與或若分支均保留；可觀察條件分別實算，無字面謂詞列為原文背景，不以空陣列或命中數宣布條文成立。出現任一未量化的強弱清濁制化、歲運、時間段或風水前提，不能宣告完整原條文已成立。',sourceAudit:key==='乙12'?'所校數位本重複十一月標題，十二月入口只採明言冬月的段落；重複段未擅自改字冒稱原本十二月。其餘校本應另具版本。':null,interpretation:'原文功名、貧夭、性別倫理語句只屬古代作者斷語，禁止轉成現實必然或人物污名。'}};
 }
 root.JYBaziQiongtong=Object.freeze({version:'20261004qiongtong3',evaluate});
})(typeof window==='undefined'?globalThis:window);
