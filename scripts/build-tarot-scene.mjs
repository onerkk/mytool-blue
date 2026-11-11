import {build} from 'rolldown';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
await build({input:path.join(root,'JS/tarot-scene-src.mjs'),platform:'browser',output:{file:path.join(root,'JS/tarot-scene.js'),format:'iife',name:'JYTarotSceneModule',minify:true,comments:{legal:true},sourcemap:false}});
console.log('Built the tarot 3D table scene.');
