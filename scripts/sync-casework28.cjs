/* Synchronize only explicitly generated regions and proven legacy mirrors. */
'use strict';
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const check=process.argv.includes('--check'),changed=[];
function write(p,s){if(read(p)===s)return;if(check)throw Error('Out of sync: '+p);fs.writeFileSync(path.join(root,p),s);changed.push(p);}
for(const name of fs.readdirSync(path.join(root,'JS')).filter(f=>f.endsWith('.js'))){
  const p='JS/'+name;let s=read(p);
  for(const [tag,source] of [['GENERATED WORKFLOW','JS/reading-workflow.js'],['GENERATED SINGLE PASTE RUNTIME','JS/prompt-single-paste.js'],['SHARED QUESTION PLANNER','JS/shared/question-planner.js']]){
    const begin='// BEGIN '+tag+'\n',end='// END '+tag;
    if(!s.includes(begin))continue;
    const i=s.indexOf(begin)+begin.length,closing=new RegExp('^'+end+'\\r?$','m').exec(s.slice(i));
    if(!closing)throw Error('Missing closing marker in '+p);
    const j=i+closing.index;
    // Embedded copies omit the CommonJS export line, exactly like scripts/sync-recommendation-guides.cjs,
    // so both checks agree on the same bytes.
    s=s.slice(0,i)+read(source).replace(/^  if\(typeof module[^\n]+\n/m,'').trimEnd()+'\n'+s.slice(j);
  }
  write(p,s);
}
const proofs=JSON.parse(read('docs/casework28-mirrors.json'));
for(const [source,proof]of Object.entries(proofs)){
  const target=path.join(root,proof.mirror),s=read(source);
  if(!fs.existsSync(target)){if(check)throw Error('Missing mirror: '+proof.mirror);fs.writeFileSync(target,s);changed.push(proof.mirror);}
  else write(proof.mirror,s);
}
console.log(check?'Generated regions and mirrors agree.':JSON.stringify({synchronized:changed}));
