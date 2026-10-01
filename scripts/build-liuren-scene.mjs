import {build} from 'esbuild';
await build({entryPoints:['JS/liuren-scene-src.mjs'],outfile:'JS/liuren-scene.js',bundle:true,format:'iife',platform:'browser',target:['es2020'],minify:true,legalComments:'eof'});
console.log('Built the interactive bronze and enamel liuren instrument.');
