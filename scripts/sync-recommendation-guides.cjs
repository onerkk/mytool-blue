'use strict';
// Keep reading style, native methods and selection copies identical across all entry points.
// Run after editing JS/reading-quality.js. --check verifies without writing files.
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const q=require(path.join(root,'JS/reading-quality.js'));
const workflowTargets=['JS/gua-prompt.js','JS/bazi-suite-core.js','JS/ziwei-standalone.js','JS/meihua-standalone.js','JS/lenormand.js','JS/oracle.js','JS/prompt-export.js','JS/vedic-prompt.js','JS/western-prompt.js','JS/relationship-core.js','JS/ai-analysis.js'];
const textMap=keys=>Object.fromEntries(keys.map(k=>[k,q.recommendationText(k)]));
const endingMap=keys=>Object.fromEntries(keys.map(k=>[k,q.recommendationEnding(k)]));
const targets=[
  ['JS/gua-prompt.js','JY_REC_GUA',{liuyao:q.recommendationEnding('liuyao'),yijing:q.recommendationEnding('yijing')}],
  ['JS/bazi-prompt-root.js','JY_REC_BAZI',textMap(['bazi','compat','personality','chart'])],
  ['JS/ziwei-prompt-root.js','JY_REC_ZIWEI',q.recommendationText('ziwei')],
  ['JS/meihua-standalone.js','JY_REC_MEIHUA',q.recommendationText('meihua')],
  ['JS/lenormand.js','JY_REC_LENORMAND',q.recommendationText('lenormand')],
  ['JS/oracle.js','JY_REC_ORACLE',q.recommendationText('oracle')],
  ['JS/prompt-export.js','JY_REC_EXPORT',endingMap(['tarot','ootk','meihua'])],
  ['JS/vedic-prompt.js','JY_REC_VEDIC',q.recommendationEnding('vedic')],
  ['JS/western-prompt.js','JY_REC_WESTERN',q.recommendationEnding('astro')],
  ['JS/ai-analysis.js','JY_REC_API',{composite:q.recommendationPolicy(),tarot:q.recommendationPolicy('tarot'),ootk:q.recommendationPolicy('ootk')}],
  ['functions/api/ai.js','SYSTEM_RECOMMENDATION',q.recommendationText()]
];
const readingTargets=[
  ['JS/gua-prompt.js','JY_READING_GUA',{liuyao:q.lines('liuyao'),yijing:q.lines('yijing')}],
  ['JS/bazi-prompt-root.js','JY_READING_BAZI',{bazi:q.lines('bazi'),compat:q.lines('compat'),personality:q.methodLines('personality')}],
  ['JS/ziwei-prompt-root.js','JY_READING_ZIWEI',q.lines('ziwei')],
  ['JS/ziwei-standalone.js','JY_READING_ZIWEI_FALLBACK',q.lines('ziwei').join('\n')],
  ['JS/meihua-standalone.js','JY_READING_MEIHUA',q.lines('meihua')],
  ['JS/lenormand.js','JY_READING_LENORMAND',q.lines('lenormand')],
  ['JS/oracle.js','JY_READING_ORACLE',q.lines('oracle')],
  ['JS/prompt-export.js','JY_READING_EXPORT',Object.fromEntries(['tarot','ootk','meihua'].map(k=>[k,q.lines(k)]))],
  ['JS/vedic-prompt.js','JY_READING_VEDIC',q.lines('vedic').join('\n')],
  ['JS/western-prompt.js','JY_READING_WESTERN',q.lines('astro').join('\n')],
  ['JS/relationship-core.js','JY_READING_RELATIONSHIP',q.lines('compat').concat(q.methodLines('bazi'),q.methodLines('ziwei')).join('\n')],
  ['functions/api/ai.js','SYSTEM_METHODS',q.methodKinds().flatMap(k=>q.methodLines(k)).join('\n')],
  ['functions/api/ai.js','SYSTEM_READING_STYLE',q.plainText()]
];
const mirrors=['ui.js','tarot-foundation.js','tarot_upgrade.js','spread-picker.js','bazi-prompt-root.js','ziwei-prompt-root.js','meihua-standalone.js','lenormand.js','oracle.js','prompt-export.js','ai-analysis.js','bazi-suite-core.js'];
let failed=false,updated=0;
function persist(file,next){
  const full=path.join(root,file),old=fs.existsSync(full)?fs.readFileSync(full,'utf8'):null;
  if(old===next)return;
  if(process.argv.includes('--check')){console.error('Stale generated prompt copy: '+file);failed=true;return;}
  fs.mkdirSync(path.dirname(full),{recursive:true});fs.writeFileSync(full,next);updated++;
}
for(const [file,key,value] of targets){
  const old=fs.readFileSync(path.join(root,file),'utf8');
  const block='// BEGIN GENERATED RECOMMENDATION '+key+'\n'+
    'var '+key+' = '+JSON.stringify(value,null,2)+';\n'+
    '// END GENERATED RECOMMENDATION '+key+'\n';
  const regex=new RegExp('// BEGIN GENERATED RECOMMENDATION '+key+'\\n[\\s\\S]*?// END GENERATED RECOMMENDATION '+key+'\\n');
  // Function replacement is essential: prompt content can contain literal $ characters.
  let next=regex.test(old)?old.replace(regex,()=>block):block+old;
  // Use the loaded guide by capability. A future reading version must not
  // silently fall back to the stale generated copy solely because its number changed.
  const sharedGuard=/((?:window|root)\.JY_READING_QUALITY)(?:&&\1\.version===["'][^"']+["'])?&&\1\.recommendationEnding\?/g;
  next=next.replace(sharedGuard,(_,ref)=>ref+'&&typeof '+ref+'.recommendationEnding==="function"&&String('+ref+'.version||"0").localeCompare('+JSON.stringify(q.version)+',undefined,{numeric:true})>=0?');
  persist(file,next);
}
for(const [file,key,value] of readingTargets){
  const old=fs.readFileSync(path.join(root,file),'utf8');
  const block='// BEGIN GENERATED READING '+key+'\n'+
    'var '+key+' = '+JSON.stringify(value,null,2)+';\n'+
    '// END GENERATED READING '+key+'\n';
  const regex=new RegExp('// BEGIN GENERATED READING '+key+'\\n[\\s\\S]*?// END GENERATED READING '+key+'\\n');
  persist(file,regex.test(old)?old.replace(regex,()=>block):block+old);
}
// A mixed cached release must not reintroduce the previous verbose reading style.
for(const file of new Set(readingTargets.map(t=>t[0]).concat(targets.map(t=>t[0]),'JS/ai-analysis.js'))){
  const old=fs.readFileSync(path.join(root,file),'utf8');
  const readingGuard=/((?:window|root)\.JY_READING_QUALITY)(?:&&\1\.readingVersion===["'][^"']+["'])?\?(?=\1\.(lines|methodLines|plainText))/g;
  let next=old.replace(readingGuard,(_,ref,method)=>ref+'&&typeof '+ref+'.'+method+'==="function"&&String('+ref+'.readingVersion||"0").localeCompare('+JSON.stringify(q.readingVersion)+',undefined,{numeric:true})>=0?');
  const payloadGuard=/((?:window|root)\.JY_READING_QUALITY)(?:&&\1\.readingVersion===["'][^"']+["'])?&&\1\.payloadGuide/g;
  next=next.replace(payloadGuard,(_,ref)=>ref+'&&typeof '+ref+'.payloadGuide==="function"&&String('+ref+'.readingVersion||"0").localeCompare('+JSON.stringify(q.readingVersion)+',undefined,{numeric:true})>=0');
  // Upgrade guards that already use capability checks (the old expression only
  // handled pre-v6 callers, so a cached v6 guide could override v7 fallbacks).
  next=next.replace(/String\(((?:window|root)\.JY_READING_QUALITY)\.readingVersion\|\|"0"\)\.localeCompare\("[^"]+",undefined,\{numeric:true\}\)>=0/g,
    (_,ref)=>'String('+ref+'.readingVersion||"0").localeCompare('+JSON.stringify(q.readingVersion)+',undefined,{numeric:true})>=0');
  next=next.replace(/String\(((?:window|root)\.JY_READING_QUALITY)\.version\|\|"0"\)\.localeCompare\("[^"]+",undefined,\{numeric:true\}\)>=0/g,
    (_,ref)=>'String('+ref+'.version||"0").localeCompare('+JSON.stringify(q.version)+',undefined,{numeric:true})>=0');
  persist(file,next);
}
// Keep the pure local planner available in standalone and mixed-cache entries.
// Embed the exact same factory, with CommonJS export removed in these hosts.
const workflowSource=fs.readFileSync(path.join(root,'JS/reading-workflow.js'),'utf8').replace(/^  if\(typeof module[^\n]+\n/m,'');
for(const file of workflowTargets){
  const old=fs.readFileSync(path.join(root,file),'utf8');
  const block='// BEGIN GENERATED WORKFLOW\n'+workflowSource.trimEnd()+'\n// END GENERATED WORKFLOW\n';
  const re=/\/\/ BEGIN GENERATED WORKFLOW\n[\s\S]*?\/\/ END GENERATED WORKFLOW\n/;
  persist(file,re.test(old)?old.replace(re,()=>block):block+old);
}
for(const file of mirrors)persist(file,fs.readFileSync(path.join(root,'JS',file),'utf8'));
// This release only synchronizes local prompt builders. The legacy Worker is
// intentionally outside the prompt-only build and is never called by the UI.
if(failed)process.exitCode=1;
else console.log('Reading v'+q.readingVersion+' / recommendation v'+q.version+': '+(process.argv.includes('--check')?'all generated copies match':updated+' files synchronized'));
