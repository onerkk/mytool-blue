'use strict';
// Keep standalone/offline and Pages Function copies identical to the shared guide.
// Run after editing JS/reading-quality.js. --check verifies without writing files.
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const q=require(path.join(root,'JS/reading-quality.js'));
const textMap=keys=>Object.fromEntries(keys.map(k=>[k,q.recommendationText(k)]));
const endingMap=keys=>Object.fromEntries(keys.map(k=>[k,q.recommendationEnding(k)]));
const targets=[
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
const mirrors=['bazi-prompt-root.js','ziwei-prompt-root.js','meihua-standalone.js','lenormand.js','oracle.js','prompt-export.js','ai-analysis.js','bazi-suite-core.js'];
let failed=false,updated=0;
function persist(file,next){
  const full=path.join(root,file),old=fs.readFileSync(full,'utf8');
  if(old===next)return;
  if(process.argv.includes('--check')){console.error('Stale recommendation copy: '+file);failed=true;return;}
  fs.writeFileSync(full,next);updated++;
}
for(const [file,key,value] of targets){
  const old=fs.readFileSync(path.join(root,file),'utf8');
  const block='// BEGIN GENERATED RECOMMENDATION '+key+'\n'+
    'var '+key+' = '+JSON.stringify(value,null,2)+';\n'+
    '// END GENERATED RECOMMENDATION '+key+'\n';
  const regex=new RegExp('// BEGIN GENERATED RECOMMENDATION '+key+'\\n[\\s\\S]*?// END GENERATED RECOMMENDATION '+key+'\\n');
  // Function replacement is essential: prompt content can contain literal $ characters.
  persist(file,regex.test(old)?old.replace(regex,()=>block):block+old);
}
for(const file of mirrors)persist(file,fs.readFileSync(path.join(root,'JS',file),'utf8'));
if(failed)process.exitCode=1;
else console.log('Recommendation v'+q.version+': '+(process.argv.includes('--check')?'all generated copies match':updated+' files synchronized'));
