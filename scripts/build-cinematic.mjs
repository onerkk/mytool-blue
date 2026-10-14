import {build} from 'esbuild';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const project=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
await build({entryPoints:[path.join(project,'JS/cinematic-src/entry.mjs')],outfile:path.join(project,'JS/cinematic-stage.js'),bundle:true,platform:'browser',format:'iife',minify:true,legalComments:'inline',sourcemap:false});
console.log('Built JS/cinematic-stage.js (Three.js bundled locally; no CDN runtime).');
