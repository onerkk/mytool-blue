import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const [before,after,file,baselineRevision=null,updatedPromptRevision=null,runtime,weights] = process.argv.slice(2);
if (!before || !after || !file) throw new Error('node bundle.mjs BASELINE UPDATED TRANSCRIPTS.json [OLD_SHA NEW_SHA RUNTIME GGUF]');
if ([baselineRevision,updatedPromptRevision].some(v=>v!==null && !/^[0-9a-f]{40}$/.test(v))) throw new Error('Use the full git commit IDs for the supplied checkouts');
const read = src => fs.readFileSync(src,'utf8');
const hash = value => createHash('sha256').update(value).digest('hex');
const get = (dir,method,ext) => read(path.join(dir,method+'.'+ext));
const parse = (dir,method,ext) => JSON.parse(get(dir,method,ext));
const root = fileURLToPath(new URL('.',import.meta.url));
const rubric = JSON.parse(read(path.join(root,'rubric.json')));
const methods = Object.keys(rubric.cases);
function emission(dir,method) {
  const prompt = get(dir,method,'prompt.txt'), text = get(dir,method,'reply.txt');
  const meta = parse(dir,method,'meta.json');
  // The runner adds one newline when saving. Keep all whitespace emitted by the model.
  const reply = text.endsWith('\n') ? text.slice(0,-1) : text;
  const lines = reply.split(/\r?\n/).map(line=>line.trim()).filter(Boolean);
  const counts = new Map();
  for (const line of lines) if (Array.from(line).length>=12 && !/^[>`]/.test(line)) counts.set(line,(counts.get(line)||0)+1);
  const measures = {
    reachedTokenLimit:meta.stopReason==='maxTokens',
    repeatedLongLine:[...counts.values()].some(count=>count>=3),
    printedWritingLabel:lines.some(line=>/^(?:\*\*)?(?:稱呼|開場)[：:]/.test(line)),
    finalLinkAndWish:lines.at(-2)==='[靜月之光蝦皮賣場](https://shopee.tw/a50h95648d?tab=shop)' && lines.at(-1)==='願你諸事順遂。'
  };
  return {promptSha256:hash(prompt),utf8Bytes:Buffer.byteLength(prompt),...meta,replySha256:hash(reply),measures,reply};
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
const {model,gguf}=rows[0].before;
if(rows.some(row=>row.before.model!==model || row.before.gguf!==gguf))throw new Error('The batch contains different models');
let ggufSha256=null;
if(weights){
  if(path.basename(weights)!==gguf)throw new Error('The weights filename differs from the one recorded by inference');
  const digest=createHash('sha256');
  for await (const chunk of fs.createReadStream(weights))digest.update(chunk);
  ggufSha256=digest.digest('hex');
}
const pkg=runtime && path.resolve(runtime,'node_modules','node-llama-cpp');
const runner={name:'node-llama-cpp',version:pkg?JSON.parse(read(path.join(pkg,'package.json'))).version:null,
  llamaCpp:pkg?JSON.parse(read(path.join(pkg,'llama','llama.cpp.info.json'))).tag:null,model,gguf,ggufSha256,
  device:'CPU, 3 threads per process, 512 batch, flash attention',input:'Complete single-paste text plus Qwen /no_think, no external system prompt',
  testType:'Paired one-seed local read-through, one synthetic situation per path'};
fs.writeFileSync(file,JSON.stringify({baselineRevision,updatedPromptRevision,scope:rubric.scope,dimensions:rubric.marks,runner,cases:rows},null,2)+'\n');
console.log(rows.length+' complete matched pair(s)');
