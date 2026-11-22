import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
const [before,after,file] = process.argv.slice(2);
if (!before || !after || !file) throw new Error('node bundle.mjs BASELINE UPDATED TRANSCRIPTS.json');
const read = src => fs.readFileSync(src,'utf8');
const hash = value => createHash('sha256').update(value).digest('hex');
const get = (dir,method,ext) => read(path.join(dir,method+'.'+ext));
const parse = (dir,method,ext) => JSON.parse(get(dir,method,ext));
const root = path.dirname(new URL(import.meta.url).pathname);
const rubric = JSON.parse(read(path.join(root,'rubric.json')));
const methods = Object.keys(rubric.cases);
function emission(dir,method) {
  const prompt = get(dir,method,'prompt.txt'), text = get(dir,method,'reply.txt');
  const meta = parse(dir,method,'meta.json');
  return {promptSha256:hash(prompt),utf8Bytes:Buffer.byteLength(prompt),...meta,reply:text.trimEnd()};
}
const rows = methods.map(method=>{
  const current=parse(after,method,'case.json'), prior=parse(before,method,'case.json');
  if(JSON.stringify(current)!==JSON.stringify(prior)) throw new Error('unmatched '+method);
  const old=emission(before,method),updated=emission(after,method);
  for(const key of ['model','gguf','maxTokens','temperature','topP','topK','minP','seed']) {
    if(old[key]!==updated[key]) throw new Error('unmatched '+method+' '+key);
  }
  return {...current,checks:rubric.cases[method],before:old,after:updated};
});
fs.writeFileSync(file,JSON.stringify({baselineRevision:'8cbccec0e507966dd12dfd369ab02bb61be64836',scope:rubric.scope,dimensions:rubric.marks,runner:{name:'node-llama-cpp',version:'3.14.1',llamaCpp:'b6843',model:'Qwen3-1.7B Unsloth Q4_K_M',ggufSha256:'b139949c5bd74937ad8ed8c8cf3d9ffb1e99c866c823204dc42c0d91fa181897',device:'CPU, 3 threads per process, 512 batch, flash attention',input:'Complete single-paste text plus Qwen /no_think, no external system prompt',testType:'Paired one-seed local read-through, one synthetic situation per path'},cases:rows},null,2)+'\n');
console.log(rows.length+' complete matched pair(s)');
