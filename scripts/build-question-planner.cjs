'use strict';
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),source=fs.readFileSync(path.join(root,'JS/shared/question-planner.js'),'utf8').trim();
const start='// BEGIN SHARED QUESTION PLANNER',end='// END SHARED QUESTION PLANNER',block=start+'\n'+source+'\n'+end;
for(const file of ['JS/tarot-foundation.js','JS/lenormand.js']){
 const p=path.join(root,file),old=fs.readFileSync(p,'utf8');
 const next=old.includes(start)?old.replace(new RegExp(start+'[\\s\\S]*?'+end),()=>block):old.replace('// END SHARED DECISION PARSER','// END SHARED DECISION PARSER\n\n'+block);
 if(process.argv.includes('--check')){if(old!==next)throw Error('Stale question planner: '+file);}else fs.writeFileSync(p,next);
}
