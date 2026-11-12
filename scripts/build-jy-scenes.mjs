import {build} from 'rolldown';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
// 打包四個立體場景成一個檔，並把內容雜湊寫進四個舞台程式（同一個網址，快取只存一份）。
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const out=path.join(root,'JS/jy-scenes.js');
await build({input:path.join(root,'JS/jy-scenes-src.mjs'),platform:'browser',output:{file:out,format:'iife',name:'JYScenesBundle',minify:true,comments:{legal:true},sourcemap:false}});
const hash=createHash('sha1').update(fs.readFileSync(out)).digest('hex').slice(0,12);
for(const f of ['tarot-stage.js','pillar-stage.js','wheel-stage.js','oracle-ambience.js']){const p=path.join(root,'JS',f);const s=fs.readFileSync(p,'utf8');const t=s.replace(/var SCENES_V='[^']*';/,"var SCENES_V='"+hash+"';");if(t===s&&!s.includes("var SCENES_V='"+hash+"';"))throw new Error('SCENES_V marker missing in '+f);fs.writeFileSync(p,t);}
console.log('Built JS/jy-scenes.js',fs.statSync(out).size,'bytes; hash',hash);
