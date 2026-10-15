'use strict';
// Keep reading style, native methods and selection copies identical across all entry points.
// Run after editing JS/reading-quality.js. --check verifies without writing files.
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const q=require(path.join(root,'JS/reading-quality.js'));
const workflowTargets=['JS/gua-prompt.js','JS/bazi-suite-core.js','JS/ziwei-standalone.js','JS/meihua-standalone.js','JS/lenormand.js','JS/oracle.js','JS/prompt-export.js','JS/vedic-prompt.js','JS/western-prompt.js','JS/relationship-core.js','JS/ai-analysis.js','JS/name-prompt.js','JS/liuren-prompt.js'];
const textMap=keys=>Object.fromEntries(keys.map(k=>[k,q.recommendationText(k)]));
const endingMap=keys=>Object.fromEntries(keys.map(k=>[k,q.recommendationEnding(k)]));
const targets=[
  ['JS/liuren-prompt.js','JY_REC_LIUREN',q.recommendationEnding('liuren')],
  ['JS/prompt-packet.js','JY_REC_PACKET',endingMap(q.methodKinds())],
  ['JS/prompt-brief.js','JY_REC_BRIEF',endingMap(q.methodKinds())],
  ['JS/name-prompt.js','JY_REC_NAME',q.recommendationEnding('name')],
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
  ['JS/liuren-prompt.js','JY_READING_LIUREN',q.lines('liuren')],
  ['JS/name-prompt.js','JY_READING_NAME',q.lines('name')],
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
  ['functions/api/ai.js','SYSTEM_READING_STYLE',q.plainText()+'\n'+q.narrativePolicy()+'\n'+q.truthPolicy()]
];
const mirrors=['native-rule-sources.js','native-chart-analysis.js','ui.js','tarot-foundation.js','tarot_upgrade.js','spread-picker.js','bazi-prompt-root.js','ziwei-prompt-root.js','ziwei-standalone.js','relationship-core.js','meihua-standalone.js','lenormand.js','oracle.js','prompt-export.js','ai-analysis.js','bazi-suite-core.js'];
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
  next=next.replace(/String\(((?:window|root)\.JY_READING_QUALITY)\.readingVersion\|\|'0'\)\.localeCompare\('[^']+',undefined,\{numeric:true\}\)>=0/g,
    (_,ref)=>'String('+ref+'.readingVersion||"0").localeCompare('+JSON.stringify(q.readingVersion)+',undefined,{numeric:true})>=0');
  next=next.replace(/String\(((?:window|root)\.JY_READING_QUALITY)\.version\|\|"0"\)\.localeCompare\("[^"]+",undefined,\{numeric:true\}\)>=0/g,
    (_,ref)=>'String('+ref+'.version||"0").localeCompare('+JSON.stringify(q.version)+',undefined,{numeric:true})>=0');
  persist(file,next);
}
// Keep the pure local planner available in standalone and mixed-cache entries.
// Embed the exact same factory, with CommonJS export removed in these hosts.
const workflowFile='JS/reading-workflow.js',workflowOld=fs.readFileSync(path.join(root,workflowFile),'utf8');
const methodGuides='  // BEGIN GENERATED WORKFLOW METHOD GUIDES\n  var METHOD_GUIDES = '+JSON.stringify(Object.fromEntries(q.methodKinds().map(k=>[k,q.methodLines(k)])),null,2)+';\n  // END GENERATED WORKFLOW METHOD GUIDES\n';
persist(workflowFile,workflowOld.replace(/  \/\/ BEGIN GENERATED WORKFLOW METHOD GUIDES\n[\s\S]*?  \/\/ END GENERATED WORKFLOW METHOD GUIDES\n/,()=>methodGuides).replace(/String\(quality\.readingVersion\|\|'0'\)\.localeCompare\('[^']+',undefined,\{numeric:true\}\)>=0/g,()=>"String(quality.readingVersion||'0').localeCompare('"+q.readingVersion+"',undefined,{numeric:true})>=0"));
const voiceOld=fs.readFileSync(path.join(root,workflowFile),'utf8');
const voiceBlock='  // BEGIN GENERATED WORKFLOW VOICE GUIDE\n  var AUTHOR_VOICE = '+JSON.stringify(q.plainText()+'\n'+q.narrativePolicy()+'\n'+q.truthPolicy())+';\n  // END GENERATED WORKFLOW VOICE GUIDE\n';
persist(workflowFile,voiceOld.replace(/  \/\/ BEGIN GENERATED WORKFLOW VOICE GUIDE\n[\s\S]*?  \/\/ END GENERATED WORKFLOW VOICE GUIDE\n/,()=>voiceBlock));
const workflowSource=fs.readFileSync(path.join(root,'JS/reading-workflow.js'),'utf8').replace(/^  if\(typeof module[^\n]+\n/m,'');
for(const file of workflowTargets){
  const old=fs.readFileSync(path.join(root,file),'utf8');
  const block='// BEGIN GENERATED WORKFLOW\n'+workflowSource.trimEnd()+'\n// END GENERATED WORKFLOW\n';
  const re=/\/\/ BEGIN GENERATED WORKFLOW\n[\s\S]*?\/\/ END GENERATED WORKFLOW\n/;
  persist(file,re.test(old)?old.replace(re,()=>block):block+old);
}
// Retain the same requested time scope when the shared guide is unavailable.
const scopeFile='JS/bazi-suite-core.js',scopeOld=fs.readFileSync(path.join(root,scopeFile),'utf8');
const scopeBlock='// BEGIN GENERATED TIME SCOPE\nvar JY_SCOPE_BAZI = (function(){\n'+
  'function numeral(value){var s=String(value||" ").trim().replace(/兩/g,"二");if(/^\\d+$/.test(s))return Number(s);var digits={零:0,一:1,二:2,三:3,四:4,五:5,六:6,七:7,八:8,九:9};if(s==="十")return 10;if(s.indexOf("十")>=0){var a=s.split("十");return (a[0]?digits[a[0]]:1)*10+(a[1]?digits[a[1]]:0);}return digits[s];}\n'+
  'var reportScope='+q.reportScope.toString()+';\nreturn '+q.timeScope.toString()+';\n})();\n// END GENERATED TIME SCOPE\n';
const scopeRe=/\/\/ BEGIN GENERATED TIME SCOPE\n[\s\S]*?\/\/ END GENERATED TIME SCOPE\n/;
persist(scopeFile,scopeRe.test(scopeOld)?scopeOld.replace(scopeRe,()=>scopeBlock):scopeBlock+scopeOld);
// Standalone exports use the same OOTK reader and depth contract even when
// their host does not load the normal analysis bundle. Never hand-maintain a
// second OOTK prompt or let a cached older reader replace this release.
const exportRuntime='// BEGIN GENERATED OOTK EXPORT RUNTIME\n(function(root){\n'+[
  ['native-card-analysis','!root.JYNativeCards?.ootkReadingVersion || String(root.JYNativeCards.ootkReadingVersion).localeCompare("20261005ootk16",undefined,{numeric:true})<0'],
  ['native-depth-contract','!root.JYNativeDepthContract?.version || String(root.JYNativeDepthContract.version).localeCompare('+JSON.stringify(fs.readFileSync(path.join(root,'JS/native-depth-contract.js'),'utf8').match(/const VERSION='([^']+)'/)[1])+',undefined,{numeric:true})<0']
].map(([name,guard])=>'if('+guard+'){\n'+fs.readFileSync(path.join(root,'JS',name+'.js'),'utf8').replace(/^  if\(typeof module[^\n]+\n/m,'')+'\n}').join('\n')+'\n})(typeof window!=="undefined"?window:globalThis);\n// END GENERATED OOTK EXPORT RUNTIME\n';
const exportPath='JS/prompt-export.js',exportOld=fs.readFileSync(path.join(root,exportPath),'utf8'),exportRe=/\/\/ BEGIN GENERATED OOTK EXPORT RUNTIME\n[\s\S]*?\/\/ END GENERATED OOTK EXPORT RUNTIME\n/;
persist(exportPath,exportRe.test(exportOld)?exportOld.replace(exportRe,()=>exportRuntime):exportRuntime+exportOld);
// The standalone Bazi prompt must carry the same children rule pack as the
// normal page. A missing central packet cannot remove topic-level evidence.
const childHost='JS/bazi-prompt-root.js',childOld=fs.readFileSync(path.join(root,childHost),'utf8');
const childRuntime='// BEGIN GENERATED BAZI CHILDREN RUNTIME\n'+fs.readFileSync(path.join(root,'JS/bazi-child-analysis.js'),'utf8').replace(/^  if\(typeof module[^\n]+\n/m,'').trimEnd()+'\n// END GENERATED BAZI CHILDREN RUNTIME\n';
const childRe=/\/\/ BEGIN GENERATED BAZI CHILDREN RUNTIME\n[\s\S]*?\/\/ END GENERATED BAZI CHILDREN RUNTIME\n/;
persist(childHost,childRe.test(childOld)?childOld.replace(childRe,()=>childRuntime):childRuntime+childOld);
persist('bazi-child-analysis.js',fs.readFileSync(path.join(root,'JS/bazi-child-analysis.js'),'utf8'));
for(const file of new Set(mirrors.concat(['native-depth-contract.js','prompt-brief.js','prompt-packet.js','engine-computation-audit.js','reading-workflow.js','tarot-semantic-engine.js','astro-bridge.js','western-standalone.js','vedic-standalone.js','name-standalone.js'].filter(f=>fs.existsSync(path.join(root,f))))))persist(file,fs.readFileSync(path.join(root,'JS',file),'utf8'));
// Keep the retained API's OOTK adapter on the same data/read/review code. A
// scoped runtime works both in Pages and in data-URL test module loaders.
const ootkRuntimeFiles=['native-card-analysis','native-depth-contract','reading-workflow'];
const ootkRuntime='// BEGIN GENERATED OOTK RUNTIME\nconst OOTK_RUNTIME = {};\n'+ootkRuntimeFiles.map(name=>
  fs.readFileSync(path.join(root,'JS',name+'.js'),'utf8')
    .replace(/^  if\(typeof module[^\n]+\n/m,'')
    .replace(/\}\)\(typeof window[^\n]+\);\s*$/, '})(OOTK_RUNTIME);')
).join('\n')+'\n// END GENERATED OOTK RUNTIME\n';
const apiPath='functions/api/ai.js',apiOld=fs.readFileSync(path.join(root,apiPath),'utf8');
const runtimeRe=/\/\/ BEGIN GENERATED OOTK RUNTIME\n[\s\S]*?\/\/ END GENERATED OOTK RUNTIME\n/;
persist(apiPath,runtimeRe.test(apiOld)?apiOld.replace(runtimeRe,()=>ootkRuntime):ootkRuntime+apiOld);
// The independently deployed Worker must send the exact same server prompt.
const workerSource='// GENERATED by scripts/sync-recommendation-guides.cjs; edit functions/api/ai.js instead.\n'+fs.readFileSync(path.join(root,apiPath),'utf8').trimEnd()+'\n\nexport default { fetch(request, env) { return onRequest({ request, env }); } };\n';
persist('workers/ai-proxy.js',workerSource);
if(failed)process.exitCode=1;
else console.log('Reading v'+q.readingVersion+' / recommendation v'+q.version+': '+(process.argv.includes('--check')?'all generated copies match':updated+' files synchronized'));
