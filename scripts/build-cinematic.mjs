import {build} from 'rolldown';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const project=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
await build({input:path.join(project,'JS/cinematic-src/entry.mjs'),platform:'browser',output:{file:path.join(project,'JS/cinematic-stage.js'),format:'iife',minify:true,comments:{legal:true},sourcemap:false}});
console.log('Built JS/cinematic-stage.js (Three.js bundled locally; no CDN runtime).');
