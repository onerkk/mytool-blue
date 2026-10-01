import {build} from 'esbuild';
await build({entryPoints:['JS/name-scene-src.mjs'],outfile:'JS/name-scene.js',bundle:true,format:'iife',platform:'browser',target:['es2020'],minify:true,legalComments:'eof'});
console.log('Built the name atelier scroll, brush and inkstone scene.');
