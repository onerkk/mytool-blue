'use strict';
// Keep reading style, native methods and selection copies identical across all entry points.
// Run after editing JS/reading-quality.js. --check verifies without writing files.
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const q=require(path.join(root,'JS/reading-quality.js'));
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
  ['functions/api/ai.js','SYSTEM_READING_STYLE',q.plainText()],
  ['functions/api/ai.js','SYSTEM_METHODS',q.methodKinds().map(k=>q.methodLines(k).join('\n')).join('\n\n')]
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
  // A loaded v4.0/v4.1 guide has the same methods but older selection rules.
  // Use it only when its version matches this file's generated snapshot.
  const sharedGuard=/((?:window|root)\.JY_READING_QUALITY)(?:&&\1\.version===["'][^"']+["'])?&&\1\.recommendationEnding\?/g;
  next=next.replace(sharedGuard,(_,ref)=>ref+'&&'+ref+'.version==='+JSON.stringify(q.version)+'&&'+ref+'.recommendationEnding?');
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
for(const file of new Set(readingTargets.map(t=>t[0]).concat('JS/ai-analysis.js'))){
  const old=fs.readFileSync(path.join(root,file),'utf8');
  const readingGuard=/((?:window|root)\.JY_READING_QUALITY)(?:&&\1\.readingVersion===["'][^"']+["'])?\?(?=\1\.(?:lines|methodLines|plainText))/g;
  let next=old.replace(readingGuard,(_,ref)=>ref+'&&'+ref+'.readingVersion==='+JSON.stringify(q.readingVersion)+'?');
  const payloadGuard=/((?:window|root)\.JY_READING_QUALITY)(?:&&\1\.readingVersion===["'][^"']+["'])?&&\1\.payloadGuide/g;
  next=next.replace(payloadGuard,(_,ref)=>ref+'&&'+ref+'.readingVersion==='+JSON.stringify(q.readingVersion)+'&&'+ref+'.payloadGuide');
  persist(file,next);
}
for(const file of mirrors)persist(file,fs.readFileSync(path.join(root,'JS',file),'utf8'));
// The front end calls a separately deployed Worker. Ship the same handler and
// prompt contract as a self-contained module; generating it does not deploy it.
persist('workers/ai-proxy.js',
  '// GENERATED by scripts/sync-recommendation-guides.cjs; edit functions/api/ai.js instead.\n'+
  fs.readFileSync(path.join(root,'functions/api/ai.js'),'utf8')+
  '\nexport default { fetch(request, env) { return onRequest({ request, env }); } };\n');
if(failed)process.exitCode=1;
else console.log('Reading v'+q.readingVersion+' / recommendation v'+q.version+': '+(process.argv.includes('--check')?'all generated copies match':updated+' files synchronized'));
