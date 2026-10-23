'use strict';
/* 把 JS/shared/question-profile.js 的共用區塊原樣嵌入所有使用檔（標記之間整段替換）。 */
const fs=require('fs'),path=require('path');const root=path.resolve(__dirname,'..');
const src=fs.readFileSync(path.join(root,'JS/shared/question-profile.js'),'utf8');const block=src.slice(src.indexOf('// BEGIN SHARED QUESTION PROFILE'),src.indexOf('// END SHARED QUESTION PROFILE')+'// END SHARED QUESTION PROFILE'.length);
const targets=['JS/native-card-analysis.js','JS/tarot-foundation.js','JS/lenormand.js','JS/shared/question-planner.js'];
let changed=0;for(const t of targets){const p=path.join(root,t);let s=fs.readFileSync(p,'utf8');const a=s.indexOf('// BEGIN SHARED QUESTION PROFILE'),b=s.indexOf('// END SHARED QUESTION PROFILE');if(a<0||b<0)throw new Error('markers missing in '+t);const next=s.slice(0,a)+block+s.slice(b+'// END SHARED QUESTION PROFILE'.length);if(next!==s){fs.writeFileSync(p,next);changed++;}}
console.log('question profile embedded; files changed: '+changed);
